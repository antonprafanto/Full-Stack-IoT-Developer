# Modul 22 — HTML, CSS, & React (TypeScript) dari Nol untuk Dashboard IoT

🌐 **Bahasa Indonesia** · [English](../../en/phase-4-frontend-dashboard/module-22-react-basics/README.md)

*Fase 4 · Minggu 22 · Perangkat keras (*hardware*): **tidak wajib** — dashboard hanya membaca backend v1.0 di laptop; datanya dari Node 1 dan Node 2 (**Kit A + B**) **atau** simulator Modul 21 · Prasyarat: **Modul 21** (backend v1.0 berkunci) · Waktu: 9–11 jam, dicicil dalam satu minggu*

[⬅️ Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 23 ➡️](../modul-23-dashboard-realtime/README.md)

---

Selamat datang di **Fase 4**. Selama Fase 3, kamu membangun **otak** Rumah Pintar Mini lalu menguncinya, tetapi otak itu belum punya **wajah**. Untuk tahu suhu kebun, kamu masih membuka Bruno, *login*, mengirim `GET /devices/246f28b1c7d4/latest`, lalu membaca JSON penuh kurung kurawal. Bagimu itu biasa; bagi keluarga yang hanya ingin tahu apakah tandon masih berisi air, itu teka-teki.

Fase 4 memberi rumah ini wajah: **dashboard yang enak dipakai di HP maupun laptop, oleh orang yang tidak tahu apa itu MQTT**. Modul 21 menutup Fase 3 dengan catatan bahwa asal `http://localhost:5173` sudah ada di `CORS_ORIGIN` sejak Modul 20, menunggu. Kamu membangun halaman di alamat itu dari nol: HTML, CSS, dan JavaScript tulisan tangan (termasuk membedah sakelar `/on` `/off` Modul 10, yang dulu kamu tempel dengan catatan "tampilan yang cantik menunggu Modul 22"), lalu React dan TypeScript, sampai formulir *login* kecil ke API berkuncimu. Tidak ada firmware baru dan kode backend tidak diubah; proyek barunya tinggal di folder `frontend/`.

Minggu ini kamu memasang wajah pertamanya:

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Data rumahmu hanya terbaca lewat Bruno, `/docs`, dan terminal kecil. | Belum ada halaman web sendiri yang membaca API berkunci. | **Dashboard v0.1**: proyek **Vite** dengan **React 19** dan **TypeScript** di folder `frontend/` (Konsep 4–5, Praktik 2) |
| Halaman sakelar `/on` `/off` Modul 10 bekerja, tetapi isinya masih kotak hitam. | HTML, CSS, dan JavaScript-nya belum pernah dibedah. | **HTML kerangka, CSS kulit, JavaScript otot**: halaman Modul 10 dibedah dengan DevTools, lalu diberi kulit dan otot (Konsep 1–2, Praktik 1) |
| Kartu rapi dengan CSS biasa butuh aturan panjang dan nama karangan untuk setiap kotak. | Gaya ditulis dari nol, terpisah dari HTML. | **Tailwind CSS v4**: kelas kecil seperti `rounded-xl p-4` langsung di elemennya, tanpa `tailwind.config.js` (Konsep 3, Praktik 2) |
| Kartu setiap sensor disalin berulang, dan salah ketik `kelembaban` (seharusnya `kelembapan`) baru ketahuan saat kartunya kosong. | Belum ada balok yang dipakai ulang, dan halaman tidak tahu bentuk data. | **Komponen `KartuSensor`** dengan *props* bertipe Lampiran A (`src/types.ts`): salah ketik ditandai editor dan `npm run build` (Konsep 5–6, Praktik 3) |
| Sejak Modul 20, API menjawab **401** kepada yang belum *login*, dan gelangnya hanya berumur 15 menit. | Backend hanya percaya gelang (*cookie* `akses`) yang dipasangnya, dan `localhost:5173` berbeda asal dengan `localhost:8080`. | **Formulir *login* minimal** dengan `useState` (disempurnakan di Modul 24), `fetch` dengan `credentials: "include"` lewat CORS dari Modul 20, dan ***refresh* sekali** dengan kartu terusan (*cookie* `sesi`), janji Modul 20 (Konsep 7 dan 9, Praktik 4 dan 6) |
| Saat backend lambat, mati, atau baru menyala ulang, halaman kosong atau membeku tanpa penjelasan. | Mengambil data butuh waktu dan bisa gagal; sesudah backend menyala ulang, `/latest` menjawab 404 sampai bacaan pertama tiba. | **Tiga keadaan**: memuat, galat, dan kosong; data diambil `useEffect` sesudah layar tampil (Konsep 8 dan 10, Praktik 5–6) |
| Jam di JSON tertulis dalam UTC (berakhiran `Z`), dan perangkat yang kuncinya dicabut (Modul 21) bisa tetap `online`. | Modul 10–21 sengaja menyerahkan dua urusan ini kepada dashboard. | **Daftar dan detail perangkat** dengan "diperbarui pukul … WIB" dari `ts` dan lencana `kunci` yang membuat perangkat `dicabut` menonjol (Praktik 5–6) |
| Nama dan lokasi perangkat diketik manusia; halaman ceroboh bisa ikut menjalankan skrip jahat di dalamnya (XSS). | Teks yang disisipkan sebagai HTML bisa menjadi kode; Modul 20 menunda XSS di dashboard ke sini. | **JSX meloloskan teks otomatis** (tanpa `dangerouslySetInnerHTML`); token tetap di *cookie* `HttpOnly`, bukan `localStorage` (Konsep 5 dan 9) |
| Dashboard harus enak dibaca di HP, padahal ditulis di laptop. | Kartu yang rapi di laptop bisa terpotong atau memaksa layar HP digeser ke samping. | **Tata letak responsif** *mobile first* dengan kisi Tailwind, diperiksa di mode perangkat DevTools pada lebar 375, 768, dan 1280 piksel (Konsep 11, Praktik 7) |

Di akhir minggu, kamu masuk di `http://localhost:5173` dengan akun Modul 20, lalu melihat semua bacaan Node 1 (atau `f00d00000001`) sebagai kartu dengan jam WIB. Itulah syarat lulus dari Silabus: **setelah *login*, dashboard menampilkan bacaan terbaru semua sensor dari API, rapi di layar HP.** Layar HP diperiksa dengan mode perangkat DevTools (HP sungguhan: pilihan di 🔬). Rumah Pintar Mini mendapat **dashboard v0.1** (`0.1.0`): masih statis (angka yang bergerak sendiri dan grafik datang di Modul 23), tetapi sudah ber-*login*. Backend tetap v1.0, kontrak data tetap 1.4.

![Peta jalan Modul 22. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 4 Dashboard, Modul 22 sampai 25, disorot dengan bingkai ungu. Modul 1 sampai 21 bertanda selesai; Modul 22 berwarna merah dan ditandai KAMU DI SINI, Modul 23 sampai 25 berwarna ungu, dan di kanannya ada label ungu Fase 4 dimulai (Modul 22–25) yang menunjuk ke deretan itu. Catatan di samping penanda: rumah mendapat wajah, yaitu dashboard React pertama di browser dengan login, daftar perangkat, dan bacaan terbaru semua sensor. Di bawahnya, kotak Modul 22 minggu ini, 9 sampai 11 jam dicicil; perangkat keras tidak wajib, lanjutan langsung Modul 21 dengan backend v1.0 berkunci serta akun admin@rumah.test dan viewer@rumah.test. Daftar kegiatan: pemanasan ulang JavaScript, yaitu destrukturisasi, map, operator ? :, &&, dan ??, spread ..., serta fetch ke /health; Kemenangan Cepat, kartu sensor pertamamu di browser tanpa memasang apa pun; Praktik 1, HTML, CSS, dan JavaScript dengan tangan, membedah halaman Modul 10; Praktik 2, proyek Vite pertama dengan React, TypeScript, dan Tailwind v4; Praktik 3, komponen pertama KartuSensor dan tipe dari kontrak data; Praktik 4, state dan formulir login, dengan bagian syarat lulus setelah login; Praktik 5, useEffect, siapa saya dan daftar perangkat; Praktik 6, detail perangkat, bacaan terbaru semua sensor, dengan bagian syarat lulus bacaan terbaru semua sensor dari API; Praktik 7, rapi di layar HP, dengan bagian syarat lulus rapi di layar HP, diperiksa di mode perangkat DevTools; Praktik 8, uji kelulusan, build, lint, dan gladi bersih, yaitu gladi bersih ketiga syarat lulus sesudah npm run lint dan npm run build; dan Tambahan, dashboard v0.1 dan pull request dashboard v0.1. Praktik 4, 6, 7, 8, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: syarat lulus dari Silabus, setelah login, dashboard menampilkan bacaan terbaru semua sensor dari API, rapi di layar HP; dua jalur data, yaitu perangkat (Node 1 dan Node 2 lewat gateway Pi) atau laptop (simulator Modul 21 dengan perangkat latihan f00d00000001); Wokwi tidak diperlukan; selalu buka http://localhost:5173, bukan 127.0.0.1, karena cookie login hanya ikut kalau nama host halaman dan API sama.](aset/peta-jalan-modul-22.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Dua jalur data, satu dashboard.** Seperti ditetapkan Modul 11, dashboard tidak menyambung ke broker atau perangkat, hanya ke API backend v1.0. **Jalur perangkat**: Node 1 dan Node 2 (**Kit A + B**) mengirim lewat broker di gateway Pi, seperti akhir Modul 21. **Jalur laptop**: Mosquitto di laptop dan simulator Modul 21 (folder `alat`) dengan perangkat latihan `f00d00000001` yang sudah terdaftar. Simulator hanya meniru Node 1, jadi bagian khusus Node 2 cukup dibaca; syarat lulus tetap terpenuhi. **Wokwi tidak dipakai** (tidak ada firmware baru).
> - **Buka dashboard selalu di `http://localhost:5173`**, alamat yang dicetak Vite, bukan `127.0.0.1:5173` (di laptop Windows penulis, alamat itu bahkan tidak terbuka dengan setelan bawaan Vite; 🚨). Dashboard mengetuk backend di `http://localhost:8080` (nama host sama dengan halamannya), sedangkan Bruno dan `/docs` tetap di `http://127.0.0.1:8080`. Karena *cookie* melekat pada nama host, *login* di `/docs` tidak berlaku di dashboard, dan sebaliknya (Konsep 9).
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **VS Code** dengan terminal `backend` (backend v1.0, `npm run dev`, pintu 8080), terminal `frontend` (Vite, juga `npm run dev`, pintu 5173), dan di jalur laptop terminal `alat` (simulator); **Docker Desktop** dengan `rumahpintar-db` menyala; **Chrome atau Edge** dengan DevTools (tab **Elements**, **Console**, **Network**, **Application**) dan ekstensi **React DevTools** (Praktik 2); serta **Bruno** untuk mencocokkan angka di layar dengan API.
> - **Lanjutan langsung Modul 21.** Kontainer `rumahpintar-db` (akun `admin@rumah.test` dan `viewer@rumah.test`), backend v1.0 di `main`, koleksi Bruno dengan `backend/bruno/.env`, dan `alat/.env` (kunci perangkat latihan) dipakai apa adanya. Dashboard tinggal di folder **`frontend/`** repositori `rumah-pintar-mini`, di samping `backend/` dan `alat/`, di cabang `fitur/dashboard`.
> - **Kotak Hasilnya.** Keluaran dan tangkapan layar direkam penulis di Windows 11 25H2 (*build* 10.0.26200.9711) dengan Node.js 24.21.0, npm 11.19.0, Docker Engine 29.5.3, dan Edge 155.0.4283.62 lawan backend v1.0 Modul 21 sungguhan (langkah DevTools juga dicek di Chrome 156.0.8078.47); angka Node 1 dan 2 dari simulator lab, jadi tetap (rincian di 📚 Sumber). Jam, lama muat, ukuran hasil *build*, dan angka sensor di layarmu pasti berbeda; keluaran seperti itu ditandai **contoh**.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan VS Code dan browser (DevTools: **F12** atau **Ctrl + Shift + I**, macOS **Cmd + Option + I**; muat ulang: **F5**, macOS **Cmd + R**). **Kecuali di terminal:** menghentikan program (backend, Vite, simulator) tetap **Ctrl + C**, juga di Mac. Perintah terminal sama di Windows dan macOS, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Dashboard tidak menyimpan sandi atau token.** Sandi hanya hidup di formulir *login* selama diketik. Gelang dan kartu terusan adalah *cookie* `HttpOnly` yang diurus browser dan tak terbaca JavaScript. Jangan menulis sandi atau token di kode, apalagi menyimpannya di `localStorage` (Konsep 9).
> 2. **Semua variabel `VITE_…` ikut terkirim ke browser**, tertanam di JavaScript yang bisa dibaca siapa pun. Isinya hanya boleh alamat seperti `VITE_API_BASE`, tidak pernah rahasia (Konsep 4).
> 3. **`.env.local` tidak ikut Git.** Templat Vite mengabaikan berkas berakhiran `.local`, dan di Praktik 2 kamu menambahkan `.env` ke `.gitignore`. Yang ikut ke GitHub hanya `.env.example`.
> 4. **Backend dan dashboard hanya untuk laptopmu.** Jangan mengubah `HOST` backend menjadi `0.0.0.0` atau menjalankan Vite dengan `--host`, kecuali di bagian pilihan "mencoba di HP sungguhan" di 🔬 (lalu kembalikan setelannya). HP lewat WiFi rumah resmi mulai Modul 23; internet menunggu HTTPS di Modul 27.
> 5. **Pasang paket npm dengan versi yang tertulis** (misalnya `npm create vite@9.3.1`). Salin nama paketnya dari modul, jangan dari ingatan: paket bernama mirip bisa buatan orang lain.

Seperti Modul 16–21, modul ini diawali **🔁 Pemanasan ulang JavaScript**, kali ini bekal React. Hari pertama (pemanasan, Kemenangan Cepat, Konsep 1–2, Praktik 1) cukup HTML, CSS, dan JavaScript tanpa memasang paket; React baru datang di Praktik 2. Bagian lipat di 🚨 (klik judulnya) dibuka saat perlu; bagian lipat di 🔬 boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🏆 Kemenangan Cepat: kartu sensor pertamamu di browser (20 menit)](#-kemenangan-cepat-kartu-sensor-pertamamu-di-browser-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Tiga lapis](#1-halaman-web-html-kerangka-css-kulit-javascript-otot) · [2 DevTools](#2-browser-dan-devtools-membedah-sakelar-modul-10) · [3 Tailwind](#3-tailwind-css-v4-kulit-dari-kelas-kelas-kecil) · [4 Vite](#4-vite-dan-folder-frontend-dapur-pengembangan-di-localhost5173) · [5 React dan JSX](#5-react-dan-jsx-halaman-dari-balok-lego) · [6 *Props* dan tipe](#6-props-dan-tipe-data-yang-dititipkan-bentuknya-dari-kontrak-data) · [7 *State*](#7-state-dan-usestate-layar-yang-ingat) · [8 `useEffect`](#8-useeffect-dan-fetch-mengambil-data-sesudah-layar-tampil) · [9 *Login* dari browser](#9-login-dari-browser-cookie-cors-dan-localhost) · [10 Tiga keadaan](#10-memuat-galat-dan-kosong-tiga-keadaan-yang-selalu-disiapkan) · [11 Responsif](#11-responsif-satu-halaman-untuk-hp-dan-laptop)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 HTML dengan tangan](#praktik-1--html-css-dan-javascript-dengan-tangan-membedah-halaman-modul-10-60-menit) · [2 Proyek Vite](#praktik-2--proyek-vite-pertama-react-typescript-dan-tailwind-v4-45-menit) · [3 `KartuSensor`](#praktik-3--komponen-pertama-kartusensor-dan-tipe-dari-kontrak-data-45-menit) · [4 *Login*](#praktik-4--state-dan-formulir-login-60-menit) · [5 Daftar perangkat](#praktik-5--useeffect-siapa-saya-dan-daftar-perangkat-60-menit) · [6 Detail perangkat](#praktik-6--detail-perangkat-bacaan-terbaru-semua-sensor-60-menit) · [7 Layar HP](#praktik-7--rapi-di-layar-hp-40-menit) · [8 Uji kelulusan](#praktik-8--uji-kelulusan-build-lint-dan-gladi-bersih-35-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-22)

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan tiga lapis halaman web** (HTML kerangka, CSS kulit, JavaScript otot), lalu **membedah halaman sakelar `/on` `/off` Modul 10** dengan DevTools browser: tab **Elements**, **Console**, dan **Network**.
2. **Memberi kulit dengan Tailwind CSS v4** lewat kelas-kelas kecil langsung di HTML, tanpa berkas `tailwind.config.js`.
3. **Membuat proyek Vite dari templat `react-ts`** dan memahami folder `frontend`: "dapur" `npm run dev` di `http://localhost:5173` dan "hidangan siap saji" `npm run build` di `dist/`.
4. **Memecah layar menjadi komponen yang dipakai ulang**, seperti `KartuSensor`, dengan *props* bertipe dari kontrak data Lampiran A (`src/types.ts`).
5. **Memakai `useState`** untuk formulir *login* dan **`useEffect`** untuk mengambil data sesudah layar tampil: daftar perangkat (dengan lencana `kunci` Modul 21) dan bacaan terbaru semua sensor, dengan jam WIB.
6. ***Login* dari browser dengan *cookie* Modul 20**: `fetch` dengan `credentials: "include"` ke backend di `localhost` (bukan `127.0.0.1`), tanpa menyimpan token di `localStorage`, dan menjelaskan bagaimana JSX menjaga dashboard dari XSS.
7. **Menjaga sesi tetap hidup dengan *refresh* sekali**: saat gelang 15 menit habis (401), dashboard mengetuk `POST /auth/refresh` satu kali lalu mengulang permintaannya, seperti janji Modul 20.
8. **Menyiapkan tiga keadaan di setiap layar** (memuat, galat, dan kosong), termasuk sesi yang benar-benar habis (401) dan perangkat yang belum punya bacaan.
9. **Menata dashboard agar rapi di HP dan laptop** (375–1280 px), lalu memastikan `npm run lint` bersih dan `npm run build` lolos sebelum dashboard v0.1 digabung lewat *pull request*.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 21** | Kontainer **`rumahpintar-db`** menyala di Docker Desktop, **backend v1.0** di `main` (Modul 21 ➕ E), akun `admin@rumah.test` dan `viewer@rumah.test` dari Modul 20 beserta sandinya (untuk *login* di Praktik 4), dan `alat/.env`. |
| **Sumber data** (pilih satu jalur) | **Jalur perangkat:** Node 1 v1.6.0 dan Node 2 (Kit A + B) menyala dan terdaftar di backend sejak Modul 21, dengan broker terkunci di gateway Pi. **Jalur laptop:** Mosquitto di laptop dan `alat/simulator-perangkat.js` versi Modul 21 dengan perangkat latihan **`f00d00000001`** yang sudah terdaftar. Wokwi dan Arduino IDE tidak dipakai. |
| **Node.js 24, VS Code, Git, Bruno** | Vite 8 butuh Node.js **20.19+ atau 22.12+**, jadi Node.js 24 mana pun cukup. Mac yang tertahan di Node.js 22 sejak Modul 4 tetap bisa ikut kalau versinya **22.18 atau lebih baru**, syarat backend sejak Modul 16. Bruno dipakai lagi mulai Praktik 4. |
| **Google Chrome atau Microsoft Edge** | Untuk membuka dashboard, lengkap dengan **DevTools** bawaannya. Firefox dan Safari belum diuji. |
| **React DevTools** | Ekstensi browser gratis dari tim React yang menambah beberapa tab ke DevTools, di antaranya **Components**: pohon komponen beserta *props* dan *state*-nya. Dipasang di Praktik 2. |
| **Folder `belajar-iot`** dan **alat Modul 4** | Pemanasan, Kemenangan Cepat, dan Praktik 1 bekerja di `belajar-iot/modul-22` tanpa paket baru. Dua alat Modul 4 di `rumah-pintar-mini/alat` dipakai lagi: `penerima-webhook.js` (Praktik 1) dan `generate-dummy.js` (Praktik 3). |
| **Koneksi internet** | Untuk `npm create vite@9.3.1`, `npm install`, dan React DevTools. Bersama Tailwind, `frontend/node_modules` berukuran sekitar **100 MB** (diukur di laptop Windows penulis). Sesudah itu, dashboard tidak butuh internet lagi. |
| **Akun GitHub** | Sudah ada sejak Modul 16; dipakai untuk *pull request* "dashboard v0.1" di ➕. |

Versi yang dipakai modul ini (Oktober 2026): **Node.js 24**, **create-vite 9.3.1** (pembuat proyek, lewat `npm create vite@9.3.1`), **vite 8.3.5**, **react** dan **react-dom 19.3.1**, **@vitejs/plugin-react 6.1.2**, **tailwindcss** dan **@tailwindcss/vite 4.3.3**, **typescript 6.0.3**, **oxlint 1.89.0**, **@types/node 24.19.2**, dan ekstensi **React DevTools 8.0.0**. Kamu tidak memasangnya satu per satu: templat `react-ts` menuliskannya di `package.json` sebagai rentang (misalnya `"vite": "^8.3.4"`), lalu `npm install` di Praktik 2 memilih versi terbaru yang angka depannya sama; pada Oktober 2026 hasilnya persis seperti daftar di atas. Hanya Tailwind yang kamu pasang sendiri, dengan versi tertulis (`npm install tailwindcss@4.3.3 @tailwindcss/vite@4.3.3`). **oxlint** adalah pemeriksa kerapian kode (*linter*) bawaan templat, pengganti ESLint di tutorial lama (🚨).

> [!NOTE]
> **Mengapa TypeScript frontend 6.0.3, sedangkan backend 7.0.2?** Templat create-vite 9.3.1 menguncinya pada `~6.0.3`; backend memakai **7.0.2** sejak Modul 16. Masing-masing tinggal di `node_modules` foldernya sendiri, jadi tidak saling mengganggu dan tidak perlu disamakan.

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, dan folder repositori `belajar-iot`. Khusus Langkah 5: backend v1.0 Modul 21 di jendela VS Code kedua (folder `rumah-pintar-mini/backend`) dan **Docker Desktop** dengan kontainer `rumahpintar-db`. Browser belum dipakai.

Komponen React pada dasarnya fungsi JavaScript yang mengembalikan tampilan, dan TypeScript hanyalah JavaScript berlabel tipe (Modul 16). Jadi, seperti Modul 16–21, kita mulai dengan pemanasan: lima kemampuan kecil yang dipakai di hampir setiap komponen dashboard (lihat catatan **Nanti di React**). Kodenya dijalankan Node.js di terminal. Ketik sendiri, jangan salin-tempel, lalu cocokkan hasil setiap langkah.

**Siapkan foldernya.** Buka repositori **`belajar-iot`** di VS Code, klik ruang kosong di panel Explorer, buat folder baru **`modul-22`**, lalu jalankan di terminal:

```text
cd modul-22
npm init -y
npm pkg set type=module
```

`type=module` menjadikan berkas `.js` di sini modul (*ES module*); Langkah 5 membutuhkannya. Lalu buat **`pemanasan.js`** di `modul-22` (folder ini dipakai lagi di Kemenangan Cepat dan Praktik 1).

### Langkah 1 — Objek bacaan dan destrukturisasi

Backend mengirim bacaan berbentuk Lampiran A: `device_id`, lalu `telemetry` berisi `ts`, `fw`, dan kolom sensor. **Destrukturisasi** (*destructuring*) mengambil beberapa kolom sekaligus ke variabel bernama sama. Ketik di `pemanasan.js`:

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 22
// Lima kemampuan kecil yang nanti dipakai lagi di komponen React dashboard.

// 1. Objek bacaan dan destrukturisasi
const bacaan = {
  device_id: "a4cf12e5b7c0",
  telemetry: { ts: "2026-10-23T09:41:30Z", fw: "1.5.0", suhu: 28.5, kelembapan: 71, cahaya: 3094, tanah: 37, gerak: false, level_air: 52 },
};
const { suhu, kelembapan } = bacaan.telemetry; // ambil dua kolom sekaligus ke variabel bernama sama
console.log("Suhu:", suhu, "°C, kelembapan:", kelembapan, "%");
// destrukturisasi juga bisa langsung di parameter fungsi, persis cara komponen React menerima props
function kartu({ label, nilai, satuan }) {
  return `${label}: ${nilai} ${satuan}`;
}
console.log(kartu({ label: "Suhu", nilai: suhu, satuan: "°C" }));
```

Simpan (**Ctrl + S**), lalu jalankan di terminal:

```text
node pemanasan.js
```

**Hasilnya:**

```text
Suhu: 28.5 °C, kelembapan: 71 %
Suhu: 28.5 °C
```

- **`const { suhu, kelembapan } = bacaan.telemetry;`** sama dengan `const suhu = bacaan.telemetry.suhu;` plus baris serupa untuk `kelembapan`. Nama harus persis: salah ketik `kelembaban` diam-diam menjadi `undefined` (di Praktik 3, TypeScript menangkapnya).
- **`function kartu({ label, nilai, satuan })`** membongkar objek langsung di parameter.

**Nanti di React:** komponen menerima titipannya (*props*) sebagai satu objek dan membongkarnya begini: `function KartuSensor({ label, nilai, satuan, warna = "text-slate-800" }: Props)` (Praktik 3, Konsep 6). Versi *array*-nya memakai kurung siku, menurut urutan: `const [email, setEmail] = useState("");` (Konsep 7).

### Langkah 2 — Dari *array* menjadi daftar: `map`

`GET /devices` menjawab dengan *array*, satu objek per perangkat. `map` (Modul 16) mengubah setiap isinya menjadi sesuatu yang lain. Tambahkan di paling bawah:

```js
// 2. Dari array menjadi daftar: map
const daftar = [
  { device_id: "a4cf12e5b7c0", nama: "Node 1 ruang tamu", status: "online" },
  { device_id: "246f28b1c7d4", nama: "Node 2 kebun", status: "online" },
  { device_id: "f00d00000001", nama: "Latihan ruang tamu", status: "belum-diketahui" },
];
const baris = daftar.map((p) => `${p.nama} (${p.status})`); // satu objek masuk, satu baris teks keluar
console.log(baris);
console.log(daftar.map((p) => p.device_id).join(", ")); // device_id unik: nanti jadi key di React
```

Simpan, lalu jalankan `node pemanasan.js` lagi. **Hasilnya** (baris baru):

```text
[
  'Node 1 ruang tamu (online)',
  'Node 2 kebun (online)',
  'Latihan ruang tamu (belum-diketahui)'
]
a4cf12e5b7c0, 246f28b1c7d4, f00d00000001
```

**`map`** memanggil fungsi panahnya sekali per perangkat dan menghasilkan *array* baru yang sama panjang; `daftar` tidak berubah. **`.join(", ")`** menyambung isi *array* menjadi satu teks.

**Nanti di React:** `DaftarPerangkat` (Praktik 5) memakai `perangkat.map` untuk membuat satu `<li>` per perangkat; `DetailPerangkat` (Praktik 6) memakai `kartu.map` untuk memasang `KartuSensor`. Setiap butir hasil `map` wajib membawa **`key`** yang unik dan tetap (Konsep 5): `key={p.device_id}`.

### Langkah 3 — Memilih yang ditampilkan: `? :`, `&&`, dan `??`

Layar dashboard terus memilih: angka atau "—"? Kotak galat atau tidak? Pilihannya sering menyangkut `null`, tanda bacaan gagal (aturan 7 kontrak data). Tambahkan:

```js
// 3. Memilih yang ditampilkan: ? :, &&, dan ??
const gagal = { suhu: null, kelembapan: null, cahaya: 2310, tanah: 0, gerak: true, level_air: null }; // aturan 7: gagal = null
console.log("Suhu:", gagal.suhu ?? "—"); // ?? mengganti null (dan undefined) dengan "—"
console.log("Tanah:", gagal.tanah ?? "—", "bukan", gagal.tanah || "—"); // || ikut mengganti 0, padahal 0 % itu bacaan sah
console.log(gagal.gerak ? "Ada gerakan" : "Tidak ada gerakan"); // ? : memilih satu dari dua
const galat = "Tidak bisa menghubungi server";
console.log(galat && `Kotak merah: ${galat}`); // && : kalau kiri berisi, hasilnya bagian kanan
const tanpaGalat = null;
console.log(tanpaGalat && `Kotak merah: ${tanpaGalat}`); // kalau kiri null, berhenti di kiri (React tidak menggambar apa pun)
```

**Hasilnya** (baris baru):

```text
Suhu: —
Tanah: 0 bukan —
Ada gerakan
Kotak merah: Tidak bisa menghubungi server
null
```

- **`a ?? b`**: pakai `a`, kecuali `a` bernilai `null` atau `undefined` (Modul 17).
- **`a || b`** ikut mengganti `0`, padahal tanah 0 % bacaan sah (lihat `Tanah: 0 bukan —`).
- **`syarat ? a : b`**: `a` kalau benar, `b` kalau tidak.
- **`a && b`**: kalau `a` berisi, hasilnya `b`; kalau kosong (bagi `&&` dan `||`: `null`, `undefined`, `false`, `0`, teks kosong), hasilnya `a` itu sendiri, makanya `null`.

**Nanti di React:** semuanya dipakai di kurung kurawal JSX (Konsep 5): `KartuSensor` menulis `{nilai ?? "—"}` supaya `0` tetap tampil, dan tombol *login* menulis `sibuk ? "Sedang masuk…" : "Masuk"`. Awas: angka `0` di kiri `&&` ikut tergambar di layar.

### Langkah 4 — Menyalin sambil mengubah: *spread* `...`

*State*, papan tulis komponen, tidak pernah dicoret langsung; kalau berubah, kamu menyerahkan papan **baru** (Konsep 7). Alatnya ***spread*** `...` (Modul 17). Contohnya keadaan aktuator Node 1 (kolom `state`, Lampiran A). Tambahkan:

```js
// 4. Menyalin sambil mengubah: spread ...
const keadaanLama = { kipas: false, lampu: true, pompa: false, tirai: 90 };
const keadaanBaru = { ...keadaanLama, kipas: true }; // salinan baru, satu kolom diganti
console.log(keadaanLama.kipas, keadaanBaru.kipas); // yang lama tidak berubah
console.log(keadaanLama === keadaanBaru); // false: dua objek berbeda, jadi React tahu ada yang baru
const daftarBaru = [...daftar, { device_id: "c0ba00000001", nama: null, status: "belum-diketahui" }];
console.log(daftar.length, daftarBaru.length);
```

**Hasilnya** (baris baru):

```text
false true
false
3 4
```

- **`{ ...keadaanLama, kipas: true }`** menuang keempat kolom ke objek baru, lalu `kipas: true` menimpanya. Yang lama tetap `false`.
- **`===` pada objek** bertanya "objek yang sama persis?", bukan membandingkan isi; salinan *spread* selalu objek lain.
- **`[...daftar, …]`** membuat *array* baru: tiga perangkat lama plus satu.

**Nanti di React:** *spread* menjamin papanmu objek baru, jadi React tahu ada yang berubah. `minta()` di `src/api.ts` (Praktik 4) juga memakainya: `{ credentials: "include", ...opsi }` selalu membawa `credentials: "include"` plus pilihan tiap permintaan, misalnya `method: "POST"`.

### Langkah 5 — Bertanya ke backend: `fetch`, `res.ok`, dan `try`/`catch`

Semua data dashboard datang lewat `fetch` (Modul 16). Kali ini kamu bertanya ke backend v1.0 buatanmu di **`GET /health`**, pintu yang terbuka tanpa *login* sejak Modul 20.

**Nyalakan backend dulu.** Dengan Docker Desktop menyala, buka `rumah-pintar-mini` di jendela VS Code kedua (**File → New Window**), lalu di terminalnya ketik `cd backend` dan `npm run dev` seperti di Modul 21. Biarkan menyala, lalu tambahkan di paling bawah `pemanasan.js`:

```js
// 5. Bertanya ke backend: fetch, res.ok, dan try/catch
// GET /health terbuka tanpa login. Di Node tidak ada CORS: aturan itu milik browser (Konsep 9).
try {
  const res = await fetch("http://127.0.0.1:8080/health");
  if (!res.ok) {
    console.log("Backend menjawab, tetapi dengan kode", res.status); // fetch TIDAK melempar galat untuk 404 atau 500
  } else {
    const kesehatan = await res.json();
    console.log("Backend hidup:", kesehatan.ok, "| broker:", kesehatan.broker, "| database:", kesehatan.database);
  }
} catch (err) {
  // fetch melempar galat hanya kalau server sama sekali tidak bisa dihubungi (mati atau salah alamat)
  console.log("Backend tidak bisa dihubungi. Nyalakan dulu dengan npm run dev di folder backend.");
  console.log("Rincian:", err.cause?.code ?? err.message);
}
```

Jalankan `node pemanasan.js` lagi di jendela `belajar-iot`. **Hasilnya** (baris baru, backend menyala):

```text
Backend hidup: true | broker: true | database: true
```

- **`await`** menunggu janji (*Promise*) `fetch` sampai jawaban datang; boleh di luar fungsi karena berkasnya modul. Kalau Node.js menolak `await` ini, `npm pkg set type=module` terlewat: jalankan di folder `modul-22`, lalu coba lagi.
- **`res.ok`** hanya `true` untuk status 200–299. **`fetch` melempar galat hanya kalau backend tak bisa dihubungi** (ditangkap `catch`, Modul 17), tidak untuk 401, 404, atau 500, jadi memeriksa `res.ok` tugasmu. `res.json()` membaca isinya menjadi objek.
- **Di Node.js tidak ada CORS.** CORS aturan browser; Node.js, Bruno, dan curl tidak memedulikannya (Modul 20 Konsep 9). Dashboard di browser nanti tunduk pada CORS dan mengetuk `localhost`, bukan `127.0.0.1` (Konsep 9).

Nilai `false` pada `broker` atau `database` berarti backend hidup tetapi belum tersambung; untuk pemanasan, tidak masalah.

**Sekarang coba jalur gagalnya.** Hentikan backend (**Ctrl + C** di terminalnya), lalu jalankan `node pemanasan.js` lagi di jendela `belajar-iot`. **Hasilnya** (menggantikan baris `Backend hidup`):

```text
Backend tidak bisa dihubungi. Nyalakan dulu dengan npm run dev di folder backend.
Rincian: ECONNREFUSED
```

`ECONNREFUSED` (sambungan ditolak): tak ada program yang mendengarkan di pintu 8080. `err.cause?.code` membacanya dengan aman: `?.` berhenti tanpa galat kalau `cause` tidak ada, lalu `??` memakai `err.message`. Backend boleh dibiarkan mati sampai Praktik 4.

**Nanti di React:** `minta()` di `src/api.ts` (Praktik 4) adalah versi dewasa langkah ini: `fetch` di dalam `try`/`catch` (gagal total menjadi `GalatApi` berkode 0), lalu `if (!res.ok) {` (`GalatApi` berkode HTTP), baru `res.json()`; mulai Praktik 6 ia mencoba *refresh* sekali saat 401. Bedanya, ia berjalan di **browser** dari `http://localhost:5173`, membawa gelang (`credentials: "include"`), dan tunduk pada CORS. Jawaban yang ditahan CORS juga membuat `fetch` gagal total, dan JavaScript tidak diberi tahu bedanya dengan backend mati; karena itu, periksa tab **Console** DevTools lebih dulu (Konsep 9, 🚨).

Kalau keluaranmu berbeda, cocokkan ketikanmu dengan [kode/pemanasan/pemanasan.js](kode/pemanasan/pemanasan.js).

<details>
<summary>Isi lengkap <code>pemanasan.js</code></summary>

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 22
// Lima kemampuan kecil yang nanti dipakai lagi di komponen React dashboard.

// 1. Objek bacaan dan destrukturisasi
const bacaan = {
  device_id: "a4cf12e5b7c0",
  telemetry: { ts: "2026-10-23T09:41:30Z", fw: "1.5.0", suhu: 28.5, kelembapan: 71, cahaya: 3094, tanah: 37, gerak: false, level_air: 52 },
};
const { suhu, kelembapan } = bacaan.telemetry; // ambil dua kolom sekaligus ke variabel bernama sama
console.log("Suhu:", suhu, "°C, kelembapan:", kelembapan, "%");
// destrukturisasi juga bisa langsung di parameter fungsi, persis cara komponen React menerima props
function kartu({ label, nilai, satuan }) {
  return `${label}: ${nilai} ${satuan}`;
}
console.log(kartu({ label: "Suhu", nilai: suhu, satuan: "°C" }));

// 2. Dari array menjadi daftar: map
const daftar = [
  { device_id: "a4cf12e5b7c0", nama: "Node 1 ruang tamu", status: "online" },
  { device_id: "246f28b1c7d4", nama: "Node 2 kebun", status: "online" },
  { device_id: "f00d00000001", nama: "Latihan ruang tamu", status: "belum-diketahui" },
];
const baris = daftar.map((p) => `${p.nama} (${p.status})`); // satu objek masuk, satu baris teks keluar
console.log(baris);
console.log(daftar.map((p) => p.device_id).join(", ")); // device_id unik: nanti jadi key di React

// 3. Memilih yang ditampilkan: ? :, &&, dan ??
const gagal = { suhu: null, kelembapan: null, cahaya: 2310, tanah: 0, gerak: true, level_air: null }; // aturan 7: gagal = null
console.log("Suhu:", gagal.suhu ?? "—"); // ?? mengganti null (dan undefined) dengan "—"
console.log("Tanah:", gagal.tanah ?? "—", "bukan", gagal.tanah || "—"); // || ikut mengganti 0, padahal 0 % itu bacaan sah
console.log(gagal.gerak ? "Ada gerakan" : "Tidak ada gerakan"); // ? : memilih satu dari dua
const galat = "Tidak bisa menghubungi server";
console.log(galat && `Kotak merah: ${galat}`); // && : kalau kiri berisi, hasilnya bagian kanan
const tanpaGalat = null;
console.log(tanpaGalat && `Kotak merah: ${tanpaGalat}`); // kalau kiri null, berhenti di kiri (React tidak menggambar apa pun)

// 4. Menyalin sambil mengubah: spread ...
const keadaanLama = { kipas: false, lampu: true, pompa: false, tirai: 90 };
const keadaanBaru = { ...keadaanLama, kipas: true }; // salinan baru, satu kolom diganti
console.log(keadaanLama.kipas, keadaanBaru.kipas); // yang lama tidak berubah
console.log(keadaanLama === keadaanBaru); // false: dua objek berbeda, jadi React tahu ada yang baru
const daftarBaru = [...daftar, { device_id: "c0ba00000001", nama: null, status: "belum-diketahui" }];
console.log(daftar.length, daftarBaru.length);

// 5. Bertanya ke backend: fetch, res.ok, dan try/catch
// GET /health terbuka tanpa login. Di Node tidak ada CORS: aturan itu milik browser (Konsep 9).
try {
  const res = await fetch("http://127.0.0.1:8080/health");
  if (!res.ok) {
    console.log("Backend menjawab, tetapi dengan kode", res.status); // fetch TIDAK melempar galat untuk 404 atau 500
  } else {
    const kesehatan = await res.json();
    console.log("Backend hidup:", kesehatan.ok, "| broker:", kesehatan.broker, "| database:", kesehatan.database);
  }
} catch (err) {
  // fetch melempar galat hanya kalau server sama sekali tidak bisa dihubungi (mati atau salah alamat)
  console.log("Backend tidak bisa dihubungi. Nyalakan dulu dengan npm run dev di folder backend.");
  console.log("Rincian:", err.cause?.code ?? err.message);
}
```

</details>

<details>
<summary>Kunci uji dirimu</summary>

1. **Apa hasil `kartu({ label: "Cahaya", nilai: 3094 })`, dan mengapa kartu Gerakan tidak bernasib sama?** `Cahaya: 3094 undefined`, karena `satuan` tidak diserahkan. `KartuSensor` menandai `satuan?: string` (boleh tidak diisi) dan menulisnya hanya kalau `satuan && nilai !== null`, jadi kartu Gerakan (tanpa `satuan`, Praktik 3) cukup menulis `Ada` atau `Tidak ada`.
2. **Mengapa `key` daftar perangkat diambil dari `device_id`, bukan `nama`?** `nama` diketik manusia: boleh `null` (seperti `c0ba00000001`) dan bisa kembar. `key` harus unik dan tidak berubah (Konsep 5).
3. **Apa hasil `gagal.tanah && "Tanah terbaca"`, dan akibatnya di JSX?** `0`, karena bagi `&&` angka `0` termasuk kosong. React tidak menggambar `null`, tetapi `0` **tetap digambar** di layar. Jangan taruh angka di kiri `&&` (Konsep 5); tulis `gagal.tanah !== null` atau pakai `? :`.
4. **Temanmu menulis `const salinan = keadaanLama;` lalu `salinan.kipas = true;`. Apa yang dicetak `console.log(keadaanLama.kipas, salinan === keadaanLama)`, dan mengapa salah untuk *state*?** `true true`: `salinan` hanya nama kedua untuk objek yang sama. Itulah "mencoret papan" (Konsep 7): React melihat objek yang sama dan tidak menggambar ulang layar. Yang benar: `{ ...keadaanLama, kipas: true }`.
5. **Ganti `/health` dengan `/devices`, lalu jalankan dengan backend menyala. Apa yang dicetak, dan apa yang kurang?** `Backend menjawab, tetapi dengan kode 401`: `catch` tidak terpanggil, tetapi `res.ok` bernilai `false`. Yang kurang adalah gelang, karena `GET /devices` dijaga satpam sejak Modul 20. Di dashboard, *login* (Praktik 4) membuat backend memasang gelang, dan `credentials: "include"` membuat browser melampirkannya (Konsep 9). Kembalikan alamatnya ke `/health`.

</details>

## 🏆 Kemenangan Cepat: kartu sensor pertamamu di browser (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `belajar-iot/modul-22` (sama dengan pemanasan) dan browser **Google Chrome** atau **Microsoft Edge** beserta DevTools-nya. Backend tidak perlu menyala.

Sebelum bertemu Vite, React, dan TypeScript, buktikan dulu bahwa halaman web tidak butuh apa-apa selain editor teks dan browser. Kamu menulis satu **kartu sensor** dengan tangan (label, angka suhu, dan satuannya), seperti satu kartu di dashboard minggu ini.

### Langkah 1 — Tulis kerangkanya: `kartu.html` (5 menit)

Di VS Code, klik kanan folder **`modul-22`** di panel Explorer → **New File…**, beri nama **`kartu.html`**, lalu ketik isinya. (Kalau kamu melewatkan pemanasan, buat dulu folder `modul-22` di dalam `belajar-iot`.)

```html
<!DOCTYPE html>
<!--
  kartu.html - Kemenangan Cepat Modul 22: kartu sensor pertamamu, ditulis dengan tangan.
  Tanpa memasang apa pun: simpan berkas ini, lalu buka dengan klik dua kali.
  Langkah 1 menulis KERANGKA (HTML), langkah 3 menambah KULIT (CSS di dalam <style>).
-->
<html lang="id">
<head>
  <meta charset="utf-8"> <!-- huruf disimpan sebagai UTF-8: tanda derajat tampil benar -->
  <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- tampil pas di layar HP -->
  <title>Kartu sensor</title> <!-- teks di tab browser -->
</head>
<body>
  <!-- Langkah 1: KERANGKA. Satu kartu berisi label, angka, dan satuan. -->
  <div class="kartu">
    <p class="label">Suhu ruang tamu</p>
    <p class="nilai">28.5<span class="satuan">°C</span></p>
    <p class="keterangan">Node 1 · angka contoh, belum dari sensor</p>
  </div>
</body>
</html>
```

Simpan (**Ctrl + S**). Inilah **kerangka** (HTML), bagian apa saja yang ada dan urutannya (rinciannya di Konsep 1):

- **`<!-- … -->`** adalah komentar: catatan untuk manusia yang tidak tampil, seperti `//` di JavaScript.
- **`<head>`** berisi keterangan untuk browser yang tidak tampil di halaman (gunanya tertulis di komentar ujung barisnya). `<html lang="id">` menandai halaman berbahasa Indonesia.
- **`<body>`** berisi semua yang tampil: **`<div>`**, kotak pembungkus satu kartu; tiga **`<p>`** (paragraf); dan **`<span>`**, potongan kecil di dalam baris yang membungkus `°C` supaya bisa diberi rupa sendiri.
- **`class="…"`** memberi nama yang dipakai kulit di langkah 3 untuk menemukan elemen. `label`, `nilai`, dan `satuan` sengaja sama dengan nama titipan (*props*) `KartuSensor`, komponen yang menulis ulang kartu ini di Praktik 3.
- Angka **`28.5`** memakai titik, bukan koma, seperti angka di JSON backend.

> [!TIP]
> Tanda `°` dan `·` tidak ada di papan ketik, jadi salin saja baris-baris itu; selebihnya ketik sendiri. VS Code sering menambahkan *tag* penutup sendiri (misalnya `</p>`); cocokkan berkasmu dengan kode di atas agar penutupnya tidak dobel.

### Langkah 2 — Buka dengan klik dua kali (3 menit)

Klik kanan `kartu.html` di panel Explorer → **Reveal in File Explorer** (macOS: **Reveal in Finder**), lalu klik dua kali `kartu.html` di jendela folder itu (Windows biasanya menampilkannya sebagai `kartu` berikon browser, tanpa `.html`). Kalau yang terbuka bukan Chrome atau Edge, seret berkasnya ke jendela salah satunya.

**Hasilnya:** tab browser bertuliskan `Kartu sensor`, dan halamannya berisi tiga baris tulisan hitam polos di latar putih, yaitu `Suhu ruang tamu`, `28.5°C`, dan `Node 1 · angka contoh, belum dari sensor`, dengan huruf berkait dan jarak antarparagraf bawaan browser.

Belum ada kartu: tanpa kulit, `<div class="kartu">` tidak bergaris, tidak berwarna, dan selebar halaman. Itulah **gaya bawaan browser**. Browser membaca berkasnya langsung, tanpa paket, server, atau internet. Biarkan tab itu terbuka.

### Langkah 3 — Beri kulit dengan `<style>` (7 menit)

Kembali ke VS Code. Klik di ujung baris `<title>`, tekan **Enter** dua kali (satu baris kosong), lalu ketik blok **kulit** tepat sebelum `</head>`, dari komentar `<!-- Langkah 3: KULIT …` sampai `</style>`. Selain blok itu, berkas utuh di bawah ini sama dengan kerangkamu:

```html
<!DOCTYPE html>
<!--
  kartu.html - Kemenangan Cepat Modul 22: kartu sensor pertamamu, ditulis dengan tangan.
  Tanpa memasang apa pun: simpan berkas ini, lalu buka dengan klik dua kali.
  Langkah 1 menulis KERANGKA (HTML), langkah 3 menambah KULIT (CSS di dalam <style>).
-->
<html lang="id">
<head>
  <meta charset="utf-8"> <!-- huruf disimpan sebagai UTF-8: tanda derajat tampil benar -->
  <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- tampil pas di layar HP -->
  <title>Kartu sensor</title> <!-- teks di tab browser -->

  <!-- Langkah 3: KULIT. Setiap aturan berlaku untuk elemen dengan nama class yang sama.
       Warna-warnanya hampir sama dengan warna Tailwind (slate dan teal) yang kita pakai di dashboard nanti. -->
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 24px;
      background: #f1f5f9; /* slate-100 */
    }
    .kartu {
      max-width: 220px;
      padding: 16px;
      background: white;
      border: 1px solid #e2e8f0; /* slate-200 */
      border-radius: 12px; /* sudut membulat */
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* bayangan tipis */
    }
    .label {
      margin: 0;
      font-size: 14px;
      color: #64748b; /* slate-500 */
    }
    .nilai {
      margin: 4px 0 0;
      font-size: 32px;
      font-weight: 600; /* setengah tebal */
      color: #0d9488; /* teal-600 */
    }
    .satuan {
      margin-left: 4px;
      font-size: 16px;
      font-weight: normal;
      color: #94a3b8; /* slate-400 */
    }
    .keterangan {
      margin: 8px 0 0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <!-- Langkah 1: KERANGKA. Satu kartu berisi label, angka, dan satuan. -->
  <div class="kartu">
    <p class="label">Suhu ruang tamu</p>
    <p class="nilai">28.5<span class="satuan">°C</span></p>
    <p class="keterangan">Node 1 · angka contoh, belum dari sensor</p>
  </div>
</body>
</html>
```

VS Code bisa menambah `</style>` atau `}` sendiri; jangan sampai dobel. Kalau ragu, ganti saja seluruh isi berkasmu dengan kode di atas.

Ini **kulit** (CSS). Setiap aturan berisi penunjuk elemen (***selector***), lalu daftar `properti: nilai;` di dalam kurung kurawal:

- **`body`** (tanpa titik) berlaku untuk `<body>`: huruf tanpa kait, jarak 24 px dari tepi layar, dan latar abu-abu sangat muda.
- **`.kartu`** (dengan titik) berarti "elemen yang punya `class="kartu"`": paling lebar 220 px (tanpa `max-width`, `<div>` selebar halaman), jarak 16 px dari isi ke tepi (`padding`), latar putih, garis tepi (`border`), sudut membulat (`border-radius`), dan bayangan tipis (`box-shadow`).
- **`.label`, `.nilai`, `.satuan`, dan `.keterangan`** mengatur ukuran (`font-size`), ketebalan (`font-weight`), dan warna (`color`) huruf, serta jarak (`margin`). `margin: 0` menghapus jarak bawaan `<p>`; `margin: 4px 0 0` berarti 4 px di atas saja.
- `<span class="satuan">` ada **di dalam** `<p class="nilai">`, jadi ia mewarisi huruf besar, tebal, dan berwarna induknya; `.satuan` mengembalikannya kecil, tidak tebal, dan abu-abu.
- **`#0d9488`** adalah kode warna heksadesimal (campuran merah, hijau, dan biru). Komentar CSS diapit `/*` dan `*/`; `/* teal-600 */` menyebut warna yang hampir sama di palet **Tailwind**. [Konsep 3](#3-tailwind-css-v4-kulit-dari-kelas-kelas-kecil) menunjukkan cara Tailwind meringkas aturan ini menjadi deretan kelas pendek.

Simpan (**Ctrl + S**), pindah ke browser, lalu muat ulang dengan **F5** (macOS: **Cmd + R**).

**Hasilnya:** tulisan polos tadi menjadi kartu putih bersudut membulat, bergaris tepi tipis, dan berbayang tipis di atas latar abu-abu muda, tidak lagi selebar layar. `Suhu ruang tamu` kecil dan abu-abu; `28.5` besar, setengah tebal, dan hijau toska (*teal*), diikuti `°C` yang lebih kecil dan abu-abu; keterangan paling kecil, terlipat dua baris karena isi kartu paling lebar 220 px.

> [!NOTE]
> **Kalau tampilannya tidak berubah**, pastikan berkasnya tersimpan (bulatan ● di tab VS Code berarti belum), halamannya dimuat ulang (**F5**), dan nama kelas sama persis dengan di kerangka, termasuk huruf besar-kecilnya (`.nilai` tidak cocok dengan `class="Nilai"`). Kalau hanya sebagian yang berubah, cari `{` atau `}` yang hilang atau dobel di dekat aturan pertama yang tidak berefek.

### Langkah 4 — Ubah angkanya lewat DevTools (5 menit)

Sekarang ubah angkanya **tanpa** menyentuh berkasnya.

1. Di halaman kartu, klik kanan tepat di angka `28.5` → **Inspect** (versi Indonesia: Chrome **Inspeksi**, Edge **Periksa**). DevTools terbuka di tab **Elements**, dengan baris `<p class="nilai">` tersorot. (**F12**, macOS **Cmd + Option + I**, membuka DevTools tanpa sorotan itu.)
2. Baris itu masih tertutup. Klik segitiga kecil di sebelah kirinya; di bawahnya muncul teks `28.5` dan baris `<span class="satuan">°C</span>`.
3. Klik dua kali teks `28.5` di tab **Elements** sampai teks itu bisa diubah. Hapus `28.5`, ketik `31.0`, lalu tekan **Enter**.

**Hasilnya:** angka di kartu langsung menjadi `31.0°C`, padahal `kartu.html` tidak kamu sentuh.

Coba juga ubah kulitnya. Klik sekali baris `<p class="nilai">` supaya terpilih, lalu cari aturan `.nilai` di bagian **Styles** (di samping atau di bawah pohon elemen). Klik nilai `#0d9488` di baris `color`, ketik `red`, lalu tekan **Enter**: angkanya berubah merah. DevTools lalu membuka baris kosong untuk properti baru; tekan **Esc** untuk menutupnya.

Sekarang muat ulang halaman dengan **F5** (macOS: **Cmd + R**).

**Hasilnya:** angkanya kembali `28.5` berwarna hijau toska. Semua ubahan di DevTools hilang, dan `kartu.html` di VS Code tetap utuh.

Mengapa? DevTools mengubah **salinan halaman** yang sedang tampil (oleh [Konsep 2](#2-browser-dan-devtools-membedah-sakelar-modul-10) dinamai **DOM**), bukan berkasnya. Saat dimuat ulang, browser membaca `kartu.html` lagi dan membangun salinan baru. Jadi, DevTools adalah meja bedah yang aman: tidak ada yang tersimpan.

Tutup DevTools dengan **F12** (macOS: **Cmd + Option + I**) atau tombol **×** di pojoknya, dan biarkan `kartu.html` di folder `modul-22`.

Dalam 20 menit, kamu sudah menulis dua dari tiga lapis halaman web: **kerangka** (HTML) dan **kulit** (CSS). Namun, `28.5` itu **angka mati**, ditulis tangan, bukan bacaan Node 1 sungguhan. Dashboard butuh halaman yang mengambil bacaan terbaru dari backend lalu menuliskannya sendiri ke layar. **Angkanya kembali saat dimuat ulang: itulah alasan kita butuh JavaScript, lapis ketiga yang belum ada di kartu ini, dan React yang membantunya.**

> ➡️ **Berikutnya:** baca [Konsep 1–2](#1-halaman-web-html-kerangka-css-kulit-javascript-otot), lalu kerjakan [Praktik 1 — HTML, CSS, dan JavaScript dengan tangan: membedah halaman Modul 10](#praktik-1--html-css-dan-javascript-dengan-tangan-membedah-halaman-modul-10-60-menit).

## 🧠 Konsep "Mengapa"

Sebelas konsep ini tidak perlu dibaca sekaligus. Bacalah berpasangan dengan praktiknya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–2 → Praktik 1 (HTML, CSS, dan JavaScript dengan tangan)
2. Konsep 3–4 → Praktik 2 (proyek Vite pertama)
3. Konsep 5–6 → Praktik 3 (komponen pertama, `KartuSensor`)
4. Konsep 7 dan 9 → Praktik 4 (*state* dan formulir *login*)
5. Konsep 8 dan 10 → Praktik 5 (siapa saya dan daftar perangkat) dan Praktik 6 (detail perangkat)
6. Konsep 11 → Praktik 7 (rapi di layar HP) dan Praktik 8 (uji kelulusan)

Konsep 9 dibaca **sebelum** Konsep 8, karena formulir *login* dibuat lebih dulu. Potongan kode di bagian konsep cukup dibaca; semuanya ditulis dan dijalankan di praktik.

### 1. Halaman web: HTML kerangka, CSS kulit, JavaScript otot

Semua halaman web, dari sakelar Node 1 di Modul 10 sampai dashboard minggu ini, tersusun dari **tiga bahasa** dengan tugasnya masing-masing. Silabus meminjam tiga kata dari tubuh manusia untuk mengingatnya, dan rumah membantu membayangkannya:

| Lapis | Bahasa | Tugasnya | Di rumah | Contoh |
| :--- | :--- | :--- | :--- | :--- |
| **Kerangka** | HTML | bagian apa saja yang ada dan urutannya: judul, paragraf, tautan, tombol | rangka, tiang, ruangan | `<h2>Node 1 Rumah</h2>` |
| **Kulit** | CSS | rupa dan letak: warna, ukuran huruf, jarak | cat, keramik, letak perabot | `font-size: 20px;` |
| **Otot** | JavaScript | reaksi dan data: tulisan berubah saat tombol diklik, data diambil dari backend | listrik yang menyalakan lampu saat sakelar ditekan | "saat tombol diklik, ganti `PADAM` menjadi `MENYALA`" |

![Diagram tiga lapis halaman web dengan contoh halaman Node 1 Modul 10 (jaringan.cpp baris 80–97). Kiri atas, kotak kode berjudul Kode halamannya, persis seperti di Modul 10 (tanpa pembungkus C++), dikirim ESP32 setiap kali browser meminta /, /on, atau /off. Isinya 18 baris bernomor 80 sampai 97: DOCTYPE html, tag html, head, meta charset utf-8, meta viewport, title Node 1 Rumah, body dengan atribut style font-family: sans-serif; font-size: 20px; padding: 16px, h2 Node 1 Rumah, paragraf Lampu dengan penanda %LAMPU% yang ditebalkan, tautan /on Nyalakan lampu, tautan /off Matikan lampu, baris Suhu %SUHU% derajat C, kelembapan %LEMBAP% persen, Cahaya %CAHAYA%, tanah %TANAH% persen, Air tandon %AIR% persen, dan teks kecil Firmware %FW%, %JAM%. Atribut style disorot ungu dan ditandai nomor 2, delapan penanda persen diberi kotak putih dan ditandai nomor 3, dan baris tautan ditandai nomor 1. Keterangannya: 1 kerangka, hampir semua baris, tidak ada tag script sama sekali; 2 satu-satunya CSS, atribut style di body; 3 penanda persen, diisi ESP32 sebelum halaman dikirim. Kiri bawah, Yang tampil di browser HP, angka contoh sama dengan ilustrasi Modul 10: bilah alamat node1.local/off, judul tebal Node 1 Rumah, Lampu: PADAM, dua tautan biru bergaris bawah Nyalakan lampu dan Matikan lampu, Suhu 28.4 °C, kelembapan 71 %, Cahaya 2310, tanah 37 %, Air tandon 64 %, dan Firmware 1.1.0, 17-10-2026 08:32 WIB. Catatan di sampingnya: judul tebal dan jarak antarbaris adalah gaya bawaan browser; tautan biru bergaris bawah juga gaya bawaan; ketuk Nyalakan lampu sama dengan GET /on, dan ESP32 mengirim seluruh halaman baru. Kanan, tiga kartu ungu bernomor. Kartu 1, HTML = kerangka, rangka rumah: menentukan isi dan susunannya, yaitu judul, paragraf, tautan; contoh tag h2 judul, p paragraf, a href tautan, b tebal; elemen adalah tag pembuka, isi, dan tag penutup, sedangkan atribut adalah keterangan tambahan di tag pembuka, misalnya href=/on; di halaman Modul 10 hampir seluruh 18 barisnya kerangka; mulai Modul 22 kerangka ditulis sebagai JSX di dalam komponen React. Kartu 2, CSS = kulit, cat dan dinding: menentukan rupa, yaitu huruf, ukuran, warna, jarak, dan tata letak; di halaman Modul 10 hanya satu atribut style di body, berisi font-family: sans-serif; font-size: 20px; padding: 16px; sisanya gaya bawaan browser, seperti judul tebal dan tautan biru; mulai Modul 22 dipakai blok style dan kelas (Praktik 1), lalu kelas Tailwind yang pendek, misalnya rounded-xl p-4 text-2xl (Konsep 3); tanpa kulit pun halaman tetap tampil, hanya polos. Kartu 3, JavaScript = otot, listrik dan sakelar: membuat halaman bergerak, mengubah sebagian isi tanpa memuat ulang; di halaman Modul 10 tidak ada tag script sama sekali, ototnya ada di ESP32 (C++), bukan di browser: server.on untuk /on berarti ketukan sama dengan permintaan GET /on, html.replace untuk %LAMPU% menjadi MENYALA mengisi penanda, lalu seluruh halaman dikirim ulang ke browser; mulai Modul 22 otot pindah ke browser lewat addEventListener dan textContent (Praktik 1), lalu React menggambar ulang bagian yang berubah (Konsep 7). Bawah, dua kotak pembanding. Kiri: Modul 10, setiap ketukan sama dengan halaman baru; ketuk Nyalakan lampu, lalu GET /on, ESP32 mengisi penanda, lalu seluruh halaman dikirim ulang dan bilah alamat berakhiran /on. Kanan, ungu: mulai Modul 22, halaman tetap, bagiannya berubah; di Praktik 1 tombol mengubah tulisan Lampu tanpa memuat ulang, dan lampu sungguhan tidak ikut bergerak (kendali di Modul 24).](aset/halaman-tiga-lapis.png)

`kartu.html` di Kemenangan Cepat baru punya dua lapis: kerangka dan kulit. Angkanya angka mati. Supaya layar selalu menampilkan bacaan terbaru, halaman butuh otot yang mengambil data dari backend lalu menuliskannya ke layar. Itulah tugas JavaScript, dan React membantunya.

**Kerangka: *tag*, elemen, dan atribut.** HTML ditulis dengan ***tag***, yaitu nama yang diapit kurung sudut `< >`. Ambil satu baris dari halaman sakelar Modul 10:

```html
<a href="/on">Nyalakan lampu</a>
```

- **`<a …>`** adalah *tag* pembuka dan **`</a>`** *tag* penutupnya (perhatikan garis miringnya). Huruf `a` (*anchor*) berarti tautan. **`Nyalakan lampu`** adalah isinya, yaitu tulisan yang tampil di layar.
- **`href="/on"`** adalah **atribut**: keterangan tambahan di dalam *tag* pembuka, selalu berbentuk `nama="nilai"`, di sini alamat tujuan tautan. Dua atribut lain yang sering muncul: `id` (nama unik untuk satu elemen) dan `class` (nama kelompok yang boleh dipasang di banyak elemen).
- Semuanya, dari *tag* pembuka sampai *tag* penutup, disebut satu **elemen**. Elemen tanpa isi, seperti `<br>` dan `<meta …>`, tak punya penutup. Elemen bisa bersarang: `<p><a href="/on">Nyalakan lampu</a></p>` adalah tautan **di dalam** paragraf, sehingga seluruh halaman membentuk pohon (Konsep 2).

**Kulit: aturan CSS.** CSS ditulis sebagai **aturan**: ***selector*** yang menunjuk elemen mana yang diberi kulit, lalu daftar `properti: nilai;` di dalam kurung kurawal.

```css
.kartu {               /* selector: semua elemen yang punya class="kartu" */
  padding: 16px;       /* jarak dari isi ke tepi kotak */
  border-radius: 12px; /* sudut membulat */
}
```

Titik di depan `kartu` berarti "kelas bernama `kartu`". Aturan bisa ditaruh di atribut `style` milik satu elemen (cara Modul 10), di blok `<style>` (cara Kemenangan Cepat), atau di berkas `.css` tersendiri (cara proyek Vite, `src/index.css`). Atribut `class` adalah lem antara kerangka dan kulit: kerangka memberi nama, kulit memberi rupa untuk nama itu.

**Otot: JavaScript yang menyentuh halaman.** Di browser, JavaScript yang kamu kenal sejak Modul 4 mendapat kemampuan tambahan: **mencari**, **mendengarkan**, dan **mengubah** elemen di layar (`querySelector`, `addEventListener`, dan `textContent`). Kamu membedah dan mencobanya di Praktik 1.5. Di React, kamu hampir tidak pernah menulisnya lagi, karena React yang mengerjakannya untukmu (Konsep 5).

Ketiganya dipisah supaya setiap lapis bisa diubah tanpa merusak lapis lain. Di React, ketiganya tinggal berdekatan di satu berkas `.tsx` (kerangka sebagai JSX, kulit sebagai kelas Tailwind, otot sebagai fungsi TypeScript), tetapi tugasnya tetap tiga.

### 2. Browser dan DevTools: membedah sakelar Modul 10

Di Modul 10, kamu menjadikan ESP32 **server web**: HP membuka alamat Node 1, lalu Node 1 menjawab dengan sebuah halaman. Versi pertamanya ada di [Praktik 8 Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#praktik-8--sakelar-lampu-dari-hp-20-menit). Kakaknya, halaman **Node 1 v1.1** dari [➕ F "Matikan lampu dari HP"](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#f--matikan-lampu-dari-hp), tersimpan di firmware sebagai teks bernama `HALAMAN`, di `jaringan.cpp` baris 80–97:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Rumah</title>
</head>
<body style="font-family: sans-serif; font-size: 20px; padding: 16px">
<h2>Node 1 Rumah</h2>
<p>Lampu: <b>%LAMPU%</b></p>
<p><a href="/on">Nyalakan lampu</a></p>
<p><a href="/off">Matikan lampu</a></p>
<p>Suhu %SUHU%&nbsp;&deg;C, kelembapan %LEMBAP%&nbsp;%<br>
Cahaya %CAHAYA%, tanah %TANAH%&nbsp;%<br>
Air tandon %AIR%&nbsp;%</p>
<p><small>Firmware %FW%, %JAM%</small></p>
</body>
</html>
```

Tepat di atas teks itu, firmware menulis komentar `// Halaman siap tempel; tampilan yang cantik menunggu Modul 22.`, dan README Modul 10 berjanji bahwa halaman yang cantik dibuat dengan HTML, CSS, dan React di Modul 22. Janji itu ditepati minggu ini. Bedah dulu isinya:

- **`<!DOCTYPE html>`** menandai HTML modern; **`<html>`** adalah akar. **`<head>`** berisi keterangan yang tidak tampil: `charset="utf-8"` (supaya `°` tampil benar), baris `viewport` (supaya pas selebar layar HP, Konsep 11), dan `<title>` (tulisan di tab browser).
- **`<body>`** berisi yang tampil: `<h2>` judul, `<p>` paragraf, `<b>` huruf tebal, `<br>` pindah baris, `<small>` tulisan kecil. `&nbsp;` adalah spasi yang tidak boleh dipisah baris, dan `&deg;` tanda derajat.
- **`%LAMPU%`, `%SUHU%`, dan kawan-kawannya bukan HTML**, melainkan penanda yang diganti ESP32 lewat `html.replace()` sebelum halaman dikirim.
- Lapisnya: **kerangka** hampir semua baris; **kulit** hanya satu atribut `style` di `<body>` (sisanya gaya bawaan browser, seperti tautan biru bergaris bawah); **otot** tidak ada di browser, karena tinggal di ESP32: `server.on("/on", tanganiOn)` menangani ketukan, dan `html.replace()` mengisi datanya.

**Tautan `/on` adalah permintaan `GET`.** Dua "tombol" itu sebenarnya **tautan biasa**, tanpa formulir dan tanpa JavaScript. Mengetuk **Nyalakan lampu** membuat browser mengirim **`GET /on`**. ESP32 menyalakan relay, lalu mengirim **seluruh halaman** lagi dengan `%LAMPU%` diganti `MENYALA`. Bilah alamat tetap berakhiran `/on`, jadi **memuat ulang halaman itu berarti memerintah lagi**, walau lampunya sudah kamu matikan dengan tombol D13. Padahal `GET` seharusnya hanya meminta data (Modul 16, Konsep 2); akibatnya dibahas di 🔬 Modul 10 "Mengapa tautan `/on` dan `/off` sebenarnya kurang tepat".

Jadi, di Modul 10 **server yang menggambar seluruh halaman** setiap kali diketuk. Dashboard minggu ini terbalik: halaman dimuat **sekali**, lalu **browser** mengambil data dengan `fetch` dan mengganti bagian yang berubah saja. Dashboard v0.1 **hanya menampilkan** lampu dan kipas; tombol kendali sungguhan (lewat `POST`, khusus admin, menunggu `ack`) baru dibuat di Modul 24.

**Dari teks menjadi pohon: DOM.** Browser membaca teks HTML dari atas ke bawah, lalu membangun **pohon elemen** di memorinya, yang disebut **DOM** (*Document Object Model*). Untuk halaman Node 1 yang penandanya sudah diisi, pohonnya kira-kira begini:

```text
html
├── head ── meta, meta, title
└── body
    ├── h2 ── "Node 1 Rumah"
    ├── p ── "Lampu: " + b ── "PADAM"
    ├── p ── a (href="/on") ── "Nyalakan lampu"
    ├── p ── a (href="/off") ── "Matikan lampu"
    ├── p ── "Suhu 28.4 °C, …" + br + …
    └── p ── small ── "Firmware 1.1.0, …"
```

Yang digambar di layar adalah DOM, bukan berkasnya, dan JavaScript serta DevTools pun bekerja pada DOM. Pekerjaan React, pada dasarnya, menjaga agar DOM selalu sesuai dengan data (Konsep 5).

**DevTools: alat bedah bawaan browser.** Chrome dan Edge punya alat pengembang (*developer tools*, DevTools) bawaan. Bukalah dengan **F12** atau **Ctrl + Shift + I** (macOS: **Cmd + Option + I**), atau klik kanan di halaman lalu pilih **Inspect** (versi Indonesia: Chrome **Inspeksi**, Edge **Periksa**). Tiga panel utamanya:

| Panel | Isinya | Dipakai untuk |
| :--- | :--- | :--- |
| **Elements** | pohon DOM, lengkap dengan aturan CSS setiap elemen; bisa diubah langsung, tetapi hanya sementara | membedah kerangka dan kulit (Praktik 1), memeriksa kelas Tailwind |
| **Console** | pesan dan galat JavaScript; kamu juga bisa mengetik JavaScript di sana | membaca galat CORS (Praktik 1) dan galat dari React |
| **Network** | setiap permintaan yang dikirim halaman: alamat, metode, kode status, kepala (*header*), dan isinya | melihat `POST /auth/login`, `GET /devices`, dan kepala CORS-nya (Praktik 4–6) |

Satu kebiasaan untuk panel **Network**: buka DevTools dulu, baru muat ulang halaman, supaya semua permintaan sejak awal ikut tercatat. Panel **Application** (untuk melihat *cookie*, Praktik 4), mode perangkat (untuk meniru layar HP, Konsep 11), dan ekstensi **React DevTools** (Praktik 2) menyusul saat dibutuhkan.

> ⬆️ **Sudah membaca Konsep 1–2?** Lanjut ke [Praktik 1 — HTML, CSS, dan JavaScript dengan tangan: membedah halaman Modul 10](#praktik-1--html-css-dan-javascript-dengan-tangan-membedah-halaman-modul-10-60-menit). Konsep 3–4 dibaca sebelum Praktik 2.

### 3. Tailwind CSS v4: kulit dari kelas-kelas kecil

Dashboard punya formulir, daftar, lencana, belasan kartu, serta tampilan HP dan laptop. Dengan CSS biasa, kamu harus terus mengarang nama kelas dan bolak-balik antara HTML dan CSS.

**Tailwind CSS** menyediakan **kelas kecil siap pakai** (*utility class*), masing-masing untuk **satu** urusan, yang ditulis langsung di elemen yang mau diberi kulit. Bayangkan katalog cat dengan kode baku: kamu tidak meracik warna sendiri, cukup menuliskan kodenya di dinding. Kartu suhu yang dengan CSS biasa butuh aturan `.kartu { … }` tersendiri, dengan Tailwind cukup ditulis `<div class="rounded-xl border border-slate-200 p-4">`. Kamus kecil berikut menghubungkan CSS tulisan tanganmu dengan kelas Tailwind (nilai dari tema bawaan Tailwind 4.3.3):

| CSS biasa | Kelas Tailwind | Nilainya |
| :--- | :--- | :--- |
| `padding: 16px` | `p-4` | 4 × 0,25 rem = 1 rem (16 px) |
| `gap: 12px` | `gap-3` | 3 × 0,25 rem = 0,75 rem (12 px) |
| `border-radius: 12px` | `rounded-xl` | 0,75 rem (12 px) |
| `border: 1px solid …` | `border border-slate-200` | garis 1 px, warna abu-abu muda dari palet Tailwind |
| `font-size: 14px` | `text-sm` | 0,875 rem (14 px) |
| `font-size: 24px; font-weight: 600` | `text-2xl font-semibold` | 1,5 rem (24 px), ketebalan 600 |
| `display: flex; flex-wrap: wrap` | `flex flex-wrap` | — |
| `@media (min-width: 1024px) { … }` | awalan `lg:` | mulai lebar 64 rem (1024 px) |

**rem** mengikuti ukuran huruf dasar browser, yang bawaannya 16 px. Angka di belakang kelas jarak seperti `p-`, `m-`, dan `gap-` dikalikan 0,25 rem, atau 4 px: `p-2` = 8 px, `p-6` = 24 px. Awalan seperti `sm:` dan `lg:` membuat kelas berlaku mulai lebar layar tertentu ([Konsep 11](#11-responsif-satu-halaman-untuk-hp-dan-laptop)).

**Hanya kelas yang kamu tulis yang dibuatkan CSS-nya.** Kelas Tailwind bukan bawaan browser, jadi `class="p-4"` di `kartu.html` tidak berefek apa pun. Di proyek Vite, *plugin* `@tailwindcss/vite` membaca berkas-berkas proyekmu **sebagai teks biasa** saat `npm run dev` dan `npm run build`, lalu membuat CSS **hanya** untuk nama kelas yang ditemukannya. Tailwind tidak menjalankan kode, jadi sambungan seperti `"bg-" + warna + "-100"` tidak pernah dikenalinya sebagai `bg-green-100`. Aturannya: **tulis nama kelas secara utuh**, lalu biarkan kode memilih, seperti `WARNA_STATUS` di `src/components/Lencana.tsx` (Praktik 5), misalnya `online: "bg-green-100 text-green-800"`. Kalau deretan kelas yang sama berulang, jangan disalin: bungkus menjadi satu **komponen**, misalnya `KartuSensor` (Konsep 5).

**Versi 4 tidak butuh `tailwind.config.js`.** Banyak tutorial di internet masih memakai Tailwind v3: `npx tailwindcss init -p`, berkas `tailwind.config.js` dan `postcss.config.js`, serta tiga baris `@tailwind …;`. Di v4, semua itu tidak perlu. Pemasangannya cukup tiga langkah (Praktik 2.4): pasang paket `tailwindcss` dan `@tailwindcss/vite`, tambahkan `tailwindcss()` ke daftar *plugin* di `vite.config.ts`, lalu tulis satu baris `@import "tailwindcss";` di `src/index.css`. Warna atau ukuran sendiri, kalau kelak perlu, ditulis di berkas CSS dengan `@theme`. Daftar lengkap "petunjuk lama → yang benar untuk versi kita" ada di pembuka [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan).

### 4. Vite dan folder `frontend`: dapur pengembangan di `localhost:5173`

Dashboard kita ditulis dengan **TypeScript** (Modul 16), **JSX** (Konsep 5), dan kelas **Tailwind** (Konsep 3), padahal browser hanya mengerti HTML, CSS, dan JavaScript biasa. Yang mengolahnya adalah **Vite**, dengan dua mode kerja seperti dapur restoran:

- **`npm run dev` adalah dapur.** Bahan dimasak saat dipesan. Vite menjalankan ***dev server*** di `http://localhost:5173`, menerjemahkan berkas-berkasmu, dan mengawasi perubahan. Begitu sebuah berkas disimpan, bagian yang berubah langsung diganti di browser tanpa memuat ulang halaman: **HMR** (*Hot Module Replacement*).
- **`npm run build` adalah hidangan siap saji.** Semuanya diperiksa, dimasak, lalu dikemas ke folder **`dist/`**, yang bisa disajikan server web mana pun tanpa Vite.

| Perintah | Isinya di `package.json` | Perumpamaannya | Dipakai di |
| :--- | :--- | :--- | :--- |
| `npm run dev` | `vite` | dapur | Praktik 2–7 |
| `npm run build` | `tsc -b && vite build` | hidangan siap saji di `dist/` | Praktik 2.7, 3 (menangkap salah ketik), dan 8 |
| `npm run preview` | `vite preview` | mencicipi hidangan di laptopmu sendiri; bukan server sungguhan | Praktik 8 |
| `npm run lint` | `oxlint` | pemeriksa kebersihan dapur: mencari kebiasaan buruk di kode | Praktik 8 |

**Mengapa selalu port 5173?** Backend hanya mengizinkan halaman dari asal yang tercantum di `CORS_ORIGIN`, yang sejak Modul 20 berisi `http://localhost:5173,http://127.0.0.1:5173`. Kalau port 5173 terpakai, Vite dengan setelan bawaan pindah sendiri ke port berikutnya, misalnya 5174, dan backend menolak asal baru itu. Karena itu, Praktik 2 menambahkan `server: { port: 5173, strictPort: true }` ke `vite.config.ts`, sehingga Vite **berhenti** dengan pesan galat, bukan pindah. Bukalah selalu alamat yang dicetak Vite, `http://localhost:5173`, bukan `127.0.0.1` seperti kebiasaan Modul 16–21; di laptop Windows penulis, `http://127.0.0.1:5173` bahkan tidak terbuka dengan setelan bawaan Vite. Alasannya, dan mengapa `localhost` penting untuk *cookie*, ada di [Konsep 9](#9-login-dari-browser-cookie-cors-dan-localhost).

**Satu gaya modul untuk Node.js dan browser.** `index.html` di folder `frontend` adalah pintu masuk proyek. Vite membacanya lebih dulu, lalu mengikuti dua baris penting ini:

```html
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
```

- **`<div id="root"></div>`** adalah kotak kosong tempat React menggambar seluruh dashboard: `src/main.tsx` mencarinya dengan `document.getElementById('root')`, lalu menggambar komponen `App` di dalamnya, dibungkus `<StrictMode>` (Konsep 8).
- **`type="module"`** memberi tahu browser bahwa skrip ini memakai `import` dan `export`, yaitu **ES Modules** dari Modul 4. Saat itu, Modul 4 menulis bahwa `import`/`export` "berlaku sama, baik di Node.js maupun di browser (Modul 22)". Buktinya: `main.tsx` mengimpor `App`, lalu `App` mengimpor komponen lain, seperti berkas backend.

**Vite menghapus label tipe, tetapi tidak memeriksanya.** Di Modul 16 (Konsep 4), Node.js 24 menjalankan berkas `.ts` dengan **menghapus label tipenya** (*type stripping*) tanpa memeriksanya, dan salah satu bagian 🔬 modul itu berjanji: "Dashboard React di Modul 22 akan memakai alat yang menghapus label tipe dengan cara yang mirip." Alat itu adalah Vite: menurut dokumentasinya, Vite hanya menerjemahkan berkas `.ts` dan **tidak** memeriksa tipenya. Akibatnya, galat tipe **tidak** menghentikan `npm run dev`: halaman tetap tampil, dan kesalahannya baru ketahuan saat kode itu berjalan. Pemeriksanya ada dua: **VS Code**, yang memberi garis merah saat kamu mengetik, dan **`tsc -b`**, langkah pertama `npm run build`, yang mencetak galat lalu berhenti sehingga `vite build` tidak dijalankan (Praktik 3). Di backend, pasangannya `npm run cek` (`tsc --noEmit`).

Dua beda lain dengan backend: impor berkas sendiri ditulis **tanpa** akhiran (`./api`, `./components/Login`; `./App.tsx` bawaan templat juga diterima), dan TypeScript-nya 6.0.3 bawaan templat, bukan 7.0.2 (🧰). `enum` tetap terlarang ([Konsep 6](#6-props-dan-tipe-data-yang-dititipkan-bentuknya-dari-kontrak-data)).

**Isi folder `frontend`.** Perintah `npm create vite@9.3.1 frontend -- --template react-ts` (Praktik 2) membuat 18 berkas. Petanya sesudah `npm install`:

```text
frontend/
├── index.html          pintu masuk: <div id="root"> dan <script type="module">
├── package.json        nama, versi, empat perintah npm run, dan daftar paket
├── package-lock.json   versi persis setiap paket
├── vite.config.ts      pengaturan Vite
├── tsconfig.json       menunjuk dua berkas di bawahnya
├── tsconfig.app.json   aturan TypeScript untuk src/, termasuk "types": ["vite/client"]
├── tsconfig.node.json  aturan TypeScript untuk vite.config.ts
├── .oxlintrc.json      aturan oxlint (npm run lint)
├── .gitignore          yang tidak ikut Git: node_modules, dist, *.local
├── README.md           catatan bawaan templat
├── public/             favicon.svg, icons.svg
├── node_modules/       paket hasil npm install, tidak ikut Git
└── src/                main.tsx (menyalakan React), App.tsx (komponen induk),
                        index.css, App.css, assets/ (gambar demo)
```

Berkas lain kamu tambahkan sendiri, satu tugas per berkas seperti backend Modul 16 (Konsep 5): `src/types.ts` dan `src/components/KartuSensor.tsx` (Praktik 3), `src/api.ts` dan `Login.tsx` (Praktik 4), `DaftarPerangkat.tsx` dan `Lencana.tsx` (Praktik 5), serta `DetailPerangkat.tsx` (Praktik 6). Folder `frontend` sendiri tinggal di repositori `rumah-pintar-mini`, di samping `backend`: dua proyek, dua terminal, dan keduanya hanya bicara lewat HTTP, seperti Bruno dengan backend.

Satu hal sering membingungkan pembaca tutorial lama: **tidak ada `src/vite-env.d.ts`**. Tipe khusus Vite seperti `import.meta.env` kini masuk lewat `"types": ["vite/client"]` di `tsconfig.app.json`.

**`VITE_…`: pengaturan yang ikut terkirim ke browser.** Berkas `.env` backend (Modul 16) menyimpan rahasia seperti sandi database dan `JWT_SECRET`, dan tidak pernah dikirim ke siapa pun. Frontend juga bisa membaca `.env`, dengan dua perbedaan besar:

1. **Hanya variabel berawalan `VITE_` yang sampai ke kode**, lewat `import.meta.env.VITE_…`. Variabel lain, misalnya `DB_PASSWORD`, sengaja dibuat `undefined`.
2. **Nilainya ikut tertanam di JavaScript yang dikirim ke browser**, jadi siapa pun yang membuka DevTools bisa membacanya. `VITE_…` **bukan tempat rahasia**: jangan pernah mengisinya dengan sandi, kunci perangkat, *API key*, atau token. Satu-satunya variabel dashboard kita, `VITE_API_BASE`, hanya berisi alamat backend.

| Berkas | Dibaca Vite? | Ikut Git? |
| :--- | :--- | :--- |
| `.env` | ya, selalu | **ya**, kalau tidak diabaikan. Templat tidak mengabaikannya, jadi Praktik 2 menambahkannya ke `.gitignore`. |
| `.env.local` | ya, selalu | tidak: `.gitignore` templat mengabaikan semua berkas berakhiran `.local` |
| `.env.example` | tidak | ya: contoh yang disalin menjadi `.env.local` kalau backend-mu ada di alamat lain (Praktik 4) |

Vite membaca berkas-berkas itu saat `npm run dev` menyala, dan semua nilainya berupa teks. Setelah mengubahnya, hentikan *dev server* dengan **Ctrl + C**, lalu jalankan lagi (Vite 8 juga bisa menyala ulang sendiri; cara ini pasti). Kalau `VITE_API_BASE` tidak diisi, dashboard memakai alamat bawaan yang mengikuti nama host halaman, di port 8080 (Konsep 9).

> ⬆️ **Sudah membaca Konsep 3–4?** Lanjut ke [Praktik 2 — Proyek Vite pertama: React, TypeScript, dan Tailwind v4](#praktik-2--proyek-vite-pertama-react-typescript-dan-tailwind-v4-45-menit). Konsep 5–6 dibaca sebelum Praktik 3.

### 5. React dan JSX: halaman dari balok LEGO

Di Praktik 1, kamu mengubah halaman dengan tangan: cari elemennya (`querySelector`), lalu ganti `textContent`-nya. Untuk dashboard, cara itu cepat merepotkan: kartunya belasan dan kembar, lupa satu baris pembaruan berarti angka basi, dan layarnya berganti-ganti (*login*, daftar, detail) tanpa memuat ulang halaman.

**React** adalah *library* JavaScript yang mengurus semua itu: data disimpan di satu tempat (*state*, Konsep 7), setiap kartu dibuat dari satu cetakan (komponen), dan layar digambar ulang setiap kali datanya berubah. React yang mencari dan mengubah elemennya untukmu, sebatas bagian yang berbeda, jadi kotak isian yang sedang kamu ketik tidak kehilangan kursornya (🔬 *Virtual DOM*).

**Komponen: balok LEGO.** Satu balok LEGO bentuknya tetap, bisa dipasang berkali-kali, dan balok-balok kecil disusun menjadi bangunan besar. Begitu pula **komponen** React. Dashboard v0.1 tersusun dari `App` (akar: memeriksa apakah kamu sudah *login*, lalu memilih layar), `Login`, `DaftarPerangkat` (`GET /devices`), `DetailPerangkat` (`GET /devices/:id/latest`), `KartuSensor` (satu kartu untuk satu bacaan, dipakai berkali-kali), serta `LencanaStatus` dan `LencanaKunci` (berkas `Lencana.tsx`). Susunannya membentuk **pohon komponen**:

![Pohon komponen dashboard v0.1, balok LEGO yang saling menitip (Konsep 5–6): props turun dari induk ke anak, kejadian naik lewat fungsi titipan, dan state adalah papan tulis kecil. Paling atas, pita abu-abu: index.html punya div dengan id root, src/main.tsx memasang App di dalamnya, dibungkus StrictMode (efek berjalan dua kali di mode pengembangan). Di bawahnya, kotak ungu lebar App (src/App.tsx), yang memilih satu dari tiga layar dengan state biasa (React Router baru di Modul 24). Papan tulis (state) milik App: pengguna, berisi memuat, belum login, atau akun yang masuk (GET /auth/me); tampilan, berisi daftar atau detail beserta perangkat yang dipilih; galatAwal, pesan di atas formulir kalau backend atau database mati saat dibuka, atau sesi sudah habis. Di sisi kanan kotak App: kepala halaman menampilkan nama dan peran akun; tombol Keluar memanggil POST /auth/logout (disempurnakan di Modul 24); saat dibuka, App bertanya GET /auth/me, sudah login? Dari App turun tiga panah ungu (props) dan naik tiga panah putus-putus navy (kejadian) ke tiga anak. Ke Login: props galatAwal dan onMasuk; kejadian onMasuk(pengguna) saat berhasil masuk. Ke DaftarPerangkat: props onPilih dan onSesiHabis; kejadian onPilih(perangkat) saat kartu diklik dan onSesiHabis() saat 401. Ke DetailPerangkat: props perangkat, onKembali, dan onSesiHabis, ditambah key yang bukan props; kejadian onKembali() dari tombol kembali dan onSesiHabis() saat 401. Kotak Login (components/Login.tsx): tampil kalau belum login; state sendiri email, sandi, galat, sibuk; mengirim POST /auth/login; isian terkendali dengan required. Kotak DaftarPerangkat (components/DaftarPerangkat.tsx): tampil kalau tampilan = daftar; state sendiri perangkat, galat; mengambil GET /devices; lencana status dan kunci memakai LencanaStatus dan LencanaKunci dari components/Lencana.tsx. Kotak DetailPerangkat (components/DetailPerangkat.tsx): tampil kalau tampilan = detail; state sendiri bacaan, galat, dan belumAda; mengambil GET /devices/:id/latest; judul berisi nama, lokasi, dan LencanaKunci. Dari DetailPerangkat turun panah ungu berlabel label, nilai, satuan (+ warna) ke kotak KartuSensor: satu balok, dipakai ulang (components/KartuSensor.tsx), berisi enam kartu sensor Node 1 dengan angka contoh: Suhu 28.5 °C, Kelembapan 71 %, Cahaya 3094 /4095, Kelembapan tanah 37 %, Gerakan Tidak ada, dan Air tandon 52 %; di bawahnya contoh pemakaian KartuSensor dengan label Suhu, nilai 28.5, dan satuan °C, serta catatan Lampu, Kipas, trio RS-485, dan Node 2 memakai cetakan yang sama. Kiri bawah, kotak Cara membaca pohon ini: panah ungu turun, props adalah titipan dari induk ke anak, berupa data (perangkat) atau fungsi (onPilih), dan anak hanya membaca titipannya, tidak mengubahnya; panah putus-putus naik, kejadian adalah anak memanggil fungsi titipan itu, misalnya onPilih(perangkat), dan induklah yang mengubah state-nya sendiri; kotak ungu muda, state adalah papan tulis kecil milik satu komponen, berubah lewat fungsi set…, lalu React menggambar ulang komponen itu beserta anak-anaknya; key={perangkat.device_id} berarti ganti perangkat sama dengan DetailPerangkat baru dan state lamanya dibuang; pohon yang sama terlihat di React DevTools, tab Components (Praktik 2).](aset/pohon-komponen.png)

Data mengalir **turun** dari induk ke anak lewat *props* (Konsep 6); kejadian seperti "perangkat ini diklik" mengalir **naik** lewat fungsi titipan. Pohon yang sama tampil di tab **Components** React DevTools (Praktik 2).

**Komponen adalah fungsi** yang mengembalikan tampilan. Inilah `KartuSensor` dari Praktik 3 (Praktik 7 menambah `min-w-0` dan `truncate` untuk layar HP):

```tsx
export default function KartuSensor({ label, nilai, satuan, warna = "text-slate-800" }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {/* ?? = kalau nilainya null, tulis "—" (bukan 0: angka 0 tetap bacaan yang sah) */}
        <span className={nilai === null ? "text-slate-400" : warna}>{nilai ?? "—"}</span>
        {/* satuan hanya ditulis kalau ada angkanya */}
        {satuan && nilai !== null ? <span className="ml-1 text-base font-normal text-slate-400">{satuan}</span> : null}
      </p>
    </div>
  );
}
```

Komponen dipakai seperti tag HTML: `<KartuSensor label="Suhu" nilai={28.1} satuan="°C" />`. Aturannya: nama **diawali huruf besar** (`<div>` berhuruf kecil dianggap tag HTML), tampilan beberapa baris **dibungkus kurung** `return (` … `);` (tanpa kurung, baris sesudah `return` diabaikan), dan komponen ditulis **di tingkat teratas berkas**.

**JSX: "HTML" di dalam TypeScript.** Tulisan mirip HTML itu disebut **JSX**, dan berkasnya berakhiran `.tsx`. Browser tidak mengenal JSX; Vite menerjemahkannya menjadi JavaScript biasa (Konsep 4). Bedanya dengan HTML:

| Di HTML | Di JSX | Mengapa |
| :--- | :--- | :--- |
| `<div class="kartu">` | `<div className="kartu">` | `class` kata khusus JavaScript |
| `<input type="email">` | `<input type="email" />` | setiap tag wajib ditutup (`<br />`, `<img … />`) |
| beberapa elemen berdampingan | satu pembungkus, atau `<>` … `</>` (*fragment*) | fungsi mengembalikan satu nilai |
| `addEventListener("click", ubahTulisan)` | `<button onClick={ubahTulisan}>` | kejadian ditulis *camelCase*: `onClick`, `onChange`, `onSubmit` |
| `<p id="suhu">` + `textContent` | `<p>{suhu}</p>` | isinya langsung dari data |
| `<!-- komentar -->` | `{/* komentar */}` | komentar JavaScript |

Jebakannya: **serahkan fungsinya, jangan panggil**. `onClick={ubahTulisan()}` (dengan kurung) langsung berjalan saat React menggambar, sebelum ada yang mengklik. Kalau fungsinya perlu isian, bungkus dengan fungsi panah, seperti di `DaftarPerangkat`: `onClick={() => onPilih(p)}`.

**Kurung kurawal `{ }`: jendela ke JavaScript**, sebagai isi (`<p>{label}</p>`) atau nilai atribut (`className={warna}`); `className="{warna}"` (bertanda kutip) hanyalah teks harfiah. Tiga alat Pemanasan Langkah 3 sering muncul di sini: **`? :`** memilih salah satu, **`??`** memberi pengganti `null` (`{nilai ?? "—"}`), dan **`&&`** berarti "tampilkan kalau…". **Jangan taruh angka di kiri `&&`**: `{perangkat.length && <ul>…</ul>}` menulis `0` saat daftarnya kosong; tulis `{perangkat.length > 0 && <ul>…</ul>}`.

**Daftar dan `key`.** Setiap elemen hasil `map` (Pemanasan Langkah 2) wajib diberi **`key`**, tanda pengenal yang unik di antara saudaranya dan tidak pernah berubah, supaya React tahu butir mana yang mana saat daftarnya berubah. `DaftarPerangkat` memakai ID database: `<li key={p.device_id}>`. Jangan memakai nomor urut `map` (ikut bergeser) atau `Math.random()` (berganti setiap *render*). Tanpa `key`, tab **Console** memperingatkan `Each child in a list should have a unique "key" prop.`

**JSX meloloskan teks: perlindungan bawaan dari XSS.** Tabel OWASP di Modul 20 menyimpan janji "XSS di dashboard menyusul di Modul 22". **XSS** (*cross-site scripting*) terjadi saat JavaScript asing berjalan di halamanmu (Modul 20 Konsep 5), paling sering lewat **teks dari luar yang ditempel sebagai HTML**. Dashboard-mu menampilkan teks yang tidak kamu tulis: `nama` dan `lokasi` perangkat yang diketik admin lewat `POST /devices` (Modul 21), pesan galat backend, nama akun. Misalkan `nama` sebuah perangkat berisi `<img src=x onerror="alert(1)">`. Kalau ditempel lewat `innerHTML`, browser membacanya sebagai tag: gambar `x` gagal dimuat, lalu isi `onerror`, yang bisa berupa JavaScript apa saja, dijalankan.

Nilai di dalam `{ }` selalu dipasang sebagai **teks**: React **meloloskan** (*escape*) tanda khusus HTML seperti `<`, `>`, dan tanda kutip. Penulis mengujinya dengan React 19.3.1: `<p>{nama}</p>` berisi nama tadi menghasilkan `<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>` (`&lt;` = `<` sebagai teks), jadi layar hanya menuliskan teksnya dan tidak ada skrip berjalan. Jalan React untuk menempel HTML mentah sengaja dinamai menakutkan, **`dangerouslySetInnerHTML`** (*dangerously* = "dengan berbahaya"); pada uji yang sama, nama tadi lolos utuh menjadi `<img onerror=…>` sungguhan. Dokumentasi React memperingatkan: memakainya berisiko membuka celah XSS; hanya untuk data tepercaya yang sudah disaring.

> [!IMPORTANT]
> **Dashboard Rumah Pintar Mini tidak memakai `dangerouslySetInnerHTML` sama sekali**, apalagi untuk data perangkat atau jawaban API. Semua teks dari backend ditampilkan lewat `{ }` biasa. Tutorial yang memakainya untuk data dari server adalah tanda bahaya.

Pintu lain, *library* npm yang disusupi, dijaga kebiasaan sejak Modul 16 (versi persis, `package-lock.json`, `npm audit`). Lapis berikutnya di Konsep 9: gelang dan kartu terusan ada di *cookie* `HttpOnly` yang tidak bisa dibaca JavaScript, jadi skrip asing pun tidak bisa membawanya kabur. Itulah alasan token tidak pernah disimpan di `localStorage`.

### 6. *Props* dan tipe: data yang dititipkan, bentuknya dari kontrak data

***Props* adalah titipan dari induk ke anak**, seperti bekal untuk anak yang berangkat sekolah: "Ini labelnya, ini angkanya, ini satuannya." Dengan titipan, satu cetakan `KartuSensor` dipakai enam kali di `App.tsx` (Praktik 3) dengan isi berbeda:

```tsx
<KartuSensor label="Suhu" nilai={bacaan.suhu} satuan="°C" warna="text-teal-600" />
<KartuSensor label="Kelembapan" nilai={bacaan.kelembapan} satuan="%" />
```

Teks ditulis bertanda kutip, nilai JavaScript di dalam `{ }`. Di sisi anak, titipan dibongkar dengan destrukturisasi (Pemanasan Langkah 1): `{ label, nilai, satuan, warna = "text-slate-800" }`. `warna = …` adalah **nilai bawaan**, yang dipakai hanya kalau titipannya tidak ada (`undefined`), bukan kalau isinya `null` atau `0`; kartu kedua di atas memakainya.

**Titipan hanya untuk dibaca**: dokumentasi React menyebut *props* potret sesaat yang hanya bisa dibaca. Kalau angkanya harus berubah, induk menitipkan angka baru. Yang berubah karena ulah komponen itu sendiri disimpan di *state* (Konsep 7).

**Titipan juga bisa berupa fungsi**, dan dengan itulah anak melapor. `DaftarPerangkat` memanggil titipan `onPilih` dengan perangkat yang diklik, lalu `App` menampilkan layar detail. Labelnya, `onPilih: (perangkat: Perangkat) => void`, berarti "menerima satu `Perangkat`, tidak mengembalikan apa-apa"; `Login` menerima `onMasuk` serupa. Ringkasnya: **data turun lewat *props*, kejadian naik lewat fungsi titipan.**

**Label tipe untuk titipan: `type Props`.** `KartuSensor` menuliskan bentuk titipannya:

```tsx
type Props = {
  label: string; // tulisan kecil di atas, misalnya "Suhu"
  nilai: number | string | null; // angka atau teks; null = sensor gagal dibaca (aturan 7)
  satuan?: string; // tanda ? = boleh tidak diisi (kartu "Gerakan" tidak punya satuan)
  warna?: string; // kelas warna Tailwind untuk angkanya, misalnya "text-teal-600"
};
```

`|` berarti "salah satu dari" (seperti di backend Modul 16), dan `?` berarti boleh tidak diberikan. VS Code langsung menandai titipan wajib yang lupa, nama yang salah ketik (`lable`), atau isi yang keliru jenis (`nilai={true}`). Vite sendiri tidak memeriksa tipe (Konsep 4): halaman tetap tampil di `npm run dev`, tetapi `npm run build` menolak (Praktik 3).

**Bentuknya dari kontrak data: `src/types.ts`.** Daripada menebak, dashboard menyalin bentuk data dari Lampiran A (kontrak data 1.4) dan dari jawaban backend Modul 16–21 menjadi label tipe: `Perangkat` (satu baris `GET /devices`, termasuk `kunci` dari Modul 21), `TelemetryNode1` dan `TelemetryNode2` (isi `telemetry`; `Telemetry` = salah satu dari keduanya), `Keadaan` (`state` empat aktuator, kontrak 1.3), `BacaanTerbaru` (`GET /devices/:id/latest`), `Pengguna` (`POST /auth/login`, `GET /auth/me`), serta daftar pilihan `Jenis`, `StatusPerangkat`, dan `StatusKunci`. Nama kolomnya sama persis dengan kiriman backend, jadi salah ketik `bacaan.kelembaban` (di JavaScript biasa diam-diam `undefined`) langsung ditandai merah. Label tipe juga membedakan tiga kemungkinan bacaan:

| Tulisannya | Artinya | Contoh |
| :--- | :--- | :--- |
| `number` | selalu ada | `cahaya`, `tanah` Node 1 |
| `number \| null` | kolom selalu ada; bacaan gagal = `null` (aturan 7) | `suhu`, `tekanan` |
| `baterai?: number \| null` | kolomnya bisa tidak ada | `baterai` Node 2; trio RS-485 dan `state` Node 1 |

Karena itu, `KartuSensor` menulis `null` sebagai "—", bukan `0`: kelembapan tanah 0 % adalah bacaan yang sah.

**Daftar pilihan tetap: gabungan teks, bukan `enum`.** Kolom yang hanya boleh berisi segelintir teks ditulis sebagai gabungan teks (*union literal*):

```ts
export type StatusPerangkat = "online" | "offline" | "offline-mode" | "belum-diketahui";
```

Salah ketik `"onlen"` langsung ditandai; `"belum-diketahui"` = terdaftar tetapi belum pernah mengirim status (seperti perangkat yang baru didaftarkan di Modul 21).

Di `Lencana.tsx` (Praktik 5), objek bertipe `Record<StatusPerangkat, string>` menyimpan deretan kelas Tailwind yang ditulis **utuh** untuk setiap status, karena Tailwind hanya membuat kelas yang tertulis lengkap, bukan sambungan seperti `"bg-" + warna`; `Record` menagih warna untuk setiap pilihan.

Tutorial lain mungkin menulis `enum Status { Online, Offline }`, tetapi templat kita menyalakan `erasableSyntaxOnly`, yang hanya mengizinkan TypeScript yang bisa dihapus begitu saja. `enum` menghasilkan kode sungguhan, jadi ditolak dengan galat `TS1294` (🚨), seperti di backend Modul 16.

**`import type`: tipe hanyalah label.** Saat Vite menyiapkan kode untuk browser, semua yang bertanda `type` dihapus. Karena templat menyalakan `verbatimModuleSyntax`, impor yang isinya hanya tipe **wajib** memakai `import type`, misalnya di `DaftarPerangkat.tsx`:

```ts
import type { Perangkat } from "../types";
```

Tanpa kata `type`, `npm run build` menolak dengan `TS1484` (`'Perangkat' is a type and must be imported using a type-only import …`). Tipe dari paket pun begitu: `Login.tsx` menulis `import { useState } from "react";` lalu `import type { SubmitEvent } from "react";` di baris terpisah. Impor berkas sendiri ditulis **tanpa** akhiran `.ts` (`"../types"`), karena Vite yang mencarikan berkasnya; `main.tsx` bawaan templat menulis `./App.tsx`, dan keduanya sah.

Ingat batasnya: **label tipe adalah janji, bukan pemeriksaan.** Saat halaman berjalan, labelnya sudah dihapus, jadi isi jawaban `GET /devices` tidak diperiksa. Untuk sekarang cukup, karena backend memeriksa setiap pesan dengan Zod sejak Modul 16; Zod di browser baru di Modul 24. Dua salinan tipe (backend dan frontend) juga harus dijaga sama; cara berbagi satu salinan ada di 🔬.

> ⬆️ **Sudah membaca Konsep 5–6?** Lanjut ke [Praktik 3 — Komponen pertama: `KartuSensor` dan tipe dari kontrak data](#praktik-3--komponen-pertama-kartusensor-dan-tipe-dari-kontrak-data-45-menit). Konsep 7 dan 9 dibaca sebelum Praktik 4.

### 7. *State* dan `useState`: layar yang ingat

Formulir *login* harus mengingat isi kotak email dan sandi, apakah tombol **Masuk** sedang menunggu, dan pesan galat. Variabel biasa seperti `let sibuk = false` tidak bisa: mengubahnya **tidak membuat React menggambar ulang**, dan setiap *render* memanggil fungsi komponenmu dari awal, jadi isinya **kembali `false`**.

***State* adalah papan tulis kecil milik komponen.** React menyimpannya di luar fungsi komponen, jadi isinya bertahan antar-*render*. Kamu tidak mencoretnya langsung, tetapi menyerahkan tulisan baru lewat fungsi khusus, lalu React menggambar ulang. Inilah empat papan tulis di `Login.tsx` (Praktik 4):

```tsx
const [email, setEmail] = useState("");
const [sandi, setSandi] = useState("");
const [galat, setGalat] = useState<string | null>(null);
const [sibuk, setSibuk] = useState(false); // true selama menunggu jawaban backend
```

`useState("")` membuat papan dengan isi awal `""` dan mengembalikan **isinya saat ini** (`sandi`) serta **fungsi penggantinya** (`setSandi`). Label di antara `< >` menyebut isi papan (teks pesan, atau `null`). Papan tulis milik satu komponen; kalau dua komponen butuh data yang sama, papannya dipindah ke induk bersama lalu dititipkan turun, seperti papan `pengguna` di `App`. Papan boleh diisi awal dari titipan: di Praktik 5, isi awal `galat` di `Login` menjadi `galatAwal` titipan `App`, misalnya pesan sesi habis.

**Aturan *hook*.** `useState` dan `useEffect` (Konsep 8) disebut ***hook***, fungsi React yang namanya diawali `use`. Panggil hanya di tingkat teratas komponen, tidak di dalam `if`, perulangan, `try`/`catch`, atau sesudah `return` bersyarat. `npm run lint` menjaganya (aturan `react/rules-of-hooks` di `.oxlintrc.json` templat).

**Ganti papannya, jangan dicoret.** Untuk teks, angka, dan `true`/`false`, panggil saja `setSibuk(true)`. Untuk objek dan *array*, serahkan salinan **baru** dengan *spread* (Pemanasan Langkah 4):

| ❌ Mencoret papan (layar tidak berubah) | ✅ Menyerahkan papan baru |
| :--- | :--- |
| `pengguna.nama = "Ani";` | `setPengguna({ ...pengguna, nama: "Ani" });` |
| `perangkat.push(baru);` | `setPerangkat([...perangkat, baru]);` |

React membandingkan papan lama dan baru; objek yang sama yang dicoret dianggap tidak berubah. *Spread* hanya menyalin satu lapis, jadi salin juga objek di dalamnya kalau ingin diubah.

**Isi baru terlihat di *render* berikutnya.** Sesudah `setSibuk(true)`, `sibuk` di baris berikutnya **masih** `false`; React menggambar ulang sesudah penangan kejadian selesai. Kalau isi baru dihitung dari isi lama, serahkan **fungsi pengubah** (*updater function*), seperti tombol **Count is 0** di templat Vite (Praktik 2): `setCount((count) => count + 1)`.

**Formulir terkendali** (*controlled input*): isi kotak dikendalikan papan tulis. Inilah kotak sandi di `Login.tsx` Praktik 4 (Praktik 7 menambah `min-h-11`):

```tsx
<input
  id="sandi"
  type="password"
  required
  value={sandi}
  onChange={(e) => setSandi(e.target.value)}
  autoComplete="current-password"
  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
/>
```

Mengetik satu huruf → `onChange` → `setSandi(e.target.value)` → React menggambar ulang → kotak menampilkan `value={sandi}`. Isi kotak selalu sama dengan papan, jadi saat **Masuk** ditekan, `email` dan `sandi` siap diambil. Tanpa `onChange`, kotaknya tidak bisa diketik. Isi awalnya `""`; `undefined`/`null` ditegur React. `required` membuat browser menolak formulir kosong sebelum `fetch` berangkat.

**Mengirim formulir: `onSubmit` dan `preventDefault()`.** Bawaan browser, mengirim formulir berarti berpindah halaman (ingat formulir ke `penerima-webhook.js` di Praktik 1). `<form onSubmit={kirim}>` memanggil `kirim`, yang membatalkannya dengan `e.preventDefault()`, lalu mengosongkan galat lama, `setSibuk(true)` supaya tombol tidak ditekan dua kali, memanggil `masuk(email, sandi)`, dan `setSibuk(false)` apa pun hasilnya. React 19 juga mengenal `<form action={…}>`, tetapi `onSubmit` berlaku di semua versi.

> ⬆️ **Sudah membaca Konsep 7?** Lewati Konsep 8 dulu, lalu baca [Konsep 9 — *Login* dari browser](#9-login-dari-browser-cookie-cors-dan-localhost) sebelum [Praktik 4 — *State* dan formulir *login*](#praktik-4--state-dan-formulir-login-60-menit). Konsep 8 menunggumu sesudah Praktik 4.

### 8. `useEffect` dan `fetch`: mengambil data sesudah layar tampil

Begitu *login* berhasil, `DaftarPerangkat` harus bertanya `GET /devices` tanpa ada tombol yang ditekan. `fetch`-nya **bukan di badan komponen**, yang dijalankan setiap *render*: jawaban mengisi papan → React menggambar ulang → `fetch` berangkat lagi, tanpa henti.

**`useEffect`: sesudah duduk, baru pesan.** Di warung, kamu duduk dulu, baru memesan. React pun menggambar komponen lebih dulu, lengkap dengan tulisan memuat; sesudah layar tampil, efek dijalankan dan `fetch` berangkat (sebuah *Promise*, "alat getar" Modul 4); saat jawaban tiba, papan tulis diganti dan layar digambar ulang. Inilah efek di `DaftarPerangkat.tsx` (Praktik 5):

```tsx
useEffect(() => {
  let ignore = false; // menjadi true saat efek dibereskan: jawaban yang datang terlambat diabaikan
  ambilPerangkat()
    .then((daftar) => {
      if (!ignore) setPerangkat(daftar);
    })
    .catch((err) => {
      if (ignore) return;
      if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
      setGalat(err instanceof GalatApi ? err.message : "Gagal memuat perangkat.");
    });
  return () => {
    ignore = true; // cleanup: dijalankan React sebelum efek diulang atau saat komponen ini hilang dari layar
  };
}, [onSesiHabis]);
```

`ambilPerangkat()` (di `src/api.ts`) lewat satu pintu, `minta()`, yang selalu membawa *cookie* (Konsep 9) dan memeriksa `res.ok`, karena `fetch` tidak menganggap 404 atau 500 sebagai kegagalan (Pemanasan Langkah 5).

**Daftar di ujung efek** menentukan kapan efek dijalankan:

| Ditulis | Efek dijalankan |
| :--- | :--- |
| tanpa daftar: `useEffect(fn)` | sesudah **setiap** *render* |
| `[]` | sekali, sesudah komponen pertama kali tampil |
| `[a, b]` | sesudah pertama kali tampil, lalu setiap kali `a` atau `b` berubah |

Setiap nilai dari luar efek yang dipakai di dalamnya, seperti *props* atau fungsi titipan, ikut ditulis: efek di atas memakai `onSesiHabis`, sedangkan efek `App` (`GET /auth/me`) tidak membaca *props* atau papan tulis, jadi daftarnya `[]`.

**Efek untuk dunia luar, bukan untuk tombol.** Efek menyelaraskan layar dengan sesuatu di luar React, seperti backend. Aksi pengguna tempatnya di penangan kejadian: *login* dikirim dari `onSubmit` (Konsep 7). Tanpa dunia luar, efek tidak dibutuhkan.

**Ingin memakai `await`?** Fungsi efek tidak ditulis `async`, karena ia hanya boleh mengembalikan *cleanup*, bukan *Promise*. Buat fungsi `async` di dalam efek, lalu langsung panggil (dokumentasi React menamainya `startFetching()`); `.then()` juga sah.

**`StrictMode`: dua kali di mode pengembangan.** `src/main.tsx` templat membungkus `<App />` dengan `<StrictMode>`. Di mode pengembangan (`npm run dev`), `StrictMode` sengaja **memasang setiap komponen, mencopotnya, lalu memasangnya lagi**, sekali, sesudah pertama kali tampil. Akibatnya, setiap efek, termasuk yang ber-`[]`, berjalan dua kali: tab **Network** menampilkan `GET /devices` **dua kali** (Praktik 5), begitu pula `GET /auth/me`. Dokumentasi React menyebutnya wajar; di hasil *build* hanya sekali. Pemeriksaan ini hanya di dapur, tidak di hidangan siap saji, untuk memancing efek yang lupa membereskan diri. Jadi, jangan hapus `<StrictMode>`; siapkan efekmu.

***Cleanup* `ignore`: jawaban lama tidak boleh menimpa.** `fetch` yang sudah berangkat tidak bisa ditarik; jawabannya tetap datang. Di mode pengembangan, `GET /devices` pertama milik efek yang sudah dicopot. Di luar `StrictMode` pun, kalau efek mengambil data lagi karena isi daftarnya berganti, jawaban lama bisa tiba belakangan dan menimpa yang baru. Kekeliruan karena urutan tiba yang tidak tentu ini disebut ***race condition***. Obatnya pola resmi dokumentasi React di efek tadi:

- Fungsi yang dikembalikan efek disebut ***cleanup***. React memanggilnya sebelum menjalankan efek itu lagi dan saat komponennya hilang dari layar.
- Setiap efek punya `ignore`-nya sendiri. *Cleanup* menyalakan `ignore` milik efek lama, jadi jawabannya (`.then` maupun `.catch`) diabaikan: pesanan lama tetap diantar, tetapi tidak ditaruh di meja barumu.
- Di `.catch`, 401 berarti sesi habis, jadi `DaftarPerangkat` melapor lewat `onSesiHabis`; galat lain ditulis di papan `galat` (Konsep 10).
- Nama `ignore` sama dengan contoh dokumentasi React. `AbortController`, yang benar-benar membatalkan permintaan, ada di 🔬.

Urutannya saat `DaftarPerangkat` tampil di mode pengembangan:

| Urutan | Yang terjadi |
| :---: | :--- |
| 1 | Tampil dengan tulisan memuat; efek pertama berjalan, `GET /devices` pertama berangkat. |
| 2 | `StrictMode` mencopotnya: *cleanup* menyalakan `ignore` milik efek pertama. |
| 3 | `StrictMode` memasangnya lagi: efek kedua berjalan, `GET /devices` kedua berangkat. |
| 4 | Jawaban pertama diabaikan; jawaban kedua mengisi papan tulis, daftar tampil (urutan tibanya boleh tertukar). |

Di hasil *build*, hanya ada efek pertama, dan jawabannya langsung dipasang.

**`key` untuk mulai dari papan kosong.** Saat perangkat di `DetailPerangkat` berganti, papan tulisnya harus kosong lagi supaya angka perangkat lama tidak sempat tampil. Mengosongkannya di awal efek (`setBacaan(null)`) ditegur `npm run lint`. Cara yang disarankan React: `App` memasang `DetailPerangkat` dengan `key={tampilan.perangkat.device_id}`, sehingga perangkat lain berarti komponen **baru** dengan papan kosong dan efek dari awal (Praktik 6), seperti `key` di daftar (Konsep 5).

**Sekali saja, tanpa penyegaran.** Dashboard v0.1 mengambil data **sekali**, saat layar tampil; untuk bacaan baru, buka lagi detailnya. Tombol **Muat ulang** buatanmu adalah 🧩 Tingkat 2, dan angka yang berganti sendiri lewat Socket.IO datang di Modul 23. Keadaan memuat, galat, kosong, dan berhasil dibahas di Konsep 10.

> ⬆️ **Sudah membaca Konsep 8?** Baca juga [Konsep 10 — Memuat, galat, dan kosong](#10-memuat-galat-dan-kosong-tiga-keadaan-yang-selalu-disiapkan), lalu kerjakan [Praktik 5 — `useEffect`: siapa saya dan daftar perangkat](#praktik-5--useeffect-siapa-saya-dan-daftar-perangkat-60-menit) dan [Praktik 6 — Detail perangkat: bacaan terbaru semua sensor](#praktik-6--detail-perangkat-bacaan-terbaru-semua-sensor-60-menit).

### 9. *Login* dari browser: *cookie*, CORS, dan `localhost`

Di Modul 20, Bruno yang menyimpan *cookie* dari jawaban *login*, lalu melampirkannya ke permintaan berikutnya. Mulai minggu ini, tugas itu dikerjakan **browser**, atas perintah dashboard-mu. Backend-nya tidak berubah, jadi *cookie*-nya sama persis (Modul 20 Konsep 4–7): **gelang** `akses` (JWT, 15 menit, ikut ke semua alamat backend karena `Path=/`) dan **kartu terusan** `sesi` (*refresh token*, paling lama 7 hari, hanya ke loket `/auth/…` karena `Path=/auth`), keduanya `HttpOnly; SameSite=Strict`.

Yang baru adalah **aturan browser**: tiga syarat yang harus dipenuhi **sekaligus**. Kalau satu saja terlewat, *login* gagal, atau tampak berhasil tetapi permintaan berikutnya dijawab 401.

**Syarat pertama: minta browser membawa *cookie*.** Dashboard di `http://localhost:5173` dan backend di `http://localhost:8080` berbeda port, jadi berbeda asal (*origin*, Modul 20 Konsep 9). Untuk permintaan lintas asal, `fetch` bawaan (`credentials` bawaannya `same-origin`) **tidak** membawa *cookie* dan tidak menyimpan *cookie* dari jawabannya, sehingga *login* yang 200 pun tidak meninggalkan gelang. Dashboard harus memintanya:

```ts
res = await fetch(BASE + jalur, { credentials: "include", ...opsi });
```

Karena itu, semua permintaan lewat satu pintu, `minta()` di `src/api.ts`, yang selalu menambahkan pilihan ini (Praktik 4).

**Syarat kedua: backend mengizinkan asal halaman (CORS).** Browser hanya menyerahkan jawaban ke halaman dari asal lain kalau backend mengizinkannya. Izin itu sudah dipasang di Modul 20 (Praktik 6):

- **`CORS_ORIGIN`** di `.env` backend, bawaannya `http://localhost:5173,http://127.0.0.1:5173`.
- **`credentials: true`** di @fastify/cors: jawaban memuat `access-control-allow-origin: http://localhost:5173` (bukan `*`) dan `access-control-allow-credentials: true`.
- **Pemeriksaan asal oleh satpam**: `POST` dari asal itu ke loket `/auth/…` lolos, bukan 403.

Untuk permintaan yang "berisiko", browser bertanya dulu lewat *preflight* `OPTIONS` (Modul 20). Di dashboard v0.1, hanya *login* yang memicunya:

| Permintaan dashboard | Ada *preflight*? | Mengapa |
| :--- | :--- | :--- |
| `POST /auth/login` (isi JSON) | Ya: `OPTIONS` tanpa *cookie*, dijawab `204` | `Content-Type: application/json` bukan jenis "sederhana" |
| `GET /auth/me`, `GET /devices`, `GET /devices/:id/latest` | Tidak | `GET` tanpa kepala tambahan |
| `POST /auth/refresh`, `POST /auth/logout` | Tidak | tanpa isi dan tanpa `Content-Type` |

Browser mengingat jawaban *preflight* sebentar: kalau kamu mencoba lagi dalam beberapa detik (sekitar 5 detik), baris `OPTIONS` bisa tidak muncul. Baris terakhir tabel menyimpan jebakan (Praktik 4): `Content-Type: application/json` hanya dikirim **bersama isi**, karena backend menolak `POST` berlabel JSON yang kosong dengan 400.

**Syarat ketiga: halaman dan API satu situs (`SameSite=Strict`).** *Cookie* `Strict` hanya ikut pada permintaan dari halaman **satu situs**, dan **situs** (*site*) melihat skema dan nama domain, **tanpa port** (Modul 20 Konsep 9). Jadi `localhost:5173` dan `localhost:8080` adalah **dua asal, tetapi satu situs**: CORS dibutuhkan, dan *cookie* tetap ikut. Sebaliknya, `localhost` dan `127.0.0.1` adalah **dua situs berbeda**, walaupun menunjuk laptop yang sama:

| Halaman dibuka di | API yang diketuk | Satu situs? | Akibatnya |
| :--- | :--- | :--- | :--- |
| `http://localhost:5173` | `http://localhost:8080` | ✅ ya | *Cookie* disimpan dan dikirim: jalur modul ini. |
| `http://127.0.0.1:5173` | `http://localhost:8080` (alamat dipatok di kode) | ❌ tidak | *Login* 200, tetapi *cookie*-nya tidak disimpan; `GET /devices` dijawab 401 dan kamu kembali ke formulir: ***login* berputar** (🚨). |
| `http://127.0.0.1:5173` | `http://127.0.0.1:8080` | ✅ ya | Jalan, asalkan halamannya bisa dibuka (lihat di bawah). |

Karena itu, `src/api.ts` tidak mematok alamat backend. **Alamat API mengikuti nama host halaman**:

```ts
const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");
```

Halaman di `localhost` mengetuk `localhost:8080`, halaman di `127.0.0.1` mengetuk `127.0.0.1:8080` (`location.hostname`), jadi selalu satu situs. `VITE_API_BASE` hanya diisi kalau backend-mu ada di alamat lain (Praktik 4), dengan nama host yang sama dengan halaman. `.replace(…)` membuang garis miring di ujung (`//auth/login` tidak dikenal backend).

Walau begitu, biasakan satu alamat: **`http://localhost:5173`**, yang dicetak Vite. Di laptop Windows penulis, Vite bawaan hanya mendengarkan alamat IPv6 `[::1]`, jadi `http://127.0.0.1:5173` tidak terbuka sama sekali (diagram CORS Modul 20 memakainya hanya sebagai contoh). `HOST` backend **tidak diubah** (tetap `127.0.0.1` sejak Modul 16), dan browser tetap sampai: Chrome dan Edge mencoba `::1` dulu, lalu `127.0.0.1`, jadi koneksi pertamanya hanya sekitar 0,3 detik lebih lambat. Bruno dan curl tetap memakai `http://127.0.0.1:8080`.

Banyak tutorial memakai **proksi Vite** (`server.proxy`) supaya dashboard dan API tampak satu asal. Kita tidak memakainya, karena jalur CORS langsung sudah siap sejak Modul 20; cara proksi ada di [🔬 Bedah Teknis](#-bedah-teknis-opsional).

Kalau ketiga syarat terpenuhi, **Masuk** memicu `OPTIONS /auth/login` (`204`), lalu `POST /auth/login` (`200`, profil akunmu, dan dua `Set-Cookie` yang disimpan browser). Sesudah itu, `GET /devices` dan permintaan lain membawa gelang otomatis.

![Diagram urutan login dari browser (Konsep 9): gelang = cookie akses (15 menit), kartu terusan = cookie sesi (7 hari, hanya ke /auth/…). Dua garis hidup: kiri, halaman dashboard di http://localhost:5173, dibuka dari Vite (npm run dev); kanan, backend v1.0 di http://localhost:8080, tidak berubah sejak Modul 21. Enam tahap dari atas ke bawah. Tahap 1, preflight: browser bertanya dulu karena isinya JSON; halaman mengirim OPTIONS /auth/login dengan kepala Origin: http://localhost:5173, Access-Control-Request-Method: POST, dan Access-Control-Request-Headers: content-type; backend menjawab hijau 204, asal ini boleh dan cookie boleh ikut. Catatan backend: @fastify/cors menjawab sebelum satpam bekerja, dengan access-control-allow-origin: http://localhost:5173 dan access-control-allow-credentials: true. Tahap 2, login: klik Masuk di formulir, dengan credentials: include; halaman mengirim POST /auth/login berisi email viewer@rumah.test dan sandi; backend mencocokkan sandi (Modul 20), lalu membuatkan gelang (JWT) dan kartu terusan (baris baru di tabel sesi), dan menjawab hijau 200 berisi id, email, nama, peran ditambah dua kepala Set-Cookie: akses=…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict dan sesi=…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict. Kotak ungu muda: browser menyimpan gelang akses dan kartu terusan sesi; karena HttpOnly, JavaScript halaman pun tidak bisa membacanya. Tahap 3, selama 15 menit setiap permintaan membawa gelang: GET /devices dengan Cookie: akses=…; GET tanpa kepala khusus tidak memicu preflight; satpam melihat gelang sah dan akun viewer boleh melihat; jawabannya hijau 200, daftar perangkat (JSON). Tahap 4, gelang habis: 15 menit kemudian browser membuang akses; GET /devices dikirim tanpa cookie, satpam tidak menemukan gelang, dan jawabannya merah 401, belum login atau sesi sudah habis. Tahap 5, refresh sekali, dilakukan api.ts sendiri tanpa formulir: POST /auth/refresh dengan Cookie: sesi=…; tanpa body sehingga tanpa preflight, dan sesi ikut karena alamatnya diawali /auth; backend mencocokkan kartu terusan di tabel sesi lalu menggantinya dengan yang baru (rotasi, Modul 20), dan menjawab hijau 200 dengan gelang baru dan kartu terusan baru. Tahap 6, ulangi sekali: permintaan tadi dikirim lagi, GET /devices dengan Cookie: akses=… (gelang baru), dijawab hijau 200 sehingga layar tetap terbuka; semua ini terjadi di dalam minta(), komponen hanya melihat hasilnya. Catatan merah: kalau refresh pun 401 (kartu terusan habis), barulah layar login tampil. Pita ungu di bawahnya: fetch(BASE + jalur, { credentials: include }) di src/api.ts; tanpa credentials, browser tidak melampirkan cookie ke asal lain dan mengabaikan Set-Cookie dari jawabannya; token tidak pernah disimpan di localStorage. Kiri bawah, kotak Asal berbeda, situs sama: asal (origin) adalah skema, nama host, dan port, jadi localhost:5173 berbeda dengan localhost:8080 dan perlu izin CORS (CORS_ORIGIN backend sudah memuatnya sejak Modul 20); situs (site) tidak melihat port, jadi localhost sama dengan localhost dan cookie SameSite=Strict tetap ikut. Kanan bawah, kotak merah Jebakan: 127.0.0.1 dan localhost adalah dua situs; halaman http://127.0.0.1:5173 yang memanggil API di localhost membuat cookie tidak disimpan dan tidak dikirim, sehingga login 200 lalu langsung kembali ke layar login. Obatnya: selalu buka http://localhost:5173; alamat API bawaan mengikuti nama host halaman (location.hostname).](aset/alur-login-browser.png)

**Gelang habis: *refresh* sekali.** Lima belas menit sesudah *login*, browser membuang gelang (`Max-Age=900`), dan permintaan berikutnya dijawab 401. Kartu terusan masih sah, jadi pengguna tidak perlu mengetik sandi lagi. Modul 20 (Praktik 4) sudah berjanji: "kalau jawabannya 401, ketuk `refresh` sekali, lalu ulangi permintaannya". `src/api.ts` menepatinya (Praktik 6):

1. Permintaan biasa, misalnya `GET /devices`, dijawab **401**.
2. `minta()` mengetuk `POST /auth/refresh` **satu kali** lewat `refreshSekali()`. Browser melampirkan kartu terusan, karena jalurnya di bawah `/auth`.
3. Kalau loket menjawab **200**, browser menerima gelang dan kartu terusan baru (rotasi, Modul 20 Konsep 7), lalu permintaan tadi **diulang sekali**. Pengguna tidak merasakan apa-apa, bahkan keesokan harinya.
4. Kalau loket pun menjawab **401** (kartu terusan lewat 7 hari, dicabut, atau tidak ada), barulah 401 diteruskan ke layar: formulir *login* (di tengah pemakaian, dengan kotak `Sesi sudah habis. Silakan masuk lagi.`; Konsep 10).

`/auth/login`, `/auth/refresh`, dan `/auth/logout` tidak pernah memicu *refresh* (daftar `TANPA_REFRESH`): 401 dari loket *login* berarti sandinya salah, dan dari loket *refresh* berarti kartunya sudah habis. Ulangannya pun hanya sekali, supaya dashboard tidak berputar tanpa akhir.

Dua 401 yang datang bersamaan (misalnya dari `StrictMode`, Konsep 8) **menunggu satu *refresh* yang sama** di `refreshSekali()`, karena setiap ketukan di loket mengganti kartunya. Kadang 401 kedua baru tiba sesudah *refresh* pertama selesai, jadi saat halaman dibuka di mode pengembangan, *refresh* biasanya terlihat sekali, kadang dua kali; di hasil *build*, sekali.

***Cookie* `HttpOnly`: dashboard tidak pernah memegang token.** JavaScript tidak bisa membaca *cookie* `HttpOnly`. Ketik `document.cookie` di tab **Console** saat sudah *login*: `akses` dan `sesi` tidak muncul (biasanya teks kosong). Tidak ada satu baris pun kode React kita yang menyentuh token. Akibatnya, dashboard harus bertanya lewat `GET /auth/me` untuk tahu apakah ia sudah *login*, langkah pertama `App.tsx` di Praktik 5.

Banyak tutorial React menyimpan token di `localStorage`. Jangan ikuti bagian itu: skrip asing yang berhasil berjalan di halaman (XSS) cukup membaca `localStorage` lalu mengirim tokennya ke mana saja (Modul 20 Konsep 5). Pintu masuknya nyata: teks dari API (nama dan lokasi perangkat) dan puluhan paket npm di `node_modules` (`audited 45 packages` di Praktik 2), yang salah satunya bisa disusupi. Penangkal pertamanya JSX yang meloloskan (*escape*) teks (Konsep 5). Penangkal keduanya *cookie* `HttpOnly`: skrip asing tetap berbahaya selama halaman terbuka, tetapi gelangnya tidak bisa dibawa kabur.

Formulir *login* minggu ini sengaja minimal. Rute yang dijaga, tampilan khusus `admin` dan `viewer`, serta *logout* yang lebih lengkap menyusul di Modul 24.

> ⬆️ **Sudah membaca Konsep 7 dan 9?** Lanjut ke [Praktik 4 — *State* dan formulir *login*](#praktik-4--state-dan-formulir-login-60-menit). Konsep 8 dan 10 dibaca sebelum Praktik 5.

### 10. Memuat, galat, dan kosong: tiga keadaan yang selalu disiapkan

Bayangkan **papan informasi di stasiun kereta**: ia menulis "memuat" saat jadwal diambil, "gangguan" saat sistemnya bermasalah, dan "tidak ada keberangkatan" saat kereta sudah habis, baru jadwalnya kalau semua beres. Layar dashboard pun begitu: `fetch` butuh waktu, backend bisa mati, dan daftar bisa memang kosong. Tanpa persiapan, layarnya putih, terjebak di tulisan memuat, atau kosong seperti rusak. Karena itu, setiap komponen yang mengambil data menyiapkan **tiga keadaan** di samping hasilnya:

| Keadaan | Kapan terjadi | Yang tampil | Contoh di dashboard |
| :--- | :--- | :--- | :--- |
| **Memuat** | Jawaban belum datang | Tulisan memuat yang tenang (abu-abu) | Sesaat sesudah **Masuk** atau memilih perangkat |
| **Galat** | `fetch` gagal total, atau jawaban berkode galat | Kotak berisi pesan apa yang salah | Backend mati; database mati (503) |
| **Kosong** | Sukses, tetapi tanpa isi | Kalimat yang menjelaskan mengapa kosong | `GET /devices` menjawab `[]` |
| **Berhasil** | Sukses dan berisi | Datanya | Daftar perangkat, kartu sensor |

Komponen seperti `DaftarPerangkat` cukup memegang dua papan tulis kecil (*state*, Konsep 7): **data** (masih `null` selama memuat) dan **pesan galat**. Urutan memeriksanya: **galat dulu, lalu memuat, lalu kosong, baru isinya**. Kalau galat diperiksa terakhir, layar yang gagal terjebak di tulisan memuat.

`api.ts` mengambil pesan galat dari kolom `pesan` (backend kita) atau `message` (galat bawaan Fastify: 400, 429, 500), lalu melemparkan `GalatApi` berisi pesan itu dan `kode` HTTP-nya. Kalau `fetch` gagal total, `api.ts` menulis pesan ramah yang menyebut alamat backend. Dengan `kode`, layar bisa membedakan dua jawaban yang **bukan galat biasa**:

- **401 berarti sesi benar-benar habis**, karena `api.ts` sudah mencoba *refresh* dan gagal (Konsep 9). Layar kembali ke formulir *login* dengan kotak `Sesi sudah habis. Silakan masuk lagi.`, bukan kotak galat di layar data. Saat halaman baru dibuka, 401 dari `GET /auth/me` berarti belum *login*: formulir polos; galat lain menjadi `galatAwal` di atasnya (Praktik 5).
- **404 dari `GET /devices/:id/latest` berarti belum ada bacaan, bukan kerusakan.** Bacaan terbaru disimpan di **memori** backend, jadi sesudah backend dinyalakan ulang, setiap perangkat dijawab 404 `belum ada telemetry dari <id>` sampai kiriman berikutnya; perangkat yang baru didaftarkan juga begitu. `DetailPerangkat` menampilkan catatan netral, bukan kotak merah (Praktik 6).

Satu keadaan kecil lagi ada di dalam kartu: bacaan sensor yang gagal ditulis `null`, bukan 0 (aturan 7 kontrak data). `KartuSensor` menampilkannya sebagai **"—"** abu-abu tanpa satuan, supaya sensor yang gagal dibaca tidak tampak sama dengan suhu 0 °C.

![Diagram tiga keadaan layar (Konsep 10), seperti papan informasi stasiun yang selalu memberi kabar, dengan contoh komponen DaftarPerangkat dan GET /devices. Pita atas: 1 layar tampil dulu, 2 useEffect memanggil GET /devices, 3 jawaban datang lalu setPerangkat(…) atau setGalat(…), 4 React menggambar ulang. Di bawahnya, empat layar HP berjudul Rumah Pintar Mini dan Daftar Perangkat. Pertama, pil abu-abu memuat: layar bertuliskan Memuat perangkat…; syaratnya perangkat === null; jawaban belum datang, jadi tulis kabarnya, jangan layar kosong. Kedua, pil merah galat: kotak merah bertuliskan Tidak bisa menghubungi server di http://localhost:8080. Mungkin backend belum menyala, atau halaman ini dibuka dari alamat yang tidak diizinkan backend (buka http://localhost:5173, lihat CORS_ORIGIN).; syaratnya galat !== null; backend mati, salah alamat, atau ditolak, jadi tampilkan pesan yang bisa ditindaklanjuti. Ketiga, pil abu-abu kosong: layar bertuliskan Belum ada perangkat terdaftar (pendaftaran perangkat: Modul 21).; syaratnya perangkat.length === 0; jawabannya berhasil, tetapi daftarnya kosong karena belum ada perangkat terdaftar (Modul 21). Keempat, pil hijau berhasil, dengan catatan nama dari Modul 21: tiga kartu perangkat urut device_id, masing-masing berisi nama, lalu lokasi dan device_id, lalu lencana. Node 2 kebun (kebun, 246f28b1c7d4) dengan lencana online dan lewat penghubung, Node 1 ruang tamu (ruang tamu, a4cf12e5b7c0) dengan lencana online dan kunci aktif, serta Latihan ruang tamu (ruang tamu, f00d00000001) dengan lencana online dan kunci aktif; syaratnya perangkat.map(…); satu kartu per perangkat, dan kartu yang diklik membuka Detail Perangkat. Catatan tengah: urutan pemeriksaan di kode adalah if (galat !== null), lalu if (perangkat === null), lalu if (perangkat.length === 0), lalu daftar. Bawah, tiga kasus khusus. Kiri, pil merah 401, sesi habis: gelang habis, dan refresh sekali pun gagal (Konsep 9), maka onSesiHabis() membuat App menampilkan layar login lagi, dengan pesan Sesi sudah habis. Silakan masuk lagi.; bukan kotak galat di layar daftar. Tengah, pil abu-abu 404 di /devices/:id/latest: kotak putih netral bertuliskan Belum ada bacaan dari perangkat ini sejak backend dinyalakan. Tunggu kiriman berikutnya, lalu buka lagi.; backend baru dinyalakan dan perangkat belum mengirim bacaan, jadi ini catatan netral, bukan galat. Kanan, pil abu-abu null menjadi tanda pisah: kartu Kelembapan bernilai —, karena sensor gagal dibaca (aturan 7 kontrak data); kartu menulis —, bukan 0, sebab nol adalah bacaan sungguhan, misalnya tanah yang benar-benar kering.](aset/tiga-keadaan-layar.png)

> ⬆️ **Sudah membaca Konsep 8 dan 10?** Lanjut ke [Praktik 5 — `useEffect`: siapa saya dan daftar perangkat](#praktik-5--useeffect-siapa-saya-dan-daftar-perangkat-60-menit), lalu [Praktik 6 — Detail perangkat: bacaan terbaru semua sensor](#praktik-6--detail-perangkat-bacaan-terbaru-semua-sensor-60-menit). Konsep 11 dibaca sebelum Praktik 7.

### 11. Responsif: satu halaman untuk HP dan laptop

Syarat lulus modul ini berakhir dengan **rapi di layar HP**. Di Praktik 7, kamu memeriksa dashboard di **375 px** (HP), **768 px** (tablet), dan **1280 px** (laptop): bukan tiga halaman, melainkan **satu halaman yang susunannya menyesuaikan lebar layar**. Itulah **responsif**, seperti koran yang dibentangkan di meja dan dilipat di genggaman.

**Mulai dari layar HP (*mobile first*).** Di Tailwind, kelas **tanpa awalan** berlaku di **semua** lebar layar, termasuk HP. Kelas berawalan, misalnya `sm:`, baru berlaku **mulai** lebar tertentu **ke atas**. Titik-titik lebar itu disebut ***breakpoint*** (`rem` mengikuti ukuran huruf dasar browser; bawaannya 1rem = 16 px):

| Awalan | Berlaku mulai lebar | Aturan CSS-nya |
| :--- | :--- | :--- |
| `sm:` | 40rem (640 px) | `@media (width >= 40rem)` |
| `md:` | 48rem (768 px) | `@media (width >= 48rem)` |
| `lg:` | 64rem (1024 px) | `@media (width >= 64rem)` |

Jebakannya: **`sm:` bukan berarti "di layar kecil"**, melainkan "mulai `sm` ke atas". Jadi, gaya untuk HP ditulis **tanpa awalan**, lalu layar yang lebih lebar diberi awalan:

- `text-center sm:text-left`: rata tengah di HP, rata kiri mulai 640 px.
- `grid grid-cols-1 sm:grid-cols-2`: satu kolom di HP, dua kolom berdampingan mulai 640 px.

**Meta *viewport*: satu baris yang wajib ada.** Templat Vite sudah menulisnya di `<head>` berkas `index.html` (halaman sakelar Modul 10 pun punya baris serupa, Konsep 2):

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Tanpa baris itu, browser HP bisa menggambar halaman di jendela maya yang lebih lebar dari layarnya, lalu memperkecilnya: tulisan menjadi kecil sekali, dan `sm:` serta `md:` ikut menyala. Baris itu meminta lebar halaman sama dengan lebar layar (`width=device-width`), tanpa diperbesar atau diperkecil (`initial-scale=1.0`). Saat merapikan `index.html` di Praktik 2, **jangan hapus baris ini**.

**Mencoba lebar HP tanpa HP: mode perangkat DevTools.** Di Chrome atau Edge, buka DevTools (**F12**), lalu tekan **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**). Halaman tampil di bingkai yang lebarnya bisa kamu ketik, misalnya `375` (Praktik 7). Ini hanya **perkiraan pertama**, karena kodenya tetap berjalan di laptop, tetapi cukup untuk tata letak. HP sungguhan lewat WiFi butuh backend dan Vite yang dibuka ke jaringan, padahal aturan aman minggu ini melarangnya. Caranya ada di [🔬 Bedah Teknis](#-bedah-teknis-opsional) sebagai pilihan; resminya mulai Modul 23.

**Tanda dashboard sudah rapi di HP** (diperiksa di Praktik 7):

- **Tidak ada gulir mendatar.** Halaman hanya bisa digulir ke bawah.
- **Kartu utuh**, tidak terpotong di tepi layar.
- **Teks panjang tidak tumpah.** Nama perangkat atau `device_id` yang panjang dipotong dengan elipsis (`truncate`, dibantu `min-w-0` di dalam kisi atau baris *flex*), dan kepala halaman (judul, nama akun, tombol **Keluar**) tidak meluber.
- **Tombol cukup besar untuk jari.**

Dua catatan untuk HP. Gaya `hover:` Tailwind v4 hanya aktif di perangkat yang punya kursor, jadi jangan menyembunyikan informasi penting di baliknya. Tailwind v4 juga butuh Chrome 111+, Safari 16.4+, atau Firefox 128+, sehingga di HP yang sangat lama, dashboard bisa tampil tanpa gaya (🚨).

> ⬆️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 7 — Rapi di layar HP](#praktik-7--rapi-di-layar-hp-40-menit), lalu [Praktik 8 — Uji kelulusan: *build*, *lint*, dan gladi bersih](#praktik-8--uji-kelulusan-build-lint-dan-gladi-bersih-35-menit).

## 🔧 Praktik langkah demi langkah

Delapan praktik membangun dashboard v0.1 sedikit demi sedikit. **Praktik 1** dikerjakan dengan tangan di repositori latihan `belajar-iot`, tanpa memasang paket; berkasnya ada di [`kode/praktik-1/`](kode/praktik-1/). Mulai **Praktik 2**, semua pekerjaan tinggal di folder `frontend` repositori `rumah-pintar-mini`, di cabang `fitur/dashboard`. Setiap praktik diakhiri *commit* ke cabang itu, yang baru digabung ke `main` lewat *pull request* "dashboard v0.1" di [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini).

Keadaan folder `frontend` di akhir Praktik 2 sampai 7 ada di [`kode/tahap/`](kode/tahap/) (misalnya `kode/tahap/praktik-4/frontend/`), dan keadaan akhir v0.1.0 ada di [`kode/frontend/`](kode/frontend/). Folder tahap tanpa `node_modules` dan `package-lock.json`, jadi pakailah untuk membandingkan berkas demi berkas, bukan untuk menggantikan seluruh foldermu. Langkah bertanda ⭐ (4.4, 6.4, 7.4, dan 8.4) adalah bukti syarat lulus.

### Praktik 1 — HTML, CSS, dan JavaScript dengan tangan: membedah halaman Modul 10 (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder repositori `belajar-iot` (di 1.6 ditambah jendela kedua dengan folder `rumah-pintar-mini` untuk menjalankan `penerima-webhook.js` Modul 4), **File Explorer** (macOS: **Finder**) untuk membuka berkas dengan klik dua kali, dan browser **Google Chrome** atau **Microsoft Edge** beserta DevTools-nya: tab **Elements** dan **Console**, serta mode perangkat. Backend, Docker, dan Vite belum dipakai. Konsep yang dipakai: 1–2.

Praktik ini menepati janji Modul 10: halaman sakelar Node 1 dibedah lapis demi lapis, diberi **kulit** (CSS) dan **otot** (JavaScript) buatanmu, lalu dicoba di lebar HP, dan di tengahnya kamu melihat **browser sendiri** menahan permintaan karena CORS. Node 1 tidak perlu menyala, dan tombol lampunya hanya mengubah tulisan di layar; kendali sungguhan dari dashboard baru datang di Modul 24.

#### 1.1 Siapkan folder `halaman` (3 menit)

Buka folder **`belajar-iot`** di VS Code (**File → Open Folder…**); folder `modul-22` sudah berisi hasil 🔁 Pemanasan dan 🏆 Kemenangan Cepat. Klik kanan folder **`modul-22`** di panel Explorer → **New Folder…**, lalu beri nama **`halaman`**:

```text
belajar-iot/
└── modul-22/
    ├── package.json                     🔁 Pemanasan
    ├── pemanasan.js                     🔁 Pemanasan
    ├── kartu.html                       🏆 Kemenangan Cepat
    └── halaman/                         BARU
        ├── halaman-m10-asli.html        langkah 1.2
        ├── halaman-m10-kulit-otot.html  langkah 1.4–1.5
        └── formulir-webhook.html        langkah 1.6
```

#### 1.2 Salin halaman Node 1 dari Modul 10: `halaman-m10-asli.html` (5 menit)

Klik kanan folder **`halaman`** → **New File…**, beri nama **`halaman-m10-asli.html`**, lalu ketik atau tempel teks ini apa adanya:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Rumah</title>
</head>
<body style="font-family: sans-serif; font-size: 20px; padding: 16px">
<h2>Node 1 Rumah</h2>
<p>Lampu: <b>PADAM</b></p>
<p><a href="/on">Nyalakan lampu</a></p>
<p><a href="/off">Matikan lampu</a></p>
<p>Suhu 28.4&nbsp;&deg;C, kelembapan 71&nbsp;%<br>
Cahaya 2310, tanah 37&nbsp;%<br>
Air tandon 64&nbsp;%</p>
<p><small>Firmware 1.1.0, 17-10-2026 08:32 WIB</small></p>
</body>
</html>
```

Simpan (**Ctrl + S**). Isinya sama dengan teks `HALAMAN` dari `jaringan.cpp` di [Konsep 2](#2-browser-dan-devtools-membedah-sakelar-modul-10), hanya saja kedelapan penanda `%…%` sudah diisi seperti ilustrasi [➕ F Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md#f--matikan-lampu-dari-hp) (`%LAMPU%` menjadi `PADAM`, `%SUHU%` menjadi `28.4`, dan seterusnya), persis kerja `html.replace()` di ESP32. Inilah surat yang dulu diterima browser HP dari Node 1. Halamannya disalin karena server web `/on` `/off` sudah dipensiunkan di Modul 11. Jangan merapikan apa pun: `<html>` tanpa `lang`, judul `<h2>`, dan tautan `/on` `/off` adalah bahan bedah.

#### 1.3 Membaca kerangkanya di tab Elements (10 menit)

**Buka halamannya.** Klik kanan `halaman-m10-asli.html` di panel Explorer → **Reveal in File Explorer** (macOS: **Reveal in Finder**), lalu klik dua kali berkasnya. Kalau yang terbuka browser lain, seret berkasnya ke jendela Chrome atau Edge.

**Hasilnya:** tab bertuliskan `Node 1 Rumah`, berisi tampilan polos seperti ilustrasi Modul 10: judul tebal, `Lampu: PADAM`, dua tautan biru bergaris bawah, tiga baris bacaan, dan baris kecil `Firmware 1.1.0, 17-10-2026 08:32 WIB`. Alamatnya diawali `file:///`: halaman ini dibaca dari berkas, bukan dari server.

**Lihat sumbernya.** Tekan **Ctrl + U** (macOS: **Cmd + Option + U**). Tab baru menampilkan **sumber** halaman: 18 baris, sama persis dengan berkasmu. Tutup tab itu.

**Bedah kerangkanya.** Tekan **F12** (macOS: **Cmd + Option + I**), lalu pilih tab **Elements**. Buka segitiga kecil di depan `<body …>` kalau perlu, lalu arahkan kursor ke baris `<h2>`, `<p>`, dan `<a>`: bagian halaman yang sesuai ikut tersorot. Itulah pohon DOM dari Konsep 2.

**Cari kulit dan ototnya.** Klik baris `<body style="…">`. Di bagian **Styles**, kotak `element.style` berisi `font-family: sans-serif;`, `font-size: 20px;`, dan `padding: 16px;`: itulah **seluruh kulit** halaman ini. Aturan di bawahnya berlabel `user agent stylesheet` (gaya bawaan browser), begitu pula biru dan garis bawah `<a href="/on">` kalau barisnya kamu klik. Di seluruh pohon tidak ada `<script>`: ototnya tinggal di ESP32. Hasil bedahnya: kerangka hampir semuanya, kulit satu atribut, otot nihil.

**Ketuk tautannya.** Klik **Nyalakan lampu** di halaman.

**Hasilnya:** browser pindah ke `file:///C:/on` (macOS: `file:///on`) dan menampilkan halaman galat berkode `ERR_FILE_NOT_FOUND`. Judulnya di Chrome `Your file couldn’t be accessed` (Chrome berbahasa Indonesia: `File Anda tidak dapat diakses`), dan di Edge `File not found` (Edge berbahasa Indonesia: `File tidak ditemukan`).

Tautan meminta **halaman baru** dari alamat `/on` di "server" asal halamannya. Di HP, servernya Node 1, yang menyalakan relay lalu mengirim halaman baru; di laptop, "server"-nya disk, dan berkas `on` di akar drive tentu tidak ada. Tekan **Alt + ←** (macOS: **Cmd + [**) untuk kembali.

#### 1.4 Kulit: `<style>` dan kelas (12 menit)

Buat berkas baru **`halaman-m10-kulit-otot.html`** di folder **`halaman`**, lalu isi dengan kode di bawah: halaman yang sama sesudah diberi kulit (langkah ini) **dan** otot (1.5). Berkasnya 220 baris, penuh komentar penjelasan; ketik sendiri, atau buka [`kode/praktik-1/halaman-m10-kulit-otot.html`](kode/praktik-1/halaman-m10-kulit-otot.html) di GitHub, klik **Copy raw file**, lalu tempel.

```html
<!DOCTYPE html>
<!--
  halaman-m10-kulit-otot.html - Praktik 1 Modul 22: halaman Node 1 Rumah dari Modul 10, sesudah diberi
  KULIT (CSS, langkah 1.4) dan OTOT (JavaScript, langkah 1.5).
  Aslinya ada di halaman-m10-asli.html: teks HALAMAN di jaringan.cpp Node 1 v1.1 seperti yang diterima browser HP,
  yaitu sesudah ESP32 mengganti penanda %LAMPU%, %SUHU%, dan kawan-kawannya dengan angka contoh.
  Versi ini berdiri sendiri: cukup klik dua kali berkasnya. Tanpa ESP32, tanpa internet.
  Bagian yang berbeda dari aslinya ditandai BEDA-1 sampai BEDA-7, lengkap dengan alasannya.
  Tombolnya hanya mengubah tampilan di layar ini. Tidak ada relay yang bergerak (kendali dari dashboard: Modul 24).
-->
<!-- BEDA-1: aslinya <html> saja. lang="id" memberi tahu browser dan pembaca layar bahwa isinya berbahasa Indonesia. -->
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Rumah</title>

<!-- ===================== KULIT (CSS), langkah 1.4 ===================== -->
<!-- BEDA-2: aslinya hanya satu atribut style="..." di <body>. Di sini semua aturan tampilan dikumpulkan
     di dalam <style>, lalu dipasang lewat nama class. Kerangkanya jadi bersih, dan satu aturan
     (misalnya .kartu) berlaku untuk banyak elemen sekaligus. -->
<style>
  * {
    box-sizing: border-box; /* lebar kotak sudah termasuk padding dan border (box model) */
  }
  body {
    font-family: sans-serif; /* tiga baris ini persis isi style="..." aslinya */
    font-size: 20px;
    padding: 16px;
    margin: 0;               /* mulai dari sini: tambahan versi polos */
    color: #1e293b;
    background: #f1f5f9;
  }
  .halaman {
    max-width: 480px;        /* di laptop tidak melebar ke mana-mana */
    margin: 0 auto;          /* auto kiri-kanan = di tengah */
  }
  h1 {
    font-size: 28px;
    margin: 0 0 12px;
  }
  .keadaan b {
    padding: 2px 10px;
    border-radius: 999px;    /* sudut sangat bulat = bentuk kapsul */
    background: #e2e8f0;
  }
  .keadaan b.menyala {       /* class "menyala" dipasang JavaScript saat lampu menyala */
    background: #fde68a;
    color: #78350f;
  }
  .baris-tombol {
    display: flex;           /* flexbox: anak-anaknya berjajar ke samping */
    gap: 8px;
    margin-bottom: 16px;
  }
  .tombol {
    flex: 1;                 /* dua tombol berbagi lebar sama rata */
    min-height: 44px;        /* cukup besar untuk jempol */
    font: inherit;
    font-size: 16px;
    color: inherit;          /* tombol tidak otomatis mewarisi warna teks halaman */
    border: 1px solid #94a3b8;
    border-radius: 8px;
    background: white;
    cursor: pointer;
  }
  .tombol:hover {
    background: #e2e8f0;
  }
  .tombol:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .daftar-kartu {
    display: flex;
    flex-wrap: wrap;         /* kalau tidak muat, kartu turun ke baris berikutnya */
    gap: 8px;
  }
  .kartu {
    flex: 1 1 130px;         /* lebar dasar 130px, boleh melebar mengisi sisa baris */
    padding: 12px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
  }
  .kartu-label {
    display: block;
    font-size: 14px;
    color: #64748b;
  }
  .kartu-nilai {
    font-size: 26px;
    font-weight: 600;
  }
  .kartu-satuan {
    margin-left: 4px;
    font-size: 16px;
    color: #94a3b8;
  }
  .catatan {
    color: #64748b;
  }
</style>
</head>
<body>

<!-- ===================== KERANGKA (HTML), dari halaman aslinya ===================== -->
<main class="halaman">
  <!-- BEDA-3: aslinya <h2>. Judul utama sebuah halaman sebaiknya <h1>. -->
  <h1>Node 1 Rumah</h1>

  <!-- BEDA-4: di jaringan.cpp aslinya %LAMPU%, penanda yang diganti ESP32 sebelum halaman dikirim.
       Di berkas lokal tidak ada ESP32, jadi teks awalnya ditulis langsung,
       lalu JavaScript menggantinya lewat id="teks-lampu". -->
  <p class="keadaan">Lampu: <b id="teks-lampu">PADAM</b></p>

  <!-- BEDA-5: aslinya dua tautan, <a href="/on"> dan <a href="/off">. Tautan meminta HALAMAN BARU dari server.
       Dari berkas lokal, browser malah mencari berkas bernama "on" di akar drive dan gagal.
       Untuk AKSI (mengubah sesuatu), tombol <button> lebih tepat: ia tidak berpindah halaman,
       jadi memuat ulang halaman tidak mengirim perintah sekali lagi (lihat 🔬 Modul 10). -->
  <div class="baris-tombol">
    <button type="button" class="tombol" id="tombol-on">Nyalakan lampu</button>
    <button type="button" class="tombol" id="tombol-off">Matikan lampu</button>
  </div>

  <!-- BEDA-6: aslinya satu paragraf dengan <br>. Di sini setiap bacaan menjadi satu "kartu" berpola sama:
       label, angka, satuan. Pola berulang inilah cikal bakal komponen KartuSensor di React. -->
  <div class="daftar-kartu">
    <div class="kartu">
      <span class="kartu-label">Suhu</span>
      <span class="kartu-nilai" id="nilai-suhu">--</span><span class="kartu-satuan">&deg;C</span>
    </div>
    <div class="kartu">
      <span class="kartu-label">Kelembapan</span>
      <span class="kartu-nilai" id="nilai-kelembapan">--</span><span class="kartu-satuan">%</span>
    </div>
    <div class="kartu">
      <span class="kartu-label">Cahaya</span>
      <span class="kartu-nilai" id="nilai-cahaya">--</span><span class="kartu-satuan">/4095</span>
    </div>
    <div class="kartu">
      <span class="kartu-label">Tanah</span>
      <span class="kartu-nilai" id="nilai-tanah">--</span><span class="kartu-satuan">%</span>
    </div>
    <div class="kartu">
      <span class="kartu-label">Air tandon</span>
      <span class="kartu-nilai" id="nilai-air">--</span><span class="kartu-satuan">%</span>
    </div>
  </div>

  <p class="catatan"><small>Firmware <span id="teks-fw">--</span>, <span id="teks-jam">jam belum disetel</span></small></p>
</main>

<!-- ===================== OTOT (JavaScript), langkah 1.5 ===================== -->
<!-- BEDA-7: aslinya TIDAK ADA JavaScript sama sekali. "Otot"-nya ada di ESP32: html.replace() mengisi penanda,
     dan server.on() menangani /on dan /off. Di sini otot pindah ke browser: data disimpan di satu objek,
     lalu fungsi tampilkan() menuliskannya ke layar setiap kali data berubah. -->
<script>
  // Data contoh, sama dengan angka di ilustrasi hp-node1.png Modul 10.
  // Di versi asli, angka ini dibaca sensor dan disisipkan ESP32 ke halaman sebelum dikirim.
  const keadaan = {
    lampu: false,
    suhu: 28.4,
    kelembapan: 71,
    cahaya: 2310,
    tanah: 37,
    level_air: 64,
    fw: "1.1.0",
    jam: "17-10-2026 08:32 WIB",
  };

  // Sama seperti angkaAtauStrip() di jaringan.cpp: bacaan yang gagal (null) ditulis "--".
  function angkaAtauStrip(nilai) {
    if (nilai === null) {
      return "--";
    }
    return String(nilai);
  }

  // Tulis SELURUH keadaan ke layar. Dipanggil sekali di awal, lalu setiap kali keadaan berubah.
  function tampilkan() {
    const teksLampu = document.querySelector("#teks-lampu");
    teksLampu.textContent = keadaan.lampu ? "MENYALA" : "PADAM";
    teksLampu.classList.toggle("menyala", keadaan.lampu); // pasang class kalau menyala, lepas kalau padam

    document.querySelector("#tombol-on").disabled = keadaan.lampu;   // tombol yang tidak berguna dibuat redup
    document.querySelector("#tombol-off").disabled = !keadaan.lampu;

    let teksSuhu = "--";
    if (keadaan.suhu !== null) {
      teksSuhu = keadaan.suhu.toFixed(1); // satu angka di belakang koma, seperti String(b.suhu, 1) di ESP32
    }
    document.querySelector("#nilai-suhu").textContent = teksSuhu;
    document.querySelector("#nilai-kelembapan").textContent = angkaAtauStrip(keadaan.kelembapan);
    document.querySelector("#nilai-cahaya").textContent = String(keadaan.cahaya);
    document.querySelector("#nilai-tanah").textContent = String(keadaan.tanah);
    document.querySelector("#nilai-air").textContent = angkaAtauStrip(keadaan.level_air);
    document.querySelector("#teks-fw").textContent = keadaan.fw;
    document.querySelector("#teks-jam").textContent = keadaan.jam;
  }

  // Versi asli: browser pindah ke /on, ESP32 menyalakan relay, lalu mengirim halaman baru yang utuh.
  // Versi ini: cukup ubah data, lalu tampilkan ulang. Halamannya tidak dimuat ulang.
  function aturLampu(nyala) {
    keadaan.lampu = nyala;
    if (nyala) {
      console.log("Versi asli akan meminta GET /on ke ESP32");
    } else {
      console.log("Versi asli akan meminta GET /off ke ESP32");
    }
    tampilkan();
  }

  document.querySelector("#tombol-on").addEventListener("click", () => aturLampu(true));
  document.querySelector("#tombol-off").addEventListener("click", () => aturLampu(false));

  tampilkan(); // tampilan pertama
</script>
</body>
</html>
```

Simpan, lalu buka di browser seperti di 1.3.

**Hasilnya:** halaman yang sama kini berkulit. Latarnya abu-abu muda, isinya satu kolom selebar 480 px di tengah, dan `PADAM` duduk di dalam kapsul abu-abu. Di bawahnya, dua tombol putih bersudut bulat berjajar sama lebar (**Matikan lampu** tampak redup), lalu lima kartu putih berisi label, angka, dan satuan, dari `Suhu` `28.4` `°C` sampai `Air tandon` `64` `%`, dan baris kecil firmware.

Komentar `BEDA-1` sampai `BEDA-7` menandai setiap perbedaan dari aslinya beserta alasannya. Empat mengurus kerangka dan kulit: `BEDA-1` (baris 11–12) menambah `lang="id"`, `BEDA-2` (19–103) memindahkan kulit dari atribut `style` ke blok `<style>` yang dipasang lewat nama `class`, `BEDA-3` (109–110) mengganti `<h2>` dengan `<h1>`, dan `BEDA-6` (126–149) memecah paragraf ber-`<br>` menjadi lima kotak `.kartu` berisi label, angka, dan satuan, cikal bakal `KartuSensor` di Praktik 3.

Aturan terpenting di dalam `<style>`:

- **Baris 34–37:** `.halaman` paling lebar 480 px, dan `margin: 0 auto` menaruhnya di tengah layar.
- **Baris 51–85:** `display: flex` (***flexbox***) membuat anak-anak sebuah wadah berjajar ke samping. `flex: 1` membagi lebar kedua tombol sama rata, dan `min-height: 44px` cukup besar untuk jempol (di Praktik 7 menjadi kelas Tailwind `min-h-11`). `flex: 1 1 130px` membuat kartu mulai dari 130 px lalu melebar mengisi baris, dan `flex-wrap: wrap` menurunkan kartu yang tidak muat (kamu lihat di 1.7).
- **Baris 42–50:** `.keadaan b` (*selector* keturunan) berarti "`<b>` yang ada **di dalam** elemen ber-`class="keadaan"`". `.keadaan b.menyala` mewarnainya kuning, tetapi hanya kalau `<b>`-nya juga berkelas `menyala`, yang baru dipasang otot di 1.5. Di baris 67–73, `:hover` dan `:disabled` adalah **keadaan** tombol: saat kursor di atasnya, dan saat tombolnya dimatikan.

**`class`** dipakai kulit untuk banyak elemen sekaligus (`class="kartu"` muncul lima kali), sedangkan **`id`** menandai satu elemen saja (`id="nilai-suhu"`) yang dicari otot di 1.5. [Konsep 3](#3-tailwind-css-v4-kulit-dari-kelas-kelas-kecil) meringkas aturan seperti ini menjadi kelas pendek, misalnya `gap: 8px` menjadi `gap-2`.

Sekarang bedah kulitnya di DevTools:

1. Klik kanan **tulisan** `Suhu` di kartu pertama → **Inspect** (Chrome berbahasa Indonesia: **Inspeksi**; Edge berbahasa Indonesia: **Periksa**). Di tab **Elements**, klik baris `<div class="kartu">` tepat di atas baris yang tersorot. Di bagian **Styles**, arahkan kursor ke baris `border` aturan `.kartu`, lalu hilangkan centang di kotak kecil di depannya: garis tepi **kelima** kartu hilang bersamaan, karena satu aturan berlaku untuk semuanya. Centang lagi.
2. Klik baris `<div class="daftar-kartu">`, lalu hilangkan centang `display: flex`. Tanpa *flexbox*, kartu-kartu bertumpuk ke bawah, masing-masing selebar kolom.
3. Tekan **F5** (macOS: **Cmd + R**). Semuanya kembali, karena DevTools hanya mengubah salinan halaman di browser; perubahan yang ingin disimpan ditulis di berkasnya lewat VS Code.

#### 1.5 Otot: tombol yang mengubah tulisan tanpa memuat ulang (12 menit)

Gulir ke blok `<script>` (baris 158–218). Tiga tanda sisanya mengurus otot: `BEDA-4` (112–115) mengganti penanda `%LAMPU%` dengan teks awal yang nanti diganti JavaScript lewat `id`; `BEDA-5` (117–124) mengganti tautan dengan `<button type="button" …>`, karena tautan berarti **pindah halaman** dan tombol berarti **aksi**, sehingga memuat ulang tidak memerintah apa pun lagi (🔬 Modul 10); dan `BEDA-7` (155–218) memindahkan otot dari ESP32 ke browser:

- **`const keadaan = { … }`** (baris 161–170) menyimpan **semua** data layar di satu objek. Bacaan yang `null` ditulis `--` oleh `angkaAtauStrip()`, tiruan fungsi bernama sama di `jaringan.cpp`.
- **`tampilkan()`** (181–200) menulis isi `keadaan` ke layar. `document.querySelector("#teks-lampu")` mencari elemen ber-`id` `teks-lampu` (`#` berarti `id`, seperti di CSS), `.textContent = …` mengganti tulisannya, `classList.toggle("menyala", keadaan.lampu)` memasang atau melepas kelas `menyala`, dan `.disabled` meredupkan tombol.
- **`aturLampu(nyala)`** (204–212) mengubah data, mencatat lewat `console.log`, lalu memanggil `tampilkan()`. Baris 214–215 mendaftarkannya: `addEventListener("click", () => aturLampu(true))` artinya "kalau tombol ini diklik, jalankan `aturLampu(true)`", mirip `server.on("/on", tanganiOn)` di ESP32.
- **`tampilkan();`** (217) menggambar layar pertama kali, jadi kartu langsung berisi angka walaupun kerangkanya menulis `--`. Blok `<script>` ditaruh di akhir `<body>` supaya elemen di atasnya sudah ada.

Sekarang coba ototnya:

1. Buka tab **Console** di DevTools (**F12** kalau belum terbuka). Klik **Nyalakan lampu**, lalu **Matikan lampu**.

   **Hasilnya:** `PADAM` berganti `MENYALA` di dalam kapsul kuning, **Nyalakan lampu** meredup, dan **Matikan lampu** aktif; klik kedua mengembalikan semuanya, tanpa memuat ulang dan tanpa mengubah alamat. Console mencatat dua baris, masing-masing bertautan ke baris `console.log`-nya di ujung kanan (`halaman-m10-kulit-otot.html:207` dan `:209`):

   ```text
   Versi asli akan meminta GET /on ke ESP32
   Versi asli akan meminta GET /off ke ESP32
   ```

2. Di tab **Elements**, klik kedua tombol bergantian. Pada baris `<b id="teks-lampu">`, **Nyalakan lampu** memunculkan `class="menyala"`, dan **Matikan lampu** melepas kata `menyala` sehingga tersisa `class` kosong. Tombol yang redup mendapat atribut `disabled`. Begitulah JavaScript mengubah DOM, dan kulit dari 1.4 langsung mengikutinya.

3. Kembali ke tab **Console** dan ketik baris-baris berikut satu per satu, masing-masing diakhiri **Enter**. Ketik sendiri, jangan ditempel: selama kamu baru sedikit memakai Console, Chrome dan Edge menolak tempelan dengan peringatan berbahasa Inggris (perlindungan dari penipu), sampai kamu mengetik `allow pasting` atau sudah mengetik sendiri lima perintah.

   ```text
   keadaan.suhu = 31.2
   tampilkan()
   keadaan.kelembapan = null
   keadaan.fw = "<b>tebal?</b>"
   tampilkan()
   ```

   Sesudah baris pertama, Console menjawab `31.2`, tetapi kartu Suhu **tetap** `28.4`: tidak ada yang menggambar ulang, jadi layarnya **basi**. Sesudah `tampilkan()`, kartunya menjadi `31.2` (balasan `undefined` berarti fungsinya tidak mengembalikan nilai). Sesudah `tampilkan()` kedua, Kelembapan menulis `--`, dan baris firmware menulis `<b>tebal?</b>` apa adanya, tidak tebal, karena `textContent` selalu memasang **teks**, bukan HTML; sifat inilah yang menjaga dashboard dari XSS ([Konsep 5](#5-react-dan-jsx-halaman-dari-balok-lego)). **F5** mengembalikan semuanya, karena `keadaan` hanya hidup di memori halaman.

Pola **ubah data dulu, lalu gambar ulang layarnya** adalah ide dasar React. Di sini kamu sendiri yang harus ingat memanggil `tampilkan()`; di React, mengubah *state* menggambar ulang layar secara otomatis ([Konsep 7](#7-state-dan-usestate-layar-yang-ingat)). Tidak seperti Modul 10, yang meminta halaman utuh baru di setiap ketukan, halaman ini dimuat sekali, lalu hanya bagian yang berubah yang diganti, seperti dashboard nanti.

> [!NOTE]
> **Kalau tombolnya diam saja**, lihat tab **Console**. `Cannot read properties of null (reading 'addEventListener')` berarti `querySelector` tidak menemukan elemennya (biasanya `id` di kerangka dan di `"#tombol-on"` tidak sama persis), dan galat berakhiran `is not defined` berarti nama salah ketik. Nomor baris di ujung kanan galat menunjuk tempatnya.

Di lebar HP 375 px, halaman aslinya dan halaman buatanmu, sebelum dan sesudah **Nyalakan lampu** diketuk, tampak seperti ini (tangkapannya lewat server kecil di `localhost`, bukan klik dua kali, tetapi isinya sama):

![Komposit tiga tangkapan layar asli di Microsoft Edge mode HP 375 px; berkas Praktik 1 dibuka lewat http://localhost, bukan file://; judul: Halaman sakelar Modul 10 dibedah: kerangka polos, lalu kulit dan otot. Kiri, Asli: halaman Node 1 Modul 10, latar putih dengan gaya bawaan browser: judul tebal Node 1 Rumah, Lampu: PADAM, dua tautan biru bergaris bawah Nyalakan lampu dan Matikan lampu (nomor 1), tiga baris Suhu 28.4 °C, kelembapan 71 %, Cahaya 2310, tanah 37 %, Air tandon 64 % (nomor 2), dan Firmware 1.1.0, 17-10-2026 08:32 WIB. Tengah, Berkulit + berotot (awal), latar abu-abu muda: judul Node 1 Rumah, Lampu: dengan kapsul abu-abu PADAM (nomor 3), dua tombol berbingkai sama lebar, Nyalakan lampu yang aktif dan Matikan lampu yang redup (nomor 4), lima kartu putih berpola label, angka, satuan: Suhu 28.4 °C, Kelembapan 71 %, Cahaya 2310 /4095, Tanah 37 %, Air tandon 64 % (nomor 5), dan baris Firmware yang sama. Kanan, Sesudah ketuk Nyalakan lampu, keduanya ditandai nomor 6: kapsul berubah kuning bertuliskan MENYALA, dan tombol Nyalakan lampu kini redup sedangkan Matikan lampu aktif, tanpa memuat ulang halaman. Keterangan: 1 tautan biru bawaan browser, tag a dengan href /on, ketuk sama dengan permintaan GET baru ke ESP32; 2 angka diisi ESP32 sebelum halaman dikirim, lewat penanda %SUHU% dan kawan-kawannya; 3 kulit: kapsul dari aturan .keadaan b, semua gaya dikumpulkan di tag style; 4 tag button menggantikan tautan dan tidak berpindah halaman (BEDA-5); 5 kartu berpola sama, label, angka, satuan, cikal bakal komponen KartuSensor; 6 otot: addEventListener mengganti tulisan lewat textContent dan classList, tanpa memuat ulang.](aset/sakelar-modul-10-dibedah.png)

#### 1.6 Formulir ke penerima Modul 4, lalu `fetch` yang ditolak CORS (10 menit)

Halaman web juga mengirim data, seperti formulir *login* dashboard di Praktik 4. Sebelum itu, coba dua cara mengirim data ke `penerima-webhook.js` dari [Modul 4 Praktik 9](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#praktik-9--server-mini-penerima-webhookjs-dan-kirim-datajs-25-menit), yang mencetak apa pun yang dikirim kepadanya.

**Nyalakan penerimanya.** Buka jendela VS Code kedua (**File → New Window**), buka folder **`rumah-pintar-mini`** di jendela itu (**File → Open Folder…**), buka terminalnya (**Terminal → New Terminal**), lalu jalankan:

```text
cd alat
node penerima-webhook.js
```

**Hasilnya:**

```text
Penerima siap di http://localhost:3000 — tekan Ctrl + C untuk berhenti.
```

Biarkan penerima berjalan; berkas tetap ditulis di jendela `belajar-iot`.

**Tulis halamannya.** Di jendela `belajar-iot`, buat berkas baru **`formulir-webhook.html`** di folder **`halaman`**, lalu isi dengan kode ini (atau salin dari [`kode/praktik-1/formulir-webhook.html`](kode/praktik-1/formulir-webhook.html) dengan **Copy raw file**):

```html
<!DOCTYPE html>
<!--
  formulir-webhook.html - Praktik 1 Modul 22, langkah 1.6: dua cara halaman mengirim data ke server.
  Siapkan dulu penerima dari Modul 4. Di terminal, masuk ke folder alat (rumah-pintar-mini/alat), lalu jalankan:
      node penerima-webhook.js
  Sesudah muncul "Penerima siap di http://localhost:3000", buka berkas ini dengan klik dua kali.
    A. Formulir biasa: browser PINDAH ke halaman jawaban server, dan penerima mencetak isi formulirnya.
    B. fetch() dengan JSON: halaman tetap di tempat, tetapi browser bertanya dulu (preflight OPTIONS).
       Penerima Modul 4 tidak mengirim kepala CORS, jadi browser memblokirnya. Lihat Console (F12).
  Jangan mengetik sandi sungguhan di sini: penerima mencetak semua isi kiriman apa adanya.
-->
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kirim ke penerima Modul 4</title>
<style>
  * {
    box-sizing: border-box;
  }
  body {
    font-family: sans-serif;
    font-size: 18px;
    margin: 0;
    padding: 16px;
    color: #1e293b;
    background: #f1f5f9;
  }
  .halaman {
    max-width: 480px;
    margin: 0 auto;
  }
  h1 {
    font-size: 24px;
    margin: 0 0 12px;
  }
  h2 {
    font-size: 18px;
    margin: 0 0 8px;
  }
  .kotak {
    margin-bottom: 16px;
    padding: 16px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
  }
  label {
    display: block;
    margin-top: 8px;
    font-size: 14px;
    color: #475569;
  }
  input {
    width: 100%;
    min-height: 44px;
    padding: 8px;
    font: inherit;
    border: 1px solid #94a3b8;
    border-radius: 8px;
  }
  button {
    width: 100%;
    min-height: 44px;
    margin-top: 12px;
    font: inherit;
    font-size: 16px;
    border: 1px solid #94a3b8;
    border-radius: 8px;
    background: white;
    cursor: pointer;
  }
  .catatan {
    margin: 12px 0 0;
    font-size: 14px;
    color: #64748b;
  }
</style>
</head>
<body>
<main class="halaman">
  <h1>Kirim ke penerima Modul 4</h1>

  <section class="kotak">
    <h2>A. Formulir biasa</h2>
    <!-- method="post": isi dikirim di badan surat HTTP. action: alamat penerima (port 3000; jalurnya bebas).
         Atribut name pada setiap kotak isian menjadi nama kolom yang dikirim: email=...&sandi=... -->
    <form method="post" action="http://localhost:3000/formulir">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" value="viewer@rumah.test" required>
      <label for="sandi">Sandi (pura-pura)</label>
      <input id="sandi" name="sandi" type="password" value="bukan-sandi-sungguhan" required>
      <button type="submit">Kirim formulir</button>
    </form>
    <p class="catatan">Sesudah dikirim, browser pindah ke halaman jawaban penerima. Tekan <b>Alt + ←</b> (macOS: <b>Cmd + [</b>) untuk kembali.</p>
  </section>

  <section class="kotak">
    <h2>B. fetch() dengan JSON</h2>
    <button type="button" id="tombol-fetch">Kirim lewat fetch()</button>
    <p class="catatan" id="hasil-fetch">Belum dikirim.</p>
  </section>
</main>

<script>
  const hasil = document.querySelector("#hasil-fetch");

  document.querySelector("#tombol-fetch").addEventListener("click", async () => {
    hasil.textContent = "Mengirim…";
    // isi kotak formulir di atas, dijadikan objek lalu teks JSON
    const isi = {
      email: document.querySelector("#email").value,
      sandi: document.querySelector("#sandi").value,
    };
    try {
      const jawaban = await fetch("http://localhost:3000/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // kepala inilah yang membuat browser bertanya dulu (preflight)
        body: JSON.stringify(isi),
      });
      hasil.textContent = "Berhasil, kode " + jawaban.status + "."; // tidak akan sampai di sini dengan penerima Modul 4
    } catch (err) {
      // Browser menolak: jawaban OPTIONS dari penerima tidak membawa kepala Access-Control-Allow-Origin,
      // jadi POST-nya tidak pernah dikirim. (Kalau penerima mati, galatnya sama: Failed to fetch.)
      hasil.textContent = "Gagal: " + err.message + ". Buka Console (F12) untuk membaca alasannya.";
      console.log("Cari pesan merah berisi 'blocked by CORS policy' di atas baris ini.");
    }
  });
</script>
</body>
</html>
```

**Bagian A** (baris 88–94) adalah formulir biasa: `action` alamat tujuannya, `method="post"` mengirim isinya di badan surat HTTP, `name` setiap kotak menjadi nama kolom, dan `required` menolak kotak kosong. Sandinya, yang sudah terisi lewat `value`, **pura-pura**. **Bagian B** (baris 105–129) mengirim isi yang sama lewat `fetch()` sebagai JSON, persis bentuk `kirim-data.js` Modul 4 yang dulu berhasil ke penerima yang sama.

> [!WARNING]
> **Jangan mengetik sandi sungguhan di halaman ini.** Penerima mencetak semua isi kiriman apa adanya di terminal, dan isinya berangkat sebagai teks polos.

**Kirim formulir (A).** Buka `formulir-webhook.html` dengan klik dua kali, lalu klik **Kirim formulir**. Kalau browser menawarkan untuk menyimpan sandi, tolak saja.

**Hasilnya (contoh):** browser **pindah** ke `localhost:3000/formulir`, yang hanya berisi `{"ok":true}`, jawaban penerima. Di terminal penerima muncul baris-baris baru (jamnya mengikuti jam laptopmu):

```text
[20.02.19] POST /formulir
email=viewer%40rumah.test&sandi=bukan-sandi-sungguhan
[20.02.19] GET /favicon.ico
```

Isi formulir berangkat sebagai `nama=nilai` yang disambung `&` (`%40` adalah `@` yang disandikan), dan sandinya terbaca polos, seperti kunci perangkat yang kamu lihat lewat penyadap di Modul 21 Praktik 8: selama alamatnya `http://`, kiriman tidak dienkripsi, dan HTTPS baru datang di Modul 27. `GET /favicon.ico` adalah permintaan ikon tab, seperti di Modul 4. Tekan **Alt + ←** (macOS: **Cmd + [**) untuk kembali ke formulir.

**Kirim lewat `fetch()` (B).** Buka tab **Console** di DevTools (**F12**), lalu klik **Kirim lewat fetch()**.

**Hasilnya (contoh):** kali ini halaman **tidak** berpindah. Tulisan di bawah tombol menjadi `Gagal: Failed to fetch. Buka Console (F12) untuk membaca alasannya.`, dan terminal penerima hanya mencetak satu baris baru:

```text
[20.02.23] OPTIONS /json
```

Console menulis dua baris merah, lalu satu baris biasa dari kode halamanmu sendiri (baris 126):

```text
Access to fetch at 'http://localhost:3000/json' from origin 'null' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
POST http://localhost:3000/json net::ERR_FAILED
Cari pesan merah berisi 'blocked by CORS policy' di atas baris ini.
```

Mengapa A sampai, sedangkan B tidak? Formulir biasa adalah **perpindahan halaman**, seperti tautan `/on` di Modul 10: browser mengirimnya tanpa bertanya, dan tidak ada kode yang membaca jawabannya. `fetch()` justru ingin **membaca** jawaban dari asal lain, padahal berkas yang dibuka dengan klik dua kali tidak punya nama host dan port seperti alamat web, sehingga browser mencatat asalnya `null`. Di sini berlaku **CORS** (Modul 20 Konsep 9): browser hanya menyerahkan jawaban kalau server mengizinkan asal halaman itu lewat kepala `Access-Control-Allow-Origin`, dan karena isinya JSON, browser bertanya dulu lewat *preflight* `OPTIONS`. Penerima Modul 4 menjawabnya tanpa kepala izin, jadi `POST`-nya tidak pernah berangkat.

Padahal `kirim-data.js` di Modul 4 mengirim `POST` JSON yang sama, dan berhasil. Jadi, CORS adalah aturan **browser**, bukan server, supaya halaman mana pun yang kamu buka tidak bisa diam-diam membaca jawaban server lain atas namamu; Node.js dan Bruno bukan browser. Backend v1.0 mengirim kepala izin sejak Modul 20, tetapi hanya untuk asal di `CORS_ORIGIN` (`http://localhost:5173` dan `http://127.0.0.1:5173`). Itulah sebabnya mulai Praktik 2, dashboard disajikan Vite di `http://localhost:5173`, bukan dibuka dengan klik dua kali ([Konsep 9](#9-login-dari-browser-cookie-cors-dan-localhost)).

**Coba satu hal lagi.** Hentikan penerima (**Ctrl + C**), lalu klik **Kirim lewat fetch()** lagi. Tulisan di halaman **sama persis**; hanya Console yang berbeda: baris merah barunya `POST http://localhost:3000/json net::ERR_CONNECTION_REFUSED`, tanpa pesan CORS. Bagi JavaScript, "ditahan CORS" dan "server mati" sama-sama `Failed to fetch`. Ingat ini di Praktik 4: kalau dashboard menulis bahwa server tidak bisa dihubungi, penyebabnya bisa backend mati, bisa juga alamat halaman yang tidak diizinkan, dan tab **Console** yang memberi tahu mana yang benar.

#### 1.7 Lebar HP di mode perangkat (5 menit)

Di tab `halaman-m10-kulit-otot.html`, buka DevTools (**F12**), lalu tekan **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**) atau klik tombol berikon HP dan tablet di bilah atas DevTools (Chrome menamainya **Toggle device toolbar**, Edge **Toggle device emulation**). Di bilah mode perangkat (pilihan **Responsive**), ketik **`375`** di kotak lebar, lalu tekan **Enter** ([Konsep 11](#11-responsif-satu-halaman-untuk-hp-dan-laptop)).

**Hasilnya:** kedua tombol tetap berjajar dan berbagi lebar layar. Kartu tersusun dua per baris, sedangkan `Air tandon` sendirian di baris ketiga dan melebar memenuhi baris itu. Tidak ada yang terpotong, dan halaman tidak bisa digeser ke samping.

Hitungannya: 375 px dikurangi jarak 16 px kiri dan kanan menyisakan 343 px. Dua kartu 130 px plus celah 8 px muat, tiga kartu (406 px) tidak, jadi kartu ketiga turun, lalu setiap kartu melebar mengisi barisnya. Tanpa satu baris pun khusus HP, susunannya menyesuaikan sendiri.

Di lebar **`1280`**, kolomnya berhenti di 480 px di tengah (`max-width`), dengan kartu 3 + 2 (kalau jendela browser-mu lebih sempit, halamannya diperkecil supaya muat). Terakhir, buka `halaman-m10-asli.html` di mode perangkat selebar 375 seperti tadi: tulisannya rapi berkat baris `viewport` sejak Modul 10, tetapi kedua tautannya hanya setinggi satu baris tulisan (22 px), jauh lebih kecil daripada tombol 44 px buatanmu.

Tutup mode perangkat dengan **Ctrl + Shift + M** lagi. Di Praktik 7, dashboard diperiksa dengan cara yang sama di tiga lebar.

#### 1.8 Simpan di `belajar-iot` (3 menit)

Hentikan penerima (**Ctrl + C**) kalau masih berjalan, lalu simpan pekerjaanmu dari terminal jendela `belajar-iot` (naik dulu dengan `cd ..` kalau masih di folder `modul-22`):

```text
git add modul-22
git status
git commit -m "Bedah halaman Modul 10 dengan HTML, CSS, dan JavaScript (Modul 22 Praktik 1)"
git push
```

`git add modul-22` ikut menyertakan berkas pemanasan dan `kartu.html` yang belum di-*commit*, dan `git status` memperlihatkan setidaknya tiga berkas baru di `modul-22/halaman/`. Pengguna GitHub Desktop: *commit* dan *push* di repositori **`belajar-iot`** seperti biasa.

<details>
<summary>Latihan tambahan hari pertama (pilihan, ±4 jam)</summary>

Silabus memberi **satu hari** untuk dasar HTML, CSS, dan JavaScript. Kalau HTML benar-benar baru bagimu, lima berkas di [`kode/praktik-1/latihan/`](kode/praktik-1/latihan/) mengisi sisa hari itu: salin ke folder baru `modul-22/halaman/latihan` (**Copy raw file**), buka di VS Code **dan** browser, baca komentarnya, lalu kerjakan tugas `COBA`-nya:

1. [`latihan-1-kerangka.html`](kode/praktik-1/latihan/latihan-1-kerangka.html) (45 menit): struktur dokumen dan tag-tag dasar.
2. [`latihan-2-kulit.html`](kode/praktik-1/latihan/latihan-2-kulit.html) (60 menit): *selector*, *box model*, *flexbox*, dan `@media`.
3. [`latihan-3-otot.html`](kode/praktik-1/latihan/latihan-3-otot.html) (60 menit): kejadian dan membuat elemen baru.
4. [`latihan-4-fetch.html`](kode/praktik-1/latihan/latihan-4-fetch.html) (45 menit): `fetch` dengan tiga keadaan (butuh internet; bagian 2 butuh backend v1.0 menyala).
5. [`jembatan-komponen-tangan.html`](kode/praktik-1/latihan/jembatan-komponen-tangan.html) (30 menit): pola React dengan JavaScript biasa; baca daftar "sakit" di akhirnya sebelum [Konsep 5](#5-react-dan-jsx-halaman-dari-balok-lego).

</details>

> ⬆️ **Selesai Praktik 1?** Baca [Konsep 3](#3-tailwind-css-v4-kulit-dari-kelas-kelas-kecil) dan [Konsep 4](#4-vite-dan-folder-frontend-dapur-pengembangan-di-localhost5173), lalu lanjut ke [Praktik 2 — Proyek Vite pertama: React, TypeScript, dan Tailwind v4](#praktik-2--proyek-vite-pertama-react-typescript-dan-tailwind-v4-45-menit).

### Praktik 2 — Proyek Vite pertama: React, TypeScript, dan Tailwind v4 (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder repositori **`rumah-pintar-mini`** dan satu terminal (mula-mula di folder `rumah-pintar-mini`, lalu di folder `frontend`), browser **Google Chrome** atau **Microsoft Edge** beserta DevTools-nya, dan ekstensi **React DevTools** yang dipasang di 2.6. Backend, Docker Desktop, simulator, dan Bruno baru dipakai di Praktik 4.

Mulai praktik ini, kamu bekerja di repositori **`rumah-pintar-mini`**, di folder baru **`frontend`**: rumah dashboard sampai Modul 25. Pembuat proyek **create-vite** menyiapkan templat React + TypeScript, lalu kamu memasang Tailwind v4 (Konsep 3), merapikan templat, dan mengunci *dev server* di port 5173 (Konsep 4). Kode di akhir praktik ini: [`kode/tahap/praktik-2/frontend/`](kode/tahap/praktik-2/frontend/) (tanpa `node_modules`, `package-lock.json`, dan `README.md` templat).

#### 2.1 Siapkan cabang `fitur/dashboard` (2 menit)

Di VS Code, pilih **File → Open Folder…**, buka folder **`rumah-pintar-mini`** (bukan `belajar-iot`), lalu buka terminal baru (**Terminal → New Terminal**), yang selalu mulai di folder itu. Periksa versi Node.js-mu:

```text
node --version
```

Angkanya harus diawali `v24` (Mac yang tertahan di Node.js 22: minimal `v22.18`, lihat 🧰); Vite 8 butuh Node.js 20.19+ atau 22.12+. Lalu, dari `main` terbaru, buat cabang untuk seluruh pekerjaan Modul 22:

```text
git switch main
git pull
git switch -c fitur/dashboard
```

`git pull` memastikan backend v1.0 dari *pull request* "keamanan perangkat" Modul 21 sudah ada di laptopmu. Cabang ini baru digabung ke `main` di ➕ C, lewat *pull request* "dashboard v0.1".

#### 2.2 Buat folder `frontend` dengan create-vite (5 menit)

Masih di folder `rumah-pintar-mini` (bukan di dalam `backend`), ketik:

```text
npm create vite@9.3.1 frontend -- --template react-ts
```

- **`npm create vite@9.3.1`** menjalankan **create-vite** 9.3.1, pembuat proyek resmi Vite (diunduh npm sekali pakai, tidak ikut terpasang).
- **`frontend`**: nama folder baru, sekaligus nama paket.
- **`--`**: semua di belakangnya diteruskan ke create-vite, bukan dibaca npm.
- **`--template react-ts`**: templat React dengan TypeScript.

create-vite lalu bertanya, paling banyak tiga kali (`◆` = menunggu jawaban, `◇` = sudah dijawab; di konsol Windows lama, gantinya `*`, huruf `o`, dan garis `|`):

1. **`Ok to proceed? (y)`** muncul kalau npm perlu mengunduh create-vite 9.3.1 dulu. Ketik **y**, lalu tekan **Enter**.
2. **`Which linter to use?`** menanyakan pemeriksa kerapian kode (*linter*) untuk `npm run lint`. Biarkan `● Oxlint` (bulatan penuh = pilihan aktif; dipakai di Praktik 8), lalu tekan **Enter**. Kalau terlanjur memilih `ESLint`, pilihan tutorial lama, hapus folder `frontend` yang baru dibuat (klik kanan di panel Explorer → **Delete**), lalu ulangi perintahnya.
3. **`Install with npm and start now?`** (`● Yes / ○ No`): tekan huruf **n** saja, tanpa **Enter**, sehingga terkunci ke **No**; kita mengerjakannya sendiri di 2.3 supaya keluarannya bisa dibaca. Kalau terlanjur Yes dan *dev server* sudah menyala, hentikan dengan **Ctrl + C**, lalu lanjutkan dari 2.3.

**Hasilnya (contoh):**

```text
Need to install the following packages:
create-vite@9.3.1
Ok to proceed? (y) y

> npx
> cva frontend --template react-ts


create-vite v9.3.1

│
◇  Which linter to use?
│  Oxlint
│
◇  Install with npm and start now?
│  No
│
◇  Scaffolding project in C:\Users\kamu\rumah-pintar-mini\frontend...
│
└  Done. Now run:

  cd frontend
  npm install
  npm run dev
```

Tiga baris pertama hanya muncul saat create-vite 9.3.1 pertama kali diunduh. Jalur `Scaffolding project in` mengikuti letak foldermu (macOS: `/Users/…`). Baris `npm notice` yang menawarkan npm versi baru boleh diabaikan; jangan memperbarui npm di tengah modul. Panel Explorer kini menampilkan folder **`frontend`** berisi 18 berkas templat (petanya di [Konsep 4](#4-vite-dan-folder-frontend-dapur-pengembangan-di-localhost5173)).

#### 2.3 Pasang paket, lalu nyalakan dapurnya (6 menit)

Masuk ke folder baru itu, lalu pasang paket yang tertulis di `package.json`:

```text
cd frontend
npm install
```

**Hasilnya (contoh):**

```text
added 27 packages, and audited 28 packages in 45s

9 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

npm mengunduh React, Vite, TypeScript, oxlint, dan kawan-kawannya ke **`node_modules`**, lalu mencatat versi persisnya di **`package-lock.json`**, seperti backend Modul 16. Jumlah paketnya bergantung pada versi npm (di atas: npm 11.19); yang penting `found 0 vulnerabilities`. Sekarang nyalakan dapurnya:

```text
npm run dev
```

**Hasilnya (contoh):**

```text
> frontend@0.0.0 dev
> vite


  VITE v8.3.5  ready in 1385 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

- **`Local: http://localhost:5173/`** adalah alamat dashboard; lama `ready in … ms` berbeda setiap kali. Kalau port-nya bukan **5173** (misalnya 5174), ada program lain yang memakai 5173: hentikan Vite (**Ctrl + C**), tutup program itu, lalu ulangi `npm run dev`. Setelan di 2.5 membuat Vite berhenti dengan pesan galat alih-alih pindah diam-diam.
- **`Network: use --host to expose`**: hanya laptop ini yang bisa membukanya. Jangan menambahkan `--host` (aturan aman nomor 4).

Biarkan terminal ini menjalankan dapur. Buka alamatnya di Chrome atau Edge (**Ctrl** + klik alamat di terminal; macOS: **Cmd** + klik). Selalu `localhost`, bukan `127.0.0.1`.

**Hasilnya:** halaman sambutan templat Vite: gambar dua lempeng berlogo React dan Vite, judul **Get started**, kalimat `Edit src/App.tsx and save to test HMR`, dan tombol **Count is 0**. Di laptop bermode gelap, halamannya tampil gelap; CSS demo templat diganti di 2.4.

![Tangkapan layar asli halaman pertama templat create-vite 9.3.1 react-ts (Vite 8.3.5, React 19.3.1) di Microsoft Edge selebar laptop 1280 px, sesudah npm run dev di Praktik 2.3; judul: Halaman pertama templat Vite react-ts di http://localhost:5173. Dari atas: gambar dua lapis berlogo React dan Vite (nomor 1); judul besar Get started (nomor 2); kalimat Edit src/App.tsx and save to test HMR (nomor 3); tombol ungu muda Count is 0 (nomor 4); lalu dua kolom, Documentation, Your questions, answered, dengan tombol Explore Vite dan Learn more, serta Connect with us, Join the Vite community, dengan tombol GitHub, Discord, X.com, dan Bluesky (nomor 5). Keterangan: 1 gambar templat dari src/assets/, yaitu hero.png, react.svg, dan vite.svg, dihapus di Praktik 2.5; 2 Get started adalah isi src/App.tsx bawaan, satu komponen React yang mengembalikan JSX; 3 ubah src/App.tsx lalu simpan, HMR mengganti halaman tanpa dimuat ulang; 4 Count is 0 adalah tombol ber-state, useState, klik menambah angka dan muat ulang kembali ke 0; 5 tautan dokumentasi dan komunitas, bagian templat yang dibersihkan di Praktik 2.5.](aset/vite-templat-pertama.png)

Coba tiga hal kecil:

1. **Klik Count is 0 beberapa kali.** Angkanya naik tanpa memuat ulang halaman, berkat `onClick={() => setCount((count) => count + 1)}` di `src/App.tsx`: itulah *state*, papan tulis kecil milik komponen (Konsep 7).
2. **Uji HMR.** Di `src/App.tsx`, ganti `Get started` di baris `<h1>Get started</h1>` menjadi `Halo, Rumah Pintar Mini`, lalu simpan (**Ctrl + S**). Judul di browser langsung berganti tanpa **F5** (HMR, Konsep 4). Ini hanya percobaan; isi `App.tsx` diganti di 2.5.
3. **Intip tab Console** (**F12**): ada ajakan bercetak tebal dari React, `Download the React DevTools for a better development experience: https://react.dev/link/react-devtools`. Ekstensi itu kamu pasang di 2.6.

#### 2.4 Pasang Tailwind CSS v4 (7 menit)

Hentikan dapurnya dulu (klik terminal, **Ctrl + C**, juga di Mac): paket dan pengaturan Vite paling aman dipasang saat *dev server* mati. Pemasangannya tiga langkah ([Konsep 3](#3-tailwind-css-v4-kulit-dari-kelas-kelas-kecil)).

**Langkah 1: paketnya.** **`tailwindcss`** adalah Tailwind itu sendiri, dan **`@tailwindcss/vite`** *plugin* agar Vite membuatkan CSS untuk setiap kelas yang kamu tulis. Pasang keduanya dengan versi persis (aturan aman nomor 5):

```text
npm install tailwindcss@4.3.3 @tailwindcss/vite@4.3.3
```

**Hasilnya (contoh):**

```text
added 17 packages, and audited 45 packages in 16s

12 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

npm versi lama menulis angka yang lebih besar (misalnya `audited 109 packages`). `package.json` kini memuat `"@tailwindcss/vite": "^4.3.3"` dan `"tailwindcss": "^4.3.3"`; tanda `^` ditambahkan npm, sedangkan versi persisnya tercatat di `package-lock.json`.

**Langkah 2: *plugin* di `vite.config.ts`.** Buka `frontend/vite.config.ts`. Tepat di bawah baris `import react from '@vitejs/plugin-react'`, tambahkan:

```ts
import tailwindcss from '@tailwindcss/vite'
```

Lalu ubah baris `plugins: [react()],` menjadi:

```ts
  plugins: [react(), tailwindcss()],
```

Simpan. Biarkan gaya berkas templat ini (kutip tunggal, tanpa titik koma); berkas buatanmu memakai titik koma seperti backend, dan keduanya sah.

**Langkah 3: `@import` di `src/index.css`.** Buka `src/index.css` (111 baris CSS demo templat), hapus semuanya (**Ctrl + A**, lalu **Delete**), ketik satu baris ini, lalu simpan:

```css
@import "tailwindcss";
```

`src/main.tsx` sudah mengimpor `index.css` sejak awal, jadi tidak perlu diubah. Selesai, tanpa `tailwind.config.js` dan `postcss.config.js`. Jangan nyalakan dapurnya dulu: `App.tsx` templat masih memakai `App.css`, yang bergantung pada CSS demo yang baru kamu hapus.

#### 2.5 Rapikan templat (10 menit)

Kerjakan berurutan, supaya tidak ada berkas yang menunjuk gambar yang sudah dihapus.

**1. Ganti isi `src/App.tsx`.** Hapus seluruh isinya, lalu ketik:

```tsx
// App.tsx - komponen paling atas dashboard. Untuk sekarang isinya hanya satu judul,
// sekadar bukti bahwa React dan Tailwind sudah bekerja. Komponen lain menyusul mulai Praktik 3.
export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      {/* className = atribut class di HTML; isinya kelas-kelas kecil Tailwind */}
      <h1 className="text-3xl font-bold text-teal-700">Rumah Pintar Mini</h1>
      <p className="mt-2 text-slate-600">Dashboard v0.1 sedang dibangun.</p>
    </main>
  );
}
```

- **`export default function App()`** adalah komponen (Konsep 5): fungsi bernama huruf besar yang mengembalikan tampilan. `src/main.tsx` menyuruh React menggambarnya di `<div id="root">`.
- **`className`** adalah atribut `class` versi JSX, berisi kelas Tailwind: `min-h-screen` (latar setinggi layar), `bg-slate-100` (abu-abu kebiruan sangat muda), `p-6` (jarak dalam 6 × 4 px = 24 px), `text-3xl font-bold text-teal-700` (huruf besar, tebal, hijau toska tua), `mt-2` (jarak atas 8 px), dan `text-slate-600` (tulisan abu-abu).
- **`{/* … */}`** adalah komentar di dalam JSX. Impor templat (`useState`, tiga gambar, `./App.css`) ikut hilang karena tidak dibutuhkan.

**2. Hapus berkas demo.** Di panel Explorer, klik kanan → **Delete** (setujui pemindahan ke **Recycle Bin**; macOS: **Trash**) untuk `src/App.css`, folder `src/assets` (`hero.png`, `react.svg`, `vite.svg`), dan `public/icons.svg`. Sisakan `public/favicon.svg`, ikon tab browser. Folder `src` kini hanya berisi `App.tsx`, `index.css`, dan `main.tsx`. `README.md` templat dibiarkan dulu; ➕ A menggantinya.

**3. Kunci port 5173 di `vite.config.ts`.** Backend hanya melayani asal yang tercantum di `CORS_ORIGIN`, yaitu halaman Vite berport 5173 ([Konsep 4](#4-vite-dan-folder-frontend-dapur-pengembangan-di-localhost5173)). Ganti seluruh isi `vite.config.ts` dengan versi ini (yang baru: dua baris komentar dan baris `server`):

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Modul 22: selalu di port 5173 (alamat yang diizinkan CORS_ORIGIN backend).
  // Kalau port itu sedang dipakai, berhenti dengan galat, jangan pindah diam-diam ke 5174.
  server: { port: 5173, strictPort: true },
})
```

**`strictPort: true`** membuat Vite **berhenti** dengan pesan galat kalau port 5173 terpakai. Tanpanya, Vite pindah diam-diam ke 5174, asal yang tidak ada di `CORS_ORIGIN`, dan mulai Praktik 4 dashboard gagal bicara dengan backend.

**4. Bahasa dan judul halaman di `index.html`.** Buka `frontend/index.html` (di luar folder `src`), lalu ganti seluruh isinya dengan:

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rumah Pintar Mini</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Yang berubah hanya **`lang="id"`** (tadinya `en`), tanda bagi browser dan pembaca layar bahwa halaman ini berbahasa Indonesia, dan judul tab **`Rumah Pintar Mini`** (tadinya `frontend`).

**5. `.env` tidak ikut Git.** Buka `frontend/.gitignore`, cari baris `*.local`, lalu tambahkan dua baris di bawahnya sehingga menjadi:

```text
*.local
# Modul 22: berkas setelan lokal tidak ikut Git (.env.local sudah tertangkap *.local di atas)
.env
```

`*.local` sudah menjaga `.env.local`; baris `.env` menutup celah sisanya (Konsep 4). Isinya memang bukan rahasia (semua `VITE_…` ikut terkirim ke browser), tetapi setelan laptopmu tidak perlu ikut ke GitHub.

Simpan semua (**File → Save All**), jalankan lagi `npm run dev` (keluarannya seperti di 2.3), lalu muat ulang tab `http://localhost:5173` (**F5**).

**Hasilnya:** tab bertuliskan `Rumah Pintar Mini`, dan seluruh halaman berlatar abu-abu kebiruan sangat muda. Di kiri atas, berjarak 24 px dari tepi, ada judul **Rumah Pintar Mini** yang besar, tebal, dan hijau toska tua, dengan kalimat abu-abu `Dashboard v0.1 sedang dibangun.` di bawahnya. Ikon tab masih logo Vite (`public/favicon.svg`).

Pastikan Tailwind bekerja: klik kanan judulnya → **Inspect** (Chrome berbahasa Indonesia: **Inspeksi**; Edge berbahasa Indonesia: **Periksa**). Tab **Elements** menyorot `<h1 class="text-3xl font-bold text-teal-700">Rumah Pintar Mini</h1>`: `className` di JSX sudah menjadi atribut `class` biasa di DOM. Bagian **Styles** di sebelahnya memuat aturan `.text-teal-700`, `.font-bold`, dan `.text-3xl` buatan Tailwind, masing-masing di bawah judul kecil `Layer utilities` dan bertautan `<style>`; warnanya tertulis sebagai variabel, `var(--color-teal-700)`. Kalau judulnya hitam di latar putih, Tailwind belum bekerja: periksa lagi tiga langkah 2.4, atau buka [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan).

#### 2.6 Pasang React DevTools dan lihat pohon komponennya (8 menit)

**React DevTools**, ekstensi gratis dari tim React, melihat halaman bukan sebagai pohon elemen HTML (DOM) seperti DevTools bawaan, melainkan sebagai **pohon komponen**: balok-balok LEGO penyusunnya, lengkap dengan *props* dan *state* setiap balok.

> [!WARNING]
> Ekstensi browser bisa membaca halaman yang kamu buka. Pasang React DevTools hanya dari toko resmi browsermu, lewat tautan di bawah atau di dokumentasi React ([react.dev/learn/react-developer-tools](https://react.dev/learn/react-developer-tools)), jangan dari hasil pencarian atau situs lain.

1. **Pasang ekstensinya.**
   - **Chrome:** buka [React Developer Tools di Chrome Web Store](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi), klik **Add to Chrome** (Chrome berbahasa Indonesia: **Tambahkan ke Chrome**), lalu setujui dengan **Add extension** (**Tambahkan ekstensi**).
   - **Edge:** buka [React Developer Tools di Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil), klik **Get** (**Dapatkan**), lalu setujui dengan **Add extension** (**Tambahkan ekstensi**).
2. **Muat ulang dashboard.** Di tab `http://localhost:5173`, tutup DevTools kalau sedang terbuka, tekan **F5**, lalu buka lagi DevTools (**F12**). Ekstensi baru hanya bekerja di halaman yang dimuat sesudah ia terpasang.
3. **Temukan tab Components.** Di deretan tab DevTools kini ada **Components ⚛** dan **Profiler ⚛**, ditambah **Suspense ⚛** sejak versi 8 (lambang atom = tab dari React DevTools), biasanya di ujung kanan; kalau DevTools-mu sempit, klik tanda **»**. Di halaman tanpa React, tab-tab ini tetap ada, tetapi isinya hanya `Looks like this page doesn't have React, or it hasn't been loaded yet.`
4. **Lihat pohonnya.** Klik tab **Components**. Pohonnya baru berisi satu balok, **`App`** (pembungkus `StrictMode` dari `main.tsx` tidak ditampilkan). Klik `App`: panel kanan menampilkan *props* (titipan) dan *state*-nya, yang masih nyaris kosong.
5. **Cari pemilik sebuah elemen.** Klik tombol pemilih di pojok kiri atas tab **Components** (ikon kotak berpanah, bertuliskan `Select an element in the page to inspect it` saat ditunjuk tetikus), lalu klik judul **Rumah Pintar Mini** di halaman. React DevTools menyorot `App`, balok yang menggambarnya.

Mulai Praktik 3, pohon ini tumbuh ([diagram di Konsep 5](#5-react-dan-jsx-halaman-dari-balok-lego)). Tab **Profiler** dan **Suspense** tidak dipakai di modul ini. Kalau tab **Components** tetap tidak muncul, buka [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan).

#### 2.7 Cicipi dengan `npm run build`, lalu simpan ke cabang (7 menit)

Sebelum menyimpan, pastikan proyekmu juga bisa dimasak menjadi hidangan siap saji (Konsep 4). Hentikan *dev server* (**Ctrl + C**), lalu jalankan:

```text
npm run build
```

**Hasilnya (contoh):**

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 16 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-CiJyPGsd.css    6.80 kB │ gzip:  2.06 kB
dist/assets/index-BCUS7PBR.js   219.77 kB │ gzip: 68.72 kB

✓ built in 1.70s
```

- `tsc -b` memeriksa tipe (diam: tak ada galat), lalu `vite build` mengolah **16 modul**: berkasmu dan modul React. Di terminal VS Code, baris `transforming...` dan `rendering chunks...` bisa tertimpa lalu hilang.
- Folder baru **`dist/`** berisi `index.html`, `favicon.svg`, satu berkas CSS (6.80 kB saja, sebab Tailwind hanya membuat CSS untuk kelas yang kamu tulis), dan satu berkas JavaScript (219.77 kB, hampir seluruhnya React dan React DOM). Kolom `gzip` adalah ukuran sesudah dipadatkan.
- `frontend@0.0.0` adalah nama dan versi paket; Praktik 8 menggantinya menjadi `rumah-pintar-mini-frontend` versi `0.1.0`.

Isi `dist/` dibedah di [🔬 Bedah Teknis](#-bedah-teknis-opsional); folder ini bisa dibuat ulang kapan saja dan tidak ikut Git. Lalu periksa kebersihan kodenya:

```text
npm run lint
```

**Hasilnya:**

```text
> frontend@0.0.0 lint
> oxlint
```

Tanpa peringatan: bersih. Di terminal VS Code, oxlint biasanya menutup dengan ringkasan seperti `Found 0 warnings and 0 errors.` dan `Finished in 30ms on 3 files with 116 rules using 8 threads.` (angkanya mengikuti laptopmu); tiga berkas itu adalah `src/App.tsx`, `src/main.tsx`, dan `vite.config.ts`.

Sekarang simpan ke cabang (terminal masih di folder `frontend`):

```text
git add .
git status
```

**Hasilnya:**

```text
On branch fitur/dashboard
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   .gitignore
	new file:   .oxlintrc.json
	new file:   README.md
	new file:   index.html
	new file:   package-lock.json
	new file:   package.json
	new file:   public/favicon.svg
	new file:   src/App.tsx
	new file:   src/index.css
	new file:   src/main.tsx
	new file:   tsconfig.app.json
	new file:   tsconfig.json
	new file:   tsconfig.node.json
	new file:   vite.config.ts
```

Seperti biasa sejak Modul 16, baca daftarnya sebelum *commit*: tepat **14 berkas baru**, **tanpa `node_modules` dan `dist`** (keduanya diabaikan `.gitignore` templat). Kalau salah satunya ikut masuk, kosongkan keranjang dengan `git restore --staged .`, periksa `.gitignore`-mu, lalu ulangi `git add .`. Di Windows, `git add .` mungkin lebih dulu mencetak tiga belas baris seperti `warning: in the working copy of 'frontend/.gitignore', LF will be replaced by CRLF the next time Git touches it`. Seperti di Modul 16, itu hanya pemberitahuan akhir baris; abaikan saja.

Kalau daftarnya sudah benar, buat *commit*:

```text
git commit -m "Dashboard: proyek Vite react-ts, Tailwind v4, dan port 5173 (Modul 22 Praktik 2)"
```

Belum perlu `git push`: cabang ini baru dikirim ke GitHub di ➕ C, bersama *pull request*-nya.

> ⬆️ **Selesai Praktik 2?** Baca [Konsep 5](#5-react-dan-jsx-halaman-dari-balok-lego) dan [Konsep 6](#6-props-dan-tipe-data-yang-dititipkan-bentuknya-dari-kontrak-data), lalu lanjut ke [Praktik 3 — Komponen pertama: `KartuSensor` dan tipe dari kontrak data](#praktik-3--komponen-pertama-kartusensor-dan-tipe-dari-kontrak-data-45-menit).

### Praktik 3 — Komponen pertama: `KartuSensor` dan tipe dari kontrak data (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan dua terminal: yang pertama tetap menjalankan `npm run dev` di folder `frontend` sejak Praktik 2, yang kedua untuk `generate-dummy.js` (folder `alat`), lalu `npm run build` dan `git` (folder `frontend`). **Browser** Chrome atau Edge di `http://localhost:5173` dengan tab **Components** dari React DevTools. Backend, Docker Desktop, dan simulator **belum** dibutuhkan. Konsep yang dipakai: Konsep 5–6.

Praktik ini memasang balok LEGO pertama: label tipe dari kontrak data di `src/types.ts`, cetakan `KartuSensor`, lalu enam kartu di `App.tsx` berisi satu bacaan contoh dari `generate-dummy.js`, alatmu di Modul 4 (backend baru disambungkan di Praktik 4). Di akhir, kamu sengaja salah ketik `kelembaban` dan melihat siapa yang menangkapnya. Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-3/frontend/`](kode/tahap/praktik-3/frontend/).

#### 3.1 Bentuk data dari kontrak: `src/types.ts` (10 menit)

Pastikan dapurnya masih menyala: `http://localhost:5173` menampilkan judul `Rumah Pintar Mini` dari Praktik 2. Kalau belum, di terminal (dimulai di folder `rumah-pintar-mini`) ketik `cd frontend`, lalu `npm run dev`.

Buka juga `KONTRAK-DATA.md` di akar repositori: kontrak data 1.4 dari Modul 21, versi proyekmu dari [Lampiran A Silabus](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini). Setiap baris tabel bagian 4 (`telemetry`) menjadi satu baris label tipe.

Klik kanan folder **`frontend/src`** → **New File…**, beri nama **`types.ts`**, lalu isi dengan kode berikut. Mengetiknya sendiri melatih mata membaca tipe (salinan cepatnya: [`kode/tahap/praktik-3/frontend/src/types.ts`](kode/tahap/praktik-3/frontend/src/types.ts)).

```ts
// types.ts - bentuk data dari kontrak data (Lampiran A Silabus, KONTRAK-DATA.md 1.4) dan dari jawaban API backend v1.0.
// Nama kolomnya sama persis dengan yang dikirim backend, jadi data dari server langsung "pas".
// Isinya hanya tipe (label untuk TypeScript): saat halaman berjalan di browser, semua baris ini sudah dihapus Vite.
// Pilihan nilai ditulis sebagai gabungan teks ("a" | "b"), bukan enum: templat kita melarang enum (erasableSyntaxOnly).

// jenis perangkat menurut backend
export type Jenis = "node1" | "node2" | "belum-diketahui";

// status dari topik rpm/<device_id>/status; "belum-diketahui" = terdaftar, tetapi belum pernah mengirim status
export type StatusPerangkat = "online" | "offline" | "offline-mode" | "belum-diketahui";

// kolom kunci di GET /devices (Modul 21)
export type StatusKunci = "aktif" | "dicabut" | "tanpa-kunci" | "belum-terdaftar";

// satu baris jawaban GET /devices
export type Perangkat = {
  device_id: string; // 12 digit heksadesimal huruf kecil, misalnya "a4cf12e5b7c0"
  nama: string | null; // null = belum diberi nama oleh admin
  lokasi: string | null;
  jenis: Jenis;
  status: StatusPerangkat;
  terakhir_dilihat: string | null; // waktu UTC, misalnya "2026-10-23T09:41:30Z"
  kunci: StatusKunci;
  terdaftar: string | null;
  kunci_dibuat: string | null;
  dicabut: string | null;
  penghubung: string | null; // khusus Node 2: device_id Node 1 yang meneruskan datanya
};

// keadaan empat aktuator Node 1 (kontrak 1.3)
export type Keadaan = {
  kipas: boolean;
  lampu: boolean;
  pompa: boolean;
  tirai: number; // sudut servo tirai, 0-180 derajat
};

// isi telemetry Node 1. "| null" = sensornya gagal dibaca (aturan 7)
export type TelemetryNode1 = {
  ts: string; // waktu bacaan dalam UTC, dibuat perangkat (aturan 1)
  fw: string; // versi firmware
  suhu: number | null; // °C
  kelembapan: number | null; // %
  cahaya: number; // 0 (gelap gulita) sampai 4095 (sangat terang)
  tanah: number; // % kelembapan tanah
  gerak: boolean;
  level_air: number | null; // % isi tandon
  // tanda ? = kolomnya boleh tidak ada sama sekali
  tanah_rs485?: number | null; // sensor tanah RS-485 (kontrak 1.2): tiga kolom ini selalu datang bersama
  suhu_tanah?: number | null; // °C
  ec?: number | null; // µS/cm
  state?: Keadaan; // kontrak 1.3
};

// isi telemetry Node 2 (kontrak 1.1), diteruskan Node 1 lewat ESP-NOW
export type TelemetryNode2 = {
  ts: string;
  fw: string;
  suhu: number | null;
  kelembapan: number | null;
  tekanan: number | null; // hPa
  suhu_tanah: number | null;
  tanah: number | null;
  baterai?: number | null; // volt; kolomnya tidak ada kalau pengukur baterai tidak dipasang
};

export type Telemetry = TelemetryNode1 | TelemetryNode2;

// jawaban GET /devices/:id/latest
export type BacaanTerbaru = {
  device_id: string;
  jenis: Jenis;
  status: StatusPerangkat;
  telemetry: Telemetry;
};

// jawaban POST /auth/login, POST /auth/refresh, dan GET /auth/me
export type Pengguna = {
  id: number;
  email: string;
  nama: string;
  peran: "admin" | "viewer";
};
```

Simpan, lalu cocokkan dengan kontraknya:

- **`Jenis`, `StatusPerangkat`, `StatusKunci`** adalah daftar pilihan tetap, ditulis sebagai gabungan teks, bukan `enum` (Konsep 6). Empat pilihan `StatusKunci` sama dengan kolom `kunci` di `GET /devices` sejak Modul 21; lencananya dibuat di Praktik 5.
- **`Perangkat`** = satu baris `GET /devices`. Kolom yang bisa kosong diberi `| null`, misalnya `nama` yang belum diisi admin.
- **`TelemetryNode1`** = tabel bagian 4. Kolom "Kalau bacaan gagal" di sana menentukan tipenya: `suhu`, `kelembapan`, dan `level_air` bisa `null`, sedangkan `cahaya`, `tanah`, dan `gerak` tidak pernah. Trio RS-485 (kontrak 1.2) dan `state` (kontrak 1.3) bertanda `?` karena hanya ada kalau sensornya dipasang atau firmware-nya cukup baru. **`TelemetryNode2`** mengikuti kontrak 1.1.
- **`BacaanTerbaru`** = jawaban `GET /devices/:id/latest`; **`Pengguna`** = jawaban `POST /auth/login`, `POST /auth/refresh`, dan `GET /auth/me`, dengan `peran` `"admin"` atau `"viewer"` (Modul 20).

Sebagian besar baru dipakai nanti (`Pengguna` di Praktik 4, `Perangkat` di Praktik 5, `BacaanTerbaru` di Praktik 6). `noUnusedLocals` tidak menegurnya karena semuanya diberi `export`.

> [!NOTE]
> **Mengapa disalin, bukan diambil dari backend?** Backend menyimpan bentuk yang sama sebagai skema Zod di `backend/src/schemas/kontrak.ts`, tetapi `backend` dan `frontend` adalah dua proyek terpisah. Menyalin paling sederhana untuk sekarang; harganya, dua salinan harus dijaga sama, dengan `KONTRAK-DATA.md` sebagai pegangan (kontrak diubah dulu, baru kedua salinannya). Cara berbagi satu salinan ada di [🔬 Bedah Teknis](#-bedah-teknis-opsional).

#### 3.2 Balok pertama: `src/components/KartuSensor.tsx` (10 menit)

Klik kanan folder **`frontend/src`** → **New Folder…**, beri nama **`components`** (rumah semua balok). Klik kanan folder itu → **New File…**, beri nama **`KartuSensor.tsx`**, lalu isi:

```tsx
// KartuSensor.tsx - satu kartu untuk satu bacaan sensor: label, angka, dan satuan.
// Dipakai ulang di seluruh dashboard (balok LEGO): cetakannya satu, isinya dititipkan lewat props.
type Props = {
  label: string; // tulisan kecil di atas, misalnya "Suhu"
  nilai: number | string | null; // angka atau teks; null = sensor gagal dibaca (aturan 7)
  satuan?: string; // tanda ? = boleh tidak diisi (kartu "Gerakan" tidak punya satuan)
  warna?: string; // kelas warna Tailwind untuk angkanya, misalnya "text-teal-600"
};

export default function KartuSensor({ label, nilai, satuan, warna = "text-slate-800" }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {/* ?? = kalau nilainya null, tulis "—" (bukan 0: angka 0 tetap bacaan yang sah) */}
        <span className={nilai === null ? "text-slate-400" : warna}>{nilai ?? "—"}</span>
        {/* satuan hanya ditulis kalau ada angkanya */}
        {satuan && nilai !== null ? <span className="ml-1 text-base font-normal text-slate-400">{satuan}</span> : null}
      </p>
    </div>
  );
}
```

Isinya sudah kamu bedah di Konsep 5–6. Ingat: nama berkas sama dengan nama komponennya (huruf besar, `.tsx`); `{nilai ?? "—"}` menulis `—` abu-abu tanpa satuan untuk sensor yang gagal (`null`), sedangkan `0` tetap `0`; kelas Tailwind ditulis utuh supaya `@tailwindcss/vite` menemukannya (Konsep 3). Simpan. Layar belum berubah karena cetakannya belum dipasang.

#### 3.3 Enam kartu dari satu bacaan `generate-dummy.js` (10 menit)

Komentar di kepala `generate-dummy.js` sudah menjanjikan pertemuan ini sejak Modul 4 ("Dipakai lagi di Modul 10, 16, dan 22."): alat itu mengisi dashboard sebelum ada sensor sungguhan.

**Buat satu bacaan contoh.** Buka terminal kedua (**Terminal → New Terminal**), lalu ketik:

```text
node --version
cd alat
node generate-dummy.js
```

Baris pertama harus `v24…`. **Hasilnya (contoh):** angkanya acak, dan `ts` mengikuti jam saat kamu menjalankannya.

```text
Selesai: 100 bacaan ditulis ke data/bacaan.json
Contoh bacaan pertama: {
  ts: '2026-10-23T09:56:59Z',
  fw: '0.1.0',
  suhu: 28.1,
  kelembapan: 71,
  cahaya: 473,
  tanah: 38,
  gerak: false,
  level_air: 57
}
```

Dari seratus bacaan di `alat/data/bacaan.json`, kita hanya butuh yang dicetak.

> [!NOTE]
> **Tidak mencetak apa pun?** `generate-dummy.js` memakai `import.meta.main`, yang baru ada sejak Node.js 24.2 (dan 22.18). Dengan Node.js 22.17, perintah ini diam saja, padahal Vite 8 tetap berjalan. Obatnya di [🚨 Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#-kalau-tidak-jalan), masalah "`node generate-dummy.js` tidak mencetak apa-apa".

**Pasang enam kartu di `App.tsx`.** Isinya hampir seluruhnya berganti. Buka [`kode/tahap/praktik-3/frontend/src/App.tsx`](kode/tahap/praktik-3/frontend/src/App.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/App.tsx`-mu (**Ctrl + A**, lalu **Ctrl + V**). Kalau mengetiknya sendiri, kotak galat Vite bisa muncul sekilas karena Auto Save menyimpan ketikan yang belum selesai; kotak itu hilang begitu ketikanmu lengkap.

Dua bagian utamanya: di atas, sesudah `import KartuSensor from "./components/KartuSensor";` (tanpa `{ }`: ekspor utama, `export default`) dan `import type { TelemetryNode1 } from "./types";` (Konsep 6):

```tsx
const bacaan: TelemetryNode1 = {
  ts: "2026-10-23T09:56:59Z",
  fw: "0.1.0",
  suhu: 28.1,
  kelembapan: 71,
  cahaya: 473,
  tanah: 38,
  gerak: false,
  level_air: 57,
};
```

Label `TelemetryNode1` membuat TypeScript memeriksa setiap kolom terhadap kontrak; `state` dan trio RS-485 boleh tidak ada berkat tanda `?`. Angkanya **disalin**, bukan di-`import`, karena `generate-dummy.js` memakai `node:fs` yang tidak ada di browser. Ganti nilainya dengan bacaan dari terminalmu, atau biarkan. Petik tunggal Node.js (`'0.1.0'`) diganti petik ganda seperti di backend Modul 16; keduanya sah.

Di dalam `<main>`, judul dibungkus `<div className="mx-auto max-w-3xl">` bersama baris kecil `fw` dan `ts`, lalu kisi enam kartu:

```tsx
        <div className="mt-4 grid grid-cols-3 gap-3">
          <KartuSensor label="Suhu" nilai={bacaan.suhu} satuan="°C" warna="text-teal-600" />
          <KartuSensor label="Kelembapan" nilai={bacaan.kelembapan} satuan="%" />
          <KartuSensor label="Cahaya" nilai={bacaan.cahaya} satuan="/4095" />
          <KartuSensor label="Kelembapan tanah" nilai={bacaan.tanah} satuan="%" />
          <KartuSensor label="Gerakan" nilai={bacaan.gerak ? "Ada" : "Tidak ada"} />
          <KartuSensor label="Air tandon" nilai={bacaan.level_air} satuan="%" />
        </div>
```

Cetakannya satu, titipannya enam macam. Kartu Gerakan mengubah `true`/`false` menjadi teks dengan `? :` (Pemanasan Langkah 3). Jam UTC `ts` tampil apa adanya; "diperbarui pukul … WIB" menyusul di `DetailPerangkat` (Praktik 6). `max-w-3xl` membatasi isi paling lebar 768 px; tiga kolom yang terlalu sempit di HP dibereskan di Praktik 7.

Simpan. Berkat HMR, browser langsung berubah.

**Hasilnya (contoh):** di bawah judul ada baris kecil abu-abu `Bacaan contoh dari generate-dummy.js (belum dari API) · firmware 0.1.0 · ts 2026-10-23T09:56:59Z`, lalu enam kartu putih dalam dua baris tiga kolom di tengah layar: `Suhu` `28.1` `°C` (angka hijau toska), `Kelembapan` `71` `%`, `Cahaya` `473` `/4095`, `Kelembapan tanah` `38` `%`, `Gerakan` `Tidak ada` (tanpa satuan), dan `Air tandon` `57` `%`. Angka lain gelap; satuannya kecil abu-abu.

**Intip titipannya.** Di DevTools (**F12**), tab **Components**, `App` membawahi enam `KartuSensor`; klik salah satunya untuk melihat *props*-nya (`label`, `nilai`, `satuan` bila ada, `warna` di kartu Suhu). Papan tulis (*state*) pertama baru muncul di Praktik 4.

#### 3.4 Salah ketik yang ditangkap TypeScript (8 menit)

Konsep 4 bilang Vite menghapus label tipe **tanpa** memeriksanya. Buktikan dengan salah ketik paling umum di dashboard ini: `kelembaban` (ejaan baku KBBI dan nama kolom kontrak: `kelembapan`).

**Buat salah ketiknya.** Di baris kartu Kelembapan, ganti `bacaan.kelembapan` dengan `bacaan.kelembaban`, lalu simpan.

**Lihat VS Code.** `kelembaban` digarisbawahi merah bergelombang. Arahkan tetikus ke sana: kolom itu tidak ada di `TelemetryNode1`, dan VS Code menyarankan `kelembapan`. Panel **Problems** (**Ctrl + Shift + M**) mencatatnya beserta nomor baris.

**Lihat browser.** Tidak ada kotak galat Vite, dan tab **Console** tenang: tanpa baris merah atau kuning. Hanya kartu Kelembapan yang berubah menjadi `—%`: tanda `—` berwarna gelap seperti angka lain (bukan abu-abu), dan `%` tetap menempel.

Mengapa? Di JavaScript, `bacaan.kelembaban` hanya bernilai `undefined` ("kolom ini tidak ada"). `KartuSensor` menyiapkan warna abu-abu dan menyembunyikan satuan hanya untuk `null`; `undefined` lolos, lalu `??` mengubahnya menjadi `—`. Kartunya tampak seperti sensor rusak; kamu bisa berhari-hari memeriksa kabel DHT22, padahal salahnya satu huruf.

> [!IMPORTANT]
> **Garis merah di VS Code tidak menghentikan dapur.** `npm run dev` tetap menyajikan halaman yang salah (Konsep 4). Pemeriksa tipe hanya dua: VS Code saat kamu mengetik, dan `tsc -b` di awal `npm run build`.

**Jalankan pemeriksanya** di terminal kedua (masih di folder `alat`):

```text
cd ../frontend
npm run build
```

**Hasilnya:**

```text
> frontend@0.0.0 build
> tsc -b && vite build

src/App.tsx:31:57 - error TS2551: Property 'kelembaban' does not exist on type 'TelemetryNode1'. Did you mean 'kelembapan'?

31           <KartuSensor label="Kelembapan" nilai={bacaan.kelembaban} satuan="%" />
                                                           ~~~~~~~~~~

  src/types.ts:43:3
    43   kelembapan: number | null; // %
         ~~~~~~~~~~
    'kelembapan' is declared here.


Found 1 error.
```

Baris galatnya menyebut berkas, baris, dan kolom salah ketiknya, kode `TS2551`, dan saran `kelembapan`; di bawahnya, `tsc` menunjuk tempat `kelembapan` ditulis di `src/types.ts`. Sesudah `Found 1 error.`, npm tidak mencetak apa-apa lagi. Karena `tsc -b` gagal, `&&` menghentikan langkah berikutnya: `vite build` tidak berjalan, dan `dist/` tidak diperbarui.

**Betulkan, lalu ulangi.** Kembalikan menjadi `kelembapan`, simpan (garis merah hilang, angka kembali), lalu jalankan `npm run build` lagi.

**Hasilnya (contoh):** nama berkas, ukuran, dan lamanya bisa berbeda.

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 17 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-BlS5-9Xz.css   10.14 kB │ gzip:  2.70 kB
dist/assets/index-Dglwcm4q.js   220.95 kB │ gzip: 69.19 kB

✓ built in 749ms
```

`tsc -b` tidak mencetak apa pun, tanda tidak ada galat tipe, lalu `vite build` mengemas dashboard ke `dist/` (dibedah di 🔬; tidak ikut Git). Berkas CSS membesar dari 6.80 kB di Praktik 2 menjadi 10.14 kB karena Tailwind ikut membuat kelas baru di `KartuSensor` dan `App` (Konsep 3). Di terminal VS Code, baris `transforming...` dan `rendering chunks...` bisa tertimpa lalu hilang.

**Coba juga (pilihan).** Ubah ke `kelembapan: null`: tidak bergaris merah, dan kartunya `—` abu-abu **tanpa** `%`: rupa sensor yang benar-benar gagal (aturan 7). `cahaya: null` bergaris merah karena menurut kontrak `cahaya` tidak pernah `null`. Kembalikan seperti semula.

Biasakan melirik garis merah dan menjalankan `npm run build` sebelum menyimpan ke Git; di Praktik 8 dan ➕ B, `npm run build` dan `npm run lint` menjadi syarat. Galat tipe lain (`TS1484`, `TS1294`, `TS6133`) ada di [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan).

#### 3.5 Simpan ke cabang (7 menit)

Pastikan `App.tsx` sudah memakai `kelembapan` lagi dan `npm run build` terakhir lolos. Di terminal kedua (folder `frontend`):

```text
git add src/types.ts src/components/KartuSensor.tsx src/App.tsx
git status
git commit -m "KartuSensor dan tipe dari kontrak data: enam kartu dari bacaan contoh (Modul 22 Praktik 3)"
```

`git status` menunjukkan tiga berkas siap di-*commit*: dua baru dan `App.tsx` yang berubah. `dist/`, `node_modules`, dan `alat/data/` diabaikan `.gitignore`.

> ⬆️ **Selesai Praktik 3?** Baca [Konsep 7 — *State* dan `useState`](#7-state-dan-usestate-layar-yang-ingat) dan [Konsep 9 — *Login* dari browser](#9-login-dari-browser-cookie-cors-dan-localhost), lalu lanjut ke [Praktik 4 — *State* dan formulir *login*](#praktik-4--state-dan-formulir-login-60-menit). Kartu contoh ini masih tampil sesudah *login* di Praktik 4, diganti daftar perangkat di Praktik 5, dan `KartuSensor` dipakai lagi untuk angka sungguhan dari API di Praktik 6.

### Praktik 4 — *State* dan formulir *login* (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal folder `backend` (backend v1.0, `npm run dev`, port 8080), terminal folder `frontend` (Vite, port 5173), dan satu terminal kosong di folder `frontend` untuk Git; jalur laptop menambah terminal broker (folder `edge`) dan simulator (folder `alat`). Lalu **Docker Desktop**, **browser Chrome atau Edge** dengan DevTools (tab **Network** dan **Console**, panel **Application**) dan React DevTools, serta **Bruno**. Konsep yang dipakai: Konsep 7 dan 9.
>
> ⭐ **Wajib** — langkah 4.4: *login* dari browser dengan akun Modul 20, lalu buktikan sendiri di DevTools bahwa *cookie*-nya benar-benar datang.

Sampai Praktik 3, dashboard belum pernah berbicara dengan backend. Praktik ini membuka pintunya: **satu pintu** ke backend, `src/api.ts`, yang selalu membawa *cookie*, lalu **formulir *login*** pertamamu, `src/components/Login.tsx`. Di akhir praktik, browser memegang gelang dan kartu terusan yang sama dengan milik Bruno di Modul 20.

#### 4.1 Nyalakan backend v1.0 dan sumber datanya (8 menit)

Mulai minggu ini, backend (Fastify, folder `backend`) dan dashboard (Vite, folder `frontend`) menyala **bersamaan**, masing-masing dengan `npm run dev` di terminalnya sendiri. Terminal baru di VS Code (**Terminal → New Terminal**) berada di folder `rumah-pintar-mini`.

1. **Database.** Di Docker Desktop, nyalakan kontainer `rumahpintar-db` dengan tombol **▶**, atau jalankan `docker start rumahpintar-db` (Modul 17).
2. **Broker dan perangkat.** Jalur perangkat: nyalakan Node 1 dan Node 2 (broker di Pi sudah berjalan sebagai layanan). Jalur laptop: di terminal baru, nyalakan broker berkunci seperti di Modul 21 Praktik 4.5, kecuali kamu sudah memakai layanan Mosquitto permanen dari 🔬 Modul 21:

   ```text
   cd edge
   mosquitto -v -c mosquitto-lan.conf
   ```

3. **Backend.** Di terminal baru, ketik `cd backend` lalu `npm run dev`; tunggu `Server listening at http://127.0.0.1:8080` dan `tersambung ke broker … sebagai backend`. Kode backend v1.0 Modul 21 tidak diubah sedikit pun minggu ini.
4. **Jalur laptop: simulator** untuk satu perangkat latihan (Modul 21 Praktik 7.1), di terminal baru:

   ```text
   cd alat
   node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1
   ```

   Tunggu `f00d00000001: online`, lalu biarkan berjalan.
5. **Bruno.** Kirim **`health`**: jawabannya harus memuat `"database": true` dan `"broker": true`.
6. **Vite.** Kalau sudah berhenti, jalankan lagi `npm run dev` di terminal folder `frontend`, lalu buka **`http://localhost:5173`**.

*Login* belum memakai sumber data, tetapi bacaannya dibutuhkan di Praktik 5–6.

#### 4.2 Satu pintu ke backend: `src/api.ts` dan `.env.example` (12 menit)

Setiap ketukan ke backend (`/auth/login`, lalu `/auth/me`, `/devices`, `/devices/:id/latest`) butuh alamat backend, `credentials: "include"`, dan cara membaca galat. Semuanya dikumpulkan di **satu pintu**, `src/api.ts`: komponen cukup memanggil fungsi bernama seperti `masuk(email, sandi)`, dan *refresh* sekali (Praktik 6) dipasang di sini.

Klik kanan folder **`frontend/src`** → **New File…**, beri nama **`api.ts`**, lalu ketik:

```ts
// api.ts - satu pintu ke backend: semua permintaan ke API lewat fungsi minta() di berkas ini.
// Login memakai cookie HttpOnly dari backend (Modul 20). JavaScript tidak bisa membacanya; browser yang menyimpan
// dan mengirimkannya, asalkan setiap fetch membawa credentials: "include".
import type { Pengguna } from "./types";

// Alamat backend. Bawaan: nama host halaman ini + port 8080, jadi halaman http://localhost:5173 -> API http://localhost:8080.
// Nama host yang sama itu penting: cookie SameSite=Strict hanya ikut kalau halaman dan API satu situs
// (localhost dengan localhost, 127.0.0.1 dengan 127.0.0.1). Alamat lain bisa diatur lewat VITE_API_BASE di .env.local.
// Garis miring di ujung dibuang: "//auth/login" dijawab backend sebagai rute yang tidak dikenal (401).
const BASE: string = (import.meta.env.VITE_API_BASE || `${location.protocol}//${location.hostname}:8080`).replace(/\/+$/, "");

// Galat yang tahu kode HTTP-nya, supaya layar bisa membedakan "belum login" (401) dari gangguan lain.
// Kode 0 = server sama sekali tidak bisa dihubungi.
export class GalatApi extends Error {
  kode: number;
  constructor(kode: number, pesan: string) {
    super(pesan);
    this.kode = kode;
    this.name = "GalatApi";
  }
}

// minta() mengirim satu permintaan, lalu mengembalikan isi JSON jawabannya atau melempar GalatApi.
// <T> = bentuk isi jawabannya, diisi oleh fungsi yang memanggil (misalnya Pengguna).
async function minta<T>(jalur: string, opsi: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    // credentials: "include" = bawa cookie walau API beda asal (port 8080, bukan 5173)
    res = await fetch(BASE + jalur, { credentials: "include", ...opsi });
  } catch {
    // fetch gagal total: backend mati, alamatnya salah, atau diblokir CORS. Browser sengaja tidak memberi tahu
    // JavaScript yang mana (galat CORS tampak sama dengan backend mati); rinciannya hanya ada di tab Console.
    throw new GalatApi(
      0,
      "Tidak bisa menghubungi server di " + BASE + ". Mungkin backend belum menyala, atau halaman ini dibuka dari " +
        "alamat yang tidak diizinkan backend (buka http://localhost:5173, lihat CORS_ORIGIN).",
    );
  }
  if (!res.ok) {
    // fetch TIDAK melempar galat untuk 401, 404, atau 500: kitalah yang memeriksa res.ok
    let pesan = "Terjadi gangguan (" + res.status + ").";
    try {
      const tubuh = await res.json();
      if (typeof tubuh?.pesan === "string") pesan = tubuh.pesan; // galat yang ditulis backend kita
      else if (typeof tubuh?.message === "string") pesan = tubuh.message; // galat bawaan Fastify: 400, 429, 500
    } catch {
      // jawabannya bukan JSON: pakai pesan bawaan di atas
    }
    throw new GalatApi(res.status, pesan);
  }
  // as T = "percayalah, isinya berbentuk T". TypeScript tidak memeriksa isi JSON saat halaman berjalan;
  // kita mengandalkan kontrak API backend (pemeriksaan sungguhan dengan Zod baru di Modul 24).
  return (await res.json()) as T;
}

// POST /auth/login. Kepala Content-Type JSON hanya dipasang pada permintaan yang memang membawa body JSON:
// POST yang mengaku JSON tetapi badannya kosong ditolak backend (400).
export function masuk(email: string, sandi: string): Promise<Pengguna> {
  return minta<Pengguna>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sandi }),
  });
}
```

- **`BASE`** mengikuti nama host halaman (Konsep 9): halaman `http://localhost:5173` mengetuk `http://localhost:8080`, kecuali `.env.local` mengisi `VITE_API_BASE`. Sengaja `||` (Pemanasan Langkah 3), bukan `??`: baris `VITE_API_BASE=` tanpa isi menghasilkan `""`, dan `??` akan menerimanya sebagai alamat. Label `: string` dipasang karena TypeScript tidak tahu tipe variabel `VITE_…`.
- **`GalatApi`** adalah *class* (cetakan objek) galat yang mewarisi `Error` dan menambah kolom **`kode`**: kode HTTP-nya, atau **0** kalau server sama sekali tidak bisa dihubungi, supaya layar bisa membedakan "sandi salah" dari "backend mati" (Konsep 10). `constructor` berjalan saat `new GalatApi(…)`: `super(pesan)` meneruskan pesan ke `Error` (`err.message`), dan `this.kode` menyimpan kodenya. Singkatan `constructor(public kode…)` ditolak (`TS1294`, 🚨).
- **`minta<T>()`** adalah jantungnya. `<T>` adalah "lubang tipe" yang diisi pemanggil: `minta<Pengguna>(…)` berarti "jawabannya berbentuk `Pengguna`".
  1. `fetch` selalu diberi `credentials: "include"`; *spread* `...opsi` (Pemanasan Langkah 4) menambahkan `method`, `headers`, dan `body`.
  2. Kalau `fetch` **gagal total** (misalnya backend mati), `catch` mengubahnya menjadi `GalatApi` berkode 0 dengan pesan yang menyebut alamat `BASE` dan dua kemungkinan penyebab (4.5).
  3. `fetch` **tidak** melempar galat untuk 401, 404, atau 500, jadi `minta()` memeriksa `res.ok` sendiri, seperti `pemanasan.js` (Langkah 5). Pesannya diambil dari kolom `pesan` (ditulis backend kita, misalnya `email atau sandi salah`) atau `message` (galat berbentuk bawaan Fastify: 400, 429, 500).
  4. `as T` berarti "percayalah, bentuknya `T`": tidak ada yang memeriksa data dari jaringan, jadi `types.ts` harus cocok dengan kontrak data.
- **`masuk()`** (diekspor; `minta()` tidak) mengirim `POST /auth/login` berisi `{ email, sandi }`, singkatan dari `{ email: email, sandi: sandi }`. Hanya permintaan ini yang membawa isi, jadi hanya di sini `Content-Type: application/json` dipasang; kepala itulah yang memicu *preflight*. *Logout* dan *refresh* nanti tanpa kepala itu, karena backend menolak `POST` berlabel JSON yang kosong.

Lalu klik kanan folder **`frontend`** (bukan `src`) → **New File…**, beri nama **`.env.example`** (diawali titik), lalu ketik:

```text
# .env.example - contoh setelan dashboard. Berkas ini ikut Git; salinanmu (.env.local) TIDAK.
# Tanpa .env.local, dashboard memanggil backend di nama host halaman + port 8080:
# halaman http://localhost:5173 -> API http://localhost:8080. Itu sudah cocok dengan backend Modul 21.
# Backend-mu di alamat lain? Salin berkas ini menjadi .env.local, hapus tanda # di depan baris terakhir,
# ganti alamatnya, lalu hentikan npm run dev (Ctrl + C) dan jalankan lagi.
# Ingat: semua VITE_... ikut tertanam di JavaScript yang dikirim ke browser. Isi alamat saja, JANGAN rahasia.
# VITE_API_BASE=http://localhost:8080
```

Berkas ini hanya **contoh** (Vite tidak membacanya) untuk teman setim, atau untukmu kelak kalau backend-nya ada di alamat lain. Baris `VITE_API_BASE` sengaja berupa komentar, supaya salinan apa adanya tidak mematok alamat backend dan alamat API tetap mengikuti nama host halaman.

> [!IMPORTANT]
> **Jangan membuat `.env.local` minggu ini.** Tanpa berkas itu, dashboard sudah mengetuk `http://localhost:8080`. Kalau kelak dibutuhkan: nama host di `VITE_API_BASE` harus sama dengan nama host halaman, Vite hanya membacanya saat dinyalakan (**Ctrl + C**, lalu `npm run dev` lagi), dan isinya terkirim ke browser, jadi hanya boleh alamat, tidak pernah rahasia.

Simpan kedua berkas (**Ctrl + S**). Layar belum berubah, karena `api.ts` belum dipakai.

#### 4.3 Formulir *login*: `src/components/Login.tsx`, lalu pasang di `App` (15 menit)

Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`Login.tsx`**, lalu ketik:

```tsx
// Login.tsx - formulir masuk minimal: email + sandi ke POST /auth/login. Kalau berhasil, backend memasang
// cookie login di browser, lalu komponen induk diberi tahu lewat onMasuk. Disempurnakan di Modul 24.
import { useState } from "react";
import type { SubmitEvent } from "react"; // tipe kejadian "formulir dikirim" milik React
import { GalatApi, masuk } from "../api";
import type { Pengguna } from "../types";

type Props = {
  onMasuk: (pengguna: Pengguna) => void; // dipanggil sesudah login berhasil, membawa akun dari backend
};

export default function Login({ onMasuk }: Props) {
  // Formulir terkendali: isi kotak selalu sama dengan state, dan setiap ketikan memperbarui state.
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false); // true selama menunggu jawaban backend

  async function kirim(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // jangan biarkan browser memuat ulang halaman (perilaku bawaan formulir)
    setGalat(null);
    setSibuk(true);
    try {
      onMasuk(await masuk(email, sandi));
    } catch (err) {
      setGalat(err instanceof GalatApi ? err.message : "Gagal masuk.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={kirim} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-slate-800">Rumah Pintar Mini</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk dengan akun Modul 20 untuk melihat dashboard.</p>

        {/* htmlFor = atribut for di HTML: mengetuk label memindahkan kursor ke kotaknya */}
        <label htmlFor="email" className="mt-5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="viewer@rumah.test"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        <label htmlFor="sandi" className="mt-4 block text-sm font-medium text-slate-700">
          Sandi
        </label>
        <input
          id="sandi"
          type="password"
          required
          value={sandi}
          onChange={(e) => setSandi(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-hidden"
        />

        {galat ? <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{galat}</p> : null}

        <button
          type="submit"
          disabled={sibuk}
          className="mt-5 w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {sibuk ? "Sedang masuk…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
```

Keempat papan tulisnya, formulir terkendali, dan `kirim()` sudah dibedah di Konsep 7. Yang perlu diperhatikan:

- **Dua baris impor dari `"react"`.** `import { useState } from "react";` mengambil fungsi, sedangkan `import type { SubmitEvent } from "react";` hanya mengambil label, jadi memakai `import type` (Konsep 6). `GalatApi` dan `masuk` diimpor tanpa `type`, karena keduanya **nilai**: `masuk` dipanggil, `err instanceof GalatApi` memeriksa apakah galat itu buatan `minta()` (kalau bukan: `Gagal masuk.`).
- **`SubmitEvent<HTMLFormElement>`** adalah label kejadian "formulir dikirim". Tutorial lama memakai `FormEvent`, yang di @types/react 19.3 ditandai usang (VS Code mencoretnya). Tanpa baris `import type { SubmitEvent }`, TypeScript memakai `SubmitEvent` bawaan browser yang tidak menerima `<…>`, dan `npm run build` gagal dengan `TS2315` `Type 'SubmitEvent' is not generic.` (🚨).
- **`htmlFor` dan `id`**: `htmlFor` adalah atribut `for` HTML versi JSX (seperti `className`). Pasangan ini menghubungkan label dengan kotaknya: mengklik tulisan **Email** memindahkan kursor ke kotaknya, dan pembaca layar untuk tunanetra membacakan label yang benar. Tanpanya, Chrome dan Edge mencatat saran perbaikan di panel **Issues** DevTools, misalnya `No label associated with a form field`.
- **`type="email"`, `type="password"`, dan `required`** membuat browser menolak kotak kosong dan email tanpa `@` sebelum `fetch` berangkat, dan menampilkan sandi sebagai titik. **`autoComplete`** menuntun pengelola sandi; **`placeholder`** hanya contoh abu-abu. Kotak merah muda `{galat}` hanya digambar kalau ada pesan, dan teksnya diloloskan JSX (Konsep 5). Selama `sibuk`, tombolnya pudar dan bertuliskan `Sedang masuk…`.

Sekarang pasang `Login` di **`src/App.tsx`**, yang hanya berubah sedikit. Di impor paling atas, `useState`, `Login`, dan label `Pengguna` ikut diambil:

```tsx
import { useState } from "react";
import KartuSensor from "./components/KartuSensor";
import Login from "./components/Login";
import type { Pengguna, TelemetryNode1 } from "./types";
```

Di awal fungsi `App`, sebelum `return` yang lama:

```tsx
export default function App() {
  // null = belum login. Sesudah login, berisi akun dari jawaban POST /auth/login.
  const [pengguna, setPengguna] = useState<Pengguna | null>(null);

  if (pengguna === null) {
    return <Login onMasuk={setPengguna} />;
  }
```

Di bawah judul ada paragraf salam baru, dan paragraf `Bacaan contoh…` sesudahnya kini berkelas `mt-4`:

```tsx
        <p className="mt-2 text-slate-600">
          Halo, {pengguna.nama}! Kamu masuk sebagai <span className="font-semibold">{pengguna.peran}</span>.
        </p>
        <p className="mt-4 text-sm text-slate-500">
```

Komentar di atas berkas juga berubah: ia mencatat satu kelemahan yang sengaja dibiarkan (kamu mencobanya di akhir 4.4). Cara paling aman: buka [`kode/tahap/praktik-4/frontend/src/App.tsx`](kode/tahap/praktik-4/frontend/src/App.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/App.tsx`-mu.

Selama papan `pengguna` berisi `null`, layar hanya berisi formulir. Titipan `onMasuk` adalah `setPengguna` sendiri (data turun lewat *props*, kejadian naik lewat fungsi titipan, Konsep 6): begitu `Login` melapor dengan akun dari backend, papan terisi, React menggambar ulang `App`, dan salam serta kartu-kartu tampil tanpa "pindah halaman".

Simpan kedua berkas. Vite memperbarui browser sendiri.

**Hasilnya:** di `http://localhost:5173`, kartu-kartu Praktik 3 berganti dengan formulir di tengah layar abu-abu muda: kartu putih bersudut membulat berisi judul `Rumah Pintar Mini`, kalimat `Masuk dengan akun Modul 20 untuk melihat dashboard.`, kotak **Email** dengan contoh abu-abu `viewer@rumah.test`, kotak **Sandi**, dan tombol hijau toska **Masuk**.

Coba dua hal kecil sebelum *login*:

1. **`required` bekerja tanpa backend.** Buka DevTools (**F12**; macOS: **Cmd + Option + I**) di tab **Network**, lalu klik **Masuk** dengan kedua kotak kosong. Gelembung kecil muncul di kotak **Email**, dan tidak ada baris baru di tab **Network**. Teks gelembung mengikuti bahasa browsermu, misalnya `Please fill out this field.`, atau `Isi bidang ini.` di Edge berbahasa Indonesia. Ketik `abc`, lalu klik **Masuk** lagi: kali ini gelembungnya meminta `@`.
2. **Papan tulisnya bisa diintip.** Di tab **Components** dari React DevTools, klik `Login`. Bagian **hooks** di panel kanan memuat empat baris `State` bernomor 1 sampai 4, berurutan seperti `useState` di `Login.tsx` (`email`, `sandi`, `galat`, `sibuk`). Ketik di kotak **Email**: baris pertama ikut berubah, huruf demi huruf. Ketik huruf asal di kotak **Sandi**: baris kedua menampilkannya **apa adanya**, jadi jangan memotret DevTools saat mengetik sandi sungguhan. Kosongkan lagi kedua kotak.

#### 4.4 ⭐ Masuk: `POST /auth/login` di tab Network, *cookie* di panel Application (10 menit)

Buka DevTools sebelum *login*, supaya tab **Network** mencatat sejak awal (Konsep 2).

1. Di tab **Network**, pastikan tombol jenis permintaan **All** (bawaan, di samping **Fetch/XHR**, **Doc**, dan lainnya) yang terpilih, supaya *preflight* ikut tampil. Kosongkan baris lama dengan **Clear network log**, ikon lingkaran bergaris miring di kanan tombol rekam merah (**Ctrl + L**; macOS: **Cmd + K**).
2. Ketik `viewer@rumah.test` di kotak **Email**, lalu tempel sandi akun `viewer` Modul 20 di kotak **Sandi**: dari pengelola sandimu, atau nilai `SANDI_VIEWER` di `backend/bruno/.env` (tanpa tanda petik). Akun `viewer` cukup untuk dashboard yang hanya melihat; biasakan memakai hak paling kecil yang mencukupi.
3. Klik **Masuk**.

**Hasilnya:** tombolnya sebentar bertuliskan `Sedang masuk…` dan tidak bisa ditekan (backend sengaja memeriksa sandi dengan bcrypt yang lambat, Modul 20), lalu formulirnya berganti dengan judul `Rumah Pintar Mini`, salam `Halo, Tamu Rumah! Kamu masuk sebagai viewer.` (berisi nama akun `viewer`-mu dari Modul 20), dan keenam kartu contoh. Terminal backend menulis (**contoh**; jam dan angkanya berbeda di laptopmu):

```text
[23:08:26] INFO: OPTIONS /auth/login -> 204 (1 ms)
[23:08:26] INFO: login: akun 2 (viewer), sesi 8, IP 127.0.0.1
[23:08:26] INFO: POST /auth/login -> 200 (304 ms)
```

Sekarang periksa tiga bukti.

**Bukti pertama: tab Network.** Ada **dua** baris bernama `login` (Edge mungkin menambah satu baris berawalan `data:image/svg+xml`; abaikan):

| **Status** | **Type** | Artinya |
| :--- | :--- | :--- |
| `204` | `preflight` | `OPTIONS`: browser bertanya dulu (tanpa *cookie*) apakah `http://localhost:5173` boleh mengirim `POST` berisi JSON |
| `200` | `fetch` | `POST`: *login* sebenarnya; kolom **Initiator** menunjuk `api.ts:29`, baris `fetch` di `minta()` |

Baris `fetch` bisa tampil **di atas** `preflight` (di Chrome dan Edge penulis), padahal *preflight* berangkat lebih dulu. Hanya satu baris? Pastikan pilihannya **All**: jenis `preflight` tersembunyi saat **Fetch/XHR** dipilih. Mengulang *login* dalam ±5 detik juga bisa tanpa *preflight*, karena browser masih mengingat jawabannya (Konsep 9).

Klik baris `preflight`, lalu tab **Headers**. Di `Request headers`, browser menyebut niatnya (`Access-Control-Request-Method` `POST`); di `Response headers`, backend memberi izin dari `CORS_ORIGIN` Modul 20 (`Access-Control-Allow-Origin` `http://localhost:5173`, `Access-Control-Allow-Credentials` `true`).

Lalu klik baris `fetch`:

- Tab **Headers**: `Response headers` memuat dua `Set-Cookie`, gelang `akses=…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict` dan kartu terusan `sesi=…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict`, ditambah izin CORS yang sama (tanpa izin itu, browser tidak menyerahkan jawaban ke `api.ts` dan tidak menyimpan *cookie*-nya). `X-Ratelimit-Limit` `10` adalah batas *login* per menit (4.5).
- Tab **Payload**: isi yang dikirim formulirmu, `email` dan `sandi`.
- Tab **Response** (atau **Preview**): profil akunmu.

**Hasilnya** (**contoh**; `id` dan `nama` mengikuti akunmu):

```json
{"id":2,"email":"viewer@rumah.test","nama":"Tamu Rumah","peran":"viewer"}
```

Tidak ada token di isinya: gelang dan kartu terusan hanya datang lewat `Set-Cookie`, seperti di Bruno (Modul 20).

> [!WARNING]
> **DevTools memperlihatkan rahasiamu apa adanya.** Tab **Payload** menampilkan sandimu tanpa titik, sedangkan `Set-Cookie` dan panel **Application** menampilkan isi gelang dan kartu terusanmu. Jangan memotret atau menempelkannya ke grup saat bertanya, sama seperti jendela **Cookies** Bruno di Modul 20. Sandi itu juga berjalan polos ke backend, walaupun hanya di dalam laptopmu; HTTPS baru dipasang di Modul 27.

**Bukti kedua: panel Application** (tab **Application**; kalau tak terlihat, klik **»**). Di daftar kiri, pada kelompok **Storage** (bukan butir **Storage** di kelompok **Application** di atasnya), buka **Cookies**, lalu klik `http://localhost:5173`.

**Hasilnya (contoh):** tanpa kolom **Value** dan beberapa kolom lain.

| Name | Domain | Path | Expires / Max-Age | Size | HttpOnly | SameSite |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `akses` (gelang) | `localhost` | `/` | `2026-10-23T16:23:26.886Z` | `180` | ✓ | `Strict` |
| `sesi` (kartu terusan) | `localhost` | `/auth` | `2026-10-30T16:08:26.886Z` | `47` | ✓ | `Strict` |

Jamnya UTC (akhiran `Z`): `16:23:26` UTC = 23.23.26 WIB, 15 menit sesudah *login*. *Cookie* dari `localhost:8080` tampil di bawah `http://localhost:5173`, karena *cookie* tidak dipisah per port (Konsep 9). Kolom **Value** (dan `Cookie Value` di bawah tabel saat baris diklik) berisi token yang masih berlaku: jangan sampai terpotret.

**Bukti ketiga: tab Console.** Ketik `document.cookie`, lalu tekan **Enter**.

**Hasilnya:** `''`, sepasang tanda petik tunggal tanpa isi. *Cookie* `HttpOnly` tidak terlihat oleh JavaScript: browser yang memegang dan melampirkannya, bukan kode dashboard.

**Kamu lulus langkah ⭐ ini** kalau tiga hal ini terlihat: salam berisi nama akunmu; di tab **Network**, `POST /auth/login` (baris `fetch`) berstatus 200, biasanya didahului *preflight* `OPTIONS` berstatus 204; dan di panel **Application**, *cookie* `akses` dan `sesi` bertanda **HttpOnly**.

> [!NOTE]
> **Salam muncul, tetapi tabel Cookies kosong?** Hampir pasti nama host di `VITE_API_BASE` (`.env.local`) berbeda dengan nama host halaman, jadi browser menolak *cookie* `SameSite=Strict` dari situs lain (Konsep 9); mulai Praktik 5, akibatnya *login* berputar. Buka `http://localhost:5173`, hapus `.env.local` kalau ada, lalu nyalakan ulang Vite ([🚨](#-kalau-tidak-jalan)).

Terakhir, coba kelemahan yang dicatat di komentar `App.tsx`: muat ulang halaman dengan **F5** (macOS: **Cmd + R**).

**Hasilnya:** formulir *login* kembali kosong, padahal tabel **Cookies** masih menyimpan `akses` dan `sesi`. Memuat ulang memulai `App` dari awal (papan `pengguna` kembali `null`), dan dashboard tidak bisa mengintip *cookie* `HttpOnly`, jadi ia harus **bertanya ke backend**: `GET /auth/me` di Praktik 5.

#### 4.5 Sandi salah (401) dan backend mati: pesan yang bisa dimengerti (8 menit)

Coba dua kegagalan yang paling sering, dengan DevTools tetap terbuka.

**Sandi salah.**

1. Ketik `viewer@rumah.test` di kotak **Email** dan sandi yang jelas salah di kotak **Sandi**, misalnya `bukan sandi yang benar` (boleh diketik langsung; bukan rahasia siapa pun).
2. Klik **Masuk**.

**Hasilnya:** `Sedang masuk…` sebentar, lalu kotak merah muda menulis `email atau sandi salah`. Di tab **Network**, baris `login` bertipe `fetch` berstatus `401`; tab **Console** mencatat satu baris merah `POST http://localhost:8080/auth/login 401 (Unauthorized)` dengan `api.ts:29` di ujung kanannya. Terminal backend menulis `WARN: login gagal: akun 2 (IP 127.0.0.1)` dan `POST /auth/login -> 401`.

Tangkapan di bawah merangkum empat keadaan formulir *login*: kosong, sandi salah, backend mati (sebentar lagi), dan sesi habis (Praktik 6):

![Komposit empat tangkapan layar asli formulir login dashboard v0.1 di Microsoft Edge selebar laptop 1280 px, terhubung ke backend v1.0 Modul 21 yang sungguhan; judul: Formulir login dashboard v0.1: kosong dan tiga pesan galat. Setiap panel memuat kartu putih yang sama: judul Rumah Pintar Mini, kalimat Masuk dengan akun Modul 20 untuk melihat dashboard., kotak Email, kotak Sandi, dan tombol hijau toska Masuk. Kiri atas, Kosong, saat pertama dibuka: kotak Email berisi tulisan abu-abu viewer@rumah.test yang hanya contoh, ditandai nomor 1. Kanan atas, Sandi salah: email admin@rumah.test, sandi berupa titik-titik, dan kotak merah muda bertuliskan email atau sandi salah, nomor 2. Kiri bawah, Backend mati saat halaman dibuka: kotak merah muda berisi Tidak bisa menghubungi server di http://localhost:8080. Mungkin backend belum menyala, atau halaman ini dibuka dari alamat yang tidak diizinkan backend (buka http://localhost:5173, lihat CORS_ORIGIN)., nomor 3. Kanan bawah, Sesi habis di tengah pemakaian: kotak merah muda Sesi sudah habis. Silakan masuk lagi., nomor 4. Keterangan: 1 kotak kosong, tulisan abu-abu hanya contoh, yaitu placeholder, bukan isi, dan required menahan formulir yang kosong; 2 sandi salah (401), kolom pesan dari backend ditampilkan apa adanya, email atau sandi tidak dibedakan; 3 gagal total (kode 0) punya dua kemungkinan, backend mati atau alamat halaman tidak diizinkan (CORS_ORIGIN); 4 sesi habis karena refresh pun ditolak, layar kembali ke formulir dengan satu kotak pesan saja.](aset/dashboard-login.png)

Kalimat `email atau sandi salah` ditulis backend di kolom `pesan`, sama untuk email maupun sandi yang salah (Modul 20), supaya tamu tidak bisa menebak email mana yang punya akun. Baris merah di **Console** hanyalah catatan bawaan browser untuk jawaban berkode galat, **bukan** tanda kodemu rusak. Pesan selalu tampil di **satu** kotak: setiap klik **Masuk** menghapus pesan lama dulu (`setGalat(null)`), dan pesan titipan `App` di Praktik 5 pun masuk ke kotak itu.

Dua pesan lain datang dari kolom `message` (galat berbentuk bawaan Fastify); cukup kenali, tak perlu dicoba:

- **`body/email email tidak sah`** (400): email seperti `admin@rumah` lolos pemeriksaan browser, tetapi ditolak pemeriksa Zod di backend. Pesannya tampil mentah dengan awalan teknis `body/email` (kolom `email` di isi permintaan); kodenya sengaja dibiarkan.
- **`terlalu banyak percobaan: coba lagi dalam N detik`** (429), jam pasir *login* Modul 20: mulai percobaan ke-11 dalam semenit dari laptop yang sama, dan *login* yang **berhasil** pun ikut dihitung. `N` adalah sisa detiknya, misalnya `54` di percobaan penulis.

**Backend mati.**

3. Di terminal backend, tekan **Ctrl + C**. Docker, broker, dan simulator tetap menyala.
4. Di dashboard, ketik sandi `viewer` yang benar, lalu klik **Masuk**.

**Hasilnya:** satu kotak merah muda berisi pesan kode 0 dari `api.ts`:

```text
Tidak bisa menghubungi server di http://localhost:8080. Mungkin backend belum menyala, atau halaman ini dibuka dari alamat yang tidak diizinkan backend (buka http://localhost:5173, lihat CORS_ORIGIN).
```

Tab **Console** menulis `POST http://localhost:8080/auth/login net::ERR_CONNECTION_REFUSED`: tidak ada program yang menjawab di port 8080. Di tab **Network**, kedua baris `login` berwarna merah; di Chrome, kolom **Status**-nya `(failed) net::ERR_CONNECTION_REFUSED`.

Mengapa dua kemungkinan? Kalau backend menyala tetapi alamat halaman tidak tercantum di `CORS_ORIGIN`, layar menampilkan pesan yang sama persis (penulis sudah mencobanya). Demi keamanan, browser tidak memberi tahu JavaScript **mengapa** permintaan lintas asal gagal; rinciannya hanya ada di tab **Console** ([MDN: CORS errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors)). Jadi, setiap kali pesan kode 0 muncul, buka tab **Console**: `net::ERR_CONNECTION_REFUSED` berarti backend mati atau port-nya salah, sedangkan `has been blocked by CORS policy` berarti asal halaman ditolak ([🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)).

5. Nyalakan lagi backend dengan `npm run dev` (atau **↑** lalu **Enter**), lalu tunggu `Server listening at http://127.0.0.1:8080`.
6. Klik **Masuk** lagi. Kotak merah mudanya hilang (`kirim()` mengosongkan papan `galat` sebelum mencoba), dan salamnya muncul tanpa memuat ulang dashboard.

#### 4.6 Simpan ke cabang (7 menit)

Di terminal kosong (folder `frontend`, cabang `fitur/dashboard` dari Praktik 2), periksa perubahannya:

```text
git status
```

Ada tiga berkas baru di bagian `Untracked files` (`.env.example`, `src/api.ts`, `src/components/Login.tsx`) dan satu yang berubah (`src/App.tsx`). `.env.local` tidak muncul, karena `.gitignore` templat mengabaikan berkas berakhiran `.local`. Lalu simpan:

```text
git add .env.example src/api.ts src/components/Login.tsx src/App.tsx
git commit -m "Formulir login dan satu pintu ke API (Modul 22 Praktik 4)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-4/frontend/`](kode/tahap/praktik-4/frontend/). Kalau ingin berhenti dulu, hentikan setiap terminal dengan **Ctrl + C** (database boleh tetap menyala).

> ⬆️ **Selesai Praktik 4?** Dashboard-mu sudah bisa *login*, tetapi lupa begitu halamannya dimuat ulang. Kembali ke [Konsep 8](#8-useeffect-dan-fetch-mengambil-data-sesudah-layar-tampil) dan [Konsep 10](#10-memuat-galat-dan-kosong-tiga-keadaan-yang-selalu-disiapkan), lalu lanjut ke [Praktik 5 — `useEffect`: siapa saya dan daftar perangkat](#praktik-5--useeffect-siapa-saya-dan-daftar-perangkat-60-menit).

### Praktik 5 — `useEffect`: siapa saya dan daftar perangkat (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 4 (backend v1.0 dan Vite; jalur laptop juga broker dan simulator) plus satu terminal kosong di folder `frontend` untuk `npm run lint` dan Git; **Docker Desktop** (`rumahpintar-db` menyala); **Chrome atau Edge** di `http://localhost:5173` dengan DevTools dan tab **Components** React DevTools. Konsep: 8, 10, dan 9.

Praktik 4 berakhir dengan satu kelemahan: tekan **F5**, dan formulir *login* kembali kosong, padahal *cookie*-mu masih tersimpan. Dashboard tidak bisa mengintip *cookie* `HttpOnly`, jadi ia harus **bertanya ke backend**:

1. **`App` bertanya "siapa saya?"** (`GET /auth/me`), lalu memilih layar: *login* atau daftar perangkat (5.1).
2. **`DaftarPerangkat`** menampilkan `GET /devices` dengan lencana `status` dan `kunci` (janji Modul 21: perangkat yang kuncinya dicabut menonjol, tidak berpura-pura *online*), plus keadaan memuat, galat, dan kosong (5.2).
3. **Tab Network** membuktikan `GET /devices` berangkat dua kali di mode pengembangan (5.3).
4. **Tombol Keluar** sederhana (5.4).

> [!NOTE]
> **Baru membuka laptop lagi?** Nyalakan semuanya seperti [Praktik 4.1](#41-nyalakan-backend-v10-dan-sumber-datanya-8-menit), lalu buka `http://localhost:5173`.

#### 5.1 Siapa saya? `App.tsx` bertanya ke `GET /auth/me` (15 menit)

> [!NOTE]
> **Dashboard rusak sebentar, dan itu wajar.** `App.tsx` yang baru memakai `DaftarPerangkat`, yang baru dibuat di 5.2. Begitu `App.tsx` disimpan, browser menampilkan kotak galat gelap yang diawali `[plugin:vite:import-analysis] Failed to resolve import "./components/DaftarPerangkat"`, dan terminal `frontend` mencatat galat yang sama. Abaikan dulu; selama 5.2, halamannya bisa berganti antara kotak galat dan halaman putih. **F5** di 5.2 Langkah 3 memulihkannya.

**Langkah 1 — tiga loket baru di `src/api.ts`.** Buka **`src/api.ts`**, lalu tambahkan label `Perangkat` di baris `import type` paling atas:

```ts
import type { Pengguna, Perangkat } from "./types";
```

Tambahkan juga tiga fungsi ini di bagian paling bawah, sesudah `masuk()` (berkas utuhnya: [`kode/tahap/praktik-5/frontend/src/api.ts`](kode/tahap/praktik-5/frontend/src/api.ts)):

```ts
// GET /auth/me: "siapa saya?" Dijawab 401 kalau belum login.
export function siapaSaya(): Promise<Pengguna> {
  return minta<Pengguna>("/auth/me");
}

// POST /auth/logout: tanpa body, jadi juga TANPA Content-Type JSON (kalau diberi, backend menjawab 400).
export function keluar(): Promise<unknown> {
  return minta<unknown>("/auth/logout", { method: "POST" });
}

// GET /devices: daftar perangkat dari database backend
export function ambilPerangkat(): Promise<Perangkat[]> {
  return minta<Perangkat[]>("/devices");
}
```

`siapaSaya()` sama dengan permintaan **`siapa saya`** di Bruno (Modul 20). Ketiganya cukup satu baris berkat satu pintu, `minta()`: *cookie* ikut, dan 401, 404, atau 500 menjadi `GalatApi`. `keluar()` tanpa isi, jadi tanpa `Content-Type` (jebakan 400, Konsep 9); jawabannya tidak dipakai, jadi berlabel `Promise<unknown>` ("isinya belum diketahui").

**Langkah 2 — `Login` menerima pesan dari `App`.** Buka **`src/components/Login.tsx`**, lalu ubah tiga hal (berkas utuhnya: [`kode/tahap/praktik-5/frontend/src/components/Login.tsx`](kode/tahap/praktik-5/frontend/src/components/Login.tsx)):

1. Di `type Props`, di atas baris `onMasuk`, tambahkan:

   ```tsx
     galatAwal: string | null; // pesan dari App (misalnya backend mati atau sesi habis), tampil sebelum mencoba masuk
   ```

2. Di baris `export default function Login(…)`, ganti `{ onMasuk }` dengan `{ galatAwal, onMasuk }`.
3. Isi awal papan `galat` diganti dari `null` menjadi `galatAwal`:

   ```tsx
     const [galat, setGalat] = useState<string | null>(galatAwal); // isi awalnya dari App; diganti saat mencoba masuk
   ```

`galatAwal` adalah titipan dari `App`: pesan yang tampil **sebelum** kamu mencoba masuk. Papan tulis boleh diisi awal dari titipan (Konsep 7). Kotaknya sama dengan kotak sandi salah, dan `kirim()` mengosongkannya setiap kali **Masuk** ditekan, jadi pesan tidak bertumpuk (Praktik 4.5).

**Langkah 3 — `App` bertanya "siapa saya?".** Isi `src/App.tsx` hampir seluruhnya berganti. Buka [`kode/tahap/praktik-5/frontend/src/App.tsx`](kode/tahap/praktik-5/frontend/src/App.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/App.tsx`-mu (**Ctrl + A**, lalu **Ctrl + V**). Baca dari atas:

```tsx
  // "memuat" = sedang bertanya ke backend; null = belum login; objek = sudah login
  const [pengguna, setPengguna] = useState<Pengguna | null | "memuat">("memuat");
  const [galatAwal, setGalatAwal] = useState<string | null>(null); // gangguan selain 401, ditulis di atas formulir
```

- **Satu papan, tiga kemungkinan isi**; labelnya gabungan pilihan, seperti `StatusPerangkat` (Konsep 6). Isi awalnya sengaja `"memuat"`: seandainya `null`, formulir *login* akan berkedip sesaat setiap kali halaman dimuat ulang.
- **Efek dengan `[]`: bertanya sekali, sesudah tampil** (`Memuat…` digambar dulu). Polanya sama dengan efek di Konsep 8, termasuk *cleanup* `ignore`; daftarnya `[]` karena efek ini tidak membaca *props* atau papan tulis. Bedanya di `.catch`:

```tsx
      .catch((err) => {
        if (ignore) return;
        // 401 = memang belum login: cukup tampilkan formulir. Selain itu (backend atau database mati): beri tahu.
        if (!(err instanceof GalatApi && err.kode === 401)) {
          setGalatAwal(err instanceof GalatApi ? err.message : "Gagal memeriksa login.");
        }
        setPengguna(null);
      });
```

- **Hanya 401 yang berarti "belum login".** `!` berarti "bukan": galat selain 401, misalnya backend mati (kode 0) atau database mati (500), ditulis di `galatAwal`. Tanpa pembedaan ini, backend mati tampak seperti "belum *login*", dan kamu bisa mengira sandimu salah (Konsep 10).
- **Kejadian yang naik.** `sudahMasuk` (titipan `onMasuk` untuk `Login`) menghapus pesan lama lalu mengisi papan `pengguna`; `sesiHabis` (titipan `onSesiHabis` untuk `DaftarPerangkat`) menulis `Sesi sudah habis. Silakan masuk lagi.` di `galatAwal` lalu kembali ke formulir. Anak hanya melapor; papan diubah pemiliknya (Konsep 6).
- **Tiga `return`, tiga layar:** `Memuat…`; `Login` dengan `galatAwal`; atau kepala halaman (judul, akun, tombol **Keluar**) dan `DaftarPerangkat` di bawah judul `Daftar Perangkat`. React Router baru datang di Modul 24. `KartuSensor.tsx` disimpan untuk Praktik 6.

Simpan ketiga berkas (**Ctrl + S**), lalu lanjut ke 5.2.

#### 5.2 Daftar perangkat: `Lencana.tsx` dan `DaftarPerangkat.tsx` (20 menit)

**Langkah 1 — lencana kecil: `Lencana.tsx`.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`Lencana.tsx`**, lalu ketik:

```tsx
// Lencana.tsx - lencana kecil berwarna untuk status dan kunci perangkat.
// Dipakai di daftar perangkat (Praktik 5) dan di judul detail perangkat (Praktik 6).
import type { StatusKunci, StatusPerangkat } from "../types";

// Kelas Tailwind ditulis UTUH di sini, bukan disambung ("bg-" + warna): Tailwind hanya membuat kelas yang tertulis lengkap.
const WARNA_STATUS: Record<StatusPerangkat, string> = {
  online: "bg-green-100 text-green-800",
  offline: "bg-slate-200 text-slate-700",
  "offline-mode": "bg-amber-100 text-amber-800",
  "belum-diketahui": "bg-slate-100 text-slate-500",
};

// Teks dan warna untuk setiap nilai kolom kunci (Modul 21).
const LENCANA_KUNCI: Record<StatusKunci, { teks: string; warna: string }> = {
  aktif: { teks: "kunci aktif", warna: "bg-teal-50 text-teal-800" },
  dicabut: { teks: "kunci dicabut", warna: "bg-red-600 text-white" }, // paling menonjol
  "tanpa-kunci": { teks: "lewat penghubung", warna: "bg-sky-50 text-sky-800" }, // Node 2: datanya diteruskan Node 1
  "belum-terdaftar": { teks: "belum terdaftar", warna: "bg-amber-100 text-amber-800" },
};

const BENTUK = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function LencanaStatus({ status }: { status: StatusPerangkat }) {
  return <span className={BENTUK + " " + WARNA_STATUS[status]}>{status}</span>;
}

export function LencanaKunci({ kunci }: { kunci: StatusKunci }) {
  const { teks, warna } = LENCANA_KUNCI[kunci];
  return <span className={BENTUK + " " + warna}>{teks}</span>;
}
```

- **Dua balok kecil serumah**, diekspor **dengan nama** (`export function …`), jadi impornya memakai kurung kurawal: `import { LencanaKunci, LencanaStatus } from "./Lencana";`. Ekspor `default` hanya satu per berkas; ekspor bernama boleh banyak. Titipan tunggal boleh langsung diberi label: `{ status }: { status: StatusPerangkat }`.
- **`WARNA_STATUS`** menyimpan kelas Tailwind utuh untuk keempat nilai `status` (Konsep 6), termasuk `belum-diketahui` (belum pernah ada pesan `status`). Menyambung dua deretan kelas utuh (`BENTUK + " " + WARNA_STATUS[status]`) aman; memotong nama kelas (`"bg-" + warna`) tidak.
- **`LENCANA_KUNCI`** memberi setiap nilai kolom `kunci` (Modul 21) tulisan dan warnanya sendiri:

| `kunci` | Lencana | Warna | Artinya (Modul 21) |
| :--- | :--- | :--- | :--- |
| `aktif` | `kunci aktif` | toska pucat | terdaftar, berkunci sendiri |
| `dicabut` | `kunci dicabut` | **merah pekat** | kuncinya dicabut; kirimannya diabaikan |
| `tanpa-kunci` | `lewat penghubung` | biru muda | Node 2, datanya diteruskan Node 1 lewat ESP-NOW |
| `belum-terdaftar` | `belum terdaftar` | kuning | tak pernah didaftarkan lewat `POST /devices`; kirimannya diabaikan |

`dicabut` sengaja satu-satunya lencana berlatar gelap: itulah kabar terpenting di daftar. Berkasnya terpisah karena `LencanaKunci` dipakai lagi di detail perangkat (Praktik 6).

**Langkah 2 — `DaftarPerangkat.tsx`.** Klik kanan folder **`frontend/src/components`** lagi → **New File…**, beri nama **`DaftarPerangkat.tsx`**, lalu ketik:

```tsx
// DaftarPerangkat.tsx - mengambil GET /devices, lalu menampilkannya sebagai kartu-kartu perangkat.
// Tiga keadaan selalu disiapkan: memuat, galat, dan kosong (pola yang dipakai setiap layar yang mengambil data).
import { useEffect, useState } from "react";
import { ambilPerangkat, GalatApi } from "../api";
import type { Perangkat } from "../types";
import { LencanaKunci, LencanaStatus } from "./Lencana";

type Props = {
  onSesiHabis: () => void; // dipanggil kalau backend menjawab 401 (belum login atau sesi habis)
};

export default function DaftarPerangkat({ onSesiHabis }: Props) {
  const [perangkat, setPerangkat] = useState<Perangkat[] | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);

  // Ambil data SESUDAH layar tampil. Di mode pengembangan, StrictMode menjalankan efek ini dua kali (normal).
  // [onSesiHabis] di akhir efek: efek ini memakai fungsi titipan App itu, jadi wajib ditulis (npm run lint
  // memperingatkan kalau terlupa). Selama daftar tampil, state App tidak berubah, jadi efek tidak diulang.
  useEffect(() => {
    let ignore = false; // menjadi true saat efek dibereskan: jawaban yang datang terlambat diabaikan
    ambilPerangkat()
      .then((daftar) => {
        if (!ignore) setPerangkat(daftar);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat perangkat.");
      });
    return () => {
      ignore = true; // cleanup: dijalankan React sebelum efek diulang atau saat komponen ini hilang dari layar
    };
  }, [onSesiHabis]);

  if (galat !== null) return <p className="rounded-lg bg-red-50 p-3 text-red-700">{galat}</p>;
  if (perangkat === null) return <p className="text-slate-500">Memuat perangkat…</p>;
  if (perangkat.length === 0) {
    return <p className="rounded-lg bg-white p-3 text-slate-600">Belum ada perangkat terdaftar (pendaftaran perangkat: Modul 21).</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {perangkat.map((p) => (
        // key = tanda pengenal tiap butir daftar; device_id pasti unik
        <li key={p.device_id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {/* nama dan lokasi diisi admin lewat API; JSX menampilkannya sebagai teks biasa, jadi kode HTML di dalamnya tidak dijalankan (aman dari XSS) */}
            <span className="font-semibold text-slate-800">{p.nama ?? p.device_id}</span>
            <span className="flex gap-1">
              {/* kunci dicabut atau belum terdaftar = backend mengabaikan kirimannya, jadi status lamanya
                  (bisa masih "online") menyesatkan dan tidak ditampilkan */}
              {p.kunci === "dicabut" || p.kunci === "belum-terdaftar" ? null : <LencanaStatus status={p.status} />}
              <LencanaKunci kunci={p.kunci} />
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {p.lokasi ?? "lokasi belum diisi"} · <span className="font-mono">{p.device_id}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
```

Efeknya adalah contoh di Konsep 8, lengkap dengan *cleanup* `ignore`. Selebihnya:

- **401 tidak menjadi kotak merah**: `return onSesiHabis();` melapor ke `App`. Pemeriksaannya berurutan: galat, memuat (`perangkat` masih `null`), kosong, baru isinya (Konsep 10).
- **`[onSesiHabis]`, bukan `[]`**, karena efek memakai fungsi titipan itu; kalau terhapus, `npm run lint` memperingatkannya (`exhaustive-deps`). Efeknya tetap tidak berulang, karena `sesiHabis` tidak berganti selama daftar tampil.
- **`key={p.device_id}`** adalah tanda pengenal unik tiap kartu (Konsep 5). **`??`** mengisi kolom yang `null`: tanpa nama berjudul `device_id`, tanpa lokasi bertulisan `lokasi belum diisi`.
- **Kunci dicabut atau belum terdaftar: tanpa lencana status.** `p.kunci === "dicabut" || p.kunci === "belum-terdaftar" ? null : <LencanaStatus status={p.status} />`. Backend mengabaikan kiriman keduanya, jadi `status` tersimpannya tak bisa dipercaya: status lama dari Modul 16–20 bisa masih `online`, dan perangkat yang akunnya dicabut diputus broker tanpa wasiat `offline` (Modul 21). Patokannya kolom `kunci`.
- **Teks dari API tetap teks**: JSX meloloskan `nama` dan `lokasi`, jadi HTML di dalamnya tidak dijalankan (Konsep 5). Jangan pernah menggantinya dengan `dangerouslySetInnerHTML`.
- **`grid-cols-2`** sengaja berkacamata laptop; di HP kartunya berdesakan sampai Praktik 7.

Simpan kedua berkas. Kotak galat 5.1 sudah hilang, tetapi halaman mungkin masih putih, dan **Console** mungkin menyimpan baris merah `does not provide an export named 'default'` (dari saat `DaftarPerangkat.tsx` masih kosong). **F5** di Langkah 3 membereskannya.

**Langkah 3 — coba.**

1. **Tekan F5** di `http://localhost:5173`. `Memuat…` tampil sekejap, lalu muncul **daftar perangkat** tanpa mengetik sandi, kalau gelang Praktik 4 (15 menit) masih berlaku. Kalau sudah habis, muncul **formulir *login* tanpa pesan** (*refresh* baru datang di Praktik 6): masuk dengan `viewer@rumah.test`; tombolnya sekejap berbunyi `Sedang masuk…`, lalu kepala halaman tampil dengan `Memuat perangkat…`.

**Hasilnya** (**contoh**; isinya bergantung pada perangkat yang kamu daftarkan di Modul 21): kepala halaman putih dengan `Rumah Pintar Mini` di kiri, `Tamu Rumah (viewer)` dan tombol **Keluar** di kanan; di bawahnya, judul `Daftar Perangkat` dan kartu putih, dua per baris, urut `device_id` (Node 2, `246f…`, sebelum Node 1, `a4cf…`). Gambar di bawah diambil dengan akun admin pada kode akhir modul, yang tombol **Keluar**-nya sudah dibesarkan di Praktik 7; daftar dan lencananya sama:

![Tangkapan layar asli layar Daftar Perangkat dashboard v0.1 di Microsoft Edge selebar laptop 1280 px, dengan lima baris dari GET /devices backend v1.0 Modul 21 yang sungguhan; judul: Daftar Perangkat dari GET /devices: lencana status dan lencana kunci. Kepala halaman: Rumah Pintar Mini di kiri; di kanan Admin Rumah (admin) dan tombol Keluar, ditandai nomor 7. Di bawahnya judul Daftar Perangkat dan lima kartu dalam dua kolom, urut device_id. Kartu 1, Node 2 kebun, lencana hijau online dan lencana biru muda lewat penghubung (nomor 3), lalu baris kecil kebun · 246f28b1c7d4 dengan device_id berhuruf monospasi (nomor 6). Kartu 2, Node 1 ruang tamu, lencana online (nomor 1) dan lencana kunci aktif (nomor 2), ruang tamu · a4cf12e5b7c0. Kartu 3, Perangkat uji (penyusup), hanya satu lencana merah pekat kunci dicabut (nomor 4), meja kerja · c0ba00000001. Kartu 4, Latihan ruang tamu, online dan kunci aktif, ruang tamu · f00d00000001. Kartu 5, Latihan teras, hanya lencana kuning belum terdaftar (nomor 5), teras · f00d00000002. Keterangan: 1 online adalah lencana status, kabar terakhir perangkat lewat MQTT yang disimpan backend; 2 kunci aktif adalah lencana kunci dari Modul 21, artinya terdaftar dan kuncinya berlaku; 3 lewat penghubung berarti tanpa-kunci, Node 2 tidak punya kunci dan datanya diteruskan Node 1; 4 kunci dicabut berwarna merah tanpa lencana status, karena kirimannya diabaikan backend dan status lamanya disembunyikan; 5 belum terdaftar juga tanpa lencana status, f00d00000002 tidak didaftarkan di Modul 21; 6 device_id berhuruf monospasi di belakang lokasi, urutan kartu sama dengan urutan device_id dari backend; 7 nama akun, peran, dan tombol Keluar, yang masih minimal dan disempurnakan di Modul 24.](aset/dashboard-daftar-perangkat.png)

| Kartu | Baris kecil di bawah nama | Lencana |
| :--- | :--- | :--- |
| `Node 2 kebun` | `kebun · 246f28b1c7d4` | `online` (hijau) dan `lewat penghubung` |
| `Node 1 ruang tamu` | `ruang tamu · a4cf12e5b7c0` | `online` (hijau) dan `kunci aktif` |
| `Perangkat uji (penyusup)` | `meja kerja · c0ba00000001` | hanya `kunci dicabut` (merah) |
| `Latihan ruang tamu` | `ruang tamu · f00d00000001` | `online` (hijau) dan `kunci aktif` |
| `Latihan teras` | `teras · f00d00000002` | hanya `belum terdaftar` (kuning) |

`Perangkat uji (penyusup)` (Modul 21 Praktik 6, kuncinya kamu cabut di Praktik 7.5) hanya membawa lencana merah: janji Modul 21 ditepati. `Latihan teras` sengaja tidak didaftarkan. **Daftarmu bisa berbeda:** di jalur laptop, Node 1 dan Node 2 hanya ada kalau dulu kamu daftarkan, dan baris lama seperti `beef00000001` (uji beban Modul 18) tampil dengan `belum terdaftar`.

2. **Tekan F5 sekali lagi.** **Hasilnya:** `Memuat…` sekejap, kepala halaman dengan `Memuat perangkat…`, lalu daftar yang sama, tanpa formulir. Kelemahan Praktik 4 beres. Mau mengintip? Di tab **Components** React DevTools, klik `DaftarPerangkat`: di panel kanan, bagian **hooks**, baris `State` pertama berisi *array* perangkat dari backend.

3. **Backend mati saat dashboard dibuka.** Di terminal backend, tekan **Ctrl + C**, lalu tekan **F5** di browser.

**Hasilnya:** formulir *login* dengan satu kotak merah muda, **sebelum** kamu mengetik apa pun, berisi pesan kode 0 dari Praktik 4.5: `Tidak bisa menghubungi server di http://localhost:8080. Mungkin backend belum menyala, …`. Tab **Console** mencatat dua baris merah `GET http://localhost:8080/auth/me net::ERR_CONNECTION_REFUSED`. Inilah `galatAwal`: galatnya bukan 401, jadi masalahnya di backend, bukan sandimu. Menekan **Masuk** sekarang tidak menambah kotak kedua.

Nyalakan lagi backend (`npm run dev`, tunggu `Server listening at http://127.0.0.1:8080`), lalu tekan **F5**: daftar perangkat kembali, selama gelangmu belum habis.

4. **Dua keadaan yang belum terlihat:** daftar kosong (hanya kalau tabel `devices` kosong) dan kotak galat daftar (backend bermasalah saat daftar diambil; di Praktik 6, matikan backend sebelum kembali dari detail). Keduanya ada di gambar Konsep 10.

#### 5.3 Dua `GET /devices` di tab Network (8 menit)

Buktikan janji Konsep 8: di mode pengembangan, setiap efek berjalan dua kali.

1. Buka DevTools (**F12**), tab **Network**, lalu pilih **Fetch/XHR** di bilah atasnya (hanya menyaring tampilan menjadi permintaan `fetch` dashboard). Kosongkan dengan **Clear network log** (Praktik 4.4).
2. Tekan **F5**.

**Hasilnya:** empat baris berstatus `200` dengan Type `fetch`: dua baris `me`, lalu dua baris `devices`. Kalau formulir *login* yang tampil (kedua `me` berstatus `401`), gelangmu habis; masuk lagi, dan dua `devices` muncul sesudah `login`.

Dua `me` dari efek `App`, dua `devices` dari efek `DaftarPerangkat`: `StrictMode` memasang, mencopot, lalu memasang lagi **setiap** komponen saat pertama kali tampil. `devices` baru berangkat sesudah `me` dijawab, karena `DaftarPerangkat` baru digambar setelah `App` tahu siapa kamu.

Klik salah satu baris `devices`:

- **Headers**: bagian **Response headers** memuat `Access-Control-Allow-Origin` `http://localhost:5173` dan `Access-Control-Allow-Credentials` `true`, izin CORS yang sama dengan jawaban *login* di Praktik 4.4.
- **Cookies**: hanya `akses` yang terkirim. `sesi` tidak ikut karena `Path=/auth`-nya tidak mencakup `/devices` (Konsep 9); centang **Show filtered-out request cookies** untuk melihatnya sebagai baris kuning yang jalurnya tidak cocok.
- **Response** (atau **Preview**): *array* JSON yang sama dengan **`daftar perangkat`** di Bruno.

Terminal backend juga mencatat semuanya dua kali. **Hasilnya** (**contoh**: log backend penulis untuk F5 yang sama):

```text
[23:20:42] INFO: GET /auth/me -> 200 (3 ms)
[23:20:42] INFO: GET /auth/me -> 200 (3 ms)
[23:20:42] INFO: GET /devices -> 200 (3 ms)
[23:20:42] INFO: GET /devices -> 200 (3 ms)
```

Tidak ada baris `OPTIONS`: `GET` tanpa kepala tambahan tidak memicu *preflight* (Konsep 9).

> [!NOTE]
> **Dua permintaan itu normal, dan hanya terjadi di dapur.** Dokumentasi React menyebut dua `fetch` di tab **Network** wajar di mode pengembangan. Di log backend penulis, `GET /auth/me` dan `GET /devices` tercatat dua kali di `npm run dev`, tetapi sekali di hasil *build* (`npm run preview`); kamu membuktikannya di Praktik 8. Jangan menghapus `<StrictMode>` demi tab **Network** yang rapi; alasannya di [🔬 Bedah Teknis](#-bedah-teknis-opsional).

#### 5.4 Tombol Keluar (8 menit)

Kodenya sudah ada di `App.tsx` yang kamu tempel di 5.1:

```tsx
  // Tombol Keluar minimal (disempurnakan di Modul 24): hapus sesi di backend, lalu kembali ke formulir.
  async function logout() {
    try {
      await keluar();
    } catch {
      // backend tidak menjawab: layar tetap kembali ke formulir login
    }
    setPengguna(null);
  }
```

`keluar()` mengetuk `POST /auth/logout`: backend menghapus sesimu dan menyuruh browser membuang kedua *cookie*. Kalau backend tidak menjawab, `GalatApi` berkode 0 ditangkap `catch` yang hanya berisi komentar (tanpa galat tak tertangani di **Console**), lalu `setPengguna(null)` tetap menampilkan formulir.

1. Dengan tab **Network** (**Fetch/XHR**) terbuka, klik **Keluar**. **Hasilnya:** formulir *login* kosong, tanpa kotak pesan, dan satu baris baru, `logout`, berstatus `200`. Log backend di bawah tidak memuat `OPTIONS`: `POST` tanpa isi dan tanpa `Content-Type` tidak memicu *preflight* (Konsep 9).
2. Klik baris `logout`, lalu periksa:
   - **Response**: `{"pesan":"sudah logout"}`.
   - **Headers**: **Response headers** memuat dua `Set-Cookie` kosong dengan `Max-Age=0` ("buang sekarang") dan `Expires` yang sudah lewat. **Hasilnya:**

     ```text
     akses=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
     sesi=; Max-Age=0; Path=/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
     ```

   - **Cookies**: kali ini `akses` **dan** `sesi` terkirim, karena `/auth/logout` ada di bawah `Path=/auth`; backend butuh kartu terusan itu untuk tahu sesi mana yang diakhiri.
3. Buka panel **Application** → **Cookies** → `http://localhost:5173`. **Hasilnya:** tabelnya kosong.
4. Tekan **F5**. **Hasilnya:** formulir *login* tanpa pesan. Kedua baris `me` berstatus `401`, dan tab **Console** mencatat dua baris merah `GET http://localhost:8080/auth/me 401 (Unauthorized)`: catatan bawaan browser, bukan kerusakan (Praktik 4.5).

Log backend mencatat *logout*-mu. **Hasilnya** (**contoh**; `sesi 13` adalah nomor sesi di database):

```text
[23:20:51] INFO: logout: sesi 13
[23:20:51] INFO: POST /auth/logout -> 200 (4 ms)
```

> [!NOTE]
> **Keluar versi minimal, disempurnakan di Modul 24.** Tombol ini hanya bisa membersihkan *cookie* kalau backend menjawab. Kalau backend mati saat kamu mengklik **Keluar**, layar tetap kembali ke formulir (**Console** hanya mencatat satu baris merah yang memuat `net::ERR_CONNECTION_REFUSED`), tetapi kedua *cookie* masih tersimpan, jadi begitu backend menyala lagi, **F5** bisa langsung membawamu kembali ke daftar selama gelangnya belum habis. Rute yang dijaga dan *logout* yang lebih lengkap datang di Modul 24.

#### 5.5 Periksa dan simpan ke cabang (9 menit)

Di terminal kosong (folder `frontend`), jalankan pemeriksa kode:

```text
npm run lint
```

**Hasilnya:** tanpa peringatan maupun galat (keluarannya dibahas di Praktik 8.1). Peringatan `exhaustive-deps` berarti efek memakai nilai yang lupa ditulis di daftar ujungnya.

Lalu jalankan `git status`: ada dua berkas baru di bagian `Untracked files` (`src/components/DaftarPerangkat.tsx` dan `src/components/Lencana.tsx`) dan tiga berkas yang berubah (`src/App.tsx`, `src/api.ts`, dan `src/components/Login.tsx`). Simpan kelimanya:

```text
git add src/api.ts src/App.tsx src/components/Login.tsx src/components/Lencana.tsx src/components/DaftarPerangkat.tsx
git commit -m "Siapa saya, daftar perangkat, dan tombol Keluar (Modul 22 Praktik 5)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-5/frontend/`](kode/tahap/praktik-5/frontend/); cocokkan berkasmu dengannya kalau ada yang tidak berjalan. Biarkan semuanya menyala kalau kamu langsung lanjut ke Praktik 6.

> ⬆️ **Selesai Praktik 5?** Dashboard-mu kini ingat siapa kamu, menampilkan semua perangkat beserta lencananya, dan punya tombol **Keluar**. Kartunya belum bisa diketuk. Lanjut ke [Praktik 6 — Detail perangkat: bacaan terbaru semua sensor](#praktik-6--detail-perangkat-bacaan-terbaru-semua-sensor-60-menit), tempat setiap kartu membuka bacaan terbaru perangkatnya.

### Praktik 6 — Detail perangkat: bacaan terbaru semua sensor (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal Praktik 4–5 (backend v1.0 di folder `backend`, Vite di folder `frontend`, satu terminal kosong di `frontend` untuk Git; jalur laptop: broker di `edge` dan simulator di `alat`), **Docker Desktop** (kontainer `rumahpintar-db` menyala), **browser Chrome atau Edge** dengan DevTools (tab **Network** dan **Console**, panel **Application**) beserta React DevTools, dan **Bruno** untuk mencocokkan angka. Konsep yang dipakai: Konsep 8, 9, dan 10.
>
> ⭐ **Wajib** — langkah 6.4: semua sensor satu perangkat tampil dari API, dan angkanya sama persis dengan jawaban `GET /devices/:id/latest` di Bruno.

Praktik ini menambah layar **detail perangkat**: ketuk satu perangkat, dashboard meminta `GET /devices/:id/latest`, lalu memasang satu `KartuSensor` (cetakan Praktik 3, tanpa diubah) untuk setiap bacaan dari API. Kamu juga menyiapkan keadaan "belum ada bacaan" (404) dan menepati janji Modul 20: ***refresh* sekali** di `api.ts`, supaya gelang yang habis setiap 15 menit tidak melemparmu ke formulir *login*. Inilah separuh pertama syarat lulus: **setelah *login*, dashboard menampilkan bacaan terbaru semua sensor dari API** (rapi di HP menyusul di Praktik 7).

Pastikan backend, sumber data, dan Vite menyala seperti di 4.1, buka `http://localhost:5173`, lalu masuk dengan akun `viewer` kalau diminta.

#### 6.1 Layar detail: `src/components/DetailPerangkat.tsx`, lalu sambungkan ke daftar (20 menit)

**Langkah 1 — Loket baru di `api.ts`.** Buka `src/api.ts`. Tambahkan `BacaanTerbaru` di baris `import type` paling atas:

```ts
import type { BacaanTerbaru, Pengguna, Perangkat } from "./types";
```

Lalu tambahkan fungsi ini di paling bawah berkas, di bawah `ambilPerangkat()`:

```ts
// GET /devices/:id/latest: bacaan terbaru satu perangkat, dari memori backend
// (404 kalau perangkat itu belum mengirim bacaan sejak backend dinyalakan)
export function ambilTerbaru(deviceId: string): Promise<BacaanTerbaru> {
  return minta<BacaanTerbaru>("/devices/" + deviceId + "/latest");
}
```

Jawabannya, `BacaanTerbaru` (Praktik 3), hanya memuat `device_id`, `jenis`, `status`, dan `telemetry`, **tanpa** nama, lokasi, atau `kunci`; ketiganya hanya ada di jawaban `GET /devices`.

**Langkah 2 — Komponen baru.** Klik kanan folder **`frontend/src/components`** → **New File…**, beri nama **`DetailPerangkat.tsx`**, lalu ketik kode di bawah (atau buka [`kode/tahap/praktik-6/frontend/src/components/DetailPerangkat.tsx`](kode/tahap/praktik-6/frontend/src/components/DetailPerangkat.tsx) di GitHub, klik **Copy raw file**, lalu tempel):

```tsx
// DetailPerangkat.tsx - bacaan terbaru SEMUA sensor satu perangkat (GET /devices/:id/latest), satu KartuSensor per kolom.
// Kartu yang muncul mengikuti jenis perangkat (Node 1 atau Node 2) dan kolom yang benar-benar dikirim (Lampiran A).
import { useEffect, useState } from "react";
import { ambilTerbaru, GalatApi } from "../api";
import type { BacaanTerbaru, Perangkat, TelemetryNode1, TelemetryNode2 } from "../types";
import KartuSensor from "./KartuSensor";
import { LencanaKunci } from "./Lencana";

// isi satu kartu: bentuknya sama dengan props KartuSensor
type Kartu = { label: string; nilai: number | string | null; satuan?: string; warna?: string };

function kartuNode1(t: TelemetryNode1): Kartu[] {
  const kartu: Kartu[] = [
    { label: "Suhu", nilai: t.suhu, satuan: "°C", warna: "text-teal-600" },
    { label: "Kelembapan", nilai: t.kelembapan, satuan: "%" },
    { label: "Cahaya", nilai: t.cahaya, satuan: "/4095" },
    { label: "Kelembapan tanah", nilai: t.tanah, satuan: "%" },
    { label: "Gerakan", nilai: t.gerak ? "Ada" : "Tidak ada", warna: t.gerak ? "text-amber-600" : undefined },
    { label: "Air tandon", nilai: t.level_air, satuan: "%" },
  ];
  // Sensor tanah RS-485 (Modul 15) hanya ada kalau dipasang; ketiga kolomnya selalu datang bersama (aturan 11).
  if (t.tanah_rs485 !== undefined) {
    kartu.push(
      { label: "Tanah RS-485", nilai: t.tanah_rs485, satuan: "%" },
      { label: "Suhu tanah", nilai: t.suhu_tanah ?? null, satuan: "°C" },
      { label: "EC tanah", nilai: t.ec ?? null, satuan: "µS/cm" },
    );
  }
  // Keadaan aktuator hanya DITAMPILKAN; tombol kendalinya baru dibuat di Modul 24.
  if (t.state !== undefined) {
    kartu.push(
      { label: "Lampu", nilai: t.state.lampu ? "Nyala" : "Mati", warna: t.state.lampu ? "text-amber-600" : undefined },
      { label: "Kipas", nilai: t.state.kipas ? "Nyala" : "Mati", warna: t.state.kipas ? "text-teal-600" : undefined },
    );
  }
  return kartu;
}

function kartuNode2(t: TelemetryNode2): Kartu[] {
  const kartu: Kartu[] = [
    { label: "Suhu", nilai: t.suhu, satuan: "°C", warna: "text-teal-600" },
    { label: "Kelembapan", nilai: t.kelembapan, satuan: "%" },
    { label: "Tekanan udara", nilai: t.tekanan, satuan: "hPa" },
    { label: "Suhu tanah", nilai: t.suhu_tanah, satuan: "°C" },
    { label: "Kelembapan tanah", nilai: t.tanah, satuan: "%" },
  ];
  // Pengukur baterai itu pilihan: kalau tidak dipasang, kolomnya tidak ada sama sekali.
  if (t.baterai !== undefined) {
    kartu.push({ label: "Baterai", nilai: t.baterai, satuan: "V" });
  }
  return kartu;
}

// ts dari perangkat selalu UTC (huruf Z di ujungnya). Tampilkan sebagai jam WIB, apa pun zona waktu laptopnya.
function jamWib(ts: string): string {
  return new Date(ts).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
}

type Props = {
  perangkat: Perangkat; // dikirim dari daftar: nama, lokasi, dan kunci sudah ada, tidak perlu diminta lagi
  onKembali: () => void;
  onSesiHabis: () => void; // dipanggil kalau backend menjawab 401 (sesudah refresh pun gagal)
};

export default function DetailPerangkat({ perangkat, onKembali, onSesiHabis }: Props) {
  const [bacaan, setBacaan] = useState<BacaanTerbaru | null>(null); // null = masih memuat
  const [galat, setGalat] = useState<string | null>(null);
  const [belumAda, setBelumAda] = useState(false); // 404: belum ada bacaan sejak backend dinyalakan
  const id = perangkat.device_id;

  // Isi awal state di atas sudah "bersih" untuk satu perangkat. Untuk perangkat lain, App memasang key={device_id},
  // jadi React membuat DetailPerangkat baru dengan state segar; efek ini tidak perlu mengosongkan state sendiri.
  // Daftar dependensi di akhir efek = semua nilai dari luar yang dipakai efek (npm run lint memperingatkan yang terlupa).
  useEffect(() => {
    let ignore = false;
    ambilTerbaru(id)
      .then((b) => {
        if (!ignore) setBacaan(b);
      })
      .catch((err) => {
        if (ignore) return;
        if (err instanceof GalatApi && err.kode === 401) return onSesiHabis();
        if (err instanceof GalatApi && err.kode === 404) return setBelumAda(true); // wajar, bukan kerusakan
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat bacaan.");
      });
    return () => {
      ignore = true;
    };
  }, [id, onSesiHabis]);

  // Pilih SATU isi untuk ditampilkan di bawah judul: memuat, galat, belum ada bacaan, atau kartu-kartu.
  let isi = <p className="mt-4 text-slate-500">Memuat bacaan…</p>;
  if (galat !== null) {
    isi = <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{galat}</p>;
  } else if (belumAda) {
    // 404 = belum ada bacaan di memori backend. Akankah bacaan datang? Itu bergantung kolom kunci (Modul 21):
    // kiriman perangkat yang belum terdaftar atau kuncinya dicabut DIABAIKAN backend, jadi menunggu pun percuma.
    let pesan = "Belum ada bacaan dari perangkat ini sejak backend dinyalakan. Tunggu kiriman berikutnya, lalu buka lagi.";
    if (perangkat.kunci === "belum-terdaftar") {
      pesan = "Perangkat ini belum terdaftar, jadi kirimannya diabaikan backend (daftarkan dulu seperti di Modul 21).";
    } else if (perangkat.kunci === "dicabut") {
      pesan = "Tidak ada bacaan tersimpan dari perangkat ini, dan bacaan baru tidak akan datang selama kuncinya dicabut.";
    }
    isi = <p className="mt-4 rounded-lg bg-white p-3 text-slate-600">{pesan}</p>;
  } else if (bacaan !== null) {
    // jenis memberi tahu bentuk telemetry-nya: node2 -> kolom Node 2, selain itu kolom Node 1
    const kartu =
      bacaan.jenis === "node2"
        ? kartuNode2(bacaan.telemetry as TelemetryNode2)
        : kartuNode1(bacaan.telemetry as TelemetryNode1);
    // Kunci dicabut atau perangkat belum terdaftar: backend mengabaikan kirimannya (Modul 21), jadi status yang
    // tersimpan (bisa masih "online") menyesatkan. Statusnya tidak ditampilkan, diganti "kiriman diabaikan".
    const kirimanDiabaikan = perangkat.kunci === "dicabut" || perangkat.kunci === "belum-terdaftar";
    isi = (
      <>
        <p className="mt-4 text-sm text-slate-500">
          {bacaan.jenis} · {kirimanDiabaikan ? "kiriman diabaikan" : bacaan.status} · diperbarui pukul{" "}
          {jamWib(bacaan.telemetry.ts)}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {kartu.map((k) => (
            <KartuSensor key={k.label} label={k.label} nilai={k.nilai} satuan={k.satuan} warna={k.warna} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <button type="button" onClick={onKembali} className="text-sm font-medium text-teal-700 hover:underline">
        ← Kembali ke daftar
      </button>
      <div className="mt-2 flex items-center gap-2">
        <h2 className="text-xl font-semibold text-slate-800">{perangkat.nama ?? id}</h2>
        <LencanaKunci kunci={perangkat.kunci} />
      </div>
      <p className="text-sm text-slate-500">
        {perangkat.lokasi ?? "lokasi belum diisi"} · <span className="font-mono text-xs">{id}</span>
      </p>
      {perangkat.kunci === "dicabut" ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Kunci perangkat ini sudah dicabut: backend mengabaikan kirimannya. Bacaan di bawah (kalau ada) adalah kiriman
          terakhir sebelum dicabut.
        </p>
      ) : null}
      {isi}
    </div>
  );
}
```

- **`kartuNode1()` dan `kartuNode2()`** (fungsi biasa, bukan komponen) mengubah `telemetry` menjadi *array* `Kartu`, berbentuk sama dengan *props* `KartuSensor`; `kartu.push(…)` menambah kartu hanya kalau kolomnya ada. **`t.tanah_rs485 !== undefined`** membedakan kolom yang **tidak ada** (sensor tanah RS-485 Modul 15 tidak dipasang: ketiga kartunya tidak dibuat) dari kolom berisi **`null`** (sensornya gagal dibaca, aturan 7: kartunya tetap ada dan menampilkan "—"). Ketiga kolom RS-485 selalu datang bersama (aturan 11). `?? null` (Pemanasan Langkah 3) menukar `undefined` menjadi `null`, yang diterima `nilai`.
- **Gerakan, Lampu, dan Kipas** diubah dari `true`/`false` menjadi teks lewat `? :`. Lampu dan Kipas hanya **ditampilkan**; tombolnya baru di Modul 24 (perintah ke perangkat butuh akun `admin` dan pengaman tambahan). Kartu pompa dan tirai menjadi [🧩 Tingkat 1](#-tantangan-mandiri).
- **`jamWib()`**: `ts` dari perangkat selalu UTC (aturan 1; huruf `Z` di ujungnya), misalnya `2026-10-23T12:21:59Z`. Pilihan `timeZone: "Asia/Jakarta"` di `toLocaleTimeString("id-ID", …)` menuliskannya sebagai jam WIB bertitik (UTC + 7 jam), `19.21.59`, bukan jam setempat laptop. Janji Modul 10, 16, dan 17 (jam setempat urusan dashboard) ditepati di sini.
- **`type Props`**: `DetailPerangkat` menerima **objek `Perangkat` utuh** dari daftar, karena nama, lokasi, dan `kunci` sudah dipegang daftar. Kejadian (`onKembali`, `onSesiHabis`) naik ke `App` (Konsep 6).
- **Efeknya** memakai pola `DaftarPerangkat` (`ignore`, 401 ke `onSesiHabis`) dengan satu cabang baru: **404 menyalakan papan `belumAda`**, bukan `galat` (Konsep 10). `[id, onSesiHabis]` memuat semua nilai dari luar yang dipakai efek; yang terlupa diberi peringatan oleh `npm run lint` (Praktik 8). Tidak ada `setBacaan(null)` di awal efek: perangkat lain berarti `DetailPerangkat` **baru** lewat `key` di `App` (Konsep 8). Versi awal yang mengosongkan *state* di dalam efek diberi peringatan `react(set-state-in-effect)` oleh `npm run lint` di lab penulis.
- **`let isi`** dimulai dengan `Memuat bacaan…`, lalu diganti galat, catatan belum ada bacaan, atau kartu; galat diperiksa paling awal (Konsep 10). **Pesan 404-nya bergantung pada `kunci`**: backend Modul 21 mengabaikan kiriman perangkat yang belum terdaftar atau dicabut, jadi menyuruh menunggu bacaannya sama dengan menyuruh menunggu selamanya (ketiga pesannya di 6.3). `bacaan.jenis === "node2"` memilih penyusun kartu; `as TelemetryNode2` berarti "percayalah, bentuknya Node 2", seperti `as T` di `minta()`.
- **Baris kecil di atas kartu**, misalnya `node1 · online · diperbarui pukul 19.21.59 WIB`, memuat jam **perangkat membaca sensornya**. `{" "}` adalah spasi yang ditulis terang-terangan, karena JSX membuang spasi di ujung baris. **`kirimanDiabaikan`**: untuk kunci `dicabut` **atau** `belum-terdaftar`, status tersimpan (bisa masih `online` dari Modul 16–20) diganti `kiriman diabaikan`, seperti lencana `status` yang disembunyikan di daftar (Praktik 5).
- **`kartu.map`** memasang `KartuSensor` dengan `key={k.label}` (label tidak pernah kembar). `grid-cols-3` sempit di HP; dibereskan di Praktik 7.
- **Judulnya** `perangkat.nama ?? id` dengan `LencanaKunci` (balok yang sama dengan di daftar), lalu lokasi dan `device_id` (`font-mono`) kecil di bawahnya. Teks dari API di dalam `{ }` diloloskan JSX (Konsep 5). Kunci `dicabut` menambah kotak merah (6.3).

**Langkah 3 — Kartu daftar menjadi tombol.** Buka [`kode/tahap/praktik-6/frontend/src/components/DaftarPerangkat.tsx`](kode/tahap/praktik-6/frontend/src/components/DaftarPerangkat.tsx) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/components/DaftarPerangkat.tsx`-mu. Yang berubah: titipan baru `onPilih: (perangkat: Perangkat) => void;` di `Props` (juga di parameter fungsinya), dan isi setiap `<li>` kini dibungkus tombol:

```tsx
          <button
            type="button"
            onClick={() => onPilih(p)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-400 hover:shadow-md"
          >
```

- **`onClick={() => onPilih(p)}`** baru memanggil `onPilih` saat kartu diklik; `onClick={onPilih(p)}` justru memanggilnya saat daftar digambar.
- **`<button type="button">`** bisa diketuk, diklik, atau dipilih dengan **Tab** lalu **Enter**, tanpa mengirim formulir. Isinya kini `span`, bukan `div` dan `p`, karena di dalam `<button>` HTML hanya mengizinkan elemen sebaris; kelas `block` menurunkan lokasi ke baris kedua. `cursor-pointer` ditulis sendiri, karena Tailwind v4 tidak lagi memberi kursor telunjuk pada `button` secara otomatis.

**Langkah 4 — `App` berpindah layar.** Dengan cara yang sama, ganti seluruh isi `src/App.tsx` dengan [`kode/tahap/praktik-6/frontend/src/App.tsx`](kode/tahap/praktik-6/frontend/src/App.tsx). Yang baru: impor `DetailPerangkat`, `Perangkat` di `import type`, `type Tampilan = { nama: "daftar" } | { nama: "detail"; perangkat: Perangkat };`, papan tulis ketiga `tampilan`, dan pilihan layar di dalam `<main>`:

```tsx
          <DetailPerangkat
            key={tampilan.perangkat.device_id}
            perangkat={tampilan.perangkat}
            onKembali={() => setTampilan({ nama: "daftar" })}
            onSesiHabis={sesiHabis}
          />
```

- **`type Tampilan`**: hanya pilihan `"detail"` yang membawa perangkat; sesudah `tampilan.nama === "daftar" ? … : …`, TypeScript tahu `tampilan.perangkat` ada di cabang kedua.
- **`onPilih={(perangkat) => setTampilan({ nama: "detail", perangkat })}`** membuka detail; **← Kembali ke daftar** dan `sudahMasuk()` mengembalikan `{ nama: "daftar" }`. Alamatnya tetap `http://localhost:5173`; rute sungguhan seperti `/perangkat/a4cf12e5b7c0` datang bersama React Router di Modul 24.
- **`key={tampilan.perangkat.device_id}`** (Konsep 8): perangkat lain berarti komponen baru dengan papan tulis bersih. Supaya jujur: alur detail → daftar → detail memang selalu membuat detail baru; `key` berjaga untuk tombol yang kelak berpindah langsung antarperangkat.

Simpan semua berkas (**Ctrl + S**).

**Hasilnya:** kursor menjadi telunjuk dan bingkai kartu berwarna toska saat disorot. Klik **Node 1 ruang tamu**: sesaat tampil `Memuat bacaan…`, lalu tombol `← Kembali ke daftar`, judul `Node 1 ruang tamu` dengan lencana `kunci aktif`, baris `ruang tamu · a4cf12e5b7c0`, baris `node1 · online · diperbarui pukul 23.24.28 WIB` (jamnya pasti berbeda), dan sebelas kartu (delapan tanpa RS-485) dalam tiga kolom. Jalur laptop: **Latihan ruang tamu** menampilkan `ruang tamu · f00d00000001` dan delapan kartu.

Di tab **Network**, setiap detail dibuka muncul **dua** baris `latest` berstatus `200` (ulah `StrictMode`, Konsep 8) tanpa *preflight*: `GET` tanpa kepala tambahan adalah permintaan sederhana (Konsep 9). Sesudah **← Kembali ke daftar**, dua baris `devices` muncul lagi: daftar yang baru mengambil datanya dari awal.

> [!NOTE]
> **Tiba-tiba kembali ke formulir *login* dengan kotak `Sesi sudah habis. Silakan masuk lagi.`?** Gelangmu sudah lewat 15 menit, dan `api.ts` belum bisa me-*refresh*. Masuk lagi saja; langkah 6.5 membereskannya.

#### 6.2 Node 1 dan Node 2: sensor berbeda, kartu berbeda (8 menit)

`DetailPerangkat` menyusun kartu dari kolom yang **benar-benar datang** (Lampiran A). Buka detail setiap perangkat yang mengirim data, satu per satu:

| Perangkat | Kartu yang tampil |
| :--- | :--- |
| **Node 1** (jalur perangkat) | `Suhu`, `Kelembapan`, `Cahaya`, `Kelembapan tanah`, `Gerakan`, `Air tandon`; lalu `Tanah RS-485`, `Suhu tanah`, dan `EC tanah` kalau sensor RS-485 dari Modul 15 terpasang; lalu `Lampu` dan `Kipas` |
| **Node 2** (jalur perangkat) | `Suhu`, `Kelembapan`, `Tekanan udara`, `Suhu tanah`, `Kelembapan tanah`; lalu `Baterai` kalau pengukur baterai terpasang |
| **Latihan ruang tamu**, `f00d00000001` (jalur laptop) | enam bacaan Node 1, lalu `Lampu` dan `Kipas`. Simulator tidak meniru sensor RS-485, jadi tiga kartunya tidak muncul. |

**Hasilnya (contoh):** Node 1 dengan sensor RS-485 menampilkan sebelas kartu. Node 2 menampilkan enam kartu, lencana `lewat penghubung` di judulnya (datanya diteruskan Node 1, Modul 21), dan baris kecil berawalan `node2`, misalnya `node2 · online · diperbarui pukul 23.24.28 WIB`. `f00d00000001` menampilkan delapan kartu.

Perhatikan dua hal:

- **Kartu yang tidak ada berbeda dengan kartu "—".** Node 1 tanpa sensor RS-485 hanya punya delapan kartu, karena ketiga kolomnya tidak dikirim. Kartu "—" abu-abu tanpa satuan berarti kolomnya dikirim berisi `null`. `tanah` Node 2 boleh `null` (kontrak 1.1), jadi `Kelembapan tanah` Node 2 bisa menampilkan "—".
- **Angkanya tidak bergerak sendiri.** Bacaan diambil **sekali**, saat detail tampil (Konsep 8); untuk angka baru, kembali ke daftar lalu buka lagi. Angka yang bergerak sendiri datang di Modul 23.

**Intip `key`-nya di React DevTools.** Di tab **Components**, klik `DetailPerangkat`: di sebelah namanya tertulis `key="…"` berisi `device_id`-nya, misalnya `key="a4cf12e5b7c0"`. Di panel kanan, bagian **props** memuat `perangkat`, objek utuh dari daftar, dan bagian **hooks** memuat tiga baris `State` bernomor 1 sampai 3 (`bacaan`, `galat`, `belumAda` menurut urutan `useState`, tanpa nama variabelnya), lalu `Effect` dari `useEffect`.

#### 6.3 Belum ada bacaan (404): catatan netral, bukan galat (6 menit)

Backend menyimpan bacaan terbaru di **memori**, bukan di database (Konsep 10). Coba akibatnya.

> [!TIP]
> **Jalur laptop: tidak perlu berburu detik.** Hentikan simulator dengan **Ctrl + C** sebelum langkah 1, supaya memori backend tidak terisi. Nyalakan lagi (perintah 4.1) sebelum langkah 3.

1. Di terminal backend, tekan **Ctrl + C**, lalu langsung jalankan lagi `npm run dev` (atau **↑** lalu **Enter**). Tunggu log `Server listening at http://127.0.0.1:8080`. Jalur perangkat: biarkan Node 1 dan Node 2 menyala.
2. **Segera** buka detail Node 1 (jalur laptop: **Latihan ruang tamu**). Di jalur perangkat, waktumu hanya beberapa detik; kalau kartunya telanjur tampil, ulangi dari langkah 1.

**Hasilnya:** tidak ada kotak merah. Di bawah judul berlencana `kunci aktif` tampil catatan berlatar putih bertulisan abu-abu: `Belum ada bacaan dari perangkat ini sejak backend dinyalakan. Tunggu kiriman berikutnya, lalu buka lagi.` Di tab **Network**, dua baris `latest` berstatus `404`; tab **Response**-nya berisi `{"pesan":"belum ada telemetry dari a4cf12e5b7c0"}`. Tab **Console** mencatat dua baris merah `GET http://localhost:8080/devices/a4cf12e5b7c0/latest 404 (Not Found)` (jalur laptop: `f00d00000001`). Seperti baris 401 di Praktik 4, itu catatan bawaan browser, bukan tanda kodemu rusak.

3. Tunggu sekitar sepuluh detik, klik **← Kembali ke daftar**, lalu buka lagi perangkat yang sama. Kali ini kartunya tampil, karena kiriman pertama sesudah backend menyala sudah mengisi memorinya.

**Pesan untuk perangkat yang tidak akan pernah mengirim.** Sesudah Modul 21, daftarmu juga memuat **Latihan teras** (`f00d00000002`, belum terdaftar) dan **Perangkat uji (penyusup)** (`c0ba00000001`, kuncinya kamu cabut di Modul 21 Praktik 7). Buka keduanya.

**Hasilnya:**

- **Latihan teras**: lencana kuning `belum terdaftar`, lalu catatan putih `Perangkat ini belum terdaftar, jadi kirimannya diabaikan backend (daftarkan dulu seperti di Modul 21).`
- **Perangkat uji (penyusup)**: lencana merah `kunci dicabut`, lalu **kotak merah** `Kunci perangkat ini sudah dicabut: backend mengabaikan kirimannya. Bacaan di bawah (kalau ada) adalah kiriman terakhir sebelum dicabut.`, lalu catatan putih `Tidak ada bacaan tersimpan dari perangkat ini, dan bacaan baru tidak akan datang selama kuncinya dicabut.`

Kotak merah itu selalu muncul untuk kunci `dicabut`: bacaan lama perangkat yang dicabut tetap tersimpan di memori backend sampai backend dinyalakan ulang, dan kalau masih ada, kartunya tampil di bawah kotak merah dengan `kiriman diabaikan` di baris kecilnya (tidak terekam di lab penulis; dibaca dari kode). Ketiga pesan berasal dari 404 yang sama; pembedanya hanya kolom `kunci` yang dititipkan daftar sejak 6.1.

#### 6.4 ⭐ Semua sensor dari API, cocokkan dengan Bruno (10 menit)

Dashboard yang rapi belum tentu benar: kartu bisa tertukar kolomnya (misalnya angka `tanah` di kartu `Air tandon`) dan tetap tampak meyakinkan. Karena itu, bandingkan setiap kartu dengan sumber yang kamu percaya sejak Modul 16: jawaban `GET /devices/:id/latest` di Bruno.

1. Di Bruno, buka koleksi `backend/bruno` dan pilih *environment* **`lokal`**. Kirim **`login viewer`** dulu: gelang Bruno terpisah dari gelang browser dan tidak di-*refresh* sendiri.
2. Buka **`bacaan terbaru Node 1`**.
   - **Jalur perangkat:** klik **Send** apa adanya.
   - **Jalur laptop:** di URL-nya, ganti `device_id` Node 1 dengan `f00d00000001`, lalu klik **Send**. Jangan tekan **Ctrl + S**: perubahan ini hanya sementara.
3. **Segera** pindah ke dashboard, klik **← Kembali ke daftar**, lalu buka perangkat yang sama.
4. Bandingkan **jamnya dulu**: tambahkan 7 jam pada `ts` di Bruno, lalu cocokkan dengan `diperbarui pukul … WIB`. Kalau sama, **setiap angka harus sama persis**. Kalau berbeda beberapa detik, perangkat sempat mengirim bacaan baru; ulangi langkah 2 dan 3 lebih cepat.
5. Cocokkan setiap kolom dengan kartunya, memakai tabel di bawah.

**Hasilnya** (**contoh**: kolom kanan berisi jawaban backend v1.0 sungguhan untuk Node 1 simulator lab penulis dengan sensor RS-485, diambil lewat skrip berakun `viewer`, bukan dari layar Bruno; angka dan jammu pasti berbeda):

| Kolom di jawaban Bruno | Tempatnya di dashboard | Contoh → di dashboard |
| :--- | :--- | :--- |
| `jenis`, `status` | baris kecil di atas kartu | `node1 · online` |
| `telemetry.ts` | baris kecil, `diperbarui pukul … WIB` | `"2026-10-23T12:21:59Z"` → `19.21.59 WIB` (UTC + 7 jam) |
| `suhu` | kartu `Suhu` | `28.5` °C |
| `kelembapan` | kartu `Kelembapan` | `71` % |
| `cahaya` | kartu `Cahaya` | `2310` /4095 |
| `tanah` | kartu `Kelembapan tanah` | `37` % |
| `gerak` | kartu `Gerakan` | `false` → `Tidak ada` |
| `level_air` | kartu `Air tandon` | `64` % |
| `tanah_rs485`, `suhu_tanah`, `ec` | kartu `Tanah RS-485`, `Suhu tanah`, `EC tanah` | `58.5` %, `25.3` °C, `1200` µS/cm |
| `state.lampu`, `state.kipas` | kartu `Lampu` dan `Kipas` | `false` → `Mati` |
| `state.pompa`, `state.tirai` | belum ada kartunya ([🧩 Tingkat 1](#-tantangan-mandiri)) | `false`, `90` → — |
| `fw` | tidak ditampilkan | `"1.6.0"` → — |

Kolom bernilai `null` di Bruno harus tampil "—" di kartunya. Dashboard tidak membulatkan angka: `28.5` di Bruno tetap `28.5` di kartu.

6. **Jalur perangkat: ulangi untuk Node 2.** Ganti `device_id` di URL dengan milik Node 2-mu (misalnya `246f28b1c7d4`), klik **Send**, lalu buka detail Node 2. Selain `suhu` dan `kelembapan`, pasangannya: `tekanan` → `Tekanan udara` (hPa), `suhu_tanah` → `Suhu tanah`, `tanah` → `Kelembapan tanah`, `baterai` → `Baterai` (V). Node 2 tidak mengirim `state`, jadi tanpa `Lampu` dan `Kipas`.
7. Tutup tab **`bacaan terbaru Node 1`** di Bruno. Kalau URL-nya sempat kamu ubah, dialog `Unsaved changes` muncul: klik **Don't Save**, seperti di Modul 16.

**Kamu lulus langkah ⭐ ini** kalau, sesudah *login*, detail Node 1 (jalur laptop: `f00d00000001`) dan detail Node 2 (jalur perangkat) menampilkan **semua sensor** yang ada di jawaban Bruno, setiap angkanya sama persis dengan kolomnya, jam `diperbarui pukul … WIB` sama dengan `ts` ditambah 7 jam, dan judulnya memuat nama, lokasi, dan lencana `kunci` perangkat itu. Inilah bukti separuh pertama syarat lulus modul ini.

#### 6.5 Gelang habis: *refresh* sekali di `api.ts` (10 menit)

Gelang (`akses`) hanya berumur 15 menit, sedangkan kartu terusan (`sesi`) sah sampai 7 hari, tetapi `api.ts` belum pernah menukarkannya. Jangan menunggu 15 menit: tiru gelang yang habis dengan menghapus *cookie* `akses` sendiri.

**Lihat masalahnya dulu.**

1. Dengan layar daftar perangkat tampil, buka panel **Application** → **Cookies** → `http://localhost:5173` di DevTools, seperti di Praktik 4.4.
2. Klik baris **`akses`**, lalu tekan tombol **Delete** di papan ketik (atau klik kanan → **Delete**, atau tombol **Delete selected**, ikon ✕, di bilah atas tabel). Biarkan baris `sesi`.
3. Ketuk **Node 1 ruang tamu** (jalur laptop: **Latihan ruang tamu**).

**Hasilnya:** sesudah `Memuat bacaan…` sekejap, kamu kembali ke formulir *login* dengan kotak `Sesi sudah habis. Silakan masuk lagi.` Tab **Network** hanya bertambah dua `latest` berstatus `401`, tanpa `refresh`. Pengguna ditendang begini setiap 15 menit, padahal kartu terusannya masih sah.

**Pasang *refresh* sekali** (alurnya di Konsep 9). Buka [`kode/tahap/praktik-6/frontend/src/api.ts`](kode/tahap/praktik-6/frontend/src/api.ts) di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi `src/api.ts`-mu (`ambilTerbaru()` dari 6.1 sudah ada di dalamnya). Yang baru: daftar `const TANPA_REFRESH = ["/auth/login", "/auth/refresh", "/auth/logout"];` (tiga loket yang tak pernah memicu *refresh*), variabel `let refreshBerjalan: Promise<boolean> | null = null;`, fungsi `refreshSekali()`, isian ketiga `bolehUlang = true` pada `minta()`, dan satu `if` tepat sesudah blok `try`/`catch` di `minta()`:

```ts
function refreshSekali(): Promise<boolean> {
  if (refreshBerjalan === null) {
    // tanpa body, jadi juga TANPA Content-Type JSON (kalau diberi, backend menjawab 400)
    refreshBerjalan = fetch(BASE + "/auth/refresh", { method: "POST", credentials: "include" })
      .then((res) => res.ok) // 200 = gelang baru sudah dipasang di browser
      .catch(() => false) // backend mati = refresh gagal
      .finally(() => {
        refreshBerjalan = null; // selesai: lain kali boleh refresh lagi
      });
  }
  return refreshBerjalan;
}
```

```ts
  if (res.status === 401 && bolehUlang && !TANPA_REFRESH.includes(jalur) && (await refreshSekali())) {
    return minta<T>(jalur, opsi, false);
  }
```

- **`refreshSekali()`** mengetuk `POST /auth/refresh` tanpa isi, jadi tanpa `Content-Type` dan tanpa *preflight*. Kartu terusan ikut karena jalurnya diawali `/auth`. Jawaban 200 (`true`) berarti gelang dan kartu terusan baru sudah dipasang browser; jawaban lain atau backend mati (`.catch`) menghasilkan `false`.
- **`refreshBerjalan`** ada di luar semua fungsi, jadi umurnya sepanjang halaman terbuka. Isinya "alat getar" (*Promise*, Modul 4) milik *refresh* yang sedang berjalan; 401 kedua ikut menunggu alat getar itu, bukan mengetuk lagi, karena setiap ketukan mengganti kartu terusan (rotasi, Modul 20). `.finally(…)` mengosongkannya sesudah selesai.
- **`bolehUlang = true`** adalah nilai bawaan, jadi `ambilTerbaru()` dan kawan-kawan tidak menuliskannya. `&&` berhenti di syarat pertama yang tidak terpenuhi: `refreshSekali()` hanya dijalankan untuk 401 yang boleh diulang dan jalurnya tidak ada di `TANPA_REFRESH`. Kalau berhasil, `minta()` memanggil **dirinya sendiri** dengan `bolehUlang` bernilai `false`, jadi ulangannya hanya sekali. Kalau gagal, `GalatApi` 401 sampai ke `onSesiHabis`, dan kini artinya **sesi benar-benar habis**. `GET /auth/me` pun ikut di-*refresh*, jadi keesokan harinya kamu langsung masuk.

Simpan (**Ctrl + S**), lalu masuk lagi dengan akun `viewer` kalau formulir *login* masih tampil.

**Uji *refresh* sekali.**

4. Kosongkan tab **Network** dengan **Clear network log**.
5. Di panel **Application**, hapus lagi baris **`akses`** saja.
6. Ketuk **Node 1 ruang tamu** (jalur laptop: **Latihan ruang tamu**).

**Hasilnya:** sesudah `Memuat bacaan…` sesaat, layar detail tampil tanpa mengetik sandi. Tab **Network** berisi lima baris berurutan: dua `latest` `401`, satu `refresh` `200`, lalu dua `latest` `200`. Tab **Console** mencatat dua baris merah `GET http://localhost:8080/devices/a4cf12e5b7c0/latest 401 (Unauthorized)`; itu normal. Di panel **Application**, `akses` kembali ada dengan **Expires** (dalam UTC) 15 menit sesudah *refresh*. Isi `sesi` berganti (rotasi), tetapi **Expires**-nya tidak bertambah: batas 7 hari dihitung dari *login* pertamamu.

**Hasilnya** (**contoh**, terminal backend jalur perangkat; jalur laptop menulis `f00d00000001`, jam dan lama prosesnya pasti berbeda):

```text
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 401 (1 ms)
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 401 (1 ms)
[19:04:35] INFO: POST /auth/refresh -> 200 (7 ms)
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 200 (1 ms)
[19:04:35] INFO: GET /devices/a4cf12e5b7c0/latest -> 200 (1 ms)
```

**Kalau kartu terusan juga habis**, misalnya 7 hari sesudah *login* atau sesudah sesimu dicabut:

7. Di panel **Application**, hapus **kedua** baris, `akses` dan `sesi`.
8. Klik **← Kembali ke daftar**.

**Hasilnya:** sesudah `Memuat perangkat…` sekejap, formulir *login* tampil dengan kotak `Sesi sudah habis. Silakan masuk lagi.` Tab **Network** berisi dua `devices` `401` dan satu `refresh` `401`, dan **Console** mencatat ketiganya sebagai baris merah.

**Hasilnya** (**contoh**, terminal backend):

```text
[23:25:33] INFO: GET /devices -> 401 (1 ms)
[23:25:33] INFO: GET /devices -> 401 (1 ms)
[23:25:33] INFO: POST /auth/refresh -> 401 (1 ms)
```

Biasanya *refresh* hanya sekali, karena kedua 401 tiba selagi *refresh* masih berjalan. Sesekali 401 kedua baru tiba sesudah *refresh* pertama selesai, sehingga *refresh* terlihat dua kali (Konsep 9). Keduanya benar.

> [!NOTE]
> Kotak `Sesi sudah habis. Silakan masuk lagi.` hanya muncul kalau sesi habis **saat dashboard dipakai**. Dashboard yang dibuka tanpa sesi sah (misalnya sesudah **Keluar** lalu **F5**) menampilkan formulir polos (Konsep 10), didahului dua `me` dan satu `refresh` (kadang dua) yang semuanya `401`.

Masuk lagi dengan akun `viewer`, lalu tutup panel **Application**. Kolom **Value** di sana berisi gelang dan kartu terusanmu yang masih berlaku, jadi jangan memotretnya.

#### 6.6 Simpan ke cabang (6 menit)

Di terminal yang kosong (folder `frontend`, cabang `fitur/dashboard`), jalankan `git status`: seharusnya ada tiga berkas berubah dan `src/components/DetailPerangkat.tsx` di `Untracked files`. Kalau `../backend/bruno/bacaan terbaru Node 1.yml` ikut disebut, perubahan URL di Bruno sempat tersimpan: kembalikan dengan `git restore "../backend/bruno/bacaan terbaru Node 1.yml"`. Lalu simpan:

```text
git add src/api.ts src/App.tsx src/components/DaftarPerangkat.tsx src/components/DetailPerangkat.tsx
git commit -m "Detail perangkat dan refresh sekali (Modul 22 Praktik 6)"
```

Keadaan kode di akhir praktik ini ada di [`kode/tahap/praktik-6/frontend/`](kode/tahap/praktik-6/frontend/) untuk dicocokkan. Biarkan semuanya menyala kalau langsung lanjut; kalau berhenti dulu, hentikan setiap terminal dengan **Ctrl + C** (kontainer database boleh tetap menyala).

> ⬆️ **Selesai Praktik 6?** Dashboard-mu kini menampilkan bacaan terbaru semua sensor dari API, dan tetap masuk walaupun gelangnya habis. Intip layar selebar HP: di DevTools, tekan **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**), lalu ketik lebar `375`. Kartunya berdesakan dan isinya lebih lebar daripada layar: itulah pekerjaan berikutnya. Baca [Konsep 11 — Responsif](#11-responsif-satu-halaman-untuk-hp-dan-laptop), lalu lanjut ke [Praktik 7 — Rapi di layar HP](#praktik-7--rapi-di-layar-hp-40-menit).

### Praktik 7 — Rapi di layar HP (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal seperti di Praktik 6 (backend v1.0, Vite, dan satu terminal kosong di folder `frontend` untuk `npm run build` dan Git; jalur laptop ditambah broker dan simulator), **Docker Desktop** (kontainer `rumahpintar-db` menyala), dan **browser Chrome atau Edge** dengan DevTools: mode perangkat, tab **Console**, dan tab **Elements**. Konsep yang dipakai: Konsep 11 dan kamus kelas Tailwind dari Konsep 3.
>
> ⭐ **Wajib** — langkah 7.4: di mode perangkat selebar 375, 768, dan 1280 px, dashboard tidak bisa digulir mendatar, semua kartu utuh, dan teks panjang dipotong rapi.

Sejak Praktik 3, dashboard-mu ditulis dengan "gaya laptop": kartu sensor tiga kolom, daftar perangkat dua kolom, dan kepala halaman satu baris. Praktik ini memeriksanya di lebar HP, mengukur bagian yang berantakan, lalu membereskannya dengan cara *mobile first* dari [Konsep 11](#11-responsif-satu-halaman-untuk-hp-dan-laptop). Tidak ada fitur baru, dan `api.ts` tidak disentuh: yang berubah hanya kelas Tailwind di `App.tsx` dan empat komponen.

#### 7.1 Mode perangkat DevTools: dashboard di 375, 768, dan 1280 px (8 menit)

Pastikan semuanya masih menyala seperti di akhir Praktik 6, lalu buka **`http://localhost:5173`** (kalau perlu, masuk dengan akun `viewer`).

1. Buka DevTools (**F12**; macOS: **Cmd + Option + I**), lalu tekan **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**), seperti di Praktik 1. Cara lainnya: klik tombol berikon HP dan tablet di bilah atas DevTools (**Toggle device toolbar** di Chrome, **Toggle device emulation** di Edge).
2. Di bilah mode perangkat yang muncul di atas halaman, pastikan pilihannya **Responsive**. Ketik `375` di kotak lebar, lalu tekan **Enter**; kotak tinggi boleh dibiarkan.
3. Lihat layar **Daftar Perangkat**.

**Hasilnya (contoh):**

- **Kepala:** judul terlipat dua baris (`Rumah Pintar` / `Mini`), begitu juga `Tamu Rumah` / `(viewer)` yang berdesakan di sebelahnya. Tombol **Keluar** tampak pendek.
- **Daftar:** kartunya tetap dua kolom. Nama perangkat terlipat per kata (`Node` / `2` / `kebun`) sehingga kartu memanjang, dan lencananya menembus tepi kanan kartu, bahkan tepi layar. Mode perangkat bisa memperkecil seluruh halaman sedikit supaya muat, jadi tulisan tampak lebih kecil dan latar abu-abu tidak sampai ke tepi kanan.

Mata bisa tertipu, jadi ukur juga. Di tab **Console**, ketik baris ini, lalu tekan **Enter**:

```js
document.documentElement.scrollWidth
```

`document.documentElement` adalah elemen `<html>`, akar pohon DOM ([Konsep 2](#2-browser-dan-devtools-membedah-sakelar-modul-10)), dan `scrollWidth` adalah lebar **seluruh** isinya, termasuk yang menyembul keluar layar. Kalau tidak ada yang menyembul, angkanya sama dengan lebar layar.

**Hasilnya (contoh):** `399`, artinya isinya 24 px lebih lebar daripada layar. Angkamu bisa berbeda, bergantung pada isi daftarmu, tetapi pasti **lebih besar** daripada 375.

Ukur juga tombol **Keluar**: `querySelector("header button")` mencari tombol pertama di dalam `<header>`, dan `offsetHeight` adalah tingginya dalam piksel.

```js
document.querySelector("header button").offsetHeight
```

**Hasilnya:** `30`, jauh di bawah tombol 44 px buatanmu di Praktik 1.

4. Ketuk **Node 1 ruang tamu** (jalur laptop: **Latihan ruang tamu**) untuk membuka detailnya.

**Hasilnya (contoh):** kartu sensor tetap tiga kolom, ±106 px. Label `Kelembapan tanah` terlipat, dan angka beserta satuannya di kartu **Cahaya** dan **EC tanah** menembus tepi kanan kartu (EC tanah hanya ada kalau sensor RS-485 terpasang, dan Cahaya di `f00d00000001` acak, jadi bisa saja muat). **← Kembali ke daftar** hanya setinggi 20 px. `scrollWidth` detail `375`: luapannya hanya di dalam kartu.

5. Ketik `768` di kotak lebar, lalu `1280`, dan periksa daftar serta detail.

**Hasilnya:** kepala satu baris, daftar dua kolom (362 px), kartu sensor tiga kolom (±237 px), dan `scrollWidth` sama dengan lebarnya. Di 1280 px, isinya selebar 768 px di tengah layar (`max-w-3xl`, Praktik 3). Kalau jendela browsermu lebih sempit daripada lebar yang kamu ketik, DevTools memperkecil gambar halamannya supaya muat; susunannya tetap.

Jadi, masalahnya hanya di layar sempit: `grid-cols-2` dan `grid-cols-3` **tidak berawalan**, sehingga berlaku juga di HP (Konsep 11). Langkah 7.2 membereskan kisi dan kepala; 7.3 teks panjang dan tombol kecil. Kembalikan lebarnya ke `375` dan biarkan mode perangkat menyala; berkat HMR, perubahanmu langsung terlihat.

#### 7.2 Kisi yang menyesuaikan dan kepala yang tidak tumpah (12 menit)

Cara *mobile first* membalik kebiasaan Praktik 3–6: susunan untuk HP ditulis **tanpa awalan**, lalu susunan untuk layar yang lebih lebar diberi awalan `sm:` (mulai 640 px).

Ganti seluruh isi tiga berkas di bawah: buka tautannya di GitHub, klik **Copy raw file**, lalu tempel sebagai pengganti seluruh isi berkas yang sama di proyekmu. Isinya sudah memuat **semua** perbaikan Praktik 7, termasuk kelas di 7.3; logikanya tidak berubah, hanya `className` dan komentar. Menyalin lebih aman: kelas salah ketik seperti `sm:grid-col-2` tidak menimbulkan galat; Tailwind hanya diam-diam tidak membuatkan CSS-nya (Konsep 3).

**Daftar perangkat:** [`kode/tahap/praktik-7/frontend/src/components/DaftarPerangkat.tsx`](kode/tahap/praktik-7/frontend/src/components/DaftarPerangkat.tsx). `grid` tanpa `grid-cols-…` sudah berarti satu kolom:

```tsx
    // mobile first: satu kolom di HP; mulai lebar sm (640 px) ke atas, dua kolom
    <ul className="grid gap-3 sm:grid-cols-2">
```

**Detail perangkat:** [`kode/tahap/praktik-7/frontend/src/components/DetailPerangkat.tsx`](kode/tahap/praktik-7/frontend/src/components/DetailPerangkat.tsx). Kartu sensor di HP dua kolom, bukan satu, karena kartunya kecil: ±166 px cukup lega untuk angka dan satuannya.

```tsx
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
```

**Kepala halaman:** [`kode/tahap/praktik-7/frontend/src/App.tsx`](kode/tahap/praktik-7/frontend/src/App.tsx).

```tsx
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
```

Di 375 px, ruang isi kepala hanya 375 − 2 × 16 = 343 px (`px-4`): judul dan kelompok nama akun tidak muat berdampingan, padahal baris *flex* Praktik 6 tidak boleh terlipat. **`flex-wrap`** menurunkan kelompok nama akun ke baris kedua, seperti kartu ketiga di Praktik 1. **`gap-x-4`** memberi jarak 16 px kalau keduanya berdampingan, **`gap-y-1`** 4 px antarbaris, dan `py-2` (sebelumnya `py-3`) menjaga kepala tidak terlalu tinggi.

Simpan ketiga berkas. Vite memperbarui browser sendiri.

**Hasilnya (contoh)** di 375 px:

- **Kepala:** `Rumah Pintar Mini` di baris pertama; `Tamu Rumah (viewer)` dan **Keluar** di baris kedua.
- **Daftar:** satu kartu per baris, selebar 343 px. Nama yang terlalu panjang akan dipotong `…`; nama-nama dari Modul 21 masih muat semua.
- **Detail:** kartu sensor dua kolom, ±166 px, sama tinggi, tanpa luapan.
- **`scrollWidth`**: `375` (di **Console**, **↑** memanggil lagi perintah sebelumnya).

#### 7.3 Ukuran sentuh dan teks panjang: `min-h-11`, `truncate`, dan `min-w-0` (8 menit)

**Jari** butuh sasaran yang cukup besar, dan **teks** yang panjangnya tidak bisa ditebak (nama perangkat, nama akun, lokasi) tidak boleh merusak susunan. Empat kelas mengurus keduanya:

| Kelas | CSS-nya | Artinya |
| :--- | :--- | :--- |
| `min-h-11` | `min-height`: 11 × 0,25 rem = 2,75 rem (44 px) | tinggi paling sedikit 44 px |
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` | satu baris saja; yang tidak muat diganti `…` |
| `min-w-0` | `min-width: 0` | boleh menyempit lebih kecil daripada isinya |
| `shrink-0` | `flex-shrink: 0` | tidak pernah menyempit |

**Mengapa perlu `min-w-0`?** Di baris *flex*, setiap anak punya aturan bawaan yang tidak kelihatan: ia **tidak mau menyempit lebih kecil daripada isinya** yang tidak bisa dipatahkan. Lencana sengaja tidak boleh terlipat (`whitespace-nowrap` di `Lencana.tsx`), jadi di Praktik 6 lencana menembus kartu. `min-w-0` melepas aturan itu pada elemen yang **boleh** menyempit, lalu `truncate` memotong teksnya. Di kartu perangkat, **nama** yang mengalah, sedangkan **lencana** tetap utuh (`shrink-0`), karena `kunci dicabut` justru informasi terpenting (Praktik 5). Baris lokasi juga diberi `truncate`.

```tsx
              <span className="min-w-0 truncate font-semibold text-slate-800">{p.nama ?? p.device_id}</span>
              <span className="flex shrink-0 gap-1">
```

Di kepala, pasangan yang sama memotong nama akun yang panjang supaya **Keluar** tidak terdorong keluar layar:

```tsx
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate text-slate-600">
```

Di halaman detail, nama lengkap perangkat perlu terbaca, jadi judulnya **tidak** dipotong: `flex-wrap` menurunkan lencana kunci ke bawah judul kalau tidak muat, dan `break-words` (`overflow-wrap: break-word`) membolehkan kata yang terlalu panjang dipatahkan (dokumentasi Tailwind v4 kini menamainya `wrap-break-word`; CSS-nya sama).

```tsx
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold break-words text-slate-800">{perangkat.nama ?? id}</h2>
```

**Sasaran jari 44 px.** `min-h-11` sama dengan `min-height: 44px` tombolmu di Praktik 1. **Keluar** mendapat `min-h-11 shrink-0` dan `px-4` (sebelumnya `px-3`). **← Kembali ke daftar** tetap tampak seperti tautan, tetapi `inline-flex min-h-11 items-center` menaruh tulisannya di tengah kotak setinggi 44 px.

Tinggal dua berkas lagi, dengan cara yang sama.

**Kartu sensor:** [`kode/tahap/praktik-7/frontend/src/components/KartuSensor.tsx`](kode/tahap/praktik-7/frontend/src/components/KartuSensor.tsx). Di 375 px, label `Kelembapan tanah` masih muat; `truncate` di sini sabuk pengaman untuk HP yang lebih sempit.

```tsx
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="truncate text-sm text-slate-500">{label}</p>
```

**Formulir *login*:** [`kode/tahap/praktik-7/frontend/src/components/Login.tsx`](kode/tahap/praktik-7/frontend/src/components/Login.tsx). `min-h-11` ditambahkan sesudah `mt-1` di kotak **Email** dan **Sandi**, juga di tombol **Masuk**:

```tsx
          className="mt-5 min-h-11 w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
```

Simpan, lalu jalankan lagi `document.querySelector("header button").offsetHeight` di **Console**.

**Hasilnya:** `44`.

**Coba nama yang sangat panjang**, dengan cara Kemenangan Cepat (Langkah 4): ubah teksnya di DevTools, tanpa menyentuh berkas.

1. Di **Daftar Perangkat** (375 px), klik kanan nama perangkat pertama → **Inspect**. Di tab **Elements**, nama itu ada di dalam `<span>` yang kelasnya diawali `min-w-0 truncate`.
2. Klik dua kali teks namanya, ganti dengan misalnya `Node 2 kebun belakang dekat pompa air dan tandon timur`, lalu tekan **Enter**.

**Hasilnya:** nama itu tetap satu baris dan berakhir dengan `…`, lencananya utuh di dalam kartu, dan `scrollWidth` tetap `375`.

Tekan **F5** (macOS: **Cmd + R**): React menggambar daftar lagi dari `GET /devices`, jadi nama aslinya kembali.

Bingkai kartu yang tidak berubah warna saat disorot di mode perangkat juga wajar: setelan bawaannya meniru layar sentuh (kursornya menjadi lingkaran), dan `hover:` hanya aktif di perangkat berkursor (Konsep 11).

#### 7.4 ⭐ Periksa di tiga lebar (5 menit)

Di setiap lebar, periksa **Daftar Perangkat**, detail **Node 1 ruang tamu** (jalur laptop: **Latihan ruang tamu**), dan detail **Node 2 kebun** (jalur perangkat). Di setiap layar, ukur `scrollWidth` di **Console** dan periksa dengan mata.

**Hasilnya:** di laptop penulis, Chrome dan Edge memberi angka yang sama untuk daftar dan detail Node 1, Node 2, serta `f00d00000001`:

| Lebar | Kepala | Daftar | Kartu sensor | **Keluar**, **← Kembali** | `scrollWidth` |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `375` (HP) | dua baris | 1 kolom, 343 px | 2 kolom, ±166 px | 44 px | `375` (Praktik 6: `399`) |
| `768` (tablet) | satu baris | 2 kolom, 362 px | 3 kolom, ±237 px | 44 px | `768` |
| `1280` (laptop) | satu baris; isi selebar 768 px di tengah | 2 kolom, 362 px | 3 kolom, ±237 px | 44 px | `1280` |

Detail yang sama di 375 px dan 1280 px, berdampingan:

![Komposit dua tangkapan layar asli layar detail Node 1 ruang tamu dashboard v0.1 di Microsoft Edge, dengan data dari GET /devices/a4cf12e5b7c0/latest backend v1.0 Modul 21; angkanya berasal dari simulator lab; judul: Detail Node 1: satu kode, dua lebar layar. Kiri, nomor 4, HP 375 px dengan kisi 2 kolom, halaman utuh: kepala Rumah Pintar Mini dengan Admin Rumah (admin) dan tombol Keluar di baris kedua; tautan ← Kembali ke daftar (nomor 6); judul Node 1 ruang tamu dengan lencana kunci aktif dan baris ruang tamu · a4cf12e5b7c0 (nomor 5); baris node1 · online · diperbarui pukul 19.01.07 WIB (nomor 1); lalu sebelas kartu, dua per baris: Suhu 28.5 °C, Kelembapan 71 %, Cahaya 2310 /4095, Kelembapan tanah 37 %, Gerakan Tidak ada, Air tandon 64 %, Tanah RS-485 58.5 %, Suhu tanah 25.3 °C, EC tanah 1200 µS/cm (ketiga kartu RS-485 ini nomor 2), Lampu Mati dan Kipas Mati (nomor 3). Kanan, nomor 4, laptop 1280 px dengan kisi 3 kolom mulai lebar sm, 640 px: kepala satu baris dengan nama akun dan tombol Keluar di kanan, isi yang sama dengan baris node1 · online · diperbarui pukul 19.00.57 WIB (nomor 1), kartu tiga per baris dengan Tanah RS-485, Suhu tanah, dan EC tanah dalam satu baris (nomor 2), lalu Lampu dan Kipas (nomor 3). Keterangan: 1 jam WIB dari ts perangkat yang ber-UTC, lewat toLocaleTimeString dengan Asia/Jakarta; 2 trio tanah RS-485 dari Modul 15, muncul bila kolom tanah_rs485 ada dan selalu bertiga; 3 Lampu dan Kipas hanya ditampilkan, tombol kendalinya baru di Modul 24; 4 grid-cols-2 sm:grid-cols-3, mobile first, tanpa gulir mendatar di 375 px; 5 judul berisi nama, lencana kunci, dan device_id dari objek Perangkat yang dititipkan dari daftar; 6 ← Kembali ke daftar setinggi 44 px berkat min-h-11, mudah diketuk jempol.](aset/dashboard-detail-hp-dan-laptop.png)

Kalau HP-mu lebih sempit, misalnya 360 px, coba juga lebar itu. Layar *login* di 375 px pun `scrollWidth`-nya `375` (klik **Keluar**, lalu masuk lagi).

**Kamu lulus langkah ⭐ ini** kalau di ketiga lebar: **tidak ada gulir mendatar** (`scrollWidth` sama dengan lebar yang kamu ketik), **semua kartu utuh**, dan **teks panjang dipotong rapi** tanpa membuat kepala halaman meluber. Tombol 44 px adalah bonus untuk jempolmu.

**Coba juga (pilihan, 2 menit).** Ketik `639`, lalu `640`. Tepat di *breakpoint* `sm` (40 rem), daftar langsung dua kolom dan kartu sensor tiga kolom: semua kelas `sm:` berlaku bersamaan. Kartu daftar di 640 px hanya 298 px, jadi nama seperti `Node 1 ruang tamu` sudah dipotong `…`: `truncate` bekerja, bukan galat.

> [!NOTE]
> **Mode perangkat hanya meniru lebar layar HP;** untuk syarat lulus itu cukup. HP sungguhan dipakai resmi mulai Modul 23. Kalau penasaran, lihat [🔬 Bedah Teknis](#-bedah-teknis-opsional), bagian "Mencoba di HP sungguhan lewat WiFi rumah (pilihan)": langkah itu membuka backend dan Vite ke jaringan rumah untuk sementara, jadi baca dulu peringatannya.

Tutup mode perangkat dengan **Ctrl + Shift + M** (macOS: **Cmd + Shift + M**).

#### 7.5 Simpan ke cabang (7 menit)

Di terminal kosong (folder `frontend`, cabang `fitur/dashboard`), periksa tipe dulu, seperti sejak Praktik 3:

```text
npm run build
```

**Hasilnya (contoh):** `tsc -b` tidak mencetak apa pun (tidak ada galat tipe), lalu Vite menulis tiga baris berkas `dist/` dan menutupnya dengan `✓ built in 322ms`. Kalau ada galat atau tampilan yang berbeda, biasanya berkas belum tersimpan atau terpotong: cocokkan dengan [`kode/tahap/praktik-7/frontend/`](kode/tahap/praktik-7/frontend/), keadaan kode di akhir praktik ini.

```text
git status
```

**Hasilnya:** `On branch fitur/dashboard`, lalu lima baris `modified:` di `src/`: `App.tsx`, `components/DaftarPerangkat.tsx`, `components/DetailPerangkat.tsx`, `components/KartuSensor.tsx`, dan `components/Login.tsx`. Tidak ada berkas baru; `dist/` diabaikan `.gitignore` templat. Simpan:

```text
git add src/App.tsx src/components/DaftarPerangkat.tsx src/components/DetailPerangkat.tsx src/components/KartuSensor.tsx src/components/Login.tsx
git commit -m "Rapi di layar HP: kisi mobile first, teks panjang, dan tombol 44 px (Modul 22 Praktik 7)"
```

Kalau langsung lanjut, biarkan semuanya menyala. Kalau berhenti dulu, hentikan setiap terminal dengan **Ctrl + C**; kontainer database boleh tetap menyala.

> ⬆️ **Selesai Praktik 7?** Dashboard-mu kini rapi dari layar HP sampai laptop, dan bagian terakhir syarat lulus sudah kamu buktikan. Lanjut ke [Praktik 8 — Uji kelulusan: *build*, *lint*, dan gladi bersih](#praktik-8--uji-kelulusan-build-lint-dan-gladi-bersih-35-menit), tempat dashboard v0.1.0 diuji dari awal sampai akhir.

### Praktik 8 — Uji kelulusan: *build*, *lint*, dan gladi bersih (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal seperti di Praktik 7: terminal `backend` (backend v1.0), **terminal Vite** di folder `frontend` (mula-mula menjalankan `npm run dev`, lalu `npm run build`, `npm run preview`, dan `npm pkg set`), dan **terminal kosong** di folder `frontend` untuk `npm run lint` dan Git. Jalur laptop menambah terminal broker (`edge`) dan simulator (`alat`). Lalu **Docker Desktop** (kontainer `rumahpintar-db` menyala) dan **Chrome atau Edge** dengan DevTools: tab **Network**, **Console**, dan mode perangkat. Konsep yang dipakai: 4, 9, dan 11.
>
> ⭐ **Wajib** — langkah 8.4: gladi bersih syarat lulus Silabus dalam sekali jalan, pada hasil *build*: *login* → bacaan terbaru semua sensor Node 1 dan Node 2 dari API → rapi di lebar 375 px.

Praktik terakhir ini tidak menambah fitur. Kamu memeriksa dashboard seperti penguji: oxlint memeriksa kebersihan kode (8.1), `npm run build` memeriksa tipe dan memasak **hidangan siap saji** di `dist/` yang kamu cicipi dengan `npm run preview` (8.2), dashboard mendapat versi **0.1.0** (8.3), lalu syarat lulus diuji pada hidangan itu, bukan di dapur (8.4). Keadaan akhir kodenya ada di [`kode/frontend/`](kode/frontend/).

#### 8.1 Pemeriksa kebersihan kode: `npm run lint` (5 menit)

Biarkan backend dan Vite tetap menyala. Di **terminal kosong** (folder `frontend`), jalankan:

```text
npm run lint
```

**Hasilnya (contoh):**

```text
> frontend@0.0.0 lint
> oxlint

Found 0 warnings and 0 errors.
Finished in 24ms on 10 files with 116 rules using 8 threads.
```

Dua baris `>` ditulis npm: nama dan versi paket (diganti di 8.3) dan isi skrip `lint`. **Bersih** berarti `0 warnings and 0 errors`; lama dan jumlah *thread* mengikuti laptopmu. Sepuluh berkas itu adalah `vite.config.ts` dan sembilan berkas `.ts`/`.tsx` di `src`. `index.css` tidak dihitung, karena oxlint hanya memeriksa JavaScript dan TypeScript.

oxlint adalah **pemeriksa kebersihan dapur** dari [Konsep 4](#4-vite-dan-folder-frontend-dapur-pengembangan-di-localhost5173): ia membaca kodemu tanpa menjalankannya dan mencari kebiasaan yang rawan masalah. Ia **tidak** memeriksa tipe; itu tugas `tsc -b` di 8.2. Beberapa aturannya sudah menjagamu sejak awal:

| Aturan | Yang dijaganya | Terkait |
| :--- | :--- | :--- |
| `rules-of-hooks` | *hook* hanya dipanggil di tingkat teratas komponen (bertingkat **galat** di `.oxlintrc.json`) | Konsep 7 |
| `exhaustive-deps` | daftar di ujung `useEffect` memuat semua nilai luar yang dipakai efeknya, misalnya `[onSesiHabis]` | Praktik 5 |
| `set-state-in-effect` | *state* tidak diubah langsung di badan efek; karena itulah `DetailPerangkat` disegarkan lewat `key` | Praktik 6.1 |
| `only-export-components` | berkas komponen hanya mengekspor komponen, supaya HMR bisa bekerja | Konsep 4 |

Kalau ada temuan, oxlint menulis aturan, berkas, dan barisnya. Betulkan (bandingkan dengan [`kode/tahap/praktik-7/frontend/`](kode/tahap/praktik-7/frontend/)), lalu ulangi sampai tanpa galat **dan** tanpa peringatan.

**Coba sekali (pilihan, 2 menit).** Di `src/components/DaftarPerangkat.tsx`, ganti `}, [onSesiHabis]);` dengan `}, []);`, simpan, lalu jalankan `npm run lint`. Muncul `⚠ react-hooks(exhaustive-deps): React Hook useEffect has a missing dependency: 'onSesiHabis'` yang menunjuk `src/components/DaftarPerangkat.tsx:34:6`, ditutup `Found 1 warning and 0 errors.` npm tidak menganggapnya gagal, dan dashboard tampak jalan seperti biasa. Justru itulah bahayanya: kesalahan ini tidak terlihat di layar, sampai efeknya memakai nilai yang sudah basi. Kembalikan (**Ctrl + Z**, **Ctrl + S**), lalu jalankan `npm run lint` lagi sampai bersih.

#### 8.2 Hidangan siap saji: `npm run build`, lalu cicipi dengan `npm run preview` (8 menit)

**1. Hentikan dapurnya.** Klik terminal Vite, lalu tekan **Ctrl + C**. `npm run preview` juga akan memakai port 5173, jadi keduanya tidak boleh menyala bersamaan.

**2. Beri `npm run preview` port 5173.** Buka `vite.config.ts`, lalu ganti seluruh isinya dengan:

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Modul 22: selalu di port 5173 (alamat yang diizinkan CORS_ORIGIN backend).
  // Kalau port itu sedang dipakai, berhenti dengan galat, jangan pindah diam-diam ke 5174.
  server: { port: 5173, strictPort: true },
  // npm run preview (Praktik 8) juga di 5173: port bawaannya (4173) tidak ada di CORS_ORIGIN, jadi login pasti ditolak.
  // Hentikan npm run dev dulu sebelum menjalankan preview.
  preview: { port: 5173, strictPort: true },
})
```

Yang baru hanya dua baris komentar dan baris **`preview`**, setelan untuk `npm run preview` (`server` mengatur dapur). Tanpanya, hidangan disajikan di port bawaan **4173**, yang tidak tercantum di `CORS_ORIGIN` backend ([Konsep 9](#9-login-dari-browser-cookie-cors-dan-localhost)): formulir *login* langsung menampilkan pesan kode 0 (kemungkinan kedua di Praktik 4.5), dan tab **Console** menulis `… from origin 'http://localhost:4173' has been blocked by CORS policy …`. `strictPort: true` membuat `npm run preview` berhenti dengan galat kalau port 5173 terpakai, bukan pindah diam-diam. Simpan (**Ctrl + S**).

**3. Masak hidangannya.** Masih di terminal Vite:

```text
npm run build
```

**Hasilnya (contoh):**

```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
✓ 22 modules transformed.
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-D271euGi.css   15.27 kB │ gzip:  3.84 kB
dist/assets/index-Irs7fedp.js   230.82 kB │ gzip: 72.15 kB

✓ built in 316ms
```

Bentuknya seperti Praktik 2.7, tanpa baris `transforming...` dan `rendering chunks...` yang tertimpa di tempat; isinya kini dashboard utuh:

- **`tsc -b`** diam: tidak ada galat tipe. Kalau ada, `vite build` tidak dijalankan (Praktik 3.4).
- **22 modul**, bukan 16: tambahannya `api.ts` dan kelima komponen. `types.ts` tidak dihitung karena hanya diimpor dengan `import type`, yang dihapus saat *build* ([Konsep 6](#6-props-dan-tipe-data-yang-dititipkan-bentuknya-dari-kontrak-data)).
- CSS naik dari 6.80 menjadi 15.27 kB (lebih banyak kelas Tailwind); JavaScript dari 219.77 menjadi 230.82 kB. Dashboard buatanmu hanya ±11 kB; sisanya React.
- Nama berkas, ukuran, dan lamanya bisa berbeda di laptopmu.

Folder **`dist`** kini tampak pudar di Explorer karena diabaikan `.gitignore` (isinya dibedah di [🔬 Bedah Teknis](#-bedah-teknis-opsional), "Isi folder `dist/`"). Jangan membuka `dist/index.html` dengan klik dua kali; hidangan ini dibuat untuk disajikan server. Catat ukuran `.js` dan lamanya *build* untuk ➕ D.

**4. Cicipi hidangannya.** Masih di terminal Vite:

```text
npm run preview
```

**Hasilnya:**

```text
> frontend@0.0.0 preview
> vite preview

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Tidak ada baris `VITE v8.3.5  ready in …`, karena `npm run preview` tidak memasak apa pun; ia hanya menyajikan `dist/`. Kalau alamatnya `:4173/`, setelan langkah 2 belum tersimpan. Kalau muncul `Error: Port 5173 is already in use`, `npm run dev` masih menyala: hentikan dulu ([🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)).

Di tab `http://localhost:5173`, buka tab **Network** (filter **All**), klik **Clear network log**, lalu tekan **F5**.

**Hasilnya:** dashboard tampil seperti di dapur, tanpa *login* lagi, karena *cookie* `akses` dan `sesi` dipegang browser untuk `localhost`, bukan oleh Vite. Bedanya di tab **Network**:

| Di tab **Network** | Dapur (`npm run dev`) | Hidangan (`npm run preview`) |
| :--- | :--- | :--- |
| Kode dashboard | satu baris per berkas (`main.tsx`, `App.tsx`, `api.ts`, komponen) plus modul React dan Vite | satu `index-….js` dan satu `index-….css` |
| `me` (`GET /auth/me`) | dua kali | **sekali** |
| `devices` (`GET /devices`) | dua kali | **sekali** |

Log backend mencatat hal yang sama. Permintaan ganda di dapur adalah ulah `StrictMode` di mode pengembangan ([🔬](#-bedah-teknis-opsional), "Mengapa efek berjalan dua kali"). Kalau gelangmu sudah lewat 15 menit, ada juga `me` 401, satu `refresh`, lalu `me` diulang (Praktik 6.5). Hidangan tanpa HMR: perubahan kode baru masuk sesudah `npm run build` lagi.

**5. Hentikan hidangannya** dengan **Ctrl + C**. Ia dinyalakan lagi di 8.4.

#### 8.3 Dashboard v0.1.0: nama dan versi resmi (4 menit)

`package.json`-mu masih bernama `frontend` versi `0.0.0` dari templat. Backend bernama `rumah-pintar-mini-backend` sejak Modul 16 (kini 1.0.0); dashboard mendapat pasangannya, **`rumah-pintar-mini-frontend`** versi **0.1.0**: "dashboard v0.1" dari Silabus. Angka 0 di depan berarti masih muda dan akan banyak berubah. Di terminal Vite, jalankan satu per satu:

```text
npm pkg set name=rumah-pintar-mini-frontend version=0.1.0
npm install
npm run build
```

- **`npm pkg set`** mengubah `package.json` tanpa membukanya, seperti `npm pkg set type=module` di Modul 16. Kalau berhasil, layarnya kosong. (`npm version` dari Modul 21 hanya mengganti versi, bukan nama.)
- **`npm install`** wajib sesudahnya, karena `npm pkg set` **tidak** menyentuh `package-lock.json`. Tanpa memasang paket baru, ia menyamakan `name` dan `version` di dua tempat dalam `package-lock.json`, menjawab `up to date, audited 45 packages in …`, dan ditutup `found 0 vulnerabilities`.
- **`npm run build`** memasak ulang hidangannya. Dua baris teratasnya kini:

**Hasilnya:**

```text
> rumah-pintar-mini-frontend@0.1.0 build
> tsc -b && vite build
```

Sisanya sama dengan 8.2, bahkan nama berkas `.js` dan `.css`-nya: kodemu tidak berubah, dan nama paket tidak ikut dimasak. Huruf acak itu sidik jari isi berkas (🔬, "Isi folder `dist/`").

Periksa `package.json`; yang berubah hanya baris `"name"` dan `"version"`:

```json
{
  "name": "rumah-pintar-mini-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "oxlint": "^1.88.0",
    "typescript": "~6.0.3",
    "vite": "^8.3.4"
  }
}
```

Jangan mengubah yang lain. Rentang seperti `"vite": "^8.3.4"` memang tulisan templat ([🧰](#-yang-perlu-disiapkan)); versi persis yang terpasang tercatat di `package-lock.json`. `"private": true` mencegah paketmu terbit ke registri npm secara tidak sengaja.

#### 8.4 ⭐ Gladi bersih syarat lulus (10 menit)

Syarat lulus Silabus: **setelah *login*, dashboard menampilkan bacaan terbaru semua sensor dari API, rapi di layar HP.** Praktik 4, 6, dan 7 membuktikannya sepotong-sepotong; kini ujilah ketiganya dalam sekali jalan, pada **hidangan**, karena itulah yang akan diserahkan. Kalau satu langkah gagal, betulkan, lalu ulangi dari awal.

**Persiapan.**

1. Pastikan backend v1.0 dan sumber datanya menyala: Node 1 dan Node 2 (jalur perangkat), atau broker berkunci dan simulator `f00d00000001` (jalur laptop).
2. Di terminal Vite, nyalakan lagi `npm run preview`.
3. Buka **`http://localhost:5173`** dengan mode perangkat **mati**. Kalau langsung tampil **Daftar Perangkat**, klik **Keluar** dulu: gladi dimulai dari formulir *login*.
4. Di DevTools, pilih tab **Network** (filter **All**), lalu klik **Clear network log**.

**Syarat 1: *login*.**

5. Masuk dengan `viewer@rumah.test` dan sandinya, seperti di Praktik 4.4.

**Hasilnya:** layar **Daftar Perangkat**. Di tab **Network** ada dua baris `login`, satu bertipe `preflight` berstatus 204 dan satu bertipe `fetch` berstatus 200 (urutannya bisa tertukar), lalu **satu** baris `devices` berstatus 200: hidangan tanpa guncangan `StrictMode`. Edge bisa menambah satu baris `data:image/svg+xml;…`; abaikan.

**Syarat 2: bacaan terbaru semua sensor, dari API.**

6. Klik kartu Node 1 (jalur laptop: **Latihan ruang tamu**, `f00d00000001`).

**Hasilnya:** judul berisi nama perangkat dan lencana `kunci`-nya, baris lokasi dan `device_id`, baris kecil seperti `node1 · online · diperbarui pukul … WIB`, lalu kartu-kartu sensor seperti tabel Praktik 6.2. Di tab **Network** bertambah tepat satu baris `latest` berstatus 200.

7. Cocokkan dengan API, kali ini tanpa Bruno: klik baris `latest`, lalu tab **Preview** (namanya sama di Chrome dan Edge). Buka `telemetry` dan periksa dengan pasangan di tabel Praktik 6.4: setiap kolom sensor punya kartunya, angkanya sama persis, `null` tampil "—", dan jam `diperbarui pukul … WIB` sama dengan `ts` ditambah 7 jam.
8. **Jalur perangkat:** klik **← Kembali ke daftar**, buka Node 2, lalu cocokkan dengan cara yang sama. **Jalur laptop:** tidak ada Node 2; cukup dibaca.

Kalau tampil catatan belum ada bacaan sejak backend dinyalakan, tunggu kiriman berikutnya, lalu buka lagi dari daftar (Praktik 6.3).

**Syarat 3: rapi di layar HP.**

9. Biarkan detail terbuka. Nyalakan mode perangkat (**Ctrl + Shift + M**; macOS: **Cmd + Shift + M**), pilih **Responsive**, lalu ketik lebar `375` (Praktik 7.1).
10. Di tab **Console**, jalankan `document.documentElement.scrollWidth`. Jawabannya harus `375`. Periksa juga: kartu sensor dua kolom dan utuh, judul panjang turun baris, dan kepala dua baris (judul `Rumah Pintar Mini`, lalu nama akun dan **Keluar**).
11. Klik **← Kembali ke daftar**: kartu satu kolom, nama terlalu panjang dipotong `…`. Jalankan lagi `scrollWidth`, buka lagi detail Node 1 (jalur laptop: `f00d00000001`), lalu jalankan sekali lagi. Ketiganya harus `375`.

**Kamu lulus langkah ⭐ ini** kalau ketiga syarat terpenuhi dalam sekali jalan, pada hasil `npm run build` yang disajikan `npm run preview`: (1) *login* dengan akun Modul 20 membawamu ke **Daftar Perangkat**; (2) detail Node 1 dan Node 2 (jalur laptop: `f00d00000001`) menampilkan kartu untuk semua sensor di `telemetry`, dengan angka yang sama persis dengan tab **Preview** dan jam WIB yang benar; dan (3) di lebar 375 px, `scrollWidth` bernilai `375` di daftar maupun di detail, semua kartu utuh, dan kepala halaman tidak meluber. Itulah syarat lulus Modul 22.

> [!TIP]
> **Ingin menyimpan tangkapan layar gladi sebagai bukti?** Ambil sesudah *login* selesai, dan pastikan tab **Payload** dan panel **Application** tidak ikut terpotret. Keduanya memperlihatkan sandi dan isi *cookie*-mu apa adanya (Praktik 4.4).

Selesai gladi, matikan mode perangkat dan hentikan hidangan (**Ctrl + C**). Untuk mengubah kode lagi, nyalakan dapurnya (`npm run dev`); keduanya memakai port yang sama, jadi nyalakan salah satu saja.

#### 8.5 Simpan ke cabang (8 menit)

Di terminal kosong (folder `frontend`, cabang `fitur/dashboard`), periksa apa yang berubah:

```text
git status
```

Ada tiga berkas `modified:`, yaitu `package-lock.json`, `package.json`, dan `vite.config.ts`, tanpa berkas baru. `dist` tidak disebut karena diabaikan `.gitignore`. Kalau `dist/` atau `.env.local` ikut muncul, periksa `.gitignore`-mu dulu (Praktik 2.5). Lalu simpan:

```text
git add package.json package-lock.json vite.config.ts
git commit -m "Dashboard v0.1.0: preview di port 5173, lint dan build bersih (Modul 22 Praktik 8)"
```

Semua kode Modul 22 kini tersimpan di cabang `fitur/dashboard`; cocokkan dengan [`kode/frontend/`](kode/frontend/) kalau ada yang tidak berjalan. Yang masih berbeda hanya `README.md` (punyamu masih README templat berbahasa Inggris; ➕ A menggantinya). Belum perlu `git push`: cabangnya dikirim di ➕ C bersama *pull request*-nya. Kalau ingin berhenti dulu, hentikan setiap terminal dengan **Ctrl + C**; kontainer database boleh tetap menyala.

> ⬆️ **Selesai Praktik 8?** Dashboard v0.1.0-mu bersih menurut oxlint, lolos *build*, dan lulus gladi bersih syarat lulus. Lanjut ke [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini): di sana `frontend/README.md` ditulis, templat *pull request* mendapat butir **(Modul 22)**, dan semua pekerjaan minggu ini digabung ke `main` lewat *pull request* "dashboard v0.1". [🧩 Tantangan mandiri](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip dengan masalahmu (masalah backend, database, broker, dan simulator ada di 🚨 Modul 16–21). Sebelumnya, lirik empat tempat ini:

1. **Terminal backend**: masih menyala (`Server listening at http://127.0.0.1:8080`), baris terakhirnya bukan galat?
2. **Terminal `frontend`**: Vite menyala di `Local: http://localhost:5173/`?
3. **Bilah alamat**: `localhost:5173`, bukan `127.0.0.1:5173`, `localhost:5174`, `localhost:4173`, atau `file:///…`?
4. **Tab Console** (**F12**): baris merahnya hampir selalu menyebut penyebab yang di layar hanya ditulis umum.

Masih buntu? Bandingkan berkasmu dengan [`kode/tahap/`](kode/tahap/) di akhir praktik yang sama.

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (create-vite 9.3.1, React 19, Tailwind CSS v4)</b></summary>

Tutorial internet untuk versi lama bisa gagal, atau diam-diam merusak, di proyek kita. Ganti kolom kiri dengan kolom tengah:

| Petunjuk lama | Yang benar untuk versi kita | Kenapa |
| :--- | :--- | :--- |
| `npx create-react-app dashboard` | `npm create vite@9.3.1 frontend -- --template react-ts` | Konsep 4 |
| `npm start`, port 3000 | `npm run dev`, `http://localhost:5173` | 3000 tak ada di `CORS_ORIGIN` (Konsep 9) |
| Vite pindah ke port `5174` | `server: { port: 5173, strictPort: true },` di `vite.config.ts` | Praktik 2.5 |
| `http://127.0.0.1:5173` | `http://localhost:5173` | Bagi *cookie*, dua situs (Konsep 9) |
| `.eslintrc`, paket ESLint | `npm run lint` (**oxlint**) | Praktik 8.1 |
| `src/vite-env.d.ts` | Tidak perlu | `"types": ["vite/client"]` (Konsep 4) |
| `npx tailwindcss init -p`, `tailwind.config.js`, `postcss.config.js`, `autoprefixer` | `npm install tailwindcss@4.3.3 @tailwindcss/vite@4.3.3`, lalu `tailwindcss()` di `vite.config.ts` | v4 mencari sendiri kelasnya (Konsep 3) |
| `@tailwind base;` `@tailwind components;` `@tailwind utilities;` | `@import "tailwindcss";` di `src/index.css` | Praktik 2.4 |
| `focus:outline-none` | `focus:outline-hidden` | `outline-none` v4 menghapus garis fokus sama sekali, juga di mode kontras tinggi |
| `hover:shadow` pada `shadow-sm` | `hover:shadow-md` | Di v4, `hover:shadow` tidak berbeda dari `shadow-sm` |
| Tombol otomatis berkursor tangan | `cursor-pointer` (kartu `DaftarPerangkat.tsx`) | v4 tak lagi memberi `cursor: pointer` pada `<button>` |
| `ReactDOM.render(<App />, …)` | `createRoot(…).render(…)` di `src/main.tsx` | Hilang di React 19 |
| `import React from "react"` | Tidak perlu | `"jsx": "react-jsx"`; impor tak terpakai = `TS6133` |
| `class="…"` di JSX | `className="…"` | ``Invalid DOM property `class`. Did you mean `className`?`` |
| `enum Status { Online, Offline }` | `"online" \| "offline"` | `TS1294` (Konsep 6) |
| `import { Perangkat } from "../types";` | `import type { Perangkat } from "../types";` | `TS1484` (Konsep 6) |
| `FormEvent<HTMLFormElement>` | `SubmitEvent<HTMLFormElement>` + `import type { SubmitEvent } from "react";` | Usang di @types/react 19.3 |
| `process.env.REACT_APP_API_URL` | `import.meta.env.VITE_API_BASE` (biasanya kosong) | Konsep 9 |
| Token di `localStorage` | *Cookie* `HttpOnly` dari backend | XSS (Konsep 9) |
| `fetch(url)` polos, `axios` + `withCredentials` | `credentials: "include"` lewat `minta()` | Praktik 4.2 |
| Proksi Vite (`server.proxy`) | Panggil backend langsung | CORS disiapkan Modul 20; jebakan proksi di [🔬](#-bedah-teknis-opsional) |
| `react-router-dom` | *State* `tampilan` di `App` | Modul 24 |
| `npm run dev -- --host` untuk HP | Mode perangkat DevTools | Aturan aman; HP sungguhan di 🔬 |

</details>

<details>
<summary><b>Node.js terlalu lama: Vite menulis <code>Vite requires Node.js version 20.19+ or 22.12+</code>, atau <code>node generate-dummy.js</code> tidak mencetak apa pun</b></summary>

**Sebab:** Node.js-mu lebih tua dari Node.js 24 (Modul 4). Vite 8, create-vite 9.3.1, dan oxlint butuh 20.19+ atau 22.12+; `generate-dummy.js` butuh 24.2+ (atau 22.18+) karena `import.meta.main`. Dengan Node.js 22.17, penulis melihat Vite menyala, tetapi `generate-dummy.js` diam.

**Langkah:** `node --version` harus `v24…`. Kalau tidak, pasang Node.js 24 seperti di Modul 4 Praktik 3, tutup VS Code **sepenuhnya**, buka lagi, periksa ulang (rincian dan macOS lama: [🚨 Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md#-kalau-tidak-jalan)). Abaikan galat lain sesudah peringatan Vite sampai versinya beres.

**create-vite menanyakan hal di luar Praktik 2.2?** Biasanya folder `frontend` sudah ada dari percobaan lama: **Ctrl + C**, hapus atau ganti nama folder itu, ulangi.

</details>

<details>
<summary><b><code>npm run dev</code> berhenti dengan <code>Port 5173 is already in use</code>, atau Vite pindah sendiri ke port <code>5174</code></b></summary>

**Gejala:** dengan `server: { port: 5173, strictPort: true },` (Praktik 2.5), terminal menulis `error when starting dev server:`, lalu `Error: Port 5173 is already in use` dan lima baris jejak `at …`. Tanpa baris itu, Vite menulis `Port 5173 is in use, trying another one...`, pindah ke `http://localhost:5174/`, dan semua permintaan ke backend gagal (Console: `from origin 'http://localhost:5174'`).

**Sebab:** hampir selalu **Vite lain** yang terlupa: di terminal lain, terminal Praktik 2.2 (kalau kamu menjawab **Yes** di `Install with npm and start now?`), `npm run preview`, atau jendela VS Code lain.

**Langkah:** pasang baris itu kalau belum (Praktik 2.5 langkah 3). Klik satu per satu terminal di daftar kanan panel terminal; yang menampilkan `Local: http://localhost:5173/` dihentikan dengan **Ctrl + C**, lalu `npm run dev` lagi. Masih bentrok? Windows: `netstat -ano | findstr :5173` (angka terakhir di baris `LISTENING` = nomor proses, PID), lalu `taskkill /PID 23188 /F` (ganti 23188 dengan PID-mu). macOS: `sudo lsof -nP -iTCP:5173 -sTCP:LISTEN`, lalu `kill` dengan PID di kolom kedua. Jangan menambah port lain ke `CORS_ORIGIN`.

</details>

<details>
<summary><b><code>http://127.0.0.1:5173</code> tidak bisa dibuka (<code>ERR_CONNECTION_REFUSED</code>), padahal Vite menyala</b></summary>

**Gejala:** Edge menulis `Hmmm… can't reach this page`, Chrome `This site can’t be reached`, dengan `127.0.0.1 refused to connect.` dan kode `ERR_CONNECTION_REFUSED` (Indonesia: `Hmmm… tidak dapat menjangkau halaman ini`/`Situs ini tidak dapat dijangkau`, `…menolak untuk tersambung.`/`…terhubung.`).

**Sebab:** bukan CORS; tak ada yang menjawab di alamat itu. Vite bawaan mendengarkan `localhost`, yang di laptop Windows penulis hanya alamat IPv6 `[::1]` (`netstat` hanya menunjukkan `[::1]:5173`), sedangkan `127.0.0.1` alamat IPv4. Di macOS mungkin terbuka; penulis hanya menguji Windows.

**Langkah:** buka **`http://localhost:5173`**, supaya halaman dan API satu situs (Konsep 9). Untuk menguji `127.0.0.1`, jalankan `npm run dev -- --host 127.0.0.1`: `api.ts` memanggil `http://127.0.0.1:8080` dan *login* berhasil (dicoba penulis), tetapi kamu harus masuk lagi. Sesudahnya, kembali ke `npm run dev`. Jangan menulis `--host` tanpa alamat: dapur Vite terbuka ke seluruh jaringan (aturan aman nomor 4).

</details>

<details>
<summary><b>Layar putih kosong, atau kotak galat Vite menutupi halaman (<code>Failed to resolve import …</code>)</b></summary>

**Kotak galat Vite.** **Sebab:** Vite gagal menerjemahkan kodemu; baris atas kotak (juga `[vite] Internal server error: …` di terminal `frontend`) menyebut penyebab, berkas, dan barisnya. Tersering: `[plugin:vite:import-analysis] Failed to resolve import "./App.css" from "src/App.tsx". Does the file exist?`, karena `App.css` terhapus sebelum `App.tsx` diganti, atau jalur impor salah ketik (`./component/Login`). Tag yang belum ditutup (Auto Save, Praktik 3.3) juga memunculkannya. **Langkah:** ganti `App.tsx` dulu (Praktik 2.5 langkah 1), betulkan jalurnya, atau selesaikan ketikan; kotaknya hilang sendiri. Menutupnya (`Click outside, press Esc key, or fix the code to dismiss.`) hanya menyembunyikan masalah.

**Layar putih tanpa kotak.** **Sebab:** kode gagal saat berjalan. **Langkah:** baca baris merah teratas di **Console**. `Target container is not a DOM element.`: `<div id="root"></div>` di `index.html` hilang (cocokkan dengan [`kode/tahap/praktik-2/frontend/index.html`](kode/tahap/praktik-2/frontend/index.html)). `Cannot read properties of null (reading 'length')` + `An error occurred in the <DetailPerangkat> component.`: komponen membaca isi `null`, misalnya `perangkat.nama.length`; tautan di kanan baris merah membawamu ke kodenya. Alamatnya `file:///…`? Lihat masalah `file://`.

</details>

<details>
<summary><b>Tailwind tidak berpengaruh: judul hitam polos di latar putih, atau satu kelas tidak berefek</b></summary>

**Semua kelas tak berefek.** **Sebab:** satu langkah Praktik 2.4 terlewat. **Langkah:** periksa berurutan, lalu nyalakan ulang Vite dan tekan **F5**:

1. `frontend/package.json` memuat `"tailwindcss": "^4.3.3"` dan `"@tailwindcss/vite": "^4.3.3"`. Tidak ada? Mungkin terpasang di folder lain: di `backend`, batalkan dengan `npm uninstall tailwindcss @tailwindcss/vite`; di `rumah-pintar-mini`, hapus `package.json`, `package-lock.json`, dan `node_modules` yang baru muncul. Ulangi pemasangan di folder `frontend`.
2. `vite.config.ts` memuat `import tailwindcss from '@tailwindcss/vite'` dan `plugins: [react(), tailwindcss()],`.
3. `src/index.css` berisi `@import "tailwindcss";`, dan `src/main.tsx` memuat `import './index.css'`.

**Satu kelas tak berefek.** Klik kanan → **Inspect**, cari kelasnya di **Styles**. Tanpa aturan: salah ketik (`text-teal-70`), nama disambung (`"bg-" + warna`, Konsep 3), atau nama v3 (tabel pembuka). Aturannya dicoret: kelas lain mengatur hal yang sama; pakai satu. `hover:` tak muncul di HP: di v4 hanya aktif di perangkat berkursor (Konsep 11). Di `kartu.html` dan Praktik 1, kelas Tailwind memang tak berefek (tanpa *plugin*, Konsep 3).

</details>

<details>
<summary><b>Tab Components dari React DevTools tidak muncul</b></summary>

Periksa berurutan:

1. **Belum dimuat ulang.** Tutup DevTools, **F5** di tab `http://localhost:5173`, buka lagi DevTools (Praktik 2.6).
2. **Tersembunyi** di balik tanda **»** kalau DevTools sempit.
3. **Tabnya ada, tetapi hanya bertuliskan `Looks like this page doesn't have React, or it hasn't been loaded yet.`** React DevTools 8.0.0 memasang tabnya di setiap halaman; di halaman tanpa React (`kartu.html`, Praktik 1), tulisan itu wajar. Pastikan kamu di tab dashboard.
4. **Ekstensi tidak aktif.** Console masih menulis `Download the React DevTools for a better development experience: …`? Berarti React **tidak** menemukan ekstensinya: terpasang di browser atau profil lain, dimatikan di `chrome://extensions` (`edge://extensions`), atau kamu di jendela penyamaran. Untuk jendela itu, di halaman ekstensi klik **Details** → **Allow in Incognito** (Chrome Indonesia: **Izinkan dalam mode Samaran**) atau **Allow in InPrivate** (Edge Indonesia: **Izinkan di InPrivate**).
5. **Terlalu lama.** Console menulis `The installed version of React DevTools is too old and will not work with the current version of React. …`: perbarui ekstensinya.

Langkah ⭐ tidak memakai React DevTools, jadi jangan terhenti di sini.

</details>

<details>
<summary><b><code>npm run build</code> gagal karena galat tipe (<code>TS1484</code>, <code>TS1294</code>, <code>TS6133</code>, <code>TS2315</code>, …), padahal <code>npm run dev</code> normal</b></summary>

**Sebab:** di `npm run dev`, Vite hanya menghapus label tipe; `tsc -b` di awal `npm run build` yang memeriksanya (Konsep 4). Panel **Problems** VS Code memuat galat yang sama. **Langkah:** cari kodenya, betulkan, ulangi `npm run build`:

| Kode | Pesan (contoh) | Penyebab → obat |
| :--- | :--- | :--- |
| `TS1484` | `'Perangkat' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.` | Tipe diimpor tanpa `type` → `import type { Perangkat } from "../types";` |
| `TS1294` | `This syntax is not allowed when 'erasableSyntaxOnly' is enabled.` | `enum`, atau `constructor(public kode: number, …)` → `"online" \| "offline"`, dan kolom *class* ditulis terpisah seperti `GalatApi` (Praktik 4.2) |
| `TS6133` | `'useState' is declared but its value is never read.` | Impor, variabel, atau parameter tak terpakai (mis. sisa templat, `import React`) → hapus atau pakai; kerabatnya `TS6192`, `TS6196` |
| `TS2315` | `Type 'SubmitEvent' is not generic.` | `SubmitEvent` tidak diimpor dari `react`, jadi yang terpakai versi browser → `import type { SubmitEvent } from "react";` (Praktik 4.3) |
| `TS2307` | `Cannot find module './components/Lencan' or its corresponding type declarations.` | Jalur salah ketik (huruf besar-kecil dihitung), atau paket belum terpasang di `frontend` |

`TS2551` (nama kolom salah ketik) sudah kamu temui di Praktik 3.4. `npm run lint` (Praktik 8.1) memeriksa kebiasaan rawan, misalnya `useState` di dalam `if` (`react/rules-of-hooks`). Kalau oxlint meminta nilai ditambahkan ke daftar dependensi efek, tambahkan (seperti `[onSesiHabis]`); jangan mengosongkannya menjadi `[]`.

</details>

<details>
<summary><b>Kotak merah <code>Tidak bisa menghubungi server di …</code>: backend mati, atau ditolak CORS? Buka tab Console</b></summary>

**Gejala:** `Tidak bisa menghubungi server di http://localhost:8080. Mungkin backend belum menyala, atau halaman ini dibuka dari alamat yang tidak diizinkan backend (buka http://localhost:5173, lihat CORS_ORIGIN).`

**Sebab:** `fetch` gagal total (kode 0). Dashboard **tidak bisa** membedakan dua kemungkinan itu, karena browser sengaja tidak memberi tahu JavaScript mengapa permintaan lintas asal gagal (Praktik 1.6, 4.5). Bedanya terlihat di baris merah **Console**:

| Baris merah memuat… | Artinya → langkah |
| :--- | :--- |
| `net::ERR_CONNECTION_REFUSED` | Tak ada yang menjawab: backend mati atau port salah → lihat terminal backend, `npm run dev` lagi. Alamat di pesan bukan `http://localhost:8080`? Periksa `VITE_API_BASE` di `.env.local`. |
| `has been blocked by CORS policy` + `No 'Access-Control-Allow-Origin' header is present on the requested resource` | Backend menjawab (log-nya tetap mencatat `GET /auth/me`), tetapi browser menahan jawabannya: asal sesudah `from origin` tidak ada di `CORS_ORIGIN` → lihat di bawah. |
| `Response to preflight request doesn't pass access control check` | Sama, tertahan di *preflight* `OPTIONS` saat **Masuk**; `POST /auth/login` tidak dikirim. |
| `net::ERR_FAILED` | Pendamping galat CORS di dekatnya. |

**Langkah menurut asal:** `http://localhost:5174` → masalah port 5173; `http://localhost:4173` → masalah `npm run preview`; `http://127.0.0.1:5173` → buka `http://localhost:5173`; `null` → masalah `file://`; `http://192.168.…:5173` → HP sungguhan, ikuti 🔬. Nilai bawaan `CORS_ORIGIN` sudah cukup untuk modul ini.

**Jangan:** `CORS_ORIGIN=*` (ditolak browser untuk permintaan ber-*cookie*); `mode: "no-cors"` (jawabannya jadi *opaque*: kepala dan isinya tak terbaca JavaScript); ekstensi "pembuka CORS" (melonggarkan perlindungan semua situs); mengubah `keamanan.ts` (backend tidak diubah minggu ini).

</details>

<details>
<summary><b><i>Login</i> berputar: <code>POST /auth/login</code> dijawab 200, tetapi kamu kembali ke formulir <i>login</i> dengan pesan <code>Sesi sudah habis. Silakan masuk lagi.</code></b></summary>

**Gejala** (rekaman penulis, Chrome dan Edge, `VITE_API_BASE=http://127.0.0.1:8080`): `Sedang masuk…`, `Memuat perangkat…` sekejap, lalu formulir dengan pesan itu. **Network**: `login` *preflight* 204, `login` 200, `devices` 401 dua kali, `refresh` 401. (Di Praktik 4: salam muncul, tetapi **Cookies** di **Application** kosong.)

**Sebab:** nama host halaman berbeda dengan nama host API (Konsep 9), jadi browser menolak menyimpan gelang dan kartu terusan `SameSite=Strict` dari situs lain. Permintaan berikutnya dan *refresh* pun 401.

**Langkah:**

1. Pastikan: **Network** → baris `login` (200) → tab **Cookies**. Di `Response cookies`, `akses` dan `sesi` berlatar kuning; ikon (i) di kolom SameSite menulis `This attempt to set a cookie via a "Set-Cookie" header was blocked because it had the "SameSite=Strict" attribute but came from a cross-site response which was not the response to a top-level navigation`.
2. Hapus `frontend/.env.local`, atau beri `#` di depan `VITE_API_BASE` seperti di `.env.example`.
3. Nyalakan ulang Vite supaya `.env.local` pasti terbaca ulang, buka **`http://localhost:5173`**, masuk lagi.

`VITE_API_BASE` perlu diisi? Samakan nama host-nya: `http://localhost:8081`, bukan `http://127.0.0.1:8081`. Pesan itu muncul sesudah dashboard lama dibiarkan (kartu terusan lewat 7 hari)? Wajar: masuk lagi.

</details>

<details>
<summary><b>Halaman yang dibuka dengan klik dua kali (<code>file:///…</code>): asal <code>null</code>, <code>403</code> <code>permintaan dari halaman null ditolak</code>, atau halaman putih</b></summary>

**Sebab:** halaman `file:///…` berasal `null` (Praktik 1.6), dan backend tidak mempercayainya. `POST` biasa ditolak satpam: **403** `{"pesan":"permintaan dari halaman null ditolak"}` (Bruno dan curl tidak terkena, karena bukan browser). `fetch` JSON tertahan di *preflight* (`from origin 'null'`, `has been blocked by CORS policy`). `dist/index.html` yang diklik dua kali putih, karena `/assets/…` dicari dari akar *disk* ([🔬 Bedah Teknis](#-bedah-teknis-opsional), bagian `dist/`).

**Langkah:** semua yang berbicara dengan backend disajikan Vite di `http://localhost:5173`; hasil *build* dibuka lewat `npm run preview` (Praktik 8.2). Jangan menambahkan `null` ke `CORS_ORIGIN`: setiap berkas dari folder mana pun, juga halaman ber-*sandbox* yang bisa dipasang situs mana pun, berasal `null`, dan satpam ikut meloloskan `POST` mereka karena memakai daftar yang sama. MDN pun berpesan agar `null` tidak dipakai.

</details>

<details>
<summary><b>Tab Console menampilkan baris merah <code>401 (Unauthorized)</code> atau <code>404 (Not Found)</code>, padahal dashboard berjalan normal</b></summary>

**Sebab:** browser mencatat **setiap** jawaban berkode galat sebagai baris merah, walaupun kodemu menangkapnya. Bentuknya `GET http://localhost:8080/auth/me 401 (Unauthorized)`, dengan berkas dan baris pemanggil `fetch` di ujung kanan, misalnya `api.ts:52` (`api.ts:24` untuk *refresh*), atau `index-….js:9` di hasil *build*. Yang **normal**:

- **Sebelum *login*:** `GET …/auth/me 401 (Unauthorized)` (dua kali di mode pengembangan), lalu `POST …/auth/refresh 401 (Unauthorized)`; formulir tampil tanpa kotak galat.
- **Sandi salah:** `POST …/auth/login 401 (Unauthorized)` (Praktik 4.5).
- **Gelang habis atau `akses` dihapus (Praktik 6.5):** `GET …/latest 401 (Unauthorized)` (dua kali di mode pengembangan), lalu *refresh* 200 tanpa baris merah, dan permintaannya diulang.
- **Detail tanpa bacaan:** `GET …/devices/f00d00000002/latest 404 (Not Found)` (dua kali di mode pengembangan).

**Langkah:** biarkan. Yang **tidak** normal: `net::ERR_…`, `blocked by CORS policy`, baris berawalan `Uncaught`, dan `Each child in a list should have a unique "key" prop.` (Konsep 5).

</details>

<details>
<summary><b>Setiap permintaan tampil dua kali di tab Network dan di log backend (<code>GET /auth/me</code>, <code>GET /devices</code>, <code>GET …/latest</code>)</b></summary>

**Sebab:** normal di mode pengembangan: `<StrictMode>` di `src/main.tsx` memasang, mencopot, lalu memasang lagi setiap komponen, jadi efek berjalan dua kali (Konsep 8, 🔬); `ignore` memastikan hanya jawaban efek kedua yang dipakai. Di log backend penulis: `GET /auth/me` dan `GET /devices` dua kali di `npm run dev`, sekali di `npm run preview`; `POST /auth/login` selalu sekali (dari `onSubmit`, bukan efek); `POST /auth/refresh` biasanya sekali, kadang dua kali di mode pengembangan.

**Langkah:** biarkan `<StrictMode>`. Jumlah yang sungguh dikirim ke pengguna terlihat di `npm run preview` (Praktik 8.2).

</details>

<details>
<summary><b>Daftar perangkat kosong: <code>Belum ada perangkat terdaftar (pendaftaran perangkat: Modul 21).</code></b></summary>

**Sebab:** daftar dibaca backend dari **database**, bukan dari perangkat yang menyala (mematikan simulator tidak mengosongkannya). Jadi database-nya memang kosong.

**Langkah:**

1. Di Bruno, kirim **`login viewer`**, lalu **`daftar perangkat`**. Juga `[]`? Masalahnya di backend atau database.
2. Log backend saat menyala menulis `daftar perangkat dimuat: … perangkat terdaftar`. Nol? Periksa `DATABASE_URL` di `backend/.env` dan kontainer di Docker Desktop: harus `rumahpintar-db` dari Modul 17–21.
3. Belum terdaftar? Daftarkan Node 1, Node 2, dan `f00d00000001` seperti di [Modul 21 Praktik 1.9](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#19-daftarkan-perangkatmu-10-menit), lalu **F5**.

Kotak merah `database sedang tidak bisa dihubungi, coba lagi sebentar lagi` berarti database mati: nyalakan `rumahpintar-db`, lalu muat ulang.

</details>

<details>
<summary><b>Detail perangkat tanpa kartu: <code>Belum ada bacaan dari perangkat ini sejak backend dinyalakan.</code>, <code>Perangkat ini belum terdaftar…</code>, atau <code>…selama kuncinya dicabut.</code></b></summary>

**Sebab:** `GET /devices/:id/latest` dijawab **404**. Bacaan terbaru disimpan di **memori** backend (kosong lagi tiap backend dinyalakan ulang, Konsep 10) dan hanya diterima dari perangkat terdaftar yang kuncinya sah (Modul 21). Pesannya mengikuti lencana `kunci`:

| Lencana | Pesan | Langkah |
| :--- | :--- | :--- |
| **kunci aktif**, **lewat penghubung** | `Belum ada bacaan dari perangkat ini sejak backend dinyalakan. Tunggu kiriman berikutnya, lalu buka lagi.` | Nyalakan simulator atau Node 1 (Node 2 lewat Node 1), tunggu ±10 detik, lalu ketuk perangkatnya lagi: dashboard v0.1 tidak menyegarkan sendiri. |
| **belum terdaftar** | `Perangkat ini belum terdaftar, jadi kirimannya diabaikan backend (daftarkan dulu seperti di Modul 21).` | Menunggu percuma. Di jalur laptop, pilih `f00d00000001`, bukan `f00d00000002`. |
| **kunci dicabut** | `Tidak ada bacaan tersimpan dari perangkat ini, dan bacaan baru tidak akan datang selama kuncinya dicabut.` | Pakai lagi dengan kunci baru ([Modul 21 Praktik 7.4](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#74-papannya-ketemu-pulihkan-dengan-kunci-baru-12-menit)). |

Bruno (**`bacaan terbaru Node 1`**, `device_id` yang sama) juga 404? Dashboard-mu benar.

</details>

<details>
<summary><b>Kartu menampilkan <code>—</code>, atau kartu yang kamu harapkan tidak muncul</b></summary>

- **`—` abu-abu tanpa satuan:** backend mengirim `null`, karena sensornya gagal dibaca (aturan 7). Dashboard-mu benar; cek di Bruno (**`bacaan terbaru Node 1`**), lalu periksa sensornya di 🚨 modul pemasangnya. Angka `0` tetap tampil `0`.
- **`—` gelap dengan satuan:** kolomnya tidak ada (`undefined`), biasanya nama kolom salah ketik di kode (`kelembaban`, Praktik 3.4); VS Code dan `npm run build` menangkapnya.
- **Kartu tak muncul:** kartu hanya dibuat untuk kolom yang dikirim (Praktik 6): trio RS-485 butuh sensor tanah Modul 15, `Baterai` butuh pengukur baterai Node 2, `Lampu` dan `Kipas` butuh `state` dari Node 1, dan Node 2 tak punya `Cahaya`, `Gerakan`, `Air tandon`. Cocokkan dengan `telemetry` di Bruno.

</details>

<details>
<summary><b><code>npm run preview</code> bermasalah: <i>login</i> ditolak di <code>http://localhost:4173</code>, <code>Port 5173 is already in use</code>, atau <code>The directory "dist" does not exist</code></b></summary>

- **`The directory "dist" does not exist. Did you build your project?`** Belum `npm run build`, atau *build* gagal (masalah galat tipe). *Build* sampai `✓ built in …`, baru `npm run preview`; sesudah mengubah kode, *build* lagi.
- **`error when starting preview server:` lalu `Error: Port 5173 is already in use`.** `npm run dev` masih menyala di port yang sama: hentikan dengan **Ctrl + C**.
- **Alamat `http://localhost:4173/`.** Formulir langsung menampilkan pesan kode 0, Console menyebut `from origin 'http://localhost:4173'`, dan **Masuk** tertahan di *preflight* (dicoba penulis di Edge). Port bawaan `vite preview` itu tidak ada di `CORS_ORIGIN`: tambahkan `preview: { port: 5173, strictPort: true },` di bawah baris `server` seperti Praktik 8.2 ([`kode/frontend/vite.config.ts`](kode/frontend/vite.config.ts)). Jangan menambahkan 4173 ke `CORS_ORIGIN`.

</details>

<details>
<summary><b>Di HP atau browser yang lama, dashboard tampil tanpa gaya</b></summary>

**Sebab:** Tailwind CSS v4 hanya mendukung **Chrome 111+**, **Safari 16.4+**, dan **Firefox 128+** (Konsep 11); browser lebih tua menampilkan dashboard polos. Mode perangkat DevTools tetap memakai browser laptopmu, jadi masalah ini hanya muncul di HP sungguhan (🔬, pilihan).

**Langkah:** perbarui browser HP (Chrome lewat Play Store; Safari ikut iOS 16.4+), atau pakai HP lain. Syarat lulus tetap diperiksa dengan mode perangkat (Praktik 7).

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: isinya "mengapa" yang lebih dalam dan pilihan lain di dunia kerja. Hanya bagian **HP sungguhan** yang mengubah setelan, dan itu pun pilihan.

<details>
<summary><b><i>Virtual DOM</i>: apa yang terjadi saat React menggambar ulang (<i>render</i> dan <i>commit</i>)</b></summary>

Tutorial sering menyebut ***Virtual DOM***, sedangkan react.dev sendiri menyebut tiga langkah: **pemicu** (*trigger*), ***render***, dan ***commit***.

1. **Pemicu:** tampilan pertama (`createRoot(…).render(…)` di `main.tsx`) atau *state* yang berubah, misalnya saat `DaftarPerangkat` menyimpan jawaban `GET /devices`.
2. ***Render*:** React memanggil komponenmu. Setiap tag JSX dikompilasi menjadi panggilan `jsx(…)` yang menghasilkan **objek JavaScript biasa**. Uji penulis dengan React 19.3.1 (dipersingkat):

   ```text
   jsx("p", { className: "text-sm", children: "Suhu" })
   → { type: "p", key: null, props: { className: "text-sm", children: "Suhu" }, … }
   ```

   Pohon objek inilah yang disebut *Virtual DOM*: murah dibuat, dan layar belum berubah.
3. ***Commit*:** React membandingkan hasil *render* baru dengan yang sebelumnya, lalu hanya mengubah simpul DOM yang berbeda.

Di Praktik 1.5, kamu sendiri yang mengganti `textContent`; untuk puluhan kartu, itu mudah keliru. Dua kebiasaan modul ini melayani *commit*: `key` berisi `device_id` memberi tahu React kartu mana yang mana (Konsep 5), dan `key` yang berganti pada `DetailPerangkat` (Praktik 6.1) membuat React menganggapnya komponen **lain**, jadi *state* lama dibuang tanpa dikosongkan di dalam efek.

Ingin melihatnya? Sesudah `npm run build`, buka berkas `.js` di `dist/assets/` dengan VS Code, lalu cari (**Ctrl + F**) `.jsx)(`. Hasilnya berbentuk `(0,x.jsx)(…)`; hurufnya bisa berbeda.

</details>

<details>
<summary><b>Satu tipe untuk backend dan frontend: <i>monorepo</i> sederhana dengan npm <i>workspaces</i></b></summary>

Di Praktik 3, `src/types.ts` **disalin** dari Lampiran A. Backend punya salinannya sendiri di `backend/src/schemas/kontrak.ts`: skema Zod yang tipenya diturunkan dengan `z.infer` (Modul 16):

```ts
export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
```

Kalau backend menambah kolom dan `types.ts` lupa diperbarui, TypeScript di frontend tidak tahu; penjaganya hanya aturan `KONTRAK-DATA.md`. Jalan keluar di dunia kerja: ***monorepo*** (satu repositori, beberapa paket yang saling memakai) dengan npm ***workspaces***. Garis besarnya (**cukup dibaca**):

1. `package.json` di akar `rumah-pintar-mini` mendaftar `"workspaces": ["backend", "frontend", "kontrak"]`.
2. Paket `kontrak/` (`npm init -w ./kontrak`) menampung skema Zod dan tipe `z.infer`. `npm install` di akar menautkannya (*symlink*) ke `node_modules` akar, sehingga backend dan frontend bisa mengimpornya (dengan sedikit setelan).
3. Backend memakai **skemanya**; frontend hanya **tipenya**: `import type { TelemetryNode1 } from "kontrak";`. Impor `type` dibuang saat kompilasi (`verbatimModuleSyntax`), jadi tidak ada Zod yang ikut ke browser. Skrip pun bisa dijalankan dari akar (`npm run dev --workspace=backend`).

Mengapa modul ini tetap menyalin? Setiap folder tetap bisa dijalankan sendiri, seperti Modul 16–21. Backend (Node.js langsung, TypeScript 7.0.2, impor berakhiran `.ts`) dan frontend (TypeScript 6.0.3, impor tanpa ekstensi) adalah dua dunia yang penyatuannya belum diuji penulis. Lagi pula, skema `GET /devices` menulis `status` sebagai `z.string()`, sedangkan `types.ts` lebih teliti (empat pilihan). Zod baru masuk ke frontend di Modul 24.

</details>

<details>
<summary><b>Mengapa efek berjalan dua kali: <code>StrictMode</code> di mode pengembangan</b></summary>

`<StrictMode>` di `src/main.tsx` sengaja **mengguncang** komponenmu selama `npm run dev`: setiap komponen dipasang, dibongkar (*cleanup* efek dijalankan), lalu dipasang lagi, seperti **gladi evakuasi**, jadi setiap efek berjalan dua kali, juga efek dengan `[]`. Fungsi komponen dan pengubah seperti `n => n + 1` juga dipanggil dua kali untuk memergoki yang tidak murni. Semua itu **hanya di mode pengembangan**; hasil *build* mengirim satu permintaan.

Begini efek `GET /devices` di `DaftarPerangkat` (Praktik 5) berkat variabel `ignore` (Konsep 8):

```text
pasang   → efek ke-1 : ignore-nya false, GET /devices ke-1 berangkat
bongkar  → cleanup ke-1 : ignore milik efek ke-1 menjadi true
pasang   → efek ke-2 : ignore baru false, GET /devices ke-2 berangkat
jawaban ke-1 tiba → ignore-nya true  → dibuang
jawaban ke-2 tiba → ignore-nya false → disimpan di state, layar diperbarui
```

Cara lain, `AbortController`, benar-benar **membatalkan** permintaan, tetapi galat `AbortError`-nya harus disaring supaya tidak tampil sebagai kotak merah. Modul ini memilih `ignore`, pola contoh react.dev yang lebih sederhana.

Untuk ***refresh* sekali** (Praktik 6.5), saat gelang habis, dua permintaan kembar yang sama-sama dijawab 401 bisa mengetuk `POST /auth/refresh` dengan kartu terusan yang sama. Backend Modul 20 memaafkan kartu lama yang muncul lagi kurang dari 30 detik, tetapi dua ketukan hampir bersamaan belum diuji penulis. Jadi, `refreshSekali()` di `api.ts` menyimpan **satu janji bersama**: permintaan kedua menunggu *refresh* yang sedang berjalan. Biasanya tercatat satu *refresh*; sesekali dua berurutan (401 kedua tiba sesudah *refresh* pertama selesai), dan itu tidak berbahaya.

Jangan mematikan StrictMode demi tab **Network** yang bersih: permintaan ganda tidak sampai ke pengguna, sedangkan kesalahan yang dipergokinya akan sampai. Gladi ini makin berharga di Modul 23, saat efek membuka sambungan data *live* yang wajib ditutup lagi.

</details>

<details>
<summary><b>Proksi Vite: cara lain tanpa CORS, dan mengapa modul ini tidak memakainya</b></summary>

Dashboard kita memanggil backend **lintas asal** (Konsep 9). Banyak tutorial memakai **proksi** (*proxy*) di dapur Vite: browser hanya berbicara dengan Vite, yang meneruskan permintaan ke backend seperti resepsionis. Contohnya (**cukup dibaca, jangan diketik**):

```ts
  server: {
    port: 5173,
    strictPort: true,
    // CONTOH, tidak dipakai modul ini
    proxy: {
      '/auth': 'http://127.0.0.1:8080',
      '/devices': 'http://127.0.0.1:8080',
    },
  },
```

Halaman dan API lalu **satu asal**: tanpa CORS, *preflight*, `credentials: "include"`, dan jebakan `localhost`/`127.0.0.1`. Modul ini tetap memilih CORS langsung karena:

1. **Jalannya sudah disiapkan.** Sejak Modul 20 (Praktik 6), `CORS_ORIGIN` bawaan memuat `http://localhost:5173`, dan `localhost:5173` dengan `localhost:8080` **satu situs**, jadi *cookie* `SameSite=Strict` tetap terlampir.
2. **Proksi hanya ada di Vite.** Hidangan di `dist/` disajikan server lain dengan aturan meneruskan sendiri (Modul 26–27), sedangkan pelajaran CORS berlaku setiap kali halaman dan API beda alamat.
3. **Halaman dan data berebut alamat.** Kalau layar detail kelak beralamat `/devices/a4cf12e5b7c0` (React Router, Modul 24), menekan **F5** di sana diteruskan proksi ke backend, dan yang tampil JSON, bukan dashboard.
4. ***Cookie* `Path=/auth`.** Obat biasa untuk nomor 3 adalah awalan `/api/…` yang dibuang proksi (`rewrite`). Namun, kartu terusan (*cookie* `sesi`) hanya dilampirkan ke alamat berawalan `/auth`, bukan `/api/auth/refresh`, jadi *refresh* selalu 401 dan kamu dilempar ke layar *login* setiap 15 menit.

Catatan: Konsep 9 Modul 20 sempat menyebut modul ini memakai proksi Vite; kalimat itu sudah diluruskan.

</details>

<details>
<summary><b>Token tidak di <code>localStorage</code>: XSS lebih dalam</b></summary>

Lanjutan Konsep 5 Modul 20 (`localStorage` terbaca JavaScript, *cookie* `HttpOnly` tidak): dari mana XSS masuk, dan apa yang masih bisa dilakukannya.

**Tiga pintu masuk XSS.**

1. **Data yang ditampilkan.** `nama` dan `lokasi` diketik admin (Modul 21). Penulis menguji `lokasi` berisi `<img src=x onerror="alert(1)">` dengan React 19.3.1, merender komponen menjadi teks HTML:

   ```text
   teks biasa   : <p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>
   dangerously  : <p><img src=x onerror="alert(1)"></p>
   ```

   Teks di JSX (`<p>{lokasi}</p>`) diloloskan, jadi tampil sebagai **tulisan**. `dangerouslySetInnerHTML` menempelkannya sebagai HTML, dan `onerror` siap jalan; dokumentasi React memperingatkan celah XSS-nya. Jangan pernah memakainya untuk data perangkat atau API.
2. ***Library* npm** berjalan dengan hak penuh; itu sebabnya versinya tertulis dan paketnya sedikit.
3. **Kode tempelan:** jangan menempel kode orang lain ke tab **Console** saat sudah *login*.

**Apa yang masih bisa dilakukan skrip asing?** Selama tab terbuka, ia bisa mengirim permintaan atas namamu dan membaca jawabannya (asal `http://localhost:5173` diizinkan CORS), tetapi **tidak** bisa membawa gelang atau kartu terusanmu pergi. Seandainya kartu terusan (7 hari) ada di `localStorage`, pencuri cukup membacanya sekali lalu menukarnya berulang kali dari komputernya; alarm rotasi Modul 20 baru berbunyi saat kartu yang sudah diganti dipakai lagi.

Lihat sendiri setelah *login* (Praktik 4.4): di tab **Console**, ketik `document.cookie`: jawabannya `''` (kosong); di panel **Application** → **Cookies** → `http://localhost:5173`, `akses` dan `sesi` bercentang di kolom **HttpOnly**; di **Local storage** tidak ada token. `HttpOnly` memperkecil kerugian, tetapi aturan utamanya tetap: **tampilkan data sebagai teks di dalam `{ }`, jangan sebagai HTML**.

</details>

<details>
<summary><b>Isi folder <code>dist/</code>: hidangan siap saji</b></summary>

`npm run build` (Praktik 8.2) memasak **hidangan siap saji**: `tsc -b` memeriksa tipe (galat menghentikan *build*), lalu `vite build` membungkus semuanya ke `dist/`:

```text
dist/
├── index.html
├── favicon.svg            ← disalin dari public/
└── assets/
    ├── index-<sidik>.js   ← kodemu, React, dan React DOM
    └── index-<sidik>.css  ← CSS hasil Tailwind
```

- **`index.html`** kini memanggil `/assets/index-….js` dan `/assets/index-….css` (keduanya `crossorigin`, di `<head>`), bukan `/src/main.tsx`.
- **`.js`**: semua modul dijahit lalu **dipadatkan**: label tipe, komentar, dan spasi dibuang, JSX menjadi `jsx(…)`, nama variabel dipendekkan.
- **`.css`**: hanya kelas Tailwind yang tertulis utuh di kodemu, itu sebabnya `WARNA_STATUS` di `Lencana.tsx` tidak menyambung `"bg-" + warna`.
- **Huruf acak** (misalnya `index-Irs7fedp.js`) adalah **sidik jari isinya**: dua *build* terpisah dari kode akhir bernama sama, isi yang berubah bernama lain, jadi browser tidak tertukar dengan salinan lama.
- **Tanpa `.map`** (*source map*), kodenya sulit dibaca, tetapi bukan rahasia: siapa pun bisa mengunduhnya dari tab **Network**. Karena itu, `VITE_…` **bukan tempat rahasia**; nilainya tertulis langsung di `.js`.

`dist/` ada di `.gitignore` dan bisa dibuat ulang kapan saja. Buka lewat `npm run preview`, bukan klik dua kali `dist/index.html`: alamat `/assets/…` berarti "dari akar situs", jadi berkasnya dibuat untuk disajikan server. `vite preview` pun hanya untuk memeriksa (menurut dokumentasi Vite, bukan untuk server sungguhan); cara menyajikan `dist/` dibahas di Modul 26–27.

</details>

<details>
<summary><b>Mencoba di HP sungguhan lewat WiFi rumah (pilihan)</b></summary>

> 🖥️ **Alat yang dipakai:** HP (Android atau iPhone) yang tersambung ke **WiFi rumah yang sama** dengan laptop, terminal VS Code `backend` dan `frontend`, serta berkas `backend/.env`.

Syarat lulus memakai mode perangkat DevTools (Praktik 7), karena sejak Modul 16 backend hanya mendengar di `127.0.0.1`. Langkah ini membukanya **sementara**, hanya untuk WiFi rumah; Modul 23 membukanya secara resmi, dan internet menyusul di Modul 27 bersama HTTPS.

**Pahami risikonya dulu.**

- **Semua perangkat di WiFi rumah bisa mengetuk backend dan dapur Vite** (halaman *login*, `/docs`, `/health`). Datanya tetap di balik *login* dan satpam, dan penebak sandi tertahan 10 percobaan per menit per alamat IP (Modul 20).
- **Masih `http://`:** sandi dan gelang melintas tanpa enkripsi. Lakukan hanya di WiFi rumah yang kamu percaya, bukan WiFi kafe, kampus, atau kos.
- **Dapur Vite melayani kode sumbermu** kepada siapa pun; aman selama tidak ada rahasia di frontend (Konsep 4).
- **Yang paling berbahaya adalah lupa mengembalikan.** Kerjakan langkah 5 di hari yang sama.

**Langkah-langkahnya.**

1. **Cari alamat IP laptopmu** (Praktik 7.1 Modul 10): `ipconfig` di Windows (baris `IPv4 Address` di bagian `Wireless LAN adapter Wi-Fi:`), atau `ipconfig getifaddr en0` di macOS. Contoh di sini `192.168.1.10`; ganti dengan alamatmu.
2. **Buka backend ke WiFi.** Di `backend/.env`, ubah `HOST` dan tambahkan asal halaman di HP ke ujung `CORS_ORIGIN`:

   ```text
   HOST=0.0.0.0
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://192.168.1.10:5173
   ```

   `0.0.0.0` artinya "dengarkan di semua pintu laptop", termasuk WiFi; tanpa asal baru di `CORS_ORIGIN`, browser HP menahan jawaban backend (Konsep 9). Simpan, hentikan backend (**Ctrl + C**), lalu jalankan lagi `npm run dev`. Log `dokumentasi API:` kini menulis `http://0.0.0.0:8080/docs`, tanda semua pintu terbuka (bukan alamat untuk dibuka).
3. **Buka dapur Vite ke WiFi.** Kalau `VITE_API_BASE` di `frontend/.env.local` pernah kamu isi, beri `#` di depan barisnya dulu. Di terminal `frontend`, hentikan Vite (**Ctrl + C**), lalu jalankan:

   ```text
   npm run dev -- --host
   ```

   (`--` yang berdiri sendiri meneruskan `--host` ke Vite.) **Windows:** kalau muncul jendela izin *firewall* untuk **Node.js JavaScript Runtime**, izinkan hanya untuk jaringan **Private**, dan pastikan WiFi rumahmu berprofil **Private network** (Praktik 7.2 Modul 10, langkah 3–5). **macOS:** kalau ditanya apakah `node` boleh menerima sambungan masuk, pilih **Allow**.
4. **Buka di HP** `http://192.168.1.10:5173` (bukan `localhost`: bagi HP, `localhost` adalah HP itu sendiri), lalu masuk dengan `viewer@rumah.test`. Tanpa mengubah kode, `api.ts` otomatis memanggil `http://192.168.1.10:8080` (Konsep 9); halaman dan API satu situs (port tidak dihitung), jadi *cookie* `SameSite=Strict` tetap bekerja.
5. **Kembalikan seperti semula** di hari yang sama:
   - Di `backend/.env`, kembalikan `HOST=127.0.0.1` dan hapus `,http://192.168.1.10:5173` dari `CORS_ORIGIN`, lalu jalankan ulang backend.
   - Hapus lagi `#` pada `VITE_API_BASE` (kalau ada), lalu jalankan ulang Vite dengan `npm run dev` tanpa `--host`.
   - Periksa: `http://192.168.1.10:5173` di HP kini tidak bisa dibuka lagi.

**Kalau tidak jalan:** halaman tidak terbuka → pastikan satu WiFi (bukan jaringan tamu), IP laptop tetap, VPN mati, dan *firewall* mengizinkan Node.js. Pesan `Tidak bisa menghubungi server di http://localhost:8080` → `VITE_API_BASE` masih aktif; `… di http://192.168.1.10:8080` → periksa `HOST`, jalankan ulang backend, dan cek `CORS_ORIGIN` (tanpa garis miring di ujung). Tanpa gaya → HP terlalu lama untuk Tailwind v4 ([🚨](#-kalau-tidak-jalan)).

Catatan jujur: penulis belum mencoba langkah ini dengan HP sungguhan. Langkah 2–4 disusun dari kode backend v1.0 dan `api.ts` modul ini. Kalau di HP-mu ada yang berbeda, Modul 23 membahasnya dengan lengkap.

</details>

<details>
<summary><b>Next.js dan sejenisnya (ringkas)</b></summary>

Tutorial React sering memakai **Next.js**, *framework* (kerangka kerja) di atas React. Menurut [dokumentasinya](https://nextjs.org/docs), alamat halaman ditentukan susunan folder, dan secara bawaan halaman **digambar di server** (SSR).

| | Vite + React (modul ini) | Next.js |
| :--- | :--- | :--- |
| Yang pertama tiba | `index.html` hampir kosong; React menggambarnya di browser | HTML berisi tulisan, digambar di server |
| Butuh server khusus? | Tidak; `dist/` cukup berkas statis | Ya, untuk halaman yang digambar di server |
| Cocok untuk | dashboard di balik *login*, alat internal | situs publik yang harus ditemukan mesin pencari (SEO) |

Dashboard kita ada di balik *login* (SEO tak berarti), dan API serta *login* sudah diurus backend Fastify (Modul 16–21), jadi server kedua hanya menambah beban jaga. Silabus menaruh Next.js sebagai wawasan; bedah lengkapnya di Modul 24.

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** sama dengan Praktik 6. **VS Code** dengan terminal `backend` (backend v1.0, port 8080), terminal `frontend` (Vite, port 5173), dan satu terminal kosong di folder `frontend` untuk Git, `npm run lint`, dan `npm run build`; jalur laptop tetap menyalakan broker dan simulator. Lalu **Docker Desktop** (kontainer `rumahpintar-db` menyala), **Chrome atau Edge** di `http://localhost:5173` dengan DevTools, dan **Bruno** untuk percobaan pilihan Tingkat 1.

Ketiga tantangan hanya mengubah folder `frontend`. Kerjakan **sesudah** ➕ C, masing-masing di cabang baru dari `main` (`git switch main`, `git pull`, lalu `git switch -c fitur/<nama-tantangan>`, misalnya `fitur/kartu-pompa-tirai`), seperti Modul 16–20. Sebelum menyimpan ke cabang, `npm run lint` dan `npm run build` harus lulus tanpa galat dan peringatan ([Praktik 8](#praktik-8--uji-kelulusan-build-lint-dan-gladi-bersih-35-menit)). Kalau rapi, buka *pull request*-nya sebagai latihan *review* dengan butir **(Modul 22)** di templat PR.

Kunci Tingkat 1 dan 2 (berkas `DetailPerangkat.tsx` utuh, dibuat di atas [`kode/frontend/`](kode/frontend/) v0.1.0) ada di [`kode/tantangan/kunci/`](kode/tantangan/kunci/). Keduanya mengubah berkas yang sama, jadi kerjakan di dua cabang terpisah. Tingkat 3 sengaja tanpa kunci.

### Tingkat 1 — Kartu Pompa dan Tirai (ubah sedikit, 20 menit)

Sejak Modul 19 (kontrak 1.3), objek `state` di `telemetry` Node 1 berisi **empat** aktuator: `kipas`, `lampu`, `pompa`, dan `tirai`. Tipe `Keadaan` di `src/types.ts` sudah mengenal keempatnya, tetapi detail perangkat baru menampilkan **Lampu** dan **Kipas**. Lengkapi dua sisanya:

| Kartu | Isinya | Satuan | Warna angka |
| :--- | :--- | :--- | :--- |
| **Pompa** | `Menyiram` kalau `pompa` bernilai `true`, `Diam` kalau `false` | tanpa satuan | satu warna Tailwind pilihanmu saat menyiram, warna bawaan saat diam |
| **Tirai** | sudut servo tirai, dari 0 sampai 180 | `°` | warna bawaan |

1. Buka **`frontend/src/components/DetailPerangkat.tsx`**, lalu cari blok `if (t.state !== undefined) {` di fungsi `kartuNode1`.
2. Tambahkan dua objek baru di bawah objek **Kipas**, masih di dalam kurung `kartu.push(…)` yang sama. Contohlah objek **Lampu** (`label`, `nilai` dengan `? :` dari Pemanasan Langkah 3, dan `warna`). **Tirai** cukup `label`, `nilai` dari `t.state.tirai`, dan `satuan`.
3. Simpan (**Ctrl + S**). Kalau kartu barunya belum muncul, kembali ke daftar, lalu buka lagi detail Node 1 (jalur laptop: `Latihan ruang tamu`).
4. Buka juga detail Node 2. Kartu Pompa dan Tirai **tidak** boleh muncul di sana.
5. Periksa di mode perangkat DevTools selebar 375 px, seperti Praktik 7.

Petunjuk: tulis warnanya sebagai satu kelas Tailwind yang **utuh**, misalnya `"text-sky-600"` (Konsep 3). `label` sekaligus menjadi `key` kartu, jadi harus berbeda dari label lain. Tombol kendali pompa dan tirai baru dibuat di Modul 24.

**Lulus kalau:** detail Node 1 (atau `Latihan ruang tamu`) menampilkan **Pompa** dan **Tirai** sesudah **Lampu** dan **Kipas**, detail Node 2 tidak berubah, tidak ada gulir mendatar di lebar 375 px, dan `npm run lint` serta `npm run build` lulus.

**Percobaan pilihan: buktikan angkanya datang dari API.** Catat dulu angka di kartu **Tirai**-mu, lalu ubah sudutnya dari Bruno, seperti di Modul 19–20.

1. Di Bruno (*environment* **`lokal`**), kirim **`login admin`**. Hanya `admin` yang boleh memerintah perangkat.
2. Buka permintaan **`nyalakan lampu`**, klik kanan **tab**-nya → **Clone Request**, isi **Request Name** dengan **`atur tirai latihan`**, lalu klik **Clone**.
3. Ganti URL-nya menjadi `{{baseUrl}}/devices/f00d00000001/command` (jalur perangkat: pakai `device_id` Node 1-mu; servonya benar-benar berputar). Isi tab **Body** dengan `{"target":"tirai","nilai":45}`, simpan (**Ctrl + S**), lalu klik **Send**. Jawabannya 200, dengan `"ok": true` di dalam `ack`.
4. Di dashboard, kembali ke daftar, lalu buka lagi detail perangkat yang sama. Kartu **Tirai** kini menulis `45`.
5. Ganti `45` di **Body** dengan sudut yang kamu catat tadi (simulator: `90`), lalu **Send** lagi. Jangan tinggalkan di 45: backend mengingat sudut itu sebagai keadaan yang diinginkan (Modul 19), dan mengirimnya lagi kalau Node 1 atau simulatornya kelak dinyalakan ulang dan tirainya kembali ke posisi awal.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Dua objek baru (beserta satu komentar) masuk di bawah objek **Kipas**; baris pertama dan terakhir di bawah ini sudah ada. Berkas utuhnya: [`kode/tantangan/kunci/tingkat-1/frontend/src/components/DetailPerangkat.tsx`](kode/tantangan/kunci/tingkat-1/frontend/src/components/DetailPerangkat.tsx).

```tsx
      { label: "Kipas", nilai: t.state.kipas ? "Nyala" : "Mati", warna: t.state.kipas ? "text-teal-600" : undefined },
      // Tantangan Tingkat 1: dua aktuator lainnya dari objek state yang sama (kontrak 1.3)
      { label: "Pompa", nilai: t.state.pompa ? "Menyiram" : "Diam", warna: t.state.pompa ? "text-sky-600" : undefined },
      { label: "Tirai", nilai: t.state.tirai, satuan: "°" }, // sudut servo tirai, 0-180 derajat
    );
```

- **Node 2 tidak berubah**, karena ia tidak pernah mengirim `state` dan detailnya disusun `kartuNode2`.
- Saat pompa diam, `warna` bernilai `undefined`, jadi `KartuSensor` memakai warna bawaannya.
- `Latihan ruang tamu` kini punya sepuluh kartu. Simulator mulai dengan pompa diam dan tirai 90 derajat, jadi kartu barunya biasanya `Diam` dan `90`.
- **`Menyiram` jarang terlihat**, karena perintah pompa hanya denyut 1–10 detik (Modul 19), sedangkan bacaan diambil sekali saat detail dibuka. Kirim `{"target":"pompa","nilai":10}` lewat `atur tirai latihan`, lalu segera buka ulang detailnya.

</details>

### Tingkat 2 — Tombol "Muat ulang" (isi bagian rumpang, 45 menit)

Dashboard v0.1 mengambil bacaan **sekali**, saat detail dibuka (Konsep 8), padahal Node 1 dan simulator mengirim bacaan baru setiap 10 detik. Tambahkan tombol **Muat ulang** di samping **← Kembali ke daftar**: setiap ketukan mengambil `GET /devices/:id/latest` **sekali lagi**.

> [!IMPORTANT]
> **Manual, bukan otomatis.** Satu ketukan, satu permintaan. Jangan memakai `setInterval` supaya dashboard bertanya setiap beberapa detik (*polling*). Angka yang berganti sendiri adalah bahan Modul 23, lewat Socket.IO.

Caranya memakai dua papan tulis baru (Konsep 7), **`putaran`** dan **`memuatUlang`**. Efek dijalankan lagi, lengkap dengan perlindungan `ignore`-nya, setiap kali isi daftar ujungnya berubah (Konsep 8), jadi `putaran` cukup ditulis di daftar itu.

Isi setiap `____`. Semua perubahan ada di **`frontend/src/components/DetailPerangkat.tsx`**, dari atas ke bawah.

**Rumpang 1**, tepat di bawah baris `const [belumAda, setBelumAda] = useState(false); …`:

```tsx
  const [putaran, setPutaran] = useState(____); // Tantangan 2: bertambah 1 setiap kali tombol Muat ulang diketuk
  const [memuatUlang, setMemuatUlang] = useState(____); // Tantangan 2: true selama menunggu jawaban muat ulang
```

**Rumpang 2.** Di dalam efek, ganti baris `setGalat(err instanceof …` sampai `}, [id, onSesiHabis]);` dengan blok ini. `.catch(…)` kini disambung `.finally(…)`, yang dijalankan sesudah janji selesai, entah berhasil atau gagal (seperti di `refreshSekali()`, Praktik 6).

```tsx
        setGalat(err instanceof GalatApi ? err.message : "Gagal memuat bacaan.");
      })
      .finally(() => {
        if (!ignore) setMemuatUlang(____); // Tantangan 2: berhasil atau gagal, tombolnya aktif lagi
      });
    return () => {
      ignore = true;
    };
  }, [id, onSesiHabis, ____]); // Tantangan 2: putaran berubah = efek berjalan lagi = bacaan diambil lagi
```

**Rumpang 3**, tepat di bawah efek, sebelum komentar `// Pilih SATU isi …`:

```tsx
  // Tantangan 2: dipanggil tombol Muat ulang. Mengubah state di pengendali klik seperti ini boleh;
  // pengambilan datanya tetap dikerjakan efek di atas. Kartu lama tetap tampil sampai jawaban baru tiba.
  function muatUlang() {
    setGalat(null); // hapus sisa galat atau "belum ada" dari percobaan sebelumnya
    setBelumAda(false);
    setMemuatUlang(____);
    setPutaran((n) => ____); // fungsi pembaru: ambil nilai terbaru, tambah satu
  }
```

**Rumpang 4.** Di bagian `return`, tulis `<div className="flex items-center justify-between gap-2">` tepat di atas komentar `{/* min-h-11 = … */}`, supaya tombol Kembali berbagi baris dengan tombol baru. Baris pertama blok ini, `</button>` tombol Kembali, sudah ada; tambahkan sisanya di bawahnya (isi `<div>` boleh digeser dua spasi ke kanan):

```tsx
        </button>
        {/* Tantangan 2: muat ulang MANUAL; tombolnya redup selama menunggu supaya tidak diketuk berkali-kali */}
        <button
          type="button"
          onClick={____}
          disabled={____}
          className="min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-4 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {memuatUlang ? "Memuat…" : "Muat ulang"}
        </button>
      </div>
```

**Terakhir,** di baris `let pesan = "Belum ada bacaan …`, ganti `lalu buka lagi.` dengan `lalu ketuk Muat ulang.`.

Simpan, lalu uji:

1. Buka detail Node 1 (jalur laptop: `Latihan ruang tamu`) dan tab **Network** (**Fetch/XHR**). Catat jam `diperbarui pukul … WIB`.
2. Tunggu ±10 detik, lalu ketuk **Muat ulang**. Jamnya berganti, dan kartu lama tetap tampil selama menunggu. `Memuat…` mungkin hanya terlihat sekejap, karena backend di laptopmu menjawab sangat cepat.
3. Hitung baris `latest`: dua saat detail pertama kali dibuka (`StrictMode`), lalu **tepat satu** per ketukan.
4. Hentikan backend (**Ctrl + C**), lalu ketuk: kotak merah berisi pesan kode 0 menggantikan kartu, dan tombolnya aktif lagi. Nyalakan backend (`npm run dev`), tunggu `Server listening at http://127.0.0.1:8080`, lalu ketuk lagi. Memori bacaan backend kosong sesudah dinyalakan ulang, jadi biasanya tampil catatan netral berakhiran `lalu ketuk Muat ulang.` (404). Tunggu paling lama 10 detik, ketuk lagi: kartunya kembali, tanpa **F5**.

**Lulus kalau:** setiap ketukan mengirim tepat satu `GET …/latest` dan memperbarui jamnya; tombolnya tidak bisa diketuk selama menunggu; dari kotak galat maupun catatan "belum ada bacaan", layar pulih hanya dengan **Muat ulang**; dan `npm run lint` serta `npm run build` lulus.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Urutan isiannya: `0`, `false`, `false`, `putaran`, `true`, `n + 1`, `muatUlang`, `memuatUlang`. Berkas utuhnya: [`kode/tantangan/kunci/tingkat-2/frontend/src/components/DetailPerangkat.tsx`](kode/tantangan/kunci/tingkat-2/frontend/src/components/DetailPerangkat.tsx). Kunci ini tanpa kartu Pompa dan Tirai, jadi cocokkan bagian yang berubah saja.

- **`putaran` di daftar ujung efek** adalah intinya: efek tidak membacanya, tetapi berjalan lagi setiap kali angkanya berubah. *Cleanup* menyalakan `ignore` efek lama, jadi jawaban lama yang terlambat tidak menimpa angka baru. `npm run lint` hanya menagih kebalikannya: nilai yang dibaca efek tetapi tidak ditulis di daftar.
- **`setPutaran((n) => n + 1)`** memakai fungsi pengubah (Konsep 7), yang menerima isi papan paling baru.
- **`setMemuatUlang(true)` di pengendali klik** memang tempatnya; yang ditegur `npm run lint` adalah mengosongkan papan di awal efek (Konsep 8).
- **`setGalat(null)` dan `setBelumAda(false)`** menghapus sisa percobaan sebelumnya; tanpa keduanya, kotak merah atau catatan "belum ada bacaan" tetap menutupi kartu (Konsep 10).
- **`onClick={muatUlang}`, tanpa tanda kurung** (Konsep 5). `onClick={muatUlang()}` menjalankan fungsinya setiap kali React menggambar; karena ia mengubah papan, React menggambar lagi, terus begitu sampai dihentikan dengan galat.
- **`disabled={memuatUlang}`** mematikan tombol selama menunggu; `disabled:opacity-60` meredupkannya.

</details>

### Tingkat 3 — Ringkasan semua perangkat dalam satu layar (buat dari nol, 60–90 menit)

Buat layar **Ringkasan** yang menampilkan bacaan terpenting **semua** perangkat sekaligus, supaya suhu setiap ruangan terlihat tanpa membuka detail satu per satu.

**Tugas.** Buat `src/components/Ringkasan.tsx`, lalu pasang di `App`. Setiap perangkat dari `GET /devices` mendapat satu kartu kecil berisi:

- nama (atau `device_id` kalau belum bernama) dan lencana dari `Lencana.tsx`, dengan aturan `DaftarPerangkat`: kunci `dicabut` atau `belum-terdaftar` tidak diberi lencana `status`;
- suhu dan kelembapan terbaru ("—" untuk `null`) serta jam `diperbarui pukul … WIB`;
- atau, untuk perangkat yang dijawab 404, keterangan seperti `belum ada bacaan`.

**Bahan baru: `Promise.all`.** Dengan `await` di dalam perulangan, permintaan `ambilTerbaru()` kedua baru berangkat sesudah jawaban pertama tiba. Ingat alat getar Modul 4: memesan di lima kios berarti memegang lima alat getar. `Promise.all(…)` menerima *array* janji itu dan memberimu **satu** alat getar yang bergetar sesudah **semua** pesanan siap, berisi *array* hasil yang **urutannya sama** dengan janjinya.

Awas: begitu **satu** janji ditolak, alat getar besar itu ikut "ditolak", dan hasil lainnya hilang. Padahal hampir pasti ada perangkat yang dijawab 404 (belum terdaftar, kuncinya dicabut, atau sesaat sesudah backend dinyalakan ulang). Coba dulu tanpa penanganan supaya kamu melihat sendiri akibatnya.

Petunjuk:

- **Beri setiap `ambilTerbaru(p.device_id)` sebuah `.catch` sendiri** sebelum masuk `Promise.all`: `GalatApi` berkode 404 → kembalikan `null`; galat lain → `throw err`, supaya 401 tetap sampai ke `onSesiHabis` dan backend mati tetap tampil sebagai kotak galat. (Cara lain: `Promise.allSettled`; cari di MDN.)
- **Satu efek, dua tahap:** `ambilPerangkat()` dulu, baru `Promise.all`. Untuk `await`, buat fungsi `async` di dalam efek lalu langsung panggil (Konsep 8). Pola `ignore` tetap wajib; periksa juga sesudah daftar tiba, supaya efek yang dibereskan `StrictMode` tidak mengirim satu pun `latest`.
- **`bacaan.telemetry.suhu` sah tanpa memeriksa jenis**, karena `TelemetryNode1` dan `TelemetryNode2` sama-sama punya `suhu` dan `kelembapan`.
- **Pindahkan `jamWib()`** ke berkas baru, misalnya `src/waktu.ts`, lalu impor di kedua komponen. Kalau kamu malah memberinya `export` di `DetailPerangkat.tsx`, `npm run lint` memperingatkan `Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.`
- **Pasang di `App`:** tambahkan `{ nama: "ringkasan" }` ke tipe `Tampilan` dan dua tombol, **Daftar** dan **Ringkasan**. VS Code lalu menggarisbawahi `tampilan.perangkat` dengan merah, karena pilihan baru itu tidak punya `perangkat`: TypeScript menagihmu menangani layar baru dengan jelas.
- **Tiga keadaan dan layar HP:** siapkan memuat, galat, dan kosong (Konsep 10); susun *mobile first*, misalnya `grid gap-3 sm:grid-cols-2`, dengan `min-w-0` dan `truncate` (Praktik 7).
- **Yang belum boleh:** penyegaran otomatis, jam relatif seperti "10 detik lalu", dan grafik (Modul 23).

**Lulus kalau:**

- **Ringkasan** menampilkan semua perangkat di **Daftar Perangkat**, dan yang dijawab 404 tetap tampil dengan keterangannya tanpa menggagalkan layar.
- Di **Network**, semua `latest` berangkat hampir bersamaan, segera sesudah `devices` dijawab. Di mode pengembangan `devices` tercatat dua kali (`StrictMode`), tetapi setiap `latest` hanya sekali.
- Kalau backend mati, **Ringkasan** menampilkan kotak galat, bukan tulisan memuat yang tak pernah selesai.
- Sesudah *cookie* `akses` dihapus di panel **Application** (seperti Praktik 6), membuka lagi **Ringkasan** tetap berhasil, tanpa kembali ke formulir *login*. **Network** biasanya mencatat **satu** `refresh`, walaupun `devices` dijawab 401 dua kali; sesekali dua, berurutan, kalau 401 kedua baru tiba sesudah `refresh` pertama selesai. Itu juga wajar.
- Di lebar 375 px tidak ada gulir mendatar, dan `npm run lint` serta `npm run build` lulus.

**Renungkan.** Dengan seratus perangkat, membuka ringkasan berarti 101 permintaan, padahal seratus bacaannya ada di memori backend yang sama. Lebih baik ringkasan disusun di browser, atau oleh satu rute backend yang menjawab sekaligus? Apa untung-ruginya bagi backend, HP di jaringan lambat, dan `api.ts`-mu?

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini mendapat **wajah**: dashboard v0.1 di browser, masih statis, tetapi sudah ber-*login* lewat *cookie* `HttpOnly` dan rapi di HP maupun laptop. Backend, broker, firmware, dan kontrak data tidak berubah sama sekali. Semua pekerjaan Praktik 2–8 sudah tersimpan sebagai *commit* di cabang `fitur/dashboard`, tetapi cabang itu belum pernah dikirim ke GitHub. Langkah A dan B menyiapkan dua dokumen, langkah C menggabungkan semuanya ke `main` lewat *pull request* "dashboard v0.1", dan langkah D menyimpan catatan belajarmu. Beginilah seluruh proyek setelah minggu ini:

![Diagram proyek Rumah Pintar Mini setelah Modul 22. Subjudul: rumah mendapat wajah, dashboard v0.1 di browser; garis putus-putus berarti menyusul. Baris atas, semuanya tidak berubah: Node 2 Kebun firmware v1.0.0 dengan baterai 18650, tidak berubah dan mengirim lewat Node 1 dengan ESP-NOW; Node 1 Rumah firmware v1.6.0 dengan kunci broker di NVS, akun a4cf12e5b7c0, enam kolom (+ trio RS-485), tidak berubah, mengirim MQTT dengan kunci ke gateway Raspberry Pi 192.168.1.37. Di dalam Pi: Mosquitto berkunci dengan allow_anonymous false, sandi-broker dan acl-broker, tidak berubah (Modul 21); dan Node-RED dengan dashboard lama, kartu Kebun, grup Sensor RS-485, akun nodered, tidak berubah. Kanan atas: HP untuk Node-RED dan Telegram; Telegram untuk peringatan dan /status, tidak berubah. Kiri: kotak Klien broker di laptop, tidak berubah (Modul 21): MQTTX dengan akun pemantau yang hanya membaca, pemeriksa kontrak dengan akun pemeriksa, dan simulator (jalur laptop) f00d00000001 dengan kunci di alat/.env; semuanya tersambung lewat MQTT, masing-masing dengan akunnya. Di bawahnya, kotak Jujur, dashboard v0.1 masih: statis, angka diambil saat layar dibuka (live di Modul 23); hanya melihat, belum ada tombol kendali (Modul 24); hanya di laptop, HP lewat WiFi rumah mulai Modul 23 dan internet di Modul 27; login minimal, rute terproteksi dan peran menyusul (Modul 24). Tengah, kotak besar Laptop (backend + dashboard). Di dalamnya, kotak hijau backend v1.0, tidak berubah: Fastify + TypeScript, kontrak data 1.4, berkunci untuk manusia dan perangkat (Modul 20–21); CORS_ORIGIN sudah memuat http://localhost:5173 sejak Modul 20, menunggu; cookie akses dan sesi bersifat HttpOnly dan SameSite=Strict. API yang dipakai dashboard: POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me, GET /devices, dan GET /devices/:id/latest; selebihnya (perintah, aturan, riwayat) menunggu Modul 23–24. Panah hijau rpm/# dari broker ke backend dan cmd dari backend ke broker; garis hijau dari backend ke Telegram berlabel internet: HTTPS keluar, long polling. Di kanan backend: kotak biru Docker Desktop rumahpintar-db, PostgreSQL 17 + TimescaleDB 2.30.2, tidak berubah; dan kotak Bruno, terminal kecil, /docs, tetap bisa dipakai seperti Modul 16–21, tidak berubah. Di bawah backend, kotak ungu frontend v0.1 (baru): folder frontend/, React 19 + TypeScript + Tailwind CSS v4, disiapkan Vite 8. Panah ungu dari frontend ke backend berlabel fetch + cookie akses, credentials: include, CORS, dan panah hijau balik berlabel JSON. Di dalam kotak frontend: Vite dev server, npm run dev di terminal folder frontend, melayani http://localhost:5173 berupa HTML, JavaScript, dan CSS, berubah seketika saat berkas disimpan (HMR); npm run build memeriksa tipe (tsc -b), lalu menyiapkan hidangan siap saji di folder dist/. Panah ke kotak browser (Chrome atau Edge): dashboard v0.1 di http://localhost:5173 dengan tiga layar mini berurutan, login (dua kolom isian dan tombol Masuk), Daftar Perangkat, dan Detail Perangkat (kisi kartu Node 1 ruang tamu); rapi di HP, diperiksa di mode perangkat DevTools (375 px); React DevTools memperlihatkan pohon komponennya. Kiri bawah, kotak GitHub rumah-pintar-mini, cabang fitur/dashboard menuju pull request ke main; pull request dashboard v0.1 ditinjau dengan butir (Modul 22), lalu di-merge. Berkas yang baru atau berubah: frontend/package.json dan package-lock.json, rumah-pintar-mini-frontend 0.1.0; frontend/vite.config.ts, Tailwind dan port 5173 strictPort; frontend/index.html, lang=id; frontend/src/index.css, @import tailwindcss; frontend/src/main.tsx, bawaan templat; frontend/src/types.ts, tipe dari Lampiran A; frontend/src/api.ts, satu pintu dan refresh sekali; frontend/src/App.tsx, login, daftar, lalu detail dengan state biasa; frontend/src/components/KartuSensor.tsx, Login.tsx, dan Lencana.tsx, baru; frontend/src/components/DaftarPerangkat.tsx dan DetailPerangkat.tsx, baru; frontend/.env.example, contoh VITE_API_BASE; frontend/.gitignore, ditambah .env; frontend/README.md, cara menjalankan, akun, dan batas v0.1; frontend/tsconfig*.json, .oxlintrc.json, dan public/favicon.svg, bawaan templat; .github/pull_request_template.md, ditambah butir dashboard (Modul 22). Dihapus dari templat: src/App.css, src/assets/, dan public/icons.svg. Kotak bergembok: tidak pernah ikut Git, frontend/.env.local, frontend/node_modules/, dan frontend/dist/. Kanan bawah, kartu ungu Fase 4 dimulai: rumah mendapat wajah, dashboard v0.1; Checkpoint Fase 4 ada di Modul 25. Di bawahnya, tiga kartu putus-putus yang menyusul: Modul 23, data live, grafik, gauge, riwayat, status, dan HP lewat WiFi; Modul 24, tombol kendali, form aturan, peran, dan rute terproteksi; Modul 25, Grafana, peta perangkat, laporan, dan Checkpoint Fase 4.](aset/diagram-proyek-modul-22.png)

Hanya kotak ungu **frontend v0.1** yang baru. Dashboard memakai enam rute backend: tiga loket `/auth` (masuk, menukar kartu terusan dengan gelang baru, keluar), `GET /auth/me`, `GET /devices`, dan `GET /devices/:id/latest`. Kotak **Jujur, dashboard v0.1 masih:** sejalan dengan bagian **Batasan v0.1** di README langkah A, dan tiga kartu putus-putus di kanan bawah menyusul di Modul 23–25.

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan terminalnya (mula-mula di folder `frontend`, lalu di akar `rumah-pintar-mini`), **browser** yang sudah masuk ke GitHub, dan di langkah D jendela VS Code kedua dengan folder `belajar-iot`. Backend, simulator, dan Vite tidak perlu menyala. Kalau Vite masih berjalan, hentikan dengan **Ctrl + C** sebelum langkah C.
>
> ⭐ **Wajib** — langkah C menggabungkan dashboard v0.1 ke `main`, dan Modul 23 dimulai dari sana.

| Berkas yang ikut *pull request* | Langkah |
| :--- | :--- |
| Dari templat dan `npm install`: `frontend/package.json`, `package-lock.json` (versi **0.1.0**), `vite.config.ts`, `index.html`, `src/index.css`, `.gitignore`, serta `src/main.tsx`, `tsconfig*.json`, `.oxlintrc.json`, dan `public/favicon.svg` yang tidak diubah | Praktik 2 dan 8 |
| **Baru**: `frontend/src/types.ts`, `src/api.ts`, `.env.example`, lima komponen di `src/components/`, dan `src/App.tsx` yang ditulis ulang | Praktik 2–7 |
| `frontend/README.md` | A |
| `.github/pull_request_template.md` | B |

`frontend/node_modules/`, `dist/`, dan `.env.local` (kalau ada) **tidak pernah ikut Git**; `frontend/.gitignore` mengabaikan ketiganya.

### A. Tulis `frontend/README.md`

Teman satu tim yang meng-*clone* repositorimu harus tahu hal yang tidak bisa ditebak dari kode: dashboard butuh backend v1.0 yang menyala beserta sumber datanya, harus dibuka di `http://localhost:5173` (bukan `127.0.0.1`), dan masuk dengan akun Modul 20. `frontend/README.md`-mu masih catatan bawaan templat Vite berbahasa Inggris. Buka [`kode/frontend/README.md`](kode/frontend/README.md) di GitHub, klik **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi `README.md` di dalam folder `frontend` (bukan yang di akar repositori). Simpan (**Ctrl + S**).

Isinya: **Menjalankan** (lima langkah sampai *login*, plus tabel empat perintah npm), **Alamat backend** (`.env.local` tidak wajib, Konsep 9), **Isi folder `src/`**, ***Login* dan keamanan**, dan **Batasan v0.1** yang jujur seperti README backend sejak Modul 16: statis, tanpa tombol kendali, hanya dari laptop ini, dan "rapi di HP" baru diperiksa dengan mode perangkat DevTools. README ini menyebut nama akun, tetapi **tidak pernah** sandinya (aturan aman nomor 1). Tekan **Ctrl + Shift + V** (macOS: **Cmd + Shift + V**) untuk melihat tampilannya seperti di GitHub.

### B. Tambahkan butir dashboard ke templat *pull request*

Sejak Modul 16, setiap *pull request* berisi checklist dari `.github/pull_request_template.md`, dan Modul 20–21 menambahkan butir keamanan backend. Dashboard mendapat tiga butir sendiri bertanda **(Modul 22)**. Buka [`kode/.github/pull_request_template.md`](kode/.github/pull_request_template.md) di GitHub, klik **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi `.github/pull_request_template.md`-mu (folder `.github` ada di akar `rumah-pintar-mini`, bukan di dalam `frontend`). Simpan. Isinya sama persis dengan templat Modul 21, ditambah tiga butir ini:

```markdown
- [ ] **(Modul 22)** Kalau `frontend/` berubah: di folder `frontend`, `npm run build` dan `npm run lint` lulus tanpa galat dan tanpa peringatan
- [ ] **(Modul 22)** Tidak ada rahasia di variabel `VITE_…` (semuanya ikut terkirim ke browser), dan `frontend/.env.local` tidak ikut Git; yang boleh ikut hanya `frontend/.env.example` tanpa nilai rahasia
- [ ] **(Modul 22)** Dashboard tidak menyimpan sandi atau token di `localStorage` (login hanya lewat *cookie* `HttpOnly` dari backend, `fetch` dengan `credentials: "include"`), dan data dari API ditampilkan sebagai teks JSX, tanpa `dangerouslySetInnerHTML`
```

Butir pertama ada di **Checklist sebelum *merge***, tepat di bawah `npm run cek`: pemeriksa tipe frontend adalah `npm run build` (`tsc -b`, Konsep 4). Dua butir lainnya menyusul tiga butir Modul 21 di **Checklist keamanan** (aturan aman nomor 1–3).

### C. ⭐ Gabungkan `fitur/dashboard` ke `main` lewat *pull request* "dashboard v0.1"

Naik dulu dari folder `frontend` ke akar repositori, lalu periksa apa yang berubah:

```text
cd ..
git status
```

Harus ada tepat dua berkas berstatus `modified`: `.github/pull_request_template.md` dan `frontend/README.md`. Kalau ada berkas lain, misalnya `frontend/package.json`, kerjakan dulu langkah simpan di akhir Praktik 8. Setelah daftarnya benar, simpan kedua dokumen dan kirim cabangnya ke GitHub:

```text
git add frontend/README.md .github/pull_request_template.md
git commit -m "Dokumen dashboard v0.1: README frontend dan butir Modul 22 di templat pull request"
git push -u origin fitur/dashboard
```

Ini *push* pertama cabang ini (`-u` mencatat pasangannya di GitHub), sekaligus membawa semua *commit* sejak Praktik 2.

1. **Buka *pull request*.** Di GitHub, klik **Compare & pull request** pada pita kuning cabang `fitur/dashboard` (atau tab **Pull requests** → **New pull request**, **base: `main`** ← **compare: `fitur/dashboard`**). Beri judul `Dashboard v0.1`. Di **Apa yang berubah?**, tulis misalnya: `Dashboard v0.1 (frontend 0.1.0, React + TypeScript + Tailwind CSS v4): login dengan cookie HttpOnly, daftar perangkat, dan bacaan terbaru semua sensor, rapi di lebar 375 px. Ditambah README frontend dan tiga butir (Modul 22) di templat pull request. Backend, alat, edge, dan KONTRAK-DATA.md tidak berubah.` GitHub hanya memakai templat yang sudah ada di `main` (Modul 16 Praktik 8.1), jadi butir **(Modul 22)** baru muncul sendiri di *pull request* berikutnya. Kali ini, salin ketiganya dari `.github/pull_request_template.md` di VS Code ke bawah deskripsi, lalu klik **Create pull request**.
2. ***Review* dengan butir (Modul 22).** Centang hanya yang benar-benar terpenuhi:
   - Tab **Files changed** berisi **23 berkas**: 22 berkas baru di folder `frontend` ditambah templat *pull request*. **Tidak boleh ada** `frontend/.env.local`, `frontend/.env`, `frontend/node_modules/`, `frontend/dist/`, atau berkas dari `backend/`, `alat/`, dan `edge/`. Di `frontend/.env.example`, baris `VITE_API_BASE` masih diawali `#`. Kalau jumlahnya berbeda, cocokkan dengan [`kode/frontend/`](kode/frontend/).
   - *Build* dan *lint*: buktinya Praktik 8.1 dan 8.2, dan dua dokumen sesudahnya tidak mengubah kode.
   - `VITE_…` dan `.env.local`: tanyakan kepada Git apakah kedua berkas setelan itu diabaikan. Perintah ini bekerja walaupun `.env.local` tidak pernah kamu buat:

     ```text
     git check-ignore -v frontend/.env.local frontend/.env
     ```

     **Hasilnya:**

     ```text
     frontend/.gitignore:13:*.local	frontend/.env.local
     frontend/.gitignore:15:.env	frontend/.env
     ```

     Tiap baris menyebut berkas aturan, nomor baris, dan aturan yang menangkapnya. Kalau salah satu berkas tidak disebut, berkas itu **tidak** diabaikan; periksa lagi `frontend/.gitignore` (Praktik 2.5).
   - `localStorage`: cari dua kata terlarang di kode dashboard:

     ```text
     git grep -n -e localStorage -e dangerouslySetInnerHTML frontend/src
     ```

     Perintah ini tidak boleh mencetak apa pun. Pencarian dibatasi ke `frontend/src`, karena README memang menyebut keduanya. Bukti sisanya sudah kamu lihat: *cookie* `akses` di tab **Application** (Praktik 4.4) dan *refresh* sekali tanpa token di JavaScript (Praktik 6.5).
   - Butir lama: backend, alat, edge, dan `KONTRAK-DATA.md` tidak berubah, jadi butirnya (`npm run cek`, `npm test`, `allowScripts`, Bruno, `/docs`, tiga butir **(Modul 21)**) boleh dicentang. `CORS_ORIGIN` tidak kamu ubah; `http://localhost:5173` sudah ada di sana sejak Modul 20. Paket `frontend` dipasang dengan versi tertulis (Praktik 2), tercatat di `package-lock.json`, dan `npm install` menjawab `found 0 vulnerabilities`.

   Kirim ringkasannya lewat **Review changes** → **Comment** → **Submit review**. Kalau ada berkas terlarang yang telanjur ikut, **jangan di-*merge***: keluarkan dengan `git rm --cached frontend/.env.local` (folder: `git rm -r --cached frontend/node_modules`), pastikan tertangkap `frontend/.gitignore`, lalu *commit* dan *push* lagi. Kalau yang ikut adalah sandi atau token, anggap sudah bocor dan ganti lebih dulu, seperti di Modul 20.
3. ***Merge.*** Pilih **Create a merge commit**, klik **Merge pull request** → **Confirm merge**, lalu **Delete branch**.
4. **Pulang ke `main`.** Di terminal akar `rumah-pintar-mini` (Vite sudah dihentikan):

   ```text
   git switch main
   git pull --prune
   git branch -d fitur/dashboard
   ```

   Jangan kaget kalau tepat sesudah `git switch main`, folder `frontend` nyaris kosong: `main` di laptopmu belum mengenal dashboard, jadi yang tersisa hanya yang tidak pernah ikut Git (`node_modules`, serta `dist` dan `.env.local` kalau ada). `git pull --prune` mengambil hasil *merge* dari GitHub, dan semua berkasnya kembali tanpa perlu `npm install` lagi. Kalau backend menyala, `npm run dev` di folder `frontend` menampilkan dashboard persis seperti sebelumnya.

Backend, database, dan broker tidak terpengaruh: folder `backend` sama di kedua cabang, dan perangkat Modul 21 tetap terdaftar.

### D. Simpan catatan belajarmu

Buka repositori **`belajar-iot`** di jendela VS Code baru (**File → New Window**, lalu **File → Open Folder…**), buat **`modul-22/catatan.md`** di samping `pemanasan.js` dan `kartu.html`, lalu isi dengan angka dari layarmu sendiri:

```markdown
# Catatan Modul 22 — Dashboard v0.1

| Yang diukur | Angkaku |
| :--- | :--- |
| Kartu sensor di detail Node 1, atau f00d00000001 di jalur laptop (Praktik 6) | … kartu |
| Jam "diperbarui pukul … WIB" di detail itu, dan jam laptopku saat itu (Praktik 6) | … WIB / … |
| GET /devices di tab Network saat dashboard dibuka dengan npm run dev (Praktik 5) | … kali |
| Permintaan baru di tab Network sesudah cookie akses kuhapus, lalu perangkat kuketuk lagi (Praktik 6) | … |
| Berkas JavaScript di dist/ (kolom gzip) dan lama npm run build (Praktik 8) | … kB, … ms |
| Berkas di tab Files changed pull request "dashboard v0.1" (➕ C) | … berkas |

Yang paling mengejutkanku: …
```

Kalau laptopmu memakai WITA atau WIT, baris kedua memperlihatkan selisihnya, karena dashboard selalu menulis jam WIB. *Commit* dan *push* di repositori **`belajar-iot`**.

**Bukti lulus Modul 22** (bandingkan dengan ✅ di bawah): sesudah *login*, detail Node 1 dan Node 2 (jalur laptop: `f00d00000001`) menampilkan bacaan terbaru semua sensor dari API, cocok dengan jawaban Bruno (Praktik 6); dashboard rapi tanpa gulir mendatar di lebar 375 px (Praktik 7); gladi bersih syarat lulus berhasil dalam sekali jalan (Praktik 8); dan *pull request* "dashboard v0.1" sudah ditinjau dengan butir **(Modul 22)**, lalu di-*merge* (➕ C).

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| ***Build*** dan **`dist/`** | `npm run build` memeriksa tipe (`tsc -b`), lalu Vite mengemas "hidangan siap saji" di `dist/`, yang dicicipi lewat `npm run preview`. |
| ***Cookie* `HttpOnly`** dan **`SameSite=Strict`** | Tanda pada gelang dan kartu terusan: tak terbaca JavaScript, dan hanya dilampirkan pada permintaan dari halaman satu situs (`localhost` dengan `localhost`, bukan `127.0.0.1`). |
| **CORS** (*Cross-Origin Resource Sharing*) | Izin di kepala jawaban backend agar halaman dari asal lain, seperti `http://localhost:5173`, boleh membacanya; daftarnya di `CORS_ORIGIN` (Modul 20). |
| **`credentials: "include"`** | Pilihan `fetch` agar browser menyimpan dan melampirkan *cookie* untuk backend di asal lain; tanpanya, gelang tak pernah sampai ke satpam. |
| **CSS** (*Cascading Style Sheets*) | "Kulit" halaman: aturan warna, ukuran, jarak, dan susunan. |
| **DevTools** | Perkakas bawaan Chrome dan Edge (**F12**): **Elements**, **Console**, **Network**, **Application** (*cookie*), dan mode perangkat untuk meniru lebar HP. |
| **DOM** (*Document Object Model*) | Pohon elemen yang dibangun browser dari HTML dan bisa diubah JavaScript; tab **Elements** menampilkannya. |
| **`fetch`** | Fungsi bawaan untuk mengirim permintaan HTTP; ia hanya gagal kalau server tak bisa dihubungi atau diblokir CORS, jadi 401 dan 404 diperiksa sendiri lewat `res.ok`. |
| **HMR** (*Hot Module Replacement*) | Vite memasang kode yang baru disimpan ke halaman yang terbuka tanpa memuat ulang. |
| **HTML** (*HyperText Markup Language*), **tag**, **elemen**, dan **atribut** | HTML adalah "kerangka" halaman, ditulis dengan tag seperti `<p>` dan `</p>`; elemen adalah satu bagian utuh dari tag pembuka sampai penutup beserta isinya; atribut adalah keterangan di tag pembuka, seperti `href="/on"`. |
| **JavaScript** | "Otot" halaman: kode di browser yang menanggapi klik, mengambil data, dan mengubah isi halaman tanpa memuat ulang. |
| **JSX** | Tulisan mirip HTML di berkas `.tsx`, dengan `className` pengganti `class` dan `{}` sebagai jendela ke JavaScript. |
| **Kelas** dan ***utility class*** | Nama di elemen (di JSX: `className`) yang dipakai aturan CSS; *utility class* Tailwind masing-masing mengatur satu hal, seperti `p-4` atau `text-2xl`. |
| **`key`** | Pengenal unik setiap elemen hasil `map()` agar React tahu butir mana yang mana; dashboard memakai `device_id`. |
| **Komponen** | "Balok LEGO" tampilan: fungsi berhuruf awal besar, seperti `KartuSensor`, yang mengembalikan JSX dan bisa dipasang berkali-kali. |
| ***Lint*** dan **oxlint** | Pemeriksaan kebiasaan rawan salah tanpa menjalankan kode; templat create-vite 9.3.1 memakai oxlint lewat `npm run lint`. |
| ***Props*** | "Titipan" dari komponen induk ke anak, seperti `label`, `nilai`, dan `satuan` untuk `KartuSensor`; anaknya hanya membaca. |
| **React** | *Library* untuk menyusun tampilan dari komponen; ia menggambar ulang saat *state* berubah dan hanya mengubah bagian yang berbeda. |
| **React DevTools** | Ekstensi browser yang menambah tab **Components** (pohon komponen, *props*, *state*) dan **Profiler** ke DevTools. |
| ***Refresh token*** ("kartu terusan") | *Cookie* `sesi` (paling lama 7 hari) yang hanya dibawa ke loket `/auth/…`; saat gelang 15 menit habis, `api.ts` menukarnya sekali di `POST /auth/refresh` dengan gelang baru. |
| ***Render*** | Saat React memanggil fungsi komponen untuk menghitung tampilannya; bagian yang berbeda baru ditulis ke halaman pada tahap *commit*. |
| **Responsif**, ***mobile first***, dan ***breakpoint*** | Susunan halaman menyesuaikan lebar layar, dimulai dari HP: gaya tanpa awalan berlaku di semua lebar, dan gaya berawalan mulai *breakpoint*-nya ke atas (`sm:` 40rem/640 px, `md:` 48rem/768 px, `lg:` 64rem/1024 px). |
| ***State*** dan **`useState`** | "Papan tulis kecil" milik komponen, `const [nilai, setNilai] = useState(awal)`: isinya diingat di antara dua *render*, dan `setNilai` membuat layar digambar ulang. |
| **StrictMode** | `<StrictMode>` di `main.tsx`: khusus di mode pengembangan, setiap komponen dipasang ulang sekali, jadi efek berjalan dua kali dan `GET /devices` tampak dua kali di tab **Network**; di hasil *build* hanya sekali. |
| **Tailwind CSS** | Kumpulan *utility class* siap pakai; versi 4 cukup dipasang lewat *plugin* `@tailwindcss/vite` dan `@import "tailwindcss";`, tanpa `tailwind.config.js`. |
| **Tiga keadaan** | Memuat, galat, dan kosong: selalu disiapkan setiap layar yang mengambil data, di samping hasilnya (papan informasi stasiun). |
| **`useEffect`** | *Hook* untuk bekerja sesudah layar tampil ("sesudah duduk, baru pesan"); dengan `[]` ia berjalan sekali saat komponen dipasang, dan *cleanup* `ignore` membuang jawaban yang terlambat. |
| **Vite** | "Dapur" `npm run dev` di `http://localhost:5173` sekaligus pengemas hasil *build*; ia menghapus label tipe TypeScript tanpa memeriksanya. |
| **`VITE_…`** dan **`.env.local`** | Variabel berawalan `VITE_`, seperti `VITE_API_BASE`, ditanam ke JavaScript yang dikirim ke browser, jadi hanya untuk alamat, bukan rahasia; `.env.local` tempat menulisnya dan tidak ikut Git. |
| **XSS** (*cross-site scripting*) | Skrip asing yang berhasil berjalan di halamanmu; JSX menangkalnya dengan meloloskan teks dari API (nama perangkat tampil sebagai tulisan biasa), selama `dangerouslySetInnerHTML` tidak dipakai. |

## 📝 Kuis (5 soal)

1. Buka lagi `halaman-m10-asli.html` dari Praktik 1. (a) Mana kerangka, kulit, dan ototnya? (b) Ototnya bekerja di browser atau di ESP32? (c) Mengapa memuat ulang halaman sesudah mengetuk **Nyalakan lampu** bisa memerintah lampu sekali lagi? (d) Apa bedanya dengan tombol ber-`addEventListener` di Praktik 1?
2. Di dashboard v0.1: (a) *Props* atau *state*, dan milik komponen mana: isi kotak email di formulir *login*; `Suhu` dan `28.1` di sebuah `KartuSensor`; daftar perangkat dari `GET /devices`; pesan galat `DaftarPerangkat` saat database mati? (b) Temanmu menyimpan email di variabel biasa `let email = ""` dan mengubahnya di `onChange`, tanpa `useState`. Mengapa tidak bekerja? (c) Temanmu yang lain menulis `value={email}` dari `useState`, tetapi lupa `onChange`. Apa yang terjadi saat ia mengetik?
3. Efek `GET /auth/me` di `App.tsx` diakhiri `[]`, dan `DaftarPerangkat` mengambil `GET /devices` di `useEffect` dengan *cleanup* `ignore`. (a) Apa arti `[]`? (b) Saat dashboard dibuka dalam keadaan sudah *login*, tab **Network** menunjukkan `GET /auth/me` dan `GET /devices` masing-masing dua kali. Mengapa, dan apakah itu galat? Berapa kali lewat `npm run preview`? (c) Apa yang dicegah `ignore`? (d) Mengapa `POST /auth/login` dikirim dari `onSubmit`, bukan dari `useEffect`?
4. Temanmu menjalankan `npm run dev -- --host 127.0.0.1` dengan `VITE_API_BASE=http://localhost:8080` di `.env.local`, membuka `http://127.0.0.1:5173`, lalu *login*: `POST /auth/login` dijawab **200**, layar daftar perangkat muncul sebentar, lalu kembali ke formulir *login*. (a) Mengapa? (b) Mengapa *refresh* sekali di `api.ts` tidak menolong? (c) Sebutkan dua cara membereskannya. (d) Tanpa `--host`, mengapa `http://127.0.0.1:5173` di laptop Windows penulis tidak terbuka?
5. Apa yang tampil, dan keadaan mana itu (memuat, galat, kosong, berhasil, atau kembali ke *login*)? (a) Sesaat sesudah kamu mengetuk Node 1, sebelum jawabannya datang. (b) Backend baru dinyalakan ulang, lalu kamu membuka detail `f00d00000001` sebelum simulator mengirim lagi. (c) Kontainer `rumahpintar-db` kamu hentikan, lalu kamu kembali dari detail ke daftar. (d) Dashboard terbuka 20 menit, lalu kamu mengetuk Node 1 lagi (apa yang terlihat di tab **Network**?). (e) Terakhir *login* 8 hari lalu, kamu membuka `http://localhost:5173`. (f) Tiga tanda apa yang kamu periksa di mode perangkat selebar 375 px?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) **Kerangka (HTML)** adalah hampir semuanya: `<head>`, `<h2>`, `<p>`, `<b>`, tautan `<a href="/on">` dan `<a href="/off">`, `<br>`, dan `<small>`. **Kulit (CSS)** hanya atribut `style` di `<body>` ditambah gaya bawaan browser. **Otot (JavaScript)** **tidak ada**. (b) Di **ESP32**: `server.on("/on", …)` menangani ketukan, lalu `html.replace(…)` mengisi penanda seperti `%LAMPU%` dan mengirim halaman utuh baru (Konsep 2). (c) Tautan itu mengirim **`GET /on`**, dan ESP32 menjawab dengan halaman baru tanpa mengalihkan alamat, jadi bilah alamat tetap berakhiran `/on`; memuat ulang = `GET /on` lagi. (d) Tombol ber-`addEventListener` bekerja **di browser**: tulisannya diganti lewat `textContent`, tanpa permintaan ke server dan tanpa memuat ulang. Otot pindah ke browser: lompatan yang dilanjutkan React (Praktik 1).
2. (a) Isi kotak email: ***state*** milik `Login`. `Suhu` dan `28.1`: ***props*** `label` dan `nilai` dari induknya (`App` di Praktik 3, `DetailPerangkat` sejak Praktik 6), yang hanya dibaca `KartuSensor`. Daftar perangkat (`null` selama memuat) dan pesan galatnya: ***state*** milik `DaftarPerangkat` (Konsep 6–7). (b) Variabel biasa **tidak diingat** di antara dua *render* (`email` kembali `""` setiap fungsi komponen dipanggil), dan mengubahnya **tidak membuat layar digambar ulang**. (c) Kotaknya **tidak bisa diketik** karena terkunci pada *state* yang tak pernah berubah, dan **Console** memperingatkan isian hanya-baca (`This will render a read-only field.`). Formulir terkendali selalu butuh pasangan `value` dan `onChange` (Praktik 4).
3. (a) Daftar dependensi kosong: efeknya berjalan **sekali**, sesudah `App` tampil pertama kali (Konsep 8). (b) Di mode pengembangan, `<StrictMode>` memasang ulang setiap komponen sekali: efek berjalan, dibereskan (*cleanup*), lalu berjalan lagi, untuk memancing efek yang lupa dibereskan. **Bukan galat.** Lewat `npm run preview`, masing-masing muncul **sekali**. (c) **Jawaban lama menimpa keadaan yang lebih baru**: sesudah *cleanup*, `ignore` bernilai `true`, jadi jawaban yang terlambat tidak sampai ke `setPerangkat`. (d) *Login* adalah **aksi pengguna** (tombol **Masuk** ditekan), bukan hal yang disamakan setiap kali layar tampil. Di efek, ia berjalan sendiri, bahkan dua kali di mode pengembangan; tempatnya di penangan kejadian seperti `onSubmit` (Konsep 7–8).
4. (a) `127.0.0.1` dan `localhost` adalah **dua situs berbeda**. CORS mengizinkan `http://127.0.0.1:5173` (ada di `CORS_ORIGIN` bawaan), jadi *login* dijawab **200**, tetapi browser **tidak menyimpan** *cookie* `SameSite=Strict` dari jawaban lintas situs itu. `GET /devices` berangkat tanpa gelang dan dijawab **401** (Konsep 9). (b) Kartu terusan (`sesi`) juga tak pernah tersimpan, jadi `POST /auth/refresh` pun **401**, dan `DaftarPerangkat` mengembalikan temanmu ke formulir: ***login* berputar** (🚨). (c) Pertama: jalankan `npm run dev` tanpa `--host` dan buka **`http://localhost:5173`**. Kedua: hapus atau kosongkan `VITE_API_BASE` di `.env.local`, hentikan `npm run dev` (**Ctrl + C**), lalu jalankan lagi; alamat API kembali **mengikuti nama host halaman** (`127.0.0.1:5173` mengetuk `127.0.0.1:8080`). Kalau `VITE_API_BASE` perlu diisi, samakan nama host-nya dengan halaman. (d) Dengan setelan bawaan, Vite mendengarkan `localhost`, yang di laptop Windows penulis hanya IPv6 `[::1]`; `127.0.0.1` adalah IPv4, jadi tak ada yang menjawab (Konsep 9).
5. (a) **Memuat**: tulisan memuat, karena datanya masih `null`. (b) Backend menyimpan bacaan terbaru di **memori**, jadi `GET /devices/f00d00000001/latest` dijawab **404** sampai simulator mengirim lagi. `DetailPerangkat` menampilkan **catatan netral** (belum ada bacaan sejak backend dinyalakan), bukan kotak galat merah (Konsep 10, Praktik 6). (c) **Galat**: `GET /devices` dijawab **503**, dan kotak galat berisi `database sedang tidak bisa dihubungi, coba lagi sebentar lagi`. Kalau kamu menekan **F5**, `GET /auth/me` pun gagal (bukan 401), dan pesannya tampil sebagai `galatAwal` di atas formulir *login* (Praktik 5). (d) **Berhasil**, tanpa terasa. Gelang sudah dibuang browser sesudah 15 menit, jadi `GET …/latest` dijawab **401**; `api.ts` mengetuk **`POST /auth/refresh`** sekali (200), lalu mengulang permintaannya. Di tab **Network**, refresh itu tampak di antara `latest` yang 401 dan yang 200 (Konsep 9, Praktik 6). (e) **Kembali ke *login***: kartu terusan (paling lama 7 hari) sudah dibuang browser, jadi `GET /auth/me` dan *refresh* sama-sama 401, dan formulir tampil tanpa kotak galat, karena sesi habis bukan gangguan. (f) **Tanpa gulir mendatar**, **semua kartu utuh**, dan **teks panjang** (nama perangkat, `device_id`) terpotong rapi tanpa membuat kepala halaman meluber (Konsep 11, Praktik 7).

</details>

---

## ✅ Checklist kelulusan Modul 22

Syarat lulus dari Silabus: **setelah *login*, dashboard menampilkan bacaan terbaru semua sensor dari API, rapi di layar HP.** **Jalur tanpa perangkat:** semua butir boleh dicentang dengan simulator Modul 21 dan perangkat latihan `f00d00000001`, yang menggantikan Node 1 dan Node 2 (bagian khusus Node 2 cukup dibaca). **Layar HP** diperiksa dengan mode perangkat DevTools; HP sungguhan lewat WiFi adalah pilihan di 🔬.

- [ ] `pemanasan.js` mendapat jawaban `GET /health` dari backend v1.0 tanpa *login*, dan jawabanku cocok dengan “Kunci uji dirimu” (🔁).
- [ ] `kartu.html` tampil di browser tanpa memasang apa pun, dan angka yang kuubah di tab **Elements** kembali semula saat halaman dimuat ulang (Kemenangan Cepat).
- [ ] Halaman Node 1 Modul 10 sudah kubedah di **Elements** dan kuberi kulit (`<style>`, kelas) serta otot (tombol pengubah tulisan tanpa memuat ulang); isi formulir biasa tercetak oleh `penerima-webhook.js`, dan `fetch` JSON dari halaman yang sama ditolak CORS di **Console** (Praktik 1).
- [ ] Proyek `frontend` buatan `npm create vite@9.3.1` menyala di `http://localhost:5173` dengan Tailwind v4 tanpa `tailwind.config.js`, React DevTools menampilkan pohon komponennya, dan `git status` di cabang `fitur/dashboard` tidak menyebut `node_modules` (Praktik 2).
- [ ] `KartuSensor` dipakai ulang untuk setiap bacaan dengan *props* bertipe dari `src/types.ts`, dan salah ketik `kelembaban` langsung ditandai VS Code dan ditolak `npm run build` (Praktik 3).
- [ ] ⭐ Formulir *login* membuatku masuk dengan akun Modul 20: **Network** menunjukkan `POST /auth/login` (biasanya didahului *preflight* `OPTIONS`) dijawab 200, *cookie* `akses` tampak di **Application**, dan sandi salah atau backend mati dijawab dengan pesan yang bisa dimengerti (Praktik 4).
- [ ] Saat dibuka, dashboard bertanya `GET /auth/me` lalu memilih sendiri formulir *login* atau daftar perangkat, yang menampilkan lencana `status` dan `kunci` (`dicabut` menonjol) serta keadaan memuat, galat, dan kosong; aku tahu sebab `GET /devices` tampak dua kali di mode pengembangan, dan **Keluar** mengembalikanku ke formulir (Praktik 5).
- [ ] ⭐ Sesudah *login*, detail Node 1 dan Node 2 menampilkan **semua sensornya** dari `GET /devices/:id/latest`, dengan nama dan lokasi perangkat di judul, jam "diperbarui pukul … WIB", dan "—" untuk bacaan `null`, cocok dengan jawaban Bruno (Praktik 6).
- [ ] Perangkat tanpa bacaan sejak backend dinyalakan tampil dengan catatan netral (404), dan setelah *cookie* `akses` kuhapus di **Application**, mengetuk perangkat lagi tetap berhasil, dengan `POST /auth/refresh` di **Network** (Praktik 6).
- [ ] ⭐ Di mode perangkat DevTools selebar 375 px, 768 px, dan 1280 px, dashboard tidak bisa digulir mendatar, semua kartu utuh, dan teks panjang dipotong rapi tanpa membuat kepala halaman meluber (Praktik 7).
- [ ] ⭐ `npm run lint` bersih, `npm run build` lolos, `npm run preview` menyajikan isi `dist/`, `package.json` berversi `0.1.0`, dan gladi bersih syarat lulus berhasil sekali jalan: *login* → semua sensor Node 1 dan Node 2 → lebar 375 px (Praktik 8).
- [ ] `frontend/README.md` sudah ada, templat *pull request* punya butir **(Modul 22)**, dan catatan belajarku tersimpan di `belajar-iot/modul-22/catatan.md` (➕ A, B, dan D).
- [ ] ⭐ Semua pekerjaan Modul 22 sudah ada di `main` lewat *pull request* "dashboard v0.1" yang ditinjau dengan butir **(Modul 22)**: tanpa `.env.local`, tanpa rahasia di `VITE_…`, dan tanpa token di `localStorage` (➕ C).

🎉 **Fase 4 dimulai.** Rumah Pintar Mini kini punya wajah: halaman buatanmu yang meminta *login*, menjaga sesi tanpa pernah memegang token, menampilkan setiap perangkat beserta lencana kuncinya, dan menyajikan bacaan terbaru semua sensor dengan jam WIB, rapi di HP maupun laptop. Angkanya masih diam: kartu baru berubah saat detail perangkatnya dibuka ulang. Membuatnya bergerak sendiri adalah tugas modul berikutnya; tiga modul lagi menuju Checkpoint Fase 4 di Modul 25: dashboard yang bisa dipakai orang lain dari HP tanpa dibantu.

> ➡️ **Modul berikutnya:** Modul 23 — Dashboard Realtime: Grafik, Gauge, Riwayat, & Status. Angka di dashboard bergerak sendiri begitu bacaan tiba lewat Socket.IO (dengan *cookie* *login* yang sama), grafik suhu *live* dan riwayat 7 hari bisa dibaca dan dijelajahi, kartu status menunjukkan perangkat mana yang hidup dan kapan terakhir terlihat, dan dashboard mulai dibuka dari HP sungguhan lewat WiFi rumah.

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- **React 19.3.1** ([react.dev](https://react.dev/learn)): [JSX](https://react.dev/learn/writing-markup-with-jsx), [*props*](https://react.dev/learn/passing-props-to-a-component), [daftar dan `key`](https://react.dev/learn/rendering-lists), [*state*](https://react.dev/learn/state-a-components-memory), [mempertahankan *state*](https://react.dev/learn/preserving-and-resetting-state), [efek dan pengambilan data](https://react.dev/learn/synchronizing-with-effects) (pola `ignore`), [`StrictMode`](https://react.dev/reference/react/StrictMode), [aturan *hook*](https://react.dev/reference/rules/rules-of-hooks), [*render* dan *commit*](https://react.dev/learn/render-and-commit), dan [atribut elemen React DOM](https://react.dev/reference/react-dom/components/common) (`dangerouslySetInnerHTML`). JSX yang meloloskan teks diuji penulis dengan `react-dom/server` (Konsep 5 dan 🔬).
- **Vite 8.3.5** ([vite.dev](https://vite.dev/guide/), syarat Node.js 20.19+ atau 22.12+): [fitur](https://vite.dev/guide/features) (HMR, TypeScript tanpa pemeriksaan tipe), [variabel lingkungan](https://vite.dev/guide/env-and-mode), pilihan [*dev server*](https://vite.dev/config/server-options) dan [*preview*](https://vite.dev/config/preview-options); [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) 6.1.2.
- **create-vite 9.3.1**: [kode sumber](https://github.com/vitejs/vite/tree/main/packages/create-vite) dan templat `react-ts`, dibaca dari proyek hasilnya.
- **Tailwind CSS 4.3.3**: [instalasi dengan Vite](https://tailwindcss.com/docs/installation/using-vite), [pindah dari v3](https://tailwindcss.com/docs/upgrade-guide) (syarat Chrome 111+, Safari 16.4+, Firefox 128+), [kelas utilitas](https://tailwindcss.com/docs/styling-with-utility-classes) dan [deteksinya](https://tailwindcss.com/docs/detecting-classes-in-source-files), [desain responsif](https://tailwindcss.com/docs/responsive-design), dan [`hover` serta `focus`](https://tailwindcss.com/docs/hover-focus-and-other-states).
- **TypeScript 6.0.3**: [referensi `tsconfig`](https://www.typescriptlang.org/tsconfig/) dan [pengumuman 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/). **oxlint 1.89.0**: [dokumentasi *linter* Oxc](https://oxc.rs/docs/guide/usage/linter).
- **MDN Web Docs**: [HTML, CSS, dan JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development), [modul JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) dan [`credentials`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) (dan nilai `null` di [`Access-Control-Allow-Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin)), [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [situs](https://developer.mozilla.org/en-US/docs/Glossary/Site), [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting), dan [`toLocaleTimeString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString); [RFC 6265 §8.5](https://www.rfc-editor.org/rfc/rfc6265#section-8.5) (*cookie* tidak dipisahkan menurut port).
- **DevTools browser**: Chrome DevTools ([Console](https://developer.chrome.com/docs/devtools/console), [Network](https://developer.chrome.com/docs/devtools/network/reference), [mode perangkat](https://developer.chrome.com/docs/devtools/device-mode), dan [*cookie* di Application](https://developer.chrome.com/docs/devtools/application/cookies)) serta [DevTools Microsoft Edge](https://learn.microsoft.com/en-us/microsoft-edge/devtools/landing/).
- **React DevTools 8.0.0**: [panduan](https://react.dev/learn/react-developer-tools), [catatan rilis](https://github.com/facebook/react/blob/main/packages/react-devtools/CHANGELOG.md), dan kode sumbernya di repositori yang sama.
- **npm 11**: [`npm pkg`](https://docs.npmjs.com/cli/v11/commands/npm-pkg) (Praktik 8.3) dan [*workspaces*](https://docs.npmjs.com/cli/v11/using-npm/workspaces) (🔬).
- **Next.js 16** (hanya wawasan di 🔬): [rute dari susunan folder](https://nextjs.org/docs/app/getting-started/layouts-and-pages), [komponen server](https://nextjs.org/docs/app/getting-started/server-and-client-components), dan [ekspor statis](https://nextjs.org/docs/app/guides/static-exports).
- **Backend v1.0** (dibaca, tidak diubah): *login*, *cookie*, satpam, dan CORS dari [`keamanan.ts`](../../proyek-rumah-pintar-mini/backend/src/auth/keamanan.ts) dan [`routes/auth.ts`](../../proyek-rumah-pintar-mini/backend/src/routes/auth.ts) dengan [@fastify/cors](https://github.com/fastify/fastify-cors) 11.3.1; `GET /devices` dan `…/latest` dari [`routes/perangkat.ts`](../../proyek-rumah-pintar-mini/backend/src/routes/perangkat.ts); bentuk data dari [Lampiran A, kontrak data 1.4](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini) dan [`KONTRAK-DATA.md`](../../proyek-rumah-pintar-mini/KONTRAK-DATA.md).
- **Modul sebelumnya**: [Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md) (`penerima-webhook.js`, `generate-dummy.js`, modul ES); [Modul 10](../../fase-2-konektivitas/modul-10-wifi-dan-http/README.md) (halaman sakelar Node 1, `jaringan.cpp` baris 80–97); [Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md) (TypeScript, Bruno, Zod); [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md) (gelang, kartu terusan, `CORS_ORIGIN`, satpam, janji *refresh* sekali dan XSS untuk dashboard); [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md) (backend v1.0, `kunci`, `f00d00000001`, simulator). Syarat lulus dikutip dari [Silabus §7 Modul 22](../../SILABUS.md#modul-22--html-css--react-typescript-dari-nol-untuk-dashboard-iot).

**Gambar.** Diagram buatan sendiri dan tangkapan layar dashboard milik penulis dilisensikan **CC BY 4.0**; file `.svg` diagram ada di folder `aset/` supaya bisa kamu ubah. Tangkapan layar dipotong dan disusun ulang, dengan judul, nomor, dan keterangan dari penulis. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-22`, `halaman-tiga-lapis`, `pohon-komponen`, `alur-login-browser`, `tiga-keadaan-layar`, `diagram-proyek-modul-22` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer, dari perilaku backend v1.0 yang diuji penulis, halaman Node 1 Modul 10, kode dashboard v0.1, dan dokumentasi di atas. Nama perangkat, angka, dan isi layarnya **contoh**. | CC BY 4.0 |
| `dashboard-login`, `dashboard-daftar-perangkat`, `dashboard-detail-hp-dan-laptop` | Tangkapan layar asli dashboard v0.1 ([`kode/frontend/`](kode/frontend/)) lawan backend v1.0 sungguhan, di Edge 155 tanpa layar, latar terang, skala 2: formulir *login* di lebar 1280 px dalam empat keadaan (kosong, sandi salah `401`, backend mati dengan pesan kode 0, sesi habis); lima perangkat keadaan akhir Modul 21 dengan lencana `status` dan `kunci`; detail Node 1 di lebar HP 375 px (mode perangkat, halaman utuh) dan 1280 px. | CC BY 4.0, Oktober 2026. React, React DOM, Vite, dan Tailwind CSS berlisensi MIT. Akun contoh `@rumah.test`, sandi hanya titik, angka sensor dari simulator. |
| `sakelar-modul-10-dibedah` | Tangkapan layar asli tiga panel Praktik 1 di lebar HP 375 px: halaman Node 1 Modul 10 apa adanya (`halaman-m10-asli.html`: teks `HALAMAN` di `jaringan.cpp` baris 80–97 dengan angka ilustrasi), versi berkulit dan berotot (`halaman-m10-kulit-otot.html`), dan sesudah **Nyalakan lampu** diketuk. Diambil di Edge 155 tanpa layar, dengan halaman dilayani server kecil di `http://localhost`, bukan `file://`; isi halamannya sama. | Halaman dan kodenya bagian dari kurikulum ini. CC BY 4.0, Oktober 2026 |
| `vite-templat-pertama` | Tangkapan layar asli halaman sambutan templat `react-ts` create-vite 9.3.1 yang belum diubah, lewat `npm run dev` di `http://localhost:5173` (Praktik 2.3), di Edge 155 tanpa layar, lebar 1280 px, tema terang. | Templat create-vite, Vite, dan React berlisensi MIT; logo Vite, React, GitHub, Discord, X, dan Bluesky milik pemiliknya masing-masing, tampil apa adanya sebagai isi templat. Untuk tujuan pendidikan, Oktober 2026. Judul, nomor, dan keterangan: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua perintah dan kode modul ini dijalankan penulis di Windows 11 25H2 (*build* 10.0.26200.9711) dengan Node.js 24.21.0, npm 11.19.0, dan Docker Engine 29.5.3. Dashboard diuji terhadap **backend v1.0 Modul 21 yang sungguhan**: salinan `backend/` dan `alat/` keadaan akhir Modul 21, `.env` dari `.env.example` (`CORS_ORIGIN` bawaan; yang diubah hanya alamat database dan broker, sandi broker, dan `JWT_SECRET`), dan database `timescale/timescaledb:2.30.2-pg17` berisi keadaan akhir Modul 21: migrasi sampai `010_kunci_perangkat.sql`, riwayat contoh, akun admin dan viewer, empat perangkat terdaftar dengan kunci `c0ba00000001` dicabut, dan `f00d00000002` tidak terdaftar. Broker MQTT lab adalah broker kecil yang meniru Mosquitto berkunci Modul 21. Node 1 dan Node 2 adalah simulator lab berangka tetap, sedangkan `f00d00000001` dikirim `alat/simulator-perangkat.js` dengan angka acak. Papan dan gateway Pi sungguhan tidak dicoba ulang, karena dashboard hanya membaca API.

Dashboard (Praktik 4–8) dan semua tangkapan layar direkam di Microsoft Edge 155.0.4283.62 tanpa layar lewat DevTools Protocol, dengan zona browser diemulasi `Asia/Jakarta`; lebar HP dan tablet ditiru mode perangkat. Rekaman susulan memakai Edge 155 dan Google Chrome 156.0.8078.47, juga tanpa layar: Kemenangan Cepat dan Praktik 1 dari `file://`, Praktik 2–3 lewat Vite, serta *login* viewer dan teks DevTools Praktik 4–8. Teks **Network**, **Console**, dan **Application** dibaca dari UI DevTools bawaan di tab terpisah, bukan jendela **F12**, jadi tata letaknya bisa sedikit beda. Yang tidak bisa direkam tanpa layar ditulis dari sumber lain: label menu klik kanan (**Inspect**, **Inspeksi**, atau **Periksa**) dari berkas bahasa browser, bilah mode perangkat dari dokumentasinya, teks gelembung validasi dari `validationMessage`, panel React DevTools dari kode sumber rilis 8.0.0, dan judul isu **Issues** dari kode DevTools. Layar Bruno juga tidak direkam; permintaan yang sama dikirim dari halaman.

Keluaran `npm` dan galat `TS2551` (Praktik 3.4) direkam di konsol Windows PowerShell 5.1, bukan terminal VS Code (kecuali kotak `npm` 2.7 dan *build* 3.4 yang berhasil: lewat skrip, jadi `transforming...` tetap tampil); create-vite direkam dengan setelan terminal VS Code, jadi bersimbol `◇` dan `│` (konsol Windows lama: `o` dan `|`). Keluaran git direkam di repositori latihan sekali pakai: `git status` Praktik 2.7 dengan git 2.51.1 di Git Bash, Praktik 7–8 dan ➕ di PowerShell; peringatan `LF will be replaced by CRLF` hanya muncul kalau `core.autocrlf=true`. Lab akhir memakai port `8080` dan `5173`; port lain di rekaman susulan (misalnya Vite `5781` dan backend `5782`) ditulis `5173`, `8080`, dan `3000` (penerima Modul 4). Kode tiap tahap lebih dulu dicoba dengan backend tiruan, tetapi kotak **Hasilnya** tidak memakainya; 🧩 Tantangan hanya diuji dengan tiruan itu atau dicek dari kode backend. Laptop penulis berzona WITA, jadi jam log dicetak dengan `TZ=Asia/Jakarta` atau ditulis ulang dalam WIB.

Yang **tidak** diuji: Firefox dan Safari, termasuk *cookie* dan CORS-nya; HP sungguhan lewat WiFi (🔬); browser berzona selain `Asia/Jakarta` (kodenya selalu memakai zona itu); gelang yang benar-benar habis setelah 15 menit dan kartu terusan setelah 7 hari (ditiru dengan menghapus *cookie*, seperti Praktik 6.5); detail perangkat `dicabut` atau `belum-terdaftar` yang masih punya bacaan di memori (`kiriman diabaikan`) dan perangkat dicabut yang `online`; mode gelap; serta perintah macOS, yang ditulis dari Modul 16–21. Jam, lama muat, nama dan ukuran berkas *build*, jumlah paket npm, dan angka sensor di layarmu pasti berbeda, jadi keluaran seperti itu ditandai **contoh**.

---

[⬅️ Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md) · [Fase 4](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 23 — Dashboard Realtime: Grafik, Gauge, Riwayat, & Status](../modul-23-dashboard-realtime/README.md) ➡️**
