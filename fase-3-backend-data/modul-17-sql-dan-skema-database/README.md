# Modul 17 — Database Pertama: SQL Dasar & Skema "Rumah Pintar Mini" (PostgreSQL via Docker)

🌐 **Bahasa Indonesia** · [English](../../en/phase-3-backend-data/module-17-sql-and-database-schema/README.md)

*Fase 3 · Minggu 17 · Perangkat keras (*hardware*): **Kit A + B** — Node 1, Node 2, dan gateway Pi dari Modul 12–16, atau **laptop saja** (simulator Modul 16 dan data latihan modul ini menggantikan perangkat) · Prasyarat: **Modul 16** (backend v0.1) · Waktu: 8–10 jam, dicicil dalam satu minggu*

[⬅️ Modul 16](../modul-16-backend-typescript-api-git/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 18 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-18--timescaledb-data-deret-waktu-agregasi-otomatis-retensi--backup)

---

Backend buatanmu di Modul 16 sudah pintar: ia mendengarkan semua pesan, menolak yang melanggar kontrak, dan menjawab pertanyaan lewat API. Sayangnya, ia **pelupa**. Semua yang ia tahu tersimpan di memori laptop, jadi setiap kali server dimulai ulang (termasuk setiap kali kamu menyimpan kode karena `--watch`), gudangnya kosong lagi. Ia juga hanya mengingat bacaan **terakhir** setiap perangkat. Pertanyaan sederhana seperti "berapa rata-rata suhu kemarin?" atau "jam berapa tanah kebun paling kering minggu ini?" tidak bisa ia jawab. Minggu ini kamu memberinya **ingatan jangka panjang**: sebuah **database**.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Setiap kali server dimulai ulang, `GET /devices` kosong lagi. | Backend v0.1 menyimpan data di memori, dan memori hilang saat program berhenti. | **Database PostgreSQL** yang menyimpan setiap pesan di disk (Konsep 1, Praktik 5) |
| "Berapa rata-rata suhu kemarin?" tidak bisa dijawab. | Hanya bacaan terakhir yang diingat; riwayatnya dibuang. | Tabel `readings` berisi semua bacaan, lalu ditanya dengan **SQL** (Konsep 3–8, Praktik 4) |
| Memasang server database terdengar rumit. | Pemasang database biasa punya banyak langkah dan berbeda di setiap sistem operasi. | **Docker "secukupnya"**: satu perintah menjalankan PostgreSQL yang sama di Windows dan macOS (Konsep 2, Kemenangan Cepat, Praktik 1) |
| Jam di data membingungkan: perangkat menulis jam UTC, kamu membaca WIB. | Waktu disimpan dan ditampilkan dengan zona yang berbeda. | Kolom **`timestamptz`** dan cara menampilkan WIB dengan benar (Konsep 9, Praktik 4) |
| Pesan yang sama kadang tiba dua kali. | Pengirim yang memakai MQTT QoS 1 (misalnya MQTTX sekarang dan jembatan broker di Modul 27 kelak) mengirim ulang pesan kalau tanda terimanya hilang. | Kunci **`(device_id, ts)`** dan **`ON CONFLICT DO NOTHING`**: kiriman ganda hanya tersimpan sekali (Konsep 10, Praktik 6) |
| Bentuk tabel akan berubah dari modul ke modul. | Mengubah tabel dengan tangan tidak tercatat dan sulit diulang di laptop lain. | **Migrasi bernomor**: file SQL di repositori yang dijalankan berurutan (Konsep 5, Praktik 3) |
| Aplikasi lain belum bisa meminta riwayat. | API v0.1 hanya punya bacaan terbaru. | **`GET /devices/:id/readings?from=&to=`** (Praktik 7) |

Di akhir minggu, **backend v0.2** menyimpan setiap `telemetry`, `status`, `vitals`, dan perintah ke database PostgreSQL yang berjalan di laptopmu. Kamu bisa mematikan server, menyalakannya lagi besok, dan riwayatnya tetap ada. Kamu menulis SQL untuk "rata-rata suhu per hari selama 7 hari terakhir" tanpa sontekan, membuktikan bahwa pesan yang dikirim dua kali hanya tersimpan sekali, dan membaca riwayat itu dari **Bruno** lewat API baru.

