# Modul 28 — OTA Update, Provisioning, Fleet, & Dari Breadboard ke Kotak

🌐 **Bahasa Indonesia** · [English](../../en/phase-5-operations-scale/module-28-ota-provisioning-fleet/README.md)

*Fase 5 · Minggu 28 · Perangkat keras: **Kit A** (2 ESP32, kotak proyek, papan ekspansi terminal sekrup; perfboard + solder opsional) + ESP32 ketiga pinjaman (opsional; atau perangkat tiruan) + **server dari Modul 27** (VPS dan Pi gerbang; jalur gratis: Pi saja; tanpa Pi: laptop) · Prasyarat: **Modul 27** (backend 1.4.0, frontend 1.3.0, `compose.cloud.yml` dan `edge/` di `main`), Modul 10 (partisi), Modul 21 (kunci perangkat), Modul 9 (catu daya) · Waktu: ±9 jam dicicil dalam satu minggu, ditambah 24 jam Node 1 menyala di kotak (jalur solder +60 menit; tanpa Kit ±6 jam) · Biaya: kotak proyek + papan ekspansi terminal sekrup (Silabus: ±Rp 25–40 rb, perkiraan; cek ulang harga Okt 2026); jalur solder: solder 60 W + timah (±Rp 60–120 rb, perkiraan); server dan domain tetap dari Modul 27*

[⬅️ Modul 27](../modul-27-deploy-internet-tls-pwa/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 29 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis)

---

[Modul 27 ditutup](../modul-27-deploy-internet-tls-pwa/README.md#-checklist-kelulusan-modul-27) dengan rumah yang daring 24 jam, terenkripsi, dan tahan putus internet, beserta dua batas yang jujur: firmware Node 1 masih diunggah lewat kabel USB, dan rangkaiannya masih di breadboard. Janjinya untuk minggu ini: Node 1 diperbarui lewat udara (OTA, *over-the-air*) dari server, kembali sendiri ke versi lama bila gagal (*rollback*), versinya tampil di halaman `/armada`, dan rangkaiannya pindah ke kotak proyek. Menurut [Silabus](../../SILABUS.md#-fase-5--operasi--skala-deploy-ota-cicd--capstone-modul-2632), Fase 5 membawa sistemmu menjadi "jalan di internet, 24/7, terenkripsi, bisa diperbarui, dan tidak kehilangan data". Modul 28 melunasi **bisa diperbarui**, sekaligus menyiapkan rumahmu untuk dipasang di banyak lokasi.

Banyak janji lama dilunasi minggu ini. [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#10-harga-wifi-program-membengkak-adc2-terkunci-arus-melonjak) memilih skema dua rak program karena rak kedua dipakai untuk pembaruan lewat udara di Modul 28. [Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#4-catu-daya-otak-dari-laptop-tenaga-dari-adaptor) berjanji alasan *restart* ikut dikirim ke server sebagai `reset_reason` supaya *brownout* yang diam-diam tetap ketahuan. [Modul 9](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md#a-node-1-permanen-dari-adaptor-lalu-uji-24-jam) memberi Node 1 catu daya permanen dan uji 24 jam; keduanya dipakai lagi untuk kotak. [Modul 14](../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md#-bedah-teknis-opsional) menunda soal OTA Node 2 dan penandatanganan program ke sini, dan [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang) menyimpan `status` ketiga, `offline-mode`, untuk Modul 28. [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#13-kunci-dan-sidik-jarinya-srcauthkuncits-5-menit) menyiapkan `cocokkanKunci` untuk unduhan firmware dan bertanya siapa yang boleh menyuruh backend membuat akun broker. [Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal) memperingatkan: kalau akar sertifikat berganti, ESP32 yang menanam akar butuh firmware baru lewat OTA. Peta pin yang "tidak berubah sampai Modul 28" pun tetap; hanya sambungannya yang pindah ke kotak.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Setiap firmware baru butuh kabel USB dan laptop. | Firmware 1.6.0 tidak bisa diperbarui dari server; rak kedua (Modul 10) belum terpakai. | **Pembaruan lewat udara**: server memerintah, Node 1 menarik sendiri firmware-nya ([Konsep 1](#1-mengapa-ota-wajib-perangkat-di-atap)–3, [Praktik 5](#praktik-5--node-1-170-lewat-kabel-untuk-terakhir-kalinya-25-menit-butuh-papan)–7) |
| Perintah `update` dijawab `aksi update belum didukung (Modul 28)`. | Kontrak menyebut `update` sejak Modul 11, firmware belum. | **Kontrak 1.6 dan firmware 1.7.0** ([Konsep 3](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji), [Praktik 2](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit), Praktik 5) |
| Firmware yang salah (misalnya kunci broker keliru) membuat Node 1 tak berguna sampai kabel USB dicolokkan lagi. | Tanpa masa uji, program baru langsung dianggap sah. | **Masa uji 60 detik**: firmware yang gagal tersambung ke broker kembali sendiri ke versi lama ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c), [Praktik 8](#praktik-8--firmware-yang-sengaja-salah-kembali-sendiri-ke-versi-lama-25-menit)) |
| Kesehatan perangkat tak terlihat dari jauh. | `vitals` belum memuat `reset_reason` dan versi; belum ada layar armada. | **`vitals` 1.6 dan layar Armada** ([Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason), [Praktik 4](#praktik-4--dashboard-140-dan-layar-armada-dengan-perangkat-tiruan-25-menit), 13) |
| Perangkat baru butuh langkah tangan, termasuk `mosquitto_passwd` di mesin broker. | Akun broker perangkat dibuat dengan tangan sejak Modul 21. | **Kode klaim dan akun broker otomatis** ([Konsep 8](#8-perangkat-baru-dalam-1-menit-identitas-kode-klaim-dan-akun-broker-otomatis), [Praktik 3](#praktik-3--akun-broker-otomatis-di-gerbang-pindah-akun-modul-21-dan-cadangan-akun-35-menit), 10) |
| Perangkat yang kuncinya dicabut tetap tersambung ke broker. | Mencabut kunci (Modul 21) hanya membuat backend mengabaikannya; akun broker dihapus dengan tangan. | **Nonaktifkan**: kunci dicabut, akun broker dihapus, sambungan diputus seketika ([Konsep 10](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika), [Praktik 11](#praktik-11--jeda-vitals-dari-jauh-dan-menonaktifkan-perangkat-hilang-20-menit)) |
| Breadboard tidak layak dipasang: kabel tercabut, pegas kendor, debu. | Rangkaian masih untuk percobaan di meja. | **Kotak proyek** dengan papan ekspansi terminal sekrup dan catu daya Modul 9 ([Konsep 11](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v), [Praktik 12](#praktik-12--dari-breadboard-ke-kotak-90-menit-butuh-papan-jalur-solder-ditambah-60-menit)–13) |

Syarat lulus dari [Silabus](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak): "Node 1 ter-update ke versi baru tanpa kabel dan versinya tampil di `/armada`, firmware yang sengaja salah otomatis kembali ke versi lama, dan Node 1 terpasang rapi di kotak dengan catu daya sendiri." Modul ini memecahnya menjadi satu prasyarat, tiga bukti, dan satu praktik wajib:

- **O0** (prasyarat, bukan bagian ✅): Node 1 menjalankan 1.7.0 yang dipasang lewat kabel **sekali**, dan kartunya di **Armada** menunjukkan `1.7.0` beserta `reset_reason`. Prasyarat ini ada karena 1.6.0 menolak perintah `update`.
- **O1** tanpa kabel: kabel USB Node 1 tidak tersambung ke laptop (Node 1 hidup dari *charger*-nya). Kamu menekan **Perbarui** pada Node 1 yang ditandai *canary* (perangkat percobaan pertama); kartunya sempat `berhenti sengaja`, lalu `Online` dengan riwayat `berhasil` 1.7.0 → 1.7.1, versi `1.7.1`, dan `reset_reason` `SW`.
- **O2** *rollback*: rilis uji 1.7.2, yang kuncinya sengaja dirusak, ditolak broker, dan sesudah masa uji 60 detik, Node 1 kembali sendiri ke 1.7.1 tanpa disentuh: `kembali ke versi lama (rollback)`, versi tetap `1.7.1`, `Online` lagi. "Versi lama" berarti versi sebelum pembaruan itu, bukan 1.6.0.
- **K1** kotak: (a) foto sebelum dan sesudah dari sudut yang sama; (b) semua kabel lolos uji tarik pelan; (c) label `device_id`, nama, fungsi dan polaritas kabel daya, serta sandi portal; (d) catu daya sendiri dengan susunan Modul 9, tanpa laptop dan tanpa 220 V di dalam kotak; (e) lama menyala di kotak ≥ 24 jam, dengan `reset_reason` bukan `BROWNOUT`, `PANIC`, atau `WDT`, karena catu daya buruk sering baru ketahuan sesudah berjam-jam.
- **P1** perangkat baru dalam 1 menit (praktik wajib, bukan bagian ✅): papan ketiga yang kosong diisi lewat portal (WiFi, kode klaim, alamat server, alamat broker; perangkat tiruan: perintah `klaim`), lalu `Online` di **Armada** paling lama 60 detik sejak **Save**.

Bunyi setiap jalur ada di tabel **Pilih jalurmu**. Silabus (v1.0.30) mencatat pecahan ini dan bunyi setiap jalur di baris ✅; kalimat ✅-nya tetap.

Untuk Rumah Pintar Mini, firmware Node 1 naik ke **1.7.0**, versi pertama yang bisa diperbarui lewat udara. Ia masuk lewat kabel untuk terakhir kalinya, lalu kamu membangun **1.7.1** (lewat udara) dan rilis uji **1.7.2** (*rollback*). Silabus dulu menulis "build firmware v1.1" (kini diamandemen, A-2); nomor itu sudah lama terlewati, jadi versi berikutnya di sini 1.7.1. Node 2 tetap **1.0.0**. Backend naik ke **1.5.0** dengan migrasi **011** dan dashboard ke **1.4.0** (layar **Armada**), keduanya tanpa paket npm baru; kontrak data ke **1.6**; `PETA-PIN.md` ke versi **7** (pinnya tetap); `edge/` mendapat *dynamic security*. Image pihak ketiga tetap (plugin *dynamic security* sudah ada di Mosquitto 2.1.2); paket papan yang dipakai: Arduino-ESP32 **3.3.12**. Modul 28 bukan Checkpoint: kuisnya ikut [tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase).

> [!IMPORTANT]
> **Urutan wajib:** cadangan ([Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-cadangan-dan-catatan-akun-10-menit)) → backend 1.5.0, migrasi 011, dan broker pusat (Praktik 2) → gerbang ([3.1](#31--gerbang-naik-sandi-plugin-di-edgeenv-dua-baris-remap-jembatan-lalu-restart-broker-10-menit)) → pindah akun lama ([3.4](#34--pindah-akun-lama-modul-21-ganti-kunci-kunci-baru-di-serial-mosquitto_passwd--d-lalu-restart-10-menit)) → layar **Armada** (Praktik 4) → firmware 1.7.0 lewat kabel (Praktik 5) → pembaruan lewat udara ([Praktik 6](#praktik-6--membangun-171-dan-mengunggahnya-ke-server-15-menit)–8) → kode klaim (Praktik 10) → kotak (Praktik 12). Sebabnya: backend lama menolak `vitals` firmware 1.7.0, perangkat baru yang didaftarkan sebelum gerbang naik dijawab `503`, dan kotak menutup colokan USB.

**Pilih jalurmu:**

| Jalur | Server yang menyajikan firmware dan **Armada** | Node 1 masuk ke | Bukti | Praktik | Waktu |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Utama** | VPS, `https://iot.namaanda.my.id` | gerbang Pi; akun dibuat lewat jembatan (`gerbang:pi1`) | O0–O2, K1, P1 | 1–13 | ±9 jam |
| **Gratis** | Pi, `http://192.168.1.37` lewat pintu perangkat 8081; dashboard tetap lewat terowongan | gerbang 1883, pusat 1884 di Pi yang sama | sama | 1–13 | ±9 jam |
| **Tanpa Pi** | laptop, `http://192.168.1.10` seperti mode HP; laptop tidak boleh tidur selama pembaruan | broker laptop (`AKUN_BROKER_OTOMATIS=pusat`) | sama; unduhan `http://` baru diuji penulis dengan simulator di satu mesin, bukan WiFi rumah | 1–13 tanpa langkah gerbang | ±8,5 jam |
| **Tanpa Kit** | sesuai jalurmu | broker jalurmu (perangkat tiruan dari simulator `alat/`) | O0, O1, O2, P1 tiruan; K1 = rencana kotak: **belum lulus penuh** | 1–4, 6–11 dengan simulator | ±6 jam |
| **Wokwi** | server ber-domain (jalur utama) | broker publik, jadi tidak `Online` di **Armada** | klaim lewat Serial Monitor karena portal tidak bisa dibuka di Wokwi ([Silabus §5.4](../../SILABUS.md#54-belajar-tanpa-hardware-apa-yang-bisa-dan-tidak-bisa-di-wokwi)); OTA dan *rollback* di Wokwi belum diuji penulis: **belum lulus penuh** | seperti tanpa Kit | ±6 jam |

Jalur tanpa Kit dan Wokwi menyelesaikan O0–O2 dan K1 begitu papan datang: pasang 1.7.0 lewat kabel (Praktik 5), daftarkan papannya lewat kode klaim (Praktik 10) bila belum terdaftar, lalu ulangi Praktik 6–8 dengan nomor versi baru mulai 1.7.3, karena nomor yang sudah dipakai berkas tiruan ditolak `409`.

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Tanda.** ⭐ = wajib untuk lulus. Praktik "butuh papan" (5, 12, 13) dan bagian papan di Praktik 7, 8, dan 10 khusus jalur ber-Kit. Kotak 🔀 (**Jalur gratis:**, **Tanpa Pi:**, **Tanpa Kit:**, **Wokwi:**) menjelaskan beda jalur lain.
> - **Praktik 1–4 tidak mengubah firmware papan:** Node 1 tetap menjalankan 1.6.0, dan kabel USB-nya hanya dipakai di 3.4 untuk mengetik kunci baru di Serial Monitor.
> - **Tabel bukti:**
>
>   | Syarat | Praktik | Yang kamu lihat |
>   | :-: | :-- | :-- |
>   | O0 | [5.4](#54--o0-serial-ota-dan-server-lalu-kartu-node-1-versi-170-dengan-reset_reason-5-menit) | kartu Node 1 versi `1.7.0` dengan `reset_reason` |
>   | O1 | [7.5](#75--o1-versi-171-reset_reason-sw-dan-riwayat-berhasil-tanpa-kabel-5-menit) | kabel USB tidak di laptop; riwayat `berhasil` 1.7.0 → 1.7.1, `reset_reason` `SW` |
>   | O2 | [8.3](#83--o2-node-1-kembali-sendiri-ke-171-sesudah-masa-uji-60-detik-10-menit) | `kembali ke versi lama (rollback)`, versi tetap `1.7.1` |
>   | K1 | [12.9](#129--k1-ad-label-tutup-kotak-lalu-node-1-online-lagi-5-menit) (foto: 13.1) dan [13.2](#132--k1-e-24-jam-menyala-tanpa-brownout-panic-atau-wdt-5-menit) | foto, uji tarik, label, catu daya Modul 9, 24 jam tanpa `BROWNOUT`, `PANIC`, atau `WDT` |
>   | P1 | [10.4](#104--p1-kartu-baru-online-di-armada-dalam-60-detik-sejak-save-6-menit) | kartu baru `Online` paling lama 60 detik sejak **Save** |
>
> - **Kotak 🖥️ di awal praktik menyebut mesin, alat, dan foldernya**: **Arduino IDE** dan Serial Monitor (kabel USB ke papan); **VS Code** (terminal di akar proyek `rumah-pintar-mini`, `backend`, `frontend`, atau `alat`); **terminal SSH ke VPS** (`ssh rumah@203.0.113.10`) dan **ke Pi** (folder `rumah-pintar-mini/edge`; jalur gratis juga akar proyek); **Chrome**, **HP**, **Bruno**, **Telegram**, **Grafana**, **MQTTX** (opsional); serta **multimeter**, **obeng**, dan **penggaris**.
> - **Kotak Hasilnya** direkam di **Raspberry Pi 5 dengan Ubuntu 26.04 (arm64)**: Docker Engine 29.1.3, Compose 2.40.3, Chrome 156 tanpa layar, dan Node 24.21.0. Satu mesin itu memerankan laptop, Pi, VPS, internet, dan perangkat. Label kotaknya menyebut asal keluaran, misalnya **Hasilnya (lab penulis, simulator):**; asal lain: CA tiruan, uji host, dan kompilasi `arduino-cli`. Keluaran papan yang belum pernah direkam ditulis sebagai **teks dari kode**.
>
>   | Dunia nyatamu | Tiruan di lab penulis |
>   | :-- | :-- |
>   | Node 1 dan papan ketiga | simulator `alat/` (meniru rancangan 1.7.0, tidak mem-*flash* apa pun) |
>   | `node-1-rumah.ino.bin` 1.7.1 | berkas 1.7.1 asli hasil kompilasi penulis: diunggah ke server, lalu diunduh dan diperiksa SHA-256-nya oleh simulator; tidak dijalankan |
>   | rilis uji 1.7.2 | berkas tiruan (bukan firmware) bertanda `UJI_KUNCI_SALAH` dari `alat/buat-bin-tiruan.js` |
>   | portal di HP | ilustrasi dari HTML asli WiFiManager 2.0.17 |
>   | VPS `203.0.113.10`, Pi gerbang | kontainer di lorong Docker yang menjadi "internet" |
>   | Let's Encrypt, Telegram, internet dicabut | CA tiruan, server Bot API tiruan, `docker network disconnect` |
>   | banyak perangkat | 22 perangkat tiruan dari simulator |
>
>   Angka waktu di kotak Hasilnya adalah angka simulator di satu mesin, bukan ESP32 lewat WiFi; jam ditulis WIB. Nama dan IP lab diganti contoh milikmu (`iot.namaanda.my.id`). Rincian: [🔬](#-bedah-teknis-opsional), [📚](#-sumber--atribusi-gambar).
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan aplikasi. **Kecuali di terminal:** menghentikan program tetap **Ctrl + C**.

> [!IMPORTANT]
> **Status jujur: firmware 1.7.0 dikompilasi penulis, belum dijalankan di papan.** Pada 2 November 2026 penulis mengompilasi 1.7.0, 1.7.1, dan 1.7.2-uji dengan `arduino-cli` 1.5.1 (bukan Arduino IDE), paket esp32 3.3.12, dan library versi persis, dengan setelan Node 1 sejak Modul 10 (**ESP32 Dev Module**, **Minimal SPIFFS**, **Flash Mode DIO**).
>
> | Bagian | Diuji penulis di lab (kode sungguhan) | Ditiru (simulator, berkas tiruan, internet tiruan) | Hanya dari dokumen / belum |
> | :-- | :-- | :-- | :-- |
> | Server | backend 1.5.0 (203 tes), migrasi 011 dengan riwayat berisi, unggah, `/fw` berkunci lewat Caddy, *canary*, **Perbarui semua**, rilis uji, klaim, **Nonaktifkan**, *dynamic security* pusat dan gerbang (jembatan TLS), pindah akun Modul 21, cadangan akun broker, layar **Armada**, Telegram, Grafana | "VPS", "Pi", domain, Let's Encrypt (CA tiruan), Telegram (server tiruan) | VPS, domain, Let's Encrypt, Cloudflare, dan Telegram sungguhan (seperti Modul 27) |
> | Perangkat | — | OTA berhasil, *rollback*, gagal, kedaluwarsa, klaim, 22 perangkat sekaligus: simulator | Node 1 sungguhan lewat WiFi |
> | Firmware 1.7.0 | logika masa uji, *rollback*, laporan, dan ukuran pesan (uji host: g++ dan pembuka rak tiruan); kompilasi: 0 galat, 0 peringatan dari berkas sketsa, sekitar 1,41 juta byte (71 % rak), satu `T verifyRollbackLater` = *rollback* aktif (tanpa `extern "C"` menjadi `W`: mati diam-diam; Konsep 4); sketsa Kemenangan Cepat dan kunci 🧩 Tingkat 1 juga dikompilasi | — | OTA lewat WiFi, *rollback* dan *watchdog* nyata, portal di HP, klaim di papan, `reset_reason` sungguhan, Serial Monitor papan |
> | Perangkat keras | — | — | papan ekspansi, kotak, solder, multimeter, 24 jam di kotak: dari sumber, diagram rekonstruksi, foto berlisensi |
> | Wokwi, QEMU | — | — | tidak dijalankan penulis |
>
> Kamulah penguji pertamanya di papan: centang [✅](#-checklist-kelulusan-modul-28) hanya yang benar-benar terjadi.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Tidak ada listrik 220 V di dalam kotak.** Catu daya tetap susunan Modul 9 dengan adaptor di stopkontak di luar kotak, dan relay hanya untuk beban 5 V. Aturan emas catu daya: beban (relay, pompa, servo) dicatu adaptor 5 V lewat MB102, bukan dari pin ESP32, dengan GND bersama (Konsep 11, [12.6](#126--catu-daya-modul-9-di-kotak-dua-kabel-berlabel-dan-gnd-bersama-10-menit)).
> 2. **Berkas `.bin`, kode klaim, `MOSQUITTO_DYNSEC_PASSWORD`, dan isi lemari broker adalah rahasia:** jangan masuk Git, forum, AI, atau tautan publik. Berkas `.bin` Node 1 memuat kunci ESP-NOW, sandi portal, dan jalur folder di komputermu. Jangan `docker compose down -v`: akun perangkat dan berkas firmware ikut hilang (Konsep 6, [3.5](#35--cadangan-akun-broker-dengan-skripcadangkan-akun-brokersh-3-menit), ➕ E).
> 3. **`update` tidak pernah *retained*.** Di MQTTX, **Retain** tetap mati: perintah *retained* membuat pembaruan berulang setiap kali papan menyala (Konsep 3).
> 4. **Backend 1.5.0 dan migrasi 011 dulu, baru firmware 1.7.0**, dan jangan mendaftarkan perangkat baru sebelum gerbang naik (2.4, Praktik 3).
> 5. **Unggah `node-1-rumah.ino.bin`**, bukan `.merged.bin` atau `.bootloader.bin` ([6.3](#63--pilih-node-1-rumahinobin-bukan-mergedbin-lalu-hitung-sha-256-nya-3-menit)).
> 6. **Jangan mencabut listrik Node 1, Pi, atau router di 60 detik pertama sesudah pembaruan.** Firmware baru batal dan Node 1 kembali ke versi lama: aman, tetapi pembaruanmu hilang (Konsep 4).
> 7. **`UJI_KUNCI_SALAH` kembali `0`** sesudah latihan *rollback*, sebelum *commit* ([8.2](#82--segera-kembalikan-uji_kunci_salah-ke-0-dan-versi-ke-171-3-menit)).
> 8. **Solder: kacamata, ventilasi, dan cuci tangan**; cabut semua daya sebelum memindah kabel (12.2, [12.5](#125-rangkaian-kecil-di-breadboard-mini-berperekat-10-menit)).

Seperti Modul 16–27, modul ini diawali [🔁 Pemanasan ulang versi, rak program, dan alasan *restart*](#-pemanasan-ulang-versi-rak-program-dan-alasan-restart-30-menit). Hari pertama cukup pemanasan, [🏆 Kemenangan Cepat](#-kemenangan-cepat-dua-rak-di-papanmu-15-menit), Konsep 1 sampai [Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https), lalu Praktik 1 dan 2; Node 1 tetap menjalankan 1.6.0 sampai Praktik 5. Sebelas konsep dibaca berselang-seling dengan praktiknya; urutannya ada di awal [🧠](#-konsep-mengapa). Bagian lipat di [🚨](#-kalau-tidak-jalan) dibuka saat perlu; bagian lipat di [🔬](#-bedah-teknis-opsional) boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang versi, rak program, dan alasan *restart* (30 menit)](#-pemanasan-ulang-versi-rak-program-dan-alasan-restart-30-menit)
4. [🏆 Kemenangan Cepat: dua rak di papanmu (15 menit)](#-kemenangan-cepat-dua-rak-di-papanmu-15-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Mengapa OTA wajib](#1-mengapa-ota-wajib-perangkat-di-atap) · [2 Dua rak dan catatan rak](#2-dua-rak-dan-secarik-catatan-app0-app1-otadata-dan-pembuka-rak) · [3 HTTP OTA](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji) · [4 *Rollback* yang bekerja](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c) · [5 Versi dan SemVer](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest) · [6 Siapa boleh memberi firmware](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https) · [7 Armada dan *canary*](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota) · [8 Perangkat baru dalam 1 menit](#8-perangkat-baru-dalam-1-menit-identitas-kode-klaim-dan-akun-broker-otomatis) · [9 Jeda `vitals` dan kesehatan](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason) · [10 Menonaktifkan perangkat](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika) · [11 Dari breadboard ke kotak](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Meja kerja](#praktik-1--meja-kerja-cabang-sidik-jari-cadangan-dan-catatan-akun-10-menit) · [2 Kontrak, backend, broker pusat](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit) · [3 Akun broker otomatis](#praktik-3--akun-broker-otomatis-di-gerbang-pindah-akun-modul-21-dan-cadangan-akun-35-menit) · [4 Layar Armada](#praktik-4--dashboard-140-dan-layar-armada-dengan-perangkat-tiruan-25-menit) · [5 Firmware 1.7.0 lewat kabel](#praktik-5--node-1-170-lewat-kabel-untuk-terakhir-kalinya-25-menit-butuh-papan) · [6 Unggah 1.7.1](#praktik-6--membangun-171-dan-mengunggahnya-ke-server-15-menit) · [7 Tanpa kabel, *canary* dulu](#praktik-7--pembaruan-pertama-tanpa-kabel-canary-dulu-20-menit) · [8 *Rollback*](#praktik-8--firmware-yang-sengaja-salah-kembali-sendiri-ke-versi-lama-25-menit) · [9 "Perbarui semua" (opsional)](#praktik-9--opsional-armada-perbarui-semua-perangkat-terputus-dan-kedaluwarsa-15-menit) · [10 Kode klaim](#praktik-10--perangkat-baru-dalam-1-menit-kode-klaim-dan-portal-30-menit) · [11 Jeda `vitals` dan Nonaktifkan](#praktik-11--jeda-vitals-dari-jauh-dan-menonaktifkan-perangkat-hilang-20-menit) · [12 Dari breadboard ke kotak](#praktik-12--dari-breadboard-ke-kotak-90-menit-butuh-papan-jalur-solder-ditambah-60-menit) · [13 24 jam di kotak](#praktik-13--24-jam-di-kotak-dan-foto-sesudah-10-menit-ditambah-24-jam-menunggu-butuh-papan)
   - Butuh papan: Praktik 5, 12, dan 13 · Tanpa Kit: Praktik 1–4 dan 6–11 dengan perangkat tiruan
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-28)

## 🎯 Setelah modul ini kamu bisa…

1. **Memperbarui firmware Node 1 tanpa kabel** dari tombol **Perbarui** di layar **Armada**: server memerintah lewat MQTT, lalu Node 1 menarik sendiri firmware barunya dari server rumahnya (HTTP OTA), seketika.
2. **Menjelaskan dua rak program** (`app0`, `app1`), catatan rak `otadata`, dan pembuka rak (*bootloader*), serta kenapa unggahan lewat kabel selalu kembali ke `app0`.
3. **Membuat firmware baru membuktikan diri dalam 60 detik** dan kembali sendiri ke versi lama bila gagal (`extern "C" bool verifyRollbackLater()`), serta tahu batasnya: yang dijaga hanya "masih bisa tersambung dan terbit".
4. **Menyajikan firmware hanya lewat rute berkunci**, dengan sidik jari SHA-256 dan HTTPS di internet, serta tahu kenapa berkas `.bin` tidak boleh publik atau masuk Git.
5. **Memperbarui satu atau banyak perangkat tanpa menyentuhnya** dengan SemVer, rilis uji, *canary* (satu perangkat dulu), dan **Perbarui semua** yang terkunci sampai *canary* berhasil.
6. **Mendaftarkan perangkat baru dalam ±1 menit** lewat portal dan kode klaim; akun brokernya dibuat backend sendiri (*dynamic security*), juga di gerbang Pi.
7. **Tahu kesehatan setiap perangkat** di layar **Armada** (`reset_reason`, sinyal, RAM, lama menyala) dan mengubah jeda `vitals` dari jauh.
8. **Menonaktifkan perangkat yang hilang** sehingga broker langsung memutusnya, dan tahu kabar Grafana yang menyesatkan.
9. **Memindahkan Node 1 dari breadboard ke kotak yang layak dipasang**: papan ekspansi terminal sekrup, label, dan catu daya Modul 9, tanpa 220 V.
10. **Menyebut dengan jujur yang belum terbukti**: Node 2 tetap diperbarui lewat kabel, jalur tanpa Kit dan Wokwi belum lulus penuh, dan firmware 1.7.0 belum dijalankan penulis di papan; papanmu yang membuktikannya.

## 🧰 Yang perlu disiapkan

Kolom **Kit** = jalur ber-Kit (utama, gratis, tanpa Pi); **Tanpa Kit** juga untuk Wokwi. Silabus v1.0.30 mencatat perangkat keras dan versi alat utamanya di Modul 28.

| Yang disiapkan | Kit | Tanpa Kit | Keterangan |
| :--- | :-: | :-: | :--- |
| **Hasil Modul 27** di `main` | ✓ | ✓ | Backend 1.4.0, frontend 1.3.0, `compose.cloud.yml`, dan `edge/` yang menyala di jalurmu (VPS + jembatan TLS, Pi saja, atau laptop); dicek di [🔁 Langkah 1](#langkah-1--inventaris-rumah-modul-27-versi-node-1-device_id-dan-sidik-jari-riwayat). |
| **Node 1 1.6.0** di breadboard dengan catu daya Modul 9 | ✓ | tiruan | *Charger* HP 5 V ≥ 1 A ke USB papan, adaptor 5 V 2 A ke MB102; beban tetap dari MB102, bukan dari pin ESP32, dengan GND bersama. Kabel USB untuk 🔁, 🏆, 3.4, dan Praktik 5. Tanpa Kit: simulator `alat/` ([4.2](#42--perangkat-tiruan-170-dari-simulator-alat-6-menit)). |
| **Kotak proyek plastik** | ✓ | rencana | Muat papan ekspansi + DevKit, breadboard mini, relay, dan MB102, dengan ruang untuk lubang sensor dan ventilasi; bukan kotak logam atau kedap air ([Konsep 11](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v)). |
| **Papan ekspansi terminal sekrup** untuk DevKit V1 30 pin | ✓ | rencana | Tiap pin punya sekrup penjepit kabel. Ukur jarak dua deret kaki DevKit-mu dengan penggaris dan cocokkan dengan ukuran dari penjual; papan untuk 38 pin tidak cocok ([12.1](#121--cocokkan-papan-ekspansi-dengan-devkit-mu-ukur-jarak-dua-baris-pin-5-menit)). Perkiraan [Silabus](../../SILABUS.md#52-kit-a--esp32--elektronika-dasar) kotak + papan: ±Rp 25–40 rb; harga 30 Okt 2026 bisa lebih tinggi, cek ulang. |
| Dua breadboard mini berperekat, kabel tunggal 22 AWG beberapa warna, pengikat kabel, spidol, label; obeng kecil, pengupas kabel, multimeter, penggaris | ✓ | — | Rangkaian kecil di kotak, penahan tarikan (*strain relief*), label tutup. *Ferrule* (selongsong logam ujung kabel serabut): opsional. |
| **ESP32 ketiga** pinjaman + kabel USB, dan **HP** | opsional | tiruan | Papan kosong untuk [Praktik 10](#praktik-10--perangkat-baru-dalam-1-menit-kode-klaim-dan-portal-30-menit), HP untuk portalnya. Tanpa papan ketiga: simulator; Wokwi: klaim lewat Serial Monitor. |
| **Bruno**, **MQTTX** 1.13.1, **GitHub** | ✓ | ✓ | Sudah ada: Bruno sejak Modul 16, MQTTX (opsional) sejak Modul 11. Cabang `fitur/armada` dibuat di [1.1](#11-cabang-fiturarmada-dari-main-yang-terbaru-2-menit). |

<details>
<summary><b>Jalur solder (opsional): barang tambahan</b></summary>

Solder 60 W dengan pengatur suhu, timah 0,8 mm, perfboard (papan berlubang untuk disolder), kacamata, dan ruang berventilasi; perkiraan Silabus ±Rp 60–120 rb, cek ulang. Langkahnya di lipatan **Jalur solder** [12.5](#125-rangkaian-kecil-di-breadboard-mini-berperekat-10-menit).

</details>

Versi yang dipakai (alat Arduino: terbaru per 2 November 2026, kecuali GFX; penulis mengompilasi dengan versi persis ini memakai `arduino-cli` 1.5.1, bukan Arduino IDE):

| Komponen | Versi | Catatan |
| :--- | :--- | :--- |
| Arduino IDE, paket papan **esp32** | 2.3.10, 3.3.12 | paket: bukan 3.3.11 ke bawah (`setSHA256sum()` dan `useBuiltinCACertBundle()` baru ada di 3.3.12), bukan 4.0.0-RC1; Update, HTTPUpdate, NetworkClientSecure, dan Preferences ikut paket |
| Setelan Node 1 | **ESP32 Dev Module**, **Partition Scheme** Minimal SPIFFS, **Flash Mode** DIO | sejak Modul 10 |
| Library Node 1 ([5.1](#51--paket-esp32-3312-skema-minimal-spiffs-dan-firmware-170-dengan-masa-ujicpp-8-menit)) | WiFiManager 2.0.17, ArduinoJson 7.4.3, PubSubClient3 3.3.2, ESP32Servo 3.2.1, DHT sensor library 1.4.7, Adafruit SSD1306 2.5.17, ModbusMaster 2.0.1 | tidak ada library baru |
| Pendukung yang ikut terpasang | Adafruit Unified Sensor 1.1.15, Adafruit GFX Library 1.12.6, Adafruit BusIO 1.17.4 | GFX 1.13.0 belum diuji penulis: notifikasi `Updates are available for some of your libraries.` → klik **Later** |
| Image | `eclipse-mosquitto:2.1.2-alpine` (sudah berisi plugin *dynamic security*), `caddy:2.11.7-alpine`, lainnya | sama dengan Modul 27; versinya dikunci |

**Berkas yang berubah minggu ini** (cocokkan dengan `kode/` di [➕ A](#a-cocokkan-proyekmu-akar-edge-skrip-backend-150-frontend-140-dan-firmware)):

| Tempat | Berkas |
| :--- | :--- |
| Akar proyek | `compose.cloud.yml`, `.env.example` (`MOSQUITTO_DYNSEC_PASSWORD`, blok "Armada"), `.gitignore` (+ `*.bin`, `firmware/**/build/`, `data-firmware/`), README, `KONTRAK-DATA.md` 1.6, `PETA-PIN.md` 7, templat *pull request*; baru: `skrip/cadangkan-akun-broker.sh` |
| `edge/` | `pusat.conf`, `pusat-internet.conf`, `gerbang.conf` (plugin), `jembatan.contoh.conf` (*remap*), `acl-broker`, `compose.edge.yml`, `.env.example`, README |
| `backend/` 1.5.0 | migrasi `011_ota_dan_armada.sql`, rute dan layanan baru (firmware, armada, klaim, akun broker), kontrak 1.6, 11 permintaan Bruno, README |
| `frontend/` 1.4.0 | layar **Armada** (halaman + 8 komponen), `caddy/Caddyfile` (`/fw/*`, pintu `:8081`), kontrak 1.6, README |
| `firmware/` Node 1 1.7.0 | baru: `versi`, `periksa-ota`, `pembaruan`, `masa-uji`, `klaim` (`.h` + `.cpp`); 12 berkas diubah; README baru |
| `alat/`, `grafana/` | simulator, pemeriksa kontrak 1.6, `.env.example`, `buat-bin-tiruan.js` + tes (baru); README |
| Tetap | Node 2 1.0.0, migrasi `001…010`, isi pin, *provisioning* Grafana, image pihak ketiga |
| Di luar proyek | bahan latihan `kemenangan-cepat/rak-program/` dan kunci 🧩 `tantangan/kunci/` |

**Waktunya** ±9 jam (tanpa Pi ±8,5 jam), ditambah 24 jam Node 1 menyala di kotak: pemanasan 30 menit, Kemenangan Cepat 15, konsep ±90, praktik wajib 335 (Praktik 9 +15, jalur solder +60), ➕ 30, kuis dan checklist 20. Tanpa Kit dan Wokwi ±6 jam.

## 🔁 Pemanasan ulang versi, rak program, dan alasan *restart* (30 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** (Serial Monitor) dan **VS Code** di laptop, terminal **mesin pusat** (VPS; jalur gratis: Pi; tanpa Pi: laptop) dan **Pi** (folder `rumah-pintar-mini/edge`), **Chrome**, dan kamera HP.

Lima bekal, semuanya hanya membaca: Node 1 tetap 1.6.0 dan server tetap Modul 27; Node 1 hanya menyala ulang saat kabelnya dipindah dan di Langkah 4. Catat hasilnya di `belajar-iot/modul-28/pemanasan.md`, tanpa sandi atau kunci.

> 🔀 **Tanpa Kit** (juga Wokwi): Langkah 1 tanpa Serial Monitor, Langkah 2–3 sama, Langkah 4–5 menunggu papan.

### Langkah 1 — Inventaris rumah Modul 27: versi Node 1, `device_id`, dan sidik jari riwayat

Pindahkan kabel USB Node 1 dari *charger* ke laptop dengan urutan aturan emas catu daya Modul 9: MB102 mati dulu, pindahkan kabelnya, lalu nyalakan MB102 (modul microSD beregulator: tekan **EN**). Beban tetap dicatu MB102, bukan dari pin ESP32, dengan GND bersama. Buka Serial Monitor, ketik di kolom kirimnya, lalu Enter:

```text
info
```

Baris pertamanya (semua teks Serial di sini dari kode, belum direkam penulis di papan): `info: firmware 1.6.0, menyala HH:MM:SS, restart terakhir <alasan>, nyala ke-N` (`menyala` = lama menyala). Di dashboard (menu **Perangkat**), catat `device_id` di setiap kartu, Node 2 juga.

Di terminal mesin pusat (akar proyek), jalankan `docker compose ps -a`. Rumah yang sehat: `backend`, `db`, dan `grafana` `Up … (healthy)`; `mosquitto`, `web`, `cloudflared` (jalur gratis) `Up`; layanan sekali jalan (`akun-broker`, `akun-grafana`, `migrasi`, `sertifikat-mqtt`) `Exited (0)`. Lalu ambil sidik jari riwayat dengan skrip Modul 26 (bash):

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

PowerShell (tidak diuji penulis): `Get-Content skrip/sidik-jari.sql | docker compose exec -T db psql -U postgres -d rumahpintar`.

**Hasilnya (lab penulis, "VPS" tiruan; angkamu berbeda):**

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2211 | e09d5aec385a0edc06835413ee048367 |       369 |     9 |     3 |    2 |         3
(1 row)
```

Angkanya bergerak selama data masuk. Punya gerbang Pi? Jalankan `docker compose ps -a` di folder `edge`: `rumahpintar-gerbang-mosquitto-1` `Up`. **Nanti di [1.2](#12--sidik-jari-riwayat-di-mesin-pusat-dengan-skripsidik-jarisql-3-menit) dan [1.4](#14--catat-setiap-perangkat-device_id-versi-broker-dan-akun-lamanya-2-menit):** sidik jari menjadi pembanding sebelum server diperbarui; versi dan `device_id` masuk catatan per perangkat.

### Langkah 2 — Rak program sejak Modul 10: skema Minimal SPIFFS dan dua rak 1.966.080 byte

Di Arduino IDE, buka `node-1-rumah.ino`, lalu menu **Tools**: papannya **ESP32 Dev Module**, dengan `Partition Scheme: "Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)"` dan `Flash Mode: "DIO"` (Modul 10 ➕ A). Berbeda? Kembalikan sekarang (tanpa **Upload**): setelan ini wajib minggu ini.

Ingat [Konsep 10 Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#10-harga-wifi-program-membengkak-adc2-terkunci-arus-melonjak): memori *flash* 4 MB dibagi menjadi rak (partisi), dan skema pilihan [Silabus](../../SILABUS.md#modul-10--wifi--http-perangkat-mulai-berbicara-dengan-jaringan) sejak modul itu memberi **dua rak program**, `app0` dan `app1`, masing-masing 1.966.080 byte. Node 1 1.6.0 mengisi kira-kira 1.194.232 byte (60 % satu rak; catatan Modul 21) di rak `app0`; rak kedua belum terpakai. Di komputer lain angkanya bisa beda beberapa ratus byte (mesin penulis: 1.193.864): nama papan, sistem operasi, dan jalur folder paket ikut tersimpan. **Nanti di [🏆](#-kemenangan-cepat-dua-rak-di-papanmu-15-menit) dan [Konsep 2](#2-dua-rak-dan-secarik-catatan-app0-app1-otadata-dan-pembuka-rak):** kedua rak itu bekerja.

### Langkah 3 — Kontrak sudah menyebut `update`, firmware belum: `aksi update belum didukung (Modul 28)`

Kontrak data menyebut perintah `update` sejak [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#5-kontrak-data-lima-topik-dan-satu-bentuk-json-untuk-semua); firmware 1.6.0 belum mengerjakannya. Cari `aksi update` di `firmware/node-1-rumah/jaringan.cpp` (VS Code: **Ctrl + F**), atau di terminal akar proyek laptop (bash):

```text
grep -n 'aksi update belum didukung' firmware/node-1-rumah/jaringan.cpp
```

**Hasilnya (lab penulis):**

```text
323:    pesan = "aksi update belum didukung (Modul 28)";
```

Setiap `update` dijawab `ack` berisi pesan itu. Cukup dibaca, jangan dicoba dari MQTTX: hanya akun `backend` dan `nodered` yang boleh menulis `cmd`, dan akun `backend` di MQTTX menendang backend yang asli (nama akun = nama klien). **Nanti di [Konsep 3](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji):** jalan lengkap `update`.

### Langkah 4 — Dua cara menyala ulang: tombol EN (`POWERON`) lawan Serial `restart` (`SW`)

Tekan **EN**, tunggu sebentar, lalu ketik `info` lagi: `restart terakhir POWERON`. Sekarang ketik ini, lalu Enter:

```text
restart
```

Firmware menulis `Restart sekarang...` lalu menyala ulang; `info` berikutnya: `restart terakhir SW` (program sendiri yang meminta). Versi 1.6.0 menyala ulang tanpa pamit ke broker; di 1.7.0, `restart` menjadi **berhenti sengaja** (`offline-mode`) dan `SW` ikut dikirim sebagai `reset_reason`. **Nanti di [Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason):** tujuh nilai `reset_reason` di layar **Armada**.

### Langkah 5 — Foto "sebelum" Node 1 dari atas

Kembalikan Node 1 ke *charger* dengan urutan yang sama. Potret breadboard Node 1 dari atas, seluruh rangkaian masuk bingkai, lalu catat sudut dan jaraknya. **Nanti di [13.1](#131--foto-sesudah-dari-sudut-dan-jarak-yang-sama-3-menit):** foto "sesudah" dari sudut dan jarak yang sama (syarat K1). Foto yang memperlihatkan isi rumah tidak masuk Git.

<details>
<summary>Kunci uji dirimu</summary>

1. **Sesudah unggah lewat USB, rak mana yang berjalan?** `app0`: unggahan kabel mengisi rak itu dan memilihnya untuk menyala.
2. **Kenapa 1.6.0 menolak `update`?** Kontraknya ada sejak Modul 11, tetapi kode pembaruannya baru ada di 1.7.0.
3. **Apa beda `POWERON` dan `SW`?** `POWERON` = listrik baru masuk atau EN ditekan; `SW` = program sendiri yang meminta, misalnya perintah `restart`.

</details>

## 🏆 Kemenangan Cepat: dua rak di papanmu (15 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** dan Serial Monitor (kabel USB ke Node 1), WiFi 2,4 GHz yang sama untuk laptop dan papan, dan [bahannya](kode/kemenangan-cepat/rak-program/README.md).

Sketsa kecil mencetak **rak program** yang berjalan, keadaannya di **catatan rak** (`otadata`), dan rak sebelahnya. Catatan rak = secarik catatan yang dibaca **pembuka rak** (*bootloader*) saat menyala untuk memilih rak. Lalu Arduino IDE **mendorong** versi kedua lewat WiFi (ArduinoOTA): papan pindah dari `app0` ke `app1`.

> [!WARNING]
> **Latihan saja.** Node 1 `Offline` sampai 1.6.0 dipasang lagi lewat kabel (Langkah 5): sensor, lampu otomatis, dan MQTT berhenti; kabar Telegram wajar. Sandi contoh `ganti-sandi-ini` wajib diganti sebelum unggahan pertama: selama sketsa ini berjalan, siapa pun di WiFi rumahmu yang tahu sandinya bisa mengirim program.

> [!NOTE]
> **Dikompilasi penulis, belum dijalankan di papan:** 2 November 2026, `arduino-cli` 1.5.1, paket esp32 3.3.12, setelan Langkah 1; 0 galat, 0 peringatan, `Sketch uses 950907 bytes (48%)`, `Global variables use 51520 bytes (15%)`, `.bin` 951.056 byte, tanpa library tambahan.

> 🔀 **Tanpa Kit** (juga Wokwi): Langkah 1–2 saja, di Wokwi (WiFi `Wokwi-GUEST`, Modul 10); angka dan catatan raknya belum diuji penulis, port jaringan tidak ada.

### Langkah 1 — Baca `rak-program.ino`, isi WiFi dan sandi ArduinoOTA, lalu Upload lewat kabel (4 menit)

1. **Matikan MB102**, lalu pindahkan kabel USB dari *charger* ke laptop (aturan emas catu daya: beban hanya dari MB102, bukan pin ESP32, dengan GND bersama). MB102 tetap mati sampai Langkah 5: sketsa ini tanpa beban.
2. **File → New Sketch**, ganti isinya dengan sketsa di bawah, lalu simpan (**Ctrl + S**) sebagai `rak-program` di folder `belajar-iot/modul-28`. Baca komentarnya (`langkah 2` = Langkah 3 di sini).

```cpp
// Modul 28 - Kemenangan Cepat: dua rak program di papanmu (latihan saja).
// Tools: ESP32 Dev Module, Partition Scheme Minimal SPIFFS, Flash Mode DIO.
#include <WiFi.h>
#include <ArduinoOTA.h>   // ikut paket esp32: terima program lewat WiFi
#include <esp_ota_ops.h>  // ikut paket esp32: rak program dan catatan rak
#include "secrets.h"      // WIFI_NAMA dan WIFI_SANDI, sama dengan Modul 10

const int VERSI = 1;  // langkah 2: ubah angka ini, lalu Upload lewat port jaringan

// Keadaan rak di catatan rak (otadata)
const char* namaKeadaan(esp_ota_img_states_t k) {
  switch (k) {
    case ESP_OTA_IMG_NEW: return "NEW, belum pernah menyala";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, masa uji";
    case ESP_OTA_IMG_VALID: return "VALID, sudah sah";
    case ESP_OTA_IMG_INVALID: return "INVALID, ditolak";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, batal";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, dipasang lewat kabel";
    default: return "tidak dikenal";
  }
}

// Nama alasan restart, sama dengan Modul 5
const char* namaAlasan(esp_reset_reason_t a) {
  switch (a) {
    case ESP_RST_POWERON: return "POWERON";
    case ESP_RST_SW: return "SW";
    case ESP_RST_BROWNOUT: return "BROWNOUT";
    case ESP_RST_PANIC: return "PANIC";
    case ESP_RST_INT_WDT: case ESP_RST_TASK_WDT: case ESP_RST_WDT: return "WDT";
    case ESP_RST_DEEPSLEEP: return "DEEPSLEEP";
    default: return "UNKNOWN";
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  const esp_partition_t* berjalan = esp_ota_get_running_partition();         // rak yang menyala
  const esp_partition_t* sebelah = esp_ota_get_next_update_partition(NULL);  // rak berikutnya
  esp_ota_img_states_t keadaan = ESP_OTA_IMG_UNDEFINED;
  esp_ota_get_state_partition(berjalan, &keadaan);
  Serial.printf("\nVersi %d, restart terakhir: %s\n", VERSI, namaAlasan(esp_reset_reason()));
  Serial.printf("Rak berjalan: %s (%s)\n", berjalan->label, namaKeadaan(keadaan));
  if (sebelah == NULL || sebelah == berjalan) {
    Serial.println("Tidak ada rak sebelah: pilih Partition Scheme Minimal SPIFFS.");
    return;
  }
  Serial.printf("Rak sebelah: %s, %u byte\n", sebelah->label, (unsigned)sebelah->size);
  Serial.printf("Ruang untuk program baru: %u byte\n", (unsigned)ESP.getFreeSketchSpace());

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  if (WiFi.waitForConnectResult(20000) != WL_CONNECTED) {  // paling lama 20 detik
    Serial.println("WiFi belum tersambung. Periksa tab secrets.h.");
    return;
  }
  ArduinoOTA.setHostname("rak-program");      // nama papan di Tools > Port
  ArduinoOTA.setPassword("ganti-sandi-ini");  // WAJIB GANTI dengan sandimu sendiri sebelum Upload
  ArduinoOTA.onStart([]() { Serial.println("Program baru datang, ditulis ke rak sebelah..."); });
  ArduinoOTA.begin();
  Serial.print("Siap menerima program lewat WiFi di ");
  Serial.println(WiFi.localIP());
}

void loop() {
  ArduinoOTA.handle();  // ada kiriman program dari IDE?
}
```

3. Buat tab `secrets.h` (**⋯** → **New Tab**), lalu tempel isi `secrets.h` sketsa Modul 10-mu; isinya harus WiFi Node 1 sekarang: sketsa ini menimpa WiFi tersimpan di NVS, yang dipakai lagi 1.6.0 (menurut kode paket esp32). `.gitignore` (Modul 10 Praktik 1) menahannya dari *commit*.
4. Ganti `ganti-sandi-ini` dengan sandi baru khusus latihan; kembalikan contohnya sebelum *commit*.
5. Menu **Tools**: papan **ESP32 Dev Module**, **Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, **Flash Mode** → **DIO**, **Erase All Flash Before Sketch Upload** → **Disabled** (kunci di NVS selamat), port USB. Klik **Upload**. Macet di `Connecting…`? Tahan **BOOT** begitu tulisan itu muncul, lepaskan saat `Writing at …` mulai berjalan.

### Langkah 2 — Serial Monitor: rak berjalan `app0`, catatan `UNDEFINED`, rak sebelah `app1` (2 menit)

Buka **Serial Monitor** (**115200 baud**); baris pertama terlewat? Tekan **EN**.

**Yang ditulis Serial Monitor (teks dari sketsa; belum direkam penulis di papan; IP contoh):**

```text
Versi 1, restart terakhir: POWERON
Rak berjalan: app0 (UNDEFINED, dipasang lewat kabel)
Rak sebelah: app1, 1966080 byte
Ruang untuk program baru: 1966080 byte
Siap menerima program lewat WiFi di 192.168.1.50
```

Unggahan kabel menulis ulang catatan rak: "nyalakan `app0`", keadaan `UNDEFINED` (tanpa masa uji). `Ruang untuk program baru` (`ESP.getFreeSketchSpace()`) = ukuran **rak sebelah**, tempat program berikutnya ditulis, jadi sama dengan baris di atasnya.

### Langkah 3 — Ubah `VERSI`, pilih port jaringan di Tools → Port, lalu Upload lewat WiFi (4 menit)

Ubah `const int VERSI = 1;` menjadi `2`. Di **Tools → Port**, selain port USB mestinya ada port jaringan `rak-program` dengan IP papan (belum diuji penulis). Pilih port itu, klik **Upload**, lalu isi sandi ArduinoOTA-mu bila diminta. Program lama yang masih berjalan menulis program baru ke rak sebelah, lalu menyalakan ulang papan. Serial Monitor ikut port terpilih: sesudah klik **Upload**, pilih lagi port USB; baris ini (teks dari sketsa) bisa terlewat:

```text
Program baru datang, ditulis ke rak sebelah...
```

Port jaringan tidak muncul? Buka lipatan berjudul sama di [🚨](#-kalau-tidak-jalan).

### Langkah 4 — Papan menyala di rak `app1`, juga sesudah tombol EN ditekan (2 menit)

Sesudah menyala ulang (teks dari sketsa; disusul dua baris seperti Langkah 2):

```text
Versi 2, restart terakhir: SW
Rak berjalan: app1 (VALID, sudah sah)
Rak sebelah: app0, 1966080 byte
```

`SW`: ArduinoOTA sendiri yang meminta *restart* sesudah menulis. Versi 2 **langsung sah** tanpa membuktikan apa pun: inti Arduino mengesahkan program baru sebelum `setup()`. Satu baris `extern "C"` di Node 1 1.7.0 mengubahnya menjadi masa uji 60 detik ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c)). Tekan **EN**: `Versi 2, restart terakhir: POWERON`, tetap di `app1 (VALID, sudah sah)`, karena catatan rak menunjuk `app1`.

### Langkah 5 — Pasang lagi Node 1 1.6.0 lewat kabel: kembali ke `app0` (3 menit)

1. Pilih lagi port USB, lalu klik **Upload** sekali lagi: `Rak berjalan: app0 (UNDEFINED, dipasang lewat kabel)`, karena setiap unggahan kabel menulis ulang catatan rak (1.6.0 sendiri tidak mencetak rak).
2. Buka `node-1-rumah.ino` (cabang `main`) dan klik **Upload**: Serial Monitor menulis `Node 1 Rumah - firmware 1.6.0` (teks dari kode).
3. Pindahkan kabel USB kembali ke *charger*, **baru** nyalakan MB102: kartu Node 1 kembali `Online`.

**Dorong vs tarik:**

| | Dorong dari IDE (ArduinoOTA) | Tarik dari server (Node 1 1.7.0) |
| :-- | :-- | :-- |
| Siapa memulai | laptop mengirim program | server memerintah lewat MQTT, papan mengunduh sendiri |
| Satu jaringan? | ya (mDNS) | tidak, asal papan menjangkau servernya |
| Kunci | satu sandi untuk siapa pun yang tahu | kunci per perangkat |
| Sidik jari berkas | MD5 dari Arduino IDE, hanya memastikan kiriman utuh | SHA-256 dari server rumah, diperiksa sebelum dipasang |
| Firmware buruk | tetap sah, tetap dipakai | masa uji 60 detik, lalu kembali sendiri ke versi lama |
| Banyak perangkat | satu per satu dari laptop | *canary* dulu, lalu sisanya (Konsep 7) |
| Jejak | tidak ada | riwayat di layar **Armada** |

> ➡️ **Berikutnya:** [Konsep 1](#1-mengapa-ota-wajib-perangkat-di-atap) sampai [Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https) ([Konsep 2](#2-dua-rak-dan-secarik-catatan-app0-app1-otadata-dan-pembuka-rak): dua rak tadi), lalu [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-cadangan-dan-catatan-akun-10-menit) dan [Praktik 2](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit); Node 1 tetap 1.6.0 sampai [Praktik 5](#praktik-5--node-1-170-lewat-kabel-untuk-terakhir-kalinya-25-menit-butuh-papan). Kotak dan papan ekspansi belum ada? Baca [Konsep 11](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v), ukur papanmu, lalu pesan sekarang untuk [Praktik 12](#praktik-12--dari-breadboard-ke-kotak-90-menit-butuh-papan-jalur-solder-ditambah-60-menit).

## 🧠 Konsep "Mengapa"

Sebelas konsep ini tidak perlu dibaca sekaligus. Bacalah berselang-seling dengan praktiknya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–6 → Praktik 1 (meja kerja) dan Praktik 2 (server: kontrak 1.6, backend 1.5.0, broker pusat)
2. Konsep 7–9 → Praktik 3 (akun broker otomatis di gerbang) dan Praktik 4 (layar Armada dengan perangkat tiruan). Praktik 1–4 tidak mengubah firmware Node 1; kabel USB-nya hanya dipakai di 3.4 untuk mengetik kunci baru di Serial Monitor
3. Praktik 5–8 (Praktik 5 butuh papan; tanpa Kit: 6–8 dengan simulator): 1.7.0 lewat kabel untuk terakhir kalinya, unggah 1.7.1, pembaruan tanpa kabel, lalu *rollback*. Praktik 9 opsional
4. Praktik 10 (perangkat baru dengan kode klaim) → Konsep 10 → Praktik 11 (jeda `vitals` dan menonaktifkan perangkat)
5. Konsep 11 → Praktik 12 (dari breadboard ke kotak) → 24 jam menyala → Praktik 13

Konsep 11 boleh dibaca kapan saja sebelum kamu membeli kotak dan papan ekspansi. Potongan berkas, perintah, dan tabel di bagian konsep cukup dibaca; semuanya diketik dan dijalankan di praktik.

Modul 27 ditutup dengan dua batas yang jujur: firmware Node 1 masih diunggah lewat kabel USB, dan Node 1 masih di breadboard ([akhir Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#-checklist-kelulusan-modul-27)). Konsep 1–4 membongkar mesin pembaruan di dalam papan: kenapa ia wajib, di rak mana program baru ditulis, bagaimana unduhannya berjalan, dan bagaimana firmware yang gagal kembali sendiri ke versi lama (*rollback*). Konsep 5–11 menyusul: versi, siapa yang boleh memberi firmware, banyak perangkat, dan kotak.

### 1. Mengapa OTA wajib: perangkat di atap

Bayangkan Node 1 sudah terpasang di kotak, di plafon dekat tandon air, atau di rumah orang tuamu di kota lain. Dengan cara lama, setiap perbaikan berarti: turunkan kotaknya, sambungkan kabel USB ke laptop, klik **Upload**, lalu pasang lagi. Untuk satu papan di meja, itu lima menit. Untuk sepuluh papan di sepuluh rumah, itu sepuluh kunjungan: ongkos satu pembaruan = ongkos satu kunjungan × jumlah perangkat. [Silabus](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak) menyebutnya **perangkat di atap**: perangkat yang dipasang di tempat sulit harus bisa diperbarui tanpa dipanjat. Caranya disebut **pembaruan lewat udara** (OTA, *over-the-air*): program baru datang lewat jaringan, bukan lewat kabel.

Kenapa firmware perlu diperbarui? Ada tiga alasan.

1. **Memperbaiki kesalahan.** Program tanpa *bug* hampir tidak ada; sebagian baru ketahuan sesudah perangkat bekerja berminggu-minggu.
2. **Menutup celah keamanan.** Daftar OWASP di [🔬 Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#-bedah-teknis-opsional) memasukkan "pembaruan firmware lewat udara tanpa pemeriksaan keaslian" ke A08, dan tabel OWASP IoT di [Konsep 10 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos) memberi I4 (*Lack of Secure Update Mechanism*) tanda ⏳ untuk modul ini. Perangkat yang tidak bisa diperbarui memikul celahnya selamanya.
3. **Akar sertifikat berganti.** [Konsep 6 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal) sudah memperingatkan: kalau akar Let's Encrypt berganti, Pi cukup menarik image baru, sedangkan ESP32 yang menanam akar butuh firmware baru. Tanpa OTA, artinya memanjat semua atap pada minggu yang sama.

Namun, pintu pembaruan juga pintu masuk penyerang: siapa pun yang bisa memberi firmware ke papanmu bisa menguasainya. Siapa yang boleh memberinya dibahas di [Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https).

**Lima cara program masuk ke papan:**

| Cara | Siapa memulai | Di kurikulum ini |
| :-- | :-- | :-- |
| Kabel USB | kamu, dari Arduino IDE | sejak Modul 2; Node 1 1.7.0 dipasang begini untuk terakhir kalinya di [Praktik 5](#praktik-5--node-1-170-lewat-kabel-untuk-terakhir-kalinya-25-menit-butuh-papan) |
| Dorong dari IDE (ArduinoOTA) | laptop di WiFi yang sama, dengan satu sandi | [🏆 Kemenangan Cepat](#-kemenangan-cepat-dua-rak-di-papanmu-15-menit) |
| **Tarik dari server** | server memerintah lewat MQTT, papan mengunduh sendiri dari server rumahnya | **jalur kita** ([Konsep 3](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji)): papan boleh di mana saja, asal bisa menjangkau servernya |
| Unggah lewat portal WiFiManager | siapa pun yang tersambung ke portal | tidak dipakai, tetapi `192.168.4.1/update` selalu terdaftar selama portal terbuka, walaupun tombol **Update** disembunyikan sejak [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#d-verify-upload-dan-sambungkan-ke-wifi); portal bersandi ([5.2](#52--portal-bersandi-sandi_portal-di-kuncih-3-menit)) membuatnya hanya terjangkau orang yang tahu sandinya |
| Lewat radio lain (ESP-NOW) | papan lain di dekatnya | tidak dipakai: Node 2 tetap lewat kabel ([Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota), [🔬](#-bedah-teknis-opsional) *OTA Node 2 lewat "mode update"*) |

**Seketika, bukan cek tiap jam.** Cara lain: papan bertanya ke server secara berkala, misalnya setiap jam, "Ada versi baru?" Silabus memilih kebalikannya: server yang memutuskan, dan perintah MQTT `update` memicu pembaruan **seketika**. Node 1 tidak pernah menarik daftar rilis sendiri, jadi tidak ada lalu lintas sia-sia, dan kamu tahu persis kapan setiap perangkat diperbarui: saat admin menekan **Perbarui** di layar **Armada**.

Inilah janji "bisa diperbarui dari jarak jauh tanpa kabel" di [halaman pertama Silabus](../../SILABUS.md#setelah-menyelesaikan-32-modul-anda-akan-mampu), dan OTA juga bagian dari proyek Checkpoint Fase 5 ([Silabus §8](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)). Batasnya: minggu ini perangkatmu bisa diperbarui dan didaftarkan tanpa kabel; image server yang diperbarui otomatis dan uji otomatis menyusul di [Modul 29](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis), pemantau layanan dan cadangan otomatis di [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data).

### 2. Dua rak dan secarik catatan: `app0`, `app1`, `otadata`, dan pembuka rak

Di [Konsep 10 Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#10-harga-wifi-program-membengkak-adc2-terkunci-arus-melonjak), memori *flash* 4 MB papanmu dibagi menjadi beberapa **rak** (partisi), "seperti lemari yang sekatnya sudah dipasang pabrik". [Silabus](../../SILABUS.md#modul-10--wifi--http-perangkat-mulai-berbicara-dengan-jaringan) menetapkan skema **Minimal SPIFFS** sejak modul itu: dua rak program yang lebih lega, dan rak kedua dijanjikan untuk pembaruan lewat udara di Modul 28. Di Kemenangan Cepat kamu sudah melihat keduanya bekerja. Isi lemarinya, dari alamat terkecil:

| Alamat awal | Rak | Ukuran | Tugasnya |
| :-- | :-- | --: | :-- |
| `0x1000` | **pembuka rak** (*bootloader*) | — | program kecil yang menyala paling dulu: membaca catatan rak, lalu menjalankan rak yang ditunjuk |
| `0x8000` | tabel partisi | — | denah lemari: rak apa ada di alamat mana |
| `0x9000` | `nvs` | 20 KB | [lemari arsip yang tidak lupa](../../fase-1-esp32-embedded/modul-08-firmware-tangguh/README.md#7-nvs-dan-preferences-lemari-arsip-yang-tidak-lupa): WiFi, kunci perangkat, ambang, alamat server |
| `0xE000` | `otadata` = **catatan rak** | 8 KB | secarik catatan: rak mana yang dinyalakan, dan keadaan setiap rak |
| `0x10000` | `app0` = **rak program** pertama | 1.966.080 byte | program |
| `0x1F0000` | `app1` = rak program kedua | 1.966.080 byte | program |
| `0x3D0000` | `spiffs` | 128 KB | rak berkas, tidak dipakai Node 1 |
| `0x3F0000` | `coredump` | 64 KB | catatan sistem saat program mogok |

1.966.080 byte = `0x1E0000`, yang di Modul 10 ditulis 1,875 MB.

**Siapa memilih rak?** Setiap kali papan menyala, pembuka rak membaca catatan rak lalu menjalankan rak yang ditunjuknya. Program tidak pernah "pindah rak" di tengah jalan: yang diubah hanya catatannya, dan perubahan itu baru berlaku saat papan menyala berikutnya.

**Unggah lewat kabel.** Klik **Upload** lewat USB menulis empat hal: pembuka rak, tabel partisi, catatan rak berbunyi "nyalakan `app0`", dan programnya di `app0`. Keadaan rak itu `UNDEFINED`: boleh jalan tanpa syarat, tanpa masa uji.

**Pembaruan lewat udara menulis rak sebelah.** Program yang sedang berjalan menerima berkas baru sepotong demi sepotong dan menulisnya ke rak yang tidak dipakai, **rak sebelah**, sementara dirinya tetap berjalan di raknya sendiri. Library `Update` (dipakai HTTPUpdate) menyimpan satu trik: **16 bait (byte) pertama** rak baru ditulis paling akhir, sesudah seluruh berkas tiba dan diperiksa. Baru sesudah rak baru utuh, catatan rak diubah untuk menunjuknya. Kalau listrik padam di tengah unduhan, catatan rak masih menunjuk rak lama, dan rak setengah jadi pun belum sah di mata pembuka rak karena 16 bait pertamanya belum ada: papan menyala lagi dengan program lama.

**NVS tidak dihapus.** Pembaruan maupun *rollback* tidak menimpa isi lemari arsip `nvs` (hanya menambah catatan pembaruan, Konsep 3–4), jadi firmware baru langsung memakai WiFi, kunci broker, ambang, dan alamat server yang sama, begitu pula firmware lama yang kembali.

**Muatkah?** Satu rak = 1.966.080 byte. Node 1 1.6.0 = 1.194.232 byte (60 %, catatan Modul 21). Firmware 1.7.0 menambah HTTPS dengan daftar sertifikat akar bawaan paket, HTTPUpdate, dan tiga kolom portal. Hasil kompilasi penulis dengan setelan Modul 10: **sekitar 1,41 juta byte (71 % satu rak)**, naik sekitar 217 ribu byte dibanding 1.6.0 yang dikompilasi di mesin yang sama. Sisa raknya sekitar 555 ribu byte, cukup untuk versi-versi berikutnya. Angka persisnya kamu baca sendiri di [5.3](#53--upload-lewat-kabel-lalu-baca-ukuran-program-terhadap-rak-1966080-byte-5-menit); di Arduino IDE-mu boleh beda beberapa ratus byte (nama papan, sistem operasi, dan jalur folder paket ikut tersimpan), ±2,6 ribu byte lagi bila `kunci.h`-mu berisi kunci ESP-NOW dan sandi portal. Satu lagi: `ESP.getFreeSketchSpace()`, yang namanya terdengar seperti "sisa ruang", sebenarnya menjawab **ukuran rak sebelah**, tempat program berikutnya akan ditulis.

**Berkas mana yang dikirim ke server?** **Sketch → Export Compiled Binary** ([6.2](#62--sketch--export-compiled-binary-isi-folder-build-3-menit)) menaruh beberapa berkas di folder `build/` sketsa. Hanya satu yang dipakai pembaruan lewat udara:

| Berkas | Isinya | Untuk server? |
| :-- | :-- | :-- |
| `node-1-rumah.ino.bin` | **berkas firmware**: program saja, diawali bait `0xE9`. Di mesin penulis 1.411.040 byte, sedikit lebih besar daripada angka `Sketch uses`, karena membawa kepala, pengisi, *checksum*, dan sidik SHA-256 di ujungnya | **ya** ([6.3](#63--pilih-node-1-rumahinobin-bukan-mergedbin-lalu-hitung-sha-256-nya-3-menit)) |
| `node-1-rumah.ino.merged.bin` | **berkas gabungan**: isi seluruh *flash* 4 MB dari alamat 0, diawali bait `0xFF` | tidak: pasti ditolak, karena lebih besar dari rak dan bait pertamanya bukan `0xE9` |
| `.bootloader.bin`, `.partitions.bin` | pembuka rak dan tabel partisi | tidak |

**Kabel lagi sesudah pembaruan lewat udara.** Karena unggahan kabel menulis ulang catatan rak, papan yang sudah berjalan di `app1` kembali ke `app0` begitu kamu mengunggah lewat USB. Itulah `app0 (UNDEFINED, dipasang lewat kabel)` di [KC Langkah 5](#langkah-5--pasang-lagi-node-1-160-lewat-kabel-kembali-ke-app0-3-menit) dan, nanti, di jawaban Serial `ota` Node 1 ([5.4](#54--o0-serial-ota-dan-server-lalu-kartu-node-1-versi-170-dengan-reset_reason-5-menit)). Itu wajar, bukan kerusakan ([🚨](#-kalau-tidak-jalan) *Sesudah Upload lewat kabel, papan kembali ke rak `app0`*). Versi di layar **Armada** tetap benar, karena versi dibaca dari `fw` yang dikirim firmware, bukan dari nama rak.

![Diagram dua rak dan secarik catatan (Konsep 2): peta flash 4 MB Node 1, skema Minimal SPIFFS (min_spiffs.csv, paket esp32 3.3.12); 0x… = alamat awal heksadesimal. Atas, peta sebanding: awal 64 KB (pembuka rak, tabel partisi, nvs, otadata), lalu app0 (ota_0, 0x10000, 1.966.080 byte) dan app1 (ota_1, 0x1F0000, 1.966.080 byte), spiffs 0x3D0000 128 KB, coredump 0x3F0000 64 KB. Di app0: Node 1 1.7.0 = 1.410.887 byte (71 % satu rak; hasil kompilasi penulis); pembanding: Node 1 1.6.0 = 1.194.232 byte (60 % satu rak; Modul 21). Perbesaran awal: 0x0 kosong, 0x1000 bootloader (pembuka rak), 0x8000 tabel partisi, 0x9000 nvs 20 KB, 0xE000 otadata 8 KB. nvs: WiFi, kunci perangkat, ambang, alamat_server, tidak dihapus atau ditimpa oleh pembaruan maupun rollback; otadata = secarik catatan: rak mana yang dijalankan dan keadaannya. Tengah, tiga keadaan latihan; pembuka rak (bootloader) membaca otadata setiap menyala. 1, unggah lewat kabel 1.7.0: app0 1.7.0 berjalan, UNDEFINED, tanpa masa uji; app1 tidak dipakai; unggah kabel menulis pembuka rak 0x1000, tabel 0x8000, otadata (boot_app0.bin) dan app0, jadi papan selalu kembali ke app0; 1.7.0 firmware terakhir yang wajib lewat kabel. 2, pembaruan lewat udara 1.7.1: app0 1.7.0 UNDEFINED, cadangan utuh; app1 1.7.1 berjalan, NEW lalu PENDING_VERIFY lalu VALID; unduhan ditulis ke rak sebelah, 16 bait pertama ditulis paling akhir, baru otadata menunjuk app1: rak setengah jadi tidak pernah dijalankan; masa uji 60 detik, terbukti = VALID. 3, rilis uji 1.7.2 gagal: rak sebelah dari app1 adalah app0, 1.7.0 ditimpa 1.7.2, yang ditandai INVALID karena kunci salah dan 60 detik habis (kalau ia menyala ulang di tengah masa uji: ABORTED); app1 1.7.1 menyala lagi dan melapor rollback lewat vitals.ota. Bawah: yang diunggah ke server node-1-rumah.ino.bin (bait pertama 0xE9, satu rak), bukan .merged.bin (4 MB, mulai 0x0) atau .bootloader.bin; ESP.getFreeSketchSpace() = ukuran rak sebelah, bukan sisa ruang; rak cadangan butuh skema dua rak (Modul 10); skema tanpa OTA (No OTA, Huge APP): perintah diterima, lalu pembaruan gagal (Update 10).](aset/dua-rak-otadata.png)

### 3. HTTP OTA langkah demi langkah: dari perintah `update` sampai masa uji

Kontrak sudah menyebut `update` sejak [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#5-kontrak-data-lima-topik-dan-satu-bentuk-json-untuk-semua), tetapi Node 1 1.6.0 menjawabnya `aksi update belum didukung (Modul 28)` ([🔁 Langkah 3](#langkah-3--kontrak-sudah-menyebut-update-firmware-belum-aksi-update-belum-didukung-modul-28)). Kontrak data 1.6 ([2.1](#21-kontrak-15--16-update-vitals-configjeda-dan-kode-klaim-5-menit)) merincinya, dan Silabus v1.0.30 memperbarui contoh lama Lampiran A (`1.1.0`, tanpa `sha256`) ke bentuk ini. Contoh dari bagian 7 [`KONTRAK-DATA.md`](kode/KONTRAK-DATA.md):

```json
{"id":"c-20261031-010147-2","ts":"2026-10-31T01:01:47Z","aksi":"update","versi":"1.7.1","url":"https://iot.namaanda.my.id/fw/node-1/1.7.1.bin","sha256":"9f2c…(64 heksadesimal)…","ukuran":1196032}
```

`sha256` adalah sidik jari isi berkas (sama dengan keluaran `sha256sum`), dan `ukuran` panjangnya dalam byte. Angka `ukuran` di contoh kontrak itu sama dengan ukuran berkas tiruan lab penulis; berkas 1.7.1-mu sekitar 1,41 juta byte. [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#9-ukuran-pesan-wadah-256-byte-yang-membuang-diam-diam) dulu memperkirakan perintah ini sekitar 165 byte. Dengan `sha256` dan `ukuran`, perintah terpanjang yang diizinkan kontrak (`id` 39 huruf, `url` 200 huruf) menjadi 449 dari 512 byte paket MQTT (dihitung penulis di uji host): masih muat di wadah `setBufferSize(512)` Node 1.

**QoS 1, tidak pernah *retained*.** Node 1 mengingat `id` perintah hanya selama menyala ([aturan 8 Lampiran A](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini)), dan sesudah pembaruan ia memang menyala ulang. Perintah `update` yang tertempel di broker akan diserahkan lagi setiap kali Node 1 menyambung, padahal Node 1 yang baru menyala sudah lupa `id`-nya: begitu versinya berbeda (misalnya sesudah *rollback*), pembaruan yang sama dimulai lagi, berulang-ulang. Server rumah mengirim `update` tanpa tanda *retained*; jangan pernah mencentang **Retain** untuknya di MQTTX.

**Diperiksa dulu, baru dijawab.** Sebelum menjawab, Node 1 memeriksa isi perintah tanpa mengunduh apa pun (`periksa-ota.cpp`):

- tidak sedang masa uji, dan tidak ada pembaruan lain yang berjalan;
- `versi` berbentuk x.y.z, **berbeda** dari versi yang berjalan, dan tidak di bawah 1.7.0 (Konsep 4);
- `sha256` tepat 64 heksadesimal huruf kecil, dan `ukuran` muat di rak sebelah;
- `url` **sama persis** dengan `<alamat server tersimpan>/fw/node-1/<versi>.bin`. Alamat server itu tersimpan di Node 1 sendiri (portal WiFi, Serial `server`, atau klaim), bukan diambil dari pengirim perintah, karena unduhan membawa kunci perangkat ([Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https));
- `http://` hanya ke alamat IP rumah (`10.x`, `172.16–31.x`, `192.168.x`); di internet selalu `https://`.

Lolos semua: `ack` `ok:true`. Gagal satu: `ok:false` + alasannya, dan tidak ada yang diunduh. Menurut aturan 4, setiap perintah dijawab dalam 5 detik, padahal pembaruan lengkap (unduh, tulis, menyala ulang, masa uji) jauh lebih lama. Jadi `ok:true` untuk `update` berarti **diterima, belum selesai**; hasil akhirnya datang belakangan, lewat `vitals`.

**Sesudah `ok:true`**, di putaran `loop()` berikutnya (`pembaruan.cpp`):

1. **Rencana dicatat di NVS** (`id`, versi asal, versi tujuan), supaya firmware mana pun yang menyala sesudahnya tahu harus melapor apa.
2. **Pompa dan buzzer padam**; lampu, kipas, dan tirai tetap pada keadaan terakhirnya. Selama mengunduh, `loop()` berhenti berputar, jadi [pengaman lokal Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang) ikut berhenti. Ini harga yang jujur dari pembaruan ([7.4](#74-yang-terjadi-di-papan-selama-mengunduh-led-pompa-dan-buzzer-3-menit)).
3. **Berhenti sengaja.** Node 1 menerbitkan status `offline-mode` (*retained*, QoS 1), lalu memutus sambungan broker dengan **rapi** (pesan DISCONNECT). Broker tidak menerbitkan wasiat `offline` untuk sambungan yang diputus rapi, jadi dashboard menulis lencana `berhenti sengaja`. Inilah status ketiga yang sejak Modul 19 "tetap disimpan untuk Modul 28". Bedakan tiga hal ini: **berhenti sengaja** (`offline-mode`, pamit dulu), **terputus** (`offline`, wasiat dari broker), dan **mode offline** (Modul 19: broker tak terjangkau, pengaman lokal bekerja).
4. **[*Watchdog*](../../fase-1-esp32-embedded/modul-08-firmware-tangguh/README.md#8-watchdog-penjaga-yang-me-restart-program-macet) dilonggarkan** dari 5 menjadi 60 detik: menyambung ke server dan menunggu jawabannya saja boleh makan 8 detik. Selama berkas mengalir, *watchdog* diberi makan setiap 4 KB. Layar OLED menulis `PEMBARUAN FIRMWARE`, versi tujuan, persentase, dan `jangan cabut listrik`, atau `PEMBARUAN GAGAL` bila gagal (teks dari kode).
5. **Unduhan berkunci.** HTTPUpdate mengirim `GET` ke alamat yang sudah diperiksa tadi dengan HTTP/1.0, membawa `device_id` dan kunci perangkat (Modul 21) seperti saat masuk broker (Basic Auth: nama pengguna dan sandi di kepala HTTP, `device_id:kunci`), kepala `x-ESP32-STA-MAC` (MAC WiFi papan), `x-ESP32-version` (versi yang sedang berjalan), dan beberapa kepala `x-ESP32-*` lain. Server rumah menjawab `200` + `Content-Length` (berkasnya), `403` (kunci atau MAC salah, atau perangkat dinonaktifkan), `404` (versi tidak ada atau ditarik), atau `304` (versi yang diminta sama dengan yang berjalan; pengaman kedua, karena Node 1 sudah menolaknya sebelum `ack`).
6. **Tulis ke rak sebelah.** HTTPUpdate memeriksa ukurannya muat dan bait pertamanya `0xE9`, lalu menulis per 4 KB sambil menghitung SHA-256. Sidik jarinya harus sama dengan `sha256` di perintah; baru sesudah itu 16 bait pertama ditulis dan catatan rak menunjuk rak baru (Konsep 2).
7. **Menyala ulang** (`reset_reason` berikutnya `SW`), lalu **masa uji** 60 detik (Konsep 4). Lolos: `online`, lalu `vitals` membawa `fw` baru dan laporan `ota` `berhasil`, diulang di paling banyak 3 `vitals` karena `vitals` (QoS 0) bisa hilang.

**Gagal sebelum menyala ulang** (server menolak, berkas rusak, sambungan putus): rak lama tetap berjalan tanpa menyala ulang, *watchdog* kembali 5 detik, Node 1 tersambung lagi (`online`), lalu `vitals` membawa laporan `gagal` dengan kalimat sebabnya (paling panjang 80 huruf). Kalau Node 1 justru menyala ulang di tengah unduhan (listrik padam, atau unduhan `http://` yang berhenti sampai *watchdog* 60 detik habis), ia menyala dengan rak lama yang utuh, lalu melapor `gagal`.

Di layar **Armada**, urutan ini kamu lihat di [7.3](#73--perbarui-170--171-berhenti-sengaja-mengunduh-lalu-berhasil-6-menit). Penulis mengujinya dengan simulator perangkat (berkas 1.7.1 asli hasil kompilasi, hanya diunduh dan diperiksa, tidak dijalankan): `ack` 5 ms sesudah `cmd`, kartu `berhasil` 5,5 detik sesudah klik. Itu angka simulator di satu mesin, bukan ESP32 lewat WiFi; lamanya di papan sungguhan belum diukur penulis.

![Diagram urutan pembaruan lewat udara (Konsep 3), Node 1 1.7.0 ke 1.7.1: server memerintah, perangkat mengunduh lewat HTTP, bukan MQTT. Garis hidup: Admin (/armada, dashboard 1.4.0), Server rumah (backend 1.5.0 + Caddy /fw/*), Broker (gerbang Pi atau pusat), Node 1. Admin klik Perbarui lalu Ya, perbarui (POST /api/devices/:id/update). Server mengirim cmd aksi update (versi, url, sha256, ukuran) lewat broker, QoS 1, tidak pernah retained; status dikirim. Langkah 1, Node 1 memeriksa tanpa mengunduh: bukan masa uji, tidak ada pembaruan lain; versi beda dan tidak di bawah 1.7.0; sha256 64 heksadesimal, ukuran muat rak sebelah; url = alamat server tersimpan + /fw/node-1/versi.bin; http:// hanya ke IP rumah. ack ok:true = diterima, bukan selesai, paling lambat 5 detik (ok:false + pesan = ditolak); status diterima. Langkah 2, bersiap: rencana di NVS, pompa dan buzzer padam, status offline-mode retained lalu DISCONNECT rapi, wasiat offline tidak terbit (lencana berhenti sengaja), watchdog 5 menjadi 60 detik. Node 1: GET alamat server/fw/node-1/1.7.1.bin HTTP/1.0 dengan Basic device_id:kunci, x-ESP32-STA-MAC, x-ESP32-version 1.7.0, lewat WiFi dan router, tidak lewat broker. Backend memeriksa (Caddy hanya meneruskan): kunci atau MAC salah 403, versi tidak ada atau ditarik 404, versi sama 304, cocok 200 + Content-Length + x-SHA256; status mengunduh. Langkah 3, HTTPUpdate menulis rak sebelah: Content-Length muat (-100), bait pertama 0xE9 (-106), tiap 4 KB watchdog diberi makan, SHA-256 = sha256 perintah (Update 15), 16 bait pertama terakhir lalu otadata pindah rak. Langkah 4, restart (reset_reason SW), masa uji 60 detik: tersambung ke broker, online, langganan cmd, firmware sah. Node 1: online, lalu vitals fw 1.7.1 + ota hasil berhasil (paling banyak 3 vitals); status berhasil; Socket.IO ota mengubah kartu tanpa muat ulang. Bawah kiri, gagal sebelum pindah rak: rak lama tetap, online lagi, vitals.ota gagal + pesan: 404 (-102), 403 (-103), pengalihan 308 (-104), isi salah (-106), sidik beda (Update 15), server diam 8 detik (-11), macet https 30 detik (Update 6); macet http: watchdog 60 detik, gagal: menyala ulang saat mengunduh (WDT). Kanan: gagal sesudah pindah rak = rollback; perangkat offline ditolak 409, tidak diantre; tanpa kabar 10 menit = kedaluwarsa; lab tiruan (simulator; 1.7.1 asli, tidak dijalankan) ack 5 ms, berhasil 5,5 detik sesudah klik; papan belum diukur.](aset/alur-ota-http.png)

**Kode galat sebagai bahasa diagnosis.** Laporan `gagal` menyebut kode HTTPUpdate di ujung kalimatnya. Teks persis dari `pembaruan.cpp` (belum direkam penulis di papan):

| Kalimat di laporan `gagal` | Artinya |
| :-- | :-- |
| `berkas lebih besar dari rak program (-100 HTTP_UE_TOO_LESS_SPACE)` | berkas tidak muat di rak sebelah |
| `server tidak memberi Content-Length (-101 HTTP_UE_SERVER_NOT_REPORT_SIZE)` | server tidak menyebut panjang berkas (kirimannya dimampatkan atau dipotong-potong) |
| `berkas tidak ada di server: 404 (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)` | versi itu tidak ada atau sudah ditarik |
| `unduh ditolak server: 403 (-103 HTTP_UE_SERVER_FORBIDDEN)` | kunci atau MAC salah, atau perangkat dinonaktifkan |
| `jawaban server bukan 200/304/403/404 (-104 HTTP_UE_SERVER_WRONG_HTTP_CODE)` | kode lain, termasuk pengalihan `308` dari `http://` ke `https://`: HTTPUpdate tidak mengikuti pengalihan |
| `bait pertama bukan 0xE9 atau belum tiba (-106 HTTP_UE_BIN_VERIFY_HEADER_FAILED)` | yang datang bukan program ESP32 (misalnya halaman web), atau lewat `http://` bait pertamanya terlambat |
| `server diam 8 detik sebelum menjawab (-11 HTTPC_ERROR_READ_TIMEOUT)` | server tidak menjawab; hanya terjadi **sebelum** kepala jawaban tiba |
| `unduhan terhenti di tengah: 30 detik tanpa data (Update 6 UPDATE_ERROR_STREAM)` | data berhenti di tengah berkas lewat `https://`; tanpa menyala ulang |
| `menyala ulang saat mengunduh (WDT)` | data berhenti di tengah berkas lewat `http://`: *watchdog* 60 detik me-*restart* Node 1 |
| `padam saat mengunduh` | listrik putus di tengah unduhan |
| `SHA-256 tidak cocok dengan perintah (Update 15 UPDATE_ERROR_SHA256)` | isi berkas lain dengan yang dimaksud perintah, walau hanya beda satu bait |
| `server: tidak ada pembaruan (304, HTTP_UPDATE_NO_UPDATES)` | pengaman kedua `304` di langkah 5 |
| `tidak tersambung ke server (-1)` | alamat server salah, server mati, atau sertifikat HTTPS ditolak (rinciannya menyusul di belakangnya) |

Obat per kode ada di [🚨](#-kalau-tidak-jalan), kelompok **Unduhan `gagal`**.

### 4. *Rollback* yang benar-benar bekerja: masa uji 60 detik dan `extern "C"`

Silabus menulis syaratnya dengan tegas: firmware baru dianggap sah hanya bila dalam 60 detik berhasil tersambung ke MQTT dan menerbitkan pesan; kalau tidak, papan kembali ke versi lama. Firmware baru diperlakukan seperti karyawan baru dalam masa percobaan: ia baru diangkat kalau dalam waktu tertentu terbukti bisa bekerja. Modul ini menyebutnya **masa uji**. Selain menunjuk rak, catatan rak mencatat keadaan setiap rak:

| Keadaan | Artinya |
| :-- | :-- |
| `NEW` | baru ditulis lewat udara, belum pernah menyala |
| `PENDING_VERIFY` | **masa uji**: pembuka rak menandainya saat rak itu menyala pertama kali |
| `VALID` | sudah terbukti, dipakai seterusnya |
| `INVALID` | firmware itu sendiri menyatakan gagal lalu menyala ulang; pembuka rak kembali ke rak lama |
| `ABORTED` | papan menyala ulang saat rak itu masih masa uji; pembuka rak membatalkannya dan kembali ke rak lama |
| `UNDEFINED` | dipasang lewat kabel, tanpa masa uji (Konsep 2) |

**Jebakan yang diam.** Pembuka rak paket esp32 3.3.12 sudah dibangun dengan kemampuan *rollback* (dipastikan penulis dari tiga sumber terpisah, termasuk isi biner pembuka raknya). Masalahnya ada di inti Arduino. Sebelum `setup()` berjalan, inti Arduino bertanya ke fungsi `verifyRollbackLater()`: "mau membuktikan sendiri nanti?" Jawaban bawaannya `false` sehingga firmware baru langsung ditandai `VALID` sebelum sempat mencoba broker. Firmware dengan kunci broker yang salah pun dianggap sah, tanpa pesan apa pun, dan papan tidak pernah kembali. Gejalanya sudah kamu lihat di [KC Langkah 4](#langkah-4--papan-menyala-di-rak-app1-juga-sesudah-tombol-en-ditekan-2-menit): versi 2 langsung `VALID, sudah sah`.

**Obatnya satu baris** di `masa-uji.cpp` (berkas utuhnya, dengan komentar untuk setiap langkah, kamu baca di [5.1](#51--paket-esp32-3312-skema-minimal-spiffs-dan-firmware-170-dengan-masa-ujicpp-8-menit)):

```cpp
extern "C" bool verifyRollbackLater() {
  return true;
}
```

Jawaban `true` = "ya, saya buktikan sendiri": firmware baru itu sendiri yang memegang keputusannya. Kenapa `extern "C"`? Fungsi bawaannya ditulis dalam bahasa C, sedangkan C++ diam-diam mengubah nama setiap fungsi saat dikompilasi. Tanpa `extern "C"`, fungsi kita terdaftar dengan nama lain dan tidak menggantikan fungsi bawaan. Penulis membuktikannya pada 2 November 2026: tanpa `extern "C"`, kompilasi tetap berhasil tanpa peringatan, tetapi fungsi kita tidak masuk firmware: bawaan `false` yang dipakai (hasil kompilasi penulis). Ukuran programnya pun sama persis, jadi tidak ada tanda apa pun. Jangan pernah menghapus atau mengubah baris ini; cara memeriksanya ada di [🔬](#-bedah-teknis-opsional) *Name mangling dan `extern "C"`*.

**Aturan sah** (aturan 13 `KONTRAK-DATA.md` = aturan 15 Lampiran A): dalam **60 detik sejak menyala**, firmware baru harus tersambung ke broker (kuncinya diterima), lalu `online` dan langganan `cmd` dikirim. Begitu itu terjadi, firmware menandai dirinya `VALID` dan menyiapkan laporan `berhasil`. Kalau 60 detik lewat tanpa itu: (1) laporan `rollback` **disimpan dulu** di NVS, karena sesudah menyala ulang yang hidup adalah firmware lama; (2) firmware menandai dirinya `INVALID` lalu menyala ulang (penanda itu bisa gagal tanpa menyala ulang, jadi nilai baliknya diperiksa dan `ESP.restart()` biasa menjadi cadangan; rak yang belum terbukti tetap dibatalkan, `ABORTED`); (3) firmware lama menyala, mengirim laporan itu lewat `vitals`, dan layar **Armada** menulis `kembali ke versi lama (rollback)`.

**Dua jenis firmware salah, dua penangkap.**

- **Mogok atau macet** (*panic*, *watchdog*): papan menyala ulang di tengah masa uji, dan pembuka rak membatalkan raknya (`ABORTED`). Firmware yang macet di `setup()`, misalnya menunggu sensor selamanya, juga tertangkap: selama masa uji, *watchdog* 75 detik sudah mengawasi `setup()`.
- **Jalan tapi buta**: programnya jalan, tetapi tidak pernah tersambung (kunci atau alamat broker salah). Penangkapnya pengatur waktu 60 detik (`INVALID`). Rilis uji 1.7.2 di [Praktik 8](#praktik-8--firmware-yang-sengaja-salah-kembali-sendiri-ke-versi-lama-25-menit) sengaja jenis ini: `UJI_KUNCI_SALAH = 1` merusak kunci broker di RAM saja, NVS tidak disentuh, jadi firmware lama yang kembali tetap memakai kunci aslinya.

**Sifat yang jujur.**

- Menyala ulang **apa pun** di tengah masa uji membatalkan firmware baru, walaupun firmware itu sebenarnya baik: listrik padam, perintah `restart`, *brownout*. Router atau Pi yang mati lebih dari 60 detik juga membatalkannya, karena broker tak terjangkau (selama masa uji, WiFi dicoba setiap 10 detik, bukan 60). Arahnya selalu aman, ke versi lama, tetapi pembaruanmu hilang: ulangi **Perbarui** sesudah listrik dan jaringan stabil.
- Selama masa uji, portal WiFi tidak dibuka, `update` ditolak (`masih dalam masa uji 60 detik`), begitu pula klaim.
- "Versi lama" = versi **sebelum pembaruan itu**. Di Praktik 8, 1.7.2 gagal dan Node 1 kembali ke 1.7.1, bukan ke 1.7.0 atau 1.6.0.
- Versi di bawah 1.7.0 tidak bisa dikirim lewat udara: firmware itu tidak punya masa uji dan tidak bisa menerima `update` lagi, jadi Node 1 menolak dengan `versi di bawah 1.7.0 tidak punya rollback: pasang lewat kabel`.
- Yang dilindungi hanya "masih bisa tersambung dan terbit". Mogok sesudah firmware terbukti (walau belum 60 detik) atau sensor terbaca salah tidak di-*rollback*; perbaiki dengan versi berikutnya, lewat udara.
- *Rollback* firmware berbeda dengan "rollback" tombol di [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis): di sana tombol optimis mundur ke keadaan semula, di sini papan kembali ke rak program lama.

Logika masa uji dan *rollback* ini diuji penulis di laptop dengan pembuka rak tiruan (13 skenario, 127 pemeriksaan lulus), dan firmware-nya dikompilasi: daftar simbolnya memuat tepat satu `verifyRollbackLater` milik kita (huruf `T`, dibahas di 🔬), jadi *rollback* aktif. Di papan sungguhan belum dijalankan penulis. Di lab simulator, *rollback* selesai 70,4–70,5 detik sesudah klik (±5 detik menyala ulang tiruan, 60 detik masa uji, ±5 detik lagi). Lama *rollback* di papan belum diukur penulis: catat angkamu di [➕ F](#f-simpan-catatan-belajar-bukti-o0-sampai-p1-foto-sebelumsesudah-dan-angka-papanmu).

![Diagram mesin status rollback (Konsep 4): keadaan rak program dicatat di otadata (ESP-IDF v5.5.5), bukan di berkas .bin; firmware baru harus membuktikan diri dalam 60 detik. Dari kiri: NEW (baru ditulis lewat udara, belum pernah menyala), menyala, PENDING_VERIFY (pembuka rak menandainya saat menyala pertama), lalu inti Arduino sebelum setup() bertanya verifyRollbackLater(). Kotak merah putus-putus: bawaan false langsung VALID sebelum setup(), kunci salah pun sah, tanpa pesan, tanpa rollback. Jawaban true (Modul 28): masa uji 60 detik milik firmware sendiri, baris extern C bool verifyRollbackLater() return true; masa-uji.cpp: tanpa extern C, kompilasi tetap berhasil tanpa peringatan, tetapi fungsi kita tidak masuk firmware: bawaan false yang dipakai (hasil kompilasi penulis). UNDEFINED: lewat kabel, tanpa masa uji. Tiga hasil di kanan: VALID: dalam 60 detik sejak menyala tersambung ke broker (kunci diterima) + online terbit + langganan cmd, firmware menandai dirinya sah. INVALID: 60 detik habis tanpa itu (kunci salah, broker tak terjangkau), laporan rollback disimpan dulu, ditandai tidak sah, restart. ABORTED: menyala ulang di tengah masa uji (mogok, watchdog, listrik padam, restart), pembuka rak membatalkan saat menyala berikutnya. INVALID dan ABORTED menuju Rollback: rak lama menyala, firmware lama membaca catatan di NVS (laporan atau rencana), vitals.ota hasil rollback, dashboard: kembali ke versi lama. Kiri bawah, dua jenis firmware salah: mogok atau macet (panic, macet di setup(), watchdog masa uji 75 detik), ditangkap pembuka rak (ABORTED), laporan menyala ulang di tengah masa uji (PANIC) atau padam di tengah masa uji; jalan tapi buta (rilis uji 1.7.2, UJI_KUNCI_SALAH = 1: kunci dirusak di RAM, broker menolak), ditangkap pengatur waktu 60 detik (INVALID), laporan tidak tersambung ke broker dalam 60 detik. Bawah: restart apa pun di masa uji = batal; broker tak terjangkau 60 detik (router atau Pi mati) juga membatalkan firmware baik, ulangi Perbarui; selama masa uji WiFi dicoba tiap 10 detik, portal tidak dibuka, update lain ditolak (masih dalam masa uji 60 detik); terbukti = kunci diterima, online terbit, langganan cmd dikirim, kesalahan sesudahnya tidak dilindungi; lab tiruan (simulator): rollback 70 detik sesudah perintah (5 + 60 + 5); rollback di papan sungguhan belum diuji penulis.](aset/mesin-status-rollback.png)

> ⬆️ **Sudah membaca Konsep 1–4?** Lanjut ke [Konsep 5](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest) dan [Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https): keduanya dipakai di [Praktik 2](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit). [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-cadangan-dan-catatan-akun-10-menit) (meja kerja) boleh dikerjakan sekarang juga.

### 5. Versi dan SemVer: `VERSI_FIRMWARE`, `fw`, dan daftar rilis (*manifest*)

Supaya bisa menulis "Node 1 perlu diperbarui", server membandingkan versi yang berjalan di papan dengan versi terbaru di server. Keduanya ditulis dengan aturan **SemVer**, dan masing-masing punya satu sumber.

**Satu sumber di papan: `VERSI_FIRMWARE`.** Versi firmware ditulis di satu tempat, baris `const char VERSI_FIRMWARE[] = "1.7.0";` di `konfigurasi.h`. Node 1 mengirimnya sebagai `fw` di setiap `telemetry` sejak [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#5-kontrak-data-lima-topik-dan-satu-bentuk-json-untuk-semua), dan mulai 1.7.0 juga di setiap `vitals`, bersama `reset_reason` ([Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason)). Keterangan aplikasi yang ditanam paket esp32 di setiap `.bin` (`esp_app_desc`) tidak menolong: di Arduino isinya sama untuk semua sketsa paket 3.3.12 (nama `arduino-lib-builder`, versi `6671d0b`). Server juga tidak membaca versi dari isi `.bin`, jadi versi yang kamu ketik saat mengunggah harus sama dengan `VERSI_FIRMWARE` berkas itu ([6.1](#61--konstanta-171-di-konfigurasih-versi_firmware-dan-catatan_versi-2-menit), [6.4](#64--unggah-firmware-di-armada-rilis-171-dengan-sidik-jari-yang-sama-5-menit)).

**Tiga angka, tiga arti.** SemVer (*Semantic Versioning*) menulis versi sebagai `MAJOR.MINOR.PATCH`. Angka mana yang naik memberi tahu seberapa besar perubahannya:

| Angka | Naik saat | Di proyek ini |
| :-- | :-- | :-- |
| PATCH (ketiga) | perbaikan kecil, tanpa kemampuan baru | 1.7.0 → 1.7.1 (latihan: hanya dua konstanta yang berubah) |
| MINOR (kedua) | kemampuan baru, yang lama tetap jalan | 1.6.0 → 1.7.0: OTA, masa uji, kode klaim |
| MAJOR (pertama) | perubahan yang memaksa bagian lain ikut berubah | belum pernah terjadi di proyek ini |

Catatan jujur untuk MINOR: backend 1.4.0 menolak `vitals` 1.7.0 (kolom barunya belum ia kenal), jadi server dipasang lebih dulu ([Praktik 2](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit)), baru firmware di Praktik 5.

**Satu versi, satu berkas, selamanya.** Unggahan kedua dengan versi yang sama dijawab `409` `node1 1.7.1 sudah ada: versi tidak boleh ditimpa. Naikkan VERSI_FIRMWARE, build ulang, lalu unggah dengan versi baru` (lab penulis). Kalau isinya bisa diganti diam-diam, dua papan yang sama-sama melapor `1.7.1` bisa menjalankan program berbeda. Akibatnya, versi yang sudah terpakai tidak dipakai ulang: 1.7.2 menjadi rilis uji yang sengaja salah di [Praktik 8](#praktik-8--firmware-yang-sengaja-salah-kembali-sendiri-ke-versi-lama-25-menit), jadi firmware sungguhan berikutnya 1.7.3. Tanpa nol di depan pula: `1.07.1` ditolak, karena sebagai angka sama dengan 1.7.1, tetapi sebagai teks berbeda.

**Membandingkan versi: per bagian, sebagai angka.** 1.10.0 lebih baru daripada 1.9.0, tetapi kalau dibandingkan huruf demi huruf, hasilnya terbalik (`1.1…` kalah dari `1.9…`). Fungsi kecil `bandingkanVersi()` memecah versi menjadi tiga angka, lalu membandingkannya dari kiri: MAJOR, MINOR, PATCH. Fungsi bernama sama ada di backend (`backend/src/services/versi.ts`) dan firmware (`versi.cpp`), tanpa paket npm `semver`. Backend memakainya untuk memilih `terbaru`, menandai `perlu diperbarui`, dan menolak turun versi kecuali admin mencentang **Izinkan turun versi**; Node 1 memakainya untuk menolak versi di bawah 1.7.0, yang belum punya masa uji (`versi di bawah 1.7.0 tidak punya rollback: pasang lewat kabel`). Isi fungsi backend-nya kamu tulis sendiri di [🧩 Tingkat 2](#tingkat-2--bandingkanversi-dan-lencana-perlu-diperbarui-isi-bagian-rumpang-20-menit).

**Daftar rilis (*manifest*) dibuat server dari database.** *Manifest* adalah daftar versi firmware yang tersedia, lengkap dengan ukuran dan sidik jarinya. HTTPUpdate tidak punya format resminya, dan berkas daftar tulisan tangan bisa berbeda dengan isi lemari, jadi server menyusunnya setiap kali diminta dari tabel `firmware` (migrasi 011): versi, ukuran, SHA-256, catatan, uji, dan ditarik. Bruno `daftar rilis firmware` (`GET /firmware`) dan bagian **Rilis firmware** di layar **Armada** menampilkannya: `terbaru` = versi tertinggi yang bukan uji dan belum ditarik, dan setiap rilis membawa hitungan *canary* serta `boleh_semua` beserta alasannya ([Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota)). Node 1 sendiri tidak pernah membaca daftar ini dan tidak bertanya "ada versi baru?" setiap jam ([Konsep 1](#1-mengapa-ota-wajib-perangkat-di-atap)): server yang membandingkan `fw` setiap kartu dengan `terbaru`, menulis lencana `perlu diperbarui`, dan baru mengirim `update` saat admin menekan **Perbarui** ([Konsep 3](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji)). Pengaman tambahannya di rute unduhan: bila versi yang diminta sama dengan versi yang sedang berjalan (kepala `x-ESP32-version` dari HTTPUpdate), server menjawab `304` tanpa isi, jadi berkas yang sama tidak terpasang dua kali.

**Rilis uji dan rilis ditarik.** Mencentang **uji** saat mengunggah membuat **rilis uji**: hanya untuk satu perangkat lewat **Perbarui** di kartunya, tidak pernah untuk banyak perangkat, dan tidak pernah dihitung `terbaru`. Rilis yang **ditarik** tidak dikirim dan tidak bisa diunduh lagi (`404`), sedangkan berkasnya tetap di lemari. Layar **Armada** belum punya tombol tarik: pakai Bruno `tarik rilis uji` (ganti versi 1.7.2 di jalurnya untuk rilis lain).

**Batasnya.** SemVer untuk seluruh proyek, `CHANGELOG`, dan *tag* versi dibahas tuntas di Modul 29.

### 6. Siapa boleh memberi firmware: kunci, sidik jari, dan HTTPS

Siapa pun yang bisa memasang firmware di Node 1 memegang relay, pompa, dan kunci-kuncinya. Karena itu pembaruan tanpa pengaman ada di dua daftar OWASP yang sudah kamu kenal: A08 "Pembaruan firmware lewat udara tanpa pemeriksaan keaslian (Modul 28)" di [🔬 Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#-bedah-teknis-opsional), dan I4 "tidak ada cara memperbarui firmware dengan aman" (⏳) di [Konsep 10 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos). Jalan berkas firmware minggu ini dijaga di tiga tempat:

1. **Hanya admin yang menaruh berkas.** Formulir **Unggah firmware** di layar **Armada** khusus akun admin. Server memeriksa bait pertama `0xE9` (berkas aplikasi ESP32, [Konsep 2](#2-dua-rak-dan-secarik-catatan-app0-app1-otadata-dan-pembuka-rak)) dan ukurannya paling besar satu rak (1.966.080 byte), menghitung SHA-256-nya sendiri, lalu menyimpannya di lemari Compose baru `data-firmware`. Lemari itu hanya dipasang di `backend`, tidak di `web`: Caddy tidak pernah menyajikan berkas firmware langsung.
2. **Hanya perangkat terdaftar yang mengunduh, dengan kuncinya sendiri.** Rute backend `GET`/`HEAD /fw/node-1/<versi>.bin` meminta Basic Auth `device_id:kunci` (kunci brokernya; [7.6](#76-unduhan-berkunci-dengan-curl---http10-opsional-2-menit)) dan memeriksanya dengan `cocokkanKunci` dari [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#13-kunci-dan-sidik-jarinya-srcauthkuncits-5-menit), menepati komentar `backend/src/auth/kunci.ts`: "kelak untuk HTTP, misalnya unduh firmware di Modul 28". Kepala `x-ESP32-STA-MAC` harus sama dengan `device_id`, perangkat yang dinonaktifkan ditolak `403`, rilis yang ditarik `404`, dan satu alamat IP paling banyak 120 unduhan per menit.
3. **Caddy hanya meneruskan.** Blok `handle /fw/*` di Caddyfile dashboard 1.4.0 meneruskan unduhan ke backend apa adanya, tanpa kompresi (HTTPUpdate memakai HTTP/1.0 dan butuh `Content-Length`), dan diperiksa Caddy **sebelum** *fallback* halaman. Tanpa blok itu (Caddyfile Modul 27, lab penulis), `/fw/…` dijawab `200` berisi halaman dashboard, dan HTTPUpdate berhenti dengan `-106` (bait pertama bukan `0xE9`), bukan `-102` (berkas tidak ada).

**Kenapa berkas `.bin` tidak boleh publik.** Berkas itu bukan hanya program: isi `kunci.h` ikut terkompilasi, yaitu kunci ESP-NOW (Modul 14, bila `PAKAI_ENKRIPSI = true`) dan sandi portal `SANDI_PORTAL` ([Konsep 8](#8-perangkat-baru-dalam-1-menit-identitas-kode-klaim-dan-akun-broker-otomatis)), yang terbaca dengan alat `strings` (diuji penulis), ditambah jalur folder paket di komputer pembuatnya, yang biasanya memuat nama penggunamu. Jadi `.bin` tidak masuk Git (`.gitignore` menjaga `*.bin` dan `build/`) dan tidak dibagikan ke forum, AI, *issue*, atau tautan publik. Kunci broker Node 1 justru **tidak** ada di `.bin`: ia tinggal di NVS papan (Modul 21).

**Sidik jari berkas: utuh, bukan "asli".** Perintah `update` membawa `sha256` yang dihitung server saat berkas diunggah. Node 1 menyerahkannya ke `setSHA256sum()` (baru ada di paket 3.3.12); berkas yang berbeda satu bait saja tidak cocok dan ditolak sebelum catatan rak berganti (`Update 15 UPDATE_ERROR_SHA256`, rak lama tetap jalan; lab penulis, simulator, [8.5](#85-sidik-jari-tidak-cocok-gagal-tanpa-menyala-ulang-opsional-3-menit)). Sidik jari menjamin **keutuhan**: yang tiba sama dengan yang diunggah. Ia bukan tanda tangan, karena tidak membuktikan **siapa** pembuatnya: pemegang akun admin dashboard bisa mengunggah firmware apa saja, dan sidiknya tetap "cocok". Firmware bertanda tangan, yang dijanjikan [🔬 Modul 14](../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md#-bedah-teknis-opsional), ada di [🔬](#-bedah-teknis-opsional) lipatan *Firmware bertanda tangan …*. Di tabel OWASP IoT Modul 21, I4 kini naik dari ⏳ ke 🟡: berkunci, bersidik jari, dan bisa kembali sendiri, tetapi belum bertanda tangan.

**Hanya dari server rumahnya sendiri.** Perintah `update` boleh dikirim akun mana pun yang boleh menulis `rpm/+/cmd`: `backend`, dan `nodered` sejak Modul 13. Karena unduhan membawa kunci perangkat, `url` di perintah harus persis `<alamat server tersimpan>/fw/node-1/<versi>.bin`, dengan alamat server yang kamu isi sendiri lewat portal atau Serial (NVS `alamat_server`). `url` lain dijawab `ack` `ok:false` `url bukan server rumah ini`, dan kuncinya tidak terkirim ke mana pun. Di lab penulis (simulator), perintah palsu atas nama `nodered` ditolak begitu, dan server palsunya tidak menerima satu permintaan pun. Batas jujurnya: akun itu masih bisa menyuruh Node 1 memasang rilis lain yang **ada** di server rumah, misalnya versi lama yang belum ditarik. Jaga sandi `nodered`, dan tarik rilis lama yang buruk ([Konsep 5](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest)).

**[Amplop tersegel](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#8-https-dan-setinsecure-amplop-tersegel-yang-kurirnya-tidak-diperiksa) di internet, kartu pos hanya di rumah.** Di jalur utama, Node 1 mengunduh langsung dari VPS (tidak lewat jembatan), jadi alamatnya `https://`. Firmware 1.7.0 memeriksa sertifikat server dengan **daftar sertifikat akar bawaan paket esp32** (`useBuiltinCACertBundle()`), yang memuat ISRG Root X1 dan X2 sekaligus: rantai RSA (berujung X1) maupun ECDSA (berujung X2) dari [Konsep 6 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal) sama-sama dikenali. Itulah jawaban janji Modul 27 tentang akar yang berganti: Node 1 tidak bergantung pada satu akar, dan daftar yang lebih baru kelak tiba lewat udara bersama firmware baru, selagi akar lama masih berlaku. Yang diperiksa rantai dan nama sertifikat, bukan tanggal berlakunya (setelan paket 3.3.12; belum diuji penulis di papan; [🔬](#-bedah-teknis-opsional)), jadi Node 1 tidak perlu menunggu jam internet sebelum mengunduh. `http://` hanya boleh ke alamat IP jaringan rumah (`10.x`, `172.16–31.x`, `192.168.x`): kuncinya terkirim polos, sama seperti MQTT 1883 di LAN, sedangkan keutuhan berkas tetap dijaga SHA-256. Node 1 menolak `http://` ke alamat lain (`http hanya untuk jaringan rumah`), dan backend menolak menyala dengan `ALAMAT_SERVER` seperti itu.

**Pi jalur gratis: pintu perangkat 8081.** Di jalur gratis, dashboard dibuka lewat terowongan Cloudflare, tetapi Node 1 mengunduh firmware dan menukar kode klaim langsung dari IP Pi (`http://192.168.1.37`). Supaya dashboard tidak ikut terbuka polos di WiFi rumah, Caddyfile punya **pintu perangkat** `:8081` yang hanya melayani `/fw/*` dan `/api/provision/klaim`; jalur lain dijawab `404` `Pintu ini hanya untuk perangkat (unduhan firmware dan klaim). Dashboard: alamat https terowonganmu.` (lab penulis). `PINTU_WEB_DALAM=8081` di `.env` Pi menyambungkan port 80 Pi ke pintu itu, jadi alamat server di portal tetap `http://192.168.1.37`, tanpa `:8081` ([2.3](#23--berkas-infrastruktur-dan-env-mesin-pusat-mosquitto_dynsec_password-dan-alamat_server-6-menit)). Pintu ini tidak memercayai kepala `X-Forwarded-For`, jadi batas laju klaim dan unduhan dihitung per alamat asli perangkat. Lab penulis: unduhan 1.7.1 lewat pintu ini 85 ms (simulator, bukan ESP32 lewat WiFi).

![Diagram siapa boleh memberi firmware (Konsep 6): berkas .bin mengalir lewat satu jalan berpenjaga dari admin ke rak sebelah Node 1. Tabel: tempat, penjaga, yang ditolak (bunyi persis). 1, Admin di /armada (dashboard 1.4.0): hanya akun admin boleh mengunggah (cookie login); viewer 403, tanpa login 401. 2, Backend menerima: bait pertama harus 0xE9 (citra aplikasi ESP32), paling besar 1.966.080 byte (satu rak), badan lebih dari 2 MiB ditolak, satu versi satu berkas, SHA-256 dihitung server; ditolak 400 bukan citra aplikasi ESP32, 400 terlalu besar, 413, 409 versi tidak boleh ditimpa. 3, Lemari data-firmware milik backend: dipasang hanya di backend, tidak di web, Caddy tidak menyajikannya; tidak ikut Git (*.bin, data-firmware/, firmware/**/build/), sebab .bin Node 1 memuat isi kunci.h (kunci ESP-NOW, sandi portal); tanpa alamat publik. 4, Rute /fw/node-1/versi.bin, Caddy meneruskan ke backend: Basic device_id:kunci dicocokkan (cocokkanKunci, Modul 21), x-ESP32-STA-MAC harus sama dengan device_id, perangkat dinonaktifkan ditolak, rilis ditarik tidak disajikan, 120 permintaan per menit per IP, versi sama dengan x-ESP32-version: 304 tanpa isi; ditolak 403 butuh Basic Auth device_id:kunci, 403 kunci salah atau sudah dinonaktifkan, 403 x-ESP32-STA-MAC tidak ada, 404 firmware 9.9.9 tidak ada. 5, Node 1 1.7.0: url = alamat server tersimpan + /fw/node-1/versi.bin; https:// + bundel CA bawaan (berisi ISRG Root X1 dan X2): rantai + nama; http:// hanya ke IP rumah; SHA-256 berkas = sha256 perintah; versi di bawah 1.7.0 ditolak; bunyi: url bukan server rumah ini, http hanya untuk jaringan rumah, SHA-256 tidak cocok dengan perintah, versi di bawah 1.7.0 tidak punya rollback. Lalu masuk rak sebelah. Siapa mencoba (lab tiruan: simulator; 1.7.1 asli + berkas tiruan): orang asing tahu alamat /fw, kunci (403); papan lain atas nama Node 1, kunci + MAC (403); cmd update palsu ke server lain, Node 1 menolak, kunci tidak terkirim; berkas berubah satu bait, sidik SHA-256, rak lama tetap; penyadap, https, http hanya di WiFi rumah; akun perangkat lain membaca cmd Node 1, izin baca bawaan = tolak. Bawah: SHA-256 bukan tanda tangan, backend dan Node-RED boleh memerintah, hanya berkas di server rumah; tanda tangan digital di Bedah Teknis; HTTPS esp32 3.3.12 memeriksa rantai dan nama, tidak tanggal berlaku, jadi tidak menunggu jam internet (dari setelan paket; belum diuji penulis di papan).](aset/siapa-boleh-memberi-firmware.png)

> ⬆️ **Sudah membaca Konsep 1–6?** Lanjut ke [Praktik 1](#praktik-1--meja-kerja-cabang-sidik-jari-cadangan-dan-catatan-akun-10-menit) dan [Praktik 2](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit): server dulu, firmware belakangan. [Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota) sampai [Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason) baru dibutuhkan sebelum [Praktik 3](#praktik-3--akun-broker-otomatis-di-gerbang-pindah-akun-modul-21-dan-cadangan-akun-35-menit).

### 7. Armada: *canary*, "Perbarui semua", dan yang jujur tidak di-OTA

[Silabus](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak) menjanjikan kamu bisa memperbarui firmware "1 atau 100 perangkat tanpa menyentuhnya", dan [README proyek](../../proyek-rumah-pintar-mini/README.md#yang-akan-menyusul) menulis Modul 28 memperbarui firmware "untuk banyak perangkat sekaligus". Semua perangkatmu disebut **armada** (*fleet*), dan layarnya **Armada**. Satu tombol untuk banyak perangkat juga menyebarkan satu kesalahan ke semuanya sekaligus, jadi polanya: satu dulu, baru sisanya.

***Canary*: satu perangkat percobaan.** Dulu penambang membawa burung kenari (*canary*) ke dalam tambang sebagai peringatan dini: burung itu lebih dulu sakit bila ada gas beracun. Di armada, *canary* adalah perangkat yang diperbarui lebih dulu. Admin mencentang **Canary** di kartu perangkat ([7.2](#72--jadikan-node-1-canary-2-menit)), lalu memperbaruinya. Kalau firmware barunya gagal membuktikan diri, hanya *canary* itu yang kembali ke versi lama ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c)); perangkat lain tidak tersentuh.

**"Perbarui semua" terkunci sampai *canary* berhasil.** Tombol **Perbarui semua** di setiap rilis baru terbuka bila paling sedikit satu *canary* `berhasil` memakai versi itu dan tidak ada *canary* yang `gagal` atau `kembali ke versi lama (rollback)`. Sebelum itu tombolnya mati dengan alasan, misalnya `Terkunci: belum ada canary yang berhasil.`, dan server ikut menolak: Bruno `perbarui semua` dijawab `409` `belum ada perangkat canary yang berhasil memakai 1.7.1: perbarui canary dulu`. Kalau *canary* gagal, rilis itu tetap dihitung `terbaru` dan semua kartu menulis `perlu diperbarui` sampai rilisnya ditarik: tarik segera ([Konsep 5](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest)), lalu perbaiki dengan versi baru.

**Aturan yang dijaga server:**

- **Satu pembaruan berjalan per perangkat.** Database menolak pembaruan kedua selama yang pertama belum selesai, jadi perintah kedua dijawab `409`.
- **Hanya ke perangkat `online`, tidak diantre.** [Jembatan Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#9-jembatan-simpan-teruskan-siapa-menahan-apa) menahan data naik, tetapi tidak menahan `cmd` turun (aturan 13 Lampiran A): perintah yang terbit saat jalurnya putus hilang. Karena itu perangkat yang terputus atau sedang berhenti sengaja `dilewati` beserta alasannya, misalnya `perangkat sedang offline: perintah update hanya dikirim ke perangkat online (tidak diantre)`.
- **Kedaluwarsa.** Pembaruan tanpa kabar 10 menit (`OTA_BATAS_MENIT`) ditandai `kedaluwarsa`, tetapi laporan yang datang belakangan tetap menang: di lab penulis (batas dipendekkan menjadi 3 menit), laporan `gagal` (`padam saat mengunduh`) dari perangkat tiruan yang "padam" di tengah unduhan menimpa `kedaluwarsa`.
- **Laporan hilang, server menyimpulkan.** `vitals` (QoS 0) bisa hilang; bila Node 1 sudah melapor `fw` baru tanpa laporan `ota`, server menutup pembaruannya sendiri (`disimpulkan server: …`).

**"100 perangkat", jujur.** Pembaca kurikulum ini biasanya punya satu atau dua node WiFi. Pola *canary* lalu semua dibuktikan penulis dengan simulator: 22 perangkat tiruan sekaligus mengunduh dan memeriksa firmware asli 1.7.1 lewat HTTPS tiruan (tanpa menjalankannya), dan 22/22 `berhasil` dalam 6,3–8,1 detik (simulator di satu mesin, bukan ESP32 lewat WiFi). 100 perangkat tidak diukur. Dua batas terlihat dari lab dan kode: backend mengirim dua pesan Telegram per perangkat (`🔄` lalu `✅`; Telegram tiruan menerima 44 pesan untuk 22 perangkat tiruan), dan rute unduhan membatasi 120 permintaan per menit per alamat IP sehingga armada lebih dari 120 papan di balik satu router rumah sebagian ditolak `429` (`-104` di HTTPUpdate; dari kode, tidak diuji). Coba di [Praktik 9](#praktik-9--opsional-armada-perbarui-semua-perangkat-terputus-dan-kedaluwarsa-15-menit) (opsional); gelombang otomatis bertahap dengan rem darurat ada di [🧩 Tingkat 3](#tingkat-3--gelombang-otomatis-canary-tunggu-sehat-lalu-sisanya-bertahap-buat-dari-nol-45-menit).

**Node 2 jujur tidak di-OTA.** Node 2 "Kebun" tidak punya jalan OTA lewat HTTP: ia tidak pernah tersambung ke router dan sengaja tidak tahu sandi WiFi, hampir selalu tidur dalam (*deep sleep*), dan tidak punya penerima ESP-NOW (ia hanya mengirim). [🔬 Modul 14](../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md#-bedah-teknis-opsional) sudah menjelaskan kenapa OTA lewat ESP-NOW rumit. Jadi Node 2 tetap 1.0.0, dan ESP32 kedua di Kit A itu tetap tampil di **Armada**: kartunya menunjukkan versi dari paket ESP-NOW-nya dan `OTA tidak tersedia untuk Node 2: perbarui lewat kabel.` ([4.3](#43--layar-armada-ringkasan-kartu-kesehatan-rilis-firmware-dan-perangkat-baru-5-menit)), dan ia tidak pernah masuk daftar **Perbarui semua**. Itulah harga radio hemat daya: Node 2 bisa tidur hampir sepanjang waktu, tetapi pembaruannya lewat kabel. Rancangan OTA Node 2 ada di [🔬](#-bedah-teknis-opsional) lipatan *OTA Node 2 lewat "mode update"*.

![Diagram armada: satu dulu, baru semua (Konsep 7); canary = perangkat yang diperbarui lebih dulu, tombol Perbarui semua terkunci sampai satu canary berhasil. Atas, tiga langkah. 1, Unggah rilis: Unggah firmware Node 1 di /armada (admin), misalnya 1.7.1; rilis biasa boleh untuk banyak perangkat; rilis uji, misalnya 1.7.2, hanya lewat Perbarui di satu kartu perangkat. 2, Perbarui canary: hanya Node 1 bercentang Canary yang online; tunggu hasilnya berhasil; di daftar rilis: Canary: 1 berhasil, 0 gagal atau rollback. Gembok di antara 2 dan 3. 3, Perbarui semua: terbuka bila canary berhasil paling sedikit 1 dan gagal atau rollback 0; semua Node 1 online yang memenuhi syarat dikirimi sekaligus, yang lain dilewati, tidak diantre. Selama syarat belum terpenuhi tombol mati dan menulis Terkunci: belum ada canary yang berhasil. / Terkunci: ada canary yang gagal atau rollback. / Terkunci: rilis uji: hanya per perangkat. / Terkunci: rilis ditarik. Contoh Perbarui semua ke 1.7.1 (nama contoh, alasan persis): Node 1 ruang tamu, canary sudah 1.7.1, dilewati, perangkat sudah memakai 1.7.1; Node 1 garasi, online 1.7.0, dikirim, lalu berhasil atau rollback; papan ketiga, online 1.7.0, dikirim; Node 1 dapur, offline, dilewati, perangkat sedang offline: perintah update hanya dikirim ke perangkat online (tidak diantre); Node 1 teras, online tetapi pembaruan sebelumnya belum selesai, perangkat masih menjalankan pembaruan lain; papan yang hilang, dinonaktifkan, perangkat sudah dinonaktifkan (kuncinya dicabut); papan baru diklaim, belum kirim telemetry, jenis perangkat belum diketahui: tunggu telemetry pertamanya. Aturan armada: satu pembaruan berjalan per perangkat, perintah kedua 409; tanpa kabar 10 menit kedaluwarsa (tanpa kabar); turun versi hanya dengan centang Izinkan turun versi, versi di bawah 1.7.0 ditolak Node 1 sendiri (belum punya rollback); rilis uji 1.7.2 tidak dihitung rilis terbaru dan tidak pernah untuk semua; Node 2 tidak di-OTA, diperbarui lewat kabel. Lab tiruan penulis: 22 perangkat simulator semua berhasil dalam 6,3-8,1 detik, Telegram tiruan 44 pesan (2 per perangkat), 100 perangkat tidak diukur. Menyusul: gelombang otomatis bertahap dengan rem darurat = Tantangan T3.](aset/armada-canary.png)

### 8. Perangkat baru dalam 1 menit: identitas, kode klaim, dan akun broker otomatis

Cara Modul 21 menyiapkan perangkat butuh tiga langkah tangan: `POST /devices` di Bruno, kunci diketik di Serial Monitor, lalu `mosquitto_passwd` dan *restart* broker. Untuk "perangkat baru dalam 1 menit", apalagi di lokasi lain, itu terlalu banyak. Minggu ini **pendaftaran perangkat** (*provisioning*) berjalan sendiri: papan baru cukup diberi WiFi, sebuah kode, dan alamat server. (Di [Modul 26](../modul-26-docker-compose/README.md#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana), *provisioning* berarti memasang isi Grafana dari berkas: nama sama, urusan berbeda.)

**Identitas: `device_id` dari MAC.** Setiap ESP32 membawa alamat MAC WiFi dari pabrik. Node 1 membacanya dengan `esp_read_mac(…, ESP_MAC_WIFI_STA)` dan menulisnya sebagai 12 huruf heksadesimal kecil, misalnya `a4cf12e5b7c0` (contoh kontrak data): nama di topik, nama pengguna broker, dan identitas unduhan firmware (Konsep 6). Jangan memakai `ESP.getEfuseMac()` untuk ini: kalau angkanya dicetak, urutan baitnya terbalik.

**Kode klaim: seperti kode tiket.** Admin mengisi bagian **Perangkat baru** di layar **Armada** (nama, lokasi, masa berlaku 5–60 menit, bawaan 30), lalu menekan **Buat kode**. Hasilnya 8 huruf berbentuk `XXXX-XXXX`, misalnya `7K2M-QF9D` (contoh dokumentasi), dari angka dan huruf (abjad Crockford) tanpa I, L, O, dan U supaya tidak tertukar saat dibaca: 40 bit acak, sekitar satu triliun kemungkinan. Seperti kode tiket atau kode *booking*, ia sekali pakai, punya batas waktu, dan ditukar di loket (server) dengan barang sungguhannya: kunci perangkat. Kode hanya tampil **sekali**, dan database hanya menyimpan sidik jari SHA-256-nya. Jangan menyimpannya di catatan, tangkapan layar, atau Git.

**Menukar kode di loket.** Papan menukarnya sekali: `POST <alamat server>/api/provision/klaim` berisi kode dan `device_id`-nya.

| Jawaban | Artinya |
| :-- | :-- |
| `201` | terdaftar: kunci perangkat 43 huruf disimpan di NVS papan, seperti kunci Serial Modul 21; akun brokernya sudah dibuat |
| `403` | kode salah, kedaluwarsa, atau sudah dipakai: satu jawaban untuk ketiganya, supaya penebak tidak tahu kode mana yang pernah ada |
| `409` | `device_id` itu masih terdaftar dan aktif: identitas tidak bisa direbut, nonaktifkan dulu ([Konsep 10](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika)) |
| `429` | lebih dari 10 percobaan per menit dari satu alamat IP |
| `503` | database atau broker bermasalah; kode **tidak** hangus, dan papan mencoba paling banyak 3 kali, berjeda 30 detik |

Pendaftaran, tanda "kode terpakai", dan akun broker dikerjakan dalam satu transaksi: gagal di tengah, database tidak berubah dan kodenya masih berlaku. Inilah versi rumahan "sertifikat klaim" layanan IoT besar ([🔬 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-bedah-teknis-opsional), lipatan *Provisioning di industri*): sesuatu yang berumur pendek ditukar dengan identitas unik perangkat itu.

**Portal: tiga kolom di halaman WiFi.** Papan baru yang belum tahu WiFi membuka portal `Node1-Rumah`, portal WiFi seperti di hotel dari [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#5-portal-wifi-seperti-di-hotel-wifimanager). Halaman WiFi-nya kini punya tiga kolom tambahan: **Kode klaim** (hanya di RAM sampai ditukar, tidak pernah ke NVS), **Alamat server** (paling panjang 64 huruf, disimpan di NVS `alamat_server`; tempat klaim **dan** unduhan firmware, jadi harus persis `ALAMAT_SERVER` server rumah, [2.3](#23--berkas-infrastruktur-dan-env-mesin-pusat-mosquitto_dynsec_password-dan-alamat_server-6-menit)), dan **Alamat broker** (IP gerbang Pi, atau laptop di jalur tanpa Pi; NVS `alamat_broker`). Sesudah **Save** dan WiFi tersambung, papan menukar kodenya, menyimpan kuncinya, masuk ke broker, lalu tampil `Online` di **Armada** dengan nama dan lokasi dari kode ([Praktik 10](#praktik-10--perangkat-baru-dalam-1-menit-kode-klaim-dan-portal-30-menit)). Tanpa portal (misalnya di Wokwi), ketik `klaim <kode> [server] [broker]` di Serial Monitor.

**Portal bersandi.** Portal Modul 10 terbuka tanpa sandi, dan alamat `192.168.4.1/update` bawaan WiFiManager tetap aktif walau tombol **Update**-nya disembunyikan ([Modul 10 ➕ D](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#d-verify-upload-dan-sambungkan-ke-wifi)): selama portal terbuka, siapa pun di dekat papan bisa mengunggah firmware lewat situ. Karena portal kini lebih sering dibuka, firmware 1.7.0 memasang sandi bila `kunci.h` berisi `#define SANDI_PORTAL "…"` (8–63 huruf, aturan sandi WiFi WPA2; tulis juga di label kotak): HP harus memasukkan sandi itu untuk bergabung ke WiFi `Node1-Rumah`, jadi hanya pemegang sandi yang bisa mencapai `192.168.4.1`, termasuk `/update` ([5.2](#52--portal-bersandi-sandi_portal-di-kuncih-3-menit)).

Di lab penulis (simulator lewat HTTPS tiruan), penukaran kode selesai dalam 256–309 ms, dan kartu `Online` dengan versi 1.7.0 muncul 3,8–6,7 detik sesudah simulator dijalankan. Dengan papan dan HP sungguhan, lamanya belum diukur penulis: *stopwatch*-mu di 10.4 yang pertama mengukurnya. Siklus hidup perangkat: klaim → aktif (`online`, `offline`, atau berhenti sengaja) → **Nonaktifkan** bila hilang atau dicuri ([Konsep 10](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika)) → hidup lagi hanya dengan kode klaim baru atau kunci baru dari admin.

![Diagram klaim satu menit (Konsep 8 dan 10): papan baru tanpa mengetik kunci; kode klaim sekali pakai ditukar dengan kunci perangkat. Enam langkah. 1 Admin: Buat kode klaim di /armada, nama + lokasi (tidak wajib), berlaku 5-60 menit (bawaan 30), kode XXXX-XXXX tampil sekali, server hanya menyimpan SHA-256-nya. 2 Papan baru menyala tanpa WiFi: portal WiFi sementara Node1-Rumah (bersandi bila SANDI_PORTAL diisi), buka 192.168.4.1 dari HP; papan sudah diisi firmware 1.7.0 lewat kabel. 3 Halaman WiFi + tiga kolom: Kode klaim (tidak disimpan), Alamat server ke NVS alamat_server, Alamat broker ke NVS (isinya IP Pi gerbang), lalu Save; tanpa portal: Serial klaim. 4 Menukar kode, sekali: POST alamat server/api/provision/klaim dengan kode dan device_id; device_id = alamat MAC WiFi, 12 huruf heksadesimal. 5 Server, satu transaksi: kode berlaku dan belum dipakai, daftarkan perangkat, tandai kode terpakai, buat akun broker, 201; kunci 43 huruf ke NVS, tidak dicetak. 6 Papan masuk dengan kunci barunya, online di /armada dengan nama dan lokasi dari kode; lab simulator klaim 256-309 ms. Jawaban server: 201 terdaftar, kunci + akun broker dibuat; 403 kode salah, kedaluwarsa, atau sudah dipakai (satu jawaban); 409 perangkat masih terdaftar dan aktif, nonaktifkan dulu; 429 lebih dari 10 percobaan per menit dari satu IP; 503 server atau broker bermasalah, kode tidak hangus, papan mengirim paling banyak 3 kali, berjeda 30 detik. Satu menit = target untuk papan + HP sungguhan, belum diukur penulis (lab: simulator, kartu Online 1.7.0 3,8-6,7 detik sesudah dijalankan). Bawah, siklus hidup (Konsep 10): Klaim (kode klaim atau registrasi Modul 21), Aktif (online, offline, berhenti sengaja), Nonaktifkan (tombol admin di /armada), Hidup lagi (kode klaim baru atau kunci baru dari admin, kembali ke Aktif). Saat Nonaktifkan: broker menghapus akunnya, papan langsung diputus (administrative action); server menulis status offline (wasiat tidak terbit); kunci dicabut, config retained dihapus, perintah dan pembaruan 409; lab 200 dalam 0,18 detik (tiruan), papan sungguhan belum diuji. Jujur sesudahnya: status retained online lama tertinggal di broker (diabaikan backend); Grafana mengirim kabar palsu kembali mengirim data ±4,5 menit kemudian (lab): pasang silence sebelum Nonaktifkan; kunci di NVS papan curian tetap terbaca (flash encryption, Bedah Teknis Modul 21).](aset/klaim-satu-menit.png)

**Akun broker yang dibuat backend: *dynamic security*.** Di Modul 21, penjaga pintu broker membaca akun perangkat dari berkas sandi, dan backend tidak bisa menulis berkas itu. Mosquitto 2.1.2 di image kita sudah membawa plugin ***dynamic security***: buku akun broker yang bisa ditulis backend sambil broker menyala, lewat surat perintah JSON di topik kontrol `$CONTROL/dynamic-security/v1`. Backend mengirim `createClient` saat registrasi, klaim, atau ganti kunci, dan `deleteClient` saat **Nonaktifkan**: akun baru langsung berlaku tanpa *restart*, akun yang dihapus langsung diputus. Semboyannya: **akun layanan di berkas sandi, akun perangkat di *dynamic security***. Akun layanan (`backend`, `jembatan-pi`, `pemantau`, …) tetap di berkas sandi; akun lama Modul 21 dipindah di [3.4](#34--pindah-akun-lama-modul-21-ganti-kunci-kunci-baru-di-serial-mosquitto_passwd--d-lalu-restart-10-menit).

Izin topiknya tetap pola `%u` di `acl-broker` Modul 21: perangkat hanya menulis topiknya sendiri dan hanya membaca `cmd` miliknya. Bawaan plugin sebenarnya mengizinkan akun tanpa peran **membaca** apa saja, jadi sebelum setiap `createClient` backend mengirim `setDefaultACLAccess` yang mengubah bawaan baca itu menjadi tolak. Di lab penulis, akun perangkat latihan yang berlangganan `rpm/#` dan `$SYS/#` selama 20 detik tidak menerima satu pun pesan perangkat lain ([3.3](#33--akun-perangkat-hanya-membaca-cmd-miliknya-4-menit)). Setelan backend `AKUN_BROKER_OTOMATIS` memilih brokernya: `pusat` (jalur tanpa Pi), `gerbang:pi1` (jalur utama dan gratis), atau `mati` (akun dibuat tangan seperti Modul 21).

**Perangkat di balik gerbang: surat perintah dititipkan jembatan.** Di jalur utama, Node 1 masuk ke broker gerbang Pi, sedangkan backend tinggal di VPS dan tidak bisa menghubungi Pi di balik router rumah. Jembatan Modul 27 sudah tersambung dari Pi ke VPS, jadi backend menulis perintahnya di broker pusat pada topik `rpm-gerbang/pi1/dynamic-security/v1`, dan dua baris *remap* di `edge/jembatan/pusat.conf` (salinan [`jembatan.contoh.conf`](kode/edge/jembatan.contoh.conf)) memindahkannya ke topik kontrol gerbang, lalu membawa jawabannya pulang:

```text
topic dynamic-security/v1 in 1 $CONTROL/ rpm-gerbang/pi1/
topic dynamic-security/v1/response out 1 $CONTROL/ rpm-gerbang/pi1/
```

Nama gerbang `pi1` tertulis di tiga tempat: `AKUN_BROKER_OTOMATIS=gerbang:pi1` di `.env` pusat, dua baris ini, dan izin akun `jembatan-pi` di `acl-broker`. Unduhan firmware dan klaim tidak lewat jembatan (Konsep 6). Di lab penulis (jembatan TLS tiruan), mendaftarkan perangkat lewat jembatan dijawab `201` dalam 154–312 ms ([3.2](#32--perangkat-latihan-akun-brokernya-dibuat-otomatis-di-broker-gerbang-pi1-8-menit)).

**Tanpa jawaban 3 detik.** Backend mencoba sekali lagi, lalu menjawab `503`, dan database tidak berubah. Namun, perintah yang sempat terkirim bisa tertahan di jembatan yang macet sebentar, lalu dikerjakan gerbang begitu pulih: di lab penulis, **Nonaktifkan** yang dijawab `503` saat internet rumah dicabut tetap dikerjakan gerbang sesudah internet tersambung lagi. Karena itu kalimat `503` selain klaim diakhiri `… ulangi langkah ini sebentar lagi supaya database dan broker sama lagi`, dan mengulanginya aman. Ini juga alasan urutan pasang: jangan mendaftarkan atau mengklaim perangkat baru sebelum gerbang naik di [Praktik 3](#praktik-3--akun-broker-otomatis-di-gerbang-pindah-akun-modul-21-dan-cadangan-akun-35-menit); sampai saat itu backend menjawab `503`.

**"Siapa yang boleh menyuruh backend membuatnya?"** [🧩 Tingkat 3 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#tingkat-3--backend-membuat-berkas-sandi-broker-sendiri-6090-menit) ditutup dengan pertanyaan itu: backend yang bisa membuat akun broker memegang "kunci induk" seluruh broker. Jawaban Modul 28:

1. Hanya akun `backend` yang boleh menulis topik kontrol (empat baris baru di blok 3 `acl-broker`), dan jembatan hanya membawa perintah untuk `pi1`. Jangan pernah memberi izin itu, atau `topic #`, ke akun lain.
2. Perangkat tidak bisa mendaftarkan dirinya sendiri: ia butuh kode klaim, dan kode hanya dibuat admin, sekali pakai, berumur pendek.
3. Akun `backend` yang bocor = kendali atas semua perangkat, sama seperti sejak Modul 19. Jaga `.env`-nya.
4. Kunci induk sungguhan buku akun itu adalah sandi akun `admin` plugin, `MOSQUITTO_DYNSEC_PASSWORD` (di `.env` pusat dan `edge/.env`, berbeda). Akun `admin` hanya dipakai untuk memeriksa (3.3), tetapi pemegang sandinya bisa membuat akun apa saja dan membaca semua pesan. Tanpa variabel itu, plugin membuat sandinya sendiri **dan** akun contoh `democlient` yang boleh menerbitkan dan berlangganan `#` (lab penulis), karena itu Compose menolak menyala tanpanya. Rahasia acak, minimal 12 huruf, tidak masuk Git.

![Diagram perangkat di balik gerbang (Konsep 8), jalur utama: akun broker perangkat dibuat backend di VPS tetapi tinggal di broker gerbang Pi. Kiri, Rumah (router tanpa port forwarding): Node 1 1.7.0 dan papan ketiga (hasil klaim) ke broker gerbang pi1, 192.168.1.37:1883; akun perangkat dibuat backend (dynamic security); akun layanan dan akun lama Modul 21 di password_file; perangkat hanya membaca rpm/id/cmd miliknya. Router rumah: sambungan KELUAR, tidak ada pintu dibuka. Tengah: jembatan TLS 8883, data naik, perintah akun turun. Kanan, VPS: broker pusat (8883 TLS, menerima perintah akun di rpm-gerbang/pi1/…), backend 1.5.0 (AKUN_BROKER_OTOMATIS=gerbang:pi1; klaim, registrasi, ganti kunci, Nonaktifkan = createClient atau deleteClient), Caddy HTTPS 443 (/fw/* dan /api/provision/klaim ke backend; ALAMAT_SERVER di .env, sama dengan yang diketik di portal papan). Panah router ke Caddy: unduhan firmware + klaim, HTTPS langsung ke VPS, tidak lewat jembatan. Empat langkah: 1 backend menerbitkan setDefaultACLAccess lalu createClient di pusat, topik rpm-gerbang/pi1/dynamic-security/v1; 2 jembatan membawanya ke gerbang menjadi $CONTROL/dynamic-security/v1, plugin membuat akun; 3 jawaban …/response naik ke backend, 201; 4 tanpa jawaban 3 detik: sekali lagi, lalu 503; database tidak berubah, perintah yang sempat terkirim bisa tetap dikerjakan saat jembatan pulih. Remap di jembatan/pusat.conf: topic dynamic-security/v1 in 1 $CONTROL/ rpm-gerbang/pi1/ dan baris …/response out 1 yang sama. Lab tiruan: daftar 201 0,15-0,31 s, Nonaktifkan 0,18 s. Tabel .env ALAMAT_SERVER dan AKUN_BROKER_OTOMATIS: laptop tanpa Pi http://192.168.1.10, pusat; laptop + Pi sama, gerbang:pi1; VPS https://iot.namaanda.my.id, gerbang:pi1; Pi gratis http://192.168.1.37, gerbang:pi1; PINTU_WEB_DALAM kosong (= 80), Pi 8081 di dalam kontainer; di portal Alamat server = ALAMAT_SERVER persis, tanpa :8081; Alamat broker = IP gerbang atau laptop. Jalur gratis: pusat juga di Pi (1884); papan mengetuk http://192.168.1.37, port 80 Pi diteruskan ke pintu perangkat 8081: hanya /fw/* dan klaim, tanpa dashboard, tanpa percaya X-Forwarded-For; dashboard lewat terowongan Cloudflare, unduhan tidak. Bawah, pindah akun Modul 21: ganti kunci lewat Bruno (POST /devices/id/kunci, tanpa tombol dashboard), kunci isi di Serial segera, mosquitto_passwd -D, restart gerbang bukan HUP; tanpa langkah 3 kunci lama hidup lagi.](aset/perangkat-di-balik-gerbang.png)

### 9. Konfigurasi jarak jauh dan kesehatan perangkat: jeda `vitals` dan `reset_reason`

Node 1 di atap tidak bisa ditanya lewat Serial Monitor. Dari jauh, kamu perlu **mengubah setelannya** tanpa memanjat dan **tahu kabarnya**: sehat, atau diam-diam sering menyala ulang? [Silabus](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak) menjanjikan keduanya: konfigurasi jarak jauh lewat `cmd` *retained*, alasan menyala ulang di `vitals`, dan kesehatan setiap perangkat di halaman `/armada`.

**Satu pesan *retained* untuk semua setelan.** Sejak [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang), server mengirim ambang pengaman lokal lewat perintah `config` dengan QoS 1 dan tanda *retained*: broker menyimpannya, jadi Node 1 yang baru menyala langsung menerimanya begitu berlangganan `cmd`. Kontrak 1.6 menambah satu kunci, `jeda`. Di `cmd`, hanya `config` yang *retained* (`set` dan `update` tidak pernah), dan satu topik hanya punya **satu** pesan *retained* (aturan 10), jadi ambang dari aturan kipas dan jeda yang diatur admin digabung dalam satu `config`. Contoh dari bagian 7 [`KONTRAK-DATA.md`](kode/KONTRAK-DATA.md):

```json
{"id":"c-20261031-061500-4","ts":"2026-10-31T06:15:00Z","aksi":"config","ambang":{"suhu_kipas_on":30},"jeda":{"vitals_s":60}}
```

Aturannya sama dengan ambang Modul 19: Node 1 memeriksa semua kunci dulu, dan satu kunci asing atau angka di luar rentang membuat seluruh perintah ditolak (`ok:false`). Kunci yang tidak dikirim tidak berubah; yang sah disimpan di NVS (label `jeda_vitals`), jadi tetap berlaku sesudah listrik padam. Server menerbitkan ulang `config` setiap kali tersambung ke broker dan setiap kali isinya berubah.

**"Interval" di Silabus = jeda `vitals`.** `telemetry` tetap setiap 10 detik (aturan 3), karena dua penjaga bergantung padanya: label `data basi` Modul 23 dan *alert* "Node diam" Modul 25. Yang diatur dari jauh hanya **jeda `vitals`**: 60–3600 detik, bawaan 300 (5 menit); 60 detik berguna selama uji 24 jam di kotak. Silabus v1.0.30 mencatatnya: "(jeda `vitals` dan ambang; jeda `telemetry` tetap 10 detik; WiFi dan alamat server tidak bisa diubah dari jauh)". Admin mengubahnya di kartu: **Pengaturan lain** → **Jeda vitals (detik, 60-3600)** → **Simpan jeda** ([11.1](#111--jeda-vitals-60-detik-lewat-pengaturan-lain-5-menit)). Firmware 1.6.0 belum mengenal `jeda` dan mengabaikannya (`config` yang hanya berisi `jeda` dijawabnya `ok:false`); setelannya tetap tersimpan di server dan berlaku begitu Node 1 memakai 1.7.0.

**Yang sengaja tidak bisa diubah dari jauh:** WiFi, alamat server, alamat broker, dan kunci perangkat; semuanya hanya lewat portal WiFi, Serial, atau kode klaim. `config` tidak punya masa uji seperti firmware ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c)): satu alamat broker yang salah membuat Node 1 tak terjangkau, jadi tak bisa dibetulkan dari jauh; perangkat "yatim" itu harus didatangi.

**Kabar kesehatan: `vitals` 1.6.** Node 1 mengirim `vitals` sekali sesudah tersambung, lalu setiap jeda tadi. Isinya sejak [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#5-kontrak-data-lima-topik-dan-satu-bentuk-json-untuk-semua): sinyal WiFi (`rssi`), lama menyala (`uptime_s`), dan RAM bebas (`heap_free`). Mulai firmware 1.7.0, dua kolom wajib ikut: `reset_reason` (alasan terakhir kali menyala) dan `fw` (versi yang sedang berjalan), ditambah laporan `ota` bila ada pembaruan yang baru selesai. Contoh bagian 6 kontrak (keadaan di Praktik 8):

```json
{"ts":"2026-10-31T01:04:54Z","rssi":-58,"uptime_s":7,"heap_free":181940,"reset_reason":"SW","fw":"1.7.1","ota":{"id":"c-20261031-010312-3","hasil":"rollback","versi":"1.7.2","pesan":"tidak tersambung ke broker dalam 60 detik"}}
```

`fw` = versi yang berjalan (1.7.1), `ota.versi` = versi yang dicoba (1.7.2). Dengan kolom baru ini, `vitals` terpanjang menjadi 402 dari 512 byte paket MQTT (dihitung penulis di uji host), masih muat di wadah `setBufferSize(512)` Node 1.

**`reset_reason`: tujuh kata, masing-masing satu arti.** Fungsi `alasanReset()` dari Modul 5, yang menjawab `WDT` sesudah *watchdog* Modul 8 bekerja, kini mengisi kolom ini dengan salah satu dari tujuh nilai [Lampiran A](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini):

| Nilai | Artinya | Warna di kartu | Yang kamu lakukan |
| :-- | :-- | :-- | :-- |
| `POWERON` | listrik baru masuk, atau tombol EN ditekan | abu-abu | wajar sesudah pemasangan atau listrik padam |
| `BROWNOUT` | tegangan ESP32 sempat anjlok | kuning | periksa catu daya dan kabelnya: beban (relay, pompa, servo) dari MB102, tidak pernah dari pin ESP32, dan GND disatukan |
| `SW` | dinyalakan ulang program: pembaruan, *rollback*, atau perintah `restart` | biru | baca **Pembaruan terakhir** di kartu yang sama |
| `PANIC` | program mogok | merah | firmware bermasalah: catat versinya, perbaiki dengan versi berikutnya |
| `WDT` | program macet, *watchdog* me-*restart*-nya | merah | sama dengan `PANIC` |
| `DEEPSLEEP` | bangun dari tidur dalam | abu-abu | tidak terjadi di Node 1, yang tidak pernah tidur |
| `UNKNOWN` | alasan lain | abu-abu | jarang; amati apakah berulang |

Pembaruan yang berhasil dan *rollback* karena masa uji habis sama-sama `SW`; karena itu laporan `ota` (`berhasil`, `rollback`, atau `gagal`, versi, dan pesan paling panjang 80 huruf) ikut di paling banyak 3 `vitals` (Konsep 3). *Rollback* karena firmware baru mogok atau macet tercatat `PANIC` atau `WDT` (menurut kode; belum diuji penulis di papan). [🔬 Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#-bedah-teknis-opsional) menjanjikan alasan menyala ulang dikirim ke server "supaya *brownout* yang terjadi diam-diam di rumah tetap ketahuan"; kini ia tampil di kartu, dan bukti 24 jam di kotak ([13.2](#132--k1-e-24-jam-menyala-tanpa-brownout-panic-atau-wdt-5-menit)) membacanya.

**Kartu di layar Armada** ([4.3](#43--layar-armada-ringkasan-kartu-kesehatan-rilis-firmware-dan-perangkat-baru-5-menit)) menampilkan **Versi firmware** (ditambah `→ <versi terbaru>` bila lencananya `perlu diperbarui`), **Menyala ulang karena** (nilai dan artinya; selama Node 1 masih 1.6.0: `— (firmware lama belum melaporkan)`), **Sinyal WiFi** dengan kategori tabel RSSI [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#2-wifi-untuk-esp32-hanya-24-ghz-dan-kuat-lemahnya-sinyal) (misalnya `-58 dBm (kuat)`), **RAM** (KB bebas), **Lama menyala**, kalimat `Kesehatan dari vitals terakhir, …; vitals dikirim setiap 300 detik (bawaan firmware).` (atau `60 detik (diatur admin)`), dan **Pembaruan terakhir**. Kartu Node 2 menulis `Node 2 tidak mengirim vitals`.

**Tidak semuanya *live*.** Status, versi dari `telemetry`, dan kemajuan pembaruan berubah sendiri lewat Socket.IO, tanpa *polling*; angka kesehatan diambil ulang hanya saat server mengabarkan sesuatu (pembaruan selesai, perangkat baru, atau dinonaktifkan) atau saat halaman dimuat ulang.

**"Terakhir dilihat" kini dari data.** Di Modul 25, `terakhir_dilihat` ikut maju oleh pesan `status` apa pun, juga `offline`, sehingga Kebun yang 16 menit diam tertulis "0 menit yang lalu" (perbaikannya dicatat untuk Modul 28 dan 30). Backend 1.5.0 hanya memajukannya saat `telemetry` atau `vitals` tiba: di lab penulis, perangkat tiruan yang dinonaktifkan tetap menunjuk kiriman data terakhirnya.

> ⬆️ **Sudah membaca Konsep 7–9?** Lanjut ke [Praktik 3](#praktik-3--akun-broker-otomatis-di-gerbang-pindah-akun-modul-21-dan-cadangan-akun-35-menit) (akun broker otomatis di gerbang, memakai Konsep 8), lalu [Praktik 4](#praktik-4--dashboard-140-dan-layar-armada-dengan-perangkat-tiruan-25-menit) (layar Armada, memakai Konsep 7 dan 9). [Konsep 10](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika) baru dibutuhkan sebelum [Praktik 11](#praktik-11--jeda-vitals-dari-jauh-dan-menonaktifkan-perangkat-hilang-20-menit), dan [Konsep 11](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v) sebelum [Praktik 12](#praktik-12--dari-breadboard-ke-kotak-90-menit-butuh-papan-jalur-solder-ditambah-60-menit).

### 10. Menonaktifkan perangkat hilang: dari mencabut kunci ke putus seketika

Papan bisa hilang, dicuri, atau dipensiunkan; selama kuncinya berlaku, pemegangnya bisa masuk ke broker atas nama perangkatmu. [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#9-mencabut-kunci-perangkat-yang-hilang) mencabut kunci dalam dua lapis: backend seketika (`POST /devices/:id/cabut`: kirimannya diabaikan, perintahnya dijawab `409`), sedangkan broker baru menolaknya sesudah `mosquitto_passwd -D` dan muat ulang di mesin broker.

**Nonaktifkan: satu tombol untuk semua lapis.** Admin menekan **Pengaturan lain** → **Nonaktifkan** → **Ya, nonaktifkan** di kartu perangkat ([11.3](#113--nonaktifkan-papan-ketiga-akun-brokernya-dihapus-putus-seketika-6-menit)). Rutenya tetap `POST /devices/:id/cabut`, tetapi kini mengerjakan empat hal sekaligus:

1. **Kunci dicabut** seperti Modul 21: kiriman perangkat itu diabaikan, perintah dan **Perbarui** dijawab `409`, dan unduhan firmware dengan kunci lamanya `403`.
2. **Akun brokernya dihapus** (`deleteClient`, Konsep 8): broker langsung memutusnya (`… disconnected: administrative action.`) dan menolak setiap percobaan berikutnya, tanpa `mosquitto_passwd` dan tanpa *restart*.
3. **Status `offline` ditulis server**, karena broker tidak menerbitkan wasiat untuk sambungan yang diputus begini (tanpa itu, kartunya tetap `Online`). Lencananya kini `nonaktif`.
4. **`config` *retained*-nya dihapus**, kabar Telegram yang menunggu untuk perangkat itu dibatalkan, dan buku kejadian mencatat `dicabut`.

Di lab penulis (perangkat tiruan di balik jembatan TLS tiruan), rute ini dijawab `200` dalam 140–180 ms, lalu simulator `DITOLAK broker (kode 5)`. Perangkat itu hidup lagi hanya dengan kunci baru dari admin atau kode klaim baru ([11.5](#115-klaim-ulang-dengan-kode-baru-4-menit)). Gerbang sedang tak terjangkau? Jawabannya `503`: ulangi sebentar lagi (Konsep 8); jawaban `"akun_broker": "tidak-ada"` pada percobaan ulang itu wajar.

**Janji I8, dan sisa yang jujur.** Tabel OWASP IoT di [Konsep 10 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos) menulis I8 (*Lack of Device Management*) "pengelolaan banyak perangkat di Modul 28": layar **Armada**, kode klaim, dan **Nonaktifkan** jawabannya. Yang tertinggal:

- **Status *retained* `online` lama** tetap di broker, karena akun `backend` tidak boleh menulis topik `status`. Backend mengabaikannya; kartunya tetap `nonaktif`.
- **Kunci di NVS papan curian** tetap terbaca oleh orang yang membongkarnya (*flash encryption* hanya di [🔬 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-bedah-teknis-opsional)), tetapi tidak berguna lagi: akunnya sudah dihapus.
- **Akun lama Modul 21 di berkas sandi.** Selama akun *dynamic security* ada, kunci LAMA ditolak (plugin dibaca lebih dulu); begitu **Nonaktifkan** menghapusnya, baris lama berlaku lagi. Di lab penulis, perangkat tiruan berakun berkas sandi tetap diterima sesudah **Nonaktifkan** (`akun_broker` `tidak-ada`) sampai `mosquitto_passwd -D` dan *restart* broker. Itulah sebabnya `-D` di [3.4](#34--pindah-akun-lama-modul-21-ganti-kunci-kunci-baru-di-serial-mosquitto_passwd--d-lalu-restart-10-menit) wajib dan diingatkan kotak `Sesudah menonaktifkan:` (aman diulang; abaikan bila perangkatnya tidak pernah berakun Modul 21).

**Kabar Grafana yang menyesatkan.** *Alert* "Node diam" [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline) hanya membaca perangkat terdaftar yang belum dicabut. Perangkat hilang biasanya sedang 🔴; begitu dinonaktifkan, barisnya hilang dari kueri, dan Grafana mengabarkan `✅ <nama> kembali mengirim data.`, padahal artinya "tidak lagi dipantau". Di lab penulis (Grafana 13.2.4, Telegram tiruan), kabar palsu itu tiba 4 menit 36 detik sesudah **Nonaktifkan**; dengan pembungkam kabar (*silence*) untuk `device_id`-nya (**Alerting → Silences**, [11.2](#112--buat-silence-untuk-alert-node-diam-di-grafana-sebelum-menonaktifkan-3-menit)), tidak ada kabar selama 9 menit pengamatan. Aturannya sengaja tidak diubah: perbaikannya di [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data).

**Berhenti sengaja bukan putus.** Status `offline-mode` "disimpan untuk Modul 28" sejak [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang) dan diberi lencana netral di [Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi); kini lencananya `berhenti sengaja`, biru langit (bukan gangguan; Konsep 3). Telegram backend memberinya kalimat sendiri, bukan `📴` palsu: `🔄 <id> berhenti sengaja (pembaruan firmware atau restart), sebentar lagi online kembali`, lalu `✅ <id> online lagi sesudah berhenti sengaja (<n> detik)`, atau `📴 <id> tidak kembali sesudah berhenti sengaja sejak HH.MM WIB` bila 3 menit berlalu tanpa `online`. Tenggang itu lebih panjang dari 60 detik untuk `offline` biasa, karena *rollback* makan masa uji 60 detik plus menyala ulang (simulator: ±70 detik). Laporan harian pun tidak menghitungnya sebagai `kali_terputus`.

> ⬆️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 11](#praktik-11--jeda-vitals-dari-jauh-dan-menonaktifkan-perangkat-hilang-20-menit): jeda `vitals` dari jauh, lalu menonaktifkan papan ketiga yang kamu daftarkan di [Praktik 10](#praktik-10--perangkat-baru-dalam-1-menit-kode-klaim-dan-portal-30-menit). Kalau kamu membacanya lebih awal, kembalilah ke praktik yang sedang kamu kerjakan.

### 11. Dari breadboard ke kotak: terminal sekrup, catu daya Modul 9, dan tanpa 220 V

Breadboard enak untuk mencoba, bukan untuk menetap: pegasnya mengendur, kabel jumper tercabut bila tersenggol, getaran pompa dan kipas menggoyang kaki komponen, dan debu masuk ke lubang terbuka. Sambungan kendor jarang langsung mematikan papan; yang lebih sering bacaan aneh sesekali atau relay yang kadang tidak menurut, gangguan yang paling sulit dicari dari jauh. Sejak Praktik 7, Node 1 diperbarui tanpa kabel USB, jadi kotaknya boleh ditutup.

**Pin dan firmware tidak berubah.** Peta pin dijanjikan "tidak berubah sampai Modul 28" ([Silabus §2.1](../../SILABUS.md#21-dua-perangkat-dua-peran-ditetapkan-sejak-awal-agar-tidak-berubah-ubah), [Konsep 3 Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#3-anggaran-pin-dan-peta-pin-kanonik-node-1-dan-node-2)): pin, rel daya, dan firmware tetap; yang pindah hanya cara menyambung, dari lubang breadboard ke terminal sekrup. [`PETA-PIN.md`](kode/PETA-PIN.md) versi 7 mencatatnya di bagian baru "Node 1 di dalam kotak", dan Silabus v1.0.30 mencatat bunyi barunya: peta pin "tidak berubah; di Modul 28 sambungannya pindah dari breadboard ke kotak". Node 2 tetap di [wadahnya dari Modul 14](../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md#a-siapkan-node-2-untuk-tempat-tetapnya).

**Jalur utama tanpa solder: papan ekspansi terminal sekrup.** Papan ini sudah disebut di [🔬 Modul 2](../../fase-0-fondasi/modul-02-listrik-dan-unggah-pertama/README.md#-bedah-teknis-opsional) (lipatan *Kalau papanmu menutup semua lubang …*) dan [🚨 Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#-kalau-tidak-jalan) (lipatan *Strip rel breadboard tidak bisa dilepas …*). DevKit ditancapkan ke dua deret lubangnya, dan setiap pin diteruskan ke satu **terminal sekrup** yang menjepit kabel dengan pelat logam: tidak ada pegas yang mengendur. Sebelum membeli, cocokkan dua hal:

1. **Ukuran.** Peta pin kita hanya untuk DevKit V1 30 pin, 15 kaki per sisi ([Konsep 1 Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#1-anatomi-papan-esp32-devkit-v1-pin-mana-saja-yang-kamu-punya)); papan ekspansi untuk 38 pin tidak cocok, dan jarak dua deret kaki pun tidak seragam antarpabrik (Modul 2). Jangan percaya angka "standar": ukur jaraknya di DevKit-mu dengan penggaris, lalu cocokkan dengan foto atau ukuran dari penjual ([12.1](#121--cocokkan-papan-ekspansi-dengan-devkit-mu-ukur-jarak-dua-baris-pin-5-menit)).
2. **Tulisan di terminal**, nomor GPIO (`32`) atau nama D (`D32`): cocokkan dengan kolom pertama tabel Node 1 di `PETA-PIN.md`.

Colokan DC dan regulator papan ekspansi **tidak dipakai**: spesifikasinya sering tidak dicantumkan penjual.

Belum ada foto berlisensi bebas untuk papan ini; contoh bentuk terminal sekrup, termasuk yang menempel di papan, ada di [artikel *Screw terminal* di Wikipedia](https://en.wikipedia.org/wiki/Screw_terminal).

**Rangkaian kecil tetap butuh tempat.** Papan ekspansi tidak punya tempat untuk resistor, kapasitor, atau MOSFET, padahal Node 1 punya rangkaian kecil: pembagi tegangan ECHO HC-SR04 dan pembagi LDR (Modul 6), MOSFET pompa dengan resistor dan dioda *flyback*-nya (Modul 5), dan pembagi RO modul RS-485 (Modul 15, bila dipakai). Jalur utama menaruhnya di **breadboard mini berperekat** di dalam kotak. Jujur saja, itu tetap sambungan gesek, hanya lebih pendek dan terlindung. Yang ingin permanen menyoldernya di **perfboard** (papan berlubang untuk disolder), jalur pilihan di [12.5](#125-rangkaian-kecil-di-breadboard-mini-berperekat-10-menit).

**Kabel yang tidak kendor.** Ke terminal sekrup, pakai **kabel tunggal** (satu kawat padat) 22 AWG: kupas secukupnya, masukkan, lalu kencangkan tanpa menjepit isolasinya. Kabel serabut mudah mekar dan lepas di bawah sekrup; kalau terpaksa memakainya, beri ujungnya ***ferrule*** (selongsong logam yang dijepit tang khusus; opsional). Ikat setiap kabel yang keluar-masuk kotak dengan pengikat kabel di dekat lubangnya: itulah **penahan tarikan** (*strain relief*), supaya tarikan dari luar ditahan pengikat, bukan sekrup.

**Catu daya: susunan Modul 9, dipindah apa adanya.** "Catu daya sendiri" bukan sumber baru: susunan [➕ A Modul 9](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md#a-node-1-permanen-dari-adaptor-lalu-uji-24-jam) ikut masuk kotak, yaitu *charger* HP 5 V (minimal 1 A) ke USB papan lewat kabel berlabel **ESP32**, dan adaptor 5 V 2 A ke MB102 lewat kabel berlabel **MB102**. **Aturan emas catu daya** tetap berlaku: beban (relay, kipas, pompa, servo) selalu dari MB102, tidak pernah dari pin VIN atau 3V3 ESP32; semua GND disatukan; USB papan dulu, baru MB102. Kepala *charger* dan adaptor tetap di stopkontak **di luar** kotak; yang masuk hanya kabel 5 V-nya.

**Tanpa 220 V, tanpa kecuali.** [Silabus](../../SILABUS.md#2-gambaran-besar-apa-yang-akan-kita-bangun) berjanji kurikulum ini **tidak pernah** menyambungkan apa pun ke listrik PLN 220 V. Kotak menggoda: "sekalian relay-nya untuk lampu rumah", atau "pakai modul AC-DC 220 V supaya cukup satu kabel". Jangan. Di dalam kotak tidak ada kabel PLN, tidak ada modul AC-DC, dan relay hanya untuk beban 5 V proyek ini.

**Tata letak: sensor harus melihat dan bernapas.**

- **DHT22** di luar kotak, jauh dari ESP32 dan regulator: panas dari dalam kotak ikut memanaskan sensor sehingga yang terbaca suhu kotak, bukan suhu ruangan.
- **PIR** dan **LDR** menembus dinding, menghadap ruangan; **HC-SR04** tetap di atas tandon; **sensor tanah** tetap di pot.
- **Ventilasi**: celah atau lubang di dinding atas dan bawah, bukan kotak kedap air yang rapat (misalnya IP65): udara lembap yang terkurung mengembun, alasan yang sama dengan lubang di wadah Node 2.
- **Plastik**, bukan logam: lemari besi, dinding bata, dan tandon air bisa menurunkan sinyal WiFi belasan dBm ([Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#2-wifi-untuk-esp32-hanya-24-ghz-dan-kuat-lemahnya-sinyal)); bandingkan **Sinyal WiFi** di kartu sebelum dan sesudah pindah.
- **Tombol EN dan D13** terjangkau atau ditandai: portal WiFi dibuka dengan menahan D13 sambil menekan EN.

![Diagram dari breadboard ke kotak (Konsep 11): tampak atas, susunan contoh, rekonstruksi, bukan foto dan bukan ukuran; pin dan firmware tidak berubah (PETA-PIN 7). Kotak proyek, tutup dibuka. Di luar kiri: charger HP 5 V, min. 1 A, ke USB papan, dan adaptor USB 5 V, min. 2 A, ke MB102, keduanya di stopkontak; kepala adaptor tetap di luar kotak, hanya kabel USB 5 V yang masuk. Di atas: DHT22 di luar kotak, jauh dari ESP32 dan regulator yang hangat; celah ventilasi di dinding atas dan bawah. Di dalam: papan ekspansi terminal sekrup dengan ESP32 DevKit V1 30 pin; modul relay 2 kanal (lampu D32, kipas D33, hanya beban 5 V); MAX485, kabel A/B keluar dinding kanan; breadboard mini berperekat (pembagi tegangan ECHO dan LDR, MOSFET pompa, pembagi RO RS-485) dengan MB102 di ujung relnya (rel 5 V untuk beban, Modul 5); kabel GND papan ekspansi ke MB102: GND disatukan. Dinding kanan: PIR + LDR menembus dinding, menghadap ruangan. Di bawah, kabel keluar lewat pengikat kabel (kotak hitam kecil): HC-SR04 di atas tandon, sensor tanah di pot, kabel beban 5 V ke pompa, servo, lampu, kipas. Kanan, aturan kotak (PETA-PIN 7): 1 pin tidak berubah, kabel tunggal pendek dari terminal sekrup bertuliskan GPIO yang sama; 2 cocokkan papan ekspansi, ukur jarak dua baris kaki dengan penggaris, papan 38 pin tidak cocok, colokan DC dan regulatornya tidak dipakai; 3 catu daya Modul 9 dipakai ulang: ESP32 dari charger-nya sendiri, beban dari MB102, GND disatukan; 4 sensor melihat udara luar: di luar atau menembus dinding; 5 bernapas, bukan kedap air: celah ventilasi, kotak rapat mengundang embun; 6 kabel diikat di lubang dinding, ferrule untuk kabel serabut (pilihan); 7 sebelum listrik masuk periksa polaritas dan sambungan dengan multimeter, pindah per kelompok daya, aktuator, sensor, uji lewat dashboard. Label di tutup: device_id, nama, versi firmware awal + tanggal, polaritas daya, sandi portal WiFi bila dipakai, tahan D13 saat menyala = portal WiFi. Bawah, kotak merah: tanpa listrik PLN 220 V di dalam kotak; relay hanya untuk beban 5 V; modul AC-DC 220 V dan kabel stopkontak tidak masuk kotak; kurikulum ini tidak pernah mengajak menyentuh 220 V. Kotak putus-putus: jalur pilihan solder, perfboard bersolder menggantikan breadboard mini untuk rangkaian kecil; keselamatan solder di Konsep 11; penulis tidak memotret atau menguji kotak ini.](aset/tata-letak-kotak.png)

**Sebelum tutup ditutup.** Pindahkan per kelompok PETA-PIN 7 (daya → aktuator → sensor) dan uji tiap kelompok lewat dashboard ([12.4](#124--pindah-per-kelompok-peta-pin-7-daya-aktuator-lalu-sensor-35-menit)): bila ada yang salah, kamu tahu kelompok mana penyebabnya. Sebelum listrik masuk, periksa dengan multimeter polaritas 5 V dan GND, tidak ada hubung singkat 5 V–GND, dan GND bersama tersambung; lalu tarik pelan setiap kabel. Tempel label di tutup: `device_id`, nama, versi firmware awal + tanggal, polaritas dan fungsi kedua kabel daya, sandi portal (bila dipakai), dan "tahan D13 saat menyala = portal WiFi". Sandi portal di label itu disengaja: pemegang kotakmu toh bisa membaca isi papannya. Terakhir, foto "sesudah" dari sudut dan jarak yang sama dengan foto "sebelum" ([🔁 Langkah 5](#langkah-5--foto-sebelum-node-1-dari-atas)), lalu 24 jam menyala tanpa `BROWNOUT`, `PANIC`, atau `WDT` ([13.2](#132--k1-e-24-jam-menyala-tanpa-brownout-panic-atau-wdt-5-menit)).

**Kotak dan I10.** Tabel OWASP Modul 21 menulis I10 (*Lack of Physical Hardening*) "kotak perangkat di Modul 28". Kotak menjaga sambungan dari jari, debu, dan tarikan, tetapi tidak dari pencuri: papan yang dibawa pergi tetap bisa dibaca isi *flash*-nya (kunci perangkat di NVS, kunci ESP-NOW dan sandi portal di firmware). Untuk papan hilang, pakai **Nonaktifkan** (Konsep 10).

**Jalur solder (opsional): keselamatan dulu.** Silabus memperkenalkan menyolder "sebagai opsi di Modul 28" ([§5.0](../../SILABUS.md#50-prasyarat-lingkungan-periksa-sebelum-mulai)). Langkahnya ada di lipatan **Jalur solder** [12.5](#125-rangkaian-kecil-di-breadboard-mini-berperekat-10-menit); sebelum memegang solder:

- Ujung solder bekerja di ±325–375 °C ([panduan SparkFun](https://learn.sparkfun.com/tutorials/how-to-solder-through-hole-soldering/all)): selalu letakkan di dudukannya.
- **Kacamata**: potongan kaki komponen atau timah cair bisa terlontar ke mata.
- **Ventilasi**: asap *flux* (bahan pembersih di dalam timah) adalah penyebab umum asma kerja ([HSE Inggris](https://www.hse.gov.uk/pubns/indg249.pdf)). Buka jendela, jangan hirup asapnya, turunkan suhu bila asapnya banyak.
- **Cuci tangan** sesudahnya, apalagi dengan timah bertimbal, dan jangan makan di meja solder. Timah bebas timbal butuh suhu lebih tinggi.
- Sambungan baik **mengilap dan berbentuk gunung kecil** yang membungkus kaki dan bantalan tembaganya; yang kusam atau bercelah di pangkal kaki adalah **sambungan dingin**, yang bisa putus-sambung saat bergetar.

Sambungan solder pertama yang masuk akal: kapasitor 10 µF antara EN dan GND dari 🔬 Modul 2 (lipatan *Apa yang dilakukan esptool…*), untuk papan yang selalu butuh tombol **BOOT** ditahan saat diunggah (tahan BOOT begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan); pembaruan lewat udara sendiri tidak butuh BOOT. Silabus menulis jalur solder dengan "(video)": penulis tidak memegang solder, jadi 12.5 menautkan panduan bergambar pihak ketiga sebagai bacaan, tanpa video tersemat.

**Jujur soal barangnya.** Penulis tidak memegang papan ekspansi, kotak, solder, atau multimeter. Diagram di atas hasil rekonstruksi dari `PETA-PIN.md` dan Modul 5–9, bukan foto dan bukan ukuran; foto di Praktik 12 berasal dari sumber berlisensi ([📚](#-sumber--atribusi-gambar)).

> ⬆️ **Sudah membaca Konsep 11?** Kalau kotak dan papan ekspansi belum ada, ukur papanmu lalu pesan barangnya sekarang (daftarnya di [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)). Node 1 baru dipindah ke kotak di [Praktik 12](#praktik-12--dari-breadboard-ke-kotak-90-menit-butuh-papan-jalur-solder-ditambah-60-menit) sesudah semua pembaruan lewat udara selesai di [Praktik 11](#praktik-11--jeda-vitals-dari-jauh-dan-menonaktifkan-perangkat-hilang-20-menit).

## 🔧 Praktik langkah demi langkah

Praktik 1–4, 6–8, 10, dan 11 wajib untuk semua jalur; Praktik 5, 12, dan 13 wajib untuk jalur ber-Kit karena butuh papan; Praktik 9 opsional. Langkah bertanda ⭐ (1.2–1.4, 2.2–2.5, 3.1–3.5, 4.1–4.3, 5.1–5.4, 6.1–6.4, 7.1–7.3, 7.5, 8.1–8.4, 10.1–10.4, 11.1–11.4, 12.1–12.4, 12.6–12.9, 13.1, dan 13.2) adalah buktinya, ditambah ➕ E. Syarat lulus **O0** dibuktikan di [5.4](#54--o0-serial-ota-dan-server-lalu-kartu-node-1-versi-170-dengan-reset_reason-5-menit), **O1** di [7.5](#75--o1-versi-171-reset_reason-sw-dan-riwayat-berhasil-tanpa-kabel-5-menit), **O2** di [8.3](#83--o2-node-1-kembali-sendiri-ke-171-sesudah-masa-uji-60-detik-10-menit), **K1** di [12.9](#129--k1-ad-label-tutup-kotak-lalu-node-1-online-lagi-5-menit) (a–d) dan [13.2](#132--k1-e-24-jam-menyala-tanpa-brownout-panic-atau-wdt-5-menit) (e); perangkat baru dalam 1 menit (**P1**, praktik wajib) di [10.4](#104--p1-kartu-baru-online-di-armada-dalam-60-detik-sejak-save-6-menit).

Urutannya mengikuti urutan wajib di pembuka modul: server dan gerbang dulu (backend lama menolak `vitals` firmware 1.7.0; perangkat baru yang didaftarkan sebelum gerbang naik dijawab `503`), firmware sesudahnya, kotak paling akhir (menutup colokan USB).

Semua `docker compose` pusat dijalankan dari **akar proyek** di **mesin pusat** yang disebut kotak 🖥️; gerbang dari folder `edge` di Pi. Praktik yang mengubah berkas proyek diakhiri *commit* di cabang `fitur/armada` (1.1), yang di-*push* pertama kali di 2.3 supaya mesin pusat bisa mengambilnya, lalu digabung ke `main` di ➕ E. Satu token bot tetap untuk satu backend (Modul 27): backend kedua ditolak Telegram dengan `409 Conflict`. [`kode/`](kode/) berisi berkas rujukan minggu ini, lima *diff*, dan bahan latihan: salin satu per satu sesuai praktiknya, jangan menimpa seluruh foldermu.

Jalur utama: pusat di VPS, gerbang di Pi. Jalur lain memakai urutan yang sama; bedanya di kotak 🔀:

- **Jalur gratis:** pusat (broker 1884) dan gerbang (1883) di Pi yang sama; firmware diunduh dari `http://192.168.1.37` lewat pintu perangkat 8081.
- **Tanpa Pi:** pusat di laptop; Node 1 masuk langsung ke broker laptop, tempat akun perangkat dibuat (`AKUN_BROKER_OTOMATIS=pusat`); langkah gerbang dilewati, buktinya sama.
- **Tanpa Kit:** perangkat tiruan dari simulator `alat/` menggantikan Node 1 dan papan ketiga (Praktik 6–8 dan 10 dicentang "tiruan"); Praktik 5 dan 13 menunggu papan, Praktik 12 menjadi rencana kotak.
- **Wokwi:** seperti tanpa Kit; papan Wokwi (broker publik, tidak `Online` di **Armada**) mengklaim lewat Serial Monitor di Praktik 10, belum diuji penulis.

**Cara mencicil, satu kelompok per sesi:** **hari 1** 🔁, 🏆, Konsep 1–6, Praktik 1–2 · **hari 2** Konsep 7–9, Praktik 3–4 (di 3.4 Node 1 disambung kabel USB untuk Serial Monitor) · **hari 3 (butuh papan)** Praktik 5–7 · **hari 4** Praktik 8, Praktik 10, Konsep 10, Praktik 11 (Praktik 9 opsional) · **hari 5** Konsep 11, ukur dan cocokkan barangmu, Praktik 12 · **hari 6–7** Node 1 menyala 24 jam di kotak, Praktik 13, ➕.

> [!NOTE]
> **Rumahmu selama minggu ini.** Praktik 2 membuat ulang broker pusat: jembatan Pi (tanpa Pi: Node 1) putus beberapa detik, lalu tersambung lagi. 3.1 dan 3.4 me-*restart* broker gerbang (antreannya tetap utuh); lakukan saat internet rumah tersambung, karena *restart* saat internet putus membuat kartu Node 1 `Offline` padahal datanya tetap masuk, sampai status berikutnya. Praktik 5 menghentikan Node 1 selama diunggah, dan 12.2–12.9 memadamkannya selama dipindah (±1,5 jam tanpa data).

### Praktik 1 — Meja kerja: cabang, sidik jari, cadangan, dan catatan akun (10 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, terminal di **akar proyek** (1.1); terminal **mesin pusat** di akar proyek (1.2–1.4): **terminal SSH ke VPS** (`ssh rumah@203.0.113.10`, folder `/home/rumah/rumah-pintar-mini`; jalur gratis: Pi; tanpa Pi: laptop); jalur ber-Pi juga **terminal SSH ke Pi**, folder `rumah-pintar-mini/edge` (1.4). Bahannya: 🔁 Langkah 1 dan resep cadangan [Modul 26 9.1](../modul-26-docker-compose/README.md#91-pg_dump-di-dalam-kontainer-lalu-docker-compose-cp-ke-backup-8-menit).
>
> ⭐ **Wajib** — langkah 1.2, 1.3, dan 1.4: sidik jari riwayat tercatat, arsip cadangan ada di `backup/` mesin pusat, dan setiap perangkat tercatat dengan broker dan akun lamanya.

#### 1.1 Cabang `fitur/armada` dari `main` yang terbaru (2 menit)

Di terminal laptop:

```text
git switch main
git pull
git switch -c fitur/armada
```

**Hasilnya (lab penulis):**

```text
Already on 'main'
Your branch is up to date with 'origin/main'.
Already up to date.
Switched to a new branch 'fitur/armada'
```

Praktik 1 tidak mengubah berkas proyek, jadi tanpa *commit*.

#### 1.2 ⭐ Sidik jari riwayat di mesin pusat dengan `skrip/sidik-jari.sql` (3 menit)

Di terminal mesin pusat (bash; PowerShell, tidak diuji penulis: `Get-Content skrip/sidik-jari.sql | docker compose exec -T db psql -U postgres -d rumahpintar`):

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

**Hasilnya (lab penulis, "VPS" tiruan, 15.06 WIB; angkamu berbeda):**

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2216 | 9c40d88e79751e9e71074453a1cdd187 |       369 |     9 |     3 |    2 |         3
(1 row)
```

Salin hasilmu beserta tanggal dan jam WIB-nya ke `belajar-iot/modul-28/sidik-jari.md` dengan judul "Sebelum Modul 28 (1.2)". Angkanya bergerak (Node 1 terus mengirim); di [2.4](#24--docker-compose-up--d---build-backend-migrasi-011-plugin-dynamic-security-dan-alamat-unduh-8-menit), riwayat sampai jam ini diperiksa tetap utuh sesudah migrasi 011.

**Kamu lulus langkah ⭐ ini** kalau baris sidik jari lengkap beserta tanggal dan jamnya ada di `sidik-jari.md`.

#### 1.3 ⭐ Cadangan sebelum mengubah apa pun: `pg_dump` lalu `docker compose cp` ke `backup/` (3 menit)

Kalau Praktik 2–4 merusak sesuatu, arsip ini dipulihkan dengan resep Modul 26 9.2. Di terminal mesin pusat:

```text
docker compose exec db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
```

**Hasilnya:** empat baris wajar seperti Modul 26, dibuka `pg_dump: warning: there are circular foreign-key constraints on this table:`. Belum ada folder `backup`? Buat dengan `mkdir backup`. Lalu salin arsipnya keluar, dengan tanggal hari ini di namanya:

```text
docker compose cp db:/tmp/rumahpintar.dump backup/rumahpintar-2026-11-02-sebelum-m28.dump
```

**Hasilnya (lab penulis, "VPS" tiruan):**

```text
[+] Copying 1/1
 ✔ rumahpintar-db-1 copy rumahpintar-db-1:/tmp/rumahpintar.dump to backup/rumahpintar-2026-11-02-sebelum-m28.dump Copied            0.0s
```

Cek `git status --short`: kosong, karena `backup/` diabaikan Git sejak Modul 26. Arsip ini berisi seluruh riwayat dan akunmu: simpan sebagai data pribadi. Akun broker tidak ikut; cadangannya di 3.5.

**Kamu lulus langkah ⭐ ini** kalau `backup/` di mesin pusat berisi arsip bertanggal hari ini dan `git status --short` tidak menyebutnya.

#### 1.4 ⭐ Catat setiap perangkat: `device_id`, versi, broker, dan akun lamanya (2 menit)

Akun perangkat pindah ke *dynamic security* di Praktik 3, jadi catat dulu keadaannya. Jalankan di broker tempat Node 1 masuk (gerbang: folder `edge` di Pi; tanpa Pi: akar proyek laptop):

```text
docker compose exec mosquitto cut -d: -f1 /mosquitto/data/sandi-broker
```

`cut -d: -f1` hanya mencetak nama akun; kolom kedua berkas itu sidik jari sandi, jadi jangan tampilkan berkasnya utuh.

**Hasilnya (lab penulis, gerbang Pi tiruan):**

```text
pemantau
pemeriksa
f00d00000001
```

`f00d00000001` = Node 1 tiruan (simulator); di daftarmu muncul `device_id` Node 1-mu: **akun lama Modul 21**, yang dipindah di [3.4](#34--pindah-akun-lama-modul-21-ganti-kunci-kunci-baru-di-serial-mosquitto_passwd--d-lalu-restart-10-menit). Ulangi di akar proyek mesin pusat (jalur ber-Pi): lab penulis hanya mendapat akun layanan (`backend`, `jembatan-pi`, `pemantau`, `pemeriksa`); `device_id` di sana juga akun lama. Catat satu baris per perangkat di `belajar-iot/modul-28/perangkat.md`: `device_id`, nama, versi (🔁 Langkah 1), broker, dan akun lamanya. Node 2 (`1.0.0`) tanpa akun broker: Node 1 yang menerbitkan datanya.

> 🔀 **Tanpa Kit:** perangkat tiruan dicatat sama; versinya `0.1.0` (simulator Modul 27) sampai 4.2.

**Kamu lulus langkah ⭐ ini** kalau setiap perangkat tercatat dengan `device_id`, versi, broker, dan akun lamanya, tanpa sandi atau kunci.

> ⬆️ **Selesai Praktik 1?** Lanjut ke [Praktik 2](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit). Belum membaca [Konsep 5](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest) dan [Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)? Baca dulu karena Praktik 2 memakai keduanya.

### Praktik 2 — Kontrak 1.6, backend 1.5.0, migrasi 011, dan broker pusat dengan *dynamic security* (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, terminal di **akar proyek** dan di folder **`backend`**; terminal **mesin pusat** di akar proyek: **SSH ke VPS** (`ssh rumah@203.0.113.10`, folder `/home/rumah/rumah-pintar-mini`; jalur gratis: SSH ke Pi; tanpa Pi: laptop); **Bruno** (*environment* **internet**; tanpa Pi: **lokal**). Konsep yang dipakai: 3, 5, 6.
>
> ⭐ **Wajib** — langkah 2.2, 2.3, 2.4, dan 2.5: 203 tes lulus, `config --quiet` diam dengan sandi plugin, log migrasi 011 dan plugin *dynamic security* muncul tanpa riwayat lama berubah, lalu Bruno `armada` menulis `"ota_siap": true` dan Node 1 1.6.0 tetap diterima.

Server dulu, firmware belakangan: backend 1.4.0 menolak `vitals` firmware 1.7.0 (lab penulis, Node 1 tiruan: `Kunci tidak dikenali`). Gerbang menyusul di Praktik 3.

#### 2.1 Kontrak 1.5 → 1.6: `update`, `vitals`, `config.jeda`, dan kode klaim (5 menit)

Aturan proyek ini: ubah kontrak dulu, baru kodenya, lalu versi firmware. Di laptop, salin dulu isi tabel **Perangkatku** di `KONTRAK-DATA.md`, ganti seluruh isinya dengan [versi 1.6](kode/KONTRAK-DATA.md) (**Copy raw file**), isi lagi tabel itu, lalu simpan. Perubahannya (bagian 12):

| Bagian | Yang berubah di 1.6 |
| :-- | :-- |
| 7 `cmd` | `update` membawa `versi`, `url`, `sha256`, dan `ukuran`; `url` hanya `<alamat server tersimpan>/fw/node-1/<versi>.bin`; QoS 1, tidak pernah *retained*; `ack` `ok:true` = diterima, belum selesai (Konsep 3) |
| 6 `vitals` | `reset_reason` dan `fw` (wajib mulai firmware 1.7.0, selalu bersama), ditambah laporan `ota` (Konsep 9) |
| 7 `config` | boleh membawa `jeda.vitals_s` (60–3600 detik); `telemetry` tetap 10 detik |
| 3 dan 5 | `status` `offline-mode` dipakai: berhenti sengaja, lalu putus rapi tanpa wasiat |
| 9 | aturan 12–14: pembaruan, masa uji 60 detik dan *rollback*, perangkat dinonaktifkan (Lampiran A Silabus: 14–16) |
| 10 (baru) | pendaftaran dengan kode klaim (Konsep 8) dan **bentuk alamat server** (2.3) |

Cek: `git diff --stat KONTRAK-DATA.md` (lab penulis: `97 insertions(+), 11 deletions(-)`).

#### 2.2 ⭐ Backend 1.5.0 lulus 203 tes: `npm ci`, `npm run cek`, `npm test`, dan `npm audit` (7 menit)

Backend 1.5.0 berubah di 55 berkas, tanpa paket npm baru: rute unduhan berkunci `/fw`, rilis, armada, kode klaim, akun broker otomatis, kontrak 1.6, 11 permintaan Bruno, dan migrasi 011 ([`kode/backend/`](kode/backend/)). Cara tercepat (diuji penulis di Linux pada salinan proyek Modul 27; Windows/macOS belum): buka [`kode/backend-1.5.diff`](kode/backend-1.5.diff), klik **Download raw file**, simpan di akar proyek, lalu di terminal akar proyek:

```text
git apply --check backend-1.5.diff
```

Tanpa keluaran = bisa diterapkan: jalankan lagi tanpa `--check`, lalu hapus berkas *diff*-nya. Ditolak (berkas pernah kamu ubah, atau CRLF di Windows)? Belum satu berkas pun diterapkan: salin ke-55 berkas di daftar `git apply --stat backend-1.5.diff` dari `kode/backend/` (**Copy raw file**; `LABEL`-mu di `Dockerfile` tulis lagi). Cuplikan migrasi 011 ([utuhnya](kode/backend/migrasi/011_ota_dan_armada.sql)):

```sql
CREATE TABLE firmware (
  -- …
  ukuran     integer NOT NULL CHECK (ukuran > 0 AND ukuran <= 1966080),    -- paling besar = satu rak program Minimal SPIFFS
  sha256     text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),             -- sidik jari isi berkas, dihitung server saat unggah
  -- …
);
-- …
CREATE UNIQUE INDEX pembaruan_satu_berjalan ON pembaruan (device_id) WHERE status IN ('dikirim', 'diterima', 'mengunduh');
```

Tabel `pembaruan` mencatat setiap perintah `update` (indeksnya menolak pembaruan kedua yang berjalan bersamaan), `kode_klaim` hanya menyimpan SHA-256 kode, dan `devices` mendapat `fw`, `fw_dilihat`, `reset_reason`, `canary`, dan `jeda_vitals_s`. Di terminal folder `backend`, satu per satu: `npm ci`, `npm run cek`, `npm test`, lalu `npm audit`.

**Hasilnya (lab penulis, 2 November 2026, dipotong):**

```text
added 225 packages, and audited 226 packages in 7s
4 moderate severity vulnerabilities
> rumah-pintar-mini-backend@1.5.0 cek
> tsc --noEmit
 Test Files  25 passed (25)
      Tests  203 passed (203)
# npm audit report
glob  3.0.0 - 14.0.1
Will install @fastify/swagger-ui@2.1.0, which is a breaking change
4 moderate severity vulnerabilities
```

`npm test` butuh ±20 detik di lab penulis (satu tes sengaja menunggu 5 detik); merah? Bandingkan berkasmu dengan `kode/backend/`. Modul 27 menulis `found 0 vulnerabilities` dengan paket yang sama; per 2 November 2026 ada dua laporan celah baru (`glob`, `minimatch`) di rantai paket halaman `/docs`; backend ini tidak memanggil `glob`, dan perbaikannya belum ada di rentang versi kita. **Jangan** `npm audit fix --force`: artinya *turun* ke `@fastify/swagger-ui` 2.1.0 yang kuno ([Batasan v1.5](kode/backend/README.md#batasan-v15)). Angka audit bergantung pada tanggal.

**Kamu lulus langkah ⭐ ini** kalau `npm test` menulis `25 passed (25)` dan `203 passed (203)`, dan `npm run cek` tanpa galat.

#### 2.3 ⭐ Berkas infrastruktur dan `.env` mesin pusat: `MOSQUITTO_DYNSEC_PASSWORD` dan `ALAMAT_SERVER` (6 menit)

**Laptop, akar proyek.** Ganti isi berkas ini dengan berkas bernama sama di [`kode/`](kode/) (**Copy raw file**): `compose.cloud.yml`, `.env.example` (`TOKO_IMAGE` lamamu, bila ada, tulis lagi), `.gitignore` (+ `*.bin`, `firmware/**/build/`, `data-firmware/`), `edge/pusat.conf`, `edge/pusat-internet.conf`, `edge/acl-broker` (tulis lagi `device_id`-mu di blok 2 dan buka lagi blok 2b bila dulu terbuka, seperti Modul 27), `frontend/caddy/Caddyfile`, dan berkas baru `skrip/cadangkan-akun-broker.sh` (untuk 3.5; di Windows, bilah status VS Code harus `LF`). Berkas `edge/` lain menyusul di 3.1. Yang baru di `compose.cloud.yml`:

```yaml
x-setelan-backend: &setelan-backend
  # …
  ALAMAT_SERVER: ${ALAMAT_SERVER:-}
  AKUN_BROKER_OTOMATIS: ${AKUN_BROKER_OTOMATIS:-mati}
  OTA_BATAS_MENIT: ${OTA_BATAS_MENIT:-10}
# …
  mosquitto:
    # …
      MOSQUITTO_DYNSEC_PASSWORD: ${MOSQUITTO_DYNSEC_PASSWORD:?isi MOSQUITTO_DYNSEC_PASSWORD di .env (acak, minimal 12 huruf)}
# …
  backend:
    # …
      - data-firmware:/app/data-firmware
# …
  web:
    # …
      - "${ALAMAT_WEB:-127.0.0.1}:${PORT_WEB:-80}:${PINTU_WEB_DALAM:-80}"
```

Lemari baru `data-firmware` hanya dipasang di `backend`, angka terakhir loket `web` = pintu di dalam kontainer, dan tag image naik ke backend 1.5.0 dan web 1.4.0. Di `edge/pusat.conf` dan `edge/pusat-internet.conf`, plugin dipasang di samping berkas sandi dan daftar izin:

```text
password_file /mosquitto/data/sandi-broker
acl_file /mosquitto/config/acl-broker
plugin /usr/lib/mosquitto_dynamic_security.so
plugin_opt_config_file /mosquitto/data/dynamic-security.json
```

Di `edge/acl-broker`, `backend` mendapat empat baris topik kontrol dan `jembatan-pi` dua (akun layanan tetap di berkas sandi, akun perangkat di *dynamic security*):

```text
user backend
# …
topic write $CONTROL/dynamic-security/v1
topic read $CONTROL/dynamic-security/v1/response
topic write rpm-gerbang/+/dynamic-security/v1
topic read rpm-gerbang/+/dynamic-security/v1/response
# …
topic write $SYS/broker/connection/jembatan-pi/state
topic read rpm-gerbang/pi1/dynamic-security/v1
topic write rpm-gerbang/pi1/dynamic-security/v1/response
```

Di `Caddyfile`, `/fw/*` diteruskan ke backend tanpa kompresi, di atas *fallback* halaman, dan situs `:8081` = pintu perangkat (Konsep 6):

```text
	@bolehDikompres not path /fw/*
	encode @bolehDikompres zstd gzip
	# …
	handle /fw/* {
		reverse_proxy backend:8080
	}
# …
:8081 {
	# …
	handle /api/provision/klaim {
		uri strip_prefix /api
		reverse_proxy backend:8080
	}
	# …
}
```

Caddyfile baru terbaca saat `web` dibuat ulang di 4.1; sampai saat itu `/fw/…` dijawab halaman dashboard (lab penulis), wajar karena belum ada firmware. Simpan, lalu *push* cabang ini untuk pertama kali (`.env` tidak ikut):

```text
git add KONTRAK-DATA.md backend compose.cloud.yml .env.example .gitignore edge skrip frontend/caddy
git commit -m "Modul 28 Praktik 2: kontrak 1.6, backend 1.5.0, broker pusat dynamic security"
git push -u origin fitur/armada
```

**Mesin pusat, akar proyek** (tanpa Pi: lewati, laptopmu sudah di cabang ini): `git fetch`, lalu `git switch fitur/armada`. Ditolak karena `edge/acl-broker`? `git stash`, ulangi, lalu `git stash pop`. Buat sandi plugin acak baru (perintah di kepala `.env.example`; VPS tanpa Node.js memakai baris kedua):

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Sandi ini dipakai **sekali**, saat broker pertama menyala dengan Modul 28, tetapi pemegangnya menguasai semua akun broker: simpan di pengelola sandimu, jangan di Git atau catatan. Gerbang mendapat sandi lain di 3.1. Lalu buka `.env` (VPS dan Pi: `nano .env`):

1. Di bagian rahasia, tambahkan `MOSQUITTO_DYNSEC_PASSWORD=` diikuti sandi tadi.
2. Di akhir berkas, tambahkan `ALAMAT_SERVER`, `PINTU_WEB_DALAM`, dan `AKUN_BROKER_OTOMATIS` (= blok "Armada" `.env.example`) menurut kolom tempatmu. `ALAMAT_WEB` dan `ALAMAT_MQTT` sudah ada sejak Modul 26–27: ubah barisnya bila kolommu berbeda.

| Setelan | Laptop tanpa Pi | VPS (jalur utama) | Pi (jalur gratis) |
| :-- | :-- | :-- | :-- |
| `MOSQUITTO_DYNSEC_PASSWORD` | acak ≥ 12 | acak ≥ 12 | acak ≥ 12 (+ `edge/.env` gerbang: acak lain) |
| `ALAMAT_SERVER` | `http://192.168.1.10` | `https://iot.namaanda.my.id` | `http://192.168.1.37` |
| `AKUN_BROKER_OTOMATIS` | `pusat` | `gerbang:pi1` | `gerbang:pi1` |
| `ALAMAT_WEB` | `0.0.0.0` (mode HP) | `0.0.0.0` (sudah, Modul 27) | `192.168.1.37` |
| `PINTU_WEB_DALAM` | kosong (= 80) | kosong (= 80) | `8081` |
| `ALAMAT_MQTT` | `0.0.0.0` (Node 1 ke broker laptop) | `127.0.0.1` | `172.17.0.1` |
| `OTA_BATAS_MENIT` | kosong (= 10) | kosong (= 10) | kosong (= 10) |

`ALAMAT_SERVER` ditulis tanpa `/` di akhir dan **sama persis** dengan yang nanti kamu ketik di Serial atau portal Node 1 (5.4, 10.3): Node 1 hanya mengunduh dari alamat itu. Bentuknya (kontrak bagian 10): paling panjang 64 huruf, huruf kecil, nama server tanpa garis bawah, port 1–65535, `http://` hanya ke alamat IP rumah; selain itu backend menolak menyala dan menulis alasannya di log. Kosong = pembaruan lewat udara mati. Pi jalur gratis: tanpa `:8081` (itu pintu di dalam kontainer). Tanpa Pi, laptop bekerja seperti [mode HP Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop): *firewall*-nya mengizinkan port 80 selama latihan (kembalikan sesudahnya), dan laptop tidak boleh tidur selama pembaruan. Pusat di laptop dengan gerbang Pi seperti Modul 26? Pakai kolom "Laptop + gerbang Pi" `.env.example`. `OTA_BATAS_MENIT` hanya dipendekkan di lab penulis (3 menit). Periksa:

```text
docker compose config --quiet
```

**Hasilnya (lab penulis, "VPS" tiruan):** tanpa keluaran = cocok. Tanpa baris sandi plugin, Compose berhenti ([🚨](#-kalau-tidak-jalan)):

```text
error while interpolating services.mosquitto.environment.MOSQUITTO_DYNSEC_PASSWORD: required variable MOSQUITTO_DYNSEC_PASSWORD is missing a value: isi MOSQUITTO_DYNSEC_PASSWORD di .env (acak, minimal 12 huruf)
```

Di lab penulis, `.env` Modul 27 plus sandi plugin saja sudah lolos (beda hasil `config`-nya dengan Modul 27 hanya tag image, tiga variabel backend, lemari `data-firmware`, dan sandi plugin), dan setelan armada yang kosong berperilaku seperti Modul 27. Sampai 4.1, nyalakan hanya layanan yang disebut namanya: `docker compose up -d` tanpa nama membangun image web 1.4.0 dari dashboard lama.

**Kamu lulus langkah ⭐ ini** kalau mesin pusat di cabang `fitur/armada`, `.env`-nya berisi sandi plugin acak dan setelan kolom tempatmu, dan `config --quiet` tanpa keluaran.

#### 2.4 ⭐ `docker compose up -d --build backend`: migrasi 011, plugin *dynamic security*, dan alamat unduh (8 menit)

Node 1 terus mengirim, jadi `bacaan` di `skrip/sidik-jari.sql` pasti naik; yang tidak boleh berubah adalah riwayat sampai jam 1.2. Di mesin pusat, jalankan kueri ini **sebelum** backend baru (tanggal dan jamnya = catatan 1.2-mu, `+07` = WIB), lalu simpan hasilnya:

```text
docker compose exec db psql -U postgres -d rumahpintar -c "SELECT count(*) AS bacaan, md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) AS sidik_jari FROM readings AS r WHERE r.ts <= '2026-11-02 15:06:31+07'"
```

Lalu:

```text
docker compose up -d --build backend
```

Compose membangun cetakan 1.5.0 di mesin pusat sendiri (VPS: seperti Modul 27 7.4). Di lab penulis (±12 detik, lapisan dari *cache*) ia menulis `Built` untuk backend 1.5.0, `Created` untuk lemari `rumahpintar_data-firmware`, `Exited` untuk `migrasi`, dan `Started` untuk `mosquitto` (variabel sandi plugin baru) dan `backend`; `db` tidak disentuh, `web` tetap 1.3.0 sampai 4.1. Baca lognya: `docker compose logs migrasi mosquitto backend`.

**Hasilnya (lab penulis, "VPS" tiruan, dipotong; jam backend WIB, angka broker = detik):**

```text
migrasi-1  | diterapkan: 011_ota_dan_armada.sql
migrasi-1  | 1 migrasi baru diterapkan, 8 sudah ada sebelumnya.
mosquitto-1  | 1793607032: Loading plugin: /usr/lib/mosquitto_dynamic_security.so
mosquitto-1  | 1793607032: Dynamic security plugin config not found, generating a default config.
mosquitto-1  | 1793607032:   Using admin password from MOSQUITTO_DYNSEC_PASSWORD environment variable
mosquitto-1  | 1793607032: Plugin dynamic-security loaded.
backend-1  | [15:10:37] INFO: alamat unduh firmware untuk perangkat: https://iot.namaanda.my.id/fw/node-1/<versi>.bin
backend-1  | [15:10:37] INFO: akun broker perangkat: broker gerbang pi1 (AKUN_BROKER_OTOMATIS)
```

`config not found` = plugin membuat `dynamic-security.json` di lemari broker (sekali saja). Tanpa Pi: `broker pusat`; `ALAMAT_SERVER` kosong: `pembaruan firmware lewat udara MATI: ALAMAT_SERVER belum diisi`. Jembatan Pi putus ±4 detik lalu tersambung lagi; Node 1 tetap di gerbang (tanpa Pi: putus sebentar, lalu masuk lagi dengan akun Modul 21-nya). Ulangi kueri sidik tadi: hasilnya harus sama persis. Di lab penulis, kueri berbatas jam 1.2 (15.06.31 WIB) sesudah migrasi menulis `2216` dan `9c40d88e79751e9e71074453a1cdd187`, sama dengan baris 1.2.

**Jangan mendaftarkan atau mengklaim perangkat baru sampai Praktik 3 selesai:** broker gerbang belum bisa menerima perintah akun, jadi backend menjawab `503` (lab penulis, sesudah ±6 detik: `belum tersimpan di database (… broker gerbang pi1 tidak menjawab setDefaultACLAccess dalam 3 detik). …`).

**Kamu lulus langkah ⭐ ini** kalau log memuat `diterapkan: 011_ota_dan_armada.sql`, `Plugin dynamic-security loaded.`, dan alamat unduhmu, dan sidik berbatas jam 1.2 sama sebelum dan sesudah.

#### 2.5 ⭐ Cocok mundur: Bruno `armada`, rilis kosong, dan Node 1 1.6.0 tetap diterima (4 menit)

Di Bruno, kirim **`login admin`**, lalu **`armada`** dan **`daftar rilis firmware`**.

**Hasilnya (lab penulis, Node 1 dan Kebun tiruan, Bruno lewat skrip; dipotong):**

```text
GET {{baseUrl}}/armada -> 200 OK (58 ms)
  "pengaturan": { "ota_siap": true, "akun_broker": "broker gerbang pi1" },
  f00d00000001: "status": "online", "fw": "0.1.0", "kesehatan": {… "reset_reason": null},
                "bisa_update": false, "alasan_tidak_bisa": "belum ada rilis firmware"
  f00d000000b2: "alasan_tidak_bisa": "Node 2 (ESP-NOW): OTA tidak tersedia, perbarui lewat kabel"
GET {{baseUrl}}/firmware -> 200 OK (30 ms)
{ "terbaru": { "node1": null }, "rilis": [] }
```

Simulator Modul 27 menulis `fw` `0.1.0`; Node 1-mu `1.6.0` (tanpa Kit: `0.1.0` sampai 4.2). Node 1 belum bisa diperbarui karena belum ada rilis (Praktik 6), `reset_reason`-nya kosong karena 1.6.0 belum mengirimnya, dan Node 2 memang tidak diperbarui lewat udara (Konsep 7). `vitals` 1.6.0 (tiap 5 menit) tetap diterima; 5 menit sesudah 2.4, di mesin pusat:

```text
docker compose logs backend | grep -c DITOLAK
```

**Hasilnya (lab penulis):** `0` (PowerShell, tidak diuji penulis: `… | Select-String DITOLAK` tanpa keluaran). Semua sudah di-*push* di 2.3. Jalan mundur bila perlu: image backend 1.4.0 dan web 1.3.0 masih ada, migrasi 011 hanya menambah (backend 1.4.0 tetap jalan di atasnya), dan broker mengikuti "Jalan mundur ke Modul 27" di [`kode/edge/README.md`](kode/edge/README.md).

**Kamu lulus langkah ⭐ ini** kalau `armada` menulis `"ota_siap": true` dan `akun_broker` jalurmu, `daftar rilis firmware` menulis `"rilis": []`, dan `DITOLAK` = `0`.

> ⬆️ **Selesai Praktik 2?** Baca [Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota) sampai [Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason), lalu lanjut ke [Praktik 3](#praktik-3--akun-broker-otomatis-di-gerbang-pindah-akun-modul-21-dan-cadangan-akun-35-menit). Sampai Praktik 3 selesai, jangan mendaftarkan atau mengklaim perangkat baru: backend akan menjawab `503`.

### Praktik 3 — Akun broker otomatis di gerbang, pindah akun Modul 21, dan cadangan akun (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, terminal di **akar proyek** (awal 3.1); **terminal SSH ke Pi**, folder `rumah-pintar-mini/edge` (3.1–3.5); **Bruno** (**`login admin`** dulu; 3.2, 3.4); **Arduino IDE** dengan kabel USB ke Node 1 dan **Serial Monitor** (3.4); **terminal SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini` (3.2, 3.5); pengelola sandimu. Konsep yang dipakai: 8 (3.4 merujuk maju ke 10).
>
> ⭐ **Wajib** — langkah 3.1 (jalur dengan Pi), 3.2, 3.3, 3.4, dan 3.5: broker gerbang memuat *dynamic security*, akun perangkat latihan dibuat backend sendiri dan hanya membaca `cmd` miliknya, akun lama Modul 21 pindah dan terhapus dari berkas sandi, lalu akun broker tercadang.

Sejak 2.4, backend 1.5.0 di VPS siap membuat akun perangkat, tetapi Node 1 masuk ke broker gerbang di Pi, yang belum memuat plugin. Praktik ini menyalakan plugin itu di gerbang, membuka jalan surat perintah lewat jembatan ([Konsep 8](#8-perangkat-baru-dalam-1-menit-identitas-kode-klaim-dan-akun-broker-otomatis)), lalu memindahkan akun lama. Kotak **Hasilnya** dari lab penulis: VPS, Pi, dan internet tiruan di satu mesin; Node 1 = perangkat tiruan dari simulator.

> 🔀 **Tanpa Pi:** Node 1 masuk langsung ke broker pusat laptop, yang memuat plugin sejak 2.4 (`AKUN_BROKER_OTOMATIS=pusat`). Dari 3.1 cukup lima berkas + *commit* di laptop; 3.2–3.5 di terminal laptop, akar proyek (Windows: `grep` → `Select-String`, `MSYS_NO_PATHCONV=1 sh skrip/…` di Git Bash; tidak diuji penulis), dan log brokernya berawalan `dynsec: backend/backend | …`. **Jalur gratis:** gerbang (1883) dan pusat (1884) di Pi yang sama; jembatanmu tetap blok JALUR RUMAH (Modul 27), jadi log 3.1 menulis `Connecting bridge pusat (pusat:1884)`. **Tanpa Kit:** Node 1-mu perangkat tiruan `f00d00000001`; bedanya hanya di 3.4.

#### 3.1 ⭐ Gerbang naik: sandi plugin di `edge/.env`, dua baris *remap* jembatan, lalu *restart* broker (10 menit)

Gerbang butuh lima berkas `edge/` yang belum disalin di 2.3: [`gerbang.conf`](kode/edge/gerbang.conf) (dua baris plugin), [`jembatan.contoh.conf`](kode/edge/jembatan.contoh.conf) (dua baris *remap*), [`compose.edge.yml`](kode/edge/compose.edge.yml) (sandi plugin wajib), [`.env.example`](kode/edge/.env.example), dan [`README.md`](kode/edge/README.md). Di laptop, buka satu per satu di GitHub, klik **Copy raw file**, tempel menggantikan isi berkas bernama sama di folder `edge`, lalu:

```text
git add edge
git commit -m "Modul 28 Praktik 3: gerbang dynamic security"
git push
```

**Hasilnya (lab penulis):** `5 files changed, 77 insertions(+), 13 deletions(-)`. Di terminal SSH ke Pi, folder `edge` (jalur gratis: Pi sudah di cabang ini, cukup `git pull`):

```text
git fetch -q
git switch fitur/armada
```

**Hasilnya (lab penulis):** diakhiri `Switched to a new branch 'fitur/armada'`. Ditolak karena `edge/acl-broker`? `git stash`, ulangi, lalu `git stash pop` (seperti Modul 27).

Sandi plugin gerbang: acak, minimal 12 huruf, **berbeda** dari sandi pusat 2.3. Buat dengan perintah dari `edge/.env.example`:

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Buka `nano .env`, tambahkan baris `MOSQUITTO_DYNSEC_PASSWORD=` diikuti hasilnya, simpan (**Ctrl + O**, **Enter**, **Ctrl + X**), lalu periksa tanpa menampilkan sandinya:

```text
grep -c '^MOSQUITTO_DYNSEC_PASSWORD=.\{12,\}' .env
```

```text
docker compose config --quiet
```

**Hasilnya (lab penulis):** `1`, lalu `config` tanpa keluaran. Tanpa baris itu (atau kosong), `config` berhenti dengan `… is missing a value: isi MOSQUITTO_DYNSEC_PASSWORD di edge/.env (acak, minimal 12 huruf)`. Pemegang sandi ini menguasai semua akun gerbang: jangan ke Git atau catatan belajar.

Lalu dua baris *remap*: buka `nano jembatan/pusat.conf`, tempel dua baris terakhir `jembatan.contoh.conf` di bawah `topic rpm/+/cmd in 1`:

```text
topic dynamic-security/v1 in 1 $CONTROL/ rpm-gerbang/pi1/
topic dynamic-security/v1/response out 1 $CONTROL/ rpm-gerbang/pi1/
```

`pi1` = nama gerbang di `AKUN_BROKER_OTOMATIS=gerbang:pi1` (2.3). `grep -n dynamic-security jembatan/pusat.conf` harus menampilkan tepat dua baris itu; berkas ini berisi sandi `jembatan-pi`, jadi tetap di luar Git. Setelan Compose berubah, jadi broker dibuat ulang (bukan HUP, yang membuang antrean simpan-teruskan; Modul 27).

```text
docker compose up -d --force-recreate mosquitto
```

**Hasilnya (lab penulis):** `✔ Container rumahpintar-gerbang-mosquitto-1  Started  1.1s`. Lalu `docker compose logs mosquitto`.

**Hasilnya (lab penulis, dipotong; awalan `mosquitto-1  | <detik>:` dibuang):**

```text
Restored 1 client messages
Loading plugin: /usr/lib/mosquitto_dynamic_security.so
Dynamic security plugin config not found, generating a default config.
  Using admin password from MOSQUITTO_DYNSEC_PASSWORD environment variable
Plugin dynamic-security loaded.
Warning: File /mosquitto/config/acl-broker has world readable permissions. Future versions will refuse to load this file.
Connecting bridge pusat (mqtt.namaanda.my.id:8883)
```

`Restored … client messages` = antrean yang selamat. `config not found, generating` hanya sekali, saat buku akun `dynamic-security.json` dibuat di lemari broker gerbang. `world readable` sejak Modul 26: abaikan. Node 1 lepas sebentar lalu masuk lagi (lab: ±4 detik).

**Kamu lulus langkah ⭐ ini** kalau log gerbang memuat `Plugin dynamic-security loaded.` dan `Connecting bridge pusat (…)`, dan Node 1 `Online` lagi.

#### 3.2 ⭐ Perangkat latihan: akun brokernya dibuat otomatis di broker gerbang `pi1` (8 menit)

Daftarkan perangkat latihan baru, lalu lihat akunnya muncul di gerbang tanpa langkah tangan di Pi. `f00d00000001` sudah terdaftar sejak Modul 21 (dijawab `409`), jadi pakai `f00d00000005`: di Bruno, *clone* **`daftarkan perangkat latihan`**, ubah `device_id` di tab **Body** menjadi `f00d00000005` dan `nama`-nya (misalnya `Latihan gerbang`), kirim, simpan kuncinya, lalu hapus *clone* itu.

**Hasilnya (lab penulis, jembatan TLS tiruan):** `201 Created` (174 ms), dengan `langkah` ketiga:

```text
Broker: akun f00d00000005 sudah dibuat otomatis di broker gerbang pi1 (dynamic security): tidak ada langkah tangan di broker
```

Kuncinya tampil sekali: simpan di pengelola sandimu dan di `alat/.env` laptop (di luar Git) sebagai `KUNCI_F00D00000005=<kunci>`. Perangkat latihan ini dipakai lagi di [4.2](#42--perangkat-tiruan-170-dari-simulator-alat-6-menit) dan [11.3](#113--nonaktifkan-papan-ketiga-akun-brokernya-dihapus-putus-seketika-6-menit). Di Pi, `docker compose logs mosquitto | grep dynsec`. **Hasilnya (lab penulis, awalan dibuang):**

```text
dynsec: local.jembatan-pi/(null) | setDefaultACLAccess | acltype=publishClientReceive | allow=false
dynsec: local.jembatan-pi/(null) | createClient | username=f00d00000005 | password=*****
```

Perintah untuk akun latihan itu dibawa jembatan (`local.jembatan-pi`): izin baca bawaan menjadi tolak dulu, baru akunnya dibuat; sandinya tidak tercetak. Log backend VPS (`docker compose logs backend | grep 'izin baca'`) menulis sekali `akun broker: bawaan izin baca akun perangkat di broker gerbang pi1 = tolak (yang berlaku pola %u acl-broker)`. Dijawab `503` sesudah ±6 detik? Periksa 3.1, lalu ulangi ([🚨](#-kalau-tidak-jalan) *Daftar atau klaim perangkat dijawab `503` …*).

**Kamu lulus langkah ⭐ ini** kalau Bruno menjawab `201` dan log gerbang memuat `createClient | username=f00d00000005`.

#### 3.3 ⭐ Akun perangkat hanya membaca `cmd` miliknya (4 menit)

Akun buatan backend tidak diberi peran: izinnya tetap pola `%u` di `acl-broker`. Buktikan dengan akun perangkat latihan, 20 detik saat Node 1 sedang mengirim. Di Pi, ganti `<kunci>` dengan kunci `f00d00000005`:

```text
docker compose exec mosquitto mosquitto_sub -u f00d00000005 -P <kunci> -t 'rpm/#' -t '$SYS/#' -v -W 20
```

**Hasilnya (lab penulis):** sesudah 20 detik hanya `Timed out`, padahal Node 1 tiruan mengirim dua `telemetry` dan status *retained*-nya ada di broker; `$SYS` pun tidak. Akun `pemantau` menerima semuanya; akun perangkat hanya boleh membaca `cmd` miliknya (jalan `update` di Praktik 7).

Kuncinya tercatat di riwayat terminal Pi: itu sebabnya memakai perangkat latihan. **Jangan** memakai akun Node 1: nama klien = nama akun (`use_username_as_clientid`, Modul 21), jadi sesinya direbut.

Opsional, lihat izin bawaannya (sandi admin dibaca di dalam kontainer, tidak diketik):

```text
docker compose exec mosquitto sh -c 'mosquitto_ctrl -u admin -P "$MOSQUITTO_DYNSEC_PASSWORD" dynsec getDefaultACLAccess'
```

**Hasilnya (lab penulis; dua baris peringatan `without encryption` di atasnya wajar):**

```text
publishClientSend    : deny
publishClientReceive : deny
subscribe            : deny
unsubscribe          : allow
```

**Kamu lulus langkah ⭐ ini** kalau `mosquitto_sub` berakhir `Timed out` tanpa satu pesan pun, padahal Node 1 sedang mengirim.

#### 3.4 ⭐ Pindah akun lama Modul 21: ganti kunci, kunci baru di Serial, `mosquitto_passwd -D`, lalu *restart* (10 menit)

Semboyannya: akun layanan di berkas sandi, akun perangkat di *dynamic security*. Node 1 masih di berkas sandi, padahal **Nonaktifkan** (Praktik 11) hanya menghapus akun *dynamic security*: baris lama yang tertinggal menghidupkan lagi kuncinya ([Konsep 10](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika)). Pindahkan setiap akun lama di catatan 1.4 satu per satu, saat internet tersambung. Untuk Node 1: matikan MB102, pindahkan kabel USB dari *charger* ke laptop, nyalakan MB102 (aturan emas catu daya: beban dari MB102, bukan pin ESP32, GND bersama), dan buka Serial Monitor (115200 baud, **New Line**): Node 1 menyala ulang dengan kunci lama, yang masih diterima. Lalu:

1. **Ganti kunci.** Di Bruno, *clone* **`ganti kunci perangkat latihan`**, ubah URL-nya menjadi `{{baseUrl}}/devices/<device_id Node 1>/kunci`, kirim, simpan kunci barunya (tampil sekali) di pengelola sandimu, lalu hapus *clone* itu. Jawabannya `200` dan `langkah` `Broker: akun <device_id> sudah dibuat otomatis di broker gerbang pi1 …`. Sejak itu gerbang menolak kunci lama walaupun barisnya masih ada (plugin dibaca lebih dulu).
2. **Segera pasang kunci baru:** ketik di kolom kirim Serial Monitor, lalu **Enter** (resep [Modul 21 3.6](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#36-jalur-perangkat-unggah-lalu-pasang-kunci-node-1-10-menit)):

   ```text
   kunci <kunci baru>
   ```

   **Yang ditulis Serial Monitor (teks dari kode 1.6.0, dipotong; belum direkam penulis di papan):**

   ```text
   kunci: tersimpan di NVS, 43 huruf, berakhiran ...<4 huruf terakhir>
   kunci: Node 1 mencoba masuk ke broker sebagai <device_id> dengan kunci ini sekarang.
   ```

   Segera, karena Node 1 yang tersambung ulang dengan kunci lama ditolak (lab penulis, perangkat tiruan: `disconnected: not authorised.`) dan baru mencoba lagi 60 detik kemudian; makin lama, makin besar peluang `📴` di Telegram.
3. **Hapus baris lamanya** (Pi, folder `edge`), lalu periksa:

   ```text
   docker compose exec -u mosquitto mosquitto mosquitto_passwd -D /mosquitto/data/sandi-broker <device_id>
   ```

   ```text
   docker compose exec mosquitto cut -d: -f1 /mosquitto/data/sandi-broker
   ```

   **Hasilnya (lab penulis):** tinggal `pemantau` dan `pemeriksa` (punyamu bisa juga `nodered` dan akun lama lain).
4. ***Restart*, bukan HUP:**

   ```text
   docker compose restart mosquitto
   ```

   **Hasilnya (lab penulis):** `✔ Container rumahpintar-gerbang-mosquitto-1  Started  0.6s`, Node 1 masuk lagi. Penulis sengaja me-*restart* saat internet dicabut: `Restored 5 client messages`, tanpa `telemetry` hilang, tetapi wasiat `offline` dan kabar `online` yang diantre tiba terbalik, jadi kartu Node 1 `Offline` padahal datanya masuk, sampai statusnya berganti. Lakukan saat internet tersambung. Kembalikan kabel Node 1 ke *charger* dengan urutan yang sama.

Ulangi 1–4 untuk akun lama lain di catatan 1.4, misalnya perangkat latihan `f00d00000001` (langkah 2: 🔀 di bawah). Akun perangkat di broker pusat (Praktik 13 Modul 27) cukup langkah 3–4 di akar proyek mesin pusat. Node 2 tanpa akun broker.

> 🔀 **Tanpa Kit:** simulator tidak punya perintah `kunci`: tulis kunci baru di `KUNCI_F00D00000001=` dalam `alat/.env`, hentikan simulator (**Ctrl + C**), lalu jalankan lagi perintah yang sama.

Langkah 3 wajib: di lab penulis, perangkat yang baris lamanya tertinggal lalu dinonaktifkan diterima lagi dengan kunci Modul 21-nya ([🚨](#-kalau-tidak-jalan) *Perangkat yang dinonaktifkan masih masuk …*).

**Kamu lulus langkah ⭐ ini** kalau `cut -d: -f1` di gerbang tinggal akun layanan, dan Node 1 `Online` dengan kunci baru.

#### 3.5 ⭐ Cadangan akun broker dengan `skrip/cadangkan-akun-broker.sh` (3 menit)

Akun perangkat kini di lemari broker (`dynamic-security.json`), dan mulai Praktik 6 berkas firmware di lemari `data-firmware`. `docker compose down -v` menghapus keduanya: semua perangkat butuh kunci baru, semua firmware diunggah ulang. Skrip ini (tersalin di 2.3) menyalinnya ke `backup/`, pelengkap cadangan database 1.3; resep memulihkannya ada di kepalanya:

```sh
#!/bin/sh
# cadangkan-akun-broker.sh - Modul 28: salin akun broker dari lemari Docker ke folder backup/ (tidak ikut Git):
#   - dynamic-security.json = akun PERANGKAT yang dibuat backend (kode klaim, ganti kunci) + akun admin plugin
#   - sandi-broker          = akun layanan (backend, jembatan-pi, pemantau, ...) dan akun perangkat lama Modul 21
#   - data-firmware/        = berkas firmware yang diunggah admin (hanya di PUSAT, tempat layanan backend berjalan)
# Lemari broker dan lemari firmware milik Compose: "docker compose down -v" menghapusnya. Tanpa cadangan ini, setiap perangkat
# harus diberi kunci baru dan setiap firmware diunggah ulang. Pelengkap resep cadangan database Modul 26 (pg_dump).
#
# Jalankan dari AKAR proyek untuk broker pusat (laptop, VPS, Pi jalur gratis):  sh skrip/cadangkan-akun-broker.sh
#           dari folder edge di Pi untuk broker gerbang:                     sh ../skrip/cadangkan-akun-broker.sh
# Hasilnya: backup/akun-broker-<tanggal-jam>/ di folder tempat perintah diketik, hanya bisa dibaca pemiliknya. Isinya RAHASIA
# (sidik jari sandi, dan berkas .bin Node 1 bisa berisi kunci ESP-NOW): jangan dikirim ke forum, isu, atau AI.
#
# Memulihkan ke lemari baru (broker belum pernah menyala dengan Modul 28, atau lemarinya hilang), dari folder yang sama:
#   docker compose cp backup/akun-broker-<tanggal-jam>/dynamic-security.json mosquitto:/mosquitto/data/
#   docker compose cp backup/akun-broker-<tanggal-jam>/sandi-broker mosquitto:/mosquitto/data/
#   docker compose restart mosquitto        (saat menyala, image menyerahkan kedua berkas ke pengguna mosquitto)
#   pusat saja: docker compose cp -a backup/akun-broker-<tanggal-jam>/data-firmware/. backend:/app/data-firmware/
#               (-a: berkas jadi milik pengguna kontainer, node)
set -eu

tujuan="backup/akun-broker-$(date +%Y-%m-%d-%H%M)"
mkdir -p "$tujuan"
chmod 700 "$tujuan"

# docker compose cp menyalin dari kontainer layanan yang sedang menyala (lemarinya ikut terbaca)
for berkas in dynamic-security.json sandi-broker; do
  if docker compose cp "mosquitto:/mosquitto/data/$berkas" "$tujuan/$berkas" 2>/dev/null; then
    echo "disalin: $berkas"
  else
    echo "tidak ada: $berkas (broker belum pernah memakai berkas ini, atau layanan mosquitto tidak menyala)"
  fi
done

# Berkas firmware hanya ada di pusat. Di gerbang (folder edge) tidak ada layanan backend: dilewati.
if docker compose ps --services --status running 2>/dev/null | grep -qx backend; then
  docker compose cp backend:/app/data-firmware "$tujuan/data-firmware"
  echo "disalin: data-firmware ($(find "$tujuan/data-firmware" -name '*.bin' | wc -l) berkas .bin)"
fi

chmod -R go-rwx "$tujuan"
echo "selesai: $tujuan"
```

Di VPS, akar proyek (jalur gratis: Pi; tanpa Pi: laptop):

```text
sh skrip/cadangkan-akun-broker.sh
```

**Hasilnya (lab penulis, "VPS" tiruan; jam WIB, foldermu memakai jam mesinmu):**

```text
disalin: dynamic-security.json
disalin: sandi-broker
[+] Copying 1/1
 ✔ rumahpintar-backend-1 copy rumahpintar-backend-1:/app/data-firmware to backup/akun-broker-2026-11-02-1518/data-firmware Copied       0.0s
disalin: data-firmware (0 berkas .bin)
selesai: backup/akun-broker-2026-11-02-1518
```

`0 berkas .bin` wajar sebelum Praktik 6: ulangi skrip sesudah mengunggah firmware. Di Pi, folder `edge`: `sh ../skrip/cadangkan-akun-broker.sh`. **Hasilnya (lab penulis):** `disalin: dynamic-security.json`, `disalin: sandi-broker`, `selesai: backup/akun-broker-2026-11-02-1519` (gerbang tanpa backend, jadi tanpa `data-firmware`). Folder cadangan `drwx------`, dan `git status --short` kosong (`backup/` diabaikan Git). Isinya rahasia: sidik jari sandi semua akun, dan berkas `.bin` memuat kunci ESP-NOW serta sandi portal. Di lab penulis, resep di kepala skrip (waktu itu tanpa `-a`) memulihkan akun perangkat tiruan dan unduhan firmware (`200`) sesudah `docker compose down -v` yang disengaja; jangan mengujinya di rumahmu ([🚨](#-kalau-tidak-jalan) *Berkas firmware hilang dari lemari `data-firmware`*).

**Kamu lulus langkah ⭐ ini** kalau `backup/akun-broker-…` di mesin pusat dan di Pi berisi `dynamic-security.json` dan `sandi-broker`, dan `git status --short` tidak menyebutnya.

> ⬆️ **Selesai Praktik 3?** Lanjut ke [Praktik 4](#praktik-4--dashboard-140-dan-layar-armada-dengan-perangkat-tiruan-25-menit): dashboard 1.4.0 dan layar Armada, dicoba dulu dengan perangkat tiruan.

### Praktik 4 — Dashboard 1.4.0 dan layar Armada dengan perangkat tiruan (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, terminal di folder **`frontend`**, **`alat`**, dan **akar proyek**; terminal **mesin pusat** di akar proyek (**SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini`; jalur gratis: SSH ke Pi; tanpa Pi: laptop); **Chrome** dengan DevTools (**F12**); **HP** (4.5); **Bruno** (4.4, opsional). Node 1 tetap 1.6.0. Konsep yang dipakai: 7, 9.
>
> ⭐ **Wajib** — langkah 4.1, 4.2, dan 4.3: image web 1.4.0 menyala dengan menu **Armada**, simulator menulis `online (firmware 1.7.0)` untuk perangkat latihanmu, dan layar **Armada** menampilkan versi dan kesehatan setiap perangkat.

Server sudah menyimpan versi dan kesehatan perangkat sejak Praktik 2; dashboard 1.4.0 menambah layarnya, **Armada**, tanpa paket npm baru. Sebelum Node 1 memakai 1.7.0 di Praktik 5, layar itu diisi perangkat tiruan 1.7.0 dari simulator `alat/`. Kotak **Hasilnya** dari lab penulis: "VPS", Pi, dan internet tiruan di satu mesin; semua perangkat = simulator.

#### 4.1 ⭐ Dashboard 1.4.0: `npm run build`, lalu `docker compose up -d --build web` (8 menit)

Dashboard berubah di 28 berkas; satu di antaranya, `frontend/caddy/Caddyfile`, sudah kamu salin di 2.3. Pakai cara 2.2 di laptop (diuji penulis di Linux): unduh [`kode/frontend-1.4.diff`](kode/frontend-1.4.diff) dengan **Download raw file** ke akar proyek, lalu di terminal akar proyek:

```text
git apply --check --exclude=frontend/caddy/Caddyfile frontend-1.4.diff
```

Tanpa keluaran = bisa diterapkan: jalankan lagi tanpa `--check`, lalu hapus berkas *diff*-nya (tanpa `--exclude`, Git menolak Caddyfile yang sudah baru). Ditolak? Seperti 2.2: salin berkas di daftar `git apply --stat frontend-1.4.diff` dari `kode/frontend/`. `git status --short frontend` kini menyebut 10 berkas baru dan 17 berkas diubah. Lalu di terminal folder `frontend`, satu per satu: `npm ci`, `npm run lint`, `npm run build`, dan `npm run cek-skema`.

**Hasilnya (lab penulis, 2 November 2026, dipotong; empat perintah berurutan):**

```text
added 424 packages, and audited 425 packages in 17s
10 vulnerabilities (2 low, 8 moderate)
Found 0 warnings and 0 errors.
✓ 1717 modules transformed.
(!) Some chunks are larger than 500 kB after minification. Consider:
PWA v2.0.0
precache  10 entries (1105.09 KiB)
SAMA  src/skema/kontrak.ts
SAMA  src/skema/aturan-dasar.ts
```

Peringatan *chunk* sudah ada sejak Modul 23. Angka audit bergantung pada tanggal: per 2 November 2026 kesepuluhnya ada di alat *build* di bawah `vite-plugin-pwa` (`deepmerge`, `glob`, `minimatch`), dan `npm audit --omit=dev` menulis `found 0 vulnerabilities` (lab penulis). **Jangan** `npm audit fix --force`: sarannya *turun* ke `vite-plugin-pwa` 1.1.0. Di terminal akar proyek:

```text
git add frontend
git commit -m "Modul 28 Praktik 4: dashboard 1.4.0 (layar Armada)"
git push
```

Di terminal mesin pusat, akar proyek: `git pull` (tanpa Pi: lewati), lalu bangun image web, seperti [Modul 27 7.4](../modul-27-deploy-internet-tls-pwa/README.md#74-docker-compose-build-di-vps-sebelum-layanan-lain-menyala-12-menit):

```text
docker compose up -d --build web
```

**Hasilnya (lab penulis, "VPS" tiruan, dipotong; ±35 detik karena lapisan `npm ci` sudah di *cache*; di mesinmu `npm ci` ikut berjalan):**

```text
 ✔ ghcr.io/<akun>/rumah-pintar-mini-web:1.4.0  Built
 ✔ Container rumahpintar-web-1                 Started
```

Kini `docker compose up -d` tanpa nama layanan aman lagi, dan Caddyfile 2.3 berlaku (`/fw/*` dan pintu perangkat `:8081`, [Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)). Buka dashboard di Chrome sebagai admin: menu **Armada** ada di samping **Aturan**. Belum ada? Muat ulang lagi: *service worker* memakai versi baru pada pembukaan berikutnya ([Modul 27 Konsep 11](../modul-27-deploy-internet-tls-pwa/README.md#11-pwa-dari-pintasan-menjadi-aplikasi)).

> 🔀 **Jalur gratis:** kolom PORTS `docker compose ps web` kini memuat `192.168.1.37:80->8081/tcp` (setelan 2.3), jadi WiFi rumah hanya melihat pintu perangkat, dan `http://192.168.1.37` di browser dijawab `Pintu ini hanya untuk perangkat …` (benar; dashboard tetap lewat terowongan).

**Kamu lulus langkah ⭐ ini** kalau `npm run build` menulis `PWA v2.0.0`, `cek-skema` menulis dua `SAMA`, `up -d --build web` menulis `…-web:1.4.0  Built` dan `Started`, dan menu **Armada** tampil.

#### 4.2 ⭐ Perangkat tiruan 1.7.0 dari simulator `alat/` (6 menit)

Simulator Modul 28 meniru rancangan firmware 1.7.0 tanpa mem-*flash* apa pun: `vitals`-nya membawa `reset_reason` dan `fw`. Di laptop, ganti isi berkas ini di folder `alat` dengan berkas bernama sama di [`kode/alat/`](kode/alat/) (**Copy raw file**): `simulator-perangkat.js`, `pemeriksa-kontrak.js` (kontrak 1.6, untuk 5.5), `README.md`, dan `.env.example`, ditambah berkas baru `buat-bin-tiruan.js` dan `buat-bin-tiruan.test.js` (jalur tanpa Kit, Praktik 6). Lalu, di akar proyek:

```text
git add alat
git commit -m "Modul 28 Praktik 4: simulator, pemeriksa kontrak 1.6, dan pembuat berkas .bin tiruan"
git push
```

Di `alat/.env` (di luar Git), `KUNCI_F00D00000005` sudah ada sejak 3.2. Tambahkan `ALAMAT_SERVER=` dengan alamat yang **sama persis** dengan `.env` mesin pusat ([2.3](#23--berkas-infrastruktur-dan-env-mesin-pusat-mosquitto_dynsec_password-dan-alamat_server-6-menit)), misalnya `ALAMAT_SERVER=https://iot.namaanda.my.id`: seperti Node 1, perangkat tiruan hanya mengunduh dari alamat itu. Hentikan simulator lama (**Ctrl + C**) bila masih berjalan, lalu di terminal folder `alat`:

```text
node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 5
```

`5` = perangkat tiruan `f00d00000001` sampai `f00d00000005`; yang kuncinya tidak ada di `alat/.env` dilewati. Begitu `online`, ketik `ota` lalu **Enter**.

**Hasilnya (lab penulis, simulator; `f00d00000001` = perangkat latihan Modul 21; dipotong):**

```text
2 perangkat palsu menuju mqtt://192.168.1.37:1883 (firmware tiruan bawaan 1.7.0). Ketik misalnya …
f00d00000001: online (firmware 1.7.0)
f00d00000005: online (firmware 1.7.0)
ota
f00d00000001: firmware 1.7.0, alamat server https://iot.namaanda.my.id, reset_reason POWERON
f00d00000005: firmware 1.7.0, alamat server https://iot.namaanda.my.id, reset_reason POWERON
```

Versi `0.1.0` (simulator Modul 27) kini hilang. Biarkan simulator berjalan; dihentikan lalu dijalankan lagi pun aman: versi hasil pembaruan kelak tersimpan di folder `data/` (pengganti NVS, di luar Git). Muncul `ALAMAT_SERVER di alat/.env tidak dipakai: …`? Bentuk alamatnya salah (2.3). `DITOLAK broker (kode 5)`? Kunci di `alat/.env` masih yang lama (3.4).

> 🔀 **Tanpa Pi:** brokernya `mqtt://127.0.0.1:1883`. **Tanpa Kit:** `f00d00000001` = Node 1 tiruanmu, jadi `online (firmware 1.7.0)`-nya adalah **O0 tiruan** (Praktik 5 dilewati); ketik juga `kebun mulai` untuk Kebun tiruan (Modul 25).

**Kamu lulus langkah ⭐ ini** kalau simulator menulis `online (firmware 1.7.0)` untuk perangkat latihanmu, dan `ota` menulis alamat server yang sama persis dengan `.env` mesin pusat.

#### 4.3 ⭐ Layar Armada: ringkasan, kartu kesehatan, rilis firmware, dan perangkat baru (5 menit)

Klik **Armada**: ringkasan `<n> perangkat aktif (+1 nonaktif) · rilis terbaru Node 1: belum ada` (`nonaktif` = perangkat uji Modul 21 yang kamu cabut), lalu tiga bagian. **Perangkat**: satu kartu per perangkat, isinya [Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason). **Rilis firmware**: `Belum ada firmware yang diunggah ke server.` dan formulir **Unggah firmware Node 1** (Praktik 6). **Perangkat baru**: **Buat kode klaim** (Praktik 10).

**Hasilnya (lab penulis, Chrome tanpa layar, admin, 1280 px; perangkat tiruan; teks layar, dipotong):**

```text
3 perangkat aktif · rilis terbaru Node 1: belum ada
Latihan ruang tamu  Online
Node 1 · ruang tamu · f00d00000001 · terakhir dilihat 6 detik yang lalu
Versi firmware 1.7.0   Menyala ulang karena POWERON listrik baru masuk atau tombol EN
Sinyal WiFi -55 dBm (sangat kuat)   RAM 184 KB bebas   Lama menyala 0 detik
Kesehatan dari vitals terakhir, Sen, 2 Nov, 15.24 WIB; vitals dikirim setiap 300 detik (bawaan firmware).
Kebun (tiruan)  Online
Versi firmware 1.0.0   Kesehatan Node 2 tidak mengirim vitals
OTA tidak tersedia untuk Node 2: perbarui lewat kabel.
```

Kartu Node 1-mu (masih 1.6.0) menulis `— (firmware lama belum melaporkan)` di **Menyala ulang karena**: 1.6.0 memang belum mengirim `reset_reason`. Node 2 tampil tanpa **Perbarui** ([Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota)), dan **Perbarui** Node 1 mati: `Belum ada firmware yang diunggah.` Lencana status punya nilai baru untuk Praktik 7, `berhenti sengaja` (juga di layar **Perangkat**; dulu "mode offline", [Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi)). Status dan versi datang lewat Socket.IO tanpa *polling*; angka kesehatan baru diambil ulang saat ada kabar atau halaman dimuat ulang (Konsep 9). Cek tab **Network** DevTools: 30 detik diam, tanpa permintaan `armada` baru (lab penulis: 0, satu WebSocket `wss://iot.namaanda.my.id/api/socket.io/`).

**Kamu lulus langkah ⭐ ini** kalau **Armada** menampilkan kartu setiap perangkatmu: perangkat latihan `1.7.0` dengan `POWERON`, Node 1 `1.6.0` (tanpa Kit: Node 1 tiruan `1.7.0`), dan Node 2 dengan `OTA tidak tersedia untuk Node 2: perbarui lewat kabel.`

#### 4.4 Masuk sebagai *viewer*: hanya melihat, tanpa tombol (3 menit)

Klik **Keluar**, masuk dengan `viewer@rumah.test` ([Modul 24 3.3](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#33--ganti-akun-di-tab-yang-sama-tanpa-sisa-khusus-admin-dan-403-di-bruno-15-menit)), lalu klik **Armada**. Layarnya sama tanpa formulir unggah, **Perbarui**, **Canary**, **Pengaturan lain**, dan **Perangkat baru**; di bawahnya `Akunmu viewer: kamu bisa melihat armada, tetapi …`. **Hasilnya (lab penulis):** yang bisa diklik di isi halaman hanya **Riwayat pembaruan**. Menyembunyikan tombol bukan pengaman ([Modul 24 Konsep 5](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan)); opsional, di Bruno **`login viewer`** lalu **`jadikan Node 1 canary`**. **Hasilnya (lab penulis; berkas Bruno dijalankan skrip):** `403 Forbidden`, `{"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}`. Lalu **`login admin`** lagi.

#### 4.5 Lebar HP 375 px dan mode gelap (3 menit)

Buka **Armada** di HP bertema gelap (jalur utama dan gratis: aplikasi Modul 27; tanpa Pi: mode HP `http://192.168.1.10`); menu **Armada** belum ada? Tutup aplikasinya, lalu buka lagi. Tanpa HP: DevTools → **Rendering** → **prefers-color-scheme: dark**, lalu mode perangkat (**Ctrl + Shift + M**) selebar `375` ([Modul 23 5.3](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#53-mode-gelap-kelas-dark-dan-warna-grafik-20-menit)). Kartu bertumpuk satu kolom dan halaman tidak bisa digeser ke samping. **Hasilnya (lab penulis, mode perangkat Chrome 375 px, gelap):** `scrollWidth 375 = clientWidth 375`, admin dan *viewer*. Sesudahnya kembalikan **No emulation**, matikan mode perangkat, dan masuk lagi sebagai admin. Gambar: lab penulis, mode perangkat Chrome (bukan HP), semua perangkat simulator; Node 1 tiruan sengaja dijalankan sebagai 1.6.0, seperti Node 1-mu sebelum Praktik 5; nama dan angkamu berbeda.

![Komposit tangkapan layar asli layar Armada dashboard Rumah Pintar Mini 1.4.0 dengan backend 1.5.0 di VPS tiruan, di mode perangkat Chrome 375 piksel bermode gelap di Linux, bukan HP sungguhan; bilah alamat tidak tertangkap. Praktik 4.4 dan 4.5, 2 Nov 2026 pukul 17.00 WIB; semua perangkat adalah simulator. Tiga potongan halaman akun viewer. Kiri: Rumah Pintar Mini dengan lencana Live, menu Armada, nama Tamu Rumah (viewer) (nomor 1), ringkasan 3 perangkat aktif · rilis terbaru Node 1: belum ada, lalu kartu Latihan ruang tamu Online, Node 1 tiruan f00d00000001 yang masih 1.6.0 dengan Menyala ulang karena — (firmware lama belum melaporkan) (nomor 2), sinyal -71 dBm (cukup), RAM 190 KB bebas, lama menyala 30 menit, dan hanya tautan Riwayat pembaruan (nomor 5). Tengah: kartu Latihan dapur f00d00000005 versi 1.7.0, POWERON listrik baru masuk atau tombol EN, -46 dBm (sangat kuat), 182 KB bebas, 30 menit, vitals 16.59 WIB setiap 300 detik (nomor 3); kartu Kebun (tiruan), Node 2 lewat f00d00000001, versi 1.0.0, Node 2 tidak mengirim vitals, OTA tidak tersedia untuk Node 2: perbarui lewat kabel. (nomor 4). Kanan atas: Rilis firmware, Belum ada firmware yang diunggah ke server., dan kalimat Akunmu viewer: kamu bisa melihat armada, tetapi unggah firmware, pembaruan, kode klaim, dan menonaktifkan perangkat khusus admin. (nomor 5). Kanan bawah, pembanding akun admin pada kartu Node 1: Perbarui ke versi belum ada rilis, tombol Perbarui mati, centang Canary, Pengaturan lain (nomor 6). Legenda bernomor di bawah.](aset/armada-di-hp.png)

> ⬆️ **Selesai Praktik 4?** [Praktik 5](#praktik-5--node-1-170-lewat-kabel-untuk-terakhir-kalinya-25-menit-butuh-papan) butuh papan: Node 1 dipasang 1.7.0 lewat kabel untuk terakhir kalinya. Jalur tanpa Kit: perangkat tiruanmu sudah "1.7.0" sejak [4.2](#42--perangkat-tiruan-170-dari-simulator-alat-6-menit), jadi lanjut ke [Praktik 6](#praktik-6--membangun-171-dan-mengunggahnya-ke-server-15-menit) dengan berkas tiruan.

### Praktik 5 — Node 1 1.7.0 lewat kabel, untuk terakhir kalinya (25 menit, butuh papan)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** dan **Serial Monitor** dengan kabel USB dari laptop ke Node 1 (5.1–5.5); **VS Code** di laptop, terminal di **akar proyek** (5.1, 5.2, 5.4) dan di folder **`alat`** (5.5); **Chrome**, layar **Armada** (5.4). Konsep yang dipakai: 2, 4.
>
> ⭐ **Wajib untuk jalur ber-Kit** — langkah 5.1, 5.2, 5.3, dan 5.4: firmware 1.7.0 dengan `masa-uji.cpp` terpasang lewat kabel dengan setelan Modul 10, portalnya bersandi, alamat server tersimpan di Node 1, dan kartu Node 1 di **Armada** menulis versi `1.7.0` beserta `reset_reason` (bukti **O0**).

> [!NOTE]
> **Dikompilasi penulis, belum dijalankan di papan.** Pada 2 November 2026 penulis mengompilasi firmware 1.7.0 dengan `arduino-cli` 1.5.1, paket esp32 3.3.12, dan library versi persis, memakai setelan 5.1: tanpa galat, tanpa peringatan dari berkas `node-1-rumah`, dan *rollback* aktif menurut daftar simbolnya (`nm`). Unggahan kabel, Serial Monitor, dan kartu Node 1 sungguhan belum pernah dilihat penulis: teks Serial di bawah = teks dari kode, angka ukuran = hasil kompilasi penulis, dan kotak **Hasilnya** di 5.5 = simulator.

Node 1 1.6.0 tidak bisa diperbarui dari server: ia menjawab `update` dengan `aksi update belum didukung (Modul 28)`. Firmware 1.7.0 adalah versi pertama yang punya pembaruan lewat udara dan masa uji, jadi ia masuk lewat kabel untuk terakhir kalinya. Server sudah siap sejak Praktik 2–4 sehingga `vitals` baru Node 1 langsung diterima backend 1.5.0.

> 🔀 **Tanpa Kit:** lewati praktik ini sampai papan datang, lalu tarik rilis tiruan (8.4): versi asli mulai 1.7.3. Perangkat tiruanmu sudah "1.7.0" sejak [4.2](#42--perangkat-tiruan-170-dari-simulator-alat-6-menit); ketik `ota` di terminal simulator (lab penulis: `f00d00000001: firmware 1.7.0, alamat server https://iot.namaanda.my.id, reset_reason POWERON`) = **O0** tiruan, dan 5.5 bisa dicoba dengan `restart` di terminal simulator. **Wokwi:** `PAKAI_WOKWI = true` (broker publik; `WOKWI_BERKUNCI` seperti Modul 21, dan jangan mengetik kunci perangkat aslimu di sana); `vitals` dengan `reset_reason` dan `fw` hanya terlihat di Serial Monitor (`log debug`) atau MQTTX, tidak di **Armada** (broker publik). Belum diuji penulis; 1.7.0 bisa tidak muat di rak bawaan Wokwi (1.310.720 byte).

#### 5.1 ⭐ Paket esp32 3.3.12, skema Minimal SPIFFS, dan firmware 1.7.0 dengan `masa-uji.cpp` (8 menit)

**Paket dan library.** Di Arduino IDE, buka **Boards Manager** (ikon bergambar papan di bilah kiri): **esp32 by Espressif Systems** harus **3.3.12**, sama dengan Modul 21 (alasannya di [🧰](#-yang-perlu-disiapkan)). Di **Library Manager** (ikon buku), cocokkan versi WiFiManager 2.0.17 dan library Node 1 lain dengan tabel yang sama: tidak ada library baru, dan Adafruit GFX tetap 1.12.6 (jangan klik **Update** ke 1.13.0, yang belum diuji penulis).

**Setelan Modul 10** (menu **Tools**): **Board** → **ESP32 Dev Module**; **Partition Scheme** → **Minimal SPIFFS (1.9MB APP with OTA/128KB SPIFFS)**, yaitu dua rak program pilihan [Silabus](../../SILABUS.md#modul-10--wifi--http-perangkat-mulai-berbicara-dengan-jaringan) sejak Modul 10; **Flash Mode** → **DIO** (menu menulis `Flash Mode: "DIO"`); dan **Erase All Flash Before Sketch Upload** tetap **Disabled**, supaya NVS selamat: WiFi, kunci broker dari 3.4, dan ambang. Skema bawaan terlalu kecil untuk 1.7.0, sedangkan skema bertulisan **No OTA** atau **Huge APP** tidak punya rak kedua ([🚨](#-kalau-tidak-jalan) *Program melebihi rak: …*).

**Firmware 1.7.0** (VS Code, terminal akar proyek, cabang `fitur/armada`). Yang berubah 24 berkas: baru `versi`, `periksa-ota`, `pembaruan`, `masa-uji`, dan `klaim` (masing-masing `.h` dan `.cpp`) serta README firmware; diubah `aktuator`, `jaringan`, `pengaturan`, dan `sistem` (`.h` dan `.cpp`), `perintah.cpp`, `node-1-rumah.ino`, `kunci.contoh.h`, `konfigurasi.h`, dan `PETA-PIN.md` versi 7 (pin tetap; bagian baru untuk Praktik 12). Node 2 tidak berubah. Cara tercepat: buka [`kode/firmware-1.7.diff`](kode/firmware-1.7.diff), klik **Download raw file**, dan simpan di akar proyek. `konfigurasi.h` berisi angka milikmu sendiri (`ALAMAT_BROKER`, kalibrasi Modul 6, `MAC_NODE2`, juga `ZONA_WAKTU` bila zonamu bukan WIB), jadi *diff* bisa ditolak di berkas itu. Kecualikan berkas itu:

```text
git apply --exclude=firmware/node-1-rumah/konfigurasi.h firmware-1.7.diff
```

Tanpa keluaran = diterapkan; hapus berkas *diff*-nya. Ditolak juga (misalnya CRLF di Windows)? Berarti belum satu berkas pun diterapkan: salin ke-23 berkas lainnya satu per satu dengan **Copy raw file** dari [`kode/firmware/`](kode/firmware/) dan [`kode/PETA-PIN.md`](kode/PETA-PIN.md). Kedua cara tidak menyentuh `konfigurasi.h`: catat angka-angkamu, ganti isinya dengan [versi 1.7.0](kode/firmware/node-1-rumah/konfigurasi.h) (**Copy raw file**), lalu tulis lagi angka itu (`ALAMAT_BROKER` = IP gerbang Pi-mu; tanpa Pi: IP laptop). Periksa dengan `git diff firmware/node-1-rumah/konfigurasi.h`: yang berubah hanya bagian versi (`VERSI_FIRMWARE` `"1.7.0"`, `CATATAN_VERSI` baru), komentar baris `ALAMAT_BROKER` dan `JEDA_VITALS`, dan blok Modul 28 di akhir: `ALAMAT_SERVER_BAWAAN` kosong (alamat server diisi lewat Serial di 5.4), `MASA_UJI_OTA = 60000`, dan `UJI_KUNCI_SALAH = 0`. Baris lain yang ikut berubah berarti angkamu tertimpa contoh: kembalikan.

Sekarang baca `masa-uji.cpp`, berkas yang membuat *rollback* benar-benar bekerja ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c)). Komentarnya bagian dari pelajaran:

```cpp
// masa-uji.cpp - isi modul masa uji. Daftar fungsinya ada di masa-uji.h.
// Dikompilasi penulis (arduino-cli 1.5.1, esp32 3.3.12), tetapi BELUM dijalankan di papan: README firmware, "Status 1.7.0".
#include <Arduino.h>
#include <esp_ota_ops.h>  // ESP-IDF: keadaan rak program (otadata), sahkan atau batalkan firmware
#include <esp_task_wdt.h> // watchdog: menjaga setup() selama masa uji
#include "konfigurasi.h"
#include "pencatat.h"
#include "sistem.h"
#include "layar.h"
#include "pembaruan.h"
#include "masa-uji.h"

// ================================================================================================================
// BARIS PALING PENTING DI MODUL 28: tanpa baris ini, rollback otomatis TIDAK PERNAH terjadi, dan tidak ada pesan apa pun.
//
// Bootloader paket esp32 3.3.12 sudah bisa me-rollback: firmware yang baru dipasang lewat udara menyala dengan keadaan
// PENDING_VERIFY ("menunggu dibuktikan"). Tetapi sebelum setup() berjalan, inti Arduino (initArduino() di
// esp32-hal-misc.c) bertanya pada fungsi verifyRollbackLater(): "mau membuktikan sendiri nanti?". Jawaban bawaannya
// false, sehingga inti Arduino langsung menandai firmware baru SAH, sebelum ia sempat mencoba broker. Firmware dengan
// kunci broker yang salah pun dianggap sah, dan tidak akan pernah kembali ke versi lama.
//
// Fungsi di bawah ini menggantikan jawaban bawaan itu dengan true: "ya, saya buktikan sendiri" (masa uji di bawah).
//
// Kenapa extern "C"? Fungsi bawaannya ditulis dalam bahasa C (berkas .c). C++ diam-diam mengubah nama setiap fungsi
// saat dikompilasi (name mangling, misalnya menjadi _Z19verifyRollbackLaterv) supaya fungsi bernama sama boleh punya
// parameter berbeda. Tanpa extern "C", fungsi kita bernama lain di mata linker, fungsi bawaan tetap dipakai, dan
// kompilasi tetap BERHASIL tanpa peringatan apa pun. extern "C" = "pakai nama apa adanya, seperti bahasa C", sehingga
// fungsi kita menggantikan fungsi bawaan (yang ditandai weak = "boleh diganti").
// ================================================================================================================
extern "C" bool verifyRollbackLater() {
  return true;
}

static bool masaUji = false;

// Batas watchdog selama setup() firmware yang sedang masa uji: 60 detik masa uji + 15 detik. Kalau setup() selesai lebih
// cepat (biasanya beberapa detik), batasnya kembali 5 detik di akhir setup() seperti biasa.
const unsigned long BATAS_WATCHDOG_SETUP_UJI = MASA_UJI_OTA + 15000;

// Nama keadaan rak program di otadata (esp_ota_img_states_t), untuk perintah Serial "ota".
static const char* namaKeadaan(esp_ota_img_states_t keadaan) {
  switch (keadaan) {
    case ESP_OTA_IMG_NEW: return "NEW, belum pernah menyala";
    case ESP_OTA_IMG_PENDING_VERIFY: return "PENDING_VERIFY, masa uji";
    case ESP_OTA_IMG_VALID: return "VALID, sudah terbukti";
    case ESP_OTA_IMG_INVALID: return "INVALID, ditolak";
    case ESP_OTA_IMG_ABORTED: return "ABORTED, batal";
    case ESP_OTA_IMG_UNDEFINED: return "UNDEFINED, dipasang lewat kabel";
    default: return "tidak dikenal";
  }
}

void mulaiMasaUji() {
  const esp_partition_t* berjalan = esp_ota_get_running_partition();
  esp_ota_img_states_t keadaan;
  if (berjalan == nullptr || esp_ota_get_state_partition(berjalan, &keadaan) != ESP_OK) {
    return;  // keadaan tidak tercatat (misalnya baru dipasang lewat kabel): tidak ada masa uji
  }
  if (keadaan != ESP_OTA_IMG_PENDING_VERIFY) {
    return;
  }
  masaUji = true;
  logInfo("MASA UJI: firmware %s baru dipasang lewat udara di rak %s. Dalam %lu detik ia harus tersambung ke broker "
          "dan terbit; kalau tidak, Node 1 kembali sendiri ke firmware sebelumnya.", VERSI_FIRMWARE, berjalan->label,
          MASA_UJI_OTA / 1000);
  logInfo("Selama masa uji, portal WiFi tidak dibuka dan perintah update ditolak.");

  // Masa uji juga menjaga setup(). Biasanya watchdog baru mengawasi loop() di AKHIR setup(), dan masa uji diperiksa di
  // loop(). Firmware baru yang macet di setup() (misalnya menunggu sensor selamanya) tidak akan pernah sampai ke loop(),
  // jadi tidak pernah di-rollback. Karena itu, mulai sekarang watchdog mengawasi tugas ini dengan batas 75 detik: macet di
  // setup() = watchdog me-restart Node 1, dan bootloader membatalkan firmware yang belum terbukti (PENDING_VERIFY menjadi
  // ABORTED), sehingga Node 1 tetap kembali ke firmware lama dan melapor "rollback".
  // Urutannya: daftarkan dulu, baru atur batasnya (memberi makan watchdog sebelum terdaftar = galat "task not found").
  if (esp_task_wdt_status(NULL) != ESP_OK) {   // ESP_OK = tugas ini sudah diawasi
    esp_task_wdt_add(NULL);                    // NULL = tugas yang sedang berjalan: setup() lalu loop()
  }
  aturBatasWatchdog(BATAS_WATCHDOG_SETUP_UJI);  // sistem.cpp
}

bool dalamMasaUji() {
  return masaUji;
}

void firmwareTerbukti() {
  if (!masaUji) {
    return;
  }
  masaUji = false;
  // Tandai sah DULU, baru catat di NVS: kalau listrik padam di antara keduanya, firmware ini tetap sah dan
  // siapkanPembaruan() di nyala berikutnya menulis laporan "berhasil" dari rencana yang tertinggal.
  esp_err_t galat = esp_ota_mark_app_valid_cancel_rollback();  // otadata: PENDING_VERIFY -> VALID
  char pesan[PANJANG_PESAN_OTA_MAKS + 1] = "";
  if (galat != ESP_OK) {
    snprintf(pesan, sizeof(pesan), "gagal ditandai sah: %s", esp_err_to_name(galat));
    logError("Firmware %s %s: restart berikutnya bisa kembali ke firmware lama.", VERSI_FIRMWARE, pesan);
  }
  RencanaOta r;
  if (bacaRencanaOta(r)) {
    if (pesan[0] == '\0' && strcmp(VERSI_FIRMWARE, r.ke) != 0) {
      snprintf(pesan, sizeof(pesan), "fw %s, bukan %s: VERSI_FIRMWARE lupa dinaikkan?", VERSI_FIRMWARE, r.ke);
    }
    catatHasilOta(r.id, "berhasil", r.ke, pesan);
    hapusRencanaOta();
  }
  logInfo("Firmware %s SAH: tersambung ke broker dan terbit %lu detik sesudah menyala.", VERSI_FIRMWARE, millis() / 1000);
}

void perbaruiMasaUji() {
  if (!masaUji || millis() < MASA_UJI_OTA) {  // millis() dihitung sejak Node 1 menyala
    return;
  }
  masaUji = false;
  RencanaOta r;
  bool adaRencana = bacaRencanaOta(r);
  logError("Firmware %s TIDAK terbukti dalam %lu detik (tidak tersambung ke broker): ROLLBACK ke firmware sebelumnya.",
           VERSI_FIRMWARE, MASA_UJI_OTA / 1000);
  if (adaRencana) {  // laporan disimpan SEBELUM restart: sesudah restart, yang menyala adalah firmware lama
    catatHasilOta(r.id, "rollback", r.ke, "tidak tersambung ke broker dalam 60 detik");
    hapusRencanaOta();
  }
  tampilkanPesan("ROLLBACK", "firmware baru gagal", "kembali ke versi", adaRencana ? r.dari : "sebelumnya");
  Serial.flush();
  esp_err_t galat = esp_ota_mark_app_invalid_rollback_and_reboot();  // otadata: INVALID, lalu restart ke rak lama
  // Kalau sampai di sini, fungsi di atas GAGAL dan tidak me-restart (misalnya rak lama tidak sah). Restart biasa tetap
  // membatalkan firmware ini: bootloader mengubah PENDING_VERIFY menjadi ABORTED dan memilih rak lama.
  logError("Rollback otomatis gagal (%s): restart biasa.", esp_err_to_name(galat));
  Serial.flush();
  delay(100);
  ESP.restart();
}

void cetakInfoRak() {
  const esp_partition_t* berjalan = esp_ota_get_running_partition();
  const esp_partition_t* sebelah = esp_ota_get_next_update_partition(nullptr);
  esp_ota_img_states_t keadaan;
  const char* teks = "tidak tercatat (dipasang lewat kabel)";
  if (berjalan != nullptr && esp_ota_get_state_partition(berjalan, &keadaan) == ESP_OK) {
    teks = namaKeadaan(keadaan);
  }
  Serial.printf("ota: rak berjalan %s (%s); rak sebelah %s, %lu byte\n", berjalan != nullptr ? berjalan->label : "?", teks,
                sebelah != nullptr ? sebelah->label : "TIDAK ADA (skema partisi tanpa OTA)",
                sebelah != nullptr ? (unsigned long)sebelah->size : 0UL);
  const esp_partition_t* batal = esp_ota_get_last_invalid_partition();
  if (batal != nullptr) {
    Serial.printf("ota: rak %s pernah dibatalkan (firmware yang gagal membuktikan diri)\n", batal->label);
  }
  if (masaUji) {
    unsigned long sisa = millis() < MASA_UJI_OTA ? (MASA_UJI_OTA - millis()) / 1000 : 0;
    Serial.printf("ota: MASA UJI, sisa %lu detik\n", sisa);
  } else {
    Serial.println("ota: masa uji: tidak");
  }
}
```

- **Baris 13–32:** `extern "C" bool verifyRollbackLater()` menjawab `true`, jadi inti Arduino tidak lagi mengesahkan firmware baru sebelum `setup()`. **Jangan ubah atau hapus baris ini.** Tanpa `extern "C"`, kompilasi tetap berhasil tanpa peringatan, tetapi *rollback* mati ([🔬](#-bedah-teknis-opsional) *Name mangling dan `extern "C"`*).
- **`mulaiMasaUji()`** (dari `setup()`): rak yang berjalan masih `PENDING_VERIFY`? Masa uji dimulai, dan *watchdog* 75 detik ikut mengawasi `setup()`, jadi firmware yang macet sebelum `loop()` pun kembali ke versi lama.
- **`firmwareTerbukti()`**: dipanggil `jaringan.cpp` begitu kunci diterima broker, lalu `online` dan langganan `cmd` dikirim. Ia menandai firmware sah dulu, baru menulis laporan `berhasil` di NVS.
- **`perbaruiMasaUji()`**: 60 detik lewat tanpa bukti, laporan `rollback` disimpan dulu, OLED menulis `ROLLBACK`, lalu rak ditandai batal dan papan menyala ulang. Penandaan gagal? `ESP.restart()` biasa tetap membatalkannya.
- **`cetakInfoRak()`**: jawaban perintah Serial `ota` di 5.4.

**Kamu lulus langkah ⭐ ini** kalau paket esp32 3.3.12 dan setelan Modul 10 terpilih, `git diff` `konfigurasi.h` hanya berisi perubahan Modul 28, dan `masa-uji.cpp` memuat baris `extern "C" bool verifyRollbackLater() {`.

#### 5.2 ⭐ Portal bersandi: `SANDI_PORTAL` di `kunci.h` (3 menit)

Selama portal WiFi Node 1 terbuka, alamat `192.168.4.1/update` bawaan WiFiManager ikut aktif walau tombolnya disembunyikan ([Modul 10 ➕ D](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#d-verify-upload-dan-sambungkan-ke-wifi)), dan mulai minggu ini portal lebih sering dibuka. Dengan sandi, hanya HP yang tahu sandinya bisa bergabung ke WiFi `Node1-Rumah` (Konsep 8). Buka sketsa `node-1-rumah` dan tab `kunci.h` (dibuat di Modul 14 dan dijaga `.gitignore`; belum ada? Buat tab `kunci.h` berisi salinan `kunci.contoh.h` apa adanya), lalu tambahkan satu baris:

```cpp
#define SANDI_PORTAL "<sandi-portal>"
```

Ganti `<sandi-portal>` dengan sandi baru 8–63 huruf (aturan sandi WiFi WPA2) dan simpan di pengelola sandimu: HP memakainya di [10.3](#103--portal-node1-rumah-dari-hp-wifi-kode-klaim-alamat-server-dan-alamat-broker-7-menit), dan sandi yang sama ditulis di label kotak ([12.9](#129--k1-ad-label-tutup-kotak-lalu-node-1-online-lagi-5-menit)). Tiga hal:

- Panjang di luar 8–63 huruf menghentikan kompilasi dengan `static assertion failed: SANDI_PORTAL di kunci.h harus 8-63 huruf (aturan sandi WiFi WPA2), atau hapus barisnya` (dicoba penulis dengan sandi 6 huruf).
- `kunci.h` kini dibaca dua berkas (`jembatan.cpp` sejak Modul 14 dan `jaringan.cpp`), jadi variabel di dalamnya harus tetap `const` seperti di `kunci.contoh.h`; tanpa `const`, kompilasi berhenti dengan `multiple definition` ([🚨](#-kalau-tidak-jalan) *Kompilasi berhenti: …*).
- Sandi ini ikut terkompilasi ke berkas `.bin`, seperti kunci ESP-NOW-mu (diuji penulis dengan `strings`): satu alasan lagi berkas itu tidak pernah dibagikan (Konsep 6).

Tanpa baris itu, portal terbuka seperti Modul 10, dan setiap kali portal dibuka, Serial Monitor memperingatkan (teks dari kode): `Portal TANPA sandi: siapa pun di dekat Node 1 bisa membuka 192.168.4.1, termasuk halaman /update. Isi SANDI_PORTAL di kunci.h (Modul 28).`

**Kamu lulus langkah ⭐ ini** kalau `kunci.h` Node 1 berisi `SANDI_PORTAL` 8–63 huruf yang tersimpan di pengelola sandimu, dan `git status --short` tidak menyebut `kunci.h`.

#### 5.3 ⭐ Upload lewat kabel, lalu baca ukuran program terhadap rak 1.966.080 byte (5 menit)

Pindahkan kabel USB Node 1 dari *charger* ke laptop dengan urutan aturan emas catu daya Modul 9: MB102 mati dulu, pindahkan kabelnya, lalu nyalakan MB102. Beban (relay, pompa, servo) tetap dicatu MB102, bukan dari pin ESP32, dengan GND bersama. Pilih port USB di **Tools → Port**, lalu klik **Upload**. Macet di `Connecting…`? Tahan **BOOT** begitu tulisan itu muncul, lepaskan saat `Writing at …` mulai berjalan.

Arduino IDE menulis kira-kira (angka dari kompilasi penulis dengan `arduino-cli`, setelan yang sama):

```text
Sketch uses 1410887 bytes (71%) of program storage space. Maximum is 1966080 bytes.
Global variables use 58396 bytes (17%) of dynamic memory, leaving 269284 bytes for local variables. Maximum is 327680 bytes.
```

Programnya sekitar 1,41 juta byte, ±217 ribu byte lebih besar daripada 1.6.0 (HTTPS dengan daftar sertifikat akar, HTTPUpdate, dan kolom portal), masih ±555 ribu byte di bawah batas satu rak (Konsep 2). Di komputermu angkanya boleh beda beberapa ratus byte, karena nama papan, sistem operasi, dan jalur folder paket ikut tersimpan di program; sekitar 2,6 ribu byte lagi bila `kunci.h`-mu memakai enkripsi ESP-NOW dan `SANDI_PORTAL` (angka di atas memakai isi `kunci.contoh.h`; penulis mengukur +2.592 byte dengan `kunci.h` lengkap).

Dengan **Compiler warnings** di **More** (setelan Modul 8), Arduino IDE bisa menampilkan peringatan dari library WiFiManager, ESP32Servo, dan ModbusMaster (yang terakhir sudah kamu kenal sejak Modul 15). Penulis mengompilasi dengan **All**: 27 peringatan, semuanya dari library dan sama persis dengan 1.6.0, dan nol dari berkas `node-1-rumah`. Peringatan library boleh diabaikan, juga `crc16_update` lewat `rs485.cpp`; yang di berkas `node-1-rumah` sendiri tidak.

**Kamu lulus langkah ⭐ ini** kalau unggahan selesai tanpa galat, dan angka `Sketch uses` sekitar 71 % dari `Maximum is 1966080 bytes`.

#### 5.4 ⭐ O0: Serial `ota` dan `server`, lalu kartu Node 1 versi 1.7.0 dengan `reset_reason` (5 menit)

Buka **Serial Monitor** (115200 baud, **New Line**); baris pertama terlewat? Tekan **EN**. Sesudah itu, ketik di kolom kirim Serial Monitor, lalu Enter:

```text
ota
```

**Yang ditulis Serial Monitor (teks dari kode; belum direkam penulis di papan):**

```text
[..:..:..] INFO  Node 1 Rumah - firmware 1.7.0 (dipasang lewat kabel)
…
ota: firmware 1.7.0 (dipasang lewat kabel), alamat server BELUM DIISI (ketik: server <alamat>)
ota: rak berjalan app0 (UNDEFINED, dipasang lewat kabel); rak sebelah app1, 1966080 byte
ota: masa uji: tidak
ota: tidak ada laporan pembaruan yang menunggu
```

Seperti di [KC Langkah 2](#langkah-2--serial-monitor-rak-berjalan-app0-catatan-undefined-rak-sebelah-app1-2-menit), unggahan kabel menulis catatan rak "nyalakan `app0`" dengan keadaan `UNDEFINED`: tanpa masa uji. Rak `app1` menunggu 1.7.1. Sekarang simpan alamat server, **sama persis** dengan `ALAMAT_SERVER` di `.env` mesin pusat ([2.3](#23--berkas-infrastruktur-dan-env-mesin-pusat-mosquitto_dynsec_password-dan-alamat_server-6-menit)); jalur gratis `http://192.168.1.37`, tanpa Pi `http://192.168.1.10`:

```text
server https://iot.namaanda.my.id
```

Jawabannya (teks dari kode): `server: https://iot.namaanda.my.id (firmware hanya diunduh dari alamat ini: <alamat>/fw/node-1/<versi>.bin)`. Alamat ini tersimpan di NVS, jadi tetap ada sesudah pembaruan, *rollback*, dan unggahan kabel. `http://` ke nama internet ditolak: `server: tidak disimpan. http hanya untuk jaringan rumah (…): pakai https:// di internet`. Lalu ketik `broker`: jawaban `broker: 192.168.1.37 (dari konfigurasi.h), pintu 1883` harus menyebut IP gerbang Pi-mu (tanpa Pi: IP laptop).

Di **Armada**, kartu Node 1 kini menulis **Versi firmware** `1.7.0`, dan **Menyala ulang karena** tidak lagi `— (firmware lama belum melaporkan)`: `vitals` pertama terkirim begitu Node 1 tersambung. Kesehatan kartu tidak *live*, jadi muat ulang halaman bila belum berubah. Sesudah unggahan kabel, nilainya mestinya `POWERON` (menurut kode, seperti KC Langkah 2; papan belum dilihat penulis). Simpan ke cabang (terminal laptop, akar proyek; `kunci.h` tidak ikut):

```text
git add firmware PETA-PIN.md
git commit -m "Modul 28 Praktik 5: firmware Node 1 1.7.0 dan PETA-PIN versi 7"
git push
```

**Kamu lulus langkah ⭐ ini** (bukti **O0**) kalau `ota` menulis `app0 (UNDEFINED, dipasang lewat kabel)`, `server` menyimpan alamat yang sama dengan `ALAMAT_SERVER`, dan kartu Node 1 menulis versi `1.7.0` dengan **Menyala ulang karena** terisi.

#### 5.5 Pemeriksa kontrak 1.6: `vitals` Node 1 LULUS (4 menit)

Pemeriksa kontrak versi 1.6 juga memeriksa `reset_reason` dan `fw` di `vitals`; belum tersalin di 4.2? Ambil [`kode/alat/pemeriksa-kontrak.js`](kode/alat/pemeriksa-kontrak.js) dengan **Copy raw file**. Di terminal laptop, folder `alat`, arahkan ke broker Node 1 (gerbang Pi; tanpa Pi: tanpa alamat):

```text
node --env-file=.env pemeriksa-kontrak.js 192.168.1.37
```

Selagi berjalan, ketik `restart` di Serial Monitor: Node 1 berhenti sengaja (teks dari kode: `Berhenti sengaja (perintah Serial restart): …`, lalu `Restart sekarang...`), menyala ulang, dan mengirim `status` serta `vitals` baru. Sesudah ±30 detik, tekan **Ctrl + C**.

**Hasilnya (lab penulis, simulator, `restart` di terminalnya; jam WIB; dipotong, hanya baris Node 1 tiruan `f00d00000001`):**

```text
Pemeriksa kontrak siap di broker 192.168.1.37:1883 (langganan rpm/#) — tekan Ctrl + C untuk berhenti.
[15.29.08] rpm/f00d00000001/status  LULUS  [retained]
[15.29.12] rpm/f00d00000001/status  LULUS
[15.29.17] rpm/f00d00000001/status  LULUS
[15.29.17] rpm/f00d00000001/vitals  LULUS
[15.29.23] rpm/f00d00000001/telemetry  LULUS
^C
Ringkasan: 15 pesan LULUS, 0 pesan GAGAL.
```

Urutannya: status *retained* lama, `offline-mode`, `online`, lalu `vitals` dengan `reset_reason` `SW` dan `fw` `1.7.0`; ringkasannya menghitung juga perangkat tiruan lain. Telegram mengabarkan `🔄 <id> berhenti sengaja …`, lalu `✅ <id> online lagi sesudah berhenti sengaja (<n> detik)`, tanpa `📴` (lab penulis, Telegram tiruan). Pemeriksa langsung berhenti dengan `Sambungan … putus: broker dimatikan, atau akun pemeriksa yang sama dipakai program lain …`? Di lab penulis sebabnya `alat/.env` tanpa baris `PENGGUNA_PEMERIKSA=pemeriksa`: salin dari `.env.example`. Pemeriksa ini membaca laporan `rollback` di [8.4](#84--riwayat-pembaruan-buku-kejadian-dan-laporan-rollback-di-vitals-4-menit). Kabel USB boleh tetap di laptop sampai [7.1](#71--cabut-kabel-usb-node-1-hanya-dari-charger-modul-9-2-menit).

> ⬆️ **Selesai Praktik 5?** Lanjut ke [Praktik 6](#praktik-6--membangun-171-dan-mengunggahnya-ke-server-15-menit): membangun 1.7.1 dan mengunggahnya ke server. Mulai sekarang Node 1 tidak perlu kabel USB lagi untuk diperbarui.

### Praktik 6 — Membangun 1.7.1 dan mengunggahnya ke server (15 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** di laptop, sketsa Node 1 dari Praktik 5 (papan tidak dipakai); **VS Code**, terminal di **akar proyek** (tanpa Kit: folder **`alat`**); **Chrome**, layar **Armada** sebagai admin; terminal **mesin pusat**, akar proyek (akhir 6.4). Konsep yang dipakai: 5, 6.
>
> ⭐ **Wajib** — langkah 6.1, 6.2, 6.3, dan 6.4: berkas firmware 1.7.1 dibuat tanpa dipasang ke papan, lalu tersimpan di server sebagai rilis `terbaru` dengan SHA-256 sama persis dengan sidik di laptopmu.

Inilah langkah "build firmware versi berikutnya → unggah ke server" di Silabus (dulu "v1.1"), dengan nomor proyek kita: 1.7.1. Node 1 tetap menjalankan 1.7.0 sampai Praktik 7 memasang 1.7.1 lewat udara. Kotak **Hasilnya** dari lab penulis: berkas 1.7.1-nya firmware asli yang dikompilasi penulis dengan `arduino-cli`, diunggah ke "VPS" tiruan, dan tidak pernah dijalankan.

> 🔀 **Tanpa Kit** (juga Wokwi): ganti 6.1–6.3 dengan berkas **tiruan** dari `buat-bin-tiruan.js` (tersalin di 4.2; [README alat](kode/alat/README.md#berkas-firmware-tiruan-untuk-jalur-tanpa-kit-modul-28)). Di terminal folder `alat` (tujuan: folder di samping repositorimu, di luar Git):
>
> ```text
> node buat-bin-tiruan.js 1.7.1 ../../firmware-tiruan
> ```
>
> **Hasilnya (lab penulis, dipotong):** `Berkas TIRUAN dibuat: …/firmware-tiruan/node-1-1.7.1-TIRUAN.bin`, `ukuran 1196032 byte (61 % satu rak program 1966080 byte)`, `SHA-256 e60066a43e379d2caba71b0173947065aeabe8cb977d24b8fa0e58dc883a2a0c`. Isinya tetap, jadi sidik itu sama di komputer mana pun, kebalikan firmware asli. Unggah di 6.4 dengan versi `1.7.1`: layar menulis `1.196.032 byte (61 % rak)` dan sidik yang sama (lab penulis). 6.5 dilewati.

> [!WARNING]
> Berkas tiruan **bukan firmware**: jangan di-*flash*, dan jangan dikirim ke papan sungguhan lewat **Perbarui**.

#### 6.1 ⭐ Konstanta 1.7.1 di `konfigurasi.h`: `VERSI_FIRMWARE` dan `CATATAN_VERSI` (2 menit)

Di Arduino IDE, buka tab `konfigurasi.h`, ubah dua baris versi di bagian atas (tabel "Latihan Modul 28" di [README firmware](kode/firmware/README.md)), lalu simpan (**Ctrl + S**):

```diff
-const char VERSI_FIRMWARE[] = "1.7.0";
-const char CATATAN_VERSI[] = "dipasang lewat kabel";  // Modul 28: kalimat pendek di Serial saat menyala, boleh diganti
+const char VERSI_FIRMWARE[] = "1.7.1";
+const char CATATAN_VERSI[] = "dipasang lewat udara";  // Modul 28: kalimat pendek di Serial saat menyala, boleh diganti
```

Versi wajib naik setiap kali firmware berubah (di sini angka PATCH, [Konsep 5](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest)): server menolak versi yang pernah diunggah, dan Node 1 menolak versi yang sedang ia jalankan. `UJI_KUNCI_SALAH` tetap `0`. **Jangan** klik **Upload**, walaupun kabel USB masih tersambung: 1.7.1 harus tiba lewat udara. Telanjur? Kembalikan ke 1.7.0, klik **Upload** (5.3), lalu ulangi.

**Kamu lulus langkah ⭐ ini** kalau `konfigurasi.h` menulis `"1.7.1"` dan `"dipasang lewat udara"`, dan kartu Node 1 di **Armada** masih `1.7.0`.

#### 6.2 ⭐ Sketch → Export Compiled Binary: isi folder `build/` (3 menit)

Dengan setelan **Tools** 5.1 (**ESP32 Dev Module**, **Minimal SPIFFS**, **Flash Mode** DIO), klik **Sketch → Export Compiled Binary**. Arduino IDE mengompilasi tanpa mengirim apa pun ke papan, lalu menyalin hasilnya ke folder `build/esp32.esp32.esp32/` di folder sketsa. Baris `Sketch uses …` sama dengan 5.3: kedua teks yang berganti sama panjangnya (kompilasi penulis: sama persis).

**Hasilnya (lab penulis: `ls -l` salinan keluaran `arduino-cli`, setelan sama; jam WIB):**

```text
-rw-rw-r-- 1 kamu kamu  1411040 Nov  2 13:28 node-1-rumah.ino.bin
-rw-rw-r-- 1 kamu kamu    23488 Nov  2 13:28 node-1-rumah.ino.bootloader.bin
-rwxrwxr-x 1 kamu kamu 18498076 Nov  2 13:28 node-1-rumah.ino.elf
-rw-rw-r-- 1 kamu kamu  4194304 Nov  2 13:28 node-1-rumah.ino.merged.bin
-rw-rw-r-- 1 kamu kamu     3072 Nov  2 13:28 node-1-rumah.ino.partitions.bin
```

`.elf` dipakai `nm` di [🔬](#-bedah-teknis-opsional); `node-1-rumah.ino.map` (peta alamat) juga dibuat, tetapi tidak ada di salinan lab. Folder ekspor Arduino IDE belum dilihat penulis; yang dipakai tetap `node-1-rumah.ino.bin`.

**Kamu lulus langkah ⭐ ini** kalau ekspor selesai tanpa galat dan folder `build/esp32.esp32.esp32/` berisi `node-1-rumah.ino.bin`.

#### 6.3 ⭐ Pilih `node-1-rumah.ino.bin`, bukan `.merged.bin`, lalu hitung SHA-256-nya (3 menit)

Yang dikirim ke server hanya **berkas firmware** `node-1-rumah.ino.bin`: program saja, diawali bait `0xE9`. **Berkas gabungan** `.merged.bin` (seluruh *flash* 4 MB, diawali `0xFF`) dan `.bootloader.bin` bukan untuk server ([Konsep 2](#2-dua-rak-dan-secarik-catatan-app0-app1-otadata-dan-pembuka-rak)). Hitung sidik jarinya di terminal akar proyek:

```text
sha256sum firmware/node-1-rumah/build/esp32.esp32.esp32/node-1-rumah.ino.bin
```

macOS: `shasum -a 256 <berkas>`; PowerShell: `Get-FileHash <berkas> -Algorithm SHA256`, yang menulis huruf kapital (besar-kecilnya tidak penting; keduanya tidak diuji penulis). Salin 64 huruf sidiknya ke catatan sementara. Jam kompilasi ikut tertanam, jadi sidikmu beda dengan milik penulis dan bisa berubah tiap ekspor: bandingkan hanya dengan sidik dari server ([6.4](#64--unggah-firmware-di-armada-rilis-171-dengan-sidik-jari-yang-sama-5-menit)). Berkas ini rahasia ([Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)): ia memuat kunci ESP-NOW, sandi portal, dan jalur folder laptopmu, jadi hanya dikirim lewat formulir **Armada**.

**Kamu lulus langkah ⭐ ini** kalau sidik 64 huruf dari `node-1-rumah.ino.bin` (bukan `.merged.bin`) sudah kamu catat.

#### 6.4 ⭐ Unggah firmware di Armada: rilis 1.7.1 dengan sidik jari yang sama (5 menit)

Di Chrome, buka **Armada** → **Rilis firmware** → formulir **Unggah firmware Node 1**. Pilih berkasnya di **Berkas .bin**, isi **Versi (sama dengan VERSI_FIRMWARE di berkas itu)** dengan `1.7.1` dan **Catatan (tidak wajib)** dengan `dipasang lewat udara`, biarkan **Rilis uji** kosong, lalu klik **Unggah firmware**.

**Hasilnya (lab penulis, CA tiruan, firmware asli 1.7.1; sidik jari diganti `…`):**

```text
Tersimpan: Node 1 1.7.1, Sen, 2 Nov, 15.31 WIB
Ukuran: 1.411.040 byte (72 % rak)
SHA-256 (dihitung server dari berkas yang diterimanya):
…
Bandingkan dengan sidik berkas di laptopmu (sha256sum atau Get-FileHash): harus sama persis.
```

Di lab penulis, sidik server sama persis dengan `sha256sum` berkasnya. Ukuranmu boleh sedikit beda (5.3); `72 %` di sini dan `71%` di `Sketch uses` sama-sama benar: layar membulatkan biasa, Arduino ke bawah. **Rilis firmware**, daftar rilis (*manifest*) dari Konsep 5, kini memuat 1.7.1 berlencana `terbaru`, dengan `Terkunci: belum ada canary yang berhasil.` di **Perbarui semua**; kartu Node 1 berlencana `perlu diperbarui`. Penolakan (teks persis; obatnya di [🚨](#-kalau-tidak-jalan) kelompok **Unggah firmware**):

| Yang diunggah | Formulir menulis |
| :-- | :-- |
| `.merged.bin` atau `.bootloader.bin` | `Itu bukan berkas aplikasi: pilih <sketsa>.ino.bin, bukan .merged.bin, .bootloader.bin, atau .partitions.bin.` |
| bait pertama bukan `0xE9` | `Bukan berkas aplikasi ESP32: bait pertamanya harus 0xE9.` |
| berkas 1.966.081 byte | `Terlalu besar: 1.966.081 byte, satu rak program hanya 1.966.080 byte.` |
| versi `1.7` (teks dari kode) | `Versi harus berbentuk x.y.z, misalnya 1.7.1 (sama dengan VERSI_FIRMWARE).` |
| versi `1.7.1` sekali lagi | `node1 1.7.1 sudah ada: versi tidak boleh ditimpa. …` (`409`, Konsep 5) |

Di terminal mesin pusat, ulangi cadangan [3.5](#35--cadangan-akun-broker-dengan-skripcadangkan-akun-brokersh-3-menit): kini `disalin: data-firmware (1 berkas .bin)` (lab penulis).

**Kamu lulus langkah ⭐ ini** kalau kotak hijau menulis `Tersimpan: Node 1 1.7.1` dengan SHA-256 yang sama persis dengan sidik 6.3, dan rilis 1.7.1 berlencana `terbaru`.

#### 6.5 `git status` tanpa `build/` dan `*.bin`, lalu *commit* 1.7.1 (2 menit)

Di terminal akar proyek, `git status --short` hanya menyebut ` M firmware/node-1-rumah/konfigurasi.h` (lab penulis): `build/` dan `.bin` tidak muncul, karena diabaikan `.gitignore` (2.3: `firmware/**/build/` dan `*.bin`). Buktinya:

```text
git status --short --ignored firmware
```

Selain baris ` M` tadi, baris `!!` = diabaikan Git, misalnya `build/` dan `kunci.h` (Modul 14). **Hasilnya (lab penulis, sesudah *commit*; tanpa `kunci.h`):** `!! firmware/node-1-rumah/build/`. Simpan versi yang akan berjalan:

```text
git add firmware
git commit -m "Modul 28 Praktik 6: Node 1 1.7.1, versi yang dipasang lewat udara"
git push
```

Di [➕ E](#e--gabungkan-fiturarmada-ke-main-lewat-pull-request-armada-ota-rollback-klaim-dan-kotak), tab **Files changed** *pull request*-mu juga tanpa `.bin`.

> ⬆️ **Selesai Praktik 6?** Lanjut ke [Praktik 7](#praktik-7--pembaruan-pertama-tanpa-kabel-canary-dulu-20-menit): cabut kabel USB, lalu perbarui Node 1 tanpa kabel (bukti O1).

### Praktik 7 — Pembaruan pertama tanpa kabel, *canary* dulu (20 menit)

> 🖥️ **Alat yang dipakai:** *charger* Modul 9 untuk Node 1 (7.1); **Chrome** di laptop atau HP, layar **Armada** sebagai admin (7.2–7.5); terminal **mesin pusat** di akar proyek (7.5): **SSH ke VPS**, folder `/home/rumah/rumah-pintar-mini` (jalur gratis: SSH ke Pi; tanpa Pi: laptop); **Telegram**; terminal laptop (7.6, opsional). Konsep yang dipakai: 3, 7.
>
> ⭐ **Wajib** — langkah 7.1, 7.2, 7.3, dan 7.5: kabel USB Node 1 tercabut dari laptop, Node 1 ditandai *canary* lalu diperbarui dari 1.7.0 ke 1.7.1 lewat tombol **Perbarui**, dan kartunya menulis versi `1.7.1`, `reset_reason` `SW`, serta riwayat `berhasil` (bukti **O1**).

> [!NOTE]
> **Belum direkam penulis di papan.** Pembaruan lewat udara di Node 1 sungguhan belum pernah dijalankan penulis: LED dan OLED di bawah = dari kode. Kotak **Hasilnya** = lab penulis: Node 1 tiruan dari simulator mengunduh berkas 1.7.1 **asli** hasil kompilasi penulis lewat HTTPS tiruan, lalu hanya memeriksanya (ukuran, bait `0xE9`, SHA-256) tanpa menjalankannya.

Inilah "perangkat di atap" ([Konsep 1](#1-mengapa-ota-wajib-perangkat-di-atap)) yang diperbarui tanpa dipanjat, janji Silabus sejak awal: firmware "bisa diperbarui dari jarak jauh tanpa kabel". Rilis 1.7.1 sudah di server (Praktik 6), Node 1 1.7.0 tahu alamat server rumahnya (5.4), dan satu perangkat *canary* dicoba lebih dulu ([Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota)). Tanpa *commit*: berkas proyek tidak berubah.

> 🔀 **Tanpa Kit** (juga Wokwi): lewati 7.1; kerjakan 7.2–7.5 pada kartu Node 1 tiruan `f00d00000001` (simulator 4.2, tetap berjalan), lalu centang O1 sebagai **tiruan**. **Jalur gratis:** Node 1 mengunduh dari `http://192.168.1.37` lewat pintu perangkat 8081 (lab: 85 ms, simulator). **Tanpa Pi:** dari `http://192.168.1.10` (83 ms, simulator); selama pembaruan, laptop jangan tidur dan pintu 80-nya tetap terbuka seperti mode HP.

#### 7.1 ⭐ Cabut kabel USB: Node 1 hanya dari charger Modul 9 (2 menit)

Bukti O1 menuntut Node 1 tanpa kabel ke laptop. Ikuti urutan aturan emas catu daya Modul 9: matikan MB102 dulu, pindahkan kabel USB Node 1 dari laptop ke *charger*-nya, baru nyalakan MB102 (modul microSD beregulator: tekan **EN**). Beban (relay, pompa, servo) tetap dicatu MB102, bukan dari pin ESP32, dengan GND bersama.

Listriknya sempat putus, jadi Node 1 menyala ulang. Tunggu kartunya di **Armada** kembali `Online` (muat ulang bila kesehatannya belum berubah): **Menyala ulang karena** mestinya `POWERON` (menurut kode; papan belum dilihat penulis). Ingat nilai itu untuk 7.5. Serial Monitor kini tak terlihat, dan memang itu intinya: laptop tidak dibutuhkan lagi untuk memperbarui.

**Kamu lulus langkah ⭐ ini** kalau kabel USB Node 1 tidak tersambung ke laptop, Node 1 dicatu *charger*-nya, dan kartunya `Online` lagi.

#### 7.2 ⭐ Jadikan Node 1 *canary* (2 menit)

Di kartu Node 1, centang **Canary: perangkat uji yang diperbarui lebih dulu**. Tanda ini belum memperbarui apa pun; yang berubah hanya lencana dan syarat **Perbarui semua**. **Perbarui canary** di bagian **Rilis firmware** mengirim ke semua *canary* yang `online` sekaligus; untuk satu Node 1, cukup **Perbarui** di kartunya.

**Hasilnya (lab penulis, simulator: Node 1 tiruan `f00d00000001` bernama `Latihan ruang tamu`):** *toast* `Latihan ruang tamu kini perangkat canary.`, kartu berlencana `Online` `canary` `perlu diperbarui`, dan rilis 1.7.1 masih `Terkunci: belum ada canary yang berhasil.`

**Kamu lulus langkah ⭐ ini** kalau kartu Node 1 berlencana `canary`.

#### 7.3 ⭐ Perbarui 1.7.0 → 1.7.1: `berhenti sengaja`, `mengunduh`, lalu `berhasil` (6 menit)

**Perbarui ke versi** di kartu Node 1 sudah memilih `1.7.1 (terbaru)`. Klik **Perbarui**: kotak `Perbarui <nama> dari 1.7.0 ke 1.7.1? …` (ukuran berkas, `±1 menit`) berfokus di **Batal** (pola Modul 24), jadi **Enter** tak sengaja tidak mengirim apa pun. Biarkan **Izinkan turun versi** kosong ([Konsep 5](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest)), lalu klik **Ya, perbarui**. Node 1 menjawab `ack` dalam 5 detik: **diterima, belum selesai** ([Konsep 3](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji)).

**Hasilnya (lab penulis, simulator: Node 1 tiruan `f00d00000001`; Chrome tanpa layar; detik sejak **Ya, perbarui**):**

```text
0,3 s  kartu: berhenti sengaja
0,3 s  toast: f00d00000001 menerima perintah pembaruan 1.7.0 → 1.7.1
0,3 s  toast: f00d00000001 berhenti sengaja (offline-mode), misalnya untuk memasang firmware baru
5,5 s  kartu: Online · Pembaruan terakhir: berhasil 1.7.0 → 1.7.1
5,5 s  toast: f00d00000001 tersambung lagi (online)
5,5 s  toast: f00d00000001 berhasil diperbarui 1.7.0 → 1.7.1
```

Kartu tiruan itu berubah tanpa muat ulang. Lencana `berhenti sengaja` = status `offline-mode` yang sejak Modul 19 "disimpan untuk Modul 28": Node 1 pamit dulu, bukan terputus. **Pembaruan terakhir** berganti `diterima perangkat`, `mengunduh`, lalu `berhasil` (teks dari kode; `mengunduh` bertahan sampai Node 1 menyala lagi dan melapor). *Toast* tampil 4 detik (layar lebar: kanan atas; HP: bawah).

**Hasilnya di terminal simulator (lab penulis; jalur tanpa Kit melihat baris serupa; dipotong):**

```text
f00d00000001: pembaruan 1.7.0 -> 1.7.1 DITERIMA: offline-mode, putus rapi, mengunduh https://iot.namaanda.my.id/fw/node-1/1.7.1.bin
f00d00000001: 1.7.1 terunduh 1411040 byte dalam 226 ms, SHA-256 cocok; menyala ulang
f00d00000001: menyala dengan 1.7.1 (rak baru), masa uji 60 detik dimulai
f00d00000001: 1.7.1 SAH (tersambung dan terbit 0 detik sesudah menyala)
f00d00000001: online (firmware 1.7.1)
```

Simulator meniru urutan Konsep 3 sampai masa uji (Konsep 4) lolos. Perintahnya tiba seketika lewat MQTT, bukan menunggu cek tiap jam; di jalur utama ia turun lewat jembatan ke gerbang Pi, sedangkan berkasnya diunduh langsung dari VPS lewat HTTPS ([Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)).

5,5 detik itu hampir seluruhnya jeda "menyala ulang" buatan simulator, bukan ESP32 lewat WiFi; berkas asli sekitar 1,41 juta byte butuh lebih lama lewat WiFi (belum diukur penulis; catat angkamu di ➕ F). Sampai kartu menulis `berhasil`, jangan cabut listrik Node 1, Pi, atau router: tanpa broker atau menyala ulang di masa uji, firmware baru batal. **Perbarui** mati, kotak merah, atau riwayat `gagal`? Alasannya di kartu; obatnya di [🚨](#-kalau-tidak-jalan) kelompok **Perintah `update` …** atau **Unduhan `gagal`**.

**Kamu lulus langkah ⭐ ini** kalau kartu Node 1 sempat `berhenti sengaja`, lalu `Online` dengan **Pembaruan terakhir** `berhasil 1.7.0 → 1.7.1`.

#### 7.4 Yang terjadi di papan selama mengunduh: LED, pompa, dan buzzer (3 menit)

Menurut kode `pembaruan.cpp` (papan belum dilihat penulis), selama mengunduh:

- **LED status** (D2) berkedip selama berkas ditulis; detak Modul 8 berhenti karena `loop()` tidak berputar.
- **Pompa dan buzzer padam**; lampu, kipas, dan tirai tetap pada keadaan terakhirnya. ESP32 hanya mematikan sinyal ke MOSFET pompa (listriknya tetap dari MB102, GND bersama), dan pengaman lokal Modul 19 ikut berhenti (Konsep 3).

**Yang ditulis OLED (teks dari kode `pembaruan.cpp` dan `masa-uji.cpp`; belum dilihat penulis; garis miring = baris berikutnya):**

```text
menghubungi:  PEMBARUAN FIRMWARE / 1.7.1 / menghubungi server / jangan cabut listrik
mengunduh:    baris ketiga menjadi 0 %, 10 %, … 100 %
selesai:      PEMBARUAN FIRMWARE / 1.7.1 / berhasil diunduh / menyala ulang...
gagal:        PEMBARUAN GAGAL / 1.7.1 / firmware lama / tetap dipakai
rollback:     ROLLBACK / firmware baru gagal / kembali ke versi / <versi lama>   (Praktik 8)
```

Rak yang berjalan dan sisa masa uji belum tampil: itu [🧩 Tingkat 1](#tingkat-1--rak-program-dan-masa-uji-di-layar-oled-ubah-sedikit-20-menit).

#### 7.5 ⭐ O1: versi 1.7.1, `reset_reason` `SW`, dan riwayat `berhasil` tanpa kabel (5 menit)

Kabel USB tetap tercabut. Di kartu Node 1: **Versi firmware** `1.7.1` tanpa lencana `perlu diperbarui`, dan **Perbarui** mati (`Perangkat sudah memakai versi ini.`); **Menyala ulang karena** `SW` (`dinyalakan ulang program …`), bukan `POWERON` dari 7.1; **Riwayat pembaruan** (klik untuk membuka) `1.7.0 → 1.7.1 berhasil · <hari, tanggal, jam> WIB`. Rilis 1.7.1 menulis `Canary: 1 berhasil, 0 gagal atau rollback`, dan **Perbarui semua** kini terbuka ([Praktik 9](#praktik-9--opsional-armada-perbarui-semua-perangkat-terputus-dan-kedaluwarsa-15-menit)). Di papan (dari kode), 1.7.1 kini di rak `app1` dan 1.7.0 utuh di `app0` (Konsep 2); tahan D13 lebih dari 1 detik, dan halaman status Modul 8 menulis `Restart: SW` dan `v1.7.1  bebas …KB`. Versi kartu sesaat masih `1.7.0`? Lihat [🚨](#-kalau-tidak-jalan) *Kartu masih menulis versi lama, …*.

Di terminal mesin pusat, akar proyek (PowerShell, tidak diuji penulis: `Select-String` menggantikan `grep -E`):

```text
docker compose logs --since 30m backend | grep -E 'canary|diunduh|berhasil|Telegram'
```

**Hasilnya (lab penulis, "VPS" tiruan, Node 1 tiruan = simulator; dipotong, awalan `backend-1  |` dibuang):**

```text
[15:33:27] INFO: f00d00000001 ditandai canary oleh akun 1
[15:33:29] INFO: update c-20261102-083329-1 ke f00d00000001: 1.7.0 → 1.7.1 (1411040 byte), canary
[15:33:29] INFO: Telegram terkirim: 🔄 f00d00000001 berhenti sengaja (pembaruan firmware atau restart), sebentar lagi online kembali
[15:33:29] INFO: firmware 1.7.1 diunduh f00d00000001 (sedang memakai 1.7.0)
[15:33:34] INFO: Telegram terkirim: ✅ f00d00000001 online lagi sesudah berhenti sengaja (5 detik)
[15:33:34] INFO: f00d00000001 berhasil diperbarui 1.7.0 → 1.7.1
```

`update … canary` = perintahnya; `diunduh … (sedang memakai 1.7.0)` = unduhan berkunci Node 1 sendiri; ukuranmu boleh sedikit beda. Telegram-mu menerima dua kabar itu dengan `device_id` Node 1-mu (server Telegram tiruan di lab menerima persis dua), tanpa `📴 … offline`: berhenti sengaja bukan terputus. Gambar: lab penulis (Chrome tanpa layar; Node 1 tiruan = simulator; berkas 1.7.1 asli yang tidak dijalankan); nama dan angkamu berbeda.

![Komposit tangkapan layar asli layar Armada dashboard Rumah Pintar Mini 1.4.0 dengan backend 1.5.0 di VPS tiruan, Chrome 156 di Linux, laptop 1280 piksel; bilah alamat tidak tertangkap. Praktik 7.2 sampai 7.5, 2 Nov 2026 pukul 17.01 WIB: Node 1 tiruan f00d00000001 (simulator) diperbarui lewat udara ke 1.7.1, firmware asli hasil kompilasi penulis yang diunduh lewat HTTPS tiruan dan hanya diperiksa, tidak dijalankan. Kiri atas: ringkasan 3 perangkat aktif · rilis terbaru Node 1: 1.7.1 · 1 perlu diperbarui (nomor 1); kartu Latihan ruang tamu Online berlencana canary (nomor 2); versi 1.7.1, Menyala ulang karena SW dinyalakan ulang program, sinyal -65 dBm (kuat), RAM 188 KB bebas, lama menyala 0 detik (nomor 3); Pembaruan terakhir berhasil 1.7.0 → 1.7.1 · Sen, 2 Nov, 17.01 WIB dan Riwayat pembaruan yang dibuka dengan baris yang sama (nomor 4); pilihan 1.7.1 (terbaru, sedang dipakai), tombol Perbarui mati, centang Canary terisi (nomor 2). Tengah: kartu Latihan dapur berlencana perlu diperbarui, 1.7.0 → 1.7.1, POWERON, lama menyala 30 menit (nomor 5). Bawah: rilis Node 1 1.7.1 terbaru, 1.411.040 byte (72 % rak), Canary: 1 berhasil, 0 gagal atau rollback, tombol Perbarui canary dan Perbarui semua yang kini terbuka (nomor 6). Kanan atas: dua toast, f00d00000001 tersambung lagi (online) dan f00d00000001 berhasil diperbarui 1.7.0 → 1.7.1, 5,5 detik sesudah Ya, perbarui (nomor 7). Legenda di kanan.](aset/armada-sesudah-canary.png)

**Kamu lulus langkah ⭐ ini** (bukti **O1**) kalau kabel USB Node 1 tidak di laptop, kartunya menulis `1.7.1` dan `SW`, dan **Riwayat pembaruan** memuat `1.7.0 → 1.7.1 berhasil`. Tanpa Kit: bukti yang sama di kartu Node 1 tiruan = O1 **tiruan**.

#### 7.6 Unduhan berkunci dengan `curl --http1.0` (opsional, 2 menit)

Tiru permintaan HTTPUpdate dengan perangkat latihan `f00d00000005` ([3.2](#32--perangkat-latihan-akun-brokernya-dibuat-otomatis-di-broker-gerbang-pi1-8-menit); kuncinya di `alat/.env`), bukan Node 1: kunci yang diketik tercatat di riwayat terminal. Di terminal laptop (PowerShell: `curl.exe`, tidak diuji penulis), dengan `<kunci>` dan alamat `ALAMAT_SERVER`-mu:

```text
curl --http1.0 -sI -A ESP32-http-Update -u f00d00000005:<kunci> -H 'x-ESP32-STA-MAC: F0:0D:00:00:00:05' -H 'x-ESP32-version: 1.7.0' https://iot.namaanda.my.id/fw/node-1/1.7.1.bin
```

**Hasilnya (lab penulis, CA tiruan; dipotong, sidik jari disamarkan):**

```text
HTTP/1.0 200 OK
Content-Length: 1411040
Content-Type: application/octet-stream
X-Ratelimit-Limit: 120
X-Sha256: <sidik jari berkas 1.7.1-mu (6.3)>
```

Tanpa `Content-Encoding`, juga bila diminta `gzip` (Konsep 6). Lab penulis: `x-ESP32-version: 1.7.1` → `HTTP/1.0 304 Not Modified`; tanpa `-u` (pakai `-s`, bukan `-sI`, supaya isinya tampil) → `{"pesan":"butuh Basic Auth device_id:kunci"}` (403); MAC lain → `{"pesan":"x-ESP32-STA-MAC tidak ada atau tidak sama dengan device_id"}` (403); `http://iot.namaanda.my.id/…` → `308 Permanent Redirect` (`-104` di HTTPUpdate), jadi alamat internet selalu `https://`.

> ⬆️ **Selesai Praktik 7?** Lanjut ke [Praktik 8](#praktik-8--firmware-yang-sengaja-salah-kembali-sendiri-ke-versi-lama-25-menit): firmware yang sengaja salah harus kembali sendiri ke 1.7.1 (bukti O2). Kabel USB tetap tercabut.

### Praktik 8 — Firmware yang sengaja salah kembali sendiri ke versi lama (25 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** di laptop (8.1–8.2; kabel USB tetap tercabut); **VS Code**, terminal di **akar proyek** (8.2) dan folder **`alat`** (8.3–8.4); **Chrome**, layar **Armada** (admin); **Bruno**; terminal **mesin pusat**, akar proyek (8.4–8.5). Konsep yang dipakai: 4 (8.5: 6).
>
> ⭐ **Wajib** — langkah 8.1, 8.2, 8.3, dan 8.4: rilis uji 1.7.2 berlencana `uji` di server, kodemu kembali ke 1.7.1 dengan `UJI_KUNCI_SALAH = 0`, Node 1 kembali sendiri ke 1.7.1 tanpa disentuh (bukti **O2**), dan hasilnya tercatat di riwayat, buku kejadian, dan `vitals`.

> [!NOTE]
> **Belum direkam penulis di papan.** Firmware 1.7.2-uji dikompilasi penulis (2 November 2026, setelan Modul 10), tetapi *rollback* di papan sungguhan belum pernah dilihat penulis. Simulator tidak menjalankan isi `.bin`, jadi rilis uji di lab penulis berupa berkas **tiruan** `--uji`: kotak **Hasilnya** = perangkat tiruan dengan angka simulator, bukan ESP32 lewat WiFi. Teks Serial dan OLED = teks dari kode.

Silabus meminta bukti bahwa firmware dengan kunci broker yang salah kembali sendiri ke versi lama. Sakelar `UJI_KUNCI_SALAH` merusak kunci di RAM saja, NVS tidak disentuh, jadi 1.7.1 yang kembali tetap memakai kunci aslinya ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c)). "Versi lama" = 1.7.1, versi sebelum pembaruan ini: 1.7.2 menimpa 1.7.0 di rak `app0`, lalu *rollback* menyalakan lagi `app1` (keadaan 3 di gambar [Konsep 2](#2-dua-rak-dan-secarik-catatan-app0-app1-otadata-dan-pembuka-rak)).

> 🔀 **Tanpa Kit** (juga Wokwi): lewati bagian Arduino IDE di 8.1 dan seluruh 8.2. Di terminal folder `alat`, buat rilis uji **tiruan**:
>
> ```text
> node buat-bin-tiruan.js 1.7.2 ../../firmware-tiruan --uji
> ```
>
> **Hasilnya (lab penulis, dipotong):** `Berkas TIRUAN dibuat: …/firmware-tiruan/node-1-1.7.2-UJI-TIRUAN.bin`, SHA-256 `55d3e757e038a69f990e5ca1d8158ec8433ba4b82f7d110ee7f19c2a60f5154f`. Unggah di 8.1 dengan centang **Rilis uji**, lalu kerjakan 8.3–8.5 dengan Node 1 tiruanmu: simulator membaca penanda `UJI_KUNCI_SALAH` di 512 bait pertamanya, menulis `DITOLAK broker (kode 5)`, lalu `… kembali ke 1.7.1 (rollback tiruan)`: **O2** tiruan. Bukan firmware: jangan dikirim ke papan sungguhan.

#### 8.1 ⭐ Rilis uji 1.7.2: `UJI_KUNCI_SALAH` bernilai 1, lalu unggah dengan centang uji (5 menit)

Di Arduino IDE, tab `konfigurasi.h`, ubah tiga baris (versi di atas, sakelar di akhir; tabel "Latihan Modul 28" di [README firmware](kode/firmware/README.md)), lalu simpan (**Ctrl + S**):

```diff
-const char VERSI_FIRMWARE[] = "1.7.1";
-const char CATATAN_VERSI[] = "dipasang lewat udara";  // Modul 28: kalimat pendek di Serial saat menyala, boleh diganti
+const char VERSI_FIRMWARE[] = "1.7.2";
+const char CATATAN_VERSI[] = "rilis UJI rollback";  // Modul 28: kalimat pendek di Serial saat menyala, boleh diganti
 ...
-const int UJI_KUNCI_SALAH = 0;
+const int UJI_KUNCI_SALAH = 1;
```

Klik **Sketch → Export Compiled Binary** (setelan **Tools** 5.1). `Sketch uses …` naik beberapa puluh byte (kompilasi penulis), karena kalimat peringatan UJI kini ikut masuk program. **Jangan** klik **Upload**: lewat kabel, firmware ini tanpa masa uji (`UNDEFINED`, Konsep 2), jadi Node 1 tidak pernah masuk broker sampai 1.7.1 dipasang lagi lewat kabel.

Di **Armada** → **Rilis firmware** → formulir **Unggah firmware Node 1**: pilih `node-1-rumah.ino.bin` yang baru, versi `1.7.2`, catatan `rilis UJI rollback`, centang **Rilis uji**, lalu klik **Unggah firmware**.

**Hasilnya (lab penulis, CA tiruan, berkas rilis uji tiruan; dipotong):**

```text
Tersimpan: Node 1 1.7.2 (uji), Sen, 2 Nov, 15.35 WIB
Ukuran: 1.196.032 byte (61 % rak)
```

Itu ukuran berkas tiruan; berkas aslimu sekitar 1,41 juta byte (`72 % rak`). Rilis 1.7.2 berlencana `uji`, tanpa tombol **Perbarui canary** dan **Perbarui semua** (lewat Bruno pun server menjawab `409` `1.7.2 rilis UJI: hanya lewat Perbarui per perangkat, tidak pernah untuk banyak perangkat`, lab penulis). Lencana `terbaru` tetap di 1.7.1, dan pilihan versi di kartu Node 1 kini memuat `1.7.2 (uji)`.

**Kamu lulus langkah ⭐ ini** kalau kotak hijau menulis `Tersimpan: Node 1 1.7.2 (uji)`, dan rilis `terbaru` tetap 1.7.1.

#### 8.2 ⭐ Segera kembalikan `UJI_KUNCI_SALAH` ke 0 dan versi ke 1.7.1 (3 menit)

Berkas uji sudah di server; kodemu tidak perlu menyimpannya. Di tab `konfigurasi.h`, kembalikan ketiga baris (`"1.7.1"`, `"dipasang lewat udara"`, `0`), simpan, lalu di terminal akar proyek:

```text
git diff --stat
```

**Hasilnya (lab penulis):** tanpa keluaran, artinya `konfigurasi.h` sama persis dengan *commit* [6.5](#65-git-status-tanpa-build-dan-bin-lalu-commit-171-2-menit), jadi praktik ini tanpa *commit*. Nilai 1 yang ikut ter-*commit* membuat rilis biasa berikutnya gagal masuk broker di setiap papan (aturan aman nomor 7, diperiksa lagi di [➕ E](#e--gabungkan-fiturarmada-ke-main-lewat-pull-request-armada-ota-rollback-klaim-dan-kotak)). Nomor 1.7.2 kini milik rilis uji, jadi rilis biasa berikutnya 1.7.3 ([Konsep 5](#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest)).

**Kamu lulus langkah ⭐ ini** kalau `git diff --stat` tanpa keluaran, dan tab `konfigurasi.h` menulis `"1.7.1"` serta `UJI_KUNCI_SALAH = 0`.

#### 8.3 ⭐ O2: Node 1 kembali sendiri ke 1.7.1 sesudah masa uji 60 detik (10 menit)

Pasang saksi dulu (dibaca di 8.4): di terminal laptop, folder `alat`, jalankan pemeriksa kontrak khusus Node 1 dan biarkan berjalan (tanpa Pi: `127.0.0.1` di tempat IP gerbang).

```text
node --env-file=.env pemeriksa-kontrak.js 192.168.1.37 <device_id Node 1>
```

Di kartu Node 1, pilih `1.7.2 (uji)` → **Perbarui**. Kotak konfirmasi (fokus di **Batal**) menulis `… perangkat kembali sendiri ke 1.7.1 (rollback). Jangan cabut listriknya selama itu.` dan `Ini rilis UJI: sengaja dibuat untuk latihan rollback.` Klik **Ya, perbarui**, lalu jangan sentuh apa pun sampai kata `rollback` muncul.

Di papan (dari kode): Node 1 berhenti sengaja, mengunduh (seperti 7.4), menyala ulang di `app0`, dan ditolak broker. Serial Monitor (tanpa kabel tidak terlihat) menulis `MASA UJI: firmware 1.7.2 baru dipasang lewat udara di rak app0. …`, lalu begitu 60 detik habis `Firmware 1.7.2 TIDAK terbukti dalam 60 detik (tidak tersambung ke broker): ROLLBACK ke firmware sebelumnya.` Laporan `rollback` disimpan dulu, OLED sempat menulis `ROLLBACK` / `firmware baru gagal` / `kembali ke versi` / `1.7.1`, lalu papan menyala ulang ke `app1`.

**Hasilnya (lab penulis, simulator: Node 1 tiruan `f00d00000001`, berkas uji tiruan; detik sejak **Ya, perbarui**; dipotong):**

```text
0,3 s   kartu: berhenti sengaja
70,5 s  kartu: Online · Versi firmware 1.7.1 · Pembaruan terakhir: kembali ke versi lama (rollback) 1.7.1 → 1.7.2
70,5 s  toast: f00d00000001 GAGAL memakai 1.7.2 dan kembali sendiri ke 1.7.1 (rollback)
```

70,5 detik di simulator = ±5 detik menyala ulang tiruan + 60 detik masa uji + ±5 detik; di papan sungguhan belum diukur penulis (catat angkamu di [➕ F](#f-simpan-catatan-belajar-bukti-o0-sampai-p1-foto-sebelumsesudah-dan-angka-papanmu)). Inilah bukti **O2**: tanpa kabel dan tanpa disentuh, kartu Node 1 kembali `Online` dengan **Versi firmware** `1.7.1`, **Menyala ulang karena** `SW` (firmware sendiri yang menyalakan ulang papan), dan **Pembaruan terakhir** `kembali ke versi lama (rollback)`. Gambar berikut dari lab penulis (perangkat simulator, berkas 1.7.1 asli tetapi tidak dijalankan, rilis uji tiruan); di layarmu nama dan `device_id`-nya milikmu.

![Komposit tangkapan layar asli layar Armada dashboard Rumah Pintar Mini 1.4.0 dengan backend 1.5.0 di VPS tiruan, Chrome 156 di Linux, laptop 1280 piksel; bilah alamat tidak tertangkap. Praktik 8.3, 2 Nov 2026 pukul 17.02 sampai 17.04 WIB: Node 1 tiruan f00d00000001 (simulator) diperintah memakai rilis uji 1.7.2, berkas tiruan yang kunci brokernya sengaja salah; masa uji 60 detik gagal dan perangkat kembali sendiri 70,4 detik sesudah perintah. Kiri: kartu Latihan ruang tamu, Online, canary; versi 1.7.1 dan Menyala ulang karena SW (nomor 1); Pembaruan terakhir berlencana kuning kembali ke versi lama (rollback) 1.7.1 → 1.7.2 · Sen, 2 Nov, 17.03 WIB dengan pesan tidak tersambung ke broker dalam 60 detik (nomor 2); Riwayat pembaruan yang dibuka: 1.7.1 → 1.7.2 kembali ke versi lama (rollback) · Sen, 2 Nov, 17.02 WIB · tidak tersambung ke broker dalam 60 detik, lalu 1.7.0 → 1.7.1 berhasil · Sen, 2 Nov, 17.01 WIB (nomor 3); pilihan 1.7.1 (terbaru, sedang dipakai), centang Canary. Kiri bawah: rilis Node 1 1.7.2 berlencana uji, rilis UJI rollback, 1.196.032 byte (61 % rak), tanpa tombol Perbarui canary dan Perbarui semua (nomor 4). Kanan: toast f00d00000001 tersambung lagi (online) dan toast merah f00d00000001 GAGAL memakai 1.7.2 dan kembali sendiri ke 1.7.1 (rollback) (nomor 5). Legenda bernomor di kanan.](aset/armada-rollback.png)

Perintah kedua di tengah masa uji tidak diantre: Bruno `perbarui Node 1` di lab penulis dijawab `409` `perangkat sedang offline-mode: perintah update hanya dikirim ke perangkat online (tidak diantre)`. Log backend di mesin pusat menulis `WARN: <id> GAGAL memakai 1.7.2 dan kembali sendiri ke 1.7.1 (rollback)`, dan Telegram hanya `🔄 <id> berhenti sengaja …` lalu `✅ <id> online lagi sesudah berhenti sengaja (70 detik)`, tanpa `📴` (seperti yang diterima server Telegram tiruan di lab penulis). Kartu tetap `berhenti sengaja`, lalu sesudah 10 menit pembaruannya `kedaluwarsa`? *Rollback* tidak terjadi: pulihkan lewat kabel menurut [🚨](#-kalau-tidak-jalan) *Rollback tidak pernah terjadi …*.

**Kamu lulus langkah ⭐ ini** (bukti **O2**) kalau tanpa kabel dan tanpa kamu sentuh, kartu Node 1 kembali `Online` dengan versi `1.7.1` dan **Pembaruan terakhir** `kembali ke versi lama (rollback)`.

#### 8.4 ⭐ Riwayat pembaruan, buku kejadian, dan laporan `rollback` di `vitals` (4 menit)

Buka **Riwayat pembaruan** di kartu Node 1: `1.7.1 → 1.7.2 kembali ke versi lama (rollback) · … · tidak tersambung ke broker dalam 60 detik`, di bawahnya `1.7.0 → 1.7.1 berhasil`. *Toast* merah tadi tersimpan di buku kejadian (Modul 19); di terminal mesin pusat, akar proyek:

```text
docker compose exec -T db psql -U postgres -d rumahpintar -c "SELECT to_char(waktu AT TIME ZONE 'Asia/Jakarta', 'HH24.MI.SS') AS wib, device_id, jenis, pesan FROM events WHERE jenis = 'ota' ORDER BY id;"
```

**Hasilnya (lab penulis, Node 1 tiruan; dipotong):** baris terakhir `15.37.36`, `ota`, `f00d00000001 GAGAL memakai 1.7.2 dan kembali sendiri ke 1.7.1 (rollback)`. Lalu tekan **Ctrl + C** di terminal pemeriksa. **Hasilnya (lab penulis, simulator; jam WIB; dipotong):**

```text
[15.36.26] rpm/f00d00000001/cmd  LULUS
[15.37.36] rpm/f00d00000001/vitals  LULUS  (laporan pembaruan 1.7.2: rollback)
^C
Ringkasan: 8 pesan LULUS, 0 pesan GAGAL.
```

`vitals` pertama sesudah 1.7.1 menyala lagi membawa laporan `ota` `rollback`, yang disimpan di NVS sebelum papan menyala ulang. Laporan itu ikut paling banyak 3 `vitals`, karena `vitals` (QoS 0) bisa hilang; bila hilang semua, server menyimpulkannya sendiri (Konsep 7). Pemeriksa terlambat dinyalakan? Jalankan sekarang dan tunggu `vitals` berikutnya (jeda bawaan 5 menit).

Sesudah 8.5 (atau sekarang, bila 8.5 dilewati), tarik rilis uji itu: Bruno `tarik rilis uji` (jalurnya memang untuk 1.7.2) → `200`, dan unduhannya dijawab `404`; muat ulang **Armada**: 1.7.2 hilang dari pilihan versi.

**Kamu lulus langkah ⭐ ini** kalau riwayat dan buku kejadian mencatat *rollback* 1.7.2, dan pemeriksa mencetak `vitals  LULUS  (laporan pembaruan 1.7.2: rollback)`.

#### 8.5 Sidik jari tidak cocok: `gagal` tanpa menyala ulang (opsional, 3 menit)

Sidik jari ([Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)) menolak berkas yang berubah satu bait saja. Coba pada berkas 1.7.2 yang sudah tidak dipakai: di terminal mesin pusat, akar proyek, ubah satu bait di tengahnya (ukurannya tetap), lalu cetak sidik barunya, yang kini beda dengan sidik di **Rilis firmware**:

```text
docker compose exec backend sh -c 'printf X | dd of=data-firmware/node-1/1.7.2.bin bs=1 seek=100000 conv=notrunc 2>/dev/null; sha256sum data-firmware/node-1/1.7.2.bin'
```

Kirim lagi `1.7.2 (uji)` ke Node 1: server tetap menyajikan berkas itu, tetapi perintah `update` membawa sidik lama, jadi Node 1 menolak memasangnya dan catatan rak tidak berganti.

**Hasilnya (lab penulis, simulator, rilis latihan tiruan 1.7.3 dengan cara sama):** `pembaruan 1.7.3 GAGAL (211 ms): SHA-256 tidak cocok dengan perintah (Update 15 UPDATE_ERROR_SHA256)`, lalu tetap `online (firmware 1.7.1)`; riwayat `gagal`; `uptime_s` di `vitals` berikutnya 68, dihitung sejak *rollback* 8.3, jadi tidak menyala ulang. Laporan `gagal` itu ikut tepat 3 `vitals`, setiap 5 menit. Di papan (dari kode): OLED `PEMBARUAN GAGAL` / `1.7.2` / `firmware lama` / `tetap dipakai`. Lalu tarik 1.7.2 (8.4).

> ⬆️ **Selesai Praktik 8?** [Praktik 9](#praktik-9--opsional-armada-perbarui-semua-perangkat-terputus-dan-kedaluwarsa-15-menit) opsional (banyak perangkat tiruan sekaligus); kalau dilewati, lanjut ke [Praktik 10](#praktik-10--perangkat-baru-dalam-1-menit-kode-klaim-dan-portal-30-menit): perangkat baru dengan kode klaim (bukti P1).

### Praktik 9 — (Opsional) Armada: "Perbarui semua", perangkat terputus, dan kedaluwarsa (15 menit)

> 🖥️ **Alat yang dipakai:** **Bruno** (**`login admin`** dulu; 9.1, 9.3); **VS Code** di laptop, terminal di **akar proyek**, folder **`alat`**, dan salinannya **`alat-armada`**; **Chrome**, layar **Armada** sebagai admin; **Telegram**. Konsep yang dipakai: 7.

Pola *canary* lalu semua ([Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota)) dicoba dengan banyak perangkat tiruan sekaligus. Node 1-mu sudah 1.7.1 dan hanya ikut dilewati; Node 2 tidak masuk daftar. Tanpa *commit*. Kotak **Hasilnya**: lab penulis, semua perangkat simulator, firmware 1.7.1 asli yang hanya diunduh dan diperiksa.

> 🔀 **Tanpa Kit** (juga Wokwi): Node 1 tiruan `f00d00000001` ikut berhenti di 9.2 (dilewati: `offline`); sesudah menyalakannya lagi di 9.3, ketik juga `kebun mulai`. **Tanpa Pi:** broker simulator `mqtt://127.0.0.1:1883`.

#### 9.1 Simulator banyak perangkat: kartu-kartu `perlu diperbarui` (4 menit)

Daftarkan beberapa perangkat tiruan baru seperti [3.2](#32--perangkat-latihan-akun-brokernya-dibuat-otomatis-di-broker-gerbang-pi1-8-menit): *clone* **`daftarkan perangkat latihan`**, isi `device_id` `f00d00000011` (nama misalnya `Armada 11`), kirim, simpan kuncinya, ulangi dengan `f00d00000012` dan `f00d00000013`, lalu hapus *clone* itu. Tiga sudah cukup; lab penulis memakai dua puluh (`f00d00000011` sampai `f00d00000030`), masing-masing `201 Created` dalam 154–312 ms. Nomor 11 ke atas menghindari perangkat latihanmu dan papan ketiga tiruan `f00d00000003` (Praktik 10).

Satu folder simulator = satu proses (folder `data/`-nya = NVS tiruan), jadi armada mendapat salinan `alat` di samping repositorimu, di luar Git. Di terminal akar proyek (PowerShell: `Copy-Item -Recurse alat ..\alat-armada`, tidak diuji penulis):

```text
cp -r alat ../alat-armada
```

Di `../alat-armada/.env`, biarkan `ALAMAT_SERVER`, hapus semua baris `KUNCI_F00D…` lama (satu perangkat di dua proses saling merebut sesi), lalu tambahkan `KUNCI_F00D00000011=<kunci>` dan seterusnya. Simulator `alat` tetap berjalan. Segera (perangkat terdaftar yang diam lebih dari 5 menit memicu 🔴 "Node diam"), buka terminal baru, `cd ../alat-armada`, lalu (angka terakhir = nomor tertinggi):

```text
node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 13
```

**Hasilnya (lab penulis, dua puluh perangkat dengan angka `30`; dipotong):**

```text
f00d00000001: kunci belum ada di alat/.env (KUNCI_F00D00000001=...), tidak dijalankan.
20 perangkat palsu menuju mqtt://192.168.1.37:1883 (firmware tiruan bawaan 1.7.0). Ketik misalnya …
f00d00000011: online (firmware 1.7.0)
```

Nomor tanpa kunci dilewati. Muat ulang **Armada**: kartu-kartu baru `1.7.0` berlencana `perlu diperbarui` (lab: `26 perangkat aktif · rilis terbaru Node 1: 1.7.1 · 23 perlu diperbarui`).

#### 9.2 "Perbarui semua" ke 1.7.1: dikirim, dilewati, dan alasannya (4 menit)

Rilis 1.7.1 sudah punya *canary* yang `berhasil` ([7.2](#72--jadikan-node-1-canary-2-menit), [7.5](#75--o1-versi-171-reset_reason-sw-dan-riwayat-berhasil-tanpa-kabel-5-menit)), jadi **Perbarui semua** di **Rilis firmware** terbuka. Sebelum mengekliknya, hentikan simulator di terminal `alat` (**Ctrl + C**): perangkat latihanmu menjadi perangkat terputus untuk 9.3. Lalu **Perbarui semua** → kotak `Perbarui SEMUA Node 1 ke 1.7.1? Semua Node 1 yang online dan memenuhi syarat dikirimi perintah sekaligus. …` → **Ya, perbarui semua**.

**Hasilnya (lab penulis, 1,75 detik sesudah klik; semua perangkat tiruan; dipotong):**

```text
Perbarui semua ke 1.7.1: 22 dikirim, 3 dilewati
f00d00000011 menerima perintahnya … (sampai f00d00000030)
f00d00000001 dilewati: perangkat sudah memakai 1.7.1
f00d00000004 dilewati: perangkat sedang offline: perintah update hanya dikirim ke perangkat online (tidak diantre)
f00d00000006 dilewati: jenis perangkat belum diketahui: tunggu telemetry pertamanya
```

Alasannya: `…01` = Node 1 tiruan (*canary*, sudah 1.7.1; Node 1-mu sama), `…04` = dihentikan sebelum klik, `…06` = terdaftar tetapi belum pernah mengirim `telemetry` (kuncinya belum di `.env`?). Alasan lain: `perangkat sudah dinonaktifkan (kuncinya dicabut)`, dan yang sedang mengunduh `perangkat sedang offline-mode: …`. Rilis uji tidak punya tombol ini.

Di lab, 22/22 `berhasil` 1.7.0 → 1.7.1 dalam 6,3–8,1 detik; kartunya berubah tanpa muat ulang. Dua puluh perangkat tiruan mengunduh firmware asli 1.411.040 byte sekaligus lewat HTTPS tiruan, masing-masing 1,5–2,7 detik (simulator, bukan ESP32 lewat WiFi). 100 perangkat tidak diukur. Telegram menerima dua kabar per perangkat, `🔄` lalu `✅` (server Telegram tiruan di lab: 44 pesan untuk 22); [🧩 Tingkat 3](#tingkat-3--gelombang-otomatis-canary-tunggu-sehat-lalu-sisanya-bertahap-buat-dari-nol-45-menit) memangkasnya menjadi satu ringkasan per gelombang (kunci jawabannya, di lab penulis: 5 pesan untuk 22 perangkat tiruan).

#### 9.3 Perangkat yang dihentikan: dilewati, tidak diantre (3 menit)

Perangkat latihanmu tertulis `dilewati: perangkat sedang offline: …`; kartunya `Offline`, dan **Perbarui** mati: `Perangkat tidak online: perintah pembaruan hanya dikirim ke perangkat online (tidak diantre).` (teks dari kode). **Hasilnya (lab penulis, perangkat tiruan `f00d00000004` yang dihentikan):** Bruno `perbarui Node 1` (URL perangkat itu) dijawab `409 {"pesan":"perangkat sedang offline: perintah update hanya dikirim ke perangkat online (tidak diantre)"}`, dan ±60 detik sesudah dihentikan, server Telegram tiruan menerima `📴 f00d00000004 offline sejak 15.43 WIB`.

Jalankan lagi simulator `alat` (perintah 4.2) kurang dari 5 menit sesudah dihentikan; kalau lebih lama, *alert* "Node diam" Modul 25 ikut berbunyi. Perangkatnya `Online` lagi (Telegram: `✅ <id> online lagi (offline <n> menit)`), tetapi versinya tetap: perintah tadi tidak diantre. Klik **Perbarui** di kartunya, lalu **Ya, perbarui** → `1.7.1`.

#### 9.4 Kedaluwarsa: tanpa kabar 10 menit (4 menit)

Cukup dibaca. Node 1 yang padam saat mengunduh diam sampai listriknya kembali. Telegram menulis `📴 <id> tidak kembali sesudah berhenti sengaja sejak HH.MM WIB` 3 menit sesudah `berhenti sengaja` (supaya *rollback*, yang lebih lama dari masa uji 60 detik, tidak memicu `📴`). Sesudah `OTA_BATAS_MENIT` (bawaan 10 menit), pembaruannya `kedaluwarsa (tanpa kabar)`, dan perangkat itu boleh diperbarui lagi. Begitu menyala, firmware lama menemukan rencana unduhannya di NVS lalu melapor `gagal` `padam saat mengunduh` (dari kode `pembaruan.cpp`), yang menimpa `kedaluwarsa`.

**Hasilnya (lab penulis, simulator dan Telegram tiruan, `OTA_BATAS_MENIT=3` khusus lab; papan ketiga tiruan `f00d00000003` dimatikan paksa saat mengunduh rilis uji tiruan 1.7.2; dipotong):**

```text
15.49.23 Telegram: 📴 f00d00000003 tidak kembali sesudah berhenti sengaja sejak 15.46 WIB
[15:49:37] WARN: pembaruan f00d00000003 ke 1.7.2 kedaluwarsa: tanpa kabar 3 menit
(simulator dinyalakan lagi)
f00d00000003: laporan pembaruan ikut vitals (1/3): {"id":"c-20261102-084623-26","hasil":"gagal","versi":"1.7.2","pesan":"padam saat mengunduh"}
[15:49:47] INFO: Telegram terkirim: ✅ f00d00000003 online lagi (offline 3 menit)
[15:49:48] WARN: f00d00000003 gagal memasang 1.7.2, tetap memakai 1.7.1: padam saat mengunduh
```

**Riwayat pembaruan**-nya `gagal`, bukan `kedaluwarsa`. Dengan bawaan, baris kedua berbunyi `… tanpa kabar 10 menit`; `📴` tetap 3 menit.

Perangkat armada tetap terdaftar: tanpa simulator, masing-masing memicu `📴` dan *alert* "Node diam". Biarkan simulator `alat-armada` berjalan sampai [11.3](#113--nonaktifkan-papan-ketiga-akun-brokernya-dihapus-putus-seketika-6-menit): di sana perangkatnya dinonaktifkan selagi `Online` (belum 🔴), baru simulatornya dihentikan.

> ⬆️ **Selesai Praktik 9?** Lanjut ke [Praktik 10](#praktik-10--perangkat-baru-dalam-1-menit-kode-klaim-dan-portal-30-menit): papan ketiga mendaftar sendiri dengan kode klaim.

### Praktik 10 — Perangkat baru dalam 1 menit: kode klaim dan portal (30 menit)

> 🖥️ **Alat yang dipakai:** **Chrome**, layar **Armada** sebagai admin (10.1, 10.4, 10.5); **Arduino IDE** dan **Serial Monitor** dengan kabel USB dari laptop ke papan ketiga (10.2–10.4); **HP** dan *stopwatch* (10.3); **VS Code**, terminal di **akar proyek** (10.2); **Bruno** (10.5). Konsep yang dipakai: 8.
>
> ⭐ **Wajib** — langkah 10.1, 10.2 (papan ketiga), 10.3, dan 10.4: kode klaim tampil sekali lalu ditutup, papan ketiga menjalankan firmware Node 1 versi 1.7.0, portalnya diisi dari HP, dan kartu barunya `Online` di **Armada** paling lama 60 detik sejak **Save** (bukti **P1**).

> [!NOTE]
> **Belum direkam penulis di papan.** Papan ketiga, portal di HP, dan klaim di papan sungguhan belum pernah dijalankan penulis. Teks Serial di bawah = teks dari kode; gambar portal = ilustrasi. Kotak **Hasilnya** = lab penulis: papan ketiga diperankan simulator mode klaim, dengan angka simulator, bukan ESP32 lewat WiFi.

Silabus meminta ESP32 ketiga (pinjaman atau Wokwi) terdaftar dalam 1 menit lewat portal dan kode klaim ([Konsep 8](#8-perangkat-baru-dalam-1-menit-identitas-kode-klaim-dan-akun-broker-otomatis)). Satu firmware untuk seluruh armada: papan ketiga menjalankan firmware Node 1 1.7.0 yang sama, `device_id`-nya dari MAC papan itu sendiri, kuncinya dari klaim, WiFi dan alamatnya dari portal. Akun brokernya dibuat backend sendiri di *dynamic security*. Tanpa *commit*.

> 🔀 **Tanpa papan ketiga** (juga **Tanpa Kit**): papan ketiga diperankan perangkat tiruan `f00d00000003` dari simulator mode klaim, dan **P1** dicentang sebagai tiruan. Kerjakan 10.1, lewati 10.2–10.3, lalu di 10.4 jalankan perintah di bawah sebagai ganti **Save** (*stopwatch* mulai saat Enter). Satu folder simulator = satu proses, jadi pakai salinan `alat` di samping repositorimu (terminal akar proyek; PowerShell: `Copy-Item -Recurse alat ..\alat-papan3`, tidak diuji penulis):
>
> ```text
> cp -r alat ../alat-papan3
> ```
>
> Di terminal baru, `cd ../alat-papan3`, lalu (alamat server = `ALAMAT_SERVER`; jalur gratis `http://192.168.1.37`; tanpa Pi `mqtt://127.0.0.1:1883` dan `http://192.168.1.10`):
>
> ```text
> node simulator-perangkat.js mqtt://192.168.1.37:1883 klaim <kode> https://iot.namaanda.my.id f00d00000003
> ```
>
> **Wokwi:** jalankan juga simulator di atas (untuk Praktik 11), lalu buat kode baru. Karena portal tidak bisa dibuka di Wokwi, ketik di kolom kirim Serial Monitor papan Wokwi-mu (`PAKAI_WOKWI = true`), lalu Enter:
>
> ```text
> klaim <kode> https://iot.namaanda.my.id
> ```
>
> Dari Wokwi hanya server ber-domain yang terjangkau. Perangkatnya terdaftar, tetapi tidak pernah `Online` di **Armada**: ia masuk broker publik dan mengirim kuncinya tanpa enkripsi (nonaktifkan juga di 11.3). Belum diuji penulis (1.7.0 bisa tidak muat di rak bawaan Wokwi, 1.310.720 byte); **P1** belum lulus penuh. Silabus v1.0.30 mencatat jalur ini ([§5.4](../../SILABUS.md#54-belajar-tanpa-hardware-apa-yang-bisa-dan-tidak-bisa-di-wokwi)), juga akun broker otomatis di gerbang Pi.

#### 10.1 ⭐ Buat kode klaim di Armada: tampil sekali, lalu Salin dan Tutup (5 menit)

Di **Armada**, bagian **Perangkat baru** (khusus admin), isi **Nama perangkat (tidak wajib)**, misalnya `Papan ketiga`, dan **Lokasi (tidak wajib)**, misalnya `garasi`. Biarkan **Berlaku (menit, 5-60)** `30`, lalu klik **Buat kode**.

**Hasilnya (lab penulis, Chrome tanpa layar; kode disamarkan):**

```text
Kode klaim untuk Papan ketiga (tiruan), berlaku sampai 16.10.37 WIB (30 menit):
XXXX-XXXX
Kode ini hanya tampil sekali: catat sekarang. Sesudah ditutup, kode tidak bisa dilihat lagi; buat kode baru bila hilang.
Salin  Tutup
```

Kode ini kamu ketik di portal lewat HP (10.3): ketuk **Salin** bila **Armada**-mu terbuka di HP itu (tombolnya berubah `Tersalin ✓`; teks dari kode, belum dicek penulis), atau catat di secarik kertas yang kamu buang sesudah 10.5. Jangan memotretnya atau menyimpannya di catatan belajar, chat, atau Git: sampai terpakai atau kedaluwarsa, siapa pun yang memegangnya bisa mendaftarkan papan ke rumahmu. Di alamat `http://<IP>`, browser tidak mengizinkan salin otomatis, jadi *toast*-nya menulis `Tidak bisa menyalin otomatis di alamat ini: kodenya sudah disorot, salin dengan Ctrl + C.` (juga di Chrome tanpa layar lab penulis). Klik **Tutup**: kode hilang dari layar, dan database hanya menyimpan sidik jarinya. Daftar **Kode terakhir (tanpa kodenya)** di lab penulis menulis `berlaku Papan ketiga (tiruan) (garasi) · berlaku sampai Sen, 2 Nov, 16.10 WIB`.

**Kamu lulus langkah ⭐ ini** kalau kodenya sudah kamu salin atau catat, kotaknya tertutup, dan daftar **Kode terakhir (tanpa kodenya)** menulis `berlaku`.

#### 10.2 ⭐ Papan ketiga: firmware 1.7.0 yang sama lewat kabel (8 menit)

Papan ketiga = ESP32 DevKit polos pinjaman, tanpa sensor dan layar: cukup kabel USB ke laptop (Node 1 tetap di *charger*-nya). Di Arduino IDE (sketsa Node 1 dengan `kunci.h` 5.2 dan setelan **Tools** 5.1), ubah dua baris versi di `konfigurasi.h` kembali ke `"1.7.0"` dan `"dipasang lewat kabel"` (kebalikan 6.1), lalu simpan. Pilih port papan ketiga di **Tools → Port**, lalu klik **Upload** seperti [Praktik 5](#praktik-5--node-1-170-lewat-kabel-untuk-terakhir-kalinya-25-menit-butuh-papan). Macet di `Connecting…`? Tahan **BOOT** begitu tulisan itu muncul, lepaskan saat `Writing at …` mulai berjalan. Sesudahnya, kembalikan kedua baris ke `"1.7.1"` dan `"dipasang lewat udara"`, simpan, lalu di terminal akar proyek `git diff --stat` harus tanpa keluaran, seperti 8.2. Papan pinjaman menyimpan rahasiamu: kosongkan sebelum dikembalikan (11.5).

Buka **Serial Monitor** (115200 baud); baris pertama terlewat? Tekan **EN**.

**Yang ditulis Serial Monitor (teks dari kode; belum direkam penulis di papan):**

```text
Node 1 Rumah - firmware 1.7.0 (dipasang lewat kabel)
…
Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.
…
Belum ada WiFi tersimpan.
Portal WiFi terbuka selama 180 detik: sambungkan HP ke WiFi "Node1-Rumah", lalu buka http://192.168.4.1
Portal bersandi: sandinya ada di label kotak Node 1 (SANDI_PORTAL di kunci.h).
```

Baris OLED itu wajar untuk papan polos, dan kolom sensornya kelak `null` atau angka mengambang (pin tanpa sensor). Tidak ada `Belum ada WiFi tersimpan.`? Berarti papan pinjaman itu masih menyimpan WiFi lama: ketik di kolom kirim Serial Monitor, lalu Enter:

```text
wifi lupa
```

Jawabannya (teks dari kode): `WiFi tersimpan dihapus. Restart sekarang; portal WiFi akan terbuka.`

**Kamu lulus langkah ⭐ ini** kalau Serial Monitor menulis `firmware 1.7.0 (dipasang lewat kabel)` dan portalnya terbuka, sedangkan `git diff --stat` tanpa keluaran.

#### 10.3 ⭐ Portal `Node1-Rumah` dari HP: WiFi, kode klaim, alamat server, dan alamat broker (7 menit)

Biarkan papan ketiga di kabel USB dengan Serial Monitor terbuka. Portal hanya 180 detik bila tidak dipakai: `Node1-Rumah` hilang? Tekan **EN** papan ketiga. Di HP, ikuti [Modul 10 4.4](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#44-isi-wifi-lewat-hp): matikan data seluler, sambungkan ke WiFi `Node1-Rumah` (kini dengan sandi portal [5.2](#52--portal-bersandi-sandi_portal-di-kuncih-3-menit)), lalu tunggu halaman portal terbuka sendiri atau buka `http://192.168.4.1`. Halaman pertama `Node 1 Rumah` berisi **Configure WiFi**, **Info**, dan **Exit**, tanpa **Update**. Ketuk **Configure WiFi**, ketuk nama WiFi 2,4 GHz rumahmu, isi **Password**, lalu tiga kolom di bawahnya (tanpa tulisan contoh di dalam kotak, hanya label di atasnya):

- **Kode klaim**: kode 10.1 (huruf kecil pun diterima server).
- **Alamat server**: **sama persis** dengan `ALAMAT_SERVER` ([2.3](#23--berkas-infrastruktur-dan-env-mesin-pusat-mosquitto_dynsec_password-dan-alamat_server-6-menit)), bukan sekadar contoh di labelnya: utama `https://iot.namaanda.my.id`, gratis `http://192.168.1.37` (pintu perangkat meneruskan klaim), tanpa Pi `http://192.168.1.10` (pintu 80 laptop terbuka, mode HP). Paling panjang 64 huruf, tanpa `/` di akhir; `http://` hanya ke alamat IP rumah.
- **Alamat broker**: sudah berisi `ALAMAT_BROKER` dari `konfigurasi.h`-mu (IP gerbang Pi); periksa saja (tanpa Pi: IP laptop).

Ilustrasi berikut bukan tangkapan HP: penulis menyusun ulang kedua halaman dari HTML asli WiFiManager 2.0.17 dengan setelan firmware 1.7.0; nama WiFi hanya contoh.

![Ilustrasi, bukan tangkapan HP: dua halaman portal WiFi papan baru yang disusun ulang penulis dari HTML, CSS, dan teks asli WiFiManager 2.0.17 dengan setelan firmware Node 1 1.7.0, dirender Chrome 156 di Linux selebar 375 piksel; tidak ada ESP32 yang menyajikannya. Kiri, halaman pertama http://192.168.4.1/: judul Node 1 Rumah dan nama WiFi portal Node1-Rumah, tombol biru Configure WiFi, Info, dan Exit tanpa tombol Update, lalu kotak No AP set (nomor 1). Tengah, halaman WiFi sesudah diisi: daftar WiFi contoh RumahKita, Tetangga_Sebelah, WiFi_Kos_Melati bergembok; SSID berisi RumahKita dan Password berisi titik-titik (nomor 2); kolom Kode klaim dari /armada (boleh kosong) berisi XXXX-XXXX, kode yang disamarkan (nomor 3); kolom Alamat server (labelnya memberi contoh http://192.168.1.10) berisi https://iot.namaanda.my.id (nomor 4); kolom Alamat broker (IP gerbang Pi) berisi 192.168.1.37 (nomor 5); tombol Save (nomor 6), Refresh, dan No AP set. Kanan atas, isi awal papan baru sebelum diketik: kolom kode dan alamat server kosong, alamat broker sudah 192.168.1.37. Keterangan: kolom kode paling banyak 12 huruf, alamat server 64 huruf dan harus persis sama dengan ALAMAT_SERVER server (jalur gratis http://192.168.1.37, tanpa Pi http://192.168.1.10), alamat broker 40 huruf; ketiga kotak tanpa tulisan contoh, hanya label di atasnya. Huruf Noto Sans karena Verdana tidak ada di mesin penulis.](aset/portal-kode-klaim.png)

Siapkan *stopwatch*, ketuk **Save**, dan mulai menghitung. Papan menyimpan WiFi dan kedua alamat di NVS (kodenya hanya di RAM), lalu menutup portal begitu tersambung ke WiFi rumah; nyalakan lagi data seluler HP-mu.

**Kamu lulus langkah ⭐ ini** kalau HP masuk ke `Node1-Rumah` dengan sandi portal, ketiga kolom terisi dengan alamat server yang sama persis dengan `ALAMAT_SERVER`, dan **Save** sudah diketuk.

#### 10.4 ⭐ P1: kartu baru `Online` di Armada dalam 60 detik sejak Save (6 menit)

Lihat **Armada** di laptop, tanpa muat ulang. Begitu papan menukar kodenya, *toast* `<device_id> terdaftar lewat kode klaim sebagai <nama>; akun broker dibuat di broker gerbang pi1` muncul (tanpa Pi: `… di broker pusat`), lalu kartu barunya `Online` dengan nama dan lokasi dari kode: mula-mula `jenis belum diketahui` dan `belum pernah terlihat`, lalu `Node 1` dengan **Versi firmware** `1.7.0` begitu `telemetry` pertama tiba. Hentikan *stopwatch* saat kartu `Online` versi `1.7.0`: paling lama 60 detik = **P1**. Kesehatan dan lencana `perlu diperbarui` baru tampil sesudah halaman dimuat ulang.

**Yang ditulis Serial Monitor (teks dari kode; belum direkam penulis di papan; dipotong):**

```text
Kode klaim diterima (tidak disimpan di NVS); dikirim ke https://iot.namaanda.my.id begitu WiFi siap.
…
Klaim BERHASIL dalam … ms: kunci perangkat disimpan di NVS (nama pengguna broker <device_id>). Menyambung ke broker...
```

Lamanya di papan sungguhan belum diukur penulis: *stopwatch*-mu yang pertama mengukurnya (catat di ➕ F). Lebih dari 60 detik, `Klaim DITOLAK`, atau `Klaim GAGAL`? Lihat [🚨](#-kalau-tidak-jalan) kelompok **Portal dan kode klaim**.

**Hasilnya (lab penulis, simulator: papan ketiga tiruan `f00d00000003`, jembatan TLS tiruan):**

```text
f00d00000003: klaim BERHASIL dalam 274 ms (nama pengguna broker f00d00000003); kunci disimpan di data/arsip-simulator.json, menyambung ke broker...
1 perangkat palsu menuju mqtt://192.168.1.37:1883 (firmware tiruan bawaan 1.7.0). Ketik misalnya …
f00d00000003: online (firmware 1.7.0)
```

Sejak simulator dijalankan: *toast* 1,2 detik, kartu baru 1,5 detik, `Online` versi `1.7.0` 6,7 detik (**P1** tiruan; angka simulator, bukan papan lewat WiFi). Backend menulis `POST /provision/klaim -> 201 (147 ms)`, dan log gerbang `setDefaultACLAccess` lalu `createClient | username=f00d00000003`, tanpa satu perintah pun di Pi. Gambar berikut dari lab penulis (papan ketiga = simulator, kode disamarkan); di layarmu nama dan `device_id`-nya milikmu.

![Komposit tangkapan layar asli bagian Perangkat baru di layar Armada dashboard Rumah Pintar Mini 1.4.0 dengan backend 1.5.0 di VPS tiruan, Chrome 156 di Linux, laptop 1280 piksel; bilah alamat tidak tertangkap. Praktik 10.1 dan 10.4, 2 Nov 2026 pukul 17.04 WIB. Atas: kotak Buat kode klaim dengan kolom Nama perangkat dan Lokasi yang sudah kosong lagi, Berlaku 30 menit, tombol Buat kode (nomor 1); kotak kuning Kode klaim untuk Papan ketiga (tiruan), berlaku sampai 17.34.30 WIB (30 menit): dengan kode yang disamarkan penulis menjadi XXXX-XXXX sebelum tangkapan, jadi kode asli tidak pernah tertangkap (nomor 2); kalimat Kode ini hanya tampil sekali: catat sekarang. dengan tombol Salin dan Tutup (nomor 3); daftar Kode terakhir (tanpa kodenya) berlencana berlaku, Papan ketiga (tiruan) (garasi) · berlaku sampai Sen, 2 Nov, 17.34 WIB (nomor 4). Tengah: daftar yang sama sesudah papan ketiga tiruan, simulator mode klaim, menukar kodenya: lencana dipakai, dipakai f00d00000003, Sen, 2 Nov, 17.04 WIB (nomor 5). Bawah: kartu baru Papan ketiga (tiruan), Online, Node 1 · garasi · f00d00000003, versi 1.7.0 tanpa lencana perlu diperbarui, Kesehatan belum ada vitals, muncul tanpa muat ulang halaman (nomor 6); kesehatan dan lencana perlu diperbarui baru menyusul saat data armada diambil ulang. Legenda bernomor di kanan.](aset/kode-klaim-dibuat.png)

**Kamu lulus langkah ⭐ ini** (bukti **P1**) kalau kartu papan ketiga `Online` di **Armada** paling lama 60 detik sejak **Save**, dengan versi `1.7.0`, dan kodenya `dipakai` di daftar. Biarkan papan ini menyala untuk Praktik 11.

#### 10.5 Klaim yang ditolak: `403`, `409`, dan `429` (4 menit)

Buat kode BARU di **Perangkat baru**, tulis di `backend/bruno/.env` sebagai `KODE_KLAIM=<kode>` (di luar Git, seperti sandi Modul 20), lalu kirim Bruno `klaim perangkat tiruan` dengan `device_id` papan ketigamu di tab **Body** (tiruan: biarkan `f00d00000003`). Ganti isi `KODE_KLAIM` dengan kode 10.1 yang sudah terpakai, kirim lagi, lalu klik **Send** terus sampai `429`. Jangan tekan **Ctrl + S**. Tab **Tests** menandai satu Assert gagal: wajar, permintaan itu mengharapkan `201`.

**Hasilnya (lab penulis, papan ketiga tiruan; dipotong):**

```text
409 {"pesan":"f00d00000003 masih terdaftar dan aktif: nonaktifkan dulu di /armada, baru klaim ulang"}
403 {"pesan":"kode klaim salah, kedaluwarsa, atau sudah dipakai: minta kode baru ke admin"}
429 {"statusCode":429,"error":"Too Many Requests","message":"terlalu banyak percobaan: coba lagi dalam 57 detik"}
```

`409`: identitas yang masih aktif tidak bisa direbut, dan kode barunya tetap `berlaku` (uji ini butuh kode baru karena server memeriksa kodenya lebih dulu). `403` sama persis untuk kode terpakai, kedaluwarsa, dan asal-asalan, supaya penebak tidak tahu kode mana yang pernah ada. `429` datang pada percobaan ke-11 dalam semenit dari alamat IP yang sama (di jalur utama, satu alamat untuk seluruh rumahmu): tunggu semenit sebelum klaim berikutnya. Hapus lagi baris `KODE_KLAIM`. Jawaban papan untuk ketiganya: [🚨](#-kalau-tidak-jalan) *Klaim ditolak: …*.

> ⬆️ **Selesai Praktik 10?** Baca [Konsep 10](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika), lalu lanjut ke [Praktik 11](#praktik-11--jeda-vitals-dari-jauh-dan-menonaktifkan-perangkat-hilang-20-menit): papan ketiga yang baru terdaftar akan kamu nonaktifkan, lalu klaim ulang.

### Praktik 11 — Jeda `vitals` dari jauh dan menonaktifkan perangkat hilang (20 menit)

> 🖥️ **Alat yang dipakai:** **Chrome**, layar **Armada** sebagai admin; **terminal SSH ke Pi**, folder `rumah-pintar-mini/edge` (11.1, 11.3, 11.4; tanpa Pi: terminal laptop di akar proyek); **Grafana** (`/grafana/`; 11.2); **Bruno** (11.3, 11.5); papan ketiga: **Serial Monitor** Arduino IDE lewat kabel USB-nya, atau terminal simulatornya (11.3, 11.5). Konsep yang dipakai: 9, 10.
>
> ⭐ **Wajib** — langkah 11.1, 11.2, 11.3, dan 11.4: jeda `vitals` Node 1 menjadi 60 detik dari jauh, *silence* Grafana terpasang lebih dulu, papan ketiga dinonaktifkan dan langsung diputus broker, dan kamu tahu apa yang tertinggal.

Dua pekerjaan admin dari jauh: mengubah setelan dan memutus perangkat yang hilang. Papan ketiga Praktik 10 dinonaktifkan, lalu dihidupkan lagi di 11.5. Tanpa *commit*. Kotak **Hasilnya**: lab penulis, semua perangkat simulator, Telegram tiruan.

> 🔀 **Tanpa Kit** (juga Wokwi): 11.1 di kartu Node 1 tiruan `f00d00000001`; papan ketiganya = papan ketiga tiruan `f00d00000003` (simulator mode klaim, 10.4); papan Wokwi-mu ikut dinonaktifkan. **Tanpa Pi:** PowerShell memakai `Select-String`, bukan `grep` (tidak diuji penulis); log brokernya berawalan `dynsec: backend/backend | …` dan backend menulis `broker pusat`.

#### 11.1 ⭐ Jeda `vitals` 60 detik lewat Pengaturan lain (5 menit)

Di kartu Node 1, klik **Pengaturan lain**, isi **Jeda vitals (detik, 60-3600)** dengan `60`, lalu klik **Simpan jeda**. Di bawahnya tertulis batasnya: `Hanya vitals (kesehatan). telemetry tetap setiap 10 detik. WiFi, alamat server, dan kunci tidak bisa diubah dari jauh.`

**Hasilnya (lab penulis, Node 1 tiruan `f00d00000001` di simulator):** *toast* `Jeda vitals Latihan ruang tamu = 60 detik.`, kartu `… vitals dikirim setiap 60 detik (diatur admin).`, dan simulator `f00d00000001: jeda vitals disimpan: 60 detik`.

Setelan ini dikirim sebagai `config` *retained* (Konsep 9). Lihat di terminal Pi, folder `edge` (`<sandi>` = sandi akun `pemantau`):

```text
docker compose exec mosquitto mosquitto_sub -u pemantau -P <sandi> -t 'rpm/<device_id Node 1>/cmd' -v -C 1
```

**Hasilnya (lab penulis, Node 1 tiruan; sama di broker pusat dan gerbang):**

```text
rpm/f00d00000001/cmd {"id":"c-20261102-084858-27","ts":"2026-11-02T08:48:58Z","aksi":"config","jeda":{"vitals_s":60}}
```

Punya aturan kipas (Modul 19)? `ambang`-nya ikut di pesan ini. Ganti `cmd` dengan `vitals` dan `-C 1` dengan `-C 2`: kedua `ts`-nya berselisih ±60 detik (lab penulis: 15.49.58 dan 15.50.58 WIB). Di papan (teks dari kode): `Jeda vitals disimpan ke NVS: 60 detik`, jadi setelan ini bertahan saat listrik padam. Biarkan 60 detik sampai Praktik 13 supaya kesehatan Node 1 di kotak terbaca tiap menit; [13.3](#133-jeda-vitals-kembali-300-detik-opsional-2-menit) mengembalikannya ke 300.

**Kamu lulus langkah ⭐ ini** kalau kartu Node 1 menulis `vitals dikirim setiap 60 detik (diatur admin)` dan `cmd` *retained*-nya memuat `"jeda":{"vitals_s":60}`.

#### 11.2 ⭐ Buat *silence* untuk *alert* "Node diam" di Grafana sebelum menonaktifkan (3 menit)

Perangkat yang sungguh hilang biasanya sudah 🔴 di *alert* "Node diam"; sesudah dinonaktifkan, Grafana mengabarkan `✅ <nama> kembali mengirim data.` yang palsu ([Konsep 10](#10-menonaktifkan-perangkat-hilang-dari-mencabut-kunci-ke-putus-seketika)). Jadi, *silence* dulu.

Di Grafana, buka **Alerting → Silences**, lalu klik **Create silence** (bila sudah ada *silence* lain: **Add Silence**). Di **Refine affected alerts**, isi **Label** dengan `device_id` dan **Value** dengan `device_id` papan ketiga (salin dari kartunya); **Operator** sudah `=`. **Duration** bawaannya `2h`; ganti **Comment** menjadi misalnya `papan ketiga dinonaktifkan`, lalu klik **Save silence**. Nama tombol dan kolomnya dari kode Grafana 13.2.4; *silence* penulis dibuat lewat API.

**Hasilnya (lab penulis, perangkat tiruan; seperti yang diterima server Telegram tiruan):** dua perangkat yang sama-sama 🔴 dinonaktifkan. Yang ber-*silence* tanpa kabar selama 9 menit; yang tanpa *silence* memicu `✅ Uji nonaktif tanpa silence kembali mengirim data.` 4 menit 36 detik kemudian. Untuk papan yang masih `Online` (belum 🔴), *silence* ini latihan kebiasaan.

**Kamu lulus langkah ⭐ ini** kalau daftar **Silences** memuat `device_id=<device_id papan ketiga>` di kolom **Matching labels** sebelum kamu menekan **Nonaktifkan**.

#### 11.3 ⭐ Nonaktifkan papan ketiga: akun brokernya dihapus, putus seketika (6 menit)

Pastikan kartu papan ketiga ([10.4](#104--p1-kartu-baru-online-di-armada-dalam-60-detik-sejak-save-6-menit)) `Online` (tanpa Kit: simulatornya berjalan). Papan pinjaman sudah dikembalikan? Tetap nonaktifkan (lognya lalu hanya `deleteClient`), atau berlatih dengan perangkat latihan `f00d00000005` dari [3.2](#32--perangkat-latihan-akun-brokernya-dibuat-otomatis-di-broker-gerbang-pi1-8-menit). Klik **Pengaturan lain** → **Nonaktifkan**. Kotak merah `Nonaktifkan <nama>? Untuk perangkat yang hilang, dicuri, atau tidak dipakai lagi. …` terbuka dengan fokus di **Batal**; klik **Ya, nonaktifkan**.

Kartunya berlencana `nonaktif` (`Dinonaktifkan: kuncinya dicabut dan kirimannya diabaikan. …`), tanpa **Perbarui**, **Canary**, dan **Pengaturan lain**. Kotak kuning `Sesudah menonaktifkan:` memuat dua butir dari server: akun brokernya sudah dihapus; pengingat `mosquitto_passwd -D` untuk perangkat Modul 21 (3.4; papan dari kode klaim: abaikan). Fokus pindah ke **Tutup**-nya, demi pengguna keyboard dan pembaca layar. **Hasilnya (lab penulis, papan ketiga tiruan `f00d00000003`):** *toast* `f00d00000003 dinonaktifkan oleh akun 1: akun brokernya dihapus di broker gerbang pi1`. Gambar: lab penulis (perangkat simulator); nama dan `device_id`-mu berbeda.

![Komposit dua tangkapan layar asli kartu Papan ketiga (tiruan), perangkat simulator f00d00000003, di layar Armada dashboard Rumah Pintar Mini 1.4.0 dengan backend 1.5.0 di VPS tiruan, Chrome 156 di Linux, laptop 1280 piksel; bilah alamat tidak tertangkap. Praktik 11.3, 2 Nov 2026 pukul 17.05 WIB. Atas, bagian bawah kartu: Pengaturan lain terbuka dengan Jeda vitals 300 dan Simpan jeda, tombol bergaris merah Nonaktifkan, lalu kotak merah Nonaktifkan Papan ketiga (tiruan)? yang menjelaskan bahwa kunci dicabut, akun broker dihapus, dan perangkat langsung terputus (nomor 1), dengan tombol Ya, nonaktifkan dan Batal (nomor 2). Bawah, kartu utuh sesudah Ya, nonaktifkan: lencana merah nonaktif (nomor 3), versi 1.7.0, kotak merah muda Dinonaktifkan: kuncinya dicabut dan kirimannya diabaikan. Hidup lagi hanya dengan kunci baru atau kode klaim baru. (nomor 4), tanpa tombol Perbarui, Canary, dan Pengaturan lain; kotak kuning Sesudah menonaktifkan: dengan dua langkah dari server, yaitu akun broker f00d00000003 sudah dihapus di broker gerbang pi1 sehingga perangkat langsung diputus, dan pengingat untuk perangkat yang pernah didaftarkan cara Modul 21 agar baris lamanya dihapus dengan mosquitto_passwd -D lalu broker di-restart (nomor 5); tombol Tutup (nomor 6). Legenda bernomor di kanan.](aset/nonaktifkan-perangkat.png)

Segera, di terminal Pi folder `edge`:

```text
docker compose logs --since 5m mosquitto | grep <device_id papan ketiga>
```

**Hasilnya (lab penulis, papan ketiga tiruan; awalan dibuang):**

```text
dynsec: local.jembatan-pi/(null) | deleteClient | username=f00d00000003
Client f00d00000003 [172.20.0.1:47286] disconnected: administrative action.
Client f00d00000003 [172.20.0.1:50160] disconnected: not authorised.
```

Akun dihapus lewat jembatan; percobaan masuk berikutnya ditolak. Simulator menulis `… DITOLAK broker (kode 5): kunci salah, belum didaftarkan, atau sudah dicabut. Dicoba lagi 60 detik lagi.`; papan sungguhan menulis kalimat yang sama berawalan `MQTT` di Serial Monitor (teks dari kode). **Perbarui** sudah hilang; Bruno `perbarui Node 1` (URL papan ketiga) dijawab `409` `perangkat sudah dinonaktifkan (kuncinya dicabut)` (lab penulis).

Mengerjakan Praktik 9? Nonaktifkan juga perangkat armada tiruan `f00d00000011` dan seterusnya selagi `Online`, lalu hentikan simulator `alat-armada` (**Ctrl + C**).

**Kamu lulus langkah ⭐ ini** kalau kartu papan ketiga berlencana `nonaktif` dan log broker memuat `deleteClient` untuk `device_id`-nya (dan `administrative action` bila papannya tersambung).

#### 11.4 ⭐ Yang tertinggal: status lama, kunci di NVS, dan `503` saat gerbang tak terjangkau (2 menit)

Tiga sisa yang jujur (Konsep 10):

- **Status *retained* `online` lama.** Broker memutus tanpa wasiat dan akun `backend` tidak boleh menulis topik `status`. Periksa dengan perintah 11.1, topiknya `rpm/<device_id papan ketiga>/status`. **Hasilnya (lab penulis):** papan ketiga tiruan masih `online` di kedua broker, padahal kartunya `nonaktif`; backend mengabaikannya.
- **Kunci di NVS papan** terbaca oleh orang yang membongkarnya, tetapi tak berguna lagi: akunnya sudah dihapus. Sandi WiFi rumah ikut terbaca.
- **`503` saat gerbang tak terjangkau**, misalnya internet rumah putus di jalur utama. Kartu menampilkan kotak merah yang menetap sampai **Tutup**: `belum tersimpan di database (…). Perintah ke broker yang sempat terkirim bisa tetap dikerjakan begitu sambungannya pulih: ulangi langkah ini …`.

**Hasilnya (lab penulis, internet rumah tiruan dicabut 6 detik; perangkat armada tiruan `f00d00000030`):** `503` sesudah 6,1 detik. Begitu internet kembali, gerbang tetap menjalankan `deleteClient` yang tertahan, padahal database masih `online`. Diulang: `200` (140 ms) dengan `"akun_broker": "tidak-ada"` dan langkah `mosquitto_passwd -D`: wajar, akunnya memang sudah terhapus ([🚨](#-kalau-tidak-jalan) *`503` `belum tersimpan di database` …*).

**Kamu lulus langkah ⭐ ini** kalau `mosquitto_sub` menunjukkan status *retained* papan ketiga yang tertinggal (biasanya `online`) sementara kartunya `nonaktif`, dan kamu tahu jawaban atas `503`: ulangi **Nonaktifkan** sesudah gerbang terjangkau.

#### 11.5 Klaim ulang dengan kode baru (4 menit)

Papan itu ketemu lagi? Kartunya aktif lagi hanya dengan kode **baru** (kode [10.1](#101--buat-kode-klaim-di-armada-tampil-sekali-lalu-salin-dan-tutup-5-menit) sudah terpakai: `403`). Di **Perangkat baru**, isi nama dan lokasi yang sama, klik **Buat kode**, **Salin**, lalu **Tutup**. Papan ketiga sungguhan masih menyimpan WiFi dan alamat servernya; ketik di kolom kirim Serial Monitor-nya, lalu **Enter**:

```text
klaim <kode>
```

**Yang ditulis Serial Monitor (teks dari kode; belum direkam penulis di papan; dipotong):**

```text
klaim: kode diterima; dikirim ke <alamat server> begitu WiFi siap (hasilnya tampil di log).
…
Klaim BERHASIL dalam … ms: kunci perangkat disimpan di NVS (nama pengguna broker <device_id>). Menyambung ke broker...
```

Papan ketiga tiruan: hentikan simulatornya (**Ctrl + C**), lalu jalankan lagi perintah klaim 10.4 dengan kode baru di folder yang sama. **Hasilnya (lab penulis, simulator):** `f00d00000003: klaim BERHASIL dalam 309 ms …`, log backend `f00d00000003 terdaftar lewat kode klaim sebagai Papan ketiga (tiruan); akun broker dibuat di broker gerbang pi1` (`201`, 147 ms), dan database kembali `online`. Perangkat latihan: ganti kunci `f00d00000005` (3.4 langkah 1), kunci barunya ke `alat/.env`, lalu jalankan ulang simulator 4.2.

Papan pinjaman akan dikembalikan? Nonaktifkan lagi, lalu kosongkan: WiFi rumahmu tersimpan di NVS-nya, kunci ESP-NOW dan sandi portal di firmware-nya. Di Arduino IDE, buka sketsa kosong (**File → New Sketch**), atur **Tools → Erase All Flash Before Sketch Upload** ke **Enabled** (port: papan ketiga), lalu klik **Upload** (macet di `Connecting…`? Tahan **BOOT** begitu tulisan itu muncul, lepaskan saat `Writing at …` berjalan). Sesudahnya kembalikan ke **Disabled** supaya unggahan berikutnya tidak menghapus NVS.

> ⬆️ **Selesai Praktik 11?** Semua pembaruan sudah berjalan tanpa kabel, jadi Node 1 siap masuk kotak. Baca [Konsep 11](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v) bila belum, lalu lanjut ke [Praktik 12](#praktik-12--dari-breadboard-ke-kotak-90-menit-butuh-papan-jalur-solder-ditambah-60-menit). Jalur tanpa Kit: tulis rencana kotakmu di Praktik 12, lalu lanjut ke [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini).

### Praktik 12 — Dari breadboard ke kotak (90 menit, butuh papan; jalur solder ditambah 60 menit)

> 🖥️ **Alat yang dipakai:** **penggaris**, **obeng** kecil, pengupas kabel, **multimeter** ([Praktik 1 Modul 2](../../fase-0-fondasi/modul-02-listrik-dan-unggah-pertama/README.md#praktik-1--mengukur-dengan-multimeter-20-menit)), label, dan pengikat kabel; **Chrome**: layar **Armada** dan halaman detail Node 1 sebagai admin; **Serial Monitor** lewat kabel USB laptop (12.4: servo dan buzzer); **VS Code**, terminal di **akar proyek** (12.1). Konsep yang dipakai: 11.
>
> ⭐ **Wajib untuk jalur ber-Kit** — langkah 12.1 sampai 12.4 dan 12.6 sampai 12.9: papan ekspansi cocok, Node 1 pindah per kelompok dan lolos uji, catu daya Modul 9 berlabel dengan GND bersama, multimeter dan uji tarik lolos, lalu kotak berlabel tertutup dan Node 1 `Online` lagi (bukti **K1 a–d**).

> [!NOTE]
> **Belum direkam penulis.** Penulis tidak memegang papan ekspansi, kotak, solder, atau multimeter, jadi Praktik 12–13 tanpa kotak **Hasilnya**. Langkahnya dari [`PETA-PIN.md`](kode/PETA-PIN.md#node-1-di-dalam-kotak-sejak-modul-28) versi 7, Modul 2, 5, 6, dan 9, serta sumber yang dibaca 30–31 Oktober 2026 (SparkFun dan HSE untuk solder); teks layar = teks dari kode. Barang tiap penjual berbeda: ukur dan cocokkan barangmu sendiri.

Pembaruan kini lewat udara (Praktik 7–8), jadi colokan USB Node 1 boleh tertutup kotak. Pin dan firmware **tidak berubah**; yang berganti hanya cara menyambung (Konsep 11), dan Node 2 tetap di wadah Modul 14-nya. Selama 12.2–12.9 (±1,5 jam), Node 1 hanya menyala saat uji 12.4, jadi Telegram mengabarkan `📴 <device_id> offline sejak HH.MM WIB` (teks dari kode) dan *alert* "Node diam" Modul 25 berbunyi. *Commit* hanya di 12.1.

> 🔀 **Tanpa Kit** (juga Wokwi): tulis **rencana kotak** di catatan belajarmu ([➕ F](#f-simpan-catatan-belajar-bukti-o0-sampai-p1-foto-sebelumsesudah-dan-angka-papanmu)): gambar tata letak 12.3, daftar belanja [🧰](#-yang-perlu-disiapkan) dengan harga bertanggal yang kamu cek, dan ukuran yang kamu catat (dalam kotak, jarak dua deret kaki dari keterangan penjual). Rencana ini **belum** lulus K1; Praktik 13 menunggu papan.

#### 12.1 ⭐ Cocokkan papan ekspansi dengan DevKit-mu: ukur jarak dua baris pin (5 menit)

Dengan penggaris plastik (bukan logam: Node 1 masih menyala di breadboard), ukur jarak dua deret kaki DevKit-mu, dari tengah kaki ke tengah kaki seberangnya, lalu jarak dua deret lubang papan ekspansi. Keduanya harus sama; jangan percaya angka "standar" karena jaraknya tidak seragam antarpabrik. Setiap deret berisi 15 lubang ([Konsep 1 Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#1-anatomi-papan-esp32-devkit-v1-pin-mana-saja-yang-kamu-punya)); 19 berarti papan untuk 38 pin, yang tidak cocok.

Tulisan terminalnya bisa nomor GPIO (`32`), nama D (`D32`), atau keduanya. Cocokkan dengan kolom pertama tabel Node 1 di `PETA-PIN.md` (termasuk `36 (VP)` dan `16 / 17 (RX2 / TX2)`), lalu catat padanannya dalam satu kalimat di bawah tabel **Node 1 di dalam kotak** (VS Code, cabang `fitur/armada`), misalnya:

```text
Papan ekspansiku menulis nomor GPIO tanpa D (32 = D32, 36 = VP, 16 = RX2); colokan DC-nya tidak dipakai.
```

Lalu di terminal laptop:

```text
git add PETA-PIN.md
git commit -m "Modul 28 Praktik 12: tulisan terminal papan ekspansi"
git push
```

**Kamu lulus langkah ⭐ ini** kalau kedua jarak itu sama, setiap deret berisi 15 lubang, dan padanan tulisannya tercatat di `PETA-PIN.md`.

#### 12.2 ⭐ Cabut semua daya: charger papan dan adaptor beban (2 menit)

Belum punya foto "sebelum" ([🔁 Langkah 5](#langkah-5--foto-sebelum-node-1-dari-atas))? Potret sekarang. Catat juga **Sinyal WiFi** kartu Node 1 (Konsep 11). Lalu, dengan urutan aturan emas catu daya, matikan MB102 dan cabut kabel **MB102** dulu, baru cabut kabel **ESP32** dari colokan USB papan. Mulai sekarang kabel hanya dipasang atau dipindah tanpa listrik, juga di antara uji 12.4.

**Kamu lulus langkah ⭐ ini** kalau kedua kabel daya tercabut, dan tidak ada LED yang menyala di DevKit, MB102, maupun modul relay.

#### 12.3 ⭐ Rencana tata letak di kertas: papan, sensor, daya, dan ventilasi (15 menit)

Gambar dasar kotakmu dari atas, sebaiknya seukuran asli supaya barangnya bisa diletakkan di atasnya. Contohnya diagram [Konsep 11](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v); susunanmu boleh lain, asal:

- **Di dalam:** papan ekspansi dengan DevKit, breadboard mini dengan MB102 di ujung relnya, modul relay, dan MAX485 (bila dipakai). Rel 3,3 V di breadboard mini kedua, seperti rel bawah meja kerja, bukan rel sisi **OFF** MB102.
- **Daya:** satu lubang dekat MB102 dan colokan USB DevKit.
- **Di luar atau menembus dinding:** DHT22 di luar, jauh dari ESP32 dan MB102 yang hangat; PIR dan LDR menghadap ruangan; kabel HC-SR04 ke tandon, sensor tanah ke pot, dan kabel beban (lampu, kipas, pompa, servo tirai).
- **Dari luar:** OLED dan LED status terlihat; tombol D13 terjangkau (portal WiFi: tahan D13 sambil menekan EN); tombol EN terjangkau atau ditandai.
- **Ventilasi** di dinding atas dan bawah; kotak **lebih tinggi** dari tandon dan pot, jauh dari percikan air; tutupnya tetap muat di atas komponen tertinggi.

Buat lubangnya selagi kotak kosong: dengan alat tangan, pelan-pelan, arah potongan menjauhi tangan, secukupnya. Haluskan tepinya supaya isolasi kabel tidak tergores.

**Kamu lulus langkah ⭐ ini** kalau rencanamu memuat semua butir ini, lubangnya sudah dibuat, dan gambarnya kamu potret untuk catatan belajar.

#### 12.4 ⭐ Pindah per kelompok PETA-PIN 7: daya, aktuator, lalu sensor (35 menit)

Setiap kelompok melewati siklus yang sama: **pasang** tanpa listrik → **periksa cepat** dengan mode kontinuitas (rel 5 V dan 3,3 V ke GND **diam**; GND papan ekspansi dan GND MB102 **bip**; lengkapnya di 12.7) → **nyalakan** (kabel ESP32 dulu, baru MB102) → **uji** → **matikan** (MB102 dulu). Kabelnya: satu per terminal bertuliskan GPIO yang sama dengan tabel Node 1; kabel tunggal 22 AWG, pendek tetapi tidak tegang, dikupas sepanjang lubang terminal saja (tembaga tidak menyembul, isolasi tidak terjepit); merah 5 V, oranye 3,3 V, hitam GND.

**(a) Daya.** Tempel breadboard mini (dan breadboard untuk rel 3,3 V) di dasar kotak, lalu tancapkan MB102 di ujung relnya: jumper sisi beban di **5V**, sisi lainnya **OFF**, seperti meja kerja. Pindahkan DevKit ke papan ekspansi: tulisan kakinya (`EN`, `VIN`, `GND`, `3V3`) harus sama dengan tulisan terminal di sebelahnya supaya tidak terbalik. Tekan rata, lalu kencangkan papan ekspansi ke dasar kotak (sekrup di lubang sudutnya bila ada, atau perekat busa dua sisi). Pasang kabel hitam dari kedua terminal GND ke rel GND MB102 dan ke GND rel 3,3 V, lalu kabel oranye dari terminal `3V3` ke rel 3,3 V. Selama 12.4, kabel **ESP32** boleh dari laptop bila kamu butuh Serial Monitor. Uji: kartu Node 1 di **Armada** kembali `Online` sendiri, dan LED biru DevKit berkedip cepat (menurut kode: DHT22 dan HC-SR04 belum terpasang).

**(b) Aktuator.** Aturan emas catu daya: beban dari rel 5 V MB102, tidak pernah dari pin VIN atau 3V3 ESP32, dengan GND bersama. Relay `IN1` ke D32 (lampu), `IN2` ke D33 (kipas), `VCC` dan `GND`-nya ke rel 5 V dan GND; rangkaian MOSFET pompa [Praktik 7 Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#praktik-7--pompa-3-detik-lewat-mosfet-30-menit) di breadboard mini (tabel 12.5); servo tirai ke D26, kabel merah dan cokelatnya ke rel 5 V dan GND, plus kapasitor 100 µF Modul 5 (kaki panjang ke 5 V); buzzer pasif (D27) dan LED status (D2) masing-masing lewat 220 Ω; tombol ke D13 dan GND. Uji di halaman detail Node 1, bagian **Kendali**: **Lampu** dan **Kipas** (relay berbunyi klik, bebannya menyala); pompa diuji di (c): tanpa HC-SR04, firmware menolaknya. Tekan sebentar tombol D13: lampu berganti. Servo dan buzzer tidak punya tombol di dashboard; ketik di kolom kirim Serial Monitor satu per satu, lalu Enter:

```text
tirai 90
tirai 0
bunyi
```

Servo bergerak dan buzzer berbunyi pendek; Serial Monitor menjawab `status: …` (teks dari kode).

**(c) Sensor.** DHT22 (D14, 3,3 V) di luar kotak; pembagi LDR dan kapasitornya di breadboard mini ke VP, LDR-nya menembus dinding; sensor tanah (VN, 3,3 V) ke pot; PIR (D34, 5 V; keluarannya hanya 3,3 V); HC-SR04 (TRIG ke D15, ECHO lewat pembagi ke D35, 5 V) ke tandon; OLED (SDA D21, SCL D22, 3,3 V); MAX485 bila dipakai (RO lewat pembagi ke RX2, DI ke TX2, DE dan RE ke D4, VCC 5 V; Modul 15). Uji di halaman detail Node 1 sesudah PIR menghangat ±1 menit ([Praktik 5 Modul 6](../../fase-1-esp32-embedded/modul-06-membaca-sensor/README.md#praktik-5--pir-sensor-gerak-dan-pemanasan-1-menit-20-menit)): **Suhu** dan **Kelembapan** mirip sebelum pindah, **Cahaya** berubah saat LDR ditutup telapak tangan, **Gerakan** `Ada` saat kamu melambai, **Kelembapan tanah** berubah saat sensornya diangkat dari pot, **Air tandon** sama dengan sebelumnya, **3 detik** di kartu `Pompa: siram selama` menyalakan pompa (selang ke tandon), OLED menampilkan bacaannya, dan LED status kembali berkedip sekali per detik. **Suhu** terus naik? DHT22 terlalu dekat dengan ESP32 atau MB102 ([🚨](#-kalau-tidak-jalan) *Suhu DHT22 terlalu tinggi di dalam kotak*; kelompok yang tidak menurut: *Terminal kendor, sambungan solder dingin, atau kabel tertukar*).

**Kamu lulus langkah ⭐ ini** kalau ketiga kelompok lolos ujinya, dan setiap kabel sinyal masuk ke terminal bertuliskan GPIO yang sama dengan tabel Node 1.

#### 12.5 Rangkaian kecil di breadboard mini berperekat (10 menit)

Periksa rangkaian kecil yang ikut pindah, satu per satu (nilainya dari `PETA-PIN.md`):

| Rangkaian | Pin | Isinya | Yang sering salah |
| :-- | :-- | :-- | :-- |
| Pembagi ECHO HC-SR04 | D35 | 4,7 kΩ + 10 kΩ (5 V → ±3,4 V) | ECHO langsung ke pin: 5 V masuk ESP32 |
| Pembagi LDR | VP | 10 kΩ ke 3,3 V, LDR ke GND, kapasitor 100 nF ke GND | ujung atasnya di rel 5 V |
| MOSFET pompa | D25 | 220 Ω seri + 10 kΩ ke GND, dioda 1N4007 sejajar pompa | kaki G-D-S tertukar; cincin perak dioda harus di sisi 5 V |
| Pembagi RO RS-485 | RX2 | 4,7 kΩ + 10 kΩ (5 V → ±3,4 V) | RO langsung ke pin |
| LED status, buzzer | D2, D27 | 220 Ω seri | kaki pendek LED tidak ke GND |

Pompa tetap dicatu rel 5 V MB102 lewat MOSFET-nya, bukan dari pin ESP32, dengan GND bersama. Tekan breadboard mini kuat-kuat ke dasar yang bersih; tidak boleh ada kaki komponen yang saling menyentuh. Ini tetap sambungan gesek: bila suatu hari bacaan aneh, periksa di sini dulu.

<details>
<summary><b>Jalur solder (opsional, +60 menit)</b></summary>

Yang disolder hanya rangkaian kecil di tabel; MB102 tetap di breadboard mini. Keselamatan dulu (alasannya di Konsep 11): perfboard dilepas dari kotak dan tanpa listrik; **kacamata**, juga saat memotong sisa kaki; **jendela terbuka**, dan asap *flux* jangan dihirup; suhu ±325–375 °C (turunkan bila asapnya banyak), solder selalu kembali ke dudukannya, dan ujung serta batang logamnya jangan disentuh; timah bertimbal beracun (cuci tangan sesudahnya, jangan makan di meja solder), sedangkan timah bebas timbal butuh suhu lebih tinggi.

Gambar dulu susunan perfboard-mu di kertas berpetak (satu kotak = satu lubang), lalu kerjakan satu rangkaian dulu. Kaki komponen masuk dari atas; di sisi bawah, tempelkan ujung solder ke kaki dan bantalan tembaganya sekaligus, lalu sentuhkan timah ke sambungan, bukan ke ujung solder, sampai timah mengalir membungkus keduanya. Sambung titik-titiknya dengan kaki komponen yang dibengkokkan atau kawat tunggal, tanpa timah yang menjembatani dua bantalan. Uji dengan mode kontinuitas: titik yang harus tersambung **bip**, bantalan bersebelahan **diam**. Baru rangkaian berikutnya.

![Foto perfboard (Praktik 12.5, jalur solder) dari Wikimedia Commons, bukan papan penulis dan bukan rangkaian Node 1. Papan berlubang cokelat persegi panjang, difoto miring di atas selembar gambar skema. Seluruh permukaannya penuh lubang kecil berjarak sama; kaki setiap komponen dimasukkan ke satu lubang lalu disolder di sisi bawah papan, yang tidak tampak di foto. Di atas papan terpasang rangkaian kecil: sakelar tekan biru bertombol putih di kiri, beberapa resistor kecil bergaris warna, satu chip hitam kecil di tengah, serta dua potensiometer berkenop hitam bergaris kuning dan satu LED bening di kanan. Empat kabel (kuning, merah, biru tua, oranye) keluar dari bawah tepi kiri papan. Di dekatnya, potongan kawat ungu dijahitkan lewat lubang-lubang papan sehingga membentuk dua tanda silang dan satu garis pendek. Komponen hanya mengisi bagian atas dan tengah papan; bagian bawah dan ujung kirinya masih kosong.](aset/foto-perfboard.jpg)

*Foto: Retired electrician, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Revox_B215_-_bias_adjustment_add-on.jpg), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.id). Rangkaiannya bukan Node 1, hanya contoh wujud perfboard.*

Sambungan yang baik mengilap dan berbentuk gunung kecil yang membungkus kaki dan bantalannya. Sambungan dingin bisa tetap mengilap; tandanya celah gelap melingkar di pangkal kaki. Panaskan lagi sampai timahnya menyatu dengan kaki.

![Dua foto jarak dekat sambungan solder (Praktik 12.5, jalur solder) dari Wikimedia Commons, berdampingan dengan sela putih; bukan solderan penulis. Kiri, bertanda centang hijau: tiga sambungan di sisi bawah papan sirkuit hijau buatan pabrik, contoh bentuk yang baik. Setiap sambungan mengilap seperti logam, berbentuk gunung kecil yang menutup bantalan tembaga bulatnya sampai ke tepi, dan ujung kaki komponen mencuat di puncaknya: timah mengalir rapi ke kaki dan ke bantalan. Kanan, bertanda silang merah: satu sambungan dingin, kakinya tidak ikut cukup panas saat disolder. Timah menutup bantalan dan masih mengilap, tetapi di sekeliling pangkal kaki tampak celah gelap melingkar: timah tidak menyatu dengan kaki. Sambungan seperti ini bisa putus-sambung saat papan bergetar atau memanas.](aset/foto-sambungan-solder.jpg)

*Kiri: sambungan baik (MJN123, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Solderedjoint.jpg), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)). Kanan: sambungan dingin (Coronium, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cold_solder_joint2.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)). Dipotong dan disusun berdampingan; penanda oleh penulis. Gambar gabungan ini berlisensi CC BY-SA 3.0.*

Bacaan bergambar: panduan SparkFun [*How to Solder: Through-Hole Soldering*](https://learn.sparkfun.com/tutorials/how-to-solder-through-hole-soldering/all). Papanmu selalu butuh tombol **BOOT** ditahan saat diunggah lewat kabel (tahan BOOT begitu `Connecting…` muncul, lepaskan saat `Writing at …` mulai berjalan)? Obat permanennya kapasitor elektrolit 10 µF yang disolder ke pin EN (kaki +) dan GND (kaki −) DevKit ([🔬 Modul 2](../../fase-0-fondasi/modul-02-listrik-dan-unggah-pertama/README.md#-bedah-teknis-opsional), lipatan *Apa yang dilakukan esptool…*). Pasang perfboard di samping breadboard mini; sisi solderannya tidak boleh menyentuh kabel atau logam. Lalu ulangi uji 12.4.

</details>

#### 12.6 ⭐ Catu daya Modul 9 di kotak: dua kabel berlabel dan GND bersama (10 menit)

Susunan [➕ A Modul 9](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md#a-node-1-permanen-dari-adaptor-lalu-uji-24-jam) masuk kotak apa adanya, dan kabel ESP32 kembali ke *charger*, bukan laptop:

1. Kabel **ESP32** (*charger* HP 5 V, minimal 1 A, ke USB DevKit) dan kabel **MB102** (adaptor 5 V 2 A untuk beban) masuk lewat lubang dayanya. Kepala *charger* dan adaptor tetap di stopkontak **di luar** kotak.
2. Label **ESP32** dan **MB102** dari Modul 9 diperbarui di kedua ujung setiap kabel.
3. Colokan DC dan regulator papan ekspansi **tidak dipakai**, dan rel 5 V MB102 tidak pernah ke terminal `VIN` atau `3V3` (aturan emas nomor 4).
4. Kabel kurang panjang? Dekatkan kotaknya ke stopkontak: kabel USB yang lebih panjang dan tipis termasuk penyebab `BROWNOUT` ([🚨](#-kalau-tidak-jalan) *`BROWNOUT` sesudah Node 1 pindah ke kotak*).

Tanpa 220 V, tanpa kecuali: tidak ada modul AC-DC, kabel PLN, atau stopkontak di dalam kotak, dan relay hanya untuk beban 5 V proyek ini.

**Kamu lulus langkah ⭐ ini** kalau kedua kabel daya berlabel di kedua ujungnya, kepala *charger* dan adaptornya di luar kotak, colokan DC papan ekspansi kosong, dan GND papan ekspansi tersambung ke GND MB102.

#### 12.7 ⭐ Multimeter sebelum daya masuk: polaritas dan hubung singkat (5 menit)

Kedua kabel daya tercabut, semua kelompok terpasang. Putar multimeter ke mode kontinuitas (simbol **•)))**; tanpa mode bip, pakai **Ω 200**: angka mendekati 0 berarti tersambung), lalu periksa:

| *Probe* di | dan di | Harus |
| :-- | :-- | :-- |
| rel 5 V, rel 3,3 V | rel GND | **diam** (bip sekejap lalu diam: kapasitor sedang terisi) |
| rel 5 V | terminal `3V3` dan `VIN` | **diam** |
| terminal GND | rel GND MB102 dan GND rel 3,3 V | **bip**: GND bersama |
| rel 5 V | `VCC` atau kabel merah relay, servo, PIR, HC-SR04, pompa, MAX485 | **bip**: polaritas benar |
| rel 3,3 V | `VCC` DHT22, sensor tanah, OLED, ujung atas pembagi LDR | **bip** |

Bip terus di dua baris pertama berarti hubung singkat atau kabel salah rel: jangan nyalakan; cari kabel atau kaki yang menjembatani.

**Kamu lulus langkah ⭐ ini** kalau kelima baris sesuai kolom **Harus**.

#### 12.8 ⭐ Uji tarik pelan dan penahan tarikan (3 menit)

Tarik pelan setiap kabel di terminal sekrup dan di breadboard mini, satu per satu: kabel yang benar tidak bergeser. Yang bergeser atau lepas: kupas ulang, kencangkan lagi; ujung serabut yang mekar diganti kabel tunggal atau diberi *ferrule*. Lalu pasang **penahan tarikan** (*strain relief*): ikat setiap kabel yang keluar-masuk kotak dengan pengikat kabel tepat di sisi dalam lubangnya, cukup kencang sehingga ikatannya tidak bisa lolos keluar lubang. Tarik kabelnya dari luar: terminal di dalam tidak ikut bergerak.

![Foto terminal sekrup dan ferrule (Praktik 12.8) dari Wikimedia Commons, bukan barang penulis, di atas latar putih. Kiri atas: deretan terminal sekrup putih, jenis penyambung kabel lampu yang lebih besar dari terminal di papan ekspansi; setiap lubang kabel punya sekrup penjepit di atasnya. Dua terminal lepas di kiri memperlihatkan pelat logam penjepit di dalam lubangnya. Kabel cokelat muda masuk dari depan ke salah satu terminal, dan dari belakang masuk kabel cokelat tua yang ujungnya memakai ferrule abu-abu. Kanan: kabel serabut hijau-kuning yang ujungnya sudah ditutup ferrule, selongsong logam berleher plastik abu-abu yang dijepit (crimp) sehingga serabut tembaganya tidak bisa mekar. Bawah: kabel hijau-kuning berinti satu kawat tembaga padat, cukup dikupas tanpa ferrule. Warna kabel di foto mengikuti kabel listrik rumah, tetapi di kotak proyek kita hanya ada kabel 5 V, tanpa 220 V.](aset/foto-terminal-ferrule.jpg)

*Foto: Simon A. Eugster, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Screw_terminal_with_crimped_wire.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Terminal di foto jenis penyambung kabel lampu; kabelnya berwarna kabel listrik rumah, sedangkan di kotakmu hanya kabel 5 V.*

**Kamu lulus langkah ⭐ ini** kalau semua kabel lolos uji tarik pelan, dan setiap kabel yang keluar-masuk kotak tertahan pengikat di sisi dalam lubangnya.

#### 12.9 ⭐ K1 a–d: label, tutup kotak, lalu Node 1 `Online` lagi (5 menit)

Tempel label di tutup kotak, misalnya (nilainya milikmu):

```text
Node 1 · <nama di Armada> · device_id <device_id> · firmware 1.7.1, dipasang <tanggal>
Daya 5 V saja: kabel ESP32 = charger 5 V min. 1 A ke USB papan; kabel MB102 = adaptor 5 V 2 A
Kabel merah 5 V, oranye 3,3 V, hitam GND · tahan D13 saat menyala = portal WiFi · sandi portal <sandi-portal>
```

`device_id` dan versinya disalin dari kartu Node 1; sandi portalnya `SANDI_PORTAL` dari [5.2](#52--portal-bersandi-sandi_portal-di-kuncih-3-menit) (risikonya di Konsep 11). Sandi WiFi rumah, kunci perangkat, dan kode klaim tidak pernah ditulis di label. Potret isi kotak dari atas untuk catatan belajar, pasang tutupnya tanpa menjepit kabel, lalu nyalakan: kabel ESP32 dulu, baru MB102.

Yang kamu lihat: kartu Node 1 kembali `Online`, Telegram mengabarkan `✅ <device_id> online lagi (offline <n> menit)`, dan sesudah halaman dimuat ulang, **Menyala ulang karena** terisi lagi, menurut kode `POWERON` (listrik baru masuk; papan belum dilihat penulis).

**Kamu lulus langkah ⭐ ini** (bukti **K1 a–d**; fotonya di 13.1) kalau label lengkap tertempel, tutup terpasang, Node 1 hanya dicatu *charger* dan adaptor Modul 9 di luar kotak, dan kartu Node 1 `Online` dengan **Menyala ulang karena** terisi.

> ⬆️ **Selesai Praktik 12?** Biarkan Node 1 menyala 24 jam di kotak, lalu kerjakan [Praktik 13](#praktik-13--24-jam-di-kotak-dan-foto-sesudah-10-menit-ditambah-24-jam-menunggu-butuh-papan). Sambil menunggu, kerjakan [➕ A](#a-cocokkan-proyekmu-akar-edge-skrip-backend-150-frontend-140-dan-firmware) sampai [➕ E](#e--gabungkan-fiturarmada-ke-main-lewat-pull-request-armada-ota-rollback-klaim-dan-kotak).

### Praktik 13 — 24 jam di kotak dan foto "sesudah" (10 menit, ditambah 24 jam menunggu; butuh papan)

> 🖥️ **Alat yang dipakai:** **HP** atau kamera (13.1); **Chrome**, layar **Armada** sebagai admin (13.2, 13.3). Konsep yang dipakai: 9, 11.
>
> ⭐ **Wajib untuk jalur ber-Kit** — langkah 13.1 dan 13.2: foto "sesudah" dari sudut dan jarak yang sama dengan foto "sebelum", dan Node 1 menyala 24 jam di kotak tanpa `BROWNOUT`, `PANIC`, atau `WDT` (bukti **K1 e**).

> [!NOTE]
> **Belum dijalankan penulis.** Uji 24 jam ini milikmu; teks kartu di bawah = teks dari kode dashboard.

#### 13.1 ⭐ Foto "sesudah" dari sudut dan jarak yang sama (3 menit)

Potret kotak dari atas dengan sudut dan jarak yang kamu catat di [🔁 Langkah 5](#langkah-5--foto-sebelum-node-1-dari-atas), lalu taruh berdampingan dengan foto "sebelum" di catatan belajar ([➕ F](#f-simpan-catatan-belajar-bukti-o0-sampai-p1-foto-sebelumsesudah-dan-angka-papanmu)). Potong fotonya sampai kotak saja dan tutupi sandi portal di label; foto yang memperlihatkan isi rumah tidak masuk Git.

**Kamu lulus langkah ⭐ ini** kalau dua foto dari sudut yang sama berdampingan di catatan belajarmu, tanpa sandi portal yang terbaca.

#### 13.2 ⭐ K1 e: 24 jam menyala tanpa `BROWNOUT`, `PANIC`, atau `WDT` (5 menit)

Biarkan Node 1 bekerja 24 jam sejak 12.9: jangan memperbaruinya dan jangan mencabut kabelnya. Sesudahnya, muat ulang **Armada** (kesehatan kartu tidak *live*). Kartu Node 1 harus menulis **Lama menyala** `1 hari …` (`1 hari 0 jam` = baru lewat 24 jam) dan **Menyala ulang karena** selain `BROWNOUT`, `PANIC`, atau `WDT`, dengan kalimat `Kesehatan dari vitals terakhir, …` berjam baru (jedanya masih 60 detik sejak 11.1). Uji 24 jam di kotak belum dijalankan penulis: hasilmu (**Lama menyala** dan `reset_reason`) adalah hasil pertamanya; catat di ➕ F.

Silabus v1.0.30 menambahkan uji 24 jam ini ke syarat kotak (**K1 e**): catu daya yang kurang sering baru ketahuan sesudah berjam-jam. Janji [🔬 Modul 5](../../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#-bedah-teknis-opsional) bahwa *brownout* diam-diam akan ketahuan kini dibuktikan kartu [Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason) dari jauh, seperti uji 24 jam Modul 9. Gagal? `BROWNOUT` = catu daya: kabel daya, adaptor, GND bersama ([🚨](#-kalau-tidak-jalan) *`BROWNOUT` sesudah Node 1 pindah ke kotak*); **Lama menyala** kurang dari 24 jam dengan `POWERON` = listrik sempat padam atau kabel tersenggol; `PANIC` atau `WDT` = firmware (Konsep 9); `SW` = sempat diperbarui atau di-*restart*. Perbaiki penyebabnya, lalu ulangi 24 jam.

**Kamu lulus langkah ⭐ ini** (bukti **K1 e**) kalau sesudah 24 jam kartu Node 1 menulis **Lama menyala** minimal `1 hari 0 jam` dan **Menyala ulang karena** bukan `BROWNOUT`, `PANIC`, atau `WDT`.

#### 13.3 Jeda `vitals` kembali 300 detik (opsional, 2 menit)

Jeda 60 detik hanya untuk uji ini. Ulangi [11.1](#111--jeda-vitals-60-detik-lewat-pengaturan-lain-5-menit) dengan `300`: kartu Node 1 lalu menulis `vitals dikirim setiap 300 detik (diatur admin)` (teks dari kode).

> ⬆️ **Selesai Praktik 13?** Lanjut ke [➕ F](#f-simpan-catatan-belajar-bukti-o0-sampai-p1-foto-sebelumsesudah-dan-angka-papanmu): catatan belajar dengan foto sebelum–sesudah. [🧩 Tantangan](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip masalahmu (Compose dan VPS: [🚨 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#-kalau-tidak-jalan); akun dan ACL broker: [🚨 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-kalau-tidak-jalan)). Lirik dulu `docker compose logs <layanan>` di mesin yang bermasalah (gerbang: folder `edge` di Pi), **Riwayat pembaruan** di **Armada**, atau Serial Monitor papan. Teks server dikutip dari lab penulis (perangkat = simulator; VPS, internet, dan CA tiruan); teks papan = teks dari kode, belum direkam penulis di papan. Bertanya di forum atau ke AI? Tempel log saja, tanpa `.env`, kunci, kode klaim, atau berkas `.bin`.

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (Arduino-ESP32 3.3.12, WiFiManager 2.0.17, Mosquitto 2.1.2 <i>dynamic security</i>)</b></summary>

| Petunjuk lama | Yang benar untuk versi kita | Kenapa |
| :--- | :--- | :--- |
| `ESPhttpUpdate`, `ESP8266httpUpdate` | `HTTPUpdate`: `httpUpdate.update(klien, url, versi)` | milik ESP8266 |
| `Update.h` tanpa sidik jari | `httpUpdate.setSHA256sum(…)` | baru di 3.3.12 (Konsep 6) |
| `setInsecure()` | `useBuiltinCACertBundle()` | kartu identitas server tidak diperiksa |
| contoh resmi `httpUpdateSecure.ino` | daftar akar bawaan | sertifikat perantara Let's Encrypt Authority X3-nya kedaluwarsa 17 Mar 2021 |
| "aktifkan *rollback* di menuconfig" | sudah aktif; cukup `extern "C" bool verifyRollbackLater()` | Konsep 4 |
| `esp_ota_get_app_description()` | `esp_app_get_description()`; versi kita `VERSI_FIRMWARE` | usang; bukan versi sketsa |
| `ESP.getEfuseMac()` | `esp_read_mac(…, ESP_MAC_WIFI_STA)` | baitnya terbalik bila dicetak sebagai angka |
| WiFiManager 0.x | 2.0.17 + `WiFiManagerParameter` | API lama |
| (Async)ElegantOTA | tarik dari server rumah | dorong, bukan tarik (KC) |
| skema Default 4MB | Minimal SPIFFS + DIO | rak 1.310.720 byte terlalu kecil |
| WiFiProv `NETWORK_PROV_SECURITY_0` | keamanan eksplisit (🔬) | tanpa keamanan |
| Arduino-ESP32 4.0.0-RC1 | 3.3.12 | pra-rilis, belum diuji |
| semua akun ke *dynamic security* | akun layanan di berkas sandi, akun perangkat di *dynamic security* | Konsep 8 |

</details>

**Server, Compose, dan broker**

<details>
<summary><b><code>MOSQUITTO_DYNSEC_PASSWORD</code> kosong (<code>config</code> berhenti) atau kurang dari 12 huruf</b></summary>

Baris sandi plugin belum ada atau kosong: `… is missing a value: isi MOSQUITTO_DYNSEC_PASSWORD di .env (acak, minimal 12 huruf)` (gerbang: `… di edge/.env …`). Buat sandi acak dengan perintah 2.3, berbeda untuk pusat dan gerbang. Kurang dari 12 huruf lolos `config`, tetapi broker menulis `Error: Not generating dynsec config, MOSQUITTO_DYNSEC_PASSWORD must be at least 12 characters.` (lab kode penulis, sandi kosong) dan buku akun tidak dibuat. Betulkan, lalu `docker compose up -d --force-recreate mosquitto` sampai log menulis `Using admin password from MOSQUITTO_DYNSEC_PASSWORD environment variable`.

</details>

<details>
<summary><b>Backend lama menolak <code>vitals</code> firmware 1.7.0: <code>Kunci tidak dikenali</code></b></summary>

Lab penulis, backend 1.4.0 dengan Node 1 tiruan 1.7.0: `WARN: DITOLAK rpm/<device_id>/vitals: isi: Kunci tidak dikenali s: "reset_reason", "fw"`. Server selalu lebih dulu: backend 1.5.0 + migrasi 011 (Praktik 2), baru firmware 1.7.0; kolom IMAGE `docker compose ps backend` harus `…:1.5.0`. Belum bisa? Kembalikan Node 1 ke 1.6.0 lewat kabel. Pemeriksa kontrak 5.5 berhenti `Sambungan … putus: …`? Isi `PENGGUNA_PEMERIKSA` di `alat/.env`.

</details>

<details>
<summary><b><code>ALAMAT_SERVER belum diisi di .env</code>: tombol Perbarui tidak bisa dipakai</b></summary>

Kartu menulis `ALAMAT_SERVER di .env server belum diisi: …` (teks dari kode). Lab penulis: Bruno `perbarui Node 1` dijawab `503 {"pesan":"ALAMAT_SERVER belum diisi di .env: perangkat tidak tahu dari mana mengunduh firmware"}`, log backend `pembaruan firmware lewat udara MATI: ALAMAT_SERVER belum diisi`. Isi menurut kolom tempatmu (2.3), lalu `docker compose up -d backend` sampai muncul `alamat unduh firmware untuk perangkat: …`. Bentuknya salah (`/` di akhir, `http://` ke nama internet)? Backend menolak menyala; alasannya di `docker compose logs migrasi backend`.

</details>

<details>
<summary><b>Daftar atau klaim perangkat dijawab <code>503</code>: gerbang belum naik, jembatan belum tersambung, atau ACL <code>backend</code> kurang</b></summary>

Lab penulis, sesudah ±6 detik (dua percobaan): `belum tersimpan di database (database atau broker gerbang pi1 bermasalah: broker gerbang pi1 tidak menjawab setDefaultACLAccess dalam 3 detik). …`. Database tidak berubah, kode klaim tidak hangus. Periksa urut:

1. Log gerbang memuat `Plugin dynamic-security loaded.` (3.1); sebelum Praktik 3 selesai, `503` ini wajar.
2. Dua baris *remap* ada di `edge/jembatan/pusat.conf`, nama `pi1` sama di `AKUN_BROKER_OTOMATIS` dan ACL `jembatan-pi`, dan jembatan tersambung.
3. Blok `backend` `acl-broker` pusat memuat empat baris topik kontrol (2.3), lalu broker di-*restart*. Lab penulis, tanpa keempatnya: `503` yang sama, dan log broker diam.

Tanpa Pi (kalimatnya menyebut `broker pusat`): plugin pusat (2.4) dan butir 3. Lalu ulangi langkahnya.

</details>

<details>
<summary><b><code>503</code> <code>belum tersimpan di database</code>, padahal broker sudah berubah</b></summary>

Kalimatnya berlanjut: `… Perintah ke broker yang sempat terkirim bisa tetap dikerjakan begitu sambungannya pulih: ulangi langkah ini sebentar lagi supaya database dan broker sama lagi`. Jembatan yang tersendat menahan perintah akun, lalu gerbang mengerjakannya begitu tersambung. Lab penulis, **Nonaktifkan** saat internet rumah dicabut: `503` sesudah 6,1 detik, lalu gerbang tetap menjalankan `deleteClient`, padahal database masih `online`. Obatnya: ulangi langkah yang sama sesudah gerbang terjangkau (lab: `200` dengan `"akun_broker": "tidak-ada"`, 11.4).

</details>

<details>
<summary><b>Gerbang baru berhenti dengan <code>Unable to open pwfile</code></b></summary>

Lab kode penulis, gerbang pertama kali: `password-file: Error: Unable to open pwfile "/mosquitto/data/sandi-broker".`. Gerbang baru (Pi baru, atau lemari `rumahpintar-gerbang_data-broker` hilang) tetap butuh berkas sandi untuk akun layanan. Di Pi, folder `edge`, buat akun pertama (sandi diketik dua kali), lalu akun layanan lain seperti Modul 27:

```text
docker compose run --rm --no-deps -u mosquitto mosquitto mosquitto_passwd -c /mosquitto/data/sandi-broker pemantau
```

Akun perangkat dipulihkan dari cadangan 3.5 (resep di kepala skrip).

</details>

<details>
<summary><b>Perangkat yang dinonaktifkan masih masuk, atau kunci lama Modul 21 hidup lagi</b></summary>

Baris lamanya masih di berkas sandi broker. Selama akun *dynamic security*-nya ada, kunci lama ditolak; begitu **Nonaktifkan** menghapus akun itu, broker memakai baris lama lagi. Lab penulis, perangkat tiruan berakun Modul 21: jawaban **Nonaktifkan** memuat `… sebelum itu perangkat tetap diterima broker`, dan perangkatnya `online` lagi dengan kunci lama; sesudah `mosquitto_passwd -D` dan `restart`: `not authorised`. Kerjakan 3.4 langkah 3–4 untuk setiap akun lama, di gerbang dan pusat.

</details>

<details>
<summary><b>Jalur gratis: <code>Pintu ini hanya untuk perangkat …</code> di IP Pi, atau <code>PINTU_WEB_DALAM</code> kosong</b></summary>

`http://192.168.1.37` di browser dijawab `Pintu ini hanya untuk perangkat (unduhan firmware dan klaim). …` (`404`, lab penulis): **benar**. Yang salah kebalikannya: `docker compose ps web` di Pi menulis `192.168.1.37:80->80/tcp`, bukan `->8081/tcp`, dan IP Pi membuka dashboard. Itu `PINTU_WEB_DALAM` kosong: pintu 80 memercayai `X-Forwarded-For` yang bisa ditulis siapa pun di WiFi rumah sehingga batas laju klaim bisa diakali (lab kode penulis: 12 percobaan tanpa `429`). Tulis `PINTU_WEB_DALAM=8081` di `.env` Pi, lalu `docker compose up -d web`.

</details>

<details>
<summary><b>Berkas firmware hilang dari lemari <code>data-firmware</code></b></summary>

Lemarinya hilang (`docker compose down -v`, mesin pusat baru), rilisnya masih di database. Riwayat menulis `gagal` `… (-102 HTTP_UE_SERVER_FILE_NOT_FOUND)`, dan log backend (lab penulis):

```text
ERROR: firmware node1 1.7.1 ada di database, tetapi berkasnya hilang dari lemari data-firmware: unggah lagi berkas yang sama
```

Unggah lagi berkas `.bin` dan versi yang **sama** (`200`, dipulihkan), atau salin dari cadangan 3.5 lalu `docker compose exec -u root backend chown -R node:node /app/data-firmware`. Berkas aslinya ikut hilang? Ekspor ulang memberi sidik lain (`409`): tarik rilisnya, lalu unggah versi baru.

</details>

**Unggah firmware**

<details>
<summary><b><code>409</code> <code>versi tidak boleh ditimpa</code>, atau versi <code>1.07.1</code> ditolak</b></summary>

Lab penulis: `node1 1.7.1 sudah ada: versi tidak boleh ditimpa. …`. Satu nomor versi hanya untuk satu isi, juga sesudah rilisnya ditarik (Konsep 5): naikkan `VERSI_FIRMWARE` (6.1), ekspor ulang, unggah. Formulir menolak bentuk yang salah (teks dari kode): `Versi harus berbentuk x.y.z, misalnya 1.7.1 (sama dengan VERSI_FIRMWARE).` dan `Versi tanpa nol di depan: 1.7.1, bukan 1.07.1.`; lewat Bruno atau `curl`, server menjawab `400` `FST_ERR_VALIDATION`.

</details>

<details>
<summary><b>Unggah ditolak: bait pertama bukan <code>0xE9</code>, atau berkas lebih besar dari rak</b></summary>

Teks formulirnya di tabel 6.4. Lewat Bruno atau `curl` (lab penulis): `400 {"pesan":"bukan citra aplikasi ESP32: bait pertama harus 0xE9. Unggah <sketsa>.ino.bin dari folder build, bukan .merged.bin atau .bootloader.bin"}`, `400 {"pesan":"terlalu besar: 1966081 byte, satu rak program hanya 1966080 byte"}`, dan `.merged.bin` 4 MB `413` `FST_ERR_CTP_BODY_TOO_LARGE`. Pilih `node-1-rumah.ino.bin` di `build/esp32.esp32.esp32/` (6.3).

</details>

<details>
<summary><b><code>.bootloader.bin</code> lolos server lewat Bruno atau <code>curl</code>, tetapi gagal di papan</b></summary>

Formulir **Armada** menolaknya dari nama berkas; server hanya memeriksa bait pertama dan ukuran. `.bootloader.bin` juga diawali `0xE9`, jadi lewat API diterima (lab penulis: `201`, 23.488 byte). Ia bukan program aplikasi; akibatnya di papan belum diuji penulis (*rollback* kemungkinan menyelamatkan). Unggah hanya lewat formulir. Telanjur? Jangan kirimkan: tarik rilisnya, lalu unggah `node-1-rumah.ino.bin` dengan versi baru.

</details>

<details>
<summary><b>Unggah dijawab <code>403</code> (akun <i>viewer</i>) atau <code>401</code> (sesi habis)</b></summary>

Lab penulis lewat API: `403 {"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}` dan `401 {"pesan":"belum login atau sesi sudah habis: login lewat POST /auth/login"}`. Akun *viewer* memang tanpa formulir unggah (4.4): masuk sebagai admin (Bruno: **`login admin`** dulu). Sesi habis: masuk lagi, lalu ulangi.

</details>

**Perintah `update` dan jawaban perangkat**

<details>
<summary><b><code>409</code> saat menekan Perbarui: <i>canary</i>, rilis uji, <code>offline-mode</code>, atau perangkat nonaktif</b></summary>

Alasannya di kotak merah (teks dari lab penulis dan kode):

- `belum ada perangkat canary: centang Canary di kartu perangkat di layar Armada dulu` (7.2), atau `belum ada perangkat canary yang berhasil memakai 1.7.1: perbarui canary dulu`.
- `1.7.2 rilis UJI: hanya lewat Perbarui per perangkat, …`: memang begitu.
- `perangkat sedang offline-mode: perintah update hanya dikirim ke perangkat online (tidak diantre)`: tunggu `Online`.
- `perangkat sudah dinonaktifkan (kuncinya dicabut)`: klaim ulang (11.5).
- `turun versi (… ke …): kirim dengan paksa bila memang sengaja`: centang **Izinkan turun versi (bila versi tujuan lebih lama)**.
- `<n> perangkat canary gagal atau rollback memakai <versi>: periksa dulu, jangan disebarkan`: versi itu terkunci selamanya, dan kartu tetap `perlu diperbarui` sampai rilisnya **ditarik**. Tanpa tombol: di Bruno, *clone* `tarik rilis uji`, ganti versi di URL-nya, kirim, lalu unggah perbaikannya dengan versi baru.

</details>

<details>
<summary><b><code>422 perangkat menolak: aksi update belum didukung (Modul 28)</code> atau <code>alamat server belum diisi</code></b></summary>

Papan menjawab `ack` `ok:false`, server meneruskannya sebagai `422`. `aksi update belum didukung (Modul 28)` = papan masih 1.6.0, yang tidak bisa diperbarui dari server: pasang 1.7.0 lewat kabel (Praktik 5). `alamat server belum diisi (Serial: server <alamat>)` = ketik `server <alamat>` di Serial Monitor (5.4), sama persis dengan `ALAMAT_SERVER`; papan hasil klaim mendapatnya dari portal.

</details>

<details>
<summary><b>Perangkat menjawab <code>ok:false</code>: <code>url bukan server rumah ini</code>, <code>http hanya untuk jaringan rumah</code>, dan alasan lain</b></summary>

Tampil sebagai `422 perangkat menolak: <alasan>` dan riwayat `ditolak`; kunci perangkat tidak terkirim (teks dari kode):

| Alasan | Artinya → obat |
| :-- | :-- |
| `url bukan server rumah ini` | `ALAMAT_SERVER` beda dengan alamat tersimpan di papan, walau satu huruf (`http` lawan `https`, nama lawan IP) → samakan (Serial `server <alamat>`, atau `.env`) |
| `http hanya untuk jaringan rumah` | `http://` ke nama internet → `https://iot.namaanda.my.id` |
| `versi di bawah 1.7.0 tidak punya rollback: pasang lewat kabel` | turun ke 1.6.0 hanya lewat kabel |
| `masih dalam masa uji 60 detik` | tunggu `berhasil` |
| `pembaruan lain sedang berjalan`, `Node 1 sedang berhenti sengaja: kirim lagi sesudah online` | tunggu `Online` |
| `sudah memakai 1.7.1` | sudah terpasang |

</details>

<details>
<summary><b>Pembaruan <code>belum menjawab dalam 5 detik</code></b></summary>

Status `tanpa-ack`: perintah terkirim, tetapi `ack` tidak tiba dalam 5 detik; *toast*-nya (teks dari kode) `<nama>: perintah terkirim, tetapi perangkat belum menjawab dalam 5 detik. Hasilnya menyusul bila perangkat melapor.` Biasanya jembatan atau WiFi tersendat; papan bisa tetap mengerjakannya. Jangan kirim ulang: tunggu hasil di kartu, atau `kedaluwarsa` sesudah 10 menit. Belum direkam penulis.

</details>

**Unduhan `gagal`**

<details>
<summary><b>Riwayat <code>gagal</code> dengan kode <code>-100</code> sampai <code>-106</code> atau <code>304</code>: kode, sebab, dan obat</b></summary>

Kalimat lengkapnya di [Konsep 3](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji). Firmware lama tetap jalan di semua baris ini.

| Kode | Sebab yang paling mungkin | Obat |
| :-- | :-- | :-- |
| `-100` | berkas tidak muat di rak sebelah | `node-1-rumah.ino.bin` (6.3) |
| `-101` | jawaban dimampatkan atau dipotong-potong: bukan dari Caddyfile 2.3 (lab penulis) | `ALAMAT_SERVER` langsung ke Caddy-mu |
| `-102` | rilis ditarik, atau berkas hilang dari lemari | lipatan *Berkas firmware hilang …* |
| `-103` | kunci papan beda dengan di server, atau perangkat dinonaktifkan | ganti kunci (3.4) atau klaim ulang |
| `-104` | `429`: lebih dari 120 unduhan per menit dari satu IP, atau `503`: database bermasalah | armada besar: bertahap; log backend |
| `-106` | `/fw` dijawab halaman dashboard (lab penulis, web 1.3.0: `<!doctype html>`), atau bait pertama terlambat lewat `http://` | `up -d --build web` (4.1); ulangi |
| `304` | versi di perintah = versi yang berjalan | pengaman kedua; tidak perlu apa-apa |

</details>

<details>
<summary><b>Unduhan terhenti: <code>-11</code>, <code>Update 6 UPDATE_ERROR_STREAM</code>, atau <code>menyala ulang saat mengunduh (WDT)</code></b></summary>

Soal jalan antara papan dan server, bukan berkasnya. `-11`: server diam 8 detik **sebelum** menjawab (mesin pusat sibuk). `Update 6`: lewat `https://`, data berhenti di **tengah** berkas 30 detik; papan tidak menyala ulang. `menyala ulang saat mengunduh (WDT)`: lewat `http://`, *watchdog* 60 detik me-*restart* papan, yang menyala lagi dengan rak lama. Periksa **Sinyal WiFi** di kartu, router, dan server, lalu **Perbarui** lagi. `padam saat mengunduh` = listrik putus (9.4). Teks dari kode; di papan belum diukur penulis.

</details>

<details>
<summary><b><code>SHA-256 tidak cocok dengan perintah (Update 15 UPDATE_ERROR_SHA256)</code></b></summary>

Isi berkas yang tiba berbeda dengan sidik di perintah, walau satu bait: berkas di lemari berubah sesudah diunggah, atau rusak di jalan. Papan membuangnya sebelum catatan rak berganti: firmware lama tetap jalan tanpa menyala ulang (dari kode; lab penulis: simulator, 8.5). Jangan menyentuh isi lemari `data-firmware`: tarik rilis itu dan unggah versi baru.

</details>

<details>
<summary><b><code>tidak tersambung ke server (-1)</code>: alamat server atau sertifikat</b></summary>

Papan tidak sampai ke server: alamat tersimpan salah ketik (Serial `server`), server mati, *firewall* laptop menutup port 80 (tanpa Pi), `ALAMAT_WEB` Pi masih `127.0.0.1` (jalur gratis), atau sertifikat HTTPS ditolak; rinciannya sesudah titik dua (teks dari kode). Jalur utama memakai nama, bukan IP VPS: sertifikat hanya untuk `iot.namaanda.my.id`. Uji dari laptop di WiFi yang sama dengan `curl --http1.0 -sI` seperti 7.6: tanpa kunci pun harus dijawab `403`, bukan galat sambungan.

</details>

**Masa uji dan *rollback***

<details>
<summary><b><i>Rollback</i> tidak pernah terjadi: firmware yang salah tetap dipakai</b></summary>

Rilis uji 1.7.2 terpasang, Node 1 tidak `Online` lagi, dan riwayatnya `kedaluwarsa` sesudah 10 menit. Paling mungkin baris `extern "C" bool verifyRollbackLater()` di `masa-uji.cpp` hilang atau diubah: tanpa `extern "C"`, kompilasi tetap berhasil tanpa peringatan, tetapi fungsi kita tidak masuk firmware: bawaan `false` yang dipakai (hasil kompilasi penulis; cara memeriksa di 🔬 *Name mangling …*). Papan itu kini butuh kabel: kembalikan barisnya (5.1), **Upload** 1.7.1 seperti 5.3 (macet di `Connecting…`? Tahan **BOOT** begitu tulisan itu muncul, lepaskan saat `Writing at …` mulai berjalan), lalu ulangi Praktik 8 dengan versi uji baru, bukan 1.7.2. Rilis uji justru `berhasil`? `UJI_KUNCI_SALAH` masih `0` saat ekspor 8.1.

</details>

<details>
<summary><b>Firmware yang baik ikut kembali ke versi lama: router, Pi, atau listrik padam di 60 detik pertama</b></summary>

Bukti sah hanya satu: dalam 60 detik kunci diterima broker, lalu `online` dan langganan `cmd` terkirim. Firmware yang benar pun batal bila router atau Pi mati selama itu, Node 1 padam atau menyala ulang (laporan `padam di tengah masa uji` atau `menyala ulang di tengah masa uji (…)`, teks dari kode), atau `setup()` macet lebih dari 75 detik. Aman: Node 1 kembali ke versi sebelumnya. Ulangi **Perbarui** saat jaringan dan listrik stabil; *canary* yang pernah `rollback` mengunci **Perbarui semua** untuk versi itu (lipatan `409`).

</details>

<details>
<summary><b>Sesudah Upload lewat kabel, papan kembali ke rak <code>app0</code></b></summary>

Wajar: unggahan kabel menulis ulang catatan rak "nyalakan `app0`", keadaan `UNDEFINED`, tanpa masa uji (Konsep 2). Serial `ota` (teks dari kode): `ota: rak berjalan app0 (UNDEFINED, dipasang lewat kabel); rak sebelah app1, 1966080 byte`. Versi kartu tetap benar (dari `fw`); NVS (WiFi, kunci, alamat server) tetap selama **Erase All Flash Before Sketch Upload** **Disabled**.

</details>

<details>
<summary><b>Laporan <code>berhasil</code> atau <code>rollback</code> tidak muncul, atau <code>VERSI_FIRMWARE lupa dinaikkan?</code></b></summary>

Laporan ikut paling banyak 3 `vitals`, yang bisa hilang. Hilang semua, server menyimpulkan dari `vitals` berikutnya (`disimpulkan server: menyala dengan versi baru tanpa laporan`, atau `… tanpa laporan (bisa rollback)`); laporan papan yang datang belakangan menimpanya. Tanpa kabar sama sekali: `kedaluwarsa` sesudah 10 menit. `fw 1.7.0, bukan 1.7.1: VERSI_FIRMWARE lupa dinaikkan?` (teks dari kode) = rilis 1.7.1 berisi program 1.7.0 karena 6.1 terlewat: tarik rilisnya, lalu ulangi 6.1–6.4 dengan versi baru.

</details>

**Portal dan kode klaim**

<details>
<summary><b>Portal tanpa kolom Kode klaim, atau portal tidak terbuka selama masa uji</b></summary>

Kolom **Kode klaim**, **Alamat server**, dan **Alamat broker** baru ada di 1.7.0: Serial harus menulis `firmware 1.7.0` (10.2). Portal tidak muncul? Papan masih menyimpan WiFi: Serial `wifi lupa`. HP ditolak `Node1-Rumah`: sandinya `SANDI_PORTAL` (5.2, label kotak). Tepat sesudah pembaruan lewat udara, portal sengaja ditunda (teks dari kode): `Masa uji firmware baru: portal WiFi DITUNDA. Buka lagi sesudah masa uji (tahan D13, tekan EN).`

</details>

<details>
<summary><b>Klaim ditolak: <code>403</code>, <code>409</code>, <code>429</code>, atau <code>503</code></b></summary>

Serial menulis `Klaim DITOLAK <kode>: <pesan>` (10.5), lalu petunjuknya (teks dari kode): `403` `Kode salah, kedaluwarsa, atau sudah dipakai: minta kode baru ke admin (/armada, Buat kode klaim).`; `409` `Perangkat ini masih terdaftar dan aktif: nonaktifkan dulu di /armada, lalu klaim lagi dengan kode baru.`; `429` `Terlalu banyak percobaan: tunggu 1 menit, lalu ketik klaim <kode> lagi.`. `503` (gerbang atau database tak terjangkau): `pendaftaran gagal sementara (database atau broker): kode belum terpakai, coba lagi`, lalu `Klaim dicoba lagi 30 detik lagi.`, paling banyak 3 kali kirim; kodenya tidak hangus (lab penulis, simulator).

</details>

<details>
<summary><b>Serial: <code>Klaim GAGAL</code>, <code>alamat server belum diisi</code>, atau <code>Alamat server paling panjang 64 huruf</code></b></summary>

Teks dari kode. `Klaim GAGAL: server <alamat> tidak terjangkau (…)` = sebab-sebab lipatan `-1`; jalur gratis memakai `http://192.168.1.37`, tanpa `:8081`. `alamat server belum diisi: ketik klaim <kode> <alamat server>, atau server <alamat> dulu` = klaim lewat Serial tanpa alamat. `Portal: alamat server TIDAK disimpan. Alamat server paling panjang 64 huruf` (atau `http hanya untuk jaringan rumah …`) = bentuknya salah: tanpa `/` di akhir, `http://` hanya ke IP rumah, sama persis dengan `ALAMAT_SERVER`.

</details>

<details>
<summary><b>Klaim perangkat tiruan ke backend mode kembang dijawab <code>401</code></b></summary>

Klaim masuk lewat Caddy dengan awalan `/api`. Backend mode kembang (`npm run dev`) tidak punya awalan itu dan menjawab `401 belum login…` (README alat): arahkan simulator mode klaim ke alamat Caddy, sama dengan `ALAMAT_SERVER`.

</details>

**Kompilasi**

<details>
<summary><b>Kompilasi berhenti: paket esp32 di bawah 3.3.12, <code>multiple definition</code>, atau <code>SANDI_PORTAL</code> di luar 8–63 huruf</b></summary>

Paket di bawah 3.3.12 belum mengenal `setSHA256sum()` dan `useBuiltinCACertBundle()`: pasang **3.3.12** di **Boards Manager**, bukan 4.0.0-RC1 (5.1). `multiple definition` = variabel `kunci.h` tanpa `const` (5.2). Bunyi persis keduanya tidak direkam penulis. Sandi portal 6 huruf, kompilasi penulis:

```text
…/node-1-rumah/jaringan.cpp:36:41: error: static assertion failed: SANDI_PORTAL di kunci.h harus 8-63 huruf (aturan sandi WiFi WPA2), atau hapus barisnya
Error during build: exit status 1
```

Baris terakhir dari `arduino-cli`; penutup Arduino IDE bisa lain. Library versi lain (misalnya GFX 1.13.0) belum diuji penulis.

</details>

<details>
<summary><b>Program melebihi rak: skema partisi bukan Minimal SPIFFS</b></summary>

Skema **Default 4MB** hanya punya rak 1.310.720 byte, lebih kecil dari 1.7.0 (sekitar 1,41 juta byte): `Sketch too big` ([🚨 Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#-kalau-tidak-jalan)). **No OTA** atau **Huge APP** lolos kompilasi tanpa rak kedua: Serial `ota` menulis rak sebelah = rak berjalan, dan pembaruan berakhir `gagal` `Update error: Partition Could Not be Found (Update 10)` (dari kode dan sumber paket; belum dijalankan penulis). Pilih **Minimal SPIFFS** dan **DIO** (5.1), lalu **Upload** lewat kabel.

</details>

**Kabar dan layar**

<details>
<summary><b>Telegram menulis 📴 <i>offline</i> saat pembaruan, atau dua pesan per perangkat saat Perbarui semua</b></summary>

Pembaruan yang benar hanya mengabarkan `🔄 <id> berhenti sengaja …` lalu `✅ <id> online lagi sesudah berhenti sengaja (<n> detik)` (lab penulis, Telegram tiruan). `📴 <id> offline sejak …` = terputus tanpa pamit: listrik atau WiFi putus, papan mogok, atau firmware dan simulator lama (1.6.0, simulator Modul 27). `📴 … tidak kembali sesudah berhenti sengaja …` = 3 menit tanpa `online`: lihat riwayatnya. **Perbarui semua** = dua pesan per perangkat (lab: 44 untuk 22 perangkat tiruan); satu ringkasan per gelombang = 🧩 Tingkat 3.

</details>

<details>
<summary><b>Grafana mengirim <code>✅ … kembali mengirim data.</code> sesudah Nonaktifkan</b></summary>

Perangkat nonaktif keluar dari kueri *alert* "Node diam", jadi 🔴-nya dianggap pulih: artinya "tidak dipantau lagi". Lab penulis: kabar palsu itu 4 menit 36 detik sesudah **Nonaktifkan**; dengan *silence* untuk `device_id`-nya, tidak ada kabar selama 9 menit. Pasang *silence* dulu (11.2); aturannya sengaja tidak diubah di modul ini (README `grafana`).

</details>

<details>
<summary><b>Kartu masih menulis versi lama, <code>jenis belum diketahui</code>, atau versi <code>0.1.0</code></b></summary>

- Versi lama sesaat sesudah `berhasil`: tunggu `telemetry` berikutnya, atau muat ulang.
- `jenis belum diketahui`: `telemetry` pertama belum tiba; **Perbarui** terlalu cepat dijawab `409 … jenis perangkat belum diketahui: tunggu telemetry pertamanya` (lab penulis). Kesehatan kartu hasil klaim tampil sesudah muat ulang.
- `0.1.0`: simulator Modul 27; pakai simulator 4.2.
- `Offline` padahal data masuk, sesudah broker gerbang di-*restart* saat internet putus (3.4): pulih begitu statusnya berganti lagi.

</details>

<details>
<summary><b><code>Tidak bisa menyalin otomatis di alamat ini</code></b></summary>

Tombol **Salin** butuh `https://` atau `localhost`. Di `http://<IP>` (tanpa Pi, mode HP) *toast*-nya `Tidak bisa menyalin otomatis di alamat ini: kodenya sudah disorot, salin dengan Ctrl + C.` (teks dari kode). Salin sendiri atau catat di kertas; jangan memotretnya.

</details>

**Kemenangan Cepat**

<details>
<summary><b>Port jaringan tidak muncul di Tools → Port</b></summary>

Belum diuji penulis. Arduino IDE mencari papan lewat mDNS: laptop dan papan di WiFi yang sama, *firewall* laptop tidak menghalangi, dan sketsa KC sedang berjalan (`Siap menerima program lewat WiFi di <IP>`); tunggu sebentar, lalu buka lagi menunya. Tetap tidak ada? Cukup KC Langkah 1, 2, dan 5. Pesan sketsa KC: `Tidak ada rak sebelah: pilih Partition Scheme Minimal SPIFFS.` (skema tanpa OTA); `WiFi belum tersambung. Periksa tab secrets.h.` (sandi salah atau WiFi 5 GHz); sandi ditolak = yang berlaku sandi sketsa yang **sedang berjalan**.

</details>

**Kotak dan catu daya**

<details>
<summary><b><code>BROWNOUT</code> sesudah Node 1 pindah ke kotak</b></summary>

Catu daya, bukan firmware ([Modul 9 Konsep 3](../../fase-1-esp32-embedded/modul-09-catu-daya-dan-hemat-daya/README.md#3-brownout-saat-tegangan-sesaat-anjlok)). Aturan emas: beban berat dari MB102, tidak pernah dari pin ESP32, dengan GND bersama. Periksa: *charger* ESP32 minimal 1 A dengan kabel USB pendek; relay, pompa, dan servo di rel 5 V MB102, bukan `VIN` atau `3V3`; GND papan ekspansi tersambung ke GND MB102 (12.7); adaptor MB102 5 V 2 A. Jangan mematikan detektor *brownout*. Betulkan, lalu ulangi 24 jam (13.2).

</details>

<details>
<summary><b>Suhu DHT22 terlalu tinggi di dalam kotak</b></summary>

ESP32 dan MB102 menghangatkan udara kotak tertutup. Pindahkan DHT22 ke luar kotak atau menembus dinding, jauh dari keduanya, dan beri ventilasi atas dan bawah (12.3). Selisih suhunya di kotakmu belum diukur penulis.

</details>

<details>
<summary><b>Terminal kendor, sambungan solder dingin, atau kabel tertukar</b></summary>

Bacaan `null` atau melompat, atau relay kadang tidak menurut (beban tetap dari MB102, GND bersama)? Dengan kedua kabel daya tercabut: kencangkan terminal dan ulangi uji tarik (12.8), ganti ujung serabut yang mekar dengan kabel tunggal atau beri *ferrule*; sambungan dingin (celah gelap melingkar di pangkal kaki) dipanaskan lagi (12.5); kabel tertukar dicocokkan dengan [`PETA-PIN.md`](kode/PETA-PIN.md) dan label, lalu diuji kontinuitas ujung ke ujung.

</details>

<details>
<summary><b>Relay atau pompa menyala saat memindah kabel, atau papan ekspansi tidak pas</b></summary>

Relay atau pompa bergerak = listrik masih masuk: cabut kabel MB102, lalu kabel ESP32 (12.2), baru pindahkan kabel; kabel yang menyenggol pin saat menyala bisa merusak ESP32. Beban tetap dari MB102, bukan pin ESP32, dengan GND bersama. Papan ekspansi tidak pas: jarak dua deretnya lain, atau papan 38 pin (19 lubang per deret; 12.1); jangan memaksa atau menekuk kaki DevKit.

</details>

**Pesan yang boleh diabaikan**

<details>
<summary><b>Boleh diabaikan: <code>world readable</code>, peringatan library saat kompilasi, temuan <code>npm audit</code>, peringatan <i>chunk</i> 500 kB, status <code>online</code> lama, dan <code>tidak-ada</code> saat Nonaktifkan</b></summary>

- `Warning: File /mosquitto/config/acl-broker has world readable permissions. …`: sejak Modul 26.
- Peringatan library saat kompilasi (5.3), juga `crc16_update` lewat `rs485.cpp`; yang di berkas `node-1-rumah` sendiri jangan diabaikan.
- `npm audit` per 2 November 2026: backend `4 moderate severity vulnerabilities` (rantai halaman `/docs`, tidak dipanggil), dashboard `10 vulnerabilities (2 low, 8 moderate)` (alat *build*). **Jangan** `npm audit fix --force`.
- `(!) Some chunks are larger than 500 kB after minification.`: sejak Modul 23.
- Status *retained* `online` lama sesudah **Nonaktifkan** (11.4): diabaikan backend.
- `"akun_broker": "tidak-ada"` dengan langkah `mosquitto_passwd -D` untuk papan hasil klaim atau **Nonaktifkan** ulang: lewati bila tak pernah ada akun Modul 21.
- `… already exists` sekali saat `docker compose build` (lab penulis): ulangi perintahnya.

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: empat opsi Silabus, dua jebakan di sekitar OTA, cara memeriksa `extern "C"`, dan cara penulis menguji. Kecuali ditandai "lab penulis", isinya dari dokumentasi dan kode sumber resmi (dibaca 30–31 Oktober 2026) dan **belum dijalankan penulis**: cukup dibaca.

<details>
<summary><b>OTA Node 2 lewat "mode update": kenapa kita tidak melakukannya</b></summary>

Janji [🔬 Modul 14](../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md#-bedah-teknis-opsional) dan opsi Silabus: Node 1 menyuruh Node 2 "masuk mode update", Node 2 tersambung ke WiFi sebentar, memperbarui dirinya, lalu kembali ke ESP-NOW. Yang harus ditambahkan di dua firmware:

1. **Jendela dengar.** Node 2 1.0.0 hanya mengirim; ia harus mendengar sebentar sesudah tiap kiriman. Bentuk paket berubah, jadi `PAKET_VERSI` naik dan kedua papan diperbarui bersamaan.
2. **Sandi WiFi**, yang sengaja tidak diketahui Node 2: dikirim Node 1 lewat ESP-NOW terenkripsi, atau diisi lewat portal sementara di Node 2.
3. **Unduhan seperti Node 1** (`httpUpdate`, rute berkunci, SHA-256), padahal rute itu butuh kunci perangkat dan Node 2 terdaftar tanpa kunci, lewat penghubung Node 1 (Modul 21).
4. **Sah sebelum tidur.** Paket esp32 3.3.12 dibangun dengan `CONFIG_BOOTLOADER_SKIP_VALIDATE_IN_DEEP_SLEEP=y`: bangun dari *deep sleep* melewati pemeriksaan catatan rak. Firmware baru yang tidur di tengah masa uji tidak di-*rollback*: ia harus sah atau membatalkan diri sebelum tidur pertamanya.
5. **Baterai** untuk WiFi selama unduhan sekitar 940 ribu byte (Modul 14) dan masa uji; padam di tengahnya tetap aman karena rak lama tidak tersentuh.

Terlalu banyak perubahan untuk papan yang jarang berubah; karena itu Node 2 jujur tidak di-OTA di jalur utama ([Konsep 7](#7-armada-canary-perbarui-semua-dan-yang-jujur-tidak-di-ota)). Komponen ESP-IDF `espressif/esp-now` punya OTA lewat ESP-NOW, tetapi kecocokannya dengan Arduino-ESP32 3.3.12 belum terbukti. Rancangan ini belum diprogram atau dicoba penulis.

</details>

<details>
<summary><b>Firmware bertanda tangan: <code>UPDATE_SIGN</code> lawan Secure Boot V2</b></summary>

SHA-256 hanya menjamin berkas **utuh**: pemegang akun admin dashboard tetap bisa mengunggah firmware apa saja ([Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)). Tanda tangan menjawab "siapa pembuatnya", janji Modul 14 dan butir A08 di [🔬 Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#-bedah-teknis-opsional). Ada dua tingkat:

- **`UPDATE_SIGN`, tingkat aplikasi** (paket 3.3.12, tanpa eFuse; contoh resmi `Signed_OTA_Update` di library Update). Berkas `build_opt.h` di folder sketsa berisi `-DUPDATE_SIGN`; pasangan kunci RSA atau ECDSA dibuat di laptop dengan `tools/bin_signing.py` milik paket (Python 3 + paket `cryptography`); kunci publik ikut dikompilasi, dan setiap `.bin` ditandatangani kunci privat sebelum diunggah. Firmware memanggil `Update.installSignature(…)` sebelum `Update.begin()`; tanda tangan yang salah ditolak (`UPDATE_ERROR_SIGN`, 14) walau server pembaruannya dikuasai orang lain. Batasnya: chip tidak dikunci (kabel USB tetap bisa menimpa); kunci privat tidak boleh masuk Git, server, atau AI; contoh resminya memakai `HTTPClient` + `Update`, bukan `httpUpdate` seperti Node 1, dan gabungannya belum terbukti.
- **Secure Boot V2**: pembuka rak memeriksa tanda tangan setiap menyala. Di ESP32 hanya untuk chip revisi v3.0 ke atas, pembuka raknya harus dibangun sendiri dengan ESP-IDF (bawaan Arduino tidak bisa), setiap pembaruan wajib bertanda tangan, dan pengaturannya dibakar ke eFuse yang tidak bisa dikembalikan ([🔬 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-bedah-teknis-opsional), lipatan *Secure boot dan flash encryption*). Salah langkah = papan tidak bisa diisi program lain selamanya. **Jangan dicoba di Node 1** (Silabus §10: cabang "firmware profesional").

Keduanya belum dicoba penulis.

</details>

<details>
<summary><b>Pendaftaran lewat BLE: NimBLE-Arduino dan jebakan <code>NETWORK_PROV_SECURITY_0</code></b></summary>

Opsi Silabus lainnya: HP mengirim data WiFi lewat Bluetooth hemat daya (BLE), tanpa portal:

- **WiFiProv** (bawaan paket 3.3.12, aplikasi HP "ESP BLE Provisioning"). **Jebakan:** README contohnya menulis keamanan tingkat 1 dengan *proof of possession* (kode pembuktian), tetapi kode contohnya berujung pada `NETWORK_PROV_SECURITY_0`: **tanpa keamanan aplikasi**, sandi WiFi terkirim tanpa enkripsi aplikasi. Bila memakainya, tulis `NETWORK_PROV_SECURITY_1` (atau `_2`) secara eksplisit. README itu juga meminta rak di atas 1,4 MB (misalnya tanpa OTA) karena contohnya boros ruang; muat atau tidaknya bersama Node 1 (71 % satu rak) belum dicoba.
- **NimBLE-Arduino** 2.5.2 (25 Okt 2026): library BLE yang menurut pembuatnya hemat separuh *flash* dan sekitar 100 KB RAM dibanding BLE bawaan; protokol pendaftarannya kamu tulis sendiri.

Wokwi tidak meniru Bluetooth ESP32, jadi BLE hanya bisa diuji dengan papan dan HP. Kita memakai portal WiFiManager Modul 10: tanpa aplikasi, tanpa library baru, dan kini bersandi ([5.2](#52--portal-bersandi-sandi_portal-di-kuncih-3-menit)). Belum dicoba penulis.

</details>

<details>
<summary><b>ESP32 modul WROOM tanpa DevKit</b></summary>

DevKit V1-mu = modul ESP32-WROOM-32 ([🔬 Modul 2](../../fase-0-fondasi/modul-02-listrik-dan-unggah-pertama/README.md#-bedah-teknis-opsional), lipatan *Di dalam modul ESP-WROOM-32*) ditambah regulator 3,3 V, chip USB-serial, tombol EN dan BOOT, dan rangkaian *auto-reset*. Modulnya bisa dipakai sendiri asal kamu menyediakan isi daftar periksa skematik panduan desain perangkat keras Espressif:

- catu **3,3 V** yang sanggup **paling sedikit 500 mA**;
- **EN** dengan rangkaian tunda RC **10 kΩ + 1 µF**;
- resistor *pull-up* di **GPIO0**, pin *strapping*: rendah saat menyala berarti mode unduh (Modul 2, lipatan *Pin strapping …*);
- **UART0** (TX0/RX0) ke adaptor USB-serial 3,3 V untuk unggah dan Serial Monitor, plus tombol **EN** dan **BOOT** sendiri.

Tanpa rangkaian *auto-reset* (tidak dibahas halaman itu), setiap unggahan kabel memakai cara lengkap [🚨 Modul 2](../../fase-0-fondasi/modul-02-listrik-dan-unggah-pertama/README.md#-kalau-tidak-jalan): klik **Upload**, dan selagi `Connecting…` berjalan, tahan **BOOT**, tekan-lepas **EN** sekali, lalu lepaskan **BOOT**. Cukup sekali: sesudah 1.7.0 terpasang, pembaruan berikutnya lewat udara. Aturan emas catu daya tetap: beban berat tidak dicatu dari pin modul, GND bersama ([Konsep 11](#11-dari-breadboard-ke-kotak-terminal-sekrup-catu-daya-modul-9-dan-tanpa-220-v)). Belum dicoba penulis; Node 1 tetap DevKit di papan ekspansi.

</details>

<details>
<summary><b><code>HttpsOTA</code> dan <code>esp_https_ota()</code>: jebakan <code>skip_cert_common_name_check</code></b></summary>

Library Update paket 3.3.12 punya jalan pintas: `HttpsOTA`, pembungkus `esp_https_ota()` milik ESP-IDF. Panggil `HttpsOTA.begin(alamat, sertifikat_akar)`, pembaruan berjalan sendiri sebagai *task*, dan statusnya dibaca lewat `HttpsOTA.status()`.

Jebakannya parameter ketiga, `skip_cert_common_name_check`, yang **bawaannya `true`**: nama di sertifikat server tidak dicocokkan dengan nama yang dipanggil. Amplop tetap tersegel, tetapi kartu identitas sah milik situs lain dari akar yang sama ikut diterima, padahal kontrak data mewajibkan nama diperiksa. Node 1 memakai `httpUpdate` dengan `NetworkClientSecure` dan daftar akar bawaan ([Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)): rantai dan nama diperiksa, ditambah kunci perangkat, kepala MAC, dan SHA-256 dari perintah (tidak ada di parameter `HttpsOTA.begin()`).

Jujur soal tanggal: paket 3.3.12 tidak memeriksa tanggal berlaku sertifikat (`CONFIG_MBEDTLS_HAVE_TIME_DATE` mati), karena itu Node 1 tidak menunggu jam internet sebelum mengunduh. Itu bukan alasan memakai sertifikat lama, dan belum diuji penulis di papan.

</details>

<details>
<summary><b>ESP-IDF 6.2 kelak: konfirmasi otomatis, tidak berlaku untuk 3.3.12</b></summary>

Menurut panduan migrasi ESP-IDF 6.2, *rollback* di versi itu aktif sebagai bawaan, dengan konfirmasi otomatis begitu firmware baru mulai berjalan (`CONFIG_BOOTLOADER_APP_ROLLBACK_CONFIRM_ON_STARTUP`). Itu sama dengan bawaan inti Arduino yang kita matikan dengan `extern "C"` ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c)): firmware baru sah tanpa membuktikan diri ke broker. Paket esp32 3.3.12 kita (ESP-IDF v5.5.5) tetap seperti Konsep 4: masa uji kita yang memutuskan. Kelak menaikkan paket esp32 ke versi berbasis ESP-IDF 6.x? Ulangi dulu kompilasi, `nm` (lipatan berikut), dan [Praktik 8](#praktik-8--firmware-yang-sengaja-salah-kembali-sendiri-ke-versi-lama-25-menit) di papan.

</details>

<details>
<summary><b><i>Name mangling</i> dan <code>extern "C"</code>: memeriksa simbol dengan <code>nm</code></b></summary>

C++ boleh punya dua fungsi bernama sama dengan parameter berbeda, jadi kompilatornya menambahkan kode parameter ke nama (*name mangling*): `bool verifyRollbackLater()` di berkas `.cpp` menjadi `_Z19verifyRollbackLaterv` (`19` = panjang nama, `v` = tanpa parameter). Inti Arduino (bahasa C) memanggil nama apa adanya, `verifyRollbackLater`, yang punya bawaan *weak* ("boleh diganti", isinya `return false`). `extern "C"` memberi fungsi kita nama C itu sehingga bawaannya tergantikan ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c), [5.1](#51--paket-esp32-3312-skema-minimal-spiffs-dan-firmware-170-dengan-masa-ujicpp-8-menit)).

Lupa `extern "C"` tidak memunculkan galat atau peringatan. Pemeriksanya `nm`, alat bawaan paket esp32 yang mendaftar nama di berkas `.elf` (program lengkap dengan nama-namanya). Sesudah [6.2](#62--sketch--export-compiled-binary-isi-folder-build-3-menit), di terminal VS Code akar proyek (Linux; macOS, tidak diuji: ganti `~/.arduino15` dengan `~/Library/Arduino15`):

```text
~/.arduino15/packages/esp32/tools/esp-x32/2601/bin/xtensa-esp32-elf-nm firmware/node-1-rumah/build/esp32.esp32.esp32/node-1-rumah.ino.elf | grep verifyRollbackLater
```

Windows (PowerShell, tidak diuji penulis):

```text
& "$env:LOCALAPPDATA\Arduino15\packages\esp32\tools\esp-x32\2601\bin\xtensa-esp32-elf-nm.exe" firmware\node-1-rumah\build\esp32.esp32.esp32\node-1-rumah.ino.elf | Select-String verifyRollbackLater
```

`2601` = folder versi alat di mesin penulis (berbeda? lihat isi folder `esp-x32`). Pakai persis `xtensa-esp32-elf-nm`, bukan varian `esp32s2`/`esp32s3` di folder itu.

**Hasilnya (lab penulis, kompilasi `arduino-cli`; 1.7.1, sama dengan 1.7.0):**

```text
401afc20 T verifyRollbackLater
```

Tepat satu baris berhuruf **`T`**: fungsi kita ada di bagian kode program dan menggantikan bawaan, jadi *rollback* aktif. Lalu penulis mengompilasi salinan 1.7.0 di folder terpisah dengan satu perubahan, `extern "C"` dihapus:

**Hasilnya (lab penulis, kompilasi `arduino-cli`; salinan tanpa `extern "C"`):**

```text
401b1054 W verifyRollbackLater
```

**`W`** = bawaan lemah yang dipakai: *rollback* mati. Kompilasinya tetap berhasil tanpa peringatan baru, ukurannya sama persis dengan 1.7.0, dan `masa-uji.cpp.o` memang berisi `T _Z19verifyRollbackLaterv`, tetapi tak ada yang memanggilnya, jadi penyambung (*linker*) membuangnya. 1.6.0 dan sketsa Kemenangan Cepat juga `W` (memang tanpa masa uji). Bukti kedua penulis: kolam literal `initArduino()` di `.elf` berisi alamat fungsi kita, `0x401afc20`.

Alamat di depan boleh beda di komputermu; yang dibaca hurufnya. **`T` = benar. `W` = jangan unggah berkas itu:** salin ulang `masa-uji.cpp` dari [`kode/`](kode/firmware/node-1-rumah/masa-uji.cpp), ekspor lagi, periksa lagi. Biasakan sesudah setiap ekspor (6.2, 8.1).

</details>

<details>
<summary><b>Bagaimana penulis menguji: simulator, berkas <code>.bin</code> tiruan, uji host, dan internet tiruan</b></summary>

Semua kotak **Hasilnya** dibuat di satu Raspberry Pi 5, tanpa ESP32, HP, VPS, atau domain:

1. **Server = kode sungguhan.** Dari salinan proyek Modul 27 terbit, penulis mengikuti urutan praktik di cabang `fitur/armada` untuk jalur utama; jalur gratis dan tanpa Pi diuji klaim dan unduhannya. Internet, "VPS", "Pi", dan Let's Encrypt ditiru seperti [🔬 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#-bedah-teknis-opsional) (Pebble, DNS tiruan, lorong Docker). Layar **Armada** dibuka Chrome 156 tanpa layar; permintaan Bruno dijalankan skrip kecil dari berkas `backend/bruno/` yang sama; Telegram = server Bot API tiruan.
2. **Perangkat = simulator** `alat/simulator-perangkat.js`, meniru rancangan 1.7.0, 1 sampai 23 perangkat tiruan. Berkas 1.7.1 = firmware asli kompilasi penulis: diunggah, diunduh, dan diperiksa ukuran, `0xE9`, dan SHA-256-nya, tidak dijalankan. Rilis uji 1.7.2 = berkas tiruan `--uji` dari `alat/buat-bin-tiruan.js`: simulator mengenali penandanya lalu sengaja gagal masuk broker. Angka waktunya (OTA 5,5 detik, *rollback* 70,4–70,5 detik, klaim 274 ms) = simulator di satu mesin, bukan ESP32 lewat WiFi.
3. **Logika firmware = uji host:** berkas firmware dikompilasi g++ untuk komputer biasa, dengan tiruan untuk inti Arduino, catatan rak, NVS, HTTPUpdate, dan *watchdog* (alatnya tidak ikut `kode/`).

**Hasilnya (lab penulis, uji host, 2 November 2026; dipotong):**

```text
uji_murni: 64 lulus, 0 gagal
uji_murni: 64 lulus, 0 gagal
kasus: 37, sama: 34
uji_simulator_unduh (http): 22 lulus, 0 gagal
uji_simulator_unduh (https): 22 lulus, 0 gagal
uji_ukuran: 10 lulus, 0 gagal
uji_mesin_ota: 127 lulus, 0 gagal
definisi extern "C": 1
== SELESAI: status 0 (0 = semua lulus)
```

Berurutan: versi dan `update` (dua standar C++); firmware lawan simulator (3 beda disengaja); jalur gagal unduhan simulator; ukuran pesan; 127 pemeriksaan dalam 13 skenario pembaruan, masa uji, dan *rollback* dengan pembuka rak tiruan.

4. **Kompilasi** (2 November 2026): `arduino-cli` 1.5.1 (bukan Arduino IDE), paket esp32 3.3.12, 10 library versi persis, FQBN `esp32:esp32:esp32:PartitionScheme=min_spiffs,FlashMode=dio` (nama papan + setelan Modul 10) dengan `--warnings all`: 1.7.0, 1.7.1, 1.7.2-uji, Kemenangan Cepat, kunci 🧩 Tingkat 1, varian tanpa `extern "C"`, dan 1.6.0 pembanding. Angka di Arduino IDE-mu boleh beda beberapa ratus byte.
5. **Kunci 🧩:** Vitest (Tingkat 2: 5 tes; Tingkat 3: 214 tes) dan lab gelombang dengan 21–22 perangkat tiruan.
6. **Tidak dijalankan penulis:** Wokwi (yang gratis tidak menjangkau server rumahmu), QEMU, papan ESP32, Serial Monitor, portal di HP (ilustrasinya dari HTML asli WiFiManager 2.0.17), papan ekspansi, kotak, solder, serta VPS, domain, Let's Encrypt, Cloudflare, dan Telegram sungguhan.

Jadi firmware-nya dikompilasi penulis, belum dijalankan di papan (kotak status di awal modul): kamulah penguji pertamanya ([➕ F](#f-simpan-catatan-belajar-bukti-o0-sampai-p1-foto-sebelumsesudah-dan-angka-papanmu)). Rincian mesin, padanan nama lab, dan butir yang belum terbukti: [📚](#-sumber--atribusi-gambar).

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** Tingkat 1: **Arduino IDE**, Node 1, layar **Armada**. Tingkat 2: **VS Code**, terminal di folder `backend`. Tingkat 3: **VS Code**, terminal mesin pusat, **Bruno**, simulator `alat`, layar **Armada**, **Telegram**.

Semuanya opsional (tanpa ⭐): kerjakan sesudah ➕ E, di cabang baru dari `main`.

### Tingkat 1 — Rak program dan masa uji di layar OLED (ubah sedikit, 20 menit)

> [!NOTE]
> Kuncinya dikompilasi penulis, belum dijalankan di papan.

OLED belum menulis rak dan masa uji (7.4): ubah baris terakhir halaman status (tekan lama D13, Modul 8) di `layar.cpp` menjadi versi, rak (Konsep 2), dan keadaan masa uji. Petunjuk: satu baris muat 21 huruf (angka memori bebas boleh dibuang; ada di Serial `info` dan **Armada**); rak berjalan dari `esp_ota_get_running_partition()`, keadaannya dari `esp_ota_get_state_partition()` (catatan rak yang dibaca pembuka rak, bukan `dalamMasaUji()`); `#include <esp_ota_ops.h>` dan rumus sisa detik (Serial `ota`) ada di `masa-uji.cpp`.

**Uji dirimu:** ubah `VERSI_FIRMWARE` ke `"1.7.3"` (1.7.2 sudah dipakai rilis uji; `UJI_KUNCI_SALAH` tetap `0`), lalu ekspor, unggah, dan **Perbarui** seperti Praktik 6–7. **Lulus kalau** sesudah `berhasil`, halaman status menulis `v1.7.3 app0 sah` (Node 1 tadinya di `app1`). `UJI <n>s` hanya tampil sampai kuncinya diterima broker: tekan lama segera sesudah Node 1 menyala ulang (di papan belum diukur penulis).

<details>
<summary><b>Kunci Tingkat 1</b></summary>

[`tingkat-1/`](kode/tantangan/kunci/tingkat-1/): `layar.cpp` utuh atau `perubahan.diff` (+28 −1). Fungsi baru `teksVersiRak()` menulis `v1.7.0 app0 kabel` (lewat kabel), `v1.7.3 app0 UJI 47s` (masa uji), atau `v1.7.3 app0 sah` (sudah terbukti); `%.4s` (paling banyak 4 huruf) mencegah peringatan `-Wformat-truncation`.

**Hasilnya (lab penulis, kompilasi `arduino-cli`):**

```text
Sketch uses 1411047 bytes (71%) of program storage space. Maximum is 1966080 bytes.
```

`.bin` 1.411.200 byte; angkamu boleh beda (5.3). Peringatan dari berkas sketsa 0; `nm` tetap satu `T verifyRollbackLater` (*rollback* aktif).

</details>

### Tingkat 2 — `bandingkanVersi()` dan lencana `perlu diperbarui` (isi bagian rumpang, 20 menit)

Lencana `perlu diperbarui` muncul bila `bandingkanVersi(fw, terbaru) < 0`, dan `terbaru` pun dipilih dengan fungsi ini (Konsep 5). Dibaca huruf demi huruf, `"1.10.0"` kalah dari `"1.9.0"`. Kosongkan tiga baris ini di `backend/src/services/versi.ts`, lalu isi sendiri; `x[1]`–`x[3]` = MAJOR, MINOR, PATCH sebagai **teks**:

```ts
  for (let i = 1; i <= 3; i++) {
    ____ // (1) selisih bagian ke-i, dihitung sebagai ANGKA
    ____ // (2) bagian ini sudah berbeda? langsung jawab -1 atau 1
  }
  ____ // (3) ketiga bagian sama
```

**Uji dirimu** di folder `backend`:

```text
npm test -- versi
```

**Hasilnya (lab penulis):** jawaban benar `Tests  5 passed (5)`; jawaban yang membandingkan teks `Tests  3 failed | 2 passed (5)` dengan `expected -1 to be 1`. Sesudahnya `git restore src/services/versi.ts`.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

```ts
    const beda = Number(x[i]) - Number(y[i]);
    if (beda !== 0) return Math.sign(beda);
  }
  return 0;
```

`Number()` mengubah teks menjadi angka; bagian pertama yang berbeda menentukan, dan `Math.sign()` merapikannya menjadi `-1` atau `1`. Penjelasan: [`tingkat-2/`](kode/tantangan/kunci/tingkat-2/).

</details>

### Tingkat 3 — Gelombang otomatis: *canary*, tunggu sehat, lalu sisanya bertahap (buat dari nol, 45 menit)

**Perbarui semua** mengirim sekaligus, dengan dua kabar Telegram per perangkat (Praktik 9). Buat gelombang otomatis di backend (Konsep 7): *canary* dulu, tetap sehat 10 menit, lalu sisanya per gelombang 2, 4, 8, …; satu `rollback`, `gagal`, atau `kedaluwarsa` = rem darurat (sisanya tidak dikirimi); satu ringkasan Telegram per tahap (*canary*, tiap gelombang). Petunjuk: berkas baru `services/gelombang.ts` + `routes/gelombang.ts` (`POST /armada/gelombang` dengan `versi` dan `tunggu_menit` 1–60, bawaan 10; `GET /armada/gelombang`; `POST …/berhenti`); kirim lewat `mintaUpdate()`, teruskan hasilnya dari `kabarkan()` (keduanya di `ota.ts`); selama tunggu sehat periksa *canary* tiap 5 detik (`online`, versi baru, tidak menyala ulang); perangkat yang dilewati bukan rem; `telegram.ts` mendiamkan 🔄/✅ perangkat gelombang, 📴 tetap.

> [!WARNING]
> Gelombang mengirim ke setiap Node 1 aktif yang `online`, termasuk papanmu, padahal berkas tiruan tidak boleh sampai ke papan sungguhan. Selama papan ikut, pakai firmware asli hasil ekspormu (misalnya 1.7.3 dari Tingkat 1). Rem darurat dengan berkas tiruan: jadikan perangkat tiruan satu-satunya *canary* (hapus centang **Canary** Node 1-mu), maka rem mencegah papanmu dikirimi.

**Uji dirimu:** `npm test`, *commit*, *push*; di mesin pusat `git fetch`, `git switch <cabangmu>`, `docker compose up -d --build backend`. Dengan beberapa perangkat tiruan (Praktik 9; yang dinonaktifkan di 11.3: *clone* `ganti kunci perangkat latihan`) dan satu *canary*, mulai gelombang dari Bruno (latihan: `"tunggu_menit": 1`); untuk rem darurat, unggah berkas tiruan `--uji` versi baru (🔀 Praktik 8) **tanpa** centang **Rilis uji**. **Lulus kalau** jalan mulus = satu ringkasan per tahap, dan rem darurat = satu pesan `🛑` tanpa perangkat lain dikirimi. Segera tarik rilis rusak itu (Bruno `tarik rilis uji`, ganti versinya): sampai ditarik, semua kartu `perlu diperbarui`, dan **Perbarui** di kartu papanmu memilihnya. Selesai: nonaktifkan perangkat tiruannya selagi `Online` (11.3), hentikan simulator, `git switch main`, *build* ulang backend.

<details>
<summary><b>Kunci Tingkat 3</b></summary>

[`tingkat-3/`](kode/tantangan/kunci/tingkat-3/): tiga berkas baru di `backend/src/` (10 uji Vitest), tiga permintaan Bruno, dan `perubahan.diff` (4 berkas, +43 −2). `npm test`: `Test Files  26 passed (26)`, `Tests  214 passed (214)`.

**Hasilnya (lab penulis: 22 perangkat tiruan, `tunggu_menit` 1, seperti yang diterima server Telegram tiruan; angka simulator):** jalan mulus = 5 pesan (cara lama 44), yang terakhir:

```text
✅ Gelombang 1.7.5 SELESAI · gelombang 4 dari 4: 7 berhasil. Semua tahap: 22 berhasil, dalam 1 menit 28 detik.
```

Rem darurat di *canary* (berkas tiruan `--uji`) = satu pesan:

```text
🛑 Gelombang 1.7.6 BERHENTI (rem darurat) · canary: 1 kembali ke versi lama (rollback) (f00d00000001: tidak tersambung ke broker dalam 60 detik). 21 perangkat lain TIDAK dikirimi: periksa dulu, lalu tarik rilisnya.
```

Lab sebelumnya (21 perangkat tiruan): rem juga bekerja di gelombang 2 (4 `kedaluwarsa`) dan saat *canary* menyala ulang dalam tunggu sehat. **Batas jujur:** gelombang hanya di memori (backend dimulai ulang = berhenti); jeda hanya sesudah *canary*; perangkat yang terlewat tidak dikirimi lagi; kerusakan yang tidak memutus perangkat (misalnya sensor membaca nol) tidak terdeteksi. Belum dicoba penulis: ESP32 sungguhan dan tunggu sehat 10 menit penuh.

</details>

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini **bisa diperbarui tanpa kabel dan siap dipasang di banyak lokasi**. Kodenya sudah di-*commit* di `fitur/armada`. A mencocokkan, B–D merapikan dokumen, E menggabungkan ke `main`, F menyimpan catatanmu (±30 menit). Gambar Konsep 8 kini juga gambar keadaan Rumah Pintar Mini sesudah Modul 28:

![Diagram perangkat di balik gerbang (Konsep 8), jalur utama: akun broker perangkat dibuat backend di VPS tetapi tinggal di broker gerbang Pi. Kiri, Rumah (router tanpa port forwarding): Node 1 1.7.0 dan papan ketiga (hasil klaim) ke broker gerbang pi1, 192.168.1.37:1883; akun perangkat dibuat backend (dynamic security); akun layanan dan akun lama Modul 21 di password_file; perangkat hanya membaca rpm/id/cmd miliknya. Router rumah: sambungan KELUAR, tidak ada pintu dibuka. Tengah: jembatan TLS 8883, data naik, perintah akun turun. Kanan, VPS: broker pusat (8883 TLS, menerima perintah akun di rpm-gerbang/pi1/…), backend 1.5.0 (AKUN_BROKER_OTOMATIS=gerbang:pi1; klaim, registrasi, ganti kunci, Nonaktifkan = createClient atau deleteClient), Caddy HTTPS 443 (/fw/* dan /api/provision/klaim ke backend; ALAMAT_SERVER di .env, sama dengan yang diketik di portal papan). Panah router ke Caddy: unduhan firmware + klaim, HTTPS langsung ke VPS, tidak lewat jembatan. Empat langkah: 1 backend menerbitkan setDefaultACLAccess lalu createClient di pusat, topik rpm-gerbang/pi1/dynamic-security/v1; 2 jembatan membawanya ke gerbang menjadi $CONTROL/dynamic-security/v1, plugin membuat akun; 3 jawaban …/response naik ke backend, 201; 4 tanpa jawaban 3 detik: sekali lagi, lalu 503; database tidak berubah, perintah yang sempat terkirim bisa tetap dikerjakan saat jembatan pulih. Remap di jembatan/pusat.conf: topic dynamic-security/v1 in 1 $CONTROL/ rpm-gerbang/pi1/ dan baris …/response out 1 yang sama. Lab tiruan: daftar 201 0,15-0,31 s, Nonaktifkan 0,18 s. Tabel .env ALAMAT_SERVER dan AKUN_BROKER_OTOMATIS: laptop tanpa Pi http://192.168.1.10, pusat; laptop + Pi sama, gerbang:pi1; VPS https://iot.namaanda.my.id, gerbang:pi1; Pi gratis http://192.168.1.37, gerbang:pi1; PINTU_WEB_DALAM kosong (= 80), Pi 8081 di dalam kontainer; di portal Alamat server = ALAMAT_SERVER persis, tanpa :8081; Alamat broker = IP gerbang atau laptop. Jalur gratis: pusat juga di Pi (1884); papan mengetuk http://192.168.1.37, port 80 Pi diteruskan ke pintu perangkat 8081: hanya /fw/* dan klaim, tanpa dashboard, tanpa percaya X-Forwarded-For; dashboard lewat terowongan Cloudflare, unduhan tidak. Bawah, pindah akun Modul 21: ganti kunci lewat Bruno (POST /devices/id/kunci, tanpa tombol dashboard), kunci isi di Serial segera, mosquitto_passwd -D, restart gerbang bukan HUP; tanpa langkah 3 kunci lama hidup lagi.](aset/perangkat-di-balik-gerbang.png)

> 🖥️ **Alat yang dipakai:** **VS Code**, terminal di **akar proyek** laptop (F: folder `belajar-iot`); **Chrome** (masuk ke GitHub); di E juga **terminal SSH** ke VPS dan Pi. A–E boleh dikerjakan selama uji 24 jam Praktik 13.
>
> ⭐ **Wajib** — langkah E: *pull request* ke `main`.

### A. Cocokkan proyekmu: akar, `edge/`, `skrip/`, `backend/` 1.5.0, `frontend/` 1.4.0, dan `firmware/`

Di terminal akar proyek laptop:

```text
git diff --stat main
```

Daftarnya harus sama dengan tabel **Berkas yang berubah minggu ini** di [🧰](#-yang-perlu-disiapkan), kecuali dokumen B–D. Tidak boleh ada `firmware/node-2-kebun/` (Node 2 tetap 1.0.0), migrasi `001`–`010`, `.env`, `.bin`, atau `build/`. Isinya sama dengan berkas senama di [`kode/`](kode/), kecuali yang milikmu (`LABEL` di `Dockerfile`, `device_id` di `edge/acl-broker`, `TOKO_IMAGE`, tabel **Perangkatku**, `konfigurasi.h` 1.7.1 dari 6.5 dengan angkamu dari 5.1, catatan 12.1 di `PETA-PIN.md`). PETA-PIN 7 menepati janji "tidak berubah sampai Modul 28": pinnya tetap, sambungannya saja yang pindah ke kotak. Pohon proyek Silabus (§9) v1.0.30 mencatat yang baru: `firmware/README.md`, `skrip/cadangkan-akun-broker.sh`, lemari `data-firmware`, dan *dynamic security* di `edge/`.

> 🔀 **Tanpa Kit:** firmware 1.7.0 dan PETA-PIN 7 belum ada di cabangmu (Praktik 5 menunggu papan); kerjakan nanti di cabang baru dari `main`.

### B. Perbarui README proyek, lalu README `backend/`, `frontend/`, `edge/`, `alat/`, `grafana/`, dan `firmware/`

**README akar.** Buka [README rujukan](kode/README.md), klik **Raw**, salin bagian `## OTA & armada (Modul 28)` sampai sebelum `## Yang akan menyusul`, lalu tempel di akhir `README.md` akar repositorimu dan ganti jalur `[Modul 28](…)` di dalamnya dengan alamat halaman ini. Isinya: yang baru, urutan pasang pusat → gerbang → firmware, dan **Keamanan berkas `.bin`** (bisa berisi kunci ESP-NOW dan sandi portal). Di README-mu, langkah 2 bagian Modul 26: ganti "lima rahasianya" dengan "enam rahasianya (sejak Modul 28 termasuk `MOSQUITTO_DYNSEC_PASSWORD`)". Tabel "Isi saat ini" README rujukan kini menulis Node 1 1.7.0, PETA-PIN 7, kontrak 1.6, backend 1.5.0, dan dashboard 1.4.0; janji "banyak perangkat sekaligus" (bagian "Yang akan menyusul") pun terpenuhi: *canary* dulu, lalu **Perbarui semua**.

**README folder.** `backend/`, `frontend/`, `edge/`, `alat/`, dan `firmware/` (baru) sudah ikut di 2.2, 4.1, 3.1, 4.2, dan 5.1 dengan bagian Modul 28 (`edge/`: isi lagi tabel kepalanya); Batasan v1.5 backend menulis `npm audit` `4 moderate severity vulnerabilities` (per 2 November 2026), dan README firmware berstatus "sudah dikompilasi, BELUM dijalankan di papan sungguhan". Tinggal `grafana/README.md`: ganti isinya dengan [rujukannya](kode/grafana/README.md) (**Copy raw file**); butir Batasan barunya: kabar `✅ <nama> kembali mengirim data.` palsu sesudah **Nonaktifkan**.

### C. Lengkapi `.env.example` akar dan `edge/`: sandi plugin dan blok Armada tanpa rahasia aslimu

Keduanya disalin di 2.3 dan 3.1. Cocokkan dengan [rujukan akar](kode/.env.example) dan [rujukan `edge/`](kode/edge/.env.example):

```text
MOSQUITTO_DYNSEC_PASSWORD=
# …
ALAMAT_SERVER=
# …
PINTU_WEB_DALAM=
# …
AKUN_BROKER_OTOMATIS=mati
```

Baris pertama ada di keduanya, kosong; tiga lainnya di blok "Armada" akar. Nilaimu (dua sandi plugin, alamat servermu) hanya di `.env`, ber-`chmod 600`, di luar Git.

### D. Tambahkan butir Modul 28 ke templat *pull request*

Ganti isi `.github/pull_request_template.md` dengan [templat rujukan](kode/.github/pull_request_template.md) (**Copy raw file**): empat butir **(Modul 28)** di **Checklist sebelum *merge*** dan delapan di **Checklist keamanan**, misalnya:

```markdown
- [ ] **(Modul 28)** `UJI_KUNCI_SALAH` bernilai `0` di kode yang di-*commit*; rilis uji rollback diunggah dengan tanda **uji** (`?uji=true`) dan tidak pernah dikirim ke semua perangkat
```

Dua butir **(Modul 21)** berubah bunyi (akun *dynamic security* tanpa *restart*; baris `devices` otomatis hanya lewat kode klaim), juga butir tag image (`1.5.0`, `1.4.0`); dua butir `npm audit` kini bertanggal: bandingkan dengan 2.2 dan 4.1.

### E. ⭐ Gabungkan `fitur/armada` ke `main` lewat *pull request* "Armada: OTA, rollback, klaim, dan kotak"

Di terminal akar proyek laptop, `git status` hanya menyebut berkas B–D (`.env`, `backup/`, `build/`, `*.bin`, `edge/jembatan/pusat.conf` diabaikan Git). Lalu satu per satu (plus perbaikan A dan C bila ada):

```text
git add README.md edge/README.md grafana/README.md .github/pull_request_template.md
git commit -m "Dokumen Modul 28: README proyek, catatan Grafana, dan templat PR"
git push
```

1. Di GitHub: **Compare & pull request** (base `main`), judul `Armada: OTA, rollback, klaim, dan kotak`; tulis perubahan dan bukti O0 sampai P1 sejujur catatanmu (misalnya `O1: tiruan, tanpa Kit`), salin butir **(Modul 28)** templat D (`main` masih templat lama), lalu **Create pull request**.
2. ***Review*:** **Files changed** (lab penulis, `git diff`: 129 berkas) tanpa `*.bin`, `build/`, `.env`, kode klaim, sandi plugin, `dynamic-security.json`, `sandi-broker`, atau isi `backup/akun-broker-…`, dan `konfigurasi.h` menulis `UJI_KUNCI_SALAH = 0` (8.2); lalu **Review changes** → **Comment** → **Submit review**. Ada yang terlarang? Jangan di-*merge*: `git rm -r --cached` + nama berkasnya (rahasia: ganti juga nilainya), *commit*, *push* lagi.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. Laptop: `git switch main`, `git pull`, `git branch -d fitur/armada`. VPS dan Pi: `git switch main`, `git pull`, tanpa `docker compose up -d` (Pi menolak karena `edge/acl-broker`? `git stash` dulu, `git stash pop` sesudahnya).

Penulis menguji *commit* dan *push* ini di repo git lokal, bukan GitHub.

**Kamu lulus langkah ⭐ ini** kalau *pull request* itu ditinjau dengan butir **(Modul 28)**, di-*merge*, dan `main` di setiap mesinmu memuat backend `1.5.0`, frontend `1.4.0`, dan migrasi `011`. Centang ➕ E di [✅](#-checklist-kelulusan-modul-28).

### F. Simpan catatan belajar: bukti O0 sampai P1, foto sebelum–sesudah, dan angka papanmu

Firmware Modul 28 dikompilasi penulis, belum dijalankan di papan, jadi angkamu adalah uji papan pertamanya: tulis apa adanya, termasuk yang gagal. Di `belajar-iot/modul-28/` tambahkan `catatan.md`, tanpa sandi, kunci, kode klaim, atau isi `.env`:

```markdown
# Catatan Modul 28 — Diperbarui tanpa kabel, siap dipasang di banyak lokasi

| Hal | Punyaku |
| :--- | :--- |
| Jalur | … |
| O0 (5.4), O1 (7.5), O2 (8.3): tanggal WIB / tiruan / belum | … |
| P1 (10.4): detik sejak Save | … |
| K1 a–d (12.9); K1 e (13.2): `reset_reason` sesudah 24 jam | … |
| Detik dari Ya, perbarui sampai berhasil / sampai rollback | … / … |
| Belum kuuji | … |
```

Di bawahnya, foto "sebelum" dan "sesudah" berdampingan tanpa isi rumah atau sandi portal terbaca (tanpa Kit: rencana kotak), lalu *commit* dan *push*. Tabel OWASP IoT Modul 21 kini bergeser:

| No. | Modul 21 | Sesudah Modul 28 |
| :--- | :--- | :--- |
| I4 pembaruan aman | ⏳ | 🟡 unduhan berkunci, SHA-256, dan *rollback*; belum bertanda tangan (🔬; A08 Modul 20) |
| I8 pengelolaan perangkat | ✅ | ✅ layar **Armada**, kode klaim, **Nonaktifkan** |
| I10 pengerasan fisik | ⏳ | 🟡 Node 1 di kotak; kunci di NVS tetap terbaca bila papannya dibongkar |

Itulah "siap dipasang di banyak lokasi": papan baru mendaftar sendiri, semua diperbarui dari satu layar tanpa didatangi, yang hilang diputus dari jauh, dan Node 1 bekerja di kotaknya.

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Alamat server** tersimpan | Sama persis di `ALAMAT_SERVER`, portal, dan NVS. Node 1 hanya mengunduh dari situ; `http://` hanya ke IP rumah. |
| **ArduinoOTA** (dorong dari IDE) | Arduino IDE mengirim program lewat WiFi dengan satu sandi (Kemenangan Cepat); program buruk tetap sah. |
| **Armada** (*fleet*) | Semua perangkatmu; layarnya **Armada** (`/armada`). |
| **Berhenti sengaja** (`offline-mode`) | Node 1 pamit lalu putus rapi sebelum mengunduh atau `restart`. Bukan **terputus** (`offline`, wasiat) atau **mode offline** (Modul 19). |
| **Berkas firmware** dan **berkas gabungan** | `node-1-rumah.ino.bin` (bait pertama `0xE9`) diunggah ke server; `.merged.bin` (seluruh *flash*) ditolak. |
| ***Canary*** | Perangkat percobaan yang diperbarui lebih dulu, seperti burung kenari penambang. |
| **Catatan rak** (`otadata`) | Secarik catatan: rak mana yang dinyalakan, dan apakah masih masa uji. |
| ***Dynamic security*** | Buku akun broker yang ditulis backend tanpa *restart*: akun perangkat di sini, akun layanan di berkas sandi; kunci induknya `MOSQUITTO_DYNSEC_PASSWORD`. |
| **`extern "C"`** | Tanpanya `verifyRollbackLater()` kita tidak menggantikan bawaan `false`: *rollback* mati tanpa peringatan. |
| ***Ferrule*** | Selongsong logam ujung kabel serabut (opsional). |
| **HTTPUpdate** | Library paket esp32 yang mengunduh firmware ke rak sebelah; pengganti `ESPhttpUpdate` (ESP8266). |
| **IP65** (kode IP) | 6 = rapat debu, 5 = tahan semburan air; serapat itu mengurung udara lembap, bukan tujuan Node 1. |
| **Jeda `vitals`** | Selang kabar kesehatan: 60–3600 detik (bawaan 300), diatur dari jauh; `telemetry` tetap 10 detik. |
| **Kode klaim** | Kode tiket `XXXX-XXXX` dari admin: sekali pakai, 5–60 menit, tampil sekali; ditukar papan dengan kunci perangkat. |
| **Kotak proyek** dan **rencana kotak** | Kotak plastik berventilasi tanpa 220 V; rencananya (tata letak, belanja, ukuran) = jalur tanpa Kit. |
| **Masa uji** (`PENDING_VERIFY`) | 60 detik pertama firmware baru: kunci diterima broker, lalu `online` dan langganan `cmd`. Gagal: *rollback*. |
| **Nonaktifkan** | Kunci dicabut, akun broker dihapus, putus seketika; mencabut kunci Modul 21 hanya lapis kedua. |
| **OTA** (pembaruan lewat udara) | Jalur kita **tarik dari server**: `update` lewat MQTT, Node 1 mengunduh sendiri dari server rumahnya. |
| **Papan ekspansi terminal sekrup** | Tempat DevKit V1 30 pin ditancapkan, setiap pin ke satu terminal sekrup; ukur jarak dua deret kakinya dulu. |
| **Pembuka rak** (*bootloader*) | Program pertama yang menyala: membaca catatan rak, lalu menjalankan rak yang ditunjuk. |
| **Penahan tarikan** (*strain relief*) | Pengikat kabel di lubang kotak: tarikan ditahan pengikat, bukan sekrup. |
| **Pendaftaran perangkat** (*provisioning*) | Menyiapkan papan baru supaya dikenal server (dulu tangan, kini kode klaim); bukan *provisioning* Grafana Modul 26. |
| **Perfboard** | Papan berlubang untuk rangkaian yang disolder. |
| **Pintu perangkat** (`:8081`) | Pintu Caddy Pi jalur gratis: hanya unduhan firmware dan klaim. |
| **Portal bersandi** | WiFi `Node1-Rumah` dengan `SANDI_PORTAL` (8–63 huruf): `192.168.4.1/update` hanya untuk pemegang sandi. |
| **Rak program** (`app0`, `app1`) | Dua partisi 1.966.080 byte; kabel selalu ke `app0`, OTA menulis rak sebelah. |
| ***Remap*** jembatan | Dua baris `edge/jembatan/pusat.conf` yang menitipkan perintah akun ke gerbang `pi1` dan membawa jawabannya pulang. |
| **`reset_reason`** | Alasan terakhir menyala, tujuh nilai; `BROWNOUT` (*brownout*) = catu daya, `PANIC`/`WDT` = firmware. |
| **Rilis** dan **daftar rilis** (*manifest*) | Satu versi di server, tidak boleh ditimpa; daftarnya disusun server dari database (`GET /firmware`). |
| **Rilis uji** dan **rilis ditarik** | Uji: hanya **Perbarui** satu perangkat. Ditarik (Bruno `tarik rilis uji`): tidak dikirim, unduhannya `404`. |
| ***Rollback*** firmware | Kembali sendiri ke rak lama, ke versi sebelum pembaruan itu; bukan "rollback" tombol optimis Modul 24. |
| **Sambungan dingin** | Sambungan solder bercelah di pangkal kaki, bisa putus-sambung; yang baik mengilap, berbentuk gunung kecil. |
| **SemVer** | `MAJOR.MINOR.PATCH`, dibandingkan sebagai angka per bagian (1.10.0 > 1.9.0); sumbernya `VERSI_FIRMWARE`. |
| **Sidik jari berkas** (SHA-256) | Beda satu bait, beda sidik (`Update 15`): menjamin utuh, bukan siapa pembuatnya. |
| **Simulator** dan **perangkat tiruan** | Simulator `alat/` meniru 1.7.0 tanpa mem-*flash*; keluaran `buat-bin-tiruan.js` bukan firmware: jangan ke papan. |
| **Unduhan berkunci** | `/fw/node-1/<versi>.bin` hanya dengan `device_id:kunci` dan `x-ESP32-STA-MAC` perangkat aktif. |

## 📝 Kuis (5 soal)

[Tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase) meminta paling sedikit 4 benar di setiap kuis Modul 26–30.

1. Node 1 diperbarui dari 1.7.1 ke 1.7.3. (a) Kenapa ia harus membuktikan diri dalam 60 detik, padahal SHA-256-nya cocok? (b) 1.7.3 tersambung ke broker, tetapi suhunya selalu 0. Apakah Node 1 kembali sendiri ke 1.7.1?
2. `update` ke 1.7.3 terkirim dengan tanda *retained*, dan 1.7.3 gagal di masa uji. (a) Apa yang terjadi sesudah *rollback*? (b) Kenapa `config` justru boleh *retained*?
3. Temanmu menaruh `node-1-rumah.ino.bin` di folder web yang bisa diunduh siapa saja. (a) Apa yang bocor, dan penjaga apa yang hilang dibanding rute `/fw`? (b) Apa yang dijamin `sha256` di perintah `update`, dan apa yang tidak?
4. Temanmu memasang 1.7.0 lewat kabel sebelum Praktik 2. (a) Apa yang terjadi di backend 1.4.0? (b) Kenapa urutan sebaliknya aman untuk Node 1 1.6.0?
5. Sehari sesudah Praktik 12, kartu Node 1 menulis **Menyala ulang karena** `BROWNOUT` dan **Lama menyala** `3 jam 12 menit`. (a) Apa artinya, dan kenapa dulu tidak terlihat dari jauh? (b) Apa yang kamu periksa, dan bagaimana K1 e?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) SHA-256 hanya membuktikan berkasnya utuh, bukan programnya bekerja di papanmu. Kunci broker yang salah membuat Node 1 tak terjangkau: perangkat di atap harus didatangi. Maka dalam 60 detik kuncinya harus diterima broker, lalu `online` dan langganan `cmd` dikirim; kalau tidak, papan kembali ke rak lama. (b) Tidak: yang dijaga hanya "masih bisa tersambung dan terbit". Node 1 tetap terjangkau, jadi perbaiki dengan 1.7.4 lewat udara ([Konsep 4](#4-rollback-yang-benar-benar-bekerja-masa-uji-60-detik-dan-extern-c)).
2. (a) Broker menyerahkannya lagi setiap kali Node 1 berlangganan `cmd`; ingatan `id` hilang saat menyala ulang (aturan 8) dan versinya berbeda, jadi unduh, gagal, dan *rollback* berulang tanpa henti, dengan pompa padam setiap kali. (b) `config` adalah keadaan, hasilnya sama walau diterapkan berulang; `update` tindakan sekali jalan yang diakhiri menyala ulang ([Konsep 3](#3-http-ota-langkah-demi-langkah-dari-perintah-update-sampai-masa-uji)).
3. (a) Kunci ESP-NOW dan sandi portal (bila dipakai) serta jalur folder komputernya terbaca dengan `strings`. Rute `/fw` hanya melayani perangkat terdaftar yang aktif (`device_id:kunci` dan `x-ESP32-STA-MAC`; dinonaktifkan `403`). (b) Utuh: beda satu bait ditolak (`Update 15`) sebelum catatan rak berganti. Bukan tanda tangan: tidak membuktikan siapa pembuatnya ([Konsep 6](#6-siapa-boleh-memberi-firmware-kunci-sidik-jari-dan-https)).
4. (a) Seluruh `vitals`-nya ditolak (lab penulis, simulator: `Kunci tidak dikenali s: "reset_reason", "fw"`): kesehatan dan laporan pembaruan hilang; rute `/fw` dan layar **Armada** pun belum ada. (b) Backend 1.5.0 cocok mundur: `vitals` 1.6.0 tetap diterima, dan migrasi 011 hanya menambah ([Praktik 2](#praktik-2--kontrak-16-backend-150-migrasi-011-dan-broker-pusat-dengan-dynamic-security-30-menit)).
5. (a) Tegangan ESP32 sempat anjlok sampai chip menyala ulang; tanpa `reset_reason` di `vitals`, kejadian itu hanya terlihat di Serial Monitor. Kuning = catu daya, bukan firmware ([Konsep 9](#9-konfigurasi-jarak-jauh-dan-kesehatan-perangkat-jeda-vitals-dan-reset_reason)). (b) Aturan emas: relay, pompa, dan servo dari MB102, tidak pernah dari pin ESP32, dengan GND bersama; *charger* ≥ 1 A berkabel pendek; terminal kendur. K1 e belum lulus: betulkan, lalu ulangi 24 jam ([13.2](#132--k1-e-24-jam-menyala-tanpa-brownout-panic-atau-wdt-5-menit)).

</details>

---

## ✅ Checklist kelulusan Modul 28

Syarat lulus dari [Silabus](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak): "Node 1 ter-update ke versi baru tanpa kabel dan versinya tampil di `/armada`, firmware yang sengaja salah otomatis kembali ke versi lama, dan Node 1 terpasang rapi di kotak dengan catu daya sendiri." Pecahannya **O0** (prasyarat), **O1**, **O2**, **K1**, dan praktik wajib **P1**. Unduhan firmware: jalur utama HTTPS dari VPS, jalur gratis `http://192.168.1.37`, tanpa Pi `http://192.168.1.10` (laptop jangan tidur). Tanpa Kit dan Wokwi belum lulus penuh sampai papan datang.

> [!NOTE]
> **Firmware 1.7.0 dikompilasi penulis, belum dijalankan di papan**, dan penulis belum memegang kotak atau solder; perangkat di kotak Hasilnya = simulator ([📚](#-sumber--atribusi-gambar)). Centang hanya yang terjadi padamu; jalur tanpa Kit dan Wokwi menulis "tiruan" atau "belum" (➕ F, *pull request*).

- [ ] **O0** Node 1 1.7.0 lewat kabel sekali; `ota` menulis `app0 (UNDEFINED, dipasang lewat kabel)`; kartu `1.7.0` dengan **Menyala ulang karena** terisi ([5.4](#54--o0-serial-ota-dan-server-lalu-kartu-node-1-versi-170-dengan-reset_reason-5-menit)). Tanpa Kit: tiruan (4.2).
- [ ] **O1** Kabel USB tidak di laptop; *canary* → **Perbarui** → `berhenti sengaja` → `Online` `1.7.1`, `SW`, riwayat `1.7.0 → 1.7.1 berhasil` ([7.5](#75--o1-versi-171-reset_reason-sw-dan-riwayat-berhasil-tanpa-kabel-5-menit)). Tanpa Kit: tiruan.
- [ ] **O2** Rilis uji 1.7.2 ditolak broker; tanpa disentuh, kartu `Online` lagi dengan `1.7.1` dan `kembali ke versi lama (rollback)` ([8.3](#83--o2-node-1-kembali-sendiri-ke-171-sesudah-masa-uji-60-detik-10-menit)). Tanpa Kit: tiruan.
- [ ] **K1** (a) foto sebelum–sesudah dari sudut sama (13.1); (b) uji tarik pelan; (c) label `device_id`, nama, kabel daya, sandi portal; (d) catu daya Modul 9, beban dari MB102, GND bersama, tanpa laptop dan tanpa 220 V di kotak ([12.9](#129--k1-ad-label-tutup-kotak-lalu-node-1-online-lagi-5-menit)); (e) **Lama menyala** minimal `1 hari 0 jam` tanpa `BROWNOUT`, `PANIC`, atau `WDT` ([13.2](#132--k1-e-24-jam-menyala-tanpa-brownout-panic-atau-wdt-5-menit)). Tanpa Kit dan Wokwi: rencana kotak, belum.
- [ ] **P1** Papan ketiga kosong → portal → `Online` di **Armada** paling lama 60 detik sejak **Save** ([10.4](#104--p1-kartu-baru-online-di-armada-dalam-60-detik-sejak-save-6-menit)). Tanpa papan ketiga: simulator (tiruan). Wokwi: `klaim` lewat Serial Monitor, tidak `Online` di **Armada**.
- [ ] Pemanasan dan Kemenangan Cepat: foto "sebelum"; `app0` → `app1` → `app0`.
- [ ] ⭐ Cabang `fitur/armada`, sidik jari, cadangan di `backup/`, catatan perangkat dan akun lama (Praktik 1).
- [ ] ⭐ `203 passed (203)`, `config --quiet` tanpa keluaran, migrasi 011 dan `Plugin dynamic-security loaded.`, `"ota_siap": true`, `vitals` 1.6.0 tetap diterima (Praktik 2).
- [ ] ⭐ Gerbang memuat plugin (jalur dengan Pi); perangkat latihan `201` dan `createClient`; akun perangkat hanya membaca `cmd`-nya; akun lama dipindah; cadangan akun (Praktik 3).
- [ ] ⭐ `PWA v2.0.0`, dua `SAMA`, web `1.4.0`; perangkat tiruan `online (firmware 1.7.0)`; kartu setiap perangkat di **Armada** (Praktik 4).
- [ ] ⭐ (butuh papan) esp32 3.3.12 dan setelan Modul 10, `extern "C"` utuh, `SANDI_PORTAL` tidak di Git, `Sketch uses` sekitar 71 %, O0 (Praktik 5).
- [ ] ⭐ `konfigurasi.h` 1.7.1; SHA-256 `node-1-rumah.ino.bin` sama dengan kotak hijau; 1.7.1 `terbaru` (Praktik 6; tanpa Kit: berkas tiruan).
- [ ] ⭐ Node 1 hanya dari *charger*, lencana `canary`, O1 (Praktik 7).
- [ ] ⭐ 1.7.2 berlencana `uji`; `UJI_KUNCI_SALAH = 0` lagi (`git diff --stat` kosong); O2; laporan `rollback` lolos pemeriksa (Praktik 8).
- [ ] **Perbarui semua** sesudah *canary* berhasil; yang terputus dilewati (Praktik 9, opsional).
- [ ] ⭐ Kode klaim tampil sekali (`berlaku` → `dipakai`); papan ketiga 1.7.0; portal bersandi, alamat server = `ALAMAT_SERVER`; P1 (Praktik 10).
- [ ] ⭐ `vitals dikirim setiap 60 detik (diatur admin)`; *silence* dulu; `nonaktif` dan `deleteClient`; status lama dan `503` dipahami (Praktik 11).
- [ ] ⭐ (butuh papan) papan ekspansi cocok, daya dicabut, rencana tata letak, pindah per kelompok, dua kabel daya berlabel dengan GND bersama, multimeter, uji tarik, label: K1 a–d (Praktik 12).
- [ ] ⭐ (butuh papan) foto "sesudah" dan K1 e (Praktik 13).
- [ ] Keamanan: tanpa `*.bin`, `build/`, kode klaim, sandi plugin, atau isi lemari broker di Git; `UJI_KUNCI_SALAH = 0` di setiap *commit*; portal bersandi; akun lama Modul 21 di-`-D`; jalur gratis: pintu perangkat 8081; cadangan akun broker tersimpan.
- [ ] Proyek cocok dengan `kode/`; README, `.env.example`, templat *pull request*, dan catatan belajar diperbarui (➕ A–D, F).
- [ ] ⭐ *Pull request* "Armada: OTA, rollback, klaim, dan kotak" digabung ke `main` tanpa rahasia di **Files changed**; setiap mesin `git pull` ([➕ E](#e--gabungkan-fiturarmada-ke-main-lewat-pull-request-armada-ota-rollback-klaim-dan-kotak)).

**Rumah Pintar Mini kini bisa diperbarui tanpa kabel, mendaftarkan perangkat baru sendiri, dan siap dipasang di banyak lokasi.** Batasnya: Node 2 tetap lewat kabel, *image* server masih dipasang lewat SSH tanpa uji otomatis, dan pemantau layanan serta cadangan otomatis menyusul di Modul 30.

> ➡️ **Modul berikutnya:** Modul 29 — Testing & CI/CD: Setiap Perubahan Diuji dan Dipasang Otomatis (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis)). Setiap perubahan kode diuji otomatis, dibungkus menjadi *image*, dan dipasang ke VPS dan Pi tanpa kamu SSH; Pi memperbarui *image*-nya sendiri.

## 📚 Sumber & atribusi gambar

**Sumber resmi** (dibaca 30 Oktober–3 November 2026):

- **Arduino-ESP32 3.3.12** (di bawahnya ESP-IDF v5.5.5): [catatan rilis](https://github.com/espressif/arduino-esp32/releases/tag/3.3.12) (`setSHA256sum()`, `useBuiltinCACertBundle()`), [`HTTPUpdate.cpp`](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/HTTPUpdate/src/HTTPUpdate.cpp) (kode galat), [library `Update`](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/Update/README.md), [`esp32-hal-misc.c`](https://github.com/espressif/arduino-esp32/blob/3.3.12/cores/esp32/esp32-hal-misc.c) (`verifyRollbackLater()` bawaan `false`), [`min_spiffs.csv`](https://github.com/espressif/arduino-esp32/blob/3.3.12/tools/partitions/min_spiffs.csv), [NetworkClientSecure](https://github.com/espressif/arduino-esp32/blob/master/libraries/NetworkClientSecure/README.md), contoh resmi [`httpUpdateSecure.ino`](https://github.com/espressif/arduino-esp32/blob/3.3.12/libraries/HTTPUpdate/examples/httpUpdateSecure/httpUpdateSecure.ino) (sertifikat perantara kedaluwarsa 2021), [setelan pembuat library](https://github.com/espressif/esp32-arduino-lib-builder/blob/master/configs/defconfig.common) (*rollback* di pembuka rak).
- **ESP-IDF**: [OTA dan *app rollback* v5.5](https://docs.espressif.com/projects/esp-idf/en/release-v5.5/esp32/api-reference/system/ota.html) (`esp_ota_ops`), [Secure Boot V2](https://docs.espressif.com/projects/esp-idf/en/release-v5.5/esp32/security/secure-boot-v2.html) dan [migrasi 6.2](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/migration-guides/release-6.x/6.2/system.html) (keduanya 🔬).
- **Library Node 1**: [WiFiManager](https://github.com/tzapu/WiFiManager/releases) 2.0.17 (MIT; bahan ilustrasi portal), [PubSubClient3 3.3.2](https://github.com/hmueller01/pubsubclient3/tree/v3.3.2), [ArduinoJson 7](https://arduinojson.org/v7/) (7.4.3).
- **Server dan protokol**: Mosquitto 2.1.2 [*dynamic security*](https://mosquitto.org/documentation/dynamic-security/) dan [`mosquitto.conf(5)`](https://mosquitto.org/man/mosquitto-conf-5.html); Caddy 2.11.7 [`handle`](https://caddyserver.com/docs/caddyfile/directives/handle) dan [`encode`](https://caddyserver.com/docs/caddyfile/directives/encode); [SemVer 2.0.0](https://semver.org/); [MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) (DISCONNECT tanpa wasiat, *retained*); AWS IoT [*provisioning by claim*](https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html) (padanan kode klaim).
- **Perangkat keras dan keselamatan**: Espressif [*hardware design guidelines* ESP32](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32/schematic-checklist.html) (🔬 WROOM); SparkFun [*How to Solder: Through-Hole Soldering*](https://learn.sparkfun.com/tutorials/how-to-solder-through-hole-soldering/all) (CC BY-SA 4.0; pengganti "video" Silabus, videonya di halaman itu); HSE [INDG249](https://www.hse.gov.uk/pubns/indg249.pdf) (asap *flux*); Bosch Sensortec [BST-BME280-HS006](https://www.bosch-sensortec.com/media/boschsensortec/downloads/handling_soldering_mounting_instructions/bst-bme280-hs006.pdf) (panas di dekat sensor); Wikipedia [IP code](https://en.wikipedia.org/wiki/IP_code) dan [*Screw terminal*](https://en.wikipedia.org/wiki/Screw_terminal) (sekunder). Syarat lulus dan amandemennya: [Silabus §7 Modul 28](../../SILABUS.md#modul-28--ota-update-provisioning-fleet--dari-breadboard-ke-kotak) (v1.0.30).

**Gambar.** Rincian per berkas: [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| 8 diagram (`dua-rak-otadata` … `tata-letak-kotak`) | Diagram orisinal dari `kode/`, sumber di atas, kompilasi penulis, dan lab tiruan; `tata-letak-kotak` = **rekonstruksi** dari `PETA-PIN.md` versi 7 dan Modul 5–9 (kotak, papan ekspansi, dan kabel tidak dipotret atau diukur). | CC BY 4.0 (`.svg` di `aset/`) |
| 5 komposit (`armada-di-hp` … `nonaktifkan-perangkat`) | Tangkapan asli Chrome 156 tanpa layar, 2 Nov 2026, dari "VPS" dan CA tiruan (1280 px; 375 px = mode perangkat Chrome, **bukan HP**). Perangkat = simulator; berkas 1.7.1 = firmware asli yang hanya diperiksa, rilis uji 1.7.2 = berkas tiruan; kode klaim disamarkan sebelum ditangkap. | React, Tailwind CSS, Socket.IO (MIT) dan Caddy (Apache-2.0) tampil apa adanya untuk tujuan pendidikan; judul, nomor, keterangan CC BY 4.0 |
| `portal-kode-klaim` | **Ilustrasi**, bukan tangkapan HP atau ESP32: HTML, CSS, dan teks asli WiFiManager 2.0.17 dengan setelan firmware 1.7.0, dirender Chrome (Noto Sans pengganti Verdana). | isi halaman MIT (© tzapu); susunan CC BY 4.0 |
| 3 foto (`foto-perfboard`, `foto-sambungan-solder`, `foto-terminal-ferrule`) | Wikimedia Commons: Retired electrician; MJN123 dan Coronium (dua potongan berdampingan, tanda oleh penulis); Simon A. Eugster. Hanya dipotong, diubah ukurannya, dan dibuang metadatanya; bukan buatan AI. | lisensi aslinya: CC0 1.0; CC BY 3.0 + CC BY-SA 3.0 (gabungan CC BY-SA 3.0); CC BY-SA 3.0 |

Foto papan ekspansi terminal sekrup berlisensi bebas belum ditemukan (dicari 2 November 2026). Penulis tidak memegang barangnya: foto kotakmu (tanpa `device_id`, sandi portal, dan isi rumah) dan angka papanmu boleh disumbangkan lewat *issue* ([Kontribusi](../../README.md#kontribusi)).

**Tentang kotak Hasilnya.** "Lab penulis" umumnya **lab akhir**, 2 November 2026 ±14.55–17.20 WIB, pada `kode/` persis, di **Raspberry Pi 5 16 GB dengan Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3 dan Compose 2.40.3 (paket Ubuntu), Node.js 24.21.0, Chrome 156 tanpa layar. Label lain: **uji host** (g++ 15.2.0, pembuka rak tiruan), **kompilasi** (2 November; `arduino-cli` 1.5.1, bukan Arduino IDE; paket esp32 3.3.12, 10 library versi persis, setelan Modul 10 dengan Flash Mode DIO; di Arduino IDE-mu angkanya boleh beda beberapa ratus byte), dan **teks dari kode** (kalimat kode sumber, bukan rekaman papan). Beberapa kalimat berasal dari lab kode 31 Oktober (kode sebelum dibekukan), misalnya perintah `update` palsu atas nama `nodered` dan akun lama Modul 21 sesudah **Nonaktifkan**.

Mesin itu memerankan laptop, Pi, VPS, HP, internet, dan semua perangkat ([🔬](#-bedah-teknis-opsional)): lorong Docker = internet, Pebble 2.10.1 = Let's Encrypt, pebble-challtestsrv = DNS, `docker network disconnect` = internet rumah dicabut. Perangkat = simulator `alat/` (di Praktik 9: 22 perangkat tiruan diperbarui sekaligus; akar Pebble menggantikan daftar akar ESP32). Berkas 1.7.1 = firmware asli kompilasi penulis yang hanya diunggah, diunduh, dan diperiksa; rilis uji 1.7.2 dan rilis latihan sesudahnya = berkas tiruan dari `alat/buat-bin-tiruan.js`.

| Rekaman lab | Ditulis di naskah |
| :--- | :--- |
| `iot.contoh.test`, `mqtt.contoh.test` | `iot.namaanda.my.id`, `mqtt.namaanda.my.id` |
| IP "VPS" `10.28.20.10`; rumah di "internet" `10.28.20.20` | `203.0.113.10`; `198.51.100.20` (blok alamat dokumentasi) |
| loket lab 63xx: gerbang, backend, database, Grafana | `192.168.1.37:1883`, `8080`, `5432`, `3000` |
| nama proyek, kontainer, lemari, image lab | `rumahpintar…`, `rumahpintar-gerbang…`, `ghcr.io/<akun>` |
| jalur mesin; repo git lokal | `/home/kamu/…`, `/home/rumah/…`; `https://github.com/<akun>/rumah-pintar-mini.git` |
| perangkat tiruan `f00d00000001` "Latihan ruang tamu" | Node 1-mu (`device_id`-mu berbeda) |

Penggantian hanya pada baris yang selain itu sama persis; loket 8080 mesin penulis dipakai program lain. Jalur gratis dan tanpa Pi diuji di mesin yang sama: "IP Pi" dan "IP laptop" = alamat `docker0`, bukan WiFi rumah, tanpa Cloudflare Tunnel. Khusus lab: `OTA_BATAS_MENIT=3` (bawaan 10), `acl-broker` gerbang + 3 baris Kebun tiruan (tanpa Node 2 sungguhan), *silence* Grafana lewat API-nya, Telegram = server Bot API tiruan (token palsu; kotak pesannya = teks yang diterima tiruan itu), GitHub = repo git lokal.

Jam ditulis WIB: jam mesin penulis WITA (WIB + 1 jam) di terminal ditulis ulang; log backend sudah WIB (`TZ` di Compose); log Caddy, Grafana, dan Pebble UTC (+7 jam); Mosquitto mencetak angka detik. Angka waktu = simulator di satu mesin, bukan ESP32 lewat WiFi; ukuran firmware asli dan angka sensor = **contoh**; sinyal dan RAM perangkat tiruan = acak. Sandi, kunci, dan kode klaim tidak pernah tampil (pindai rahasia: 0 tempat).

Yang **tidak** diuji: ESP32 sungguhan (Serial Monitor, OLED, OTA lewat WiFi dan lamanya, *rollback* dan *watchdog* nyata, `reset_reason`), Arduino IDE (menu dan port jaringan), papan ketiga dan portal di HP, Node 2 (tidak dikompilasi ulang), papan ekspansi, kotak, solder, multimeter, catu daya di kotak 24 jam, Wokwi, QEMU, VPS, router, domain, Let's Encrypt produksi, Cloudflare Tunnel, Telegram sungguhan, MQTTX, aplikasi Bruno, *pull request* GitHub, Windows, macOS, dan PowerShell.

Yang **belum terbukti** saat terbit: *watchdog* 60 detik selama unduhan nyata; memori dan lama jabat tangan HTTPS di ESP32 bersama WiFi dan ESP-NOW; tiga kolom portal di papan dan portal yang ditunda selama masa uji; port jaringan Arduino IDE 2.3.10 untuk Kemenangan Cepat; catatan rak di Wokwi; paket ESP-NOW Node 2 yang tiba saat Node 1 mengunduh; 100 perangkat (yang diukur 22 tiruan); 24 jam di kotak, termasuk panas DHT22; harga dan kecocokan papan ekspansi, kotak, dan ferrule; Kemenangan Cepat dan kunci 🧩 Tingkat 1 di papan. Sudah tertutup: ukuran 1.7.x muat satu rak dan `extern "C"` menimpa (kompilasi), serta ketiga kunci 🧩 (kompilasi, uji, lab). Saat naskah ini ditulis (November 2026), firmware dikompilasi penulis, belum dijalankan di papan.

---

[⬅️ Modul 27](../modul-27-deploy-internet-tls-pwa/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 29 — Testing & CI/CD: Setiap Perubahan Diuji dan Dipasang Otomatis** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis))
