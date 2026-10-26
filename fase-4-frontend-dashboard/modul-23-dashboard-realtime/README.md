# Modul 23 — Dashboard Realtime: Grafik, Gauge, Riwayat, & Status

🌐 **Bahasa Indonesia** · [English](../../en/phase-4-frontend-dashboard/module-23-realtime-dashboard/README.md)

*Fase 4 · Minggu 23 · Perangkat keras: **Kit A + B** atau simulator Modul 21 (`f00d00000001`), ditambah **HP** (Android/iPhone) di WiFi rumah yang sama · Prasyarat: **Modul 22** (dashboard v0.1 di `main`), **Modul 19** · Waktu: 10–12 jam, dicicil dalam satu minggu*

[⬅️ Modul 22](../modul-22-react-dasar/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 24 ➡️](../modul-24-kendali-aturan-peran/README.md)

---

Modul 22 ditutup dengan dashboard v0.1 yang sudah punya wajah, tetapi **angkanya masih diam**: kartu baru berubah saat detail perangkatnya dibuka ulang. Padahal sejak Modul 19 backend-mu sudah mendorong setiap bacaan lewat Socket.IO begitu tiba, dan `alat/terminal-live.js` membuktikannya di terminal. Yang belum ada hanyalah browser yang ikut mendengarkan.

Minggu ini dashboard berhenti **bertanya** dan mulai **didorong**. Kamu menyambungkan Socket.IO berkunci, menaruh data *live* di satu toko yang dibaca semua layar, lalu menambahkan kartu status merah/hijau, grafik suhu *live*, *gauge* (penunjuk setengah lingkaran), dan layar Riwayat.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Angka di dashboard diam sampai detail perangkat dibuka ulang. | Dashboard v0.1 **bertanya** sekali lewat `fetch`; belum ada yang mendengarkan Socket.IO di browser. | **`socket.io-client` 4.8.4** dengan *cookie* *login* yang sama, langganan `ikuti` dan pendengar `telemetry`/`status` Modul 19 di `useEffect`, dan lencana **Live** / **Menyambung ulang…** / **Terputus** (Konsep 1–3, Praktik 1–2) |
| Data *live* harus tampil di Daftar, Detail, grafik, dan *gauge* sekaligus. | Setiap komponen menyimpan datanya di *state* sendiri (papan tulis kecil). | **Toko Zustand** sebagai papan pengumuman bersama, dibaca lewat **selektor** supaya layar tidak digambar ulang 10× per detik (Konsep 4–5, Praktik 2 dan 6) |
| Tak jelas perangkat mana yang hidup sekarang dan sejak kapan angkanya tidak berganti. | Status dibaca sekali saat Daftar dibuka, dan "diperbarui pukul … WIB" tidak menyebut sudah berapa lama. | **Kartu `Online` hijau dan `Offline` merah**, "terakhir dilihat 12 detik yang lalu", dan tanda `data basi` (Konsep 6–7, Praktik 3) |
| Yang tampak hanya angka terakhir; tren lima menit terakhir tidak terlihat. | v0.1 belum punya grafik. | **Grafik garis *live* 5 menit** dan ***gauge* `RadialBarChart`** untuk kelembapan tanah dan air tandon, dengan Recharts (Konsep 8–9, Praktik 4–5) |
| Grafik bisa menipu: *gauge* tampak penuh padahal isinya 20 %, dan garis lurus melintasi celah saat perangkat mati. | Pustaka grafik memilih skala sendiri dan menyambung dua titik yang berjauhan. | **Visual jujur**: *gauge* berskala 0–100 %, satuan di setiap angka, celah dibiarkan putus, dan warna selalu ditemani teks (Konsep 9, Praktik 5) |
| Malam hari, layar putih dashboard menyilaukan. | v0.1 hanya punya tema terang. | **Mode gelap** yang mengikuti setelan HP atau laptop, termasuk warna grafik (Konsep 10, Praktik 5) |
| Riwayat hanya terbaca lewat Bruno sebagai JSON. | Ringkasan per ember (`bucket`) Modul 18 belum dipakai layar mana pun. | **Layar Riwayat** 1 jam, 24 jam, dan 7 hari, tabel berhalaman, dan tombol **Unduh CSV** untuk Excel berbahasa Indonesia (Konsep 11, Praktik 7–8) |
| Dashboard hanya terbuka di laptop. | Backend mendengar di `127.0.0.1`, dan Vite hanya melayani `localhost`. | **Mode HP** lewat WiFi rumah (`HOST`, `CORS_ORIGIN`, `npm run dev:hp`), lalu kembali ke **mode laptop** di akhir sesi (Konsep 12, Praktik 9–10) |

Di akhir minggu, kamu menutup LDR Node 1 dengan tangan sambil merekam layar HP (jalur laptop: `suhu 33` dan perintah lampu), lalu membuka Riwayat 7 hari dan membaca tulisan `dimuat dalam … ms`. Itulah syarat lulus dari Silabus: "menutup LDR dengan tangan membuat grafik di HP berubah dalam **< 1 interval kirim + 1 detik** (dengan *report-by-exception* Modul 11: ≈ 1–2 detik), dan riwayat 7 hari termuat < 1 detik." Satu interval kirim Node 1 adalah 10 detik, jadi batas kerasnya 11 detik. Rumah Pintar Mini mendapat **dashboard v0.2** (`0.2.0`, *live*). Backend tetap v1.0, kontrak data tetap 1.4, dan firmware serta `alat/` tidak berubah; kode barunya hanya di folder `frontend/`.

![Peta jalan Modul 23. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 4 Dashboard, Modul 22 sampai 25, disorot dengan bingkai ungu. Modul 1 sampai 22 bertanda selesai; Modul 23 berwarna merah dan ditandai KAMU DI SINI, Modul 24 dan 25 berwarna ungu. Catatan di kiri penanda: dashboard menjadi hidup, angka bergerak sendiri, dengan grafik, gauge, riwayat, status, dan HP lewat WiFi rumah. Di bawahnya, kotak Modul 23 minggu ini, 10 sampai 12 jam dicicil; perangkat: Kit A + B atau simulator Modul 21 (f00d00000001), ditambah HP di WiFi rumah; lanjutan langsung dashboard v0.1 Modul 22. Daftar kegiatan kolom kiri: pemanasan ulang JavaScript, yaitu waktu, jendela geser, pendengar acara, setInterval yang bukan polling, dan teks CSV; Kemenangan Cepat, angka yang bergerak sendiri tanpa memasang apa pun; Praktik 1, soket berkunci dari browser dengan Socket.IO dan cookie; Praktik 2, toko Zustand, angka bergerak sendiri; Praktik 3, kartu status merah/hijau dan terakhir dilihat; Praktik 4, grafik garis live 5 menit, dengan bagian syarat lulus: grafik berubah dalam kurang dari 1 interval kirim + 1 detik; Praktik 5, gauge, visual jujur, dan mode gelap. Kolom kanan: Praktik 6, ukur dulu, jangan menggambar ulang 10× per detik; Praktik 7, riwayat 1 jam, 24 jam, 7 hari, dengan bagian syarat lulus: riwayat 7 hari termuat kurang dari 1 detik; Praktik 8, tabel berhalaman dan ekspor CSV; Praktik 9, dashboard di HP lewat WiFi rumah, dengan bagian syarat lulus: menutup LDR dengan tangan membuat grafik di HP berubah; Praktik 10, uji kelulusan, lint, build, dan gladi bersih, yaitu gladi bersih kedua syarat lulus lalu kembali ke mode laptop; dan Tambahan, dashboard v0.2 dan pull request dashboard v0.2 (live). Praktik 3, 4, 7, 9, 10, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: syarat lulus dari Silabus, menutup LDR dengan tangan membuat grafik di HP berubah dalam kurang dari 1 interval kirim + 1 detik (dengan report-by-exception Modul 11: ≈ 1–2 detik), dan riwayat 7 hari termuat kurang dari 1 detik. Dua jalur data: perangkat (Kit A + B lewat gateway Pi, LDR sungguhan) atau laptop (simulator f00d00000001 + Bruno). Tidak berubah: backend v1.0, kontrak data 1.4, firmware, dan alat/; Wokwi tidak diperlukan. Selalu buka http://localhost:5173 di laptop; HP membuka http://IP-laptop:5173 hanya saat mode HP (Praktik 9).](aset/peta-jalan-modul-23.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Dua jalur data, satu dashboard.** Dashboard hanya bicara dengan backend v1.0 (API dan Socket.IO), bukan dengan broker atau perangkat. **Jalur perangkat**: Node 1 dan Node 2 (**Kit A + B**) mengirim lewat broker di gateway Pi, dan LDR Node 1 dipakai untuk syarat lulus. **Jalur laptop**: Mosquitto di laptop dan simulator Modul 21 (folder `alat`) dengan `f00d00000001`. Simulator tidak punya LDR, jadi menutup LDR diganti dua uji: `suhu 33` di terminal simulator (tampil pada kiriman berikutnya) dan perintah lampu dari **Bruno** (kiriman segera). Riwayat 7 hari di kedua jalur memakai data latihan (resepnya di [🧰](#-yang-perlu-disiapkan)). **Wokwi tidak dipakai.**
> - **Di laptop, buka dashboard selalu di `http://localhost:5173`**, bukan `127.0.0.1:5173` (Modul 22 Konsep 9). **HP** membuka `http://<IP-laptop>:5173`, hanya selama **mode HP** menyala (Praktik 9–10). *Login* tidak ikut pindah: HP punya browser dan *cookie* sendiri, jadi di HP kamu masuk lagi dengan akun viewer.
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **VS Code** dengan terminal `backend` (`npm run dev`, pintu 8080) dan terminal `frontend` (Vite, pintu 5173; di mode HP `npm run dev:hp`), di jalur laptop ditambah terminal `alat` (simulator); **Docker Desktop** dengan `rumahpintar-db` menyala; **Chrome atau Edge** dengan DevTools (tab **Network** dan **Console**) dan React DevTools (Praktik 6); **Bruno**; dan **HP** (Praktik 9–10).
> - **Lanjutan langsung Modul 22.** Dashboard v0.1 di `main`, akun `admin@rumah.test` dan `viewer@rumah.test`, koleksi Bruno, dan `alat/.env` dipakai apa adanya. Pekerjaan minggu ini tinggal di cabang baru `fitur/dashboard-live`; hasil setiap praktik bisa dicocokkan dengan `kode/tahap/praktik-N`.
> - **Kotak Hasilnya.** Keluaran dan tangkapan layar direkam penulis di Windows 11 25H2 (*build* 10.0.26200.9711) dengan Node.js 24.21.0, npm 11.19.0, Docker Engine 29.5.3, dan Edge 156.0.4314.42 lawan backend v1.0 dan database sungguhan. Pengirimnya simulator Modul 21 (`f00d00000001`) serta Node 1 dan Node 2 tiruan lab, jadi angka sensornya **contoh**; jam, `dimuat dalam … ms`, dan ukuran *build* di layarmu pasti berbeda. Alamat IP ditulis `192.168.1.10`; IP-mu akan berbeda. Langkah HP direkam di laptop yang membuka alamat IP WiFi-nya sendiri, dan layar HP ditiru dengan mode perangkat DevTools: **penulis belum mencobanya di HP sungguhan** (rincian di [📚 Sumber](#-sumber--atribusi-gambar); kalau HP-mu berulah, lihat [🚨](#-kalau-tidak-jalan)).
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan VS Code dan browser (DevTools: **F12** atau **Ctrl + Shift + I**, macOS **Cmd + Option + I**; muat ulang: **F5**, macOS **Cmd + R**). **Kecuali di terminal:** menghentikan program tetap **Ctrl + C**, juga di Mac. Perintah terminal sama, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Dashboard tetap tidak menyimpan sandi atau token.** Socket.IO menumpang *cookie* `HttpOnly` yang sama dengan `fetch`, dan tidak ada apa pun di `localStorage`, termasuk pilihan tema (mode gelap mengikuti setelan sistem).
> 2. **Semua variabel `VITE_…` ikut terkirim ke browser**, jadi isinya hanya alamat seperti `VITE_API_BASE`, tidak pernah rahasia.
> 3. **`.env.local` dan `backend/.env` tidak ikut Git.** Di mode HP, `backend/.env` berisi IP laptopmu; yang ikut ke GitHub hanya `.env.example`.
> 4. **Mode HP hanya di WiFi rumah yang kamu percaya**, bukan WiFi kafe, kampus, atau kos: dashboard masih `http://` tanpa enkripsi. Di HP, masuk dengan akun **viewer**. Kembalikan mode laptop (`HOST`, `CORS_ORIGIN`, dan `npm run dev` biasa) di akhir sesi dan sebelum laptop dibawa ke jaringan lain ([Praktik 9](#praktik-9--dashboard-di-hp-lewat-wifi-rumah-60-menit), [10.4](#104-kembalikan-mode-laptop-5-menit)). Akses dari internet menunggu HTTPS di Modul 27.
> 5. **Tidak ada *polling*.** Bacaan *live* hanya datang lewat Socket.IO; `setInterval` hanya menggerakkan jam di layar, tanpa permintaan jaringan ([Konsep 1](#1-didorong-bukan-bertanya-data-live-lewat-socketio), [Konsep 6](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling)).
> 6. **Pasang paket npm dengan versi yang tertulis** (misalnya `zustand@5.0.16`). Salin namanya dari modul, jangan dari ingatan: paket bernama mirip bisa buatan orang lain.

Seperti Modul 16–22, modul ini diawali [🔁 Pemanasan ulang JavaScript](#-pemanasan-ulang-javascript-3045-menit), kali ini bekal dashboard *live*: waktu, jendela geser, pendengar acara, detak jam, dan teks CSV. Hari pertama cukup pemanasan, Kemenangan Cepat (angka yang bergerak sendiri tanpa memasang paket), Konsep 1–2, dan Praktik 1. Dua belas konsep dibaca berpasangan dengan praktiknya; urutannya ada di awal [🧠](#-konsep-mengapa). Bagian lipat di [🚨](#-kalau-tidak-jalan) (klik judulnya) dibuka saat perlu; bagian lipat di [🔬](#-bedah-teknis-opsional) boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🏆 Kemenangan Cepat: angka yang bergerak sendiri (20 menit)](#-kemenangan-cepat-angka-yang-bergerak-sendiri-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Didorong](#1-didorong-bukan-bertanya-data-live-lewat-socketio) · [2 Soket berkunci](#2-soket-berkunci-cookie-yang-sama-gelang-yang-sama) · [3 `useEffect`](#3-useeffect-untuk-berlangganan-pasang-pendengar-lepas-di-cleanup) · [4 Toko Zustand](#4-satu-toko-untuk-semua-layar-zustand-dan-selektor) · [5 Gambar ulang](#5-jangan-menggambar-ulang-10-per-detik-ukur-dulu-baru-percaya) · [6 Waktu](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling) · [7 Status dan kesegaran](#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi) · [8 Grafik *live*](#8-grafik-garis-live-jendela-geser-5-menit) · [9 Visual jujur](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status) · [10 Mode gelap](#10-mode-gelap-mengikuti-setelan-hp-dan-laptop) · [11 Riwayat](#11-riwayat-dari-ember-tiga-rentang-tabel-berhalaman-dan-csv) · [12 HP lewat WiFi](#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Soket](#praktik-1--soket-berkunci-dari-browser-45-menit) · [2 Toko Zustand](#praktik-2--toko-zustand-angka-bergerak-sendiri-50-menit) · [3 Kartu status](#praktik-3--kartu-status-merahhijau-dan-terakhir-dilihat-40-menit) · [4 Grafik *live*](#praktik-4--grafik-garis-live-5-menit-55-menit) · [5 *Gauge* dan mode gelap](#praktik-5--gauge-visual-jujur-dan-mode-gelap-45-menit) · [6 Ukur dulu](#praktik-6--ukur-dulu-jangan-menggambar-ulang-10-per-detik-25-menit) · [7 Riwayat](#praktik-7--riwayat-1-jam-24-jam-dan-7-hari-55-menit) · [8 Tabel dan CSV](#praktik-8--tabel-berhalaman-dan-ekspor-csv-40-menit) · [9 HP](#praktik-9--dashboard-di-hp-lewat-wifi-rumah-60-menit) · [10 Uji kelulusan](#praktik-10--uji-kelulusan-lint-build-gladi-bersih-dan-mode-laptop-35-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-23)

## 🎯 Setelah modul ini kamu bisa…

1. **Menyambungkan dashboard ke Socket.IO dengan *cookie* *login* yang sama** (soket berkunci), memulihkannya sendiri sesudah gelang habis atau backend dimulai ulang, dan menampilkan lencana **Live**, **Menyambung ulang…**, atau **Terputus**.
2. **Berlangganan lewat `useEffect`**: memasang pendengar `telemetry` dan `status`, mengikuti perangkat dengan `ikuti`, lalu melepas semuanya di *cleanup*.
3. **Menaruh data *live* di satu toko Zustand** (papan pengumuman bersama) yang dibaca Daftar, Detail, grafik, dan *gauge* lewat selektor.
4. **Membuat kartu status merah/hijau** dengan "terakhir dilihat 12 detik yang lalu" dan tanda `data basi`, tanpa *polling*.
5. **Menggambar grafik garis *live* 5 menit** dengan Recharts: jendela geser, jam WIB di sumbu waktu, dan titik baru begitu bacaan tiba.
6. **Memilih visual yang jujur**: *gauge* `RadialBarChart` berskala 0–100 %, satuan di setiap angka, celah yang dibiarkan putus, dan warna yang selalu ditemani teks.
7. **Membuka riwayat 1 jam, 24 jam, dan 7 hari** dari API (bacaan mentah dan ember `bucket`), membuktikan riwayat 7 hari termuat kurang dari 1 detik, lalu menyajikannya di tabel berhalaman dan CSV untuk Excel berbahasa Indonesia.
8. **Mengukur dulu, baru percaya**: memeriksa dengan React DevTools bahwa layar tidak digambar ulang 10× per detik.
9. **Menyalakan mode gelap** yang mengikuti setelan HP atau laptop, termasuk warna grafik.
10. **Membuka dashboard dari HP lewat WiFi rumah** (mode HP), mengembalikan mode laptop, lalu menggabungkan dashboard v0.2 lewat *pull request* sesudah *lint* dan *build* lolos.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 22** | Dashboard v0.1 (`0.1.0`) di `main`, folder `frontend/`; backend v1.0 dan kontainer **`rumahpintar-db`** di Docker Desktop; akun `admin@rumah.test` dan `viewer@rumah.test` beserta sandinya; koleksi Bruno dengan `backend/bruno/.env`; dan `alat/.env`. |
| **Sumber data** (pilih satu jalur) | **Jalur perangkat:** Node 1 dan Node 2 (Kit A + B) terdaftar sejak Modul 21; LDR Node 1 dipakai untuk syarat lulus. **Jalur laptop:** Mosquitto di laptop dan simulator Modul 21 (`alat`) dengan **`f00d00000001`**. Wokwi tidak dipakai. |
| **HP** (Android atau iPhone) | Di **WiFi rumah yang sama** dengan laptop, untuk [Praktik 9](#praktik-9--dashboard-di-hp-lewat-wifi-rumah-60-menit) dan gladi Praktik 10; ditambah kamera kedua (kamera laptop atau HP lain) untuk merekam video bukti. Tablet atau laptop kedua boleh menggantikan HP. Tanpa perangkat kedua, pakai jalur mode perangkat DevTools dan catat dengan jujur di [✅](#-checklist-kelulusan-modul-23). Penulis sendiri belum mencoba langkah HP dengan HP sungguhan. |
| **Data riwayat 7 hari** | Data latihan untuk kedua jalur, dari resep di bawah tabel ini. |
| **Node.js 24, VS Code, Git, Bruno** | Sama dengan Modul 22; repositori `belajar-iot` dipakai lagi untuk 🔁 dan catatan ➕ E (folder `modul-23`). Bruno memakai akun admin untuk perintah lampu dan akun viewer untuk mengecek riwayat. |
| **Chrome atau Edge** | DevTools bawaan (tab **Network** dan **Console**) dan ekstensi React DevTools (terpasang sejak Modul 22, dipakai di Praktik 6). Firefox dan Safari belum diuji. |
| **Internet dan akun GitHub** | Internet untuk `npm install` lima paket di Praktik 1; GitHub untuk *pull request* "dashboard v0.2 (live)" di ➕ D. |

**Resep data 7 hari.** Data `npm run isi-riwayat` dari Modul 17 sudah berumur berminggu-minggu, jadi "7 hari terakhir"-nya kosong atau bolong. Resep dua perintah ini dijalankan di [7.1](#71-siapkan-data-7-hari-dan-cek-di-bruno-10-menit); kalau kamu mencobanya lebih awal, ulangi di sana (bacaan yang sudah ada dilewati). Dengan backend dan `rumahpintar-db` menyala, buka terminal baru di folder `backend`:

```text
npm run isi-riwayat
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
```

**Hasilnya (contoh):** perintah pertama diakhiri satu baris per perangkat latihan, misalnya `f00d00000001: 1109 bacaan dikirim, 1109 baru tersimpan` (satu bacaan tiap 10 menit dari pukul 00.00 WIB tujuh hari lalu sampai sekarang, untuk `f00d00000001` dan `f00d00000002`, jadi angkanya bergantung jam). Perintah kedua menjawab satu baris `CALL`; kalau Docker Desktop menambah tiga baris mulai dari `What's next:`, itu iklan kecil Docker, abaikan. Perintah kedua meringkas bacaan itu ke buku ringkasan per jam (Modul 18); tanpanya, Riwayat 7 hari bisa hanya berisi 2 titik. Jendelanya 8 hari, bukan `NULL` seperti di Modul 18, supaya ringkasan lama yang bacaan mentahnya sudah dibuang retensi tetap utuh.

Versi yang dipakai modul ini (Oktober 2026): **Node.js 24** dan lima paket baru yang dipasang dengan versi tertulis di [1.2](#12-pasang-lima-paket-dengan-versi-tertulis-5-menit): **socket.io-client 4.8.4** (sama dengan versi server Socket.IO di backend v1.0), **zustand 5.0.16** (toko), **recharts 3.10.1** (grafik dan *gauge*) beserta pasangannya **react-is 19.3.1** (versinya harus sama dengan `react`), dan **date-fns 4.4.0** (jam relatif berbahasa Indonesia). Paket Modul 22 tidak dinaikkan: **vite 8.3.5**, **react** dan **react-dom 19.3.1**, **@vitejs/plugin-react 6.1.2**, **tailwindcss** dan **@tailwindcss/vite 4.3.3**, **typescript 6.0.3**, **oxlint 1.89.0**, dan ekstensi **React DevTools 8.0.0**. **@tanstack/react-virtual 3.14.22** hanya dibahas di [🔬](#-bedah-teknis-opsional), tidak dipasang.

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, dan folder repositori `belajar-iot`. Backend, Docker, dan browser belum dipakai.

Dashboard *live* memakai lima kemampuan kecil JavaScript: waktu, jendela geser, pendengar acara, detak jam, dan teks CSV. Kita latih dulu di Node.js, tanpa React dan paket (±40 menit). Ketik sendiri, jangan salin-tempel, lalu cocokkan hasil setiap langkah; catatan **Nanti di React** menunjukkan tempat pemakaiannya.

**Siapkan foldernya.** Buka repositori **`belajar-iot`** di VS Code, buat folder baru **`modul-23`**, lalu jalankan di terminal:

```text
cd modul-23
npm init -y
npm pkg set type=module
```

`type=module` membuat Node.js menerima `import` dan `await` di luar fungsi. Lalu buat **`pemanasan.js`** di `modul-23` dan ketik kepalanya:

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 23
// Lima kemampuan kecil yang nanti dipakai lagi di dashboard live: waktu, jendela geser, pendengar acara, detak, dan CSV.
import { EventEmitter } from "node:events";
import { setTimeout as tunggu } from "node:timers/promises";
```

`import` selalu di paling atas. Keduanya bawaan Node.js (awalan `node:`), dipakai di Langkah 3 dan 4.

### Langkah 1 — Waktu: `Date.parse`, `Date.now()`, dan jam WIB

Setiap bacaan membawa `ts`, waktu perangkat dalam UTC (huruf `Z`) berupa **teks**; untuk menghitung "berapa detik yang lalu", teks itu harus menjadi **angka**. Tambahkan:

```js
// 1. Waktu: Date.parse, Date.now, dan jam WIB
// ts dari perangkat berbentuk teks UTC tanpa milidetik, misalnya "2026-10-24T03:15:42Z". Di sini dibuat "12 detik lalu".
const ts = new Date(Date.now() - 12_000).toISOString().slice(0, 19) + "Z";
const t = Date.parse(ts); // teks -> angka: milidetik sejak 1 Januari 1970 (UTC)
const selisihDetik = Math.round((Date.now() - t) / 1000); // Date.now() = sekarang, juga dalam milidetik
console.log("ts:", ts, "->", t);
console.log(`terakhir dilihat ${selisihDetik} detik yang lalu`);
console.log("jam laptop :", new Date(t).toLocaleTimeString("id-ID")); // mengikuti zona waktu laptop
console.log("jam WIB    :", new Date(t).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }), "WIB"); // selalu WIB
```

Simpan (**Ctrl + S**), lalu jalankan `node pemanasan.js`. **Hasilnya (contoh):**

```text
ts: 2026-10-24T08:34:05Z -> 1792830845000
terakhir dilihat 12 detik yang lalu
jam laptop : 16.34.05
jam WIB    : 15.34.05 WIB
```

- **`const ts`** membuat contoh `ts` 12 detik lalu (`12_000` = 12000) tanpa milidetik (`slice(0, 19)`), jadi selisih sebenarnya 12,0–12,9 detik: angkamu kadang `13`.
- **`Date.parse(ts)`** mengubah teks menjadi milidetik sejak 1 Januari 1970 UTC, satuan yang sama dengan **`Date.now()`**. Selisihnya dibagi 1000 = detik.
- **`toLocaleTimeString("id-ID")`** menulis jam gaya Indonesia (pemisah titik) menurut zona **laptop**; dengan **`timeZone: "Asia/Jakarta"`** selalu WIB. Laptop penulis berzona UTC+8 (setara WITA), jadi `jam laptop` satu jam lebih cepat. Di laptop ber-WIB, kedua baris sama.

**Nanti di React:** `jamWib()` di `src/waktu.ts` memakai baris WIB ini. "… yang lalu" ditulis `jamRelatif()` (date-fns), dihitung dari jam saat bacaan **diterima**, bukan dari `ts` perangkat ([Konsep 6](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling), Praktik 3).

### Langkah 2 — Jendela geser 5 menit: tambah, saring, dan buang yang ganda

Grafik *live* hanya memuat 5 menit terakhir: bacaan baru masuk di kanan, yang terlalu tua dibuang di kiri, dan bacaan ganda disisakan satu. Tambahkan:

```js
// 2. Jendela geser 5 menit: tambah titik baru, buang yang terlalu tua, buang yang ganda
const LIMA_MENIT = 5 * 60 * 1000;
const sekarang = Date.now();
const lama = [
  { t: sekarang - 6 * 60 * 1000, suhu: 27.9 }, // 6 menit lalu: sudah di luar jendela
  { t: sekarang - 20_000, suhu: 28.4 },
  { t: sekarang - 10_000, suhu: 28.5 },
];
const baru = [
  { t: sekarang - 10_000, suhu: 28.5 }, // titik yang sama datang dua kali (misalnya dari API dan dari soket)
  { t: sekarang, suhu: 28.7 },
];
const urut = [...lama, ...baru] // ... = salin isi kedua larik ke larik BARU; "lama" tidak diubah
  .filter((p) => p.t >= sekarang - LIMA_MENIT) // hanya 5 menit terakhir
  .sort((a, b) => a.t - b.t); // urut dari yang terlama
const jendela = urut.filter((p, i) => i === 0 || p.t !== urut[i - 1].t); // sesudah diurutkan, yang ganda bersebelahan
console.log("lama:", lama.length, "titik | jendela baru:", jendela.map((p) => p.suhu).join(", "));
```

Simpan, lalu jalankan lagi. **Hasilnya** (baris baru):

```text
lama: 3 titik | jendela baru: 28.4, 28.5, 28.7
```

**`[...lama, ...baru]`** menuang kedua larik (*array*) ke larik **baru** (*spread*, Modul 22), jadi `lama` tetap 3 titik. **`filter`** membuang 27.9 (6 menit lalu) dan **`sort`** mengurutkan dari yang terlama (`a.t - b.t` = kecil ke besar). Sesudah diurutkan, titik berwaktu sama pasti bersebelahan, jadi cukup dibandingkan dengan tetangga kirinya `urut[i - 1]` (`i` = nomor urut, mulai 0): 28.5 tinggal satu.

**Nanti di React:** `gabung()` di `src/toko.ts` mengerjakan hal yang sama setiap bacaan tiba ([Konsep 8](#8-grafik-garis-live-jendela-geser-5-menit), Praktik 4).

### Langkah 3 — Pendengar acara: `on`, `emit`, dan `off`

Socket.IO bekerja dengan **acara** (*event*): `socket.on("telemetry", fungsi)` memasang pendengar yang dipanggil setiap acara itu tiba. Kembarannya di Node.js, **`EventEmitter`**, menjadi soket palsu, dan `emit` berperan sebagai backend. Tambahkan:

```js
// 3. Pendengar acara: on, emit, dan off (kembaran socket.on / socket.off di browser)
const soketPalsu = new EventEmitter();
function tampilkan(deviceId, isi) {
  console.log(`  telemetry ${deviceId}: suhu ${isi.suhu} °C`);
}
soketPalsu.on("telemetry", tampilkan); // pasang pendengar
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.1 }); // tercetak sekali
soketPalsu.on("telemetry", tampilkan); // lupa melepas, lalu memasang lagi (seperti efek tanpa cleanup)
console.log("pendengar telemetry sekarang:", soketPalsu.listenerCount("telemetry"));
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.2 }); // tercetak DUA kali: bacaan tampil ganda
soketPalsu.off("telemetry", tampilkan); // lepas satu, dengan fungsi yang SAMA
soketPalsu.off("telemetry", tampilkan);
console.log("sesudah off dua kali:", soketPalsu.listenerCount("telemetry"));
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.3 }); // tidak ada yang mendengar: tidak tercetak apa pun
```

**Hasilnya** (baris baru):

```text
  telemetry f00d00000001: suhu 28.1 °C
pendengar telemetry sekarang: 2
  telemetry f00d00000001: suhu 28.2 °C
  telemetry f00d00000001: suhu 28.2 °C
sesudah off dua kali: 0
```

**`on`** memasang, **`emit`** mengirim acara ke semua pendengar, **`off`** melepas satu. `tampilkan` terpasang dua kali, jadi 28.2 tercetak **dua kali**: gejala efek tanpa *cleanup*. `off` harus diberi **fungsi yang sama**; sesudah dua kali, 28.3 tak didengar siapa pun.

**Nanti di React:** `src/soket.ts` memasang `socket.on("telemetry", onTelemetry)` di `useEffect`, lalu `socket.off` dengan fungsi yang sama di *cleanup* ([Konsep 3](#3-useeffect-untuk-berlangganan-pasang-pendengar-lepas-di-cleanup), Praktik 2).

### Langkah 4 — Detak jam: `setInterval` dan `clearInterval`, bukan *polling*

Tulisan "12 detik yang lalu" harus bertambah sendiri walau tak ada bacaan baru: cukup jam yang berdetak tiap detik. Tambahkan:

```js
// 4. Detak: setInterval dan clearInterval. Ini JAM di layar, bukan polling: tidak ada yang ditanyakan ke server.
let detak = 0;
const pewaktu = setInterval(() => {
  detak++;
  console.log(`  detak ${detak}: ${new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`);
  if (detak === 3) clearInterval(pewaktu); // tanpa clearInterval, detaknya jalan terus
}, 1000);
await tunggu(3500); // tunggu tiga detak selesai sebelum langkah berikutnya
```

**Hasilnya (contoh)** (baris baru, satu per detik):

```text
  detak 1: 15.34.19 WIB
  detak 2: 15.34.20 WIB
  detak 3: 15.34.21 WIB
```

**`setInterval(fungsi, 1000)`** memanggil fungsinya tiap 1.000 ms sampai dihentikan **`clearInterval(pewaktu)`**; **`await tunggu(3500)`** menahan program sampai ketiga detak selesai. **Bukan *polling*:** isinya hanya membaca jam laptop. *Polling* (bertanya ke server berulang-ulang dengan pengatur waktu) dilarang minggu ini.

**Nanti di React:** `useSekarang()` di `src/waktu.ts` memasang `setInterval` di `useEffect` dan `clearInterval` di *cleanup*, jadi detaknya berhenti saat komponennya hilang dari layar (Konsep 6, [3.1](#31-jam-yang-berdetak-dan-jam-relatif-srcwaktuts-15-menit)).

### Langkah 5 — Teks CSV untuk Excel Indonesia: titik koma dan koma desimal

CSV hanyalah teks, satu baris per data. Saat CSV dibuka dengan klik dua kali, Excel memisahkan kolom dengan **pemisah daftar** setelan regional Windows: untuk Indonesia titik koma `;`, dengan koma desimal. Tambahkan:

```js
// 5. Teks CSV untuk Excel Indonesia: titik koma sebagai pemisah, koma sebagai desimal, dan tanda petik bila perlu
function kutip(teks) {
  // nilai yang memuat ; " atau baris baru dibungkus petik, dan petik di dalamnya digandakan
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}
const baris = [
  ["waktu_wib", "perangkat", "suhu_rata_c"],
  ["2026-10-24 10:00:00", "Node 1; ruang tamu", 28.5],
  ["2026-10-24 11:00:00", 'Node "utama"', 29],
];
const csv = baris
  .map((b) => b.map((nilai) => (typeof nilai === "number" ? String(nilai).replace(".", ",") : kutip(nilai))).join(";"))
  .join("\r\n"); // Excel di Windows memakai CRLF sebagai akhir baris
console.log(csv);
```

**Hasilnya** (baris baru):

```text
waktu_wib;perangkat;suhu_rata_c
2026-10-24 10:00:00;"Node 1; ruang tamu";28,5
2026-10-24 11:00:00;"Node ""utama""";29
```

**`map` dua lapis** (luar per baris, dalam per nilai): angka menjadi teks berkoma (`28,5`), teks lewat `kutip()`, lalu `join(";")` merangkai kolom dan `join("\r\n")` merangkai baris (CRLF, akhir baris gaya Windows). **`kutip()`** membungkus nilai berisi `;`, `"`, atau baris baru dengan petik supaya kolomnya tidak pecah, dan menggandakan petik di dalamnya.

**Nanti di React:** `src/csv.ts` memakai `kutip()` yang sama, ditambah BOM (penanda UTF-8, agar huruf istimewa di nama perangkat, misalnya `°` atau `é`, utuh di Excel) dan sel kosong untuk `null`; tombol **Unduh CSV** menyimpannya ([8.2](#82-srccsvts-dan-tombol-unduh-csv-15-menit)).

Keluaranmu berbeda? Cocokkan ketikanmu dengan [berkas aslinya](kode/pemanasan/pemanasan.js).

<details>
<summary>Isi lengkap <code>pemanasan.js</code></summary>

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 23
// Lima kemampuan kecil yang nanti dipakai lagi di dashboard live: waktu, jendela geser, pendengar acara, detak, dan CSV.
import { EventEmitter } from "node:events";
import { setTimeout as tunggu } from "node:timers/promises";

// 1. Waktu: Date.parse, Date.now, dan jam WIB
// ts dari perangkat berbentuk teks UTC tanpa milidetik, misalnya "2026-10-24T03:15:42Z". Di sini dibuat "12 detik lalu".
const ts = new Date(Date.now() - 12_000).toISOString().slice(0, 19) + "Z";
const t = Date.parse(ts); // teks -> angka: milidetik sejak 1 Januari 1970 (UTC)
const selisihDetik = Math.round((Date.now() - t) / 1000); // Date.now() = sekarang, juga dalam milidetik
console.log("ts:", ts, "->", t);
console.log(`terakhir dilihat ${selisihDetik} detik yang lalu`);
console.log("jam laptop :", new Date(t).toLocaleTimeString("id-ID")); // mengikuti zona waktu laptop
console.log("jam WIB    :", new Date(t).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }), "WIB"); // selalu WIB

// 2. Jendela geser 5 menit: tambah titik baru, buang yang terlalu tua, buang yang ganda
const LIMA_MENIT = 5 * 60 * 1000;
const sekarang = Date.now();
const lama = [
  { t: sekarang - 6 * 60 * 1000, suhu: 27.9 }, // 6 menit lalu: sudah di luar jendela
  { t: sekarang - 20_000, suhu: 28.4 },
  { t: sekarang - 10_000, suhu: 28.5 },
];
const baru = [
  { t: sekarang - 10_000, suhu: 28.5 }, // titik yang sama datang dua kali (misalnya dari API dan dari soket)
  { t: sekarang, suhu: 28.7 },
];
const urut = [...lama, ...baru] // ... = salin isi kedua larik ke larik BARU; "lama" tidak diubah
  .filter((p) => p.t >= sekarang - LIMA_MENIT) // hanya 5 menit terakhir
  .sort((a, b) => a.t - b.t); // urut dari yang terlama
const jendela = urut.filter((p, i) => i === 0 || p.t !== urut[i - 1].t); // sesudah diurutkan, yang ganda bersebelahan
console.log("lama:", lama.length, "titik | jendela baru:", jendela.map((p) => p.suhu).join(", "));

// 3. Pendengar acara: on, emit, dan off (kembaran socket.on / socket.off di browser)
const soketPalsu = new EventEmitter();
function tampilkan(deviceId, isi) {
  console.log(`  telemetry ${deviceId}: suhu ${isi.suhu} °C`);
}
soketPalsu.on("telemetry", tampilkan); // pasang pendengar
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.1 }); // tercetak sekali
soketPalsu.on("telemetry", tampilkan); // lupa melepas, lalu memasang lagi (seperti efek tanpa cleanup)
console.log("pendengar telemetry sekarang:", soketPalsu.listenerCount("telemetry"));
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.2 }); // tercetak DUA kali: bacaan tampil ganda
soketPalsu.off("telemetry", tampilkan); // lepas satu, dengan fungsi yang SAMA
soketPalsu.off("telemetry", tampilkan);
console.log("sesudah off dua kali:", soketPalsu.listenerCount("telemetry"));
soketPalsu.emit("telemetry", "f00d00000001", { suhu: 28.3 }); // tidak ada yang mendengar: tidak tercetak apa pun

// 4. Detak: setInterval dan clearInterval. Ini JAM di layar, bukan polling: tidak ada yang ditanyakan ke server.
let detak = 0;
const pewaktu = setInterval(() => {
  detak++;
  console.log(`  detak ${detak}: ${new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`);
  if (detak === 3) clearInterval(pewaktu); // tanpa clearInterval, detaknya jalan terus
}, 1000);
await tunggu(3500); // tunggu tiga detak selesai sebelum langkah berikutnya

// 5. Teks CSV untuk Excel Indonesia: titik koma sebagai pemisah, koma sebagai desimal, dan tanda petik bila perlu
function kutip(teks) {
  // nilai yang memuat ; " atau baris baru dibungkus petik, dan petik di dalamnya digandakan
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}
const baris = [
  ["waktu_wib", "perangkat", "suhu_rata_c"],
  ["2026-10-24 10:00:00", "Node 1; ruang tamu", 28.5],
  ["2026-10-24 11:00:00", 'Node "utama"', 29],
];
const csv = baris
  .map((b) => b.map((nilai) => (typeof nilai === "number" ? String(nilai).replace(".", ",") : kutip(nilai))).join(";"))
  .join("\r\n"); // Excel di Windows memakai CRLF sebagai akhir baris
console.log(csv);
```

</details>

<details>
<summary>Kunci uji dirimu</summary>

1. **Kalau `ts` = `"2026-10-24T03:15:42Z"`, apa yang dicetak baris `jam WIB`, dan mengapa bukan jam 03?** `10.15.42 WIB`: `Z` berarti UTC, dan WIB = UTC + 7 jam. Karena itu `ts` tak ditampilkan mentah.
2. **Temanmu lupa bahwa `Date.now()` bersatuan milidetik dan menulis `const LIMA_MENIT = 5 * 60;`. Apa yang dicetak?** `lama: 3 titik | jendela baru: 28.7`. Jendelanya hanya 300 ms: cuma titik "sekarang" yang lolos `filter`.
3. **Di kedua baris `off`, ganti `tampilkan` dengan `(deviceId, isi) => tampilkan(deviceId, isi)`. Apa yang berubah?** `sesudah off dua kali: 2`, dan 28.3 tercetak dua kali. Fungsi panah itu fungsi **baru**, bukan `tampilkan`, jadi tak ada yang dilepas. Karena itu `src/soket.ts` memakai fungsi bernama.
4. **Hapus baris `if (detak === 3) clearInterval(pewaktu);`. Apa yang terjadi?** Sesudah baris CSV muncul `detak 4`, `detak 5`, dan seterusnya; program tak pernah selesai sampai kamu menekan **Ctrl + C**. Di React, *cleanup* `useSekarang()` mencegahnya. Kembalikan barisnya.
5. **Ganti `"Node 1; ruang tamu"` dengan `"Node 1, teras"`. Apa baris keduanya, dan mengapa tanpa petik?** `2026-10-24 10:00:00;Node 1, teras;28,5`. Pemisah kita `;`, jadi koma tidak memecah kolom dan `kutip()` membiarkannya. Itu pula sebabnya `28,5` aman.

</details>

## 🏆 Kemenangan Cepat: angka yang bergerak sendiri (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `rumah-pintar-mini` dengan terminal `backend` (port 8080) dan `frontend` (Vite, port 5173), jalur laptop ditambah broker (folder `edge`) dan simulator (folder `alat`); **Docker Desktop**; serta **Chrome atau Edge** dengan DevTools (tab **Network**).

Dashboard v0.1 **bertanya**: angkanya baru berganti kalau detail perangkat dibuka ulang. Sebelum menyentuh React, buktikan dulu bahwa backend-mu sanggup **mendorong** bacaan ke browser: satu halaman HTML polos berisi satu kartu suhu yang berganti sendiri tiap ±10 detik, tanpa tombol dan tanpa *polling*.

### Langkah 1 — Nyalakan semuanya, lalu masuk ke dashboard v0.1 (4 menit)

Sama dengan Modul 22 Praktik 4.1; setiap terminal baru (**Terminal → New Terminal**) mulai di folder `rumah-pintar-mini`.

1. **Database:** nyalakan `rumahpintar-db` di Docker Desktop (tombol **▶**).
2. **Sumber data:** nyalakan Node 1 dan Node 2 (jalur perangkat). Jalur laptop: `cd edge` lalu `mosquitto -v -c mosquitto-lan.conf` (lewati kalau Mosquitto-mu sudah jadi layanan), lalu di terminal lain `cd alat` dan `node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1`; tunggu `f00d00000001: online`.
3. **Backend:** `cd backend` lalu `npm run dev`; tunggu `Server listening at http://127.0.0.1:8080` dan `tersambung ke broker … sebagai backend`.
4. **Dashboard:** `cd frontend` lalu `npm run dev`, buka **`http://localhost:5173`**, dan masuk dengan akun viewer. Biarkan tab ini terbuka: *cookie* *login*-nya dipakai nanti.

### Langkah 2 — Tulis `public/coba-live.html` (6 menit)

Folder `frontend/public` sudah ada sejak Modul 22 (isinya `favicon.svg`). Vite menyajikan isinya apa adanya di `http://localhost:5173/<nama-berkas>`: **satu situs dengan dashboard tempat kamu baru masuk**, jadi halamannya ikut memakai *cookie* itu.

Di panel Explorer VS Code, klik kanan folder **`frontend/public`** → **New File…**, beri nama **`coba-live.html`**, lalu ketik isinya (atau buka [`kode/kemenangan-cepat/coba-live.html`](kode/kemenangan-cepat/coba-live.html) di GitHub, klik **Copy raw file**, lalu tempel).

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Coba live</title>
    <!-- coba-live.html - Kemenangan Cepat Modul 23: angka yang bergerak sendiri, tanpa tombol dan tanpa polling.
         Taruh di frontend/public/, login dulu di dashboard (http://localhost:5173), lalu buka
         http://localhost:5173/coba-live.html. Sesudah selesai, HAPUS berkas ini supaya tidak ikut ke dist/ dan Git
         (semua isi public/ ikut disalin ke dist/ saat build). -->
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; color: #1e293b; background: #f1f5f9; }
      .kartu { max-width: 20rem; padding: 1.5rem; border-radius: 1rem; background: white; border: 1px solid #e2e8f0; }
      .label { margin: 0; color: #64748b; font-size: 0.875rem; }
      .nilai { margin: 0.25rem 0; font-size: 3rem; font-weight: 600; color: #0d9488; }
      .satuan { font-size: 1.25rem; font-weight: 400; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="kartu">
      <p class="label">Suhu <span id="perangkat"></span></p>
      <p class="nilai"><span id="suhu">—</span> <span class="satuan">°C</span></p>
      <p class="label" id="keadaan">Menyambung…</p>
      <p class="label" id="jam"></p>
    </div>

    <!-- pustaka Socket.IO untuk browser, disajikan backend sendiri (tidak perlu npm untuk percobaan ini) -->
    <script src="http://localhost:8080/socket.io/socket.io.js"></script>
    <script>
      const ID = "f00d00000001"; // perangkat latihan Modul 21; Node 1 sungguhan: ganti dengan device_id-nya
      document.getElementById("perangkat").textContent = ID;

      // withCredentials: true = bawa cookie login (dari dashboard di localhost) ke port 8080. Tanpa ini: "belum login".
      const socket = io("http://localhost:8080", { withCredentials: true });

      function tampilkan(isi) {
        document.getElementById("suhu").textContent = isi.suhu ?? "—";
        const jam = new Date(isi.ts).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" });
        document.getElementById("jam").textContent = "bacaan pukul " + jam + " WIB";
      }

      // "connect" terjadi setiap kali tersambung. "ikuti" WAJIB memakai fungsi jawaban (ack):
      // tanpa itu server diam-diam tidak memasukkan kita ke room perangkat.
      socket.on("connect", () => {
        document.getElementById("keadaan").textContent = "Tersambung. Menunggu kiriman berikutnya…";
        socket.emit("ikuti", ID, (jawaban) => {
          if (!jawaban.ok) {
            document.getElementById("keadaan").textContent = "Ditolak: " + jawaban.pesan;
            return;
          }
          if (jawaban.terbaru) tampilkan(jawaban.terbaru); // bacaan terakhir yang diingat backend
        });
      });

      // dikirim server setiap kali perangkat itu mengirim bacaan (sekitar tiap 10 detik)
      socket.on("telemetry", (deviceId, isi) => {
        document.getElementById("keadaan").textContent = "Live: angka ini berganti sendiri.";
        tampilkan(isi);
      });

      socket.on("connect_error", (galat) => {
        document.getElementById("keadaan").textContent = "Belum tersambung: " + galat.message;
      });
      socket.on("disconnect", (alasan) => {
        document.getElementById("keadaan").textContent = "Terputus: " + alasan;
      });
    </script>
  </body>
</html>
```

Simpan (**Ctrl + S**). Empat bagian yang baru:

- **`<script src="http://localhost:8080/socket.io/socket.io.js">`** mengambil pustaka Socket.IO untuk browser dari backend-mu sendiri, jadi tidak perlu `npm install`. Fungsi `io(…)` datang dari situ.
- **`withCredentials: true`**: halaman (port 5173) dan backend (port 8080) berbeda port; tanpa opsi ini browser tidak melampirkan *cookie*, dan backend menolak dengan `belum login`. Inilah kembaran `credentials: "include"` pada `fetch` Modul 22 ([Konsep 2](#2-soket-berkunci-cookie-yang-sama-gelang-yang-sama)).
- **`socket.emit("ikuti", ID, (jawaban) => …)`** meminta masuk ke "kamar" (*room*) perangkat itu di backend. Fungsi jawaban (*ack*) di ujungnya **wajib**: tanpa itu, backend diam-diam tidak memasukkanmu ke kamar. Jawabannya membawa `terbaru`, bacaan terakhir yang diingat backend, jadi angka pertama langsung tampil.
- **`socket.on("telemetry", …)`** adalah pendengar: fungsinya dipanggil **setiap kali** backend mendorong bacaan perangkat itu. Tidak ada tombol atau pengatur waktu.

Jalur perangkat: ganti `f00d00000001` di baris `const ID` dengan `device_id` Node 1-mu (tertulis di kartu Daftar Perangkat, sesudah lokasinya).

### Langkah 3 — Buka halamannya: angka berganti sendiri (3 menit)

Di tab baru pada browser yang sama, buka **`http://localhost:5173/coba-live.html`**, lalu jangan sentuh apa pun selama ±30 detik.

**Hasilnya (contoh):** kartu `Suhu f00d00000001` langsung menampilkan bacaan terakhir dari jawaban `ikuti`:

```text
33 °C
Tersambung. Menunggu kiriman berikutnya…
bacaan pukul 15.53.51 WIB
```

±10 detik kemudian, tanpa diklik, angka, keadaan, dan jamnya berganti:

```text
31.1 °C
Live: angka ini berganti sendiri.
bacaan pukul 15.54.01 WIB
```

Lalu `25.5 °C` (15.54.11 WIB), `27.5`, `26.9`, `31.5` (15.54.41 WIB), dan seterusnya. Angka dan jammu pasti berbeda. Kalau backend baru dinyalakan ulang, `terbaru` masih kosong: angkanya `—` sampai kiriman berikutnya. Masih `—` sesudah 20 detik? Periksa pengirimnya dan `const ID` (ID keliru berformat sah tidak ditolak, hanya tak pernah dikirimi).

Itulah **didorong**: browser tidak bertanya lagi, backend yang mengirim begitu bacaan tiba.

> [!TIP]
> Tertulis `Belum tersambung: belum login`, atau `Terputus: io server disconnect` di tengah jalan? Gelang 15 menit dari *login*-mu habis, atau kamu belum masuk. Tekan **F5** di tab dashboard (`http://localhost:5173`), masuk lagi kalau formulir *login* muncul, lalu **F5** di halaman ini. Tertahan di `Menyambung…`? Backend belum menyala, jadi `socket.io.js` gagal dimuat. Yang tampil dashboard biasa? Vite tidak menemukan berkasnya: periksa nama dan letaknya di `frontend/public`. `xhr poll error` ada di [🚨](#-kalau-tidak-jalan).

### Langkah 4 — Intip pesannya di tab Network (5 menit)

1. Di tab `coba-live.html`, buka DevTools (**F12**), klik tab **Network**, lalu tekan **F5**: tab **Network** hanya mencatat selama DevTools terbuka.
2. Klik saringan jenis **Socket** (di versi lama **WS**). Tersisa satu baris `socket.io/?EIO=4&transport=…`: satu sambungan WebSocket yang tetap terbuka.
3. Klik baris itu, lalu tab **Messages**. Tunggu ±30 detik.
4. Klik baris `42["telemetry", …]` paling bawah (terbaru).

**Hasilnya (contoh, Edge 156):** tabel berkolom **Data**, **Length**, dan **Time** diawali baris `2probe`, `3probe`, dan `5` (sambungan naik dari *long-polling* ke WebSocket), lalu satu baris tiap ±10 detik dengan panah merah ↓ (diterima; hijau ↑ = dikirim browser), misalnya:

```text
42["telemetry","f00d00000001",{"ts":"2026-10-24T08:54:01Z","fw":"0.1.0","suhu":31.1,"kelembapan":57,…
```

Di sela-selanya ada `2` dan `3` kecil: detak *ping*/*pong* penjaga sambungan, bukan data. Baris yang diklik terurai menjadi pohon `0: "telemetry"`, `1: "f00d00000001"`, `2: {ts: "2026-10-24T08:54:41Z", fw: "0.1.0", suhu: 31.5, …}`: `suhu` sama dengan angka di halaman, dan `ts` (jam UTC, akhiran `Z`) ditambah 7 jam menjadi `bacaan pukul 15.54.41 WIB`.

![Komposit tangkapan layar asli Kemenangan Cepat: angka yang didorong, terlihat di DevTools (Edge, laptop 1280 px, bacaan simulator lab). Atas, halaman coba-live.html sesudah login: Suhu f00d00000001 31.5 °C, Live: angka ini berganti sendiri, bacaan pukul 15.54.41 WIB (penanda 1). Bawah, DevTools tab yang sama: tab Network dan saringan Socket aktif (penanda 2), satu baris socket.io/?EIO=4&transport=… di kolom Name (penanda 3), tab Messages aktif (penanda 4) dengan kolom Data, Length, Time: 2probe, 3probe, 5, lalu pesan 42 telemetry f00d00000001 suhu 31.1 pukul 15:54:01 (penanda 5), suhu 25.5, 27.5, 26.9, dan 31.5 pukul 15:54:42 yang diklik, diselingi pesan kecil 2 dan 3 (penanda 6). Paling bawah, isi pesan terpilih sebagai pohon: telemetry, f00d00000001, ts 2026-10-24T08:54:41Z, fw 0.1.0, suhu 31.5, kelembapan 66, cahaya 3191, tanah 42 (penanda 7). Keterangan: 1 angka berganti sendiri tiap kiriman ±10 detik, jam = ts perangkat dalam WIB; 2 di DevTools lama tombolnya bernama WS; 3 satu sambungan WebSocket yang tetap terbuka; 4 panah merah ke bawah = diterima, hijau ke atas = dikirim browser; 5 didorong backend tanpa polling; 6 2 dan 3 = detak ping/pong, bukan data; 7 nama acara, device_id, bacaan; suhu 31.5 = angka halaman.](aset/ws-messages-kemenangan-cepat.png)

`ikuti` dan jawabannya kadang tidak tampil di **Messages** (terkirim sebelum sambungan naik ke WebSocket); itu wajar. Sesekali muncul `42["status", …]`: perubahan status perangkat **mana pun**, dikirim ke semua yang tersambung. *Long-polling* di awal adalah cara pustaka membuka sambungan, bukan *polling* yang kita larang; arti `42`, `2`, dan `3` ada di [🔬](#-bedah-teknis-opsional) (*Dari polling ke WebSocket*).

### Langkah 5 — Hapus `coba-live.html` (2 menit)

Halaman ini hanya alat peraga. Semua isi `public/` ikut tersalin ke `dist/` saat `npm run build`, dan berkas percobaan tidak boleh masuk Git ([➕ C](#c-tambahkan-butir-modul-23-ke-templat-pull-request) memeriksanya).

1. Tutup DevTools dan tab `coba-live.html` (soketnya ikut tertutup).
2. Di panel Explorer VS Code, klik kanan **`frontend/public/coba-live.html`** → **Delete**, lalu setujui konfirmasinya.
3. Buka lagi `http://localhost:5173/coba-live.html`.

**Hasilnya:** yang tampil dashboard biasa (judul tab `Rumah Pintar Mini`), bukan kartu suhu, karena Vite tidak menemukan berkasnya lagi. Di `frontend/public` tinggal `favicon.svg`.

Dalam 20 menit, browser-mu menerima bacaan yang **didorong** backend lewat satu sambungan, dengan *cookie* *login* yang sama dengan `fetch`. Namun, halaman tadi tidak tahu cara pulih: begitu gelang 15 menit habis, backend memutusnya (`io server disconnect`) dan ia tidak menyambung lagi sendiri. Memindahkan soket ke dashboard React, lengkap dengan cara pulihnya, adalah tugas minggu ini.

> ➡️ **Berikutnya:** baca [Konsep 1–2](#1-didorong-bukan-bertanya-data-live-lewat-socketio), lalu kerjakan [Praktik 1 — Soket berkunci dari browser](#praktik-1--soket-berkunci-dari-browser-45-menit).

## 🧠 Konsep "Mengapa"

Dua belas konsep ini tidak perlu dibaca sekaligus. Bacalah berpasangan dengan praktiknya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–2 → Praktik 1 (soket berkunci dari browser)
2. Konsep 3–4 → Praktik 2 (toko Zustand: angka bergerak sendiri)
3. Konsep 6–7 → Praktik 3 (kartu status merah/hijau dan "terakhir dilihat")
4. Konsep 8 → Praktik 4 (grafik garis *live* 5 menit)
5. Konsep 9–10 → Praktik 5 (*gauge*, visual jujur, dan mode gelap)
6. Konsep 5 → Praktik 6 (ukur dulu: jangan menggambar ulang 10× per detik)
7. Konsep 11 → Praktik 7 (riwayat 1 jam, 24 jam, dan 7 hari) dan Praktik 8 (tabel berhalaman dan ekspor CSV)
8. Konsep 12 → Praktik 9 (dashboard di HP lewat WiFi rumah) dan Praktik 10 (uji kelulusan)

Konsep 5 dibaca **sesudah** Praktik 5, tepat sebelum Praktik 6: saat itu dashboard-mu sudah punya grafik dan *gauge* yang bisa diukur. Praktik 1 sudah memakai toko kecil dan `useCallback`; penjelasan singkatnya ada di praktik itu, dan toko lengkapnya di Konsep 4. Potongan kode di bagian konsep cukup dibaca; semuanya ditulis dan dijalankan di praktik.

### 1. Didorong, bukan bertanya: data *live* lewat Socket.IO

Dashboard v0.1 **bertanya**. Begitu Daftar atau Detail tampil, efeknya mengirim satu `GET`, lalu diam. Angka di layar adalah foto dari saat pertanyaan itu dijawab. Untuk angka yang lebih baru, kamu harus bertanya lagi: membuka ulang detailnya, atau mengetuk tombol **Muat ulang** buatanmu di [🧩 Tingkat 2 Modul 22](../modul-22-react-dasar/README.md#tingkat-2--tombol-muat-ulang-isi-bagian-rumpang-45-menit).

Ada tiga cara membuat layar mengikuti bacaan baru:

| Cara | Siapa yang memulai | Bacaan baru sampai di layar | Dipakai? |
| :--- | :--- | :--- | :--- |
| **Bertanya sekali** (v0.1, tombol **Muat ulang**) | dashboard, saat layar dibuka atau tombol diketuk | saat kamu bertanya lagi | hanya v0.1 |
| ***Polling***: bertanya berulang-ulang dengan pengatur waktu (`setInterval` + `fetch`) | dashboard, tiap beberapa detik | pada pertanyaan berikutnya, jadi terlambat sampai satu jeda; hampir semua jawabannya "belum ada yang baru", dan setiap tab atau HP menambah beban backend | **tidak**, dilarang di modul ini; `setInterval` hanya menggerakkan jam di layar (Konsep 6) |
| **Didorong** (v0.2, Socket.IO) | dashboard menyambung sekali, lalu backend yang mengirim | begitu backend menerima bacaan dari broker | **ya** |

*Polling* seperti bolak-balik memeriksa kotak surat; Socket.IO seperti telepon yang dibiarkan tersambung ([Modul 19 Konsep 1](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#1-websocket-telepon-bukan-kotak-surat)); sambungan yang tetap terbuka itu disebut **soket**. Backend-mu sudah "menelepon" sejak Modul 19: setiap bacaan yang lolos kontrak data langsung disiarkan, sebelum ditulis ke database. `alat/terminal-live.js` mendengarkannya di terminal, `coba-live.html` di Kemenangan Cepat mendengarkannya di browser, dan minggu ini dashboard React ikut mendengarkan, dengan acara yang sama.

**Seberapa cepat?** Di lab riset penulis (backend dan broker di laptop yang sama), perjalanan dari broker sampai acara tiba di klien hanya ±3–5 milidetik. Yang menentukan adalah **kapan perangkat mengirim**: Node 1 mengirim tiap 10 detik, ditambah **kiriman segera** saat keadaan penting berubah, misalnya terang menjadi gelap (*report-by-exception*, Modul 11). Karena itu, menutup LDR di ruangan yang terang membuat grafik berubah dalam ≈ 1–2 detik, sedangkan suhu yang naik pelan baru tampak pada kiriman terjadwal berikutnya. Simulator tidak punya kiriman segera untuk sensor: `suhu 33` muncul pada kiriman berikutnya (0–10 detik), sedangkan perintah lampu dari Bruno memicu kiriman segera.

**Acara Modul 19, tanpa ganti nama.** Pesan bernama di Socket.IO disebut **acara** (*event*). Dashboard memakai acara yang sama dengan terminal kecil Modul 19:

| Acara | Arah | Untuk siapa | Isi |
| :--- | :--- | :--- | :--- |
| `ikuti` | dashboard → backend | — | `device_id` yang ingin diikuti. Backend memasukkan soketmu ke kamar (*room*) perangkat itu ([Modul 19 Konsep 2](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#2-room-satu-saluran-untuk-setiap-perangkat)), lalu menjawab `{ ok, terbaru }`. |
| `berhenti` | dashboard → backend | — | keluar dari kamar perangkat itu, tanpa jawaban |
| `telemetry` | backend → dashboard | hanya kamar perangkat itu | **dua** nilai berurutan, `(deviceId, isi)`, bukan satu objek |
| `status` | backend → dashboard | semua yang tersambung | `(deviceId, status)`: `online`, `offline`, atau `offline-mode` (milik Modul 28); dikirim hanya saat status perangkat berubah |
| `kejadian` | backend → dashboard | semua yang tersambung | satu baris baru buku kejadian Modul 19, misalnya perangkat terputus atau tersambung lagi; v0.2 belum memakainya (dipakai di 🧩 Tingkat 2) |

Tiga sifat acara ini menentukan bentuk kode minggu ini:

- **`ikuti` wajib dengan jawaban (*ack*).** Backend mengabaikan `ikuti` yang dikirim tanpa fungsi jawaban. Tidak ada galat; kamu hanya tidak pernah menerima `telemetry`. Dashboard memakai `socket.timeout(5000).emitWithAck("ikuti", id)`: kirim, lalu tunggu jawabannya paling lama 5 detik. Jawaban Socket.IO ini hanya berarti "backend menerima permintaanmu", bukan `ack` MQTT dari perangkat (Modul 19).
- **`terbaru` adalah angka awal.** Acara hanya membawa bacaan **baru**. Supaya kartu tidak kosong selama menunggu kiriman berikutnya, jawaban `ikuti` membawa bacaan terakhir yang diingat backend. Ingatan itu tinggal di memori backend, jadi sesudah backend dimulai ulang isinya `null` sampai perangkat mengirim lagi (penggantinya di Konsep 8).
- **Yang terlewat saat putus tidak dikirim ulang.** Backend v1.0 tidak menyimpan acara untuk soket yang sedang putus. Setiap kali tersambung lagi, dashboard mengirim ulang `ikuti` dan mengisi ulang grafik 5 menit dari API, **sekali** per sambungan, bukan tiap sekian detik; itu bukan *polling*. Status yang berubah selama putus tidak ikut disusulkan ([🔬](#-bedah-teknis-opsional) *Dua batasan v0.2*).

**Mengapa tidak langsung ke broker?** Sejak Modul 19, browser tidak dibiarkan berlangganan broker. Dashboard hanya bicara dengan backend, dan backend-lah yang memeriksa kontrak data, membuang kiriman perangkat yang kuncinya dicabut atau belum terdaftar (Modul 21), serta memeriksa gelang penggunanya (Modul 20). Klien MQTT di browser tidak dipakai di kurikulum ini.

**Dari HTTP biasa ke WebSocket.** Setiap sambungan Socket.IO dimulai dengan permintaan HTTP biasa (alamatnya memuat `transport=polling`), lalu naik ke WebSocket begitu bisa. Bingkai `2probe`, `3probe`, dan `5` di tab **Network** saat Kemenangan Cepat adalah tanda naik itu. Kata *polling* di alamat tadi adalah cara pustaka membuka sambungan dan jalan cadangannya, bukan dashboard yang menanyakan data tiap beberapa detik; rinciannya di [🔬](#-bedah-teknis-opsional) (*Dari polling ke WebSocket*).

Arah dorongannya satu: dari backend ke layar. Dashboard v0.2 hanya mengirim `ikuti` dan `berhenti`; tombol yang memerintah perangkat dibuat di Modul 24. Tiga cara di atas dirangkum di bagian atas gambar Konsep 2.

### 2. Soket berkunci: *cookie* yang sama, gelang yang sama

Sejak Modul 20, pintu Socket.IO punya penjaga sendiri, **penjaga pintu aula** ([Modul 20 Konsep 10](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#10-socketio-ikut-dikunci-pintu-aula-memakai-gelang-yang-sama)). Setiap sambungan diawali ***handshake*** (jabat tangan) lewat HTTP biasa, dan penjaga itu membaca *cookie* `akses` (gelang 15 menit) dari permintaan tersebut. Tanpa gelang, ia menolak dengan `belum login`; gelang rusak atau kedaluwarsa ditolak dengan `sesi habis atau tidak sah: refresh atau login lagi`. Kartu terusan `sesi` tidak ikut ke `/socket.io/` (jalurnya hanya `/auth`), jadi soket hanya mengandalkan gelang.

**`withCredentials: true` adalah `credentials: "include"` untuk soket.** Halaman di `localhost:5173` dan backend di `localhost:8080` berbeda asal ([Modul 22 Konsep 9](../modul-22-react-dasar/README.md#9-login-dari-browser-cookie-cors-dan-localhost)). Seperti `fetch`, Socket.IO di browser tidak membawa *cookie* ke asal lain kecuali diminta. Satu baris di `src/soket.ts` (Praktik 1.4) memintanya:

```ts
export const socket: Socket<KeKlien, DariKlien> = io(BASE, { withCredentials: true, autoConnect: false });
```

- **`withCredentials: true`**: bawa *cookie* *login*. Tanpa ini, *handshake* tiba tanpa gelang dan dijawab `belum login`, padahal daftar perangkat tampil karena `fetch` membawa *cookie*-nya ([🚨](#-kalau-tidak-jalan)).
- **`BASE`** sama dengan milik `src/api.ts` (Praktik 1.3). Halaman di `localhost` menyambung ke `localhost:8080`; di mode HP, halaman `http://<IP-laptop>:5173` otomatis menyambung ke `http://<IP-laptop>:8080`. Izin asalnya juga satu daftar, `CORS_ORIGIN`, untuk `fetch` dan soket. Asal yang tidak terdaftar tidak menghasilkan `belum login`, tetapi `xhr poll error` yang berulang tanpa henti (Konsep 12).
- **`autoConnect: false`**: jangan menyambung saat berkas dimuat; tunggu sampai *login* berhasil.
- **`io(…)` dipanggil sekali, di luar komponen**, jadi seluruh dashboard memakai **satu** soket, berapa pun layar yang terbuka. `Socket<KeKlien, DariKlien>` memberi TypeScript daftar acara beserta isinya, disalin dari backend (`realtime.ts`).

**Putus itu biasa; yang penting, siapa yang menyambung lagi.** Penjaga pintu aula hanya memeriksa sekali, di pintu, jadi backend sendiri yang memutus sambungan saat gelangnya habis. Ditambah WiFi yang putus dan backend yang dimulai ulang, sambungan dashboard pasti putus berkali-kali dalam sehari. Acara `disconnect` membawa **alasan**, dan alasan itulah yang menentukan langkah berikutnya:

| No. | Kejadian | Alasan di `disconnect` | Siapa menyambung lagi (`src/soket.ts`) | Lencana |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Gelang 15 menit habis: server memutus tepat 900 detik sesudah gelang dibuat | `io server disconnect` | Socket.IO tidak menyambung sendiri untuk alasan ini. Dashboard memanggil `refreshSekali()` (`POST /auth/refresh`), hasilnya `true`, lalu `socket.connect()`. | **Menyambung ulang…** → **Live** |
| 2 | Tombol **Keluar** di tab ini | `io client disconnect` | Tidak ada: `socket.disconnect()` dulu, baru `POST /auth/logout` (kalau terbalik, server yang memutus, lalu soket mencoba menyambung lagi) | **Terputus** → layar *login* |
| 2 | **Keluar** di tab lain | `io server disconnect` | `refreshSekali()` → `false` (ditolak) → layar *login* `Sesi sudah habis. Silakan masuk lagi.` | **Menyambung ulang…** → layar *login* |
| 3 | Backend berhenti dengan rapi: **Ctrl + C** pada `npm start` (pada `npm run dev` di Windows: kadang di sini, kadang di no. 4) | `io server disconnect` | `refreshSekali()` → `null` (backend belum bisa melayani) → `socket.connect()`, lalu Socket.IO mencoba sendiri tiap 1–5 detik sampai backend menyala | **Menyambung ulang…** → **Live** |
| 4 | WiFi putus, backend mati mendadak (**Ctrl + C** `npm run dev` di Windows: kadang di sini, kadang di no. 3), atau dimulai ulang oleh `--watch` | `transport close` | Socket.IO sendiri, berjeda ±1 detik yang memanjang sampai paling lama 5 detik; kode kita hanya mengganti lencana | **Menyambung ulang…** → **Live** |

Satu jalan lagi: **ditolak penjaga pintu** saat menyambung, misalnya karena browser sudah membuang gelangnya. Acaranya `connect_error`, dan `socket.active` bernilai `false` (Socket.IO tidak akan mencoba sendiri). Dashboard me-*refresh*, lalu menyambung lagi. Kalau tetap ditolak walau sudah tiga kali *refresh* berturut-turut (misalnya database mati, jadi loket *refresh* tidak bisa memberi gelang baru), lencana berhenti di **Terputus** dan tidak mencoba lagi. Tidak ada tombol "coba lagi": bereskan sebabnya, lalu muat ulang halaman (**F5**). Kalau `socket.active` masih `true` (backend mati, atau asal halaman tidak diizinkan), Socket.IO terus mencoba sendiri. Begitu tersambung (acara `connect`), hitungan gagal kembali nol, lencana **Live**, semua perangkat di-`ikuti` ulang (kamar hilang setiap kali putus), dan grafik 5 menit diisi ulang dari API.

![Diagram soket berkunci: putus, lalu siapa yang menyambung lagi (Konsep 1–2); satu soket untuk seluruh dashboard, io(BASE, { withCredentials: true, autoConnect: false }). Atas, Konsep 1, dari mana angka baru datang, tiga panel garis waktu browser dan backend: bertanya sekali (v0.1), satu GET, angka diam sampai layar dibuka lagi; polling (tidak dipakai), bertanya terus-menerus, sering sia-sia; dan berbingkai ungu, didorong (v0.2), sekali sambung lalu backend mendorong acara telemetry. Tengah, Konsep 2, lencana koneksi (LencanaKoneksi): sesudah login berhasil dan socket.connect(), lencana jingga Menyambung ulang…, lalu connect ke lencana hijau Live, dan Keluar (sebab 2) ke lencana merah Terputus. Putus karena sebab 1, 3, atau 4 kembali ke Menyambung ulang… untuk mencoba lagi; ditolak penjaga pintu walau sudah 3 kali refresh berakhir di Terputus. Tabel empat sebab putus, dengan kolom alasan di disconnect, siapa menyambung lagi (soket.ts), dan lencana. 1, gelang 15 menit habis, server memutus tepat 900 detik sesudah gelang dibuat: io server disconnect, server sengaja memutus dan Socket.IO tidak menyambung sendiri; dashboard memanggil refreshSekali() (POST /auth/refresh), hasil true, lalu socket.connect(); uji penulis: tepat satu refresh; Menyambung ulang… lalu Live. 2, tombol Keluar di tab ini: io client disconnect; socket.disconnect() dulu, baru POST /auth/logout; Terputus lalu layar login. Keluar di tab lain: io server disconnect; refreshSekali() hasil false (ditolak), lalu layar login bertuliskan sesi sudah habis; Menyambung ulang… lalu layar login. 3, Ctrl+C npm start, backend dimatikan dengan rapi (Ctrl+C npm run dev di Windows: kadang di sini, kadang di no. 4): io server disconnect, server memutus semua soket; refreshSekali() hasil null (backend belum bisa melayani), lalu socket.connect(), dan Socket.IO mencoba sendiri tiap 1–5 detik sampai backend menyala lagi; Menyambung ulang… lalu Live. 4, WiFi putus, backend mati mendadak (Ctrl+C npm run dev di Windows: kadang di sini, kadang di no. 3), atau dimulai ulang oleh --watch: transport close; Socket.IO sendiri mencoba lagi berjeda ±1 detik sampai paling lama 5 detik, kode kita hanya mengganti lencana; Menyambung ulang… lalu Live. Kiri bawah, begitu tersambung lagi (connect): hitungan gagal kembali 0, lencana Live; ikuti ulang semua perangkat dengan jawaban (ack), karena room (saluran tiap perangkat) hilang setiap kali putus; grafik 5 menit diisi ulang dari API. Kanan bawah, ditolak penjaga pintu (connect_error), belum login atau sesi habis: refresh lalu sambung lagi; refresh ditolak (false) berarti layar login; ditolak lagi walau sudah 3 kali refresh berarti Terputus, muat ulang halaman (F5). Pita bawah: refresh dulu, baru sambung, karena penjaga pintu Socket.IO hanya melihat gelang 15 menit, sedangkan /auth/refresh memeriksa sesi di database, jadi tab yang sudah logout tidak ikut tersambung lagi.](aset/siklus-soket.png)

**Tiga jawaban `refreshSekali()`.** Di Modul 22, `refreshSekali()` hanya menjawab berhasil atau gagal ([Modul 22 6.5](../modul-22-react-dasar/README.md#65-gelang-habis-refresh-sekali-di-apits-10-menit)). Soket perlu tahu **mengapa** gagal, jadi Praktik 1.3 membuatnya menjawab tiga kemungkinan; `minta()` tetap bekerja seperti dulu.

| Jawaban | Artinya | Lanjutannya di soket |
| :--- | :--- | :--- |
| `true` | loket `/auth/refresh` memberi gelang baru (200) | `socket.connect()` |
| `false` | ditolak (401): kartu terusan habis, atau sesi itu sudah **Keluar** | layar *login* |
| `null` | backend tidak bisa dihubungi, atau sedang gangguan (misalnya 500 saat database mati) | `socket.connect()`; selama backend mati, Socket.IO mencoba sendiri |

**Mengapa *refresh* dulu, baru menyambung?** Kedengarannya lebih sederhana untuk langsung `socket.connect()` setiap kali server memutus. Masalahnya, penjaga pintu aula hanya melihat gelang 15 menit dan tidak tahu kamu baru saja **Keluar** di tab lain: gelang lama di tab ini masih sah sampai umurnya habis. Loket `/auth/refresh` memeriksa sesi di database, jadi tab yang sesinya sudah dihapus dijawab 401 dan kembali ke layar *login*. Dengan jaringan yang diperlambat (seperti lewat WiFi), cara "langsung sambung" di uji penulis membuat tab yang sudah **Keluar** tetap **Live** di setiap percobaan: soket tersambung lagi sebelum browser membuang gelangnya. "*Refresh* dulu" lolos di setiap percobaan, begitu pula di uji gelang habis, **Ctrl + C** backend, simpan berkas (`--watch`), dan tiga kali gagal beruntun.

**Lencana: angka yang basi harus tampak basi.** `LencanaKoneksi` di kepala halaman menampilkan tiga keadaan sambungan: **Live** (hijau), **Menyambung ulang…** (jingga), dan **Terputus** (merah). Selama lencana bukan **Live**, angka di layar mungkin sudah lama; Praktik 3 menambah tulisan "sambungan live terputus, angka ini mungkin sudah basi" di Detail. **Ctrl + C** pada `npm run dev` backend di Windows **kadang** berhenti rapi (log `SIGINT diterima: backend berhenti dengan rapi`), **kadang** mati mendadak tanpa log; di uji penulis, dashboard pulih sendiri di keduanya, beberapa detik sesudah backend siap. Kamu mencoba jalur-jalur ini di [1.5](#15-sambung-sesudah-login-putus-sebelum-keluar-lencanakoneksi-10-menit) dan [1.6](#16-uji-sambungannya-satu-soket-putus-sambung-dan-keluar-10-menit); kalau lencana macet, buka [🚨](#-kalau-tidak-jalan) *Lencana `Menyambung ulang…` …* atau *Lencana `Terputus` …*.

> ⬆️ **Sudah membaca Konsep 1–2?** Lanjut ke [Praktik 1 — Soket berkunci dari browser](#praktik-1--soket-berkunci-dari-browser-45-menit). Konsep 3–4 dibaca sebelum Praktik 2.

### 3. `useEffect` untuk berlangganan: pasang pendengar, lepas di *cleanup*

Di Modul 22, efek mengambil data sekali, dan *cleanup*-nya cukup menyalakan `ignore` ([Modul 22 Konsep 8](../modul-22-react-dasar/README.md#8-useeffect-dan-fetch-mengambil-data-sesudah-layar-tampil)). Berlangganan berbeda: yang dipasang efek **tetap hidup** sampai dilepas. Pendengar yang lupa dilepas terus menerima acara, dan setiap kali efek berjalan lagi, pendengar baru bertambah, sehingga setiap bacaan masuk dua kali, tiga kali, dan seterusnya (ingat `pendengar telemetry sekarang: 2` di 🔁 Langkah 3). Karena itu, setiap yang dipasang punya pasangan pelepasnya:

| Dipasang saat efek berjalan | Dilepas di *cleanup* |
| :--- | :--- |
| `socket.on("telemetry", onTelemetry)` | `socket.off("telemetry", onTelemetry)` |
| `socket.connect()` | `socket.disconnect()` |
| `ikuti` untuk setiap perangkat | `berhenti` untuk perangkat yang sama |

Inilah kerangka efek sambungan di `useRealtime()` versi akhir (`src/soket.ts`; `…` = baris yang dilewati):

```ts
useEffect(() => {
  if (!sudahLogin) return;
  …
  function onTelemetry(deviceId: string, isi: Telemetry) {
    useToko.getState().terima(deviceId, isi);
  }
  …
  socket.on("telemetry", onTelemetry);
  …
  socket.connect();
  return () => {
    …
    socket.off("telemetry", onTelemetry);
    …
    socket.disconnect();
  };
}, [sudahLogin, onSesiHabis]);
```

Empat aturan yang dijaga kerangka ini:

1. **Pendengar adalah fungsi bernama**, dan dilepas dengan fungsi yang sama. `socket.off("telemetry")` tanpa fungsi melepas **semua** pendengar acara itu, termasuk milik bagian lain dashboard.
2. **Pendengar dipasang sekali, tidak di dalam penangan `connect`.** `connect` terjadi lagi setiap kali tersambung ulang, jadi pendengar yang dipasang di sana bertambah satu di setiap putus-sambung. Yang memang dikirim di dalam `connect` adalah `ikuti`, karena kamar hilang setiap kali putus.
3. **`ikuti` selalu menunggu jawaban** (`emitWithAck` dengan batas 5 detik, Konsep 1).
4. **Pendengar hanya meneruskan.** `onTelemetry` menyerahkan bacaan ke toko lewat `useToko.getState().terima(…)`, karena pendengar dipanggil soket, di luar gambar ulang React; komponen membacanya dari toko (Konsep 4).

**Dua efek, dua tugas.** `useRealtime()` dipanggil **sekali**, di `App`. Efek pertama (di atas) menjaga **sambungan** selama *login*. Efek kedua menjaga **langganan**: `ikuti` untuk setiap perangkat yang kirimannya diterima backend (kunci `aktif` atau `tanpa-kunci`), `berhenti` di *cleanup*. Dashboard mengikuti semua perangkat itu selama *login*, bukan per layar: backend mencatat kamar per **soket**, bukan per komponen, jadi `berhenti` dari satu layar akan ikut mencabut langganan layar lain. Bebannya kecil (sekitar satu acara per 10 detik untuk setiap perangkat), dan Daftar memang butuh semuanya untuk "terakhir dilihat". Efek ini bergantung pada `daftarId`, satu **teks** berisi `device_id` yang dipisah koma, jadi `ikuti`/`berhenti` hanya diulang saat daftar perangkatnya berganti, bukan setiap kali `telemetry` tiba.

**`StrictMode`: gladi bersih untuk langganan.** Modul 22 berjanji gladi ini "makin berharga" minggu ini ([🔬 Modul 22](../modul-22-react-dasar/README.md#-bedah-teknis-opsional)). Di mode pengembangan, efek sambungan berjalan **sambung → putus → sambung**. Karena soketnya dibuat sekali di luar komponen dan *cleanup*-nya melepas pendengar serta memutus sambungan, hasil akhirnya tetap **satu** sambungan dengan satu set pendengar: di uji penulis, log backend mencatat `GET /devices` dua kali, tetapi `klien realtime tersambung` hanya sekali ([1.6](#16-uji-sambungannya-satu-soket-putus-sambung-dan-keluar-10-menit)). Kalau `io()` dibuat di dalam efek tanpa *cleanup*, uji riset penulis mendapati dua soket hidup bersamaan ([🚨](#-kalau-tidak-jalan) *Setiap bacaan tampil dua kali …*). Jadi, jangan hapus `<StrictMode>`; ia yang pertama memergoki efek yang lupa membereskan diri.

**`useCallback`: fungsi yang sama di setiap gambar ulang.** Daftar di ujung efek sambungan memuat `onSesiHabis`, fungsi `App` yang kembali ke formulir *login*. Fungsi yang ditulis biasa di badan komponen adalah fungsi **baru** setiap kali `App` digambar ulang, misalnya saat pindah layar, sehingga efeknya diulang: sambungan diputus, lalu disambung lagi. `useCallback(…, [])` membuat React memberikan fungsi yang **sama** setiap kali (Praktik 1.5).

### 4. Satu toko untuk semua layar: Zustand dan selektor

Satu bacaan `telemetry` dibutuhkan banyak tempat sekaligus: suhu dan "terakhir dilihat" di kartu Daftar, kartu sensor dan *gauge* di Detail, titik baru di grafik. Di Modul 22, data tinggal di **papan tulis kecil** (*state*) milik satu komponen, dan data bersama dipindah ke induk lalu dititipkan turun ([Modul 22 Konsep 7](../modul-22-react-dasar/README.md#7-state-dan-usestate-layar-yang-ingat)). Untuk data *live*, cara itu mahal: kalau papannya di `App`, setiap bacaan membuat `App` beserta seluruh anaknya digambar ulang. React Context, cara bawaan React berbagi data tanpa titipan berantai, serupa: setiap komponen pembacanya ikut digambar ulang setiap kali nilainya berganti (perbandingan dengan Redux di [🔬](#-bedah-teknis-opsional)).

**Toko adalah papan pengumuman bersama.** **Zustand** 5.0.16 (±0,8 kB gzip di hasil *build*) menyediakan **toko** (*store*): satu papan pengumuman di luar React yang boleh dibaca layar mana pun. Pendengar soket menulis ke papan lewat `useToko.getState()`; komponen membacanya lewat **selektor** (*selector*), fungsi kecil yang hanya membaca baris yang ia perlukan. Potongan `src/toko.ts`:

```ts
export const useToko = create<Toko>()((set) => ({
  koneksi: "terputus",
  …
  setKoneksi: (koneksi) => set({ koneksi }),
  …
  // acara "status": dikirim server hanya saat status perangkat berubah
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),
  …
}));
```

- **`create<Toko>()(…)`**: kurung ganda memang cara menulisnya di TypeScript (Zustand 5); `Toko` adalah tipe isi papan beserta aksinya.
- **Isi dan aksi tinggal bersama.** `koneksi`, `status`, `terbaru`, … adalah isinya; `setKoneksi`, `setStatus`, `terima`, … adalah aksi yang mengubahnya.
- **`set` menggabung, tetapi hanya satu tingkat.** `set({ koneksi })` mengganti `koneksi` dan membiarkan isi lain. Kamus per perangkat (`status`, `terbaru`, …) harus **disalin** dulu, lalu ditambah: `{ ...s.status, [deviceId]: status }`. Ini aturan Modul 22 "ganti papannya, jangan dicoret": isi yang diubah di tempat tidak dikenali sebagai perubahan.

**Selektor: baca satu baris saja.** Dua contoh, dari `LencanaKoneksi` dan dari kartu setiap perangkat di Daftar:

```ts
const koneksi = useToko((s) => s.koneksi);
const suhu = useToko((s) => s.terbaru[p.device_id]?.suhu); // undefined = belum ada bacaan; null = sensor gagal
```

Setiap kali toko berubah, Zustand menjalankan selektor setiap komponen dan membandingkan hasilnya dengan hasil sebelumnya (`===`). Komponen hanya digambar ulang kalau hasilnya **berbeda**. Saat `f00d00000001` mengirim, di Daftar hanya kartu `f00d00000001` yang digambar ulang; lencana dan kartu lain diam. `useToko()` tanpa selektor membaca **seluruh** papan, jadi komponennya digambar ulang di setiap kiriman (kamu mengukurnya di Praktik 6).

![Diagram satu toko untuk semua layar, Zustand dan selektor (Konsep 4–5): toko adalah papan pengumuman bersama, selektor berarti hanya membaca baris yang kamu perlukan. Pita atas: contoh, layar Daftar Perangkat sedang terbuka, lalu acara telemetry dari f00d00000001 tiba. Kiri, kotak Yang mengisi toko, lewat soket dan API: acara dari backend telemetry dengan f00d00000001 dan isi suhu 31.2 dan seterusnya; soket.ts meneruskannya lewat useToko.getState().terima(id, isi); acara status (Online/Offline) menuju .setStatus(id, status); GET /devices di DaftarPerangkat menuju setPerangkat(daftar); jawaban ikuti (angka awal) menuju .isiTerbaru(id, terbaru). Panah ungu ke tengah, kotak ungu toko useToko (src/toko.ts), papan pengumuman bersama untuk semua layar, berisi delapan baris: koneksi bernilai live; perangkat berisi 3 perangkat; status untuk f00d00000001 bernilai online; terbaru untuk 246f28b1c7d4 berisi suhu 27.4; terbaru untuk a4cf12e5b7c0 berisi suhu 28.5; terbaru untuk f00d00000001 berisi suhu 31.2; terakhirDilihat untuk f00d00000001 bernilai Date.now(); dan jendela untuk f00d00000001 berisi titik lama ditambah titik baru. Tiga baris terakhir yang menyangkut f00d00000001 ditandai ungu: baris yang berubah karena kiriman ini. Catatan: terima() menyalin kamus lama lalu menambah yang baru, yaitu salinan s.terbaru ditambah isi untuk id itu. Kanan, Komponen di layar membaca lewat selektor, lima kartu: LencanaKoneksi di kepala halaman, selektor s.koneksi, tetap; DaftarPerangkat, induk kartu-kartu, selektor s.perangkat, tetap; KartuPerangkat Node 2 kebun, selektor suhu terbaru 246f28b1c7d4 ditambah status dan terakhir dilihat perangkat itu, tetap; KartuPerangkat Node 1 ruang tamu, selektor suhu terbaru a4cf12e5b7c0, tetap; KartuPerangkat Latihan ruang tamu, selektor suhu terbaru f00d00000001, berbingkai ungu dan berlabel digambar ulang. Catatan di bawahnya: TerakhirDilihat di setiap kartu berdetak sendiri tiap detik (useSekarang), jadi hanya tulisan kecil itu yang digambar ulang tiap detik. Bawah, tiga kotak. Papan tulis vs papan pengumuman: state (useState) adalah papan tulis kecil milik satu komponen (Modul 22), sedangkan toko adalah papan pengumuman bersama yang boleh dibaca layar mana pun dan diisi soket.ts dari luar React. Selektor sempit, bukan seluruh toko: tanda centang untuk useToko dengan selektor s.koneksi, digambar ulang hanya kalau koneksi berubah; tanda silang untuk useToko() tanpa selektor, yaitu seluruh toko, digambar ulang di setiap kiriman (Praktik 6). Dua jebakan: tulis ?? KOSONG, bukan ?? dengan larik kosong baru, karena larik baru di setiap panggilan membuat layar putih (Maximum update depth exceeded); dan salin, jangan ubah, supaya React tahu ada yang berubah. Pita paling bawah: di layar Detail, DetailPerangkat memilih terbaru, status, dan terakhirDilihat perangkat itu, serta koneksi === live; GrafikLive memilih jendela perangkat itu ?? KOSONG; kiriman dari perangkat lain tidak menyentuh layar itu.](aset/toko-dan-selektor.png)

**Jebakan Zustand 5: selektor yang membuat larik baru.** Selektor harus mengembalikan nilai yang **sama** selama isinya tidak berubah. `(s) => s.jendela[id] ?? []` membuat larik kosong **baru** setiap kali dijalankan: Zustand mengira datanya terus berubah, React menggambar ulang tanpa henti, dan layar menjadi putih dengan `Maximum update depth exceeded` di tab **Console** ([🚨](#-kalau-tidak-jalan)). Obatnya `KOSONG`, satu larik kosong yang selalu sama di `src/toko.ts` ([4.1](#41-jendela-geser-di-toko-isi-awal-dari-api-lalu-bacaan-live-15-menit)):

```ts
const titik = useToko((s) => s.jendela[deviceId] ?? KOSONG); // ?? KOSONG, bukan ?? [] (lihat toko.ts)
```

Selektor `daftarId` (Konsep 3) memakai akal yang sama: `device_id` digabung menjadi satu **teks**, karena teks yang isinya sama lolos `===`, sedangkan larik baru tidak pernah.

**Toko tumbuh per praktik.** Praktik 1 hanya menaruh `koneksi`; Praktik 2 menambah `perangkat`, `status`, dan `terbaru` ([2.1](#21-papan-pengumuman-bersama-di-srctokots-perangkat-status-dan-bacaan-terbaru-15-menit)); Praktik 3 menambah `terakhirDilihat`; Praktik 4 menambah `jendela` dan `KOSONG`. Isinya hanya di memori tab: tidak ada yang disimpan di `localStorage`, dan semuanya hilang saat halaman dimuat ulang. Sesudah **Keluar**, isinya masih ada sampai halaman dimuat ulang ([🔬](#-bedah-teknis-opsional) *Dua batasan v0.2*).

> ⬆️ **Sudah membaca Konsep 3–4?** Lanjut ke [Praktik 2 — Toko Zustand: angka bergerak sendiri](#praktik-2--toko-zustand-angka-bergerak-sendiri-50-menit). Lewati Konsep 5 dulu (menunggumu sesudah Praktik 5); [Konsep 6](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling)–7 dibaca sebelum Praktik 3.

### 5. Jangan menggambar ulang 10× per detik: ukur dulu, baru percaya

Konsep ini dibaca sesudah Praktik 5: dashboard-mu kini punya kartu yang hidup, grafik 5 menit, dan dua *gauge*, jadi ada yang bisa diukur.

**Menggambar ulang itu apa.** Setiap kali papan tulis kecil (*state*) atau baris toko yang dibaca sebuah komponen berubah, React memanggil ulang fungsi komponen itu (*re-render*), lalu menuliskan bedanya ke layar. Satu putaran menulis ke layar disebut ***commit***. Sekali dua kali per detik tidak terasa. Yang diwaspadai Silabus adalah kasus ekstrem: perangkat yang mengirim 10 kali per detik, sehingga layarnya ikut digambar ulang 10 kali per detik dan HP terasa berat. Beban terbesarnya ada di grafik: pada laju itu, jendela 5 menit berisi sampai 3.000 titik, dan Recharts menggambar setiap titik bulatnya.

**Dua pemicu utama gambar ulang di dashboard v0.2:**

| Pemicu | Seberapa sering | Yang digambar ulang |
| :--- | :--- | :--- |
| Acara `telemetry` mengubah toko | Node 1 dan simulator: sekali per 10 detik per perangkat (kiriman segera bisa lebih rapat, paling sering tiap 2 detik) | hanya komponen yang selektornya membaca nilai yang berubah |
| Detak jam 1 detik (`useSekarang`, Konsep 6) | sekali per detik | hanya komponen yang memakai jam: `TerakhirDilihat` dan `GrafikLive` |

Dua keputusan desain menjaga angka itu tetap kecil, dan keduanya sudah kamu tulis:

- **Selektor sempit** ([Konsep 4](#4-satu-toko-untuk-semua-layar-zustand-dan-selektor)). `LencanaKoneksi` membaca `const koneksi = useToko((s) => s.koneksi);`, jadi ia hanya digambar ulang saat sambungan berganti. Selektor lebar seperti `const { koneksi } = useToko();` berarti "kabari aku setiap ada yang berubah di papan pengumuman": lencana itu ikut digambar ulang di setiap bacaan, padahal tulisannya tetap **Live**.
- **Hanya yang perlu yang berdetak.** Tulisan "terakhir dilihat 12 detik yang lalu" harus berubah tiap detik, tetapi kartu dan layarnya tidak. Karena itu tulisannya dipisah menjadi komponen kecil `TerakhirDilihat` yang memasang jamnya sendiri: tiap detik, hanya tulisan itu yang digambar ulang. Seandainya jam dipasang di `DaftarPerangkat`, seluruh daftar ikut digambar ulang tiap detik.

***Batching* tidak menolong pesan soket.** React menggabung beberapa perubahan *state* yang terjadi dalam **satu** penangan, misalnya satu klik, menjadi satu gambar ulang; inilah *batching*. Pesan Socket.IO tiba satu per satu sebagai tugas terpisah, jadi 10 pesan per detik tetap berarti ±10 gambar ulang per detik untuk layar yang memakai angka itu; riset penulis menemukan hanya sebagian kecil yang kebetulan tergabung. Selektor sempit pun tidak bisa mencegahnya, karena `DetailPerangkat` memang harus menampilkan angka baru. Obat untuk data yang sungguh 10 kali per detik adalah ***throttle***: tampung bacaan, lalu tampilkan berkala, misalnya tiap 500 ms. Itu bahan [🔬](#-bedah-teknis-opsional) *Data 10 kali per detik*, bukan kode v0.2, karena perangkat kita hanya mengirim sekali per 10 detik.

**`memo` bukan jaminan.** Banyak tutorial langsung membungkus komponen dengan `memo`, supaya React melewati gambar ulangnya selama *props*-nya sama. Dokumentasi React menyebutnya pengoptimalan, bukan jaminan, dan tidak perlu selama tidak ada kelambatan yang terasa. v0.2 tidak memakainya.

**Animasi grafik dimatikan, tetapi bukan demi kecepatan.** Di lab penulis, menghidupkan animasi garis tidak memberi beda *commit* yang terukur. `isAnimationActive={false}` dipertahankan demi kejujuran visual: titik baru tidak boleh tampak terlambat atau "meluncur" dari nilai lama (Konsep 9).

**Ukur dulu, baru percaya.** Tebakan soal kecepatan sering keliru, jadi Praktik 6 memakai dua alat React DevTools 8.0.0 (terpasang sejak Modul 22):

- **Highlight updates when components render** (tab **Components ⚛** → ikon gerigi → **General**): bingkai sekilas pada setiap komponen yang baru digambar ulang, dari hijau-toska (jarang) ke kuning-jingga (sering).
- **Profiler ⚛**: rekam beberapa detik, lalu baca jumlah *commit* dan berapa kali setiap komponen digambar.

Angka mutlaknya bergantung pada laptop, browser, dan mode (dapur atau hidangan siap saji); yang dipercaya adalah **perbandingan** dalam kondisi yang sama. Di lab penulis (dapur, Edge, layar detail, rekaman 10 detik), laju nyata menghasilkan ±3 *commit* per detik, hampir semuanya dari detak jam; beban palsu 10 bacaan per detik menaikkannya menjadi ±18–23, dengan `DetailPerangkat` digambar ±8–10 kali per detik; dan selektor lebar membuat `LencanaKoneksi` digambar 104 kali dalam 10 detik, dibanding 0 kali dengan selektor sempit.

> ⬆️ **Sudah membaca Konsep 5?** Lanjut ke [Praktik 6 — Ukur dulu: jangan menggambar ulang 10× per detik](#praktik-6--ukur-dulu-jangan-menggambar-ulang-10-per-detik-25-menit). [Konsep 11 — Riwayat dari ember](#11-riwayat-dari-ember-tiga-rentang-tabel-berhalaman-dan-csv) dibaca sebelum Praktik 7.

### 6. Waktu di layar: jam WIB, jam relatif, dan detak yang bukan *polling*

Dashboard v0.2 menulis waktu dengan dua cara. **Jam mutlak** (`diperbarui pukul 16.33.54 WIB`, label `16.30` di bawah grafik) menjawab "kapan". **Jam relatif** (`terakhir dilihat 12 detik yang lalu`) menjawab "sudah berapa lama", pertanyaan yang lebih penting untuk dashboard *live*.

**Jam mutlak: selalu WIB, lewat `Intl`.** Sejak Modul 22, `jamWib()` memakai `toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })`, jadi `ts` UTC dari perangkat (berakhiran `Z`) selalu tertulis WIB, apa pun zona laptop atau HP-nya. Di Praktik 3 fungsi itu pindah ke `src/waktu.ts`; Praktik 4 menambahkan `jamMenitWib()` untuk label grafik (`16.27`); pembentuk teksnya (`Intl.DateTimeFormat`) dibuat sekali, lalu dipakai ulang.

Jebakannya, banyak tutorial memakai `format()` dari date-fns, yang menulis jam **zona laptop**. Di laptop riset penulis yang berzona UTC+8, `format()` mencetak `11.15.42` untuk bacaan pukul `10.15.42 WIB`. Pembaca di WITA/WIT, atau laptop yang zonanya salah, akan melihat jam bergeser. Maka date-fns hanya dipakai untuk jam relatif dan untuk menghitung "5 menit lalu" (`subMinutes`, Konsep 8).

**Jam relatif: date-fns berbahasa Indonesia.** Inilah `jamRelatif()` di `src/waktu.ts` ([3.1](#31-jam-yang-berdetak-dan-jam-relatif-srcwaktuts-15-menit)):

```ts
export function jamRelatif(t: number, sekarang: number): string {
  if (sekarang - t < 5000) return "baru saja";
  return formatDistanceStrict(t, sekarang, { locale: id, addSuffix: true });
}
```

- `formatDistanceStrict` dengan `locale: id` menulis angka pasti: `45 detik yang lalu`, `3 menit yang lalu`. Saudaranya, `formatDistance`, terlalu kasar untuk dashboard: 5 detik ditulis `kurang dari 1 menit yang lalu`, dan 45 detik `1 menit yang lalu`.
- Di bawah 5 detik ditulis `baru saja`. Tanpa itu, bacaan yang baru tiba tertulis `0 detik yang lalu`, dan jam server yang sedikit lebih cepat daripada jam HP bisa membuatnya `dalam waktu 2 detik`.
- `sekarang` dititipkan dari detak (di bawah), sehingga tulisan ini dan tanda basi (Konsep 7) dihitung dari jam yang sama dalam satu gambar.

**Jam siapa?** Tiga jam ikut bermain:

| Waktu | Jam siapa | Dipakai untuk |
| :--- | :--- | :--- |
| `ts` di setiap bacaan | jam **perangkat** (ESP32 lewat NTP sejak Modul 10; simulator memakai jam laptop) | `diperbarui pukul … WIB` dan letak titik di grafik |
| `terakhir_dilihat` dari `GET /devices` | jam **server**, saat backend terakhir mendengar perangkat itu | isi awal "terakhir dilihat" |
| `Date.now()` | jam **browser** (laptop atau HP) | saat acara `telemetry` tiba, detak, dan batas jendela 5 menit |

"Terakhir dilihat" sengaja tidak memakai `ts`: ia mencatat kapan perangkat **terdengar**, bukan kapan sensornya dibaca. Toko menyimpan yang lebih baru dari dua sumber (Praktik 3): jam server saat daftar dimuat, atau jam browser saat `telemetry` tiba. Karena jam-jam ini dibandingkan satu sama lain, **jam laptop dan HP harus otomatis**: nyalakan setelan waktu otomatis di keduanya. Selisih jam membuat tulisan `… yang lalu` keliru atau titik grafik bergeser ([🚨](#-kalau-tidak-jalan) *Jam di layar selisih satu jam atau lebih…*).

**Detak: jam yang berdetak, bukan *polling*.** Tulisan "12 detik yang lalu" harus bertambah sendiri walau tidak ada data baru. `useSekarang()` meniru pola `useTime` di dokumentasi React ([Pemanasan Langkah 4](#langkah-4--detak-jam-setinterval-dan-clearinterval-bukan-polling) sudah mencobanya tanpa React):

```ts
export function useSekarang(setiapMs = 1000): number {
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const pewaktu = setInterval(() => setSekarang(Date.now()), setiapMs);
    return () => clearInterval(pewaktu); // cleanup: hentikan detaknya saat komponen hilang dari layar
  }, [setiapMs]);
  return sekarang;
}
```

Tiap detik, `setInterval` hanya membaca jam browser dan menulis papan tulis kecil; tidak ada satu pun permintaan ke backend. Itulah bedanya dengan *polling* yang dilarang sejak Modul 22: *polling* bertanya ke server berulang-ulang, sedangkan detak hanya menghitung ulang tulisan di layar. Data baru tetap hanya datang lewat Socket.IO. Setiap komponen pemakai `useSekarang()` memasang pewaktunya sendiri (`TerakhirDilihat` di setiap kartu, lalu `GrafikLive` di Praktik 4), dan *cleanup* mencabutnya saat komponen hilang dari layar. Templat *pull request* ([➕ C](#c-tambahkan-butir-modul-23-ke-templat-pull-request)) menjaganya: `setInterval` hanya boleh ada di `src/waktu.ts`.

Browser memperlambat pewaktu di tab yang tersembunyi di belakang tab lain, jadi `… yang lalu` di tab itu bisa tertinggal sebentar. Itu wajar; di tab yang sedang dilihat, angkanya tepat.

### 7. Hidup belum tentu segar: status, terakhir dilihat, dan data basi

Kartu yang bertuliskan `Online` belum tentu angkanya baru. Karena itu, setiap kartu di Daftar Perangkat menjawab tiga pertanyaan yang berbeda, masing-masing dengan tandanya sendiri:

| Pertanyaan | Sumbernya | Tanda di kartu |
| :--- | :--- | :--- |
| Masih tersambung ke broker? | status `online`/`offline` (wasiat MQTT, Modul 11) | lencana `Online` hijau atau `Offline` merah, dan tepi kiri kartu berwarna sama |
| Kapan terakhir terdengar? | `terakhir_dilihat`, lalu acara `telemetry` (Konsep 6) | `terakhir dilihat 12 detik yang lalu` |
| Angkanya masih segar? | lama diam dibanding jadwal kirim jenis perangkatnya | `· data basi` berwarna jingga |

**Status datang dari wasiat.** Sejak Modul 11, broker menerbitkan wasiat `offline` saat sambungan perangkat putus: kalau kabel USB Node 1 dicabut, `offline` muncul sekitar 13–23 detik kemudian; kalau simulator dihentikan dengan **Ctrl + C**, `offline` muncul hampir seketika. Backend v1.0 meneruskannya sebagai acara `status` ke **semua** dashboard, tetapi **hanya saat status berubah**; status awalnya dari `GET /devices`. Di lab penulis, **Ctrl + C** simulator membuat kartu `Offline` merah dalam ≤ 1,5 detik, `· data basi` muncul sekitar 30 detik sesudah bacaan terakhir, dan simulator yang dijalankan lagi membuat kartunya `Online` hijau ±0,2 detik kemudian.

**Mengapa status saja tidak cukup.** `online` hanya berarti "sambungannya belum putus". Node 2 lebih menipu lagi: ia tidak punya sambungan MQTT sendiri, jadi statusnya diterbitkan Node 1 dan berarti "Node 1 masih mendengar Node 2". Node 2 mengirim tiap 5 menit dan baru dinyatakan `offline` sesudah 16 menit tanpa paket; kalau Node 1 sendiri mati, Node 2 tetap tertulis `online`. Maka kesegaran diukur terpisah, **per jenis** perangkat ([3.2](#32-lencana-merahhijau-terakhir-dilihat-dan-data-basi-15-menit)):

```ts
export function batasBasi(jenis: Jenis): number {
  return jenis === "node2" ? 16 * MENIT : 30 * 1000;
}
```

Node 1 dan simulator mengirim tiap 10 detik, jadi 30 detik tanpa kabar berarti 3 kiriman terlewat. Node 2 memakai angka aturan `offline`-nya, 16 menit. Lewat dari batas itu, `TerakhirDilihat` menambahkan `· data basi`.

**Warna selalu ditemani teks.** `Online` hijau dan `Offline` merah (di Modul 22, `offline` masih abu-abu), dan tepi kiri kartu Daftar mengikuti keduanya. Status lain, yaitu `mode offline` (milik Modul 28) dan `belum diketahui`, tetap netral. Tulisan di lencana membuat status tetap terbaca oleh orang yang sulit membedakan merah dan hijau (Konsep 9).

**Kunci mengalahkan status.** Backend mengabaikan kiriman perangkat yang kuncinya dicabut atau belum terdaftar (Modul 21), jadi statusnya di database membeku, bisa tetap `online`, dan tidak ada acara yang datang. Seperti di Modul 22, kartunya **tanpa** lencana status. Kini ia juga bertepi netral, bertuliskan `kiriman diabaikan backend`, dan tidak diperiksa basi; "terakhir dilihat"-nya tetap tampil apa adanya.

**Status dan bacaan adalah dua acara terpisah.** Sesaat sesudah kartu kembali `Online`, ia masih menulis `terakhir dilihat 1 menit yang lalu · data basi` sampai kiriman pertama tiba (≤ 10 detik). Lencana koneksi ikut menjaga: selama bukan **Live**, angka di Detail dibuat pudar dengan catatan `sambungan live terputus, angka ini mungkin sudah basi`.

Semua ini kamu uji di [3.3](#33--matikan-pengirimnya-kartu-memerah-lalu-hijau-lagi-10-menit): matikan pengirimnya, kartu memerah, lalu hijau lagi.

**Batasan v0.2.** Acara `status` yang lewat saat soket putus tidak dikirim ulang. Penulis mengalaminya: backend dimulai ulang tepat saat simulator menyala, dan kartu tetap `Offline` merah sedikitnya 90 detik walau bacaan baru masuk tiap 10 detik; **F5** membereskannya. Rinciannya di [🔬](#-bedah-teknis-opsional) *Dua batasan v0.2*.

> ⬆️ **Sudah membaca Konsep 6–7?** Lanjut ke [Praktik 3 — Kartu status merah/hijau dan "terakhir dilihat"](#praktik-3--kartu-status-merahhijau-dan-terakhir-dilihat-40-menit). [Konsep 8 — Grafik garis *live*](#8-grafik-garis-live-jendela-geser-5-menit) dibaca sebelum Praktik 4.

### 8. Grafik garis *live*: jendela geser 5 menit

Grafik di Detail Perangkat menampilkan **5 menit terakhir** dan bergeser sendiri. Bayangkan jendela kereta: pemandangan baru masuk dari kanan, yang lama keluar di kiri, dan bingkainya selalu selebar 5 menit. Node 1 dan simulator mengirim tiap 10 detik, jadi jendela itu berisi sekitar 30 titik.

**Tiga langkah mengisi jendela** ([4.1](#41-jendela-geser-di-toko-isi-awal-dari-api-lalu-bacaan-live-15-menit)):

1. **Isi awal dari API.** Toko hanya mengumpulkan titik sejak dashboard tersambung, padahal database sudah menyimpan bacaan 5 menit terakhir. `ambilBacaanSejak(id, 5)` meminta `GET /devices/<id>/readings?from=…`. Waktunya `subMinutes(new Date(), 5)` (date-fns: sekarang dikurangi 5 menit), ditulis lewat `toISOString()` sehingga berakhiran `Z` dan aman ditaruh di alamat (jam berzona `+07:00` harus ditulis `%2B07:00`, karena `+` di alamat dibaca sebagai spasi). Riset penulis: 30 bacaan dalam 10–19 ms. Hasilnya diserahkan ke `isiJendela()`.
2. **Titik baru dari soket.** Setiap acara `telemetry` sampai di `terima()` di toko, yang menambah satu titik. Tidak ada pertanyaan ke server: inilah "didorong" dari Konsep 1.
3. **Potong dan rapikan.** Keduanya lewat satu fungsi di `src/toko.ts`, kembaran [Pemanasan Langkah 2](#langkah-2--jendela-geser-5-menit-tambah-saring-dan-buang-yang-ganda):

```ts
function gabung(lama: Titik[], baru: Titik[]): Titik[] {
  const batas = Date.now() - LIMA_MENIT; // jam browser; ts titik memakai jam perangkat
  const urut = [...lama, ...baru].filter((p) => p.t >= batas).sort((a, b) => a.t - b.t);
  return urut.filter((p, i) => i === 0 || p.t !== urut[i - 1].t); // sesudah diurutkan, titik ganda pasti bersebelahan
}
```

`gabung()` menyalin, bukan mengubah larik lama (Konsep 4), membuang yang lebih tua dari 5 menit, mengurutkan, lalu membuang titik ganda: bacaan yang sama bisa datang dua kali, dari API **dan** dari soket. Isi awal diulang setiap kali lencana kembali **Live**, karena kiriman yang lewat selama sambungan putus tidak dikirim ulang server; titik yang sudah ada tidak tercatat dua kali.

**Menggambar dengan jujur.** Empat pilihan di `GrafikLive` ([4.2](#42-grafiklive-sumbu-waktu-jam-wib-dan-tanpa-animasi-20-menit)):

- **Sumbu waktu berupa angka**, bukan kategori: `XAxis type="number"` berisi `t` dalam milidetik, dengan `domain` tepat 5 menit terakhir. Bawaan Recharts (`category`) menaruh titik berjarak sama, padahal kiriman segera, misalnya sesudah perintah lampu dari Bruno, bisa datang hanya beberapa detik sesudah titik sebelumnya. Dengan sumbu angka, jarak di layar sama dengan selisih waktu sungguhan.
- **Label di setiap menit bulat**: `ticks={ticksTiap(awal, sekarang, MENIT)}`. Tanpa daftar itu, Recharts memilih letak label sendiri setiap detik, dan labelnya melompat (satu menit hilang, lalu muncul lagi). Penulis mengamati versi berdaftar selama 195 detik: label hanya berganti saat menit baru.
- **Celah dibiarkan putus.** Lebih dari 25 detik tanpa bacaan berarti paling sedikit 2 kiriman terlewat, jadi `sisipkanCelah()` menyisipkan titik kosong (`null`) dan garisnya putus di situ. Di lab penulis, simulator yang dihentikan ±40 detik membuat garisnya menjadi dua ruas. Mengapa itu penting: [Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status).
- **Tanpa animasi** (`isAnimationActive={false}`): animasi bawaan 1,5 detik membuat titik baru tampak terlambat.

Sumbu tegaknya mengikuti besaran yang dipilih: **Suhu** (°C, skala mengikuti data), **Cahaya** (0 = gelap, 4095 = terang; dibutuhkan untuk syarat lulus LDR), dan **Kelembapan** (0–100 %). Simulator mengacak cahaya di setiap kiriman, jadi garis Cahaya-nya bergerigi; memang begitu datanya. Lebar grafik mengikuti layar lewat prop `responsive` (bukan `ResponsiveContainer`), jadi muat di layar HP selebar 375 px.

![Diagram grafik live dengan jendela geser 5 menit (Konsep 8): isi awal dari API, titik baru dari soket, ujung lama dipotong; contoh f00d00000001, angka hanya ilustrasi. Grafik garis Suhu (°C) dengan sumbu tegak 28 sampai 32 dan sumbu waktu berlabel tiap menit bulat 16.22, 16.23, 16.24, 16.25, 16.26, dan 16.27. Bagian kiri sebelum 16.22.10 berlatar abu-abu: enam titik bulat kosong dihubungkan garis putus-putus, yaitu titik yang dipotong karena lebih tua dari 5 menit. Sisanya berlatar ungu muda: jendela 5 menit yang digambar. Titik navy adalah isi awal dari API (database), titik ungu adalah titik live dari acara telemetry. Garis tegak putus-putus abu-abu berlabel layar dibuka 16.25.40 memisahkan isi awal dari titik live; garis tegak ungu di ujung kanan berlabel sekarang 16.27.10 WIB. Di tengah grafik ada celah tanpa titik dan tanpa garis, berlabel celah 73 detik (lebih dari 25 detik): garis tidak disambung. Di kanan, satu titik ungu yang datang hanya 6 detik sesudah titik sebelumnya ditunjuk label kiriman segera (Bruno: lampu), sehingga jarak antartitik tidak rata. Catatan abu-abu di bawah garis: simulator mengacak suhu 25–33 °C di setiap kiriman, jadi garis di layarmu akan lebih bergerigi. Legenda: dipotong, lebih tua dari 5 menit; isi awal dari API (database); titik live dari acara telemetry; jendela 5 menit (yang digambar). Di bawah grafik, empat kotak bernomor dengan panah. 1 Isi awal: saat layar dibuka atau kembali Live, ambilBacaanSejak(id, 5) memanggil GET …/readings?from=…Z, sekitar 30 bacaan, lalu isiJendela(), yang juga mengisi angka kartu bila terbaru masih kosong. 2 Titik baru: acara telemetry tiba, terima() menambah satu titik, tanpa bertanya ke server (tanpa polling). 3 Potong dan rapikan: gabung() menyalin, membuang yang lebih tua dari 5 menit, mengurutkan, dan membuang titik ganda (ts sama); hasilnya selalu larik baru. 4 Gambar dengan jujur: sumbu X type=number agar jarak waktu asli, ticks tiap menit, celah lebih dari 25 detik menjadi titik null, dan isAnimationActive={false}. Catatan bawah: dua jam berbeda, titik memakai ts dari jam perangkat sedangkan batas jendela memakai jam browser (Date.now()); kiriman selama putus tidak dikirim ulang oleh server, karena itu isi awal diulang setiap kali lencana kembali Live; Node 2 mengirim tiap 5 menit, jadi grafik live-nya hampir selalu kosong dan tidak ditampilkan, grafiknya ada di Riwayat.](aset/jendela-geser-5-menit.png)

**Lagi-lagi dua jam.** Batas jendela memakai jam browser, sedangkan titik memakai `ts` dari jam perangkat (Konsep 6). Kalau jam perangkat lebih cepat, titik baru tersembunyi di luar tepi kanan dan baru muncul setelah jam browser menyusul; kalau tertinggal lebih dari 5 menit, titiknya langsung terbuang. Titik lama juga baru dibuang toko saat titik baru datang, jadi `GrafikLive` sendiri memeriksa apakah masih ada titik di 5 menit terakhir; kalau tidak, ia menulis `Belum ada bacaan dalam 5 menit terakhir.` (atau `Menunggu sambungan live…` saat lencana belum **Live**).

**Angka awal kartu dan *gauge*.** Grafik dan kartu harus sepakat, jadi urutannya:

1. Jawaban `ikuti` membawa `terbaru`, bacaan terakhir yang diingat backend (Praktik 2).
2. Sesudah backend dimulai ulang, ingatannya kosong (`terbaru` bernilai `null`), padahal database masih menyimpan bacaan. Maka `isiJendela()` juga mengisi angka kartu dari bacaan terakhir isi awal, **hanya** kalau kartu belum punya angka, dan tanpa mengarang kolom yang kosong. Keadaan lampu, kipas, pompa, dan tirai tidak disimpan di database, jadi kartunya baru muncul bersama kiriman berikutnya.
3. Kalau jendela 5 menit pun kosong, barulah Detail menulis `Belum ada bacaan dari perangkat ini sejak backend dinyalakan. …`

Tanpa langkah 2, layar bisa menulis "belum ada bacaan" sambil grafiknya berisi titik. Di lab penulis, sesudah backend dimulai ulang, `ikuti` dijawab `{"ok":true,"terbaru":null}`, tetapi 1,5 detik kemudian Detail sudah menulis `diperbarui pukul 14.32.07 WIB`, jam bacaan terakhir di database.

**Node 2 tanpa grafik *live*.** Node 2 mengirim tiap 5 menit, jadi jendela 5 menitnya hampir selalu kosong. Detail Node 2 tidak memasang `GrafikLive` dan menggantinya dengan satu kalimat penjelasan (mulai Praktik 7, kalimat itu menunjuk layar Riwayat). Tanpa jendela, angka awal Node 2 hanya dari `ikuti`: sesudah backend dimulai ulang, Detail-nya menulis pesan netral sampai Node 2 mengirim lagi.

> ⬆️ **Sudah membaca Konsep 8?** Lanjut ke [Praktik 4 — Grafik garis *live* 5 menit](#praktik-4--grafik-garis-live-5-menit-55-menit). Konsep 9–10 dibaca sebelum Praktik 5.

### 9. Visual yang jujur: skala, satuan, celah, dan warna status

Mata membaca **gambar** lebih dulu daripada angka. *Gauge* air tandon yang busurnya penuh terbaca "tandon penuh", walaupun di tengahnya tertulis `14 %`. Garis yang mulus terbaca "datanya lengkap", walaupun perangkatnya mati dua menit. Grafik seperti itu lebih berbahaya daripada angka polos, karena kamu memercayainya tanpa membaca. Silabus menyebut tugas ini "memilih visual yang jujur (skala, satuan, warna status)": **gambar harus mengatakan hal yang sama dengan angkanya**. Dashboard v0.2 memegang tujuh aturan.

**1. Skala *gauge* ditulis: 0–100 %.** Recharts tidak punya komponen *gauge*; kita merakitnya dari `RadialBarChart` setengah lingkaran. Tanpa skala tetap, Recharts mengukur busur terhadap datanya sendiri. Datanya hanya satu nilai, jadi nilai itu menjadi ujung skalanya, dan busurnya **selalu penuh**: di lab penulis, *gauge* 20 % dan 49 % sama-sama penuh. Obatnya satu baris di `Gauge.tsx`:

```tsx
<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
```

`domain={[0, 100]}` berarti busur penuh = 100 %, dan `tick={false}` menyembunyikan angka skala di sekeliling busur. Di [5.1](#51-gauge-salah-dulu-lalu-jujur-15-menit), kamu sengaja menulis *gauge* tanpa baris ini dulu, supaya melihat sendiri busur yang menipu. Karena skalanya tetap dan angkanya selalu ditulis dalam `%`, *gauge* hanya dipakai untuk persen yang batasnya memang 0–100: **kelembapan tanah** dan **air tandon**. Suhu tidak punya batas atas yang jelas, dan cahaya berupa angka ADC 0–4095, bukan persen, jadi keduanya tetap kartu dan grafik.

**2. Satuan di setiap angka, dan skala sumbu yang disengaja.** Angka `30` itu suhu, persen, atau apa? Kartu, *gauge*, *tooltip*, dan judul grafik selalu membawa satuannya (`°C`, `%`), dan cahaya diberi keterangan `Cahaya (0 = gelap, 4095 = terang)`. Sumbu Y pun dipilih dengan sengaja. Sumbu kelembapan dan tanah selalu 0–100, sumbu cahaya 0–4095, jadi naik-turun kecil tidak tampak seperti lonjakan. Sumbu suhu justru **mengikuti datanya** dan tidak mulai dari 0: selisih 1–2 °C di dalam rumah itu penting, dan sumbu 0–40 °C akan meratakannya. Itu boleh, asalkan satuannya tertulis di judul (`Suhu (°C)`) dan angka sumbunya terbaca. (Jarak waktu yang jujur, lewat sumbu X berupa angka, sudah dibahas di [Konsep 8](#8-grafik-garis-live-jendela-geser-5-menit).)

**3. Celah tidak disambung, di kedua grafik.** Grafik garis menghubungkan setiap titik dengan titik berikutnya. Kalau simulator mati dua menit, titik terakhir sebelum mati langsung disambung ke titik pertama sesudahnya: satu garis lurus yang seolah-olah berisi data. Di lab penulis, versi awal grafik *live* melakukan persis itu untuk celah 2 menit 21 detik. Obatnya fungsi kecil `sisipkanCelah()`: kalau jarak dua titik berurutan melebihi batas, ia menyisipkan satu titik kosong (`null`) di antaranya, dan Recharts memutus garis di titik `null` (bawaan `connectNulls` adalah `false`). Batasnya:

| Grafik | Celah kalau jaraknya lebih dari | Artinya |
| :--- | :--- | :--- |
| *Live* 5 menit ([4.2](#42-grafiklive-sumbu-waktu-jam-wib-dan-tanpa-animasi-20-menit)) dan Riwayat 1 jam | 25 detik | dua kiriman 10 detik terlewat |
| Riwayat 24 jam ([7.3](#73-layar-riwayat-riwayattsx-dan-grafikriwayattsx-25-menit)) | 22,5 menit (1,5 × ember 15 menit) | ada ember tanpa bacaan |
| Riwayat 7 hari | 1,5 jam (1,5 × ember 1 jam) | ada ember tanpa bacaan |

Riwayat butuh aturan ini karena backend sama sekali tidak mengirim ember yang kosong ([Konsep 11](#11-riwayat-dari-ember-tiga-rentang-tabel-berhalaman-dan-csv)). Sesudah `sisipkanCelah()` dipasang, garis di lab penulis putus tepat di celahnya.

**4. Warna selalu ditemani teks.** Banyak orang sulit membedakan merah dan hijau, jadi warna tidak pernah bekerja sendirian. Lencana hijau bertuliskan `Online` dan lencana merah `Offline` sudah kamu kenal di Konsep 7. Aturan yang sama berlaku untuk *gauge*: air tandon di bawah 20 % berubah jingga sekaligus menulis `rendah (di bawah 20 %)`.

**5. Kosong ditulis `—`, bukan 0.** Sensor yang gagal dibaca mengirim `null` (aturan 7 kontrak data). Nol adalah bacaan sungguhan, misalnya tanah yang benar-benar kering, jadi `null` ditulis `—`: di kartu (sejak Modul 22), di tengah *gauge* (busurnya kosong), dan di tabel Riwayat. Di CSV, ia menjadi sel kosong.

**6. Angka basi tampak basi.** Angka yang tidak diperbarui lagi tetap terlihat meyakinkan, jadi kebasiannya ditulis: `· data basi` sesudah 30 detik tanpa kiriman (Node 2: 16 menit), serta kartu dan *gauge* yang dipudarkan dengan catatan `sambungan live terputus, angka ini mungkin sudah basi` selama lencana bukan **Live** ([Konsep 7](#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi)).

**7. Animasi mati.** Bawaan Recharts menganimasikan setiap perubahan selama ±1,5 detik: busur dan garis "meluncur" dari nilai lama. Selama itu, layar menggambar angka yang tidak pernah dikirim perangkat, dan titik baru tampak terlambat. Maka setiap `Line` dan `RadialBar` memakai `isAnimationActive={false}`. Alasannya kejujuran, bukan kecepatan: di lab penulis, menghidupkan animasi tidak menambah gambar ulang secara terukur (Konsep 5; bisa kamu coba di Praktik 6).

![Diagram visual yang jujur: empat pasang menipu dan jujur (Konsep 9) tentang skala, celah, warna status, dan angka basi; angka di gambar hanya contoh. Setiap pasang berisi panel kiri berpil merah menipu dan panel kanan berpil hijau jujur. Pasangan 1, gauge, skalanya harus ditulis: dua gauge setengah lingkaran Kelembapan tanah bertuliskan 14 %. Yang menipu busurnya penuh dari ujung ke ujung, dengan keterangan tanpa skala, busur diukur terhadap nilainya sendiri, sehingga selalu penuh. Yang jujur busurnya hanya terisi sedikit di kiri, dengan keterangan PolarAngleAxis type=number, domain 0 sampai 100, tick={false}. Pasangan 2, celah tidak disambung: dua grafik garis dengan kelompok titik kiri dan kanan. Yang menipu memakai garis lurus panjang menyeberangi celah, dengan keterangan simulator mati 2 menit, tetapi garis lurus membuatnya tampak ada data. Yang jujur garisnya putus dan celahnya bertuliskan tidak ada data, dengan keterangan celah lebih dari 25 detik (di Riwayat 24 jam dan 7 hari: lebih dari 1,5 kali lebar ember) diisi titik null, lalu garis putus, di grafik live dan Riwayat. Pasangan 3, warna status selalu ditemani teks: dua kartu perangkat, Node 1 ruang tamu bertepi hijau dan Latihan ruang tamu bertepi merah. Yang menipu hanya memakai titik hijau dan merah, dengan keterangan merah dan hijau saja sulit dibedakan oleh orang yang buta warna. Yang jujur menambahkan lencana Online dengan terakhir dilihat baru saja, dan lencana Offline dengan terakhir dilihat 20 detik yang lalu; keterangannya warna selalu ditemani teks, Online atau Offline + terakhir dilihat. Pasangan 4, angka basi harus tampak basi: layar detail Latihan ruang tamu, dengan tulisan diperbarui pukul 16.20.05 WIB di atas kartu Suhu 30.2 °C dan Kelembapan 71 %. Yang menipu menampilkan semuanya jelas, dengan keterangan sambungan putus, tetapi angka lama tetap tampak segar. Yang jujur memasang lencana jingga Menyambung ulang…, memudarkan semuanya, dan menulis diperbarui pukul 16.20.05 WIB · sambungan live terputus, angka ini mungkin sudah basi; keterangannya kartu dipudarkan dan diberi tulisan, dan di Daftar dan Detail muncul · data basi bila lebih dari 30 detik (Node 2: lebih dari 16 menit). Pita bawah, juga jujur: satuan di setiap angka (°C, %, cahaya 0–4095); null ditulis —, bukan 0; sumbu suhu boleh tidak mulai dari 0 asal satuannya tertulis; animasi grafik dimatikan (isAnimationActive={false}) supaya angka baru tidak meluncur dari nilai lama.](aset/visual-jujur.png)

Sebagian aturan ini sudah ada di kodemu sejak Praktik 3–4: warna dan teks status, angka basi, serta celah dan animasi mati di `GrafikLive`. Praktik 5 menambahkan *gauge* yang jujur, dan Praktik 7–8 memakai aturan yang sama untuk Riwayat.

### 10. Mode gelap: mengikuti setelan HP dan laptop

Malam hari, layar putih dashboard menyilaukan, apalagi di HP. Kebanyakan HP dan laptop sudah punya setelan **tema gelap**, dan browser memberitahukan pilihan itu ke setiap halaman lewat fitur CSS **`prefers-color-scheme`**. Dashboard v0.2 cukup **mengikutinya**: tanpa tombol, dan tanpa menyimpan apa pun.

**Tailwind sudah siap.** Di Tailwind v4, awalan `dark:` bawaannya membaca `prefers-color-scheme`, tanpa satu baris konfigurasi pun. Cara pakainya mirip `sm:` di Modul 22: kelas tanpa awalan selalu berlaku, dan kelas berawalan `dark:` menimpanya saat tema gelap. Setiap warna latar dan teks diberi pasangan, misalnya `bg-white dark:bg-slate-800` untuk kartu dan `text-slate-800 dark:text-slate-100` untuk judul. Dua tambahan di `index.html`: `<html lang="id" class="scheme-light dark:scheme-dark">` meminta browser ikut menggelapkan bagian buatannya sendiri, misalnya batang gulir dan isian formulir, dan `<body class="bg-slate-100 dark:bg-slate-900">` menggelapkan latar halaman.

**Recharts tidak mengenal `dark:`.** Grafik dan *gauge* digambar sebagai SVG (gambar dari garis dan bentuk yang disusun kode) dengan warna bawaan Recharts: tulisan sumbu `#666`, lintasan *gauge* `#eee`, dan *tooltip* putih bergaris `#ccc`. Kelas Tailwind tidak menyentuh warna-warna itu, jadi di tema gelap lintasan *gauge* dan *tooltip* tetap terang menyilaukan. Obatnya **variabel CSS** yang berganti nilai sendiri, di `src/index.css`:

```css
:root {
  --warna-garis: var(--color-slate-200);
  --warna-panel: var(--color-white);
  --warna-lintasan: var(--color-slate-200);
}

@media (prefers-color-scheme: dark) {
  :root {
    --warna-garis: var(--color-slate-700);
    --warna-panel: var(--color-slate-800);
    --warna-lintasan: var(--color-slate-700);
  }
}
```

Komponen grafik memakai nama variabelnya, bukan warnanya: garis bantu dan sumbu `stroke="var(--warna-garis)"`, latar *tooltip* `var(--warna-panel)`, dan lintasan *gauge* `var(--warna-lintasan)`. Tulisan sumbu memakai `fill: "currentColor"`, yaitu warna teks wadahnya (`text-slate-500 dark:text-slate-400`), jadi ikut berganti. Warna garis data dan busur *gauge* sengaja sama di kedua tema: itu warna penanda, dan tetap terbaca di latar gelap.

**Jebakannya: tulis nama warna utuh.** Tailwind hanya menyertakan variabel warna yang namanya tertulis lengkap di kode. Di riset penulis, `var(--color-sky-500)` yang tertulis utuh ikut masuk CSS hasil *build*, sedangkan nama yang dirakit, misalnya `` `var(--color-${warna}-500)` ``, tidak. Karena itu semua warna grafik ditulis utuh. Gejalanya kalau aturan ini dilanggar ada di [🚨](#-kalau-tidak-jalan) *Mode gelap: garis atau tulisan grafik hitam di latar gelap*.

**Mengapa tidak ada tombol terang/gelap?** Tombol butuh tiga hal: `@custom-variant` di CSS (sejak itu `dark:` berhenti mengikuti setelan sistem), skrip kecil di `<head>` supaya halaman tidak sempat berkedip putih, dan **tempat mengingat pilihannya**, yang di contoh resmi Tailwind adalah `localStorage`. Pilihan tema memang bukan rahasia, tetapi aturan aman minggu ini dan `frontend/README.md` sudah berjanji: tidak ada apa pun di `localStorage`. Daripada membuat pengecualian, v0.2 ikut setelan sistem. Cara membuat tombolnya ada di [🔬](#-bedah-teknis-opsional) *Tombol tema manual*.

Di [5.3](#53-mode-gelap-kelas-dark-dan-warna-grafik-20-menit), kamu menambahkan kelas `dark:` ke layar-layar Modul 22 dan menirukan tema gelap lewat DevTools tanpa mengubah setelan laptop; di [9.6](#96-mode-gelap-di-hp-dan-hp-yang-tertidur-10-menit), kamu mencobanya di HP. Catatan jujur: penulis mengujinya dengan tema gelap tiruan di Edge. Warna dari variabel CSS di dalam SVG belum dicoba di Safari iPhone.

> ⬆️ **Sudah membaca Konsep 9–10?** Lanjut ke [Praktik 5 — *Gauge*, visual jujur, dan mode gelap](#praktik-5--gauge-visual-jujur-dan-mode-gelap-45-menit). Sesudahnya, kembali ke [Konsep 5](#5-jangan-menggambar-ulang-10-per-detik-ukur-dulu-baru-percaya) sebelum Praktik 6.

### 11. Riwayat dari ember: tiga rentang, tabel berhalaman, dan CSV

Grafik *live* menggambar setiap bacaan, karena lima menit hanya ±30 titik. Tujuh hari bacaan Node 1 (tiap 10 detik) sudah ±60 ribu, padahal grafik di HP hanya selebar beberapa ratus piksel, dan backend mengirim paling banyak **1.000** bacaan per permintaan. Jawabannya sudah kamu bangun di Modul 18: **ember** (*bucket*, [Modul 18 Konsep 3](../../fase-3-backend-data/modul-18-timescaledb/README.md#3-time_bucket-ember-waktu)). Semua bacaan dalam satu rentang waktu dimasukkan ke satu ember, lalu yang dikirim hanya ringkasannya: rata-rata, terendah, tertinggi, dan jumlah bacaan. Satu ember = satu titik di grafik.

**Satu rentang, satu ukuran ember.** Makin panjang rentangnya, makin besar embernya, sehingga jumlah titiknya tetap ratusan:

| Tombol | Permintaan | Satu titik | Jumlah titik | Dibaca dari |
| :--- | :--- | :--- | :---: | :--- |
| **1 jam** | `GET /devices/:id/readings` | satu bacaan mentah | ±360 | `readings` (bacaan mentah) |
| **24 jam** | `…/readings?bucket=15m` | ember 15 menit | 97 | `readings`, dikelompokkan saat diminta |
| **7 hari** | `…/readings?bucket=1h` | ember 1 jam | 169 | buku ringkasan `readings_per_jam` |

97 = 24 × 4 + 1 dan 169 = 7 × 24 + 1, karena awal rentang dibulatkan ke awal ember dan ember yang sedang berjalan ikut dihitung. Label sumbu 7 hari jatuh di setiap pukul 00.00 WIB (awal hari WIB). Ketiga tombol memakai **nilai bawaan API**, tanpa `from` dan `to`, jadi bebas jebakan `+07:00` yang harus ditulis `%2B07:00` di alamat. Riwayat 7 hari cepat karena backend cukup membaca 169 baris buku ringkasan ([Modul 18 Konsep 5](../../fase-3-backend-data/modul-18-timescaledb/README.md#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis)), bukan puluhan ribu bacaan mentah: di laptop penulis, jawabannya umumnya hanya beberapa puluh milidetik ([7.4](#74--riwayat-7-hari-termuat-kurang-dari-1-detik-10-menit) mengukurnya).

![Diagram riwayat dari ember: satu rentang, satu ukuran ember (Konsep 11), memakai nilai bawaan API tanpa from/to; semakin panjang rentangnya, semakin besar embernya. Atas, tiga kartu. Kartu 1 jam, ±360 titik: GET …/readings, bacaan mentah satu tiap 10 detik, digambar sebagai deretan rapat titik kecil, 1 titik = 1 bacaan; 1 jam ÷ 10 detik = ±360 bacaan, diubah ke bentuk ringkasan di browser (keTitikRingkasan()); sumber: readings (bacaan mentah). Kartu 24 jam, 97 titik: GET …/readings?bucket=15m, ember 15 menit berisi rata, terendah, tertinggi; gambar kelompok titik kecil yang dikurung menjadi satu titik ungu, ±90 bacaan (tiap 10 detik) menjadi 1 titik ringkasan; 24 jam × 4 ember + 1 = 97, karena ember pertama dibulatkan ke bawah dan ember yang sedang berjalan ikut dihitung; sumber: readings, dihitung saat diminta. Kartu 7 hari berbingkai ungu, 169 titik: GET …/readings?bucket=1h, ember 1 jam berisi rata, terendah, tertinggi; ±360 bacaan (tiap 10 detik) menjadi 1 titik ringkasan; 7 hari × 24 ember + 1 = 169; syarat lulus: riwayat 7 hari termuat kurang dari 1 detik (diukur di Praktik 7); sumber: readings_per_jam (buku ringkasan). Panah dari dua kartu pertama ke kotak biru readings dan dari kartu ketiga ke kotak biru readings_per_jam. Kotak readings: bacaan mentah, satu baris per kiriman (Modul 17); hypertable TimescaleDB, dipotong per hari, bacaan mentah disimpan 90 hari (Modul 18); 1 jam memakai bacaan mentah apa adanya; 24 jam dikelompokkan saat diminta dengan time_bucket 15 minutes; batas 1.000 bacaan atau ember per permintaan, ketiga rentang jauh di bawahnya; buku ringkasan di kanan dibuat dari tabel ini, setiap jam diringkas sekali, jadi riwayat 7 hari cukup membaca 169 baris, bukan puluhan ribu bacaan mentah. Kotak readings_per_jam: buku ringkasan per jam (Modul 18), diisi petugas tiap 30 menit, hanya 3 hari terakhir; data lama (npm run isi-riwayat) wajib di-refresh dengan CALL refresh_continuous_aggregate('readings_per_jam', now() - INTERVAL '8 days', now() - INTERVAL '1 hour'); tulisan merah: tanpa itu grafik 7 hari bisa hanya 2 titik, lalu (sesudah petugas berjalan) hanya 3 hari terakhir yang terisi. Di bawahnya, isi satu titik ringkasan (TitikRingkasan), sama untuk ketiga rentang: waktu, suhu_rata, suhu_min, suhu_maks, kelembapan_rata, tanah_rata, cahaya_rata, dan jumlah_bacaan, dengan enam kolom besaran disorot ungu, lalu tulisan hanya 4 besaran; suhu, kelembapan udara, kelembapan tanah, dan cahaya saja, sedangkan tekanan, baterai, air tandon, dan gerakan tidak ada di riwayat ringkasan. Pita bawah: tabel dan CSV memakai jawaban yang sama, 7 hari = 169 baris, 24 baris per halaman, terbaru dulu (Halaman 1 dari 8); Unduh CSV dibuat di browser dengan pemisah titik koma, koma desimal, dan BOM, cocok untuk Excel berbahasa Indonesia.](aset/ember-per-rentang.png)

**Lima sifat jawaban riwayat** (backend v1.0, tidak berubah):

- **Hanya empat besaran yang diringkas**: suhu (rata-rata, terendah, tertinggi), kelembapan, kelembapan tanah, dan cahaya, ditambah jumlah bacaan per ember. Tekanan udara, baterai, air tandon, dan gerakan tidak ada, jadi layar Riwayat hanya menawarkan empat besaran itu (Node 2 tanpa Cahaya) dan menuliskannya: `Riwayat ringkasan hanya menyimpan suhu, kelembapan, kelembapan tanah, dan cahaya.` Bacaan mentah 1 jam diubah ke bentuk ringkasan yang sama di browser (`keTitikRingkasan()`), supaya grafik, tabel, dan CSV cukup mengenal satu bentuk.
- **Ember kosong tidak dikirim.** Jam tanpa bacaan tidak punya baris sama sekali, jadi grafik menyisipkan celahnya sendiri (Konsep 9).
- **Rata-rata menyembunyikan lonjakan.** Suhu 33 °C sesaat lenyap di dalam rata-rata satu jam. Karena itu, grafik Suhu 24 jam dan 7 hari digambar dengan tiga garis: rata-rata tebal, terendah dan tertinggi putus-putus. Cara menipiskan titik yang menjaga bentuk aslinya ada di [🔬](#-bedah-teknis-opsional) *Downsampling*.
- **Paling banyak 1.000 per permintaan.** Bacaan mentah yang lebih dari itu dipotong: backend mengirim 1.000 yang **terlama** dengan `terpotong: true` (permintaan lebih dari 1.000 ember ditolak). Ketiga rentang kita jauh di bawahnya; cara memuat lebih banyak sedikit demi sedikit ada di [🔬](#-bedah-teknis-opsional) *Keyset pagination*.
- **Buku ringkasan harus diperbarui sesudah data lama masuk.** Petugas ringkasan hanya meringkas ulang 3 hari terakhir, tiap 30 menit. Bacaan lama yang masuk sekaligus (`npm run isi-riwayat`) belum tentu tampak di Riwayat 7 hari sebelum `CALL refresh_continuous_aggregate(…)` berbatas 8 hari: di database yang sudah lama dipakai, grafiknya bisa hanya berisi 2 titik. Resepnya di [🧰](#-yang-perlu-disiapkan) dan [7.1](#71-siapkan-data-7-hari-dan-cek-di-bruno-10-menit).

**Tabel berhalaman, dikerjakan browser.** API tidak punya pilihan halaman (`limit`, `offset`, atau nomor halaman). Tidak masalah: satu rentang hanya ratusan baris (1 jam ±360), dan semuanya sudah di tangan browser. `TabelRiwayat` membalik salinannya (API selalu mengirim dari yang terlama, tabel menampilkan **terbaru dulu**), lalu memotongnya **24 baris per halaman**: satu hari penuh untuk riwayat per jam. 169 baris menjadi `Halaman 1 dari 8`, dan halaman terakhir berisi satu baris. Pindah halaman tidak mengirim permintaan baru, jadi `dimuat dalam … ms` tetap mengukur satu permintaan. Ribuan baris yang tampil sekaligus butuh cara lain ([🔬](#-bedah-teknis-opsional) *Virtualized list*).

**CSV dibuat browser, untuk Excel dengan setelan wilayah Indonesia.** Backend tidak punya rute CSV, padahal datanya sudah ada di layar. Maka `src/csv.ts` menyusun teksnya dari jawaban yang sama, lalu meminta browser menyimpannya sebagai berkas, tanpa server. Isinya semua baris rentang itu, bukan hanya halaman yang tampak, urut dari yang terlama. Formatnya mengikuti kebiasaan Excel di Indonesia:

- **Pemisah titik koma (`;`) dan koma desimal (`28,5`).** Excel memisahkan kolom CSV dengan pemisah daftar Windows (dokumentasi Microsoft), dan setelan wilayah Indonesia memakai `;` sebagai pemisah daftar dan koma sebagai tanda desimal.
- **BOM di awal berkas**: tanda tak terlihat yang memberi tahu Excel bahwa isinya UTF-8, supaya huruf istimewa, misalnya `é` atau `°` di nama perangkat, tidak tampil rusak.
- **Baris diakhiri CRLF, dan nilai yang memuat `;`, `"`, atau baris baru dibungkus tanda petik** (petik di dalamnya digandakan), meniru aturan format CSV yang dijelaskan RFC 4180 (di sana pemisahnya koma).
- **Jam WIB** seperti `2026-10-17 16:00:00`, dan nama berkas seperti `riwayat-f00d00000001-7hari-2026-10-24.csv`.

Dua baris pertama CSV 7 hari di lab penulis:

```text
waktu_wib;perangkat;suhu_rata_c;suhu_min_c;suhu_maks_c;kelembapan_rata_persen;tanah_rata_persen;cahaya_rata;jumlah_bacaan
2026-10-17 16:00:00;Latihan ruang tamu;30;29,5;30,4;75;43,3;1392,3;6
```

Tabel di layar tetap memakai titik desimal (`29.5`), seperti kartu sensor; hanya CSV yang memakai koma. Catatan jujur: isi berkasnya diperiksa byte demi byte di lab, tetapi penulis tidak punya Excel untuk membukanya. Di [8.3](#83-buka-berkas-csv-nya-dan-cocokkan-dengan-tabel-5-menit), kamu yang mencobanya; kalau semua isinya menumpuk di satu kolom, lihat [🚨](#-kalau-tidak-jalan) *CSV terbuka sebagai satu kolom di Excel*.

> ⬆️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 7 — Riwayat 1 jam, 24 jam, dan 7 hari](#praktik-7--riwayat-1-jam-24-jam-dan-7-hari-55-menit), lalu [Praktik 8 — Tabel berhalaman dan ekspor CSV](#praktik-8--tabel-berhalaman-dan-ekspor-csv-40-menit). Konsep 12 dibaca sebelum Praktik 9.

### 12. HP lewat WiFi rumah: mode HP dan mode laptop

Syarat lulus berbunyi "grafik **di HP**". Sampai Praktik 8, dashboard-mu hanya terbuka di laptop itu sendiri, dan itu disengaja: sejak Modul 16 backend hanya mendengar di `127.0.0.1`, dan Vite hanya melayani `localhost`. Modul 22 menaruh percobaan HP di 🔬 sebagai pilihan; minggu ini langkahnya resmi. Kode React tidak berubah sama sekali. Yang berubah hanya **cara backend dan Vite dijalankan**, dan itu dinyalakan per sesi.

**Satu WiFi, banyak alamat** (ulang [Modul 10 Konsep 1](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#1-jaringan-rumah-router-alamat-ip-dan-alamat-mac)). Router membagikan alamat IP ke setiap perangkat di WiFi rumah, seperti nomor rumah di satu kompleks: laptop misalnya `192.168.1.10` (contoh modul ini; IP-mu akan berbeda), HP-mu nomor lain. HP mengetuk laptop lewat **IP WiFi laptop**, bukan `localhost`, karena bagi HP, `localhost` adalah HP itu sendiri. Laptop bisa punya beberapa adaptor (WiFi, WSL, VPN), masing-masing ber-IP, tetapi HP hanya menjangkau yang WiFi. IP itu dipinjamkan router, jadi bisa berganti besok.

**Pintu yang didengarkan: `HOST`.**

| `HOST` di `backend/.env` | Yang bisa mengetuk backend | Keterangan |
| :--- | :--- | :--- |
| `127.0.0.1` (bawaan) | hanya laptop itu sendiri | **mode laptop** |
| `0.0.0.0` | semua alamat laptop, termasuk `127.0.0.1` dan IP WiFi | **mode HP**; log menulis satu `Server listening at …` per alamat |
| `192.168.1.10` | hanya lewat IP WiFi | **salah**: `localhost:8080` ditolak (`ECONNREFUSED`), dashboard di laptop putus |

Vite punya sakelar yang sama: `npm run dev` hanya `localhost`, sedangkan `npm run dev:hp` (= `vite --host`) mendengar di semua alamat. `vite.config.ts` tidak diubah, jadi bawaannya tetap aman. Database tidak ikut dibuka: tetap `127.0.0.1:5432`, dan hanya backend yang memakainya.

**Asal baru, situs tetap satu.** Halaman `http://192.168.1.10:5173` di HP memanggil `http://192.168.1.10:8080` dengan sendirinya, karena `BASE` di `api.ts` mengikuti nama host halaman, dan soket memakai `BASE` yang sama. Asal halaman ini baru, jadi backend harus mengizinkannya: tambahkan `http://192.168.1.10:5173` ke `CORS_ORIGIN`. **Satu baris itu dipakai `fetch` dan Socket.IO sekaligus.** Di lab penulis, IP yang dicabut dari `CORS_ORIGIN` membuat soket ditolak berulang-ulang (Socket.IO menyebutnya `xhr poll error`): lencana tertahan di `Menyambung ulang…`, tab **Console** menulis pesan CORS, dan sesudah dimuat ulang, kotak `Tidak bisa menghubungi server di http://192.168.1.10:8080. …` muncul. **Situs** sebuah alamat IP adalah IP itu sendiri (port tidak dihitung), jadi `:5173` dan `:8080` satu situs, dan *cookie* `SameSite=Strict` tetap ikut, seperti di `localhost`. Hanya saja *cookie* melekat pada nama host: *login* di `localhost` tidak berlaku di alamat IP, bahkan di laptop yang sama (di lab penulis, alamat IP langsung menampilkan layar *login*). HP adalah browser lain, jadi di sana pun kamu masuk sendiri ([Modul 22 Konsep 9](../modul-22-react-dasar/README.md#9-login-dari-browser-cookie-cors-dan-localhost)).

**Siapa yang bisa mengetuk** (lanjutan [model ancaman Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#1-model-ancaman-siapa-yang-mungkin-iseng-dan-apa-akibatnya)). Selama mode HP menyala, **semua perangkat di WiFi rumah** bisa membuka formulir *login*, `/health`, `/docs`, dan dapur Vite, yang menyajikan kode sumbermu (aman selama frontend tidak menyimpan rahasia). Data tetap di balik *login*, soket pun berkunci, dan penebak sandi tertahan 10 percobaan per menit per IP. Yang belum ada adalah enkripsi: dashboard masih `http://`, jadi sandi, gelang, dan data *live* melintas apa adanya. Karena itu:

- **Mode HP hanya di WiFi rumah yang kamu percaya**, bukan WiFi kafe, kampus, atau kos. HTTPS dan akses dari internet menunggu Modul 27.
- **Di HP, masuk sebagai viewer**: hak sekecil mungkin cukup untuk melihat (tombol kendali baru di Modul 24).
- ***Firewall* Windows: izinkan Node.js hanya untuk jaringan Private**, dan pastikan profil WiFi rumahmu *Private* (Modul 10). Di jaringan berprofil *Public*, izin itu tidak berlaku. Itu lapisan pengaman kedua, tetapi jangan diandalkan sendirian.

**Mode HP dan mode laptop: sakelar per sesi.** Risiko terbesarnya bukan peretas, melainkan **lupa mengembalikan**. Karena itu, modul ini memberi nama pada kedua keadaan:

| Setelan | Mode laptop (bawaan, paling aman) | Mode HP (hanya selama sesi) |
| :--- | :--- | :--- |
| `HOST` | `127.0.0.1` | `0.0.0.0` |
| `CORS_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | sama, ditambah `,http://192.168.1.10:5173` |
| Vite | `npm run dev` | `npm run dev:hp` |
| Dibuka dari | `http://localhost:5173` | HP: `http://192.168.1.10:5173`; laptop tetap `localhost` |

Mode HP dinyalakan di [9.2](#92-backend-mode-hp-host-dan-cors_origin-10-menit) dan [9.3](#93-vite-mode-hp-npm-run-devhp-dan-firewall-private-10-menit), lalu dikembalikan di [10.4](#104-kembalikan-mode-laptop-5-menit), di akhir sesi dan selalu sebelum laptop dibawa ke jaringan lain. Di lab penulis, begitu mode laptop kembali, alamat IP itu langsung ditolak (`ERR_CONNECTION_REFUSED`).

![Diagram HP lewat WiFi rumah: mode HP dan mode laptop (Konsep 12), dengan contoh IP laptop 192.168.1.10 (IP-mu akan berbeda); masih http://, hanya di jaringan rumah. Kiri, kartu HP (Chrome atau Safari): membuka http://192.168.1.10:5173; masuk dengan akun viewer; cookie milik nama host ini, jadi login lagi di HP; cek dulu …:8080/health. Dari HP dua panah ungu melewati ikon router WiFi rumah (bukan WiFi tamu) ke laptop: panah atas :5173 halaman ke kotak Vite, panah bawah :8080 fetch + Socket.IO ke kotak backend. Kanan, kotak besar Laptop dengan IP WiFi 192.168.1.10 (contoh; cari dengan ipconfig). Di dalamnya: kotak ungu Vite, npm run dev:hp, sama dengan vite --host, mendengar di semua alamat; baris yang dipakai dari keluarannya Network: http://192.168.1.10:5173/ Wi-Fi. Kotak hijau backend v1.0, port 8080, isi backend/.env saat mode HP: HOST=0.0.0.0 dan CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173; satu baris CORS_ORIGIN dipakai fetch dan Socket.IO, dan berkas ini tidak ikut Git. Kotak browser laptop: tetap http://localhost:5173; cookie localhost tidak berlaku di alamat IP, dan sebaliknya. Kotak biru database (Docker): tetap 127.0.0.1:5432, hanya backend yang memakainya, HP tidak bisa menjangkaunya; panah dari backend ke database. Pita bergembok: firewall Windows, izinkan Node.js JavaScript Runtime, Private saja. Di bawahnya, tabel setelan dengan kolom mode laptop (bawaan, paling aman) dan mode HP (hanya selama sesi itu). Backend HOST: 127.0.0.1, lawan 0.0.0.0 (semua alamat laptop). Backend CORS_ORIGIN: http://localhost:5173,http://127.0.0.1:5173, lawan yang sama ditambah ,http://192.168.1.10:5173. Vite: npm run dev, lawan npm run dev:hp (sama dengan vite --host). Firewall Windows: tidak perlu, lawan izinkan Node.js, jaringan Private saja. Dibuka dari: http://localhost:5173, lawan HP di http://192.168.1.10:5173 sementara laptop tetap localhost. Database: 127.0.0.1, lawan 127.0.0.1 (tetap, tidak dibuka ke WiFi). Bawah, tiga kotak. Merah, jangan HOST=192.168.1.10: backend berhenti mendengar di 127.0.0.1, jadi dashboard di laptop tidak bisa menghubunginya. Putih, HP tidak kenal localhost: bagi HP, localhost adalah HP itu sendiri, jadi selalu tulis IP laptop, dan IP itu harus ada di CORS_ORIGIN. Ungu, akhiri sesi dengan kembali ke mode laptop sebelum laptop dibawa ke jaringan lain; internet + HTTPS menunggu Modul 27.](aset/jaringan-mode-hp.png)

Catatan jujur: semua langkah di atas dibuktikan penulis dari laptop yang membuka alamat IP WiFi-nya sendiri, bukan dari HP sungguhan, dan setelan *firewall* laptopnya sengaja tidak disentuh ([📚](#-sumber--atribusi-gambar)). Browser HP tidak punya DevTools; untuk melihat pesan galat di HP, pinjam DevTools laptop lewat kabel ([🔬](#-bedah-teknis-opsional) *Remote debugging*).

> ⬆️ **Sudah membaca Konsep 12?** Lanjut ke [Praktik 9 — Dashboard di HP lewat WiFi rumah](#praktik-9--dashboard-di-hp-lewat-wifi-rumah-60-menit), lalu [Praktik 10 — Uji kelulusan: *lint*, *build*, gladi bersih, dan mode laptop](#praktik-10--uji-kelulusan-lint-build-gladi-bersih-dan-mode-laptop-35-menit).

## 🔧 Praktik langkah demi langkah

Sepuluh praktik mengubah dashboard v0.1 yang **bertanya** menjadi dashboard v0.2 yang **didorong**, sedikit demi sedikit, di folder `frontend` repositori `rumah-pintar-mini`, cabang baru `fitur/dashboard-live`; backend v1.0, firmware, dan `alat/` tidak berubah. Praktik yang mengubah kode diakhiri *commit* ke cabang itu, yang baru digabung ke `main` lewat *pull request* "dashboard v0.2 (live)" di [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini).

Keadaan folder `frontend` di akhir setiap praktik ada di [`kode/tahap/`](kode/tahap/) (tahap 6 sama dengan tahap 5 karena Praktik 6 hanya mengukur), dan keadaan akhir v0.2.0 ada di [`kode/frontend/`](kode/frontend/). Folder tahap tanpa `node_modules`, `package-lock.json`, dan `README.md`, jadi pakailah untuk membandingkan berkas demi berkas, bukan untuk menggantikan seluruh foldermu. Langkah bertanda ⭐ (3.3, 4.4, 7.4, 9.5, dan 10.3) wajib untuk lulus. Setiap praktik memakai tumpukan [Langkah 1 Kemenangan Cepat](#langkah-1--nyalakan-semuanya-lalu-masuk-ke-dashboard-v01-4-menit).

### Praktik 1 — Soket berkunci dari browser (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan tiga terminal: `backend` (`npm run dev`), `frontend` (Vite), dan satu terminal kosong untuk Git dan npm (jalur laptop: broker dan simulator Kemenangan Cepat tetap menyala); **Docker Desktop** (`rumahpintar-db`); serta **Chrome** atau **Edge** dengan DevTools (tab **Network** dan **Console**). Konsep yang dipakai: 1–2 (sekilas 4).

Praktik ini memindahkan soket Kemenangan Cepat ke dashboard React dengan cara yang benar: **satu** sambungan untuk seluruh aplikasi, dibuka sesudah *login* dengan *cookie* yang sama, pulih sendiri sesudah putus, dan ditutup sebelum **Keluar**. Keadaannya tampil di kepala dashboard sebagai lencana **Live**, **Menyambung ulang…**, atau **Terputus**. Angka di kartu mulai bergerak di Praktik 2. Kode di akhir praktik ini: [`kode/tahap/praktik-1/frontend/`](kode/tahap/praktik-1/frontend/).

#### 1.1 Siapkan cabang `fitur/dashboard-live` (5 menit)

Di terminal kosong (folder `rumah-pintar-mini`), pindah ke `main` terbaru, lalu buat cabang untuk seluruh pekerjaan Modul 23:

```text
git switch main
git pull
git switch -c fitur/dashboard-live
```

`git pull` mengambil dashboard v0.1 hasil *pull request* Modul 22. Lalu jalankan `git status`: jawabannya harus `nothing to commit, working tree clean`. Kalau `frontend/public/coba-live.html` masih disebut, hapus dulu (Langkah 5 Kemenangan Cepat). Lalu masuk ke folder dashboard:

```text
cd frontend
```

#### 1.2 Pasang lima paket dengan versi tertulis (5 menit)

Hentikan dulu Vite di terminal `frontend` (**Ctrl + C**) supaya nanti ia mulai lagi dengan paket baru. Lalu, di terminal kosong tadi (folder `frontend`), pasang kelima paket minggu ini sekaligus: soket (praktik ini), toko (Praktik 1–2), jam relatif (Praktik 3), serta grafik dan *gauge* (Praktik 4–5; `react-is` pasangan Recharts). Internet hanya perlu sekali.

```text
npm install socket.io-client@4.8.4 zustand@5.0.16 recharts@3.10.1 react-is@19.3.1 date-fns@4.4.0
```

**Hasilnya (contoh):**

```text
added 50 packages, and audited 95 packages in 13s

14 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Lamanya beberapa detik sampai beberapa menit (laptop penulis yang sangat sibuk pernah mencatat `10m`), tanpa baris peringatan apa pun. `dependencies` di `package.json` kini memuat lima baris baru, misalnya `"socket.io-client": "^4.8.4"`; tanda `^` ditambahkan npm, sedangkan versi persisnya tercatat di `package-lock.json`. `"version"` tetap `0.1.0` sampai Praktik 10. Jalankan lagi `npm run dev` di terminal `frontend` dan pastikan dashboard masih terbuka di `http://localhost:5173`.

#### 1.3 Bagikan `BASE` dan `refreshSekali` dari `api.ts` (5 menit)

Soket di 1.4 butuh dua hal dari `src/api.ts` Modul 22: alamat backend `BASE` (soket harus menyambung ke alamat yang **sama** dengan `fetch` supaya *cookie*-nya ikut) dan [`refreshSekali()`](../modul-22-react-dasar/README.md#65-gelang-habis-refresh-sekali-di-apits-10-menit). Keduanya masih tersembunyi di dalam `api.ts`, jadi beri kata `export` di depannya. Buka [`kode/tahap/praktik-1/frontend/src/api.ts`](kode/tahap/praktik-1/frontend/src/api.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/api.ts`-mu. `BASE` hanya bertambah `export` dan satu komentar. `refreshSekali()` berubah sedikit lebih banyak: ia diekspor dan kini membedakan **dua** kegagalan (variabel `refreshBerjalan` di atasnya ikut bertipe `Promise<boolean | null> | null`):

```ts
// Modul 23: diekspor untuk soket.ts, dan kini membedakan dua kegagalan: false = DITOLAK backend (401: kartu terusan
// habis atau sudah logout), null = backend sedang tidak bisa melayani (mati, tidak bisa dihubungi, atau gangguan lain).
export function refreshSekali(): Promise<boolean | null> {
  if (refreshBerjalan === null) {
    // tanpa body, jadi juga TANPA Content-Type JSON (kalau diberi, backend menjawab 400)
    refreshBerjalan = fetch(BASE + "/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => {
        if (res.ok) return true; // 200 = gelang baru sudah dipasang di browser
        if (res.status === 401) return false; // ditolak: kartu terusan habis atau sudah logout
        return null; // kode lain, misalnya 500 saat database mati: sesinya belum tentu habis
      })
      .catch(() => null) // fetch gagal total: backend mati atau tidak bisa dihubungi
      .finally(() => {
        refreshBerjalan = null; // selesai: lain kali boleh refresh lagi
      });
  }
  return refreshBerjalan;
}
```

`true` = gelang baru terpasang. `false` = **ditolak** (401: kartu terusan habis atau kamu sudah **Keluar**, mungkin di tab lain); hanya inilah yang berarti "kembali ke *login*". `null` = backend **tidak bisa melayani** (mati, tak bisa dihubungi, atau 500 saat database mati); sesimu belum tentu habis, jadi soket cukup mencoba lagi. Di Modul 22, kegagalan apa pun bernilai `false`. `minta()` tidak diubah karena `null` tetap dianggap gagal di syarat `&& (await refreshSekali())`. Untuk soket, bedanya penting: backend yang sedang dimulai ulang tidak boleh menendangmu ke layar *login*. Simpan (**Ctrl + S**); dashboard berjalan seperti sebelumnya.

#### 1.4 Satu soket untuk seluruh aplikasi: `src/soket.ts` (10 menit)

**Langkah 1 — Tipe acara.** TypeScript perlu tahu nama acara dan isinya supaya salah ketik seperti `telemetri` langsung digarisbawahi merah. Buka [`kode/tahap/praktik-1/frontend/src/types.ts`](kode/tahap/praktik-1/frontend/src/types.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/types.ts`-mu. Yang baru hanya satu blok di akhir berkas, `// ---- Modul 23: acara Socket.IO …`, disalin dari tipe di backend (`backend/src/services/realtime.ts`), jadi nama acaranya persis Modul 19. `KeKlien` adalah acara dari server ke dashboard:

```ts
// acara dari server ke dashboard. Isinya berurutan, bukan satu objek: telemetry membawa DUA nilai (deviceId, isi).
export type KeKlien = {
  telemetry: (deviceId: string, isi: Telemetry) => void;
  status: (deviceId: string, status: "online" | "offline" | "offline-mode") => void;
  kejadian: (kejadian: Kejadian) => void;
};
```

Dua nilai itu persis bingkai `42["telemetry","f00d00000001",{…}]` di Kemenangan Cepat. `DariKlien` adalah arah sebaliknya: `ikuti` (dengan jawaban `JawabanIkuti` yang membawa `terbaru`) dan `berhenti`, keduanya mulai dipakai di Praktik 2. `kejadian` hanya dipakai di 🧩 Tingkat 2.

**Langkah 2 — Soketnya.** Klik kanan folder **`frontend/src`** → **New File…**, beri nama **`soket.ts`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-1/frontend/src/soket.ts`](kode/tahap/praktik-1/frontend/src/soket.ts) di GitHub, klik **Copy raw file**, lalu tempel). Garis merah di bawah `./toko` hilang sesudah 1.5.

```ts
// soket.ts - SATU sambungan Socket.IO untuk seluruh dashboard (Modul 23). Dibuat sekali di sini, di luar komponen,
// supaya StrictMode (yang memasang komponen dua kali di mode dev) tidak membuat sambungan kedua.
import { useEffect } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { BASE, refreshSekali } from "./api";
import { useToko } from "./toko";
import type { DariKlien, KeKlien } from "./types";

// Alamatnya SAMA dengan api.ts (BASE): halaman http://<IP-laptop>:5173 di HP otomatis menyambung ke http://<IP-laptop>:8080.
// withCredentials: true = bawa cookie login ke port lain (padanan credentials: "include" pada fetch). Tanpa ini,
// backend menjawab "belum login" walaupun fetch berhasil. autoConnect: false = baru menyambung sesudah login.
export const socket: Socket<KeKlien, DariKlien> = io(BASE, { withCredentials: true, autoConnect: false });

// useRealtime - dipanggil SEKALI di App. Selama sudah login: menyambung dan memulihkan sambungan.
// Saat keluar: semuanya dilepas. onSesiHabis = fungsi App yang kembali ke formulir login.
export function useRealtime(sudahLogin: boolean, onSesiHabis: () => void) {
  // Efek 1: sambungan selama login. Pendengarnya fungsi bernama, supaya cleanup melepas PERSIS fungsi yang sama
  // (socket.off(nama) tanpa fungsi akan melepas SEMUA pendengar acara itu, termasuk milik bagian lain).
  useEffect(() => {
    if (!sudahLogin) return;
    let ignore = false; // menjadi true saat efek dibereskan: hasil refresh yang datang terlambat diabaikan
    let gagalBeruntun = 0; // ditolak berapa kali berturut-turut walau sudah refresh

    // Perbarui gelang (POST /auth/refresh) dulu, baru sambung lagi: pola yang sama dengan alat/terminal-live.js.
    async function perbaruiLaluSambung() {
      const hasil = await refreshSekali();
      if (ignore) return;
      if (hasil === false) onSesiHabis(); // ditolak: sudah logout (mungkin di tab lain) atau kartu terusan habis
      else socket.connect(); // true = gelang baru terpasang; null = backend belum bisa melayani (kalau mati: Socket.IO mencoba terus)
    }

    function onConnect() {
      gagalBeruntun = 0;
      useToko.getState().setKoneksi("live");
    }
    function onDisconnect(alasan: string) {
      if (alasan === "io client disconnect") {
        useToko.getState().setKoneksi("terputus"); // kita sendiri yang memutus (Keluar): jangan menyambung lagi
        return;
      }
      useToko.getState().setKoneksi("menyambung");
      // "io server disconnect" = server SENGAJA memutus: gelang 15 menit habis, logout di tab lain, atau backend
      // dimatikan dengan rapi. Socket.IO tidak menyambung ulang sendiri untuk alasan ini, jadi kita yang memintanya.
      // Alasan lain (WiFi putus, backend mati mendadak atau dimulai ulang): Socket.IO menyambung ulang sendiri.
      if (alasan === "io server disconnect") void perbaruiLaluSambung();
    }
    function onConnectError() {
      useToko.getState().setKoneksi("menyambung");
      // socket.active = Socket.IO masih akan mencoba lagi sendiri (backend mati, atau alamat halaman tidak diizinkan)
      if (socket.active) return;
      // Ditolak penjaga pintu Socket.IO ("belum login" atau "sesi habis…"): gelang habis. Refresh, lalu sambung lagi.
      gagalBeruntun++;
      if (gagalBeruntun > 3) {
        useToko.getState().setKoneksi("terputus"); // ditolak terus walau sudah refresh: jangan berputar tanpa akhir
        return;
      }
      void perbaruiLaluSambung();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    useToko.getState().setKoneksi("menyambung");
    socket.connect();
    // StrictMode di mode dev: sambung, putus, sambung lagi. Tetap hanya SATU sambungan yang hidup.
    return () => {
      ignore = true;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [sudahLogin, onSesiHabis]);
}
```

Baca dari atas:

- **`io(BASE, { withCredentials: true, autoConnect: false })`** dijalankan **sekali**, saat berkas dimuat, di luar komponen. StrictMode memasang komponen dua kali, tetapi baris ini tidak ikut terulang, jadi soketnya tetap satu. `withCredentials: true` = kembaran `credentials: "include"` (tanpanya: `belum login`); `autoConnect: false` = jangan menyambung sebelum *login*.
- **`useRealtime(sudahLogin, onSesiHabis)`**, *hook* buatan sendiri yang dipanggil sekali di `App`, berisi satu `useEffect` "selama sudah *login*": pasang tiga pendengar, lalu `socket.connect()`; *cleanup*-nya melepas **ketiga fungsi yang sama**, lalu `socket.disconnect()` (Konsep 3).
- **Tiga pendengar** mengatur lencana dan pemulihan. `connect` → **Live**. `disconnect`: alasan `io client disconnect` (kita sendiri yang memutus, saat **Keluar**) → **Terputus**; `io server disconnect` (gelang habis, *logout* di tab lain, atau backend berhenti dengan rapi) → **Menyambung ulang…** lalu `perbaruiLaluSambung()`; alasan lain (WiFi putus, backend mati mendadak) → **Menyambung ulang…**, dan Socket.IO menyambung ulang sendiri. `connect_error` dengan `socket.active` = `true` berarti Socket.IO masih mencoba sendiri; `false` berarti penjaga pintu menolak (`belum login` atau `sesi habis…`), jadi *refresh* lalu sambung lagi. Masih ditolak sesudah tiga kali *refresh* berturut-turut → **Terputus**.
- **`perbaruiLaluSambung()`**: `false` → `onSesiHabis()` (layar *login*); `true` atau `null` → `socket.connect()`, dan selama backend mati, Socket.IO terus mencoba sendiri. `ignore` membuang jawaban *refresh* yang datang sesudah efeknya dibereskan.

Mengapa *refresh* dulu? Penjaga pintu Socket.IO hanya memeriksa gelang, sedangkan `/auth/refresh` memeriksa sesi di database. Di uji lab berjaringan lambat, cara "langsung sambung" membuat tab yang sesinya baru dihapus dari tab lain tetap **Live**; cara "*refresh* dulu" tidak ([Konsep 2](#2-soket-berkunci-cookie-yang-sama-gelang-yang-sama)).

#### 1.5 Sambung sesudah *login*, putus sebelum Keluar: `LencanaKoneksi` (10 menit)

**Langkah 1 — Toko kecil untuk satu nilai.** Lencana harus tahu keadaan soket, padahal yang mengubahnya `soket.ts`, di luar komponen. *State* `useState` (papan tulis kecil) milik satu komponen dan tidak bisa ditulis dari luar React. Karena itu kita memakai **toko** (*store*) Zustand: **papan pengumuman bersama** yang boleh ditulis siapa saja dan dibaca layar mana saja. Untuk sekarang isinya cukup **satu** nilai, `koneksi`. Buat berkas **`src/toko.ts`**:

```ts
// toko.ts - "toko" data live bersama untuk seluruh dashboard (Zustand). Komponen mana pun membaca isinya lewat
// selektor, dan soket.ts mengisinya dari luar React (useToko.getState()). Isinya hanya ada di memori tab ini:
// tidak ada yang disimpan di localStorage, dan semuanya hilang saat halaman dimuat ulang.
import { create } from "zustand";

// keadaan sambungan Socket.IO yang ditampilkan lencana di kepala
export type Koneksi = "menyambung" | "live" | "terputus";

type Toko = {
  koneksi: Koneksi;
  setKoneksi: (koneksi: Koneksi) => void;
};

// create<Toko>()(…): tanda kurung ganda memang cara menulisnya di TypeScript (Zustand 5).
export const useToko = create<Toko>()((set) => ({
  koneksi: "terputus",

  setKoneksi: (koneksi) => set({ koneksi }),
}));
```

`create<Toko>()(…)` membuat toko sekaligus *hook* `useToko`. `soket.ts` menulis lewat `useToko.getState().setKoneksi(…)`, di luar React; lencana membaca lewat **selektor** `useToko((s) => s.koneksi)`, yang hanya membaca satu baris dari papan pengumuman, jadi ia hanya digambar ulang saat nilai itu berubah. Toko ini tumbuh di Praktik 2; alasan dan aturan lengkapnya ada di [Konsep 4](#4-satu-toko-untuk-semua-layar-zustand-dan-selektor).

**Langkah 2 — Lencananya.** Buat berkas **`src/components/LencanaKoneksi.tsx`**:

```tsx
// LencanaKoneksi.tsx - lencana keadaan sambungan live di kepala dashboard: Live, Menyambung ulang…, atau Terputus.
// Angka yang tidak lagi diperbarui harus tampak basi, dan lencana inilah tanda pertamanya.
import { useToko } from "../toko";
import type { Koneksi } from "../toko";

const LENCANA: Record<Koneksi, { teks: string; warna: string }> = {
  live: { teks: "Live", warna: "bg-green-100 text-green-800" },
  menyambung: { teks: "Menyambung ulang…", warna: "bg-amber-100 text-amber-800" },
  terputus: { teks: "Terputus", warna: "bg-red-100 text-red-800" },
};

export default function LencanaKoneksi() {
  // selektor: ambil SATU nilai dari toko. Lencana ini hanya digambar ulang kalau nilai itu berubah.
  const koneksi = useToko((s) => s.koneksi);
  const { teks, warna } = LENCANA[koneksi];
  return <span className={"rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " + warna}>{teks}</span>;
}
```

Tiga keadaan, tiga warna (hijau, jingga, merah), dan **selalu dengan teks**: warna saja tidak terbaca oleh semua orang.

**Langkah 3 — `App` menyalakan soket.** Buka [`kode/tahap/praktik-1/frontend/src/App.tsx`](kode/tahap/praktik-1/frontend/src/App.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/App.tsx`-mu. Yang berubah: impor `useCallback`, `LencanaKoneksi`, `socket`, dan `useRealtime`; `<LencanaKoneksi />` di samping judul `Rumah Pintar Mini`; dan potongan ini, tepat sesudah fungsi `sudahMasuk`:

```tsx
  // Modul 23: useCallback = fungsi yang SAMA di setiap render App. Tanpa ini, setiap kali App digambar ulang (misalnya
  // pindah layar), efek yang bergantung pada sesiHabis ikut diulang: sambungan live diputus lalu disambung lagi.
  const sesiHabis = useCallback(() => {
    setGalatAwal("Sesi sudah habis. Silakan masuk lagi.");
    setPengguna(null);
  }, []);

  // Tombol Keluar minimal (disempurnakan di Modul 24): hapus sesi di backend, lalu kembali ke formulir.
  async function logout() {
    // Modul 23: putuskan sambungan live DULU (alasan "io client disconnect": tidak disambung ulang), baru hapus sesi.
    // Kalau terbalik, server yang memutus kita ("io server disconnect"), lalu soket mencoba menyambung lagi.
    socket.disconnect();
    try {
      await keluar();
    } catch {
      // backend tidak menjawab: layar tetap kembali ke formulir login
    }
    setPengguna(null);
  }

  // Modul 23: sambungan live (Socket.IO) hidup selama sudah login. Hook dipanggil sebelum "return" mana pun.
  const sudahLogin = pengguna !== null && pengguna !== "memuat";
  useRealtime(sudahLogin, sesiHabis);
```

- **`useCallback(fungsi, [])`** memberikan fungsi `sesiHabis` yang **sama** setiap kali `App` digambar ulang (di Modul 22 ia dibuat baru di setiap gambar). `useRealtime` memakainya sebagai dependensi efek: fungsi baru berarti efek diulang, dan soket putus-sambung setiap kali kamu pindah layar.
- **`logout()`** memutus soket **dulu**, baru `POST /auth/logout`, jadi alasan putusnya `io client disconnect` dan soket tidak mencoba menyambung lagi.
- **`useRealtime(…)`** dipanggil sebelum `return` pertama karena *hook* harus dipanggil dengan urutan yang sama di setiap gambar. Begitu `pengguna` terisi, efeknya menyambung; begitu kembali `null`, *cleanup*-nya memutus.

Simpan, lalu masuk dengan akun viewer kalau formulir *login* tampil.

**Hasilnya:** sesaat sesudah masuk, lencana hijau `Live` muncul di samping judul `Rumah Pintar Mini`. Kartu Daftar Perangkat masih sama dengan Modul 22 (status `online` berhuruf kecil, tanpa angka).

#### 1.6 Uji sambungannya: satu soket, putus-sambung, dan Keluar (10 menit)

Siapkan dulu: klik **Keluar**, buka DevTools (**F12**) → tab **Network**, kosongkan daftarnya dengan **Clear network log** (🚫), klik saringan **Socket** (versi lama: **WS**), lalu masuk lagi dengan akun viewer.

**Uji 1 — Satu soket walau StrictMode.** Saringan **Socket** hanya berisi **satu** baris `socket.io/?EIO=4&transport=…`.

**Hasilnya** (**contoh**, terminal backend, dipotong; jam, nomor akun, dan kode soketnya pasti berbeda):

```text
[16:28:22] INFO: POST /auth/login -> 200 (369 ms)
[16:28:22] INFO: GET /devices -> 200 (7 ms)
[16:28:22] INFO: GET /devices -> 200 (7 ms)
[16:28:22] INFO: klien realtime tersambung: w580hr-4zvSdYSm1AAAC (akun 2, viewer)
```

`GET /devices` tercatat dua kali karena StrictMode menjalankan efek dua kali di mode dev, tetapi `klien realtime tersambung` hanya **sekali**: soketnya satu. Baris `mengikuti` belum ada; `ikuti` baru datang di Praktik 2.

**Uji 2 — Backend dimatikan.** Di terminal backend, tekan **Ctrl + C** (kalau ditanya `Terminate batch job (Y/N)?`, ketik **Y**, lalu **Enter**). Lencana langsung menjadi `Menyambung ulang…`, dan tab **Console** menambah baris merah berisi `net::ERR_CONNECTION_REFUSED` setiap beberapa detik: Socket.IO sedang mencoba sendiri. Di Windows, backend **kadang** sempat menulis `SIGINT diterima: backend berhenti dengan rapi` (alasan `io server disconnect`, jadi dashboard *refresh* dulu), **kadang** langsung kembali ke *prompt* (alasan `transport close`); dashboard pulih di keduanya. Nyalakan lagi dengan `npm run dev`.

**Hasilnya** (**contoh**, terminal backend, dipotong):

```text
[16:28:50] INFO: Server listening at http://127.0.0.1:8080
…
[16:28:55] INFO: klien realtime tersambung: xBdv_y4pM2wTfYJLAAAA (akun 2, viewer)
```

Lencana kembali `Live` beberapa detik sesudah backend siap (di laptop penulis 4 dan 16 detik), tanpa diklik dan tanpa *login* ulang.

**Uji 3 — Berkas backend disimpan (`--watch`).** Buka `backend/src/server.ts` di VS Code, tambahkan satu baris kosong di paling akhir, lalu simpan. **Hasilnya:** terminal backend menulis `Restarting 'src/server.ts'`, lalu `klien realtime tersambung: …`; lencana `Menyambung ulang…` sekejap, lalu `Live` lagi dalam beberapa detik. Hapus baris kosong tadi dan simpan lagi.

**Uji 4 — Keluar dari tab lain.** Buka tab kedua di browser yang sama ke `http://localhost:5173` (langsung masuk, lencana `Live`), klik **Keluar** di tab **kedua**, lalu kembali ke tab pertama.

**Hasilnya:** tab pertama sudah pindah sendiri ke formulir *login* dengan kotak `Sesi sudah habis. Silakan masuk lagi.`, tanpa menyambung lagi. Di terminal backend (**contoh**):

```text
[16:29:18] INFO: klien realtime terputus: jA-xwNsq_5yGe1nZAAAB (client namespace disconnect)
[16:29:18] INFO: klien realtime terputus: GaARxOOsX5glbGktAAAA (server namespace disconnect)
[16:29:18] INFO: logout: sesi 4
[16:29:18] INFO: POST /auth/logout -> 200 (9 ms)
[16:29:18] INFO: POST /auth/refresh -> 401 (2 ms)
```

Tab kedua memutus soketnya sendiri (`client`), backend memutus soket tab pertama (`server`), lalu tab pertama bertanya ke `/auth/refresh` dan ditolak (`401`). Tutup tab kedua.

**Uji 5 — Tombol Keluar.** Masuk lagi di tab pertama, lalu klik **Keluar**.

**Hasilnya** (**contoh**, terminal backend):

```text
[16:29:35] INFO: klien realtime terputus: t0PbSIlkue4BLq7hAAAC (client namespace disconnect)
[16:29:35] INFO: logout: sesi 5
[16:29:35] INFO: POST /auth/logout -> 200 (13 ms)
```

Soket diputus **dulu**, baru sesinya dihapus, dan sesudahnya tidak ada `klien realtime tersambung` baru.

Dua keadaan lain tidak perlu ditunggu. Sesudah 15 menit, backend memutus soket tepat saat gelang habis; dashboard *refresh* sekali dan tersambung lagi di detik yang sama. Lencana `Terputus` muncul kalau penjaga pintu tetap menolak sesudah tiga kali *refresh*, misalnya gelang habis saat database mati; dashboard berhenti mencoba, jadi bereskan penyebabnya, tunggu database siap, lalu muat ulang halaman (**F5**). Lencana yang tidak pernah `Live` dibahas di [🚨](#-kalau-tidak-jalan).

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` seharusnya menyebut lima berkas berubah (`package.json`, `package-lock.json`, `src/App.tsx`, `src/api.ts`, `src/types.ts`) dan tiga berkas baru (`src/soket.ts`, `src/toko.ts`, `src/components/LencanaKoneksi.tsx`). Kalau `../backend/src/server.ts` ikut disebut, jalankan `git restore ../backend/src/server.ts`. Lalu simpan:

```text
git add package.json package-lock.json src
git commit -m "Soket berkunci: satu sambungan live dan lencana koneksi (Modul 23 Praktik 1)"
```

> ⬆️ **Selesai Praktik 1?** Soketmu sudah berkunci dan pulih sendiri, tetapi angkanya belum bergerak: belum ada pendengar `telemetry` dan perangkat yang diikuti. Baca [Konsep 3](#3-useeffect-untuk-berlangganan-pasang-pendengar-lepas-di-cleanup) dan [Konsep 4](#4-satu-toko-untuk-semua-layar-zustand-dan-selektor), lalu lanjut ke [Praktik 2 — Toko Zustand: angka bergerak sendiri](#praktik-2--toko-zustand-angka-bergerak-sendiri-50-menit).

### Praktik 2 — Toko Zustand: angka bergerak sendiri (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 1 yang masih menyala (`backend` dengan `npm run dev`, `frontend` dengan Vite; jalur laptop juga broker dan simulator) plus satu terminal kosong di folder `frontend` untuk Git; **Docker Desktop** (`rumahpintar-db` menyala); **Chrome atau Edge** di `http://localhost:5173` dengan DevTools (tab **Network**); dan **Bruno** di 2.5. Konsep yang dipakai: 3–4.

Sesudah Praktik 1, lencana sudah **Live**, tetapi angkanya masih diam: Detail mengambil bacaan **sekali** lewat `GET /devices/:id/latest`, persis Modul 22. Modul 22 berjanji angkanya akan bergerak sendiri di modul ini, dan praktik inilah yang menepatinya. Jalannya satu arah:

```text
perangkat → broker → backend → acara telemetry → onTelemetry (soket.ts) → terima() → toko → selektor → kartu
```

Pendengar di `src/soket.ts` menulis setiap acara ke toko, papan pengumuman bersama (Konsep 4), lalu setiap kartu hanya membaca barisnya sendiri. Tidak ada tombol, tidak ada pengatur waktu. Dua hal dari Silabus kamu tulis di sini: *state management* ringan supaya data *live* tersedia di semua layar (2.1), dan `useEffect` untuk berlangganan serta berhenti berlangganan (2.2–2.3).

#### 2.1 Papan pengumuman bersama di `src/toko.ts`: perangkat, status, dan bacaan terbaru (15 menit)

Toko Praktik 1 hanya berisi `koneksi`. Kini ia mendapat tiga baris lagi beserta aksi yang mengisinya:

| Baris | Isinya | Diisi oleh |
| :-- | :-- | :-- |
| `perangkat` | daftar dari `GET /devices` (`null` = belum dimuat) | `setPerangkat`, dari Daftar Perangkat (2.3) |
| `status` | status setiap perangkat, berkunci `device_id` | `setPerangkat` (status awal dari database), lalu `setStatus` dari acara `status` |
| `terbaru` | bacaan terakhir setiap perangkat, berkunci `device_id` | `isiTerbaru` dari jawaban `ikuti`, lalu `terima` dari acara `telemetry` |

Berkasnya pendek dan hampir seluruhnya berubah, jadi ganti seluruh isi `src/toko.ts` dengan kode di bawah (atau buka [`kode/tahap/praktik-2/frontend/src/toko.ts`](kode/tahap/praktik-2/frontend/src/toko.ts) di GitHub, klik **Copy raw file**, lalu tempel):

```ts
// toko.ts - "toko" data live bersama untuk seluruh dashboard (Zustand). Komponen mana pun membaca isinya lewat
// selektor, dan soket.ts mengisinya dari luar React (useToko.getState()). Isinya hanya ada di memori tab ini:
// tidak ada yang disimpan di localStorage, dan semuanya hilang saat halaman dimuat ulang.
import { create } from "zustand";
import type { Perangkat, StatusPerangkat, Telemetry } from "./types";

// keadaan sambungan Socket.IO yang ditampilkan lencana di kepala
export type Koneksi = "menyambung" | "live" | "terputus";

type Toko = {
  koneksi: Koneksi;
  perangkat: Perangkat[] | null; // jawaban GET /devices; null = belum dimuat
  // Partial<Record<string, …>> = "kamus" ber-kunci device_id. Partial: isinya boleh belum ada (undefined).
  status: Partial<Record<string, StatusPerangkat>>;
  terbaru: Partial<Record<string, Telemetry>>; // bacaan terakhir tiap perangkat
  setKoneksi: (koneksi: Koneksi) => void;
  setPerangkat: (daftar: Perangkat[]) => void;
  setStatus: (deviceId: string, status: StatusPerangkat) => void;
  isiTerbaru: (deviceId: string, isi: Telemetry) => void;
  terima: (deviceId: string, isi: Telemetry) => void;
};

// create<Toko>()(…): tanda kurung ganda memang cara menulisnya di TypeScript (Zustand 5).
// set() menggabung isi baru dengan isi lama, tetapi hanya SATU tingkat: kamus di dalamnya (status, terbaru, …)
// harus kita salin sendiri dengan { ...lama, [kunci]: nilai }, jangan diubah langsung.
export const useToko = create<Toko>()((set) => ({
  koneksi: "terputus",
  perangkat: null,
  status: {},
  terbaru: {},

  setKoneksi: (koneksi) => set({ koneksi }),

  // daftar dari GET /devices: status ikut diisi dari database
  setPerangkat: (daftar) =>
    set((s) => {
      const status = { ...s.status };
      for (const p of daftar) {
        status[p.device_id] = p.status;
      }
      return { perangkat: daftar, status };
    }),

  // acara "status": dikirim server hanya saat status perangkat berubah
  setStatus: (deviceId, status) => set((s) => ({ status: { ...s.status, [deviceId]: status } })),

  // bacaan terakhir dari jawaban "ikuti": nilai awal, BUKAN kiriman baru dari perangkat
  isiTerbaru: (deviceId, isi) => set((s) => ({ terbaru: { ...s.terbaru, [deviceId]: isi } })),

  // acara "telemetry": kiriman baru dari perangkat
  terima: (deviceId, isi) =>
    set((s) => ({
      terbaru: { ...s.terbaru, [deviceId]: isi },
    })),
}));
```

- **`Partial<Record<string, …>>`** adalah kamus: kuncinya `device_id`, isinya status atau bacaan perangkat itu. `Partial` berarti isinya boleh **belum ada** (`undefined`), jadi TypeScript memaksa setiap pembacanya menyiapkan keadaan itu (`?.suhu`, `?? p.status`, pesan "belum ada bacaan").
- **`setPerangkat`** menyalin kamus `status`, mengisi status awal dari database untuk setiap perangkat, lalu memanggil `set` **sekali** untuk seluruh daftar. Sesudahnya, acara `status` hanya datang saat status berubah, dan `setStatus` mengganti satu isi kamus itu.
- **`isiTerbaru` dan `terima`** isinya kini sama, tetapi artinya berbeda: yang pertama mengisi angka awal dari ingatan backend, yang kedua mencatat kiriman **baru**. Mulai Praktik 3, hanya `terima` (bukan `isiTerbaru`) yang memperbarui "terakhir dilihat", dan di Praktik 4 hanya `terima` yang menambah titik *live* ke grafik.
- `terakhirDilihat`, `jendela`, dan `KOSONG` belum ada; ketiganya menyusul di Praktik 3 dan 4. Semuanya tetap di memori tab, tidak di `localStorage`.

Simpan (**Ctrl + S**). Layar belum berubah, karena belum ada yang mengisi atau membaca baris barunya.

#### 2.2 Pendengar `telemetry` dan `status` di `useRealtime` (15 menit)

Buka [`kode/tahap/praktik-2/frontend/src/soket.ts`](kode/tahap/praktik-2/frontend/src/soket.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/soket.ts`-mu. Efek sambungan Praktik 1 (pemulihan, lencana, **Keluar**) tidak berubah. Yang baru: `Perangkat`, `StatusPerangkat`, dan `Telemetry` di baris `import type`, tiga fungsi di atas `useRealtime`, satu baris `ikutiSemua();` di `onConnect`, dua pendengar, dan efek kedua di paling bawah (dibahas di 2.3).

**Tiga fungsi untuk mengikuti perangkat**, tepat di bawah baris `export const socket`:

```ts
// Hanya perangkat yang kirimannya diterima backend yang diikuti. Kiriman perangkat yang kuncinya dicabut atau
// belum terdaftar diabaikan backend (Modul 21), jadi acaranya tidak akan pernah datang.
function bolehDiikuti(p: Perangkat): boolean {
  return p.kunci === "aktif" || p.kunci === "tanpa-kunci";
}

// "ikuti" WAJIB memakai ack (jawaban): tanpa fungsi jawaban, server diam-diam tidak memasukkan kita ke room perangkat itu.
async function ikuti(deviceId: string) {
  try {
    const jawaban = await socket.timeout(5000).emitWithAck("ikuti", deviceId);
    // terbaru = bacaan terakhir yang diingat backend; null kalau backend baru dinyalakan
    if (jawaban.ok && jawaban.terbaru) useToko.getState().isiTerbaru(deviceId, jawaban.terbaru);
  } catch {
    // tidak dijawab dalam 5 detik (sambungan putus di tengah jalan): diikuti lagi saat tersambung lagi
  }
}

// ikuti semua perangkat di daftar. Room hilang setiap kali sambungan putus, jadi ini diulang di setiap "connect".
function ikutiSemua() {
  for (const p of useToko.getState().perangkat ?? []) {
    if (bolehDiikuti(p)) void ikuti(p.device_id);
  }
}
```

- **`bolehDiikuti()`** hanya meloloskan kunci `aktif` dan `tanpa-kunci` (Node 2, yang datanya diteruskan Node 1). Perangkat yang kuncinya dicabut atau belum terdaftar tetap dijawab `ok`, tetapi acaranya tidak pernah datang, jadi tidak perlu diikuti.
- **`ikuti()`** menunggu jawaban paling lama 5 detik (`emitWithAck`, Konsep 1). `terbaru` di jawaban itu adalah bacaan terakhir yang diingat backend; `isiTerbaru` menaruhnya di toko sebagai **angka awal**, jadi kartu tidak kosong selama menunggu kiriman berikutnya. Tidak dijawab dalam 5 detik? `catch` diam saja, dan `ikuti` diulang saat tersambung lagi.
- **`void ikuti(…)`**: `ikuti()` adalah fungsi `async`; `void` berarti "jalankan, tidak perlu ditunggu", jadi semua perangkat diikuti bersamaan.
- **`ikutiSemua()`** membaca daftar lewat `useToko.getState()`, dari luar React. Ia dipanggil di `onConnect`, karena kamar (*room*) di backend hilang setiap kali sambungan putus: setiap sambungan baru mengikuti ulang semuanya.

**Dua pendengar baru** di dalam efek sambungan, bersama tiga pendengar Praktik 1:

```ts
    function onTelemetry(deviceId: string, isi: Telemetry) {
      useToko.getState().terima(deviceId, isi);
    }
    function onStatus(deviceId: string, status: StatusPerangkat) {
      useToko.getState().setStatus(deviceId, status);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("telemetry", onTelemetry);
    socket.on("status", onStatus);
```

`onTelemetry` menerima dua nilai berurutan, `device_id` lalu isinya, persis bingkai `42["telemetry","f00d00000001",{…}]` di Kemenangan Cepat, dan hanya meneruskannya ke toko. `onStatus` juga begitu; acara `status` datang hanya saat status sebuah perangkat berubah. Pasangannya ada di *cleanup*, tepat di atas `socket.disconnect()`: `socket.off("telemetry", onTelemetry);` dan `socket.off("status", onStatus);` (aturan pasang-lepas Konsep 3).

Simpan. Layarnya masih sama: `perangkat` di toko masih `null`, jadi `ikutiSemua()` belum punya apa pun untuk diikuti, dan tanpa `ikuti`, backend tidak mendorong `telemetry` ke soketmu.

#### 2.3 Daftar Perangkat mengisi toko dan mengikuti perangkatnya (10 menit)

**Langkah 1 — Daftar ditaruh di toko.** Ganti seluruh isi `src/components/DaftarPerangkat.tsx` dengan [`kode/tahap/praktik-2/frontend/src/components/DaftarPerangkat.tsx`](kode/tahap/praktik-2/frontend/src/components/DaftarPerangkat.tsx) (**Copy raw file**). Papan tulis `perangkat` milik komponen ini (`useState`) diganti dua selektor:

```tsx
  const perangkat = useToko((s) => s.perangkat); // null = masih memuat
  const setPerangkat = useToko((s) => s.setPerangkat);
```

Efeknya tetap mengambil `GET /devices` seperti di Modul 22, tetapi jawabannya ditulis ke toko, sehingga `soket.ts` ikut tahu perangkat mana yang harus diikuti. `setPerangkat` masuk daftar dependensi efek (`[onSesiHabis, setPerangkat]`); aksi toko tidak pernah berganti, jadi daftar tetap diambil sekali setiap kali layar ini dibuka.

**Setiap kartu memilih datanya sendiri.** Isi kartu pindah ke komponen kecil `KartuPerangkat` di berkas yang sama, yang membaca status dan suhunya sendiri:

```tsx
function KartuPerangkat({ p, onPilih }: { p: Perangkat; onPilih: (perangkat: Perangkat) => void }) {
  const status = useToko((s) => s.status[p.device_id]) ?? p.status;
  const suhu = useToko((s) => s.terbaru[p.device_id]?.suhu); // undefined = belum ada bacaan; null = sensor gagal
```

- Selektor adalah *hook*, dan *hook* tidak boleh dipanggil di dalam `map`; karena itu setiap kartu menjadi komponen sendiri. Bonusnya, kiriman `f00d00000001` hanya menggambar ulang kartu `f00d00000001` (Konsep 4).
- **`?? p.status`**: selama acara `status` belum datang, pakai status dari `GET /devices`.
- Baris baru di bawah lokasi: `Suhu 28.5 °C`, `Suhu —` (sensor gagal), `menunggu bacaan…` (belum ada bacaan sejak backend dinyalakan), atau `kiriman diabaikan backend` untuk kunci dicabut dan belum terdaftar.

**Langkah 2 — Efek kedua di `soket.ts`: ikuti dan berhenti.** Kamu sudah menempelnya di 2.2; letaknya di paling bawah `useRealtime`:

```ts
  // Efek 2: ikuti perangkat di daftar, berhenti di cleanup. Selektor ini mengembalikan SATU teks berisi device_id
  // dipisah koma ("a4cf12e5b7c0,f00d00000001"). Teks yang sama = tidak berubah, jadi efek (dan App) hanya diulang
  // kalau daftar perangkatnya benar-benar berubah, bukan setiap kali telemetry tiba.
  const daftarId = useToko((s) => (s.perangkat ?? []).filter(bolehDiikuti).map((p) => p.device_id).join(","));
  useEffect(() => {
    if (daftarId === "") return;
    const semuaId = daftarId.split(",");
    // belum tersambung? Tidak apa-apa: onConnect mengikuti semuanya begitu tersambung
    if (socket.connected) for (const id of semuaId) void ikuti(id);
    return () => {
      if (socket.connected) for (const id of semuaId) socket.emit("berhenti", id);
    };
  }, [daftarId]);
```

Inilah `useEffect` untuk berlangganan: `ikuti` setiap perangkat saat efek berjalan, `berhenti` untuk perangkat yang sama di *cleanup*. Kalau daftar tiba sebelum soket tersambung, efek ini tidak mengirim apa-apa, dan `onConnect` yang mengikuti semuanya. `daftarId` sengaja berupa **teks**: larik baru di setiap pemanggilan berujung `Maximum update depth exceeded` (Konsep 4), sedangkan teks yang isinya sama lolos `===`. `?? []` di dalamnya aman, karena yang dikembalikan selektor adalah teks hasil `join`.

Simpan, lalu tekan **F5** supaya dashboard mulai dari toko yang kosong. Kamu tetap masuk (*cookie*-nya masih ada) dan mendarat di Daftar Perangkat.

**Hasilnya** (**contoh** dari lab penulis, dengan simulator `f00d00000001` ditemani Node 1 dan Node 2 tiruan; `Suhu 33 °C` sisa uji `suhu 33` sebelumnya, punyamu acak 25–33 °C; teks setiap kartu dibaca berurutan, padahal di layar tersusun beberapa baris):

```text
Node 2 kebun online lewat penghubung kebun · 246f28b1c7d4 Suhu 27.4 °C
Node 1 ruang tamu online kunci aktif ruang tamu · a4cf12e5b7c0 Suhu 28.5 °C
Perangkat uji (penyusup) kunci dicabut meja kerja · c0ba00000001 kiriman diabaikan backend
Latihan ruang tamu online kunci aktif ruang tamu · f00d00000001 Suhu 33 °C
```

Diamkan ±30 detik: suhu **Latihan ruang tamu** berganti sendiri setiap ±10 detik. Terminal backend menulis satu baris `klien … mengikuti …` untuk setiap perangkat yang diikuti (di lab penulis tiga: `246f28b1c7d4`, `a4cf12e5b7c0`, dan `f00d00000001`), tidak untuk perangkat penyusup. Jalur laptop: kartu perangkat yang tidak pernah mengirim (Node 1 dan Node 2, kalau ada di daftarmu) menulis `menunggu bacaan…`. Daftarmu mungkin juga memuat **Latihan teras** (`f00d00000002`, belum terdaftar sejak Modul 21) dengan `kiriman diabaikan backend`; di lab penulis kartunya baru muncul di 7.1.

> [!TIP]
> Lencana **Live**, tetapi semua kartu tetap `menunggu bacaan…`? Periksa `ikuti` dan `onConnect` di [🚨](#-kalau-tidak-jalan) *Lencana `Live`, tetapi angkanya diam*.

#### 2.4 Detail Perangkat membaca dari toko (5 menit)

Detail tidak perlu bertanya lagi: bacaan terbaru setiap perangkat yang diikuti sudah ada di toko.

1. Ganti seluruh isi `src/components/DetailPerangkat.tsx` dengan [`kode/tahap/praktik-2/frontend/src/components/DetailPerangkat.tsx`](kode/tahap/praktik-2/frontend/src/components/DetailPerangkat.tsx) (**Copy raw file**). `useEffect`, tiga papan tulis (`bacaan`, `galat`, `belumAda`), dan `ambilTerbaru()` hilang, diganti tiga selektor:

   ```tsx
     // Selektor sempit: komponen ini hanya digambar ulang kalau nilai milik perangkat INI berubah.
     const bacaan = useToko((s) => s.terbaru[id]); // undefined = belum ada bacaan
     const status = useToko((s) => s.status[id]) ?? perangkat.status;
     const live = useToko((s) => s.koneksi === "live");
   ```

2. Di `src/App.tsx`, hapus baris `onSesiHabis={sesiHabis}` di dalam `<DetailPerangkat … />`; yang di dalam `<DaftarPerangkat … />` tetap. Detail tidak meminta apa pun ke backend, jadi tidak ada 401 yang perlu dilaporkannya.
3. Di `src/api.ts`, hapus fungsi `ambilTerbaru()` di paling bawah beserta dua baris komentar di atasnya, lalu ubah baris `import type` paling atas menjadi `import type { Pengguna, Perangkat } from "./types";`. Di `src/types.ts`, hapus tipe `BacaanTerbaru` beserta komentar `// jawaban GET /devices/:id/latest` di atasnya. Ragu? Salin ketiga berkas itu utuh dari [`kode/tahap/praktik-2/frontend/src/`](kode/tahap/praktik-2/frontend/src/).

Detail memilih satu isi, berurutan:

- **Ada `bacaan`**: kartu seperti Modul 22, di bawah baris `node1 · online · diperbarui pukul … WIB` yang statusnya kini ikut toko.
- **Belum ada, karena kuncinya**: pesan belum terdaftar (sama dengan Modul 22) atau kunci dicabut tetap didahulukan. Pesan dicabut kini lebih pendek, dan kotak merah di atasnya berakhir `… jadi dashboard tidak mengikutinya.`
- **Belum ada, dan lencana bukan Live**: `Menunggu sambungan live…`, karena angka awal datang lewat jawaban `ikuti`, dan `ikuti` baru dikirim sesudah tersambung.
- **Belum ada, padahal sudah Live**: biasanya backend baru dinyalakan ulang, sehingga jawaban `ikuti` membawa `terbaru` bernilai `null`. Pesannya `Belum ada bacaan dari perangkat ini sejak backend dinyalakan. Angkanya muncul sendiri begitu perangkat mengirim (Node 1: paling lama 10 detik; Node 2: 5 menit).`, dan kali ini kamu tidak perlu membuka ulang Detail.

Jadi, angka awal tahap ini datang dari jawaban `ikuti`. Praktik 4 menambah sumber kedua, bacaan terakhir dari isi awal grafik 5 menit ([4.1](#41-jendela-geser-di-toko-isi-awal-dari-api-lalu-bacaan-live-15-menit)), supaya Detail tidak menulis "belum ada bacaan" padahal database masih menyimpannya.

Simpan semua berkas, lalu buka **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**).

**Hasilnya (contoh):** isinya langsung tampil, tanpa `Memuat bacaan…`: baris `node1 · online · diperbarui pukul 16.33.05 WIB`, lalu delapan kartu, dari **Suhu** (di lab masih `33` °C, sisa uji sebelumnya) sampai **Lampu** `Mati` dan **Kipas** `Mati`. Di tab **Network**, membuka Detail tidak lagi menambah baris `latest`: angkanya sudah ada di toko sejak Daftar. ±10 detik kemudian, tanpa diklik, angka-angka dan jam `diperbarui pukul …`-nya berganti.

#### 2.5 Uji: `suhu 33` dan lampu dari Bruno (5 menit)

Biarkan Detail **Latihan ruang tamu** terbuka (jalur perangkat: **Node 1 ruang tamu**), lalu uji dua jalan kiriman.

**Kiriman berkala: `suhu 33`** (jalur laptop). Di terminal simulator, ketik `suhu 33`, tekan **Enter**, lalu perhatikan kartu **Suhu**.

**Hasilnya (contoh):** terminal simulator menampilkan ketikanmu dan jawabannya

```text
suhu 33
Suhu: 33.0 °C
```

dan kartu **Suhu** menjadi `33` °C pada kiriman **berikutnya**, tanpa diklik. Di lab penulis, tiga percobaan berjarak 4,9 detik, 3,9 detik, dan 4,6 detik dari **Enter**. Jaraknya bergantung pada sisa waktu sampai kiriman berkala berikutnya (tiap 10 detik), jadi wajarnya 0–10 detik, paling lama ±11 detik. Kembalikan dengan `suhu acak` (simulator menjawab `Suhu: acak 25,0-33,0 °C`).

Jalur perangkat tidak punya perintah `suhu 33`: cukup perhatikan angka Node 1 berganti setiap ±10 detik. Menutup LDR dicoba di [4.4](#44--garisnya-bergerak-sendiri-suhu-33-lampu-atau-ldr-10-menit), bersama grafiknya.

**Kiriman segera: lampu dari Bruno** (kedua jalur).

1. Di Bruno (koleksi `backend/bruno`, *environment* `lokal`), kirim **`login admin`**: viewer hanya boleh membaca, sedangkan perintah ke perangkat butuh admin (Modul 20). Bruno menyimpan *cookie*-nya sendiri, jadi dashboard tetap masuk sebagai viewer.
2. Buka **`nyalakan lampu`**. Jalur laptop: di URL-nya, ganti `a4cf12e5b7c0` dengan `f00d00000001` (jangan tekan **Ctrl + S**). Klik **Send** sambil melirik kartu **Lampu** di dashboard.
3. Lakukan hal yang sama dengan **`matikan lampu`**.
4. Tutup kedua tab permintaan itu. Kalau dialog `Unsaved changes` muncul, klik **Don't Save**.

**Hasilnya (contoh):** Bruno menjawab `200` berisi `id` perintah, `lama_ms`, dan `ack` dengan `ok` bernilai `true` serta keadaan `lampu` yang baru. Kartu **Lampu** berganti `Mati` → `Nyala`, lalu `Nyala` → `Mati`, praktis bersamaan dengan jawaban Bruno: di lab penulis 0,01–0,07 detik sesudah permintaan dikirim. Jalur laptop: terminal simulator mencatat setiap perintah:

```text
f00d00000001: perintah c-20261024-093423-1 -> ok=true
f00d00000001: perintah c-20261024-093429-2 -> ok=true
```

Bruno versi baris perintah tidak terpasang di laptop lab, jadi penulis mengirim permintaan yang sama (alamat, isi, dan akun admin) lewat skrip; panel Bruno-nya sendiri tidak direkam.

**Mengapa lampu jauh lebih cepat?** Begitu aktuator berubah, perangkat langsung mengirim `telemetry` tanpa menunggu jadwal 10 detik (kiriman segera, sejak kontrak data 1.3), sedangkan `suhu 33` menunggu kiriman berkala berikutnya. Jalan cepat inilah yang dipakai syarat lulus pertama di [4.4](#44--garisnya-bergerak-sendiri-suhu-33-lampu-atau-ldr-10-menit), kali ini dengan garis grafik.

Mau melihat pesannya? Di DevTools, buka tab **Network** → saringan **Socket** → baris `socket.io/?EIO=4…` → tab **Messages** (seperti Kemenangan Cepat Langkah 4). Setiap perubahan tadi tiba sebagai `42["telemetry","f00d00000001",{…}]`, dan `telemetry` perangkat lain yang diikuti ikut berdatangan walau hanya satu Detail yang terbuka.

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), jalankan `npm run lint`; keluarannya harus memuat `Found 0 warnings and 0 errors.` Lalu `git status`: tujuh berkas berubah (`src/App.tsx`, `src/api.ts`, `src/types.ts`, `src/toko.ts`, `src/soket.ts`, dan kedua komponen), tanpa berkas baru. Simpan:

```text
git add src/toko.ts src/soket.ts src/api.ts src/types.ts src/App.tsx src/components/DaftarPerangkat.tsx src/components/DetailPerangkat.tsx
git commit -m "Toko Zustand: angka bergerak sendiri (Modul 23 Praktik 2)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-2/frontend/`](kode/tahap/praktik-2/frontend/). Biarkan semuanya menyala kalau langsung lanjut.

> ⬆️ **Selesai Praktik 2?** Angka di Daftar dan Detail kini bergerak sendiri, tetapi kartunya belum memberi tahu seberapa segar angka itu, dan status `offline` masih berlencana abu-abu. Baca [Konsep 6](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling) dan [Konsep 7](#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi), lalu lanjut ke [Praktik 3 — Kartu status merah/hijau dan "terakhir dilihat"](#praktik-3--kartu-status-merahhijau-dan-terakhir-dilihat-40-menit).

### Praktik 3 — Kartu status merah/hijau dan "terakhir dilihat" (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 2 (`backend`, Vite di `frontend`, dan satu terminal kosong di folder `frontend` untuk Git; jalur laptop: broker di `edge` dan simulator di `alat`), **Docker Desktop** (`rumahpintar-db`), dan **Chrome atau Edge** di `http://localhost:5173`. Jalur perangkat: Node 1 dengan kabel USB yang mudah dicabut. Bruno tidak dipakai. Konsep yang dipakai: 6–7.
>
> ⭐ **Wajib** — langkah 3.3: hentikan pengirimnya, lihat kartunya memerah dan "terakhir dilihat" terus bertambah sampai `data basi`, lalu nyalakan lagi sampai kartunya hijau.

Angka di dashboard-mu sudah bergerak sendiri, tetapi kartunya belum menjawab dua pertanyaan Konsep 7: **sudah berapa lama ia diam** dan **masih segarkah angkanya**? Praktik ini mengubah lencana menjadi `Online` hijau dan `Offline` merah (tepi kiri kartu ikut berwarna), lalu menambah tulisan `terakhir dilihat … yang lalu` yang bertambah sendiri serta tanda `· data basi`. Tidak ada permintaan baru ke backend: status tetap datang lewat acara `status`, bacaan lewat `telemetry`, dan detik di layar dihitung jam browser.

#### 3.1 Jam yang berdetak dan jam relatif: `src/waktu.ts` (15 menit)

Urusan jam dipakai banyak komponen: kartu Daftar dan Detail di sini, grafik di Praktik 4, Riwayat di Praktik 7. Jadi semuanya dikumpulkan di satu berkas.

**Langkah 1 — Berkas baru.** Di VS Code, klik kanan folder **`frontend/src`** → **New File…**, beri nama **`waktu.ts`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-3/frontend/src/waktu.ts`](kode/tahap/praktik-3/frontend/src/waktu.ts) di GitHub, klik **Copy raw file**, lalu tempel):

```ts
// waktu.ts - urusan jam di layar: jam WIB, "… detik yang lalu", batas data basi, dan detak 1 detik.
import { formatDistanceStrict } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { Jenis } from "./types";

export const MENIT = 60 * 1000; // dalam milidetik, satuan yang dipakai Date.now()

// useSekarang - jam yang berdetak (pola useTime dari react.dev). Komponen yang memakainya digambar ulang tiap detik,
// jadi tulisan "12 detik yang lalu" ikut bertambah. Ini JAM, bukan polling: tidak ada permintaan ke server.
export function useSekarang(setiapMs = 1000): number {
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const pewaktu = setInterval(() => setSekarang(Date.now()), setiapMs);
    return () => clearInterval(pewaktu); // cleanup: hentikan detaknya saat komponen hilang dari layar
  }, [setiapMs]);
  return sekarang;
}

// "16.27.10 WIB", apa pun zona waktu laptop atau HP-nya (timeZone ditulis jelas, seperti di Modul 22)
export function jamWib(t: string | number): string {
  return new Date(t).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
}

// jamRelatif - "45 detik yang lalu", "3 menit yang lalu" (date-fns dengan bahasa Indonesia).
// Di bawah 5 detik ditulis "baru saja": date-fns menulis "0 detik yang lalu", dan jam server yang sedikit lebih
// cepat dari jam HP bisa membuat selisihnya negatif ("dalam waktu 2 detik").
export function jamRelatif(t: number, sekarang: number): string {
  if (sekarang - t < 5000) return "baru saja";
  return formatDistanceStrict(t, sekarang, { locale: id, addSuffix: true });
}

// Kapan bacaan dianggap basi. Node 1 dan simulator mengirim tiap 10 detik: 30 detik tanpa kabar = 3 kiriman terlewat.
// Node 2 mengirim tiap 5 menit dan baru dianggap offline sesudah 16 menit (KONTRAK-DATA.md).
export function batasBasi(jenis: Jenis): number {
  return jenis === "node2" ? 16 * MENIT : 30 * 1000;
}
```

Isinya dijelaskan di [Konsep 6](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling) dan [Konsep 7](#7-hidup-belum-tentu-segar-status-terakhir-dilihat-dan-data-basi):

- **`useSekarang()`**: jam yang berdetak tiap detik; *cleanup* `clearInterval` mencabutnya saat komponen hilang. **Bukan *polling***: tidak ada permintaan ke backend.
- **`jamWib()`**: pindahan dari `DetailPerangkat.tsx`, kini juga menerima angka milidetik.
- **`jamRelatif()`**: `baru saja` di bawah 5 detik, lalu `45 detik yang lalu`, `3 menit yang lalu`.
- **`batasBasi()`**: 30 detik untuk Node 1 dan simulator (tiga kiriman terlewat), 16 menit untuk Node 2.

**Langkah 2 — `jamWib` pindah rumah.** Buka `src/components/DetailPerangkat.tsx`. Hapus fungsi `jamWib` beserta komentarnya (empat baris di atas `type Props`), lalu tambahkan impor ini di bawah baris `import type { … } from "../types";`:

```ts
import { jamWib } from "../waktu";
```

Simpan (**Ctrl + S**). Layar Detail tidak berubah, `diperbarui pukul … WIB` tetap ada: fungsinya hanya pindah rumah. Kalau VS Code menggarisbawahi `jamWib` dengan merah, impornya belum ada atau fungsi lamanya belum terhapus.

#### 3.2 Lencana merah/hijau, terakhir dilihat, dan data basi (15 menit)

Empat berkas berubah dan satu berkas baru, urut dari papan pengumuman sampai ke layar.

**Langkah 1 — Toko mencatat "terakhir dilihat".** Buka [`kode/tahap/praktik-3/frontend/src/toko.ts`](kode/tahap/praktik-3/frontend/src/toko.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/toko.ts`-mu. Yang baru: kamus `terakhirDilihat` (milidetik per `device_id`, awalnya `{}`) yang diisi dua aksi. Di `setPerangkat` (jawaban `GET /devices`):

```ts
        if (p.terakhir_dilihat !== null) {
          // pilih yang lebih baru: jam server di database, atau jam browser saat telemetry terakhir tiba
          terakhirDilihat[p.device_id] = Math.max(terakhirDilihat[p.device_id] ?? 0, Date.parse(p.terakhir_dilihat));
        }
```

Di `terima` (acara `telemetry`) ada satu baris baru: `terakhirDilihat: { ...s.terakhirDilihat, [deviceId]: Date.now() },`.

- **Dua sumber jam, ambil yang lebih baru.** `terakhir_dilihat` memakai jam **server** (teks UTC, diubah `Date.parse` menjadi milidetik), `Date.now()` jam **browser**. `Math.max` menjaga supaya daftar yang dimuat lagi tidak memundurkan waktu.
- **`isiTerbaru` tidak menyentuhnya**: jawaban `ikuti` hanya nilai awal dari memori backend, bukan tanda perangkat baru saja terdengar.

**Langkah 2 — Komponen baru `TerakhirDilihat`.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`TerakhirDilihat.tsx`**, lalu ketik (atau salin dari [`kode/tahap/praktik-3/frontend/src/components/TerakhirDilihat.tsx`](kode/tahap/praktik-3/frontend/src/components/TerakhirDilihat.tsx) dengan **Copy raw file**):

```tsx
// TerakhirDilihat.tsx - "terakhir dilihat 12 detik yang lalu", ditambah tanda "data basi" kalau perangkat sudah terlalu
// lama diam. Komponen kecil ini berdetak sendiri tiap detik, jadi hanya tulisan ini yang digambar ulang,
// bukan seluruh kartu atau seluruh layar.
import type { Jenis } from "../types";
import { batasBasi, jamRelatif, useSekarang } from "../waktu";

type Props = {
  t: number | undefined; // kapan perangkat terakhir terdengar (milidetik); undefined = belum pernah
  jenis: Jenis; // menentukan batas basi: Node 2 memang hanya mengirim tiap 5 menit
  periksaBasi: boolean; // false untuk perangkat yang kirimannya memang diabaikan backend (dicabut, belum terdaftar)
};

export default function TerakhirDilihat({ t, jenis, periksaBasi }: Props) {
  const sekarang = useSekarang();
  if (t === undefined) return <span>belum pernah terlihat</span>;
  const basi = periksaBasi && sekarang - t > batasBasi(jenis);
  return (
    <span>
      terakhir dilihat {jamRelatif(t, sekarang)}
      {/* status "online" belum tentu segar: angka yang lama tidak diperbarui harus tampak basi */}
      {basi ? <span className="ml-1 font-medium text-amber-700">· data basi</span> : null}
    </span>
  );
}
```

- **`· data basi`** (jingga, `text-amber-700`) muncul kalau diamnya lewat `batasBasi(jenis)`. `periksaBasi` bernilai `false` untuk perangkat yang kirimannya diabaikan backend: diamnya sudah pasti.
- **Hanya komponen kecil ini yang berdetak**, bukan seluruh kartu. Kamu mengukurnya sendiri di Praktik 6.

**Langkah 3 — Lencana bertulisan.** Buka `src/components/Lencana.tsx`. Ganti seluruh blok `const WARNA_STATUS …` dengan blok ini:

```tsx
// Modul 23: warna SELALU ditemani teks (online hijau "Online", offline merah "Offline"), supaya tetap terbaca oleh
// orang yang sulit membedakan merah dan hijau.
const LENCANA_STATUS: Record<StatusPerangkat, { teks: string; warna: string }> = {
  online: { teks: "Online", warna: "bg-green-100 text-green-800" },
  offline: { teks: "Offline", warna: "bg-red-100 text-red-800" },
  "offline-mode": { teks: "mode offline", warna: "bg-slate-200 text-slate-700" },
  "belum-diketahui": { teks: "belum diketahui", warna: "bg-slate-100 text-slate-500" },
};
```

Isi `LencanaStatus` menjadi `const { teks, warna } = LENCANA_STATUS[status];` lalu `return <span className={BENTUK + " " + warna}>{teks}</span>;`, sama dengan `LencanaKunci` di bawahnya. `offline` kini merah (Modul 22: abu-abu); `mode offline` (milik Modul 28; dulu kuning) dan `belum diketahui` netral. Berkas utuhnya: [`kode/tahap/praktik-3/frontend/src/components/Lencana.tsx`](kode/tahap/praktik-3/frontend/src/components/Lencana.tsx).

**Langkah 4 — Kartu Daftar bertepi warna.** Ganti seluruh isi `src/components/DaftarPerangkat.tsx` dengan [`kode/tahap/praktik-3/frontend/src/components/DaftarPerangkat.tsx`](kode/tahap/praktik-3/frontend/src/components/DaftarPerangkat.tsx) (buka di GitHub, klik **Copy raw file**, tempel). Yang baru: impor `StatusPerangkat` dan `TerakhirDilihat`, selektor `terakhir`, `<TerakhirDilihat … />` di baris bawah kartu, dan kamus tepi:

```tsx
const TEPI: Record<StatusPerangkat, string> = {
  online: "border-l-green-500",
  offline: "border-l-red-500",
  "offline-mode": "border-l-slate-400",
  "belum-diketahui": "border-l-slate-300",
};
```

Kelas tombol kartu ditambah `border-l-4` (tepi kiri 4 px) dan `TEPI[status]`, atau `border-l-slate-300` untuk kartu yang kirimannya diabaikan (tetap tanpa lencana status, seperti Modul 22). Nama kelas ditulis utuh di kamus karena Tailwind hanya membuat kelas yang tertulis lengkap.

**Langkah 5 — Baris status di Detail.** Dengan cara yang sama, ganti seluruh isi `src/components/DetailPerangkat.tsx` dengan [`kode/tahap/praktik-3/frontend/src/components/DetailPerangkat.tsx`](kode/tahap/praktik-3/frontend/src/components/DetailPerangkat.tsx) (pindahan 3.1 sudah termasuk). Status pindah ke bawah judul, dengan lencana yang sama dengan Daftar:

```tsx
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
        <span>{perangkat.jenis}</span>
        <span>·</span>
        {kirimanDiabaikan ? <span>kiriman diabaikan</span> : <LencanaStatus status={status} />}
        <span>·</span>
        <TerakhirDilihat t={terakhir} jenis={perangkat.jenis} periksaBasi={!kirimanDiabaikan} />
      </p>
```

Baris di atas kartu sensor tinggal `diperbarui pukul … WIB`. Selama lencana koneksi bukan **Live**, kartu sensor dipudarkan (`opacity-60`) dan baris itu ditambah `· sambungan live terputus, angka ini mungkin sudah basi`.

Simpan semua berkas, lalu buka Daftar Perangkat.

**Hasilnya (contoh, lab penulis; detik dan angkamu pasti berbeda):** kartu yang mengirim bertepi kiri **hijau**, berlencana `Online`, dengan baris bawah seperti `Suhu 25.7 °C` · `terakhir dilihat 10 detik yang lalu`; detiknya naik sendiri, lalu kembali `baru saja` setiap kiriman tiba. **Perangkat uji (penyusup)** tanpa lencana status, bertepi abu-abu: `kiriman diabaikan backend` · `terakhir dilihat 2 jam yang lalu`. **Latihan teras**: `belum pernah terlihat`. Saat disorot kursor, seluruh bingkai kartu toska, seperti Modul 22. Detail **Latihan ruang tamu**: `node1 · Online · terakhir dilihat 10 detik yang lalu`.

#### 3.3 ⭐ Matikan pengirimnya: kartu memerah, lalu hijau lagi (10 menit)

Inilah uji Silabus "kartu status perangkat merah/hijau". Amati di tab yang sedang terbuka; di tab latar, browser memperlambat pewaktu.

1. Buka Daftar Perangkat dengan lencana **Live**. Kartu **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**) hijau.
2. Hentikan pengirimnya. **Jalur laptop:** klik terminal simulator, tekan **Ctrl + C**. **Jalur perangkat:** cabut kabel USB Node 1.
3. Amati kartunya selama satu menit.
4. Nyalakan lagi. **Jalur laptop:** di terminal simulator, tekan **↑** lalu **Enter**. **Jalur perangkat:** colokkan lagi kabelnya.
5. Tunggu kiriman pertama (±10 detik).

**Hasilnya (contoh, jalur laptop, kode tahap Praktik 3 di lab penulis):**

| Saat | Kartu **Latihan ruang tamu** | Tepi kiri |
| :-- | :-- | :-- |
| sebelum Ctrl + C | `Online` · `Suhu 25.7 °C` · `terakhir dilihat 10 detik yang lalu` | hijau |
| ≤ 1,5 detik sesudah Ctrl + C | `Offline` · `Suhu 30.9 °C` · `terakhir dilihat 5 detik yang lalu` | **merah** |
| +15 detik | `terakhir dilihat 19 detik yang lalu` | merah |
| +32 detik | `terakhir dilihat 36 detik yang lalu · data basi` | merah |
| +65 detik | `terakhir dilihat 1 menit yang lalu · data basi` | merah |
| ±0,2 detik sesudah dijalankan lagi | `Online` · `Suhu 30.9 °C` · `terakhir dilihat 1 menit yang lalu · data basi` | **hijau** |
| kiriman pertama, ±7 detik kemudian | `Online` · `Suhu 26.2 °C` · `terakhir dilihat baru saja` | hijau |

**Ctrl + C** tidak mencetak apa pun dari simulator; *prompt* langsung kembali. Sesudah dijalankan lagi:

```text
PS C:\Users\kamu\rumah-pintar-mini\alat> node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1
1 perangkat palsu menuju mqtt://127.0.0.1:1883. Ketik "suhu 33" atau "suhu acak". Hentikan dengan Ctrl+C.
f00d00000001: online
```

Sambungan simulator putus, broker menerbitkan wasiat `offline`, backend meneruskannya sebagai acara `status`: kartu merah hampir seketika. `Suhu 30.9 °C` **membeku**; karena itulah `· data basi` perlu ada. Saat tersambung lagi, `Online` datang lebih dulu dan bacaan menyusul: dua acara terpisah.

**Jalur perangkat** (penulis tidak punya rekaman Kit untuk langkah ini, [📚](#-sumber--atribusi-gambar)): menurut Modul 11, `Offline` baru muncul ±13–23 detik sesudah kabel dicabut: broker menunggu 22,5 detik tanpa kabar dari Node 1. Kartu **Node 2 kebun** tetap `Online` (statusnya diterbitkan Node 1), tetapi `terakhir dilihat`-nya terus bertambah. Sesudah dicolokkan, Node 1 hijau begitu tersambung lagi ke WiFi dan broker.

Tangkapan dari kode akhir v0.2.0 (Daftarnya sama dengan akhir praktik ini), ±27 detik sesudah simulator dihentikan:

![Tangkapan layar asli Daftar Perangkat yang hidup (Edge, laptop 1280 px), ±27 detik sesudah simulator f00d00000001 dihentikan paksa (Praktik 3); Node 1 dan Node 2 tiruan lab. Kepala: Rumah Pintar Mini, lencana Live (penanda 1), Tamu Rumah (viewer), Keluar. Lima kartu: Node 2 kebun, Online, lewat penghubung, Suhu 27.4 °C, terakhir dilihat 14 detik yang lalu (penanda 5), tepi kiri hijau; Node 1 ruang tamu, Online dan tepi kiri hijau (penanda 2), Suhu 28.5 °C; Perangkat uji (penyusup), lencana merah kunci dicabut (penanda 6), kiriman diabaikan backend, terakhir dilihat 43 menit yang lalu; Latihan ruang tamu, Offline dan tepi kiri merah (penanda 3), Suhu 28.5 °C, terakhir dilihat 33 detik yang lalu · data basi berwarna jingga (penanda 4); Latihan teras, belum terdaftar, belum pernah terlihat (penanda 7). Keterangan: 1 Live = sambungan soket, bukan status perangkat; 2 Online dan tepi hijau dari acara status, warna selalu ditemani teks; 3 Offline seketika lewat wasiat broker; 4 berdetak tiap detik, basi bila lebih dari 30 detik diam; 5 batas basi Node 2 16 menit karena Node 2 asli mengirim tiap 5 menit (tiruan lab 15 detik); 6 kiriman diabaikan, tepi netral; 7 tidak diikuti dashboard (Modul 21).](aset/daftar-live-status.png)

**Kamu lulus langkah ⭐ ini** kalau kartu yang pengirimnya dihentikan menjadi `Offline` bertepi merah, `terakhir dilihat`-nya terus bertambah lalu diberi `· data basi`, dan sesudah pengirimnya dinyalakan lagi, kartu itu kembali `Online` hijau, lalu `terakhir dilihat baru saja` begitu kiriman pertama tiba.

> [!NOTE]
> **Kartu tetap `Offline` padahal angkanya bergerak?** Acara `status` yang lewat saat soket dashboard putus (misalnya backend dimulai ulang tepat saat pengirim menyala) tidak dikirim ulang. Tekan **F5** ([🚨](#-kalau-tidak-jalan) *Kartu tetap `Offline` merah, padahal angkanya bergerak*).

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` menyebut empat berkas berubah, serta `src/waktu.ts` dan `src/components/TerakhirDilihat.tsx` di `Untracked files`. Lalu:

```text
git add src
git commit -m "Kartu status merah/hijau dan terakhir dilihat (Modul 23 Praktik 3)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-3/frontend/`](kode/tahap/praktik-3/frontend/). Biarkan pengirimnya menyala untuk Praktik 4.

> ⬆️ **Selesai Praktik 3?** Kartu-kartumu kini jujur soal hidup dan segarnya. Baca [Konsep 8 — Grafik garis *live*](#8-grafik-garis-live-jendela-geser-5-menit), lalu lanjut ke [Praktik 4 — Grafik garis *live* 5 menit](#praktik-4--grafik-garis-live-5-menit-55-menit).

### Praktik 4 — Grafik garis *live* 5 menit (55 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 3 (`backend`, Vite di `frontend`, dan satu terminal kosong di folder `frontend` untuk Git; jalur laptop: broker di `edge` dan simulator di `alat`), **Docker Desktop** (`rumahpintar-db`), **Bruno** (akun admin, untuk uji 4.4), dan **Chrome atau Edge** di `http://localhost:5173`. Konsep yang dipakai: Konsep 8.
>
> ⭐ **Wajib** — langkah 4.4: garis grafik di laptop bergerak sendiri, dipicu `suhu 33` dari simulator, perintah lampu dari Bruno, atau LDR yang ditutup tangan.

Kartu di Detail hanya menunjukkan angka terakhir. Praktik ini menambah grafik garis 5 menit terakhir, persis rancangan Konsep 8: isi awal dari database, titik baru dari acara `telemetry`, ujung lama dipotong. Besarannya **Suhu**, **Cahaya** (untuk syarat lulus LDR), dan **Kelembapan**. Inilah separuh pertama syarat lulus, diuji dulu di laptop; versi HP-nya di 9.5. Kode di akhir praktik ini: [`kode/tahap/praktik-4/frontend/`](kode/tahap/praktik-4/frontend/).

#### 4.1 Jendela geser di toko: isi awal dari API, lalu bacaan *live* (15 menit)

Tiga berkas lama bertambah isinya. Untuk setiap berkas, buka tautannya di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi berkasmu yang bernama sama.

**Langkah 1 — Tipe bacaan dan titik** ([`kode/tahap/praktik-4/frontend/src/types.ts`](kode/tahap/praktik-4/frontend/src/types.ts)). Satu blok baru di akhir berkas: `Bacaan` (satu bacaan mentah dari `GET /devices/:id/readings`, 13 kolom, `null` bila tidak dimiliki perangkat), `JawabanBacaan` (paling banyak 1.000 bacaan, urut dari yang terlama), dan `Titik`, satu titik grafik: `t` (waktu bacaan dalam milidetik, karena sumbu waktu yang jujur butuh angka) ditambah `suhu`, `kelembapan`, dan `cahaya`.

**Langkah 2 — Isi awal dari API** ([`kode/tahap/praktik-4/frontend/src/api.ts`](kode/tahap/praktik-4/frontend/src/api.ts)). Di atas berkas, `subMinutes` dari date-fns dan tipe `JawabanBacaan` ikut diimpor; di akhir, satu fungsi baru:

```ts
// Modul 23: GET /devices/:id/readings?from=… = bacaan mentah sejak sekian menit lalu (isi awal grafik live).
export function ambilBacaanSejak(deviceId: string, menit: number): Promise<JawabanBacaan> {
  // toISOString() menulis waktu UTC berakhiran Z, misalnya 2026-10-24T03:10:00.000Z: aman ditaruh di alamat.
  // (Waktu berzona +07:00 harus ditulis %2B07:00, karena tanda + di alamat dibaca sebagai spasi.)
  const dari = subMinutes(new Date(), menit).toISOString();
  return minta<JawabanBacaan>("/devices/" + deviceId + "/readings?from=" + dari);
}
```

Ia lewat `minta()` Modul 22, jadi gelang yang habis di-*refresh* sekali secara otomatis.

**Langkah 3 — Jendela di toko** ([`kode/tahap/praktik-4/frontend/src/toko.ts`](kode/tahap/praktik-4/frontend/src/toko.ts)). Tambahannya: kamus **`jendela`** (titik grafik per perangkat, seperti `terbaru`); **`KOSONG`** untuk selektor `?? KOSONG` (jebakan Konsep 4); **`gabung()`**, jendela geser yang dibedah di Konsep 8; **`keTitik()`** dan **`keTitikBacaan()`**, pengubah `telemetry` dan bacaan database menjadi `Titik`; **`terima()`** yang kini juga menambah satu titik setiap acara `telemetry` tiba; dan aksi baru **`isiJendela()`**:

```ts
  isiJendela: (deviceId, bacaan) =>
    set((s) => {
      const jendela = { ...s.jendela, [deviceId]: gabung(s.jendela[deviceId] ?? KOSONG, bacaan.map(keTitikBacaan)) };
      const terakhir = bacaan.at(-1); // bacaan urut dari yang terlama, jadi yang terakhir = yang terbaru
      const awal = terakhir === undefined ? null : keTelemetry(terakhir);
      if (s.terbaru[deviceId] !== undefined || awal === null) return { jendela };
      return { jendela, terbaru: { ...s.terbaru, [deviceId]: awal } };
    }),
```

Baris pertama menggabung isi awal dengan titik *live* yang mungkin sudah lebih dulu masuk. Sisanya mengisi angka awal kartu (Konsep 8): kalau `terbaru` masih kosong karena backend baru dinyalakan, bacaan terakhir database yang dipakai, tanpa mengarang kolom yang kosong (`keTelemetry()`). `terakhirDilihat` tidak disentuh: ini bukan kiriman baru.

Simpan ketiga berkas (**Ctrl + S**). Layar belum berubah, karena belum ada yang memanggil `ambilBacaanSejak()`; tab **Console** tetap tanpa pesan merah baru.

#### 4.2 `GrafikLive`: sumbu waktu, jam WIB, dan tanpa animasi (20 menit)

**Langkah 1 — Label sumbu di `waktu.ts`.** Berkasnya pendek, jadi ganti seluruh isi `src/waktu.ts` dengan kode di bawah (atau buka [`kode/tahap/praktik-4/frontend/src/waktu.ts`](kode/tahap/praktik-4/frontend/src/waktu.ts) di GitHub, klik **Copy raw file**, lalu tempel):

```ts
// waktu.ts - urusan jam di layar: jam WIB, "… detik yang lalu", batas data basi, label sumbu waktu, dan detak 1 detik.
import { formatDistanceStrict } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { Jenis } from "./types";

export const MENIT = 60 * 1000; // dalam milidetik, satuan yang dipakai Date.now()
export const JAM = 60 * MENIT;
const WIB = 7 * JAM; // WIB = UTC + 7 jam sepanjang tahun (Indonesia tidak memakai jam musim panas)

// useSekarang - jam yang berdetak (pola useTime dari react.dev). Komponen yang memakainya digambar ulang tiap detik,
// jadi tulisan "12 detik yang lalu" ikut bertambah. Ini JAM, bukan polling: tidak ada permintaan ke server.
export function useSekarang(setiapMs = 1000): number {
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const pewaktu = setInterval(() => setSekarang(Date.now()), setiapMs);
    return () => clearInterval(pewaktu); // cleanup: hentikan detaknya saat komponen hilang dari layar
  }, [setiapMs]);
  return sekarang;
}

// "16.27.10 WIB", apa pun zona waktu laptop atau HP-nya (timeZone ditulis jelas, seperti di Modul 22)
export function jamWib(t: string | number): string {
  return new Date(t).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
}

// Pembentuk teks waktu dibuat SEKALI di sini, lalu dipakai ulang untuk setiap label grafik.
const JAM_MENIT = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });

export function jamMenitWib(t: number): string {
  return JAM_MENIT.format(t); // "16.27"
}

// jamRelatif - "45 detik yang lalu", "3 menit yang lalu" (date-fns dengan bahasa Indonesia).
// Di bawah 5 detik ditulis "baru saja": date-fns menulis "0 detik yang lalu", dan jam server yang sedikit lebih
// cepat dari jam HP bisa membuat selisihnya negatif ("dalam waktu 2 detik").
export function jamRelatif(t: number, sekarang: number): string {
  if (sekarang - t < 5000) return "baru saja";
  return formatDistanceStrict(t, sekarang, { locale: id, addSuffix: true });
}

// Kapan bacaan dianggap basi. Node 1 dan simulator mengirim tiap 10 detik: 30 detik tanpa kabar = 3 kiriman terlewat.
// Node 2 mengirim tiap 5 menit dan baru dianggap offline sesudah 16 menit (KONTRAK-DATA.md).
export function batasBasi(jenis: Jenis): number {
  return jenis === "node2" ? 16 * MENIT : 30 * 1000;
}

// ticksTiap - letak label sumbu waktu: setiap kelipatan "langkah" (menit, jam, atau hari menurut jam WIB) antara awal
// dan akhir. Tanpa daftar tetap ini, Recharts memilih letak label sendiri, dan labelnya melompat saat grafik bergeser.
export function ticksTiap(awal: number, akhir: number, langkah: number): number[] {
  const ticks: number[] = [];
  for (let t = Math.ceil((awal + WIB) / langkah) * langkah - WIB; t <= akhir; t += langkah) ticks.push(t);
  return ticks;
}
```

Yang baru tiga: `JAM` dan `WIB` (7 jam dalam milidetik) di bawah `MENIT`; `jamMenitWib()`, label pendek `16.27` dari pembentuk `Intl` yang dibuat sekali saja; dan `ticksTiap()` di akhir, yang memberi letak setiap menit bulat di dalam jendela, misalnya `16.30` sampai `16.34`. Tambah-kurang `WIB` membuat pembulatannya ikut jam WIB, bukan UTC (Riwayat di Praktik 7 butuh label tepat pukul 00.00 WIB).

**Langkah 2 — Komponennya.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`GrafikLive.tsx`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-4/frontend/src/components/GrafikLive.tsx`](kode/tahap/praktik-4/frontend/src/components/GrafikLive.tsx) di GitHub, klik **Copy raw file**, lalu tempel). Garis merah di bawah `./Pemilih` hilang sendiri sesudah berkas itu dibuat di 4.3.

```tsx
// GrafikLive.tsx - grafik garis 5 menit terakhir satu perangkat. Isi awalnya dari database (GET …/readings?from=…),
// lalu bertambah sendiri setiap kali acara telemetry tiba (lihat terima() di toko.ts). Sumbu waktunya bergeser tiap detik.
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ambilBacaanSejak, GalatApi } from "../api";
import { KOSONG, useToko } from "../toko";
import type { Titik } from "../types";
import { jamMenitWib, jamWib, MENIT, ticksTiap, useSekarang } from "../waktu";
import Pemilih from "./Pemilih";

type Besaran = "suhu" | "cahaya" | "kelembapan";

// Judul, satuan, skala, dan warna tiap besaran. Skala suhu mengikuti datanya (tidak mulai dari 0), karena
// perubahan 1-2 °C itu penting dan satuannya tertulis di judul. Cahaya dan kelembapan punya batas alami, jadi skalanya tetap.
type Aturan = { nama: string; judul: string; satuan: string; domain: [number | "auto", number | "auto"]; warna: string };
const BESARAN: Record<Besaran, Aturan> = {
  suhu: { nama: "Suhu", judul: "Suhu (°C)", satuan: " °C", domain: ["auto", "auto"], warna: "var(--color-sky-500)" },
  cahaya: { nama: "Cahaya", judul: "Cahaya (0 = gelap, 4095 = terang)", satuan: "", domain: [0, 4095], warna: "var(--color-amber-500)" },
  kelembapan: { nama: "Kelembapan", judul: "Kelembapan udara (%)", satuan: " %", domain: [0, 100], warna: "var(--color-teal-500)" },
};

const PILIHAN: { nilai: Besaran; teks: string }[] = [
  { nilai: "suhu", teks: "Suhu" },
  { nilai: "cahaya", teks: "Cahaya" },
  { nilai: "kelembapan", teks: "Kelembapan" },
];

// sisipkanCelah - kalau dua titik berjauhan lebih dari "celah", sisipkan satu titik kosong (null) di antaranya.
// Recharts memutus garis di titik null (connectNulls bawaannya false), jadi bacaan yang hilang tampak sebagai celah,
// bukan garis lurus yang seolah-olah ada datanya.
function sisipkanCelah(titik: Titik[], celah: number): Titik[] {
  const hasil: Titik[] = [];
  for (const p of titik) {
    const sebelum = hasil.at(-1); // titik terakhir yang sudah masuk (undefined untuk titik pertama)
    if (sebelum !== undefined && p.t - sebelum.t > celah) {
      hasil.push({ t: sebelum.t + 1, suhu: null, kelembapan: null, cahaya: null });
    }
    hasil.push(p);
  }
  return hasil;
}

export default function GrafikLive({ deviceId }: { deviceId: string }) {
  const [besaran, setBesaran] = useState<Besaran>("suhu");
  const [galat, setGalat] = useState<string | null>(null);
  const titik = useToko((s) => s.jendela[deviceId] ?? KOSONG); // ?? KOSONG, bukan ?? [] (lihat toko.ts)
  const live = useToko((s) => s.koneksi === "live");
  const isiJendela = useToko((s) => s.isiJendela);
  const sekarang = useSekarang();

  // Isi awal: bacaan 5 menit terakhir dari database. Diulang setiap kali sambungan kembali Live, karena kiriman yang
  // lewat selama terputus tidak dikirim ulang server (titik yang sama tidak tercatat dua kali: lihat gabung()).
  useEffect(() => {
    if (!live) return;
    let ignore = false;
    ambilBacaanSejak(deviceId, 5)
      .then((jawaban) => {
        if (ignore) return;
        isiJendela(deviceId, jawaban.bacaan);
        setGalat(null);
      })
      .catch((err) => {
        if (!ignore) setGalat(err instanceof GalatApi ? err.message : "Gagal mengisi grafik.");
      });
    return () => {
      ignore = true;
    };
  }, [deviceId, live, isiJendela]);

  const b = BESARAN[besaran];
  const awal = sekarang - 5 * MENIT;
  // lebih dari 25 detik tanpa bacaan = paling sedikit 2 kiriman 10 detik terlewat: garisnya diputus di situ
  const data = sisipkanCelah(titik, 25 * 1000);
  // titik lama baru dibuang toko saat titik baru datang, jadi hitung titik yang masih masuk 5 menit terakhir
  const adaTerlihat = titik.some((p) => p.t >= awal);
  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800">{b.judul} · 5 menit terakhir</h3>
        <Pemilih label="Besaran grafik" pilihan={PILIHAN} dipilih={besaran} onPilih={setBesaran} />
      </div>
      <div className="mt-3 text-xs">
        {/* responsive + style: lebar mengikuti wadah (rapi di HP), tinggi tetap 240 px */}
        <LineChart responsive data={data} style={{ width: "100%", height: 240 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200)" />
          {/* Sumbu waktu berupa ANGKA (milidetik), bukan kategori: jarak antartitik sesuai selisih waktunya.
              domain = tepat 5 menit terakhir; ticks = label di setiap menit bulat, supaya tidak melompat-lompat. */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[awal, sekarang]}
            allowDataOverflow
            ticks={ticksTiap(awal, sekarang, MENIT)}
            tickFormatter={jamMenitWib}
          />
          <YAxis domain={b.domain} width={44} />
          <Tooltip labelFormatter={(t) => jamWib(Number(t))} />
          {/* isAnimationActive={false}: animasi bawaan 1,5 detik membuat titik baru tampak terlambat */}
          <Line
            dataKey={besaran}
            name={b.nama}
            unit={b.satuan}
            stroke={b.warna}
            strokeWidth={2}
            dot={{ r: 2, fill: b.warna }}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
      {adaTerlihat ? null : (
        <p className="mt-2 text-sm text-slate-500">
          {live ? "Belum ada bacaan dalam 5 menit terakhir." : "Menunggu sambungan live…"}
        </p>
      )}
      {galat !== null ? <p className="mt-2 text-sm text-red-700">{galat}</p> : null}
    </section>
  );
}
```

Baca dari atas:

- **`BESARAN`**: judul, satuan, skala, dan warna per besaran. Suhu berskala `"auto"` (perubahan 1–2 °C penting, satuannya tertulis di judul); cahaya dan kelembapan berskala tetap (Konsep 9).
- **`sisipkanCelah()`**: lebih dari 25 detik tanpa bacaan (paling sedikit 2 kiriman terlewat) → satu titik `null` → garisnya putus. Jangan menulis `connectNulls`; bawaannya `false`.
- **Efek isi awal** berjalan saat **Live** dan diulang setiap kali kembali **Live**, karena kiriman selama putus tidak dikirim ulang; `ignore` membuang jawaban yang terlambat (pola Modul 22).
- **`useSekarang()`** menggambar ulang grafik tiap detik supaya jendelanya bergeser: jam, bukan *polling*.
- **`XAxis`**: `type="number"` dengan `domain` tepat 5 menit terakhir; `allowDataOverflow` memotong titik di luar jendela alih-alih melebarkan sumbu; `ticks` per menit bulat; label jam WIB.
- **`LineChart responsive`** + `style={{ width: "100%", height: 240 }}`: lebarnya mengikuti wadah, jadi muat di layar HP 375 px.
- **`isAnimationActive={false}`** demi kejujuran visual. Animasi bawaan menggeser garis selama ±1,5 detik dari posisi lamanya: layar sempat menggambar angka yang tidak pernah dikirim perangkat, dan titik baru tampak terlambat. Bukan demi kecepatan: di lab penulis, animasi hidup dan mati tidak berbeda nyata.
- **`adaTerlihat`**: tanpa titik di 5 menit terakhir, grafik menulis `Belum ada bacaan dalam 5 menit terakhir.`, atau `Menunggu sambungan live…` bila belum **Live**.

Simpan. Grafiknya belum tampil, karena belum dipasang di layar mana pun.

#### 4.3 Pemilih besaran: Suhu, Cahaya, dan Kelembapan (10 menit)

**Langkah 1 — Tombol pilih satu.** Di folder yang sama, buat berkas baru **`Pemilih.tsx`** (atau salin dari [`kode/tahap/praktik-4/frontend/src/components/Pemilih.tsx`](kode/tahap/praktik-4/frontend/src/components/Pemilih.tsx)):

```tsx
// Pemilih.tsx - deretan tombol "pilih satu", misalnya Suhu / Cahaya / Kelembapan. Tombol yang terpilih berwarna.
// <T extends string> = jenis nilai pilihannya diisi oleh pemakai komponen (misalnya "suhu" | "cahaya"), supaya
// TypeScript tetap menjaga bahwa onPilih hanya menerima nilai yang memang ada di daftar.
type Props<T extends string> = {
  label: string; // nama kelompok tombol untuk pembaca layar, misalnya "Besaran grafik"
  pilihan: { nilai: T; teks: string }[];
  dipilih: T;
  onPilih: (nilai: T) => void;
};

export default function Pemilih<T extends string>({ label, pilihan, dipilih, onPilih }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {pilihan.map((p) => (
        <button
          key={p.nilai}
          type="button"
          aria-pressed={p.nilai === dipilih} // memberi tahu pembaca layar tombol mana yang sedang terpilih
          onClick={() => onPilih(p.nilai)}
          className={
            "min-h-11 rounded-lg border px-3 text-sm font-medium " +
            (p.nilai === dipilih
              ? "border-teal-600 bg-teal-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
          }
        >
          {p.teks}
        </button>
      ))}
    </div>
  );
}
```

Tombol ini dipakai lagi untuk rentang Riwayat (Praktik 7). `<T extends string>` membuat TypeScript menolak nilai di luar daftar, `aria-pressed` memberi tahu pembaca layar tombol yang aktif, dan `min-h-11` (44 px) nyaman disentuh jari.

**Langkah 2 — Pasang di Detail.** Ganti seluruh isi `src/components/DetailPerangkat.tsx` dengan [`kode/tahap/praktik-4/frontend/src/components/DetailPerangkat.tsx`](kode/tahap/praktik-4/frontend/src/components/DetailPerangkat.tsx) (**Copy raw file**). Grafiknya masuk tepat di bawah baris status:

```tsx
      {/* Grafik 5 menit hanya untuk perangkat yang mengirim tiap 10 detik (Node 1 dan simulator) */}
      {kirimanDiabaikan ? null : node2 ? (
        <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-600">
          Node 2 mengirim tiap 5 menit, jadi grafik 5 menit terakhir hampir selalu kosong dan tidak ditampilkan.
        </p>
      ) : (
        <GrafikLive deviceId={id} />
      )}
```

Perangkat yang kirimannya diabaikan backend tidak mendapat grafik. Satu lagi: kalau angka kartu berasal dari database (lewat `isiJendela()`), kalimat `Keadaan lampu dan kipas tidak disimpan di database, …` menjelaskan mengapa kartu **Lampu** dan **Kipas** belum tampil.

Simpan semuanya, lalu buka Detail **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**).

**Hasilnya (contoh, lab penulis; jam dan angkamu pasti berbeda):** di bawah baris status ada kotak `Suhu (°C) · 5 menit terakhir` dengan tombol **Suhu** (aktif), **Cahaya**, dan **Kelembapan**, garis biru bertitik, sumbu waktu berlabel per menit (misalnya `16.30` sampai `16.34`), dan sumbu tegak `24 27 30 33 36`. Terminal backend mencatat isi awalnya (jalan lab lain):

```text
[16:46:23] INFO: GET /devices/f00d00000001/readings?from=2026-10-24T09:41:23.545Z -> 200 (7 ms)
[16:46:23] INFO: GET /devices/f00d00000001/readings?from=2026-10-24T09:41:23.551Z -> 200 (5 ms)
```

Dua baris karena `StrictMode` menjalankan efek dua kali di mode dev. `from` = 5 menit sebelum Detail dibuka, dalam UTC (`09.41` UTC = `16.41` WIB).

Klik **Cahaya**: judulnya `Cahaya (0 = gelap, 4095 = terang)`, sumbunya 0–4095, garisnya jingga dan bergerigi, karena simulator mengacak cahaya di setiap kiriman. **Kelembapan** menulis `Kelembapan udara (%)`, 0–100. Amati sumbu waktu satu–dua menit: labelnya bergeser pelan ke kiri dan hanya berganti saat menit baru tiba (penulis mengamati 195 detik: 3 pergantian, 0 lompatan). Detail **Node 2 kebun** (jalur perangkat) memuat kalimat Node 2 tadi, bukan grafik.

#### 4.4 ⭐ Garisnya bergerak sendiri: `suhu 33`, lampu, atau LDR (10 menit)

Biarkan Detail terbuka dengan lencana **Live**, lalu picu kiriman baru tanpa menyentuh dashboard.

- **Jalur laptop, uji 1:** pada grafik **Suhu**, ketik `suhu 33` di terminal simulator, lalu **Enter**. Pada kiriman berikutnya (biasanya 0–10 detik), kartu **Suhu** menjadi `33` dan ujung kanan garis naik ke 33. Kembalikan dengan `suhu acak`.
- **Jalur laptop, uji 2:** di Bruno, kirim **`login admin`**, buka **`nyalakan lampu`**, ganti `a4cf12e5b7c0` di URL-nya dengan `f00d00000001` (jangan tekan **Ctrl + S**), lalu klik **Send**; ulangi dengan **`matikan lampu`**. Aktuator yang berubah membuat simulator mengirim **segera**, jadi titik baru muncul di luar jadwal 10 detik. Nilai cahayanya acak: uji ini membuktikan pipa kiriman segera, bukan sensor cahaya.
- **Jalur perangkat:** pilih **Cahaya**; ruangan harus terang (atau sorot LDR dengan senter), karena Node 1 mengirim segera hanya saat `cahaya` melintasi batas 1000. Tutup LDR dengan tangan ±5 detik: garis **Cahaya** seharusnya turun ≈ 1–2 detik kemudian. Penulis belum merekamnya dengan Kit sungguhan. Garis baru berubah ±10 detik kemudian? Lihat [🚨](#-kalau-tidak-jalan) *Menutup LDR tidak membuat grafik langsung berubah*.

**Hasilnya (contoh, lab penulis saat uji 2.5; titik grafik datang dari acara `telemetry` yang sama dengan angka kartu):** kartu **Suhu** menjadi `33` 3,9–4,9 detik sesudah **Enter** (tiga percobaan; wajarnya 0–10 detik, paling lama ±11 detik), dan kartu **Lampu** berganti `Mati`/`Nyala` 0,01–0,07 detik sesudah perintah dikirim.

**Celah yang jujur (pilihan).** Hentikan pengirimnya ±40 detik (jalur laptop: **Ctrl + C** di terminal simulator; jalur perangkat: cabut USB Node 1), lalu nyalakan lagi: garisnya putus menjadi dua ruas, tidak disambung lurus.

![Tangkapan layar asli Detail Latihan ruang tamu (simulator f00d00000001) di Edge, laptop 1280 px, dipotong sesudah gauge (Praktik 3–5). Kepala dengan lencana Live (penanda 1); ← Kembali ke daftar dan Riwayat → (penanda 9); baris node1 · Online · terakhir dilihat 10 detik yang lalu (penanda 2). Kartu Suhu (°C) · 5 menit terakhir dengan tombol Suhu, Cahaya, Kelembapan (penanda 3); garis biru bertitik, sumbu tegak 24–36, sumbu waktu 16.30 sampai 16.34 (penanda 5); garis terputus antara ±16.32.00 dan 16.32.44, bagian kosong ditandai kotak (penanda 4). Lalu diperbarui pukul 16.33.54 WIB (penanda 6), gauge Kelembapan tanah 35 % (penanda 7) dan Air tandon 74 % (penanda 8), busur teal di atas lintasan abu-abu. Keterangan: 1 soket hidup, menjadi Menyambung ulang… bila putus; 2 ikut bergerak dari acara status dan telemetry; 3 hanya satu garis yang tampil; 4 tidak ada bacaan lebih dari 25 detik karena simulator dimatikan ±40 detik, garis tidak disambung; 5 jendela geser 5 menit, label per menit WIB; 6 jam bacaan terakhir dari ts perangkat; 7 skala 0–100 %, busur sepanjang nilai; 8 di bawah 20 % busur jingga dan tulisan rendah (di bawah 20 %), tidak tampak di gambar ini; 9 Riwayat 1 jam, 24 jam, 7 hari (Praktik 7).](aset/detail-live-grafik-gauge.png)

Tangkapan dari dashboard v0.2 akhir: *gauge* (penanda 7–8, Praktik 5) dan **Riwayat →** (penanda 9, Praktik 7) belum ada di layarmu. Penanda 4 = celah saat simulator dimatikan ±40 detik.

**Kamu lulus langkah ⭐ ini** kalau, dengan lencana **Live** dan tanpa memuat ulang halaman, garisnya berubah sendiri: **Cahaya** kurang dari 11 detik sesudah LDR ditutup (biasanya ≈ 1–2 detik), atau di jalur laptop **Suhu** naik ke 33 kurang dari 11 detik sesudah **Enter** dan titik baru muncul begitu perintah lampu dikirim. Ujian yang sama diulang di HP ([9.5](#95--syarat-lulus-pertama-di-hp-rekam-grafiknya-berubah-15-menit)) dan saat gladi bersih ([10.3](#103--gladi-bersih-kedua-syarat-lulus-15-menit)).

Di terminal kosong, simpan ke cabang:

```text
git add src/types.ts src/api.ts src/toko.ts src/waktu.ts src/components/GrafikLive.tsx src/components/Pemilih.tsx src/components/DetailPerangkat.tsx
git commit -m "Grafik garis live 5 menit (Modul 23 Praktik 4)"
```

> ⬆️ **Selesai Praktik 4?** Baca [Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status) dan [Konsep 10](#10-mode-gelap-mengikuti-setelan-hp-dan-laptop), lalu [Praktik 5 — *Gauge*, visual jujur, dan mode gelap](#praktik-5--gauge-visual-jujur-dan-mode-gelap-45-menit).

### Praktik 5 — *Gauge*, visual jujur, dan mode gelap (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 4 yang masih menyala (backend v1.0 dan Vite; jalur laptop juga broker dan simulator) plus satu terminal kosong di folder `frontend` untuk Git; **Docker Desktop** (`rumahpintar-db` menyala); dan **Chrome atau Edge** di `http://localhost:5173` dengan DevTools (panel **Rendering** dan mode perangkat). Konsep yang dipakai: 9–10.

Praktik ini melengkapi layar Detail dan memberi seluruh dashboard tema gelap. Pertama, *gauge* setengah lingkaran untuk **kelembapan tanah** dan **air tandon**. Kamu sengaja membuatnya **salah dulu**, supaya melihat sendiri busur yang menipu, lalu menjujurkannya dengan satu baris ([Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status)). Kedua, kartu **Pompa** dan **Tirai** ikut tampil. Ketiga, **mode gelap** yang mengikuti setelan HP atau laptop, termasuk warna grafik yang tidak dikenal kelas `dark:` ([Konsep 10](#10-mode-gelap-mengikuti-setelan-hp-dan-laptop)). Kode di akhir praktik ini: [`kode/tahap/praktik-5/frontend/`](kode/tahap/praktik-5/frontend/).

#### 5.1 `Gauge`: salah dulu, lalu jujur (15 menit)

**Langkah 1 — Warna lintasan dulu: `src/index.css`.** *Gauge* menggambar lintasan abu-abu di belakang busurnya dengan `var(--warna-lintasan)`, variabel yang belum ada. Buka [`kode/tahap/praktik-5/frontend/src/index.css`](kode/tahap/praktik-5/frontend/src/index.css) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/index.css`-mu. Isinya baris `@import "tailwindcss";` yang lama, satu komentar, dan blok variabel Konsep 10: tiga warna di `:root` yang diganti nilainya di dalam `@media (prefers-color-scheme: dark)`. *Gauge* memakai `--warna-lintasan`; `--warna-garis`, `--warna-panel`, dan bagian `@media` baru terasa di 5.3. Simpan; tampilan dashboard belum berubah.

**Langkah 2 — Tulis `Gauge.tsx`, lalu rusak dengan sengaja.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`Gauge.tsx`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-5/frontend/src/components/Gauge.tsx`](kode/tahap/praktik-5/frontend/src/components/Gauge.tsx) di GitHub, klik **Copy raw file**, lalu tempel). **Jangan simpan dulu.**

```tsx
// Gauge.tsx - gauge setengah lingkaran (RadialBarChart Recharts) untuk besaran yang batasnya jelas: 0-100 %.
// Skalanya WAJIB ditulis (domain 0-100). Tanpa itu, Recharts mengukur busur terhadap nilainya sendiri, dan gauge
// selalu tampak penuh walaupun isinya hanya 14 %.
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

type Props = {
  label: string; // misalnya "Kelembapan tanah"
  nilai: number | null; // persen; null = sensor gagal dibaca: busur kosong dan angka "—"
  ambangRendah?: number; // di bawah angka ini: warna peringatan + tulisan "rendah"
};

export default function Gauge({ label, nilai, ambangRendah }: Props) {
  const rendah = nilai !== null && ambangRendah !== undefined && nilai < ambangRendah;
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="relative mx-auto mt-2 max-w-48">
        {/* startAngle 180 -> endAngle 0 = setengah lingkaran dari kiri ke kanan; cy="100%" = pusatnya di tepi bawah */}
        <RadialBarChart
          responsive
          style={{ width: "100%", aspectRatio: 2 }}
          data={[{ nilai: nilai ?? 0 }]}
          startAngle={180}
          endAngle={0}
          cy="100%"
          innerRadius="140%"
          outerRadius="200%"
        >
          {/* skala tetap 0-100: tanpa baris ini, busurnya selalu penuh */}
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="nilai"
            background={{ fill: "var(--warna-lintasan)" }} // lintasan abu-abu di belakang busur
            cornerRadius={6}
            fill={rendah ? "var(--color-amber-500)" : "var(--color-teal-500)"}
            isAnimationActive={false}
          />
        </RadialBarChart>
        {/* angka + satuan di tengah lengkungan */}
        <p className="absolute inset-x-0 bottom-0 text-center text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {nilai ?? "—"}
          {nilai !== null ? <span className="ml-0.5 text-base font-normal text-slate-400">%</span> : null}
        </p>
      </div>
      {/* warna tidak pernah sendirian: keadaan "rendah" juga ditulis */}
      {rendah ? (
        <p className="mt-1 text-center text-sm font-medium text-amber-700 dark:text-amber-400">rendah (di bawah {ambangRendah} %)</p>
      ) : null}
    </div>
  );
}
```

Sebelum menyimpan, buat versi "salah dulu" dengan dua perubahan:

1. Hapus dua baris ini (komentar dan `<PolarAngleAxis … />`, tepat di atas `<RadialBar`):

   ```tsx
             {/* skala tetap 0-100: tanpa baris ini, busurnya selalu penuh */}
             <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
   ```

2. Buang `PolarAngleAxis` dari baris `import`, sehingga menjadi `import { RadialBar, RadialBarChart } from "recharts";`. Kalau impornya dibiarkan, VS Code menggarisbawahinya merah: proyek ini menolak impor yang tidak dipakai (`noUnusedLocals`).

Simpan (**Ctrl + S**). Browser belum berubah, karena belum ada layar yang memakai `Gauge`. Baca dulu bagian-bagiannya:

- **Tiga *props***: `label`, `nilai` (persen, atau `null` kalau sensor gagal dibaca), dan `ambangRendah` (tanda `?` = boleh tidak diisi).
- **`data={[{ nilai: nilai ?? 0 }]}`**: Recharts selalu meminta larik data, jadi *gauge* adalah grafik dengan satu baris dan satu busur. `null` digambar sebagai 0 (busur kosong), sedangkan tulisannya menjadi `—`.
- **Bentuk setengah lingkaran**: `startAngle={180}` → `endAngle={0}` menggambar dari kiri ke kanan, pusatnya di tepi bawah (`cy="100%"`), tingginya setengah lebar (`aspectRatio: 2`), dan lebarnya mengikuti kotak sampai 192 px (`responsive` + `max-w-48`). `innerRadius` dan `outerRadius` mengatur tebal cincin.
- **`<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />`**: skala tetap 0–100, tanpa angka skala di sekeliling busur. Inilah baris yang barusan kamu hapus.
- **`<RadialBar>`**: `background` = lintasan abu-abu, yaitu sisa skala sampai 100 %; `cornerRadius` membulatkan ujung busur; `fill` teal, atau jingga kalau rendah; `isAnimationActive={false}` supaya busur tidak "meluncur" dari nilai lama (Konsep 9, aturan 7).
- **Angka di tengah** (`absolute`, ditumpuk di atas grafik) selalu bersatuan `%`. Kalau `rendah`, warna jingga ditemani tulisan `rendah (di bawah 20 %)`: warna tidak pernah sendirian.

**Langkah 3 — Pasang di Detail.** Buka [`kode/tahap/praktik-5/frontend/src/components/DetailPerangkat.tsx`](kode/tahap/praktik-5/frontend/src/components/DetailPerangkat.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/components/DetailPerangkat.tsx`-mu. Isinya dibedah di 5.2, dan kelas `dark:`-nya di 5.3. Laptopmu bertema gelap? Sampai 5.3 selesai, Detail setengah gelap dan judulnya nyaris hilang: wajar. Simpan, lalu buka detail **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**).

**Hasilnya (contoh):** di bawah grafik 5 menit ada baris `diperbarui pukul 16.21.49 WIB`, lalu dua *gauge* berdampingan: **Kelembapan tanah** `20%` dan **Air tandon** `49%`. **Kedua busur teal penuh** dari ujung kiri sampai ujung kanan, padahal angkanya berbeda jauh.

Tanpa skala tetap, satu-satunya nilai itu menjadi ujung skalanya, jadi busurnya selalu penuh (Konsep 9, aturan 1). Sekilas pandang, kamu akan menyangka tandon penuh.

**Langkah 4 — Jujurkan.** Di `Gauge.tsx`, kembalikan kedua perubahan tadi: tulis lagi `PolarAngleAxis, ` di awal daftar impor, lalu tempel lagi dua baris yang kamu hapus tepat di atas `<RadialBar` (atau tekan **Ctrl + Z** sampai keduanya kembali). Simpan.

**Hasilnya (contoh; penulis menangkap versi salah dan versi jujur di dua jendela sesudah kiriman yang sama, `diperbarui pukul 16.21.49 WIB`):** busur **Kelembapan tanah** `20%` kini hanya terisi pendek di kiri, dan **Air tandon** `49%` hampir setengah. Sisanya lintasan abu-abu sampai ujung kanan. Panjang busur kini sama dengan angkanya. Di layarmu, angkanya berganti mengikuti kiriman berikutnya.

![Komposit dua tangkapan layar asli: gauge yang menipu lawan gauge yang jujur, bacaan sama, gambar berbeda (Edge, laptop 1280 px, dua jendela dibuka bersamaan pada kiriman yang sama, Praktik 5.1–5.2). Atas, Salah dulu: Gauge.tsx tanpa baris PolarAngleAxis (salinan sementara): diperbarui pukul 16.21.49 WIB, Kelembapan tanah 20 % (penanda 1) dan Air tandon 49 % (penanda 2), kedua busur teal penuh dari ujung ke ujung. Bawah, Benar: PolarAngleAxis type number, domain 0 sampai 100, tick false (kode akhir): diperbarui pukul 16.21.49 WIB yang sama, Kelembapan tanah 20 % dengan busur pendek di kiri (penanda 3) dan Air tandon 49 % dengan busur hampir setengah (penanda 4), sisanya lintasan abu-abu. Keterangan: 1 tanpa skala, Recharts mengukur busur terhadap nilainya sendiri; 2 angka berbeda tetapi gambar sama, mata membaca penuh; 3 dengan PolarAngleAxis 0–100 panjang busur = nilai; 4 lintasan abu-abu = sisa skala sampai 100 %, dari background di RadialBar.](aset/gauge-salah-benar.png)

#### 5.2 *Gauge* tanah dan tandon, lalu kartu Pompa dan Tirai (10 menit)

`DetailPerangkat.tsx` yang kamu tempel di 5.1 membawa tiga perubahan. Bacalah sambil membuka berkasnya di VS Code.

**1. Fungsi `gauge()`** (di atas `type Props`) memilih *gauge* menurut jenis perangkat:

```tsx
// Gauge hanya untuk besaran yang batasnya jelas, 0-100 %: kelembapan tanah, dan isi tandon Node 1.
function gauge(bacaan: Telemetry, node2: boolean) {
  if (node2) {
    return <Gauge label="Kelembapan tanah" nilai={(bacaan as TelemetryNode2).tanah} />;
  }
  const t = bacaan as TelemetryNode1;
  return (
    <>
      <Gauge label="Kelembapan tanah" nilai={t.tanah} />
      {/* air tandon di bawah 20 % = "rendah" (ambang kontrak data, sama dengan aturan kiriman segera Node 1) */}
      <Gauge label="Air tandon" nilai={t.level_air} ambangRendah={20} />
    </>
  );
}
```

- **Node 1** (dan simulator) mendapat dua *gauge*; **Node 2** hanya satu, karena tidak punya tandon. Suhu dan cahaya tidak dijadikan *gauge*: suhu tidak punya batas atas yang jelas, dan cahaya berupa angka ADC 0–4095, bukan persen (Konsep 9, aturan 1).
- **`ambangRendah={20}`** memakai ambang tandon dari kontrak data, yang sama dengan aturan kiriman segera Node 1. Di bawah 20 %, busurnya jingga **dan** tertulis `rendah (di bawah 20 %)`. Simulator mengirim tandon acak 30–90 %, jadi di jalur laptop tampilan ini tidak muncul (penulis belum melihatnya di layar); di jalur perangkat, ia seharusnya muncul begitu Node 1 melaporkan tandon di bawah 20 %.
- **`<>…</>`** (*fragment*) membungkus dua *gauge* tanpa `div` tambahan, supaya keduanya menjadi dua kolom wadah `grid grid-cols-2`. Wadah itu ada di dalam `div` yang dipudarkan (`opacity-60`) saat lencana bukan **Live**, jadi *gauge* ikut tampak basi (Konsep 9, aturan 6).

Kartu **Kelembapan tanah** (dan, di Node 1, **Air tandon**) dihapus dari daftar kartu: angka yang sama tidak perlu tampil dua kali.

**2. Kartu Pompa dan Tirai.** Di `kartuNode1()`, sesudah kartu Lampu dan Kipas:

```tsx
      // Modul 23: pompa dan tirai ikut tampil (tombol kendalinya tetap di Modul 24)
      { label: "Pompa", nilai: t.state.pompa ? "Menyiram" : "Diam", warna: t.state.pompa ? "text-sky-600 dark:text-sky-400" : undefined },
      { label: "Tirai", nilai: t.state.tirai, satuan: "°" },
```

Keduanya hanya **ditampilkan**: tombol kendali milik Modul 24. Keadaan aktuator tidak disimpan di database, jadi sesudah backend dimulai ulang, kalimat di bawah kartu kini berbunyi `Keadaan lampu, kipas, pompa, dan tirai tidak disimpan di database, jadi kartunya baru muncul bersama kiriman berikutnya.`

**3. Kelas `dark:`** di hampir setiap `className`. Abaikan dulu; artinya dibahas di 5.3.

**Coba.** Lihat lagi detail **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**), lalu tunggu satu-dua kiriman.

**Hasilnya (contoh):** dari atas: lencana `Live` di kepala, baris `node1 · Online · terakhir dilihat 10 detik yang lalu`, grafik `Suhu (°C) · 5 menit terakhir`, baris `diperbarui pukul 16.33.54 WIB`, *gauge* **Kelembapan tanah** `35%` dan **Air tandon** `74%`, lalu kartu `Suhu`, `Kelembapan`, `Cahaya`, `Gerakan`, `Lampu`, `Kipas`, `Pompa`, dan `Tirai`. Angka *gauge* dan kartu berganti sendiri bersama setiap kiriman. Detail **Node 2 kebun** (jalur perangkat) hanya punya satu *gauge*, **Kelembapan tanah**, dengan kartu `Suhu`, `Kelembapan`, `Tekanan udara`, `Suhu tanah`, dan `Baterai` (kalau pengukur baterainya dipasang).

Layar ini tampak di gambar [4.4](#44--garisnya-bergerak-sendiri-suhu-33-lampu-atau-ldr-10-menit): kedua *gauge* = penanda 7–8.

#### 5.3 Mode gelap: kelas `dark:` dan warna grafik (20 menit)

Mode gelap butuh tiga tempat: halaman (`index.html`), grafik Recharts (variabel CSS), dan kelas `dark:` di setiap layar. Tanpa tombol dan tanpa menyimpan apa pun: dashboard mengikuti setelan sistem (Konsep 10).

**Langkah 1 — Halaman: `index.html`.** Buka `frontend/index.html` (di folder `frontend`, bukan di `src`) dan ubah dua baris:

```html
<html lang="id" class="scheme-light dark:scheme-dark">
```

```html
  <body class="bg-slate-100 dark:bg-slate-900">
```

`scheme-light dark:scheme-dark` meminta browser ikut menggelapkan bagian buatannya sendiri, misalnya batang gulir dan isian formulir. Latar `body` membuat seluruh halaman gelap, bukan hanya kotak-kotak React. Simpan.

**Langkah 2 — Grafik: `GrafikLive.tsx`.** Recharts tidak mengenal `dark:`, jadi grafik memakai variabel dari `src/index.css` (5.1). Bagian `@media (prefers-color-scheme: dark)` di berkas itu mengganti nilainya sendiri saat tema gelap. Buka [`kode/tahap/praktik-5/frontend/src/components/GrafikLive.tsx`](kode/tahap/praktik-5/frontend/src/components/GrafikLive.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/components/GrafikLive.tsx`-mu. Selain kelas `dark:`, yang berubah adalah baris-baris ini di dalam `return`:

```tsx
      {/* warna teks wadah ini dipakai label sumbu (fill: currentColor), jadi ikut berganti di mode gelap */}
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        …
          <CartesianGrid strokeDasharray="3 3" stroke="var(--warna-garis)" />
          …
            tick={{ fill: "currentColor" }}
            stroke="var(--warna-garis)"
          />
          <YAxis domain={b.domain} width={44} tick={{ fill: "currentColor" }} stroke="var(--warna-garis)" />
          <Tooltip
            labelFormatter={(t) => jamWib(Number(t))}
            contentStyle={{ backgroundColor: "var(--warna-panel)", borderColor: "var(--warna-garis)", borderRadius: 8 }}
          />
```

Garis bantu dan garis sumbu memakai `var(--warna-garis)` (slate-200 di tema terang, slate-700 di tema gelap), dan kotak *tooltip* berlatar `var(--warna-panel)`, bukan putih bawaan Recharts. Label sumbu memakai `fill: "currentColor"`, yaitu warna teks wadahnya (`text-slate-500 dark:text-slate-400`), jadi ikut berganti lewat kelas Tailwind biasa. Warna garis data (`var(--color-sky-500)` dan kawan-kawannya, sejak 4.2) tetap: warna penanda terbaca di kedua tema. *Gauge* sudah siap sejak 5.1 (`var(--warna-lintasan)` dan kelas `dark:` di `Gauge.tsx`).

**Langkah 3 — Kelas `dark:` di layar-layar lain.** Delapan berkas hanya bertambah kelas `dark:` (dan satu komentar di `DaftarPerangkat.tsx`). Untuk setiap berkas, buka di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi berkas yang sama di foldermu: [`src/App.tsx`](kode/tahap/praktik-5/frontend/src/App.tsx), lalu tujuh berkas di `src/components`: [`Login.tsx`](kode/tahap/praktik-5/frontend/src/components/Login.tsx), [`KartuSensor.tsx`](kode/tahap/praktik-5/frontend/src/components/KartuSensor.tsx), [`Lencana.tsx`](kode/tahap/praktik-5/frontend/src/components/Lencana.tsx), [`LencanaKoneksi.tsx`](kode/tahap/praktik-5/frontend/src/components/LencanaKoneksi.tsx), [`TerakhirDilihat.tsx`](kode/tahap/praktik-5/frontend/src/components/TerakhirDilihat.tsx), [`Pemilih.tsx`](kode/tahap/praktik-5/frontend/src/components/Pemilih.tsx), dan [`DaftarPerangkat.tsx`](kode/tahap/praktik-5/frontend/src/components/DaftarPerangkat.tsx). Mau mengetik sendiri? Salin setiap kelas `dark:` dari berkas tahap 5. Polanya selalu sama: setiap warna terang diberi pasangan gelap.

| Bagian | Tema terang | Ditambah untuk tema gelap |
| :--- | :--- | :--- |
| Latar halaman | `bg-slate-100` | `dark:bg-slate-900` |
| Kepala, kartu, kotak grafik | `bg-white` `border-slate-200` | `dark:bg-slate-800` `dark:border-slate-700` |
| Judul dan angka | `text-slate-800` | `dark:text-slate-100` |
| Teks kecil abu-abu | `text-slate-500` | `dark:text-slate-400` |
| Lencana `Online` / `Live` | `bg-green-100 text-green-800` | `dark:bg-green-900 dark:text-green-100` |

Satu jebakan ada di `DaftarPerangkat.tsx`. Kartu Daftar diberi `dark:border-slate-700`, yang mewarnai **keempat** sisi bingkai, termasuk tepi kiri. Di versi pertama penulis, tepi kiri hijau/merah dari Praktik 3 **hilang** di tema gelap, karena kelas `dark:` itu menimpa `border-l-green-500`. Obatnya: ulangi warna tepinya dengan varian `dark:` juga, di `TEPI`:

```tsx
  online: "border-l-green-500 dark:border-l-green-500", // diulang dengan dark: supaya tidak tertimpa dark:border-slate-700 kartu
  offline: "border-l-red-500 dark:border-l-red-500",
```

Sesudah perbaikan itu, tepi kiri terukur hijau dan merah di tema gelap. Status tetap juga terbaca dari lencana teksnya (Konsep 9, aturan 4).

Simpan semua berkas. Tema terang tidak berubah sedikit pun: kelas tanpa awalan tetap sama.

**Langkah 4 — Coba tema gelap tanpa mengubah setelan laptop.** DevTools bisa menirukan setelan tema gelap untuk tab ini saja:

1. Di tab dashboard, buka DevTools (**F12**).
2. Klik tombol titik tiga di pojok kanan atas DevTools → **More tools** → **Rendering**.
3. Di **Rendering**, gulir sampai **Emulate CSS media feature prefers-color-scheme**, lalu pilih **prefers-color-scheme: dark**.
4. Periksa **Daftar Perangkat**, lalu detail **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**). Arahkan tetikus ke garis grafik supaya *tooltip* muncul.
5. Mau melihat tepi merah di tema gelap? Hentikan simulator sebentar (**Ctrl + C**, seperti 3.3), tunggu kartunya `Offline` dan `· data basi` (±30 detik), lalu jalankan lagi. Jalur perangkat: cabut sebentar kabel USB Node 1.
6. Nyalakan mode perangkat (**Ctrl + Shift + M**; macOS: **Cmd + Shift + M**), pilih **Responsive**, ketik lebar `375`, muat ulang (**F5**), lalu periksa Daftar dan Detail sekali lagi.

**Hasilnya (contoh):** latar halaman berubah biru keabuan sangat gelap, kepala dan kartu sedikit lebih terang, dan tulisannya terang. Lencana `Live`, `Online`, `Offline`, dan tulisan kuning `· data basi` tetap terbaca. Daftar di lebar laptop: kartu `Online` bertepi kiri **hijau**, dan **Latihan ruang tamu** `Offline` bertepi kiri **merah** dengan `terakhir dilihat 34 detik yang lalu · data basi`. Detail di lebar 375 px: `node1 · Online · terakhir dilihat 7 detik yang lalu`, garis bantu dan label sumbu grafik meredup, `diperbarui pukul 18.08.09 WIB`, *gauge* `53%` dan `33%` dengan busur teal di atas lintasan abu-abu gelap. Kotak *tooltip* ikut gelap, dan tidak ada gulir mendatar.

![Komposit dua tangkapan layar asli mode gelap mengikuti setelan sistem (Edge, emulasi prefers-color-scheme: dark, Praktik 5.3); kiri mode perangkat 375 px di DevTools, bukan HP sungguhan; kanan laptop 1280 px, Node 1/Node 2 tiruan lab. Kiri, Detail Latihan ruang tamu: lencana Live (penanda 4), node1 · Online; grafik Suhu (°C) · 5 menit terakhir, garis bantu dan label sumbu redup, sumbu 18.04 sampai 18.08 (penanda 2); diperbarui pukul 18.08.09 WIB; gauge Kelembapan tanah 53 % dan Air tandon 33 % (penanda 3), busur teal di atas lintasan gelap. Kanan, Daftar Perangkat: Node 2 kebun dan Node 1 ruang tamu Online bertepi kiri hijau (penanda 5 di Node 1); Perangkat uji (penyusup) kunci dicabut; Latihan ruang tamu Offline (penanda 4) bertepi kiri merah (penanda 5), dengan tulisan abu-abu terakhir dilihat 34 detik yang lalu diikuti · data basi berwarna kuning (penanda 4); Latihan teras, belum terdaftar (penanda 1). Keterangan: 1 latar dan kartu gelap dari kelas dark: Tailwind, tanpa tombol dan localStorage; 2 variabel --warna-garis; 3 variabel --warna-lintasan, warna data tetap; 4 lencana dan · data basi tetap terbaca; 5 tepi kiri hijau/merah tetap tampak, warnanya diulang dengan varian dark:.](aset/mode-gelap-hp-laptop.png)

Selesai memeriksa (laptopmu bertema gelap? Lihat juga tema terang: **prefers-color-scheme: light**), kembalikan pilihan **Emulate CSS media feature prefers-color-scheme** ke **No emulation**, lalu matikan mode perangkat (**Ctrl + Shift + M**). Dashboard kembali mengikuti setelan laptopmu.

> [!NOTE]
> Penulis menguji mode gelap dengan **emulasi** `prefers-color-scheme` di Edge 156 (laptop dan mode perangkat 375 px), bukan dengan setelan tema Windows atau HP sungguhan. Warna dari variabel CSS di dalam SVG belum dicoba di Safari iPhone. Kamu mencobanya di HP sungguhan di [9.6](#96-mode-gelap-di-hp-dan-hp-yang-tertidur-10-menit).

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` seharusnya menyebut dua belas berkas berubah (`index.html`, `src/index.css`, `src/App.tsx`, dan sembilan berkas di `src/components`: `DaftarPerangkat`, `DetailPerangkat`, `GrafikLive`, `KartuSensor`, `Lencana`, `LencanaKoneksi`, `Login`, `Pemilih`, `TerakhirDilihat`) dan satu berkas baru di `Untracked files` (`src/components/Gauge.tsx`). Lalu simpan:

```text
git add index.html src
git commit -m "Gauge jujur, kartu Pompa dan Tirai, dan mode gelap (Modul 23 Praktik 5)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-5/frontend/`](kode/tahap/praktik-5/frontend/) untuk dicocokkan.

> ⬆️ **Selesai Praktik 5?** Detail perangkatmu kini punya grafik *live* dan *gauge* yang jujur, dan seluruh dashboard ikut tema gelap. Sebelum Praktik 6, kembali dulu ke [Konsep 5](#5-jangan-menggambar-ulang-10-per-detik-ukur-dulu-baru-percaya): kini ada grafik dan *gauge* yang bisa diukur. Lalu lanjut ke [Praktik 6 — Ukur dulu: jangan menggambar ulang 10× per detik](#praktik-6--ukur-dulu-jangan-menggambar-ulang-10-per-detik-25-menit).

### Praktik 6 — Ukur dulu: jangan menggambar ulang 10× per detik (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 5 yang masih menyala (backend v1.0 dan Vite; jalur laptop juga broker dan simulator) plus satu terminal kosong di folder `frontend`; **Docker Desktop** (`rumahpintar-db` menyala); dan **Chrome atau Edge** dengan tab **Console** serta dua tab React DevTools: **Components ⚛** dan **Profiler ⚛**. Konsep yang dipakai: Konsep 5.

Silabus meminta dashboard yang tidak menggambar ulang 10× per detik, dan [Konsep 5](#5-jangan-menggambar-ulang-10-per-detik-ukur-dulu-baru-percaya) berpesan: jangan menebak, **ukur dulu**. Praktik ini memisahkan tiga hal: seberapa sering layar digambar ulang pada laju nyata, apa yang terjadi kalau satu perangkat mengirim 10 kali per detik, dan apa gunanya selektor sempit. Tidak ada kode yang tersisa: berkas ujinya dihapus di akhir, jadi tahap `kode/tahap/praktik-6/` sama persis dengan `praktik-5/`.

> [!NOTE]
> Angka di kotak **Hasilnya** praktik ini adalah **contoh** dari laptop penulis: dapur (`npm run dev`, dengan StrictMode), Edge 156, layar detail **Latihan ruang tamu**, rekaman 10 detik, dihitung dengan skrip kecil yang membaca data yang sama dengan Profiler. Angkamu pasti berbeda; yang perlu cocok adalah **perbandingannya**.

#### 6.1 React DevTools: sorot gambar ulang dan rekam Profiler (5 menit)

React DevTools punya dua alat ukur. **Highlight updates** memberi bingkai sekilas pada setiap komponen yang baru digambar ulang; **Profiler** mencatat setiap *commit*, yaitu setiap kali React menuliskan hasil gambar ulang ke layar.

1. Buka `http://localhost:5173` (masuk kalau perlu), klik kartu **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**), dan tunggu lencana **Live**.
2. **Nyalakan sorotan.** Buka DevTools (**F12**), klik tab **Components ⚛**, klik ikon gerigi (setelan), pilih bagian **General**, lalu centang **Highlight updates when components render**. Tutup setelan dan amati halaman ±20 detik: bingkai berkedip tiap detik di grafik dan tulisan `terakhir dilihat`. Warna bingkai bergeser dari hijau-toska (jarang digambar) ke kuning-jingga (sering). Kalau kedipannya mengganggu mata, matikan lagi dan andalkan Profiler saja.
3. **Rekam 10 detik.** Klik tab **Profiler ⚛**, klik tombol rekam bulat di kiri atas (saat ditunjuk tetikus tertulis `Start profiling - Ctrl+E`), tunggu ±10 detik, lalu klik tombol yang sama untuk berhenti. Penghitung di kanan atas berbentuk `1 / N`: N adalah jumlah *commit* selama rekaman. Di grafik nyala (*flamegraph*) di bawahnya, satu batang = satu komponen. Klik batang `DetailPerangkat`, lalu `GrafikLive`: panel kanan mendaftar setiap kali komponen itu digambar (`Rendered at:`), satu baris per gambar ulang.

**Hasilnya (contoh):** N = `33`, sekitar 3 *commit* per detik. Di lab penulis, dalam 10 detik itu `TerakhirDilihat` dan `GrafikLive` masing-masing digambar 11×, `DetailPerangkat` 1×, dan `LencanaKoneksi` 0×.

Hampir semua *commit* itu datang dari detak jam 1 detik ([Konsep 6](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling)), bukan dari data: simulator hanya mengirim sekali per 10 detik, dan `DetailPerangkat` digambar sekali per kiriman. Pada laju nyata, dashboard-mu sudah jauh dari 10× per detik.

#### 6.2 Beban palsu 10 bacaan per detik (10 menit)

Untuk melihat perangkat yang mengirim 10 kali per detik, backend dan simulator tidak perlu diubah: cukup berkas sementara yang menyuntikkan bacaan palsu langsung ke toko.

1. **Buat berkasnya.** Di VS Code, buat folder `uji` di dalam `frontend/src`, lalu berkas `bebanPalsu.ts` di dalamnya. Buka [`kode/praktik-6/src/uji/bebanPalsu.ts`](kode/praktik-6/src/uji/bebanPalsu.ts) di GitHub, klik **Copy raw file**, lalu tempel. Pengaturannya ada di bagian atas:

```ts
const ID = "f00d00000001"; // perangkat yang dibanjiri; dengan Kit A + B, ganti dengan device_id Node 1
const PER_DETIK = 10;
const LAMA_DETIK = 60;
```

Jalur perangkat: ganti `f00d00000001` dengan `device_id` Node 1-mu. Berkas ini tidak menyentuh jaringan. Begitu lencana **Live** muncul, ia memanggil `useToko.getState().terima(ID, isi)`, jalan yang sama dengan acara `telemetry` dari soket, 10 kali per detik selama 60 detik, lalu berhenti sendiri. `setInterval` di dalamnya hanya pompa uji, bukan *polling* (tidak ada pertanyaan ke backend), dan berkasnya dihapus di 6.3. Jangan di-*commit* ke Git.

2. **Pasang satu baris.** Di `src/main.tsx`, tambahkan satu baris tepat di bawah `import App` (petik tunggal tanpa titik koma, mengikuti gaya berkas itu), sehingga menjadi:

```tsx
import App from './App.tsx'
import './uji/bebanPalsu'
```

3. **Jalankan.** Simpan, buka tab **Console**, lalu tekan **F5**. Pompa mulai begitu lencana **Live** muncul dan hanya berjalan 60 detik, jadi segera klik kartu **Latihan ruang tamu**. Kalau waktunya keburu habis, tekan **F5** lagi.

**Hasilnya:**

```text
bebanPalsu: mulai, 10 bacaan per detik selama 60 detik untuk f00d00000001
```

Ujung kanan grafik 5 menit cepat dipenuhi titik rapat (skrip lab: ±80–100 titik baru per 10 detik).

4. **Ukur lagi.** Rekam Profiler 10 detik seperti di 6.1.

**Hasilnya (contoh):** N = `181` (rekaman lebih awal, dengan kode penulis yang belum final: `228`), `DetailPerangkat` digambar 76× dalam 10 detik (rekaman itu: 99×), dan `LencanaKoneksi` tetap 0×.

Inilah yang diwaspadai Silabus: dengan data 10 kali per detik, `DetailPerangkat` memang digambar ulang ±8–10× per detik. Selektor sempit tidak bisa mencegahnya, karena layar itu memang memakai angka yang berubah; *batching* React juga tidak, karena setiap kiriman datang terpisah (Konsep 5). Obat untuk data yang sungguh 10 Hz adalah *throttle*: tampung bacaan, lalu tampilkan misalnya tiap 500 ms ([🔬](#-bedah-teknis-opsional) *Data 10 kali per detik*). Perangkat Rumah Pintar Mini biasanya hanya mengirim sekali per 10 detik, jadi v0.2 tidak memakainya.

#### 6.3 Bandingkan, catat, lalu hapus berkas ujinya (10 menit)

Selektor sempit menolong komponen yang **tidak** memakai data yang berubah. Buktikan di `LencanaKoneksi`.

1. Di `src/components/LencanaKoneksi.tsx`, ganti sementara baris `const koneksi = useToko((s) => s.koneksi);` dengan selektor lebar (seluruh toko), lalu simpan:

```tsx
  const { koneksi } = useToko();
```

2. Tekan **F5** (pompa beban palsu berjalan lagi 60 detik), klik **Latihan ruang tamu**, rekam Profiler 10 detik, lalu klik batang `LencanaKoneksi`.

**Hasilnya (contoh, rekaman lebih awal):** `LencanaKoneksi` digambar ulang 104× dalam 10 detik (dengan selektor sempit: 0×), padahal tulisannya tetap `Live`.

3. Kembalikan baris aslinya (**Ctrl + Z**), lalu simpan. Catat ketiga N-mu (laju nyata, beban palsu, selektor lebar) di buku catatan, bukan di proyek. Mau menguji animasi juga? Hapus sementara baris `isAnimationActive={false}` di `GrafikLive.tsx` (bukan komentarnya), tekan **F5**, rekam, lalu kembalikan. Di lab penulis bedanya tidak terukur, jadi baris itu dipertahankan demi kejujuran visual ([Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status)), bukan kecepatan.
4. **Hapus berkas ujinya.** Hapus baris `import './uji/bebanPalsu'` dari `src/main.tsx`, klik kanan folder `src/uji` di panel Explorer VS Code → **Delete** (setujui), dan hapus centang **Highlight updates**.
5. **Periksa.** Di terminal kosong (folder `frontend`), jalankan `git status`: jawabannya harus `nothing to commit, working tree clean`. Masih ada `src/uji/` atau berkas `modified`? Hapus foldernya atau jalankan `git restore <berkas>`. Praktik 6 sengaja tidak meninggalkan kode, jadi tidak ada *commit* Git. Templat *pull request* di [➕ C](#c-tambahkan-butir-modul-23-ke-templat-pull-request) memeriksa hal yang sama.

> ⬆️ **Selesai Praktik 6?** Baca [Konsep 11 — Riwayat dari ember](#11-riwayat-dari-ember-tiga-rentang-tabel-berhalaman-dan-csv), lalu lanjut ke [Praktik 7 — Riwayat 1 jam, 24 jam, dan 7 hari](#praktik-7--riwayat-1-jam-24-jam-dan-7-hari-55-menit).

### Praktik 7 — Riwayat 1 jam, 24 jam, dan 7 hari (55 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 6 yang masih menyala (backend v1.0 dan Vite; jalur laptop juga broker dan simulator) plus satu terminal kosong (untuk `isi-riwayat` di folder `backend`, lalu Git di `frontend`); **Docker Desktop** (`rumahpintar-db` menyala); **Bruno**; dan **Chrome atau Edge** di `http://localhost:5173` dengan tab **Network** DevTools. Konsep yang dipakai: Konsep 11.
>
> ⭐ **Wajib** — langkah 7.4: riwayat 7 hari termuat kurang dari 1 detik, disaksikan log backend, tab **Network**, dan teks `dimuat dalam … ms` di layar.

Selama ini riwayat hanya bisa kamu intip lewat Bruno. Praktik ini menambah layar ketiga, **Riwayat**, yang dibuka dari tombol **Riwayat →** di Detail. Tiga tombol rentang memilih ukuran ember (Konsep 11), dan setiap pilihan hanya **satu permintaan** dengan nilai bawaan API, tanpa `from` dan `to`:

| Tombol | Permintaan | Satu titik |
| :-- | :-- | :-- |
| **1 jam** | `GET /devices/:id/readings` | satu bacaan mentah |
| **24 jam** | `…/readings?bucket=15m` | rata-rata 15 menit |
| **7 hari** | `…/readings?bucket=1h` | rata-rata 1 jam |

Inilah separuh kedua syarat lulus: **riwayat 7 hari termuat kurang dari 1 detik**.

#### 7.1 Siapkan data 7 hari dan cek di Bruno (10 menit)

Data latihan `npm run isi-riwayat` dari Modul 17 sudah berumur berminggu-minggu, jadi "7 hari terakhir"-nya kosong atau bolong. Isi ulang, lalu ringkas sekali (resepnya juga ada di [🧰](#-yang-perlu-disiapkan)).

1. Di terminal kosong, pindah ke folder `backend` (`cd ../backend`; backend tetap menyala di terminalnya sendiri), lalu jalankan `npm run isi-riwayat`.

   **Hasilnya (contoh):**

   ```text
   > rumah-pintar-mini-backend@1.0.0 isi-riwayat
   > node --env-file=.env src/db/isi-riwayat.ts

   f00d00000001: 1109 bacaan dikirim, 1109 baru tersimpan
   f00d00000002: 1109 bacaan dikirim, 1109 baru tersimpan
   ```

   Skrip ini mengisi satu bacaan tiap 10 menit, dari pukul 00.00 WIB tujuh hari lalu sampai sekarang, untuk dua perangkat latihan. Bacaan yang sudah ada dilewati, jadi angka "baru tersimpan"-mu bisa lebih kecil.

2. Di terminal yang sama, ringkas ke buku ringkasan per jam (`readings_per_jam`, Modul 18):

   ```text
   docker exec -it rumahpintar-db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
   ```

   **Hasilnya:** satu baris `CALL`. Docker Desktop bisa menambah tiga baris mulai dari `What's next:`; itu iklan kecil Docker, abaikan.

   Mengapa perlu? Petugas ringkasan hanya meringkas ulang 3 hari terakhir; bacaan lama yang masuk sekaligus baru tercatat lewat perintah ini. Jendela 8 hari (bukan `NULL` seperti di README backend) menjaga ringkasan lama yang bacaan mentahnya sudah dibuang retensi.

3. Di Bruno (koleksi `backend/bruno`, *environment* `lokal`), kirim **`login viewer`** dulu. Buka **`riwayat per jam Node 1`**, ganti `a4cf12e5b7c0` di URL-nya dengan `f00d00000001`, lalu klik **Send**. Jalur perangkat juga memakai `f00d00000001` karena riwayat Node 1 sungguhan hanya berisi jam-jam saat Node 1, backend, dan database menyala.

**Hasilnya (contoh):** status `200`, `ember` bernilai `1h`, dan `jumlah` bernilai `169` (7 × 24 + 1: awal rentang dibulatkan ke awal jam, dan jam yang sedang berjalan ikut). Setiap butir `ringkasan` berbentuk seperti ini (ditulis satu baris):

```text
{"waktu":"2026-10-17T09:00:00Z","suhu_rata":30,"suhu_min":29.5,"suhu_maks":30.4,"kelembapan_rata":75,"tanah_rata":43.3,"cahaya_rata":1392.3,"jumlah_bacaan":6}
```

`waktu` adalah awal ember dalam UTC (`09:00Z` = pukul 16.00 WIB). Hanya empat besaran yang diringkas, ditambah terendah–tertinggi suhu dan jumlah bacaan per ember.

> [!NOTE]
> **`jumlah` hanya `2`?** Langkah 2 terlewat atau gagal: buku ringkasan masih menyimpan jam-jam lama tanpa data barumu; hanya jam-jam terbaru yang dihitung langsung dari bacaan mentah. Jalankan langkah 2, lalu klik **Send** lagi: di lab penulis jumlahnya kembali `169`. Di database yang benar-benar baru, angkanya bisa sudah `169` tanpa langkah 2; tetap jalankan langkah itu.

Tutup tab permintaannya. Kalau dialog `Unsaved changes` muncul, klik **Don't Save**: URL aslinya tetap milik Node 1.

#### 7.2 Tipe ringkasan dan `ambilRiwayat`: rentang menjadi `bucket` (10 menit)

**Bentuk jawabannya.** Buka `src/types.ts`, lalu tambahkan blok ini di paling bawah, sesudah tipe `Titik` (Praktik 4):

```ts
// satu ember ringkasan (bucket=15m atau 1h): rata-rata semua bacaan dalam ember itu.
// Hanya empat besaran ini yang diringkas backend; tekanan, baterai, dan air tandon tidak ada di riwayat ringkasan.
export type TitikRingkasan = {
  waktu: string; // awal ember, UTC
  suhu_rata: number | null;
  suhu_min: number | null;
  suhu_maks: number | null;
  kelembapan_rata: number | null;
  tanah_rata: number | null;
  cahaya_rata: number | null;
  jumlah_bacaan: number;
};

// jawaban GET /devices/:id/readings?bucket=…  (ember tanpa bacaan tidak dikirim sama sekali)
export type JawabanRingkasan = {
  device_id: string;
  dari: string;
  sampai: string;
  ember: "15m" | "1h" | "1d";
  jumlah: number;
  ringkasan: TitikRingkasan[];
};

// tiga pilihan rentang di layar Riwayat
export type Rentang = "1jam" | "24jam" | "7hari";

// riwayat yang sudah diseragamkan api.ts: bacaan mentah (1 jam) pun diubah ke bentuk TitikRingkasan
export type DataRiwayat = {
  dari: string;
  sampai: string;
  titik: TitikRingkasan[]; // urut dari yang terlama
};
```

`TitikRingkasan` menyalin satu butir `ringkasan` yang kamu lihat di Bruno. `DataRiwayat` adalah bentuk **seragam** untuk layar: grafik (dan di Praktik 8 tabel serta CSV) cukup mengenal satu bentuk, apa pun rentangnya.

**Loket riwayat.** Di `src/api.ts`, ganti baris `import type` paling atas dengan:

```ts
import type { Bacaan, DataRiwayat, JawabanBacaan, JawabanRingkasan, Pengguna, Perangkat, Rentang, TitikRingkasan } from "./types";
```

Lalu tambahkan dua fungsi ini di paling bawah, di bawah `ambilBacaanSejak()`:

```ts
// satu bacaan mentah diubah ke bentuk titik ringkasan, supaya grafik, tabel, dan CSV cukup mengenal SATU bentuk
function keTitikRingkasan(b: Bacaan): TitikRingkasan {
  return {
    waktu: b.ts,
    suhu_rata: b.suhu,
    suhu_min: null, // satu bacaan tidak punya terendah dan tertinggi
    suhu_maks: null,
    kelembapan_rata: b.kelembapan,
    tanah_rata: b.tanah,
    cahaya_rata: b.cahaya,
    jumlah_bacaan: 1,
  };
}

// Modul 23: riwayat untuk layar Riwayat. Rentangnya memakai nilai bawaan API (tanpa from dan to):
// 1 jam = bacaan mentah, 24 jam = rata-rata per 15 menit (bucket=15m), 7 hari = rata-rata per jam (bucket=1h).
export async function ambilRiwayat(deviceId: string, rentang: Rentang): Promise<DataRiwayat> {
  const jalur = "/devices/" + deviceId + "/readings";
  if (rentang === "1jam") {
    const jawaban = await minta<JawabanBacaan>(jalur);
    return { dari: jawaban.dari, sampai: jawaban.sampai, titik: jawaban.bacaan.map(keTitikRingkasan) };
  }
  const bucket = rentang === "24jam" ? "15m" : "1h";
  const jawaban = await minta<JawabanRingkasan>(jalur + "?bucket=" + bucket);
  return { dari: jawaban.dari, sampai: jawaban.sampai, titik: jawaban.ringkasan };
}
```

- **`ambilRiwayat()`** menerjemahkan pilihan layar menjadi permintaan. Tanpa `from`, tidak ada jam `+07:00` yang harus ditulis `%2B` di URL (Praktik 4); backend sendiri menghitung rentang bawaannya.
- **`keTitikRingkasan()`** tidak diekspor karena hanya dipakai di sini. Satu bacaan mentah tidak punya terendah dan tertinggi, jadi keduanya `null`.

Simpan kedua berkas (**Ctrl + S**). Layar belum berubah karena belum ada komponen yang memanggil `ambilRiwayat()`.

#### 7.3 Layar Riwayat: `Riwayat.tsx` dan `GrafikRiwayat.tsx` (25 menit)

**Langkah 1 — Label waktu baru.** Buka [`kode/tahap/praktik-7/frontend/src/waktu.ts`](kode/tahap/praktik-7/frontend/src/waktu.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/waktu.ts`-mu. Tambahannya tiga: `HARI` (satu hari dalam milidetik), `hariTanggalWib()` untuk label sumbu 7 hari (`Sab, 24`), dan `tanggalJamWib()` untuk *tooltip* (`Sab, 24 Okt, 16.00 WIB`). Keduanya memakai `Intl` berzona `Asia/Jakarta` yang dibuat sekali, seperti `jamMenitWib()`.

**Langkah 2 — Grafiknya dulu.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`GrafikRiwayat.tsx`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-7/frontend/src/components/GrafikRiwayat.tsx`](kode/tahap/praktik-7/frontend/src/components/GrafikRiwayat.tsx), klik **Copy raw file**, lalu tempel):

```tsx
// GrafikRiwayat.tsx - grafik riwayat satu besaran: garis rata-rata (untuk suhu ditambah terendah dan tertinggi),
// dengan celah yang jujur. Jam-jam tanpa data tampak sebagai celah, bukan garis lurus yang seolah-olah ada datanya.
import { useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { DataRiwayat, Jenis, Rentang } from "../types";
import { HARI, hariTanggalWib, JAM, jamMenitWib, jamWib, MENIT, tanggalJamWib, ticksTiap } from "../waktu";
import Pemilih from "./Pemilih";

// Hanya empat besaran ini yang diringkas backend per 15 menit dan per jam.
type Besaran = "suhu" | "kelembapan" | "tanah" | "cahaya";
type Aturan = {
  nama: string;
  judul: string;
  satuan: string;
  kolom: "suhu_rata" | "kelembapan_rata" | "tanah_rata" | "cahaya_rata";
  domain: [number | "auto", number | "auto"];
  warna: string;
};
// Skala suhu mengikuti datanya (satuannya tertulis di judul); besaran lain punya batas alami, jadi skalanya tetap.
const BESARAN: Record<Besaran, Aturan> = {
  suhu: { nama: "Suhu", judul: "Suhu (°C)", satuan: " °C", kolom: "suhu_rata", domain: ["auto", "auto"], warna: "var(--color-sky-500)" },
  kelembapan: {
    nama: "Kelembapan",
    judul: "Kelembapan udara (%)",
    satuan: " %",
    kolom: "kelembapan_rata",
    domain: [0, 100],
    warna: "var(--color-teal-500)",
  },
  tanah: { nama: "Tanah", judul: "Kelembapan tanah (%)", satuan: " %", kolom: "tanah_rata", domain: [0, 100], warna: "var(--color-lime-600)" },
  cahaya: {
    nama: "Cahaya",
    judul: "Cahaya (0 = gelap, 4095 = terang)",
    satuan: "",
    kolom: "cahaya_rata",
    domain: [0, 4095],
    warna: "var(--color-amber-500)",
  },
};

const PILIHAN: { nilai: Besaran; teks: string }[] = [
  { nilai: "suhu", teks: "Suhu" },
  { nilai: "kelembapan", teks: "Kelembapan" },
  { nilai: "tanah", teks: "Tanah" },
  { nilai: "cahaya", teks: "Cahaya" },
];

// Untuk tiap rentang: jarak terbesar antara dua titik yang masih dianggap bersambung (lebih dari ini = ada data yang
// hilang), jarak antarlabel sumbu waktu, dan bentuk labelnya.
const SUMBU: Record<Rentang, { celah: number; langkah: number; label: (t: number) => string }> = {
  "1jam": { celah: 25 * 1000, langkah: 10 * MENIT, label: jamMenitWib }, // bacaan tiap 10 detik: 2 kiriman hilang = celah
  "24jam": { celah: 1.5 * 15 * MENIT, langkah: 3 * JAM, label: jamMenitWib }, // ember 15 menit
  "7hari": { celah: 1.5 * JAM, langkah: HARI, label: hariTanggalWib }, // ember 1 jam; label tiap pukul 00.00 WIB
};

type Baris = { t: number; rata: number | null; min: number | null; maks: number | null };

// sisipkanCelah - kalau dua titik berjauhan lebih dari "celah", sisipkan satu titik kosong (null) di antaranya.
// Recharts memutus garis di titik null (connectNulls bawaannya false). Cara kerjanya sama dengan sisipkanCelah di
// GrafikLive.tsx (Praktik 4); bedanya hanya bentuk barisnya.
function sisipkanCelah(baris: Baris[], celah: number): Baris[] {
  const hasil: Baris[] = [];
  for (const b of baris) {
    const sebelum = hasil.at(-1); // titik terakhir yang sudah masuk (undefined untuk titik pertama)
    if (sebelum !== undefined && b.t - sebelum.t > celah) {
      hasil.push({ t: sebelum.t + 1, rata: null, min: null, maks: null });
    }
    hasil.push(b);
  }
  return hasil;
}

type Props = {
  data: DataRiwayat;
  rentang: Rentang;
  jenis: Jenis; // Node 2 tidak punya sensor cahaya
};

export default function GrafikRiwayat({ data, rentang, jenis }: Props) {
  const [besaran, setBesaran] = useState<Besaran>("suhu");
  const b = BESARAN[besaran];
  const sumbu = SUMBU[rentang];
  const dari = Date.parse(data.dari);
  const sampai = Date.parse(data.sampai);
  // terendah dan tertinggi hanya ada di ringkasan suhu (bacaan mentah 1 jam tidak punya)
  const minMaks = besaran === "suhu" && rentang !== "1jam";
  const baris = sisipkanCelah(
    data.titik.map((p) => ({
      t: Date.parse(p.waktu),
      rata: p[b.kolom],
      min: minMaks ? p.suhu_min : null,
      maks: minMaks ? p.suhu_maks : null,
    })),
    sumbu.celah,
  );

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{b.judul}</h3>
        <Pemilih
          label="Besaran riwayat"
          pilihan={jenis === "node2" ? PILIHAN.filter((p) => p.nilai !== "cahaya") : PILIHAN}
          dipilih={besaran}
          onPilih={setBesaran}
        />
      </div>
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <LineChart responsive data={baris} style={{ width: "100%", height: 260 }} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--warna-garis)" />
          {/* domain = rentang yang ditanyakan (dari … sampai): bagian tanpa data di awal atau akhir tetap kelihatan kosong */}
          <XAxis
            dataKey="t"
            type="number"
            domain={[dari, sampai]}
            ticks={ticksTiap(dari, sampai, sumbu.langkah)}
            tickFormatter={sumbu.label}
            tick={{ fill: "currentColor" }}
            stroke="var(--warna-garis)"
          />
          <YAxis domain={b.domain} width={44} tick={{ fill: "currentColor" }} stroke="var(--warna-garis)" />
          <Tooltip
            labelFormatter={(t) => (rentang === "1jam" ? jamWib(Number(t)) : tanggalJamWib(Number(t)))}
            contentStyle={{ backgroundColor: "var(--warna-panel)", borderColor: "var(--warna-garis)", borderRadius: 8 }}
          />
          {minMaks ? (
            <Line dataKey="maks" name="Tertinggi" unit={b.satuan} stroke={b.warna} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
          <Line
            dataKey="rata"
            name={rentang === "1jam" ? b.nama : b.nama + " rata-rata"}
            unit={b.satuan}
            stroke={b.warna}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {minMaks ? (
            <Line dataKey="min" name="Terendah" unit={b.satuan} stroke={b.warna} strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          ) : null}
        </LineChart>
      </div>
      {minMaks ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Garis tebal = rata-rata; garis putus-putus = terendah dan tertinggi.</p>
      ) : null}
    </section>
  );
}
```

- **`BESARAN`** hanya berisi empat besaran ringkasan. Skala suhu mengikuti datanya (`"auto"`, satuannya tertulis di judul); kelembapan dan tanah selalu 0–100, cahaya 0–4095, jadi naik-turun kecil tidak tampak seperti lonjakan (Konsep 9). Node 2 tidak punya sensor cahaya, jadi tombol **Cahaya** disaring.
- **`SUMBU`** menyimpan per rentang: jarak terbesar yang masih dianggap bersambung (25 detik untuk kiriman tiap 10 detik; 1,5 × lebar ember untuk ringkasan) dan jarak label (10 menit, 3 jam, atau satu hari tepat pukul 00.00 WIB, lewat `ticksTiap()` Praktik 4).
- **`sisipkanCelah()`**: API tidak mengirim ember kosong. Tanpa fungsi ini, Recharts menarik garis lurus melewati jam tanpa data. Titik `null` yang disisipkan memutus garisnya karena `connectNulls` bawaannya `false`; caranya sama dengan `GrafikLive` (Praktik 4).
- **`XAxis type="number"` dengan `domain={[dari, sampai]}`**: sumbunya rentang yang ditanyakan, dari jawaban API, jadi bagian tanpa data di awal atau akhir tetap tampak kosong.
- **Suhu bergaris tiga** (`minMaks`): rata-rata tebal diapit terendah dan tertinggi yang putus-putus; tidak untuk 1 jam karena bacaan mentah tidak punya keduanya. `isAnimationActive={false}`: garis langsung utuh di tempatnya, tidak "meluncur" seolah belum selesai termuat.
- Garis bantu, sumbu, dan *tooltip* memakai variabel mode gelap Praktik 5 (`var(--warna-garis)`, `var(--warna-panel)`).

**Langkah 3 — Layarnya.** Dengan cara yang sama, buat **`Riwayat.tsx`** di folder yang sama ([`kode/tahap/praktik-7/frontend/src/components/Riwayat.tsx`](kode/tahap/praktik-7/frontend/src/components/Riwayat.tsx)):

```tsx
// Riwayat.tsx - layar riwayat satu perangkat: pilih rentang (1 jam / 24 jam / 7 hari), lalu lihat grafiknya.
// Satu rentang = SATU permintaan ke API; sisanya (misalnya menandai celah) dikerjakan browser.
import { useEffect, useRef, useState } from "react";
import { ambilRiwayat, GalatApi } from "../api";
import type { DataRiwayat, Perangkat, Rentang } from "../types";
import GrafikRiwayat from "./GrafikRiwayat";
import Pemilih from "./Pemilih";

const PILIHAN: { nilai: Rentang; teks: string }[] = [
  { nilai: "1jam", teks: "1 jam" },
  { nilai: "24jam", teks: "24 jam" },
  { nilai: "7hari", teks: "7 hari" },
];

// apa arti satu titik di setiap rentang (nilai bawaan API backend Modul 18)
const KETERANGAN: Record<Rentang, string> = {
  "1jam": "Bacaan mentah 1 jam terakhir (satu titik = satu kiriman)",
  "24jam": "Rata-rata per 15 menit, 24 jam terakhir (titik = awal tiap 15 menit)",
  "7hari": "Rata-rata per jam, 7 hari terakhir (titik = awal tiap jam)",
};

type Props = {
  perangkat: Perangkat;
  onKembali: () => void;
  onSesiHabis: () => void; // dipanggil kalau backend menjawab 401 (sesudah refresh pun gagal)
};

export default function Riwayat({ perangkat, onKembali, onSesiHabis }: Props) {
  const id = perangkat.device_id;
  const [rentang, setRentang] = useState<Rentang>("7hari");
  const [data, setData] = useState<DataRiwayat | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);
  const [durasiMs, setDurasiMs] = useState<number | null>(null);
  // kapan permintaan riwayat dikirim (milidetik). useRef: nilainya disimpan tanpa membuat layar digambar ulang.
  const mulai = useRef(0);

  useEffect(() => {
    let ignore = false;
    mulai.current = performance.now(); // performance.now() = jam milidetik milik halaman, untuk mengukur lama
    ambilRiwayat(id, rentang)
      .then((d) => {
        if (!ignore) setData(d);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat riwayat.");
      });
    return () => {
      ignore = true;
    };
  }, [id, rentang, onSesiHabis]);

  // Efek berjalan SESUDAH React selesai menggambar data baru ke layar: saat itulah riwayat dianggap "termuat".
  useEffect(() => {
    if (data !== null) setDurasiMs(Math.round(performance.now() - mulai.current));
  }, [data]);

  function pilihRentang(r: Rentang) {
    if (r === rentang) return;
    setRentang(r);
    setData(null); // kosongkan dulu, supaya tidak ada grafik rentang lama yang tampak seperti rentang baru
    setGalat(null);
    setDurasiMs(null);
  }

  let isi;
  if (galat !== null) {
    isi = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  } else if (data === null) {
    isi = <p className="mt-4 text-slate-500 dark:text-slate-400">Memuat riwayat…</p>;
  } else {
    isi = (
      <>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {KETERANGAN[rentang]} · {data.titik.length} titik
          {/* waktu dari permintaan dikirim sampai grafik selesai digambar React; bisa dibaca di HP tanpa DevTools */}
          {durasiMs !== null ? " · dimuat dalam " + durasiMs + " ms" : null}
        </p>
        {data.titik.length === 0 ? (
          <p className="mt-4 rounded-lg bg-white p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Belum ada data di rentang ini.
          </p>
        ) : (
          <GrafikRiwayat data={data} rentang={rentang} jenis={perangkat.jenis} />
        )}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Riwayat ringkasan hanya menyimpan suhu, kelembapan, kelembapan tanah, dan cahaya.
        </p>
      </>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onKembali}
        className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
      >
        ← Kembali ke detail
      </button>
      <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800 dark:text-slate-100">
        Riwayat {perangkat.nama ?? id}
      </h2>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {perangkat.lokasi ?? "lokasi belum diisi"} · <span className="font-mono text-xs">{id}</span>
      </p>
      <Pemilih label="Rentang waktu" pilihan={PILIHAN} dipilih={rentang} onPilih={pilihRentang} />
      {isi}
    </div>
  );
}
```

- **`Pemilih`** (Praktik 4) menampilkan tiga tombol rentang; bawaannya **7 hari**, rentang yang diukur di 7.4.
- **Efek pertama** berpola Modul 22: `ignore` membuang jawaban yang sudah tidak diminta, misalnya jawaban pertama saat `StrictMode` menjalankan efek dua kali di mode dev, atau saat rentang diganti sebelum jawabannya datang. 401 (sesudah *refresh* pun gagal) memanggil `onSesiHabis()`.
- **`useRef`** menyimpan angka di `mulai.current` tanpa membuat layar digambar ulang, berbeda dengan papan tulis `useState`. `performance.now()` adalah *stopwatch* milik halaman, dalam milidetik; dicatat saat permintaan dikirim.
- **Efek kedua** berjalan sesudah React selesai menggambar data baru ke layar. Selisih kedua catatan itulah `dimuat dalam … ms`, yang bisa dibaca di HP tanpa DevTools.
- **`pilihRentang()`** mengosongkan data lama dulu supaya grafik 7 hari tidak sempat tampil di bawah tombol **1 jam**.

**Langkah 4 — Tombol di Detail, layar ketiga di `App`.** Ganti seluruh isi `src/components/DetailPerangkat.tsx` dengan [`kode/tahap/praktik-7/frontend/src/components/DetailPerangkat.tsx`](kode/tahap/praktik-7/frontend/src/components/DetailPerangkat.tsx) dan `src/App.tsx` dengan [`kode/tahap/praktik-7/frontend/src/App.tsx`](kode/tahap/praktik-7/frontend/src/App.tsx) (**Copy raw file**). Di Detail, yang baru hanya titipan `onRiwayat: () => void;`, tombol **Riwayat →** di samping **← Kembali ke daftar**, dan kalimat Node 2 yang kini diakhiri `Grafiknya ada di Riwayat.` Di `App`, `Tampilan` mendapat pilihan ketiga:

```tsx
type Tampilan = { nama: "daftar" } | { nama: "detail"; perangkat: Perangkat } | { nama: "riwayat"; perangkat: Perangkat };
```

Tiga layar terlalu ruwet untuk `? :` bertingkat, jadi `App` memilihnya lebih dulu ke variabel `layar` dengan `if`/`else` (pola `let isi` di Detail), lalu `<main>` cukup berisi `{layar}`. Cabang Detail memberi `onRiwayat={() => setTampilan({ nama: "riwayat", perangkat })}`, dan **← Kembali ke detail** di Riwayat kembali ke perangkat yang sama. Alamatnya tetap `http://localhost:5173`; tombol **Back** browser masih keluar dari dashboard sampai React Router datang di Modul 24.

Simpan semua berkas, lalu buka **Latihan ruang tamu** → **Riwayat →**.

**Hasilnya (contoh):** judul `Riwayat Latihan ruang tamu`, tombol **7 hari** aktif, baris `Rata-rata per jam, 7 hari terakhir (titik = awal tiap jam) · 169 titik · dimuat dalam 26 ms`, dan grafik **Suhu (°C)** yang bergelombang harian: garis tebal diapit dua garis putus-putus, satu label per hari (`Min, 18` sampai `Sab, 24`), dan keterangan `Garis tebal = rata-rata; garis putus-putus = terendah dan tertinggi.`

Klik **24 jam**, lalu **1 jam** (untuk 1 jam, pakai perangkat yang mengirim tiap 10 detik: **Latihan ruang tamu** dengan simulator menyala di jalur laptop, **Node 1** di jalur perangkat). **Hasilnya (contoh):** `Rata-rata per 15 menit, 24 jam terakhir (titik = awal tiap 15 menit) · 97 titik · dimuat dalam 13 ms`, lalu `Bacaan mentah 1 jam terakhir (satu titik = satu kiriman) · 298 titik · dimuat dalam 35 ms` dengan satu garis saja, tanpa terendah–tertinggi. Riwayat **Node 2** (jalur perangkat) hanya punya tombol besaran **Suhu**, **Kelembapan**, dan **Tanah**.

Mau melihat celah yang jujur? Jalur laptop: hentikan simulator (**Ctrl + C**), tunggu sekitar satu menit, jalankan lagi, lalu klik **24 jam** dan kembali ke **1 jam**: garisnya putus di menit-menit tanpa data, bukan disambung lurus.

#### 7.4 ⭐ Riwayat 7 hari termuat kurang dari 1 detik (10 menit)

Tiga saksi melihat bagian yang berbeda: **log backend** (lama backend menjawab), kolom **Time** di tab **Network** (ditambah perjalanan di jaringan), dan `dimuat dalam … ms` (dari permintaan dikirim sampai React selesai menggambar grafiknya).

1. Di tab **Network**, centang **Disable cache**, ketik `bucket` di kotak saring, lalu klik **Clear network log**.
2. Di Riwayat **Latihan ruang tamu**, klik **← Kembali ke detail**, lalu **Riwayat →** lagi: rentang bawaan **7 hari** langsung dimuat.
3. Catat angka dari ketiga saksi. Ulangi langkah 2 sampai genap tiga pembukaan, lalu pakai angka yang **terlama**.

**Hasilnya** (**contoh**, mode dev di laptop penulis yang sedang sibuk; angkamu pasti berbeda): layar `… · 169 titik · dimuat dalam 26 ms`; tab **Network** dua baris `readings?bucket=1h` berstatus `200` dengan **Time** sekitar 13 dan 18 ms; terminal backend:

```text
[16:46:26] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (9 ms)
[16:46:26] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (13 ms)
```

Permintaannya dua karena `StrictMode` menjalankan efek dua kali di mode dev; jawaban pertama dibuang `ignore`. Pembukaan kedua dan ketiga di lab: `16 ms` dan `465 ms`. Yang terakhir tertahan di laptop yang sangat sibuk, padahal backend menjawab dalam 17 ms; tetap di bawah 1 detik.

![Tangkapan layar asli Riwayat 7 hari di Edge, laptop 1280 px, halaman utuh dipotong di tengah tabel (data isi-riwayat dan buku ringkasan yang sudah di-refresh, Praktik 7–8). Atas: lencana Live, ← Kembali ke detail, Riwayat Latihan ruang tamu; tombol 1 jam, 24 jam, 7 hari yang aktif (penanda 1); Rata-rata per jam, 7 hari terakhir (titik = awal tiap jam) · 169 titik · dimuat dalam 153 ms (penanda 2). Grafik Suhu (°C) dengan tombol Suhu, Kelembapan, Tanah, Cahaya (penanda 3): garis tebal bergelombang harian, siang ±30 °C dan malam ±22 °C, diapit garis putus-putus; sumbu Min, 18 sampai Sab, 24 (penanda 5); catatan Garis tebal = rata-rata; garis putus-putus = terendah dan tertinggi (penanda 4). Tabel (terbaru dulu), kepala dan baris pertama ditandai (penanda 6): Sab, 24 Okt, 16.00 WIB, 28.8, 25.1–33, 71.3, 40.2, 2244, 108; baris lain dipotong. Bawah: Jum, 23 Okt, 18.00 dan 17.00 WIB, ← Sebelumnya redup, Halaman 1 dari 8, Berikutnya → (penanda 7), tombol hijau Unduh CSV (penanda 8). Keterangan: 1 satu permintaan per pilihan; 2 ember 1 jam, ukur syarat lulus kurang dari 1 detik; 3 besaran ringkasan; 4 rata-rata per jam dan rentangnya; 5 satu label per hari; 6 24 baris per halaman; 7 169 baris = 8 halaman; 8 berkas CSV untuk Excel.](aset/riwayat-7-hari-tabel.png)

Tangkapan ini diambil sesudah Praktik 8, jadi tabel dan **Unduh CSV** (penanda 6–8) baru kamu buat di praktik berikutnya; `dimuat dalam 153 ms`-nya berasal dari laptop yang sedang sangat sibuk.

**Kamu lulus langkah ⭐ ini** kalau ketiga pembukaan 7 hari menampilkan `dimuat dalam` di bawah 1.000 ms, **Time** di Network juga di bawah 1 detik, dan log backend mencatat `-> 200`. Itulah syarat lulus kedua di laptop; gladi bersihnya di [10.3](#103--gladi-bersih-kedua-syarat-lulus-15-menit).

> [!TIP]
> Pembukaan pertama sesudah database baru disiapkan bisa lambat (lab penulis: `830 ms`, backend sendiri 562 ms). Ukur lagi sesudahnya, dan tutup program berat yang membuat laptop sibuk.

Di terminal kosong, pindah ke folder `frontend` (`cd ../frontend`), lalu simpan ke cabang:

```text
git add src/types.ts src/api.ts src/waktu.ts src/App.tsx src/components/DetailPerangkat.tsx src/components/Riwayat.tsx src/components/GrafikRiwayat.tsx
git commit -m "Riwayat 1 jam, 24 jam, dan 7 hari (Modul 23 Praktik 7)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-7/frontend/`](kode/tahap/praktik-7/frontend/).

> ⬆️ **Selesai Praktik 7?** Riwayat 7 hari kini tampil di dashboard dan termuat jauh di bawah 1 detik. Lanjut ke [Praktik 8 — Tabel berhalaman dan ekspor CSV](#praktik-8--tabel-berhalaman-dan-ekspor-csv-40-menit): angka yang sama tampil sebagai tabel dan bisa dibawa pulang sebagai berkas CSV.

### Praktik 8 — Tabel berhalaman dan ekspor CSV (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 7 (backend v1.0 dan Vite; jalur laptop juga broker dan simulator) plus satu terminal kosong di folder `frontend` untuk Git; **Docker Desktop**; **Chrome atau Edge** di `http://localhost:5173`; **File Explorer** (macOS: **Finder**); di 8.3, aplikasi lembar kerja kalau ada (Excel, LibreOffice Calc, atau Google Sheets). Konsep yang dipakai: Konsep 11.

Grafik Praktik 7 memperlihatkan **bentuk** tujuh hari terakhir. Angka persisnya lebih enak dibaca di **tabel**, dan angka yang mau kamu olah sendiri dibawa ke Excel sebagai **CSV**. API tidak punya pilihan halaman maupun rute CSV ([Konsep 11](#11-riwayat-dari-ember-tiga-rentang-tabel-berhalaman-dan-csv)), jadi keduanya dikerjakan **browser** dari jawaban yang sudah ada, tanpa permintaan baru ke backend.

Pastikan semuanya menyala seperti Praktik 7, lalu buka **Latihan ruang tamu** → **Riwayat →** (`f00d00000001`, sama dengan Praktik 7).

#### 8.1 `TabelRiwayat`: terbaru dulu, 24 baris per halaman (20 menit)

Riwayat 7 hari berisi 169 titik (7 × 24 jam, ditambah jam yang sedang berjalan). Satu tabel sepanjang itu harus digulir lama, apalagi di HP. Jadi tabel dipotong per **24 baris** (pada rentang 7 hari, satu halaman = 24 jam) dan dibalik menjadi **terbaru dulu** karena jam-jam terakhirlah yang paling sering dicari, sedangkan API selalu mengirim dari yang terlama.

**Langkah 1 — Komponen baru.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`TabelRiwayat.tsx`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-8/frontend/src/components/TabelRiwayat.tsx`](kode/tahap/praktik-8/frontend/src/components/TabelRiwayat.tsx) di GitHub, klik **Copy raw file**, lalu tempel):

```tsx
// TabelRiwayat.tsx - isi riwayat sebagai tabel, terbaru dulu, 24 baris per halaman. Halamannya dibagi di browser:
// datanya sudah lengkap di tangan (±360 baris untuk 1 jam bacaan tiap 10 detik, ditambah kiriman segera; batas API 1.000).
import { useState } from "react";
import type { TitikRingkasan } from "../types";
import { jamWib, tanggalJamWib } from "../waktu";

const PER_HALAMAN = 24;

type Props = {
  titik: TitikRingkasan[]; // urut dari yang terlama, seperti jawaban API
  mentah: boolean; // true = bacaan mentah (1 jam): tidak ada kolom terendah-tertinggi dan jumlah bacaan
};

// angka di layar memakai titik desimal, seperti di kartu sensor; null = "—"
function angka(nilai: number | null): string {
  return nilai === null ? "—" : String(nilai);
}

export default function TabelRiwayat({ titik, mentah }: Props) {
  const [halaman, setHalaman] = useState(1);
  const terbaruDulu = [...titik].reverse(); // salinan yang dibalik: urutan asli (lama -> baru) tidak diubah
  const jumlahHalaman = Math.max(1, Math.ceil(terbaruDulu.length / PER_HALAMAN));
  const baris = terbaruDulu.slice((halaman - 1) * PER_HALAMAN, halaman * PER_HALAMAN);
  const sel = "px-3 py-2 text-right whitespace-nowrap";
  const tombol =
    "min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm hover:bg-slate-50 disabled:opacity-40 " +
    "dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700";

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Tabel (terbaru dulu)</h3>
      {/* overflow-x-auto: di HP, tabel yang lebar digeser di dalam kotaknya sendiri; halamannya tidak ikut bergeser */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm text-slate-700 dark:text-slate-200">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-2 text-left whitespace-nowrap">Waktu</th>
              <th className={sel}>Suhu °C</th>
              {mentah ? null : <th className={sel}>Terendah–tertinggi</th>}
              <th className={sel}>Kelembapan %</th>
              <th className={sel}>Tanah %</th>
              <th className={sel}>Cahaya</th>
              {mentah ? null : <th className={sel}>Bacaan</th>}
            </tr>
          </thead>
          <tbody>
            {baris.map((p) => (
              <tr key={p.waktu} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="px-3 py-2 whitespace-nowrap">{mentah ? jamWib(p.waktu) : tanggalJamWib(Date.parse(p.waktu))}</td>
                <td className={sel}>{angka(p.suhu_rata)}</td>
                {mentah ? null : (
                  <td className={sel}>
                    {angka(p.suhu_min)}–{angka(p.suhu_maks)}
                  </td>
                )}
                <td className={sel}>{angka(p.kelembapan_rata)}</td>
                <td className={sel}>{angka(p.tanah_rata)}</td>
                <td className={sel}>{angka(p.cahaya_rata)}</td>
                {mentah ? null : <td className={sel}>{p.jumlah_bacaan}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
        <button type="button" className={tombol} disabled={halaman === 1} onClick={() => setHalaman(halaman - 1)}>
          ← Sebelumnya
        </button>
        <span>
          Halaman {halaman} dari {jumlahHalaman}
        </span>
        <button type="button" className={tombol} disabled={halaman === jumlahHalaman} onClick={() => setHalaman(halaman + 1)}>
          Berikutnya →
        </button>
      </div>
    </section>
  );
}
```

- **`[...titik].reverse()`**: `reverse()` membalik *array* **aslinya**, padahal grafik dan CSV (8.2) memakai `titik` yang sama dengan urutan lama → baru. Jadi, yang dibalik salinannya, seperti `[...lama, ...baru]` di [Pemanasan Langkah 2](#langkah-2--jendela-geser-5-menit-tambah-saring-dan-buang-yang-ganda).
- **`halaman`** = papan tulis kecil berisi nomor halaman. **`jumlahHalaman`** = 169 ÷ 24 dibulatkan ke atas = 8 (`Math.max(1, …)`: tidak pernah "dari 0"). **`slice()`** mengambil baris nomor 0–23 untuk halaman 1 (JavaScript menghitung dari 0); halaman 8 tinggal baris nomor 168. Tombol di ujung dimatikan dengan `disabled`.
- **`mentah`** (rentang 1 jam): satu baris = satu kiriman, jadi kolom **Terendah–tertinggi** dan **Bacaan** disembunyikan dan waktunya cukup jam (`jamWib`).
- **`angka()`**: titik desimal seperti kartu sensor; `null` (sensor gagal dibaca) ditulis `—`, bukan nol ([Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status)).
- **`overflow-x-auto`**: di layar 375 px, tabel digeser di dalam kotaknya sendiri, bukan seluruh halaman.

**Langkah 2 — Pasang di `Riwayat`.** Buka `src/components/Riwayat.tsx`. Tambahkan `import TabelRiwayat from "./TabelRiwayat";` di bawah baris `import Pemilih from "./Pemilih";`. Lalu ganti baris `<GrafikRiwayat data={data} rentang={rentang} jenis={perangkat.jenis} />` dengan blok ini (`<>…</>` membungkus dua komponen menjadi satu isi):

```tsx
          <>
            <GrafikRiwayat data={data} rentang={rentang} jenis={perangkat.jenis} />
            {/* key = rentang: jaga-jaga supaya tabel rentang lain selalu mulai lagi dari halaman 1 (saat memuat,
                pilihRentang sudah mengosongkan data, jadi tabel lama memang sudah hilang dari layar) */}
            <TabelRiwayat key={rentang} titik={data.titik} mentah={rentang === "1jam"} />
          </>
```

`key={rentang}`: rentang baru = tabel baru dengan papan tulis bersih (seperti `key` pada `DetailPerangkat` Modul 22). Simpan (**Ctrl + S**).

**Hasilnya (contoh):** di bawah grafik muncul kotak **Tabel (terbaru dulu)** berkepala `Waktu | Suhu °C | Terendah–tertinggi | Kelembapan % | Tanah % | Cahaya | Bacaan`, berisi 24 baris, dengan `Halaman 1 dari 8` di bawahnya dan tombol **← Sebelumnya** yang redup. Baris pertamanya jam yang sedang berjalan, misalnya `Sab, 24 Okt, 16.00 WIB | 29.2 | 25.1–33 | 70 | 38.9 | 2082.4 | 248`; baris terakhirnya `Jum, 23 Okt, 17.00 WIB`. Klik **Berikutnya →** tujuh kali: `Halaman 8 dari 8` hanya berisi jam tertua (`Sab, 17 Okt, 16.00 WIB | 30 | 29.5–30.4 | 75 | 43.3 | 1392.3 | 6`), dan kini **Berikutnya →** yang redup. Tanggal dan angkamu pasti berbeda.

Kolom **Bacaan** menjawab "rata-rata dari berapa bacaan?": jam dari `isi-riwayat` berisi 6 (satu tiap 10 menit), jam ketika simulator menyala jauh lebih banyak (kiriman tiap 10 detik). Coba juga **24 jam** dan **1 jam**: tabel mulai lagi dari halaman 1, dan pada **1 jam** dua kolom tadi hilang.

#### 8.2 `src/csv.ts` dan tombol Unduh CSV (15 menit)

CSV adalah teks biasa: satu baris per titik, kolom dipisah satu tanda (kamu sudah menyusunnya di [Pemanasan Langkah 5](#langkah-5--teks-csv-untuk-excel-indonesia-titik-koma-dan-koma-desimal)). Untuk Excel dengan setelan wilayah Indonesia (Konsep 11), berkas kita memakai `;`, angka `28,5`, pindah baris gaya Windows (CRLF), dan **BOM** (*byte order mark*) di awal: tiga byte tak terlihat yang memberi tahu Excel bahwa isinya UTF-8 supaya huruf istimewa seperti `°` tidak rusak.

**Langkah 1 — `src/csv.ts`.** Klik kanan folder **`frontend/src`** → **New File…**, beri nama **`csv.ts`**, lalu ketik (atau salin dari [`kode/tahap/praktik-8/frontend/src/csv.ts`](kode/tahap/praktik-8/frontend/src/csv.ts) dengan **Copy raw file**):

```ts
// csv.ts - membuat berkas CSV di browser. Backend tidak punya rute CSV: datanya sudah ada di layar, jadi browser
// sendiri yang menyusun teksnya lalu menyimpannya sebagai berkas. Formatnya disiapkan untuk Excel dengan setelan regional
// Indonesia: pemisah titik koma (;), desimal koma (28,5), BOM di awal berkas, dan setiap baris diakhiri CRLF.

// kutip - nilai yang memuat ; " atau baris baru dibungkus tanda petik, dan petik di dalamnya digandakan.
// Contoh: Node 1; ruang tamu  ->  "Node 1; ruang tamu"
export function kutip(teks: string): string {
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}

// satu sel: angka memakai koma desimal, null (sensor gagal atau kolom tidak ada) menjadi sel kosong
function sel(nilai: string | number | null): string {
  if (nilai === null) return "";
  if (typeof nilai === "number") return String(nilai).replace(".", ",");
  return kutip(nilai);
}

// keCsv - baris-baris (larik berisi larik) menjadi satu teks CSV
export function keCsv(baris: (string | number | null)[][]): string {
  // "\uFEFF" = BOM: tanda tak terlihat bahwa isinya UTF-8, supaya huruf istimewa di nama perangkat (misalnya ° atau é) utuh di Excel
  return "\uFEFF" + baris.map((b) => b.map(sel).join(";")).join("\r\n") + "\r\n";
}

// unduhCsv - minta browser menyimpan teks sebagai berkas, tanpa server
export function unduhCsv(namaBerkas: string, isi: string): void {
  const blob = new Blob([isi], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); // alamat sementara "blob:http://…" yang menunjuk isi di memori browser
  const a = document.createElement("a");
  a.href = url;
  a.download = namaBerkas;
  document.body.append(a);
  a.click(); // sama seperti mengetuk tautan unduhan
  a.remove();
  // lepaskan alamat sementara itu sesudah unduhan dimulai, supaya memorinya bisa dibebaskan
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// "sv-SE" (bahasa Swedia) dipakai karena formatnya kebetulan tahun-bulan-tanggal jam:menit:detik, mudah diurutkan
const WAKTU_CSV = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "medium" });

// waktuCsv - "2026-10-24 16:15:42" dalam WIB
export function waktuCsv(t: string | number): string {
  return WAKTU_CSV.format(new Date(t));
}
```

- **`kutip()`** memakai aturan format yang dijelaskan RFC 4180 (di sana untuk koma). Di lab penulis, nama perangkat sementara `Teras; "uji" kutip` keluar sebagai `"Teras; ""uji"" kutip"`: tetap satu sel.
- **`unduhCsv()`**: teks dibungkus **`Blob`** (berkas di memori browser), diberi alamat sementara, lalu tautan `<a download>` yang tak pernah tampil "diklik" oleh kode.

**Langkah 2 — Tombol di `Riwayat`.** Tombolnya tidak dicetak utuh di sini, jadi salin berkasnya: buka [`kode/tahap/praktik-8/frontend/src/components/Riwayat.tsx`](kode/tahap/praktik-8/frontend/src/components/Riwayat.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/components/Riwayat.tsx`-mu (perubahan 8.1 sudah ada di dalamnya). Yang baru: impor `import { keCsv, unduhCsv, waktuCsv } from "../csv";`, komentar kepala berkas, fungsi `unduh()` di bawah `pilihRentang()`:

```tsx
  // Unduh semua baris rentang ini (bukan hanya halaman tabel yang tampil), urut dari yang terlama.
  function unduh() {
    if (data === null) return;
    const nama = perangkat.nama ?? id;
    const kepala = [
      "waktu_wib",
      "perangkat",
      "suhu_rata_c",
      "suhu_min_c",
      "suhu_maks_c",
      "kelembapan_rata_persen",
      "tanah_rata_persen",
      "cahaya_rata",
      "jumlah_bacaan",
    ];
    const baris = data.titik.map((p) => [
      waktuCsv(p.waktu),
      nama,
      p.suhu_rata,
      p.suhu_min,
      p.suhu_maks,
      p.kelembapan_rata,
      p.tanah_rata,
      p.cahaya_rata,
      p.jumlah_bacaan,
    ]);
    // nama berkas, misalnya riwayat-f00d00000001-7hari-2026-10-24.csv (tanggal WIB hari ini)
    unduhCsv("riwayat-" + id + "-" + rentang + "-" + waktuCsv(Date.now()).slice(0, 10) + ".csv", keCsv([kepala, ...baris]));
  }
```

serta tombol hijau toska **Unduh CSV** (`onClick={unduh}`) tepat di bawah baris `<TabelRiwayat … />`.

`unduh()` memakai **semua** titik rentang itu, urut lama → baru (`data.titik`, bukan salinan terbalik tabel). Kenapa nama perangkat yang diawali `=` perlu diwaspadai: [🔬](#-bedah-teknis-opsional) *CSV dan formula injection*.

Simpan, lalu klik **Unduh CSV** pada rentang **7 hari**.

**Hasilnya (contoh):** browser menyimpan `riwayat-f00d00000001-7hari-2026-10-24.csv` (tanggalnya hari ini) ke folder unduhanmu, misalnya `C:\Users\kamu\Downloads`. Penulis merekam nama dan isi berkas ini langsung dari tombolnya, tanpa menyimpannya ke disk ([📚](#-sumber--atribusi-gambar)). Layar Riwayat-mu kini sama dengan tangkapan di [7.4](#74--riwayat-7-hari-termuat-kurang-dari-1-detik-10-menit), termasuk penanda 6–8: tabel, halaman, dan tombol **Unduh CSV**.

#### 8.3 Buka berkas CSV-nya dan cocokkan dengan tabel (5 menit)

Buka folder unduhan di **File Explorer**, lalu seret berkas `.csv` tadi ke jendela VS Code: isinya tampil sebagai teks apa adanya.

**Hasilnya (contoh, isi berkas rekaman penulis):** 170 baris, yaitu kepala dan 169 baris data dari yang terlama (baris 171 yang kosong hanya akhir berkas). BOM tidak tampil, tetapi menempati tiga byte pertama berkas.

```text
waktu_wib;perangkat;suhu_rata_c;suhu_min_c;suhu_maks_c;kelembapan_rata_persen;tanah_rata_persen;cahaya_rata;jumlah_bacaan
2026-10-17 16:00:00;Latihan ruang tamu;30;29,5;30,4;75;43,3;1392,3;6
2026-10-17 17:00:00;Latihan ruang tamu;29,3;29;30;78,7;42,2;542;6
…
2026-10-24 16:00:00;Latihan ruang tamu;29,2;25,1;33;70;38,9;2082,4;248
```

Cocokkan dengan tabel: baris **terakhir** CSV sama dengan baris **pertama** halaman 1 (`29,2` di CSV = `29.2` di layar), dan baris data **pertama** CSV sama dengan satu-satunya baris di halaman 8. Kalau Riwayat sempat dimuat ulang di antaranya, baris jam berjalan boleh berbeda karena embernya masih terisi.

Punya Excel? Klik dua kali berkasnya. Di Windows berwilayah Indonesia, kolomnya seharusnya terpisah dan angkanya berkoma, tetapi penulis belum bisa mencobanya di Excel sungguhan (📚). Kalau semua isi menumpuk di kolom A, ikuti [🚨](#-kalau-tidak-jalan) *CSV terbuka sebagai satu kolom di Excel, atau `°C` tampil rusak*. LibreOffice Calc dan Google Sheets juga belum dicoba penulis; kalau ditanya pemisah, pilih titik koma.

**Simpan ke cabang.** Di terminal kosong (folder `frontend`, cabang `fitur/dashboard-live`), jalankan `git status`: seharusnya `src/components/Riwayat.tsx` berubah, serta `src/csv.ts` dan `src/components/TabelRiwayat.tsx` di `Untracked files`. Berkas CSV unduhan ada di luar repositori, jadi tidak ikut. Lalu:

```text
git add src/csv.ts src/components/TabelRiwayat.tsx src/components/Riwayat.tsx
git commit -m "Tabel riwayat berhalaman dan unduh CSV (Modul 23 Praktik 8)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-8/frontend/`](kode/tahap/praktik-8/frontend/).

> ⬆️ **Selesai Praktik 8?** Riwayat-mu kini lengkap dengan tabel dan CSV, tetapi masih dibuka dari laptop. Baca [Konsep 12](#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop), lalu lanjut ke [Praktik 9 — Dashboard di HP lewat WiFi rumah](#praktik-9--dashboard-di-hp-lewat-wifi-rumah-60-menit).

### Praktik 9 — Dashboard di HP lewat WiFi rumah (60 menit)

> 🖥️ **Alat yang dipakai:** **HP** (Android atau iPhone) di **WiFi rumah yang sama** dengan laptop; **VS Code** dengan terminal `backend` (backend v1.0, `npm run dev`), **terminal Vite** di folder `frontend`, dan **terminal kosong** di folder `frontend` untuk `ipconfig` dan Git (jalur laptop ditambah broker di `edge` dan simulator di `alat`); berkas `backend/.env`; **Docker Desktop** (`rumahpintar-db` menyala); **Chrome atau Edge** di laptop; **Bruno** dengan akun admin (jalur laptop); dan kamera kedua untuk video di 9.5 (kamera laptop atau HP lain). Konsep yang dipakai: Konsep 12.
>
> ⭐ **Wajib** — langkah 9.5: separuh pertama syarat lulus, di HP. Grafik *live* di layar HP berubah dalam **< 1 interval kirim + 1 detik**, dan videonya menjadi buktimu.

Sampai Praktik 8, dashboard-mu hanya bisa dibuka dari laptop itu sendiri: backend mendengar di `127.0.0.1`, dan Vite hanya melayani `localhost`. Padahal syarat lulus berbunyi "grafik **di HP** berubah". Praktik ini menyalakan **mode HP** dari [Konsep 12](#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop): backend dan Vite dibuka sementara ke WiFi rumah, lalu HP membuka dashboard lewat alamat IP laptop. Tidak ada kode React yang berubah; yang berubah hanya dua baris `backend/.env`, satu skrip npm, dan dua baris komentar di `.env.example`. Ingat aturan aman: mode HP hanya untuk WiFi rumah yang kamu percaya, dan dikembalikan di akhir sesi ([10.4](#104-kembalikan-mode-laptop-5-menit)).

> [!IMPORTANT]
> **Catatan jujur: penulis belum mencoba praktik ini dengan HP sungguhan.** Kotak **Hasilnya** di sini direkam di laptop penulis yang membuka alamat IP WiFi-nya sendiri (`http://192.168.1.10:5173`). Yang terbukti: `HOST`, `CORS_ORIGIN`, *login*, *cookie*, dan soket lewat alamat IP. Yang **tidak** diuji: layar HP, jendela izin *firewall* **Private**, dan HP yang tertidur; langkah HP-nya disusun dari kode backend v1.0 dan dashboard v0.2. Rinciannya di [📚 Sumber](#-sumber--atribusi-gambar).

**Tidak punya HP?** Tablet atau laptop kedua di WiFi yang sama bisa menggantikannya, dengan langkah yang sama. Tanpa perangkat kedua, kerjakan seperti penulis: buka `http://<IP-laptop>:5173` di browser laptopmu sendiri, lalu nyalakan [mode perangkat DevTools](../modul-22-react-dasar/README.md#71-mode-perangkat-devtools-dashboard-di-375-768-dan-1280-px-8-menit) selebar 375 px. Cara ini menguji alamat IP, `CORS_ORIGIN`, dan soket, tetapi **belum** membuktikan "di HP"; catat dengan jujur di [✅ Checklist](#-checklist-kelulusan-modul-23).

#### 9.1 Cari IP WiFi laptopmu (5 menit)

HP perlu "nomor rumah" laptopmu, seperti ESP32 di Modul 10. `localhost` tidak bisa dipakai: bagi HP, `localhost` adalah HP itu sendiri. Di **terminal kosong**, ketik:

```text
ipconfig
```

**Hasilnya (contoh):** satu blok per adaptor jaringan. Di laptop penulis ada tujuh blok; yang dipakai hanya ini:

```text
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : lan
   Link-local IPv6 Address . . . . . : fe80::xxxx:xxxx:xxxx:xxxx%nn
   IPv4 Address. . . . . . . . . . . : 192.168.1.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
```

Baca baris `IPv4 Address` di blok **`Wireless LAN adapter Wi-Fi:`**. Contoh modul ini `192.168.1.10` (sama dengan Modul 10 dan 22); IP-mu akan berbeda, jadi ganti setiap `192.168.1.10` di bawah dengan IP-mu. Blok lain, misalnya `vEthernet (WSL (Hyper-V firewall))` atau `Ethernet 3` milik VirtualBox atau VPN, juga punya `IPv4 Address`, tetapi HP tidak bisa menjangkaunya. Pegangannya: blok Wi-Fi yang punya `Default Gateway` (router-mu). macOS: `ipconfig getifaddr en0`.

Tulis IP-nya dan jam mode HP dinyalakan di catatan belajarmu ([➕ E](#e-simpan-catatan-belajarmu)). IP dibagikan router, jadi **bisa berubah** besok; kalau HP tiba-tiba tidak bisa membuka dashboard, periksa IP-nya dulu.

#### 9.2 Backend mode HP: `HOST` dan `CORS_ORIGIN` (10 menit)

1. Di VS Code, buka `backend/.env` (berkas ini tidak pernah ikut Git). Ubah baris `HOST` dan `CORS_ORIGIN` menjadi:

   ```text
   HOST=0.0.0.0
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173
   ```

   - **`HOST=0.0.0.0`** artinya "dengarkan di **semua** alamat laptop": `127.0.0.1` untuk laptop sendiri, ditambah alamat WiFi untuk HP.
   - **Asal baru di ujung `CORS_ORIGIN`** = alamat halaman yang nanti dibuka HP. Tulis persis: `http`, bukan `https`, tanpa `/` di ujung, dipisah koma tanpa spasi. Satu baris ini berlaku untuk `fetch` **dan** Socket.IO.
   - **Database tidak ikut terbuka:** kontainernya tetap di `127.0.0.1:5432`.

2. Simpan (**Ctrl + S**). Backend `npm run dev` memulai ulang sendiri karena `.env` berubah (dengan `npm start`: **Ctrl + C**, lalu jalankan lagi).

**Hasilnya (contoh)** di terminal `backend`:

```text
Change detected in 'C:\\Users\\kamu\\rumah-pintar-mini\\backend\\.env'
Restarting 'src/server.ts'
[16:49:53] INFO: database siap
[16:49:53] INFO: aturan dimuat: 0 aktif dari 0
[16:49:53] INFO: daftar perangkat dimuat: 4 perangkat terdaftar
[16:49:53] INFO: notifikasi Telegram mati: TELEGRAM_BOT_TOKEN belum diisi
[16:49:53] INFO: Server listening at http://127.0.0.1:8080
[16:49:53] INFO: Server listening at http://172.x.x.x:8080
[16:49:53] INFO: Server listening at http://192.168.x.x:8080
[16:49:53] INFO: Server listening at http://192.168.x.x:8080
[16:49:53] INFO: Server listening at http://192.168.1.10:8080
[16:49:53] INFO: dokumentasi API: http://0.0.0.0:8080/docs
[16:49:53] INFO: tersambung ke broker mqtt://127.0.0.1:1883 sebagai backend
```

Ada satu baris `Server listening at …` untuk **setiap** alamat laptop; yang penting ada `127.0.0.1` dan IP WiFi-mu. `0.0.0.0` di baris `dokumentasi API:` hanya tanda semua pintu terbuka, bukan alamat untuk dibuka (`/docs` tetap di `http://localhost:8080/docs`). Garis miring terbalik ganda memang begitu di layar; baris aturan, perangkat, Telegram, dan broker mengikuti database dan `.env`-mu. Di laptop penulis, backend menjawab lewat IP ±4 detik sesudah berkas disimpan.

> [!WARNING]
> **Jangan menulis `HOST=192.168.1.10`.** Backend lalu **hanya** mendengar di alamat WiFi. Di laptop penulis, `localhost:8080` langsung ditolak (`ECONNREFUSED`), dan dashboard di `http://localhost:5173` menampilkan kotak `Tidak bisa menghubungi server di http://localhost:8080. Mungkin backend …`.

3. **Di frontend, tidak ada alamat yang perlu diubah.** Rumus `BASE` di `api.ts` (Modul 22): kalau `VITE_API_BASE` kosong, alamat API = nama host halaman + `:8080`. Halaman `http://192.168.1.10:5173` di HP otomatis memanggil `http://192.168.1.10:8080`, dan `socket` memakai `BASE` yang sama ([1.4](#14-satu-soket-untuk-seluruh-aplikasi-srcsoketts-10-menit)). Jebakannya satu: kalau `frontend/.env.local`-mu berisi baris `VITE_API_BASE=…` yang aktif, beri `#` di depannya; kalau tidak, HP memanggil `localhost:8080`, yaitu dirinya sendiri. Supaya tidak lupa, tambahkan dua baris ini di `frontend/.env.example`, tepat di atas baris terakhirnya (`# VITE_API_BASE=http://localhost:8080`):

   ```text
   # Modul 23: membuka dashboard dari HP (npm run dev:hp)? Biarkan baris di bawah tetap diberi #: halaman
   # http://<IP-laptop>:5173 di HP otomatis memanggil API http://<IP-laptop>:8080, dan sambungan live ikut alamat itu.
   ```

   Berkas utuhnya: buka [`kode/tahap/praktik-9/frontend/.env.example`](kode/tahap/praktik-9/frontend/.env.example) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `.env.example`-mu.

#### 9.3 Vite mode HP: `npm run dev:hp` dan *firewall* Private (10 menit)

Bawaan Vite hanya melayani `localhost`, dan sengaja dibiarkan: `vite.config.ts` **tidak** diubah, jadi `npm run dev` tetap mode laptop. Untuk mode HP kita tambahkan perintah bernama `dev:hp` = Vite dengan `--host` (dengarkan di semua alamat), supaya tidak salah ketik `npm run dev -- --host`.

1. Di **terminal Vite**, tekan **Ctrl + C**.
2. Di terminal yang sama, jalankan satu per satu:

   ```text
   npm pkg set scripts.dev:hp="vite --host"
   npm run dev:hp
   ```

   `npm pkg set` diam saja; ia menulis `"dev:hp": "vite --host"` di ujung bagian `scripts` di `package.json`.

**Hasilnya (contoh):**

```text
> rumah-pintar-mini-frontend@0.1.0 dev:hp
> vite --host


  VITE v8.3.5  ready in 855 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://172.x.x.x:5173/  vEthernet (WSL (Hyp…
  ➜  Network: http://192.168.x.x:5173/  Ethernet 3
  ➜  Network: http://192.168.x.x:5173/  Ethernet 4
  ➜  Network: http://192.168.1.10:5173/  Wi-Fi
  ➜  press h + enter to show help
```

Vite 8 menulis nama adaptor di ujung baris `Network:`. Pakai baris berakhiran **`Wi-Fi`**: IP-nya harus sama dengan 9.1 dan dengan IP di `CORS_ORIGIN`. Laptopmu tetap memakai `http://localhost:5173`.

3. **Windows: jendela izin *firewall*.** Sejak backend dimulai ulang di 9.2, Windows bisa memunculkan jendela **Windows Security** untuk **Node.js JavaScript Runtime**. Izinkan **hanya Private**, dan pastikan profil WiFi rumahmu **Private network**, persis seperti [Modul 10 Praktik 7.2](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#72-nyalakan-penerima-di-laptop) langkah 3–5 (di sana juga cara membuka blokir kalau dulu kamu memilih **Cancel**). Izinnya untuk program Node.js, jadi berlaku untuk Vite dan backend sekaligus. **macOS:** kalau ditanya soal `node`, pilih **Allow**.

> [!NOTE]
> **Langkah *firewall* ini tidak diuji penulis.** Setelan *firewall* laptop penulis sengaja tidak disentuh (profil WiFi-nya *Public*), dan tidak ada jendela izin yang dijawab; laptop yang membuka IP-nya sendiri tidak melewati izin itu. Kalau HP-mu tidak bisa membuka halaman di 9.4, *firewall* adalah tersangka pertama.

#### 9.4 Buka dari HP: `/health` dulu, lalu masuk dengan akun viewer (10 menit)

Pastikan HP di WiFi rumah yang sama (bukan WiFi tamu), dan VPN di HP maupun laptop mati.

1. **Uji jalannya dulu.** Di browser HP, buka `http://192.168.1.10:8080/health` (rute tanpa *login*).

   **Hasilnya (contoh, dibuka penulis dari browser laptop lewat IP WiFi, bukan dari HP):**

   ```text
   {"ok":true,"broker":true,"database":true,"diterima":10,"ditolak":0,"diabaikan":1}
   ```

   Angkamu berbeda. Kalau halaman berputar lalu gagal, masalahnya di jaringan (IP, WiFi tamu, *firewall*, VPN): lihat [🚨](#-kalau-tidak-jalan) *HP tidak bisa membuka dashboard lewat alamat IP laptop*. Jangan lanjut sebelum langkah ini berhasil.
2. **Buka dashboard** di `http://192.168.1.10:5173`. Formulir *login* muncul: *cookie* disimpan per browser dan per nama host, jadi browser HP belum punya. Di laptop penulis pun, membuka alamat IP sesudah masuk di `localhost` memunculkan formulir *login*, karena `localhost` dan `192.168.1.10` dua nama berbeda ([Modul 22 Konsep 9](../modul-22-react-dasar/README.md#9-login-dari-browser-cookie-cors-dan-localhost)).
3. **Masuk dengan akun viewer** (`viewer@rumah.test`). Di HP kamu hanya melihat (tombol kendali baru di Modul 24), jadi hak sekecil mungkin cukup.

**Hasilnya (contoh, di laptop penulis lewat IP):** lencana **Live**, dan di detail **Latihan ruang tamu** tulisan `diperbarui pukul … WIB` maju tiap ±10 detik (`16.50.30` → `16.50.40 WIB`). *Cookie* `akses` dan `sesi` untuk alamat IP tetap **HttpOnly** dan **SameSite=Strict**: `:5173` dan `:8080` di IP yang sama terhitung satu situs, seperti `localhost`. Di terminal `backend`:

```text
[16:50:31] INFO: login: akun 2 (viewer), sesi 21, IP 192.168.1.10
[16:50:31] INFO: klien realtime tersambung: S4c3T03fexbGO0kmAAAB (akun 2, viewer)
```

lalu tiga baris `klien … mengikuti …` dan `GET /devices/…/readings?from=…Z -> 200` saat detail dibuka. Penulis membukanya dari laptop, jadi `IP` di baris *login* = IP laptop; dari HP, tertulis alamat HP-mu, bukti bahwa HP-lah yang masuk.

Kotak `Tidak bisa menghubungi server di http://192.168.1.10:8080. …` atau lencana yang tertahan di `Menyambung ulang…` → periksa `CORS_ORIGIN` (di laptop penulis, IP yang dicabut dari `CORS_ORIGIN` menimbulkan persis kedua gejala itu). Kotak yang menyebut `http://localhost:8080` → `VITE_API_BASE` masih aktif. Obatnya di [🚨](#-kalau-tidak-jalan) *Dashboard terbuka di HP, tetapi login gagal atau soket terus `xhr poll error`*.

#### 9.5 ⭐ Syarat lulus pertama di HP: rekam grafiknya berubah (15 menit)

Syaratnya: menutup LDR membuat grafik **di HP** berubah dalam **< 1 interval kirim + 1 detik**. Node 1 mengirim tiap 10 detik, jadi batas kerasnya **< 11 detik**; berkat *report-by-exception* Modul 11, biasanya ≈ 1–2 detik. Kamu sudah mengujinya di laptop di [4.4](#44--garisnya-bergerak-sendiri-suhu-33-lampu-atau-ldr-10-menit); kini ulangi di HP sambil **merekam video** dengan kamera kedua yang melihat layar HP dan pemicunya sekaligus. Pada 30 bingkai per detik, video teliti sampai ±0,03 detik.

Di HP, buka detail **Node 1 ruang tamu** (jalur laptop: **Latihan ruang tamu**), dengan layar tetap menyala dan tab dashboard di depan.

- **Jalur perangkat:** pilih **Cahaya** di grafik *live*. Pastikan ruangan terang (atau sorot LDR dengan senter): kiriman segera hanya terjadi saat `cahaya` **melintasi** batas 1000. Mulai merekam, tutup LDR dengan tangan ±5 detik, lalu buka lagi. Harapannya, garis **Cahaya** turun ≈ 1–2 detik sesudah LDR tertutup. Penulis tidak punya rekaman Kit sungguhan untuk langkah ini.
- **Jalur laptop** (simulator tanpa LDR), dua uji [4.4](#44--garisnya-bergerak-sendiri-suhu-33-lampu-atau-ldr-10-menit): (1) mulai merekam, ketik `suhu 33` di terminal simulator, tekan **Enter**: garis **Suhu** di HP naik ke 33 pada kiriman berikutnya (di laptop penulis, kartunya berubah 3,9–4,9 detik sesudah **Enter**); (2) kirim perintah nyalakan lampu dari Bruno (akun admin, `f00d00000001`), lalu matikan lagi: titik baru muncul di luar jadwal 10 detik dan kartu **Lampu** berubah (di laptop penulis, < 0,1 detik sesudah perintah dikirim). Uji kedua membuktikan pipa kiriman segera, bukan sensor cahaya.

Putar videonya pelan-pelan, lalu catat selisih detik pemicu dan detik titik baru di catatan belajarmu.

**Kamu lulus langkah ⭐ ini** kalau videomu memperlihatkan layar HP berlencana **Live** dengan **Cahaya** berubah kurang dari 11 detik sesudah LDR ditutup (biasanya ≈ 1–2 detik), atau di jalur laptop **Suhu** naik ke 33 kurang dari 11 detik sesudah **Enter** dan titik baru muncul begitu perintah lampu dikirim. Simpan videonya: bukti syarat lulus sekaligus video demo dashboard-mu. Memakai tablet, laptop kedua, atau mode perangkat? Catat dengan jujur di ✅.

#### 9.6 Mode gelap di HP dan HP yang tertidur (10 menit)

**Mode gelap.** Dashboard mengikuti setelan sistem (Konsep 10). Nyalakan tema gelap di setelan tampilan HP-mu (namanya beda-beda per merek), lalu kembali ke browser. Seharusnya latar dan kartu menggelap, garis bantu grafik meredup, dan lencana serta tepi kiri hijau/merah kartu Daftar tetap terbaca, seperti gambar di [5.3](#53-mode-gelap-kelas-dark-dan-warna-grafik-20-menit), yang dibuat penulis dengan emulasi DevTools, bukan HP sungguhan. Ada yang tidak terbaca? Lihat 🚨 *Mode gelap: garis atau tulisan grafik hitam di latar gelap*.

**HP yang tertidur.** Di detail perangkat, kunci layar HP ±1 menit, lalu buka lagi. Browser HP boleh menunda atau memutus sambungan halaman yang tidak tampil. Pemulihan sambungan sudah diuji penulis di laptop (backend dimulai ulang, gelang 15 menit habis), belum dengan HP yang tertidur, jadi inilah yang **seharusnya** terjadi:

- Kalau sambungan sempat putus, lencana menjadi `Menyambung ulang…`, lalu **Live** lagi tanpa memuat ulang. Dashboard mengirim `ikuti` lagi dan mengisi ulang jendela 5 menit dari database, jadi bacaan selama layar mati tetap muncul di grafik.
- Tidur lebih dari 15 menit? Gelang `akses` sudah habis: dashboard memperbaruinya dengan kartu terusan `sesi`, lalu menyambung lagi (Konsep 2).
- Status yang berubah **selama** sambungan putus tidak dikirim ulang (🔬 *Dua batasan v0.2*): kalau kartu tampak salah, buka Daftar Perangkat lagi atau muat ulang halaman. Lencana tertahan di `Menyambung ulang…`? Lihat [🚨](#-kalau-tidak-jalan) *Di HP, lencana tetap `Menyambung ulang…` sesudah layar dikunci*.

**Simpan ke cabang.** Di **terminal kosong** (folder `frontend`, cabang `fitur/dashboard-live`), `git status` seharusnya hanya menyebut `.env.example` dan `package.json` sebagai `modified:` (`backend/.env` diabaikan Git).

```text
git add package.json .env.example
git commit -m "Mode HP: skrip dev:hp dan catatan VITE_API_BASE (Modul 23 Praktik 9)"
```

> ⬆️ **Selesai Praktik 9?** Biarkan mode HP menyala dulu: [Praktik 10](#praktik-10--uji-kelulusan-lint-build-gladi-bersih-dan-mode-laptop-35-menit) memakainya untuk gladi, lalu mengembalikan mode laptop di [10.4](#104-kembalikan-mode-laptop-5-menit). Kalau berhenti dulu sebelum Praktik 10, kembalikan mode laptop sekarang lewat [10.4](#104-kembalikan-mode-laptop-5-menit) dan nyalakan lagi mode HP (9.2–9.3) saat melanjutkan.

### Praktik 10 — Uji kelulusan: *lint*, *build*, gladi bersih, dan mode laptop (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal seperti di Praktik 9: terminal `backend` (backend v1.0, masih mode HP), **terminal Vite** di folder `frontend` (mula-mula `npm run dev:hp`, lalu *build*, versi, `preview`, dan `npm run dev`), serta **terminal kosong** di folder `frontend` untuk `npm run lint` dan Git. Jalur laptop menambah terminal broker (`edge`), simulator (`alat`), dan **Bruno** dengan akun admin. Lalu **Docker Desktop** (`rumahpintar-db` menyala), **Chrome atau Edge** dengan DevTools, dan **HP** di WiFi rumah yang sama (tanpa HP: mode perangkat DevTools). Konsep yang dipakai: semua (gladi).
>
> ⭐ **Wajib** — langkah 10.3: gladi bersih kedua syarat lulus Silabus dalam sekali jalan, pada hasil *build*: grafik di HP berubah < 11 detik sesudah LDR ditutup (jalur laptop: sesudah perintah lampu dari Bruno), dan riwayat 7 hari termuat < 1 detik.

Praktik terakhir ini tidak menambah fitur. Kamu memeriksa dashboard seperti penguji: oxlint dan `npm run build` (10.1), versi **0.2.0** (10.2), kedua syarat lulus pada **hidangan siap saji**, bukan di dapur (10.3), lalu laptop dikembalikan ke keadaan aman (10.4).

#### 10.1 `npm run lint` bersih, `npm run build` lolos dengan satu peringatan (10 menit)

Biarkan semuanya menyala. Di **terminal kosong** (folder `frontend`), jalankan:

```text
npm run lint
```

**Hasilnya (contoh):**

```text
> rumah-pintar-mini-frontend@0.1.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 72ms on 22 files with 116 rules using 8 threads.
```

**Bersih** berarti `0 warnings and 0 errors`; durasi dan *thread* mengikuti laptopmu; 22 berkas = `vite.config.ts` + 21 `.ts`/`.tsx` di `src`. Kalau ada temuan, cocokkan berkas yang ditunjuk dengan [`kode/tahap/praktik-10/frontend/`](kode/tahap/praktik-10/frontend/), lalu ulangi sampai tanpa galat **dan** tanpa peringatan.

Lalu hentikan `npm run dev:hp` di **terminal Vite** (**Ctrl + C**; port 5173 dipakai hidangan di 10.3), dan masak hidangannya:

```text
npm run build
```

**Hasilnya (contoh):**

```text
> rumah-pintar-mini-frontend@0.1.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
✓ 1465 modules transformed.
computing gzip size...
dist/index.html                   0.54 kB │ gzip:   0.35 kB
dist/assets/index-DlK0XE9R.css   19.67 kB │ gzip:   4.75 kB
dist/assets/index-dAX8TLJA.js   684.74 kB │ gzip: 202.77 kB

✓ built in 561ms
[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

Baca dari atas:

- **`tsc -b`** diam: tidak ada galat tipe.
- **`✓ built in …`**: hidangan di `dist/` sudah jadi. Blok kuning sesudahnya, mulai `[plugin …]`, adalah **peringatan**, bukan galat; *build* yang gagal tidak pernah sampai ke `✓ built in`.
- **Isinya:** berkas `index-….js` (684.74 kB) melewati batas 500 kB yang dipakai Vite untuk mengingatkan. Penyebab utamanya Recharts: di tahap kode, berkas ini ±291 kB di akhir Praktik 3, lalu ±640 kB di akhir Praktik 4 saat grafik pertama masuk (v0.1: 230.82 kB).
- **Sarannya:** memecah kode dengan `import()` dibedah di [🔬](#-bedah-teknis-opsional) (*Memecah bundel dengan `React.lazy`*); menaikkan `chunkSizeWarningLimit` hanya membungkam peringatan, berkasnya tetap besar, jadi **jangan**.

Modul ini sengaja membiarkannya agar kode tetap sederhana; syarat "riwayat 7 hari < 1 detik" di 10.3 pun diukur pada hidangan ini. Patokan minggu ini: ***build* lolos dengan satu peringatan ukuran yang sudah dijelaskan**; peringatan lain atau galat berarti ada yang salah ([🚨](#-kalau-tidak-jalan), *`npm run build` menulis `Some chunks…`*). Templat *pull request* mendapat butir yang sama di [➕ C](#c-tambahkan-butir-modul-23-ke-templat-pull-request). Nama berkas, ukuran, dan lamanya bisa berbeda di laptopmu.

#### 10.2 Dashboard v0.2.0: versi baru (5 menit)

Silabus menamai hasil minggu ini **dashboard v0.2 (live)**. Nama paketnya sudah `rumah-pintar-mini-frontend` sejak Modul 22, jadi kali ini cukup versinya. Di terminal Vite, jalankan satu per satu:

```text
npm pkg set version=0.2.0
npm install
```

`npm pkg set` tidak mencetak apa pun kalau berhasil. `npm install` wajib sesudahnya, karena `npm pkg set` tidak menyentuh `package-lock.json` (Modul 22 Praktik 8.3).

**Hasilnya (contoh):**

```text
up to date, audited 95 packages in 4s

14 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

`up to date`: tidak ada paket yang dipasang atau dibuang. Di `package.json` hanya baris `"version": "0.2.0"` yang berubah, di `package-lock.json` dua baris versi.

Jalankan `npm run build` sekali lagi. Baris pertamanya kini `> rumah-pintar-mini-frontend@0.2.0 build`; sisanya sama, termasuk nama berkas dan peringatan 500 kB, karena versi tidak ikut dimasak.

#### 10.3 ⭐ Gladi bersih kedua syarat lulus (15 menit)

Syarat lulus Silabus: **menutup LDR dengan tangan membuat grafik di HP berubah dalam < 1 interval kirim + 1 detik (dengan *report-by-exception* Modul 11: ≈ 1–2 detik), dan riwayat 7 hari termuat < 1 detik.** Langkah [4.4](#44--garisnya-bergerak-sendiri-suhu-33-lampu-atau-ldr-10-menit), [7.4](#74--riwayat-7-hari-termuat-kurang-dari-1-detik-10-menit), dan [9.5](#95--syarat-lulus-pertama-di-hp-rekam-grafiknya-berubah-15-menit) membuktikannya sepotong-sepotong; kini keduanya diuji dalam sekali jalan, di HP, pada hidangan dari `npm run build`. Kalau satu langkah gagal, betulkan, lalu ulangi dari awal.

> [!NOTE]
> Penulis mengukur syarat kedua pada `npm run preview` di laptop (Edge); gladi di HP sungguhan belum dicoba penulis. Tidak punya HP? Jalankan langkah yang sama di laptop lewat `http://<IP-laptop>:5173` dengan mode perangkat DevTools selebar 375 px ([Modul 22 Praktik 7.1](../modul-22-react-dasar/README.md#71-mode-perangkat-devtools-dashboard-di-375-768-dan-1280-px-8-menit)); ✅ Checklist mencatat jalur ini.

**Persiapan.**

1. Backend masih mode HP dari 9.2 (`HOST=0.0.0.0`, IP laptop di `CORS_ORIGIN`), dan sumber datanya menyala: Node 1 dan Node 2 (jalur perangkat), atau broker berkunci dan simulator `f00d00000001` (jalur laptop).
2. Di terminal Vite, sajikan hidangannya ke WiFi rumah:

```text
npm run preview -- --host
```

`--` meneruskan `--host` ke `vite preview` (seperti `dev:hp` untuk dapur). Baris `Network: use --host to expose` dari Modul 22 kini berganti menjadi satu baris per adaptor jaringan; pakai yang berakhiran `Wi-Fi`, misalnya `➜  Network: http://192.168.1.10:5173/  Wi-Fi` (IP-mu dari 9.1).

3. Di HP, buka `http://192.168.1.10:5173` (pakai IP-mu). Kalau langsung tampil **Daftar Perangkat**, klik **Keluar** dulu: gladi dimulai dari formulir *login*. Masuk dengan akun **viewer**; lencana **Live** harus menyala.

**Syarat A: grafik di HP berubah < 11 detik.**

4. Buka detail Node 1 (jalur laptop: **Latihan ruang tamu**, `f00d00000001`), lalu nyalakan perekam video seperti di 9.5.
5. **Jalur perangkat:** pilih **Cahaya** di pemilih grafik, lalu tutup LDR dengan tangan (di ruangan terang). **Jalur laptop:** di Bruno, kirim **`login admin`** lalu **`nyalakan lampu`** ke `f00d00000001`; kartu **Lampu** `Nyala`, titik baru muncul. Lalu ketik `suhu 33` di terminal simulator (masih 33 dari 9.5? `suhu acak` dulu, tunggu satu kiriman): garis **Suhu** naik pada kiriman berikutnya.
6. Putar videonya, lalu ukur jarak dari tangan menutup LDR (jalur laptop: dari permintaan Bruno dikirim) sampai grafik berubah.

**Syarat B: riwayat 7 hari < 1 detik.**

7. Klik **Riwayat →**; rentang **7 hari** langsung terpilih. Baca teks kecil di atas grafik, lalu klik **← Kembali ke detail** dan ulangi sampai tiga kali. Catat yang terlama.

**Hasilnya (contoh, `npm run preview` di laptop penulis):**

```text
Rata-rata per jam, 7 hari terakhir (titik = awal tiap jam) · 169 titik · dimuat dalam 90 ms
```

Tiga kali buka: 90, 40, dan 51 ms, jauh di bawah 1.000 ms. Log backend mencatat **satu** baris per buka, misalnya `[16:57:20] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (47 ms)`: hidangan tanpa guncangan `StrictMode`, beda dengan dua baris di dapur (7.4). Di HP tidak ada tab **Network**; karena itulah teks "dimuat dalam" ikut kode v0.2.

**Kamu lulus langkah ⭐ ini** kalau, dalam sekali jalan pada hasil `npm run build` yang disajikan `npm run preview -- --host`: (1) *login* viewer di HP membawamu ke **Daftar Perangkat** dengan lencana **Live**; (2) videonya memperlihatkan grafik di HP berubah < 11 detik (biasanya ≈ 1–2 detik) sesudah LDR ditutup (jalur laptop: sesudah perintah lampu dikirim; jalur ini menguji pipa kiriman segera, bukan sensor cahaya); dan (3) riwayat 7 hari menulis `dimuat dalam` di bawah 1.000 ms pada ketiga percobaan. Itulah syarat lulus Modul 23.

#### 10.4 Kembalikan mode laptop (5 menit)

Mode HP membuka backend dan dashboard ke semua perangkat di WiFi. Matikan begitu sesi selesai, dan selalu sebelum laptop dibawa ke jaringan lain (aturan aman butir 4).

1. Di `backend/.env`, kembalikan `HOST` dan hapus alamat IP yang kamu tambahkan ke `CORS_ORIGIN` di 9.2, lalu simpan:

```text
HOST=127.0.0.1
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Backend memulai ulang sendiri; log barunya hanya menulis satu `Server listening at http://127.0.0.1:8080`, tanpa alamat WiFi.

2. Di terminal Vite, hentikan hidangan (**Ctrl + C**), lalu jalankan `npm run dev`. Baris `➜  Network: use --host to expose` muncul lagi.
3. Muat ulang `http://192.168.1.10:5173` di HP: halamannya tidak bisa dibuka lagi (dari laptop, alamat itu ditolak dengan `ERR_CONNECTION_REFUSED`). `http://localhost:5173` di laptop tetap **Live**.

**Simpan ke cabang.** Di terminal kosong (folder `frontend`, cabang `fitur/dashboard-live`), `git status` hanya menunjukkan `package.json` dan `package-lock.json` sebagai `modified:`; `backend/.env` dan `dist/` tidak ikut Git. Kalau `public/coba-live.html` atau folder `src/uji/` masih tampil, hapus dulu. Simpan:

```text
git add package.json package-lock.json
git commit -m "Dashboard v0.2.0: lint bersih, build lolos dengan satu peringatan ukuran (Modul 23 Praktik 10)"
```

Kode Modul 23 kini lengkap di cabang `fitur/dashboard-live`; bedanya dengan [`kode/frontend/`](kode/frontend/) tinggal `README.md` (➕ B). `git push` menunggu ➕ D.

> ⬆️ **Selesai Praktik 10?** Dashboard v0.2.0-mu bersih, lolos *build*, lulus gladi, dan laptopmu kembali ke mode laptop. Lanjut ke [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini) untuk README, templat *pull request*, dan *pull request* "dashboard v0.2 (live)"; [🧩 Tantangan mandiri](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip dengan masalahmu. Masalah Vite, Tailwind, dan *login* dasar ada di [🚨 Modul 22](../modul-22-react-dasar/README.md#-kalau-tidak-jalan); masalah backend, database, broker, dan simulator ada di 🚨 Modul 16–21. Sebelumnya, lirik lima tempat ini:

1. **Lencana koneksi** di samping judul dashboard: `Live`, `Menyambung ulang…`, atau `Terputus`?
2. **Terminal backend**: masih menyala, dan setiap *login* menulis satu `klien realtime tersambung: …`, lalu (sejak Praktik 2) `… mengikuti <device_id>` per perangkat?
3. **Terminal `frontend`**: Vite menyala (`npm run dev`, atau `npm run dev:hp` di mode HP)?
4. **Tab Console** (**F12**): baris merah teratas biasanya menyebut penyebabnya.
5. **Tab Network**, saringan **Socket** (di versi lama **WS**): klik baris `socket.io/?EIO=4…`, lalu **Messages**. Sejak Praktik 2: ada `42["telemetry", …]` tiap ±10 detik?

Masih buntu? Bandingkan berkasmu dengan [`kode/tahap/`](kode/tahap/) di akhir praktik yang sama.

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (socket.io-client 4.8.4, Zustand 5.0.16, Recharts 3.10.1, date-fns 4.4.0)</b></summary>

Tutorial internet untuk versi lama bisa gagal, atau diam-diam merusak, di proyek kita. Ganti kolom kiri dengan kolom tengah:

| Petunjuk lama | Yang benar untuk versi kita | Kenapa |
| :--- | :--- | :--- |
| `socket.io-client` 2.x, `io.connect(url)` | `io(BASE, { withCredentials: true, autoConnect: false })` dari `socket.io-client@4.8.4` | Klien v1/v2 ditolak server v4 (`Unsupported protocol version`); tanpa `withCredentials`: `belum login` (Konsep 2) |
| `npm install @types/socket.io-client` | Tidak perlu | Tipe sudah ikut paket; paket lama itu bisa menimbulkan galat |
| Token di `query`, `auth`, atau `localStorage` | *Cookie* `HttpOnly` yang sama dengan `fetch` | XSS (Modul 20); `withCredentials` membawanya |
| `transports: ["websocket"]` | Bawaan: *polling* dulu, lalu naik ke WebSocket | Penjelasannya di 🔬 |
| `socket.emit("ikuti", id)` tanpa jawaban | `socket.timeout(5000).emitWithAck("ikuti", id)` | Tanpa *ack*, server diam-diam tidak memasukkanmu ke *room* |
| `setInterval(() => fetch(…), 5000)` | Acara Socket.IO; `setInterval` hanya untuk jam (`useSekarang`) | Itu *polling* (Konsep 1 dan 6) |
| Redux + `connect()`, atau Context untuk data *live* | Zustand + selektor | Konsep 4; perbandingannya di 🔬 |
| `import create from "zustand"` | `import { create } from "zustand"` | Zustand 5 tidak punya *default export* |
| `create((set) => …)` | `create<Toko>()((set) => …)` | Kurung ganda = cara TypeScript di Zustand 5 |
| `useToko()` utuh, `?? []` di selektor | `useToko((s) => s.koneksi)`, `?? KOSONG` | Gambar ulang sia-sia; layar putih |
| moment.js, `format(tanggal, "HH:mm")` | `jamWib()` (`Intl`, `timeZone: "Asia/Jakarta"`); date-fns 4 untuk jam relatif | Tanpa zona, jam ikut setelan laptop/HP |
| `<ResponsiveContainer>` | `responsive` + `style={{ width: "100%", height: 240 }}` | Recharts 3.3+ |
| `activeIndex`, `TooltipProps` | `activeIndex` dihapus; *tooltip* kustom memakai `TooltipContentProps` | Recharts 3 |
| `darkMode: 'class'` di `tailwind.config.js` | Kelas `dark:` langsung (ikut setelan sistem) | Tailwind v4; tombol tema di 🔬 |
| `` stroke={`var(--color-${warna}-500)`} `` | `stroke="var(--color-sky-500)"` (nama utuh) | Tailwind hanya mencetak variabel yang tertulis utuh |
| `host: true` di `vite.config.ts` | `npm run dev:hp` hanya saat perlu | Aturan aman (Konsep 12) |

</details>

<details>
<summary><b>Soket ditolak dengan <code>belum login</code>, padahal daftar perangkat tampil</b></summary>

**Gejala:** daftar perangkat tampil (jadi `fetch` sudah membawa *cookie*), tetapi lencana `Menyambung ulang…`, lalu `Terputus`, dan angka diam. Di **Network**, jawaban baris `socket.io/?EIO=4&transport=polling…` berisi `44{"message":"belum login"}`. Di `coba-live.html` (Kemenangan Cepat), `Belum tersambung: belum login` berarti belum masuk di dashboard.

**Sebab:** jabat tangan Socket.IO menuju port lain (8080), dan browser hanya membawa *cookie* ke sana kalau diminta. Tanpa `withCredentials: true`, penjaga pintu Socket.IO tidak melihat gelang. Dashboard memperbarui gelang lalu mencoba lagi, tetap ditolak, dan sesudah tiga kali berhenti di `Terputus`.

**Langkah:** pastikan `src/soket.ts` menulis persis `io(BASE, { withCredentials: true, autoConnect: false })` ([1.4](#14-satu-soket-untuk-seluruh-aplikasi-srcsoketts-10-menit)), simpan, lalu **F5**.

</details>

<details>
<summary><b><code>xhr poll error</code> berulang, atau pesan CORS merah di tab Console</b></summary>

**Gejala:** lencana tertahan di `Menyambung ulang…` dan tidak pernah `Terputus`, karena Socket.IO terus mencoba sendiri. Kode yang mencetak pesan `connect_error` (seperti `coba-live.html`) menulis `xhr poll error`. Bedanya terlihat di **Console**:

| Baris merah memuat… | Artinya → langkah |
| :--- | :--- |
| `net::ERR_CONNECTION_REFUSED` | Backend mati → lihat terminal backend. Begitu backend hidup, lencana kembali `Live` sendiri. |
| `has been blocked by CORS policy` + `from origin 'http://…'` | Asal halaman tidak ada di `CORS_ORIGIN` → buka `http://localhost:5173`; di mode HP, tambahkan `http://<IP-laptop>:5173` ([9.2](#92-backend-mode-hp-host-dan-cors_origin-10-menit)) lalu **F5**. |

Firefox menulis pesan CORS dengan kata lain (`CORS header 'Access-Control-Allow-Origin' missing`); artinya sama. Saat dimuat ulang, kotak merah `Tidak bisa menghubungi server di …` biasanya ikut muncul. Jangan menulis `CORS_ORIGIN=*` (alasannya di 🚨 Modul 22).

</details>

<details>
<summary><b>Setiap bacaan tampil dua kali, atau makin sering setiap pindah layar</b></summary>

**Gejala:** `console.log` di pendengarmu tercetak dua kali (atau bertambah setiap pindah layar), atau log backend menulis `klien realtime tersambung` lebih dari sekali untuk satu *login*. Yang benar (dicoba penulis, juga dengan StrictMode): satu sambungan per *login*.

**Sebab dan langkah:**

1. **`io(…)` ditulis di dalam komponen atau efek**, jadi setiap pemasangan membuat soket baru. Buat satu `socket` saja di `src/soket.ts`, di luar komponen ([1.4](#14-satu-soket-untuk-seluruh-aplikasi-srcsoketts-10-menit)).
2. **`socket.on` tanpa `socket.off` di *cleanup***, sehingga pendengar menumpuk (ingat 🔁 Langkah 3: `pendengar telemetry sekarang: 2`). Lepas dengan fungsi bernama yang sama: `socket.off("telemetry", onTelemetry)`. `socket.off("telemetry")` tanpa fungsi melepas **semua** pendengar acara itu, termasuk milik bagian lain.
3. **`sesiHabis` di `App.tsx` tanpa `useCallback`.** Setiap kali App digambar ulang, efek sambungan diulang: log backend menulis `terputus` lalu `tersambung` setiap kamu pindah layar.

</details>

<details>
<summary><b>Lencana <code>Live</code>, tetapi angkanya diam</b></summary>

Periksa berurutan:

1. **Pengirimnya memang diam.** Simulator berhenti (kartunya `Offline`), Node 2 hanya mengirim tiap 5 menit, dan perangkat `kunci dicabut` atau `belum terdaftar` sengaja tidak diikuti (kartunya menulis `kiriman diabaikan backend`). Uji dengan `suhu 33` di terminal simulator: kartu berubah pada kiriman berikutnya, 0–10 detik (penulis: 3,9–4,9 detik).
2. **`ikuti` tanpa jawaban (*ack*).** Server diam-diam mengabaikannya, jadi log backend tidak menulis `mengikuti`. Pakai `emitWithAck` ([2.2](#22-pendengar-telemetry-dan-status-di-userealtime-15-menit)).
3. **`ikuti` tidak diulang sesudah tersambung lagi.** *Room* hilang setiap sambungan putus, jadi angka berhenti sesudah lencana sempat `Menyambung ulang…`. `ikutiSemua()` harus dipanggil di `onConnect`.
4. **Kartu tidak membaca toko.** Detail membaca `useToko((s) => s.terbaru[id])`, bukan *state* sisa Modul 22 ([2.4](#24-detail-perangkat-membaca-dari-toko-5-menit)).

</details>

<details>
<summary><b>Lencana <code>Menyambung ulang…</code> sesudah backend dihentikan, atau sekitar 15 menit sekali</b></summary>

**Sesudah backend dihentikan: wajar.** Selama backend mati, Socket.IO terus mencoba sendiri (Console: `net::ERR_CONNECTION_REFUSED`). Nyalakan lagi backend: lencana kembali `Live` tanpa **F5**, beberapa sampai belasan detik sesudah `Server listening at …` (penulis: 4,0 dan 16,4 detik). Di Windows, **Ctrl + C** pada `npm run dev` **kadang** mematikan backend mendadak (tanpa log berhenti; Socket.IO menyambung sendiri), **kadang** backend sempat berhenti rapi (`SIGINT diterima: backend berhenti dengan rapi`; dashboard mencoba memperbarui gelang dulu, lalu tetap menyambung lagi). Pada `npm start`, **Ctrl + C** selalu berhenti rapi. Keduanya pulih sendiri. Menyimpan berkas backend (`--watch`) juga begitu: `Live` lagi ±3 detik. Penulis hanya menguji Windows.

**Sekitar 15 menit sekali: juga wajar.** Gelang habis, server memutus soket, lalu dashboard menukar kartu terusan dengan gelang baru (satu `POST /auth/refresh -> 200`) dan tersambung lagi di detik yang sama. Lencananya hanya berkedip.

**Tertahan, padahal backend menyala?** Lihat masalah `xhr poll error` di atas.

</details>

<details>
<summary><b>Lencana <code>Terputus</code> dan dashboard tidak menyambung lagi sendiri</b></summary>

**Sebab:** selain sesudah **Keluar**, `Terputus` hanya muncul kalau soket ditolak penjaga pintu **lebih dari 3 kali berturut-turut**, walau gelang sudah diperbarui. Dashboard sengaja berhenti supaya tidak berputar tanpa akhir; v0.2 belum punya tombol "coba lagi". Dua penyebab yang dicoba penulis:

- **Database mati saat gelang harus diperbarui.** `POST /auth/refresh -> 500` berulang, lalu `Terputus`; dashboard tetap tampil.
- **Soket tidak membawa *cookie*** (masalah `belum login` di atas).

**Langkah:** bereskan sebabnya, lalu muat ulang halaman (**F5**). Penulis: sesudah database siap, F5 langsung `Live` tanpa *login*. Kembali `Terputus` dalam sedetik? Tab **Network** memperlihatkan alasannya (`44{"message":…}`).

</details>

<details>
<summary><b>Dimuat ulang saat database baru menyala: kembali ke formulir <i>login</i> tanpa pesan</b></summary>

**Gejala:** kontainer `rumahpintar-db` baru dinyalakan lagi, kamu menekan **F5**, lalu muncul formulir *login* tanpa pesan, padahal kamu belum **Keluar**.

**Sebab:** beberapa detik sesudah `docker start`, database masih bersiap (log backend: `the database system is starting up`), jadi *refresh* dijawab 500. Jalur `minta()` Modul 22 menganggapnya "belum login". Kartu terusanmu tidak terhapus.

**Langkah:** tunggu sampai `http://localhost:8080/health` menulis `"database":true`, baru **F5**. Sudah terlanjur di formulir? Tunggu siap, lalu **F5**: kamu masuk lagi tanpa sandi (dicoba penulis).

**Keluar saat database tidak menjawab** dibalas `POST /auth/logout -> 500` (penulis menunggu ±5 detik). Layarmu tetap kembali ke formulir, tetapi sesinya belum terhapus, jadi tab lain **tidak** ikut keluar. Sesudah database siap, muat ulang tab itu dan klik **Keluar** lagi.

</details>

<details>
<summary><b>Kartu tetap <code>Offline</code> merah, padahal angkanya bergerak</b></summary>

**Sebab:** batasan v0.2. Backend mengirim acara `status` **hanya saat status berubah**. Kalau perubahan itu terjadi tepat saat soket putus (backend dimulai ulang, WiFi HP putus), dashboard melewatkannya, dan v0.2 tidak menanyakan status lagi sesudah tersambung. Penulis mengalaminya: kartu tetap `Offline` merah lebih dari 90 detik walau bacaan baru masuk tiap 10 detik.

**Langkah:** buka satu perangkat lalu kembali ke Daftar (daftarnya diambil segar dari `GET /devices`) atau muat ulang halaman (**F5**): kartunya `Online`. Kebalikannya juga bisa (tetap `Online` padahal perangkat mati), tetapi "terakhir dilihat" dan `· data basi` tetap jujur. Rinciannya di [🔬](#-bedah-teknis-opsional) *Dua batasan v0.2*.

</details>

<details>
<summary><b>Layar putih dengan <code>Maximum update depth exceeded</code> di tab Console</b></summary>

**Gejala:** layar putih (sering tepat saat membuka Detail). Console: `The result of getSnapshot should be cached to avoid an infinite loop`, lalu `Uncaught Error: Maximum update depth exceeded…`.

**Sebab:** selektor mengembalikan larik atau objek **baru** di setiap panggilan, paling sering `useToko((s) => s.jendela[id] ?? [])` untuk perangkat yang belum punya titik. `[]` yang baru tidak pernah "sama" dengan yang lama, jadi Zustand 5 mengira datanya berubah terus, dan React menggambar ulang tanpa henti.

**Langkah:** pakai larik kosong yang selalu sama, `?? KOSONG` dari `src/toko.ts` ([4.1](#41-jendela-geser-di-toko-isi-awal-dari-api-lalu-bacaan-live-15-menit)). Jangan pula merakit objek di selektor (`(s) => ({ a: s.a, b: s.b })`): satu nilai per selektor (Konsep 4).

</details>

<details>
<summary><b>Grafik tidak tampil, atau label jam di bawahnya melompat-lompat</b></summary>

**Kotak grafik kosong tanpa garis bantu:** Recharts tidak menggambar grafik yang tidak punya ukuran. `LineChart` butuh `responsive` **dan** tinggi: `style={{ width: "100%", height: 240 }}` ([4.2](#42-grafiklive-sumbu-waktu-jam-wib-dan-tanpa-animasi-20-menit)). Tulisan `Belum ada bacaan dalam 5 menit terakhir.` atau `Menunggu sambungan live…` bukan galat: pengirimnya diam, atau soket belum `Live`.

**Label melompat** (satu menit hilang, lalu muncul lagi, misalnya `04.49 | 04.50 | 04.51 | 04.52 | 04.54` menjadi `04.49 | 04.50 | 04.51 | 04.53 | 04.54`): `XAxis` tanpa `ticks`, jadi Recharts memilih letak label sendiri setiap detik. Tulis `ticks={ticksTiap(awal, sekarang, MENIT)}`. Penulis mengamatinya 195 detik: label hanya berganti saat menit baru.

</details>

<details>
<summary><b>Jam di layar selisih satu jam atau lebih, atau titik grafik bergeser dari jam sebenarnya</b></summary>

**Selisih tepat 1 atau 2 jam:** kalau kamu di zona WITA/WIT, itu disengaja: dashboard selalu menulis WIB, seperti Modul 22. Kalau kamu di WIB, jamnya dibentuk tanpa zona (`format()` date-fns, `toLocaleTimeString()` tanpa `timeZone`, `getHours()`), sehingga ikut setelan laptop/HP. Pakai `jamWib()` dan `jamMenitWib()` dari `src/waktu.ts` ([3.1](#31-jam-yang-berdetak-dan-jam-relatif-srcwaktuts-15-menit)).

**Titik terbaru terlambat muncul, terpotong di tepi kanan, atau hilang:** sumbu waktu memakai jam **browser**, sedangkan titik memakai jam **perangkat** (`ts`). Kalau jam perangkat lebih cepat, titik baru tersembunyi di tepi kanan sampai jam browser menyusul; kalau tertinggal lebih dari 5 menit, titiknya langsung terbuang. Nyalakan jam otomatis di laptop (Windows: **Settings → Time & language → Date & time → Set time automatically**) dan setelan tanggal & waktu otomatis di HP.

</details>

<details>
<summary><b>Garis lurus menyeberangi celah, atau <i>gauge</i> selalu penuh</b></summary>

**Garis lurus melewati jeda tanpa bacaan:** titik kosong (`null`) tidak disisipkan, atau `connectNulls` ditulis. `GrafikLive` harus memakai `const data = sisipkanCelah(titik, 25 * 1000);` (`GrafikRiwayat` punya fungsi serupa), dan `connectNulls` jangan ditulis (bawaannya `false`). Penulis: simulator dihentikan 40 detik → garisnya putus menjadi dua ruas.

***Gauge* selalu penuh:** tanpa `<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />`, skala busurnya dihitung dari data itu sendiri, jadi 20 % dan 49 % sama-sama penuh (langkah "salah dulu" di [5.1](#51-gauge-salah-dulu-lalu-jujur-15-menit)). Tambahkan baris itu di dalam `RadialBarChart`.

</details>

<details>
<summary><b>Mode gelap: garis atau tulisan grafik hitam di latar gelap</b></summary>

**Sebab:** Recharts menggambar SVG dengan warnanya sendiri dan tidak mengenal kelas `dark:`. Garis hitam atau hilang biasanya berarti nama warnanya dirakit (`` `var(--color-${warna}-500)` ``): Tailwind hanya mencetak variabel yang tertulis utuh, jadi variabel itu tidak ada.

**Langkah** ([5.3](#53-mode-gelap-kelas-dark-dan-warna-grafik-20-menit)): tulis nama utuh (`stroke="var(--color-sky-500)"`); garis bantu, latar *tooltip*, dan lintasan *gauge* memakai `var(--warna-garis)`, `var(--warna-panel)`, dan `var(--warna-lintasan)` dari `src/index.css`; label sumbu `tick={{ fill: "currentColor" }}` di dalam wadah `text-slate-500 dark:text-slate-400`. Tepi hijau/merah kartu Daftar hilang? `dark:border-slate-700` milik kartu menimpanya; ulangi warnanya dengan varian `dark:` (`border-l-green-500 dark:border-l-green-500`).

</details>

<details>
<summary><b>Riwayat 7 hari hanya berisi 2 titik</b></summary>

**Sebab:** riwayat 7 hari dibaca dari buku ringkasan per jam (Modul 18). Petugas ringkasan sudah meringkas jam-jam lama sebelum `npm run isi-riwayat` mengisinya, dan hanya mengulang 3 hari terakhir tiap 30 menit; jam-jam terbaru dihitung langsung. Di database yang benar-benar baru, hasilnya bisa langsung penuh.

**Langkah:** jalankan `CALL refresh_continuous_aggregate(…)` berbatas 8 hari seperti di [7.1](#71-siapkan-data-7-hari-dan-cek-di-bruno-10-menit), lalu buka Riwayat lagi. Penulis: 2 titik sebelum perintah itu, `"jumlah":169` sesudahnya (7 × 24 + 1; angkamu bergantung jam).

</details>

<details>
<summary><b>Bruno menjawab <code>400</code> untuk <code>bucket</code> atau <code>from</code></b></summary>

- **`bucket`** hanya `15m`, `1h`, atau `1d`; nilai lain dijawab `querystring/bucket Pilihan tidak valid: …`. Rentang yang butuh lebih dari 1.000 ember juga ditolak.
- **`from`/`to`** wajib berzona (`…Z` atau `…+07:00`); tanpa zona dijawab `querystring/from tanggal dan waktu format ISO tidak valid`. Di Bruno tulis `+` apa adanya (`%2B` malah ditolak); paling aman akhiran `Z`.

Dashboard tidak terkena: Riwayat memakai nilai bawaan API tanpa `from`, dan grafik 5 menit memakai `toISOString()` (berakhiran `Z`).

</details>

<details>
<summary><b>Riwayat tidak menawarkan tekanan udara, baterai, atau (untuk Node 2) Cahaya</b></summary>

Bukan galat. Buku ringkasan hanya menyimpan suhu (rata-rata, terendah, tertinggi), kelembapan udara, kelembapan tanah, dan cahaya; layar Riwayat menuliskannya di bagian paling bawah. Tekanan udara, baterai, dan air tandon hanya ada di kartu *live*. Node 2 tidak punya sensor cahaya, jadi pilihannya **Suhu**, **Kelembapan**, dan **Tanah**.

</details>

<details>
<summary><b>CSV terbuka sebagai satu kolom di Excel, atau <code>°C</code> tampil rusak</b></summary>

**Satu kolom:** Excel memisahkan kolom CSV dengan *pemisah daftar* Windows. CSV kita memakai titik koma (`;`) dan koma desimal, cocok dengan wilayah Indonesia; di Windows berwilayah Inggris (AS), pemisahnya koma, jadi isinya bisa menumpuk di satu kolom. Buka lewat **Data → Get Data → From File → From Text/CSV**, lalu pilih pemisah **Semicolon** dan cocokkan angka desimalnya dengan tabel; di LibreOffice atau Google Sheets, pilih titik koma saat membuka.

**`°C` rusak** (misalnya `Â°C`; di CSV kita hanya pada nama perangkat): berkasnya tanpa BOM. `keCsv()` harus diawali `"\uFEFF"` ([8.2](#82-srccsvts-dan-tombol-unduh-csv-15-menit)); tiga byte awal berkas penulis `ef bb bf`. Penulis belum membukanya di Excel sungguhan.

</details>

<details>
<summary><b>Menutup LDR tidak membuat grafik langsung berubah</b></summary>

**Sebab:** Node 1 mengirim **segera** hanya saat cahaya melintasi batas gelap/terang (`cahaya` 1000). Di ruangan redup, angkanya sudah di bawah 1000, jadi menutup LDR tidak melintasi batas itu, dan perubahannya baru terkirim pada jadwal 10 detik berikutnya.

**Langkah:** terangi LDR dulu (lampu kamar atau senter HP) sampai Cahaya di atas 1000, tunggu satu kiriman, lalu tutup rapat. Simulator tidak meniru LDR (cahayanya acak): pakai perintah lampu dari Bruno (kiriman segera, < 0,1 detik) atau `suhu 33` (0–10 detik), seperti di [4.4](#44--garisnya-bergerak-sendiri-suhu-33-lampu-atau-ldr-10-menit).

</details>

<details>
<summary><b><code>npm run build</code> menulis <code>Some chunks are larger than 500 kB after minification</code></b></summary>

Bukan galat: *build* sudah lolos (`✓ built in …`), lalu Vite mengingatkan bahwa berkas JavaScript-nya besar. Sejak Praktik 4, Recharts ikut dibundel; penulis mendapat `dist/assets/index-dAX8TLJA.js 684.74 kB │ gzip: 202.77 kB` (angkamu bisa sedikit berbeda). Praktik 1–3 belum memunculkannya.

Biarkan: inilah satu-satunya peringatan yang boleh muncul (butir templat di [➕ C](#c-tambahkan-butir-modul-23-ke-templat-pull-request)). Jangan menaikkan `build.chunkSizeWarningLimit` sekadar untuk menyembunyikannya; cara menghilangkannya dengan memecah bundel ada di [🔬](#-bedah-teknis-opsional). Yang **tidak** boleh: galat `TS…` atau `npm run lint` yang tidak bersih (10.1).

</details>

<details>
<summary><b>HP tidak bisa membuka dashboard lewat alamat IP laptop</b></summary>

Penulis menguji mode HP lewat alamat IP WiFi laptop dari laptop itu sendiri, belum dari HP sungguhan; tiga masalah HP ini disusun dari uji itu dan gejala yang umum. Dari HP, buka dulu `http://<IP-laptop>:8080/health` (harus `{"ok":true,…}`), lalu periksa berurutan:

1. **IP salah.** `npm run dev:hp` menulis beberapa baris `Network:`; pakai yang berakhiran `Wi-Fi` (di `ipconfig`: blok `Wireless LAN adapter Wi-Fi:` yang punya `Default Gateway`). Alamat adaptor lain (WSL, Docker, VPN) tidak bisa dibuka HP.
2. **Vite masih mode laptop.** `npm run dev` menulis `Network: use --host to expose`, dan alamat IP ditolak (`ERR_CONNECTION_REFUSED`). Jalankan `npm run dev:hp` ([9.3](#93-vite-mode-hp-npm-run-devhp-dan-firewall-private-10-menit)).
3. **`/health` tidak terbuka, padahal halamannya terbuka:** `HOST` backend masih `127.0.0.1` ([9.2](#92-backend-mode-hp-host-dan-cors_origin-10-menit)).
4. **Beda jaringan:** HP di WiFi tamu, data seluler, atau router yang mengisolasi perangkat. Sambungkan HP ke WiFi yang sama.
5. ***Firewall* atau VPN:** profil WiFi laptop harus **Private**, dan Node.js diizinkan untuk Private (9.3); matikan VPN.
6. **IP berubah** (router dinyalakan ulang): cari lagi ([9.1](#91-cari-ip-wifi-laptopmu-5-menit)), lalu perbarui `CORS_ORIGIN` dan alamat di HP.

</details>

<details>
<summary><b>Dashboard terbuka di HP, tetapi <i>login</i> gagal atau soket terus <code>xhr poll error</code></b></summary>

| Yang tampak di HP | Sebab → langkah |
| :--- | :--- |
| Kotak merah `Tidak bisa menghubungi server di http://localhost:8080. …` | `VITE_API_BASE` di `frontend/.env.local` masih aktif: beri `#`, hentikan Vite, lalu `npm run dev:hp` lagi. |
| `Tidak bisa menghubungi server di http://192.168.1.10:8080. …` (IP-mu berbeda) | `CORS_ORIGIN` tidak memuat `http://<IP-laptop>:5173` persis (tanpa `/` di ujung, `http` bukan `https`), atau `HOST` masih `127.0.0.1`. Perbaiki `backend/.env` ([9.2](#92-backend-mode-hp-host-dan-cors_origin-10-menit)); `npm run dev` memulai ulang sendiri saat `.env` disimpan, `npm start` tidak. |
| Masuk berhasil, tetapi lencana tertahan di `Menyambung ulang…` | Soket tidak memakai `BASE` (misalnya `io("http://localhost:8080")`: bagi HP, `localhost` adalah HP itu sendiri), atau `CORS_ORIGIN` diubah sesudah halaman dibuka. Pakai `io(BASE, …)`, lalu **F5**. |
| Diminta *login* lagi, padahal di laptop sudah masuk | Wajar: *cookie* melekat pada nama host (`localhost` ≠ alamat IP). Masuk sekali di HP dengan akun viewer. |

</details>

<details>
<summary><b>Di HP, lencana tetap <code>Menyambung ulang…</code> sesudah layar dikunci, atau tampilan rusak di browser lama</b></summary>

**Sesudah layar dikunci:** browser HP menidurkan tab, jadi soketnya putus. Saat layar menyala lagi, Socket.IO mencoba menyambung sendiri; kalau HP tidur lebih dari 15 menit, dashboard memperbarui gelang dulu lalu menyambung (jalur yang sama dengan di laptop), dan grafik 5 menit diisi ulang begitu `Live`. Penulis belum mencobanya di HP sungguhan. Kalau lencana lama tertahan, pastikan HP masih di WiFi rumah dan laptop tidak tertidur atau berganti IP, lalu **F5**. Status yang berubah selama HP tidur: lihat masalah kartu `Offline` di atas.

**Tampilan polos tanpa gaya:** Tailwind CSS v4 butuh Chrome 111+, Safari 16.4+, atau Firefox 128+ ([🚨 Modul 22](../modul-22-react-dasar/README.md#-kalau-tidak-jalan)). Perbarui browser HP-mu.

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: "mengapa" yang lebih dalam, batasan v0.2 yang jujur, dan pilihan lain di dunia kerja. Kodenya **cukup dibaca**, atau dicoba di cabang yang tidak di-*merge*.

<details>
<summary><b>Dari <i>polling</i> ke WebSocket: membaca <code>EIO=4</code> dan <code>upgrade</code> di tab Network</b></summary>

Di tab **Network** (tanpa saringan) saat *login*, soket lahir dua tahap:

1. **`socket.io/?EIO=4&transport=polling&t=…`**: `EIO=4` = versi 4 protokol **Engine.IO**, lapisan bawah Socket.IO. Klien selalu mulai dengan HTTP ***long-polling*** (permintaan yang ditahan server sampai ada pesan), karena proksi, *firewall*, atau antivirus kadang memblokir WebSocket.
2. **`…&transport=websocket&sid=…`** (saringan **Socket**): klien **naik kelas** (*upgrade*). Di **Messages**: `2probe` ↑, `3probe` ↓ (uji jalur), lalu `5` ↑ (pindah).

Angka pertama bingkai = jenis paket Engine.IO (`2` *ping*, `3` *pong*, `4` pesan), angka kedua = jenis paket Socket.IO (`1` putus, `2` acara, `3` jawaban): `42[…]` acara, `420[…]` acara yang minta jawaban nomor 0, `430[…]` jawabannya, `41` putus. Di rekaman penulis, `2` ↓ dan `3` ↑ muncul tiap 25 detik (`pingInterval` bawaan); tanpa *pong* 20 detik lagi (`pingTimeout`), server menutup sambungan. `ikuti` kadang lewat *polling* sebelum naik kelas, jadi tak selalu tampak di **Messages**.

*Long-polling* ini urusan pustaka di dalam satu sambungan, bukan *polling* yang dilarang modul ini. CORS hanya menjaga *polling*; WebSocket dijaga backend lewat pemeriksaan `Origin` di `allowRequest`.

</details>

<details>
<summary><b>Context, Zustand, atau Redux, dan cara Zustand berlangganan lewat <code>useSyncExternalStore</code></b></summary>

| | Context | Zustand (modul ini) | Redux Toolkit |
| :-- | :-- | :-- | :-- |
| Diisi dari `soket.ts` | harus lewat komponen | `useToko.getState()` | `store.dispatch(…)` |
| Digambar ulang tiap bacaan | **semua** pemakainya | yang selektornya berubah | yang `useSelector`-nya berubah |
| Bekal | bawaan React | `create`, +0,8 kB gzip | `configureStore`, `createSlice`, `<Provider>` |

Context cocok untuk nilai yang jarang berubah (bahasa, tema). Inti *hook* Zustand 5.0.16 (`zustand/esm/react.mjs`, dipersingkat):

```js
const slice = React.useSyncExternalStore(
  api.subscribe,                  // "kabari aku setiap papan berubah"
  () => selector(api.getState()), // "baris mana yang kubaca"
);
```

`useSyncExternalStore` = *hook* React untuk berlangganan ke toko di luar React. Setiap `set()`, React memanggil selektormu lagi dan membandingkan hasilnya dengan yang lama (`Object.is`); sama → tidak digambar ulang (Praktik 6). Selektor yang selalu mengembalikan larik **baru** (`?? []`) tak pernah "sama": React menulis `The result of getSnapshot should be cached to avoid an infinite loop`, lalu `Maximum update depth exceeded`. Itulah alasan `KOSONG` di `toko.ts`.

</details>

<details>
<summary><b>Data 10 kali per detik: <i>throttle</i> dan <code>requestAnimationFrame</code></b></summary>

Selektor sempit (Praktik 6) tidak menolong layar yang memang memakai angka itu: setiap pesan soket tiba sebagai tugas terpisah, jadi setiap kiriman = satu gambar ulang. Obatnya, pendengar soket hanya **menampung** bacaan di antrean di luar React, lalu antrean dituang ke toko dengan **satu** `set()`:

- ***Throttle*** (tiap 250–1.000 ms). Riset penulis (server tiruan 10 Hz, mode dev): *throttle* 500 ms memangkas *commit* ±3,5–3,7 kali; angka terlambat paling lama setengah detik.
- **`requestAnimationFrame`** (sekali per bingkai layar, biasanya ±60 per detik): hanya menggabung pesan dalam satu bingkai, jadi berguna bila pesan lebih rapat dari bingkai, bukan 10 per detik.
- ***Transient updates*** Zustand (`useToko.subscribe` + `useRef`): tanpa *re-render* sama sekali, tetapi jauh dari cara React biasa.

Perangkat kita hanya ±0,1 pesan per detik, jadi v0.2 tidak memakai satu pun. *Throttle* dengan `setInterval` pun butuh pengecualian di templat PR (butir Modul 23: `setInterval` hanya di `waktu.ts`).

</details>

<details>
<summary><b>Dua batasan v0.2: isi toko sesudah Keluar dan status yang terlewat saat sambungan putus</b></summary>

**1. Isi toko sesudah Keluar.** **Keluar** memutus soket dan menghapus sesi, tetapi toko tidak dikosongkan: isinya tetap di memori tab sampai halaman dimuat ulang, jadi akun lain yang masuk di tab itu melihat daftar lama sampai `GET /devices` menjawab. Kini semua akun melihat perangkat yang sama (tak ada yang bocor); begitu Modul 24 membedakan peran, toko **wajib** dikosongkan, misalnya `useToko.setState(useToko.getInitialState())` di `logout()` dan `sesiHabis`. Sampai saat itu, di perangkat bersama, tekan **F5** sesudah **Keluar**.

**2. Status yang terlewat.** Backend menyiarkan `status` **hanya saat berubah**, dan acara yang lewat selama putus tidak dikirim ulang. Sesudah tersambung, `onConnect` hanya `ikutiSemua()` (jawabannya bacaan, bukan status); status hanya disegarkan `GET /devices` saat Daftar dibuka. Penulis mengalaminya: backend dimulai ulang tepat saat simulator menyala, status `online` terkirim dua detik sebelum dashboard tersambung, dan kartu tetap `Offline` merah lebih dari 90 detik walau bacaan masuk tiap 10 detik. **F5** membereskannya.

**Obatnya, sinkronkan status sesudah pulih** di `onConnect`:

```ts
ambilPerangkat().then((d) => useToko.getState().setPerangkat(d)).catch(() => {});
```

Itu bukan *polling*: dipicu peristiwa "tersambung" (±sekali per 15 menit, siklus gelang), bukan pengatur waktu. v0.2 belum memasangnya karena perlu uji lab baru (perangkat mati **selama** backend mati); Modul 24 boleh menambahkannya.

</details>

<details>
<summary><b>Page Visibility: soket saat tab di latar atau HP tertidur</b></summary>

Browser menghemat tab yang tidak tampak: di lab, Edge memperlambat `setInterval` di tab latar (teks `… yang lalu` sempat tertinggal). HP yang terkunci bisa menahan JavaScript sepenuhnya (**belum diuji penulis di HP sungguhan**). Menurut aturan Socket.IO:

1. Halaman yang ditahan tidak menjawab *ping*; dalam ±45 detik (25 + 20) server menutup sambungannya.
2. Saat tampak lagi, klien mendapati sambungannya mati (`ping timeout` atau `transport close`) dan menyambung ulang **sendiri**; `onConnect` mengirim `ikuti` lagi, grafik 5 menit diisi ulang dari API.
3. Lebih dari 15 menit: gelang habis, *handshake* ditolak, lalu seperti Konsep 2: *refresh* sekali, baru `socket.connect()`.

Jadi soket pulih sendiri (status yang terlewat: lihat batasan 2). **Page Visibility API** (`document.hidden`, acara `visibilitychange`) memberi tahu kapan halaman tersembunyi, sehingga soket bisa diputus demi baterai; tetapi `onDisconnect` harus membedakannya dari **Keluar** (sama-sama `io client disconnect`). Untuk ±0,1 pesan per detik, belum sepadan.

</details>

<details>
<summary><b><i>Virtualized list</i> dengan <code>@tanstack/react-virtual</code> 3.14.22: kapan perlu</b></summary>

*Virtualized list* hanya membuat elemen untuk baris yang **tampak** di kotak gulir, jadi ribuan baris tetap ringan:

```tsx
const v = useVirtualizer({ count: baris.length, getScrollElement: () => wadahRef.current, estimateSize: () => 40 });
```

lalu yang digambar hanya `v.getVirtualItems()`. Di React 19, kalau Console menulis `flushSync was called from inside a lifecycle method`, tambahkan `useFlushSync: false`. Biayanya +9,8 kB gzip. Perlu saat ribuan baris tampil **sekaligus**; tabel kita berhalaman 24 baris, jadi v0.2 tidak memasangnya.

</details>

<details>
<summary><b><i>Keyset pagination</i>: lebih dari 1.000 bacaan, dimuat sedikit demi sedikit</b></summary>

Tanpa `bucket`, `GET /devices/:id/readings` mengirim paling banyak **1.000** bacaan, urut dari yang terlama, tanpa `limit`/`offset`. Kalau lebih, jawabannya membawa `terpotong: true` berisi 1.000 yang **terlama**. v0.2 aman: 1 jam Node 1 ±360 bacaan; 24 jam dan 7 hari memakai ember.

Untuk bacaan mentah 24 jam (±8.640), ***keyset pagination*** memulai halaman berikutnya sesudah **kunci** terakhir, yaitu `ts` bacaan terakhir: selama `terpotong` masih `true`, tombol **Muat berikutnya** meminta `?from=` + `new Date(Date.parse(ts) + 1000).toISOString()` lalu menyambung hasilnya (`ts` tanpa milidetik, dan unik per perangkat). `toISOString()` berakhiran `Z`, jadi bebas jebakan `+07:00` → `%2B`.

</details>

<details>
<summary><b><i>Downsampling</i> di sisi server: ember rata-rata atau titik penting (LTTB)</b></summary>

Tujuh hari bacaan Node 1 = ±60 ribu titik, padahal grafik di HP hanya selebar beberapa ratus piksel. 🔬 Modul 18 menyebut dua cara menipiskannya:

1. **Ember waktu** (dipakai v0.2): `bucket=15m` (24 jam, 97 titik) dan `bucket=1h` (7 hari, 169 titik). Cepat, tetapi rata-rata bisa menyembunyikan lonjakan sesaat; karena itu Riwayat Suhu juga menggambar garis terendah dan tertinggi.
2. **LTTB** (*Largest-Triangle-Three-Buckets*): memilih titik **asli** yang paling menjaga bentuk grafik, misalnya 500 dari ratusan ribu. Fungsi `lttb(…)` ada di TimescaleDB Toolkit (tidak ada di image ringan kita), atau ditulis sendiri di backend.

LTTB menjaga lonjakan dengan nilai aslinya, tetapi butuh rute backend baru (backend v1.0 sengaja tetap).

</details>

<details>
<summary><b>Pita terendah–tertinggi dengan <code>Area</code></b></summary>

Pengganti dua garis putus-putus di `GrafikRiwayat`: **pita** pudar dari terendah ke tertinggi (saran Modul 18). Di Recharts 3.10.1, `Area` yang nilai tiap titiknya **pasangan** `[bawah, atas]` digambar sebagai pita; wadahnya `ComposedChart` (garis dan area dicampur):

```tsx
<ComposedChart responsive data={baris} style={{ width: "100%", height: 260 }}>
  <Area dataKey={(p) => [p.min, p.maks]} stroke="none" fill={b.warna} fillOpacity={0.2} isAnimationActive={false} />
  <Line dataKey="rata" stroke={b.warna} strokeWidth={2} dot={false} isAnimationActive={false} />
</ComposedChart>
```

Catatan jujur: "pasangan = pita" dibaca penulis dari kode Recharts 3.10.1, belum digambar; periksa celahnya tetap terputus.

</details>

<details>
<summary><b>CSV dan <i>formula injection</i>: sel yang diawali <code>=</code></b></summary>

Excel membaca sel yang diawali `=` (juga `+`, `-`, `@`) sebagai **rumus**. Kolom `perangkat` di CSV kita berisi nama yang diketik admin; seandainya namanya `=HYPERLINK(…)`, Excel menjalankannya saat berkas dibuka. Itulah ***CSV injection*** (*formula injection*). Di layar, React menampilkannya sebagai teks; CSV di luar pengawasan React.

`kutip()` di `csv.ts` hanya mengurus `;`, `"`, dan baris baru. Penjinak yang lazim: awali **sel teks** yang dimulai `=`, `+`, `-`, atau `@` dengan petik tunggal `'`. v0.2 belum memasangnya: hanya admin yang bisa memberi nama, dan `'` itu ikut terbaca program lain (misalnya pandas). Pasang bila nama bisa diisi banyak orang.

</details>

<details>
<summary><b>Tombol tema manual: <code>@custom-variant</code>, kedip putih, dan mengapa tidak di <code>localStorage</code></b></summary>

v0.2 ikut setelan sistem: `dark:` bawaan Tailwind v4 membaca `prefers-color-scheme`. Tombol terang/gelap butuh tiga hal:

1. **`@custom-variant dark (&:where(.dark, .dark *));`** di `src/index.css`. Sejak itu `dark:` hanya patuh pada kelas `dark` di `<html>` dan **berhenti** ikut sistem (riset penulis: aturan `dark:` di CSS *build* tak lagi memakai `prefers-color-scheme`). Variabel grafik di `index.css` pun harus pindah ke selektor `.dark`.
2. **Skrip kecil di `<head>` `index.html`** yang memasang kelas itu sebelum halaman pertama kali digambar (saran Tailwind). Kalau React yang memasangnya sesudah bundel dimuat, halaman sempat terang sekejap: **kedip putih** (FOUC).
3. **Ingatan pilihannya**: skrip contoh Tailwind memakai `localStorage.theme`.

Butir 3 yang bertabrakan. Pilihan tema bukan rahasia, tetapi aturan Modul 22 bisa dicek dengan satu perintah: `git grep -n -e localStorage -e dangerouslySetInnerHTML frontend/src` hanya menemukan satu komentar di `toko.ts` (➕ D), dan `frontend/README.md` v0.2 menulis "Tidak ada apa pun yang disimpan di `localStorage`, termasuk pilihan tema." Pengecualian membuat pemeriksaan itu makin rumit. Jadi: tetap ikut sistem (modul ini), tombol tanpa ingatan (kembali ke setelan sistem setiap dimuat), atau pengecualian tertulis di templat PR dan README.

</details>

<details>
<summary><b>Memecah bundel dengan <code>React.lazy</code>: peringatan 500 kB hilang</b></summary>

Peringatan Praktik 10 muncul karena seluruh dashboard, termasuk Recharts, menjadi **satu** berkas JS, padahal *login* dan Daftar tidak memakai grafik. `React.lazy` + `import()` memecahnya: kode Detail dan Riwayat baru diunduh saat layarnya pertama kali dibuka. Percobaan penulis di `App.tsx`:

```tsx
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
// pengganti impor DetailPerangkat dan Riwayat:
const DetailPerangkat = lazy(() => import("./components/DetailPerangkat"));
const Riwayat = lazy(() => import("./components/Riwayat"));
// di return:
<main className="mx-auto max-w-3xl px-4 py-6"><Suspense fallback={<p>Memuat…</p>}>{layar}</Suspense></main>
```

**Hasilnya (contoh, dipotong; dari kode sedikit sebelum versi akhir, angkamu berbeda):**

```text
dist/assets/Riwayat-DV5t-zj5.js            9.23 kB │ gzip:   3.33 kB
dist/assets/DetailPerangkat-WZ3ERxnL.js   37.88 kB │ gzip:  11.41 kB
dist/assets/index-CUb5K3K4.js            292.22 kB │ gzip:  91.25 kB
dist/assets/Pemilih-BpWgLuA0.js          348.28 kB │ gzip: 101.62 kB

✓ built in 461ms
```

Dua kali *build*, tanpa `(!) Some chunks…`. `Pemilih-….js` berisi Recharts dan kode bersama lain (namanya dari modul bersama pertama). Di `npm run preview`, tab **Network**: awalnya hanya `index-….js`; *login* dan Daftar tanpa unduhan baru; Detail mengunduh `DetailPerangkat-….js` + `Pemilih-….js`; Riwayat mengunduh `Riwayat-….js`. Harganya, Detail pertama kali menunggu ±386 kB dan ada satu konsep lagi; v0.2 memilih satu berkas dan satu peringatan yang sudah dijelaskan.

</details>

<details>
<summary><b><i>Remote debugging</i>: DevTools untuk halaman yang terbuka di HP</b></summary>

Browser HP tidak punya DevTools, padahal galat CORS dan bingkai soket perlu dilihat di sana. *Remote debugging* meminjam DevTools laptop lewat kabel USB:

- **Android + Chrome:** aktifkan **Opsi pengembang** (biasanya ketuk **Nomor versi**/**Build number** tujuh kali), lalu **Debugging USB**. Sambungkan kabel, izinkan di HP, buka `chrome://inspect` di Chrome laptop, klik **inspect** di bawah tab dashboard.
- **iPhone + Safari:** butuh Mac. Di setelan *Advanced*, nyalakan **Web Inspector** (Safari iPhone) dan menu **Develop** (Safari Mac), lalu pilih iPhone-mu di menu itu.

Kamu mendapat **Console**, **Network** (**Socket** → **Messages**), dan (Chrome) **Application** → **Cookies** milik halaman di HP, misalnya untuk menghapus *cookie* `akses` dan menguji *refresh* sekali. Penulis belum mencobanya (lab tanpa HP). Mode perangkat DevTools hanya meniru ukuran layar HP.

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** sama dengan Praktik 10 sesudah mode laptop dikembalikan: **VS Code** (terminal `backend`, terminal Vite dengan `npm run dev`, dan terminal kosong di folder `frontend`; jalur laptop ditambah broker dan simulator), **Docker Desktop** (`rumahpintar-db`), serta **Chrome atau Edge** di `http://localhost:5173` dengan DevTools.

Ketiga tantangan hanya mengubah folder `frontend`. Kerjakan **sesudah** [➕ D](#d--gabungkan-fiturdashboard-live-ke-main-lewat-pull-request-dashboard-v02-live), masing-masing di cabang baru dari `main` (`git switch main`, `git pull`, lalu `git switch -c fitur/<nama-tantangan>`). Sebelum menyimpan, `npm run lint` harus bersih dan `npm run build` lolos dengan satu peringatan 500 kB ([Praktik 10](#praktik-10--uji-kelulusan-lint-build-gladi-bersih-dan-mode-laptop-35-menit)); *pull request*-nya boleh dijadikan latihan *review* (butir **(Modul 23)** templat PR).

Beda dengan Modul 22, **ketiga tingkat berkunci** di [`kode/tantangan/kunci/`](kode/tantangan/kunci/): hanya berkas yang berubah atau baru, di atas [`kode/frontend/`](kode/frontend/) v0.2.0, dan ketiganya lolos *lint* serta *build* di laptop penulis. Tingkat 2 dan 3 sama-sama mengubah `src/App.tsx`, jadi pisahkan cabangnya.

### Tingkat 1 — *Gauge* ketiga: kelembapan udara (ubah sedikit, 20 menit)

*Gauge* hanya pantas untuk besaran yang batasnya jelas ([Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status)). Kelembapan udara adalah kelembapan **relatif**, selalu 0–100 %, dan dikirim **kedua** jenis perangkat (kolom `kelembapan`). Jadikan ia *gauge* pertama, menggantikan kartu **Kelembapan**.

1. Buka **`frontend/src/components/DetailPerangkat.tsx`**, lalu cari `function gauge`.
2. Tambahkan `<Gauge label="Kelembapan udara" … />` dengan `nilai` dari `bacaan.kelembapan` (sah tanpa `as`: `TelemetryNode1` dan `TelemetryNode2` sama-sama punya `kelembapan`), di depan **Kelembapan tanah**, untuk Node 1 **dan** Node 2 (cabang Node 2 kini perlu `<>…</>`).
3. Hapus objek `{ label: "Kelembapan", … }` dari `kartuNode1` dan `kartuNode2`, supaya angka yang sama tidak tampil dua kali.
4. Tambahkan kelas `sm:grid-cols-3` di `<div>` yang membungkus `{gauge(bacaan, node2)}`.
5. Simpan, lalu buka detail Node 1 (jalur laptop: `Latihan ruang tamu`) di laptop dan di mode perangkat DevTools selebar 375 px.

**Hasilnya (contoh, kunci di laptop penulis):** `Latihan ruang tamu` menampilkan tiga *gauge*, `75%`, `32%`, dan `70%` (udara, tanah, tandon), sebaris di lebar 1280 px dan dua kolom di 375 px, tanpa gulir mendatar; kartunya tinggal `Suhu`, `Cahaya`, `Gerakan`, `Lampu`, `Kipas`, `Pompa`, dan `Tirai`. Detail Node 2 belum dicoba penulis di browser.

**Lulus kalau:** detail Node 1 punya tiga *gauge* tanpa kartu **Kelembapan**, detail Node 2 (bila ada) punya dua, tidak ada gulir mendatar di 375 px, dan *lint* serta *build* lulus.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Di awal fungsi `gauge`, kunci membuat `const udara = <Gauge label="Kelembapan udara" nilai={bacaan.kelembapan} />;`, lalu menaruh `{udara}` sebagai baris pertama di dalam `<>…</>` pada **kedua** cabang: elemen JSX boleh disimpan di konstanta seperti nilai biasa. Berkas utuhnya: [`DetailPerangkat.tsx`](kode/tantangan/kunci/tingkat-1/frontend/src/components/DetailPerangkat.tsx).

</details>

### Tingkat 2 — Buku kejadian *live* (isi bagian rumpang, 45 menit)

Backend juga menyiarkan acara **`kejadian`** ke **semua** dashboard setiap kali ia mencatat kejadian baru, misalnya perangkat terputus atau tersambung lagi. Tipe `Kejadian` sudah ada di `src/types.ts` sejak Praktik 1, tetapi belum ada yang mendengarkannya. Buat kotak **Kejadian terbaru** di bawah setiap layar: 10 kejadian terakhir, terbaru di atas, hanya **sejak halaman dibuka** (backend tidak punya rute `GET` untuk kejadian lama). Bukan *toast*; itu Modul 24.

> [!IMPORTANT]
> **Pemicunya perangkat.** Perintah lampu dari Bruno **tidak** membuat kejadian; backend v1.0 hanya mencatat perintah yang ia kirim ulang sendiri. Hentikan simulator (**Ctrl + C**) atau cabut USB Node 1, lalu nyalakan lagi, seperti [3.3](#33--matikan-pengirimnya-kartu-memerah-lalu-hijau-lagi-10-menit).

Buat berkas baru **`frontend/src/components/BukuKejadian.tsx`**, salin kerangka ini, lalu isi setiap `____`:

```tsx
import { useEffect, useState } from "react";
import { socket } from "../soket";
import type { Kejadian } from "../types";
import { jamWib } from "../waktu";

const BATAS = 10; // kejadian yang disimpan; yang lebih lama dibuang

export default function BukuKejadian() {
  const [daftar, setDaftar] = useState<Kejadian[]>(____); // terbaru di depan

  // Berlangganan acara "kejadian" selama komponen ini tampil, berhenti di cleanup.
  useEffect(() => {
    // fungsi bernama: cleanup melepas PERSIS pendengar ini, bukan semua pendengar "kejadian"
    function onKejadian(k: Kejadian) {
      // larik BARU: kejadian baru di depan, lalu dipotong 10. Larik lama tidak diubah.
      setDaftar((lama) => [____, ...lama].slice(0, ____));
    }
    socket.on("____", ____);
    // StrictMode di mode dev: pasang, lepas, pasang lagi. Tetap hanya SATU pendengar, jadi tidak ada kejadian ganda.
    return () => {
      socket.____("kejadian", ____);
    };
  }, []);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100">Kejadian terbaru</h2>
      {daftar.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Belum ada kejadian sejak halaman ini dibuka. Coba hentikan simulator (Ctrl + C) atau cabut USB Node 1, lalu
          nyalakan lagi.
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-700">
          {daftar.map((k) => (
            // id = nomor baris di tabel events backend, pasti unik
            <li key={k.____} className="flex flex-wrap gap-x-3 py-2">
              <span className="shrink-0 font-mono text-xs leading-5 text-slate-500 dark:text-slate-400">{jamWib(k.____)}</span>
              {/* pesan ditampilkan sebagai teks JSX biasa: kode HTML di dalamnya (misalnya dari nama perangkat) tidak dijalankan */}
              <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">{____}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
```

Lalu di **`src/App.tsx`**, impor komponennya (`import BukuKejadian from "./components/BukuKejadian";`) dan tulis `<BukuKejadian />` di dalam `<main>`, **sesudah** `{layar}`, supaya kotaknya tetap tampil (dan mencatat) saat kamu pindah layar.

Uji: *login*, buka **Network** → saringan **Socket**, tekan **F5** → baris `socket.io/?EIO=4…` → **Messages**, hentikan simulator, tunggu kartunya `Offline`, nyalakan lagi, lalu buka detail perangkat itu dan kembali.

**Hasilnya (contoh; simulator penulis dihentikan paksa, lalu dinyalakan lagi):**

```text
Kejadian terbaru
09.18.30 WIB  f00d00000001 tersambung lagi (online)
09.18.23 WIB  f00d00000001 terputus (offline)
```

**Messages** mencatat dua bingkai `42["kejadian",…]` untuk dua baris itu: `StrictMode` tidak menggandakannya.

**Lulus kalau:** satu kejadian = satu baris (juga di mode pengembangan), terbaru di atas, paling banyak 10, barisnya bertahan saat pindah layar dan hilang sesudah **F5**, dan *lint* serta *build* lulus.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Urutan isiannya: `[]`, `k`, `BATAS`, `kejadian`, `onKejadian`, `off`, `onKejadian`, `id`, `waktu`, `k.pesan`. Berkas utuhnya: [`BukuKejadian.tsx`](kode/tantangan/kunci/tingkat-2/frontend/src/components/BukuKejadian.tsx) dan [`App.tsx`](kode/tantangan/kunci/tingkat-2/frontend/src/App.tsx).

Komentar di kerangka menjelaskan setiap isian. Tanpa `off`, gladi `StrictMode` meninggalkan dua pendengar dan setiap kejadian tampil ganda ([Konsep 3](#3-useeffect-untuk-berlangganan-pasang-pendengar-lepas-di-cleanup)). Daftarnya cukup `useState`, bukan toko, karena hanya komponen ini yang memakainya ([Konsep 4](#4-satu-toko-untuk-semua-layar-zustand-dan-selektor)).

</details>

### Tingkat 3 — Dua perangkat dalam satu grafik riwayat 7 hari (buat dari nol, 60–90 menit)

**Tugas.** Buat layar **Bandingkan** di `src/components/BandingRiwayat.tsx`: suhu rata-rata per jam **dua** perangkat selama 7 hari dalam satu grafik. Pasang di `App`: `{ nama: "banding" }` di tipe `Tampilan`, tombol **Bandingkan 7 hari →** di samping judul **Daftar Perangkat**, dan satu cabang `layar` lagi. Isinya dua kotak pilihan `<select>` (bawaannya dua perangkat pertama dari `useToko((s) => s.perangkat)`), grafik dua garis `suhu_rata` dengan keterangan (`Legend`) berisi nama perangkat, dan pesan `Pilih dua perangkat yang berbeda.` bila pilihannya sama.

Petunjuk:

- **Dua permintaan sekaligus:** `Promise.all([ambilRiwayat(idA, "7hari"), ambilRiwayat(idB, "7hari")])` menunggu **keduanya**, hasilnya sesuai urutan ([Modul 22 Tingkat 3](../modul-22-react-dasar/README.md#tingkat-3--ringkasan-semua-perangkat-dalam-satu-layar-buat-dari-nol-6090-menit)). Tetap pakai pola `ignore`; 401 → `onSesiHabis`.
- **Gabung menurut waktu:** satu larik baris `{ t, a, b }` lewat `Map` berkunci `Date.parse(p.waktu)`; jam yang hanya ada di satu perangkat diberi `null` untuk yang lain.
- **Celah jujur ([Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status)):** jam yang kosong di kedua perangkat tidak punya baris, jadi sisipkan baris `null` bila jarak dua baris > 1,5 jam.
- **Sumbu dan warna:** tiru `GrafikRiwayat` ([7.3](#73-layar-riwayat-riwayattsx-dan-grafikriwayattsx-25-menit)). Biru (`var(--color-sky-500)`) dan jingga (`var(--color-amber-500)`) tetap terbedakan bagi kebanyakan orang buta warna, dan nama di keterangan membuat warna tidak pernah sendirian.

**Lulus kalau:** pilihan `Latihan ruang tamu` lawan `Latihan teras` (keduanya diisi `isi-riwayat` di 7.1; jalur perangkat: Node 1 lawan Node 2) tampil sebagai dua garis berketerangan nama, celah tampak putus, kedua `readings?bucket=1h` di **Network** berangkat bersamaan, 375 px tanpa gulir mendatar, dan *lint* serta *build* lulus.

**Hasilnya (contoh, kunci di laptop penulis):** `Latihan ruang tamu: 168 titik · Latihan teras: 166 titik` (kunci menulisnya di atas grafik), dan garis biru putus sekali, di jam-jam tanpa data antara `isi-riwayat` dan simulator.

<details>
<summary><b>Kunci Tingkat 3</b></summary>

Berkas utuhnya: [`BandingRiwayat.tsx`](kode/tantangan/kunci/tingkat-3/frontend/src/components/BandingRiwayat.tsx) (baru) dan [`App.tsx`](kode/tantangan/kunci/tingkat-3/frontend/src/App.tsx).

- **Tombol redup sampai daftar termuat** (`disabled` selama `useToko((s) => s.perangkat)` masih `null`), karena pilihan bawaannya diambil dari daftar itu.
- **Tulisan keterangan memakai warna teks biasa** (`Legend formatter`): tulisan jingga di atas putih sulit dibaca.

</details>

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini wajah Rumah Pintar Mini mulai **hidup**: dashboard v0.2 (live) menerima data lewat Socket.IO, menggambar grafik, dan bisa dibuka dari HP di WiFi rumah. Backend v1.0, broker, firmware, kontrak data 1.4, dan `alat/` tidak berubah. Kode Praktik 1–10 sudah tersimpan sebagai *commit* di cabang `fitur/dashboard-live`, tetapi cabang itu belum pernah dikirim ke GitHub. Langkah A mencocokkan isinya, B dan C memperbarui dua dokumen, D menggabungkan semuanya ke `main` lewat *pull request* "dashboard v0.2 (live)", dan E menyimpan catatan belajarmu. Beginilah seluruh proyek setelah minggu ini:

![Diagram proyek Rumah Pintar Mini setelah Modul 23: dashboard v0.2 (live) di laptop dan di HP lewat WiFi rumah; garis putus-putus berarti menyusul. Baris atas tidak berubah: Node 2 Kebun v1.0.0 berbaterai 18650 mengirim lewat Node 1 dengan ESP-NOW; Node 1 Rumah v1.6.0 (kunci broker di NVS, akun a4cf12e5b7c0, enam kolom + trio RS-485) mengirim MQTT berkunci ke gateway Raspberry Pi 192.168.1.37, berisi Mosquitto berkunci (allow_anonymous false, sandi-broker dan acl-broker) dan Node-RED (dashboard lama, akun nodered); kanan atas, HP untuk Node-RED dan Telegram, serta Telegram untuk peringatan dan /status. Kiri: klien broker di laptop, tidak berubah (MQTTX akun pemantau, pemeriksa kontrak, simulator f00d00000001 dengan kunci di alat/.env), masing-masing lewat MQTT dengan akunnya; kotak ungu HP di WiFi rumah, mode HP (Praktik 9): http://192.168.1.10:5173, akun viewer, lencana Live, sesudah sesi kembali ke mode laptop, dengan panah ke frontend; lalu Jujur, dashboard v0.2 masih: hanya melihat, belum ada tombol kendali (Modul 24); login minimal, rute terproteksi dan peran menyusul (Modul 24); hanya di WiFi rumah dan masih http:// (internet + HTTPS di Modul 27); riwayat ringkasan hanya 4 besaran: suhu, kelembapan, tanah, cahaya. Tengah, kotak Laptop. Kotak hijau backend v1.0, tidak berubah: Fastify + TypeScript, kontrak data 1.4, berkunci (Modul 20–21); Socket.IO di port 8080 yang sama (Modul 19); mode HP memakai HOST=0.0.0.0 dan IP laptop di CORS_ORIGIN (.env). Yang dipakai dashboard v0.2: POST /auth/login, /auth/refresh, /auth/logout, GET /auth/me, GET /devices, GET /devices/:id/readings, dan Socket.IO ikuti dan berhenti menuju telemetry dan status; GET /devices/:id/readings dan Socket.IO berwarna ungu, baru dipakai di Modul 23; perintah dan aturan menunggu Modul 24. Panah rpm/# dan cmd antara broker dan backend; garis ke Telegram, internet: HTTPS keluar, long polling. Di kanan backend: Docker Desktop rumahpintar-db, PostgreSQL 17 + TimescaleDB 2.30.2, tidak berubah; Bruno, terminal kecil, /docs, tidak berubah, dengan Bruno sebagai alat uji jalur laptop (perintah lampu memicu kiriman segera). Antara frontend dan backend: fetch (riwayat, isi awal) + Socket.IO, keduanya membawa cookie akses, dan balasan JSON + acara. Kotak ungu frontend v0.2 (live), folder frontend/ 0.2.0 dengan socket.io-client, Zustand, Recharts, dan date-fns: Vite dev server, npm run dev di http://localhost:5173, dan npm run dev:hp (sama dengan vite --host) hanya selama mode HP; npm run build lolos dengan satu peringatan ukuran 500 kB (Recharts) ke folder dist/; browser di laptop atau HP, satu soket + satu toko Zustand, dengan tiga layar mini: Daftar live, Detail dengan grafik + gauge, dan Riwayat + tabel; pil hijau di kepala adalah lencana Live, mode gelap ikut setelan sistem, CSV diunduh dari layar Riwayat dengan pemisah titik koma dan koma desimal. Kiri bawah, GitHub rumah-pintar-mini: cabang fitur/dashboard-live, pull request dashboard v0.2 (live) ke main ditinjau dengan butir (Modul 23), lalu di-merge. Berkas baru atau berubah di frontend/: package.json dan package-lock.json (0.2.0, + 5 paket, skrip dev:hp); index.html (scheme-light dark:scheme-dark); index.css (warna grafik terang/gelap); soket.ts, toko.ts, waktu.ts, dan csv.ts yang baru; api.ts, types.ts, dan App.tsx yang ditambah; delapan komponen baru (LencanaKoneksi, TerakhirDilihat, Pemilih, GrafikLive, Gauge, Riwayat, GrafikRiwayat, TabelRiwayat); DaftarPerangkat dan DetailPerangkat yang kini live dan merah/hijau; Lencana, Login, dan KartuSensor (teks status, kelas dark:); .env.example (catatan mode HP) dan README.md (Membuka dari HP, Batasan v0.2); ditambah templat pull request (butir Modul 23). Dihapus sebelum commit: coba-live.html (Kemenangan Cepat) dan src/uji/ (Praktik 6). Tidak pernah ikut Git: backend/.env (berisi IP laptop saat mode HP), frontend/.env.local, node_modules/, dan dist/. Kanan bawah: Fase 4 berjalan, dashboard v0.2, angka bergerak sendiri, Checkpoint Fase 4 di Modul 25; menyusul Modul 24 (tombol kendali, form aturan, peran, rute terproteksi), Modul 25 (Grafana, peta perangkat, laporan, Checkpoint Fase 4), dan Modul 27 (ke internet: domain, HTTPS, aplikasi di HP atau PWA).](aset/diagram-proyek-modul-23.png)

Yang berubah hanya kotak ungu: **frontend v0.2 (live)** dan **HP**. Dashboard kini juga memakai `GET /devices/:id/readings` (grafik dan riwayat) dan Socket.IO; `GET /devices/:id/latest` tidak dipakai lagi, karena nilai awal kartu kini datang dari jawaban `ikuti`. Kotak **Jujur** sejalan dengan **Batasan v0.2** di README langkah B.

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan terminalnya (mula-mula di folder `frontend`, lalu di akar `rumah-pintar-mini`), **browser** yang sudah masuk ke GitHub, dan di langkah E jendela VS Code kedua dengan folder `belajar-iot`. Backend, simulator, dan Vite tidak perlu menyala; kalau Vite masih berjalan, hentikan dengan **Ctrl + C** sebelum langkah D.
>
> ⭐ **Wajib** — langkah D menggabungkan dashboard v0.2 ke `main`, dan Modul 24 dimulai dari sana.

### A. Cocokkan `frontend/`-mu dengan dashboard v0.2.0

Isi cabangmu harus sama dengan dashboard rujukan [`kode/frontend/`](kode/frontend/), kecuali `README.md` (langkah B). Di terminal folder `frontend`, `git status` harus menyebut cabang `fitur/dashboard-live` tanpa berkas yang berubah (Praktik 10 sudah di-*commit*). Baris pertama `npm ls --depth=0` harus diawali `rumah-pintar-mini-frontend@0.2.0`, dengan kelima paket Praktik 1.2 pada versi persisnya. Inilah yang akan ikut *pull request*:

| Berkas yang ikut *pull request* | Langkah |
| :--- | :--- |
| **Baru**: `frontend/src/soket.ts`, `toko.ts`, `waktu.ts`, `csv.ts`, dan delapan komponen (`LencanaKoneksi`, `TerakhirDilihat`, `Pemilih`, `GrafikLive`, `Gauge`, `Riwayat`, `GrafikRiwayat`, `TabelRiwayat`) | Praktik 1–8 |
| **Berubah**: `index.html`, lalu di `src/`: `index.css`, `App.tsx`, `api.ts`, `types.ts`, dan kelima komponen Modul 22 | Praktik 1–7 |
| `package.json` dan `package-lock.json` (lima paket, skrip `dev:hp`, versi **0.2.0**), `.env.example` (catatan mode HP) | 1.2, 9, 10.2 |
| `frontend/README.md` | B |
| `.github/pull_request_template.md` | C |

`node_modules/`, `dist/`, `.env.local`, dan `backend/.env` **tidak pernah ikut Git**; `public/coba-live.html` (Kemenangan Cepat) dan `src/uji/` (Praktik 6) sudah dihapus. *Lint* dan *build* sudah dibuktikan di [Praktik 10](#praktik-10--uji-kelulusan-lint-build-gladi-bersih-dan-mode-laptop-35-menit).

### B. Perbarui `frontend/README.md`: membuka dari HP dan batasan v0.2

README v0.1 masih berkata dashboard statis dan hanya bisa dibuka dari laptop ini. Buka [`kode/frontend/README.md`](kode/frontend/README.md) di GitHub, klik **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi `README.md` di folder `frontend` (bukan yang di akar repositori). Simpan (**Ctrl + S**), lalu lihat tampilannya dengan **Ctrl + Shift + V** (macOS: **Cmd + Shift + V**).

Yang berubah: **Menjalankan** (resep data 7 hari seperti 7.1, `npm run dev:hp`, `npm run preview -- --host`, peringatan 500 kB); bagian baru **Membuka dari HP (WiFi rumah)** dengan tabel mode laptop ↔ mode HP; **Isi folder `src/`** dan ***Login* dan keamanan** (soket berkunci, pemulihan sampai **Terputus**, tanpa *polling*); serta **Batasan v0.2**: belum ada kendali dan peran (Modul 24), hanya WiFi rumah dan masih `http://` (Modul 27), riwayat ringkasan hanya empat besaran, dan kiriman atau status yang lewat selama sambungan putus tidak disusulkan.

Butir terakhirnya jujur: mode HP **belum dicoba di HP sungguhan** oleh penulis. Sudah lulus 9.5 di HP sungguhan? Ganti kalimat itu dengan hasilmu. README menyebut nama akun, tetapi **tidak pernah** sandi maupun IP laptopmu (cukup `<IP-laptop>`).

### C. Tambahkan butir Modul 23 ke templat *pull request*

Dashboard mendapat lima butir bertanda **(Modul 23)**. Buka [`kode/.github/pull_request_template.md`](kode/.github/pull_request_template.md) di GitHub, klik **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi `.github/pull_request_template.md`-mu (folder `.github` di akar `rumah-pintar-mini`, bukan di dalam `frontend`). Simpan. Isinya sama persis dengan templat Modul 22, ditambah lima baris ini:

```markdown
- [ ] **(Modul 23)** Satu-satunya peringatan yang boleh muncul di `npm run build` adalah peringatan ukuran `Some chunks are larger than 500 kB` (Recharts, sudah dijelaskan di Modul 23); `npm run lint` tetap tanpa peringatan
- [ ] **(Modul 23)** Tidak ada *polling*: data baru hanya datang lewat Socket.IO, dan `git grep -n setInterval frontend/src` hanya menemukan jam di `frontend/src/waktu.ts`
- [ ] **(Modul 23)** Setiap `socket.on(…)` punya `socket.off(…)` dengan fungsi yang sama di *cleanup* efeknya, dan soket tetap dibuat sekali di `frontend/src/soket.ts` (bukan di dalam komponen)
- [ ] **(Modul 23)** Mode HP sudah dikembalikan ke mode laptop (`HOST=127.0.0.1`, alamat IP dihapus dari `CORS_ORIGIN`, Vite tanpa `--host`), dan `backend/.env` yang berisi IP laptop tidak ikut Git
- [ ] **(Modul 23)** Tidak ada berkas percobaan di tab **Files changed**: `frontend/public/coba-live.html` (Kemenangan Cepat) dan folder `frontend/src/uji/` (Praktik 6)
```

Butir pertama ada di **Checklist sebelum *merge***, di bawah butir *build* **(Modul 22)** yang tidak diubah, dan hanya mengecualikan peringatan ukuran dari [10.1](#101-npm-run-lint-bersih-npm-run-build-lolos-dengan-satu-peringatan-10-menit). Empat lainnya ada di **Checklist keamanan**: tanpa *polling* (aturan aman butir 5), pendengar soket dilepas (Konsep 3), mode laptop ([10.4](#104-kembalikan-mode-laptop-5-menit)), dan tanpa berkas percobaan.

### D. ⭐ Gabungkan `fitur/dashboard-live` ke `main` lewat *pull request* "dashboard v0.2 (live)"

Naik dari folder `frontend` ke akar repositori, lalu periksa:

```text
cd ..
git status
```

Harus ada tepat dua berkas `modified`: `.github/pull_request_template.md` dan `frontend/README.md`. Kalau ada berkas lain, kembali ke langkah A. Lalu simpan dan kirim cabangnya:

```text
git add frontend/README.md .github/pull_request_template.md
git commit -m "Dokumen dashboard v0.2: README frontend dan butir Modul 23 di templat pull request"
git push -u origin fitur/dashboard-live
```

*Push* pertama cabang ini membawa semua *commit* sejak Praktik 1.

1. **Buka *pull request*.** Di GitHub, klik **Compare & pull request** pada pita kuning `fitur/dashboard-live` (atau **Pull requests** → **New pull request**, **base: `main`** ← **compare: `fitur/dashboard-live`**). Beri judul `Dashboard v0.2 (live)`. Di **Apa yang berubah?**, tulis misalnya: `Dashboard v0.2 (frontend 0.2.0): data live lewat Socket.IO, status merah/hijau, grafik 5 menit, gauge, riwayat dengan tabel dan CSV, mode gelap, dan mode HP. Backend, alat, dan edge tidak berubah.` GitHub hanya memakai templat yang sudah ada di `main`, jadi salin kelima butir **(Modul 23)** dari VS Code ke bawah deskripsi, lalu klik **Create pull request**.
2. ***Review* dengan butir (Modul 23).** Centang hanya yang benar-benar terpenuhi:
   - Tab **Files changed** berisi **27 berkas**: 12 baru dan 14 berubah di `frontend`, ditambah templat. **Tidak boleh ada** `coba-live.html`, `src/uji/`, `backend/.env`, `.env.local`, `node_modules/`, `dist/`, atau berkas dari `backend/`, `alat/`, dan `edge/`. Jumlahnya berbeda? Cocokkan dengan tabel langkah A.
   - *Polling*: di terminal akar, `git grep -n setInterval frontend/src` hanya mencetak satu baris, dari `frontend/src/waktu.ts` (detak jam, Konsep 6).
   - Soket: di `frontend/src/soket.ts`, kelima `socket.on(…)` punya kembaran `socket.off(…)` dengan fungsi yang sama di *cleanup*-nya, dan `io(` hanya ada di berkas itu.
   - Butir **(Modul 22)**: `git grep -n -e localStorage -e dangerouslySetInnerHTML frontend/src` kini mencetak satu baris, yaitu komentar di `frontend/src/toko.ts` yang justru menegaskan tidak ada yang disimpan di `localStorage`.
   - Sisanya: *build* dan *lint* lulus (10.1), mode laptop kembali (10.4), paket berversi tertulis (1.2), `found 0 vulnerabilities` (10.2); backend, alat, edge, dan `KONTRAK-DATA.md` tidak berubah.

   Kirim ringkasannya lewat **Review changes** → **Comment** → **Submit review**. Ada berkas terlarang yang telanjur ikut? **Jangan di-*merge***: hapus dengan `git rm -r` (yang masih perlu ada di laptop, seperti `backend/.env`: tambah `--cached`, lalu ganti rahasianya seperti di Modul 20), *commit*, dan *push* lagi.
3. ***Merge.*** Pilih **Create a merge commit**, klik **Merge pull request** → **Confirm merge**, lalu **Delete branch**.
4. **Pulang ke `main`.** Di terminal akar `rumah-pintar-mini`:

   ```text
   git switch main
   git pull --prune
   git branch -d fitur/dashboard-live
   ```

   Sesaat sesudah `git switch main`, folder `frontend` kembali ke v0.1; `git pull --prune` mengembalikan v0.2 tanpa `npm install` lagi (`node_modules` tidak ikut Git dan sudah berisi lima paket baru).

**Kamu lulus langkah ⭐ ini** kalau *pull request* "dashboard v0.2 (live)" sudah ditinjau dengan kelima butir **(Modul 23)**, lalu di-*merge*, dan `frontend/package.json` di `main` laptopmu menulis `"version": "0.2.0"`.

### E. Simpan catatan belajarmu

Buka repositori **`belajar-iot`** di jendela VS Code baru (**File → New Window**, lalu **File → Open Folder…**), buat **`modul-23/catatan.md`** di samping `pemanasan.js`, lalu isi dengan angka dari layarmu sendiri:

```markdown
# Catatan Modul 23 — Dashboard v0.2

| Yang diukur | Angkaku |
| :--- | :--- |
| Jeda LDR ditutup → grafik di HP berubah, dari video; jalur laptop: Bruno lampu → titik baru (9.5) | … detik |
| "dimuat dalam" riwayat 7 hari, terlama dari tiga kali: npm run dev (7.4) / preview (10.3) | … ms / … ms |
| Profiler 10 detik: N laju nyata / N beban palsu / LencanaKoneksi dengan selektor lebar (Praktik 6) | … / … / …× |
| IP WiFi laptop; jam mode HP dinyalakan (9.2) dan dikembalikan (10.4) | … / … WIB / … WIB |
| Berkas JavaScript di dist/, kolom gzip (10.1) | … kB |
| Berkas di tab Files changed pull request "dashboard v0.2 (live)" (➕ D) | … berkas |
| Diuji di HP sungguhan, tablet, atau mode perangkat DevTools? (Praktik 9) | … |

Yang paling mengejutkanku: …
```

*Commit* dan *push* di repositori **`belajar-iot`**.

**Bukti lulus Modul 23** (bandingkan dengan ✅ di bawah): video grafik di HP yang berubah ≈ 1–2 detik (9.5), riwayat 7 hari < 1 detik (7.4), gladi bersih yang lulus sekali jalan (10.3), dan *pull request* "dashboard v0.2 (live)" yang sudah di-*merge* (➕ D).

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Acara** (*event*) | Pesan bernama lewat soket: dari backend `telemetry`, `status`, dan `kejadian`; dari browser `ikuti` dan `berhenti`. Didengar dengan `socket.on(nama, fungsi)` dan dilepas dengan `socket.off(nama, fungsi)` yang sama. |
| ***Ack*** (jawaban) | Balasan backend untuk satu acara yang dikirim browser. `ikuti` dikirim dengan `emitWithAck` dan dijawab `{ ok, terbaru }`; tanpa fungsi jawaban, backend diam-diam tidak memasukkanmu ke *room*. |
| **CSV** dan **BOM** | CSV = teks berkolom, satu baris per titik. Dashboard menyusunnya untuk Excel Indonesia: pemisah `;`, koma desimal, dan CRLF. BOM (*byte order mark*) = tiga byte tak terlihat di awal berkas yang menandai isinya UTF-8, supaya `°` tidak rusak. |
| **Data basi** | Angka yang masih tampil, padahal bacaan terakhirnya sudah lama: lewat 30 detik (Node 1, simulator) atau 16 menit (Node 2). Kartunya diberi `· data basi`, walau lencana statusnya mungkin masih `Online`. |
| **Domain** | Rentang nilai sebuah sumbu atau busur. *Gauge* persen bertumpu pada domain tetap `[0, 100]`; kalau dihitung dari data, nilai berapa pun tampak penuh. |
| **Ember** (*bucket*) | Kotak waktu tempat database merangkum bacaan (rata-rata, terendah, tertinggi; Modul 18). Riwayat 24 jam = ember 15 menit (`bucket=15m`), 7 hari = ember 1 jam (`bucket=1h`); 1 jam memakai bacaan mentah. |
| **Gambar ulang** (*re-render*) dan ***commit*** | Gambar ulang = React memanggil lagi fungsi komponen karena *state*, *props*, atau bagian toko yang dibacanya berubah; *commit* = saat hasilnya dituliskan ke layar. |
| ***Gauge*** | Penunjuk setengah lingkaran untuk satu angka berbatas, seperti kelembapan tanah dan air tandon 0–100 %; dibuat dengan `RadialBarChart` Recharts. |
| **Jam relatif** | Waktu ditulis sebagai jarak dari sekarang: `terakhir dilihat 12 detik yang lalu`, atau `baru saja` di bawah 5 detik. Detak `useSekarang()` tiap detik memperbaruinya tanpa bertanya ke backend. |
| **Jendela geser** | Isi grafik *live*: hanya bacaan 5 menit terakhir. Bacaan baru masuk di kanan, yang lebih tua dari 5 menit dibuang di kiri, yang ganda dibuang; isi awalnya diambil dari `GET …/readings?from=…`. |
| **LAN**, **IP**, dan **`0.0.0.0`** | LAN = jaringan lokal WiFi rumahmu. IP laptop di LAN (contoh: `192.168.1.10`) dibagikan router dan bisa berubah. `HOST=0.0.0.0` = backend mendengar di semua alamat laptop; bukan alamat untuk dibuka. |
| **Lencana koneksi** | `Live` (tersambung), `Menyambung ulang…` (putus, sedang mencoba lagi), atau `Terputus` (berhenti mencoba: sesudah **Keluar**, atau ditolak berulang kali; yang kedua perlu **F5**). |
| **Mode gelap** | Tampilan gelap yang mengikuti setelan sistem HP atau laptop (`prefers-color-scheme`), lewat kelas `dark:` Tailwind dan variabel warna grafik di `index.css`; tanpa tombol, tanpa `localStorage`. |
| **Mode HP** dan **mode laptop** | Mode HP (sementara, hanya di WiFi rumah): `HOST=0.0.0.0`, IP laptop di `CORS_ORIGIN`, `npm run dev:hp`. Mode laptop (keadaan aman bawaan): `HOST=127.0.0.1`, `CORS_ORIGIN` tanpa IP, `npm run dev`. |
| ***Pagination*** | Memotong daftar panjang per halaman. `TabelRiwayat` menampilkan 24 baris per halaman, terbaru dulu, dari data yang sudah ada di browser (API tidak punya pilihan halaman). |
| ***Polling*** | Bertanya ke server berulang-ulang dengan pengatur waktu. Dilarang di dashboard ini: data baru didorong lewat Socket.IO, dan `setInterval` hanya menggerakkan jam di layar. |
| **Profil jaringan Private** dan **Public** | Setelan Windows per WiFi: **Private** untuk WiFi rumah yang kamu percaya, **Public** untuk WiFi umum. Izin *firewall* Node.js untuk mode HP hanya pada Private (Modul 10). |
| **Profiler** dan **Highlight updates** | Dua alat ukur React DevTools: **Highlight updates** memberi bingkai sekilas pada komponen yang digambar ulang; tab **Profiler ⚛** menghitung setiap *commit* selama rekaman. |
| ***Room*** ("kamar") | Kelompok soket di backend per perangkat (`perangkat:<device_id>`). `telemetry` hanya dikirim ke kamar perangkatnya, sedangkan `status` dan `kejadian` ke semua. Kamar hilang setiap sambungan putus, jadi `ikuti` diulang di setiap `connect`. |
| **Selektor** | Fungsi kecil yang memilih bagian toko yang dibaca komponen, misalnya `useToko((s) => s.koneksi)`: komponen digambar ulang hanya kalau bagian itu berubah. Jangan mengembalikan larik baru (`?? []`); pakai `KOSONG`. |
| **Socket.IO** dan **soket** | Satu sambungan yang tetap terbuka antara browser dan backend (dibuka lewat HTTP, lalu naik ke WebSocket). Dashboard membuatnya sekali di `src/soket.ts`, dengan `withCredentials: true` agar *cookie* *login* ikut. |
| **Terakhir dilihat** | Jam terakhir sebuah perangkat terdengar: mula-mula `terakhir_dilihat` dari database (jam server), lalu jam browser menerima `telemetry`-nya; ditampilkan sebagai jam relatif. |
| **Toko** (*store*) Zustand | "Papan pengumuman bersama" untuk semua layar (`useToko` di `src/toko.ts`): koneksi, perangkat, status, bacaan terbaru, terakhir dilihat, dan jendela 5 menit. |

## 📝 Kuis (5 soal)

1. Temanmu ingin angka dashboard v0.1 bergerak dengan `setInterval(() => fetch(…/latest), 1000)`. (a) Disebut apa cara ini, dan apa dua kerugiannya? (b) Bagaimana v0.2 mendapat angka baru? (c) Mengapa `setInterval` di `src/waktu.ts` tidak melanggar aturan "tanpa *polling*"?
2. Temanmu memasang pendengar di sebuah komponen: `useEffect(() => { socket.on("telemetry", (id) => console.log("bacaan", id)); }, []);`. (a) Di `npm run dev`, setiap bacaan tercetak dua kali. Mengapa? (b) Lewat `npm run preview` hanya sekali. Berarti aman? (c) Apa obatnya?
3. Dashboard dibiarkan terbuka di detail perangkat. (a) Sekitar 15 menit sekali, lencana sebentar `Menyambung ulang…` lalu `Live` lagi. Apa yang terjadi, dan siapa yang menyambung lagi? (b) Kamu menekan **Ctrl + C** pada `npm run dev` backend di Windows, lalu menyalakannya lagi. Apa yang terjadi pada sambungan dashboard? (c) Kapan lencana menjadi `Terputus`, dan apa yang kamu lakukan?
4. *Gauge* **Air tandon** menulis `14%`, tetapi busurnya penuh dari ujung kiri ke ujung kanan. (a) Apa yang kurang di `Gauge.tsx`, dan mengapa tanpanya busur selalu penuh? (b) Mengapa ini berbahaya? (c) Sebutkan tiga hal lain di v0.2 yang menjaga visual tetap jujur.
5. Mode HP sudah dinyalakan. (a) Temanmu mengetik `http://localhost:5173` di browser HP-nya: tidak terbuka. Mengapa? (b) Dengan `http://192.168.1.10:5173`, halaman tampil, tetapi *login* gagal dengan kotak `Tidak bisa menghubungi server di http://192.168.1.10:8080. …` dan Console menulis `blocked by CORS policy`. Apa yang terlupa? (c) Mengapa ia harus *login* lagi di HP, padahal di laptop sudah masuk? (d) Apa yang wajib dilakukan sebelum laptop dibawa ke WiFi lain?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) ***Polling***: bertanya berulang-ulang. Kerugiannya: hampir semua pertanyaan sia-sia (perangkat mengirim tiap 10 detik, jadi ±9 dari 10 jawaban "belum ada yang baru"), dan setiap HP atau tab menambah beban backend. (b) **Didorong**: browser cukup `ikuti` sekali per perangkat, lalu backend mengirim acara `telemetry` lewat soket yang tetap terbuka begitu bacaan sah tiba. Di laptop penulis, perintah lampu mengubah kartu dalam kurang dari 0,1 detik. (c) Detak itu hanya menghitung ulang jam di layar (`terakhir dilihat … yang lalu`), tanpa menyentuh jaringan ([Konsep 1](#1-didorong-bukan-bertanya-data-live-lewat-socketio), [Konsep 6](#6-waktu-di-layar-jam-wib-jam-relatif-dan-detak-yang-bukan-polling)).
2. (a) Di mode pengembangan, StrictMode menggladi setiap efek: pasang, bereskan (*cleanup*), pasang lagi. Efek ini tanpa *cleanup*, jadi pendengar pertama tak pernah dilepas: dua pendengar, persis `pendengar telemetry sekarang: 2` di 🔁 Langkah 3. (b) **Tidak.** Pendengarnya tetap bertambah setiap komponen dipasang ulang, misalnya setiap pindah layar; StrictMode hanya membuat galatnya cepat terlihat. (c) Pakai fungsi bernama dan lepas fungsi yang sama: `function onTelemetry(id: string) {…}`, `socket.on("telemetry", onTelemetry)`, lalu `return () => { socket.off("telemetry", onTelemetry); };`. Jangan `socket.off("telemetry")` tanpa fungsi (melepas **semua** pendengar acara itu, termasuk milik `useRealtime`) ([Konsep 3](#3-useeffect-untuk-berlangganan-pasang-pendengar-lepas-di-cleanup)).
3. (a) Gelang `akses` 15 menit habis, dan backend **sengaja** memutus soketnya (`io server disconnect`). Untuk alasan itu Socket.IO tidak menyambung sendiri, jadi dashboard yang memintanya: `refreshSekali()` menukar kartu terusan dengan gelang baru (`POST /auth/refresh -> 200`), hasilnya `true`, lalu `socket.connect()`, dan `onConnect` mengirim `ikuti` lagi. (b) Di Windows, **kadang** backend mati mendadak tanpa log berhenti (`transport close`): Socket.IO mencoba lagi sendiri, berjeda. **Kadang** backend sempat berhenti rapi (`SIGINT diterima: backend berhenti dengan rapi`, lalu `io server disconnect`): dashboard mencoba *refresh* dulu, backend tak menjawab (`null`), lalu tetap `socket.connect()` dan mencoba berjeda. Keduanya kembali `Live` tanpa **F5** beberapa detik sesudah backend siap (penulis: 4,0 dan 16,4 detik). (c) Sesudah **Keluar** (`socket.disconnect()` dulu, baru `POST /auth/logout`): cukup *login* lagi. Atau bila soket tetap ditolak walau sudah tiga kali *refresh* (misalnya database mati): bereskan sebabnya, lalu **F5** ([Konsep 2](#2-soket-berkunci-cookie-yang-sama-gelang-yang-sama)).
4. (a) `<PolarAngleAxis type="number" domain={[0, 100]} tick={false} />`. Tanpa itu, skala busur dihitung dari data, jadi satu-satunya nilai menjadi ujung skalanya sendiri: busur selalu penuh (di lab penulis, 20 % dan 49 % sama-sama penuh). (b) Mata membaca gambar lebih dulu daripada angka: tandon yang hampir kosong tampak penuh, jadi tidak segera diisi. (c) Misalnya: satuan di setiap angka (`%`, `°C`); warna selalu ditemani teks (`rendah (di bawah 20 %)`, `Online`/`Offline`); `null` ditulis `—`, bukan 0; celah tidak disambung di kedua grafik; animasi mati supaya angka tidak "meluncur" dari nilai lama ([Konsep 9](#9-visual-yang-jujur-skala-satuan-celah-dan-warna-status)).
5. (a) Bagi HP, `localhost` adalah **HP itu sendiri**. Pakai IP WiFi laptop dari `ipconfig` (blok `Wireless LAN adapter Wi-Fi:`). (b) `http://192.168.1.10:5173` belum ada di `CORS_ORIGIN` (`backend/.env`) (atau salah tulis: `https`, `/` di ujung, spasi). Baris itu berlaku untuk `fetch` **dan** soket; tanpanya, lencana pun tertahan `Menyambung ulang…`. (c) *Cookie* disimpan per browser dan per nama host: browser HP belum punya *cookie* itu, dan `localhost` ≠ `192.168.1.10`. Cukup akun viewer. (d) Kembalikan mode laptop: `HOST=127.0.0.1`, hapus IP dari `CORS_ORIGIN`, dan jalankan `npm run dev` tanpa `--host` ([Konsep 12](#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop), [10.4](#104-kembalikan-mode-laptop-5-menit)).

</details>

---

## ✅ Checklist kelulusan Modul 23

Syarat lulus dari Silabus: **menutup LDR dengan tangan membuat grafik di HP berubah dalam < 1 interval kirim + 1 detik (dengan *report-by-exception* Modul 11: ≈ 1–2 detik), dan riwayat 7 hari termuat < 1 detik.** **Jalur tanpa perangkat:** semua butir boleh dicentang dengan simulator Modul 21 (`f00d00000001`) sebagai pengganti Node 1 dan Node 2. Syarat pertama diuji dengan perintah lampu dari Bruno (≈ 1–2 detik; menguji pipa kiriman segera, bukan sensor cahaya) dan `suhu 33` (< 11 detik).

> [!NOTE]
> **Belum di HP sungguhan.** Penulis belum mencoba Praktik 9 dan gladi 10.3 di HP sungguhan ([📚](#-sumber--atribusi-gambar)). Tanpa HP atau perangkat kedua, kerjakan langkahnya di laptop lewat `http://<IP-laptop>:5173` dengan [mode perangkat DevTools](../modul-22-react-dasar/README.md#71-mode-perangkat-devtools-dashboard-di-375-768-dan-1280-px-8-menit) selebar 375 px, centang butir ⭐ Praktik 9 dan 10 dengan tulisan "belum di HP sungguhan" di catatan belajar dan *pull request*-mu, lalu ulangi di HP begitu ada.

- [ ] `node pemanasan.js` mencetak jendela 5 menit, `pendengar telemetry sekarang: 2` lalu `0` sesudah `off`, tiga detak WIB, dan baris CSV ber-`;`, cocok dengan "Kunci uji dirimu" (🔁).
- [ ] `coba-live.html` menampilkan suhu yang berganti sendiri tanpa tombol, bingkai `42["telemetry", …]` tampak di tab **Network** (saringan **Socket**, di versi lama **WS**), lalu berkasnya kuhapus (Kemenangan Cepat).
- [ ] Sesudah *login*, lencana `Live` menyala dan log backend menulis `klien realtime tersambung` sekali walau ada StrictMode; backend dihentikan lalu dinyalakan → `Menyambung ulang…` → `Live` lagi tanpa **F5**; sesudah **Keluar**, tidak menyambung lagi (Praktik 1).
- [ ] Angka di Daftar dan Detail bergerak sendiri: `suhu 33` muncul pada kiriman berikutnya, dan kartu **Lampu** berubah hampir seketika sesudah perintah dari Bruno (Praktik 2).
- [ ] ⭐ Simulator dihentikan (jalur perangkat: USB Node 1 dicabut) → kartu `Offline` bertepi merah, `terakhir dilihat` terus bertambah, lalu `· data basi`; dijalankan lagi → `Online` hijau (Praktik 3).
- [ ] ⭐ Grafik *live* 5 menit (jam WIB per menit; Suhu, Cahaya, Kelembapan) berubah sendiri ≈ 1–2 detik sesudah LDR ditutup (jalur laptop: sesudah perintah lampu) (Praktik 4).
- [ ] *Gauge* tanah dan tandon kulihat "salah dulu" (busur penuh), lalu jujur dengan domain 0–100 dan `—` untuk `null`; mode gelap mengikuti setelan sistem, dan grafiknya tetap terbaca (Praktik 5).
- [ ] Aku mengukur *commit* dengan Profiler (laju nyata, beban palsu, selektor lebar), lalu menghapus `src/uji/`; `git status` bersih (Praktik 6).
- [ ] ⭐ Riwayat 1 jam, 24 jam, dan 7 hari tampil; 7 hari (rata-rata per jam, 169 titik bila datanya lengkap) menulis `dimuat dalam` di bawah 1.000 ms tiga kali, cocok dengan tab **Network** dan log backend (Praktik 7).
- [ ] Tabel terbaru dulu, 24 baris per halaman (`Halaman 1 dari 8` untuk 7 hari), dan CSV-nya berpemisah `;` dengan koma desimal, cocok dengan tabel (Praktik 8).
- [ ] ⭐ Dengan mode HP (`HOST=0.0.0.0`, IP-ku di `CORS_ORIGIN`, `npm run dev:hp`), akun viewer masuk dari HP di WiFi rumah dengan lencana `Live`, dan videoku memperlihatkan grafik di HP berubah ≈ 1–2 detik (Praktik 9).
- [ ] ⭐ `npm run lint` bersih, `npm run build` **lolos dengan satu peringatan ukuran** (`Some chunks are larger than 500 kB`) yang sudah dijelaskan, versi `0.2.0`, gladi bersih kedua syarat lulus berhasil sekali jalan pada `npm run preview -- --host`, dan mode laptop sudah dikembalikan: HP tidak bisa membuka dashboard lagi (Praktik 10).
- [ ] `frontend/`-ku cocok dengan v0.2.0, `frontend/README.md` punya bagian membuka dari HP dan batasan v0.2, templat *pull request* punya butir **(Modul 23)**, dan catatan belajarku tersimpan di `belajar-iot/modul-23/catatan.md` (➕ A, B, C, dan E).
- [ ] ⭐ Semua pekerjaan Modul 23 sudah ada di `main` lewat *pull request* "dashboard v0.2 (live)" yang ditinjau dengan butir **(Modul 23)**: tanpa *polling*, setiap `socket.on` punya `socket.off`, dan tanpa `backend/.env`, `coba-live.html`, atau `src/uji/` (➕ D).

🎉 **Dashboard-mu hidup.** Angkanya bergerak sendiri lewat Socket.IO dengan *cookie* *login* yang sama, kartu status menunjukkan perangkat mana yang hidup dan kapan terakhir terlihat, grafik 5 menit dan *gauge* jujur terhadap skala dan celah, riwayat 7 hari termuat kurang dari sedetik, lengkap dengan tabel dan CSV, mode gelap mengikuti setelan HP, dan semuanya bisa dibuka dari HP lewat WiFi rumah. Dashboard ini masih hanya **melihat**: belum ada tombol kendali, dan viewer serta admin melihat layar yang sama. Satu modul lagi menuju dashboard v1.0, dua lagi menuju Checkpoint Fase 4 di Modul 25.

> ➡️ **Modul berikutnya:** Modul 24 — Kendali, Form Aturan, Peran, & Rute Terproteksi. Dashboard bisa menyalakan lampu dengan status "menunggu konfirmasi…", membuat aturan otomatis seperti "siram jika tanah < 30 %", memisahkan layar viewer dan admin dengan rute terproteksi React Router, dan diuji orang lain dari HP-nya lewat WiFi rumah.

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- **socket.io-client 4.8.4**: [pemasangan](https://socket.io/docs/v4/client-installation/), [opsi klien](https://socket.io/docs/v4/client-options/), [objek *socket* dan alasan putus](https://socket.io/docs/v4/client-socket-instance/), [API klien](https://socket.io/docs/v4/client-api/), [cara kerjanya](https://socket.io/docs/v4/how-it-works/), [CORS](https://socket.io/docs/v4/handling-cors/), [masalah sambungan](https://socket.io/docs/v4/troubleshooting-connection-issues/), dan [pemakaian dengan React](https://socket.io/how-to/use-with-react).
- **Zustand 5.0.16**: [`create`](https://zustand.docs.pmnd.rs/reference/apis/create) dan [pindah ke v5](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5).
- **Recharts 3.10.1** dengan `react-is` 19.3.1 ([cara pasang](https://github.com/recharts/recharts#installation)): [pindah ke 3.0](https://github.com/recharts/recharts/wiki/3.0-migration-guide), [rilis 3.3.0](https://github.com/recharts/recharts/releases/tag/v3.3.0) (`responsive`), [ukuran grafik](https://recharts.github.io/en-US/guide/sizes/), [`XAxis`](https://recharts.github.io/en-US/api/XAxis/), [`RadialBarChart`](https://recharts.github.io/en-US/api/RadialBarChart/), dan [`PolarAngleAxis`](https://recharts.github.io/en-US/api/PolarAngleAxis/).
- **date-fns 4.4.0**: [pengumuman v4](https://blog.date-fns.org/v40-with-time-zone-support/); `formatDistanceStrict` dan bahasa `id` dibaca dari kode paketnya. Jam WIB tetap dari `Intl`, seperti Modul 22.
- **React 19.3.1**: [`useEffect`](https://react.dev/reference/react/useEffect), [`StrictMode`](https://react.dev/reference/react/StrictMode), [*render* dan *commit*](https://react.dev/learn/render-and-commit), [antrean pembaruan *state*](https://react.dev/learn/queueing-a-series-of-state-updates), [`Profiler`](https://react.dev/reference/react/Profiler), serta [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) dan [`lazy`](https://react.dev/reference/react/lazy) (🔬). **React DevTools 8.0.0**: teks panel dan warna **Highlight updates** dari [kode sumbernya](https://github.com/facebook/react/tree/main/packages/react-devtools-shared/src).
- **Tailwind CSS 4.3.3**: [mode gelap](https://tailwindcss.com/docs/dark-mode), [warna](https://tailwindcss.com/docs/colors), [variabel tema](https://tailwindcss.com/docs/theme), dan [`color-scheme`](https://tailwindcss.com/docs/color-scheme). **Vite 8.3.5**: [pilihan *dev server*](https://vite.dev/config/server-options) (`--host`).
- **CSV**: [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180), Microsoft tentang [CSV UTF-8 dan BOM](https://support.microsoft.com/en-us/office/opening-csv-utf-8-files-correctly-in-excel-8a935af5-3416-4edd-ba7e-3dfd2bc4a032) dan [pemisah daftar Windows](https://learn.microsoft.com/office/troubleshoot/excel/formula-errors); MDN [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob), [`URL.createObjectURL`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static), dan [`<a download>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a).
- **Hanya untuk 🔬**: [@tanstack/react-virtual](https://tanstack.com/virtual/latest/docs/framework/react/react-virtual) 3.14.22, [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), dan [*remote debugging*](https://developer.chrome.com/docs/devtools/remote-debugging).
- **Backend v1.0** (dibaca, tidak diubah): acara Socket.IO, *room*, dan alasan putus dari [`realtime.ts`](../../proyek-rumah-pintar-mini/backend/src/services/realtime.ts); gelang 15 menit dari [`token.ts`](../../proyek-rumah-pintar-mini/backend/src/auth/token.ts); *refresh* dan Keluar dari [`routes/auth.ts`](../../proyek-rumah-pintar-mini/backend/src/routes/auth.ts); riwayat dan `bucket` dari [`routes/perangkat.ts`](../../proyek-rumah-pintar-mini/backend/src/routes/perangkat.ts) dan [`003_ringkasan_per_jam.sql`](../../proyek-rumah-pintar-mini/backend/migrasi/003_ringkasan_per_jam.sql) ([*continuous aggregate*](https://www.tigerdata.com/docs/learn/continuous-aggregates) TimescaleDB); `HOST` dan `CORS_ORIGIN` dari [`config/env.ts`](../../proyek-rumah-pintar-mini/backend/src/config/env.ts) dan [`keamanan.ts`](../../proyek-rumah-pintar-mini/backend/src/auth/keamanan.ts); bentuk data dari [Lampiran A, kontrak data 1.4](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini).
- **Modul sebelumnya**: [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md) (kiriman segera), [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md) (`isi-riwayat`), [Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md) (ember), [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md) (Socket.IO), [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md) (gelang), [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md) (backend v1.0), dan [Modul 22](../modul-22-react-dasar/README.md) (dashboard v0.1). Syarat lulus dikutip dari [Silabus §7 Modul 23](../../SILABUS.md#modul-23--dashboard-realtime-grafik-gauge-riwayat--status).

**Gambar.** Diagram dan tangkapan layar milik penulis berlisensi **CC BY 4.0**; file `.svg` diagram ada di `aset/`. Tangkapan dipotong dan disusun ulang, dengan judul, nomor, dan keterangan penulis. Rincian per file: [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-23`, `siklus-soket`, `toko-dan-selektor`, `jendela-geser-5-menit`, `visual-jujur`, `ember-per-rentang`, `jaringan-mode-hp`, `diagram-proyek-modul-23` (`.png` + `.svg`) | Diagram orisinal kurikulum, dari kode dashboard v0.2, perilaku backend v1.0 yang diuji penulis, dan dokumentasi di atas. Angka, jam, nama perangkat, dan IP `192.168.1.10` **contoh**; jalur HP di `jaringan-mode-hp` belum dicoba penulis dengan HP sungguhan. | CC BY 4.0 |
| `ws-messages-kemenangan-cepat` | Tangkapan asli `coba-live.html` lawan backend v1.0 sungguhan, bersama DevTools Edge milik tab itu (**Network** → **Socket** → **Messages**), lebar 1280 px. | Judul, nomor, dan keterangan: CC BY 4.0, Oktober 2026. socket.io-client berlisensi MIT; antarmuka DevTools milik Microsoft, tampil apa adanya untuk tujuan pendidikan. |
| `daftar-live-status`, `detail-live-grafik-gauge`, `gauge-salah-benar`, `riwayat-7-hari-tabel` | Tangkapan asli dashboard v0.2 ([`kode/frontend/`](kode/frontend/)) lawan backend v1.0 sungguhan, lebar 1280 px: lima perangkat lab Modul 21, simulator `f00d00000001` sengaja dihentikan (kartu merah, celah ±40 detik); *gauge* "salah dulu" dari salinan sementara `Gauge.tsx` tanpa `PolarAngleAxis`, pada kiriman yang sama. | CC BY 4.0, Oktober 2026. React, Vite, Tailwind CSS, Recharts, Zustand, dan socket.io-client berlisensi MIT. |
| `mode-gelap-hp-laptop` | Tangkapan asli mode gelap (emulasi `prefers-color-scheme: dark`): Detail selebar 375 px (**mode perangkat DevTools, bukan HP sungguhan**) dan **Daftar Perangkat** 1280 px, diambil ulang sesudah perbaikan tepi kiri kartu. | Sama dengan baris di atas. |

**Tentang kotak Hasilnya.** Semua perintah dan kode modul ini dijalankan penulis di Windows 11 25H2 (*build* 10.0.26200.9711) dengan Node.js 24.21.0, npm 11.19.0, dan Docker Desktop 4.77.0 (Engine 29.5.3). Dashboard diuji terhadap **backend v1.0 Modul 21 yang sungguhan** (`src/` repo tanpa perubahan) dan database baru `timescale/timescaledb:2.30.2-pg17`: 8 migrasi, akun admin dan viewer, empat perangkat terdaftar (`c0ba00000001` dicabut) plus `f00d00000002` yang tidak terdaftar, dan riwayat dari `npm run isi-riwayat` plus `CALL refresh_continuous_aggregate`. Broker MQTT-nya program kecil berkunci yang meniru Mosquitto Modul 21; pengirimnya Node 1 dan Node 2 tiruan serta simulator `alat/` untuk `f00d00000001`, dengan angka sensor contoh.

Kotak terminal direkam di konsol Windows PowerShell 5.1, bukan terminal VS Code, tanpa pengalihan keluaran, jadi ringkasan `oxlint` dan peringatan 500 kB tampil seperti di layarmu. Rekaman terminal dan perilaku memakai port asli `8080` dan `5173`. Tangkapan layar dan uji yang lebih awal (misalnya gelang 15 menit yang sungguh ditunggu dan Praktik 6) memakai port lain yang ditulis `8080` dan `5173`; port itu tidak tampak di gambar. Database dan broker lab juga berport lain; di kotak ditulis seperti biasanya: `rumahpintar-db` di `5432` dan broker di `:1883`. Browser-nya Microsoft Edge 156.0.4314.42 tanpa layar, digerakkan skrip, dengan zona diemulasi `Asia/Jakarta`; lebar 375 px ditiru mode perangkat. DevTools-nya bawaan Edge, dibuka di jendela terpisah; Chrome tidak dipakai, jadi nama saringan **Socket** di Chrome belum dicek. Panel React DevTools tidak direkam: teksnya dari kode sumbernya, dan angka *commit* Praktik 6 dihitung skrip kecil yang membaca data yang sama dengan Profiler. Bruno juga tidak direkam: permintaannya (riwayat, lampu) dikirim skrip Node dengan metode, alamat, isi, dan akun yang sama. Isi CSV dibaca dari tombol **Unduh CSV** tanpa disimpan ke disk. IP WiFi laptop disamarkan menjadi `192.168.1.10` (adaptor lain `192.168.x.x` dan `172.x.x.x`), dan jalur folder ditulis `C:\Users\kamu\…`. Kunci 🧩 diuji di lab awal penulis kode, dengan broker tiruan tanpa kunci dan tanpa Node 2.

Laptop penulis berzona UTC+8; backend dijalankan dengan `TZ=Asia/Jakarta`, jadi jam log backend tetap WIB. Selama rekaman, laptop itu **sangat sibuk** (CPU sering 100 % oleh pekerjaan lain): `npm install` sampai `in 10m`, pengirim sesekali lepas dari broker (`Keepalive timeout`, celah tak sengaja), dan `dimuat dalam … ms` Riwayat 7 hari tersebar 16–830 ms. Karena itu detik, milidetik, `built in …`, jam, nama berkas *build*, dan angka sensor di semua kotak adalah **contoh**. Yang perlu cocok adalah bentuk keluaran dan syarat lulusnya.

Yang **tidak** diuji: HP Android dan iPhone sungguhan (Praktik 9 dibuktikan dari browser laptop lewat IP WiFi-nya sendiri; layar HP, HP yang tertidur, dan gladi di HP belum dicoba); jendela izin *firewall* **Private** (setelannya sengaja tidak disentuh) serta WiFi tamu; Safari, termasuk iOS, dan Firefox; selisih jam perangkat dengan jam HP; membuka CSV di Excel, LibreOffice, atau Google Sheets; cmd.exe (`Terminate batch job (Y/N)?`) dan kebijakan eksekusi PowerShell `Restricted`; Ctrl+C dan perintah di macOS atau Linux; mode gelap dari setelan sistem sungguhan (diemulasi); serta papan dan LDR sungguhan (syarat lulus pertama dibuktikan dengan `suhu 33` dan perintah lampu).

---

[⬅️ Modul 22](../modul-22-react-dasar/README.md) · [Fase 4](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 24 — Kendali, Form Aturan, Peran, & Rute Terproteksi](../modul-24-kendali-aturan-peran/README.md) ➡️**