![Peta jalan Modul 17. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 3 Backend dan data, Modul 16 sampai 21, disorot dengan bingkai hijau. Modul 1 sampai 16 bertanda selesai, Modul 18 sampai 21 berwarna hijau, dan Modul 17 ditandai KAMU DI SINI dengan catatan: ingatan jangka panjang, PostgreSQL lewat Docker, SQL, riwayat lewat API. Di bawahnya, kotak Modul 17 minggu ini, 8 sampai 10 jam dicicil, dengan Kit A + B (Node 1, Node 2, dan gateway Pi dari Modul 12–16) atau laptop saja. Daftar kegiatan: pemanasan ulang JavaScript, yaitu waktu, ?. dan ??, spread, try/catch, dan teks templat; persiapan Docker Desktop, cukup sekali; Kemenangan Cepat, database pertamamu menjawab; Praktik 1, Docker secukupnya, yaitu kontainer, log, dan volume; Praktik 2, DBeaver sebagai jendela ke database; Praktik 3, skema lewat migrasi 001; Praktik 4, SQL dasar dengan data latihan 7 hari; Praktik 5, backend v0.2 menyimpan semua pesan MQTT; Praktik 6, kiriman ganda tersimpan sekali; Praktik 7, API riwayat dan perintah yang tercatat; dan Tambahan, README v0.2 dan pull request ke main. Praktik 4, 5, 6, 7, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: hampir semua pekerjaan minggu ini ada di laptop, dan database-nya berjalan di Docker Desktop; perangkat keras tidak wajib karena Praktik 4 memakai data latihan dan simulator Modul 16 menggantikan perangkat sungguhan.](aset/peta-jalan-modul-17.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Hampir semua pekerjaan minggu ini ada di laptop.** Setiap kotak perintah disertai keterangan tempatnya: **terminal VS Code** (di folder `backend`), **Docker Desktop**, **DBeaver**, **Bruno**, **MQTTX**, atau **psql** (jendela SQL di dalam kontainer database). Alamat Pi `192.168.1.37`, `device_id` Node 1 `a4cf12e5b7c0`, dan `device_id` Node 2 `246f28b1c7d4` hanya contoh; pakai milikmu sendiri.
> - **Perangkat keras tidak wajib.** Praktik 4 memakai **data latihan** 7 hari yang dibuat oleh skrip modul ini, jadi kamu bisa belajar SQL tanpa menunggu seminggu. Praktik 5–7 butuh pesan sungguhan: dari Node 1 dan Node 2, atau dari **simulator Modul 16** (`alat/simulator-perangkat.js`) dengan `f00d00000001` sebagai pengganti `device_id` Node 1.
> - **Belum punya Raspberry Pi?** Ikuti **jalur laptop** seperti Modul 12–16: broker berjalan di laptop, dan alamat `mqtt://192.168.1.37:1883` diganti dengan alamat broker laptopmu. Database-nya memang berjalan di laptop, di jalur mana pun.
> - **Kotak Hasilnya.** Kode TypeScript dan SQL modul ini sudah dijalankan penulis di laptop Windows dengan Node.js 24, broker MQTT lab, Node 1 dan Node 2 tiruan, dan server PostgreSQL lab. Keluaran perintah `docker` dan tampilan Docker Desktop ditulis berdasarkan dokumentasi resmi dan kode sumber Docker, lalu ditandai **contoh** (lihat 📚). Tanggal, jam, `id`, dan angka milidetik di layarmu tentu berbeda.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di VS Code, DBeaver, browser, dan Bruno. **Kecuali di terminal:** menghentikan program yang sedang berjalan tetap **Ctrl + C**. Perintah terminal sama persis di Windows dan macOS, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Sandi database tidak pernah di-*commit*.** Sandi itu hanya ditulis di perintah `docker run` (sekali) dan di file `.env` backend, yang sudah masuk `.gitignore` sejak Modul 16. Yang ikut ke GitHub hanya `.env.example` dengan sandi contoh.
> 2. **Database hanya dibuka untuk laptop itu sendiri** (`127.0.0.1:5432`), bukan untuk seluruh jaringan WiFi. Membuka database ke jaringan butuh kunci yang lebih kuat, dan itu urusan Modul 26–27.
> 3. **`DELETE` dan `UPDATE` tanpa `WHERE` mengubah SEMUA baris.** Selalu tulis `WHERE` lebih dulu, dan berlatihlah di baris perangkat latihan (`f00d…`), bukan di data perangkatmu.
> 4. **Volume adalah datamu.** Kontainer boleh dihapus dan dibuat ulang, tetapi volume `rumahpintar-data` berisi semua tabel dan baris. Jangan menghapus volume kecuali kamu memang ingin mulai dari nol.
> 5. **Bentuk tabel hanya diubah lewat file migrasi.** Tabel yang diubah dengan klik di DBeaver tidak tercatat di repositori sehingga laptop lain (dan dirimu bulan depan) tidak tahu perubahannya.

Ritme modul ini sama dengan Modul 1–16. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🐳 Persiapan: memasang Docker Desktop (30–45 menit, sekali saja)](#-persiapan-memasang-docker-desktop-3045-menit-sekali-saja)
5. [🏆 Kemenangan Cepat: database pertamamu menjawab (20 menit)](#-kemenangan-cepat-database-pertamamu-menjawab-20-menit)
6. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Mengapa database](#1-mengapa-database-papan-pengumuman-dan-buku-arsip) · [2 Docker](#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari) · [3 Tabel](#3-tabel-baris-kolom-tipe-dan-kunci-utama) · [4 Relasi & skema](#4-relasi-dan-skema-rumah-pintar-mini-tabel-yang-saling-menunjuk) · [5 Migrasi](#5-migrasi-bernomor-riwayat-bentuk-tabel-ikut-git) · [6 `SELECT`](#6-sql-bertanya-select-where-order-by-dan-limit) · [7 Mengubah data](#7-sql-mengubah-data-insert-update-dan-delete) · [8 `GROUP BY` & `JOIN`](#8-meringkas-dan-menggabungkan-group-by-fungsi-agregat-dan-join) · [9 Waktu](#9-waktu-timestamptz-utc-dan-wib) · [10 Dari backend](#10-dari-backend-pool-parameter-1-dan-kiriman-ganda)
7. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Docker](#praktik-1--docker-secukupnya-kontainer-log-dan-volume-25-menit) · [2 DBeaver](#praktik-2--dbeaver-jendela-ke-database-30-menit) · [3 Migrasi](#praktik-3--skema-rumah-pintar-mini-lewat-migrasi-40-menit) · [4 SQL dasar](#praktik-4--sql-dasar-dengan-data-latihan-7-hari-75-menit) · [5 Backend v0.2](#praktik-5--backend-v02-menyimpan-semua-pesan-mqtt-40-menit) · [6 Kiriman ganda](#praktik-6--kiriman-ganda-tersimpan-sekali-20-menit) · [7 API riwayat](#praktik-7--api-riwayat-dan-perintah-yang-tercatat-40-menit)
8. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
9. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
10. [🧩 Tantangan mandiri](#-tantangan-mandiri)
11. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
12. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-17)

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan mengapa sistem IoT butuh database**, bukan sekadar memori program atau file CSV.
2. **Menjalankan PostgreSQL dengan satu perintah Docker**, memeriksa kontainernya, lalu menghentikan dan menyalakannya lagi tanpa kehilangan data.
3. **Membuka database dengan DBeaver dan psql**, lalu menjalankan SQL dan membaca hasilnya.
4. **Merancang tabel Rumah Pintar Mini** (`devices`, `readings`, `commands`, `device_health`, `users`, `rules`) dengan tipe data, kunci utama, dan kunci tamu yang tepat, lalu membuatnya lewat **migrasi bernomor**.
5. **Menulis SQL untuk pertanyaan nyata**: memilih dan menyaring baris, mengurutkan, menggabungkan dua tabel, dan meringkas per hari, termasuk **rata-rata suhu per hari selama 7 hari terakhir** tanpa sontekan.
6. **Menangani waktu dengan benar**: menyimpan `timestamptz`, membedakan waktu perangkat dari waktu tiba, dan menampilkan WIB tanpa salah tanggal.
7. **Mencegah kiriman ganda tersimpan dua kali** dengan kunci `(device_id, ts)` dan `ON CONFLICT DO NOTHING`.
8. **Menyambungkan backend ke database** dengan library `pg`, *pool*, dan parameter `$1` sehingga **backend v0.2** menyimpan semua pesan MQTT dan menyediakan API riwayat `GET /devices/:id/readings`.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Laptop yang kuat menjalankan Docker** | Windows 10 versi 22H2 atau Windows 11 versi 23H2 ke atas (64-bit), **RAM 8 GB**, dan virtualisasi aktif di BIOS/UEFI; atau Mac dengan **macOS 14 Sonoma** atau lebih baru. Sisakan ruang kosong paling tidak **5 GB**. Laptop di bawah syarat ini: baca 🔬 "Database di Raspberry Pi". |
| **Docker Desktop 4.95** atau lebih baru | Dipasang di bagian 🐳 Persiapan, sebaiknya **sehari sebelum** mulai karena di Windows bisa diminta *restart*. |
| **DBeaver Community 26.2** atau lebih baru | "Jendela" ke database, dipasang di Praktik 2 (sekitar 114 MB di Windows, 124–125 MB di macOS). |
| **Backend v0.1 dari Modul 16** | Folder `rumah-pintar-mini/backend` yang sudah di-*merge* ke `main` di Modul 16 ➕ D, beserta Node.js 24, VS Code, Git, dan Bruno. |
| **Broker MQTT** dan **Node 1 / Node 2** | Gateway Pi dari Modul 12 (atau broker laptop) dan perangkat dari Modul 14–15. Boleh diganti simulator Modul 16 (`alat/simulator-perangkat.js`). |
| **MQTTX** | Dari Modul 11, untuk mengirim pesan uji di Praktik 6. |
| **Koneksi internet** | Image database (paket siap pakai untuk Docker, Konsep 2) sekitar **552 MB** (Mac Apple silicon sekitar 535 MB), DBeaver sekitar 114–125 MB, ditambah `npm install`. Kalau kuota terbatas, unduh di jaringan yang lega. |

Versi yang dipakai modul ini (Oktober 2026): **Docker Desktop 4.95** (Docker Engine 29.8.2), image **`timescale/timescaledb:2.30.2-pg17`** (PostgreSQL 17.11 + TimescaleDB 2.30.2), **DBeaver Community 26.2.3**, **pg 8.23.1**, **@types/pg 8.23.1**, dan semua alat Modul 16 (Node.js 24, fastify 5.12.7, zod 4.6.7, typescript 7.0.2). Docker Desktop dan DBeaver terbit beberapa minggu sekali; versi yang lebih baru boleh dipakai. Image database dan library npm sengaja dikunci pada versi tertulis supaya hasilmu sama dengan modul ini.

> [!NOTE]
> **Mengapa image TimescaleDB, bukan PostgreSQL polos?** TimescaleDB adalah PostgreSQL yang diberi tambahan untuk data deret waktu (data yang terus bertambah menurut waktu, seperti bacaan sensor). Minggu ini kita hanya memakai bagian PostgreSQL-nya: semua SQL di modul ini adalah SQL PostgreSQL biasa. Tambahan TimescaleDB baru dipakai di Modul 18, dan karena sudah terpasang sejak sekarang, kamu tidak perlu memindahkan data nanti.

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, dan folder repositori `belajar-iot`.

Seperti Modul 16, setiap modul Fase 3 dibuka dengan pemanasan JavaScript. Kode backend minggu ini memakai lima kemampuan yang belum banyak kamu latih: menghitung **waktu** dengan `Date`, tanda **`?.`** dan **`??`** untuk nilai yang mungkin kosong, ***spread*** (`...`) untuk menyalin objek, **`try … catch`** untuk menangkap kegagalan saat menunggu, dan **teks templat banyak baris** untuk menulis SQL di dalam kode. Pemanasan ini mengulang kelimanya dalam satu file kecil. Ketik kodenya sendiri (jangan disalin-tempel), jalankan setelah setiap langkah, lalu cocokkan hasilnya.

**Siapkan foldernya.** Buka folder repositori **`belajar-iot`** di VS Code, klik dulu ruang kosong di panel Explorer, buat folder baru **`modul-17`**, lalu jalankan di terminal:

```text
cd modul-17
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` diperlukan oleh langkah 4, yang memakai `await` di luar fungsi (sama seperti pemanasan Modul 16). Lalu buat file **`pemanasan.js`** di folder `modul-17`.

### Langkah 1 — Waktu dengan `Date`

Database dan kontrak data menyimpan waktu dalam UTC, sedangkan kamu berpikir dalam WIB (Konsep 9 membahasnya lebih dalam). Di JavaScript, sebuah **titik waktu** disimpan oleh objek `Date`. Ketik di `pemanasan.js`:

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 17

// 1. Waktu dengan Date
const waktu = new Date("2026-10-20T10:10:00+07:00"); // pukul 10.10 WIB
console.log(waktu.toISOString()); // titik waktu yang sama, ditulis dalam UTC
const sejam = 60 * 60 * 1000; // satu jam dalam milidetik
const sejamLalu = new Date(waktu.getTime() - sejam);
console.log(sejamLalu.toISOString());
console.log(waktu.toISOString().slice(0, 19) + "Z"); // format kontrak data, tanpa milidetik
```

Simpan (**Ctrl + S**), lalu jalankan di terminal:

```text
node pemanasan.js
```

**Hasilnya:**

```text
2026-10-20T03:10:00.000Z
2026-10-20T02:10:00.000Z
2026-10-20T03:10:00Z
```

- `new Date("…+07:00")` membaca waktu WIB, dan **`toISOString()`** selalu menuliskannya dalam UTC (akhiran `Z`). Pukul 10.10 WIB sama dengan pukul 03.10 UTC: titik waktunya sama, cara menulisnya yang berbeda.
- **`getTime()`** memberi titik waktu itu sebagai angka milidetik. Mundur satu jam berarti mengurangi `60 * 60 * 1000` milidetik, lalu membuat `Date` baru dari hasilnya. API riwayat di Praktik 7 menghitung "satu jam terakhir" dengan cara ini.
- **`.slice(0, 19)`** mengambil 19 karakter pertama (sampai detik), lalu huruf `Z` ditambahkan lagi. Hasilnya persis format `ts` di kontrak data, yang dipakai backend saat menjawab API.

### Langkah 2 — `?.` dan `??`

Node 1 dan Node 2 tidak punya kolom yang persis sama: Node 1 punya `cahaya`, Node 2 punya `tekanan`. Database butuh `null` untuk kolom yang tidak ada, bukan `undefined`. Tambahkan di paling bawah:

```js
// 2. ?. dan ??
const node1 = { suhu: 28.5, cahaya: 2310 };
const node2 = { suhu: 29.4, tekanan: 1008.6 };
console.log(node1.tekanan ?? null); // tidak ada -> null
console.log(node2.tekanan ?? null);
const kosong = null;
console.log(kosong?.cahaya ?? null); // kosong bernilai null: ?. berhenti tanpa galat
console.log(0 ?? 99, 0 || 99); // ?? hanya mengganti null dan undefined; || juga mengganti 0
```

Jalankan lagi. **Hasilnya** (baris-baris baru di bawah hasil langkah 1):

```text
null
1008.6
null
0 99
```

- **`a ?? b`** berarti "pakai `a`, kecuali `a` kosong (`null` atau `undefined`); kalau kosong, pakai `b`". `node1.tekanan` tidak ada (`undefined`), jadi hasilnya `null`.
- **`a?.kolom`** berarti "baca `kolom` dari `a`, kecuali `a` sendiri kosong". Tanpa tanda tanya, `kosong.cahaya` langsung membuat program berhenti dengan `TypeError: Cannot read properties of null (reading 'cahaya')`.
- Baris terakhir menunjukkan jebakan: `0 || 99` menghasilkan `99` karena `||` menganggap `0` sama dengan "kosong". Padahal `0` bisa bacaan sungguhan, misalnya `cahaya` saat gelap. Itulah sebabnya backend memakai `??`, bukan `||`.

### Langkah 3 — *Spread*: salin, lalu ganti satu kolom

Saat menjawab API, backend menyalin setiap baris dari database lalu mengganti satu kolomnya. Tambahkan:

```js
// 3. Spread: salin semua kolom, lalu ganti satu
const baris = { ts: waktu, suhu: 28.5, kelembapan: 71 };
const untukApi = { ...baris, ts: baris.ts.toISOString().slice(0, 19) + "Z" };
console.log(untukApi);
console.log(baris.ts instanceof Date); // yang asli tidak berubah
```

**Hasilnya** (baris-baris baru):

```text
{ ts: '2026-10-20T03:10:00Z', suhu: 28.5, kelembapan: 71 }
true
```

`...baris` (tiga titik, disebut ***spread***) menuangkan semua kolom `baris` ke objek baru. Kolom `ts` yang ditulis sesudahnya menimpa `ts` hasil tuangan. Objek aslinya tidak berubah: `baris.ts` masih berupa `Date` (`instanceof Date` bernilai `true`). Node.js mencetak objek dengan petik tunggal; itu hanya cara menampilkan, bukan JSON.

### Langkah 4 — Menunggu, dan menangkap kegagalan

Setiap pertanyaan ke database adalah "janji" (*Promise*) yang ditunggu dengan `await` (pemanasan Modul 16, langkah 5). Bedanya, janji ke database bisa **ingkar**, misalnya karena kontainer database mati. Tambahkan:

```js
// 4. Menunggu, dan menangkap kegagalan
function tanyaDatabase(hidup) {
  return new Promise((berhasil, gagal) => {
    setTimeout(() => {
      if (hidup) berhasil([{ suhu: 28.5 }]);
      else gagal(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    }, 300);
  });
}
for (const hidup of [true, false]) {
  try {
    const hasil = await tanyaDatabase(hidup);
    console.log("berhasil:", hasil.length, "baris");
  } catch (galat) {
    console.log("gagal:", galat.message);
  }
}
console.log("program tetap berjalan");
```

**Hasilnya** (baris-baris baru):

```text
berhasil: 1 baris
gagal: connect ECONNREFUSED 127.0.0.1:5432
program tetap berjalan
```

`tanyaDatabase` berpura-pura menjadi database: setelah 0,3 detik, janjinya ditepati (`berhasil`) atau diingkari (`gagal`). Kalau janji yang ditunggu `await` diingkari, `await` "melempar" galat. **`try … catch`** menangkapnya: kode di `catch` berjalan, lalu program terus berjalan. Tanpa `try … catch`, galat itu menghentikan seluruh program. Pola ini dipakai backend saat database tidak bisa dihubungi: ia menjawab `503` dengan pesan yang jelas, bukan ikut mati (Praktik 7).

### Langkah 5 — Teks templat banyak baris

Kalimat SQL di dalam kode backend sering panjang, jadi ditulis di dalam ***backtick*** (tombol di kiri angka 1) supaya boleh terdiri atas beberapa baris. Tambahkan:

```js
// 5. Teks templat banyak baris
const id = "a4cf12e5b7c0";
const kalimat = `SELECT ts, suhu
FROM readings
WHERE device_id = '${id}'`;
console.log(kalimat);
const nakal = "x'; DELETE FROM readings; --";
console.log(`WHERE device_id = '${nakal}'`);
```

**Hasilnya** (baris-baris baru):

```text
SELECT ts, suhu
FROM readings
WHERE device_id = 'a4cf12e5b7c0'
WHERE device_id = 'x'; DELETE FROM readings; --'
```

Baris terakhir adalah peringatan. Kalau sebuah nilai dari luar (misalnya `device_id` dari alamat API) ditempelkan ke kalimat SQL dengan `${…}`, orang iseng bisa menyelipkan perintah kedua, di sini `DELETE FROM readings`. Karena itu, backend hanya memakai teks templat untuk kalimat SQL yang **tetap**. Nilainya selalu dikirim terpisah lewat `$1`, `$2`, dan seterusnya (Konsep 10).

**Uji dirimu (10 menit).** Tanpa melihat kunci:

1. Tambahkan satu baris yang mencetak waktu **24 jam** sebelum `waktu`, dalam format kontrak data (seperti baris ketiga langkah 1).
2. Tebak dulu, baru jalankan: apa hasil `undefined ?? "kosong"`, `"" ?? "kosong"`, dan `"" || "kosong"`? Cetak setiap hasil dengan `console.log(JSON.stringify(…))` supaya teks kosong tampil sebagai `""`, bukan sebagai baris kosong yang mudah terlewat.
3. Dengan *spread*, buat salinan `node2` yang punya satu kolom tambahan, `baterai: null`.

<details>
<summary>Kunci uji dirimu</summary>

```js
// uji 1: mundur 24 jam
console.log(new Date(waktu.getTime() - 24 * sejam).toISOString().slice(0, 19) + "Z");

// uji 3: salin node2, tambah satu kolom
const lengkap = { ...node2, baterai: null };
console.log(lengkap);
```

1. Hasilnya `2026-10-19T03:10:00Z`: tanggalnya mundur satu hari, jamnya tetap.
2. `undefined ?? "kosong"` menghasilkan `"kosong"`. `"" ?? "kosong"` menghasilkan `""` (teks kosong) karena teks kosong bukan `null` atau `undefined`. `"" || "kosong"` menghasilkan `"kosong"` karena `||` menganggap teks kosong sama dengan "kosong".
3. Hasilnya `{ suhu: 29.4, tekanan: 1008.6, baterai: null }`.

</details>

Pemanasan selesai. File `pemanasan.js` disimpan ke GitHub bersama catatan SQL-mu di ➕ C.

> ➡️ **Lanjut** ke [🐳 Persiapan: memasang Docker Desktop](#-persiapan-memasang-docker-desktop-3045-menit-sekali-saja).

## 🐳 Persiapan: memasang Docker Desktop (30–45 menit, sekali saja)

> 🖥️ **Alat yang dipakai:** **browser** (mengunduh), **PowerShell sebagai Administrator** (khusus Windows, sekali), **Docker Desktop**, dan **terminal VS Code**.

**Docker Desktop** adalah aplikasi yang bisa menjalankan "kotak program siap pakai" bernama **kontainer** (*container*). Konsep 2 menjelaskan cara kerjanya; untuk sekarang, cukup tahu bahwa dengan Docker, server database PostgreSQL bisa dijalankan dengan **satu perintah**, dan perintah yang sama berlaku di Windows maupun macOS. Bagian ini cukup dikerjakan sekali. Kalau bisa, kerjakan sehari sebelum mulai karena di Windows kamu mungkin diminta *restart*.

Docker Desktop **gratis** untuk pemakaian pribadi, pendidikan (sekolah dan kampus), dan usaha kecil (kurang dari 250 karyawan dan pendapatan kurang dari 10 juta dolar AS per tahun). Instansi pemerintah dan perusahaan besar memerlukan langganan berbayar.

<details>
<summary><b>Windows</b>: WSL 2, lalu Docker Desktop</summary>

1. **Periksa syaratnya.** Tekan **Win + R**, ketik `winver`, lalu tekan **Enter**: versinya harus **22H2** (Windows 10) atau **23H2** ke atas (Windows 11). Buka **Task Manager** (**Ctrl + Shift + Esc**) → tab **Performance** → **CPU**: di kanan bawah harus tertulis **Virtualization: Enabled**. Kalau tertulis **Disabled**, virtualisasi perlu dinyalakan di BIOS/UEFI laptop (caranya berbeda di setiap merek; cari "aktifkan virtualisasi" dan nama merek laptopmu, atau minta bantuan orang yang biasa mengurus BIOS).
2. **Siapkan WSL 2** (lapisan Linux di dalam Windows yang dipakai Docker). Klik kanan tombol **Start** → **Terminal (Admin)** (atau **Windows PowerShell (Admin)**), jawab **Yes** di jendela izin, lalu jalankan:

   ```text
   wsl --update
   ```

   Kalau jawabannya menyebut WSL belum terpasang, jalankan `wsl --install --no-distribution`. Kalau diminta *restart*, *restart* dulu. Periksa dengan `wsl --version`: baris pertama `WSL version: …` harus 2.1.5 atau lebih baru. Ini satu-satunya langkah yang butuh hak Administrator; tutup jendela Admin sesudahnya.
3. **Unduh** pemasangnya dari halaman resmi [docs.docker.com/desktop/setup/install/windows-install](https://docs.docker.com/desktop/setup/install/windows-install/): klik tombol **Docker Desktop for Windows - x86_64**. Yang terunduh adalah `Docker Desktop Installer.exe` (ukurannya ratusan MB).
4. **Pasang.** Klik dua kali `Docker Desktop Installer.exe`. Saat ditanya cara pemasangan, biarkan pilihan bawaannya, yaitu pemasangan **per-user** (untuk akunmu sendiri; tidak butuh hak Administrator). Kalau muncul kotak centang **Use WSL 2 instead of Hyper-V**, biarkan tercentang. Ikuti langkahnya sampai selesai, lalu klik **Close**.
5. **Nyalakan.** Docker Desktop tidak menyala sendiri setelah dipasang. Ketik `Docker Desktop` di menu **Start**, lalu buka. Di jendela **Docker Subscription Service Agreement**, klik **Accept** (Docker Desktop tidak mau berjalan tanpa persetujuan ini).
6. **Masuk (*sign in*) tidak wajib.** Kalau Docker Desktop menawarkan untuk masuk atau mengisi survei sambutan, pilih untuk melanjutkan tanpa masuk atau melewatinya. Labelnya bisa sedikit berbeda antarversi.
7. Tunggu sampai Docker Desktop selesai menyala: ikon paus di area notifikasi (kanan bawah, dekat jam) berhenti bergerak, dan jendela utama menampilkan daftar **Containers** yang masih kosong.

</details>

<details>
<summary><b>macOS</b>: Docker Desktop untuk Apple silicon atau Intel</summary>

1. **Periksa syaratnya.** Klik logo Apple di pojok kiri atas layar → **About This Mac**. Versi macOS harus **14 (Sonoma)** atau lebih baru. Lihat juga baris **Chip**: kalau tertulis **Apple M…**, Mac-mu memakai Apple silicon; kalau ada baris **Processor** bertuliskan **Intel**, Mac-mu memakai chip Intel.
2. **Unduh** dari halaman resmi [docs.docker.com/desktop/setup/install/mac-install](https://docs.docker.com/desktop/setup/install/mac-install/): klik **Docker Desktop for Mac with Apple silicon** atau **Docker Desktop for Mac with Intel chip**, sesuai langkah 1. Yang terunduh adalah `Docker.dmg`.
3. **Pasang.** Klik dua kali `Docker.dmg`, lalu seret ikon **Docker** ke folder **Applications**.
4. **Nyalakan.** Buka folder **Applications**, lalu klik dua kali **Docker**. Di jendela **Docker Subscription Service Agreement**, klik **Accept**. Docker Desktop versi baru tidak meminta kata sandi Mac saat pertama dibuka.
5. **Masuk (*sign in*) tidak wajib.** Lewati tawaran masuk dan survei sambutan.
6. Tunggu sampai ikon paus di bilah menu (kanan atas) berhenti bergerak.

</details>

**Periksa dari terminal.** Tutup VS Code sepenuhnya lalu buka lagi (supaya terminalnya mengenal perintah `docker` yang baru dipasang), buka terminal baru (**Terminal → New Terminal**), lalu jalankan:

```text
docker --version
docker run hello-world
```

**Hasilnya** (contoh; angka versi di layarmu boleh lebih baru, dan kode `build`-nya ikut berubah kalau versinya berbeda):

```text
Docker version 29.8.2, build 7fc2dff
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
…: Pull complete
Digest: sha256:…
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.
…
```

Kalimat `Hello from Docker!` berarti semuanya beres: Docker mengunduh "cetakan" kecil bernama `hello-world`, menjalankannya sebagai kontainer, dan menampilkan pesannya. Di Mac Apple silicon, baris `(amd64)` tertulis `(arm64v8)`. Kalau yang muncul justru galat, buka 🚨 "Docker Desktop tidak mau menyala, atau `docker` tidak dikenal".

> [!TIP]
> **Docker Desktop harus menyala setiap kali kamu bekerja.** Secara bawaan, Docker Desktop tidak ikut menyala saat laptop dihidupkan. Buka aplikasinya dulu sebelum mengerjakan modul ini, atau nyalakan otomatis: ikon roda gigi (**Settings**) → **General** → centang **Start Docker Desktop when you sign in to your computer**.

> ➡️ **Docker Desktop sudah menjawab `Hello from Docker!`?** Lanjut ke [🏆 Kemenangan Cepat](#-kemenangan-cepat-database-pertamamu-menjawab-20-menit).

## 🏆 Kemenangan Cepat: database pertamamu menjawab (20 menit)

> 🖥️ **Alat yang dipakai:** **Docker Desktop** (harus sudah menyala) dan **terminal VS Code** (folder mana pun).

Dua puluh menit lagi, sebuah server database PostgreSQL sungguhan berjalan di laptopmu, dan kamu sudah bertanya jam berapa sekarang kepadanya. Sebagian besar waktunya habis untuk mengunduh, bukan mengetik.

### Langkah 1 — Pilih sandi database dan periksa loketnya (3 menit)

1. **Pilih sandi** untuk akun utama database (namanya `postgres`). Pakai huruf, angka, dan tanda minus saja (tanpa spasi, `@`, `:`, atau `/`) karena nanti sandi ini ditulis di dalam sebuah alamat. Contoh di modul ini: `ganti-sandi-ini`. **Pakai sandimu sendiri**, lalu catat di tempat yang aman (bukan di repositori GitHub).
2. **Periksa apakah loket (port) 5432 masih kosong.** Port 5432 adalah nomor loket bawaan PostgreSQL. Kalau di laptopmu sudah ada PostgreSQL lain (misalnya dari kuliah), loket itu sudah terpakai. Jalankan di terminal VS Code:

   **Windows:**

   ```text
   netstat -ano | findstr :5432
   ```

   **macOS:**

   ```text
   sudo lsof -nP -iTCP:5432 -sTCP:LISTEN
   ```

   Di macOS, `sudo` meminta sandi akun Mac-mu; tanpa `sudo`, PostgreSQL yang berjalan atas nama pengguna lain tidak terlihat. Kalau tidak muncul apa-apa, loketnya kosong, jadi lanjutkan. Di Windows, abaikan baris yang tidak berisi `LISTENING`, misalnya `127.0.0.1:54324 … TIME_WAIT`: itu sambungan lain yang nomor loketnya kebetulan diawali `5432`. Kalau muncul baris `LISTENING` dengan alamat berakhiran tepat `:5432` (misalnya `0.0.0.0:5432`) di Windows, atau baris `(LISTEN)` di macOS, pakai loket **5433**: di perintah langkah 2, ganti `127.0.0.1:5432:5432` dengan `127.0.0.1:5433:5432`, dan sepanjang modul ini pakai port `5433` setiap kali tertulis `5432` untuk laptop (DBeaver dan `DATABASE_URL`). Periksa dulu loket 5433 dengan perintah yang sama (ganti `5432` dengan `5433`): laptop yang pernah dipasangi dua versi PostgreSQL biasanya sudah memakai 5432 dan 5433. Kalau 5433 juga terpakai, pakai 5434 dengan cara yang sama.

### Langkah 2 — Jalankan database dengan satu perintah (5–10 menit)

Salin perintah di bawah ke tab kosong di VS Code dulu (**Ctrl + N**), lalu ganti `ganti-sandi-ini` dengan sandimu (dan `127.0.0.1:5432:5432` dengan `127.0.0.1:5433:5432` kalau langkah 1 memintanya). Setelah itu, salin hasilnya ke terminal **dalam satu baris**, tekan **Enter**, lalu tutup tab tadi tanpa menyimpannya (**Don't Save**):

```text
docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
```

Perintahnya memang panjang. Bedahnya ada di Konsep 2. Singkatnya: "jalankan di latar belakang (`-d`) sebuah kontainer bernama `rumahpintar-db` dari cetakan `timescale/timescaledb:2.30.2-pg17`, buka loket 5432 hanya untuk laptop ini, beri sandi, buat database `rumahpintar`, simpan datanya di lemari `rumahpintar-data`, dan nyalakan lagi otomatis setiap kali Docker menyala". `TIMESCALEDB_TELEMETRY=off` meminta TimescaleDB tidak mengirim statistik pemakaian ke pembuatnya.

**Hasilnya** (contoh; baris `Pull complete` muncul beberapa kali, dan unduhan sekitar 552 MB butuh beberapa menit, lebih lama kalau internetmu lambat):

```text
Unable to find image 'timescale/timescaledb:2.30.2-pg17' locally
2.30.2-pg17: Pulling from timescale/timescaledb
…: Pull complete
…: Pull complete
Digest: sha256:b346edcdb51a1fd6020e3965e0bd1c9f3406fa6d5fbce1e28f4852587ef934e2
Status: Downloaded newer image for timescale/timescaledb:2.30.2-pg17
3f9c2a7d41e85b06c2d9a1f47e3b8c5d90a6e2f17b4c8d3e5f60a1b2c3d4e5f6
```

Baris terakhir yang panjang adalah **ID kontainer** barumu (milikmu berbeda). Unduhan hanya terjadi sekali: lain kali, cetakannya sudah ada di laptop.

### Langkah 3 — Pastikan kontainernya berjalan (2 menit)

```text
docker ps
```

**Hasilnya** (contoh):

```text
CONTAINER ID   IMAGE                               COMMAND                  CREATED          STATUS          PORTS                      NAMES
3f9c2a7d41e8   timescale/timescaledb:2.30.2-pg17   "docker-entrypoint.s…"   38 seconds ago   Up 37 seconds   127.0.0.1:5432->5432/tcp   rumahpintar-db
```

Yang penting: kolom **STATUS** diawali `Up` (menyala), **PORTS** berisi `127.0.0.1:5432->5432/tcp` (loket laptop 5432 diteruskan ke loket 5432 di dalam kontainer), dan **NAMES** berisi `rumahpintar-db`. Di Docker Desktop, kontainer yang sama tampil di daftar **Containers** dengan titik hijau.

### Langkah 4 — Tanyakan jam kepada database (5 menit)

Masuk ke **psql**, jendela SQL milik PostgreSQL, yang sudah ada di dalam kontainer:

```text
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
```

Artinya: "jalankan (`exec`) program `psql` di dalam kontainer `rumahpintar-db` secara interaktif (`-it`), sebagai pengguna `postgres`, di database `rumahpintar`". Di dalam kontainer, psql tidak meminta sandi. Tanda bahwa kamu sudah di dalam psql adalah baris yang diawali `rumahpintar=#`. Ketik perintah SQL di sana, **akhiri dengan titik koma**, lalu tekan **Enter**:

```sql
SELECT now();
SET TIME ZONE 'Asia/Jakarta';
SELECT now();
```

**Hasilnya** (contoh; jam di layarmu tentu berbeda):

```text
psql (17.11)
Type "help" for help.

rumahpintar=# SELECT now();
              now              
-------------------------------
 2026-10-20 03:15:42.367129+00
(1 row)

rumahpintar=# SET TIME ZONE 'Asia/Jakarta';
SET
rumahpintar=# SELECT now();
              now              
-------------------------------
 2026-10-20 10:15:58.104227+07
(1 row)

rumahpintar=# 
```

Perhatikan akhirannya. Jawaban pertama berakhiran `+00`: database menjawab dengan jam **UTC** (waktu dunia), yang tujuh jam di belakang WIB. Setelah `SET TIME ZONE 'Asia/Jakarta'`, pertanyaan yang sama dijawab dengan akhiran `+07` dan cocok dengan jam dinding WIB. (Tinggal di WITA atau WIT? Jam ini tetap WIB, satu atau dua jam di belakang jammu.) Yang berubah hanya cara menuliskan jamnya, bukan jamnya sendiri. Konsep 9 membahas mengapa ini penting, termasuk nama zona untuk WITA dan WIT. Keluar dari psql dengan:

```text
\q
```

### Langkah 5 — Kontainernya tetap hidup (2 menit)

Tutup terminal itu, buka lagi, lalu jalankan `docker ps` sekali lagi: `rumahpintar-db` masih `Up`. Database tidak bergantung pada terminal yang menjalankannya. Ia terus berjalan di latar belakang sampai kamu menghentikannya (Praktik 1) atau Docker Desktop dimatikan.

🎉 **Selamat!** Kamu baru saja menjalankan server database sungguhan, persis seperti yang dipakai aplikasi-aplikasi besar, dengan satu perintah. Minggu ini kamu mengisinya dengan tabel Rumah Pintar Mini, belajar bertanya dengan SQL, dan menyambungkannya ke backend.

> [!TIP]
> **Tidak jalan?**
>
> - `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine…` (Windows) atau `Cannot connect to the Docker daemon…` / `failed to connect to the docker API at unix://…` (macOS) → Docker Desktop belum menyala. Buka aplikasinya, tunggu sampai ikon paus berhenti bergerak, lalu ulangi.
> - `docker: Error response from daemon: Conflict. The container name "/rumahpintar-db" is already in use…` → kontainernya sudah pernah dibuat. Jangan menjalankan `docker run` lagi; nyalakan dengan `docker start rumahpintar-db`.
> - `ports are not available` atau `port is already allocated` → loket 5432 sudah dipakai program lain. Kembali ke langkah 1 nomor 2 dan pakai loket 5433 (atau 5434 kalau 5433 juga terpakai). Perintah `docker run` yang gagal ini meninggalkan kontainer yang tidak bisa menyala, jadi hapus dulu dengan `docker rm rumahpintar-db` sebelum menjalankan ulang langkah 2.
> - psql menjawab `database "rumahpintar" does not exist` → bagian `-e POSTGRES_DB=rumahpintar` terlewat. Lihat 🚨 "Database `rumahpintar` tidak ada, atau sandi baru tidak berlaku".
> - Di psql, setelah **Enter** tidak ada jawaban dan awal barisnya berubah dari `rumahpintar=#` menjadi `rumahpintar-#` → titik komanya terlupa, jadi psql masih menunggu lanjutan kalimatnya. Ketik `;` lalu tekan **Enter**. Kalau kalimatnya ternyata salah ketik, psql menjawab dengan `ERROR` yang tidak merusak apa pun; ketik ulang dengan benar.
> - Pesan yang menyebut `toomanyrequests` dan `pull rate limit` → Docker Hub membatasi unduhan tanpa masuk (*sign in*) menjadi 100 per 6 jam untuk satu alamat internet, dan batas itu bisa habis di jaringan kampus atau kelas yang dipakai bersama. Coba lagi beberapa jam kemudian, pakai jaringan lain, atau masuk ke akun Docker gratis (batasnya 200).
> - Pesan galat lain: lihat 🚨 "Kontainer `rumahpintar-db` berhenti sendiri atau tidak mau menyala".

> ➡️ **Selesai Kemenangan Cepat?** Baca [Konsep 1](#1-mengapa-database-papan-pengumuman-dan-buku-arsip) dan [Konsep 2](#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari), lalu kerjakan praktik sesuai urutan di awal 🧠.

## 🧠 Konsep "Mengapa"

Ada sepuluh konsep. Tidak perlu dibaca sekaligus sebelum praktik. Urutannya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–2 → Praktik 1 (database dan Docker)
2. Konsep 3–5 → Praktik 2–3 (tabel, relasi, migrasi)
3. Konsep 6–9 → Praktik 4 (SQL dan waktu)
4. Konsep 10 → Praktik 5–7 (backend menyimpan dan membaca database)

Kotak ⬆️/➡️ di akhir setiap praktik dan di akhir setiap kelompok konsep di atas mengantarmu ke langkah berikutnya.

### 1. Mengapa database: papan pengumuman dan buku arsip

Bayangkan sebuah kantor. Di dinding ada **papan pengumuman** yang selalu menampilkan kabar terbaru: siapa yang sedang bertugas, suhu ruang server sekarang. Papan itu cepat dilihat, tetapi setiap kabar baru menimpa yang lama, dan kalau papannya diturunkan, isinya hilang. Di lemari ada **buku arsip**: setiap kejadian ditulis berurutan, diberi tanggal, tidak pernah ditimpa, dan bisa dicari kapan saja. Backend v0.1 (Modul 16) hanya punya papan pengumuman, yaitu gudang di memori. Minggu ini ia mendapat buku arsip, yaitu **database**.

Mengapa tidak menulis saja setiap pesan ke file CSV atau JSON? Untuk satu atau dua bacaan sehari, itu cukup. Untuk Rumah Pintar Mini, yang mengirim satu bacaan setiap 10 detik dari Node 1 (lebih dari 8.600 baris sehari, belum termasuk Node 2), file biasa cepat kewalahan:

| Kebutuhan | Memori (Modul 16) | File CSV/JSON | Database (PostgreSQL) |
| :--- | :--- | :--- | :--- |
| Data tetap ada setelah server dimulai ulang | ❌ hilang | ✅ | ✅ |
| Menjawab "rata-rata suhu kemarin" | ❌ hanya bacaan terakhir | Bisa, tetapi kamu harus menulis program untuk setiap pertanyaan, dan seluruh file dibaca ulang setiap kali | ✅ satu kalimat **SQL**, dan database tahu cara mencarinya dengan cepat |
| Menolak data yang salah bentuk | — | ❌ apa pun yang ditulis tetap tersimpan | ✅ tipe kolom, `NOT NULL`, `CHECK`, dan kunci menolaknya |
| Menolak kiriman ganda | — | ❌ | ✅ kunci utama (Konsep 10) |
| Banyak program menulis bersamaan | — | ❌ isi file bisa campur aduk | ✅ dirancang untuk itu |
| Selamat dari listrik padam di tengah menulis | — | ❌ file bisa terpotong | ✅ setiap perubahan selesai seluruhnya atau tidak sama sekali (transaksi, Konsep 5) |

**Database** (basis data) di sini berarti program khusus yang tugasnya menyimpan dan mencari data. Namanya kadang ditulis **DBMS** (*Database Management System*, sistem pengelola database). Program yang kita pakai adalah **PostgreSQL** (dibaca "post-gres-kyu-el", sering disingkat "Postgres"): gratis, sumber terbuka, dikembangkan sejak 1996 (cikal bakalnya proyek POSTGRES di University of California, Berkeley, 1986), dan dipakai mulai dari proyek kecil sampai perusahaan besar. Kita bertanya kepadanya dengan **SQL** (*Structured Query Language*), bahasa tanya jawab database yang sudah dipakai sejak 1970-an dan dimengerti hampir semua database.

Di Modul 16, komentar di `gudang.ts` meramalkan bahwa gudang itu kelak diganti database. Ternyata keduanya lebih berguna kalau dipakai bersama karena tugasnya berbeda. Backend v0.2 memakai keduanya. Gudang memori tetap menjadi **papan pengumuman** untuk keadaan terbaru (`GET /devices`, `/latest`, perintah) karena papan itu cepat. Database menjadi **buku arsip** untuk semua yang pernah terjadi (`GET /devices/:id/readings`, laporan, grafik di Fase 4).

![Diagram papan pengumuman dan buku arsip: backend v0.2 memakai keduanya, papan untuk keadaan terbaru dan buku arsip untuk semua yang pernah terjadi. Atas, dari kiri: Mosquitto, broker MQTT, mengirim pesan rpm/# ke kartu hijau backend v0.2 (Fastify + TypeScript ringan, di laptop); pesan yang lolos kontrak ditulis ke dua tempat sekaligus. Kanan atas, catatan: pesan yang melanggar kontrak ditolak (DITOLAK di log), tidak masuk papan dan tidak masuk arsip. Dari backend turun dua panah. Panah kiri, setiap pesan baru menimpa yang lama, menuju kartu Papan pengumuman = gudang di memori (Modul 16): satu kartu per perangkat, isinya keadaan terbaru. Kartu a4cf12e5b7c0 (Node 1) memuat ts 03:10:00Z suhu 28.5 dan ts 03:10:10Z suhu 28.5 yang dicoret dengan tanda ditimpa, lalu ts 03:10:20Z suhu 28.6 bertanda terbaru; kartu 246f28b1c7d4 (Node 2) punya kartunya sendiri, juga hanya yang terbaru. Dipakai: GET /devices, /latest, dan perintah. Kotak di bawahnya: cepat, tetapi kosong lagi saat server dimulai ulang karena memori hilang saat program berhenti. Panah kanan berwarna biru, setiap bacaan baru menambah satu baris, menuju kartu biru Buku arsip = database PostgreSQL (baru minggu ini): tabel readings, satu baris per bacaan, berurutan, dengan kolom device_id, ts, dan suhu; tiga baris a4cf12e5b7c0 pada 03:10:00Z (28.5), 03:10:10Z (28.5), dan 03:10:20Z (28.6), ditambah, tidak pernah ditimpa, lalu baris baru untuk setiap bacaan berikutnya. Dipakai: GET /devices/:id/readings, laporan, dan grafik di Fase 4. Kotak di bawahnya: tetap ada walaupun server dimatikan karena disimpan di disk, bukan di memori.](aset/papan-dan-arsip.png)

### 2. Docker secukupnya: cetakan, kontainer, loket, dan lemari

Memasang PostgreSQL langsung di Windows atau macOS bisa, tetapi langkahnya berbeda di setiap sistem operasi, ia menjadi layanan yang selalu menyala, dan sulit dibersihkan tanpa sisa. **Docker** menawarkan cara lain: program dikemas bersama semua kebutuhannya menjadi satu paket siap jalan, lalu dijalankan di "ruang" tersendiri yang terpisah dari sistem laptopmu. Empat istilah cukup untuk minggu ini:

| Istilah Docker | Bayangkan | Di Kemenangan Cepat |
| :--- | :--- | :--- |
| **Image** (cetakan) | Cetakan kue: berisi semua yang dibutuhkan (sistem Linux mini, PostgreSQL, TimescaleDB), tidak pernah berubah, bisa dipakai berkali-kali | `timescale/timescaledb:2.30.2-pg17`, diunduh sekali dari Docker Hub |
| **Container** (kontainer) | Kue yang dicetak dari cetakan itu: program yang sedang berjalan. Boleh dibuang dan dicetak ulang kapan saja | `rumahpintar-db` |
| **Port** (loket) | Loket dari luar kontainer ke dalamnya | `-p 127.0.0.1:5432:5432`: loket 5432 di laptop (hanya untuk laptop ini) diteruskan ke loket 5432 di dalam kontainer |
| **Volume** (lemari) | Lemari yang berdiri **di luar** kue: isinya tetap ada walaupun kuenya dibuang | `-v rumahpintar-data:/var/lib/postgresql/data`: semua tabel dan baris disimpan di volume `rumahpintar-data` |

Seluruh perintah `docker run` dari Kemenangan Cepat, bagian demi bagian:

| Bagian | Artinya |
| :--- | :--- |
| `docker run` | Cetak kontainer baru dari sebuah image, lalu jalankan. |
| `-d` | *Detached* (terlepas): berjalan di latar belakang, terminal langsung bebas lagi. |
| `--name rumahpintar-db` | Nama kontainer, supaya bisa dipanggil dengan nama (bukan ID panjang). |
| `-p 127.0.0.1:5432:5432` | Loket `alamat-laptop:port-laptop:port-kontainer`. Alamat `127.0.0.1` berarti hanya program di laptop ini yang bisa masuk; tanpa alamat itu, loketnya terbuka untuk seluruh jaringan WiFi. |
| `-e POSTGRES_PASSWORD=…` | `-e` mengisi "formulir" untuk kontainer (*environment variable*, variabel lingkungan). Ini sandi akun `postgres`. |
| `-e POSTGRES_DB=rumahpintar` | Buat database bernama `rumahpintar` saat pertama kali menyala. |
| `-e TIMESCALEDB_TELEMETRY=off` | Jangan kirim statistik pemakaian ke pembuat TimescaleDB. |
| `-v rumahpintar-data:/var/lib/postgresql/data` | Lemari `rumahpintar-data` dipasang di folder tempat PostgreSQL menyimpan datanya. Docker membuat lemarinya sendiri kalau belum ada. |
| `--restart unless-stopped` | Nyalakan lagi kontainer ini setiap kali Docker Desktop menyala, kecuali kamu sendiri yang menghentikannya. |
| `timescale/timescaledb:2.30.2-pg17` | Image yang dipakai: `timescale/timescaledb` dengan *tag* (label versi) `2.30.2-pg17`, artinya TimescaleDB 2.30.2 di atas PostgreSQL 17. |

Dua hal yang sering menjebak. Pertama, **formulir `POSTGRES_…` hanya dibaca saat lemari masih kosong**, yaitu saat kontainer pertama kali dibuat. Mengganti sandi di perintah `docker run` berikutnya tidak mengubah sandi database yang sudah ada. Kedua, **kontainer dan image adalah Linux**. Di Windows dan macOS, Docker Desktop diam-diam menjalankan Linux kecil (lewat WSL 2 di Windows) untuk menampung kontainernya. Karena itulah Docker butuh RAM yang cukup dan virtualisasi yang aktif.

Minggu ini kita hanya memakai Docker "secukupnya": `run`, `ps`, `logs`, `stop`, `start`, dan `exec`. Isi dalam kontainer, membuat image sendiri, dan menjalankan banyak kontainer sekaligus dengan Docker Compose dibedah di Modul 26.

![Diagram Docker secukupnya dengan empat istilah, cetakan, kontainer, loket, dan lemari: yang terjadi saat perintah docker run di Kemenangan Cepat dijalankan di laptopmu. Kiri atas, kartu Docker Hub, gudang image di internet, berisi Cetakan (image) timescale/timescaledb:2.30.2-pg17: tidak pernah berubah, dipakai berkali-kali, diunduh sekali, sekitar 552 MB. Kanan atas, kartu jaringan WiFi: tidak bisa masuk (hanya 127.0.0.1), untuk perangkat lain, misalnya HP atau laptop teman; garis putus-putusnya berhenti di tepi bingkai laptop dengan tanda silang merah. Panah docker run, cetak dan jalankan, turun dari cetakan ke dalam bingkai Laptop (Windows atau macOS), yang memuat bingkai Docker Desktop, Linux kecil di dalam laptop (lewat WSL 2 di Windows). Di dalam Docker Desktop ada kotak biru Kontainer (container) rumahpintar-db: PostgreSQL 17 + TimescaleDB 2.30.2, program yang sedang berjalan, boleh dibuang dan dicetak ulang dari cetakannya kapan saja, dengan folder data /var/lib/postgresql/data. Di sebelah kirinya, di luar kontainer, tetapi masih di dalam Docker Desktop, kotak Lemari (volume) rumahpintar-data: semua tabel dan baris disimpan di sini; data tetap ada walaupun kontainer dibuang; lemari itu berdiri di luar kontainer dan dipasang di folder data kontainer lewat garis bertanda -v. Di tepi kanan kontainer ada port 5432. Di luar Docker Desktop, masih di laptop, kotak Loket (port) 127.0.0.1:5432, hanya untuk program di laptop ini, dengan panah ke port 5432 di kontainer. Dua tamu di laptop masuk lewat loket itu: backend v0.2 dengan DATABASE_URL, dan DBeaver dengan Host 127.0.0.1, Port 5432. Di bawahnya, psql dari terminal dengan perintah docker exec -it; panahnya langsung masuk ke kontainer lewat docker exec, tanpa lewat loket.](aset/docker-cetakan-kontainer.png)

> ➡️ **Sudah membaca Konsep 1–2?** Lanjut ke [Praktik 1](#praktik-1--docker-secukupnya-kontainer-log-dan-volume-25-menit).

### 3. Tabel, baris, kolom, tipe, dan kunci utama

Database PostgreSQL menyimpan data dalam **tabel**. Sebuah tabel mirip satu lembar spreadsheet, dengan aturan yang lebih ketat:

- Setiap **kolom** punya nama dan **tipe** yang ditentukan sejak awal. Kolom `suhu` hanya menerima angka. Menulis teks `'panas'` ke kolom itu langsung ditolak.
- Setiap **baris** adalah satu catatan, misalnya satu bacaan sensor.
- Sebuah sel boleh berisi **`NULL`**, yang artinya "tidak ada nilainya" (bacaan gagal, atau perangkat tidak punya sensor itu). `NULL` berbeda dengan `0`: suhu `0` berarti nol derajat, sedangkan `NULL` berarti tidak tahu.

Tipe yang dipakai minggu ini:

| Tipe | Isinya | Contoh kolom |
| :--- | :--- | :--- |
| `text` | teks, panjang bebas | `device_id`, `fw`, `lokasi` |
| `integer` | bilangan bulat | `kelembapan`, `cahaya`, `tanah`, `rssi` |
| `double precision` | bilangan desimal (pecahan) | `suhu`, `tekanan`, `lat`, `lng` |
| `boolean` | `true` atau `false` | `gerak`, `aktif` |
| `timestamptz` | titik waktu lengkap dengan zona waktu (Konsep 9) | `ts`, `diterima`, `terakhir_dilihat` |
| `jsonb` | potongan JSON | `nilai` perintah, `kondisi` aturan |

Selain tipe, kolom bisa diberi aturan tambahan (*constraint*): **`NOT NULL`** (wajib diisi), **`DEFAULT`** (nilai otomatis kalau tidak diisi, misalnya `now()` untuk waktu sekarang), dan **`CHECK`** (syarat yang harus dipenuhi, misalnya `lat BETWEEN -90 AND 90`).

Yang terpenting adalah **kunci utama** (*primary key*): kolom, atau gabungan kolom, yang nilainya **tidak boleh kembar** di seluruh tabel sehingga setiap baris punya "nomor KTP" sendiri. Di tabel `devices`, kunci utamanya `device_id`: tidak mungkin ada dua baris untuk perangkat yang sama. Di tabel `readings`, kunci utamanya **gabungan** `(device_id, ts)`: satu perangkat hanya punya satu bacaan untuk satu waktu. Kunci gabungan inilah yang nanti menolak kiriman ganda (Konsep 10).

Tabel `devices`, seperti yang ditulis di file migrasi Praktik 3:

```sql
CREATE TABLE devices (
  device_id        text PRIMARY KEY CHECK (device_id ~ '^[0-9a-f]{12}$'),
  jenis            text NOT NULL DEFAULT 'belum-diketahui' CHECK (jenis IN ('node1', 'node2', 'belum-diketahui')),
  nama             text,             -- nama yang mudah diingat, misalnya 'Node 1 ruang tamu' (diisi manusia)
  lokasi           text,             -- misalnya 'ruang tamu' atau 'kebun belakang'
  lat              double precision CHECK (lat BETWEEN -90 AND 90),
  lng              double precision CHECK (lng BETWEEN -180 AND 180),
  status           text NOT NULL DEFAULT 'belum-diketahui',
  terakhir_dilihat timestamptz,      -- waktu server saat pesan terakhir perangkat ini tiba
  dibuat           timestamptz NOT NULL DEFAULT now()
);
```

Cara membacanya: `CREATE TABLE devices (…)` membuat tabel bernama `devices`. Setiap baris kode di dalam kurung adalah satu kolom: namanya, tipenya, lalu aturannya. `CHECK (device_id ~ '^[0-9a-f]{12}$')` (tanda `~` berarti "cocok dengan pola") memakai pola yang sama dengan skema Zod Modul 16 (12 digit heksadesimal huruf kecil): database ikut menjaga kontrak data. Tanda `--` mengawali komentar SQL, sama seperti `//` di TypeScript. `lat` dan `lng` (garis lintang dan bujur) serta `lokasi` disiapkan untuk peta perangkat di Fase 4. Nama tabel di kurikulum ini memakai bahasa Inggris (`devices`, `readings`), sesuai Silabus, sedangkan nama kolom mengikuti kontrak data (`suhu`, `kelembapan`).

### 4. Relasi dan skema Rumah Pintar Mini: tabel yang saling menunjuk

Tabel `readings` tidak menyimpan nama atau lokasi perangkat; ia hanya menyimpan `device_id`. Kalau ingin tahu lokasi perangkat sebuah bacaan, kita melihat baris dengan `device_id` yang sama di tabel `devices`. Hubungan seperti ini disebut **relasi**, dan kolom `readings.device_id` disebut **kunci tamu** (*foreign key*) karena menunjuk kunci utama tabel lain:

```sql
device_id text NOT NULL REFERENCES devices (device_id)
```

`REFERENCES devices (device_id)` adalah janji: "setiap `device_id` di sini harus sudah ada di tabel `devices`". Database menolak bacaan dari perangkat yang tidak terdaftar, dan menolak menghapus perangkat yang masih punya bacaan. Supaya pesan dari perangkat baru tidak ditolak, backend v0.2 selalu memastikan baris `devices`-nya ada lebih dulu (Praktik 5).

Mengapa tidak menulis nama dan lokasi perangkat langsung di setiap baris `readings`? Karena satu perangkat punya ribuan bacaan. Kalau perangkatnya dipindah, kita cukup mengubah **satu** baris di `devices`, bukan ribuan baris `readings`. Data yang sama hanya disimpan di satu tempat.

Skema Rumah Pintar Mini terdiri atas enam tabel:

| Tabel | Isinya | Kunci utama | Diisi oleh |
| :--- | :--- | :--- | :--- |
| `devices` | satu baris per perangkat: jenis, nama, lokasi, status, kapan terakhir terdengar | `device_id` | backend, otomatis saat pesan pertama tiba; nama dan lokasi diisi manusia |
| `readings` | satu baris per `telemetry`: semua kolom sensor kontrak 1.2 | `(device_id, ts)` | backend, dari `rpm/<id>/telemetry` |
| `device_health` | satu baris per `vitals`: RSSI, *uptime*, sisa memori | `(device_id, ts)` | backend, dari `rpm/<id>/vitals` |
| `commands` | satu baris per perintah dari API, beserta hasil `ack`-nya | `id` (id perintah) | backend, dari `POST /devices/:id/command` |
| `users` | akun pengguna dan perannya (`admin` atau `viewer`) | `id` (nomor otomatis) | disiapkan sekarang, dipakai Modul 20 |
| `rules` | aturan otomatis, misalnya "suhu di atas 30 → kipas nyala" | `id` (nomor otomatis) | disiapkan sekarang, dipakai Modul 19 |

Tabel `readings` sengaja dibuat **lebar**: satu kolom untuk setiap kolom sensor kontrak, baik milik Node 1 (`cahaya`, `gerak`, `level_air`, `tanah_rs485`, `ec`) maupun Node 2 (`tekanan`, `baterai`). Kolom yang tidak dimiliki sebuah perangkat berisi `NULL`. Dengan begitu, bacaan semua perangkat ada di satu tabel dan bisa dibandingkan dengan satu **kueri** (pertanyaan dalam SQL). Kolom `ts` adalah waktu bacaan **dari perangkat**, sedangkan `diterima` adalah waktu pesan **tiba di backend**. Perbedaannya penting di Konsep 9.

![Diagram skema Rumah Pintar Mini, enam tabel: tiga tabel menunjuk devices lewat kunci tamu device_id, sedangkan users dan rules disiapkan sekarang dan dipakai nanti. Tengah, tabel devices, dari rpm/<id>/status dan pesan pertama, dengan kunci utama device_id (text) dan kolom jenis, nama, lokasi (text), lat dan lng (double precision), status (text), serta terakhir_dilihat dan dibuat (timestamptz). Kiri, tabel readings, dari rpm/<id>/telemetry, dengan kunci utama gabungan device_id (text, sekaligus kunci tamu) dan ts (timestamptz), lalu diterima (timestamptz), fw (text), suhu (double precision), kelembapan, cahaya, dan tanah (integer), gerak (boolean), level_air (integer), tekanan, suhu_tanah, baterai, dan tanah_rs485 (double precision), serta ec (integer). Kanan atas, tabel device_health, dari rpm/<id>/vitals, dengan kunci utama gabungan device_id (sekaligus kunci tamu) dan ts, lalu rssi, uptime_s, dan heap_free (integer). Kanan bawah, tabel commands, dari POST /devices/:id/command, dengan kunci utama id (text), kunci tamu device_id, lalu dikirim (timestamptz), target (text), nilai (jsonb), ack_ok (boolean), ack_pesan (text), dan lama_ms (integer). Garis biru dari device_id di readings, device_health, dan commands berujung panah di device_id tabel devices. Tengah bawah, kelompok bergaris putus-putus disiapkan sekarang, dipakai nanti: tabel users, dipakai Modul 20, dengan id integer otomatis (kunci utama), email text unik, nama, peran (text, isinya admin atau viewer), dan dibuat; serta tabel rules, dipakai Modul 19, dengan id integer otomatis (kunci utama), nama, aktif (boolean), kondisi dan aksi (jsonb), dan dibuat. Keterangan kiri bawah: ikon kunci berarti kunci utama, nilainya tidak boleh kembar; dua ikon kunci yang dirangkum kurung gabungan, seperti device_id dan ts di readings dan device_health, berarti yang tidak boleh kembar adalah pasangannya; ikon panah berarti kunci tamu, menunjuk devices.device_id; garis putus-putus berarti disiapkan, belum dipakai.](aset/skema-rumah-pintar.png)

### 5. Migrasi bernomor: riwayat bentuk tabel ikut Git

Tabel bisa dibuat dengan mengetik `CREATE TABLE …` di DBeaver, atau bahkan dengan klik-klik di jendela desainnya. Masalahnya, perubahan itu hanya terjadi di database laptopmu. Repositori tidak mencatatnya. Laptop baru, rekan tim, server di Modul 27, bahkan dirimu sendiri bulan depan tidak tahu urutan perubahan apa saja yang pernah dibuat.

**Migrasi** (*migration*) menyelesaikan masalah itu. Setiap perubahan bentuk tabel ditulis sebagai file SQL **bernomor** di folder `backend/migrasi/`, misalnya `001_skema_awal.sql`, lalu `002_tambah_kolom_x.sql` di modul berikutnya. Sebuah program kecil (`npm run migrasi`) menjalankan file-file itu berurutan dan mencatat yang sudah dijalankan di tabel khusus `schema_migrations`. Menjalankannya lagi aman karena file yang sudah tercatat dilewati. Laptop baru cukup menjalankan `npm run migrasi` sekali untuk mendapatkan semua tabel dalam bentuk terbaru.

Dua aturan migrasi:

1. **File yang sudah dijalankan tidak boleh diubah.** Butuh perubahan? Tulis file baru dengan nomor berikutnya. Database lain yang sudah menjalankan file lama tidak akan menjalankannya lagi.
2. **Satu file berhasil seluruhnya, atau tidak berubah sama sekali.** Program migrasi membungkus setiap file dengan **transaksi** (*transaction*): `BEGIN` di awal, `COMMIT` di akhir. Kalau satu perintah di tengah file gagal, `ROLLBACK` membatalkan semua perubahan file itu sehingga tabel tidak tertinggal setengah jadi.

Ada banyak library migrasi siap pakai (misalnya `node-pg-migrate` atau Drizzle Kit). Modul ini sengaja memakai program sekitar empat puluh baris buatan sendiri supaya cara kerjanya terlihat, dan kamu tetap menulis SQL murni.

> ➡️ **Sudah membaca Konsep 3–5?** Lanjut ke [Praktik 2](#praktik-2--dbeaver-jendela-ke-database-30-menit).

### 6. SQL bertanya: `SELECT`, `WHERE`, `ORDER BY`, dan `LIMIT`

Bertanya kepada database selalu diawali `SELECT`. Kalimatnya dibaca hampir seperti bahasa Inggris:

```sql
SELECT ts, suhu, tanah          -- kolom yang ingin dilihat
FROM readings                   -- dari tabel mana
WHERE device_id = 'f00d00000001' -- hanya baris yang memenuhi syarat ini
ORDER BY ts DESC                -- urutkan: waktu terbaru di atas (DESC = menurun, ASC = menaik)
LIMIT 5;                        -- cukup lima baris pertama
```

Jawabannya selalu berbentuk tabel baru walaupun hanya satu baris. Beberapa aturan yang perlu diingat sejak awal:

- **Teks ditulis di antara petik tunggal**: `'f00d00000001'`. Petik ganda (`"…"`) di SQL berarti **nama kolom atau tabel**, bukan teks. Menulis `WHERE device_id = "f00d00000001"` menghasilkan galat `column "f00d00000001" does not exist`.
- **Setiap kalimat SQL diakhiri titik koma** (`;`). Tanpa titik koma, psql menunggu kelanjutannya.
- **Huruf besar-kecil kata kunci bebas**: `SELECT` sama dengan `select`. Kurikulum ini menulis kata kunci SQL dengan huruf besar supaya mudah dibedakan dari nama kolom.
- **`SELECT *`** berarti "semua kolom". Praktis untuk melihat-lihat, tetapi di program sebaiknya sebutkan kolomnya satu per satu.

Syarat di `WHERE` bisa digabung:

| Tulisan | Artinya |
| :--- | :--- |
| `suhu > 30` | lebih dari 30 (juga `<`, `>=`, `<=`, `=`, dan `<>` untuk "tidak sama dengan") |
| `suhu > 30 AND tanah < 40` | kedua syarat terpenuhi |
| `lokasi = 'teras' OR lokasi = 'kebun'` | salah satu terpenuhi; bisa juga `lokasi IN ('teras', 'kebun')` |
| `level_air IS NULL` | sel kosong (`NULL`). Tulisan `level_air = NULL` **tidak** bekerja |
| `ts >= now() - interval '1 hour'` | dalam satu jam terakhir; `interval '1 hour'` adalah lama waktu satu jam, jadi `now() - interval '1 hour'` berarti satu jam sebelum sekarang (Konsep 9) |

### 7. SQL mengubah data: `INSERT`, `UPDATE`, dan `DELETE`

Tiga perintah untuk mengubah isi tabel:

```sql
INSERT INTO devices (device_id, nama, lokasi) VALUES ('f00d000000ff', 'Perangkat coba', 'gudang');
UPDATE devices SET lokasi = 'dapur' WHERE device_id = 'f00d000000ff';
DELETE FROM devices WHERE device_id = 'f00d000000ff';
```

- **`INSERT INTO tabel (kolom…) VALUES (nilai…)`** menambah baris. Kolom yang tidak disebut mendapat nilai `DEFAULT`-nya, atau `NULL`.
- **`UPDATE tabel SET kolom = nilai WHERE …`** mengubah baris yang memenuhi syarat.
- **`DELETE FROM tabel WHERE …`** menghapus baris yang memenuhi syarat.

> [!CAUTION]
> **`UPDATE` dan `DELETE` tanpa `WHERE` mengenai SEMUA baris tabel**, dan database tidak bertanya "yakin?". Kebiasaan aman: tulis dulu `SELECT * FROM devices WHERE device_id = 'f00d000000ff';`, periksa bahwa hanya baris yang dimaksud yang muncul, baru ganti `SELECT * FROM devices` dengan `DELETE FROM devices` (atau dengan `UPDATE devices SET …`), dan biarkan bagian `WHERE`-nya sama persis.

Database juga menjaga relasi (Konsep 4): menghapus perangkat yang masih punya bacaan di `readings` ditolak dengan galat `violates foreign key constraint`. Itu disengaja karena bacaan tanpa perangkat tidak ada artinya.

### 8. Meringkas dan menggabungkan: `GROUP BY`, fungsi agregat, dan `JOIN`

Pertanyaan yang paling berguna jarang berupa "tampilkan baris ini". Biasanya bentuknya "**berapa rata-ratanya**" atau "**kapan paling** …". Untuk itu ada **fungsi agregat**, yang meringkas banyak baris menjadi satu angka: `count(*)` (berapa baris), `avg(suhu)` (rata-rata), `min(tanah)`, `max(suhu)`, dan `sum(…)`.

```sql
SELECT count(*), round(avg(suhu)::numeric, 1), min(suhu), max(suhu)
FROM readings
WHERE device_id = 'f00d00000001';
```

Mengapa `avg(suhu)::numeric`? Kolom `suhu` bertipe `double precision`, sedangkan fungsi `round(…, 1)` (bulatkan ke satu angka di belakang koma) hanya menerima tipe `numeric`. Tanda `::` mengubah tipe sebuah nilai. Tanpa `::numeric`, PostgreSQL menjawab `function round(double precision, integer) does not exist`.

**`GROUP BY`** membuat satu ringkasan untuk setiap kelompok, misalnya satu baris untuk setiap perangkat:

```sql
SELECT device_id, round(avg(suhu)::numeric, 1) AS rata_suhu
FROM readings
GROUP BY device_id;
```

`AS rata_suhu` memberi nama kolom hasilnya (alias). Aturan `GROUP BY`: setiap kolom di `SELECT` harus berupa kolom pengelompokan (di sini `device_id`) atau dibungkus fungsi agregat.

**`JOIN`** menggabungkan dua tabel lewat relasinya. Untuk melihat **lokasi** perangkat di samping rata-rata suhunya, `readings` digabung dengan `devices` pada `device_id` yang sama:

```sql
SELECT d.lokasi, round(avg(r.suhu)::numeric, 1) AS rata_suhu
FROM readings AS r
JOIN devices AS d ON d.device_id = r.device_id
GROUP BY d.lokasi;
```

`readings AS r` memberi tabel nama pendek `r` sehingga `r.suhu` berarti "kolom `suhu` dari tabel `readings`". `ON d.device_id = r.device_id` adalah syarat penggabungannya: setiap bacaan dipasangkan dengan baris perangkatnya.

### 9. Waktu: `timestamptz`, UTC, dan WIB

Kolom `ts` bertipe **`timestamptz`** (*timestamp with time zone*). Nama itu sedikit menipu: PostgreSQL tidak menyimpan zona waktunya. Ia mengubah setiap waktu menjadi **UTC** (waktu dunia) lalu menyimpan satu **titik waktu** yang pasti. Saat ditampilkan, titik itu ditulis menurut **zona waktu sesi** (*session*), yaitu sambungan yang sedang bertanya:

| Yang bertanya | Zona sesinya | `ts` yang sama tampil sebagai |
| :--- | :--- | :--- |
| psql di dalam kontainer | UTC (bawaan server) | `2026-10-20 03:10:00+00` |
| psql setelah `SET TIME ZONE 'Asia/Jakarta'` | WIB | `2026-10-20 10:10:00+07` |
| DBeaver di laptop berzona WIB | zona laptop, dikirim DBeaver saat menyambung | `2026-10-20 10:10:00.000 +0700` |
| Backend (library `pg`) | UTC (bawaan server); tampilan `ts` tidak terpengaruh karena hasilnya objek `Date` JavaScript, sebuah titik waktu | `2026-10-20T03:10:00Z` setelah diubah ke format kontrak, yaitu `toISOString()` tanpa milidetik (🔁 langkah 1) |

Keempatnya titik waktu yang **sama**, hanya ditulis berbeda. Perangkat mengirim `ts` dalam UTC (huruf `Z` di akhir `2026-10-20T03:10:00Z`, kontrak data bagian 4), dan PostgreSQL menyimpannya apa adanya. Akhiran `+00`, `+07` (di DBeaver `+0700`), atau `Z` selalu memberi tahu zonanya, jadi baca akhiran itu sebelum menyimpulkan apa pun.

Jebakan paling sering muncul saat **mengelompokkan per hari**. Hari menurut UTC dimulai pukul 07.00 WIB. `ts::date` mengambil tanggal menurut **zona sesi**: di psql dalam kontainer dan di backend (UTC), bacaan pukul 00.00–06.59 WIB masuk ke tanggal **kemarin**, sedangkan di DBeaver (zona laptop) hasilnya kebetulan benar. Supaya hasilnya sama di jendela mana pun, sebutkan zonanya sendiri dan ubah dulu ke jam WIB:

```sql
(ts AT TIME ZONE 'Asia/Jakarta')::date            -- tanggal menurut WIB, misalnya 2026-10-20
date_trunc('day', now(), 'Asia/Jakarta')          -- pukul 00.00 WIB hari ini
date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'   -- pukul 00.00 WIB tujuh hari lalu
```

Untuk rentang waktu, pakai **`ts >= awal AND ts < akhir`** (awal ikut dihitung, akhir tidak). Bentuk ini tidak pernah menghitung satu bacaan dua kali di dua rentang yang bersambung, berbeda dengan `BETWEEN` yang ikut menghitung kedua ujungnya. Tinggal di WITA atau WIT? Untuk data perangkatmu sendiri, ganti `'Asia/Jakarta'` dengan `'Asia/Makassar'` (WITA, UTC+8) atau `'Asia/Jayapura'` (WIT, UTC+9). Khusus data latihan Praktik 4, tetap pakai `'Asia/Jakarta'`: data itu dibuat menurut hari WIB, jadi dengan zona lain hari pertamanya berisi kurang dari 144 bacaan (138 dengan `'Asia/Makassar'`, 132 dengan `'Asia/Jayapura'`) dan angkanya tidak cocok dengan contoh.

Satu lagi: `ts` adalah waktu **bacaan diambil** (dari jam NTP perangkat), sedangkan `diterima` adalah waktu pesan **tiba di backend**. Biasanya keduanya terpaut kurang dari satu detik (`ts` dari perangkat tidak memuat milidetik), tetapi pesan yang ditahan dulu lalu diteruskan, misalnya oleh jembatan broker di Modul 27 saat sambungan internet putus, bisa tiba beberapa menit kemudian. Laporan selalu memakai `ts` karena itulah waktu kejadian yang sebenarnya.

![Diagram waktu: timestamptz, UTC, dan WIB. Atas, satu titik waktu, empat cara menulis: kotak biru bacaan Node 1 di tabel readings, ts = 2026-10-20T03:10:00Z, disimpan sebagai satu titik waktu (UTC), bercabang ke empat jendela. Pertama, psql di kontainer, zona sesi UTC (bawaan server), tanpa pengaturan apa pun: 2026-10-20 03:10:00+00. Kedua, psql setelah SET TIME ZONE 'Asia/Jakarta', zona sesi WIB: 2026-10-20 10:10:00+07. Ketiga, DBeaver di laptop, zona sesi mengikuti zona laptop (WIB) yang dikirim DBeaver saat menyambung: 2026-10-20 10:10:00.000 +0700, bentuk bawaan DBeaver lengkap dengan milidetik. Keempat, backend / API, library pg menghasilkan objek Date yang ditulis dalam format kontrak, tanpa milidetik: 2026-10-20T03:10:00Z. Akhiran +00, +07, +0700, dan Z diberi warna biru. Catatan: keempatnya titik waktu yang sama, hanya ditulis berbeda; akhiran +00 atau Z berarti UTC, +07 atau +0700 berarti WIB. Bawah, jebakan saat mengelompokkan per hari: hari menurut UTC baru dimulai pukul 07.00 WIB. Dua garis waktu sejajar: UTC (UTC+0) dari pukul 17.00 sampai 07.00, dan WIB (UTC+7) dari pukul 00.00 sampai 14.00. Pita tanggal UTC terbagi menjadi 19 Oktober (tanggal UTC) dan 20 Oktober (tanggal UTC) tepat di pukul 00.00 UTC; pita tanggal WIB seluruhnya 20 Oktober (tanggal WIB). Wilayah biru di kiri menandai bacaan pukul 00.00–06.59 WIB, sejajar dengan pukul 17.00–23.59 UTC tanggal 19, dan garis putus-putus di antara angka jam bertanda menunjukkan pergantian hari UTC = pukul 07.00 WIB. Kesimpulan di bawah: tanda silang merah, ts::date di sesi UTC (psql di kontainer, backend) memasukkan bacaan pukul 00.00–06.59 WIB ke 19 Oktober, salah; tanda centang hijau, (ts AT TIME ZONE 'Asia/Jakarta')::date memasukkannya ke 20 Oktober di jendela mana pun, benar. Baris abu-abu di bawahnya mengingatkan bahwa di DBeaver (sesi WIB) ts::date kebetulan benar, jadi jangan bergantung pada zona sesi.](aset/waktu-utc-wib.png)

> ➡️ **Sudah membaca Konsep 6–9?** Lanjut ke [Praktik 4](#praktik-4--sql-dasar-dengan-data-latihan-7-hari-75-menit).

### 10. Dari backend: *pool*, parameter `$1`, dan kiriman ganda

Backend berbicara dengan PostgreSQL lewat library **`pg`**. Membuka sambungan baru ke database cukup lambat (ada perkenalan dan pemeriksaan sandi setiap kali), jadi `pg` menyediakan ***pool***: sebuah "kolam" berisi beberapa sambungan yang dibuka sekali lalu dipakai bergiliran. Backend v0.2 memakai satu *pool* berisi paling banyak lima sambungan untuk semua pekerjaannya.

Nilai dari luar (isi pesan MQTT, alamat API) **tidak pernah** ditempelkan langsung ke kalimat SQL. Bayangkan backend menulis `"… WHERE device_id = '" + id + "'"`, lalu seseorang mengirim `id` berisi `x'; DELETE FROM readings; --`. Kalimat SQL-nya berubah menjadi dua perintah, dan perintah kedua menghapus semua bacaan. Serangan seperti ini disebut ***SQL injection*** (penyusupan SQL). Obatnya **parameter**: kalimat SQL memakai tanda `$1`, `$2`, dan seterusnya, lalu nilainya dikirim terpisah sebagai daftar:

```ts
await pool.query("SELECT ts, suhu FROM readings WHERE device_id = $1 AND ts >= $2", [id, sejak]);
```

Database menerima kalimat dan nilainya di "amplop" yang berbeda, jadi isi `id` selalu diperlakukan sebagai data, tidak pernah sebagai perintah.

Terakhir, **kiriman ganda**. Node 1 sendiri menerbitkan `telemetry` dengan QoS 0 (Modul 11), jadi ia tidak pernah mengirim ulang. Namun, pesan yang sama tetap bisa tiba dua kali di backend. Penyebabnya adalah pengirim yang memakai QoS 1, misalnya MQTTX (Praktik 6) atau, di Modul 27, jembatan broker Pi → server internet yang menahan pesan selama sambungan putus lalu meneruskannya. QoS 1 menjamin pesan sampai "**paling sedikit** sekali": kalau `PUBACK` hilang di jalan (WiFi putus sesaat), pesan yang sama dikirim ulang sehingga backend bisa menerimanya dua kali. Tanpa penjaga, bacaan itu tersimpan dua kali dan rata-rata harian menjadi melenceng. Penjaganya ada dua:

1. **Kunci utama `(device_id, ts)`** di tabel `readings`. Kiriman ulang membawa `ts` yang sama persis (waktu bacaan dari perangkat, bukan waktu tiba), jadi barisnya kembar dengan yang sudah tersimpan.
2. **`ON CONFLICT (device_id, ts) DO NOTHING`** di perintah `INSERT`: "kalau kuncinya sudah ada, jangan simpan dan jangan anggap sebagai galat".

```sql
INSERT INTO readings (device_id, ts, fw, suhu) VALUES ('f00d00000099', '2026-10-20T03:10:00Z', '1.4.0', 28.5)
ON CONFLICT (device_id, ts) DO NOTHING;
```

Contoh ini cukup dibaca dulu: perangkat uji `f00d00000099` belum terdaftar di `devices`, jadi kalau dijalankan sekarang, kunci tamu menolaknya dengan `violates foreign key constraint` (Konsep 4). Di Praktik 6, MQTTX mengirim dua kali bacaan `f00d00000099` dengan `ts` yang sama ini, dan backend menjalankan `INSERT … ON CONFLICT` seperti di atas untuk setiap kiriman (perangkatnya didaftarkan backend lebih dulu). Kiriman pertama dijawab `INSERT 0 1`, seperti yang juga ditulis psql: angka terakhir adalah jumlah baris yang masuk (satu), sedangkan angka `0` di tengah selalu nol dan boleh diabaikan. Kiriman kedua dijawab `INSERT 0 0` (tidak ada yang masuk, tetapi juga tidak ada galat). Jadi, kalau contoh ini kamu jalankan sendiri di antara Praktik 6.1 dan 6.4 (sebelum perangkat uji dibersihkan), jawabannya langsung `INSERT 0 0`. Di backend, `pg` melaporkan angka yang sama sebagai `rowCount`, dan backend v0.2 menulis `kiriman ganda dilewati` ke log saat angkanya 0. Kalau `ts` dibuat oleh server (waktu tiba), kiriman ulang akan punya `ts` berbeda dan lolos sebagai baris baru. Karena itulah kontrak data meminta perangkat sendiri yang menulis `ts`.

![Diagram urutan kiriman ganda yang tersimpan sekali: QoS 1 berarti sampai paling sedikit sekali, dan kunci utama (device_id, ts) bersama ON CONFLICT … DO NOTHING menyaring kiriman ulang. Empat garis hidup dari kiri ke kanan: Perangkat uji f00d00000099 (pesan dikirim dari MQTTX), Broker (Mosquitto di Pi), Backend v0.2 (telinga MQTT, hijau), dan readings (tabel di PostgreSQL, biru). 1, perangkat uji menerbitkan rpm/f00d00000099/telemetry dengan ts 2026-10-20T03:10:00Z dan QoS 1 ke broker. PUBACK dari broker hilang di jalan karena WiFi putus sesaat, ditandai silang merah. Broker meneruskan kiriman 1 ke backend, yang menjalankan INSERT … ON CONFLICT (device_id, ts) DO NOTHING ke readings; jawabannya INSERT 0 1, rowCount 1, baris baru tersimpan. Sementara itu pengirimnya, digambarkan dengan jam pasir, tidak menerima PUBACK, jadi setelah menyambung lagi ia mengirim ulang pesan yang sama. 2, pesan yang sama persis, dengan ts tetap 2026-10-20T03:10:00Z, tiba lagi di broker dan diteruskan sebagai kiriman 2. Backend menjalankan INSERT yang sama; jawabannya INSERT 0 0, rowCount 0, tidak ada yang masuk, bukan galat. Catatan kiri: Node 1 sendiri menerbitkan telemetry dengan QoS 0 (kontrak 1.2), jadi tidak pernah mengirim ulang; pengirim QoS 1 adalah MQTTX di Praktik 6, dan kelak jembatan broker Pi ke server internet di Modul 27. Kotak log backend berisi baris kiriman ganda dilewati: f00d00000099 2026-10-20T03:10:00Z. Kotak isi readings: satu baris, f00d00000099 dengan ts 03:10:00Z, satu baris, bukan dua. Kiri bawah, kotak pembanding merah muda bergaris putus-putus, kalau ts = waktu tiba di backend: dua baris f00d00000099, 03:10:00.021Z dari kiriman 1 dan 03:10:00.538Z dari kiriman 2; dua ts berbeda berarti dua baris kembar, dan rata-rata jadi melenceng. Kotak penjaganya dua, sesuai Konsep 10: 1, kunci utama (device_id, ts) di tabel readings; 2, ON CONFLICT … DO NOTHING, kiriman ulang dilewati tanpa galat; syaratnya, ts ditulis perangkat, bukan waktu tiba di backend.](aset/kiriman-ganda.png)

> ➡️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 5](#praktik-5--backend-v02-menyimpan-semua-pesan-mqtt-40-menit).

## 🔧 Praktik langkah demi langkah

### Praktik 1 — Docker secukupnya: kontainer, log, dan volume (25 menit)

> 🖥️ **Alat yang dipakai:** **terminal VS Code** (folder mana pun), **Docker Desktop**, dan **psql** di dalam kontainer.

Kontainer `rumahpintar-db` dari Kemenangan Cepat sudah berjalan. Praktik ini mengajarkan lima perintah Docker yang kamu butuhkan sepanjang Fase 3, lalu membuktikan janji terpenting Docker untuk database: **data tetap ada** walaupun kontainernya dihentikan (bahkan dibuang, seperti dijelaskan kotak tip di akhir praktik ini).

#### 1.1 Melihat kontainer dan log-nya

```text
docker ps -a
docker logs rumahpintar-db
```

`docker ps` menampilkan kontainer yang sedang menyala; tambahan `-a` (*all*, semua) ikut menampilkan yang berhenti. `docker logs` menampilkan semua yang ditulis PostgreSQL sejak kontainernya dibuat. Log pertama ini panjang karena PostgreSQL baru saja menyiapkan lemarinya. Gulir ke bagian bawahnya.

**Hasilnya** (contoh, bagian akhir `docker logs`):

```text
PostgreSQL init process complete; ready for start up.

… UTC [1] LOG:  starting PostgreSQL 17.11 on x86_64-pc-linux-musl, …
… UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
… UTC [1] LOG:  listening on IPv6 address "::", port 5432
…
… UTC [1] LOG:  database system is ready to accept connections
```

Baris **`database system is ready to accept connections`** berarti database siap menerima sambungan. Saat kontainer pertama kali menyala, baris itu muncul **dua kali**: sekali untuk server sementara yang dipakai saat menyiapkan database `rumahpintar`, dan sekali untuk server sesungguhnya setelah `PostgreSQL init process complete`. Alamat `0.0.0.0` di sini adalah alamat **di dalam** kontainer; dari luar, loketnya tetap hanya terbuka untuk `127.0.0.1` laptopmu (Konsep 2). Di Docker Desktop, log yang sama bisa dilihat dengan mengeklik nama kontainer di daftar **Containers** → tab **Logs**.

#### 1.2 Menghentikan dan menyalakan lagi

```text
docker stop rumahpintar-db
docker ps -a
docker start rumahpintar-db
```

`docker stop` mematikan PostgreSQL dengan rapi (ia menyelesaikan tulisannya dulu), dan `docker start` menyalakannya lagi. Di antara keduanya, `docker ps -a` menunjukkan kolom **STATUS** berisi `Exited (0) …`, yang berarti berhenti dengan normal. **Jangan** memakai `docker run` untuk menyalakan kontainer yang sudah ada; `run` selalu membuat kontainer **baru** dan akan ditolak karena namanya sudah dipakai. Di Docker Desktop, tombol **⏹** (*stop*) dan **▶** (*start*) di baris kontainer melakukan hal yang sama.

#### 1.3 Buktikan datanya tetap ada

Buat tabel uji kecil, isi satu baris, lalu matikan dan nyalakan kontainernya.

1. Masuk ke psql dan buat tabel uji:

   ```text
   docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
   ```

   ```sql
   CREATE TABLE uji (pesan text);
   INSERT INTO uji VALUES ('halo dari Modul 17');
   SELECT * FROM uji;
   \q
   ```

2. Hentikan dan nyalakan lagi kontainernya: `docker stop rumahpintar-db`, lalu `docker start rumahpintar-db`. Kedua perintah menjawab dengan nama kontainernya. Tunggu sekitar lima detik sebelum masuk psql lagi; kalau terlalu cepat, psql menjawab galat yang menyebut `the database system is starting up` atau `connection to server on socket`. Tunggu sebentar, lalu ulangi.
3. Masuk ke psql lagi dan jalankan `SELECT * FROM uji;`.

**Hasilnya** (langkah 3):

```text
       pesan        
--------------------
 halo dari Modul 17
(1 row)
```

Barisnya masih ada. Ia tidak tersimpan di kontainer, melainkan di **volume** `rumahpintar-data` (lemari di Konsep 2). Volume itu terlihat di Docker Desktop, menu **Volumes**.

#### 1.4 Bersihkan tabel uji

Masih di psql:

```sql
DROP TABLE uji;
\q
```

`DROP TABLE` membuang tabel beserta seluruh isinya, tanpa bertanya. Tabel uji sudah tidak dibutuhkan. Mulai Praktik 3, tabel dibuat hanya lewat migrasi.

> [!TIP]
> **Kapan kontainer boleh dibuang?** Kalau suatu saat kamu ingin membuat ulang kontainernya (misalnya untuk mengubah loket dari 5432 menjadi 5433), hentikan lalu hapus kontainernya dengan `docker stop rumahpintar-db` dan `docker rm rumahpintar-db`, lalu jalankan lagi perintah `docker run` Kemenangan Cepat. Datanya tetap aman di volume `rumahpintar-data`, dan kontainer baru langsung memakainya. Yang menghapus data hanyalah menghapus **volumenya** (`docker volume rm rumahpintar-data`, atau tombol hapus di menu **Volumes**). Lakukan itu hanya kalau kamu memang ingin mulai dari nol.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 3](#3-tabel-baris-kolom-tipe-dan-kunci-utama) (➡️ di akhir Konsep 5 akan mengantarmu ke Praktik 2).

### Praktik 2 — DBeaver: jendela ke database (30 menit)

> 🖥️ **Alat yang dipakai:** **browser** (mengunduh), **DBeaver**, **terminal VS Code** (psql, untuk perbandingan), dan **Docker Desktop** (kontainer `rumahpintar-db` menyala).

Jendela psql sangat berguna, tetapi tabel yang panjang lebih nyaman dilihat di jendela yang bisa digulir dan diklik. **DBeaver** adalah aplikasi gratis untuk melihat dan mengolah database: daftar tabel di kiri, editor SQL di tengah, dan hasil kueri berbentuk tabel di bawahnya. DBeaver hanyalah "jendela": datanya tetap tinggal di database dalam kontainer.

#### 2.1 Pasang DBeaver

1. Buka halaman unduh resmi [dbeaver.io/download](https://dbeaver.io/download/) dan pilih **DBeaver Community** (yang gratis) untuk sistem operasimu: Windows (*installer*), atau macOS untuk Apple silicon/Intel (cek seperti di bagian 🐳 Persiapan). Ukurannya sekitar 114 MB di Windows dan 124–125 MB di macOS. Java tidak perlu dipasang terpisah karena DBeaver membawa Java-nya sendiri.
2. **Windows:** jalankan file `dbeaver-ce-….exe` yang terunduh, lalu ikuti langkahnya dengan pilihan bawaan. **macOS:** buka file `.dmg`, lalu seret **DBeaver** ke folder **Applications**.
3. Buka DBeaver. Pertama kali, muncul *wizard* (panduan pengaturan awal) **Configure DBeaver**:
   - **Appearance**: pilih tema sesukamu, dan untuk tampilan daftar database pilih **Simplified** (hanya skema dan tabel, tanpa folder-folder tambahan yang membingungkan).
   - **Features**: boleh dilewati.
   - **Data collection**: pilih **Do not share anonymous usage statistics** kalau tidak ingin mengirim statistik pemakaian (bebas memilih).
   - **Final steps**: klik **Apply**.
4. Kalau DBeaver menawarkan **Create sample database**, pilih **tidak**. Kita memakai database sendiri.

#### 2.2 Sambungkan ke `rumahpintar`

1. Pastikan kontainer `rumahpintar-db` menyala (`docker ps`).
2. Di DBeaver, klik tombol **New Database Connection** (ikon steker dengan tanda plus, di kiri atas) atau tekan **Ctrl + Shift + N**.
3. Di halaman **Select your database**, pilih **PostgreSQL**, lalu klik **Next**.
4. Isi tab **Main**:

   | Isian | Nilai |
   | :--- | :--- |
   | **Host** | `127.0.0.1` |
   | **Port** | `5432` (atau `5433` kalau di Kemenangan Cepat kamu memakai loket 5433) |
   | **Database** | `rumahpintar` |
   | **Username** | `postgres` |
   | **Password** | sandi pilihanmu dari Kemenangan Cepat |
   | **Save password** | centang (laptop pribadi) supaya tidak ditanya setiap kali |

5. Klik **Test Connection ...** di kiri bawah. Pertama kali, DBeaver belum punya *driver* (penerjemah) PostgreSQL dan menampilkan jendela **Setup driver files**. Klik **Download** dan tunggu sebentar. Ini butuh internet.
6. Hasil tes yang benar: jendela kecil bertuliskan `Connected` beserta lamanya dalam milidetik, dan versi server PostgreSQL. Klik **OK**, lalu **Finish**. Kalau yang muncul jendela **Connection error**, baca pesannya, lalu buka 🚨 "DBeaver tidak bisa tersambung".

Koneksi barumu muncul di panel kiri (**Connections**) dengan nama `rumahpintar`. Klik segitiga di sampingnya untuk membuka isinya sampai skema `public`. Tampilan **Simplified** menyembunyikan folder perantara seperti **Schemas** dan **Tables**, jadi tabel nanti langsung tampil di bawah `public` (di tampilan **Full**, jalurnya `rumahpintar` → **Schemas** → `public` → **Tables**). Kalau tampak skema lain yang namanya diawali `_timescaledb` atau `timescaledb_`, itu milik tambahan TimescaleDB (Modul 18), jadi biarkan saja. Isi `public` masih kosong karena tabel Rumah Pintar Mini baru dibuat di Praktik 3.

#### 2.3 Jalankan kueri pertama di DBeaver

1. Klik koneksi `rumahpintar` di panel kiri, lalu pilih menu **SQL Editor** → **New SQL script** (atau tekan **Ctrl + ]**; di macOS **Control + ]**, bukan **Cmd**). Tab editor baru terbuka.
2. Ketik:

   ```sql
   SELECT now(), current_setting('TimeZone');
   ```

3. Letakkan kursor di baris itu, lalu tekan **Ctrl + Enter** (macOS: **Cmd + Enter**). Hasilnya muncul sebagai tabel di bagian bawah.

Bandingkan dengan psql. Jalankan `docker exec -it rumahpintar-db psql -U postgres -d rumahpintar` di terminal, lalu ketik `SELECT now(), current_setting('TimeZone');`. **Hasilnya** di psql (contoh):

```text
              now              | current_setting 
-------------------------------+-----------------
 2026-10-20 03:42:10.512937+00 | UTC
(1 row)
```

Di DBeaver, kolom `now` menunjukkan jam yang cocok dengan jam dinding, dan kolom `current_setting` berisi zona waktu laptopmu (misalnya `Asia/Jakarta` atau `Asia/Bangkok`, keduanya UTC+7; di WITA dan WIT, zona yang selisihnya 8 atau 9 jam dari UTC), bukan `UTC`. Database dan datanya sama; yang berbeda adalah **zona sesi**. DBeaver memberi tahu database zona waktu laptopmu setiap kali menyambung, sedangkan psql di dalam kontainer memakai bawaan server, yaitu UTC (Konsep 9). Ingat perbedaan ini setiap kali membandingkan jam dari dua jendela yang berbeda. Setelah itu, keluar dari psql dengan `\q` supaya terminalnya kembali menerima perintah biasa seperti `git` dan `npm` di Praktik 3.

#### 2.4 Tiga hal yang akan sering kamu pakai

- **Ctrl + Enter** menjalankan **satu** kalimat SQL, yaitu yang sedang ditunjuk kursor. **Alt + X** (macOS: **Option + X**) menjalankan **semua** kalimat SQL di editor berurutan, seperti sebuah skrip.
- **Klik dua kali sebuah tabel** di panel kiri untuk membuka tiga tab: **Properties** (kolom dan tipenya), **Data** (isinya, seperti spreadsheet), dan **Diagram** (gambar relasi tabel).
- **Isi skrip tersimpan** sebagai file `.sql` di folder kerja DBeaver. Skrip baru langsung diberi nama otomatis (`Script.sql`, lalu `Script-1.sql`, dan seterusnya), dan **Ctrl + S** menyimpan isinya tanpa menanyakan nama. Untuk memberi nama yang jelas, klik kanan di dalam teks skrip → **File** → **Rename SQL Script** (**Ctrl + F2**; di macOS **Control + F2**), ketik misalnya `kueri-pertama`, lalu klik **OK**; akhiran `.sql` ditambahkan sendiri. (Nama `latihan-modul17` disimpan untuk skrip latihan di Praktik 4.) Skrip yang sudah ada bisa dibuka lagi lewat **SQL Editor** → **Open SQL script** (**F3**).

> [!WARNING]
> **Jangan mengubah bentuk tabel dari DBeaver.** DBeaver bisa menambah kolom atau tabel dengan klik kanan, tetapi perubahan seperti itu tidak tercatat di repositori (Konsep 5). Di modul ini, DBeaver dipakai untuk **melihat** dan menjalankan SQL latihan; bentuk tabel hanya diubah lewat file migrasi.

> ➡️ **Lanjut** ke [Praktik 3](#praktik-3--skema-rumah-pintar-mini-lewat-migrasi-40-menit) tanpa kembali ke konsep.

### Praktik 3 — Skema Rumah Pintar Mini lewat migrasi (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan dua terminal (terminal pertama untuk `npm run dev` nanti, terminal kedua untuk perintah lain; keduanya pindah ke folder `backend` di langkah 3.1), **DBeaver**, dan **Docker Desktop** (kontainer `rumahpintar-db` menyala).

Sejak Modul 16, setiap fitur dikerjakan di cabangnya sendiri lalu digabung lewat *pull request*. Semua pekerjaan kode Modul 17 dikerjakan di satu cabang, `fitur/database`, dan digabung ke `main` di ➕ B.

#### 3.1 Cabang baru: `fitur/database`

Buka folder `rumah-pintar-mini` di VS Code, lalu buka terminal pertama (**Terminal → New Terminal**). Terminal baru selalu mulai di folder `rumah-pintar-mini`. Ketik `cd backend`, tekan **Enter**, lalu biarkan; terminal itu baru dipakai untuk `npm run dev` di Praktik 5. Setelah itu, buka terminal kedua dengan ikon **+** di panel terminal. Di terminal kedua, pastikan kamu di `main` yang terbaru, lalu buat cabangnya dan masuk ke folder `backend`:

```text
git switch main
git pull --prune
git switch -c fitur/database
cd backend
```

**Hasilnya:** perintah ketiga (`git switch -c fitur/database`) menjawab `Switched to a new branch 'fitur/database'`, lalu `cd backend` memindahkan terminal ke folder `backend` tanpa jawaban apa pun. Sejak sekarang, *commit* praktik masuk ke cabang ini.

#### 3.2 Pasang `pg`

Di terminal kedua (folder `backend`):

```text
npm install pg@8.23.1
npm install --save-dev @types/pg@8.23.1
```

**Hasilnya** (baris pertama dari setiap perintah; jumlah `packages` di laptopmu bisa sedikit berbeda):

```text
added 13 packages, and audited 146 packages in 2s
added 1 package, and audited 147 packages in 1s
```

`pg` adalah library untuk berbicara dengan PostgreSQL (Konsep 10). `@types/pg` berisi "label tipe" untuk TypeScript supaya `npm run cek` dan VS Code mengenal fungsi-fungsi `pg`. Karena hanya dipakai saat memeriksa tipe, ia dipasang dengan `--save-dev`, sama seperti `typescript` di Modul 16.

#### 3.3 Alamat database di `.env`

Backend perlu tahu alamat database dan sandinya. Seperti alamat broker di Modul 16, alamat itu ditulis di `.env`, bukan di kode. Buka `.env` (folder `backend`), lalu tambahkan satu baris di bawahnya. Ganti `ganti-sandi-ini` dengan sandimu, dan `5432` dengan `5433` kalau kamu memakai loket 5433:

```text
DATABASE_URL=postgres://postgres:ganti-sandi-ini@127.0.0.1:5432/rumahpintar
```

Alamat itu dibaca seperti alamat web:

| Bagian | Artinya |
| :--- | :--- |
| `postgres://` | jenis alamatnya: database PostgreSQL |
| `postgres:ganti-sandi-ini` | `nama-pengguna:sandi` |
| `@127.0.0.1:5432` | `@alamat:loket`: laptop ini, loket 5432 |
| `/rumahpintar` | nama database |

Lalu buka `.env.example` (file contoh yang ikut ke GitHub) dan samakan isinya dengan ini, **dengan sandi contoh, bukan sandimu**. Setelan tambahan yang sudah ada, misalnya `OTOMASI_KIPAS=` dari 🧩 Modul 16, biarkan tetap ada:

```text
# Salin file ini menjadi .env, lalu sesuaikan isinya. File .env tidak ikut Git (lihat .gitignore).
MQTT_URL=mqtt://192.168.1.37:1883
PORT=8080
HOST=127.0.0.1
# database PostgreSQL di kontainer Docker (Modul 17); ganti ganti-sandi-ini dengan sandi pilihanmu
DATABASE_URL=postgres://postgres:ganti-sandi-ini@127.0.0.1:5432/rumahpintar
```

Terakhir, beri tahu `src/config/env.ts` bahwa setelan baru ini **wajib**. Tambahkan satu baris `DATABASE_URL` di bawah `MQTT_URL` sehingga isinya menjadi seperti di bawah ini. Kalau `env.ts`-mu punya setelan tambahan dari 🧩 Modul 16 (misalnya `OTOMASI_KIPAS`), jangan dihapus:

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
  DATABASE_URL: wajib("DATABASE_URL"), // alamat database, misalnya postgres://postgres:<sandi>@127.0.0.1:5432/rumahpintar
  PORT: Number(process.env.PORT || 8080), // nomor loket server
  HOST: process.env.HOST || "127.0.0.1", // 127.0.0.1 = hanya bisa diketuk dari laptop ini
};
```

Kalau `DATABASE_URL` lupa diisi, server dan program migrasi langsung berhenti dengan pesan `Setelan DATABASE_URL belum diisi. Salin .env.example menjadi .env, isi DATABASE_URL, lalu jalankan lagi.`, persis seperti `MQTT_URL` di Modul 16.

#### 3.4 Kolam sambungan: `src/db/pool.ts`

Buat folder baru `src/db`, lalu file `pool.ts` di dalamnya:

```ts
// pool.ts - "kolam" sambungan ke database PostgreSQL, dipakai bersama oleh seluruh backend.
import { Pool } from "pg";
import { env } from "../config/env.ts";

export const pool = new Pool({
  connectionString: env.DATABASE_URL, // postgres://postgres:<sandi>@127.0.0.1:5432/rumahpintar
  max: 5, // paling banyak 5 sambungan sekaligus; cukup untuk satu backend kecil
  connectionTimeoutMillis: 5000, // menyerah kalau database tidak menjawab dalam 5 detik
});

// sambungan yang sedang menganggur bisa putus (misalnya kontainer database dihentikan): catat, jangan mematikan server
pool.on("error", (galat) => console.error(`galat database: ${galat.message}`));
```

- **`new Pool({ … })`** membuat kolam sambungan (*pool*): beberapa sambungan ke database yang dibuka sekali lalu dipakai bergiliran. Membuka sambungan baru untuk setiap kueri itu lambat. Konsep 10 membahasnya lebih dalam. *Pool* belum menyambung apa pun saat dibuat; sambungan dibuka saat kueri pertama dijalankan.
- **`max: 5`**: paling banyak lima sambungan sekaligus. Bawaan `pg` adalah 10; lima sudah lebih dari cukup untuk satu backend kecil.
- **`connectionTimeoutMillis: 5000`**: kalau database tidak menjawab dalam 5 detik (misalnya database di Raspberry Pi yang sedang padam), kueri gagal dengan pesan yang jelas, bukan menunggu lama. Kontainer yang dihentikan malah langsung ditolak dengan `ECONNREFUSED`. Bawaan `pg` adalah menunggu tanpa batas.
- **`pool.on("error", …)`**: sambungan yang sedang menganggur bisa terputus, misalnya saat kontainer dihentikan. Tanpa baris ini, putusnya sambungan seperti itu akan mematikan seluruh backend. Dengan baris ini, kejadiannya hanya dicatat.

File ini memakai `env` dari `env.ts`, jadi setiap program yang memakai `pool` otomatis ikut memeriksa `.env`.

#### 3.5 Migrasi pertama: `migrasi/001_skema_awal.sql`

Buat folder `migrasi` **langsung di dalam `backend`** (sejajar dengan `src`, bukan di dalamnya), lalu file `001_skema_awal.sql`:

```sql
-- 001_skema_awal.sql - skema awal database Rumah Pintar Mini (Modul 17).
-- Satu tabel untuk setiap jenis data. Semua waktu bertipe timestamptz: disimpan dalam UTC, ditampilkan sesuai zona sesi.

-- Perangkat yang pernah terdengar. Baris dibuat otomatis oleh backend saat pesan pertamanya tiba.
CREATE TABLE devices (
  device_id        text PRIMARY KEY CHECK (device_id ~ '^[0-9a-f]{12}$'),
  jenis            text NOT NULL DEFAULT 'belum-diketahui' CHECK (jenis IN ('node1', 'node2', 'belum-diketahui')),
  nama             text,             -- nama yang mudah diingat, misalnya 'Node 1 ruang tamu' (diisi manusia)
  lokasi           text,             -- misalnya 'ruang tamu' atau 'kebun belakang'
  lat              double precision CHECK (lat BETWEEN -90 AND 90),
  lng              double precision CHECK (lng BETWEEN -180 AND 180),
  status           text NOT NULL DEFAULT 'belum-diketahui',
  terakhir_dilihat timestamptz,      -- waktu server saat pesan terakhir perangkat ini tiba
  dibuat           timestamptz NOT NULL DEFAULT now()
);

-- Satu baris untuk setiap pesan telemetry. Kolom yang tidak dimiliki perangkat berisi NULL.
CREATE TABLE readings (
  device_id   text NOT NULL REFERENCES devices (device_id),
  ts          timestamptz NOT NULL,                -- waktu bacaan dari perangkat (kontrak bagian 4)
  diterima    timestamptz NOT NULL DEFAULT now(),  -- waktu pesan tiba di backend
  fw          text NOT NULL,
  suhu        double precision,
  kelembapan  integer,
  cahaya      integer,
  tanah       integer,
  gerak       boolean,
  level_air   integer,
  tekanan     double precision,
  suhu_tanah  double precision,
  baterai     double precision,
  tanah_rs485 double precision,
  ec          integer,
  PRIMARY KEY (device_id, ts)                      -- satu bacaan per perangkat per waktu: kiriman ganda tertolak
);

-- Kesehatan perangkat dari pesan vitals (kontrak bagian 6).
CREATE TABLE device_health (
  device_id text NOT NULL REFERENCES devices (device_id),
  ts        timestamptz NOT NULL,
  rssi      integer NOT NULL,
  uptime_s  integer NOT NULL,
  heap_free integer NOT NULL,
  PRIMARY KEY (device_id, ts)
);

-- Setiap perintah dari API beserta jawaban ack-nya (kontrak bagian 7-8).
CREATE TABLE commands (
  id        text PRIMARY KEY,                      -- id perintah, misalnya c-20261020-041128-1
  device_id text NOT NULL REFERENCES devices (device_id),
  dikirim   timestamptz NOT NULL DEFAULT now(),
  target    text NOT NULL,
  nilai     jsonb NOT NULL,                        -- true/false untuk lampu dan kipas, angka untuk pompa dan tirai
  ack_ok    boolean,                               -- NULL = tidak ada ack dalam 5 detik
  ack_pesan text,
  lama_ms   integer
);

-- Disiapkan sekarang, dipakai nanti: akun pengguna (Modul 20 menambah sandi dan login).
CREATE TABLE users (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email  text NOT NULL UNIQUE,
  nama   text NOT NULL,
  peran  text NOT NULL DEFAULT 'viewer' CHECK (peran IN ('admin', 'viewer')),
  dibuat timestamptz NOT NULL DEFAULT now()
);

-- Disiapkan sekarang, dipakai nanti: aturan otomatis (Modul 19), misalnya "suhu di atas 30 -> kipas nyala".
CREATE TABLE rules (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama    text NOT NULL,
  aktif   boolean NOT NULL DEFAULT true,
  kondisi jsonb NOT NULL,
  aksi    jsonb NOT NULL,
  dibuat  timestamptz NOT NULL DEFAULT now()
);
```

Isinya adalah keenam tabel di Konsep 4, dalam satu file. Hal-hal yang patut diperhatikan:

- **`readings`** berisi semua kolom sensor kontrak data 1.2, dengan kunci utama gabungan `PRIMARY KEY (device_id, ts)` di baris terakhirnya (Konsep 10). Kolom `diterima DEFAULT now()` terisi sendiri dengan waktu server saat baris disimpan.
- **`device_health`** juga berkunci `(device_id, ts)` karena `vitals` bisa dikirim ulang sama seperti `telemetry`.
- **`commands`** berkunci `id`, yaitu id perintah `c-…` dari Modul 16. Kolom `nilai` bertipe `jsonb` karena nilai perintah bisa `true`/`false` (lampu, kipas) atau angka (pompa, tirai).
- **`users`** dan **`rules`** memakai **`GENERATED ALWAYS AS IDENTITY`**: nomor urut otomatis (1, 2, 3, …) yang diisi database sendiri. Kedua tabel ini sengaja belum dipakai minggu ini. Modul 19 dan 20 menambah kolomnya lewat migrasi `002`, `003`, dan seterusnya. Kolom `email` di `users` diberi **`UNIQUE`**: sama seperti kunci utama, isinya tidak boleh kembar, jadi satu email hanya untuk satu akun.

#### 3.6 Pelari migrasi: `src/db/migrasi.ts`

Buat file `src/db/migrasi.ts`:

```ts
// migrasi.ts - menjalankan file SQL di folder migrasi/ yang belum pernah dijalankan, urut menurut nomornya.
// Jalankan dari folder backend: npm run migrasi
import { readdir, readFile } from "node:fs/promises";
import { pool } from "./pool.ts";

const FOLDER = new URL("../../migrasi/", import.meta.url); // folder backend/migrasi/

// buku catatan migrasi: satu baris untuk setiap file yang sudah dijalankan
await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  versi text PRIMARY KEY,
  diterapkan_pada timestamptz NOT NULL DEFAULT now()
)`);
const sudah = await pool.query<{ versi: string }>("SELECT versi FROM schema_migrations");
const tercatat = new Set(sudah.rows.map((baris) => baris.versi));
const semua = (await readdir(FOLDER)).filter((nama) => nama.endsWith(".sql")).sort(); // 001_…, 002_…, dan seterusnya

let baru = 0;
for (const nama of semua) {
  if (tercatat.has(nama)) continue; // sudah pernah dijalankan: lewati
  const sql = await readFile(new URL(nama, FOLDER), "utf8");
  const klien = await pool.connect(); // satu sambungan khusus supaya BEGIN dan COMMIT terjadi di sambungan yang sama
  try {
    await klien.query("BEGIN"); // semua isi file berhasil, atau tidak ada yang berubah sama sekali
    await klien.query(sql);
    await klien.query("INSERT INTO schema_migrations (versi) VALUES ($1)", [nama]);
    await klien.query("COMMIT");
    console.log(`diterapkan: ${nama}`);
    baru++;
  } catch (galat) {
    await klien.query("ROLLBACK");
    console.error(`GAGAL di ${nama}: ${(galat as Error).message}`);
    process.exitCode = 1; // npm melaporkan kegagalan
    break; // jangan lanjut ke file berikutnya
  } finally {
    klien.release(); // kembalikan sambungan ke kolam
  }
}
console.log(`${baru} migrasi baru diterapkan, ${tercatat.size} sudah ada sebelumnya.`);
await pool.end(); // tutup kolam supaya program selesai
```

Cara kerjanya, dari atas ke bawah:

1. **`FOLDER`** menunjuk folder `backend/migrasi/`. `import.meta.url` adalah alamat file `migrasi.ts` itu sendiri, jadi `../../migrasi/` berarti "naik dua folder dari `src/db`, lalu masuk `migrasi`".
2. **Buku catatan**: tabel `schema_migrations` dibuat kalau belum ada (`IF NOT EXISTS`). Setiap baris berisi nama file migrasi yang sudah dijalankan dan kapan.
3. **Daftar file**: semua file `.sql` di folder itu, diurutkan menurut namanya. Karena itulah namanya diawali nomor tiga digit (`001_`, `002_`): urutan nama sama dengan urutan nomor.
4. **Untuk setiap file yang belum tercatat**, satu sambungan dipinjam dari *pool* (`pool.connect()`), lalu `BEGIN`, isi file, catatan di `schema_migrations`, dan `COMMIT` dijalankan di sambungan yang sama. Kalau ada yang gagal, `ROLLBACK` membatalkan semuanya, program mencetak `GAGAL di …`, lalu berhenti. Transaksi harus memakai **satu** sambungan yang sama dari awal sampai akhir; `pool.query` biasa bisa saja memakai sambungan yang berbeda untuk setiap kueri.
5. **`pool.end()`** menutup kolam di akhir. Tanpanya, program masih "menyala" sekitar 10 detik lagi, menunggu `pg` menutup sendiri sambungan yang menganggur.

Terakhir, daftarkan perintahnya di `package.json`. Di bagian `"scripts"`, tambahkan baris `migrasi` setelah `cek` (jangan lupa koma di akhir baris `cek`):

```json
"scripts": {
  "dev": "node --watch --env-file=.env src/server.ts",
  "start": "node --env-file=.env src/server.ts",
  "cek": "tsc --noEmit",
  "migrasi": "node --env-file=.env src/db/migrasi.ts"
},
```

#### 3.7 Jalankan migrasinya

Di terminal kedua (folder `backend`):

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.1.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 001_skema_awal.sql
1 migrasi baru diterapkan, 0 sudah ada sebelumnya.
```

Jalankan sekali lagi. Kali ini tidak ada yang dijalankan ulang:

```text
0 migrasi baru diterapkan, 1 sudah ada sebelumnya.
```

Itulah sifat penting migrasi: aman diulang. Kalau yang muncul justru galat, lihat 🚨 "`npm run migrasi` gagal".

#### 3.8 Lihat tabelnya

**Di DBeaver:** klik koneksi `rumahpintar` di panel kiri, tekan **F5** (*refresh*, segarkan), lalu buka isinya sampai `public` (di tampilan **Full**: **Schemas** → `public` → **Tables**). Ada tujuh tabel: keenam tabel Rumah Pintar Mini ditambah `schema_migrations`. Klik dua kali `readings`, lalu buka tab **Diagram**: DBeaver menggambar tabel itu beserta garis relasinya ke `devices`, mirip sebagian gambar skema di [Konsep 4](#4-relasi-dan-skema-rumah-pintar-mini-tabel-yang-saling-menunjuk).

**Di psql** (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`), perintah `\dt` (*describe tables*) menampilkan daftar tabel, dan `\d readings` menampilkan kolom-kolomnya. Jawaban `\d readings` cukup panjang: kalau psql berhenti dengan tulisan `--More--` di baris paling bawah, tekan **Spasi** untuk melanjutkan atau **q** untuk berhenti. Setelah selesai, keluar dengan `\q` sebelum menjalankan `npm run cek` di 3.9. **Hasilnya** (`\dt`):

```text
               List of relations
 Schema |       Name        | Type  |  Owner   
--------+-------------------+-------+----------
 public | commands          | table | postgres
 public | device_health     | table | postgres
 public | devices           | table | postgres
 public | readings          | table | postgres
 public | rules             | table | postgres
 public | schema_migrations | table | postgres
 public | users             | table | postgres
(7 rows)
```

#### 3.9 Periksa dan simpan

Di terminal kedua (folder `backend`), jalankan `npm run cek`. Hasilnya harus bersih, tanpa satu pun `error`. Lalu simpan pekerjaanmu ke cabang `fitur/database`. Jalankan dua perintah pertama dulu dan periksa daftarnya (lihat paragraf di bawah blok) sebelum menjalankan `git commit` dan `git push`:

```text
git add .
git status
git commit -m "Skema database awal lewat migrasi 001 (Modul 17 Praktik 3)"
git push -u origin fitur/database
```

Di bagian `Changes to be committed`, `git status` harus menyebut tiga file baru (`migrasi/001_skema_awal.sql`, `src/db/migrasi.ts`, `src/db/pool.ts`) dan empat file yang berubah (`.env.example`, `package-lock.json`, `package.json`, `src/config/env.ts`), tetapi **tidak** menyebut `.env`. Kalau `.env` ikut muncul, keluarkan dengan `git restore --staged .env`, lalu periksa `.gitignore`-mu (Modul 16 Praktik 2). `git push -u` yang pertama untuk cabang baru ini juga membuat cabangnya di GitHub (Modul 16 Praktik 8).

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 6](#6-sql-bertanya-select-where-order-by-dan-limit) (➡️ di akhir Konsep 9 akan mengantarmu ke Praktik 4).

### Praktik 4 — SQL dasar dengan data latihan 7 hari (75 menit)

> 🖥️ **Alat yang dipakai:** **terminal VS Code** (terminal kedua, folder `backend`), **DBeaver** (editor SQL), dan **Docker Desktop** (kontainer `rumahpintar-db` menyala; buka aplikasinya dulu kalau kamu melanjutkan di hari lain). Semua kueri juga bisa dijalankan di psql.
>
> ⭐ **Wajib** — syarat lulus: menulis SQL "rata-rata suhu per hari selama 7 hari terakhir" tanpa sontekan.

Belajar SQL butuh data, dan menunggu seminggu sampai Node 1 mengumpulkan bacaan terlalu lama. Praktik ini memakai skrip yang mengisi database dengan **data latihan**: dua perangkat latihan, satu bacaan setiap 10 menit, selama 7 hari ke belakang.

#### 4.1 Skrip pengisi riwayat: `src/db/isi-riwayat.ts`

Buat file `src/db/isi-riwayat.ts`:

```ts
// isi-riwayat.ts - mengisi database dengan riwayat palsu 7 hari untuk latihan SQL (Modul 17 Praktik 4).
// Dua perangkat latihan, satu bacaan setiap 10 menit, dari pukul 00.00 WIB tujuh hari lalu sampai sekarang.
// Angkanya dibuat dari rumus + "dadu" berbenih tetap, jadi rata-rata setiap hari penuh sama di laptop siapa pun.
// Jalankan dari folder backend: npm run isi-riwayat (boleh diulang: bacaan yang sudah ada dilewati)
import { pool } from "./pool.ts";

const LANGKAH_MS = 10 * 60 * 1000; // satu bacaan setiap 10 menit
const HARI_MS = 24 * 60 * 60 * 1000;
const WIB_MS = 7 * 60 * 60 * 1000; // WIB = UTC + 7 jam
const CUACA = [0.2, -0.4, 0.5, 1.1, 0.7, -0.2, 0.3, 0.0]; // hari ke-0 (tujuh hari lalu) lebih hangat/sejuk berapa derajat

const PERANGKAT = [
  { device_id: "f00d00000001", nama: "Latihan ruang tamu", lokasi: "ruang tamu", lat: -6.2, lng: 106.8, panas: 0, kering: 1.0 },
  { device_id: "f00d00000002", nama: "Latihan teras", lokasi: "teras", lat: -6.2, lng: 106.8, panas: 1.5, kering: 1.4 },
];

// "dadu" berbenih (mulberry32): urutan angka acaknya selalu sama untuk benih yang sama
function dadu(benih: number): () => number {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const satuDesimal = (x: number) => Math.round(x * 10) / 10;

// awal hari ini menurut WIB, dinyatakan dalam milidetik UTC
const sekarang = Date.now();
const awalHariIni = Math.floor((sekarang + WIB_MS) / HARI_MS) * HARI_MS - WIB_MS;
const mulai = awalHariIni - 7 * HARI_MS;

for (const [urut, p] of PERANGKAT.entries()) {
  await pool.query(
    `INSERT INTO devices (device_id, jenis, nama, lokasi, lat, lng) VALUES ($1, 'node1', $2, $3, $4, $5)
     ON CONFLICT (device_id) DO UPDATE SET nama = $2, lokasi = $3, lat = $4, lng = $5`,
    [p.device_id, p.nama, p.lokasi, p.lat, p.lng],
  );
  const kolom = { ts: [] as string[], suhu: [] as number[], kelembapan: [] as number[], cahaya: [] as number[],
    tanah: [] as number[], gerak: [] as boolean[], level_air: [] as number[] };
  let tanah = 62;
  for (let ts = mulai; ts <= sekarang; ts += LANGKAH_MS) {
    const hariKe = Math.floor((ts - mulai) / HARI_MS); // 0 = tujuh hari lalu ... 7 = hari ini
    const menit = Math.round(((ts - mulai) % HARI_MS) / 60000); // menit sejak pukul 00.00 WIB
    const acak = dadu((urut + 1) * 100000 + hariKe * 1000 + menit / 10); // benih per perangkat, hari, dan jam
    const jam = menit / 60;
    const siang = Math.max(0, Math.sin(((jam - 6) / 12) * Math.PI)); // 0 di malam hari, 1 sekitar pukul 12.00
    const suhu = 26 + p.panas + CUACA[hariKe] + 4 * Math.sin(((jam - 9) / 24) * 2 * Math.PI) + (acak() - 0.5);
    if (menit === 6 * 60 || menit === 18 * 60) tanah = 68; // disiram otomatis pukul 06.00 dan 18.00 WIB
    else tanah -= (0.15 + 0.35 * siang) * p.kering * (0.8 + 0.4 * acak()); // makin kering, terutama siang hari
    kolom.ts.push(new Date(ts).toISOString());
    kolom.suhu.push(satuDesimal(suhu));
    kolom.kelembapan.push(Math.round(80 - 12 * siang + 4 * (acak() - 0.5)));
    kolom.cahaya.push(Math.round(3400 * siang + 60 * acak()));
    kolom.tanah.push(Math.max(0, Math.round(tanah)));
    kolom.gerak.push(acak() < (jam >= 7 && jam < 22 ? 0.3 : 0.03));
    kolom.level_air.push(Math.max(5, 90 - Math.round(menit / 30)));
  }
  // batch insert: semua kolom dikirim sebagai larik dalam SATU perintah, lalu unnest membukanya menjadi baris
  const hasil = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air)
     SELECT $1, ts, '1.4.0', suhu, kelembapan, cahaya, tanah, gerak, level_air
     FROM unnest($2::timestamptz[], $3::float8[], $4::int[], $5::int[], $6::int[], $7::bool[], $8::int[])
       AS b(ts, suhu, kelembapan, cahaya, tanah, gerak, level_air)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [p.device_id, kolom.ts, kolom.suhu, kolom.kelembapan, kolom.cahaya, kolom.tanah, kolom.gerak, kolom.level_air],
  );
  console.log(`${p.device_id}: ${kolom.ts.length} bacaan dikirim, ${hasil.rowCount} baru tersimpan`);
}
await pool.end();
```

Tidak perlu memahami setiap rumusnya. Yang penting:

- **Dua perangkat latihan**: `f00d00000001` (ruang tamu) dan `f00d00000002` (teras, sedikit lebih panas dan lebih cepat kering). Keduanya dicatat dulu di `devices` dengan nama, lokasi, dan koordinatnya karena `readings` hanya menerima perangkat yang sudah terdaftar (Konsep 4). `ON CONFLICT (device_id) DO UPDATE` berarti "kalau perangkatnya sudah ada, perbarui saja kolom-kolom itu".
- **Pola yang masuk akal**: suhu naik di siang hari dan turun di malam hari, cahaya hanya ada antara pukul 06.00 dan 18.00 WIB, dan tanah makin kering sampai disiram otomatis pukul 06.00 dan 18.00.
- **"Dadu" berbenih**: angka acaknya dibuat dari benih yang tetap, jadi rata-rata harian di laptopmu sama dengan contoh di modul ini. Hanya tanggalnya yang berbeda, mengikuti hari kamu menjalankannya.
- ***Batch insert*** (penyisipan sekaligus): ribuan bacaan tidak dikirim satu per satu. Setiap kolom dikumpulkan menjadi satu larik (*array*), lalu semuanya dikirim dalam **satu** perintah `INSERT … SELECT … FROM unnest(…)`. Fungsi `unnest` di sisi database membuka larik-larik itu kembali menjadi baris. Seribu bacaan per perangkat masuk dalam sekejap.
- **`ON CONFLICT (device_id, ts) DO NOTHING`**: menjalankan skrip ini dua kali tidak menggandakan data (Konsep 10).

Daftarkan perintahnya di `package.json`. Tambahkan baris ini di bagian `"scripts"`, setelah `migrasi` (beri koma di akhir baris `migrasi`):

```json
"isi-riwayat": "node --env-file=.env src/db/isi-riwayat.ts"
```

#### 4.2 Isi datanya

Di terminal kedua (folder `backend`), jalankan perintahnya **dua kali**:

```text
npm run isi-riwayat
npm run isi-riwayat
```

**Hasilnya** (angka pertama bergantung pada jam berapa kamu menjalankannya: 1.008 bacaan untuk tujuh hari penuh, ditambah satu bacaan untuk setiap 10 menit hari ini, jadi paling banyak 1.152; contoh ini dijalankan sekitar pukul 00.15 WIB):

```text
f00d00000001: 1010 bacaan dikirim, 1010 baru tersimpan
f00d00000002: 1010 bacaan dikirim, 1010 baru tersimpan
```

dan pada putaran kedua:

```text
f00d00000001: 1010 bacaan dikirim, 0 baru tersimpan
f00d00000002: 1010 bacaan dikirim, 0 baru tersimpan
```

Putaran kedua mengirim seribu lebih bacaan yang sama, dan **tidak satu pun** tersimpan ganda. Begitulah cara `ON CONFLICT DO NOTHING` bekerja, dalam skala besar. (Kalau putaran kedua melewati pergantian 10 menit, misalnya dari pukul 00.19 ke 00.20, bacaan untuk 10 menit yang baru itu memang baru, jadi hasilnya `1011 bacaan dikirim, 1 baru tersimpan`.)

> [!IMPORTANT]
> **Kerjakan 4.5–4.8 pada hari yang sama dengan langkah ini.** Angka di kotak Hasilnya melekat pada tanggal, dihitung dari hari kamu mengisi data latihan: sehari sebelumnya selalu `26.3`, dua hari sebelumnya `25.8`, dan seterusnya. Kalau kuerinya kamu jalankan pada hari lain, "tujuh hari terakhir" ikut bergeser. Baris teratas hilang, dan baris terbawah adalah hari pengisian yang datanya belum lengkap (di jalur simulator, juga bercampur bacaan simulator sejak Praktik 5). Melanjutkan di hari lain? Kosongkan dulu bacaan latihan di DBeaver dengan `DELETE FROM readings WHERE device_id IN ('f00d00000001', 'f00d00000002');`, lalu jalankan `npm run isi-riwayat` sekali lagi di terminal kedua. Angkanya kembali sama persis dengan modul; hanya tanggalnya yang mengikuti hari itu.

#### 4.3 Melihat-lihat data

Buka DBeaver, klik koneksi `rumahpintar`, lalu buat skrip baru (**SQL Editor** → **New SQL script**). Beri nama `latihan-modul17` lewat klik kanan di dalam teks skrip → **File** → **Rename SQL Script** → **OK**, seperti di 2.4. Setelah itu, **Ctrl + S** cukup untuk menyimpan isinya. Ketik kueri di bawah satu per satu, lalu jalankan masing-masing dengan **Ctrl + Enter**.

**Lima bacaan terbaru** perangkat ruang tamu:

```sql
SELECT ts, suhu, kelembapan, tanah
FROM readings
WHERE device_id = 'f00d00000001'
ORDER BY ts DESC
LIMIT 5;
```

**Hasilnya** (contoh dari psql; jam bacaan terbarunya mengikuti kapan kamu menjalankan `isi-riwayat`, begitu juga angkanya, yang berubah sepanjang hari):

```text
           ts           | suhu | kelembapan | tanah 
------------------------+------+------------+-------
 2026-10-19 17:10:00+00 |   23 |         80 |    63
 2026-10-19 17:00:00+00 | 22.8 |         82 |    63
 2026-10-19 16:50:00+00 | 23.2 |         82 |    63
 2026-10-19 16:40:00+00 | 23.5 |         78 |    63
 2026-10-19 16:30:00+00 | 23.6 |         79 |    63
(5 rows)
```

Di psql, `ts` tampil dalam UTC (`+00`), sedangkan DBeaver menampilkannya dalam jam laptopmu, jadi bacaan terbaru `17:10` UTC tampil `00:10` (tanggal 20, WIB) di DBeaver. Satu bacaan yang sama, dua cara menulis (Konsep 9). Suhu `23` adalah `23.0`; psql tidak menulis angka nol di belakang koma.

Coba juga sendiri: hapus `WHERE` untuk melihat bacaan kedua perangkat, ganti `DESC` dengan `ASC` untuk melihat bacaan **tertua**, atau tambahkan syarat `AND suhu > 30` untuk melihat saat-saat terpanas.

#### 4.4 Mengubah data, dengan aman

Masih di skrip yang sama. Ganti nama dan lokasi perangkat latihan pertama, lalu periksa hasilnya:

```sql
UPDATE devices SET nama = 'Latihan ruang keluarga', lokasi = 'ruang keluarga' WHERE device_id = 'f00d00000001';
SELECT device_id, jenis, nama, lokasi FROM devices WHERE device_id LIKE 'f00d%' ORDER BY device_id;
```

**Hasilnya** (psql; di DBeaver, jumlah baris yang berubah tampil di panel hasil):

```text
UPDATE 1
  device_id   | jenis |          nama          |     lokasi     
--------------+-------+------------------------+----------------
 f00d00000001 | node1 | Latihan ruang keluarga | ruang keluarga
 f00d00000002 | node1 | Latihan teras          | teras
(2 rows)
```

`UPDATE 1` berarti tepat satu baris berubah, sesuai harapan. `LIKE 'f00d%'` berarti "diawali `f00d`" (`%` mewakili teks apa saja). Sekarang tambah lalu hapus sebuah perangkat coba:

```sql
INSERT INTO devices (device_id, nama, lokasi) VALUES ('f00d000000ff', 'Perangkat coba', 'gudang');
DELETE FROM devices WHERE device_id = 'f00d000000ff';
```

Jawaban psql: `INSERT 0 1` dan `DELETE 1`. Sekarang coba hapus perangkat yang **punya** bacaan:

```sql
DELETE FROM devices WHERE device_id = 'f00d00000001';
```

**Hasilnya:**

```text
ERROR:  update or delete on table "devices" violates foreign key constraint "readings_device_id_fkey" on table "readings"
DETAIL:  Key (device_id)=(f00d00000001) is still referenced from table "readings".
```

Database menolak karena seribu lebih bacaan di `readings` masih menunjuk perangkat itu (Konsep 4). Penolakan seperti ini adalah penjaga, bukan gangguan. Kembalikan nama dan lokasinya:

```sql
UPDATE devices SET nama = 'Latihan ruang tamu', lokasi = 'ruang tamu' WHERE device_id = 'f00d00000001';
```

#### 4.5 ⭐ Rata-rata suhu per hari, 7 hari terakhir

Inilah kueri syarat lulus. Ketik sendiri (jangan disalin) supaya setiap bagiannya terasa:

```sql
SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS hari,
       round(avg(suhu)::numeric, 1) AS rata_suhu,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY hari
ORDER BY hari;
```

**Hasilnya** (tanggalmu mengikuti hari ini; angka `rata_suhu` dan `jumlah` sama kalau data latihan diisi hari ini, lihat kotak di 4.2; untuk data latihan, pembaca WITA dan WIT pun tetap memakai `'Asia/Jakarta'`, lihat Konsep 9):

```text
    hari    | rata_suhu | jumlah 
------------+-----------+--------
 2026-10-13 |      26.2 |    144
 2026-10-14 |      25.6 |    144
 2026-10-15 |      26.5 |    144
 2026-10-16 |      27.1 |    144
 2026-10-17 |      26.7 |    144
 2026-10-18 |      25.8 |    144
 2026-10-19 |      26.3 |    144
(7 rows)
```

Dibaca menurut urutan database mengerjakannya, yang berbeda dengan urutan tulisannya (`SELECT` ditulis pertama, tetapi dikerjakan setelah baris dikelompokkan):

1. **`FROM readings WHERE …`**: ambil bacaan perangkat ruang tamu dari pukul 00.00 WIB tujuh hari lalu sampai sebelum pukul 00.00 WIB hari ini. Hari ini sengaja tidak ikut karena belum lengkap.
2. **`GROUP BY hari`**: kelompokkan per tanggal **WIB** (Konsep 9). Tanpa `AT TIME ZONE 'Asia/Jakarta'`, tanggalnya mengikuti zona sesi: di psql (UTC), bacaan pukul 00.00–06.59 WIB masuk ke tanggal kemarin, padahal di DBeaver tampak benar. Dengan `AT TIME ZONE`, hasilnya sama di mana pun kueri dijalankan.
3. **`round(avg(suhu)::numeric, 1)`**: rata-rata suhu setiap kelompok, dibulatkan satu angka di belakang koma (Konsep 8).
4. **`count(*)`**: jumlah bacaan per hari. Angka 144 = 24 jam × 6 bacaan per jam (setiap 10 menit), jadi tidak ada bacaan yang hilang atau kembar.
5. **`ORDER BY hari`**: urutkan dari hari tertua.

![Diagram kueri syarat lulus Praktik 4.5, rata-rata suhu per hari, dibaca menurut urutan database mengerjakannya, untuk perangkat latihan f00d00000001, dengan kueri yang dijalankan 20 Oktober 2026. Ada tiga kolom dari kiri ke kanan dengan lima nomor. Kolom kiri, nomor 1, FROM readings WHERE …, mengambil bacaan perangkat f00d00000001 dari pukul 00.00 WIB 13 Oktober sampai sebelum 00.00 WIB 20 Oktober. Tabel kecilnya berkolom ts (WIB) dan suhu, berisi 2026-10-13 00:00 dengan 23.3, 00:10 dengan 23.3, dan 00:20 dengan 22.7, lalu titik-titik, 2026-10-14 00:00 dengan 22.3, titik-titik lagi, serta 2026-10-19 23:40 dengan 23.5 dan 23:50 dengan 23.2; totalnya 1.008 bacaan, yaitu 7 hari × 144 bacaan. Di bawahnya tertulis hari ini (20 Okt) tidak ikut karena belum lengkap. Panah menuju kolom tengah, nomor 2, GROUP BY hari, per tanggal WIB lewat AT TIME ZONE 'Asia/Jakarta', berisi tujuh kotak biru 2026-10-13 sampai 2026-10-19 yang masing-masing memuat 144 bacaan, dengan catatan 7 kelompok, satu per tanggal. Dari setiap kotak, panah menuju satu baris di kolom kanan, Hasil, satu baris per kelompok, tujuh baris yang sama dengan kotak Hasilnya di 4.5. Tabel hasil berkolom hari (nomor 5), rata_suhu (nomor 3), dan jumlah (nomor 4), berisi 2026-10-13 dengan 26.2, 2026-10-14 dengan 25.6, 2026-10-15 dengan 26.5, 2026-10-16 dengan 27.1, 2026-10-17 dengan 26.7, 2026-10-18 dengan 25.8, dan 2026-10-19 dengan 26.3, semuanya dengan jumlah 144. Keterangan di bawah tabel: 3, round(avg(suhu)::numeric, 1), rata-rata dengan satu angka di belakang koma; 4, count(*), jumlah bacaan, 144 = 24 jam × 6 bacaan per jam; 5, ORDER BY hari, urutkan dari hari tertua.](aset/kueri-rata-rata-harian.png)

Untuk perangkat sungguhan, ganti `'f00d00000001'` dengan `device_id` Node 1-mu, setelah backend v0.2 mengumpulkan datanya beberapa hari (Praktik 5). Di ✅, kamu menulis ulang kueri ini tanpa melihat modul.

#### 4.6 `JOIN`: rata-rata suhu kemarin per lokasi

```sql
SELECT d.lokasi, d.nama, round(avg(r.suhu)::numeric, 1) AS rata_suhu
FROM readings AS r
JOIN devices AS d ON d.device_id = r.device_id
WHERE r.ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '1 day'
  AND r.ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY d.lokasi, d.nama
ORDER BY rata_suhu DESC;
```

**Hasilnya:**

```text
   lokasi   |        nama        | rata_suhu 
------------+--------------------+-----------
 teras      | Latihan teras      |      27.8
 ruang tamu | Latihan ruang tamu |      26.3
(2 rows)
```

`readings` tidak tahu apa pun tentang lokasi. Lokasi datang dari `devices` lewat `JOIN … ON d.device_id = r.device_id` (Konsep 8). Kalau backend v0.2 sudah menyimpan bacaan Node 1 dan Node 2 sungguhan kemarin, keduanya ikut muncul di sini. Selama `nama` dan `lokasi` kedua perangkat itu masih kosong, bacaan keduanya tergabung menjadi **satu** baris kosong karena `GROUP BY` menganggap semua `NULL` satu kelompok. Isi kolomnya dengan `UPDATE devices SET nama = …, lokasi = … WHERE device_id = …` (Praktik 5.7).

#### 4.7 Jam berapa tanah paling kering setiap hari?

```sql
SELECT DISTINCT ON (hari) hari, jam, tanah
FROM (
  SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS hari,
         to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') AS jam,
         tanah
  FROM readings
  WHERE device_id = 'f00d00000001'
    AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
    AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
) AS per_bacaan
ORDER BY hari, tanah, jam;
```

**Hasilnya:**

```text
    hari    |  jam  | tanah 
------------+-------+-------
 2026-10-13 | 17:10 |    42
 2026-10-14 | 17:50 |    41
 2026-10-15 | 17:10 |    42
 2026-10-16 | 17:10 |    42
 2026-10-17 | 17:30 |    40
 2026-10-18 | 17:20 |    41
 2026-10-19 | 17:20 |    42
(7 rows)
```

Kueri ini sedikit lebih maju dan tidak termasuk syarat lulus. Supaya terasa, jalankan dulu kueri di dalam kurungnya saja: di DBeaver, sorot teks dari `SELECT (ts AT TIME ZONE` sampai akhir baris tepat di atas `) AS per_bacaan` (tanda `)` di awal baris `) AS per_bacaan` jangan ikut disorot), lalu tekan **Ctrl + Enter** (DBeaver menjalankan teks yang disorot). Hasilnya satu baris untuk setiap bacaan, lengkap dengan tanggal dan jam WIB-nya. Setelah itu, jalankan seluruh kueri, lalu baca dalam dua langkah:

1. **Kueri di dalam kurung** (*subquery*, kueri di dalam kueri) menyiapkan tiga kolom untuk setiap bacaan: tanggal WIB, jam WIB berbentuk teks `HH24:MI` (misalnya `17:10`), dan nilai `tanah`. Hasilnya diberi nama `per_bacaan`.
2. **`DISTINCT ON (hari)`** hanya mengambil **baris pertama** setiap hari, setelah diurutkan menurut `ORDER BY hari, tanah, jam`. Dalam setiap hari, baris pertama adalah yang `tanah`-nya paling kecil, yaitu paling kering. Kalau ada dua yang sama keringnya, jam yang lebih awal menang.

Jawabannya jelas: tanah paling kering selalu sekitar pukul 17.10–17.50, setelah terik siang dan tepat sebelum penyiraman pukul 18.00. Pertanyaan semacam inilah yang membuat database sepadan dengan usahanya. Di Modul 19, jawaban seperti ini bisa menjadi aturan siram otomatis.

#### 4.8 Coba sendiri

Tulis kuerinya di `latihan-modul17.sql`, jalankan, lalu cocokkan dengan kunci di bawah.

1. Suhu **tertinggi** setiap hari selama 7 hari terakhir di teras (`f00d00000002`).
2. **Berapa kali** gerakan terdeteksi (`gerak = true`) setiap hari di ruang tamu.
3. Rata-rata `cahaya` setiap **jam** (00 sampai 23) kemarin di ruang tamu. Petunjuk: `to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24')`.

<details>
<summary><b>Kunci Praktik 4.8</b></summary>

```sql
-- 1. suhu tertinggi per hari di teras
SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS hari, max(suhu) AS suhu_tertinggi
FROM readings
WHERE device_id = 'f00d00000002'
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY hari
ORDER BY hari;

-- 2. jumlah deteksi gerak per hari di ruang tamu
SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS hari, count(*) AS jumlah_gerak
FROM readings
WHERE device_id = 'f00d00000001' AND gerak = true
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY hari
ORDER BY hari;

-- 3. rata-rata cahaya per jam kemarin di ruang tamu
SELECT to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24') AS jam, round(avg(cahaya)) AS rata_cahaya
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '1 day'
  AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
GROUP BY jam
ORDER BY jam;
```

Hasil kueri 1, dari hari tertua sampai kemarin: `32`, `31.5`, `32.3`, `33`, `32.6`, `31.7`, dan `32.1`. Hasil kueri 2: `26`, `22`, `29`, `37`, `31`, `32`, dan `25` deteksi gerak. Pada kueri 3, `cahaya` bertipe `integer`, dan `avg` dari bilangan bulat sudah bertipe `numeric`, jadi `round(…)` tanpa angka di belakang koma langsung bisa dipakai. Hasilnya: sekitar 20–40 (hanya derau sensor karena gelap) sebelum pukul 06.00 dan sesudah pukul 18.00, lalu naik sampai puncaknya, sekitar 3.400, pada jam 11 dan 12.

</details>

#### 4.9 Simpan

Di terminal kedua (folder `backend`):

```text
git add .
git commit -m "Skrip data latihan 7 hari (Modul 17 Praktik 4)"
git push
```

File `latihan-modul17.sql` buatanmu tersimpan di folder kerja DBeaver, bukan di repositori. Isinya nanti kamu salin ke repositori `belajar-iot` sebagai `modul-17/latihan.sql` di ➕ C, jadi untuk sekarang cukup pastikan skripnya tersimpan (**Ctrl + S**).

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 10](#10-dari-backend-pool-parameter-1-dan-kiriman-ganda).

### Praktik 5 — Backend v0.2 menyimpan semua pesan MQTT (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama untuk `npm run dev`, terminal kedua untuk perintah lain, keduanya di folder `backend`), **DBeaver**, **Docker Desktop** (kontainer `rumahpintar-db` menyala), dan gateway Pi dengan Node 1 dan Node 2 menyala. Jalur laptop: broker laptop dari Modul 12 Praktik 7 harus sudah berjalan. Jalur simulator: buka terminal ketiga (ikon **+**), lalu jalankan `cd alat` dan `node simulator-perangkat.js mqtt://192.168.1.37:1883` dengan alamat broker milikmu, seperti Modul 16 Praktik 7.2.
>
> ⭐ **Wajib** — syarat lulus: API riwayat (Praktik 7) mengembalikan data dari database, dan data itu dikumpulkan di praktik ini.

Sekarang buku arsip dipasang ke backend. Setiap pesan yang lolos pemeriksaan kontrak tetap ditulis ke papan pengumuman (gudang memori, seperti Modul 16), **dan** kini juga ke database.

#### 5.1 Penulis arsip: `src/db/arsip.ts`

Buat file `src/db/arsip.ts`:

```ts
// arsip.ts - menulis pesan yang sudah lolos pemeriksaan kontrak ke database.
// Gudang di memori (gudang.ts) tetap menjadi "papan pengumuman" keadaan terbaru; database adalah buku arsipnya.
import { pool } from "./pool.ts";
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

// Pastikan perangkat punya baris di tabel devices (dibuat kalau belum ada), lalu perbarui waktu terakhir terdengar.
// Kolom yang tidak diberikan (null) tidak menimpa isi lama, berkat coalesce.
async function catatPerangkat(deviceId: string, jenis: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id, jenis, status, terakhir_dilihat)
     VALUES ($1, coalesce($2, 'belum-diketahui'), coalesce($3, 'belum-diketahui'), now())
     ON CONFLICT (device_id) DO UPDATE SET
       jenis = coalesce($2, devices.jenis),
       status = coalesce($3, devices.status),
       terakhir_dilihat = now()`,
    [deviceId, jenis, status],
  );
}

// Simpan satu telemetry. Hasilnya false kalau bacaan dengan ts yang sama sudah tersimpan (kiriman ganda).
export async function arsipkanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): Promise<boolean> {
  const n2 = "tekanan" in isi ? isi : null; // Node 2 dikenali dari kolom tekanan (kontrak 1.2), seperti di gudang.ts
  const n1 = "tekanan" in isi ? null : isi; // selain itu, telemetry Node 1
  await catatPerangkat(deviceId, n2 ? "node2" : "node1", null);
  const hasil = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air,
                           tekanan, suhu_tanah, baterai, tanah_rs485, ec)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.fw, isi.suhu, isi.kelembapan, n1?.cahaya ?? null, isi.tanah, n1?.gerak ?? null,
      n1?.level_air ?? null, n2?.tekanan ?? null, isi.suhu_tanah ?? null, n2?.baterai ?? null,
      n1?.tanah_rs485 ?? null, n1?.ec ?? null],
  );
  return hasil.rowCount === 1;
}

