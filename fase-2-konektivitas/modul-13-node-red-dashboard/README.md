# Modul 13 — Node-RED & Dashboard 2: Dashboard Pertama Tanpa Koding

🌐 **Bahasa Indonesia** · [English](../../en/phase-2-connectivity/module-13-node-red-dashboard/README.md)

*Fase 2 · Minggu 13 · Perangkat keras (*hardware*): **Kit B** — gateway Raspberry Pi dari Modul 12, Node 1 v1.2.1, dan HP yang tersambung ke WiFi rumah, atau **jalur laptop** tanpa Pi · Prasyarat: **Modul 12** (gateway dan broker Mosquitto) dan **Modul 11** (kontrak data) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 12](../modul-12-raspberry-pi-dan-linux/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 14 ➡️](../modul-14-node-2-esp-now/README.md)

---

Di Modul 12, Rumah Pintar Mini mendapat **gateway** yang menyala 24 jam: Raspberry Pi bernama `gateway` dengan broker Mosquitto di dalamnya. Node 1 melapor ke sana setiap 10 detik, dan kamu bisa mengintip lalu lintasnya dengan MQTTX. Namun, coba tunjukkan MQTTX kepada orang serumah: deretan JSON seperti `{"ts":"2026-10-18T01:30:12Z","fw":"1.2.1","suhu":28.5,…}` hanya dimengerti teknisi, dan menyalakan kipas berarti mengetik perintah JSON dengan `id` baru. Minggu ini gateway mendapat **wajah** dan **otak** pertamanya: **Node-RED**.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Bacaan Node 1 hanya terlihat sebagai JSON di MQTTX atau Serial Monitor. | Belum ada tampilan yang ramah manusia. | **Dashboard** di HP: jarum, tangki air, grafik, dan teks (Konsep 5, Praktik 3–4) |
| Menyalakan kipas berarti mengetik perintah JSON di MQTTX, lengkap dengan `id` baru. | Perintah masih dikirim dengan tangan. | **Sakelar dan tombol** di dashboard yang membuat perintah sesuai kontrak data (Konsep 6, Praktik 5) |
| Kipas tidak pernah menyala sendiri saat ruangan panas. | Node 1 baru punya aturan siram dan lampu; aturan kipasnya baru datang di Modul 19. | **Otomasi kipas** di gateway, lengkap dengan histeresis supaya tidak nyala-mati terus (Konsep 7, Praktik 6) |
| Setiap perubahan aturan berarti menulis dan mengunggah program baru. | Semua logika ada di dalam kode. | **Node-RED**: alur data (*flow*) yang disusun dengan menyeret dan menyambung kotak (*node*), lalu diterapkan dengan satu klik (Konsep 1–4, Praktik 1–2) |
| Kalau kartu microSD gateway rusak, semua tampilan dan aturan ikut hilang. | Belum tersimpan di repositori. | **Flow diekspor** ke `edge/node-red-flows.json` dan resep gateway diperbarui (Konsep 8, Praktik 7) |

Di akhir minggu, Rumah Pintar Mini punya **dashboard v0**: satu halaman di HP yang menampilkan kelima sensor Node 1, sakelar lampu dan kipas, tombol siram, dan penggeser tirai, ditambah **otomasi kipas** yang berjalan 24 jam di gateway. Semuanya dibuat dengan **Node-RED**, alat *low-code* (sedikit kode) yang dipasang di Raspberry Pi yang sama dengan broker. **Node 1 tidak berubah**: ia tetap v1.2.1 dan tetap berbicara sesuai kontrak data Modul 11. Itulah keuntungan kontrak: pendengar baru boleh datang tanpa mengubah perangkatnya.

