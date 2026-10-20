# Modul 16 — Backend Pertama dengan TypeScript Ringan: Menerima Data, API, & Git untuk Tim

🌐 **Bahasa Indonesia** · [English](../../en/phase-3-backend-data/module-16-backend-typescript-api-git/README.md)

*Fase 3 · Minggu 16 · Perangkat keras (*hardware*): **Kit A + B** — Node 1, Node 2, dan gateway Pi dari Modul 12–15, atau **laptop saja** (simulator modul ini menggantikan perangkat) · Prasyarat: **Modul 4** (JavaScript dan Node.js), **Modul 11** (MQTT dan kontrak data), **Modul 15** (kontrak data 1.2) · Waktu: 8–10 jam, dicicil dalam satu minggu*

[⬅️ Modul 15](../../fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 17 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-17--database-pertama-sql-dasar--skema-rumah-pintar-mini-postgresql-via-docker)

---

Selamat datang di **Fase 3**. Selama Fase 2, semua pesan Rumah Pintar Mini mengalir ke broker di Raspberry Pi, lalu Node-RED menampilkannya di HP dan menyalakan kipas saat ruangan panas. Itu cara tercepat untuk melihat hasil, tetapi ada batasnya: Node-RED hanya meneruskan pesan, tidak memeriksa apakah isinya benar, tidak menyediakan "pintu" yang rapi untuk program lain, dan tidak mengingat apa pun setelah dimulai ulang. Mulai minggu ini, kamu membangun **otak** Rumah Pintar Mini sendiri: sebuah **backend**, yaitu program server yang berjalan terus di laptop, mendengarkan semua pesan perangkat, memeriksanya terhadap kontrak data, dan menjawab pertanyaan program lain lewat **API**.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Bacaan Node 1 dan Node 2 hanya bisa dilihat di dashboard Node-RED. | Belum ada program yang mengumpulkan data dan menjawab pertanyaan "berapa suhu terakhir di kebun?" dari program lain. | **Backend Fastify** dengan **API**: `GET /devices` dan `GET /devices/:id/latest` (Konsep 1–2, Praktik 3 dan 5) |
| Pesan yang rusak (kolom salah ketik, angka di luar rentang) diteruskan begitu saja. | Tidak ada yang mencocokkan pesan dengan kontrak data. | **"Jangan percaya perangkat"**: setiap pesan dicek dengan **Zod** sesuai Lampiran A (Konsep 7, Praktik 4) |
| Lampu hanya bisa dinyalakan dari tombol dashboard atau MQTTX. | Perintah belum punya pintu yang bisa dipakai aplikasi lain, dan jawabannya (`ack`) tidak dicatat. | **`POST /devices/:id/command`**: perintah keluar ke `cmd`, `ack`-nya ditunggu dan dicatat (Konsep 9, Praktik 6) |
| Tidak ada yang tahu pintu-pintu apa saja yang tersedia di server. | API tanpa dokumentasi hanya dipahami pembuatnya. | **Dokumentasi otomatis** di `/docs` (OpenAPI/Swagger) dan **Bruno** untuk mencoba API (Konsep 8, Praktik 5) |
| Kode JavaScript besar mudah salah ketik nama kolom tanpa ketahuan. | JavaScript tidak memeriksa jenis data sebelum program dijalankan. | **TypeScript ringan**: "label tipe" yang diperiksa VS Code, dijalankan langsung oleh Node.js 24 (Konsep 4, Praktik 2) |
| Semua perubahan langsung masuk ke cabang utama repositori. | Belum ada alur kerja tim. | **Git di terminal**, *branch* (cabang) per fitur, *pull request*, dan *review* dengan checklist (Konsep 3 dan 10, Praktik 1 dan 8) |

Di akhir minggu, **backend v0.1** berjalan di laptopmu: ia mendengarkan semua topik `rpm/#` di broker Pi, menolak pesan yang melanggar kontrak, menyimpan keadaan terakhir setiap perangkat di memori, dan menyediakan API berdokumentasi. Kamu menyalakan lampu Node 1 dari **Bruno**, melihat `ack`-nya tercatat, dan menyelesaikan fitur pertamamu lewat ***pull request***. Otomasi kipas di Node-RED dimatikan supaya Rumah Pintar Mini tidak punya dua otak.