export async function arsipkanStatus(deviceId: string, status: Status): Promise<void> {
  await catatPerangkat(deviceId, null, status);
}

export async function arsipkanVitals(deviceId: string, isi: Vitals): Promise<void> {
  await catatPerangkat(deviceId, null, null);
  await pool.query(
    `INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.rssi, isi.uptime_s, isi.heap_free],
  );
}

// Apakah database bisa dihubungi sekarang? Dipakai GET /health.
export async function databaseHidup(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
```

- **`catatPerangkat`** memastikan perangkat punya baris di `devices` sebelum bacaannya disimpan (kunci tamu, Konsep 4). `INSERT … ON CONFLICT (device_id) DO UPDATE SET …` berarti "tambahkan baris baru; kalau `device_id` itu sudah ada, perbarui saja kolom-kolom ini". Gabungan "*insert* atau *update*" ini sering disebut ***upsert***. `coalesce(a, b)` mengambil nilai pertama yang tidak `NULL`, jadi `jenis` dan `status` yang tidak diberikan (`null`) tidak menimpa isi lama.
- **`arsipkanTelemetry`** menulis satu `telemetry` ke `readings`. `"tekanan" in isi` memeriksa apakah pesannya punya kolom `tekanan`, kolom khas Node 2 (kontrak 1.2). Aturannya sama dengan cara `gudang.ts` menentukan jenis perangkat di Modul 16. TypeScript ikut memahami pemeriksaan ini: di bagian untuk Node 1, kolom khusus Node 1 (`cahaya`, `gerak`, `level_air`, `tanah_rs485`, `ec`) boleh dipakai, sedangkan kolom milik perangkat lain diisi `null`. Fungsi ini mengembalikan `true` kalau barisnya baru, dan `false` kalau `ON CONFLICT` melewatinya (`rowCount` 0, Konsep 10).
- **`arsipkanStatus`** dan **`arsipkanVitals`** menulis `status` ke `devices` dan `vitals` ke `device_health`.
- **`databaseHidup`** menjalankan kueri paling sederhana, `SELECT 1`, untuk memeriksa apakah database bisa dihubungi. Fungsi ini dipakai oleh `/health` dan saat server menyala.

Perhatikan bahwa setiap nilai dikirim lewat `$1`, `$2`, dan seterusnya, tidak pernah ditempel ke kalimat SQL (Konsep 10).

#### 5.2 Telinga yang mengarsipkan: `src/services/mqtt.ts`

Ada enam perubahan kecil di `mqtt.ts`, ditambah satu baris komentar di `gudang.ts`. Hasil akhirnya bisa dibandingkan dengan file [`mqtt.ts` tahap Praktik 5](kode/tahap/praktik-5/backend/src/services/mqtt.ts).

1. Di baris pertama, tambahkan kata "menyimpannya" ke komentar: `// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/#, memeriksa setiap pesan, menyimpannya, dan mengirim perintah.`
2. Di bawah baris `import { hitungan, … } from "./gudang.ts";`, tambahkan impor penulis arsip:

   ```ts
   import { arsipkanStatus, arsipkanTelemetry, arsipkanVitals } from "../db/arsip.ts";
   ```

3. Tepat di atas komentar `// ringkas daftar masalah dari Zod, …`, tambahkan fungsi kecil ini:

   ```ts
   // gagal menulis ke database (misalnya kontainer database dimatikan): catat di log, tetapi server tetap berjalan
   function gagalArsip(topik: string, log: FastifyBaseLogger) {
     return (galat: Error) => log.error(`gagal menyimpan ${topik} ke database: ${galat.message}`);
   }
   ```

4. Di bagian `status`, tambahkan satu baris di bawah `simpanStatus(…)` sehingga bagian itu menjadi seperti di bawah ini (baris pertama dan terakhir sudah ada, jangan ditulis dua kali):

   ```ts
       simpanStatus(deviceId, hasil.data);
       arsipkanStatus(deviceId, hasil.data).catch(gagalArsip(topik, log));
       hitungan.diterima++;
   ```

5. Di bagian `telemetry`, tambahkan empat baris di bawah `simpanTelemetry(…)` sehingga bagian itu menjadi seperti di bawah ini (baris pertama sudah ada, jangan ditulis dua kali):

   ```ts
       simpanTelemetry(deviceId, hasil.data);
       const ts = hasil.data.ts;
       arsipkanTelemetry(deviceId, hasil.data)
         .then((baru) => { if (!baru) log.info(`kiriman ganda dilewati: ${deviceId} ${ts}`); })
         .catch(gagalArsip(topik, log));
   ```

6. Di bagian `vitals`, tambahkan satu baris di bawah `simpanVitals(…)` sehingga bagian itu menjadi seperti di bawah ini (baris pertama sudah ada, jangan ditulis dua kali):

   ```ts
       simpanVitals(deviceId, hasil.data);
       arsipkanVitals(deviceId, hasil.data).catch(gagalArsip(topik, log));
   ```

Mengapa tidak memakai `await`? Telinga MQTT harus selalu siap mendengar pesan berikutnya, dan urutan selesainya penulisan arsip tidak penting. Jadi, penulisan dimulai lalu dibiarkan berjalan sendiri. **`.catch(…)`** menangkap kalau ia gagal (misalnya kontainer database mati), dan **`.then(…)`** membaca hasilnya kalau berhasil: `false` berarti kiriman ganda, dan backend mencatatnya di log. Tanpa `.catch`, satu kegagalan database akan menjadi galat yang tidak tertangkap dan bisa mematikan server.

Terakhir, di file lain: buka `src/services/gudang.ts`, lalu ganti baris komentar keduanya. Di Modul 16, komentar itu meramalkan bahwa gudang akan diganti database. Ternyata gudang tetap dipakai, dan database menemaninya (Konsep 1):

```ts
// Data ini hilang saat server dimatikan; salinan permanennya disimpan ke database oleh arsip.ts (Modul 17).
```

#### 5.3 `/health` yang memeriksa database

Ganti isi `src/routes/kesehatan.ts` dengan:

```ts
// kesehatan.ts - GET /health: apakah server hidup, tersambung ke broker, dan bisa menghubungi database?
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { hitungan } from "../services/gudang.ts";
import { brokerTersambung } from "../services/mqtt.ts";
import { databaseHidup } from "../db/arsip.ts";

export const ruteKesehatan: FastifyPluginAsyncZod = async (app) => {
  app.get("/health", {
    schema: {
      tags: ["server"],
      summary: "Keadaan server: hidup, tersambung ke broker dan database, serta jumlah pesan",
      response: {
        200: z.object({ ok: z.boolean(), broker: z.boolean(), database: z.boolean(), diterima: z.number(), ditolak: z.number() })
          .describe("server hidup; broker dan database = bisa dihubungi atau tidak"),
      },
    },
  }, async () => {
    return { ok: true, broker: brokerTersambung(), database: await databaseHidup(), diterima: hitungan.diterima, ditolak: hitungan.ditolak };
  });
};
```

`/health` kini juga menjawab `database: true` atau `false`. Kata kunci `await` di depan `databaseHidup()` membuat rute menunggu jawaban `SELECT 1` sebelum menjawab.

#### 5.4 `server.ts` v0.2

Ganti isi `src/server.ts` dengan:

```ts
// server.ts - pintu masuk backend Rumah Pintar Mini v0.2 (Modul 17: data tersimpan di database).
// Jalankan: npm run dev (otomatis mulai ulang saat file disimpan) atau npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";
import { rutePerangkat } from "./routes/perangkat.ts";
import { mulaiMqtt } from "./services/mqtt.ts";
import { databaseHidup } from "./db/arsip.ts";

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
  openapi: { info: { title: "Rumah Pintar Mini API", description: "Backend v0.2 (Modul 17)", version: "0.2.0" } },
  transform: jsonSchemaTransform, // skema Zod yang sama menjadi dokumentasi OpenAPI
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(ruteKesehatan);
await app.register(rutePerangkat);

if (await databaseHidup()) app.log.info("database siap");
else app.log.warn("database belum bisa dihubungi: periksa kontainer database dan DATABASE_URL di .env");
mulaiMqtt(env.MQTT_URL, app.log);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`dokumentasi API: http://${env.HOST}:${env.PORT}/docs`);
```

Dua perubahan dari Modul 16: keterangan di bawah judul dokumentasi (`Rumah Pintar Mini API`) kini `Backend v0.2 (Modul 17)` dengan versi `0.2.0`, dan sebelum mendengar broker, server memeriksa database sekali lalu menulis `database siap` (atau peringatan kalau belum bisa dihubungi). Walaupun database mati, server tetap menyala karena papan pengumumannya masih berguna; hanya arsipnya yang absen sampai database kembali.

#### 5.5 Naikkan versinya

Di terminal kedua (folder `backend`):

```text
npm version 0.2.0 --no-git-tag-version
```

Perintah itu menjawab `v0.2.0` dan mengubah angka versi di `package.json` dan `package-lock.json` sekaligus. `--no-git-tag-version` mencegah npm membuat *commit* dan *tag* Git sendiri karena *commit* kita buat dengan tangan. Lalu buka `package.json` dan perbarui baris `"description"` menjadi:

```json
"description": "Backend Rumah Pintar Mini (Modul 16-17): mendengar MQTT, memeriksa kontrak data, menyimpan semua pesan ke database, dan menyediakan API",
```

#### 5.6 Jalankan

Pastikan kontainer `rumahpintar-db` menyala, lalu periksa tipe di terminal kedua dengan `npm run cek` (harus bersih). Di terminal pertama (folder `backend`; terminal yang baru dibuka perlu `cd backend` dulu), jalankan `npm run dev`. **Hasilnya** di terminal pertama:

```text
[10:30:44] INFO: database siap
[10:30:44] INFO: Server listening at http://127.0.0.1:8080
[10:30:44] INFO: dokumentasi API: http://127.0.0.1:8080/docs
[10:30:44] INFO: tersambung ke broker mqtt://192.168.1.37:1883
```

Kalau yang muncul `database belum bisa dihubungi`, periksa kontainernya (`docker ps`) dan baris `DATABASE_URL` di `.env`. Lalu buka `http://127.0.0.1:8080/health` di browser. **Hasilnya** (angka `diterima` terus bertambah):

```json
{"ok":true,"broker":true,"database":true,"diterima":10,"ditolak":0}
```

#### 5.7 Lihat datanya berdatangan

Tunggu satu menit, lalu jalankan kedua kueri ini di DBeaver (koneksi `rumahpintar`) satu per satu dengan **Ctrl + Enter**, seperti di 4.3. Ganti `device_id` contoh dengan milikmu. Di jalur simulator, perangkat palsu juga berawalan `f00d`, jadi di kueri pertama ganti `NOT LIKE` dengan `LIKE` (dua perangkat latihan Praktik 4 kini ikut dipakai simulator), dan di kueri kedua pakai `f00d00000001`:

```sql
SELECT device_id, jenis, status, terakhir_dilihat FROM devices WHERE device_id NOT LIKE 'f00d%';
SELECT ts, suhu, kelembapan, tanah, tekanan, suhu_tanah FROM readings WHERE device_id = 'a4cf12e5b7c0' ORDER BY ts DESC LIMIT 3;
```

**Hasilnya** (contoh dari psql, dengan Node 1 dan Node 2 tiruan di lab penulis):

```text
  device_id   | jenis | status |       terakhir_dilihat        
--------------+-------+--------+-------------------------------
 246f28b1c7d4 | node2 | online | 2026-10-20 03:31:12.898204+00
 a4cf12e5b7c0 | node1 | online | 2026-10-20 03:31:18.550391+00
(2 rows)

           ts           | suhu | kelembapan | tanah | tekanan | suhu_tanah 
------------------------+------+------------+-------+---------+------------
 2026-10-20 03:31:18+00 | 28.5 |         71 |    37 |         |           
 2026-10-20 03:31:08+00 | 28.5 |         71 |    37 |         |           
 2026-10-20 03:30:58+00 | 28.5 |         71 |    37 |         |           
(3 rows)
```

Baris `devices` untuk Node 1 dan Node 2 dibuat **sendiri** oleh backend saat pesan pertamanya tiba. Bacaan Node 1 datang setiap 10 detik. Kolom `tekanan`-nya kosong (`NULL`) karena itu kolom khusus Node 2, dan `suhu_tanah` juga kosong kalau Node 1-mu tidak memakai sensor tanah RS-485 dari Modul 15. Jalankan kuerinya beberapa kali dan perhatikan baris baru bermunculan. `vitals` dikirim saat perangkat menyambung dan setiap 5 menit sesudahnya, jadi `SELECT * FROM device_health;` mungkin baru berisi setelah beberapa menit.

Sekarang beri nama dan lokasi perangkat sungguhanmu (ganti `device_id` dengan milikmu; di jalur simulator, lewati langkah ini karena `f00d00000001` dan `f00d00000002` sudah punya nama dari data latihan):

```sql
UPDATE devices SET nama = 'Node 1 Rumah', lokasi = 'ruang tamu' WHERE device_id = 'a4cf12e5b7c0';
UPDATE devices SET nama = 'Node 2 Kebun', lokasi = 'kebun' WHERE device_id = '246f28b1c7d4';
```

Backend tidak pernah menimpa `nama` dan `lokasi` (kolom itu tidak ada di `catatPerangkat`), jadi isian manusia ini aman.

#### 5.8 Matikan server, nyalakan lagi: arsipnya tetap ada

1. Di DBeaver, hitung bacaan Node 1: `SELECT count(*) FROM readings WHERE device_id = 'a4cf12e5b7c0';`. Catat angkanya, misalnya `33`. Di jalur simulator, pakai `f00d00000001`; angkanya di atas 1.000 karena data latihan Praktik 4 ikut terhitung.
2. Di terminal pertama, hentikan server dengan **Ctrl + C**, tunggu setengah menit, lalu jalankan lagi `npm run dev`.
3. Buka `http://127.0.0.1:8080/devices`. Sesaat setelah menyala, daftarnya bisa masih kosong, atau perangkatnya sudah muncul lagi dengan `"jenis":"belum-diketahui"` karena baru pesan `status` *retained*-nya yang tiba (Modul 16 Praktik 3.6). **Papan pengumuman** (memori) memang mulai dari nol, sama seperti Modul 16.
4. Jalankan lagi kueri `count(*)` di DBeaver. Angkanya **tidak** kembali ke nol. Ia sama dengan atau lebih besar daripada angka di langkah 1 karena **buku arsip** (database) tidak ikut terhapus.

Itulah perbedaan antara papan pengumuman dan buku arsip (Konsep 1). Bacaan selama server mati tidak tersimpan karena tidak ada yang mendengarnya, tetapi semua yang tersimpan sebelumnya tetap ada.

#### 5.9 Simpan

Di terminal kedua (folder `backend`):

```text
git add .
git commit -m "Backend v0.2 menyimpan semua pesan MQTT ke database (Modul 17 Praktik 5)"
git push
```

> ➡️ **Lanjut** ke [Praktik 6](#praktik-6--kiriman-ganda-tersimpan-sekali-20-menit). Biarkan server di terminal pertama tetap berjalan.

### Praktik 6 — Kiriman ganda tersimpan sekali (20 menit)

> 🖥️ **Alat yang dipakai:** **MQTTX** (sambungan **Gateway Pi**, atau **Lewat IP laptop** di jalur laptop), **VS Code** (backend v0.2 tetap berjalan di terminal pertama; kalau kamu melanjutkan di hari lain, buka Docker Desktop dulu, lalu jalankan lagi `npm run dev` di terminal pertama, setelah `cd backend` kalau terminalnya baru dibuka), dan **DBeaver**.
>
> ⭐ **Wajib** — syarat lulus: kiriman ganda tidak membuat baris dobel.

Kiriman ganda sungguhan jarang terjadi dan tidak bisa ditunggu. Jadi, kita membuatnya sendiri: pesan `telemetry` yang sama persis dikirim dua kali dari MQTTX, atas nama perangkat uji `f00d00000099`.

#### 6.1 Kirim pesan yang sama dua kali

Di **MQTTX** (sambungan **Gateway Pi** atau **Lewat IP laptop**, kotak **Retain** tidak tercentang, QoS **1**, format **JSON**), kirim pesan ini ke topik `rpm/f00d00000099/telemetry`:

```json
{"ts":"2026-10-20T03:10:00Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}
```

Lalu kirim lagi **pesan yang sama persis**, tanpa mengubah apa pun. **Hasilnya** di terminal pertama (backend), setelah kiriman kedua:

```text
[10:40:51] INFO: kiriman ganda dilewati: f00d00000099 2026-10-20T03:10:00Z
```

Kiriman pertama tidak dicatat di log karena menyimpan bacaan baru adalah hal biasa. Kiriman kedua dikenali sebagai ganda. Tidak muncul baris itu? Kalau log menulis `DITOLAK rpm/f00d00000099/telemetry: …`, isi pesannya berubah saat disalin, jadi salin ulang persis dari kotak di atas. Kalau log diam sama sekali, MQTTX dan backend tidak tersambung ke broker yang sama: bandingkan alamat sambungan MQTTX dengan `MQTT_URL` di `.env`. Sekarang periksa di DBeaver:

```sql
SELECT device_id, ts, diterima, suhu FROM readings WHERE device_id = 'f00d00000099';
```

Hanya **satu** baris. Kolom `diterima` menunjukkan kapan kiriman **pertama** tiba di backend; kiriman kedua tidak meninggalkan jejak apa pun di tabel.

#### 6.2 Waktu berbeda = bacaan baru

Ubah `ts` di pesan MQTTX menjadi `"2026-10-20T03:10:10Z"` (sepuluh detik kemudian), lalu kirim sekali. Jalankan lagi kueri `SELECT` dari 6.1: kini ada **dua** baris. Bagi database, `(f00d00000099, 03:10:00)` dan `(f00d00000099, 03:10:10)` adalah dua kunci berbeda, jadi keduanya bacaan sah. Yang ditolak hanya pasangan perangkat dan waktu yang **persis sama** (Konsep 10).

#### 6.3 Tanpa `ON CONFLICT`

Apa yang terjadi kalau `ON CONFLICT DO NOTHING` lupa ditulis? Coba di DBeaver, dengan baris yang sudah ada:

```sql
INSERT INTO readings (device_id, ts, fw, suhu) VALUES ('f00d00000099', '2026-10-20T03:10:00Z', '1.4.0', 28.5);
```

**Hasilnya** (psql; di DBeaver, pesan yang sama tampil di panel hasil di bawah editor, diawali `SQL Error [23505]:`, dan baris `DETAIL:` ditulis `Detail:`):

```text
ERROR:  duplicate key value violates unique constraint "readings_pkey"
DETAIL:  Key (device_id, ts)=(f00d00000099, 2026-10-20 03:10:00+00) already exists.
```

Kunci utama tetap menolak baris kembar, tetapi sebagai **galat**. Di backend, galat seperti ini akan muncul di log sebagai `gagal menyimpan …` setiap kali ada kiriman ganda, padahal tidak ada yang salah. Dengan `ON CONFLICT (device_id, ts) DO NOTHING`, kiriman ganda dilewati dengan tenang, dan backend bisa membedakannya dari galat sungguhan lewat `rowCount`. `readings_pkey` adalah nama yang diberikan PostgreSQL untuk kunci utama tabel `readings`. Di DBeaver, nilai `ts` di pesan galat ditulis dalam jam laptopmu (`… 10:10:00+07`).

#### 6.4 Bersihkan perangkat uji

Hapus bacaan perangkat uji **lebih dulu**, baru perangkatnya. Urutan sebaliknya ditolak oleh kunci tamu (Praktik 4.4):

```sql
DELETE FROM readings WHERE device_id = 'f00d00000099';
DELETE FROM devices WHERE device_id = 'f00d00000099';
```

Jawaban psql: `DELETE 2` (dua bacaan dari 6.1 dan 6.2), lalu `DELETE 1`. Perangkat uji ini masih tercatat di **papan pengumuman** backend (`GET /devices`) sampai server dimulai ulang. Tidak apa-apa karena papan itu memang hanya ingatan sementara.

> ➡️ **Lanjut** ke [Praktik 7](#praktik-7--api-riwayat-dan-perintah-yang-tercatat-40-menit).

### Praktik 7 — API riwayat dan perintah yang tercatat (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (server tetap berjalan di terminal pertama; perintah lain di terminal kedua, keduanya di folder `backend`), **browser**, **Bruno**, **DBeaver**, **Docker Desktop** (kontainer `rumahpintar-db` menyala), dan Node 1 yang menyala (atau simulator Modul 16 di terminal ketiga). Melanjutkan di hari lain? Buka Docker Desktop dulu, lalu jalankan lagi `npm run dev` di terminal pertama (terminal baru perlu `cd backend` dulu). Di jalur simulator, nyalakan juga simulatornya di terminal ketiga seperti kotak 🖥️ Praktik 5.
>
> ⭐ **Wajib** — syarat lulus: `GET /devices/<id>/readings` mengembalikan riwayat bacaan dari database, dan permintaannya tersimpan di koleksi Bruno.

Di Modul 16, backend hanya bisa menjawab bacaan **terakhir**, dan riwayatnya "menunggu database di Modul 17". Sekarang buku arsipnya sudah terisi, tetapi baru bisa dibaca lewat DBeaver. Dashboard di Modul 22 dan aplikasi lain tidak akan membuka database sendiri. Mereka bertanya kepada backend lewat API, seperti tamu yang memesan lewat pelayan (analogi pelayan restoran, Modul 16). Backend memeriksa pertanyaannya, membatasi besar jawabannya, dan menyimpan sandi database untuk dirinya sendiri.

Praktik ini menambah satu pintu baru, **`GET /devices/:id/readings?from=…&to=…`** ("berikan bacaan perangkat ini dari waktu sekian sampai waktu sekian"), lalu sekalian mencatat setiap perintah dari API ke tabel `commands`.

#### 7.1 Buku arsip yang juga bisa dibaca: `src/db/arsip.ts` lengkap

Ganti isi `src/db/arsip.ts` dengan versi lengkapnya:

```ts
// arsip.ts - menulis pesan yang sudah lolos pemeriksaan kontrak ke database, dan membacanya lagi untuk API riwayat.
// Gudang di memori (gudang.ts) tetap menjadi "papan pengumuman" keadaan terbaru; database adalah buku arsipnya.
import { pool } from "./pool.ts";
import type { Ack, PerintahSet, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

// Pastikan perangkat punya baris di tabel devices (dibuat kalau belum ada), lalu perbarui waktu terakhir terdengar.
// Kolom yang tidak diberikan (null) tidak menimpa isi lama, berkat coalesce.
async function catatPerangkat(deviceId: string, jenis: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id, jenis, status, terakhir_dilihat)
     VALUES ($1, coalesce($2, 'belum-diketahui'), coalesce($3, 'belum-diketahui'), now())
     ON CONFLICT (device_id) DO UPDATE SET
       jenis = coalesce($2, devices.jenis),
       status = coalesce($3, devices.status),
       terakhir_dilihat = now()`,
    [deviceId, jenis, status],
  );
}

// Simpan satu telemetry. Hasilnya false kalau bacaan dengan ts yang sama sudah tersimpan (kiriman ganda).
export async function arsipkanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): Promise<boolean> {
  const n2 = "tekanan" in isi ? isi : null; // Node 2 dikenali dari kolom tekanan (kontrak 1.2), seperti di gudang.ts
  const n1 = "tekanan" in isi ? null : isi; // selain itu, telemetry Node 1
  await catatPerangkat(deviceId, n2 ? "node2" : "node1", null);
  const hasil = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air,
                           tekanan, suhu_tanah, baterai, tanah_rs485, ec)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.fw, isi.suhu, isi.kelembapan, n1?.cahaya ?? null, isi.tanah, n1?.gerak ?? null,
      n1?.level_air ?? null, n2?.tekanan ?? null, isi.suhu_tanah ?? null, n2?.baterai ?? null,
      n1?.tanah_rs485 ?? null, n1?.ec ?? null],
  );
  return hasil.rowCount === 1;
}

