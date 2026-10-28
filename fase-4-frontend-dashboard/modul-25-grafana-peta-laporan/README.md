# Modul 25 — Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan

🌐 **Bahasa Indonesia** · [English](../../en/phase-4-frontend-dashboard/module-25-grafana-maps-reports/README.md)

*Fase 4 · Minggu 25 · Perangkat keras: **Kit A + B** (Node 2 dengan baterai) atau simulator Modul 21 + **Kebun tiruan** · **akun Telegram + bot Modul 19** · Prasyarat: **Modul 24** (dashboard v1.0 + backend 1.1 di `main`), Modul 18, Modul 19 (vitals & bot), Modul 23 · Waktu: 11–13 jam, dicicil dalam satu minggu*

[⬅️ Modul 24](../modul-24-kendali-aturan-peran/README.md) · [Fase 4](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 26 ➡️](../../fase-5-operasi-skala/modul-26-docker-compose/README.md)

---

Modul 24 ditutup dengan dashboard v1.0 yang **memerintah**: admin menyalakan lampu dan membuat aturan siram, sedangkan viewer hanya melihat. Dashboard itu dibuat untuk **penghuni rumah**. Di [akhir Modul 24](../modul-24-kendali-aturan-peran/README.md#-checklist-kelulusan-modul-24) sudah disebut siapa yang datang berikutnya: untuk **tim teknis**, Grafana yang membaca TimescaleDB dan mengirim *alert* Telegram saat node **diam** lebih dari 5 menit, ditambah peta perangkat dan laporan harian CSV otomatis.

Bahannya sudah lama disiapkan. Loket 3000 disisihkan untuk Grafana sejak [Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#2-http-sekali-lagi-metode-rute-kode-status-dan-loket). Kolom `lat` dan `lng` di tabel `devices` "disiapkan untuk peta perangkat di Fase 4" sejak [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#3-tabel-baris-kolom-tipe-dan-kunci-utama), dan `device_health` [mengumpulkan `vitals`](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#57-lihat-datanya-berdatangan) (RSSI, *uptime*, *heap*) tanpa pernah kamu lihat sebagai grafik. Node-RED sudah pensiun sebagai otak sejak Modul 16, tetapi [dashboard-nya dari Modul 13](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#5-dashboard-2-halaman-grup-dan-widget) minggu ini ditimbang jujur di samping dua dashboard lain. Pertanyaan dari [🔬 Modul 13](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#-bedah-teknis-opsional), "kapan membeli platform jadi, kapan membangun sendiri", juga dijawab di sini.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| RSSI, *uptime*, dan *heap* tersimpan di database, tetapi riwayatnya tidak pernah terlihat. | Tidak ada layar yang membaca `device_health`; `GET /devices/:id/vitals` hanya memegang bacaan terakhir di memori, kosong lagi setiap backend dimulai ulang ([🚨 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-kalau-tidak-jalan)). | **Grafana** di samping database: panel dari SQL dan satu dashboard "Kesehatan Sistem" untuk semua perangkat (Kemenangan Cepat, Konsep 2–6, Praktik 1–2) |
| Kalau Node 2 mati, kamu baru dikabari ±17 menit sesudah paket terakhirnya, itu pun hanya kalau backend sedang menyala. | Node 2 bangun tiap 300 detik; status `offline`-nya diterbitkan Node 1 sesudah 960 detik tanpa paket, lalu backend menunggu 60 detik lagi. Status yang terbit sebelum backend menyala tidak dikabarkan. | ***Alert* "Node diam"** dari Grafana, dihitung dari data yang berhenti datang: untuk Node 2, 🔴 5,5–11,5 menit sesudah mati (Konsep 7, Praktik 3–5) |
| Grafana butuh kunci database, padahal kunci yang ada serba boleh. | Satu-satunya akun database adalah `postgres`, yang boleh mengubah dan menghapus apa saja. | **Akun hanya-baca `grafana_baca`**: hanya kolom yang perlu, ditolak menulis, tanpa tabel akun, sesi, aturan, dan kolom kunci perangkat (Konsep 3, Kemenangan Cepat, Praktik 1) |
| Kolom `lat` dan `lng` ada sejak Modul 17, tetapi tak satu titik pun pernah tampil. | `GET /devices` backend 1.1 tidak mengirimnya, dan belum ada rute untuk mengisinya. | **Backend 1.2.0** dengan `lat`/`lng` dan rute admin `PUT /devices/:id/lokasi`, lalu **dashboard 1.1.0** dengan halaman **Peta** (react-leaflet, ubin OpenStreetMap; Konsep 8–9, Praktik 6–7) |
| Kabar kemarin hanya kamu ketahui kalau membuka dashboard. | Kabar Telegram backend hanya untuk kejadian saat itu juga; belum ada ringkasan yang bisa disimpan. | **Laporan harian CSV** dari backend ke Telegram pukul 07.00 WIB, selama laptop dan backend menyala (Konsep 10, Praktik 8–9) |
| Belum jelas kapan sebaiknya membeli platform jadi. | Pertanyaan Modul 13 itu ditunda sampai kamu punya sistem sendiri sebagai pembanding. | **Beli atau bangun**: platform siap pakai, misalnya ThingsBoard, Home Assistant, Blynk, dan Antares, ditimbang dengan kriteria yang jelas (Konsep 11) |

Di akhir minggu, Grafana mengabarimu saat Node 2 berhenti mengirim, dan laporan kemarin menunggu di Telegram setiap pagi. Itulah syarat lulus dari [Silabus](../../SILABUS.md#modul-25--visualisasi-profesional-grafana-peta-perangkat--laporan): **Grafana mengirim alert Telegram saat Anda mencabut baterai Node 2, dan laporan harian tiba otomatis.** Modul ini memecahnya menjadi **G1** pesan uji *contact point* Telegram Grafana sampai (tombol **Test**, [4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit)), **G2** baterai Node 2 dicabut dari dudukannya → Grafana mengabari 🔴, dipasang lagi → ✅ ([5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit) dan [5.4](#54--pasang-lagi-dua-kabar-pulih-dan-lembar-catatan-waktunya-10-menit)), dan **G3** laporan harian CSV tiba sesuai jadwal tanpa disentuh ([9.1](#91--gladi-tangan-lepas-jadwal-3-menit-ke-depan-lalu-kembalikan-ke-0700-15-menit)). Di jalur laptop, bunyinya: "Grafana mengirim alert Telegram saat **Kebun tiruan** berhenti (`kebun cabut`), dan laporan harian tiba otomatis." Untuk Node 2, 🔴 baru tiba **5,5–11,5 menit** sesudah baterainya dicabut (rumusnya di [Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)). Bunyi *praktik* modul ini di Silabus diperbarui (v1.0.27) menjadi RSSI, *uptime*, dan *heap* **Node 1** ditambah jumlah paket per jam **Node 2**, dengan *alert* "**node diam**", karena Node 2 tidak mengirim `vitals` dan hanya bangun tiap 300 detik ([Konsep 6](#6-membaca-kesehatan-perangkat-rssi-uptime-heap-dan-paket-per-jam)–7).

Untuk Rumah Pintar Mini, backend naik ke **1.2.0** (lokasi perangkat lewat API dan laporan harian; tanpa migrasi, tanpa paket baru), dashboard ke **1.1.0** (halaman **Peta**), ada folder baru **`grafana/`**, simulator di `alat/` mendapat **Kebun tiruan**, dan `edge/acl-broker` mendapat blok 2b berkomentar untuk jalur laptop. Kontrak data tetap **1.4**, dan firmware Node 1 (v1.6.0) serta Node 2 (v1.0.0) tidak berubah. Modul ini ditutup dengan 🎉 **Checkpoint Fase 4** di [Praktik 10](#praktik-10--checkpoint-fase-4-kumpulkan-buktinya-45-menit).

![Peta jalan Modul 25. Atas, enam fase kurikulum; Fase 4 Dashboard (Modul 22–25) berbingkai ungu. Modul 1–24 selesai; Modul 25 merah bertanda KAMU DI SINI, modul terakhir Fase 4, dengan bendera ungu 🎉 Checkpoint Fase 4 di akhir modul ini (Praktik 10). Catatan: dua dashboard, buatanmu untuk penghuni, Grafana untuk tim teknis; alert node diam ke Telegram, peta perangkat, laporan harian CSV. Kotak Modul 25 minggu ini, 11–13 jam dicicil; Kit A + B (Node 2 berbaterai) atau simulator Modul 21 + Kebun tiruan, bot Telegram Modul 19, lanjutan dashboard v1.0 + backend 1.1 Modul 24. Kolom kiri: pemanasan SQL dan JavaScript; Kemenangan Cepat, panel pertama, suhu rumahmu di Grafana; P1 Grafana yang rapi dan aman (akun hanya-baca grafana_baca, 127.0.0.1:3000); P2 dashboard Kesehatan Sistem (RSSI, uptime, heap Node 1 + variabel $node); P3 Kebun di dashboard teknis (paket Node 2 per jam, acuan 12, menit terlambat); P4 alert node diam dan contact point Telegram, G1: pesan uji tombol Test tiba; P5 cabut baterai Kebun, G2: 🔴 sesudah 5,5–11,5 menit, lalu ✅. Kolom kanan: P6 backend 1.2, lokasi lewat API (lat/lng di GET /devices, PUT /devices/:id/lokasi); P7 halaman Peta dengan react-leaflet (ubin OpenStreetMap, warna ikut status live); P8 backend 1.2, laporan harian CSV ke Telegram; P9 laporan yang datang sendiri, Grafana sebagai berkas, G3: gladi jadwal ±3 menit, tangan lepas; P10 🎉 Checkpoint Fase 4 (kuis, uji orang lain Modul 24, video demo HP, JSON Grafana); Tambahan: pull request Dashboard teknis + peta + laporan harian (Checkpoint Fase 4). Semua praktik dan pull request bertanda bintang, wajib. Bawah, syarat lulus (pecahan ✅ Silabus): G1 contact point Telegram Grafana sampai (tombol Test); G2 baterai Node 2 dicabut (jalur laptop: Kebun tiruan, kebun cabut), Grafana mengabari 🔴, dipasang lagi ✅; G3 laporan harian CSV tiba sesuai jadwal tanpa disentuh; kalimat ✅ Silabus, tetap persis di v1.0.27: Grafana mengirim alert Telegram saat Anda mencabut baterai Node 2, dan laporan harian tiba otomatis. Dibuktikan: G1 Praktik 4, G2 Praktik 5, G3 Praktik 9, ketiganya dicentang lagi di Praktik 10. Bunyi praktik baru (Silabus v1.0.27): Kesehatan Sistem = RSSI, uptime, heap Node 1 + paket per jam Node 2; alert node diam = Node 1 lebih dari 5 menit tanpa data, Node 2 lebih dari 5 menit melewati jadwal bangunnya (tiap 300 detik). Dua jalur data: perangkat (Kit A + B, baterai 18650 Node 2) atau laptop (simulator f00d00000001 + Kebun tiruan f00d000000b2, kebun cabut). Berubah: backend 1.2.0, frontend 1.1.0, grafana/ baru, alat/, edge/acl-broker; tetap: kontrak data 1.4, firmware, tabel database. Grafana selalu di laptop, http://localhost:3000, bawaan hanya laptop ini; dashboard buatanmu http://localhost:5173.](aset/peta-jalan-modul-25.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Dua jalur data, satu Grafana.** **Jalur perangkat**: Node 1 dan Node 2 (**Kit A + B**) lewat broker di Pi; Node 2 memakai baterai 18650 yang bisa dicabut dari dudukannya. **Jalur laptop**: Mosquitto di laptop dan simulator Modul 21 (`f00d00000001`), yang minggu ini membawa **Kebun tiruan** `f00d000000b2`: Node 2 palsu yang bangun tiap 300 detik dan "dicabut baterainya" dengan `kebun cabut` ([5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit)). Pada **kedua** jalur, Grafana tinggal di laptop, di samping database ([Konsep 2](#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong)), dan dibuka di `http://localhost:3000`. Dashboard buatanmu tetap di `http://localhost:5173`.
> - **Lanjutan langsung Modul 24.** Dashboard v1.0 dan backend 1.1 di `main`, koleksi Bruno, `alat/.env`, serta akun `admin@rumah.test` dan `viewer@rumah.test` dari Modul 20 dipakai apa adanya. Grafana punya akun `admin` sendiri, terpisah dari akun dashboard. Pekerjaan minggu ini tinggal di cabang `fitur/grafana-peta-laporan`, dan hasilnya bisa dicocokkan dengan `kode/tahap/praktik-N` (Praktik 2, 3, 6, 7, dan 8).
> - **Tabel bukti**: tempat setiap syarat dibuktikan, dan tandanya. Ketiganya dicentang ulang di [10.4](#104--gladi-akhir-tes-backend-build-frontend-dan-tiga-syarat-lulus-20-menit).
>
>   | Syarat | Dibuktikan di | Yang kamu lihat |
>   | :-: | :-- | :-- |
>   | G1 | [4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit) | pesan `🔴 Notification test` dari bot-mu |
>   | G2 | [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit) dan [5.4](#54--pasang-lagi-dua-kabar-pulih-dan-lembar-catatan-waktunya-10-menit) | `🔴 Kebun (tiruan) (f00d000000b2) tidak mengirim data, terlambat 5.8 menit dari jadwalnya`, lalu `✅ Kebun (tiruan) kembali mengirim data.` (nama dan angkanya mengikuti perangkatmu) |
>   | G3 | [9.1](#91--gladi-tangan-lepas-jadwal-3-menit-ke-depan-lalu-kembalikan-ke-0700-15-menit) | log backend `laporan harian berjalan sesuai jadwal`, lalu berkas `laporan-YYYY-MM-DD.csv` dari bot-mu |
>
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **VS Code** dengan terminal `backend` (`npm run dev`, loket 8080), `frontend` (Vite, loket 5173), dan di jalur laptop `alat` (simulator) serta broker; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan kontainer `rumahpintar-db` dan `rumahpintar-grafana`; **Chrome atau Edge** dengan Grafana di `http://localhost:3000`; **Bruno**; dan **aplikasi Telegram**.
> - **Kotak Hasilnya.** Keluaran dan tangkapan layar direkam penulis di **Raspberry Pi 5 dengan Ubuntu 26.04.1 LTS (arm64)** yang berperan sebagai laptop, bukan di Windows 11 seperti Modul 17–24: Docker Engine 29.1.3, Node.js 24.21.0, npm 11.19.0, dan Chrome 156.0.8078.47, lawan backend, database, dan Grafana 13.2.4 sungguhan. Perintah `docker`, SQL, npm, Bruno, dan layar Grafana sama di Windows, macOS, dan Linux (perintah modul sengaja tanpa `<`, `>`, `$(…)`, dan tanpa *bind mount*), tetapi **Docker Desktop, PowerShell, dan aplikasi Bruno tidak direkam penulis**. Telegram di lab penulis adalah **server Bot API tiruan** tanpa token asli (seperti di [🔬 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#-bedah-teknis-opsional)), jadi kotak pesan berisi teks yang diterima server tiruan itu, tanpa tangkapan aplikasi Telegram. Datanya dari simulator, Kebun tiruan, dan riwayat `npm run isi-riwayat`, jadi angka sensornya **contoh**; jam, detik, dan ukuran berkas di layarmu pasti berbeda. Jam ditulis WIB, dan IP ditulis `192.168.1.10` (rincian di [📚 Sumber](#-sumber--atribusi-gambar)).
> - **Status jujur: penulis belum menguji dengan Telegram, Node 2, dan HP sungguhan.** G1–G3 dengan bot-mu sendiri, Node 2 dengan baterai 18650 sungguhan, video demo dari HP (Praktik 10), CSV di Excel, dan Docker Desktop belum dijalankan penulis. Semua itu tugasmu; jangan mencentang butir yang belum benar-benar terjadi di [✅](#-checklist-kelulusan-modul-25).
> - Menurut Silabus, ini modul terakhir [jalur tanpa Pi](../../SILABUS.md#53-kit-b--raspberry-pi-sebagai-gateway-dibutuhkan-mulai-modul-12); jalur laptop di atas cukup untuk lulus.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan VS Code dan browser. **Kecuali di terminal:** menghentikan program tetap **Ctrl + C**, juga di Mac.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Grafana hanya untuk laptop ini.** Loketnya `127.0.0.1:3000`, dan sandi `admin` diganti saat masuk pertama kali dengan **Submit**, bukan **Skip** ([Kemenangan Cepat (KC) Langkah 3](#langkah-3--masuk-pertama-kali-dan-ganti-sandi-admin-submit-bukan-skip-3-menit), [1.3](#13-pintu-grafana-401-tanpa-login-hanya-dari-laptop-ini-tanpa-berbagi-ke-luar-5-menit)). Telanjur **Skip** atau lupa sandi: [🚨](#-kalau-tidak-jalan).
> 2. **Grafana membaca database dengan `grafana_baca`, tidak pernah dengan `postgres`** ([Konsep 3](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca), [KC Langkah 4](#langkah-4--akun-database-hanya-baca-grafana_baca-6-menit), [1.4](#14--uji-grafana_baca-di-psql-boleh-membaca-ditolak-menulis-10-menit)).
> 3. **Token bot hanya di `backend/.env` dan di *contact point* Grafana**, tidak pernah di JSON, Git, atau tangkapan layar. Medan **BOT API Token** menampilkan token **polos** saat diketik, jadi jangan menangkap layar atau merekam formulir itu ([4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit), [10.2](#102-video-demo-hp-6090-detik-naskah-dan-yang-tidak-boleh-terekam-15-menit)).
> 4. **Koordinat rumah adalah data pribadi.** Contoh modul memakai titik fiktif di sekitar Monas, Jakarta; bulatkan atau samarkan koordinat sungguhan sebelum tangkapan layar diunggah ([Konsep 8](#8-peta-koordinat-ubin-dan-atribusi), [6.4](#64--versi-120-docs-dan-bruno-atur-lokasi-perangkat-200-403-400-10-menit)).
> 5. **Ubin OpenStreetMap: atribusi wajib terlihat, tanpa unduh massal.** Aturan pakai server ubin OSM melarang unduhan massal dan pemakaian luring ([Konsep 8](#8-peta-koordinat-ubin-dan-atribusi), [7.2](#72-petats-dan-petaperangkattsx-ubin-atribusi-dan-penanda-berwarna-status-22-menit)).
> 6. **Paket npm dan image Docker dengan versi tertulis**: `grafana/grafana:13.2.4`, `leaflet@1.9.4 react-leaflet@5.0.0`, dan `-D @types/leaflet@1.9.22`. Per 26 Oktober 2026, perintah dokumentasi react-leaflet (`react-leaflet@next`) memasang versi uji (RC) lama, dan image tanpa tag memasang rilis terbaru yang menunya bisa berbeda ([🧰](#-yang-perlu-disiapkan), [KC Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit), [7.1](#71-tiga-paket-peta-dengan-versi-tertulis-lalu-lat-dan-lng-di-typests-8-menit), [🚨](#-kalau-tidak-jalan)).

Seperti Modul 16–24, modul ini diawali [🔁 Pemanasan ulang SQL & JavaScript](#-pemanasan-ulang-sql--javascript-40-menit), kali ini bekal *alert*, laporan, dan berkas CSV. Hari pertama cukup pemanasan, [🏆 Kemenangan Cepat](#-kemenangan-cepat-panel-pertama-suhu-rumahmu-di-grafana-25-menit) (panel suhu pertama di Grafana), Konsep 1–3, dan [Praktik 1](#praktik-1--grafana-yang-rapi-dan-aman-30-menit). Sebelas konsep dibaca berselang-seling dengan praktiknya; urutannya ada di awal [🧠](#-konsep-mengapa). Bagian lipat di [🚨](#-kalau-tidak-jalan) dibuka saat perlu; bagian lipat di [🔬](#-bedah-teknis-opsional) boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang SQL & JavaScript (40 menit)](#-pemanasan-ulang-sql--javascript-40-menit)
4. [🏆 Kemenangan Cepat: panel pertama, suhu rumahmu di Grafana (25 menit)](#-kemenangan-cepat-panel-pertama-suhu-rumahmu-di-grafana-25-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Dua dashboard, dua penonton](#1-dua-dashboard-dua-penonton-tiga-alat-yang-sudah-kamu-pegang) · [2 Grafana di samping database](#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong) · [3 Hak sekecil mungkin](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca) · [4 Anatomi panel](#4-anatomi-panel-sql-makro-waktu-satuan-dan-ambang) · [5 Variabel](#5-variabel-satu-dashboard-untuk-semua-perangkat) · [6 Kesehatan perangkat](#6-membaca-kesehatan-perangkat-rssi-uptime-heap-dan-paket-per-jam) · [7 *Alert* bila perlu](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline) · [8 Peta](#8-peta-koordinat-ubin-dan-atribusi) · [9 Lokasi lewat API](#9-lokasi-adalah-data-perangkat-api-bukan-tempelan-di-layar) · [10 Laporan harian](#10-laporan-harian-datang-sendiri-setiap-pagi-selama-backend-menyala) · [11 Beli atau bangun](#11-beli-atau-bangun-platform-iot-siap-pakai)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Grafana rapi dan aman](#praktik-1--grafana-yang-rapi-dan-aman-30-menit) · [2 Kesehatan Sistem](#praktik-2--dashboard-kesehatan-sistem-rssi-uptime-heap-dan-variabel-node-50-menit) · [3 Kebun di dashboard](#praktik-3--kebun-di-dashboard-teknis-paket-per-jam-dan-menit-terlambat-35-menit) · [4 *Alert* Node diam](#praktik-4--alert-node-diam-dan-contact-point-telegram-55-menit) · [5 Cabut baterai Kebun](#praktik-5--cabut-baterai-kebun-alert-dan-pulih-45-menit) · [6 Backend 1.2: lokasi](#praktik-6--backend-12-lokasi-perangkat-lewat-api-45-menit) · [7 Halaman Peta](#praktik-7--halaman-peta-dengan-react-leaflet-60-menit) · [8 Laporan CSV](#praktik-8--backend-12-laporan-harian-csv-ke-telegram-60-menit) · [9 Laporan otomatis dan ekspor](#praktik-9--laporan-yang-datang-sendiri-lalu-grafana-sebagai-berkas-35-menit) · [10 Checkpoint Fase 4](#praktik-10--checkpoint-fase-4-kumpulkan-buktinya-45-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-25)

## 🎯 Setelah modul ini kamu bisa…

1. **Memasang Grafana 13.2.4 di samping database** dengan satu `docker run` dan lorong (*network*) `rumahpintar`, lalu menjaga pintunya: hanya `127.0.0.1:3000`, sandi admin diganti lewat **Submit**, tanpa berbagi ke luar.
2. **Memberi Grafana akun database hanya-baca `grafana_baca`** (izin per tabel dan kolom, transaksi hanya-baca, batas 10 detik), lalu membuktikan di psql bahwa akun itu ditolak menulis.
3. **Membuat panel dari SQL**: makro waktu `$__timeFilter` dan `$__timeGroupAlias`, Format `Time series`, satuan, dan ambang, sambil paham mengapa kuerinya ber-UTC tetapi layarnya ber-WIB.
4. **Merakit dashboard "Kesehatan Sistem" untuk semua perangkat** dengan variabel `$node`: RSSI, *uptime*, dan *heap* Node 1, paket per jam Node 2, serta menit terlambat dari jadwal.
5. **Membaca kesehatan perangkat dari grafiknya**: sinyal WiFi yang melemah, *uptime* yang jatuh (perangkat *restart*), dan *heap* yang turun terus (memori bocor).
6. **Membuat *alert* "Node diam"** yang menghitung data yang berhenti datang, bukan status `offline`, lalu mengirimnya ke Telegram lewat *contact point* dengan templat pesanmu sendiri.
7. **Membedakan kabar backend 📴 dari *alert* Grafana 🔴** ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)): yang pertama "sambungan putus" untuk penghuni, yang kedua "data berhenti datang" untuk tim teknis. Saat baterai Node 2 (atau Kebun tiruan) dicabut, kamu mengukur sendiri: 🔴 tiba 5,5–11,5 menit sesudah cabut, 📴 ±17 menit sesudah paket terakhir.
8. **Menaikkan backend ke 1.2.0**: `lat`/`lng` ikut `GET /devices`, dan rute admin `PUT /devices/:id/lokasi` menolak koordinat yang salah dengan `400` serta akun viewer dengan `403`.
9. **Menggambar halaman Peta** di dashboard 1.1.0 dengan react-leaflet: ubin OpenStreetMap beserta atribusinya, penanda hijau atau abu-abu menurut status *live*, untuk admin dan viewer, juga di layar selebar HP.
10. **Mengirim laporan harian CSV ke Telegram** pukul 07.00 WIB dari backend, dan jujur soal batasnya: hanya selama laptop dan backend menyala, dan laporan yang terlewat tidak dikirim belakangan.
11. **Menyimpan Grafana sebagai berkas di Git** (JSON dashboard, YAML aturan sebagai arsip), memilih dashboard yang tepat di antara Node-RED, React, dan Grafana, menimbang platform IoT siap pakai, lalu menutup 🎉 Checkpoint Fase 4.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 24** | Dashboard v1.0 (`1.0.0`) dan backend 1.1.0 di `main`, koleksi Bruno dengan `backend/bruno/.env`, `alat/.env`, serta akun `admin@rumah.test` dan `viewer@rumah.test`. Backend naik ke 1.2.0 di Praktik 6 dan 8, dashboard ke 1.1.0 di Praktik 7. |
| **Docker dan `rumahpintar-db`** | Docker Desktop (Windows, macOS; tidak direkam penulis) atau Docker Engine (Linux) menyala, `rumahpintar-db` hidup, dan bacaan baru terus masuk. Sisakan ±2 GB ruang disk untuk image Grafana. |
| **Bot Telegram Modul 19** | `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` terisi di `backend/.env`, bot sudah kamu [sapa dengan `/start`](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#66-berkenalan-dengan-bot-mu-start-dan-chat_id), dan aplikasi Telegram terpasang. Bot yang sama dipakai backend dan Grafana ([4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit)). |
| **Jalur data** (pilih satu) | **Jalur perangkat:** Node 1 dan Node 2 (Kit A + B) lewat broker di Pi; Node 2 terdaftar (`daftarkan Node 2 lewat Node 1`, Modul 21) dan berbaterai 18650 di dudukannya. **Jalur laptop:** Mosquitto di laptop dan simulator `f00d00000001`; versi barunya, yang membawa **Kebun tiruan**, dipasang di [5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit). |
| **Node.js 24, VS Code, Git, Bruno** | Sama dengan Modul 24; repositori `belajar-iot` (folder `modul-25`) untuk 🔁 dan ➕ G. |
| **Chrome atau Edge** | Grafana di `http://localhost:3000`, dashboard di `http://localhost:5173`, dan mode perangkat DevTools. Penulis hanya menguji Chrome. |
| **Spreadsheet** | Excel atau LibreOffice Calc berlokal Indonesia untuk membuka CSV (8.5); penulis tidak menguji keduanya. |
| **HP** (opsional) | Untuk video demo Checkpoint ([10.2](#102-video-demo-hp-6090-detik-naskah-dan-yang-tidak-boleh-terekam-15-menit)) dan kotak *Grafana dari HP*; penulis tidak merekam dari HP. |
| **Internet dan akun GitHub** | Untuk `docker pull`, `npm install`, ubin peta, dan Telegram; GitHub untuk *pull request* di ➕ F. |

**Unduh image Grafana sekarang**, sebelum hari pertama. Unduhannya ±445 MB untuk prosesor arm64, misalnya Mac Apple silicon (untuk laptop Intel/AMD tidak diukur penulis), dan waktunya tidak dihitung dalam [KC Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit). Dengan Docker menyala, ketik di terminal mana saja (misalnya terminal VS Code):

```text
docker pull grafana/grafana:13.2.4
```

Tunggu sampai *prompt* kembali, lalu periksa:

```text
docker image ls --digests grafana/grafana
```

**Hasilnya** (contoh, image arm64 di lab penulis):

```text
REPOSITORY        TAG       DIGEST                                                                    IMAGE ID       CREATED       SIZE
grafana/grafana   13.2.4    sha256:dbbc38ea21103cefb50396340cd88afec779c7e070b0a7bf5a75b4ce46651d3f   dbbc38ea2110   2 weeks ago   1.81GB
```

Yang penting, `TAG`-nya `13.2.4`; kolom lainnya di laptopmu bisa berbeda. Seperti image TimescaleDB di Modul 17, ukurannya di disk jauh lebih besar daripada unduhannya.

Versi yang dipakai modul ini (Oktober 2026):

| Komponen | Versi | Catatan |
| :--- | :--- | :--- |
| Grafana OSS | **13.2.4** (`grafana/grafana`) | lisensi AGPLv3; image `grafana/grafana-oss` di tutorial lama mandek di 13.0.2 (Juni 2026) |
| TimescaleDB | `2.30.2-pg17` | tetap dari Modul 17; migrasi tidak berubah |
| leaflet, react-leaflet | **1.9.4**, **5.0.0** | baru di dashboard 1.1.0; lisensinya dibahas di Konsep 8 |
| @types/leaflet | **1.9.22** | tipe TypeScript untuk leaflet (`-D`) |
| node-cron, grammY | 4.6.0, 1.46.0 | sudah ada; backend 1.2.0 **tanpa paket baru** |
| Node.js | 24 | penulis: 24.21.0 dengan npm 11.19.0 |

Paket Modul 22–24 tidak dinaikkan (react 19.3.1, vite 8.3.5, react-router 8.5.0, zod 4.6.7, dan lainnya). Paket peta dipasang dengan versi tertulis di folder `frontend` pada [7.1](#71-tiga-paket-peta-dengan-versi-tertulis-lalu-lat-dan-lng-di-typests-8-menit), bukan sekarang:

```text
npm install leaflet@1.9.4 react-leaflet@5.0.0
npm install -D @types/leaflet@1.9.22
```

**Waktunya** ±11,5 jam, belum termasuk unduhan dan menunggu: pemanasan 40 menit, Kemenangan Cepat 25, konsep ±110, praktik 460, ➕ 30, dan kuis 20.

## 🔁 Pemanasan ulang SQL & JavaScript (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Docker Desktop** atau **Docker Engine** dengan `rumahpintar-db` menyala (psql di dalamnya), dan **Node.js 24**.

Lima bekal kecil untuk *alert*, laporan harian, dan CSV: tiga di SQL, dua di JavaScript, dilatih tanpa Grafana dan backend. **Nanti di …** menunjuk tempat pemakaiannya.

**Siapkan foldernya.** Buat folder **`modul-25`** di repositori **`belajar-iot`**, lalu di terminal VS Code:

```text
cd modul-25
npm init -y
npm pkg set type=module
```

Buat **`pemanasan.sql`** dan **`pemanasan.js`** di sana; isinya di lipatan **Isi lengkap** sesudah Langkah 3 dan 5 (atau **Copy raw file** dari [`kode/pemanasan/`](kode/pemanasan/)). Untuk Langkah 1–3, masuk ke psql seperti Modul 17:

```text
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
```

Akun super `postgres` khusus untukmu; Grafana tidak pernah memegangnya ([Konsep 3](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca)). Per langkah, salin kueri di bawah `-- Langkah N.` ke psql, tekan **Enter**, lalu cocokkan dengan **Hasilnya**.

### Langkah 1 — Bacaan terakhir setiap perangkat: `GROUP BY`, `count(*)`, dan `max(diterima)`

*Alert* bertanya, "Kapan perangkat ini terakhir terdengar?" **`GROUP BY device_id`** mengumpulkan baris `readings` per perangkat; **`count(*)`** menghitung barisnya, dan **`max(diterima)`** memilih yang terbaru. `diterima` = jam **server** saat bacaan tiba (`ts` = jam perangkat). **Hasilnya (contoh):**

```text
  device_id   | jumlah_bacaan |       terakhir_diterima
--------------+---------------+-------------------------------
 f00d00000001 |          1046 | 2026-10-26 20:33:44.067802+00
 f00d00000002 |          1029 | 2026-10-26 20:20:35.663888+00
 f00d000000b2 |             1 | 2026-10-26 20:31:48.381385+00
(3 rows)
```

`+00` = UTC, tujuh jam di belakang WIB (Modul 17): `20:33` tanggal 26 = 03.33 WIB tanggal 27. Kebun tiruan `f00d000000b2` baru ada sesudah 5.1; di jalur perangkat, ada juga baris Node 1 dan Node 2-mu.

### Langkah 2 — Berapa menit yang lalu: selang waktu, `EXTRACT`, dan `round`

Ambang *alert* berupa menit. `now() - max(diterima)` = **selang waktu** (*interval*). **`EXTRACT(EPOCH FROM …)`** mengubahnya menjadi detik, dibagi 60 menjadi menit, dan **`round(…, 1)`** menyisakan satu angka desimal. **Hasilnya (contoh):**

```text
  device_id   | menit_lalu
--------------+------------
 f00d00000001 |        0.2
 f00d00000002 |       13.3
 f00d000000b2 |        2.1
(3 rows)
```

Di lab penulis, `f00d00000001` sedang berjalan: angkanya dekat 0. `f00d00000002` tidak dijalankan: isinya hanya riwayat `npm run isi-riwayat`, yang `diterima`-nya jam skrip itu dijalankan (03.20 WIB), jadi angkanya terus naik.

**Nanti di Grafana:** Langkah 1 dan 2 menjadi kueri *alert* "Node diam": `diterima` bacaan terbaru setiap perangkat, rumus menit yang sama dikurangi 5 untuk Node 2, ambang `> 5`. Kueri itu juga mengisi tabel [3.2](#32--tabel-menit-terlambat-kueri-yang-sama-dengan-alert-ditambah-kolom-terakhir_dilihat-sementara-15-menit) ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)).

### Langkah 3 — "Kemarin" menurut jam WIB: `date_trunc` dan `AT TIME ZONE`

Laporan pukul 07.00 WIB berisi **kemarin** (00.00–24.00 WIB), padahal database menyimpan UTC. Baca dari dalam ke luar: `now() AT TIME ZONE 'Asia/Jakarta'` = jam dinding Jakarta sekarang; **`date_trunc('day', …)`** = dipotong ke 00.00 hari ini; `- INTERVAL '1 day'` = 00.00 kemarin; **`AT TIME ZONE`** sekali lagi = jam dinding itu dijadikan titik waktu sungguhan. **Hasilnya (contoh):**

```text
          dari          |         sampai
------------------------+------------------------
 2026-10-25 17:00:00+00 | 2026-10-26 17:00:00+00
(1 row)
```

17.00 UTC = 00.00 WIB keesokan harinya: rentangnya 26 Oktober 00.00–24.00 WIB, walau saat itu (03.33 WIB tanggal 27) tanggal UTC masih 26. Kueri kedua menjumlahkan bacaan kemarin dari `readings_per_jam` (Modul 18). **Hasilnya (contoh):**

```text
  device_id   | bacaan_kemarin
--------------+----------------
 f00d00000001 |            144
 f00d00000002 |            144
(2 rows)
```

Keluar dari psql dengan `\q`.

**Nanti di backend:** `rentangLaporan()` di `services/laporan.ts` menghitung rentang yang sama dengan JavaScript (lab penulis, saat yang sama: `2026-10-25T17:00:00.000Z 2026-10-26T17:00:00.000Z`), lalu laporannya membaca `readings_per_jam` dengan `>=` dan `<` yang sama ([8.2](#82-serviceslaporants-rentang-kemarin-wib-satu-kueri-dan-jadwal-18-menit), [Konsep 10](#10-laporan-harian-datang-sendiri-setiap-pagi-selama-backend-menyala)).

<details>
<summary>Isi lengkap <code>pemanasan.sql</code></summary>

```sql
-- pemanasan.sql - pemanasan ulang SQL sebelum Modul 25 (langkah 1-3). Tiga kemampuan kecil yang nanti dipakai Grafana dan
-- laporan harian: bacaan terakhir setiap perangkat, "berapa menit yang lalu?", dan rentang "kemarin" menurut jam WIB.
-- Jalankan di psql seperti Modul 17:  docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
-- lalu tempel satu langkah demi satu langkah (setiap kueri diakhiri titik koma).

-- Langkah 1. Bacaan terakhir setiap perangkat. GROUP BY mengumpulkan baris per device_id; count(*) menghitung barisnya,
-- max(diterima) memilih waktu terbaru. diterima = jam SERVER saat bacaan tiba (Modul 17), ts = jam di perangkat.
SELECT device_id, count(*) AS jumlah_bacaan, max(diterima) AS terakhir_diterima
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Langkah 2. Berapa menit yang lalu? now() - waktu = sebuah selang (interval). EXTRACT(EPOCH FROM selang) = selang itu dalam
-- detik; dibagi 60 = menit. round(angka, 1) = satu angka di belakang koma; round jenis ini butuh tipe numeric, jadi hasil
-- bagi diubah dulu dengan ::numeric. Inilah bekal alert "node diam" di Grafana.
SELECT device_id,
       round((EXTRACT(EPOCH FROM now() - max(diterima)) / 60)::numeric, 1) AS menit_lalu
FROM readings
GROUP BY device_id
ORDER BY device_id;

-- Langkah 3. Rentang "kemarin" menurut jam WIB, bekal laporan harian.
--   now() AT TIME ZONE 'Asia/Jakarta'   = jam dinding di Jakarta sekarang (tanpa zona waktu)
--   date_trunc('day', …)                = dipotong ke pukul 00.00 hari ini (WIB)
--   - INTERVAL '1 day'                  = pukul 00.00 kemarin (WIB)
--   … AT TIME ZONE 'Asia/Jakarta'       = jam dinding WIB itu diubah lagi menjadi waktu sungguhan (timestamptz)
-- psql mencetak waktu sungguhan dalam zona sesinya. Di kontainer database zonanya UTC, jadi 00.00 WIB tercetak 17:00:00+00
-- hari sebelumnya: waktunya sama, hanya cara menulisnya yang berbeda.
SELECT (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta' AS dari,
       date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta' AS sampai;

-- Jumlah bacaan kemarin setiap perangkat, dari buku ringkasan per jam readings_per_jam (Modul 18). "sampai" tidak ikut
-- (tanda <), supaya pukul 00.00 hari ini tidak terhitung dua kali (kemarin dan hari ini).
SELECT device_id, sum(jumlah_bacaan) AS bacaan_kemarin
FROM readings_per_jam
WHERE jam >= (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '1 day') AT TIME ZONE 'Asia/Jakarta'
  AND jam <  date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
GROUP BY device_id
ORDER BY device_id;
```

</details>

### Langkah 4 — Satu baris CSV gaya Indonesia: titik koma, koma desimal, dan sel kosong

Resep CSV [Modul 23](../modul-23-dashboard-realtime/README.md#langkah-5--teks-csv-untuk-excel-indonesia-titik-koma-dan-koma-desimal) sebagai fungsi murni di bagian `// 4.`: **`kutip()`** membungkus teks yang memuat `;` atau `"`, **`sel()`** mengubah satu nilai (angka → koma desimal, `null` → sel kosong), dan **`barisCsv()`** menyambung sel dengan `;`. Di terminal (folder `modul-25`), jalankan `node pemanasan.js`. **Hasilnya** (bagian pertama):

```text
--- 4. Satu baris CSV gaya Indonesia
device_id;nama;suhu_rata;rssi_rata
f00d00000001;"Node 1; ruang tamu";28,5;-67
f00d000000b2;Kebun;27;
```

Kebun tidak mengirim `vitals`, jadi sel RSSI-nya kosong, bukan `0`.

**Nanti di backend:** `kutip()` dan `sel()` pindah ke `services/csv.ts`, ditemani `keCsv()` untuk banyak baris ([8.1](#81-servicescsvts-resep-csv-modul-23-pindah-ke-server-12-menit)).

### Langkah 5 — Teks menjadi berkas: `Buffer.from`, BOM tiga byte, dan `ENOENT`

Telegram menerima **berkas**, yaitu deretan byte. Di bagian `// 5.`, **`Buffer.from(isi, "utf8")`** mengubah teks menjadi byte. `"\uFEFF"` di awal = **BOM**, tanda tak terlihat bahwa isinya UTF-8: satu huruf, tiga byte. **Hasilnya** (bagian kedua):

```text
--- 5. Teks menjadi berkas
huruf: 41 | byte: 43 | 3 byte pertama: <Buffer ef bb bf>
"°" = 1 huruf, 2 byte
teks dianggap nama berkas -> ENOENT
```

Selisih 2 = BOM: 1 huruf, 3 byte (`ef bb bf`). Baris terakhir = jebakannya: `readFileSync(isi)` menganggap teks CSV sebagai **nama berkas**, dan Node menjawab `ENOENT` (berkas tidak ada).

**Nanti di backend:** `kirimBerkas()` di `telegram.ts` memberi grammY byte beserta namanya, `new InputFile(Buffer.from(isi, "utf8"), nama)`; `new InputFile("teks…")` gagal karena alasan yang sama ([8.3](#83-kirimberkas-di-telegramts-inputfile-dari-byte-bukan-dari-teks-8-menit), [🚨](#-kalau-tidak-jalan) *`ENOENT` …*).

<details>
<summary>Isi lengkap <code>pemanasan.js</code></summary>

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 25 (langkah 4-5). Dua kemampuan kecil yang nanti dipakai laporan
// harian di backend: satu baris CSV gaya Indonesia, dan teks yang menjadi berkas (byte). Jalankan dengan: node pemanasan.js
import { readFileSync } from "node:fs";

// 4. Satu baris CSV gaya Indonesia (resep csv.ts Modul 23): pemisah titik koma, koma desimal, sel kosong untuk null,
//    dan teks yang memuat ; atau " dibungkus tanda petik. Fungsi "murni": masukan -> teks, tanpa database, tanpa jaringan.
console.log("--- 4. Satu baris CSV gaya Indonesia");
function kutip(teks) {
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}
function sel(nilai) {
  if (nilai === null) return ""; // tidak ada datanya (misalnya Node 2 tanpa vitals): sel kosong, BUKAN 0
  if (typeof nilai === "number") return String(nilai).replace(".", ","); // 28.5 -> "28,5"
  return kutip(nilai);
}
function barisCsv(nilai) {
  return nilai.map(sel).join(";");
}
console.log(barisCsv(["device_id", "nama", "suhu_rata", "rssi_rata"]));
console.log(barisCsv(["f00d00000001", "Node 1; ruang tamu", 28.5, -67]));
console.log(barisCsv(["f00d000000b2", "Kebun", 27, null])); // 27 tetap "27"; null -> sel kosong di ujung baris

// 5. Teks menjadi berkas. Telegram menerima BERKAS (deretan byte), bukan teks. Buffer.from(teks, "utf8") = teks -> byte.
//    "\uFEFF" = BOM: SATU huruf yang tak terlihat, tetapi TIGA byte (EF BB BF). Huruf seperti ° juga lebih dari satu byte.
console.log("--- 5. Teks menjadi berkas");
const isi = "\uFEFF" + barisCsv(["device_id", "suhu_rata"]) + "\r\n" + barisCsv(["f00d00000001", 28.5]) + "\r\n";
const berkas = Buffer.from(isi, "utf8");
console.log("huruf:", isi.length, "| byte:", berkas.length, "| 3 byte pertama:", berkas.subarray(0, 3));
console.log('"°" =', "°".length, "huruf,", Buffer.from("°", "utf8").length, "byte");
// Jebakan: banyak fungsi menganggap TEKS sebagai NAMA BERKAS di disk. readFileSync(isi) mencari berkas bernama
// "\uFEFFdevice_id;suhu_rata..." -> galat ENOENT (berkas tidak ada). new InputFile("teks…") di grammY (bot Telegram)
// berperilaku sama; obatnya: berikan byte-nya, new InputFile(Buffer.from(isi, "utf8"), "laporan.csv").
try {
  readFileSync(isi);
} catch (err) {
  console.log("teks dianggap nama berkas ->", err.code);
}
```

</details>

<details>
<summary>Kunci uji dirimu</summary>

1. **Langkah 3 tanpa kedua `AT TIME ZONE`: rentang apa yang keluar pukul 03.33 WIB tanggal 27?** Hari UTC: 25 Okt 07.00 sampai 26 Okt 07.00 WIB. Harinya salah, batasnya pun pukul 07.00.
2. **Langkah 4: ganti `null` di baris Kebun dengan `0`.** `f00d000000b2;Kebun;27;0`: RSSI 0 dBm tampak sungguhan, padahal datanya tidak ada.
3. **Langkah 5: hapus `"\uFEFF" + ` dari baris `const isi`.** `huruf: 40 | byte: 40 | 3 byte pertama: <Buffer 64 65 76>`: tanpa BOM, satu huruf = satu byte (`d`, `e`, `v`).

Kembalikan setiap baris yang kamu ubah.

</details>

## 🏆 Kemenangan Cepat: panel pertama, suhu rumahmu di Grafana (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `rumah-pintar-mini` dengan terminal jalur data dan satu terminal kosong; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` menyala; serta **Chrome** atau **Edge**.

Dua puluh lima menit lagi, Grafana menyala di samping database, membaca TimescaleDB dengan akun yang hanya boleh membaca, lalu menggambar suhu setiap perangkatmu. Image-nya sudah kamu unduh di [🧰](#-yang-perlu-disiapkan) (kalau belum, Langkah 2 mengunduhnya). Supaya garisnya terus bertambah, nyalakan jalur datamu seperti [Kemenangan Cepat Modul 24](../modul-24-kendali-aturan-peran/README.md#langkah-1--nyalakan-semuanya-lalu-masuk-sebagai-admin-4-menit) (Node 1 atau broker dan simulator, lalu backend). Alasan setiap langkah ada di Konsep 2–4.

### Langkah 1 — Lorong `rumahpintar` antarkontainer, cukup sekali (2 menit)

Di dalam kontainer, `localhost` berarti kontainer itu sendiri. Karena itu, Grafana dan database dipertemukan di sebuah **lorong** (*network*) Docker, tempat keduanya saling memanggil dengan nama ([Konsep 2](#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong)). Di terminal VS Code, buat lorongnya:

```text
docker network create rumahpintar
```

**Hasilnya (contoh):** ID lorong barumu, yang pasti berbeda:

```text
41f9f7ef6cb812a6286db24d7ab0ca3073e9ab1e8c0d1eb4b054055951a8e297
```

Lalu sambungkan database yang sedang berjalan, tanpa mematikannya:

```text
docker network connect rumahpintar rumahpintar-db
```

Perintah ini sukses dengan diam, tanpa keluaran. Sambungannya tersimpan di kontainer database, jadi cukup sekali.

### Langkah 2 — Nyalakan Grafana dengan satu `docker run` (3 menit)

Salin perintah ini ke terminal **dalam satu baris**, lalu tekan **Enter**. Perintahnya tanpa sandi, jadi tak perlu disunting seperti di Modul 17:

```text
docker run -d --name rumahpintar-grafana --network rumahpintar -p 127.0.0.1:3000:3000 -e GF_PLUGINS_PREINSTALL_DISABLED=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_SNAPSHOTS_EXTERNAL_ENABLED=false -e GF_PUBLIC_DASHBOARDS_ENABLED=false -v rumahpintar-grafana-data:/var/lib/grafana --restart unless-stopped grafana/grafana:13.2.4
```

Singkatnya: kontainer `rumahpintar-grafana` masuk lorong `rumahpintar`, loket 3000 hanya untuk laptop ini, tanpa unduhan plugin dan kiriman statistik, isinya di lemari `rumahpintar-grafana-data`.

**Hasilnya (contoh):** ID kontainer barumu.

```text
c462533d5744b594ac495f074424da7d1a6674d94ee9a19b0f22d9776de47c04
```

Tunggu ±10 detik, lalu tanyakan kesehatannya (macOS dan Linux: `curl`, tanpa `.exe`):

```text
curl.exe http://localhost:3000/api/health
```

**Hasilnya (lab penulis: `curl` di Linux):**

```text
{
  "database": "ok",
  "version": "13.2.4",
  "commit": "0e79aef9d91abf3bdadae9af15763029072fb45b"
}
```

Belum menjawab? Tunggu sebentar, lalu ulangi. Terakhir, buktikan bahwa tidak ada plugin yang diunduh:

```text
docker exec rumahpintar-grafana du -sh /var/lib/grafana/plugins
```

**Hasilnya:** `4.0K  /var/lib/grafana/plugins`, folder kosong (tanpa `GF_PLUGINS_PREINSTALL_DISABLED`: ±290 MB). `docker run` menjawab galat? Lihat [🚨](#-kalau-tidak-jalan) *`docker run` Grafana gagal …* dan *Port 3000 sudah terpakai …*.

### Langkah 3 — Masuk pertama kali dan ganti sandi admin: Submit, bukan Skip (3 menit)

1. Di Chrome atau Edge, buka **`http://localhost:3000`**. Tampil `Welcome to Grafana` dengan medan **Email or username** dan **Password**.
2. Isi keduanya `admin`, lalu klik **Log in**.
3. Layar **Update your password** (perbarui sandimu) menulis `Continuing to use the default password exposes you to security risks.` Isi sandi baru di **New password** dan **Confirm new password**, lalu klik **Submit**.

Jangan **Skip**: sandi `admin` tetap berlaku kalau dilewati. Simpan sandi barumu di pengelola sandi, bukan di repositori.

**Hasilnya:** beranda dengan `Welcome to Grafana.`, `Create your first dashboard`, dan `Latest from the blog` (umpan berita dari grafana.com, Konsep 2). Telanjur **Skip** atau lupa sandi: [🚨](#-kalau-tidak-jalan) *Lupa sandi admin Grafana …*.

### Langkah 4 — Akun database hanya-baca `grafana_baca` (6 menit)

Grafana tidak boleh memegang `postgres`, akun super Modul 17 ([Konsep 3](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca)). Akun barunya ditulis sebagai berkas SQL di proyekmu, tanpa sandi, jadi aman ikut Git. Di panel Explorer VS Code, klik kanan ruang kosong di bawah daftar berkas → **New Folder…**, beri nama **`grafana`**. Klik kanan folder itu → **New File…**, beri nama **`pengguna-grafana.sql`**, ketik isinya (atau **Copy raw file** dari [`kode/grafana/pengguna-grafana.sql`](kode/grafana/pengguna-grafana.sql)), lalu simpan (**Ctrl + S**):

```sql
-- pengguna-grafana.sql - akun database KHUSUS Grafana yang hanya bisa MEMBACA (Modul 25).
-- Jalankan SEKALI di psql sebagai postgres (caranya di grafana/README.md). Berkas ini sengaja TANPA sandi: sandinya diketik
-- sesudahnya dengan \password grafana_baca, supaya tidak pernah tersimpan di Git maupun di riwayat terminal.
-- Dua lapis pengaman: (1) setiap transaksi akun ini hanya-baca, (2) izinnya hanya SELECT pada tabel dan kolom di bawah.

CREATE ROLE grafana_baca LOGIN CONNECTION LIMIT 5;              -- boleh masuk, paling banyak 5 sambungan sekaligus
ALTER ROLE grafana_baca SET default_transaction_read_only = on;  -- setiap transaksinya hanya-baca
ALTER ROLE grafana_baca SET statement_timeout = '10s';           -- kueri panel yang kebablasan dihentikan sesudah 10 detik
GRANT CONNECT ON DATABASE rumahpintar TO grafana_baca;
GRANT USAGE ON SCHEMA public TO grafana_baca;
GRANT SELECT ON readings, readings_per_jam, device_health, events, commands TO grafana_baca;
-- devices: hanya kolom-kolom ini, TANPA kunci_hash dan kunci_dibuat (sidik jari kunci perangkat tidak perlu dilihat Grafana).
-- Akibatnya SELECT * FROM devices ditolak (permission denied): di Grafana, selalu tulis nama kolomnya.
GRANT SELECT (device_id, jenis, nama, lokasi, lat, lng, status, terakhir_dilihat, dibuat, terdaftar, dicabut, penghubung)
  ON devices TO grafana_baca;
-- users, sesi, rules, schema_migrations: TIDAK diberikan (sidik jari sandi dan token sesi tidak boleh terbaca Grafana)
```

psql di dalam kontainer tidak melihat folder laptopmu, jadi berkasnya disalin masuk dulu. Di terminal, dari folder `rumah-pintar-mini`:

```text
docker cp grafana/pengguna-grafana.sql rumahpintar-db:/tmp/pengguna-grafana.sql
```

**Hasilnya:** `Successfully copied 3.07kB to rumahpintar-db:/tmp/pengguna-grafana.sql`. Lalu jalankan berkasnya sebagai `postgres`:

```text
docker exec rumahpintar-db psql -U postgres -d rumahpintar -f /tmp/pengguna-grafana.sql
```

**Hasilnya:**

```text
CREATE ROLE
ALTER ROLE
ALTER ROLE
GRANT
GRANT
GRANT
GRANT
```

Kalau diulang, baris pertamanya menjadi `psql:/tmp/pengguna-grafana.sql:6: ERROR:  role "grafana_baca" already exists`. Itu wajar; baris lainnya tetap berlaku. Terakhir, beri sandi khusus akun ini (bukan sandi `postgres`):

```text
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar -c "\password grafana_baca"
```

**Hasilnya:**

```text
Enter new password for user "grafana_baca":
Enter it again:
```

Ketik sandinya dua kali (hurufnya tidak tampil dan tidak masuk riwayat terminal), lalu catat di pengelola sandimu untuk Langkah 5.

### Langkah 5 — *Data source* PostgreSQL lewat lorong: `rumahpintar-db:5432` (5 menit)

*Data source* adalah sambungan Grafana ke database. Kembali ke Grafana:

1. Menu kiri **Connections** (koneksi) → **Data sources** (sumber data) → **Add data source**, ketik `PostgreSQL` di kotak pencarian, lalu klik kartu **PostgreSQL**. Grafana langsung membuat *data source* bernama `grafana-postgresql-datasource` dan membuka formulirnya.
2. Isi **Host URL** `rumahpintar-db:5432` (nama kontainer di lorong, selalu 5432 walau loketmu 5433; bukan `localhost:5432` contoh medannya), **Database name** `rumahpintar`, **Username** `grafana_baca`, **Password** dari Langkah 4.
3. **TLS/SSL Mode**: `require` menjadi `disable`; sambungan lewat lorong tidak keluar dari laptopmu.
4. **Additional settings**: nyalakan sakelar **TimescaleDB** (**Version** sudah terisi `17` sendiri).
5. **Connection limits** (batas sambungan): **Max open** `100` menjadi `4`, karena akun ini hanya boleh 5 sambungan (Konsep 3; 🚨 *`too many connections …`*).
6. Klik **Save & test**.

**Hasilnya:** kotak hijau `Database Connection OK`. Galat `lookup rumahpintar-db …` atau `connection refused`: [🚨](#-kalau-tidak-jalan) *Save & test gagal …*.

### Langkah 6 — Panel pertama: kueri suhu dengan Format `Time series`, lalu simpan (6 menit)

1. Menu kiri **Dashboards** → tombol **New** → **New dashboard**. Kanvasnya menulis `Add a panel to visualize your data`.
2. Di bilah kanan **Add**, klik kotak **Panel**, lalu **Configure visualization** (atur visualisasi). *Data source* tadi sudah terpilih.
3. Di bawah grafik, ganti **Builder** menjadi **Code**, lalu tempel kueri ini (komentar `--` boleh ikut; **Copy raw file** dari [`kode/kemenangan-cepat/kueri-suhu.sql`](kode/kemenangan-cepat/kueri-suhu.sql)):

   ```sql
   -- kueri-suhu.sql - kueri panel pertama di Grafana (Modul 25, Kemenangan Cepat): suhu setiap perangkat, dari tabel readings.
   -- Tempel di editor kueri panel (mode Code), format "Time series". Grafana mengganti dua makro sebelum kueri dikirim:
   --   $__timeGroupAlias(ts, $__interval) -> time_bucket('60.000s',ts) AS "time" (contoh untuk rentang Last 1 hour: lebar
   --                                         ember mengikuti rentang di kanan atas; terlihat di Query inspector. time_bucket =
   --                                         fungsi TimescaleDB, karena sakelar TimescaleDB dinyalakan)
   --   $__timeFilter(ts)                  -> ts BETWEEN '…Z' AND '…Z' (rentang waktu dashboard, ditulis dalam UTC)
   -- Kolom device_id AS metric = satu garis per perangkat. Akun grafana_baca cukup: readings boleh dibaca (SELECT).
   SELECT
     $__timeGroupAlias(ts, $__interval),
     device_id AS metric,
     avg(suhu) AS suhu
   FROM readings
   WHERE $__timeFilter(ts)
   GROUP BY 1, 2
   ORDER BY 1
   ```

4. Ganti **Format** dari `Table` menjadi **Time series**, lalu klik **Run query**. Dengan `Table`, yang tergambar SATU garis `suhu` yang melompat antarperangkat (Konsep 4).
5. Di bilah kanan, klik **All visualizations** → **Time series**, lalu isi **Title** `Suhu rumah`. Coba rentang (tombol jam di kanan atas) **Last 1 hour**, lalu **Last 24 hours**.
6. Klik **Save**, isi **Title** `Panel pertama` di laci `Save dashboard`, lalu **Save**. Keluar dengan **Back**, lalu **Exit edit**.

**Hasilnya (lab penulis):** satu garis untuk setiap `device_id`: `f00d00000001`, `f00d00000002`, dan `f00d000000b2` (Kebun tiruan dari Praktik 5 nanti; kiriman tiap 5 menit tampil sebagai titik-titik). Garismu mengikuti perangkat yang mengirim suhu dalam rentang itu; `No data` = belum ada kiriman.

![Komposit tangkapan layar asli Grafana 13.2.4 bertema gelap di Chrome 156, Linux di Raspberry Pi 5 yang berperan sebagai laptop, jendela 1280 piksel, untuk Kemenangan Cepat langkah 3, 5, dan 6. Kiri atas, Langkah 3: kartu Update your password dengan peringatan Continuing to use the default password exposes you to security risks, medan New password dan Confirm new password berisi titik-titik (nomor 1), tombol biru Submit (nomor 1) dan tautan Skip di bawahnya. Tengah atas, Langkah 5: data source bagian Connection, Host URL rumahpintar-db:5432 (nomor 2), Database name rumahpintar; Authentication, Username grafana_baca, Password tertulis configured dengan tombol Reset, TLS/SSL Mode disable (nomor 3). Kanan atas, bagian bawah halaman yang sama: sakelar TimescaleDB menyala (nomor 4), Max open 4 (nomor 4), Max lifetime 14400, kotak hijau Database Connection OK (nomor 5) dan tombol Delete, Remove default, Save & test (nomor 5). Bawah, Langkah 6: editor panel yang dibuka lagi sesudah disimpan, grafik garis Suhu rumah dengan tiga garis f00d00000001, f00d00000002, f00d000000b2, sumbu waktu 02:00 sampai 07:30, sumbu suhu 22 sampai 32 (nomor 6); di bawahnya Format Time series, Run query, Builder dan Code, kueri SELECT $__timeGroupAlias(ts, $__interval), device_id AS metric, avg(suhu) AS suhu FROM readings WHERE $__timeFilter(ts) GROUP BY 1, 2 (nomor 7); di atas, pemilih waktu Last 6 hours (nomor 8). Garis suhu: riwayat latihan isi-riwayat untuk f00d00000001 dan f00d00000002, lalu simulator f00d00000001 dan Kebun tiruan sejak 07.37 WIB; rumahpintar-db di lab adalah alias jaringan untuk kontainer database lab.](aset/grafana-pertama.png)

**Jalan pintas bila Langkah 6 macet.** **Dashboards** → **New** → **Import dashboard** (impor). Tempel isi [`kode/kemenangan-cepat/panel-pertama.json`](kode/kemenangan-cepat/panel-pertama.json) (**Copy raw file**) di kotak **Import via dashboard JSON model**, lalu klik **Load** yang KEDUA, di bawah kotak itu (yang pertama untuk alamat grafana.com). Di `Options`, pilih *data source* dari Langkah 5 pada kotak `DS_GRAFANA-POSTGRESQL-DATASOURCE` (kalau tidak, `A data source is required`), lalu klik **Import**. Tombolnya bertuliskan `Import (Overwrite)`? `Panel pertama` sudah ada; jangan menimpanya ([9.3](#93-coba-impor-ke-grafana-yang-sama-change-uid-dulu-opsional-8-menit); 🚨 *Impor dashboard …*).

Dalam 25 menit, Grafana menggambar suhu dari database-mu dengan akun yang tidak bisa menulis apa pun. Belum ada *commit*: folder `grafana/` ikut ke cabang baru di [1.1](#11-cabang-fiturgrafana-peta-laporan-dan-folder-grafana-di-proyekmu-5-menit).

> ➡️ **Berikutnya:** baca [Konsep 1](#1-dua-dashboard-dua-penonton-tiga-alat-yang-sudah-kamu-pegang) sampai [Konsep 3](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca), lalu kerjakan [Praktik 1](#praktik-1--grafana-yang-rapi-dan-aman-30-menit). Di sana kamu memeriksa pintu Grafana dan membuktikan bahwa akun `grafana_baca` memang tidak bisa menulis.

## 🧠 Konsep "Mengapa"

Sebelas konsep ini tidak perlu dibaca sekaligus. Urutan bacanya sama dengan nomornya, diselingi praktik:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–3 → Praktik 1 (Grafana yang rapi dan aman)
2. Konsep 4–6 → Praktik 2 (dashboard "Kesehatan Sistem") dan Praktik 3 (Kebun di dashboard teknis)
3. Konsep 7 → Praktik 4 (*alert* "Node diam" dan *contact point* Telegram) dan Praktik 5 (cabut baterai Kebun); Konsep 8 dibaca sambil menunggu kabar Grafana di 5.3
4. Konsep 9 → Praktik 6 (backend 1.2: lokasi perangkat lewat API), lalu Praktik 7 (halaman Peta, memakai Konsep 8)
5. Konsep 10 → Praktik 8 (laporan harian CSV ke Telegram) dan Praktik 9 (laporan yang datang sendiri)
6. Konsep 11 (bacaan bebas) → Praktik 10 (Checkpoint Fase 4)

Konsep 1 dipakai lagi di Praktik 10, saat kamu menulis catatan "kapan memakai yang mana". Rumus waktu tunggu di Konsep 7 kamu pakai di Praktik 5. Potongan SQL dan kode di bagian konsep cukup dibaca; semuanya diketik dan dijalankan di praktik.

### 1. Dua dashboard, dua penonton: tiga alat yang sudah kamu pegang

Silabus meminta dua jenis dashboard, lalu meminta kamu **tahu kapan memakai yang mana**. Keduanya berbeda karena penontonnya berbeda:

- **Dashboard React buatanmu** (Modul 22–24) untuk **penghuni rumah**. Pertanyaannya "sekarang": berapa suhu kamar, lampu menyala atau tidak, siram sekarang. Penghuni juga **memerintah**, sesuai perannya (admin atau viewer).
- **Grafana** (modul ini) untuk **tim teknis**, yaitu kamu sendiri saat memakai topi "petugas perawatan". Pertanyaannya "sejak kapan" dan "seberapa sering": sinyal WiFi Node 1 sebulan terakhir, memori yang menyusut, paket Node 2 yang berhenti datang. Tim teknis juga ingin **dibangunkan** lewat Telegram tanpa harus membuka layar apa pun. Grafana hanya membaca, tidak memerintah.

Silabus menyebut Grafana alat untuk "dashboard teknis tanpa koding" ([§3 Silabus](../../SILABUS.md#3-pilihan-teknologi--alasannya)): panel dirakit lewat klik di layar ditambah satu kueri SQL, bukan komponen React baru. Sebenarnya kamu sudah memegang dashboard ketiga: [Node-RED Dashboard 2 dari Modul 13](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#5-dashboard-2-halaman-grup-dan-widget) di Pi. Sejak Modul 16 otomasinya [pensiun sebagai otak](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#-bedah-teknis-opsional), tetapi dashboard-nya boleh tetap hidup sebagai tampilan cadangan. Jadi, perbandingan yang jujur cukup memakai tiga alat milikmu sendiri, lengkap dengan kelemahan masing-masing:

| | Node-RED Dashboard 2 (Modul 13) | Dashboard React (Modul 22–24) | Grafana (Modul 25) |
| :--- | :--- | :--- | :--- |
| Untuk siapa | kamu sendiri, saat merakit dan mencoba ide | penghuni: admin dan viewer, di laptop atau HP | tim teknis |
| Dibuat dengan | seret-sambung node, hampir tanpa kode | kode React + TypeScript | klik di layar + kueri SQL |
| Tinggal di | Pi, `:1880/dashboard` | laptop, `http://localhost:5173` | laptop, kontainer di `http://localhost:3000` |
| Datanya dari | pesan MQTT yang lewat | API backend + Socket.IO | database langsung, akun hanya-baca `grafana_baca` |
| Kendali | sakelar | tombol lampu, kipas, pompa, formulir aturan (admin) | tidak ada: hanya membaca |
| Akun & peran | dashboard tanpa akun (hanya editornya bersandi) | akun Modul 20, admin/viewer, satpam 401/403 | akun Grafana sendiri, terpisah dari akun Modul 20 |
| Riwayat | grafik 1 jam di memori Node-RED | 1 jam, 24 jam, 7 hari, empat besaran | sepanjang yang disimpan database, rentang bebas |
| Kabar saat ada masalah | — | *toast*, hanya di layar yang sedang terbuka (kabar 📴 di Telegram dikirim backend, bukan dashboard) | *alert* ke Telegram, walau tak ada yang membuka layar |
| Peta | — | layar **Peta** ([Praktik 7](#praktik-7--halaman-peta-dengan-react-leaflet-60-menit)) | ada (Geomap), tidak dipakai di modul ini ([🔬](#-bedah-teknis-opsional)) |
| Versi & uji | `edge/node-red-flows.json` di Git | Git, *lint*, *build*, `cek-skema` | JSON dashboard di Git lewat ekspor ([9.2](#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit)) |
| Kelemahan jujur | grafik hilang setiap Node-RED menyala ulang | setiap grafik baru = kode baru; tekanan, baterai, dan tandon tanpa riwayat | perlu SQL; layarnya berubah antarrilis; makan RAM ±200–470 MiB (Konsep 2) |
| Kapan TIDAK dipakai | untuk penghuni, atau untuk data bertahun-tahun | menyelidiki RSSI 30 hari, panel sekali pakai | menyalakan lampu, layar keluarga di HP |

![Diagram dua dashboard, dua penonton, tiga alat yang sudah kamu pegang (Konsep 1). Atas: penghuni rumah ingin tahu dan menyuruh sekarang (suhu, lampu, siram, dari HP), memakai dashboard buatanmu (React, Modul 22–24); tim teknis (ungu) ingin tahu sehatkah perangkat (sinyal, memori, data yang berhenti datang) dan dikabari tanpa membuka layar, memakai Grafana (Modul 25). Tabel kolom Node-RED Dashboard 2 (di Pi, Modul 13), dashboard React (laptop), Grafana (laptop, ungu). Untuk siapa: kamu saat merakit dan mencoba ide; penghuni rumah, admin dan viewer, di laptop atau HP; tim teknis. Dibuat dengan: seret-sambung node tanpa kode; kode React + TypeScript, berversi dan diuji di Git; klik di layar + kueri SQL, disimpan sebagai JSON di grafana/. Datanya dari: pesan MQTT langsung, grafik 1 jam di memori; API backend + Socket.IO, riwayat 1 jam, 24 jam, 7 hari; TimescaleDB langsung dengan akun grafana_baca, riwayat sepanjang data. Kuat untuk: mengintip lalu lintas MQTT; kendali lampu dan pompa, aturan, peran, peta, dari HP; tren panjang, sinyal dan memori, alert ke Telegram. Kelemahan jujur: grafik hilang saat Node-RED menyala ulang, otomasinya pensiun sejak Modul 16; setiap grafik baru = kode baru, tekanan, baterai, tandon tanpa riwayat; akun sendiri (bukan akun Modul 20), perlu SQL, RAM ±200–470 MiB. Kapan TIDAK dipakai (merah): untuk penghuni atau data bertahun-tahun; menyelidiki RSSI 30 hari atau panel sekali pakai; menyalakan lampu (Grafana hanya membaca) dan layar keluarga di HP. Bawah: tekanan udara, baterai, dan air tandon hanya di kartu live dashboard buatanmu, di Grafana cukup satu panel SQL; tombol lampu tidak cocok di Grafana yang membaca dengan akun hanya-baca; Node-RED boleh tetap hidup sebagai tampilan cadangan.](aset/dua-dashboard-tiga-alat.png)

Dua contoh dari proyekmu sendiri:

- **Pertanyaan teknis yang mahal di React.** Tekanan udara, baterai Node 2, dan air tandon tersimpan di `readings` sejak Modul 17, tetapi dashboard React hanya menampilkannya di kartu *live* (**Batasan** di `frontend/README.md`: riwayat ringkasan hanya empat besaran). Grafik baterai 30 hari di React berarti rute API, komponen, uji, dan rilis baru. Di Grafana cukup satu panel dengan satu kueri, tanpa menyentuh backend.
- **Tombol yang tidak cocok di Grafana.** Grafana membaca database dengan akun yang memang tidak bisa menulis (Konsep 3), jadi ia tidak bisa dan tidak boleh menyalakan lampu. Perintah tetap lewat `POST /devices/:id/command` yang dijaga satpam peran. Layar untuk keluarga juga tetap React: layar Grafana di modul ini berbahasa Inggris, akunnya terpisah, dan di modul ini hanya terbuka di laptop.

Pegangan praktisnya: **penghuni bertanya "sekarang" → dashboard buatanmu; tim teknis bertanya "sejak kapan" atau "seberapa sering" → Grafana; mencoba ide dengan cepat → Node-RED.** Di [10.3](#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit), kamu menulis ulang tabel ini dengan kata-katamu sendiri.

### 2. Grafana tinggal di samping database: satu `docker run` dan sebuah lorong

Grafana tidak menyimpan data sensor. Setiap kali panel digambar, ia bertanya langsung ke TimescaleDB. Database itu bagian dari "otak" yang tinggal di laptop sejak Modul 16: sejak Modul 17 ia berada di kontainer `rumahpintar-db`, dan sengaja hanya membuka loket `127.0.0.1:5432` untuk program di laptop itu. Maka Grafana ikut tinggal di laptop, sebagai kontainer kedua di samping database, dipasang dengan cara yang sama seperti Modul 17. Empat istilah [Docker secukupnya](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari) tetap berlaku; minggu ini ditambah satu:

| Istilah Docker | Bayangkan | Di Modul 25 |
| :--- | :--- | :--- |
| **Image** (cetakan) | cetakan kue yang tidak pernah berubah | `grafana/grafana:13.2.4`, diunduh sekali (±445 MB untuk arm64) |
| **Container** (kontainer) | kue yang dicetak: program yang sedang berjalan | `rumahpintar-grafana` |
| **Port** (loket) | loket dari luar ke dalam kontainer | `127.0.0.1:3000`, hanya untuk laptop ini |
| **Volume** (lemari) | lemari di luar kue: isinya tetap walau kuenya dibuang | `rumahpintar-grafana-data` |
| ***Network*** (lorong), **baru** | lorong di dalam gedung yang menghubungkan kontainer-kontainer, seperti lorong antarapartemen: di dalamnya mereka saling memanggil dengan NAMA, tanpa lewat loket laptop | `rumahpintar`, berisi `rumahpintar-db` dan `rumahpintar-grafana` |

**Kenapa perlu lorong?** Di dalam kontainer, `localhost` berarti **kontainer itu sendiri**, bukan laptopmu. *Data source* dengan **Host URL** `localhost:5432` membuat Grafana mengetuk dirinya sendiri, padahal di kontainer Grafana tidak ada database. Banyak tutorial memakai `host.docker.internal`, nama khusus Docker Desktop untuk "laptop di luar kontainer". Ini jawaban tombol **Save & test** di lab penulis (Docker Engine di Linux):

| **Host URL** | **Save & test** |
| :--- | :--- |
| `localhost:5432` | `Network error: Failed to connect to the server. Error message: connect: connection refused` |
| `host.docker.internal:5432` | `Network error: Failed to connect to the server. Error message: no such host` |
| `rumahpintar-db:5432` (lewat lorong) | `Database Connection OK` |

Riset penulis juga mencoba `host.docker.internal` yang dipaksa dikenal (`--add-host`): loket database yang hanya dibuka untuk `127.0.0.1` tetap menolak. Docker Desktop di Windows dan macOS tidak diuji penulis, jadi resep itu tidak dipakai. Lorong adalah fitur Docker sendiri, bukan nama khusus Docker Desktop, jadi resepnya mestinya sama di semua sistem operasi (penulis hanya menguji Docker Engine di Linux). Dengan lorong, loket database tetap `127.0.0.1` sesuai aturan Modul 17, dan di dalam lorong nomornya selalu 5432, walaupun loket laptopmu memakai nomor lain. Bedah lengkap *network* Docker menunggu di Modul 26.

**Cukup sekali.** `docker network create rumahpintar` membuat lorongnya, lalu `docker network connect rumahpintar rumahpintar-db` menyambungkan database yang sedang berjalan tanpa mematikannya (perintah ini sukses dengan diam, tanpa keluaran). Sambungan itu tersimpan di kontainernya. Di lab penulis, sambungannya tetap ada sesudah `docker restart rumahpintar-db`; di lab uji kode, juga sesudah kedua kontainer dihentikan lalu dinyalakan lagi. Saat Grafana menyala lebih dulu di sana, *data source* sempat menjawab `lookup rumahpintar-db on 127.0.0.11:53: server misbehaving` (kontainer database belum menyala, jadi namanya belum dikenal di lorong), lalu pulih sendiri begitu database menyala. *Restart* Docker dan *reboot* laptop tidak diuji penulis; karena sambungannya tersimpan di kontainer dan keduanya `--restart unless-stopped`, mestinya tetap juga.

![Diagram Grafana tinggal di samping database, di laptop (Konsep 2). Atas: Docker Hub dengan cetakan grafana/grafana:13.2.4 (OSS, AGPLv3), diunduh sekali, ±445 MB (arm64), tag persis; Telegram, bot Modul 19 (Grafana 🔴/✅ alert, backend 📴/✅, 📊 laporan CSV, /status); Raspberry Pi 192.168.1.37, Mosquitto berkunci, acl-broker + blok jalur laptop. Panah docker run (satu baris; unduh dulu: docker pull) dari Docker Hub ke kontainer Grafana. Di laptop, bukan kontainer: browser (http://localhost:3000 ke Grafana, http://localhost:5173 ke Vite, dashboard buatanmu) dan backend 1.2, DATABASE_URL lewat loket 127.0.0.1:5432 dengan akun postgres, bukan akun Grafana. Keluar laptop: Grafana HTTPS sendMessage untuk alert; backend HTTPS sendMessage, long polling, dan sendDocument; backend ke Pi lewat MQTT berakun. Area Docker Desktop (Windows, macOS) atau Docker Engine (Linux), kontainer = Linux kecil di dalam laptop, dengan dua loket di tepinya, 127.0.0.1:3000 dan 127.0.0.1:5432, hanya untuk program di laptop ini. Di lorong rumahpintar (putus-putus ungu): kontainer rumahpintar-grafana (Grafana OSS 13.2.4, RAM ±200–470 MiB, membaca sebagai grafana_baca, plugin tidak diunduh lewat GF_PLUGINS_PREINSTALL_DISABLED, statistik, snapshot luar, dashboard publik mati) berpanah ke rumahpintar-db:5432, nama = alamat; kontainer rumahpintar-db (PostgreSQL 17 + TimescaleDB 2.30.2, Modul 17, tidak berubah, port di lorong selalu 5432). Di bawahnya lemari (volume) bergaris -v: rumahpintar-grafana-data (dashboard, alert, akun Grafana; tetap ada walau kontainer dibuat ulang) dan rumahpintar-data (semua tabel, tidak berubah). Bawah: kenapa lorong, karena di dalam kontainer Grafana localhost:5432 = Grafana sendiri dan host.docker.internal tidak menjangkau loket 127.0.0.1 (terbukti di Docker Engine Linux); cukup sekali, docker network create rumahpintar lalu docker network connect rumahpintar rumahpintar-db, tersimpan di kontainer (lab: tetap sesudah docker restart). Putus-putus: Modul 26 Docker Compose menulis kontainer, lorong, dan lemari di satu berkas; lemari yang sama, isi tidak hilang.](aset/grafana-di-samping-database.png)

**Perintah [KC Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit), bagian demi bagian.** Bagian yang sama dengan Modul 17 (`docker run`, `-d`, `--restart unless-stopped`) tidak diulang:

| Bagian | Artinya |
| :--- | :--- |
| `--name rumahpintar-grafana` | nama kontainer, berawalan sama dengan `rumahpintar-db` |
| `--network rumahpintar` | masuk lorong sejak dicetak |
| `-p 127.0.0.1:3000:3000` | loket 3000 hanya untuk laptop ini. Nomor 3000 sudah [disisihkan untuk Grafana sejak Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#2-http-sekali-lagi-metode-rute-kode-status-dan-loket), karena itu backend memakai 8080. HP dan laptop lain tidak bisa membukanya ([1.3](#13-pintu-grafana-401-tanpa-login-hanya-dari-laptop-ini-tanpa-berbagi-ke-luar-5-menit); kotak opsional *Grafana dari HP* di [Praktik 10](#praktik-10--checkpoint-fase-4-kumpulkan-buktinya-45-menit)) |
| `-e GF_PLUGINS_PREINSTALL_DISABLED=true` | tanpa ini, saat pertama menyala Grafana mengunduh ±290 MB plugin dari grafana.com yang tidak kita pakai, dan versinya ikut bergeser sendiri. *Data source* PostgreSQL sudah bawaan. Di lab penulis, folder plugin hanya `4.0K` |
| `-e GF_ANALYTICS_REPORTING_ENABLED=false` | jangan kirim statistik pemakaian ke stats.grafana.org (mirip `TIMESCALEDB_TELEMETRY=off` di Modul 17) |
| `-e GF_SNAPSHOTS_EXTERNAL_ENABLED=false` | matikan *snapshot* (potret dashboard) yang diterbitkan ke server Grafana di internet |
| `-e GF_PUBLIC_DASHBOARDS_ENABLED=false` | matikan dashboard publik, yang bisa dibuka tanpa *login* |
| `-v rumahpintar-grafana-data:/var/lib/grafana` | lemari Grafana: dashboard, aturan *alert*, *contact point*, akun dan sandi. Kontainernya boleh dibuang dan dicetak ulang; Modul 26 memakai lemari yang sama |
| `grafana/grafana:13.2.4` | edisi OSS dengan *tag* persis. Image `grafana/grafana-oss` di tutorial lama mandek di 13.0.2 (Juni 2026), dan tanpa *tag* kamu mendapat versi lain yang menunya bisa berbeda |

Sandi admin sengaja **tidak** ada di perintah, supaya tidak tersimpan di riwayat terminal: sandinya diganti di layar **Update your password** dengan **Submit** ([KC Langkah 3](#langkah-3--masuk-pertama-kali-dan-ganti-sandi-admin-submit-bukan-skip-3-menit)).

**Jujur soal kiriman ke luar.** Tiga setelan `false` itu terbukti berlaku di lab uji kode: dibandingkan Grafana tanpa ketiganya, menu bagikan kehilangan **Share externally** (bagikan ke luar), dan laci **Share snapshot** kehilangan **Publish to snapshots.raintank.io**. Yang **tetap** menghubungi internet: pemeriksaan versi baru Grafana dan plugin ke grafana.com, umpan berita (beranda menampilkan `Latest from the blog`), dan gambar avatar Gravatar. Semuanya tanpa isi dashboard atau data rumahmu. Cara mematikan pemeriksaan versi ada di [🔬](#-bedah-teknis-opsional) *Tiga setelan tambahan …*.

**OSS, bukan Enterprise.** Dokumen Docker Grafana menyarankan edisi Enterprise sebagai bawaan. Image `grafana/grafana` yang kita pakai adalah edisi **OSS** (sumber terbuka, lisensi AGPLv3), dan semua isi modul ini cukup dengan edisi itu.

**RAM, dan kenapa belum di Pi.** Grafana memakan ±200–470 MiB, tergantung beban: di lab akhir penulis 209,5–231,2 MiB dengan dashboard terbuka, dan riset penulis mencatat sampai ±470 MiB saat dashboard enam panel dimuat berulang dan halaman *alert* dibuka (`docker stats`). Inilah salah satu alasan Silabus menyebut [VPS 2 GB](../../SILABUS.md#55-biaya-layanan-fase-5) untuk Fase 5. Grafana belum dipindah ke Pi karena database-nya di laptop dan sengaja tertutup untuk WiFi. Memindahkannya berarti membuka database ke jaringan atau ikut memindah database, dan itu pekerjaan Modul 26–27. Akibatnya, Grafana dan *alert*-nya hanya bekerja selama laptop menyala. Cara memasang Grafana tanpa Docker ada di [🔬](#-bedah-teknis-opsional) *Grafana tanpa Docker …*.

Rinciannya di [KC Langkah 1](#langkah-1--lorong-rumahpintar-antarkontainer-cukup-sekali-2-menit) dan [Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit); kontainer, lemari, dan lorongnya kamu periksa di [1.2](#12-periksa-kontainernya-docker-ps-docker-inspect-dan-docker-network-inspect-7-menit), pintunya di [1.3](#13-pintu-grafana-401-tanpa-login-hanya-dari-laptop-ini-tanpa-berbagi-ke-luar-5-menit). Kalau loket 3000 sudah dipakai program lain, misalnya `alat/penerima-webhook.js`, lihat [🚨](#-kalau-tidak-jalan).

### 3. Hak sekecil mungkin: Grafana hanya boleh membaca

Sampai Modul 24, database hanya punya satu akun: `postgres`, akun super Modul 17 yang dipakai backend dan migrasi. Akun itu boleh membaca semuanya, termasuk sidik jari sandi (`users.sandi_hash`), sidik token sesi (`sesi.token_hash`), dan sidik kunci perangkat (`devices.kunci_hash`), juga boleh `DROP TABLE`. Formulir *data source* Grafana sendiri memperingatkan di kotak **User Permissions** (izin pengguna): akun database untuk Grafana `should only be granted SELECT permissions`, sebab `Grafana does not validate that queries are safe`. Kueri panel apa pun, termasuk `DROP TABLE`, dijalankan apa adanya. Karena itu, Grafana mendapat akun sendiri, **`grafana_baca`**, semacam "kartu baca": boleh melihat rak tertentu, tidak boleh menulis.

Isi `grafana/pengguna-grafana.sql` (berkas utuhnya kamu buat di [KC Langkah 4](#langkah-4--akun-database-hanya-baca-grafana_baca-6-menit)), baris demi baris:

| Baris | Artinya |
| :--- | :--- |
| `CREATE ROLE grafana_baca LOGIN CONNECTION LIMIT 5;` | akun baru yang boleh masuk, paling banyak 5 sambungan sekaligus |
| `ALTER ROLE grafana_baca SET default_transaction_read_only = on;` | **lapis 1**: setiap transaksinya hanya-baca |
| `ALTER ROLE grafana_baca SET statement_timeout = '10s';` | kueri panel yang kebablasan dihentikan sesudah 10 detik, supaya tidak membebani database |
| `GRANT CONNECT ON DATABASE rumahpintar …` dan `GRANT USAGE ON SCHEMA public …` | boleh masuk ke database `rumahpintar` dan melihat isi skemanya |
| `GRANT SELECT ON readings, readings_per_jam, device_health, events, commands …` | **lapis 2**: hanya boleh membaca empat tabel dan satu ringkasan ini. Jilid (*chunk*) baru `readings` yang dibuat TimescaleDB kelak ikut terbaca; ringkasan `readings_per_jam` ([Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis)) cukup diberi izin pada namanya |
| `GRANT SELECT (device_id, jenis, nama, lokasi, lat, lng, status, terakhir_dilihat, dibuat, terdaftar, dicabut, penghubung) ON devices …` | dari `devices` hanya 12 kolom ini; `kunci_hash` dan `kunci_dibuat` tidak |
| (sengaja tidak ada) | `users`, `sesi`, `rules`, dan `schema_migrations` tertutup sama sekali |

**Dua lapis, seperti satpam dan ACL.** Polanya sudah kamu kenal: [satpam peran di backend](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#6-satpam-di-setiap-pintu-peran-admin-dan-viewer) (Modul 20) dan [daftar izin ACL di broker](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#7-daftar-izin-acl-setiap-perangkat-di-topiknya-sendiri) (Modul 21). Kalau satu lapis bocor, lapis lain masih menahan. Di lab penulis, lapis 1 ternyata bisa dimatikan oleh akun itu sendiri untuk sesinya, tetapi lapis 2 tetap menolak (psql sebagai `grafana_baca`):

```text
rumahpintar=> SET default_transaction_read_only = off;
SET
rumahpintar=> INSERT INTO events (jenis, sumber, pesan) VALUES ('status', 'uji', 'coba');
ERROR:  permission denied for table events
```

Tanpa `SET` itu, `INSERT` dan `DROP TABLE` sudah ditolak lapis 1 (`cannot execute … in a read-only transaction`); kamu mencobanya sendiri di [1.4](#14--uji-grafana_baca-di-psql-boleh-membaca-ditolak-menulis-10-menit).

![Diagram hak sekecil mungkin: Grafana hanya boleh membaca (Konsep 3); akun grafana_baca dari grafana/pengguna-grafana.sql. Kiri: postgres, superuser Modul 17, membaca semua tabel termasuk users.sandi_hash, sesi.token_hash, devices.kunci_hash, boleh INSERT, UPDATE, DROP TABLE, dipakai backend dan migrasi; merah: Grafana tidak pernah memegangnya. Kanan, ungu: grafana_baca, akun baru hanya untuk Grafana, sandi diketik dengan backslash password di psql, tidak di berkas. Lapis 1, transaksi hanya-baca: default_transaction_read_only = on menolak INSERT, UPDATE, DROP; plus batas statement_timeout 10s dan CONNECTION LIMIT 5. Lapis 2, izin per tabel dan kolom: GRANT SELECT hanya untuk tabel yang dibaca panel, alert, laporan; devices tanpa kunci_hash; tabel lain tertutup. Tengah, bercentang hijau: readings, readings_per_jam, device_health, events, commands; devices hanya kolom device_id, jenis, nama, lokasi, lat, lng, status, terakhir_dilihat, dibuat, terdaftar, dicabut, penghubung; tertutup kunci_hash, kunci_dibuat. Tertutup sama sekali: users, sesi, rules. Tabel uji di psql sebagai grafana_baca, teks persis: SELECT count(*) FROM readings menjawab 2316, boleh; SELECT * FROM devices dan SELECT kunci_hash FROM devices: ERROR: permission denied for table devices (lapis 2); users dan sesi: permission denied for table users atau sesi (lapis 2); INSERT INTO events: ERROR: cannot execute INSERT in a read-only transaction (lapis 1); DROP TABLE readings: cannot execute DROP TABLE in a read-only transaction (lapis 1); SHOW statement_timeout: 10s (batas). Bawah: kueri panel selalu menulis nama kolom, bukan SELECT *; data source Grafana Max open 4 karena akun ini paling banyak 5 sambungan; pola sama dengan satpam backend Modul 20 dan ACL broker Modul 21.](aset/hak-baca-saja.png)

**Akibatnya di Grafana: selalu tulis nama kolom.** Karena izin `devices` diberikan per kolom, `SELECT * FROM devices` ditolak, juga dari panel Grafana. Di lab penulis, kueri itu di **Explore** (jelajahi) menjawab:

```text
db query error: ERROR: permission denied for table devices (SQLSTATE 42501)
```

Semua kueri di modul ini menulis nama kolomnya satu per satu. Empat tabel dan satu ringkasan tadi diberi izin utuh, jadi `SELECT *` di sana tetap jalan, tetapi kebiasaan menulis nama kolom membuat kuerimu lebih mudah dibaca.

**Batas sambungan: 5 di database, 4 di Grafana.** `CONNECTION LIMIT 5` membatasi akun ini, sedangkan *data source* Grafana bawaannya boleh membuka sampai 100 sambungan (**Max open** `100`). Di lab uji kode penulis, skrip yang meniru tiga tab memuat dashboard 10 kali bersamaan dengan bawaan itu, dan 4 dari 180 kueri gagal dengan `too many connections for role "grafana_baca"`. Dengan **Max open** `4`, kegagalannya 0 dari 180: Grafana mengantre sendiri, dan masih tersisa satu sambungan untuk psql. Itulah sebabnya [KC Langkah 5](#langkah-5--data-source-postgresql-lewat-lorong-rumahpintar-db5432-5-menit) mengisi angka `4`.

**Sandi tidak pernah ditulis.** Berkas `pengguna-grafana.sql` tanpa sandi, jadi aman ikut Git. Sandinya diketik lewat `\password grafana_baca` di psql: tidak tampil di layar dan tidak masuk riwayat terminal. Akun ini juga sengaja tidak dibuat lewat migrasi backend: sandi tidak boleh masuk Git, dan akun Grafana bukan bagian skema aplikasi. Akun PostgreSQL tersimpan bersama tabel di lemari `rumahpintar-data`, jadi ikut pindah saat database dipindah. Menjalankan berkasnya dua kali hanya mengubah baris pertama jawabannya, `CREATE ROLE`, menjadi pesan `ERROR:  role "grafana_baca" already exists`; baris lainnya tetap berlaku. Satu celah kecil sesudah lapis 1 dimatikan (membuat tabel sementara) dan cara menutupnya ada di [🔬](#-bedah-teknis-opsional) *Tiga setelan tambahan …*.

> ⬆️ **Sudah membaca Konsep 1–3?** Lanjut ke [Praktik 1](#praktik-1--grafana-yang-rapi-dan-aman-30-menit). Konsep 4–6 dibaca sebelum [Praktik 2](#praktik-2--dashboard-kesehatan-sistem-rssi-uptime-heap-dan-variabel-node-50-menit).

### 4. Anatomi panel: SQL, makro waktu, satuan, dan ambang

Sebuah **panel** adalah satu kotak di dashboard yang berisi **satu kueri SQL + satu cara menggambar**: grafik garis **Time series**, angka besar **Stat**, diagram batang **Bar chart**, atau tabel **Table**. Grafana tidak tahu apa itu "suhu" atau "perangkat"; ia hanya membaca kolom hasil kuerimu, lalu menggambarnya. Inilah kueri panel pertamamu di [KC Langkah 6](#langkah-6--panel-pertama-kueri-suhu-dengan-format-time-series-lalu-simpan-6-menit) (`kueri-suhu.sql`, tanpa baris komentarnya):

```sql
SELECT
  $__timeGroupAlias(ts, $__interval),
  device_id AS metric,
  avg(suhu) AS suhu
FROM readings
WHERE $__timeFilter(ts)
GROUP BY 1, 2
ORDER BY 1
```

**Tiga peran kolom.** Untuk grafik garis, hasil kueri dibaca seperti ini:

| Kolom | Perannya |
| :--- | :--- |
| `time` (dibuat makro, lihat di bawah) | sumbu waktu; hasilnya harus urut waktu, karena itu ada `ORDER BY 1` |
| `metric` | teks pemisah garis: satu garis untuk setiap `device_id` |
| `suhu` | angka yang digambar |

**Format: `Table` atau `Time series`.** Di atas kotak SQL, sebaris dengan **Run query**, ada pilihan **Format**, dan bawaannya `Table`. Dengan `Table`, kolom `metric` tidak dipakai untuk memisah garis: hasilnya SATU garis bernama `suhu` yang melompat-lompat antarperangkat. Dengan **Time series**, setiap perangkat mendapat garisnya sendiri. Di modul ini, panel garis, Stat, dan batang memakai **Time series**; panel tabel (Praktik 3) dan kueri *alert* (Praktik 4) memakai `Table`.

**Makro: potongan yang diganti Grafana sebelum kueri dikirim.** Database tidak pernah melihat tulisan `$__…`. Grafana menggantinya lebih dulu, dan hasilnya bisa kamu intip lewat **Query inspector** (pemeriksa kueri). Kueri di atas, rentang **Last 1 hour**, di lab penulis:

```text
A:29 rows
SELECT
time_bucket('60.000s',ts) AS "time",
device_id AS metric,
avg(suhu) AS suhu
FROM readings
WHERE ts BETWEEN '2026-10-26T19:55:49.344Z' AND '2026-10-26T20:55:49.344Z'
GROUP BY 1, 2
ORDER BY 1
```

- `$__timeFilter(ts)` menjadi `ts BETWEEN '…Z' AND '…Z'`: rentang waktu yang kamu pilih di kanan atas, ditulis dalam **UTC** (akhiran `Z`).
- `$__timeGroupAlias(ts, $__interval)` menjadi `time_bucket('60.000s',ts) AS "time"`, yaitu [ember waktu Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#3-time_bucket-ember-waktu). `time_bucket` muncul karena sakelar **TimescaleDB** di *data source* dinyalakan ([KC Langkah 5](#langkah-5--data-source-postgresql-lewat-lorong-rumahpintar-db5432-5-menit)); tanpa sakelar itu, Grafana menulis rumus PostgreSQL biasa. `$__interval` mengikuti rentang: makin panjang rentangnya, makin lebar embernya, jadi grafik rentang panjang tidak perlu memuat setiap bacaan 10 detik.

**UTC di kueri, WIB di layar.** Database menyimpan waktu dalam UTC ([Modul 17 Konsep 9](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#9-waktu-timestamptz-utc-dan-wib)), dan makro pun menulis UTC. Sumbu grafik digambar menurut **zona waktu dashboard**. Dashboard baru ikut zona browser; dashboard "Kesehatan Sistem" diatur ke `Jakarta  WIB  UTC+07:00` di **Settings** (pengaturan), langkah [2.1](#21-dashboard-baru-folder-zona-wib-dan-variabel-node-10-menit), sehingga tampil WIB di laptop mana pun dan setelannya ikut tersimpan di JSON. Jadi, di dashboard berzona WIB, jam di Query inspector 7 jam lebih awal daripada jam di grafik, dan itu bukan kesalahan.

**Satuan dan ambang.** Grafana tidak tahu bahwa `uptime_s` berarti detik; kamu yang memberitahunya lewat **Standard options → Unit** (satuan). Di lab penulis, `Time / duration (s)` mengubah `600` menjadi `10 minutes`, `Energy / Decibel-milliwatt (dBm)` memberi sumbu `-60 dbm` (huruf kecil), dan `Data / bytes(SI)` memberi sumbu `kB`. **Thresholds** (ambang) mewarnai angka Stat, sel tabel, dan batang; di grafik garis, warna garisnya tetap satu per perangkat, dan ambang tampil sebagai garis putus bila diminta (panel RSSI). Ambang bawaannya, sesuai dokumentasi Grafana: `Base` hijau, lalu **merah mulai 80**. Grafana hanya membandingkan angka tanpa tahu artinya, jadi panel Stat *uptime* yang belum diatur menampilkan `600` merah besar, seolah ada bahaya ([2.3](#23-panel-uptime-dan-heap-jebakan-stat-merah-di-80-satuan-durasi-dan-byte-13-menit)). Di modul ini, ambang diganti sesuai artinya (RSSI `-75`, paket per jam `12`, menit terlambat `5`), dan Stat *uptime* memakai satu warna tetap: **Color scheme** (skema warna) `Single color`.

**Celah: jangan diisi `0`.** `$__timeGroupAlias` punya argumen ketiga untuk mengisi ember yang kosong. Mengisinya dengan `0` berarti mengarang angka: suhu `0` artinya nol derajat, bukan "tidak tahu" (`NULL`, [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#3-tabel-baris-kolom-tipe-dan-kunci-utama)). Di lab penulis, `$__timeGroupAlias(ts, $__interval, 0)` untuk perangkat latihan `f00d00000002` dalam rentang **Last 6 hours** menghasilkan 361 titik, 331 di antaranya bernilai 0: grafiknya bergerigi, jatuh ke 0 °C setiap menit tanpa bacaan. Tanpa argumen ketiga, Grafana hanya menerima ember yang berisi data; kalau titik kosong memang diperlukan, isi `NULL`, bukan `0`. Prinsipnya sama dengan [visual jujur Modul 23](../modul-23-dashboard-realtime/README.md#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status): jangan mengarang angka untuk waktu tanpa bacaan.

**Query inspector dulu, baru menebak.** Buka lewat menu panel → **Inspect** (periksa) → **Query** → **Refresh**. Setiap kali panel tampak aneh (`No data`, jam bergeser, garis zig-zag), lihat dulu kueri yang benar-benar dikirim dan berapa baris jawabannya (`A:29 rows` di contoh tadi).

Rinciannya di [KC Langkah 6](#langkah-6--panel-pertama-kueri-suhu-dengan-format-time-series-lalu-simpan-6-menit) dan [2.2](#22-panel-rssi-kueri-sql-format-time-series-satuan-dbm-dan-ambang-12-menit)–[2.5](#25-no-data-dan-jam-yang-bergeser-vitals-tiap-5-menit-utc-di-kueri-wib-di-layar-5-menit); Query inspector kamu buka di [2.4](#24--simpan-dengan-refresh-1-menit-uji-node-lalu-intip-query-inspector-10-menit). Tiga jebakan bagian ini ada di [🚨](#-kalau-tidak-jalan): *Grafik suhu aneh …*, *Angka Stat berwarna merah padahal normal*, dan *Jam di grafik atau di Query inspector bergeser 7 jam*.

### 5. Variabel: satu dashboard untuk semua perangkat

Rumahmu punya beberapa perangkat: Node 1, Node 2, dan di jalur laptop simulator `f00d00000001` serta Kebun tiruan. Tanpa variabel, kamu punya dua pilihan yang sama-sama buruk: satu dashboard untuk setiap perangkat (perangkat baru = dashboard baru), atau semua garis bertumpuk di setiap panel. **Variabel** `$node` adalah "pemilih perangkat di atas dashboard": satu kotak tarik-turun bernama `Node`, dan semua panel ikut menampilkan perangkat yang dipilih di sana.

**Daftar pilihannya datang dari database.** Variabel jenis **Query** mengisi daftarnya dengan kueri SQL ([2.1](#21-dashboard-baru-folder-zona-wib-dan-variabel-node-10-menit)), persis dari dashboard kunci modul ini, [`kode/grafana/dashboards/kesehatan-sistem.json`](kode/grafana/dashboards/kesehatan-sistem.json):

```sql
SELECT coalesce(nama, device_id) AS __text, device_id AS __value FROM devices WHERE terdaftar IS NOT NULL AND dicabut IS NULL ORDER BY 1
```

| Bagian | Artinya |
| :--- | :--- |
| `AS __text` | yang **tampil** di kotak pilihan: nama perangkat, atau `device_id` kalau namanya kosong (`coalesce`) |
| `AS __value` | yang **dikirim** ke kueri panel: `device_id`, karena kolom inilah yang ada di `device_health` dan `readings` |
| `WHERE terdaftar IS NOT NULL AND dicabut IS NULL` | hanya perangkat yang terdaftar dan kuncinya tidak dicabut ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#72-lapis-pertama-cabut-di-backend-5-menit)); syarat yang sama dipakai kueri *alert* (Konsep 7) |

Kolom-kolom itu termasuk 12 kolom `devices` yang boleh dibaca `grafana_baca` (Konsep 3). Daftarnya dimuat ulang setiap dashboard dibuka (`Refresh` `On dashboard load`), jadi perangkat yang baru didaftarkan ikut muncul tanpa menyunting apa pun. Di lab penulis, tombol **Run query** di editor variabel menulis `Preview of values (3)`: `Kebun (tiruan)`, `Latihan ruang tamu`, `Latihan teras`.

**Satu, beberapa, atau semua.** Dua sakelar membuat pemilihnya lebih berguna: **Multi-value** (banyak nilai) boleh memilih beberapa perangkat sekaligus, dan **Include All value** (pilihan "semua") menambah pilihan `All`. Di kueri panel, variabel ditulis di dalam `IN (…)`, misalnya kueri panel RSSI:

```sql
SELECT h.ts AS "time", coalesce(d.nama, h.device_id) AS metric, h.rssi
FROM device_health h JOIN devices d ON d.device_id = h.device_id
WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
ORDER BY 1
```

Seperti makro (Konsep 4), `$node` diganti Grafana sebelum kuerinya dikirim. Ini baris `WHERE` di **Query inspector** lab penulis, pertama dengan `Node` = `All`, lalu dengan satu perangkat:

```text
WHERE h.ts BETWEEN '2026-10-26T14:55:18.815Z' AND '2026-10-26T20:55:18.815Z' AND h.device_id IN ('f00d000000b2','f00d00000001','f00d00000002')
WHERE h.ts BETWEEN '2026-10-26T14:56:19.127Z' AND '2026-10-26T20:56:19.127Z' AND h.device_id IN ('f00d00000001')
```

`All` berarti daftar semua nilai, termasuk Kebun yang tidak punya vitals (Konsep 6); itu tidak apa-apa, karena `IN` hanya mencari.

**Kutipnya ditambahkan Grafana, tetapi hanya untuk variabel Multi-value.** Menurut dokumentasi Grafana, nilai variabel diberi tanda kutip otomatis hanya bila variabelnya *multi-value*. Karena `$node` ber-**Multi-value**, satu pilihan pun menjadi `'f00d00000001'`, dan kamu tidak boleh menambah tanda kutip sendiri. Jebakannya ada di `= $node`. Di lab penulis, `h.device_id = $node` masih jalan selama satu perangkat dipilih (`= 'f00d00000001'`), tetapi begitu `All` dipilih, panelnya menjawab:

```text
db query error: ERROR: syntax error at or near "," (SQLSTATE 42601)
```

Daftar berkoma hanya sah di dalam `IN (…)`. Kalau **Multi-value** dimatikan, menurut dokumentasi nilainya ditempel tanpa kutip dan kuerinya rusak dengan cara lain (tidak diuji penulis). Pegangannya: **variabel perangkat selalu Multi-value, selalu `IN ($node)`**.

**Dua kejutan di Grafana 13.2.** Editor variabel kini tinggal di **bilah samping** dashboard: tab **Variables** di **Settings** hanya menulis `Variable settings have moved to the dashboard's sidebar.` dengan tombol **Take me there**, jadi tutorial lama yang menyuruh mengisi variabel di tab itu tidak cocok lagi. Lalu, sesudah dashboard disimpan pertama kali, `Node` di lab penulis berisi nilai **pertama** daftarnya (`Kebun (tiruan)`), bukan `All`, sehingga panel RSSI bertuliskan `No data`. Pilih `All`, lalu saat **Save** centang **Update default variable values** supaya `All` menjadi bawaan ([2.4](#24--simpan-dengan-refresh-1-menit-uji-node-lalu-intip-query-inspector-10-menit)).

**Variabel tidak berlaku di *alert*.** Dokumentasi *alert* PostgreSQL Grafana menulis `Template variables aren't supported`. Aturan *alert* dijalankan Grafana sendiri tanpa ada yang memilih `Node`, jadi kuerinya ([4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit)) tidak memakai `$node`: ia selalu memeriksa semua perangkat terdaftar. "Sekarang"-nya cukup `now()`; `$__timeFilter` tidak diperlukan. Kalau panel menjadi galat atau kosong begitu kuerinya memakai `$node`, lihat [🚨](#-kalau-tidak-jalan) *Panel galat atau kosong begitu kuerinya memakai `$node`*.

### 6. Membaca kesehatan perangkat: RSSI, *uptime*, *heap*, dan paket per jam

Sejak Modul 11, Node 1 mengirim **`vitals`**, "laporan kesehatan perangkat" menurut [glosarium Silabus](../../SILABUS.md#12-glosarium-mini-istilah-yang-muncul-di-silabus-ini): sekali sesudah tersambung, lalu **setiap 5 menit**. Backend menyimpannya di `device_health`, satu baris per kiriman. Selama ini, di luar kueri SQL, kamu hanya melihat kiriman terakhirnya lewat `GET /devices/:id/vitals`, yang tersimpan di memori dan kosong lagi setiap backend dimulai ulang ([🚨 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#-kalau-tidak-jalan)). Grafana membaca riwayatnya langsung dari tabel. Tiga angkanya menjawab tiga pertanyaan berbeda:

| Besaran (kolom) | Satuan di panel | Normalnya | Yang patut dicurigai |
| :--- | :--- | :--- | :--- |
| **RSSI** (`rssi`), kekuatan sinyal WiFi | `Energy / Decibel-milliwatt (dBm)`, tampil `-60 dbm` | selalu negatif; makin dekat ke 0 makin kuat, jadi −50 jauh lebih kuat daripada −80 | garis yang merosot dan bertahan rendah: router dipindah, dinding baru, atau antena tertutup |
| ***Uptime*** (`uptime_s`), lama menyala sejak *boot* terakhir | `Time / duration (s)`, tampil `10 minutes`, `2 hours` | terus bertambah | angka yang tiba-tiba kecil lagi: perangkat baru menyala ulang (listrik putus, tegangan turun, atau program macet) |
| ***Heap*** (`heap_free`), sisa memori kerja chip | `Data / bytes(SI)`, tampil `kB` | naik-turun di sekitar angka yang sama | turun terus selama berjam-jam: ada memori yang dipakai tanpa dikembalikan (bocor), dan ujungnya perangkat menyala ulang |

Ketiganya saling menjelaskan. *Heap* yang menyusut lalu *uptime* yang jatuh ke nol bercerita satu hal: perangkat kehabisan memori, lalu menyala ulang. Backend sendiri sudah memakai *uptime* di bawah 60 detik sebagai tanda "baru menyala ulang" ([Modul 19 Konsep 4](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#4-keadaan-yang-diinginkan-lawan-yang-dilaporkan)). Untuk RSSI, patokan yang sering dipakai adalah **konvensi umum, bukan standar resmi**: di sekitar −75 dBm ke bawah, sambungan mulai rawan putus. Dashboard modul ini memakai −75 sebagai garis waspada (garis putus-putus hijau di [2.2](#22-panel-rssi-kueri-sql-format-time-series-satuan-dbm-dan-ambang-12-menit)), dan angka itu boleh kamu geser setelah mengenal rumahmu.

**Jujur soal simulator.** Simulator mengarang `vitals`-nya: RSSI diacak antara −40 dan −79 dBm setiap kiriman, *heap* antara 180.000 dan 200.000 byte, dan *uptime* dihitung sejak simulator dijalankan. Garis RSSI dan *heap* di jalur laptop memang zig-zag tanpa arti; pola sungguhan hanya muncul dari Node 1 di rumahmu.

**Titik setiap 5 menit, dan "No data".** Karena `vitals` datang tiap 5 menit, grafiknya berupa titik-titik berjarak 5 menit, bukan garis rapat seperti suhu (10 detik). Itu bukan kerusakan. Di lab penulis, `vitals` pertama simulator masuk 03.31.42 WIB, dan 25 menit kemudian panel RSSI berisi 6 titik. Panel *vitals* bertuliskan `No data` bila rentang waktunya belum memuat satu kiriman pun, misalnya dalam 5 menit pertama sesudah sistem dinyalakan ([Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#57-lihat-datanya-berdatangan) juga menyebut `device_health` baru berisi sesudah beberapa menit), atau bila `Node` hanya berisi Kebun. Riwayat dari `npm run isi-riwayat` tidak memuat `vitals`. Rinciannya di [2.5](#25-no-data-dan-jam-yang-bergeser-vitals-tiap-5-menit-utc-di-kueri-wib-di-layar-5-menit) dan [🚨](#-kalau-tidak-jalan) *Panel RSSI, uptime, atau heap bertuliskan `No data`*.

**Node 2 tidak mengirim `vitals`.** Node 2 berbaterai dan hanya bangun setiap 300 detik untuk mengirim satu paket `telemetry` lewat Node 1; kontrak data memang tidak memberinya `vitals`. Jadi, untuk Node 2, pertanyaannya diganti: **"apakah ia bangun sesuai jadwal?"** Jadwal 300 detik berarti **12 paket per jam**. Jumlah itu sudah dihitung petugas otomatis di ringkasan `readings_per_jam` ([Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis)), jadi panel batangnya cukup membaca ringkasan itu ([3.1](#31-panel-batang-paket-node-2-per-jam-dengan-acuan-12-12-menit)):

```sql
SELECT p.jam AS "time", coalesce(d.nama, p.device_id) AS metric, p.jumlah_bacaan
FROM readings_per_jam p JOIN devices d ON d.device_id = p.device_id
WHERE $__timeFilter(p.jam) AND d.jenis = 'node2'
ORDER BY 1
```

Ambangnya 12: batang hijau berarti jadwalnya terpenuhi, batang oranye berarti ada paket yang tidak sampai, atau jamnya belum selesai. Di lab penulis, Kebun tiruan menyala 03.31 WIB dan dibiarkan dua jam penuh. Panelnya menggambar batang oranye `6` untuk jam 03.00 (jam pertama memang hanya setengah), lalu dua batang hijau `12` untuk jam 04.00 dan 05.00. Selama batangnya baru satu, label sumbunya hanya `2026`; label jam muncul begitu ada batang kedua. Pertanyaan kedua untuk Node 2, "sudah berapa menit ia terlambat dari jadwal bangunnya?", dijawab tabel menit terlambat, yang sekaligus menjadi kueri *alert* (Konsep 7).

**Kenapa bunyi praktik Silabus diperbarui.** Silabus semula meminta dashboard RSSI, *uptime*, dan *heap* "tiap node" serta *alert* "node offline > 5 menit". Untuk Node 2, keduanya tidak bisa dipenuhi: ia tidak mengirim `vitals`, ia memang diam 5 menit di antara dua paketnya, dan status `offline`-nya baru diterbitkan Node 1 sesudah 16 menit tanpa paket. Karena itu, bunyi praktiknya diperbarui (v1.0.27): RSSI, *uptime*, dan *heap* **Node 1**, jumlah paket per jam **Node 2**, dan *alert* "**node diam**" (Node 1: lebih dari 5 menit tanpa data; Node 2: lebih dari 5 menit melewati jadwal bangunnya). Syarat lulusnya tetap: Grafana mengabarimu saat baterai Node 2 dicabut.

Konsep ini dipakai di [2.2](#22-panel-rssi-kueri-sql-format-time-series-satuan-dbm-dan-ambang-12-menit)–[2.5](#25-no-data-dan-jam-yang-bergeser-vitals-tiap-5-menit-utc-di-kueri-wib-di-layar-5-menit) dan [3.1](#31-panel-batang-paket-node-2-per-jam-dengan-acuan-12-12-menit), lalu di [🧩 Tingkat 1](#tingkat-1--alert-kedua-sinyal-wifi-lemah-ubah-sedikit-20-menit), *alert* kedua untuk RSSI yang lemah.

> ⬆️ **Sudah membaca Konsep 4–6?** Lanjut ke [Praktik 2](#praktik-2--dashboard-kesehatan-sistem-rssi-uptime-heap-dan-variabel-node-50-menit), lalu [Praktik 3](#praktik-3--kebun-di-dashboard-teknis-paket-per-jam-dan-menit-terlambat-35-menit). Konsep 7 dibaca sebelum [Praktik 4](#praktik-4--alert-node-diam-dan-contact-point-telegram-55-menit).

### 7. *Alert* yang membangunkan orang hanya bila perlu: diam tidak sama dengan *offline*

Dashboard hanya berguna kalau ada yang melihatnya. *Alert* bekerja sebaliknya: ia memeriksa sendiri, lalu **membangunkan** orang lewat Telegram. *Alert* yang terlalu sering berbunyi akhirnya diabaikan, dan itulah alasan kabar backend Modul 19 dibuat [penting, cepat, dan tidak cerewet](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#9-notifikasi-telegram-penting-cepat-dan-tidak-cerewet). Aturan `Node diam` menjawab satu pertanyaan saja: **node mana yang berhenti mengirim data?** Ia mengabari saat sebuah node mulai diam (🔴) dan saat node itu mengirim lagi (✅).

**Petugas ronda tiap menit.** Bayangkan petugas ronda yang berkeliling setiap menit. Inilah yang dikerjakan Grafana untuk aturan itu, urut seperti formulir di menu **Alerting** (peringatan) → **Alert rules** (aturan peringatan) yang kamu isi di [4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit):

| Tahap | Setelan | Artinya |
| :--- | :--- | :--- |
| 1. Kueri | *evaluation group* (kelompok evaluasi) `kesehatan-node`, tiap `1m`; **Format** `Table` | tiap menit Grafana menjalankan satu kueri sebagai `grafana_baca`. Satu baris = satu node (*instance*); kolom teks `device_id` dan `node` menjadi labelnya |
| 2. Kondisi | `WHEN` **Last** `OF QUERY` **IS ABOVE** `5` | angka `menit_terlambat` setiap baris dibandingkan dengan 5 (Grafana menyusunnya sendiri menjadi A kueri → B *Reduce* → C *Threshold*) |
| 3. Keadaan | **Pending period** (masa tunggu) `None` | node langsung `Firing` (*alert*-nya berbunyi) pada evaluasi pertama yang melewati ambang. Bawaan formulir `1m` membuat kabarnya selalu terlambat semenit |
| 4. Kelompok & jeda | **Group by** `device_id`; `Group wait: 30s, Group interval: 5m, Repeat interval: 4h` | dijelaskan di bawah |
| 5. Kabar | *contact point* (alamat kabar) `Telegram Rumah Pintar` | bot Modul 19, ke chat pribadimu, dengan templat 🔴/✅ sendiri ([4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit)) |

**Kuerinya: berapa menit terlambat dari jadwal.** Kueri *alert* sama persis dengan tabel `Menit terlambat dari jadwal` di [3.2](#32--tabel-menit-terlambat-kueri-yang-sama-dengan-alert-ditambah-kolom-terakhir_dilihat-sementara-15-menit), jadi angka yang nanti membangunkanmu bisa kamu lihat lebih dulu di dashboard:

```sql
SELECT d.device_id, coalesce(d.nama, d.device_id) AS node,
       round((EXTRACT(EPOCH FROM now() - coalesce(r.diterima, d.terdaftar)) / 60
              - CASE WHEN d.jenis = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS menit_terlambat
FROM devices d
LEFT JOIN LATERAL (SELECT diterima FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
WHERE d.terdaftar IS NOT NULL AND d.dicabut IS NULL
```

- `LEFT JOIN LATERAL (… ORDER BY ts DESC LIMIT 1)` mengambil bacaan **terbaru** setiap perangkat, lalu memakai kolom `diterima`: jam backend saat bacaan itu tiba ([Modul 17 Konsep 9](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#9-waktu-timestamptz-utc-dan-wib)), bukan jam perangkat.
- Karena dimulai dari `devices` dengan `LEFT JOIN`, **setiap** perangkat terdaftar selalu punya satu baris, juga yang sudah mati. Perangkat yang belum pernah mengirim dihitung sejak didaftarkan (`coalesce(…, d.terdaftar)`).
- `- CASE WHEN d.jenis = 'node2' THEN 5 ELSE 0 END`: Node 2 memang diam 5 menit di antara dua paketnya, jadi 5 menit itu bukan keterlambatan. Angka negatif berarti paket berikutnya belum jatuh tempo.
- Jadi `> 5` berarti: Node 1 lebih dari 5 menit tanpa bacaan (±30 kiriman terlewat); Node 2 lebih dari 10 menit sejak paket terakhirnya.

Di lab penulis, tabel 3.2 sempat menulis `Latihan teras 32.9` (merah: perangkat latihan yang terdaftar tetapi tidak dijalankan), `Kebun (tiruan) -3.3` (paket berikutnya belum jatuh tempo), dan `Latihan ruang tamu 0.1`.

**Pengelompokan: 30 detik, 5 menit, 4 jam.** Sesudah sebuah node `Firing`, kabarnya tidak langsung dikirim. Dengan `device_id` di **Group by** (lewat **Override grouping**), setiap node punya kelompok sendiri: kabar Node 1 dan Kebun datang sebagai pesan terpisah dan tidak saling menunggu. Tiga jeda bawaannya sudah tertulis di formulir dan tidak perlu diubah ([4.4](#44-pengelompokan-kabar-group-wait-group-interval-dan-repeat-interval-8-menit)):

| Jeda | Artinya |
| :--- | :--- |
| *group wait* 30 detik | kabar pertama sebuah kelompok ditahan 30 detik, menunggu kabar sejenis. Di lab penulis, evaluasi 06.07.30 WIB menghasilkan 🔴 pukul 06.08.00 |
| *group interval* 5 menit | perubahan berikutnya di kelompok itu, termasuk ✅, dikirim pada detak 5 menit sejak kabar sebelumnya |
| *repeat interval* 4 jam | node yang masih diam diingatkan lagi setiap 4 jam (menurut dokumentasi; tidak ditunggu penulis) |

**Rumus waktu tunggu, untuk Praktik 5.** Untuk Node 2, `menit_terlambat` melewati 5 saat paket terakhirnya berumur 10 menit (jadwal 5 + ambang 5). Evaluasi berikutnya datang dalam 0–60 detik, lalu *group wait* 30 detik:

> 🔴 tiba = paket terakhir + 10 menit + (0–60 detik evaluasi) + 30 detik = **10,5–11,5 menit sesudah paket terakhir**

Baterai bisa tercabut kapan saja di antara dua paket, yaitu 0–5 menit sesudah paket terakhir. Maka 🔴 tiba **5,5–11,5 menit sesudah baterai dicabut**: paling cepat bila dicabut tepat sebelum paket berikutnya, paling lambat bila dicabut tepat sesudah sebuah paket. Untuk Node 1, yang mengirim tiap 10 detik, rumus yang sama memberi ±5,5–6,5 menit sesudah bacaan terakhir. Rentang dua larian lab penulis: Kebun dicabut tepat sesudah paket (di gambar: fase A) → 🔴 **10 min 52 s – 11 min 10 s**; dicabut tepat sebelum paket berikutnya (fase B) → **5 min 55 s – 6 min 20 s**; simulator Node 1 dihentikan dengan **Ctrl + C** → **5 min 46 s – 5 min 58 s**. Kabar ✅ Grafana menunggu detak *group interval* berikutnya, jadi tiba paling lama sekitar 5 menit sesudah evaluasi yang melihat node itu pulih; di lab penulis **3 min 22 s – 4 min 26 s** sesudah pulih. Gambar di bawah merangkum rantai, garis waktu Kebun, dan rumus ini; pesannya diambil dari larian yang berbeda dengan tabel pesan di bawah, jadi jam dan angkanya tidak sama.

![Diagram perjalanan satu alert dari kueri tiap menit sampai Telegram (Konsep 7), aturan Node diam; angka rekaman lab penulis, Kebun tiruan, Telegram tiruan. Lima tahap: 1 kueri tiap 1m, grup kesehatan-node, menit sejak bacaan terakhir (readings.diterima), Node 2 dikurangi 5 menit jadwal, Format Table = satu baris per node; 2 kondisi, di layar WHEN Last OF QUERY IS ABOVE 5 (YAML, History: A SQL, B Reduce, C Threshold), Pending period None, No data Normal, Error Error; 3 keadaan per node Normal lalu Firing, label device_id + node, Pending dilewati karena Pending period None; 4 Override grouping device_id, Group wait 30s, Group interval 5m, Repeat interval 4h; 5 contact point Telegram Rumah Pintar (bot Modul 19, Parse Mode None, templat sendiri, HTTPS). Pesan persis dari satu larian saat Kebun dicabut lalu dipasang: 🔴 Kebun (tiruan) (f00d000000b2) tidak mengirim data, terlambat 5.5 menit dari jadwalnya (Grafana, 10 min 52 s sesudah dicabut); 📴 f00d000000b2 offline sejak 00.17 WIB (backend, 17 menit sesudah paket terakhir); ✅ f00d000000b2 online lagi (offline 1 menit) (backend, seketika); ✅ Kebun (tiruan) kembali mengirim data. (Grafana, 3 min 49 s sesudah dipasang). Garis waktu 0–18 menit sesudah paket terakhir: paket di 0, paket tiap 300 s tidak datang lagi; terlambat 5 menit dari jadwal di menit 10; 🔴 tiba antara 10,5 dan 11,5; status offline di 16 (960 s, oleh Node 1); 📴 backend di 17. Fase A dicabut 6,8–8,9 s sesudah paket: 🔴 10 min 52 s – 11 min 10 s sesudah dicabut; fase B dicabut 6,3–6,7 s sebelum paket berikutnya: 🔴 5 min 55 s – 6 min 20 s. Rumus: paket terakhir + 10 menit + 0–60 s evaluasi + 30 s group wait; baterai dicabut 0–5 menit sesudah paket, jadi 🔴 tiba 5,5–11,5 menit sesudah dicabut. Tabel siapa mengabari apa, rentang dua larian lab penulis: Node 1 (simulator dimatikan): Grafana 🔴 data berhenti datang 5 min 46 s – 5 min 58 s, backend 📴 sambungan putus ±1 menit (wasiat + 60 s), pulih backend seketika, Grafana +3 min 22 s – 4 min 26 s; Node 2 (Kebun dicabut): Grafana 5 min 55 s – 11 min 10 s, backend ±17 menit sesudah paket terakhir (960 s + 60 s), pulih Grafana +3 min 38 s – 4 min 14 s (paling lama ±5 menit); dua pesan disengaja. Tiga jebakan: database mati, pesan tanpa nama node: aturan Error (DatasourceError), pesan tanpa nama node (tertulis no value dalam kurung siku), lalu ✅ kembali mengirim data tanpa nama; di lab dengan grup 1m, DB mati 76 sampai 80 detik, node yang sedang Firing tetap Firing, tanpa ✅ palsu; ✅ palsu hanya teramati di riset dengan evaluasi tiap 10 detik, DB mati 2 menit atau lebih belum diuji; backend mati: semua node 🔴 sekaligus, pengawas backend Modul 30; diam tidak sama dengan status offline: saat status offline Kebun terbit, kueri alert terlambat 11 menit padahal terakhir_dilihat 0 menit lalu, jadi alert memakai readings.diterima.](aset/perjalanan-alert.png)

**Diam tidak sama dengan *offline*.** Kenapa tidak memakai status `offline` saja? Karena dua kata itu menjawab pertanyaan berbeda:

- **Status `offline`** adalah kabar resmi bahwa sambungan putus: wasiat MQTT Node 1, atau pesan Node 1 tentang Node 2 sesudah 960 detik tanpa paket. Inilah yang dipakai backend untuk 📴, lencana di Daftar, dan warna penanda Peta.
- **Diam** berarti tidak ada bacaan baru di `readings`. Inilah yang diukur Grafana.

Sebuah perangkat bisa berstatus `online` padahal diam. Di lab penulis, saat simulator `f00d00000001` dihentikan, Kebun yang paketnya diterbitkan simulator itu ikut diam 11 menit dan sudah dikabari 🔴 Grafana, tetapi statusnya tetap `online`: penghubungnya mati, jadi tidak ada yang menerbitkan status Kebun. Selama itu backend tidak mengirim 📴 untuk Kebun, dan penandanya di Peta tetap hijau ([7.4](#74--uji-peta-atribusi-status-live-akun-viewer-hp-375-px-dan-mode-gelap-10-menit)). Node 2 sungguhan mengalami hal yang sama kalau Node 1 mati.

Kolom `devices.terakhir_dilihat` juga bukan "data terakhir": backend memajukannya untuk setiap pesan perangkat itu, termasuk pesan status, wasiat, dan status *retained* sesudah backend dimulai ulang. Tepat saat status `offline` Kebun terbit, penulis menjalankan kueri tabel 3.2 ditambah kolom sementara `terakhir_dilihat`, sebagai `grafana_baca` di psql:

```text
  device_id   |        node        | menit_terlambat |       terakhir_dilihat        | menit_sejak_terakhir_dilihat 
--------------+--------------------+-----------------+-------------------------------+------------------------------
 f00d00000001 | Latihan ruang tamu |               0 | 2026-10-26 23:34:38.965184+00 |                            0
 f00d000000b2 | Kebun (tiruan)     |              11 | 2026-10-26 23:34:41.376101+00 |                            0
(2 rows)
```

Kebun sudah 16 menit tanpa paket (`menit_terlambat` 11), tetapi `terakhir_dilihat`-nya "0 menit yang lalu": itu jam pesan status `offline` itu sendiri (psql mencetak UTC; 23.34.41 UTC = 06.34.41 WIB). Kolom itu dibiarkan apa adanya di modul ini; Grafana, *alert*, dan laporan memakai `readings.diterima`, dan perbaikannya dicatat untuk Modul 28 dan 30.

**Bukan "data basi" Modul 23.** [Modul 23](../modul-23-dashboard-realtime/README.md#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi) sudah memberi penanda `· data basi` per jenis perangkat: 30 detik untuk Node 1, 16 menit untuk Node 2. Itu **label di layar**: murah, boleh cepat muncul, tetapi hanya ada selama layarnya terbuka. *Alert* **membangunkan orang**, jadi ambangnya sengaja lebih sabar untuk Node 1 (5 menit), dan untuk Node 2 justru jauh lebih cepat daripada 16 menit, karena dihitung dari jadwal bangunnya, bukan dari status `offline`.

**Jebakan "No data" dan *MissingSeries*.** Cara yang tampak lebih sederhana, "kabari kalau kueri bacaan 5 menit terakhir kosong", gagal diam-diam. Node yang mati tidak muncul sebagai baris; bagi Grafana barisnya **hilang** (*missing series*), dan instans yang hilang dianggap **selesai** sesudah 2 evaluasi (`Normal (Missingseries)`). Di riset penulis, dengan pola itu aturannya kembali `Normal` begitu Node 1 mengirim lagi, dan Node 2 yang masih mati tidak dilaporkan; kabar "No Data"-nya pun datang tanpa nama node. Kueri kita mencegah keduanya, karena node yang mati tetap punya baris dengan angka yang terus membesar. Itulah sebabnya **No Data** di formulir diganti **Normal** ([4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit)): hasil kosong hanya terjadi bila tidak ada perangkat terdaftar. Baris tetap bisa hilang dengan satu cara: kunci perangkat dicabut saat aturan sudah aktif. Di lab uji kode penulis, `Latihan teras` yang sedang 🔴 lalu dicabut kuncinya hilang dari kueri dan dikabari `✅ Latihan teras kembali mengirim data.`, padahal perangkat itu tidak pernah mengirim apa pun. Maka perangkat yang tidak dijalankan dicabut kuncinya **sebelum** aturan dibuat ([4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit)).

**Siapa mengabari apa.** Backend Modul 19 sudah mengirim kabar 📴/✅ ([6.8 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#68-uji-pesan-offline-tunggu-60-detik)), dan modul ini tidak mengubahnya, selain menambal 📴 palsu sesudah broker dimulai ulang ([6.3](#63-mqttts-tidak-lagi-mengirim-kabar-offline-palsu-lalu-npm-run-cek-dan-npm-test-10-menit)). Jadi, satu kejadian bisa menghasilkan dua pesan, dari bot yang sama ke chat yang sama. Itu disengaja, karena keduanya menjawab pertanyaan berbeda untuk penonton berbeda:

| | Backend (Modul 19) | Grafana (modul ini) |
| :--- | :--- | :--- |
| Pertanyaannya | sambungan perangkat putus? | data berhenti datang? |
| Dibaca dari | status `offline` (wasiat, atau Node 1 untuk Node 2) | `readings.diterima` |
| Pesannya | `📴 <id> offline sejak HH.MM WIB`, lalu `✅ <id> online lagi (offline N menit)` | `🔴 <nama> (<id>) tidak mengirim data, terlambat N menit dari jadwalnya`, lalu `✅ <nama> kembali mengirim data.` |
| Node 1 mati | wasiat + 60 detik (±1 menit) | ±5,5–6,5 menit |
| Node 2 mati | ±17 menit sesudah paket terakhir (960 + 60 detik) | 5,5–11,5 menit sesudah dicabut |
| Pulih | seketika | pada detak *group interval*, paling lama ±5 menit |
| Tidak melihat | node yang `online` tetapi diam; status yang terbit selagi backend mati | backend yang mati (semua node tampak diam, lihat risiko 2) |
| Untuk | penghuni | tim teknis |

Ini pesan yang diterima server Telegram tiruan di lab penulis saat Kebun dicabut sesaat sesudah sebuah paket (`kebun cabut` 06.18.49 WIB, `kebun pasang` 06.35.46 WIB):

| Jam WIB | Dari | Pesan |
| :--- | :--- | :--- |
| 06.30.00 | Grafana | `🔴 Kebun (tiruan) (f00d000000b2) tidak mengirim data, terlambat 5.8 menit dari jadwalnya` |
| 06.35.41 | backend | `📴 f00d000000b2 offline sejak 06.34 WIB` |
| 06.35.46 | backend | `✅ f00d000000b2 online lagi (offline 1 menit)` |
| 06.40.00 | Grafana | `✅ Kebun (tiruan) kembali mengirim data.` |

Grafana mengabari 🔴 lebih dari 5 menit lebih awal; backend mengabari pulihnya lebih cepat. Pembagian ini adalah versi kecil matriks "siapa mengawasi apa" di [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data): backend untuk aturan rumah dan perangkat *offline*, Grafana untuk metrik teknis, dan pengawas layanan untuk backend itu sendiri.

**Lima risiko yang perlu kamu tahu sebelum memercayai *alert* ini.**

1. **Format `Table` berjalan, walau dokumentasi berkata lain.** Dokumentasi *alert* PostgreSQL Grafana menulis `Table formatted queries aren't supported`, tetapi di Grafana 13.2.4 format `Table` terbukti berjalan di semua lab penulis, satu baris satu node. Rilis kelak bisa mengikuti dokumentasinya, dan cadangan berformat Time series belum terbukti ([🔬](#-bedah-teknis-opsional) *Tiga setelan tambahan …*). Itu satu lagi alasan versinya dikunci.
2. **Backend mati → semua node 🔴.** `readings` diisi backend; saat backend berhenti, tidak ada bacaan baru, jadi semua node tampak diam. Di lab penulis, proses backend dibekukan (dijeda) 18 menit: Grafana mengabari 🔴 untuk Node 1 dan Kebun, padahal keduanya tetap mengirim, statusnya tetap `online`, Peta tetap hijau, dan tidak ada 📴. Pengawas untuk backend sendiri baru dipasang di Modul 30.
3. **Database mati → pesan tanpa nama node.** Grafana gagal menjalankan kuerinya, aturannya menjadi `Error` (`DatasourceError`), dan pesannya datang tanpa label: `🔴 [no value] ([no value]) tidak mengirim data, terlambat  menit dari jadwalnya`, lalu 5 menit kemudian `✅  kembali mengirim data.` (dua spasi, tanpa nama). Di lab penulis, database mati ±80 detik saat Node 1 sedang 🔴, dan Node 1 tetap `Firing`, tidak ikut dikabari pulih; database mati 2 menit atau lebih tidak diuji. Pegangannya: pesan tanpa nama node berarti masalah database atau Grafana, bukan node.
4. **Perangkat terdaftar yang tidak dijalankan langsung 🔴.** Di lab uji kode penulis, `Latihan teras` dikabari 🔴 `terlambat 12.5 menit` begitu aturannya disimpan. Cabut dulu kuncinya di [4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit). Di jalur laptop, **jangan** mencabut `f00d00000001`: simulator itu juga penghubung Kebun.
5. **Titik desimal.** Pesan menulis `5.8`, bukan `5,8`: itu cara Grafana menulis angka, dan modul ini mengutipnya apa adanya.

Satu batas lagi dari Konsep 2: Grafana dan *alert*-nya hanya bekerja selama laptop menyala.

Konsep ini dipakai di [3.2](#32--tabel-menit-terlambat-kueri-yang-sama-dengan-alert-ditambah-kolom-terakhir_dilihat-sementara-15-menit), [4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit)–[4.5](#45-status-per-node-di-tab-instances-normal-dan-firing-7-menit), [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit)–[5.4](#54--pasang-lagi-dua-kabar-pulih-dan-lembar-catatan-waktunya-10-menit), dan [7.4](#74--uji-peta-atribusi-status-live-akun-viewer-hp-375-px-dan-mode-gelap-10-menit). Gejala yang berkaitan dikumpulkan di kelompok ***Alert* dan Telegram** di [🚨](#-kalau-tidak-jalan).

> ⬆️ **Sudah membaca Konsep 7?** Lanjut ke [Praktik 4](#praktik-4--alert-node-diam-dan-contact-point-telegram-55-menit), lalu [Praktik 5](#praktik-5--cabut-baterai-kebun-alert-dan-pulih-45-menit). Simpan [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi) untuk waktu menunggu di [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit).

### 8. Peta: koordinat, ubin, dan atribusi

Silabus meminta peta perangkat dengan Leaflet dan OpenStreetMap, dari kolom `lat` dan `lng` di tabel `devices`. Kolom itu [disiapkan sejak Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#3-tabel-baris-kolom-tipe-dan-kunci-utama) dan sampai minggu lalu belum pernah tampil di layar mana pun. Halaman **Peta** di dashboard 1.1.0 menggambar setiap perangkat yang punya titik sebagai lingkaran berwarna di atas peta jalan. Ada tiga hal yang perlu kamu pahami sebelum membuatnya: cara menulis titik, dari mana gambar petanya datang, dan aturan pakai gambar itu.

**Koordinat: dua angka desimal dengan titik.** Sebuah titik di Bumi ditulis sebagai **lintang** (*latitude*, `lat`) dan **bujur** (*longitude*, `lng`), dalam derajat desimal. Lintang −90 sampai 90 (negatif = selatan khatulistiwa), bujur −180 sampai 180 (positif = timur Greenwich). Jakarta ada di sekitar lintang `-6.2` dan bujur `106.8`. Pemisah desimalnya selalu **titik**, bukan koma seperti angka sehari-hari kita: `-6,2` di JSON bukan angka (Konsep 9). Rentang itu sudah dijaga database sejak Modul 17 (`CHECK (lat BETWEEN -90 AND 90)`).

**Ubin: peta dari potongan gambar.** Peta jalan tidak dikirim sebagai satu gambar raksasa. Ia dipotong-potong menjadi **ubin** (*tile*), gambar persegi 256 × 256 px, dan browser hanya mengunduh ubin yang sedang terlihat. Alamat ubin OpenStreetMap (OSM) yang resmi:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

`{z}` adalah tingkat *zoom*: 0 berarti seluruh dunia dalam satu ubin, dan setiap tingkat membelah ubin menjadi empat; ubin OSM tersedia sampai *zoom* 19, ketika satu ubin hanya selebar beberapa puluh meter. `{x}` dan `{y}` adalah nomor kolom dan baris ubin pada tingkat itu. Leaflet menghitung sendiri ubin mana yang perlu diminta. Ubin diunduh **browser langsung dari server OSM**, tidak lewat backend, jadi halaman Peta butuh internet. Di lab uji kode, saat ubin diblokir (meniru laptop tanpa internet), kotak peta menjadi petak-petak abu-abu, tetapi lingkaran perangkat dan atribusinya tetap tergambar.

**Server ubin OSM gratis, dengan aturan.** Server itu dikelola OpenStreetMap Foundation. [Kebijakan ubinnya](https://operations.osmfoundation.org/policies/tiles/) (dibaca 26 Okt 2026) meminta beberapa hal, dan modul ini mematuhinya:

| Aturan OSM | Di dashboard kita |
| :--- | :--- |
| pakai alamat resmi di atas: `https://`, tanpa `{s}.` (alamat lama `a.`/`b.`/`c.tile…` bisa lambat atau ditutup) | konstanta `PETA.ubin` di `src/peta.ts` |
| atribusi OSM **terlihat jelas** di peta, tidak disembunyikan di balik tombol | ditampilkan Leaflet di pojok kanan bawah |
| dilarang unduh massal, fitur *prefetch* (mengunduh di muka), dan pemakaian luring | hanya ubin yang terlihat; tidak ada yang disimpan |
| tanpa jaminan (*no SLA*): akses bisa diblokir tanpa pemberitahuan bila pemakaiannya merugikan | satu rumah dengan dua atau tiga titik jauh di bawah "pemakaian berat" |
| *Avoid hard-coding the tile URL*: jangan tanam alamat ubin di banyak tempat | alamat dan atribusi hanya di satu berkas, `src/peta.ts` |

**Atribusi: baris kredit yang wajib.** Data peta OSM dikumpulkan para kontributornya (karena itu tulisannya *contributors*), dan kebijakan ubin mewajibkan kredit lisensinya terlihat. Di lab penulis (*build* produksi, ubin OSM sungguhan), pojok kanan bawah peta bertuliskan:

```text
 Leaflet | © OpenStreetMap contributors
```

Bagian kanan datang dari `PETA.atribusi`, lengkap dengan tautan ke halaman hak cipta OSM. Bagian kiri (tautan `Leaflet` dan sebuah bendera kecil) adalah awalan bawaan Leaflet 1.9.4; kita membiarkannya apa adanya.

**Penanda: lingkaran, bukan ikon.** Leaflet punya dua cara umum menandai titik. Ikon jarum bawaan (`Marker`) adalah berkas gambar. Di lab riset penulis, ikon itu tampil di `npm run dev`, tetapi **hilang sesudah `npm run build`** karena Vite mengubah alamat berkas gambarnya, dan resep perbaikan yang hanya memakai `mergeOptions` justru merusak mode dev. Kita memakai **`CircleMarker`**: lingkaran yang digambar sebagai SVG, tanpa berkas gambar apa pun, dan warnanya bisa membawa status. Di lab penulis, *build* produksi menggambar 3 lingkaran dan 0 ikon.

![Diagram peta perangkat: titik dari database, warna dari status live (Konsep 8–9). Atas, empat kartu berpanah: tabel devices, kolom lat, lng sejak Modul 17 (contoh f00d00000001 -6.1754, 106.8272; f00d00000002 -6.17532, 106.82705; f00d000000b2 -6.17548, 106.82735; titik fiktif sekitar Monas); backend 1.2, GET /devices membawa lat, lng untuk admin dan viewer, PUT /devices/:id/lokasi admin saja; toko frontend Zustand, GET /devices diambil ulang setiap Peta dibuka, status live dari Socket.IO tanpa polling; layar /peta, menu Peta, satu lingkaran per perangkat bertitik. Ilustrasi layar Peta, bukan tangkapan layar: ubin 256 px, tombol zoom, dua lingkaran hijau dan satu abu-abu (f00d00000002, tidak dijalankan), popup Latihan ruang tamu, ruang tamu · f00d00000001, Online, terakhir dilihat 12 detik yang lalu, Buka detail; atribusi Leaflet | © OpenStreetMap contributors. Keterangan: hijau online, abu-abu tidak online atau kirimannya diabaikan backend; tinggi h-96 = 384 px. Catatan: ubin dari https://tile.openstreetmap.org/{z}/{x}/{y}.png, butuh internet, jangan diunduh massal atau untuk luring, zoom paling dekat 19; atribusi wajib terlihat; CircleMarker, bukan ikon Marker yang hilang sesudah npm run build, hijau #15803d, abu-abu #64748b; diam tidak sama dengan status: Kebun yang dicabut tetap hijau sampai status offline terbit (16 menit), alert Node diam lebih cepat. Lisensi Leaflet BSD-2, react-leaflet Hippocratic-2.1 (bukan lisensi OSI). Bawah, admin mengatur titik lewat Bruno atur lokasi perangkat: PUT /devices/f00d00000001/lokasi dengan lat -6.1754, lng 106.8272; log tanpa koordinat: titik f00d00000001 di peta diatur oleh akun 1; berkas Bruno memakai a4cf12e5b7c0 (Node 1), jalur laptop: ganti dengan f00d00000001. Jawaban: 200 admin; 403 viewer, akun viewer hanya boleh melihat; perintah dan perubahan khusus admin; 400 teks -6,2, body/lat harus angka dengan titik desimal; 400 angka 91, body/lat lintang paling besar 90; 404 f00d0000ffff tidak ada di daftar perangkat; 200 lat dan lng null, titik dihapus. Kotak jingga: koordinat rumah = data pribadi; samarkan sebelum tangkapan layar atau video dibagikan.](aset/peta-dari-database.png)

**Dua warna saja: hijau dan abu-abu.** Pertanyaan peta adalah "mana yang sehat?". **Hijau** (`#15803d`) berarti perangkat `online` dan kirimannya diterima backend. **Abu-abu** (`#64748b`) berarti semua yang lain: `offline`, mode offline, belum diketahui, atau kuncinya dicabut atau belum terdaftar ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#72-lapis-pertama-cabut-di-backend-5-menit)), sehingga kirimannya diabaikan backend. Ini sengaja berbeda dari lencana `Offline` merah di kartu Daftar ([Modul 23](../modul-23-dashboard-realtime/README.md#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi)), yang menjawab "masih tersambung atau tidak". Warna tidak pernah sendirian: keterangan di bawah peta menulis `online` dan `tidak online, atau kirimannya diabaikan backend`, dan *popup* setiap penanda (kotak keterangan saat lingkaran diklik) menulis nama, lokasi, status, dan "terakhir dilihat". Warnanya mengikuti status *live* dari Socket.IO, tanpa *polling*. Di lab penulis, sesudah **Ctrl + C** di terminal simulator, penanda `f00d00000001` berganti abu-abu ±0,7 detik kemudian tanpa muat ulang. Namun, **Kebun tetap hijau**: ia ikut diam karena penghubungnya mati, Grafana mengirim 🔴 untuknya ±11 menit sesudah paket terakhirnya, dan statusnya di database tetap `online`. Peta menampilkan **status**, bukan "masih mengirim data atau tidak" ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)). Di mode gelap, *popup* ikut gelap, tetapi ubin tetap terang: warna ubin tidak kita balik.

**Dua pustaka, dua lisensi.** **Leaflet 1.9.4** adalah penggambar petanya (lisensi BSD-2-Clause, sumber terbuka yang longgar). Leaflet 2.0 masih *alpha*, dan react-leaflet 5 belum mendukungnya. **react-leaflet 5.0.0** membungkus Leaflet menjadi komponen React (`MapContainer`, `TileLayer`, `CircleMarker`, `Popup`), dan Silabus menyebutnya sebagai alat modul ini. Lisensi react-leaflet dan pustaka intinya, `@react-leaflet/core`, adalah **Hippocratic License 2.1**: boleh dipakai gratis, tetapi dengan syarat tambahan, yaitu tidak dipakai untuk melanggar hak asasi manusia (teks lisensinya merujuk Deklarasi Universal HAM PBB). Lisensi bersyarat seperti ini tidak termasuk daftar lisensi sumber terbuka yang diakui OSI (*Open Source Initiative*). Modul ini tetap memakainya karena Silabus menyebutnya, dan menuliskannya terang supaya kamu bisa menimbang sendiri. Ini bukan nasihat hukum: kalau kelak kamu membuat produk, bacalah lisensinya. Kalau ingin tanpa pembungkus, Leaflet polos (BSD-2) bisa dipasang langsung di komponen React ([🔬](#-bedah-teknis-opsional) *Leaflet tanpa pembungkus …*).

**Koordinat rumah adalah data pribadi.** Titik rumahmu memberi tahu siapa pun di mana kamu tinggal, dan tangkapan layar peta yang diunggah membawa titik itu. Semua contoh di modul ini memakai titik **fiktif di sekitar Monas, Jakarta** (tempat umum): `f00d00000001` di `-6.1754, 106.8272`, `f00d00000002` di `-6.17532, 106.82705`, dan Kebun `f00d000000b2` di `-6.17548, 106.82735`. Kalau kamu memakai titik sungguhan, bulatkan atau samarkan sebelum tangkapan layar dan video Checkpoint dibagikan ([10.2](#102-video-demo-hp-6090-detik-naskah-dan-yang-tidak-boleh-terekam-15-menit)).

**Jujur soal manfaatnya.** Untuk satu rumah, titik-titiknya hanya berjarak beberapa meter, sehingga peta *zoom* 18 terasa hampir kosong. Peta baru benar-benar berguna saat perangkat **tersebar**: kebun di lahan lain, armada perangkat di Modul 28, atau proyek akhir Modul 31 seperti pertanian pintar dan pelacak aset GPS. Kerangkanya sama: titik di database, peta di browser.

Rinciannya di [7.2](#72-petats-dan-petaperangkattsx-ubin-atribusi-dan-penanda-berwarna-status-22-menit) (`peta.ts`, `PetaPerangkat.tsx`), [7.3](#73-petatsx-rute-peta-bagi-admin-dan-viewer-lalu-menu-peta-10-menit) (rute dan menu), dan [7.4](#74--uji-peta-atribusi-status-live-akun-viewer-hp-375-px-dan-mode-gelap-10-menit) (uji). Peta di dalam Grafana sendiri (Geomap) dibahas di [🔬](#-bedah-teknis-opsional) *Geomap Grafana lawan react-leaflet*; peta abu-abu, setinggi nol, atau tanpa penanda ada di [🚨](#-kalau-tidak-jalan).

> ⬆️ **Sudah membaca Konsep 8?** Kalau kamu membacanya sambil menunggu, kembali ke [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit). Peta baru dibuat di [Praktik 7](#praktik-7--halaman-peta-dengan-react-leaflet-60-menit), sesudah backend mengirim titiknya di [Praktik 6](#praktik-6--backend-12-lokasi-perangkat-lewat-api-45-menit) (Konsep 9).

### 9. Lokasi adalah data perangkat: API, bukan tempelan di layar

Cara tercepat menaruh titik di peta adalah menuliskannya di kode frontend, misalnya `{ f00d00000001: [-6.1754, 106.8272] }`. Cara itu cepat rusak: setiap titik yang dipindah berarti menyunting kode dan *build* ulang, perangkat baru tidak muncul sendiri, dan hanya layar itu yang tahu titiknya. Titik adalah **data perangkat**, sama seperti `nama` dan `lokasi` ("ruang tamu"). Tempatnya di baris perangkat itu di tabel `devices`, dengan kolom yang sudah ada sejak Modul 17:

```sql
  lat              double precision CHECK (lat BETWEEN -90 AND 90),
  lng              double precision CHECK (lng BETWEEN -180 AND 180),
```

Dari situ semua pembaca mengambil titik yang sama: dashboard admin dan viewer, di laptop atau HP, bahkan Grafana (`grafana_baca` boleh membaca kolom `lat` dan `lng`, Konsep 3). Satu sumber kebenaran, diisi lewat satu pintu.

**Yang belum ada di backend 1.1.** `GET /devices` belum mengirim `lat` dan `lng` (keduanya tidak ada di daftar kolom `KOLOM` di `db/perangkat.ts`), dan belum ada rute untuk mengisinya. Satu-satunya kode proyek yang pernah menulis kedua kolom itu adalah `npm run isi-riwayat` (Modul 17), yang memberi dua perangkat latihan titik yang **sama persis**, `-6.2, 106.8`: dua penanda akan bertumpuk. Backend **1.2.0** menambah dua hal:

| Perubahan | Untuk | Isinya |
| :--- | :--- | :--- |
| `GET /devices` membawa `lat` dan `lng` | admin dan viewer | angka derajat desimal, atau `null` bila belum diisi |
| rute baru `PUT /devices/:id/lokasi` | admin saja | `{ "lat": -6.1754, "lng": 106.8272 }` |

**Dua penjaga yang sudah kamu kenal.** [Satpam peran Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#6-satpam-di-setiap-pintu-peran-admin-dan-viewer) sudah menolak viewer untuk semua permintaan selain baca, jadi rute ini tidak butuh kode satpam baru; `PUT` juga sudah ada di daftar metode CORS backend. Isinya diperiksa skema Zod `Lokasi` ([Modul 24 Konsep 8](../modul-24-kendali-aturan-peran/README.md#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend)): angka dengan titik desimal, rentang sama dengan `CHECK` database, bukan `NaN`/`Infinity`, dan **berpasangan**, karena setengah titik tidak bisa digambar. `{ "lat": null, "lng": null }` menghapus titiknya. Kolom lain, termasuk teks `lokasi`, ditolak: rute ini hanya memindahkan titik. Jawabannya di lab penulis (`PUT /devices/f00d00000001/lokasi`):

| Isi | Jawaban |
| :--- | :--- |
| admin, `{"lat": -6.1754, "lng": 106.8272}` | `200`, perangkat dengan titik barunya |
| viewer, isi sama | `403` `akun viewer hanya boleh melihat; perintah dan perubahan khusus admin` |
| `{"lat": "-6,2", …}` | `400` `body/lat harus angka dengan titik desimal, misalnya -6.1754 (bukan teks "-6,1754")` |
| `{"lat": 91, …}` | `400` `body/lat lintang paling besar 90` |
| `PUT /devices/f00d0000ffff/lokasi` | `404` `f00d0000ffff tidak ada di daftar perangkat` |
| `{"lat": null, "lng": null}` | `200`, titiknya dihapus |

Log backend mencatat siapa yang memindah, **tanpa** koordinatnya (data pribadi, Konsep 8): `titik f00d00000001 di peta diatur oleh akun 1`.

**Titik tidak ikut *live*.** Socket.IO hanya membawa telemetri, status, dan kejadian. Titik jarang berubah, jadi halaman Peta cukup mengambil ulang `GET /devices` **setiap kali dibuka**. Di lab uji kode, titik yang diubah lewat API saat Peta sedang terbuka tidak bergerak; sesudah pindah ke menu **Perangkat** lalu kembali ke **Peta**, penandanya pindah tanpa **F5**. Kalau pengambilan ulang itu gagal, peta tetap menampilkan titik lama ditambah *toast* `Daftar perangkat gagal dimuat ulang: titik di peta mungkin belum yang terbaru.` Diagram di Konsep 8 menggambar alur lengkapnya: kolom → `GET /devices` → [toko Zustand](../modul-23-dashboard-realtime/README.md#4-satu-toko-untuk-semua-layar-zustand-dan-selektor) → `/peta`, dengan `PUT` dari Bruno di bawahnya.

**Kenapa 1.2.0, dan tanpa migrasi.** Kolomnya sudah ada, jadi tidak ada migrasi baru. Nomor versi di kurikulum ini terdiri atas tiga angka, MAJOR.MINOR.PATCH (pola SemVer, dibahas tuntas di Modul 29): PATCH untuk perbaikan tanpa fitur baru (1.1.0 → 1.1.1), MINOR untuk fitur baru yang tidak merusak pemakai lama (1.1.0 → 1.2.0), MAJOR untuk perubahan yang memaksa pemakai lama ikut berubah (2.0.0). Titik peta dan laporan harian adalah fitur baru; kolom tambahan dan rute baru tidak merusak pemakai lama (di lab uji kode, `cek-skema` dashboard 1.0.0 lawan backend 1.2 tetap `SAMA`). Maka backend naik MINOR ke **1.2.0**, dan dashboard dengan halaman Peta ke **1.1.0**.

Rinciannya di [6.1](#61-lat-dan-lng-ikut-get-devices-dbperangkatts-dan-skema-perangkat-10-menit), [6.2](#62-skema-lokasi-dan-rute-admin-put-devicesidlokasi-15-menit), dan [6.4](#64--versi-120-docs-dan-bruno-atur-lokasi-perangkat-200-403-400-10-menit); titik yang pindah sesudah Peta dibuka lagi kamu uji di [7.4](#74--uji-peta-atribusi-status-live-akun-viewer-hp-375-px-dan-mode-gelap-10-menit). Jawaban `400`/`403`/`404` yang membingungkan ada di [🚨](#-kalau-tidak-jalan). Memindah titik dengan menggeser penandanya langsung di peta adalah [🧩 Tingkat 2](#tingkat-2--pindahkan-titik-perangkat-langsung-di-peta-isi-bagian-rumpang-45-menit).

> ⬆️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 6](#praktik-6--backend-12-lokasi-perangkat-lewat-api-45-menit), lalu [Praktik 7](#praktik-7--halaman-peta-dengan-react-leaflet-60-menit).

### 10. Laporan harian: datang sendiri setiap pagi, selama backend menyala

Kabar 📴 dari backend (Modul 19) dan 🔴 dari Grafana (Konsep 7) membangunkanmu saat ada masalah **sekarang**. Yang belum ada adalah ringkasan yang bisa disimpan: kemarin suhunya berapa, berapa bacaan masuk, seberapa lemah sinyal terburuknya, berapa kali perangkat terputus. Laporan harian modul ini adalah "koran pagi" rumahmu: berkas CSV yang dikirim backend ke Telegram pukul 07.00 WIB, tanpa kamu membuka dashboard.

**Siapa yang membunyikan beker?**

| Pilihan | Dipakai? |
| :--- | :--- |
| node-cron di backend (`services/laporan.ts`) | **ya**: node-cron 4.6.0 sudah ada sejak [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#8-penjadwalan-jam-beker-untuk-server), dan backend sudah memegang database serta bot Telegram; tanpa paket baru |
| penjadwal sistem operasi (cron, *systemd timer*, Task Scheduler) yang menjalankan skrip | tidak: skripnya butuh akses database dan token sendiri, dan resepnya berbeda per OS; penjadwal OS milik Modul 30 |
| aturan jadwal backend (Modul 19, 24) | tidak: aksinya hanya perintah ke perangkat, dan laporan bukan perintah |

**"Kemarin" menurut jam WIB, dihitung dari jam jadwal.** Laporan pukul 07.00 WIB tanggal 27 berisi tanggal 26, pukul 00.00 sampai 24.00 WIB. Database menyimpan UTC, dan WIB tidak punya jam musim panas, jadi 00.00 WIB selalu 17.00 UTC hari sebelumnya. Di lab penulis, laporan kemarin yang diminta 27 Okt pukul 04.08 WIB menjawab `"berkas":"laporan-2026-10-26.csv","dari":"2026-10-25T17:00:00Z","sampai":"2026-10-26T17:00:00Z"`. `rentangLaporan()` mencari tanggal WIB lewat `Intl`, bukan dari zona laptop: laptop penulis memakai WITA, dan tesnya sengaja dijalankan dengan zona New York. Patokannya jam **jadwal**, bukan jam saat fungsi berjalan, jadi jadwal 23.50 yang baru berjalan 00.01 (laptop baru bangun) tetap melaporkan hari yang benar. Jadwalnya diberi `timezone: "Asia/Jakarta"`; tanpa itu, `0 7 * * *` berarti 07.00 menurut jam laptop (di laptop WITA: 06.00 WIB). Hitungan yang sama sudah kamu coba di SQL pada [🔁 Langkah 3](#langkah-3--kemarin-menurut-jam-wib-date_trunc-dan-at-time-zone).

![Diagram laporan harian: datang sendiri setiap pagi, selama backend menyala (Konsep 10); services/laporan.ts, LAPORAN_JADWAL bawaan 0 7 * * * WIB. Langkah: 1 jadwal 07.00 WIB, node-cron di backend, timezone Asia/Jakarta (laptop WITA pun 07.00 WIB), cron 5 bidang (6 bidang ditolak), log laporan harian berjalan sesuai jadwal; 2 rentang kemarin 00.00–24.00 WIB, dari 2026-10-25T17:00:00Z sampai 2026-10-26T17:00:00Z = isi 26 Okt, dikirim pagi 27 Okt; 3 satu kueri untuk semua perangkat terdaftar yang belum dicabut: readings_per_jam (jumlah bacaan, suhu, kelembapan, tanah), device_health (RSSI, heap, menyala ulang), events (kali terputus); 4 CSV resep Modul 23 di server, contoh baris f00d00000001 Latihan ruang tamu node1 363 bacaan dan f00d000000b2 Kebun (tiruan) node2 dengan vitals kosong; BOM EF BB BF, titik koma, koma desimal, CRLF, 15 kolom, nama berkas laporan-2026-10-26.csv; 5 kirimBerkas() di telegram.ts, sendDocument + InputFile(Buffer, nama), bot yang sama; jebakan InputFile dengan teks = jalur berkas. Telegram (ungu): laporan-2026-10-26.csv, 326 byte, keterangan 📊 Laporan harian Rumah Pintar Mini 26 Okt 2026: 2 perangkat, teks yang diterima Telegram tiruan (gladi 00.04.00 WIB). Kalau tidak biasa: laptop tidur saat 07.00 (jingga), terlambat paling lama 15 menit tetap jalan, lebih lama log + pesan ⏰ ke Telegram, laporan TIDAK dikirim belakangan: ⏰ Laporan harian pada 27 Okt 2026, 07.00 WIB terlewat (laptop tidur atau backend sibuk?). Kirim sekarang lewat POST /laporan/kirim; backend mati sama sekali: tanpa catatan. Telegram mati (token kosong): log WARN: laporan harian dilewati: Telegram mati (TELEGRAM_BOT_TOKEN belum diisi), tombol uji menjawab 409. Tombol uji POST /laporan/kirim (ungu): admin saja, viewer 403, Bruno kirim laporan sekarang; ?hari=ini memberi laporan-2026-10-27-sementara.csv; alat uji isi, BUKAN bukti otomatis. Bawah, bukti G3, gladi tangan lepas: 1 simpan .env LAPORAN_JADWAL=4 0 * * *; 2 node --watch memulai ulang backend, berikutnya 27 Okt 2026, 00.04 WIB; 3 tangan lepas; 4 pukul 00.04.00 laporan harian berjalan sesuai jadwal, Telegram terkirim: berkas laporan-2026-10-26.csv (326 byte); 5 kembalikan LAPORAN_JADWAL=0 7 * * *.](aset/laporan-harian.png)

Angka di gambar (gladi 00.04 WIB, 326 byte, 363 bacaan) berasal dari larian uji lain; jam dan ukuran di layarmu pasti berbeda.

**Isinya: satu kueri, empat sumber, 15 kolom.** Satu kueri SQL meringkas semua perangkat sekaligus, satu baris per perangkat:

| Sumber | Kolom |
| :--- | :--- |
| `devices` | `device_id`, `nama`, `jenis` (hanya perangkat terdaftar yang kuncinya belum dicabut) |
| `readings_per_jam`, [buku ringkasan Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis) | `jumlah_bacaan`, `suhu_rata`, `suhu_min`, `suhu_maks`, `kelembapan_rata`, `tanah_rata`, `tanah_min` |
| `device_health` (vitals) | `rssi_rata`, `rssi_terburuk`, `heap_terendah`, `menyala_ulang` (berapa kali *uptime* turun) |
| `events` (buku kejadian) | `kali_terputus` |

Perangkat yang diam seharian tetap punya baris, dengan `jumlah_bacaan` `0`. Kolom vitals Node 2 selalu kosong, karena Node 2 tidak mengirim `vitals`. Perangkat yang kuncinya dicabut **tidak** masuk: di lab penulis laporan kemarin berisi `2 perangkat`, karena `f00d00000002` dicabut di [4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit) walau punya 144 bacaan kemarin. Kalau kemarin perangkatmu belum menyala, barisnya hanya berisi `0` dan sel kosong; untuk melihat angka, minta laporan sementara hari ini (`?hari=ini`), yang bernama `laporan-YYYY-MM-DD-sementara.csv`.

**Resep CSV Modul 23, kini di server.** `services/csv.ts` memakai [resep `src/csv.ts` Modul 23](../modul-23-dashboard-realtime/README.md#82-srccsvts-dan-tombol-unduh-csv-15-menit): pemisah `;`, koma desimal, BOM 3 byte di awal, dan setiap baris diakhiri CRLF, supaya berkas terbuka rapi di spreadsheet berlokal Indonesia. Penulis tidak menguji Excel maupun LibreOffice; berkasnya disiapkan untuk keduanya. Laporan sementara yang diterima server Telegram tiruan di lab penulis (`<BOM>` = byte `EF BB BF`):

```text
<BOM>device_id;nama;jenis;jumlah_bacaan;suhu_rata;suhu_min;suhu_maks;kelembapan_rata;tanah_rata;tanah_min;rssi_rata;rssi_terburuk;heap_terendah;menyala_ulang;kali_terputus
f00d00000001;Latihan ruang tamu;node1;246;28,5;21,6;33;70;41,7;20;-59;-79;181094;0;1
f00d000000b2;Kebun (tiruan);node2;8;28,2;26,8;29,4;68;40,6;35;;;;;0
```

**Berkas, bukan teks.** Bot Modul 19 yang sama mengirimnya lewat `sendDocument` Telegram (berkas sampai 50 MB, keterangan sampai 1024 huruf). Fungsi barunya, `kirimBerkas()` di `telegram.ts`, membungkus teks CSV menjadi byte dulu: `new InputFile(Buffer.from(isi, "utf8"), nama)`. Jebakannya, `new InputFile("teks…")` dianggap grammY sebagai **jalur berkas** di disk, sehingga gagal dengan `ENOENT`, atau dengan `File paths cannot contain carriage-return (\r) or newline (\n) characters!` bila teksnya berisi baris baru dan nama berkasnya tidak ditulis ([🔁 Langkah 5](#langkah-5--teks-menjadi-berkas-bufferfrom-bom-tiga-byte-dan-enoent)). Nama berkasnya tanggal isi (`laporan-2026-10-26.csv`), keterangannya `📊 Laporan harian Rumah Pintar Mini 26 Okt 2026: 2 perangkat`.

**"Otomatis", dengan syarat.** node-cron hanya berbunyi selama laptop menyala dan backend berjalan. Di lab penulis, jadwal bawaan berjalan tepat 07.00.00 WIB tanpa disentuh. Laptop yang tidur saat jadwal tetapi bangun paling lambat 15 menit kemudian masih mengirim laporannya. Lebih lambat dari itu, laporan **tidak** dikirim belakangan dan tidak tercatat sebagai kejadian di dashboard; backend hanya menulis log dan mengirim satu pesan. Di lab penulis (jadwal uji `6 7 * * *`, proses backend dibekukan 18 menit):

```text
⏰ Laporan harian pada 27 Okt 2026, 07.06 WIB terlewat (laptop tidur atau backend sibuk?). Kirim sekarang lewat POST /laporan/kirim
```

Kalau backend mati sama sekali pada jam itu, tidak ada yang bisa melapor. Itulah sebabnya judul konsep ini berbunyi "selama backend menyala"; server yang menyala terus menunggu di Modul 26–27.

**Cron lima bidang.** Jadwalnya diatur `LAPORAN_JADWAL` di `.env`, bawaannya `0 7 * * *`: menit, jam, tanggal, bulan, hari, seperti jadwal Modul 19. Sebagian tutorial memakai enam bidang dengan detik di depan. node-cron menerima `0 7 * * * *`, tetapi artinya detik 0 menit 7 **setiap jam**, alias 24 laporan sehari. Backend 1.2 menolaknya saat menyala: `Setelan LAPORAN_JADWAL di .env: harus 5 bidang: menit jam tanggal bulan hari, misalnya 0 7 * * *`.

**Tombol uji bukan bukti "otomatis".** `POST /laporan/kirim` (admin saja) mengirim laporan yang sama seketika, untuk memeriksa isinya; Bruno `kirim laporan sekarang` menambah `?hari=ini` (laporan sementara). Jawabannya `409` bila Telegram mati (token atau chat_id kosong), `502` bila Telegram menolak atau tak terjangkau, dan `503` bila database tidak bisa dihubungi. Bukti "tiba otomatis" (**G3**) adalah gladi tangan lepas di 9.1: jadwal 3 menit ke depan, lalu tunggu tanpa menyentuh apa pun.

Rinciannya di [8.2](#82-serviceslaporants-rentang-kemarin-wib-satu-kueri-dan-jadwal-18-menit), [8.3](#83-kirimberkas-di-telegramts-inputfile-dari-byte-bukan-dari-teks-8-menit), [8.4](#84-laporan_jadwal-rute-post-laporankirim-dan-serverts-12-menit), dan [9.1](#91--gladi-tangan-lepas-jadwal-3-menit-ke-depan-lalu-kembalikan-ke-0700-15-menit). Laporan PDF ada di [🔬](#-bedah-teknis-opsional) *Laporan PDF dengan pdfkit 0.20.2 …*; laporan yang tidak tiba atau perangkatnya kurang di [🚨](#-kalau-tidak-jalan); laporan mingguan adalah [🧩 Tingkat 3](#tingkat-3--laporan-mingguan-setiap-senin-pukul-0700-wib-buat-dari-nol-6090-menit).

> ⬆️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 8](#praktik-8--backend-12-laporan-harian-csv-ke-telegram-60-menit), lalu [Praktik 9](#praktik-9--laporan-yang-datang-sendiri-lalu-grafana-sebagai-berkas-35-menit).

### 11. Beli atau bangun: platform IoT siap pakai

[🔬 Modul 13](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#-bedah-teknis-opsional) menunda satu pertanyaan sampai sekarang: kapan membeli platform jadi, kapan membangun sendiri. Kini kamu punya pembanding yang kamu kenal luar dalam, yaitu Rumah Pintar Mini, dari firmware sampai dashboard. Platform IoT siap pakai mengemas lapisan-lapisan itu (penerima data, database, dashboard, aturan, notifikasi, akun) menjadi satu produk. Empat contoh di bawah adalah yang disebut Silabus, bukan daftar lengkap. Faktanya dibaca dari sumber resmi pada **26 Okt 2026**; lisensi dan harga bisa berubah kapan saja, jadi periksa lagi sebelum memutuskan.

| Platform | Bentuk | Lisensi dan biaya | Catatan | Sumber |
| :--- | :--- | :--- | :--- | :--- |
| ThingsBoard CE | dipasang sendiri (Java 17, PostgreSQL 16) | mulai versi 4.4 (terbaru 4.4.0.1): **Business Source License 1.1** (BSL); produksi gratis bila nonkomersial ≤ 1.000 perangkat, atau komersial ≤ 100 perangkat di satu server, dengan logo "Powered by ThingsBoard" dan *license key* gratis. Rilis sebelum 4.4 tetap Apache 2.0, dan setiap rilis menjadi Apache 2.0 empat tahun kemudian | resep Pi resminya masih memasang 4.3.1.7 (Apache 2.0); Pi minimal RAM 4 GB | [README & LICENSE](https://github.com/thingsboard/thingsboard), [pasang di Pi](https://thingsboard.io/docs/user-guide/install/rpi/) |
| Home Assistant | dipasang sendiri; disarankan sebagai Home Assistant OS | Apache 2.0, gratis (versi 2026.10.4) | Pi 5 atau Pi 4, RAM minimal 2 GB; sudah ditimbang di 🔬 Modul 13 dan [🔬 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#-bedah-teknis-opsional) | [home-assistant.io](https://www.home-assistant.io/installation/raspberrypi) |
| Blynk | layanan awan | paket Free: 5 perangkat, 1 pengguna, riwayat 1 minggu, 100.000 pesan perangkat per bulan; Starter $29 per bulan | server dan data di tangan penyedia | [blynk.io/pricing](https://blynk.io/pricing) |
| Antares | layanan awan; merek dagang IoT milik PT Telkom Indonesia | ada paket Free Trial; harga tidak dipublikasikan di situs dan dokumennya (paket baru terlihat di konsol sesudah masuk) | MQTT 1883/8883, HTTP, CoAP, LoRaWAN; contoh ESP32 | [antares.id](https://antares.id), [docs.antares.id](https://docs.antares.id) |

**Tujuh pertanyaan sebelum memilih.**

| Pertanyaan | Rumah Pintar Mini (membangun) | Platform siap pakai (membeli) |
| :--- | :--- | :--- |
| Data tinggal di mana, dan siapa yang memegangnya? | di laptop dan Pi milikmu | layanan awan: di server penyedia; yang dipasang sendiri: di servermu |
| Lisensinya mengizinkan rencanamu? | kodemu sendiri di atas perangkat lunak gratis; lisensinya tetap dibaca (misalnya react-leaflet, Konsep 8) | baca syaratnya: paket gratis berbatas, BSL membatasi produksi |
| Kuota dan biaya saat perangkat bertambah? | tanpa iuran, tetapi waktumu yang dibayar | gratis sampai batas tertentu, lalu bulanan |
| Protokol perangkatmu didukung? | MQTT dengan kontrak data buatanmu | ikuti protokol dan format platform |
| Keterampilan tim? | firmware, backend, dan frontend (sekarang kamu punya) | cepat jalan dengan sedikit kode |
| Seberapa terkunci ke satu penyedia? | tidak | aturan, dashboard, dan format terikat produk; harga dan lisensi bisa berubah sepihak |
| Bagaimana jalan keluar datanya? | SQL langsung, CSV harian (Konsep 10) | periksa dulu: ada ekspor atau API? |

**Posisi Rumah Pintar Mini.** Kurikulum ini membangun sendiri karena tujuannya **belajar** setiap lapisan. Di pekerjaan, membeli sering lebih masuk akal: tenggatnya pendek, kebutuhannya umum, timnya kecil. Membangun masuk akal saat kebutuhannya khusus, data harus tetap di tangan sendiri, atau biaya per perangkat membengkak saat jumlahnya ratusan. Banyak tim memilih di tengah: membangun yang khas, memakai alat jadi untuk sisanya. Grafana minggu ini adalah contohnya: dashboard teknis yang tidak kamu koding, di atas database dan kontrak data milikmu sendiri.

Tabel Node-RED lawan Home Assistant di Modul 13 dan pembahasan Home Assistant di Modul 19 tidak diulang di sini. Catatan belajarmu di [10.3](#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit) boleh memuat jawabanmu sendiri atas tujuh pertanyaan ini.

> ⬆️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 10](#praktik-10--checkpoint-fase-4-kumpulkan-buktinya-45-menit), Checkpoint Fase 4. Kalau kamu membacanya lebih awal, kembalilah ke praktik yang sedang kamu kerjakan.

## 🔧 Praktik langkah demi langkah

Sepuluh praktik menambahkan dashboard teknis, *alert*, peta, dan laporan harian ke Rumah Pintar Mini, di repositori `rumah-pintar-mini` cabang baru `fitur/grafana-peta-laporan`. Praktik 1–4 dan 9.2 berpusat di Grafana: dashboard dan *alert* dirakit dengan klik, tanpa koding, lalu diekspor sebagai berkas. Praktik 6 dan 8 mengubah `backend` (naik ke 1.2.0), Praktik 7 mengubah `frontend` (naik ke 1.1.0), dan Praktik 5 (jalur laptop) menambah Kebun tiruan di `alat/` serta blok 2b di `edge/acl-broker`.

Semua praktik di modul ini wajib, karena Silabus meminta dashboard, *alert*, peta, dan laporan sekaligus. Langkah bertanda ⭐ (1.4, 2.4, 3.2, 4.1, 4.3, 5.3, 5.4, 6.4, 7.4, 8.5, 9.1, 9.2, dan 10.4) adalah buktinya, ditambah [➕ F](#f--gabungkan-fiturgrafana-peta-laporan-ke-main-lewat-pull-request-dashboard-teknis--peta--laporan-harian-checkpoint-fase-4). Yang boleh dilewati hanya 3.3 dan 9.3 (bertanda opsional), kotak Grafana dari HP di Praktik 10, 🔬, dan 🧩. Syarat lulus **G1** dibuktikan di [4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit), **G2** di [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit) dan 5.4, serta **G3** di [9.1](#91--gladi-tangan-lepas-jadwal-3-menit-ke-depan-lalu-kembalikan-ke-0700-15-menit); ketiganya dicentang ulang di Praktik 10.

Langkah yang berbeda untuk **jalur perangkat** (Kit A + B) dan **jalur laptop** (simulator + Kebun tiruan) ditulis terpisah, terutama di 4.2, Praktik 5, dan 6.4; sisanya sama. Praktik yang mengubah berkas proyek diakhiri *commit* ke cabang itu, yang digabung ke `main` lewat *pull request* di ➕ F. Praktik 2–4 tanpa *commit*: dashboard dan aturan *alert* tinggal di lemari Grafana sampai diekspor ke `grafana/` di 9.2.

Untuk mencocokkan pekerjaanmu, [`kode/tahap/`](kode/tahap/) berisi JSON dashboard di akhir Praktik 2 dan 3, `backend` di akhir Praktik 6 dan 8, serta `frontend` di akhir Praktik 7. Hasil akhirnya ada di [`kode/`](kode/): `grafana/`, backend 1.2.0 (`backend/` dan daftar perubahannya, `backend-1.2.diff`), dashboard 1.1.0 (`frontend/`), serta `alat/` dan `edge/` dengan diff-nya. Pakai untuk membandingkan, bukan untuk menggantikan seluruh foldermu.

### Praktik 1 — Grafana yang rapi dan aman (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan satu terminal kosong untuk Git, `docker`, dan `curl`; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana` dari Kemenangan Cepat; serta **Chrome** atau **Edge** dengan Grafana di `http://localhost:3000`, ditambah satu jendela penyamaran di 1.3. Backend, Vite, dan simulator tidak dipakai di praktik ini. Konsep yang dipakai: 2 dan 3.
>
> ⭐ **Wajib** — langkah 1.4: sebagai `grafana_baca`, `SELECT` dengan nama kolom berhasil, sedangkan `SELECT *` dari `devices`, kolom `kunci_hash`, tabel `users` dan `sesi`, `INSERT`, serta `DROP TABLE` ditolak.

Praktik ini memastikan hasil Kemenangan Cepat rapi dan aman: resepnya di Git, kontainernya sesuai perintah, pintunya hanya untuk laptop ini, dan akun database-nya sungguh tidak bisa menulis. Belum mengerjakan Kemenangan Cepat? Selesaikan dulu Langkah 1–6-nya.

#### 1.1 Cabang `fitur/grafana-peta-laporan` dan folder `grafana/` di proyekmu (5 menit)

Di terminal kosong (folder `rumah-pintar-mini`), pindah ke `main` terbaru, lalu buat cabang untuk seluruh pekerjaan Modul 25:

```text
git switch main
git pull
git switch -c fitur/grafana-peta-laporan
git status
```

`git pull` mengambil hasil *pull request* Modul 24. `git status` hanya boleh menyebut folder `grafana/` sebagai berkas baru yang belum dilacak (*untracked*): `pengguna-grafana.sql` dari [KC Langkah 4](#langkah-4--akun-database-hanya-baca-grafana_baca-6-menit), yang ikut pindah ke cabang baru. Ada berkas lain yang berubah? Bereskan dulu.

Folder `grafana/` menyimpan **resep** Grafana, tanpa sandi atau token, jadi aman ikut Git. Lengkapi dengan petunjuknya. Buka [`kode/grafana/README.md`](kode/grafana/README.md) di GitHub, klik **Copy raw file**, lalu di VS Code klik kanan folder **`grafana`** → **New File…**, beri nama **`README.md`**, tempel, dan simpan (**Ctrl + S**). Isinya: KC Langkah 1–5, cara impor ulang, **Keamanan**, dan **Batasan**. Dua tautan di tabelnya, `dashboards/kesehatan-sistem.json` dan `alerting/node-diam.yaml`, baru bisa dibuka sesudah ekspor di 9.2; README ini dibaca ulang di [➕ B](#b-baca-ulang-grafanareadmemd-cara-menjalankan-akun-hanya-baca-ekspor-dan-batasan).

#### 1.2 Periksa kontainernya: `docker ps`, `docker inspect`, dan `docker network inspect` (7 menit)

Tiga perintah ini hanya membaca. Pertama, kontainer yang berjalan:

```text
docker ps
```

**Hasilnya (contoh):**

```text
CONTAINER ID   IMAGE                               COMMAND                  CREATED         STATUS         PORTS                      NAMES
c462533d5744   grafana/grafana:13.2.4              "/run.sh"                4 minutes ago   Up 4 minutes   127.0.0.1:3000->3000/tcp   rumahpintar-grafana
1f8ff222e902   timescale/timescaledb:2.30.2-pg17   "docker-entrypoint.s…"   9 minutes ago   Up 9 minutes   127.0.0.1:5432->5432/tcp   rumahpintar-db
```

Kolom **PORTS** keduanya diawali `127.0.0.1`: loketnya hanya untuk laptop ini. Tertulis `0.0.0.0:3000` (perintahmu memakai `-p 3000:3000`)? Buang kontainernya (`docker rm -f rumahpintar-grafana`), lalu ulangi [KC Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit); isi Grafana aman di lemarinya. Kolom PORTS kosong: [🚨](#-kalau-tidak-jalan) *Port 3000 sudah terpakai …*. Kedua, rincian kontainer Grafana:

```text
docker inspect rumahpintar-grafana
```

Keluarannya panjang (±236 baris). Cari tiga bagian dengan **Ctrl + F** di terminal VS Code: `RestartPolicy`, `Mounts`, dan `Env`.

**Hasilnya (potongan):**

```text
            "RestartPolicy": {
                "Name": "unless-stopped",
…
        "Mounts": [
…
                "Name": "rumahpintar-grafana-data",
                "Destination": "/var/lib/grafana",
…
            "Env": [
                "GF_ANALYTICS_REPORTING_ENABLED=false",
                "GF_SNAPSHOTS_EXTERNAL_ENABLED=false",
                "GF_PUBLIC_DASHBOARDS_ENABLED=false",
                "GF_PLUGINS_PREINSTALL_DISABLED=true",
```

Docker menyalakan Grafana lagi kecuali kamu sendiri yang menghentikannya (`unless-stopped`, sama dengan database Modul 17), isinya di lemari `rumahpintar-grafana-data`, keempat setelan `GF_…` terpasang, dan tidak ada sandi di daftar `Env`. Ketiga, lorongnya:

```text
docker network inspect rumahpintar
```

**Hasilnya (potongan):**

```text
        "Containers": {
            "1f8ff222e902…": {
                "Name": "rumahpintar-db",
                "IPv4Address": "172.18.0.2/16",
            "c462533d5744…": {
                "Name": "rumahpintar-grafana",
                "IPv4Address": "172.18.0.3/16",
```

Dua kontainer di satu lorong. Alamat `172.18.…` (di laptopmu bisa berbeda) urusan Docker; Grafana memanggil database dengan namanya (Konsep 2).

#### 1.3 Pintu Grafana: `401` tanpa *login*, hanya dari laptop ini, tanpa berbagi ke luar (5 menit)

**Tanpa *login*.** Tekan **Ctrl + Shift + N** (macOS: **Cmd + Shift + N**) untuk jendela penyamaran (Chrome: *Incognito*, Edge: *InPrivate*), lalu buka `http://localhost:3000`. Jendela itu tidak membawa *cookie* Grafana-mu.

**Hasilnya:** alamatnya pindah ke `/login`: `Welcome to Grafana`, medan **Email or username** dan **Password**, tombol **Log in**, dan `Forgot your password?`. Tidak satu dashboard pun terlihat sebelum masuk. Tutup jendela itu. Program pun ditolak; tanyakan API dashboard tanpa *login* (macOS dan Linux: `curl`, tanpa `.exe`):

```text
curl.exe -i http://localhost:3000/api/dashboards/home
```

**Hasilnya (potongan; lab penulis: `curl` di Linux):**

```text
HTTP/1.1 401 Unauthorized
…
X-Frame-Options: deny
…
{"extra":null,"message":"Unauthorized","messageId":"auth.unauthorized","statusCode":401,"traceID":""}
```

`401` artinya sama dengan satpam backend Modul 20: belum *login*. `X-Frame-Options: deny` melarang browser menampilkan Grafana di dalam halaman lain; karena itu panel Grafana belum ditanam di dashboard React ([🔬](#-bedah-teknis-opsional) *Panel Grafana di dalam dashboard React …*).

**Hanya dari laptop ini.** Loket `127.0.0.1:3000` tidak menerima tamu dari jaringan, jadi HP di WiFi rumah tidak bisa membuka `http://<IP-laptop>:3000`. Penulis tidak menguji dengan HP; di lab, mesin itu sendiri pun ditolak lewat IP LAN-nya: `curl: (7) Failed to connect to 192.168.1.10 port 3000 after 0 ms: Could not connect to server`. Membukanya sebentar untuk HP ada di kotak opsional [Praktik 10](#praktik-10--checkpoint-fase-4-kumpulkan-buktinya-45-menit).

**Tanpa berbagi ke luar.** Buka **Dashboards** → `Panel pertama` dari KC. Di kanan atas, klik panah kecil di samping ikon bagikan (ikonnya sendiri = **Copy link**).

**Hasilnya:** menunya hanya **Share internally** (bagikan di dalam Grafana ini) dan **Share snapshot**, tanpa **Share externally**. Klik **Share snapshot**: lacinya berisi `Snapshot name`, `Expires in`, **Publish snapshot**, `Cancel`, dan `View all snapshots`, tanpa **Publish to snapshots.raintank.io**. Jalan ke luar laptop itu hilang karena setelan `false` di `docker run` (Konsep 2). Klik **Cancel**.

#### 1.4 ⭐ Uji `grafana_baca` di psql: boleh membaca, ditolak menulis (10 menit)

Buktikan janji Konsep 3 lewat psql di dalam kontainer database, sebagai `grafana_baca`:

```text
docker exec -it rumahpintar-db psql -U grafana_baca -d rumahpintar
```

Dari dalam kontainer, psql tidak menanyakan sandi (seperti psql `postgres` Modul 17). Pastikan prompt-nya `rumahpintar=>`, bukan `rumahpintar=#`: `=#` berarti akun super, dan sebagai `postgres` kueri `DROP TABLE` di bawah sungguh menghapus tabel. Ketik kueri sesudah `rumahpintar=>` di kotak berikut satu per satu, masing-masing diakhiri **Enter**. Keluar dengan `\q`.

**Hasilnya (contoh):**

```text
rumahpintar=> SELECT count(*) FROM readings;
 count
-------
  2058
(1 row)

rumahpintar=> SELECT device_id, nama, status FROM devices;
  device_id   |        nama        |     status
--------------+--------------------+-----------------
 f00d00000001 | Latihan ruang tamu | belum-diketahui
 f00d00000002 | Latihan teras      | belum-diketahui
(2 rows)

rumahpintar=> SELECT * FROM devices;
ERROR:  permission denied for table devices
rumahpintar=> SELECT kunci_hash FROM devices;
ERROR:  permission denied for table devices
rumahpintar=> SELECT email FROM users;
ERROR:  permission denied for table users
rumahpintar=> SELECT count(*) FROM sesi;
ERROR:  permission denied for table sesi
rumahpintar=> INSERT INTO events (jenis, sumber, pesan) VALUES ('status', 'uji', 'coba');
ERROR:  cannot execute INSERT in a read-only transaction
rumahpintar=> DROP TABLE readings;
ERROR:  cannot execute DROP TABLE in a read-only transaction
rumahpintar=> SHOW statement_timeout;
 statement_timeout
-------------------
 10s
(1 row)
```

Angka dan perangkat mengikuti datamu. Empat penolakan `permission denied` datang dari lapis izin: `devices` hanya boleh dibaca per kolom dan tanpa `kunci_hash`, sedangkan `users` dan `sesi` tertutup. `INSERT` dan `DROP TABLE` ditolak lapis hanya-baca. Lapis izin yang tetap menahan walau lapis hanya-baca dimatikan ada di Konsep 3.

**Kamu lulus langkah ⭐ ini** kalau dua `SELECT` pertama menjawab baris, enam perintah berikutnya ditolak dengan pesan seperti di atas, dan `statement_timeout` bernilai `10s`. psql menolak masuk karena akunnya belum ada, atau `SELECT device_id, nama, status` pun ditolak? Jalankan lagi perintah [KC Langkah 4](#langkah-4--akun-database-hanya-baca-grafana_baca-6-menit) ([🚨](#-kalau-tidak-jalan) *`ERROR:  role "grafana_baca" already exists` atau `permission denied …`*).

#### 1.5 Folder `Rumah Pintar Mini` dan bahasa layar Grafana (3 menit)

Dashboard dan aturan *alert* modul ini disimpan di satu folder. Di menu kiri Grafana klik **Dashboards**, lalu tombol **New** di kanan atas → **New folder**. Isi **Folder name** `Rumah Pintar Mini`, biarkan kotak `Assign an owner to the folder` kosong, lalu klik **Create**. Menu `+` di kepala halaman tidak punya **New folder**.

**Hasilnya:** halaman `Rumah Pintar Mini` bertuliskan `Manage folder dashboards and permissions`, dengan tab `Dashboards`, `Panels 0`, dan `Alert rules 0`. Folder ini dipilih lagi di 2.1 dan 4.3.

**Bahasa layar.** Grafana bisa berbahasa Indonesia: avatar di kanan atas → **Profile** → bagian **Preferences** → **Language** `Bahasa Indonesia` → **Save preferences**. Namun, ±15 % teksnya belum diterjemahkan, dan menu *alert* (**Alert rules**, **Notification configuration**) tetap Inggris. Modul ini dan dokumentasi Grafana memakai nama Inggris, jadi sebaiknya **Language** dibiarkan (`Default`; di lab penulis berbahasa Inggris).

**Max open, kalau terlewat di KC.** Buka **Connections → Data sources** → `grafana-postgresql-datasource` → **Connection limits**: **Max open** harus `4`, bukan `100` ([KC Langkah 5](#langkah-5--data-source-postgresql-lewat-lorong-rumahpintar-db5432-5-menit)). Sesudah mengubahnya, klik **Save & test**. Jawaban pertama bisa `too many connections for role "grafana_baca"` (sambungan lama belum dilepas): tunggu beberapa detik, lalu klik lagi sampai `Database Connection OK`.

**Simpan ke cabang.** Di terminal kosong (folder `rumah-pintar-mini`), `git status` hanya menyebut `grafana/`. Lalu:

```text
git add grafana
git commit -m "Folder grafana: akun hanya-baca dan README (Modul 25 Praktik 1)"
```

> ⬆️ **Selesai Praktik 1?** Baca [Konsep 4](#4-anatomi-panel-sql-makro-waktu-satuan-dan-ambang) sampai [Konsep 6](#6-membaca-kesehatan-perangkat-rssi-uptime-heap-dan-paket-per-jam), lalu lanjut ke [Praktik 2](#praktik-2--dashboard-kesehatan-sistem-rssi-uptime-heap-dan-variabel-node-50-menit).

### Praktik 2 — Dashboard "Kesehatan Sistem": RSSI, *uptime*, *heap*, dan variabel `$node` (50 menit)

> 🖥️ **Alat yang dipakai:** **Chrome** atau **Edge** dengan Grafana di `http://localhost:3000`, masuk sebagai `admin`; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana` menyala; **VS Code** dengan terminal `backend` (backend 1.1, `npm run dev`) yang tetap menyala, karena backend-lah yang menyimpan `vitals` ke `device_health`. Jalur laptop: broker dan simulator di terminal `alat` juga tetap menyala; jalur perangkat: Node 1 menyala. Konsep yang dipakai: 4, 5, dan 6.
>
> ⭐ **Wajib** — langkah 2.4: dashboard `Kesehatan Sistem` tersimpan di folder `Rumah Pintar Mini` dengan *refresh* `1m` dan `Node` = `All` sebagai bawaan, pilihan `Node` mengubah isi panel, dan Query inspector memperlihatkan kueri yang sungguh dikirim ke database.

Praktik ini membuat dashboard teknis pertamamu: satu pemilih perangkat `Node` dan tiga panel dari `device_health`. Praktik 3 menambah dua panel untuk Node 2. Semuanya dirakit lewat klik, persis "dashboard teknis tanpa koding" di [Silabus](../../SILABUS.md#3-pilihan-teknologi--alasannya): yang kamu ketik hanya SQL-nya. Judul panel dan SQL di bawah sama persis dengan dashboard kunci [`kode/tahap/praktik-2/grafana/dashboards/kesehatan-sistem.json`](kode/tahap/praktik-2/grafana/dashboards/kesehatan-sistem.json), jadi hasilnya bisa dicocokkan di 2.5.

#### 2.1 Dashboard baru: folder, zona WIB, dan variabel `$node` (10 menit)

**Langkah 1 — dashboard kosong, judul, folder, dan zona waktu.**

1. Di menu kiri Grafana, klik **Dashboards → New → New dashboard**. Kanvas kosong bertuliskan `Add a panel to visualize your data`, dengan deretan ikon di kanan (**Add**, **Options**, **Code**, …).
2. Klik ikon **Options** (opsi), isi **Title** `Kesehatan Sistem`, lalu klik **View all settings** (lihat semua pengaturan). Halaman **Settings** terbuka di tab **General**.
3. Di **Folder**, klik tombol `Select folder: Dashboards currently selected`, lalu pilih `Rumah Pintar Mini` di pohon folder (folder ini kamu buat di [1.5](#15-folder-rumah-pintar-mini-dan-bahasa-layar-grafana-3-menit)).
4. Di **Time zone** (zona waktu), yang semula `Browser Time`, ketik `Jakarta`, lalu pilih satu-satunya pilihan `Jakarta  WIB  UTC+07:00`.

**Hasilnya:** pemilih waktu di kanan atas kini menulis `Last 6 hours WIB`. Zona ini tersimpan di JSON dashboard ini, jadi sumbunya tetap WIB di laptop mana pun ([Konsep 4](#4-anatomi-panel-sql-makro-waktu-satuan-dan-ambang)).

**Langkah 2 — variabel `$node`.** Grafana 13.2 memindahkan editor variabel ke bilah samping dashboard ([Konsep 5](#5-variabel-satu-dashboard-untuk-semua-perangkat)).

1. Masih di **Settings**, klik tab **Variables**. Isinya hanya `Variable settings have moved to the dashboard's sidebar.`; klik **Take me there**.
2. Di bilah samping, klik **Variable**. Pada `Choose variable type`, pilih **Query** (`Values are fetched from a data source query`).
3. Ganti **Name** `query0` menjadi `node`, isi **Label** `Node`, lalu nyalakan **Multi-value** dan **Include All value**. Medan `Custom all value` yang muncul dibiarkan kosong; **Refresh** tetap `On dashboard load`.
4. Klik **Open variable editor**. Di laci `Query variable: node`, pastikan **Target data source** adalah `grafana-postgresql-datasource`, klik **Code**, lalu tempel kueri ini:

   ```sql
   SELECT coalesce(nama, device_id) AS __text, device_id AS __value FROM devices WHERE terdaftar IS NOT NULL AND dicabut IS NULL ORDER BY 1
   ```

5. Klik **Run query**.

   **Hasilnya (lab penulis):** `Preview of values (3)`: `Kebun (tiruan)`, `Latihan ruang tamu`, `Latihan teras`. Di lab itu Kebun tiruan sudah didaftarkan lebih awal; di jalur laptopmu, `Kebun (tiruan)` baru muncul sesudah [5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit); di jalur perangkat, nama Node 1 dan Node 2-mu ikut tampil. Daftarnya urut nama karena `ORDER BY 1`.

6. Klik **Apply** (terapkan).

**Langkah 3 — simpan pertama, lalu pilih `All`.** Klik **Save**. Laci `Save dashboard` menulis **Title** `Kesehatan Sistem` dan **Folder** `Rumah Pintar Mini`; dashboard yang belum pernah disimpan belum punya medan **Message**. Klik **Save**.

**Hasilnya (lab penulis):** alamatnya menjadi `/d/adr4wkv/kesehatan-sistem?…&var-node=f00d000000b2` (uid-mu akan berbeda), dan pemilih `Node` di atas dashboard berisi nilai **pertama** daftarnya, `Kebun (tiruan)`, bukan `All`. Inilah jebakan Konsep 5: Kebun tidak punya `vitals`, jadi panel RSSI nanti bertuliskan `No data`. Buka daftar `Node`, centang `All`, lalu hapus *chip* nilai pertama tadi dengan **×** sampai yang tersisa hanya `All` (alamatnya menjadi `…var-node=$__all`). Pilihan ini baru menjadi bawaan saat kamu menyimpan di [2.4](#24--simpan-dengan-refresh-1-menit-uji-node-lalu-intip-query-inspector-10-menit).

#### 2.2 Panel RSSI: kueri SQL, Format `Time series`, satuan dBm, dan ambang (12 menit)

1. Kalau dashboard sedang dalam mode lihat, klik **Edit**. Lalu klik **Add → Panel**, dan pada kotak `New panel` / `No visualization configured`, klik **Configure visualization**.
2. Di editor kueri, klik **Code**, lalu tempel kueri RSSI:

   ```sql
   SELECT h.ts AS "time", coalesce(d.nama, h.device_id) AS metric, h.rssi
   FROM device_health h JOIN devices d ON d.device_id = h.device_id
   WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
   ORDER BY 1
   ```

3. Ganti **Format** dari `Table` ke **Time series** (tanpa itu, semua perangkat menjadi satu garis, [Konsep 4](#4-anatomi-panel-sql-makro-waktu-satuan-dan-ambang)), lalu klik **Run query**.
4. Di bilah kanan, klik **All visualizations** → **Time series**. Isi **Title** `RSSI (kekuatan sinyal WiFi)` dan **Description** (keterangan) `Makin dekat ke 0 makin kuat. Konvensi umum: di bawah -75 dBm mulai lemah (bukan standar).`
5. **Standard options → Unit**: ketik `dBm`, lalu pilih `Energy / Decibel-milliwatt (dBm)`, bukan `Custom unit: dBm`.

   **Hasilnya (lab penulis):** sumbu kiri menulis `-40 dbm`, `-60 dbm`, `-80 dbm`. Huruf kecil `dbm` memang cara Grafana menulis satuan ini.

6. **Thresholds**: bawaannya `Base` hijau dan `80` merah. Ganti angka `80` menjadi `-75`, klik titik warnanya dan pilih hijau (*green*), lalu klik titik warna `Base` dan pilih merah (*red*). Artinya: −75 ke atas hijau, di bawahnya merah.
7. **Show thresholds** (tampilkan ambang): pilih `As lines (dashed)`.
8. **Axis → Soft min** `-90` dan **Soft max** `-30` (batas lunak sumbu). Tanpa batas ini, sumbu hanya selebar data; kalau sinyalmu selalu di atas −60, garis −75 berada di luar grafik dan tidak pernah terlihat.

   **Hasilnya:** sumbu kini membentang dari `-30 dbm` sampai `-90 dbm`, dengan garis putus-putus hijau melintang di −75.

9. Klik **Back** untuk kembali ke dashboard (masih mode sunting).

Titik RSSI berjarak 5 menit, bukan garis rapat; itu wajar ([Konsep 6](#6-membaca-kesehatan-perangkat-rssi-uptime-heap-dan-paket-per-jam)). Panelnya `No data`? Pastikan `Node` = `All`, lalu baca [2.5](#25-no-data-dan-jam-yang-bergeser-vitals-tiap-5-menit-utc-di-kueri-wib-di-layar-5-menit).

#### 2.3 Panel Uptime dan Heap: jebakan Stat merah di 80, satuan durasi dan byte (13 menit)

**Panel Uptime.**

1. Klik **Add → Panel**, lalu **Configure visualization**. Kotaknya bisa muncul di bawah layar; **Edit visualization** di bilah samping `Panel` membuka editor yang sama.
2. **Code**, tempel kueri ini, pilih **Format** **Time series**, lalu **Run query**:

   ```sql
   SELECT h.ts AS "time", coalesce(d.nama, h.device_id) AS metric, h.uptime_s
   FROM device_health h JOIN devices d ON d.device_id = h.device_id
   WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
   ORDER BY 1
   ```

3. **All visualizations** → **Stat**. Isi **Title** `Uptime (lama menyala)` dan **Description** `Turun mendadak ke angka kecil = perangkat baru menyala ulang (restart).`

   **Hasilnya (lab penulis), sebelum diubah:** angka besar `600` berwarna **merah**. Tidak ada yang rusak: *uptime* 600 detik melewati ambang bawaan merah di 80 ([Konsep 4](#4-anatomi-panel-sql-makro-waktu-satuan-dan-ambang)).

4. **Standard options → Unit**: ketik `duration`, lalu pilih `Time / duration (s)` (bukan `(ms)`, `(hh:mm:ss)`, atau `(d hh:mm:ss)`).

   **Hasilnya:** `10 minutes`, tetapi masih merah.

5. **Color scheme**: pilih `Single color` (satu warna).

   **Hasilnya:** `10 minutes` berwarna abu-abu netral. *Uptime* besar tidak berbahaya; yang patut dicurigai adalah angka yang tiba-tiba kecil lagi.

6. Klik **Back**.

**Panel Heap.**

1. **Add → Panel** → **Configure visualization** → **Code**, tempel kueri ini, **Format** **Time series**, **Run query**:

   ```sql
   SELECT h.ts AS "time", coalesce(d.nama, h.device_id) AS metric, h.heap_free
   FROM device_health h JOIN devices d ON d.device_id = h.device_id
   WHERE $__timeFilter(h.ts) AND h.device_id IN ($node)
   ORDER BY 1
   ```

2. **All visualizations** → **Time series**. **Title** `Heap (sisa memori)`, **Description** `Turun terus dari hari ke hari = curiga memori bocor.`
3. **Standard options → Unit**: ketik `bytes`, lalu pilih `Data / bytes(SI)`. `Data / bytes(IEC)` di atasnya menghitung per 1024; dashboard kunci memakai SI, per 1000. Ambangnya dibiarkan bawaan, seperti di kunci.

   **Hasilnya (lab penulis):** sumbu kiri `180 kB` … `195 kB`.

4. Klik **Back**.

Ketiga kueri hanya berbeda di kolom terakhir (`rssi`, `uptime_s`, `heap_free`). Stat tetap merah? Lihat [🚨](#-kalau-tidak-jalan) *Angka Stat berwarna merah padahal normal*.

#### 2.4 ⭐ Simpan dengan *refresh* 1 menit, uji `$node`, lalu intip Query inspector (10 menit)

**Langkah 1 — *refresh* dan simpan.**

1. Klik panah kecil di samping tombol **Refresh** (`Auto refresh turned off. Choose refresh time interval`), lalu pilih `1m`: panel memuat ulang datanya setiap menit.
2. Klik **Save**. Di laci `Save dashboard` (lab penulis: `Changes 7`), centang **Update default refresh value** (jadikan *refresh* ini bawaan) dan **Update default variable values** (jadikan pilihan variabel ini bawaan). Isi **Message** (pesan) `Praktik 2: variabel node + RSSI, uptime, heap`, lalu klik **Save**.
3. Klik **Exit edit**. Uji bawaannya di **tab baru** (**Dashboards** → `Kesehatan Sistem`), bukan dengan **F5** atau menu di tab ini: alamatnya membawa `var-node` dan `refresh`, dan tab ini masih mengingat pilihanmu.

**Hasilnya:** di tab baru, bilah atas tetap menulis `Node` `All`, `Last 6 hours WIB`, dan `1m` di samping **Refresh**. Tanpa centang pertama, `1m` tidak ikut ke tab baru ([🚨](#-kalau-tidak-jalan) *Refresh 1 menit hilang lagi …*); tanpa centang kedua, `Node` kembali ke nilai pertama daftar.

**Langkah 2 — uji `$node`.** Buka daftar `Node`, hapus `All`, lalu centang satu perangkat yang mengirim `vitals` (jalur laptop: `Latihan ruang tamu`; jalur perangkat: Node 1-mu). Ketiga panel kini hanya memuat perangkat itu. Kalau ada, coba juga perangkat tanpa `vitals`: Node 2-mu, atau Kebun sesudah 5.1.

**Hasilnya (lab penulis):** `Node` = `Kebun (tiruan)` membuat panel RSSI bertuliskan `No data`, karena Node 2 (dan Kebun) tidak mengirim `vitals` ([Konsep 6](#6-membaca-kesehatan-perangkat-rssi-uptime-heap-dan-paket-per-jam)). Kembalikan ke `All`; memilih di daftar tidak mengubah bawaan yang tersimpan. Panel galat begitu `All` dipilih? Lihat [🚨](#-kalau-tidak-jalan) *Panel galat atau kosong begitu kuerinya memakai `$node`*.

**Langkah 3 — Query inspector.** Arahkan tetikus ke panel RSSI, klik ⋮ (`Menu`) di kepala panelnya, pilih **Inspect**, lalu tab **Query**. Lacinya baru berisi `No request and response collected yet. Hit refresh button`; klik **Refresh**. Ulangi dengan `Node` berisi satu perangkat.

**Hasilnya (lab penulis), `Node` = `All`, lalu `Latihan ruang tamu`:**

```text
A:6 rows
SELECT h.ts AS "time", coalesce(d.nama, h.device_id) AS metric, h.rssi
FROM device_health h JOIN devices d ON d.device_id = h.device_id
WHERE h.ts BETWEEN '2026-10-26T14:55:18.815Z' AND '2026-10-26T20:55:18.815Z' AND h.device_id IN ('f00d000000b2','f00d00000001','f00d00000002')
ORDER BY 1
---
A:6 rows
SELECT h.ts AS "time", coalesce(d.nama, h.device_id) AS metric, h.rssi
FROM device_health h JOIN devices d ON d.device_id = h.device_id
WHERE h.ts BETWEEN '2026-10-26T14:56:19.127Z' AND '2026-10-26T20:56:19.127Z' AND h.device_id IN ('f00d00000001')
ORDER BY 1
```

Inilah yang diterima database ([Konsep 4](#4-anatomi-panel-sql-makro-waktu-satuan-dan-ambang)–[5](#5-variabel-satu-dashboard-untuk-semua-perangkat)): `$__timeFilter(h.ts)` menjadi `BETWEEN '…Z' AND '…Z'` dalam UTC, dan `$node` menjadi daftar `device_id` berkutip, satu atau semua. Kedua jawaban sama-sama 6 baris karena hanya simulator yang mengirim `vitals`. Tanpa `$__timeGroupAlias`, tidak ada `time_bucket` (Konsep 4): setiap baris `device_health` digambar apa adanya.

Gambar di bawah diambil dari dashboard hasil impor JSON kunci di lab penulis sesudah 4.2 dan 5.1, jadi daftar `Node`-nya berisi Kebun tetapi tanpa `Latihan teras` (kuncinya dicabut).

![Komposit tangkapan layar asli Grafana 13.2.4 bertema gelap di Chrome 156, Linux di Raspberry Pi 5 sebagai laptop, 1280 piksel, Praktik 2. Atas: editor panel RSSI (kekuatan sinyal WiFi) di dashboard Kesehatan Sistem. Grafik garis Latihan ruang tamu dengan sumbu kiri -30 dbm sampai -90 dbm (nomor 3) dan garis putus-putus hijau di -75 (nomor 4); titik ada sejak simulator menyala sekitar 07.37 WIB. Di bawahnya Format Time series (nomor 2) dan kueri Code SELECT h.ts AS time, coalesce(d.nama, h.device_id) AS metric, h.rssi FROM device_health h JOIN devices d ON d.device_id = h.device_id WHERE $__timeFilter(h.ts) AND h.device_id IN ($node) ORDER BY 1 (nomor 1); tombol Query inspector (nomor 6). Kanan, Standard options, Unit Decibel-milliwatt (dBm) (nomor 3). Pojok kiri atas variabel Node dengan pilihan All (nomor 5), pemilih waktu Last 6 hours WIB (nomor 7). Bawah kiri: bagian Thresholds yang digulir, ambang -75 bertitik hijau dan Base bertitik merah (nomor 4), Thresholds mode Absolute, Show thresholds As lines (dashed) (nomor 4). Bawah tengah: daftar Node dibuka, Selected (1), All bercentang, Kebun (tiruan), Latihan ruang tamu (nomor 5). Bawah kanan: laci Inspect, tab Query, A: 6 rows, SQL yang dikirim WHERE h.ts BETWEEN 2026-10-26T19:06:06.727Z AND 2026-10-27T01:06:06.727Z AND h.device_id IN (f00d000000b2, f00d00000001) dengan kutip tunggal di setiap id (nomor 6), tombol Refresh (nomor 6). Dashboard diimpor dari JSON kunci modul ini; daftar Node adalah keadaan lab sesudah Praktik 4 dan 5.](aset/editor-panel-dan-variabel.png)

**Kamu lulus langkah ⭐ ini** kalau dashboard `Kesehatan Sistem` ada di folder `Rumah Pintar Mini`, sesudah dibuka di tab baru masih ber-`Node` `All` dan ber-*refresh* `1m`, memilih satu perangkat mengubah isi ketiga panel, dan Query inspector panel RSSI menulis `BETWEEN '…Z'` serta `IN ('…')` berisi `device_id` perangkatmu.

#### 2.5 "No data" dan jam yang bergeser: vitals tiap 5 menit, UTC di kueri, WIB di layar (5 menit)

**"No data" bukan kerusakan.** `vitals` masuk ke `device_health` setiap 5 menit, dan hanya selama perangkat **dan** backend menyala. Di lab penulis, `vitals` pertama simulator tiba 03.31.42 WIB, dan 25 menit kemudian panel RSSI berisi 6 titik. Kalau ketiga panel `No data`, periksa berurutan: apakah simulator (atau Node 1) dan backend menyala, apakah `Node` berisi perangkat yang mengirim `vitals`, lalu tunggu sampai 5 menit ([Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#57-lihat-datanya-berdatangan) sudah menyebut `device_health` baru berisi sesudah beberapa menit). Memperlebar rentang ke beberapa hari tidak menolong: riwayat `npm run isi-riwayat` tidak memuat `vitals`. Masih kosong? Lihat [🚨](#-kalau-tidak-jalan) *Panel RSSI, uptime, atau heap bertuliskan `No data`*.

**Jam: UTC di kueri, WIB di layar.** Bandingkan Query inspector tadi dengan pemilih waktu. `'2026-10-26T14:55:18.815Z'` sampai `'2026-10-26T20:55:18.815Z'` sama dengan 21.55 WIB tanggal 26 sampai 03.55 WIB tanggal 27: enam jam terakhir, persis `Last 6 hours WIB`, hanya ditulis 7 jam lebih awal. Selisih itu benar. Yang salah adalah sumbu grafik yang bergeser 7 jam dari jam laptopmu: zona dashboard masih UTC, belum `Jakarta` (2.1 Langkah 1). Lihat [🚨](#-kalau-tidak-jalan) *Jam di grafik atau di Query inspector bergeser 7 jam*.

**Cocokkan dengan kunci.** Di berkas kunci tadi, cari `"rawSql"` (kueri ketiga panel dan variabel), `"unit"` (`dBm`, `dtdurations`, `decbytes`: nama JSON untuk tiga satuan pilihanmu), `"timezone": "Asia/Jakarta"`, dan `"refresh": "1m"`. Ingin melihatnya berjalan? Impor sebagai salinan: **Dashboards → New → Import dashboard**, tempel isinya (**Copy raw file**) di **Import via dashboard JSON model**, klik **Load** yang kedua, ganti **Name** menjadi `Kesehatan Sistem (kunci)`, pilih *data source*-mu di `DS_GRAFANA-POSTGRESQL-DATASOURCE`, lalu **Import**. Tombol bertuliskan `Import (Overwrite)` jangan diklik, karena menimpa dashboard lain ([9.3](#93-coba-impor-ke-grafana-yang-sama-change-uid-dulu-opsional-8-menit)). Di lab penulis, hasil impor langsung ber-`Node` `All`. Salinan ini hanya pembanding; Praktik 3 dan 9.2 memakai dashboard buatanmu.

Tidak ada yang di-*commit* di praktik ini: dashboard tersimpan di lemari Grafana (`rumahpintar-grafana-data`) dan baru menjadi berkas di folder `grafana/` saat diekspor di [9.2](#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit).

> ⬆️ **Selesai Praktik 2?** Lanjut ke [Praktik 3](#praktik-3--kebun-di-dashboard-teknis-paket-per-jam-dan-menit-terlambat-35-menit). Kolom sementara di [3.2](#32--tabel-menit-terlambat-kueri-yang-sama-dengan-alert-ditambah-kolom-terakhir_dilihat-sementara-15-menit) baru dijelaskan tuntas di [Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline), yang dibaca sesudah Praktik 3.

### Praktik 3 — Kebun di dashboard teknis: paket per jam dan menit terlambat (35 menit)

> 🖥️ **Alat yang dipakai:** **Chrome** atau **Edge** dengan Grafana di `http://localhost:3000`; **Docker Desktop** atau **Docker Engine** dengan `rumahpintar-db` dan `rumahpintar-grafana` menyala; **VS Code** dengan terminal `backend` (backend 1.1, `npm run dev`) yang tetap menyala, karena backend-lah yang menulis `readings`. Jalur laptop: broker dan simulator di terminal `alat` tetap menyala; jalur perangkat: Node 1 dan Node 2 berbaterai menyala. Konsep yang dipakai: 6 dan 7 (kolom sementara di 3.2).
>
> ⭐ **Wajib** — langkah 3.2: dashboard `Kesehatan Sistem` tersimpan dengan pesan `Praktik 3: …` dan lima panel, termasuk batang `Paket Node 2 per jam (seharusnya 12)` dan tabel `Menit terlambat dari jadwal` yang kuerinya sama persis dengan aturan *alert* di Praktik 4.

Node 2 tidak mengirim `vitals`, jadi tiga panel Praktik 2 tidak mengenalnya. Praktik ini menambah dua panel untuk dua pertanyaan [Konsep 6](#6-membaca-kesehatan-perangkat-rssi-uptime-heap-dan-paket-per-jam): apakah Node 2 bangun sesuai jadwal (12 paket per jam), dan sudah berapa menit setiap node terlambat dari jadwalnya. Angka kedua itulah yang kelak membangunkanmu lewat *alert*. Judul, keterangan, dan SQL di bawah sama persis dengan dashboard kunci [`kode/tahap/praktik-3/grafana/dashboards/kesehatan-sistem.json`](kode/tahap/praktik-3/grafana/dashboards/kesehatan-sistem.json).

**Jalur laptop:** Kebun tiruan baru menyala di [5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit), jadi panel batang masih kosong dan tabel belum punya baris Kebun. Rakit dan simpan keduanya sekarang; isinya muncul sendiri sesudah 5.1. **Jalur perangkat:** Node 2-mu sudah terdaftar sejak Modul 21, jadi kedua panel langsung berisi.

#### 3.1 Panel batang paket Node 2 per jam, dengan acuan 12 (12 menit)

1. Buka dashboard `Kesehatan Sistem`, klik **Edit**, lalu **Add → Panel** → **Configure visualization** (atau **Edit visualization**, seperti 2.3).
2. Klik **Code**, tempel kueri ini, ganti **Format** ke **Time series**, lalu klik **Run query**:

   ```sql
   SELECT p.jam AS "time", coalesce(d.nama, p.device_id) AS metric, p.jumlah_bacaan
   FROM readings_per_jam p JOIN devices d ON d.device_id = p.device_id
   WHERE $__timeFilter(p.jam) AND d.jenis = 'node2'
   ORDER BY 1
   ```

   `jumlah_bacaan` dari buku ringkasan per jam `readings_per_jam` ([Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis)) adalah banyaknya paket dalam satu jam. Panel ini sengaja tanpa `$node`: isinya selalu semua perangkat `node2`.

3. **All visualizations** → **Bar chart** (diagram batang). Isi **Title** `Paket Node 2 per jam (seharusnya 12)` dan **Description** `Node 2 bangun tiap 300 detik = 12 paket per jam. Jam yang batangnya pendek = Kebun sempat diam.`

   **Hasilnya (lab penulis, 03.51 WIB), sebelum diubah:** satu batang hijau `4` untuk jam 03.00 (Kebun menyala 03.31), label sumbu `2026`, dan legenda `< 80` / `80+`. Ambang bawaan merah di 80 muncul lagi, seperti panel Stat di 2.3.

4. **Thresholds**: ganti `80` menjadi `12`, klik titik warnanya dan pilih hijau (*green*), lalu klik titik warna `Base` dan pilih oranye (*orange*). **Color scheme** Bar chart sudah `From thresholds (by value)`, jadi batangnya langsung mengikuti ambang.
5. **Show thresholds**: pilih `As lines (dashed)`.
6. **Axis → Soft max** `14`. Tanpa batas lunak ini, garis 12 tidak terlihat selama batangnya masih pendek.
7. **Standard options → Decimals** (jumlah desimal) `0`, karena jumlah paket selalu bilangan bulat.

   **Hasilnya (lab penulis, 03.52 WIB):** batang oranye `5`, garis putus-putus di 12, legenda `< 12` / `12+`. Batang jam berjalan bertambah setiap paket (paket 03.51.48 baru masuk).

8. Klik **Back**. Simpannya nanti, di akhir 3.2.

Label `2026` bukan kesalahan: begitulah Bar chart menulis sumbunya selama datanya baru satu jam. Di lab penulis, sejak batang kedua labelnya menjadi `10/27 03:00`, `10/27 04:00`, dan pada 06.00 WIB panelnya menggambar `6` oranye lalu `12` dan `12` hijau (jam pertama Kebun hanya setengah jam). Jam saat Node 2 mati sama sekali tidak punya batang.

#### 3.2 ⭐ Tabel menit terlambat: kueri yang sama dengan *alert*, ditambah kolom `terakhir_dilihat` sementara (15 menit)

**Langkah 1 — tabelnya.**

1. **Add → Panel** → **Configure visualization** (atau **Edit visualization**) → **Code**, lalu tempel kueri ini. **Format** dibiarkan `Table` (bawaannya). Klik **Run query**:

   ```sql
   SELECT d.device_id, coalesce(d.nama, d.device_id) AS node,
          round((EXTRACT(EPOCH FROM now() - coalesce(r.diterima, d.terdaftar)) / 60
                 - CASE WHEN d.jenis = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS menit_terlambat
   FROM devices d
   LEFT JOIN LATERAL (SELECT diterima FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
   WHERE d.terdaftar IS NOT NULL AND d.dicabut IS NULL
   ```

   Inilah kueri aturan *alert* `Node diam` di [4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit), huruf demi huruf: satu baris per perangkat terdaftar yang kuncinya belum dicabut, dengan `menit_terlambat` dihitung dari bacaan terbarunya (`readings.diterima`) dan, untuk Node 2, dikurangi 5 menit jadwal bangunnya.

2. **All visualizations** → **Table**. Isi **Title** `Menit terlambat dari jadwal` dan **Description** `Kueri yang sama dengan aturan alert Node diam: lebih dari 5 = alert menyala. Node 2 sudah dikurangi 5 menit jadwal bangunnya.`
3. **Standard options → Decimals** `1`.
4. **Thresholds**: ganti `80` menjadi `5`; warnanya tetap merah dan `Base` tetap hijau. Angka 5 ini sama dengan ambang *alert*.
5. **Cell options → Cell type** (jenis sel): pilih `Colored text`, supaya warna ambang tampil di teks tabel.

**Hasilnya (lab penulis, ±03.54 WIB):** semua teks hijau, kecuali `32.9` yang merah.

```text
device_id      node                 menit_terlambat
f00d00000002   Latihan teras                   32.9
f00d000000b2   Kebun (tiruan)                  -3.3
f00d00000001   Latihan ruang tamu               0.1
```

`Latihan ruang tamu` (simulator) mengirim tiap 10 detik, jadi angkanya hampir 0. `Kebun (tiruan)` negatif: paket berikutnya belum jatuh tempo (di lab itu Kebun menyala lebih awal). `Latihan teras` merah: perangkat latihan yang terdaftar tetapi tidak dijalankan. Begitu aturan *alert* aktif, baris seperti ini langsung menjadi 🔴, jadi kuncinya dicabut dulu di [4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit). Catat `device_id` baris merah di tabelmu, kalau ada.

**Langkah 2 — kolom `terakhir_dilihat` sementara.** Daftar perangkat di dashboard React menulis "terakhir dilihat" dari kolom `devices.terakhir_dilihat`, sedangkan tabel ini memakai bacaan terakhir. Untuk membandingkan keduanya, hapus isi editor (**Ctrl + A**, lalu **Delete**), tempel kueri dengan dua kolom tambahan ini, lalu **Run query**:

```sql
SELECT d.device_id, coalesce(d.nama, d.device_id) AS node,
       round((EXTRACT(EPOCH FROM now() - coalesce(r.diterima, d.terdaftar)) / 60
              - CASE WHEN d.jenis = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS menit_terlambat,
       d.terakhir_dilihat,
       round((EXTRACT(EPOCH FROM now() - d.terakhir_dilihat) / 60)::numeric, 1)::float8 AS menit_sejak_terakhir_dilihat
FROM devices d
LEFT JOIN LATERAL (SELECT diterima FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
WHERE d.terdaftar IS NOT NULL AND d.dicabut IS NULL
```

**Hasilnya** (lab penulis, psql sebagai `grafana_baca`): untuk Node 1 yang sedang mengirim, kedua angka berdekatan (`Latihan ruang tamu` `0` dan `0`); untuk Node 2, angka kedua ±5 lebih besar karena tidak dikurangi 5 menit jadwal bangunnya (`Kebun (tiruan)` `4.8` dan `9.8`). Perangkat yang belum pernah tersambung punya `terakhir_dilihat` kosong. Bedanya muncul saat perangkat diam padahal pesan lainnya masih tiba. Tepat saat status `offline` Kebun terbit di Praktik 5, rekaman penulis menulis `menit_terlambat` `11` tetapi `menit_sejak_terakhir_dilihat` `0`. Diam tidak sama dengan *offline*; [Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline), yang kamu baca sesudah praktik ini, menjelaskan sebabnya.

Simpan kueri sementara ini di catatanmu (boleh dipakai lagi di [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit)), lalu **buang** dari panel: hapus isi editor, tempel lagi kueri Langkah 1, **Run query**, dan pastikan tabelnya kembali tiga kolom. Panel ini harus sama persis dengan kueri *alert*, supaya angka yang kamu lihat sama dengan angka yang membangunkanmu dan ekspor di 9.2 cocok dengan kunci.

**Langkah 3 — simpan dan cocokkan.**

1. Klik **Back**, lalu **Save**. Di laci `Save dashboard` (lab penulis: `Changes 4`), isi **Message** `Praktik 3: paket Node 2 per jam + menit terlambat`, klik **Save**, lalu **Exit edit**.
2. Di berkas kunci tadi, cari `"rawSql"` dua panel baru, `"axisSoftMax": 14`, `"decimals"`, `"mode": "dashed"`, dan `"type": "color-text"`. Di lab penulis, rakitan lewat layar ini sama dengan kunci dalam SQL, `fieldConfig`, dan `options` kelima panel.

Gambar di bawah diambil di lab penulis dari dashboard hasil impor JSON kunci, sesudah kunci `Latihan teras` dicabut (4.2) dan Kebun tiruan menyala (5.1), jadi tabelnya hanya dua baris.

![Tangkapan layar asli dashboard Kesehatan Sistem di Grafana 13.2.4 bertema gelap, Chrome 156 di Linux, Raspberry Pi 5 sebagai laptop, jendela 1280 kali 1000 piksel, akhir Praktik 3, ditangkap 09.03 WIB. Bilah atas: variabel Node berisi All (nomor 1); pemilih waktu Last 6 hours WIB, Refresh, 1m (nomor 2), tombol bagikan dan Edit. Kiri atas panel RSSI (kekuatan sinyal WiFi): garis hijau Latihan ruang tamu naik turun antara sekitar -45 dan -78 dbm sejak sekitar 07.37, garis putus-putus hijau di -75, sumbu -30 dbm sampai -90 dbm, jam 04:00 sampai 09:00 (nomor 3). Kanan atas panel Stat Uptime (lama menyala) berangka abu-abu besar 1 hour (nomor 4). Kiri tengah panel Heap (sisa memori), garis naik turun antara 180 kB dan 200 kB (nomor 5). Kanan tengah panel batang Paket Node 2 per jam (seharusnya 12): 10/27 07:00 bernilai 5 oranye, 10/27 08:00 bernilai 12 hijau sampai garis putus-putus 12, 10/27 09:00 bernilai 1 oranye; legenda kurang dari 12 dan 12+ (nomor 6). Kiri bawah tabel Menit terlambat dari jadwal, kolom device_id, node, menit_terlambat: f00d000000b2 Kebun (tiruan) -4.8 dan f00d00000001 Latihan ruang tamu 0.0, teks hijau (nomor 7). Isi dashboard sama dengan JSON kunci tahap praktik-3; Node 1 adalah simulator, Node 2 adalah Kebun tiruan yang menyala sejak 07.37 WIB dengan jeda 300 detik.](aset/dashboard-kesehatan-sistem.png)

**Kamu lulus langkah ⭐ ini** kalau dashboard `Kesehatan Sistem` berisi lima panel dan tersimpan dengan pesan `Praktik 3: …`, tabel `Menit terlambat dari jadwal` menulis satu baris per perangkat terdaftar dengan angka di atas 5 berwarna merah, dan kuerinya kembali sama persis dengan kueri *alert* (tanpa kolom `terakhir_dilihat`).

Tidak ada yang di-*commit*: dashboard ini baru menjadi berkas saat diekspor ke `grafana/` di 9.2.

#### 3.3 Tabel "berjaga sendiri" dari kejadian `mode-offline` (opsional, 8 menit)

[Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#711-jejaknya-di-database) mencatat setiap laporan mode offline di `events` berjenis `mode-offline`, supaya kelak dashboard bisa menghitung berapa lama dan berapa sering rumahmu "berjaga sendiri". Inilah panelnya: **Edit** → **Add → Panel** → **Configure visualization** (atau **Edit visualization**) → **Code**, tempel kueri di bawah, **Format** `Table`, **Run query**, **All visualizations** → **Table**, **Title** misalnya `Berjaga sendiri`, lalu **Back** dan **Save**.

```sql
SELECT e.waktu AS "time", coalesce(d.nama, e.device_id) AS node,
       (e.data->>'offline_s')::int AS detik_offline, (e.data->>'kipas_lokal')::int AS kipas_lokal_kali
FROM events e JOIN devices d ON d.device_id = e.device_id
WHERE e.jenis = 'mode-offline'
ORDER BY 1 DESC
```

`e.data->>'offline_s'` mengambil satu isian kolom JSON `data` sebagai teks, lalu `::int` menjadikannya angka. Tanpa `$__timeFilter`, semua kejadian ikut tampil, yang terbaru di atas.

**Hasilnya** (di psql sebagai `grafana_baca`): di lab penulis, database baru tanpa kejadian mode offline menjawab `(0 rows)`, jadi panelnya kosong. Di lab uji kode penulis, sesudah broker dihentikan ±155 detik, kueri yang sama menjawab satu baris: `Latihan ruang tamu`, `41` detik, kipas `6` kali. Jangan mematikan broker hanya untuk mengisinya: dengan backend 1.1, broker yang dimulai ulang bisa membuat kabar 📴 keliru ([🚨](#-kalau-tidak-jalan) *📴 palsu semenit sesudah broker dimulai ulang …*). Panel ini tidak ada di JSON kunci, jadi ekspormu di 9.2 akan berisi satu panel lebih; itu boleh.

> ⬆️ **Selesai Praktik 3?** Baca [Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline), lalu lanjut ke [Praktik 4](#praktik-4--alert-node-diam-dan-contact-point-telegram-55-menit).

### Praktik 4 — *Alert* "Node diam" dan *contact point* Telegram (55 menit)

> 🖥️ **Alat yang dipakai:** **Chrome** atau **Edge** dengan Grafana di `http://localhost:3000`, masuk sebagai `admin`; **VS Code** dengan berkas `backend/.env` (sumber token bot dan chat_id) dan terminal `backend` (backend 1.1, `npm run dev`) yang tetap menyala; **Bruno** (4.2); **aplikasi Telegram** di HP atau laptop; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana` menyala. Jalur laptop: broker dan simulator di terminal `alat` tetap menyala; jalur perangkat: Node 1 dan Node 2 menyala. Konsep yang dipakai: 7.
>
> ⭐ **Wajib** — langkah 4.1 dan 4.3: tombol **Test** *contact point* `Telegram Rumah Pintar` mengirim `🔴 Notification test` ke Telegram-mu (**G1**), dan aturan `Node diam` tersimpan di grup `kesehatan-node` dengan **Pending period** `None` dan **Normal** untuk *no data*, tanpa satu pun 🔴 bagi perangkat yang sedang berjalan.

Praktik ini memasang "petugas ronda" dari [Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline) beserta alamat kabarnya. Urutannya penting: alamat kabar dulu (4.1), lalu bersihkan daftar perangkat (4.2), baru aturannya (4.3); 4.4 dan 4.5 membaca hasilnya. Di Grafana 13.2.4 menunya bernama **Alerting** langsung di menu kiri; petunjuk di internet yang menyebut "Alerts & IRM" tidak cocok dengan layar ini ([🚨](#-kalau-tidak-jalan), tabel petunjuk lama).

#### 4.1 ⭐ *Contact point* `Telegram Rumah Pintar`: templat pesan dan tombol Test (15 menit)

*Contact point* adalah **alamat kabar**: ke mana dan dengan cara apa Grafana mengirim *alert*. Grafana memakai bot Modul 19 yang sama dengan backend, jadi tidak ada bot baru.

**Langkah 1 — siapkan token dan chat_id.** Di VS Code, buka `backend/.env`. Nilai `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` sudah kamu isi di [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#63-setelan-telegram-di-env). Salin nilainya (bagian sesudah `=`) satu per satu saat diminta di Langkah 2, langsung ke formulir Grafana, tidak ke berkas atau catatan lain.

> [!WARNING]
> Medan **BOT API Token** adalah kotak teks biasa: token tampil **utuh** begitu ditempel, juga saat laci **Edit Message** terbuka di sampingnya. Jangan menangkap layar, merekam, atau membagikan layar formulir ini. Sesudah **Save contact point**, token yang dibuka lagi hanya tertulis `configured` dengan tombol **Reset**, tetapi **Chat ID** tetap terlihat.

**Langkah 2 — isi formulirnya.**

1. Di menu kiri Grafana, klik **Alerting** → **Notification configuration** (pengaturan kabar). Halaman ini bertab **Contact points**, **Notification policies** (kebijakan kabar), **Templates**, dan **Time intervals**. Kartu bawaan `empty` (`No integrations configured`) dibiarkan.
2. Klik **New contact point** (judul halaman `Create contact point`), lalu isi **Name** `Telegram Rumah Pintar`.
3. **Integration** bawaannya `Email`: ketik `Telegram`, lalu pilih **Telegram**.
4. Tempel token di **BOT API Token** dan chat_id di **Chat ID**.
5. Klik **Optional Telegram settings**. Di **Parse Mode** (`Default is 'HTML'`), klik `Choose`, lalu pilih **None**. Dengan `None`, Grafana tidak mengirim medan `parse_mode`, jadi Telegram menerima teks polos tanpa tanda format.
6. Masih di bagian itu, klik **Edit Message**. Di laci `Edit Message`, pilih **Enter custom message**, tempel templat ini di kotak **Custom template value**, lalu klik **Save** di laci:

   ```text
   {{ range .Alerts.Firing }}🔴 {{ .Annotations.summary }}{{ "\n" }}{{ end }}{{ range .Alerts.Resolved }}✅ {{ .Labels.node }} kembali mengirim data.{{ "\n" }}{{ end }}
   ```

7. Buka **Notification settings**: **Disable resolved message** dibiarkan **mati**, supaya kabar ✅ ikut terkirim.

Satu pesan bisa membawa beberapa *alert*. Bagian `range .Alerts.Firing` menulis 🔴 diikuti ringkasan (`summary`) yang kamu tulis di aturan 4.3; bagian `range .Alerts.Resolved` menulis ✅, nama node (label `node` dari kuerimu), lalu `kembali mengirim data.`; `{{ "\n" }}` menutup setiap *alert* dengan baris baru. Tanpa templat ini, Grafana memakai pesan bawaan berbahasa Inggris yang berisi `**Firing**` dan tautan `localhost:3000` yang tidak bisa dibuka dari HP ([🚨](#-kalau-tidak-jalan) *Pesan Grafana berbahasa Inggris …*).

**Langkah 3 — tombol Test (G1), lalu simpan.**

1. Klik **Test**. Di dialog `Test contact point`, biarkan `Notification message` pada **Predefined**, lalu klik **Send test notification**.

   **Hasilnya:** Grafana menulis `Test notification sent successfully`, dan bot-mu mengirim pesan ke Telegram. Ini teks yang diterima server Telegram tiruan di lab penulis (03.59.57 WIB):

   ```text
   🔴 Notification test
   ```

   *Alert* uji buatan Grafana ringkasannya `Notification test`; 🔴 di depannya datang dari templatmu, jadi pesan ini sekaligus membuktikan templatnya terpakai. Baris baru dari `{{ "\n" }}` ikut terkirim tetapi tidak terlihat. Penulis tidak menguji bot sungguhan, jadi tampilan di aplikasi Telegram-mu kamu periksa sendiri. Pesan tidak datang atau Grafana menulis galat? Lihat [🚨](#-kalau-tidak-jalan) *Tombol Test gagal …*.

2. Klik **Save contact point**.

   **Hasilnya:** daftar *contact point* memuat `Telegram Rumah Pintar` · `Unused` · `Telegram` · `Sends notifications to Telegram`. `Unused` sampai aturan 4.3 memakainya.

Bot yang sama aman dipakai berdua karena Grafana hanya **mengirim** (penalaran penulis; belum diuji ke Telegram asli).

> [!TIP]
> Ingin kabar Grafana masuk ke grup Telegram tim? Tambahkan bot ke grup itu dan isi **Chat ID** dengan chat_id grupnya. Cara ini tidak diuji penulis; modul ini memakai chat pribadimu, sama dengan backend.

**Kamu lulus langkah ⭐ ini** kalau pesan `🔴 Notification test` dari bot-mu tiba di Telegram (**G1**), dan `Telegram Rumah Pintar` tersimpan dengan **Parse Mode** `None` serta templat di atas.

#### 4.2 Cabut dulu kunci perangkat yang tidak dijalankan (5 menit)

Kueri *alert* memberi satu baris untuk **setiap** perangkat yang terdaftar dan kuncinya belum dicabut. Perangkat terdaftar yang tidak kamu jalankan akan langsung dikabari 🔴 begitu aturan aktif, dan kalau kuncinya baru dicabut sesudah itu, barisnya hilang sehingga datang ✅ palsu ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)). Jadi, bersihkan daftarnya **sebelum** [4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit).

1. Buka dashboard `Kesehatan Sistem` dan lihat tabel `Menit terlambat dari jadwal` ([3.2](#32--tabel-menit-terlambat-kueri-yang-sama-dengan-alert-ditambah-kolom-terakhir_dilihat-sementara-15-menit)). Barisnya persis baris yang nanti diperiksa aturan. Baris merah yang `device_id`-nya kamu catat di sana biasanya perangkat yang memang tidak kamu jalankan.
2. **Jalur perangkat:** perangkat latihan `f00d00000001` dari Modul 21 umumnya masih ada di tabel, tanpa berjalan. Di Bruno, kirim **`login admin`**, lalu **`cabut kunci perangkat latihan`** apa adanya ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#72-lapis-pertama-cabut-di-backend-5-menit)). Node 1 dan Node 2-mu **tidak** dicabut. Node 2 yang terdaftar tetapi sedang mati akan langsung dikabari 🔴: kabar itu benar, jadi nyalakan Node 2 sebelum 4.3.
3. **Jalur laptop:** **jangan** cabut `f00d00000001`. Itu simulatormu, dan di [5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit) ia juga menjadi penghubung Kebun tiruan. Untuk perangkat lain yang tidak berjalan (misalnya `f00d00000002`, kalau pernah kamu daftarkan), kirim **`login admin`**, *clone* **`cabut kunci perangkat latihan`**, ganti URL-nya menjadi `{{baseUrl}}/devices/f00d00000002/cabut`, kirim, lalu hapus lagi *clone* itu. Tidak ada perangkat lain di tabel? Lewati langkah ini.

**Hasilnya (lab penulis, `f00d00000002`):** `200 OK` dengan jawaban (dirapatkan):

```text
{"device_id":"f00d00000002","dicabut":"2026-10-26T21:00:24Z","langkah":["Hapus akunnya dari broker: mosquitto_passwd -D <berkas sandi broker> f00d00000002","Muat ulang broker (Pi: sudo systemctl reload mosquitto; laptop: Ctrl + C lalu jalankan lagi)"]}
```

Daftar `langkah` mengingatkan lapis kedua di broker (Modul 21). Perangkat yang tidak berjalan tidak tersambung ke broker, jadi lapis itu boleh kamu kerjakan kapan saja; *alert* hanya membaca kolom `dicabut`. Jawabannya `401` `{"pesan":"belum login atau sesi sudah habis: login lewat POST /auth/login"}`? Gelang aksesmu yang 15 menit (Modul 20) sudah habis: kirim `login admin` lagi, lalu ulangi.

Muat ulang dashboard. **Hasilnya (lab penulis):** baris `Latihan teras` (`f00d00000002`) yang tadinya merah `32.9` hilang dari tabel, juga dari daftar `Node`. Di Peta nanti (Praktik 7) perangkat itu tetap tampil sebagai lingkaran abu-abu.

#### 4.3 ⭐ Aturan `Node diam`: kueri, ambang 5 menit, grup `kesehatan-node`, dan dua bawaan yang diganti (20 menit)

Formulir aturan bernomor 1–6. Ikuti dari atas; dua isian bawaan **wajib** diganti (**Pending period** dan *no data*), alasannya ada di Konsep 7.

1. Di menu kiri, klik **Alerting → Alert rules** (`Rules that determine whether an alert will fire`), lalu **New alert rule**.
2. **1. Enter alert rule name** → **Name** `Node diam`.
3. **2. Define query and alert condition**: sakelar **Advanced options** dibiarkan **mati**. *Data source* `grafana-postgresql-datasource` sudah terpilih, dan **Format** `Table` sudah bawaan (jangan diganti). Ganti **Builder** ke **Code**, lalu tempel (**Ctrl + V**) kueri yang sama dengan tabel 3.2 dan kunci [`node-diam.yaml`](kode/grafana/alerting/node-diam.yaml):

   ```sql
   SELECT d.device_id, coalesce(d.nama, d.device_id) AS node,
          round((EXTRACT(EPOCH FROM now() - coalesce(r.diterima, d.terdaftar)) / 60
                 - CASE WHEN d.jenis = 'node2' THEN 5 ELSE 0 END)::numeric, 1)::float8 AS menit_terlambat
   FROM devices d
   LEFT JOIN LATERAL (SELECT diterima FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true
   WHERE d.terdaftar IS NOT NULL AND d.dicabut IS NULL
   ```

   Kueri ini tanpa `$node` (variabel tidak berlaku di *alert*, [Konsep 5](#5-variabel-satu-dashboard-untuk-semua-perangkat)) dan tanpa `$__timeFilter`, jadi rentang `10m to now` di **Options** tidak dipakainya. Klik **Run query**.

   **Hasilnya (lab penulis):** pratinjau `Table` berisi `{device_id="f00d00000001", node="Latihan ruang tamu"}` `0` dan `{device_id="f00d000000b2", node="Kebun (tiruan)"}` `-0.7`. Kebun sudah menyala lebih awal di lab itu; di jalur laptopmu baris Kebun baru muncul sesudah 5.1, dan di jalur perangkat kamu melihat Node 1 dan Node 2-mu. Angka negatif Kebun berarti paket berikutnya belum jatuh tempo. Kalau 4.2 terlewat, perangkat yang tidak berjalan ikut tampil: di lab uji kode penulis, `Latihan teras` `9.2`.

4. Di **Alert condition**, biarkan `WHEN` **Last** `OF QUERY` **IS ABOVE**, lalu ganti angka `0` menjadi `5`. Klik **Preview alert rule condition**.

   **Hasilnya (lab penulis):** setiap node `0` `Normal`. Kolom kondisi menulis `0` atau `1` (melewati ambang), bukan menit. Di lab uji kode tadi, baris `Latihan teras` langsung `1` `Firing`. Di belakang layar Grafana menyusunnya menjadi tiga langkah, A kueri → B *Reduce* **Last** → C *Threshold* `> 5`; nama A, B, C itu muncul lagi di tab **History** ([5.5](#55-riwayat-aturan-di-tab-history-2-menit)) dan di berkas ekspor (9.2).

5. **3. Add folder and labels** → **Folder**: klik `Select folder`, lalu pilih `Rumah Pintar Mini`. **Labels** dibiarkan kosong.
6. **4. Set evaluation behavior** → **New evaluation group**. Isi **Evaluation group name** `kesehatan-node`, biarkan **Evaluation interval** `1m`, lalu **Create**. Layar menulis `All rules in the selected group are evaluated every 1m.`
7. **Pending period** bawaannya `1m`: ganti menjadi **None** (bawaan pertama yang diganti). Dengan `1m`, setiap 🔴 terlambat semenit dari rumus Konsep 7. **Keep firing for** tetap `None`.
8. Buka **Configure no data and error handling**. **Alert state if no data or all values are null** bawaannya `No Data`: ganti menjadi **Normal** (bawaan kedua). **Alert state if execution error or timeout** tetap `Error`, dan **Missing series evaluations to resolve** dibiarkan kosong.
9. **5. Configure notifications** → **Contact point**: pilih `Telegram Rumah Pintar`. Buka **Muting, grouping and timings (optional)**, nyalakan **Override grouping**, lalu di **Group by** ketik `device_id` dan tekan **Enter** (pilihan `device_id Hit enter to add`). Isinya kini `grafana_folder`, `alertname`, dan `device_id`. **Override timings** dibiarkan mati; di bawahnya tertulis `Group wait: 30s, Group interval: 5m, Repeat interval: 4h` (4.4).
10. **6. Configure notification message** → **Summary (optional)**, tempel (**Description** dan **Runbook URL** dibiarkan kosong):

    ```text
    {{ $labels.node }} ({{ $labels.device_id }}) tidak mengirim data, terlambat {{ with $values.A }}{{ .Value }}{{ end }} menit dari jadwalnya
    ```

    `$labels.node` dan `$labels.device_id` adalah dua kolom teks kuerimu; `$values.A` adalah angka `menit_terlambat`. Templat 4.1 menaruh kalimat ini sesudah 🔴.

11. Klik **Save**.

**Hasilnya (lab penulis):** halaman aturan `Node diam` berstatus `Normal`, dengan `Notifications are delivered to Telegram Rumah Pintar`, `Evaluation interval Every 1m`, ringkasanmu, dan tab **Query and conditions**, **Instances**, **History**, serta **Versions**. Evaluasi pertama berjalan kurang dari semenit sesudah **Save**, semua node `Normal`, dan tidak ada satu pun pesan 🔴: urutan 4.2 → 4.3 sudah benar.

**Kamu lulus langkah ⭐ ini** kalau aturan `Node diam` ada di folder `Rumah Pintar Mini`, grup `kesehatan-node` tiap `1m`, berstatus `Normal`, dan dalam 3 menit sesudah **Save** tidak ada 🔴 untuk perangkat yang sedang berjalan. Ada 🔴 untuk perangkat yang memang tidak kamu jalankan? Baca dulu [🚨](#-kalau-tidak-jalan) *🔴 untuk perangkat yang memang tidak dijalankan …* sebelum mencabut kuncinya. Kalau kelak tak pernah menyala atau selalu terlambat semenit, lihat *Alert tidak pernah menyala …*.

#### 4.4 Pengelompokan kabar: *group wait*, *group interval*, dan *repeat interval* (8 menit)

Langkah ini hanya membaca. Pengelompokan sudah kamu atur di aturannya sendiri (**Override grouping**, 4.3 nomor 9), jadi tab **Notification policies** tidak disentuh, dan tiga jeda bawaannya sudah cocok. Begini kerjanya pada satu node di lab penulis, saat simulator dimatikan di Praktik 5:

| Jam WIB | Yang terjadi |
| :--- | :--- |
| 06.07.30 | evaluasi: `Latihan ruang tamu` melewati 5 → `Alerting` |
| 06.08.00 | 🔴 terkirim sesudah *group wait* 30 detik |
| 06.13.00 | detak *group interval* pertama: belum ada yang berubah, tanpa pesan |
| 06.14.30 | evaluasi: simulator mengirim lagi → `Normal` |
| 06.18.00 | ✅ terkirim pada detak berikutnya |

*Repeat interval* 4 jam adalah pengingat untuk node yang masih diam (menurut dokumentasi; tidak ditunggu penulis).

**Kenapa `device_id`?** Pengelompokan bawaan hanya `grafana_folder` dan `alertname`, jadi semua node sekelompok: di riset penulis, dua node yang diam datang dalam **satu** pesan, dan node yang pulih dikabarkan bersama node lain yang masih diam. Dengan `device_id`, setiap node punya pesan dan detaknya sendiri.

**Detik evaluasi.** Grup berjalan pada detik yang sama setiap menit, tetapi detiknya dipilih Grafana: di tiga larian lab penulis `:30`, `:50`, dan `:00`. Kolom `Created` di 4.5 memperlihatkan detik grupmu. Inilah "0–60 detik evaluasi" di rumus Konsep 7.

#### 4.5 Status per node di tab Instances: Normal dan Firing (7 menit)

Buka halaman aturan (**Alerting → Alert rules** → `Node diam`), lalu klik tab **Instances**.

**Hasilnya (lab penulis, sesudah 4.3):** `Instances 2`, tabel `State` · `Labels` · `Created` · `Destination` dengan dua baris `Normal`: `device_id f00d00000001` `node Latihan ruang tamu` `+5 common labels` `2026-10-27 07:52:00` `Telegram Rumah Pintar`, dan baris serupa untuk `f00d000000b2` `Kebun (tiruan)`. Di jalur laptop kamu baru melihat satu baris; Kebun bergabung sendiri sesudah [5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit) tanpa aturan diubah.

- Satu baris = satu *instance* (instans) per node. Labelnya dari dua kolom teks kuerimu; `+5 common labels` = label yang sama untuk semua baris, misalnya `alertname` dan `grafana_folder`.
- Saringan `State` mendaftar `Normal`, `Alerting`, `Pending`, `Recovering`, `NoData`, dan `Error`. Yang akan kamu temui: `Normal`; `Alerting` saat node diam (kepala halaman aturan lalu menulis `Firing`); dan `Error` tanpa label node bila Grafana gagal membaca database (Konsep 7, risiko 3). `Pending` tidak akan terisi, karena **Pending period** `None`.
- Halaman aturan juga merangkum `Pending period 0s` dan `Keep firing for 0s`: cara cepat memastikan bawaan pertama di 4.3 sudah diganti.

Gambar di bawah menggabungkan formulir 4.3, *contact point* 4.1 yang dibuka lagi sesudah disimpan (tokennya tertulis `configured`), dan tab **Instances**. Bagian kanan bawah gambar = keadaan sesudah Praktik 5.3 (Kebun dicabut); di 4.5 kedua baris masih `Normal`.

![Komposit tangkapan layar asli Grafana 13.2.4 bertema gelap di Chrome 156, Linux di Raspberry Pi 5 sebagai laptop, Praktik 4 dan 5. Atas, langkah 4.3 New alert rule bagian 2. Define query and alert condition, sakelar Advanced options mati: grafana-postgresql-datasource, Options 10m to now, Format Table (nomor 1), kueri Code enam baris SELECT d.device_id, coalesce(d.nama, d.device_id) AS node, round((EXTRACT(EPOCH FROM now() - coalesce(r.diterima, d.terdaftar)) / 60 - CASE WHEN d.jenis = node2 THEN 5 ELSE 0 END)::numeric, 1)::float8 AS menit_terlambat FROM devices d LEFT JOIN LATERAL (SELECT diterima FROM readings WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) r ON true WHERE d.terdaftar IS NOT NULL AND d.dicabut IS NULL (nomor 1). Pratinjau Table: device_id f00d000000b2, node Kebun (tiruan), -4.3 dan device_id f00d00000001, node Latihan ruang tamu, 0.2 (nomor 2). Alert condition: WHEN Last OF QUERY IS ABOVE 5 (nomor 3); pratinjau kondisi kedua node 0 Normal (nomor 4). Kiri bawah, langkah 4.1 contact point yang dibuka lagi sesudah disimpan: Name Telegram Rumah Pintar (nomor 5), Integration Telegram, BOT API Token tertulis configured dengan tombol Reset sehingga token tidak terlihat (nomor 5), Chat ID berisi angka palsu lab, Optional Telegram settings terbuka, Message berisi awal templat range .Alerts.Firing 🔴 .Annotations.summary ... range .Alerts.Resolved ✅ dengan tombol Edit Message (nomor 6), Parse Mode None (nomor 6). Kanan bawah, langkah 5.3 aturan Node diam berstatus Firing merah (nomor 7), tab Instances 2, filter Normal 1 dan Alerting 1; baris Alerting device_id f00d000000b2 node Kebun (tiruan) dibuat 2026-10-27 09:13:00 (nomor 7) dan baris Normal device_id f00d00000001 node Latihan ruang tamu 07:52:00 (nomor 7), tujuan Telegram Rumah Pintar. Status Alerting dibuat dengan kebun cabut pada Kebun tiruan; Telegram adalah server Bot API tiruan.](aset/alert-node-diam.png)

Tidak ada yang di-*commit* di praktik ini: aturan dan *contact point* tinggal di lemari Grafana (`rumahpintar-grafana-data`). Aturannya diekspor sebagai arsip YAML di [9.2](#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit); *contact point*, yang memuat token, tidak pernah diekspor.

> ⬆️ **Selesai Praktik 4?** Lanjut ke [Praktik 5](#praktik-5--cabut-baterai-kebun-alert-dan-pulih-45-menit). Siapkan [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi) untuk dibaca selagi menunggu kabar Grafana di [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit).

### Praktik 5 — Cabut baterai Kebun: *alert* dan pulih (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal `backend` (backend 1.1, `npm run dev`), terminal `frontend` (Vite), dan satu terminal kosong untuk Git; jalur laptop juga terminal broker (folder `edge`) dan terminal `alat` (simulator). **Bruno** (5.1, jalur laptop); **Chrome** atau **Edge** dengan Grafana di `http://localhost:3000` dan dashboard React di `http://localhost:5173`; **aplikasi Telegram**; **Docker Desktop** atau **Docker Engine** dengan `rumahpintar-db` dan `rumahpintar-grafana`. Jalur perangkat: Node 1 menyala, Node 2 berbaterai 18650 di dudukannya. Konsep yang dipakai: 7 (Konsep 8 dibaca sambil menunggu).
>
> ⭐ **Wajib** — langkah 5.3 dan 5.4: sesudah baterai Kebun dicabut, Grafana mengirim 🔴 ke Telegram-mu dalam 5,5–11,5 menit (**G2** bagian 1); sesudah dipasang lagi, ✅ `… kembali mengirim data.` (**G2** bagian 2), dan jam-jamnya tercatat di lembar catatan.

Inilah syarat lulus Silabus yang sesungguhnya: Grafana mengabarimu saat baterai Node 2 dicabut. Jalur laptop "mencabut baterai" Kebun tiruan dengan `kebun cabut`. Sebagian besar waktunya menunggu, karena jeda bangun 300 detik sengaja tidak dipercepat: ambang *alert* terikat jadwal itu.

#### 5.1 Siapkan Kebun: Node 2 yang terdengar, atau Kebun tiruan dari simulator (15 menit)

**Jalur perangkat (±3 menit).** Node 2-mu sudah terdaftar sejak Modul 21 (Bruno `daftarkan Node 2 lewat Node 1`). Pastikan ia terdengar: tabel `Menit terlambat dari jadwal` ([3.2](#32--tabel-menit-terlambat-kueri-yang-sama-dengan-alert-ditambah-kolom-terakhir_dilihat-sementara-15-menit)) punya barisnya, dan panel `Paket Node 2 per jam (seharusnya 12)` berisi batang ±12 untuk jam penuh. Batang jauh di atas 12 berarti jadwal uji 60 detik Modul 14 masih terpasang; kembalikan dulu ke 300 detik. Blok ACL 2b tidak perlu. Lanjut ke 5.2.

**Jalur laptop.** Kerjakan urut; urutan 2 → 3 → 4 tidak boleh ditukar.

1. **Simulator versi Modul 25.** Di terminal `alat`, tekan **Ctrl + C**. Simulator Modul 24 belum mengenal `kebun …`: buka [`kode/alat/simulator-perangkat.js`](kode/alat/simulator-perangkat.js) di GitHub, klik **Copy raw file**, lalu tempel sebagai isi `alat/simulator-perangkat.js`-mu (perubahannya: [`kode/alat.diff`](kode/alat.diff)). Jangan dijalankan dulu. Berhenti lebih dari semenit? Backend mengabari `📴 f00d00000001 offline sejak …`, dan lewat ±6 menit Grafana `🔴 Latihan ruang tamu …`: keduanya benar.
2. **Izin broker.** Blok `# 2b) Jalur laptop (Modul 25)` baru ada di [`kode/edge/acl-broker`](kode/edge/acl-broker): salin keenam barisnya ke bawah butir 2 `edge/acl-broker`-mu. Hapus `# ` (pagar dan spasinya) di depan tiga baris terakhirnya saja, bukan di baris penjelasan, sehingga menjadi:

   ```text
   user f00d00000001
   topic write rpm/f00d000000b2/telemetry
   topic write rpm/f00d000000b2/status
   ```

   Simpan. Akun simulator `f00d00000001` kini boleh menulis topik Kebun, persis seperti Node 1 menulis atas nama Node 2 ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#52-tulis-daftar-izin-edgeacl-broker-10-menit)).
3. **Mulai ulang broker** (*restart*, bukan *reload*; aturan Modul 21). Di terminal broker, tekan **Ctrl + C**, lalu jalankan lagi `mosquitto -v -c mosquitto-lan.conf`. Broker-mu di Pi? Salin `acl-broker` ke Pi seperti di Modul 21, lalu `sudo cp ~/acl-broker /etc/mosquitto/` dan `sudo systemctl restart mosquitto`.

   **Hasilnya (lab penulis; versi Mosquitto-mu boleh berbeda):** broker menulis `mosquitto version 2.0.22 terminating`, lalu sesudah perintahnya diketik lagi `Config loaded from mosquitto-lan.conf.` dan `mosquitto version 2.0.22 running`. Selama broker mati, terminal `backend` mengulang `WARN: broker belum terjangkau, …` dan `ERROR: galat MQTT: connect ECONNREFUSED …` (wajar), lalu menulis `INFO: tersambung ke broker mqtt://127.0.0.1:1883 sebagai backend`. Salah ketik di `acl-broker` membuat broker gagal menyala.
4. **Mulai ulang backend juga.** Di terminal `backend`, tekan **Ctrl + C**, lalu `npm run dev`.

> [!IMPORTANT]
> Jangan lewati langkah 4. Backend 1.1 menyimpan kabar status di ingatannya. Sesudah broker dimulai ulang, perangkat yang tersambung lebih dulu daripada backend bisa membuat backend mengirim `📴 … offline sejak …` **palsu** semenit kemudian, lalu diam saat perangkat itu benar-benar mati (Kebun tidak terkena). Memulai ulang backend menghapus ingatan itu (juga ingatan 📴 di langkah 1, jadi ✅-nya tidak akan datang). Backend 1.2 memperbaikinya di [6.3](#63-mqttts-tidak-lagi-mengirim-kabar-offline-palsu-lalu-npm-run-cek-dan-npm-test-10-menit); gejalanya ada di [🚨](#-kalau-tidak-jalan) *📴 palsu semenit …*.

5. **Daftarkan Kebun.** Buat berkas BARU di folder `backend/bruno`, bernama persis `daftarkan Kebun tiruan.yml`:

   ```yaml
   info:
     name: daftarkan Kebun tiruan
     type: http
     seq: 26

   http:
     method: POST
     url: "{{baseUrl}}/devices"
     body:
       type: json
       data: |-
         {
           "device_id": "f00d000000b2",
           "nama": "Kebun (tiruan)",
           "lokasi": "kebun",
           "penghubung": "f00d00000001"
         }
     auth: inherit

   runtime:
     assertions:
       - expression: res.status
         operator: eq
         value: "201"

   settings:
     encodeUrl: true
     timeout: 0
     followRedirects: true
     maxRedirects: 5
     forwardAuthorizationHeader: true
   ```

   Di Bruno, kirim **`login admin`**, lalu **`daftarkan Kebun tiruan`**. Bentuknya sama dengan `daftarkan Node 2 lewat Node 1` di [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#18-lima-permintaan-bruno-8-menit): Kebun `f00d000000b2` tidak punya kunci, karena datanya diterbitkan penghubungnya, `f00d00000001`. Jadi, `alat/.env` tidak berubah.

   **Hasilnya (lab penulis; isi berkas ini dikirim lewat `curl`, bukan aplikasi Bruno):** `201` dengan jawaban:

   ```text
   {"device_id":"f00d000000b2","kunci":null,"langkah":["Perangkat ESP-NOW tanpa kunci. Pastikan tiga baris ini ada di berkas ACL broker, lalu restart broker:","user f00d00000001","topic write rpm/f00d000000b2/telemetry","topic write rpm/f00d000000b2/status"]}
   ```

   Log backend: `perangkat f00d000000b2 didaftarkan oleh akun 1 (lewat f00d00000001)`. Daftar `langkah` = tiga baris yang sudah kamu buka di langkah 2. Jawabannya `409`? Baca `pesan`-nya: Kebun sudah terdaftar (lanjut saja), atau `f00d00000001` belum terdaftar atau sudah dicabut (ingat 4.2: jangan dicabut).
6. **Nyalakan Kebun.** Di terminal `alat`, jalankan `node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1`, tunggu `f00d00000001: online`, lalu ketik `kebun mulai` dan **Enter**.

   **Hasilnya (persis, lab penulis):**

   ```text
   1 perangkat palsu menuju mqtt://127.0.0.1:1883. Ketik misalnya "suhu 33", "tanah 25", "tandon 15", "tanah acak", atau "kebun mulai". Hentikan dengan Ctrl+C.
   f00d00000001: online
   kebun mulai
   Kebun tiruan f00d000000b2 menyala lewat f00d00000001: satu paket sekarang, lalu setiap 300 detik.
   f00d000000b2: Kebun bangun pukul 03.31.48 WIB, paketnya diterbitkan f00d00000001
   ```

   Baris `Kebun bangun pukul …` (jam WIB) muncul lagi setiap 300 detik. Muat ulang dashboard `Kesehatan Sistem`: tabel 3.2 kini punya baris `Kebun (tiruan)` dengan angka negatif (paket berikutnya belum jatuh tempo), panel batang mulai terisi, dan tab **Instances** aturan `Node diam` menjadi dua baris tanpa aturannya diubah ([4.5](#45-status-per-node-di-tab-instances-normal-dan-firing-7-menit)).

**Kalau `kebun mulai` diketik sebelum blok 2b terbuka dan broker dimulai ulang**, simulator tetap menulis `Kebun bangun …`, tetapi broker membuang paketnya diam-diam. Hanya terminal broker yang tahu (angka depan = jam dalam detik *epoch*):

```text
1793046644: Denied PUBLISH from f00d00000001 (d0, q0, r0, m0, 'rpm/f00d000000b2/telemetry', ... (116 bytes))
```

Buka blok 2b, lalu ulangi langkah 3 dan 4. Paket berikutnya, paling lama 300 detik kemudian, akan lolos. Masih senyap? Lihat [🚨](#-kalau-tidak-jalan) *Kebun tiruan tidak terdengar …*.

#### 5.2 Catat paket terakhir, lalu cabut baterainya (3 menit)

Rumus Konsep 7 dihitung dari **paket terakhir**, jadi catat jamnya dulu (lembar catatan 5.4). Waktu mencabutnya bebas: sesaat sesudah sebuah paket, 🔴 datang paling lambat; sesaat sebelum paket berikutnya, paling cepat.

- **Jalur laptop:** paket terakhir = baris `Kebun bangun pukul …` terakhir di terminal `alat`. Ketik `kebun cabut`, lalu **Enter**. Simulator dan "Node 1"-nya tetap menyala.
- **Jalur perangkat:** klik **Refresh** dashboard, lalu baca angka Node 2 di tabel 3.2: paket terakhir ≈ jam sekarang − (5 + angka itu) menit. Misalnya `-4.3` pukul 10.00 berarti ±09.59.20. Lalu cabut baterai 18650 dari dudukannya dengan cara aman [Modul 14](../../fase-2-konektivitas/modul-14-node-2-esp-now/README.md#46-node-2-pindah-ke-baterai), dan pastikan USB Node 2 tidak tercolok (USB juga memberinya listrik). Catat jam mencabutnya.

**Hasilnya (persis, lab penulis, dicabut 9 detik sesudah paket):**

```text
kebun cabut
Baterai Kebun DICABUT pukul 06.18.49 WIB. Paket terakhirnya pukul 06.18.40 WIB; status offline baru terbit sekitar pukul 06.34.40 WIB (960 detik sesudah paket terakhir).
```

#### 5.3 ⭐ Hitung perkiraan, tunggu kabar Grafana, lalu bandingkan dengan kabar backend (15 menit)

**Hitung dulu**, dengan rumus [Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline): 🔴 Grafana = paket terakhir + 10,5–11,5 menit; 📴 backend = paket terakhir + ±17 menit (960 + 60 detik). Di lab penulis: paket terakhir 06.18.40 → 🔴 06.29.10–06.30.10, 📴 ±06.35.40. Tulis perkiraanmu.

**Sambil menunggu:**

- Baca [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi) (peta), bekal Praktik 7.
- Di dashboard `Kesehatan Sistem` (segar tiap menit), angka Node 2 di tabel 3.2 naik ±1 per menit dan memerah lewat 5; batang jam ini berhenti bertambah. Tab **Instances** aturan `Node diam` lalu menulis `Alerting`.
- Di Daftar dashboard React, kartu Node 2-mu tetap berlencana `Online`: diam tidak sama dengan *offline*. Di lab penulis, `GET /devices` masih menulis Kebun `online` 9 min 41 s sesudah dicabut, saat tabel 3.2 sudah `4.8`. Statusnya baru `offline` 960 detik sesudah paket terakhir. Tepat saat itu, kueri sementara 3.2 (psql sebagai `grafana_baca`, cara masuk [1.4](#14--uji-grafana_baca-di-psql-boleh-membaca-ditolak-menulis-10-menit)) menulis `menit_terlambat` `11` tetapi `menit_sejak_terakhir_dilihat` `0`.

**Hasilnya (seperti yang diterima server Telegram tiruan di lab penulis).** Pukul 06.30.00, 11 min 10 s sesudah `kebun cabut`, dari Grafana:

```text
🔴 Kebun (tiruan) (f00d000000b2) tidak mengirim data, terlambat 5.8 menit dari jadwalnya
```

Pukul 06.34.41 terminal `alat` menulis `f00d000000b2: tidak ada paket Kebun selama 960 detik: f00d00000001 menerbitkan status offline pukul 06.34.41 WIB`, dan semenit kemudian (06.35.41, 17 min 0,8 s sesudah paket terakhir) dari backend:

```text
📴 f00d000000b2 offline sejak 06.34 WIB
```

`5.8` adalah menit lewat jadwal saat evaluasi 06.29.30 (Grafana menulis titik desimal). Lab penulis memakai backend 1.2; kabar 📴/✅ untuk kejadian ini sama dengan 1.1. Di larian kedua, Kebun dicabut 6 detik sebelum paket berikutnya, dan 🔴 tiba 6 min 20 s sesudah dicabut. Jalur perangkat (tidak direkam penulis): nama dan `device_id`-nya milik Node 2-mu. Dua pesan untuk satu kejadian memang disengaja: Grafana untuk tim teknis, lebih dari 5 menit lebih awal; backend untuk penghuni ([🚨](#-kalau-tidak-jalan) *Dua pesan untuk satu kejadian …*). 🔴 belum datang 12 menit sesudah dicabut? Lihat *Alert tidak pernah menyala …* di 🚨.

**Kamu lulus langkah ⭐ ini** kalau 🔴 untuk Kebun atau Node 2-mu tiba di Telegram 5,5–11,5 menit sesudah baterai dicabut (**G2** bagian 1), dan jam 🔴 serta 📴 tercatat.

#### 5.4 ⭐ Pasang lagi: dua kabar pulih dan lembar catatan waktunya (10 menit)

Pasang **sesudah** 📴 backend tiba; kalau lebih awal, backend tidak mengirim 📴 maupun ✅ untuk dibandingkan.

- **Jalur laptop:** ketik `kebun pasang`.
- **Jalur perangkat:** pasang lagi baterainya di dudukan; Node 2 terdengar lagi begitu paket pertamanya tiba.

**Hasilnya (persis, lab penulis):**

```text
kebun pasang
Baterai Kebun dipasang lagi pukul 06.35.46 WIB: Kebun langsung bangun, lalu setiap 300 detik.
f00d000000b2: Kebun bangun pukul 06.35.46 WIB, paketnya diterbitkan f00d00000001
```

Server Telegram tiruan menerima dua kabar pulih: seketika dari backend, lalu pukul 06.40.00 dari Grafana.

```text
✅ f00d000000b2 online lagi (offline 1 menit)
✅ Kebun (tiruan) kembali mengirim data.
```

✅ Grafana menunggu: evaluasi 06.36.30 melihat Kebun pulih (`Normal`), lalu kabarnya ikut detak *group interval* 5 menit sejak 🔴 06.30.00. `offline 1 menit` dihitung backend sejak status `offline`, bukan sejak dicabut.

**Lembar catatan G2.** Salin ke catatanmu (nanti masuk `belajar-iot/modul-25/`, [➕ G](#g-simpan-catatan-belajar-dan-bukti-checkpoint-fase-4)), lalu isi kolom terakhir:

| Kejadian | Lab penulis (WIB) | Selisih di lab | Jam-mu |
| :--- | :--- | :--- | :--- |
| paket terakhir | 06.18.40 | 0 | |
| baterai dicabut | 06.18.49 | +9 s | |
| 🔴 Grafana | 06.30.00 | cabut + 11 min 10 s | |
| 📴 backend | 06.35.41 | paket + 17 min 0,8 s | |
| baterai dipasang | 06.35.46 | — | |
| ✅ backend | 06.35.46 | seketika | |
| ✅ Grafana | 06.40.00 | pasang + 4 min 13 s | |

Cocokkan dengan perkiraanmu di 5.3. Di lab penulis, ✅ Grafana tiba 3 min 22 s – 4 min 26 s sesudah pulih; batasnya sekitar 5 menit sesudah evaluasi yang melihatnya pulih.

**Kamu lulus langkah ⭐ ini** kalau `✅ … kembali mengirim data.` dari Grafana tiba dalam batas itu (**G2** bagian 2), dan lembar catatanmu terisi. G2 dicentang lagi di [10.4](#104--gladi-akhir-tes-backend-build-frontend-dan-tiga-syarat-lulus-20-menit).

#### 5.5 Riwayat aturan di tab History (2 menit)

Buka **Alerting → Alert rules** → `Node diam`, lalu tab **History** (riwayat). Isinya satu blok per instans, dengan kolom `State` dan `Time` (WIB).

**Hasilnya (lab penulis, blok Kebun; layar menulis satu nilai per baris, di sini dirapatkan):**

```text
{alertname=Node diam, device_id=f00d000000b2, grafana_folder=Rumah Pintar Mini, node=Kebun (tiruan)}
Normal                   Node diam - A=-4.300000, B=-4.300000, C=0.000000         2026-10-27 06:36:30
Alerting                 Node diam - A=5.800000, B=5.800000, C=1.000000           2026-10-27 06:29:30
```

A = hasil kueri (`menit_terlambat`), B = *Reduce* **Last**, C = *Threshold* (`1` = melewati 5). `Time` = jam evaluasi, bukan jam pesan. Blok `Normal (Missingseries)` berarti barisnya hilang dari hasil kueri, misalnya kunci perangkat dicabut sesudah aturan aktif ([4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit) terbalik). Blok `Error` tanpa label node berarti Grafana gagal membaca database (Konsep 7, risiko 3).

**Catatan jujur tentang Kebun tiruan.** Simulator yang dihentikan dengan **Ctrl + C** membuat Kebun ikut diam, tetapi statusnya tertinggal `online`: Kebun tanpa wasiat, dan penerbitnya sudah mati, persis Node 2 asli saat Node 1 padam. Paket Kebun selama simulator terputus dari broker juga hilang (Node 1 asli menyimpannya di rak tunggu): penyederhanaan yang disengaja. Di lab penulis, sesudah **Ctrl + C**: 🔴 `Latihan ruang tamu` 5 min 58 s kemudian, 🔴 Kebun 11 min 12 s sesudah paket terakhirnya, dan tidak pernah ada 📴 Kebun. Akibatnya terlihat lagi di Peta, [7.4](#74--uji-peta-atribusi-status-live-akun-viewer-hp-375-px-dan-mode-gelap-10-menit).

**Simpan ke cabang (jalur laptop).** Di terminal kosong (folder `rumah-pintar-mini`):

```text
git add alat/simulator-perangkat.js edge/acl-broker backend/bruno
git commit -m "Kebun tiruan: simulator dan ACL blok 2b (Modul 25 Praktik 5)"
```

Jalur perangkat tidak mengubah berkas di praktik ini; folder `alat/`-mu disamakan di [➕ A](#a-cocokkan-proyekmu-backend-120-frontend-110-grafana-alat-dan-edge).

> ⬆️ **Selesai Praktik 5?** Baca [Konsep 9](#9-lokasi-adalah-data-perangkat-api-bukan-tempelan-di-layar), lalu lanjut ke [Praktik 6](#praktik-6--backend-12-lokasi-perangkat-lewat-api-45-menit). Kalau [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi) belum sempat terbaca saat menunggu tadi, bacalah sebelum [Praktik 7](#praktik-7--halaman-peta-dengan-react-leaflet-60-menit).

### Praktik 6 — Backend 1.2: lokasi perangkat lewat API (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `backend` (backend 1.1, `npm run dev`) yang **tetap menyala** dan satu terminal kosong di folder `backend` untuk `npm` dan Git; **Bruno** (6.1, 6.4); **Chrome** atau **Edge** untuk `http://localhost:8080/docs`; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana`. Jalur laptop: broker, simulator, dan Kebun tiruan tetap menyala; jalur perangkat: Node 1 dan Node 2 menyala. Konsep yang dipakai: 9.
>
> ⭐ **Wajib** — langkah 6.4: `/docs` berversi `1.2.0`, Bruno `atur lokasi perangkat` mendapat `200` sebagai admin, `403` sebagai viewer, dan `400` untuk `"-6,2"`, lalu setiap perangkatmu punya titik fiktif.

Kolom `lat` dan `lng` sudah menunggu sejak [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#3-tabel-baris-kolom-tipe-dan-kunci-utama), tetapi backend 1.1 belum mengirim maupun menerimanya ([Konsep 9](#9-lokasi-adalah-data-perangkat-api-bukan-tempelan-di-layar)). Praktik ini menaikkan backend ke **1.2.0**, tahap pertama: titik peta lewat API, ditambah perbaikan `mqtt.ts` untuk 📴 palsu yang kamu hindari di [5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit). Tanpa migrasi, tanpa paket baru; dashboard React tidak disentuh. `.env.example` dan `README.md` backend baru berubah di Praktik 8 dan [➕ C](#c-perbarui-backendreadmemd-bruno-dan-docs-ke-120). Keadaan akhirnya: [`kode/tahap/praktik-6/backend/`](kode/tahap/praktik-6/backend/).

**Cara menyalin.** Potongan yang berubah ditampilkan beserta letaknya. Ketik potongan itu, atau ganti seluruh isi berkas: buka berkas bernama sama di tahap itu di GitHub, klik **Copy raw file**, lalu tempel menggantikan isinya di folder `backend`-mu. Berkas BARU: klik kanan foldernya → **New File…**.

**Biarkan backend menyala.** `npm run dev` memulai ulang backend setiap kali berkas disimpan; kerjakan berurutan, `db/` dulu baru `routes/`. Backend yang mati lebih dari ±5 menit membuat aturan Node diam mengirim 🔴 untuk **semua** node, lalu ✅ sesudah ia hidup lagi (lab penulis: backend dibekukan 18 menit; [🚨](#-kalau-tidak-jalan) *Semua node 🔴 sekaligus …*).

#### 6.1 `lat` dan `lng` ikut `GET /devices`: `db/perangkat.ts` dan skema `Perangkat` (10 menit)

`GET /devices` hanya membaca kolom di daftar `KOLOM`, lalu menyusun jawabannya lewat `tampilkan()` dan skema `Perangkat`. Ketiganya, ditambah tipe `BarisPerangkat`, perlu `lat` dan `lng`.

**`src/db/perangkat.ts`.** Di `interface BarisPerangkat`, tepat di bawah `lokasi: string | null;`, tambahkan:

```ts
  lat: number | null; // Modul 25: lintang (latitude) titik di peta, derajat desimal; null = belum diisi
  lng: number | null; // Modul 25: bujur (longitude); kolomnya sudah ada sejak migrasi 001, tetapi baru dibaca sekarang
```

Ganti baris `KOLOM` menjadi:

```ts
const KOLOM = "device_id, jenis, nama, lokasi, lat, lng, status, terakhir_dilihat, terdaftar, kunci_dibuat, dicabut, penghubung";
```

Lalu tambahkan fungsi ini di akhir berkas (dipakai rute di 6.2), dan simpan:

```ts
// Modul 25: pindahkan titik perangkat di peta. lat dan lng selalu ditulis berpasangan; null dan null = titiknya dihapus.
// Teks lokasi ("ruang tamu") tidak ikut diubah. Hasilnya undefined kalau device_id itu tidak ada di tabel devices.
export async function ubahLokasi(deviceId: string, lat: number | null, lng: number | null): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `UPDATE devices SET lat = $2, lng = $3 WHERE device_id = $1 RETURNING ${KOLOM}`,
    [deviceId, lat, lng],
  );
  return hasil.rows[0];
}
```

`$1`–`$3` diisi `pg` dengan aman, seperti `cabutPerangkat()` di atasnya. `RETURNING` mengembalikan baris sesudah diubah, jadi rute langsung menjawab dengan titik barunya; tanpa baris yang cocok, hasilnya `undefined` (nanti `404`). Perangkat yang kuncinya dicabut pun boleh diberi titik, karena barisnya tetap tampil di `GET /devices`.

**`src/routes/perangkat.ts`.** Di `const Perangkat = z.object({`, tepat di bawah `lokasi: z.string().nullable(),`, tambahkan:

```ts
  lat: z.number().nullable().describe("Modul 25: lintang titik perangkat di peta (derajat desimal); null = belum diisi"),
  lng: z.number().nullable().describe("Modul 25: bujur titik perangkat di peta (derajat desimal); null = belum diisi"),
```

Di fungsi `tampilkan()`, baris pertama sesudah `return {` menjadi:

```ts
    device_id: b.device_id, nama: b.nama, lokasi: b.lokasi, lat: b.lat, lng: b.lng, jenis: b.jenis, status: b.status,
```

Simpan sesudah **keduanya** berubah: skema jawaban dan isi jawaban harus selalu cocok. Lalu di Bruno, kirim **`login viewer`**, kemudian **`daftar perangkat`**.

**Hasilnya (lab penulis):** setiap perangkat membawa `"lat"` dan `"lng"`: `f00d00000001` dan `f00d00000002` berisi `"lat":-6.2,"lng":106.8` dari `npm run isi-riwayat` Modul 17 (bertumpuk), Kebun `"lat":null,"lng":null`. Node 1 dan Node 2 jalur perangkat pasti masih `null` (belum pernah diisi). Dashboard React baru membacanya di [7.1](#71-tiga-paket-peta-dengan-versi-tertulis-lalu-lat-dan-lng-di-typests-8-menit).

#### 6.2 Skema `Lokasi` dan rute admin `PUT /devices/:id/lokasi` (15 menit)

Masih di `src/routes/perangkat.ts`, tiga tambahan. Pertama, baris impor dari `../db/perangkat.ts` ikut membawa `ubahLokasi`:

```ts
import { cabutPerangkat, daftarkanPerangkat, gantiKunciPerangkat, semuaPerangkatDb, ubahLokasi } from "../db/perangkat.ts";
```

Kedua, skema isi permintaan, tepat di bawah skema `Registrasi` (sebelum `const KunciBaru`):

```ts
// Modul 25: isi PUT /devices/:id/lokasi. Angka dengan TITIK desimal (JSON tidak mengenal koma desimal): "-6,2" adalah teks,
// jadi ditolak 400. Rentangnya sama dengan CHECK di migrasi 001. z.number() Zod 4 juga menolak NaN dan Infinity.
// strictObject: kolom lain (misalnya teks "lokasi") ditolak 400; rute ini HANYA memindahkan titik di peta.
const angkaDesimal = (contoh: string) => z.number({ // pesan galat: kolom tidak ada, NaN/Infinity, atau teks
  error: (isu) => isu.input === undefined ? "wajib diisi: angka, atau null untuk menghapus titik"
    : typeof isu.input === "number" ? "harus angka berhingga (bukan NaN atau Infinity)"
      : `harus angka dengan titik desimal, misalnya ${contoh} (bukan teks "${contoh.replace(".", ",")}")`,
});
export const Lokasi = z.strictObject({
  lat: angkaDesimal("-6.1754").min(-90, "lintang paling kecil -90").max(90, "lintang paling besar 90").nullable()
    .describe("lintang (latitude) dalam derajat desimal, -90 sampai 90; Jakarta sekitar -6.2. null = hapus titik"),
  lng: angkaDesimal("106.8272").min(-180, "bujur paling kecil -180").max(180, "bujur paling besar 180").nullable()
    .describe("bujur (longitude) dalam derajat desimal, -180 sampai 180; Jakarta sekitar 106.8. null = hapus titik"),
}).refine((l) => (l.lat === null) === (l.lng === null), { // setengah titik tidak bisa digambar di peta
  message: "lat dan lng diisi berpasangan: keduanya angka, atau keduanya null untuk menghapus titik", path: ["lng"],
});
```

Ketiga, rutenya, di dalam `rutePerangkat`, tepat sesudah rute `app.post("/devices/:id/cabut", …)` berakhir:

```ts
  // ---- Modul 25: titik perangkat di peta (hanya admin: satpam menolak viewer untuk PUT, seperti POST di atas) ----

  app.put("/devices/:id/lokasi", {
    schema: {
      tags: ["perangkat"],
      summary: "Atur titik perangkat di peta: { lat, lng } dengan titik desimal; { lat: null, lng: null } menghapus titiknya",
      params: ParamId,
      body: Lokasi,
      response: {
        200: Perangkat.describe("perangkat dengan titik barunya (bentuknya sama dengan satu baris GET /devices)"),
        404: Galat.describe("device_id itu tidak ada di daftar perangkat"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const id = req.params.id;
    const { lat, lng } = req.body;
    try {
      const baris = await ubahLokasi(id, lat, lng);
      if (baris === undefined) return reply.code(404).send({ pesan: `${id} tidak ada di daftar perangkat` });
      // koordinatnya sengaja TIDAK ditulis ke log: titik rumah termasuk data pribadi
      req.log.info(`titik ${id} di peta ${lat === null ? "dihapus" : "diatur"} oleh akun ${req.user.sub}`);
      return tampilkan(baris);
    } catch (galat) {
      req.log.error(`lokasi ${id} gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });
```

Simpan. Berkas utuhnya: [`kode/tahap/praktik-6/backend/src/routes/perangkat.ts`](kode/tahap/praktik-6/backend/src/routes/perangkat.ts) (**Copy raw file**). `angkaDesimal()` memberi tiga pesan ramah, `.min()`/`.max()` sama dengan `CHECK` database, dan `refine` menolak setengah titik. Satpam tidak bertambah: [satpam Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#praktik-3--satpam-di-setiap-pintu-401-dan-403-50-menit) sudah menolak viewer untuk setiap `PUT`, dan `PUT` sudah ada di daftar metode CORS (`auth/keamanan.ts` tidak disentuh).

#### 6.3 `mqtt.ts` tidak lagi mengirim kabar *offline* palsu, lalu `npm run cek` dan `npm test` (10 menit)

**Kenapa ada 📴 palsu di 5.1.** Saat broker berhenti, wasiat simulator (`offline`) terbit, dan backend mulai menunggu 60 detik sebelum mengirim 📴 ([Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#68-uji-pesan-offline-tunggu-60-detik)). Saat broker menyala lagi, simulator bisa tersambung **lebih dulu** daripada backend, sehingga kabar `online`-nya tiba sebagai pesan *retained* (simpanan broker). Backend 1.1 tidak meneruskan status *retained* ke Telegram, jadi penantiannya tidak batal: 📴 palsu terkirim, dan 📴 sungguhan berikutnya tertahan sampai backend dimulai ulang.

**Perbaikannya** di `src/services/mqtt.ts`, bagian `if (jenis === "status")`. Cari `kabariStatus(deviceId, hasil.data);` di dalam `if (!retained) {`, lalu ganti kurung tutup sesudahnya dengan cabang baru (dua baris kode, dua baris komentar):

```ts
        kabariStatus(deviceId, hasil.data); // Telegram: offline baru dikabarkan kalau bertahan 60 detik
      } else if (hasil.data === "online") {
        // Modul 25: "online" retained tetap membatalkan 📴 yang sedang menunggu. Sesudah broker dimulai ulang, perangkat bisa
        // tersambung LEBIH DULU dari backend, jadi kabar online-nya tiba sebagai pesan retained (tanpa ini: 📴 palsu)
        kabariStatus(deviceId, "online");
      }
```

`offline` *retained* tetap diabaikan (keadaan lama). Di lab perbaikan penulis, broker dimulai ulang dengan simulator tersambung lebih dulu: tidak ada 📴 selama lebih dari 70 detik, lalu 📴 asli tiba 60,0 detik sesudah simulator dimatikan.

**Tes.** Salin tiga berkas ini lewat **Copy raw file**:

| Berkas | Isinya |
| :-- | :-- |
| [`src/services/mqtt.test.ts`](kode/tahap/praktik-6/backend/src/services/mqtt.test.ts) (BARU) | 2 tes tanpa broker dan Telegram: `online` *retained* sesudah wasiat tetap diteruskan; `offline` *retained* tidak dikabarkan |
| [`src/routes/lokasi.test.ts`](kode/tahap/praktik-6/backend/src/routes/lokasi.test.ts) (BARU) | 12 tes: batas, `NaN`, `"-6,2"`, setengah titik, kolom `lokasi`; dengan satpam sungguhan: tamu `401`, viewer `403`, admin `200`, `404` |
| [`src/routes/perangkat.test.ts`](kode/tahap/praktik-6/backend/src/routes/perangkat.test.ts) | baris tiruannya diberi `lat: null, lng: null`, supaya cocok dengan skema `Perangkat` yang baru |

Di terminal kosong (folder `backend`), jalankan `npm run cek` (hanya dua baris kepala, tanpa galat), lalu `npm test`. Backend di terminal `backend` tidak ikut dimulai ulang.

**Hasilnya (lab penulis, tahap Praktik 6, dipotong):**

```text
 Test Files  9 passed (9)
      Tests  71 passed (71)
```

Backend 1.1 berisi 7 berkas / 57 tes; tambahannya 12 tes lokasi dan 2 tes `mqtt.ts`. Ada yang merah? Bandingkan berkasmu dengan tahap Praktik 6.

#### 6.4 ⭐ Versi 1.2.0, `/docs`, dan Bruno `atur lokasi perangkat`: 200, 403, 400 (10 menit)

1. Ganti isi `src/server.ts` dengan [versi tahap Praktik 6](kode/tahap/praktik-6/backend/src/server.ts) (**Copy raw file**): yang berubah hanya komentar kepala, keterangan `/docs`, dan `version: "1.2.0"`. Lalu di terminal kosong, `npm pkg set version=1.2.0` (tanpa keluaran), kemudian `npm install` supaya `package-lock.json` ikut 1.2.0 (tanpa paket baru).
2. Jalankan `npm audit`. **Hasilnya (lab penulis, 27 Oktober 2026):** `found 0 vulnerabilities`. Hasilnya bergantung tanggal; ada temuan? `npm audit fix` (bukan `--force`), lalu `npm test` lagi, seperti [Modul 24](../modul-24-kendali-aturan-peran/README.md#64--npm-run-cek-npm-test-dan-npm-audit-lalu-bruno-dan-docs-110-10-menit).
3. Buka `http://localhost:8080/docs`. **Hasilnya (lab penulis):** versi `1.2.0`, keterangan diawali `Backend v1.2 (Modul 25).`, dan ada rute `PUT /devices/{id}/lokasi`.
4. Di VS Code, klik kanan folder `backend/bruno` → **New File…**, beri nama persis `atur lokasi perangkat.yml`, isi dengan kode di bawah, lalu simpan. URL-nya memakai Node 1 contoh koleksi, `a4cf12e5b7c0`: jalur laptop menggantinya dengan `f00d00000001`, jalur perangkat dengan `device_id` Node 1-mu bila berbeda.

   ```yaml
   info:
     name: atur lokasi perangkat
     type: http
     seq: 27

   http:
     method: PUT
     url: "{{baseUrl}}/devices/a4cf12e5b7c0/lokasi"
     body:
       type: json
       data: |-
         {
           "lat": -6.1754,
           "lng": 106.8272
         }
     auth: inherit

   runtime:
     assertions:
       - expression: res.status
         operator: eq
         value: "200"

   settings:
     encodeUrl: true
     timeout: 0
     followRedirects: true
     maxRedirects: 5
     forwardAuthorizationHeader: true
   ```

5. Di Bruno: **`login admin`** → **`atur lokasi perangkat`** (`200`) → **`login viewer`** → kirim lagi (`403`; tab **Tests** merah selain `200`: wajar) → **`login admin`**, lalu ubah sementara: `-6.1754` menjadi `"-6,2"` dengan petik (`400`), lalu `91` (`400`). Kembalikan `-6.1754`, baru ganti id di URL menjadi `f00d0000ffff` (`404`), lalu kembalikan URL-nya.

**Hasilnya (lab penulis, `f00d00000001`; dikirim skrip lab setara Bruno, dirapatkan):**

```text
admin         -> 200 {"device_id":"f00d00000001","nama":"Latihan ruang tamu","lokasi":"ruang tamu","lat":-6.1754,"lng":106.8272,"jenis":"node1","status":"online",…,"kunci":"aktif",…}
viewer        -> 403 {"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}
"lat": "-6,2" -> 400 {"statusCode":400,"code":"FST_ERR_VALIDATION","error":"Bad Request","message":"body/lat harus angka dengan titik desimal, misalnya -6.1754 (bukan teks \"-6,1754\")"}
"lat": 91     -> 400 …"message":"body/lat lintang paling besar 90"}
f00d0000ffff  -> 404 {"pesan":"f00d0000ffff tidak ada di daftar perangkat"}
```

Log backend (jam diubah ke WIB, dipotong) mencatat pelakunya, tanpa koordinat:

```text
[04:04:49] INFO: titik f00d00000001 di peta diatur oleh akun 1
[04:04:49] WARN: ditolak (403): akun 2 (viewer) mencoba PUT /devices/f00d00000001/lokasi
```

Tiba-tiba `401` `belum login atau sesi sudah habis…`? Gelang aksesmu hanya 15 menit (Modul 20): kirim **`login admin`** lagi.

6. **Titik fiktif untuk semua perangkat** (sekitar Monas, berjarak 20–40 m; [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi)). Sebagai admin, kirim **`atur lokasi perangkat`** untuk setiap perangkat di `GET /devices`:

| `lat`, `lng` | Jalur laptop | Jalur perangkat |
| :-- | :-- | :-- |
| `-6.1754`, `106.8272` | `f00d00000001` | Node 1-mu |
| `-6.17532`, `106.82705` | `f00d00000002`, bila ada (juga yang kuncinya dicabut di 4.2) | `f00d00000001`/`f00d00000002` latihan, bila ada |
| `-6.17548`, `106.82735` | Kebun `f00d000000b2` | Node 2-mu |

**Hasilnya (lab penulis):** Kebun dijawab `200` dengan `"lat":-6.17548,"lng":106.82735` dan `"kunci":"tanpa-kunci"`. Titik-titik ini baru tampil di Peta pada Praktik 7; titik yang dipindah saat Peta terbuka baru bergeser sesudah Peta dibuka lagi ([7.4](#74--uji-peta-atribusi-status-live-akun-viewer-hp-375-px-dan-mode-gelap-10-menit)).

**Kamu lulus langkah ⭐ ini** kalau `/docs` berversi `1.2.0`, Bruno mendapat `200` (admin), `403` (viewer), dan `400` (`"-6,2"`), dan setiap perangkatmu punya titik fiktif. Jawaban lain: [🚨](#-kalau-tidak-jalan) *`PUT /devices/:id/lokasi` menjawab `400`, `403`, atau `404`*.

**Simpan ke cabang.** Di terminal kosong (folder `backend`):

```text
git add src bruno package.json package-lock.json
git commit -m "Backend 1.2.0: titik peta lewat API dan perbaikan kabar offline palsu (Modul 25 Praktik 6)"
```

> ⬆️ **Selesai Praktik 6?** Lanjut ke [Praktik 7](#praktik-7--halaman-peta-dengan-react-leaflet-60-menit). Ubin, atribusi, dan warna penandanya sudah dijelaskan [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi).

### Praktik 7 — Halaman Peta dengan react-leaflet (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `frontend` (Vite) dan satu terminal kosong di folder `frontend` untuk npm dan Git; terminal `backend` (backend 1.2 dari Praktik 6) tetap menyala, juga broker dan terminal `alat` (simulator + Kebun tiruan) di jalur laptop, atau Node 1 dan Node 2 di jalur perangkat; **Docker Desktop** atau **Docker Engine** (`rumahpintar-db`); **Bruno** (7.4); **dua browser berbeda**, misalnya **Chrome** (admin) dan **Edge** (viewer), dengan DevTools; internet untuk ubin peta. Konsep yang dipakai: 8.
>
> ⭐ **Wajib** — langkah 7.4: halaman **Peta** menggambar setiap perangkat bertitik beserta atribusi `© OpenStreetMap contributors`, warna penandanya berganti sendiri saat simulator (atau Node 1) dimatikan, dan halaman itu terbuka untuk viewer, di lebar 375 px, dan di mode gelap.

Backend 1.2 sudah mengirim titik setiap perangkat (Praktik 6). Kini dashboard naik ke **1.1.0** dengan layar `/peta`: tiga berkas baru, empat berkas lama yang bertambah sedikit, dan `package.json`. Ubin, atribusi, `CircleMarker`, dan arti warnanya sudah dijelaskan [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi); di sini kita menulis dan mengujinya. Keadaan akhir: [`kode/tahap/praktik-7/frontend/`](kode/tahap/praktik-7/frontend/).

#### 7.1 Tiga paket peta dengan versi tertulis, lalu `lat` dan `lng` di `types.ts` (8 menit)

Di terminal `frontend`, hentikan Vite (**Ctrl + C**) dan biarkan mati sampai akhir 7.3: berkas 7.2–7.3 saling mengimpor. Di terminal kosong (folder `frontend`), pasang paket peta **dengan versinya** (daftarnya di [🧰](#-yang-perlu-disiapkan)):

```text
npm install leaflet@1.9.4 react-leaflet@5.0.0
```

**Hasilnya (lab penulis):**

```text
added 3 packages, and audited 109 packages in 4s

18 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

`added 3 packages` = `leaflet`, `react-leaflet`, dan pustaka intinya `@react-leaflet/core`. Lalu tipe TypeScript untuk Leaflet, sebagai *devDependency* (`-D`: hanya dipakai saat menulis dan memeriksa kode):

```text
npm install -D @types/leaflet@1.9.22
```

**Hasilnya (lab penulis):** `added 2 packages, and audited 111 packages in 2s` (`@types/leaflet` dan `@types/geojson`), sisanya sama. `"version"` di `package.json` tetap `1.0.0` sampai 7.5. Kenapa versinya wajib ditulis? Dokumentasi react-leaflet (dibaca 26 Oktober 2026) masih menyuruh `react@rc` dan `react-leaflet@next`, yang hari itu memasang versi uji lama 19.0.0-rc.1 dan 5.0.0-rc.2 ([🚨](#-kalau-tidak-jalan), tabel petunjuk lama).

**`src/types.ts`.** Backend 1.2 mengirim `lat` dan `lng` di setiap baris `GET /devices` ([6.1](#61-lat-dan-lng-ikut-get-devices-dbperangkatts-dan-skema-perangkat-10-menit)). Di `export type Perangkat = {`, tepat di bawah `lokasi: string | null;`, tambahkan:

```ts
  // Modul 25: titik perangkat di peta, dalam derajat desimal (lintang -90 sampai 90, bujur -180 sampai 180).
  // null = titiknya belum diisi admin. Backend selalu mengisi keduanya berpasangan (dua-duanya angka atau dua-duanya null).
  lat: number | null; // lintang (latitude), misalnya -6.1754
  lng: number | null; // bujur (longitude), misalnya 106.8272
```

Berkas utuhnya: [`types.ts`](kode/tahap/praktik-7/frontend/src/types.ts) tahap Praktik 7 (**Copy raw file**).

#### 7.2 `peta.ts` dan `PetaPerangkat.tsx`: ubin, atribusi, dan penanda berwarna status (22 menit)

**Langkah 1 — setelan peta.** Klik kanan **`frontend/src`** → **New File…**, beri nama **`peta.ts`**, lalu isi (atau **Copy raw file** dari [tahapnya](kode/tahap/praktik-7/frontend/src/peta.ts)):

```ts
// peta.ts - setelan peta perangkat (Modul 25) dalam SATU konstanta: alamat ubin, tulisan atribusi, batas zoom, dan warna
// penanda. Kebijakan ubin OpenStreetMap meminta alamat ubin tidak ditanam di banyak tempat ("Avoid hard-coding the tile
// URL"): kalau kelak pindah penyedia ubin, cukup berkas ini yang diubah.
export const PETA = {
  // Alamat ubin RESMI OpenStreetMap: https, tanpa "{s}." (alamat lama a./b./c.tile... bisa lambat atau ditutup).
  // {z} = tingkat zoom, {x} dan {y} = nomor kotak ubin. Browser mengunduh ubin langsung dari server OpenStreetMap, jadi
  // halaman Peta butuh internet. Mengunduh ubin secara massal atau menyimpannya untuk dipakai luring DILARANG kebijakan ini.
  ubin: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  // Atribusi WAJIB terlihat di peta (syarat lisensi data OpenStreetMap). Leaflet menaruhnya di pojok kanan bawah sebagai
  // HTML, jadi tautannya bisa diklik. Petik tunggal karena teksnya memuat petik ganda.
  atribusi: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  zoomMaks: 19, // ubin OpenStreetMap tersedia sampai zoom 19 (satu ubin selebar beberapa puluh meter)
  zoomDekat: 18, // saat peta "dipaskan" ke titik-titik perangkat, paling dekat zoom 18: rumah dan jalan di sekitarnya terlihat
  // Warna isi lingkaran penanda. SVG peta tidak mengenal kelas Tailwind, jadi warnanya ditulis sebagai kode warna.
  // Warna tidak pernah sendirian: popup penanda dan keterangan di bawah peta menuliskan statusnya dengan kata.
  warnaOnline: "#15803d", // hijau (setara green-700 Tailwind): perangkat online
  warnaLain: "#64748b", // abu-abu (setara slate-500 Tailwind): offline, mode offline, belum diketahui, atau kiriman diabaikan
};
```

Satu konstanta `PETA` menyimpan alamat ubin, atribusi, batas *zoom*, dan dua warna, sesuai pesan kebijakan OSM "Avoid hard-coding the tile URL". Warnanya kode heksadesimal karena lingkaran peta digambar Leaflet sebagai SVG, di luar jangkauan kelas Tailwind.

**Langkah 2 — komponen peta.** Klik kanan **`frontend/src/components`** → **New File…**, beri nama **`PetaPerangkat.tsx`**, lalu isi (atau **Copy raw file** dari [tahapnya](kode/tahap/praktik-7/frontend/src/components/PetaPerangkat.tsx)):

```tsx
// PetaPerangkat.tsx - peta perangkat (Modul 25). Setiap perangkat yang punya titik (lat, lng dari GET /devices, backend
// 1.2) menjadi lingkaran berwarna di atas peta OpenStreetMap. Warnanya ikut status LIVE di toko (acara Socket.IO, tanpa
// polling): perangkat yang terputus berubah abu-abu sendiri. Ketuk lingkaran: nama, status, terakhir dilihat, tautan detail.
// Pustakanya: Leaflet (penggambar peta) + react-leaflet (Leaflet dalam bentuk komponen React).
import "leaflet/dist/leaflet.css"; // CSS Leaflet: tanpa ini ubin peta berserakan dan tombol zoom tidak berbentuk
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router";
import { ambilPerangkat, GalatApi } from "../api";
import { PETA } from "../peta";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";
import type { Perangkat } from "../types";
import { LencanaStatus } from "./Lencana";
import TerakhirDilihat from "./TerakhirDilihat";

// Perangkat yang PASTI punya titik. "p is PerangkatBertitik" memberi tahu TypeScript: kalau fungsi ini menjawab true,
// lat dan lng perangkat itu angka (bukan null), jadi boleh langsung dipakai sebagai koordinat.
// typeof (bukan !== null): backend 1.1 sama sekali tidak mengirim lat/lng (undefined), dan itu juga berarti "tanpa titik".
type PerangkatBertitik = Perangkat & { lat: number; lng: number };
function punyaTitik(p: Perangkat): p is PerangkatBertitik {
  return typeof p.lat === "number" && typeof p.lng === "number";
}

// "lat,lng;lat,lng" -> [[lat, lng], [lat, lng]]: daftar pasangan angka yang dimengerti Leaflet
function keKoordinat(titik: string): [number, number][] {
  return titik.split(";").map((t) => t.split(",").map(Number) as [number, number]);
}

// Pas-kan peta ke semua titik (fitBounds). titik = SATU teks "lat,lng;lat,lng" (pola yang sama dengan daftarId di
// soket.ts): teks yang sama = koordinat sama, jadi efek ini hanya diulang kalau ada titik yang dipindah atau ditambah,
// bukan setiap kali status perangkat berubah. Peta yang sedang digeser atau di-zoom pengguna tidak melompat sendiri.
function PasKanPeta({ titik }: { titik: string }) {
  const peta = useMap(); // peta Leaflet milik <MapContainer> di atasnya
  useEffect(() => {
    peta.fitBounds(keKoordinat(titik), { padding: [40, 40], maxZoom: PETA.zoomDekat });
  }, [peta, titik]);
  return null; // komponen ini tidak menggambar apa pun, hanya menggerakkan peta
}

// Satu penanda. Komponen sendiri (seperti KartuPerangkat di DaftarPerangkat) supaya setiap penanda memilih statusnya
// SENDIRI dari toko: perubahan status perangkat A hanya menggambar ulang penanda A.
function TitikPerangkat({ p }: { p: PerangkatBertitik }) {
  const status = useToko((s) => s.status[p.device_id]) ?? p.status;
  const terakhir = useToko((s) => s.terakhirDilihat[p.device_id]);
  // kunci dicabut atau belum terdaftar = backend mengabaikan kirimannya, jadi status lamanya tidak dipercaya (Modul 21)
  const kirimanDiabaikan = p.kunci === "dicabut" || p.kunci === "belum-terdaftar";
  const online = status === "online" && !kirimanDiabaikan;

  return (
    // CircleMarker = lingkaran yang digambar sebagai SVG, bukan gambar ikon. Ikon penanda bawaan Leaflet (Marker) memakai
    // berkas gambar yang hilang sesudah npm run build; lingkaran tidak butuh berkas apa pun, dan warnanya bisa membawa status.
    // pathOptions boleh berubah: react-leaflet memanggil setStyle(), jadi warnanya berganti tanpa menggambar ulang peta.
    <CircleMarker
      center={[p.lat, p.lng]}
      radius={10}
      pathOptions={{ color: "#ffffff", weight: 3, fillColor: online ? PETA.warnaOnline : PETA.warnaLain, fillOpacity: 1 }}
    >
      {/* Popup: isinya baru digambar saat lingkarannya diketuk. Elemen <p> sengaja tidak dipakai: CSS Leaflet memberi
          paragraf di dalam popup jarak atas-bawah yang besar. font-sans: huruf sama dengan dashboard (Leaflet memakai
          hurufnya sendiri). Warna kotak popup diatur index.css (ikut mode gelap). */}
      <Popup>
        <div className="flex min-w-48 flex-col gap-1 font-sans text-sm">
          {/* nama diisi admin lewat API; JSX menampilkannya sebagai teks biasa (aman dari XSS) */}
          <strong className="text-base">{p.nama ?? p.device_id}</strong>
          <span className="text-slate-500 dark:text-slate-400">
            {p.lokasi ?? "lokasi belum diisi"} · <span className="font-mono">{p.device_id}</span>
          </span>
          <span>{kirimanDiabaikan ? "kiriman diabaikan backend" : <LencanaStatus status={status} />}</span>
          <TerakhirDilihat t={terakhir} jenis={p.jenis} periksaBasi={!kirimanDiabaikan} />
          {/* tautan biasa React Router: pindah ke layar detail tanpa memuat ulang halaman */}
          <Link to={"/perangkat/" + p.device_id} className="inline-flex min-h-11 items-center font-medium">
            Buka detail →
          </Link>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function PetaPerangkat() {
  const perangkat = useToko((s) => s.perangkat); // null = masih memuat
  const galat = useToko((s) => s.galatPerangkat);

  // Daftar perangkat diambil ULANG setiap kali peta dibuka (TataLetak hanya mengambilnya sekali sesudah masuk), supaya
  // titik yang baru diatur admin lewat Bruno (PUT /devices/:id/lokasi) langsung tampil tanpa F5. Titik tidak dikirim
  // lewat Socket.IO; status perangkat tetap live. Di mode dev, StrictMode menjalankan efek ini dua kali (dua GET).
  useEffect(() => {
    let ignore = false;
    ambilPerangkat()
      .then((daftar) => {
        if (!ignore) useToko.getState().setPerangkat(daftar);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return sesiHabis();
        // daftar lama sudah ada (diambil TataLetak): cukup kabari lewat toast. galatPerangkat JANGAN diisi, karena layar
        // Perangkat, Detail, Riwayat, dan formulir aturan ikut membacanya dan akan berganti kotak merah walau datanya ada.
        if (useToko.getState().perangkat !== null) {
          toast("Daftar perangkat gagal dimuat ulang: titik di peta mungkin belum yang terbaru.", "galat");
          return;
        }
        useToko.getState().setGalatPerangkat(err instanceof GalatApi ? err.message : "Gagal memuat perangkat.");
      });
    return () => {
      ignore = true; // layar Peta sudah ditutup: jawaban yang datang terlambat diabaikan
    };
  }, []);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  if (perangkat === null) return <p className="text-slate-600 dark:text-slate-400">Memuat perangkat…</p>;

  const bertitik = perangkat.filter(punyaTitik);
  const tanpaTitik = perangkat.filter((p) => !punyaTitik(p));
  const kotakPesan = "rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  // backend 1.1 (sebelum Modul 25) tidak mengirim kolom lat sama sekali: beri tahu, jangan hanya "belum ada titik"
  if (perangkat.length > 0 && perangkat.every((p) => !("lat" in p))) {
    return <p className={kotakPesan}>Backend belum mengirim titik peta (lat, lng). Halaman Peta butuh backend 1.2 (Modul 25).</p>;
  }
  if (bertitik.length === 0) {
    return (
      <p className={kotakPesan}>
        Belum ada perangkat dengan koordinat. Isi lewat Bruno <code className="font-mono">atur lokasi perangkat</code>.
      </p>
    );
  }

  const titik = bertitik.map((p) => p.lat + "," + p.lng).join(";");

  return (
    <>
      {/* Tinggi peta WAJIB ditulis (h-96 = 24rem = 384 px): tanpa tinggi, kotak peta setinggi 0 px dan tidak terlihat.
          isolate: lapisan-lapisan Leaflet (z-index 400-1000) tetap di dalam kotak ini, tidak menutupi toast (z-50).
          bounds = tampilan pertama; PasKanPeta mengurus titik yang berubah sesudahnya. */}
      <MapContainer
        bounds={keKoordinat(titik)}
        boundsOptions={{ padding: [40, 40], maxZoom: PETA.zoomDekat }}
        maxZoom={PETA.zoomMaks}
        className="isolate h-96 w-full rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <TileLayer url={PETA.ubin} attribution={PETA.atribusi} maxZoom={PETA.zoomMaks} />
        <PasKanPeta titik={titik} />
        {bertitik.map((p) => (
          <TitikPerangkat key={p.device_id} p={p} />
        ))}
      </MapContainer>

      {/* keterangan warna dengan kata, karena warna saja tidak terbaca semua orang */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: PETA.warnaOnline }} /> online
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: PETA.warnaLain }} /> tidak online,
          atau kirimannya diabaikan backend
        </span>
      </div>
      {tanpaTitik.length > 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Belum punya titik: {tanpaTitik.map((p) => p.nama ?? p.device_id).join(", ")}.
        </p>
      ) : null}
    </>
  );
}
```

Dibaca dari atas ke bawah:

- **`import "leaflet/dist/leaflet.css"`**: tanpa CSS Leaflet, ubin berserakan dan tombol *zoom* kehilangan bentuknya. Dari `react-leaflet` datang `MapContainer` (kotak peta), `TileLayer` (lapisan ubin), `CircleMarker`, `Popup`, dan `useMap()`.
- **`punyaTitik()`** menyaring perangkat yang `lat` dan `lng`-nya angka; `p is PerangkatBertitik` memberi tahu TypeScript bahwa sesudah lolos, keduanya pasti `number`. Pemeriksanya `typeof`, karena backend 1.1 tidak mengirim kolomnya sama sekali (`undefined`). **`keKoordinat()`** mengubah teks `"lat,lng;lat,lng"` menjadi pasangan angka.
- **`PasKanPeta`** memanggil `fitBounds()` supaya semua titik masuk kotak (tepi 40 px, paling dekat *zoom* 18). Titiknya dikirim sebagai SATU teks, jadi efeknya hanya diulang saat ada titik yang pindah atau bertambah, bukan setiap kali status berubah: peta yang sedang kamu geser tidak melompat sendiri.
- **`TitikPerangkat`** = satu penanda dengan selektor status miliknya sendiri dari [toko Zustand](../modul-23-dashboard-realtime/README.md#4-satu-toko-untuk-semua-layar-zustand-dan-selektor), seperti `KartuPerangkat` di Daftar. Hijau hanya bila `online` **dan** kuncinya tidak dicabut dan sudah terdaftar (`kirimanDiabaikan`, Modul 21); selain itu abu-abu. Warna yang berganti hanya mewarnai ulang lingkaran itu, bukan seluruh peta. *Popup*-nya: nama, lokasi · `device_id`, lencana status, "terakhir dilihat" dengan aturan data basi Modul 23, dan tautan **Buka detail →** setinggi 44 px.
- **Efek di `PetaPerangkat`** mengambil ulang `GET /devices` **setiap kali Peta dibuka** (`TataLetak` hanya sekali sesudah masuk), supaya titik baru dari Bruno tampil tanpa **F5** (Konsep 9); pola `ignore` dan `401` → `sesiHabis()` sama dengan Modul 23–24. Kalau gagal padahal daftar lama ada, cukup [*toast*](../modul-24-kendali-aturan-peran/README.md#41-toastts-dan-wadahtoast-di-bawah-layar-hp-di-pojok-kanan-atas-laptop-lebar-15-menit) galat, tanpa `galatPerangkat`: layar Perangkat, Detail, Riwayat, dan formulir aturan juga membacanya dan akan ikut berganti kotak merah.
- **Tiga pesan sebelum peta:** `Memuat perangkat…`, pesan untuk backend 1.1 (`Backend belum mengirim titik peta (lat, lng). Halaman Peta butuh backend 1.2 (Modul 25).`), dan `Belum ada perangkat dengan koordinat. …`.
- **`MapContainer`** berkelas `isolate h-96 …`. **`h-96`** (384 px) wajib: tanpa tinggi tertulis, kotak peta setinggi 0 px. **`isolate`** mengurung lapisan Leaflet (*z-index* 400–1000) di dalam kotaknya, supaya *toast* (`z-50`) tidak tertutup peta.
- **Di bawah peta**, keterangan warna dengan kata dan daftar `Belum punya titik: …`.

#### 7.3 `Peta.tsx`, rute `/peta` bagi admin dan viewer, lalu menu Peta (10 menit)

**Langkah 1 — halaman.** Klik kanan **`frontend/src/halaman`** → **New File…**, beri nama **`Peta.tsx`**, lalu isi:

```tsx
// halaman/Peta.tsx - layar /peta (Modul 25): judul + peta perangkat. Admin dan viewer sama-sama boleh melihat; peta ini
// hanya menampilkan. Titiknya diatur admin lewat API (PUT /devices/:id/lokasi), bukan ditulis di kode frontend.
import PetaPerangkat from "../components/PetaPerangkat";

export default function HalamanPeta() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Peta Perangkat</h2>
      <PetaPerangkat />
    </>
  );
}
```

**Langkah 2 — alamat.** Di `src/App.tsx`, tambahkan impor di bawah `import HalamanMasuk from "./halaman/Masuk";`:

```tsx
import HalamanPeta from "./halaman/Peta";
```

Lalu rutenya, tepat di bawah rute `/perangkat/:id/riwayat`, sebelum rute `/aturan`:

```tsx
          {/* Modul 25: peta perangkat, untuk admin dan viewer (di luar penjaga KhususAdmin) */}
          <Route path="/peta" element={<HalamanPeta />} />
```

Sengaja di **luar** penjaga [`KhususAdmin`](../modul-24-kendali-aturan-peran/README.md#31-useadmin-dan-penjaga-kedua-khususadmin-10-menit): viewer boleh melihat peta; titiknya hanya dipindah admin, lewat API.

**Langkah 3 — menu.** Di `src/components/TataLetak.tsx`, sisipkan di antara `NavLink` **Perangkat** dan komentar di atas `NavLink` **Aturan**:

```tsx
            {/* Modul 25: peta perangkat, untuk admin dan viewer */}
            <NavLink to="/peta" className={kelasMenu}>
              Peta
            </NavLink>
```

**Langkah 4 — *popup* di mode gelap.** Ganti seluruh isi `src/index.css` dengan [tahapnya](kode/tahap/praktik-7/frontend/src/index.css) (**Copy raw file**). Di bawah isi lamanya ada aturan baru: tautan *popup* berwarna teal, dan kotak *popup*, ekornya, tautannya, serta tombol ✕ ikut mode gelap. *Selector*-nya diawali `.leaflet-container` karena CSS Leaflet dimuat **sesudah** `index.css`. Ubin tidak disentuh.

Berkas utuh [`App.tsx`](kode/tahap/praktik-7/frontend/src/App.tsx) dan [`TataLetak.tsx`](kode/tahap/praktik-7/frontend/src/components/TataLetak.tsx): **Copy raw file**. Simpan semua, lalu di terminal `frontend` jalankan lagi `npm run dev`.

#### 7.4 ⭐ Uji Peta: atribusi, status *live*, akun viewer, HP 375 px, dan mode gelap (10 menit)

1. **Peta pertama.** Di Chrome, buka `http://localhost:5173`, masuk sebagai admin, lalu klik menu **Peta**. **Hasilnya (lab penulis, jalur laptop, 1280 px):** menu `Perangkat` · `Peta` · `Aturan`, judul `Peta Perangkat`, kotak peta 736 × 384 px dengan tiga lingkaran (`f00d00000001` dan Kebun hijau, `f00d00000002` abu-abu karena kuncinya dicabut di [4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit)), atribusi ` Leaflet | © OpenStreetMap contributors` di pojok kanan bawah, dan keterangan `online` · `tidak online, atau kirimannya diabaikan backend`. Uji `npm run dev` penulis memakai ubin tiruan; ubin sungguhan diuji di 7.5.
2. **Popup.** Klik lingkaran `f00d00000001`. **Hasilnya (lab penulis):** `Latihan ruang tamu` / `ruang tamu · f00d00000001` / `Online` / `terakhir dilihat baru saja` / `Buka detail →` (`/` = baris baru). **Buka detail →** membuka layar detailnya tanpa muat ulang.
3. **Status *live*.** Di Peta, tekan **Ctrl + C** di terminal `alat`. **Hasilnya (lab penulis):** ±1 detik kemudian, tanpa muat ulang, lingkaran `f00d00000001` menjadi abu-abu dan muncul *toast* `f00d00000001 terputus (offline)`. **Kebun tetap hijau** walau ikut diam: statusnya diterbitkan simulator yang sudah mati, tanpa wasiat ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline): diam tidak sama dengan *offline*). Dalam semenit, jalankan lagi simulator dengan perintah yang sama, lalu `kebun mulai`; backend menahan 📴 selama 60 detik, jadi tidak ada kabar. Bila lewat ±6 menit, Grafana mengirim 🔴 lalu ✅ seperti di [5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit). Jalur perangkat: cabut daya Node 1; lingkarannya abu-abu sesudah wasiatnya terbit (tidak direkam penulis).
4. **Titik yang dipindah.** Masih di Peta, kirim Bruno **atur lokasi perangkat** (admin) untuk `f00d00000002` atau perangkat lain dengan `{"lat": -6.176, "lng": 106.828}`. Di lab uji kode, lingkarannya **diam** (titik tidak lewat Socket.IO), lalu pindah tanpa **F5** sesudah klik **Perangkat** lalu **Peta**. Kembalikan titik fiktifnya (6.4).
5. **Akun viewer.** Di browser kedua, masuk sebagai viewer dan buka **Peta**. **Hasilnya (lab penulis):** kepala `Tamu Rumah (viewer)`, menu dan tiga lingkaran yang sama, *popup* tetap dengan **Buka detail →**.
6. **Papan ketik.** Tekan **Tab** berulang. **Hasilnya (lab uji kode):** sesudah `Aturan` dan `Keluar`, fokus ke kotak peta, dan tombol panah menggesernya. Lingkaran tidak bisa dicapai **Tab**; isinya ada juga di layar **Perangkat**.
7. **Lebar 375 px.** Di Chrome, nyalakan [mode perangkat DevTools](../modul-22-react-dasar/README.md#71-mode-perangkat-devtools-dashboard-di-375-768-dan-1280-px-8-menit), **Responsive**, lebar `375`. **Hasilnya (lab penulis, mode perangkat, bukan HP sungguhan):** kotak peta 343 × 384 px tanpa gulir mendatar, menu satu baris, tiga lingkaran dan atribusi utuh.
8. **Mode gelap.** DevTools → **Rendering** → **Emulate CSS media feature prefers-color-scheme** → **prefers-color-scheme: dark** ([Modul 23](../modul-23-dashboard-realtime/README.md#10-mode-gelap-mengikuti-setelan-hp-dan-laptop)), lalu klik sebuah lingkaran. **Hasilnya (lab penulis):** halaman dan *popup* gelap, ubin tetap terang. Kembalikan ke **No emulation** dan matikan mode perangkat.

![Komposit dua tangkapan layar asli halaman Peta dashboard Rumah Pintar Mini v1.1, build produksi, akun admin, di Chrome 156 (Linux, Raspberry Pi 5 sebagai laptop). Kiri, laptop 1280 piksel: kepala Rumah Pintar Mini, Live, menu Perangkat, Peta yang aktif (nomor 1), Aturan, Pemilik Rumah (admin), Keluar; judul Peta Perangkat; kotak peta OpenStreetMap di sekitar Monumen Nasional dengan tombol plus dan minus; popup putih Latihan ruang tamu, ruang tamu · f00d00000001, lencana Online, terakhir dilihat 9 detik yang lalu, tautan Buka detail (nomor 3); di bawah popup dua lingkaran hijau (nomor 2) dan satu lingkaran abu-abu yang sebagian tertutup popup; atribusi di pojok kanan bawah: bendera kecil, Leaflet, © OpenStreetMap contributors (nomor 4); di bawah peta keterangan bulatan hijau online dan bulatan abu-abu tidak online, atau kirimannya diabaikan backend (nomor 5). Kanan, mode perangkat 375 piksel (bukan HP sungguhan): menu Perangkat, Peta (nomor 1), Aturan dalam satu baris, Pemilik Rumah (admin) dan Keluar di baris kedua; kotak peta selebar layar 343 kali 384 (nomor 6) dengan tiga lingkaran: abu-abu f00d00000002, hijau f00d00000001, hijau Kebun tiruan (nomor 2); atribusi yang sama (nomor 4) dan keterangan warna dua baris. Titik peta fiktif; f00d00000002 abu-abu karena kuncinya dicabut di Praktik 4.2.](aset/halaman-peta.png)

**Kamu lulus langkah ⭐ ini** kalau Peta menggambar setiap perangkatmu yang bertitik beserta atribusi `© OpenStreetMap contributors`, lingkaran simulator (atau Node 1) menjadi abu-abu sendiri saat dimatikan, dan petanya tampil juga untuk viewer, di 375 px, dan di mode gelap. Peta abu-abu, *toast* tertutup peta, atau titik yang tidak pindah: [🚨](#-kalau-tidak-jalan).

#### 7.5 Dashboard 1.1.0: *lint*, *build*, `cek-skema`, dan `preview` (10 menit)

Di terminal `frontend`, hentikan Vite (**Ctrl + C**; port 5173 dipakai hidangan). Di terminal kosong, jalankan `npm pkg set version=1.1.0` (tanpa keluaran), lalu `npm install` supaya `package-lock.json` ikut berganti (lab penulis: `up to date, audited 111 packages in 1s`). Lalu `npm run lint`.

**Hasilnya (lab penulis):**

```text
> rumah-pintar-mini-frontend@1.1.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 62ms on 49 files with 116 rules using 4 threads.
```

49 berkas = 46 milik Modul 24 + tiga berkas baru. Lalu `npm run build`.

**Hasilnya (lab penulis, dipotong):**

```text
dist/index.html                     1.15 kB │ gzip:   0.64 kB
dist/assets/index-DeVyEM1Y.css     39.16 kB │ gzip:  11.87 kB
dist/assets/index-D7C7P3aH.js   1,047.79 kB │ gzip: 312.11 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
…
✓ built in 1.43s
```

Patokannya sama dengan [Modul 24](../modul-24-kendali-aturan-peran/README.md#101-dashboard-100-lint-build-cek-skema-dan-nomor-versi-15-menit): ***build* lolos dengan satu peringatan ukuran**. Bundelnya ±157 kB (±46 kB gzip) lebih besar daripada dashboard 1.0.0: itulah Leaflet, react-leaflet, dan kode peta ([🔬](#-bedah-teknis-opsional) *Leaflet tanpa pembungkus, dan `lazy()` …*). Nama berkas dan angkamu bisa berbeda. Lalu `npm run cek-skema`: dua baris `SAMA`.

Terakhir, di terminal `frontend`, `npm run preview`, lalu buka `http://localhost:5173/peta`. Diminta masuk? Masuk sebagai admin; kamu dikembalikan ke `/peta`. **Hasilnya (lab penulis, *build* produksi):** 12 ubin OSM sungguhan bergambar Monumen Nasional, tiga lingkaran, atribusi yang sama, galat konsol 0. Di tab **Console**, `document.querySelectorAll("img.leaflet-marker-icon").length` menjawab `0`: penanda tidak memakai berkas gambar, jadi tidak ikut hilang seperti ikon `Marker` (Konsep 8). Lighthouse Accessibility `/peta` ([Modul 24](../modul-24-kendali-aturan-peran/README.md#91-lighthouse-dan-color-picker-ukur-kontras-lalu-perbaiki-warnanya-15-menit)) di lab kode penulis: 100, terang dan gelap.

Hentikan hidangan (**Ctrl + C**), jalankan lagi `npm run dev`, lalu simpan ke cabang dari terminal kosong (folder `frontend`):

```text
git add package.json package-lock.json src
git commit -m "Dashboard 1.1.0: halaman Peta dengan react-leaflet (Modul 25 Praktik 7)"
```

`README.md` frontend diperbarui di [➕ D](#d-perbarui-frontendreadmemd-ke-11-lalu-readme-alat-edge-dan-readme-proyek).

> ⬆️ **Selesai Praktik 7?** Baca [Konsep 10](#10-laporan-harian-datang-sendiri-setiap-pagi-selama-backend-menyala), lalu lanjut ke [Praktik 8](#praktik-8--backend-12-laporan-harian-csv-ke-telegram-60-menit).

### Praktik 8 — Backend 1.2: laporan harian CSV ke Telegram (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `backend` (backend 1.2 dari Praktik 6, `npm run dev`) yang **tetap menyala** dan satu terminal kosong di folder `backend` untuk `npm` dan Git; **Bruno** (8.5); aplikasi **Telegram** di HP atau laptop, dengan bot Modul 19; **Excel** atau **LibreOffice Calc** (8.5); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db`. Jalur laptop: broker, simulator, dan Kebun tiruan tetap menyala; jalur perangkat: Node 1 dan Node 2 menyala. Konsep yang dipakai: 10.
>
> ⭐ **Wajib** — langkah 8.5: `npm test` lulus 14 berkas / 96 tes, Bruno `kirim laporan sekarang` dijawab `200` dan berkas `laporan-….csv` tiba di Telegram-mu, viewer ditolak `403`, lalu CSV-nya terbuka berkolom-kolom di spreadsheet.

Tahap kedua backend 1.2: tiga berkas baru, tiga berkas lama yang bertambah, `.env.example`, satu permintaan Bruno, dan lima berkas tes. Tanpa migrasi dan paket baru (node-cron dan grammY sudah ada sejak Modul 19); versinya tetap `1.2.0` dari [6.4](#64--versi-120-docs-dan-bruno-atur-lokasi-perangkat-200-403-400-10-menit). Alasannya di [Konsep 10](#10-laporan-harian-datang-sendiri-setiap-pagi-selama-backend-menyala). Keadaan akhirnya: [`kode/tahap/praktik-8/backend/`](kode/tahap/praktik-8/backend/) (= backend 1.2.0 akhir).

**Cara menyalin** sama dengan [Praktik 6](#praktik-6--backend-12-lokasi-perangkat-lewat-api-45-menit) (ketik potongannya, atau **Copy raw file**). Kode baru 8.1–8.3 belum dipanggil siapa pun sampai `server.ts` diubah di 8.4, jadi backend tetap berjalan seperti biasa. Tunda `npm run cek` sampai 8.5: sebelum 8.3 selesai, `laporan.ts` memanggil fungsi yang belum ada.

#### 8.1 `services/csv.ts`: resep CSV Modul 23 pindah ke server (12 menit)

Dashboard menyusun CSV di browser ([Modul 23](../modul-23-dashboard-realtime/README.md#82-srccsvts-dan-tombol-unduh-csv-15-menit)). Laporan pagi disusun backend, saat tidak ada browser yang terbuka, jadi resepnya ikut pindah: `kutip()`, `sel()`, dan `keCsv()` sama dengan milik `frontend/src/csv.ts`; hanya tipe isi selnya diberi nama `Sel`. `unduhCsv()` dan `waktuCsv()` tidak ikut, karena tidak dipakai server. Resep yang sama sudah kamu coba di [🔁 Langkah 4](#langkah-4--satu-baris-csv-gaya-indonesia-titik-koma-koma-desimal-dan-sel-kosong).

Di VS Code, klik kanan folder **`backend/src/services`** → **New File…**, beri nama **`csv.ts`**, lalu isi:

```ts
// csv.ts - menyusun teks CSV di server (Modul 25, untuk laporan harian). Resepnya SAMA dengan frontend/src/csv.ts Modul 23,
// supaya berkas dari dashboard dan dari laporan Telegram terbuka sama rapi di Excel atau LibreOffice dengan setelan regional
// Indonesia: pemisah titik koma (;), desimal koma (28,5), BOM di awal berkas, dan setiap baris diakhiri CRLF.
// Semua fungsi di sini "murni": hanya mengolah masukan menjadi teks, tanpa database dan tanpa jaringan, jadi mudah diuji.

export type Sel = string | number | null; // isi satu sel: teks, angka, atau kosong

// kutip - nilai yang memuat ; " atau baris baru dibungkus tanda petik, dan petik di dalamnya digandakan.
// Contoh: Node 1; ruang tamu  ->  "Node 1; ruang tamu"
export function kutip(teks: string): string {
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}

// satu sel: angka memakai koma desimal, null (sensor gagal, kolom tidak ada, atau tidak ada data) menjadi sel kosong
function sel(nilai: Sel): string {
  if (nilai === null) return "";
  if (typeof nilai === "number") return String(nilai).replace(".", ",");
  return kutip(nilai);
}

// keCsv - baris-baris (larik berisi larik) menjadi satu teks CSV
export function keCsv(baris: Sel[][]): string {
  // "\uFEFF" = BOM: tanda tak terlihat bahwa isinya UTF-8, supaya huruf istimewa di nama perangkat (misalnya ° atau é) utuh di
  // Excel. Di berkas, BOM ini menjadi 3 byte: EF BB BF.
  return "\uFEFF" + baris.map((b) => b.map(sel).join(";")).join("\r\n") + "\r\n";
}
```

Fungsinya murni, jadi mudah diuji. Buat juga **`src/services/csv.test.ts`** dari [tahapnya](kode/tahap/praktik-8/backend/src/services/csv.test.ts) (**Copy raw file**): empat tes untuk BOM 3 byte `EF BB BF` + `;` + CRLF, koma desimal, `null` yang menjadi sel kosong, dan teks berisi `;`, `"`, atau baris baru yang dibungkus petik.

#### 8.2 `services/laporan.ts`: rentang kemarin WIB, satu kueri, dan jadwal (18 menit)

Berkas ini 186 baris, terlalu panjang untuk diketik. Klik kanan **`src/services`** → **New File…** → **`laporan.ts`**, lalu isi dengan [`kode/tahap/praktik-8/backend/src/services/laporan.ts`](kode/tahap/praktik-8/backend/src/services/laporan.ts) (**Copy raw file**). Tesnya juga: **`src/services/laporan.test.ts`** dari [tahapnya](kode/tahap/praktik-8/backend/src/services/laporan.test.ts). Lalu baca berkasnya bersama tiga bagian di bawah.

**Bagian 1: rentang "kemarin" menurut WIB.**

```ts
export function rentangLaporan(sekarang: Date, hariIni = false): Rentang {
  const tanggalHariIni = tanggalIso.format(sekarang); // tanggal di WIB, bukan tanggal di zona waktu laptop
  const awalHariIni = new Date(`${tanggalHariIni}T00:00:00+07:00`);
  if (hariIni) return { dari: awalHariIni, sampai: sekarang, tanggal: tanggalHariIni, hariIni };
  const awalKemarin = new Date(awalHariIni.getTime() - HARI_MS);
  return { dari: awalKemarin, sampai: awalHariIni, tanggal: tanggalIso.format(awalKemarin), hariIni };
}
```

`tanggalIso` adalah `Intl.DateTimeFormat("sv-SE", …)` dengan `timeZone: "Asia/Jakarta"`: format Swedia kebetulan berbentuk `2026-10-26`, dan `timeZone` membuatnya tanggal WIB. Ditambah `T00:00:00+07:00`, jadilah pukul 00.00 WIB, apa pun zona laptopnya. Kemarin = mundur tepat 24 jam, karena WIB tidak punya jam musim panas. `sampai` tidak ikut dihitung, sama dengan `<` di [🔁 Langkah 3](#langkah-3--kemarin-menurut-jam-wib-date_trunc-dan-at-time-zone). `namaLaporan()` memberi nama dari tanggal isinya (`laporan-2026-10-26.csv`); laporan `?hari=ini` berakhiran `-sementara.csv`.

**Bagian 2: satu kueri, 15 kolom.** `KOLOM_LAPORAN` = urutan kolom CSV, sama dengan nama kolom hasil kueri `KUERI_LAPORAN`. Kueri itu punya empat bagian `WITH` (hasil antara bernama, dipakai seperti tabel): `ringkas` dari [`readings_per_jam`](../../fase-3-backend-data/modul-18-timescaledb/README.md#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis) (rata-rata harian ditimbang dengan banyaknya nilai per jam), `vital` dan `sehat` dari `device_health`, serta `putus` dari `events`. Penutupnya:

```sql
SELECT d.device_id, coalesce(d.nama, d.device_id) AS nama, d.jenis,
       coalesce(r.jumlah_bacaan, 0) AS jumlah_bacaan, r.suhu_rata, r.suhu_min, r.suhu_maks, r.kelembapan_rata,
       r.tanah_rata, r.tanah_min, s.rssi_rata, s.rssi_terburuk, s.heap_terendah, s.menyala_ulang,
       coalesce(p.kali_terputus, 0) AS kali_terputus
FROM devices d
LEFT JOIN ringkas r ON r.device_id = d.device_id
LEFT JOIN sehat s ON s.device_id = d.device_id
LEFT JOIN putus p ON p.device_id = d.device_id
WHERE d.terdaftar IS NOT NULL AND d.dicabut IS NULL
ORDER BY d.device_id
```

Kueri berangkat dari `devices`, dan `LEFT JOIN` menyimpan perangkat tanpa data: yang diam seharian mendapat `jumlah_bacaan` `0` lewat `coalesce`, sedangkan vitals Node 2 tetap `NULL` (sel kosong di CSV). `WHERE` membuang perangkat yang belum terdaftar atau kuncinya dicabut. `menyala_ulang` memakai `lag(uptime_s)`, yaitu *uptime* vitals sebelumnya milik perangkat yang sama: setiap kali *uptime* turun, perangkat itu menyala ulang. `kali_terputus` menghitung kejadian status yang berbunyi "terputus". Di lab penulis, angka CSV `f00d00000001` cocok dengan hitungan SQL mentah dari `readings`. Kueri ini sengaja di `services/`, bukan `db/*.ts` seperti SQL backend lain, supaya satu berkas memuat seluruh laporan, dari rentang sampai jadwal.

**Bagian 3: kirim, lalu jadwal.** `kirimLaporan()` memeriksa Telegram dulu: kalau mati, hasilnya `dilewati` tanpa membaca database. Kalau hidup, ia menghitung rentang, menjalankan kueri, menyusun CSV (`buatLaporanCsv()`), lalu mengirimnya lewat `kirimBerkas()` (8.3): `terkirim` atau `gagal`. Galat database sengaja tidak ditangkap di sini; pemanggilnya yang memutuskan (rute menjawab `503`, jadwal menulis log). Jadwalnya dipasang `mulaiLaporan()`:

```ts
  const tugas = cron.schedule(jadwal, (konteks) => laporanTerjadwal(konteks.date), {
    name: "laporan-harian",
    timezone: ZONA, // tanpa ini, "0 7 * * *" berarti 07.00 menurut zona waktu laptop (laptop WITA: 06.00 WIB)
    noOverlap: true, // kalau laporan sebelumnya belum selesai, jangan jalankan dua kali bersamaan
    missedExecutionTolerance: 15 * 60_000, // terlambat sampai 15 menit (misalnya laptop baru bangun) tetap dijalankan
  });
  tugas.on("execution:missed", (konteks) => laporanTerlewat(konteks.date));
```

`konteks.date` = jam yang tertulis di jadwal, jadi "kemarin" dihitung dari jam jadwal, bukan jam saat fungsinya berjalan. Jadwal yang terlewat lebih dari 15 menit masuk ke `laporanTerlewat()`: satu baris log dan satu pesan ⏰ lewat `kabari()`, tanpa kiriman susulan. Berhentinya ikut `hentikanJadwal()` yang sudah ada.

#### 8.3 `kirimBerkas()` di `telegram.ts`: `InputFile` dari byte, bukan dari teks (8 menit)

Bot Modul 19 baru bisa mengirim teks (`sendMessage`). Laporan butuh **berkas** (`sendDocument`). Buka `src/services/telegram.ts` ([tahapnya](kode/tahap/praktik-8/backend/src/services/telegram.ts)). Baris impor grammY menjadi:

```ts
// Modul 25: bot yang sama juga mengirim BERKAS (laporan harian CSV) lewat kirimBerkas().
import { Bot, GrammyError, HttpError, InputFile } from "grammy";
```

Lalu tepat sesudah fungsi `kabari()` berakhir, tambahkan dua fungsi ini, dan simpan:

```ts
// Modul 25: kenapa Telegram tidak bisa dipakai sekarang? null = siap mengirim.
export function alasanTelegramMati(): string | null {
  if (bot === undefined) return "TELEGRAM_BOT_TOKEN belum diisi";
  if (chatPemilik === undefined) return "TELEGRAM_CHAT_ID belum diisi";
  return null;
}

// Modul 25: kirim satu berkas ke pemilik, dengan keterangan (caption) di bawahnya. Isinya teks (misalnya CSV) yang
// dibungkus Buffer: new InputFile("teks...") TIDAK bisa dipakai, karena grammY menganggap teks sebagai JALUR berkas di disk
// (galat ENOENT). Nama berkas wajib ditulis, supaya Telegram menampilkannya sebagai laporan-2026-10-26.csv.
export async function kirimBerkas(nama: string, isi: string, keterangan: string): Promise<boolean> {
  if (bot === undefined || chatPemilik === undefined) return false;
  try {
    const berkas = new InputFile(Buffer.from(isi, "utf8"), nama); // teks -> byte UTF-8 (BOM ikut, 3 byte)
    await bot.api.sendDocument(chatPemilik, berkas, { caption: keterangan }); // berkas sampai 50 MB, keterangan 1024 huruf
    log.info(`Telegram terkirim: berkas ${nama} (${Buffer.byteLength(isi, "utf8")} byte), ${keterangan}`);
    return true;
  } catch (galat) { // sama dengan kabari(): ditolak Bot API, server tak terjangkau, atau galat lain
    if (galat instanceof GrammyError) log.error(`Telegram menolak berkas ${nama}: ${galat.description}`);
    else if (galat instanceof HttpError) log.error(`server Telegram tidak terjangkau: ${galat.message}`);
    else log.error(`Telegram gagal mengirim berkas ${nama}: ${(galat as Error).message}`);
    return false;
  }
}
```

`alasanTelegramMati()` memberi alasan untuk jawaban `409`. `kirimBerkas()` memakai bot dan chat pemilik yang sama dengan kabar 📴/✅. Kuncinya satu baris: `Buffer.from(isi, "utf8")` mengubah teks menjadi byte (BOM ikut, 3 byte), lalu `InputFile` membungkus byte itu **beserta namanya**. Jebakan `new InputFile("teks…")` = grammY menganggap isi CSV-mu jalur berkas di disk, persis `readFileSync(isi)` di [🔁 Langkah 5](#langkah-5--teks-menjadi-berkas-bufferfrom-bom-tiga-byte-dan-enoent): gagal `ENOENT` atau `File paths cannot contain …` ([🚨](#-kalau-tidak-jalan)).

Tesnya: buat **`src/services/telegram.test.ts`** dari [tahapnya](kode/tahap/praktik-8/backend/src/services/telegram.test.ts) (**Copy raw file**). Tiga tes dengan kelas `Bot` tiruan, tanpa jaringan: Telegram mati tidak mengirim; `sendDocument` menerima `InputFile` bernama `laporan-2026-10-26.csv`; kabar 📴/✅ Modul 19 tetap menunggu 60 detik.

#### 8.4 `LAPORAN_JADWAL`, rute `POST /laporan/kirim`, dan `server.ts` (12 menit)

**`src/config/env.ts`.** Di bawah `import { z } from "zod";` tambahkan `import cron from "node-cron";`. Lalu di `const Setelan = z.object({`, tepat di bawah baris `TELEGRAM_API_ROOT: …`, tambahkan:

```ts
  // Modul 25: kapan laporan harian CSV dikirim ke Telegram, cron 5 bidang (menit jam tanggal bulan hari) dalam WIB.
  // Bawaan "0 7 * * *" = setiap hari pukul 07.00 WIB. Cron 6 bidang ("0 7 * * * *") juga sah bagi node-cron, tetapi
  // artinya lain (detik 0, menit 7, SETIAP jam), jadi ditolak di sini.
  LAPORAN_JADWAL: z.preprocess(kosong, z.string().default("0 7 * * *")
    .refine((teks) => teks.trim().split(/\s+/).length === 5, "harus 5 bidang: menit jam tanggal bulan hari, misalnya 0 7 * * *")
    .refine((teks) => cron.validate(teks), "ekspresi cron tidak sah, misalnya 0 7 * * * (setiap hari 07.00 WIB)")),
```

Baris kosong berarti bawaan `0 7 * * *`. Jadwal enam bidang ditolak saat backend menyala: `Setelan LAPORAN_JADWAL di .env: harus 5 bidang: menit jam tanggal bulan hari, misalnya 0 7 * * *`, lalu backend berhenti ([🚨](#-kalau-tidak-jalan)). Tesnya: **`src/config/env.test.ts`** dari [tahapnya](kode/tahap/praktik-8/backend/src/config/env.test.ts) (**Copy raw file**, 2 tes).

**`.env.example` dan `.env`.** Di `.env.example`, tepat di bawah `TELEGRAM_CHAT_ID=`, tambahkan:

```text
# Alamat server Bot API (Modul 19). Biarkan berkomentar = server Telegram sungguhan; hanya diisi untuk server tiruan di lab.
# TELEGRAM_API_ROOT=
# Modul 25: jam laporan harian CSV ke Telegram, cron 5 bidang (menit jam tanggal bulan hari) dalam WIB: 0 7 * * * = 07.00 WIB
LAPORAN_JADWAL=0 7 * * *
```

Salin juga baris `LAPORAN_JADWAL=0 7 * * *` ke `.env`-mu (tempat token dan chat_id Modul 19), lalu simpan; `npm run dev` memulai ulang backend sendiri. Jamnya diuji di [9.1](#91--gladi-tangan-lepas-jadwal-3-menit-ke-depan-lalu-kembalikan-ke-0700-15-menit). Baris `TELEGRAM_API_ROOT` biarkan berkomentar: bot-mu memakai server Telegram sungguhan.

**`src/routes/laporan.ts`** (BARU). Klik kanan **`src/routes`** → **New File…** → **`laporan.ts`**, lalu isi:

```ts
// laporan.ts - rute /laporan (Modul 25): kirim laporan harian CSV ke Telegram SEKARANG, tanpa menunggu jadwalnya
// (LAPORAN_JADWAL). Isinya sama persis dengan laporan terjadwal; ?hari=ini mengirim laporan sementara hari ini.
// Hanya admin: satpam (keamanan.ts) menolak viewer untuk POST sebelum sampai ke sini.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { kirimLaporan } from "../services/laporan.ts";
import { waktuKontrak } from "../db/arsip.ts";

const Galat = z.object({ pesan: z.string() });
const Pilihan = z.object({
  hari: z.enum(["kemarin", "ini"]).default("kemarin")
    .describe("kemarin = 00.00-24.00 WIB kemarin, sama dengan laporan terjadwal (bawaan); ini = hari ini 00.00 WIB sampai sekarang"),
});

export const ruteLaporan: FastifyPluginAsyncZod = async (app) => {
  app.post("/laporan/kirim", {
    schema: {
      tags: ["laporan"],
      summary: "Kirim laporan harian CSV ke Telegram sekarang juga (untuk menguji, tanpa menunggu jadwalnya)",
      querystring: Pilihan,
      response: {
        200: z.object({
          berkas: z.string().describe("nama berkas di Telegram, misalnya laporan-2026-10-26.csv"),
          dari: z.string().describe("awal rentang (UTC): 00.00 WIB = 17.00 UTC hari sebelumnya"),
          sampai: z.string().describe("akhir rentang (UTC), tidak ikut dihitung"),
          perangkat: z.number().describe("banyaknya baris: perangkat terdaftar yang kuncinya belum dicabut"),
          ukuran_byte: z.number().describe("ukuran berkas CSV, termasuk BOM 3 byte"),
          keterangan: z.string().describe("keterangan (caption) di bawah berkas"),
        }).describe("laporan sudah diterima Telegram"),
        409: Galat.describe("Telegram mati: TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID di .env belum diisi"),
        502: Galat.describe("Telegram menolak berkasnya atau tidak terjangkau (lihat log backend)"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      const hasil = await kirimLaporan(req.query.hari === "ini");
      if (hasil.status === "dilewati") return reply.code(409).send({ pesan: `laporan tidak dikirim: ${hasil.pesan}` });
      if (hasil.status === "gagal") return reply.code(502).send({ pesan: hasil.pesan });
      req.log.info(`laporan ${hasil.berkas} dikirim sekarang atas perintah akun ${req.user.sub}`);
      const { berkas, rentang, perangkat, ukuran_byte, keterangan } = hasil;
      return { berkas, dari: waktuKontrak(rentang.dari), sampai: waktuKontrak(rentang.sampai), perangkat, ukuran_byte, keterangan };
    } catch (galat) {
      req.log.error(`laporan gagal dibaca dari database: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });
};
```

Pilihan `?hari=` hanya `kemarin` (bawaan, sama dengan laporan terjadwal) atau `ini`; selain itu `400`. Hasil `kirimLaporan()` menjadi kode HTTP: `dilewati` = `409`, `gagal` = `502`, galat database = `503`. Tidak ada pemeriksaan peran di sini: [satpam Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#praktik-3--satpam-di-setiap-pintu-401-dan-403-50-menit) sudah menolak viewer untuk setiap `POST`. Tesnya: **`src/routes/laporan.test.ts`** dari [tahapnya](kode/tahap/praktik-8/backend/src/routes/laporan.test.ts) (4 tes dengan satpam sungguhan).

**`src/server.ts`.** Ganti isinya dengan [versi tahap Praktik 8](kode/tahap/praktik-8/backend/src/server.ts) (**Copy raw file**). Selain komentar, keterangan `/docs`, dan dua impor, yang berubah dua baris ini:

```ts
await app.register(ruteLaporan); // Modul 25
```

```ts
mulaiLaporan(env.LAPORAN_JADWAL); // Modul 25: laporan harian CSV ke Telegram (node-cron, WIB)
```

Yang pertama memasang rute, tepat di bawah `ruteAturan`; yang kedua memasang jadwal, tepat sesudah `mulaiTelegram(…)`. Simpan. **Hasilnya (lab penulis):** backend memulai ulang dan menulis `laporan harian dijadwalkan: "0 7 * * *" Asia/Jakarta, berikutnya 27 Okt 2026, 07.00 WIB` (tanggalmu tentu lain).

#### 8.5 ⭐ `npm test`, Bruno `kirim laporan sekarang`, lalu buka CSV-nya (10 menit)

1. Di terminal kosong (folder `backend`), jalankan `npm run cek` (hanya dua baris kepala, tanpa galat), lalu `npm test`. **Hasilnya (lab penulis, dipotong):**

   ```text
    Test Files  14 passed (14)
         Tests  96 passed (96)
   ```

   Dari 9 berkas / 71 tes di Praktik 6, bertambah lima berkas: CSV 4 tes, laporan 12, Telegram 3, `LAPORAN_JADWAL` 2, rute 4.
2. Klik kanan folder **`backend/bruno`** → **New File…**, beri nama persis **`kirim laporan sekarang.yml`**, isi, lalu simpan. Bawaannya `?hari=ini`, supaya sistem yang baru menyala hari ini pun langsung punya isi.

   ```yaml
   info:
     name: kirim laporan sekarang
     type: http
     seq: 28

   http:
     method: POST
     url: "{{baseUrl}}/laporan/kirim?hari=ini"
     params:
       - name: hari
         value: ini
         type: query
     auth: inherit

   runtime:
     assertions:
       - expression: res.status
         operator: eq
         value: "200"

   settings:
     encodeUrl: true
     timeout: 0
     followRedirects: true
     maxRedirects: 5
     forwardAuthorizationHeader: true
   ```

3. Di Bruno: **`login admin`** → **`kirim laporan sekarang`**. **Hasilnya (lab penulis, 04.08 WIB; dikirim skrip lab setara Bruno; angkamu berbeda):**

   ```text
   200 {"berkas":"laporan-2026-10-27-sementara.csv","dari":"2026-10-26T17:00:00Z","sampai":"2026-10-26T21:08:32Z","perangkat":2,"ukuran_byte":326,"keterangan":"📊 Laporan sementara Rumah Pintar Mini 27 Okt 2026 (00.00–04.08 WIB): 2 perangkat"}
   ```

   `dari`/`sampai` ber-UTC (17.00Z = 00.00 WIB). Log backend: `Telegram terkirim: berkas laporan-2026-10-27-sementara.csv (326 byte), 📊 Laporan sementara …`. Server Telegram tiruan di lab penulis menerima satu `sendDocument` berisi keterangan dan berkas itu (326 byte, diawali `ef bb bf`). Di Telegram-mu, berkasnya datang dari bot Modul 19 (tampilan aplikasi tidak diuji penulis). Dapat `409` `laporan tidak dikirim: Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)`? Isi token di `.env`; kode lain: [🚨](#-kalau-tidak-jalan) *`POST /laporan/kirim` menjawab …*.
4. **Laporan kemarin.** Hapus `?hari=ini` dari URL, kirim, lalu kembalikan. **Hasilnya (lab penulis):** `laporan-2026-10-26.csv`, 295 byte, `📊 Laporan harian Rumah Pintar Mini 26 Okt 2026: 2 perangkat`. Dua, bukan tiga: `f00d00000002` kuncinya dicabut di [4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit). Sistemmu baru menyala hari ini? Baris-baris kemarin wajar berisi `0` dan sel kosong.
5. **Viewer.** **`login viewer`** → **`kirim laporan sekarang`**. **Hasilnya (lab penulis):** `403` `{"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}`, tanpa berkas. Kirim **`login admin`** lagi.
6. **Buka CSV-nya.** Unduh berkasnya dari Telegram, lalu buka dengan Excel atau LibreOffice Calc berlokal Indonesia. Yang diharapkan: 15 kolom, koma desimal (`28,5`), dan sel vitals Node 2 yang kosong. Langkah ini **tidak diuji penulis** (tanpa spreadsheet, Telegram tiruan). Satu kolom saja, atau angka berubah menjadi tanggal? [🚨](#-kalau-tidak-jalan) *CSV terbuka sebagai satu kolom …*.

Gambar di bawah: jawaban, log, dan berkas laporan sementara sebagai teks (`cat`) serta byte (`xxd`), dari larian lain (08.00 WIB); angkanya berbeda.

![Komposit teks asli dari terminal bash dan log, bukan tangkapan layar aplikasi, Praktik 8.5; CSV tidak dibuka di Excel atau LibreOffice karena tidak ada spreadsheet di mesin penulis, dan Telegram adalah server Bot API tiruan. Panel 1, jawaban POST http://localhost:8080/laporan/kirim?hari=ini lewat curl sebagai admin, setara permintaan Bruno, Response 200, JSON dirapikan: berkas laporan-2026-10-27-sementara.csv (nomor 1), dari 2026-10-26T17:00:00Z, sampai 2026-10-27T01:00:59Z, perangkat 2, ukuran_byte 326 (nomor 2), keterangan 📊 Laporan sementara Rumah Pintar Mini 27 Okt 2026 (00.00–08.00 WIB): 2 perangkat (nomor 2). Panel 2, berkas log backend, baris panjang dilipat, berjam 09:00:59: INFO: Telegram terkirim: berkas laporan-2026-10-27-sementara.csv (326 byte) dan keterangannya (nomor 3), laporan dikirim sekarang atas perintah akun 1, POST /laporan/kirim?hari=ini dengan hasil 200 (22 ms), WARN: ditolak (403): akun 2 (viewer) mencoba POST /laporan/kirim?hari=ini (nomor 4); jam log adalah jam mesin lab WITA, 09:00:59 sama dengan 08.00.59 WIB. Panel 3, yang diterima tiruan: sendDocument multipart (nomor 5), chat_id palsu, caption yang sama, document laporan-2026-10-27-sementara.csv 326 byte, awal ef bb bf 64 65 76 69 63, parse_mode tidak dikirim (nomor 5). Panel 4, cat: baris judul device_id;nama;jenis sampai kali_terputus dengan pemisah titik koma (nomor 6); f00d00000001;Latihan ruang tamu;node1;191;27,7;21,6;33;... dengan koma desimal 27,7 (nomor 7); f00d000000b2;Kebun (tiruan);node2;5;28,4;...;36;;;;;0 dengan empat sel kosong di antara lima titik koma (nomor 8). Panel 5 dan 6, xxd: 00000000: efbb bf64 6576 ... dengan BOM efbb bf yang tampil sebagai tiga titik (nomor 9); 000000a0: ... 730d 0a66 ... dengan akhir baris 0d 0a yang tampil sebagai dua titik (nomor 10) dan 27,7 di baris d0 (nomor 7).](aset/laporan-csv.png)

**Kamu lulus langkah ⭐ ini** kalau `npm test` lulus 14 / 96, admin mendapat `200` dan berkasnya tiba di Telegram-mu, viewer mendapat `403`, dan CSV-nya terbuka berkolom-kolom.

**Simpan ke cabang.** Di terminal kosong (folder `backend`); `.env` tidak ikut karena ada di `.gitignore`:

```text
git add src bruno .env.example
git commit -m "Backend 1.2.0: laporan harian CSV ke Telegram (Modul 25 Praktik 8)"
```

`README.md` backend diperbarui di [➕ C](#c-perbarui-backendreadmemd-bruno-dan-docs-ke-120).

> ⬆️ **Selesai Praktik 8?** Lanjut ke [Praktik 9](#praktik-9--laporan-yang-datang-sendiri-lalu-grafana-sebagai-berkas-35-menit): laporan yang sama, kini datang sendiri tanpa disentuh.

### Praktik 9 — Laporan yang datang sendiri, lalu Grafana sebagai berkas (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan berkas `backend/.env`, terminal `backend` (backend 1.2, `npm run dev`) yang **tetap menyala**, dan satu terminal kosong di folder `rumah-pintar-mini` untuk Git; **aplikasi Telegram** dengan bot Modul 19 (9.1); **Chrome** atau **Edge** dengan Grafana di `http://localhost:3000`, masuk sebagai `admin` (9.2–9.3); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana`. Jalur laptop: broker, simulator, dan Kebun tiruan tetap menyala; jalur perangkat: Node 1 dan Node 2 menyala. Konsep yang dipakai: 10, ditambah 5 untuk ekspor dashboard.
>
> ⭐ **Wajib** — langkah 9.1 dan 9.2: laporan terjadwal tiba di Telegram-mu tanpa kamu sentuh (**G3**), lalu dashboard `Kesehatan Sistem` dan aturan `Node diam` tersimpan sebagai berkas di `grafana/` dan masuk cabang, tanpa token atau chat_id.

Praktik 8 memeriksa isi laporan dengan tombol uji. Syarat lulus meminta lebih: laporan **tiba otomatis**, jadi di 9.1 jam laporan dimajukan ke 3 menit lagi, lalu kamu melepas tangan. Di 9.2, dashboard dan aturan *alert*, yang sejauh ini hanya tinggal di lemari Grafana (`rumahpintar-grafana-data`), diekspor menjadi berkas di Git: dirakit tanpa koding, lalu disimpan sebagai kode. 9.3 mencoba berkas itu dengan mengimpornya lagi.

#### 9.1 ⭐ Gladi tangan lepas: jadwal 3 menit ke depan, lalu kembalikan ke 07.00 (15 menit)

Menunggu pukul 07.00 besok juga sah, tetapi gladi lebih cepat. Yang diuji di sini adalah jam backend sendiri, bukan tombol `POST /laporan/kirim` di 8.5.

1. **Hitung jadwalnya.** Lihat jam sekarang **dalam WIB**, tambah 3 menit, lalu tulis sebagai cron lima bidang `menit jam * * *` ([Konsep 10](#10-laporan-harian-datang-sendiri-setiap-pagi-selama-backend-menyala)). Contoh: pukul 04.12 → `15 4 * * *`; pukul 09.58 → `1 10 * * *`. Jadwal ini selalu dibaca dalam WIB (`timezone: "Asia/Jakarta"`), apa pun zona laptopmu: laptop ber-WITA kurangi 1 jam, ber-WIT 2 jam. Laptop penulis ber-WITA.
2. **Ubah `.env`, lalu simpan.** Di VS Code, buka `backend/.env`, ganti baris `LAPORAN_JADWAL=0 7 * * *` dari [8.4](#84-laporan_jadwal-rute-post-laporankirim-dan-serverts-12-menit) menjadi jadwalmu, misalnya `LAPORAN_JADWAL=15 4 * * *`, lalu **Ctrl + S** (macOS **Cmd + S**). Jangan sentuh terminal: `npm run dev` menjalankan `node --watch --env-file=.env`, yang memulai ulang backend sendiri setiap `.env` disimpan.

   **Hasilnya (lab penulis, dipotong; log mencetak jam laptop, di sini sudah diubah ke WIB; jalurmu berbeda):**

   ```text
   Change detected in '/home/kamu/rumah-pintar-mini/backend/.env'
   Restarting 'src/server.ts'
   [04:12:21] INFO: SIGTERM diterima: backend berhenti dengan rapi
   …
   [04:12:22] INFO: laporan harian dijadwalkan: "15 4 * * *" Asia/Jakarta, berikutnya 27 Okt 2026, 04.15 WIB
   …
   [04:12:22] INFO: bot Telegram @… siap (long polling)
   ```

   Baca tanggal dan jam sesudah `berikutnya`: harus **hari ini**, sekitar 3 menit sesudah jam WIB sekarang. Lebih lambat 1 jam? Jam WITA belum dikurangi 1 jam (WIT: 2 jam). Tertulis tanggal besok? Menit itu sudah lewat; hitung ulang. Tidak ada `Change detected`? Pastikan `.env` sudah tersimpan; kalau sudah, backend-mu tidak berjalan dengan `npm run dev`: **Ctrl + C**, lalu `npm run dev`.
3. **Lepas tangan.** Jangan klik apa pun dan jangan kirim Bruno; cukup amati terminal `backend` dan Telegram. Catat jam berkasnya tiba.

   **Hasilnya (lab penulis, jam WIB):**

   ```text
   [04:15:00] INFO: laporan harian berjalan sesuai jadwal
   [04:15:00] INFO: Telegram terkirim: berkas laporan-2026-10-26.csv (295 byte), 📊 Laporan harian Rumah Pintar Mini 26 Okt 2026: 2 perangkat
   ```

   Server Telegram tiruan di lab penulis menerima `sendDocument` pukul 04.15.00,036 WIB: `laporan-2026-10-26.csv`, 295 byte, diawali `ef bb bf`; nama dan ukurannya sama dengan laporan kemarin di [8.5](#85--npm-test-bruno-kirim-laporan-sekarang-lalu-buka-csv-nya-10-menit) langkah 4. Di Telegram-mu, berkas `laporan-YYYY-MM-DD.csv` bertanggal kemarin datang dari bot Modul 19 dengan keterangan `📊 Laporan harian …` (tampilan aplikasi tidak diuji penulis); tanggal di namanya pasti berbeda, sedangkan jumlah perangkat dan ukurannya bisa berbeda. Log menulis `laporan harian dilewati: Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)`, atau berkasnya tidak datang? Lihat [🚨](#-kalau-tidak-jalan) *Laporan pagi tidak tiba …*.
4. **Kembalikan ke 07.00.** Ubah lagi menjadi `LAPORAN_JADWAL=0 7 * * *`, lalu simpan. **Hasilnya (lab penulis):** sesudah mulai ulang, `laporan harian dijadwalkan: "0 7 * * *" Asia/Jakarta, berikutnya 27 Okt 2026, 07.00 WIB`. Biarkan laptop dan backend menyala sampai pukul 07.00 berikutnya, dan laporan kemarin datang sendiri. Di lab penulis (gladi pukul 04.12, jadi "kemarin"-nya sama), laporan itu tiba tepat 07.00.00 WIB, sama byte demi byte dengan berkas gladi.

**Laptop tidur pada jam laporan.** Kalau laptop baru bangun lebih dari 15 menit sesudahnya, laporan itu **tidak** dikirim belakangan; yang datang hanya pesan ⏰ `… terlewat (laptop tidur atau backend sibuk?). Kirim sekarang lewat POST /laporan/kirim` (contoh utuhnya di Konsep 10). Kirim sendiri lewat Bruno `kirim laporan sekarang` tanpa `?hari=ini`. Backend yang mati pada jam itu tidak meninggalkan kabar apa pun.

**Kamu lulus langkah ⭐ ini** kalau `laporan harian berjalan sesuai jadwal` muncul tepat pada menit pilihanmu, berkas `laporan-….csv` tiba di Telegram-mu tanpa kamu sentuh (**G3**), dan `.env` kembali `0 7 * * *`. Catat jam jadwal, jam log, dan jam berkas tiba di catatanmu; G3 dicentang lagi di [10.4](#104--gladi-akhir-tes-backend-build-frontend-dan-tiga-syarat-lulus-20-menit). Penulis membuktikannya dengan server Telegram tiruan; bukti dengan bot-mu sendiri adalah milikmu.

#### 9.2 ⭐ Ekspor dashboard (JSON Classic) dan aturan *alert* (YAML arsip) ke `grafana/` (12 menit)

Sebagai berkas di Git, dashboard dan aturan bisa dibaca di *pull request*, dicocokkan dengan kunci, dan menjadi "tautan Grafana" Checkpoint Fase 4 ([10.3](#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit)). Siapkan dua folder: di VS Code, klik kanan folder **`grafana`** → **New Folder…** → `dashboards`, lalu sekali lagi → `alerting`.

**Dashboard sebagai JSON Classic.**

1. Buka dashboard `Kesehatan Sistem` dalam **mode lihat** (masih ada tombol **Exit edit**? klik dulu).
2. Di bilah kanan, klik ikon **Export** (ekspor) → **Export as code** (ekspor sebagai kode). Laci `Export dashboard` terbuka dengan model bawaan **V2 Resource** (`"apiVersion": "dashboard.grafana.app/v2"`).
3. Buka **Advanced options** (opsi lanjutan), lalu pada **Model** pilih **Classic**. Pilihan **Format** hilang, karena hanya untuk V2.
4. Pastikan sakelar **Share dashboard with another instance** (bagikan ke Grafana lain) menyala, lalu klik **Download file** (unduh berkas).
5. Seret berkas itu dari folder unduhan browser (biasanya **Downloads**) ke folder `grafana/dashboards` di panel kiri VS Code, lalu klik kanan → **Rename…** → `kesehatan-sistem.json`.

**Hasilnya (lab penulis):** unduhan `Kesehatan Sistem-1793049242166.json`, 17.803 byte (angka di namanya = waktu unduh). Di dalamnya, `"__inputs"` berisi satu `DS_GRAFANA-POSTGRESQL-DATASOURCE`, dan setiap panel memakai `"uid": "${DS_GRAFANA-POSTGRESQL-DATASOURCE}"`, bukan uid (pengenal unik) *data source*-mu: itulah kerja sakelar tadi, supaya Grafana yang mengimpornya bertanya *data source* mana yang dipakai (9.3). Pilihan variabel `Node` juga tidak ikut (`"current": {}`; [Konsep 5](#5-variabel-satu-dashboard-untuk-semua-perangkat)). Classic dipilih karena bentuk inilah yang luas dipakai untuk ekspor, impor, dan berbagi dashboard, sama dengan berkas kunci dan jalan pintas Kemenangan Cepat; V2 Resource adalah bentuk baru yang menjadi bawaan Grafana 13.

**Aturan *alert* sebagai YAML arsip.**

1. **Alerting → Alert rules**. Di bawah folder `Rumah Pintar Mini`, baris grup `kesehatan-node` punya tombol **Edit** dan **More**. Klik **More** → **Export rules group** (ekspor grup aturan), satu-satunya pilihan.
2. Di laci `Export kesehatan-node rules`, pilih **YAML** (pilihan lain: `JSON`, `Terraform (HCL)`), lalu klik **Download**.
3. Seret `kesehatan-node.yaml` (lab penulis: 3.571 byte) ke `grafana/alerting`, lalu ganti namanya menjadi `node-diam.yaml`.

Laci itu menulis `YAML format is only valid for File Provisioning. Read more in the docs.` Artinya, YAML ini **arsip**, bukan berkas untuk diimpor: menu **Import alert rules** di halaman yang sama hanya menerima aturan format Prometheus. Memasangnya butuh *provisioning* berkas (Grafana membaca YAML dari foldernya setiap menyala; Modul 26), yang menuntut *contact point* bernama sama sudah ada dan `datasourceUid` yang cocok; kalau tidak, Grafana jatuh bangun (terus dimulai ulang) ([🚨](#-kalau-tidak-jalan) *Grafana jatuh bangun sesudah YAML aturan …*, [🔬](#-bedah-teknis-opsional) *Dashboard sebagai kode …*). Untuk memulihkan aturan di modul ini, buat ulang lewat layar seperti [4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit), dengan YAML sebagai contekan kueri dan Summary.

**Pindai sebelum *commit*.** Buka kedua berkas di VS Code. Di masing-masing, tekan **Ctrl + F** (macOS **Cmd + F**) dan cari `token`, `password`, lalu angka chat_id-mu dari `backend/.env`: semuanya harus tanpa temuan (lab penulis: 0). Yang memang ikut terekspor dan bukan rahasia ada di YAML: `datasourceUid` (uid acak *data source*-mu) dan `receiver: Telegram Rumah Pintar` (hanya nama *contact point*). Isi *contact point*, termasuk token bot, tidak pernah ikut ekspor.

**Cocokkan dengan kunci** [`kode/grafana/dashboards/kesehatan-sistem.json`](kode/grafana/dashboards/kesehatan-sistem.json) dan [`kode/grafana/alerting/node-diam.yaml`](kode/grafana/alerting/node-diam.yaml). Di lab penulis, YAML hasil ekspor hanya berbeda dua baris dari kunci (di luar empat baris komentar kepalanya): `uid` aturan dan `datasourceUid`. Di JSON, kueri dan setelan kelima panel sama; `uid` dashboard (lab: `adr4wkv`), `version`, dan `"description"` dashboard (hanya ada di kunci) boleh berbeda.

**Simpan ke cabang.** Di terminal kosong (folder `rumah-pintar-mini`):

```text
git add grafana
git commit -m "Grafana: ekspor dashboard Kesehatan Sistem dan aturan Node diam (Modul 25 Praktik 9)"
```

**Kamu lulus langkah ⭐ ini** kalau `grafana/dashboards/kesehatan-sistem.json` (Classic, ber-`__inputs`) dan `grafana/alerting/node-diam.yaml` sudah di-*commit* ke cabang, tanpa token, sandi, atau chat_id. Tautan GitHub ke berkas JSON itu adalah "tautan Grafana" untuk Checkpoint.

#### 9.3 Coba impor ke Grafana yang sama: Change uid dulu (opsional, 8 menit)

Boleh dilewati. Caranya sama dengan jalan pintas Impor di [KC Langkah 6](#langkah-6--panel-pertama-kueri-suhu-dengan-format-time-series-lalu-simpan-6-menit), ditambah satu jebakan.

1. **Dashboards → New → Import dashboard**. Salin seluruh isi `grafana/dashboards/kesehatan-sistem.json` dari VS Code, tempel di kotak **Import via dashboard JSON model**, lalu klik **Load** yang **kedua** (di bawah kotak itu).
2. Bagian `Options` menulis `Dashboard named 'Kesehatan Sistem' in folder 'Rumah Pintar Mini' has the same UID`, dan tombolnya `Import (Overwrite)`. **Jangan diklik**: tombol itu menimpa dashboard aslimu. UID adalah pengenal dashboard di alamatnya (`/d/<uid>/…`), dan berkasmu membawa UID yang asli.
3. Klik **Change uid** (ganti uid), isi medan **Unique identifier (UID)** dengan `kesehatan-sistem-impor`, lalu ubah **Name** menjadi `Kesehatan Sistem (impor)`. Tombolnya kini **Import**.
4. Di `DS_GRAFANA-POSTGRESQL-DATASOURCE`, pilih `grafana-postgresql-datasource` (kalau terlewat, Grafana menjawab `A data source is required`), lalu **Import**.

**Hasilnya (lab penulis):** alamat `/d/kesehatan-sistem-impor/kesehatan-sistem-impor?…&var-node=$__all&refresh=1m`, dan kelima panel langsung berisi data. Salinannya ada di **Folder** `Dashboards` (bawaan), terpisah dari `Rumah Pintar Mini`. Penulis juga mengimpor JSON yang sama ke Grafana kedua yang masih kosong (langkah lab, bukan langkahmu): sesudah *data source* dibuat lalu dipilih, kelima panelnya berisi data. Berkas di `grafana/` tidak berubah, jadi tidak ada yang di-*commit*. Galat lain: [🚨](#-kalau-tidak-jalan) *Impor dashboard: …*.

> ⬆️ **Selesai Praktik 9?** Baca [Konsep 11](#11-beli-atau-bangun-platform-iot-siap-pakai) (bacaan bebas), lalu lanjut ke [Praktik 10](#praktik-10--checkpoint-fase-4-kumpulkan-buktinya-45-menit), Checkpoint Fase 4.

### Praktik 10 — Checkpoint Fase 4: kumpulkan buktinya (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `backend` (backend 1.2, `npm run dev`), terminal `frontend` (Vite; mode HP di 10.2), dan satu terminal kosong untuk tes dan *build*; jalur laptop ditambah broker, simulator, dan Kebun tiruan; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana`; **Chrome** atau **Edge** dengan Grafana di `http://localhost:3000`, dashboard di `http://localhost:5173`, dan GitHub; **HP** di WiFi rumah dengan **aplikasi Telegram** (10.2); serta catatan belajarmu. Konsep yang dipakai: 1, 11, dan semua yang lain.
>
> ⭐ **Wajib** — langkah 10.4: backend lulus `npm run cek`, `npm test` (14 / 96), dan `npm audit`; dashboard lolos `npm run lint`, `npm run build`, dan `npm run cek-skema`; G1, G2, dan G3 tercentang dengan buktinya di catatanmu.

Praktik terakhir tidak menambah fitur. Silabus meminta setiap fase meninggalkan [tiga bukti](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase) di repositorimu. Di 10.1–10.3 kamu mengumpulkan bukti Fase 4, lalu di 10.4 memeriksa seluruh proyek sekali lagi sebelum *pull request* di [➕ F](#f--gabungkan-fiturgrafana-peta-laporan-ke-main-lewat-pull-request-dashboard-teknis--peta--laporan-harian-checkpoint-fase-4). Tidak ada berkas proyek yang berubah, jadi tidak ada *commit*; buktinya disimpan di [➕ G](#g-simpan-catatan-belajar-dan-bukti-checkpoint-fase-4).

#### 10.1 Tiga bukti Fase 4: kuis, dipakai orang lain, serta video dan tautan Grafana (5 menit)

| Bukti Fase 4 (Silabus §8) | Asalnya | Yang kamu lakukan sekarang |
| :--- | :--- | :--- |
| Kuis setiap modul: ≥ 4 benar | 📝 [Modul 22](../modul-22-react-dasar/README.md#-kuis-5-soal), [23](../modul-23-dashboard-realtime/README.md#-kuis-5-soal), [24](../modul-24-kendali-aturan-peran/README.md#-kuis-5-soal), dan [25](#-kuis-5-soal) | catat skormu; kuis Modul 25 ada di akhir modul ini |
| Proyek: dashboard dipakai orang lain tanpa dibantu | [Modul 24 Praktik 10](../modul-24-kendali-aturan-peran/README.md#praktik-10--uji-kelulusan-dipakai-orang-lain-dari-hp-70-menit), L1–L3 | tidak diulang; tulis "sudah" atau "belum" |
| Artefak: video demo HP dan tautan Grafana | baru minggu ini | [10.2](#102-video-demo-hp-6090-detik-naskah-dan-yang-tidak-boleh-terekam-15-menit) dan [10.3](#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit) |

Salin **Lembar bukti Checkpoint Fase 4** (lima butir di akhir [`kode/checkpoint/naskah-video.md`](kode/checkpoint/naskah-video.md)) ke catatanmu, lalu centang hanya yang **sudah terjadi**. L1–L3 Modul 24 belum diuji orang lain? Checkpoint boleh ditutup belakangan: kerjakan Modul 24 Praktik 10.2–10.5 begitu ada penguji. Tugasnya tetap sama di dashboard 1.1, yang hanya menambah menu **Peta**.

#### 10.2 Video demo HP 60–90 detik: naskah dan yang tidak boleh terekam (15 menit)

Video pendek ini memperlihatkan bahwa sistemmu sungguh dipakai dari HP: angka *live*, kendali, peta, dan kabar Telegram dalam satu rekaman tanpa dipotong. Buka [`kode/checkpoint/naskah-video.md`](kode/checkpoint/naskah-video.md) di GitHub dan ikuti empat bagian pertamanya:

1. **Sebelum merekam (5 menit).** Nyalakan semuanya: database, broker, backend 1.2, simulator atau Node 1 dan Node 2, dan Grafana. Nyalakan mode HP Modul 23 untuk [backend](../modul-23-dashboard-realtime/README.md#92-backend-mode-hp-host-dan-cors_origin-10-menit) (`HOST=0.0.0.0`, IP laptop di `CORS_ORIGIN`) dan [Vite](../modul-23-dashboard-realtime/README.md#93-vite-mode-hp-npm-run-devhp-dan-firewall-private-10-menit) (`npm run dev:hp`). **Masuk di HP sebelum mulai merekam**, supaya layar Masuk tidak terekam. Pastikan titik di **Peta** masih titik contoh, nyalakan mode **Jangan Ganggu** di HP, dan siapkan chat bot Modul 19 yang sudah berisi 🔴/✅ dari Grafana (Praktik 5) dan 📊 (Praktik 9).
2. **Naskah (60–90 detik), direkam dengan fitur rekam layar bawaan HP.** Layar **Perangkat** dengan lencana **Live** → satu perangkat dengan angka yang bergerak sendiri → **Kendali**: lampu menyala sesudah `Menunggu konfirmasi perangkat…`, lalu dimatikan → **Peta**: lingkaran hijau atau abu-abu, ketuk satu untuk *popup* → Telegram: 🔴 dan ✅ dari Grafana, lalu berkas 📊 `laporan-….csv` → kembali ke dashboard. Kalimat yang boleh kamu ucapkan ada di tabel naskahnya.
3. **Yang TIDAK boleh terekam:** sandi apa pun (layar Masuk dashboard dan Grafana, papan ketik); token bot dan isi `backend/.env`; chat_id dan halaman BotFather; formulir *contact point* Grafana, karena medan **BOT API Token** menampilkan token polos; koordinat rumahmu; IP publik rumah (IP WiFi laptop pun sebaiknya tidak disorot); notifikasi pribadi, nama WiFi, email, serta wajah atau suara anggota keluarga yang tidak setuju direkam. Putar ulang videonya sekali dari awal sampai akhir khusus untuk mencari semua ini.
4. **Sesudah merekam (2 menit).** Ketuk **Keluar** di HP, lalu [kembalikan mode laptop](../modul-23-dashboard-realtime/README.md#104-kembalikan-mode-laptop-5-menit): `HOST=127.0.0.1`, IP laptop dihapus dari `CORS_ORIGIN`, dan Vite: **Ctrl + C**, lalu `npm run dev`. Matikan **Jangan Ganggu**.

Unggah video sebagai **video tidak publik** (hanya pemegang tautan yang bisa menonton), atau simpan di penyimpanan pribadimu. Berkas videonya jangan masuk Git; yang dicatat cukup tautannya.

> [!NOTE]
> Penulis tidak merekam video ini karena tidak ada HP di lab penulis, jadi langkah ini tanpa kotak **Hasilnya**. Node 2, Telegram, atau HP sungguhan belum kamu punya? Rekam bagian yang sudah ada, lalu tulis terus terang di catatanmu bagian mana yang belum.

#### 10.3 "Tautan Grafana": JSON di GitHub, tangkapan layar, dan catatan kapan memakai yang mana (5 menit)

Grafana-mu hanya terbuka untuk laptop itu sendiri, dan baru bisa dibuka dari internet lewat HTTPS di Modul 27. Karena itu, di modul ini **"tautan Grafana" = tautan GitHub ke `grafana/dashboards/kesehatan-sistem.json`** hasil ekspor [9.2](#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit), ditambah satu tangkapan layar dashboard-nya. Fitur berbagi bawaan Grafana sengaja tidak dipakai: *snapshot* eksternal mengirim data rumahmu ke internet, dashboard publik terbuka tanpa *login*; keduanya sudah dimatikan di `docker run` (1.3).

1. **Tautan.** Cabangmu baru akan didorong ke GitHub di ➕ F. Begitu *pull request*-nya digabung, buka berkas itu di cabang `main` (alamatnya berbentuk `https://github.com/nama-akunmu/rumah-pintar-mini/blob/main/grafana/dashboards/kesehatan-sistem.json`), lalu salin alamatnya ke lembar bukti.
2. **Tangkapan layar.** Buka `Kesehatan Sistem` dengan `Node` **All** dan rentang yang berisi data, misalnya **Last 6 hours**, lalu tangkap area dashboard saja dengan alat tangkapan layar bawaan laptopmu (kira-kira seperti gambar di akhir 3.2). Periksa dulu: tanpa tab lain, *bookmark*, atau email akun. Simpan untuk ➕ G.
3. **Catatan "kapan memakai yang mana".** Tulis ulang tabel [Konsep 1](#1-dua-dashboard-dua-penonton-tiga-alat-yang-sudah-kamu-pegang) dengan kata-katamu sendiri, satu baris untuk Node-RED, dashboard React, dan Grafana: untuk siapa, satu pertanyaan dari rumahmu yang paling cocok dijawabnya, satu kelemahannya, dan kapan **tidak** dipakai. Boleh ditambah jawabanmu atas tujuh pertanyaan [Konsep 11](#11-beli-atau-bangun-platform-iot-siap-pakai). Intinya: dashboard React untuk penghuni, Grafana untuk tim teknis, Node-RED untuk mencoba ide dengan cepat.

#### 10.4 ⭐ Gladi akhir: tes backend, *build* frontend, dan tiga syarat lulus (20 menit)

Sebelum *pull request*, pastikan semua bagian masih utuh bersama-sama. Terminal `backend` dan Vite boleh tetap menyala; pemeriksaan berjalan di terminal kosong.

1. **Backend.** Di folder `backend`, jalankan `npm run cek`, `npm test`, lalu `npm audit`. **Hasilnya (lab penulis, dipotong; backend yang menyala di terminal lain tidak ikut dimulai ulang):**

   ```text
   > rumah-pintar-mini-backend@1.2.0 cek
   > tsc --noEmit

   …
    Test Files  14 passed (14)
         Tests  96 passed (96)
   …
   found 0 vulnerabilities
   ```

   Hasil `npm audit` bergantung tanggal; ada temuan? `npm audit fix` (bukan `--force`), `npm test` lagi, lalu *commit* `package-lock.json`.
2. **Dashboard.** `cd ../frontend`, lalu `npm run lint`, `npm run build`, dan `npm run cek-skema`. Patokannya sama dengan [7.5](#75-dashboard-110-lint-build-cek-skema-dan-preview-10-menit): `Found 0 warnings and 0 errors.`, *build* lolos dengan **satu** peringatan ukuran 500 kB, dan dua baris `SAMA`. Folder `dist/` hasil *build* tidak ikut Git.
3. **Tiga syarat lulus.** Cocokkan catatanmu dengan tabel ini, lalu centang di [✅](#-checklist-kelulusan-modul-25):

   | Syarat | Buktinya di catatanmu |
   | :-: | :-- |
   | G1 | pesan `🔴 Notification test` dari bot-mu ([4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit)) |
   | G2 | lembar catatan G2: 🔴 Grafana 5,5–11,5 menit sesudah baterai Node 2 dicabut (jalur laptop: `kebun cabut`), lalu ✅ sesudah dipasang ([5.3](#53--hitung-perkiraan-tunggu-kabar-grafana-lalu-bandingkan-dengan-kabar-backend-15-menit), [5.4](#54--pasang-lagi-dua-kabar-pulih-dan-lembar-catatan-waktunya-10-menit)) |
   | G3 | jam jadwal, baris `laporan harian berjalan sesuai jadwal`, dan jam berkas `laporan-….csv` tiba tanpa disentuh ([9.1](#91--gladi-tangan-lepas-jadwal-3-menit-ke-depan-lalu-kembalikan-ke-0700-15-menit)) |

4. **Keadaan akhir.** `backend/.env` berisi `LAPORAN_JADWAL=0 7 * * *` dan `HOST=127.0.0.1`, baterai Node 2 atau Kebun terpasang, dan aturan `Node diam` di **Alerting → Alert rules** berstatus `Normal`.

**Kamu lulus langkah ⭐ ini** kalau backend lulus `npm run cek`, 14 / 96, dan `npm audit`, dashboard lolos *lint*, *build* (satu peringatan), dan `cek-skema`, serta G1–G3 tercentang dengan bukti dari bot-mu sendiri. Penulis membuktikan G1–G3 dengan server Telegram tiruan dan Kebun tiruan; centang hanya yang sungguh terjadi padamu.

> 🎉 **Checkpoint Fase 4 — rumah yang diawasi dan melapor sendiri.** Modul 22 memberi Rumah Pintar Mini **wajah**, Modul 23 membuatnya **hidup** (angka *live*, grafik, riwayat, HP), Modul 24 membuatnya **memerintah** (kendali, aturan, peran, dicoba orang lain), dan minggu ini rumahmu **diawasi dan dilaporkan**: Grafana untuk tim teknis, *alert* saat node diam, peta perangkat, dan laporan harian yang datang sendiri. Backend kini 1.2.0 dan dashboard 1.1.0. Otaknya masih di laptop, jadi Grafana, *alert*, dan laporan hanya bekerja selama laptopmu menyala; Fase 5 memindahkannya ke server yang menyala terus, mulai dari Docker Compose di Modul 26. Bukti yang belum terjadi (penguji, video, bot sungguhan) boleh menyusul: Checkpoint ditutup saat lembar buktinya penuh.

**Grafana dari HP (opsional).** Silabus menyebut Grafana dan peta di antara hasil Fase 4 di HP. Peta sudah ikut mode HP dashboard-mu (10.2), sedangkan Grafana sengaja hanya di `127.0.0.1:3000` ([1.3](#13-pintu-grafana-401-tanpa-login-hanya-dari-laptop-ini-tanpa-berbagi-ke-luar-5-menit)). Loket kontainer yang sudah berjalan tidak bisa diubah, jadi kontainernya dibuat ulang sebentar dengan lemari yang sama ([Konsep 2](#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong)). Di terminal kosong, jalankan `docker rm -f rumahpintar-grafana`, lalu perintah [KC Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit) dengan `-p 3000:3000`:

```text
docker run -d --name rumahpintar-grafana --network rumahpintar -p 3000:3000 -e GF_PLUGINS_PREINSTALL_DISABLED=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_SNAPSHOTS_EXTERNAL_ENABLED=false -e GF_PUBLIC_DASHBOARDS_ENABLED=false -v rumahpintar-grafana-data:/var/lib/grafana --restart unless-stopped grafana/grafana:13.2.4
```

Di HP (WiFi rumah yang sama), buka `http://<IP-laptop>:3000` dan masuk sebagai `admin`. Windows bisa menanyakan izin *firewall*: izinkan hanya jaringan **Private** (tidak diuji penulis). Grafana masih `http://` polos, jadi sandimu melintas WiFi tanpa enkripsi. Selesai melihat, jalankan lagi `docker rm -f rumahpintar-grafana`, lalu perintah KC Langkah 2 **persis**, sampai `docker ps` kembali menulis `127.0.0.1:3000->3000/tcp`.

**Hasilnya (lab penulis; bukan HP, melainkan browser kedua lewat IP LAN mesin lab):** `docker ps` kolom PORTS `0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp`; browser kedua masuk dengan sandi yang sama dan melihat lima panel `Kesehatan Sistem`, aturan `Node diam`, dan *contact point* `Telegram Rumah Pintar`. Lemari sama, isi tetap: bekal Modul 26 saat Grafana pindah ke Docker Compose. Sesudah dikembalikan, `curl` ke `http://192.168.1.10:3000` ditolak lagi (`Could not connect to server`).

> ⬆️ **Selesai Praktik 10?** Lanjut ke [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini); [🧩 Tantangan](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip masalahmu. Docker dan database dasar ada di 🚨 Modul 17, bot Telegram di 🚨 Modul 19, broker dan ACL di 🚨 Modul 21, dashboard React di 🚨 Modul 22–24. Lirik dulu `docker ps` (kolom STATUS dan PORTS), terminal `backend` dan broker, Query inspector, serta tab **Instances** dan **History** aturan. Masih buntu? Bandingkan berkasmu dengan [`kode/tahap/`](kode/tahap/) di akhir praktik yang sama, dan dashboard atau aturanmu dengan [`kode/grafana/`](kode/grafana/).

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (Grafana 13.2.4, leaflet 1.9.4, react-leaflet 5.0.0, node-cron 4.6.0)</b></summary>

| Petunjuk lama | Yang benar untuk versi kita | Kenapa |
| :--- | :--- | :--- |
| `grafana/grafana-oss`, atau image tanpa *tag* | `grafana/grafana:13.2.4` | `grafana-oss` mandek di 13.0.2 (Juni 2026); tanpa *tag*, menunya bisa lain |
| `grafana-cli …`, `grafana-server` | `grafana cli …`, `grafana server` | Perintah lama dihapus di Grafana 13 |
| *Notification channel* (*alert* gaya lama) | *Contact point* + aturan di **Alerting** | Cara lama tidak ada lagi |
| Menu "Alerts & IRM" | **Alerting** di menu kiri | Nama menu 13.2.4 |
| Uji *contact point* lewat endpoint API lama | Tombol **Test** | Endpoint lama menjawab `410` |
| Tombol "Add visualization" | **Add** → **Panel** → **Configure visualization** | Nama tombol 13.2.4 |
| Host `localhost:5432` atau `host.docker.internal` | `rumahpintar-db:5432` lewat lorong | `localhost` di kontainer = kontainer itu sendiri |
| Ubin `http://{s}.tile.openstreetmap.org/…` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | Alamat resmi kebijakan ubin OSM |
| `react@rc`, `react-leaflet@next` | `leaflet@1.9.4 react-leaflet@5.0.0` + `-D @types/leaflet@1.9.22` | `@next` memasang versi uji lama |
| Ikon `Marker` + resep `mergeOptions` | `CircleMarker` | Ikon hilang sesudah *build*, resepnya merusak mode dev |
| `new InputFile("isi CSV…")` | `new InputFile(Buffer.from(isi, "utf8"), nama)` | Teks dianggap jalur berkas |
| Cron 6 bidang `0 7 * * * *` | 5 bidang `0 7 * * *` | Bidang pertamanya detik: menit ke-7 setiap jam |
| "Impor YAML aturan *alert*" | Buat ulang lewat layar (4.3); YAML = arsip | **Import alert rules** hanya format Prometheus |

</details>

**Grafana dan Docker**

<details>
<summary><b><code>docker run</code> Grafana gagal karena <i>network</i> <code>rumahpintar</code> belum ada</b></summary>

Jalankan kedua perintah [KC Langkah 1](#langkah-1--lorong-rumahpintar-antarkontainer-cukup-sekali-2-menit) (`docker network create rumahpintar`, lalu `docker network connect rumahpintar rumahpintar-db`), lalu ulangi `docker run` [KC Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit). Ditolak karena nama `rumahpintar-grafana` sudah dipakai? Ada kontainer sisa: `docker rm -f rumahpintar-grafana`, lalu `docker run` lagi. Lemarinya tidak ikut terhapus.

</details>

<details>
<summary><b>Port 3000 sudah terpakai, misalnya oleh <code>alat/penerima-webhook.js</code></b></summary>

**Gejala** (lab penulis, Docker Engine): `docker run` atau `docker start` Grafana berhenti dengan `… failed to bind host port 127.0.0.1:3000/tcp: address already in use`; kebalikannya (Grafana sudah menyala), `node penerima-webhook.js` (Modul 4) menjawab `Error: listen EADDRINUSE: address already in use :::3000`.

**Langkah:** **Ctrl + C** di terminal penerima-webhook. Lalu `docker ps`: kalau baris Grafana tidak ada atau tanpa `127.0.0.1:3000->3000/tcp`, jalankan `docker rm -f rumahpintar-grafana` dan `docker run` KC Langkah 2 persis. Jangan `docker start`: di lab penulis, sesudah start yang gagal itu kontainernya menyala **tanpa loket dan lorong** (PORTS kosong, aturan *alert* `Error`), dan `docker restart` tidak menolong. Isinya aman di lemari. Docker Desktop tidak diuji.

</details>

<details>
<summary><b>Lupa sandi admin Grafana, atau telanjur menekan Skip</b></summary>

Sesudah **Skip**, sandi `admin` tetap berlaku. Ganti dari terminal; sandi sementara (huruf dan angka) di tempat `SandiBaruMu`:

```text
docker exec -it rumahpintar-grafana grafana cli admin reset-admin-password SandiBaruMu
```

**Hasilnya (lab uji kode penulis):** log diakhiri `Admin password changed successfully ✔`; sandi lama ditolak, yang baru diterima. Sandi itu ada di riwayat terminal: masuk, lalu ganti di avatar → **Change password**.

</details>

***Data source*, akun `grafana_baca`, dan panel**

<details>
<summary><b>Save & test gagal: <code>lookup rumahpintar-db on 127.0.0.11:53: server misbehaving</code>, atau Host URL masih <code>localhost:5432</code></b></summary>

- `Network error: Failed to connect to the server. Error message: lookup rumahpintar-db on 127.0.0.11:53: server misbehaving` (lab uji kode penulis: database belum menyala). `docker ps` harus menulis `rumahpintar-db` `Up`; kalau tidak, `docker start rumahpintar-db`, dan Grafana pulih sendiri. `docker network inspect rumahpintar` harus memuat keduanya; kalau tidak, ulangi `docker network connect` KC Langkah 1.
- `… Error message: connect: connection refused` (**Host URL** `localhost:5432`) atau `… no such host` (`host.docker.internal:5432`, Docker Engine Linux): ganti `rumahpintar-db:5432` ([Konsep 2](#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong)).
- Lainnya: cocokkan dengan [KC Langkah 5](#langkah-5--data-source-postgresql-lewat-lorong-rumahpintar-db5432-5-menit) (**Username**, sandi, **TLS/SSL Mode** `disable`).

</details>

<details>
<summary><b><code>too many connections for role "grafana_baca"</code>, lalu panel menjadi <code>No data</code></b></summary>

Akun ini boleh 5 sambungan, sedangkan *data source* bawaan sampai 100 (lab uji kode penulis: tiga tab serentak, 4 galat dari 180 kueri; dengan **Max open** `4`, nol). Isi **Max open** `4` ([1.5](#15-folder-rumah-pintar-mini-dan-bahasa-layar-grafana-3-menit)) dan tutup psql `grafana_baca` yang masih terbuka (`\q`). **Save & test** pertama sesudahnya bisa masih galat; klik lagi sampai `Database Connection OK`. Dua Grafana berakun sama tetap bisa melewati batas.

</details>

<details>
<summary><b><code>ERROR:  role "grafana_baca" already exists</code> atau <code>permission denied for table devices</code></b></summary>

**`ERROR:  role "grafana_baca" already exists`** saat `pengguna-grafana.sql` dijalankan ulang: wajar. Baris sesudahnya tetap berjalan (`ALTER ROLE` ×2, `GRANT` ×4), dan sandinya tidak berubah; ganti sandi lewat `\password grafana_baca` ([KC Langkah 4](#langkah-4--akun-database-hanya-baca-grafana_baca-6-menit)).

**`db query error: ERROR: permission denied for table devices (SQLSTATE 42501)`** (lab penulis, `SELECT * FROM devices`): izin `devices` per kolom, dan `kunci_hash` sengaja ditutup. Tulis nama kolomnya ([Konsep 3](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca)). `users`, `sesi`, dan `rules` memang tertutup; `readings` atau `device_health` ditolak = `GRANT` belum berjalan, jalankan berkasnya lagi.

</details>

<details>
<summary><b>Panel RSSI, <i>uptime</i>, atau <i>heap</i> bertuliskan <code>No data</code></b></summary>

Periksa berurutan ([2.5](#25-no-data-dan-jam-yang-bergeser-vitals-tiap-5-menit-utc-di-kueri-wib-di-layar-5-menit)): (1) simulator atau Node 1 **dan** backend menyala, lalu tunggu sampai 5 menit; (2) `Node` berisi perangkat yang mengirim `vitals`, bukan hanya Kebun atau Node 2 (sesudah simpan pertama, `Node` bisa kembali ke nilai pertama: pilih `All` dan hapus *chip* lain (×), **Save** dengan **Update default variable values**); (3) rentang waktunya mencakup saat perangkat menyala. Ikon galat di pojok panel = galat kueri.

</details>

<details>
<summary><b>Grafik suhu aneh: satu garis <code>suhu</code> melompat antarperangkat, atau jatuh ke 0 °C</b></summary>

**Satu garis melompat:** **Format** masih `Table`; ganti ke **Time series**, dan pastikan kuerinya memuat `device_id AS metric` ([KC Langkah 6](#langkah-6--panel-pertama-kueri-suhu-dengan-format-time-series-lalu-simpan-6-menit)). **Jatuh ke 0 °C:** makro `$__timeGroupAlias(ts, $__interval, 0)` mengisi setiap menit tanpa bacaan dengan 0. Di lab penulis, 331 dari 361 titik menjadi 0 dan grafiknya bergerigi. Hapus `, 0`: celahnya dibiarkan kosong, jujur ([Konsep 4](#4-anatomi-panel-sql-makro-waktu-satuan-dan-ambang)).

</details>

<details>
<summary><b>Angka Stat berwarna merah padahal normal</b></summary>

Ambang bawaan panel: hijau, lalu **merah di 80**. *Uptime* dalam detik hampir selalu di atas 80, jadi Stat-nya merah walau sehat. Ganti **Color scheme** menjadi `Single color` ([2.3](#23-panel-uptime-dan-heap-jebakan-stat-merah-di-80-satuan-durasi-dan-byte-13-menit)).

</details>

<details>
<summary><b>Jam di grafik atau di Query inspector bergeser 7 jam</b></summary>

Query inspector **memang** menulis UTC (`BETWEEN '…Z' AND '…Z'`), 7 jam lebih awal dari WIB: itu benar. Yang salah hanya **sumbu grafik** yang berbeda 7 jam dari jam laptopmu: **Edit** → ikon **Options** → **View all settings** → **Time zone** `Jakarta  WIB  UTC+07:00`, lalu **Save** ([2.1](#21-dashboard-baru-folder-zona-wib-dan-variabel-node-10-menit)). Jangan menggeser jam di SQL; makro sudah mengurusnya.

</details>

<details>
<summary><b>Panel galat atau kosong begitu kuerinya memakai <code>$node</code></b></summary>

**Gejala** (lab penulis, `h.device_id = $node` dengan `Node` = `All`):

```text
db query error: ERROR: syntax error at or near "," (SQLSTATE 42601)
```

Daftar berkoma hanya sah di dalam `IN (…)`: tulis `IN ($node)`, tanpa kutip tambahan ([Konsep 5](#5-variabel-satu-dashboard-untuk-semua-perangkat)). Variabelnya harus **Multi-value** dan **Include All value**, dan Query inspector harus menulis `IN ('…')` berisi `device_id`.

</details>

<details>
<summary><b><i>Refresh</i> 1 menit hilang lagi sesudah dashboard dibuka ulang</b></summary>

`1m` hanya menjadi bawaan bila **Update default refresh value** dicentang saat **Save** ([2.4](#24--simpan-dengan-refresh-1-menit-uji-node-lalu-intip-query-inspector-10-menit)). Pilih `1m` lagi, simpan dengan centang itu, lalu buka di tab baru.

</details>

<details>
<summary><b>Impor dashboard: <code>A Grafana dashboard URL or ID is required</code>, <code>A data source is required</code>, atau tombol <code>Import (Overwrite)</code></b></summary>

**`A Grafana dashboard URL or ID is required`:** kamu menekan **Load** pertama; tempel JSON di **Import via dashboard JSON model**, lalu **Load** kedua. **`A data source is required`:** pilih *data source* di `DS_GRAFANA-POSTGRESQL-DATASOURCE`. **`Import (Overwrite)`** (`… has the same UID` atau `A dashboard or a folder with the same name already exists`) **menimpa** dashboard yang ada: klik **Change uid**, ubah **Name**, baru **Import** ([9.3](#93-coba-impor-ke-grafana-yang-sama-change-uid-dulu-opsional-8-menit)).

</details>

***Alert* dan Telegram**

<details>
<summary><b><i>Alert</i> tidak pernah menyala, atau selalu terlambat semenit dari perkiraan</b></summary>

Buka aturan `Node diam`, tab **Instances**. **Node-mu tidak ada:** ia belum terdaftar atau kuncinya dicabut. **`Firing`, Telegram diam:** **Contact point** aturan belum `Telegram Rumah Pintar`, atau *contact point*-nya gagal (*Tombol Test gagal …*). **`Error`:** cocokkan kuerinya dengan [4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit). **Terlambat ±1 menit dari rumus:** **Pending period** masih `1m`; ganti **None** (cek juga *no data* **Normal**, 4.3). Kueri "kosong bila tak ada data" dari internet gagal diam-diam (Konsep 7).

</details>

<details>
<summary><b>🔴 untuk perangkat yang memang tidak dijalankan, atau ✅ palsu sesudah kuncinya dicabut</b></summary>

**Gejala** (lab uji kode penulis): kurang dari semenit sesudah aturan disimpan, `🔴 Latihan teras (f00d00000002) tidak mengirim data, terlambat 12.5 menit dari jadwalnya`; sesudah kuncinya dicabut, `✅ Latihan teras kembali mengirim data.`, dan tab **History** menulis `Normal (Missingseries)`. Setiap perangkat terdaftar diperiksa, dan baris yang hilang dianggap pulih. 🔴 itu benar. Tidak dipakai lagi? Cabut kuncinya ([4.2](#42-cabut-dulu-kunci-perangkat-yang-tidak-dijalankan-5-menit)) dan abaikan ✅ sekali itu; jalur laptop jangan mencabut `f00d00000001`.

</details>

<details>
<summary><b>Semua node 🔴 sekaligus, atau pesan <code>🔴 [no value] ([no value]) …</code> lalu ✅ palsu</b></summary>

**Semua node 🔴** (lab penulis, backend dibekukan 18 menit): `🔴 Latihan ruang tamu (f00d00000001) tidak mengirim data, terlambat 5.5 menit dari jadwalnya`, lalu Kebun, padahal Peta tetap hijau. Yang diam **backend**: tanpanya tak ada bacaan baru. Nyalakan `npm run dev`; ✅ menyusul. Mengawasi backend = Modul 30.

**Tanpa nama node** (lab penulis, `rumahpintar-db` dihentikan ±80 detik): `🔴 [no value] ([no value]) tidak mengirim data, terlambat  menit dari jadwalnya`, lalu 5 menit kemudian `✅  kembali mengirim data.` Grafana gagal membaca database; ✅ itu berarti ia bisa membaca lagi, **bukan** node yang pulih (node yang sedang 🔴 tetap 🔴; mati lebih lama tidak diuji). `docker start rumahpintar-db`.

</details>

<details>
<summary><b>Dua pesan untuk satu kejadian: 📴 dari backend dan 🔴 dari Grafana</b></summary>

Disengaja ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)). Backend mengabari **penghuni** bahwa sambungan putus: `📴 … offline sejak …` 60 detik sesudah status `offline` (Node 2: ±17 menit sesudah paket terakhir), lalu `✅ … online lagi …` seketika. Grafana mengabari **tim teknis** bahwa data berhenti datang: 🔴 5,5–11,5 menit sesudah Node 2 dicabut, ✅ dalam ≤ 5 menit. Jangan matikan salah satunya: perangkat bisa `online` tetapi diam.

</details>

<details>
<summary><b>Pesan Grafana berbahasa Inggris atau berisi <code>**Firing**</code></b></summary>

Itu templat bawaan (riset penulis: `**Firing**`, `Labels: …`, tautan `localhost:3000`). Templat 4.1 belum terpakai: **Enter custom message** tidak dipilih, atau laci `Edit Message` ditutup tanpa **Save**. Buka lagi *contact point* `Telegram Rumah Pintar`, ulangi [4.1](#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit) nomor 5–6, **Save contact point**, lalu **Test**: harus `🔴 Notification test`.

</details>

<details>
<summary><b>Tombol Test gagal: token atau chat_id salah, atau bot belum pernah kamu sapa</b></summary>

Menurut dokumentasi (tidak diuji penulis), token salah dijawab `Unauthorized`, dan chat yang belum pernah menyapa bot `chat not found`. **Langkah:** (1) kirim `/start` ke bot: dijawab `Halo! chat_id kamu: …` = token di `backend/.env` benar, dan angkanya harus sama dengan `TELEGRAM_CHAT_ID` (🚨 Modul 19); (2) di *contact point*, klik **Reset** pada token, tempel lagi tanpa spasi atau petik, juga **Chat ID**; (3) Grafana butuh internet. Jangan tangkap layar formulirnya.

</details>

<details>
<summary><b>Grafana jatuh bangun sesudah YAML aturan ditaruh di folder <i>provisioning</i>: <code>receiver Telegram Rumah Pintar does not exist</code></b></summary>

**Gejala** (lab uji kode penulis, Grafana kedua): kontainer terus dimulai ulang, dan `docker logs rumahpintar-grafana` memuat `… invalid alert rule` / `receiver Telegram Rumah Pintar does not exist`. YAML ekspor (9.2) adalah arsip; *provisioning* menuntut *contact point* bernama sama dan `datasourceUid` yang cocok (Modul 26). **Langkah:** `docker rm -f rumahpintar-grafana`, lalu `docker run` KC Langkah 2 persis: berkas salinanmu ikut hilang bersama kontainer, isi lemari tetap.

</details>

**Kebun dan broker**

<details>
<summary><b>📴 palsu semenit sesudah broker dimulai ulang di 5.1, lalu backend diam saat simulator benar-benar dimatikan</b></summary>

Kekurangan backend **1.1**: simulator tersambung lebih dulu daripada backend, kabar `online`-nya tiba sebagai pesan *retained*, dan 📴 yang menunggu tidak dibatalkan. **Langkah:** **Ctrl + C** di terminal `backend`, lalu `npm run dev` ([5.1](#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit) langkah 4); abaikan 📴 tadi. Kebun tidak terkena (tanpa wasiat), jadi G2 tetap sah. Diperbaiki di [6.3](#63-mqttts-tidak-lagi-mengirim-kabar-offline-palsu-lalu-npm-run-cek-dan-npm-test-10-menit).

</details>

<details>
<summary><b>Kebun tiruan tidak terdengar di backend maupun Grafana</b></summary>

Baca terminal `alat`. `Kebun tiruan belum berjalan: ketik "kebun mulai" dulu.`: ketik itu. `Kebun tiruan butuh perangkat palsu f00d00000001 …`: isi kuncinya di `alat/.env`, jalankan simulator dengan angka `1`. `Kebun bangun …` muncul, tetapi tabel 3.2 tanpa Kebun: broker menulis `Denied PUBLISH from f00d00000001 …` bila blok 2b belum dibuka atau broker hanya di-*reload*; buka, **restart** broker, mulai ulang backend, tunggu ≤ 300 detik. Masih kosong: Kebun belum didaftarkan (Bruno `daftarkan Kebun tiruan`), atau kunci `f00d00000001` telanjur dicabut ([kunci baru, Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#74-papannya-ketemu-pulihkan-dengan-kunci-baru-12-menit)).

</details>

**Peta dan lokasi**

<details>
<summary><b>Peta abu-abu, setinggi 0, atau penanda hilang sesudah <code>npm run build</code></b></summary>

**Tak terlihat:** `MapContainer` tanpa `h-96`. **Ubin berserakan, tombol *zoom* tanpa bentuk:** `import "leaflet/dist/leaflet.css"` hilang. **Kotak abu-abu, lingkaran tetap ada:** ubin tidak terunduh (tanpa internet, atau alamat di `peta.ts` salah). **Penanda hilang sesudah *build*:** kamu memakai `Marker`; pakai `CircleMarker` ([7.2](#72-petats-dan-petaperangkattsx-ubin-atribusi-dan-penanda-berwarna-status-22-menit)).

</details>

<details>
<summary><b><i>Toast</i> tertutup peta</b></summary>

Lapisan Leaflet ber-*z-index* 400–1000, di atas *toast* (`z-50`). Kelas `isolate` di `MapContainer` mengurungnya di kotak peta (7.2).

</details>

<details>
<summary><b><code>Backend belum mengirim titik peta (lat, lng). Halaman Peta butuh backend 1.2 (Modul 25).</code></b></summary>

`GET /devices` tanpa `lat`/`lng`: backend yang menjawab masih 1.1. Selesaikan Praktik 6, mulai ulang terminal `backend`, pastikan `/docs` menulis `1.2.0`, lalu buka **Peta** lagi.

</details>

<details>
<summary><b>Titik di peta tidak ikut berubah, atau <i>toast</i> <code>Daftar perangkat gagal dimuat ulang …</code></b></summary>

Titik tidak ikut kabar *live*; Peta membaca `GET /devices` setiap kali dibuka ([Konsep 9](#9-lokasi-adalah-data-perangkat-api-bukan-tempelan-di-layar)). Pindah menu, lalu kembali ke **Peta**. *Toast* `Daftar perangkat gagal dimuat ulang: titik di peta mungkin belum yang terbaru.` = pembacaan itu gagal (backend atau database mati); peta tetap menggambar titik terakhir.

</details>

<details>
<summary><b><code>PUT /devices/:id/lokasi</code> menjawab <code>400</code>, <code>403</code>, atau <code>404</code></b></summary>

Lab penulis: `body/lat harus angka dengan titik desimal, misalnya -6.1754 (bukan teks "-6,1754")` (`"-6,2"` berpetik); `Body is not valid JSON but content-type is set to 'application/json'` (`-6,2` tanpa petik, lab uji kode); `body/lat lintang paling besar 90` (di luar rentang, atau `lat`/`lng` tertukar); `403` viewer dan `401` gelang habis: `login admin`; `404` `… tidak ada di daftar perangkat`: `device_id` di URL salah.

</details>

**Laporan**

<details>
<summary><b><code>POST /laporan/kirim</code> menjawab <code>400</code>, <code>409</code>, <code>502</code>, atau <code>503</code></b></summary>

Lab uji kode penulis: `400` `querystring/hari Pilihan tidak valid: …` (`?hari=` hanya `kemarin` atau `ini`); `409` `laporan tidak dikirim: Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)` (isi token dan chat_id di `backend/.env`); `502` = Telegram menolak atau tak terjangkau, baca log backend; `503` (tes penulis) `database sedang tidak bisa dihubungi, …` (`rumahpintar-db` mati).

</details>

<details>
<summary><b>Backend tidak mau menyala: <code>Setelan LAPORAN_JADWAL di .env: harus 5 bidang …</code></b></summary>

Lab uji kode penulis (`0 7 * * * *`): `Setelan LAPORAN_JADWAL di .env: harus 5 bidang: menit jam tanggal bulan hari, misalnya 0 7 * * *`. Cron 6 bidang diawali detik: `0 7 * * * *` = menit ke-7 setiap jam. Tulis 5 bidang. `… ekspresi cron tidak sah …` = angka di luar rentang (menit `61`).

</details>

<details>
<summary><b>Laporan pagi tidak tiba, atau jumlah perangkatnya kurang</b></summary>

Lihat log backend di jam jadwal. Kosong: backend atau laptop mati saat itu, dan laporannya tidak dikirim belakangan. `⏰ Laporan harian pada … terlewat (laptop tidur atau backend sibuk?). …` (juga ke Telegram): terlewat > 15 menit; kirim lewat Bruno `kirim laporan sekarang` tanpa `?hari=ini`. `laporan harian dilewati: Telegram mati …`: isi token. `LAPORAN_JADWAL` masih jam gladi 9.1? Kembalikan `0 7 * * *`. **Kurang perangkat** (lab: `2 perangkat`): yang kuncinya dicabut tidak masuk.

</details>

<details>
<summary><b><code>ENOENT</code> atau <code>File paths cannot contain carriage-return (\r) or newline (\n) characters!</code> saat mengirim berkas</b></summary>

`InputFile` menerima teks, jadi grammY mencari berkas di disk bernama isi CSV ([🔁 Langkah 5](#langkah-5--teks-menjadi-berkas-bufferfrom-bom-tiga-byte-dan-enoent)). Tulis `new InputFile(Buffer.from(isi, "utf8"), nama)` ([8.3](#83-kirimberkas-di-telegramts-inputfile-dari-byte-bukan-dari-teks-8-menit)).

</details>

<details>
<summary><b>CSV terbuka sebagai satu kolom, atau angka berubah menjadi tanggal</b></summary>

CSV memakai resep Modul 23 (titik koma, koma desimal, BOM) untuk spreadsheet berwilayah Indonesia. Di wilayah lain, kolom bisa menumpuk atau angka berubah bentuk: buka lewat impor CSV dengan pemisah titik koma ([🚨 Modul 23](../modul-23-dashboard-realtime/README.md#-kalau-tidak-jalan) *CSV terbuka sebagai satu kolom di Excel …*). Penulis tidak menguji Excel maupun LibreOffice.

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: tiga pilihan opsional Silabus, jalan yang sengaja tidak diambil, dan cara penulis menguji. Tidak ada yang wajib dipasang; potongan kodenya **cukup dibaca**.

<details>
<summary><b>Laporan PDF dengan pdfkit 0.20.2, dan sel CSV yang bisa terbaca sebagai rumus</b></summary>

Pustakanya **pdfkit 0.20.2** (MIT), dengan tipe TypeScript dari **@types/pdfkit 0.17.7**. Riset penulis memastikan: `doc.table({ data })` sudah ada dan sudah bertipe; font bawaan Helvetica menulis `°` dan `—` dengan benar, tetapi `✓` dan emoji menjadi huruf acak, jadi butuh font TTF yang memuat huruf itu; paketnya ±11 MB, ditambah `fontkit` ±5,7 MB. Pustaka ini menulis PDF sebagai aliran byte, jadi potongannya dikumpulkan menjadi satu `Buffer`. Sketsa (belum dijalankan penulis di backend):

```ts
import PDFDocument from "pdfkit";
function buatLaporanPdf(baris: BarisLaporan[]): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4" });
  const potongan: Buffer[] = [];
  const jadi = new Promise<Buffer>((ok) => doc.on("end", () => ok(Buffer.concat(potongan))));
  doc.on("data", (b: Buffer) => potongan.push(b));
  doc.table({ data: [["Perangkat", "Bacaan"], ...baris.map((b) => [b.nama, String(b.jumlah_bacaan)])] });
  doc.end();
  return jadi;
}
```

`kirimBerkas()` ([8.3](#83-kirimberkas-di-telegramts-inputfile-dari-byte-bukan-dari-teks-8-menit)) menerima teks, jadi PDF butuh kembarannya yang langsung memakai `new InputFile(buffer, "laporan-….pdf")`. Gambar panel Grafana di PDF tidak ditempuh: Grafana 13 menghapus *plugin* perender gambar, dan layanan penggantinya disarankan memakai sedikitnya 16 GiB RAM.

Satu catatan untuk CSV-nya: resep Modul 23 tanpa pengaman rumus, jadi nama perangkat yang diawali `=`, `+`, `-`, atau `@` bisa dibaca spreadsheet sebagai rumus; risiko ini diterima karena nama hanya diisi admin.

</details>

<details>
<summary><b>Panel Grafana di dalam dashboard React (<i>embed</i>): kenapa belum sekarang</b></summary>

⚠️ **Baca dulu.** Menanam panel Grafana di halaman lain hampir selalu berarti mematikan dua pengaman: larangan dibingkai (`allow_embedding = false`, penyebab `X-Frame-Options: deny` di [1.3](#13-pintu-grafana-401-tanpa-login-hanya-dari-laptop-ini-tanpa-berbagi-ke-luar-5-menit)) dan larangan masuk tanpa akun (*anonymous access*). Dengan keduanya terbuka, siapa pun yang menjangkau loket Grafana melihat **semua** dashboard tanpa *login*, dan situs lain bisa membingkai Grafana-mu untuk menipu klik (*clickjacking*). Jangan mencobanya di Grafana utamamu.

Tanpa akses anonim, penonton harus sudah masuk Grafana di browser yang sama, dengan akun Grafana yang terpisah dari akun Modul 20, dan *cookie* Grafana harus ikut ke dalam bingkai. Bila beda situs (port tidak dihitung), bawaan `cookie_samesite = lax` menahan *cookie* itu; penggantinya, `SameSite=None`, hanya diterima browser bila `Secure`, artinya HTTPS (Modul 27). Belum diuji penulis. Pembagian kerjanya pun sudah jelas ([Konsep 1](#1-dua-dashboard-dua-penonton-tiga-alat-yang-sudah-kamu-pegang)): penghuni memakai dashboard React, tim teknis membuka Grafana di tabnya sendiri.

</details>

<details>
<summary><b>Log terpusat: Loki 3.7.9, Promtail yang pensiun, dan Alloy</b></summary>

Log kita masih tersebar: terminal backend, layar broker, `docker logs` Grafana. **Grafana Loki** mengumpulkannya supaya bisa dicari dari Grafana, misalnya semua `ERROR` backend semalam di samping grafik RSSI. Loki hanya mengindeks **label** (misalnya nama aplikasi), bukan isi setiap baris, jadi hemat tempat.

Per 26 Okt 2026: Loki **3.7.9**, image arm64 ±43 MB; di riset penulis siap ±20–40 detik sesudah menyala, ±36 MiB RAM saat diam. Pengirim lognya dulu **Promtail**, yang pensiun (*end of life*) sejak 2 Mar 2026, jadi tutorial yang masih memasangnya sudah usang; penggantinya **Grafana Alloy** (1.21.2). Memakainya berarti dua layanan baru untuk masalah yang belum terasa; Silabus menaruh Loki lagi sebagai pilihan di [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data).

</details>

<details>
<summary><b>Dashboard sebagai kode: <i>provisioning</i> berkas Grafana</b></summary>

Di modul ini Grafana dirakit lewat layar, lalu diekspor ([9.2](#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit)). Arah sebaliknya disebut *provisioning*: setiap menyala, Grafana membaca berkas YAML di `/etc/grafana/provisioning/` (dashboard-nya JSON Classic) dan membuat isinya sendiri. Artinya lain dengan *provisioning* perangkat (Modul 21 dan 28). Contoh *data source* dari riset penulis, nama disesuaikan (cukup dibaca):

```yaml
apiVersion: 1
datasources:
  - name: RumahPintar
    uid: rpm
    type: grafana-postgresql-datasource
    url: rumahpintar-db:5432
    user: grafana_baca
    editable: false
    jsonData: { database: rumahpintar, sslmode: disable, timescaledb: true }
    secureJsonData:
      password: ${GRAFANA_BACA_SANDI}
```

Jebakan yang terbukti di riset dan lab penulis:

- `${…}` diganti isi variabel lingkungan kontainer, jadi sandi tidak tertulis di berkas. Tulis `${…}` bergaya blok seperti `password` di atas: `{ password: ${…} }` di dalam kurung kurawal merusak YAML-nya, dan YAML *data source* yang rusak membuat Grafana **gagal menyala**.
- Di setelan *contact point* (misalnya `message` Telegram), `$` juga diganti, jadi `$labels` ditulis `$$labels`.
- YAML aturan dari 9.2 butuh *contact point* bernama sama dan `datasourceUid` yang cocok. Di Grafana bersih lab uji kode, ia jatuh bangun dengan `receiver Telegram Rumah Pintar does not exist` sampai kontainernya dibuat ulang.

Folder *provisioning* biasanya dipasang lewat *bind mount*, yang sengaja dihindari modul ini karena berbeda di tiap OS. Modul 26 merapikannya dengan Docker Compose.

</details>

<details>
<summary><b>Geomap Grafana lawan react-leaflet</b></summary>

Panel peta bawaan Grafana, **Geomap**, cukup diberi kueri `SELECT nama, lat, lng, status FROM devices WHERE lat IS NOT NULL AND lng IS NOT NULL AND terdaftar IS NOT NULL` (kolom `lat`/`lng` boleh dibaca `grafana_baca`). Di riset penulis (dashboard dibuat lewat API Grafana 13.2.4, bukan layar), panel ini dengan lapisan dasar `osm-standard` (OpenStreetMap) termuat tanpa galat.

Lapisan dasar bawaannya peta **vektor CARTO**, dan CARTO kini meminta kunci API: ubin *raster*-nya tanpa kunci hanya bertulisan "API KEY REQUIRED", sedangkan ubin vektornya masih termuat tanpa kunci saat dicek 26 Okt 2026. Kalau mencoba Geomap, pilih lapisan OpenStreetMap supaya aturannya sama dengan [Konsep 8](#8-peta-koordinat-ubin-dan-atribusi).

Silabus memilih react-leaflet karena peta ini untuk penghuni: akun admin/viewer Modul 20, warna yang ikut status *live*, dan *popup* bertaut ke layar detail. Geomap hanya tahu status dari kuerinya setiap *refresh* dan hanya untuk akun Grafana, jadi cocoknya untuk tim teknis. Penulis belum mencobanya di Grafana modul ini.

</details>

<details>
<summary><b>Grafana tanpa Docker: APT, Homebrew, dan zip Windows</b></summary>

Tiga jalan resmi, diringkas dari dokumentasi dan isi paket 13.2.4 (belum diuji penulis; APT dan brew memasang versi terbaru):

- **Debian, Ubuntu, Raspberry Pi OS 64-bit:** repositori `https://apt.grafana.com stable main` dengan kunci `gpg-full.key` (tutorial Raspberry Pi resmi masih memakai kunci lama), lalu `sudo apt-get install grafana` dan `sudo systemctl enable --now grafana-server`; ±348 MB unduhan arm64, ±1,2 GiB terpasang. Versinya ikut naik saat `apt upgrade`, jadi menunya bisa berbeda dari modul ini.
- **macOS:** `brew install grafana`, lalu `brew services start grafana`.
- **Windows:** penginstal dari grafana.com/grafana/download, atau zip. Dokumentasi Windows masih menyebut `grafana-server.exe`, padahal zip 13.2.4 hanya berisi `bin\grafana.exe`: jalankan `grafana.exe server`. Loket 3000 mungkin butuh izin tambahan.

Grafana 13 menghapus `grafana-server`/`grafana-cli`; pakai `grafana server`/`grafana cli` (layanan systemd-nya tetap bernama `grafana-server`). Jebakan terbesarnya: `http_addr` bawaan **kosong**, artinya terbuka untuk seluruh WiFi rumah, tidak seperti `-p 127.0.0.1:3000:3000` kita; isi `http_addr = 127.0.0.1` di bagian `[server]` berkas konfigurasinya. Grafana yang terpasang langsung menjangkau database lewat `localhost:5432` tanpa lorong, tetapi saat pindah ke kontainer di Modul 26 datanya harus ikut dipindah, karena itu modul ini memakai Docker sejak awal.

</details>

<details>
<summary><b>Cara penulis menguji Telegram tanpa token: tiruan untuk backend dan untuk Grafana</b></summary>

Seperti di [🔬 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#-bedah-teknis-opsional), penulis tidak memakai bot atau token sungguhan. Kedua pengirim kabar diarahkan ke **server Bot API tiruan** di lab:

- **Backend** lewat `TELEGRAM_API_ROOT` (sejak Modul 19; di `.env.example` sengaja berkomentar). Tiruan modul ini juga menerima `sendDocument`, jadi nama, ukuran, dan BOM berkas laporan bisa diperiksa.
- **Grafana** tidak punya setelan alamat: `https://api.telegram.org/bot…` tertulis mati di kodenya. Maka tiruan dipasang di lorong lab dengan nama samaran (*network alias*) `api.telegram.org`, yang hanya berlaku di lorong itu. Sertifikat HTTPS-nya diterbitkan CA (penerbit sertifikat) buatan lab, dan Grafana lab diberi dua opsi supaya memercayainya: `-e SSL_CERT_FILE=/etc/ssl/lab/bundel-grafana.pem` dan `-v …/bundel-grafana.pem:/etc/ssl/lab/bundel-grafana.pem:ro` (bundel CA image ditambah CA lab).

Dua opsi itu **tidak ada** di perintahmu: Grafana-mu berbicara dengan Telegram sungguhan. Token dan chat_id di lab palsu. Yang terbukti: isi dan jam setiap kiriman (teks, berkas, `User-Agent: Grafana`, tanpa `parse_mode` saat **Parse Mode** `None`). Yang **tidak**: tampilan pesan dan emoji di aplikasi, jawaban `Unauthorized` atau `chat not found` dari server asli, chat grup, dan G1–G3 dengan bot-mu. Rinciannya di [📚 Sumber](#-sumber--atribusi-gambar).

</details>

<details>
<summary><b>Leaflet tanpa pembungkus, dan <code>lazy()</code> untuk memecah bundel</b></summary>

**Leaflet polos.** Kalau lisensi Hippocratic react-leaflet ([Konsep 8](#8-peta-koordinat-ubin-dan-atribusi)) tidak cocok untukmu, Leaflet 1.9.4 (BSD-2-Clause) bisa dipakai langsung dengan pola "langganan dan berhenti" Modul 23. Sketsa (belum dijalankan penulis; impor `useRef`, `useEffect`, dan `PETA` tidak ditulis):

```tsx
import L from "leaflet";
import "leaflet/dist/leaflet.css";
function PetaPolos({ titik }: { titik: { device_id: string; lat: number; lng: number }[] }) {
  const kotak = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const peta = L.map(kotak.current!).setView([-6.1754, 106.8272], PETA.zoomDekat);
    L.tileLayer(PETA.ubin, { attribution: PETA.atribusi, maxZoom: PETA.zoomMaks }).addTo(peta);
    for (const p of titik) {
      L.circleMarker([p.lat, p.lng], { radius: 10, fillColor: PETA.warnaOnline, fillOpacity: 1 })
        .bindPopup(p.device_id).addTo(peta);
    }
    return () => { peta.remove(); }; // berhenti; StrictMode menjalankan efek dua kali
  }, [titik]);
  return <div ref={kotak} className="isolate h-96" />;
}
```

Yang belum ada di sketsa ini adalah jasa react-leaflet: warna yang ikut status *live* (simpan setiap lingkaran, lalu `setStyle` sendiri), *popup* berisi komponen React (teks `bindPopup` dibaca sebagai HTML, jadi `nama` harus diamankan sendiri), dan **Buka detail →** tanpa memuat ulang halaman.

**`lazy()`.** Peta menambah bundel ±157 kB (±46 kB *gzip*, [7.5](#75-dashboard-110-lint-build-cek-skema-dan-preview-10-menit)). Seperti lipatan `React.lazy` di [🔬 Modul 24](../modul-24-kendali-aturan-peran/README.md#-bedah-teknis-opsional), Peta bisa menjadi potongan sendiri yang baru diunduh saat `/peta` dibuka (sketsa, belum diukur penulis):

```tsx
// App.tsx (Peta.tsx sudah memakai export default):
const HalamanPeta = lazy(() => import("./halaman/Peta"));
// TataLetak.tsx, di tempat <Outlet />:
<Suspense fallback={<p>Memuat layar…</p>}><Outlet /></Suspense>
```

Harganya juga sama: Peta yang pertama kali dibuka menunggu unduhan, dan ada satu konsep lagi. Jadi, dashboard 1.1.0 tetap satu berkas dengan satu peringatan 500 kB.

</details>

<details>
<summary><b>Tiga setelan tambahan untuk yang teliti: pemeriksaan versi, <code>REVOKE TEMPORARY</code>, dan <i>alert</i> format Time series</b></summary>

**1. Pemeriksaan versi.** Tiga setelan `false` di [KC Langkah 2](#langkah-2--nyalakan-grafana-dengan-satu-docker-run-3-menit) tidak mematikan pemeriksaan versi baru Grafana dan plugin ke grafana.com. Untuk mematikannya, `docker rm -f rumahpintar-grafana`, lalu jalankan perintah KC Langkah 2 dengan tambahan ini sebelum `-v` (lemari sama, isinya tetap):

```text
-e GF_ANALYTICS_CHECK_FOR_UPDATES=false -e GF_ANALYTICS_CHECK_FOR_PLUGIN_UPDATES=false
```

Di kontainer uji penulis, log menulis `Config overridden from Environment variable` untuk keduanya dan setelannya menjadi `false`; efeknya pada lalu lintas jaringan tidak diukur. Umpan berita dan Gravatar tetap menyala.

**2. `REVOKE TEMPORARY`.** Pemeriksa kode penulis mendapati `grafana_baca` yang mematikan lapis hanya-baca bisa membuat **tabel sementara** (`CREATE TEMP TABLE`), karena hak `TEMPORARY` bawaan milik semua akun (`PUBLIC`). Tabel itu hanya hidup selama sambungannya dan tidak menyentuh data rumah. Untuk menutupnya juga (belum diuji penulis; backend tidak terpengaruh karena memakai `postgres`):

```text
docker exec rumahpintar-db psql -U postgres -d rumahpintar -c "REVOKE TEMPORARY ON DATABASE rumahpintar FROM PUBLIC;"
```

Untuk mengembalikannya, ganti isi tanda petik dengan `GRANT TEMPORARY ON DATABASE rumahpintar TO PUBLIC;`. Batas 10 detik juga bawaan akun, bukan kunci: seperti lapis hanya-baca di [Konsep 3](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca), akun itu sendiri bisa mengubahnya di sesinya (`SET statement_timeout = 0`). Jadi, sandinya tetap rahasia.

**3. Cadangan *alert* format Time series (belum terbukti).** Dokumentasi *alert* PostgreSQL Grafana hanya mendukung kueri *time series*, padahal aturan `Node diam` memakai `Table` dan berjalan di 13.2.4. Kalau rilis kelak menolak `Table`, kemungkinan jalan keluarnya: tambahkan `now() AS "time",` di awal `SELECT` kueri yang sama, lalu pilih **Format** `Time series`; setiap node seharusnya tetap menjadi satu deret berlabel `device_id` dan `node`. Periksa dulu dengan **Preview** sebelum **Save**.

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** **Chrome** atau **Edge** dengan Grafana (Tingkat 1) atau dashboard `http://localhost:5173` (Tingkat 2); **VS Code** dengan terminal `frontend` (Tingkat 2) atau `backend` (Tingkat 3); aplikasi **Telegram**. Docker, jalur data, dan backend 1.2 menyala.

Kerjakan **sesudah** [➕ F](#f--gabungkan-fiturgrafana-peta-laporan-ke-main-lewat-pull-request-dashboard-teknis--peta--laporan-harian-checkpoint-fase-4), masing-masing di cabang baru dari `main` (`git switch main`, `git pull`, `git switch -c fitur/<nama-tantangan>`). Kuncinya sudah dicoba penulis di lab (server Telegram tiruan).

### Tingkat 1 — *Alert* kedua: sinyal WiFi lemah (ubah sedikit, 20 menit)

Buat aturan `Sinyal WiFi lemah` seperti [4.3](#43--aturan-node-diam-kueri-ambang-5-menit-grup-kesehatan-node-dan-dua-bawaan-yang-diganti-20-menit), di grup `kesehatan-node` yang sudah ada. Bedanya: kuerinya rata-rata `rssi` 15 menit terakhir per node dari `device_health` (kolom `device_id` dan `node` tetap ada); **Alert condition** **IS BELOW** `-75`, sebuah *konvensi umum*, bukan standar ([Konsep 6](#6-membaca-kesehatan-perangkat-rssi-uptime-heap-dan-paket-per-jam)); **Summary** menyebut node dan rata-rata dBm-nya. Untuk mencoba, **Edit** aturannya, ganti `-75` menjadi `-50`, **Save**, tunggu ±1,5 menit, lalu kembalikan ke `-75` (RSSI simulator: −40 sampai −79 dBm).

**Hasilnya (lab uji kode, seperti yang diterima server Telegram tiruan):** **Save** `-50` pukul 02.35.42 WIB, lalu 02.37.05:

```text
🔴 Latihan ruang tamu (f00d00000001): sinyal WiFi lemah, rata-rata -60 dBm dalam 15 menit terakhir
```

Sesudah `-75` lagi (02.38.10), pukul 02.42.05 datang `✅ Latihan ruang tamu kembali mengirim data.` Baris ✅ templat 4.1 itu ditulis untuk Node diam; di sini artinya "sinyal kembali di atas batas".

**Lulus kalau:** pada `-75` node bersinyal baik `Normal` (Node 2 tanpa vitals tidak ikut), dan pada `-50` datang 🔴 dengan nama node dan angka dBm.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Kueri dan isian formulirnya ada di [`tingkat-1/`](kode/tantangan/kunci/tingkat-1/). Grafana 13.2.4 hanya mengekspor grup utuh ([9.2](#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit)), jadi `sinyal-lemah.yaml` di sana memuat Node diam dan Sinyal WiFi lemah; `node-diam.yaml`-mu juga begitu bila grupnya diekspor ulang.

</details>

### Tingkat 2 — Pindahkan titik perangkat langsung di Peta (isi bagian rumpang, 45 menit)

Admin memindah titik tanpa Bruno: **Pindahkan titik** di *popup* penanda → klik letak baru → periksa angkanya → simpan lewat `PUT /devices/:id/lokasi`. Tambahkan `ubahLokasi(deviceId, lat, lng)` di `api.ts`; buat `components/PindahTitik.tsx`, formulir react-hook-form + Zod ([Modul 24](../modul-24-kendali-aturan-peran/README.md#7-formulir-yang-memeriksa-dirinya-react-hook-form-bukan-usestate-per-kolom)) di dalam `<Popup>`, dipasang **di dalam** `<MapContainer>`, dengan rentang dan kalimat galat `Lokasi` dari [6.2](#62-skema-lokasi-dan-rute-admin-put-devicesidlokasi-15-menit); lalu tombolnya di `PetaPerangkat.tsx` ([7.2](#72-petats-dan-petaperangkattsx-ubin-atribusi-dan-penanda-berwarna-status-22-menit)) hanya untuk admin (`useAdmin()`). Baris inti `PindahTitik.tsx`, isi tiap `____`:

```tsx
// FormTitik:
resolver: ____(Titik),
<input type="number" step="any" inputMode="decimal" {...register(kolom, { ____: true })} className={KOTAK} />
// simpan(isi): PUT, lalu daftar baru
await ____(p.device_id, isi.lat, isi.lng);
useToko.getState().setPerangkat(await ____());
// PindahTitik: klik di peta = letak baru
useMapEvents({ ____: (e) => setKlik(e.latlng) });
```

**Lulus kalau:** klik peta membuka kotak **Pindahkan … ke sini?** berisi lintang dan bujurnya; lintang `91` → `lintang paling besar 90` tanpa `PUT` (tab **Network**); **Simpan titik** memindah penanda dengan *toast* `Titik … dipindah.`; viewer tanpa tombol; `npm run lint` dan `npm run build` lolos.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Isiannya: `zodResolver`, `valueAsNumber` (kolom angka menjadi angka, bukan teks), `ubahLokasi`, `ambilPerangkat`, `click`. Berkas utuhnya (116 baris baru) ada di [`tingkat-2/`](kode/tantangan/kunci/tingkat-2/).

</details>

### Tingkat 3 — Laporan mingguan setiap Senin pukul 07.00 WIB (buat dari nol, 60–90 menit)

Setiap Senin 07.00 WIB, backend mengirim laporan **minggu lalu** (Senin 00.00 sampai Senin 00.00 WIB) dengan kueri, CSV, dan `kirimBerkas()` yang sama dengan [8.2](#82-serviceslaporants-rentang-kemarin-wib-satu-kueri-dan-jadwal-18-menit)–[8.4](#84-laporan_jadwal-rute-post-laporankirim-dan-serverts-12-menit), mirip [🧩 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#tingkat-3--laporan-harian-pukul-2000-wib-buat-dari-nol):

- `config/env.ts`: `LAPORAN_MINGGUAN_JADWAL`, bawaan `0 7 * * 1` (bidang kelima = hari, 1 = Senin).
- `laporan.ts`: kuerinya menjadi `ambilBarisLaporan(dari, sampai)` yang diekspor.
- `services/laporan-mingguan.ts` baru: hari dihitung dari tanggal **WIB**, nama `laporan-mingguan-YYYY-MM-DD.csv` (Senin awal), node-cron `timezone: "Asia/Jakarta"`, rentang dari `konteks.date`; dipanggil `server.ts`.

**Lulus kalau:** `npm run cek` dan `npm test` lulus, lalu pada gladi seperti 9.1 (jadwal sementara beberapa menit lagi, lalu kembali `0 7 * * 1`) berkas `laporan-mingguan-….csv` tiba di Telegram tanpa disentuh.

<details>
<summary><b>Kunci Tingkat 3</b></summary>

Di [`tingkat-3/`](kode/tantangan/kunci/tingkat-3/): `laporan-mingguan.ts` + tesnya, `laporan.ts`, `config/env.ts`, `server.ts`, `.env.example`; `npm test` 15 berkas / 101 tes. **Hasilnya (lab uji kode, jadwal `45 2 * * *`, jam diubah ke WIB):**

```text
[02:45:00] INFO: laporan mingguan berjalan sesuai jadwal
[02:45:00] INFO: Telegram terkirim: berkas laporan-mingguan-2026-10-19.csv (365 byte), 📊 Laporan mingguan Rumah Pintar Mini 19 Okt 2026 - 25 Okt 2026: 3 perangkat
```

</details>

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini **diawasi dan melapor sendiri**: backend 1.2.0, dashboard 1.1.0, folder `grafana/` baru, Kebun tiruan di simulator, dan blok `2b)` di `edge/acl-broker`; firmware, kontrak data 1.4, dan migrasi database tetap. Kode dan ekspor Grafana sudah di-*commit* di `fitur/grafana-peta-laporan` (belum di GitHub): A mencocokkannya, B–E merapikan dokumen, F menggabungkannya ke `main`, dan G menyimpan catatanmu. Kira-kira 30 menit.

![Diagram Rumah Pintar Mini setelah Modul 25: Fase 4 tuntas; garis putus-putus = menyusul. Atas: Node 2 Kebun v1.0.0, baterai 18650 (G2: dicabut dari dudukannya), ESP-NOW ke Node 1 Rumah v1.6.0 (firmware tidak berubah, menerbitkan status Node 2, offline sesudah 960 s; vitals RSSI, uptime, heap); MQTT + kunci ke gateway Pi 192.168.1.37: Mosquitto berkunci (acl-broker + blok jalur laptop Modul 25, berkomentar) dan Node-RED tidak berubah; HP (Node-RED, Telegram, mode HP); Telegram (backend 📴/✅, /status, 📊 CSV; Grafana 🔴/✅ alert node diam). Kiri: klien broker (MQTTX, pemeriksa kontrak, simulator + Kebun tiruan f00d000000b2: kebun mulai, cabut, pasang); HP di WiFi rumah, mode HP sementara (http://192.168.1.10:5173, menu Peta, video demo Checkpoint, Grafana dari HP opsional lewat -p 3000:3000 lalu dikembalikan). Jujur, setelah Modul 25 masih: Grafana, alert, laporan hanya selama laptop menyala (Modul 26–27); backend mati = semua node tampak diam (Modul 30); YAML alert = arsip (Modul 26); peta butuh internet; Telegram diuji penulis dengan server tiruan. Laptop: backend v1.2.0 berubah (lat, lng di GET /devices + rute lokasi; laporan harian CSV: laporan.ts, csv.ts, LAPORAN_JADWAL, kirimBerkas(); mqtt.ts: 📴 palsu sesudah broker dimulai ulang beres; tanpa migrasi, tanpa paket baru, kontrak 1.4), rute baru ungu GET /devices + lat, lng, PUT /devices/:id/lokasi, POST /laporan/kirim, node-cron: aturan (lama) + laporan 07.00 WIB; HTTPS ke Telegram. Docker, lorong rumahpintar: rumahpintar-grafana (13.2.4, baru, 127.0.0.1:3000, dashboard Kesehatan Sistem 5 panel + $node, alert Node diam ke Telegram, lemari rumahpintar-grafana-data) membaca sebagai grafana_baca dari rumahpintar-db (tanpa migrasi, + akun hanya-baca). Bruno /docs 1.2.0 + tiga permintaan baru. Frontend v1.1 (leaflet 1.9.4, react-leaflet 5.0.0, @types/leaflet 1.9.22; lint bersih, build satu peringatan 500 kB, cek-skema dua SAMA, Lighthouse Accessibility /peta 100); browser juga membuka Grafana http://localhost:3000; layar mini Detail + kendali, Aturan, Peta (baru). Bawah kiri, GitHub: cabang fitur/grafana-peta-laporan, pull request Dashboard teknis + peta + laporan harian (Checkpoint Fase 4) dengan butir (Modul 25); berkas backend (1.2.0, perangkat.ts, laporan.ts + csv.ts, routes/laporan.ts, telegram.ts, env.ts, mqtt.ts, + 7 berkas tes jadi 14 berkas 96 tes, bruno, .env.example), frontend (1.1.0, peta.ts, types.ts, PetaPerangkat.tsx + halaman/Peta.tsx, App.tsx + TataLetak.tsx, index.css, README v1.1), grafana/ (README, pengguna-grafana.sql, dashboards/kesehatan-sistem.json, alerting/node-diam.yaml arsip), alat, edge/acl-broker, templat PR, README proyek. Tidak pernah ikut Git: backend/.env, sandi Grafana dan grafana_baca, isi contact point, koordinat rumah asli, node_modules/, dist/, video yang memperlihatkan sandi atau token. Kanan: 🎉 Fase 4 tuntas, Checkpoint: kuis, dipakai orang lain (Modul 24), video demo HP, tautan JSON Grafana di GitHub. Menyusul: Modul 26 Docker Compose (Grafana pindah dengan lemari yang sama, YAML provisioning); Modul 27 internet, HTTPS, PWA, tautan Grafana hidup; Modul 28 armada, OTA, provisioning, banyak perangkat.](aset/diagram-proyek-modul-25.png)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini`; G: jendela kedua, folder `belajar-iot`) dan **browser** yang sudah masuk ke GitHub. Hentikan backend dan Vite (**Ctrl + C**) sebelum F.
>
> ⭐ **Wajib** — langkah F: *pull request* ke `main`.

### A. Cocokkan proyekmu: `backend/` 1.2.0, `frontend/` 1.1.0, `grafana/`, `alat/`, dan `edge/`

Sesudah [Praktik 10](#praktik-10--checkpoint-fase-4-kumpulkan-buktinya-45-menit), berkas di `backend/`, `frontend/`, `grafana/`, dan `alat/` cabangmu harus sama dengan folder senamanya di [`kode/`](kode/), kecuali README (C–D), beda ekspor (9.2), dan isi Bruno lokasi (6.4); `edge/acl-broker` cukup punya blok `2b)`. **Jalur perangkat**, samakan dulu: salin `alat/simulator-perangkat.js` dan `backend/bruno/daftarkan Kebun tiruan.yml` (baru) dari `kode/` lewat **Copy raw file**, lalu blok `2b)` dari [`kode/edge/acl-broker`](kode/edge/acl-broker) ke bawah butir 2 `edge/acl-broker`-mu, tetap berkomentar (butir 2 milikmu jangan diubah). Di terminal kosong (folder `rumah-pintar-mini`):

```text
git add alat edge backend/bruno
git commit -m "Berkas jalur laptop Modul 25"
```

Di terminal itu, `cd backend`: `git status` harus bersih di `fitur/grafana-peta-laporan`. Jalankan `npm ls --depth=0`, lalu `cd ../frontend` dan ulangi. **Hasilnya (lab penulis, baris pertama; jalurmu berbeda):**

```text
rumah-pintar-mini-backend@1.2.0 /home/kamu/rumah-pintar-mini/backend
rumah-pintar-mini-frontend@1.1.0 /home/kamu/rumah-pintar-mini/frontend
```

Menurut kode rujukan, *pull request*-nya memuat **43 berkas** (24 backend, 10 frontend, 4 grafana, 2 alat, 2 edge, templat).

### B. Baca ulang `grafana/README.md`: cara menjalankan, akun hanya-baca, ekspor, dan batasan

Berkas ini kamu salin di [1.1](#11-cabang-fiturgrafana-peta-laporan-dan-folder-grafana-di-proyekmu-5-menit). Isinya: **Menjalankan** (lorong, `docker run`, **Submit** bukan **Skip**, `grafana_baca`, **Max open** `4`, impor dengan **Change uid**, YAML = arsip), **Keamanan**, dan **Batasan** (hanya selama laptop menyala; backend mati = semua node tampak diam; pesan tanpa nama node = masalah database atau Grafana). Sama dengan [kuncinya](kode/grafana/README.md)? Tidak ada yang di-*commit*.

### C. Perbarui `backend/README.md`, Bruno, dan `/docs` ke 1.2.0

Buka [`kode/backend/README.md`](kode/backend/README.md) di GitHub, klik **Copy raw file**, lalu tempel sebagai seluruh isi `backend/README.md` dan simpan. Yang baru: `LAPORAN_JADWAL` di **Menjalankan**, dua rute di tabel API, bagian **Peta dan laporan harian (Modul 25)**, **Catatan versi 1.2** (dengan perbaikan 📴 palsu), dan **Batasan v1.2**: laporan hanya selama backend menyala, yang terlewat tidak dikirim belakangan, satu chat, laporan hari pertama kosong (`?hari=ini`), broker yang dimulai ulang = satu kali putus, dan `devices.terakhir_dilihat` bukan "data terakhir". Sisanya sudah beres di [6.4](#64--versi-120-docs-dan-bruno-atur-lokasi-perangkat-200-403-400-10-menit) dan [8.4](#84-laporan_jadwal-rute-post-laporankirim-dan-serverts-12-menit): tiga permintaan Bruno baru, `LAPORAN_JADWAL=0 7 * * *` di `.env.example`, dan `/docs` `1.2.0`.

### D. Perbarui `frontend/README.md` ke 1.1, lalu README `alat/`, `edge/`, dan README proyek

Dengan cara yang sama, ganti seluruh isi `frontend/README.md`, `alat/README.md`, dan `edge/README.md` dengan README rujukan [`frontend/`](kode/frontend/README.md), [`alat/`](kode/alat/README.md), dan [`edge/`](kode/edge/README.md). README frontend v1.1 memuat 🎉 Checkpoint Fase 4, rute `/peta`, bagian **Peta perangkat (Modul 25)** dengan **lisensi** (Leaflet BSD-2-Clause, react-leaflet Hippocratic License 2.1 yang bukan lisensi OSI), empat butir baru **Batasan v1.1** (peta butuh internet, titik tidak *live*, penanda tidak bisa di-Tab, ubin terang di mode gelap), dan menegaskan Grafana **bukan** bagian `frontend/`. README `alat/` mendapat bagian **Kebun tiruan (Modul 25)**, README `edge/` butir blok `2b)`. [README proyek rujukan](../../proyek-rumah-pintar-mini/README.md) mencatat backend 1.2.0, frontend 1.1.0, dan baris baru `grafana/`; README akar repositorimu boleh dibiarkan.

### E. Tambahkan butir Modul 25 ke templat *pull request*

Ganti seluruh isi `.github/pull_request_template.md` di akar repositori dengan [templat rujukan](kode/.github/pull_request_template.md): templat Modul 24 ditambah enam butir **(Modul 25)** di akhir **Checklist keamanan**. Ringkasnya: tanpa sandi, token, atau chat_id; *data source* `grafana_baca`, bukan `postgres`; Grafana hanya `127.0.0.1:3000`, sandi `admin` diganti; dua rute baru khusus admin; CSV dan tangkapan tanpa data pribadi; paket peta berversi, atribusi OSM terlihat.

### F. ⭐ Gabungkan `fitur/grafana-peta-laporan` ke `main` lewat *pull request* "Dashboard teknis + peta + laporan harian (Checkpoint Fase 4)"

Di terminal kosong (folder `rumah-pintar-mini`), `git status` harus menyebut tepat lima berkas `modified`: empat README (C–D) dan templat (E). Lalu:

```text
git add backend/README.md frontend/README.md alat/README.md edge/README.md .github/pull_request_template.md
git commit -m "Dokumen Modul 25: README dan butir templat"
git push -u origin fitur/grafana-peta-laporan
```

1. Di GitHub, klik **Compare & pull request** (base `main`), judul `Dashboard teknis + peta + laporan harian (Checkpoint Fase 4)`. Tulis perubahannya dan bukti G1–G3 sejujur catatanmu (misalnya `G2 dengan Kebun tiruan`), salin keenam butir **(Modul 25)** dari berkas templat E (`main` masih lama), lalu **Create pull request**.
2. ***Review*:** **Files changed** ±43 berkas, tanpa `.env`, `node_modules/`, `dist/`, video, sandi, token, chat_id, atau koordinat rumahmu (Bruno menyimpan isi permintaan: `atur lokasi perangkat.yml` harus berisi titik contoh). Centang yang terpenuhi, lalu **Review changes** → **Comment** → **Submit review**. Ada yang terlarang? Jangan di-*merge*: koordinat → titik contoh; berkas terlarang → `git rm -r --cached` + namanya (rahasia: ganti juga nilainya); *commit*, *push* lagi.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. `git switch main`, `git pull --prune`, `git branch -d fitur/grafana-peta-laporan`, lalu nyalakan lagi backend (laporan 07.00 butuh backend menyala).

**Kamu lulus langkah ⭐ ini** kalau *pull request* itu ditinjau dengan butir **(Modul 25)**, di-*merge*, dan di `main` laptopmu `backend/package.json` berversi `1.2.0`, `frontend/package.json` `1.1.0`, serta `grafana/` berisi empat berkas. Centang ➕ F di [✅](#-checklist-kelulusan-modul-25).

### G. Simpan catatan belajar dan bukti Checkpoint Fase 4

Di folder `modul-25/` repositori **`belajar-iot`**, simpan lembar bukti Checkpoint, lembar catatan G2, tangkapan dashboard ([10.3](#103-tautan-grafana-json-di-github-tangkapan-layar-dan-catatan-kapan-memakai-yang-mana-5-menit)), dan `catatan.md`. Video cukup tautannya, tidak publik ([10.2](#102-video-demo-hp-6090-detik-naskah-dan-yang-tidak-boleh-terekam-15-menit)); tanpa sandi, token, chat_id, atau koordinat rumah.

```markdown
# Catatan Modul 25 — Diawasi dan melapor sendiri

| Yang diukur | Angkaku |
| :--- | :--- |
| G1: `🔴 Notification test` dari bot-ku (4.1) | ya / belum |
| G2: 🔴 … menit sesudah dicabut, ✅ sesudah dipasang (5.3–5.4) | … |
| G3: jadwal … WIB, berkas tiba … WIB (9.1) | … |
| Tautan JSON Grafana di `main` (10.3) | … |

Kapan memakai yang mana (10.3): …
```

*Commit* dan *push*.

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Akun hanya-baca** (`grafana_baca`) | "Kartu baca" Grafana: `SELECT` saja, pada tabel dan kolom yang diizinkan. Menulis ditolak dua lapis (transaksi hanya-baca + izin); `users`, `sesi`, `rules`, dan `kunci_hash` tertutup. |
| ***Alert rule*** (aturan peringatan) | Kueri + kondisi yang dijalankan Grafana sendiri setiap evaluasi (grup `kesehatan-node`, tiap `1m`), walau tak ada yang membuka layar. Satu instans per node: `Alerting` (🔴; kepala aturan menulis `Firing`) atau `Normal` (✅ saat *resolved*). |
| **Ambang** (*threshold*) | Batas angka: di panel mewarnai (bawaan merah mulai 80, penyebab Stat merah palsu), di *alert* menyalakan aturan (`IS ABOVE 5`). |
| **`CircleMarker`** dan ***popup*** | Penanda lingkaran SVG tanpa berkas gambar (ikon `Marker` hilang sesudah *build*): hijau = `online` dan kirimannya diterima, abu-abu = selain itu. *Popup* = keterangan saat lingkaran diklik. |
| ***Contact point*** (alamat kabar) | Tujuan kabar Grafana: bot Modul 19 + chat_id-mu, **Parse Mode** `None`, templat 🔴/✅ sendiri; tombol **Test** = G1. |
| **Cron lima bidang** | `menit jam tanggal bulan hari`: `0 7 * * *` = 07.00 setiap hari. Enam bidang (`0 7 * * * *`) berarti menit ke-7 setiap jam; `LAPORAN_JADWAL` menolaknya. |
| **CSV laporan** | Resep Modul 23: BOM, pemisah `;`, koma desimal, CRLF; 15 kolom, satu baris per perangkat. |
| ***Data source*** (sumber data) | Sambungan tersimpan Grafana ke database: `rumahpintar-db:5432` lewat lorong, akun `grafana_baca`, **TimescaleDB** menyala. |
| **Diam** lawan **status *offline*** | Diam = tidak ada bacaan baru di `readings` (diukur Grafana). Status `offline` = kabar resmi lewat wasiat atau Node 1 (dipakai 📴 backend, lencana, dan Peta). Perangkat bisa `online` padahal diam; `terakhir_dilihat` pun dimajukan pesan status. |
| **Grafana** | Dashboard dan *alert* tim teknis (OSS 13.2.4): dirakit dengan klik + SQL, membaca database langsung, di kontainer `rumahpintar-grafana`. |
| **Kebun tiruan** | Node 2 palsu `f00d000000b2` yang paketnya diterbitkan simulator `f00d00000001` tiap 300 detik; `kebun cabut`/`kebun pasang` = mencabut/memasang baterai. |
| **Lintang** dan **bujur** | `lat` (−90 sampai 90) dan `lng` (−180 sampai 180), desimal dengan **titik**; diisi admin lewat `PUT /devices/:id/lokasi`. |
| **Lisensi** AGPLv3, BSL 1.1, Hippocratic 2.1 | Berturut-turut: Grafana OSS (sumber terbuka); ThingsBoard sejak 4.4 (produksi dibatasi); react-leaflet (gratis dengan syarat HAM, bukan lisensi yang diakui OSI). Leaflet sendiri BSD-2-Clause. |
| **Lorong** (*network* Docker) | `rumahpintar`: kontainer di dalamnya saling memanggil dengan nama, tanpa loket laptop; `localhost` di kontainer = kontainer itu sendiri. Dibedah di Modul 26. |
| **Makro** | Potongan `$__…` yang diganti Grafana sebelum kueri dikirim, misalnya `$__timeFilter(ts)` → `ts BETWEEN '…Z' AND '…Z'` (UTC); hasilnya terlihat di **Query inspector**. |
| **Max open** | Batas sambungan *data source*: bawaan `100`, kita `4`, di bawah `CONNECTION LIMIT 5`, supaya tidak muncul `too many connections for role "grafana_baca"`. |
| ***No Data*** dan ***MissingSeries*** | Kueri tanpa baris, dan instans yang barisnya hilang (selesai sesudah 2 evaluasi: `Normal (Missingseries)`). Kueri `Node diam` berangkat dari `devices`, jadi node mati tetap berbaris; **No Data** diganti **Normal**. |
| ***Notification policy*** dan pengelompokan | Aturan kirim yang tidak kita sunting: *group wait* `30s`, *group interval* `5m` (juga untuk ✅), *repeat interval* `4h`. **Group by** `device_id` memberi tiap node pesannya sendiri. |
| **Panel** | Satu kotak dashboard = satu kueri SQL + satu cara menggambar. **Format** `Time series` memisah garis per `metric`; `Table` untuk tabel dan *alert*. |
| ***Pending period*** (masa tunggu) | Lama kondisi harus bertahan sebelum `Firing`: bawaan `1m`, kita `None`, jadi 🔴 tidak terlambat semenit dan `Pending` tak pernah muncul. |
| ***Provisioning*** **Grafana** | Memasang *data source*, dashboard, dan aturan dari berkas saat Grafana menyala (🔬, Modul 26). Bukan *provisioning* perangkat (Modul 21 dan 28); di sini YAML aturan hanya arsip. |
| ***Reduce*** `Last` | Langkah B yang disusun Grafana dari `WHEN Last OF QUERY`: angka terakhir tiap instans sebelum dibandingkan ambang (C). **History**: `A=…, B=…, C=…`; C bernilai 1 = menyala. |
| **`sendDocument`** dan **`InputFile`** | Pengiriman berkas lewat Bot API: `new InputFile(Buffer.from(isi, "utf8"), nama)`; `new InputFile("teks…")` dibaca sebagai jalur berkas → `ENOENT`. |
| **Ubin** (*tile*) dan **atribusi** | Potongan peta 256 × 256 px dari `tile.openstreetmap.org`, diunduh browser langsung (butuh internet, tanpa unduh massal), dengan kredit wajib `© OpenStreetMap contributors` yang terlihat. |
| **Variabel** `$node` | Pemilih perangkat di atas dashboard: **Query** dari `devices`, **Multi-value** + **Include All value**, ditulis `IN ($node)`; tidak berlaku di *alert*. |
| **Vitals**: RSSI, *uptime*, *heap* | Laporan kesehatan Node 1 tiap 5 menit ke `device_health`: sinyal WiFi (dBm; makin negatif makin lemah), lama menyala (turun mendadak = *restart*), sisa memori (turun terus = bocor). Node 2 tanpa vitals: paket per jam (seharusnya 12). |

## 📝 Kuis (5 soal)

1. Dashboard mana yang paling cocok (Node-RED, React, atau Grafana), dan mengapa? (a) adikmu ingin menyalakan lampu teras dari HP; (b) kamu curiga sinyal WiFi Node 1 memburuk selama 7 hari terakhir; (c) kamu ingin dikabari saat Kebun berhenti mengirim, walau tak seorang pun membuka layar.
2. Database sudah punya akun `postgres`, tetapi Grafana diberi `grafana_baca`. (a) Mengapa? (b) Panel berisi `SELECT * FROM devices` menjawab apa, dan bagaimana memperbaikinya? (c) Seseorang menempel `DROP TABLE readings;` ke kueri panel. Apa jawabannya, dan bagaimana kalau ia lebih dulu menjalankan `SET default_transaction_read_only = off`?
3. Paket terakhir Node 2 tiba pukul 10.00.00 WIB, lalu baterainya kamu cabut pukul 10.01.00; backend menyala. (a) Kira-kira kapan 🔴 Grafana tiba, dan kapan 📴 backend? (b) Mengapa pesan 🔴-nya menulis `terlambat 5.6 menit`, bukan lebih dari 10? (c) Baterai dipasang lagi pukul 10.20. Kabar pulih mana yang datang lebih dulu?
4. Temanmu mengusulkan *alert* "kabari kalau `terakhir_dilihat` lebih dari 5 menit lalu". (a) Selain bacaan, apa yang memajukan `terakhir_dilihat`? (b) Apa yang tercatat di lab penulis tepat saat status `offline` Kebun terbit? (c) Simulator `f00d00000001` dihentikan dengan **Ctrl + C**. Apa yang terjadi pada Kebun di Peta, di backend, dan di Grafana?
5. Laporan harian berjadwal `0 7 * * *`. (a) Laptop tidur pukul 06.50 sampai 07.30. Apakah laporannya terkirim, dan apa yang kamu terima? (b) Bagaimana mendapatkan laporan yang terlewat itu? (c) Kalau laptop dibuka pukul 07.10, apakah laporan datang, dan berisi hari apa?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) **Dashboard React**: untuk penghuni, bisa memerintah sesuai peran, dan punya mode HP; Grafana hanya membaca, dan hanya terbuka di laptop. (b) **Grafana**: "sejak kapan" adalah pertanyaan tim teknis; panel RSSI dengan **Last 7 days**, tanpa kode baru. (c) ***Alert* Grafana**: ia memeriksa sendiri tiap menit dan mengirim Telegram; *toast* React hanya tampil di layar yang terbuka ([Konsep 1](#1-dua-dashboard-dua-penonton-tiga-alat-yang-sudah-kamu-pegang)).
2. (a) `postgres` boleh membaca sidik sandi, sidik token sesi, dan sidik kunci perangkat, juga boleh `DROP TABLE`, padahal Grafana menjalankan kueri panel apa adanya, tanpa memeriksanya. (b) `permission denied for table devices`: izin `devices` diberikan per kolom, tanpa `kunci_hash`. Tulis nama kolomnya. (c) `cannot execute DROP TABLE in a read-only transaction` (lapis 1). Lapis 1 bisa dimatikan akun itu untuk sesinya, tetapi lapis 2 (izin) tetap menolak; riset penulis: `must be owner of table readings` ([Konsep 3](#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca)).
3. (a) 🔴 = paket terakhir + 10 menit (jadwal 5 + ambang 5) + 0–60 detik evaluasi + 30 detik *group wait* = **10.10.30–10.11.30 WIB** (9,5–10,5 menit sesudah dicabut). 📴 = status `offline` dari Node 1 sesudah 960 detik tanpa paket (10.16.00) + 60 detik tunggu backend = **±10.17 WIB**. (b) Angkanya menit sejak paket terakhir **dikurangi 5**, jeda wajar Node 2 di antara paketnya; evaluasi pertama yang melewati ambang menulis angka sedikit di atas 5 (di lab penulis `5.4`–`5.8`). (c) ✅ backend, seketika saat Node 2 `online` lagi; ✅ Grafana menunggu detak *group interval*, paling lama ±5 menit ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)).
4. (a) Setiap pesan perangkat itu: status, wasiat, dan status *retained* yang diterima lagi saat backend dimulai ulang. (b) `menit_terlambat` `11`, tetapi `menit_sejak_terakhir_dilihat` `0`: pesan `offline` itu sendiri memajukan `terakhir_dilihat`, jadi kueri temanmu mengira Kebun baru saja bicara. (c) Kebun ikut diam (penghubungnya mati), tetapi statusnya tetap `online` karena tak ada yang menerbitkannya: Peta tetap hijau, tanpa 📴. Grafana tetap mengirim 🔴 ±11 menit sesudah paket terakhirnya, karena ia mengukur `readings.diterima` ([Konsep 7](#7-alert-yang-membangunkan-orang-hanya-bila-perlu-diam-tidak-sama-dengan-offline)).
5. (a) **Tidak**: jadwal yang terlewat lebih dari 15 menit tidak dikirim susulan. Backend hanya menulis log dan mengirim `⏰ Laporan harian pada … terlewat (laptop tidur atau backend sibuk?). Kirim sekarang lewat POST /laporan/kirim` (di lab penulis: backend dibekukan 18 menit). (b) Bruno `kirim laporan sekarang` **tanpa** `?hari=ini`. (c) Datang, karena masih dalam 15 menit, dan berisi kemarin: "kemarin" dihitung dari jam **jadwal**, bukan jam fungsinya berjalan ([Konsep 10](#10-laporan-harian-datang-sendiri-setiap-pagi-selama-backend-menyala)).

</details>

---

## ✅ Checklist kelulusan Modul 25

Syarat lulus dari Silabus: **Grafana mengirim alert Telegram saat Anda mencabut baterai Node 2, dan laporan harian tiba otomatis.** **Jalur laptop:** "Grafana mengirim alert Telegram saat **Kebun tiruan** berhenti (`kebun cabut`), dan laporan harian tiba otomatis"; semua butir boleh dicentang dengan simulator dan Kebun tiruan.

> [!NOTE]
> **Penulis belum menguji dengan bot, Node 2 berbaterai 18650, HP, Excel, dan Docker Desktop sungguhan.** G1–G3 dibuktikan penulis dengan server Telegram tiruan dan Kebun tiruan di Raspberry Pi dengan Linux ([📚](#-sumber--atribusi-gambar)). Centang hanya yang sudah terjadi padamu (G1–G3 dengan bot-mu sendiri); sisanya tulis "belum" di catatan dan *pull request*-mu.

- [ ] **G1** Tombol **Test** *contact point* `Telegram Rumah Pintar` → `🔴 Notification test` tiba dari bot-mu (Praktik 4).
- [ ] **G2** Baterai Node 2 dicabut dari dudukannya (jalur laptop: `kebun cabut`) → `🔴 … tidak mengirim data, terlambat … menit dari jadwalnya` dalam 5,5–11,5 menit; dipasang lagi (`kebun pasang`) → `✅ … kembali mengirim data.` (Praktik 5).
- [ ] **G3** Tanpa disentuh, pada menit jadwalku: `laporan harian berjalan sesuai jadwal`, lalu `laporan-YYYY-MM-DD.csv` tiba dari bot-mu (Praktik 9).
- [ ] Kueri pemanasan di psql dan `node pemanasan.js` cocok dengan **Hasilnya** dan "Kunci uji dirimu" (🔁).
- [ ] Sandi admin Grafana diganti (**Submit**), *data source* `Database Connection OK` sebagai `grafana_baca`, dan `Panel pertama` bergaris suhu per perangkat (Kemenangan Cepat).
- [ ] ⭐ `docker ps`: `127.0.0.1:3000->3000/tcp`, API tanpa *login* → `401`, tanpa **Share externally**; `grafana_baca` membaca kolom, tetapi `SELECT *` dari `devices`, tabel `users` dan `sesi`, `INSERT`, serta `DROP TABLE` ditolak (Praktik 1).
- [ ] ⭐ Dashboard `Kesehatan Sistem`: zona WIB, *refresh* `1m`, `Node` = `All`, RSSI ber-`dbm`, Uptime tanpa merah palsu; Query inspector menulis `BETWEEN '…Z'` dan `IN ('…')` (Praktik 2).
- [ ] ⭐ Lima panel tersimpan dengan pesan `Praktik 3: …`, termasuk `Paket Node 2 per jam (seharusnya 12)` dan `Menit terlambat dari jadwal`, yang kuerinya sama dengan kueri *alert* (Praktik 3).
- [ ] ⭐ Kunci perangkat yang tidak dijalankan dicabut dulu; `Node diam` di grup `kesehatan-node` (`1m`, **Pending period** `None`, *no data* → **Normal**, **Group by** `device_id`) berstatus `Normal` (Praktik 4).
- [ ] ⭐ Kebun terdengar (jalur laptop: simulator Modul 25, ACL 2b, *restart* broker lalu backend, `daftarkan Kebun tiruan`); lembar catatan G2 terisi; tab **History** menulis `Alerting` lalu `Normal` (Praktik 5).
- [ ] ⭐ `npm test` 9 / 71, `/docs` 1.2.0, Bruno `atur lokasi perangkat` → `200` (admin), `403` (viewer), `400` (`"-6,2"`); setiap perangkat bertitik fiktif (Praktik 6).
- [ ] ⭐ **Peta** untuk admin dan viewer: atribusi terlihat, penanda simulator abu-abu sendiri saat dimatikan, rapi di 375 px dan mode gelap (Praktik 7).
- [ ] ⭐ `npm test` 14 / 96; `kirim laporan sekarang` → `200` dan berkasnya tiba, viewer `403`; CSV terbuka berkolom-kolom (Praktik 8).
- [ ] ⭐ `grafana/dashboards/kesehatan-sistem.json` (Classic) dan `grafana/alerting/node-diam.yaml` (arsip) masuk cabang tanpa token, sandi, atau chat_id (Praktik 9).
- [ ] ⭐ Gladi akhir lolos (backend: `npm run cek`, `npm test`, `npm audit`; dashboard: `lint`, `build` dengan satu peringatan, `cek-skema`), dan G1–G3 tercentang dengan buktinya (Praktik 10).
- [ ] `backend/` 1.2.0, `frontend/` 1.1.0, `grafana/`, `alat/`, dan `edge/` cocok; README dan templat *pull request* diperbarui; catatan dan bukti Checkpoint ada di `belajar-iot/modul-25/` (➕ A–E, G).
- [ ] ⭐ *Pull request* "Dashboard teknis + peta + laporan harian (Checkpoint Fase 4)" di-*merge* ke `main`, tanpa sandi, token, chat_id, atau koordinat rumah di **Files changed** (➕ F).

> 🎉 **Checkpoint Fase 4: tiga bukti** ([Silabus §8](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase); dikumpulkan di Praktik 10)
>
> - [ ] Kuis Modul 22, 23, 24, dan 25: masing-masing paling sedikit 4 benar.
> - [ ] Dashboard dipakai orang lain tanpa dibantu: L1–L3 Modul 24 Praktik 10.
> - [ ] Video demo HP 60–90 detik (tidak publik) dan "tautan Grafana": tautan GitHub ke `grafana/dashboards/kesehatan-sistem.json` + tangkapan dashboard.

**Fase 4 tuntas: dua layar untuk dua penonton.** Penghuni melihat, memerintah sesuai perannya, dan menemukan perangkatnya di **Peta**; tim teknis membaca riwayat dan kesehatan perangkat di Grafana, dibangunkan *alert* saat node diam, dan menerima laporan kemarin setiap pagi. Batasnya: otaknya masih di laptop, jadi *alert* dan laporan ikut tidur saat laptop tidur.

> ➡️ **Modul berikutnya:** [Modul 26 — Docker & Docker Compose: Satu Perintah untuk Semua Layanan](../../fase-5-operasi-skala/modul-26-docker-compose/README.md). Grafana pindah ke Docker Compose dengan lemari `rumahpintar-grafana-data` yang sama: dashboard, aturan, dan *contact point*-mu ikut serta.

## 📚 Sumber & atribusi gambar

**Dokumentasi dan kode sumber yang dipakai** (dibaca 26–27 Okt 2026):

- **Grafana OSS 13.2.4** (AGPLv3): image [`grafana/grafana`](https://hub.docker.com/r/grafana/grafana); [Grafana di Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/); *data source* PostgreSQL: [setelan](https://grafana.com/docs/grafana/latest/datasources/postgres/configure/) dan [*alert*-nya](https://grafana.com/docs/grafana/latest/datasources/postgres/alerting/); *alert*: [membuat aturan](https://grafana.com/docs/grafana/latest/alerting/alerting-rules/create-grafana-managed-rule/), [No Data dan Error](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/), [pengelompokan kabar](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/group-alert-notifications/), dan [*contact point* Telegram](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/manage-contact-points/integrations/configure-telegram/); ekspor dan impor: [model JSON dashboard](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/view-dashboard-json-model/) dan [*provisioning* *alert*](https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/). Dokumentasinya mengikuti rilis terbaru, yang bisa berbeda dari 13.2.4.
- **Peta**: [kebijakan ubin OSMF](https://operations.osmfoundation.org/policies/tiles/) dan [hak cipta OpenStreetMap](https://www.openstreetmap.org/copyright); [Leaflet](https://leafletjs.com/) 1.9.4 (BSD-2-Clause); [react-leaflet](https://react-leaflet.js.org/docs/start-installation/) 5.0.0 dengan [LICENSE](https://github.com/PaulLeCam/react-leaflet/blob/master/LICENSE.md) **Hippocratic-2.1** (bukan lisensi OSI, lihat Konsep 8).
- **Laporan**: [node-cron](https://www.npmjs.com/package/node-cron) 4.6.0 dan [zona waktunya](https://nodecron.com/timezones-and-dst), grammY [berkas dan `InputFile`](https://grammy.dev/guide/files), Telegram Bot API [`sendDocument`](https://core.telegram.org/bots/api#senddocument).
- **Platform siap pakai** ([Konsep 11](#11-beli-atau-bangun-platform-iot-siap-pakai)): [ThingsBoard](https://github.com/thingsboard/thingsboard), [Home Assistant](https://www.home-assistant.io/installation/raspberrypi), [Blynk](https://blynk.io/pricing), dan [Antares](https://antares.id).
- **Kurikulum**: syarat lulus dikutip dari [Silabus §7 Modul 25](../../SILABUS.md#modul-25--visualisasi-profesional-grafana-peta-perangkat--laporan); `device_health`-mu sudah *hypertable* ([🧩 Modul 18 Tingkat 3](../../fase-3-backend-data/modul-18-timescaledb/README.md#tingkat-3--device_health-juga-data-deret-waktu-buat-dari-nol))? GRANT dan kueri tidak perlu diubah (lab uji kode).

**Gambar.** Diagram penulis berlisensi **CC BY 4.0** (file `.svg`-nya di `aset/`); pada tangkapan layar, hanya judul, nomor, dan keterangannya. Rincian per file: [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-25`, `dua-dashboard-tiga-alat`, `grafana-di-samping-database`, `hak-baca-saja`, `perjalanan-alert`, `peta-dari-database`, `laporan-harian`, `diagram-proyek-modul-25` | Dari kode dan uji penulis. Waktu *alert* = rentang dua larian; IP dan angka sensor **contoh**; layar Peta di diagram = ilustrasi. | CC BY 4.0 |
| `grafana-pertama`, `editor-panel-dan-variabel`, `dashboard-kesehatan-sistem`, `alert-node-diam` | Tangkapan asli Grafana 13.2.4 (tema bawaan gelap), lebar 1280 px. `Kesehatan Sistem` diimpor dari JSON kunci (sama dengan rakitan lewat layar); `Alerting` dari `kebun cabut`; token tidak tampak. | Grafana OSS (Grafana Labs, AGPLv3), tampil apa adanya untuk tujuan pendidikan, Oktober 2026 |
| `halaman-peta` | Tangkapan asli dashboard 1.1.0 (*build* produksi) lawan backend 1.2.0, lebar 1280 dan 375 px (mode perangkat Chrome, **bukan HP**); ubin OSM asli; tiga titik **fiktif** sekitar Monas. | Peta © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) |
| `laporan-csv` | Teks asli terminal bash dan log lab (jawaban `curl` setara Bruno, log backend dan Telegram tiruan, `cat`, `xxd`), ditata ulang penulis. | CC BY 4.0 |

**Tentang kotak Hasilnya.** "Lab penulis" umumnya lab akhir, 27 Oktober 2026, di **Raspberry Pi 5 dengan Ubuntu 26.04.1 LTS (arm64)** yang berperan sebagai laptop: Docker Engine 29.1.3, Node.js 24.21.0, npm 11.19.0, Chrome 156, `grafana/grafana:13.2.4`, `timescale/timescaledb:2.30.2-pg17`, dan Mosquitto 2.0.22 berkunci gaya Modul 21 dalam kontainer. Kodenya `kode/` persis: backend 1.2.0 sejak awal lab (juga di Praktik 1–5, saat backend-mu masih 1.1) dan dashboard 1.0.0 yang dinaikkan ke 1.1.0 lewat langkah Praktik 7. Layar Grafana dan Peta diklik dan diketik skrip lewat Chrome tanpa layar (zona `Asia/Jakarta`); permintaan Bruno dikirim `curl` dengan metode, alamat, isi, dan akun yang sama.

Loket (3000, 5432, 8080, 5173, 1883) sama dengan milikmu; nama kontainer, lemari, dan lorong lab ditulis ulang menjadi `rumahpintar…`. Hasil di luar lab akhir, misalnya [3.3](#33-tabel-berjaga-sendiri-dari-kejadian-mode-offline-opsional-8-menit), Lighthouse `/peta`, dan ✅ palsu `Normal (Missingseries)` di 🚨, dikutip dari **lab uji kode** malam sebelumnya (loket dan nama juga ditulis ulang); di sana panel *vitals* diisi 288 baris `device_health` **sintetis** (24 jam). "Riset penulis" adalah uji 26 Oktober dengan setelan yang disebut di kalimatnya.

Log backend memakai jam mesin penulis (WITA, UTC+8): saat dikutip, jamnya dikurangi satu jam, atau ditulis "jam laptop". Log Grafana dan server tiruan ber-UTC (+7 jam = WIB), Mosquitto berdetik *epoch*; layar Grafana, Peta, dan pesan backend sudah WIB. Detik, selisih, ukuran dan nama berkas, uid, serta angka sensor adalah **contoh**. IP LAN ditulis `192.168.1.10`, jalur `/home/kamu/…`.

Telegram-nya server Bot API **tiruan** dengan token dan chat_id palsu, seperti di [🔬 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#-bedah-teknis-opsional). Backend diarahkan lewat `TELEGRAM_API_ROOT`, Grafana lewat dua opsi uji yang **tidak ada** di perintahmu: bundel CA lab (`SSL_CERT_FILE`) dan tiruan beralias `api.telegram.org` di lorong lab ([🔬](#-bedah-teknis-opsional)). Kotak pesan berisi teks yang diterima tiruan. Datanya riwayat 7 hari dari `npm run isi-riwayat` (`diterima` = jam skrip dijalankan), *vitals* simulator `f00d00000001`, dan Kebun tiruan `f00d000000b2` dengan jeda 300 detik yang **tidak** dipercepat. G2 dibuktikan dengan Kebun tiruan, laptop tidur ditiru dengan membekukan backend 18 menit, dan "Grafana dari HP" dengan browser kedua lewat IP LAN mesin.

Yang **tidak** diuji: Telegram sungguhan (G1–G3 dengan bot-mu, tampilan emoji, `Unauthorized` dan `chat not found`, chat grup, satu token untuk backend dan Grafana sekaligus); Node 2 dengan baterai 18650; HP dan video; Windows, macOS, Docker Desktop (termasuk `host.docker.internal`), PowerShell, dan *firewall*; Excel dan LibreOffice; restart *daemon* Docker dan *reboot* (lorong "cukup sekali" = penalaran dari `docker restart` dan stop/start); Edge, Firefox, dan Safari; ukuran image amd64 (angka ±445 MB dan 1,81 GB = arm64).

Yang **belum terbukti** saat terbit: database mati lebih dari ±80 detik (dua evaluasi atau lebih); laptop yang benar-benar tidur (kontainer ikut tidur, urutan pesan bisa lain); *alert* **Format** `Table` di rilis sesudah 13.2.4 (di 13.2.4 terbukti jalan walau dokumentasi menyebut *time series*) dan cadangannya di 🔬; sketsa kode di 🔬 tidak dijalankan.

---

[⬅️ Modul 24](../modul-24-kendali-aturan-peran/README.md) · [Fase 4](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 26 — Docker & Docker Compose: Satu Perintah untuk Semua Layanan](../../fase-5-operasi-skala/modul-26-docker-compose/README.md) ➡️**