![Peta jalan Modul 16. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 3 Backend dan data, Modul 16 sampai 21, disorot dengan bingkai hijau. Modul 1 sampai 15 bertanda selesai, Modul 17 sampai 21 berwarna hijau, dan Modul 16 ditandai KAMU DI SINI dengan catatan: server buatanmu sendiri, mendengar MQTT, memeriksa kontrak, API berdokumentasi, Git untuk tim. Di bawahnya, kotak Modul 16 minggu ini, 8 sampai 10 jam dicicil, dengan Kit A + B (Node 1, Node 2, dan gateway Pi dari Modul 12–15) atau laptop + simulator; perangkat keras tidak wajib. Daftar kegiatan: pemanasan ulang JavaScript; Kemenangan Cepat, server pertama menjawab /health; Praktik 1, Git di terminal, commit pertama backend; Praktik 2, struktur proyek, TypeScript ringan, .env; Praktik 3, backend mendengar broker; Praktik 4, jangan percaya perangkat, kontrak Zod; Praktik 5, bacaan terbaru, /docs, dan Bruno; Praktik 6, perintah lewat API, cmd dan ack; Praktik 7, simulator sepuluh perangkat; Praktik 8, Git untuk tim, branch, pull request, review; dan Tambahan, backend v0.1 dan otomasi Node-RED pensiun. Praktik 5, 6, 8, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: hampir semua pekerjaan minggu ini ada di laptop, di VS Code; kalau belum punya Node 1 dan Node 2, simulator Praktik 7 menggantikan keduanya; kalau belum punya Raspberry Pi, ikuti jalur laptop seperti Modul 12–15, yaitu broker berjalan di laptop dan alamat Pi diganti alamat broker laptopmu.](aset/peta-jalan-modul-16.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Hampir semua pekerjaan minggu ini ada di laptop**, di VS Code. Setiap kotak perintah disertai keterangan tempatnya: **terminal VS Code** (di folder `backend` atau `alat`), **browser**, **Bruno**, **MQTTX**, **editor Node-RED** (browser), atau **di Pi** (terminal SSH). Alamat Pi `192.168.1.37`, `device_id` Node 1 `a4cf12e5b7c0`, dan `device_id` Node 2 `246f28b1c7d4` hanya contoh; pakai milikmu sendiri.
> - **Perangkat keras tidak wajib.** Node 1 dan Node 2 sungguhan membuat minggu ini lebih seru (relay benar-benar berbunyi "klik"), tetapi **simulator** di Praktik 7 bisa menggantikan keduanya. Kalau Node 1-mu belum siap, kerjakan langkah 7.1–7.2 begitu kamu sampai di Praktik 3: tulis dan jalankan simulatornya (ia tidak butuh backend), biarkan berjalan, lalu kerjakan Praktik 3–6 dengan `f00d00000001` sebagai pengganti `device_id` Node 1. Simulator ikut berhenti kalau VS Code ditutup, jadi setiap kali melanjutkan di hari lain, jalankan lagi di terminal ketiga seperti 7.2 (bersama `npm run dev` di terminal pertama). Langkah 7.3–7.4 tetap dikerjakan setelah Praktik 6. Simulator hanya meniru Node 1, jadi langkah yang khusus untuk Node 2 (`246f28b1c7d4`) cukup dibaca.
> - **Belum punya Raspberry Pi?** Ikuti **jalur laptop** seperti Modul 12–15: broker berjalan di laptop, dan alamat `mqtt://192.168.1.37:1883` diganti dengan alamat broker laptopmu ([Modul 12 Praktik 7](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md)). Jalur Wokwi: jangan arahkan backend ke broker publik. Di sana `rpm/#` juga berisi pesan Rumah Pintar Mini milik pembelajar lain, dan perangkat palsu simulator (`f00d…`) bertabrakan dengan simulator orang lain yang memakai nama yang sama sehingga keduanya saling menendang dari broker. Jalankan broker di laptop seperti jalur laptop di atas, lalu pakai simulator Praktik 7 sebagai pengganti perangkat (kriteria lulusnya ada di ✅).
> - **Kotak Hasilnya.** Semua kode modul ini sudah dijalankan penulis di laptop Windows dengan Node.js 24, broker MQTT lab, Node 1 dan Node 2 tiruan, dan simulator Praktik 7. Jam di log mengikuti jam laptop (contoh di modul ini ditulis dalam WIB), dan alamat broker ditulis `mqtt://192.168.1.37:1883` supaya sama dengan langkahmu. Jam, `id` perintah, dan angka milidetik di layarmu tentu berbeda.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di VS Code, browser, dan Bruno. **Kecuali di terminal:** menghentikan program yang sedang berjalan (server, simulator) tetap **Ctrl + C**, juga di Mac. **Cmd + C** di terminal hanya menyalin teks. Memuat ulang halaman browser: **F5** di Windows, **Cmd + R** di macOS. Perintah terminal sama persis di Windows dan macOS, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Jangan pernah meng-*commit* kata sandi atau alamat rahasia.** Setelan server ditulis di file `.env`, dan `.env` masuk `.gitignore` begitu file itu dibuat (Praktik 2), sebelum sempat di-*commit*. Yang ikut ke GitHub hanya `.env.example` tanpa rahasia.
> 2. **Backend hanya mendengar di `127.0.0.1`** (laptop itu sendiri). Membuka server ke jaringan atau internet butuh kunci pintu dulu: kata sandi dan HTTPS menyusul di Modul 20 dan 27.
> 3. **Perintah dari API menggerakkan alat sungguhan.** Sebelum mengirim perintah pompa, pastikan selang pompa masuk tandon dan tandonnya berisi air, seperti di Modul 5. Kalau ragu, uji dengan lampu atau simulator dulu.
> 4. **Perintah `set` tidak pernah dikirim *retained*** (kontrak data bagian 7). Backend modul ini sudah mematuhinya; jangan mengubahnya.
> 5. **Satu otak saja.** Otomasi kipas di Node-RED dimatikan di ➕ Tambahan supaya backend dan Node-RED tidak saling membalas perintah.

Ritme modul ini sama dengan Modul 1–15. Karena Modul 4 sudah lama berlalu, modul ini diawali **🔁 Pemanasan ulang JavaScript**. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (45–60 menit)](#-pemanasan-ulang-javascript-4560-menit)
4. [🏆 Kemenangan Cepat: server pertamamu menjawab (20 menit)](#-kemenangan-cepat-server-pertamamu-menjawab-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Backend & API](#1-backend-dan-api-pelayan-restoran) · [2 HTTP](#2-http-sekali-lagi-metode-rute-kode-status-dan-loket) · [3 Git di terminal](#3-git-di-terminal-tombol-yang-sama-tanpa-tombol) · [4 TypeScript ringan](#4-typescript-ringan-label-tipe-yang-diperiksa-sebelum-program-jalan) · [5 Struktur & rahasia](#5-struktur-proyek-dan-rahasia-setiap-file-punya-satu-tugas) · [6 Klien MQTT](#6-backend-sebagai-klien-mqtt-satu-telinga-untuk-semua-topik) · [7 Kontrak Zod](#7-jangan-percaya-perangkat-kontrak-yang-bisa-dijalankan) · [8 Dokumentasi](#8-dokumentasi-otomatis-openapi-swagger-ui-dan-bruno) · [9 Perintah & `ack`](#9-perintah-lewat-api-kirim-tunggu-ack-dan-batas-waktu) · [10 Git untuk tim](#10-git-untuk-tim-branch-pull-request-dan-review)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Git di terminal](#praktik-1--git-di-terminal-commit-pertama-backend-30-menit) · [2 Struktur & TypeScript](#praktik-2--struktur-proyek-typescript-ringan-dan-env-35-menit) · [3 Mendengar broker](#praktik-3--backend-mendengar-broker-35-menit) · [4 Kontrak Zod](#praktik-4--jangan-percaya-perangkat-kontrak-data-dengan-zod-40-menit) · [5 `/docs` & Bruno](#praktik-5--bacaan-terbaru-docs-dan-bruno-45-menit) · [6 Perintah](#praktik-6--perintah-lewat-api-cmd-dan-ack-40-menit) · [7 Simulator](#praktik-7--simulator-sepuluh-perangkat-25-menit) · [8 *Pull request*](#praktik-8--git-untuk-tim-branch-pull-request-dan-review-45-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-16)

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan apa itu backend dan API** dengan analogi pelayan restoran, dan membaca permintaan HTTP: metode, rute, isi, dan kode status.
2. **Menulis TypeScript ringan** yang dijalankan langsung oleh Node.js 24, dan memakai pemeriksanya (`npm run cek`) untuk menangkap salah ketik sebelum program dijalankan.
3. **Menyusun proyek backend yang rapi**: folder `routes`, `services`, `config`, dan `schemas`, dengan setelan rahasia di `.env` yang tidak pernah ikut ke GitHub.
4. **Membuat backend yang mendengarkan semua topik MQTT** Rumah Pintar Mini, lalu memeriksa setiap pesan dengan kontrak data versi 1.2 yang ditulis sebagai skema **Zod**.
5. **Menyediakan API berdokumentasi**: `GET /devices`, `GET /devices/:id/latest`, dan `POST /devices/:id/command` dengan kode status yang tepat, plus halaman `/docs` yang dibuat otomatis.
6. **Mengirim perintah lewat API**, menunggu `ack`-nya dengan batas waktu, dan mencatat hasilnya.
7. **Menguji API dengan Bruno** dan **simulator sepuluh perangkat**, tanpa bergantung pada perangkat keras.
8. **Bekerja seperti tim dengan Git di terminal**: *branch* per fitur, *pull request*, *review* dengan checklist, dan *merge*.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Laptop dengan Node.js 24 dan VS Code** | Keduanya dipasang di Modul 4. Periksa dengan `node --version` (harus `v24…`). Mac yang tertahan di macOS 12 dan memakai Node.js 22 sejak Modul 4: semua langkah modul ini juga jalan di Node.js 22.18 atau lebih baru (diuji dengan 22.23.3). Kalau versimu di bawah itu, pasang versi 22 terbaru seperti Modul 4 Praktik 3. |
| **Repositori `rumah-pintar-mini`** di laptop | Dibuat di Modul 3, berisi pekerjaan sampai Modul 15 (`alat`, `edge`, `firmware`, `KONTRAK-DATA.md` versi 1.2). |
| **Git** | Dipasang di Praktik 1. Windows: Git for Windows 2.56.0 (sekitar 64 MB). macOS: Command Line Tools (unduhan sekitar 0,5–1 GB). |
| **GitHub CLI** (khusus macOS) | Dipasang di Praktik 1 untuk masuk (*login*) ke GitHub dari terminal (sekitar 28 MB). |
| **Bruno 4.2.1** | Aplikasi untuk mencoba API, dipasang di Praktik 5 (sekitar 116 MB di Windows, 160 MB di macOS). |
| **MQTTX** | Dari Modul 11, dengan sambungan **Gateway Pi** dari Modul 12. |
| **Gateway Pi** dengan Mosquitto | Dari Modul 12. Tanpa Pi: broker di laptop (jalur laptop Modul 12–15). |
| **Node 1 v1.4.0** dengan relay lampu, dan **Node 2** | Dari Modul 14–15. Boleh tidak ada: simulator Praktik 7 menggantikannya, tetapi syarat "relay menyala" di ✅ butuh Node 1 sungguhan (atau ikuti kriteria jalur simulator). |
| **Koneksi internet** | Untuk `npm install` dan mengunduh Git serta Bruno. |

Versi yang dipakai modul ini (Oktober 2026): **Node.js 24** (diuji dengan 24.21.0; versi 24 LTS mana pun cocok), **fastify 5.12.7**, **mqtt 5.16.1**, **zod 4.6.7**, **fastify-type-provider-zod 7.0.0**, **@fastify/swagger 9.9.2**, **@fastify/swagger-ui 6.1.2**, **typescript 7.0.2**, **@types/node 24**, **pino-pretty 13.2.0**, **Bruno 4.2.1**, **Git 2.56.0**, dan **GitHub CLI 2.102.0**. Semua library npm dipasang dengan versi tertulis (misalnya `npm install fastify@5.12.7`) supaya hasilmu sama dengan modul ini.

## 🔁 Pemanasan ulang JavaScript (45–60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24** (dipasang di Modul 4), folder repositori `belajar-iot`, dan koneksi internet (langkah 6).

JavaScript terakhir kamu tulis di Modul 4, tiga bulan lalu. Sejak itu kamu menulis C++ untuk ESP32, jadi wajar kalau beberapa hal terasa samar. Backend minggu ini memakai enam kemampuan dasar JavaScript yang sama dengan Modul 4. Pemanasan ini mengulang keenamnya dalam satu file kecil, `pemanasan.js`. Ketik kodenya sendiri (jangan disalin-tempel), jalankan setelah setiap langkah, dan cocokkan hasilnya.

**Siapkan foldernya.**

1. Buka VS Code, lalu buka folder repositori **`belajar-iot`** (**File → Open Folder…**), seperti di Modul 4.
2. Di panel Explorer, klik dulu ruang kosong di bawah daftar file, lalu klik ikon **New Folder** dan beri nama **`modul-16`**.
3. Buka terminal (**Terminal → New Terminal**), lalu masuk ke folder itu dan buat "KTP proyek"-nya seperti Modul 4 Praktik 4. Perintah ketiga (`npm pkg set type=module`) menandai proyek ini sebagai *ES module* supaya `import` dan `export` bisa dipakai:

   ```text
   cd modul-16
   npm init -y
   npm pkg set type=module
   ```

4. Klik folder `modul-16` di Explorer, lalu buat dua file baru di dalamnya: **`bantu.js`** dan **`pemanasan.js`**.

### Langkah 1 — Objek dan JSON

Pesan MQTT dari Node 1 tiba di backend sebagai **teks JSON**. `JSON.parse()` mengubahnya menjadi **objek** yang kolom-kolomnya bisa dibaca dengan titik, dan `JSON.stringify()` mengubah objek kembali menjadi teks (Modul 4 Konsep 7–8). Ketik di `pemanasan.js`:

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 16

// 1. Objek dan JSON
const teks = '{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"gerak":false}';
const bacaan = JSON.parse(teks); // teks JSON -> objek
console.log("Suhu:", bacaan.suhu, "°C");
console.log("Ada gerakan?", bacaan.gerak);
bacaan.lokasi = "ruang tamu"; // menambah kolom baru
console.log(JSON.stringify(bacaan)); // objek -> teks JSON
```

Simpan (**Ctrl + S**), lalu jalankan di terminal:

```text
node pemanasan.js
```

**Hasilnya:**

```text
Suhu: 28.5 °C
Ada gerakan? false
{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"gerak":false,"lokasi":"ruang tamu"}
```

Perhatikan tanda petik: teks JSON diapit **petik tunggal** di luar karena di dalamnya penuh petik ganda.

### Langkah 2 — *Array*, `filter`, dan `map`

Backend akan menyimpan banyak perangkat sekaligus. `filter` memilih isi *array* yang memenuhi syarat, sedangkan `map` mengubah setiap isinya menjadi bentuk lain (Modul 4 Konsep 9). Tambahkan di bawah langkah 1:

```js
// 2. Array, filter, dan map
const daftar = [
  { device_id: "a4cf12e5b7c0", suhu: 28.5 },
  { device_id: "246f28b1c7d4", suhu: 31.2 },
  { device_id: "f00d00000001", suhu: 33.0 },
];
const panas = daftar.filter((b) => b.suhu > 30);
console.log("Perangkat di atas 30 °C:", panas.length);
```

### Langkah 3 — Fungsi panah dan teks templat

Fungsi panah (*arrow function*) adalah cara singkat menulis fungsi, dan **teks templat** (diapit *backtick*, tombol di kiri angka 1 di papan ketik) bisa menyisipkan nilai dengan `${...}` (fungsi panah di Modul 4 Konsep 6, teks bertemplat di Konsep 3). Tambahkan:

```js
// 3. Fungsi panah dan teks templat
const ringkas = (b) => `${b.device_id}: ${b.suhu} °C`;
console.log(daftar.map(ringkas));
```

Jalankan lagi `node pemanasan.js`. Hasil langkah 2 dan 3 muncul di bawah hasil langkah 1; daftar dari `map` dicetak dalam lima baris karena terlalu panjang untuk satu baris:

```text
Perangkat di atas 30 °C: 2
[
  'a4cf12e5b7c0: 28.5 °C',
  '246f28b1c7d4: 31.2 °C',
  'f00d00000001: 33 °C'
]
```

Angka `33.0` tercetak `33`: JavaScript tidak menyimpan nol di belakang koma. Kalau butuh satu angka di belakang koma, pakai `.toFixed(1)` seperti di langkah 4.

### Langkah 4 — `import` dan `export`

Backend minggu ini terdiri atas belasan file kecil yang saling meminjam fungsi lewat `export` dan `import` (Modul 4 Konsep 10). Ketik di **`bantu.js`**:

```js
// bantu.js - fungsi kecil yang dipakai pemanasan.js
export function rataRata(angka) {
  const jumlah = angka.reduce((total, x) => total + x, 0);
  return jumlah / angka.length;
}
```

`reduce` menjumlahkan isi *array* satu per satu, mulai dari `0`. Lalu, di **`pemanasan.js`**, tambahkan satu baris di **paling atas**, tepat di bawah baris komentar pertama:

```js
import { rataRata } from "./bantu.js";
```

dan satu baris di **paling bawah**:

```js
// 4. import dari file lain
console.log("Rata-rata suhu:", rataRata(daftar.map((b) => b.suhu)).toFixed(1), "°C");
```

Jalankan lagi. Baris barunya: `Rata-rata suhu: 30.9 °C`.

### Langkah 5 — Menunggu tanpa membeku: `Promise` dan `await`

Backend sering menunggu: menunggu broker menyambung, menunggu jawaban perangkat. `await` menunggu sebuah Promise ("janji" bahwa hasilnya menyusul) tanpa membekukan program (Modul 4 Konsep 12). Tambahkan di paling bawah:

```js
// 5. Menunggu tanpa membeku: Promise dan await
const tunggu = (ms) => new Promise((selesai) => setTimeout(selesai, ms));
console.log("Menunggu 1 detik...");
await tunggu(1000);
console.log("Selesai menunggu.");
```

Jalankan lagi: ada jeda sekitar satu detik di antara kedua baris baru.

### Langkah 6 — `fetch`: bertanya ke server lain

`fetch` mengirim permintaan HTTP dan menunggu jawabannya (Modul 4 Praktik 8). Minggu ini, kamu juga akan menjadi **server** yang ditanya. Tambahkan di paling bawah:

```js
// 6. fetch: bertanya ke server lain lewat HTTP
const jawaban = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.85&current=temperature_2m");
console.log("Kode status:", jawaban.status);
const data = await jawaban.json();
console.log("Suhu Jakarta sekarang:", data.current.temperature_2m, "°C");
```

Jalankan sekali lagi. **Hasilnya** (keseluruhan; angka suhu Jakarta tentu berbeda):

```text
Suhu: 28.5 °C
Ada gerakan? false
{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"gerak":false,"lokasi":"ruang tamu"}
Perangkat di atas 30 °C: 2
[
  'a4cf12e5b7c0: 28.5 °C',
  '246f28b1c7d4: 31.2 °C',
  'f00d00000001: 33 °C'
]
Rata-rata suhu: 30.9 °C
Menunggu 1 detik...
Selesai menunggu.
Kode status: 200
Suhu Jakarta sekarang: 33.5 °C
```

Kode status `200` artinya "berhasil". Kode status lain (`400`, `404`, `409`, `504`) akan kamu buat sendiri minggu ini (Konsep 2). Data cuaca dari [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0), seperti di Modul 4.

**Galat yang paling sering di pemanasan ini:**

| Pesan di terminal | Artinya |
| :--- | :--- |
| `SyntaxError: Cannot use import statement outside a module` | `npm pkg set type=module` terlewat. Jalankan di folder `modul-16`, lalu coba lagi. |
| `SyntaxError` yang menyebut `in JSON at position …` | Teks JSON di langkah 1 salah ketik, misalnya ada petik ganda yang hilang atau koma sebelum `}`. Angka di belakang `position` menunjuk letak kesalahannya. |
| `TypeError: Cannot read properties of undefined (reading 'temperature_2m')` | Alamat Open-Meteo salah ketik sehingga jawabannya tidak punya kolom `current`. Periksa alamatnya huruf demi huruf. |
| `TypeError: fetch failed` | Laptop tidak tersambung ke internet, atau nama servernya salah ketik. |

**Uji dirimu (10 menit).** Tanpa melihat kunci, tambahkan di `pemanasan.js`:

1. Sebuah fungsi panah `diAtas(daftar, batas)` yang mengembalikan **`device_id`-nya saja** dari perangkat yang suhunya di atas `batas`. Untuk `daftar` dari langkah 2 dan batas `31`, hasilnya `[ '246f28b1c7d4', 'f00d00000001' ]`.
2. Sebuah fungsi `async` bernama `suhuJakarta()` yang mengembalikan suhu Jakarta dari Open-Meteo, lalu cetak `Panas!` kalau suhunya di atas 30.

<details>
<summary>Kunci uji dirimu</summary>

```js
// uji 1: filter dulu, lalu map ke device_id
const diAtas = (daftar, batas) => daftar.filter((b) => b.suhu > batas).map((b) => b.device_id);
console.log(diAtas(daftar, 31));

// uji 2: fungsi async mengembalikan Promise, jadi pemanggilnya ikut memakai await
async function suhuJakarta() {
  const jawaban = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.85&current=temperature_2m");
  const data = await jawaban.json();
  return data.current.temperature_2m;
}
const suhu = await suhuJakarta();
if (suhu > 30) {
  console.log("Panas!");
}
```

Lupa `await` di depan `suhuJakarta()`? Isi `suhu` menjadi `Promise { <pending> }`, bukan angka, dan perbandingan `suhu > 30` selalu `false`. Itu kesalahan yang sama dengan Modul 4 Praktik 6.

</details>

Pemanasan selesai. Simpan `modul-16` ke GitHub seperti biasa (GitHub Desktop) kalau mau. Mulai Praktik 1, kamu juga akan memakai `git` langsung dari terminal.

## 🏆 Kemenangan Cepat: server pertamamu menjawab (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, **browser**, dan folder repositori **`rumah-pintar-mini`** di laptop (dibuat dengan GitHub Desktop di Modul 3: **Documents → GitHub → rumah-pintar-mini**). Perangkat keras belum dipakai.

Dalam 20 menit, laptopmu menjalankan server buatanmu sendiri yang menjawab pertanyaan dari browser. Kodenya ditulis dalam **TypeScript**, dan Node.js 24 menjalankannya langsung.

### Langkah 1 — Buat folder `backend` (3 menit)

1. Di VS Code, pilih **File → Open Folder…**, lalu buka folder **`rumah-pintar-mini`** (bukan `belajar-iot`). Di panel Explorer tampak folder yang sudah kamu kenal: `alat`, `edge`, `firmware`, dan file `KONTRAK-DATA.md`.
2. Klik ruang kosong di bawah daftar file Explorer, klik ikon **New Folder**, lalu beri nama **`backend`**. Di folder inilah seluruh kode server minggu ini tinggal.

### Langkah 2 — KTP proyek dan Fastify (5 menit)

Buka terminal baru (**Terminal → New Terminal**). Terminal selalu mulai di folder yang sedang dibuka, yaitu `rumah-pintar-mini`. Ketik satu per satu:

```text
cd backend
npm init -y
npm pkg set type=module
npm install fastify@5.12.7
```

Perintah kedua dan ketiga sudah kamu kenal dari pemanasan: membuat `package.json` dan menandai proyek sebagai *ES module*. Perintah keempat memasang **Fastify**, library yang mengurus semua pekerjaan "server" (menerima permintaan, mencari rute, mengirim jawaban), dengan versi yang dikunci seperti `dayjs` di Modul 4 Praktik 7. **Hasilnya** (perintah terakhir):

```text
added 48 packages, and audited 49 packages in 3s

19 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Fastify ternyata membawa 47 library kecil lain bersamanya; semuanya masuk folder `node_modules` yang baru muncul. Folder itu besar dan bisa dibuat ulang kapan saja dengan `npm install`, jadi kelak tidak ikut ke GitHub (Praktik 1).

### Langkah 3 — Tulis `src/server.ts` (5 menit)

1. Di Explorer, klik folder **`backend`**, lalu buat folder baru **`src`** di dalamnya.
2. Klik folder **`src`**, lalu buat file baru **`server.ts`**. Akhiran `.ts` berarti file TypeScript.
3. Ketik isinya:

```ts
// server.ts - server pertama Rumah Pintar Mini (Modul 16, Kemenangan Cepat)
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { ok: true, pesan: "backend Rumah Pintar Mini hidup" };
});

await app.listen({ port: 8080, host: "127.0.0.1" });
```

Hanya empat perintah:

- `Fastify({ logger: true })` membuat server yang mencatat kegiatannya (*log*) di terminal.
- `app.get("/health", …)` mendaftarkan **rute**: kalau ada yang bertanya `GET /health`, jalankan fungsi ini. Objek yang dikembalikan fungsinya otomatis dikirim sebagai JSON.
- `app.listen(…)` membuka "loket" nomor **8080** di alamat **`127.0.0.1`**, yaitu laptop itu sendiri. Nomor 8080 dipilih karena loket 3000 dari Modul 4 sering dipakai program lain di laptop (Konsep 2).
- `await` di baris terakhir menunggu loketnya benar-benar terbuka.

Simpan dengan **Ctrl + S**.

### Langkah 4 — Jalankan dan tanya dari browser (4 menit)

Di terminal (masih di folder `backend`), jalankan:

```text
node --watch src/server.ts
```

**Hasilnya** (satu baris log JSON; angka `time`, `pid`, dan nama laptopmu berbeda):

```text
{"level":30,"time":1792383502461,"pid":20356,"hostname":"laptop-budi","msg":"Server listening at http://127.0.0.1:8080"}
```

`Server listening at http://127.0.0.1:8080` artinya server sedang menunggu tamu. Buka browser, lalu ketik alamat ini di kolom alamat:

```text
http://127.0.0.1:8080/health
```

Browser menampilkan jawaban servermu (sebagian browser menatanya dengan warna dan tombol rapikan):

```json
{"ok":true,"pesan":"backend Rumah Pintar Mini hidup"}
```

Di terminal muncul dua baris log baru: `incoming request` (ada tamu) dan `request completed` (tamunya sudah dilayani), lengkap dengan `"statusCode":200` dan lama layanannya dalam milidetik. Biasanya menyusul tiga baris lagi untuk `/favicon.ico`, dengan `Route GET:/favicon.ico not found` dan `"statusCode":404`. Itu browser yang mencari ikon kecil untuk tab-nya; servermu memang tidak punya ikon, jadi abaikan saja.

### Langkah 5 — Ubah, simpan, dan lihat server memulai ulang sendiri (3 menit)

1. Di `server.ts`, ubah teks `backend Rumah Pintar Mini hidup` menjadi `halo dari backend-ku`, lalu simpan.
2. Lihat terminal. Tanpa kamu suruh, Node.js membersihkan layar terminal (log yang lama hilang dari layar), lalu menulis:

   ```text
   Restarting 'src/server.ts'
   ```

   (di Node.js 24.19 atau lebih baru, didahului satu baris `Change detected in '…\\src\\server.ts'`; di Windows, garis miring terbaliknya memang tampil ganda). Itulah gunanya `--watch`: setiap kali file disimpan, server dimulai ulang dengan kode terbaru.
3. Muat ulang halaman browser (**F5**). Jawabannya kini `{"ok":true,"pesan":"halo dari backend-ku"}`.
4. Hentikan server dengan **Ctrl + C** di terminal. Muat ulang browser: kini browser melapor tidak bisa menyambung karena tidak ada lagi yang menunggu di loket 8080.

🎉 **Selamat!** Kamu baru saja menjalankan **backend** pertamamu: program yang menunggu pertanyaan dan menjawabnya dengan JSON. Di akhir minggu, server yang sama akan menjawab pertanyaan sungguhan: "perangkat apa saja yang ada?", "berapa suhu terakhir Node 2?", dan "tolong nyalakan lampu".

> [!TIP]
> **Tidak jalan?**
>
> - `Error: listen EADDRINUSE: address already in use 127.0.0.1:8080` → ada program lain (sering kali server ini sendiri yang masih jalan di terminal lain) yang memakai loket 8080. Tutup terminal lama dengan ikon tempat sampah di panel terminal, atau ganti `8080` dengan `8081` di kode dan di alamat browser.
> - `Unknown file extension ".ts"` → Node.js-mu terlalu tua untuk menjalankan TypeScript langsung. Jalankan `node --version`; kalau hasilnya bukan `v24…`, pasang Node.js 24 LTS seperti Modul 4 Praktik 3. Mac lama yang tertahan di Node.js 22 cukup memasang versi 22 terbaru (paling tidak `v22.18`), seperti catatan di 🧰.
> - `Cannot find package 'fastify'` → `npm install fastify@5.12.7` belum dijalankan **di folder `backend`**. Periksa dengan `pwd`: jalur yang tercetak harus berakhiran `backend`.
> - Browser melapor tidak bisa menyambung (misalnya `This site can't be reached` atau `Hmmm… can't reach this page`) → server belum jalan atau sudah dihentikan, atau alamatnya salah ketik (`127.0.0.1`, titik dua, `8080`).

> ➡️ **Selesai Kemenangan Cepat?** Baca [Konsep 1](#1-backend-dan-api-pelayan-restoran) sampai [Konsep 3](#3-git-di-terminal-tombol-yang-sama-tanpa-tombol), lalu kerjakan praktik sesuai urutan di awal 🧠.

## 🧠 Konsep "Mengapa"

Sepuluh konsep minggu ini dipelajari berselang-seling dengan praktiknya. Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik. Urutannya:

1. Konsep 1–3 → Praktik 1 (Git di terminal)
2. Konsep 4–5 → Praktik 2 (struktur proyek, TypeScript, `.env`)
3. Konsep 6–7 → Praktik 3–4 (mendengar broker, memeriksa kontrak)
4. Konsep 8 → Praktik 5 (bacaan terbaru, `/docs`, Bruno)
5. Konsep 9–10 → Praktik 6–8 (perintah lewat API, simulator, *branch*, *pull request*, *review*)

### 1. Backend dan API: pelayan restoran

Bayangkan sebuah restoran. **Tamu** duduk di meja dan memesan lewat **pelayan**; pelayan membawa pesanan ke **dapur**, lalu kembali membawa makanan. Tamu tidak pernah masuk dapur, dan dapur tidak perlu tahu siapa tamunya. Yang penting, keduanya sepakat dengan **daftar menu**: apa saja yang boleh dipesan dan seperti apa bentuk hidangannya.

Di Rumah Pintar Mini:

- **Dapur** = perangkat dan broker: Node 1, Node 2, dan Mosquitto di Pi, yang terus menghasilkan data.
- **Pelayan** = **backend**: program server yang berjalan terus, mendengarkan dapur, mengingat keadaan terakhir setiap perangkat, dan melayani pesanan.
- **Tamu** = siapa pun yang bertanya: Bruno minggu ini, dashboard React di Modul 22, aplikasi HP, atau program temanmu.
- **Daftar menu** = **API** (*Application Programming Interface*, antarmuka pemrograman aplikasi): daftar "pintu" yang boleh diketuk tamu, misalnya `GET /devices` ("daftar perangkat, tolong") atau `POST /devices/a4cf12e5b7c0/command` ("nyalakan lampu Node 1").

Mengapa tidak langsung saja dashboard berlangganan MQTT, seperti Node-RED? Karena pelayan menambah tiga hal yang tidak dimiliki dapur: ia **memeriksa** setiap hidangan sebelum disajikan (Konsep 7), ia **mengingat** pesanan dan jawabannya (Konsep 9; kelak juga database di Modul 17), dan ia **menjaga pintu** (siapa boleh memesan apa, Modul 20). Tamu juga cukup bicara HTTP, bahasa yang dimengerti semua aplikasi, tanpa harus mengerti MQTT.

![Diagram analogi pelayan restoran untuk backend dan API: tamu memesan lewat pelayan, pelayan berbicara dengan dapur, dan tamu tidak pernah masuk dapur. Kiri, kartu Tamu, siapa pun yang bertanya: Bruno (minggu ini), dashboard React (kelak, Modul 22), dan aplikasi HP (kelak). Tengah, kartu hijau Pelayan = backend, program server buatanmu yang berjalan terus di laptop, berisi Daftar menu = API, pintu yang boleh diketuk tamu: GET /devices, daftar perangkat, tolong; GET /devices/:id/latest, bacaan terbarunya, tolong; POST /devices/:id/command, nyalakan lampu Node 1. Antara tamu dan pelayan, label HTTP, bahasa semua aplikasi: panah permintaan menuju pelayan, dan panah jawaban + kode status kembali ke tamu. Kanan, kartu Dapur, perangkat dan broker: Node 1 Rumah (sensor + relay), Node 2 Kebun (lewat Node 1), dan Mosquitto di Pi 192.168.1.37. Antara pelayan dan dapur, label MQTT: panah cmd menuju dapur, dan panah rpm/# kembali ke pelayan, berisi telemetry, status, vitals, dan ack. Bawah, tiga hal yang ditambahkan pelayan dan tidak dimiliki dapur: 1 memeriksa, setiap pesan dan permintaan dicek dengan Zod sebelum dipercaya (Konsep 7); 2 mengingat, keadaan terakhir setiap perangkat dan perintah yang menunggu ack, di memori (kelak di database, Modul 17); 3 menjaga pintu, bertanda kelak dan bergaris putus-putus, yaitu siapa boleh memesan apa, masuk (login) dan peran pengguna (Modul 20, belum minggu ini).](aset/backend-pelayan-restoran.png)

Silabus menyebut **backend v0.1** "tanpa database": minggu ini ingatannya masih di memori. Kalau server dimatikan, ingatannya hilang, dan terisi lagi begitu pesan perangkat berikutnya datang. Modul 17 memberinya ingatan permanen.

### 2. HTTP sekali lagi: metode, rute, kode status, dan loket

Kamu sudah bertemu HTTP di Modul 4 (`penerima-webhook.js`) dan Modul 10 (web server di ESP32). Setiap permintaan HTTP punya empat bagian yang penting minggu ini:

| Bagian | Contoh | Artinya |
| :--- | :--- | :--- |
| **Metode** | `GET`, `POST` | `GET` = minta data, tidak mengubah apa pun. `POST` = kirim sesuatu yang mengubah keadaan, misalnya perintah. |
| **Rute** (*route*) | `/devices/a4cf12e5b7c0/latest` | "Pintu" mana yang diketuk. Bagian `a4cf12e5b7c0` adalah **parameter**: di kode ditulis `/devices/:id/latest`, dan `:id` diisi apa pun yang diketik tamu. |
| **Isi** (*body*) | `{"target":"lampu","nilai":true}` | Hanya untuk `POST`: data yang dibawa permintaan, biasanya JSON. |
| **Kode status** | `200`, `404` | Angka tiga digit di jawaban: berhasil atau gagal, dan mengapa. |

Kode status yang dipakai backend minggu ini:

| Kode | Nama | Kapan backend kita menjawabnya |
| :---: | :--- | :--- |
| `200` | OK | Permintaan berhasil, jawabannya di isi. |
| `400` | Bad Request | Permintaan tamu salah bentuk, misalnya `nilai` pompa `30` padahal paling banyak `10`. Salah **tamu**. |
| `404` | Not Found | Rute tidak ada, atau perangkat yang ditanya belum pernah terdengar. |
| `409` | Conflict | Permintaannya benar, tetapi keadaan sedang tidak memungkinkan: perangkatnya `offline`, atau Node 2 diberi perintah (Node 2 tidak menerima perintah). |
| `503` | Service Unavailable | Backend sedang tidak tersambung ke broker, jadi perintah tidak bisa dikirim. Salah **server**, bukan tamu. |
| `504` | Gateway Timeout | Perintah sudah dikirim, tetapi perangkat tidak menjawab dalam 5 detik. |

Aturan praktisnya: **kode `4xx` = tamu yang harus memperbaiki permintaannya, kode `5xx` = masalah di sisi server atau perangkat.** Kode status yang tepat membuat aplikasi lain bisa bereaksi otomatis; pesan galat yang jelas (`{"pesan":"perangkat sedang offline, perintah tidak dikirim"}`) membuat manusia bisa bereaksi.

**Loket (*port*) dan alamat.** Server mendengar di satu alamat dan satu nomor loket (Modul 4 Konsep 13). Backend kita mendengar di **`127.0.0.1:8080`**:

- **`127.0.0.1`** adalah alamat "laptop ini sendiri". Hanya program di laptop yang sama yang bisa mengetuk. Itu sengaja: backend belum punya kunci pintu, dan membukanya ke jaringan rumah baru aman setelah Modul 20. Bonusnya, Windows tidak memunculkan dialog *firewall*.
- **`8080`**, bukan `3000` seperti Modul 4, karena loket 3000 sering sudah ditempati program lain di laptop pemrogram (alat pembuat web, dan kelak Grafana di Modul 25). Satu loket hanya untuk satu program.
- Tulis **`127.0.0.1`**, bukan `localhost`. Di sebagian laptop, `localhost` diarahkan ke alamat IPv6 `::1` sehingga permintaanmu bisa salah masuk ke program lain atau tidak dijawab sama sekali.

### 3. Git di terminal: tombol yang sama, tanpa tombol

Sejak Modul 3, kamu menyimpan pekerjaan ke GitHub dengan GitHub Desktop: centang perubahan, tulis ringkasan, klik **Commit to main**, lalu **Push origin**. Di balik tombol-tombol itu, GitHub Desktop menjalankan program bernama **`git`**. Minggu ini kamu memanggil `git` langsung dari terminal VS Code. Alasannya praktis: hampir semua tim pemrogram, server di internet (Modul 27), dan sistem otomatis (Modul 29) memakai `git` dari terminal, dan perintahnya sama di Windows, macOS, Linux, dan Raspberry Pi.

| Di GitHub Desktop | Di terminal | Artinya |
| :--- | :--- | :--- |
| Tab **Changes** | `git status` | File apa saja yang berubah sejak *commit* terakhir |
| Mencentang file | `git add <file>` | Memasukkan perubahan ke "keranjang" *commit* berikutnya |
| Ringkasan + **Commit to main** | `git commit -m "ringkasan"` | Memotret isi keranjang menjadi satu *commit* |
| **Push origin** | `git push` | Mengirim *commit* ke GitHub |
| Tab **History** | `git log --oneline` | Daftar *commit*, satu baris per *commit* |

GitHub Desktop boleh tetap kamu pakai berdampingan: keduanya membaca folder repositori yang sama, jadi *commit* yang dibuat di terminal langsung tampak di GitHub Desktop, dan sebaliknya. Yang baru minggu ini hanya caranya. Konsep 10 menambah cara kerja tim: setiap fitur dikerjakan di cabangnya sendiri, lalu digabung lewat *pull request*.

**File yang tidak boleh ikut.** Folder `node_modules` (puluhan megabita, bisa dibuat ulang dengan `npm install`) dan file `.env` (berisi setelan rahasia, Konsep 5) dicantumkan di **`.gitignore`**, daftar "abaikan" yang sudah kamu pakai sejak Modul 4 untuk `node_modules/`, lalu untuk `secrets.h` (Modul 10) dan `kunci.h` (Modul 14). Git tidak akan pernah menawarkan file-file itu untuk di-*commit*.

> ➡️ **Saatnya praktik!** Konsep 1–3 cukup untuk [Praktik 1 — Git di terminal](#praktik-1--git-di-terminal-commit-pertama-backend-30-menit). Setelah itu, kembali ke Konsep 4.

### 4. TypeScript ringan: label tipe yang diperiksa sebelum program jalan

JavaScript tidak peduli jenis data sampai programnya berjalan. Kalau kamu salah ketik `bacaan.suuhu`, JavaScript diam saja dan memberi `undefined`; kesalahannya baru ketahuan berjam-jam kemudian, ketika dashboard menampilkan suhu kosong. **TypeScript** adalah JavaScript yang diberi **label tipe**:

```ts
interface Bacaan {
  suhu: number;
  kelembapan: number;
}

function tampilkan(b: Bacaan): string {
  return `suhu ${b.suhu} °C, kelembapan ${b.kelembapan} %`;
}
```

- `interface Bacaan` mendaftar kolom apa saja yang dimiliki sebuah bacaan, beserta jenisnya: `number` (angka), `string` (teks), `boolean` (`true`/`false`).
- `b: Bacaan` berarti "parameter `b` harus berbentuk `Bacaan`", dan `: string` setelah tanda kurung berarti "fungsi ini mengembalikan teks".

Dengan label itu, **VS Code** langsung menggarisbawahi `b.suuhu` dengan garis merah bergelombang saat kamu mengetik, lengkap dengan pesan `Property 'suuhu' does not exist on type 'Bacaan'. Did you mean 'suhu'?`. Kesalahan tertangkap **sebelum** program dijalankan, persis seperti kompiler C++ di Arduino IDE menolak variabel yang tidak dideklarasikan.

**"Ringan" di sini punya dua arti.**

1. **Node.js 24 menjalankan file `.ts` langsung.** Saat membaca file `.ts`, Node.js cukup **menghapus label-label tipenya** (*type stripping*), lalu menjalankan sisanya sebagai JavaScript biasa. Tidak ada langkah "bangun" (*build*) dan tidak ada alat tambahan. Akibatnya, **Node.js tidak memeriksa tipe sama sekali**: yang memeriksa adalah VS Code saat kamu mengetik, dan perintah `npm run cek` (Praktik 2) sebelum *commit*.
2. **Kita hanya memakai sebagian kecil TypeScript**: label tipe, `interface`, dan `type`. Fitur TypeScript yang tidak bisa sekadar dihapus, misalnya `enum`, ditolak Node.js dengan `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. Dua aturan kecil lain: impor dari file sendiri ditulis **lengkap dengan akhiran `.ts`** (`import { env } from "./config/env.ts"`), dan impor yang isinya hanya tipe ditulis `import type`.

TypeScript yang "berat" (fitur lanjut dan langkah *build*) ada di 🔬. Untuk kebanyakan backend IoT, versi ringan ini sudah menangkap sebagian besar salah ketik.

### 5. Struktur proyek dan rahasia: setiap file punya satu tugas

`server.ts` di Kemenangan Cepat hanya sepuluh baris. Backend v0.1 di akhir minggu sekitar 400 baris. Kalau semuanya ditumpuk di satu file, mencari satu baris saja sudah melelahkan. Seperti dapur restoran yang dibagi menjadi meja potong, kompor, dan meja saji, kode backend dibagi menjadi folder dengan tugas yang jelas:

```text
backend/
├── package.json          KTP proyek: nama, library, dan perintah npm run …
├── tsconfig.json         setelan pemeriksa TypeScript (dipakai VS Code dan npm run cek)
├── .env                  setelan rahasia laptop ini (TIDAK ikut Git)
├── .env.example          contoh .env tanpa rahasia (ikut Git)
├── .gitignore            daftar yang diabaikan Git: node_modules/ dan .env
├── bruno/                koleksi permintaan untuk Bruno (Praktik 5)
└── src/
    ├── server.ts         pintu masuk: merakit server dan menyalakannya
    ├── config/env.ts     membaca dan memeriksa setelan dari .env
    ├── schemas/kontrak.ts  kontrak data Lampiran A dalam bentuk skema Zod
    ├── services/mqtt.ts    "telinga": sambungan ke broker, pesan masuk dan keluar
    ├── services/gudang.ts  "ingatan": keadaan terakhir setiap perangkat
    ├── routes/kesehatan.ts rute GET /health
    └── routes/perangkat.ts rute /devices
```

- **`routes/`** berisi pintu-pintu API: rute dan *handler*-nya (fungsi yang menjawab).
- **`services/`** berisi pekerjaan di belakang layar yang tidak tahu-menahu soal HTTP: berbicara dengan broker, mengingat data.
- **`config/`** berisi setelan.
- **`schemas/`** berisi aturan bentuk data.

Aturan pembagiannya: rute boleh memakai *service* (layanan), tetapi *service* tidak memakai rute. Kelak, ketika `gudang.ts` diganti database (Modul 17), rute-rutenya tidak perlu diubah.

**Rahasia di `.env`.** Alamat broker, nomor port, dan kelak kata sandi database dan kunci rahasia berbeda di setiap laptop dan tidak boleh tersebar. Tempatnya di file **`.env`**, satu setelan per baris:

```text
MQTT_URL=mqtt://192.168.1.37:1883
PORT=8080
HOST=127.0.0.1
```

Node.js 24 membaca file ini sendiri lewat pilihan **`--env-file=.env`**, lalu isinya bisa dibaca kode lewat `process.env.MQTT_URL`. File `.env` masuk `.gitignore`; yang ikut ke GitHub adalah **`.env.example`** dengan isi contoh tanpa rahasia supaya orang lain tahu setelan apa saja yang perlu diisi. Sekali kata sandi ter-*commit*, anggap kata sandi itu sudah bocor: menghapusnya dari *commit* berikutnya tidak menghapusnya dari riwayat Git.

> ➡️ **Saatnya praktik!** Konsep 4–5 cukup untuk [Praktik 2 — Struktur proyek, TypeScript ringan, dan `.env`](#praktik-2--struktur-proyek-typescript-ringan-dan-env-35-menit). Setelah itu, kembali ke Konsep 6.

### 6. Backend sebagai klien MQTT: satu telinga untuk semua topik

Bagi broker, backend hanyalah **klien MQTT** lain, sama seperti MQTTX atau Node-RED. Library **mqtt.js** (`mqtt` di npm, yang juga dipakai alat pemeriksa kontrak sejak Modul 11) menyambungkan backend ke broker, lalu backend berlangganan **`rpm/#`**. Tanda `#` berarti "semua topik di bawah `rpm/`" sehingga satu langganan menangkap `telemetry`, `status`, `vitals`, dan `ack` dari semua perangkat sekaligus.

Setiap pesan yang masuk dibaca topiknya lebih dulu. Topik `rpm/a4cf12e5b7c0/telemetry` dipecah di tanda `/` menjadi tiga bagian: awalan `rpm`, `device_id` `a4cf12e5b7c0`, dan jenis pesan `telemetry`. Jenis pesan menentukan cara membaca isinya (kontrak data bagian 2):

| Jenis | Isi | Yang dilakukan backend |
| :--- | :--- | :--- |
| `telemetry` | JSON bacaan sensor | dicek, lalu disimpan sebagai bacaan terakhir perangkat itu |
| `status` | teks `online`, `offline`, atau `offline-mode` | dicek, lalu disimpan sebagai status perangkat |
| `vitals` | JSON kesehatan perangkat | dicek, lalu disimpan |
| `ack` | JSON jawaban perintah | dicek, lalu diserahkan ke perintah yang sedang menunggunya (Konsep 9) |
| `cmd` | perintah | diabaikan: itu perintah dari backend sendiri atau dari MQTTX, bukan data perangkat |

Backend juga perlu nama klien (*client ID*) sendiri. Kontrak data memberi perangkat nama `device_id`-nya; backend memakai `backend-` diikuti enam huruf dan angka acak supaya dua backend yang tidak sengaja berjalan bersamaan tidak saling menendang dari broker. Status yang *retained* (Modul 11) langsung diterima backend begitu berlangganan sehingga backend yang baru menyala langsung tahu perangkat mana yang `online`.

### 7. Jangan percaya perangkat: kontrak yang bisa dijalankan

Kontrak data (Lampiran A, `KONTRAK-DATA.md` versi 1.2) adalah janji: `suhu` berupa angka dari −40 sampai 80 atau `null`, `kelembapan` bilangan bulat 0–100, `ts` waktu UTC, dan seterusnya. Namun, janji bisa dilanggar: firmware baru yang salah ketik nama kolom, sensor rusak yang mengirim `kelembapan: 255`, teman yang iseng mem-*publish* `{"suhu":"panas"}` dari MQTTX, atau perangkat asing yang menyamar. Backend yang langsung menyimpan apa pun yang datang akan menyebarkan kesalahan itu ke database dan dashboard. Karena itu, aturan pertama backend: **jangan percaya perangkat**.

**Zod** adalah library untuk menuliskan aturan bentuk data sebagai **skema**, lalu memeriksa data dengan skema itu:

```ts
const Vitals = z.strictObject({
  ts: z.iso.datetime(),                  // teks waktu UTC, misalnya 2026-10-19T02:10:05Z
  rssi: z.number().int().max(0),         // bilangan bulat, tidak positif
  uptime_s: z.number().int().min(0),
  heap_free: z.number().int().min(0),
});

const hasil = Vitals.safeParse(json);    // periksa, tanpa membuat program berhenti
if (!hasil.success) {
  // tolak: catat alasannya, jangan disimpan
}
```

Skema seperti ini adalah **kontrak yang bisa dijalankan**: Lampiran A yang tadinya hanya bisa dibaca manusia kini juga bisa diperiksa program, pesan demi pesan. `z.strictObject` menolak kolom yang tidak ada di kontrak (salah ketik `suuhu` langsung ketahuan), dan `safeParse` mengembalikan daftar masalah yang bisa dibaca manusia, misalnya `kelembapan: Terlalu besar: diharapkan number menjadi <=100`.

Zod bekerja di **dua pintu**:

1. **Pintu MQTT**: setiap pesan perangkat dicek sebelum disimpan. Yang melanggar ditolak, dicatat di log sebagai `DITOLAK`, dan dihitung.
2. **Pintu HTTP**: setiap permintaan tamu dicek sebelum dijalankan. `{"target":"pompa","nilai":30}` ditolak dengan kode `400` sebelum sempat menjadi perintah ke Node 1.

Satu skema dipakai tiga kali: untuk memeriksa, untuk memberi label tipe TypeScript (`z.infer`), dan untuk membuat dokumentasi API (Konsep 8). Inilah gaya kerja yang dicari perusahaan: aturannya ditulis **sekali**, dipakai di mana-mana.

Pemeriksa kontrak di Modul 11 (`alat/pemeriksa-kontrak.js`) dan Zod sama-sama memeriksa kontrak, tetapi tugasnya berbeda. Pemeriksa adalah **alat uji** yang kamu jalankan sebentar saat mengubah firmware; Zod di backend adalah **penjaga pintu** yang bekerja terus, setiap detik, untuk setiap pesan.

> ➡️ **Saatnya praktik!** Konsep 6–7 cukup untuk [Praktik 3 — Backend mendengar broker](#praktik-3--backend-mendengar-broker-35-menit) dan [Praktik 4 — Jangan percaya perangkat](#praktik-4--jangan-percaya-perangkat-kontrak-data-dengan-zod-40-menit). Setelah itu, kembali ke Konsep 8.

### 8. Dokumentasi otomatis: OpenAPI, Swagger UI, dan Bruno

Daftar menu restoran yang tidak pernah diperbarui lebih buruk daripada tanpa menu: tamu memesan hidangan yang sudah tidak ada. Dokumentasi API juga begitu. Kalau ditulis tangan di file terpisah, cepat atau lambat ia berbeda dengan kodenya. Jalan keluarnya: **dokumentasi dibuat otomatis dari kode yang sama**.

- **OpenAPI** adalah format standar untuk menjelaskan API: rute apa saja yang ada, metode apa, isi permintaannya seperti apa, dan jawaban apa saja yang mungkin (lengkap dengan kode statusnya). Bentuknya satu file JSON besar yang bisa dibaca program.
- **@fastify/swagger** menyusun file OpenAPI itu dari rute-rute Fastify dan skema Zod-nya (Konsep 7). Skema yang memeriksa permintaan **adalah** dokumentasinya, jadi keduanya tidak mungkin berbeda.
- **@fastify/swagger-ui** menampilkan file itu sebagai halaman web yang rapi di **`/docs`**: setiap rute satu baris berwarna, bisa diklik untuk melihat isi permintaan dan contoh jawabannya, bahkan dicoba langsung dari browser.

![Halaman /docs, dokumentasi API yang dibuat dari kode: tangkapan layar asli Swagger UI backend final dengan lima nomor, dipotong dan disusun ulang. Kiri, daftar rute: bilah atas fastify dengan kotak alamat http://127.0.0.1:8080/docs/json dan tombol Explore, judul Rumah Pintar Mini API dengan lencana 0.1.0 dan OAS 3.0, tautan http://127.0.0.1:8080/docs/json, dan keterangan Backend v0.1 (Modul 16). Nomor 1 menandai alamat dokumen OpenAPI itu. Nomor 2 menandai grup server dan perangkat. Nomor 3 menandai baris rute, masing-masing dengan ringkasannya: GET /health, keadaan server (hidup, tersambung ke broker, dan jumlah pesan); GET /devices, daftar semua perangkat yang pernah terdengar; GET /devices/{id}/latest, bacaan telemetry terbaru satu perangkat; GET /devices/{id}/vitals, kesehatan terakhir satu perangkat (vitals); dan POST /devices/{id}/command, kirim satu perintah set ke perangkat, lalu tunggu ack-nya (paling lama 5 detik). Kanan, rute POST /devices/{id}/command dibuka dan dipotong per bagian. Nomor 4 menandai Request body (required, application/json) dengan Example Value target lampu, nilai true. Nomor 5 menandai daftar Responses dengan kolom Code, Description, dan Links: 200 perangkat menjawab dengan ack; 404 perangkat belum pernah terdengar; 409 perangkat offline, Node 2, atau jenisnya belum diketahui; 503 backend tidak tersambung ke broker; 504 tidak ada ack dalam 5 detik; semuanya No links. Keterangan bawah: 1 alamat dokumen OpenAPI, satu file JSON yang bisa dibaca program lain, misalnya Bruno; 2 grup dari isian tags di skema setiap rute; 3 satu baris per rute, dengan metode berwarna (GET biru, POST hijau), alamat, dan ringkasan dari isian summary; 4 isi permintaan dari skema PerintahSet beserta contohnya; 5 daftar jawaban per kode status dengan keterangan dari .describe; kode 400 tidak tercantum karena jawaban itu dibuat Fastify sendiri saat isi atau id melanggar skema.](aset/swagger-docs.png)

**Bruno** adalah aplikasi untuk **mencoba API**: kamu menyusun permintaan (metode, alamat, isi JSON), menekan kirim, lalu melihat kode status, waktu, dan isi jawabannya. Fungsinya mirip MQTTX, tetapi untuk HTTP. Mengapa tidak cukup browser? Browser hanya mudah dipakai untuk `GET`; untuk `POST` dengan isi JSON, kamu butuh alat seperti Bruno. Mengapa Bruno, bukan Postman yang lebih terkenal? Bruno menyimpan setiap permintaan sebagai **file teks biasa** di folder proyekmu (`backend/bruno/`), tanpa akun dan tanpa layanan awan (*cloud*). Akibatnya, koleksi permintaanmu ikut di-*commit* bersama kodenya: temanmu cukup membuka folder itu di Bruno untuk mencoba API yang sama persis.

Swagger UI dan Bruno saling melengkapi: **`/docs` menjawab "pintu apa saja yang ada?"**, sedangkan **Bruno menyimpan "permintaan yang sering kucoba"**, lengkap dengan *environment* (kumpulan variabel, misalnya `baseUrl` = `http://127.0.0.1:8080`) supaya alamat server cukup diganti di satu tempat.

> ➡️ **Saatnya praktik!** Konsep 8 cukup untuk [Praktik 5 — Bacaan terbaru, `/docs`, dan Bruno](#praktik-5--bacaan-terbaru-docs-dan-bruno-45-menit). Setelah itu, kembali ke Konsep 9.

### 9. Perintah lewat API: kirim, tunggu `ack`, dan batas waktu

Sejak Modul 11, perintah ke Node 1 berjalan seperti ini: seseorang mem-*publish* JSON ke `rpm/<device_id>/cmd`, Node 1 mengerjakannya, lalu menjawab di `rpm/<device_id>/ack` dengan `id` yang sama (kontrak data bagian 7–8). MQTT bersifat **asinkron**: yang mengirim tidak menunggu, dan jawabannya datang di topik lain. HTTP sebaliknya: tamu mengirim satu permintaan dan **menunggu satu jawaban**. Backend menjembatani keduanya:

![Diagram urutan perintah lewat API, dengan waktu berjalan dari atas ke bawah: HTTP menunggu satu jawaban, MQTT tidak, dan backend menjembatani keduanya. Empat garis hidup dari kiri ke kanan: Bruno (tamu, HTTP), Backend (API + telinga MQTT, disorot hijau), Broker (Mosquitto di Pi), dan Node 1 (a4cf12e5b7c0). 1, Bruno mengirim POST /devices/a4cf12e5b7c0/command dengan isi target lampu, nilai true. 2, backend memeriksa isinya dengan Zod, lalu keadaannya: perangkat ada, Node 1 (bukan Node 2), dan online. Kotak di sampingnya berbunyi 409 kalau perangkat offline, langsung dijawab tanpa mencoba. 3, backend membuat id perintah c-20261019-041128-1, lalu mulai menunggu ack ber-id itu, dengan jam pasir bertulisan menunggu paling lama 5 detik. 4, backend mem-publish ke rpm/a4cf12e5b7c0/cmd dengan QoS 1, tidak retained, dan broker meneruskannya ke Node 1 dalam JSON yang disingkat, dengan id yang sama, target lampu, dan nilai true. Kotak merah di kiri: tidak ada ack dalam 5 detik, backend menyerah dengan 504, Bruno tidak menunggu selamanya. 5, Node 1 menyalakan relay lampu, klik, lalu menjawab dengan id yang sama di rpm/a4cf12e5b7c0/ack; broker meneruskan ack berisi id c-20261019-041128-1 dan ok true ke backend. 6, telinga MQTT memeriksa ack itu, lalu menyerahkannya ke permintaan yang menunggu, dan backend menjawab Bruno dengan 200 + ack + lama_ms, misalnya lama_ms 12.](aset/alur-perintah-ack.png)

1. Bruno mengirim `POST /devices/a4cf12e5b7c0/command` dengan isi `{"target":"lampu","nilai":true}`.
2. Backend memeriksa isinya (Zod), memastikan perangkatnya ada, Node 1 (bukan Node 2), dan sedang `online`.
3. Backend membuat **`id` perintah** baru, misalnya `c-20261019-041128-1`, lalu **mulai menunggu** `ack` ber-`id` itu.
4. Backend mem-*publish* perintah ke `rpm/a4cf12e5b7c0/cmd` (QoS 1, **tidak** *retained*).
5. Node 1 menyalakan relay, lalu menjawab di `rpm/a4cf12e5b7c0/ack`.
6. Telinga MQTT backend (Konsep 6) menerima `ack` itu, memeriksanya, lalu **menyerahkannya** ke permintaan yang sedang menunggu. Backend menjawab Bruno dengan `200` beserta `ack`-nya dan lama tunggunya dalam milidetik.

Bagaimana kalau Node 1 tidak menjawab, misalnya listriknya padam sesaat sebelum perintah tiba? Tanpa **batas waktu**, permintaan Bruno akan menunggu selamanya. Kontrak data menetapkan setiap `cmd` dijawab dalam 5 detik (aturan 4), jadi backend menunggu **paling lama 5 detik**, lalu menyerah dengan kode **`504`**. Pola "tunggu dengan batas waktu" ini dibuat dari dua hal yang sudah kamu kenal, yaitu Promise (Modul 4 Konsep 12) dan pengatur waktu `setTimeout`. Janjinya ditepati oleh siapa pun yang datang lebih dulu: `ack` atau `setTimeout`.

**Mengapa `id` perintah harus unik, bahkan setelah server dimulai ulang?** Node 1 mengingat delapan `id` terakhir dan **diam-diam mengabaikan** `id` yang pernah ia kerjakan (kontrak aturan 8) supaya perintah yang terkirim dua kali karena QoS 1 tidak dikerjakan dua kali. Penulis modul ini sempat tersandung di sini: `id` bernomor urut `c-20261019-0001` dimulai lagi dari `0001` setiap kali server dimulai ulang. Akibatnya, perintah pertama sesudahnya memakai `id` yang masih diingat Node 1. Perintah itu diabaikan, dan API menjawab `504` tanpa sebab yang jelas. Karena itu, `id` perintah backend ini memuat **jam pembuatannya** (`041128` = pukul 04.11.28 UTC).

### 10. Git untuk tim: *branch*, *pull request*, dan *review*

Bayangkan tiga orang menulis satu laporan di satu kertas sekaligus: tulisan saling menimpa, dan tidak ada yang tahu bagian mana yang sudah diperiksa. Tim pemrogram mengatasinya dengan tiga kebiasaan:

1. **Cabang (*branch*) per fitur.** Cabang `main` selalu berisi versi yang berjalan. Setiap fitur baru dikerjakan di cabangnya sendiri, misalnya `fitur/vitals`: salinan yang bisa diacak-acak tanpa mengganggu `main`. Di terminal: `git switch -c fitur/vitals`.
2. ***Pull request* (PR).** Setelah fiturnya selesai dan cabangnya dikirim ke GitHub, kamu membuka **permintaan untuk menggabungkan** cabang itu ke `main`. Halaman PR di GitHub menampilkan semua perubahan berwarna hijau-merah, tempat orang lain membaca dan berkomentar.
3. ***Code review* dengan checklist.** Sebelum digabung (*merge*), seseorang memeriksa perubahannya dengan daftar periksa yang sama setiap kali: lolos `npm run cek`? Sudah dicoba di Bruno? Tampil di `/docs`? Tidak ada `.env` atau kata sandi? Pesan *commit*-nya jelas? Dalam proyek pribadi, peninjaunya kamu sendiri, dan itu tetap berguna: membaca perubahan sendiri di halaman PR sering menemukan sisa `console.log` atau salah ketik yang terlewat di editor.

![Diagram Git untuk tim, yaitu branch, pull request, dan review, dari Praktik 8: fitur GET /devices/:id/vitals dikerjakan di cabangnya sendiri, diperiksa, lalu digabung ke main. Tiga pita dari kiri ke kanan: di laptop (terminal VS Code), di GitHub (browser), dan di laptop lagi (terminal VS Code). Garis main berjalan mendatar dengan commit templat pull request; dari commit itu cabang hijau fitur/vitals naik, berisi commit GET /devices/:id/vitals, menyeberang ke pita GitHub, melewati label pull request #1, lalu turun kembali ke main di merge commit Merge pull request #1; di pita kanan, main di laptop maju ke merge commit itu. Ada tujuh langkah bernomor. 1, git switch -c fitur/vitals: cabang baru dari main, dan main tidak tersentuh. 2, tulis fiturnya, lalu uji sendiri dengan npm run cek, kirim dari Bruno, dan lihat di /docs, kemudian git add . dan git commit. 3, git push -u origin fitur/vitals: cabangnya dikirim ke GitHub, dan -u mengingat pasangan cabang laptop dan GitHub. 4, Pull request #1 dengan base main dan compare fitur/vitals, beserta checklist yang masih kosong: npm run cek lolos, dicoba di Bruno dan tesnya lulus, tampil di /docs, serta tidak ada .env atau kata sandi. 5, Review, periksa lalu centang checklist: tab Files changed, komentar di satu baris, lalu Review changes, Comment, dan Submit review. 6, Merge dengan pilihan Create a merge commit, lalu Merge pull request, Confirm merge, dan Delete branch. 7, pulang ke main dengan git switch main, git pull --prune, dan git branch -d fitur/vitals, sehingga main di laptop menerima merge commit dari GitHub dan cabang fitur dihapus; buktinya tampak di riwayat git log --oneline --graph.](aset/git-branch-pr.png)

Kebiasaan ini dipakai di semua modul berikutnya. Riwayat Git yang berisi PR rapi dengan checklist juga hal pertama yang dilihat perekrut di profil GitHub-mu.

> ➡️ **Saatnya praktik!** Konsep 9 cukup untuk [Praktik 6 — Perintah lewat API](#praktik-6--perintah-lewat-api-cmd-dan-ack-40-menit) dan [Praktik 7 — Simulator sepuluh perangkat](#praktik-7--simulator-sepuluh-perangkat-25-menit); Konsep 10 untuk [Praktik 8 — Git untuk tim](#praktik-8--git-untuk-tim-branch-pull-request-dan-review-45-menit).

## 🔧 Praktik langkah demi langkah

Delapan praktik minggu ini membangun backend v0.1 sedikit demi sedikit, di folder `backend` yang dibuat di Kemenangan Cepat. Setiap praktik diakhiri *commit*. Kalau kodemu tidak jalan dan kamu ingin membandingkan, keadaan kode di akhir Praktik 2 sampai 6 ada di folder [`kode/tahap/`](kode/tahap/) modul ini, dan keadaan akhirnya di [`kode/backend/`](kode/backend/).

### Praktik 1 — Git di terminal: *commit* pertama backend (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Git** (dipasang di 1.1), **GitHub CLI** (khusus macOS, 1.3), browser yang sudah masuk ke akun GitHub-mu, dan repositori `rumah-pintar-mini`. Konsep yang dipakai: 3.

#### 1.1 Pasang Git

GitHub Desktop membawa `git`-nya sendiri, tetapi `git` itu tidak bisa dipanggil dari terminal. Karena itu, pasang Git sekali saja.

<details>
<summary><b>Windows</b>: Git for Windows 2.56.0</summary>

1. Buka **https://git-scm.com/install/windows**, lalu klik tautan **Click here to download** di bagian atas (atau **Git for Windows/x64 Setup** di bawahnya). Yang terunduh adalah `Git-2.56.0.2-64-bit.exe`, sekitar 64 MB. Laptop Windows berchip ARM memakai **Git for Windows/ARM64 Setup**.
2. Jalankan pemasangnya (*installer*). Hampir semua layar cukup dilewati dengan **Next**; ubah **dua** pilihan saja:
   - Di layar **Choosing the default editor used by Git**, ganti **Use Vim (the ubiquitous text editor) as Git's default editor** menjadi **Use Visual Studio Code as Git's default editor**. Vim adalah editor terminal yang membingungkan pemula, sedangkan VS Code sudah kamu kenal.
   - Di layar **Adjusting the name of the initial branch in new repositories**, pilih **Override the default branch name for new repositories**. Kotak di bawahnya sudah berisi `main`; biarkan.
3. Layar-layar lainnya biarkan seperti bawaannya, terutama **Adjusting your PATH environment** (**Git from the command line and also from 3rd-party software**, supaya `git` bisa dipanggil dari terminal VS Code) dan **Choose a credential helper** (**Git Credential Manager**, yang nanti mengurus proses masuk ke GitHub). Di layar terakhir klik **Install**, tunggu, lalu **Finish**.
4. **Tutup semua jendela VS Code**, lalu buka lagi. Terminal yang sudah terbuka sebelum Git terpasang belum mengenal perintah `git`.

</details>

<details>
<summary><b>macOS</b>: Git dari Command Line Tools</summary>

1. Buka terminal VS Code, lalu ketik `git --version`.
2. Kalau macOS menampilkan dialog yang menawarkan memasang *command line developer tools*, klik **Install**, setujui lisensinya (**Agree**), lalu tunggu. Unduhannya sekitar 0,5–1 GB, jadi siapkan 5–20 menit. Setelah selesai, klik **Done**. Kalau tidak ada dialog dan langsung tercetak versi Git, berarti alat ini sudah terpasang sebelumnya.

</details>

Lalu, di terminal VS Code (Windows maupun macOS), periksa:

```text
git --version
```

**Hasilnya:** `git version 2.56.0.windows.2` (Windows) atau `git version 2.50.1 (Apple Git-…)` (macOS; angkanya bisa sedikit berbeda). Kalau Windows menjawab dengan pesan yang memuat `The term 'git' is not recognized`, VS Code belum ditutup dan dibuka ulang setelah pemasangan (langkah 4 di atas).

#### 1.2 Siapa penulis *commit*-mu?

Setiap *commit* mencatat nama dan email penulisnya. Di Modul 3, GitHub Desktop sudah mengisinya (layar **Configure Git**), dan `git` di terminal membaca catatan yang sama. Periksa:

```text
git config --global user.name
git config --global user.email
```

Kalau keduanya mencetak nama dan alamat (biasanya alamat berakhiran `@users.noreply.github.com`), lanjutkan ke 1.3. Kalau kosong, isi dengan namamu dan alamat *noreply* GitHub-mu (cari di GitHub lewat foto profil → **Settings** → **Emails**, bagian **Keep my email addresses private**):

```text
git config --global user.name "Nama Kamu"
git config --global user.email "12345678+nama-akunmu@users.noreply.github.com"
```

Alamat *noreply* menjaga email pribadimu agar tidak tersebar di riwayat repositori publik.

#### 1.3 Masuk ke GitHub dari terminal

Akun yang sudah masuk di GitHub Desktop tidak bisa dipakai `git` di terminal, jadi *push* pertama dari terminal akan memintamu masuk sekali.

- **Windows:** tidak perlu memasang apa pun lagi. Git Credential Manager yang ikut terpasang bersama Git akan memunculkan jendela **Connect to GitHub** saat *push* pertama di 1.5.
- **macOS:** pasang **GitHub CLI**, lalu masuk sekali:
  1. Unduh **`gh_2.102.0_macOS_universal.pkg`** (sekitar 28 MB) dari **https://github.com/cli/cli/releases/tag/v2.102.0** (bagian **Assets**), lalu buka dan pasang seperti aplikasi biasa.
  2. Tutup dan buka lagi terminal VS Code, lalu jalankan `gh auth login`. Jawab empat pertanyaannya dengan tombol panah dan **Enter**: **GitHub.com**, **HTTPS**, **Y** (untuk pertanyaan `Authenticate Git with your GitHub credentials?`), dan **Login with a web browser**.
  3. Terminal mencetak kode sekali pakai, misalnya `! First copy your one-time code: ABCD-1234`. Salin kodenya, tekan **Enter** untuk membuka browser, tempel kodenya, lalu setujui. Di akhir, terminal mencetak `✓ Logged in as nama-akunmu`.

#### 1.4 `.gitignore` sebelum *commit* pertama

Folder `node_modules` dari Kemenangan Cepat berisi 48 library dan tidak boleh ikut ke GitHub. Di VS Code, klik folder **`backend`**, lalu buat file baru **`.gitignore`** (diawali titik) berisi:

```text
# library dari npm: besar, dan bisa dibuat ulang dengan npm install
node_modules/
```

Praktik 2 menambahkan satu aturan lagi (untuk `.env`) ke file ini.

#### 1.5 *Commit* dan *push* dari terminal

Terminal VS Code yang baru dibuka dimulai di folder `rumah-pintar-mini`. Kalau kamu memakai terminal lama dari Kemenangan Cepat, periksa dulu dengan `pwd`: kalau jalurnya berakhiran `backend`, naik dulu dengan `cd ..`. Tanpa itu, `git status` hanya menulis `./`, dan `git add backend` menolak dengan `fatal: pathspec 'backend' did not match any files`. Ketik satu per satu, dan baca keluaran setiap perintah:

```text
git status
```

**Hasilnya:**

```text
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        backend/

nothing added to commit but untracked files present (use "git add" to track)
```

`Untracked files` berarti file baru yang belum pernah di-*commit*. Git meringkas folder baru menjadi satu baris `backend/`; isinya baru terlihat satu per satu saat *commit*. Pengguna macOS mungkin juga melihat `.DS_Store`, file catatan Finder yang dulu selalu kamu lewati di GitHub Desktop (Modul 3): biarkan saja karena perintah berikut hanya memasukkan `backend`. Masukkan ke keranjang, lalu potret:

```text
git add backend
git commit -m "Backend: server pertama dengan GET /health (Modul 16 Kemenangan Cepat)"
```

**Hasilnya** (kode `1a2b3c4` dan jumlah baris di layarmu bisa berbeda):

```text
[main 1a2b3c4] Backend: server pertama dengan GET /health (Modul 16 Kemenangan Cepat)
 4 files changed, 668 insertions(+)
 create mode 100644 backend/.gitignore
 create mode 100644 backend/package-lock.json
 create mode 100644 backend/package.json
 create mode 100644 backend/src/server.ts
```

Hanya empat file yang ikut, tanpa satu pun isi `node_modules`: itulah kerja `.gitignore`. `package-lock.json` (dibuat npm) mencatat versi persis setiap library supaya laptop lain memasang versi yang sama persis; file ini memang ikut di-*commit*. Di Windows, mungkin muncul peringatan `LF will be replaced by CRLF`: itu hanya pemberitahuan tentang akhir baris, aman diabaikan. Sekarang kirim ke GitHub:

```text
git push
```

- **Windows, *push* pertama:** jendela **Connect to GitHub** muncul. Klik **Sign in with your browser**, setujui di browser, lalu kembali ke terminal: *push* berlanjut sendiri. Berikutnya tidak perlu masuk lagi.
- **macOS:** *push* langsung berjalan karena kamu sudah masuk lewat `gh auth login`.

**Hasilnya** diakhiri baris seperti ini:

```text
To https://github.com/nama-akunmu/rumah-pintar-mini.git
   9f8e7d6..1a2b3c4  main -> main
```

Buka repositori `rumah-pintar-mini` di GitHub: folder `backend` sudah ada di sana. Buka juga GitHub Desktop: tab **History** menampilkan *commit* yang baru kamu buat dari terminal karena keduanya membaca folder repositori yang sama.

Terakhir, lihat riwayatnya dari terminal:

```text
git log --oneline
```

Satu baris per *commit*, yang terbaru di atas. Tekan **q** kalau daftarnya panjang dan terminal menunggu.

> **Kalau *push* ditolak** dengan pesan berawalan `! [rejected]` dan petunjuk `hint: Updates were rejected because the remote contains work …`, berarti ada *commit* di GitHub yang belum ada di laptopmu (misalnya kamu pernah mengubah file langsung di github.com). Jalankan `git pull --no-rebase --no-edit`, lalu `git push` lagi. `--no-rebase` menyuruh Git menggabungkan *commit* dari GitHub dengan *commit*-mu. Tanpa pilihan ini, Git di macOS berhenti dengan `fatal: Need to specify how to reconcile divergent branches.` tanpa menggabungkan apa pun. `--no-edit` mencegah Git membuka editor untuk pesan penggabungannya (di Windows, editor itu berupa tab `MERGE_MSG` di VS Code, dan terminal menunggu sampai tab itu ditutup).

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 4](#4-typescript-ringan-label-tipe-yang-diperiksa-sebelum-program-jalan) (➡️ di akhir Konsep 5 akan mengantarmu ke Praktik 2).

### Praktik 2 — Struktur proyek, TypeScript ringan, dan `.env` (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya (folder `backend`), **Node.js 24**, **browser**, dan `git` di terminal (Praktik 1). Perangkat keras belum dipakai. Konsep yang dipakai: 4–5.

Di praktik ini, `server.ts` sepuluh baris dari Kemenangan Cepat dirapikan menjadi kerangka backend sungguhan: folder dengan tugas yang jelas, pemeriksa TypeScript, log yang enak dibaca, dan setelan di `.env` (Konsep 4–5). Isi API-nya belum bertambah; yang berubah adalah "rumah"-nya.

#### 2.1 Pasang alat pengembangan

Di terminal VS Code, pastikan kamu di folder `backend` (`pwd` harus berakhiran `backend`; kalau masih di `rumah-pintar-mini` sejak Praktik 1, ketik dulu `cd backend`), lalu jalankan:

```text
npm install --save-dev typescript@7.0.2 @types/node@24 pino-pretty@13.2.0
```

`--save-dev` menandai ketiganya sebagai **alat pengembangan** (*devDependencies*): alat bantu selama backend dikembangkan di laptop, bukan bagian inti programnya. Dua yang pertama hanya dipakai untuk memeriksa tipe, sedangkan pino-pretty dimuat server setiap kali menyala, khusus untuk merapikan tampilan log.

- **typescript**: pemeriksa tipe untuk `npm run cek`.
- **@types/node**: "kamus" tipe untuk fitur bawaan Node.js 24, misalnya `process.env`.
- **pino-pretty**: perapi log supaya log JSON Fastify tampil sebagai satu baris berwarna per kejadian.

**Hasilnya** (angkanya bisa sedikit berbeda):

```text
added 18 packages, and audited 67 packages in 4s

21 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 2.2 Rapikan `package.json`

Buka `package.json` (di folder `backend`), lalu samakan isinya dengan ini. Yang berubah: `"name"`, `"version"`, dan `"description"` diisi, baris `"main"` diganti `"private": true`, bagian `"scripts"` diganti, dan baris `"keywords"`, `"author"`, serta `"license"` dihapus. Baris `"type": "module"` sudah ada sejak Kemenangan Cepat; pastikan baris `"type"` hanya ada satu, di mana pun letaknya. Daftar `"dependencies"` dan `"devDependencies"` sudah diisi npm, jadi biarkan seperti milikmu.

```json
{
  "name": "rumah-pintar-mini-backend",
  "version": "0.1.0",
  "description": "Backend Rumah Pintar Mini (Modul 16): mendengar MQTT, memeriksa kontrak data, dan menyediakan API",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.ts",
    "start": "node --env-file=.env src/server.ts",
    "cek": "tsc --noEmit"
  },
  "dependencies": {
    "fastify": "^5.12.7"
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "pino-pretty": "^13.2.0",
    "typescript": "^7.0.2"
  }
}
```

- **`"private": true`** mencegah proyek ini diterbitkan ke npm secara tidak sengaja.
- Bagian **`"scripts"`** memberi nama pendek untuk perintah yang panjang. Mulai sekarang, cukup ketik **`npm run dev`** (server dengan mulai ulang otomatis, membaca `.env`), **`npm start`** (server tanpa mulai ulang otomatis), atau **`npm run cek`** (pemeriksaan tipe TypeScript).
- Ingat aturan JSON dari Modul 4: tidak boleh ada koma setelah baris terakhir di dalam kurung kurawal.

#### 2.3 Pemeriksa TypeScript: `tsconfig.json`

Di Explorer, klik `package.json` (di folder `backend`) supaya file baru ikut masuk ke folder itu, lalu buat file baru **`tsconfig.json`** (sejajar dengan `package.json`, bukan di akar `rumah-pintar-mini`):

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

File ini dibaca VS Code dan `npm run cek`, bukan oleh Node.js. Yang penting dipahami:

- **`"strict": true`**: periksa dengan ketat (misalnya, nilai yang mungkin kosong harus dicek dulu sebelum dipakai).
- **`"noEmit": true`**: hanya periksa, jangan membuat file JavaScript baru. Node.js 24 sudah menjalankan `.ts` langsung.
- **`allowImportingTsExtensions`**, **`erasableSyntaxOnly`**, dan **`verbatimModuleSyntax`**: tiga aturan yang sama dengan aturan Node.js 24 di Konsep 4 (impor berakhiran `.ts`, hanya sintaks yang bisa dihapus, `import type` untuk tipe). Pemeriksa langsung memprotes kalau kamu melanggarnya, sebelum Node.js sempat menolak.
- **`"include": ["src"]`**: yang diperiksa hanya isi folder `src`.

#### 2.4 Setelan di `.env`

1. Buat file **`.env.example`** di folder `backend`:

   ```text
   # Salin file ini menjadi .env, lalu sesuaikan isinya. File .env tidak ikut Git (lihat .gitignore).
   MQTT_URL=mqtt://192.168.1.37:1883
   PORT=8080
   HOST=127.0.0.1
   ```

2. Buat file kedua, **`.env`**, dengan isi yang sama, lalu ganti `192.168.1.37` dengan alamat broker milikmu: alamat Pi dari Modul 12, atau alamat broker laptopmu kalau kamu memakai jalur laptop. Baris yang diawali `#` adalah komentar, dan boleh dihapus dari `.env`.
3. Buka `.gitignore` (dibuat di Praktik 1), lalu tambahkan dua baris di bawahnya sehingga isinya menjadi:

   ```text
   # library dari npm: besar, dan bisa dibuat ulang dengan npm install
   node_modules/
   # setelan rahasia laptop ini; contohnya ada di .env.example
   .env
   ```

4. Periksa dengan `git status`. Di bagian `Untracked files` harus ada `.env.example` (bersama `tsconfig.json`), tetapi **tidak** ada `.env`. Kalau `.env` ikut muncul, ejaan di `.gitignore` salah (harus persis `.env`, diawali titik).

Alamat broker belum dipakai di praktik ini (backend baru mendengar broker di Praktik 3), tetapi setelannya disiapkan sekarang supaya kode berikut bisa memeriksanya.

#### 2.5 Folder `src` dan tiga file pertama

Buat dua folder baru di dalam `src`: **`config`** dan **`routes`**. Lalu buat tiga file berikut. Ketik isinya, jangan disalin-tempel: mengetik membuatmu memperhatikan setiap baris.

**`src/config/env.ts`** membaca setelan dari `.env` dan berhenti dengan pesan jelas kalau setelan wajib belum diisi:

```ts
// env.ts - setelan server dari file .env (dibaca Node.js lewat --env-file) dan diperiksa sekali saat server mulai.

function wajib(nama: string): string {
  const nilai = process.env[nama];
  if (nilai === undefined || nilai === "") {
    console.error(`Setelan ${nama} belum diisi. Salin .env.example menjadi .env, isi ${nama}, lalu jalankan lagi.`);
    process.exit(1); // berhenti di sini: tanpa setelan ini server tidak bisa bekerja
  }
  return nilai;
}

export const env = {
  MQTT_URL: wajib("MQTT_URL"), // alamat broker, misalnya mqtt://192.168.1.37:1883
  PORT: Number(process.env.PORT || 8080), // nomor loket server
  HOST: process.env.HOST || "127.0.0.1", // 127.0.0.1 = hanya bisa diketuk dari laptop ini
};
```

- `function wajib(nama: string): string` adalah TypeScript ringan pertamamu: parameter `nama` harus teks, dan fungsinya mengembalikan teks.
- `||` artinya "kalau yang kiri kosong, pakai yang kanan": tanpa baris `PORT` di `.env`, atau dengan baris `PORT=` yang belum diisi, server memakai `8080`. Begitu juga `HOST`: kalau kosong, server tetap hanya mendengar di `127.0.0.1`.
- `Number(...)` mengubah teks `"8080"` dari `.env` menjadi angka `8080`. Semua isi `.env` tiba sebagai teks.

**`src/routes/kesehatan.ts`** memindahkan rute `/health` dari Kemenangan Cepat ke file rutenya sendiri. Fastify menyebut file seperti ini ***plugin***: sebuah fungsi yang menerima `app`, lalu mendaftarkan rute-rutenya.

```ts
// kesehatan.ts - GET /health: apakah server hidup?
import type { FastifyPluginAsync } from "fastify";

interface Jawaban {
  ok: boolean;
  pesan: string;
}

export const ruteKesehatan: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    const jawaban: Jawaban = { ok: true, pesan: "backend Rumah Pintar Mini hidup" };
    return jawaban;
  });
};
```

`import type` dipakai karena `FastifyPluginAsync` hanya label tipe, bukan kode yang dijalankan (Konsep 4).

**`src/server.ts`**: ganti seluruh isinya dengan versi ini.

```ts
// server.ts - pintu masuk backend Rumah Pintar Mini v0.1 (Modul 16).
// Jalankan: npm run dev (mulai ulang otomatis saat file disimpan) atau npm start.
import Fastify, { LogController } from "fastify";
import { env } from "./config/env.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // log bawaan per permintaan terlalu panjang...
});
app.addHook("onResponse", async (req, reply) => {
  // ...jadi diganti satu baris per permintaan. Hook seperti ini disebut middleware.
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});

await app.register(ruteKesehatan);
await app.listen({ port: env.PORT, host: env.HOST });
```

Tiga hal baru di sini:

- **Log yang enak dibaca.** `transport: { target: "pino-pretty", … }` menyalurkan log JSON Fastify ke perapi: jam lokal (`translateTime`), tanpa nomor proses, nama laptop, dan nomor permintaan (`ignore`).
- ***Middleware*.** `app.addHook("onResponse", …)` memasang fungsi yang dijalankan Fastify **setelah setiap jawaban dikirim**, apa pun rutenya. Fungsi seperti ini, yang menyela perjalanan setiap permintaan, disebut ***middleware*** (di Fastify namanya ***hook***). Di sini ia mencetak satu baris ringkas untuk setiap permintaan, sebagai ganti dua log panjang bawaan Fastify yang dimatikan `LogController`. Kelak, *hook* yang sama dipakai untuk memeriksa kata sandi di setiap permintaan (Modul 20).
- **`app.register(ruteKesehatan)`** memasang *plugin* rute. Setiap file rute baru nanti dipasang dengan satu baris `register` seperti ini.

#### 2.6 Jalankan dengan `npm run dev`

Hentikan server lama kalau masih jalan (**Ctrl + C**), lalu jalankan:

```text
npm run dev
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.1.0 dev
> node --watch --env-file=.env src/server.ts

[12:59:20] INFO: Server listening at http://127.0.0.1:8080
```

Buka `http://127.0.0.1:8080/health` di browser. Jawabannya sama seperti Kemenangan Cepat, tetapi kini terminal mencatat setiap tamu dalam satu baris: `[12:59:23] INFO: GET /health -> 200 (4 ms)`. Coba juga alamat yang tidak ada, misalnya `http://127.0.0.1:8080/apa`. Browser menampilkan `{"message":"Route GET:/apa not found","error":"Not Found","statusCode":404}`, dan terminal mencatat `GET /apa -> 404 (0 ms)`. Baris `GET /favicon.ico -> 404` yang kadang ikut muncul berasal dari browser yang mencari ikon tab (Kemenangan Cepat langkah 4); abaikan saja.

Biarkan `npm run dev` tetap berjalan di terminal ini. Untuk perintah lain, buka terminal kedua dengan ikon **+** di panel terminal. Terminal baru selalu mulai di folder `rumah-pintar-mini`, jadi ketik dulu `cd backend` di sana. Mulai sekarang, "terminal pertama" berarti terminal tempat `npm run dev` berjalan, dan "terminal kedua" berarti terminal untuk perintah lain, keduanya di folder `backend`.

#### 2.7 Sengaja salah: siapa yang menangkap?

Di `kesehatan.ts`, ubah baris `const jawaban: Jawaban = …` menjadi (perhatikan salah ketik `pessan`):

```ts
    const jawaban: Jawaban = { ok: true, pessan: "backend Rumah Pintar Mini hidup" };
```

Simpan, lalu perhatikan tiga tempat:

1. **VS Code** langsung menggarisbawahi `pessan` dengan garis merah bergelombang. Arahkan tetikus ke garis itu: VS Code menjelaskan bahwa `pessan` tidak ada di `Jawaban`, dan menyarankan `pesan`.
2. **Server** di terminal pertama justru **tetap memulai ulang dengan tenang**, dan browser yang dimuat ulang menampilkan `{"ok":true,"pessan":"backend Rumah Pintar Mini hidup"}`. Node.js hanya menghapus label tipe, tidak memeriksanya (Konsep 4).
3. Di terminal kedua, jalankan pemeriksa:

   ```text
   npm run cek
   ```

   **Hasilnya:**

   ```text
   > rumah-pintar-mini-backend@0.1.0 cek
   > tsc --noEmit

   src/routes/kesehatan.ts:11:42 - error TS2561: Object literal may only specify known properties, but 'pessan' does not exist in type 'Jawaban'. Did you mean to write 'pesan'?

   11     const jawaban: Jawaban = { ok: true, pessan: "backend Rumah Pintar Mini hidup" };
                                               ~~~~~~


   Found 1 error in src/routes/kesehatan.ts:11
   ```

   `11:42` artinya baris 11, karakter ke-42 (spasi di awal baris ikut dihitung). Di bawahnya, pemeriksa mengutip baris itu dan menandai bagian yang salah dengan `~~~~~~`, lalu menutup dengan ringkasan `Found 1 error`. Kalau VS Code menjorokkan kodemu 4 spasi (bawaannya), sedangkan kode modul ini 2 spasi, angka di belakang titik dua sedikit berbeda, misalnya `11:46`; yang penting nama file dan pesannya sama.

Kembalikan `pessan` menjadi `pesan`, simpan, lalu jalankan `npm run cek` sekali lagi. Kali ini ia hanya mencetak dua baris `>` tanpa pesan galat: itu artinya lolos. Biasakan menjalankan `npm run cek` sebelum setiap *commit*; Praktik 8 menjadikannya butir pertama checklist *pull request*.

#### 2.8 *Commit* lewat terminal

Di terminal kedua (folder `backend`):

```text
git add .
git status
git commit -m "Backend: struktur src, TypeScript, dan .env (Modul 16 Praktik 2)"
git push
```

`git add .` memasukkan semua perubahan di folder ini ke keranjang (tanda titik = "folder ini"). `git status` di antara `git add` dan `git commit` adalah kebiasaan baik: sebelum *commit*, pastikan `.env` **tidak** ada di daftar hijau. Kalau ada, keluarkan dengan `git restore --staged .env`, lalu periksa lagi `.gitignore`-mu. Pengguna macOS: kalau `.DS_Store` ikut masuk daftar hijau, keluarkan juga dengan `git restore --staged .DS_Store`, lalu tambahkan satu baris `.DS_Store` di `.gitignore` supaya tidak terbawa lagi. Simpan `.gitignore`, lalu masukkan perubahannya dengan `git add .gitignore` sebelum `git commit`.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 6](#6-backend-sebagai-klien-mqtt-satu-telinga-untuk-semua-topik) (➡️ di akhir Konsep 7 akan mengantarmu ke Praktik 3).

### Praktik 3 — Backend mendengar broker (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (dua terminal di folder `backend`), **browser**, **MQTTX** (sambungan **Gateway Pi** dari Modul 12), Node 1 dan Node 2 yang menyala seperti biasa (atau simulator Praktik 7). Konsep yang dipakai: 6.

Backend kini memasang "telinga": sambungan MQTT yang mendengarkan semua topik `rpm/#` di broker, lalu menyimpan keadaan terakhir setiap perangkat di memori. Di praktik ini pesan belum diperiksa sama sekali. Itu disengaja: di langkah terakhir kamu akan melihat sendiri mengapa itu berbahaya.

#### 3.1 Pasang mqtt.js

Di terminal kedua (folder `backend`):

```text
npm install mqtt@5.16.1
```

Ini library yang sama dengan yang dipakai alat pemeriksa kontrak di folder `alat` sejak Modul 11. **Hasilnya** diawali `added 38 packages`.

#### 3.2 "Ingatan": `src/services/gudang.ts`

Buat folder **`services`** di dalam `src`, lalu buat file **`gudang.ts`** di dalamnya:

```ts
// gudang.ts - menyimpan keadaan terakhir setiap perangkat di memori.
// Data hilang saat server dimatikan; Modul 17 menggantinya dengan database.

export interface Perangkat {
  device_id: string;
  status: string;
  terakhir_dilihat: string; // waktu server (UTC) saat pesan terakhir perangkat ini tiba
  telemetry: unknown; // belum diperiksa sama sekali (Praktik 4 memasang pemeriksanya)
  vitals: unknown;
}

const daftar = new Map<string, Perangkat>();
export const hitungan = { diterima: 0, ditolak: 0 };

function ambilAtauBuat(deviceId: string): Perangkat {
  let p = daftar.get(deviceId);
  if (p === undefined) {
    p = { device_id: deviceId, status: "belum-diketahui", terakhir_dilihat: "", telemetry: null, vitals: null };
    daftar.set(deviceId, p);
  }
  p.terakhir_dilihat = new Date().toISOString();
  return p;
}

export function simpanTelemetry(deviceId: string, isi: unknown): void {
  ambilAtauBuat(deviceId).telemetry = isi;
}

export function simpanStatus(deviceId: string, status: string): void {
  ambilAtauBuat(deviceId).status = status;
}

export function simpanVitals(deviceId: string, isi: unknown): void {
  ambilAtauBuat(deviceId).vitals = isi;
}

export function semuaPerangkat(): Perangkat[] {
  return [...daftar.values()];
}

export function cariPerangkat(deviceId: string): Perangkat | undefined {
  return daftar.get(deviceId);
}
```

- **`Map`** adalah "lemari berlabel": setiap laci diberi label `device_id`, isinya objek `Perangkat`. `daftar.get(id)` membuka laci, `daftar.set(id, isi)` mengisinya. Bedanya dengan objek biasa: `Map` dibuat untuk koleksi yang isinya bertambah dan berkurang saat program berjalan.
- **`ambilAtauBuat()`** membuka laci perangkat itu, atau membuat laci baru kalau perangkatnya baru pertama terdengar, lalu mencatat jam kedatangan pesannya.
- **`unknown`** adalah label TypeScript untuk "isinya belum diketahui". TypeScript tidak mengizinkan kita membaca kolom dari nilai `unknown` (misalnya `telemetry.suhu`) sebelum isinya diperiksa. Itu pengingat yang jujur: data perangkat belum terbukti benar.
- `semuaPerangkat()` mengembalikan isi lemari sebagai *array* biasa: `[...daftar.values()]` menuang semua isi laci ke dalam satu daftar.

#### 3.3 "Telinga": `src/services/mqtt.ts`

Buat file **`mqtt.ts`** di folder `services`:

```ts
// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/# dan menyimpan setiap pesan.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import { hitungan, simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";

let klien: mqtt.MqttClient | undefined;

export function mulaiMqtt(url: string, log: FastifyBaseLogger): void {
  const idKlien = "backend-" + Math.random().toString(16).slice(2, 8); // nama unik, bukan device_id
  klien = mqtt.connect(url, { clientId: idKlien, reconnectPeriod: 5000 });
  klien.on("connect", () => {
    log.info(`tersambung ke broker ${url}`);
    klien?.subscribe("rpm/#", { qos: 1 });
  });
  klien.on("reconnect", () => log.warn("broker belum terjangkau, mencoba lagi dalam 5 detik"));
  klien.on("error", (galat) => log.error(`galat MQTT: ${galat.message}`));
  klien.on("message", (topik, isi) => terima(topik, isi.toString(), log));
}

export function brokerTersambung(): boolean {
  return klien?.connected ?? false;
}

function terima(topik: string, teks: string, log: FastifyBaseLogger): void {
  const bagian = topik.split("/"); // ["rpm", device_id, jenis]
  if (bagian.length !== 3) return;
  const [, deviceId, jenis] = bagian;
  if (jenis === "status") {
    simpanStatus(deviceId, teks);
  } else if (jenis === "telemetry" || jenis === "vitals") {
    let json: unknown;
    try {
      json = JSON.parse(teks);
    } catch {
      log.warn(`${topik}: isinya bukan JSON`);
      return;
    }
    if (jenis === "telemetry") simpanTelemetry(deviceId, json);
    else simpanVitals(deviceId, json);
  } else {
    return; // cmd dan ack menyusul di Praktik 6
  }
  hitungan.diterima++;
  log.info(`${topik} ${teks}`); // tampilkan setiap pesan (Praktik 4 menggantinya dengan pemeriksaan)
}
```

Baca dari atas ke bawah:

- **`mqtt.connect(url, …)`** membuka sambungan ke broker, seperti tombol **Connect** di MQTTX. Kalau broker belum terjangkau (Pi mati, salah alamat), mqtt.js **mencoba lagi sendiri** setiap 5 detik (`reconnectPeriod: 5000`), jadi backend tidak perlu dimulai ulang.
- **`klien.on("connect", …)`**, **`klien.on("message", …)`**, dan kawan-kawannya mendaftarkan fungsi yang dipanggil saat **kejadian** itu terjadi: tersambung, mencoba lagi, galat, pesan tiba. Pola ini sama dengan *callback* ESP-NOW di Modul 14: kita tidak menunggu pesan, pesanlah yang "membangunkan" fungsi kita.
- **`subscribe("rpm/#", { qos: 1 })`** berlangganan semua topik Rumah Pintar Mini sekaligus (Konsep 6).
- **`terima()`** memecah topik di tanda `/`. Baris `const [, deviceId, jenis] = bagian;` mengambil isi kedua dan ketiga *array* (koma di depan berarti "lewati isi pertama, `rpm`"). Status disimpan sebagai teks; `telemetry` dan `vitals` diubah dulu dari teks JSON menjadi objek. Pesan yang bukan JSON dicatat sebagai peringatan (`log.warn`) dan dibuang.
- `isi.toString()`: mqtt.js menyerahkan isi pesan sebagai deretan byte (*Buffer*), jadi diubah dulu menjadi teks.

#### 3.4 Rute `GET /devices` dan `/health` yang lebih jujur

Buat file **`src/routes/perangkat.ts`**:

```ts
// perangkat.ts - rute /devices: daftar perangkat yang pernah terdengar.
import type { FastifyPluginAsync } from "fastify";
import { semuaPerangkat } from "../services/gudang.ts";

export const rutePerangkat: FastifyPluginAsync = async (app) => {
  app.get("/devices", async () => {
    return semuaPerangkat().map((p) => ({
      device_id: p.device_id,
      status: p.status,
      terakhir_dilihat: p.terakhir_dilihat,
    }));
  });
};
```

`map` dari pemanasan langkah 2: setiap perangkat diringkas menjadi tiga kolom, tanpa isi `telemetry` yang panjang.

Lalu ganti seluruh isi **`src/routes/kesehatan.ts`** supaya `/health` juga melapor apakah backend tersambung ke broker dan berapa pesan yang sudah diterima:

```ts
// kesehatan.ts - GET /health: apakah server hidup dan tersambung ke broker?
import type { FastifyPluginAsync } from "fastify";
import { hitungan } from "../services/gudang.ts";
import { brokerTersambung } from "../services/mqtt.ts";

export const ruteKesehatan: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return { ok: true, broker: brokerTersambung(), diterima: hitungan.diterima, ditolak: hitungan.ditolak };
  });
};
```

#### 3.5 Pasang semuanya di `server.ts`

Di **`src/server.ts`**, tambahkan dua baris impor di bawah baris `import { ruteKesehatan } …`:

```ts
import { rutePerangkat } from "./routes/perangkat.ts";
import { mulaiMqtt } from "./services/mqtt.ts";
```

lalu ganti dua baris terakhir file itu menjadi:

```ts
await app.register(ruteKesehatan);
await app.register(rutePerangkat);

mulaiMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
```

`app.log` adalah pencatat Fastify, dipinjamkan ke telinga MQTT supaya log-nya tampil dengan gaya yang sama. Simpan. `npm run dev` di terminal pertama memulai ulang server.

#### 3.6 Dengarkan

Pastikan Node 1 dan gateway Pi menyala (jalur simulator: simulator dari 7.2 tetap berjalan di terminal ketiga, jadi log-mu berisi sepuluh perangkat `f00d…`, bukan Node 1 dan Node 2 seperti di bawah). **Hasilnya** di terminal pertama (rekaman lab penulis; jam dan angka di layarmu berbeda):

```text
[13:18:04] INFO: Server listening at http://127.0.0.1:8080
[13:18:04] INFO: tersambung ke broker mqtt://192.168.1.37:1883
[13:18:04] INFO: rpm/a4cf12e5b7c0/status online
[13:18:04] INFO: rpm/246f28b1c7d4/status online
[13:18:09] INFO: rpm/a4cf12e5b7c0/telemetry {"ts":"2026-10-19T06:18:09Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}
```

- Dua baris `status` muncul **seketika**, sebelum perangkat mengirim apa pun: itu pesan *retained* (Modul 11) yang disimpan broker dan langsung diserahkan kepada pelanggan baru. Backend yang baru menyala langsung tahu siapa yang `online`.
- `telemetry` Node 1 datang setiap 10 detik. `telemetry` Node 2 (`rpm/246f28b1c7d4/telemetry`, berisi `tekanan`) hanya datang sekali setiap 5 menit, saat Node 2 bangun.

Buka `http://127.0.0.1:8080/devices` di browser:

```json
[{"device_id":"a4cf12e5b7c0","status":"online","terakhir_dilihat":"2026-10-19T06:18:09.183Z"},{"device_id":"246f28b1c7d4","status":"online","terakhir_dilihat":"2026-10-19T06:18:04.627Z"}]
```

Itu API pertamamu yang menjawab dengan data sungguhan. Buka juga `http://127.0.0.1:8080/health`: `"broker":true` dan angka `diterima` yang terus bertambah.

Waktu `terakhir_dilihat` ditulis dalam UTC (huruf `Z` di belakang), tujuh jam di belakang WIB: `06:18` UTC = `13:18` WIB. Backend selalu menyimpan waktu dalam UTC, sama seperti `ts` di kontrak data; mengubahnya ke jam setempat adalah tugas tampilan (dashboard, Modul 22).

#### 3.7 Lihat masalahnya: backend percaya apa saja

Di **MQTTX**, buka sambungan **Gateway Pi**. Di kotak kirim di bagian bawah, pastikan kotak **Retain** **tidak** tercentang (pesan *retained* yang rusak akan diserahkan lagi kepada backend setiap kali server dimulai ulang), pilih format **JSON**, isi kolom **Topic** dengan `rpm/a4cf12e5b7c0/telemetry` (pakai `device_id` Node 1-mu), lalu kirim isi ini dengan tombol kirim (ikon pesawat kertas):

```json
{"suhu":"panas","kelembapan":255}
```

Lihat terminal pertama: pesan itu dicatat seperti pesan lain, dan angka `diterima` di `/health` bertambah satu. Backend baru saja **menyimpan** "bacaan" Node 1 tanpa `ts`, dengan suhu berupa kata dan kelembapan 255 %. Seandainya dashboard di Modul 22 menampilkan bacaan terakhir ini, jarum suhunya rusak. Seandainya ada aturan "nyalakan kipas kalau suhu di atas 30", aturan itu bingung membandingkan `"panas"` dengan `30`. Pesan yang benar dari Node 1 akan menimpanya 10 detik kemudian, tetapi pesan rusak dari perangkat yang benar-benar rusak akan terus datang. Praktik 4 memasang penjaganya.

> **Simpan dulu:** `git add .` lalu `git commit -m "Backend mendengar rpm/# dan GET /devices (Modul 16 Praktik 3)"` dan `git push` di terminal kedua.
>
> ➡️ **Lanjut** ke [Praktik 4 — Jangan percaya perangkat](#praktik-4--jangan-percaya-perangkat-kontrak-data-dengan-zod-40-menit) tanpa kembali ke konsep.

### Praktik 4 — Jangan percaya perangkat: kontrak data dengan Zod (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (dua terminal di folder `backend`), **browser**, **MQTTX** (sambungan **Gateway Pi**), `KONTRAK-DATA.md` (versi 1.2, di repositori `rumah-pintar-mini`), dan Node 1 serta Node 2 yang menyala (atau simulator Praktik 7). Konsep yang dipakai: 7.

Di praktik ini, kontrak data versi 1.2 ditulis ulang sebagai skema Zod, lalu dipasang sebagai penjaga pintu MQTT. Setelah itu, pesan rusak dari Praktik 3.7 ditolak dengan alasan yang jelas.

#### 4.1 Pasang Zod

Di terminal kedua (folder `backend`):

```text
npm install zod@4.6.7
```

#### 4.2 Kontrak yang bisa dijalankan: `src/schemas/kontrak.ts`

Klik `KONTRAK-DATA.md` di Explorer (di akar `rumah-pintar-mini`) untuk membukanya di tab, lalu klik kanan tab-nya → **Split Right**. Kontrak kini terbuka di samping editor, jadi kamu bisa mencocokkan setiap baris skema dengan tabel kontraknya. Buat folder **`schemas`** di dalam `src`, lalu buat file **`kontrak.ts`**:

```ts
// kontrak.ts - Lampiran A (kontrak data 1.2) dalam bentuk skema Zod: kontrak yang bisa dijalankan.
// Setiap pesan dari perangkat dicek dengan skema ini sebelum disimpan ("jangan percaya perangkat").
import { z } from "zod";

z.config(z.locales.id()); // pesan galat Zod dalam bahasa Indonesia

export const DeviceId = z.string().regex(/^[0-9a-f]{12}$/, "device_id harus 12 digit heksadesimal huruf kecil");

const Waktu = z.iso.datetime(); // waktu UTC, contoh 2026-10-19T02:10:05Z
const Versi = z.string().regex(/^\d+\.\d+\.\d+$/, "versi harus berbentuk x.y.z");
const desimal = (min: number, max: number) => z.number().min(min).max(max).nullable();
const bulat = (min: number, max: number) => z.number().int().min(min).max(max).nullable();

// telemetry Node 1 (kontrak 1.0) ditambah tiga kolom sensor RS-485 yang boleh tidak ada (kontrak 1.2)
export const TelemetryNode1 = z.strictObject({
  ts: Waktu,
  fw: Versi,
  suhu: desimal(-40, 80),
  kelembapan: bulat(0, 100),
  cahaya: z.number().int().min(0).max(4095),
  tanah: z.number().int().min(0).max(100),
  gerak: z.boolean(),
  level_air: bulat(0, 100),
  tanah_rs485: desimal(0, 100).optional(),
  suhu_tanah: desimal(-55, 125).optional(),
  ec: bulat(0, 20000).optional(),
});

// telemetry Node 2 (kontrak 1.1), diterbitkan Node 1 atas nama Node 2; dikenali dari kolom tekanan
export const TelemetryNode2 = z.strictObject({
  ts: Waktu,
  fw: Versi,
  suhu: desimal(-40, 80),
  kelembapan: bulat(0, 100),
  tekanan: desimal(300, 1100),
  suhu_tanah: desimal(-55, 125),
  tanah: bulat(0, 100),
  baterai: desimal(2.5, 4.5).optional(),
});

export const Status = z.enum(["online", "offline", "offline-mode"]);

export const Vitals = z.strictObject({
  ts: Waktu,
  rssi: z.number().int().max(0),
  uptime_s: z.number().int().min(0),
  heap_free: z.number().int().min(0),
});

export const Keadaan = z.strictObject({
  kipas: z.boolean(),
  lampu: z.boolean(),
  pompa: z.boolean(),
  tirai: z.number().int().min(0).max(180),
});

export const Ack = z
  .strictObject({
    id: z.string().min(1).max(39),
    ts: Waktu.nullable(),
    ok: z.boolean(),
    pesan: z.string().optional(),
    state: Keadaan,
  })
  .refine((a) => a.ok || a.pesan !== undefined, "pesan wajib ada kalau ok bernilai false"); // kontrak bagian 8

// isi POST /devices/:id/command: satu aktuator dan nilainya (kontrak bagian 7)
export const PerintahSet = z.discriminatedUnion("target", [
  z.strictObject({ target: z.literal("lampu"), nilai: z.boolean() }),
  z.strictObject({ target: z.literal("kipas"), nilai: z.boolean() }),
  z.strictObject({ target: z.literal("pompa"), nilai: z.number().int().min(1).max(10) }),
  z.strictObject({ target: z.literal("tirai"), nilai: z.number().int().min(0).max(180) }),
]);

export type TelemetryNode1 = z.infer<typeof TelemetryNode1>;
export type TelemetryNode2 = z.infer<typeof TelemetryNode2>;
export type Status = z.infer<typeof Status>;
export type Vitals = z.infer<typeof Vitals>;
export type Ack = z.infer<typeof Ack>;
export type PerintahSet = z.infer<typeof PerintahSet>;
```

Cara membacanya, dari atas:

- **`z.config(z.locales.id())`** membuat pesan galat Zod berbahasa Indonesia ("Terlalu besar", "Input tidak valid"). Satu baris ini berlaku untuk seluruh backend.
- **`DeviceId`**: teks yang cocok dengan pola `^[0-9a-f]{12}$`, artinya tepat dua belas karakter, masing-masing `0`–`9` atau `a`–`f` (kontrak bagian 1). Pola seperti ini disebut ***regular expression*** (ekspresi reguler): `^` awal teks, `[0-9a-f]` satu karakter dari daftar itu, `{12}` tepat dua belas kali, `$` akhir teks. Argumen kedua adalah pesan yang ditampilkan kalau tidak cocok.
- **`Waktu`** (`z.iso.datetime()`): teks waktu UTC berformat ISO 8601, misalnya `2026-10-19T02:10:05Z`. **`Versi`**: tiga angka bertitik, misalnya `1.4.0`.
- **`desimal(min, max)`** dan **`bulat(min, max)`** adalah dua fungsi pembantu kecil supaya aturan yang sering dipakai tidak ditulis berulang. Keduanya menerima angka (atau bilangan bulat, `.int()`) dalam rentang tertentu, **atau `null`** (`.nullable()`) karena bacaan gagal ditulis `null` (kontrak aturan 7).
- **`TelemetryNode1`** memuat delapan kolom wajib dari kontrak bagian 4, persis dengan tipe dan rentangnya. `cahaya` dan `tanah` tidak boleh `null` karena kontrak menulis "—" untuk keduanya. Tiga kolom RS-485 diberi **`.optional()`**: boleh tidak ada sama sekali (Node 1 dengan `rs485 off`), tetapi kalau ada, harus angka dalam rentangnya atau `null`. Satu aturan kontrak belum ikut diperiksa di sini: ketiganya selalu datang bersama. Pesan yang hanya membawa `ec` masih lolos, sedangkan pemeriksa kontrak Modul 15 menolaknya; menambahkan aturan itu dengan `.refine(…)` bisa menjadi latihan.
- **`TelemetryNode2`** mengikuti tabel Node 2 di kontrak versi 1.1; `baterai` boleh tidak ada.
- **`z.strictObject`** menolak kolom yang **tidak** ada di kontrak. Inilah yang menangkap salah ketik seperti `suuhu`. `z.object` biasa akan membiarkannya lewat diam-diam.
- **`Status`** (`z.enum`): hanya tiga teks yang sah.
- **`Ack`** diakhiri **`.refine(…)`**: aturan tambahan yang tidak bisa ditulis sebagai tipe kolom, yaitu "kalau `ok` bernilai `false`, `pesan` wajib ada" (kontrak bagian 8).
- **`PerintahSet`** (`z.discriminatedUnion`) adalah aturan isi perintah: kalau `target` bernilai `"lampu"` atau `"kipas"`, `nilai` harus `true`/`false`; kalau `"pompa"`, bilangan bulat 1–10; kalau `"tirai"`, 0–180. Skema ini baru dipakai di Praktik 6.
- Baris-baris **`export type … = z.infer<typeof …>`** di bagian bawah membuat **label tipe TypeScript dari skema yang sama**. Aturannya ditulis sekali, lalu dipakai Zod untuk memeriksa pesan saat program berjalan **dan** dipakai VS Code saat kamu mengetik (Konsep 7). Nama tipe boleh sama dengan nama skemanya: TypeScript tahu kapan yang dimaksud skema (nilai) dan kapan tipe (label).

#### 4.3 Gudang yang lebih tahu isinya

Ganti seluruh isi **`src/services/gudang.ts`**:

```ts
// gudang.ts - menyimpan keadaan terakhir setiap perangkat di memori.
// Data hilang saat server dimatikan; Modul 17 menggantinya dengan database.
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

export interface Perangkat {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  status: Status | "belum-diketahui";
  terakhir_dilihat: string; // waktu server (UTC) saat pesan terakhir perangkat ini tiba
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
}

const daftar = new Map<string, Perangkat>();
export const hitungan = { diterima: 0, ditolak: 0 };

function ambilAtauBuat(deviceId: string): Perangkat {
  let p = daftar.get(deviceId);
  if (p === undefined) {
    p = { device_id: deviceId, jenis: "belum-diketahui", status: "belum-diketahui", terakhir_dilihat: "", telemetry: null, vitals: null };
    daftar.set(deviceId, p);
  }
  p.terakhir_dilihat = new Date().toISOString();
  return p;
}

export function simpanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  const p = ambilAtauBuat(deviceId);
  p.jenis = "tekanan" in isi ? "node2" : "node1";
  p.telemetry = isi;
}

export function simpanStatus(deviceId: string, status: Status): void {
  ambilAtauBuat(deviceId).status = status;
}

export function simpanVitals(deviceId: string, isi: Vitals): void {
  ambilAtauBuat(deviceId).vitals = isi;
}

export function semuaPerangkat(): Perangkat[] {
  return [...daftar.values()];
}

export function cariPerangkat(deviceId: string): Perangkat | undefined {
  return daftar.get(deviceId);
}
```

Yang berubah dibanding Praktik 3:

- `telemetry` dan `vitals` kini berlabel tipe dari kontrak (`TelemetryNode1 | TelemetryNode2`, `Vitals`), bukan `unknown`. Tanda **`|`** berarti "salah satu dari": `telemetry` Node 1 **atau** Node 2. Karena gudang hanya menerima data yang sudah lolos pemeriksaan, isinya kini boleh dipercaya.
- Kolom baru **`jenis`**: `simpanTelemetry()` mengenali Node 2 dari kolom `tekanan` (kontrak bagian 10 menyebut `tekanan` sebagai kolom khas Node 2 sejak versi 1.2).

#### 4.4 Telinga yang memeriksa

Ganti seluruh isi **`src/services/mqtt.ts`**:

```ts
// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/# dan memeriksa setiap pesan dengan kontrak data.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import { hitungan, simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";

let klien: mqtt.MqttClient | undefined;

export function mulaiMqtt(url: string, log: FastifyBaseLogger): void {
  const idKlien = "backend-" + Math.random().toString(16).slice(2, 8); // nama unik, bukan device_id
  klien = mqtt.connect(url, { clientId: idKlien, reconnectPeriod: 5000 });
  klien.on("connect", () => {
    log.info(`tersambung ke broker ${url}`);
    klien?.subscribe("rpm/#", { qos: 1 });
  });
  klien.on("reconnect", () => log.warn("broker belum terjangkau, mencoba lagi dalam 5 detik"));
  klien.on("error", (galat) => log.error(`galat MQTT: ${galat.message}`));
  klien.on("message", (topik, isi) => terima(topik, isi.toString(), log));
}

export function brokerTersambung(): boolean {
  return klien?.connected ?? false;
}

function tolak(topik: string, alasan: string, log: FastifyBaseLogger): void {
  hitungan.ditolak++;
  log.warn(`DITOLAK ${topik}: ${alasan}`);
}

// ringkas daftar masalah dari Zod, misalnya "kelembapan: Terlalu besar: diharapkan number menjadi <=100"
function ringkas(galat: ZodError): string {
  return galat.issues.map((m) => `${m.path.join(".") || "isi"}: ${m.message}`).join("; ");
}

function terima(topik: string, teks: string, log: FastifyBaseLogger): void {
  const bagian = topik.split("/"); // ["rpm", device_id, jenis]
  if (bagian.length !== 3) return tolak(topik, "topik harus berbentuk rpm/<device_id>/<jenis>", log);
  const [, deviceId, jenis] = bagian;
  if (!DeviceId.safeParse(deviceId).success) return tolak(topik, "device_id tidak sah", log);
  if (jenis === "cmd") return; // perintah (dari backend ini atau MQTTX), bukan data perangkat

  if (jenis === "status") {
    if (teks === "") return; // pesan kosong = seseorang menghapus status retained (Modul 11), bukan status baru
    const hasil = Status.safeParse(teks);
    if (!hasil.success) return tolak(topik, `status "${teks}" tidak dikenal`, log);
    simpanStatus(deviceId, hasil.data);
    hitungan.diterima++;
    return;
  }

  let json: unknown;
  try {
    json = JSON.parse(teks);
  } catch {
    return tolak(topik, "isinya bukan JSON", log);
  }

  if (jenis === "telemetry") {
    const punyaTekanan = typeof json === "object" && json !== null && "tekanan" in json;
    const hasil = (punyaTekanan ? TelemetryNode2 : TelemetryNode1).safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    simpanTelemetry(deviceId, hasil.data);
  } else if (jenis === "vitals") {
    const hasil = Vitals.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    simpanVitals(deviceId, hasil.data);
  } else if (jenis === "ack") {
    const hasil = Ack.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    log.info(`ack ${hasil.data.id} tiba (ok=${hasil.data.ok})`); // Praktik 6 menyerahkannya ke perintah yang menunggu
  } else {
    return tolak(topik, `jenis pesan "${jenis}" tidak ada di kontrak`, log);
  }
  hitungan.diterima++;
}
```

Yang berubah dibanding Praktik 3:

- **`tolak()`** menambah hitungan `ditolak` dan mencatat alasannya sebagai peringatan `DITOLAK …`. Pesan yang ditolak tidak pernah sampai ke gudang.
- Status berisi teks kosong diabaikan tanpa dicatat (`if (teks === "") return;`). Pesan seperti itu adalah cara MQTTX dan mode `bersihkan` simulator (Praktik 7) menghapus pesan *retained* (🚨 "Perangkat palsu `f00d…` masih muncul"), bukan status baru.
- **`ringkas()`** mengubah daftar masalah dari Zod menjadi satu baris, misalnya `kelembapan: Terlalu besar: diharapkan number menjadi <=100`. `import type { ZodError }` hanya meminjam label tipenya.
- **`terima()`** kini memeriksa berlapis, dari yang paling murah: bentuk topik, lalu `device_id`, lalu jenis pesan, lalu isi JSON dengan skema yang cocok. Setiap pemeriksaan memakai **`safeParse()`**, yang tidak pernah membuat program berhenti: hasilnya punya `success` (`true`/`false`) dan, kalau berhasil, `data` yang sudah bertipe.
- Untuk `telemetry`, skemanya dipilih dari ada atau tidaknya kolom `tekanan`: Node 2 diperiksa dengan `TelemetryNode2`, selain itu dengan `TelemetryNode1`. Baris `typeof json === "object" && json !== null && "tekanan" in json` memastikan dulu bahwa isinya benar-benar objek sebelum mencari kolomnya; TypeScript menolak membaca kolom dari `unknown` tanpa pemeriksaan ini.
- `ack` sudah diperiksa dan dicatat (`ack … tiba (ok=true)`), tetapi belum diserahkan ke siapa pun. Praktik 6 menyelesaikannya.
- Log `INFO` untuk setiap pesan yang lolos dihapus. Mulai sekarang, pesan yang lolos tidak lagi dicatat satu per satu: selain baris saat server menyala dan tersambung ke broker, terminal hanya menulis pesan yang ditolak, `ack` yang tiba, dan satu baris untuk setiap permintaan HTTP (2.6).

#### 4.5 `jenis` di `GET /devices`

Di **`src/routes/perangkat.ts`**, tambahkan satu baris `jenis: p.jenis,` di bawah `device_id: p.device_id,` sehingga bagian `map`-nya menjadi:

```ts
    return semuaPerangkat().map((p) => ({
      device_id: p.device_id,
      jenis: p.jenis,
      status: p.status,
      terakhir_dilihat: p.terakhir_dilihat,
    }));
```

Simpan semua file, lalu jalankan `npm run cek` di terminal kedua: harus lolos tanpa galat. Server di terminal pertama sudah dimulai ulang oleh `npm run dev`. Buka `http://127.0.0.1:8080/devices`: setiap perangkat kini punya kolom `jenis`. Node 1 menjadi `"jenis":"node1"` begitu `telemetry` berikutnya tiba, paling lama 10 detik setelah server dimulai ulang. Node 2 tetap `"belum-diketahui"` sampai ia bangun dan mengirim `telemetry` (paling lama 5 menit), baru menjadi `"jenis":"node2"`.

#### 4.6 Uji penjaganya

Dari **MQTTX** (sambungan **Gateway Pi**, kotak **Retain** tetap tidak tercentang), kirim satu per satu pesan berikut. Pilih format **JSON** untuk pesan JSON, dan **Plaintext** untuk pesan teks. Ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu.

| Topic | Isi pesan | Kesalahannya |
| :--- | :--- | :--- |
| `rpm/a4cf12e5b7c0/telemetry` | `{"ts":"2026-10-19T06:30:00Z","fw":"1.4.0","suhu":"panas","kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}` | `suhu` berupa kata |
| `rpm/a4cf12e5b7c0/telemetry` | `{"ts":"2026-10-19T06:30:00Z","fw":"1.4.0","suhu":28.5,"kelembapan":255,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}` | `kelembapan` di luar 0–100 |
| `rpm/a4cf12e5b7c0/telemetry` | `{"ts":"2026-10-19T06:30:00Z","fw":"1.4.0","suuhu":28.5,"suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}` | kolom salah ketik `suuhu` |
| `rpm/a4cf12e5b7c0/telemetry` | `halo` (Plaintext) | bukan JSON |
| `rpm/a4cf12e5b7c0/status` | `nyala` (Plaintext) | status tidak dikenal |
| `rpm/A4CF12E5B7C0/telemetry` | `{}` | `device_id` berhuruf besar |
| `rpm/a4cf12e5b7c0/suhu` | `28.5` (Plaintext) | jenis pesan tidak ada di kontrak |

**Hasilnya** di terminal pertama (rekaman lab penulis; di sana ketujuh pesan dikirim dengan skrip dalam satu detik, sedangkan jam di layarmu berselang beberapa detik mengikuti kecepatanmu mengirim):

```text
[13:07:59] WARN: DITOLAK rpm/a4cf12e5b7c0/telemetry: suhu: Input tidak valid: diharapkan number, diterima string
[13:07:59] WARN: DITOLAK rpm/a4cf12e5b7c0/telemetry: kelembapan: Terlalu besar: diharapkan number menjadi <=100
[13:08:00] WARN: DITOLAK rpm/a4cf12e5b7c0/telemetry: isi: Kunci tidak dikenali : "suuhu"
[13:08:00] WARN: DITOLAK rpm/a4cf12e5b7c0/telemetry: isinya bukan JSON
[13:08:00] WARN: DITOLAK rpm/a4cf12e5b7c0/status: status "nyala" tidak dikenal
[13:08:00] WARN: DITOLAK rpm/A4CF12E5B7C0/telemetry: device_id tidak sah
[13:08:00] WARN: DITOLAK rpm/a4cf12e5b7c0/suhu: jenis pesan "suhu" tidak ada di kontrak
```

`isi:` di baris ketiga berarti masalahnya ada di objek secara keseluruhan (kolom yang tidak dikenal), bukan di satu kolom. Buka `http://127.0.0.1:8080/health`: angka `ditolak` kini `7`, dan bacaan terakhir Node 1 di gudang tetap bacaan sahnya.

**Uji yang menarik:** kirim lagi pesan pertama, tetapi ganti `"suhu":"panas"` dengan `"suhu":null`. Pesan itu **lolos** karena kontrak justru menyuruh perangkat menulis `null` saat sensor gagal dibaca. Penjaga yang baik menolak yang salah, tetapi menerima kabar buruk yang jujur.

> **Simpan:** di terminal kedua (folder `backend`), `git add .`, `git commit -m "Kontrak data 1.2 sebagai skema Zod, pesan rusak ditolak (Modul 16 Praktik 4)"`, dan `git push`.
>
> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 8](#8-dokumentasi-otomatis-openapi-swagger-ui-dan-bruno) (➡️ di akhir Konsep 8 akan mengantarmu ke Praktik 5).

### Praktik 5 — Bacaan terbaru, `/docs`, dan Bruno (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (dua terminal di folder `backend`), **browser**, **Bruno 4.2.1** (dipasang di 5.6), dan Node 1 serta Node 2 yang menyala (atau simulator Praktik 7). Konsep yang dipakai: 8.
>
> ⭐ **Wajib** — syarat lulus: `GET /devices/<id>/latest` di Bruno mengembalikan JSON bacaan terbaru, dan `/docs` menampilkan rute-rutenya.

Di praktik ini, setiap rute diberi **skema**: aturan bentuk permintaan dan jawabannya. Dari skema yang sama, Fastify membuat dokumentasi di `/docs`. Lalu kamu memasang Bruno dan menyimpan permintaan-permintaan API di folder `backend/bruno`.

#### 5.1 Pasang tiga library dokumentasi

Di terminal kedua (folder `backend`):

```text
npm install fastify-type-provider-zod@7.0.0 @fastify/swagger@9.9.2 @fastify/swagger-ui@6.1.2
```

- **fastify-type-provider-zod** mengajari Fastify memakai skema Zod untuk memeriksa permintaan, membentuk jawaban, dan memberi label tipe pada `req.params` dan `req.body`.
- **@fastify/swagger** menyusun dokumen OpenAPI dari semua rute.
- **@fastify/swagger-ui** menampilkan dokumen itu sebagai halaman web di `/docs`.

#### 5.2 `server.ts` versi lengkap

Ganti seluruh isi **`src/server.ts`**:

```ts
// server.ts - pintu masuk backend Rumah Pintar Mini v0.1 (Modul 16).
// Jalankan: npm run dev (otomatis mulai ulang saat file disimpan) atau npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";
import { rutePerangkat } from "./routes/perangkat.ts";
import { mulaiMqtt } from "./services/mqtt.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // log bawaan per permintaan terlalu panjang...
});
app.addHook("onResponse", async (req, reply) => {
  // ...jadi diganti satu baris per permintaan (hook = "middleware" Fastify)
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
app.setValidatorCompiler(validatorCompiler); // skema Zod memeriksa isi permintaan...
app.setSerializerCompiler(serializerCompiler); // ...dan bentuk jawaban

await app.register(swagger, {
  openapi: { info: { title: "Rumah Pintar Mini API", description: "Backend v0.1 (Modul 16)", version: "0.1.0" } },
  transform: jsonSchemaTransform, // skema Zod yang sama menjadi dokumentasi OpenAPI
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(ruteKesehatan);
await app.register(rutePerangkat);

mulaiMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`dokumentasi API: http://${env.HOST}:${env.PORT}/docs`);
```

Yang baru:

- **`setValidatorCompiler`** dan **`setSerializerCompiler`**: setiap rute yang punya skema Zod kini diperiksa otomatis. Permintaan yang tidak cocok dengan skema ditolak dengan kode `400` **sebelum** *handler*-nya dijalankan, dan jawaban dibentuk sesuai skema jawabannya (kolom yang tidak tercantum di skema tidak ikut terkirim).
- **`register(swagger, …)`** menyusun dokumen OpenAPI. `openapi.info` adalah judul, keterangan, dan versi API yang tampil di bagian atas `/docs`. `transform: jsonSchemaTransform` menerjemahkan skema Zod ke bahasa OpenAPI.
- **`register(swaggerUi, { routePrefix: "/docs" })`** memasang halaman dokumentasinya. Urutannya penting: kedua *plugin* ini dipasang **sebelum** rute-rute supaya semua rute tercatat.
- Baris terakhir mencetak alamat dokumentasi saat server siap.

#### 5.3 `/health` dengan skema

Ganti seluruh isi **`src/routes/kesehatan.ts`**:

```ts
// kesehatan.ts - GET /health: apakah server hidup dan tersambung ke broker?
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { hitungan } from "../services/gudang.ts";
import { brokerTersambung } from "../services/mqtt.ts";

export const ruteKesehatan: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      summary: "Keadaan server: hidup, tersambung ke broker, dan jumlah pesan",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), diterima: z.number(), ditolak: z.number() })
          .describe("server hidup; broker = tersambung ke broker atau tidak"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerTersambung(), diterima: hitungan.diterima, ditolak: hitungan.ditolak };
  });
};
```

Ada dua perbedaan dengan Praktik 3. Tipe *plugin* kini **`FastifyPluginAsyncZod`**, dan rute diberi objek kedua berisi **`schema`**:

- **`tags`** mengelompokkan rute di `/docs` (kelompok `server`).
- **`summary`** adalah keterangan satu baris di samping alamat rute.
- **`response`** mendaftar bentuk jawaban menurut kode status. **`.describe("…")`** menjadi keterangan kode status itu di `/docs`.

#### 5.4 `/devices` dengan skema, dan rute baru `/devices/:id/latest`

Ganti seluruh isi **`src/routes/perangkat.ts`**:

```ts
// perangkat.ts - rute /devices: daftar perangkat dan bacaan terbaru.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { DeviceId, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { cariPerangkat, semuaPerangkat } from "../services/gudang.ts";

const Galat = z.object({ pesan: z.string() });
const Jenis = z.enum(["node1", "node2", "belum-diketahui"]);
const ParamId = z.object({ id: DeviceId.describe("device_id perangkat, misalnya a4cf12e5b7c0") });

export const rutePerangkat: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["perangkat"],
      summary: "Daftar semua perangkat yang pernah terdengar",
      response: {
        200: z.array(z.object({
          device_id: z.string(),
          jenis: Jenis,
          status: z.union([Status, z.literal("belum-diketahui")]),
          terakhir_dilihat: z.string(),
        })).describe("semua perangkat yang tercatat di memori"),
      },
    },
  }, async () => {
    return semuaPerangkat().map((p) => ({
      device_id: p.device_id,
      jenis: p.jenis,
      status: p.status,
      terakhir_dilihat: p.terakhir_dilihat,
    }));
  });

  app.get("/devices/:id/latest", {
    schema: {
      tags: ["perangkat"],
      summary: "Bacaan telemetry terbaru satu perangkat",
      params: ParamId,
      response: {
        200: z.object({
          device_id: z.string(),
          jenis: Jenis,
          status: z.union([Status, z.literal("belum-diketahui")]),
          telemetry: z.union([TelemetryNode1, TelemetryNode2]),
        }).describe("bacaan terbaru perangkat itu"),
        404: Galat.describe("belum ada telemetry dari perangkat itu"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined || p.telemetry === null) {
      return reply.code(404).send({ pesan: `belum ada telemetry dari ${req.params.id}` });
    }
    return { device_id: p.device_id, jenis: p.jenis, status: p.status, telemetry: p.telemetry };
  });
};
```

- **`Galat`**, **`Jenis`**, dan **`ParamId`** adalah skema kecil yang dipakai berulang. `ParamId` memakai `DeviceId` dari kontrak, jadi `GET /devices/A4CF/latest` langsung ditolak `400` dengan pesan `device_id harus 12 digit heksadesimal huruf kecil`.
- **`z.union([Status, z.literal("belum-diketahui")])`**: status perangkat adalah salah satu status kontrak, atau `belum-diketahui` (perangkat yang baru terdengar dari `telemetry`-nya, belum dari status *retained*-nya).
- Di rute **`/devices/:id/latest`**, `req.params.id` sudah bertipe teks dan sudah lolos pemeriksaan `DeviceId` saat *handler* dijalankan. Kalau perangkatnya belum pernah terdengar, atau belum pernah mengirim `telemetry`, *handler* menjawab **`404`** dengan `{"pesan": …}` lewat `reply.code(404).send(…)`.
- Skema jawaban `200` memuat **`z.union([TelemetryNode1, TelemetryNode2])`**: skema kontrak yang sama dengan pemeriksa MQTT di Praktik 4 kini juga menjadi dokumentasi bentuk jawaban API.

Simpan semua file, lalu jalankan `npm run cek` di terminal kedua. Harus lolos.

#### 5.5 Lihat dokumentasinya

Di terminal pertama, `npm run dev` sudah memulai ulang server, dan log-nya kini memuat baris `dokumentasi API: http://127.0.0.1:8080/docs` (biasanya disusul `tersambung ke broker …`). Buka alamat itu di browser:

![Mencoba GET /devices/{id}/latest langsung dari /docs: tiga potongan tangkapan layar asli Swagger UI backend tahap Praktik 5 untuk rute itu, bacaan telemetry terbaru satu perangkat, dengan empat nomor. Atas, sebelum dicoba: bagian Parameters dengan tombol Try it out, nomor 1. Tengah, setelah Try it out diklik: tombolnya menjadi Cancel, tabel parameter id (required, string, path) dengan keterangan device_id perangkat, misalnya a4cf12e5b7c0, kotak id berisi a4cf12e5b7c0, nomor 2, dan tombol biru Execute di samping Clear, nomor 3. Bawah, setelah Execute: Request URL http://127.0.0.1:8080/devices/a4cf12e5b7c0/latest, lalu Server response, nomor 4, dengan Code 200 dan Response body berisi device_id a4cf12e5b7c0, jenis node1, status online, dan telemetry berisi ts 2026-10-19T09:10:01Z, fw 1.4.0, suhu 28.5, kelembapan 71, cahaya 2310, tanah 37, gerak false, level_air 64. Keterangan kanan: 1 Try it out membuka kotak isian, dan setelah diklik tulisannya berubah menjadi Cancel; 2 kotak id diisi device_id Node 1-mu, di lab penulis a4cf12e5b7c0; 3 Execute mengirim permintaan GET ke backend, dan Request URL di bawahnya menunjukkan alamat lengkap yang diketuk; 4 Server response menampilkan kode 200 dan isi jawabannya, bacaan telemetry terbaru Node 1 yang sudah lolos pemeriksaan kontrak. Catatan: coba juga id yang salah, misalnya A4CF; Swagger UI menolaknya sebelum dikirim. Backend tahap Praktik 5 baru berisi /health, /devices, dan /devices/{id}/latest; data dari Node 1 tiruan di lab penulis.](aset/swagger-coba-latest.png)

Kalau Windows atau macOS-mu memakai tema gelap, halaman `/docs` ikut gelap; isinya sama, dan ikon bola lampu di ujung kanan bilah atas mengganti temanya. Coba langsung dari halaman ini:

1. Klik baris **GET `/devices/{id}/latest`** untuk membukanya, lalu klik tombol **Try it out** di kanan.
2. Isi kotak **id** dengan `device_id` Node 1-mu, lalu klik tombol biru **Execute**.
3. Gulir ke bawah: bagian **Server response** menampilkan kode `200` dan isi jawabannya, bacaan `telemetry` terbaru Node 1. Coba juga `id` milik Node 2: jawabannya `404` (`belum ada telemetry dari …`) sampai Node 2 bangun dan mengirim `telemetry` sejak server terakhir dimulai ulang, paling lama 5 menit. Lalu isi `id` yang salah, misalnya `A4CF`, dan klik **Execute**. Swagger UI tidak mengirimnya sama sekali, dan menulis `For 'id': Value must follow pattern ^[0-9a-f]{12}$.` di atas tombol **Execute**. Itu aturan `DeviceId` yang sama, kali ini diperiksa browser. Jawaban `400` dari server baru terlihat kalau alamatnya dibuka langsung di tab baru, `http://127.0.0.1:8080/devices/A4CF/latest`, berisi `"message":"params/id device_id harus 12 digit heksadesimal huruf kecil"`.

Kotak **Example Value** di daftar **Responses** berisi contoh yang dibuat otomatis dari skema, jadi isinya bisa terlihat aneh (misalnya `fw` berupa deretan angka yang sangat panjang); jawaban sungguhan selalu ada di **Server response**. Di bagian atas halaman tertulis `http://127.0.0.1:8080/docs/json`. Itulah dokumen OpenAPI mentah dalam JSON: program lain (misalnya Bruno atau pembuat kode klien) dan temanmu bisa membacanya untuk mengenali API-mu.

#### 5.6 Pasang Bruno

1. Buka **https://www.usebruno.com/downloads**, atau halaman rilis resminya di **https://github.com/usebruno/bruno/releases** (versi modul ini: **v4.2.1**).
   - **Windows:** unduh pemasang **`bruno_4.2.1_x64_win.exe`** (sekitar 116 MB; untuk laptop Windows berchip ARM: `bruno_4.2.1_arm64_win.exe`). Jalankan; di layar **Choose Installation Options** pilih **Only for me**, lalu ikuti layar berikutnya sampai selesai.
   - **macOS:** unduh **`bruno_4.2.1_arm64_mac.dmg`** untuk Mac berchip Apple (M1 dan sesudahnya), atau **`bruno_4.2.1_x64_mac.dmg`** untuk Mac Intel (cara mengeceknya sama dengan Modul 3 Praktik 9.1). Buka file `.dmg`-nya, lalu seret **Bruno** ke folder **Applications**. Kalau macOS bertanya apakah yakin membuka aplikasi yang diunduh dari internet, klik **Open**.
2. Buka Bruno. Saat pertama kali dibuka, Bruno menampilkan layar sambutan **Welcome to Bruno** dalam empat langkah. Klik **Get Started**; pilih tampilan (**Light**, **Dark**, atau **System**) lalu **Next**; biarkan lokasi penyimpanan bawaan lalu **Next**; di layar **Ready to go!**, klik **I'll explore on my own**.
3. Di bilah samping kiri, Bruno sudah membuatkan koleksi contoh **Sample API Collection**. Koleksi itu boleh dibiarkan atau dihapus; kita membuat koleksi sendiri.

Bruno tidak meminta akun, dan semua koleksinya tersimpan sebagai file biasa di laptopmu. Itulah alasan kita memilihnya (Konsep 8).

#### 5.7 Buat koleksi di `backend/bruno`

1. Di bilah samping, pada bagian **Collections**, klik ikon **+** (keterangannya `Add new collection`), lalu pilih **Create collection**. Muncul kotak isian kecil bertuliskan `Untitled Collection`.
2. Ketik nama koleksi **`Rumah Pintar Mini API`**, tetapi **jangan** tekan **Enter** dulu. Klik **ikon roda gigi** (keterangannya `Advanced options`) di samping kotak itu. Terbuka dialog **Create Collection**.
3. Pada **Location**, klik **Browse**, lalu pilih folder **`backend`** di dalam repositori `rumah-pintar-mini` (**Documents → GitHub → rumah-pintar-mini → backend**).
4. Pada **Folder Name**, klik ikon pensil, lalu ubah namanya menjadi **`bruno`**.
5. Klik **Create**. Bruno menulis `Collection created!`.

Di VS Code kini muncul folder **`backend/bruno`** berisi `opencollection.yml` (identitas koleksi) dan `.gitignore` buatan Bruno. Format filenya YAML, teks biasa yang mudah dibaca, jadi aman di-*commit*.

#### 5.8 *Environment* `lokal`

*Environment* adalah kumpulan variabel. Alamat server cukup ditulis sekali sebagai variabel `baseUrl`; kelak, kalau server pindah (misalnya ke internet di Modul 27), cukup ubah satu nilai ini.

1. Di ujung kanan atas, di atas area permintaan, klik pemilih bertuliskan **No Environment ▾**. Pada tab **Collection**, klik **Create**.
2. Isi **Environment Name** dengan **`lokal`**, lalu klik **Create**. Terbuka tabel variabel *environment* itu.
3. Isi satu baris: **Name** `baseUrl`, **Value** `http://127.0.0.1:8080`. Klik **Save**.
4. Klik lagi pemilih *environment* di kanan atas, lalu pilih **`lokal`**.

File baru `backend/bruno/environments/lokal.yml` muncul di VS Code. Isinya hanya nama dan alamat server, bukan rahasia, jadi aman di-*commit*.

#### 5.9 Tiga permintaan pertama

1. Klik kanan koleksi **Rumah Pintar Mini API** di bilah samping, lalu pilih **New Request**. Di dialog **New Request**, biarkan **Type** di **HTTP**, isi **Request Name** dengan **`health`**, lalu isi URL di sebelah pemilih metode (biarkan **GET**) dengan:

   ```text
   {{baseUrl}}/health
   ```

   Klik **Create**.
2. Permintaan `health` terbuka di tab baru. Klik **Send** di ujung kanan bilah alamat (atau tekan **Ctrl + Enter**). Panel jawaban di kanan menampilkan kode `200 OK`, lama permintaannya dalam milidetik, dan isi jawabannya, misalnya `{"ok":true,"broker":true,"diterima":42,"ditolak":0}`.
3. Tambahkan tes otomatis. Di deretan tab di bawah bilah alamat, buka tab **Assert**. Tabelnya selalu punya satu baris kosong: ketik `res.status` di kolom **Expr**, biarkan **Operator** berisi `equals` ("sama dengan"; di file tersimpan sebagai `eq`), lalu ketik `200` di kolom **Value**.
4. Simpan permintaannya dengan **Ctrl + S**: tes itu kini ikut tertulis di file `backend/bruno/health.yml`, yang sudah dibuat Bruno sejak kamu mengeklik **Create** di langkah 1. Klik **Send** lagi. Tab **Tests** di panel jawaban kini diberi angka kecil `1`, dan isinya `Assertions (1), Passed: 1, Failed: 0`. Mulai sekarang, Bruno memeriksa kode status setiap kali permintaan ini dikirim. Kalau jawabannya bukan `200`, tesnya ditandai gagal.
5. Dengan cara yang sama, buat dua permintaan lagi, masing-masing dengan tes `res.status` `eq` `200` yang sama, lalu simpan:

   | Request Name | Metode | URL |
   | :--- | :--- | :--- |
   | `daftar perangkat` | GET | `{{baseUrl}}/devices` |
   | `bacaan terbaru Node 1` | GET | `{{baseUrl}}/devices/a4cf12e5b7c0/latest` (pakai `device_id` Node 1-mu) |

6. Kirim **bacaan terbaru Node 1**. Jawabannya bacaan `telemetry` terbaru Node 1 yang sudah lolos pemeriksaan kontrak:

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "jenis": "node1",
     "status": "online",
     "telemetry": {
       "ts": "2026-10-19T06:09:27Z",
       "fw": "1.4.0",
       "suhu": 28.5,
       "kelembapan": 71,
       "cahaya": 2310,
       "tanah": 37,
       "gerak": false,
       "level_air": 64
     }
   }
   ```

   Inilah syarat lulus pertama modul ini: **`GET /devices/<id>/latest` di Bruno mengembalikan JSON bacaan terbaru**. Bruno menampilkannya dengan rapi; aslinya satu baris panjang.

> 💡 **Kirim lagi setelah 10 detik.** Isi `ts` di jawabannya kini berubah karena Node 1 sudah mengirim `telemetry` berikutnya. Backend hanya menyimpan bacaan **terakhir**; riwayatnya menunggu database di Modul 17.

#### 5.10 Simpan semuanya

Di terminal kedua (folder `backend`):

```text
git add .
git status
git commit -m "API GET /devices/:id/latest, /docs, dan koleksi Bruno (Modul 16 Praktik 5)"
git push
```

Di daftar `git status`, folder `bruno/` ikut, termasuk `bruno/environments/lokal.yml`. Itu yang diinginkan: temanmu yang meng-*clone* repositori ini cukup membuka folder `backend/bruno` di Bruno (**+** → **Open collection**) untuk mencoba API yang sama.

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 9](#9-perintah-lewat-api-kirim-tunggu-ack-dan-batas-waktu) (➡️ di akhir Konsep 10 akan mengantarmu ke Praktik 6).

### Praktik 6 — Perintah lewat API: `cmd` dan `ack` (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (dua terminal di folder `backend`), **Bruno**, dan Node 1 dengan relay lampu di meja kerja (MB102 menyala) atau simulator Praktik 7. Konsep yang dipakai: 9.
>
> ⭐ **Wajib** — syarat lulus: `POST /devices/<id>/command` menyalakan relay, dan `ack`-nya tercatat.

Backend kini menerima perintah lewat HTTP, meneruskannya ke Node 1 lewat MQTT, lalu menunggu `ack`-nya paling lama 5 detik (Konsep 9). Ingat aturan aman nomor 3: perintah dari API menggerakkan alat sungguhan.

#### 6.1 Gudang belajar menunggu

Ganti seluruh isi **`src/services/gudang.ts`**. Yang baru hanya bagian paling bawah, mulai dari komentar `// Perintah yang sedang menunggu ack`, dan satu kata `Ack` di baris impor:

```ts
// gudang.ts - menyimpan keadaan terakhir setiap perangkat di memori.
// Data hilang saat server dimatikan; Modul 17 menggantinya dengan database.
import type { Ack, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

export interface Perangkat {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  status: Status | "belum-diketahui";
  terakhir_dilihat: string; // waktu server (UTC) saat pesan terakhir perangkat ini tiba
  telemetry: TelemetryNode1 | TelemetryNode2 | null;
  vitals: Vitals | null;
}

const daftar = new Map<string, Perangkat>();
export const hitungan = { diterima: 0, ditolak: 0 };

function ambilAtauBuat(deviceId: string): Perangkat {
  let p = daftar.get(deviceId);
  if (p === undefined) {
    p = { device_id: deviceId, jenis: "belum-diketahui", status: "belum-diketahui", terakhir_dilihat: "", telemetry: null, vitals: null };
    daftar.set(deviceId, p);
  }
  p.terakhir_dilihat = new Date().toISOString();
  return p;
}

export function simpanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  const p = ambilAtauBuat(deviceId);
  p.jenis = "tekanan" in isi ? "node2" : "node1";
  p.telemetry = isi;
}

export function simpanStatus(deviceId: string, status: Status): void {
  ambilAtauBuat(deviceId).status = status;
}

export function simpanVitals(deviceId: string, isi: Vitals): void {
  ambilAtauBuat(deviceId).vitals = isi;
}

export function semuaPerangkat(): Perangkat[] {
  return [...daftar.values()];
}

export function cariPerangkat(deviceId: string): Perangkat | undefined {
  return daftar.get(deviceId);
}

// Perintah yang sedang menunggu ack, menurut id perintah.
const menunggu = new Map<string, (ack: Ack) => void>();

export function tungguAck(idPerintah: string, batasMs: number): Promise<Ack | null> {
  return new Promise((selesai) => {
    const pengatur = setTimeout(() => {
      menunggu.delete(idPerintah);
      selesai(null); // tidak ada jawaban sampai batas waktu
    }, batasMs);
    menunggu.set(idPerintah, (ack) => {
      clearTimeout(pengatur);
      menunggu.delete(idPerintah);
      selesai(ack);
    });
  });
}

// Dipanggil saat ack tiba; false kalau tidak ada perintah yang menunggunya.
export function serahkanAck(ack: Ack): boolean {
  const serahkan = menunggu.get(ack.id);
  if (serahkan === undefined) return false;
  serahkan(ack);
  return true;
}
```

Cara kerjanya:

- **`menunggu`** adalah `Map` kedua: labelnya `id` perintah, isinya fungsi yang akan "membangunkan" permintaan HTTP yang sedang menunggu `ack` itu.
- **`tungguAck(id, batasMs)`** mengembalikan sebuah Promise (pemanasan langkah 5) yang ditepati oleh siapa pun yang datang lebih dulu. Siapa pun yang menang juga menghapus label perintah itu dari `menunggu` supaya lemarinya tidak penuh sampah. Dua pesaingnya:
  - **pengatur waktu** `setTimeout`: kalau `ack` tidak datang dalam `batasMs` milidetik, Promise ditepati dengan `null`;
  - **`ack`-nya**: fungsi yang disimpan di `menunggu` menepati Promise dengan `ack` itu, lalu mematikan pengatur waktunya dengan `clearTimeout`.
- **`serahkanAck(ack)`** dipanggil telinga MQTT saat sebuah `ack` tiba. Ia mengembalikan `false` kalau tidak ada yang menunggu `id` itu, misalnya `ack` untuk perintah yang kamu kirim sendiri dari MQTTX.

#### 6.2 Telinga yang menyerahkan `ack` dan mulut yang mengirim `cmd`

Ganti seluruh isi **`src/services/mqtt.ts`**:

```ts
// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/#, memeriksa setiap pesan, dan mengirim perintah.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import type { PerintahSet } from "../schemas/kontrak.ts";
import { hitungan, serahkanAck, simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";

let klien: mqtt.MqttClient | undefined;

export function mulaiMqtt(url: string, log: FastifyBaseLogger): void {
  const idKlien = "backend-" + Math.random().toString(16).slice(2, 8); // nama unik, bukan device_id
  klien = mqtt.connect(url, { clientId: idKlien, reconnectPeriod: 5000 });
  klien.on("connect", () => {
    log.info(`tersambung ke broker ${url}`);
    klien?.subscribe("rpm/#", { qos: 1 });
  });
  klien.on("reconnect", () => log.warn("broker belum terjangkau, mencoba lagi dalam 5 detik"));
  klien.on("error", (galat) => log.error(`galat MQTT: ${galat.message}`));
  klien.on("message", (topik, isi) => terima(topik, isi.toString(), log));
}

export function brokerTersambung(): boolean {
  return klien?.connected ?? false;
}

function tolak(topik: string, alasan: string, log: FastifyBaseLogger): void {
  hitungan.ditolak++;
  log.warn(`DITOLAK ${topik}: ${alasan}`);
}

// ringkas daftar masalah dari Zod, misalnya "kelembapan: Terlalu besar: diharapkan number menjadi <=100"
function ringkas(galat: ZodError): string {
  return galat.issues.map((m) => `${m.path.join(".") || "isi"}: ${m.message}`).join("; ");
}

function terima(topik: string, teks: string, log: FastifyBaseLogger): void {
  const bagian = topik.split("/"); // ["rpm", device_id, jenis]
  if (bagian.length !== 3) return tolak(topik, "topik harus berbentuk rpm/<device_id>/<jenis>", log);
  const [, deviceId, jenis] = bagian;
  if (!DeviceId.safeParse(deviceId).success) return tolak(topik, "device_id tidak sah", log);
  if (jenis === "cmd") return; // perintah (dari backend ini atau MQTTX), bukan data perangkat

  if (jenis === "status") {
    if (teks === "") return; // pesan kosong = seseorang menghapus status retained (Modul 11), bukan status baru
    const hasil = Status.safeParse(teks);
    if (!hasil.success) return tolak(topik, `status "${teks}" tidak dikenal`, log);
    simpanStatus(deviceId, hasil.data);
    hitungan.diterima++;
    return;
  }

  let json: unknown;
  try {
    json = JSON.parse(teks);
  } catch {
    return tolak(topik, "isinya bukan JSON", log);
  }

  if (jenis === "telemetry") {
    const punyaTekanan = typeof json === "object" && json !== null && "tekanan" in json;
    const hasil = (punyaTekanan ? TelemetryNode2 : TelemetryNode1).safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    simpanTelemetry(deviceId, hasil.data);
  } else if (jenis === "vitals") {
    const hasil = Vitals.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    simpanVitals(deviceId, hasil.data);
  } else if (jenis === "ack") {
    const hasil = Ack.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    if (!serahkanAck(hasil.data)) log.info(`ack ${hasil.data.id} tiba, tetapi tidak ada perintah yang menunggunya`);
  } else {
    return tolak(topik, `jenis pesan "${jenis}" tidak ada di kontrak`, log);
  }
  hitungan.diterima++;
}

let urutan = 0;

// id perintah: c-<tanggal>-<jam UTC>-<nomor urut>, misalnya c-20261019-041008-1 (paling panjang 39 huruf, kontrak
// bagian 7). Jam ikut ditulis supaya id tetap unik setelah server dimulai ulang: perangkat mengabaikan id yang pernah ia
// kerjakan (kontrak aturan 8), jadi id kembar = perintah yang diam-diam tidak dikerjakan.
export function buatIdPerintah(): string {
  urutan = (urutan % 99) + 1;
  const waktu = new Date().toISOString(); // 2026-10-19T04:10:08.123Z
  const tanggal = waktu.slice(0, 10).replaceAll("-", "");
  const jam = waktu.slice(11, 19).replaceAll(":", "");
  return `c-${tanggal}-${jam}-${urutan}`;
}

export function kirimPerintah(deviceId: string, idPerintah: string, perintah: PerintahSet): void {
  const cmd = {
    id: idPerintah,
    ts: new Date().toISOString().slice(0, 19) + "Z",
    aksi: "set",
    target: perintah.target,
    nilai: perintah.nilai,
  };
  klien?.publish(`rpm/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: false }); // set TIDAK PERNAH retained
}
```

Tiga perubahan dibanding Praktik 4:

1. Di bagian yang menangani `ack`, `ack` yang lolos pemeriksaan kini diserahkan ke perintah yang menunggunya (`serahkanAck`).
2. **`buatIdPerintah()`** membuat `id` seperti `c-20261019-053414-1`: tanggal dan jam UTC saat dibuat, ditambah nomor urut 1–99. Jamnya membuat `id` tetap unik walaupun server dimulai ulang (Konsep 9).
3. **`kirimPerintah()`** menyusun JSON `cmd` persis seperti kontrak bagian 7 (`id`, `ts`, `aksi: "set"`, `target`, `nilai`), lalu menerbitkannya ke `rpm/<device_id>/cmd` dengan **QoS 1** dan **`retain: false`**.

Pemeriksaan pesan lainnya sama dengan Praktik 4, termasuk status berisi teks kosong yang diabaikan tanpa dicatat (4.4).

#### 6.3 Rute `POST /devices/:id/command`

Ganti seluruh isi **`src/routes/perangkat.ts`**:

```ts
// perangkat.ts - rute /devices: daftar perangkat, bacaan terbaru, dan perintah.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack, DeviceId, PerintahSet, Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { cariPerangkat, semuaPerangkat, tungguAck } from "../services/gudang.ts";
import { brokerTersambung, buatIdPerintah, kirimPerintah } from "../services/mqtt.ts";