![Peta jalan Modul 13. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 2 Konektivitas, Modul 10 sampai 15, disorot. Modul 1 sampai 12 bertanda selesai, dan Modul 13 ditandai KAMU DI SINI dengan catatan: gateway mendapat wajah (dashboard di HP) dan otak pertama (otomasi kipas). Bawah, kotak Modul 13 minggu ini, 8 sampai 10 jam dicicil, Kit B: gateway Pi dari Modul 12, Node 1, HP; ⭐ berarti wajib untuk lulus. Kiri: KC, Kemenangan Cepat, Node-RED mendengar Node 1; P1 tur editor dan flow pertama; P2 layanan dan mendengar Node 1; P3 Dashboard 2 dan jarum suhu ⭐; P4 panel sensor lengkap. Kanan: P5 kendali dari HP ⭐; P6 otomasi kipas berhisteresis ⭐; P7 simpan flow ke repositori ⭐; P8 jalur laptop, Node-RED di laptop; tambahan: dashboard v0 berjalan 24 jam ⭐. Catatan di bawah: tanpa Raspberry Pi, Praktik 8 memasang Node-RED di laptop, praktik lain memakai alamat laptop, dan uji 24 jam dilewati.](aset/peta-jalan-modul-13.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Node-RED berjalan di Pi, tetapi kamu memakainya dari browser laptop.** Editornya dibuka di `http://192.168.1.37:1880`, dan dashboard-nya di `http://192.168.1.37:1880/dashboard`, baik dari laptop maupun dari HP. Hanya pemasangan dan perawatan yang memakai terminal SSH ke Pi, seperti Modul 12.
> - **Setiap kotak perintah disertai keterangan tempatnya:** **di Pi** (terminal SSH, *prompt* `budi@gateway:~ $`), **di laptop**, atau **di editor Node-RED** (browser). Alamat `192.168.1.37`, pengguna `budi`, dan `device_id` `a4cf12e5b7c0` hanya contoh; pakai milikmu sendiri (catatanmu dari Modul 11–12).
> - **Gambar editor dan dashboard di modul ini adalah tangkapan layar asli** Node-RED 5.0.8 dan Dashboard 2 versi 1.33.0. Kotak **Hasilnya** dari terminal Pi tetap bertanda **contoh**, seperti Modul 12; angka, tanggal, dan nomor versi di layarmu bisa berbeda.
> - **Belum punya Raspberry Pi?** Ikuti **jalur laptop**: Node-RED dipasang di laptop (Praktik 8) dan memakai broker Mosquitto dari Praktik 7 Modul 12. Belum punya Node 1 sungguhan? Node 1 di Wokwi memakai broker publik `broker.emqx.io`; Node-RED di laptopmu bisa mendengarkannya juga (Praktik 8). **Punya Pi, tetapi Node 1-mu masih di Wokwi?** Pasang Node-RED di Pi seperti biasa; alamat editor dan dashboard tetap alamat Pi. Node 1 Wokwi memang tidak pernah tersambung ke broker di Pi (Modul 12), jadi pakai kolom Wokwi di [tabel 8.2](#82-sesuaikan-alamat-di-semua-langkah) untuk tiga hal: **Server** broker `broker.emqx.io`, sambungan MQTTX **Broker publik**, dan pemeriksa kontrak dengan `broker.emqx.io`. Uji tanpa laptop (➕ B) baru bisa dibuktikan setelah papanmu ada. Kriteria lulusnya ada di ✅.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di browser dan di editor Node-RED, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Editor Node-RED adalah pintu penuh ke Pi.** Siapa pun yang bisa membukanya bisa membuat flow yang menjalankan perintah apa saja di Pi. Karena itu, editor kita **diberi kata sandi** sejak dipasang (Kemenangan Cepat), dan pintu 1880 **tidak pernah** dibuka ke internet lewat *port forwarding*.
> 2. **Dashboard belum dijaga kata sandi.** Siapa pun yang tersambung ke WiFi rumahmu bisa membuka dashboard dan menekan sakelarnya, sama seperti broker tanpa kata sandi di Modul 11–12. Gemboknya dipasang di Modul 21.
> 3. **Otomasi menggerakkan relay sungguhan.** Sebelum menerapkan (*deploy*) flow otomasi, pastikan relay hanya menggerakkan beban bertegangan rendah dari kit (kipas 5 V), seperti aturan sejak Modul 5. Kurikulum ini tidak pernah menyambungkan relay ke listrik 220 V.
> 4. **Perintah `set` tidak pernah *retained*.** Di node pengirim MQTT, pilih **Retain** `false`, sesuai aturan kontrak data Modul 11.
> 5. **Kata sandi dan *passphrase* (kalimat sandi) tidak masuk repositori.** Flow yang diekspor dari Node-RED tidak membawa kata sandi, tetapi berkas `settings.js` dan `flows_cred.json` di Pi jangan pernah disalin ke GitHub.

Ritme modul ini sama dengan Modul 1–12. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: Node-RED mendengar Node 1 (40 menit)](#-kemenangan-cepat-node-red-mendengar-node-1-40-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Low-code](#1-low-code-menyusun-program-dengan-kotak-dan-kabel) · [2 Flow, node, msg](#2-flow-node-dan-msg-barang-yang-berjalan-di-ban) · [3 Node-RED di gateway](#3-node-red-di-gateway-layanan-berkas-dan-kata-sandi) · [4 MQTT di Node-RED](#4-mqtt-di-node-red-satu-sambungan-banyak-pendengar) · [5 Dashboard 2](#5-dashboard-2-halaman-grup-dan-widget) · [6 Mengubah pesan](#6-mengubah-pesan-change-switch-dan-perintah-ber-id) · [7 Otomasi & histeresis](#7-otomasi-dan-histeresis-kipas-yang-tidak-gelisah) · [8 Menyimpan flow](#8-menyimpan-flow-ekspor-impor-dan-keamanan)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Tur editor](#praktik-1--tur-editor-dan-flow-pertama-25-menit) · [2 Layanan & Node 1](#praktik-2--node-red-sebagai-layanan-dan-mendengar-node-1-30-menit) · [3 Dashboard & jarum suhu](#praktik-3--dashboard-2-dan-jarum-suhu-pertama-30-menit) · [4 Panel sensor](#praktik-4--panel-sensor-lengkap-30-menit) · [5 Kendali dari HP](#praktik-5--kendali-dari-hp-40-menit) · [6 Otomasi kipas](#praktik-6--otomasi-kipas-berhisteresis-30-menit) · [7 Simpan flow](#praktik-7--simpan-flow-ke-repositori-20-menit) · [8 Jalur laptop](#praktik-8--jalur-laptop-node-red-di-laptop-30-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-13)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

---

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan apa itu *low-code*** (sedikit kode), kapan Node-RED sudah cukup, dan mengapa di Modul 16 "otak" proyek pindah ke *backend*.
2. **Memasang Node-RED di gateway Pi sebagai layanan** yang menyala sendiri setiap kali Pi menyala, lengkap dengan kata sandi editor.
3. **Menyusun flow**: menaruh node, menyambung kabel, membaca `msg.payload`, menekan **Deploy**, dan memakai node debug sebagai kaca pembesar.
4. **Mendengar dan mengirim MQTT dari Node-RED** sesuai kontrak data, termasuk perintah ber-`id` unik yang tidak *retained*.
5. **Membuat dashboard yang dibuka dari HP** dengan Dashboard 2: jarum ukur, tangki, grafik, teks, sakelar, tombol, dan penggeser.
6. **Membuat otomasi kipas berhisteresis**: kipas menyala di atas 30 °C dan baru padam di bawah 28 °C, tanpa nyala-mati terus.
7. **Menyimpan flow ke repositori** dan memasangnya kembali (ekspor dan impor), tanpa ikut menyimpan kata sandi.

## 🧰 Yang perlu disiapkan

| Barang | Keterangan |
| :--- | :--- |
| **Gateway Raspberry Pi dari Modul 12** | Menyala dengan alamat tetap (contoh: `192.168.1.37`), Mosquitto `active (running)`, dan bisa dimasuki lewat SSH. Pemasangan Node-RED butuh internet; unduhannya sekitar 100 MB. |
| **Node 1 v1.2.1** | Hidup dari *charger*-nya dan tersambung ke broker gateway (➕ Modul 12). Tidak ada perubahan firmware minggu ini. |
| **Laptop** | Browser (Chrome, Edge, Firefox, atau Safari) untuk editor Node-RED, terminal untuk SSH, **MQTTX**, **VS Code** dengan folder `rumah-pintar-mini`, dan **GitHub Desktop**. |
| **HP** | Tersambung ke WiFi rumah yang **sama** dengan Pi, untuk membuka dashboard. Browser apa pun. |
| **Tempat menyimpan kata sandi** | Pengelola kata sandi atau buku catatan pribadi, untuk kata sandi editor Node-RED dan *passphrase*-nya. Bukan repositori, bukan catatan modul. |
| **Jalur laptop** (tanpa Pi) | Node.js 24 dari Modul 4 dan Mosquitto sebagai layanan dari Praktik 7 Modul 12. Tanpa Node 1 sungguhan: Node 1 di Wokwi dengan broker publik, seperti Modul 11. |

Versi yang dipakai modul ini (Oktober 2026): **Node-RED 5.0.8**, Node.js 24 (dipasang oleh skrip pemasang Node-RED), dan **Dashboard 2** (`@flowfuse/node-red-dashboard`) **1.33.0**. Dashboard lama (`node-red-dashboard`, sering disebut "Dashboard 1") sudah tidak dirawat sejak Juni 2024; jangan memasangnya walaupun masih banyak dipakai tutorial lama.

---

## 🏆 Kemenangan Cepat: Node-RED mendengar Node 1 (40 menit)

Targetnya: Node-RED terpasang di gateway sebagai layanan, editornya terbuka di browser laptop, dan flow pertamamu menampilkan pesan `telemetry` Node 1 setiap 10 detik. Dua puluh menit pertama dipakai skrip pemasang; sisanya milikmu.

> 🖥️ **Belum punya Raspberry Pi?** Lewati langkah 1. Kerjakan dulu [Praktik 8.1–8.3](#81-pasang-node-red) untuk memasang Node-RED di laptop dan membukanya untuk HP, lalu lanjutkan dari langkah 2 dengan alamat editor `http://localhost:1880` dan broker dari tabel 8.2. **Punya Pi, tetapi Node 1-mu masih di Wokwi?** Kerjakan semua langkah di Pi seperti biasa, hanya saja di langkah 3 isi **Server** dengan `broker.emqx.io`, dan di **Topic** ganti `a4cf12e5b7c0` dengan `device_id` Node 1 Wokwi-mu.

### Langkah 1 — Pasang Node-RED di Pi

1. **Di laptop**, buka terminal (seperti Modul 12) dan masuk ke Pi:

   ```bash
   ssh budi@192.168.1.37
   ```

2. **Di Pi**, jalankan skrip pemasang resmi Node-RED. Ketik persis satu baris ini, **tanpa** `sudo` di depannya (skrip meminta wewenang `sudo` sendiri saat perlu):

   ```bash
   bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
   ```

   Perintah ini mengunduh skrip pemasang dari GitHub, lalu menjalankannya. Skrip memasang **Node.js 24**, Node-RED, dan layanan systemd bernama `nodered`. Tutorial lama memakai alamat yang berakhiran `update-nodejs-and-nodered-deb`; alamat itu sudah mati sejak Juni 2026 (🚨).
3. Skrip menampilkan salam pembukanya, lalu meminta kata sandi untuk `sudo` (`[sudo] password for budi:`). Ketik kata sandi Pi (tidak terlihat), lalu tekan **Enter**. Sesudah itu, muncul dua pertanyaan, dan masing-masing **hanya menunggu sebentar**:
   - `Are you really sure you want to do this ? [y/N] ? ` — ketik `y`, lalu tekan **Enter** dalam **30 detik**. Kalau terlambat, skrip berhenti tanpa pesan apa pun; jalankan saja perintah langkah 2 lagi.
   - `Would you like to install the Pi-specific nodes ? [y/N] ? ` — ketik `n`, lalu tekan **Enter** (15 detik). Node khusus Pi itu untuk kaki GPIO Pi, dan proyek kita tidak memakainya (🔬 Modul 12).
4. Layar dibersihkan, lalu daftar centang muncul satu per satu. Tunggu 10–20 menit sampai `All done.` muncul. **Hasilnya** (contoh, di Pi 5):

   ```text
   Running Node-RED install for user budi at /home/budi on debian

     Will try to install Node.js 24
     Install Node.js                     ✔   v24.22.0 : Npm 11.19.1
     Remove old version of Node-RED      ✔
     Clean npm cache                     ✔
     Install Node-RED core               ✔   5.0.8
     Npm rebuild existing nodes          ✔
     Add shortcut commands               ✔
     Update systemd script               ✔
     Fixup Pi tweaks                     ✔
     All done.
   ```

   Setelah itu, skrip mencetak spanduk peringatan `DO NOT EXPOSE NODE-RED TO THE OPEN INTERNET WITHOUT SECURING IT FIRST` (jangan buka Node-RED ke internet sebelum diamankan) dan langsung menjalankan **`node-red admin init`**, alat tanya jawab untuk membuat berkas pengaturan.
5. Jawab pertanyaan `node-red admin init` berikut. Pilih jawaban dengan tombol panah **↑**/**↓**, lalu tekan **Enter**; ketikan kata sandi hanya tampil sebagai bintang.

   | Pertanyaan di layar | Jawabanmu | Alasannya |
   | :--- | :--- | :--- |
   | `Settings file` | tekan **Enter** (`/home/budi/.node-red/settings.js`) | letak bawaan |
   | `Share Anonymouse Usage Information` (ejaan `Anonymouse` yang salah ketik itu memang dari programnya) | **No, do not send my usage data** | kita memperbarui Node-RED sendiri dengan skrip yang sama |
   | `Do you want to setup user security?` | **Yes** | editor wajib dijaga kata sandi (aturan aman nomor 1) |
   | `Username` | `admin` | nama akun **editor Node-RED**, bukan pengguna Linux |
   | `Password` | kata sandi editor, **minimal 8 karakter**, berbeda dengan kata sandi Pi | catat di tempat aman |
   | `User permissions` | **full access** | akun ini boleh mengubah flow |
   | `Add another user?` | **No** | |
   | `Do you want to enable the Projects feature?` | **No** | fitur ini butuh `git`, yang tidak ada di Raspberry Pi OS Lite |
   | `Enter a name for your flows file` | tekan **Enter** (`flows.json`) | |
   | `Provide a passphrase to encrypt your credentials file` | *passphrase* (kalimat sandi) bebas, misalnya tiga kata acak | dipakai untuk mengunci kata sandi broker kelak (Modul 21); catat di tempat aman |
   | `Select a theme for the editor…` | tekan **Enter** (`default`) | tema lain butuh paket tambahan |
   | `Select the text editor component to use in the Node-RED Editor` | tekan **Enter** (`monaco (default)`) | |
   | `Allow Function nodes to load external modules? (functionExternalModules)` | **No** | kita tidak butuh modul tambahan di node function |

   Di akhir muncul `Settings file written to /home/budi/.node-red/settings.js`, lalu *prompt* `budi@gateway:~ $` kembali.
6. Skrip **tidak** menyalakan Node-RED dan tidak mendaftarkannya untuk menyala sendiri. Lakukan keduanya sekaligus:

   ```bash
   sudo systemctl enable --now nodered.service
   ```

   Pilihan `--now` berarti "aktifkan untuk setiap kali Pi menyala, **dan** nyalakan sekarang juga", persis seperti Mosquitto di Modul 12.
7. Tunggu sekitar 30 detik, lalu periksa:

   ```bash
   systemctl status nodered
   ```

   Yang dicari: `enabled` di baris `Loaded:` dan `active (running)` di baris `Active:`. Tekan **q** untuk kembali ke *prompt*.

### Langkah 2 — Buka editor Node-RED dari laptop

1. **Di laptop**, buka browser dan ketik alamat ini di bilah alamat: `http://192.168.1.37:1880` (pakai alamat tetap Pi-mu; `1880` adalah pintu Node-RED).
2. Muncul halaman masuk. Isi **Username** `admin` dan **Password** kata sandi editor dari langkah 1.5, lalu klik **Login**.
3. Saat pertama kali dibuka, Node-RED menyambutmu dengan tur singkat `Welcome to Node-RED 5.0!`. Kamu boleh mengikutinya (**Start**, **Next**), atau menutupnya dengan tombol **✕**.
4. Kenali layarnya. Gambar berikut memperlihatkan editor setelah langkah 3 nanti selesai; saat ini ruang kerjamu masih kosong.

![Tangkapan layar editor Node-RED 5.0 di browser laptop setelah Kemenangan Cepat langkah 3, dengan tujuh penanda. Penanda 1, kiri atas: panel EXPLORER berisi Flows, Flow 1, Subflows, dan Global Configuration Nodes. Penanda 2, kiri bawah: panel PALETTE dengan kotak filter nodes dan kategori common (inject, debug, complete, catch, status, link, comment) serta function. Penanda 3, tengah: ruang kerja tab Flow 1 berisi node mqtt in telemetry Node 1 berstatus connected yang tersambung ke node debug 1. Penanda 4, kanan atas: tombol Deploy yang masih abu-abu. Penanda 5: ikon menu utama bergaris tiga. Penanda 6, kanan atas: panel INFORMATION untuk Flow 1. Penanda 7, kanan bawah: panel DEBUG MESSAGES berisi tiga pesan dari topik rpm/a4cf12e5b7c0/telemetry; yang terakhir dibuka dan memperlihatkan ts, fw 1.2.1, suhu 27, kelembapan 71, cahaya 2310, tanah 37, gerak false, dan level_air 64.](aset/editor-node-red.png)

*Tangkapan layar asli Node-RED 5.0.8 dan FlowFuse Dashboard 1.33.0 (lisensi Apache 2.0) dari laptop penulis, dengan data dari Node 1 tiruan; nomor dan keterangan oleh penulis.*

   - **Explorer** (kiri atas, penanda 1): daftar flow (setiap tab adalah satu flow), *subflow*, dan node pengaturan (*config node*) seperti sambungan ke broker.
   - **Palet** (kiri bawah, penanda 2): daftar node yang bisa dipakai, dikelompokkan per kategori (`common`, `function`, `network`, …). Kotak `filter nodes` di atasnya mencari node berdasarkan nama.
   - **Ruang kerja** (tengah, penanda 3): tempat menyusun flow. Tabnya bernama `Flow 1`.
   - **Tombol Deploy** (kanan atas, penanda 4): menerapkan flow di ruang kerja ke Node-RED yang berjalan di Pi. Tombol ini abu-abu kalau belum ada perubahan.
   - **Menu utama** (ikon tiga garis, pojok kanan atas, penanda 5): **Import**, **Export**, **Manage palette**, dan **Settings**.
   - **Panel kanan**: **Information** (atas, penanda 6) menjelaskan node yang dipilih, dan **Debug messages** (bawah, penanda 7) menampilkan pesan dari node debug.

### Langkah 3 — Flow pertama: dengarkan `telemetry` Node 1

1. **Di editor Node-RED**, ketik `mqtt` di kotak `filter nodes` palet. Seret node **mqtt in** (berikon gelombang, kategori `network`) ke tengah ruang kerja, lalu lepaskan.
2. Klik dua kali node itu untuk membuka pengaturannya. Baris **Server** masih bertulisan `Add new mqtt-broker...`. Klik tombol **+** di ujung kanan baris itu (petunjuknya `Add new mqtt-broker config node`; ikon pensil di sebelahnya untuk mengubah broker yang sudah ada). Di jendela `Add new mqtt-broker config node`, isi:
   - **Name**: `Mosquitto di gateway`
   - **Server**: `localhost` (Node-RED dan Mosquitto berada di Pi yang sama), **Port**: `1883`

   Biarkan isian lain apa adanya, termasuk **Client ID** yang kosong (Node-RED membuat nama acak sendiri), lalu klik **Add**.
3. Kembali di pengaturan **mqtt in**, isi:
   - **Topic**: `rpm/a4cf12e5b7c0/telemetry` (ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu)
   - **QoS**: `0`, sama dengan QoS yang dipakai Node 1 untuk menerbitkan `telemetry`
   - **Output**: biarkan `auto-detect (parsed JSON object, string or buffer)`
   - **Name**: `telemetry Node 1`

   Klik **Done**.
4. Kosongkan kotak `filter nodes`, lalu seret node **debug** (kategori `common`, berikon garis-garis) ke kanan node mqtt in.
5. Sambungkan keduanya: tekan dan tahan tombol kiri mouse di titik kecil di **sisi kanan** node mqtt in, seret ke **sisi kiri** node debug, lalu lepaskan. Muncul kabel abu-abu di antaranya.
6. Klik **Deploy** di kanan atas. Muncul notifikasi `Successfully deployed`, dan di bawah node mqtt in muncul titik hijau bertulisan `connected`: Node-RED sudah tersambung ke broker.
7. Klik ikon serangga di panel kanan bawah (**Debug messages**) kalau panelnya belum terbuka. Setiap 10 detik muncul satu pesan baru. Klik tanda **▸** di depan `{ ts: … }` untuk membuka isinya. **Hasilnya** (angka dan jam di layarmu berbeda):

   ```text
   18/10/2026, 10.31.22  node: debug 1
   rpm/a4cf12e5b7c0/telemetry : msg.payload : Object
   ▾object
     ts: "2026-10-18T03:31:22Z"
     fw: "1.2.1"
     suhu: 28.5
     kelembapan: 71
     cahaya: 2310
     tanah: 37
     gerak: false
     level_air: 64
   ```

Selamat! Node-RED di gateway kini mendengar Node 1, sama seperti MQTTX di Modul 11. Bedanya, Node-RED menyala 24 jam di Pi, dan pesan itu kini bisa diolah, ditampilkan, dan dijadikan otomasi tanpa menulis program dari nol. Biarkan flow ini; kita melanjutkannya di Praktik 2.

> ➡️ **Selesai Kemenangan Cepat?** Baca [Konsep 1](#1-low-code-menyusun-program-dengan-kotak-dan-kabel), lalu kerjakan praktik sesuai urutan di awal 🧠.

---

## 🧠 Konsep "Mengapa"

Delapan konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–2 (apa yang barusan terjadi di Kemenangan Cepat) → Praktik 1 (tur editor dan flow pertama)
2. Konsep 3–4 → Praktik 2 (Node-RED sebagai layanan dan mendengar Node 1)
3. Konsep 5 → Praktik 3–4 (Dashboard 2 dan panel sensor)
4. Konsep 6 → Praktik 5 (kendali dari HP)
5. Konsep 7 → Praktik 6 (otomasi kipas berhisteresis)
6. Konsep 8 → Praktik 7 (menyimpan flow ke repositori)
7. Praktik 8 hanya untuk jalur laptop (tanpa Pi): kerjakan Praktik 8 lebih dulu, lalu ikuti urutan di atas dengan alamat dan cara dari Praktik 8
8. 🧩 Tantangan → ➕ Rumah Pintar Mini (dashboard v0 dan otomasi 24 jam) → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba sesuatu di bagian Konsep?** Tidak wajib. Semua contoh di bagian Konsep akan kamu buat sendiri di Praktik, di editor Node-RED.

### 1. *Low-code*: menyusun program dengan kotak dan kabel

Di Modul 11, kamu memakai alat pemeriksa kontrak: program Node.js sekitar 230 baris yang berlangganan topik, membongkar JSON, lalu menulis `LULUS` atau `GAGAL`. Untuk membuat program semacam itu, kamu harus menulis kode baris demi baris, menjalankannya di terminal, dan mengulanginya setiap kali ada yang perlu diubah.

**Node-RED** menawarkan cara lain. Di dalam browser, programnya disusun dari **kotak** (disebut *node*) yang disambung dengan **kabel**. Setiap kotak mengerjakan satu tugas kecil: mendengarkan topik MQTT, mengubah isi pesan, memilah pesan, menampilkan jarum ukur, atau menerbitkan perintah. Rangkaian kotak dan kabel itu disebut ***flow*** (alur). Cara memprogram seperti ini disebut ***low-code*** (sedikit kode): sebagian besar pekerjaan dilakukan dengan memilih isian di kotak, dan kode hanya ditulis untuk hal kecil yang tidak tersedia.

Node-RED dibuat di IBM pada 2013 untuk menyambungkan perangkat IoT dengan cepat, lalu dibuka sebagai proyek sumber terbuka pada tahun yang sama. Sejak 2016, Node-RED dikelola yayasan nirlaba yang kini bernama OpenJS Foundation. Semboyan resminya: *low-code programming for event-driven applications*, pemrograman sedikit kode untuk aplikasi yang bekerja setiap kali ada kejadian. "Kejadian" di proyek kita adalah pesan MQTT yang datang, klik di dashboard, atau jam yang menunjuk waktu tertentu.

| | Menulis program (Modul 4 dan 11) | Node-RED (minggu ini) |
| :--- | :--- | :--- |
| Bentuknya | teks: baris-baris kode di VS Code | gambar: kotak dan kabel di browser |
| Mengubah aturan | ubah kode, simpan, jalankan ulang | ubah isian kotak, klik **Deploy** |
| Melihat isi pesan | `console.log()` di terminal | node **debug**, tampil di panel kanan |
| Membuat dashboard | HTML, CSS, dan JavaScript (Modul 22) | pasang Dashboard 2, seret *widget* (unsur tampilan) |
| Cocok untuk | logika rumit, pengujian otomatis, kerja tim besar | prototipe, dashboard pertama, otomasi sederhana, "lem" antarsistem |

Kapan *low-code* sudah cukup? Untuk Rumah Pintar Mini **minggu ini**: satu rumah, satu gateway, beberapa aturan sederhana, dan satu halaman dashboard. Kapan tidak cukup? Saat aturan bertambah banyak, saat beberapa orang mengubah sistem bersamaan, saat data harus disimpan bertahun-tahun di database, dan saat setiap perubahan harus diuji otomatis sebelum dipakai. Karena itu, mulai Modul 16 "otak" proyek pindah ke ***backend*** yang kamu tulis sendiri dengan TypeScript, dan otomasi Node-RED dimatikan supaya tidak ada dua otak yang memberi perintah. Node-RED tidak dibuang: ia tetap berguna sebagai alat untuk mengintip lalu lintas data, seperti kaca pembesar di bengkel.

### 2. Flow, node, dan `msg`: barang yang berjalan di ban

Bayangkan **ban berjalan di pabrik**. Barang diletakkan di ujung ban, berjalan melewati beberapa stasiun kerja, dan di setiap stasiun ada petugas yang mengerjakan satu hal: memeriksa, menempelkan label, memilah, atau mengemas. Node-RED bekerja persis seperti itu:

- **Barangnya** adalah pesan, disebut **`msg`** (dari *message*). Setiap pesan adalah satu objek JavaScript, persis seperti objek di Modul 4.
- **Stasiun kerjanya** adalah **node**. Node menerima pesan dari kabel di kirinya, mengerjakan tugasnya, lalu meneruskan pesan (yang mungkin sudah diubah) lewat kabel di kanannya.
- **Ban berjalannya** adalah **kabel**. Satu keluaran boleh disambung ke beberapa node sekaligus: pesannya disalin ke setiap kabel.

![Diagram flow, node, dan msg sebagai barang di ban berjalan. Tiga node di atas ban: inject (pintu masuk, membuat pesan), change (pengolah, mengubah pesan dengan $uppercase(payload) & "!"), dan debug (pintu keluar, menampilkan). Di atas kabel pertama, kartu msg dengan payload "halo dari gateway", topic "latihan", dan _msgid "3c5e…"; di atas kabel kedua, kartu msg yang sama dengan payload "HALO DARI GATEWAY!". Legenda: node sama dengan stasiun kerja, kabel sama dengan ban berjalan, msg sama dengan barang yang lewat, msg.payload sama dengan isinya. Bawah: editor di browser laptop (meja gambar; titik biru di node berarti belum di-deploy), panah Deploy (Ctrl + D), ke Node-RED di Pi (mesinnya, flow berjalan 24 jam).](aset/alur-flow-node-msg.png)

Isi `msg` yang paling sering kamu pakai hanya dua:

| Bagian `msg` | Isinya | Contoh dari Kemenangan Cepat |
| :--- | :--- | :--- |
| `msg.payload` | **muatan**: isi pesan yang sebenarnya | objek `telemetry` Node 1: `{ ts: "…", suhu: 28.5, … }` |
| `msg.topic` | **topik**: label tentang asal atau tujuan pesan | `rpm/a4cf12e5b7c0/telemetry` |

Karena `payload` di Kemenangan Cepat berupa objek, setiap kolomnya bisa ditunjuk dengan titik, persis seperti di JavaScript: **`msg.payload.suhu`** adalah suhu, dan **`msg.payload.level_air`** adalah isi tandon. Cara menunjuk inilah yang dipakai di hampir semua isian node minggu ini.

Node dikelompokkan menurut perannya:

| Peran | Contoh node | Ikon di palet |
| :--- | :--- | :--- |
| **Pintu masuk**: membuat atau menerima pesan | **inject** (tombol dan jadwal), **mqtt in** | titik sambung hanya di kanan |
| **Pengolah**: mengubah, memilah, menahan pesan | **change**, **switch**, **filter**, **function** | titik sambung di kiri dan kanan |
| **Pintu keluar**: menampilkan atau mengirim | **debug**, **mqtt out**, widget **text** | titik sambung hanya di kiri (widget lain, seperti jarum, sakelar, tombol, dan penggeser, punya titik di kiri **dan** kanan karena juga bisa mengeluarkan pesan) |

**Deploy: dari gambar menjadi program yang berjalan.** Apa yang kamu susun di editor **belum berjalan** sampai kamu menekan **Deploy**. Editor hanyalah meja gambar di browser laptop; mesinnya ada di Pi. Tombol **Deploy** mengirim gambar itu ke Node-RED di Pi, yang lalu menghentikan flow lama dan menjalankan flow baru dalam sekejap. Node yang perubahannya belum diterapkan ditandai **titik biru** di atasnya, dan node yang isiannya belum lengkap ditandai **segitiga merah**. Pintasan papan ketiknya **Ctrl + D**.

**Debug: kaca pembesar.** Node **debug** tidak mengubah apa pun. Ia hanya menampilkan pesan yang lewat di panel **Debug messages**, persis seperti `console.log()` di Modul 4. Kebiasaan yang baik: setiap kali menambah node baru, pasang node debug di belakangnya, lihat apakah isinya sesuai dugaan, lalu matikan debug-nya (tombol kecil di sisi kanannya) kalau panelnya mulai ramai. Panel itu hanya menyimpan 100 pesan terakhir.

> ➡️ **Saatnya praktik!** Konsep 1–2 cukup untuk [Praktik 1 — Tur editor dan flow pertama](#praktik-1--tur-editor-dan-flow-pertama-25-menit). Setelah itu, kembali ke Konsep 3.

### 3. Node-RED di gateway: layanan, berkas, dan kata sandi

Di Modul 12, Mosquitto menjadi **layanan systemd**: ia menyala sendiri setiap kali Pi menyala dan dibangunkan lagi oleh satpam (systemd) kalau mati mendadak. Node-RED kini menjadi layanan kedua di gateway yang sama, dengan nama **`nodered`**. Skrip pemasang sudah membuat berkas unitnya, dan di Kemenangan Cepat kamu mengaktifkannya dengan `sudo systemctl enable --now nodered.service`.

![Diagram Node-RED di gateway: satu Pi, dua layanan. Tengah, Raspberry Pi "gateway" 192.168.1.37 berisi Mosquitto (Modul 12), layanan mosquitto di pintu 1883, kantor pos MQTT, dan di bawahnya Node-RED (minggu ini), layanan nodered di pintu 1880, dengan folder ~/.node-red/ berisi settings.js, flows.json, flows_cred.json, dan node_modules/. Keduanya bertukar pesan lewat localhost:1883. Kiri, Node 1 v1.2.1 tersambung ke Mosquitto lewat MQTT: mengirim telemetry, status, dan ack, serta menerima cmd. Kanan atas, laptop membuka editor http://192.168.1.37:1880, dijaga Username dan Password dari node-red admin init. Kanan bawah, HP membuka dashboard :1880/dashboard/rumah, tanpa kata sandi, hanya untuk WiFi rumah; gemboknya di Modul 21. Bawah: tidak ada port forwarding ke 1880 atau 1883: editor Node-RED bisa menjalankan perintah apa pun di Pi, dan broker belum dijaga kata sandi; keduanya hanya dibuka dari jaringan rumah.](aset/node-red-di-gateway.png)

| | Mosquitto (Modul 12) | Node-RED (minggu ini) |
| :--- | :--- | :--- |
| Nama layanan | `mosquitto` | `nodered` |
| Berjalan sebagai pengguna | `mosquitto` | `budi` (pengguna Pi-mu) |
| Pintu | 1883 (MQTT) | 1880 (editor dan dashboard, lewat browser) |
| Kalau mati mendadak | dibangunkan lagi (`Restart=on-failure`) | dibangunkan lagi setelah 20 detik (`Restart=on-failure`, `RestartSec=20`) |
| Berkas pengaturan | `/etc/mosquitto/conf.d/gateway-pi.conf` | `/home/budi/.node-red/settings.js` |
| Catatan | `/var/log/mosquitto/mosquitto.log` | *journal*: `journalctl -u nodered` atau `node-red-log` |

Semua milik Node-RED tersimpan di satu folder tersembunyi, **`~/.node-red`** (`/home/budi/.node-red`). Isinya yang penting:

| Berkas | Isinya | Masuk repositori? |
| :--- | :--- | :--- |
| `settings.js` | pengaturan dari `node-red admin init`, termasuk kata sandi editor yang sudah diacak (*hash*) dan *passphrase* kredensial yang tertulis **apa adanya** | **tidak** |
| `flows.json` | semua flow yang sudah di-*deploy* | ya, lewat ekspor (Konsep 8) |
| `flows_cred.json` | kata sandi yang dipakai node (misalnya kata sandi broker kelak), dikunci dengan *passphrase*-mu | **tidak pernah** |
| `node_modules/` | node tambahan yang kamu pasang, misalnya Dashboard 2 | tidak (cukup nama paketnya) |

Skrip pemasang juga menambahkan lima perintah pendek: `node-red-start`, `node-red-stop`, `node-red-restart`, `node-red-reload`, dan `node-red-log`. Semuanya memanggil `sudo` di dalamnya, jadi bisa meminta kata sandi Pi. Empat yang paling sering kamu butuhkan ada di tabel berikut, bersama satu perintah systemd biasa yang tidak butuh `sudo`:

| Perintah (di Pi) | Artinya |
| :--- | :--- |
| `node-red-start` | nyalakan layanan, lalu tampilkan catatannya terus-menerus (**Ctrl + C** hanya menutup tampilan catatan; layanannya tetap jalan) |
| `node-red-stop` | hentikan layanan |
| `node-red-restart` | nyalakan ulang layanan |
| `node-red-log` | tampilkan catatan terbaru dan terus mengikutinya (**Ctrl + C** untuk berhenti) |
| `systemctl status nodered` | perintah systemd biasa dari Modul 12: `enabled` dan `active (running)`? |

**Kata sandi editor, bukan kata sandi dashboard.** Di Kemenangan Cepat, kamu menjawab **Yes** untuk `Do you want to setup user security?`. Jawaban itu menulis blok `adminAuth` di `settings.js` sehingga editor meminta **Username** dan **Password** sebelum terbuka. Ini penting: node **exec** di palet bisa menjalankan perintah Linux apa pun di Pi, dan node **function** bisa menjalankan JavaScript apa pun. Editor tanpa kata sandi berarti siapa pun di WiFi rumahmu bisa memerintah Pi-mu. Namun, kata sandi itu **hanya** menjaga editor. Halaman dashboard di `/dashboard` tetap terbuka untuk semua perangkat di jaringan rumah; untuk sekarang itu cukup, dan menguncinya adalah urusan Modul 21. Satu aturan berlaku sejak hari ini: **jangan pernah membuat *port forwarding* ke pintu 1880.**

**Memori Pi.** Skrip pemasang memberi Node-RED batas memori sesuai RAM Pi-mu: sekitar 1 GB di Pi 5 dengan RAM 2 GB, 2 GB di Pi 5 dengan RAM 4 GB, dan 256 MB di Pi Zero 2 W (RAM 512 MB). Flow minggu ini hanya memakai sebagian kecilnya, jadi Mosquitto dan Node-RED nyaman berbagi gateway yang sama.

### 4. MQTT di Node-RED: satu sambungan, banyak pendengar

Node-RED berbicara dengan broker persis seperti MQTTX di Modul 11: ia menyambung ke `localhost:1883`, berlangganan topik, dan menerbitkan pesan. Bedanya, semua itu disusun dari tiga jenis node:

| Node | Tugasnya | Isian penting |
| :--- | :--- | :--- |
| **mqtt-broker** (*config node*, node pengaturan) | **satu** sambungan ke broker, dipakai bersama oleh semua node MQTT | **Server** `localhost`, **Port** `1883`, **Client ID** dikosongkan |
| **mqtt in** | berlangganan satu topik (boleh memakai *wildcard* `+` dan `#`) dan mengeluarkan setiap pesan yang datang | **Topic**, **QoS**, **Output** |
| **mqtt out** | menerbitkan `msg.payload` ke broker | **Topic**, **QoS**, **Retain** |

***Config node* = satu sambungan bersama.** Node **mqtt-broker** tidak muncul di ruang kerja. Ia tersimpan di bagian **Configuration nodes** dan dipilih dari daftar **Server** di setiap node MQTT. Tiga node **mqtt in** dan satu **mqtt out** yang nanti kamu buat semuanya memakai `Mosquitto di gateway`, jadi semuanya berbagi **satu** sambungan ke broker. Karena itu, saat menambah node MQTT berikutnya, **pilih** `Mosquitto di gateway` dari daftar, jangan klik tombol **+** di sebelahnya lagi. Tombol itu membuat node broker kedua, yang membuka sambungan kedua yang tidak perlu (🚨).

**Client ID dikosongkan.** Node-RED membuat nama klien acak sendiri, misalnya `nodered2f4a91c07b3d5e86`. **Jangan** mengisinya dengan `device_id` Node 1: kontrak data memakai `device_id` sebagai nama klien Node 1, dan dua klien dengan nama sama akan saling menendang keluar dari broker (🚨 Modul 11, "Tersambung, lalu putus terus setiap beberapa detik").

**Output `auto-detect`.** Pilihan bawaan **Output** pada mqtt in, `auto-detect (parsed JSON object, string or buffer)`, mencoba membaca isi pesan sebagai JSON. Pesan `telemetry` menjadi objek (`msg.payload.suhu` bisa dipakai), sedangkan pesan `status` yang berisi teks `online` tetap menjadi teks. Biarkan pilihan ini; kalau diganti dengan `a String`, semua `msg.payload.suhu` mendadak kosong.

**Status di bawah node.** Setiap node MQTT memperlihatkan keadaan sambungannya: **titik hijau** `connected`, **cincin kuning** `connecting`, atau **cincin merah** `disconnected`. Inilah tanda pertama yang perlu kamu periksa kalau dashboard diam (🚨).

**Node mqtt out: jangan biarkan isian kosong.** Di node mqtt out, **Topic**, **QoS**, dan **Retain** yang dikosongkan diambil dari pesan yang datang ke node itu. Kedengarannya praktis, tetapi berbahaya: pesan yang berasal dari mqtt in membawa `msg.topic` `rpm/…/telemetry` dan kadang `msg.retain` `true` sehingga perintahmu bisa terbit ke topik yang salah atau menjadi *retained*. Karena itu, untuk perintah selalu isi ketiganya dengan tegas: **Topic** `rpm/a4cf12e5b7c0/cmd`, **QoS** `1`, **Retain** `false`. Ada satu sifat lagi yang perlu diingat: kalau sambungan ke broker sedang putus, mqtt out **membuang** pesannya tanpa galat, jadi lihat juga status di bawah node itu.

> ➡️ **Saatnya praktik!** Konsep 3–4 cukup untuk [Praktik 2 — Node-RED sebagai layanan dan mendengar Node 1](#praktik-2--node-red-sebagai-layanan-dan-mendengar-node-1-30-menit). Setelah itu, kembali ke Konsep 5.

### 5. Dashboard 2: halaman, grup, dan widget

Node-RED sendiri tidak punya dashboard. Tampilan untuk HP datang dari paket tambahan bernama **Dashboard 2** (nama paketnya **`@flowfuse/node-red-dashboard`**) yang dipasang lewat menu **Manage palette** (Praktik 3). Setelah terpasang, palet mendapat kategori baru, **`dashboard 2`**, berisi node yang muncul sebagai ***widget*** (unsur tampilan) di halaman web: `gauge`, `chart`, `text`, `switch`, `button`, `slider`, dan lain-lain.

**Susunannya bertingkat, seperti rumah.** Setiap widget harus tinggal di sebuah **grup**, setiap grup di sebuah **halaman**, dan semua halaman di satu **dashboard**:

| Tingkat | Nama node | Isian pentingnya | Punya kita |
| :--- | :--- | :--- | :--- |
| Dashboard | **ui-base** | alamat dasar, selalu `/dashboard` | `Rumah Pintar Mini` |
| Halaman | **ui-page** | **Path** (harus diawali `/`), ikon, tata letak | `Rumah`, path `/rumah` |
| Grup | **ui-group** | nama yang tampil sebagai judul kartu, lebar | `Sensor`, `Kendali`, `Grafik` |
| Widget | **ui-gauge**, **ui-chart**, … | **Group**, lalu isian khas widget | jarum suhu, sakelar kipas, … |

![Diagram susunan Dashboard 2: dashboard, halaman, grup, widget. Kiri, kotak bertingkat: ui-base Rumah Pintar Mini di /dashboard berisi ui-page Rumah di /rumah, yang berisi tiga ui-group. Grup Sensor: Node 1 (status), Suhu, Kelembapan, Tanah, Air tandon, Cahaya, Gerak. Grup Kendali: Kipas, Lampu, Siram 5 detik, Tirai (derajat), Jawaban terakhir. Grup Grafik: Suhu & kelembapan. Kanan, gambar HP: di layar yang lebarnya kurang dari 576 piksel ada 3 kolom sehingga kartu Sensor, Kendali, dan Grafik bertumpuk ke bawah. Gambar laptop: 12 kolom, dua kartu berdampingan per baris: Sensor dan Kendali di baris pertama, Grafik di baris kedua di bawah Sensor. Alamat di HP: http://192.168.1.37:1880/dashboard/rumah.](aset/susunan-dashboard-2.png)

Kamu tidak perlu membuat ketiga tingkat atasnya dengan tangan. Begitu widget **pertama** diletakkan di ruang kerja, Dashboard 2 membuatkan `My Dashboard`, halaman `Page 1` (path `/page1`), grup `Group 1`, dan tema `Default Theme`, lalu memasukkan widget itu ke `Group 1`. Di Praktik 3 kita tinggal mengganti nama-namanya. Alamat halamannya di HP menjadi:

```text
http://192.168.1.37:1880/dashboard/rumah
```

**Tata letak menyesuaikan layar.** Dashboard 2 membagi lebar layar menjadi kolom: 12 kolom di layar laptop, tetapi hanya 3 kolom di layar HP yang lebarnya kurang dari 576 piksel. Grup kita selebar 6 kolom, jadi di laptop dua grup berdampingan, sedangkan di HP semua grup dan widget **bertumpuk** menjadi satu kolom panjang yang tinggal digulir. Kamu tidak perlu mengatur apa pun untuk itu.

**Widget membaca `msg`.** Widget gauge dan text punya isian **Value** yang menunjuk bagian pesan yang ditampilkan. Karena `msg.payload` dari node **mqtt in** berisi seluruh `telemetry`, isian **Value** cukup diisi `payload.suhu` (dengan pilihan `msg.` di depannya), dan jarum suhu langsung bergerak tanpa node tambahan:

| Widget (nama di palet) | Dipakai untuk | Isian kuncinya |
| :--- | :--- | :--- |
| **gauge** | suhu, kelembapan, tanah, air tandon | **Type** (`Half Gauge`, `Tank Level`, …), **Value**, **Range** min–maks, **Units** |
| **chart** | grafik suhu dan kelembapan satu jam terakhir | **Series** bertipe JSON `["suhu","kelembapan"]`, **X-Axis Limit** |
| **text** | cahaya, gerak, status `online`, jawaban perintah | **Label**, **Value** |
| **switch** | lampu dan kipas | **Topic** (`lampu`/`kipas`), **Indicator** |
| **button** | siram 5 detik | **Payload** (angka `5`), **Topic** (`pompa`) |
| **slider** | tirai 0–180 derajat | **Range**, **Output** `only on release`, **Topic** (`tirai`) |

Ada dua jebakan yang sering membuat pemula bingung. Pertama, **ada dua node bernama `switch`**: yang di kategori `function` adalah **pemilah pesan** (Konsep 6), sedangkan yang di kategori `dashboard 2` adalah **sakelar** di layar HP. Kedua, **`null` bukan nol**. Kontrak data menulis bacaan yang gagal sebagai `null` (Modul 11). Gauge yang menerima `null` diam-diam menunjuk ke nilai **minimum**: suhu tampil 0 °C dan tandon tampil 0 % seakan-akan kosong. Karena itu, kita memasang node **switch** (pemilah) dengan aturan `is not null` sebelum jarum suhu dan tandon. Node itu hanya meneruskan bacaan yang benar-benar terbaca (Praktik 4).

**Grafik disimpan di gateway.** Riwayat grafik disimpan di memori Node-RED, bukan di HP. Jadi, HP yang baru membuka dashboard tetap melihat garis satu jam terakhir. Riwayat itu hilang kalau Node-RED dinyalakan ulang; menyimpan data bertahun-tahun adalah tugas database di Modul 17–18.

> ➡️ **Saatnya praktik!** Konsep 5 cukup untuk [Praktik 3 — Dashboard 2 dan jarum suhu pertama](#praktik-3--dashboard-2-dan-jarum-suhu-pertama-30-menit) dan [Praktik 4 — Panel sensor lengkap](#praktik-4--panel-sensor-lengkap-30-menit). Setelah itu, kembali ke Konsep 6.

### 6. Mengubah pesan: change, switch, dan perintah ber-`id`

Pesan jarang bisa dipakai apa adanya. Kadang kita hanya butuh satu kolom, kadang pesan harus dipilah menurut isinya, dan kadang kita harus **membuat** pesan baru, misalnya perintah untuk Node 1. Tiga node pengolah melakukan hampir semua pekerjaan itu:

| Node | Ibaratnya | Contoh di modul ini |
| :--- | :--- | :--- |
| **change** | petugas yang menempelkan atau mengganti label | ambil `msg.payload.state.kipas` dari `ack` lalu jadikan `msg.payload` (Praktik 5) |
| **switch** (pemilah, kategori `function`) | petugas di persimpangan ban yang mengarahkan barang ke jalur berbeda | suhu di atas 30 lewat jalur 1, di bawah 28 lewat jalur 2 (Praktik 6) |
| **function** | petugas serba bisa yang mengikuti instruksi tertulis (JavaScript) | tidak wajib minggu ini; contohnya di 🔬 |

**Node change** punya empat aksi: **Set** (isi atau ganti suatu bagian pesan), **Change** (cari dan ganti sebagian teks), **Delete** (hapus suatu bagian), dan **Move** (pindahkan). Nilai yang diisikan bisa berupa teks, angka, `true`/`false`, bagian lain dari `msg`, atau **ekspresi JSONata** (ikon **J:**), bahasa kecil untuk menyusun dan menghitung data JSON. JSONata sudah kamu pakai di Praktik 1 (`besarkan huruf`) dan Praktik 4 (kalimat cahaya dan gerak); tugas terpentingnya ada di bawah ini: menyusun perintah.

**Node switch** memeriksa satu bagian pesan dengan satu atau beberapa aturan, misalnya `> 30`, `< 28`, atau `is not null`, dan setiap aturan punya jalur keluarnya sendiri. Pesan yang tidak cocok dengan aturan mana pun **dibuang**. Sifat inilah yang nanti membuat histeresis bekerja (Konsep 7).

**Perintah harus mengikuti kontrak.** Saat kamu menekan sakelar kipas di HP, dashboard hanya mengeluarkan `msg.payload = true` dan `msg.topic = "kipas"`. Node 1 tidak mengerti pesan itu. Ia menunggu perintah sesuai kontrak data Modul 11:

```json
{"id":"nr-1792299778095","ts":"2026-10-18T05:02:58Z","aksi":"set","target":"kipas","nilai":true}
```

Satu node **change** bernama `buat cmd` mengubah pesan sakelar menjadi perintah itu dengan satu ekspresi JSONata:

```text
{
  "id": "nr-" & $string($millis()),
  "ts": $now("[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]Z"),
  "aksi": "set",
  "target": topic,
  "nilai": payload
}
```

| Bagian | Artinya |
| :--- | :--- |
| `"nr-" & $string($millis())` | `id` unik: awalan `nr-` (dari Node-RED) disambung (`&`) dengan jumlah milidetik sejak 1970, yang berbeda setiap kali. Node 1 mengabaikan perintah ber-`id` sama, jadi `id` **wajib** baru setiap kali. |
| `$now("[Y0001]-…[s01]Z")` | waktu sekarang dalam UTC, **tanpa** milidetik. Pemeriksa kontrak menolak `ts` bermilidetik, padahal `$now()` tanpa pola menghasilkan milidetik. |
| `"target": topic` | diambil dari `msg.topic`: `kipas`, `lampu`, `pompa`, atau `tirai` |
| `"nilai": payload` | diambil dari `msg.payload`: `true`/`false`, jumlah detik siram, atau derajat tirai |

Satu node `buat cmd` ini dipakai bersama oleh **semua** kendali: sakelar lampu, sakelar kipas, tombol siram, penggeser tirai, dan nanti otomasi kipas. Setiap kendali cukup memberi `msg.topic` dan `msg.payload` yang benar. Hasilnya dikirim node **mqtt out** ke `rpm/a4cf12e5b7c0/cmd` dengan **QoS** `1` dan **Retain** `false`, sesuai aturan kontrak.

**Jawaban `ack` menutup lingkaran.** Node 1 menjawab setiap perintah dengan `ack` yang membawa `state`, yaitu keadaan **semua** aktuator saat itu (Modul 11). Kita memakainya untuk membuat sakelar di dashboard **jujur**: sakelar baru bergeser setelah Node 1 menjawab, bukan saat jari menyentuh layar. Kalau Node 1 mati atau perintahnya ditolak, sakelar tidak berpura-pura berhasil. Di Dashboard 2, sifat ini dipilih lewat isian **Indicator** `Switch icon shows state of the input`.

![Diagram sakelar yang jujur: perintah keluar, ack kembali, dan sakelar baru bergeser setelah ack tiba. Jalur atas berwarna oranye, perintah: 1, sakelar Kipas di HP diketuk dan menampilkan tanda tunggu; 2, node buat cmd di Node-RED membuat id baru, ts, aksi, target, dan nilai dengan JSONata; 3, node mqtt out mengirim ke rpm/<device_id>/cmd dengan QoS 1 dan Retain false, ke Mosquitto di pintu 1883; 4, Node 1 menerima, relay kipas klik. Jalur bawah berwarna hijau, jawaban: 5, Node 1 menjawab ack; 6, node mqtt in rpm/<device_id>/ack di Node-RED menerimanya lewat Mosquitto; 7, node keadaan kipas mengambil payload.state.kipas, dan sakelar di HP bergeser ke nyala. Bawah, contoh cmd {"id":"nr-1792301487215","ts":"…","aksi":"set","target":"kipas","nilai":true} dan ack {"id":"nr-1792301487215","ts":"…","ok":true,"state":{"kipas":true,"lampu":false,…}}: id yang sama menghubungkan jawaban dengan perintahnya (Modul 11). Kotak merah: Node 1 mati? Tidak ada ack: sakelar tetap menunggu, tidak berpura-pura berhasil.](aset/perintah-dan-ack.png)

> ➡️ **Saatnya praktik!** Konsep 6 cukup untuk [Praktik 5 — Kendali dari HP](#praktik-5--kendali-dari-hp-40-menit). Setelah itu, kembali ke Konsep 7.

### 7. Otomasi dan histeresis: kipas yang tidak gelisah

Otomasi pertama kita: **kipas menyala saat ruangan panas**. Aturan paling sederhana, "nyalakan kalau suhu di atas 30 °C, matikan kalau tidak", ternyata buruk. Bacaan DHT22 selalu bergoyang sedikit, misalnya 29,9 → 30,1 → 29,9 → 30,2. Dengan satu batas di 30, kipas akan menyala, mati, menyala, dan mati setiap 10 detik. Relay berbunyi "klik" terus, kipas cepat rusak, dan penghuni rumah kesal.

Obatnya adalah **histeresis**: dua batas, bukan satu. **Kipas menyala di atas 30 °C** dan **baru padam di bawah 28 °C**. Di antara keduanya (28–30 °C), kipas **dibiarkan** dalam keadaan terakhirnya. Termostat AC dan setrika bekerja dengan cara yang sama.

![Grafik histeresis kipas: suhu terhadap waktu, satu titik setiap 10 detik. Garis putus-putus merah di 30 °C adalah batas nyala, garis putus-putus biru di 28 °C batas padam, dan pita kuning di antaranya berarti biarkan keadaan terakhir. Kurva suhu bergoyang naik dari 27 °C sampai sekitar 31,5 °C, lalu turun ke sekitar 27 °C. Titik merah saat suhu pertama kali melewati 30: 1 perintah, kipas nyala. Titik biru saat suhu turun di bawah 28: 1 perintah, kipas padam. Bilah di bawah grafik: kipas PADAM, lalu NYALA (tetap nyala walau suhu sempat turun ke pita 28–30), lalu PADAM. Catatan: kalau hanya ada satu batas di 30 °C, kurva yang sama memicu 8 perintah, relay klik-klik setiap kali suhu bergoyang dari 29,9 ke 30,1 lalu ke 29,9 lagi; dengan dua batas, hanya 2 perintah.](aset/histeresis-kipas.png)

Di Node-RED, histeresis disusun dari empat node bawaan, tanpa kode:

1. **switch** `histeresis 30/28` dengan dua aturan, `> 30` dan `< 28` (keduanya bertipe angka). Suhu 28–30 °C tidak cocok dengan aturan mana pun sehingga pesannya dibuang: inilah pita "biarkan saja".
2. Dua **change**, `kipas nyala` dan `kipas padam`, yang mengubah pesan menjadi `msg.payload = true` atau `false`, dengan `msg.topic = "kipas"`.
3. **filter** `hanya kalau berubah` dengan mode `block unless value changes`. Selama suhu tetap di atas 30 °C, jalur 1 mengeluarkan `true` setiap 10 detik. Filter hanya meneruskan pesan yang **berbeda** dari pesan terakhir, jadi perintah hanya terkirim saat keputusannya berubah, bukan setiap 10 detik.
4. Node **`buat cmd`** dari Konsep 6, lalu **mqtt out**.

Urutannya penting: **filter harus berada sebelum `buat cmd`.** Setelah `buat cmd`, setiap pesan selalu berbeda karena `id`-nya baru. Akibatnya, filter tidak pernah menahan apa pun. Satu jebakan lagi: bacaan yang gagal (`null`) **lolos** aturan `< 28` karena JavaScript menganggap `null < 28` benar. Tanpa penjaga, sensor yang copot akan mematikan kipas. Karena itu, otomasi ini dipasang **di belakang** node switch `DHT22 terbaca?` dari Praktik 4, yang hanya meneruskan suhu yang benar-benar terbaca.

**Dua otak itu berbahaya.** Node 1 sudah punya aturan lokal sejak Modul 6 dan Modul 8: **siram otomatis** saat tanah kering (lengkap dengan pengaman tandon) dan **lampu otomatis** saat ada gerakan di tempat gelap. Kalau Node-RED juga membuat aturan siram berdasarkan sensor tanah, dua otak akan saling menimpa. Karena itu, otomasi Node-RED minggu ini **hanya kipas**, satu-satunya aktuator yang belum punya aturan lokal. Di Modul 19, Node 1 juga mendapat aturan kipas lokal sebagai pengaman kalau gateway mati, dan pembagian tugasnya dibahas lagi di sana.

> ➡️ **Saatnya praktik!** Konsep 7 cukup untuk [Praktik 6 — Otomasi kipas berhisteresis](#praktik-6--otomasi-kipas-berhisteresis-30-menit). Setelah itu, kembali ke Konsep 8.

### 8. Menyimpan flow: ekspor, impor, dan keamanan

Flow yang sudah di-*deploy* tersimpan di `~/.node-red/flows.json` **di kartu microSD gateway**. Kalau kartu itu rusak, semua jarum, sakelar, dan otomasi ikut hilang. Seperti `gateway-pi.conf` di Modul 12, salinannya harus ada di repositori.

**Ekspor** dilakukan dari menu utama (ikon tiga garis) → **Export**, atau **Ctrl + E**. Pilih **all flows** (semua tab), format **formatted** (rapi berbaris-baris sehingga perubahannya mudah dibaca di GitHub), lalu **Download**. Browser menyimpan berkas bernama `flows.json`, yang kita simpan sebagai **`edge/node-red-flows.json`** di folder `rumah-pintar-mini` supaya tidak tertukar dengan berkas di Pi. Isinya adalah daftar node dalam JSON, termasuk node pengaturan seperti `Mosquitto di gateway` dan susunan dashboard, ditambah satu catatan yang menyebut paket yang dibutuhkan (`@flowfuse/node-red-dashboard`).

**Yang tidak ikut terekspor** justru melegakan: **kata sandi dan kredensial**. Nama pengguna dan kata sandi broker (kelak, Modul 21) disimpan terpisah di `flows_cred.json`, dikunci dengan *passphrase*-mu, dan tidak pernah ikut ekspor. Jadi, berkas `edge/node-red-flows.json` aman untuk repositori publik. Yang **tidak** boleh masuk repositori adalah `settings.js` (berisi *passphrase* apa adanya), `flows_cred.json`, dan berkas tersembunyi `.config.*.json` serta `.sessions.json` (tanda masuk editor yang masih berlaku) dari folder `~/.node-red`.

**Impor** adalah kebalikannya: menu utama → **Import** (**Ctrl + I**) → **select a file to import** → pilih berkas JSON → **Import**. Kalau flow itu memakai Dashboard 2 dan Node-RED tujuannya belum memasangnya, muncul `Required modules missing` dengan tombol untuk memasangnya sekaligus. Setelah impor, yang biasanya perlu disesuaikan hanya dua: alamat **Server** di node broker dan `device_id` di setiap topik.

**Ringkasan keamanan minggu ini:**

| Bagian | Dijaga dengan | Catatan |
| :--- | :--- | :--- |
| Terminal Pi | SSH + kata sandi Pi (Modul 12) | `sudo` tetap meminta kata sandi |
| Editor Node-RED (`:1880`) | **Username** + **Password** dari `node-red admin init` | jangan dibuka lewat *port forwarding* |
| Dashboard (`:1880/dashboard`) | belum dijaga | siapa pun di WiFi rumah bisa membuka dan menekan sakelar; Modul 21 |
| Broker (`:1883`) | belum dijaga | sama seperti Modul 11–12; Modul 21 |
| Repositori | ekspor tanpa kredensial | jangan salin `settings.js`, `flows_cred.json` |

> ➡️ **Saatnya praktik!** Konsep 8 cukup untuk [Praktik 7 — Simpan flow ke repositori](#praktik-7--simpan-flow-ke-repositori-20-menit).

---

## 🔧 Praktik langkah demi langkah

Hampir semua praktik minggu ini dikerjakan **di editor Node-RED**, di browser laptop (`http://192.168.1.37:1880`). Terminal SSH ke Pi hanya dipakai di Praktik 2, dan HP dipakai mulai Praktik 3. Tiga kebiasaan sebelum mulai:

> [!IMPORTANT]
> 1. **Klik Deploy setelah mengubah.** Perubahan di editor baru berjalan setelah kamu mengeklik **Deploy** (atau **Ctrl + D**). Titik biru di atas node berarti "belum diterapkan".
> 2. **Pilih broker yang sudah ada.** Di setiap node MQTT baru, pilih `Mosquitto di gateway` dari daftar **Server**. Jangan klik tombol **+** di sebelahnya lagi; tombol itu membuat broker kedua.
> 3. **Ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu** di setiap topik. Lihat catatanmu dari Modul 11, atau baca topiknya di panel debug Kemenangan Cepat.

Cara membuka editor kapan saja: browser laptop → `http://192.168.1.37:1880` → **Username** `admin` dan kata sandi editor → **Login**. Setelah masuk, kamu tidak perlu masuk lagi selama tujuh hari. Kalau Node-RED dinyalakan ulang saat tab editornya masih terbuka, editor menulis bahwa sambungannya terputus, lalu tersambung lagi sendiri; muat ulang halamannya kalau perlu.

### Praktik 1 — Tur editor dan flow pertama (25 menit)

> 🖥️ **Alat:** browser laptop dengan editor Node-RED. Node 1 tidak dibutuhkan. Konsep yang dipakai: 1–2.

Di Kemenangan Cepat, flow pertamamu (`telemetry Node 1` → debug) tinggal di tab `Flow 1`. Supaya tab itu tetap rapi, latihan ini dikerjakan di tab baru.

#### 1.1 Tab latihan dan tombol inject

1. **Di editor Node-RED**, klik tanda **+** di ujung kanan deretan tab (di atas ruang kerja). Muncul tab baru, `Flow 2`.
2. Klik dua kali tab `Flow 2`. Di jendela pengaturannya, ubah **Name** menjadi `Latihan`, lalu klik **Done**.
3. Dari palet (kategori `common`), seret node **inject** ke ruang kerja. Labelnya berubah menjadi `timestamp`: bawaannya, node ini mengirim waktu sekarang.
4. Seret node **debug** ke kanan node inject, lalu sambungkan keduanya (titik kanan inject → titik kiri debug).
5. Klik **Deploy**.
6. Klik **kotak kecil di sisi kiri** node inject. Itulah tombolnya. Di panel **Debug messages** muncul satu pesan dari node debug barumu (barisnya bertanda nama node itu, misalnya `node: debug 2`) yang berisi angka besar, misalnya `1792301234567`. Angka itu adalah jumlah milidetik sejak 1 Januari 1970, cara komputer menyimpan waktu (mirip angka di depan baris `mosquitto.log` Modul 12, tetapi dalam milidetik). Kalau Node 1 menyala, pesan `telemetry` dari tab `Flow 1` (`node: debug 1`) juga tetap muncul setiap 10 detik karena panel debug menampilkan pesan dari semua tab; itu wajar.

#### 1.2 Mengubah isi pesan

1. Klik dua kali node inject. Di baris `msg.payload`, klik panah kecil di depan isian `timestamp`, lalu pilih jenis **string** (ikon **az**). Ketik `halo dari gateway`.
2. Di baris `msg.topic`, ketik `latihan`. Klik **Done**.
3. Perhatikan titik biru di atas node inject: perubahan ini belum diterapkan. Klik **Deploy**, lalu klik tombol inject. Panel debug kini menampilkan `latihan : msg.payload : string[17]` dengan isi `"halo dari gateway"`.

#### 1.3 Stasiun kerja di tengah ban: node change

1. Seret node **change** (kategori `function`) dan lepaskan **tepat di atas kabel** antara inject dan debug. Kabelnya tersorot, dan node change tersisip di tengah dengan sendirinya.
2. Klik dua kali node change. Aturan pertamanya sudah **Set** `msg.payload`. Di isian **to the value**, pilih jenis **J: expression**, lalu ketik:

   ```text
   $uppercase(payload) & "!"
   ```

   **JSONata** adalah bahasa kecil untuk mengolah data JSON (dibahas di Konsep 6). Ekspresi ini mengubah teks menjadi huruf kapital, lalu menyambungnya (`&`) dengan tanda seru. Isi **Name** `besarkan huruf`, lalu klik **Done**.
3. Klik dua kali node debug. Ubah **Output** dari `msg.payload` menjadi `complete msg object`, lalu klik **Done**.
4. Klik **Deploy**, lalu klik tombol inject. **Hasilnya** di panel debug (klik **▸** untuk membuka):

   ```text
   ▾object
     _msgid: "3c5e4b2f8a1d7e90"
     payload: "HALO DARI GATEWAY!"
     topic: "latihan"
   ```

   Itulah seluruh `msg`: `payload` yang diubah node change, `topic` dari inject, dan `_msgid`, nomor unik yang diberikan Node-RED kepada setiap pesan.

#### 1.4 Jadwal, debug yang dimatikan, dan tombol batal

1. Klik dua kali node inject. Di bagian bawah, ubah **Repeat** dari `none` menjadi `interval`, **every** `5` **seconds**. Klik **Done**, lalu **Deploy**. Kini pesan datang sendiri setiap 5 detik: inilah cara Node-RED membuat jadwal.
2. Panel debug cepat penuh. Klik **tombol hijau di sisi kanan node debug**: tombolnya memudar dan pesan dari node itu berhenti muncul di panel walaupun flow tetap berjalan. Klik sekali lagi untuk menyalakannya. Tombol **tempat sampah** di panel debug membersihkan isinya.
3. Pilih node change dengan sekali klik, lalu tekan **Delete**. Node dan kabelnya hilang. Tekan **Ctrl + Z**: node itu kembali. Tombol batal ini menyelamatkanmu kalau salah hapus selama halaman editor belum dimuat ulang. Kalau hapusan itu telanjur di-*deploy*, tekan **Ctrl + Z**, lalu klik **Deploy** lagi.
4. Selesai berlatih, matikan jadwalnya: kembalikan **Repeat** inject ke `none`, lalu klik **Deploy**. Tab `Latihan` boleh dibiarkan; tab ini tidak mengganggu flow lain.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 3](#3-node-red-di-gateway-layanan-berkas-dan-kata-sandi).

### Praktik 2 — Node-RED sebagai layanan dan mendengar Node 1 (30 menit)

> 🖥️ **Alat:** editor Node-RED, terminal SSH ke Pi, **MQTTX** di laptop, dan Node 1 yang menyala. Konsep yang dipakai: 3–4.

#### 2.1 Beri nama tab proyek

1. **Di editor Node-RED**, klik tab `Flow 1` (berisi `telemetry Node 1` dari Kemenangan Cepat). Klik dua kali tab itu, ubah **Name** menjadi `Rumah Pintar Mini`, lalu klik **Done**. Semua flow proyek minggu ini tinggal di tab ini.
2. Klik dua kali node debug dari Kemenangan Cepat, isi **Name** `lihat telemetry`, lalu klik **Done**. Nama yang jelas membantu saat panel debug ramai.

#### 2.2 Dengarkan `status` dan `ack`

1. Seret node **mqtt in** baru ke bawah `telemetry Node 1`. Klik dua kali node itu, lalu isi:
   - **Server**: pilih `Mosquitto di gateway` dari daftar (sudah ada sejak Kemenangan Cepat)
   - **Topic**: `rpm/a4cf12e5b7c0/status`
   - **QoS**: `1`
   - **Name**: `status Node 1`

   Klik **Done**, lalu sambungkan ke node **debug** baru bernama `lihat status`.
2. Dengan cara yang sama, buat node **mqtt in** ketiga: **Topic** `rpm/a4cf12e5b7c0/ack`, **QoS** `0`, **Name** `ack Node 1`, disambung ke node debug baru bernama `lihat ack`.
3. Klik **Deploy**. Pesan `online` dari `status Node 1` langsung muncul di panel debug walaupun Node 1 tidak menerbitkan apa pun saat itu. Itulah pesan *retained* dari Modul 11: broker menyimpannya dan menyerahkannya kepada setiap pelanggan baru.
4. **Di laptop**, buka **MQTTX**, sambungkan **Gateway Pi** (Praktik 3.3 Modul 12), lalu kirim satu perintah seperti ➕ C Modul 12: topik `rpm/a4cf12e5b7c0/cmd`, QoS `1`, **Retain** tidak dicentang, isi `{"id":"c-301","aksi":"set","target":"lampu","nilai":true}` dengan format **JSON**. Relay lampu berbunyi "klik", dan di panel debug Node-RED muncul `ack`:

   ```text
   rpm/a4cf12e5b7c0/ack : msg.payload : Object
   ▾object
     id: "c-301"
     ts: "2026-10-18T03:41:07Z"
     ok: true
     ▸state: object
   ```

   Klik **▸** di depan `state` untuk melihat keadaan keempat aktuator. Kirim sekali lagi dengan `"nilai":false` dan `id` baru (`c-302`) untuk mematikan lampu. Node-RED dan MQTTX sama-sama mendengarkan; broker menyerahkan pesan yang sama kepada setiap pelanggan.

#### 2.3 Uji layanan: Node-RED bangkit sendiri

1. **Di laptop**, buka terminal dan masuk ke Pi (`ssh budi@192.168.1.37`). **Di Pi**, nyalakan ulang layanannya:

   ```bash
   sudo systemctl restart nodered
   ```

   Di browser, editor sebentar menulis bahwa sambungannya ke server terputus, lalu tersambung lagi sendiri dalam beberapa detik. Flow-mu tetap ada karena tersimpan di `~/.node-red/flows.json`.
2. Lihat catatan saat Node-RED menyala:

   ```bash
   node-red-log
   ```

   **Hasilnya** (contoh; tekan **Ctrl + C** untuk berhenti mengikuti):

   ```text
   18 Oct 10:45:02 - [info]

   Welcome to Node-RED
   ===================

   18 Oct 10:45:02 - [info] Node-RED version: v5.0.8
   18 Oct 10:45:02 - [info] Node.js  version: v24.22.0
   18 Oct 10:45:02 - [info] Linux 6.18.50+rpt-rpi-2712 arm64 LE
   18 Oct 10:45:03 - [info] Loading palette nodes
   18 Oct 10:45:05 - [info] Settings file  : /home/budi/.node-red/settings.js
   18 Oct 10:45:05 - [info] Context store  : 'default' [module=memory]
   18 Oct 10:45:05 - [info] User directory : /home/budi/.node-red
   18 Oct 10:45:05 - [warn] Projects disabled : editorTheme.projects.enabled=false
   18 Oct 10:45:05 - [info] Flows file     : /home/budi/.node-red/flows.json
   18 Oct 10:45:05 - [info] Server now running at http://127.0.0.1:1880/
   18 Oct 10:45:05 - [info] Starting flows
   18 Oct 10:45:05 - [info] Started flows
   18 Oct 10:45:05 - [info] [mqtt-broker:Mosquitto di gateway] Connected to broker: mqtt://localhost:1883
   ```

   Baris `[warn] Projects disabled` hanyalah pemberitahuan bahwa fitur Projects dimatikan (jawabanmu di `node-red admin init`), bukan kesalahan. Baris `Server now running at http://127.0.0.1:1880/` juga tidak berarti Node-RED hanya bisa dibuka dari Pi; dari laptop dan HP tetap pakai `http://192.168.1.37:1880`. Baris terakhir adalah yang paling penting: Node-RED tersambung ke Mosquitto.
3. Ujian sebenarnya: nyalakan ulang seluruh Pi.

   ```bash
   sudo reboot
   ```

   Sambungan SSH langsung putus (`Connection to 192.168.1.37 closed by remote host.`); itu wajar, seperti Praktik 1.4 Modul 12. Tunggu sekitar satu menit, lalu muat ulang editor di browser (masuk lagi kalau diminta). Panel debug kembali menerima `telemetry` setiap 10 detik tanpa kamu menyalakan apa pun. Node-RED, seperti Mosquitto, kini menjadi bagian tetap gateway. Kalau editor tidak terbuka setelah 2–3 menit, buka 🚨 "Editor tidak terbuka".

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 5](#5-dashboard-2-halaman-grup-dan-widget).

### Praktik 3 — Dashboard 2 dan jarum suhu pertama (30 menit)

> 🖥️ **Alat:** editor Node-RED, HP yang tersambung ke WiFi rumah, dan Node 1 yang menyala. Konsep yang dipakai: 5.
>
> ⭐ **Wajib** — syarat lulus Modul 13 meminta HP membuka dashboard dari gateway.

#### 3.1 Pasang Dashboard 2

1. **Di editor Node-RED**, buka menu utama (ikon tiga garis di kanan atas), lalu pilih **Manage palette**.
2. Panel `User Settings` terbuka di sisi kanan dengan bagian **Palette** sudah terpilih. Klik tab **Install**. Di kotak `search modules`, ketik `node-red-dashboard`.
3. Muncul daftar panjang: puluhan paket yang berkaitan dengan `node-red-dashboard`, sepuluh di antaranya ditampilkan dulu. Dua teratas biasanya `node-red-dashboard` dan `@flowfuse/node-red-dashboard`. Pilih yang namanya **persis** **`@flowfuse/node-red-dashboard`**, tanpa tambahan di belakangnya (bukan, misalnya, `@flowfuse/node-red-dashboard-2-ui-led`), lalu klik tombol **install** di sampingnya. Paket `node-red-dashboard` tanpa awalan bertanda `deprecated` (usang); jangan dipilih.
4. Muncul kotak konfirmasi berisi `Installing '@flowfuse/node-red-dashboard'` dan anjuran membaca dokumentasi paketnya. Klik **Install** di kotak itu, bukan **Open node information**. Pemasangan memakan 1–3 menit di Pi; jangan menutup tab browser.
5. Setelah selesai, muncul notifikasi `Nodes added to palette:` berisi daftar node baru. Tutup panel `User Settings` dengan tombol **Close** di kanan atasnya. Gulir palet ke bawah: ada kategori baru, **`dashboard 2`**.

Node-RED tidak perlu dinyalakan ulang. Di balik layar, paket itu dipasang ke folder `~/.node-red/node_modules` di Pi.

#### 3.2 Teks status: widget pertama

1. Di tab `Rumah Pintar Mini`, seret node **text** (kategori `dashboard 2`) ke kanan `status Node 1`. Karena ini widget pertama, Dashboard 2 langsung membuatkan dashboard, halaman `Page 1`, dan grup `Group 1`.
2. Klik dua kali node text itu. Kita mulai dengan **mengganti nama-nama buatan otomatis**:
   1. Di baris **Group** (isinya `[Page 1] Group 1`), klik ikon pensil di sebelahnya. Di jendela pengaturan grup, ubah **Name** menjadi `Sensor`.
   2. Masih di jendela itu, klik ikon pensil di baris **Page**. Ubah **Name** halaman menjadi `Rumah` dan **Path** menjadi `/rumah` (diawali garis miring).
   3. Masih di jendela halaman, klik ikon pensil di baris **UI**. Ubah **Name** dashboard menjadi `Rumah Pintar Mini`. Isian **Path** `/dashboard` memang terkunci; biarkan.
   4. Klik **Update** di setiap jendela untuk kembali satu per satu sampai jendela node text terbuka lagi. Baris **Group** kini bertulisan `[Rumah] Sensor`.
3. Isi **Label** `Node 1`. Biarkan **Value** `msg.payload`: isi pesan `status` memang teks `online` atau `offline`. Klik **Done**.
4. Sambungkan `status Node 1` ke node text itu, lalu klik **Deploy**.

#### 3.3 Jarum suhu

1. Seret node **gauge** (kategori `dashboard 2`) ke kanan `telemetry Node 1`, lalu klik dua kali. **Group** sudah terisi `[Rumah] Sensor`.
2. Isi pengaturannya:
   - **Type**: biarkan `Half Gauge` (setengah lingkaran)
   - **Value**: biarkan jenisnya `msg.`, lalu ketik `payload.suhu` (sehingga lengkapnya `msg.payload.suhu`)
   - **Range**: **min.** `0`, **max.** `50`
   - **Segments** (warna busur): ubah angka bawaannya `0`, `4`, `7` menjadi `0` (hijau), `28` (kuning), dan `30` (merah), sesuai batas otomasi kipas nanti. Setiap baris segmen berisi kotak warna, angka tempat warna itu mulai, daftar pilihan milik segmen itu (isinya `Label`; biarkan saja), dan tombol **✕** di ujung kanan untuk menghapus barisnya. Warna bawaannya sudah hijau, kuning, dan merah, jadi untuk suhu cukup angkanya yang diubah; untuk gauge di 4.2, klik kotak warnanya, lalu pilih warna baru di jendela warna yang muncul.
   - **Label**: `Suhu` (isian di bagian `Labelling`, di bawah **Segments**)
   - **Units**: `°C` (di Windows, tanda derajat bisa disalin dari teks ini)
3. Klik **Done**. Sambungkan titik kanan `telemetry Node 1` ke titik kiri gauge. Satu keluaran boleh punya banyak kabel: kabel ke `lihat telemetry` tetap ada.
4. Klik **Deploy**.

#### 3.4 Buka dashboard di laptop dan HP

1. **Di editor Node-RED**, buka panel **Dashboard 2.0** di sisi kanan: klik ikon grafik batang di deretan ikon kecil di pojok kanan bawah editor (arahkan mouse ke ikonnya untuk melihat namanya), lalu klik **Open Dashboard**. Tab baru terbuka dengan halaman `Rumah`: jarum suhu dan tulisan `Node 1 … online`.
2. **Di HP** yang tersambung ke WiFi rumah, buka browser dan ketik:

   ```text
   http://192.168.1.37:1880/dashboard/rumah
   ```

   Halaman yang sama muncul, dan jarumnya bergerak setiap 10 detik. Dashboard tidak meminta kata sandi; itulah catatan keamanan di Konsep 3.
3. Supaya mudah dibuka lagi, tambahkan halaman ini ke layar utama HP: di Chrome Android, menu **⋮** → **Tambahkan ke layar utama** (**Add to Home screen**); di Safari iPhone, tombol **Bagikan** (**Share**) → **Add to Home Screen**.

Coba hangatkan sensor DHT22 dengan menggenggamnya beberapa detik: setelah satu atau dua kiriman, jarum suhu naik. Dashboard pertamamu sudah hidup.

> ➡️ **Lanjut** ke [Praktik 4 — Panel sensor lengkap](#praktik-4--panel-sensor-lengkap-30-menit) tanpa kembali ke konsep.

### Praktik 4 — Panel sensor lengkap (30 menit)

> 🖥️ **Alat:** editor Node-RED, HP, dan Node 1. Konsep yang dipakai: 5.

#### 4.1 Penjaga `null` untuk DHT22

Kalau DHT22 gagal dibaca, Node 1 mengirim `"suhu": null` (Modul 11), dan gauge menampilkan `null` sebagai **0**. Kita pasang penjaga:

1. **Di editor Node-RED**, seret node **switch** dari kategori **`function`** (bukan yang di `dashboard 2`) dan lepaskan di atas kabel antara `telemetry Node 1` dan gauge **Suhu** sehingga tersisip di tengah.
2. Klik dua kali switch itu, lalu isi:
   - **Property**: `msg.` `payload.suhu`
   - Aturan pertama: klik daftar operator (isinya `==`), pilih **is not null**
   - **Name**: `DHT22 terbaca?`
3. Klik **Done**. Kini gauge hanya menerima pesan yang suhunya benar-benar terbaca; kalau DHT22 sesekali gagal, jarum tetap di nilai terakhir.

#### 4.2 Kelembapan, tanah, dan air tandon

1. **Kelembapan.** Seret **gauge** baru. Isi **Group** `[Rumah] Sensor`, **Value** `msg.` `payload.kelembapan`, **Range** `0`–`100`, **Segments** `0` kuning, `40` hijau, dan `80` kuning (ketiga warnanya diganti lewat kotak warna), **Label** `Kelembapan`, **Units** `%`. Sambungkan dari keluaran **`DHT22 terbaca?`** karena kelembapan juga berasal dari DHT22.
2. **Tanah.** Seret **gauge** baru: **Value** `msg.` `payload.tanah`, **Range** `0`–`100`, **Segments** cukup dua baris, `0` merah dan `30` hijau (hapus baris ketiga dengan **✕**), **Label** `Tanah`, **Units** `%`. Sambungkan langsung dari `telemetry Node 1`; sensor tanah tidak pernah mengirim `null`.
3. **Air tandon.** Sensor jarak HC-SR04 bisa gagal (`"level_air": null`), jadi buat penjaga kedua: node **switch** (`function`) dengan **Property** `msg.` `payload.level_air`, aturan **is not null**, **Name** `air terbaca?`, disambung dari `telemetry Node 1`. Lalu seret **gauge** baru dan ubah dulu **Type** menjadi `Tank Level`. Begitu jenisnya berganti, **Range** otomatis menjadi `0`–`100`, dan **Segments** berganti menjadi empat baris biru bawaan tangki: hapus dua baris dengan **✕**, lalu ubah dua sisanya menjadi `0` merah dan `20` hijau (batas pengaman pompa sejak Modul 6). Isi **Value** `msg.` `payload.level_air` dan **Label** `Air tandon`; isian **Units** sengaja tidak muncul untuk `Tank Level` karena tangki selalu menulis isinya dalam persen. Sambungkan dari `air terbaca?`.

#### 4.3 Cahaya dan gerak sebagai kalimat

Angka `cahaya` seperti `2310` tidak berarti banyak bagi orang serumah. Node **text** bisa menampilkan kalimat yang dihitung dengan JSONata:

1. Seret node **text**, lalu isi **Group** `[Rumah] Sensor` dan **Label** `Cahaya`. Di **Value**, ubah jenisnya menjadi **J: expression**, lalu ketik:

   ```text
   payload.cahaya < 1000 ? "gelap (" & payload.cahaya & ")" : "terang (" & payload.cahaya & ")"
   ```

   Artinya: kalau `cahaya` di bawah `1000` (batas gelap di kontrak data), tulis "gelap"; kalau tidak, tulis "terang". Angkanya ditambahkan di dalam kurung.
2. Seret node **text** lagi, isi **Label** `Gerak`, lalu ubah jenis **Value** menjadi **J: expression** dan ketik:

   ```text
   payload.gerak ? "ada gerakan" : "sepi"
   ```

3. Sambungkan keduanya dari `telemetry Node 1`.

#### 4.4 Grafik suhu dan kelembapan

1. Seret node **chart** (kategori `dashboard 2`), lalu klik dua kali. Kita butuh grup baru: di baris **Group**, klik tombol **+** di ujung kanan (petunjuknya `Add new ui-group config node`). Isi **Name** `Grafik`, pastikan **Page** menunjuk halaman `Rumah`, lalu klik **Add**.
2. Isi pengaturan chart:
   - **Label**: `Suhu & kelembapan (1 jam terakhir)`
   - **Type**: biarkan `Line`
   - **X-Axis Limit**: biarkan `last 1 Hours`
   - **Y-Axis**: **min.** `0`, **max.** `100` (supaya kedua garis terlihat dalam satu skala)
   - **Series**: ubah jenisnya menjadi **JSON**, lalu ketik `["suhu","kelembapan"]`
3. Klik **Done**, lalu sambungkan dari keluaran **`DHT22 terbaca?`**.
4. Klik **Deploy**, lalu lihat HP. Halamannya kini memuat kartu **Sensor** (status, suhu, kelembapan, tanah, air tandon, cahaya, gerak) dan kartu **Grafik** dengan dua garis yang bertambah setiap 10 detik.

![Dua tangkapan layar dashboard Rumah setelah Praktik 4, diambil di browser laptop yang dipersempit selebar layar HP (412 piksel), lalu dibingkai sebagai HP, dengan lima penanda dan keterangannya. Layar kiri, bagian atas, kartu Sensor: penanda 1 pada baris Node 1 online, widget text dari topik status (pesan retained) yang menjadi offline kalau Node 1 padam; penanda 2 pada jarum Suhu 29.3 °C dengan busur hijau di bawah 28, kuning 28–30, dan merah mulai 30, di atas jarum Kelembapan 71 % dan Tanah 37 %; penanda 3 pada Air tandon, gauge jenis Tank Level berisi 64 %. Layar kanan, setelah digulir: penanda 4 pada Cahaya terang (2310) dan Gerak sepi, widget text dengan JSONata; penanda 5 pada kartu Grafik, chart Suhu & kelembapan (1 jam terakhir) dengan garis kelembapan merah dan garis suhu biru yang bergelombang, bertambah setiap 10 detik. Catatan: di HP-mu, bilah alamat browser tampil di atasnya, http://192.168.1.37:1880/dashboard/rumah.](aset/hp-dashboard.png)

*Tangkapan layar asli FlowFuse Dashboard 1.33.0 (lisensi Apache 2.0) dari browser laptop penulis yang dipersempit selebar layar HP, dengan data dari Node 1 tiruan; bingkai HP, nomor, dan keterangan oleh penulis.*

Kartu **Grafik** mungkin muncul di atas kartu **Sensor**. Itu wajar: grup yang dibuat lewat tombol **+** belum punya nomor urut sehingga Dashboard 2 menaruhnya paling atas. Buka panel **Dashboard 2.0** → tab **Layout**, seret grup `Grafik` ke bawah `Sensor`, lalu klik **Deploy**. Urutan widget di dalam kartu mengikuti urutan pembuatannya dan bisa diubah dengan cara yang sama: seret widget ke atas atau ke bawah.

> ⬆️ **Selesai Praktik 3–4?** Kembali ke [Konsep 6](#6-mengubah-pesan-change-switch-dan-perintah-ber-id).

### Praktik 5 — Kendali dari HP (40 menit)

> 🖥️ **Alat:** editor Node-RED, HP, Node 1 dengan relay, dan (di 5.6) terminal VS Code dengan pemeriksa kontrak dari Modul 11. Konsep yang dipakai: 6.
>
> ⭐ **Wajib** — syarat lulus Modul 13 meminta sakelar kipas di HP berfungsi.

Semua kendali minggu ini mengalir ke satu jalur yang sama: widget → **`buat cmd`** → **mqtt out**. Kita buat jalurnya dulu.

#### 5.1 Jalur perintah: `buat cmd` dan mqtt out

1. **Di editor Node-RED**, seret node **change** ke bagian kosong di bawah flow sensor. Klik dua kali node itu, lalu isi **Name** `buat cmd`. Di aturan **Set** `msg.payload`, ubah jenis **to the value** menjadi **J: expression**, lalu klik tombol **…** di ujung isian untuk membuka penyunting ekspresi yang lebih lega. Ketik:

   ```text
   {
     "id": "nr-" & $string($millis()),
     "ts": $now("[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]Z"),
     "aksi": "set",
     "target": topic,
     "nilai": payload
   }
   ```

   Klik **Done** di penyunting ekspresi, lalu **Done** di node change. Arti setiap barisnya ada di Konsep 6.
2. Seret node **mqtt out** (kategori `network`) ke kanan `buat cmd`. Klik dua kali, lalu isi:
   - **Server**: `Mosquitto di gateway`
   - **Topic**: `rpm/a4cf12e5b7c0/cmd`
   - **QoS**: `1`
   - **Retain**: `false` (jangan dibiarkan kosong; lihat Konsep 4)
   - **Name**: `cmd Node 1`
3. Sambungkan `buat cmd` ke `cmd Node 1`. Tambahkan juga node **debug** bernama `lihat cmd` yang disambung dari `buat cmd` supaya setiap perintah yang keluar terlihat di panel debug.

#### 5.2 Sakelar kipas yang jujur

1. Seret node **switch** dari kategori **`dashboard 2`** (berikon sakelar geser, bukan pemilah dari `function`). Klik dua kali. Kita butuh grup baru untuk kendali: di baris **Group**, klik tombol **+**, isi **Name** `Kendali`, pastikan **Page** menunjuk `Rumah`, lalu klik **Add**.
2. Isi pengaturan sakelar:
   - **Label**: `Kipas`
   - **If `msg` arrives on input, pass through to output**: **jangan** dicentang
   - **Indicator**: `Switch icon shows state of the input`
   - **On Payload** `true` dan **Off Payload** `false` (bawaan, biarkan)
   - **Topic**: ubah jenisnya menjadi **string** (ikon **az**), lalu ketik `kipas`
3. Klik **Done**, lalu sambungkan sakelar ke `buat cmd`.
4. Sekarang umpan baliknya. Seret node **change**, beri **Name** `keadaan kipas`, lalu isi aturan **Set** `msg.payload` **to the value** jenis **msg.** `payload.state.kipas`. Sambungkan `ack Node 1` (dari Praktik 2) → `keadaan kipas` → sakelar **Kipas**. Kabel terakhir ini masuk ke **sisi kiri** sakelar.
5. Klik **Deploy**. Di HP, muat ulang dashboard: kartu **Kendali** muncul dengan sakelar **Kipas**. Seperti kartu **Grafik** di Praktik 4, kartu baru ini mungkin muncul paling atas. Di panel **Dashboard 2.0** → tab **Layout**, seret grup `Kendali` ke antara `Sensor` dan `Grafik`, lalu klik **Deploy** lagi.
6. Ketuk sakelarnya. Sakelar menampilkan tanda tunggu (lingkaran kecil yang berputar) sebentar, relay kipas berbunyi "klik", lalu sakelar bergeser ke **nyala**. Urutannya: sakelar → `buat cmd` → broker → Node 1 menyalakan relay → Node 1 menjawab `ack` → `keadaan kipas` → sakelar. Di panel debug, `lihat cmd` menampilkan perintahnya:

   ```text
   ▾object
     id: "nr-1792295887215"
     ts: "2026-10-18T03:58:07Z"
     aksi: "set"
     target: "kipas"
     nilai: true
   ```

   Sekarang uji kejujurannya. Ketuk sakelarnya sekali lagi sampai relay berbunyi "klik" dan sakelar bergeser ke **padam**. Lalu matikan Node 1 dengan urutan aturan emas: **matikan MB102** dulu, baru cabut USB-nya dari *charger* (pengguna Wokwi: hentikan simulasinya). Ketuk sakelarnya lagi: tanda tunggunya tidak pernah berubah menjadi nyala karena tidak ada `ack` yang datang, dan dalam setengah menit teks `Node 1` berganti `offline`. Sakelar tidak berbohong. Nyalakan lagi Node 1: colokkan USB ke *charger*, **baru** nyalakan MB102 (modul microSD beregulator: tekan **EN** sesudahnya), seperti ➕ D Modul 12; pengguna Wokwi cukup menjalankan lagi simulasinya. Setelah teks `Node 1` kembali `online`, ketuk sakelarnya sekali lagi: kali ini `ack` datang, dan sakelar bergeser ke **nyala**.

> ⚠️ **Jangan centang *pass through* di sakelar yang menerima `ack`.** Kalau dicentang, setiap `ack` yang masuk diteruskan sakelar menjadi perintah baru, perintah itu dijawab `ack` lagi, dan seterusnya tanpa henti.

#### 5.3 Sakelar lampu

Ulangi 5.2 untuk lampu: sakelar **Label** `Lampu`, **Group** `[Rumah] Kendali`, **Topic** string `lampu`, **Indicator** `Switch icon shows state of the input`, disambung ke `buat cmd`; lalu node change `keadaan lampu` (**Set** `msg.payload` ← `msg.payload.state.lampu`) dari `ack Node 1` ke sakelar **Lampu**. Kiat: klik sakelar **Kipas**, lalu tahan **Ctrl** sambil mengeklik node `keadaan kipas` supaya keduanya terpilih (tepinya tersorot biru, atau merah kalau editormu bertema gelap). Tekan **Ctrl + C**, lalu **Ctrl + V**, dan klik di ruang kosong untuk meletakkan salinannya. Ubah isian salinannya, lalu sambungkan lagi dua kabel yang tidak ikut tersalin: sakelar **Lampu** → `buat cmd` dan `ack Node 1` → `keadaan lampu`.

Ingat bahwa Node 1 juga punya lampu otomatis (gerak di tempat gelap, Modul 6). Kalau lampu dinyalakan dari dashboard, Node 1 menganggapnya dinyalakan dengan tangan dan tidak mematikannya sendiri (Modul 11). Sakelar dashboard juga hanya tahu keadaan lampu dari `ack` terakhir, jadi lampu yang dinyalakan aturan otomatis Node 1 belum tampil di sakelar sampai ada perintah berikutnya.

#### 5.4 Tombol siram 5 detik

1. Seret node **button** (`dashboard 2`). Isi **Group** `[Rumah] Kendali`, **Label** `Siram 5 detik`.
2. Di bagian **Enable click event** → **Payload**, ubah jenisnya menjadi **number** (ikon **09**) dan isi `5`. Di **Topic**, pilih jenis **string** dan ketik `pompa`.
3. Sambungkan ke `buat cmd`, lalu klik **Deploy**. Ketuk tombolnya di HP: pompa menyala 5 detik.

Kontrak data membatasi `pompa` 1–10 detik, dan Node 1 **menolak** menyiram kalau air tandon di bawah 20 %. Penolakan itu terlihat di jawaban `ack` (5.6).

#### 5.5 Penggeser tirai

1. Seret node **slider** (`dashboard 2`). Isi **Group** `[Rumah] Kendali`, **Label** `Tirai (derajat)`, **Range** **min** `0`, **step** `10`, **max** `180`.
2. Ubah **Output** menjadi `only on release` supaya perintah baru dikirim saat jari dilepas, bukan puluhan kali selama penggeser digeser. Di **Topic**, pilih jenis **string** dan ketik `tirai`. Biarkan *pass through* tidak dicentang.
3. Sambungkan slider ke `buat cmd`. Buat juga umpan baliknya: node change `keadaan tirai` (**Set** `msg.payload` ← `msg.payload.state.tirai`) dari `ack Node 1` ke slider.
4. Klik **Deploy**, lalu geser penggesernya di HP: servo tirai berputar ke sudut itu.

#### 5.6 Jawaban terakhir dan pemeriksaan kontrak

1. Seret node **text** (`dashboard 2`), lalu isi **Group** `[Rumah] Kendali` dan **Label** `Jawaban terakhir`. Ubah jenis **Value** menjadi **J: expression**, lalu ketik:

   ```text
   payload.ok ? "dikerjakan" : payload.pesan
   ```

   Sambungkan dari `ack Node 1`, lalu klik **Deploy**. Setiap perintah kini menghasilkan kalimat di dashboard: `dikerjakan`, atau alasan penolakan dari kolom `pesan` di `ack`, misalnya `pompa ditolak: air tandon kurang` saat tandon di bawah 20 %.
2. **Di laptop**, buka terminal baru di VS Code (**Terminal → New Terminal**; terminal baru selalu mulai dari folder `rumah-pintar-mini`), masuk ke folder `alat` dengan `cd alat`, lalu jalankan pemeriksa kontrak Modul 11 dengan alamat Pi dan `device_id`-mu, seperti ➕ C Modul 12:

   ```bash
   node pemeriksa-kontrak.js 192.168.1.37 a4cf12e5b7c0
   ```

3. Ketuk sakelar kipas, tombol siram, dan penggeser tirai di HP. Di antara baris `telemetry` yang muncul setiap 10 detik, setiap perintah dari Node-RED (`cmd`) dan jawabannya (`ack`) harus `LULUS`. **Hasilnya** (contoh, hanya baris perintah dan jawabannya):

   ```text
   [10.58.07] rpm/a4cf12e5b7c0/cmd  LULUS
   [10.58.07] rpm/a4cf12e5b7c0/ack  LULUS  (dijawab 38 ms setelah perintah: di bawah 1 detik)
   ```

   Pemeriksa yang dulu menjaga Node 1 di Modul 11 kini juga menjaga Node-RED. Itulah kekuatan kontrak data. Hentikan pemeriksa dengan **Ctrl + C**.

![Tangkapan layar kartu Kendali setelah Praktik 5, diambil di browser laptop yang dipersempit selebar layar HP (412 piksel), lalu dibingkai sebagai HP, dengan lima penanda. Penanda 1, sakelar Kipas dalam keadaan nyala: bergeser hanya setelah ack dari Node 1 tiba, jadi yang terlihat adalah keadaan relay yang sebenarnya. Penanda 2, sakelar Lampu dalam keadaan padam: perintah keluar, ack kembali, baru sakelarnya bergeser. Penanda 3, tombol biru Siram 5 detik: satu ketukan sama dengan satu perintah pompa bernilai 5. Penanda 4, penggeser Tirai (derajat) di tengah: perintah dikirim saat jari dilepas, nilainya 0–180 derajat. Penanda 5, baris Jawaban terakhir bertuliskan dikerjakan, atau alasan penolakan dari kolom pesan di ack, misalnya pompa ditolak: air tandon kurang. Di bawahnya terlihat sebagian kartu Grafik.](aset/hp-kendali.png)

*Tangkapan layar asli FlowFuse Dashboard 1.33.0 (lisensi Apache 2.0) dari browser laptop penulis yang dipersempit selebar layar HP, dengan data dari Node 1 tiruan; bingkai HP, nomor, dan keterangan oleh penulis.*

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 7](#7-otomasi-dan-histeresis-kipas-yang-tidak-gelisah).

### Praktik 6 — Otomasi kipas berhisteresis (30 menit)

> 🖥️ **Alat:** editor Node-RED, HP, dan Node 1 dengan DHT22 serta relay kipas. Konsep yang dipakai: 7.
>
> ⭐ **Wajib** — syarat lulus Modul 13 meminta otomasi menyalakan kipas saat sensor dihangatkan.

#### 6.1 Pilih batas yang bisa diuji

Batas modul ini adalah **30 °C** (nyala) dan **28 °C** (padam). Masalahnya, suhu kamar di banyak rumah di Indonesia sudah 29–32 °C sehingga kipas bisa langsung menyala begitu otomasi di-*deploy*, dan kamu tidak bisa menguji perubahannya. Lihat jarum suhu di dashboard sekarang:

- **Suhu kamar di bawah 27 °C?** Pakai batas modul: nyala di atas `30`, padam di bawah `28`.
- **Suhu kamar 27 °C atau lebih?** Untuk pengujian, pakai suhu kamar ditambah 1 °C, dibulatkan ke atas, sebagai batas padam, dan batas padam ditambah 2 sebagai batas nyala. Misalnya, kalau suhu kamar 29,4 °C: padam di bawah `31`, nyala di atas `33`. Batas padam harus **di atas** suhu kamar karena sensor yang dilepas hanya kembali ke suhu kamar dan tidak pernah lebih dingin; batas padam yang sama dengan atau di bawah suhu kamar membuat kipas tidak pernah padam. Setelah pengujian selesai, kamu boleh menetapkan batas yang nyaman untuk rumahmu.

#### 6.2 Susun flow otomasinya

1. **Di editor Node-RED**, seret node **switch** dari kategori **`function`** ke bawah flow sensor. Klik dua kali node itu, lalu isi:
   - **Property**: `msg.` `payload.suhu`
   - Aturan 1: operator **>**, jenis nilai **number** (ikon **09**), nilai `30` (atau batas nyala ujimu dari 6.1)
   - Klik **+ add** di bawah daftar aturan untuk aturan 2: operator **<**, jenis **number**, nilai `28` (atau batas padam ujimu dari 6.1)
   - Pilihan di bawah daftar: biarkan `checking all rules`
   - **Name**: `histeresis 30/28` (nama ini biarkan saja walaupun angkamu berbeda; langkah-langkah berikutnya menyebutnya begitu)

   Klik **Done**. Node itu kini punya **dua** titik keluaran di kanannya: atas untuk aturan 1, bawah untuk aturan 2.
2. Sambungkan keluaran **`DHT22 terbaca?`** ke `histeresis 30/28`. Jangan menyambungnya langsung dari `telemetry Node 1`: penjaga `null` itulah yang mencegah kipas dimatikan oleh bacaan sensor yang gagal (Konsep 7).
3. Seret dua node **change**. Klik dua kali masing-masing, lalu isi **Name** dan aturannya:
   - `kipas nyala`: aturan **Set** `msg.payload` **to the value** jenis **boolean** `true`; klik **+ add** untuk aturan kedua **Set** `msg.topic` jenis **string** `kipas`.
   - `kipas padam`: sama, tetapi `msg.payload` boolean `false`.

   Sambungkan keluaran **atas** `histeresis 30/28` ke `kipas nyala`, dan keluaran **bawah** ke `kipas padam`.
4. Seret node **filter** (kategori `function`). Klik dua kali node itu, biarkan **Mode** `block unless value changes`, isi **Property** `msg.payload`, dan biarkan pilihan **Apply mode separately for each** `msg.topic` tercentang. Isi **Name** `hanya kalau berubah`. Sambungkan `kipas nyala` dan `kipas padam` ke filter ini.
5. Sambungkan filter ke **`buat cmd`** dari Praktik 5. Otomasi memakai jalur perintah yang sama dengan sakelar.
6. Klik **Deploy**.

#### 6.3 Uji: hangatkan sensornya

1. Buka dashboard di HP dan panel debug di editor. Ingatan filter selalu kosong setelah *deploy*, jadi keputusan pertama selalu dikirim sekali begitu `telemetry` berikutnya tiba (paling lama 10 detik): kalau suhu kamar di bawah batas padam, `lihat cmd` menampilkan satu perintah `kipas` `false` (kipas yang sedang menyala karena sakelar pun ikut padam); kalau sudah di atas batas nyala, satu perintah `kipas` `true`; kalau di antara keduanya, belum ada perintah. Hal yang sama terjadi setiap kali kamu menekan **Deploy** lagi atau Node-RED menyala ulang.
2. **Genggam sensor DHT22** dengan telapak tangan, tanpa menyentuh kaki-kakinya, selama satu sampai dua menit. Suhu tanganmu sekitar 34–36 °C, dan bacaan suhu naik perlahan setiap 10 detik.
3. Begitu suhu melewati batas nyala, relay kipas berbunyi "klik", kipas berputar, sakelar **Kipas** di HP bergeser ke nyala, dan `lihat cmd` menampilkan **satu** perintah `nilai: true`. Perhatikan bahwa pesan berikutnya, walaupun suhunya masih di atas batas, tidak menghasilkan perintah baru: filter menahannya.
4. Lepaskan sensornya. Suhu turun perlahan. Selama suhu masih **di antara** kedua batas, kipas tetap menyala; inilah pita histeresis. Setelah beberapa menit suhu turun di bawah batas padam, dan kipas mati dengan **satu** perintah `nilai: false`.

Pengguna Wokwi: selagi simulasi berjalan, klik sensor DHT22, geser penggeser **Temperature** melewati batas nyala, lalu turunkan lagi melewati batas padam.

**Kalau kamu mematikan kipas lewat sakelar saat suhu masih di atas batas nyala,** otomasi tidak langsung menyalakannya lagi: filter masih mengingat keputusan terakhirnya (`true`) sehingga keputusan "nyala" yang sama ditahan. Otomasi baru bertindak lagi setelah suhu turun di bawah batas padam lalu naik lagi melewati batas nyala. Bagi penghuni rumah, perilaku ini justru wajar: perintah tangan dihormati sampai keadaan berubah. Cara membuat sakelar "Otomasi kipas" untuk menyalakan dan mematikan otomasi ada di 🧩 Tingkat 2.

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 8](#8-menyimpan-flow-ekspor-impor-dan-keamanan).

### Praktik 7 — Simpan flow ke repositori (20 menit)

> 🖥️ **Alat:** editor Node-RED, **File Explorer** (Windows) atau **Finder** (macOS), dan **VS Code** dengan folder `rumah-pintar-mini`. Konsep yang dipakai: 8.
>
> ⭐ **Wajib** — syarat lulus Modul 13 meminta flow JSON ada di repositorimu.

#### 7.1 Ekspor semua flow

1. **Di editor Node-RED**, buka menu utama (ikon tiga garis), lalu pilih **Export** (atau tekan **Ctrl + E**).
2. Di jendela `Export nodes`, pilih **all flows** di deretan atas, lalu pilih **formatted** sebagai formatnya.
3. Klik **Download**. Browser menyimpan berkas bernama `flows.json` di folder **Downloads**.

#### 7.2 Pindahkan ke proyek dengan nama yang jelas

1. **Di laptop**, buka folder **Downloads** di File Explorer (Windows) atau Finder (macOS).
2. Pindahkan `flows.json` ke folder **Documents → GitHub → rumah-pintar-mini → edge**, lalu ubah namanya menjadi **`node-red-flows.json`**. Di Windows: klik kanan berkas → **Rename** (atau **F2**); di macOS: klik berkasnya, lalu tekan **Enter**. Kalau File Explorer hanya menampilkan `flows` (akhiran `.json` disembunyikan Windows, Modul 1), ketik `node-red-flows` saja; kalau akhirannya ikut diketik, namanya menjadi `node-red-flows.json.json`.
3. Buka folder `rumah-pintar-mini` di VS Code, lalu buka `edge/node-red-flows.json`. Isinya berupa daftar panjang node dalam JSON: kamu akan menemukan `"type": "mqtt in"`, topik-topikmu, `"name": "Mosquitto di gateway"`, dan `"type": "ui-gauge"`. Tekan **Ctrl + F** dan cari `password`: tidak ada hasil. Kata sandi editor, *passphrase*, dan kredensial memang tidak pernah ikut terekspor.

Berkas ini di-*commit* di ➕ bersama resep gateway yang diperbarui.

#### 7.3 Uji pulih: coba impor (opsional, 5 menit)

Cadangan baru terbukti berguna kalau bisa dipulihkan. Uji kecil yang aman:

1. **Di editor Node-RED**, buka menu utama → **Import** (atau **Ctrl + I**). Klik **select a file to import**, lalu pilih `edge/node-red-flows.json` dari folder proyek. Isi berkas itu muncul di kotak teks jendela `Import nodes`; klik **Import**.
2. Karena semua node itu sudah ada di Node-RED-mu, muncul pesan `Some of the nodes you are importing already exist in your workspace.` Inilah tanda bahwa berkas cadanganmu lengkap dan dikenali. Klik **Cancel**: kita tidak membutuhkan salinan kedua.

Pemulihan sungguhan, di Pi yang kartunya baru ditulis ulang, ada di resep `edge/README.md` (➕ C).

> ➡️ **Selesai Praktik 7?** Kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1), lalu [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini). Praktik 8 hanya untuk jalur laptop.

### Praktik 8 — Jalur laptop: Node-RED di laptop (30 menit)

> 🖥️ **Alat:** laptop dengan Node.js 24 (Modul 4), terminal (Windows: PowerShell; macOS: Terminal), browser, dan broker Mosquitto sebagai layanan dari Praktik 7 Modul 12. Tanpa Node 1 sungguhan: Node 1 di Wokwi dengan broker publik. Konsep yang dipakai: belum ada; praktik ini dikerjakan paling awal, sebelum Kemenangan Cepat langkah 2.
>
> Kerjakan praktik ini **hanya kalau kamu belum punya Raspberry Pi**. Node-RED di laptop hanya berjalan selama terminalnya terbuka dan laptop tidak tidur; itu cukup untuk belajar, tetapi bukan gateway 24 jam.

#### 8.1 Pasang Node-RED

1. **Di laptop**, buka terminal. Pastikan Node.js-mu versi 22.9 atau lebih baru:

   ```bash
   node -v
   ```

   Jawabannya harus `v22.9.0` atau lebih tinggi, misalnya `v24.21.0` dari Modul 4. Node-RED 5 menolak berjalan di Node.js yang lebih tua.
2. Pasang Node-RED sebagai perintah global (`-g`), yang bisa dijalankan dari folder mana pun. **Windows**, di terminal biasa tanpa hak administrator (jangan memakai **Terminal (Admin)**). Kalau di Modul 4 kamu memilih mengetik `npm.cmd` alih-alih mengubah pengaturan PowerShell, tambahkan `.cmd` di belakang `npm` pada perintah di bawah ini (menjadi `npm.cmd install -g node-red`), lalu ketik `node-red.cmd` sebagai ganti `node-red` di langkah 3 dan 4. Perintahnya:

   ```bash
   npm install -g node-red
   ```

   **macOS** (diawali `sudo`, lalu masukkan kata sandi Mac-mu; **Linux** dengan Node.js dari nvm, seperti Modul 4, cukup memakai perintah di atas tanpa `sudo`):

   ```bash
   sudo npm install -g node-red
   ```

   Tunggu 1–3 menit sampai *prompt* kembali dengan ringkasan seperti `added 300 packages in 45s`.
3. Buat berkas pengaturan dengan tanya jawab yang sama seperti di [Kemenangan Cepat langkah 1.5](#langkah-1--pasang-node-red-di-pi):

   ```bash
   node-red admin init
   ```

   Jawab persis seperti tabel di Kemenangan Cepat, termasuk **Yes** untuk `Do you want to setup user security?` dengan **Username** `admin`. Di laptop pun, kata sandi editor tetap penting: Node-RED di laptop bisa dibuka dari perangkat lain di WiFi yang sama. Berkas pengaturannya disimpan di folder `.node-red` di folder penggunamu (Windows: `C:\Users\NAMAMU\.node-red`).
4. Jalankan Node-RED:

   ```bash
   node-red
   ```

   Terminal menampilkan catatan yang mirip dengan contoh di Praktik 2.3 (praktik yang dilewati jalur laptop, tetapi contohnya boleh kamu intip), dengan baris sistem operasi milik laptopmu (misalnya `Windows_NT 10.0.26200 x64 LE`). Karena flow-mu masih kosong, catatan pertama ini sedikit berbeda: ada baris `Creating new flow file` dan `[warn] Encrypted credentials not found` (wajar: belum ada kata sandi milik node yang perlu dikunci), dan baris `Connected to broker` belum muncul karena belum ada node MQTT. Node-RED siap dipakai begitu muncul `Server now running at http://127.0.0.1:1880/` dan `Started flows`. Biarkan terminal ini terbuka; menutupnya berarti mematikan Node-RED, begitu pula menutup VS Code kalau terminal ini ada di dalamnya. Untuk berhenti, tekan **Ctrl + C**. Begitu Node-RED mulai berjalan, Windows bisa memunculkan jendela `Windows Security` untuk **Node.js JavaScript Runtime**; jawab seperti 8.3, yaitu izinkan untuk jaringan **pribadi** saja.

   Windows menolak `node-red admin init` (langkah 3) atau `node-red` dengan pesan `node-red.ps1 cannot be loaded because running scripts is disabled on this system`? Itu aturan PowerShell yang sama dengan `npm.ps1` di Modul 4. Ketik `node-red.cmd admin init` dan `node-red.cmd` sebagai gantinya, atau ikuti perbaikan Modul 4.

#### 8.2 Sesuaikan alamat di semua langkah

Ikuti Kemenangan Cepat langkah 2–3 dan Praktik 1–7 dengan perbedaan berikut:

| Di modul tertulis | Jalur laptop dengan Node 1 sungguhan | Jalur laptop dengan Node 1 di Wokwi |
| :--- | :--- | :--- |
| editor `http://192.168.1.37:1880` | `http://localhost:1880` | `http://localhost:1880` |
| broker **Server** `localhost` (Mosquitto di gateway) | `localhost`: broker layanan dari Praktik 7 Modul 12 | `broker.emqx.io` (broker publik, port `1883`) |
| dashboard di HP `http://192.168.1.37:1880/dashboard/rumah` | `http://192.168.1.10:1880/dashboard/rumah` (alamat IP laptopmu, Modul 11; izinnya di 8.3) | sama dengan kolom tengah; di laptop sendiri juga bisa `http://localhost:1880/dashboard/rumah` |
| sambungan MQTTX **Gateway Pi** (Praktik 2.2) | **Lewat IP laptop** (Praktik 2.4 Modul 11) | **Broker publik** (Modul 11), langganan `rpm/` + `device_id`-mu + `/#` |
| pemeriksa kontrak `node pemeriksa-kontrak.js 192.168.1.37 a4cf12e5b7c0` (Praktik 5.6) | `node pemeriksa-kontrak.js 127.0.0.1 a4cf12e5b7c0` (broker di laptop yang sama) | `node pemeriksa-kontrak.js broker.emqx.io a4cf12e5b7c0` (`device_id` Node 1 Wokwi-mu) |

Lewati Praktik 2.3 (layanan systemd di Pi). Jalur Wokwi memakai topik dengan `device_id` Node 1 Wokwi-mu, sama seperti Modul 11, dan simulasi Node 1 di Wokwi harus sedang berjalan (tabnya tetap terbuka) selama kamu praktik.

> [!WARNING]
> **Broker publik terbuka untuk semua orang.** Di `broker.emqx.io`, siapa pun bisa membaca data simulasimu dan mengirim perintah ke topik `cmd`-mu. Pakai jalur ini hanya untuk Node 1 di Wokwi, jangan untuk papan sungguhan yang relay-nya tersambung ke beban, sesuai aturan Modul 11.

#### 8.3 Dashboard laptop dari HP

Node-RED berjalan di atas Node.js, jadi izin *firewall*-nya sama dengan izin Node.js di Praktik 7 Modul 10. Kalau izin itu sudah kamu berikan, HP langsung bisa membuka Node-RED di laptopmu. Dashboard-nya sendiri baru ada mulai Praktik 3; sebelum itu, `http://192.168.1.10:1880/dashboard/rumah` (pakai alamat IP laptopmu) hanya menjawab `Cannot GET /dashboard/rumah`, dan itu wajar. Untuk menguji izinnya sekarang, buka `http://192.168.1.10:1880` di browser HP: halaman masuk editor Node-RED harus muncul (tidak perlu masuk). Kalau Windows memunculkan jendela `Windows Security` untuk Node.js (biasanya begitu `node-red` mulai berjalan di 8.1 langkah 4, bukan saat HP membukanya), jawab persis seperti Praktik 1.4 Modul 11: izinkan untuk jaringan **pribadi** saja, bukan publik. Di macOS, jawab **Allow** kalau ditanya. Setelah itu, HP bisa membuka Node-RED di laptopmu (dashboard-nya mulai Praktik 3) selama laptop menyala dan terminal Node-RED terbuka.

> ⬆️ **Selesai Praktik 8?** Kembali ke [Kemenangan Cepat langkah 2](#langkah-2--buka-editor-node-red-dari-laptop), lalu ikuti urutan modul seperti biasa (Konsep 1, Praktik 1, dan seterusnya) dengan alamat dari tabel 8.2.

---

## 🚨 Kalau Tidak Jalan?

Banyak tutorial Node-RED di internet ditulis untuk versi lama. Kalau sebuah tutorial memakai cara di kolom kiri, terjemahkan ke cara minggu ini:

| Tutorial lama | Cara sekarang (modul ini) |
| :--- | :--- |
| skrip `update-nodejs-and-nodered-deb` | `install-update-nodered-deb` (alamat lama mati sejak Juni 2026) |
| `sudo apt install nodered` atau Node.js dari `apt` | skrip resmi; Debian 13 hanya punya Node.js 20, padahal Node-RED 5 butuh 22.9 ke atas |
| paket `node-red-dashboard` ("Dashboard 1"), alamat `/ui` | `@flowfuse/node-red-dashboard` (Dashboard 2), alamat `/dashboard` |
| `npm install -g --unsafe-perm node-red` | `npm install -g node-red` (Windows tanpa `sudo`) |
| node **rbe** | node yang sama kini bernama **filter** |
| editor dengan palet di kiri dan satu panel kanan yang bergantian menampilkan info atau debug | Node-RED 5: Explorer di kiri atas, palet di kiri bawah, panel Information di kanan atas, dan panel Debug messages di kanan bawah, terlihat bersamaan |

Bagian di bawah ini dilipat; klik judulnya untuk membuka.

<details>
<summary><b>Skrip pemasang berhenti: <code>Not: command not found</code>, atau diam saja setelah pertanyaan pertama</b></summary>

- `/dev/fd/63: line 1: Not: command not found`: alamat skripnya salah ketik atau memakai nama lama `update-nodejs-and-nodered-deb`. GitHub menjawab `Not Found`, dan bash mencoba menjalankan tulisan itu. Salin ulang perintah Kemenangan Cepat langkah 1.2 persis.
- Skrip langsung selesai tanpa pesan setelah `Are you really sure you want to do this ? [y/N] ?`: pertanyaan itu hanya menunggu 30 detik. Jalankan perintahnya lagi dan jawab `y` dengan cepat.
- `root user detected. Typical installs should be done as a regular user.`: kamu mengetiknya dengan `sudo` di depan. Tekan **Ctrl + C**, lalu ulangi tanpa `sudo`. Kalau telanjur menjawab `y` untuk `Are you really sure you want to install as root ? (y/N) ?`, Node-RED terpasang untuk pengguna `root`. Hapus dulu berkas layanannya dengan `sudo rm /lib/systemd/system/nodered.service`, lalu jalankan ulang skripnya tanpa `sudo` supaya terpasang untuk `budi`. Tanpa langkah hapus itu, skrip mempertahankan layanan lama (`Skipped - existing script is customized.`) dan Node-RED tetap berjalan sebagai `root`.
- `Sorry - cannot connect to internet - not going to touch anything.`: Pi tidak bisa menjangkau internet. Periksa dengan `ping -c 3 nodered.org`; kabel LAN dan router adalah tersangka pertama (Modul 12).
- Daftar centang berisi **✘** merah: baca baris di atasnya, lalu jalankan skripnya sekali lagi. Skrip ini aman dijalankan berulang kali; ia juga dipakai untuk memperbarui Node-RED.

</details>

<details>
<summary><b>Editor tidak terbuka: <code>This site can’t be reached</code> atau berputar terus</b></summary>

1. **Di Pi**, periksa layanannya: `systemctl status nodered`. Harus `active (running)`. Kalau `inactive (dead)`, kamu belum menjalankan `sudo systemctl enable --now nodered.service` (Kemenangan Cepat langkah 1.6); setelah Pi dinyalakan ulang, layanan yang belum diaktifkan (*enabled*) tidak menyala sendiri.
2. Layanan menyala, tetapi berulang kali gagal (`activating (auto-restart)`)? Lihat sebabnya dengan `node-red-log`. Dua yang paling sering:
   - `Error: port in use`: ada Node-RED lain yang sudah memakai pintu 1880, biasanya karena kamu menjalankan `node-red` di terminal SSH (misalnya sebelum langkah 1.6) sehingga layanan tidak kebagian pintu. Tutup yang di terminal dengan **Ctrl + C**.
   - `Error loading settings file`: `settings.js` rusak karena disunting dengan tangan. Jalankan `node-red admin init` lagi untuk membuat ulang (jawab **Yes** saat ditanya menimpa berkas lama), lalu `node-red-restart`.
3. Alamatnya benar? Editor ada di pintu **1880**: `http://192.168.1.37:1880`, dengan `http`, bukan `https`. Laptop dan Pi harus berada di jaringan rumah yang sama.

</details>

<details>
<summary><b>Tidak bisa masuk: <code>Login failed</code></b></summary>

- **Username** adalah nama akun **editor** dari `node-red admin init` (modul ini: `admin`), bukan `budi`. Kata sandinya pun kata sandi editor, bukan kata sandi Pi.
- Lupa kata sandinya? **Di Pi**, jalankan `node-red admin init` lagi, jawab **Yes** untuk menimpa `settings.js`, dan isi ulang semua jawaban seperti Kemenangan Cepat (gunakan *passphrase* yang **sama** dengan sebelumnya kalau kamu ingat; kalau tidak, isi yang baru; setelah Node-RED menyala lagi, editor memperingatkan `Credentials could not be decrypted`, dan berkas kredensial lama dikosongkan pada **Deploy** berikutnya, yang aman minggu ini karena broker belum dijaga kata sandi). Lalu jalankan `node-red-restart`. Flow-mu tidak hilang karena tersimpan di `flows.json`.

</details>

<details>
<summary><b>Node MQTT bertulisan <code>disconnected</code> atau <code>connecting</code> terus</b></summary>

1. Broker hidup? **Di Pi**: `systemctl status mosquitto` harus `active (running)` (Modul 12). Jalur laptop dengan Node 1 sungguhan: sambungkan MQTTX **Lewat IP laptop**; kalau gagal, periksa layanan Mosquitto di laptopmu dan alamat IP-nya (Praktik 7 Modul 12). Node 1 di Wokwi: sambungkan MQTTX **Broker publik**; kalau gagal, periksa sambungan internetmu.
2. Di node broker (`Mosquitto di gateway`), **Server** harus `localhost` dan **Port** `1883`. Node-RED dan Mosquitto berada di Pi yang sama, jadi tidak perlu alamat IP. Ada satu pengecualian: kalau Node 1-mu di Wokwi, baik di jalur laptop maupun di Pi, isi **Server** dengan `broker.emqx.io` (tabel 8.2) karena Node 1 Wokwi hanya tersambung ke broker publik.
3. **Client ID** harus kosong. Kalau berisi `device_id` Node 1, broker terus menendang salah satunya keluar, dan Node 1 serta Node-RED bergantian putus.
4. Ada dua node broker? Buka panel **Configuration nodes** (ikon roda gigi di deretan ikon kecil di pojok kanan bawah editor). Kalau ada dua `mqtt-broker`, pilih satu yang sama di setiap node MQTT, lalu hapus yang tidak terpakai (bergaris putus-putus). Saat kamu mengeklik **Deploy**, Node-RED kadang mengingatkan `You have some unused configuration nodes.`

</details>

<details>
<summary><b>Panel debug kosong, padahal Node 1 menyala</b></summary>

- Node debug dimatikan: tombol di sisi kanannya pudar. Klik untuk menyalakan.
- Filter panel debug sedang berisi `selected nodes`, atau berisi `current flow`, padahal node debug-nya ada di tab lain. Pilih **all nodes** di daftar filter panel.
- Topik di **mqtt in** salah ketik, misalnya `device_id` berbeda atau ada spasi. Bandingkan dengan topik yang tampil di MQTTX.
- Node 1-mu di Wokwi, tetapi **Server** node broker masih `localhost`: node mqtt in tetap bertulisan `connected` karena broker di Pi atau laptopmu hidup, padahal Node 1 Wokwi menerbitkan pesannya ke `broker.emqx.io`. Isi **Server** dengan `broker.emqx.io` (tabel 8.2).
- Belum di-*deploy*: ada titik biru di atas node.

</details>

<details>
<summary><b>Dashboard: <code>Please add some Dashboard 2.0 nodes to your flow and re-deploy.</code> atau halaman 404</b></summary>

- Pesan itu berarti belum ada widget yang di-*deploy*. Klik **Deploy**, lalu muat ulang halaman.
- Alamatnya `http://192.168.1.37:1880/dashboard/rumah`: kata `dashboard`, lalu **Path** halamanmu. **Path** yang tidak diawali `/` membuat alamat aneh; perbaiki di pengaturan halaman.
- `Cannot GET /ui`: itu alamat Dashboard 1 dari tutorial lama. Dashboard 2 ada di `/dashboard`.
- `Cannot GET /dashboard/rumah`: belum ada dashboard yang di-*deploy*. Alamat ini baru hidup setelah Dashboard 2 terpasang (Praktik 3.1) dan widget pertamanya di-*deploy* (Praktik 3.2).
- Muncul `Connection Lost` dengan `Attempting to reconnect to server...`: Node-RED sedang dinyalakan ulang, atau HP-mu keluar dari WiFi rumah. Tunggu, atau pastikan HP tidak memakai data seluler.
- HP menulis `This site can’t be reached` atau berputar terus, padahal laptop bisa membuka alamat yang sama: HP belum tersambung ke WiFi rumah yang **sama** dengan Pi (bukan data seluler, bukan WiFi tamu), atau alamatnya terbuka sebagai `https`. Ketik lengkap, diawali `http://`.
- Kategori `dashboard 2` tidak muncul setelah Praktik 3.1, atau **Manage palette** memberi tahu bahwa pemasangan gagal: Pi butuh internet untuk mengunduh paketnya. Periksa **di Pi** dengan `ping -c 3 nodered.org`, lalu ulangi Praktik 3.1.

</details>

<details>
<summary><b>Widget tidak muncul, atau jarum menunjuk 0 dan grafik kosong</b></summary>

- Widget tanpa **Group** tidak pernah tampil, dan Node-RED mencatat `No group configured`. Buka widget-nya dan pilih grup.
- Jarum diam di **0** atau tangki **0 %**: lihat panel debug. Kalau `suhu` atau `level_air` bernilai `null`, sensornya gagal membaca; penjaga `is not null` (Praktik 4.1) sengaja menahan nilai itu. Kalau penjaganya belum dipasang, `null` tampil sebagai nilai minimum.
- **Value** berisi `msg.payload` saja (tanpa `.suhu`): widget menerima seluruh objek dan tidak bisa menampilkannya. Isi `payload.suhu`.
- **Output** node mqtt in diubah menjadi `a String`: semua `payload.suhu` menjadi kosong. Kembalikan ke `auto-detect (parsed JSON object, string or buffer)`.
- Grafik kosong: **Series** belum berjenis **JSON** `["suhu","kelembapan"]`, atau grafik baru di-*deploy* dan belum menerima pesan. Ingat juga bahwa riwayat grafik hilang setiap kali Node-RED dinyalakan ulang.

</details>

<details>
<summary><b>Sakelar berputar terus dan tidak pernah bergeser (atau bergeser, tetapi relay diam)</b></summary>

Sakelar dengan **Indicator** `Switch icon shows state of the input` baru bergeser setelah `ack` datang. Kalau ia berputar terus:

1. Periksa `lihat cmd` di panel debug: perintahnya keluar? Kalau tidak, kabel sakelar → `buat cmd` belum tersambung.
2. Perintah keluar, tetapi relay diam: lihat status di bawah node **mqtt out**. `disconnected` berarti perintahnya dibuang tanpa galat. Periksa juga **Topic** mqtt out: `rpm/<device_id-mu>/cmd`.
3. Relay berbunyi, tetapi sakelar tetap berputar: jalur `ack Node 1` → `keadaan kipas` → sakelar belum tersambung, atau node change-nya tidak mengambil `payload.state.kipas` dengan benar (misalnya salah ketik).
4. Node 1 mati atau tidak tersambung: teks status di dashboard menulis `offline`. Tanpa `ack`, sakelar yang jujur memang tidak bergeser.
5. Gejala sebaliknya, sakelar bergeser, tetapi relay tidak berbunyi "klik": MB102 belum dinyalakan. ESP32 hidup dari USB sehingga tetap menjawab `ack`, sedangkan relay butuh 5 V dari MB102 (🚨 Modul 11). Nyalakan MB102, lalu ketuk sakelarnya lagi.

</details>

<details>
<summary><b>Perintah kedua dan seterusnya diabaikan Node 1</b></summary>

Node 1 mengabaikan perintah yang `id`-nya sama dengan salah satu dari delapan perintah terakhir (Modul 11). Kalau perintah pertama dikerjakan, tetapi perintah berikutnya tidak:

- `id` tidak berganti. Pastikan `buat cmd` memakai `"nr-" & $string($millis())`, **bukan** `_msgid`: widget dashboard memakai ulang pesan tersimpan sehingga `_msgid` bisa sama di setiap klik.
- Periksa `lihat cmd` di panel debug: setiap perintah harus punya `id` berbeda.

</details>

<details>
<summary><b>Pemeriksa kontrak menulis <code>GAGAL</code> untuk perintah dari Node-RED</b></summary>

- `ts` ditolak: ekspresinya memakai `$now()` tanpa pola sehingga ada milidetik (`…:58.123Z`). Pakai `$now("[Y0001]-[M01]-[D01]T[H01]:[m01]:[s01]Z")` persis.
- `kolom "…" tidak ada di kontrak data`: ekspresi `buat cmd` memuat kolom tambahan. Hanya `id`, `ts`, `aksi`, `target`, dan `nilai` yang boleh.
- `nilai` salah jenis: sakelar mengirim teks `"true"` alih-alih boolean `true` (cek **On Payload** jenis boolean), tombol siram mengirim teks `"5"` (ubah jenis **Payload** menjadi **number**), atau penggeser tirai memakai **step** pecahan sehingga `nilai` bukan bilangan bulat.
- Pesan `cmd` bertanda `[retained]` walaupun capnya `LULUS` (tanda ini muncul begitu pemeriksa dijalankan ulang): **Retain** di node mqtt out kosong atau `true`. Pilih `false`, lalu hapus pesan *retained* itu dari MQTTX (Modul 11, **Clear Retained Message**).

</details>

<details>
<summary><b>Kipas nyala-mati terus, tidak pernah menyala otomatis, atau tidak pernah padam</b></summary>

- **Nyala-mati terus**: angka batas di node switch tertukar atau sama, misalnya aturan 1 `> 28` dan aturan 2 `< 30`. Suhu di antara keduanya cocok dengan **dua** aturan sekaligus sehingga setiap kiriman menghasilkan `true` lalu `false`. Aturan 1 harus memakai batas nyala yang lebih besar (`> 30`), dan aturan 2 batas padam yang lebih kecil (`< 28`).
- **Perintah yang sama terkirim setiap 10 detik** (`lihat cmd` ramai walaupun keputusannya tidak berubah): filter `hanya kalau berubah` diletakkan **setelah** `buat cmd`, atau tidak ada sama sekali. Urutan yang benar: histeresis → kipas nyala/padam → filter → `buat cmd`.
- **Langsung menyala begitu di-*deploy***: suhu kamar sudah di atas batas nyala. Itu wajar; pakai batas uji di Praktik 6.1.
- **Tidak pernah menyala**: suhu tidak pernah melewati batas nyala (genggam sensornya lebih lama), atau **Property** node `histeresis 30/28` masih `msg.payload` (seluruh objek), bukan `msg.payload.suhu`. Pastikan juga histeresis disambung dari `DHT22 terbaca?`, dan filter disambung ke `buat cmd`.
- **Menyala, tetapi tidak pernah padam**: batas padam sama dengan atau di bawah suhu kamar sehingga suhu bacaan tidak pernah turun melewatinya. Pakai batas uji di Praktik 6.1.
- **Kipas mati sendiri saat sensor dicabut**: histeresis disambung langsung dari `telemetry Node 1` tanpa penjaga `null` sehingga `null < 28` dianggap benar.
- **Mode filter** `block unless value changes (ignore initial value)`: keputusan pertama sengaja ditahan. Pilih `block unless value changes`.

</details>

<details>
<summary><b>Jalur laptop: <code>node-red</code> tidak dikenal, atau HP tidak bisa membuka dashboard laptop</b></summary>

- `node-red : The term 'node-red' is not recognized…`: terminal dibuka sebelum pemasangan selesai. Tutup, lalu buka terminal baru.
- `node-red.ps1 cannot be loaded because running scripts is disabled on this system`: jalankan `node-red.cmd`, atau ikuti perbaikan PowerShell di 🚨 Modul 4.
- `Unsupported version of Node.js` dan `Node-RED requires Node.js v22.9 or later`: perbarui Node.js ke versi 24 seperti Modul 4.
- Editor `http://localhost:1880` tidak terbuka (`This site can’t be reached`): Node-RED di laptop belum dijalankan, misalnya setelah laptop dinyalakan ulang. Buka terminal, ketik `node-red` (Praktik 8.1 langkah 4), lalu biarkan terminalnya terbuka.
- HP tidak bisa membuka `http://<IP-laptop>:1880/dashboard/rumah`: izin *firewall* Node.js untuk jaringan pribadi belum ada (Praktik 8.3), WiFi laptop berprofil **Public**, atau HP memakai data seluler.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini boleh dilewati. Isinya untuk kamu yang ingin tahu apa yang terjadi di balik kotak dan kabel.

<details>
<summary><b>Histeresis yang sama dengan node function dan JavaScript</b></summary>

Empat node histeresis di Praktik 6 bisa diganti dengan **satu** node **function** berisi JavaScript, bahasa yang sama dengan di Modul 4. Di dalam node function, `msg` adalah pesan yang masuk, `return msg;` meneruskannya, dan `return null;` menghentikannya. Ingatan antarpesan disimpan dengan `context.get()` dan `context.set()`:

```javascript
// Otomasi kipas berhisteresis: nyala di atas 30 °C, padam di bawah 28 °C.
const suhu = msg.payload.suhu;
if (typeof suhu !== "number") {
    node.status({ fill: "grey", shape: "ring", text: "suhu tidak terbaca" });
    return null; // bacaan gagal (null): jangan mengubah apa pun
}
const kipas = context.get("kipas"); // keputusan terakhir (undefined saat baru mulai)
let baru = kipas;
if (suhu > 30) {
    baru = true;
} else if (suhu < 28) {
    baru = false;
}
node.status({ fill: "blue", shape: "dot", text: suhu + " °C, kipas " + (baru === true ? "ON" : baru === false ? "OFF" : "?") });
if (baru === undefined || baru === kipas) {
    return null; // tidak berubah: tidak mengirim perintah
}
context.set("kipas", baru);
msg.topic = "kipas";
msg.payload = baru;
return msg; // lanjut ke buat cmd
```

Kelebihannya: satu kotak, logikanya terbaca dari atas ke bawah, dan `node.status()` menulis keadaan terakhir di bawah node. Kekurangannya: kode tidak bisa "dilihat sekilas" seperti kotak dan kabel, dan setiap salah ketik baru ketahuan saat pesan lewat (muncul di panel debug sebagai galat). Untuk pemula, empat node bawaan lebih mudah diperiksa; untuk aturan yang rumit, satu node function lebih rapi. Keduanya menyimpan ingatannya di memori sehingga ingatan itu kosong lagi setiap kali Node-RED dinyalakan ulang atau flow-nya di-*deploy* ulang.

</details>

<details>
<summary><b>Bagaimana Dashboard 2 berbicara dengan HP-mu</b></summary>

Saat HP membuka `http://192.168.1.37:1880/dashboard/rumah`, Node-RED mengirim satu aplikasi web (dibuat dengan kerangka kerja Vue). Setelah itu, HP dan Node-RED tetap tersambung lewat **socket.io**, sambungan dua arah di atas WebSocket, di pintu yang sama dengan editor (1880), lewat jalur `/dashboard/socket.io`. Catatan Node-RED menulis dua baris tentang dashboard saat menyala:

```text
[info] [ui-base:Rumah Pintar Mini] Node-RED Dashboard 2.0 (v1.33.0) started at /dashboard
[info] [ui-base:Rumah Pintar Mini] Created socket.io server bound to Node-RED port at path /dashboard/socket.io
```

Setiap pesan yang tiba di node gauge diteruskan lewat sambungan itu ke **semua** HP dan laptop yang sedang membuka dashboard, jadi jarum di dua HP bergerak bersamaan. Sebaliknya, klik sakelar di satu HP dikirim ke Node-RED, yang meneruskannya ke `buat cmd`. Karena keadaan sakelar diambil dari `ack`, HP kedua ikut melihat sakelar bergeser.

Dashboard **tidak** dijaga oleh kata sandi editor karena ia dilayani oleh "server HTTP untuk node", bukan oleh server editor. Node-RED punya pengaturan `httpNodeAuth` di `settings.js` untuk memberi satu nama pengguna dan kata sandi pada halaman `/dashboard`, tetapi perlindungan yang menyeluruh baru dirancang dengan benar mulai Modul 20–21 (akun pengguna, kata sandi broker), sedangkan enkripsi TLS menyusul di Modul 27.

</details>

<details>
<summary><b>Node-RED vs Home Assistant</b></summary>

**Home Assistant** adalah platform rumah pintar sumber terbuka yang sangat populer, dengan semboyan *open source home automation that puts local control and privacy first*. Bedanya dengan Node-RED:

| | Node-RED | Home Assistant |
| :--- | :--- | :--- |
| Jati diri | alat alur data serbaguna: pesan dari mana saja, diolah, dikirim ke mana saja | platform rumah pintar lengkap: ribuan integrasi perangkat, otomasi, dashboard, aplikasi HP |
| Cara pasang di Pi | di atas Raspberry Pi OS, berdampingan dengan Mosquitto (minggu ini) | paling lengkap sebagai **Home Assistant OS**, yang ditulis ke kartu dan menggantikan seluruh isinya |
| MQTT | node mqtt in/out, versi 3.1.1 atau 5 | integrasi MQTT yang mewajibkan broker MQTT versi 5, dengan fitur *discovery* (perangkat mengumumkan dirinya) |
| Kebutuhan | ringan | Pi 4/5 dengan RAM minimal 2 GB dan kartu minimal 32 GB |
| Cocok untuk | belajar alur data, prototipe, "lem" antarsistem | rumah yang memakai banyak perangkat pabrikan |

Keduanya bahkan bisa dipakai bersama: Home Assistant OS punya *app* komunitas (dulu disebut *add-on*) untuk menjalankan Node-RED di dalamnya. Kurikulum ini sengaja tidak memakai Home Assistant karena tujuan kita adalah **membangun** sistem IoT sendiri, dari firmware sampai *backend*, bukan merakit produk jadi. Pertanyaan "kapan membeli platform jadi, kapan membangun sendiri" dibahas lagi di Modul 25.

</details>

<details>
<summary><b>Setelah Modul 16: Node-RED pensiun sebagai otak</b></summary>

Mulai Modul 16, aturan otomasi pindah ke *backend* TypeScript yang kamu tulis sendiri, lengkap dengan database, pengujian, dan riwayat perubahan di Git. Saat itu, flow otomasi kipas di Node-RED **dimatikan** (misalnya dengan menghapus kabel dari `DHT22 terbaca?` ke `histeresis 30/28`) supaya tidak ada dua otak yang memberi perintah ke kipas yang sama. Dashboard v0 boleh tetap hidup sebagai tampilan cadangan, dan node debug tetap berguna untuk mengintip lalu lintas MQTT. Pola ini umum di industri: Node-RED dipakai untuk mencoba ide dengan cepat, lalu ide yang terbukti berguna ditulis ulang di sistem utama.

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari mengubah sedikit sampai membuat sendiri. Kunci Tingkat 1 dan 2 ada di bagian lipat; Tingkat 3 sengaja hanya diberi petunjuk. Semuanya dikerjakan di editor Node-RED, jadi pembaca jalur laptop bisa mengerjakannya dengan cara yang sama.

### Tingkat 1 — Grafik cahaya (ubah sedikit)

Tambahkan grafik kedua di kartu **Grafik**: nilai `cahaya` Node 1 selama satu jam terakhir. Grafik ini sengaja terpisah dari grafik suhu dan kelembapan karena skalanya berbeda (`0`–`4095`, bukan `0`–`100`). Setelah grafiknya jalan, tutup sensor LDR dengan jarimu beberapa detik, lalu lihat lembahnya di grafik.

Petunjuk: salin node chart dari Praktik 4.4 (**Ctrl + C**, **Ctrl + V**), lalu ubah tiga isiannya.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Salinan node chart diubah menjadi: **Label** `Cahaya (1 jam terakhir)`, **Series** jenis **JSON** `["cahaya"]`, dan **Y-Axis** **min.** `0`, **max.** `4095`. **Group** tetap `[Rumah] Grafik`. Sambungkan dari `telemetry Node 1` (bukan dari `DHT22 terbaca?` karena `cahaya` tidak berasal dari DHT22 dan tidak pernah `null`), lalu klik **Deploy**. Di HP maupun di laptop, grafik baru muncul di bawah grafik suhu karena kartu **Grafik** hanya selebar 6 kolom, sama dengan lebar satu grafik. Supaya keduanya berdampingan di laptop, buka pengaturan grup `Grafik` (ikon pensil di baris **Group**) dan ubah **Size** menjadi 12 kolom.

</details>

### Tingkat 2 — Sakelar "Otomasi kipas" (isi bagian rumpang)

Kadang penghuni rumah ingin kipas **tidak** diatur otomatis, misalnya saat tidur. Tambahkan sakelar **Otomasi kipas** di kartu **Kendali**. Saat sakelarnya mati, otomasi Praktik 6 berhenti mengirim perintah; sakelar **Kipas** biasa tetap bisa dipakai. Lengkapi bagian rumpang (`____`) rancangan ini:

```text
[sakelar Otomasi kipas] → [change: Set ____ ke msg.payload]

[DHT22 terbaca?] → [switch "otomasi aktif?": Property flow.otomasi_kipas
                     aturan 1: ____
                     aturan 2: otherwise]
                         keluaran ____ → [histeresis 30/28]
```

Petunjuk: Node-RED punya "papan tulis" yang bisa dibaca semua node di satu tab, disebut ***flow context***, dan isiannya ditunjuk dengan awalan `flow.`. Sebelum sakelar pertama kali disentuh, isinya kosong, bukan `false`.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

- Sakelar **Otomasi kipas** (`dashboard 2`, **Group** `[Rumah] Kendali`, **On Payload** `true`, **Off Payload** `false`, **Indicator** biarkan `Switch icon shows state of the output`) disambung ke node change dengan aturan **Set** `flow.otomasi_kipas` (pilih jenis **flow.** di kolom kiri) **to the value** `msg.payload`.
- Node switch (`function`) `otomasi aktif?`: **Property** jenis **flow.** `otomasi_kipas`; aturan 1 **is false**; aturan 2 **otherwise**. Keluaran **2** (bawah) disambung ke `histeresis 30/28`, sedangkan keluaran 1 dibiarkan tanpa kabel: pesan yang lewat situ berhenti. Kabel lama dari `DHT22 terbaca?` ke `histeresis 30/28` dihapus.

Mengapa **is false** dan **otherwise**, bukan **is true**? Karena sebelum sakelar disentuh untuk pertama kalinya (dan setiap kali Node-RED dinyalakan ulang), `flow.otomasi_kipas` kosong. Dengan **is true**, otomasi diam-diam mati sampai sakelarnya disentuh; dengan **is false**, otomasi tetap jalan kecuali penghuni sengaja mematikannya. Satu efek sampingnya: setiap kali Node-RED baru menyala, sakelar **Otomasi kipas** tampil mati walaupun otomasinya berjalan. Sakelar itu memang belum pernah menerima nilai. Supaya tampilannya cocok, tambahkan node **inject** dengan `msg.payload` jenis **boolean** `true`, centang **Inject once after** dan biarkan angkanya `0.1`, lalu sambungkan ke sakelar itu dan ke node change-nya.

</details>

### Tingkat 3 — Siram terjadwal pagi (buat dari nol)

Buat flow yang menyiram tanaman **setiap pagi pukul 06.00** selama 5 detik, tetapi **hanya kalau** bacaan tanah terakhir di bawah 60 %. Tampilkan juga jam penyiraman terakhir di dashboard.

Petunjuk:

1. Node **inject** bisa mengirim pesan sendiri pada jam tertentu: **Repeat** → `at a specific time`. Jamnya mengikuti zona waktu Pi (`Asia/Jakarta`).
2. Untuk "bacaan tanah terakhir", simpan `msg.payload.tanah` dari setiap `telemetry` ke `flow.tanah_terakhir` dengan node change, lalu periksa nilainya dengan node switch saat inject mengirim pesannya.
3. Kirim perintahnya lewat `buat cmd` yang sudah ada (`msg.topic` `pompa`, `msg.payload` `5`).
4. Pikirkan "dua otak": Node 1 sudah menyiram sendiri saat tanah di bawah ambang `tanah_siram` (bawaan 30 %), dan tetap menolak menyiram kalau air tandon kurang. Mengapa siram terjadwal di Node-RED tetap aman berdampingan dengan aturan itu, dan kapan ia justru merugikan?

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini, gateway Rumah Pintar Mini mendapat **wajah** dan **otak pertama**: dashboard v0 yang dibuka dari HP dan otomasi kipas yang bekerja 24 jam. Keduanya tinggal di Node-RED, di Pi yang sama dengan broker Mosquitto dari Modul 12. **Node 1 tidak berubah**: tetap v1.2.1, tanpa satu baris kode pun yang diunggah ulang.

![Diagram Rumah Pintar Mini setelah Modul 13: gateway kini punya wajah (dashboard v0) dan otak pertama (otomasi kipas); garis putus-putus berarti menyusul. Tengah, gateway Raspberry Pi 192.168.1.37 berisi Mosquitto (layanan, pintu 1883) dan Node-RED (layanan, pintu 1880) dengan dashboard v0 dan otomasi kipas 30/28; keduanya bertukar pesan lewat localhost:1883. Kiri, Node 1 v1.2.1, tidak berubah minggu ini, mengirim telemetry, status, vitals, dan ack ke Mosquitto dan menerima cmd darinya. Kanan, HP membuka /dashboard/rumah, laptop membuka editor :1880, MQTTX, dan SSH; GitHub menyimpan edge/node-red-flows.json, hasil ekspor dari Node-RED (garis berlabel ekspor). Bawah, menyusul: Node 2 "Kebun" (Modul 14, lewat Node 1) dan backend TypeScript (Modul 16, otak pindah ke sini). Catatan: Node 1 tetap v1.2.1 karena kontrak data membuat pendengar baru bisa datang tanpa mengubah perangkat; aturan lokal Node 1 (siram dan lampu otomatis) tetap berjalan, dan Node-RED hanya mengurus kipas.](aset/diagram-proyek-modul-13.png)

> 🖥️ **Alat yang dipakai:** editor Node-RED di browser laptop, HP, Node 1 yang hidup dari *charger*-nya, terminal SSH ke Pi, **VS Code** dengan folder `rumah-pintar-mini`, dan **GitHub Desktop**.
>
> Jalur laptop (termasuk Node 1 di Wokwi): Node-RED di laptop dari Praktik 8 menggantikan Node-RED di Pi, dengan alamat dari tabel 8.2. Kerjakan langkah A, D, dan E. Lewati B dan C karena keduanya butuh Pi: Node-RED di laptop berhenti saat laptop tidur atau terminalnya ditutup, jadi uji "tanpa laptop" memang mustahil. Punya Pi, tetapi Node 1-mu masih di Wokwi? Kerjakan semua langkah kecuali B, yang baru bisa dibuktikan setelah papanmu ada karena simulasi Wokwi ikut berhenti saat laptop mati.
>
> ⭐ **Wajib** — syarat lulus Modul 13.

| Berkas di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `edge/node-red-flows.json` | **baru**: semua flow Node-RED, yaitu dashboard v0 dan otomasi kipas (Praktik 7, diperbarui di langkah D) |
| `edge/README.md` | bagian baru **Node-RED dan dashboard (Modul 13)**: cara memasang ulang Node-RED dan memulihkan flow (langkah C) |
| `firmware/node-1-rumah/` | tidak berubah, tetap v1.2.1 |

### A. Rapikan flow: keterangan, label, dan debug

Flow yang rapi mudah dibaca lagi tiga bulan dari sekarang, baik olehmu sendiri maupun oleh orang lain.

1. **Di editor Node-RED**, hapus tab `Latihan` dari Praktik 1 supaya cadanganmu hanya berisi flow proyek: klik dua kali tab `Latihan`, klik **Delete** di panel `Edit flow: Latihan`, lalu klik **Deploy**.
2. Klik dua kali tab `Rumah Pintar Mini` (namanya dari Praktik 2.1). Di kotak **Description** pada panel `Edit flow: Rumah Pintar Mini`, tulis satu kalimat, misalnya `Dashboard v0 dan otomasi kipas (Modul 13).`, lalu klik **Done**. Keterangan ini ikut tersimpan di berkas ekspor.
3. Beri judul setiap kelompok node dengan node **comment** (kategori `common`). Seret satu node comment ke atas setiap kelompok, klik dua kali, lalu isi **Name**:
   - `1 · Sensor: telemetry dan status Node 1 ke dashboard`
   - `2 · Otomasi kipas: nyala > 30 °C, padam < 28 °C`
   - `3 · Kendali dari HP: widget → buat cmd → mqtt out`
   - `4 · Jawaban Node 1 (ack) → keadaan sakelar yang sebenarnya`

   Node comment tidak mengerjakan apa pun; ia hanya tulisan di ruang kerja. Tanda `·` dan `→` boleh kamu ganti dengan tanda hubung biasa.
4. Atur letak node supaya kabelnya sesedikit mungkin bersilangan, kira-kira seperti gambar di bawah. Untuk memindahkan satu kelompok sekaligus, seret kotak pilihan dari ruang kosong sampai menutupi kelompok itu, lalu seret salah satu node yang terpilih. Letak node tidak mengubah cara kerja flow; gunanya hanya supaya mudah dibaca.

![Tangkapan layar seluruh flow dashboard v0 di tab Rumah Pintar Mini, panel kiri dan kanan editor disembunyikan. Bagian 1, Sensor: mqtt in telemetry Node 1 tersambung ke debug lihat telemetry, switch DHT22 terbaca? (ke gauge Suhu, gauge Kelembapan, dan chart Suhu & kelembapan), switch air terbaca? (ke gauge Air tandon), gauge Tanah, serta text Cahaya dan Gerak; mqtt in status Node 1 ke text Node 1 dan debug lihat status. Bagian 2, Otomasi kipas, nyala di atas 30 °C dan padam di bawah 28 °C: kabel dari DHT22 terbaca? ke switch histeresis 30/28, lalu change kipas nyala dan kipas padam, lalu filter hanya kalau berubah, lalu ke change buat cmd. Bagian 3, Kendali dari HP: switch Kipas, switch Lampu, button Siram 5 detik, dan slider Tirai (derajat) ke buat cmd, lalu ke mqtt out cmd Node 1 dan debug lihat cmd. Bagian 4, Jawaban Node 1: mqtt in ack Node 1 ke change keadaan kipas, keadaan lampu, dan keadaan tirai (kabelnya kembali ke sakelar dan penggeser), text Jawaban terakhir, dan debug lihat ack. Judul keempat bagian itu adalah node comment. Debug lihat telemetry, lihat status, dan lihat ack sudah dimatikan (tombol di sisi kanannya pudar), sedangkan lihat cmd tetap hidup. Keempat node MQTT (tiga mqtt in dan satu mqtt out) berstatus connected.](aset/flow-dashboard-v0.png)

*Tangkapan layar asli Node-RED 5.0.8 (lisensi Apache 2.0) dari laptop penulis; judul dan keterangan oleh penulis.*

5. Diamkan node debug yang tidak perlu terus berbicara, seperti di Praktik 1.4: klik tombol hijau di sisi kanan `lihat telemetry`, `lihat status`, dan `lihat ack` sampai tombolnya memudar. Node-nya tetap ada dan bisa dihidupkan lagi kapan saja dengan klik yang sama. Biarkan `lihat cmd` tetap hidup: setiap kali otomasi atau sakelar mengirim perintah, panel debug mencatatnya.
6. Klik **Deploy**.

### B. ⭐ Uji tanpa laptop, lalu biarkan 24 jam

Gateway yang baik tetap bekerja saat laptopmu mati. Inilah ujian sebenarnya minggu ini.

1. Sebelum mematikan laptop, baca dulu langkah 2–5 sampai habis, atau buka modul ini di HP, seperti ➕ D Modul 12. Pastikan juga suhu kamar di bawah batas padam di node `histeresis 30/28` supaya kipas padam sendiri dan uji di langkah 4 terlihat jelas; kalau sesudah Praktik 6 kamu memasang batas yang lebih rendah daripada suhu kamar, pakai lagi batas uji dari Praktik 6.1, lalu klik **Deploy**. Setelah itu, tutup tab editor Node-RED di browser, lalu matikan laptop (atau tutup layarnya sampai laptop tidur).
2. Di HP, buka `http://192.168.1.37:1880/dashboard/rumah`. Status Node 1 menunjukkan `online`, dan angka suhu serta kelembapan tetap berganti setiap 10 detik.
3. Ketuk sakelar **Lampu**: relay lampu berbunyi "klik", LED indikatornya menyala, sakelarnya bergeser setelah `ack` tiba, dan **Jawaban terakhir** menulis `dikerjakan`. Ketuk sekali lagi untuk mematikannya.
4. Genggam DHT22 seperti Praktik 6.3 sampai suhunya melewati batas nyala. Kipas menyala sendiri, dan sakelar **Kipas** di HP ikut bergeser. Semua ini terjadi tanpa laptop: dashboard dan otomasi tinggal di gateway.
5. Biarkan semuanya berjalan sampai besok. Keesokan harinya, nyalakan laptop dan masuk ke Pi lewat SSH (`ssh budi@192.168.1.37`). **Di Pi**, jalankan:

   ```bash
   systemctl status nodered
   ```

   Lihat baris `Active:`. Tulisannya `active (running) since …`, dan waktu di belakangnya masih kemarin, misalnya `since Sun 2026-10-18 10:45:01 WIB; 1 day 2h ago` (contoh). Artinya, Node-RED berjalan terus tanpa sekali pun menyala ulang. Tekan **q** untuk kembali ke *prompt*. Di HP, grafik menampilkan satu jam terakhir dengan garis yang tidak terputus.

Kalau Pi sempat menyala ulang, misalnya karena listrik padam, grafik mulai lagi dari kosong. Dashboard 2 menyimpan riwayat grafik di memori, dan isi memori hilang saat Node-RED menyala ulang. Riwayat yang awet bertahun-tahun adalah pekerjaan database di Modul 17–18. Sakelar juga baru menunjukkan keadaan relay setelah perintah berikutnya dijawab `ack`.

### C. Resep gateway: tambahkan Node-RED

Resep `edge/README.md` dari Modul 12 baru berisi cara memasang broker. Tambahkan bagian Node-RED supaya gateway bisa dibangun ulang secara lengkap.

1. Di browser laptop, buka [`proyek-rumah-pintar-mini/edge/README.md`](../../proyek-rumah-pintar-mini/edge/README.md) di GitHub. Bagian paling bawahnya, **Node-RED dan dashboard (Modul 13)**, berisi tabel kecil dan langkah 8–12.
2. Klik tombol **Raw** di atas isi berkas supaya isinya tampil sebagai teks biasa. Sorot teks mulai baris `## Node-RED dan dashboard (Modul 13)` sampai akhir berkas, lalu salin (**Ctrl + C**).
3. Di VS Code, buka `edge/README.md` milikmu. Klik di akhir baris paling bawah, tekan **Enter** dua kali, lalu tempel (**Ctrl + V**). Salin juga baris `node-red-flows.json` dari tabel **Berkas di folder ini** di halaman GitHub tadi, lalu klik di akhir baris `gateway-pi.conf` pada tabel yang sama di berkasmu, tekan **Enter** sekali, dan tempel di situ. Jangan sisakan baris kosong di antara baris tabel; baris yang terpisah baris kosong tidak tampil sebagai bagian tabel.
4. Sesuaikan isinya dengan gateway-mu: alamat `192.168.1.37` (tekan **Ctrl + H** di VS Code, macOS: **Cmd + Option + F**, seperti ➕ E Modul 12), nama pengguna `budi` kalau milikmu berbeda, dan batas otomasi kalau kamu memakai batas lain. Di paragraf pembuka berkasmu, ganti juga `sekitar 30 menit` dengan `sekitar satu jam` karena resepnya kini ikut memasang Node-RED. Simpan dengan **Ctrl + S**. **Jangan pernah menulis kata sandi editor atau *passphrase*** di berkas ini.

### D. Ekspor ulang flow yang sudah rapi

Flow-mu berubah di langkah A, jadi berkas cadangan dari Praktik 7 perlu diperbarui.

1. **Di editor Node-RED**, ulangi Praktik 7.1: menu utama → **Export** → **all flows** → **formatted** → **Download**.
2. **Di laptop**, buka folder **Downloads**. Ubah dulu nama `flows.json` menjadi `node-red-flows.json` (kalau akhiran `.json` tidak tampil, ketik `node-red-flows` saja, seperti di Praktik 7.2), lalu pindahkan berkas itu ke folder **Documents → GitHub → rumah-pintar-mini → edge**. Karena berkas dengan nama yang sama sudah ada dari Praktik 7, Windows bertanya apa yang harus dilakukan: pilih **Replace the file in the destination**. Di macOS, pilih **Replace**. Kalau browser menamai unduhannya `flows (1).json`, pakai berkas terbaru itu.
3. Di VS Code, buka `edge/node-red-flows.json`. Tekan **Ctrl + F** dan cari sepotong kalimat keterangan tab yang kamu tulis di langkah A, misalnya `otomasi kipas (Modul 13)`: kalau ketemu, berkasnya sudah yang baru. Cari juga `Latihan` dan `password`: keduanya tidak ditemukan.

### E. ⭐ Simpan ke GitHub

1. Di GitHub Desktop, pilih repositori **`rumah-pintar-mini`**. Daftar **Changes** berisi `edge/node-red-flows.json` dan `edge/README.md` (jalur laptop: hanya `edge/node-red-flows.json` karena langkah C dilewati). Tidak boleh ada `flows_cred.json` atau `settings.js` di sana: keduanya tinggal di Pi dan tidak pernah masuk repositori. Isi **Summary** dengan `Modul 13: dashboard v0 Node-RED dan otomasi kipas`, klik **Commit … to main**, lalu **Push origin**.
2. Di repositori **`belajar-iot`**, buat catatan modul ini: di VS Code, **File → New Text File**, lalu **File → Save As…** dengan nama `catatan-modul13.md` di folder **Documents → GitHub → belajar-iot → modul-13** (buat folder `modul-13` kalau belum ada). Tulis alamat dashboard-mu, batas otomasi yang kamu pakai saat menguji dan batas akhirnya (Praktik 6.1), baris `LULUS` dari pemeriksa kontrak (Praktik 5.6; kalau terminalnya sudah ditutup, jalankan lagi pemeriksanya dan ketuk sakelar **Kipas** dua kali supaya kipas kembali ke keadaan semula), dan hasil langkah B (jalur laptop: alamat IP laptopmu sebagai gantinya). Lakukan *commit* dan *push* juga.

**Bukti lulus Modul 13** (bandingkan dengan ✅ di bawah): HP membuka dashboard dari gateway, sakelar kipas bekerja dan mengikuti `ack` (Praktik 5), otomasi menyalakan kipas saat DHT22 dihangatkan, juga saat laptop mati (Praktik 6, langkah B), dan flow tersimpan di repositori (Praktik 7, langkah D–E).

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Node-RED** | Alat *low-code* sumber terbuka untuk menyusun program dari kotak dan kabel di browser; berjalan di gateway Pi sebagai layanan `nodered`. |
| ***Low-code*** (sedikit kode) | Cara membuat program yang sebagian besar dilakukan dengan memilih dan menyambung, bukan menulis kode. |
| ***Flow*** (alur) | Rangkaian node dan kabel di satu tab editor Node-RED. |
| ***Node*** (kotak) | Satu kotak di flow yang mengerjakan satu tugas: mendengar MQTT, mengubah pesan, menampilkan widget, dan sebagainya. |
| **`msg`** | Pesan yang berjalan di sepanjang kabel; isinya terutama `msg.payload` (muatan) dan `msg.topic` (topik). |
| ***Deploy*** (menerapkan) | Mengirim flow dari editor ke Node-RED yang berjalan di Pi. Pintasan **Ctrl + D**. |
| **Node debug** | Node yang menampilkan pesan di panel **Debug messages**; kaca pembesar Node-RED. |
| ***Config node*** (node pengaturan) | Node yang tidak tampil di ruang kerja dan dipakai bersama, misalnya sambungan broker `Mosquitto di gateway` dan halaman dashboard. |
| **JSONata** | Bahasa ekspresi kecil untuk membaca dan menyusun data JSON, dipakai di isian berjenis **J: expression**. |
| **Dashboard 2** | Paket `@flowfuse/node-red-dashboard` yang menambahkan widget dan halaman web di `/dashboard`. |
| ***Widget*** (unsur tampilan) | Bagian dashboard yang tampil di layar: jarum ukur (gauge), grafik, teks, sakelar, tombol, dan penggeser. |
| **Histeresis** | Dua batas untuk satu keputusan (nyala di atas 30 °C, padam di bawah 28 °C) supaya alat tidak nyala-mati terus di sekitar satu batas. |
| ***Flow context*** | "Papan tulis" yang bisa dibaca semua node dalam satu tab, ditunjuk dengan awalan `flow.`; isinya hilang saat Node-RED dinyalakan ulang. |
| **`adminAuth`** | Pengaturan di `settings.js` yang membuat editor Node-RED meminta nama pengguna dan kata sandi. |
| **Ekspor/impor flow** | Menyimpan flow ke berkas JSON (tanpa kredensial) dan memasangnya kembali di Node-RED mana pun. |

## 📝 Kuis (5 soal)

1. Apa bedanya menekan **Done** di jendela pengaturan node dengan menekan **Deploy**? Apa arti titik biru di atas node?
2. Mengapa node **mqtt out** untuk perintah harus diisi **Topic**, **QoS** `1`, dan **Retain** `false` dengan tegas, bukan dibiarkan kosong?
3. Sakelar **Kipas** di dashboard memakai **Indicator** `Switch icon shows state of the input` dan menerima `ack`. Apa yang terlihat di HP kalau Node 1 sedang mati lalu sakelarnya diketuk, dan mengapa itu lebih baik daripada sakelar yang langsung bergeser?
4. Jelaskan mengapa otomasi kipas memakai dua batas (30 °C dan 28 °C). Mengapa node **filter** harus diletakkan **sebelum** `buat cmd`, bukan sesudahnya?
5. Kamu mengekspor flow dan menyimpannya di GitHub publik. Apakah kata sandi editor dan kredensial broker ikut tersebar? Berkas apa di folder `~/.node-red` yang tidak boleh disalin ke repositori?

<details>
<summary><b>Kunci jawaban</b></summary>

1. **Done** hanya menyimpan pengaturan node di editor, di browser laptop. Node-RED di Pi belum berubah sampai kamu menekan **Deploy**, yang mengirim seluruh flow ke Pi lalu menjalankannya. Titik biru berarti node itu sudah diubah, tetapi perubahannya belum di-*deploy* (Konsep 2).
2. Isian yang kosong diambil dari pesan yang masuk ke node itu. Pesan yang berasal dari mqtt in membawa `msg.topic` seperti `rpm/…/telemetry` dan kadang `msg.retain` bernilai `true` sehingga perintah bisa terbit ke topik yang salah atau menjadi *retained*. Perintah *retained* diserahkan broker lagi setiap kali Node 1 menyambung, dan dikerjakan lagi begitu ingatan `id`-nya kosong, misalnya setelah Node 1 menyala ulang; itulah larangan kontrak data Modul 11 (Konsep 4).
3. Sakelar hanya menampilkan tanda tunggu dan tidak pernah bergeser karena tidak ada `ack` yang datang; teks `Node 1` pun menulis `offline`. Sakelar yang langsung bergeser akan "berbohong": penghuni mengira kipas menyala, padahal perintahnya tidak pernah sampai. Dengan umpan balik `ack`, layar selalu menunjukkan keadaan relay yang sebenarnya (Konsep 6, Praktik 5.2).
4. Dengan satu batas, bacaan yang bergoyang sedikit di sekitar 30 °C membuat kipas nyala-mati setiap 10 detik. Dua batas membuat pita 28–30 °C, tempat kipas dibiarkan dalam keadaan terakhirnya. Filter meneruskan pesan hanya kalau isinya berbeda dari pesan terakhir; setelah `buat cmd`, setiap pesan selalu berbeda karena `id`-nya baru. Akibatnya, filter tidak pernah menahan apa pun, dan perintah terkirim setiap 10 detik (Konsep 7).
5. Tidak. Ekspor tidak pernah membawa kredensial; kata sandi editor tersimpan (teracak) di `settings.js`, dan kredensial node di `flows_cred.json` yang dikunci dengan *passphrase*. *Passphrase* itu sendiri tertulis apa adanya di `settings.js`, jadi kedua berkas itu tidak boleh tersebar. Yang tidak boleh disalin ke repositori: `settings.js`, `flows_cred.json`, serta berkas tersembunyi `.config.*.json` dan `.sessions.json` (Konsep 8).

</details>

---

## ✅ Checklist kelulusan Modul 13

Syarat lulus dari Silabus: **HP membuka dashboard Node-RED di Pi, tombol kipas berfungsi, otomasi menyalakan kipas saat sensor dihangatkan, dan *flow* JSON ada di repositorimu.** Jalur laptop: sama, dengan Node-RED di laptop dan broker dari tabel 8.2 (Praktik 8); dashboard dibuka dari HP lewat alamat IP laptop (Praktik 8.3).

- [ ] Node-RED 5 terpasang di Pi sebagai layanan `nodered` yang `enabled` dan `active (running)`, dan tetap hidup setelah `sudo reboot` (Kemenangan Cepat, Praktik 2; jalur laptop: Node-RED 5 berjalan di laptop dengan `node-red`, Praktik 8).
- [ ] Editor Node-RED meminta **Username** dan **Password** sebelum terbuka (Kemenangan Cepat).
- [ ] Aku bisa menjelaskan `msg.payload`, **Deploy**, dan kegunaan node debug (Praktik 1).
- [ ] Panel debug menampilkan `telemetry`, `status`, dan `ack` Node 1 (Kemenangan Cepat, Praktik 2).
- [ ] HP membuka `http://192.168.1.37:1880/dashboard/rumah` dan menampilkan status, kelima sensor, dan grafik (Praktik 3–4).
- [ ] Sakelar **Kipas** di HP menyalakan dan mematikan kipas, dan sakelarnya mengikuti `ack` (Praktik 5).
- [ ] Pemeriksa kontrak menulis `LULUS` untuk perintah dari Node-RED (Praktik 5.6).
- [ ] Otomasi menyalakan kipas saat DHT22 dihangatkan dan mematikannya setelah dingin, masing-masing dengan **satu** perintah (Praktik 6).
- [ ] Dashboard dan otomasi tetap bekerja saat laptop mati, dan Node-RED berjalan 24 jam tanpa menyala ulang (➕ B; jalur laptop: lewati; Node 1 di Wokwi: setelah papanmu ada).
- [ ] `edge/node-red-flows.json` dan resep gateway yang diperbarui sudah di-*commit* dan di-*push* ke `rumah-pintar-mini`, tanpa kata sandi apa pun (Praktik 7, ➕; jalur laptop: cukup `edge/node-red-flows.json`).

> ➡️ **Modul berikutnya:** Modul 14 — Node 2 "Kebun". Rumah Pintar Mini mendapat node sensor kedua yang bertenaga baterai di kebun dan berbicara langsung dengan Node 1 lewat ESP-NOW, tanpa router. Datanya akan muncul di dashboard Node-RED ini dengan `device_id`-nya sendiri.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, kode sumber, dan halaman yang dipakai** (diakses Oktober 2026):

- [Node-RED](https://nodered.org/) 5.0.8 ([sejarah singkatnya](https://nodered.org/about/)), [kode sumbernya](https://github.com/node-red/node-red/tree/5.0.8), dan [catatan rilis 5.0](https://nodered.org/blog/2026/06/09/version-5-0-released): susunan editor (palet, panel Information dan Debug); tombol **Deploy** dan pilihannya; pintasan papan ketik; isian node **mqtt in**, **mqtt out**, **change**, **switch**, **filter**, **inject**, dan **debug**; teks catatan saat menyala; dialog **Export**/**Import**; serta kredensial yang tidak ikut terekspor. Dokumentasi resmi: [Running on Raspberry Pi](https://nodered.org/docs/getting-started/raspberrypi), [Running locally](https://nodered.org/docs/getting-started/local), [Securing Node-RED](https://nodered.org/docs/user-guide/runtime/securing-node-red), [Writing Functions](https://nodered.org/docs/user-guide/writing-functions), [Supported Node versions](https://nodered.org/docs/faq/node-versions), dan [Node-RED Cookbook](https://cookbook.nodered.org/) (resep *report by exception* dan *route on property*).
- Skrip pemasang resmi [node-red/linux-installers](https://github.com/node-red/linux-installers/tree/v2.2.1) v2.2.1: pertanyaan dan batas waktunya, daftar centang, Node.js 24 dari NodeSource, berkas unit `nodered.service` (`Restart=on-failure`, `RestartSec=20`), dan perintah `node-red-start`, `node-red-stop`, `node-red-restart`, dan `node-red-log`. Alat tanya jawab `node-red admin init` dari paket [node-red-admin](https://github.com/node-red/node-red-admin) 4.1.8.
- [FlowFuse Dashboard](https://dashboard.flowfuse.com/) (`@flowfuse/node-red-dashboard`) 1.33.0 dan [kode sumbernya](https://github.com/FlowFuse/node-red-dashboard/tree/v1.33.0): pembuatan dashboard, halaman, dan grup otomatis; isian widget gauge, chart, text, switch, button, dan slider; tata letak kolom di HP; serta perlakuan nilai `null`. Pernyataan bahwa Dashboard 1 sudah usang ada di [node-red-dashboard](https://github.com/node-red/node-red-dashboard).
- [JSONata](https://jsonata.org/) (fungsi `$millis`, `$now` dengan pola waktu, `$uppercase`, `$string`).
- Home Assistant: [halaman resmi](https://www.home-assistant.io/), [instalasi di Raspberry Pi](https://www.home-assistant.io/installation/raspberrypi), [Apps](https://www.home-assistant.io/apps/), dan [integrasi MQTT](https://www.home-assistant.io/integrations/mqtt/).
- [Node.js](https://nodejs.org/) (jadwal rilis dan versi 24 LTS), [NodeSource](https://github.com/nodesource/distributions), dan paket Debian 13 [nodejs](https://packages.debian.org/trixie/nodejs).
- [EMQX: broker MQTT publik](https://www.emqx.com/en/mqtt/public-mqtt5-broker) (`broker.emqx.io`, peringatan bahwa semua pesan terlihat oleh orang lain).

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan berkas sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Tangkapan layar editor Node-RED dan dashboard diambil dari Node-RED 5.0.8 dan FlowFuse Dashboard 1.33.0 yang dijalankan di laptop penulis, dengan data dari Node 1 tiruan; Node-RED dan FlowFuse Dashboard berlisensi Apache 2.0, dan "Node-RED" adalah merek dagang OpenJS Foundation. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-13`, `alur-flow-node-msg`, `node-red-di-gateway`, `susunan-dashboard-2` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Nama node, widget, dan isian dari Node-RED 5.0.8 dan FlowFuse Dashboard 1.33.0; alamat dan `device_id` hanya contoh. | CC BY 4.0 |
| `perintah-dan-ack`, `histeresis-kipas`, `diagram-proyek-modul-13` (`.png` + `.svg`) | Diagram orisinal. Bentuk `cmd` dan `ack` dari kontrak data Modul 11; kurva suhu di grafik histeresis disusun penulis untuk penjelasan, bukan rekaman sensor. | CC BY 4.0 |
| `editor-node-red.png`, `flow-dashboard-v0.png` | Tangkapan layar asli editor Node-RED 5.0.8 dari laptop penulis, dengan data Node 1 tiruan; nomor penanda (gambar editor), judul, dan keterangan oleh penulis. | Node-RED berlisensi Apache 2.0 ("Node-RED" merek dagang OpenJS Foundation); gambar: CC BY 4.0 |
| `hp-dashboard.png`, `hp-kendali.png` | Tangkapan layar asli FlowFuse Dashboard 1.33.0 selebar layar HP (412 piksel) dari laptop penulis, dengan data Node 1 tiruan; bingkai HP, nomor, dan keterangan oleh penulis. | FlowFuse Dashboard berlisensi Apache 2.0; gambar: CC BY 4.0 |

**Tentang kotak Hasilnya.** Node-RED, Dashboard 2, dan flow modul ini diuji penulis di laptop dengan Node-RED 5.0.8 dan FlowFuse Dashboard 1.33.0 di atas Node.js 24. Flow dashboard v0 dimuat tanpa galat. Otomasi kipas mengirim tepat satu perintah saat suhu tiruan naik melewati 30 °C dan satu lagi saat turun di bawah 28 °C, dan pemeriksa kontrak Modul 11 menulis `LULUS` untuk kedua perintah itu. Tidak ada Raspberry Pi di meja penulis, jadi kotak **Hasilnya** dari terminal Pi (skrip pemasang, `node-red-log`) bertanda **contoh**: susunan dan teks setiap barisnya diambil dari kode sumber program dengan versi yang sama, sedangkan jam, nomor versi Node.js, dan angka lainnya hanya contoh.

---

[⬅️ Modul 12](../modul-12-raspberry-pi-dan-linux/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 14 — Node 2 "Kebun": Sensor Bertenaga Baterai via ESP-NOW](../modul-14-node-2-esp-now/README.md) ➡️**
