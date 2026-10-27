# Modul 24 — Kendali, Form Aturan, Peran, & Rute Terproteksi

🌐 **Bahasa Indonesia** · [English](../../en/phase-4-frontend-dashboard/module-24-control-rules-roles/README.md)

*Fase 4 · Minggu 24 · Perangkat keras: **Kit A + B** atau simulator Modul 21 (`f00d00000001`), ditambah **HP** di WiFi rumah yang sama dan **satu orang penguji** · Prasyarat: **Modul 23** (dashboard v0.2 di `main`), **Modul 20** · Waktu: 11–13 jam, dicicil dalam satu minggu*

[⬅️ Modul 23](../modul-23-dashboard-realtime/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 25 ➡️](../modul-25-grafana-peta-laporan/README.md)

---

Modul 23 ditutup dengan dashboard yang **hidup**: angkanya bergerak sendiri lewat Socket.IO, lengkap dengan grafik, riwayat, dan mode HP. Namun, dashboard itu masih hanya **melihat**. Untuk menyalakan lampu, kamu tetap membuka Bruno, dan akun viewer serta admin melihat layar yang sama persis.

Tombol lampu sebenarnya sudah lama menunggu. Di [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#praktik-8--sakelar-lampu-dari-hp-20-menit), kamu menyalakan relay lampu dari HP lewat tautan `/on` dan `/off` di halaman Node 1, yang sengaja polos tanpa kata sandi: siapa pun di WiFi rumah bisa memakainya. Di [Modul 22](../modul-22-react-dasar/README.md#praktik-1--html-css-dan-javascript-dengan-tangan-membedah-halaman-modul-10-60-menit), halaman itu dibedah dan diberi tombol buatanmu, tetapi tombolnya hanya mengubah tulisan di layar. Minggu ini tombol itu akhirnya sungguhan: lewat backend, khusus admin, dan menulis `Nyala` sambil menunggu konfirmasi perangkat. Bersamanya datang sisa [janji di akhir Modul 23](../modul-23-dashboard-realtime/README.md#-checklist-kelulusan-modul-23): aturan seperti "siram jika tanah < 30 %", layar viewer dan admin yang dipisah rute terproteksi React Router, dan uji oleh orang lain dari HP-nya.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Lampu hanya bisa dinyalakan lewat Bruno. | Dashboard v0.2 hanya mengirim `ikuti` dan `berhenti` lewat soket; belum ada tombol yang memanggil `POST /devices/:id/command`. | **Tombol Lampu dan Kipas** yang langsung berganti sambil menulis `Menunggu konfirmasi perangkat…` dan mundur sendiri kalau gagal; tombol **pompa** sengaja tidak optimis (Konsep 1–2, Praktik 5) |
| Tombol **Back** keluar dari dashboard, dan **F5** di Detail kembali ke Daftar. | Semua layar tinggal di satu alamat, `http://localhost:5173`; layar yang tampil hanya diingat *state* `App`. | **React Router 8.5.0** (mode deklaratif): setiap layar beralamat sendiri (`/perangkat/:id`), jadi **Back**, **F5**, dan tautan langsung bekerja (Konsep 3, Praktik 1) |
| Sesudah *login*, kamu selalu mendarat di Daftar, dan formulirnya masih `useState` per kolom. | Satu `if` di `App.tsx` memilih formulir *login* atau seluruh dashboard; belum ada penjaga per layar. | **Rute terproteksi**: `JagaMasuk` membawa yang belum masuk ke `/masuk`, lalu ke layar semula; formulir Masuk memakai react-hook-form dan Zod (Konsep 4 dan 7, Praktik 2) |
| Viewer dan admin melihat layar yang sama; perannya hanya tertulis di kepala. | Peran sudah dibaca dari `GET /auth/me`, tetapi belum dipakai untuk memilih isi layar. | **Peran di layar**: `useAdmin()` dan `KhususAdmin` menyembunyikan tombol kendali dan layar admin dari viewer; satpam backend tetap menolak dengan `403` (Konsep 5, Praktik 3 dan 5) |
| Sesudah **Keluar**, data akun sebelumnya masih ada di memori tab. | **Keluar** v0.2 memutus soket dan menghapus sesi, tetapi tidak mengosongkan toko (batasan 1 Modul 23). | **Keluar yang tuntas**: soket diputus, sesi dihapus, toko dikosongkan lewat `kosongkanSemua`, lalu penjaga membawa layar ke `/masuk` (Konsep 6, Praktik 3) |
| Aturan hanya bisa dibuat lewat Bruno sebagai JSON, dan "siram jika tanah < 30 %" belum bisa dibuat sama sekali. | Belum ada layar aturan; backend v1.0 hanya mengenal aturan "naik di atas" untuk kipas dan lampu, dan pompa hanya bisa dijadwalkan. | **Backend 1.1.0** dengan aturan "turun di bawah" dan `DELETE /rules/:id`, lalu **daftar aturan dalam kalimat** dan **formulir aturan** yang diperiksa skema Zod yang sama dengan backend (Konsep 7–9, Praktik 6–8) |
| Saat aturan menyala atau perangkat terputus, dashboard diam saja. | Acara `kejadian` dari backend belum didengarkan, dan status yang lewat selama sambungan putus terlewat (batasan 2 Modul 23). | **Kabar di layar** (*toast*): kartu kecil yang hilang sendiri, paling banyak dua, di bawah layar HP; sesudah sambungan pulih, `GET /devices` sekali (Konsep 10, Praktik 4) |
| Dashboard belum pernah dipakai orang selain kamu. | Kontras warna dan urutan fokus belum pernah diukur, dan belum ada yang mencobanya tanpa dibantu. | **Aksesibilitas dasar** dengan Lighthouse, **pintasan di layar utama HP**, dan **uji pengguna** dari HP orang lain (Konsep 11, Praktik 9–10) |

Di akhir minggu, anggota keluarga atau teman serumah memegang HP-nya sendiri, masuk ke dashboard, menyalakan lampu, dan membuat aturan siram, sementara kamu hanya boleh membacakan tugasnya. Itulah syarat lulus dari [Silabus](../../SILABUS.md#modul-24--kendali-form-aturan-peran--rute-terproteksi): **orang lain (bukan Anda) bisa *login* dari HP-nya lewat WiFi rumah, menyalakan lampu, dan membuat aturan "siram jika tanah < 30 %" tanpa bantuan — dan akun viewer tidak melihat tombol kendali.** Modul ini memecahnya menjadi **L1** masuk dari HP orang lain, **L2** menyalakan lampu, **L3** aturan siram tanpa bantuan, dan **L4** viewer tanpa tombol kendali. Rumah Pintar Mini mendapat **dashboard v1.0** (`1.0.0`), lengkap untuk pengguna akhir di jaringan rumah. Backend naik ke **1.1.0** (aturan "turun di bawah" dan hapus aturan, tanpa migrasi), kontrak data tetap **1.4**, firmware Node 1 (v1.6.0) dan Node 2 (v1.0.0) tidak berubah, dan simulator di `alat/` hanya mendapat dua perintah ketik baru, `tanah` dan `tandon`.

![Peta jalan Modul 24. Atas, enam fase kurikulum, Fase 0 sampai Fase 5; Fase 4 Dashboard (Modul 22–25) berbingkai ungu. Modul 1–23 selesai; Modul 24 merah bertanda KAMU DI SINI, Modul 25 ungu. Catatan: dashboard menjadi alat kendali, yaitu tombol, aturan, peran, rute terproteksi, lalu dicoba orang lain dari HP-nya. Kotak Modul 24 minggu ini, 11–13 jam dicicil; Kit A + B atau simulator Modul 21 (f00d00000001), ditambah HP di WiFi rumah dan satu orang penguji. Kolom kiri: pemanasan JavaScript (alamat menjadi layar, janji yang gagal, simpan-ubah-kembalikan, periksa isian, pesan yang hilang sendiri); Kemenangan Cepat, lampu pertama dari dashboard (admin: menyala; viewer: ditolak 403); P1 satu alamat untuk setiap layar: React Router; P2 rute terproteksi dan login yang disempurnakan; P3 peran di layar dan Keluar yang tuntas, dasar L4 (layar mengenal peran lewat useAdmin, viewer ditolak 403 di Bruno); P4 kabar di layar: toast. Kolom kanan: P5 tombol yang menunggu konfirmasi perangkat, syarat L2 dan L4 (akun viewer tidak melihat tombol kendali); P6 backend 1.1: aturan turun di bawah dan hapus; P7 daftar aturan dalam kalimat; P8 form aturan: buat, ubah, nonaktifkan, hapus, syarat L3; P9 aksesibilitas, HP, dan layar utama; P10 uji kelulusan: dipakai orang lain dari HP, syarat L1–L4; Tambahan: dashboard v1.0 dan pull request dashboard v1.0 (kendali & peran) + backend 1.1. P1, P2, P3, P5, P6, P8, P10, dan pull request Tambahan bertanda bintang, wajib untuk lulus. Bawah, syarat lulus dari Silabus dengan label L1–L4: L1 orang lain (bukan Anda) bisa login dari HP-nya lewat WiFi rumah, L2 menyalakan lampu, L3 dan membuat aturan siram jika tanah kurang dari 30 % tanpa bantuan — L4 dan akun viewer tidak melihat tombol kendali. Dibuktikan di: L1 Praktik 9–10, L2 Praktik 5, L3 Praktik 6 dan 8, L4 Praktik 5 (dasarnya di Praktik 3); keempatnya diulang bersama penguji di Praktik 10. Dua jalur data: perangkat (Kit A + B, tandon terisi) atau laptop (simulator + tanah 25, Bruno). Berubah: frontend 1.0.0, backend 1.1.0, simulator alat/ (tanah, tandon); tetap: kontrak data 1.4 dan firmware. Laptop membuka http://localhost:5173; HP membuka http://IP-laptop:5173 hanya saat mode HP.](aset/peta-jalan-modul-24.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Dua jalur data, satu dashboard.** Dashboard hanya bicara dengan backend (API dan Socket.IO), bukan dengan broker atau perangkat. **Jalur perangkat**: Node 1 dan Node 2 (**Kit A + B**) lewat broker di gateway Pi; lampunya relay lampu Node 1, dan pompanya sungguh menyiram dari tandon. **Jalur laptop**: Mosquitto di laptop dan simulator Modul 21 (folder `alat`, `f00d00000001`), yang minggu ini bisa diketik `tanah 25` atau `tandon 15` ([6.5](#65-simulator-tanah-dan-tandon-diketik-dari-terminal-5-menit)) untuk mencoba aturan siram dan pompa yang ditolak tanpa Kit A. Simulator tidak punya lampu atau pompa sungguhan; buktinya kartu di layar, terminal simulator, dan log backend. **Wokwi tidak dipakai.**
> - **Di laptop, buka dashboard selalu di `http://localhost:5173`**; HP membuka `http://<IP-laptop>:5173` hanya selama **mode HP** menyala (Praktik 9–10).
> - **Lanjutan langsung Modul 23, dengan tiga akun.** Dashboard v0.2 di `main`, koleksi Bruno, dan `alat/.env` dipakai apa adanya; pekerjaan minggu ini tinggal di cabang `fitur/kendali-peran`, dan hasil setiap praktik bisa dicocokkan dengan `kode/tahap/praktik-N` (Praktik 6: `kode/backend` dan `kode/alat`). `admin@rumah.test` dan `viewer@rumah.test` dari Modul 20 dipakai bergantian. Akun ketiga, **`penguji@rumah.test`** (peran admin), khusus untuk penguji: dibuat di [10.2](#102-siapkan-uji-akun-penguji-kondisi-awal-dan-mode-hp-10-menit) dan dihapus di [10.5](#105-akun-viewer-di-hp-yang-sama-lalu-hapus-akun-penguji-dan-kembalikan-mode-laptop-10-menit) dengan [`npm run pengguna` Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#16-pengurus-akun-dari-terminal-npm-run-pengguna-10-menit), sandinya hanya di kartu kertas. Jangan meminjamkan sandi admin-mu sendiri.
> - **Tabel bukti**: tempat setiap syarat dibuktikan, dan tandanya.
>
>   | Syarat | Dibuktikan di | Yang kamu lihat |
>   | :-: | :-- | :-- |
>   | L1 | [9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit) (kamu) dan [10.3](#103--uji-pengguna-dari-hp-penguji-empat-tugas-tanpa-bantuan-25-menit) (penguji) | log backend `login: akun N (admin), sesi N, IP 192.168.…` dengan IP milik HP |
>   | L2 | [5.5](#55--lampu-dari-dashboard-rollback-dan-akun-viewer-tanpa-tombol-15-menit), lalu 10.3 | `Menunggu konfirmasi perangkat…`, lalu `Nyala`; log `lampu = true, ack ok=true dalam N ms` |
>   | L3 | [6.4](#64--npm-run-cek-npm-test-dan-npm-audit-lalu-bruno-dan-docs-110-10-menit) (backend) dan [8.5](#85--siram-otomatis-dari-formulir-tanah-25-pompa-menyiram-lalu-siap-lagi-15-menit) (formulir), lalu 10.3 | sesudah `tanah 25`, *toast* `🌱 Tanah 25 % — pompa menyiram 5 detik otomatis` |
>   | L4 | 5.5 (dasarnya [3.3](#33--ganti-akun-di-tab-yang-sama-tanpa-sisa-khusus-admin-dan-403-di-bruno-15-menit)), lalu 10.5 | akun viewer: Detail tanpa bagian **Kendali**, `/aturan/baru` menulis `Khusus admin`, Bruno `403` |
>
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **VS Code** dengan terminal `backend` (`npm run dev`, pintu 8080), `frontend` (Vite, pintu 5173; mode HP: `npm run dev:hp`), dan di jalur laptop `alat` (simulator); **Docker Desktop** dengan `rumahpintar-db`; **Chrome atau Edge** dengan DevTools; **Bruno**; serta **HP** dan penguji (Praktik 9–10).
> - **Kotak Hasilnya.** Keluaran dan tangkapan layar direkam penulis di Windows 11 25H2 (*build* 10.0.26200.9711) dengan Node.js 24.21.0, npm 11.19.0, Docker Engine 29.5.3, dan Edge 156.0.4314.42, lawan backend dan database sungguhan. Pengirimnya simulator `f00d00000001` dan Node 1 tiruan lab (program peniru firmware v1.6.0), jadi angka sensornya **contoh**; jam, lama *ack*, dan ukuran *build* di layarmu pasti berbeda. Alamat IP ditulis `192.168.1.10`; IP-mu akan berbeda. Langkah HP direkam di laptop yang membuka alamat IP WiFi-nya sendiri, dan layar HP ditiru mode perangkat DevTools (rincian di [📚 Sumber](#-sumber--atribusi-gambar)).
> - **Status jujur: penulis belum menjalankan uji oleh orang lain dari HP sungguhan.** L2–L4 dan *login* lewat IP WiFi laptop sudah direkam penulis; uji orang lain (L1–L3), pintasan layar utama di HP, dan Kit A sungguhan belum. Uji itu tugasmu di [Praktik 10](#praktik-10--uji-kelulusan-dipakai-orang-lain-dari-hp-70-menit) (lembar tugas dan catatannya disediakan), jadi modul ini tidak memuat kutipan atau waktu penguji. Kalau belum ada yang bisa menguji, tulis "L1–L3 belum diuji orang lain" di catatanmu dan jangan mencentang butir itu di [✅](#-checklist-kelulusan-modul-24).
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan VS Code dan browser (DevTools: **F12** atau **Ctrl + Shift + I**, macOS **Cmd + Option + I**; muat ulang: **F5**, macOS **Cmd + R**). **Kecuali di terminal:** menghentikan program tetap **Ctrl + C**, juga di Mac.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Menyembunyikan tombol bukan pengaman.** Layar menyembunyikan tombol kendali dari viewer demi kenyamanan; yang menjaga tetap satpam backend, yang menolak perintah akun viewer dengan `403`, juga dari Bruno ([Konsep 5](#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan)).
> 2. **Admin dari HP hanya di WiFi rumah yang kamu percaya**: dashboard masih `http://` tanpa enkripsi, dan kini sandi admin ikut lewat WiFi. Akun penguji hanya sementara (sandi di kertas, dihapus sesudah uji), dan mode laptop dikembalikan di akhir sesi ([9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit), [10.5](#105-akun-viewer-di-hp-yang-sama-lalu-hapus-akun-penguji-dan-kembalikan-mode-laptop-10-menit)). Akses dari internet menunggu HTTPS di Modul 27.
> 3. **Tetap tanpa token atau peran di `localStorage`, dan tanpa rahasia di variabel `VITE_…`.** Peran dibaca dari `GET /auth/me`; kuncinya tetap *cookie* `HttpOnly` ([Konsep 6](#6-keluar-yang-tuntas-putus-soket-hapus-sesi-kosongkan-toko)).
> 4. **Pompa: tandon terisi, jangan dijalankan kering**, karena pompa mini didinginkan air yang dipompanya. Beban tetap dari MB102, tidak pernah dari pin ESP32 (aturan emas catu daya; [5.4](#54-tombolpompa-yang-sengaja-tidak-optimis-lalu-bagian-kendali-khusus-admin-10-menit), [Konsep 9](#9-aturan-untuk-manusia-naik-atau-turun-histeresis-dan-siram-berlapis)).
> 5. **Tetap tanpa *polling*.** Kabar datang lewat Socket.IO, dan *toast* hilang sendiri dengan `setTimeout` tanpa permintaan jaringan ([Konsep 10](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp), [4.1](#41-toastts-dan-wadahtoast-di-bawah-layar-hp-di-pojok-kanan-atas-laptop-lebar-15-menit)).
> 6. **Pasang paket npm dengan versi yang tertulis**: `react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7`. Per 25 Oktober 2026, perintah tanpa versi berhenti dengan `ERESOLVE` karena `@hookform/resolvers` terbaru (6.0.0) bentrok dengan paket lain ([1.1](#11-cabang-fiturkendali-peran-dan-empat-paket-dengan-versi-tertulis-5-menit), [🚨](#-kalau-tidak-jalan)).

Seperti Modul 16–23, modul ini diawali [🔁 Pemanasan ulang JavaScript](#-pemanasan-ulang-javascript-3045-menit), kali ini bekal rute, tombol, dan formulir. Hari pertama cukup pemanasan, Kemenangan Cepat (lampu pertama dari dashboard), Konsep 3, dan Praktik 1. Sebelas konsep dibaca berpasangan dengan praktiknya; urutannya ada di awal [🧠](#-konsep-mengapa). Bagian lipat di [🚨](#-kalau-tidak-jalan) dibuka saat perlu; bagian lipat di [🔬](#-bedah-teknis-opsional) boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🏆 Kemenangan Cepat: lampu pertama dari dashboard (20 menit)](#-kemenangan-cepat-lampu-pertama-dari-dashboard-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Dari melihat ke memerintah](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack) · [2 *Optimistic UI*](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis) · [3 Satu alamat](#3-satu-alamat-untuk-satu-layar-react-router-mode-deklaratif) · [4 Rute terproteksi](#4-rute-terproteksi-penjaga-di-depan-pintu-halaman) · [5 Peran dua lapis](#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan) · [6 Keluar](#6-keluar-yang-tuntas-putus-soket-hapus-sesi-kosongkan-toko) · [7 Formulir](#7-formulir-yang-memeriksa-dirinya-react-hook-form-bukan-usestate-per-kolom) · [8 Dua penjaga](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend) · [9 Aturan untuk manusia](#9-aturan-untuk-manusia-naik-atau-turun-histeresis-dan-siram-berlapis) · [10 Kabar di layar](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp) · [11 Dipakai orang lain](#11-dipakai-orang-lain-aksesibilitas-dasar-layar-utama-dan-uji-pengguna)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Satu alamat](#praktik-1--satu-alamat-untuk-setiap-layar-react-router-50-menit) · [2 Rute terproteksi](#praktik-2--rute-terproteksi-dan-login-yang-disempurnakan-55-menit) · [3 Peran dan Keluar](#praktik-3--peran-di-layar-dan-keluar-yang-tuntas-40-menit) · [4 *Toast*](#praktik-4--kabar-di-layar-toast-40-menit) · [5 Tombol kendali](#praktik-5--tombol-yang-menunggu-konfirmasi-perangkat-75-menit) · [6 Backend 1.1](#praktik-6--backend-11-aturan-turun-di-bawah-dan-hapus-aturan-50-menit) · [7 Daftar aturan](#praktik-7--daftar-aturan-dalam-kalimat-30-menit) · [8 Form aturan](#praktik-8--form-aturan-buat-ubah-nonaktifkan-hapus-70-menit) · [9 Aksesibilitas dan HP](#praktik-9--aksesibilitas-hp-dan-layar-utama-40-menit) · [10 Uji kelulusan](#praktik-10--uji-kelulusan-dipakai-orang-lain-dari-hp-70-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-24)

## 🎯 Setelah modul ini kamu bisa…

1. **Memberi setiap layar alamatnya sendiri** dengan React Router 8.5.0 (mode deklaratif): `/perangkat`, `/perangkat/:id`, `/perangkat/:id/riwayat`, `/aturan`, dan layar `Halaman tidak ditemukan` untuk alamat yang salah ketik, sehingga **Back**, **F5**, dan tautan langsung bekerja tanpa memutus sambungan *live*.
2. **Menjaga halaman dengan rute terproteksi**: penjaga `JagaMasuk` mengantar orang yang belum masuk ke `/masuk`, lalu mengembalikannya ke layar semula sesudah ia masuk lewat formulir react-hook-form dan Zod.
3. **Membedakan layar admin dan viewer** dengan `useAdmin()` dan penjaga `KhususAdmin`, sambil paham bahwa menyembunyikan tombol **bukan** pengaman: satpam backend tetap menjawab `403`, dan kamu membuktikannya dengan Bruno.
4. **Keluar dengan tuntas**: memutus soket, menutup sesi lewat `POST /auth/logout`, mengosongkan toko, lalu membiarkan penjaga mengantar ke `/masuk`, sehingga akun berikutnya di tab yang sama tidak melihat sisa data apa pun.
5. **Membuat tombol lampu dan kipas yang menunggu konfirmasi perangkat** (`useOptimistic` + `useTransition`): tampil "sudah" dulu dengan tulisan `Menunggu konfirmasi perangkat…`, mundur sendiri kalau gagal, dan memberi satu kalimat jelas untuk setiap jawaban (ditolak perangkat, `409`, `504`, server diam). Kamu juga tahu kapan **tidak** boleh optimis: tombol pompa.
6. **Menampilkan kabar di layar** (*toast*) yang ikut dibacakan pembaca layar (`role="status"` + `aria-live`), paling banyak dua sekaligus dan di bawah layar HP. Acara `kejadian` dari backend ikut menjadi *toast*, dan status perangkat disegarkan sendiri sesudah sambungan pulih.
7. **Menaikkan backend ke 1.1.0**: aturan "turun di bawah" dengan histeresis (menyala di bawah 30 %, siap lagi di atas 35 %), perintah yang dikirim sekali, `DELETE /rules/:id`, tes yang tetap lolos, dan kebiasaan `npm audit`. Di terminal simulator, kamu juga bisa mengetik `tanah 25` dan `tandon 15`.
8. **Membuat formulir aturan yang memeriksa dirinya** dengan react-hook-form dan skema Zod yang **sama** dengan backend (salinan identik yang dijaga `npm run cek-skema`): membaca aturan dalam kalimat, lalu membuat, mengubah, menonaktifkan, dan menghapusnya, termasuk "siram jika tanah < 30 %" yang benar-benar menyiram.
9. **Memeriksa aksesibilitas dasar** dengan Lighthouse dan Color Picker (kontras 4,5:1, cincin fokus, jalur papan ketik, target sentuh 44 px), lalu memasang pintasan dashboard di layar utama HP sambil tahu mengapa itu belum aplikasi terpasang (PWA butuh HTTPS, Modul 27).
10. **Menjalankan uji pengguna sederhana**: orang lain masuk dari HP-nya lewat WiFi rumah, menyalakan lampu, dan membuat aturan siram tanpa dibantu, sedangkan akun viewer tidak melihat tombol kendali. Sesudah *lint* dan *build* lolos, dashboard v1.0 dan backend 1.1 digabung lewat *pull request*.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 23** | Dashboard v0.2 (`0.2.0`) di `main`; backend v1.0 dan kontainer **`rumahpintar-db`** di Docker Desktop; koleksi Bruno dengan `backend/bruno/.env`; `alat/.env`. Backend naik ke 1.1.0 di [Praktik 6](#praktik-6--backend-11-aturan-turun-di-bawah-dan-hapus-aturan-50-menit). |
| **Akun Modul 20** | `admin@rumah.test` dan `viewer@rumah.test` beserta sandinya, dipakai sejak Kemenangan Cepat. Akun ketiga, `penguji@rumah.test`, baru dibuat dengan `npm run pengguna` di 10.2 dan dihapus di 10.5. |
| **Sumber data** (pilih satu jalur) | **Jalur perangkat:** Node 1 dan Node 2 (Kit A + B), firmware tidak berubah. **Tandon harus berisi air**: Node 1 menolak pompa kalau isinya di bawah 20 % (`pompa ditolak: air tandon kurang`), pompa jangan dibiarkan menyala kering, dan dayanya tetap dari MB102, bukan pin ESP32. **Jalur laptop:** Mosquitto di laptop dan simulator Modul 21 (`alat`) dengan **`f00d00000001`**; mulai [6.5](#65-simulator-tanah-dan-tandon-diketik-dari-terminal-5-menit), tanah dan tandonnya bisa diketik (`tanah 25`, `tandon 15`). Wokwi tidak dipakai. |
| **HP dan satu orang penguji** | **HP** (Android atau iPhone) di **WiFi rumah yang sama**: HP-mu untuk 9.3, HP penguji untuk [Praktik 10](#praktik-10--uji-kelulusan-dipakai-orang-lain-dari-hp-70-menit). **Satu orang lain** (keluarga atau teman serumah) dengan waktu ±25 menit (lebih bila tugas diulang di 10.4), kartu kertas untuk sandi akun penguji, dan lembar di `kode/uji-pengguna/`. Belum ada penguji atau HP? Kerjakan Praktik 10 sebagai gladi di laptop (mode perangkat DevTools), jangan centang L1–L3 di [✅](#-checklist-kelulusan-modul-24) dulu, dan ulangi saat penguji ada. Penulis sendiri belum mencoba Praktik 10 bersama orang lain ataupun pintasan 9.3 di HP sungguhan. |
| **Node.js 24, VS Code, Git, Bruno** | Sama dengan Modul 23; repositori `belajar-iot` (folder `modul-24`) untuk 🔁 dan ➕ F. Di Bruno, akun viewer membuktikan `403` (3.3), dan akun admin mengirim `buat aturan siram tanah` dan `hapus aturan` (6.4). |
| **Chrome atau Edge** | DevTools: **Network** (juga **Request conditions** di 5.5), **Console**, **Lighthouse**, **Color Picker**, dan mode perangkat. Firefox dan Safari belum diuji. |
| **Internet dan akun GitHub** | Internet untuk `npm install` (1.1) dan `npm audit` (6.4); GitHub untuk *pull request* di ➕ E. |

Versi yang dipakai modul ini (Oktober 2026): **Node.js 24** dan empat paket baru yang dipasang dengan versi tertulis di [1.1](#11-cabang-fiturkendali-peran-dan-empat-paket-dengan-versi-tertulis-5-menit): **react-router 8.5.0** (mode deklaratif; `react-router-dom` tidak dipasang), **react-hook-form 7.91.0**, **@hookform/resolvers 5.9.2** (penghubung formulir dengan Zod; bukan 6.0.0, yang membuat `npm install` berhenti dengan `ERESOLVE`), dan **zod 4.6.7** (sama dengan backend). Paket Modul 22–23 tidak dinaikkan: vite 8.3.5, react dan react-dom 19.3.1, @vitejs/plugin-react 6.1.2, tailwindcss dan @tailwindcss/vite 4.3.3, typescript 6.0.3, oxlint 1.89.0, socket.io-client 4.8.4, zustand 5.0.16, recharts 3.10.1, react-is 19.3.1, dan date-fns 4.4.0. Pustaka *toast* dan Next.js tidak dipasang (Next.js hanya di 🔬); backend 1.1.0 pun tanpa paket baru. Perintahnya dijalankan di folder `frontend` pada langkah 1.1, bukan sekarang:

```text
npm install react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7
```

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya dan **Node.js 24**.

Lima kemampuan kecil JavaScript menopang rute, tombol kendali, dan formulir modul ini. Kita latih di Node.js tanpa React; **Nanti di React** menunjukkan pemakaiannya.

**Siapkan foldernya.** Buat folder **`modul-24`** di repositori **`belajar-iot`**, lalu di terminal VS Code:

```text
cd modul-24
npm init -y
npm pkg set type=module
```

Buat **`pemanasan.js`** di `modul-24`. Kodenya ada di lipatan **Isi lengkap `pemanasan.js`** sesudah Langkah 5, terbagi `// 1.` sampai `// 5.`. Ketik empat baris teratasnya, lalu per langkah ketik bagiannya sendiri (jangan salin-tempel), simpan (**Ctrl + S**), jalankan `node pemanasan.js`, dan cocokkan baris barunya dengan **Hasilnya**.

### Langkah 1 — Alamat jadi layar: `new URL` dan pola `/perangkat/:id`

Di dashboard v1.0, tiap layar punya alamat seperti `/perangkat/f00d00000001`. Di bagian `// 1.`, **`new URL(…)`** memecah alamat: **`pathname`** = jalurnya, **`searchParams.get("rentang")`** = nilai sesudah `?rentang=`. **`cocokkan(pola, jalur)`** memotong keduanya dengan `split("/")`: jumlah ruas harus sama, ruas `:id` boleh apa saja (dicatat), ruas lain harus sama. **`petaRute`** memasangkan pola dengan layar; `/perangkt` sengaja salah ketik. **Hasilnya:**

```text
--- 1. Alamat jadi layar
pathname: /perangkat/f00d00000001/riwayat
rentang : 7hari
/perangkat                       -> Daftar Perangkat {}
/perangkat/f00d00000001          -> Detail {"id":"f00d00000001"}
/perangkat/f00d00000001/riwayat  -> Riwayat {"id":"f00d00000001"}
/perangkt                        -> Halaman tidak ditemukan
```

**Nanti di React:** `<Routes>` di `App.tsx` memegang peta rute, `useParams()` memberi `{ id }`, dan alamat asing jatuh ke rute `*` ([Konsep 3](#3-satu-alamat-untuk-satu-layar-react-router-mode-deklaratif), [1.3](#13-layar-dari-alamat-srchalaman-dan-useparams-15-menit)).

### Langkah 2 — Janji yang gagal: `res.ok`, `try`, `catch`, dan `finally`

Perintah dari tombol kendali bisa gagal. Bagian `// 2.` memakai **`fetchTiruan(kode)`**, `fetch` pura-pura yang menjawab 200, 409, 504, atau gagal total (`0`, backend mati). **`fetch` tidak melempar galat untuk 409 atau 504**, jadi kitalah yang memeriksa **`res.ok`** (benar untuk 200–299) lalu melempar galat. Galat di **`try`** ditangkap **`catch`**, dan **`finally`** selalu jalan: `menunggu` pasti kembali `false`. **Hasilnya** (baris baru):

```text
--- 2. Janji yang gagal
200 berhasil: {"ack":{"ok":true}}
   menunggu = false
409 gagal  : 409 perangkat sedang offline
   menunggu = false
504 gagal  : 504 tidak ada ack dalam 5 detik
   menunggu = false
0 gagal  : Failed to fetch
   menunggu = false
```

**Nanti di React:** `minta()` di `src/api.ts` melempar `GalatApi` berkode, dan `TombolSakelar` memilih kalimat *toast* per kode ([Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack), [5.3](#53-satu-kalimat-untuk-setiap-jawaban-ditolak-perangkat-409-504-dan-server-diam-10-menit)).

### Langkah 3 — Simpan dulu, ubah, kembalikan: salinan objek dengan *spread*

Tombol optimis tampil `Nyala` sebelum perangkat menjawab dan mundur bila gagal. Di bagian `// 3.`, **`{ ...dilaporkan, lampu: true }`** membuat objek **baru**: *spread* menyalin `dilaporkan`, lalu `lampu: true` menimpa satu isinya. Karena `perintahGagal`, `akhir` mundur ke `dilaporkan` yang tetap utuh. `const salah = dilaporkan` **tidak** menyalin: dua nama, satu objek. **Hasilnya** (baris baru):

```text
--- 3. Simpan dulu, ubah, kembalikan
tampil (optimis): { lampu: true, kipas: true } | dilaporkan tetap: { lampu: false, kipas: true }
sesudah jawaban : { lampu: false, kipas: true }
tanpa salinan   : { lampu: true, kipas: true } <- yang dilaporkan ikut berubah, tidak bisa dikembalikan lagi
```

**Nanti di React:** `useOptimistic` di `TombolSakelar` menyimpan tampilan optimis, lalu kembali sendiri ke nilai toko ([Konsep 2](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis), [5.2](#52-tombolsakelar-tampil-dulu-dengan-useoptimistic-dan-usetransition-25-menit)).

### Langkah 4 — Memeriksa isian: `Number()`, `Number.isInteger`, dan `trim()`

Kotak isian memberi **teks**, padahal backend meminta angka. Bagian `// 4.` mengubah lima teks dengan **`Number()`**, lalu bertanya **`Number.isInteger`** (bulat?) dan **`Number.isNaN`** (`NaN` = bukan angka). **`periksaAturan()`** memberi galat per kolom: nama kosong sesudah **`trim()`** (buang spasi tepi), `NaN`, dan `padam_di_atas` yang tidak di atas `nyala_di_bawah` (histeresis). **Hasilnya** (baris baru):

```text
--- 4. Memeriksa isian
"30"     -> Number: 30   | bilangan bulat? true | NaN? false
""       -> Number: 0    | bilangan bulat? true | NaN? false
"  25  " -> Number: 25   | bilangan bulat? true | NaN? false
"2,5"    -> Number: NaN  | bilangan bulat? false | NaN? true
"abc"    -> Number: NaN  | bilangan bulat? false | NaN? true
[]
[
  { kolom: 'nama', pesan: 'Wajib diisi' },
  {
    kolom: 'padam_di_atas',
    pesan: 'harus lebih besar daripada nyala_di_bawah (histeresis)'
  }
]
[ { kolom: 'nyala_di_bawah', pesan: 'Isi dengan angka' } ]
[]
```

Jebakannya: `"2,5"` menjadi `NaN` (`Number()` butuh titik desimal), dan teks kosong menjadi `0`, jadi isian terakhir lolos (`[]`).

**Nanti di React:** `valueAsNumber` di react-hook-form membuat kotak kosong menjadi `NaN` (`Isi dengan angka`), dan galat per kolom datang dari salinan skema Zod backend ([Konsep 7](#7-formulir-yang-memeriksa-dirinya-react-hook-form-bukan-usestate-per-kolom), [8.1](#81-bahan-formulir-pesanramah-dan-uraikangalat400-di-aturants-serta-pembantu-kolom-di-kolomtsx-10-menit)).

### Langkah 5 — Pesan yang hilang sendiri: antrean dengan `setTimeout`

Bagian `// 5.` meniru *toast*: **`tambah()`** membuat larik **baru** berisi tiga pesan terbaru (`.slice(-PALING_BANYAK)`), dan **`setTimeout`** memanggil `hapus()` **sekali** sesudah 1,5 detik. Pesan 2 ditutup lebih dulu: **`clearTimeout`** membatalkan pewaktunya. Saat `hilang sendiri 1`, pesan 1 sudah tergeser pesan 5: `hapus()` tak menemukannya. **Hasilnya (contoh):**

```text
--- 5. Pesan yang hilang sendiri
  +   0 ms tambah 1         tampil: [Lampu menyala]
  +   0 ms tambah 2         tampil: [Lampu menyala | Pompa menyiram]
  + 508 ms ditutup 2        tampil: [Lampu menyala]
  + 509 ms tambah 3         tampil: [Lampu menyala | Tanah 25 %]
  + 509 ms tambah 4         tampil: [Lampu menyala | Tanah 25 % | Suhu 31 °C]
  + 509 ms tambah 5         tampil: [Tanah 25 % | Suhu 31 °C | Kipas menyala]
  +1530 ms hilang sendiri 1 tampil: [Tanah 25 % | Suhu 31 °C | Kipas menyala]
  +2025 ms hilang sendiri 3 tampil: [Suhu 31 °C | Kipas menyala]
  +2027 ms hilang sendiri 4 tampil: [Kipas menyala]
  +2028 ms hilang sendiri 5 tampil: []
```

**Nanti di React:** `src/toast.ts` memakai pola ini dengan `PALING_BANYAK = 2` dan 4 detik ([Konsep 10](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp), [4.1](#41-toastts-dan-wadahtoast-di-bawah-layar-hp-di-pojok-kanan-atas-laptop-lebar-15-menit)).

<details>
<summary>Isi lengkap <code>pemanasan.js</code></summary>

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 24
// Lima kemampuan kecil yang nanti dipakai di dashboard v1.0: alamat jadi layar, janji yang gagal, simpan-ubah-kembalikan,
// memeriksa isian, dan pesan yang hilang sendiri. Jalankan dengan: node pemanasan.js
import { setTimeout as tunggu } from "node:timers/promises";

// 1. Alamat jadi layar: membaca bagian-bagian alamat, lalu mencocokkannya dengan pola seperti /perangkat/:id
console.log("--- 1. Alamat jadi layar");
const alamat = new URL("http://localhost:5173/perangkat/f00d00000001/riwayat?rentang=7hari");
console.log("pathname:", alamat.pathname); // bagian jalur, tanpa nama host dan tanpa ?…
console.log("rentang :", alamat.searchParams.get("rentang")); // nilai sesudah ?rentang=

// cocokkan("/perangkat/:id", "/perangkat/abc") -> { id: "abc" }; tidak cocok -> null
function cocokkan(pola, jalur) {
  const bagianPola = pola.split("/"); // "/perangkat/:id" -> ["", "perangkat", ":id"]
  const bagianJalur = jalur.split("/");
  if (bagianPola.length !== bagianJalur.length) return null; // jumlah ruasnya harus sama
  const params = {};
  for (let i = 0; i < bagianPola.length; i++) {
    if (bagianPola[i].startsWith(":")) params[bagianPola[i].slice(1)] = bagianJalur[i]; // ruas ":id" = boleh apa saja
    else if (bagianPola[i] !== bagianJalur[i]) return null; // ruas biasa harus persis sama
  }
  return params;
}
// "peta rute" kecil: pola pertama yang cocok menentukan layarnya. Itulah inti kerja <Routes> di React Router.
const petaRute = [
  { pola: "/perangkat", layar: "Daftar Perangkat" },
  { pola: "/perangkat/:id", layar: "Detail" },
  { pola: "/perangkat/:id/riwayat", layar: "Riwayat" },
];
for (const jalur of ["/perangkat", "/perangkat/f00d00000001", alamat.pathname, "/perangkt"]) {
  const cocok = petaRute.map((r) => ({ ...r, params: cocokkan(r.pola, jalur) })).find((r) => r.params !== null);
  console.log(jalur.padEnd(32), "->", cocok ? cocok.layar + " " + JSON.stringify(cocok.params) : "Halaman tidak ditemukan");
}

// 2. Janji yang gagal: fetch TIDAK melempar galat untuk 409 atau 504; kitalah yang memeriksa res.ok
console.log("--- 2. Janji yang gagal");
// fetch tiruan: menjawab sesudah 300 ms dengan kode yang diminta, seperti POST /devices/:id/command
async function fetchTiruan(kode) {
  await tunggu(300);
  if (kode === 0) throw new TypeError("Failed to fetch"); // backend mati: HANYA ini yang membuat fetch melempar galat
  const isi = {
    200: { ack: { ok: true } },
    409: { pesan: "perangkat sedang offline" },
    504: { pesan: "tidak ada ack dalam 5 detik" },
  };
  return { ok: kode >= 200 && kode < 300, status: kode, json: async () => isi[kode] };
}
for (const kode of [200, 409, 504, 0]) {
  let menunggu = true; // di dashboard: tulisan "Menunggu konfirmasi perangkat…"
  try {
    const res = await fetchTiruan(kode);
    if (!res.ok) throw new Error(res.status + " " + (await res.json()).pesan); // ubah jawaban gagal menjadi galat
    console.log(kode, "berhasil:", JSON.stringify(await res.json()));
  } catch (err) {
    console.log(kode, "gagal  :", err.message); // di dashboard: toast
  } finally {
    menunggu = false; // finally SELALU dijalankan, berhasil atau gagal: tulisan "Menunggu…" pasti hilang
    console.log("   menunggu =", menunggu);
  }
}

// 3. Simpan dulu, ubah, kembalikan: dasar tombol optimis dan "rollback"
console.log("--- 3. Simpan dulu, ubah, kembalikan");
const dilaporkan = { lampu: false, kipas: true }; // keadaan yang dilaporkan perangkat
const tampil = { ...dilaporkan, lampu: true }; // ... = salinan BARU; lampu langsung "nyala" di layar (optimis)
console.log("tampil (optimis):", tampil, "| dilaporkan tetap:", dilaporkan);
const perintahGagal = true; // misalnya perangkat menjawab 409
const akhir = perintahGagal ? dilaporkan : tampil; // gagal: kembali ke yang dilaporkan (rollback)
console.log("sesudah jawaban :", akhir);
const salah = dilaporkan; // BUKAN salinan: dua nama untuk benda yang sama
salah.lampu = true;
console.log("tanpa salinan   :", dilaporkan, "<- yang dilaporkan ikut berubah, tidak bisa dikembalikan lagi");

// 4. Memeriksa isian: teks dari kotak isian menjadi angka, lalu diperiksa sebelum dikirim
console.log("--- 4. Memeriksa isian");
for (const teks of ["30", "", "  25  ", "2,5", "abc"]) {
  const n = Number(teks);
  const bulat = Number.isInteger(n);
  console.log(JSON.stringify(teks).padEnd(8), "-> Number:", String(n).padEnd(4), "| bilangan bulat?", bulat, "| NaN?", Number.isNaN(n));
}
// awas: Number("") = 0, bukan "kosong". Kotak <input type="number"> yang kosong dibaca react-hook-form (valueAsNumber)
// sebagai NaN, jadi di formulir aturan kotak kosong tetap tertangkap ("Isi dengan angka").
// pemeriksa buatan sendiri: hasilnya daftar galat per kolom, mirip yang nanti dibuat Zod
function periksaAturan(isian) {
  const galat = [];
  if (isian.nama.trim() === "") galat.push({ kolom: "nama", pesan: "Wajib diisi" });
  if (Number.isNaN(isian.nyala_di_bawah)) galat.push({ kolom: "nyala_di_bawah", pesan: "Isi dengan angka" });
  // dua angka sah, tetapi batas "selesai" tidak di atas batas "mulai": aturan akan menyala-padam terus
  else if (!(isian.padam_di_atas > isian.nyala_di_bawah)) {
    galat.push({ kolom: "padam_di_atas", pesan: "harus lebih besar daripada nyala_di_bawah (histeresis)" });
  }
  return galat;
}
console.log(periksaAturan({ nama: "Siram", nyala_di_bawah: 30, padam_di_atas: 35 })); // [] = lolos
console.log(periksaAturan({ nama: "   ", nyala_di_bawah: 30, padam_di_atas: 25 })); // nama kosong + histeresis terbalik
console.log(periksaAturan({ nama: "Siram", nyala_di_bawah: Number("abc"), padam_di_atas: 35 })); // NaN tertangkap
console.log(periksaAturan({ nama: "Siram", nyala_di_bawah: Number(""), padam_di_atas: 35 })); // []: kotak KOSONG lolos (0)!

// 5. Pesan yang hilang sendiri: antrean pesan dengan setTimeout (SEKALI jalan, bukan setInterval)
console.log("--- 5. Pesan yang hilang sendiri");
const LAMA_TAMPIL = 1500; // milidetik (di dashboard: 4000)
const PALING_BANYAK = 3; // (di dashboard: 2)
let daftar = [];
let nomor = 0;
const mulai = Date.now();
function cetak(kejadian) {
  const ms = String(Date.now() - mulai).padStart(4);
  console.log(`  +${ms} ms ${kejadian.padEnd(16)} tampil: [${daftar.map((t) => t.pesan).join(" | ")}]`);
}
function tambah(pesan) {
  const id = ++nomor;
  daftar = [...daftar, { id, pesan }].slice(-PALING_BANYAK); // lebih dari 3: yang paling lama dibuang
  const pewaktu = setTimeout(() => hapus(id, "hilang sendiri"), LAMA_TAMPIL);
  cetak("tambah " + id);
  return pewaktu;
}
function hapus(id, sebab) {
  daftar = daftar.filter((t) => t.id !== id); // sudah tidak ada? tidak terjadi apa-apa
  cetak(sebab + " " + id);
}
tambah("Lampu menyala");
const pewaktuDua = tambah("Pompa menyiram");
await tunggu(500);
clearTimeout(pewaktuDua); // ditutup dengan tombol ✕: pewaktunya dibatalkan supaya tidak berjalan sia-sia
hapus(2, "ditutup");
tambah("Tanah 25 %");
tambah("Suhu 31 °C");
tambah("Kipas menyala"); // pesan keempat yang tampil: pesan nomor 1 terdorong keluar
await tunggu(LAMA_TAMPIL + 200); // tunggu semua pewaktu selesai
```

</details>

<details>
<summary>Kunci uji dirimu</summary>

1. **Tambahkan `"/perangkat/abc"` ke daftar jalur Langkah 1. Apa yang dicetak?** `Detail {"id":"abc"}`. Pencocok hanya membaca bentuk alamat; layarlah yang menulis `Perangkat abc tidak ditemukan.`
2. **Hapus baris `if (!res.ok) throw …`. Apa baris 409?** `409 berhasil: {"pesan":"perangkat sedang offline"}`: gagal tercatat berhasil.
3. **Tukar urutannya: `{ lampu: true, ...dilaporkan }`. Apa baris `tampil (optimis)`?** `{ lampu: false, kipas: true }`: yang belakangan menimpa yang di depan.
4. **Hapus baris `clearTimeout(pewaktuDua);`. Apa yang berubah?** Muncul `hilang sendiri 2`, tetapi daftarnya tetap: `hapus()` yang telat aman, jadi `toast.ts` tanpa `clearTimeout`.

Kembalikan setiap baris yang kamu ubah.

</details>

## 🏆 Kemenangan Cepat: lampu pertama dari dashboard (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `rumah-pintar-mini` dengan terminal `backend`, `frontend` (Vite), dan satu terminal kosong untuk Git, ditambah broker dan simulator di jalur laptop; **Docker Desktop**; serta **Chrome atau Edge**.

Lampu di dashboard v0.2 baru bisa dilihat. Sebelum memasang paket apa pun, buktikan dua inti minggu ini dengan satu tombol sementara: perintah dari browser adalah `POST` yang menunggu jawaban (*ack*) perangkat, dan peran dijaga backend, bukan tombolnya. Kerjakan di dashboard v0.2 apa adanya, sebelum cabang baru di Praktik 1.

### Langkah 1 — Nyalakan semuanya, lalu masuk sebagai admin (4 menit)

Sama dengan Kemenangan Cepat Modul 23; setiap terminal baru mulai di folder `rumah-pintar-mini`.

1. Nyalakan `rumahpintar-db` di Docker Desktop.
2. Jalur perangkat: nyalakan Node 1. Jalur laptop: `cd edge` lalu `mosquitto -v -c mosquitto-lan.conf`, lalu di terminal lain `cd alat` dan `node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1`; tunggu `f00d00000001: online`.
3. `cd backend` lalu `npm run dev`; tunggu `tersambung ke broker … sebagai backend`.
4. `cd frontend` lalu `npm run dev`, buka **`http://localhost:5173`**, masuk dengan `admin@rumah.test`, lalu klik kartu `f00d00000001` (jalur perangkat: kartu Node 1-mu).

### Langkah 2 — Tulis `TombolPertama.tsx`, lalu pasang di Detail Perangkat (6 menit)

Di panel Explorer VS Code, klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`TombolPertama.tsx`**, lalu ketik isinya (atau buka [`kode/kemenangan-cepat/frontend/src/components/TombolPertama.tsx`](kode/kemenangan-cepat/frontend/src/components/TombolPertama.tsx) di GitHub, klik **Copy raw file**, lalu tempel).

```tsx
// TombolPertama.tsx - Kemenangan Cepat Modul 24: SATU tombol sementara yang menyuruh backend menyalakan lampu.
// Tanpa paket baru: hanya fetch POST /devices/:id/command, lalu jawaban backend ditulis apa adanya di bawah tombol.
// Akun admin: 200 + ack dari perangkat. Akun viewer: 403, karena backend yang menjaga peran, bukan tombolnya.
// Sesudah selesai mencoba, HAPUS berkas ini dan dua baris TombolPertama di DetailPerangkat.tsx. Tombol yang sesungguhnya
// (dengan "Menunggu konfirmasi perangkat…") dibuat di Praktik 5.
import { useState } from "react";
import { BASE } from "../api";

export default function TombolPertama({ deviceId }: { deviceId: string }) {
  const [hasil, setHasil] = useState(""); // jawaban backend, ditulis apa adanya

  async function nyalakanLampu() {
    setHasil("Mengirim… (backend menunggu jawaban perangkat, paling lama 5 detik)");
    try {
      const res = await fetch(BASE + "/devices/" + deviceId + "/command", {
        method: "POST",
        credentials: "include", // bawa cookie login: dari situ backend tahu siapa kita dan apa perannya
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "lampu", nilai: true }), // perintah yang sama dengan Bruno "nyalakan lampu"
      });
      // 401 = gelang 15 menit sudah habis (tombol percobaan ini tidak memperbaruinya): muat ulang halaman, lalu coba lagi
      setHasil(res.status + " " + (await res.text()));
    } catch {
      setHasil("Tidak bisa menghubungi backend: apakah backend menyala?");
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-amber-500 bg-white p-3 dark:bg-slate-800">
      <button
        type="button"
        onClick={nyalakanLampu}
        className="min-h-11 rounded-lg bg-amber-400 px-4 font-medium text-slate-900 hover:bg-amber-300"
      >
        Nyalakan lampu (percobaan)
      </button>
      <p className="mt-2 font-mono text-xs break-all text-slate-700 dark:text-slate-200">{hasil}</p>
    </div>
  );
}
```

- **`fetch(BASE + "/devices/" + deviceId + "/command", …)`** memanggil rute dan isi yang sama dengan Bruno `nyalakan lampu`. `BASE` dari `api.ts` = alamat backend, `http://localhost:8080`.
- **`credentials: "include"`** membawa *cookie* gelang, jadi backend tahu siapa yang mengetuk dan apa perannya. Tombolnya sendiri tidak memeriksa peran.
- **`setHasil(res.status + " " + …)`** menulis jawaban backend mentah-mentah di bawah tombol.

Lalu buka `frontend/src/components/DetailPerangkat.tsx` dan tambahkan dua baris: impornya di bawah `import TerakhirDilihat …`,

```tsx
import TombolPertama from "./TombolPertama"; // Kemenangan Cepat Modul 24 (sementara)
```

dan tombolnya tepat di bawah `</p>` yang menutup baris status (berisi `<TerakhirDilihat … />`), di atas komentar grafik:

```tsx
      <TombolPertama deviceId={id} />
```

Simpan kedua berkas (**Ctrl + S**); berkas utuhnya: [`kode/kemenangan-cepat/frontend/src/components/DetailPerangkat.tsx`](kode/kemenangan-cepat/frontend/src/components/DetailPerangkat.tsx). Di bawah baris status Detail kini ada tombol kuning **Nyalakan lampu (percobaan)**.

### Langkah 3 — Ketuk sebagai admin: lampu menyala, kartu berganti sendiri (4 menit)

Kartu **Lampu** menulis `Mati` (belum ada? tunggu kiriman berikutnya, ±10 detik). Ketuk **Nyalakan lampu (percobaan)** sekali.

**Hasilnya (contoh):** sekejap `Mengirim… (backend menunggu jawaban perangkat, paling lama 5 detik)`, lalu:

```text
200 {"id":"c-20261025-051701-4","lama_ms":12,"ack":{"id":"c-20261025-051701-4","ts":"2026-10-25T05:17:01Z","ok":true,"state":{"kipas":false,"lampu":true,"pompa":false,"tirai":90}}}
```

Kartu **Lampu** berganti ke `Nyala` tanpa muat ulang (di lab ±0,1 detik sesudah `200`), dan terminal `backend` menulis, antara lain:

```text
[12:17:01] INFO: perintah c-20261025-051701-4 (api) ke f00d00000001: lampu = true, ack ok=true dalam 12 ms
```

`200` = perangkat menjawab dalam 5 detik, `"ok":true` = perintahnya diterima, `state` = keadaan yang dilaporkan perangkat. Di jalur perangkat, relay lampu Node 1 ikut menyala. Tombol ini tidak menyentuh kartu: kartu berganti karena perangkat langsung mengirim bacaan baru berisi `state`, yang diantar soket Modul 23 ke toko.

> [!TIP]
> `401 …`? Gelang 15 menit habis (tombol ini tidak memperbaruinya): tekan **F5**, buka lagi Detail-nya, lalu ketuk lagi. `409 …`? Perangkatnya belum `online`, atau yang terbuka Node 2, yang tidak menerima perintah. Arti setiap jawaban ada di [Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack).

### Langkah 4 — Ketuk sebagai viewer: `403` dari satpam backend (4 menit)

1. Klik **Keluar**, lalu masuk dengan `viewer@rumah.test`.
2. Buka lagi Detail `f00d00000001`. Tombol percobaan tetap tampil, karena tombol ini tidak memeriksa peran.
3. Ketuk tombolnya.

**Hasilnya:**

```text
403 {"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}
```

Kartu **Lampu** tetap `Nyala`, dan terminal `backend` menulis (contoh):

```text
[12:17:02] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices/f00d00000001/command
```

Tidak ada baris `perintah …`: satpam menolak sebelum rutenya bekerja, jadi perintah tidak pernah sampai ke lampu. Menyembunyikan tombol hanya soal kenyamanan; pengamannya satpam ini ([Konsep 5](#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan)).

### Langkah 5 — Hapus `TombolPertama.tsx` (2 menit)

Tombol tadi kasar: hanya bisa menyalakan, jawabannya JSON mentah, dan tampil juga untuk viewer. Tombol sungguhan dibangun di [5.2](#52-tombolsakelar-tampil-dulu-dengan-useoptimistic-dan-usetransition-25-menit), dan berkas percobaan tidak boleh ikut Git ([➕ D](#d-tambahkan-butir-modul-24-ke-templat-pull-request)).

1. Hapus dua baris `TombolPertama` di `DetailPerangkat.tsx`, lalu simpan. Lakukan ini dulu: kalau berkasnya dihapus lebih dulu, Vite menampilkan galat impor.
2. Di panel Explorer, klik kanan **`TombolPertama.tsx`** → **Delete**, lalu setujui konfirmasinya.
3. Di terminal kosong, jalankan `git status`: kedua berkas itu tidak lagi disebut.

Dalam 20 menit, satu ketukan di browser menyalakan lampu lewat backend, dan akun viewer ditolak satpam.

> ➡️ **Berikutnya:** baca [Konsep 3](#3-satu-alamat-untuk-satu-layar-react-router-mode-deklaratif), lalu kerjakan [Praktik 1 — Satu alamat untuk setiap layar](#praktik-1--satu-alamat-untuk-setiap-layar-react-router-50-menit). Apa yang terjadi di balik ketukanmu tadi diceritakan [Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack), yang dibaca bersama Konsep 2 sebelum Praktik 5.

## 🧠 Konsep "Mengapa"

Sebelas konsep ini tidak perlu dibaca sekaligus, dan urutan bacanya tidak sama dengan nomornya. Bacalah berpasangan dengan praktiknya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 3 → Praktik 1 (satu alamat untuk setiap layar)
2. Konsep 4 dan Konsep 7 → Praktik 2 (rute terproteksi dan *login* yang disempurnakan)
3. Konsep 5–6 → Praktik 3 (peran di layar dan Keluar yang tuntas)
4. Konsep 10 → Praktik 4 (kabar di layar: *toast*)
5. Konsep 1–2 → Praktik 5 (tombol yang menunggu konfirmasi perangkat)
6. Konsep 9 → Praktik 6 (backend 1.1: aturan "turun di bawah" dan hapus aturan)
7. Konsep 8 → Praktik 7 (daftar aturan dalam kalimat) dan Praktik 8 (form aturan)
8. Konsep 11 → Praktik 9 (aksesibilitas, HP, dan layar utama) dan Praktik 10 (uji kelulusan)

Konsep 1–2 bernomor paling depan karena keduanya inti modul ini, dari melihat ke memerintah, tetapi baru dibaca sesudah Praktik 4, tepat sebelum tombol kendali dibuat di Praktik 5. Kalau penasaran apa yang terjadi saat tombol Kemenangan Cepat tadi diketuk, Konsep 1 boleh dibaca sekarang juga. Konsep 7 dipakai dua kali: formulir Masuk (Praktik 2) dan formulir aturan (Praktik 8); Konsep 9 juga dipakai lagi di Praktik 7 dan 8. Potongan kode di bagian konsep cukup dibaca; semuanya ditulis dan dijalankan di praktik.

### 1. Dari melihat ke memerintah: perjalanan satu ketukan sampai *ack*

Sampai Modul 23, dashboard hanya **melihat**. `GET` mengambil daftar dan riwayat, Socket.IO mendorong bacaan baru, dan lampu atau kipas tampil sebagai kartu yang hanya bisa dibaca; perintahnya masih lewat Bruno. Di [Kemenangan Cepat](#-kemenangan-cepat-lampu-pertama-dari-dashboard-20-menit), tombol percobaan `TombolPertama` mengirim perintah pertama dari browser: akun admin mendapat `200` beserta `ack`, lalu kartu Lampu berganti sendiri sesaat kemudian, sedangkan akun viewer mendapat `403`. Konsep ini menceritakan apa yang terjadi di antara ketukan dan jawaban itu.

**Perintah lewat `POST`, bukan lewat soket.** Socket.IO di dashboard tetap satu arah, dari backend ke layar ([Modul 23 Konsep 1](../modul-23-dashboard-realtime/README.md#1-didorong-bukan-bertanya-data-live-lewat-socketio)). Tombol kendali memakai rute HTTP yang sama dengan Bruno, `POST /devices/:id/command`, karena dua alasan:

1. **Satpam peran berjaga di pintu HTTP.** Akun viewer ditolak `403` sebelum isi perintahnya dibaca ([Modul 20 Konsep 6](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#6-satpam-di-setiap-pintu-peran-admin-dan-viewer)). Pintu Socket.IO memeriksa gelang, tetapi tidak memeriksa peran.
2. **Nasib perintah kembali di jawaban yang sama.** Backend menahan permintaan itu sampai perangkat menjawab, jadi satu `await` cukup untuk tahu hasilnya.

**Perjalanan satu ketukan.** Polanya sudah kamu kenal dari Modul 19: perintah → *ack* → batas waktu ([Modul 19 Konsep 3](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#3-perintah--ack--batas-waktu-perintah-yang-tahu-nasibnya)). Bedanya, kini pemicunya jempol di layar:

1. **Ketuk.** Tombol **Lampu** langsung menunjukkan `Nyala` dengan tulisan `Menunggu konfirmasi perangkat…` (cara "tampil dulu" ini dibahas Konsep 2).
2. **Kirim.** `kirimPerintah()` di `src/api.ts` mengirim `POST /devices/f00d00000001/command` berisi `{"target":"lampu","nilai":true}`, lengkap dengan *cookie* gelang.
3. **Ke perangkat.** Satpam memeriksa gelang dan peran. Sesudah itu, satu pintu `perintahkan()` memeriksa perangkatnya: terdaftar, pernah terdengar, Node 1, `online`, broker tersambung, dan tidak ada perintah lampu lain yang masih ditunggu. Kalau semuanya lolos, backend menerbitkan `cmd` ke `rpm/<id>/cmd`, lalu menunggu.
4. **Jawaban perangkat.** Node 1 (atau simulator) mengerjakannya, lalu menerbitkan `ack` dengan `id` perintah yang sama ke `rpm/<id>/ack`, berisi `ok` dan `state` keempat aktuatornya. Backend menunggu paling lama **5 detik**.
5. **Jawaban HTTP.** Baru sekarang `POST` tadi dijawab: `200` berisi `ack`, atau kode galat.

Di lab penulis, perangkat tiruan dan simulator di laptop yang sama menjawab dalam beberapa milidetik sampai ±¼ detik, dan tiruan yang sengaja diperlambat dalam ±2,5–3 detik. Lama jawaban Node 1 sungguhan lewat WiFi tidak diukur penulis; yang pasti, batasnya 5 detik.

![Diagram satu ketukan tombol Lampu: tampil dulu, lalu menunggu jawaban (Konsep 1–2); POST /devices/:id/command menunggu ack paling lama 5 detik; contoh f00d00000001, lampu Mati. Atas, lima tahap: 1 Ketuk, tombol langsung Nyala dengan tulisan Menunggu konfirmasi perangkat… (useOptimistic + useTransition); 2 Kirim, POST berisi target lampu, nilai true, hanya admin (viewer 403); 3 Ke perangkat, backend 1.1 menerbitkan rpm/id/cmd lewat broker lalu menunggu; 4 Jawaban perangkat di rpm/id/ack berisi ok dan state, paling lama 5 detik (lab, perangkat tiruan di laptop: 6–8 ms; tiruan lambat 2,5 detik); 5 Jawaban HTTP, 200 berisi ack atau kode galat. Selama menunggu tombol tidak bisa diketuk lagi (aria-disabled), jadi tidak ada 409 karena klik ganda. Tabel lima jawaban, kolom tombol sesudahnya, toast (teks persis), dan artinya. 200 ack.ok true: Nyala, tanpa toast, keadaan diambil dari ack.state. 200 ack.ok false: mundur ke Mati (rollback), toast Lampu: perangkat menolak (…); contoh nyata pada pompa: pompa ditolak: air tandon kurang; tidak dikirim ulang. 409: mundur, toast Lampu: perangkat sedang offline, perintah tidak dikirim; perintah tidak dikirim karena perangkat baru saja offline, kunci dicabut, Node 2, atau perintah lain masih menunggu (tab atau HP lain); biasanya tombol sudah nonaktif lebih dulu; 403, 404, 503 sama, toast berisi pesan server. 504 (jingga): Mati sesuai keadaan terlapor, toast Lampu: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.; lebih dari atau sama dengan 30 detik kemudian lampu Nyala sendiri dengan toast lampu f00d00000001 dilaporkan false, padahal diinginkan true (api); perintah dikirim lagi. BUKAN dibatalkan: server mengingat keinginan Nyala dan mengirim ulang saat perangkat terdengar (lab +31,5 detik). Galat jaringan: mundur, toast Lampu: server tidak menjawab.; dicoba dengan DevTools Request conditions. Bawah kiri: tab atau HP lain tahu lewat telemetry, karena dari server hanya ada acara telemetry, status, dan kejadian, tanpa ack; state.lampu mengganti tombol di layar lain paling lambat ±2 detik kemudian (lab: browser lain berganti kurang dari ½ detik sesudah klik). Bawah kanan: pompa sengaja TIDAK optimis, siram yang diulang = menyiram dua kali; judul tetap Diam sampai ack.ok true, tombol nonaktif selama menyiram; tanpa ack, perintah pompa tidak dikirim ulang.](aset/perjalanan-perintah.png)

**`200` belum tentu berhasil.** `200` hanya berarti "perangkat menjawab". Jawabannya bisa "ya", bisa juga "tidak". Inilah semua jawaban rute perintah, dengan teks `pesan` persis dari backend:

| Jawaban | Artinya | Contoh `pesan` |
| :--- | :--- | :--- |
| `200`, `ack.ok: true` | perangkat mengerjakannya; keadaan sungguhan ada di `ack.state` | — |
| `200`, `ack.ok: false` | perangkat **menolak**; alasannya di `ack.pesan` | `pompa ditolak: air tandon kurang` |
| `409` | tidak dikirim, karena salah satu dari lima sebab: perangkat tidak `online`, kuncinya dicabut, Node 2, jenisnya belum diketahui, atau perintah sebelumnya untuk aktuator yang sama masih ditunggu (misalnya dari tab atau HP lain) | `perangkat sedang offline, perintah tidak dikirim`, `perintah lampu sebelumnya masih menunggu ack` |
| `404` | perangkat belum terdaftar, atau belum pernah terdengar sejak backend menyala | `perangkat f00d00000009 belum terdaftar` |
| `503` | backend putus dari broker | `backend sedang tidak tersambung ke broker` |
| `504` | 5 detik lewat tanpa `ack` | `tidak ada ack untuk <id-perintah> dalam 5 detik` |
| `403` | akun viewer, atau halaman dibuka dari alamat yang tidak diizinkan | `akun viewer hanya boleh melihat; perintah dan perubahan khusus admin` |
| `401` | belum masuk, atau gelang habis dan *refresh* gagal | `belum login atau sesi sudah habis: login lewat POST /auth/login` |

Satu kemungkinan lagi tidak datang dari backend: permintaannya tidak sampai sama sekali (backend mati, WiFi putus). `minta()` di `src/api.ts` melaporkannya sebagai `GalatApi` berkode `0`, dan *toast* menulis `Lampu: server tidak menjawab.`

Karena `ack` menentukan tampilan tombol, isinya diperiksa sungguhan, bukan sekadar dipercaya. `kirimPerintah()` (Praktik 5.1) memeriksanya dengan skema `Ack` yang sama dengan backend, salinan `kontrak.ts` di `src/skema/`:

```ts
export async function kirimPerintah(deviceId: string, perintah: PerintahSet): Promise<Ack> {
  const jawaban = await minta<{ ack?: unknown }>("/devices/" + deviceId + "/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(perintah),
  });
  // Isi ack diperiksa dengan skema Ack yang SAMA dengan backend (salinan di skema/kontrak.ts), bukan sekadar dipercaya.
  // safeParse tidak melempar galat: hasilnya { success: true, data } atau { success: false, error }.
  const hasil = Ack.safeParse(jawaban.ack);
  if (!hasil.success) throw new GalatApi(200, "Jawaban server tidak dikenal.");
  return hasil.data;
}
```

- **`minta()`** sudah melempar `GalatApi` untuk semua jawaban selain 2xx, lengkap dengan `pesan` dari backend. Yang sampai ke baris `Ack.safeParse` hanya jawaban `200`.
- **`Ack.safeParse`** memastikan `ack` berisi `ok`, `state`, dan seterusnya. `kirimPerintah()` mengembalikan `ack`, bukan `true`/`false`, karena pemanggilnya masih harus membaca `ack.ok`: tombol yang mendapat `ok: false` harus mundur (Konsep 2).

**Dua *ack* yang berbeda.** Di Modul 23, dashboard sudah menunggu jawaban Socket.IO untuk `ikuti`, yang hanya berarti "backend menerima permintaanmu". `ack` di konsep ini datang dari **perangkat** lewat MQTT dan berarti "perangkat sudah mengerjakannya" (atau menolak, dengan alasan). Kata yang sama, pembicara yang berbeda.

**Layar lain tahu lewat `telemetry`.** `ack` hanya kembali ke tab yang mengetuk. Dari backend ke dashboard hanya ada tiga acara Socket.IO, `telemetry`, `status`, dan `kejadian`; tidak ada acara `ack`. Tab lain, atau HP penghuni lain, tahu lampu sudah menyala dari objek `state` di `telemetry` berikutnya. Node 1 v1.6.0 dan simulator mengirim `telemetry` segera begitu keadaan aktuator berubah, jadi kabar itu tiba paling lambat ±2 detik kemudian; di lab penulis, dashboard di browser lain berganti kurang dari ½ detik sesudah klik. Perintah dari tombol juga tidak dicatat di buku kejadian (yang tercatat hanya perintah aturan, jadwal, dan kiriman ulang server), jadi ketukanmu tidak memunculkan *toast* di layar orang lain.

Rinciannya di [5.1](#51-salin-kontrakts-lalu-kirimperintah-yang-memeriksa-jawaban-dengan-acksafeparse-15-menit) dan [5.3](#53-satu-kalimat-untuk-setiap-jawaban-ditolak-perangkat-409-504-dan-server-diam-10-menit). Yang ingin melihat keinginan dan laporan perangkat sesudah `504` lewat `GET /devices/:id/state` bisa membuka [🔬](#-bedah-teknis-opsional) *Sesudah `504`* dan [Modul 19 Konsep 4](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#4-keadaan-yang-diinginkan-lawan-yang-dilaporkan).

### 2. *Optimistic UI*: tampil dulu, mundur kalau gagal, dan kapan tidak boleh optimis

Tombol yang "jujur" menunggu jawaban dulu: diketuk, diam sampai 5 detik, baru berganti. Untuk sakelar, diam seperti itu terasa rusak, dan orang cenderung mengetuk lagi. ***Optimistic UI*** (tampilan optimis) membalik urutannya. Layar menampilkan **keinginanmu** dulu, memberi tanda bahwa jawabannya masih ditunggu, lalu menggantinya dengan **laporan** perangkat begitu `ack` tiba (diinginkan lawan dilaporkan, [Modul 19 Konsep 4](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#4-keadaan-yang-diinginkan-lawan-yang-dilaporkan)). Kalau perintahnya gagal, tombol **mundur** (*rollback*) ke keadaan sebelum diketuk, dan sebuah *toast* menjelaskan sebabnya.

Tombol optimis kita, `TombolSakelar` untuk lampu dan kipas, memegang tiga janji:

1. **Langsung berganti.** `Mati` menjadi `Nyala` saat itu juga.
2. **Jujur bahwa belum pasti.** Di bawahnya tertulis `Menunggu konfirmasi perangkat…`, dan selama itu tombolnya tidak bisa diketuk lagi (`aria-disabled`), jadi ketukan ganda tidak berbuah `409`.
3. **Yang terakhir bicara tetap perangkat.** Begitu jawaban tiba, tombol menampilkan keadaan dari toko, yaitu isi `ack.state` atau `telemetry`, bukan tebakan tadi.

**React 19 yang mengerjakan mundurnya.** Dua alat bawaan React dipakai bersama: `useOptimistic` (nilai sementara selama menunggu) dan `useTransition` (penanda "sedang menunggu"). Potongan `src/components/TombolSakelar.tsx` (Praktik 5.2; `…` = baris yang dilewati):

```tsx
  // tampil = nilai, KECUALI selama perintah menunggu jawaban: saat itu tampil = keinginan kita (optimis)
  const [tampil, setTampil] = useOptimistic(nilai);
  // menunggu = true selama Action di bawah belum selesai (dari ketukan sampai jawaban backend tiba)
  const [menunggu, mulai] = useTransition();
  …
    mulai(async () => {
      setTampil(baru); // langsung berganti di layar, sebelum perangkat menjawab
      try {
        const ack = await kirimPerintah(deviceId, { target, nilai: baru });
        …
        useToko.getState().terapkanKeadaan(deviceId, ack.state);
        if (!ack.ok) toast(label + ": perangkat menolak (" + (ack.pesan ?? "tanpa alasan") + ")", "galat");
      } catch (err) {
        toast(pesanGagal(err, label), "galat");
        …
      }
      …
    });
```

- **`nilai`** adalah keadaan yang **dilaporkan** perangkat, dibaca dari toko. `useOptimistic(nilai)` memberi `tampil`, yang sama dengan `nilai`, **kecuali** selama ada *Action* (butir berikut) yang berjalan.
- **`mulai(async () => …)`** menjalankan *Action*, yaitu fungsi `async` di dalam **transisi** (pembaruan yang boleh ditunda React). Selama ia belum selesai, `menunggu` bernilai `true`, dan yang tampil adalah nilai dari `setTampil(baru)`. `baru` berisi `!nilai`, kebalikan keadaan terlapor saat diketuk (barisnya termasuk yang dilewati).
- **Berhasil:** `terapkanKeadaan` menulis `ack.state` ke toko, `nilai` ikut berganti, *Action* selesai, dan `tampil` kembali sama dengan `nilai`: `Nyala`.
- **Gagal:** toko tidak berubah. Begitu *Action* selesai, React membuang tampilan optimis dan kembali ke `nilai` lama: `Mati`. Mundurnya terjadi **tanpa satu baris kode pun**. Untuk `ack.ok: false`, `ack.state` yang masuk toko masih berisi keadaan lama, jadi hasilnya sama.
- **`try`/`catch` wajib.** Galat yang lolos dari *Action* tidak didiamkan React, tetapi diserahkan ke *error boundary* (komponen penangkap galat layar). Daripada mengandalkannya, setiap galat ditangkap di sini dan diubah menjadi *toast*.

Di [🔁 Langkah 3](#langkah-3--simpan-dulu-ubah-kembalikan-salinan-objek-dengan-spread), kamu menyimpan dulu, mengubah salinan, lalu mengembalikannya dengan tangan; `useOptimistic` mengerjakan hal yang sama untukmu. Di uji penulis lawan backend sungguhan, tampilan optimis tetap `Nyala` walau `telemetry` berisi keadaan lama tiba di tengah penantian, *StrictMode* tetap mengirim satu `POST` per ketukan, dan pindah layar saat menunggu aman: hasilnya tetap masuk toko. Sejak Praktik 5, `<BrowserRouter useTransitions={false}>` membuat layar baru tak ikut menunggu tombol (5.2).

**Satu kalimat untuk setiap jawaban.** Lihat lagi tabel lima jawaban di gambar Konsep 1. Akibatnya di tombol:

| Jawaban | Tombol sesudahnya | *Toast* (teks persis) |
| :--- | :--- | :--- |
| `200`, `ack.ok: true` | tetap `Nyala` | — |
| `200`, `ack.ok: false` | mundur ke `Mati` | `Lampu: perangkat menolak (…)`, alasannya dari `ack.pesan` |
| `409`, `404`, `503`, `403` | mundur | `Lampu: ` + pesan backend, misalnya `Lampu: perangkat sedang offline, perintah tidak dikirim` |
| `504` | keadaan terlapor (`Mati`) | `Lampu: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.` |
| kode `0` | mundur | `Lampu: server tidak menjawab.` (dicoba dengan panel DevTools **Request conditions** di Praktik 5.5) |

**`504` bukan "dibatalkan".** Untuk lampu, kipas, dan tirai, backend mencatat **keinginan** (misalnya `lampu: true`) sebelum mengirim `cmd`. Tanpa `ack`, keinginan itu tetap diingat. Begitu perangkat terdengar lagi dan sudah lewat paling sedikit 30 detik sejak percobaan terakhir, backend mengirim ulang perintahnya sendiri (rekonsiliasi Modul 19). Di uji penulis, lampu menyala sendiri ±31–40 detik sesudah diketuk (jeda 30 detik, ditambah menunggu kabar berikutnya dari perangkat), tanpa ada yang menyentuh tombol, disertai *toast* dari buku kejadian `lampu <id> dilaporkan false, padahal diinginkan true (api); perintah dikirim lagi`. Karena itu, kalimat *toast* `504` sengaja berbunyi "server akan mencoba lagi", bukan "gagal" atau "dibatalkan": tombol menampilkan keadaan yang benar saat ini, dan *toast* memberi tahu yang akan terjadi. Kalau kamu berubah pikiran, tunggu lampunya menyala sendiri, lalu ketuk untuk mematikannya; ketukan saat tombol masih `Mati` justru mengirim `Nyala` lagi. Sebaliknya, `ack.ok: false` menghapus keinginan itu, jadi perintah yang ditolak perangkat tidak dikirim ulang.

**Kapan tidak boleh optimis: pompa.** "Nyalakan lampu" yang terkirim dua kali tetap berarti lampu menyala; operasi seperti ini disebut **idempoten** ([🔬 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#-bedah-teknis-opsional)). "Siram 5 detik" yang terkirim dua kali berarti menyiram 10 detik, dan air yang sudah keluar tidak bisa ditarik lagi. Karena itu, `TombolPompa` **sengaja tidak optimis**:

| Pertanyaan | Lampu, kipas | Pompa |
| :--- | :--- | :--- |
| Dikirim dua kali sama dengan sekali? | ya | tidak |
| Backend mengingat keinginannya dan mengirim ulang sesudah `504`? | ya | tidak |
| Tampilan selama menunggu | langsung `Nyala` + `Menunggu konfirmasi perangkat…` | tetap `Diam` + `Menunggu konfirmasi perangkat…` |
| Sesudah `ack.ok: true` | keadaan dari `ack.state` | `Menyiram` + *toast* `Pompa menyiram 3 detik.` (tombol **3 detik**); tombol 3, 5, dan 10 detik tidak bisa diketuk sampai pompa diam lagi |
| Sesudah `504` | *toast* "server akan mencoba lagi" | *toast* `Pompa: belum dikonfirmasi perangkat dan tidak dikirim ulang. Lihat keadaan pompa sebelum mencoba lagi.` |

Pompa tetap memakai `useTransition` untuk tanda menunggu dan untuk mematikan tombolnya, tetapi tanpa `useOptimistic`. Di uji penulis dengan simulator `tandon 15`, judulnya tetap `Diam`, lalu muncul *toast* `Pompa: perangkat menolak (pompa ditolak: air tandon kurang)`.

Rinciannya di [5.2](#52-tombolsakelar-tampil-dulu-dengan-useoptimistic-dan-usetransition-25-menit) dan [5.4](#54-tombolpompa-yang-sengaja-tidak-optimis-lalu-bagian-kendali-khusus-admin-10-menit); pola manual tanpa `useOptimistic` ada di [🔬](#-bedah-teknis-opsional) *Optimis tanpa `useOptimistic`*.

> ⬆️ **Sudah membaca Konsep 1–2?** Lanjut ke [Praktik 5 — Tombol yang menunggu konfirmasi perangkat](#praktik-5--tombol-yang-menunggu-konfirmasi-perangkat-75-menit). [Konsep 9](#9-aturan-untuk-manusia-naik-atau-turun-histeresis-dan-siram-berlapis) dibaca sebelum Praktik 6.

### 3. Satu alamat untuk satu layar: React Router mode deklaratif

Sampai Modul 23, alamat dashboard selalu `http://localhost:5173`. `App` memilih layar dengan papan tulis `tampilan`, jadi browser tidak tahu bahwa layarnya berganti. Akibatnya terasa setiap hari: tombol **Back** keluar dari dashboard, **F5** di Detail kembali ke Daftar, dan Detail sebuah perangkat tidak bisa dikirim sebagai tautan. Obatnya, setiap layar mendapat alamatnya sendiri. Pasangan "pola alamat → layar" disebut **rute** (*route*), misalnya `/perangkat/:id` → Detail; kamu sudah mencocokkan pola seperti itu dengan tangan di [🔁 Langkah 1](#langkah-1--alamat-jadi-layar-new-url-dan-pola-perangkatid).

**React Router 8.5.0, mode deklaratif.** React Router adalah pustaka yang menghubungkan alamat di browser dengan layar React. Dokumen resminya membaginya menjadi tiga mode yang bertumpuk: **deklaratif** (*declarative*), **data**, dan ***framework***. Kita memakai yang paling sederhana: rute ditulis sebagai komponen `<Routes>` dan `<Route>`, sedangkan data tetap diambil dengan cara yang sudah kamu kenal (efek, toko Zustand, soket). Silabus lama menyebutnya "mode *library*", istilah dari pengumuman React Router v7 (2024). Beda ketiganya ada di [🔬](#-bedah-teknis-opsional) *Tiga mode React Router 8*.

**Kenapa v8, bukan v7?** v8 stabil sejak 17 Juni 2026, dan 8.5.0 (19 Oktober 2026) adalah versi `latest` di npm, jadi dokumen resmi yang kamu buka pun menampilkan v8. Untuk mode deklaratif, kodenya sama dengan v7: semua diimpor dari `"react-router"`. Syarat v8 (Node 22.22 dan React 19.2.7 ke atas) sudah dipenuhi proyekmu (Node 24, React 19.3.1). Yang hilang hanya paket `react-router-dom`, yang berhenti di 7.18.4. Banyak tutorial masih menulis `from "react-router-dom"`; di proyek kita, ganti dengan `from "react-router"` (tabel "petunjuk lama → yang benar" di [🚨](#-kalau-tidak-jalan)).

**Tujuh alat yang dipakai:**

| Alat | Tugasnya | Dipakai di |
| :--- | :--- | :--- |
| `<BrowserRouter>` | membaca alamat dan riwayat browser, lalu membagikannya ke seluruh dashboard | `src/main.tsx`, membungkus `<App />` |
| `<Routes>` + `<Route>` | daftar alamat di satu tempat: pola alamat (`path`) → layar (`element`) | `src/App.tsx` |
| `<Link>`, `<NavLink>` | tautan yang mengganti alamat **tanpa memuat ulang halaman**; `NavLink` juga tahu kapan alamatnya sedang dibuka | menu, kartu Daftar, tautan kembali |
| `useParams()` | membaca bagian alamat yang berubah-ubah, misalnya `:id` | `halaman/Detail.tsx`, `halaman/Riwayat.tsx` |
| `<Outlet />` | tempat layar anak di dalam sebuah bingkai | `TataLetak`, `JagaMasuk`, `KhususAdmin` |
| `<Navigate>` | pindah ke alamat lain begitu ia digambar | `/` → `/perangkat`, penjaga (Konsep 4) |
| `useNavigate()` | pindah alamat dari kode, misalnya kembali ke `/aturan` sesudah aturan disimpan atau dihapus | `components/FormAturan.tsx` (Praktik 8) |

**Daftar alamat di satu tempat.** Inilah peta rute di `src/App.tsx` versi akhir (sejak Praktik 8):

```tsx
  useRealtime(sudahLogin, sesiHabis);
  …
  return (
    <Routes>
      <Route path="/masuk" element={<HalamanMasuk />} />
      <Route element={<JagaMasuk />}>
        <Route element={<TataLetak />}>
          <Route path="/" element={<Navigate to="/perangkat" replace />} />
          <Route path="/perangkat" element={<HalamanDaftar />} />
          <Route path="/perangkat/:id" element={<HalamanDetail />} />
          <Route path="/perangkat/:id/riwayat" element={<HalamanRiwayat />} />
          <Route path="/aturan" element={<HalamanAturan />} />
          {/* penjaga kedua: layar yang mengubah sesuatu hanya untuk admin */}
          <Route element={<KhususAdmin />}>
            <Route path="/aturan/baru" element={<HalamanFormAturan />} />
            <Route path="/aturan/:id" element={<HalamanFormAturan />} />
          </Route>
        </Route>
      </Route>
      {/* alamat lain yang tidak cocok dengan pola mana pun, sudah masuk atau belum */}
      <Route path="*" element={<TidakDitemukan />} />
    </Routes>
```

- **`:id`** menandai bagian alamat yang berubah-ubah: `/perangkat/f00d00000001` cocok dengan `/perangkat/:id`, dan Detail membaca `f00d00000001` lewat `useParams()`.
- **`<Route>` tanpa `path`** adalah **rute tata letak**: ia tidak menambah apa pun ke alamat, tetapi menggambar dirinya, lalu menaruh layar anak yang cocok di `<Outlet />` miliknya. `TataLetak` adalah bingkai yang tetap (kepala, lencana **Live**, menu **Perangkat** dan **Aturan**, nama dan peran, **Keluar**), sedangkan isinya berganti. `JagaMasuk` dan `KhususAdmin` adalah penjaga (Konsep 4 dan 5).
- **`useRealtime()` di atas `<Routes>`**: layar datang dan pergi di bawahnya, soketnya tetap (lihat di bawah).

Peta ini tumbuh per praktik: Praktik 1 memasang `/`, `/perangkat`, `/perangkat/:id`, `/perangkat/:id/riwayat`, dan `*`; Praktik 2 menambah `/masuk`, `JagaMasuk`, dan `TataLetak`; Praktik 3 menambah `KhususAdmin` dengan `/aturan/baru`; Praktik 7 menambah `/aturan`; Praktik 8 menambah `/aturan/:id`.

![Diagram peta rute: satu alamat untuk satu layar (Konsep 3–4); React Router 8.5.0 mode deklaratif; semua Route di App.tsx. Atas, yang dipasang SEKALI di atas pohon dan tidak ikut berganti: BrowserRouter di main.tsx (alamat dan riwayat browser); GET /auth/me sekali, pengguna di toko = memuat, null, atau akun + peran; useRealtime, satu soket (lab: 10 kali pindah layar, 0 sambungan baru). Pohon Routes, kolom layar dan siapa: /masuk, layar Masuk, yang sudah masuk diteruskan ke tujuannya, untuk semua. Bingkai JagaMasuk, penjaga tanpa path: memuat tampil Memeriksa sesi…, belum masuk Navigate ke /masuk dengan replace dan state dari: location, sudah masuk Outlet. Di dalamnya bingkai TataLetak: kepala (lencana Live, menu Perangkat dan Aturan, nama dan peran, Keluar), WadahToast, Outlet, dan GET /devices sekali. Rute untuk admin dan viewer: / dialihkan ke /perangkat; /perangkat, Daftar Perangkat; /perangkat/:id, Detail + grafik + gauge, tombol kendali hanya admin; /perangkat/:id/riwayat, Riwayat + tabel + CSV; /aturan, aturan dalam kalimat, viewer hanya membaca. Bingkai KhususAdmin, penjaga kedua (viewer melihat layar Khusus admin): /aturan/baru form buat dan /aturan/:id form ubah, nonaktifkan, hapus, hanya admin. Di luar penjaga, rute *: Halaman tidak ditemukan + Ke daftar perangkat. Bawah, contoh orang yang belum masuk membuka tautan langsung: 1 jendela privat membuka /perangkat/f00d00000001/riwayat; 2 JagaMasuk mengalihkan ke /masuk (replace, state.dari = alamat tadi); 3 masuk, Navigate ke tujuan (tujuan dari state.dari); 4 kembali ke Riwayat, Back tidak memantul ke /masuk. Catatan: /perangkat layar di port 5173, /devices API di port 8080; F5 di alamat dalam jalan karena Vite mengirim index.html yang sama (SPA fallback), server lain butuh aturan yang sama (Modul 26–27); NavLink ke /perangkat tanpa end tetap aktif di Detail.](aset/peta-rute.png)

**Halaman dan API tidak berebut alamat.** Alamat layar berbahasa Indonesia (`/perangkat`, `/aturan`, `/masuk`) di `localhost:5173`; alamat API berbahasa Inggris (`/devices`, `/rules`, `/auth`, `/health`, `/docs`) di `localhost:8080`. Dashboard memanggil backend langsung (CORS), tanpa proksi Vite, jadi **F5** di `/perangkat/…` tidak pernah tersasar ke API dan menampilkan JSON, jebakan yang dibahas di [🔬 Modul 22](../modul-22-react-dasar/README.md#-bedah-teknis-opsional).

**F5 dan tautan langsung: *SPA fallback*.** Saat **F5** ditekan di `http://localhost:5173/perangkat/f00d00000001`, browser meminta alamat itu ke server Vite, padahal berkas bernama `perangkat/f00d00000001` tidak ada. Vite (setelan bawaannya `appType: 'spa'`) tidak menjawab 404, tetapi mengirim `index.html` yang sama, lalu React Router membaca alamatnya dan menggambar Detail. Inilah *SPA fallback*: aplikasi satu halaman (*single-page application*) memakai satu `index.html` untuk semua alamat layarnya, baik di `npm run dev` maupun `npm run preview`. Dua akibatnya:

- **`base` di Vite tetap `/`** (bawaan). Pada hasil *build* dengan `base` `./`, F5 di alamat dalam membuat browser meminta `/perangkat/assets/…`, dijawab 404, dan layar menjadi putih ([🚨](#-kalau-tidak-jalan) *F5 di `/perangkat/…` memberi layar putih …*).
- **`npm run preview` hanya untuk mencoba di laptop**, bukan server sungguhan (*production*). Server yang kelak menyajikan hidangan `dist/` (Modul 26–27) harus diberi aturan yang sama: semua alamat layar dijawab `index.html`.

**Layar yang dibuka lewat alamat mengambil datanya sendiri.** Di Modul 23, objek perangkat dititipkan dari Daftar ke Detail lewat `tampilan` di `App`. Kini Detail bisa dibuka tanpa melewati Daftar (tautan, **F5**, **Back**), jadi tidak ada yang menitip. `halaman/Detail.tsx` membaca `id` dengan `useParams()`, lalu mencarinya di daftar perangkat di toko, yang diambil **sekali** sesudah masuk (`GET /devices`; di Praktik 1 oleh `App`, sejak Praktik 2 oleh bingkai `TataLetak`), bukan oleh layar Daftar ([toko Modul 23](../modul-23-dashboard-realtime/README.md#4-satu-toko-untuk-semua-layar-zustand-dan-selektor)). `id` yang tidak ada di daftar (misalnya `/perangkat/abcdef`) menampilkan `Perangkat abcdef tidak ditemukan.` tanpa meminta apa pun ke API.

**Pindah layar tidak memutus sambungan *live*.** Di uji penulis, sepuluh kali pindah layar ditambah **Back** dan **Forward** membuka 0 sambungan Socket.IO baru. Syaratnya, pindah layar lewat `<Link>` atau `<NavLink>`. Tautan `<a href>` biasa dan alamat yang diketik di bilah alamat memuat ulang seluruh halaman, sama seperti **F5**: dokumen baru, soket baru, toko diisi dari awal. Itu wajar untuk **F5**, tetapi jangan sampai terjadi di setiap klik menu. Satu perilaku lagi: di dashboard kita, pindah layar tidak menggulir halaman kembali ke atas. Di HP, Detail yang dibuka dari kartu Daftar yang sudah digulir ikut terbuka di posisi gulir itu; gulir ke atas kalau judulnya tidak terlihat.

**`NavLink` dan tanda menu aktif.** `NavLink` memanggil fungsi di prop `className`-nya dengan `isActive`, dan memasang `aria-current="page"` pada tautan yang aktif supaya pembaca layar ikut tahu. Tanpa prop `end`, `NavLink` ke `/perangkat` tetap aktif di `/perangkat/f00d00000001` dan di Riwayatnya: menu **Perangkat** tetap ditandai saat Detail terbuka. Itu sebabnya Daftar tinggal di `/perangkat` dan `/` hanya mengalihkan; `NavLink` ke `/` istimewa, hanya aktif tepat di `/`.

Rinciannya di [1.2](#12-browserrouter-di-maintsx-dan-peta-rute-di-apptsx-10-menit) sampai [1.5](#15--back-f5-dan-tautan-langsung-layar-bertahan-sambungan-live-tidak-putus-10-menit); gejala yang sering muncul ada di [🚨](#-kalau-tidak-jalan) (*F5 …*, *Menu Perangkat tidak ditandai aktif …*, *Sambungan live putus …*).

> ⬆️ **Sudah membaca Konsep 3?** Lanjut ke [Praktik 1 — Satu alamat untuk setiap layar: React Router](#praktik-1--satu-alamat-untuk-setiap-layar-react-router-50-menit). [Konsep 4](#4-rute-terproteksi-penjaga-di-depan-pintu-halaman) dan [Konsep 7](#7-formulir-yang-memeriksa-dirinya-react-hook-form-bukan-usestate-per-kolom) dibaca sebelum Praktik 2.

### 4. Rute terproteksi: penjaga di depan pintu halaman

Begitu setiap layar punya alamat, siapa pun bisa membuka `http://localhost:5173/perangkat/f00d00000001/riwayat` langsung, termasuk orang yang belum masuk. Pemeriksaannya tidak perlu ditulis di setiap layar. Satu **penjaga** dipasang sebagai rute tata letak yang membungkus semua layar terjaga, seperti petugas di depan pintu halaman: periksa dulu, baru persilakan masuk. Rute yang dijaga seperti ini disebut **rute terproteksi** (*protected route*). Inilah `src/components/JagaMasuk.tsx` versi Praktik 2:

```tsx
export default function JagaMasuk() {
  const pengguna = useToko((s) => s.pengguna);
  const location = useLocation(); // alamat yang sedang dibuka, misalnya /perangkat/f00d00000001/riwayat

  if (pengguna === "memuat") {
    // GET /auth/me belum dijawab: jangan buru-buru mengusir ke /masuk, mungkin cookie-nya masih berlaku
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Memeriksa sesi…</p>;
  }
  if (pengguna === null) {
    // replace = alamat yang dijaga tidak ditinggal di riwayat browser, jadi tombol Back tidak memantul ke sini lagi
    return <Navigate to="/masuk" replace state={{ dari: location }} />;
  }
  return <Outlet />; // sudah masuk: tampilkan layar anak yang cocok dengan alamatnya
}
```

- **`"memuat"`**: `GET /auth/me` dari `App` belum dijawab, jadi layar menulis `Memeriksa sesi…` dan menunggu. Tahap ini penting saat **F5**: muat ulang mengosongkan toko, padahal *cookie* gelangnya mungkin masih berlaku, jadi penjaga yang langsung memutuskan akan melempar setiap **F5** ke `/masuk`. Tahap ini sudah ada di `App` v0.2; Praktik 2 memindahkannya ke penjaga.
- **`null`** (belum masuk): pindah ke `/masuk` sambil menitipkan alamat tadi.
- **Sudah masuk**: `<Outlet />`, yaitu layar anak yang cocok dengan alamatnya.

**`state.dari`: kembali ke layar semula.** `useLocation()` memberi alamat yang sedang dibuka, dan penjaga menitipkannya ke `/masuk` lewat `state` riwayat browser, yang tidak tampil di bilah alamat. Layar Masuk memakai titipan itu sebagai tujuan (atau `/perangkat` kalau tidak ada titipan), lalu sesudah masuk berhasil menggambar `<Navigate to={tujuan} replace />`. Di uji penulis, alamat Riwayat yang dibuka tanpa sesi berpindah ke `/masuk` dengan titipan `{"dari":{"pathname":"/perangkat/f00d00000001/riwayat",…}}`, dan sesudah **Masuk** kembali tepat ke Riwayat itu.

**`replace`: tombol Back tidak memantul.** Tanpa `replace`, riwayat browser berisi alamat terjaga, lalu `/masuk`. **Back** dari `/masuk` kembali ke alamat terjaga, dan penjaga langsung melemparnya lagi ke `/masuk`: memantul. Dengan `replace`, alamat terjaga **diganti** `/masuk`, dan sesudah masuk, `/masuk` diganti tujuannya, jadi **Back** dari Riwayat tidak kembali ke layar Masuk.

**Pola resmi, versi kita.** Contoh resmi React Router v8 (`react-router-examples/auth`) memakai `<Navigate to="/login" state={{ from: location }} replace />` di penjaga, lalu `navigate(from, { replace: true })` sesudah *login*; status *login*-nya disimpan di React Context, sehingga muat ulang sama dengan keluar. Kita mengikutinya dengan tiga beda: nama Indonesia (`/masuk`, `dari`); status *login* di toko Zustand ditambah tahap `"memuat"`, sehingga penjaga, kepala, dan layar Masuk membaca papan pengumuman yang sama; dan layar Masuk juga memakai `<Navigate>`, karena isi toko yang berganti sudah menggambar ulang layar itu. Dokumen API menyarankan `useNavigate` daripada komponen `<Navigate>` (komponen itu ditujukan untuk *class component*), tetapi contoh resmi tetap memakai `<Navigate>` di penjaga, dan kita pun begitu.

**Siapa di dalam, siapa di luar.** `/masuk` dan `*` sengaja di luar penjaga: `/masuk` adalah tujuan penjaga, jadi harus bisa dibuka orang yang belum masuk, dan `Halaman tidak ditemukan` tampil untuk semua orang. Semua layar lain ada di dalam `JagaMasuk` → `TataLetak` dan ikut terjaga tanpa satu baris pemeriksaan pun di layarnya sendiri. Di dalamnya lagi ada penjaga kedua, `KhususAdmin`, untuk `/aturan/baru` dan `/aturan/:id`: akun viewer melihat layar `Khusus admin` dengan tautan kembali, bukan formulir, dan tidak dipindah diam-diam (Konsep 5, Praktik 3). Pohon lengkapnya ada di gambar Konsep 3.

**Penjaga bukan pengaman data.** Penjaga hanya mengatur layar di browser, dan browser sepenuhnya milik penggunanya: kodenya bisa diubah, dan API bisa dipanggil tanpa dashboard, misalnya dari Bruno. Data tetap dijaga satpam backend: tanpa gelang, `GET /devices` dijawab `401`, dan perintah dari akun viewer dijawab `403`. Penjaga membuat dashboard enak dipakai; satpam membuatnya aman. Pembagian yang sama berlaku untuk peran (Konsep 5). Praktik 3 menambah satu syarat kecil sesudah **Keluar**: penjaga tidak menitipkan `dari`, supaya orang berikutnya di tab yang sama tidak mendarat di layar terakhir orang sebelumnya (Konsep 6).

Rinciannya di [2.2](#22-penjaga-dan-bingkai-jagamasuk-dan-tataletak-15-menit) dan [2.4](#24--tautan-langsung-sebelum-masuk-ke-masuk-lalu-kembali-ke-layar-semula-10-menit).

> ⬆️ **Sudah membaca Konsep 4?** Baca juga [Konsep 7](#7-formulir-yang-memeriksa-dirinya-react-hook-form-bukan-usestate-per-kolom) (formulir yang memeriksa dirinya), lalu lanjut ke [Praktik 2 — Rute terproteksi dan *login* yang disempurnakan](#praktik-2--rute-terproteksi-dan-login-yang-disempurnakan-55-menit).

### 5. Peran dua lapis: layar untuk kenyamanan, satpam untuk keamanan

Konsep 5 dan 6 dibaca sesudah Praktik 2, sebelum Praktik 3: saat itu dashboard-mu sudah punya penjaga rute dan layar Masuk yang baru.

Modul 20 membuat dua peran karena tidak semua orang di rumah perlu bisa memerintah. Dalam model ancaman Modul 20, "adik yang suka mematikan lampu kamar orang lain" ([Modul 20 Konsep 1](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#1-model-ancaman-siapa-yang-mungkin-iseng-dan-apa-akibatnya)) cukup diberi akun `viewer`. Ia boleh melihat semua angka, tetapi setiap perintah dan perubahan ditolak `403` ([Modul 20 Konsep 6](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#6-satpam-di-setiap-pintu-peran-admin-dan-viewer)). Sampai Modul 23, admin dan viewer melihat dashboard yang sama persis, dan itu tidak masalah karena dashboard hanya melihat. Minggu ini dashboard mendapat tombol lampu, kipas, pompa, dan formulir aturan, jadi muncul dua pertanyaan baru: **siapa yang melihat tombolnya, dan siapa yang benar-benar boleh memakainya?** Keduanya dijawab di tempat yang berbeda.

| Lapis | Di mana | Tugasnya | Bisa dilewati? |
| :-- | :-- | :-- | :-- |
| **1. Layar** (kenyamanan) | browser: `useAdmin()` dan penjaga kedua `KhususAdmin` | Viewer tidak diberi tombol yang toh akan ditolak, jadi layarnya jujur dan tidak membingungkan | **Bisa.** Siapa pun bisa mengirim permintaan tanpa menekan tombol: lewat Bruno, tab **Console**, atau `curl` |
| **2. Satpam backend** (keamanan) | server: fungsi `satpam` di `src/auth/keamanan.ts` (Modul 20) | Setiap perubahan dari akun yang bukan admin ditolak `403`, dari mana pun datangnya | **Tidak**, karena ia berjalan di server, bukan di browser si pengirim |

**Menyembunyikan tombol bukan pengaman.** Kode layar berjalan di browser milik penggunanya sendiri, jadi pengguna itu bisa melewatinya. Yang menjaga rumahmu tetap satpam backend; lapis layar hanya membuat dashboard enak dipakai. Karena itu, setiap kali kamu menambah tombol admin, uji juga lapis keduanya dengan akun viewer di Bruno ([3.3](#33--ganti-akun-di-tab-yang-sama-tanpa-sisa-khusus-admin-dan-403-di-bruno-15-menit)).

![Diagram peran dua lapis: layar untuk kenyamanan, satpam untuk keamanan (Konsep 5). Kiri, Lapis 1, layar: Detail mini admin dengan tombol di bagian Kendali (Lampu Nyala, Kipas Mati, Pompa: siram 3, 5, 10 detik) dan Detail mini viewer tanpa tombol, hanya kartu: Lampu Nyala, Kipas Mati, Pompa Diam, Tirai 90° di antara kartu sensor Suhu dan Kelembapan. Tombol dirender hanya bila useAdmin() true, yaitu peran admin sudah pasti dari GET /auth/me, jadi tidak ada tombol yang berkedip; viewer juga tidak melihat + Aturan baru dan Ubah, dan /aturan/baru menampilkan Khusus admin. Peringatan: menyembunyikan tombol BUKAN pengaman; viewer masih bisa mengirim POST lewat Bruno atau Console. Kanan, Lapis 2, satpam backend onRequest (keamanan.ts) untuk POST /devices/f00d00000001/command dari viewer, diperiksa berurutan sebelum rute bekerja: 1 Origin dikenal? (selain GET/HEAD; Bruno tidak mengirim Origin), bila tidak 403 permintaan dari halaman … ditolak; 2 rute terbuka? (/auth/login, /auth/refresh, /auth/logout, /health, /docs) lewat tanpa gelang; 3 gelang (cookie akses) sah? bila tidak 401 belum login atau sesi sudah habis: login lewat POST /auth/login; 4 peran admin, atau GET/HEAD? bila tidak 403 akun viewer hanya boleh melihat; perintah dan perubahan khusus admin. Lolos semua, baru isi diperiksa Zod (400) dan rute bekerja. 403 datang SEBELUM isi diperiksa: viewer dengan isi salah pun mendapat 403, bukan 400. Bawah, bukti di Bruno: login viewer lalu nyalakan lampu, 403 dengan pesan tadi; login admin lalu nyalakan lampu, 200 berisi ack. Viewer tetap boleh GET /devices, GET /rules, GET /auth/me, dan Socket.IO. Peran yang diganti lewat CLI dipakai layar sesudah dimuat ulang, dan satpam paling lambat 15 menit (umur gelang).](aset/peran-dua-lapis.png)

**Lapis 2 sudah kamu lihat bekerja.** Di [Kemenangan Cepat Langkah 4](#langkah-4--ketuk-sebagai-viewer-403-dari-satpam-backend-4-menit), tombol sementara `TombolPertama` diketuk dengan akun viewer, dan backend menjawab `403` `akun viewer hanya boleh melihat; perintah dan perubahan khusus admin`. Itu kerja satpam: satu *hook* `onRequest` (fungsi `satpam`) yang memeriksa **semua** permintaan sebelum rutenya bekerja, berurutan:

1. Perubahan (`POST`, `PUT`, `DELETE`) dari halaman yang asalnya tidak terdaftar di `CORS_ORIGIN` → `403` `permintaan dari halaman … ditolak`.
2. Rute terbuka (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/health`, `/docs`) → lewat tanpa gelang.
3. Tanpa gelang yang sah → `401` `belum login atau sesi sudah habis: login lewat POST /auth/login`.
4. Peran bukan admin, dan metodenya bukan `GET`/`HEAD` → `403`.

Langkah 4 di `backend/src/auth/keamanan.ts` (sejak Modul 20):

```ts
  if (req.user.peran !== "admin" && !MEMBACA.has(req.method)) { // diperiksa SEBELUM isi permintaan divalidasi
    req.log.warn(`ditolak (403): akun ${req.user.sub} (${req.user.peran}) mencoba ${req.method} ${req.url}`);
    return reply.code(403).send({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
  }
```

Tiga sifat langkah ini penting minggu ini:

- **`403` datang sebelum isi permintaan diperiksa.** Viewer yang mengirim isian salah pun mendapat `403`, bukan `400`, jadi ia tidak diberi petunjuk apa pun tentang bentuk isian yang benar.
- **Rute baru ikut terjaga tanpa kode tambahan.** `DELETE /rules/:id` milik backend 1.1 ([Praktik 6](#praktik-6--backend-11-aturan-turun-di-bawah-dan-hapus-aturan-50-menit)) langsung ditolak untuk viewer; tes `routes/aturan.test.ts` membuktikannya dengan satpam sungguhan.
- **Peran dibaca dari gelang** yang ditandatangani backend, bukan dari layar. Seandainya seseorang mengutak-atik isi toko lewat **Console** sampai tombol admin muncul, ketukannya tetap dijawab `403`.

Socket.IO sengaja tidak memeriksa peran: viewer memang boleh melihat semua data *live*, kejadian, dan daftar aturan.

**Lapis 1: tampilkan kalau sudah pasti admin.** Dari mana layar tahu peranmu? Saat halaman dibuka, `App` bertanya sekali "siapa saya?" lewat `GET /auth/me` ([2.1](#21-siapa-yang-sedang-masuk-irisan-sesi-di-tokots-dan-get-authme-sekali-10-menit)). Jawabannya, `{ id, email, nama, peran }`, disimpan di toko sebagai `pengguna`. Komponen tidak membaca `peran` langsung, tetapi memakai satu selektor kecil di `src/toko.ts`:

```ts
export function useAdmin(): boolean {
  return useToko((s) => s.pengguna !== null && s.pengguna !== "memuat" && s.pengguna.peran === "admin");
}
```

Hasilnya `true` **hanya** kalau peran admin sudah pasti. Selama `GET /auth/me` belum dijawab (`"memuat"`), hasilnya `false`. Perhatikan arahnya: "tampilkan kalau pasti admin", bukan "sembunyikan kalau viewer". Dengan cara kedua, selama `"memuat"` peran belum diketahui, jadi tombol admin sempat tergambar sekejap di layar viewer lalu hilang: berkedip. Cara pertama tidak pernah menggambar tombol yang belum berhak tampil.

`useAdmin()` dipakai di tiga tempat:

| Tempat | Admin melihat | Viewer melihat | Dibuat di |
| :-- | :-- | :-- | :-- |
| Detail perangkat | bagian **Kendali**: tombol Lampu, Kipas, dan Pompa 3/5/10 detik | kartu baca-saja `Lampu`, `Kipas`, `Pompa`, dan `Tirai`, tanpa satu tombol kendali pun | [5.4](#54-tombolpompa-yang-sengaja-tidak-optimis-lalu-bagian-kendali-khusus-admin-10-menit); dibuktikan di [5.5](#55--lampu-dari-dashboard-rollback-dan-akun-viewer-tanpa-tombol-15-menit) |
| `/aturan` | daftar aturan dalam kalimat, tombol **+ Aturan baru**, dan tautan **Ubah** | daftar kalimat yang sama tanpa tombol, jadi viewer tahu kenapa kipas menyala sendiri | [8.3](#83-formaturan-di-aturanbaru-useform-dengan-zodresolver-pratinjau-kalimat-dan-tombol-simpan-20-menit) dan [8.4](#84-ubah-nonaktifkan-dan-hapus-tombol-ubah-dan-rute-aturanid-10-menit) |
| `/aturan/baru`, `/aturan/:id` | formulir aturan | layar `Khusus admin` | [3.1](#31-useadmin-dan-penjaga-kedua-khususadmin-10-menit) |

Baris terakhir dijaga **penjaga kedua**, `KhususAdmin`. Bentuknya sama dengan `JagaMasuk` di [Konsep 4](#4-rute-terproteksi-penjaga-di-depan-pintu-halaman), rute tata letak yang menaruh layar anaknya di `<Outlet />`, tetapi pertanyaannya lain: bukan "sudah masuk?", melainkan "admin?". Viewer yang membuka `/aturan/baru` dari tautan atau bilah alamat tidak dialihkan diam-diam. Ia membaca `Layar ini hanya untuk akun admin. Akunmu viewer: kamu bisa melihat semua data, tetapi tidak bisa mengubah apa pun.`, lengkap dengan tautan kembali ke daftar perangkat.

**Peran yang diganti.** Peran sebuah akun diubah dari terminal backend ([Modul 20 1.6](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#16-pengurus-akun-dari-terminal-npm-run-pengguna-10-menit)). Layar baru mengetahuinya sesudah halaman dimuat ulang, karena `GET /auth/me` hanya ditanyakan sekali saat halaman dibuka. Satpam membaca peran dari gelang, jadi di sana peran baru berlaku paling lambat 15 menit kemudian, saat gelangnya diperbarui. Selama selang itu, layar dan satpam bisa berbeda pendapat; yang menentukan tetap satpam ([🚨](#-kalau-tidak-jalan) *Akun viewer sekilas melihat tombol admin, atau masih melihatnya sesudah perannya diganti*). Peran juga tidak pernah ditulis ke `localStorage`: ia hanya tinggal di memori tab, dan ikut dibuang saat **Keluar** (Konsep 6).

### 6. Keluar yang tuntas: putus soket, hapus sesi, kosongkan toko

Tombol **Keluar** Modul 23 sengaja minimal: putus sambungan *live*, `POST /auth/logout`, lalu kembali ke formulir *login*. Isi toko (daftar perangkat, bacaan, grafik) masih tertinggal di memori tab sampai halaman dimuat ulang. Modul 23 mencatatnya sebagai batasan, dan berjanji: begitu peran dibedakan, toko **wajib** dikosongkan ([🔬 Modul 23](../modul-23-dashboard-realtime/README.md#-bedah-teknis-opsional) *Dua batasan v0.2*). Janji itu jatuh tempo sekarang. Bayangkan admin keluar, lalu adik masuk dengan akun viewer di tab yang sama. Tanpa pengosongan, ia bisa sekilas melihat sisa data admin, atau malah mendarat di layar terakhir admin. **Keluar yang tuntas** berarti orang berikutnya di tab itu mulai dari nol.

**Keluar** di dashboard 1.0 (`klikKeluar` di `TataLetak.tsx`, [3.2](#32-keluar-yang-tuntas-kosongkansemua-dan-empat-langkah-berurutan-15-menit)) terdiri atas empat langkah, dan urutannya penting:

| No. | Langkah | Kode | Mengapa di urutan ini |
| :-: | :-- | :-- | :-- |
| 1 | Putus sambungan *live* | `socket.disconnect()` | Alasan putusnya `io client disconnect`, jadi soket tidak menyambung lagi. Kalau urutannya terbalik, server yang memutus (`io server disconnect`), lalu dashboard mencoba menyambung lagi (Modul 23). |
| 2 | Hapus sesi di backend | `await keluar()`, yaitu `POST /auth/logout` | Backend menghapus kartu terusan di database, memutus soket sesi itu di semua tab, dan menyuruh browser membuang *cookie* `akses` dan `sesi`. JavaScript sendiri tidak bisa menghapus *cookie* `HttpOnly` ([Modul 20 Konsep 5](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#5-cookie-httponly-bukan-localstorage)). |
| 3 | Kosongkan toko | `kosongkanSemua(pesan, true)` | Sesi, perangkat, bacaan, grafik, dan *toast* milik akun tadi dibuang sekaligus. |
| 4 | Pindah ke `/masuk` | dikerjakan penjaga `JagaMasuk`, dengan `replace` | Begitu toko kosong, penjaga melihat `pengguna === null`. Berkat `replace`, tombol **Back** tidak kembali ke layar dashboard tadi. |

Langkah 3 memakai fungsi kecil di `src/toko.ts`:

```ts
export function kosongkanSemua(pesanMasuk: string | null, keluarSengaja = false) {
  useToko.setState({ ...useToko.getInitialState(), pengguna: null, pesanMasuk, keluarSengaja }, true);
  useToast.setState(useToast.getInitialState(), true); // toast milik akun sebelumnya ikut dibuang
}
```

Baris `useToast` baru ditambahkan di Praktik 4, saat *toast* (kartu kabar kecil, Konsep 10) dibuat. `getInitialState()` adalah isi toko saat pertama dibuat. Argumen kedua `true` berarti **ganti** seluruh isinya. Tanpa `true`, `setState` hanya menggabung seperti `set` biasa, dan bidang yang tidak disebut tetap tinggal. Fungsi yang sama dipakai `sesiHabis()` saat gelang tidak bisa diperbarui lagi, jadi kedua jalan keluar sama bersihnya.

**Mengapa langkah 4 tidak memanggil `navigate("/masuk")`?** Versi pertama memanggilnya, dan uji penulis menemukan cacat: orang berikutnya yang masuk di tab yang sama mendarat di layar terakhir orang sebelumnya (viewer langsung disambut layar `Khusus admin`). Sebabnya, `<BrowserRouter>` mengganti alamat lewat `startTransition` (pembaruan yang boleh ditunda React), sedangkan toko Zustand berubah seketika. Jadi penjaga lebih dulu melihat toko kosong **di alamat lama**, lalu memindah ke `/masuk` sambil menitipkan alamat itu sebagai `dari` (Konsep 4), dan titipan itu menimpa `navigate` tadi. Obatnya: cukup satu pihak yang memindah layar. **Keluar** mengosongkan toko dengan `keluarSengaja = true`, lalu penjaga membacanya (`JagaMasuk.tsx`):

```tsx
    return <Navigate to="/masuk" replace state={keluarSengaja ? null : { dari: location }} />;
```

Sesudah **Keluar**, tidak ada alamat yang dititipkan, jadi orang berikutnya mulai dari `/perangkat`. Sesudah sesi habis, alamatnya sengaja tetap dititipkan: biasanya orang yang sama masuk lagi dan ingin kembali ke layarnya.

**Kabar sesudah Keluar.** Layar Masuk menampilkan `Kamu sudah keluar.` sebagai baris di atas formulir (`role="status"`, dibacakan pembaca layar), bukan sebagai *toast*, karena *toast* justru ikut dikosongkan. Kalau backend mati saat **Keluar** ditekan, langkah 2 gagal, dan dashboard berterus terang: `Keluar belum tuntas: server tidak menjawab, jadi sesi di server belum terhapus. Setelah server menyala lagi, muat ulang halaman ini lalu tekan Keluar sekali lagi.` Di uji penulis, muat ulang sesudah backend menyala memang membawa kembali ke `/perangkat`, karena sesinya masih hidup.

Di uji penulis, catatan jaringan DevTools merekam urutannya: klik **Keluar**, paket putus Socket.IO 1 ms kemudian, `POST /auth/logout` pada 5 ms, jawaban `200` pada 18 ms, lalu `/masuk` dengan toko kosong. Viewer yang lalu masuk di tab yang sama mendarat di `/perangkat` tanpa sisa data admin. **Keluar di tab lain** juga tertangani: backend memutus soket semua tab sesi itu, pembaruan gelang ditolak, dan tab ini pindah ke `/masuk` dengan `Sesi sudah habis. Silakan masuk lagi.` dalam 338–630 ms. Tab yang sedang tidak dilihat bisa baru "sadar" saat dibuka lagi.

Dua hal tidak bisa dituntaskan kode browser, dan modul ini menuliskannya terang-terangan.

**Pertama, gelang yang telanjur disalin.** Gelang (JWT `akses`) diperiksa tanpa database. **Keluar** membuang *cookie* di browser-mu dan mematikan kartu terusan, tetapi salinan gelang yang telanjur dibawa orang lain tetap diterima sampai umurnya habis, paling lama 15 menit ([Modul 20 Konsep 7](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#7-refresh-token-dan-logout-kartu-terusan-di-loket)). Di lab riset, gelang lama masih dijawab `200` untuk `GET /devices` sesudah *logout*, sedangkan kartu terusan lamanya ditolak `401` `sesi sudah tidak berlaku: silakan login lagi`. Jadi, **Keluar** tidak langsung mematikan gelang yang telanjur tersalin.

**Kedua, tombol Back dan *back/forward cache* (bfcache).** Saat kamu pindah ke **dokumen** lain, misalnya dengan mengetik alamat baru di bilah alamat, browser bisa menyimpan halaman lama utuh di memori supaya **Back** terasa instan. Di uji penulis, sebelum obatnya dipasang, **Keluar** lalu **Back** memulihkan halaman admin lengkap dengan kepala `Admin Rumah (admin)` dan tombol **+ Aturan baru** selama ±1,2 detik, sampai sambungannya ditolak. Obatnya satu efek di `App.tsx` (Praktik 3.2): halaman yang dipulihkan dari bfcache langsung dimuat ulang, sehingga `App` bertanya lagi "siapa saya?".

```tsx
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) location.reload(); // persisted = dipulihkan dari bfcache, bukan dimuat baru
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
```

Sisanya ditulis jujur. Halaman lama masih berkedip sekejap (0,16–0,5 detik di uji penulis) sebelum dimuat ulang, dan orang yang menekan **Back** lalu masuk mendarat di alamat yang dibukanya dengan **Back** itu (alamatnya saja, bukan datanya). Kalau pindah layar hanya lewat menu dan tautan dashboard, **Back** sesudah **Keluar** dialihkan penjaga ke `/masuk` dalam puluhan milidetik, tanpa data apa pun. Di komputer bersama, kebiasaan paling aman tetap: **Keluar**, lalu tutup tab-nya ([🔬](#-bedah-teknis-opsional) *Back/forward cache dan acara `pageshow` sesudah Keluar*; [🚨](#-kalau-tidak-jalan) *Sesudah Keluar, tombol Back sekilas memperlihatkan layar lama*).

> ⬆️ **Sudah membaca Konsep 5–6?** Lanjut ke [Praktik 3 — Peran di layar dan Keluar yang tuntas](#praktik-3--peran-di-layar-dan-keluar-yang-tuntas-40-menit). [Konsep 10](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp) dibaca sebelum Praktik 4.

### 7. Formulir yang memeriksa dirinya: react-hook-form, bukan `useState` per kolom

Konsep ini dibaca bersama Konsep 4, sebelum Praktik 2, dan dipakai lagi di Praktik 8.

Formulir *login* Modul 22 ([Modul 22 4.3](../modul-22-react-dasar/README.md#43-formulir-login-srccomponentslogintsx-lalu-pasang-di-app-15-menit)) memberi setiap hal papan tulis kecilnya sendiri: `useState` untuk email, sandi, galat, dan "sedang mengirim". Untuk dua kotak, cara itu jelas dan cukup. Formulir aturan di Praktik 8 lain cerita: belasan kolom, sebagian muncul dan hilang mengikuti pilihan "Kapan?" dan "Lalu?", dan **setiap** kolom butuh isian, tanda "sudah disentuh", pesan galatnya sendiri, serta atribut aksesibilitas. Dengan `useState` per kolom, itu puluhan papan tulis dan `if` yang harus dijaga tetap selaras. Kebutuhan ini ada di hampir semua formulir, jadi ada pustaka yang mengurusnya: **react-hook-form** 7.91.0.

Pembagian kerjanya: react-hook-form memegang isian dan keadaan formulir, **skema Zod** memutuskan isian mana yang sah (Konsep 8), dan komponenmu tinggal menggambar kotak beserta pesannya. Lima alat yang kamu pakai:

| Alat | Gunanya |
| :-- | :-- |
| `useForm({ … })` | membuat satu formulir: nilai awal, pemeriksa (*resolver*), dan kapan memeriksa (`mode`) |
| `{...register("email")}` | memasang satu kotak ke formulir: `name`, `onChange`, `onBlur`, dan `ref` sekaligus |
| `handleSubmit(kirim)` | saat formulir dikirim, semua kolom diperiksa dulu; `kirim` **hanya** dipanggil kalau semuanya lolos |
| `formState` | `errors` (pesan per kolom) dan `isSubmitting` (`true` selama `kirim` belum selesai) |
| `setError(…)` | menaruh galat dari jawaban server, di kolomnya atau di `root.server` untuk galat umum |

Inilah inti formulir Masuk (`src/halaman/Masuk.tsx`, [2.3](#23-layar-masuk-dengan-react-hook-form-dan-zod-skemamasukts-dan-halamanmasuktsx-20-menit)):

```tsx
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(IsianMasuk), mode: "onTouched", defaultValues: { email: "", sandi: "" } });
```

```tsx
  async function kirim(isian: IsianMasuk) {
    try {
      // berhasil: pengguna di toko terisi, layar ini digambar ulang, lalu <Navigate> di atas memindahkan ke tujuan
      useToko.getState().setPengguna(await masuk(isian.email, isian.sandi));
    } catch (err) {
      // 401 "email atau sandi salah", 429 "terlalu banyak percobaan…", 503, atau backend mati: tampil di atas tombol
      setError("root.server", { message: err instanceof GalatApi ? err.message : "Gagal masuk." });
    }
  }
```

- **`mode: "onTouched"`**: kolom diperiksa pertama kali saat ditinggalkan, lalu setiap kali diketik. Bawaannya `"onSubmit"`, yaitu baru diperiksa saat tombol ditekan. Dengan `onTouched`, kolom yang baru setengah diketik tidak langsung dimarahi, tetapi pesan galatnya hilang begitu isiannya dibetulkan.
- **`defaultValues` berisi teks kosong**, bukan `undefined`: react-hook-form meminta setiap kolom punya nilai awal.
- **Semua aturan ada di skema.** *Resolver* tidak bisa digabung dengan pemeriksa bawaan react-hook-form (`required`, `min`, …), dan `<form noValidate>` membungkam pemeriksaan bawaan browser. Jadi setiap pesan datang dari satu sumber: skema.
- **`isSubmitting`** menggantikan `useState` "sibuk": tombolnya menjadi `Sedang masuk…` (di formulir aturan `Menyimpan…`) dan tidak bisa ditekan dua kali.

**Angka dari kotak isian.** Isi `<input type="number">` tetap berupa teks, padahal skema backend meminta `z.number()`. `register(nama, { valueAsNumber: true })` membacanya sebagai angka; kotak kosong menjadi `NaN`, yang ditolak Zod dengan `Isi dengan angka`. Pilihan nyala/mati memakai `setValueAs` supaya teks `"true"` menjadi `true`. Di Edge (Chromium), `2,5` dan `2.5` sama-sama dibaca dua setengah, tetapi `1.000` dibaca 1, jadi tulis `1000` (Firefox dan Safari belum diuji penulis; [🚨](#-kalau-tidak-jalan) *Angka di formulir terbaca lain …*).

**Aksesibilitas tidak datang otomatis.** react-hook-form tidak memasang `aria-invalid` dan `aria-describedby`. Dashboard memasangnya sendiri (di `Masuk.tsx` langsung, di formulir aturan lewat `useKolom` di `kolom.tsx`), supaya pembaca layar ikut membacakan pesan galat saat kotaknya disentuh. Galat dari server tampil dengan `role="alert"`.

**Satu formulir, beberapa berkas.** Formulir aturan (Praktik 8) dipecah menjadi `FormAturan` dan tiga bagian kecil: `BagianKapan`, `BagianLalu`, dan `KonfirmasiHapus`. `BagianKapan` dan `BagianLalu` memakai formulir yang sama lewat `<FormProvider>` dan `useFormContext`, tanpa menitipkan `register` lewat *props*. Saat pilihan "Kapan?" diganti, seluruh isi `kondisi` diganti sekaligus (`setValue`), supaya kolom milik pilihan lama tidak ikut terkirim; skema yang ketat akan menolaknya dengan `Kunci tidak dikenali`. Di uji penulis, sesudah bolak-balik ke semua pilihan, isi `POST /rules` hanya memuat kolom pilihan terakhir, dan backend menjawab `201`.

| | Modul 22 (`components/Login.tsx`) | Modul 24 (`halaman/Masuk.tsx`) |
| :-- | :-- | :-- |
| Isian dan keadaan | empat `useState`: `email`, `sandi`, `galat`, `sibuk` | `useForm` |
| Pemeriksa di browser | `required` dan `type="email"`: gelembung bawaan browser | skema `IsianMasuk`, pesan di bawah kolomnya |
| Galat dari server | satu `galat` | `setError("root.server", …)` |
| Sesudah berhasil | daftar perangkat | kembali ke alamat yang tadi diminta (`dari`, Konsep 4) |

**Penghubungnya: `@hookform/resolvers` 5.9.2.** `zodResolver` datang dari paket terpisah, `@hookform/resolvers`, yang menerjemahkan hasil pemeriksaan Zod menjadi `errors` react-hook-form. Versi terbarunya, 6.0.0 (19 Okt 2026), hanya mengubah dukungan untuk pustaka lain (Effect), tetapi gagal dipasang dengan npm 11.19.0 bawaan Node 24: `npm error code ERESOLVE` dengan `peerOptional effect@"^4.0.0"`. Perintah tanpa nomor versi pun gagal, karena npm memilih 6.0.0. Masalahnya sudah dilaporkan di GitHub sebagai *issue* react-hook-form/resolvers#882 (23 Okt 2026), dan saat modul ini ditulis belum ada versi 6.0.1. Karena itu, Praktik 1.1 mengunci `@hookform/resolvers@5.9.2`, yang terpasang bersih dan mendukung Zod 4. Pesan galat npm menawarkan `--force` atau `--legacy-peer-deps`; jangan diikuti, karena keduanya menerima susunan paket yang oleh npm sendiri disebut bisa rusak ([🚨](#-kalau-tidak-jalan) *`npm install` berhenti dengan `npm error code ERESOLVE` …*).

Penasaran cara React 19 membuat formulir tanpa pustaka? Lihat [🔬](#-bedah-teknis-opsional) *Optimis tanpa `useOptimistic`, dan formulir tanpa react-hook-form lewat `useActionState`*.

> ⬆️ **Sudah membaca Konsep 4 dan Konsep 7?** Lanjut ke [Praktik 2 — Rute terproteksi dan *login* yang disempurnakan](#praktik-2--rute-terproteksi-dan-login-yang-disempurnakan-55-menit). Konsep 7 dipakai lagi di [Praktik 8](#praktik-8--form-aturan-buat-ubah-nonaktifkan-hapus-70-menit).

### 8. Satu aturan, dua penjaga: skema Zod yang sama di browser dan backend

Konsep ini dibaca sesudah Praktik 6, sebelum Praktik 7. Salah satu salinan yang dibahasnya, `kontrak.ts`, sudah kamu pakai di [5.1](#51-salin-kontrakts-lalu-kirimperintah-yang-memeriksa-jawaban-dengan-acksafeparse-15-menit).

Silabus meminta form aturan dengan validasi Zod yang sama dengan backend. Kenapa diperiksa dua kali, dan kenapa harus sama? Karena kedua pemeriksaan punya tugas berbeda:

| Penjaga | Di mana | Tugasnya |
| :-- | :-- | :-- |
| **1. Browser** (pengalaman) | `zodResolver(Aturan, { error: pesanRamah })` di `FormAturan` | Cepat dan per kolom: pesan tampil di bawah kolom yang salah sebelum apa pun dikirim. Di uji penulis, isian salah membuat `POST /rules` terkirim 0 kali, dan fokus pindah ke kolom pertama yang salah. |
| **2. Backend** (pengaman) | `schemas/aturan.ts` di `POST /rules` dan `PUT /rules/:id` | Memeriksa ulang **setiap** isian, termasuk yang tidak lewat formulir (Bruno, **Console**), lalu menjawab `400` per kolom. |

Penjaga 1 boleh dilewati; penjaga 2 tidak. Tetapi kalau aturan keduanya **berbeda**, pengguna jadi bingung: formulir bilang beres lalu server menolak, atau formulir menolak isian yang sebenarnya sah. Karena itu, keduanya memakai **satu** skema.

**Satu skema, dua salinan identik.** Di Praktik 6.1, backend 1.1 memecah skema aturannya. `aturan-dasar.ts` memuat semua bentuk aturan dan hanya mengimpor `zod` serta `kontrak.ts`, dua hal yang juga jalan di browser. `aturan.ts` tinggal `export *` dari berkas itu, ditambah satu pemeriksaan khusus server: apakah ekspresi cron benar-benar bisa dijalankan node-cron. Frontend menyalin `kontrak.ts` (5.1) dan `aturan-dasar.ts` ([7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit)) ke `src/skema/` **tanpa mengubah satu karakter pun**, komentar kepalanya juga. Penjelasan "ini salinan" ditaruh di berkas lain, `src/skema/README.md`, karena satu baris komentar tambahan saja sudah membuat salinannya tidak identik.

![Diagram satu aturan, dua penjaga: skema Zod yang sama di browser dan backend (Konsep 8). Atas: backend/src/schemas/ berisi aturan-dasar.ts (hanya mengimpor zod dan kontrak.ts), kontrak.ts, dan aturan.ts (export * + cek cron dengan node-cron, khusus server); disalin ke frontend/src/skema/ sebagai SALINAN identik, jangan diubah di sini; masuk.ts bukan salinan. npm run cek-skema mencetak SAMA src/skema/kontrak.ts dan SAMA src/skema/aturan-dasar.ts; CRLF dianggap sama dengan LF, beda satu karakter memberi BEDA … mulai baris N, kode keluar 1. Tengah, Penjaga 1 di browser: react-hook-form + zodResolver(Aturan, { error: pesanRamah }). Formulir mini: Nama aturan Siram jika tanah kurang dari 30 %; Menyala kalau di bawah (%), kunci nyala_di_bawah, 30; Selesai kalau naik di atas (%), kunci padam_di_atas, 25 bertepi merah dengan pesan padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis); Harus bertahan selama (detik, 0 = langsung), kunci selama_detik, 10; tombol Simpan aturan. Isian salah: POST tidak dikirim (lab: 0 permintaan), fokus ke kolom yang salah; pesan histeresis ini sama dengan teks 400 backend. Lolos: POST /rules atau PUT /rules/:id ke Penjaga 2 di backend: 1 satpam, hanya admin (403); 2 aturan.ts, skema yang SAMA + cek cron; 3 lolos, simpan, 201 atau 200, kejadian aturan-diubah ke semua dashboard; 4 tidak lolos, 400 per kolom, contoh body/kondisi/cron ekspresi cron tidak sah. Aturan dari database juga diperiksa; bentuk asing dilewati dengan WARN. Jawaban ke browser: 201, kembali ke /aturan dengan toast Aturan Siram jika tanah kurang dari 30 % disimpan.; 400, pesan dipecah per kolom dengan setError, ekspresi cron tidak sah tampil di bawah kolom cron; galat untuk kolom tanpa tempat pesan tampil sebagai Ditolak server: … di atas tombol Simpan aturan. Tabel contoh: nama kosong, browser Wajib diisi, backend 400 Terlalu kecil; padam_di_atas 25, pesan histeresis sama persis di keduanya; selama_detik 2,5, Isi dengan bilangan bulat (tanpa koma), backend juga 400; cron 61 * * * *, lolos di browser yang hanya memeriksa 5 bidang, backend 400 ekspresi cron tidak sah di kolom cron. Mengapa disalin: aturan.ts backend mengimpor node-cron, di browser fileURLToPath is not a function dan halaman tidak pernah jalan (layar putih); frontend harus bisa di-build tanpa folder backend/ (Docker, Modul 26); harga salinan dijaga npm run cek-skema + butir templat PR.](aset/dua-penjaga-zod.png)

**Mengapa disalin, bukan diimpor langsung dari `../backend`?** Riset penulis mencobanya:

- **`aturan.ts` menyeret node-cron**, pustaka khusus Node, ke browser. `npm run build` tetap lolos dengan peringatan kuning `Module "path" has been externalized for browser compatibility`, tetapi halamannya putih dengan galat `fileURLToPath is not a function` di tab **Console**, baik di `npm run dev` maupun `npm run preview` ([🚨](#-kalau-tidak-jalan) *Layar putih dengan `fileURLToPath is not a function` …*).
- **Berkas backend mencari `zod` di `backend/node_modules`.** Tanpa `npm install` di backend, pemeriksaan tipe gagal `TS2307: Cannot find module 'zod'`; dengannya, bundel bisa memuat **dua** salinan Zod kecuali `vite.config.ts` diberi setelan tambahan.
- **Frontend harus bisa di-*build* sendirian**, tanpa folder `backend/`, misalnya saat dikemas dengan Docker di Modul 26.

Cara "satu sumber tanpa menyalin" ada, tetapi butuh setelan yang belum perlu kamu pikirkan sekarang ([🔬](#-bedah-teknis-opsional) *Satu sumber skema tanpa menyalin …*).

**Harga salinan dijaga mesin.** Dua salinan bisa diam-diam berbeda: backend diubah, frontend terlupa. Karena salinannya identik byte demi byte, mesin bisa memeriksanya. `npm run cek-skema` (skrip Node kecil `frontend/cek-skema.js`) membandingkan kedua berkas baris demi baris dengan aslinya di `../backend/src/schemas/`. Hasil yang benar: dua baris `SAMA`. Di uji penulis, satu angka yang diubah di salinan frontend langsung tertangkap, dengan kode keluar 1 ([🚨](#-kalau-tidak-jalan) *`npm run cek-skema` menulis `BEDA`*):

```text
SAMA  src/skema/kontrak.ts
BEDA  src/skema/aturan-dasar.ts, mulai baris 71:
  backend :   nama: z.string().min(1).max(60),
  frontend:   nama: z.string().min(1).max(80),
Salin ulang berkasnya dari ../backend/src/schemas/ (jangan diubah di frontend), lalu jalankan lagi.
```

Kenapa skrip sendiri, bukan `git diff --no-index`? Git for Windows bisa mengambil berkas backend dengan akhir baris CRLF, sedangkan salinan dari **Copy raw file** GitHub berakhir baris LF. Isinya sama, tetapi `git diff --no-index --exit-code` melaporkan seluruh 102 baris berbeda: gagal palsu. `cek-skema.js` menganggap CRLF sama dengan LF, menunjuk baris pertama yang benar-benar berbeda, dan tidak butuh `git`. Aturan mainnya satu: **ubah di backend dulu, salin ulang, lalu jalankan `npm run cek-skema`**. Komentar kepala `aturan-dasar.ts` menuliskannya, dan templat *pull request* mendapat butirnya ([➕ D](#d-tambahkan-butir-modul-24-ke-templat-pull-request)).

**Kata-katanya boleh lain, aturannya tidak.** `kontrak.ts` memanggil `z.config(z.locales.id())`, jadi pesan bawaan Zod di seluruh dashboard berbahasa Indonesia, tetapi kaku: `Terlalu kecil: diharapkan string memiliki >=1 karakter`. Skemanya tidak boleh diubah, karena salinannya harus identik. Jalan keluarnya peta pesan `pesanRamah` di `src/aturan.ts` ([8.1](#81-bahan-formulir-pesanramah-dan-uraikangalat400-di-aturants-serta-pembantu-kolom-di-kolomtsx-10-menit)), yang hanya dipakai saat formulir memeriksa isian (`…` = baris yang dilewati):

```ts
export const pesanRamah: z.core.$ZodErrorMap = (isu) => {
  if (isu.code === "invalid_type" && isu.expected === "number") return "Isi dengan angka";
  if (isu.code === "invalid_type" && isu.expected === "int") return "Isi dengan bilangan bulat (tanpa koma)";
  if (isu.code === "too_small" && isu.origin === "string") return "Wajib diisi";
  …
  return undefined; // selain itu: pesan bawaan Zod (berbahasa Indonesia, dari kontrak.ts)
};
```

Peta ini hanya menimpa pesan **bawaan** Zod. Pesan yang ditulis skema sendiri, seperti histeresis atau "5 bidang" cron, tidak disentuh, jadi kalimatnya persis sama dengan teks `400` server. Di uji penulis, kolom angka yang dikosongkan menghasilkan `Input tidak valid: diharapkan number, diterima NaN` tanpa peta, dan `Isi dengan angka` dengan peta. Opsi gaya Zod 3, `{ errorMap }`, ditolak TypeScript ([🚨](#-kalau-tidak-jalan) *`npm run build` gagal dengan galat tipe …*).

Satu isian di kedua penjaga, dari uji penulis:

| Isian | Penjaga 1 (browser) | Penjaga 2 (backend) |
| :-- | :-- | :-- |
| Nama kosong | `Wajib diisi` | `400` `body/nama Terlalu kecil: diharapkan string memiliki >=1 karakter` |
| Menyala di bawah 30, selesai di atas 25 | `padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis)` | `400` dengan kalimat yang sama |
| `selama_detik` 2,5 | `Isi dengan bilangan bulat (tanpa koma)` | `400` juga |
| Jadwal `61 * * * *` | lolos: browser hanya menghitung 5 bidang | `400` `ekspresi cron tidak sah`, ditaruh di bawah kolom cron |

Pesan histeresis punya satu kebiasaan: Zod baru menjalankan pemeriksaan gabungan itu kalau semua kolom lain di bagian "Kapan?" sudah sah. Kalau pesannya belum muncul, betulkan kolom lain dulu, lalu tekan **Simpan aturan**.

**Galat yang hanya diketahui server tetap sampai ke kolomnya.** Jawaban `400` berupa satu kalimat seperti `body/kondisi/cron ekspresi cron tidak sah, body/nama …`. `uraikanGalat400()` memecahnya per kolom, lalu `setError` menaruh setiap pesan di bawah kolomnya dan memindah fokus ke kolom pertama. Galat untuk kolom tanpa tempat pesan dikumpulkan di atas tombol **Simpan aturan** sebagai `Ditolak server: …`, misalnya `Ditolak server: kondisi.jenis: Input tidak valid` kalau backend-mu ternyata masih versi 1.0 ([🚨](#-kalau-tidak-jalan) *`Ditolak server: kondisi.jenis …`*).

**Arah sebaliknya juga diperiksa.** Skema yang sama memeriksa **jawaban** server: `Ack.safeParse` untuk jawaban perintah (5.1) dan daftar `GET /rules` (Praktik 7). Jawaban lain, seperti `telemetry` dan riwayat, masih dipercaya lewat tipe TypeScript seperti di Modul 23. Satu lagi: `skema/masuk.ts` **bukan** salinan. Skema formulir Masuk di backend tinggal di `routes/auth.ts`, bukan di `schemas/`, jadi dua barisnya ditulis ulang di frontend; backend tetap memeriksa ulang.

> ⬆️ **Sudah membaca Konsep 8?** Lanjut ke [Praktik 7](#praktik-7--daftar-aturan-dalam-kalimat-30-menit), lalu [Praktik 8](#praktik-8--form-aturan-buat-ubah-nonaktifkan-hapus-70-menit) (Konsep 7 dan Konsep 9 dipakai lagi di sana).

### 9. Aturan untuk manusia: naik atau turun, histeresis, dan siram berlapis

Sejak Modul 19, aturan otomatis adalah **data**: satu baris di tabel `rules` yang dinilai mesin aturan di backend ([Modul 19 Konsep 5](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#5-mesin-aturan-aturan-sebagai-data-bukan-kode)). Sampai minggu lalu, aturan hanya bisa dibuat lewat Bruno, dalam bentuk JSON. Penguji di Praktik 10 tidak akan menulis JSON; tugasnya berbunyi "atur supaya tanaman disiram otomatis kalau tanahnya lebih kering dari 30 %". Karena itu, satu aturan kini punya tiga wujud:

| Wujud | Untuk siapa | Aturan "Siram jika tanah < 30 %" |
| :--- | :--- | :--- |
| JSON (`POST /rules`) | backend dan database | `"kondisi": { "jenis": "ambang-bawah", "besaran": "tanah", "nyala_di_bawah": 30, "padam_di_atas": 35, "selama_detik": 10, … }` |
| Formulir ([Praktik 8](#praktik-8--form-aturan-buat-ubah-nonaktifkan-hapus-70-menit)) | admin | **Saat angka TURUN di bawah batas**; 30, 35, 10; lalu **Kirim satu perintah, sekali**: pompa 5 detik |
| Kalimat (`uraikanAturan()`, [Praktik 7](#praktik-7--daftar-aturan-dalam-kalimat-30-menit)) | semua akun, termasuk viewer | `Kalau kelembapan tanah di Latihan ruang tamu di bawah 30 % selama 10 detik, siram 5 detik (sekali). Aturan siap lagi sesudah kelembapan tanah naik di atas 35 %.` |

Kalimat itu dibuat browser dari data yang sama, jadi bunyinya tidak sama dengan kalimat log backend.

**Empat pertanyaan dalam satu aturan.** Formulir menanyakannya berurutan:

1. **Naik atau turun?** Backend v1.0 hanya mengenal arah naik: kondisi `ambang` menyala kalau bacaan **di atas** batasnya (kipas kalau suhu di atas 30 °C). Tanah yang mengering justru angkanya **turun**, sehingga v1.0 menolak aturan siram dengan `400`. Backend 1.1 ([Praktik 6](#praktik-6--backend-11-aturan-turun-di-bawah-dan-hapus-aturan-50-menit)) menambah kondisi `ambang-bawah`. Otaknya tidak ditulis ulang: `nilaiAmbangBawah()` membalik tanda semua angka, lalu memanggil `nilaiAmbang()` yang lama, seperti bayangan di cermin ("25 di bawah 30" sama artinya dengan "−25 di atas −30"). Hitungan "selama", jeda bacaan, dan sensor gagal ala Modul 19 ikut berlaku tanpa disalin.
2. **Batas nyala dan batas siap lagi (histeresis).** Dengan satu angka saja, tanah yang berayun 29–31 % membuat pompa menyiram setiap kali angkanya melintas. Karena itu, ada dua batas: menyiram **di bawah 30 %**, lalu **siap lagi di atas 35 %**. Jarak 30–35 itulah histeresis, sama dengan 30/28 °C pada kipas Modul 19. Tepat 30 belum menyiram (harus di bawah), tepat 35 belum siap lagi (harus di atas). Batas yang terbalik ditolak dengan `padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis)`, kalimat yang sama di browser dan backend (Konsep 8).
3. **Selama berapa detik?** `selama_detik` 10 berarti bacaan harus di bawah 30 terus-menerus selama 10 detik. Satu bacaan 30 ke atas, bacaan gagal, atau jeda tanpa bacaan lebih dari 60 detik mengulang hitungan dari nol. Di lab penulis, *toast* 🌱 muncul ±15 detik sesudah simulator diberi `tanah 25`: 10 detik "selama" ditambah jeda kiriman.
4. **Lalu apa?** Dua jenis aksi, yang berbeda saat aturan padam:

| Aksi (pilihan di formulir) | Saat aturan menyala | Saat aturan padam | Untuk |
| :--- | :--- | :--- | :--- |
| `sakelar` (**Nyalakan selama aturan menyala**) | menyalakan kipas atau lampu | memadamkannya lagi | kipas, lampu |
| `perintah` (**Kirim satu perintah, sekali**) | mengirim perintahnya **sekali**, misalnya pompa 5 detik | tidak mengirim apa pun; aturan hanya **siap lagi** | pompa, tirai |

Pilihan ketiga di bagian "Kapan?" (di layar: **Kapan aturan ini menyala?**), **Pada jam tertentu** (jadwal cron, jam WIB), hanya boleh berpasangan dengan `perintah`, karena jadwal tidak punya saat selesai.

**Sekali, lalu menunggu.** Pompa menyiram 5 detik saat aturan menyala, lalu diam walau tanah tetap 25 %: keputusan hanya diambil saat melintas, seperti kipas Modul 19. Simulator tidak membasahi tanahnya sendiri, jadi di [8.5](#85--siram-otomatis-dari-formulir-tanah-25-pompa-menyiram-lalu-siap-lagi-15-menit) kamu mengetik angka di atas 35 (misalnya `tanah 40`) sebagai pengganti air. Kalimat kejadian dari rekaman lab penulis, yang nanti tampil sebagai *toast* (Konsep 10):

```text
🌱 Tanah 25 % — pompa menyiram 5 detik otomatis
✅ Tanah naik ke 40 % — aturan siap lagi
⚠️ Tanah 25 % — perintah pompa ditolak perangkat: pompa ditolak: air tandon kurang
⚠️ Tanah 25 % — pompa TIDAK menjawab perintah (tidak dikirim ulang)
```

Dua baris terakhir menunjukkan satu keputusan backend 1.1: perintah yang **ditolak** perangkat (tandon di bawah 20 %) atau **tidak dijawab** dalam 5 detik tidak dicoba lagi sampai tanah sempat naik di atas 35 % atau aturannya disimpan ulang. Tanpa itu, tandon kosong memunculkan ⚠️ baru setiap beberapa detik. Akibatnya, sesudah tandon diisi, aturan itu baru menyiram lagi setelah dipicu ulang ([🚨](#-kalau-tidak-jalan) *Aturan siram tidak menyiram lagi …*). Kejadiannya juga membawa `data.ok`: `true` kalau perintah terlaksana, `false` kalau ditolak atau tidak dijawab, `null` kalau tidak ada perintah (siap lagi). Dashboard mewarnai *toast* dari nilai ini, bukan dari kalimatnya. Satu lagi: ingatan aturan (sudah menyiram atau belum) hilang saat backend dimulai ulang atau aturan itu diubah, jadi kalau tanah masih kering sesudah itu, pompa menyiram sekali lagi.

**Nonaktifkan atau hapus?**

| | Nonaktifkan (**Ubah** → hapus centang **Aktif** → **Simpan aturan**) | Hapus (**Ubah** → **Hapus aturan** → **Ya, hapus**) |
| :--- | :--- | :--- |
| Aturannya | tetap tersimpan, berlencana `Nonaktif`, bisa diaktifkan lagi | hilang dari tabel `rules` (`DELETE /rules/:id`) |
| Riwayat | tetap | tetap: perintah dan kejadian lamanya disimpan tanpa nomor aturan |
| Bertindak lagi? | tidak; perintah lamanya juga tidak dikirim ulang saat perangkat menyala ulang | sama |

Keduanya **tidak** memadamkan aktuator yang sedang dinyalakan aturan itu: kipas yang menyala dibiarkan menyala, sama dengan v1.0 (server tidak mengirim perintah apa pun). Padamkan dengan tombol **Kipas** (Praktik 5). Menghapus atau menonaktifkan aturan kipas juga tidak mencabut ambang `suhu_kipas_on` yang sudah tersimpan di Node 1 untuk pengaman lokalnya ([🚨](#-kalau-tidak-jalan) *Kipas tetap menyala …*).

**Siram berlapis: Modul 24 merevisi keputusan Modul 19.** Modul 19 sengaja tidak memberi pompa aturan ambang di server: Node 1 sudah menyiram sendiri sejak Modul 6, dan "dua otak untuk satu pompa bisa menyiram dua kali". Peringatan itu tetap benar. Yang berubah adalah kebutuhannya: syarat lulus modul ini meminta orang lain **membuat** aturan siram dari dashboard, padahal aturan lokal Node 1 tidak bisa dibuat, dilihat, atau dihapus dari dashboard. Aturan di server bisa: ia tampil sebagai kalimat, bisa diubah dan dihapus, dan setiap tindakannya tercatat di buku kejadian serta muncul sebagai *toast*. Jadi pompa kini punya dua otak, tetapi **berlapis**, tidak setara:

| Lapis | Siapa | Menyiram kalau | Caranya |
| :--- | :--- | :--- | :--- |
| Atas | aturan server (backend 1.1) | tanah di bawah **30 %** selama 10 detik | 5 detik, sekali; siap lagi di atas 35 % |
| Bawah | pengaman lokal Node 1 (firmware v1.6.0, tidak berubah) | tanah di bawah ambang lokal, yang kamu turunkan ke **20 %** dengan `ambang 20` di Serial Monitor (jalur perangkat; tersimpan di NVS) | 3 detik, istirahat 30 detik, diulang selama masih kering |
| Tandon | Node 1 | air tandon di bawah 20 % | pompa ditolak di kedua lapis; perintah server dijawab `pompa ditolak: air tandon kurang` |

Selama server menyala, tanah yang mengering melintasi 30 % lebih dulu; server menyiram, dan tanah naik sebelum menyentuh 20 %. Kalau server diam (backend mati atau WiFi putus), tanah terus mengering sampai di bawah 20 %, lalu Node 1 menyiram sendiri. Prinsipnya sama dengan pengaman kipas ([Modul 19 Konsep 10](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang)): server untuk keputusan utama, perangkat untuk pengaman yang tidak boleh berhenti. Bedanya, siram lokal Node 1 tidak menunggu mode offline; ia selalu berjaga. Yang memisahkan kedua lapis adalah **angkanya**, 30 lawan 20. Kalau `ambang 20` lupa diketik, ambang lokal tetap angka lamanya (biasanya bawaan 30 %; cek dengan `ambang`) dan kedua lapis bertindak di angka yang sama: siram ganda ([🚨](#-kalau-tidak-jalan) *Node 1 menyiram dua kali …*).

![Diagram aturan siram berlapis: server memutuskan, Node 1 berjaga (Konsep 9); grafik ilustrasi tanpa skala waktu, angka tanah contoh. Grafik kelembapan tanah 10–50 % dengan tiga garis: 35 % siap lagi dan 30 % server menyiram (hijau, pita histeresis 30–35 % di antaranya), 20 % Node 1 menyiram (teal, ambang 20). Kiri, server online (backend 1.1 berjalan); kanan berlatar abu-abu, server diam: backend mati atau WiFi putus. Tanah turun dari 44 %, di bawah 30 % selama 10 detik, lalu server menyiram di 25 % (penanda 1) dan tanah naik ke 36 %, di atas 35 % (penanda 2). Saat server diam tanah turun di bawah 30 % tanpa ada yang menyiram (penanda 3), lalu di bawah 20 % Node 1 menyiram (penanda 4) dan tanah naik lagi. Lajur pompa: 5 detik (server, sekali) dan 3 detik (Node 1). Catatan: 1 di bawah 30 % selama 10 detik, pompa 5 detik SEKALI, toast 🌱 Tanah 25 % — pompa menyiram 5 detik otomatis; 2 di atas 35 %, aturan siap lagi, toast ✅ Tanah naik ke 36 % — aturan siap lagi; 3 server diam, belum ada yang menyiram, tanpa kejadian; 4 Node 1 menyiram sendiri 3 detik, istirahat 30 detik, diulang selama masih kering. Kartu server, backend 1.1: ambang-bawah dengan nyala_di_bawah 30, padam_di_atas 35, selama_detik 10; aksi perintah pompa 5 detik dikirim SEKALI; bila ditolak atau tanpa jawaban, tidak dicoba lagi sampai tanah di atas 35 % atau aturan disimpan ulang. Kartu Node 1, pengaman lokal: firmware v1.6.0 tidak berubah; bawaan 30 %, ketik ambang 20 di Serial Monitor (tersimpan di NVS); bila lupa, siram ganda di 30 %. Kartu tandon: di bawah 20 % Node 1 menolak pompa dari server maupun lokal, pompa ditolak: air tandon kurang; simulator: tandon 15, dan karena tanahnya tidak basah sendiri, ketik tanah 25 lalu tanah 40. Bawah: revisi keputusan Modul 19, dulu pompa tanpa aturan ambang di server karena dua otak untuk satu pompa bisa menyiram dua kali; kini berlapis, satu otak saat online (server, 30 %) dan pengaman lokal saat server diam (Node 1, 20 %), seperti kipas pengaman Modul 19.](aset/aturan-siram-berlapis.png)

Jujur soal buktinya: lapis atas dibuktikan penulis dengan simulator `f00d00000001` dan perangkat tiruan. Lapis bawah dibaca dari firmware Node 1 v1.6.0 dan **belum diuji penulis di papan sungguhan**. Simulator tidak punya lapis bawah (ia tidak menyiram sendiri), tetapi meniru pengaman tandon: setelah `tandon 15`, ia menolak pompa ([6.5](#65-simulator-tanah-dan-tandon-diketik-dari-terminal-5-menit)).

Konsep ini dipakai tiga kali: skema, mesin, dan otomasi backend 1.1 di [6.1](#61-skema-11-aturan-dasarts-tanpa-node-cron-dan-aturants-yang-tipis-10-menit)–[6.3](#63-otomasi-dua-arah-perintah-sekali-dan-delete-rulesid-15-menit), kalimat aturan di Praktik 7, serta bagian "Kapan?" dan "Lalu apa yang dilakukan?" formulir di [8.2](#82-tiga-bagian-formulir-bagiankapan-bagianlalu-dan-konfirmasihapus-15-menit).

> ⬆️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 6 — Backend 1.1: aturan "turun di bawah" dan hapus aturan](#praktik-6--backend-11-aturan-turun-di-bawah-dan-hapus-aturan-50-menit). [Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend) dibaca sebelum Praktik 7.

### 10. Kabar di layar: *toast*, `aria-live`, dan tempatnya di HP

Sejak Modul 19, backend mencatat setiap hal penting di **buku kejadian**: aturan bertindak, jadwal berjalan, perangkat terputus, perintah dikirim ulang. Acaranya, `kejadian`, sudah sampai ke dashboard sejak Modul 23, tetapi v0.2 belum memakainya; hanya [🧩 Tingkat 2 Modul 23](../modul-23-dashboard-realtime/README.md#tingkat-2--buku-kejadian-live-isi-bagian-rumpang-45-menit) yang mencobanya. Minggu ini kabar itu tampil sebagai ***toast***: kartu kecil yang muncul sebentar, lalu hilang sendiri.

**Dua sumber kabar.**

| Sumber | Contoh (teks dari rekaman lab penulis) | Tampil di |
| :--- | :--- | :--- |
| Jawaban atas tindakanmu sendiri (HTTP) | `Aturan "Siram jika tanah < 30 %" disimpan.` · `Lampu: server tidak menjawab.` · `Lampu: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.` | tab yang bertindak saja |
| Acara `kejadian` dari backend | `🌱 Tanah 25 % — pompa menyiram 5 detik otomatis` · `f00d00000001 terputus (offline)` · `lampu f00d00000001 dilaporkan false, padahal diinginkan true (api); perintah dikirim lagi` | semua dashboard yang tersambung |

Satu jenis kejadian sengaja **tidak** menjadi *toast*: `aturan-diubah`. Yang menyimpan aturan sudah mendapat *toast* dari jawaban HTTP-nya; dashboard lain cukup mengambil ulang daftar aturan kalau layar **Aturan** sedang terbuka. Kabar yang terlewat saat soket dashboard putus tidak dikirim ulang (Modul 23), tetapi status perangkat disusulkan lewat satu `GET /devices` sesudah tersambung lagi ([4.3](#43-sambungan-pulih-status-disegarkan-get-devices-sekali-lagi-10-menit)).

***Toast*, pesan di kolom, atau lencana?** *Toast* hilang sendiri, jadi tidak semua kabar cocok untuknya:

| Kabar | Tempatnya |
| :--- | :--- |
| sesuatu yang **sudah terjadi** (disimpan, menyiram, terputus) | *toast* |
| isian formulir yang salah | di bawah kolomnya, sampai diperbaiki (Konsep 7) |
| keadaan yang **sedang berlangsung** (**Live**, `Offline`, `Menunggu konfirmasi perangkat…`) | lencana atau teks di tempatnya, selama keadaannya berlaku |

**Aturan *toast* dashboard ini** (`src/toast.ts` dan `WadahToast`, [4.1](#41-toastts-dan-wadahtoast-di-bawah-layar-hp-di-pojok-kanan-atas-laptop-lebar-15-menit)):

1. **Hilang sendiri sesudah 4 detik** lewat `setTimeout` sekali jalan (bukan `setInterval`, bukan *polling*), atau lebih cepat lewat tombol ✕ selebar 44 px.
2. **Paling banyak 2.** *Toast* ketiga mendorong yang paling lama keluar. Di HP, dua *toast* tiga baris sudah ±212 px, seperempat layar setinggi 812 px. Kejadian yang terdorong tetap tercatat di buku kejadian backend.
3. **Warna dari data, bukan dari kalimat.** Kabar `kejadian` berwarna merah kalau `status` perangkat kini offline (dibaca dari toko) atau `data.ok` aturan/jadwal bernilai `false` (Konsep 9); selebihnya netral. Kalimat buatan backend bisa berganti kata tanpa berganti arti, jadi menebak dari kata "ditolak" mudah meleset. Warna selalu ditemani ikon (`!`, `i`, `✓`) dan teks.
4. **Satu kejadian, satu *toast*.** Pendengar `kejadian` berupa fungsi bernama yang dilepas dengan `off`, seperti `telemetry` di Modul 23, jadi StrictMode tidak membuatnya dobel ([4.2](#42-acara-kejadian-menjadi-toast-pendengar-bernama-dan-off-10-menit)). Pesan dari server ditampilkan sebagai teks, bukan HTML.

**`aria-live`: wadah yang sudah ada sejak awal.** Pembaca layar membacakan bagian yang sedang difokus. *Toast* muncul di tempat lain tanpa memindah fokus, jadi orang yang tidak melihat layar tidak tahu ada kabar, kecuali wadahnya ditandai sebagai ***live region***: `<div role="status" aria-live="polite">`. Isi baru di wadah itu dibacakan; `polite` artinya menunggu kalimat yang sedang dibacakan selesai. Syaratnya, wadah harus ada **sebelum** isinya berubah (MDN: *establish the live region before updating its content*). Karena itu, `WadahToast` dipasang sekali di `TataLetak` dan selalu ada walau kosong; hanya kartunya yang datang dan pergi. Keterangan `Menunggu konfirmasi perangkat…` di bawah tombol kendali (Praktik 5) memakai `role="status"` yang sama. Inilah pesan status menurut WCAG 2.2, pedoman aksesibilitas web (SC 4.1.3, tingkat AA; lihat Konsep 11): diumumkan tanpa memindah fokus. Batasan jujurnya: belum diuji dengan pembaca layar sungguhan (NVDA, VoiceOver), dan sebagian pembaca layar bisa membacakan ulang seluruh isi wadah. Pengguna papan ketik menjumpai ✕ *toast* yang sedang tampil tepat sesudah tombol **Keluar** dalam urutan Tab, walau di HP *toast* tampak di bawah layar.

**Tempatnya: di bawah layar HP, di kanan atas laptop lebar.** Aturannya satu kalimat: *toast* boleh di samping isi hanya kalau ada ruang kosong di samping (layar 1280 px ke atas); di HP dan tablet, *toast* di bawah layar, dan halaman diberi ruang kosong di bawah setinggi dua *toast*. Mengapa tidak di atas saja? Di lab penulis, satu *toast* di bawah kepala halaman sudah menutupi tombol **+ Aturan baru** di lebar 375, 768, dan 1024 px; baru di 1280 px ada ruang kosong di kanan kolom isi. Kelas-kelas yang mengaturnya:

| Berkas | Kelas | Gunanya |
| :--- | :--- | :--- |
| `WadahToast.tsx` | `fixed inset-x-0 bottom-0` | di bawah 1280 px, wadah menempel di tepi bawah layar (`fixed`: diam walau halaman digulir) |
| `WadahToast.tsx` | `xl:sticky xl:top-0 xl:bottom-auto xl:h-0` | mulai 1280 px (`xl:`), wadah setinggi nol di bawah kepala (`sticky`: ikut digulir lalu menempel di tepi atas); kartunya menggantung di ruang kosong kanan |
| `WadahToast.tsx` | `pointer-events-none` (kartu: `pointer-events-auto`) | ruang kosong wadah tidak menghalangi ketukan |
| `TataLetak.tsx` (`<main>`) | `pb-64 xl:pb-6` | ruang kosong 16rem (256 px) di ujung halaman: tombol paling bawah bisa digulir ke atas *toast* |
| `index.html` (`<html>`) | `scroll-pb-64 xl:scroll-pb-0` | saat browser menggulir **sendiri** ke kolom atau tombol (Tab, kolom salah isi), ia menyisakan 16rem di bawah (bukan saat jempol menggulir) |

Jarak dari tepi bawah paling sedikit 1rem, atau setinggi garis/tombol sistem HP (`env(safe-area-inset-bottom)`, 0 di browser biasa). Di lab penulis (mode perangkat DevTools, bukan HP sungguhan), tidak ada tombol aksi yang tertutup di 153 posisi uji, di 375 × 812 dan 1280 px, terang dan gelap. Tombol yang kebetulan tepat di tepi bawah layar saat *toast* datang tetap tertutup sampai halaman digulir sedikit, *toast* ditutup, atau 4 detik lewat. Di HP pendek (375 × 667), dua *toast* sekaligus bisa menutupi baris pompa sampai halaman digulir ±60 px. Di HP yang dimiringkan atau selebar 320 px, *toast* bisa menutupi Lampu, Kipas, atau tombol pompa ([🚨](#-kalau-tidak-jalan) *Toast menutupi …*): pegang HP tegak saat menguji, dan kalau penguji di Praktik 10 macet karenanya, catat sebagai temuan.

> ⬆️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 4 — Kabar di layar: *toast*](#praktik-4--kabar-di-layar-toast-40-menit). [Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack) dan Konsep 2 dibaca sebelum Praktik 5.

### 11. Dipakai orang lain: aksesibilitas dasar, layar utama, dan uji pengguna

Syarat lulus modul ini tidak kamu kerjakan sendiri: orang lain, dengan HP-nya sendiri dan tanpa bantuanmu, harus bisa masuk, menyalakan lampu, dan membuat aturan siram. Kamu hafal letak setiap tombol karena kamu yang membuatnya; penguji melihatnya untuk pertama kali. Tiga hal menyiapkan dashboard untuk mata baru itu.

**Aksesibilitas dasar: diukur, bukan dirasa.** Sejak Modul 22–23, dashboard sudah punya sasaran jari 44 px (`min-h-11`), tanpa gulir mendatar di 375/768/1280 px, dan warna yang selalu ditemani teks. Minggu ini sisanya diukur dengan angka **WCAG 2.2**, pedoman aksesibilitas web dari W3C. Setiap butirnya disebut SC (*success criterion*) dan bertingkat A, AA, atau AAA (paling ketat); modul ini mengejar AA. Kontras ditulis sebagai rasio terang teks lawan latarnya, dari 1 : 1 (warna sama) sampai 21 : 1 (hitam di atas putih). Alat ukurnya Lighthouse (pemeriksa otomatis di DevTools) dan Color Picker:

| Yang diperiksa | Batas | Di mana |
| :--- | :--- | :--- |
| Kontras teks | **4,5 : 1**; teks besar (≥ 24 px, atau ≈ 18,5 px tebal) 3 : 1 (SC 1.4.3, AA) | 9.1: Lighthouse, Color Picker |
| Kontras komponen dan tanda keadaan (tepi kolom, cincin fokus, tombol tertekan) | **3 : 1** terhadap warna di sebelahnya (SC 1.4.11, AA) | 9.1, 9.2 |
| Target sentuh | minimal **24 × 24 px** (SC 2.5.8, AA, baru di WCAG 2.2); kurikulum memakai **44 × 44 px** (SC 2.5.5, AAA; = ukuran bawaan Apple 44 pt; Android 48 dp) | 9.2 |
| Fokus terlihat | cincin fokus tampak saat Tab (SC 2.4.7, AA) | 9.2 |
| Label dan galat | `<label htmlFor>`; `aria-invalid` + `aria-describedby` saat isian salah (react-hook-form tidak memasangnya sendiri) | Praktik 2 dan 8 |

Di lab penulis, dashboard tahap Praktik 8 belum lolos beberapa batas: teks putih di atas teal-600 hanya 3,66 : 1 (tombol **Masuk**, **Simpan aturan**, **Lampu** yang menyala), `text-slate-400` di atas putih 2,63 : 1, `text-slate-500` di atas latar `slate-100` 4,34 : 1, layar Masuk tanpa `<main>`, dan tepi kolom yang berfokus 2,42 : 1. Perbaikannya tiga aturan warna ([9.1](#91-lighthouse-dan-color-picker-ukur-kontras-lalu-perbaiki-warnanya-15-menit)): teks putih di atas teal → **teal-700** (5,36 : 1); teks redup di atas latar abu-abu muda → **slate-600**; `slate-400` hanya untuk mode gelap. Cincin fokus kolom ikut memakai teal-700 (9.2), dan layar Masuk dibungkus `<main>` (9.1). Sesudahnya Lighthouse memberi 100 di semua layar, terang dan gelap. Dua catatan: skor bergantung isi layar dan versi alat, jadi yang dikejar adalah audit gagal yang menjadi lulus, bukan angkanya; dan lolos Lighthouse berarti "lolos pemeriksaan dasar", **bukan** "sudah aksesibel" (sebagian audit harus diperiksa manusia).

**Layar utama: pintasan, bukan aplikasi terpasang.** Pintasan di layar utama HP sudah kamu buat di [Modul 13](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#34-buka-dashboard-di-laptop-dan-hp) dan [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#praktik-8--sakelar-lampu-dari-hp-20-menit). Yang baru:

- **Label menunya berubah.** Bantuan resmi Chrome Android kini menulis ⋮ → **Install and create shortcut** → **Create shortcut** → **Add**; pintasan berlogo Chrome itu terbuka di Chrome. Di iPhone, **Bagikan** → **Add to Home Screen**; sejak Safari 26 (iOS 26), setiap situs di layar utama terbuka sebagai *web app* secara bawaan. Untuk alamat `http://` di WiFi rumah, keduanya **belum diuji penulis di HP sungguhan**.
- **Pintasan ≠ aplikasi terpasang.** Di HP, dashboard dibuka lewat `http://192.168.1.10:5173` (IP-mu akan berbeda). Alamat `http://` selain `localhost` bukan **konteks aman** (yang aman hanya HTTPS atau `localhost`): saat dashboard dibuka lewat IP LAN dari laptop penulis, `isSecureContext` bernilai `false` dan *service worker* (skrip latar untuk luring dan notifikasi) tidak tersedia. Syarat instal Chrome juga HTTPS, jadi PWA (*progressive web app*, aplikasi web yang bisa dipasang) sungguhan menunggu Modul 27. Yang kita tambahkan di [9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit) hanya ikon dan nama pintasan: `apple-touch-icon.png` 180 × 180 (gambar sendiri) dan `<meta name="apple-mobile-web-app-title" content="Rumah Pintar">`. Rinciannya di [🔬](#-bedah-teknis-opsional) *Pintasan layar utama dan aplikasi terpasang*.
- **IP laptop bisa berubah**, dan pintasannya ikut rusak ([🚨](#-kalau-tidak-jalan) *Pintasan di layar utama HP …*).

**Uji pengguna: orang lain, HP-nya sendiri, tanpa bantuan.** Cara paling jujur mengetahui dashboard mudah dipakai adalah melihat orang lain memakainya. Uji di [10.3](#103--uji-pengguna-dari-hp-penguji-empat-tugas-tanpa-bantuan-25-menit) memegang tiga aturan:

1. **Tugas dalam bahasa sehari-hari.** Lembar tugas (`kode/uji-pengguna/lembar-tugas.md`) berisi empat tugas: masuk, nyalakan lampu, "atur supaya tanaman disiram otomatis kalau tanahnya lebih kering dari 30 %", dan keluar. Tanpa kata MQTT, *ack*, atau nama menu: menemukan menu **Aturan** sendiri termasuk ujiannya.
2. **Bercerita sambil mengerjakan** (*think-aloud*). Penguji mengucapkan yang ia pikirkan ("saya cari tombol…", "ini maksudnya apa ya…"), jadi kamu tahu **di mana** ia ragu, bukan hanya berhasil atau tidak.
3. **Tanpa bantuan.** Selama tugas berjalan, kamu hanya boleh membacakan ulang kalimat tugasnya: tidak menunjuk layar, tidak menyebut nama tombol, tidak memegang HP-nya. Macet lebih dari 2 menit, menyerah, atau bertanya langsung = tugas itu **dibantu**. Kamu boleh membantu supaya uji berlanjut, tetapi tugas itu belum lulus: perbaiki yang membingungkan (label, letak, pesan), lalu ulangi.

![Diagram uji pengguna: orang lain, HP-nya sendiri, tanpa bantuan (Konsep 11, Praktik 10; lembar di kode/uji-pengguna/). 1 Persiapan: akun penguji sementara admin dengan npm run pengguna -- tambah penguji@rumah.test Penguji admin dari PowerShell atau Terminal macOS, sandi minimal 15 karakter di kartu kertas; kondisi awal lampu padam, belum ada aturan siram, simulator tandon acak dan tanah acak, akun viewer siap untuk L4; mode HP (HOST=0.0.0.0, IP laptop di CORS_ORIGIN, npm run dev:hp), HP penguji membuka dulu http://IP-laptop:8080/health. 2 Empat tugas di HP penguji: buka http://IP-laptop:5173 dan masuk (L1); nyalakan lampu (L2); atur supaya tanaman disiram otomatis kalau tanahnya lebih kering dari 30 % (L3); keluar; penguji bercerita sambil mengerjakan (think-aloud). 3 Aturan tanpa bantuan: pelajar hanya membacakan ulang tugas; batang waktu hijau berhasil sampai 2 menit, sesudahnya jingga macet = dibantu; hanya berhasil yang lulus. 4 Catat setiap tugas: hasil, lama, kutipan tanpa nama, dan bukti log backend (login: akun N (admin), sesi N, IP 192.168.…; … lampu = true, ack ok=true dalam N ms; Aturan N (…) dibuat lewat API; logout: sesi N). Cabang jingga, ada tugas yang dibantu: 5 Perbaiki label, letak, atau pesan yang membingungkan dan catat perubahannya; 6 Ulangi tugas itu dengan penguji yang sama sesudah jeda atau penguji lain, boleh beberapa putaran, kembali ke tugas. Cabang hijau, semua berhasil: 7 L4, pelajar masuk sebagai viewer di HP yang sama, tanpa tombol kendali, + Aturan baru, atau Ubah; lalu npm run pengguna -- hapus penguji@rumah.test, sobek atau simpan kartu sandi, kembali ke mode laptop, HP penguji tidak bisa membuka lagi. Catatan: lembar terisi di belajar-iot/modul-24/ tanpa sandi, nama lengkap, atau foto wajah; izin rekam boleh ditolak; bila belum ada penguji, tulis jujur, jangan mengarang hasil.](aset/uji-pengguna.png)

Penguji yang macet memberi temuan tentang **dashboard**, bukan tentang dirinya; lembar tugas mengatakannya kepada penguji sejak awal. Catat setiap tugas di `lembar-catatan.md`: berhasil atau dibantu, lama, kutipan tanpa nama, dan baris log backend sebagai bukti, misalnya `login: akun N (admin), sesi N, IP 192.168.…` (IP HP penguji, bukan laptop). Satu penguji sudah memenuhi syarat; dua atau tiga dianjurkan. Syarat L4 (akun viewer tanpa tombol kendali) kamu periksa sendiri di HP yang sama sesudahnya. Akun penguji (`penguji@rumah.test`, peran admin) hanya sementara: sandinya di kartu kertas, akunnya dihapus sesudah uji. Minta izin sebelum merekam, dan simpan lembarnya tanpa nama lengkap, sandi, atau foto wajah.

Yang tidak boleh: mengarang hasil. Kalau belum ada orang lain atau HP sungguhan, tulis "belum", jangan mencentang. Mode perangkat DevTools ([Modul 22 7.1](../modul-22-react-dasar/README.md#71-mode-perangkat-devtools-dashboard-di-375-768-dan-1280-px-8-menit)) membantu gladi, tetapi tidak menggantikan HP orang lain. Status uji penulis sendiri ditulis apa adanya di kotak catatan awal modul dan di [📚](#-sumber--atribusi-gambar).

> ⬆️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 9 — Aksesibilitas, HP, dan layar utama](#praktik-9--aksesibilitas-hp-dan-layar-utama-40-menit), lalu [Praktik 10 — Uji kelulusan: dipakai orang lain dari HP](#praktik-10--uji-kelulusan-dipakai-orang-lain-dari-hp-70-menit).

## 🔧 Praktik langkah demi langkah

Sepuluh praktik mengubah dashboard v0.2 yang **melihat** menjadi dashboard v1.0 yang **memerintah**, di folder `frontend` repositori `rumah-pintar-mini`, cabang baru `fitur/kendali-peran`. Hanya Praktik 6 yang mengubah kode `backend` (naik ke 1.1.0) dan simulator di `alat/`; firmware tidak berubah. Setiap praktik yang mengubah kode diakhiri *commit* ke cabang itu, yang digabung ke `main` lewat *pull request* di [➕ E](#e--gabungkan-fiturkendali-peran-ke-main-lewat-pull-request-dashboard-v10-kendali--peran--backend-11).

Keadaan `frontend` di akhir setiap praktik ada di [`kode/tahap/`](kode/tahap/); `praktik-6` tidak ada karena Praktik 6 hanya mengubah backend dan simulator (frontend-nya sama dengan tahap 5). Hasil akhirnya: dashboard 1.0.0 di [`kode/frontend/`](kode/frontend/), backend 1.1.0 di [`kode/backend/`](kode/backend/) dengan daftar perubahannya, [`kode/backend-1.1.diff`](kode/backend-1.1.diff), dan simulator di [`kode/alat/`](kode/alat/) dengan [`kode/alat.diff`](kode/alat.diff). Folder tahap tanpa `node_modules`, `package-lock.json`, dan `README.md`: pakai untuk membandingkan, bukan untuk menggantikan seluruh foldermu. Langkah bertanda ⭐ (1.5, 2.4, 3.3, 5.5, 6.4, 8.5, dan 10.3) wajib untuk lulus, ditambah ➕ E. Setiap praktik memakai tumpukan [Langkah 1 Kemenangan Cepat](#langkah-1--nyalakan-semuanya-lalu-masuk-sebagai-admin-4-menit).

### Praktik 1 — Satu alamat untuk setiap layar: React Router (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan terminal Kemenangan Cepat: `backend`, `frontend` (Vite), dan satu terminal kosong untuk Git dan npm (jalur laptop: broker dan simulator di `alat` tetap menyala); **Docker Desktop** (`rumahpintar-db`); serta **Chrome** atau **Edge**. Konsep yang dipakai: 3.
>
> ⭐ **Wajib** — langkah 1.5: **Back**, **Forward**, **F5**, dan tautan langsung membuka layar yang sama, alamat asing dijawab "tidak ditemukan", dan pindah layar tidak menambah satu pun sambungan *live* baru.

Praktik ini memberi setiap layar alamatnya sendiri: Daftar `/perangkat`, Detail `/perangkat/:id`, dan Riwayat `/perangkat/:id/riwayat`, ditambah layar "tidak ditemukan" dan menu **Perangkat**. Formulir *login* masih yang lama, tanpa penjaga per halaman (Praktik 2). Kode di akhir praktik ini: [`kode/tahap/praktik-1/frontend/`](kode/tahap/praktik-1/frontend/).

#### 1.1 Cabang `fitur/kendali-peran` dan empat paket dengan versi tertulis (5 menit)

Di terminal kosong (folder `rumah-pintar-mini`), pindah ke `main` terbaru, lalu buat cabang untuk seluruh pekerjaan Modul 24:

```text
git switch main
git pull
git switch -c fitur/kendali-peran
git status
```

`git pull` mengambil dashboard v0.2 dari *pull request* Modul 23. `git status` harus menjawab `nothing to commit, working tree clean`; kalau `TombolPertama.tsx` atau `DetailPerangkat.tsx` masih disebut, bereskan dulu [Langkah 5 Kemenangan Cepat](#langkah-5--hapus-tombolpertamatsx-2-menit). Lalu:

```text
cd frontend
```

Hentikan Vite di terminal `frontend` (**Ctrl + C**) dan biarkan mati sampai akhir 1.4: berkas yang diganti di 1.2–1.4 saling bergantung, jadi dashboard baru jalan lagi sesudah semuanya tersimpan. Lalu, di terminal kosong (folder `frontend`), pasang keempat paket sekaligus, **dengan versinya**:

```text
npm install react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7
```

`react-router` untuk praktik ini; `react-hook-form`, `@hookform/resolvers` (penghubung formulir dengan Zod), dan `zod` (versi yang sama dengan backend) untuk formulir di Praktik 2 dan 8. `react-router-dom` tidak dipasang: v8 menghapusnya; semua diimpor dari `"react-router"`.

**Hasilnya (contoh):**

```text
added 6 packages, and audited 101 packages in 44s

16 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Enam paket = empat yang diminta ditambah dua paket pembantu. Lamanya 10–44 detik di laptop penulis, tanpa peringatan. `dependencies` di `package.json` kini memuat empat baris baru, misalnya `"react-router": "^8.5.0"`; `"version"` tetap `0.2.0` sampai Praktik 10. Muncul `npm error code ERESOLVE`? Versi `@hookform/resolvers` terlewat dari perintahmu ([🚨](#-kalau-tidak-jalan) *`npm install` berhenti dengan `npm error code ERESOLVE` …*; versi lengkap di [🧰](#-yang-perlu-disiapkan)).

#### 1.2 `BrowserRouter` di `main.tsx` dan peta rute di `App.tsx` (10 menit)

**Langkah 1 — `main.tsx`.** `<BrowserRouter>` membaca alamat dan riwayat browser (**Back**, **Forward**), lalu membagikannya ke seluruh dashboard, jadi ia membungkus `<App />`. Ganti seluruh isi `src/main.tsx` dengan:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// Modul 24: BrowserRouter membaca alamat di browser (misalnya /perangkat/f00d00000001) dan memberikannya ke <Routes> di App
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

Yang baru: impor `BrowserRouter`, satu komentar, dan dua baris pembungkus. Simpan (**Ctrl + S**). Di komentar `vite.config.ts`, ganti `(Praktik 8)` menjadi `(Modul 23 Praktik 8)` agar tak tertukar dengan Praktik 8 modul ini, lalu simpan.

**Langkah 2 — peta rute di `App.tsx`.** Buka [`kode/tahap/praktik-1/frontend/src/App.tsx`](kode/tahap/praktik-1/frontend/src/App.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/App.tsx`-mu. Papan tulis `tampilan` dan variabel `layar` Modul 23 hilang. Isi `<main>` kini daftar alamat di satu tempat:

```tsx
        <Routes>
          <Route path="/" element={<Navigate to="/perangkat" replace />} />
          <Route path="/perangkat" element={<HalamanDaftar />} />
          <Route path="/perangkat/:id" element={<HalamanDetail />} />
          <Route path="/perangkat/:id/riwayat" element={<HalamanRiwayat onSesiHabis={sesiHabis} />} />
          <Route path="*" element={<TidakDitemukan />} />
        </Routes>
```

- Setiap `<Route>` = satu rute: pola alamat (`path`) → layar (`element`); `:id` = bagian alamat yang berubah-ubah.
- `/` dialihkan ke `/perangkat` oleh `<Navigate replace>`; `replace` menimpa entri riwayat, jadi **Back** tidak terjebak di `/`.
- `path="*"` menangkap alamat lain (1.4). `HalamanRiwayat` menerima `onSesiHabis` seperti `Riwayat` dulu (`401` → formulir *login*).
- `useRealtime()` tetap dipanggil sekali, di atas `<Routes>`: layar datang dan pergi, soketnya tetap (Konsep 3).

Simpan. Garis merah di VS Code (berkas `./halaman/…` yang belum ada, lalu *props* yang hilang) lenyap sesudah 1.4.

#### 1.3 Layar dari alamat: `src/halaman/` dan `useParams` (15 menit)

Detail kini bisa dibuka tanpa melewati Daftar (tautan, **Back**, **F5**), jadi ia mencari perangkatnya sendiri dari alamat.

**Langkah 1 — `GET /devices` sekali sesudah masuk.** Ini sudah dikerjakan `App.tsx` yang kamu tempel: efek di bawah `useRealtime()` memanggil `ambilPerangkat()` setiap kali `sudahLogin` menjadi `true`, lalu menaruh hasilnya (`setPerangkat`) atau pesan galatnya (`setGalatPerangkat`) di [toko](../modul-23-dashboard-realtime/README.md#4-satu-toko-untuk-semua-layar-zustand-dan-selektor). Ganti seluruh isi [`src/toko.ts`](kode/tahap/praktik-1/frontend/src/toko.ts) dengan versi tahap ini (**Copy raw file**). Yang baru hanya isian `galatPerangkat` (awalnya `null`, dikosongkan lagi oleh `setPerangkat`) dan pengisinya:

```ts
  setGalatPerangkat: (pesan) => set({ galatPerangkat: pesan }),
```

Lakukan hal yang sama untuk [`src/components/DaftarPerangkat.tsx`](kode/tahap/praktik-1/frontend/src/components/DaftarPerangkat.tsx): efek `ambilPerangkat()` dan *props*-nya dibuang, layar ini cukup membaca `perangkat` dan `galatPerangkat` dari toko, dan setiap kartu menjadi `<Link>` (1.4).

**Langkah 2 — folder `src/halaman/`.** Klik kanan folder **`frontend/src`** → **New Folder…**, beri nama **`halaman`**: satu berkas pembungkus tipis per layar, berisi komponen lama. Buat **`src/halaman/Daftar.tsx`**:

```tsx
// halaman/Daftar.tsx - layar /perangkat: judul + kartu-kartu perangkat (Modul 22-23).
// Modul 24: setiap layar punya berkas pembungkus tipis di folder halaman/. Isinya tetap komponen lama.
import DaftarPerangkat from "../components/DaftarPerangkat";

export default function HalamanDaftar() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Daftar Perangkat</h2>
      <DaftarPerangkat />
    </>
  );
}
```

Lalu **`src/halaman/Detail.tsx`**, layar yang membaca alamatnya sendiri:

```tsx
// halaman/Detail.tsx - layar /perangkat/:id. Perangkatnya dicari dari ALAMAT (useParams), bukan dititipkan layar Daftar,
// jadi alamat ini bisa dibuka langsung, dimuat ulang (F5), atau dikirim ke orang lain.
import { Link, useParams } from "react-router";
import DetailPerangkat from "../components/DetailPerangkat";
import { useToko } from "../toko";

export default function HalamanDetail() {
  const { id } = useParams(); // bagian :id dari alamat, misalnya "f00d00000001"
  const daftar = useToko((s) => s.perangkat); // null = GET /devices belum dijawab
  const galat = useToko((s) => s.galatPerangkat);
  const perangkat = daftar?.find((p) => p.device_id === id);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200">{galat}</p>;
  if (daftar === null) return <p className="text-slate-500 dark:text-slate-400">Memuat perangkat…</p>;
  // id yang tidak ada di daftar (salah ketik, perangkat sudah dihapus): tidak ada yang diminta ke API
  if (perangkat === undefined) {
    return (
      <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p>
          Perangkat <span className="font-mono">{id}</span> tidak ditemukan.
        </p>
        <Link to="/perangkat" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
          ← Kembali ke daftar
        </Link>
      </div>
    );
  }
  // key = device_id: perangkat lain berarti DetailPerangkat baru dengan state segar (pola resmi React, Modul 22)
  return <DetailPerangkat key={perangkat.device_id} perangkat={perangkat} />;
}
```

- `useParams()` memberi `{ id: "f00d00000001" }` untuk alamat `/perangkat/f00d00000001` (nama `id` dari pola `:id`).
- Sebelum Detail digambar: galat, `Memuat perangkat…` (misalnya sesaat sesudah **F5**), atau `Perangkat … tidak ditemukan.` bila `id` tidak ada di daftar, tanpa bertanya ke API.
- `key={perangkat.device_id}`: perangkat lain = `DetailPerangkat` baru dengan *state* segar (pola Modul 22).

Terakhir **`src/halaman/Riwayat.tsx`**, kembaran `Detail.tsx` yang memasang komponen `Riwayat` dan meneruskan `onSesiHabis` dari `App`. Ambil isinya dari [versi tahap ini](kode/tahap/praktik-1/frontend/src/halaman/Riwayat.tsx) (**Copy raw file**).

#### 1.4 `Link` dan `NavLink`: menu, tombol kembali, dan alamat yang tidak dikenal (10 menit)

Pindah layar kini = pindah alamat. `<Link to="…">` adalah tautan sungguhan (bisa dibuka di tab baru) yang mengganti alamat **tanpa memuat ulang halaman**, jadi toko dan soket tetap hidup.

**Langkah 1 — tautan kembali.** Ganti seluruh isi [`src/components/DetailPerangkat.tsx`](kode/tahap/praktik-1/frontend/src/components/DetailPerangkat.tsx) dan [`src/components/Riwayat.tsx`](kode/tahap/praktik-1/frontend/src/components/Riwayat.tsx) dengan versi tahap ini (**Copy raw file**). *Props* `onKembali`/`onRiwayat` dibuang: **← Kembali ke daftar**, **Riwayat →**, dan **← Kembali ke detail** kini `<Link>`, misalnya `<Link to="/perangkat">`.

**Langkah 2 — layar "tidak ditemukan".** Buat **`src/halaman/TidakDitemukan.tsx`**:

```tsx
// halaman/TidakDitemukan.tsx - layar untuk alamat yang tidak ada di peta rute (Route path="*"), misalnya /perangkt.
import { Link } from "react-router";

export default function TidakDitemukan() {
  return (
    <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <h2 className="text-lg font-semibold">Halaman tidak ditemukan</h2>
      <p className="mt-1 text-sm">Alamat ini tidak ada di dashboard. Mungkin salah ketik?</p>
      {/* <Link> = tautan milik React Router: pindah layar TANPA memuat ulang halaman (sambungan live tidak putus) */}
      <Link to="/perangkat" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
        Ke daftar perangkat
      </Link>
    </div>
  );
}
```

Rute `path="*"` memasangnya untuk alamat yang tidak cocok, misalnya salah ketik `/perangkt`.

**Langkah 3 — menu `NavLink`.** Kepala `App.tsx` yang kamu tempel di 1.2 punya menu pertama:

```tsx
            <NavLink
              to="/perangkat"
              className={({ isActive }) =>
                "inline-flex min-h-11 items-center rounded-lg px-3 " +
                (isActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700")
              }
            >
              Perangkat
            </NavLink>
```

`NavLink` = `Link` yang tahu apakah alamatnya sedang dibuka (`isActive`). Tanpa prop `end`, menu **Perangkat** juga aktif di `/perangkat/<id>` dan Riwayatnya, dan tautan aktif diberi `aria-current="page"` untuk pembaca layar. Menu **Aturan** menyusul di Praktik 7.

**Langkah 4 — nyalakan.** Semua garis merah di VS Code seharusnya sudah hilang. Di terminal `frontend`, jalankan `npm run dev`.

**Hasilnya (contoh):**

```text
> rumah-pintar-mini-frontend@0.2.0 dev
> vite

12.21.43 [vite] (client) Re-optimizing dependencies because lockfile has changed

  VITE v8.3.5  ready in 452 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

`Re-optimizing dependencies …` muncul sekali, pada `npm run dev` pertama sesudah paket baru dipasang. Buka `http://localhost:5173` dan masuk (kalau diminta): alamatnya menjadi `/perangkat` dan menu **Perangkat** ditandai. Ketuk satu kartu: alamatnya `/perangkat/<device_id>`, menu tetap ditandai.

#### 1.5 ⭐ Back, F5, dan tautan langsung: layar bertahan, sambungan *live* tidak putus (10 menit)

Letakkan terminal `backend` di samping browser, lalu:

1. Di Daftar, ketuk kartu **Latihan ruang tamu** (jalur perangkat: Node 1-mu), lalu **Riwayat →**. Tekan **Back**, lalu **Forward**, lalu bolak-balik lagi lewat tautan dan menu **Perangkat** (penulis: sepuluh kali pindah layar).
2. Tekan **F5** di Detail, lalu di Riwayat.
3. Salin alamat Detail, buka tab baru di browser yang sama, tempel, lalu **Enter** (saat belum masuk, lihat [2.4](#24--tautan-langsung-sebelum-masuk-ke-masuk-lalu-kembali-ke-layar-semula-10-menit)).
4. Ketik di bilah alamat `localhost:5173/perangkat/abcdef`, lalu `localhost:5173/tidak/ada`, lalu `localhost:5173/`.

**Hasilnya:** **Back** dari Riwayat kembali ke Detail `/perangkat/f00d00000001`, **Forward** ke Riwayatnya lagi. **F5** dan tab baru tetap di alamatnya: Detail tampil lagi dengan `Online`, Riwayat dengan `1 jam`, `24 jam`, `7 hari`. `/perangkat/abcdef` menulis `Perangkat abcdef tidak ditemukan.`; `/tidak/ada` menulis `Halaman tidak ditemukan` dan `Alamat ini tidak ada di dashboard. Mungkin salah ketik?` dengan tautan **Ke daftar perangkat** (menu **Perangkat** tidak ditandai); `/` pindah sendiri ke `/perangkat`. Di terminal `backend` (**contoh**):

```text
[12:22:03] INFO: klien realtime tersambung: 50pyM87L9Clt-WxEAAAC (akun 1, admin)
…
[12:22:08] INFO: GET /devices/f00d00000001/readings?from=2026-10-25T05:17:08.692Z -> 200 (6 ms)
[12:22:08] INFO: GET /devices/f00d00000001/readings?from=2026-10-25T05:17:08.700Z -> 200 (4 ms)
[12:22:09] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (34 ms)
[12:22:09] INFO: GET /devices/f00d00000001/readings?bucket=1h -> 200 (18 ms)
…
[12:22:24] INFO: GET /auth/me -> 200 (4 ms)
[12:22:24] INFO: GET /auth/me -> 200 (2 ms)
[12:22:24] INFO: klien realtime tersambung: nZ8woxccz_w9_NkNAAAD (akun 1, admin)
```

Selama pindah layar hanya ada `GET …/readings`: grafik 5 menit Detail (`from=…`) dan rata-rata per jam Riwayat (`bucket=1h`), masing-masing dua kali karena StrictMode di mode dev. Tidak ada `klien realtime terputus` atau `tersambung` baru; di uji penulis, sepuluh kali pindah layar menambah 0 sambungan. Tiga baris terakhir milik **F5** pertama: memuat ulang membuat dokumen baru, jadi `GET /auth/me` bertanya lagi dan soket baru tersambung. Itu wajar untuk **F5**, tab baru, dan alamat yang diketik, tetapi tidak untuk tautan dan menu.

**Kamu lulus langkah ⭐ ini** kalau **Back**, **Forward**, **F5**, dan tab baru selalu menampilkan layar sesuai alamatnya, kedua alamat asing dijawab "tidak ditemukan" tanpa layar putih, dan log backend tidak menulis `klien realtime tersambung` baru selama kamu pindah layar lewat tautan dan menu. Gejala lain ada di [🚨](#-kalau-tidak-jalan): *F5 di `/perangkat/…` memberi layar putih …*, *Menu Perangkat tidak ditandai aktif …*, dan *Sambungan live putus …*.

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` menyebut sembilan berkas berubah (`package.json`, `package-lock.json`, `vite.config.ts`, `main.tsx`, `App.tsx`, `toko.ts`, dan tiga komponen) serta `src/halaman/` di `Untracked files`. Lalu:

```text
git add package.json package-lock.json vite.config.ts src
git commit -m "React Router: satu alamat untuk setiap layar (Modul 24 Praktik 1)"
```

> ⬆️ **Selesai Praktik 1?** Setiap layar kini beralamat, tetapi belum dijaga: formulir *login* lama masih memutuskan semuanya. Baca [Konsep 4](#4-rute-terproteksi-penjaga-di-depan-pintu-halaman) dan [Konsep 7](#7-formulir-yang-memeriksa-dirinya-react-hook-form-bukan-usestate-per-kolom), lalu lanjut ke [Praktik 2 — Rute terproteksi dan *login* yang disempurnakan](#praktik-2--rute-terproteksi-dan-login-yang-disempurnakan-55-menit).

### Praktik 2 — Rute terproteksi dan *login* yang disempurnakan (55 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 1 yang masih menyala (`backend` v1.0 dengan `npm run dev`, Vite di `frontend`; jalur laptop juga broker dan simulator) plus satu terminal kosong di folder `frontend` untuk Git; **Docker Desktop** (`rumahpintar-db` menyala); serta **Chrome** atau **Edge** di `http://localhost:5173` dengan DevTools (tab **Console** dan **Network**) dan satu jendela penyamaran di 2.4. Konsep yang dipakai: 4 dan 7.
>
> ⭐ **Wajib** — langkah 2.4: alamat Riwayat yang dibuka tanpa masuk berpindah ke `/masuk`, lalu kembali ke Riwayat yang sama sesudah kamu masuk.

Sesudah Praktik 1, setiap layar punya alamat, tetapi pintunya masih satu: sebuah `if` di `App.tsx` memilih `Login.tsx` Modul 22 atau seluruh dashboard. Praktik ini memasang penjaga di depan pintu halaman (Konsep 4) dan layar Masuk yang memeriksa isiannya sendiri (Konsep 7). Paketnya sudah terpasang di [1.1](#11-cabang-fiturkendali-peran-dan-empat-paket-dengan-versi-tertulis-5-menit). Urutan tempelnya penting: `App.tsx` baru mengimpor `halaman/Masuk.tsx`, jadi ia diganti paling akhir, di ujung 2.3. Sampai saat itu `App.tsx` lama tetap menjalankan dashboard-mu, dan garis merah di editor wajar.

#### 2.1 Siapa yang sedang masuk: irisan sesi di `toko.ts` dan `GET /auth/me` sekali (10 menit)

Di Praktik 1, `pengguna` masih papan tulis kecil milik `App` (`useState`), dan `App` menitipkan `sesiHabis` ke Riwayat lewat *props*. Kini penjaga, bingkai, dan layar Masuk juga perlu tahu siapa yang masuk. Daripada dititipkan berantai, jawabannya ditaruh di papan pengumuman bersama, toko Zustand, sebagai **irisan sesi** (bagian toko yang mengurus sesi).

**Langkah 1 — Toko.** Buka [`kode/tahap/praktik-2/frontend/src/toko.ts`](kode/tahap/praktik-2/frontend/src/toko.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/toko.ts`-mu. Tipe `Toko` bertambah empat isian, dan isi awalnya:

```ts
  pengguna: "memuat",
  pesanMasuk: null,
  setPengguna: (pengguna) => set({ pengguna, pesanMasuk: null }),
  belumMasuk: (pesan) => set({ pengguna: null, pesanMasuk: pesan }),
```

`pengguna` punya tiga keadaan: `"memuat"` (`GET /auth/me` belum dijawab, karena itu menjadi isi awal), `null` (belum masuk), atau objek `{ id, email, nama, peran }`. `pesanMasuk` adalah kalimat di atas formulir Masuk: `belumMasuk` mengisinya (atau `null`), `setPengguna` menghapusnya. Di paling bawah berkas ada fungsi baru `sesiHabis()`, yang memanggil `belumMasuk("Sesi sudah habis. Silakan masuk lagi.")`. Karena berada di luar komponen, fungsi ini tidak pernah dibuat ulang, jadi `useCallback` Modul 23 tidak diperlukan lagi. Peran tetap hanya di memori tab, tidak pernah di `localStorage`.

**Langkah 2 — Riwayat mengambil `sesiHabis` dari toko.** Ganti seluruh isi `src/halaman/Riwayat.tsx` dengan [tahapnya](kode/tahap/praktik-2/frontend/src/halaman/Riwayat.tsx) (**Copy raw file**): *prop* `onSesiHabis` hilang, dan `sesiHabis` diimpor dari `../toko`. Di `src/soket.ts` hanya satu komentar yang berubah; salin juga dari [tahapnya](kode/tahap/praktik-2/frontend/src/soket.ts) supaya sama persis.

**Yang mengisi `pengguna`** adalah `useEffect` di `App`, sekali saat halaman dibuka, seperti Modul 22–23. Bedanya, hasilnya kini ditulis ke toko: jawaban `GET /auth/me` → `setPengguna(p)`; `401` → `belumMasuk(null)`; gangguan lain, misalnya backend mati → `belumMasuk(pesan)`. Efek ini ada di `App.tsx` baru (2.3); sampai saat itu, garis merah *prop* `onSesiHabis` di `App.tsx` wajar.

#### 2.2 Penjaga dan bingkai: `JagaMasuk` dan `TataLetak` (15 menit)

**Langkah 1 — Penjaga.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`JagaMasuk.tsx`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-2/frontend/src/components/JagaMasuk.tsx`](kode/tahap/praktik-2/frontend/src/components/JagaMasuk.tsx) di GitHub, klik **Copy raw file**, lalu tempel):

```tsx
// JagaMasuk.tsx - penjaga rute (protected route). Dipasang sebagai rute tata letak di App: semua layar di dalamnya
// hanya tampil untuk yang sudah masuk. Yang belum masuk dipindahkan ke /masuk, sambil membawa alamat tujuannya (dari),
// supaya sesudah masuk ia kembali ke layar yang tadi dibukanya.
import { Navigate, Outlet, useLocation } from "react-router";
import { useToko } from "../toko";

export default function JagaMasuk() {
  const pengguna = useToko((s) => s.pengguna);
  const location = useLocation(); // alamat yang sedang dibuka, misalnya /perangkat/f00d00000001/riwayat

  if (pengguna === "memuat") {
    // GET /auth/me belum dijawab: jangan buru-buru mengusir ke /masuk, mungkin cookie-nya masih berlaku
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Memeriksa sesi…</p>;
  }
  if (pengguna === null) {
    // replace = alamat yang dijaga tidak ditinggal di riwayat browser, jadi tombol Back tidak memantul ke sini lagi
    return <Navigate to="/masuk" replace state={{ dari: location }} />;
  }
  return <Outlet />; // sudah masuk: tampilkan layar anak yang cocok dengan alamatnya
}
```

Tiga cabangnya dibahas di [Konsep 4](#4-rute-terproteksi-penjaga-di-depan-pintu-halaman): `"memuat"` → `Memeriksa sesi…`; `null` → ke `/masuk` sambil menitipkan alamat tadi sebagai `dari`; sudah masuk → `<Outlet />`.

**Langkah 2 — Bingkai.** Kepala dashboard (judul, lencana **Live**, menu **Perangkat**, nama dan peran, **Keluar**) pindah dari `App` ke **tata letak**: bingkai yang tetap, sementara isinya berganti. Klik kanan **`frontend/src/components`** → **New File…**, beri nama **`TataLetak.tsx`**, buka [`kode/tahap/praktik-2/frontend/src/components/TataLetak.tsx`](kode/tahap/praktik-2/frontend/src/components/TataLetak.tsx) di GitHub, klik **Copy raw file**, lalu tempel. Isinya: `<header>` dari `App.tsx` Praktik 1 (tombol **Keluar**-nya kini memanggil `klikKeluar`); `<main>` berisi `<Outlet />`, tempat React Router menaruh Daftar, Detail, atau Riwayat; `GET /devices` **sekali** setiap kali bingkai muncul (sesudah masuk), supaya Detail yang dibuka lewat tautan, **Back**, atau **F5** tetap punya daftar perangkat; dan **Keluar** minimal yang sengaja belum tuntas:

```tsx
  async function klikKeluar() {
    // Modul 23: putuskan sambungan live DULU (alasan "io client disconnect": tidak disambung ulang), baru hapus sesi.
    socket.disconnect();
    try {
      await keluar();
    } catch {
      // backend tidak menjawab: layar tetap kembali ke formulir login
    }
    useToko.getState().belumMasuk(null);
  }
```

Tidak ada `navigate("/masuk")`: begitu `pengguna` menjadi `null`, `JagaMasuk` sendiri yang memindahkan layar. Dua hal masih tertinggal dan dibereskan di [3.2](#32-keluar-yang-tuntas-kosongkansemua-dan-empat-langkah-berurutan-15-menit): data perangkat masih di toko, dan penjaga ikut menitipkan alamat terakhir, sehingga orang **berikutnya** di tab yang sama mendarat di layar terakhir orang sebelumnya.

**Langkah 3 — Halaman tidak ditemukan.** Rute `*` nanti berada di luar penjaga dan bingkai, jadi tampil tanpa kepala. Ganti seluruh isi `src/halaman/TidakDitemukan.tsx` dengan [tahapnya](kode/tahap/praktik-2/frontend/src/halaman/TidakDitemukan.tsx) (**Copy raw file**): kini dibungkus `<main>` sendiri, dan judulnya `<h1>`.

Dashboard belum berubah: `App.tsx` lama belum memakai `JagaMasuk` dan `TataLetak`.

#### 2.3 Layar Masuk dengan react-hook-form dan Zod: `skema/masuk.ts` dan `halaman/Masuk.tsx` (20 menit)

**Langkah 1 — Skema isian.** Klik kanan **`frontend/src`** → **New Folder…**, beri nama **`skema`**. Klik kanan folder itu → **New File…**, beri nama **`masuk.ts`**, lalu ketik (atau buka [tahapnya](kode/tahap/praktik-2/frontend/src/skema/masuk.ts) di GitHub, klik **Copy raw file**, lalu tempel):

```ts
// masuk.ts - isian formulir Masuk sebagai skema Zod. Meniru skema Masuk di backend/src/routes/auth.ts (Modul 20):
// email sah paling panjang 254 huruf, sandi 1-200 huruf. Skema itu tidak ada di backend/src/schemas/, jadi tidak bisa
// disalin utuh; dua barisnya ditulis ulang di sini dengan pesan yang ramah. Backend tetap memeriksa ulang.
import { z } from "zod";

export const IsianMasuk = z.object({
  email: z.email("Email tidak sah, contohnya admin@rumah.test").max(254, "Email terlalu panjang"),
  sandi: z.string().min(1, "Sandi wajib diisi").max(200, "Sandi terlalu panjang"),
});

export type IsianMasuk = z.infer<typeof IsianMasuk>; // { email: string; sandi: string }
```

Aturannya sama dengan skema `Masuk` backend Modul 20, yang tinggal di dalam berkas rute, bukan di `schemas/`. Karena itu, ia ditulis ulang dengan pesan untuk manusia, bukan disalin; backend tetap memeriksa ulang. Salinan identik dari backend baru dimulai di [5.1](#51-salin-kontrakts-lalu-kirimperintah-yang-memeriksa-jawaban-dengan-acksafeparse-15-menit) dan dijaga `npm run cek-skema` di [7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit) ([Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend)). `IsianMasuk` dipakai dua kali: sebagai nilai ia skemanya, sebagai tipe ia bentuk isiannya.

**Langkah 2 — Layar Masuk.** Klik kanan **`frontend/src/halaman`** → **New File…**, beri nama **`Masuk.tsx`**, buka [`kode/tahap/praktik-2/frontend/src/halaman/Masuk.tsx`](kode/tahap/praktik-2/frontend/src/halaman/Masuk.tsx) di GitHub, klik **Copy raw file**, lalu tempel. Intinya (`useForm` dan `kirim`) sudah kamu baca di [Konsep 7](#7-formulir-yang-memeriksa-dirinya-react-hook-form-bukan-usestate-per-kolom). Di atasnya, layar ini mengambil titipan penjaga:

```tsx
  const dari = (location.state as { dari?: { pathname: string; search: string } } | null)?.dari;
  const tujuan = dari ? dari.pathname + dari.search : "/perangkat";
```

Sesudah `useForm`:

```tsx
  if (pengguna !== null && pengguna !== "memuat") return <Navigate to={tujuan} replace />;
```

`kirim` hanya menulis `setPengguna(…)` ke toko. Toko yang berubah menggambar ulang layar ini, lalu `<Navigate>` memindahkanmu ke `tujuan`, dengan `replace` supaya **Back** tidak kembali ke formulir. `useForm` ditulis sebelum `return` mana pun, karena *hook* harus dipanggil di setiap gambar ulang. Yang lain di berkasnya: `<form noValidate>` (semua pesan dari skema, bukan gelembung browser); setiap kotak dengan `<label htmlFor>`, `{...register("email")}`, serta `aria-invalid` dan `aria-describedby`; `autoComplete="username"` dan `"current-password"` untuk pengelola sandi; `errors.root?.server` (`role="alert"`) di atas tombol; `pesanMasuk` (`role="status"`); dan tombol `Sedang masuk…` selama `isSubmitting`.

**Langkah 3 — Peta rute bersarang.** Ganti seluruh isi `src/App.tsx` dengan kode di bawah (atau buka [tahapnya](kode/tahap/praktik-2/frontend/src/App.tsx) di GitHub, klik **Copy raw file**, lalu tempel):

```tsx
// App.tsx - akar dashboard. Tiga tugasnya, masing-masing SEKALI untuk seluruh dashboard:
// 1. bertanya ke backend "siapa saya?" (GET /auth/me) saat halaman dibuka;
// 2. menjaga sambungan live (Socket.IO) selama sudah login (Modul 23);
// 3. memegang peta rute (Modul 24): alamat mana menampilkan layar mana, dan layar mana yang dijaga.
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { GalatApi, siapaSaya } from "./api";
import JagaMasuk from "./components/JagaMasuk";
import TataLetak from "./components/TataLetak";
import HalamanDaftar from "./halaman/Daftar";
import HalamanDetail from "./halaman/Detail";
import HalamanMasuk from "./halaman/Masuk";
import HalamanRiwayat from "./halaman/Riwayat";
import TidakDitemukan from "./halaman/TidakDitemukan";
import { useRealtime } from "./soket";
import { sesiHabis, useToko } from "./toko";

export default function App() {
  // Sekali saat App tampil ([] = tanpa dependensi): cek apakah cookie login dari kunjungan sebelumnya masih berlaku.
  // Hasilnya ditulis ke toko, tempat penjaga rute (JagaMasuk) dan layar Masuk membacanya.
  useEffect(() => {
    let ignore = false;
    siapaSaya()
      .then((p) => {
        if (!ignore) useToko.getState().setPengguna(p);
      })
      .catch((err) => {
        if (ignore) return;
        // 401 = memang belum login: cukup tampilkan formulir. Selain itu (backend atau database mati): beri tahu.
        const sungguhBelum = err instanceof GalatApi && err.kode === 401;
        useToko.getState().belumMasuk(sungguhBelum ? null : err instanceof GalatApi ? err.message : "Gagal memeriksa login.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Modul 23: sambungan live (Socket.IO) hidup selama sudah login. Modul 24: hook ini tetap di sini, DI ATAS <Routes>,
  // jadi pindah layar tidak memutus sambungan live.
  const sudahLogin = useToko((s) => s.pengguna !== null && s.pengguna !== "memuat");
  useRealtime(sudahLogin, sesiHabis);

  // Peta rute: setiap <Route> memasangkan satu pola alamat dengan satu layar. :id = bagian alamat yang berubah-ubah,
  // dibaca layarnya dengan useParams(). Route tanpa path (JagaMasuk, TataLetak) = "rute tata letak": ia menggambar
  // dirinya, lalu menaruh layar anak yang cocok di tempat <Outlet /> miliknya.
  return (
    <Routes>
      <Route path="/masuk" element={<HalamanMasuk />} />
      <Route element={<JagaMasuk />}>
        <Route element={<TataLetak />}>
          <Route path="/" element={<Navigate to="/perangkat" replace />} />
          <Route path="/perangkat" element={<HalamanDaftar />} />
          <Route path="/perangkat/:id" element={<HalamanDetail />} />
          <Route path="/perangkat/:id/riwayat" element={<HalamanRiwayat />} />
        </Route>
      </Route>
      {/* alamat lain yang tidak cocok dengan pola mana pun, sudah masuk atau belum */}
      <Route path="*" element={<TidakDitemukan />} />
    </Routes>
  );
}
```

`App` menyusut dari 155 menjadi 61 baris: `useState` pengguna, `useCallback`, `logout`, kepala, dan `if` pemilih formulir pindah ke toko, `TataLetak`, dan `JagaMasuk`. Di `<Routes>`, `/masuk` dan `*` berada di luar; semua layar dashboard di dalam `JagaMasuk` → `TataLetak`. Kedua pembungkus tanpa `path` itu tidak mengubah alamat: keduanya menggambar dirinya, lalu menaruh layar anak yang cocok di `<Outlet />`.

**Langkah 4 — Hapus formulir lama.** Di Explorer VS Code, klik kanan `src/components/Login.tsx` → **Delete**.

Simpan semuanya; Vite memperbarui browser sendiri (HMR). Selama *cookie* Praktik 1 masih berlaku, kamu tetap masuk. Sekarang coba formulirnya:

1. Klik **Keluar**. Alamatnya menjadi `/masuk`.
2. Klik **Masuk** dengan kedua kotak kosong.
3. Ketik `admin@rumah` di **Email**, isi **Sandi** sembarang, klik **Masuk**.
4. Ketik `admin@rumah.test` dengan sandi yang salah, klik **Masuk**.
5. Masuk dengan sandi yang benar.

**Hasilnya (contoh, kode tahap Praktik 2 di lab penulis):**

| Langkah | Di layar |
| :-- | :-- |
| 1 | `Rumah Pintar Mini`, `Masuk dengan akun Modul 20 untuk melihat dashboard.`, kotak **Email** dan **Sandi**, tombol **Masuk** |
| 2 | di bawah Email `Email tidak sah, contohnya admin@rumah.test`, di bawah Sandi `Sandi wajib diisi` |
| 3 | hanya `Email tidak sah, contohnya admin@rumah.test` |
| 4 | kotak merah di atas tombol: `email atau sandi salah` (`401`); log `backend`: `WARN: login gagal: akun 1 (IP 127.0.0.1)` |

Langkah 2–3 tidak sampai ke backend: `handleSubmit` memanggil `kirim` hanya kalau skema meloloskan isiannya. Sesudah langkah 5 kamu kembali ke layar terakhir sebelum **Keluar**, bukan selalu ke Daftar: itulah titipan `dari`.

> [!NOTE]
> **Ingin melihat `429`?** Klik **Keluar**, lalu ulangi langkah 4. Di lab penulis, sepuluh percobaan dalam semenit dijawab `email atau sandi salah`, dan yang ke-11 `terlalu banyak percobaan: coba lagi dalam 51 detik` (log: `POST /auth/login -> 429 (2 ms)`; batas Modul 20). Angka detiknya sisa jendela 60 detik. Selama belum habis, sandi yang benar pun ditolak, karena permintaan ditolak sebelum sandinya diperiksa: tunggu dulu.

Garis merah di `useForm` atau `zodResolver`? Lihat [🚨](#-kalau-tidak-jalan) *`npm run build` gagal dengan galat tipe di `useForm` atau `zodResolver`*.

#### 2.4 ⭐ Tautan langsung sebelum masuk: ke `/masuk`, lalu kembali ke layar semula (10 menit)

Inilah uji *protected route* Silabus. Jendela penyamaran tidak membawa *cookie* jendela biasamu, jadi di sana kamu sungguh belum masuk.

1. Tekan **Ctrl + Shift + N** (macOS: **Cmd + Shift + N**) untuk jendela penyamaran (Chrome: *Incognito*, Edge: *InPrivate*), lalu **F12** → tab **Console**.
2. Buka `http://localhost:5173/perangkat/f00d00000001/riwayat` (jalur perangkat: ganti dengan `device_id` Node 1-mu).
3. Di **Console**, ketik `JSON.stringify(history.state.usr)`, lalu **Enter** (`usr` = tempat React Router menaruh `state` titipan penjaga).
4. Masuk sebagai `admin@rumah.test`, lalu ulangi langkah 3.
5. Tekan **Back** browser, lalu **Forward**, lalu **F5**.
6. (Opsional) Di tab **Network**, ganti **No throttling** dengan profil yang lambat, tekan **F5**, lalu kembalikan ke **No throttling**. Tutup jendela penyamaran.

**Hasilnya (contoh, jendela baru tanpa *cookie* di lab penulis):**

| Langkah | Yang terlihat |
| :-- | :-- |
| 2 | alamat berganti sendiri menjadi `/masuk`; formulir Masuk tampil |
| 3 | `{"dari":{"pathname":"/perangkat/f00d00000001/riwayat","search":"","hash":"","state":null,"key":"default"}}` |
| 4 | kembali ke `/perangkat/f00d00000001/riwayat`: `← Kembali ke detail`, `Riwayat`, `Latihan ruang tamu`, `1 jam` `24 jam` `7 hari`; `history.state.usr` kini `null` |
| 5 | riwayat tab hanya halaman awal jendela dan Riwayat (`/masuk` sudah diganti), jadi **Back** tidak ke formulir; **F5** tetap di Riwayat |
| 6 | layar kosong selama Vite mengirim puluhan berkas, lalu `Memeriksa sesi…` ±3 detik (profil buatan lab: jeda 1,5 detik), lalu kepala dengan `Menyambung ulang…` → `Live` |

Log `backend`:

```text
[12:24:57] INFO: GET /auth/me -> 401 (1 ms)
[12:24:57] INFO: POST /auth/refresh -> 401 (0 ms)
…
[12:26:11] INFO: login: akun 1 (admin), sesi 5, IP 127.0.0.1
[12:26:11] INFO: POST /auth/login -> 200 (269 ms)
[12:26:11] INFO: klien realtime tersambung: 2g0SdiJdkyGhx9_OAAAM (akun 1, admin)
```

`GET /auth/me` dan satu *refresh* dijawab `401`, jadi `App` menulis `belumMasuk(null)` dan penjaga memindahkanmu. Begitu masuk, sambungan *live* langsung tersambung tanpa memuat ulang.

**Kamu lulus langkah ⭐ ini** kalau alamat Riwayat di jendela penyamaran berpindah ke `/masuk`, sesudah masuk kamu kembali ke Riwayat yang sama tanpa mengetik alamatnya lagi, **Back** tidak membawamu ke formulir, dan **F5** tetap di Riwayat.

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` menyebut lima berkas berubah, `Login.tsx` terhapus, serta `JagaMasuk.tsx`, `TataLetak.tsx`, `Masuk.tsx`, dan folder `skema/` belum terlacak. Lalu (`git add src` ikut mencatat berkas yang dihapus):

```text
git add src
git commit -m "Rute terproteksi dan formulir Masuk react-hook-form (Modul 24 Praktik 2)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-2/frontend/`](kode/tahap/praktik-2/frontend/).

> ⬆️ **Selesai Praktik 2?** Setiap layar kini terjaga, tetapi akun admin dan viewer masih melihat layar yang sama, dan **Keluar** belum tuntas. Baca [Konsep 5](#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan) dan [Konsep 6](#6-keluar-yang-tuntas-putus-soket-hapus-sesi-kosongkan-toko), lalu lanjut ke [Praktik 3 — Peran di layar dan Keluar yang tuntas](#praktik-3--peran-di-layar-dan-keluar-yang-tuntas-40-menit).

### Praktik 3 — Peran di layar dan Keluar yang tuntas (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 2 (`backend` v1.0, Vite di `frontend`; jalur laptop juga broker dan simulator) dan terminal kosong di `frontend` untuk Git; **Docker Desktop** (`rumahpintar-db`); **Chrome** atau **Edge** dengan DevTools; serta **Bruno** (3.3). Konsep yang dipakai: 5 dan 6.
>
> ⭐ **Wajib** — langkah 3.3: sesudah admin **Keluar**, viewer di tab yang sama mendarat di `/perangkat` tanpa sisa layar admin, `/aturan/baru` menjawab `Khusus admin`, dan Bruno `nyalakan lampu` sebagai viewer dijawab `403`.

Toko sudah tahu siapa yang masuk dan apa perannya, tetapi belum ada layar yang memakainya, dan **Keluar** masih meninggalkan data serta alamat terakhir. Tombol admin belum ada (tombol kendali datang di Praktik 5, **+ Aturan baru** di Praktik 8), jadi yang dijaga sekarang adalah **alamat** layar pengubah, `/aturan/baru`. Kode di akhir praktik ini: [`kode/tahap/praktik-3/frontend/`](kode/tahap/praktik-3/frontend/).

#### 3.1 `useAdmin()` dan penjaga kedua `KhususAdmin` (10 menit)

**Langkah 1 — Toko.** Buka [`kode/tahap/praktik-3/frontend/src/toko.ts`](kode/tahap/praktik-3/frontend/src/toko.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/toko.ts`-mu. Tambahannya: bidang `keluarSengaja` dan fungsi `kosongkanSemua` untuk 3.2, serta `useAdmin()` di bagian bawah, persis seperti di [Konsep 5](#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan): `true` hanya kalau peran admin sudah pasti.

**Langkah 2 — Penjaga kedua.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`KhususAdmin.tsx`**, lalu ketik (atau buka [tahapnya](kode/tahap/praktik-3/frontend/src/components/KhususAdmin.tsx) di GitHub, klik **Copy raw file**, lalu tempel):

```tsx
// KhususAdmin.tsx - penjaga kedua (pasangan JagaMasuk): rute tata letak untuk layar yang mengubah sesuatu (form aturan).
// Akun admin melihat layarnya; akun viewer melihat penjelasan "Khusus admin", bukan formulir yang toh akan ditolak.
// Ini kenyamanan layar, BUKAN pengaman: kalau viewer mengirim perubahan lewat jalan lain (Bruno, Console), satpam backend
// tetap menjawab 403.
import { Link, Outlet } from "react-router";
import { useAdmin } from "../toko";

export default function KhususAdmin() {
  const admin = useAdmin();
  if (admin) return <Outlet />;
  return (
    <div className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Khusus admin</h2>
      <p className="mt-1">
        Layar ini hanya untuk akun admin. Akunmu viewer: kamu bisa melihat semua data, tetapi tidak bisa mengubah apa pun.
      </p>
      <Link to="/perangkat" className="mt-2 inline-flex min-h-11 items-center font-medium text-teal-700 hover:underline dark:text-teal-300">
        ← Kembali ke daftar perangkat
      </Link>
    </div>
  );
}
```

Ia kembaran `JagaMasuk`: rute tata letak tanpa `path`. Admin mendapat `<Outlet />` (layar anaknya); akun lain mendapat penjelasan dan tautan kembali, bukan dialihkan diam-diam. Cabang `"memuat"` tidak perlu, karena `KhususAdmin` selalu berada di dalam `JagaMasuk`.

**Langkah 3 — Tempat sementara formulir aturan.** Klik kanan **`frontend/src/halaman`** → **New File…**, beri nama **`FormAturan.tsx`**, lalu ketik:

```tsx
// halaman/FormAturan.tsx - layar /aturan/baru (khusus admin). Praktik 3 baru memasang alamat dan penjaganya, supaya
// pembatasan peran bisa dicoba; formulirnya sendiri dibuat di Praktik 8.
export default function HalamanFormAturan() {
  return (
    <p className="rounded-lg bg-white p-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      Formulir aturan baru (dibuat di Praktik 8).
    </p>
  );
}
```

Cukup satu kalimat supaya pembatasan peran bisa dicoba sekarang; formulir sungguhan menggantikannya di [8.3](#83-formaturan-di-aturanbaru-useform-dengan-zodresolver-pratinjau-kalimat-dan-tombol-simpan-20-menit).

**Langkah 4 — Peta rute.** Ganti seluruh isi `src/App.tsx` dengan [tahapnya](kode/tahap/praktik-3/frontend/src/App.tsx) (**Copy raw file**). Isinya bertambah dua impor, efek `pageshow` (3.2), dan satu cabang di bawah rute Riwayat:

```tsx
          {/* penjaga kedua: layar yang mengubah sesuatu hanya untuk admin */}
          <Route element={<KhususAdmin />}>
            <Route path="/aturan/baru" element={<HalamanFormAturan />} />
          </Route>
```

Urutannya: `JagaMasuk` ("sudah masuk?") → `TataLetak` → `KhususAdmin` ("admin?") → layar. Simpan semuanya. Belum ada menu ke alamat ini, jadi ketik `localhost:5173/aturan/baru` di bilah alamat, masih sebagai admin.

**Hasilnya:** di bawah kepala dashboard tertulis `Formulir aturan baru (dibuat di Praktik 8).` Akun viewer dicoba di 3.3.

#### 3.2 Keluar yang tuntas: `kosongkanSemua` dan empat langkah berurutan (15 menit)

**Keluar** Praktik 2 memutus soket dan sesi, tetapi tidak mengosongkan toko; kini setiap langkah [Konsep 6](#6-keluar-yang-tuntas-putus-soket-hapus-sesi-kosongkan-toko) punya tempat.

**Langkah 1 — Pengosong toko.** Sudah ikut tertempel di `toko.ts` (3.1):

```ts
export function kosongkanSemua(pesanMasuk: string | null, keluarSengaja = false) {
  useToko.setState({ ...useToko.getInitialState(), pengguna: null, pesanMasuk, keluarSengaja }, true);
}
```

`pengguna: null` ditulis tersendiri karena isi awalnya `"memuat"`: tanpa itu, penjaga menulis `Memeriksa sesi…` selamanya. `sesiHabis()` kini juga memakainya, dengan kalimat `Sesi sudah habis. Silakan masuk lagi.`

**Langkah 2 — Empat langkah di `TataLetak`.** Ganti seluruh isi `src/components/TataLetak.tsx` dengan [tahapnya](kode/tahap/praktik-3/frontend/src/components/TataLetak.tsx) (**Copy raw file**). Yang berubah hanya impor `kosongkanSemua` dan fungsi ini:

```tsx
  async function klikKeluar() {
    // 1. Putuskan sambungan live DULU (alasan "io client disconnect": tidak disambung ulang). Kalau terbalik, server yang
    //    memutus kita ("io server disconnect"), lalu soket mencoba menyambung lagi (Modul 23).
    socket.disconnect();
    // 2. Hapus sesi di backend. Cookie HttpOnly tidak bisa dihapus JavaScript; hanya jawaban backend yang menghapusnya.
    let pesan = "Kamu sudah keluar.";
    try {
      await keluar();
    } catch {
      pesan =
        "Keluar belum tuntas: server tidak menjawab, jadi sesi di server belum terhapus. Setelah server menyala lagi, " +
        "muat ulang halaman ini lalu tekan Keluar sekali lagi.";
    }
    // 3. Kosongkan semua isi toko: orang berikutnya di tab ini tidak melihat sisa data atau tombol akun sebelumnya.
    //    true = keluar sengaja: alamat layar ini tidak dititipkan ke layar Masuk (lihat JagaMasuk).
    kosongkanSemua(pesan, true);
    // 4. Pindah ke layar Masuk: dikerjakan penjaga rute (JagaMasuk) begitu toko kosong, dengan replace. Tombol Back
    //    tidak kembali ke layar dashboard tadi; kalaupun Back dipakai, penjaga tetap mengalihkan ke /masuk.
  }
```

Langkah 4 bukan kode dan tanpa `navigate` (alasannya di Konsep 6). Kalau `POST /auth/logout` gagal, langkah 3 dan 4 tetap jalan; hanya kalimatnya yang berganti.

**Langkah 3 — Penjaga yang tidak menitipkan alamat.** Ganti seluruh isi `src/components/JagaMasuk.tsx` dengan:

```tsx
// JagaMasuk.tsx - penjaga rute (protected route). Dipasang sebagai rute tata letak di App: semua layar di dalamnya
// hanya tampil untuk yang sudah masuk. Yang belum masuk dipindahkan ke /masuk, sambil membawa alamat tujuannya (dari),
// supaya sesudah masuk ia kembali ke layar yang tadi dibukanya.
import { Navigate, Outlet, useLocation } from "react-router";
import { useToko } from "../toko";

export default function JagaMasuk() {
  const pengguna = useToko((s) => s.pengguna);
  const keluarSengaja = useToko((s) => s.keluarSengaja); // Modul 24 Praktik 3: baru saja menekan Keluar?
  const location = useLocation(); // alamat yang sedang dibuka, misalnya /perangkat/f00d00000001/riwayat

  if (pengguna === "memuat") {
    // GET /auth/me belum dijawab: jangan buru-buru mengusir ke /masuk, mungkin cookie-nya masih berlaku
    return <p className="flex min-h-screen items-center justify-center text-slate-500 dark:text-slate-400">Memeriksa sesi…</p>;
  }
  if (pengguna === null) {
    // replace = alamat yang dijaga tidak ditinggal di riwayat browser, jadi tombol Back tidak memantul ke sini lagi.
    // state.dari = alamat tujuan untuk sesudah masuk; sesudah tombol Keluar tidak dititipkan (mulai bersih).
    return <Navigate to="/masuk" replace state={keluarSengaja ? null : { dari: location }} />;
  }
  return <Outlet />; // sudah masuk: tampilkan layar anak yang cocok dengan alamatnya
}
```

Dua baris kode berubah: `keluarSengaja` dibaca dari toko, dan `state` menjadi `null` sesudah **Keluar**. Sesudah sesi habis, `dari` tetap dititipkan.

**Efek `pageshow`** sudah ada di `App.tsx` (3.1): halaman yang dipulihkan *back/forward cache* sesudah **Keluar** langsung dimuat ulang (Konsep 6; [🔬](#-bedah-teknis-opsional)).

Simpan semuanya, lalu uji, masih sebagai admin di Detail **Latihan ruang tamu** (jalur perangkat: Node 1-mu):

1. Klik **Keluar**.
2. Di tab **Console**, ketik `JSON.stringify(history.state.usr)`, lalu **Enter**.
3. Tekan **Back**.

**Hasilnya (contoh, kode tahap Praktik 3 di lab penulis):** `/masuk` dengan baris `Kamu sudah keluar.` di atas formulir, dan **Console** menjawab `null`: tidak ada alamat yang dititipkan. **Back** membawa ke alamat sebelumnya, tetapi penjaga langsung mengalihkan lagi ke `/masuk`: formulir tetap tampil, tanpa kepala dan data. Log `backend`:

```text
[12:28:53] INFO: klien realtime terputus: bzXO6ZjuLrYRwS29AAAV (client namespace disconnect)
[12:28:53] INFO: logout: sesi 10
[12:28:53] INFO: POST /auth/logout -> 200 (5 ms)
```

`client namespace disconnect` = dashboard sendiri yang menutup soketnya (langkah 1), sebelum sesinya dihapus (langkah 2).

**Keluar saat backend mati.** Masuk lagi sebagai admin, lalu:

1. Di terminal `backend`, tekan **Ctrl + C**. Tunggu lencana berganti `Menyambung ulang…`.
2. Klik **Keluar**.
3. Di terminal `backend`, jalankan lagi `npm run dev`; tunggu `Server listening at http://127.0.0.1:8080`.
4. Tekan **F5** di layar Masuk, lalu klik **Keluar** sekali lagi.

**Hasilnya (rekaman susulan penulis pada kode akhir; kalimatnya sama dengan tahap ini):** langkah 2 tetap membawa ke `/masuk` dan mengosongkan toko, tetapi baris abu-abu di atas formulir (bukan *toast*, bukan merah) berterus terang:

```text
Keluar belum tuntas: server tidak menjawab, jadi sesi di server belum terhapus. Setelah server menyala lagi, muat ulang halaman ini lalu tekan Keluar sekali lagi.
```

**Console** mencatat `net::ERR_CONNECTION_REFUSED` untuk `/auth/logout`. **F5** di langkah 4 langsung membawamu ke `/perangkat` sebagai `Admin Rumah (admin)` (log: `GET /auth/me -> 200`): sesi lama memang masih hidup, persis seperti peringatannya. **Keluar** kedua menulis `Kamu sudah keluar.`, dan log mencatat `logout: sesi 6` serta `POST /auth/logout -> 200 (7 ms)`.

#### 3.3 ⭐ Ganti akun di tab yang sama: tanpa sisa, `Khusus admin`, dan `403` di Bruno (15 menit)

Dua akun bergantian di satu tab, lalu Bruno:

1. Masuk sebagai `admin@rumah.test`, buka Detail **Latihan ruang tamu**, lalu klik **Keluar**.
2. Di tab yang sama, tanpa **F5**, masuk sebagai `viewer@rumah.test`.
3. Ketik `localhost:5173/aturan/baru` di bilah alamat.
4. Di Bruno, kirim **`login viewer`**, lalu **`nyalakan lampu`**.
5. Kirim **`login admin`**, supaya permintaan Bruno berikutnya kembali berjalan sebagai admin.

**Hasilnya (contoh, lab penulis; berkas `.yml` Bruno dikirim apa adanya oleh skrip, bukan aplikasi Bruno):**

| Langkah | Yang terlihat |
| :-- | :-- |
| 1 | `/masuk` dengan `Kamu sudah keluar.` |
| 2 | `/perangkat`, bukan Detail tadi; kepala menulis `Tamu Rumah (viewer)` dengan lencana **Live** |
| 3 | `Khusus admin`, `Layar ini hanya untuk akun admin. Akunmu viewer: kamu bisa melihat semua data, tetapi tidak bisa mengubah apa pun.`, dan tautan **← Kembali ke daftar perangkat** |
| 4 | `login viewer` → `200` dengan `"peran":"viewer"`; `nyalakan lampu` → `403` `{"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}` |

Log `backend`:

```text
[12:28:56] INFO: klien realtime tersambung: 0U-L2HERnXh9eWb3AAAW (akun 2, viewer)
…
[12:29:11] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices/a4cf12e5b7c0/command
[12:29:11] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
```

Viewer mulai dari nol: nama admin hilang, alamat Detail tadi tidak dititipkan, dan soketnya milik `akun 2, viewer`. Bruno memperlihatkan lapis kedua: tanpa layar, satpam tetap menolak sebelum rutenya bekerja (tidak ada baris `perintah …`). Tab **Tests** `nyalakan lampu` merah karena mengharapkan `200` (admin): wajar.

**Keluar di jendela lain (opsional).** Klik **Keluar**, masuk sebagai admin, lalu buka Riwayat. Tekan **Ctrl + N** (macOS: **Cmd + N**), buka `localhost:5173` di jendela baru, letakkan berdampingan, lalu klik **Keluar** di sana. Di uji penulis, jendela pertama pindah ke `/masuk` dengan `Sesi sudah habis. Silakan masuk lagi.` 338 ms kemudian, dan sesudah masuk kembali ke Riwayat: jalan sesi habis tetap menitipkan alamat.

Gambar berikut merangkum penjaga Praktik 1–3: `/masuk` dengan alamat asal (di sini sesudah **Keluar** di jendela lain), `Khusus admin`, dan rute `*`.

![Empat tangkapan layar asli, laptop 1280 piksel dipotong, profil browser baru; dari kode akhir: menu Aturan baru ada mulai Praktik 7, dan sebelum Praktik 9 teal dan teks abu-abu sedikit lebih terang. Kiri atas, /masuk dengan alamat asal /perangkat/f00d00000001/riwayat: kartu Rumah Pintar Mini, Masuk dengan akun Modul 20 untuk melihat dashboard., kotak kabar Sesi sudah habis. Silakan masuk lagi. (nomor 1), kolom Email dan Sandi serta tombol Masuk (nomor 2). Panah Masuk ke kanan atas: sesudah Masuk alamatnya /perangkat/f00d00000001/riwayat, kepala Admin Rumah (admin), Kembali ke detail, Riwayat Latihan ruang tamu, ruang tamu · f00d00000001 (nomor 3), pilihan 1 jam, 24 jam, 7 hari, dan Rata-rata per jam, 7 hari terakhir, 169 titik, dimuat dalam 125 ms. Kiri bawah, akun viewer membuka /aturan/baru: Tamu Rumah (viewer) (nomor 4) dan kotak Khusus admin: Layar ini hanya untuk akun admin. Akunmu viewer: kamu bisa melihat semua data, tetapi tidak bisa mengubah apa pun., dengan tautan Kembali ke daftar perangkat (nomor 5). Kanan bawah, /tidak/ada tanpa kepala dashboard: Halaman tidak ditemukan (nomor 6), Alamat ini tidak ada di dashboard. Mungkin salah ketik?, tautan Ke daftar perangkat (nomor 7). Catatan: tautan dalam yang dibuka tanpa sesi sama sekali memberi formulir yang sama tanpa kotak kabar, tujuannya sama. Legenda: JagaMasuk menitipkan alamat asal di state.dari; komponen Navigate ke tujuan dari state.dari dengan replace; penjaga kedua KhususAdmin, satpam backend tetap 403; rute bintang di luar penjaga; Link React Router tanpa memuat ulang halaman.](aset/rute-masuk-khusus-admin-404.png)

**Kamu lulus langkah ⭐ ini** kalau sesudah **Keluar**, viewer di tab yang sama mendarat di `/perangkat` tanpa sisa layar admin, `/aturan/baru` menulis `Khusus admin`, dan Bruno `nyalakan lampu` sebagai viewer dijawab `403`. Ini **dasar** L4; buktinya sendiri, Detail viewer tanpa satu pun tombol kendali, ada di [5.5](#55--lampu-dari-dashboard-rollback-dan-akun-viewer-tanpa-tombol-15-menit). Gejala lain: [🚨](#-kalau-tidak-jalan) *Akun viewer sekilas melihat tombol admin …* dan *Sesudah Keluar, tombol Back sekilas memperlihatkan layar lama*.

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` menyebut empat berkas berubah (`App.tsx`, `toko.ts`, `JagaMasuk.tsx`, `TataLetak.tsx`) serta `KhususAdmin.tsx` dan `halaman/FormAturan.tsx` belum terlacak. Lalu:

```text
git add src
git commit -m "Peran di layar dan Keluar yang tuntas (Modul 24 Praktik 3)"
```

> ⬆️ **Selesai Praktik 3?** Dashboard kini membedakan admin dan viewer, dan **Keluar** tuntas, tetapi kabar penting seperti perangkat yang terputus belum tampil di layar. Baca [Konsep 10](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp), lalu lanjut ke [Praktik 4 — Kabar di layar: *toast*](#praktik-4--kabar-di-layar-toast-40-menit).

### Praktik 4 — Kabar di layar: *toast* (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 3 yang masih menyala (`backend` v1.0 dengan `npm run dev`, Vite di `frontend`; jalur laptop juga broker di `edge` dan simulator di `alat`) plus terminal kosong di folder `frontend` untuk Git; **Docker Desktop** (`rumahpintar-db`); serta **Chrome** atau **Edge** di `http://localhost:5173`, masuk sebagai admin, dengan DevTools (tab **Console** dan **Network**). Konsep yang dipakai: 10.

Sejak Modul 23, backend mengirim acara `kejadian` ke dashboard (perangkat terputus, aturan bertindak, jadwal berjalan), tetapi dashboard mendiamkannya. Praktik ini memasang *toast* ([Konsep 10](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp)) dan menyusulkan status perangkat sesudah sambungan pulih. Enam berkas berubah: dua baru (`src/toast.ts`, `src/components/WadahToast.tsx`) dan empat lama (`src/toko.ts`, `src/components/TataLetak.tsx`, `index.html`, `src/soket.ts`). Tempel sesuai urutan langkah: berkas yang mengimpor `toast.ts` baru ditempel sesudah `toast.ts` ada.

#### 4.1 `toast.ts` dan `WadahToast`: di bawah layar HP, di pojok kanan atas laptop lebar (15 menit)

**Langkah 1 — Toko *toast*.** Klik kanan **`frontend/src`** → **New File…**, beri nama **`toast.ts`**, lalu ketik (atau buka [`kode/tahap/praktik-4/frontend/src/toast.ts`](kode/tahap/praktik-4/frontend/src/toast.ts) di GitHub, klik **Copy raw file**, lalu tempel):

```ts
// toast.ts - "kabar di layar" (toast): pesan pendek yang muncul sebentar (di bawah layar HP, di pojok kanan atas laptop
// lebar) lalu hilang sendiri sesudah 4 detik.
// Tokonya terpisah dari toko.ts supaya kecil dan mudah dibaca. Seperti toko utama, isinya hanya ada di memori tab ini.
import { create } from "zustand";

export type JenisToast = "info" | "sukses" | "galat";
export type Toast = { id: number; pesan: string; jenis: JenisToast };

const LAMA_TAMPIL = 4000; // milidetik
const PALING_BANYAK = 2; // lebih dari itu, yang paling lama dibuang: di HP, dua toast sudah setinggi seperempat layar

type TokoToast = {
  daftar: Toast[];
  tambah: (pesan: string, jenis: JenisToast) => void;
  hapus: (id: number) => void;
};

let nomorTerakhir = 0; // nomor unik setiap toast: dipakai sebagai key React dan untuk menghapusnya

export const useToast = create<TokoToast>()((set, get) => ({
  daftar: [],
  tambah: (pesan, jenis) => {
    const id = ++nomorTerakhir;
    // slice(-2) = ambil dua yang paling akhir (yang terbaru)
    set((s) => ({ daftar: [...s.daftar, { id, pesan, jenis }].slice(-PALING_BANYAK) }));
    // setTimeout = SEKALI jalan, bukan setInterval: 4 detik lagi toast ini dibuang. Kalau sudah ditutup lebih dulu,
    // hapus() tidak menemukannya dan tidak terjadi apa-apa.
    setTimeout(() => get().hapus(id), LAMA_TAMPIL);
  },
  hapus: (id) => set((s) => ({ daftar: s.daftar.filter((t) => t.id !== id) })),
}));

// singkatan, supaya bagian lain cukup menulis toast("Aturan disimpan", "sukses")
export function toast(pesan: string, jenis: JenisToast = "info") {
  useToast.getState().tambah(pesan, jenis);
}
```

Polanya sama dengan bagian `// 5.` [pemanasan](#langkah-5--pesan-yang-hilang-sendiri-antrean-dengan-settimeout), kini di toko Zustand kecil. `tambah()` memberi nomor unik, membuat larik **baru** berisi paling banyak dua *toast* terbaru (`PALING_BANYAK = 2`; di pemanasan 3), lalu memasang `setTimeout` **sekali jalan**: 4 detik lagi `hapus()` dipanggil. *Toast* yang sudah ditutup ✕ atau terdorong keluar tidak ditemukan `hapus()`, jadi tidak perlu `clearTimeout`. Bagian lain cukup menulis `toast("…", "galat")`; jenisnya (`info`, `sukses`, `galat`) menentukan warna dan ikon. Kenapa tidak memakai pustaka *toast* siap pakai? Lihat [🔬](#-bedah-teknis-opsional) *Pustaka toast siap pakai*.

**Langkah 2 — Keluar ikut membuang *toast*.** Buka `src/toko.ts`. Di bawah `import { create } from "zustand";`, tambahkan:

```ts
import { useToast } from "./toast";
```

Lalu di dalam `kosongkanSemua`, tepat di bawah baris `useToko.setState(…)`, tambahkan:

```ts
  useToast.setState(useToast.getInitialState(), true); // toast milik akun sebelumnya ikut dibuang
```

Inilah baris yang dijanjikan [Konsep 6](#6-keluar-yang-tuntas-putus-soket-hapus-sesi-kosongkan-toko): *toast* akun tadi tidak terbawa ke orang berikutnya di tab yang sama. (Boleh juga mengganti seluruh isi `src/toko.ts` dengan [tahapnya](kode/tahap/praktik-4/frontend/src/toko.ts), **Copy raw file**.)

**Langkah 3 — Wadahnya.** Klik kanan **`frontend/src/components`** → **New File…**, beri nama **`WadahToast.tsx`**, buka [`kode/tahap/praktik-4/frontend/src/components/WadahToast.tsx`](kode/tahap/praktik-4/frontend/src/components/WadahToast.tsx) di GitHub, klik **Copy raw file**, lalu tempel. Intinya satu `<div>` yang **selalu** digambar, walau kosong:

```tsx
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 xl:sticky xl:top-0 xl:bottom-auto xl:h-0"
    >
```

`role="status"` dan `aria-live="polite"` membuat pembaca layar membacakan isi barunya asalkan wadah itu sudah ada sebelum isinya berubah. Arti kelasnya (tabel Konsep 10): di bawah 1280 px menempel di tepi bawah layar, mulai 1280 px (`xl:`) menggantung di kanan atas, dan `pointer-events-none` membuat ruang kosongnya tidak menghalangi ketukan. Di dalamnya, `daftar.map(…)` menggambar setiap kartu: ikon `i`, `✓`, atau `!`, warna dari `GAYA[t.jenis]`, teks `{t.pesan}`, dan tombol ✕ berlabel `Tutup pesan` (`min-h-11 min-w-11` = 44 × 44 px). Jarak kartu dari tepi bawah: `max(1rem,env(safe-area-inset-bottom))`. Pesan server ditulis sebagai teks JSX, bukan HTML.

**Langkah 4 — Pasang di bingkai.** Ganti seluruh isi `src/components/TataLetak.tsx` dengan [tahapnya](kode/tahap/praktik-4/frontend/src/components/TataLetak.tsx) (**Copy raw file**). Bedanya: `import WadahToast from "./WadahToast";`, lalu `<WadahToast />` di antara `</header>` dan `<main>`, yang kelasnya berganti dari `py-6` menjadi `pt-6 pb-64 xl:pb-6`. Wadah dipasang di bingkai, bukan di `App`: ia hanya ada sesudah masuk dan tidak dipasang ulang saat pindah layar karena bingkainya tetap sementara isi berganti lewat `<Outlet />`.

**Langkah 5 — Ruang gulir.** Ganti seluruh isi `frontend/index.html` (di luar folder `src`) dengan:

```html
<!doctype html>
<html lang="id" class="scheme-light dark:scheme-dark scroll-pb-64 xl:scroll-pb-0">
  <head>
    <meta charset="UTF-8" />
    <!-- Modul 24: scroll-pb-64 = saat browser menggulir SENDIRI ke tombol atau kolom (tombol Tab, kolom yang salah isi), ia
         menyisakan 16rem di bawah, tempat toast di HP dan tablet. Mulai 1280 px toast ada di samping isi: xl:scroll-pb-0. -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rumah Pintar Mini</title>
  </head>
  <body class="bg-slate-100 dark:bg-slate-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Yang berubah hanya kelas `<html>` (`scroll-pb-64 xl:scroll-pb-0`) dan dua baris komentar. `pb-64` memberi ruang saat jempol menggulir; `scroll-pb-64` saat browser menggulir **sendiri** ke tombol atau kolom (tombol Tab, kolom yang salah isi).

Simpan semuanya. Belum ada yang memanggil `toast()`, jadi belum ada kartu; yang bisa diperiksa adalah wadahnya. Di tab **Console**, ketik lalu **Enter**:

```js
document.querySelectorAll("[role=status][aria-live=polite]").length
```

**Hasilnya (uji penulis, kode akhir):** `1` sesudah masuk dan `0` sesudah **Keluar** (`/masuk`) karena wadah hanya ada di `TataLetak`. Di HP yang dimiringkan atau layar 320 px, *toast* masih bisa menutupi tombol: lihat [🚨](#-kalau-tidak-jalan) *Toast menutupi tombol Lampu, Kipas, atau pompa …*.

#### 4.2 Acara `kejadian` menjadi *toast*: pendengar bernama dan `off` (10 menit)

Ganti seluruh isi `src/soket.ts` dengan [`kode/tahap/praktik-4/frontend/src/soket.ts`](kode/tahap/praktik-4/frontend/src/soket.ts) (**Copy raw file**), lalu simpan. Berkas ini sekaligus memuat 4.3. Di dalam `useRealtime`, di bawah `onStatus`, ada pendengar baru:

```ts
    function onKejadian(k: Kejadian) {
      if (k.jenis === "aturan-diubah") return;
      toast(k.pesan, jenisToast(k));
    }
```

Pasangannya `socket.on("kejadian", onKejadian)` di daftar pendengar dan `socket.off("kejadian", onKejadian)` di *cleanup*, persis `telemetry` dan `status` Modul 23. Di mode dev, StrictMode memasang efek, membongkarnya, lalu memasangnya lagi; tanpa `off`, pendengar pertama tertinggal dan setiap kejadian tampil dua kali ([🚨](#-kalau-tidak-jalan) *Setiap kejadian muncul sebagai dua toast*). Tipe `Kejadian` sudah ada di `types.ts` sejak Modul 23. `aturan-diubah` dilewati: yang menyimpan aturan sudah mendapat *toast* dari jawaban HTTP-nya.

**Warnanya dari data, bukan dari kalimat.** Fungsi `jenisToast()` di atas `useRealtime` memilih `galat` (merah, `!`) untuk kejadian `status` kalau perangkat itu di toko kini bukan `online`; acara `status` tiba lebih dulu daripada kejadiannya, jadi toko sudah benar. Kejadian `aturan` dan `jadwal` menjadi `galat` kalau `data.ok` bernilai `false` atau `data.hasil` bernilai `tanpa-ack`/`tidak-dikirim`; selebihnya `info`. Karena `data` bertipe `unknown`, ia diperiksa dulu dengan skema Zod kecil `DataTindakan` (`safeParse`), bukan dipercaya begitu saja. `ok` baru dikirim backend 1.1 ([Praktik 6](#praktik-6--backend-11-aturan-turun-di-bawah-dan-hapus-aturan-50-menit)); sampai saat itu, `hasil` sudah menandai perintah yang tidak dijawab atau tidak terkirim.

#### 4.3 Sambungan pulih, status disegarkan: `GET /devices` sekali lagi (10 menit)

`soket.ts` tadi juga melunasi batasan 2 Modul 23 ([🔬 Modul 23](../modul-23-dashboard-realtime/README.md#-bedah-teknis-opsional) *Dua batasan v0.2*): server menyiarkan `status` hanya saat **berubah**, dan tidak mengulangnya untuk sambungan baru. Kalau perangkat mati selama backend mati, dashboard tidak pernah diberi tahu dan tetap menulis `Online`. Obatnya fungsi di dalam `useRealtime` (tidak diekspor):

```ts
    async function sinkronPerangkat() {
      try {
        const daftar = await ambilPerangkat();
        if (!ignore) useToko.getState().setPerangkat(daftar); // sudah Keluar sementara itu? abaikan
      } catch {
        // gagal (misalnya backend baru saja mati lagi): biarkan; sambungan yang pulih berikutnya mencoba lagi
      }
    }
```

Pemanggilnya dua baris terakhir `onConnect`:

```ts
      if (pernahTersambung) void sinkronPerangkat();
      pernahTersambung = true;
```

`pernahTersambung` mulai `false` setiap kali efek berjalan (sesudah masuk). Sambungan pertama dilewati karena `TataLetak` baru saja mengambil daftar perangkat; setiap `connect` sesudahnya berarti sambungan **pulih**, lalu `GET /devices` sekali. Ini bukan *polling*: pemicunya peristiwa "tersambung lagi", bukan pengatur waktu. `ignore` dari Modul 23 membuang jawaban yang datang sesudah **Keluar**. Yang disusulkan hanya status; kabar `kejadian` yang lewat selama putus tetap tidak dikirim ulang.

#### 4.4 Uji: matikan simulator, lalu matikan dan nyalakan lagi backend (5 menit)

Buka Detail **Latihan ruang tamu** (jalur perangkat: **Node 1 ruang tamu**). Jalur perangkat: ganti **Ctrl + C** simulator dengan mencabut USB Node 1, dan **↑** lalu **Enter** dengan mencolokkannya lagi; kabar `terputus` baru datang ±13–23 detik sesudah dicabut ([Modul 23 3.3](../modul-23-dashboard-realtime/README.md#33--matikan-pengirimnya-kartu-memerah-lalu-hijau-lagi-10-menit)). Penulis belum merekam jalur ini dengan Kit.

1. Terminal simulator: **Ctrl + C**. Tunggu *toast*-nya hilang, lalu **↑** dan **Enter**.
2. Terminal `backend`: **Ctrl + C**. Lalu terminal simulator: **Ctrl + C** (jalur perangkat: cabut, lalu tunggu ±30 detik).
3. Terminal `backend`: **↑** lalu **Enter** (`npm run dev`). Jangan tekan **F5**.
4. Terminal simulator: **↑** lalu **Enter**.

**Hasilnya (contoh, 1280 px, lab penulis):**

| Langkah | Di layar |
| :-- | :-- |
| 1 | sesaat kemudian (kurang dari 1 detik, perkiraan) *toast* merah `f00d00000001 terputus (offline)` (ikon `!`) di kanan atas dan status `Offline`; ±4 detik kemudian *toast* hilang sendiri; sesudah simulator jalan lagi, *toast* netral `f00d00000001 tersambung lagi (online)` (ikon `i`) dan `Online` |
| 2 | lencana `Menyambung ulang…`; status tetap `Online`, yang terakhir diketahui layar; tanpa *toast* |
| 3 | log menulis `Server listening …` (±7,7 detik sesudah diketik, laptop lab sibuk); ±1 detik kemudian lencana `Live`, lalu status `Offline` tanpa **F5**; tab **Network**: satu `GET /devices` → `200` |
| 4 | *toast* `f00d00000001 tersambung lagi (online)`, status `Online` |

Di tab **Network** → saringan **Socket** → `socket.io/?EIO=4…` → **Messages**, langkah 1 memberi dua pesan `42["kejadian",{…,"jenis":"status",…}]` dan tepat dua *toast*, walau mode dev memakai StrictMode. Di langkah 3, kabar `terputus` tidak menjadi *toast*: perubahannya terjadi saat dashboard belum tersambung, dan kabar yang terlewat tidak dikirim ulang. Status `Offline` itu ditemani `terakhir dilihat baru saja`: perilaku backend v1.0, bukan kode dashboard. Dengan kode tahap Praktik 3 (tanpa 4.3), status tetap `Online` sampai simulator mengirim lagi. (Pilihan: ulangi langkah 1 dengan mode perangkat DevTools selebar 375 px; kartunya di bawah layar.)

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` menyebut empat berkas berubah dan dua belum terlacak (`toast.ts`, `WadahToast.tsx`). Lalu:

```text
git add index.html src
git commit -m "Toast, kejadian, dan sinkron status sesudah pulih (Modul 24 Praktik 4)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-4/frontend/`](kode/tahap/praktik-4/frontend/).

> ⬆️ **Selesai Praktik 4?** Dashboard kini memberi kabar, tetapi belum bisa memerintah. Baca [Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack) dan [Konsep 2](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis), lalu lanjut ke [Praktik 5 — Tombol yang menunggu konfirmasi perangkat](#praktik-5--tombol-yang-menunggu-konfirmasi-perangkat-75-menit).

### Praktik 5 — Tombol yang menunggu konfirmasi perangkat (75 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan terminal `backend` (masih v1.0, `npm run dev`), `frontend` (Vite), dan satu terminal kosong untuk Git (jalur laptop: broker di `edge` dan simulator lama di `alat` tetap menyala); **Docker Desktop** (`rumahpintar-db`); serta **dua browser berbeda**, misalnya **Chrome** dan **Edge**, yang pertama dengan DevTools (tab **Network** dan panel **Request conditions** di 5.5). Konsep yang dipakai: 1 dan 2, ditambah 5 untuk bagian **Kendali**.
>
> ⭐ **Wajib** — langkah 5.5: tombol **Lampu** langsung berganti dengan `Menunggu konfirmasi perangkat…` lalu mengikuti jawaban perangkat, mundur sendiri saat jaringan diblokir, dan akun viewer tidak melihat bagian **Kendali** (bukti **L2** dan **L4**).

Praktik ini mengganti kartu Lampu, Kipas, dan Pompa milik admin dengan tombol sungguhan, pengganti tombol kasar Kemenangan Cepat. Cara kerjanya ada di Konsep 1–2; di sini kamu menempel dan mengujinya. Kedua tombol baru terpasang lewat `DetailPerangkat.tsx` di akhir 5.4; sampai saat itu layar tidak berubah, dan itu wajar. Kode di akhir praktik ini: [`kode/tahap/praktik-5/frontend/`](kode/tahap/praktik-5/frontend/).

#### 5.1 Salin `kontrak.ts`, lalu `kirimPerintah()` yang memeriksa jawaban dengan `Ack.safeParse` (15 menit)

**Langkah 1 — Salinan skema dari backend.** Di panel Explorer VS Code, klik kanan `backend/src/schemas/kontrak.ts` → **Copy**, lalu klik kanan folder `frontend/src/skema` (berisi `masuk.ts` dari Praktik 2) → **Paste**. Jangan ubah satu karakter pun, komentar kepalanya juga: berkas ini **salinan identik**, dan pemeriksanya (`npm run cek-skema`) menyusul di [7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit). Kenapa disalin, bukan diimpor dari folder `backend`, dibahas [Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend), yang dibaca sebelum Praktik 7. Isinya hanya butuh `zod`, yang terpasang di 1.1 dengan versi yang sama dengan backend. Yang dipakai sekarang: `Ack` (jawaban perangkat) dan `PerintahSet` (isi perintah).

**Langkah 2 — `src/api.ts`.** Buka [`kode/tahap/praktik-5/frontend/src/api.ts`](kode/tahap/praktik-5/frontend/src/api.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/api.ts`-mu. Yang berubah hanya tiga tempat. Di atas, dua impor dari salinan tadi:

```ts
import { Ack } from "./skema/kontrak";
import type { PerintahSet } from "./skema/kontrak";
```

Di `minta()`, komentar janji Modul 23 ("pemeriksaan sungguhan dengan Zod baru di Modul 24") kini ditepati, sebagian: jawaban yang menentukan tombol kendali diperiksa Zod, jawaban lain tetap dipercaya lewat tipe. Sesudah `ambilPerangkat()` ada fungsi baru `kirimPerintah()`, persis yang kamu baca di [Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack): `POST /devices/:id/command` lewat `minta()`, lalu `Ack.safeParse(jawaban.ack)`.

**Langkah 3 — `src/toko.ts`.** Ganti seluruh isinya dengan [tahapnya](kode/tahap/praktik-5/frontend/src/toko.ts) (**Copy raw file**). Tipe `Toko` mendapat satu baris, `terapkanKeadaan: (deviceId: string, state: Keadaan) => void;`, dan isinya ada di bawah `isiJendela`:

```ts
  // Modul 24: keadaan aktuator dari ack (jawaban perangkat atas perintah kita). Ditulis ke bacaan terbaru supaya kartu dan
  // tombol langsung benar, tanpa menunggu telemetry berikutnya (yang membawa keadaan yang sama ±1-2 detik kemudian).
  terapkanKeadaan: (deviceId, state) =>
    set((s) => {
      const lama = s.terbaru[deviceId];
      // belum ada bacaan, atau Node 2 (punya tekanan, tanpa aktuator): tidak ada yang diubah
      if (lama === undefined || "tekanan" in lama) return s;
      return { terbaru: { ...s.terbaru, [deviceId]: { ...lama, state } } };
    }),
```

Fungsi ini menyalin bacaan terakhir perangkat, lalu mengganti `state`-nya saja (pola [🔁 Langkah 3](#langkah-3--simpan-dulu-ubah-kembalikan-salinan-objek-dengan-spread)). Simpan ketiga berkas; layar belum berubah.

#### 5.2 `TombolSakelar`: tampil dulu dengan `useOptimistic` dan `useTransition` (25 menit)

Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`TombolSakelar.tsx`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-5/frontend/src/components/TombolSakelar.tsx`](kode/tahap/praktik-5/frontend/src/components/TombolSakelar.tsx) di GitHub, klik **Copy raw file**, lalu tempel):

```tsx
// TombolSakelar.tsx - tombol nyala/mati untuk lampu atau kipas, dengan "optimistic UI" (Modul 24).
// Begitu diketuk, tampilannya langsung berganti dan menulis "Menunggu konfirmasi perangkat…". Sesudah perangkat menjawab
// (ack), keadaan SUNGGUHAN dari jawaban itu yang dipakai. Kalau perintahnya gagal, tampilan kembali sendiri (rollback).
// Lampu dan kipas boleh optimis karena perintahnya aman diulang: "nyalakan" dua kali tetap saja nyala.
import { useId, useOptimistic, useTransition } from "react";
import { GalatApi, kirimPerintah } from "../api";
import { toast } from "../toast";
import { sesiHabis, useToko } from "../toko";

type Props = {
  deviceId: string;
  target: "lampu" | "kipas";
  label: string; // tulisan di tombol, misalnya "Lampu"
  nilai: boolean; // keadaan yang DILAPORKAN perangkat (telemetry atau ack): sumber kebenarannya
  alasanMati: string | null; // kenapa tombol tidak bisa dipakai (misalnya perangkat offline); null = bisa dipakai
};

// kalimat toast untuk perintah yang gagal, menurut jawaban backend
function pesanGagal(err: unknown, label: string): string {
  if (!(err instanceof GalatApi)) return label + ": perintah gagal.";
  // 504 BUKAN "dibatalkan": backend mengingat keinginan kita dan mengirim ulang sendiri saat perangkat terdengar lagi
  if (err.kode === 504) return label + ": belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.";
  if (err.kode === 0) return label + ": server tidak menjawab.";
  return label + ": " + err.message; // 409 "perangkat sedang offline, …", 404, 503, 403
}

export default function TombolSakelar({ deviceId, target, label, nilai, alasanMati }: Props) {
  // tampil = nilai, KECUALI selama perintah menunggu jawaban: saat itu tampil = keinginan kita (optimis)
  const [tampil, setTampil] = useOptimistic(nilai);
  // menunggu = true selama Action di bawah belum selesai (dari ketukan sampai jawaban backend tiba)
  const [menunggu, mulai] = useTransition();
  const idKeterangan = useId(); // id unik untuk menghubungkan tombol dengan keterangannya (aria-describedby)
  const bisa = alasanMati === null && !menunggu;

  function ketuk() {
    // Tombol yang sedang menunggu tidak bisa diketuk lagi: mencegah 409 "perintah sebelumnya masih menunggu ack".
    if (!bisa) return;
    const baru = !nilai;
    // Action = fungsi async di dalam startTransition. Selama ia berjalan, setTampil(baru) yang berlaku.
    mulai(async () => {
      setTampil(baru); // langsung berganti di layar, sebelum perangkat menjawab
      try {
        const ack = await kirimPerintah(deviceId, { target, nilai: baru });
        // Keadaan sungguhan dari perangkat masuk toko, jadi prop nilai ikut berganti. (Toko Zustand berubah seketika,
        // bukan state React, jadi tidak perlu dibungkus startTransition lagi.)
        useToko.getState().terapkanKeadaan(deviceId, ack.state);
        if (!ack.ok) toast(label + ": perangkat menolak (" + (ack.pesan ?? "tanpa alasan") + ")", "galat");
      } catch (err) {
        toast(pesanGagal(err, label), "galat");
        if (err instanceof GalatApi && err.kode === 401) sesiHabis();
      }
      // Action selesai: React membuang tampilan optimis dan kembali memakai nilai dari toko. Kalau perintahnya gagal,
      // nilai di toko tidak berubah, jadi tombol kembali ke keadaan semula (rollback) tanpa kode tambahan.
    });
  }

  let keterangan = "";
  if (menunggu) keterangan = "Menunggu konfirmasi perangkat…";
  else if (alasanMati !== null) keterangan = alasanMati;

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* aria-pressed = tombol sakelar: pembaca layar menyebut "ditekan" (nyala) atau "tidak ditekan" (mati).
          aria-disabled (bukan disabled): tombol tetap bisa difokus keyboard, jadi fokus tidak hilang saat menunggu. */}
      <button
        type="button"
        onClick={ketuk}
        aria-pressed={tampil}
        aria-disabled={bisa ? undefined : true}
        aria-describedby={idKeterangan}
        className={
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 font-medium " +
          (tampil
            ? "border-teal-600 bg-teal-600 text-white"
            : "border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100") +
          (bisa ? " hover:opacity-90" : " cursor-not-allowed opacity-70")
        }
      >
        <span>{label}</span>
        {/* keadaan untuk mata; pembaca layar sudah mendapatkannya dari aria-pressed */}
        <span aria-hidden="true" className="text-sm">
          {tampil ? "Nyala" : "Mati"}
        </span>
      </button>
      {/* role="status": "Menunggu konfirmasi perangkat…" ikut dibacakan pembaca layar tanpa memindah fokus */}
      <p id={idKeterangan} role="status" className="mt-1 min-h-4 text-xs text-slate-600 dark:text-slate-300">
        {keterangan}
      </p>
    </div>
  );
}
```

Inti `ketuk()`, yaitu `useOptimistic`, `mulai(async () => …)`, dan mundur tanpa kode tambahan, sudah dibahas di [Konsep 2](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis). Yang baru di berkas utuhnya:

- **Satu komponen, dua aktuator** lewat *props* `target` dan `label`. `nilai` = keadaan yang **dilaporkan**, dari toko; `alasanMati` dari `DetailPerangkat` (5.4).
- **`bisa`** bernilai `false` kalau ada alasan mati **atau** perintah masih ditunggu. `ketuk()` langsung berhenti (`if (!bisa) return;`), jadi ketukan kedua tidak berbuah `409 … masih menunggu ack` (kecuali kamu meninggalkan Detail lalu kembali sebelum perangkat menjawab; lihat [🚨](#-kalau-tidak-jalan)).
- **`aria-disabled`, bukan `disabled`.** Tombol `disabled` tidak bisa difokus papan ketik, jadi fokus hilang saat tombol mulai menunggu. Dengan `aria-disabled`, fokus tetap di tombol (uji penulis dengan papan ketik: satu `POST`), dan tampilannya dipudarkan `opacity-70`. `min-h-11` = tinggi 44 px (Konsep 11).
- **`aria-pressed`** menjadikannya tombol sakelar: pembaca layar menyebut "ditekan" (nyala) atau "tidak ditekan". Tulisan `Nyala`/`Mati` diberi `aria-hidden` supaya tidak dibacakan dua kali.
- **Keterangan di bawah tombol** (`<p role="status">`) berisi `Menunggu konfirmasi perangkat…` selama menunggu, atau alasan tombol mati. `useId()` memberinya id unik untuk `aria-describedby`, karena tombol yang sama tampil dua kali di satu layar.
- **`401`** (gelang habis dan *refresh* gagal) memanggil `sesiHabis()` dari toko: kamu dibawa ke `/masuk` dengan `Sesi sudah habis. Silakan masuk lagi.`

Simpan. Tombol ini belum terlihat di mana pun sampai 5.4.

**Lalu `src/main.tsx`.** Bawaannya, pindah layar di `<BrowserRouter>` juga transisi React, yang ikut menunggu *Action* tombol: kalau kamu mengklik menu **selama** tombol menunggu, alamatnya berganti, tetapi layar barunya baru tampil sesudah perangkat menjawab (uji penulis: ±2,4 detik dengan perangkat lambat; sampai `504`: ±4,7 detik). Supaya pindah layar tidak menunggu tombol, ganti isi `src/main.tsx` dengan [tahapnya](kode/tahap/praktik-5/frontend/src/main.tsx) (**Copy raw file**): `<BrowserRouter>` kini `<BrowserRouter useTransitions={false}>`. Di uji penulis, layar baru lalu tampil ±20 ms sesudah klik, dan hasil perintah serta *toast*-nya tetap tiba.

#### 5.3 Satu kalimat untuk setiap jawaban: ditolak perangkat, `409`, `504`, dan server diam (10 menit)

Dua tempat di `TombolSakelar.tsx` yang baru kamu tulis memilih kalimat *toast* untuk perintah yang gagal. Baca keduanya sambil memegang tabel jawaban [Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack):

1. **Di dalam `try`:** jawaban `200` dengan `ack.ok: false` bukan galat, jadi `catch` tidak terpanggil. Barisnya sendiri yang menulis `Lampu: perangkat menolak (…)` dengan alasan dari `ack.pesan`.
2. **Di `pesanGagal()`:** semua `GalatApi`. `504` dan kode `0` diberi kalimat sendiri; sisanya memakai pesan backend (`err.message`) didahului nama tombolnya. Galat lain (jarang) menjadi `Lampu: perintah gagal.`

| Jawaban | *Toast* | Di mana kamu melihatnya |
| :--- | :--- | :--- |
| kode `0` (permintaan tidak sampai) | `Lampu: server tidak menjawab.` | 5.5, jaringan diblokir DevTools |
| `200`, `ack.ok: false` | `Pompa: perangkat menolak (pompa ditolak: air tandon kurang)` | [6.5](#65-simulator-tanah-dan-tandon-diketik-dari-terminal-5-menit), dengan `tandon 15` (pompa punya pemilih kalimat sendiri, 5.4) |
| `409` | `Lampu: ` + pesan backend | misalnya layar lama yang masih bertombol sesudah kunci perangkat dicabut (5.4) |
| `504` | `Lampu: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.` | rekaman penulis di 5.5 |
| `200`, `ack` tak dikenal | `Lampu: Jawaban server tidak dikenal.` | jarang, misalnya backend dan salinan skemanya berbeda |

Kalimat `504` sengaja tidak memakai kata "gagal" atau "dibatalkan": backend masih mengingat keinginanmu dan mengirim ulang sendiri ([Konsep 2](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis); rinciannya di [🔬](#-bedah-teknis-opsional) *Sesudah `504`*). Warna merahnya datang dari jenis `"galat"` yang dikirim ke `toast()`, bukan dari isi kalimat. Tidak ada yang perlu disimpan di langkah ini.

#### 5.4 `TombolPompa` yang sengaja tidak optimis, lalu bagian Kendali khusus admin (10 menit)

**Langkah 1 — Tombol pompa.** Klik kanan **`frontend/src/components`** → **New File…**, beri nama **`TombolPompa.tsx`**, buka [`kode/tahap/praktik-5/frontend/src/components/TombolPompa.tsx`](kode/tahap/praktik-5/frontend/src/components/TombolPompa.tsx) di GitHub, klik **Copy raw file**, lalu tempel. Bentuknya mirip `TombolSakelar`, dengan tiga beda yang disengaja (Konsep 2: menyiram dua kali tidak sama dengan sekali):

```tsx
  const bisa = alasanMati === null && !menunggu && !menyiram;
```

1. **Hanya `useTransition`, tanpa `useOptimistic`.** Judul kartu tetap `Diam` sampai `ack` tiba; selama menunggu hanya ada `Menunggu konfirmasi perangkat…`.
2. **Mati selama menyiram.** `bisa` juga memeriksa `menyiram` (`state.pompa` dari perangkat), jadi tombol **3 detik**, **5 detik**, dan **10 detik** (`PILIHAN_DETIK`) baru hidup lagi sesudah perangkat melapor pompanya diam.
3. **Kalimat sendiri.** Sukses pun diberi *toast*, `"Pompa menyiram " + detik + " detik."`, dan `504` berbunyi `Pompa: belum dikonfirmasi perangkat dan tidak dikirim ulang. Lihat keadaan pompa sebelum mencoba lagi.`, karena backend memang tidak mengirim ulang perintah pompa.

> [!WARNING]
> Jalur perangkat: tombol ini menyalakan pompa sungguhan. Ketuk hanya kalau tandon berisi air (pompa mini didinginkan air yang dipompanya), dan dayanya tetap dari MB102, bukan pin ESP32.

**Langkah 2 — Pasang di Detail.** Ganti seluruh isi `src/components/DetailPerangkat.tsx` dengan [tahapnya](kode/tahap/praktik-5/frontend/src/components/DetailPerangkat.tsx) (**Copy raw file**). Bagian barunya ada tepat di bawah baris status (`<TerakhirDilihat … />`), di atas grafik:

```tsx
      {/* Modul 24: bagian Kendali, khusus admin, untuk Node 1 dan simulator (Node 2 tidak menerima perintah) */}
      {admin && !node2 && !kirimanDiabaikan ? (
        <section aria-labelledby="judul-kendali" className="mt-4">
          …
          {keadaan === undefined ? (
            …
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <TombolSakelar deviceId={id} target="lampu" label="Lampu" nilai={keadaan.lampu} alasanMati={alasan} />
              <TombolSakelar deviceId={id} target="kipas" label="Kipas" nilai={keadaan.kipas} alasanMati={alasan} />
              <TombolPompa deviceId={id} menyiram={keadaan.pompa} alasanMati={alasan} />
            </div>
          )}
        </section>
      ) : null}
```

- **`admin`** dari `useAdmin()` (Praktik 3) bernilai `true` hanya kalau peran admin sudah pasti, jadi akun viewer tidak sekilas melihat bagian ini saat halaman dibuka. Inilah lapis layar [Konsep 5](#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan); satpam backend tetap menjawab `403` ([Kemenangan Cepat Langkah 4](#langkah-4--ketuk-sebagai-viewer-403-dari-satpam-backend-4-menit)).
- **`!node2`**: Node 2 tidak menerima perintah. **`!kirimanDiabaikan`**: kalau kunci perangkat dicabut, seluruh bagian Kendali hilang (sesudah layar dimuat ulang). Layar yang telanjur terbuka masih bertombol, dan ketukan di sana dijawab `409` (di uji penulis: `Lampu: kunci perangkat f00d00000001 sudah dicabut`, tombol mundur).
- **`keadaan`** = `state` bacaan terakhir; sebelum ada, bagian ini menulis `Tombol kendali muncul begitu perangkat melaporkan keadaan lampu, kipas, dan pompanya (kiriman berikutnya).`
- **`alasanTombolMati()`** mengisi `alasan`, misalnya `Perangkat sedang offline: perintah tidak bisa dikirim.` Backend juga menolak (`409`), tetapi tombol memberi tahu lebih dulu.
- **`kartuNode1(t, admin)`**: kartu Lampu, Kipas, dan Pompa kini hanya untuk viewer, supaya admin tidak melihat keadaan yang sama dua kali. Tirai tetap kartu; tombolnya [Tantangan Tingkat 1](#tingkat-1--tombol-tirai-0180-ubah-sedikit-20-menit).

Simpan. Sebagai admin, buka Detail **Latihan ruang tamu** (jalur perangkat: Node 1-mu).

**Hasilnya (contoh, lab penulis):** di bawah baris status ada judul `Kendali`, tombol `Lampu` `Mati` dan `Kipas` `Mati` berdampingan, lalu kartu `Pompa: siram selama` `Diam` dengan tombol `3 detik` `5 detik` `10 detik`. Untuk admin, kartu Lampu, Kipas, dan Pompa tidak tampil lagi; kartu Tirai tetap. Di Detail Node 2, bagian Kendali tidak ada.

#### 5.5 ⭐ Lampu dari dashboard, *rollback*, dan akun viewer tanpa tombol (15 menit)

Siapkan dua dashboard berdampingan, **browser 1** (misalnya Chrome) dan **browser 2** (misalnya Edge), keduanya masuk sebagai `admin@rumah.test` di Detail **Latihan ruang tamu** (jalur perangkat: Node 1-mu). Pakai dua browser, bukan dua tab: tab di belakang bisa ditunda browser. Di browser 1, tekan **F12** → tab **Network**. Rekaman di bawah memakai simulator baru dari 6.5; perintah yang diterima diproses sama oleh simulator lama.

1. **Lampu dan kipas.** Di browser 1, ketuk **Lampu**, lalu **Kipas**, lalu keduanya sekali lagi. Perhatikan browser 2 dan terminal `backend`.

   **Hasilnya (contoh, lab penulis):** tombol langsung `Nyala`, pudar, dengan `Menunggu konfirmasi perangkat…`; ±¼ detik kemudian tulisan itu hilang dan tombol tetap `Nyala`. Browser 2 ikut berganti 172–356 ms sesudah klik, tanpa **F5**. Log tiap ketukan memuat baris seperti:

   ```text
   [12:45:43] INFO: perintah c-20261025-054543-11 (api) ke f00d00000001: lampu = true, ack ok=true dalam 9 ms
   ```

   Terminal simulator menulis `f00d00000001: perintah c-20261025-054543-11 -> ok=true`; di jalur perangkat, relay lampu Node 1 ikut menyala.
2. **Pompa.** Ketuk **5 detik** (jalur perangkat: hanya kalau tandon berisi). **Hasilnya (contoh):** judul tetap `Diam` dengan `Menunggu konfirmasi perangkat…`, lalu *toast* `Pompa menyiram 5 detik.`, judul `Menyiram`, keterangan `Pompa sedang menyiram…`, ketiga tombol pudar, dan ±5 detik kemudian `Diam` lagi; log `pompa = 5, ack ok=true dalam 10 ms`.
3. **Mundur.** Pastikan Lampu `Mati`. Di tab **Network**, klik kanan baris `command` terakhir → **Block request**. Laci **Request conditions** (panel bawah DevTools; dulu *Network request blocking*) terbuka berisi alamat itu, dan kotak **Enable blocking and throttling** tercentang. Ketuk **Lampu**.

   **Hasilnya:** *toast* merah `Lampu: server tidak menjawab.`, dan tombol tetap `Mati`; mundurnya terlalu cepat untuk terlihat (lab: *toast* 51 ms sesudah ketukan). Log `backend` diam, karena permintaannya tidak pernah keluar dari browser. Lalu hilangkan centang **Enable blocking and throttling** (menutup DevTools juga mematikannya). Label menu di atas dari dokumentasi Chrome DevTools; di lab, penulis memblokir alamat yang sama lewat perintah DevTools yang setara.

![Tangkapan layar asli, mode perangkat DevTools 375 piksel (bukan HP sungguhan), akun admin, Detail Node 1 ruang tamu; Node 1 tiruan lab sengaja menjawab 3 detik kemudian supaya bingkai tengah sempat ditangkap; dari kode akhir: menu Aturan baru ada mulai Praktik 7, dan sebelum Praktik 9 teal dan teks abu-abu sedikit lebih terang. Atas, tiga potongan bagian Kendali dengan panah: 1 sebelum diketuk, Lampu Mati di samping Kipas Mati; 2 sekitar 0,9 detik sesudah diketuk, Lampu langsung Nyala dengan warna teal pudar dan tulisan Menunggu konfirmasi perangkat… di bawahnya; 3 sekitar 3,9 detik, perangkat sudah menjawab, Lampu Nyala teal pekat tanpa tulisan. Bawah kiri, seluruh layar HP: lampu dipadamkan dulu, lalu diketuk lagi saat jaringan diblokir; Lampu kembali ke keadaan terlapor, Mati (nomor 4) dan toast merah di bawah layar Lampu: server tidak menjawab. dengan tombol tutup (nomor 5). Legenda: 1 keadaan yang dilaporkan perangkat, aria-pressed false; 2 tampil 6 ms sesudah ketukan lewat useOptimistic dan useTransition, tombol pudar dan tidak bisa diketuk lagi; 3 keadaan diambil dari ack.state, tulisan menunggu hilang; 4 ketukan meminta Nyala, tetapi perintah gagal di jaringan, jadi tombol mundur sendiri ke keadaan terlapor Mati; jaringan diblokir dengan pola */command, setara panel DevTools Request conditions; 5 toast di bawah layar HP, di laptop 1280 piksel ke atas di kanan atas, hilang sesudah 4 detik atau ditutup.](aset/tombol-menunggu-konfirmasi.png)

4. **Akun viewer.** Di browser 2, klik **Keluar**, masuk sebagai `viewer@rumah.test`, lalu buka Detail yang sama.

   **Hasilnya (contoh):** tanpa bagian **Kendali**; grafik langsung di bawah baris status, dan di bawahnya kartu baca-saja `Lampu` `Mati`, `Kipas` `Mati`, `Pompa` `Diam`, `Tirai` `90°`. Tidak ada satu pun tombol Lampu, Kipas, atau pompa; pemilih grafik Suhu, Cahaya, Kelembapan tetap ada, karena itu bukan kendali.

![Dua tangkapan layar asli halaman Detail Node 1 ruang tamu yang sama, mode perangkat DevTools selebar 375 piksel (bukan HP sungguhan), dari dua browser pada kiriman yang sama; Node 1 ruang tamu = Node 1 tiruan lab, angka sensor contoh; dari kode akhir: menu Aturan baru ada mulai Praktik 7, dan sebelum Praktik 9 warna teal dan teks abu-abu di layarmu sedikit lebih terang. Kiri, akun admin: kepala Rumah Pintar Mini, Live, menu Perangkat dan Aturan, Admin Rumah (admin), Keluar (nomor 1); Kembali ke daftar, Riwayat, Node 1 ruang tamu, kunci aktif, node1 Online, terakhir dilihat baru saja; bagian Kendali dengan tombol Lampu Mati dan Kipas Mati (nomor 2) serta Pompa: siram selama 3 detik, 5 detik, 10 detik, Diam (nomor 3); grafik Suhu 5 menit terakhir, diperbarui pukul 12.33.37 WIB (nomor 6), gauge kelembapan tanah 37 % dan air tandon 64 %, kartu Suhu 28.4 °C, Kelembapan 71 %, Cahaya 2310, Gerakan Tidak ada. Kanan, akun viewer: Tamu Rumah (viewer) (nomor 1); tanpa bagian Kendali, grafik langsung di bawah baris status (nomor 4); diperbarui pukul 12.33.37 WIB (nomor 6); kartu yang sama (potongan ini lebih panjang, jadi Tanah RS-485, Suhu tanah, dan EC tanah ikut tampil), lalu kartu baca-saja Lampu Mati, Kipas Mati, Pompa Diam (nomor 5). Legenda: nama dan peran dari backend (jawaban login, atau /auth/me saat halaman dibuka); TombolSakelar Lampu dan Kipas; TombolPompa 3, 5, 10 detik, tidak optimis; viewer tanpa Kendali; kartu baca-saja; kiriman yang sama. Catatan: tombol tidak digambar untuk viewer, dan satpam backend tetap menolak dengan 403 bila viewer mengirim perintah lewat jalan lain.](aset/detail-admin-vs-viewer.png)

> [!NOTE]
> **`504` di lab penulis** (tidak perlu kamu ulangi; butuh perangkat yang `online` tetapi diam, di sini Node 1 tiruan): *toast* `Lampu: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.` 5,05 detik sesudah ketukan, tombol kembali ke keadaan terlapor (`Mati`), log `WARN: … tidak ada ack dalam 5 detik` dan `POST /devices/a4cf12e5b7c0/command -> 504 (5018 ms)`. 40,0 detik sesudah ketukan, lampu menyala sendiri dengan *toast* `lampu a4cf12e5b7c0 dilaporkan false, padahal diinginkan true (api); perintah dikirim lagi`. Baris merah `Failed to load resource: … 504 (Gateway Timeout)` di **Console** wajar. Sebaliknya, selama simulator mati (**Ctrl + C**), ketiga tombol pudar dengan `Perangkat sedang offline: perintah tidak bisa dikirim.` dan ketukan tidak mengirim apa pun.

**Kamu lulus langkah ⭐ ini** kalau Lampu di browser 1 langsung berganti dengan `Menunggu konfirmasi perangkat…` lalu mengikuti jawaban perangkat (log `lampu = true, ack ok=true`), browser 2 ikut berganti tanpa **F5**, ketukan yang diblokir mundur sendiri dengan `Lampu: server tidak menjawab.`, dan akun viewer tidak melihat bagian **Kendali**.

**Simpan ke cabang.** Di terminal kosong (folder `frontend`), `git status` menyebut `main.tsx`, `api.ts`, `toko.ts`, dan `DetailPerangkat.tsx` berubah, serta `kontrak.ts`, `TombolSakelar.tsx`, dan `TombolPompa.tsx` belum terlacak. Lalu:

```text
git add src
git commit -m "Tombol kendali yang menunggu konfirmasi perangkat (Modul 24 Praktik 5)"
```

> ⬆️ **Selesai Praktik 5?** Lampu kini menyala dari dashboard, dan viewer hanya membaca. Baca [Konsep 9](#9-aturan-untuk-manusia-naik-atau-turun-histeresis-dan-siram-berlapis), lalu lanjut ke [Praktik 6 — Backend 1.1](#praktik-6--backend-11-aturan-turun-di-bawah-dan-hapus-aturan-50-menit). L2 dan L4 diulang bersama penguji di [10.3](#103--uji-pengguna-dari-hp-penguji-empat-tugas-tanpa-bantuan-25-menit) dan [10.5](#105-akun-viewer-di-hp-yang-sama-lalu-hapus-akun-penguji-dan-kembalikan-mode-laptop-10-menit).

### Praktik 6 — Backend 1.1: aturan "turun di bawah" dan hapus aturan (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `backend` (dihentikan di 6.1, dinyalakan lagi di 6.4), terminal Vite di `frontend` (tetap menyala; dashboard masih tahap Praktik 5), dan di jalur laptop broker serta simulator di `alat` (diganti di 6.5); **Docker Desktop** (`rumahpintar-db`); **Bruno** (6.4); **Chrome atau Edge** di `http://localhost:5173` (6.5); jalur perangkat: Serial Monitor **Arduino IDE** untuk Node 1 (6.5). Konsep yang dipakai: 9.
>
> ⭐ **Wajib** — langkah 6.4: `npm audit fix` dijalankan, `npm test` meluluskan 57 tes, dan Bruno membuat lalu menghapus aturan siram, sedangkan akun viewer ditolak `403`.

Backend v1.0 menolak aturan "siram jika tanah < 30 %" dengan `400` dan belum bisa menghapus aturan ([Konsep 9](#9-aturan-untuk-manusia-naik-atau-turun-histeresis-dan-siram-berlapis)). Praktik ini menaikkannya ke **1.1.0**: 16 berkas disalin dari `kode/backend/` (lima di antaranya baru), lalu versi dan *lock* diubah dengan npm. Tanpa migrasi database, tanpa paket baru, kontrak data tetap 1.4, dan dashboard tidak disentuh. Semua perubahan (18 berkas, termasuk `package.json` dan *lock*) ada di [`kode/backend-1.1.diff`](kode/backend-1.1.diff).

**Cara menyalin, sama untuk setiap berkas:** buka tautannya di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi berkas bernama sama di folder `backend`-mu. Berkas BARU dibuat dulu: klik kanan foldernya → **New File…**.

#### 6.1 Skema 1.1: `aturan-dasar.ts` tanpa node-cron dan `aturan.ts` yang tipis (10 menit)

1. Di terminal `backend`, tekan **Ctrl + C**. `npm run dev` memulai ulang backend setiap kali berkas disimpan, padahal di tengah penyalinan, berkas baru memanggil fungsi yang belum disalin. Lencana dashboard menjadi **Menyambung ulang…** sampai 6.4, dan itu wajar.
2. Buat berkas BARU `src/schemas/aturan-dasar.ts` dari [`kode/backend/src/schemas/aturan-dasar.ts`](kode/backend/src/schemas/aturan-dasar.ts). Isinya semua bentuk aturan Modul 19, ditambah satu kondisi:

   ```ts
   export const KondisiAmbangBawah = z.strictObject({
     jenis: z.literal("ambang-bawah"),
     device_id: DeviceId,
     besaran: Besaran,
     nyala_di_bawah: z.number(),
     padam_di_atas: z.number(),
     selama_detik: z.number().int().min(0).max(3600),
   }).refine((k) => k.padam_di_atas > k.nyala_di_bawah, {
     message: "padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis)",
     path: ["padam_di_atas"],
   });
   ```

   Pasangan kondisi–aksi juga dilonggarkan: ambang naik/turun + perintah (misalnya pompa 5 detik) kini sah, dan yang ditolak tinggal jadwal + sakelar, dengan pesan `kondisi jadwal berpasangan dengan aksi perintah; aksi sakelar hanya untuk kondisi ambang atau ambang-bawah`.
3. Ganti seluruh isi `src/schemas/aturan.ts` dengan kode ini:

   ```ts
   // aturan.ts - skema aturan otomatis untuk SERVER (Modul 19). Modul 24: semua bentuk aturan pindah ke aturan-dasar.ts, yang
   // tanpa node-cron sehingga dashboard bisa memakai salinannya di browser. Di sini hanya ditambah satu pemeriksaan yang butuh
   // node-cron: apakah ekspresi cron aturan jadwal benar-benar bisa dijalankan.
   import type { z } from "zod";
   import cron from "node-cron";
   import { Aturan as AturanDasar } from "./aturan-dasar.ts";

   // Semua yang ada di aturan-dasar.ts ikut tersedia dari berkas ini (KondisiAmbang, KondisiAmbangBawah, AksiSakelar, IsiAturan,
   // tipe-tipenya, dan seterusnya), jadi berkas lain di backend cukup mengimpor dari aturan.ts seperti sejak Modul 19.
   // Aturan di bawah ini menggantikan Aturan milik aturan-dasar.ts: nama yang ditulis di berkas ini sendiri selalu menang.
   export * from "./aturan-dasar.ts";

   // Isi POST /rules dan PUT /rules/:id di server: bentuk dasar + ekspresi cron yang benar-benar bisa dijalankan node-cron.
   export const Aturan = AturanDasar.refine((a) => a.kondisi.jenis !== "jadwal" || cron.validate(a.kondisi.cron), {
     message: "ekspresi cron tidak sah",
     path: ["kondisi", "cron"],
   });

   export type Aturan = z.infer<typeof Aturan>; // nama yang sama untuk nilai dan tipenya, seperti di aturan-dasar.ts
   ```

Mengapa dipecah dua? Pemeriksaan cron memakai node-cron, yang hanya jalan di Node.js, padahal dashboard nanti memeriksa formulir dengan salinan **identik** `aturan-dasar.ts` ([7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit)). Jadi berkas itu hanya mengimpor `zod` dan `kontrak.ts`, sedangkan `aturan.ts` meneruskan semuanya (`export *`) dan menambah pemeriksaan khusus server, `ekspresi cron tidak sah`. Berkas lain tetap mengimpor dari `aturan.ts`.

#### 6.2 `nilaiAmbangBawah` di `aturan/mesin.ts` beserta tesnya (10 menit)

Ganti isi `src/aturan/mesin.ts` dengan [`kode/backend/src/aturan/mesin.ts`](kode/backend/src/aturan/mesin.ts). Fungsi barunya ada tepat di bawah `nilaiAmbang`:

```ts
export function nilaiAmbangBawah(k: KondisiAmbangBawah, ingatan: Ingatan, nilai: number | null, sekarang: number):
  { ingatan: Ingatan; keputusan: Keputusan } {
  const cermin: KondisiAmbang = {
    jenis: "ambang", device_id: k.device_id, besaran: k.besaran, selama_detik: k.selama_detik,
    nyala_di_atas: -k.nyala_di_bawah, // di bawah 30  ->  di atas -30
    padam_di_bawah: -k.padam_di_atas, // di atas 35   ->  di bawah -35
  };
  return nilaiAmbang(cermin, ingatan, nilai === null ? null : -nilai, sekarang);
}
```

Inilah cermin Konsep 9: otak Modul 19 tidak ditulis ulang, hanya diberi angka bertanda terbalik. Ganti juga `src/aturan/mesin.test.ts` dengan [versi 1.1-nya](kode/backend/src/aturan/mesin.test.ts): 11 tes baru, misalnya tepat 30 belum menyiram, 25 % selama 20 detik memberi `nyalakan` hanya sekali, dan tepat 35 belum siap lagi. Semuanya dijalankan di 6.4.

#### 6.3 Otomasi dua arah, perintah sekali, dan `DELETE /rules/:id` (15 menit)

Salin tujuh berkas lama dan dua berkas tes BARU ini (semuanya di `src/`):

| Berkas | Yang berubah |
| :-- | :-- |
| [`services/otomasi.ts`](kode/backend/src/services/otomasi.ts) | memilih `nilaiAmbang` atau `nilaiAmbangBawah` menurut `kondisi.jenis`; aksi `perintah` dikirim sekali saat menyala; kalimat 🌱/✅; `hapusAturan()`; `data.ok` |
| [`services/perintah.ts`](kode/backend/src/services/perintah.ts) | `lupakanKeinginanAturan()` |
| [`services/jadwal.ts`](kode/backend/src/services/jadwal.ts) | `data.ok` di kejadian jadwal |
| [`db/arsip.ts`](kode/backend/src/db/arsip.ts) | `hapusAturanDb()` |
| [`routes/aturan.ts`](kode/backend/src/routes/aturan.ts) | `DELETE /rules/:id`: `200`, `404` (`aturan N tidak ada`), atau `503` |
| [`auth/keamanan.ts`](kode/backend/src/auth/keamanan.ts) | `"DELETE"` di `methods` CORS |
| [`server.ts`](kode/backend/src/server.ts) | versi `1.1.0` di `/docs` |
| [`services/otomasi.test.ts`](kode/backend/src/services/otomasi.test.ts) (BARU) | 5 tes: siram sekali, siap lagi, ditolak, dihapus, dinonaktifkan |
| [`routes/aturan.test.ts`](kode/backend/src/routes/aturan.test.ts) (BARU) | 6 tes, satpam sungguhan: belum masuk `401`, viewer `403`, admin `200` lalu `404`, *preflight* `DELETE` |

Menghapus aturan dirangkai di `otomasi.ts`, supaya aturannya berhenti saat itu juga, bukan sesudah backend dimulai ulang:

```ts
export async function hapusAturan(id: number): Promise<{ id: number; nama: string } | undefined> {
  const baris = await hapusAturanDb(id);
  if (baris === undefined) return undefined;
  daftar = daftar.filter((a) => a.id !== baris.id); // berhenti dinilai SEKARANG, sebelum database dibaca lagi
  ingatan.delete(baris.id);
  lupakanKeinginanAturan(baris.id); // perangkat yang menyala ulang tidak menerima lagi perintah aturan ini
  await muatAturan(); // daftar di memori dan tugas jadwal ikut diperbarui
  const pesan = `Aturan ${baris.id} (${baris.nama}) dihapus lewat API`;
  log.info(pesan);
  catatKejadian({ device_id: null, jenis: "aturan-diubah", sumber: "api", aturan_id: null, pesan,
    data: { id: baris.id, nama: baris.nama, dihapus: true } });
  kirimSemuaConfig();
  return baris;
}
```

`aturan_id` kejadiannya `null` karena barisnya sudah tidak ada; nomornya ikut di `data`. Lalu satu baris di `keamanan.ts`:

```ts
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
```

Tanpa `"DELETE"`, browser sudah menolak di *preflight* walau rutenya ada; Bruno tidak terpengaruh (bukan browser). Akibat lainnya (aktuator dibiarkan saat aturannya dihapus, `data.ok`, siram yang tidak dicoba lagi) dibahas di Konsep 9.

#### 6.4 ⭐ `npm run cek`, `npm test`, dan `npm audit`, lalu Bruno dan `/docs` 1.1.0 (10 menit)

1. Salin tiga berkas terakhir: [`README.md`](kode/backend/README.md) serta dua berkas BARU di folder `bruno`, bernama persis `buat aturan siram tanah.yml` dan `hapus aturan.yml` (tanpa *body* dan `Content-Type`):

   ```yaml
   info:
     name: buat aturan siram tanah
     type: http
     seq: 24

   http:
     method: POST
     url: "{{baseUrl}}/rules"
     body:
       type: json
       data: |-
         {
           "nama": "Siram jika tanah < 30 %",
           "aktif": true,
           "kondisi": {
             "jenis": "ambang-bawah",
             "device_id": "a4cf12e5b7c0",
             "besaran": "tanah",
             "nyala_di_bawah": 30,
             "padam_di_atas": 35,
             "selama_detik": 10
           },
           "aksi": {
             "jenis": "perintah",
             "device_id": "a4cf12e5b7c0",
             "perintah": {
               "target": "pompa",
               "nilai": 5
             },
             "kabari": true
           }
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

   ```yaml
   info:
     name: hapus aturan
     type: http
     seq: 25

   http:
     method: DELETE
     url: "{{baseUrl}}/rules/4"
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

2. Di terminal `backend`, jalankan `npm audit` (kalau hanya animasi berputar, `npm audit --no-progress`, seperti Modul 20).

   **Hasilnya (25 Oktober 2026, dipotong):**

   ```text
   # npm audit report

   fast-uri  3.0.0 - 3.1.8 || 4.0.0 - 4.2.2
   Severity: moderate
   …
   fix available via `npm audit fix`
   …
   1 moderate severity vulnerability
   ```

   Kerentanan ini sudah ada di *lock* v1.0, bukan karena Modul 24. Hasil `npm audit` bergantung tanggal: di laptopmu bisa nol, bisa lebih banyak. Yang dilatih kebiasaannya: baca nama paket dan tingkatnya, jalankan `npm audit fix` (bukan `--force`), lalu buktikan tes tetap lolos.
3. Jalankan `npm audit fix`, lalu `npm audit` sekali lagi. **Hasilnya:** `changed 3 packages, and audited 226 packages in 4s` … `found 0 vulnerabilities`, lalu `found 0 vulnerabilities`.
4. Naikkan versinya: `npm pkg set version=1.1.0` (tanpa keluaran), lalu `npm install` agar *lock* ikut 1.1.0 (`up to date, audited 226 packages` … `found 0 vulnerabilities`).
5. Jalankan `npm run cek` (hanya dua baris kepala, tanpa galat), lalu `npm test`. **Hasilnya (dipotong):**

   ```text
    ✓ src/services/otomasi.test.ts (5 tests) 111ms
    ✓ src/routes/aturan.test.ts (6 tests) 69ms
   …
    Test Files  7 passed (7)
         Tests  57 passed (57)
   ```

   v1.0 hanya 5 berkas / 35 tes. Urutan dan angka ms berganti setiap jalan.
6. Jalankan `npm run dev`. **Hasilnya (dipotong):** `> rumah-pintar-mini-backend@1.1.0 dev`, `aturan dimuat: 2 aktif dari 3` (tiga aturan Modul 19 termuat utuh; aturan 3 nonaktif), lalu `Server listening at http://127.0.0.1:8080`. Lencana dashboard kembali **Live**.

   > [!TIP]
   > Log backend memuat 🌱, ✅, `—`, dan `°`. Kalau konsol Windows menampilkannya rusak, misalnya `≡ƒî▒ Tanah 25 % ΓÇö …` (dashboard tetap benar), hentikan backend, ketik `chcp 65001` (kode halaman UTF-8, hanya untuk jendela itu), lalu `npm run dev` lagi. Dibuktikan penulis di Windows PowerShell 5.1; terminal VS Code dan Windows Terminal belum diuji.
7. Di Bruno: **login admin** → **buat aturan siram tanah** → **login viewer** → **hapus aturan** → **login admin** → **hapus aturan** dua kali (tab **Tests** merah untuk `403` dan `404`: wajar). Alamat `hapus aturan` berakhiran `/rules/4` (aturan Modul 19 memakai 1–3); kalau `id` di jawaban 201-mu lain, ganti angkanya dengan id-mu (jangan 1–3). Isinya memakai Node 1 `a4cf12e5b7c0`; backend tidak memeriksa perangkatnya, jadi jalur laptop pun mendapat `201`. Di jalur perangkat, tanah yang sedang kering bisa memicu satu siraman sebelum aturan itu dihapus.

   **Hasilnya (rekaman lab penulis; berkas `.yml` dikirim apa adanya oleh skrip, bukan aplikasi Bruno):**

   ```text
   buat aturan siram tanah -> 201 {"id":4,"nama":"Siram jika tanah < 30 %","aktif":true,"kondisi":{"jenis":"ambang-bawah",…},…}
   viewer, hapus aturan    -> 403 {"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}
   admin, hapus aturan     -> 200 {"id":4,"nama":"Siram jika tanah < 30 %","pesan":"aturan 4 (Siram jika tanah < 30 %) dihapus"}
   admin, sekali lagi      -> 404 {"pesan":"aturan 4 tidak ada"}
   ```

   Log backend (dipotong): `WARN: ditolak (403): akun 2 (viewer) mencoba DELETE /rules/4`, `INFO: Aturan 4 (Siram jika tanah < 30 %) dihapus lewat API`.
8. Buka `http://localhost:8080/docs`: versinya `1.1.0`, dan ada `DELETE /rules/{id}` dengan keterangan `Hapus satu aturan; langsung tidak berlaku. Riwayat perintah dan kejadiannya tetap ada`.

**Kamu lulus langkah ⭐ ini** kalau `npm audit fix` sudah dijalankan, `npm test` menulis `Tests  57 passed (57)`, `/docs` berversi `1.1.0`, dan Bruno mendapat `201`, `403` untuk viewer, `200`, lalu `404`. Ada yang gagal? Lihat [🚨](#-kalau-tidak-jalan) *Hapus aturan gagal …*.

> [!NOTE]
> **Kembali ke v1.0 tetap aman, dengan satu kejutan.** Backend v1.0 tidak mogok saat membaca aturan berbentuk baru; ia melewatinya, misalnya `WARN: aturan 5 dilewati: kondisi.jenis: Input tidak valid` di lab penulis. Kejutannya, `GET /rules` v1.0 juga tidak menampilkan aturan itu, seolah hilang. Datanya utuh di database dan tampil lagi begitu naik ke 1.1. Selama di v1.0, jangan menyimpan aturan bernomor itu lewat `PUT`: isinya akan ditimpa bentuk v1.0.

#### 6.5 Simulator: `tanah` dan `tandon` diketik dari terminal (5 menit)

**Jalur laptop.** Simulator Modul 21 membaca tanah acak 20–60 % dan selalu menerima perintah pompa.
1. Di terminal `alat`, tekan **Ctrl + C**. Ganti `simulator-perangkat.js` dan `README.md` di folder `alat` dengan [`kode/alat/simulator-perangkat.js`](kode/alat/simulator-perangkat.js) dan [`kode/alat/README.md`](kode/alat/README.md) (perubahannya: [`kode/alat.diff`](kode/alat.diff)), lalu jalankan lagi `node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1`.
2. Ketik satu per satu, masing-masing diakhiri Enter: `tanah 25`, `tanah acak`, `tandon 15`, `tandon acak`, `tanah 101`.

**Hasilnya (persis, dua potongan rekaman lab penulis):**

```text
1 perangkat palsu menuju mqtt://127.0.0.1:1883. Ketik misalnya "suhu 33", "tanah 25", "tandon 15", atau "tanah acak". Hentikan dengan Ctrl+C.
f00d00000001: online
tanah 25
Tanah: 25 %
tanah acak
Tanah: acak 20-60 %
tandon 15
Tandon: 15 % (di bawah 20 %: perintah pompa akan ditolak)
tandon acak
Tandon: acak 30-90 %
tanah 101
Ketik misalnya: suhu 33, suhu acak, tanah 25, tanah acak, tandon 15, atau tandon acak (tanah dan tandon: bilangan bulat 0-100)
```

Angka ketikan ikut kiriman berikutnya (paling lama 10 detik), isian di luar 0–100 hanya memunculkan bantuan, dan simulator yang dijalankan ulang kembali acak. Tanahnya tidak basah sendiri sesudah pompa menyala; "tanah basah lagi" kamu ketik (`tanah 40`) di [8.5](#85--siram-otomatis-dari-formulir-tanah-25-pompa-menyiram-lalu-siap-lagi-15-menit).

3. **Pompa yang sungguh ditolak.** Ketik `tandon 15`, buka Detail **Latihan ruang tamu** sebagai admin, lalu ketuk **5 detik** di kartu pompa.

**Hasilnya (contoh, lab penulis; direkam saat backend masih v1.0, dan jalur perintah ini tidak berubah di 1.1):** `Menunggu konfirmasi perangkat…`, judul pompa tetap `Diam`, lalu *toast* merah `Pompa: perangkat menolak (pompa ditolak: air tandon kurang)`. Terminal simulator:

```text
f00d00000001: pompa DITOLAK: air tandon tinggal 15 %
f00d00000001: perintah c-20261025-054313-6 -> ok=false
```

Log backend: `pompa = 5, ack ok=false dalam 17 ms` dan `POST /devices/f00d00000001/command -> 200 (61 ms)`. Inilah jawaban `200` dengan `ack.ok: false` dari [Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack): server menyampaikan, perangkat menolak. Di [5.5](#55--lampu-dari-dashboard-rollback-dan-akun-viewer-tanpa-tombol-15-menit) tombol lampu mundur karena permintaannya diblokir; di sini perangkatnya sendiri yang menolak, dan pompa yang tidak optimis (Konsep 2) cukup tetap `Diam`. **Ketik `tandon acak` sebelum lanjut**: selama tandon 15, aturan siram di 8.5 juga ditolak, lalu tidak dicoba lagi (Konsep 9).

**Jalur perangkat.** Tanah dan tandon dibaca sensor; jangan menguras tandon untuk menguji penolakan (pompa tidak boleh menyala kering). Yang wajib: turunkan ambang siram lokal Node 1 ke 20 % supaya aturan server (30 %) bertindak lebih dulu (revisi Modul 19, Konsep 9). Di Serial Monitor Node 1, ketik `ambang`, lalu `ambang 20`. Menurut kode firmware v1.6.0, Node 1 menjawab `ambang: tanah_siram = 20 % (dari NVS)`, angkanya tersimpan walau listrik padam, dan `ambang bawaan` mengembalikannya ke 30 %. Langkah ini dibaca dari firmware dan **belum diuji penulis di papan sungguhan**.

**Simpan ke cabang.** Di terminal kosong, `cd ../backend`, lalu:

```text
git add src bruno README.md package.json package-lock.json ../alat/simulator-perangkat.js ../alat/README.md
git commit -m "Backend 1.1.0 dan simulator tanah/tandon (Modul 24 Praktik 6)"
```

Keadaan akhirnya ada di [`kode/backend/`](kode/backend/) dan [`kode/alat/`](kode/alat/); dashboard tetap tahap Praktik 5.

> ⬆️ **Selesai Praktik 6?** Backend 1.1 sudah siap, tetapi dashboard belum menampilkan satu aturan pun. Baca [Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend), lalu lanjut ke [Praktik 7 — Daftar aturan dalam kalimat](#praktik-7--daftar-aturan-dalam-kalimat-30-menit).

### Praktik 7 — Daftar aturan dalam kalimat (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan terminal `backend` (`npm run dev`), `frontend` (Vite), dan satu terminal kosong untuk npm dan Git (jalur laptop: broker dan simulator tetap menyala); **Docker Desktop** (`rumahpintar-db`); **Bruno**; serta **dua browser berbeda**, misalnya **Edge** dan **Chrome**. Konsep yang dipakai: 8 dan 9.

Sampai sekarang aturan hanya terlihat sebagai JSON di Bruno. Praktik ini menampilkannya di layar baru `/aturan` sebagai kartu berkalimat biasa, untuk admin **dan** viewer: viewer pun jadi tahu kenapa kipas menyala sendiri. Membuat dan mengubah aturan dari layar datang di Praktik 8. Frontend-mu masih dalam keadaan akhir Praktik 5, karena Praktik 6 hanya mengubah backend. Kode di akhir praktik ini: [`kode/tahap/praktik-7/frontend/`](kode/tahap/praktik-7/frontend/).

#### 7.1 Salin `aturan-dasar.ts`, lalu jaga kedua salinan dengan `npm run cek-skema` (10 menit)

Kenapa disalin, bukan diimpor (node-cron membuat layar putih), dan kenapa diperiksa skrip sendiri, bukan `git diff --no-index` (salah lapor pada CRLF), ada di [Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend). Langkahnya:

1. **Salin dengan VS Code, jangan diketik ulang.** Di panel Explorer, klik kanan `backend/src/schemas/aturan-dasar.ts` (Praktik 6) → **Copy**, lalu klik kanan folder `frontend/src/skema` → **Paste**. Jangan ubah satu karakter pun, termasuk komentar kepala dan impor `./kontrak.ts`; salinan `kontrak.ts` dari [5.1](#51-salin-kontrakts-lalu-kirimperintah-yang-memeriksa-jawaban-dengan-acksafeparse-15-menit) sudah ada di sana. Ambil dari backend-mu sendiri, bukan dari GitHub, karena pemeriksanya membandingkan dengan backend-mu.
2. **Catatan "ini salinan".** Klik kanan folder `frontend/src/skema` → **New File…**, beri nama **`README.md`**, lalu isi (atau buka [`kode/tahap/praktik-7/frontend/src/skema/README.md`](kode/tahap/praktik-7/frontend/src/skema/README.md) di GitHub, klik **Copy raw file**, lalu tempel):

   ```markdown
   # `src/skema/` — salinan skema dari backend

   `kontrak.ts` dan `aturan-dasar.ts` di folder ini adalah **SALINAN** dari `backend/src/schemas/` (Modul 24). Dengan salinan ini, formulir di browser memeriksa isian dengan aturan yang persis sama dengan backend, dan jawaban `ack` diperiksa dengan skema yang sama dengan yang dipakai server.

   - **Jangan mengubah salinannya di sini.** Ubah di backend dulu, salin ulang kedua berkas ke folder ini, lalu jalankan `npm run cek-skema` dari folder `frontend`. Hasil yang benar: dua baris `SAMA`. Akhir baris CRLF (Windows) dan LF dianggap sama.
   - **Kenapa disalin, bukan diimpor dari `../backend`?** `backend/src/schemas/aturan.ts` memakai node-cron, yang tidak bisa jalan di browser (halaman menjadi putih). Selain itu frontend harus bisa di-*build* sendirian, tanpa folder `backend` dan `node_modules`-nya. Backend tetap memeriksa ulang setiap isian, termasuk ekspresi cron yang tidak bisa diperiksa di browser.
   - Kedua salinan mengimpor dengan akhiran `.ts` (`./kontrak.ts`), sama dengan gaya backend. Frontend mengizinkannya lewat `allowImportingTsExtensions` di `tsconfig.app.json`; berkas frontend lainnya tetap mengimpor tanpa akhiran.
   - `kontrak.ts` memanggil `z.config(z.locales.id())`, jadi semua pesan galat bawaan Zod di dashboard berbahasa Indonesia.
   - `masuk.ts` **bukan** salinan: skema formulir Masuk ditulis sendiri, meniru skema `Masuk` di `backend/src/routes/auth.ts`.
   ```

3. **Pemeriksanya.** Klik kanan folder **`frontend`** (bukan `src`) → **New File…**, beri nama **`cek-skema.js`**, lalu ketik (atau **Copy raw file** dari [`kode/tahap/praktik-7/frontend/cek-skema.js`](kode/tahap/praktik-7/frontend/cek-skema.js)):

   ```js
   // cek-skema.js - memeriksa bahwa salinan skema di src/skema/ SAMA PERSIS dengan aslinya di backend (Modul 24).
   // Jalankan dari folder frontend dengan "npm run cek-skema". Kode keluar 0 = semuanya sama, 1 = ada yang berbeda.
   // Akhir baris CRLF (Windows) dan LF dianggap sama: Git di Windows bisa mengubahnya diam-diam, padahal isinya tetap sama.
   import { readFileSync } from "node:fs";

   const ASLI = "../backend/src/schemas/"; // folder backend di sebelah folder frontend
   const SALINAN = "src/skema/";
   const BERKAS = ["kontrak.ts", "aturan-dasar.ts"];
   const BOM = String.fromCharCode(0xfeff); // tanda BOM: tak terlihat, disisipkan sebagian editor di awal berkas

   // isi berkas sebagai daftar baris, dengan akhir baris CRLF diseragamkan menjadi LF
   function bacaBaris(jalur) {
     try {
       return readFileSync(jalur, "utf8").replaceAll("\r\n", "\n").split("\n");
     } catch {
       console.error("Tidak bisa membaca " + jalur + ". Jalankan dari folder frontend, dengan folder backend di sebelahnya.");
       process.exit(1);
     }
   }

   let semuaSama = true;
   for (const nama of BERKAS) {
     const asli = bacaBaris(ASLI + nama);
     const salinan = bacaBaris(SALINAN + nama);
     // cari baris pertama yang berbeda
     let beda = -1;
     for (let i = 0; i < Math.max(asli.length, salinan.length); i++) {
       if (asli[i] !== salinan[i]) {
         beda = i;
         break;
       }
     }
     if (beda === -1) {
       console.log("SAMA  " + SALINAN + nama);
       continue;
     }
     semuaSama = false;
     console.log("BEDA  " + SALINAN + nama + ", mulai baris " + (beda + 1) + ":");
     console.log("  backend : " + (asli[beda] ?? "(berkas sudah habis)"));
     console.log("  frontend: " + (salinan[beda] ?? "(berkas sudah habis)"));
     // dua beda yang tidak terlihat mata: tanda BOM (U+FEFF) di awal berkas, dan baris baru di akhir berkas
     if (beda === 0 && (asli[0].startsWith(BOM) || salinan[0].startsWith(BOM))) {
       console.log("  (beda tak terlihat: salah satu berkas diawali tanda BOM; simpan ulang sebagai UTF-8 tanpa BOM)");
     } else if (asli[beda] === undefined || salinan[beda] === undefined) {
       console.log("  (beda di akhir berkas: baris baru terakhirnya hilang atau berlebih)");
     }
   }

   if (!semuaSama) console.log("Salin ulang berkasnya dari " + ASLI + " (jangan diubah di frontend), lalu jalankan lagi.");
   process.exit(semuaSama ? 0 : 1);
   ```

   Skrip Node ini tanpa paket tambahan. `BERKAS` menyebut kedua salinan, jadi `kontrak.ts` ikut diperiksa; CRLF dianggap sama dengan LF. Kode keluar `1` berarti ada yang berbeda.
4. **Beri nama perintahnya.** Di `frontend/package.json`, bagian `"scripts"`, tambahkan satu baris sesudah `"dev:hp"` (jangan lupa koma di akhir baris `"dev:hp"`):

   ```json
       "dev:hp": "vite --host",
       "cek-skema": "node cek-skema.js"
   ```

5. **Jalankan.** Di terminal kosong, pastikan kamu di folder `frontend` (dari folder `backend`: `cd ../frontend`), lalu ketik `npm run cek-skema`.

   **Hasilnya:**

   ```text
   > rumah-pintar-mini-frontend@0.2.0 cek-skema
   > node cek-skema.js

   SAMA  src/skema/kontrak.ts
   SAMA  src/skema/aturan-dasar.ts
   ```

   `0.2.0` tetap begitu sampai Praktik 10. Kalau muncul `Tidak bisa membaca ../backend/src/schemas/kontrak.ts. …`, folder `backend` tidak di sebelah folder `frontend`.
6. **Buktikan pemeriksanya bekerja.** Di **salinan** `frontend/src/skema/aturan-dasar.ts`, ubah `.max(60)` di baris 71 menjadi `.max(80)`, simpan, lalu jalankan `npm run cek-skema` lagi.

   **Hasilnya** (kode keluar 1):

   ```text
   > rumah-pintar-mini-frontend@0.2.0 cek-skema
   > node cek-skema.js

   SAMA  src/skema/kontrak.ts
   BEDA  src/skema/aturan-dasar.ts, mulai baris 71:
     backend :   nama: z.string().min(1).max(60),
     frontend:   nama: z.string().min(1).max(80),
   Salin ulang berkasnya dari ../backend/src/schemas/ (jangan diubah di frontend), lalu jalankan lagi.
   ```

   Kembalikan `60` (**Ctrl + Z**), simpan, lalu jalankan lagi sampai dua baris `SAMA`. `BEDA` di baris 1 tanpa beda yang terlihat, atau di akhir berkas? Lihat [🚨](#-kalau-tidak-jalan) *`npm run cek-skema` menulis `BEDA`*.

Mulai sekarang aturannya satu: ubah skema di backend dulu, salin ulang (hapus salinan lama dulu: **Paste** tidak menimpa, malah membuat `aturan-dasar copy.ts`), lalu jalankan `npm run cek-skema`. Butir ini masuk templat *pull request* di [➕ D](#d-tambahkan-butir-modul-24-ke-templat-pull-request).

#### 7.2 Empat fungsi aturan di `api.ts` dan kalimat dari `uraikanAturan()` (10 menit)

**Langkah 1 — `src/aturan.ts`.** Buat berkas baru **`src/aturan.ts`**: buka [`kode/tahap/praktik-7/frontend/src/aturan.ts`](kode/tahap/praktik-7/frontend/src/aturan.ts) di GitHub, klik **Copy raw file**, lalu tempel. Isinya dua bagian:

- **`AturanLengkap`**: bentuk satu baris jawaban `GET /rules`, yaitu isi aturan dari salinan skema (`...IsiAturan.shape`) ditambah `id`, `dibuat`, `diubah`, dan `berikutnya` (jadwal aktif: kapan berjalan lagi; selain itu `null`). Ditulis ulang karena berkas rute backend tidak bisa disalin.
- **`uraikanAturan(aturan, namaPerangkat)`**: fungsi murni yang mengubah JSON aturan menjadi kalimat. `BESARAN` memberi nama dan satuan (`tanah` → "kelembapan tanah", ` %`), `angka()` menulis gaya Indonesia (28,5), cron `0 6 * * *` menjadi `Setiap hari pukul 06.00 WIB`, dan perintah menjadi kata kerja (`siram 5 detik`). Arahnya mengikuti Konsep 9: `ambang` menulis "di atas", `ambang-bawah` "di bawah". Aksi `sakelar` menutup kalimat dengan "… dimatikan lagi sesudah …", aksi `perintah` dengan "(sekali). Aturan siap lagi sesudah …".

**Langkah 2 — `src/api.ts`.** Buka [`kode/tahap/praktik-7/frontend/src/api.ts`](kode/tahap/praktik-7/frontend/src/api.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/api.ts`-mu. Yang baru: dua impor, komentar di `minta()`, dan empat fungsi sesudah `kirimPerintah()`. Dua di antaranya (`…` = baris yang dilewati):

```ts
export async function ambilAturan(): Promise<AturanLengkap[]> {
  const jawaban = await minta<unknown>("/rules");
  const hasil = AturanLengkap.array().safeParse(jawaban); // .array() = larik yang setiap isinya AturanLengkap
  if (!hasil.success) throw new GalatApi(200, "Jawaban server tidak dikenal (daftar aturan).");
  return hasil.data;
}
…
export function hapusAturan(id: number): Promise<{ id: number; nama: string; pesan: string }> {
  return minta<{ id: number; nama: string; pesan: string }>("/rules/" + id, { method: "DELETE" });
}
```

Seperti `Ack.safeParse` di 5.1, daftar aturan diperiksa Zod; jawaban lain, seperti riwayat, masih dipercaya lewat tipe. `buatAturan()` (`POST`) dan `ubahAturan()` (`PUT /rules/:id`) mengirim JSON untuk formulir Praktik 8. `hapusAturan()` sengaja **tanpa** `Content-Type` dan *body*, seperti `keluar()`: `DELETE` yang mengaku membawa JSON padahal kosong dijawab `400` `FST_ERR_CTP_EMPTY_JSON_BODY` ([🚨](#-kalau-tidak-jalan) *Hapus aturan gagal …*). Simpan; layar belum berubah.

#### 7.3 Layar `/aturan` dan menu Aturan: kartu kalimat yang ikut segar (10 menit)

**Langkah 1 — tanda "aturan berubah".** Saat aturan dibuat, diubah, atau dihapus, backend menyiarkan kejadian `aturan-diubah` ke **semua** dashboard. Ganti seluruh isi `src/toko.ts` dan `src/soket.ts` dengan versi tahap 7 ([`toko.ts`](kode/tahap/praktik-7/frontend/src/toko.ts), [`soket.ts`](kode/tahap/praktik-7/frontend/src/soket.ts); **Copy raw file**). Toko mendapat angka penghitung (tipenya ikut di `type Toko`):

```ts
  versiAturan: 0,
  aturanBerubah: () => set((s) => ({ versiAturan: s.versiAturan + 1 })),
```

`onKejadian` di `soket.ts` menaikkannya, tetap tanpa *toast* ([Konsep 10](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp)):

```ts
      if (k.jenis === "aturan-diubah") {
        useToko.getState().aturanBerubah();
        return;
      }
```

**Langkah 2 — layar, alamat, dan menu.** Buat dua berkas baru lewat **Copy raw file**, [`src/components/DaftarAturan.tsx`](kode/tahap/praktik-7/frontend/src/components/DaftarAturan.tsx) dan [`src/halaman/Aturan.tsx`](kode/tahap/praktik-7/frontend/src/halaman/Aturan.tsx), lalu ganti seluruh isi `src/App.tsx` dan `src/components/TataLetak.tsx` dengan [`App.tsx`](kode/tahap/praktik-7/frontend/src/App.tsx) dan [`TataLetak.tsx`](kode/tahap/praktik-7/frontend/src/components/TataLetak.tsx) tahap 7.

- **`DaftarAturan`**: satu kartu per aturan berisi nama, lencana **Aktif**/**Nonaktif** (warna selalu ditemani teks), kalimat `uraikanAturan()` dengan nama perangkat dari toko, dan untuk jadwal aktif `Berjalan lagi: …` dalam jam WIB. Daftar kosong: `Belum ada aturan otomatis.`
- **`HalamanAturan`** memanggil `ambilAturan()` di `useEffect` berdependensi `[versiAturan]`: setiap kali angkanya naik, daftar diambil ulang. Ini bukan *polling*; permintaan hanya dikirim saat ada kabar perubahan, dan daftar lama tetap tampil sampai yang baru tiba.
- **`App`** mendapat `<Route path="/aturan" element={<HalamanAturan />} />` di luar penjaga `KhususAdmin`, karena viewer juga boleh membaca. **`TataLetak`** menambah `NavLink` **Aturan**, juga tanpa `end`, jadi tetap aktif di `/aturan/baru`.

**Langkah 3 — uji dengan dua dashboard.** Simpan semua berkas.

1. Di **Edge**, masuk sebagai admin, lalu klik menu **Aturan**.

   **Hasilnya (contoh):** judul `Aturan otomatis`, kalimat `Aturan dijalankan backend, walaupun dashboard ini tertutup: …`, lalu satu kartu per aturan Modul 19-mu. Di lab penulis (`/` = baris baru di kartu):

   ```text
   Kipas otomatis / Aktif / Kalau suhu di Node 1 ruang tamu di atas 30 °C selama 120 detik, nyalakan kipas. Kipas dimatikan lagi sesudah suhu turun di bawah 28 °C. Kirim kabar lewat Telegram.
   Siram pagi / Aktif / Setiap hari pukul 06.00 WIB, siram 10 detik di Node 1 ruang tamu. Kirim kabar lewat Telegram. / Berjalan lagi: Sen, 26 Okt, 06.00 WIB
   Uji jadwal / Nonaktif / …
   ```

   Rekaman ini memakai kode Praktik 8, yang menambah **+ Aturan baru** ([8.3](#83-formaturan-di-aturanbaru-useform-dengan-zodresolver-pratinjau-kalimat-dan-tombol-simpan-20-menit)) dan **Ubah** ([8.4](#84-ubah-nonaktifkan-dan-hapus-tombol-ubah-dan-rute-aturanid-10-menit)); kalimat kartunya sama.
2. Di **browser lain** (misalnya Chrome), masuk sebagai viewer dan buka **Aturan**: menunya ada (`… Perangkat | Aturan | Tamu Rumah (viewer) | Keluar`), kartunya sama. Letakkan kedua jendela berdampingan; jangan dua tab di satu browser: *cookie*-nya sama (satu akun saja), dan tab di belakang bisa ditunda.
3. Di Bruno, jalankan `login admin`, lalu buka `buat aturan siram tanah` (6.4). Di tab **Body**, ubah `"aktif": true` menjadi `false` supaya aturannya tidak bertindak, lalu **Send**: `201`. Catat `"id"`-nya (id-mu, misalnya 5). Tanpa **F5**, kartu `Siram jika tanah < 30 %` berlencana **Nonaktif** muncul di kedua dashboard.
4. Buka `hapus aturan`, ganti `4` di ujung alamat dengan id-mu, lalu **Send**: `200`; kartunya hilang lagi. Kembalikan `true` dan `4` seperti semula.

**Hasilnya** (uji penulis): aturan nonaktif yang dibuat lalu dihapus lewat API muncul dan hilang tanpa **F5** (diperiksa 1,5 detik sesudah `201` dan `200`), dengan tepat satu `GET /rules` per kejadian `aturan-diubah` (tab **Network**) dan tanpa *toast*. Dashboard kedua di browser lain (viewer) ikut berganti dalam puluhan milidetik sesudah server menjawab; itu contoh lab, bukan janji.

Di terminal kosong (folder `frontend`), simpan ke cabang:

```text
git add package.json cek-skema.js src
git commit -m "Daftar aturan dalam kalimat dan npm run cek-skema (Modul 24 Praktik 7)"
```

> ⬆️ **Selesai Praktik 7?** Aturan kini terbaca sebagai kalimat oleh semua akun, dan salinannya dijaga `npm run cek-skema`. Lanjut ke [Praktik 8](#praktik-8--form-aturan-buat-ubah-nonaktifkan-hapus-70-menit): skema yang sama menjadi formulir, dan admin mendapat **+ Aturan baru** dan **Ubah**.

### Praktik 8 — Form aturan: buat, ubah, nonaktifkan, hapus (70 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `backend` (1.1.0), `frontend` (Vite), satu terminal kosong untuk Git, dan di jalur laptop broker serta simulator 6.5 di terminal `alat`; **Docker Desktop** (`rumahpintar-db`); **dua browser berbeda** seperti Praktik 7: **Edge** (admin, DevTools tab **Network**) dan **Chrome** (viewer). Konsep yang dipakai: 7, 8, dan 9.
>
> ⭐ **Wajib** — langkah 8.5: aturan "Siram jika tanah < 30 %" dibuat dari formulir baru, lalu `tanah 25` memunculkan *toast* 🌱 dan pompa menyiram sekali, sedangkan `tanah 40` memunculkan ✅ (L3, sebelum diulang penguji di Praktik 10).

Sejak Praktik 7 aturan sudah terbaca. Kini admin mendapat formulir untuk membuat, mengubah, menonaktifkan, dan menghapusnya; isiannya diperiksa skema yang sama dengan backend (Konsep 8). Formulirnya dipecah menjadi beberapa berkas kecil dan ditulis **dari bawah ke atas**: bahan (8.1), tiga bagian (8.2), lalu `FormAturan` yang memasang semuanya (8.3), jadi formulirnya baru terlihat di akhir 8.3. Kode di akhir praktik ini: [`kode/tahap/praktik-8/frontend/`](kode/tahap/praktik-8/frontend/).

**Cara menyalin berkas panjang:** buka tautannya di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi berkas bernama sama di `frontend/src/`. Berkas BARU dibuat dulu: klik kanan foldernya → **New File…**.

#### 8.1 Bahan formulir: `pesanRamah` dan `uraikanGalat400` di `aturan.ts` serta pembantu kolom di `kolom.tsx` (10 menit)

**Langkah 1 — `src/aturan.ts`.** Ganti seluruh isinya dengan [tahap 8](kode/tahap/praktik-8/frontend/src/aturan.ts). Di bawah garis `// ---- Praktik 8: formulir aturan ----` ada bahan baru:

- **Isi bawaan.** `aturanBawaan()` mengisi formulir baru dengan aturan kipas ala Modul 19. `kondisiBawaan()`, `aksiBawaan()`, dan `perintahBawaan()` memberi isi awal setiap pilihan (turun: tanah 30, 35, 10 detik; perintah sekali: pompa 5 detik). `isiFormulir()` memotong aturan tersimpan menjadi empat kolom yang boleh dikirim; `id` dan waktunya urusan backend.
- **Perangkat.** `namaPerangkat()` menukar `device_id` dengan nama dari toko; `pilihanPerangkat()` membuang Node 2 dari pilihan yang bertindak, karena Node 2 tidak menerima perintah.
- **Pesan.** `pesanRamah` sudah kamu baca di [Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend); versi lengkapnya punya enam kalimat. `uraikanGalat400()` memecah kalimat `400` backend, misalnya `body/kondisi/cron ekspresi cron tidak sah, body/nama …`, menjadi daftar `{ kolom, pesan }` dengan nama kolom bertitik (`kondisi.cron`), sama dengan nama di `register`.

**Langkah 2 — `src/kolom.tsx` (baru).** Klik kanan `frontend/src` → **New File…**, beri nama **`kolom.tsx`**, lalu ketik (atau **Copy raw file** dari [tahapnya](kode/tahap/praktik-8/frontend/src/kolom.tsx)):

```tsx
// kolom.tsx - pembantu kecil untuk kolom formulir aturan (Modul 24): gaya kotak dan label, id setiap kolom, serta pesan
// galat setiap kolom beserta atribut aksesibilitasnya. Dipakai FormAturan dan bagian-bagiannya (BagianKapan, BagianLalu).
import { get, useFormState } from "react-hook-form";
import type { Control, FieldError } from "react-hook-form";
import type { Aturan } from "./skema/aturan-dasar";

// gaya kotak isian; aria-[invalid=true]: = garis merah saat kolom ditandai salah
export const KOTAK =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:aria-[invalid=true]:border-red-400";
export const LABEL = "mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200";

// id unik setiap kolom, dari namanya: "kondisi.cron" -> "kolom-kondisi-cron"
export const idKolom = (nama: string) => "kolom-" + nama.replaceAll(".", "-");

// useKolom - pesan galat setiap kolom (dari skema di browser, atau dari jawaban 400 backend). Tanpa control, useFormState
// membaca formulir terdekat (dari <FormProvider> di FormAturan), jadi bagian mana pun bisa memakainya tanpa dititipi props.
// FormAturan sendiri berada di LUAR <FormProvider>-nya, jadi ia memberikan control formulirnya.
export function useKolom(control?: Control<Aturan>) {
  const { errors } = useFormState({ control });
  const galat = (nama: string): string | undefined => get<typeof errors, FieldError | undefined>(errors, nama)?.message;
  // atribut aksesibilitas kotak isian: aria-invalid + aria-describedby HANYA saat kolomnya salah
  const aria = (nama: string) =>
    galat(nama) ? { "aria-invalid": true, "aria-describedby": idKolom(nama) + "-galat" } : { "aria-invalid": undefined, "aria-describedby": undefined };
  const tampilGalat = (nama: string) =>
    galat(nama) ? (
      <p id={idKolom(nama) + "-galat"} className="mt-1 text-sm text-red-700 dark:text-red-300">
        {galat(nama)}
      </p>
    ) : null;
  return { aria, tampilGalat };
}
```

- **`KOTAK` dan `LABEL`**: gaya semua kolom. `min-h-11` = tinggi 44 px (target sentuh, Konsep 11); `aria-[invalid=true]:` memberi tepi merah pada kolom yang salah.
- **`idKolom()`**: id unik dari nama kolom, untuk `<label htmlFor>` dan pesan galatnya.
- **`useKolom()`** membaca `errors` lewat `useFormState`, lalu memberi `aria()` (`aria-invalid` dan `aria-describedby` hanya saat kolomnya salah) dan `tampilGalat()` (pesan merah di bawah kotak), aksesibilitas yang tidak dipasang react-hook-form sendiri (Konsep 7). Tanpa `control`, ia membaca formulir terdekat dari `<FormProvider>` (8.3). Akhirannya `.tsx` karena ada JSX (`<p>`).

Simpan kedua berkas. Layar belum berubah: belum ada yang mengimpor bahan ini.

#### 8.2 Tiga bagian formulir: `BagianKapan`, `BagianLalu`, dan `KonfirmasiHapus` (15 menit)

Ketiganya tinggal di `src/components/` dan baru terlihat sesudah 8.3 memasangnya.

**Langkah 1 — `BagianKapan.tsx` (baru, [**Copy raw file**](kode/tahap/praktik-8/frontend/src/components/BagianKapan.tsx)).** Kelompok **Kapan aturan ini menyala?** (`<fieldset>` + `<legend>`, dibacakan pembaca layar sebagai satu kelompok) berisi tiga kartu: **Saat angka NAIK melewati batas**, **Saat angka TURUN di bawah batas**, dan **Pada jam tertentu**. Kartu ini tidak di-`register`; memilihnya memanggil `gantiKapan` milik `FormAturan`. Kolom di bawahnya mengikuti pilihan: jadwal mendapat kolom cron (jam WIB) dan tiga contoh siap klik (**Setiap hari 06.00**, …); naik atau turun mendapat **Perangkat yang diukur**, **Yang diukur**, dua kolom batas (turun: **Menyala kalau di bawah** dan **Selesai kalau naik di atas**), dan **Harus bertahan selama**.

Keempat kolom batas digambar satu pembantu, `kolomBatas()`: angka boleh berdesimal, dibaca `valueAsNumber`. Di ujung labelnya tercetak nama kunci kecil (`nyala_di_bawah`), supaya pesan histeresis yang memakai nama kunci mudah dicocokkan. Kolom "selama" harus bilangan bulat. Untuk cahaya, labelnya menulis `0-4095, tanpa titik ribuan`, karena `1.000` dibaca 1 ([🚨](#-kalau-tidak-jalan) *Angka di formulir terbaca lain …*).

**Langkah 2 — `BagianLalu.tsx` (baru, [**Copy raw file**](kode/tahap/praktik-8/frontend/src/components/BagianLalu.tsx)).** Kelompok **Lalu apa yang dilakukan?** berisi kartu **Nyalakan selama aturan menyala** (lampu atau kipas) dan **Kirim satu perintah, sekali**. Untuk jadwal, kartu pertama mati dengan alasan `Tidak untuk jadwal: jadwal tidak punya saat selesai.` (Konsep 9). Di bawahnya **Perangkat yang bertindak** dan isi aksinya; untuk perintah sekali, **Perintahnya** (**Pompa (siram)**, **Lampu**, **Kipas**, **Tirai**) mengganti kolom nilai, misalnya **Lama menyiram (detik, 1-10)**. Terakhir dua kotak centang: kabar Telegram dan **Aktif (hapus centang untuk menghentikan sementara tanpa menghapus)**, yang dipakai di 8.4.

Kedua bagian mengambil `register` lewat `useFormContext<Aturan>()` dan pesan galat lewat `useKolom()`, jadi *props*-nya tinggal isi saat ini dan fungsi penggantinya.

**Langkah 3 — `KonfirmasiHapus.tsx` (baru).** Tombol **Hapus aturan** beserta kotak "yakin?"-nya. Ketik (atau **Copy raw file** dari [tahapnya](kode/tahap/praktik-8/frontend/src/components/KonfirmasiHapus.tsx)):

```tsx
// KonfirmasiHapus.tsx - tombol "Hapus aturan" beserta kotak "yakin?"-nya di formulir ubah aturan (Modul 24). Kotak ini
// bagian dari halaman, bukan jendela confirm() browser: tombol Batal di dalamnya langsung difokus, dan sesudah Batal fokus
// kembali ke tombol Hapus aturan, jadi pengguna keyboard tidak terlempar ke awal halaman.
import { useRef, useState } from "react";

type Props = {
  nama: string; // nama aturan, untuk kalimat pertanyaannya
  menghapus: boolean; // true selama DELETE /rules/:id berjalan
  onHapus: () => void; // dipanggil tombol "Ya, hapus"
};

export default function KonfirmasiHapus({ nama, menghapus, onHapus }: Props) {
  const [yakin, setYakin] = useState(false); // kotak "yakin?" sedang tampil
  const tombolHapus = useRef<HTMLButtonElement>(null); // ref = pegangan ke tombol di halaman, untuk memindah fokus

  function batal() {
    setYakin(false);
    tombolHapus.current?.focus(); // tombol Hapus aturan tetap ada di halaman, jadi fokus bisa langsung kembali ke sana
  }

  return (
    <>
      <button
        ref={tombolHapus}
        type="button"
        onClick={() => setYakin(true)}
        className="min-h-11 rounded-lg border border-red-600 px-4 font-medium text-red-700 hover:bg-red-50 sm:ml-auto dark:border-red-400 dark:text-red-300 dark:hover:bg-red-950"
      >
        Hapus aturan
      </button>
      {yakin ? (
        // role="alertdialog" + aria-labelledby/aria-describedby: pembaca layar membacakan pertanyaannya begitu fokus
        // pindah ke tombol Batal. basis-full = kotak ini turun ke baris sendiri, di bawah tombol-tombol formulir.
        <div
          role="alertdialog"
          aria-labelledby="hapus-judul"
          aria-describedby="hapus-isi"
          className="basis-full rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p id="hapus-judul" className="font-medium">
            Hapus aturan "{nama}"?
          </p>
          <p id="hapus-isi" className="mt-1">
            Riwayat perintah dan kejadiannya tetap tersimpan. Kalau hanya ingin berhenti sementara, hapus centang Aktif lalu
            simpan.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onHapus}
              disabled={menghapus}
              className="min-h-11 rounded-lg bg-red-700 px-4 font-medium text-white hover:bg-red-800 disabled:opacity-60"
            >
              {menghapus ? "Menghapus…" : "Ya, hapus"}
            </button>
            <button
              type="button"
              autoFocus
              onClick={batal}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              Batal
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
```

- Kotaknya bagian halaman, bukan jendela `confirm()` browser, jadi bisa diberi `role="alertdialog"`: pembaca layar membacakan pertanyaan (`aria-labelledby`) dan penjelasannya (`aria-describedby`).
- `autoFocus` di **Batal**: **Enter** yang tak sengaja tertekan membatalkan, bukan menghapus.
- `useRef` memegang tombol **Hapus aturan**; sesudah **Batal**, fokus kembali ke sana, jadi pengguna papan ketik tidak terlempar ke awal halaman.
- `menghapus` membuat **Ya, hapus** menjadi `Menghapus…` dan mati selama `DELETE` berjalan.

Simpan ketiganya; layar masih sama.

#### 8.3 `FormAturan` di `/aturan/baru`: `useForm` dengan `zodResolver`, pratinjau kalimat, dan tombol Simpan (20 menit)

**Langkah 1 — `src/components/FormAturan.tsx` (baru, [**Copy raw file**](kode/tahap/praktik-8/frontend/src/components/FormAturan.tsx)).** *Props*-nya `id` (`null` = aturan baru lewat `POST`; angka = ubah aturan itu lewat `PUT`) dan `awal` (isi awal). Intinya:

```tsx
  const formulir = useForm({ resolver: zodResolver(Aturan, { error: pesanRamah }), mode: "onTouched", defaultValues: awal });
  const { register, control, handleSubmit, setValue, unregister, setError, clearErrors, formState } = formulir;
```

`Aturan` = skema salinan backend, `pesanRamah` = peta pesan 8.1, `mode: "onTouched"` = seperti formulir Masuk (Konsep 7). Selebihnya:

- **`useWatch`** mengawasi `kondisi` dan `aksi`, jadi kolom yang tampil dan kotak **Pratinjau** (kalimat `uraikanAturan()`, sama dengan kartu daftar) ikut berganti.
- **`gantiKapan`, `gantiAksi`, `gantiTarget`** mengganti satu objek utuh dengan `setValue`, supaya kolom pilihan lama tidak terkirim ([🚨](#-kalau-tidak-jalan) *`Kunci tidak dikenali` …*). Jadwal memaksa aksi menjadi perintah sekali; `unregister("aksi.perintah.nilai")` mencegah `valueAsNumber` terbawa ke pilihan nyala/mati.
- **`simpan`** dipanggil `handleSubmit` hanya kalau isian lolos skema: `buatAturan()` atau `ubahAturan()`, *toast* `Aturan "…" disimpan.`, lalu `navigate("/aturan", { replace: true })` (**Back** tidak membuka lagi formulir yang tersimpan). Jawaban `400` dipecah `uraikanGalat400()`: pesan untuk 11 kolom yang punya tempat (`KOLOM_TAMPIL`) dipasang `setError` di kolomnya, fokus ke kolom pertama; sisanya masuk `root.server` dan tampil di atas tombol: `Ditolak server: …`.
- **`hapus`**: `hapusAturan()`, *toast* `Aturan "…" dihapus.`, kembali ke `/aturan` dengan `replace`.
- **`<FormProvider>`** membagikan formulir ke kedua bagian. Tombolnya **Simpan aturan** (`Menyimpan…` selama `isSubmitting`), **Batal**, dan `KonfirmasiHapus` bila `id` bukan `null`.

**Langkah 2 — `src/halaman/FormAturan.tsx`.** Kalimat sementara Praktik 3 (`Formulir aturan baru (dibuat di Praktik 8).`) diganti pembungkus sungguhan: ganti seluruh isinya dengan [tahap 8](kode/tahap/praktik-8/frontend/src/halaman/FormAturan.tsx). Halaman ini menunggu daftar perangkat dari toko (`Memuat perangkat…`); untuk alamat bernomor, ia mencari nomornya di `GET /rules` (`Aturan … tidak ditemukan.` kalau tidak ada). Bagian akhirnya (`…` = dilewati):

```tsx
  else if (nomor === null) isi = <FormAturan id={null} awal={aturanBawaan(perangkat)} />;
  …
  // formulir baru dipasang SESUDAH aturannya tiba, jadi isi awalnya langsung benar (tidak perlu reset() susulan).
  // key = nomor aturan: aturan lain berarti formulir baru dengan isian segar.
  else isi = <FormAturan key={aturan.id} id={aturan.id} awal={isiFormulir(aturan)} />;
```

Halaman ini sudah siap untuk `/aturan/:id`; rutenya dipasang di 8.4.

**Langkah 3 — tombol `+ Aturan baru`.** Ganti seluruh isi `src/halaman/Aturan.tsx` dengan [tahap 8](kode/tahap/praktik-8/frontend/src/halaman/Aturan.tsx): di samping judul kini ada `<Link to="/aturan/baru">` **+ Aturan baru**, digambar hanya bila `useAdmin()` bernilai `true` (Praktik 3).

**Langkah 4 — coba.** Simpan semua berkas. Di jalur laptop, ketik dulu `tanah 40` di terminal `alat`, supaya aturan yang nanti tersimpan tidak langsung menyiram. Di **Edge** (admin), buka **Aturan** → **+ Aturan baru** dan tab **Network** (**F12**).

1. **Hasilnya (contoh):** judul `Aturan baru`, kartu **Saat angka NAIK melewati batas** terpilih, dan pratinjau aturan kipas bawaan, di lab penulis `Kalau suhu di Node 1 ruang tamu di atas 30 °C selama 60 detik, nyalakan kipas. …`
2. Buat salah dengan sengaja: klik **Nama aturan**, tekan **Tab**; pilih **Saat angka TURUN di bawah batas** (batasnya menjadi tanah 30, 35, 10); kosongkan **Menyala kalau di bawah**; isi "selama" `2,5`; pilih **Kirim satu perintah, sekali** (Pompa, 5 detik), lalu ganti lamanya `11`. Klik **Simpan aturan**.

   **Hasilnya:** tidak ada baris `rules` baru di tab **Network**, fokus pindah ke **Nama aturan**, dan empat kotak bertepi merah dengan pesan `Wajib diisi`, `Isi dengan angka`, `Isi dengan bilangan bulat (tanpa koma)`, dan `Paling besar 10`.
3. Betulkan: nama `Siram jika tanah < 30 %`, batas `30`, selama `10`, lama `5`. Lalu isi **Selesai kalau naik di atas** dengan `25` dan tinggalkan kolomnya: `padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis)`, kalimat yang sama dengan `400` server. Belum muncul? Klik **Simpan aturan** (Konsep 8). Kembalikan `35`.
4. *(Opsional, penjaga kedua.)* Pilih **Pada jam tertentu**, ketik `61 * * * *`, **Simpan aturan**: browser meloloskannya, backend menjawab `400`, dan `ekspresi cron tidak sah` muncul di bawah kolom jadwal (uji penulis). Pilih lagi **Saat angka TURUN di bawah batas** (kembali 30, 35, 10).
5. Pilih **Latihan ruang tamu** di kedua kolom perangkat (jalur perangkat: **Node 1 ruang tamu**); biarkan **kelembapan tanah** dan **Aktif**.

   **Hasilnya:** pratinjau `Kalau kelembapan tanah di Latihan ruang tamu di bawah 30 % selama 10 detik, siram 5 detik (sekali). Aturan siap lagi sesudah kelembapan tanah naik di atas 35 %.`
6. Klik **Simpan aturan**.

   **Hasilnya (lab penulis):** `POST /rules` → `201`, kembali ke `/aturan` dengan *toast* `Aturan "Siram jika tanah < 30 %" disimpan.`, dan kartu baru berlencana `Aktif`. Isi kirimannya (baris `rules` berstatus `201`, tab **Payload**) hanya memuat kunci pilihan terakhir, dengan angka sebagai angka, bukan teks:

   ```text
   {"nama":"Siram jika tanah < 30 %","aktif":true,"kondisi":{"jenis":"ambang-bawah","device_id":"f00d00000001","besaran":"tanah","nyala_di_bawah":30,"padam_di_atas":35,"selama_detik":10},"aksi":{"jenis":"perintah","device_id":"f00d00000001","perintah":{"target":"pompa","nilai":5},"kabari":false}}
   ```

   Muncul `Ditolak server: kondisi.jenis: Input tidak valid` di atas tombol? Backend-mu masih 1.0 ([🚨](#-kalau-tidak-jalan) *`Ditolak server: kondisi.jenis …`*).

![Tangkapan layar asli formulir /aturan/baru, laptop 1280 piksel, kartu formulir dipotong, akun admin; warna dari kode akhir, sebelum Praktik 9 tombol teal, teks abu-abu, dan garis fokus kolom sedikit lebih terang. Kiri, isian benar: Nama aturan Siram jika tanah kurang dari 30 % (nomor 1); Kapan aturan ini menyala? dengan Saat angka TURUN di bawah batas terpilih (nomor 2) di antara Saat angka NAIK melewati batas dan Pada jam tertentu; Perangkat yang diukur Latihan ruang tamu, Yang diukur kelembapan tanah; Menyala kalau di bawah nyala_di_bawah 30, Selesai kalau naik di atas padam_di_atas 35, Harus bertahan selama selama_detik 10 (nomor 3); Lalu apa yang dilakukan? dengan Kirim satu perintah, sekali terpilih, Perangkat yang bertindak Latihan ruang tamu, Perintahnya Pompa (siram), Lama menyiram 5 (nomor 4); Telegram tidak dicentang, Aktif dicentang; Pratinjau: Kalau kelembapan tanah di Latihan ruang tamu di bawah 30 % selama 10 detik, siram 5 detik (sekali). Aturan siap lagi sesudah kelembapan tanah naik di atas 35 %. (nomor 5); tombol Simpan aturan dan Batal. Kanan, isian salah sesudah Simpan aturan diklik, kotak bertepi merah dengan pesan di bawahnya: Wajib diisi pada nama yang kini berfokus (nomor 6), Isi dengan angka pada batas yang kosong (nomor 7), Isi dengan bilangan bulat (tanpa koma) pada selama 2.5 (nomor 8), Paling besar 10 pada lama menyiram 11 (nomor 9); pratinjau ikut menulis … dan 2,5 detik. Kanan bawah, potongan histeresis: nyala 30, padam 25, pesan padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis) (nomor 10). Legenda: tanpa POST saat isian salah; pesan histeresis muncul sesudah kolom angka lain benar.](aset/form-aturan-siram.png)

#### 8.4 Ubah, nonaktifkan, dan hapus: tombol Ubah dan rute `/aturan/:id` (10 menit)

**Langkah 1 — rute.** Di `src/App.tsx`, tambahkan baris `/aturan/:id` di dalam penjaga kedua (satu-satunya perubahan berkas ini):

```tsx
          {/* penjaga kedua: layar yang mengubah sesuatu hanya untuk admin */}
          <Route element={<KhususAdmin />}>
            <Route path="/aturan/baru" element={<HalamanFormAturan />} />
            <Route path="/aturan/:id" element={<HalamanFormAturan />} />
          </Route>
```

Satu halaman melayani keduanya; `useParams()` memberi `id` hanya di `/aturan/:id`. Di dalam `KhususAdmin`, alamat ini tertutup bagi viewer, dan satpam backend tetap menolak `PUT`/`DELETE` viewer dengan `403` (6.4).

**Langkah 2 — tautan Ubah.** Ganti seluruh isi `src/components/DaftarAturan.tsx` dengan [tahap 8](kode/tahap/praktik-8/frontend/src/components/DaftarAturan.tsx): setiap kartu mendapat `<Link>` **Ubah** ke `/aturan/<nomor>`, hanya untuk admin, dengan `aria-label` `Ubah aturan <nama>` supaya pembaca layar tidak mendengar "Ubah, Ubah, Ubah". Nonaktifkan dan hapus ada di dalam formulir ubah, supaya daftarnya tetap sederhana.

**Langkah 3 — coba.** Simpan. Letakkan Chrome (viewer, layar **Aturan**) di samping Edge (admin).

1. **Ubah.** Di Edge, klik **Ubah** pada kartu `Siram jika tanah < 30 %`: formulirnya terisi, berjudul `Ubah aturan <nomor>` (lab: `Ubah aturan 4`; nomormu misalnya 6). Ganti **Lama menyiram** menjadi `8`, lalu **Simpan aturan**.

   **Hasilnya (contoh):** `PUT /rules/4` → `200`, *toast* `Aturan "Siram jika tanah < 30 %" disimpan.`, dan kartunya menulis `… siram 8 detik (sekali). …`. Di Chrome kartu yang sama berganti tanpa **F5** dan tanpa *toast* (lab: 22 ms; contoh, bukan janji).
2. **Nonaktifkan.** **Ubah** lagi, hapus centang **Aktif**, lalu **Simpan aturan**. **Hasilnya:** *toast* yang sama, dan lencana `Nonaktif` di kedua browser.
3. **Hapus.** **Ubah** lagi → **Hapus aturan** (tombol bergaris merah). **Hasilnya:** kotak di dalam halaman, fokus di **Batal**:

   ```text
   Hapus aturan "Siram jika tanah < 30 %"?
   Riwayat perintah dan kejadiannya tetap tersimpan. Kalau hanya ingin berhenti sementara, hapus centang Aktif lalu simpan.
   ```

   Tekan **Enter**: kotak tertutup, fokus kembali ke **Hapus aturan**. Klik **Hapus aturan** lagi, lalu **Ya, hapus**. **Hasilnya:** `DELETE /rules/4` → `200`, *toast* `Aturan "Siram jika tanah < 30 %" dihapus.`, kartunya hilang di kedua browser, dan **Back** di Edge tetap di daftar, bukan formulir aturan yang sudah terhapus.
4. **Viewer.** Di Chrome tidak ada **+ Aturan baru** maupun **Ubah**. Ketik `http://localhost:5173/aturan/1`: `Khusus admin`.

Aturan siramnya sengaja dihapus: di 8.5 kamu membuatnya lagi dari formulir baru.

#### 8.5 ⭐ Siram otomatis dari formulir: `tanah 25`, pompa menyiram, lalu siap lagi (15 menit)

Inilah L3 versimu sendiri: aturan siram dibuat dari formulir baru tanpa membuka langkah 8.3, seperti tugas penguji di [10.3](#103--uji-pengguna-dari-hp-penguji-empat-tugas-tanpa-bantuan-25-menit).

1. Di terminal `alat`, pastikan tanah basah (`tanah 40`) dan tandon cukup (`tandon acak`, 6.5).
2. Di Edge: **Aturan** → **+ Aturan baru**. Isi hanya dari kalimat ini: *siram 5 detik kalau kelembapan tanah Latihan ruang tamu di bawah 30 % selama 10 detik, siap lagi di atas 35 %*. Cocokkan pratinjaunya, lalu **Simpan aturan**: kartu berlencana `Aktif` muncul.
3. Biarkan layar **Aturan** terbuka, ketik `tanah 25` di terminal `alat`, lalu tunggu.

**Hasilnya (contoh, lab penulis; aturan nomor 5):** ±15 detik kemudian (di lab 14–19 detik) muncul *toast* `🌱 Tanah 25 % — pompa menyiram 5 detik otomatis`. Terminal simulator:

```text
tanah 25
Tanah: 25 %
f00d00000001: perintah c-20261025-055634-5 -> ok=true
```

Log backend (dipotong):

```text
[12:56:24] INFO: aturan 5 (Siram jika tanah < 30 %): tanah 25 di bawah 30; pompa menyiram 5 detik kalau bertahan 10 detik
[12:56:34] INFO: perintah c-20261025-055634-5 (aturan) ke f00d00000001: pompa = 5, ack ok=true dalam 4 ms
```

Kenapa ±15 detik? Angka ketikan baru ikut kiriman simulator berikutnya (paling lama 10 detik), lalu tanah harus bertahan di bawah 30 selama 10 detik. Pompa menyiram **sekali**: tanah tetap 25 %, tetapi tidak ada 🌱 kedua (Konsep 9). Kiriman sesudahnya membawa `"pompa":true`, lalu `false` lagi begitu 5 detik selesai.

![Tangkapan layar asli halaman /aturan, akun admin: kiri laptop 1280 piksel (halaman utuh, kiri dipotong), kanan mode perangkat DevTools 375 piksel (bukan HP sungguhan); simulator f00d00000001 diberi tanah 25 sekitar 14 detik sebelumnya; warna dari kode akhir, sebelum Praktik 9 teal dan teks abu-abu sedikit lebih terang. Laptop: Aturan otomatis, tombol + Aturan baru (nomor 1), keterangan Aturan dijalankan backend, walaupun dashboard ini tertutup. Empat kartu aturan dalam kalimat: Kipas otomatis, Aktif, Kalau suhu di Node 1 ruang tamu di atas 30 °C selama 120 detik, nyalakan kipas. Kipas dimatikan lagi sesudah suhu turun di bawah 28 °C. Kirim kabar lewat Telegram. (nomor 2); Siram pagi, Aktif, Setiap hari pukul 06.00 WIB, siram 10 detik di Node 1 ruang tamu, Berjalan lagi: Sen, 26 Okt, 06.00 WIB (nomor 3); Uji jadwal, Nonaktif (nomor 4), Setiap hari pukul 07.04 WIB, siram 2 detik di Latihan ruang tamu; Siram jika tanah kurang dari 30 %, Aktif, Kalau kelembapan tanah di Latihan ruang tamu di bawah 30 % selama 10 detik, siram 5 detik (sekali). Aturan siap lagi sesudah kelembapan tanah naik di atas 35 %. (nomor 5); tiap kartu bertombol Ubah (nomor 6). Kanan atas, di luar kolom isi: toast 🌱 Tanah 25 % — pompa menyiram 5 detik otomatis (nomor 7). HP: daftar yang sama; toast yang sama di bawah layar, sempat menutupi tepi bawah kartu Uji jadwal (nomor 8). Legenda: + Aturan baru dan Ubah hanya admin; kalimat dari uraikanAturan di browser; Berjalan lagi dari kolom berikutnya backend dalam WIB; lencana selalu bertulisan; yang tertutup toast di HP bisa digulir sedikit atau toast ditutup.](aset/aturan-dan-toast.png)

4. Ketik `tanah 40`. **Hasilnya:** pada kiriman berikutnya (di lab ±5 detik) muncul `✅ Tanah naik ke 40 % — aturan siap lagi`. Kedua *toast* itu netral, karena `data.ok` bukan `false`. Ketik `tanah 25` sekali lagi: 🌱 muncul lagi ±15 detik kemudian, bukti "siap lagi" bekerja. Akhiri dengan `tanah 40`.

**Jalur perangkat.** Aturannya sama, dengan **Node 1 ruang tamu** di kedua kolom perangkat; tandon berisi, dan ambang lokal Node 1 sudah 20 % (6.5) supaya aturan server bertindak lebih dulu ([🚨](#-kalau-tidak-jalan) *Node 1 menyiram dua kali …*). Tanah pot tidak bisa diketik, jadi ujinya menunggu tanah benar-benar kering; jalur ini belum diuji penulis di papan sungguhan. Langkah ⭐ boleh diluluskan dengan simulator.

**Kamu lulus langkah ⭐ ini** kalau aturan dari formulir baru menyiram tepat sekali sesudah `tanah 25` (*toast* 🌱 dan `-> ok=true` di terminal simulator), `tanah 40` memunculkan ✅, dan `tanah 25` berikutnya menyiram lagi. Tidak ada 🌱? Lihat [🚨](#-kalau-tidak-jalan) *Aturan siram tidak menyiram lagi …* (misalnya tandon masih 15). Aturannya boleh dibiarkan; [10.2](#102-siapkan-uji-akun-penguji-kondisi-awal-dan-mode-hp-10-menit) menghapusnya sebelum uji.

Di terminal kosong (folder `frontend`), simpan ke cabang:

```text
git add src
git commit -m "Form aturan: buat, ubah, nonaktifkan, hapus (Modul 24 Praktik 8)"
```

> ⬆️ **Selesai Praktik 8?** Baca [Konsep 11](#11-dipakai-orang-lain-aksesibilitas-dasar-layar-utama-dan-uji-pengguna), lalu [Praktik 9](#praktik-9--aksesibilitas-hp-dan-layar-utama-40-menit): dashboard diukur dan dirapikan supaya enak dipakai orang lain, juga dari HP.

### Praktik 9 — Aksesibilitas, HP, dan layar utama (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `backend` (`npm run dev`), `frontend` (Vite), dan satu terminal kosong di folder `frontend` untuk `ipconfig`, curl, dan Git (jalur laptop: broker dan simulator tetap menyala); **Docker Desktop** (`rumahpintar-db`); **Chrome atau Edge** dengan DevTools (**Lighthouse**, **Elements** → **Styles**, mode perangkat); dan **HP** di WiFi rumah yang sama. Konsep yang dipakai: 11.

Sebelum orang lain memakai dashboard-mu di Praktik 10, periksa tiga hal dari [Konsep 11](#11-dipakai-orang-lain-aksesibilitas-dasar-layar-utama-dan-uji-pengguna): tulisannya cukup kontras, semuanya bisa dipakai dengan papan ketik dan jempol, dan admin bisa memakainya dari HP, lengkap dengan ikon pintasan. Yang berubah hanya kelas warna dan fokus, `<main>`, ikon, dan `index.html`. Kode di akhir praktik ini: [`kode/tahap/praktik-9/frontend/`](kode/tahap/praktik-9/frontend/).

#### 9.1 Lighthouse dan Color Picker: ukur kontras, lalu perbaiki warnanya (15 menit)

Ukur dulu, baru perbaiki: kode tahap 8 sengaja masih memakai warna lama.

**Langkah 1 — Lighthouse.**

1. Klik **Keluar**, lalu buka `http://localhost:5173/masuk`. Buka DevTools (**F12**) dan pilih tab **Lighthouse** (tidak tampak? klik **»** di deretan tab). Tiga baris merah `Failed to load resource: … 401 (Unauthorized)` di **Console** wajar sebelum masuk.
2. Pilih **Mode** `Navigation`, **Device** `Mobile`, centang **Accessibility** saja di **Categories**, lalu klik **Analyze page load**.

   **Hasilnya (contoh, kode tahap 8):** skor **Accessibility** `88` dengan dua audit gagal:

   ```text
   Background and foreground colors do not have a sufficient contrast ratio.
   Fix any of the following:   Element has insufficient color contrast of 3.66 (foreground color: #ffffff, background color: #009689, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1
   Document does not have a main landmark.
   ```

   DevTools berbahasa Indonesia menulis `Warna latar belakang dan latar depan tidak memiliki rasio kontras yang cukup.` dan `Dokumen tidak memiliki penanda utama.` (rincian elemen tetap Inggris). Yang pertama = tombol **Masuk**, putih di atas `teal-600`, di bawah 4,5 : 1; yang kedua = layar Masuk tanpa `<main>`, penanda "isi utama" tempat pembaca layar melompat. Skor bergantung isi layar dan versi alat (lab lain penulis: 93 untuk temuan yang sama), jadi patokannya audit yang gagal.
3. Masuk sebagai admin, lalu ulangi di Detail `f00d00000001` dan `/aturan/baru`.

   **Hasilnya (contoh):** keduanya `96`, hanya karena kontras. Tiga macam temuan, masing-masing dengan aturan perbaikannya:

   | Rasio di laporan | Warna | Contoh elemen | Aturan perbaikan |
   | :-- | :-- | :-- | :-- |
   | 3,66 : 1 | putih di atas `teal-600` (terang dan gelap) | **Masuk**, **Simpan aturan**, **Lampu** yang menyala, pemilih grafik yang tertekan | 1. teks putih di atas teal → `teal-700` |
   | 4,34 : 1 | `text-slate-500` di atas latar halaman `slate-100` (terang) | `ruang tamu · f00d00000001`, `terakhir dilihat …` | 2. teks redup di latar abu-abu muda → `slate-600` |
   | 2,63 : 1 | `text-slate-400` di atas putih (terang) | `(admin)` di kepala, satuan `°C` | 3. `slate-400` hanya untuk mode gelap |

**Langkah 2 — Color Picker untuk satu tombol.** Klik **Keluar** lagi. Di DevTools, klik ikon panah **Select an element in the page to inspect it** (**Ctrl + Shift + C**), lalu klik tombol **Masuk**: tab **Elements** terbuka dengan tombol terpilih. Di panel **Styles**, cari aturan `.text-white`, klik kotak warna kecil di depan `var(--color-white)`, lalu di Color Picker klik baris `Contrast ratio` untuk membuka rinciannya.

**Hasilnya:** `Contrast ratio 3.65`, dengan `AA: 4.5` dan `AAA: 7.0` bertanda tidak lolos. Color Picker menghitung dari warna asli Tailwind 4 (`oklch`), Lighthouse dari hex `#009689`; pembulatannya beda, kesimpulannya sama.

**Langkah 3 — perbaiki satu tombol dengan tangan.** Di `src/halaman/Masuk.tsx`, pada tombol `type="submit"`, ganti `bg-teal-600` menjadi `bg-teal-700` dan `hover:bg-teal-700` menjadi `hover:bg-teal-800`:

```tsx
          className="mt-5 min-h-11 w-full rounded-lg bg-teal-700 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
```

Simpan, pilih tombol **Masuk** lagi, dan buka Color Picker-nya.

**Hasilnya:** `Contrast ratio 5.38`, `AA: 4.5` lolos. `AAA: 7.0` tetap tidak lolos; modul ini mengejar AA.

**Langkah 4 — sisanya, lalu ukur ulang.** Perubahan lainnya mekanis: setiap baris yang berubah mengikuti satu dari tiga aturan di tabel, ditambah `<main>` di layar Masuk. Dari folder [`kode/tahap/praktik-9/frontend/src/`](kode/tahap/praktik-9/frontend/src/) di GitHub, ganti seluruh isi 16 berkas ini (**Copy raw file**):

- `halaman/`: `Masuk.tsx`, `Aturan.tsx`, `Detail.tsx`, `FormAturan.tsx`, `Riwayat.tsx`;
- `components/`: `TombolSakelar.tsx`, `Pemilih.tsx`, `FormAturan.tsx`, `Riwayat.tsx`, `DetailPerangkat.tsx`, `DaftarPerangkat.tsx`, `TataLetak.tsx`, `KartuSensor.tsx`, `Gauge.tsx`, `Lencana.tsx`, `JagaMasuk.tsx`.

`FormAturan.tsx` dan `Riwayat.tsx` ada di kedua folder; jangan tertukar. `Masuk.tsx` tahap 9 sudah memuat tombolmu tadi, `<main>`, dan garis fokus kolom dari 9.2. Lalu ukur keenam layar: `/masuk`, `/perangkat`, Detail, Riwayat, `/aturan`, dan `/aturan/baru`.

**Hasilnya (contoh):** `100` di keenam layar; kedua audit tadi pindah ke **Passed audits** (**Lulus audit**).

![Tangkapan layar asli. Atas: laporan HTML Lighthouse 13.5.0 kategori Accessibility untuk layar /masuk, terang, dibuka di Edge 156. Kiri, sebelum (tahap Praktik 8): skor 88 jingga (nomor 1); bagian CONTRAST, audit gagal Background and foreground colors do not have a sufficient contrast ratio., tabel Failing Elements menunjuk tombol Masuk berkelas bg-teal-600 (nomor 2); bagian BEST PRACTICES, audit gagal Document does not have a main landmark. (nomor 3). Kanan, sesudah (kode akhir) dengan Passed audits (12) dibuka: skor 100 hijau (nomor 4); di daftar lulus ada Background and foreground colors have a sufficient contrast ratio dan Document has a main landmark. (nomor 5). Bawah: Color Picker DevTools asli Edge 156, panel Styles aturan .text-white, color: var(--color-white), dengan kotak warna kecil yang diklik (nomor 6). Kiri, tombol Masuk bg-teal-600: Contrast ratio 3.65, AA: 4.5 dan AAA: 7.0 bertanda tidak lolos (nomor 7). Kanan, bg-teal-700: Contrast ratio 5.38, AA: 4.5 bertanda lolos, AAA: 7.0 tidak lolos (nomor 8). Catatan: DevTools menulis 3.65 dan 5.38, axe di Lighthouse menulis 3.66. Legenda: kode akhir memakai bg-teal-700 dan pembungkus main; AAA 7,0 memang tidak dikejar.](aset/aksesibilitas-lighthouse.png)

**Tema gelap.** Dashboard mengikuti tema laptop, jadi Lighthouse mengukur tema yang sedang dipakai. Ganti tema laptopmu ke gelap (Windows 11: **Settings** → **Personalization** → **Colors**), ukur lagi, lalu kembalikan. Sebelum perbaikan, kontras tema gelap hanya gagal di aturan 1; sesudahnya juga `100`. Penulis memakai Lighthouse 13.5.0 dari baris perintah (mesinnya sama dengan tab **Lighthouse**) di Edge 156.

#### 9.2 Papan ketik dan jempol: urutan Tab, cincin fokus, dan target 44 px (10 menit)

**Langkah 1 — cincin fokus kolom isian.** Di tahap 8, kolom yang sedang diketik hanya bertepi `teal-500` (2,42 : 1 terhadap putih, di bawah batas 3 : 1) dengan cincin `teal-200` yang nyaris tak terlihat. Di `src/kolom.tsx`, ganti isi `KOTAK` menjadi:

```tsx
export const KOTAK =
  "mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-teal-700 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 aria-[invalid=true]:border-red-600 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-teal-400 dark:focus:outline-teal-400 dark:aria-[invalid=true]:border-red-400";
```

`focus:outline-2 focus:outline-offset-2 focus:outline-teal-700` = garis luar 2 px berwarna `teal-700`, berjarak 2 px dari tepi kotak; `dark:focus:…teal-400` untuk tema gelap. `Masuk.tsx` dari 9.1 sudah memakai garis fokus yang sama. Berkas utuh: [`kode/tahap/praktik-9/frontend/src/kolom.tsx`](kode/tahap/praktik-9/frontend/src/kolom.tsx) (**Copy raw file**).

**Hasilnya (hitungan lab penulis dari warna hex):** garis fokus 5,36 : 1 di tema terang, 7,84 : 1 di tema gelap.

**Langkah 2 — jalur papan ketik.** Singkirkan mouse. Dari `/masuk`: **Tab** ke Email dan Sandi, ketik, **Enter**. Di Daftar, **Tab** ke kartu perangkat, **Enter**. Di Detail, **Tab** sampai **Lampu**, tekan **Spasi** dua kali. **Shift + Tab** ke menu **Aturan**, **Enter**; **Tab** ke **Ubah** salah satu aturan, **Enter**; **Tab** melewati semua kolom sampai **Simpan aturan**, **Enter**. Pilihan "Kapan?" dan "Lalu?" satu perhentian **Tab** per kelompok; pindah pilihannya dengan tombol panah.

**Hasilnya (uji penulis, 1280 px):** seluruh jalur selesai tanpa mouse. Setiap perhentian bercincin (kotak isian bergaris teal, tombol dan tautan bercincin gelap bawaan browser); urutannya kepala dulu (**Perangkat**, **Aturan**, **Keluar**), lalu isi. **Spasi** pertama: `Lampu Nyala`, kedua: `Lampu Mati`; fokus tetap di tombol. Dengan perangkat tiruan yang lambat, fokus juga bertahan selama `Menunggu konfirmasi perangkat…` (`aria-disabled`, bukan `disabled`) dan **Spasi** saat menunggu diabaikan (satu `POST`). **Simpan aturan** membawa ke `/aturan` dengan *toast* `Aturan "…" disimpan.` Wajar: sesudah pindah layar (tautan, **Simpan**) atau ✕ *toast*, fokus jatuh ke halaman (React Router tidak memindahkannya), dan grafik serta dua gauge Recharts menambah tiga perhentian di Detail.

**Langkah 3 — target 44 px.** Nyalakan mode perangkat (**Ctrl + Shift + M**) selebar 375 px, buka Detail, lalu arahkan ikon panah (**Ctrl + Shift + C**) ke **Lampu**, tombol pompa, dan ✕ di *toast* bila ada: kotak keterangannya menulis lebar × tinggi. Untuk pilihan bulat dan kotak centang di form aturan, ukur labelnya, karena label itulah yang diketuk.

**Hasilnya (diukur penulis di 375 dan 1280 px):** tidak ada target di bawah 44 px. Di 375 px: **Lampu** 139,5 × 44, tombol pompa 100,3 × 44, ✕ (**Tutup pesan**) 44 × 44, pilihan bulat 20 × 20 dengan label 309 × 66–86. Audit `target-size` Lighthouse juga lolos.

#### 9.3 Mode HP untuk akun admin dan pintasan di layar utama (15 menit)

**Langkah 1 — ikon dan nama pintasan.** Buka [`kode/tahap/praktik-9/frontend/public/apple-touch-icon.png`](kode/tahap/praktik-9/frontend/public/apple-touch-icon.png) di GitHub, klik **Download raw file**, dan simpan di folder `frontend/public` dengan nama itu (rumah garis berpintu teal, 180 × 180 px, gambar penulis). Di `frontend/index.html`, tepat di bawah baris `<link rel="icon" …>`, tambahkan:

```html
    <!-- Modul 24: ikon (180 x 180 px) dan nama pendek untuk pintasan "Tambahkan ke Layar Utama" di iPhone. Hanya pintasan,
         bukan aplikasi terpasang (PWA butuh HTTPS: Modul 27). -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="Rumah Pintar" />
```

`apple-touch-icon` = gambar ikon; `apple-mobile-web-app-title` = nama di bawahnya (tanpa tag ini: isi `<title>`). Isi `public` dilayani di akar alamat: `http://localhost:5173/apple-touch-icon.png` menampilkan rumahnya.

**Langkah 2 — mode HP Modul 23.** Ulangi [9.2](../modul-23-dashboard-realtime/README.md#92-backend-mode-hp-host-dan-cors_origin-10-menit) dan [9.3](../modul-23-dashboard-realtime/README.md#93-vite-mode-hp-npm-run-devhp-dan-firewall-private-10-menit) Modul 23: cek IP dengan `ipconfig` (bisa berubah), isi `backend/.env` dengan `HOST=0.0.0.0` dan `CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173` (IP-mu), simpan, lalu di terminal Vite **Ctrl + C** dan `npm run dev:hp`. Backend memulai ulang sendiri saat `.env` disimpan; tunggu baris `Server listening at http://192.168.1.10:8080`, dan di terminal Vite pakai baris `Network:` berakhiran `Wi-Fi`.

**Langkah 3 — admin dari HP.** Di browser HP, buka `http://192.168.1.10:5173`, masuk sebagai **admin** (sandinya lewat `http://` polos: hanya di WiFi rumah yang kamu percaya), buka Detail, lalu ketuk **Lampu**.

**Hasilnya (contoh, laptop penulis membuka IP-nya sendiri, bukan HP):** lencana **Live**, dan di terminal `backend`:

```text
[13:12:40] INFO: login: akun 1 (admin), sesi 28, IP 192.168.1.10
…
[13:12:42] INFO: OPTIONS /devices/f00d00000001/command -> 204 (1 ms)
[13:12:42] INFO: perintah c-20261025-061242-2 (api) ke f00d00000001: lampu = true, ack ok=true dalam 10 ms
[13:12:42] INFO: POST /devices/f00d00000001/command -> 200 (14 ms)
```

Di Modul 23, HP hanya `GET`; kini `POST`, `PUT`, dan `DELETE`. Browser bertanya dulu lewat *preflight* `OPTIONS` (`204`), lalu satpam mencocokkan kepala `Origin` (`http://192.168.1.10:5173`) dengan `CORS_ORIGIN`. Dari HP-mu, `IP` di baris `login:` adalah IP HP: bukti L1 bagianmu.

**Langkah 4 — uji negatif.** Di terminal kosong, menyamarlah sebagai halaman yang tidak ada di `CORS_ORIGIN` (macOS: `curl`):

```text
curl.exe -s -X POST http://localhost:8080/devices/f00d00000001/command -H "Origin: http://192.0.2.7:5173"
```

**Hasilnya** (penulis mengirim `Origin` yang sama dari skrip Node): `{"pesan":"permintaan dari halaman http://192.0.2.7:5173 ditolak"}`, dan backend menulis `WARN: ditolak (403): POST /devices/f00d00000001/command dari halaman http://192.0.2.7:5173`. Satpam menolak sebelum memeriksa *login*. HP-mu sendiri ditolak begini? Lihat [🚨](#-kalau-tidak-jalan) *`403 permintaan dari halaman …`*.

**Langkah 5 — pintasan di layar utama.** Masuk dulu di HP, lalu:

- **Android, Chrome:** ⋮ → **Install and create shortcut** → **Create shortcut** → **Add**. Pintasan berlogo Chrome ini terbuka di Chrome. Bukan **Install**: memasang aplikasi butuh HTTPS (Modul 27).
- **iPhone, Safari:** **Bagikan** → **Add to Home Screen**, lalu ikuti layarnya. Sejak iOS 26 ikonnya terbuka sebagai *web app* secara bawaan; mungkin kamu harus masuk lagi di dalamnya.

> [!IMPORTANT]
> **Pintasan belum diuji penulis di HP sungguhan.** Label Android dari bantuan resmi Google; langkah iPhone belum dipastikan dari panduan Apple. Untuk `http://` di WiFi rumah, keduanya belum dicoba. Pintasan hanya menyimpan `http://192.168.1.10:5173`: kalau IP laptop berubah atau mode laptop dikembalikan, ia gagal terbuka ([🚨](#-kalau-tidak-jalan) *Pintasan di layar utama HP …*).

Mode HP dibiarkan menyala untuk Praktik 10. Di terminal kosong (folder `frontend`), simpan ke cabang:

```text
git add index.html public src
git commit -m "Kontras, fokus, dan ikon layar utama (Modul 24 Praktik 9)"
```

> ⬆️ **Selesai Praktik 9?** Praktik 10 dimulai di laptop (10.1), lalu memakai mode HP lagi untuk penguji (10.2) dan mengembalikan mode laptop di [10.5](#105-akun-viewer-di-hp-yang-sama-lalu-hapus-akun-penguji-dan-kembalikan-mode-laptop-10-menit). Kalau berhenti dulu sebelum [Praktik 10](#praktik-10--uji-kelulusan-dipakai-orang-lain-dari-hp-70-menit), kembalikan mode laptop sekarang (cara di 10.5) dan nyalakan lagi mode HP ([9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit)) saat melanjutkan.

### Praktik 10 — Uji kelulusan: dipakai orang lain dari HP (70 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal `backend` (`npm run dev`; mode HP di 10.2–10.5), terminal Vite di `frontend` (*build*, `preview`, lalu `npm run dev` lagi), dan terminal kosong untuk akun dan Git; jalur laptop ditambah broker dan simulator; **Docker Desktop** (`rumahpintar-db`); **Chrome atau Edge** di `http://localhost:5173`; **HP penguji** di WiFi rumah yang sama, **satu orang penguji** (±25 menit), kartu kertas, jam, dan lembar di [`kode/uji-pengguna/`](kode/uji-pengguna/). Konsep yang dipakai: semua, terutama 11.
>
> ⭐ **Wajib** — langkah 10.3: orang lain, dari HP-nya sendiri dan tanpa bantuan, masuk, menyalakan lampu, dan membuat aturan siram "di bawah 30 %" (L1–L3); L4 diulang di 10.5.

Praktik terakhir tidak menambah fitur: dashboard diperiksa dan diberi nomor 1.0.0 (10.1), dicoba orang lain (10.2–10.4), lalu kamu menutupnya dengan akun viewer dan beres-beres (10.5). Urutan 10.2–10.5 sama dengan gambar uji pengguna di [Konsep 11](#11-dipakai-orang-lain-aksesibilitas-dasar-layar-utama-dan-uji-pengguna).

#### 10.1 Dashboard 1.0.0: *lint*, *build*, `cek-skema`, dan nomor versi (15 menit)

Penguji sebaiknya bertemu dashboard yang sudah lolos pemeriksaan. Di terminal Vite, hentikan Vite (**Ctrl + C**; port 5173 nanti dipakai hidangan), lalu jalankan `npm run lint`.

**Hasilnya (contoh):**

```text
> rumah-pintar-mini-frontend@0.2.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 89ms on 46 files with 116 rules using 8 threads.
```

**Bersih** berarti `0 warnings and 0 errors`; durasi dan jumlah *thread* mengikuti laptopmu. Ada temuan? Cocokkan berkasnya dengan [`kode/tahap/praktik-10/frontend/`](kode/tahap/praktik-10/frontend/). Lalu masak hidangannya dengan `npm run build`.

**Hasilnya (contoh):**

```text
> rumah-pintar-mini-frontend@0.2.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
✓ 1662 modules transformed.
computing gzip size...
dist/index.html                   1.15 kB │ gzip:   0.64 kB
dist/assets/index-B8li-KZX.css   23.21 kB │ gzip:   5.43 kB
dist/assets/index-C-4Dhgr5.js   890.31 kB │ gzip: 265.90 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 958ms
```

Blok `(!)` adalah **peringatan** yang sama dengan Modul 23. Bundelnya kini 890.31 kB (v0.2: ±685 kB), dan lonjakan terbesarnya di tahap Praktik 1–2, saat React Router, react-hook-form, dan Zod masuk. Patokannya tetap: ***build* lolos dengan satu peringatan ukuran** (butir templat Modul 23 di [➕ D](#d-tambahkan-butir-modul-24-ke-templat-pull-request)). Jangan menaikkan `chunkSizeWarningLimit`; cara memecah bundel ada di [🔬](#-bedah-teknis-opsional) *`React.lazy` per rute*.

Lalu, di terminal yang sama:

1. `npm run cek-skema` → dua baris `SAMA`, seperti di [7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit).
2. `npm pkg set version=1.0.0` (tidak mencetak apa pun), lalu `npm install` supaya `package-lock.json` ikut berganti.

   **Hasilnya (contoh):**

   ```text
   up to date, audited 101 packages in 2s

   16 packages are looking for funding
     run `npm fund` for details

   found 0 vulnerabilities
   ```

3. `npm run lint` dan `npm run build` sekali lagi: kepalanya kini `> rumah-pintar-mini-frontend@1.0.0 …`, sisanya sama, termasuk nama berkas, karena versi tidak ikut dimasak.
4. Sajikan hidangannya ke WiFi rumah dengan `npm run preview -- --host` (`--` meneruskan `--host` ke `vite preview`).

   **Hasilnya (contoh):**

   ```text
   > rumah-pintar-mini-frontend@1.0.0 preview
   > vite preview --host

     ➜  Local:   http://localhost:5173/
     ➜  Network: http://172.30.x.x:5173/  vEthernet (WSL (Hyp…
     ➜  Network: http://192.168.x.x:5173/  Ethernet 3
     ➜  Network: http://192.168.x.x:5173/  Ethernet 4
     ➜  Network: http://192.168.1.10:5173/  Wi-Fi
     ➜  press h + enter to show help
   ```

   Tanpa baris `VITE … ready in …`, beda dengan `npm run dev`. Pakai baris berakhiran **Wi-Fi** (laptopmu mungkin hanya punya satu baris `Network`; IP-mu akan berbeda). Di laptop, buka `http://localhost:5173`, masuk sebagai admin, pastikan lencana **Live** menyala. Biarkan hidangan ini menyala: inilah dashboard 1.0.0 yang dibuka penguji.

#### 10.2 Siapkan uji: akun penguji, kondisi awal, dan mode HP (10 menit)

Buka [`lembar-tugas.md`](kode/uji-pengguna/lembar-tugas.md); bagian A adalah daftar persiapanmu.

1. **Akun penguji.** Di terminal kosong, pindah ke folder `backend` (`cd ../backend`; PowerShell/Terminal macOS, bukan Git Bash, karena sandinya ditanyakan di terminal), lalu jalankan `npm run pengguna -- tambah penguji@rumah.test "Penguji" admin`. Ketik sandi barunya (minimal 15 karakter) dua kali.

   **Hasilnya:**

   ```text
   > rumah-pintar-mini-backend@1.1.0 pengguna
   > node --env-file=.env src/db/kelola-pengguna.ts tambah penguji@rumah.test Penguji admin

   Sandi baru: **************************************
   Ketik sekali lagi: **************************************
   akun 3 dibuat: penguji@rumah.test (Penguji, admin)
   ```

   Jumlah bintang = panjang sandimu, dan nomor akunnya bisa lain. Tulis email dan sandinya di **kartu kertas** saja, jangan di berkas, chat, atau foto.
2. **Kondisi awal.** Di laptop (admin), pastikan **Lampu** `Mati`, dan hapus aturan siram latihan Praktik 8 (**Ubah** → **Hapus aturan** → **Ya, hapus**): penguji harus membuatnya sendiri. Jalur laptop: ketik `tandon acak` dan `tanah 45` di terminal simulator. Lembar tugas menulis `tanah acak`, tetapi angka acak 20–60 % bisa menyalakan aturan penguji sebelum waktunya.
3. **Mode HP.** Kalau mode HP dari [9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit) sudah dimatikan, ubah lagi `backend/.env`: `HOST=0.0.0.0` dan `http://<IP-laptop>:5173` di `CORS_ORIGIN`. Backend memulai ulang sendiri (tanpa **Ctrl + C**); tunggu baris `Server listening at http://192.168.1.10:8080` dengan IP-mu. Hidangan 10.1 tetap menyala. (Lembar tugas menyebut `npm run dev:hp`, yang juga bisa; hidangan 1.0.0 lebih tepat diuji.)
4. Minta penguji membuka `http://<IP-laptop>:8080/health` di HP-nya: jawabannya JSON yang diawali `{"ok":true`. Tulis IP-mu di bagian B lembar tugas, lalu siapkan [`lembar-catatan.md`](kode/uji-pengguna/lembar-catatan.md) dan jam. Mau merekam layar atau suara? Minta izin; boleh ditolak.

#### 10.3 ⭐ Uji pengguna dari HP penguji: empat tugas tanpa bantuan (25 menit)

> [!NOTE]
> Penulis belum menjalankan uji ini dengan orang lain dari HP sungguhan. Yang direkam penulis hanya gladi: keempat tugas dikerjakan **skrip otomatis, bukan orang**, pada hidangan 1.0.0 di browser laptop selebar 375 × 812 piksel. Skrip tidak pernah bingung, jadi gladi itu hanya membuktikan alurnya jalan. Belum ada penguji atau HP? Kerjakan tugasnya sendiri dengan mode perangkat DevTools, dan biarkan L1–L3 kosong di [✅](#-checklist-kelulusan-modul-24).

1. Bacakan pembuka bagian B kepada penguji, berikan kartunya, lalu bacakan tugas 1. Jam mulai berjalan begitu tugas selesai dibacakan.
2. Amati dan dengarkan, lalu catat di mana ia ragu. Kamu hanya boleh membacakan ulang tugasnya. Macet lebih dari 2 menit, menyerah, atau bertanya langsung = **dibantu**.
3. Setiap tugas meninggalkan jejak di terminal `backend`; salin barisnya ke lembar catatan. IP di baris `login` harus milik HP penguji, bukan `127.0.0.1` atau IP laptopmu.
4. Sesudah tugas 3, ketik `tanah 25` di terminal simulator (jalur perangkat: tanah yang memang kering). Tak lama kemudian (di lab ±15 detik), HP penguji menampilkan *toast* `🌱 Tanah 25 % — pompa menyiram … detik otomatis`. Ketik `tanah 45` lagi, lalu bacakan tugas 4.

Penguji memiringkan HP, lalu *toast* menutupi tombol? Itu temuan untuk dicatat, bukan kesalahannya ([🚨](#-kalau-tidak-jalan) *Toast menutupi …*).

**Hasilnya** (log backend saat gladi skrip penulis; skripnya di laptop, jadi IP-nya `127.0.0.1`):

```text
[13:18:28] INFO: login: akun 3 (admin), sesi 31, IP 127.0.0.1
[13:18:28] INFO: perintah c-20261025-061828-4 (api) ke f00d00000001: lampu = true, ack ok=true dalam 12 ms
[13:18:35] INFO: Aturan 6 (Siram otomatis (uji)) dibuat lewat API: pompa f00d00000001 = 5 sekali kalau tanah f00d00000001 di bawah 30 selama 10 detik, siap lagi di atas 35
[13:18:36] INFO: logout: sesi 31
```

**Kamu lulus langkah ⭐ ini** kalau penguji (bukan kamu), dari HP-nya sendiri lewat WiFi rumah, menyelesaikan tugas 1–3 dengan hasil **berhasil** (boleh sesudah perbaikan 10.4), baris `login` di lembar catatan memuat IP HP-nya, dan `tanah 25` memunculkan 🌱.

#### 10.4 Perbaiki yang membingungkan, lalu ulangi tugas yang dibantu (10 menit)

Semua tugas **berhasil**? Tulis "tidak ada" di tabel perbaikan lembar catatan, lalu lanjut ke 10.5. Untuk setiap tugas **dibantu** atau **gagal**:

1. Cari penyebabnya di catatanmu: label yang tidak dimengerti, letak yang tidak ditemukan, atau pesan yang tidak menjelaskan langkah berikutnya. Yang diperbaiki dashboard-nya; kalimat tugas tidak diubah.
2. Ubah sesedikit mungkin di `src`. Di terminal Vite: **Ctrl + C**, `npm run lint`, `npm run build`, lalu `npm run preview -- --host` lagi.
3. Minta penguji memuat ulang halaman (HP-nya masih memegang dashboard lama), lalu ulangi tugas itu saja dengan penguji yang sama sesudah jeda atau penguji lain; catat hasilnya.

Perbaikanmu membuat `src` berbeda dari `kode/frontend/` (wajar di ➕ A); sebutkan di *pull request* ➕ E.

#### 10.5 Akun viewer di HP yang sama, lalu hapus akun penguji dan kembalikan mode laptop (10 menit)

1. **L4.** Dengan izin penguji, masuk di HP-nya sebagai **viewer** (tolak tawaran menyimpan sandi). Di Detail, Lampu, Kipas, dan Pompa hanya kartu, tanpa bagian **Kendali**; **Aturan** tanpa **+ Aturan baru** dan **Ubah**. Lalu **Keluar**. Gladi skrip penulis (375 px) mendapatkan hal yang sama.
2. **Bereskan rumah.** Aturan buatan penguji bekerja sungguhan: di laptop, periksa kalimatnya di **Aturan**, ubah atau hapus kalau tidak kamu inginkan, dan padamkan lampu.
3. **Hapus akun penguji.** Di terminal kosong (folder `backend`), jalankan `npm run pengguna -- hapus penguji@rumah.test`.

   **Hasilnya:**

   ```text
   > rumah-pintar-mini-backend@1.1.0 pengguna
   > node --env-file=.env src/db/kelola-pengguna.ts hapus penguji@rumah.test

   penguji@rumah.test dihapus beserta semua sesinya
   ```

   `npm run pengguna -- daftar` kini hanya menyebut `admin@rumah.test` dan `viewer@rumah.test`. Sobek kartu sandinya.
4. **Mode laptop.** Kembalikan `backend/.env`:

   ```text
   HOST=127.0.0.1
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
   ```

   Backend memulai ulang sendiri dan kini hanya menulis `Server listening at http://127.0.0.1:8080`. Di terminal Vite: **Ctrl + C**, lalu `npm run dev`; baris `➜  Network: use --host to expose` muncul lagi. Muat ulang dashboard di HP penguji: halamannya tidak bisa dibuka lagi, sedangkan `http://localhost:5173` di laptop tetap **Live**.
5. **Simpan ke cabang.** Di terminal kosong, `cd ../frontend`, lalu:

   ```text
   git add package.json package-lock.json src
   git commit -m "Dashboard v1.0.0: lint bersih, build lolos, uji pengguna (Modul 24 Praktik 10)"
   ```

   `backend/.env` dan `dist/` tidak ikut Git; lembar catatan yang terisi disimpan di ➕ F.

> ⬆️ **Selesai Praktik 10?** Dashboard 1.0.0-mu lolos pemeriksaan, sudah dicoba orang lain (atau tercatat jujur "belum"), dan laptopmu kembali aman. Lanjut ke [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini); [🧩 Tantangan mandiri](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip dengan masalahmu. Masalah Vite, Tailwind, dan *login* dasar ada di [🚨 Modul 22](../modul-22-react-dasar/README.md#-kalau-tidak-jalan); soket, toko, dan mode HP dasar di [🚨 Modul 23](../modul-23-dashboard-realtime/README.md#-kalau-tidak-jalan); backend, broker, dan simulator di 🚨 Modul 16–21. Lirik dulu bilah alamat, terminal `backend` (sejak Praktik 6 kepalanya `…@1.1.0 dev`), terminal simulator (`-> ok=true` atau `-> ok=false`), tab **Console** (baris merah `Failed to load resource: … 403` atau `504` wajar untuk jawaban yang ditolak), dan tab **Network** (kode dan isi jawaban `command` atau `rules`). Masih buntu? Bandingkan berkasmu dengan [`kode/tahap/`](kode/tahap/) di akhir praktik yang sama (Praktik 6: [`kode/backend/`](kode/backend/)).

Dua tampilan terminal yang **bukan** galat:

- **Log backend berisi `≡ƒî▒ Tanah 25 % ΓÇö …`** padahal dashboard benar: konsol Windows memakai kode halaman lama. Hentikan backend, ketik `chcp 65001`, lalu `npm run dev` lagi. Dibuktikan penulis di Windows PowerShell 5.1; Windows Terminal dan terminal VS Code belum diuji.
- **`Change detected in '…\\node_modules\\…'` lalu `Restarting 'src/server.ts'`** tanpa kamu mengubah apa pun: pengawas berkas Windows salah lapor, dan backend menyala lagi sendiri. Tidak berbahaya.

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (react-router 8.5.0, react-hook-form 7.91.0, @hookform/resolvers 5.9.2, Zod 4.6.7)</b></summary>

| Petunjuk lama | Yang benar untuk versi kita | Kenapa |
| :--- | :--- | :--- |
| `npm install react-router-dom` | `react-router@8.5.0`, impor dari `"react-router"` | v8 menghapus `react-router-dom` |
| `<Switch>`, `<Route exact component={Detail}>` | `<Routes>`, `<Route path="/perangkat/:id" element={<HalamanDetail />} />` | Cara v5 |
| `useHistory()`, `<Redirect>` | `<Link>`/`<NavLink>`; `useNavigate()` sesudah aksi; `<Navigate replace>` di penjaga | Nama v5 |
| `createBrowserRouter`, `loader` | `<BrowserRouter>` (mode deklaratif) | Mode lain di 🔬 |
| `base: './'` | `base` bawaan `/` | F5 jadi putih |
| `ref={register}`, `register("x", { required: true })` | `{...register("nama")}`, aturan di skema Zod | *Resolver* tidak bisa digabung dengan pemeriksa bawaan |
| `@hookform/resolvers` tanpa versi | `@hookform/resolvers@5.9.2` | 6.0.0 → `ERESOLVE` |
| Zod 3: `z.string().email()`, `{ errorMap }` | Zod 4: `z.email()`, `{ error: pesanRamah }` | `errorMap` ditolak TypeScript |
| `z.coerce.number()` di skema | `{ valueAsNumber: true }` di `register` | Salinan skema harus identik |
| Impor `../../backend/src/schemas/aturan` | Salinan `src/skema/` + `npm run cek-skema` | node-cron → layar putih |
| Token/peran di `localStorage`, `peran !== "viewer"` | *Cookie* `HttpOnly`; `useAdmin()` dari `GET /auth/me` | XSS; tombol berkedip |
| `setInterval(() => fetch(…), 5000)` | Acara `kejadian`, `GET /devices` sekali sesudah pulih | *Polling* |
| DevTools **Network request blocking** | **Request conditions** | Berganti nama di DevTools 144 |

</details>

<details>
<summary><b><code>npm install</code> berhenti dengan <code>npm error code ERESOLVE</code> dan <code>peerOptional effect@"^4.0.0"</code></b></summary>

**Gejala** (rekaman penulis, perintah tanpa versi; potongan):

```text
npm error code ERESOLVE
…
npm error Could not resolve dependency:
npm error peerOptional effect@"^4.0.0" from @hookform/resolvers@6.0.0
```

**Sebab:** tanpa versi, npm mengambil `@hookform/resolvers` 6.0.0, yang syarat paketnya bentrok di npm 11 (*issue* `react-hook-form/resolvers#882`). **Langkah:** ulangi perintah [1.1](#11-cabang-fiturkendali-peran-dan-empat-paket-dengan-versi-tertulis-5-menit) persis, dengan `@hookform/resolvers@5.9.2`. Jangan pakai `--force` atau `--legacy-peer-deps` yang ditawarkan pesannya.

</details>

<details>
<summary><b>F5 di <code>/perangkat/…</code> memberi layar putih, atau server lain menjawab <code>404</code></b></summary>

**Putih sesudah F5** (biasanya di hasil *build*): `base` di `vite.config.ts` diubah ke `./`, jadi halaman meminta `/perangkat/assets/index-….js` dan mendapat `404`. Hapus `base`, lalu *build* ulang. **`404` dari server lain** (misalnya `dist/` dibuka server berkas biasa): ia mencari berkas bernama `perangkat/…`. `npm run dev` dan `npm run preview` menjawab setiap alamat layar dengan `index.html` (*SPA fallback*, Konsep 3); server sungguhan menyusul di Modul 26–27. **Putih juga di `npm run dev`?** Baca baris merah **Console**.

</details>

<details>
<summary><b>Menu Perangkat tidak ditandai aktif saat Detail atau Riwayat dibuka</b></summary>

Salah satu: (1) daftar di `/` dengan `<NavLink to="/">`, yang hanya aktif tepat di `/` (peta rute kita menaruh daftar di `/perangkat`); (2) `<NavLink to="/perangkat" end>`: hapus `end`; (3) menu memakai `<Link>`: ganti `<NavLink>` ([1.4](#14-link-dan-navlink-menu-tombol-kembali-dan-alamat-yang-tidak-dikenal-10-menit)). Menu yang aktif ber-`aria-current="page"` (tab **Elements**); di uji penulis, **Perangkat** memilikinya di Detail.

</details>

<details>
<summary><b>Sambungan <i>live</i> putus lalu tersambung lagi setiap kali pindah layar</b></summary>

**Gejala:** lencana sekilas `Menyambung ulang…`, dan log backend `klien realtime terputus` lalu `tersambung` setiap pindah layar. Uji penulis: 10 kali pindah layar, 0 sambungan baru. **Sebab:** (1) `useRealtime(…)` dipanggil di dalam halaman; panggil sekali di `App.tsx`, di atas `<Routes>` ([1.2](#12-browserrouter-di-maintsx-dan-peta-rute-di-apptsx-10-menit)). (2) Pindah lewat `<a href>` atau `location.href`: seluruh halaman dimuat ulang, sama dengan **F5**. Pakai `<Link>`/`<NavLink>`.

</details>

<details>
<summary><b><code>npm run build</code> gagal dengan galat tipe di <code>useForm</code> atau <code>zodResolver</code></b></summary>

Yang dicoba penulis (TypeScript 6.0.3): (1) `zodResolver(Aturan, { errorMap: … })` gaya Zod 3 ditolak; tulis `{ error: pesanRamah }` ([8.1](#81-bahan-formulir-pesanramah-dan-uraikangalat400-di-aturants-serta-pembantu-kolom-di-kolomtsx-10-menit)). (2) Nama kolom dari teks, `setError(g.kolom, …)`, tidak bisa diperiksa; tulis `g.kolom as FieldPath<Aturan>`, seperti di `simpan()`. (3) Nama kolom yang tidak ada di cabang mana pun tetap ditolak: periksa ejaannya (`kondisi.nyala_di_bawah`). Pastikan juga `npm ls @hookform/resolvers react-hook-form zod` menulis `5.9.2`, `7.91.0`, `4.6.7`.

</details>

<details>
<summary><b>Akun viewer sekilas melihat tombol admin, atau masih melihatnya sesudah perannya diganti</b></summary>

**Sekilas sesudah halaman dibuka:** syaratnya terbalik, misalnya `pengguna?.peran !== "viewer"`. Selama `GET /auth/me` belum dijawab (`"memuat"`), "bukan viewer" bernilai benar. Pakai `useAdmin()` ([3.1](#31-useadmin-dan-penjaga-kedua-khususadmin-10-menit)). **Sesudah peran diganti** (`npm run pengguna -- peran <email> viewer`): layar menanyakan peran sekali, saat dibuka; tekan **F5** atau masuk ulang. Satpam membaca peran dari gelang, jadi di sana peran baru berlaku paling lambat 15 menit kemudian; selama itu ketukan dari layar lama masih bisa diterima (Konsep 5).

</details>

<details>
<summary><b>Sesudah Keluar, tombol Back sekilas memperlihatkan layar lama</b></summary>

**Sekejap (uji penulis ±0,16–0,5 detik): wajar.** Halaman yang alamatnya dulu diketik bisa dipulihkan utuh dari *back/forward cache*; efek `pageshow` di `App.tsx` ([3.2](#32-keluar-yang-tuntas-kosongkansemua-dan-empat-langkah-berurutan-15-menit)) memuatnya ulang, lalu penjaga membawamu ke `/masuk`. **Lebih lama, atau tombolnya bisa diklik:** efek itu belum ada atau salah tulis (seharusnya `if (e.persisted) location.reload()`); tanpanya, halaman lama bertahan ±1,2 detik dan orang berikutnya bisa mendarat di layar orang sebelumnya. Di komputer bersama: **Keluar**, lalu tutup tab ([🔬](#-bedah-teknis-opsional)).

</details>

<details>
<summary><b>Setiap kejadian muncul sebagai dua <i>toast</i></b></summary>

Yang benar (uji penulis, juga dengan StrictMode): satu bingkai `kejadian` = satu *toast*. Sebabnya: (1) `socket.on("kejadian", …)` tanpa `socket.off("kejadian", onKejadian)` di *cleanup*, padahal StrictMode memasang efek dua kali ([4.2](#42-acara-kejadian-menjadi-toast-pendengar-bernama-dan-off-10-menit)); (2) pendengar kedua di sebuah halaman (cukup satu, di `useRealtime`); (3) dua kabar untuk satu simpan, `Aturan "…" disimpan.` dan `Aturan 4 (…) diubah lewat API: …`: `onKejadian` tidak melewati `aturan-diubah`.

</details>

<details>
<summary><b><i>Toast</i> menutupi tombol Lampu, Kipas, atau pompa di HP yang dimiringkan atau layar 320 px</b></summary>

**Gejala:** *toast* tampil tepat di atas Lampu/Kipas atau tombol pompa, dan ketukan berikutnya jatuh ke *toast*: perintah tidak terkirim. **Sebab:** di bawah 1280 px *toast* menempel di bawah layar, dengan ruang kosong setinggi dua *toast* ([4.1](#41-toastts-dan-wadahtoast-di-bawah-layar-hp-di-pojok-kanan-atas-laptop-lebar-15-menit)); di HP miring atau 320 px ruang itu kurang. Di 320 px, dua *toast* panjang (nama aturan ±39 huruf ke atas) bisa menutupi **Simpan aturan** sampai **Ya, hapus** walau halaman digulir habis. **Langkah:** tekan **✕** atau tunggu 4 detik; pegang HP tegak; pakai nama aturan pendek. Penguji Praktik 10 macet karenanya? Catat sebagai temuan. Bukti penulis dari emulasi DevTools, bukan HP sungguhan.

</details>

<details>
<summary><b>Jawaban <code>409</code>: <code>perintah lampu sebelumnya masih menunggu ack</code></b></summary>

**Gejala:** *toast* `Lampu: perintah lampu sebelumnya masih menunggu ack`, dan tombol kembali. Jawaban mentahnya (uji riset penulis, perintah kedua 300 ms sesudah yang pertama): `409 {"pesan":"perintah lampu sebelumnya masih menunggu ack"}`. **Sebab:** satu aktuator hanya boleh punya satu perintah yang belum dijawab (≤ 5 detik). Tombolmu mengabaikan ketukan selama menunggu (`if (!bisa) return;`, [5.2](#52-tombolsakelar-tampil-dulu-dengan-useoptimistic-dan-usetransition-25-menit)), jadi pemicunya dashboard kedua, HP, Bruno, aturan pada saat yang sama, atau Detail yang kamu tinggalkan lalu buka lagi sebelum perangkat menjawab (tombolnya dibuat baru tanpa tanda menunggu; perintah pertama tetap jalan). **Langkah:** tunggu jawaban pertama, lihat kartunya, baru ketuk lagi.

</details>

<details>
<summary><b>Jawabannya <code>200</code>, tetapi tombol kembali sendiri dan muncul <code>perangkat menolak</code></b></summary>

**Gejala** (rekaman penulis di [6.5](#65-simulator-tanah-dan-tandon-diketik-dari-terminal-5-menit), `tandon 15`): `command` dijawab `200`, *toast* merah `Pompa: perangkat menolak (pompa ditolak: air tandon kurang)`, log `pompa = 5, ack ok=false dalam 17 ms`. **Sebab:** `200` berarti perintah sampai dan perangkat menjawab, tetapi jawabannya "tidak" (`ack.ok: false`). Tombol mengikuti `ack.state` (Konsep 1): Lampu/Kipas mundur, pompa tetap `Diam`. Paling sering: tandon di bawah 20 % atau sensornya tidak terbaca (`pompa ditolak: air tandon tidak terbaca`). **Langkah:** simulator: `tandon acak` (atau 20 ke atas); perangkat: isi tandon, jangan pernah menyalakan pompa kering.

</details>

<details>
<summary><b><code>Lampu: belum dikonfirmasi perangkat…</code>, lalu lampu menyala sendiri beberapa saat kemudian</b></summary>

**Gejala** (rekaman penulis, Node 1 tiruan yang diam): ±5 detik sesudah ketukan, *toast* `Lampu: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.` dan tombol kembali `Mati`; 40,0 detik sesudah ketukan, lampu menyala sendiri dengan *toast* `lampu a4cf12e5b7c0 dilaporkan false, padahal diinginkan true (api); perintah dikirim lagi`. Log: `… -> 504 (5018 ms)`, lalu `WARN: cocokkan lampu … perintah dikirim lagi`. **Sebab: disengaja.** `504` = belum dikonfirmasi, bukan dibatalkan: backend mengingat keinginanmu dan mengirim ulang saat perangkat terdengar lagi, paling cepat 30 detik sesudah percobaan terakhir (Konsep 2). **Langkah:** biarkan. Ingin tetap mati? Tunggu lampunya menyala, baru ketuk; ketukan saat `Mati` mengirim `Nyala` lagi. Pompa tidak dikirim ulang (`Pompa: belum dikonfirmasi perangkat dan tidak dikirim ulang. …`).

</details>

<details>
<summary><b>Hapus aturan gagal: <code>404</code> di Bruno, <code>FST_ERR_CTP_EMPTY_JSON_BODY</code>, atau pesan CORS merah di tab Console</b></summary>

| Yang tampak | Sebab → langkah |
| :--- | :--- |
| Bruno: `404 {"pesan":"aturan 4 tidak ada"}` | `/rules/4` bukan id aturanmu (nomor tidak pernah dipakai ulang, jadi id-mu bisa 5): pakai `id` dari jawaban **buat aturan siram tanah**. `404` kedua sesudah berhasil memang benar. |
| `404` `Route DELETE:/rules/… not found` | Backend masih 1.0; kepala `npm run dev` harus `@1.1.0` ([6.4](#64--npm-run-cek-npm-test-dan-npm-audit-lalu-bruno-dan-docs-110-10-menit)). |
| `400` `FST_ERR_CTP_EMPTY_JSON_BODY` (`Body cannot be empty when content-type is set to 'application/json'`) | `DELETE` membawa `Content-Type: application/json` tanpa *body*: hapus kepala itu (`hapusAturan()` tanpa `headers`). |
| **Ya, hapus** → `Tidak bisa menghubungi server di …` + pesan CORS merah, padahal backend menyala | *Preflight* dijawab `GET, HEAD, POST, PUT` (backend 1.0, tanpa `DELETE`): salin `src/auth/keamanan.ts` 1.1, mulai ulang backend. |

</details>

<details>
<summary><b>Kipas tetap menyala sesudah aturannya dihapus atau dinonaktifkan</b></summary>

**Bukan galat**, sama dengan backend 1.0: aturan yang dihapus atau dinonaktifkan berhenti bertindak, tetapi aktuator yang sedang ia nyalakan dibiarkan, dan perangkat yang menyala ulang tidak menerima perintahnya lagi (uji penulis). Padamkan dengan tombol **Kipas**. Ambang `suhu_kipas_on` yang pernah dikirim ke Node 1 tidak dicabut; Node 1 memakainya hanya saat broker tak terjangkau (Modul 19 Konsep 10).

</details>

<details>
<summary><b>Aturan siram tidak menyiram lagi sesudah sekali ditolak atau tidak dijawab perangkat</b></summary>

**Gejala:** sekali *toast* merah `⚠️ Tanah 25 % — perintah pompa ditolak perangkat: pompa ditolak: air tandon kurang` (atau `… pompa TIDAK menjawab perintah (tidak dikirim ulang)`), lalu 🌱 tak pernah datang walau tandon sudah diisi. **Sebab: disengaja.** Aturan yang perintahnya ditolak atau tidak dijawab tidak mencoba lagi sampai tanah naik di atas batas atasnya (misalnya 35 %) atau aturannya disimpan ulang; tanpa itu ⚠️ berulang tiap beberapa detik (Konsep 9). **Langkah:** isi tandon (`tandon acak`), lalu picu ulang: `tanah 40`, tunggu ✅, lalu `tanah 25`, atau **Ubah** → **Simpan aturan** walau tanpa perubahan. 🌱 datang ±15 detik kemudian. Tanpa ⚠️ sama sekali? Cek: aturan `Aktif`, perangkat yang diukur = yang tanahnya kamu ubah, backend `1.1.0`.

</details>

<details>
<summary><b>Node 1 menyiram dua kali: sekali dari server, sekali dari pengaman lokalnya</b></summary>

**Gejala (jalur perangkat):** sekali kering, pompa menyala dari aturan server (🌱) dan dari Node 1 sendiri (3 detik, diulang tiap 30 detik selama kering). Simulator tidak punya siram lokal. **Sebab:** ambang lokal Node 1 (bawaan 30 %) sama dengan ambang server: dua otak, satu pompa (Modul 19). **Langkah:** di Serial Monitor Node 1, ketik `ambang`, lalu `ambang 20` ([6.5](#65-simulator-tanah-dan-tandon-diketik-dari-terminal-5-menit)); ambang server tetap di atasnya. Dibaca dari firmware v1.6.0, belum diuji penulis di papan sungguhan.

</details>

<details>
<summary><b>Layar putih dengan <code>fileURLToPath is not a function</code> di tab Console</b></summary>

**Gejala:** layar putih; **Console** di `npm run dev`: `Cannot access "url.fileURLToPath" in client code.`, lalu `Uncaught TypeError: (0 , import_browser_external_url.fileURLToPath) is not a function` (di hasil *build*, nama di depan `.fileURLToPath` berganti). `npm run build` tetap lolos dengan peringatan `Module "path" has been externalized for browser compatibility`. **Sebab:** sebuah berkas mengimpor `../../backend/src/schemas/aturan`, yang menyeret node-cron ke browser (Konsep 8). **Langkah:** impor dari salinan, `from "../skema/aturan-dasar"` ([7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit)); cari sisanya dengan **Ctrl + Shift + F**, kata kunci `backend/src`.

</details>

<details>
<summary><b><code>npm run cek-skema</code> menulis <code>BEDA</code></b></summary>

**Gejala** (rekaman penulis, satu angka diubah di salinan; kode keluar `1`; potongan):

```text
BEDA  src/skema/aturan-dasar.ts, mulai baris 71:
  backend :   nama: z.string().min(1).max(60),
  frontend:   nama: z.string().min(1).max(80),
Salin ulang berkasnya dari ../backend/src/schemas/ (jangan diubah di frontend), lalu jalankan lagi.
```

1. **Salinan diubah atau basi:** salin ulang dari `backend/src/schemas/`-mu seperti 7.1.
2. **Baris 1 tampak sama, dengan `(beda tak terlihat: … BOM …)`:** berkas tersimpan dengan BOM, misalnya lewat `Set-Content -Encoding utf8` di PowerShell 5.1. Di VS Code, klik `UTF-8 with BOM` di bilah status → **Save with Encoding** → **UTF-8**.
3. **`(beda di akhir berkas: …)`:** salin ulang berkasnya utuh.
4. **`Tidak bisa membaca ../backend/…`:** jalankan dari folder `frontend`, dengan folder `backend` di sebelahnya.

Akhir baris CRLF **tidak** membuat `BEDA`, berbeda dengan `git diff --no-index` yang salah lapor di sana (Konsep 8).

</details>

<details>
<summary><b><code>npm run lint</code> memperingatkan <code>only-export-components</code></b></summary>

**Gejala:** bukan `Found 0 warnings and 0 errors.`, melainkan peringatan `only-export-components`: `Fast refresh only works when a file only exports components…` (uji riset penulis). **Sebab:** berkas komponen `.tsx` juga mengekspor fungsi, misalnya `export function pesanGagal` di `TombolSakelar.tsx`; *fast refresh* hanya bisa memperbarui berkas yang isinya komponen saja (konstanta sederhana diizinkan). **Langkah:** jangan ekspor fungsinya, atau pindahkan ke berkas `.ts` seperti `aturan.ts`. *Lint* harus bersih di [10.1](#101-dashboard-100-lint-build-cek-skema-dan-nomor-versi-15-menit).

</details>

<details>
<summary><b><code>Ditolak server: kondisi.jenis: Input tidak valid</code> saat menyimpan aturan siram</b></summary>

**Gejala:** **Simpan aturan** dengan pilihan **Saat angka TURUN di bawah batas** memunculkan tulisan merah itu di atas tombol (uji penulis lawan backend 1.0: `400 "body/kondisi/jenis Input tidak valid"`). **Sebab:** backend yang menyala masih 1.0. **Langkah:** di terminal `backend`, **Ctrl + C**, lalu `npm run dev`; kepalanya harus `…@1.1.0 dev` dan `/docs` menulis `1.1.0` ([6.4](#64--npm-run-cek-npm-test-dan-npm-audit-lalu-bruno-dan-docs-110-10-menit)), lalu simpan lagi. Sebaliknya, backend 1.0 menyembunyikan aturan bentuk baru tanpa pesan (log `WARN: aturan 5 dilewati: kondisi.jenis: Input tidak valid`); jangan menyimpan aturan lewat 1.0.

</details>

<details>
<summary><b><code>Kunci tidak dikenali</code> saat menyimpan aturan</b></summary>

**Gejala:** `400` dengan `Kunci tidak dikenali`, misalnya `body/ Kunci tidak dikenali : "ekstra"` (uji riset penulis), biasanya di Bruno. **Sebab:** skema memakai `strictObject`, jadi kunci milik pilihan lain ditolak, misalnya `nyala_di_atas` milik kondisi naik di kondisi `ambang-bawah`. **Langkah:** di Bruno, contoh utuhnya ada di **buat aturan siram tanah**. Di kode formulir, ganti seluruh objek sekaligus (`setValue("kondisi", kondisiBawaan(…))` di `gantiKapan()`, [8.3](#83-formaturan-di-aturanbaru-useform-dengan-zodresolver-pratinjau-kalimat-dan-tombol-simpan-20-menit)), bukan hanya `kondisi.jenis`. Di formulir kita, salinan skema menolaknya lebih dulu, jadi `POST /rules` tidak terkirim.

</details>

<details>
<summary><b>Angka di formulir terbaca lain: <code>1.000</code> menjadi 1, atau <code>2,5</code> ditolak di kolom detik</b></summary>

- **`1.000` dibaca 1** (titik = tanda desimal; pratinjau menulis "di atas 1"): tulis `1000`. Label kolom cahaya mengingatkan `0-4095, tanpa titik ribuan`.
- **`2,5` dibaca dua setengah:** diterima di kolom batas, ditolak di **Harus bertahan selama** dengan `Isi dengan bilangan bulat (tanpa koma)`.
- **Kolom kosong** → `Isi dengan angka`. Muncul `Input tidak valid: diharapkan number, diterima NaN`? `{ error: pesanRamah }` belum terpasang ([8.1](#81-bahan-formulir-pesanramah-dan-uraikangalat400-di-aturants-serta-pembantu-kolom-di-kolomtsx-10-menit)).

Diuji di Edge (Chromium); Firefox, Safari, dan papan ketik HP belum.

</details>

<details>
<summary><b><code>403 permintaan dari halaman http://192.168.1.10:5173 ditolak</code> saat admin menekan tombol dari HP</b></summary>

**Sebab:** asal halaman HP, `http://<IP-laptop>:5173`, tidak **persis** ada di `CORS_ORIGIN`. Satpam menolak `POST`, `PUT`, dan `DELETE` dari asal yang tidak terdaftar. Teks `403` utuhnya terbaca di log backend (`WARN: ditolak (403): … dari halaman …`) dan di `curl` dengan kepala `Origin` ([9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit)). Di browser HP, penolakan biasanya lebih awal (*preflight* tanpa izin asal), sehingga dashboard menulis `Lampu: server tidak menjawab.` atau `Tidak bisa menghubungi server di …`. **Langkah:** satu asal di `CORS_ORIGIN` harus sama huruf demi huruf dengan bilah alamat HP: `http://`, IP adaptor `Wi-Fi` dari `ipconfig` (IP-mu berbeda), `:5173`, tanpa `/` di ujung. Simpan `.env` (backend memulai ulang sendiri), tunggu `Server listening at http://<IP-laptop>:8080`, lalu **F5** di HP.

</details>

<details>
<summary><b>Pintasan di layar utama HP tidak membuka dashboard lagi</b></summary>

Belum diuji penulis di HP sungguhan. Sebab yang mungkin: mode laptop sudah dikembalikan ([10.5](#105-akun-viewer-di-hp-yang-sama-lalu-hapus-akun-penguji-dan-kembalikan-mode-laptop-10-menit)), jadi nyalakan lagi mode HP ([9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit)); IP laptop berubah, jadi perbarui `CORS_ORIGIN`, hapus pintasan lama, lalu buat lagi; laptop tidur atau HP di WiFi lain. Di iPhone (iOS 26) pintasan terbuka sebagai *web app* tersendiri, jadi mungkin kamu harus masuk lagi. Aplikasi terpasang sungguhan butuh HTTPS (Modul 27).

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: "mengapa" yang lebih dalam, pilihan lain di dunia kerja, dan batasan v1.0 yang jujur. Tidak ada yang perlu dipasang: Next.js, sonner, dan react-hot-toast hanya dibandingkan. Potongan kodenya **cukup dibaca**, atau dicoba di cabang yang tidak di-*merge*.

<details>
<summary><b>Next.js 16: kapan butuh <i>framework</i>, dan kenapa dashboard kita tetap Vite + React Router</b></summary>

Ini lanjutan lipatan "Next.js dan sejenisnya" di [🔬 Modul 22](../modul-22-react-dasar/README.md#-bedah-teknis-opsional). Per 25 Oktober 2026, versi terbarunya `next` **16.4.3**; seri 16 diumumkan 21 Oktober 2025. Menurut [blog resminya](https://nextjs.org/blog/next-16), Turbopack menjadi *bundler* bawaan proyek baru, `middleware.ts` diganti `proxy.ts`, *cache* lewat Cache Components bersifat pilihan (tanpa itu, kode dinamis dijalankan setiap permintaan), dan syaratnya Node 20.9 ke atas.

Seandainya dashboard kita ditulis ulang dengan App Router Next.js, peta rute di `App.tsx` pindah ke **susunan folder** (cukup dibaca):

```text
app/
├── layout.tsx                       ← bingkai, seperti TataLetak
├── masuk/page.tsx                   ← /masuk
├── perangkat/page.tsx               ← /perangkat
├── perangkat/[id]/page.tsx          ← /perangkat/:id
├── perangkat/[id]/riwayat/page.tsx  ← /perangkat/:id/riwayat
└── aturan/…                         ← /aturan, /aturan/baru, /aturan/:id
proxy.ts                             ← berjalan di server sebelum halaman
```

Secara bawaan, setiap komponen di sana adalah **komponen server** (*React Server Components*): dijalankan di server, dan JavaScript-nya tidak dikirim ke browser. HTML dibuat per permintaan (**SSR**) atau sekali saat *build* (**SSG**). Komponen yang memakai `useState`, soket, atau Zustand harus ditandai `"use client"`.

| Next.js menolong untuk… | Dashboard kita |
| :-- | :-- |
| situs publik yang harus muncul di Google | semua layar di balik *login* |
| tampilan pertama yang cepat bagi pengunjung baru | sedikit pengguna, di WiFi rumah |
| API (*Route Handlers*) dan tampilan dalam satu proyek Node | API, *login*, dan Socket.IO sudah diurus Fastify (Modul 16–21) |
| HTML berisi data sejak dari server | angka *live* datang lewat soket dan tetap digambar di browser |

Alasan praktisnya: `dist/` Vite cukup berupa berkas statis untuk server web di Modul 26–27, sedangkan SSR butuh proses Node kedua yang harus dijaga. Next.js memang bisa diekspor statis (`output: 'export'`), tetapi fitur servernya lalu tidak berlaku, jadi hasilnya kembali mirip Vite. Situs react.dev menyarankan *framework* untuk aplikasi **baru**, dan menyebut membangun sendiri dengan Vite sah untuk mempelajari dasar React. Tabel di atas **penilaian penulis** untuk proyek ini, bukan vonis mana yang lebih baik.

</details>

<details>
<summary><b>Tiga mode React Router 8 (deklaratif, data, <i>framework</i>) dan beda v7 dengan v8</b></summary>

[Dokumen React Router](https://reactrouter.com/start/modes) kini memakai tiga nama mode, dan fiturnya bertumpuk:

| Mode | Dipasang dengan | Fiturnya |
| :-- | :-- | :-- |
| **Deklaratif** (modul ini) | `<BrowserRouter>` | `<Routes>`, `NavLink`, `useParams`, `useNavigate` |
| **Data** | `createBrowserRouter` + `<RouterProvider>` | + *loader* (ambil data sebelum layar tampil), *action* (kirim formulir), `useFetcher` |
| ***Framework*** (penerus Remix) | *plugin* Vite | + SSR/SSG, satu berkas per rute; sekelas Next.js |

"Mode library" di Silabus lama berasal dari pengumuman v7 (2024) dan berarti "tanpa *framework*". Kita memilih deklaratif karena *login*, *refresh* sekali, toko, dan soket sudah hidup **di luar** router sejak Modul 22–23; mode data mengajak `GET /devices` pindah ke *loader* tiap rute, dan setiap layar ditulis ulang. Saat react.dev menyebut React Router bisa dipasangkan dengan Vite menjadi *framework*, yang dimaksud mode ketiga.

**v7 lawan v8.** v8 stabil sejak 17 Juni 2026 dan rilis mayor kini setahun sekali; v7 masih mendapat perbaikan keamanan. Untuk mode deklaratif, panduan naik versi hanya memuat syarat minimum (Node 22.22, React 19.2.7; "Vite 7+" khusus mode *framework*) dan dihapusnya `react-router-dom`. Impor dari `"react-router"` sudah berlaku di v7, jadi kode modul ini sama persis seandainya memakai 7.18.4.

**Temuan lab.** Sebelum 5.2, `<BrowserRouter>` membungkus pindah alamat dengan `React.startTransition`, padahal toko Zustand berubah seketika. Ketika **Keluar** masih memanggil `navigate("/masuk")`, `JagaMasuk` dulu melihat `pengguna === null` di alamat LAMA dan menitipkannya sebagai `dari`, sehingga orang berikutnya mendarat di layar orang sebelumnya. Itulah asal `keluarSengaja` ([Konsep 6](#6-keluar-yang-tuntas-putus-soket-hapus-sesi-kosongkan-toko)).

</details>

<details>
<summary><b>Optimis tanpa <code>useOptimistic</code>, dan formulir tanpa react-hook-form lewat <code>useActionState</code></b></summary>

Sebelum React 19, tombol optimis ditulis dengan *state* biasa, persis Pemanasan Langkah 3 (simpan, ubah, kembalikan). Sketsa untuk `TombolSakelar` (belum dijalankan penulis):

```tsx
const [harapan, setHarapan] = useState<boolean | null>(null); // null = tidak menunggu
const tampil = harapan ?? nilai;
async function ketuk() {
  setHarapan(!nilai);
  try { /* kirimPerintah, terapkanKeadaan, toast */ }
  finally { setHarapan(null); } // lupa baris ini = tombol macet
}
```

*Rollback*-nya bergantung pada `finally` yang kamu ingat sendiri, begitu pula penolak ketukan ganda. `useOptimistic` membuang tampilan optimis begitu Action selesai (berhasil/gagal); `useTransition` memberi tanda menunggu. Syaratnya, `setTampil` dipanggil di dalam Action; kalau tidak, React memperingatkan `An optimistic state update occurred outside a Transition or Action.`

React 19 juga punya `<form action={fungsi}>` dan `useActionState` (hasil kiriman terakhir + tanda menunggu, tanpa pustaka). Pemeriksaannya baru terjadi saat dikirim: kamu sendiri yang mengubah `FormData` (semuanya teks) menjadi objek bersarang berisi angka sebelum `Aturan.safeParse`. Formulir aturan kita butuh pesan per kolom sejak kolom ditinggalkan (`mode: "onTouched"`), kolom yang bercabang mengikuti `kondisi.jenis`, dan `valueAsNumber`; semuanya sudah diurus react-hook-form + `zodResolver`. Sebaliknya, `handleSubmit` bukan Action, jadi optimis di formulir react-hook-form harus dibungkus `startTransition` sendiri; untuk aturan, `isSubmitting` dan *toast* sudah cukup.

</details>

<details>
<summary><b>Satu sumber skema tanpa menyalin: impor lintas folder, <code>resolve.dedupe</code>, dan <i>workspaces</i></b></summary>

Tiga jalan "satu sumber" yang dicoba atau dibaca penulis saat riset:

1. **Impor lintas folder** (`../../backend/src/schemas/…`). Dengan `aturan.ts` v1.0 hasilnya layar putih (`node-cron` ikut terbundel); itu sebabnya backend 1.1 memisahkan `aturan-dasar.ts`. Berkas murni Zod pun (diuji dengan `kontrak.ts`) membawa dua jebakan: `zod`-nya dicari di `backend/node_modules`, jadi bundel memuat dua salinan Zod (≈ 20–25 kB gzip lebih besar) sampai `vite.config.ts` diberi `resolve: { dedupe: ['zod'] }`; dan tanpa `backend/node_modules`, `tsc -b` gagal `TS2307: Cannot find module 'zod'`, sehingga `npm run build` frontend bergantung pada `npm install` di backend.
2. **Paket lokal** `"file:../skema"`: gagal dengan `TS2307` yang sama, karena folder itu tidak punya `node_modules`.
3. **npm *workspaces***: `package.json` di akar dengan `"workspaces"` dan satu `package-lock.json` untuk semua folder. Rapi untuk tim, tetapi cara pasang sejak Modul 16 (`cd backend && npm install`) ikut berubah. Tidak diuji penulis.

Untuk pemula, salinan yang **diperiksa mesin** ([7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit)) lebih murah daripada satu sumber yang butuh tiga setelan, dan frontend tetap bisa di-*build* sendirian. Backend tetap penjaga terakhir.

</details>

<details>
<summary><b>Sesudah <code>504</code>: keinginan dan laporan perangkat di <code>GET /devices/:id/state</code></b></summary>

Sejak [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#4-keadaan-yang-diinginkan-lawan-yang-dilaporkan), server mencatat **keinginan** (*desired*) lampu, kipas, dan tirai sebelum mengirim perintah, dan `504` tidak menghapusnya. Setiap telemetry tiba, keinginan dibandingkan dengan **laporan** perangkat (*reported*); kalau beda dan percobaan terakhir sudah lewat 30 detik, perintahnya dikirim lagi tanpa ada yang mengetuk. Log backend menulis `WARN: cocokkan …`, dan kejadian berjenis `perintah` muncul sebagai *toast* ([4.2](#42-acara-kejadian-menjadi-toast-pendengar-bernama-dan-off-10-menit)). Pompa tidak dicatat, dan `ack.ok: false` menghapus keinginan, jadi penolakan perangkat tidak diulang.

Kedua catatan itu bisa dibaca siapa pun yang sudah masuk, termasuk viewer, lewat `GET /devices/:id/state` (Bruno: **keadaan aktuator Node 1**), misalnya sesudah `504` saat perangkat tidak menjawab.

**Hasilnya (contoh dari riset penulis, backend v1.0 dengan rute yang sama; dipotong):**

```text
{"desired":{"lampu":true},"reported":{…"lampu":false…},"selisih":["lampu"]}
```

Dashboard bisa memintanya **sekali** sesudah `504` lalu menulis "diminta Nyala, belum dikonfirmasi" sampai `telemetry.state` cocok; dipicu peristiwa, bukan *polling*. v1.0 belum memasangnya: *toast* `504` dan *toast* kejadian `perintah` sudah menyampaikan intinya.

</details>

<details>
<summary><b>Pustaka <i>toast</i> siap pakai: sonner dan react-hot-toast</b></summary>

Riset penulis (25 Oktober 2026, ketiganya diukur di satu aplikasi uji kecil):

| | buatan sendiri | react-hot-toast 2.6.1 | sonner 2.0.8 |
| :-- | :-- | :-- | :-- |
| Tambahan bundel (gzip) | ±0,6–0,7 kB | ±4,7 kB (termasuk `goober`) | ±9,2 kB |
| Pembaca layar | wadah `role="status"` | `role="status"` per *toast* | wadah `aria-live="polite"` |
| Bawaan yang perlu diperhatikan | — | lama tampil 2 s (berhasil) / 4 s (galat) | tema terang (pakai `theme="system"`), kanan bawah, tanpa tombol tutup |

Keduanya layak di proyek lain. Di sini, buatan sendiri lebih mendidik: kamu melihat wadah `aria-live` yang harus ada sebelum isinya berubah, warnanya ikut Tailwind dan mode gelap, aturan "paling banyak 2, di bawah layar HP" ([Konsep 10](#10-kabar-di-layar-toast-aria-live-dan-tempatnya-di-hp)) cukup beberapa baris, dan tidak butuh paket baru.

</details>

<details>
<summary><b><code>React.lazy</code> per rute: memecah bundel yang memuat Recharts</b></summary>

[🔬 Modul 23](../modul-23-dashboard-realtime/README.md#-bedah-teknis-opsional) sudah membuktikan `React.lazy` menghilangkan peringatan 500 kB. Bundel v1.0 makin besar: ±890 kB (gzip ±266 kB, [10.1](#101-dashboard-100-lint-build-cek-skema-dan-nomor-versi-15-menit)), dari ±685 kB di v0.2, padahal Masuk, Daftar, dan Aturan tidak memakai grafik. Dengan router, titik potongnya jelas: satu rute, satu potongan. Sketsa (belum diukur penulis):

```tsx
// App.tsx (begitu pula Riwayat):
const HalamanDetail = lazy(() => import("./halaman/Detail"));
// TataLetak.tsx, di tempat <Outlet />:
<Suspense fallback={<p>Memuat layar…</p>}><Outlet /></Suspense>
```

`Suspense` mengelilingi `<Outlet />`, bukan `<Routes>`, supaya kepala, menu, **Keluar**, dan *toast* tetap tampil saat Detail pertama kali diunduh. Harganya sama dengan Modul 23 (Detail pertama kali menunggu unduhan, satu konsep lagi), jadi v1.0 tetap satu berkas dengan satu peringatan.

</details>

<details>
<summary><b><i>Back/forward cache</i> dan acara <code>pageshow</code> sesudah Keluar</b></summary>

Browser menyimpan halaman yang ditinggalkan **utuh di memori** supaya Back terasa instan. Di dalam dashboard, Back biasanya hanya mengganti alamat: penjaga membaca toko kosong lalu ke `/masuk` (lab: 35 ms). Namun, alamat yang dulu **diketik di bilah alamat** adalah dokumen tersendiri, dan sesudah **Keluar**, Back memulihkannya dari *cache* itu. Lab penulis sebelum perbaikan: kepala `Admin Rumah (admin)` dan tombol **+ Aturan baru** tampil lagi ±1,2 detik sampai `POST /auth/refresh` dijawab `401` (bila backend mati, bisa terus tampil), dan orang berikutnya mendarat di layar orang sebelumnya.

Obatnya efek `pageshow` di `App.tsx` ([3.2](#32-keluar-yang-tuntas-kosongkansemua-dan-empat-langkah-berurutan-15-menit)): `e.persisted` bernilai `true` bila halaman dipulihkan dari *cache*, lalu `location.reload()` membuat `App` bertanya lagi "siapa saya?". Sesudahnya halaman lama hanya **berkedip** 0,16–0,5 detik sebelum `/masuk` tampil, dan orang berikutnya yang menekan Back lalu masuk tetap tiba di alamat lama (lab: `/aturan`), tanpa data lama: batasan jujur. Mengosongkan layar saat `pagehide` atau `Cache-Control: no-store` dari server lebih rumit atau di luar kode modul ini.

</details>

<details>
<summary><b>Pintasan layar utama dan aplikasi terpasang: <i>manifest</i>, <i>service worker</i>, dan konteks aman</b></summary>

Langkah [9.3](#93-mode-hp-untuk-akun-admin-dan-pintasan-di-layar-utama-15-menit) hanya membuat **pintasan** ke `http://<IP-laptop>:5173` (Chrome Android: ⋮ → **Install and create shortcut** → **Create shortcut**). Sejak iOS 26, Safari membuka situs di Layar Utama sebagai *web app* tanpa bilah alamat. Untuk `http://` di LAN, keduanya **belum diuji penulis** di HP sungguhan, termasuk apakah *login* terbawa.

**Aplikasi terpasang** (PWA) butuh *manifest* (nama, ikon 192 dan 512 px, alamat awal), HTTPS agar Chrome menawarkan **Install**, dan *service worker* (skrip latar untuk luring dan notifikasi *push*), yang hanya jalan di **konteks aman**: HTTPS atau `localhost`.

**Hasilnya (rekaman penulis dari laptop sendiri lewat IP LAN; IP-mu akan berbeda):**

```text
isSecureContext di http://192.168.1.10:5173 = false; crypto.randomUUID ada = false; serviceWorker ada = false
```

Di laptop, `localhost` tergolong aman; alamat IP yang dibuka HP tidak. Jadi PWA sungguhan menunggu HTTPS di Modul 27.

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** sama dengan Praktik 10 sesudah mode laptop dikembalikan: **VS Code** (terminal `backend`, terminal Vite dengan `npm run dev`, dan terminal kosong di folder `frontend`; jalur laptop ditambah broker dan simulator), **Docker Desktop**, serta **Chrome atau Edge** di `http://localhost:5173` dengan DevTools.

Ketiga tantangan hanya mengubah folder `frontend`. Kerjakan **sesudah** [➕ E](#e--gabungkan-fiturkendali-peran-ke-main-lewat-pull-request-dashboard-v10-kendali--peran--backend-11), masing-masing di cabang baru dari `main` (`git switch main`, `git pull`, lalu `git switch -c fitur/<nama-tantangan>`). Sebelum menyimpan, `npm run lint` harus bersih dan `npm run build` lolos dengan satu peringatan 500 kB ([10.1](#101-dashboard-100-lint-build-cek-skema-dan-nomor-versi-15-menit)).

Ketiganya berkunci di [`kode/tantangan/kunci/`](kode/tantangan/kunci/): hanya berkas yang berubah atau baru, di atas [`kode/frontend/`](kode/frontend/) 1.0.0. Ketiga kunci lolos *lint* dan *build* di laptop penulis, tetapi belum dicoba di browser. Karena itu, tidak ada kotak **Hasilnya** di sini, hanya syarat **Lulus kalau**.

### Tingkat 1 — Tombol tirai 0–180° (ubah sedikit, 20 menit)

Tirai masih berupa kartu saja, padahal backend sudah menerima `{"target":"tirai","nilai":120}`. "Putar ke 120°" aman diulang, jadi tirai boleh optimis seperti lampu ([Konsep 2](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis)).

1. Salin `src/components/TombolSakelar.tsx` ([5.2](#52-tombolsakelar-tampil-dulu-dengan-useoptimistic-dan-usetransition-25-menit)) menjadi **`TombolTirai.tsx`**, lalu ubah `nilai` menjadi angka dan perintahnya menjadi `{ target: "tirai", nilai: sudut }`.
2. Tambahkan penggeser `<input type="range" min={0} max={180} step={10} />` yang hanya **memilih** sudut, dan tombol **Atur ke N°** yang **mengirim**. Penggeser yang langsung mengirim membuat satu geseran menjadi belasan perintah, dan yang datang selagi perintah sebelumnya menunggu *ack* ditolak `409`.
3. Di `DetailPerangkat.tsx`, pasang `<TombolTirai deviceId={id} nilai={keadaan.tirai} alasanMati={alasan} />` di bagian **Kendali**, lalu jadikan kartu **Tirai** khusus viewer, seperti Lampu, Kipas, dan Pompa.

**Lulus kalau:** sebagai admin, **Atur ke 120°** langsung menulis `Sekarang 120°` dan `Menunggu konfirmasi perangkat…`, yang hilang saat *ack* tiba; viewer hanya melihat kartu **Tirai**; kalimat `504` di kodemu berbunyi "belum dikonfirmasi", bukan "dibatalkan".

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Berkas utuhnya: [`TombolTirai.tsx`](kode/tantangan/kunci/tingkat-1/frontend/src/components/TombolTirai.tsx) (baru) dan [`DetailPerangkat.tsx`](kode/tantangan/kunci/tingkat-1/frontend/src/components/DetailPerangkat.tsx).

Ada dua *state*: `useOptimistic(nilai)` = sudut yang **tampil**, `useState(nilai)` = sudut yang **dipilih** dan belum dikirim. Kalimat `504` sama dengan lampu karena backend juga mengingat keinginan tirai dan mengirimnya lagi saat perangkat terdengar.

</details>

### Tingkat 2 — Rentang riwayat di alamat: `?rentang=7hari` (isi bagian rumpang, 45 menit)

Pilih **24 jam** di Riwayat, lalu tekan **F5**: rentangnya kembali ke 7 hari karena pilihan itu hanya ada di *state*. Simpan di alamat (`…/riwayat?rentang=24jam`) dengan `useSearchParams` (`useState` untuk bagian `?…` di alamat). Di `src/components/Riwayat.tsx`, isi setiap `____`:

```tsx
import { Link, ____ } from "react-router";

function bacaRentang(teks: string | null): Rentang {
  return teks === "1jam" || teks === "24jam" || teks === "7hari" ? ____ : "____";
}
// di Riwayat(), pengganti baris useState<Rentang>("7hari"):
const [cari, setCari] = ____();
const rentang = bacaRentang(cari.____("rentang"));
// di pilihRentang(r), pengganti setRentang(r):
setCari({ rentang: ____ }, { ____: true });
```

**Lulus kalau:** alamat ikut berganti; **F5** dan tautan di tab baru membuka rentang yang sama; **Back** kembali ke Detail; `?rentang=ngawur` = 7 hari.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Isiannya: `useSearchParams`, `teks`, `7hari`, `useSearchParams`, `get`, `r`, `replace`. Berkas utuhnya: [`Riwayat.tsx`](kode/tantangan/kunci/tingkat-2/frontend/src/components/Riwayat.tsx). `replace` mengganti entri riwayat browser, bukan menambah, jadi **Back** langsung kembali ke Detail. `bacaRentang` ada karena alamat bisa diketik siapa saja.

</details>

### Tingkat 3 — Pembuat jadwal ramah awam: jam dan hari menjadi cron (buat dari nol, 60–90 menit)

Orang awam tidak tahu bahwa `30 17 * * 1,3` berarti Senin dan Rabu pukul 17.30. Buat `src/components/PembuatJadwal.tsx`: kotak jam `<input type="time">` (WIB), tujuh kotak centang hari (**Senin dulu**), kalimat jadwal, dan tombol **Pakai jadwal ini**. Pasang di `BagianKapan.tsx`, di bawah kolom cron.

- Nomor hari cron: 0 = Minggu, 1 = Senin, …, 6 = Sabtu. Tanpa centang = `*`.
- Kalimatnya: perluas `uraikanCron` di `aturan.ts` lalu ekspor.
- Periksa dengan skema yang sama ([Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend)): `KondisiJadwal.safeParse({ jenis: "jadwal", cron })`.
- Tulis ke formulir seperti tombol contoh jadwal: `setValue("kondisi.cron", cron, { shouldValidate: true, shouldDirty: true })`.

**Lulus kalau:** Senin + Rabu pukul 17.30 → `30 17 * * 1,3` dan `Setiap Senin, Rabu pukul 17.30 WIB`; Sabtu + Minggu → `… * * 0,6` dan `Setiap Sabtu, Minggu …`; **Pakai jadwal ini** mengisi kolom cron.

<details>
<summary><b>Kunci Tingkat 3</b></summary>

Berkas utuhnya: [`PembuatJadwal.tsx`](kode/tantangan/kunci/tingkat-3/frontend/src/components/PembuatJadwal.tsx) (baru), [`aturan.ts`](kode/tantangan/kunci/tingkat-3/frontend/src/aturan.ts) (`buatCron`, `uraikanCron` diekspor), dan [`BagianKapan.tsx`](kode/tantangan/kunci/tingkat-3/frontend/src/components/BagianKapan.tsx). Hari diurutkan Senin dulu dengan `(h + 6) % 7`; kalimatnya sudah dicoba penulis di Node.

</details>

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini mulai **memerintah**: dashboard 1.0.0 dengan kendali dan peran, backend 1.1.0, dan simulator yang mengenal `tanah` dan `tandon`; firmware, broker, dan kontrak data 1.4 tetap. Semuanya sudah di-*commit* di `fitur/kendali-peran` (belum di GitHub): A mencocokkannya, B–D merapikan dokumen, E menggabungkannya ke `main`, dan F menyimpan catatanmu.

![Diagram Rumah Pintar Mini setelah Modul 24: dashboard v1.0 dengan kendali, aturan, peran, dan rute, di laptop dan di HP lewat WiFi rumah; garis putus-putus = menyusul. Atas, tidak berubah: Node 2 Kebun v1.0.0 lewat Node 1 (ESP-NOW); Node 1 Rumah v1.6.0, firmware tetap, jalur perangkat memakai Serial ambang 20, kini dikendalikan dashboard; gateway Pi dengan Mosquitto berkunci dan Node-RED; HP dan Telegram. Kiri: klien broker (MQTTX, pemeriksa kontrak, simulator + tanah 25 dan tandon 15); HP di WiFi rumah, mode HP, http://192.168.1.10:5173, penguji lalu viewer, akun penguji dihapus sesudah uji. Kotak jujur, dashboard v1.0 masih: hanya WiFi rumah dengan http:// polos (HTTPS di Modul 27); pintasan layar utama hanya bookmark (PWA di Modul 27); hanya ack dan daftar aturan yang diperiksa Zod; peran baru paling lambat 15 menit; uji orang lain sejujur lembar catatan. Laptop: backend v1.1.0, berubah di Praktik 6: aturan turun di bawah (ambang-bawah) + perintah SEKALI, DELETE /rules/:id dan CORS DELETE, schemas/aturan-dasar.ts tanpa node-cron disalin ke frontend, tanpa migrasi, kontrak data 1.4. Rute yang dipakai: auth login, refresh, logout, me, GET /devices, readings, dan yang baru (ungu) POST /devices/:id/command, GET dan POST /rules, PUT dan DELETE /rules/:id; Socket.IO telemetry, status, + kejadian untuk toast. Database rumahpintar-db tidak berubah. Bruno + buat aturan siram tanah dan hapus aturan, /docs 1.1.0; login viewer lalu nyalakan lampu = 403. Frontend v1.0, lengkap untuk pengguna akhir di jaringan rumah: 1.0.0 + react-router 8.5.0, react-hook-form 7.91.0, @hookform/resolvers 5.9.2, zod 4.6.7; Vite dev server (laptop localhost:5173, HP npm run dev:hp selama uji); lint bersih, build lolos dengan satu peringatan 500 kB, cek-skema dua SAMA; browser dengan peta rute dan peran dari /auth/me, tiga layar mini: Detail + kendali, Aturan dalam kalimat, Form aturan; tombol dan form hanya admin; Keluar mengosongkan toko; toast paling banyak 2, di bawah layar bila lebar kurang dari 1280 px atau kanan atas mulai 1280 px. Browser ke backend: fetch + Socket.IO dengan cookie akses. Bawah kiri, GitHub: cabang fitur/kendali-peran, pull request dashboard v1.0 (kendali & peran) + backend 1.1 dengan butir (Modul 24); berkas backend 1.1.0 (aturan-dasar.ts baru, aturan.ts tipis, mesin, otomasi, arsip, routes/aturan.ts + keamanan.ts, Bruno, README v1.1), frontend 1.0.0 (App.tsx, halaman/, components/Login.tsx diganti halaman/Masuk.tsx dengan react-hook-form + Zod, cek-skema.js + skema/ berisi salinan identik + masuk.ts, toast.ts, aturan.ts, api, toko, soket, JagaMasuk, TataLetak, KhususAdmin, TombolSakelar, TombolPompa, WadahToast, DetailPerangkat + bagian Kendali khusus admin, daftar dan form aturan, apple-touch-icon.png, README v1.0), simulator + tanah, tandon, templat PR + (Modul 24); TombolPertama.tsx dihapus sebelum commit; tidak pernah ikut Git: backend/.env, frontend/.env.local, node_modules/, dist/, foto atau salinan kartu sandi penguji. Bawah kanan: Fase 4 berjalan, Checkpoint Fase 4 di Modul 25; menyusul Modul 25 Grafana, peta, laporan; Modul 26 Docker Compose; Modul 27 internet, HTTPS, PWA; Modul 28 armada, OTA, provisioning.](aset/diagram-proyek-modul-24.png)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini`; F: jendela kedua, folder `belajar-iot`) dan **browser** yang sudah masuk ke GitHub. Hentikan server (**Ctrl + C**) sebelum E.
>
> ⭐ **Wajib** — langkah E: *pull request* ke `main`.

### A. Cocokkan proyekmu: `frontend/` 1.0.0, `backend/` 1.1.0, dan simulator di `alat/`

Isi cabangmu harus sama dengan [`kode/frontend/`](kode/frontend/) (kecuali `README.md` dan perbaikan 10.4), [`kode/backend/`](kode/backend/), dan [`kode/alat/`](kode/alat/). Di terminal kosong (folder `frontend`), `git status` bersih di `fitur/kendali-peran` (Praktik 10 sudah di-*commit*). Jalankan `npm ls --depth=0` di situ, lalu `cd ../backend` dan ulangi. **Hasilnya (baris pertama):**

```text
rumah-pintar-mini-frontend@1.0.0 C:\Users\kamu\rumah-pintar-mini\frontend
rumah-pintar-mini-backend@1.1.0 C:\Users\kamu\rumah-pintar-mini\backend
```

Menurut kode rujukan, *pull request*-nya memuat **66 berkas**: 45 di `frontend` (27 baru, 17 berubah termasuk `README.md`, dan `Login.tsx` dihapus), 18 di `backend`, 2 di `alat`, dan templat.

### B. Perbarui `frontend/README.md`: peta rute, peran, dan batasan v1.0

Buka [`kode/frontend/README.md`](kode/frontend/README.md) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `frontend/README.md` dan simpan. Bagian barunya mulai dari **Peta rute**; **Batasan v1.0** menulis bahwa uji oleh orang lain dari HP sungguhan **belum dicoba penulis**. Sudah lulus 10.3? Ganti kalimat itu dengan hasilmu, tanpa nama penguji, sandi, atau IP.

### C. Perbarui `backend/README.md`, Bruno, dan `/docs` ke 1.1.0

Sudah beres di [6.4](#64--npm-run-cek-npm-test-dan-npm-audit-lalu-bruno-dan-docs-110-10-menit); periksa saja: `backend/README.md` memuat **Catatan versi 1.1**, `backend/bruno/` punya dua permintaan baru, dan `/docs` menulis `1.1.0`. Belum? Salin seperti di 6.4, lalu *commit*.

### D. Tambahkan butir Modul 24 ke templat *pull request*

Dengan cara yang sama, ganti seluruh isi `.github/pull_request_template.md` di akar repositori dengan [`kode/.github/pull_request_template.md`](kode/.github/pull_request_template.md). Isinya templat Modul 23 ditambah tujuh baris ini:

```markdown
- [ ] **(Modul 24)** Kalau `backend/src/schemas/kontrak.ts` atau `aturan-dasar.ts` berubah: salinannya di `frontend/src/skema/` ikut diperbarui, dan `npm run cek-skema` di folder `frontend` mencetak dua baris `SAMA`
- [ ] **(Modul 24)** Metode HTTP baru yang dipanggil dashboard (misalnya `DELETE`) ada di `methods` CORS backend (`src/auth/keamanan.ts`), dan sudah dicoba dari browser, bukan hanya dari Bruno (Bruno tidak mengirim *preflight*)
- [ ] **(Modul 24)** Tombol kendali dan menu admin hanya digambar kalau peran admin sudah pasti (`useAdmin()`), DAN backend tetap menolaknya: dicek di Bruno dengan `login viewer` lalu `nyalakan lampu` (dan setiap rute baru yang mengubah sesuatu) → 403. Menyembunyikan tombol bukan pengaman
- [ ] **(Modul 24)** **Keluar** dan sesi habis mengosongkan SEMUA toko (`kosongkanSemua()`): sesudah admin keluar, akun viewer yang masuk di tab yang sama tidak melihat sisa data, *toast*, atau tombol admin
- [ ] **(Modul 24)** Peran dan token tetap tidak pernah disimpan di `localStorage`; peran dibaca dari `GET /auth/me` / jawaban login
- [ ] **(Modul 24)** Tidak ada berkas percobaan `frontend/src/components/TombolPertama.tsx` (Kemenangan Cepat) di tab **Files changed**; akun penguji uji pengguna sudah dihapus (`npm run pengguna -- hapus …`) dan mode HP sudah dikembalikan
- [ ] **(Modul 24)** Tidak ada perintah pasang tanpa versi di naskah, README, atau catatan, dan tidak ada `--legacy-peer-deps`/`overrides` untuk "memaksa" pemasangan (contoh: `@hookform/resolvers@5.9.2`, bukan versi terbaru yang gagal ERESOLVE)
```

Buktinya: `cek-skema` ([7.1](#71-salin-aturan-dasarts-lalu-jaga-kedua-salinan-dengan-npm-run-cek-skema-10-menit)), Bruno `403` ([3.3](#33--ganti-akun-di-tab-yang-sama-tanpa-sisa-khusus-admin-dan-403-di-bruno-15-menit)), toko kosong ([3.2](#32-keluar-yang-tuntas-kosongkansemua-dan-empat-langkah-berurutan-15-menit)), akun penguji dan mode laptop ([10.5](#105-akun-viewer-di-hp-yang-sama-lalu-hapus-akun-penguji-dan-kembalikan-mode-laptop-10-menit)).

### E. ⭐ Gabungkan `fitur/kendali-peran` ke `main` lewat *pull request* "dashboard v1.0 (kendali & peran) + backend 1.1"

Di akar repositori (`cd ..`), `git status` harus menyebut tepat dua berkas `modified`: `.github/pull_request_template.md` dan `frontend/README.md`. Lalu:

```text
git add frontend/README.md .github/pull_request_template.md
git commit -m "Dokumen dashboard v1.0 dan butir Modul 24"
git push -u origin fitur/kendali-peran
```

1. Di GitHub, klik **Compare & pull request** (base `main`), judul `Dashboard v1.0 (kendali & peran) + backend 1.1`. Tulis perubahannya dan hasil uji penggunamu sejujur lembar catatan (misalnya `L1–L3 belum diuji orang lain`), salin ketujuh butir **(Modul 24)** dari D (templat `main` masih lama), lalu **Create pull request**.
2. ***Review*:** **Files changed** = 66 berkas, tanpa `TombolPertama.tsx`, `.env`, `node_modules/`, atau `dist/`. `git grep -n setInterval frontend/src` kini dua baris: jam di `waktu.ts` dan komentar di `toast.ts`. Centang yang terpenuhi, lalu **Review changes** → **Comment** → **Submit review**. Ada berkas terlarang? Jangan di-*merge*: `git rm -r --cached <berkas>` (`.env`: ganti juga rahasianya), *commit*, *push* lagi.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. `git switch main`, `git pull --prune`, `git branch -d fitur/kendali-peran`.

**Kamu lulus langkah ⭐ ini** kalau *pull request* itu ditinjau dengan butir **(Modul 24)**, di-*merge*, dan di `main` laptopmu `frontend/package.json` berversi `1.0.0` serta `backend/package.json` `1.1.0`.

### F. Simpan catatan belajar dan lembar uji penggunamu

Di folder `modul-24/` repositori **`belajar-iot`** (dari 🔁), simpan [`lembar-catatan.md`](kode/uji-pengguna/lembar-catatan.md) yang terisi ([10.3](#103--uji-pengguna-dari-hp-penguji-empat-tugas-tanpa-bantuan-25-menit); tanpa nama lengkap penguji, sandi, atau foto) dan `catatan.md`:

```markdown
# Catatan Modul 24 — Dashboard v1.0

| Yang diukur | Angkaku |
| :--- | :--- |
| Lampu: ack ok=true dalam … ms (5.5) | … |
| Uji pengguna: berhasil / dibantu / gagal (10.3) | … / … / … |
| L1–L3 diuji orang lain dari HP-nya? | ya / belum |

Yang paling membingungkan penguji: …
```

*Commit* dan *push*.

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| ***Ack*** **perangkat** | Jawaban perangkat lewat MQTT untuk satu perintah: `ok` dan `state` aktuatornya. Backend menunggunya paling lama 5 detik, lalu menjawab tombol `200` (dengan `ack.ok` `true`, atau `false` = ditolak) atau `504`. Bukan *ack* Socket.IO `ikuti` Modul 23. |
| **`aria-live`** | Tanda pada wadah *toast* (`role="status"`, `aria-live="polite"`) supaya pembaca layar membacakan isi barunya tanpa memindah fokus. Wadahnya harus sudah ada sebelum isinya berubah. |
| **Histeresis** | Jarak antara batas menyala dan batas siap lagi, supaya aktuator tidak nyala-mati terus saat angkanya berayun: siram **di bawah 30 %**, siap lagi **di atas 35 %** (kipas Modul 19: 30 dan 28 °C). |
| **Idempoten** | Perintah yang hasilnya sama walau terkirim dua kali: "nyalakan lampu" dua kali tetap menyala, jadi lampu dan kipas boleh optimis dan dikirim ulang sesudah `504`. "Siram 5 detik" dua kali = 10 detik: tidak idempoten. |
| **Kabar di layar** (*toast*) | Kartu kecil yang hilang sendiri sesudah 4 detik (atau ditutup ✕): hasil ketukanmu, atau acara `kejadian` dari backend. Paling banyak 2; di HP dan tablet di bawah layar, di laptop lebar (1280 px ke atas) di kanan atas. |
| **Kontras** | Perbandingan terang teks (atau tepi) dengan latarnya. Batas WCAG AA: teks 4,5 : 1; komponen dan cincin fokus 3 : 1. Diukur dengan Lighthouse dan Color Picker di DevTools. |
| ***Optimistic UI*** dan ***rollback*** | Tombol langsung menunjukkan keinginanmu sambil menulis `Menunggu konfirmasi perangkat…`, lalu mengikuti laporan perangkat begitu *ack* tiba; kalau gagal, ia mundur (*rollback*) ke keadaan terlapor dan *toast* menjelaskan sebabnya. Lampu dan kipas memakai `useOptimistic` + `useTransition`; pompa sengaja tidak optimis. |
| **Peran dua lapis** | Peran (`admin`/`viewer`) dipakai dua kali: layar (dari `GET /auth/me`) menyembunyikan tombol kendali dan layar admin dari viewer (kenyamanan), satpam backend (dari gelang) menolak permintaan viewer yang mengubah sesuatu dengan `403` (keamanan). Menyembunyikan bukan pengaman. |
| **Pintasan layar utama** | Ikon di layar utama HP yang membuka alamat dashboard di browser, bergambar `apple-touch-icon.png`. Bukan aplikasi terpasang (PWA butuh HTTPS, Modul 27); rusak kalau IP laptop berubah. |
| ***Resolver*** | Penghubung react-hook-form dengan pemeriksa luar: `zodResolver(skema)` dari `@hookform/resolvers` 5.9.2 menjalankan skema Zod dan mengubah hasilnya menjadi galat per kolom. |
| **Rute** dan `<Routes>` | Satu alamat untuk satu layar (`/perangkat/:id` → Detail). `<Routes>` di `App.tsx` = daftar semua alamat di satu tempat (React Router 8.5.0, mode deklaratif), jadi **Back**, **F5**, dan tautan langsung bekerja. Alamat layar (5173) bukan alamat API (8080). |
| **Rute tata letak** dan `<Outlet />` | `<Route>` tanpa `path` yang menggambar bingkai tetap (`TataLetak`: kepala, menu, **Keluar**) dan menaruh layar anak di `<Outlet />`-nya; isinya berganti tanpa memutus soket. |
| **Rute terproteksi** (*protected route*) dan **penjaga** | Layar yang dijaga petugas di depan pintu halaman: `JagaMasuk` membawa pengunjung ke `/masuk`, lalu kembali ke alamat asalnya sesudah masuk; `KhususAdmin` menampilkan `Khusus admin` kepada viewer. |
| **Skema** dan **salinan identik** | Aturan bentuk data yang diperiksa mesin. Satu aturan, dua penjaga: browser (cepat, per kolom) dan backend (pengaman). `kontrak.ts` dan `aturan-dasar.ts` disalin persis ke `src/skema/`; `npm run cek-skema` memastikan keduanya `SAMA`. |
| ***SPA fallback*** | Alamat layar yang bukan berkas dijawab `index.html` yang sama, lalu React Router menggambar layarnya. Vite melakukannya di `dev` dan `preview`; server lain (Modul 26–27) harus diberi aturan yang sama. |
| **Target sentuh** | Luas yang bisa diketuk jari: WCAG 2.2 AA minimal 24 × 24 px; kurikulum memakai 44 × 44 px. |
| **Uji pengguna** dan ***think-aloud*** | Orang lain mengerjakan tugas nyata tanpa dibantu sambil mengucapkan apa yang ia pikirkan (*think-aloud*). Kamu hanya membacakan ulang tugasnya; macet lebih dari 2 menit = "dibantu". |

## 📝 Kuis (5 soal)

1. Temanmu berkata, "Tombol kendali sudah disembunyikan dari viewer, jadi backend tak perlu memeriksa peran lagi." (a) Bagaimana viewer tetap bisa mencoba menyalakan lampu? (b) Siapa yang menjaga, dan apa jawabannya? (c) Peran sebuah akun diganti dari terminal. Kapan layar dan satpam mengetahuinya?
2. Kamu ingin tombol pompa **5 detik** langsung menulis `Menyiram` seperti tombol Lampu. (a) Mengapa itu salah? (b) Apa yang tampil sejak tombol pompa diketuk sampai selesai? (c) Dengan `tandon 15` di simulator, perintah pompa dijawab `200`, tetapi pompa diam. Mengapa?
3. Node 1 sedang tidak menjawab, dan kamu mengetuk **Lampu**. (a) Apa yang tampil sampai backend menjawab `504`, dan sesudahnya? (b) Puluhan detik kemudian lampu menyala sendiri. Mengapa? (c) Mengapa *toast*-nya tidak berbunyi "dibatalkan"?
4. (a) **F5** di `http://localhost:5173/perangkat/f00d00000001`: Vite tidak punya berkas bernama itu, tetapi Detail tampil. Mengapa? (b) `dist/` disalin ke server statis lain, dan **F5** di alamat itu dijawab `404`. Apa yang kurang? (c) Apa akibatnya pada hasil *build* kalau `base` diisi `./`?
5. (a) Mengapa formulir aturan memeriksa isian dengan Zod, padahal backend memeriksanya lagi? (b) Mengapa `aturan-dasar.ts` disalin, bukan diimpor dari `../backend`? (c) Apa yang menjaga kedua salinan tetap sama, dan apa tandanya kalau berbeda?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) Kode dashboard berjalan di browser siapa pun, jadi layar bisa dilewati, misalnya lewat Bruno `login viewer` lalu `nyalakan lampu`. (b) Satpam backend, yang memeriksa gelang dan peran di **setiap** permintaan: `403` `akun viewer hanya boleh melihat; perintah dan perubahan khusus admin`. (c) Layar sesudah halaman dimuat ulang (`GET /auth/me` hanya ditanyakan sekali); satpam paling lambat 15 menit kemudian, saat gelangnya diperbarui ([Konsep 5](#5-peran-dua-lapis-layar-untuk-kenyamanan-satpam-untuk-keamanan)).
2. (a) Pompa tidak idempoten: "siram 5 detik" yang terkirim dua kali berarti 10 detik, dan air yang keluar tidak bisa ditarik lagi. (b) Kartu tetap `Diam` dengan `Menunggu konfirmasi perangkat…`; sesudah *ack* `ok`: *toast* `Pompa menyiram 5 detik.`, kartu `Menyiram`, ketiga tombol detik mati, lalu `Diam` lagi. (c) `200` hanya berarti "perangkat menjawab", dan jawabannya `ack.ok: false`: *toast* `Pompa: perangkat menolak (pompa ditolak: air tandon kurang)` ([Konsep 2](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis)).
3. (a) Tombol langsung `Nyala` dengan `Menunggu konfirmasi perangkat…`. Tanpa *ack* dalam 5 detik, backend menjawab `504`; tombol kembali ke keadaan terlapor (`Mati`) dengan *toast* `Lampu: belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar.` (b) Backend mengingat **keinginan** `lampu: true`. Begitu perangkat terdengar lagi dan sudah lewat paling sedikit 30 detik sejak percobaan terakhir, backend mengirim ulang sendiri, disertai *toast* `lampu … dilaporkan false, padahal diinginkan true (api); perintah dikirim lagi`. (c) Karena memang tidak batal ([Konsep 1](#1-dari-melihat-ke-memerintah-perjalanan-satu-ketukan-sampai-ack), [Konsep 2](#2-optimistic-ui-tampil-dulu-mundur-kalau-gagal-dan-kapan-tidak-boleh-optimis)).
4. (a) *SPA fallback*: untuk alamat yang bukan berkas, Vite mengirim `index.html` yang sama, lalu React Router menggambar Detail, yang mencari perangkatnya di toko lewat `useParams()`. (b) Aturan yang sama di server itu: semua alamat layar dijawab `index.html` (Modul 26–27). (c) Browser meminta `/perangkat/assets/…`, dijawab `404`, dan layar putih; `base` tetap `/` ([Konsep 3](#3-satu-alamat-untuk-satu-layar-react-router-mode-deklaratif)).
5. (a) Satu aturan, dua penjaga: di browser untuk pengalaman (cepat, per kolom, isian salah tidak terkirim), di backend untuk keamanan (siapa pun bisa mengirim lewat Bruno). (b) `aturan.ts` backend menyeret node-cron ke browser: layar putih dengan `fileURLToPath is not a function`; lagi pula frontend harus bisa di-*build* tanpa folder `backend/`. (c) `npm run cek-skema`: dua baris `SAMA`. Kalau berbeda: `BEDA  src/skema/aturan-dasar.ts, mulai baris …` dan kode keluar 1; salin ulang dari backend ([Konsep 8](#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend)).

</details>

---

## ✅ Checklist kelulusan Modul 24

Syarat lulus dari Silabus: **orang lain (bukan Anda) bisa *login* dari HP-nya lewat WiFi rumah, menyalakan lampu, dan membuat aturan "siram jika tanah < 30 %" tanpa bantuan — dan akun viewer tidak melihat tombol kendali.** **Jalur tanpa perangkat:** semua butir boleh dicentang dengan simulator `f00d00000001`. Bukti lampu = kartu `Nyala` dan `f00d00000001: perintah c-… -> ok=true` di terminal simulator; bukti siram = `tanah 25` di terminal simulator, lalu *toast* `🌱 Tanah 25 % — pompa menyiram 5 detik otomatis`.

> [!NOTE]
> **Belum ada penguji atau HP?** Penulis belum menguji dengan orang lain dari HP sungguhan dan belum mencoba pintasan layar utama di HP ([📚](#-sumber--atribusi-gambar)). L1–L3 hanya dicentang sesudah **orang lain** mengerjakannya tanpa bantuan dari HP-nya. Tanpa penguji atau HP, kerjakan langkahnya sendiri lewat `http://<IP-laptop>:5173` dengan [mode perangkat DevTools](../modul-22-react-dasar/README.md#71-mode-perangkat-devtools-dashboard-di-375-768-dan-1280-px-8-menit) 375 px, biarkan L1–L3 dan ⭐ Praktik 10 kosong, tulis "L1–L3 belum diuji orang lain" di catatan dan *pull request*-mu, lalu ulangi begitu ada.

- [ ] **L1** Penguji masuk dari HP-nya lewat WiFi rumah dengan `penguji@rumah.test`, tanpa bantuan; log backend `login: akun N (admin), sesi N, IP 192.168.…` memuat IP HP-nya (Praktik 10).
- [ ] **L2** Penguji menyalakan lampu tanpa bantuan: langsung `Nyala` dengan `Menunggu konfirmasi perangkat…`; log `lampu = true, ack ok=true` (Praktik 10; versiku di Praktik 5).
- [ ] **L3** Penguji membuat aturan siram "di bawah 30 %" tanpa bantuan, dan aturannya berlaku: sesudah `tanah 25` (atau tanah Kit A yang kering) muncul `🌱 Tanah … — pompa menyiram … detik otomatis` (Praktik 10; versiku di Praktik 8).
- [ ] **L4** Akun viewer: Detail tanpa bagian **Kendali**, **Aturan** tanpa **+ Aturan baru** dan **Ubah**, `/aturan/baru` menulis `Khusus admin`, Bruno `nyalakan lampu` → `403` (Praktik 5 dan 10).
- [ ] `node pemanasan.js` mencetak `--- 1. Alamat jadi layar` sampai `--- 5. Pesan yang hilang sendiri`, cocok dengan "Kunci uji dirimu" (🔁).
- [ ] Tombol sementara menyalakan lampu sebagai admin dan ditolak `403` sebagai viewer, lalu `TombolPertama.tsx` kuhapus (Kemenangan Cepat).
- [ ] ⭐ Empat paket terpasang dengan versi tertulis; **Back**, **F5**, dan tautan langsung membuka layar yang sama; alamat asing menulis "tidak ditemukan"; pindah layar tidak memutus soket (Praktik 1).
- [ ] ⭐ Tanpa masuk, `/perangkat/f00d00000001/riwayat` membawaku ke `/masuk`, lalu kembali ke Riwayat sesudah masuk (Praktik 2).
- [ ] ⭐ **Keluar** → `Kamu sudah keluar.`; viewer di tab yang sama tanpa sisa data admin; `/aturan/baru` → `Khusus admin`; Bruno viewer → `403` (Praktik 3).
- [ ] Simulator dihentikan → *toast* `f00d00000001 terputus (offline)`; backend dimatikan lalu dinyalakan → status benar tanpa **F5** (Praktik 4).
- [ ] ⭐ Lampu dan kipas langsung berganti dengan `Menunggu konfirmasi perangkat…`, lalu mengikuti *ack*, juga di jendela kedua; **Request conditions** → tombol mundur dengan `Lampu: server tidak menjawab.`; pompa tidak optimis (Praktik 5).
- [ ] ⭐ Backend 1.1.0: `npm test` `Tests  57 passed (57)`, `npm audit` → `npm audit fix` dijalankan; Bruno membuat dan menghapus aturan siram; `/docs` 1.1.0; simulator menerima `tanah` dan `tandon` (Praktik 6).
- [ ] `npm run cek-skema` → dua `SAMA`; `/aturan` menampilkan aturan sebagai kalimat (Praktik 7).
- [ ] ⭐ "Siram jika tanah < 30 %" dari formulir: `tanah 25` → 🌱 dan pompa menyiram, `tanah 40` → `✅ Tanah naik ke 40 % — aturan siap lagi`; aturan bisa diubah, dinonaktifkan, dan dihapus (Praktik 8).
- [ ] Lighthouse Accessibility 100, terang dan gelap; cincin fokus terlihat; admin menyalakan lampu dalam mode HP (Praktik 9).
- [ ] ⭐ `npm run lint` bersih, `npm run build` **lolos dengan satu peringatan ukuran** (`Some chunks are larger than 500 kB after minification`), versi `1.0.0`; uji pengguna tercatat di lembar catatan; akun penguji dihapus dan mode laptop dikembalikan (Praktik 10).
- [ ] `frontend/` 1.0.0 dan `backend/` 1.1.0 cocok, README dan templat *pull request* diperbarui, catatan dan lembar uji pengguna (tanpa nama lengkap penguji) tersimpan di `belajar-iot/modul-24/` (➕ A–D, F).
- [ ] ⭐ Semua pekerjaan Modul 24 ada di `main` lewat *pull request* "dashboard v1.0 (kendali & peran) + backend 1.1" yang ditinjau dengan butir **(Modul 24)** (➕ E).

🎉 **Dashboard-mu kini memerintah, bukan hanya melihat.** Setiap layar punya alamat yang tahan **Back** dan **F5**, penjaga di pintunya, dan **Keluar** yang tuntas. Admin menyalakan lampu dengan tombol yang jujur menunggu perangkat, membuat aturan siram dari formulir yang diperiksa skema yang sama dengan backend, dan mendapat kabar di layar; viewer melihat semuanya tanpa satu tombol kendali pun, dan satpam backend tetap berjaga. Dashboard v1.0 ini masih tinggal di WiFi rumah lewat `http://` polos; HTTPS dan akses dari internet menunggu Modul 27. Satu modul lagi menuju Checkpoint Fase 4.

> ➡️ **Modul berikutnya:** [Modul 25 — Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan](../modul-25-grafana-peta-laporan/README.md). Dashboard buatanmu tetap untuk penghuni rumah; untuk tim teknis datang Grafana yang membaca TimescaleDB dan mengirim *alert* Telegram saat node diam lebih dari 5 menit, ditambah peta perangkat dan laporan harian CSV otomatis.

## 📚 Sumber & atribusi gambar

**Dokumentasi dan kode sumber yang dipakai** (diakses Oktober 2026; versi paket dicek dengan `npm view` pada 25 Oktober 2026):

- **React Router 8.5.0**: [tiga mode](https://reactrouter.com/start/modes), [rute](https://reactrouter.com/start/declarative/routing) dan [navigasi](https://reactrouter.com/start/declarative/navigating) mode deklaratif, [pengumuman v8](https://remix.run/blog/react-router-v8), [pindah dari v7](https://reactrouter.com/upgrading/v7), dan [contoh *auth* resmi](https://github.com/remix-run/react-router-examples/tree/main/auth).
- **react-hook-form 7.91.0**: [`useForm`](https://react-hook-form.com/docs/useform). **@hookform/resolvers 5.9.2**: [`zodResolver`](https://github.com/react-hook-form/resolvers#zod) dan [issue #882](https://github.com/react-hook-form/resolvers/issues/882) (`ERESOLVE` di 6.0.0). **React 19.3.1**: [`useOptimistic`](https://react.dev/reference/react/useOptimistic) dan [`useTransition`](https://react.dev/reference/react/useTransition). **Vite 8.3.5**: [`appType`](https://vite.dev/config/shared-options.html#apptype) (*SPA fallback*) dan [`base`](https://vite.dev/config/shared-options.html#base).
- **Aksesibilitas**: WCAG 2.2 [kontras teks](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [kontras non-teks](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [ukuran target](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [fokus terlihat](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), dan [pesan status](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html); MDN [*live region*](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions); DevTools [kontras](https://developer.chrome.com/docs/devtools/accessibility/contrast) dan [**Request conditions**](https://developer.chrome.com/docs/devtools/request-conditions).
- **HP dan browser**: [pintasan Chrome Android](https://support.google.com/chrome/answer/15085120?hl=en&co=GENIE.Platform%3DAndroid), [Safari 26](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/), [konteks aman](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), dan [*bfcache*](https://web.dev/articles/bfcache). **Hanya untuk 🔬**: [Next.js 16](https://nextjs.org/blog/next-16).
- **Backend 1.1**: [`backend-1.1.diff`](kode/backend-1.1.diff) atas backend v1.0 Modul 21; bentuk data tetap [kontrak 1.4](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini); pengaman lokal Node 1 v1.6.0 (Serial `ambang 20`) dibaca dari [`aturan.cpp`](../../proyek-rumah-pintar-mini/firmware/node-1-rumah/aturan.cpp) dan `perintah.cpp`. Syarat lulus dikutip dari [Silabus §7 Modul 24](../../SILABUS.md#modul-24--kendali-form-aturan-peran--rute-terproteksi).

**Gambar.** Diagram dan tangkapan layar milik penulis berlisensi **CC BY 4.0**; file `.svg` diagram ada di `aset/`. Rincian per file: [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-24`, `perjalanan-perintah`, `peta-rute`, `peran-dua-lapis`, `dua-penjaga-zod`, `aturan-siram-berlapis`, `uji-pengguna`, `diagram-proyek-modul-24` | Diagram orisinal dari kode modul ini dan uji penulis. Angka, jam, dan IP **contoh**; Node 1 sungguhan dibaca dari firmware; `uji-pengguna` menggambarkan cara kerja, bukan hasil uji. | CC BY 4.0 |
| `detail-admin-vs-viewer`, `tombol-menunggu-konfirmasi`, `form-aturan-siram`, `aturan-dan-toast`, `rute-masuk-khusus-admin-404` | Tangkapan asli dashboard v1.0 lawan backend 1.1 di Edge, lebar 1280 dan 375 px (**mode perangkat DevTools, bukan HP sungguhan**), dari kode akhir: sebelum Praktik 9 warna di layarmu sedikit lebih terang, dan menu **Aturan** baru ada mulai Praktik 7. | CC BY 4.0, Oktober 2026. React, React Router, react-hook-form, @hookform/resolvers, Zod, Vite, Tailwind CSS, Recharts, Zustand, dan socket.io-client berlisensi MIT. |
| `aksesibilitas-lighthouse` | Laporan Lighthouse 13.5.0 dan Color Picker DevTools Edge 156 yang asli. | Judul, nomor, dan keterangan: CC BY 4.0. Lighthouse berlisensi Apache-2.0; DevTools milik Microsoft, tampil apa adanya untuk tujuan pendidikan. |

**Tentang kotak Hasilnya.** Semua perintah dijalankan penulis di Windows 11 25H2 dengan Node.js 24.21.0, npm 11.19.0, dan Docker Desktop 4.77.0, lawan backend dan database TimescaleDB sungguhan: v1.0 dari repo sampai Praktik 5, lalu 1.1.0 lewat langkah Praktik 6 (tangkapan layar dan rekaman susulan: 1.1.0). Broker MQTT-nya program kecil berkunci yang meniru Mosquitto. Pengirimnya simulator `f00d00000001` dan Node 1 tiruan yang meniru firmware v1.6.0 dan bisa dibuat lambat atau tidak menjawab (untuk `504`); untuk bingkai tengah gambar tombol, Node 1 tiruan sengaja diperlambat 3 detik. Angka sensornya **contoh**.

Terminal direkam langsung dari layar konsol Windows PowerShell 5.1, dengan port asli `8080`, `5173`, dan `1883` (database lab di port lain). Tangkapan layar dan rekaman susulan memakai port lain yang ditulis seperti biasa; port itu tidak tampak di gambar. Log yang memuat emoji, `—`, atau `°` dikutip dengan teks yang benar; konsol berkode halaman 437 menampilkannya rusak sampai `chcp 65001` ([🚨](#-kalau-tidak-jalan)). Browser-nya Microsoft Edge 156 tanpa layar, digerakkan skrip, dengan zona diemulasi `Asia/Jakarta`; lebar 375 px dan mode gelap juga diemulasi. **Request conditions** diganti perintah DevTools yang setara (menunya tidak diklik), Lighthouse dijalankan dari baris perintah, dan permintaan Bruno dikirim skrip dengan metode, alamat, isi, dan akun yang sama. Langkah HP direkam di laptop yang membuka IP WiFi-nya sendiri (ditulis `192.168.1.10`); jalur folder ditulis `C:\Users\kamu\…`, dan *firewall* tidak disentuh.

Laptop penulis berzona UTC+8; backend memakai `TZ=Asia/Jakarta`, jadi jam log WIB. Laptop itu juga sibuk oleh pekerjaan lain. Detik, milidetik, `in 44s`, jam, id aturan, dan nama berkas *build* di semua kotak adalah **contoh**; angka waktu di diagram dari larian lain. Kotak direkam sebelum `useTransitions={false}` dipasang di Praktik 5; perbaikan itu diuji ulang penulis (pindah layar saat tombol menunggu), dan angka *build* 10.1 diambil sesudahnya. Yang perlu cocok adalah bentuk keluaran dan syarat lulusnya.

Yang **tidak** diuji: HP Android dan iPhone sungguhan, termasuk pintasan layar utama dan iOS 26; uji oleh orang lain (gladi Praktik 10 dikerjakan skrip); Kit A dan Node 1 sungguhan (relay lampu, pompa, tandon, Serial `ambang 20`); Chrome, Firefox, dan Safari; serta Windows Terminal, terminal VS Code, macOS, dan Linux.

---

[⬅️ Modul 23](../modul-23-dashboard-realtime/README.md) · [Fase 4](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 25 — Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan](../modul-25-grafana-peta-laporan/README.md) ➡️**