const Galat = z.object({ pesan: z.string() });
const Jenis = z.enum(["node1", "node2", "belum-diketahui"]);
const ParamId = z.object({ id: DeviceId.describe("device_id perangkat, misalnya a4cf12e5b7c0") });

export const rutePerangkat: FastifyPluginAsyncZod = async (app) => {
  app.get("/devices", {
    schema: {
      tags: ["perangkat"],
      summary: "Daftar semua perangkat yang pernah terdengar",
      response: {
        200: z.array(z.object({
          device_id: z.string(),
          jenis: Jenis,
          status: z.union([Status, z.literal("belum-diketahui")]),
          terakhir_dilihat: z.string(),
        })).describe("semua perangkat yang tercatat di memori"),
      },
    },
  }, async () => {
    return semuaPerangkat().map((p) => ({
      device_id: p.device_id,
      jenis: p.jenis,
      status: p.status,
      terakhir_dilihat: p.terakhir_dilihat,
    }));
  });

  app.get("/devices/:id/latest", {
    schema: {
      tags: ["perangkat"],
      summary: "Bacaan telemetry terbaru satu perangkat",
      params: ParamId,
      response: {
        200: z.object({
          device_id: z.string(),
          jenis: Jenis,
          status: z.union([Status, z.literal("belum-diketahui")]),
          telemetry: z.union([TelemetryNode1, TelemetryNode2]),
        }).describe("bacaan terbaru perangkat itu"),
        404: Galat.describe("belum ada telemetry dari perangkat itu"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined || p.telemetry === null) {
      return reply.code(404).send({ pesan: `belum ada telemetry dari ${req.params.id}` });
    }
    return { device_id: p.device_id, jenis: p.jenis, status: p.status, telemetry: p.telemetry };
  });

  app.post("/devices/:id/command", {
    schema: {
      tags: ["perangkat"],
      summary: "Kirim satu perintah set ke perangkat, lalu tunggu ack-nya (paling lama 5 detik)",
      params: ParamId,
      body: PerintahSet,
      response: {
        200: z.object({ id: z.string(), lama_ms: z.number(), ack: Ack }).describe("perangkat menjawab dengan ack"),
        404: Galat.describe("perangkat belum pernah terdengar"),
        409: Galat.describe("perangkat offline, Node 2, atau jenisnya belum diketahui"),
        503: Galat.describe("backend tidak tersambung ke broker"),
        504: Galat.describe("tidak ada ack dalam 5 detik"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined) return reply.code(404).send({ pesan: `perangkat ${req.params.id} belum pernah terdengar` });
    if (p.jenis === "node2") return reply.code(409).send({ pesan: "Node 2 tidak menerima perintah (kontrak bagian 2)" });
    if (p.jenis !== "node1") return reply.code(409).send({ pesan: "jenis perangkat belum diketahui: tunggu telemetry pertamanya" });
    if (p.status !== "online") return reply.code(409).send({ pesan: `perangkat sedang ${p.status}, perintah tidak dikirim` });
    if (!brokerTersambung()) return reply.code(503).send({ pesan: "backend sedang tidak tersambung ke broker" });

    const idPerintah = buatIdPerintah();
    const mulai = Date.now();
    const menungguAck = tungguAck(idPerintah, 5000); // mulai menunggu sebelum mengirim
    kirimPerintah(p.device_id, idPerintah, req.body);
    const ack = await menungguAck;
    const lama = Date.now() - mulai;
    if (ack === null) {
      req.log.warn(`perintah ${idPerintah} ke ${p.device_id}: tidak ada ack dalam 5 detik`);
      return reply.code(504).send({ pesan: `tidak ada ack untuk ${idPerintah} dalam 5 detik` });
    }
    req.log.info(`perintah ${idPerintah} ke ${p.device_id}: ack ok=${ack.ok} dalam ${lama} ms`);
    return { id: idPerintah, lama_ms: lama, ack };
  });
};
```

Rute baru di bagian bawah bekerja dalam urutan yang sama dengan Konsep 9:

1. **`body: PerintahSet`**: isi permintaan diperiksa skema kontrak sebelum apa pun dijalankan. `{"target":"pompa","nilai":30}` sudah ditolak `400` di sini.
2. Lima pemeriksaan keadaan, masing-masing dengan kode statusnya: perangkat belum pernah terdengar (`404`); Node 2 (`409`); jenisnya belum diketahui (`409`, misalnya tepat setelah server dimulai ulang, sebelum `telemetry` pertamanya tiba); perangkat tidak `online` (`409`); backend tidak tersambung ke broker (`503`).
3. **`tungguAck()` dipanggil sebelum `kirimPerintah()`.** Ini kebiasaan aman: penunggunya sudah siap sebelum perintah keluar, jadi `ack` secepat apa pun (Node 1 bisa menjawab dalam dua milidetik) pasti ada yang menerima, termasuk kalau kelak ada `await` di antara pengiriman dan penungguan. `ack` yang tiba saat tidak ada yang menunggu hanya dicatat, lalu terbuang.
4. **`await menungguAck`**: permintaan HTTP "tertidur" sampai `ack` datang atau 5 detik lewat. Selama itu, server tetap melayani permintaan lain: inilah gunanya `await` (Modul 4 Konsep 12).
5. Hasilnya dicatat di log (`ack ok=true dalam 12 ms`) dan dikirim ke tamu bersama `id` perintah dan lama tunggunya.

Simpan semua file, lalu jalankan `npm run cek` di terminal kedua. Harus lolos.

#### 6.4 Nyalakan lampu dari Bruno

1. Di Bruno, buat permintaan baru (klik kanan koleksi → **New Request**): **Request Name** `nyalakan lampu`, metode **POST** (klik pemilih metode di kiri URL), URL `{{baseUrl}}/devices/a4cf12e5b7c0/command` (pakai `device_id` Node 1-mu). Klik **Create**.
2. Buka tab **Body**. Di ujung kanan bilah tab, klik pemilih bertuliskan **No Body ▾**, lalu pilih **JSON**. Ketik isi ini di editornya:

   ```json
   {
     "target": "lampu",
     "nilai": true
   }
   ```

   Bruno menambahkan sendiri kepala surat (*header*) `Content-Type: application/json` untuk isi JSON, jadi tab **Headers** tidak perlu diisi.
3. Di tab **Assert**, tambahkan tes `res.status` `eq` `200` seperti di 5.9.
4. Simpan (**Ctrl + S**), lalu klik **Send**. Relay lampu di meja kerja berbunyi "klik", dan lampu menyala. Di jalur simulator tidak ada bunyi klik; terminal ketiga (simulator) menulis `f00d00000001: perintah c-… -> ok=true`. **Hasilnya** di panel jawaban Bruno (`id`, jam, dan lama tunggu di layarmu berbeda):

   ```json
   {
     "id": "c-20261019-053414-1",
     "lama_ms": 12,
     "ack": {
       "id": "c-20261019-053414-1",
       "ts": "2026-10-19T05:34:14Z",
       "ok": true,
       "state": {
         "kipas": false,
         "lampu": true,
         "pompa": false,
         "tirai": 90
       }
     }
   }
   ```

   dan di terminal pertama:

   ```text
   [12:34:14] INFO: perintah c-20261019-053414-1 ke a4cf12e5b7c0: ack ok=true dalam 12 ms
   [12:34:14] INFO: POST /devices/a4cf12e5b7c0/command -> 200 (34 ms)
   ```

   Itulah syarat lulus kedua modul ini: **relay menyala dan `ack`-nya tercatat**. `state` di `ack` adalah keadaan **semua** aktuator Node 1 setelah perintah dikerjakan (kontrak bagian 8): yang dicatat backend adalah kenyataan di perangkat, bukan sekadar "perintah sudah dikirim".
5. Buat permintaan kedua, **`matikan lampu`**, dengan isi dan tes yang sama, tetapi `"nilai": false`. Simpan, lalu kirim: relay padam.

#### 6.5 Uji kode status lainnya

Pakai permintaan `nyalakan lampu` dan ubah isi atau URL-nya untuk sementara, tanpa menyimpan (jangan tekan **Ctrl + S**). Setelah selesai, tutup tab-nya. Bruno bertanya lewat dialog `Unsaved changes`: klik **Don't Save** (bukan **Save**) supaya `nyalakan lampu.yml` tetap seperti semula. Untuk percobaan yang jawabannya bukan `200`, tab **Tests** menandai tesnya gagal. Memang begitu seharusnya: tes itu hanya menerima `200`.

| Coba | Hasil yang diharapkan |
| :--- | :--- |
| Isi `{"target":"pompa","nilai":30}` | `400`, `"message":"body/nilai Terlalu besar: diharapkan number menjadi <=10"` |
| Isi `{"target":"pintu","nilai":true}` | `400`, `"message":"body/target Input tidak valid"` |
| URL berisi `device_id` Node 2 | `409`, `{"pesan":"Node 2 tidak menerima perintah (kontrak bagian 2)"}`. Sebelum Node 2 mengirim `telemetry` pertamanya sejak server dimulai ulang (paling lama 5 menit), pesannya `jenis perangkat belum diketahui: tunggu telemetry pertamanya`, dengan kode yang sama. |
| URL berisi `abcdefabcdef` | `404`, `{"pesan":"perangkat abcdefabcdef belum pernah terdengar"}` |
| Isi `{"target":"pompa","nilai":3}` (selang pompa di tandon berisi air!) | `200`, pompa menyala tiga detik; `ack.state.pompa` bernilai `true`. Kalau air tandon di bawah 20 % atau tidak terbaca, Node 1 menolak: jawabannya tetap `200`, tetapi `ack.ok` bernilai `false` dengan `pesan` alasannya. `200` berarti perangkat menjawab, bukan berarti perintahnya dikerjakan. |

**Uji 504 dan 409 `offline`** (butuh Node 1 sungguhan):

1. Matikan MB102, lalu cabut USB Node 1 (aturan emas). Node 1 padam tanpa sempat pamit ke broker.
2. **Segera, dalam 10 detik**, kirim `nyalakan lampu` dari Bruno. Bruno menunggu sekitar lima detik, lalu menampilkan **`504`** dengan `{"pesan":"tidak ada ack untuk c-… dalam 5 detik"}`. Broker belum tahu Node 1 padam, jadi status yang tercatat backend masih `online`. Jangan menunda: broker menerbitkan wasiat 22,5 detik setelah kabar **terakhir** Node 1, dan kabar terakhir itu bisa saja terkirim 10 detik sebelum USB dicabut.
3. Tunggu sekitar 30 detik, lalu kirim lagi. Kini jawabannya langsung **`409`**: `{"pesan":"perangkat sedang offline, perintah tidak dikirim"}`. Broker sudah menerbitkan wasiat `offline` Node 1 setelah 22,5 detik tanpa kabar (kontrak bagian 3), dan backend mendengarnya.
4. Colokkan lagi USB Node 1, lalu nyalakan MB102. Begitu status Node 1 kembali `online`, perintah diterima lagi.

Dua kode yang berbeda itu menceritakan dua keadaan yang berbeda pula: `504` berarti "sudah dicoba, tidak ada jawaban", `409` berarti "tidak dicoba karena perangkatnya diketahui mati". Aplikasi yang memakai API-mu bisa menampilkan pesan yang tepat untuk masing-masing.

> **Simpan:** di terminal kedua (folder `backend`), `git add .`, `git commit -m "POST /devices/:id/command: cmd, tunggu ack, kode status (Modul 16 Praktik 6)"`, dan `git push`.
>
> ➡️ **Lanjut** ke [Praktik 7 — Simulator sepuluh perangkat](#praktik-7--simulator-sepuluh-perangkat-25-menit) tanpa kembali ke konsep.

### Praktik 7 — Simulator sepuluh perangkat (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal ketiga di folder `alat`), **Bruno**, dan broker di Pi (atau broker laptopmu). Node 1 dan Node 2 boleh menyala, boleh juga tidak. Konsep yang dipakai: 6 dan 9.

Bayangkan Rumah Pintar Mini dijual ke seratus rumah: backend harus melayani ratusan perangkat, padahal di mejamu hanya ada dua. **Simulator** adalah program yang berpura-pura menjadi banyak perangkat sekaligus, berbicara MQTT persis menurut kontrak data. Dengan simulator, backend bisa dikembangkan dan diuji kapan saja: tanpa papan, tanpa Wokwi, bahkan di kereta tanpa meja kerja.

Simulator ini memakai fungsi `buatTelemetri()` dari `alat/generate-dummy.js` (Modul 4 Praktik 4) dan library `mqtt` yang sudah terpasang di folder `alat` sejak Modul 11. Ia ditulis dalam JavaScript biasa, seperti alat-alat lain di folder itu.

#### 7.1 Tulis `alat/simulator-perangkat.js`

Di Explorer VS Code, klik folder **`alat`** (di repositori `rumah-pintar-mini`, sejajar dengan `backend`), lalu buat file baru **`simulator-perangkat.js`**:

```js
// simulator-perangkat.js — sepuluh "Node 1" palsu yang berbicara MQTT persis menurut kontrak data (Lampiran A).
// Modul 16 - Praktik 7. Gunanya: mengembangkan dan menguji backend tanpa hardware dan tanpa Wokwi.
//
// Cara pakai (dari terminal, di folder alat):
//   node simulator-perangkat.js mqtt://192.168.1.37:1883            -> 10 perangkat palsu
//   node simulator-perangkat.js mqtt://192.168.1.37:1883 3          -> 3 perangkat palsu
//   node simulator-perangkat.js mqtt://192.168.1.37:1883 bersihkan  -> hapus status retained perangkat palsu
// Hentikan dengan Ctrl+C: broker lalu menerbitkan wasiat "offline" setiap perangkat palsu.

import mqtt from "mqtt";
import { buatTelemetri } from "./generate-dummy.js";

const ALAMAT_BROKER = process.argv[2] || "mqtt://127.0.0.1:1883";
const JUMLAH = Number(process.argv[3]) || 10;

// device_id palsu: 12 digit heksadesimal huruf kecil, diawali f00d supaya mudah dikenali
function buatDeviceId(nomor) {
  return "f00d" + String(nomor).padStart(8, "0");
}

// waktu UTC tanpa milidetik, seperti ts di kontrak data: 2026-10-19T04:14:28Z
function waktuSekarang() {
  return new Date().toISOString().slice(0, 19) + "Z";
}

function jalankanPerangkat(deviceId) {
  const topik = (jenis) => `rpm/${deviceId}/${jenis}`;
  const mulai = Date.now();
  const keadaan = { kipas: false, lampu: false, pompa: false, tirai: 90 };
  const idTerakhir = []; // id perintah yang sudah dikerjakan (kontrak aturan 8)

  const klien = mqtt.connect(ALAMAT_BROKER, {
    clientId: deviceId,
    clean: true,
    keepalive: 15,
    reconnectPeriod: 5000, // menyambung ulang paling sering setiap 5 detik (kontrak bagian 3)
    will: { topic: topik("status"), payload: "offline", qos: 1, retain: true },
  });

  // vitals: sekali setelah tersambung, lalu setiap 5 menit (kontrak bagian 2)
  function kirimVitals() {
    const vitals = {
      ts: waktuSekarang(),
      rssi: -40 - Math.floor(Math.random() * 40), // -40 sampai -79 dBm
      uptime_s: Math.floor((Date.now() - mulai) / 1000),
      heap_free: 180000 + Math.floor(Math.random() * 20000),
    };
    klien.publish(topik("vitals"), JSON.stringify(vitals));
  }

  klien.on("connect", () => {
    klien.publish(topik("status"), "online", { qos: 1, retain: true });
    klien.subscribe(topik("cmd"), { qos: 1 });
    kirimVitals();
    console.log(`${deviceId}: online`);
  });
  setInterval(() => {
    if (klien.connected) kirimVitals();
  }, 5 * 60 * 1000);

  klien.on("message", (_topik, isi) => {
    let cmd;
    try {
      cmd = JSON.parse(isi.toString());
    } catch {
      return; // bukan JSON: tidak bisa dijawab (kontrak aturan 4)
    }
    if (typeof cmd.id !== "string" || cmd.id.length > 39) return;
    if (idTerakhir.includes(cmd.id)) return; // id yang sama hanya dikerjakan sekali
    idTerakhir.push(cmd.id);
    if (idTerakhir.length > 8) idTerakhir.shift();

    let pesan = "";
    if (cmd.aksi !== "set") pesan = `aksi ${cmd.aksi} belum didukung`;
    else if (cmd.target === "lampu" || cmd.target === "kipas") {
      if (typeof cmd.nilai === "boolean") keadaan[cmd.target] = cmd.nilai;
      else pesan = `nilai ${cmd.target} harus true atau false`;
    } else if (cmd.target === "pompa") {
      if (Number.isInteger(cmd.nilai) && cmd.nilai >= 1 && cmd.nilai <= 10) {
        keadaan.pompa = true;
        setTimeout(() => (keadaan.pompa = false), cmd.nilai * 1000);
      } else pesan = "nilai pompa harus 1-10 detik";
    } else if (cmd.target === "tirai") {
      if (Number.isInteger(cmd.nilai) && cmd.nilai >= 0 && cmd.nilai <= 180) keadaan.tirai = cmd.nilai;
      else pesan = "nilai tirai harus 0-180 derajat";
    } else pesan = `target ${cmd.target} tidak dikenal`;

    const ack = { id: cmd.id, ts: waktuSekarang(), ok: pesan === "", state: { ...keadaan } };
    if (pesan !== "") ack.pesan = pesan;
    klien.publish(topik("ack"), JSON.stringify(ack));
    console.log(`${deviceId}: perintah ${cmd.id} -> ok=${ack.ok}`);
  });

  // telemetry setiap 10 detik (kontrak aturan 3), mulai pada detik acak supaya tidak serentak
  const kirimTelemetry = () => {
    if (klien.connected) klien.publish(topik("telemetry"), JSON.stringify(buatTelemetri()));
  };
  setTimeout(() => {
    kirimTelemetry(); // kiriman pertama langsung pada detik acak itu
    setInterval(kirimTelemetry, 10000);
  }, Math.random() * 10000);
}

// bersihkan: terbitkan pesan kosong ber-retain ke topik status setiap perangkat palsu, supaya broker
// melupakan status "offline" mereka (cara menghapus pesan retained, Modul 11), lalu selesai.
// Dulu menjalankan lebih dari 10 perangkat? Tambahkan jumlahnya: ... bersihkan 20
async function bersihkan(jumlah) {
  try {
    const klien = await mqtt.connectAsync(ALAMAT_BROKER);
    for (let i = 1; i <= jumlah; i++) {
      await klien.publishAsync(`rpm/${buatDeviceId(i)}/status`, "", { qos: 1, retain: true });
    }
    await klien.endAsync();
    console.log(`Status ${jumlah} perangkat palsu sudah dihapus dari broker.`);
  } catch (galat) {
    console.log(`Gagal menyambung ke ${ALAMAT_BROKER}: ${galat.message}`);
  }
}

if (process.argv[3] === "bersihkan") {
  await bersihkan(Number(process.argv[4]) || 10);
} else {
  for (let i = 1; i <= JUMLAH; i++) {
    jalankanPerangkat(buatDeviceId(i));
  }
  console.log(`${JUMLAH} perangkat palsu menuju ${ALAMAT_BROKER}. Hentikan dengan Ctrl+C.`);
}
```

Bagian-bagiannya:

- **`buatDeviceId(nomor)`** membuat `device_id` palsu yang tetap sah menurut kontrak: 12 digit heksadesimal huruf kecil, diawali `f00d` supaya mudah dibedakan dari perangkat sungguhan. Perangkat pertama `f00d00000001`, perangkat kesepuluh `f00d00000010`.
- **`jalankanPerangkat(deviceId)`** menghidupkan satu perangkat palsu dengan sambungan MQTT-nya sendiri. Setelannya meniru kontrak bagian 3: *client ID* = `device_id`, *clean session*, *keep-alive* 15 detik, menyambung ulang paling sering setiap 5 detik, wasiat `offline` *retained*. Begitu tersambung, ia menerbitkan `online` (*retained*), berlangganan `cmd`, dan mengirim `vitals` pertamanya.
- **Penjawab perintah** meniru Node 1: mengabaikan pesan yang bukan JSON atau ber-`id` terlalu panjang, mengingat delapan `id` terakhir (aturan 8), memeriksa `target` dan `nilai`, lalu selalu menjawab `ack` lengkap dengan `state` semua aktuatornya, atau dengan `pesan` kalau perintahnya ditolak.
- **`telemetry`** dikirim setiap 10 detik, tetapi setiap perangkat mulai pada detik acak (`Math.random() * 10000`) supaya sepuluh perangkat tidak mengirim serentak. Perangkat sungguhan pun tidak pernah serentak.
- `vitals` dikirim sekali saat tersambung, lalu setiap 5 menit (kontrak bagian 2).
- **`bersihkan(jumlah)`** di bagian bawah dipakai di 7.4: ia menerbitkan pesan kosong yang *retained* ke topik `status` setiap perangkat palsu supaya broker melupakan status mereka, lalu programnya selesai. Bagian `if … else` paling bawah memilih tugasnya: kalau ada kata `bersihkan` di belakang alamat broker, simulator membersihkan status; kalau tidak, simulator menjalankan perangkat palsu seperti biasa.

#### 7.2 Jalankan sepuluh perangkat

Buka terminal ketiga (**+** di panel terminal). Terminal baru selalu mulai di folder `rumah-pintar-mini`, jadi masuk dulu ke folder `alat`, lalu jalankan simulator dengan alamat broker milikmu:

```text
cd alat
node simulator-perangkat.js mqtt://192.168.1.37:1883
```

**Hasilnya:**

```text
10 perangkat palsu menuju mqtt://192.168.1.37:1883. Hentikan dengan Ctrl+C.
f00d00000001: online
f00d00000002: online
f00d00000003: online
f00d00000004: online
f00d00000005: online
f00d00000006: online
f00d00000007: online
f00d00000008: online
f00d00000009: online
f00d00000010: online
```

Biarkan simulatornya berjalan.

#### 7.3 Backend melayani dua belas perangkat

1. Di Bruno, kirim **daftar perangkat**. Jawabannya kini memuat dua belas perangkat: Node 1, Node 2, dan sepuluh perangkat `f00d…` (di jalur simulator, hanya sepuluh perangkat palsu itu, yang sudah kamu jalankan sejak Praktik 3). Dalam 10 detik pertama, sebagian perangkat palsu masih `"jenis":"belum-diketahui"`; begitu `telemetry` pertamanya tiba, semuanya menjadi `node1` (simulator meniru Node 1).
2. Buka `http://127.0.0.1:8080/health`. Angka `diterima` kini naik sekitar sebelas kali lebih cepat (di jalur simulator, sudah secepat ini sejak Praktik 3), dan `ditolak` tetap `0`: semua pesan simulator lolos pemeriksaan kontrak.
3. Buka permintaan **nyalakan lampu**, ganti `device_id` di URL-nya dengan `f00d00000003` untuk sementara (jangan disimpan), lalu kirim. Jawabannya `200` dengan `ack`, dan terminal ketiga (simulator) menulis:

   ```text
   f00d00000003: perintah c-20261019-051431-1 -> ok=true
   ```

   Backend tidak peduli apakah yang menjawab ESP32 sungguhan atau simulator: selama keduanya mematuhi kontrak, keduanya diperlakukan sama. Itulah kekuatan kontrak data. Setelah itu, tutup tab **nyalakan lampu** dan klik **Don't Save**, seperti di 6.5, supaya URL-nya tetap menunjuk Node 1 dan `nyalakan lampu.yml` tidak berubah. Kalau perubahannya telanjur tersimpan, file itu ikut muncul di `git status` Praktik 8; kembalikan dari terminal kedua (folder `backend`) dengan `git restore "bruno/nyalakan lampu.yml"`.

#### 7.4 Hentikan dan lihat wasiatnya bekerja

Tekan **Ctrl + C** di terminal simulator, lalu kirim lagi **daftar perangkat** dari Bruno. Kesepuluh perangkat palsu kini `"status":"offline"`: broker menerbitkan wasiat setiap perangkat begitu sambungannya putus.

Status `offline` itu *retained*, jadi broker terus menyimpannya, dan perangkat palsu akan tampil lagi setiap kali backend dimulai ulang. Itu tidak berbahaya, tetapi daftarnya jadi ramai. Bersihkan dari terminal simulator:

```text
node simulator-perangkat.js mqtt://192.168.1.37:1883 bersihkan
```

**Hasilnya:**

```text
Status 10 perangkat palsu sudah dihapus dari broker.
```

Backend yang sedang berjalan masih mengingat mereka di gudangnya. Setelah server dimulai ulang (misalnya **Ctrl + C** di terminal pertama, lalu `npm run dev` lagi), perangkat palsu tidak muncul lagi di **daftar perangkat**.

> **Simpan:** di terminal ketiga (folder `alat`), naik dulu ke akar repositori dengan `cd ..`, lalu `git add alat/simulator-perangkat.js`, `git commit -m "Simulator 10 perangkat palsu sesuai kontrak data (Modul 16 Praktik 7)"`, dan `git push`.
>
> ➡️ **Lanjut** ke [Praktik 8 — Git untuk tim](#praktik-8--git-untuk-tim-branch-pull-request-dan-review-45-menit) tanpa kembali ke konsep. Konsep 10 sudah kamu baca sebelum Praktik 6.

### Praktik 8 — Git untuk tim: *branch*, *pull request*, dan *review* (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (server tetap berjalan di terminal pertama; perintah `git` di terminal kedua), **Bruno**, **browser** yang sudah masuk ke akun GitHub-mu, dan Node 1 atau simulator Praktik 7. Konsep yang dipakai: 10.
>
> ⭐ **Wajib** — syarat lulus: riwayat Git-mu menunjukkan satu *pull request* yang di-*merge*.

Sampai Praktik 7, setiap *commit* langsung masuk ke `main`. Di tim, `main` adalah "versi yang selalu jalan": setiap fitur dikerjakan di cabangnya sendiri, diperiksa lewat *pull request*, baru digabungkan (Konsep 10). Di praktik ini kamu memainkan dua peran sekaligus: **penulis** fitur, lalu **peninjau** yang memeriksanya dengan checklist.

Fiturnya kecil tetapi nyata: **`GET /devices/:id/vitals`**, kesehatan terakhir sebuah perangkat (kuat sinyal, lama menyala, dan sisa memori). Gudang backend sudah menyimpan `vitals` sejak Praktik 3, dan sejak Praktik 4 isinya diperiksa kontrak, tetapi belum ada pintu API untuk membacanya.

#### 8.1 Templat *pull request* (langsung di `main`)

Templat *pull request* adalah file yang isinya otomatis muncul di kotak deskripsi setiap *pull request* baru. Kita isi dengan checklist peninjau. GitHub hanya memakai templat yang sudah ada di cabang `main`, jadi templat ini di-*commit* ke `main` dulu, sebelum cabang fitur dibuat.

1. Di Explorer VS Code, klik kanan ruang kosong di bawah daftar file (di akar folder `rumah-pintar-mini`, bukan di dalam `backend`), lalu pilih **New File…**. Ketik `.github/pull_request_template.md` lalu tekan **Enter**. Karena ada garis miring, VS Code membuat folder `.github` sekalian.
2. Isi file itu dengan:

   ```markdown
   ## Apa yang berubah?

   <!-- Satu atau dua kalimat: fitur apa yang ditambahkan atau diperbaiki, dan mengapa. -->

   ## Checklist sebelum *merge*

   - [ ] `npm run cek` lolos, tanpa galat tipe
   - [ ] Server menyala dengan `npm run dev`, tanpa galat di terminal
   - [ ] Rute baru sudah dicoba di Bruno, tesnya lulus, dan permintaannya ikut tersimpan di `backend/bruno/`
   - [ ] Rute baru muncul di `/docs`, lengkap dengan keterangannya
   - [ ] Tidak ada `.env` atau kata sandi di tab **Files changed**
   - [ ] `KONTRAK-DATA.md` ikut diperbarui kalau bentuk pesan MQTT berubah
   ```

   Baris `<!-- … -->` adalah komentar: terlihat saat kamu menulis deskripsi, tetapi tidak tampil di halaman *pull request*. Baris berawalan `- [ ]` menjadi kotak centang yang bisa diklik di GitHub.
3. Simpan (**Ctrl + S**). Di terminal kedua, naik dulu ke akar repositori, lalu *commit*:

   ```text
   cd ..
   git status
   git add .github
   git commit -m "Templat pull request dengan checklist (Modul 16 Praktik 8)"
   git push
   cd backend
   ```

   `git status` hanya menyebut folder baru itu:

   ```text
   On branch main
   Your branch is up to date with 'origin/main'.

   Untracked files:
     (use "git add <file>..." to include in what will be committed)
           .github/

   nothing added to commit but untracked files present (use "git add" to track)
   ```

   Setelah `cd backend` terakhir, terminal kedua kembali di folder `backend`. Kalau `git status` tadi juga menyebut `backend/bruno/nyalakan lampu.yml` di bagian `Changes not staged for commit`, perubahan sementara di 7.3 telanjur tersimpan. Kembalikan sekarang dengan `git restore "bruno/nyalakan lampu.yml"` supaya file itu tidak ikut ke *pull request*.

#### 8.2 Cabang baru: `fitur/vitals`

```text
git switch -c fitur/vitals
```

**Hasilnya:**

```text
Switched to a new branch 'fitur/vitals'
```

`git switch` artinya "pindah cabang", dan `-c` artinya "buat dulu cabangnya" (*create*). Nama `fitur/…` hanyalah kebiasaan: dari namanya, semua orang di tim tahu cabang ini berisi fitur apa. Lihat pojok kiri bawah VS Code: nama cabang di bilah status kini `fitur/vitals`, bukan `main`. Semua *commit* berikutnya masuk ke cabang ini, dan `main` tidak tersentuh sampai *merge* di 8.8.

#### 8.3 Tulis fiturnya

Buka **`src/routes/perangkat.ts`**. Ada dua perubahan:

1. Di baris impor dari `../schemas/kontrak.ts`, tambahkan `Vitals` di ujung daftarnya:

   ```ts
   import { Ack, DeviceId, PerintahSet, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
   ```

2. Cari akhir rute `/devices/:id/latest`, yaitu baris `});` tepat sebelum `app.post("/devices/:id/command", {`. Sisipkan satu baris kosong dan rute baru ini di antara keduanya:

   ```ts
     app.get("/devices/:id/vitals", {
       schema: {
         tags: ["perangkat"],
         summary: "Kesehatan terakhir satu perangkat (vitals)",
         params: ParamId,
         response: {
           200: z.object({ device_id: z.string(), vitals: Vitals }).describe("vitals terbaru perangkat itu"),
           404: Galat.describe("belum ada vitals dari perangkat itu"),
         },
       },
     }, async (req, reply) => {
       const p = cariPerangkat(req.params.id);
       if (p === undefined || p.vitals === null) {
         return reply.code(404).send({ pesan: `belum ada vitals dari ${req.params.id}` });
       }
       return { device_id: p.device_id, vitals: p.vitals };
     });
   ```

Polanya sama persis dengan rute `/latest` di atasnya: skema yang sama-sama dipakai untuk memeriksa dan untuk `/docs`, jawaban `404` dengan `pesan` yang jelas, dan jawaban `200` berisi data dari gudang. Simpan. Isi lengkap file ini setelah praktik ada di [`kode/backend/src/routes/perangkat.ts`](kode/backend/src/routes/perangkat.ts).

#### 8.4 Uji sendiri sebelum minta *review*

Jangan bebani peninjau dengan kesalahan yang bisa kamu temukan sendiri. Kerjakan tiga pemeriksaan ini, sesuai checklist di templat:

1. **Pemeriksa tipe.** Di terminal kedua, jalankan `npm run cek`. Harus lolos, tanpa pesan galat.
2. **Bruno.** Klik permintaan **bacaan terbaru Node 1** di bilah samping supaya tab-nya terbuka, lalu klik kanan **tab** itu (di deretan tab atas) dan pilih **Clone Request**. Di dialog **Clone Request**, ganti **Request Name** menjadi `vitals Node 1`, lalu klik **Clone**. (Menu **Clone** di bilah samping langsung membuat salinan bernama `bacaan terbaru Node 1 copy` tanpa dialog; kalau telanjur, klik kanan salinan itu → **Rename**.) Di tab baru itu, ganti kata `latest` di ujung URL menjadi `vitals`, simpan (**Ctrl + S**), lalu klik **Send**. Tes `res.status` `eq` `200` ikut tersalin dari permintaan aslinya.

   Kemungkinan besar jawaban pertamanya **`404`**, `{"pesan":"belum ada vitals dari a4cf12e5b7c0"}`, dan tab **Tests** menandai tesnya gagal. Ini bukan kesalahan kodemu. Saat kamu menyimpan `perangkat.ts`, `--watch` memulai ulang server sehingga gudangnya kosong lagi. Node 1 sendiri hanya mengirim `vitals` sesaat setelah tersambung dan setiap 5 menit sesudahnya. Tekan tombol **EN** di papan Node 1, tunggu sekitar 15 detik sampai statusnya `online` lagi, lalu kirim ulang. **Hasilnya:** `200`, dengan isi seperti ini (angka di layarmu berbeda):

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "vitals": {
       "ts": "2026-10-19T06:21:47Z",
       "rssi": -61,
       "uptime_s": 14,
       "heap_free": 183200
     }
   }
   ```

   **Jalur simulator:** perangkat palsu mengirim `vitals` begitu tersambung, jadi jalankan lagi simulatornya di terminal ketiga (kalau ternyata masih berjalan, hentikan dulu dengan **Ctrl + C**). Terminal itu biasanya masih berada di akar repositori sejak *commit* Praktik 7, jadi periksa dengan `pwd`: kalau jalurnya tidak berakhiran `alat`, masuk dulu dengan `cd alat`. Lalu jalankan `node simulator-perangkat.js mqtt://192.168.1.37:1883`. Ganti `device_id` di URL dengan `f00d00000001`, lalu kirim. Selesai Praktik 8, hentikan simulatornya dan jalankan `bersihkan` seperti 7.4.
3. **`/docs`.** Muat ulang `http://127.0.0.1:8080/docs`. Rute `GET /devices/{id}/vitals` muncul di grup `perangkat`, lengkap dengan keterangan `200` dan `404`-nya, tanpa satu baris dokumentasi pun yang kamu tulis terpisah.

#### 8.5 *Commit* dan *push* cabangnya

Di terminal kedua (folder `backend`):

```text
git status
git add .
git commit -m "GET /devices/:id/vitals: kesehatan terakhir perangkat (Modul 16 Praktik 8)"
git push -u origin fitur/vitals
```

`git status` kini menyebut cabangnya, satu file yang berubah, dan satu file baru:

```text
On branch fitur/vitals
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/routes/perangkat.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        bruno/vitals Node 1.yml

no changes added to commit (use "git add" and/or "git commit -a")
```

*Push* pertama sebuah cabang baru butuh dua keterangan: ke mana (`origin`, yaitu repositori di GitHub) dan cabang apa (`fitur/vitals`). `-u` menyuruh Git mengingat pasangan itu, jadi *push* berikutnya di cabang ini cukup `git push`. **Hasilnya** diakhiri baris seperti ini:

```text
remote: Create a pull request for 'fitur/vitals' on GitHub by visiting:
remote:      https://github.com/nama-akunmu/rumah-pintar-mini/pull/new/fitur/vitals
remote:
To https://github.com/nama-akunmu/rumah-pintar-mini.git
 * [new branch]      fitur/vitals -> fitur/vitals
branch 'fitur/vitals' set up to track 'origin/fitur/vitals'.
```

Baris `remote:` dikirim GitHub: ia sudah menawarkan tautan untuk membuat *pull request*. Kalau kamu lupa `-u` dan hanya mengetik `git push`, Git menolak dengan `fatal: The current branch fitur/vitals has no upstream branch.` dan menuliskan perintah yang benar di bawahnya: jalankan perintah itu.

#### 8.6 Buka *pull request* di GitHub

1. Buka repositori `rumah-pintar-mini` di GitHub. Di atas daftar file muncul pita kuning yang menyebut cabang `fitur/vitals` baru saja di-*push*, dengan tombol **Compare & pull request**. Klik tombol itu. (Tautan dari keluaran `git push` di atas membuka halaman yang sama.)
2. Halaman **Open a pull request** terbuka. Periksa baris pemilih cabangnya: **base: `main`** ← **compare: `fitur/vitals`**. Artinya, "gabungkan isi `fitur/vitals` ke dalam `main`".
3. Judulnya sudah terisi dari pesan *commit*-mu. Kotak deskripsi berisi templat dari 8.1. Di bawah **Apa yang berubah?**, tulis satu atau dua kalimat, misalnya: `Rute baru GET /devices/:id/vitals untuk membaca vitals terakhir sebuah perangkat. Ikut ditambahkan: permintaan Bruno "vitals Node 1".` Biarkan kotak checklist kosong dulu: checklist diisi saat *review*.
4. Klik tombol hijau **Create pull request**.

Halaman *pull request*-mu terbuka dengan nomor, biasanya **#1**, dan empat tab: **Conversation** (deskripsi dan percakapan), **Commits**, **Checks**, dan **Files changed** (semua perubahan baris demi baris).

#### 8.7 *Review* dengan checklist

Sekarang berganti peran: kamu adalah peninjau yang membaca perubahan orang lain dengan teliti.

1. Buka tab **Files changed**. Ada dua file: `backend/bruno/vitals Node 1.yml` (baru) dan `backend/src/routes/perangkat.ts`. Baris berlatar hijau ditambahkan, baris berlatar merah dihapus: satu baris impor lama berganti dengan versi yang memuat `Vitals`. Pastikan tidak ada file `.env` di daftar ini.
2. Tinggalkan satu komentar di sebuah baris, seperti peninjau sungguhan. Arahkan tetikus ke baris `404: Galat.describe("belum ada vitals dari perangkat itu"),`, klik ikon **+** biru yang muncul di sebelah kiri baris itu, lalu tulis misalnya: `404 juga muncul tepat setelah server dimulai ulang, sampai perangkat mengirim vitals lagi.` Klik **Comment**.
3. Buka tab **Conversation**. Periksa setiap butir checklist di deskripsi dengan keadaan sebenarnya (8.4 dan langkah 1 di atas), lalu klik kotak setiap butir yang memang sudah terbukti. Butir terakhir, `KONTRAK-DATA.md`, juga boleh dicentang: fitur ini tidak mengubah bentuk pesan MQTT, jadi tidak ada yang perlu diperbarui.
4. Kembali ke tab **Files changed**, lalu klik tombol **Review changes** di kanan atas. Tulis ringkasan, misalnya `Checklist lengkap, rute sudah dicoba di Bruno. Siap di-merge.`, pilih **Comment**, lalu klik **Submit review**.

Pilihan **Approve** tidak aktif: GitHub tidak mengizinkan penulis menyetujui *pull request*-nya sendiri. Di tim sungguhan, teman yang meninjau memilih **Approve** (setuju) atau **Request changes** (minta perbaikan). Kalau kamu belajar bersama teman, undang dia lewat **Settings** → **Collaborators** di repositorimu, lalu minta dia meninjau *pull request* berikutnya.

#### 8.8 *Merge*

1. Di tab **Conversation**, gulir ke bawah sampai kotak *merge*. Tombol hijaunya harus bertuliskan **Merge pull request**. Kalau tertulis **Squash and merge** atau **Rebase and merge**, klik panah kecil di sebelahnya, lalu pilih **Create a merge commit**. Cara ini mempertahankan *commit*-mu apa adanya sehingga `git branch -d` di 8.9 berjalan mulus.
2. Klik **Merge pull request**. Pesan *merge commit*-nya sudah terisi (`Merge pull request #1 from nama-akunmu/fitur/vitals`); biarkan, lalu klik **Confirm merge**.
3. Label ungu **Merged** muncul di bagian atas halaman, dan di bawah percakapan muncul tombol **Delete branch**. Klik tombol itu: cabang `fitur/vitals` di GitHub dihapus karena isinya sudah aman di `main`.

#### 8.9 Pulang ke `main` di laptop

`main` di GitHub kini lebih baru daripada `main` di laptopmu. Di terminal kedua:

```text
git switch main
git pull --prune
git branch -d fitur/vitals
git log --oneline --graph
```

**Hasilnya** (kode *commit*, beberapa baris `remote: …`, dan angkanya di layarmu berbeda):

```text
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
```

```text
From https://github.com/nama-akunmu/rumah-pintar-mini
 - [deleted]         (none)     -> origin/fitur/vitals
   3a0a267..061937e  main       -> origin/main
Updating 3a0a267..061937e
Fast-forward
 backend/bruno/vitals Node 1.yml | 22 ++++++++++++++++++++++
 backend/src/routes/perangkat.ts | 20 +++++++++++++++++++-
 2 files changed, 41 insertions(+), 1 deletion(-)
 create mode 100644 backend/bruno/vitals Node 1.yml
```

```text
Deleted branch fitur/vitals (was 8d53bd9).
```

```text
*   061937e (HEAD -> main, origin/main, origin/HEAD) Merge pull request #1 from nama-akunmu/fitur/vitals
|\
| * 8d53bd9 GET /devices/:id/vitals: kesehatan terakhir perangkat (Modul 16 Praktik 8)
|/
* 3a0a267 Templat pull request dengan checklist (Modul 16 Praktik 8)
* 7b0a8d2 Simulator 10 perangkat palsu sesuai kontrak data (Modul 16 Praktik 7)
```

- **`git switch main`** masih berkata `up to date`, padahal `main` di GitHub sudah berubah. Git hanya membandingkan dengan keadaan GitHub yang **terakhir ia unduh**; ia belum tahu ada *merge* baru.
- **`git pull --prune`** mengunduh *merge commit* itu. `--prune` sekalian menghapus catatan lama tentang cabang `fitur/vitals` di GitHub, yang sudah kamu hapus di 8.8 (baris `[deleted]`).
- **`git branch -d fitur/vitals`** menghapus cabang di laptop. Aman: Git menolak menghapus cabang yang isinya belum masuk ke `main`.
- **`git log --oneline --graph`** menggambar riwayatnya: garis bercabang ke kanan untuk *commit* fitur, lalu bertemu lagi di *merge commit*. Tekan **q** kalau terminal menunggu.

Gambar kecil itulah bukti syarat lulus terakhir: **riwayat Git-mu menunjukkan satu *pull request* yang di-*merge***. Di GitHub, tab **Pull requests** → **Closed** juga mencantumkan #1 berlabel **Merged**.

> 💡 **Mulai sekarang, begini cara mengerjakan setiap fitur**, juga di modul-modul berikutnya: `git switch -c fitur/…` → tulis dan uji → *commit* → `git push -u origin fitur/…` → *pull request* → *review* dengan checklist → *merge* → `git switch main` dan `git pull --prune`. GitHub Desktop tetap boleh dipakai kapan saja: ia membaca repositori yang sama, dan menampilkan cabang serta *pull request* yang sama.
>
> ➡️ **Selesai Praktik 8?** Kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1), lalu [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini).

## 🚨 Kalau Tidak Jalan?

Klik judul masalah yang paling mirip dengan yang kamu alami. Langkah pertama untuk hampir semua masalah backend sama: **baca terminal pertama** (tempat `npm run dev` berjalan) dari bawah ke atas, lalu buka `http://127.0.0.1:8080/health`.

<details>
<summary><b>Server tidak mau menyala: <code>EADDRINUSE</code>, <code>Unknown file extension ".ts"</code>, <code>Cannot find package</code>, atau <code>Failed running</code></b></summary>

| Pesan | Penyebab | Obat |
| :--- | :--- | :--- |
| `Error: listen EADDRINUSE: address already in use 127.0.0.1:8080` | Loket 8080 sedang dipakai, paling sering oleh server ini sendiri yang masih jalan di terminal lain. | Tutup terminal lama (ikon tempat sampah di panel terminal). Kalau loketnya memang dipakai program lain, ubah `PORT=8081` di `.env`, lalu ubah juga `baseUrl` di Bruno. |
| `Unknown file extension ".ts"` | Node.js-mu terlalu lama sehingga belum bisa menjalankan file `.ts` sendiri. | `node --version` harus `v24…` (Mac lama dengan Node.js 22: paling tidak `v22.18`). Pasang Node.js 24 LTS seperti Modul 4 Praktik 3, atau versi 22 terbaru untuk Mac lama. |
| `Cannot find package 'fastify'` (atau `'mqtt'`, `'zod'`, …) | `npm install …` belum dijalankan **di folder `backend`**, atau repositorinya baru di-*clone* dari GitHub tanpa `npm install`. | `cd backend`, lalu `npm install`. Tanpa nama library, `npm install` memasang semua yang tercatat di `package.json`. |
| `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/src/config/env' imported from …/src/server.ts` | Impor file milikmu sendiri tidak diakhiri `.ts` (misalnya `"./config/env"` atau `"./config/env.js"`), atau nama file dan foldernya salah ketik. | Tulis lengkap dengan akhiran `.ts`, misalnya `"./config/env.ts"` (Konsep 4), dan cocokkan ejaannya dengan nama di Explorer. `npm run cek` menandai baris yang sama (`TS2835`), tetapi abaikan sarannya `Did you mean './config/env.js'?`: di proyek ini akhirannya selalu `.ts`. |
| `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode` | Ada `enum` (atau fitur TypeScript lain yang tidak bisa sekadar dihapus) di kodemu. | Ganti `enum` dengan `z.enum([...])` dari Zod atau gabungan teks seperti `"node1" \| "node2"` (Konsep 4). `npm run cek` sebenarnya sudah memperingatkan: `This syntax is not allowed when 'erasableSyntaxOnly' is enabled.` |
| `Failed running 'src/server.ts'. Waiting for file changes before restarting...`, didahului pesan merah seperti `SyntaxError` | Ada salah ketik di file yang baru kamu simpan, jadi server berhenti. Paling sering terjadi saat kode yang belum selesai diketik ikut tersimpan. | Baca pesan merah di atasnya: baris `file:///…/src/….ts:15` menyebut nama file dan nomor barisnya, dan tanda `^` di bawah baris kode menunjuk bagian yang salah. Perbaiki, lalu simpan: `--watch` menyalakan server lagi sendiri. `npm run cek` biasanya menunjuk kesalahan yang sama. |

</details>

<details>
<summary><b>Server langsung berhenti setelah <code>npm run dev</code>: <code>.env: not found</code> atau <code>Setelan MQTT_URL belum diisi</code></b></summary>

- **`node: .env: not found`**: file `.env` tidak ada di folder `backend`. Salin `.env.example` (klik kanan → **Copy**, lalu klik kanan folder `backend` → **Paste**), ubah nama salinannya menjadi `.env`, lalu isi alamat broker-mu. Perhatikan nama filenya: diawali titik, tanpa akhiran apa pun (bukan `.env.txt`). Setelah itu, jalankan lagi `npm run dev`. Saat pesan ini muncul, Node.js sudah berhenti sepenuhnya, jadi `--watch` tidak ikut menunggu file `.env` yang baru.
- **`Setelan MQTT_URL belum diisi. Salin .env.example menjadi .env, isi MQTT_URL, lalu jalankan lagi.`**: file `.env` ada, tetapi baris `MQTT_URL=…` kosong atau salah ketik namanya (huruf besar semua, garis bawah). Di bawahnya muncul `Failed running 'src/server.ts'. Waiting for file changes before restarting...`: servernya berhenti, tetapi `npm run dev` tetap menunggu. Isi `MQTT_URL`, simpan `.env`, dan server menyala lagi sendiri.
- **Mengubah `.env`?** Begitu `.env` disimpan, `--watch` memulai ulang server dengan setelan barunya: terminal menulis `Restarting 'src/server.ts'` (Node.js 24.19 atau lebih baru mendahuluinya dengan `Change detected in '….env'`; versi yang lebih lama, termasuk Node.js 22 di Mac lama, hanya menulis baris `Restarting`). Kalau baris `Restarting` tidak muncul, hentikan server (**Ctrl + C**), lalu jalankan lagi `npm run dev`.

</details>

<details>
<summary><b>Terminal terus menulis <code>broker belum terjangkau, mencoba lagi dalam 5 detik</code>, atau perintah dijawab <code>503</code></b></summary>

Backend tidak bisa menyambung ke broker: `/health` menjawab `"broker":false`, dan perintah ke perangkat yang sudah dikenal dijawab `503` dengan `{"pesan":"backend sedang tidak tersambung ke broker"}`. Kalau backend belum pernah tersambung sejak dimulai, gudangnya masih kosong sehingga perintah malah dijawab `404`. Periksa berurutan:

1. **Alamatnya.** Buka `.env`: `MQTT_URL` harus diawali `mqtt://`, berisi alamat IP Pi (bukan nama), dan diakhiri `:1883`, misalnya `mqtt://192.168.1.37:1883`.
2. **Pi-nya.** Buka MQTTX dan sambungkan **Gateway Pi**. Kalau MQTTX juga gagal, masalahnya di Pi atau jaringan, bukan di backend: ikuti 🚨 Modul 12 (Pi menyala? alamat IP-nya berubah? laptop di WiFi yang sama?).
3. **Jalur laptop.** Broker laptop harus sedang berjalan (Modul 12 Praktik 7), dan `MQTT_URL` berisi alamat broker itu.

Setelah `.env` diperbaiki dan disimpan, server dimulai ulang sendiri (lihat baris `Restarting 'src/server.ts'`). Kalau tidak, mulai ulang dengan **Ctrl + C** lalu `npm run dev`.

</details>

<details>
<summary><b><code>GET /devices</code> menjawab <code>[]</code> (kosong)</b></summary>

- Lihat log terminal pertama: ada baris `tersambung ke broker …`? Kalau belum, lihat bagian lipat "broker belum terjangkau" di atas.
- Backend tersambung ke broker yang **berbeda** dengan perangkatmu, misalnya backend ke Pi, padahal Node 1 masih ke broker publik dari Modul 11. Di MQTTX, berlangganan `rpm/#` di sambungan yang sama dengan `MQTT_URL` backend: kalau MQTTX juga sepi, perangkatnya tidak berbicara ke broker itu.
- Perangkatnya mati, dan belum pernah tersambung ke broker ini sejak broker dinyalakan (belum ada status *retained*). Nyalakan Node 1, atau jalankan simulator Praktik 7.

</details>

<details>
<summary><b>Pesan Node 1 yang sungguhan ikut <code>DITOLAK</code></b></summary>

Baca alasan di belakang `DITOLAK`. Penyebab yang paling sering:

- **`isi: Kunci tidak dikenali : "…"`**: firmware-mu mengirim kolom yang tidak ada di kontrak, misalnya sensor tambahan dari 🧩 modul sebelumnya. Aturan proyek ini: ubah kontrak dulu (`KONTRAK-DATA.md` dan Lampiran A), baru kodenya. Tambahkan kolom itu ke `TelemetryNode1` di `kontrak.ts` dengan tipe dan rentangnya.
- **`ts: …`**: jam Node 1 belum tersetel, atau `ts` berisi zona waktu selain UTC (`Z`). Node 1 v1.2.0 ke atas tidak menerbitkan `telemetry` sebelum jamnya disetel NTP, jadi ini biasanya muncul pada pesan buatan sendiri dari MQTTX.
- **`kelembapan: …` atau angka lain di luar rentang**: sensornya mungkin memang rusak. Itulah gunanya penjaga: data rusak tidak masuk gudang.

</details>

<details>
<summary><b>VS Code penuh garis merah, atau <code>npm run cek</code> mengeluhkan <code>TS5097</code>, <code>TS2591</code>, <code>TS1295</code>, atau <code>TS18003</code></b></summary>

| Pesan | Obat |
| :--- | :--- |
| `An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.` | `tsconfig.json` belum ada atau isinya kurang. Samakan dengan Praktik 2.3, dan pastikan file itu ada di folder `backend` (sejajar dengan `package.json`), bukan di `src`. |
| `error TS18003: No inputs were found in config file '…/rumah-pintar-mini/tsconfig.json'` | `tsconfig.json` tersimpan di akar `rumah-pintar-mini`, bukan di folder `backend`. Di Explorer, seret file itu ke folder `backend` (jawab **Move** kalau ditanya), lalu jalankan lagi `npm run cek`. |
| `npm run cek` hanya mencetak `Version 7.0.2` dan daftar perintah `tsc` | `tsconfig.json` tidak ditemukan, jadi `tsc` tidak tahu apa yang harus diperiksa. Buat file itu di folder `backend` seperti Praktik 2.3, lalu jalankan lagi. |
| `Cannot find name 'process'. Do you need to install type definitions for node?` | `@types/node` belum terpasang: `npm install --save-dev @types/node@24`. Periksa juga `"types": ["node"]` di `tsconfig.json`. |
| `ECMAScript imports and exports cannot be written in a CommonJS file …` | `package.json` belum berisi `"type": "module"`. Jalankan `npm pkg set type=module` di folder `backend`. |
| Garis merah tetap ada setelah diperbaiki | VS Code kadang terlambat membaca `tsconfig.json` yang baru. Tekan **Ctrl + Shift + P**, ketik `TypeScript: Restart TS Server`, lalu **Enter**. |

</details>

<details>
<summary><b>Perintah selalu dijawab <code>504</code> (tidak ada <code>ack</code> dalam 5 detik)</b></summary>

1. Di MQTTX, berlangganan `rpm/<device_id Node 1>/#`, lalu kirim lagi perintahnya dari Bruno. Muncul pesan `cmd` dari backend? Kalau tidak, periksa `device_id` di URL Bruno.
2. Muncul `cmd`, tetapi tidak ada `ack`: Node 1 tidak mendengar perintah. Buka Serial Monitor Node 1: ada baris tentang perintah itu? Firmware Node 1 sejak v1.2.0 berlangganan `cmd` begitu tersambung (Modul 11). Tekan **EN** di papan Node 1, tunggu statusnya `online`, lalu coba lagi.
3. Ada `ack`, tetapi backend tetap `504`: lihat terminal pertama. Ada `DITOLAK rpm/…/ack`? Berarti `ack`-nya melanggar kontrak, misalnya `ok:false` tanpa `pesan`. Kalau ada `ack … tiba, tetapi tidak ada perintah yang menunggunya`, `id` di `ack` berbeda dengan `id` perintah.
4. Tepat setelah Node 1 padam, `504` memang jawaban yang benar sampai broker menerbitkan wasiatnya (Praktik 6.5).

</details>

<details>
<summary><b>Perintah dijawab <code>409</code>: <code>jenis perangkat belum diketahui</code> atau <code>perangkat sedang offline</code></b></summary>

- **`jenis perangkat belum diketahui: tunggu telemetry pertamanya`**: server baru saja dimulai ulang (misalnya karena kamu menyimpan file). Status *retained* Node 1 sudah tiba lagi, tetapi bacaan sensornya belum, jadi jenis perangkatnya belum diketahui. Tunggu paling lama 10 detik sampai `telemetry` Node 1 berikutnya datang, lalu kirim lagi. Kalau jawabannya tetap sama, lihat **daftar perangkat**: status `offline` berarti Node 1 (atau simulatornya) memang mati, jadi ikuti butir berikutnya. Untuk Node 2, pesan ini bertahan sampai Node 2 bangun dan mengirim `telemetry` (paling lama 5 menit); sesudahnya jawabannya tetap `409`, kali ini `Node 2 tidak menerima perintah`.
- **`perangkat sedang offline, perintah tidak dikirim`**: broker sudah menerbitkan wasiat `offline` Node 1. Nyalakan Node 1 (USB dulu, baru MB102), lalu tunggu sampai statusnya `online` di **daftar perangkat**. Di jalur simulator, jalankan lagi simulatornya seperti 7.2.

</details>

<details>
<summary><b>Perangkat palsu <code>f00d…</code> masih muncul di <code>GET /devices</code></b></summary>

Status `offline` mereka *retained*: broker menyimpannya dan menyerahkannya lagi setiap kali backend berlangganan. Hapus dengan mode `bersihkan` simulator (Praktik 7.4), dari folder `alat`:

```text
node simulator-perangkat.js mqtt://192.168.1.37:1883 bersihkan
```

Lalu mulai ulang server di terminal pertama (**Ctrl + C**, lalu `npm run dev`). Backend mengabaikan pesan status kosong, jadi gudang server yang sedang berjalan baru bersih setelah dimulai ulang.

Cara lain, satu per satu lewat MQTTX seperti 🚨 Modul 11 "Lampu menyala lagi sendiri": isi **Topic** dengan `rpm/f00d00000001/status`, klik tombol kecil bersegitiga di sebelah kanan tombol **Meta**, pilih **Clear Retained Message**, lalu jawab konfirmasinya. Ulangi untuk setiap perangkat palsu, lalu hilangkan lagi centang **Retain** yang ikut muncul.

</details>

<details>
<summary><b>Simulator: hanya baris pertama yang muncul, tanpa satu pun <code>online</code>, atau <code>Cannot find …</code></b></summary>

Kalau hanya baris pertama yang muncul, simulator tidak sampai ke broker, tetapi ia tidak mengeluh: ia diam-diam mencoba lagi setiap 5 detik. Pesan `Cannot find …` dibahas di dua butir terakhir.

- Hentikan dengan **Ctrl + C**, lalu periksa alamat di perintahnya: diawali `mqtt://`, alamat IP Pi (atau broker laptopmu), diakhiri `:1883`. Alamatnya harus sama dengan `MQTT_URL` di `.env` backend.
- Uji alamat yang sama dengan mode `bersihkan`. Mode ini memang melapor kalau gagal, misalnya `Gagal menyambung ke mqtt://192.168.1.37:1883: connect ECONNREFUSED 192.168.1.37:1883`. Artinya, tidak ada broker yang menjawab di alamat itu: lihat bagian lipat "broker belum terjangkau" di atas.
- `Cannot find package 'mqtt'`: library `mqtt` belum terpasang di folder `alat`. Jalankan `npm install mqtt@5.16.1` di folder `alat` (Modul 11 Praktik 8.1).
- `Error: Cannot find module '…simulator-perangkat.js'`: terminalnya tidak berada di folder `alat`. Masuk dulu dengan `cd alat` (dari akar `rumah-pintar-mini`), lalu ulangi perintahnya.

</details>

<details>
<summary><b>Bruno: <code>ECONNREFUSED</code>, alamat <code>{{baseUrl}}</code> berwarna merah, atau jawaban <code>404</code> untuk semua permintaan</b></summary>

- Pesan yang memuat **`ECONNREFUSED`**: server tidak berjalan (lihat terminal pertama), atau `baseUrl` berisi loket yang salah.
- **`{{baseUrl}}` berwarna merah**, atau Bruno mengeluh alamatnya tidak sah: *environment* belum dipilih. Di kanan atas, ganti **No Environment** menjadi **`lokal`**.
- **`404` untuk semua permintaan**, dengan pesan seperti `Route GET://health not found`: `baseUrl` diakhiri garis miring (`http://127.0.0.1:8080/`) sehingga alamatnya menjadi `//health`. Hapus garis miring terakhirnya, lalu **Save**.

</details>

<details>
<summary><b>Git: <code>git push</code> meminta <i>username</i> dan <i>password</i>, atau ditolak</b></summary>

- **macOS, terminal menanyakan `Username for 'https://github.com':`**: proses masuk lewat GitHub CLI belum selesai. Tekan **Ctrl + C**, jalankan `gh auth login` (Praktik 1.3), lalu `gh auth setup-git`, dan ulangi `git push`. GitHub tidak menerima kata sandi akun untuk *push*.
- **Windows, jendela masuk GitHub tidak muncul lagi setelah salah akun**: buka **Credential Manager** Windows (ketik di menu Start), pilih **Windows Credentials**, hapus entri `git:https://github.com`, lalu ulangi `git push`.
- **`! [rejected] … (fetch first)`**: ada *commit* di GitHub yang belum ada di laptop. Jalankan `git pull --no-rebase --no-edit`, lalu `git push` (Praktik 1.5). Telanjur menjalankan `git pull` biasa? Di Windows, tutup tab `MERGE_MSG` yang terbuka di VS Code, dan terminal akan berlanjut sendiri. Di macOS, kalau terminal menulis `fatal: Need to specify how to reconcile divergent branches.`, ulangi dengan perintah di atas.

</details>

<details>
<summary><b>Git: file <code>.env</code> ikut ter-<i>commit</i></b></summary>

1. Pastikan `.env` tercantum di `backend/.gitignore` (Praktik 2.4).
2. Keluarkan dari Git tanpa menghapus filenya dari laptop: `git rm --cached .env` (di folder `backend`), lalu `git commit -m "Keluarkan .env dari Git"` dan `git push`.
3. File itu tetap tersimpan di riwayat *commit* lama. Di modul ini isinya hanya alamat broker rumah, jadi risikonya kecil; tetapi untuk kata sandi sungguhan (mulai Modul 17), anggap kata sandi itu bocor dan **ganti** kata sandinya.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Tidak ada yang wajib, dan tidak ada yang dibutuhkan modul berikutnya.

<details>
<summary><b>ESLint dan Prettier: pemeriksa kebiasaan buruk dan perapi tulisan</b></summary>

Di tim, dua orang yang menulis kode dengan gaya berbeda (spasi atau tab, tanda kutip tunggal atau ganda, baris panjang atau dipatahkan) akan saling "merapikan" kode temannya, dan *pull request* penuh perubahan yang bukan perubahan. Dua alat mengatasinya:

- **Prettier** adalah perapi tulisan otomatis. Aturannya disepakati sekali, lalu semua kode dirapikan dengan cara yang sama sehingga *review* fokus pada isi.
- **ESLint** adalah pemeriksa kebiasaan buruk: variabel yang tidak pernah dipakai, `==` yang seharusnya `===`, atau Promise yang lupa di-`await`. Ia menangkap jenis kesalahan yang lolos dari pemeriksa tipe.

**Coba Prettier tanpa memasangnya.** Di terminal kedua (folder `backend`):

```text
npx prettier@3.9.10 --check src
```

`npx` mengunduh Prettier ke tempat sementara, dan menanyakan dulu `Need to install the following packages:` … `Ok to proceed? (y)`: ketik `y`, lalu **Enter**. `--check` hanya memeriksa, tidak mengubah apa pun. **Hasilnya:**

```text
Checking formatting...
[warn] src/config/env.ts
[warn] src/routes/kesehatan.ts
[warn] src/routes/perangkat.ts
[warn] src/schemas/kontrak.ts
[warn] src/server.ts
[warn] src/services/gudang.ts
[warn] src/services/mqtt.ts
[warn] Code style issues found in 7 files. Run Prettier with --write to fix.
```

Semua file "salah" karena aturan bawaan Prettier memotong baris di 80 huruf, sedangkan kode modul ini memakai baris yang lebih panjang. Mau melihat hasil rapiannya? Jalankan `npx prettier@3.9.10 --write src`, lalu buka panel **Source Control** VS Code (ikon cabang di bilah kiri) dan klik setiap file untuk melihat perbedaannya. Setelah puas, kembalikan semuanya dengan `git restore src` supaya kodemu tetap sama dengan kode modul-modul berikutnya. Karena `git restore` juga membuang perubahan yang belum di-*commit*, coba `--write` hanya setelah semua pekerjaanmu di-*commit*.

**ESLint untuk TypeScript belum bisa dipakai di proyek ini.** ESLint membutuhkan `typescript-eslint` untuk membaca file `.ts`, dan versi terbarunya per Oktober 2026 (8.71.2) hanya menerima TypeScript di bawah 6.1. Proyek ini memakai TypeScript 7, jadi npm menolak memasangnya:

```text
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
…
npm error Found: typescript@7.0.2
…
npm error peer typescript@">=4.8.4 <6.1.0" from typescript-eslint@8.71.2
```

Jangan "memaksa" dengan `--force` atau `--legacy-peer-deps`: pesan npm sendiri menyebut hasilnya `incorrect (and potentially broken)`. Proyek yang butuh ESLint hari ini masih memakai TypeScript 6. Di kurikulum ini, pemeriksa utamanya `npm run cek`, dan langkah pemeriksaan otomatis di setiap *pull request* menyusul di Modul 29.

</details>

<details>
<summary><b>Express sebagai pembanding</b></summary>

**Express** adalah library server Node.js paling tua dan paling banyak dipakai: kamu akan menemukannya di sebagian besar tutorial. Ini `GET /health` Kemenangan Cepat yang ditulis dengan Express 5.3.0:

```js
// server-express.js - GET /health yang sama, ditulis dengan Express (pembanding)
import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.json({ ok: true, pesan: "backend Rumah Pintar Mini hidup" });
});

app.listen(8081, "127.0.0.1", () => {
  console.log("Express mendengarkan di http://127.0.0.1:8081");
});
```

Mau mencobanya? Buat folder terpisah, misalnya `belajar-iot/modul-16/express` (jangan di dalam `backend`). Di sana jalankan `npm init -y`, `npm pkg set type=module`, dan `npm install express@5.3.0`. Simpan kode di atas sebagai `server-express.js` di folder itu, lalu jalankan `node server-express.js`. Buka `http://127.0.0.1:8081/health`.

Konsepnya sama persis: rute, *handler*, dan *middleware* (di Express, `app.use(…)`). Perbedaannya terasa saat proyek membesar:

| | Fastify (modul ini) | Express |
| :--- | :--- | :--- |
| Alamat yang tidak ada (`/apa`) | JSON: `{"message":"Route GET:/apa not found",…}` | Halaman HTML: `Cannot GET /apa` |
| Memeriksa isi permintaan | Skema di definisi rute, dijalankan sebelum *handler* | Ditulis sendiri di setiap *handler* (misalnya memanggil Zod satu per satu) |
| Dokumentasi `/docs` | Dari skema yang sama, otomatis | Alat dan penulisan terpisah |
| Log | Bawaan (pino) | *Middleware* tambahan |
| TypeScript | Tipe isi permintaan ikut dari skema | Tipe ditulis sendiri |

Karena itu, kurikulum ini memilih Fastify. Setelah memahami Fastify, membaca kode Express tidak akan sulit.

</details>

<details>
<summary><b>TypeScript "berat": <i>generics</i> dan <i>build step</i></b></summary>

***Generics*** adalah tipe yang punya "isian". Kamu sebenarnya sudah memakainya di `gudang.ts`:

- `new Map<string, Perangkat>()`: lemari yang labelnya teks dan isinya `Perangkat`. `Map` yang sama bisa diisi apa saja, jadi isiannya ditulis di antara `<` dan `>`.
- `Promise<Ack | null>`: janji yang kelak ditepati dengan `Ack` atau `null`.
- `z.infer<typeof Vitals>`: "tipe yang disimpulkan dari skema `Vitals`".

Menulis fungsi ber-*generics* sendiri, misalnya `function pertama<T>(daftar: T[]): T | undefined`, baru perlu saat kamu membuat library yang dipakai banyak tipe. Untuk backend seperti ini, memakai *generics* buatan orang lain sudah cukup.

***Build step*** adalah langkah menerjemahkan `.ts` menjadi `.js` dengan `tsc` (biasanya ke folder `dist`), lalu menjalankan hasil terjemahannya. Langkah ini masih diperlukan kalau:

- kodenya diterbitkan sebagai library npm untuk dipakai orang lain;
- programnya harus berjalan di Node.js lama, yang belum bisa menghapus label tipe sendiri;
- kodenya memakai fitur TypeScript yang tidak bisa sekadar dihapus, misalnya `enum` (Konsep 4).

Backend kita tidak memenuhi satu pun syarat itu, jadi Node.js 24 menjalankan `.ts` langsung: tidak ada folder `dist` yang bisa basi, dan baris galat di log menunjuk ke baris di file yang kamu tulis. Dashboard React di Modul 22 akan memakai alat yang menghapus label tipe dengan cara yang mirip.

</details>

<details>
<summary><b>Mengapa <code>127.0.0.1</code>, bukan <code>localhost</code> atau <code>0.0.0.0</code></b></summary>

- **`localhost`** adalah *nama*, bukan alamat. Di banyak komputer, nama itu bisa diterjemahkan menjadi dua alamat: `127.0.0.1` (IPv4) dan `::1` (IPv6). Kalau server hanya mendengarkan salah satunya, sementara program lain mencoba yang lain lebih dulu, sambungan ditolak, padahal servernya jelas menyala. Menulis `127.0.0.1` di kedua sisi menghapus keraguan itu.
- **`0.0.0.0`** artinya "dengarkan di semua jaringan laptop ini", termasuk WiFi. HP dan laptop lain di WiFi rumah jadi bisa memanggil API-mu. Windows pun menampilkan jendela **Windows Security Alert** yang menanyakan apakah Node.js boleh menerima sambungan. Masalahnya, API ini belum punya *login*: siapa pun di WiFi yang sama bisa menyalakan relay-mu.

Jadi, selama API belum dikunci (*login* datang di Modul 20), `HOST=127.0.0.1` hanya menerima tamu dari laptop ini sendiri. Kalau kelak perlu dibuka, cukup ubah satu baris di `.env`.

</details>

<details>
<summary><b>Bruno CLI: semua tes dengan satu perintah</b></summary>

Tes `res.status` `eq` `200` yang kamu pasang di setiap permintaan bisa dijalankan sekaligus dari terminal dengan **Bruno CLI**. Sebelum mencoba, perhatikan ukurannya: setelah terpasang, CLI ini menempati sekitar **244 MB** (lebih dari 500 library) karena membawa mesin Bruno lengkap. Seperti Prettier, `npx` menanyakan `Ok to proceed? (y)` lebih dulu. Perhatikan juga bahwa perintah ini benar-benar mengirim `nyalakan lampu` dan `matikan lampu`: relay-mu ikut berbunyi. CLI harus dijalankan dari dalam folder koleksi (di terminal kedua):

```text
cd bruno
npx @usebruno/cli@4.2.1 run --env lokal
```

**Hasilnya** (server menyala; contoh dari uji penulis, tepat setelah server dimulai ulang):

```text
health (200 OK) - 71 ms
Assertions
   ✓ res.status: eq 200
daftar perangkat (200 OK) - 15 ms
Assertions
   ✓ res.status: eq 200
bacaan terbaru Node 1 (200 OK) - 7 ms
Assertions
   ✓ res.status: eq 200
nyalakan lampu (200 OK) - 75 ms
Assertions
   ✓ res.status: eq 200
matikan lampu (200 OK) - 11 ms
Assertions
   ✓ res.status: eq 200
vitals Node 1 (404 Not Found) - 8 ms
Assertions
   ✕ res.status: eq 200
      expected 404 to equal 200
```

Di bawahnya tercetak tabel **📊 Execution Summary**: `Status ✗ FAIL`, `Requests 6 (5 Passed, 1 Failed)`, dan `Assertions 5/6`. `vitals Node 1` gagal karena alasan yang sama dengan 8.4: gudang server yang baru dimulai ulang belum menerima `vitals`. Tes yang gagal membuat perintahnya berakhir dengan kode keluar `1`. Di Modul 29, kode seperti inilah yang membuat pemeriksaan otomatis menolak sebuah *pull request*.

Tanpa tes `res.status`, jawaban `404` pun dianggap "lulus" oleh CLI. Itulah sebabnya setiap permintaan di koleksimu diberi tes. Selesai mencoba, kembali ke folder `backend` dengan `cd ..`.

</details>

<details>
<summary><b>Dokumentasi yang langsung menjadi koleksi Bruno</b></summary>

Halaman `/docs` dibangun dari dokumen OpenAPI mentah di `http://127.0.0.1:8080/docs/json`. Bruno bisa membaca dokumen itu dan membuat satu permintaan untuk setiap rute:

1. Di Bruno, klik **+** di bilah samping, lalu pilih **Import collection**.
2. Di dialog **Import Collection**, buka tab **URL**, tempel `http://127.0.0.1:8080/docs/json`, lalu klik **Import**.
3. Di langkah berikutnya, **Name** sudah terisi `Rumah Pintar Mini API` (dari judul dokumentasi). Pilih **Location** di luar repositori `rumah-pintar-mini`, misalnya folder `belajar-iot/modul-16`, lalu klik **Import**.

Hasilnya koleksi baru dengan permintaan untuk semua rute, lengkap dengan contoh isi `POST /devices/{id}/command`. Koleksi ini belum punya *environment* dengan variabel `baseUrl`: buat seperti 5.8, lalu isi `device_id` di URL setiap permintaan. Koleksi utama tetap yang kamu buat sendiri di `backend/bruno` karena koleksi itu berisi tes dan contoh yang sudah kamu periksa. Koleksi hasil impor cukup untuk melihat bahwa satu sumber (skema Zod) bisa menghasilkan pemeriksaan, dokumentasi, dan koleksi uji sekaligus. Hapus koleksi itu dari bilah samping setelah selesai (klik kanan → **Remove**).

</details>

<details>
<summary><b>GitHub CLI: <i>pull request</i> dari terminal</b></summary>

Pengguna macOS sudah memasang `gh` di Praktik 1. Pengguna Windows bisa memasangnya dari halaman yang sama (`gh_2.102.0_windows_amd64.msi`). Dengan `gh`, langkah 8.6–8.8 bisa dikerjakan dari terminal:

- `gh pr create` menanyakan judul dan isi secara interaktif, dan bisa memakai templat checklist-mu. **Hati-hati dengan `gh pr create --fill`**: ia langsung membuat *pull request* dari pesan *commit*, **tanpa** templat sehingga checklist-nya hilang.
- `gh pr view --web` membuka *pull request* cabang ini di browser, misalnya untuk *review* di tab **Files changed**.
- `gh pr merge --merge --delete-branch` melakukan *merge* dengan *merge commit* (sama dengan **Create a merge commit**), menghapus cabangnya di GitHub dan di laptop, lalu pindah ke `main` dan menarik perubahan terbaru.

Untuk belajar, halaman GitHub tetap lebih jelas karena kamu melihat setiap tombol dan setiap perubahan. Pakai `gh` setelah alurnya terasa biasa.

</details>

## 🧩 Tantangan mandiri

Kerjakan di cabang baru, seperti Praktik 8: `git switch -c fitur/<nama-tantangan>`. Setiap tantangan yang selesai menjadi satu *pull request* lagi untuk latihan *review*. Tingkat 1 dan 2 punya kunci jawaban; isi lengkap kedua file kuncinya ada di [`kode/tantangan/kunci/`](kode/tantangan/kunci/).

### Tingkat 1 — Saring daftar perangkat (ubah sedikit)

Aplikasi yang memakai API-mu sering hanya butuh perangkat yang sedang menyala. Buat `GET /devices?status=online` hanya menjawab perangkat yang `online`, sedangkan `GET /devices` tanpa `?status=…` tetap menjawab semuanya.

1. Di rute `GET /devices` (file `perangkat.ts`), tambahkan `querystring` ke dalam `schema`, di samping `summary`. `querystring` adalah bagian alamat setelah tanda `?`. Isinya objek Zod dengan satu kolom `status` yang **boleh tidak ada**, dan nilainya harus salah satu status yang sah.
2. Di *handler*-nya, pakai `req.query.status` untuk menyaring `semuaPerangkat()` dengan `.filter(…)` (pemanasan langkah 2) sebelum `.map(…)`.
3. Uji di Bruno: `{{baseUrl}}/devices?status=online`, `?status=offline`, dan `?status=nyala`. Yang terakhir harus dijawab `400`.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

```ts
      querystring: z.object({
        status: z.union([Status, z.literal("belum-diketahui")]).optional()
          .describe("tampilkan hanya perangkat dengan status ini, misalnya online"),
      }),
```

```ts
  }, async (req) => {
    const pilihan = semuaPerangkat().filter((p) => req.query.status === undefined || p.status === req.query.status);
    return pilihan.map((p) => ({
```

- `.optional()` membuat `status` boleh tidak ditulis. Tanpa `?status=…`, `req.query.status` bernilai `undefined`, dan saringannya meloloskan semua perangkat.
- Skemanya memakai `Status` yang sama dengan kontrak, jadi `?status=nyala` dijawab `400` dengan `"message":"querystring/status Input tidak valid"`. Tamu yang salah ketik langsung diberi tahu, alih-alih menerima daftar kosong yang membingungkan.
- Buka `/docs`: rute `GET /devices` kini punya parameter `status` lengkap dengan keterangannya, tanpa kamu tulis di tempat lain.

</details>

### Tingkat 2 — Riwayat 20 bacaan terakhir (isi bagian rumpang)

Backend hanya mengingat bacaan **terakhir**. Untuk grafik kecil, aplikasi butuh beberapa bacaan sebelumnya. Simpan paling banyak 20 `telemetry` terakhir setiap perangkat di memori, lalu sediakan `GET /devices/:id/history`. Isi setiap `____` di bawah ini.

Di **`gudang.ts`**, ada tiga tempat:

1. Di `interface Perangkat`, tambahkan baris terakhir ini, tepat di bawah `vitals: Vitals | null;`:

   ```ts
     riwayat: (TelemetryNode1 | TelemetryNode2)[]; // paling banyak 20 telemetry terakhir, yang terlama di depan
   ```

2. Di `ambilAtauBuat`, perangkat baru diberi riwayat awal. Tambahkan `riwayat` di ujung objeknya:

   ```ts
       p = { device_id: deviceId, jenis: "belum-diketahui", status: "belum-diketahui", terakhir_dilihat: "", telemetry: null, vitals: null, riwayat: ____ };
   ```

3. Di `simpanTelemetry`, tambahkan dua baris ini di bawah `p.telemetry = isi;`:

   ```ts
     p.riwayat.____(isi);
     if (p.riwayat.length > ____) p.riwayat.____(); // buang yang terlama
   ```

Di **`perangkat.ts`**, tambahkan rute baru di antara rute `vitals` dan rute `command`:

```ts
  app.get("/devices/:id/history", {
    schema: {
      tags: ["perangkat"],
      summary: "Paling banyak 20 telemetry terakhir satu perangkat (yang terlama di depan)",
      params: ParamId,
      response: {
        200: z.object({ device_id: z.string(), riwayat: z.____(z.union([TelemetryNode1, TelemetryNode2])) })
          .describe("riwayat telemetry di memori server"),
        404: Galat.describe("perangkat itu belum pernah terdengar"),
      },
    },
  }, async (req, reply) => {
    const p = cariPerangkat(req.params.id);
    if (p === undefined) {
      return reply.code(____).send({ pesan: `perangkat ${req.params.id} belum pernah terdengar` });
    }
    return { device_id: p.device_id, riwayat: p.riwayat };
  });
```

Uji: tunggu sekitar satu menit, lalu kirim `GET {{baseUrl}}/devices/<device_id Node 1>/history` dari Bruno. Jumlah bacaannya bertambah satu setiap 10 detik, dan berhenti di 20.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Urutan isiannya: `[]`, `push`, `20`, `shift`, `array`, dan `404`.

- `riwayat: []` adalah daftar kosong untuk perangkat yang baru terdengar. Kalau baris ini terlupa, `npm run cek` langsung menolak dengan `error TS2741: Property 'riwayat' is missing in type …`, disusul beberapa pesan lanjutan. Perbaiki pesan pertama dulu karena pesan-pesan sesudahnya biasanya ikut hilang.
- `push` menambahkan bacaan di ujung belakang, dan `shift` membuang bacaan paling depan (yang terlama) begitu jumlahnya lewat 20. Ini pola yang sama dengan ingatan delapan `id` perintah di simulator (`idTerakhir`).
- `z.array(…)` artinya "daftar yang setiap isinya sesuai skema ini".
- Riwayat ini tetap di memori: 20 bacaan × 10 detik = sekitar 3 menit terakhir, dan hilang saat server dimulai ulang. Riwayat berhari-hari baru masuk akal setelah ada database (Modul 17–18).

</details>

### Tingkat 3 — Otak kipas pindah ke backend (buat dari nol)

Setelah ➕ A di bawah, Node-RED tidak lagi menyalakan kipas saat ruangan panas. Pindahkan aturan itu ke backend: **kipas menyala di atas 30 °C dan baru padam di bawah 28 °C** (histeresis Modul 13 Konsep 7), khusus untuk Node 1-mu.

Petunjuk:

- Tambahkan setelan `OTOMASI_KIPAS=<device_id Node 1-mu>` ke `.env`, dan baris `OTOMASI_KIPAS=` tanpa isi ke `.env.example`. Di `env.ts`, setelan ini **tidak wajib**: kalau kosong, otomasinya mati.
- Tempat paling sederhana untuk aturannya: `mqtt.ts`, tepat setelah `simpanTelemetry(…)` di bagian yang menangani `telemetry`. Lewati pesan Node 2, pesan perangkat lain, dan bacaan `suhu` yang `null` (sensor gagal dibaca).
- Ingat keadaan kipas yang terakhir kamu perintahkan supaya perintah hanya dikirim saat keadaannya perlu berganti, bukan setiap 10 detik. Kirim dengan `kirimPerintah(deviceId, buatIdPerintah(), { target: "kipas", nilai: true })`, lalu catat hasilnya di log.
- Ujilah dengan simulator: isi `OTOMASI_KIPAS=f00d00000001`. Suhu acak simulator (25,0–33,0 °C) sering melewati kedua batas, dan terminal simulator menulis setiap perintah kipas yang ia terima.
- Pastikan ➕ A sudah selesai sebelum otomasi ini dinyalakan: dua otak yang memerintah kipas yang sama akan saling bertabrakan. Modul 19 nanti membangun aturan seperti ini dengan lebih lengkap (aturan disimpan di database, bisa diubah dari dashboard, dan ada aturan pengaman di perangkat).

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini mendapat **backend v0.1**: server buatanmu sendiri yang mendengarkan semua perangkat, memeriksa setiap pesan dengan kontrak data, dan menyediakan API berdokumentasi untuk menyalakan relay. Node-RED pensiun sebagai otak: otomasi kipasnya dimatikan, sedangkan dashboard-nya tetap dipakai. Kontrak data tetap versi 1.2 karena backend hanya membaca dan mengirim pesan dengan bentuk yang sudah ada.

![Diagram proyek Rumah Pintar Mini setelah Modul 16: otak pindah ke backend buatanmu sendiri; garis putus-putus berarti pilihan, pensiun, atau menyusul. Atas, dari kiri: Node 2 Kebun v1.0.0 dengan baterai 18650, tidak berubah, mengirim ESP-NOW ke Node 1 Rumah v1.4.0 (sensor, relay, jembatan Node 2, sensor RS-485), juga tidak berubah. Node 1 mengirim MQTT ke Gateway Raspberry Pi 192.168.1.37 yang berisi Mosquitto, broker MQTT, dan Node-RED dengan dashboard, kartu Kebun, dan grup Sensor RS-485; baris otomasi kipas dicoret, pudar, dan bergaris putus-putus dengan label pensiun sejak Modul 16. Node-RED tetap melayani dashboard di HP. Tengah, kotak hijau Laptop, backend mendengar di 127.0.0.1:8080, berisi backend v0.1 (baru) dengan Fastify + TypeScript ringan, berlangganan rpm/#, kontrak data 1.2 sebagai skema Zod sehingga pesan rusak dicatat DITOLAK, gudang di memori, dan API: GET /health, GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, POST /devices/:id/command, dan GET /docs. Panah hijau rpm/# turun dari gateway ke backend, dan panah cmd naik dari backend ke gateway. Di kanan backend, dua tamu lewat HTTP: Bruno untuk mencoba API, dan browser untuk membuka /docs. Kiri tengah, kotak putus-putus simulator (pilihan): 10 perangkat palsu di laptop, f00d00000001 sampai f00d00000010, pengganti Node 1 dan Node 2, tersambung ke Mosquitto lewat garis MQTT putus-putus. Di bawahnya catatan jujur: backend berjalan di laptop (127.0.0.1:8080); datanya hilang saat server dimatikan. Bawah, GitHub rumah-pintar-mini: backend/ baru (src/, bruno/, README.md), alat/simulator-perangkat.js baru, .github/pull_request_template.md baru, edge/node-red-flows.json dengan otomasi kipas dimatikan, KONTRAK-DATA.md tetap 1.2, dan firmware/ tidak berubah. Kanan bawah, kotak putus-putus menyusul: Modul 17 database, Modul 19 aturan otomatis di backend, dan Modul 22 dashboard React.](aset/diagram-proyek-modul-16.png)

> 🖥️ **Alat yang dipakai:** **editor Node-RED** di browser laptop (`http://192.168.1.37:1880`, jalur laptop: `http://localhost:1880`), **VS Code** dengan folder `rumah-pintar-mini` dan terminalnya, dan **browser** yang sudah masuk ke GitHub.
>
> ⭐ **Wajib** — langkah D adalah syarat lulus Modul 16.

| File di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `backend/` | **baru**: backend v0.1 (Kemenangan Cepat sampai Praktik 8) |
| `backend/README.md` | **baru**: cara menjalankan backend (langkah C) |
| `alat/simulator-perangkat.js` | **baru**: sepuluh perangkat palsu (Praktik 7) |
| `.github/pull_request_template.md` | **baru**: checklist *review* (Praktik 8) |
| `edge/node-red-flows.json` | empat node otomasi kipas dimatikan (langkah A dan B) |

### A. Pensiunkan otomasi Node-RED: satu otak saja

Mulai minggu ini, keputusan otomatis menjadi tugas server buatanmu (Modul 19). Kalau otomasi Node-RED tetap jalan, rumah punya dua otak yang bisa saling bertabrakan. Karena itu, otomasi Node-RED dimatikan, tetapi tidak dihapus: node-nodenya tetap ada sebagai catatan, dan bisa dinyalakan lagi kapan saja.

1. Buka editor Node-RED di browser laptop (`http://192.168.1.37:1880`, jalur laptop: `http://localhost:1880`), lalu masuk kalau diminta, seperti Modul 13. Cari bagian bertanda `2 · Otomasi kipas: nyala > 30 °C, padam < 28 °C`.
2. Pilih keempat node di bagian itu: `histeresis 30/28`, `kipas nyala`, `kipas padam`, dan `hanya kalau berubah`. Caranya: tekan tombol tetikus di ruang kosong, lalu seret kotak seleksi yang mengelilingi keempatnya. Bisa juga dengan menahan **Ctrl** (macOS: **Cmd**) sambil mengeklik keempatnya satu per satu.
3. Klik kanan salah satu node yang terpilih, arahkan ke **Node**, lalu pilih **Disable selected nodes**. Keempat node kini bergaris tepi putus-putus dan tampak pudar, begitu juga kabel-kabelnya.
4. Klik **Deploy** di kanan atas (atau **Ctrl + D**).
5. Uji. Dashboard di HP tetap menampilkan bacaan Node 1 dan Node 2, dan sakelar **Kipas** tetap bisa menyalakan kipas secara manual. Yang hilang hanya penyalaan otomatis: kalau suhu melewati 30 °C, kipas tidak lagi menyala sendiri.

Sakelar dashboard juga mengirim `cmd` ke Node 1. Backend ikut mendengar `ack`-nya, lalu mencatat `ack … tiba, tetapi tidak ada perintah yang menunggunya`. Itu wajar karena perintah itu datang dari Node-RED, bukan dari API. Sebaliknya, saat kamu menyalakan lampu dari Bruno, sakelar **Lampu** di dashboard HP ikut bergeser: Node-RED juga mendengar `ack` dari Node 1.

### B. Ekspor ulang flow Node-RED

1. Ekspor seperti ➕ D Modul 13: menu utama → **Export** → **all flows** → **formatted** → **Download**.
2. Di folder **Downloads**, ubah nama `flows.json` menjadi `node-red-flows.json`, lalu pindahkan ke **Documents → GitHub → rumah-pintar-mini → edge** dan pilih **Replace the file in the destination** (macOS: **Replace**).
3. Di VS Code, buka `edge/node-red-flows.json`, tekan **Ctrl + F**, lalu cari `"d": true`. Hasilnya harus **4** (penanda node yang dimatikan). Cari juga `password`: tidak boleh ada satu pun yang ditemukan.

### C. Catatan cara menjalankan backend

Repositori yang dilihat orang lain (teman satu tim atau perekrut) butuh petunjuk singkat cara menjalankan backend-mu. Di VS Code, klik kanan folder **`backend`**, pilih **New File…**, lalu buat **`README.md`** berisi:

```markdown
# Backend Rumah Pintar Mini

Backend v0.1 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.2 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, dan menyediakan API berdokumentasi.

## Menjalankan

1. Pasang Node.js 24 LTS.
2. Di folder ini, jalankan `npm install`.
3. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` dengan alamat broker.
4. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis |
| `npm run cek` | memeriksa tipe TypeScript (jalankan sebelum setiap *commit*) |

## API

| Rute | Gunanya |
| :--- | :--- |
| `GET /health` | server hidup? tersambung ke broker? berapa pesan diterima dan ditolak? |
| `GET /devices` | semua perangkat yang pernah terdengar |
| `GET /devices/:id/latest` | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | kesehatan terakhir satu perangkat |
| `POST /devices/:id/command` | kirim perintah `set` ke Node 1, lalu tunggu `ack`-nya paling lama 5 detik |

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`).

## Batasan v0.1

- Data hanya disimpan di memori, jadi hilang saat server dimatikan. Database menyusul.
- Server hanya menerima tamu dari laptop ini (`127.0.0.1`) karena API belum punya *login*.
```

### D. ⭐ Simpan ke GitHub lewat *pull request*

Pekerjaan ➕ ini juga melewati alur Praktik 8. Di terminal kedua (folder `backend`):

```text
git switch -c fitur/pensiun-node-red
cd ..
git add edge/node-red-flows.json backend/README.md
git commit -m "Node-RED pensiun sebagai otak, README backend (Modul 16)"
git push -u origin fitur/pensiun-node-red
cd backend
```

Lalu ulangi langkah 8.6–8.8 untuk *pull request* ini: buka, *review* dengan checklist, lalu *merge* dengan **Create a merge commit**. Ada butir checklist yang tidak berlaku untuk perubahan ini, misalnya rute baru di Bruno. Tulis catatan singkat di deskripsi ("tidak ada rute baru"), lalu centang butir itu. Kembali ke `main` dengan `git switch main`, `git pull --prune`, dan `git branch -d fitur/pensiun-node-red`.

Terakhir, di repositori **`belajar-iot`**, folder `modul-16` berisi `pemanasan.js` beserta file-file pemanasan lainnya. Lakukan *commit* dan *push* juga, dengan GitHub Desktop atau terminal.

**Bukti lulus Modul 16** (bandingkan dengan ✅ di bawah): `GET /devices/<id>/latest` dan `POST /devices/<id>/command` dari Bruno (Praktik 5–6), halaman `/docs` dengan semua rute (Praktik 5 dan 8), dan riwayat Git dengan *pull request* yang di-*merge* (Praktik 8 dan langkah D).

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Backend** | Program di server yang bekerja di belakang layar: mendengar perangkat, menyimpan data, menjalankan aturan, dan melayani aplikasi. |
| **API** (*Application Programming Interface*) | "Menu dan pelayan" sebuah backend: daftar permintaan yang boleh diajukan program lain, beserta bentuk jawabannya. |
| **Rute** (*route*) / *endpoint* | Pasangan metode dan alamat yang dilayani server, misalnya `GET /devices/:id/latest`. |
| ***Handler*** | Fungsi yang dijalankan server untuk satu rute, dan yang menyusun jawabannya. |
| ***Middleware*** / ***hook*** | Fungsi yang menyela perjalanan **setiap** permintaan, misalnya pencatat log satu baris di `server.ts`. |
| **Kode status HTTP** | Angka tiga digit di setiap jawaban: `200` berhasil, `400` permintaan tidak sah, `404` tidak ditemukan, `409` keadaan tidak memungkinkan, `503` layanan pendukung putus, `504` tidak ada jawaban dalam batas waktu. |
| **Port** (loket) | Nomor "loket" di sebuah komputer tempat sebuah server menunggu tamu. Backend ini memakai `8080`. |
| **`127.0.0.1`** | Alamat "laptop ini sendiri". Server yang mendengarkan di alamat ini hanya bisa diketuk dari laptop yang sama. |
| **Fastify** | Library server HTTP untuk Node.js yang dipakai modul ini; rute, skema, log, dan *plugin* sudah tersedia di dalamnya. |
| ***Plugin*** **Fastify** | Fungsi yang menerima `app` lalu mendaftarkan sekelompok rute; dipasang dengan `app.register(…)`. |
| **TypeScript ringan** | JavaScript ditambah label tipe (`: number`, `interface`). Node.js 24 cukup menghapus labelnya lalu menjalankan sisanya (*type stripping*). |
| **Pemeriksa tipe** (`tsc`, `npm run cek`) | Program yang membaca label tipe dan menolak kode yang tidak cocok, **sebelum** kode dijalankan. Node.js sendiri tidak memeriksa label tipe. |
| **`tsconfig.json`** | Setelan pemeriksa tipe: seberapa ketat, folder mana yang diperiksa, dan aturan apa yang harus sama dengan Node.js 24. |
| **`.env` / `.env.example`** | `.env` berisi setelan dan rahasia milikmu sendiri, dan tidak pernah ikut Git. `.env.example` adalah contohnya tanpa rahasia, dan ikut Git. |
| ***devDependencies*** | Library alat bantu pengembangan, misalnya pemeriksa tipe dan perapi log, yang bukan bagian inti program. Perapi log pino-pretty tetap dimuat setiap kali server dinyalakan di laptop. |
| **Zod** / **skema** | Library untuk menuliskan bentuk data yang sah sebagai kode. Skemanya memeriksa pesan, menghasilkan tipe TypeScript, dan menjadi dokumentasi. |
| **Validasi** | Memeriksa data yang datang dari luar (perangkat atau tamu API) terhadap aturan, sebelum data itu dipercaya. |
| **OpenAPI** / **Swagger UI** | OpenAPI adalah format standar untuk menggambarkan sebuah API. Swagger UI mengubah dokumen OpenAPI menjadi halaman `/docs` yang bisa dicoba. |
| **Bruno** | Aplikasi untuk mencoba API. Setiap permintaannya disimpan sebagai file teks di folder koleksi sehingga bisa ikut Git. |
| ***Environment*** **Bruno** | Kumpulan variabel sebuah koleksi Bruno, misalnya `baseUrl`, supaya alamat server cukup ditulis di satu tempat. |
| **Tes** (*assert*) | Pemeriksaan otomatis atas jawaban, misalnya `res.status` `eq` `200`. |
| **Simulator** | Program yang berpura-pura menjadi banyak perangkat dan berbicara persis menurut kontrak data supaya backend bisa diuji tanpa papan. |
| ***Branch*** (cabang) | Jalur kerja terpisah di repositori Git. Perubahan di cabang tidak menyentuh `main` sampai di-*merge*. |
| ***Pull request*** | Permintaan untuk menggabungkan sebuah cabang ke `main`, lengkap dengan halaman untuk membaca perubahannya, berkomentar, dan memutuskan. |
| ***Review*** | Membaca perubahan orang lain dengan teliti (sebaiknya dengan checklist) sebelum perubahan itu digabungkan. |
| ***Merge*** / ***merge commit*** | Menggabungkan sebuah cabang ke cabang lain. *Merge commit* adalah *commit* khusus yang mencatat penggabungan itu. |
| ***Upstream*** (`git push -u`) | Pasangan cabang di laptop dengan cabang di GitHub supaya `git push` dan `git pull` berikutnya tahu tujuannya. |
| **Templat *pull request*** | File `.github/pull_request_template.md` yang isinya otomatis muncul di deskripsi setiap *pull request* baru. |

## 📝 Kuis (5 soal)

1. Kamu menulis `const suhu: number = "28";` di `server.ts`, lalu menyimpannya. Apa yang terjadi pada server yang sedang berjalan dengan `npm run dev`? Bagaimana kesalahan ini akan ketahuan?
2. Sebutkan kode status yang dijawab backend untuk setiap kejadian ini, dan jelaskan arti kodenya: (a) isi permintaan `{"target":"pompa","nilai":30}`; (b) URL berisi `device_id` yang belum pernah terdengar; (c) Node 1 dicabut listriknya 5 detik yang lalu; (d) Node 1 dicabut listriknya 2 menit yang lalu.
3. Node 1 milik temanmu, yang sensornya rusak, mengirim `telemetry` dengan `"kelembapan": 171`. Apa yang dilakukan backend terhadap pesan itu, dan di mana kamu bisa melihatnya? Mengapa itu lebih baik daripada menyimpan pesan itu begitu saja?
4. Mengapa alamat broker ditulis di `.env`, bukan langsung di `env.ts`? Kalau `.env` berisi kata sandi lalu telanjur di-*commit* dan di-*push*, apa saja yang harus dilakukan?
5. Urutkan langkah mengerjakan sebuah fitur ini: (a) `git push -u origin fitur/x`; (b) *merge* dengan **Create a merge commit**; (c) `git switch -c fitur/x`; (d) *review* dengan checklist; (e) `git switch main` lalu `git pull --prune`; (f) tulis kode, uji, dan *commit*; (g) buka *pull request*. Lalu jelaskan satu alasan tim tidak langsung meng-*commit* ke `main`.

<details>
<summary><b>Kunci jawaban</b></summary>

1. Server **tetap berjalan**: `--watch` memulainya ulang, dan Node.js hanya menghapus label `: number` tanpa memeriksanya (Konsep 4). Kesalahannya ketahuan di dua tempat: VS Code menggarisbawahinya dengan garis merah, dan `npm run cek` menolak dengan `error TS2322: Type 'string' is not assignable to type 'number'.` Karena itulah `npm run cek` menjadi butir pertama checklist *pull request*.
2. (a) **`400`**: isinya melanggar skema (`nilai` pompa paling besar 10), jadi ditolak sebelum apa pun dikirim. (b) **`404`**: perangkat itu tidak ada di gudang. (c) **`504`**: broker belum tahu Node 1 padam, jadi perintah dikirim, tetapi tidak ada `ack` dalam 5 detik. (d) **`409`**: broker sudah menerbitkan wasiat `offline` (setelah sekitar 22,5 detik tanpa kabar), jadi backend tidak mencoba mengirim (Praktik 6.5).
3. Backend **menolaknya**: terminal menulis `DITOLAK rpm/<device_id>/telemetry: kelembapan: …` dengan alasannya, angka `ditolak` di `/health` bertambah satu, dan pesan itu tidak masuk gudang. Bacaan lama tetap menjadi bacaan terakhir yang sah. Kalau pesan rusak disimpan, angka mustahil itu akan muncul di API, di grafik, dan kelak menggerakkan aturan otomatis (Konsep 7, Praktik 4).
4. `.env` tidak pernah ikut Git (tercantum di `.gitignore`), jadi alamat dan kata sandi tidak tersebar ke GitHub. Setiap laptop atau server juga bisa memakai setelannya sendiri tanpa mengubah kode. Kalau telanjur: keluarkan dari Git dengan `git rm --cached .env`, pastikan `.env` ada di `.gitignore`, lalu *commit* dan *push*. File itu tetap tersimpan di riwayat *commit* lama, jadi **ganti kata sandinya**: anggap kata sandi lama sudah bocor (🚨).
5. Urutannya **c → f → a → g → d → b → e**. Alasannya, misalnya: `main` harus selalu berisi versi yang jalan sehingga setiap perubahan diperiksa orang kedua (atau checklist) lebih dulu; beberapa orang bisa mengerjakan fitur berbeda tanpa saling mengganggu; dan riwayat *pull request* menjelaskan mengapa sebuah perubahan dibuat.

</details>

---

## ✅ Checklist kelulusan Modul 16

Syarat lulus dari Silabus: **`GET /devices/<id>/latest` di Bruno mengembalikan JSON bacaan terbaru, `POST …/command` menyalakan relay dan `ack`-nya tercatat, `/docs` menampilkan semua *endpoint*, dan riwayat Git-mu menunjukkan satu *pull request* yang di-*merge*.** **Jalur simulator** (belum punya Node 1 dengan relay): butir ⭐ Praktik 5 dan 6 boleh dicentang dengan perangkat palsu `f00d00000001` asalkan bacaan terbarunya tampil dan perintahnya dijawab `200` dengan `ack` yang tercatat. Butir Praktik 3 dan 7 yang menyebut Node 1 dan Node 2 juga boleh dicentang dengan perangkat palsu. Butir "relay menyala" dibuktikan setelah Node 1 dan relay-mu ada.

- [ ] Pemanasan ulang JavaScript selesai, dan kunci jawabannya sudah kucocokkan (🔁).
- [ ] Server pertamaku menjawab `/health` di browser, dan memulai ulang sendiri saat kode disimpan (Kemenangan Cepat).
- [ ] Git terpasang, dan aku melakukan *commit* serta *push* dari terminal (Praktik 1).
- [ ] `npm run cek` lolos, dan aku bisa menjelaskan mengapa server tetap jalan walaupun ada kesalahan tipe (Praktik 2).
- [ ] `.env` tidak ada di GitHub, sedangkan `.env.example` ada (Praktik 2).
- [ ] `GET /devices` menampilkan Node 1 dan Node 2 beserta statusnya (Praktik 3).
- [ ] Pesan rusak dari MQTTX tercatat `DITOLAK` dengan alasan yang jelas, dan angka `ditolak` di `/health` bertambah (Praktik 4).
- [ ] ⭐ `GET /devices/<id>/latest` di Bruno mengembalikan JSON bacaan terbaru Node 1, dan tes `res.status` di setiap permintaan Bruno lulus (Praktik 5).
- [ ] ⭐ `/docs` menampilkan kelima rute: `/health`, `/devices`, `/devices/{id}/latest`, `/devices/{id}/vitals`, dan `/devices/{id}/command` (Praktik 5 dan 8).
- [ ] ⭐ `POST /devices/<id>/command` dari Bruno menyalakan relay lampu, dan `ack`-nya tercatat di jawaban serta di log backend (Praktik 6).
- [ ] Aku bisa menjelaskan beda `504` dan `409` setelah Node 1 dicabut (Praktik 6.5).
- [ ] Simulator menjalankan sepuluh perangkat palsu, dan backend melayani semuanya bersama Node 1 dan Node 2 (Praktik 7).
- [ ] ⭐ Riwayat Git-ku (`git log --oneline --graph`, atau tab **Pull requests** → **Closed** di GitHub) menunjukkan *pull request* `fitur/vitals` yang di-*merge* (Praktik 8).
- [ ] Otomasi kipas Node-RED dimatikan, flow-nya diekspor, dan `backend/README.md` sudah ada (➕ A–C).
- [ ] ⭐ Semua pekerjaan Modul 16 sudah ada di `main` repositori `rumah-pintar-mini` di GitHub (➕ D).

🎉 **Fase 3 dimulai.** Rumah Pintar Mini kini punya server buatanmu sendiri: ia mendengar semua perangkat, menolak data yang melanggar kontrak, dan melayani API berdokumentasi. Datanya masih hilang setiap kali server dimatikan. Menyimpannya secara permanen adalah tugas modul berikutnya.

> ➡️ **Modul berikutnya:** Modul 17 — Database Pertama: SQL Dasar & Skema "Rumah Pintar Mini" (PostgreSQL via Docker). Backend mendapat ingatan jangka panjang: setiap bacaan yang lolos pemeriksaan kontrak disimpan ke database sehingga riwayatnya tetap ada walaupun server dimulai ulang.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- Node.js 24: [Modules: TypeScript](https://nodejs.org/docs/latest-v24.x/api/typescript.html) (*type stripping*, sintaks yang bisa dihapus, impor berakhiran `.ts`) dan [opsi baris perintah](https://nodejs.org/docs/latest-v24.x/api/cli.html) (`--env-file`, `--watch`). TypeScript: [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) (`erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `noEmit`) dan pengumuman TypeScript 7 di [blog TypeScript](https://devblogs.microsoft.com/typescript/).
- [Fastify](https://fastify.dev/docs/latest/) 5.12.7: *Routes*, *Validation and Serialization*, *Hooks*, *Logging*, *Plugins*, dan *Type Providers*; [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) 7.0.0; [@fastify/swagger](https://github.com/fastify/fastify-swagger) 9.9.2 dan [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) 6.1.2 (membawa Swagger UI 5.32.6); [pino](https://getpino.io) dan [pino-pretty](https://github.com/pinojs/pino-pretty) 13.2.0.
- [Zod](https://zod.dev) 4.6.7: skema, `z.strictObject`, `z.iso.datetime`, `z.discriminatedUnion`, `.refine`, `z.infer`, dan bahasa pesan galat (`z.locales.id()`). [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1. [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3) 3.0.3.
- Kode status HTTP: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) (*HTTP Semantics*) dan [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status).
- [Bruno](https://docs.usebruno.com) 4.2.1 beserta kode sumbernya di [github.com/usebruno/bruno](https://github.com/usebruno/bruno) (format koleksi YAML, *environment*, *Assert*, *Clone Request*, impor OpenAPI, dan [Bruno CLI](https://www.npmjs.com/package/@usebruno/cli)).
- Git: [dokumentasi resmi](https://git-scm.com/docs) (`git switch`, `git push`, `git pull`, `git branch`, `git log`), [Git for Windows](https://gitforwindows.org) 2.56.0 dan [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager), [Xcode Command Line Tools](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools/) (Apple), dan [GitHub CLI](https://cli.github.com/manual/) 2.102.0.
- GitHub Docs: [*Creating a pull request*](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request), [*Reviewing proposed changes in a pull request*](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request), [*Merging a pull request*](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request), dan [*Creating a pull request template for your repository*](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository).
- Node-RED 5.0.8: [*Editor: Nodes*](https://nodered.org/docs/user-guide/editor/workspace/nodes) (menonaktifkan node) dan [*Editor: Flows*](https://nodered.org/docs/user-guide/editor/workspace/flows).
- Pembanding di 🔬: [Express](https://expressjs.com) 5.3.0, [Prettier](https://prettier.io) 3.9.10, [ESLint](https://eslint.org) 10.13.0, dan [typescript-eslint](https://typescript-eslint.io) 8.71.2 (syarat versi TypeScript-nya dari registri npm).

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-16`, `backend-pelayan-restoran`, `alur-perintah-ack`, `git-branch-pr`, `diagram-proyek-modul-16` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Alur perintah dari kode backend modul ini dan kontrak data 1.2; alur Git dari dokumentasi Git dan GitHub di atas. | CC BY 4.0 |
| `swagger-docs.png`, `swagger-coba-latest.png` | Tangkapan layar asli halaman `/docs` backend modul ini (Swagger UI 5.32.6 lewat @fastify/swagger-ui 6.1.2) di laptop penulis: daftar rute, rute `POST /devices/{id}/command`, dan rute `GET /devices/{id}/latest` yang dicoba dengan **Try it out** (tahap Praktik 5); dipotong dan disusun ulang, dengan judul, nomor, dan keterangan oleh penulis. | Swagger UI berlisensi Apache 2.0; @fastify/swagger-ui (logo Fastify di bilah atas) berlisensi MIT; gambar: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua kode backend modul ini, termasuk setiap tahapnya di folder `kode/tahap/`, sudah diperiksa dengan `npm run cek` (TypeScript 7.0.2) dan dijalankan dengan Node.js 24.21.0 di Windows. Keluaran server, Bruno CLI, simulator, dan `git` direkam penulis di laptopnya dengan broker MQTT lokal, Node 1 dan Node 2 tiruan yang mengirim pesan persis menurut kontrak data, dan repositori Git uji. Alamat broker, `device_id`, dan jam ditulis ulang sesuai contoh modul ini (Pi `192.168.1.37`, WIB). Baris `remote:` dari GitHub dan langkah-langkah di halaman GitHub ditulis berdasarkan dokumentasi resmi GitHub (Oktober 2026), bukan rekaman layar. Respons Node 1 sungguhan (relay berbunyi, angka `vitals`) adalah **contoh** dengan angka yang wajar; angka di layarmu akan berbeda.

---

[⬅️ Modul 15](../../fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md) · [Fase 3](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 17 — Database Pertama** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-17--database-pertama-sql-dasar--skema-rumah-pintar-mini-postgresql-via-docker))