export async function arsipkanStatus(deviceId: string, status: Status): Promise<void> {
  await catatPerangkat(deviceId, null, status);
}

export async function arsipkanVitals(deviceId: string, isi: Vitals): Promise<void> {
  await catatPerangkat(deviceId, null, null);
  await pool.query(
    `INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.rssi, isi.uptime_s, isi.heap_free],
  );
}

// Satu perintah dari API beserta hasilnya: ack (ok atau ditolak) atau null kalau tidak ada ack dalam 5 detik.
export async function arsipkanPerintah(idPerintah: string, deviceId: string, perintah: PerintahSet, dikirim: Date,
  ack: Ack | null, lamaMs: number): Promise<void> {
  await pool.query(
    `INSERT INTO commands (id, device_id, dikirim, target, nilai, ack_ok, ack_pesan, lama_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [idPerintah, deviceId, dikirim, perintah.target, JSON.stringify(perintah.nilai), ack?.ok ?? null,
      ack?.pesan ?? null, lamaMs],
  );
}

// Waktu berformat kontrak data (UTC, tanpa milidetik), misalnya 2026-10-20T03:10:00Z
export const waktuKontrak = (waktu: Date) => waktu.toISOString().slice(0, 19) + "Z";

// Bentuk satu baris readings saat dibaca lewat pg: timestamptz menjadi objek Date JavaScript.
interface BarisBacaan {
  ts: Date;
  fw: string;
  suhu: number | null;
  kelembapan: number | null;
  cahaya: number | null;
  tanah: number | null;
  gerak: boolean | null;
  level_air: number | null;
  tekanan: number | null;
  suhu_tanah: number | null;
  baterai: number | null;
  tanah_rs485: number | null;
  ec: number | null;
}

const BATAS = 1000; // paling banyak 1.000 bacaan per permintaan

// Riwayat bacaan satu perangkat dalam rentang [dari, sampai), terlama lebih dulu. Diminta 1.001 baris supaya ketahuan
// kalau sebenarnya ada lebih dari 1.000: jawabannya dipotong, dan terpotong bernilai true.
export async function ambilRiwayat(deviceId: string, dari: Date, sampai: Date) {
  const hasil = await pool.query<BarisBacaan>(
    `SELECT ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air, tekanan, suhu_tanah, baterai, tanah_rs485, ec
     FROM readings
     WHERE device_id = $1 AND ts >= $2 AND ts < $3
     ORDER BY ts
     LIMIT $4`,
    [deviceId, dari, sampai, BATAS + 1],
  );
  const bacaan = hasil.rows.slice(0, BATAS).map((baris) => ({ ...baris, ts: waktuKontrak(baris.ts) })); // ts sebagai teks
  return { bacaan, terpotong: hasil.rows.length > BATAS };
}

// Apakah database bisa dihubungi sekarang? Dipakai GET /health.
export async function databaseHidup(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
```

Bagian atasnya (`catatPerangkat` sampai `arsipkanVitals`) sama dengan Praktik 5. Yang baru:

- **`arsipkanPerintah`** mencatat satu perintah beserta hasilnya ke tabel `commands`. Kolom `ack_ok` berisi `true` atau `false` dari `ack`, atau `NULL` kalau tidak ada `ack` dalam 5 detik. Untuk fungsi ini, baris `import type` di atas kini juga mengambil `Ack` dan `PerintahSet` dari kontrak. `JSON.stringify(perintah.nilai)` mengubah nilai perintah (`true`, `30`) menjadi teks JSON untuk kolom `nilai` yang bertipe `jsonb` (Praktik 3).
- **`waktuKontrak`** menulis waktu dengan format kontrak data, misalnya `2026-10-20T03:10:00Z`. `toISOString()` menghasilkan `2026-10-20T03:10:00.000Z`; `.slice(0, 19)` mengambil 19 karakter pertamanya (milidetiknya terbuang), lalu huruf `Z` ditambahkan lagi.
- **`BarisBacaan`** memberi tahu TypeScript bentuk satu baris `readings` saat dibaca lewat `pg`: kolom `timestamptz` datang sebagai objek `Date` (Konsep 9), kolom angka sebagai `number`, dan kolom kosong sebagai `null`. Dengan `pool.query<BarisBacaan>(…)`, TypeScript tahu isi `hasil.rows` dan bisa memeriksa kode yang memakainya.
- **`ambilRiwayat`** menjalankan kueri riwayat: bacaan satu perangkat dengan `ts >= $2 AND ts < $3`, terlama lebih dulu (`ORDER BY ts`). Awal rentang ikut dihitung, akhirnya tidak. Dengan begitu, dua rentang yang bersambung, misalnya pukul 06.00–07.00 dan 07.00–08.00, tidak pernah menghitung bacaan pukul 07.00 dua kali.
- **Batas 1.000 bacaan (`BATAS`).** Node 1 mengirim 360 bacaan per jam, atau 8.640 per hari. Tanpa batas, permintaan "seminggu" akan mengembalikan puluhan ribu baris sekaligus dan membuat backend serta browser kewalahan. Karena itu, fungsi ini meminta `BATAS + 1` baris (1.001). Kalau yang datang memang 1.001, berarti rentang itu berisi lebih dari 1.000 bacaan: yang dikirim tetap 1.000 bacaan pertama, dan `terpotong` bernilai `true` supaya peminta tahu jawabannya belum lengkap. Modul 18 menambahkan cara yang lebih baik untuk rentang panjang, yaitu rata-rata per jam, bukan ribuan bacaan mentah.
- **`.map((baris) => ({ ...baris, ts: waktuKontrak(baris.ts) }))`** mengubah setiap baris sebelum dikirim. `...baris` (tiga titik, disebut *spread*) menyalin semua kolom baris itu, lalu `ts` diganti dengan teks berformat kontrak.

#### 7.2 Pintu baru: `src/routes/perangkat.ts`

Ada lima perubahan di `src/routes/perangkat.ts`. Semuanya **tambahan**, jadi rute lain yang mungkin kamu buat sendiri (misalnya dari 🧩 Modul 16) tetap aman. Hasil akhirnya bisa dibandingkan dengan file [`perangkat.ts` akhir](kode/backend/src/routes/perangkat.ts).

1. Di baris pertama, ubah komentarnya menjadi: `// perangkat.ts - rute /devices: daftar perangkat, bacaan terbaru, riwayat dari database, dan perintah.`
2. Di bawah baris `import { brokerTersambung, … } from "../services/mqtt.ts";`, tambahkan impor dari buku arsip:

   ```ts
   import { ambilRiwayat, arsipkanPerintah, waktuKontrak } from "../db/arsip.ts";
   ```

3. Di bawah baris `const ParamId = …;`, tambahkan dua skema baru, `Rentang` dan `Bacaan`:

   ```ts
   const Rentang = z.object({
     from: z.iso.datetime({ offset: true }).optional()
       .describe("awal rentang, misalnya 2026-10-20T10:00:00+07:00 (bawaan: 1 jam sebelum to)"),
     to: z.iso.datetime({ offset: true }).optional().describe("akhir rentang, tidak ikut dihitung (bawaan: sekarang)"),
   }).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // rentang terbalik ditolak dengan kode 400
     message: "harus lebih akhir daripada from", path: ["to"],
     when: (hasil) => hasil.issues.length === 0, // urutan diperiksa hanya kalau from dan to sudah lolos pemeriksaan format
   });
   const angka = z.number().nullable(); // kolom yang tidak dimiliki perangkat berisi null
   const Bacaan = z.object({
     ts: z.string(), fw: z.string(), suhu: angka, kelembapan: angka, cahaya: angka, tanah: angka, gerak: z.boolean().nullable(),
     level_air: angka, tekanan: angka, suhu_tanah: angka, baterai: angka, tanah_rs485: angka, ec: angka,
   });
   ```

   - **`Rentang`** adalah skema Zod untuk ***query string***, yaitu bagian alamat setelah tanda `?` (misalnya `?from=…&to=…`). `from` dan `to` boleh tidak diisi (`.optional()`), tetapi kalau diisi harus berupa waktu ISO 8601 lengkap dengan zonanya (`z.iso.datetime({ offset: true })`): berakhiran `Z` (UTC) atau `+07:00` (WIB).
   - **`.refine(…)`** menambahkan aturan yang melibatkan dua kolom sekaligus: `to` harus lebih akhir daripada `from`. Isian `when` membuat aturan itu baru diperiksa setelah `from` dan `to` lolos pemeriksaan format supaya pesan galatnya tidak menumpuk.
   - **`Bacaan`** adalah bentuk satu bacaan di jawaban. Semua kolom sensor boleh `null` (`angka = z.number().nullable()`) karena setiap perangkat hanya mengisi kolom miliknya sendiri.

4. Di antara rute `GET /devices/:id/vitals` dan rute `POST /devices/:id/command`, tambahkan rute baru ini:

   ```ts
     app.get("/devices/:id/readings", {
       schema: {
         tags: ["perangkat"],
         summary: "Riwayat bacaan satu perangkat dari database (paling banyak 1.000 bacaan)",
         params: ParamId,
         querystring: Rentang,
         response: {
           200: z.object({
             device_id: z.string(), dari: z.string(), sampai: z.string(), jumlah: z.number(), terpotong: z.boolean(),
             bacaan: z.array(Bacaan),
           }).describe("bacaan dalam rentang itu, terlama lebih dulu; terpotong = ada lebih dari 1.000 bacaan"),
           503: Galat.describe("database sedang tidak bisa dihubungi"),
         },
       },
     }, async (req, reply) => {
       const sampai = req.query.to ? new Date(req.query.to) : new Date();
       const dari = req.query.from ? new Date(req.query.from) : new Date(sampai.getTime() - 60 * 60 * 1000);
       try {
         const { bacaan, terpotong } = await ambilRiwayat(req.params.id, dari, sampai);
         return {
           device_id: req.params.id, dari: waktuKontrak(dari), sampai: waktuKontrak(sampai), jumlah: bacaan.length, terpotong,
           bacaan,
         };
       } catch (galat) {
         req.log.error(`riwayat ${req.params.id} gagal dibaca dari database: ${(galat as Error).message}`);
         return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
       }
     });
   ```

   - **`querystring: Rentang`** memasang pemeriksa untuk `from` dan `to`, seperti `params: ParamId` memeriksa `id` sejak Modul 16.
   - Kalau `to` kosong, `sampai` berarti sekarang; kalau `from` kosong, `dari` berarti satu jam sebelum `sampai`. Satu jam berisi 360 bacaan Node 1, jauh di bawah batas 1.000.
   - Jawabannya memuat `dari` dan `sampai` yang benar-benar dipakai, `jumlah` bacaan, `terpotong`, dan daftar `bacaan`. Rute ini sengaja tidak memeriksa apakah perangkatnya pernah terdengar: "bacaan perangkat X kemarin" tetap pertanyaan yang sah walaupun jawabannya kosong.
   - **`try … catch`**: kalau database sedang tidak bisa dihubungi, rincian galatnya dicatat di log, dan peminta menerima `503` dengan pesan yang jelas, bukan `500` yang memamerkan alamat database. Polanya sama dengan `503` di rute perintah saat broker putus.

5. Di rute perintah, tambahkan dua baris di bawah `const lama = Date.now() - mulai;` sehingga bagian itu menjadi seperti di bawah ini (baris pertama sudah ada, jangan ditulis dua kali):

   ```ts
       const lama = Date.now() - mulai;
       arsipkanPerintah(idPerintah, p.device_id, req.body, new Date(mulai), ack, lama)
         .catch((galat) => req.log.error(`gagal mencatat perintah ${idPerintah} ke database: ${galat.message}`));
   ```

   Setiap perintah yang benar-benar dikirim kini dicatat, baik `ack`-nya datang maupun tidak (`504`). Seperti penulisan arsip di Praktik 5, pencatatan ini tidak ditunggu, dan kegagalannya cukup dicatat di log karena jawaban untuk Bruno tidak boleh tertunda atau gagal hanya gara-gara pencatatan. Perintah yang ditolak sebelum dikirim (`404`, `409`, atau `503`) tidak dicatat karena memang tidak pernah sampai ke perangkat.

#### 7.3 Jalankan, lalu tanya riwayatnya lewat browser

Di terminal kedua, jalankan `npm run cek`; hasilnya harus bersih. Server di terminal pertama sudah dimulai ulang sendiri setiap kali kamu menyimpan file karena `npm run dev` memakai `--watch` (Modul 16). Pastikan baris terakhirnya kembali `tersambung ke broker …`, tanpa galat merah.

**1. Satu jam terakhir.** Buka alamat ini di browser (ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu, atau `f00d00000001` kalau memakai simulator):

```text
http://127.0.0.1:8080/devices/a4cf12e5b7c0/readings
```

**Hasilnya** (aslinya satu baris panjang; di sini dipendekkan):

```text
{"device_id":"a4cf12e5b7c0","dari":"2026-10-20T03:02:14Z","sampai":"2026-10-20T04:02:14Z","jumlah":184,"terpotong":false,
"bacaan":[{"ts":"2026-10-20T03:30:48Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,
"level_air":64,"tekanan":null,"suhu_tanah":null,"baterai":null,"tanah_rs485":null,"ec":null}, … ]}
```

- Tanpa `from` dan `to`, rentangnya **satu jam terakhir**. Semua waktu di jawaban memakai UTC (`Z`), sama seperti kontrak data: `03:02` UTC adalah pukul 10.02 WIB. Mengubahnya ke jam setempat adalah tugas tampilan, misalnya dashboard di Modul 22.
- Bacaan pertama di contoh ini `03:30:48Z` (10.30 WIB), bukan `03:02`, karena backend baru mulai mengarsipkan sejak Praktik 5. Bacaan sebelum itu memang tidak pernah tersimpan.
- Kolom yang tidak dimiliki Node 1 (`tekanan`, `baterai`) selalu `null`. `suhu_tanah`, `tanah_rs485`, dan `ec` juga `null`, kecuali Node 1-mu memakai sensor tanah RS-485 dari Modul 15.
- `jumlah` di layarmu tentu berbeda. Muat ulang halamannya setelah 10 detik (**F5**): selama backend belum genap satu jam mengarsipkan, `jumlah` bertambah satu setiap 10 detik. Setelah itu, angkanya bertahan di sekitar 360.

**2. Rentang tertentu, dalam WIB.** Data latihan Praktik 4 cocok untuk mencoba rentang karena isinya sama di laptop siapa pun. Di alamat di bawah ini, ganti dulu `2026-10-19` (ada dua) dengan tanggal **sehari sebelum** kamu mengisi data latihan lewat `npm run isi-riwayat` (Praktik 4.2, atau saat terakhir kali kamu mengosongkan lalu mengisinya ulang), lalu buka alamatnya. Pada contoh modul ini, data latihan diisi tanggal 20.

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06:00:00%2B07:00&to=2026-10-19T07:00:00%2B07:00
```

**Hasilnya** (dirapikan dan dipendekkan; angkanya sama di laptopmu):

```text
{
  "device_id": "f00d00000001",
  "dari": "2026-10-18T23:00:00Z",
  "sampai": "2026-10-19T00:00:00Z",
  "jumlah": 6,
  "terpotong": false,
  "bacaan": [
    {"ts": "2026-10-18T23:00:00Z", "fw": "1.4.0", "suhu": 23.8, "kelembapan": 79, "cahaya": 33, "tanah": 68, … },
    … lima bacaan lagi …
  ]
}
```

Keenam bacaannya, kalau dirangkum:

| `ts` (UTC) | Jam WIB (tanggal 19) | `suhu` | `cahaya` | `tanah` |
| :--- | :--- | ---: | ---: | ---: |
| `2026-10-18T23:00:00Z` | 06.00 | `23.8` | `33` | `68` |
| `2026-10-18T23:10:00Z` | 06.10 | `23.4` | `185` | `68` |
| `2026-10-18T23:20:00Z` | 06.20 | `23.4` | `307` | `68` |
| `2026-10-18T23:30:00Z` | 06.30 | `24.1` | `484` | `67` |
| `2026-10-18T23:40:00Z` | 06.40 | `24.2` | `610` | `67` |
| `2026-10-18T23:50:00Z` | 06.50 | `23.8` | `747` | `67` |

- **`%2B` adalah tanda `+` yang "dibungkus".** Di alamat web, tanda `+` di bagian *query string* dibaca sebagai **spasi**. Kalau kamu menulis `+07:00` apa adanya, backend menerima `2026-10-19T06:00:00 07:00` dan menolaknya. Coba sendiri: ganti kedua `%2B` dengan `+`. **Hasilnya:**

  ```json
  {"statusCode":400,"code":"FST_ERR_VALIDATION","error":"Bad Request","message":"querystring/from tanggal dan waktu format ISO tidak valid, querystring/to tanggal dan waktu format ISO tidak valid"}
  ```

  Cara membungkus ini disebut *URL encoding* (pengodean URL): tanda `%` diikuti nomor tanda itu dalam heksadesimal, dan nomor tanda `+` adalah `2B`. Kalau tidak mau membungkusnya, hindari tanda `+` sama sekali: tulis waktunya dalam UTC dengan akhiran `Z`. Untuk rentang yang sama persis: `from=2026-10-18T23:00:00Z&to=2026-10-19T00:00:00Z`.
- **Jawabannya selalu dalam UTC.** Kamu bertanya mulai pukul 06.00 WIB tanggal 19, dan backend menjawab `"dari":"2026-10-18T23:00:00Z"`. Itu titik waktu yang sama, hanya ditulis dalam UTC (Konsep 9).
- **Inilah penyiraman pukul 06.00.** `tanah` bacaan pertama `68`, lalu perlahan turun. `cahaya` naik dari puluhan ke ratusan karena matahari terbit.
- Tinggal di zona WITA atau WIT? Contoh ini tetap memakai `%2B07:00` supaya hasilnya sama dengan modul. Untuk jam setempatmu sendiri, pakai `%2B08:00` (WITA) atau `%2B09:00` (WIT). Jawabannya tetap dalam UTC.

**3. Pertanyaan yang ditolak.** Coba tiga alamat ini satu per satu (pakai tanggalmu). Semuanya dijawab dengan kode `400` dan `"code":"FST_ERR_VALIDATION"`; yang berbeda hanya isi `message`-nya:

- **Rentang terbalik** (`from` lebih akhir daripada `to`):

  ```text
  http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T07:00:00%2B07:00&to=2026-10-19T06:00:00%2B07:00
  ```

  `message`-nya `querystring/to harus lebih akhir daripada from`.
- **Tanggal tanpa jam**: `http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19`. `message`-nya `querystring/from tanggal dan waktu format ISO tidak valid` karena jam dan zonanya wajib ditulis.
- **`device_id` berhuruf besar**: `http://127.0.0.1:8080/devices/A4CF12E5B7C0/readings`. `message`-nya `params/id device_id harus 12 digit heksadesimal huruf kecil`, sama seperti rute-rute Modul 16.

Ketiganya ditolak di pintu oleh Fastify, sebelum satu kueri pun sampai ke database. Sebaliknya, `device_id` yang sah walaupun tidak pernah terdengar, misalnya `0123456789ab`, dijawab `200` dengan `"jumlah":0` dan `"bacaan":[]`.

**4. Rentang yang terlalu panjang.** Minta semua data latihan sekaligus. Ganti `2026-10-06` dengan tanggal dua minggu yang lalu, dan biarkan `to` kosong (artinya sampai sekarang):

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-06T00:00:00%2B07:00
```

**Hasilnya** (dipendekkan):

```text
{"device_id":"f00d00000001","dari":"2026-10-05T17:00:00Z","sampai":"2026-10-20T04:03:51Z","jumlah":1000,"terpotong":true,
"bacaan":[{"ts":"2026-10-12T17:00:00Z", … }, … ]}
```

Data latihan perangkat ini berisi lebih dari 1.000 bacaan (1.010 pada contoh Praktik 4.2, ditambah bacaan simulator kalau kamu memakainya), jadi jawabannya berhenti di bacaan ke-1.000, dan `terpotong: true` memberi tahu bahwa masih ada sisanya. Program yang butuh semuanya cukup bertanya lagi dengan rentang yang lebih kecil, misalnya per hari.

#### 7.4 Pintu barunya tercantum di `/docs`

Buka `http://127.0.0.1:8080/docs`. Di grup **perangkat** kini ada baris baru **GET** `/devices/{id}/readings` dengan ringkasan `Riwayat bacaan satu perangkat dari database (paling banyak 1.000 bacaan)`. Klik baris itu. Bagian **Parameters** memuat `from` dan `to` (bertanda `query`, tidak wajib, lengkap dengan keterangannya) serta `id` (bertanda `path`, wajib, dengan tanda `*`).

Coba langsung dari sini:

1. Klik **Try it out**.
2. Isi `from` dengan `2026-10-19T06:00:00+07:00`, `to` dengan `2026-10-19T07:00:00+07:00` (pakai tanggalmu), dan `id` dengan `f00d00000001`.
3. Klik **Execute**.

Kali ini tanda `+` boleh ditulis apa adanya. Di kotak **Request URL**, Swagger UI sudah membungkusnya sendiri menjadi `%2B`, begitu juga titik dua menjadi `%3A`:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06%3A00%3A00%2B07%3A00&to=2026-10-19T07%3A00%3A00%2B07%3A00
```

Di bawahnya, **Server response** menampilkan kode `200` dan jawaban yang sama dengan langkah 2 di 7.3, kali ini sudah dirapikan.

![Mencoba GET /devices/{id}/readings langsung dari /docs: dua potongan tangkapan layar asli Swagger UI backend final, setelah Try it out diklik, from, to, dan id diisi, lalu Execute diklik, dengan empat nomor. Atas, baris rute GET /devices/{id}/readings, riwayat bacaan satu perangkat dari database (paling banyak 1.000 bacaan), dengan tombol Cancel. Bagian Parameters, nomor 1, memuat kolom Name dan Description: from, string($date-time), (query), awal rentang, misalnya 2026-10-20T10:00:00+07:00 (bawaan: 1 jam sebelum to), diisi 2026-10-19T06:00:00+07:00; to, string($date-time), (query), akhir rentang, tidak ikut dihitung (bawaan: sekarang), diisi 2026-10-19T07:00:00+07:00; dan id, bertanda bintang dan required, string, (path), device_id perangkat, misalnya a4cf12e5b7c0, diisi f00d00000001. Di bawahnya tombol biru Execute, nomor 2, di samping Clear. Bawah, Request URL, nomor 3: http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06%3A00%3A00%2B07%3A00&to=2026-10-19T07%3A00%3A00%2B07%3A00, dengan kedua %2B07%3A00 digarisbawahi. Lalu Server response, nomor 4: Code 200 dan Response body yang diawali device_id f00d00000001, dari 2026-10-18T23:00:00Z (digarisbawahi), sampai 2026-10-19T00:00:00Z, jumlah 6 (digarisbawahi), terpotong false, lalu bacaan pertama, yaitu ts 2026-10-18T23:00:00Z, fw 1.4.0, suhu 23.8, kelembapan 79, cahaya 33, tanah 68, gerak false, level_air 78, serta tekanan, suhu_tanah, baterai, tanah_rs485, dan ec null. Keterangan kanan: 1 Parameters, from dan to bertanda (query) dan tidak wajib, id bertanda (path) dan bintang, wajib diisi; 2 Execute mengirim permintaan GET ke backend, dan di kotak isian tanda + boleh ditulis apa adanya; 3 Request URL, Swagger UI membungkusnya sendiri, + menjadi %2B dan titik dua menjadi %3A; 4 Server response, kode 200, dari 2026-10-18T23:00:00Z, yaitu pukul 06.00 WIB tanggal 19, dan jumlah 6. Catatan: jawabannya selalu ditulis dalam UTC (Konsep 9); data latihan Praktik 4 (perangkat f00d00000001), angkanya sama di laptopmu asal tanggalnya sehari sebelum kamu menjalankan npm run isi-riwayat, seperti di 7.3; kotak jawaban bisa digulir untuk lima bacaan lainnya.](aset/swagger-riwayat.png)

#### 7.5 Simpan permintaannya di Bruno

1. Di Bruno, klik permintaan **bacaan terbaru Node 1** di bilah samping supaya tab-nya terbuka, lalu klik kanan **tab** itu (di deretan tab di atas panel permintaan) dan pilih **Clone Request**. Di dialog **Clone Request**, ubah **Request Name** menjadi `riwayat Node 1`, lalu klik **Clone**. Permintaan barunya langsung terbuka di tab sendiri. (Menu **Clone** di bilah samping juga ada, tetapi langsung membuat salinan bernama `bacaan terbaru Node 1 copy` tanpa dialog; kalau telanjur, klik kanan salinan itu, pilih **Rename**, lalu ubah namanya menjadi `riwayat Node 1`.)
2. Di tab baru itu, ganti kata `latest` di ujung URL dengan `readings`.
3. Buka tab **Assert**. Baris pertamanya sudah ikut tersalin: `res.status`, **Operator** `equals` (di file tersimpan sebagai `eq`), dan **Value** `200`. Di baris kosong di bawahnya, ketik `res.body.jumlah` di kolom **Expr**, pilih `gt` ("lebih besar daripada") di kolom **Operator**, lalu ketik `0` di kolom **Value**. `res.body.jumlah` artinya "isian `jumlah` di dalam isi jawaban (*body*)".
4. Simpan (**Ctrl + S**), lalu klik **Send**. Tab **Tests** di panel jawaban kini berisi `Assertions (2), Passed: 2, Failed: 0`.

Tes kedua memastikan riwayat satu jam terakhir **tidak kosong**. Kalau suatu hari tes ini gagal, berarti selama satu jam terakhir tidak ada bacaan Node 1 yang tersimpan: Node 1 mati, broker putus, atau database bermasalah. Itulah gunanya tes: memberi tahu kamu sebelum pengguna dashboard menyadarinya.

Inilah syarat lulus ketiga modul ini: **API riwayat mengembalikan data dari database**. Kirim lagi **riwayat Node 1** beberapa kali dengan jeda 10 detik. Selama backend belum genap satu jam mengarsipkan, `jumlah`-nya bertambah; sesudah itu, angkanya bertahan di sekitar 360 (7.3).

#### 7.6 Perintah kini tercatat

1. Di Bruno, kirim **nyalakan lampu**, lalu **matikan lampu**.
2. Di DBeaver, jalankan:

   ```sql
   SELECT id, target, nilai, ack_ok, ack_pesan, lama_ms, dikirim FROM commands ORDER BY dikirim DESC LIMIT 5;
   ```

**Hasilnya** (contoh dari psql; `id`, lama tunggu, dan waktumu berbeda):

```text
         id          | target | nilai | ack_ok | ack_pesan | lama_ms |          dikirim           
---------------------+--------+-------+--------+-----------+---------+----------------------------
 c-20261020-041209-2 | lampu  | false | t      |           |       9 | 2026-10-20 04:12:09.597+00
 c-20261020-041204-1 | lampu  | true  | t      |           |      12 | 2026-10-20 04:12:04.423+00
(2 rows)
```

- Setiap perintah yang benar-benar dikirim menjadi satu baris: id perintahnya, target, nilai, hasil `ack`, dan lama tunggunya. Di DBeaver, kolom `dikirim` tampil dalam jam laptopmu (Konsep 9).
- `ack_ok` `t` berarti `true` (psql menulis `t` dan `f` untuk `boolean`). `ack_pesan` hanya terisi kalau perangkat menolak perintahnya (`ack_ok` `f`), misalnya pompa saat air tandon di bawah 20 %.
- Perintah yang tidak dijawab dalam 5 detik (`504`) juga tercatat, dengan `ack_ok` kosong (`NULL`) dan `lama_ms` sekitar `5000`. Kamu akan melihatnya kalau mengulang "Uji 504 dan 409 `offline`" dari Modul 16 Praktik 6.5.

Dengan catatan ini, pertanyaan seperti "seberapa cepat Node 1 biasanya menjawab?" kini bisa dijawab dengan SQL:

```sql
SELECT target, count(*) AS jumlah, round(avg(lama_ms)) AS rata_lama_ms
FROM commands
WHERE ack_ok = true
GROUP BY target
ORDER BY target;
```

**Hasilnya** (contoh):

```text
 target | jumlah | rata_lama_ms 
--------+--------+--------------
 lampu  |      2 |           11
(1 row)
```

#### 7.7 Simpan

Di terminal kedua (folder `backend`):

```text
git add .
git status
git commit -m "API riwayat GET /devices/:id/readings dan perintah tercatat (Modul 17 Praktik 7)"
git push
```

Di bagian `Changes to be committed`, `git status` harus menyebut dua file yang berubah (`src/db/arsip.ts` dan `src/routes/perangkat.ts`) dan satu file baru (`bruno/riwayat Node 1.yml`). `git push` kali ini tidak perlu `-u` karena pasangan cabang laptop dan GitHub sudah diingat sejak Praktik 3.

> ➡️ **Selesai Praktik 7?** Kerjakan Tingkat 1 dari [🧩 Tantangan mandiri](#-tantangan-mandiri), lalu langkah A dan B di [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini): di sana backend v0.2 digabung ke `main` lewat *pull request*. Tingkat 2 dan 3 dikerjakan sesudah itu, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul masalah yang paling mirip dengan yang kamu alami. Untuk hampir semua masalah database, tiga pemeriksaan ini menunjukkan letak masalahnya: **`docker ps -a`** (kontainernya menyala?), **`docker logs rumahpintar-db`** (apa kata PostgreSQL?), dan **`http://127.0.0.1:8080/health`** (backend bisa menghubungi database?). Untuk galat TypeScript dari `npm run cek` atau `SyntaxError` setelah mengubah kode, bandingkan file-mu dengan versi tahap yang sama di [`kode/tahap/`](kode/tahap/) (akhir Praktik 3, 4, dan 5) atau [`kode/backend/`](kode/backend/) (akhir Praktik 7), lalu lihat juga 🚨 Modul 16.

<details>
<summary><b>Docker Desktop tidak mau menyala, atau <code>docker</code> tidak dikenal</b></summary>

| Gejala | Penyebab | Obat |
| :--- | :--- | :--- |
| Terminal menjawab `The term 'docker' is not recognized …` (Windows) atau `zsh: command not found: docker` (macOS). | Terminal dibuka sebelum Docker Desktop dipasang sehingga belum mengenal perintah `docker`. | Tutup **semua** jendela VS Code, lalu buka lagi. Kalau masih sama, *restart* laptop. Kalau tetap tidak dikenal, Docker Desktop belum terpasang: ulangi bagian 🐳 Persiapan. |
| `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine…` (Windows) atau `Cannot connect to the Docker daemon…` / `failed to connect to the docker API at unix://…` (macOS). | Perintah `docker` sudah dikenal, tetapi aplikasi Docker Desktop belum menyala. Docker Desktop tidak ikut menyala sendiri saat laptop dihidupkan. | Buka Docker Desktop, tunggu sampai ikon paus berhenti bergerak, lalu ulangi perintahnya. Supaya tidak lupa lagi, centang **Start Docker Desktop when you sign in to your computer** (tip di akhir 🐳 Persiapan). |
| Docker Desktop menyebut virtualisasi tidak aktif (*virtualization*), atau macet saat menyala dan tidak pernah selesai. | Virtualisasi di BIOS/UEFI mati, atau WSL 2 belum siap. | Periksa **Task Manager** → **Performance** → **CPU** → **Virtualization: Enabled** (🐳 Persiapan langkah 1). Lalu buka **Terminal (Admin)** dan jalankan `wsl --update`, *restart*, dan buka lagi Docker Desktop. |
| Docker Desktop menyala, tetapi lambat sekali dan laptop terasa berat. | RAM laptop di bawah 8 GB, atau terlalu banyak aplikasi terbuka. | Tutup aplikasi lain (terutama browser dengan banyak tab). Kalau laptopmu memang di bawah syarat, pindahkan database ke Raspberry Pi (🔬 "Database di Raspberry Pi"). |

</details>

<details>
<summary><b>Kontainer <code>rumahpintar-db</code> berhenti sendiri atau tidak mau menyala</b></summary>

Jalankan `docker ps -a`. Kalau kolom **STATUS** kontainernya `Exited (…)`, bukan `Up …`, baca alasannya dengan `docker logs rumahpintar-db` (bagian paling bawah):

- **`Error: Database is uninitialized and superuser password is not specified.`** Bagian `-e POSTGRES_PASSWORD=…` terlewat saat `docker run`. Hapus kontainer yang gagal itu dengan `docker rm rumahpintar-db`, lalu jalankan lagi perintah Kemenangan Cepat langkah 2 dengan lengkap. Datanya belum pernah dibuat, jadi tidak ada yang hilang.
- **`No space left on device`.** Ruang disk laptop habis. Kosongkan ruang (lihat bagian lipat "Laptop terasa berat sejak memasang Docker, atau ruang disk menipis" di bawah), lalu jalankan `docker start rumahpintar-db`.
- **`docker start` menjawab `ports are not available` atau `port is already allocated`.** Loket 5432 kini dipakai program lain, misalnya PostgreSQL lain yang ikut menyala saat laptop dihidupkan. Lihat bagian lipat berikutnya.

Kontainer yang **tidak muncul sama sekali** di `docker ps -a` belum pernah dibuat (atau sudah dihapus): jalankan Kemenangan Cepat langkah 2. Kalau volume `rumahpintar-data` masih ada, kontainer baru langsung memakai data lamamu.

Setelah laptop dinyalakan ulang, kontainer belum menyala **sampai** Docker Desktop dibuka. `--restart unless-stopped` hanya bekerja selama Docker Desktop berjalan. Kontainer yang kamu hentikan sendiri dengan `docker stop` juga tetap berhenti sampai kamu menjalankan `docker start rumahpintar-db`.

</details>

<details>
<summary><b><code>ports are not available</code> atau <code>port is already allocated</code>: loket 5432 sudah terpakai</b></summary>

Pesan lengkapnya memuat `Error response from daemon:` (di `docker run` diawali `docker:`), lalu menyebut `5432`. Artinya, loket 5432 di laptop sudah dipakai: biasanya oleh PostgreSQL yang pernah dipasang langsung di laptop (misalnya untuk kuliah), atau oleh kontainer lain.

1. Hapus kontainernya, baik kontainer baru yang tertinggal setelah `docker run` gagal maupun kontainer lama yang gagal dinyalakan oleh `docker start`: `docker rm rumahpintar-db`. Volume datanya tidak ikut terhapus.
2. Jalankan lagi perintah Kemenangan Cepat langkah 2, tetapi dengan `-p 127.0.0.1:5433:5432` (loket 5433 di laptop diteruskan ke 5432 di dalam kontainer). Kalau pesan galatnya kini menyebut `5433`, loket itu juga sudah terpakai (misalnya oleh PostgreSQL versi kedua): hapus lagi kontainernya, lalu pakai `5434` dengan cara yang sama.
3. Mulai sekarang, pakai port **5433** (atau **5434** kalau kamu pindah lagi di langkah 2) di DBeaver (kolom **Port**) dan di `DATABASE_URL` (`…@127.0.0.1:5433/rumahpintar`, atau `…@127.0.0.1:5434/rumahpintar`). Perintah `docker exec … psql` tidak berubah karena psql berjalan di dalam kontainer dan tetap memakai 5432.

Jangan mematikan atau mencopot PostgreSQL lain itu kalau kamu tidak yakin siapa yang memakainya.

</details>

<details>
<summary><b>Database <code>rumahpintar</code> tidak ada, atau sandi baru tidak berlaku</b></summary>

Isian `-e POSTGRES_PASSWORD=…` dan `-e POSTGRES_DB=…` hanya dipakai **sekali**, saat kontainer pertama kali menyiapkan volume yang masih kosong. Setelah volume `rumahpintar-data` berisi, isian itu diabaikan walaupun kontainernya dibuat ulang dengan sandi atau nama database yang berbeda.

- **`database "rumahpintar" does not exist`**: database pertama dibuat tanpa `POSTGRES_DB`. Buat sekarang (datamu yang lain tidak tersentuh):

  ```text
  docker exec -it rumahpintar-db psql -U postgres -c "CREATE DATABASE rumahpintar;"
  ```

  Jawaban psql: `CREATE DATABASE`. Tambahan TimescaleDB ikut terpasang di database baru ini karena image-nya sudah memasangnya di database templat (*template*) PostgreSQL.
- **`password authentication failed for user "postgres"`** (di DBeaver, di `npm run migrasi`, atau di log backend), padahal sandinya terasa benar: yang berlaku adalah sandi saat volume **pertama kali** dibuat. Pakai sandi lama itu, atau ganti sandinya dari dalam kontainer (psql di dalam kontainer tidak meminta sandi):

  ```text
  docker exec -it rumahpintar-db psql -U postgres -c "ALTER USER postgres PASSWORD 'sandi-baru-mu';"
  ```

  Jawaban psql: `ALTER ROLE`. Setelah itu, perbarui sandi di `.env` (`DATABASE_URL`) dan di DBeaver (klik kanan koneksi → **Edit Connection**). Ingat aturan sandi di Kemenangan Cepat: huruf, angka, dan tanda minus saja.
- **Mau benar-benar mulai dari nol?** Langkah ini **menghapus semua data** di database. Jalankan `docker stop rumahpintar-db`, `docker rm rumahpintar-db`, dan `docker volume rm rumahpintar-data`, lalu ulangi Kemenangan Cepat langkah 2 dan `npm run migrasi`. Lakukan hanya kalau datanya memang boleh hilang.

</details>

<details>
<summary><b>DBeaver tidak bisa tersambung</b></summary>

Buka pengaturan koneksinya (klik kanan koneksi `rumahpintar` → **Edit Connection**), klik **Test Connection ...**, lalu baca pesannya:

| Pesan | Obat |
| :--- | :--- |
| `Connection to 127.0.0.1:5432 refused. Check that the hostname and port are correct and that the postmaster is accepting TCP/IP connections.` | Kontainernya mati, atau port-nya salah. Periksa `docker ps`: **STATUS** harus `Up …`, dan angka di kolom **PORTS** (`127.0.0.1:5432->…` atau `127.0.0.1:5433->…`) harus sama dengan kolom **Port** di DBeaver. |
| `FATAL: password authentication failed for user "postgres"` | Sandi di DBeaver berbeda dengan sandi saat volume pertama kali dibuat. Lihat bagian lipat "Database `rumahpintar` tidak ada, atau sandi baru tidak berlaku". |
| `FATAL: database "rumahpintar" does not exist` | Kolom **Database** salah ketik, atau database-nya memang belum ada (bagian lipat yang sama). |
| DBeaver meminta mengunduh *driver*, lalu gagal | Unduhan *driver* PostgreSQL butuh internet, sekali saja. Sambungkan laptop ke internet, lalu klik **Download** lagi. |

Tabel baru tidak muncul di panel kiri? Klik kanan koneksi `rumahpintar` → **Refresh** (atau tekan **F5** di panel itu). DBeaver tidak memantau perubahan dari psql atau dari migrasi secara otomatis.

</details>

<details>
<summary><b><code>npm run migrasi</code> gagal</b></summary>

| Pesan | Penyebab | Obat |
| :--- | :--- | :--- |
| `Error: connect ECONNREFUSED 127.0.0.1:5432`, diikuti banyak baris `at …` | Database tidak bisa dihubungi: kontainernya mati, atau port di `DATABASE_URL` salah. | Periksa dengan `docker ps`, nyalakan kontainernya kalau perlu (`docker start rumahpintar-db`), dan cocokkan port-nya. Baris `at …` hanya jejak tempat galat terjadi. Yang penting adalah baris yang diawali `Error:` (atau `error:`), beberapa baris di bawah nama file `pg-pool` yang muncul paling atas. |
| `password authentication failed for user "postgres"` | Sandi di `DATABASE_URL` salah. | Lihat bagian lipat "Database `rumahpintar` tidak ada, atau sandi baru tidak berlaku". |
| `Setelan DATABASE_URL belum diisi. …` | Baris `DATABASE_URL=…` belum ada di `.env`, atau salah ketik namanya. | Salin baris itu dari `.env.example`, lalu ganti sandinya (Praktik 3). |
| `npm error Missing script: "migrasi"` (atau `"isi-riwayat"`) | Barisnya belum ada di bagian `"scripts"` `package.json`, file itu belum disimpan, atau terminalnya tidak berada di folder `backend`. | Simpan `package.json`, cocokkan barisnya dengan Praktik 3.6 atau 4.1, lalu jalankan perintahnya dari folder `backend`. |
| `npm error code EJSONPARSE` | Isi `package.json` rusak, biasanya karena koma yang hilang atau berlebih di bagian `"scripts"`. | Setiap baris di dalam `"scripts"` diakhiri koma, kecuali baris terakhir. Bandingkan dengan [`package.json`](kode/backend/package.json). |
| `GAGAL di 001_skema_awal.sql: syntax error at or near "…"` | Ada salah ketik di file SQL-nya. | Bandingkan file-mu dengan [`001_skema_awal.sql`](kode/backend/migrasi/001_skema_awal.sql), terutama koma di akhir setiap baris kolom dan tanda kurung. Karena setiap file berjalan dalam satu transaksi, tidak ada tabel yang setengah jadi: perbaiki file-nya, lalu jalankan lagi. |
| `GAGAL di 001_skema_awal.sql: relation "devices" already exists` | Tabel dengan nama yang sama pernah dibuat dengan tangan (misalnya lewat DBeaver), di luar migrasi. | Periksa dulu isinya dengan `SELECT count(*) FROM devices;`. Kalau `0`, tabel buatan tangan itu aman dibuang: jalankan `DROP TABLE devices;` di DBeaver, lalu jalankan `npm run migrasi` lagi. Kalau pesan berikutnya menyebut tabel lain, periksa dan buang tabel itu dengan cara yang sama. `DROP TABLE` membuang tabel beserta seluruh isinya tanpa bertanya, jadi jangan jalankan kalau isinya masih kamu perlukan. |

Pernah mengubah file migrasi yang **sudah** diterapkan? Perubahannya tidak akan pernah dijalankan karena namanya sudah tercatat di `schema_migrations`. Aturannya: file migrasi yang sudah diterapkan tidak boleh diubah; perubahan baru selalu masuk ke file bernomor berikutnya (Konsep 5).

</details>

<details>
<summary><b>Backend menulis <code>database belum bisa dihubungi</code> atau <code>gagal menyimpan … ke database</code></b></summary>

Gejalanya: saat server menyala, log menulis `WARN: database belum bisa dihubungi: periksa kontainer database dan DATABASE_URL di .env`; `/health` menjawab `"database":false`; setiap pesan perangkat menghasilkan baris seperti

```text
[10:22:57] ERROR: gagal menyimpan rpm/a4cf12e5b7c0/telemetry ke database: connect ECONNREFUSED 127.0.0.1:5432
```

dan `GET /devices/<id>/readings` dijawab `503` dengan `{"pesan":"database sedang tidak bisa dihubungi, coba lagi sebentar lagi"}`. Tepat saat kontainer dihentikan, terminal juga bisa menulis satu atau dua baris `galat database: …` dari `pool.ts`: itu sambungan menganggur di kolam yang diputus database, dan memang hanya dicatat. Backend tetap hidup dan papan pengumumannya tetap bekerja; hanya arsipnya yang absen.

1. **Kontainernya.** `docker ps`: menyala? Kalau tidak, jalankan `docker start rumahpintar-db` (dan buka Docker Desktop dulu kalau perlu).
2. **`DATABASE_URL` di `.env`.** Port sama dengan `docker ps`? Sandinya benar? Setelah `.env` disimpan, server dimulai ulang sendiri.
3. **Tunggu sebentar.** Begitu database bisa dihubungi lagi, penulisan arsip berikutnya langsung berhasil, tanpa perlu memulai ulang server. Bacaan selama database mati **tidak** tersimpan karena saat itu tidak ada tempat untuk menyimpannya.

Kalau pesannya `relation "devices" does not exist` (di baris `gagal menyimpan …`) atau `relation "readings" does not exist` (di baris `riwayat … gagal dibaca dari database`), database-nya hidup, tetapi tabelnya belum dibuat: jalankan `npm run migrasi` (Praktik 3). Untuk `password authentication failed`, lihat bagian lipat "Database `rumahpintar` tidak ada, atau sandi baru tidak berlaku".

</details>

<details>
<summary><b>Jam di DBeaver atau psql selisih 7 jam, atau rata-rata per hari terasa salah tanggal</b></summary>

Tidak ada data yang salah; yang berbeda adalah cara menampilkannya (Konsep 9).

- **psql di dalam kontainer** menampilkan waktu dalam UTC (akhiran `+00`). Untuk melihat WIB selama satu sesi psql, jalankan `SET TIME ZONE 'Asia/Jakarta';`.
- **DBeaver** menampilkan waktu menurut zona waktu laptopmu. Kalau jam di DBeaver juga terasa aneh, periksa pengaturan zona waktu laptop.
- **API backend** selalu menjawab dalam UTC (`Z`), sama seperti kontrak data.
- **Mengelompokkan per hari** harus memakai tanggal WIB: `(ts AT TIME ZONE 'Asia/Jakarta')::date`, bukan `ts::date`. `ts::date` mengikuti zona sesi: di psql dan backend (UTC), bacaan pukul 00.00–06.59 WIB masuk ke tanggal kemarin walaupun di DBeaver tampak benar (Praktik 4.5). Di WITA dan WIT, ganti `'Asia/Jakarta'` dengan `'Asia/Makassar'` atau `'Asia/Jayapura'` untuk data perangkatmu (data latihan Praktik 4 tetap memakai `'Asia/Jakarta'`).

</details>

<details>
<summary><b>API riwayat menjawab <code>400</code>, <code>jumlah: 0</code>, atau <code>terpotong: true</code></b></summary>

| Jawaban | Penyebab | Obat |
| :--- | :--- | :--- |
| `400`, `querystring/from tanggal dan waktu format ISO tidak valid` | Format waktunya kurang lengkap, atau tanda `+` ditulis apa adanya di alamat browser. | Tulis lengkap: tanggal, huruf `T`, jam dengan detik, lalu zona, misalnya `2026-10-19T06:00:00%2B07:00` atau `2026-10-18T23:00:00Z`. Di alamat browser, `+` harus ditulis `%2B` (Praktik 7.3). Bruno dan Swagger UI membungkus alamatnya sendiri, jadi di sana tulis `+` apa adanya; `%2B` yang diketik di Bruno malah dibungkus dua kali (`%252B`) dan ditolak. Cara yang aman di mana pun: tulis waktunya dalam UTC dengan akhiran `Z`. |
| `400`, `querystring/to harus lebih akhir daripada from` | `from` dan `to` tertukar. | Tukar keduanya. |
| `200`, tetapi `"jumlah":0` | Tidak ada bacaan perangkat itu dalam rentang itu. | Periksa `device_id`-nya (milikmu sendiri? data latihan hanya ada untuk `f00d00000001` dan `f00d00000002`). Ingat bahwa jawabannya dalam UTC: `dari` dan `sampai` di jawaban menunjukkan rentang yang benar-benar dipakai. Untuk Node 1, pastikan backend mengarsipkan (`/health` → `"database":true`, dan `SELECT count(*) FROM readings WHERE device_id = '…';` di DBeaver bertambah). |
| `200`, dengan `"terpotong":true` | Rentangnya berisi lebih dari 1.000 bacaan. | Perkecil rentangnya, misalnya per hari atau per jam. |
| `503`, `database sedang tidak bisa dihubungi, …` | Database mati, `DATABASE_URL` salah, atau tabelnya belum dibuat (`npm run migrasi`). | Lihat bagian lipat "Backend menulis `database belum bisa dihubungi` …" di atas. |

</details>

<details>
<summary><b>Laptop terasa berat sejak memasang Docker, atau ruang disk menipis</b></summary>

- **Saat tidak sedang belajar, matikan Docker Desktop.** Di Windows, klik kanan ikon paus di area notifikasi; di macOS, klik ikon paus di bilah menu. Lalu pilih **Quit Docker Desktop**. Datamu aman di volume, dan kontainernya ikut menyala lagi saat Docker Desktop dibuka. Di Windows, proses besar bernama `Vmmem` atau `VmmemWSL` di Task Manager adalah mesin Linux kecil milik Docker; ukurannya mengecil setelah Docker Desktop ditutup.
- **Lihat apa yang memakan disk** dengan `docker system df` (kolom **SIZE** di baris `Images`, `Containers`, dan `Local Volumes`). Untuk modul ini, hampir seluruhnya adalah cetakan `timescale/timescaledb` dan volume datamu, dan keduanya memang dibutuhkan. Kalau disk laptop sangat sempit, kosongkan ruang di luar Docker lebih dulu.
- **Jangan** membuang volume hanya untuk membebaskan ruang, misalnya dengan `docker volume prune --all` atau tombol hapus di menu **Volumes**. Volume yang sedang tidak dipakai kontainer, termasuk `rumahpintar-data` kalau kontainernya sudah dihapus, ikut terbuang beserta seluruh isi database.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini tidak wajib untuk lulus. Bacalah kalau kamu penasaran apa yang terjadi di balik layar, atau kalau laptopmu tidak sanggup menjalankan Docker.

<details>
<summary><b>Transaksi: hapus, lalu batalkan</b></summary>

Konsep 5 menyebutkan bahwa setiap file migrasi dibungkus **transaksi** (*transaction*). Kamu bisa merasakannya sendiri di psql, dengan data latihan yang aman dikorbankan. Kalau simulator Modul 16 sedang berjalan, hentikan dulu (**Ctrl + C**) karena simulator juga terus menambah bacaan `f00d00000002` sehingga angkanya bisa sedikit berbeda. Setelah itu, masuk ke psql (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`), lalu ketik satu per satu:

```sql
BEGIN;
DELETE FROM readings WHERE device_id = 'f00d00000002';
SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
ROLLBACK;
SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
```

**Hasilnya** (angka `DELETE` dan `count` mengikuti data latihanmu):

```text
rumahpintar=# BEGIN;
BEGIN
rumahpintar=*# DELETE FROM readings WHERE device_id = 'f00d00000002';
DELETE 1010
rumahpintar=*# SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
 count 
-------
     0
(1 row)

rumahpintar=*# ROLLBACK;
ROLLBACK
rumahpintar=# SELECT count(*) FROM readings WHERE device_id = 'f00d00000002';
 count 
-------
  1010
(1 row)
```

Perhatikan tanda bintang di `rumahpintar=*#`: psql mengingatkan bahwa kamu sedang berada di dalam transaksi.

Setelah `BEGIN`, semua perubahan masih "di atas kertas". Di dalam transaksi itu, bacaan teras sudah lenyap (`count` 0). `ROLLBACK` membatalkan semuanya, dan seribu bacaan kembali utuh. Seandainya kamu mengetik `COMMIT`, penghapusannya menjadi permanen.

Selama transaksi belum selesai, sambungan lain (misalnya DBeaver atau backend) masih melihat data lama. Mereka baru melihat perubahannya setelah `COMMIT`. Itulah yang dimanfaatkan `migrasi.ts`: semua isi satu file migrasi terlihat sekaligus, atau tidak sama sekali. Satu syarat dari `pg`: semua perintah dalam satu transaksi harus lewat **sambungan yang sama**. Karena itu, `migrasi.ts` meminjam satu sambungan dengan `pool.connect()`, bukan memakai `pool.query()` yang bisa berganti sambungan di setiap perintah.

</details>

<details>
<summary><b>Angka yang datang sebagai teks: <code>count(*)</code> dan <code>numeric</code> lewat <code>pg</code></b></summary>

Kolom `double precision` dan `integer` sampai di JavaScript sebagai `number`, seperti yang diharapkan. Dua tipe lain tidak:

```ts
const hasil = await pool.query(
  "SELECT count(*) AS jumlah, count(*)::int AS jumlah_int, avg(suhu) AS rata, round(avg(suhu)::numeric, 1) AS rata_bulat " +
  "FROM readings WHERE device_id = 'f00d00000001'",
);
console.log(hasil.rows[0]);
```

**Hasilnya** (diuji dengan `pg` 8.23.1):

```text
{
  jumlah: '1010',
  jumlah_int: 1010,
  rata: 26.308514851485146,
  rata_bulat: '26.3'
}
```

`count(*)` menghasilkan tipe `bigint`, yang bisa jauh lebih besar daripada angka terbesar yang dijamin tepat oleh `number` JavaScript. Supaya tidak ada angka yang diam-diam berubah, `pg` mengirimnya sebagai **teks** (`'1010'`). Hal yang sama berlaku untuk `numeric` (hasil `round(…::numeric, 1)`) karena `numeric` bisa punya lebih banyak angka desimal daripada `number`. Kalau angkanya pasti kecil, ubah tipenya di SQL: `count(*)::int`, atau `round(…)::float8`. Kalau lupa, jebakannya halus: `'1010' + 1` di JavaScript menghasilkan teks `'10101'`, bukan `1011`.

</details>

<details>
<summary><b><code>EXPLAIN</code>: bagaimana database mencari bacaan (pengantar Modul 18)</b></summary>

Tulis `EXPLAIN` di depan sebuah `SELECT`, dan PostgreSQL menceritakan **rencananya** tanpa benar-benar menjalankan kuerinya. Coba dua kueri ini di psql:

```sql
EXPLAIN SELECT ts, suhu FROM readings WHERE device_id = 'f00d00000001' AND ts >= '2026-10-19T00:00:00Z' AND ts < '2026-10-20T00:00:00Z';
EXPLAIN SELECT ts, suhu FROM readings WHERE suhu > 30;
```

**Hasilnya** (contoh; angka `cost` dan `rows` di layarmu berbeda):

```text
                                                                                   QUERY PLAN                                                                                    
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Index Scan using readings_pkey on readings  (cost=0.28..8.30 rows=1 width=16)
   Index Cond: ((device_id = 'f00d00000001'::text) AND (ts >= '2026-10-19 00:00:00+00'::timestamp with time zone) AND (ts < '2026-10-20 00:00:00+00'::timestamp with time zone))
(2 rows)

                         QUERY PLAN                         
------------------------------------------------------------
 Seq Scan on readings  (cost=0.00..92.80 rows=928 width=16)
   Filter: (suhu > '30'::double precision)
(2 rows)
```

- **`Index Scan using readings_pkey`**: untuk kueri pertama, database memakai **indeks** milik kunci utama `(device_id, ts)`. Indeks itu seperti indeks di bagian belakang buku: daftar yang sudah terurut menurut perangkat lalu waktu sehingga database bisa langsung melompat ke halaman "f00d00000001, tanggal 19" tanpa membaca seluruh tabel. Kunci utama otomatis punya indeks, dan kebetulan bentuknya cocok untuk pertanyaan paling sering di IoT: "bacaan perangkat X antara jam sekian dan sekian". Itulah kueri API riwayat di Praktik 7. Di laptopmu, rencananya bisa juga berbunyi `Bitmap Heap Scan on readings` dengan `Bitmap Index Scan on readings_pkey` di bawahnya. Itu variasi cara memakai indeks yang sama; tandanya, nama `readings_pkey` muncul.
- **`Seq Scan`** (*sequential scan*, pemindaian berurutan): untuk kueri kedua, tidak ada indeks yang cocok, jadi database membaca **semua** baris satu per satu, lalu menyaring yang `suhu`-nya di atas 30. Untuk dua ribu baris, tidak terasa. Untuk sejuta baris, terasa sekali.

Modul 18 melanjutkan cerita ini: mengisi sejuta baris, mengukur waktunya dengan `EXPLAIN ANALYZE`, lalu membuat `readings` tetap cepat walaupun terus membesar.

</details>

<details>
<summary><b>psql: perintah garis miring terbalik yang berguna</b></summary>

Selain SQL, psql mengenal perintah pendek yang diawali garis miring terbalik. Perintah ini milik psql sendiri (bukan SQL), jadi **tidak** diakhiri titik koma:

| Perintah | Gunanya |
| :--- | :--- |
| `\dt` | daftar tabel di database ini (Praktik 3) |
| `\d readings` | bentuk satu tabel: kolom, tipe, kunci utama, indeks, dan kunci tamu |
| `\x` | tampilan memanjang ke bawah (satu kolom per baris), enak untuk baris yang lebar; ketik lagi untuk kembali |
| `\timing` | menampilkan lama setiap kueri, misalnya `Time: 1.234 ms`; ketik lagi untuk mematikan |
| `\?` | daftar semua perintah garis miring terbalik (tekan **q** untuk keluar dari daftar) |
| `\q` | keluar dari psql |

</details>

<details>
<summary><b>Drizzle ORM: SQL yang ditulis sebagai TypeScript</b></summary>

**ORM** (*Object-Relational Mapping*, pemetaan objek-relasional) adalah library yang membuat kueri database ditulis sebagai kode biasa, bukan sebagai kalimat SQL. Salah satu yang populer di dunia TypeScript adalah **Drizzle ORM**. Beginilah kueri riwayat Praktik 7 kalau ditulis dengan Drizzle (diuji dengan `drizzle-orm` 0.45.4 dan `pg` 8.23.1):

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { Pool } from "pg";

// "peta" tabel readings dalam TypeScript (cukup kolom yang dipakai)
const readings = pgTable("readings", {
  device_id: text().notNull(),
  ts: timestamp({ withTimezone: true }).notNull(),
  suhu: doublePrecision(),
  tanah: integer(),
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

const baris = await db
  .select({ ts: readings.ts, suhu: readings.suhu, tanah: readings.tanah })
  .from(readings)
  .where(and(
    eq(readings.device_id, "f00d00000001"),
    gte(readings.ts, new Date("2026-10-19T06:00:00+07:00")),
    lt(readings.ts, new Date("2026-10-19T07:00:00+07:00")),
  ))
  .orderBy(asc(readings.ts));
```

`baris` berisi enam bacaan yang sama dengan Praktik 7.3 langkah 2, dan TypeScript sudah tahu bentuknya tanpa `interface` buatan sendiri. Di belakang layar, Drizzle tetap membuat kalimat SQL dengan parameter `$1`, `$2`, dan seterusnya, lalu mengirimnya lewat `pg` yang sama.

Kelebihannya: salah ketik nama kolom langsung ditandai editor, dan bentuk tabel cukup ditulis sekali dalam TypeScript (alatnya, Drizzle Kit, bahkan bisa membuat file migrasi dari situ). Kekurangannya: satu lapisan lagi yang harus dipelajari, dan kamu tetap harus paham SQL untuk tahu apa yang sebenarnya dikirim ke database. Itulah alasan modul ini memakai SQL murni: belajar SQL dulu, baru alat yang menuliskannya untukmu. Saat modul ini ditulis, Drizzle sedang menyiapkan versi 1.0 dengan beberapa perubahan besar, jadi periksa dokumentasi resminya kalau kamu ingin memakainya di proyek sendiri.

</details>

<details>
<summary><b>Database di Raspberry Pi</b></summary>

Kalau laptopmu tidak sanggup menjalankan Docker Desktop (RAM di bawah 8 GB, versi Windows terlalu lama, atau virtualisasi tidak bisa dinyalakan), database bisa dijalankan di **gateway Pi** dari Modul 12. Backend tetap berjalan di laptop; hanya alamat database-nya yang berubah.

**Syaratnya:**

- **Raspberry Pi 4 atau 5** dengan RAM 2 GB ke atas (4 GB lebih lega karena Pi juga menjalankan broker dan Node-RED).
- **Raspberry Pi OS 64-bit.** Periksa lewat SSH dengan `uname -m`: jawabannya harus `aarch64`.
- **Penyimpanan yang tahan banting.** Database menulis ke penyimpanan terus-menerus, dan kartu microSD biasa cepat aus karenanya. Pakai kartu kelas *high endurance* (daya tahan tinggi), atau lebih baik lagi SSD lewat USB (atau NVMe di Pi 5). Apa pun penyimpanannya, buat cadangan rutin. Caranya ada di Modul 18.

**Langkah garis besarnya** (semua perintah di Pi, lewat SSH):

1. Pasang **Docker Engine** (versi tanpa jendela dari Docker Desktop) mengikuti panduan resmi Docker untuk Debian di [docs.docker.com/engine/install/debian](https://docs.docker.com/engine/install/debian/) karena Raspberry Pi OS 64-bit dibangun dari Debian. Panduan itu juga menjelaskan cara menjalankan `docker` tanpa `sudo`.
2. Jalankan perintah `docker run` Kemenangan Cepat dengan **satu** perbedaan: ganti `-p 127.0.0.1:5432:5432` dengan `-p 192.168.1.37:5432:5432` (alamat tetap Pi-mu dari Modul 12). Dengan begitu, loket database terbuka untuk laptop di jaringan rumah, bukan hanya untuk Pi sendiri. Image yang sama punya versi untuk Pi (`arm64`, sekitar 535 MB), jadi unduhan pertamanya agak lama.
3. Di laptop, arahkan semuanya ke Pi: `DATABASE_URL=postgres://postgres:<sandi>@192.168.1.37:5432/rumahpintar` di `.env`, dan **Host** `192.168.1.37` di DBeaver.
4. Perintah `docker exec …`, `docker logs …`, dan sejenisnya di modul ini dijalankan di Pi (lewat SSH), bukan di laptop.

Karena loketnya kini terbuka untuk jaringan rumah (satu-satunya pengecualian dari aturan aman nomor 2 di awal modul), pakai sandi yang kuat, dan **jangan pernah** meneruskan port 5432 di router ke internet.

Bisakah tanpa Docker? Bisa: Raspberry Pi OS 64-bit menyediakan PostgreSQL 17 lewat `sudo apt install postgresql`. Hanya saja, versi itu belum berisi TimescaleDB yang dibutuhkan Modul 18, dan memasangnya butuh beberapa langkah tambahan. Jalur Docker membuat Pi-mu memakai database yang sama persis dengan modul ini.

</details>

## 🧩 Tantangan mandiri

Tingkat 1 cukup dikerjakan di DBeaver. Tingkat 2 dan 3 mengubah kode backend, jadi kerjakan **setelah** ➕ B (cabang `fitur/database` sudah di-*merge*), di cabang baru dari `main`, seperti Modul 16: `git switch main`, `git pull`, lalu `git switch -c fitur/<nama-tantangan>`. Tingkat 1 dan 2 punya kunci jawaban; isi lengkap kedua file kunci Tingkat 2 ada di [`kode/tantangan/kunci/`](kode/tantangan/kunci/).

### Tingkat 1 — Jam paling panas di teras (ubah sedikit)

Kueri Praktik 4.7 mencari jam tanah **paling kering** setiap hari di ruang tamu. Ubah kueri itu supaya menjawab: **jam berapa suhu paling panas setiap hari di teras** (`f00d00000002`), selama 7 hari terakhir. Hanya tiga hal yang perlu diubah: perangkatnya, kolom yang dicari, dan arah urutannya (yang paling panas adalah yang paling **besar**).

<details>
<summary><b>Kunci Tingkat 1</b></summary>

```sql
SELECT DISTINCT ON (hari) hari, jam, suhu
FROM (
  SELECT (ts AT TIME ZONE 'Asia/Jakarta')::date AS hari,
         to_char(ts AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') AS jam,
         suhu
  FROM readings
  WHERE device_id = 'f00d00000002'
    AND ts >= date_trunc('day', now(), 'Asia/Jakarta') - interval '7 days'
    AND ts <  date_trunc('day', now(), 'Asia/Jakarta')
) AS per_bacaan
ORDER BY hari, suhu DESC, jam;
```

**Hasilnya** (tanggalmu mengikuti hari ini; jam dan angkanya sama kalau data latihan diisi hari ini, lihat kotak di Praktik 4.2):

```text
    hari    |  jam  | suhu 
------------+-------+------
 2026-10-13 | 15:30 |   32
 2026-10-14 | 14:10 | 31.5
 2026-10-15 | 14:10 | 32.3
 2026-10-16 | 15:00 |   33
 2026-10-17 | 15:20 | 32.6
 2026-10-18 | 15:50 | 31.7
 2026-10-19 | 14:00 | 32.1
(7 rows)
```

Kuncinya ada di `ORDER BY hari, suhu DESC, jam`: dalam setiap hari, `DESC` menaruh suhu terbesar paling atas sehingga `DISTINCT ON (hari)` mengambil bacaan terpanas. Angka suhunya sama dengan kunci Praktik 4.8 nomor 1, sedangkan jamnya selalu sekitar pukul 14.00–16.00: udara paling panas beberapa jam **setelah** matahari tertinggi, bukan tepat tengah hari.

</details>

### Tingkat 2 — Riwayat perintah lewat API (isi bagian rumpang)

Tabel `commands` sudah mencatat setiap perintah sejak Praktik 7, tetapi baru bisa dibaca dari DBeaver. Sediakan `GET /devices/:id/commands`: **20 perintah terakhir** satu perangkat, terbaru lebih dulu. Isi setiap `____` di bawah ini.

Di **`src/db/arsip.ts`**, tepat di atas komentar `// Apakah database bisa dihubungi sekarang? …`, tambahkan:

```ts
// Bentuk satu baris commands saat dibaca lewat pg (Tantangan Tingkat 2)
interface BarisPerintah {
  id: string;
  dikirim: Date;
  target: string;
  nilai: boolean | number;
  ack_ok: boolean | null;
  ack_pesan: string | null;
  lama_ms: number | null;
}

// 20 perintah terakhir satu perangkat, terbaru lebih dulu (Tantangan Tingkat 2)
export async function ambilPerintah(deviceId: string) {
  const hasil = await pool.query<BarisPerintah>(
    `SELECT id, dikirim, target, nilai, ack_ok, ack_pesan, lama_ms
     FROM ____
     WHERE device_id = ____
     ORDER BY dikirim ____
     LIMIT ____`,
    [deviceId],
  );
  return hasil.rows.map((baris) => ({ ...baris, dikirim: ____(baris.dikirim) }));
}
```

Di **`src/routes/perangkat.ts`**, tambahkan `ambilPerintah` ke daftar impor dari `../db/arsip.ts`, lalu tambahkan rute ini di antara rute `GET /devices/:id/readings` dan rute perintah:

```ts
  app.get("/devices/:id/commands", {
    schema: {
      tags: ["perangkat"],
      summary: "20 perintah terakhir satu perangkat, beserta hasil ack-nya",
      params: ParamId,
      response: {
        200: z.array(z.object({
          id: z.string(), dikirim: z.string(), target: z.string(), nilai: z.union([z.____(), z.____()]),
          ack_ok: z.boolean().nullable(), ack_pesan: z.string().nullable(), lama_ms: z.number().nullable(),
        })).describe("perintah terbaru lebih dulu; ack_ok null = tidak ada ack dalam 5 detik"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      return await ____(req.params.id);
    } catch (galat) {
      req.log.error(`perintah ${req.params.id} gagal dibaca dari database: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });
```

Uji dengan `npm run cek`, lalu buat permintaan Bruno `perintah Node 1` (lewat **Clone Request** dari tab **bacaan terbaru Node 1**, seperti Praktik 7.5, lalu ganti `latest` di ujung URL dengan `commands`). **Hasilnya** berupa daftar perintah dari Praktik 7.6, terbaru paling atas:

```text
[{"id":"c-20261020-041209-2","dikirim":"2026-10-20T04:12:09Z","target":"lampu","nilai":false,"ack_ok":true,"ack_pesan":null,"lama_ms":9},
{"id":"c-20261020-041204-1","dikirim":"2026-10-20T04:12:04Z","target":"lampu","nilai":true,"ack_ok":true,"ack_pesan":null,"lama_ms":12}]
```

Perangkat yang belum pernah menerima perintah dijawab `[]` (daftar kosong).

<details>
<summary><b>Kunci Tingkat 2</b></summary>

- Di SQL: `FROM commands`, `WHERE device_id = $1`, `ORDER BY dikirim DESC`, dan `LIMIT 20`. Nilai dari luar selalu lewat `$1` (Konsep 10); `DESC` membuat yang terbaru di atas.
- Di `.map(…)`: `waktuKontrak(baris.dikirim)`. Dengan begitu, kolom `dikirim` ditulis dengan format kontrak, sama seperti `ts` di API riwayat.
- Di skema: `nilai: z.union([z.boolean(), z.number()])`. Nilai perintah bisa `true`/`false` (lampu, kipas) atau angka (pompa, tirai). Kolom `jsonb` sampai di JavaScript sebagai nilai aslinya, bukan teks.
- Di *handler*: `return await ambilPerintah(req.params.id);`. Kata `await` di dalam `try` penting: tanpanya, galat database lolos dari `catch` dan rute menjawab `500`, bukan `503`.

Isi lengkap kedua file: [`arsip.ts`](kode/tantangan/kunci/backend/src/db/arsip.ts) dan [`perangkat.ts`](kode/tantangan/kunci/backend/src/routes/perangkat.ts).

</details>

### Tingkat 3 — Ringkasan satu hari (buat dari nol)

Dashboard sering butuh angka ringkas, bukan ratusan bacaan. Buat **`GET /devices/:id/summary?date=2026-10-19`** yang menjawab ringkasan bacaan perangkat itu pada satu **tanggal WIB** (pukul 00.00 sampai sebelum 24.00 WIB):

```json
{"device_id":"f00d00000001","tanggal":"2026-10-19","jumlah":144,"suhu_min":22,"suhu_rata":26.3,"suhu_max":30.6,"tanah_min":42}
```

Petunjuk:

- Skema *query string*: `z.object({ date: z.iso.date() })`. `z.iso.date()` hanya menerima tanggal berbentuk `YYYY-MM-DD`; tanggal yang salah format dijawab `400` oleh Fastify.
- Ubah tanggal WIB menjadi rentang waktu di JavaScript: ``const dari = new Date(`${req.query.date}T00:00:00+07:00`);``, lalu `sampai` = `dari` ditambah 24 jam (`dari.getTime() + 24 * 60 * 60 * 1000`). Seperti API riwayat, awal rentang ikut dihitung, sedangkan akhirnya tidak.
- Satu kueri cukup: `count(*)`, `min(suhu)`, `avg(suhu)`, `max(suhu)`, dan `min(tanah)` dengan `WHERE device_id = $1 AND ts >= $2 AND ts < $3`. Ingat 🔬 "Angka yang datang sebagai teks": tulis `count(*)::int`, dan `round(avg(suhu)::numeric, 1)::float8` supaya keduanya sampai sebagai `number`.
- Simpan fungsinya di `arsip.ts`, rutenya di `perangkat.ts` (lengkap dengan `503` seperti rute riwayat), lalu tambahkan permintaan Bruno-nya.

**Periksa sendiri jawabanmu** dengan data latihan: untuk setiap tanggal di tabel Praktik 4.5 milikmu (tujuh hari penuh sebelum hari kamu menjalankan `npm run isi-riwayat`), `jumlah` harus `144`, `suhu_rata` harus sama dengan baris tanggal itu di Praktik 4.5, dan `tanah_min` harus sama dengan baris tanggal itu di Praktik 4.7. Tingkat ini tidak punya kunci; pemeriksaan silang itulah kuncinya.

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini mendapat **backend v0.2**: setiap pesan yang lolos pemeriksaan kontrak kini juga tersimpan permanen di database, riwayatnya bisa ditanya lewat API, dan setiap perintah tercatat. Kontrak data tetap versi 1.2 karena bentuk pesan MQTT tidak berubah. Database-nya sendiri hidup di kontainer Docker di laptopmu, sedangkan repositori hanya menyimpan **resep** bentuk tabelnya (migrasi), bukan datanya.

![Diagram proyek Rumah Pintar Mini setelah Modul 17: backend kini punya ingatan jangka panjang; garis putus-putus berarti pilihan, pensiun, atau menyusul. Atas, dari kiri: Node 2 Kebun v1.0.0 dengan baterai 18650, tidak berubah, mengirim ESP-NOW ke Node 1 Rumah v1.4.0 (sensor, relay, jembatan Node 2, sensor RS-485), juga tidak berubah. Node 1 mengirim MQTT ke Gateway Raspberry Pi 192.168.1.37 yang berisi Mosquitto, broker MQTT, dan Node-RED dengan dashboard, kartu Kebun, dan grup Sensor RS-485; baris otomasi kipas dicoret, pudar, dan bergaris putus-putus dengan label pensiun sejak Modul 16. Node-RED tetap melayani dashboard di HP. Kiri tengah, kotak putus-putus simulator (pilihan): 10 perangkat palsu di laptop, f00d00000001 sampai f00d00000010, pengganti perangkat sungguhan, tersambung ke Mosquitto lewat garis MQTT putus-putus. Di bawahnya catatan jujur: database berjalan di laptop (127.0.0.1:5432); repositori hanya menyimpan migrasinya, bukan datanya. Tengah, kotak hijau Laptop, backend di 127.0.0.1:8080, berisi backend v0.2, yaitu Fastify + TypeScript ringan, berlangganan rpm/#, kontrak data 1.2 sebagai skema Zod, papan pengumuman di memori, dan arsip ke database (baru), serta API GET /health (+ database), GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, GET /devices/:id/readings (baru), POST /devices/:id/command (kini tercatat), dan GET /docs. Panah hijau rpm/# turun dari gateway ke backend, dan panah cmd naik dari backend ke gateway. Di bawah backend, garis pg (pool) dua arah menuju kotak biru Docker Desktop: kontainer rumahpintar-db (baru), PostgreSQL 17 + TimescaleDB 2.30.2, volume rumahpintar-data, loket 127.0.0.1:5432, dengan tabel devices, readings, device_health, commands, users, dan rules. Di kanan, empat tamu: Bruno untuk mencoba API dan browser untuk membuka /docs, keduanya lewat HTTP ke backend; DBeaver (baru) lewat loket 5432 dan psql lewat docker exec, keduanya ke database. Bawah, GitHub rumah-pintar-mini: backend/migrasi/001_skema_awal.sql baru, backend/src/db/ baru, backend/README.md v0.2, backend/bruno/riwayat Node 1.yml baru, KONTRAK-DATA.md tetap 1.2, dan firmware/ tidak berubah. Kanan bawah, kotak putus-putus menyusul: Modul 18 TimescaleDB (hypertable, rata-rata per jam, retensi, backup), Modul 19 aturan otomatis di backend, dan Modul 22 dashboard React.](aset/diagram-proyek-modul-17.png)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan terminalnya, dan **browser** yang sudah masuk ke GitHub.
>
> ⭐ **Wajib** — langkah B menggabungkan semua pekerjaan Modul 17 ke `main`, dan Modul 18 dimulai dari sana.

| File di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `backend/migrasi/001_skema_awal.sql` | **baru**: enam tabel Rumah Pintar Mini (Praktik 3) |
| `backend/src/db/` | **baru**: `pool.ts` dan `migrasi.ts` (Praktik 3), `isi-riwayat.ts` (Praktik 4), `arsip.ts` (Praktik 5 dan 7) |
| `backend/src/services/mqtt.ts` dan `gudang.ts`, `backend/src/routes/kesehatan.ts`, `backend/src/server.ts` | menyimpan semua pesan, komentar gudang diperbarui, `/health` dengan `database`, keterangan dan versi 0.2.0 di `/docs` (Praktik 5) |
| `backend/src/routes/perangkat.ts` | `GET /devices/:id/readings` dan perintah tercatat (Praktik 7) |
| `backend/src/config/env.ts`, `backend/.env.example` | setelan `DATABASE_URL` (Praktik 3) |
| `backend/package.json`, `package-lock.json` | `pg` dan `@types/pg`, perintah `migrasi` dan `isi-riwayat`, versi 0.2.0 |
| `backend/bruno/riwayat Node 1.yml` | **baru** (Praktik 7) |
| `backend/README.md` | cara menjalankan backend v0.2 (langkah A) |

### A. Perbarui `backend/README.md`

Teman satu tim yang meng-*clone* repositorimu kini butuh dua langkah tambahan: menyalakan database dan menjalankan migrasi. Ganti isi `backend/README.md` dengan:

````markdown
# Backend Rumah Pintar Mini

Backend v0.2 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.2 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL (image TimescaleDB, lewat Docker), dan menyediakan API berdokumentasi.

## Menjalankan

1. Pasang Node.js 24 LTS dan Docker Desktop.
2. Jalankan database, cukup sekali (ganti `ganti-sandi-ini` dengan sandimu; pakai huruf, angka, dan tanda minus saja):

   ```text
   docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. Di folder ini, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` (alamat broker) dan sandi database di `DATABASE_URL`.
5. Buat tabel-tabelnya dengan `npm run migrasi`.
6. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis |
| `npm run cek` | memeriksa tipe TypeScript (jalankan sebelum setiap *commit*) |
| `npm run migrasi` | menjalankan file SQL baru di folder `migrasi/` (aman diulang) |
| `npm run isi-riwayat` | mengisi data latihan 7 hari untuk perangkat latihan `f00d00000001` dan `f00d00000002` |

## API

| Rute | Gunanya |
| :--- | :--- |
| `GET /health` | server hidup? tersambung ke broker dan database? berapa pesan diterima dan ditolak? |
| `GET /devices` | semua perangkat yang terdengar sejak server menyala |
| `GET /devices/:id/latest` | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | kesehatan terakhir satu perangkat |
| `GET /devices/:id/readings?from=…&to=…` | riwayat bacaan dari database (bawaan: satu jam terakhir; paling banyak 1.000 bacaan) |
| `POST /devices/:id/command` | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` |

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`).

## Database

Bentuk tabel ditulis sebagai file SQL bernomor di folder `migrasi/`. File yang sudah diterapkan tidak boleh diubah; setiap perubahan baru masuk ke file dengan nomor berikutnya. Tabelnya: `devices`, `readings`, `device_health`, `commands`, `users` dan `rules` (disiapkan untuk modul berikutnya), serta `schema_migrations` (catatan migrasi yang sudah diterapkan).

## Batasan v0.2

- `GET /devices`, `latest`, dan `vitals` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Riwayat bacaan dan perintah tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Server hanya menerima tamu dari laptop ini (`127.0.0.1`) karena API belum punya *login*.
````

Lalu simpan ke cabang `fitur/database`. Di terminal kedua (folder `backend`):

```text
git add README.md
git commit -m "README backend v0.2 (Modul 17)"
git push
```

### B. ⭐ Gabungkan `fitur/database` ke `main` lewat *pull request*

Semua *commit* Praktik 3–7 dan langkah A ada di cabang `fitur/database`. Saatnya meninjau dan menggabungkannya, persis seperti Modul 16 Praktik 8.6–8.9:

1. **Buka *pull request*.** Di repositori `rumah-pintar-mini` di GitHub, klik **Compare & pull request** pada pita kuning cabang `fitur/database`. Kalau pitanya sudah hilang, buka tab **Pull requests** → **New pull request**, lalu pilih **base: `main`** ← **compare: `fitur/database`**. Di bawah **Apa yang berubah?**, tulis misalnya: `Backend v0.2: database PostgreSQL lewat Docker, migrasi 001, semua pesan MQTT tersimpan, API riwayat GET /devices/:id/readings, dan perintah tercatat.` Klik **Create pull request**.
2. ***Review* dengan checklist.** Di tab **Files changed**, pastikan `migrasi/001_skema_awal.sql` ikut, dan **tidak ada** file `.env`. Cari juga sandi database-mu (**Ctrl + F** di halaman): sandi itu hanya boleh ada di `.env` laptopmu, bukan di kode. `.env.example` boleh berisi `ganti-sandi-ini` karena itu memang contoh. Lalu centang checklist di tab **Conversation** sesuai keadaan sebenarnya. Butir `KONTRAK-DATA.md` boleh dicentang: bentuk pesan MQTT tidak berubah. Kirim ringkasan lewat **Review changes** → **Comment** → **Submit review**.
3. ***Merge.*** Pilih **Create a merge commit**, klik **Merge pull request** → **Confirm merge**, lalu **Delete branch**.
4. **Pulang ke `main` di laptop.** Di terminal kedua:

   ```text
   git switch main
   git pull --prune
   git branch -d fitur/database
   ```

Setelah `git switch main`, folder `backend` di laptopmu sempat kembali ke versi v0.1 (tanpa folder `src/db`), lalu `git pull` membawanya ke v0.2. Kalau `npm run dev` sedang berjalan, server ikut dimulai ulang beberapa kali; tunggu sampai log terakhirnya bersih. Database tidak terpengaruh sama sekali karena datanya ada di volume Docker, bukan di repositori.

### C. Simpan catatan belajarmu

File `latihan-modul17.sql` dari Praktik 4 tersimpan di folder kerja DBeaver. Buka file itu di DBeaver lewat **SQL Editor** → **Open SQL script** (**F3**), lalu pilih `latihan-modul17.sql` dari daftarnya, pilih semua isinya (**Ctrl + A**), salin (**Ctrl + C**), lalu di VS Code buka jendela baru (**File → New Window**) supaya jendela `rumah-pintar-mini` tetap terbuka dan server di terminalnya tetap berjalan untuk 🧩 Tingkat 2 dan 3. Di jendela baru itu, buka folder repositori `belajar-iot` (**File → Open Folder…**), buat file **`modul-17/latihan.sql`** di dalamnya, tempel isinya, dan simpan. Folder `modul-17` itu sudah berisi `pemanasan.js` dari 🔁. Lakukan *commit* dan *push* di repositori **`belajar-iot`** dengan GitHub Desktop atau terminal.

**Bukti lulus Modul 17** (bandingkan dengan ✅ di bawah): kueri rata-rata suhu per hari 7 hari terakhir yang kamu tulis sendiri (Praktik 4.5), kiriman ganda yang tersimpan sekali (Praktik 6), dan API riwayat yang menjawab dari database (Praktik 7).

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Database** (basis data) | Program yang menyimpan data di disk secara rapi dan tahan lama, lalu menjawab pertanyaan tentang data itu. "Buku arsip" Rumah Pintar Mini. |
| **PostgreSQL** | Database sumber terbuka (*open source*) yang dipakai modul ini (versi 17). Ia menyimpan data dalam tabel dan ditanya dengan SQL. |
| **TimescaleDB** | Tambahan untuk PostgreSQL khusus data deret waktu, seperti bacaan sensor. Sudah terpasang di image modul ini, dan baru dipakai di Modul 18. |
| **Docker** / **Docker Desktop** | Docker menjalankan program siap pakai di dalam kontainer. Docker Desktop adalah aplikasinya untuk Windows dan macOS, lengkap dengan jendela pengelolanya. |
| **Image** (cetakan) | Paket berisi program beserta semua kebutuhannya, misalnya `timescale/timescaledb:2.30.2-pg17`. Diunduh sekali, bisa dipakai untuk banyak kontainer. |
| ***Tag*** | Label versi di belakang nama image, setelah titik dua. `2.30.2-pg17` berarti TimescaleDB 2.30.2 di atas PostgreSQL 17. |
| **Kontainer** (*container*) | Program yang sedang berjalan dari sebuah image, terpisah dari program lain di laptop. Kontainer modul ini bernama `rumahpintar-db`. |
| **Volume** (lemari) | Tempat penyimpanan milik Docker yang tetap ada walaupun kontainernya dihapus. Semua data database ada di volume `rumahpintar-data`. |
| **Port** (loket) dan `-p 127.0.0.1:5432:5432` | Nomor loket tempat database menunggu sambungan. Pengaturan `-p` meneruskan loket 5432 laptop (hanya untuk laptop itu sendiri) ke loket 5432 di dalam kontainer. |
| **psql** | Jendela SQL berbasis teks milik PostgreSQL. Di modul ini dijalankan di dalam kontainer dengan `docker exec -it rumahpintar-db psql …`. |
| **DBeaver** | Aplikasi berjendela untuk membuka database: melihat tabel dan isinya, serta menjalankan SQL. |
| **SQL** | Bahasa untuk bertanya dan mengubah data di database, misalnya `SELECT`, `INSERT`, `UPDATE`, dan `DELETE`. |
| **Kueri** (*query*) | Satu pertanyaan SQL kepada database, misalnya `SELECT ts, suhu FROM readings WHERE …`. Jawabannya selalu berbentuk tabel. |
| **Tabel**, **baris**, **kolom** | Tabel seperti lembar kerja: setiap baris satu catatan (satu bacaan), setiap kolom satu jenis isian dengan tipe tertentu (`suhu`, `ts`). |
| **Tipe data** | Jenis isi sebuah kolom, misalnya `text`, `integer`, `double precision`, `boolean`, `timestamptz`, dan `jsonb`. Database menolak isi yang tidak sesuai tipe. |
| **`NULL`** | Isi sel yang berarti "tidak ada nilainya" (bacaan gagal, atau perangkat tidak punya sensor itu). Berbeda dengan `0`, dan diperiksa dengan `IS NULL`, bukan `= NULL`. |
| **Kunci utama** (*primary key*) | Kolom (atau gabungan kolom) yang nilainya tidak boleh kembar, misalnya `(device_id, ts)` di `readings`. Inilah penjaga kiriman ganda. |
| **Kunci tamu** (*foreign key*) | Kolom yang harus menunjuk baris yang ada di tabel lain, misalnya `readings.device_id` yang harus terdaftar di `devices`. |
| **Skema** | Rancangan semua tabel beserta kolom, tipe, dan hubungan antartabelnya. |
| **Migrasi** | File SQL bernomor (`001_…`, `002_…`) yang mengubah bentuk tabel, dijalankan berurutan dengan `npm run migrasi` dan dicatat di tabel `schema_migrations`. |
| **Transaksi** (*transaction*) | Sekumpulan perubahan yang berhasil seluruhnya (`COMMIT`) atau dibatalkan seluruhnya (`ROLLBACK`). |
| **`WHERE`**, **`ORDER BY`**, **`LIMIT`** | Bagian `SELECT` untuk menyaring baris, mengurutkannya, dan membatasi jumlahnya. |
| **`GROUP BY`** dan **fungsi agregat** | Mengelompokkan baris (misalnya per hari), lalu meringkas setiap kelompok dengan `avg`, `min`, `max`, atau `count`. |
| **`JOIN`** | Menggabungkan baris dua tabel yang saling menunjuk, misalnya bacaan dengan lokasi perangkatnya. |
| ***Subquery*** dan **`DISTINCT ON`** | *Subquery* adalah kueri di dalam kurung yang hasilnya dipakai kueri lain. `DISTINCT ON (kolom)` hanya mengambil baris pertama setiap kelompok setelah diurutkan, misalnya bacaan paling kering setiap hari (Praktik 4.7). |
| **`timestamptz`** | Tipe untuk titik waktu lengkap dengan zonanya. Disimpan sebagai UTC, lalu ditampilkan menurut zona sesi (UTC di psql, jam laptop di DBeaver). |
| **UTC** dan **WIB** | UTC adalah waktu acuan dunia; WIB = UTC + 7 jam (WITA = UTC + 8 jam, WIT = UTC + 9 jam). Kontrak data dan API memakai UTC (akhiran `Z`). |
| **`ON CONFLICT … DO NOTHING`** | Tambahan pada `INSERT`: kalau kuncinya sudah ada, baris itu dilewati tanpa galat. Dipakai untuk kiriman ganda. |
| ***Upsert*** | Gabungan *insert* dan *update*: tambahkan baris baru, atau perbarui yang sudah ada (`ON CONFLICT … DO UPDATE`). |
| ***Pool*** | Kolam berisi beberapa sambungan database yang dibuka sekali lalu dipakai bergiliran oleh backend. |
| **Parameter** (`$1`, `$2`) | Tempat nilai dalam kalimat SQL. Nilainya dikirim terpisah sehingga isi dari luar tidak pernah dianggap perintah. |
| ***SQL injection*** | Serangan dengan menyelipkan perintah SQL ke dalam nilai dari luar, misalnya isi alamat API. Dicegah dengan parameter. |
| ***Batch insert*** | Memasukkan banyak baris dalam satu perintah, misalnya dengan `unnest`, bukan satu per satu. |
| ***Query string*** | Bagian alamat web setelah tanda `?`, misalnya `?from=…&to=…`. Di bagian ini, tanda `+` dibaca sebagai spasi, jadi ditulis `%2B`. |
| **Indeks** | Daftar terurut yang membantu database menemukan baris tanpa membaca seluruh tabel. Kunci utama otomatis punya indeks. |
| **ORM** | Library yang membuat kueri database ditulis sebagai kode biasa, misalnya Drizzle (🔬). |

## 📝 Kuis (5 soal)

1. Kamu menjalankan `docker stop rumahpintar-db`, lalu `docker rm rumahpintar-db`. Apakah bacaan yang sudah tersimpan ikut hilang? Bagaimana cara menyalakan database itu lagi, dan perintah apa yang benar-benar menghapus datanya?
2. Tulis kueri SQL untuk menghitung berapa bacaan Node 1 (`a4cf12e5b7c0`) selama satu jam terakhir yang suhunya di atas 30 °C.
3. Sebuah bacaan tersimpan dengan `ts` `2026-10-19T20:30:00Z`. Tanggal dan jam WIB berapakah itu? Mengapa rata-rata harian yang dikelompokkan dengan `ts::date` di psql bisa salah tanggal, dan bagaimana menulisnya dengan benar?
4. Sebuah `telemetry` Node 1 tiba dua kali di backend, misalnya karena jembatan broker QoS 1 mengirimnya ulang setelah `PUBACK` hilang. Apa yang terjadi di tabel `readings` dan di log backend? Apa yang akan terjadi seandainya `ts` diisi backend dengan waktu tiba, bukan oleh perangkat?
5. Temanmu menambah kolom baru dengan mengubah `001_skema_awal.sql`, lalu menjalankan `npm run migrasi`. Program itu menjawab `0 migrasi baru diterapkan, 1 sudah ada sebelumnya.`, dan kolomnya tidak muncul. Mengapa? Apa yang seharusnya ia lakukan?

<details>
<summary><b>Kunci jawaban</b></summary>

1. **Tidak hilang.** Data tersimpan di volume `rumahpintar-data`, bukan di kontainer. Jalankan lagi perintah `docker run` Kemenangan Cepat: kontainer baru langsung memakai volume yang sama, dan semua tabel serta bacaan masih ada. Yang benar-benar menghapus data adalah menghapus volumenya, `docker volume rm rumahpintar-data` (Praktik 1).
2. Satu kemungkinan jawaban:

   ```sql
   SELECT count(*) FROM readings
   WHERE device_id = 'a4cf12e5b7c0'
     AND ts >= now() - interval '1 hour'
     AND suhu > 30;
   ```

   `count(*)` menghitung baris yang lolos **semua** syarat di `WHERE` (Konsep 6 dan 8).
3. `2026-10-19T20:30:00Z` adalah pukul **03.30 WIB tanggal 20 Oktober** (UTC + 7 jam melewati tengah malam). `ts::date` mengambil tanggal menurut zona sesi, dan sesi psql di kontainer memakai UTC, jadi bacaan itu masuk ke tanggal 19: semua bacaan pukul 00.00–06.59 WIB terhitung di hari sebelumnya. Tulis `(ts AT TIME ZONE 'Asia/Jakarta')::date` (Konsep 9, Praktik 4.5).
4. Kiriman kedua punya pasangan `(device_id, ts)` yang sama dengan baris yang sudah ada, jadi `ON CONFLICT (device_id, ts) DO NOTHING` melewatinya: tabel tetap berisi **satu** baris, dan log menulis `kiriman ganda dilewati: a4cf12e5b7c0 …` (Praktik 6). Kalau `ts` adalah waktu tiba, kiriman kedua tiba beberapa saat kemudian sehingga kuncinya berbeda dan tersimpan sebagai baris **kedua**. Rata-rata harian pun menjadi melenceng (Konsep 10).
5. `001_skema_awal.sql` sudah tercatat di tabel `schema_migrations`, jadi pelari migrasi melewatinya; perubahan di file lama tidak pernah dijalankan. Ia seharusnya mengembalikan file 001 seperti semula, lalu membuat file baru bernomor berikutnya, misalnya `002_tambah_kolom_baru.sql`, berisi `ALTER TABLE readings ADD COLUMN …;`, dan menjalankan `npm run migrasi` lagi (Konsep 5).

</details>

---

## ✅ Checklist kelulusan Modul 17

Syarat lulus dari Silabus: **menulis SQL "rata-rata suhu per hari 7 hari terakhir" tanpa sontekan, kiriman ganda tidak membuat baris dobel, dan API riwayat mengembalikan data dari database.** **Jalur simulator** (belum punya Node 1 dan Node 2): semua butir Praktik 5–7 boleh dicentang dengan perangkat palsu `f00d00000001` dari simulator Modul 16.

- [ ] Pemanasan ulang JavaScript selesai, dan kunci jawabannya sudah kucocokkan (🔁).
- [ ] Docker Desktop terpasang, dan `docker run hello-world` menjawab `Hello from Docker!` (🐳 Persiapan).
- [ ] Kontainer `rumahpintar-db` menyala, dan psql menjawab `SELECT now();` dalam UTC dan WIB (Kemenangan Cepat).
- [ ] Aku bisa menghentikan dan menyalakan lagi kontainernya, dan sudah membuktikan bahwa datanya tetap ada di volume (Praktik 1).
- [ ] DBeaver tersambung ke `rumahpintar`, dan aku bisa menjelaskan mengapa jam di DBeaver berbeda dengan jam di psql (Praktik 2).
- [ ] `npm run migrasi` membuat keenam tabel, dan menjalankannya sekali lagi tidak mengubah apa pun (Praktik 3).
- [ ] ⭐ Aku menulis sendiri, tanpa melihat modul, kueri **rata-rata suhu per hari selama 7 hari terakhir** dengan tanggal WIB, dan hasilnya sama persis dengan kueri Praktik 4.5 yang kujalankan sesudahnya sebagai pembanding (pada hari lain, angkanya boleh berbeda dengan contoh modul; lihat kotak di Praktik 4.2).
- [ ] Aku bisa menjawab "jam berapa tanah paling kering setiap hari minggu ini?" dengan SQL (Praktik 4.7).
- [ ] ⭐ Backend v0.2 menyimpan semua pesan MQTT, dan setelah server dimulai ulang, jumlah bacaan Node 1 di database tidak kembali ke nol (Praktik 5).
- [ ] ⭐ `telemetry` yang sama, dikirim dua kali dari MQTTX, hanya menghasilkan **satu** baris, dan log menulis `kiriman ganda dilewati` (Praktik 6).
- [ ] ⭐ `GET /devices/<id>/readings` mengembalikan riwayat dari database di browser dan di Bruno, dan kedua tes `riwayat Node 1` lulus (Praktik 7).
- [ ] Perintah dari Bruno tercatat di tabel `commands`, lengkap dengan hasil `ack`-nya (Praktik 7.6).
- [ ] `backend/README.md` sudah diperbarui untuk v0.2 (➕ A).
- [ ] ⭐ Semua pekerjaan Modul 17 sudah ada di `main` repositori `rumah-pintar-mini` lewat *pull request*, tanpa `.env` (➕ B).

🎉 **Rumah Pintar Mini kini punya ingatan jangka panjang.** Setiap bacaan tersimpan, bisa ditanya dengan SQL, dan bisa diminta lewat API. Tantangan berikutnya: tabel `readings` akan terus membesar, sekitar 8.640 baris per hari untuk Node 1 saja. Membuatnya tetap cepat dan rapi adalah tugas modul berikutnya.

> ➡️ **Modul berikutnya:** Modul 18 — TimescaleDB: Data Deret Waktu, Agregasi Otomatis, Retensi, & Backup. Tabel `readings` menjadi *hypertable*, pertanyaan "rata-rata per jam" terjawab dalam sekejap walaupun datanya sejuta baris, data lama dibuang otomatis tanpa kehilangan ringkasannya, dan kamu belajar membuat serta memulihkan cadangan (*backup*).

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- Docker: [memasang Docker Desktop di Windows](https://docs.docker.com/desktop/setup/install/windows-install/) dan [di Mac](https://docs.docker.com/desktop/setup/install/mac-install/), [WSL 2](https://docs.docker.com/desktop/features/wsl/), [pengaturan Docker Desktop](https://docs.docker.com/desktop/settings-and-maintenance/settings/), [catatan rilis Docker Desktop](https://docs.docker.com/desktop/release-notes/) 4.95 (Docker Engine 29.8.2), [*port publishing*](https://docs.docker.com/engine/network/port-publishing/) (mengapa `127.0.0.1`), [*restart policy*](https://docs.docker.com/engine/containers/start-containers-automatically/), [batas unduhan Docker Hub](https://docs.docker.com/docker-hub/usage/), serta kode sumber Docker CLI dan Engine di [github.com/docker/cli](https://github.com/docker/cli) dan [github.com/moby/moby](https://github.com/moby/moby) (*tag* 29.8.2) untuk bentuk keluaran `docker`. Instalasi WSL: [dokumentasi Microsoft](https://learn.microsoft.com/windows/wsl/install).
- Image database: [`timescale/timescaledb` di Docker Hub](https://hub.docker.com/r/timescale/timescaledb) (*tag* `2.30.2-pg17`), [repositori image-nya](https://github.com/timescale/timescaledb-docker), [panduan Docker TimescaleDB](https://www.tigerdata.com/docs/self-hosted/latest/install/installation-docker), dan skrip awal image PostgreSQL resmi di [github.com/docker-library/postgres](https://github.com/docker-library/postgres) (`POSTGRES_PASSWORD`, `POSTGRES_DB`, inisialisasi sekali).
- PostgreSQL 17: [`CREATE TABLE`](https://www.postgresql.org/docs/17/sql-createtable.html), [batasan dan kunci](https://www.postgresql.org/docs/17/ddl-constraints.html), [`INSERT … ON CONFLICT`](https://www.postgresql.org/docs/17/sql-insert.html), [`SELECT`](https://www.postgresql.org/docs/17/sql-select.html) (`GROUP BY`, `JOIN`, `DISTINCT ON`), [tipe tanggal dan waktu](https://www.postgresql.org/docs/17/datatype-datetime.html) (`timestamptz`, `AT TIME ZONE`), [fungsi tanggal dan waktu](https://www.postgresql.org/docs/17/functions-datetime.html) (`date_trunc`), [`SET TIME ZONE`](https://www.postgresql.org/docs/17/sql-set.html), [transaksi](https://www.postgresql.org/docs/17/tutorial-transactions.html), [`EXPLAIN`](https://www.postgresql.org/docs/17/using-explain.html), [psql](https://www.postgresql.org/docs/17/app-psql.html), dan [kebijakan versi](https://www.postgresql.org/support/versioning/) (PostgreSQL 17.11).
- [node-postgres](https://node-postgres.com) (`pg` 8.23.1): *pool*, kueri berparameter, transaksi, dan konversi tipe; kode sumbernya di [github.com/brianc/node-postgres](https://github.com/brianc/node-postgres).
- [DBeaver Community](https://dbeaver.io) 26.2.3: [wiki dokumentasi](https://github.com/dbeaver/dbeaver/wiki) dan kode sumber di [github.com/dbeaver/dbeaver](https://github.com/dbeaver/dbeaver) (label menu dan tombol).
- Dari Modul 16: [Fastify](https://fastify.dev/docs/latest/) 5.12.7 (validasi *query string*), [Zod](https://zod.dev) 4.6.7 (`z.iso.datetime`, `z.iso.date`, `.refine` dengan `when`), [Bruno](https://docs.usebruno.com) 4.2.1 (**Assert**, **Clone**), dan Swagger UI lewat @fastify/swagger-ui.
- Tanda `+` sebagai spasi di *query string*: [WHATWG URL Standard, `application/x-www-form-urlencoded`](https://url.spec.whatwg.org/#application/x-www-form-urlencoded) dan [MDN: *Percent-encoding*](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding).
- Bacaan tambahan 🔬: [Drizzle ORM](https://orm.drizzle.team) 0.45.4, [Raspberry Pi OS](https://www.raspberrypi.com/software/operating-systems/), [memasang Docker Engine di Debian](https://docs.docker.com/engine/install/debian/), dan [panduan memulai Raspberry Pi](https://www.raspberrypi.com/documentation/computers/getting-started.html) (pilihan kartu dan penyimpanan).

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-17`, `papan-dan-arsip`, `docker-cetakan-kontainer`, `skema-rumah-pintar`, `waktu-utc-wib`, `kiriman-ganda`, `kueri-rata-rata-harian`, `diagram-proyek-modul-17` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Skema dari migrasi `001_skema_awal.sql` modul ini; perilaku Docker dari dokumentasi Docker di atas; waktu dan kiriman ganda dari dokumentasi PostgreSQL dan kontrak data 1.2; angka kueri rata-rata harian dari data latihan `npm run isi-riwayat`. | CC BY 4.0 |
| `swagger-riwayat.png` | Tangkapan layar asli halaman `/docs` backend modul ini (Swagger UI 5.32.6 lewat @fastify/swagger-ui 6.1.2) di laptop penulis: rute `GET /devices/{id}/readings` yang dicoba dengan **Try it out**; dipotong dan disusun ulang, dengan judul, nomor, dan keterangan oleh penulis. | Swagger UI berlisensi Apache 2.0; @fastify/swagger-ui berlisensi MIT; gambar: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua kode backend modul ini, termasuk setiap tahapnya di folder `kode/tahap/`, sudah diperiksa dengan `npm run cek` (TypeScript 7.0.2) dan dijalankan dengan Node.js 24.21.0 di Windows. Keluaran SQL, backend, Bruno CLI, dan Swagger UI direkam penulis di laptopnya dengan server PostgreSQL lab (versi 18; semua SQL di modul ini berperilaku sama di PostgreSQL 17), psql, broker MQTT lokal, serta Node 1 dan Node 2 tiruan yang mengirim pesan persis menurut kontrak data. Data latihan dibuat dengan `npm run isi-riwayat`, jadi angka rata-ratanya sama di laptop siapa pun. Keluaran perintah `docker` dan tampilan Docker Desktop **tidak** direkam dari layar: semuanya ditulis berdasarkan dokumentasi resmi dan kode sumber Docker (Oktober 2026), dan ditandai **contoh**. Tanggal, jam, `id`, dan lama tunggu di layarmu tentu berbeda.

---

[⬅️ Modul 16](../modul-16-backend-typescript-api-git/README.md) · [Fase 3](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 18 — TimescaleDB** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-18--timescaledb-data-deret-waktu-agregasi-otomatis-retensi--backup))
