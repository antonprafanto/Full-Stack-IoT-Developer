# Modul 18 — TimescaleDB: Data Deret Waktu, Agregasi Otomatis, Retensi, & Backup

🌐 **Bahasa Indonesia** · [English](../../en/phase-3-backend-data/module-18-timescaledb/README.md)

*Fase 3 · Minggu 18 · Perangkat keras (*hardware*): **tidak wajib** — data dari backend v0.2 (Node 1, Node 2, atau simulator Modul 16) ditambah 1 juta baris data uji buatan modul ini · Prasyarat: **Modul 17** (database `rumahpintar` di Docker dan backend v0.2) · Waktu: 8–10 jam, dicicil dalam satu minggu*

[⬅️ Modul 17](../modul-17-sql-dan-skema-database/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 19 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-19--realtime-kendali-dua-arah-aturan-otomatis-cloud--lokal--notifikasi)

---

Sejak Modul 17, backend-mu tidak lagi pelupa: setiap bacaan masuk ke **buku arsip**, yaitu tabel `readings` di database PostgreSQL. Namun, buku itu tidak pernah berhenti bertambah. Node 1 sendirian menulis satu baris setiap 10 detik, jadi **8.640 baris sehari** dan lebih dari **3 juta baris setahun**. Kalau Node 2, perangkat baru, dan beberapa tahun pemakaian ikut ditambahkan, pertanyaan yang di Modul 17 terjawab seketika mulai terasa berat: "rata-rata per 15 menit selama sebulan" harus membaca ratusan ribu baris. Disk juga pelan-pelan penuh, dan kalau volume database rusak, seluruh riwayat ikut hilang karena belum pernah ada salinannya.

Kabar baiknya, alatnya sudah ada di laptopmu. Kontainer `rumahpintar-db` yang kamu nyalakan di Modul 17 memakai image `timescale/timescaledb`, jadi **TimescaleDB**, tambahan PostgreSQL khusus data deret waktu, sudah terpasang sejak awal. Minggu ini kamu memakainya sungguhan.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Tabel `readings` terus membengkak: jutaan baris dalam setahun. | Data sensor hanya bertambah dan hampir tidak pernah diubah. | **Hypertable**: tabel yang otomatis dipotong per hari menjadi *chunk*, yaitu potongan atau "jilid" (Konsep 2, Praktik 2) |
| "Rata-rata per 15 menit" butuh kueri yang rumit. | `date_trunc` bawaan PostgreSQL hanya memotong per menit, jam, atau hari utuh, bukan setiap 15 menit. | **`time_bucket`**: ember waktu 15 menit, 1 jam, atau 1 hari (Konsep 3, Praktik 3) |
| Grafik per jam selama sebulan menghitung ulang ratusan ribu baris setiap kali dibuka. | Ringkasan dihitung dari nol di setiap kueri. | ***Continuous aggregate*** (agregat berkelanjutan): "buku ringkasan" per jam yang diperbarui otomatis (Konsep 5–6, Praktik 5) |
| Disk lama-kelamaan penuh. | Data mentah tidak pernah dibuang, dan disimpan apa adanya. | **Retensi** (data mentah yang lebih tua daripada 90 hari dibuang, ringkasannya tetap) dan **columnstore** (data lama dipadatkan) (Konsep 7–8, Praktik 6) |
| Kalau laptop rusak atau volume terhapus, semua riwayat hilang. | Belum pernah ada salinan cadangan. | **Backup** dengan `pg_dump` dan **restore** dengan `pg_restore`, dibuktikan sampai datanya sama (Konsep 9, Praktik 7) |
| Belum pernah diuji dengan data besar. | Data latihan Modul 17 hanya sekitar 2.300 baris. | **1 juta baris data uji** dan `EXPLAIN (ANALYZE)` untuk mengukur kecepatan dengan jujur (Konsep 4, Praktik 4) |
| Aplikasi lain belum bisa meminta ringkasan. | API v0.2 hanya mengirim bacaan mentah, paling banyak 1.000. | **`GET /devices/:id/readings?bucket=1h`** di backend **v0.3** (Konsep 10, Praktik 8) |

Di akhir minggu, `readings` sudah menjadi hypertable yang diuji dengan lebih dari satu juta baris. Kueri "rata-rata per jam selama 7 hari terakhir" selesai **di bawah satu detik**, ringkasan per jam diperbarui sendiri, data mentah yang tua dibuang otomatis tanpa kehilangan ringkasannya, dan kamu punya **backup yang sudah terbukti bisa dipulihkan** ke database kosong dengan isi yang sama persis. Backend **v0.3** menyediakan riwayat per 15 menit, per jam, dan per hari untuk dashboard di Fase 4.

![Peta jalan Modul 18. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 3 Backend dan data, Modul 16 sampai 21, disorot dengan bingkai hijau. Modul 1 sampai 17 bertanda selesai, Modul 19 sampai 21 berwarna hijau, dan Modul 18 ditandai KAMU DI SINI dengan catatan: riwayat siap tumbuh, yaitu hypertable, ringkasan otomatis, retensi, dan backup. Di bawahnya, kotak Modul 18 minggu ini, 8 sampai 10 jam dicicil; perangkat keras tidak wajib, dan modul ini lanjutan langsung Modul 17 dengan kontainer rumahpintar-db dan backend v0.2. Daftar kegiatan: pemanasan ulang JavaScript, yaitu kamus, floor/ceil, hari WIB, dan Number; Kemenangan Cepat, ember waktu pertamamu; Praktik 1, kenali TimescaleDB dan buat cabang; Praktik 2, readings menjadi hypertable; Praktik 3, ember waktu dengan time_bucket; Praktik 4, satu juta baris dan ukur kecepatannya, dengan syarat lulus kurang dari 1 detik; Praktik 5, ringkasan per jam yang otomatis; Praktik 6, retensi 90 hari dan columnstore; Praktik 7, backup dan restore yang terbukti, dengan syarat lulus data sama; Praktik 8, backend v0.3 dengan riwayat per ember; dan Tambahan, README v0.3 dan pull request ke main. Praktik 2, 4, 5, 7, 8, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: semua pekerjaan minggu ini ada di laptop, yaitu Docker Desktop, psql di dalam kontainer, dan VS Code, ditambah DBeaver dan Bruno; Praktik 2 sampai 7 memakai data latihan Modul 17 dan 1 juta baris data uji beef00000001, sedangkan Node 1 atau simulator hanya pelengkap di Praktik 8.](aset/peta-jalan-modul-18.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Semua pekerjaan minggu ini ada di laptop.** Setiap kotak perintah disertai keterangan tempatnya: **terminal VS Code** (di folder `backend`), **psql** (jendela SQL di dalam kontainer database), **DBeaver**, **Docker Desktop**, atau **Bruno**. `device_id` Node 1 `a4cf12e5b7c0` dan alamat Pi `192.168.1.37` hanya contoh; pakai milikmu sendiri.
> - **Perangkat keras tidak wajib.** Praktik 2–7 memakai **data latihan** dari Modul 17 dan **1 juta baris data uji** untuk perangkat khusus `beef00000001` yang dibuat modul ini. Praktik 8 lebih seru kalau ada pesan baru (dari Node 1 atau simulator Modul 16), tetapi tetap bisa dikerjakan tanpanya.
> - **Lanjutan langsung Modul 17.** Kontainer `rumahpintar-db`, volume `rumahpintar-data`, koneksi DBeaver, dan backend v0.2 di cabang `main` dipakai lagi apa adanya. Yang baru hanyalah migrasi 002–005, satu file SQL data uji, dan perubahan kecil di backend.
> - **Kotak Hasilnya.** Semua perintah, SQL, dan kode modul ini dijalankan penulis di laptop Windows dengan Docker Desktop, image `timescale/timescaledb:2.30.2-pg17` yang sama dengan Modul 17, dan Node.js 24. Waktu (milidetik), ukuran (MB), nama *chunk*, dan nomor *job* (tugas terjadwal) di layarmu bisa berbeda, jadi keluaran seperti itu ditandai **contoh**. Bentuk keluarannya sama.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di VS Code, DBeaver, browser, dan Bruno. **Kecuali di terminal:** menghentikan program yang sedang berjalan tetap **Ctrl + C**. Perintah terminal sama persis di Windows dan macOS, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Data uji hanya untuk perangkat `beef00000001`.** Satu juta baris itu sengaja diberi `device_id` sendiri supaya tidak tercampur dengan data perangkatmu, dan boleh dibersihkan lagi di akhir modul (➕ D).
> 2. **Retensi menghapus data mentah secara otomatis dan tidak bisa dibatalkan.** Pasang kebijakan retensi hanya setelah ringkasan per jam terisi (Praktik 5–6), dan pahami dulu angka 90 hari sebelum memakainya untuk data sungguhan.
> 3. **Berkas backup berisi seluruh datamu.** Simpan di folder `backup/` (Praktik 7 memasukkannya ke `.gitignore`), jangan di-*commit*, dan jangan dikirim ke siapa pun.
> 4. **Uji restore selalu ke database BARU** (`rumahpintar_pulih`), tidak pernah menimpa `rumahpintar`.
> 5. **Bentuk tabel tetap hanya diubah lewat file migrasi**, seperti Modul 17. Hypertable, ringkasan, retensi, dan columnstore semuanya ditulis sebagai migrasi bernomor.

Ritme modul ini sama dengan Modul 1–17. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🏆 Kemenangan Cepat: ember waktu pertamamu (20 menit)](#-kemenangan-cepat-ember-waktu-pertamamu-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Data deret waktu](#1-data-deret-waktu-buku-harian-bukan-buku-telepon) · [2 Hypertable](#2-hypertable-dan-chunk-arsip-yang-dijilid-per-hari) · [3 `time_bucket`](#3-time_bucket-ember-waktu) · [4 Indeks & `EXPLAIN`](#4-indeks-dan-explain-bagaimana-database-menemukan-jawabannya) · [5 *Continuous aggregate*](#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis) · [6 *Job*](#6-job-dan-kebijakan-petugas-yang-bekerja-sendiri) · [7 Retensi](#7-retensi-buang-jilid-lama-ringkasannya-disimpan) · [8 Columnstore](#8-columnstore-memadatkan-jilid-lama) · [9 Backup & restore](#9-backup-dan-restore-fotokopi-arsip-lalu-buktikan-bisa-dipulihkan) · [10 Dari backend](#10-dari-backend-satu-parameter-bucket)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 TimescaleDB](#praktik-1--kenali-timescaledb-dan-buat-cabang-15-menit) · [2 Hypertable](#praktik-2--readings-menjadi-hypertable-30-menit) · [3 `time_bucket`](#praktik-3--ember-waktu-dengan-time_bucket-30-menit) · [4 Satu juta baris](#praktik-4--satu-juta-baris-dan-ukur-kecepatannya-45-menit) · [5 Ringkasan per jam](#praktik-5--ringkasan-per-jam-yang-otomatis-40-menit) · [6 Retensi & columnstore](#praktik-6--retensi-90-hari-dan-columnstore-40-menit) · [7 Backup & restore](#praktik-7--backup-dan-restore-yang-terbukti-45-menit) · [8 Backend v0.3](#praktik-8--backend-v03-riwayat-per-ember-45-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-18)

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan mengapa data sensor berbeda dari data biasa** (terus bertambah, jarang diubah, ditanya per rentang waktu) dan apa yang ditambahkan TimescaleDB ke PostgreSQL.
2. **Mengubah tabel yang sudah berisi data menjadi hypertable** lewat migrasi bernomor, lalu melihat *chunk*-nya di psql dan DBeaver.
3. **Meringkas data per ember waktu** dengan `time_bucket` (15 menit, 1 jam, 1 hari WIB).
4. **Mengukur kecepatan kueri dengan jujur** memakai `EXPLAIN (ANALYZE)` pada 1 juta baris data uji, sampai kueri "rata-rata per jam 7 hari terakhir" selesai **di bawah satu detik**.
5. **Membuat ringkasan per jam yang diperbarui otomatis** (*continuous aggregate*) dan menghitung rata-rata harian yang tepat dari ringkasan itu.
6. **Memasang kebijakan retensi dan columnstore** yang membuang dan memadatkan data lama sendiri, tanpa kehilangan ringkasannya.
7. **Membuat backup dengan `pg_dump`, memulihkannya dengan `pg_restore` ke database kosong, dan membuktikan isinya sama persis**.
8. **Menambahkan riwayat per ember ke backend v0.3** (`GET /devices/:id/readings?bucket=1h`) dengan Zod, Swagger, dan Bruno.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 17** | Docker Desktop, kontainer **`rumahpintar-db`** (image `timescale/timescaledb:2.30.2-pg17`) yang menyala, volume `rumahpintar-data`, koneksi DBeaver `rumahpintar`, dan **backend v0.2** yang sudah di-*merge* ke `main` di Modul 17 ➕ B. |
| **Ruang disk tambahan sekitar 1 GB** | Satu juta baris data uji, tabel pembanding sementara, catatan perubahan (*write-ahead log*, WAL) yang disimpan PostgreSQL, dan berkas backup. Di laptop lab, volume datanya tumbuh menjadi sekitar 780 MB. |
| **Node.js 24, VS Code, Git, Bruno** | Sama seperti Modul 16–17. |
| **Broker MQTT dan Node 1 / Node 2** (tidak wajib) | Gateway Pi atau broker laptop dari Modul 12, perangkat dari Modul 14–15, atau simulator Modul 16 (`alat/simulator-perangkat.js`). Hanya dipakai kalau kamu ingin melihat bacaan baru ikut masuk ke ringkasan di Praktik 8. |
| **Terminal untuk backup di Windows** | **PowerShell**: Windows PowerShell 5.1 yang sudah ada di setiap Windows, atau PowerShell 7 kalau kamu memasangnya. Praktik 7 menjelaskan mengapa Git Bash sebaiknya tidak dipakai untuk perintah backup. |
| **Koneksi internet** | Tidak perlu unduhan besar minggu ini: image TimescaleDB sudah ada sejak Modul 17, dan backend v0.3 tidak memakai library baru. |

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, dan folder repositori `belajar-iot`.

Seperti Modul 16–17, modul Fase 3 dibuka dengan pemanasan JavaScript. Fitur baru backend minggu ini, riwayat per ember (Praktik 8), memakai lima kemampuan kecil: objek sebagai **kamus**, membulatkan waktu ke bawah dengan **`Math.floor`**, menghitung banyaknya ember dengan **`Math.ceil`**, menggeser jam untuk **hari WIB**, dan mengubah **angka yang datang sebagai teks** dari database. Pemanasan ini mengulang kelimanya dalam satu file kecil. Ketik kodenya sendiri (jangan disalin-tempel), jalankan setelah setiap langkah, lalu cocokkan hasilnya.

**Siapkan foldernya.** Buka folder repositori **`belajar-iot`** di VS Code, klik dulu ruang kosong di panel Explorer, buat folder baru **`modul-18`**, lalu buat file **`pemanasan.js`** di dalamnya. Di terminal VS Code, masuk ke folder itu:

```text
cd modul-18
```

Kali ini tidak perlu `npm init`: file ini tidak memakai library dan tidak memakai `await`, jadi Node.js bisa langsung menjalankannya.

### Langkah 1 — Objek sebagai kamus

Kamus berisi pasangan **kata kunci → arti**. Objek JavaScript bisa dipakai persis seperti itu: kuncinya teks, isinya apa saja. Backend v0.3 memakai kamus untuk menerjemahkan `?bucket=1h` menjadi lebar ember dan rentang bawaannya. Ketik di `pemanasan.js`:

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 18

// 1. Objek sebagai kamus
const MENIT = 60 * 1000; // satu menit dalam milidetik
const JAM = 60 * MENIT;
const HARI = 24 * JAM;
const EMBER = {
  "15m": { lebar: 15 * MENIT, bawaan: HARI },
  "1h": { lebar: JAM, bawaan: 7 * HARI },
};
const pilihan = "1h"; // misalnya dari ?bucket=1h
console.log(EMBER[pilihan].lebar); // 3600000 milidetik = 1 jam
console.log(EMBER[pilihan].bawaan / JAM); // rentang bawaan dalam jam
console.log(EMBER["2h"]); // kunci yang tidak ada
console.log("2h" in EMBER, Object.keys(EMBER));
```

Simpan (**Ctrl + S**), lalu jalankan di terminal:

```text
node pemanasan.js
```

**Hasilnya:**

```text
3600000
168
undefined
false [ '15m', '1h' ]
```

- Kunci yang memuat angka atau huruf aneh, seperti `"15m"`, ditulis di antara petik ganda. Isinya dibaca dengan **kurung siku**: `EMBER[pilihan]`. Kurung siku dipakai karena kuncinya ada di dalam variabel; `EMBER.pilihan` justru mencari kunci yang bernama `pilihan`.
- Kunci yang tidak ada menghasilkan **`undefined`**, bukan galat. Kalau isinya langsung dipakai (`EMBER["2h"].lebar`), barulah program berhenti dengan `TypeError`. Itulah sebabnya backend v0.3 memeriksa dulu `bucket` dengan Zod: hanya `15m`, `1h`, dan `1d` yang boleh lewat.
- **`in`** bertanya "ada kunci ini?", dan **`Object.keys`** memberi daftar semua kuncinya.

### Langkah 2 — Membulatkan ke bawah ke awal ember

Ember 15 menit dimulai pukul 10.00, 10.15, 10.30, dan seterusnya. Pukul 10.37 masuk ke ember 10.30. Di JavaScript, caranya adalah membagi waktu dengan lebar ember, membulatkan ke bawah, lalu mengalikannya lagi. Tambahkan di paling bawah:

```js
// 2. Membulatkan ke bawah ke awal ember
const waktu = new Date("2026-10-20T10:37:00+07:00"); // pukul 10.37 WIB
const lebar = EMBER["15m"].lebar;
const awalEmber = new Date(Math.floor(waktu.getTime() / lebar) * lebar);
console.log(awalEmber.toISOString()); // 10.30 WIB, ditulis dalam UTC
```

**Hasilnya** (baris baru):

```text
2026-10-20T03:30:00.000Z
```

`getTime()` memberi waktu dalam milidetik sejak 1 Januari 1970 UTC. **`Math.floor`** membulatkan ke bawah dengan membuang pecahannya (`7.4` menjadi `7`) sehingga hasil bagi "berapa ember utuh sejak 1970" kehilangan sisa 7 menitnya. Dikalikan lagi dengan lebar ember, hasilnya awal ember: pukul 03.30 UTC, yaitu 10.30 WIB. Backend v0.3 memakai trik ini supaya ember pertama di jawaban API selalu utuh (Konsep 10).

### Langkah 3 — Berapa banyak ember dalam satu rentang?

API v0.3 menolak permintaan yang menghasilkan lebih dari 1.000 ember. Untuk itu, backend menghitung banyaknya ember sebelum bertanya ke database:

```js
// 3. Berapa banyak ember dalam satu rentang?
const dari = new Date("2026-10-13T00:00:00+07:00");
const sampai = new Date("2026-10-20T00:00:00+07:00");
console.log((sampai.getTime() - dari.getTime()) / JAM); // tepat 168 jam
const bawaanSore = new Date("2026-10-20T14:20:00+07:00");
console.log(Math.ceil((bawaanSore.getTime() - dari.getTime()) / JAM)); // ember terakhir belum penuh tetap dihitung
```

**Hasilnya** (baris-baris baru):

```text
168
183
```

Tujuh hari tepat berisi 168 ember satu jam. Sampai pukul 14.20 hari ini, hasil baginya 182,33…, dan **`Math.ceil`** membulatkannya **ke atas** menjadi 183 karena ember 14.00–15.00 yang baru terisi 20 menit tetap satu titik di grafik.

### Langkah 4 — Hari WIB: geser 7 jam dulu

Trik `Math.floor` di langkah 2 menghasilkan batas ember menurut **UTC**. Untuk ember 15 menit dan 1 jam, itu tidak masalah (Konsep 3). Untuk ember **harian**, hari UTC dimulai pukul 07.00 WIB. Jalan keluarnya adalah menggeser jamnya ke WIB, membulatkannya, lalu menggesernya kembali:

```js
// 4. Hari WIB: geser 7 jam dulu
const GESER = 7 * JAM; // WIB = UTC + 7 jam
const subuh = new Date("2026-10-20T05:00:00+07:00"); // pukul 05.00 WIB
const hariUtc = new Date(Math.floor(subuh.getTime() / HARI) * HARI);
const hariWib = new Date(Math.floor((subuh.getTime() + GESER) / HARI) * HARI - GESER);
console.log(hariUtc.toISOString()); // awal hari UTC
console.log(hariWib.toISOString()); // awal hari WIB, ditulis dalam UTC
```

**Hasilnya** (baris-baris baru):

```text
2026-10-19T00:00:00.000Z
2026-10-19T17:00:00.000Z
```

Pukul 05.00 WIB tanggal 20 sama dengan pukul 22.00 UTC tanggal **19**. Pembulatan biasa memberi awal hari UTC tanggal 19, yaitu pukul 07.00 WIB tanggal 19, jadi bacaan subuh itu akan masuk ke "hari kemarin". Dengan geseran, hasilnya `2026-10-19T17:00:00.000Z`, yaitu pukul **00.00 WIB tanggal 20**: hari yang benar. Di SQL, hal yang sama dikerjakan oleh `time_bucket('1 day', ts, 'Asia/Jakarta')`.

### Langkah 5 — Angka yang datang sebagai teks

Masih ingat 🔬 "Angka yang datang sebagai teks" di Modul 17? Library `pg` mengirim angka bertipe `numeric` dan `bigint` sebagai **teks** (bukan angka) supaya tidak ada digit yang hilang. Contoh `numeric`: hasil `round(avg(suhu)::numeric, 1)` atau `avg` dari kolom bilangan bulat seperti `kelembapan`. Contoh `bigint`: hasil `count(*)`. Tambahkan:

```js
// 5. Angka yang datang sebagai teks
const baris = [
  { waktu: new Date("2026-10-19T03:00:00Z"), suhu_rata: "26.31", jumlah: "6" }, // numeric dan bigint dari pg = teks
];
console.log(baris[0].suhu_rata + 1); // teks + angka = teks
const rapi = baris.map((b) => ({
  waktu: b.waktu.toISOString().slice(0, 19) + "Z",
  suhu_rata: Number(b.suhu_rata),
  jumlah: Number(b.jumlah),
}));
console.log(rapi);
console.log(rapi[0].suhu_rata + 1);
```

**Hasilnya** (baris-baris baru):

```text
26.311
[ { waktu: '2026-10-19T03:00:00Z', suhu_rata: 26.31, jumlah: 6 } ]
27.31
```

- `"26.31" + 1` menghasilkan teks **`26.311`**, bukan 27,31: tanda `+` dengan teks berarti menyambung. Kesalahan seperti ini mudah lolos di dashboard.
- **`.map`** membentuk ulang setiap baris menjadi objek baru: waktu ditulis dengan format kontrak data, teks angka diubah dengan **`Number(…)`**.
- Backend v0.3 memilih jalan yang lebih ringkas: angkanya diubah **di dalam SQL** dengan `::float8` dan `::int` sehingga `pg` langsung mengirim angka. Yang tetap dikerjakan `.map` hanyalah menulis waktunya.

**Uji dirimu (10 menit).** Tanpa melihat kunci:

1. Ubah langkah 2 supaya membulatkan pukul 10.37 WIB ke awal ember **1 jam**. Apa hasilnya?
2. Berapa banyak ember **15 menit** dari `dari` sampai `sampai` di langkah 3?
3. Bacaan pukul **23.30 WIB** tanggal 20 masuk ke hari WIB yang mana? Hitung dengan rumus `hariWib` di langkah 4, lalu bandingkan dengan rumus `hariUtc`.

<details>
<summary>Kunci uji dirimu</summary>

```js
// uji 1: awal ember 1 jam
console.log(new Date(Math.floor(waktu.getTime() / JAM) * JAM).toISOString());

// uji 2: banyaknya ember 15 menit dalam 7 hari
console.log((sampai.getTime() - dari.getTime()) / (15 * MENIT));

// uji 3: hari WIB dan hari UTC untuk pukul 23.30 WIB
const malam = new Date("2026-10-20T23:30:00+07:00");
console.log(new Date(Math.floor((malam.getTime() + GESER) / HARI) * HARI - GESER).toISOString());
console.log(new Date(Math.floor(malam.getTime() / HARI) * HARI).toISOString());
```

1. Hasilnya `2026-10-20T03:00:00.000Z`, yaitu pukul 10.00 WIB.
2. Hasilnya `672`: 168 jam × 4 ember per jam.
3. Rumus `hariWib` memberi `2026-10-19T17:00:00.000Z`, yaitu pukul 00.00 WIB tanggal **20**: benar karena pukul 23.30 WIB masih tanggal 20. Rumus `hariUtc` memberi `2026-10-20T00:00:00.000Z`, yaitu pukul 07.00 WIB tanggal 20. Untuk jam ini kebetulan tanggalnya sama, tetapi batasnya salah: bacaan pukul 05.00 WIB tanggal 21 akan ikut masuk ke hari tanggal 20.

</details>

Pemanasan selesai. File `pemanasan.js` disimpan ke GitHub bersama catatan belajarmu di ➕ C.

> ➡️ **Lanjut** ke [🏆 Kemenangan Cepat](#-kemenangan-cepat-ember-waktu-pertamamu-20-menit).

## 🏆 Kemenangan Cepat: ember waktu pertamamu (20 menit)

> 🖥️ **Alat yang dipakai:** **Docker Desktop**, **terminal VS Code** (folder `rumah-pintar-mini/backend`), dan **psql** di dalam kontainer.

Target: dalam 20 menit, kamu mengubah ratusan bacaan menjadi **rata-rata per 15 menit** dengan satu fungsi TimescaleDB, tanpa memasang apa pun.

### Langkah 1 — Nyalakan database (2 menit)

Buka **Docker Desktop** dan tunggu sampai mesinnya menyala. Kontainer `rumahpintar-db` menyala sendiri berkat `--restart unless-stopped` dari Modul 17. Pastikan di terminal VS Code:

```text
docker ps
```

Baris `rumahpintar-db` harus berstatus `Up …`. Kalau tidak ada, nyalakan dengan `docker start rumahpintar-db` (Modul 17 Praktik 1.2).

### Langkah 2 — Segarkan data latihan (3 menit)

Data latihan Modul 17 dibuat untuk tujuh hari **sebelum hari kamu mengisinya**. Kalau Modul 17 kamu kerjakan minggu lalu, datanya sudah "tua", dan angka-angka di modul ini tidak akan cocok. Seperti kotak di Praktik 4.2 Modul 17, kosongkan dulu bacaan latihan, lalu isi ulang. Pemanasan tadi dikerjakan di repositori `belajar-iot`, sedangkan langkah ini butuh proyek Rumah Pintar Mini. Di VS Code, pilih **File → Open Folder…**, buka folder `rumah-pintar-mini`, lalu buka terminal baru (**Terminal → New Terminal**). Terminal baru selalu mulai di folder `rumah-pintar-mini`, jadi ketik `cd backend` dulu. Setelah itu, jalankan dua perintah ini satu per satu:

```text
docker exec rumahpintar-db psql -U postgres -d rumahpintar -c "DELETE FROM readings WHERE device_id IN ('f00d00000001', 'f00d00000002');"
npm run isi-riwayat
```

**Hasilnya** (contoh; angkanya bergantung pada isi database-mu dan jam saat kamu menjalankannya):

```text
DELETE 2286
```

```text
f00d00000001: 1143 bacaan dikirim, 1143 baru tersimpan
f00d00000002: 1143 bacaan dikirim, 1143 baru tersimpan
```

Perintah pertama **hanya** menghapus bacaan dua perangkat latihan (`WHERE device_id IN (…)`, Modul 17 Konsep 7); bacaan perangkatmu sendiri tidak tersentuh. Di jalur simulator, bacaan simulator untuk `f00d00000001` dan `f00d00000002` dari Modul 17 ikut terhapus karena nomornya sama, dan itu tidak apa-apa. `docker exec … psql -c "…"` menjalankan satu kalimat SQL tanpa masuk ke psql. Perintah kedua mengisi ulang tujuh hari penuh sampai sekarang sehingga kemarin dan hari-hari sebelumnya berisi angka yang sama persis dengan modul ini. **Catat tanggal hari ini** (menurut WIB) di catatanmu: Praktik 3, 5, dan 8 menyebutnya **hari H**, dan contoh-contohnya dihitung dari tanggal itu.

### Langkah 3 — TimescaleDB sudah ada (3 menit)

Masuk ke psql:

```text
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
```

Lalu ketik perintah psql ini (diawali garis miring terbalik, tanpa titik koma):

```text
\dx
```

**Hasilnya:**

```text
                                                List of installed extensions
    Name     | Version |   Schema   |                                      Description                                      
-------------+---------+------------+---------------------------------------------------------------------------------------
 plpgsql     | 1.0     | pg_catalog | PL/pgSQL procedural language
 timescaledb | 2.30.2  | public     | Enables scalable inserts and complex queries for time-series data (Community Edition)
(2 rows)
```

`\dx` (*describe extensions*) menampilkan tambahan yang terpasang di database ini. **`timescaledb` versi 2.30.2** sudah ada sejak kamu menjalankan `docker run` di Modul 17 karena image-nya memasangnya otomatis. Baris `plpgsql` adalah bahasa pemrograman bawaan PostgreSQL, dan tidak perlu kamu urus.

### Langkah 4 — Rata-rata per 15 menit (7 menit)

Tetap di psql, ketik (atau tempel) kueri ini, lalu tekan **Enter**:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT time_bucket('15 minutes', ts) AS ember,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= now() - INTERVAL '2 hours'
GROUP BY ember
ORDER BY ember;
```

**Hasilnya** (contoh; jam dan angkanya mengikuti saat kamu menjalankannya):

```text
         ember          | suhu_rata | jumlah 
------------------------+-----------+--------
 2026-10-20 20:30:00+07 |      26.6 |      2
 2026-10-20 20:45:00+07 |      25.9 |      1
 2026-10-20 21:00:00+07 |      25.9 |      2
 2026-10-20 21:15:00+07 |      25.6 |      1
 2026-10-20 21:30:00+07 |      25.4 |      2
 2026-10-20 21:45:00+07 |      24.7 |      1
 2026-10-20 22:00:00+07 |      25.0 |      2
 2026-10-20 22:15:00+07 |      24.8 |      1
(8 rows)
```

Itulah dua jam bacaan perangkat latihan, dikelompokkan ke ember-ember 15 menit, masing-masing dengan rata-ratanya. **`time_bucket('15 minutes', ts)`** mengubah setiap `ts` menjadi awal embernya, dan `GROUP BY ember` meringkas setiap ember menjadi satu baris (Konsep 3 membahasnya lebih dalam). Sebelum tabel itu, psql menulis `SET`, tanda bahwa zona sesi sudah diganti. Baris `SET` dan `RESET` seperti itu tidak ditulis di kotak Hasilnya modul ini.

Perhatikan kolom `jumlah` yang berselang-seling **2, 1, 2, 1**. Data latihan dibuat setiap 10 menit (pukul 20.30, 20.40, 20.50, …), jadi ember 20.30–20.45 berisi dua bacaan (20.30 dan 20.40), sedangkan ember 20.45–21.00 hanya satu (20.50). Bacaan Node 1 sungguhan, yang datang setiap 10 detik, mengisi setiap ember 15 menit dengan sekitar sembilan puluh bacaan.

### Langkah 5 — Ganti lebar embernya (5 menit)

Ubah `'15 minutes'` menjadi `'1 hour'` dan `'2 hours'` menjadi `'6 hours'`, lalu jalankan lagi:

```sql
SELECT time_bucket('1 hour', ts) AS ember,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= now() - INTERVAL '6 hours'
GROUP BY ember
ORDER BY ember;
```

**Hasilnya** (contoh):

```text
         ember          | suhu_rata | jumlah 
------------------------+-----------+--------
 2026-10-20 16:00:00+07 |      29.5 |      3
 2026-10-20 17:00:00+07 |      29.2 |      6
 2026-10-20 18:00:00+07 |      28.4 |      6
 2026-10-20 19:00:00+07 |      27.5 |      6
 2026-10-20 20:00:00+07 |      26.6 |      6
 2026-10-20 21:00:00+07 |      25.5 |      6
 2026-10-20 22:00:00+07 |      24.9 |      3
(7 rows)
```

Cukup dua nilai yang diganti, dan ringkasannya kini per jam. Ember di tengah berisi enam bacaan (setiap 10 menit selama satu jam). Ember pertama dan terakhir hanya terisi sebagian karena "enam jam terakhir" dimulai di tengah jam 16.00 dan berakhir di tengah jam 22.00. Suhunya turun dari sore ke malam, persis pola harian yang dibuat skrip data latihan.

Kembalikan zona sesi dan keluar dari psql:

```text
RESET TIME ZONE;
\q
```

🎉 **Kemenangan pertama!** Kamu baru saja meringkas data deret waktu dengan fungsi khusus TimescaleDB. Sejauh ini, `readings` masih tabel biasa; `time_bucket` sudah bekerja juga di tabel biasa. Mulai Praktik 2, tabel itu berubah menjadi hypertable, dan sisa modul ini membuat ringkasan seperti ini tetap kilat walaupun datanya jutaan baris.

> [!TIP]
> **Tidak jalan?**
>
> - `Cannot connect to the Docker daemon` atau `failed to connect to the docker API` → Docker Desktop belum menyala. Tunggu sampai ikon pausnya tenang, lalu ulangi.
> - `npm run isi-riwayat` menjawab `connect ECONNREFUSED 127.0.0.1:5432` → kontainer `rumahpintar-db` belum menyala (langkah 1). Kalau di Modul 17 kamu memakai loket `5433`, pastikan `DATABASE_URL` di `.env` masih menyebut `5433`.
> - `npm error Missing script: "isi-riwayat"` atau `npm error enoent Could not read package.json` → terminal tidak berada di folder `backend` (misalnya masih di folder `belajar-iot` dari 🔁), atau cabang yang aktif bukan hasil Modul 17. Buka folder `rumah-pintar-mini` seperti di langkah 2, jalankan `git switch main`, lalu `cd backend`.
> - Kueri langkah 4 menjawab `(0 rows)` → data latihan belum mencakup dua jam terakhir. Ulangi langkah 2 dari folder `backend`.
> - `ERROR:  function time_bucket(unknown, timestamp with time zone) does not exist` → database ini tidak memuat TimescaleDB. Biasanya karena kontainernya dibuat dari image lain (misalnya `postgres:17`). Periksa kolom **IMAGE** di `docker ps`: harus `timescale/timescaledb:2.30.2-pg17`.

> ➡️ **Lanjut** ke [🧠 Konsep "Mengapa"](#-konsep-mengapa).

## 🧠 Konsep "Mengapa"

Ada sepuluh konsep. Tidak perlu dibaca sekaligus sebelum praktik. Urutannya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–2 → Praktik 1–2 (TimescaleDB dan hypertable)
2. Konsep 3–4 → Praktik 3–4 (ember waktu, 1 juta baris, dan mengukur kecepatan)
3. Konsep 5–6 → Praktik 5 (ringkasan otomatis)
4. Konsep 7–8 → Praktik 6 (retensi dan columnstore)
5. Konsep 9 → Praktik 7 (backup dan restore)
6. Konsep 10 → Praktik 8 (backend v0.3)

Kotak ⬆️/➡️ di akhir setiap praktik dan di akhir setiap kelompok konsep di atas mengantarmu ke langkah berikutnya. Potongan SQL di bagian konsep cukup dibaca: semuanya dijalankan di praktik, dan yang mengubah bentuk tabel (hypertable, buku ringkasan, retensi, columnstore) hanya lewat file migrasi.

### 1. Data deret waktu: buku harian, bukan buku telepon

Di Modul 17, database diibaratkan **buku arsip**. Ternyata ada dua jenis arsip yang sifatnya sangat berbeda. Yang pertama seperti **buku telepon**: isinya nama dan nomor, jumlahnya tidak banyak berubah, dan setiap baris bisa diubah kapan saja (orang pindah rumah, ganti nomor). Tabel `devices` dan `users` seperti ini. Yang kedua seperti **buku harian**: setiap catatan ditulis di halaman berikutnya dengan tanggal dan jam, catatan lama tidak pernah diubah, dan bukunya terus menebal. Tabel `readings` adalah buku harian.

Data yang setiap barisnya ditandai waktu dan terus bertambah seperti ini disebut **data deret waktu** (*time-series data*). Sifatnya khas:

| Sifat | Buku telepon (`devices`) | Buku harian (`readings`) |
| :--- | :--- | :--- |
| Pertumbuhan | Hampir tetap | Terus bertambah: Node 1 saja 8.640 baris sehari |
| Mengubah baris lama | Sering (`UPDATE` nama, lokasi) | Hampir tidak pernah: bacaan pukul 10.10 kemarin tidak akan berubah |
| Pertanyaan yang biasa | "Siapa pemilik nomor ini?" (satu baris) | "Berapa rata-rata suhu **per jam** selama **seminggu**?" (ribuan baris dalam satu **rentang waktu**) |
| Data lama | Tetap penting | Makin tua makin jarang dibaca; sering cukup ringkasannya saja |

PostgreSQL biasa memperlakukan kedua jenis tabel itu sama. Untuk buku harian yang tebalnya jutaan baris, itu boros: kueri per rentang waktu harus melewati indeks yang makin besar, `DELETE` untuk membuang data lama berjalan lambat dan meninggalkan "lubang" di disk, dan setiap ringkasan dihitung ulang dari nol. **TimescaleDB** adalah tambahan (*extension*) PostgreSQL yang mengajarkan database cara mengurus buku harian. Ia bukan database lain: tabelmu tetap tabel PostgreSQL, SQL-mu tetap SQL yang sama, DBeaver dan library `pg` tetap tersambung seperti biasa. Yang bertambah adalah beberapa kemampuan khusus, dan minggu ini kamu memakai lima di antaranya: hypertable, `time_bucket`, *continuous aggregate*, retensi, dan columnstore.

TimescaleDB dibuat oleh perusahaan yang dulu bernama Timescale dan kini bernama **Tiger Data**. Tambahan itu tetap bernama TimescaleDB, dan dokumentasi resminya kini ada di `tigerdata.com/docs`. Image yang kamu pakai sejak Modul 17 adalah edisi **Community**: semua fitur di modul ini gratis untuk dipakai di laptop dan server-mu sendiri.

### 2. Hypertable dan *chunk*: arsip yang dijilid per hari

Bayangkan buku harian yang ditulis di satu jilid raksasa. Untuk mencari catatan minggu lalu, kamu harus membuka buku setebal lemari. Untuk membuang catatan tahun lalu, kamu harus menyobek halaman satu per satu. Arsip yang rapi tidak bekerja begitu: catatannya **dijilid per hari** (atau per minggu), jilid-jilid itu dijajarkan di rak menurut tanggal, dan di punggung setiap jilid tertulis rentang tanggalnya.

**Hypertable** adalah tabel yang dijilid otomatis seperti itu. Dari luar ia tetap terlihat sebagai satu tabel `readings`: kamu tetap menulis `INSERT INTO readings` dan `SELECT … FROM readings`, dan backend v0.2 tidak perlu diubah sedikit pun. Di dalamnya, TimescaleDB memotong baris-barisnya menurut kolom waktu (`ts`) menjadi tabel-tabel kecil yang disebut ***chunk*** (potongan, "jilid"). Setiap *chunk* menampung satu rentang waktu, misalnya satu hari, dan dibuat sendiri saat bacaan pertama untuk hari itu tiba.

Keuntungannya terasa di tiga tempat:

1. **Kueri per rentang waktu hanya membuka jilid yang perlu.** Pertanyaan "tujuh hari terakhir" hanya menyentuh tujuh atau delapan *chunk*, berapa pun tebal seluruh arsipnya. Database tahu rentang setiap *chunk* sehingga *chunk* lain tidak dilirik sama sekali (Konsep 4).
2. **Membuang data lama berarti membuang jilid utuh.** Tidak ada lagi `DELETE` jutaan baris yang lambat: satu jilid dibuang seperti menghapus satu file (Konsep 7).
3. **Jilid lama bisa dipadatkan** tanpa mengganggu jilid hari ini yang masih ditulisi (Konsep 8).

Tabel biasa diubah menjadi hypertable dengan satu fungsi, `create_hypertable`. Inti migrasi `002_hypertable.sql` di Praktik 2 adalah baris ini (Praktik 2.1 menambahkan satu baris `LOCK TABLE` di depannya):

```sql
SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);
```

| Bagian | Artinya |
| :--- | :--- |
| `'readings'` | Tabel yang diubah. Isinya, kolomnya, kuncinya, dan kunci tamunya tetap. |
| `by_range('ts', INTERVAL '1 day')` | Potong menurut kolom waktu `ts`, satu *chunk* untuk setiap **1 hari**. Tanpa angka ini, bawaannya 7 hari. |
| `migrate_data => true` | Tabelnya sudah berisi data (latihan dan bacaan sungguhan dari Modul 17), jadi pindahkan baris-baris lama itu ke *chunk* yang sesuai. Tanpa ini, `create_hypertable` menolak tabel yang tidak kosong. |

Satu syarat penting: setiap **kunci unik**, termasuk kunci utama, harus memuat kolom waktunya. Kunci utama `readings` adalah `(device_id, ts)` sejak Modul 17, jadi syarat itu sudah terpenuhi. Itulah satu lagi alasan kunci itu dirancang begitu. Kunci tamu dari `readings` ke `devices` juga tetap berlaku.

Mengapa satu hari? Data Rumah Pintar Mini kecil: satu hari bacaan Node 1 (8.640 baris) hanya sekitar 1,7 MB beserta indeksnya. *Chunk* harian membuat retensi (Konsep 7) memotong tepat per hari, dan jumlah *chunk* tetap wajar: sekitar 365 setahun. Untuk data yang jauh lebih deras, TimescaleDB menyarankan lebar *chunk* yang membuat indeks *chunk* yang sedang ditulisi muat di sekitar seperempat RAM server. Itu urusan nanti.

Batas setiap *chunk* harian jatuh pada **pukul 00.00 UTC**, yaitu **pukul 07.00 WIB**. Jadi, satu *chunk* berisi bacaan dari pukul 07.00 WIB sampai sebelum pukul 07.00 WIB keesokan harinya. Hal ini tidak memengaruhi hasil kueri apa pun. Ia terlihat saat kamu mengintip daftar *chunk* di Praktik 2, dan nanti menentukan kapan sebuah jilid boleh dibuang retensi: setiap pukul 07.00 WIB, satu jilid lagi melewati batas 90 hari (Praktik 6 dan 7).

![Diagram hypertable dan chunk, arsip yang dijilid per hari: dari luar tetap satu tabel readings, dan di dalamnya TimescaleDB menjilid barisnya per hari menurut kolom ts. Kiri, kecil dan pudar, kartu Tabel biasa, satu jilid raksasa, berisi satu buku tebal bertuliskan readings, semua hari dalam satu jilid. Di bawahnya tertulis bahwa mencari catatan minggu lalu berarti membuka buku setebal lemari, dan membuang catatan lama berarti menyobek halaman satu per satu (DELETE jutaan baris). Panah abu-abu menuju kartu biru utama, hypertable readings, dari luar tetap satu tabel dan di dalamnya satu jilid (chunk) per hari. Di atas kartu itu, dua kapsul, INSERT INTO readings dan SELECT … FROM readings, menunjuk ke kartu, dengan catatan bahwa tabel itu ditulis dan dibaca seperti biasa dan backend v0.2 tidak perlu diubah. Pojok kanan atas kartu menjelaskan bahwa jam di punggung jilid ditulis dalam WIB, dan batas jilid pukul 00.00 UTC sama dengan 07.00 WIB. Di dalam kartu, jilid-jilid berdiri berjajar di rak, dari yang tertua di kiri sampai yang terbaru di kanan. Paling kiri ada tempat kosong bergaris putus-putus; jilid tertua, _hyper_1_10_chunk tanggal 22 Jun, sudah keluar dari rak dan digambar merah muda di bawah papan rak, dengan nomor 2 dan tulisan jilid tertua dibuang utuh. Sesudahnya, jilid-jilid lama yang tipis, pudar, dan dicoret tipis, dengan titik-titik di antaranya; di atasnya ada nomor 3 dan tulisan lebih tipis, dipadatkan. Di kanan, delapan jilid terbaru yang tebal dan berwarna biru, dengan nama dan rentang waktu di punggungnya, mulai _hyper_1_2_chunk dengan rentang 13 Okt 07.00 hingga 14 Okt 07.00, _hyper_1_3_chunk 14 Okt 07.00 hingga 15 Okt 07.00, dan seterusnya, sampai _hyper_1_9_chunk 20 Okt 07.00 hingga 21 Okt 07.00. Kurung di atas kedelapan jilid itu bernomor 1 dengan tulisan dibuka kueri 7 hari terakhir, dan di bawah papan rak tertulis 8 jilid terbaru, 13 sampai 20 Oktober. Di bawah rak ada tiga keuntungan bernomor. 1, hanya jilid yang perlu dibuka: kueri 7 hari terakhir menyentuh 8 jilid terbaru, dan jilid lain (pudar) dipangkas. 2, buang data lama sama dengan buang jilid utuh, seperti menghapus satu file, tanpa DELETE jutaan baris (Konsep 7). 3, jilid lama bisa dipadatkan, dan jilid hari ini yang masih ditulisi tidak terganggu (Konsep 8). Paling bawah, kotak abu-abu: satu fungsi di migrasi 002_hypertable.sql (Praktik 2) menjilid readings per hari dan memindahkan baris yang sudah ada, yaitu SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);](aset/jilid-hypertable.png)

> ➡️ **Sudah membaca Konsep 1–2?** Lanjut ke [Praktik 1](#praktik-1--kenali-timescaledb-dan-buat-cabang-15-menit).

### 3. `time_bucket`: ember waktu

Di Modul 17, rata-rata per hari dihitung dengan mengelompokkan bacaan menurut tanggal. Bagaimana dengan "rata-rata per **15 menit**"? `date_trunc` milik PostgreSQL hanya bisa memotong ke satuan utuh (menit, jam, hari, bulan), bukan "setiap 15 menit". (PostgreSQL 14 ke atas sebenarnya punya `date_bin` yang mirip, tetapi ia tidak bisa membuat ember bulanan dan tidak bisa dipakai untuk buku ringkasan di Konsep 5.) TimescaleDB menambahkan fungsi **`time_bucket`** (*bucket* = ember): bayangkan deretan ember berlabel waktu, masing-masing selebar 15 menit, dan setiap bacaan dimasukkan ke ember yang rentangnya memuat `ts`-nya.

```sql
SELECT time_bucket('15 minutes', ts) AS ember,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= now() - INTERVAL '2 hours'
GROUP BY ember
ORDER BY ember;
```

`time_bucket('15 minutes', ts)` mengubah setiap `ts` menjadi **awal embernya**: bacaan pukul 10.07 masuk ke ember 10.00, bacaan pukul 10.22 ke ember 10.15. Setelah itu, `GROUP BY ember` dan fungsi agregat bekerja persis seperti di Modul 17. Lebar ember bebas: `'5 minutes'`, `'1 hour'`, `'6 hours'`, `'1 day'`.

Untuk ember **harian**, zona waktu kembali penting (Konsep 9 Modul 17). Ember `time_bucket('1 day', ts)` dimulai pukul 00.00 **UTC**, yaitu 07.00 WIB, jadi bacaan pukul 00.00–06.59 WIB masuk ke hari sebelumnya. Sebutkan zonanya sebagai argumen ketiga:

```sql
time_bucket('1 day', ts, 'Asia/Jakarta')   -- ember harian menurut hari WIB (00.00–24.00 WIB)
```

Untuk ember 15 menit dan 1 jam, zona waktu tidak berpengaruh karena WIB berselisih tepat 7 jam dengan UTC. Ember pukul 10.00 WIB tetap ember yang sama, hanya ditulis sebagai 03.00 UTC. Pembaca di WITA atau WIT memakai `'Asia/Makassar'` atau `'Asia/Jayapura'` untuk data perangkatnya sendiri, seperti di Modul 17.

### 4. Indeks dan `EXPLAIN`: bagaimana database menemukan jawabannya

"Cepat" harus diukur, bukan ditebak. PostgreSQL bisa menceritakan **rencananya**, yaitu langkah-langkah yang akan ia tempuh untuk menjawab sebuah kueri, dan berapa lama langkah-langkah itu sebenarnya berjalan. Caranya, tulis `EXPLAIN (ANALYZE)` di depan kueri:

```sql
EXPLAIN (ANALYZE)
SELECT time_bucket('1 hour', ts) AS jam, round(avg(suhu)::numeric, 1) AS suhu_rata
FROM readings
WHERE device_id = 'beef00000001' AND ts >= now() - INTERVAL '7 days'
GROUP BY jam
ORDER BY jam;
```

Jawabannya berupa pohon langkah, dibaca dari yang paling menjorok ke dalam. Untuk pemula, tiga hal saja yang perlu dicari:

- **`Index Scan using …`** atau **`Index Only Scan`**: database memakai **indeks** (daftar isi yang terurut) untuk melompat langsung ke baris yang dicari. Lawannya, **`Seq Scan`** (*sequential scan*), membaca seluruh tabel dari awal sampai akhir. Untuk tabel jutaan baris, itu tanda bahaya.
- **Jumlah *chunk* yang disentuh.** Pada hypertable, rencana hanya memuat *chunk* yang rentangnya, seluruhnya atau sebagian, masuk ke `WHERE ts >= …`. *Chunk* lain dipangkas sebelum kueri berjalan.
- **`Execution Time`** di baris terakhir: lama kueri benar-benar berjalan, dalam milidetik.

Indeks apa yang dipakai? Kunci utama `(device_id, ts)` dari Modul 17 sekaligus merupakan indeks yang terurut menurut perangkat, lalu menurut waktu. Itulah bentuk yang paling cocok untuk pertanyaan "perangkat X, rentang waktu Y". Saat tabelnya menjadi hypertable, `create_hypertable` menambah satu indeks lagi, `(ts DESC)`, untuk pertanyaan "bacaan terbaru dari semua perangkat". Untuk modul ini, keduanya sudah cukup; tidak perlu membuat indeks baru.

Satu hal yang perlu diakui dengan jujur: dengan indeks yang tepat, **tabel biasa pun** bisa menjawab "rata-rata per jam tujuh hari terakhir" dari sejuta baris dalam hitungan puluhan milidetik. Di Praktik 4 kamu akan melihat sendiri bahwa untuk kueri itu, hypertable dan tabel biasa hampir sama cepat. Keunggulan hypertable yang sesungguhnya muncul di tempat lain: membuang data lama dalam sekejap, ringkasan otomatis yang menjawab puluhan kali lebih cepat, dan pemadatan data lama. Semuanya dibahas di Konsep 5–8.

> ➡️ **Sudah membaca Konsep 3–4?** Lanjut ke [Praktik 3](#praktik-3--ember-waktu-dengan-time_bucket-30-menit).

### 5. *Continuous aggregate*: buku ringkasan yang ditulis petugas otomatis

Bayangkan setiap kali kepala kantor bertanya "berapa rata-rata suhu per jam bulan lalu?", seorang staf harus membuka semua jilid sebulan dan menghitung ulang dari baris pertama. Kantor yang cerdas menugasi seorang **petugas** yang setiap setengah jam menulis **buku ringkasan**: satu baris per jam per perangkat berisi rata-rata, nilai terendah, nilai tertinggi, dan banyaknya bacaan. Saat ada pertanyaan, cukup buka buku ringkasan yang tipis itu.

***Continuous aggregate*** (agregat berkelanjutan, disingkat CAGG) adalah buku ringkasan itu. Bentuknya seperti *view* PostgreSQL: kueri `GROUP BY time_bucket(…)` yang diberi nama. Bedanya, hasilnya **disimpan** (*materialized*), dan TimescaleDB memperbaruinya sedikit demi sedikit, hanya untuk jam yang datanya berubah, bukan menghitung ulang semuanya. Migrasi `003_ringkasan_per_jam.sql` di Praktik 5 membuat buku ringkasan `readings_per_jam`:

```sql
CREATE MATERIALIZED VIEW readings_per_jam
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 hour', ts) AS jam,
       device_id,
       avg(suhu)   AS suhu_rata,
       count(suhu) AS suhu_n,
       …
       count(*)    AS jumlah_bacaan
FROM readings
GROUP BY jam, device_id
WITH NO DATA;
```

Tiga bagian yang perlu dipahami:

- **`timescaledb.continuous`** menjadikannya buku ringkasan, bukan *view* biasa.
- **`materialized_only = false`** (ringkasan *real-time* atau waktu nyata): kalau jam yang ditanyakan lebih baru daripada jam terakhir yang sudah diringkas petugas, misalnya jam yang sedang berjalan, TimescaleDB melengkapinya langsung dari data mentah. Jadi, jam-jam terbaru selalu ikut tampil; tanpa pengaturan ini, jam-jam itu baru muncul setelah petugas lewat. (Bacaan yang terlambat untuk jam yang sudah diringkas baru ikut terhitung kalau jam itu diringkas ulang, dan petugas hanya meringkas ulang tiga hari ke belakang.)
- **`WITH NO DATA`**: buat bukunya dulu, kosong. Pelari migrasi Modul 17 menjalankan setiap file di dalam satu transaksi, dan TimescaleDB menolak mengisi buku ringkasan di dalam transaksi. Pengisian riwayat lama dilakukan sekali sesudahnya dengan `CALL refresh_continuous_aggregate(…)` di psql.

Mengapa ada kolom `suhu_n` (banyaknya bacaan suhu yang tidak kosong) di samping `suhu_rata`? Karena **rata-rata dari rata-rata itu jebakan**. Kalau satu jam berisi 360 bacaan dan jam berikutnya baru 10, rata-rata harian tidak sama dengan rata-rata kedua angka per jamnya: jam yang berisi 360 bacaan harus diberi bobot lebih besar. Dengan menyimpan banyaknya, rata-rata harian yang tepat bisa dihitung dari buku ringkasan: jumlahkan `suhu_rata × suhu_n` setiap jam, lalu bagi dengan jumlah `suhu_n`. Pola yang sama dipakai untuk kelembapan, cahaya, dan tanah.

Buku ringkasan bisa ditanya seperti tabel biasa:

```sql
SELECT jam, round(suhu_rata::numeric, 1) AS suhu_rata, jumlah_bacaan
FROM readings_per_jam
WHERE device_id = 'beef00000001' AND jam >= now() - INTERVAL '7 days'
ORDER BY jam;
```

Kueri "rata-rata per jam tujuh hari terakhir" dari sejuta baris tadinya membaca puluhan ribu baris mentah; dari buku ringkasan, kueri itu hanya membaca 168 baris. Di Praktik 5 kamu akan mengukur sendiri bedanya.

![Diagram continuous aggregate, buku ringkasan yang ditulis petugas otomatis, dengan contoh perangkat uji beef00000001 yang mengirim satu bacaan setiap 10 detik, 20 Oktober malam; jam ditulis dalam WIB. Kiri, kartu Bacaan mentah readings, satu bacaan setiap 10 detik = 360 per jam, berisi empat pita per jam yang diisi garis-garis kecil (satu garis = 6 bacaan): 19.00–20.00 dengan 360 bacaan, 20.00–21.00 dengan 360 bacaan, 21.00–22.00 dengan 360 bacaan, dan 22.00–23.00 dengan 109 bacaan sejauh ini, yang sebagian besar pitanya masih kosong bergaris putus-putus dan bertanda jam berjalan. Tengah, kartu Petugas, job 1000, penjadwal latar TimescaleDB: setiap 30 menit meringkas ulang jendela 3 hari lalu sampai 1 jam lalu, dipasang dengan add_continuous_aggregate_policy di migrasi 003_ringkasan_per_jam.sql. Pita 19.00 dan 20.00 masuk ke petugas, lalu keluar sebagai dua baris di kanan. Pita 21.00 dan 22.00 dihubungkan dengan panah putus-putus langsung ke kanan, melewati bawah petugas, dengan keterangan real-time: belum diringkas petugas, dihitung langsung dari data mentah saat ditanya, materialized_only = false. Kanan, kartu Buku ringkasan readings_per_jam, satu baris per jam per perangkat, dengan kolom jam, device_id, suhu_rata, dan jumlah_bacaan. Baris 19.00, beef00000001, 28.5, 360 dan baris 20.00, beef00000001, 27.5, 360 bergaris tegas dengan label disimpan petugas. Baris 21.00, beef00000001, 26.5, 360 dan baris 22.00, beef00000001, 25.9, 109 bergaris putus-putus berlatar biru muda dengan label dihitung saat ditanya. Kiri bawah, kotak rumus rata-rata harian yang tepat dari buku ringkasan (Praktik 5.8): Σ(rata × n) ÷ Σn, yaitu jumlahkan rata × n setiap jam, lalu bagi dengan jumlah n. Rata-rata dari rata-rata itu jebakan, ditulis merah: jam berisi 360 bacaan harus diberi bobot lebih besar daripada jam berjalan yang baru berisi 109. Karena itu, setiap besaran menyimpan banyaknya nilai, misalnya suhu_n. Kanan bawah, kartu abu-abu Satu baris lengkap (Praktik 5.5), data latihan f00d00000001, 19 Okt pukul 06.00 WIB: suhu_rata 23.8, suhu_min 23.4, suhu_maks 24.2, suhu_n 6, lalu kelembapan, tanah, dan cahaya masing-masing dengan _rata dan _n (tanah juga _min), serta jumlah_bacaan 6; data latihan berisi satu bacaan setiap 10 menit.](aset/buku-ringkasan.png)

### 6. *Job* dan kebijakan: petugas yang bekerja sendiri

Siapa "petugas" yang memperbarui buku ringkasan? Di dalam kontainer, TimescaleDB menghidupkan **penjadwal latar** (*background worker scheduler*) yang menjalankan ***job*** (tugas terjadwal) pada jadwalnya masing-masing, seperti alarm yang berbunyi berkala. Kamu tidak menulis *job*-nya sendiri. Kamu memasang **kebijakan** (*policy*), lalu TimescaleDB membuatkan *job*-nya:

| Kebijakan | Dipasang dengan | Tugas *job*-nya |
| :--- | :--- | :--- |
| Pembaruan ringkasan | `add_continuous_aggregate_policy` (Praktik 5) | Setiap 30 menit, meringkas ulang jendela "3 hari lalu sampai 1 jam lalu" |
| Retensi | `add_retention_policy` (Praktik 6) | Sekali sehari, membuang *chunk* yang seluruh isinya lebih tua daripada 90 hari |
| Columnstore | `add_columnstore_policy` (Praktik 6) | Berkala, memadatkan *chunk* yang lebih tua daripada 7 hari |

Setiap *job* punya nomor. *Job* buatanmu mulai dari **1000**; nomor di bawahnya milik TimescaleDB sendiri (misalnya `Telemetry Reporter`, yang sudah dimatikan oleh `-e TIMESCALEDB_TELEMETRY=off` di Modul 17). Daftar *job* dan jadwalnya bisa dilihat di `timescaledb_information.jobs`, dan riwayat jalannya di `timescaledb_information.job_stats`. Kalau tidak sabar menunggu jadwal, `CALL run_job(1000);` menjalankan sebuah *job* sekarang juga.

Ada satu hal yang mengejutkan banyak orang: **kebijakan langsung bekerja begitu dipasang.** *Job* retensi dan columnstore biasanya berjalan dalam hitungan detik sesudah migrasinya, tidak menunggu besok. Karena itu, Praktik 6 selalu mencatat keadaan "sebelum" lebih dulu, baru menjalankan migrasinya.

> ➡️ **Sudah membaca Konsep 5–6?** Lanjut ke [Praktik 5](#praktik-5--ringkasan-per-jam-yang-otomatis-40-menit).

### 7. Retensi: buang jilid lama, ringkasannya disimpan

Buku harian yang tidak pernah dibuang akhirnya memenuhi gudang. Untuk Rumah Pintar Mini, bacaan per 10 detik dari tiga bulan lalu hampir tidak pernah dibaca lagi; yang masih berguna adalah **ringkasannya**, misalnya rata-rata per jam. **Kebijakan retensi** (*retention policy*) membuang data mentah yang lebih tua daripada batas tertentu secara otomatis:

```sql
SELECT add_retention_policy('readings', drop_after => INTERVAL '90 days');
```

Ada tiga hal yang membuatnya berbeda dari `DELETE … WHERE ts < now() - INTERVAL '90 days'`:

1. **Yang dibuang adalah jilid utuh.** Retensi membuang *chunk* yang **seluruh** isinya lebih tua daripada 90 hari, seperti menghapus satu file. Itu jauh lebih cepat daripada `DELETE` jutaan baris, dan tidak meninggalkan "lubang" di disk, yaitu ruang bekas baris terhapus yang baru dibersihkan belakangan. Karena yang dibuang selalu jilid utuh, data tertua yang tersisa berumur antara 90 dan sekitar 92 hari, bergantung pada letak batas *chunk*-nya dan jam petugas retensi bekerja (sekali sehari). Itu wajar.
2. **Buku ringkasan tidak ikut dibuang.** Retensi hanya berlaku untuk `readings`. Rata-rata per jam di `readings_per_jam` tetap ada, jadi "suhu per jam enam bulan lalu" masih bisa dijawab walaupun bacaan mentahnya sudah tidak ada.
3. **Syaratnya, petugas ringkasan tidak boleh menengok ke jilid yang sudah dibuang.** Kebijakan pembaruan ringkasan di Konsep 6 hanya menengok 3 hari ke belakang, jauh di dalam batas 90 hari, jadi aman. Bahayanya ada di **pembaruan manual dengan awal `NULL`** ("dari awal waktu"). Kalau perintah itu dijalankan **sesudah** retensi bekerja, TimescaleDB melihat bahwa data mentah untuk jam-jam lama sudah hilang, lalu ikut menghapus ringkasannya. Karena itulah pembaruan manual `NULL` di Praktik 5 dijalankan sekali saja, **sebelum** retensi dipasang.

Angka 90 hari hanyalah pilihan modul ini. Untuk data sungguhan, tanyakan dulu: sampai kapan bacaan per 10 detik masih dibutuhkan? Data yang sudah dibuang tidak bisa dikembalikan, kecuali dari backup (Konsep 9).

![Diagram retensi, buang jilid lama, ringkasannya disimpan: Praktik 6 dengan data uji 120 hari, 22 Juni sampai 20 Oktober, dan kebijakan add_retention_policy(…, drop_after => INTERVAL '90 days'). Lajur atas, bacaan mentah readings, satu jilid sama dengan satu hari, berupa deretan batang tipis dari 22 Jun sampai 20 Okt di atas sumbu tanggal 22 Jun, 1 Jul, 1 Agu, 1 Sep, 1 Okt, dan 20 Okt. Tiga puluh batang paling kiri berwarna merah muda, diberi kurung merah dan tulisan 30 jilid dibuang utuh oleh job retensi (1001), sekali sehari. Garis tegak tebal 90 hari lalu, 22 Jul pukul 22.22 WIB, memotong kedua lajur. Jilid 22 Jul tepat di garis itu bergaris tepi gelap, dan panah kecil menunjuknya dengan keterangan jilid 22 Jul (perbatasan): masih berisi bacaan yang lebih muda daripada 90 hari, jadi menunggu giliran besok. Batang di kanan garis berwarna biru muda. Di ujung kanan, kurung kecil di atas tiga batang terakhir bertuliskan jendela petugas ringkasan: 3 hari terakhir, jauh dari batas 90 hari, jadi aman. Lajur bawah, buku ringkasan readings_per_jam, berupa pita biru tegas yang membentang utuh dari 22 Juni sampai hari ini dengan tulisan putih ringkasan disimpan, rata-rata per jam dari 22 Juni sampai hari ini. Di bawah pita, di kiri garis 90 hari, tertulis 721 ringkasan lebih tua daripada 90 hari tetap ada, dan di kanannya tertulis bahwa retensi hanya berlaku untuk readings, jadi buku ringkasan tidak ikut dibuang. Kiri bawah, tabel sebelum dan sesudah retensi (Praktik 6.1 dan 6.3): jilid readings 121 menjadi 91, ukuran readings 201 MB menjadi 152 MB, dan ringkasan lebih tua daripada 90 hari 721 tetap 721, dengan catatan ringkasan selamat, angkanya tidak berubah. Kanan bawah, kotak merah muda bergaris putus-putus berjudul Jebakan: CALL refresh_continuous_aggregate('readings_per_jam', NULL, …); yang dijalankan SESUDAH retensi bekerja menghitung ulang semua jam dari data mentah. Data mentah lama sudah dibuang, jadi ringkasan lama ikut terhapus (di laptop lab, 721 tinggal 16). Yang aman adalah jendela yang seluruhnya di dalam 90 hari, misalnya awal now() - INTERVAL '8 days'.](aset/retensi-ringkasan.png)

### 8. Columnstore: memadatkan jilid lama

Database biasanya menyimpan data **per baris**: semua kolom satu bacaan (`ts`, `suhu`, `kelembapan`, …) ditulis berdampingan. Itu ideal untuk data yang sedang ditulisi. Jilid lama yang hanya dibaca bisa disimpan dengan cara lain: **per kolom** (columnstore). Semua nilai `suhu` satu perangkat dalam sehari dikumpulkan berurutan, lalu semua nilai `kelembapan`, dan seterusnya. Deretan angka sejenis yang berurutan seperti `28.4, 28.4, 28.5, 28.5, 28.6, …` bisa dipadatkan dengan sangat hemat, mirip file ZIP yang mengecil drastis kalau isinya banyak berulang.

```sql
ALTER TABLE readings SET (timescaledb.enable_columnstore,
  timescaledb.segmentby = 'device_id', timescaledb.orderby = 'ts DESC');
CALL add_columnstore_policy('readings', after => INTERVAL '7 days');
```

- **`segmentby = 'device_id'`**: kelompokkan per perangkat karena kueri hampir selalu menyebut satu perangkat.
- **`orderby = 'ts DESC'`**: urutkan menurut waktu di dalam setiap kelompok supaya nilai yang berdekatan (dan biasanya mirip) bersebelahan.
- **`add_columnstore_policy(…, after => INTERVAL '7 days')`**: setiap *chunk* yang lebih tua daripada 7 hari dipadatkan oleh *job*. Jilid minggu ini tetap per baris karena masih ditulisi.

Data yang sudah dipadatkan tetap bisa dibaca dengan SQL yang sama dan masih bisa ditambah: kiriman yang terlambat datang (Modul 27) tetap masuk dengan `INSERT … ON CONFLICT`. Hanya saja, penulisannya sedikit lebih lambat. Di Praktik 6, hypertable `readings` yang berisi data uji menyusut dari 152 MB menjadi 30 MB, sekitar seperlimanya.

Kalau kamu membaca tutorial TimescaleDB yang lebih lama, fitur ini disebut **kompresi** (*compression*), dengan perintah `compress_chunk` dan `add_compression_policy`. Nama-nama lama itu masih bisa dipakai di TimescaleDB 2.30, tetapi modul ini memakai nama barunya, **columnstore**.

> ➡️ **Sudah membaca Konsep 7–8?** Lanjut ke [Praktik 6](#praktik-6--retensi-90-hari-dan-columnstore-40-menit).

### 9. Backup dan restore: fotokopi arsip, lalu buktikan bisa dipulihkan

Volume `rumahpintar-data` menyimpan seluruh arsipmu di satu tempat. Kalau laptop rusak, volume terhapus tanpa sengaja (`docker volume rm`), atau migrasi salah membuang tabel, semuanya hilang. **Backup** adalah fotokopi seluruh arsip yang disimpan di tempat lain. **Restore** adalah membangun arsip baru dari fotokopi itu.

Ada satu prinsip yang dipegang para pengelola database: **backup yang belum pernah di-restore sama dengan tidak punya backup.** Berkas backup bisa rusak, tidak lengkap, atau ternyata butuh langkah khusus untuk dipulihkan, dan semua itu baru ketahuan saat kamu benar-benar membutuhkannya. Karena itu, Praktik 7 tidak berhenti setelah backup dibuat, tetapi lanjut memulihkannya ke database baru dan membuktikan isinya sama persis.

Alatnya dua program bawaan PostgreSQL yang sudah ada di dalam kontainer:

- **`pg_dump`** menulis seluruh isi satu database ke satu berkas. Dengan `-Fc` (format *custom*), berkasnya terkemas, padat, dan bisa dipulihkan sebagian.
- **`pg_restore`** membangun ulang isi database dari berkas itu.

Untuk database TimescaleDB, restore butuh dua langkah tambahan, seperti memberi tahu petugas arsip "jangan bekerja dulu, kami sedang memindahkan rak":

1. `SELECT timescaledb_pre_restore();` **sebelum** `pg_restore`: hentikan dulu pekerja latar dan siapkan katalog TimescaleDB untuk menerima isi.
2. `SELECT timescaledb_post_restore();` **sesudah** `pg_restore`: hidupkan lagi semuanya.

Kalau langkah pertama ini (langkah 4 di gambar di bawah dan di Praktik 7.4) terlupa, `pg_restore` mencetak beberapa galat dan hasilnya tampak hampir benar, tetapi ada baris yang hilang dan kunci utama `readings` tidak terpasang. Kalau langkah kedua (langkah 6) terlupa, sebagian besar data seolah lenyap: `count(*)` hanya menghitung sebagian kecil baris. Keduanya diperlihatkan di 🚨, dan keduanya hanya ketahuan kalau kamu **membuktikan** hasil restore.

Satu syarat lagi: database tujuan harus memakai **versi TimescaleDB yang sama** dengan database asal. Itulah salah satu alasan modul ini mengunci image `timescale/timescaledb:2.30.2-pg17`, bukan `latest-pg17`.

![Diagram backup dan restore, fotokopi arsip, lalu buktikan bisa dipulihkan, dengan moto tebal di bawah judul: backup yang belum pernah di-restore = tidak punya backup (Praktik 7). Bingkai besar Laptop, terminal VS Code di folder backend (di Windows memakai PowerShell, bukan Git Bash), memuat bingkai Docker Desktop dan, di dalamnya, kotak biru kontainer rumahpintar-db (PostgreSQL 17 + TimescaleDB 2.30.2). Di dalam kontainer, dari kiri: database asli rumahpintar, yang tidak pernah ditimpa karena restore selalu ke database BARU; panah pg_dump -Fc (7.3) ke berkas /tmp/rumahpintar.dump di dalam kontainer; berkas /tmp/pulih.dump, salinan dari laptop; lalu panah ke kartu database BARU rumahpintar_pulih (7.4) dengan langkah bernomor 2 createdb -T template0, 3 CREATE EXTENSION timescaledb, 4 timescaledb_pre_restore(), 5 pg_restore, dan 6 timescaledb_post_restore(); langkah 4 dan 6 berwarna biru. Dari /tmp/rumahpintar.dump, panah docker cp turun ke kartu folder backup/ di laptop yang berisi rumahpintar-2026-10-20.dump, sekitar 5 MB, dengan catatan tidak masuk Git karena backup/ ada di .gitignore (7.7), dan salin juga ke flashdisk atau Google Drive. Dari kartu itu, panah bernomor 1, docker cp, naik kembali ke /tmp/pulih.dump, dengan catatan bahwa yang dipulihkan adalah berkas di laptop, bukan sisa di kontainer. Kanan bawah, kotak merah muda bergaris putus-putus dengan tanda silang: jangan pg_dump … > berkas.dump; di Windows PowerShell 5.1, isinya diubah menjadi teks UTF-16 dan berkasnya rusak; pakai -f /tmp/… lalu docker cp. Bawah, kartu bukti, kueri sidik jari yang sama di kedua database (7.2 dan 7.5), yaitu jumlah bacaan, md5 semua baris, baris ringkasan, jilid, dan job buatanmu. Tabel berkepala bacaan, sidik_jari, ringkasan, jilid, dan tugas memuat dua baris yang sama persis: rumahpintar (asli, sebelum backup, 7.2) dan rumahpintar_pulih (salinan, sesudah restore, 7.5), masing-masing 785394, 4af27a1271c640a4fa1d914cf2c26392, 3263, 91, dan 3. Tanda centang hijau menyatakan sama persis, karakter demi karakter. Catatan bawah: sidik jari di laptopmu pasti berbeda dari contoh ini, yang penting asli dan salinan sama.](aset/backup-restore.png)

> ➡️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 7](#praktik-7--backup-dan-restore-yang-terbukti-45-menit).

### 10. Dari backend: satu parameter `bucket`

Dashboard di Fase 4 akan menggambar grafik suhu sehari, seminggu, atau sebulan. Mengirim ratusan ribu bacaan mentah ke browser untuk grafik selebar 1.000 piksel itu boros, lagi pula API v0.2 dibatasi 1.000 bacaan. Yang dibutuhkan adalah **ringkasan per ember**, dan backend v0.3 menyediakannya lewat satu parameter tambahan di rute yang sama:

```text
GET /devices/:id/readings?from=…&to=…&bucket=1h
```

| `bucket` | Ember | Sumber data | Rentang bawaan (kalau `from` kosong) |
| :--- | :--- | :--- | :--- |
| (tidak ada) | — | bacaan mentah, seperti Modul 17 | 1 jam |
| `15m` | 15 menit | hypertable `readings`, dengan `time_bucket` | 1 hari |
| `1h` | 1 jam | buku ringkasan `readings_per_jam` | 7 hari |
| `1d` | 1 hari WIB | buku ringkasan, digabung per hari dengan bobot banyaknya bacaan | 30 hari |

Tiga keputusan desain yang perlu kamu tahu:

- **Hanya tiga nilai yang diterima**, diperiksa Zod sebagai pilihan tetap (*enum*). Teks `bucket` dari luar tidak pernah ditempelkan ke SQL. Backend memakainya sebagai kunci "kamus" untuk memilih satu dari **tiga kueri SQL tetap** yang sudah ditulis di kode, lalu `device_id` dan rentang waktunya dikirim sebagai parameter `$1`, `$2`, `$3`, seperti di Konsep 10 Modul 17.
- **Paling banyak 1.000 ember per permintaan**, sama dengan batas bacaan mentah di Modul 17. Rentang yang lebih panjang (lebih dari sekitar 10 hari untuk `15m` atau 41 hari untuk `1h`) ditolak dengan `400`.
- **Awal rentang dibulatkan ke awal ember** supaya ember pertama selalu utuh. `from=…T10:20:00` dengan `bucket=1h` dimulai dari pukul 10.00.

Tanpa `bucket`, rute ini berperilaku persis seperti di Modul 17, jadi Bruno dan aplikasi lain yang sudah memakainya tidak rusak.

> ➡️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 8](#praktik-8--backend-v03-riwayat-per-ember-45-menit).

## 🔧 Praktik langkah demi langkah

### Praktik 1 — Kenali TimescaleDB dan buat cabang (15 menit)

> 🖥️ **Alat yang dipakai:** **Docker Desktop** (kontainer `rumahpintar-db` menyala), **VS Code** dengan dua terminal di folder `rumah-pintar-mini/backend`, dan **psql** di dalam kontainer.

#### 1.1 Cabang baru: `fitur/timescaledb`

Semua perubahan minggu ini dikerjakan di satu cabang, lalu digabung lewat *pull request* di ➕ B, seperti Modul 16–17. Folder `rumah-pintar-mini` sudah terbuka di VS Code sejak Kemenangan Cepat (kalau belum, buka lewat **File → Open Folder…**). Buka terminal pertama (**Terminal → New Terminal**); terminal baru selalu mulai di folder `rumah-pintar-mini`. Kalau kamu memakai terminal lama dari Kemenangan Cepat sebagai terminal pertama, naik dulu dengan `cd ..` karena terminal itu masih berada di folder `backend`. Jalankan:

```text
git switch main
git pull --prune
git switch -c fitur/timescaledb
cd backend
```

**Hasilnya:** perintah ketiga menjawab `Switched to a new branch 'fitur/timescaledb'`, lalu `cd backend` memindahkan terminal ke folder `backend` tanpa jawaban apa pun. Buka terminal kedua dengan ikon **+** di panel terminal, lalu ketik `cd backend` di sana juga. Terminal pertama dipakai untuk `npm run migrasi`, sedangkan terminal kedua untuk psql.

#### 1.2 Belum ada hypertable

Di terminal kedua, masuk ke psql seperti di Modul 17:

```text
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
```

Lalu ketik satu per satu:

```sql
SHOW timescaledb.license;
SELECT count(*) FROM timescaledb_information.hypertables;
```

**Hasilnya:**

```text
 timescaledb.license 
---------------------
 timescale
(1 row)

 count 
-------
     0
(1 row)
```

`timescale` berarti edisi **Community**: semua fitur di modul ini tersedia. Daftar hypertable masih kosong (`0`) karena sejak Modul 17 `readings` masih tabel PostgreSQL biasa. Periksa bentuknya sekarang supaya nanti bisa dibandingkan:

```text
\d readings
```

**Hasilnya** (bagian bawah):

```text
Indexes:
    "readings_pkey" PRIMARY KEY, btree (device_id, ts)
Foreign-key constraints:
    "readings_device_id_fkey" FOREIGN KEY (device_id) REFERENCES devices(device_id)
```

Hanya ada satu indeks, yaitu kunci utama, dan tidak ada baris tentang tabel anak (*child tables*). Biarkan psql tetap terbuka untuk Praktik 2.

> ➡️ **Selesai Praktik 1?** Lanjut ke [Praktik 2](#praktik-2--readings-menjadi-hypertable-30-menit) tanpa kembali ke konsep.

### Praktik 2 — `readings` menjadi hypertable (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama untuk `npm run migrasi`, terminal kedua dengan psql yang masih terbuka), **Docker Desktop**, dan **DBeaver**.

#### 2.1 Migrasi `002_hypertable.sql`

Di folder `backend/migrasi`, di samping `001_skema_awal.sql`, buat file baru **`002_hypertable.sql`**:

```sql
-- 002_hypertable.sql - tabel readings menjadi hypertable (Modul 18).
-- Namanya tetap readings, tetapi TimescaleDB kini menyimpannya per "jilid" (chunk) berisi 1 hari bacaan,
-- dipotong setiap pukul 00.00 UTC (= 07.00 WIB). Bacaan yang sudah ada ikut dipindah ke jilidnya (migrate_data).

-- Kunci tabel devices sebentar supaya tidak terjadi deadlock (saling tunggu) dengan backend yang sedang menulis.
LOCK TABLE devices IN SHARE ROW EXCLUSIVE MODE;
SELECT create_hypertable('readings', by_range('ts', INTERVAL '1 day'), migrate_data => true);
```

Dua perintah di dalamnya:

- **`LOCK TABLE devices …`** mengunci tabel `devices` sebentar, selama migrasi berjalan. Saat `readings` dipindahkan ke *chunk*, backend v0.2 yang sedang menyala mungkin sedang menulis bacaan baru. Kunci ini mencegah keduanya saling menunggu tanpa ujung (*deadlock*). Dokumentasi `create_hypertable` menyarankan langkah ini, dan perintah `LOCK TABLE` hanya berlaku di dalam transaksi, yang memang disediakan `npm run migrasi`.
- **`create_hypertable(…)`** mengubah `readings` menjadi hypertable dengan *chunk* 1 hari, dan memindahkan bacaan yang sudah ada (Konsep 2).

#### 2.2 Jalankan migrasinya

Di terminal pertama (folder `backend`):

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.2.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 002_hypertable.sql
1 migrasi baru diterapkan, 1 sudah ada sebelumnya.
```

Pelari migrasi Modul 17 melihat bahwa `001_skema_awal.sql` sudah tercatat di `schema_migrations`, jadi hanya `002` yang dijalankan. Tidak ada satu baris kode backend pun yang diubah.

#### 2.3 Lihat jilid-jilidnya

Kembali ke psql di terminal kedua. Pertama, bandingkan dua cara menghitung baris:

```sql
SELECT count(*) FROM ONLY readings;
SELECT count(*) FROM readings;
```

**Hasilnya** (contoh; angka kedua adalah banyaknya bacaan latihan dari Kemenangan Cepat langkah 2, ditambah bacaan Node 1, Node 2, atau simulator milikmu kalau ada):

```text
 count 
-------
     0
(1 row)

 count 
-------
  2284
(1 row)
```

**`ONLY readings`** berarti "hitung baris di tabel induknya saja, tanpa anak-anaknya". Hasilnya `0`: semua baris sudah pindah ke *chunk*. Tanpa `ONLY`, kamu bertanya ke hypertable, dan TimescaleDB menjumlahkan semua *chunk*-nya. Dari luar, `readings` tetap terlihat sebagai satu tabel.

Sekarang lihat lagi bentuknya:

```text
\d readings
```

**Hasilnya** (bagian bawah, contoh):

```text
Indexes:
    "readings_pkey" PRIMARY KEY, btree (device_id, ts)
    "readings_ts_idx" btree (ts DESC)
Foreign-key constraints:
    "readings_device_id_fkey" FOREIGN KEY (device_id) REFERENCES devices(device_id)
Number of child tables: 9 (Use \d+ to list them.)
```

Ada dua perubahan. Indeks baru **`readings_ts_idx`** (`ts DESC`) ditambahkan `create_hypertable` untuk pertanyaan "bacaan terbaru" (Konsep 4). Baris **`Number of child tables`** menunjukkan banyaknya *chunk*. Angkanya bergantung pada banyaknya hari yang punya data di laptopmu.

Daftar *chunk* beserta rentang waktunya:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT chunk_name, range_start, range_end
FROM timescaledb_information.chunks
WHERE hypertable_name = 'readings'
ORDER BY range_start;
RESET TIME ZONE;
```

**Hasilnya** (contoh; nama dan tanggalnya mengikuti datamu):

```text
    chunk_name    |      range_start       |       range_end        
------------------+------------------------+------------------------
 _hyper_1_1_chunk | 2026-10-12 07:00:00+07 | 2026-10-13 07:00:00+07
 _hyper_1_2_chunk | 2026-10-13 07:00:00+07 | 2026-10-14 07:00:00+07
 _hyper_1_3_chunk | 2026-10-14 07:00:00+07 | 2026-10-15 07:00:00+07
 _hyper_1_4_chunk | 2026-10-15 07:00:00+07 | 2026-10-16 07:00:00+07
 _hyper_1_5_chunk | 2026-10-16 07:00:00+07 | 2026-10-17 07:00:00+07
 _hyper_1_6_chunk | 2026-10-17 07:00:00+07 | 2026-10-18 07:00:00+07
 _hyper_1_7_chunk | 2026-10-18 07:00:00+07 | 2026-10-19 07:00:00+07
 _hyper_1_8_chunk | 2026-10-19 07:00:00+07 | 2026-10-20 07:00:00+07
 _hyper_1_9_chunk | 2026-10-20 07:00:00+07 | 2026-10-21 07:00:00+07
(9 rows)
```

Setiap baris adalah satu jilid. Perhatikan jamnya: setiap *chunk* dimulai **pukul 07.00 WIB**, yaitu pukul 00.00 UTC, seperti dijelaskan Konsep 2. Nama `_hyper_1_9_chunk` berarti "hypertable nomor 1, *chunk* nomor 9"; nomor itu hanya urutan pembuatannya, bukan tanggal. `SET TIME ZONE` hanya mengubah cara psql menuliskan jam, dan `RESET TIME ZONE` mengembalikannya ke UTC.

Semua *chunk* itu tinggal di skema tersendiri, `_timescaledb_internal`. Kamu tidak perlu menyentuhnya: baca dan tulis selalu lewat `readings`.

#### 2.4 Lihat di DBeaver

Di DBeaver, klik koneksi `rumahpintar`, lalu tekan **F5** (*refresh*, segarkan). Di samping skema `public`, kini kamu bisa membuka skema **`_timescaledb_internal`**, yang berisi tabel-tabel `_hyper_1_1_chunk`, `_hyper_1_2_chunk`, dan seterusnya. Skema itu sudah ada sejak Modul 17 (salah satu skema "milik tambahan TimescaleDB" yang disebut di Praktik 2.2 Modul 17), tetapi baru sekarang terisi. Ingat: jilid-jilid itu milik TimescaleDB. Jangan mengubah atau menghapusnya langsung dari DBeaver.

#### 2.5 Simpan ke cabang

Keluar dari psql dengan `\q`. Di terminal pertama (folder `backend`):

```text
git add migrasi/002_hypertable.sql
git commit -m "readings menjadi hypertable (Modul 18 Praktik 2)"
git push -u origin fitur/timescaledb
```

`-u` mencatat cabang `fitur/timescaledb` di GitHub sebagai pasangan cabang lokalmu. Setelah ini, cukup `git push`.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 3](#3-time_bucket-ember-waktu) (➡️ di akhir Konsep 4 akan mengantarmu ke Praktik 3).

### Praktik 3 — Ember waktu dengan `time_bucket` (30 menit)

> 🖥️ **Alat yang dipakai:** **psql** di dalam kontainer (terminal kedua, `docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`). Semua kueri juga bisa dijalankan di DBeaver.

Praktik ini memakai data latihan perangkat ruang tamu (`f00d00000001`) yang kamu isi ulang di langkah 2 Kemenangan Cepat. Hari pengisian itu adalah **hari H** yang kamu catat di sana. Angka untuk hari-hari sebelum H sama di laptop siapa pun; hanya tanggalnya yang mengikuti hari H-mu. Contoh di modul ini memakai H = 20 Oktober 2026. Yang perlu kamu ingat:

- Di setiap kueri, **ganti `2026-10-19` dengan tanggal H-1** (sehari sebelum hari H), `2026-10-13` dengan tanggal H-7, dan `2026-10-20` dengan tanggal H. Cara paling mudah: salin kuerinya ke tab kosong VS Code (**Ctrl + N**), ganti tanggalnya di sana, lalu salin ke psql. Kuerinya juga bisa disunting langsung di DBeaver.
- Tanggal H tetap sama walaupun kamu mengerjakan praktik berikutnya beberapa hari kemudian. Berbeda dengan Modul 17, **jangan** mengisi ulang data latihan saat melanjutkan di hari lain.
- Lupa tanggalnya? Setelah masuk ke psql di 3.1, tanyakan ke database: `SELECT (min(ts) AT TIME ZONE 'Asia/Jakarta')::date + 7 AS hari_h FROM readings WHERE device_id = 'f00d00000001';` (data latihan dimulai pukul 00.00 WIB tujuh hari sebelum H).

#### 3.1 Satu jam bacaan mentah

Karena psql sudah kamu tutup di akhir Praktik 2, masuk lagi ke psql di terminal kedua (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`). Mulai dari yang paling sederhana: bacaan H-1 pukul 06.00–07.00 WIB, tanpa diringkas.

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT ts, suhu FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-19 06:00:00+07' AND ts < '2026-10-19 07:00:00+07'
ORDER BY ts;
```

**Hasilnya** (tanggalmu mengikuti H-1):

```text
           ts           | suhu 
------------------------+------
 2026-10-19 06:00:00+07 | 23.8
 2026-10-19 06:10:00+07 | 23.4
 2026-10-19 06:20:00+07 | 23.4
 2026-10-19 06:30:00+07 | 24.1
 2026-10-19 06:40:00+07 | 24.2
 2026-10-19 06:50:00+07 | 23.8
(6 rows)
```

Enam bacaan, setiap 10 menit. Angkanya sama dengan contoh API riwayat di Modul 17 Praktik 7.3 karena keduanya berasal dari jam yang sama pada data latihan yang sama.

#### 3.2 Ember 15 menit

```sql
SELECT time_bucket('15 minutes', ts) AS mulai,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-19 06:00:00+07' AND ts < '2026-10-19 07:00:00+07'
GROUP BY mulai
ORDER BY mulai;
```

**Hasilnya:**

```text
         mulai          | suhu_rata | jumlah 
------------------------+-----------+--------
 2026-10-19 06:00:00+07 |      23.6 |      2
 2026-10-19 06:15:00+07 |      23.4 |      1
 2026-10-19 06:30:00+07 |      24.2 |      2
 2026-10-19 06:45:00+07 |      23.8 |      1
(4 rows)
```

Cocokkan sendiri dengan 3.1: ember 06.00–06.15 berisi bacaan 06.00 (23,8) dan 06.10 (23,4), rata-ratanya 23,6. Ember 06.15–06.30 hanya berisi bacaan 06.20 (23,4). Begitulah `time_bucket` bekerja: setiap bacaan masuk ke tepat satu ember, lalu setiap ember diringkas.

#### 3.3 Ember 1 jam, dengan dan tanpa zona waktu

```sql
SELECT time_bucket('1 hour', ts) AS jam,
       time_bucket('1 hour', ts, 'Asia/Jakarta') AS jam_wib,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-19 06:00:00+07' AND ts < '2026-10-19 12:00:00+07'
GROUP BY jam, jam_wib
ORDER BY jam;
```

**Hasilnya:**

```text
          jam           |        jam_wib         | suhu_rata | jumlah 
------------------------+------------------------+-----------+--------
 2026-10-19 06:00:00+07 | 2026-10-19 06:00:00+07 |      23.8 |      6
 2026-10-19 07:00:00+07 | 2026-10-19 07:00:00+07 |      24.8 |      6
 2026-10-19 08:00:00+07 | 2026-10-19 08:00:00+07 |      25.8 |      6
 2026-10-19 09:00:00+07 | 2026-10-19 09:00:00+07 |      26.6 |      6
 2026-10-19 10:00:00+07 | 2026-10-19 10:00:00+07 |      27.7 |      6
 2026-10-19 11:00:00+07 | 2026-10-19 11:00:00+07 |      28.5 |      6
(6 rows)
```

Kolom `jam` dan `jam_wib` sama persis. Seperti kata Konsep 3, untuk ember 15 menit dan 1 jam, zona waktu tidak berpengaruh karena WIB berselisih tepat 7 jam dengan UTC. Suhunya naik dari pagi ke siang, mengikuti pola harian data latihan.

#### 3.4 Ember 1 hari: di sinilah zona waktu penting

Ringkas **seluruh** data latihan per hari, mula-mula tanpa zona waktu:

```sql
SELECT time_bucket('1 day', ts) AS hari,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
GROUP BY hari
ORDER BY hari;
```

**Hasilnya** (tanggalnya mengikuti hari H-mu, dan baris terakhir mengikuti jam kamu mengisi data latihan):

```text
          hari          | suhu_rata | jumlah 
------------------------+-----------+--------
 2026-10-12 07:00:00+07 |      22.8 |     42
 2026-10-13 07:00:00+07 |      26.0 |    144
 2026-10-14 07:00:00+07 |      25.9 |    144
 2026-10-15 07:00:00+07 |      26.7 |    144
 2026-10-16 07:00:00+07 |      27.0 |    144
 2026-10-17 07:00:00+07 |      26.4 |    144
 2026-10-18 07:00:00+07 |      25.9 |    144
 2026-10-19 07:00:00+07 |      26.2 |    144
 2026-10-20 07:00:00+07 |      27.8 |     92
(9 rows)
```

Setiap "hari" dimulai **pukul 07.00 WIB** karena ember 1 hari mengikuti hari UTC. Baris pertama hanya berisi 42 bacaan: pukul 00.00–06.59 WIB pada hari pertama data latihan. Semua angka rata-ratanya bergeser. Sekarang dengan zona waktu, untuk tujuh hari penuh sebelum hari H:

```sql
SELECT time_bucket('1 day', ts, 'Asia/Jakarta') AS hari,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'f00d00000001'
  AND ts >= '2026-10-13 00:00:00+07' AND ts < '2026-10-20 00:00:00+07'
GROUP BY hari
ORDER BY hari;
```

**Hasilnya** (tanggalmu mengikuti hari H; angkanya sama):

```text
          hari          | suhu_rata | jumlah 
------------------------+-----------+--------
 2026-10-13 00:00:00+07 |      26.2 |    144
 2026-10-14 00:00:00+07 |      25.6 |    144
 2026-10-15 00:00:00+07 |      26.5 |    144
 2026-10-16 00:00:00+07 |      27.1 |    144
 2026-10-17 00:00:00+07 |      26.7 |    144
 2026-10-18 00:00:00+07 |      25.8 |    144
 2026-10-19 00:00:00+07 |      26.3 |    144
(7 rows)
```

Hari kini dimulai pukul **00.00 WIB**, dan setiap hari berisi tepat 144 bacaan. Angka rata-ratanya sama persis dengan tabel syarat lulus Modul 17 Praktik 4.5. Di sana kamu menulis `(ts AT TIME ZONE 'Asia/Jakarta')::date`; di sini `time_bucket('1 day', ts, 'Asia/Jakarta')`. Dua jalan, jawaban yang sama, tetapi `time_bucket` juga bisa dipakai untuk ember lain, seperti 6 jam atau 15 menit, dan fungsi itulah yang dipakai di buku ringkasan Praktik 5.

Kembalikan zona sesi sebelum lanjut:

```text
RESET TIME ZONE;
```

> ➡️ **Selesai Praktik 3?** Lanjut ke [Praktik 4](#praktik-4--satu-juta-baris-dan-ukur-kecepatannya-45-menit) tanpa kembali ke konsep.

### Praktik 4 — Satu juta baris dan ukur kecepatannya (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama di folder `backend`, terminal kedua dengan psql yang masih terbuka dari Praktik 3; kalau sudah tertutup, misalnya karena kamu melanjutkan di hari lain, masuk lagi dengan `docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`) dan **Docker Desktop**. Pastikan ada ruang disk kosong sekitar 1 GB (🧰).

Data latihan hanya berisi sekitar 2.300 bacaan, terlalu sedikit untuk merasakan beda kecepatan. Database sungguhan tumbuh jauh lebih cepat: Node 1 saja mengirim 8.640 bacaan sehari, jadi empat bulan berarti lebih dari sejuta baris. Di praktik ini kamu membuat data sebesar itu dengan satu file SQL, lalu mengukur dengan jujur: seberapa cepat kueri syarat lulus, apa yang terjadi di dalamnya, dan apakah tabel biasa sebenarnya lebih lambat.

#### 4.1 File data uji `beban-1-juta.sql`

Data uji ini dibuat langsung di dalam database dengan SQL, tidak lewat MQTT dan backend. Mengirim sejuta pesan MQTT terlalu lama untuk latihan, sedangkan SQL bisa membuatnya dalam hitungan detik. Di panel Explorer VS Code, buat folder baru **`uji`** di dalam folder `backend` (di samping `migrasi` dan `src`), lalu buat file **`beban-1-juta.sql`** di dalamnya:

```sql
-- beban-1-juta.sql - uji beban Modul 18: bacaan palsu setiap 10 detik selama 120 hari terakhir
-- untuk perangkat uji beef00000001, yaitu 120 x 8.640 + 1 = 1.036.801 bacaan ("sejuta baris").
-- Bacaan terakhir jatuh pada menit penuh terakhir, jadi detiknya selalu :00, :10, ..., :50.
-- Angkanya mengikuti pola harian (siang lebih panas dan terang, malam lebih lembap) ditambah sedikit "dadu".
-- Dadunya berbenih (setseed), jadi urutan angka acaknya sama di laptop siapa pun.
-- Cukup dijalankan sekali: kalau perangkat uji sudah punya bacaan, INSERT yang kedua dilewati.
-- Dijalankan dengan psql di dalam kontainer database (lihat README modul, Praktik 4).
\timing on

-- perangkat uji dulu supaya bacaannya lolos aturan kunci tamu (readings -> devices)
INSERT INTO devices (device_id, jenis, nama, lokasi)
VALUES ('beef00000001', 'node1', 'Uji beban', 'lab')
ON CONFLICT (device_id) DO NOTHING;

SELECT setseed(0.18);  -- benih dadu: urutan angka random() sesudah ini selalu sama

INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air)
SELECT 'beef00000001', ts, '1.4.0',
       round((27 + 4 * sin(pi() * (jam - 9) / 12) + random() - 0.5)::numeric, 1),  -- 22,5-31,5 derajat, terpanas pukul 15.00
       round(75 - 10 * sin(pi() * (jam - 9) / 12) + 4 * (random() - 0.5)),         -- 63-87 persen, kebalikan suhu
       round(greatest(0, 3400 * sin(pi() * (jam - 6) / 12)) + 60 * random()),      -- gelap di malam hari, paling terang pukul 12.00
       round(68 - 1.5 * mod(jam + 6, 12) + random()),                               -- disiram pukul 06.00 dan 18.00, lalu mengering
       random() < 0.1,                                                              -- sesekali ada yang lewat
       round(90 - 2 * jam)                                                          -- tandon penuh pukul 00.00, lalu surut
FROM (SELECT ts, extract(epoch FROM (ts AT TIME ZONE 'Asia/Jakarta')::time) / 3600 AS jam  -- jam WIB berkoma: 0 - 23,99
      FROM generate_series(date_trunc('minute', now()) - INTERVAL '120 days',  -- dari menit penuh 120 hari lalu
                           date_trunc('minute', now()),                       -- sampai menit penuh terakhir
                           INTERVAL '10 seconds') AS ts) AS waktu
WHERE NOT EXISTS (SELECT 1 FROM readings WHERE device_id = 'beef00000001');  -- sudah pernah dimuat? lewati

ANALYZE readings;  -- perbarui statistik supaya perencana kueri tahu ada sejuta baris baru

SELECT count(*) AS bacaan_uji FROM readings WHERE device_id = 'beef00000001';
```

| Bagian | Artinya |
| :--- | :--- |
| `\timing on` | Perintah psql (diawali garis miring terbalik), bukan SQL: tuliskan lama setiap perintah sebagai `Time: … ms`. |
| `INSERT INTO devices … ON CONFLICT (device_id) DO NOTHING` | Daftarkan dulu perangkat uji **`beef00000001`** ("Uji beban", lokasi `lab`). Tanpa baris ini, kunci tamu (Modul 17 Konsep 4) menolak bacaannya. `DO NOTHING` membuatnya aman dijalankan berulang kali. |
| `SELECT setseed(0.18)` | "Dadu berbenih". `random()` menghasilkan angka acak, tetapi sesudah `setseed` urutan angkanya selalu sama. Hasilnya, data ujimu hampir kembar dengan data uji di modul ini: banyaknya baris sama persis, dan rata-ratanya paling-paling berbeda di angka terakhir, kecuali rata-rata cahaya (bagian yang paling acak) yang bisa berbeda sedikit lebih jauh. |
| `generate_series(awal, akhir, INTERVAL '10 seconds')` | Membuat deretan waktu: satu baris setiap 10 detik, dari menit penuh 120 hari lalu sampai menit penuh terakhir. Hasilnya 120 × 8.640 + 1 = **1.036.801** stempel waktu. Anggap saja ini "perulangan" ala SQL. |
| Rumus `sin(…)` dan `random()` | Pola harian yang mirip sungguhan: siang panas dan terang, malam lebih lembap, tanah mengering lalu "disiram" pukul 06.00 dan 18.00 WIB, ditambah sedikit variasi acak. Rumusnya tidak perlu dihafal. |
| `WHERE NOT EXISTS (…)` | Penjaga: kalau perangkat uji sudah punya bacaan, `INSERT` dilewati. Datanya tidak pernah ganda walaupun file ini dijalankan dua kali. |
| `ANALYZE readings` | Perbarui statistik tabel supaya perencana kueri (Konsep 4) tahu ada sejuta baris baru dan memilih rencana yang tepat. |

#### 4.2 Muat sejuta baris

Di terminal pertama (folder `backend`), jalankan dua perintah ini satu per satu:

```text
docker cp uji/beban-1-juta.sql rumahpintar-db:/tmp/beban-1-juta.sql
docker exec rumahpintar-db psql -U postgres -d rumahpintar -f /tmp/beban-1-juta.sql
```

**Hasil perintah pertama** (angkanya bisa sedikit berbeda):

```text
Successfully copied 2.54kB (transferred 4.1kB) to rumahpintar-db:/tmp/beban-1-juta.sql
```

**`docker cp`** (*copy*) menyalin berkas dari laptop ke dalam kontainer, ke folder sementara `/tmp` milik Linux di dalam kontainer itu (Modul 17 Konsep 2). Perintah kedua menjalankan psql di dalam kontainer dengan **`-f`** (*file*): psql membaca perintah dari berkas itu, lalu keluar sendiri. Karena psql tidak perlu menunggu ketikanmu, kali ini `-it` tidak dipakai.

**Hasil perintah kedua** (tunggu sekitar setengah menit; di laptop yang lebih lambat bisa sampai dua menit):

```text
Timing is on.
INSERT 0 1
Time: 7.387 ms
 setseed 
---------
 
(1 row)

Time: 1.005 ms
INSERT 0 1036801
Time: 23446.421 ms (00:23.446)
ANALYZE
Time: 2075.508 ms (00:02.076)
 bacaan_uji 
------------
    1036801
(1 row)

Time: 164.406 ms
```

`INSERT 0 1` adalah baris perangkat uji di `devices`. `INSERT 0 1036801` adalah sejuta bacaannya, dibuat dalam 23 detik. Setiap bacaan langsung masuk ke *chunk* harinya: TimescaleDB membuatkan *chunk* baru untuk setiap hari yang belum punya. Kalau perintah kedua tidak sengaja kamu jalankan lagi, kedua `INSERT` menjawab `INSERT 0 0`: penjaga `WHERE NOT EXISTS` bekerja, dan tidak ada yang ganda.

#### 4.3 Lihat hasilnya

Di psql (terminal kedua), ketik satu per satu:

```sql
SELECT device_id, count(*), min(ts), max(ts) FROM readings GROUP BY device_id ORDER BY device_id;
SELECT count(*) FROM show_chunks('readings');
SELECT pg_size_pretty(hypertable_size('readings'));
```

**Hasilnya** (contoh; tanggal dan jamnya mengikuti saat kamu memuat data, dan perangkatmu sendiri, kalau ada, ikut muncul):

```text
  device_id   |  count  |          min           |          max           
--------------+---------+------------------------+------------------------
 beef00000001 | 1036801 | 2026-06-22 15:18:00+00 | 2026-10-20 15:18:00+00
 f00d00000001 |    1142 | 2026-10-12 17:00:00+00 | 2026-10-20 15:10:00+00
 f00d00000002 |    1142 | 2026-10-12 17:00:00+00 | 2026-10-20 15:10:00+00
(3 rows)

 count 
-------
   121
(1 row)

 pg_size_pretty 
----------------
 201 MB
(1 row)
```

- Perangkat uji punya **1.036.801** bacaan selama 120 hari. Jamnya ditulis dalam UTC (`+00`) karena zona sesi sudah dikembalikan di akhir Praktik 3.
- **`show_chunks('readings')`** mendaftar semua *chunk* hypertable itu. Ada **121**: satu untuk setiap hari dari 22 Juni sampai hari ini. *Chunk* hari-hari terakhir sama dengan yang dibuat di Praktik 2 untuk data latihan; bacaan uji untuk hari yang sama masuk ke jilid yang sama.
- **`hypertable_size`** menjumlahkan ukuran semua *chunk* beserta indeksnya dalam bita, dan **`pg_size_pretty`** menuliskannya dengan satuan yang mudah dibaca: **201 MB**. Satu hari penuh bacaan uji sekitar 1,7 MB, sesuai perkiraan di Konsep 2.

#### 4.4 ⭐ Syarat lulus: rata-rata per jam 7 hari terakhir

Inilah kueri syarat lulus modul ini: rata-rata suhu per jam selama tujuh hari terakhir untuk perangkat uji, dari sejuta baris. Nyalakan `\timing` supaya psql menuliskan lamanya:

```sql
\timing on
SELECT time_bucket('1 hour', ts) AS jam,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'beef00000001'
  AND ts >= now() - INTERVAL '7 days'
GROUP BY jam
ORDER BY jam;
```

Jawabannya 169 baris, lebih panjang daripada layar. Seperti di Modul 17, kalau psql berhenti dengan tulisan `--More--` di baris paling bawah, tekan **Spasi** untuk melanjutkan atau **q** untuk berhenti.

**Hasilnya** (dipotong di tengah; tanggal dan angka `Time`-mu akan berbeda):

```text
Timing is on.
          jam           | suhu_rata | jumlah 
------------------------+-----------+--------
 2026-10-13 15:00:00+00 |      25.3 |    238
 2026-10-13 16:00:00+00 |      24.6 |    360
 2026-10-13 17:00:00+00 |      23.8 |    360
 …
 2026-10-20 14:00:00+00 |      26.5 |    360
 2026-10-20 15:00:00+00 |      25.9 |    109
(169 rows)

Time: 41.735 ms
```

**41,7 milidetik**, yaitu 0,04 detik: jauh di bawah satu detik. **Syarat lulus pertama terpenuhi.** Ember di tengah berisi 360 bacaan (6 per menit × 60 menit). Ember pertama dan terakhir hanya terisi sebagian: "tujuh hari terakhir" dimulai di tengah jam, dan data uji berakhir pada menit kamu memuatnya.

Angka `Time` di laptopmu bisa lebih kecil atau lebih besar, dan sering lebih besar sesaat setelah data dimuat karena database masih sibuk menulis catatan perubahannya ke disk. Jalankan kuerinya dua atau tiga kali; yang penting tetap jauh di bawah 1.000 ms. Matikan lagi `\timing` sebelum lanjut supaya keluaran berikutnya sama dengan contoh:

```text
\timing off
```

#### 4.5 Intip rencananya dengan `EXPLAIN (ANALYZE)`

Mengapa secepat itu? Tanyakan rencananya (Konsep 4). Tulis `EXPLAIN (ANALYZE)` di depan kueri yang sama:

```sql
EXPLAIN (ANALYZE)
SELECT time_bucket('1 hour', ts) AS jam,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'beef00000001'
  AND ts >= now() - INTERVAL '7 days'
GROUP BY jam
ORDER BY jam;
```

**Hasilnya** (dipotong di tengah; nama *chunk* dan angkanya bisa berbeda):

```text
                                                                                      QUERY PLAN                                                                                       
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Finalize GroupAggregate  (cost=0.29..5442.60 rows=59972 width=48) (actual time=0.219..17.641 rows=169 loops=1)
   Group Key: (time_bucket('01:00:00'::interval, readings.ts))
   ->  Custom Scan (ChunkAppend) on readings  (cost=0.29..3802.21 rows=58793 width=48) (actual time=0.090..17.436 rows=169 loops=1)
         Order: time_bucket('01:00:00'::interval, readings.ts)
         Chunks excluded during startup: 0
         ->  Partial GroupAggregate  (cost=0.29..208.03 rows=3097 width=48) (actual time=0.089..0.935 rows=9 loops=1)
               Group Key: time_bucket('01:00:00'::interval, _hyper_1_2_chunk.ts)
               ->  Index Scan Backward using _hyper_1_2_chunk_readings_ts_idx on _hyper_1_2_chunk  (cost=0.29..145.94 rows=3118 width=16) (actual time=0.019..0.707 rows=3119 loops=1)
                     Index Cond: (ts >= (now() - '7 days'::interval))
                     Filter: (device_id = 'beef00000001'::text)
                     Rows Removed by Filter: 102
         ->  Partial GroupAggregate  (cost=0.29..541.17 rows=8391 width=48) (actual time=0.121..2.522 rows=24 loops=1)
               Group Key: time_bucket('01:00:00'::interval, _hyper_1_3_chunk.ts)
               ->  Index Scan Backward using _hyper_1_3_chunk_readings_ts_idx on _hyper_1_3_chunk  (cost=0.29..371.49 rows=8640 width=16) (actual time=0.019..1.870 rows=8640 loops=1)
                     Index Cond: (ts >= (now() - '7 days'::interval))
                     Filter: (device_id = 'beef00000001'::text)
                     Rows Removed by Filter: 288
   … (_hyper_1_4_chunk sampai _hyper_1_8_chunk, bentuknya sama) …
         ->  Partial GroupAggregate  (cost=0.29..347.13 rows=5350 width=48) (actual time=0.138..1.494 rows=16 loops=1)
               Group Key: time_bucket('01:00:00'::interval, _hyper_1_9_chunk.ts)
               ->  Index Scan Backward using _hyper_1_9_chunk_readings_ts_idx on _hyper_1_9_chunk  (cost=0.29..238.94 rows=5509 width=16) (actual time=0.041..1.144 rows=5509 loops=1)
                     Index Cond: (ts >= (now() - '7 days'::interval))
                     Filter: (device_id = 'beef00000001'::text)
                     Rows Removed by Filter: 184
 Planning Time: 1.083 ms
 Execution Time: 17.977 ms
(55 rows)
```

Barisnya memang panjang. Bacalah dari yang paling menjorok ke dalam, dan cari tiga hal dari Konsep 4:

1. **Jilid yang disentuh.** Hanya ada delapan *chunk*, `_hyper_1_2_chunk` sampai `_hyper_1_9_chunk`: enam hari penuh, ditambah sepotong hari di awal dan di akhir rentang. **113 *chunk* lainnya dipangkas** sebelum kueri berjalan dan tidak dibuka sama sekali. `Custom Scan (ChunkAppend)` adalah langkah khusus TimescaleDB yang menggabungkan hasil semua *chunk* itu, berurutan menurut waktu (`Order: …`).
2. **Indeks.** Di setiap *chunk*, `Index Scan Backward using …_readings_ts_idx` memakai indeks `ts DESC` dari Praktik 2. Hampir semua baris di jilid-jilid itu milik perangkat uji, jadi PostgreSQL memilih indeks waktu, lalu membuang sedikit bacaan perangkat lain: `Rows Removed by Filter: 288`, yaitu 2 perangkat latihan × 144 bacaan sehari. Tidak ada `Seq Scan`.
3. **Waktu.** `Execution Time: 17.977 ms`. Angka ini hanya mencakup lamanya database mengerjakan kueri itu. `Time` di 4.4 juga mencakup perencanaan dan pengiriman hasil ke psql, dan angkanya berbeda-beda setiap kali dijalankan, apalagi sesaat setelah data dimuat.

Satu hal lagi: setiap *chunk* diringkas sendiri dulu (`Partial GroupAggregate`, `rows=24` untuk satu hari penuh), lalu ringkasan-ringkasan kecil itu digabung (`Finalize GroupAggregate`). Karena *chunk* sudah dikunjungi menurut urutan waktu, database tidak perlu mengurutkan ulang puluhan ribu bacaan.

#### 4.6 Pembanding yang jujur: tabel biasa

Apakah semua kecepatan itu berkat hypertable? Cara jujur menjawabnya: buat salinan data uji di **tabel PostgreSQL biasa** dengan indeks yang sama, lalu ukur kueri yang sama. Masih di psql:

```sql
CREATE TABLE readings_biasa (LIKE readings INCLUDING ALL);
INSERT INTO readings_biasa SELECT * FROM readings WHERE device_id = 'beef00000001';
ANALYZE readings_biasa;
```

**Hasilnya** (perintah kedua butuh beberapa detik):

```text
CREATE TABLE
INSERT 0 1036801
ANALYZE
```

**`LIKE readings INCLUDING ALL`** berarti "buat tabel baru dengan kolom, nilai bawaan, kunci utama, dan indeks yang sama dengan `readings`". Hasilnya tabel biasa: `LIKE` hanya menyalin bentuk `readings`, dan hypertable baru terbentuk kalau kamu memintanya, misalnya dengan `create_hypertable` seperti di Praktik 2. Bandingkan ukurannya. Untuk tabel biasa, padanan `hypertable_size` adalah **`pg_total_relation_size`**, yaitu ukuran tabel beserta semua indeksnya:

```sql
SELECT pg_size_pretty(pg_total_relation_size('readings_biasa')) AS ukuran_biasa,
       pg_size_pretty(hypertable_size('readings')) AS ukuran_hypertable;
```

**Hasilnya:**

```text
 ukuran_biasa | ukuran_hypertable 
--------------+-------------------
 218 MB       | 201 MB
(1 row)
```

Hampir sama. Menjilid tidak membuat data lebih kecil; yang memadatkannya adalah columnstore di Praktik 6. Sekarang ukur kueri syarat lulus di tabel biasa (hanya nama tabelnya yang berubah):

```sql
EXPLAIN (ANALYZE)
SELECT time_bucket('1 hour', ts) AS jam,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       count(*) AS jumlah
FROM readings_biasa
WHERE device_id = 'beef00000001'
  AND ts >= now() - INTERVAL '7 days'
GROUP BY jam
ORDER BY jam;
```

**Hasilnya** (contoh):

```text
                                                                         QUERY PLAN                                                                          
-------------------------------------------------------------------------------------------------------------------------------------------------------------
 GroupAggregate  (cost=13862.39..15680.36 rows=60599 width=48) (actual time=19.522..26.086 rows=169 loops=1)
   Group Key: (time_bucket('01:00:00'::interval, ts))
   ->  Sort  (cost=13862.39..14013.89 rows=60599 width=16) (actual time=19.475..21.311 rows=60468 loops=1)
         Sort Key: (time_bucket('01:00:00'::interval, ts))
         Sort Method: quicksort  Memory: 3426kB
         ->  Index Scan using readings_biasa_pkey on readings_biasa  (cost=0.43..9048.71 rows=60599 width=16) (actual time=0.034..12.367 rows=60468 loops=1)
               Index Cond: ((device_id = 'beef00000001'::text) AND (ts >= (now() - '7 days'::interval)))
 Planning Time: 0.196 ms
 Execution Time: 26.360 ms
(9 rows)
```

Rencananya lebih pendek karena hanya ada satu tabel. Dari dalam ke luar: `Index Scan using readings_biasa_pkey` melompat lewat kunci utama `(device_id, ts)` langsung ke 60.468 bacaan tujuh hari terakhir, `Sort` mengurutkannya menurut jam, lalu `GroupAggregate` meringkasnya menjadi 169 baris. Waktunya **26 ms**.

Jalankan kedua `EXPLAIN` itu bergantian dua atau tiga kali. Di laptop lab, setelah database tenang, tabel biasa butuh 26–35 ms, sedangkan hypertable 18–22 ms. Tepat sesudah data dimuat, keduanya sempat 32–57 ms. Kesimpulannya, seperti yang sudah diakui di Konsep 4: **untuk kueri ini, indekslah yang paling menentukan.** Keduanya jauh di bawah satu detik, dan hypertable hanya sedikit lebih cepat karena tidak perlu mengurutkan ulang. Keunggulan hypertable yang sesungguhnya ada di praktik-praktik berikutnya: buku ringkasan yang menjawab dalam kurang dari 1 ms (Praktik 5), serta membuang dan memadatkan data lama (Praktik 6). Satu di antaranya bisa kamu rasakan sekarang juga.

#### 4.7 Membuang data lama dari tabel biasa

Misalkan aturannya "simpan bacaan mentah 90 hari saja". Di tabel biasa, satu-satunya cara adalah `DELETE`:

```sql
\timing on
DELETE FROM readings_biasa WHERE ts < now() - INTERVAL '90 days';
\timing off
SELECT pg_size_pretty(pg_total_relation_size('readings_biasa')) AS ukuran_sesudah_delete;
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'readings_biasa';
```

**Hasilnya:**

```text
Timing is on.
DELETE 259214
Time: 270.028 ms
Timing is off.
 ukuran_sesudah_delete 
-----------------------
 218 MB
(1 row)

 n_live_tup | n_dead_tup 
------------+------------
     777587 |     259214
(1 row)
```

Sebanyak 259.214 bacaan (30 hari tertua) terhapus, tetapi **ukurannya tetap 218 MB**. `DELETE` tidak menyobek halaman; ia hanya menandai baris sebagai "mati" (*dead tuples*, kolom `n_dead_tup`). Ruangnya baru bisa dipakai ulang setelah *autovacuum* (petugas kebersihan PostgreSQL) lewat, dan bahkan sesudah itu berkas tabelnya tidak menyusut. Di tabel yang sibuk, `DELETE` sebesar ini juga menulis catatan perubahan yang banyak dan bersaing dengan `INSERT` dari backend.

Bandingkan nanti dengan Praktik 6: kebijakan retensi membuang tiga puluh *chunk* tertua dari hypertable dalam kurang dari 0,2 detik, dan `hypertable_size` langsung turun dari 201 MB menjadi 152 MB. Retensi bekerja seperti `DROP TABLE` kecil untuk setiap jilid lama. Rasakan sendiri bedanya pada tabel pembanding, yang sudah selesai tugasnya:

```sql
DROP TABLE readings_biasa;
```

**Hasilnya:** `DROP TABLE`. Seluruh 218 MB langsung kembali dalam hitungan milidetik karena berkas tabelnya dihapus utuh.

#### 4.8 Simpan ke cabang

Keluar dari psql dengan `\q`. Di terminal pertama (folder `backend`):

```text
git add uji/beban-1-juta.sql
git commit -m "data uji 1 juta baris (Modul 18 Praktik 4)"
git push
```

Data uji tidak disimpan di Git, hanya resepnya. Siapa pun yang menjalankan file ini akan mendapat sejuta bacaan yang hampir kembar dengan milikmu: banyaknya sama persis, dan rata-ratanya paling-paling berbeda di angka terakhir, kecuali cahaya yang bisa berbeda sedikit lebih jauh.

> [!TIP]
> **Tidak jalan?**
>
> - `docker cp` menjawab `GetFileAttributesEx …\uji: The system cannot find the file specified.` (di macOS, pesannya berakhir dengan `no such file or directory`) → terminal tidak berada di folder `backend`, atau folder `uji` belum dibuat di dalam `backend`. Periksa dengan `ls uji`.
> - `psql: error: C:/Users/<nama>/AppData/Local/Temp/beban-1-juta.sql: No such file or directory` → kamu memakai **Git Bash**, yang diam-diam mengubah `/tmp/…` menjadi folder Temp Windows. Pakai terminal PowerShell (bawaan VS Code di Windows), atau tulis dua garis miring: `-f //tmp/beban-1-juta.sql`.
> - `psql: error: /tmp/beban-1-juta.sql: No such file or directory` → perintah `docker cp` belum dijalankan atau gagal. Ulangi perintah pertama.
> - Kedua `INSERT` menjawab `INSERT 0 0` → data uji sudah pernah dimuat. Ini bukan galat; lanjutkan ke 4.3.
> - `ERROR:  relation "readings_biasa" already exists` → kamu mengulang 4.6. Jalankan `DROP TABLE readings_biasa;`, lalu ulangi 4.6 dari awal.
> - Rencana tabel biasa memuat `Seq Scan on readings_biasa` → tabelnya dibuat tanpa `INCLUDING ALL`, jadi tidak punya indeks. Buang tabelnya, lalu buat ulang persis seperti di 4.6.
> - Angka `Time` atau `Execution Time` jauh lebih besar, misalnya ratusan milidetik → tunggu satu atau dua menit sesudah memuat data, lalu ulangi. Kalau tetap lambat, tutup dulu aplikasi berat lain karena database berbagi memori dengan seluruh laptop.

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 5](#5-continuous-aggregate-buku-ringkasan-yang-ditulis-petugas-otomatis) (➡️ di akhir Konsep 6 akan mengantarmu ke Praktik 5).

### Praktik 5 — Ringkasan per jam yang otomatis (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama di folder `backend` untuk `npm run migrasi`, terminal kedua untuk psql) dan **Docker Desktop**.

Di Praktik 4, kueri per jam tujuh hari membaca sekitar 60 ribu bacaan mentah setiap kali dijalankan. Di praktik ini kamu membuat **buku ringkasan** `readings_per_jam` (Konsep 5) dan menugasi petugasnya (Konsep 6), lalu mengukur bedanya.

#### 5.1 Migrasi `003_ringkasan_per_jam.sql`

Di folder `backend/migrasi`, buat file baru **`003_ringkasan_per_jam.sql`**:

```sql
-- 003_ringkasan_per_jam.sql - "buku ringkasan" per jam dari readings: continuous aggregate (Modul 18).
-- Petugas TimescaleDB menulis ringkasannya sendiri. Jam sesudah jam terakhir yang sudah diringkas dihitung langsung
-- dari readings (materialized_only = false), jadi jam yang sedang berjalan pun ikut tampil.
-- WITH NO DATA wajib: migrasi berjalan di dalam transaksi (BEGIN ... COMMIT), sedangkan mengisi ringkasan tidak boleh.
-- Riwayat yang sudah ada diringkas sekali lewat psql: CALL refresh_continuous_aggregate(...).
--
-- Setiap besaran punya rata-rata (_rata) dan banyaknya nilai yang terisi (_n; nilai NULL tidak ikut dihitung).
-- Dari keduanya, rata-rata harian selalu tepat: jumlahkan (rata x n) semua jam, lalu bagi dengan jumlah n semua jam.
CREATE MATERIALIZED VIEW readings_per_jam
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 hour', ts) AS jam,
       device_id,
       avg(suhu)         AS suhu_rata,
       min(suhu)         AS suhu_min,
       max(suhu)         AS suhu_maks,
       count(suhu)       AS suhu_n,
       avg(kelembapan)   AS kelembapan_rata,
       count(kelembapan) AS kelembapan_n,
       avg(tanah)        AS tanah_rata,
       min(tanah)        AS tanah_min,      -- tanah paling kering dalam jam itu
       count(tanah)      AS tanah_n,
       avg(cahaya)       AS cahaya_rata,
       count(cahaya)     AS cahaya_n,
       count(*)          AS jumlah_bacaan   -- semua bacaan dalam jam itu, termasuk yang sebagian kolomnya NULL
FROM readings
GROUP BY jam, device_id
WITH NO DATA;

-- Jadwal petugas: setiap 30 menit, ringkas ulang 3 hari terakhir, kecuali 1 jam terakhir yang masih terus bertambah.
SELECT add_continuous_aggregate_policy('readings_per_jam',
  start_offset      => INTERVAL '3 days',
  end_offset        => INTERVAL '1 hour',
  schedule_interval => INTERVAL '30 minutes');
```

Isinya dua bagian. Bagian pertama, `CREATE MATERIALIZED VIEW … WITH NO DATA`, membuat buku ringkasannya, kosong dulu (Konsep 5). Setiap besaran (suhu, kelembapan, tanah, cahaya) punya dua kolom: rata-ratanya (`_rata`) dan banyaknya nilai yang terisi (`_n`). Untuk suhu ada juga nilai terendah dan tertingginya, dan untuk tanah ada nilai paling keringnya (`tanah_min`). Bagian kedua, `add_continuous_aggregate_policy`, memasang jadwal petugasnya (Konsep 6):

| Pengaturan | Nilai | Artinya |
| :--- | :--- | :--- |
| `schedule_interval` | 30 menit | Petugas bekerja setiap setengah jam. |
| `start_offset` | 3 hari | Setiap kali bekerja, ia meringkas ulang tiga hari ke belakang. Bacaan yang datang terlambat, misalnya dari perangkat yang semalaman putus WiFi, ikut tertangkap. |
| `end_offset` | 1 jam | Satu jam terakhir tidak diringkas karena isinya masih terus bertambah. Jam-jam itu tetap tampil di buku ringkasan berkat `materialized_only = false`: TimescaleDB menghitungnya langsung dari data mentah saat ditanya. |

#### 5.2 Jalankan migrasinya

Di terminal pertama (folder `backend`):

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.2.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 003_ringkasan_per_jam.sql
1 migrasi baru diterapkan, 2 sudah ada sebelumnya.
```

#### 5.3 Petugasnya langsung bekerja, tetapi hanya tiga hari

Di terminal kedua, masuk lagi ke psql (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`), lalu tanyakan isi buku ringkasan per perangkat:

```sql
SELECT device_id, count(*), min(jam), max(jam) FROM readings_per_jam GROUP BY device_id ORDER BY device_id;
```

**Hasilnya** (contoh; tanggalnya mengikuti hari ini):

```text
  device_id   | count |          min           |          max           
--------------+-------+------------------------+------------------------
 beef00000001 |    72 | 2026-10-17 16:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000001 |    72 | 2026-10-17 16:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000002 |    72 | 2026-10-17 16:00:00+00 | 2026-10-20 15:00:00+00
(3 rows)
```

Buku ringkasan yang dibuat `WITH NO DATA` ternyata sudah berisi! Seperti kata Konsep 6, kebijakannya langsung bekerja begitu dipasang: *job* petugas berjalan beberapa detik sesudah migrasi. Namun, lihat kolom `min`: isinya hanya **72 jam** terakhir, padahal data uji mencakup 120 hari. Petugas hanya meringkas jendelanya sendiri, yaitu tiga hari ke belakang, dan bagian *real-time* hanya melengkapi jam-jam **sesudah** jam terakhir yang sudah diringkas. Riwayat yang lebih tua belum tersentuh sama sekali.

Kalau data ujimu dimuat satu sampai tiga hari sebelum langkah ini, angkamu lebih kecil lagi, dan perangkat latihan bisa tidak muncul sama sekali karena jendela tiga hari itu tidak lagi menjangkau hari H. Kalau dalam tiga hari terakhir tidak ada satu bacaan pun dari perangkat mana pun, yang terjadi justru sebaliknya: petugas tidak menemukan apa pun untuk diringkas, jadi bagian *real-time* menghitung **seluruh** riwayat langsung dari data mentah, dan angkamu tampak sudah lengkap seperti sesudah 5.4 (misalnya 2.881 baris untuk perangkat uji), padahal belum satu baris pun tersimpan. Apa pun yang kamu lihat, langkah 5.4 tetap wajib: hanya langkah itu yang menyimpan ringkasan riwayat lama, dan ringkasan yang tidak tersimpan ikut hilang begitu retensi di Praktik 6 membuang data mentahnya.

#### 5.4 ⭐ Ringkas seluruh riwayat, sekali saja

Riwayat lama diringkas sekali dengan tangan:

```sql
\timing on
CALL refresh_continuous_aggregate('readings_per_jam', NULL, now() - INTERVAL '1 hour');
\timing off
```

**Hasilnya** (angka `Time`-mu akan berbeda):

```text
Timing is on.
CALL
Time: 2861.693 ms (00:02.862)
Timing is off.
```

- **`CALL`** dipakai untuk menjalankan **prosedur** (*procedure*), saudara fungsi yang tidak mengembalikan nilai. Karena itu, jawabannya hanya `CALL`.
- **`NULL`** sebagai awal jendela berarti "dari data paling tua", dan **`now() - INTERVAL '1 hour'`** sebagai akhirnya berarti "sampai satu jam lalu", sama dengan `end_offset` petugas.
- Perintah ini **tidak boleh berjalan di dalam transaksi**. Itulah sebabnya ia tidak ditulis di file migrasi: pelari migrasi membungkus setiap file dengan `BEGIN … COMMIT`.
- Cukup dijalankan **sekali**, dan harus **sebelum** retensi dipasang di Praktik 6. Konsep 7 menjelaskan bahaya menjalankannya lagi sesudah retensi bekerja.

Hitung lagi isinya, sekaligus ukurannya:

```sql
SELECT device_id, count(*), min(jam), max(jam) FROM readings_per_jam GROUP BY device_id ORDER BY device_id;
SELECT pg_size_pretty(hypertable_size('readings_per_jam'));
```

**Hasilnya** (contoh):

```text
  device_id   | count |          min           |          max           
--------------+-------+------------------------+------------------------
 beef00000001 |  2881 | 2026-06-22 15:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000001 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000002 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
(3 rows)

 pg_size_pretty 
----------------
 1616 kB
(1 row)
```

Seluruh 120 hari kini terangkum: 2.881 baris ringkasan untuk perangkat uji, satu per jam. Sejuta bacaan mentah sebesar 201 MB kini punya buku ringkasan sebesar **1,6 MB**, kurang dari seperseratus tebalnya. Buku ringkasan juga disimpan sebagai hypertable, jadi `hypertable_size` bisa mengukurnya.

#### 5.5 Baca buku ringkasannya

Buku ringkasan ditanya seperti tabel biasa. Coba jam-jam yang sama dengan Praktik 3.3 (**ganti `2026-10-19` dengan tanggal H-1**, seperti di Praktik 3):

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT jam, round(suhu_rata::numeric, 1) AS suhu_rata, suhu_min, suhu_maks,
       round(kelembapan_rata, 1) AS kelembapan_rata, round(tanah_rata, 1) AS tanah_rata, tanah_min, jumlah_bacaan
FROM readings_per_jam
WHERE device_id = 'f00d00000001'
  AND jam >= '2026-10-19 06:00:00+07' AND jam < '2026-10-19 12:00:00+07'
ORDER BY jam;
```

**Hasilnya:**

```text
          jam           | suhu_rata | suhu_min | suhu_maks | kelembapan_rata | tanah_rata | tanah_min | jumlah_bacaan 
------------------------+-----------+----------+-----------+-----------------+------------+-----------+---------------
 2026-10-19 06:00:00+07 |      23.8 |     23.4 |      24.2 |            79.0 |       67.5 |        67 |             6
 2026-10-19 07:00:00+07 |      24.8 |     24.1 |      25.4 |            75.3 |       66.2 |        65 |             6
 2026-10-19 08:00:00+07 |      25.8 |     25.5 |      26.3 |            73.0 |       64.2 |        63 |             6
 2026-10-19 09:00:00+07 |      26.6 |     25.9 |      27.4 |            70.7 |       61.8 |        61 |             6
 2026-10-19 10:00:00+07 |      27.7 |     27.2 |      28.6 |            69.5 |       59.3 |        58 |             6
 2026-10-19 11:00:00+07 |      28.5 |     28.1 |      29.3 |            67.8 |       56.5 |        55 |             6
(6 rows)
```

Kolom `suhu_rata` sama persis dengan hasil `time_bucket` di Praktik 3.3, tetapi kali ini tidak ada satu bacaan mentah pun yang dihitung ulang: angkanya dibaca dari ringkasan yang sudah tersimpan. `round(…, 1)` tetap perlu karena rata-rata disimpan dengan banyak angka di belakang koma. Tanpa `round`, suhu 23,1 bisa tampil sebagai `23.099999999999998`, sifat bawaan tipe `double precision`.

Sekarang lihat jam-jam terbaru:

```sql
SELECT jam, device_id, round(suhu_rata::numeric, 1) AS suhu_rata, jumlah_bacaan
FROM readings_per_jam
ORDER BY jam DESC, device_id
LIMIT 4;
RESET TIME ZONE;
```

**Hasilnya** (contoh, dijalankan beberapa menit setelah data uji dimuat):

```text
          jam           |  device_id   | suhu_rata | jumlah_bacaan 
------------------------+--------------+-----------+---------------
 2026-10-20 22:00:00+07 | beef00000001 |      25.9 |           109
 2026-10-20 22:00:00+07 | f00d00000001 |      25.0 |             2
 2026-10-20 22:00:00+07 | f00d00000002 |      26.5 |             2
 2026-10-20 21:00:00+07 | beef00000001 |      26.5 |           360
(4 rows)
```

Dalam contoh ini, baris teratas (pukul 22.00) adalah jam yang sedang berjalan. Jam itu belum diringkas petugas (`end_offset` 1 jam), tetapi tetap muncul, lengkap dengan jumlah bacaannya sejauh ini. Inilah ringkasan *real-time*: bagian yang belum tersimpan dihitung langsung dari `readings` saat kamu bertanya. Kalau data ujimu dimuat beberapa jam sebelumnya dan tidak ada perangkat yang sedang mengirim, baris teratasmu adalah jam terakhir data uji, yang sudah diringkas. Di Praktik 8, bacaan baru dari Node 1 atau simulator akan muncul di sini dengan cara yang sama.

#### 5.6 Ukur: buku ringkasan lawan data mentah

Ulangi pengukuran Praktik 4, kali ini dari buku ringkasan:

```sql
EXPLAIN (ANALYZE)
SELECT jam, round(suhu_rata::numeric, 1) AS suhu_rata, jumlah_bacaan
FROM readings_per_jam
WHERE device_id = 'beef00000001'
  AND jam >= now() - INTERVAL '7 days'
ORDER BY jam;
```

**Hasilnya** (contoh):

```text
                                                                                                           QUERY PLAN                                                                                                            
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Result  (cost=0.15..71.90 rows=334 width=48) (actual time=0.032..0.632 rows=168 loops=1)
   ->  Append  (cost=0.15..66.89 rows=334 width=24) (actual time=0.023..0.529 rows=168 loops=1)
         ->  Subquery Scan on "*SELECT* 1"  (cost=0.15..23.60 rows=178 width=24) (actual time=0.022..0.138 rows=166 loops=1)
               ->  Result  (cost=0.15..21.82 rows=178 width=204) (actual time=0.021..0.127 rows=166 loops=1)
                     ->  Custom Scan (ChunkAppend) on _materialized_hypertable_2  (cost=0.15..20.04 rows=178 width=24) (actual time=0.020..0.111 rows=166 loops=1)
                           Order: _materialized_hypertable_2.jam
                           Chunks excluded during startup: 0
                           ->  Index Scan Backward using _hyper_2_123_chunk__materialized_hypertable_2_jam_idx on _hyper_2_123_chunk  (cost=0.15..3.05 rows=20 width=24) (actual time=0.019..0.025 rows=8 loops=1)
                                 Index Cond: ((jam < '2026-10-20 14:00:00+00'::timestamp with time zone) AND (jam >= (now() - '7 days'::interval)))
                                 Filter: (device_id = 'beef00000001'::text)
                                 Rows Removed by Filter: 16
                           ->  Index Scan Backward using _hyper_2_122_chunk__materialized_hypertable_2_device_id_jam_idx on _hyper_2_122_chunk  (cost=0.28..16.99 rows=158 width=24) (actual time=0.027..0.076 rows=158 loops=1)
                                 Index Cond: ((device_id = 'beef00000001'::text) AND (jam < '2026-10-20 14:00:00+00'::timestamp with time zone) AND (jam >= (now() - '7 days'::interval)))
         ->  Subquery Scan on "*SELECT* 2"  (cost=0.28..41.62 rows=156 width=24) (actual time=0.280..0.378 rows=2 loops=1)
               ->  GroupAggregate  (cost=0.28..40.06 rows=156 width=185) (actual time=0.279..0.377 rows=2 loops=1)
                     Group Key: (time_bucket('01:00:00'::interval, readings.ts))
                     ->  Result  (cost=0.28..36.55 rows=156 width=29) (actual time=0.020..0.327 rows=469 loops=1)
                           ->  Custom Scan (ChunkAppend) on readings  (cost=0.28..34.60 rows=156 width=29) (actual time=0.020..0.279 rows=469 loops=1)
                                 Order: time_bucket('01:00:00'::interval, readings.ts)
                                 Chunks excluded during startup: 0
                                 ->  Index Scan Backward using _hyper_1_9_chunk_readings_ts_idx on _hyper_1_9_chunk  (cost=0.28..34.60 rows=156 width=29) (actual time=0.020..0.252 rows=469 loops=1)
                                       Index Cond: (ts >= '2026-10-20 14:00:00+00'::timestamp with time zone)
                                       Filter: ((device_id = 'beef00000001'::text) AND (time_bucket('01:00:00'::interval, ts) >= (now() - '7 days'::interval)))
                                       Rows Removed by Filter: 16
 Planning Time: 1.376 ms
 Execution Time: 0.845 ms
(26 rows)
```

Rencana ini memperlihatkan isi "buku ringkasan" dengan jelas. `Append` menggabungkan dua bagian:

1. **`*SELECT* 1`**: 166 baris dibaca dari ringkasan yang sudah tersimpan. TimescaleDB menyimpannya di hypertable tersembunyi bernama `_materialized_hypertable_2`, sampai batas `jam < '2026-10-20 14:00:00+00'`: ember pukul 13.00–14.00 UTC adalah jam terakhir yang sudah diringkas petugas.
2. **`*SELECT* 2`**: bagian *real-time*. Di contoh ini, 469 bacaan mentah sejak batas itu diringkas saat itu juga menjadi dua baris. Kalau tidak ada bacaan baru sesudah batas itu, bagian ini tidak menghasilkan baris apa pun.

Hasilnya 168 baris dalam **0,85 milidetik**. Bandingkan dengan Praktik 4:

| Sumber | `Execution Time` di laptop lab |
| :--- | :--- |
| Tabel biasa `readings_biasa` | 26–35 ms |
| Hypertable `readings` | 18–22 ms |
| Buku ringkasan `readings_per_jam` | **0,85–0,91 ms** |

Sekitar dua puluh kali lebih cepat daripada hypertable karena yang dibaca hanya 168 baris ringkasan, bukan 60 ribu bacaan mentah. Selisihnya makin besar untuk rentang yang lebih panjang: sebulan atau setahun tetap hanya beberapa ribu baris ringkasan. (Hasilnya 168 baris, bukan 169 seperti di Praktik 4, karena di sini syarat `jam >= now() - INTERVAL '7 days'` diuji pada **awal** setiap jam sehingga jam pertama yang hanya terisi sebagian tidak ikut.)

#### 5.7 Berkenalan dengan petugasnya

Lihat daftar semua *job* di database ini:

```sql
SELECT job_id, application_name, schedule_interval, proc_name, hypertable_name
FROM timescaledb_information.jobs
ORDER BY job_id;
```

**Hasilnya:**

```text
 job_id |              application_name              | schedule_interval |              proc_name              | hypertable_name  
--------+--------------------------------------------+-------------------+-------------------------------------+------------------
      1 | Telemetry Reporter [1]                     | 24:00:00          | policy_telemetry                    | 
      3 | Job History Log Retention Policy [3]       | 06:00:00          | policy_job_stat_history_retention   | 
   1000 | Refresh Continuous Aggregate Policy [1000] | 00:30:00          | policy_refresh_continuous_aggregate | readings_per_jam
(3 rows)
```

*Job* **1000** adalah petugas buku ringkasanmu, dijadwalkan setiap 30 menit. Dua *job* di bawah 1000 milik TimescaleDB sendiri: pelapor telemetri (yang tidak mengirim apa pun karena `TIMESCALEDB_TELEMETRY=off` dari Modul 17) dan pembersih riwayat *job*. Biarkan saja keduanya.

Kalau tidak sabar menunggu jadwal, jalankan petugasnya sekarang, lalu lihat riwayat kerjanya:

```sql
CALL run_job(1000);
SELECT job_id, last_run_started_at, last_run_status, next_start, total_runs
FROM timescaledb_information.job_stats WHERE job_id = 1000;
```

**Hasilnya** (contoh; jamnya mengikuti saat migrasimu):

```text
CALL
 job_id |      last_run_started_at      | last_run_status |          next_start           | total_runs 
--------+-------------------------------+-----------------+-------------------------------+------------
   1000 | 2026-10-20 15:21:15.328919+00 | Success         | 2026-10-20 15:51:15.417701+00 |          1
(1 row)
```

`CALL run_job(1000)` barusan tidak menambah `total_runs` (di contoh ini tetap **1**) dan tidak mengubah `last_run_started_at`. Itu bukan salah ketik: `run_job` menjalankan *job* di sesi psql-mu sendiri, sedangkan `job_stats` hanya mencatat pekerjaan yang dijalankan penjadwal latar. Di contoh ini, yang tercatat adalah kerja pertama petugas, beberapa detik sesudah `npm run migrasi`, dan `next_start` memperlihatkan jadwal berikutnya: 30 menit kemudian. Kalau kamu sampai di langkah ini lebih dari 30 menit sesudah migrasi, `total_runs`-mu sudah 2 atau lebih dan `last_run_started_at` menunjuk kerja terjadwal terakhir. Itu kerja penjadwal, bukan `run_job`-mu.

#### 5.8 Rata-rata harian yang tepat dari buku ringkasan

Buku ringkasan per jam juga bisa menjawab pertanyaan harian. Kuncinya rumus dari Konsep 5: jumlahkan `rata × n` setiap jam, lalu bagi dengan jumlah `n`. Kedua kueri di langkah ini memakai data uji, jadi patokannya adalah **hari kamu memuat data uji** di Praktik 4.2. Hari itu belum tentu hari ini, misalnya kalau kamu menyambung praktik ini di hari lain atau sesudah pukul 00.00. Lupa tanggalnya? `SELECT max(ts) AT TIME ZONE 'Asia/Jakarta' FROM readings WHERE device_id = 'beef00000001';` menunjukkan saat kamu memuatnya, dalam WIB. Ganti `2026-10-17` dengan tanggal **tiga hari sebelum hari pemuatan itu**:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT time_bucket('1 day', jam, 'Asia/Jakarta') AS hari,
       round((sum(suhu_rata * suhu_n) / sum(suhu_n))::numeric, 1) AS suhu_rata,
       round(sum(kelembapan_rata * kelembapan_n) / sum(kelembapan_n), 1) AS kelembapan_rata,
       round(sum(cahaya_rata * cahaya_n) / sum(cahaya_n), 1) AS cahaya_rata,
       sum(jumlah_bacaan) AS jumlah
FROM readings_per_jam
WHERE device_id = 'beef00000001' AND jam >= '2026-10-17 00:00:00+07'
GROUP BY hari ORDER BY hari;
```

**Hasilnya** (contoh; baris terakhir adalah hari pemuatan data uji, dan isinya mengikuti jam kamu memuatnya):

```text
          hari          | suhu_rata | kelembapan_rata | cahaya_rata | jumlah 
------------------------+-----------+-----------------+-------------+--------
 2026-10-17 00:00:00+07 |      27.0 |            75.0 |      1112.3 |   8640
 2026-10-18 00:00:00+07 |      27.0 |            75.0 |      1112.5 |   8640
 2026-10-19 00:00:00+07 |      27.0 |            75.0 |      1112.0 |   8640
 2026-10-20 00:00:00+07 |      27.2 |            74.6 |      1194.4 |   8029
(4 rows)
```

`time_bucket('1 day', jam, 'Asia/Jakarta')` mengelompokkan 24 baris per jam menjadi satu hari WIB, seperti di Praktik 3.4. Hari-hari penuh berisi 8.640 bacaan. Hari terakhir, hari pemuatan data uji, baru terisi sebagian, sampai menit kamu memuatnya.

Apakah rumus `rata × n` benar-benar perlu? Buktikan sendiri pada hari pemuatan data uji, yang isi jam-jamnya tidak sama banyak. Kueri berikut menghitung rata-rata hari itu dengan tiga cara: dari data mentah, dari ringkasan dengan rumus `rata × n`, dan dari ringkasan dengan "rata-rata dari rata-rata". **`UNION ALL`** menumpuk hasil beberapa `SELECT` menjadi satu tabel. Ganti `2026-10-20` dan `2026-10-21` dengan tanggal **pemuatan data uji** dan **sehari sesudahnya** (kalau kamu memuatnya hari ini, tanggal hari ini dan besok):

```sql
SELECT 'mentah' AS dari, round(avg(suhu)::numeric, 1) AS suhu, round(avg(kelembapan), 1) AS kelembapan,
       round(avg(tanah), 1) AS tanah, round(avg(cahaya), 1) AS cahaya, count(*) AS n
FROM readings WHERE device_id = 'beef00000001' AND ts >= '2026-10-20 00:00:00+07' AND ts < '2026-10-21 00:00:00+07'
UNION ALL
SELECT 'ringkasan', round((sum(suhu_rata * suhu_n) / sum(suhu_n))::numeric, 1),
       round(sum(kelembapan_rata * kelembapan_n) / sum(kelembapan_n), 1),
       round(sum(tanah_rata * tanah_n) / sum(tanah_n), 1),
       round(sum(cahaya_rata * cahaya_n) / sum(cahaya_n), 1), sum(jumlah_bacaan)
FROM readings_per_jam WHERE device_id = 'beef00000001' AND jam >= '2026-10-20 00:00:00+07' AND jam < '2026-10-21 00:00:00+07'
UNION ALL
SELECT 'rata-rata dari rata-rata', round(avg(suhu_rata)::numeric, 1), round(avg(kelembapan_rata), 1),
       round(avg(tanah_rata), 1), round(avg(cahaya_rata), 1), sum(jumlah_bacaan)
FROM readings_per_jam WHERE device_id = 'beef00000001' AND jam >= '2026-10-20 00:00:00+07' AND jam < '2026-10-21 00:00:00+07';
RESET TIME ZONE;
```

**Hasilnya** (contoh):

```text
           dari           | suhu | kelembapan | tanah | cahaya |  n   
--------------------------+------+------------+-------+--------+------
 mentah                   | 27.2 |       74.6 |  59.4 | 1194.4 | 8029
 ringkasan                | 27.2 |       74.6 |  59.4 | 1194.4 | 8029
 rata-rata dari rata-rata | 27.1 |       74.7 |  59.5 | 1159.1 | 8029
(3 rows)
```

Baris `ringkasan` sama persis dengan `mentah`. Baris `rata-rata dari rata-rata` meleset, paling jauh di cahaya: 1.159,1 padahal seharusnya 1.194,4. Penyebabnya jam terakhir hari itu, yang baru terisi sebagian. Di contoh ini jam itu pukul 22.00, malam yang gelap, dengan 109 bacaan. Rata-rata biasa memberinya bobot yang sama dengan jam-jam penuh berisi 360 bacaan sehingga cahayanya terseret turun. (Kalau kamu memuat data uji siang hari, jam terakhirmu terang, dan selisihnya bisa berbalik arah.) Rumus `rata × n` memberi setiap jam bobot sesuai banyaknya bacaan sehingga hasilnya tepat. Rumus inilah yang dipakai backend v0.3 untuk `bucket=1d` di Praktik 8. Di laptop lab, cara ini diuji pada semua 137 pasangan "hari × perangkat" yang ada, termasuk hari-hari yang terisi sebagian, dan hasilnya selalu sama persis dengan data mentah.

#### 5.9 Simpan ke cabang

Keluar dari psql dengan `\q`. Di terminal pertama (folder `backend`):

```text
git add migrasi/003_ringkasan_per_jam.sql
git commit -m "ringkasan per jam otomatis (Modul 18 Praktik 5)"
git push
```

Perintah `CALL refresh_continuous_aggregate(…)` tidak masuk Git karena hanya dijalankan sekali di database ini. README backend v0.3 (➕ A) mencatatnya sebagai langkah setelah migrasi supaya tidak terlupa saat database dipasang ulang.

> [!TIP]
> **Tidak jalan?**
>
> - `npm run migrasi` menjawab `GAGAL di 003_ringkasan_per_jam.sql: CREATE MATERIALIZED VIEW ... WITH DATA cannot run inside a transaction block` → baris `WITH NO DATA;` di akhir `CREATE MATERIALIZED VIEW` terlewat. Tambahkan, simpan, lalu jalankan lagi `npm run migrasi`. Migrasi yang gagal tidak tercatat, jadi aman diulang.
> - `GAGAL di 003_ringkasan_per_jam.sql: refresh_continuous_aggregate() cannot run inside a transaction block` → kamu menaruh `CALL refresh_continuous_aggregate(…)` di file migrasi. Hapus baris itu dari file, jalankan `npm run migrasi` lagi, lalu jalankan `CALL`-nya di psql seperti di 5.4.
> - `ERROR:  relation "readings_per_jam" does not exist` → migrasi 003 belum berhasil. Periksa jawaban `npm run migrasi` di terminal pertama.
> - `NOTICE:  continuous aggregate "readings_per_jam" is already up-to-date` → `CALL` di 5.4 sudah pernah dijalankan, dan tidak ada lagi yang perlu diringkas. Ini bukan galat.
> - Di 5.4, perangkat uji masih hanya punya 72 baris → `CALL`-nya belum dijalankan atau gagal. Ulangi 5.4.
> - Angka di 5.8 sedikit berbeda dari contoh, terutama cahaya → wajar. Bagian acak data uji bergantung pada menit kamu memuatnya. Yang penting, baris `ringkasan` sama persis dengan baris `mentah`.
> - Di 5.8, ketiga baris pembanding tanpa angka (`n` di baris `mentah` bernilai `0`) → tanggal di kueri bukan hari kamu memuat data uji, misalnya karena kamu menyambung Praktik 5 di hari lain atau lewat pukul 00.00. Ganti dengan tanggal pemuatan (lihat kueri `max(ts)` di awal 5.8).

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 7](#7-retensi-buang-jilid-lama-ringkasannya-disimpan) (➡️ di akhir Konsep 8 akan mengantarmu ke Praktik 6).

### Praktik 6 — Retensi 90 hari dan columnstore (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama di folder `backend` untuk `npm run migrasi`, terminal kedua untuk psql) dan **Docker Desktop**.

Di praktik ini kamu memasang dua kebijakan terakhir: **retensi** yang membuang bacaan mentah yang lebih tua daripada 90 hari (Konsep 7), dan **columnstore** yang memadatkan jilid yang lebih tua daripada 7 hari (Konsep 8). Ingat pesan Konsep 6: kebijakan langsung bekerja begitu dipasang. Karena itu, setiap langkah di sini selalu dimulai dengan **mencatat keadaan "sebelum"**, baru menjalankan migrasinya. Di akhir Praktik 5 kamu sudah keluar dari psql, jadi masuk lagi di terminal kedua (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`).

> [!IMPORTANT]
> Pastikan langkah 5.4 (`CALL refresh_continuous_aggregate(…)`) **sudah** kamu jalankan. Setelah retensi bekerja, ringkasan untuk bacaan yang sudah dibuang tidak bisa dibuat lagi.

#### 6.1 Catat keadaan sebelum retensi

Di psql (terminal kedua), ketik satu per satu:

```sql
SELECT min(ts), max(ts), count(*) FROM readings;
SELECT count(*) AS jilid FROM show_chunks('readings');
SELECT pg_size_pretty(hypertable_size('readings')) AS ukuran;
SELECT count(*) AS akan_dibuang FROM show_chunks('readings', older_than => INTERVAL '90 days');
SELECT count(*) AS ringkasan_lebih_90_hari FROM readings_per_jam WHERE jam < now() - INTERVAL '90 days';
```

**Hasilnya** (contoh):

```text
          min           |          max           |  count  
------------------------+------------------------+---------
 2026-06-22 15:18:00+00 | 2026-10-20 15:18:00+00 | 1039085
(1 row)

 jilid 
-------
   121
(1 row)

 ukuran 
--------
 201 MB
(1 row)

 akan_dibuang 
--------------
           30
(1 row)

 ringkasan_lebih_90_hari 
-------------------------
                     721
(1 row)
```

Catat kelima angka itu. **`show_chunks('readings', older_than => INTERVAL '90 days')`** adalah pratinjau: daftar jilid yang seluruh isinya lebih tua daripada 90 hari, yaitu jilid-jilid yang akan dibuang. Di contoh ini ada tiga puluh karena praktik ini dikerjakan beberapa menit setelah data uji dimuat. Kalau kamu memuatnya beberapa hari sebelumnya, ada satu jilid lagi untuk setiap pukul 07.00 WIB yang sudah lewat sejak itu, dan angka-angka berikutnya ikut berbeda. Angka terakhir menghitung baris buku ringkasan untuk jam-jam yang lebih tua daripada 90 hari. Sebentar lagi kamu akan memeriksa apakah angka itu tetap utuh.

#### 6.2 Migrasi `004_retensi.sql`

Di folder `backend/migrasi`, buat file baru **`004_retensi.sql`**:

```sql
-- 004_retensi.sql - buang bacaan mentah yang lebih tua daripada 90 hari (Modul 18).
-- TimescaleDB membuang jilid (chunk) utuh, bukan baris satu per satu: cepat, tanpa DELETE.
-- Ringkasan per jam (readings_per_jam) tidak ikut terbuang karena jendela petugasnya (3 hari) jauh lebih pendek daripada 90 hari.
SELECT add_retention_policy('readings', drop_after => INTERVAL '90 days');
```

Isinya satu kalimat dari Konsep 7. Di terminal pertama (folder `backend`), jalankan:

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.2.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 004_retensi.sql
1 migrasi baru diterapkan, 3 sudah ada sebelumnya.
```

#### 6.3 Lihat hasilnya

Tunggu sekitar lima detik, lalu kembali ke psql:

```sql
SELECT min(ts), max(ts), count(*) FROM readings;
SELECT now() - min(ts) AS umur_tertua FROM readings;
SELECT count(*) AS jilid FROM show_chunks('readings');
SELECT pg_size_pretty(hypertable_size('readings')) AS ukuran;
SELECT count(*) AS ringkasan_lebih_90_hari FROM readings_per_jam WHERE jam < now() - INTERVAL '90 days';
```

**Hasilnya** (contoh):

```text
          min           |          max           | count  
------------------------+------------------------+--------
 2026-07-22 00:00:00+00 | 2026-10-20 15:18:00+00 | 785393
(1 row)

       umur_tertua       
-------------------------
 90 days 15:22:44.063391
(1 row)

 jilid 
-------
    91
(1 row)

 ukuran 
--------
 152 MB
(1 row)

 ringkasan_lebih_90_hari 
-------------------------
                     721
(1 row)
```

Bandingkan dengan catatanmu di 6.1:

| | Sebelum | Sesudah |
| :--- | :--- | :--- |
| Bacaan mentah | 1.039.085 | 785.393 |
| Jilid | 121 | 91 |
| Ukuran | 201 MB | 152 MB |
| Ringkasan lebih tua daripada 90 hari | 721 | **721** |

Tiga puluh jilid tertua sudah dibuang, padahal kamu belum menjalankan apa-apa selain `npm run migrasi`: *job* retensi bekerja sendiri dua detik sesudah dipasang. Bacaan tertua kini berumur **90 hari 15 jam**, bukan tepat 90 hari. Itu wajar karena retensi hanya membuang jilid yang **seluruh** isinya sudah lewat batas (Konsep 7). Jilid 22 Juli masih berisi bacaan yang lebih muda daripada 90 hari, jadi ia menunggu giliran besok. Yang terpenting, baris terakhir tidak berubah: **buku ringkasannya selamat**. Lihat sendiri:

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT jam, round(suhu_rata::numeric, 1) AS suhu_rata, jumlah_bacaan
FROM readings_per_jam WHERE device_id = 'beef00000001' ORDER BY jam LIMIT 3;
RESET TIME ZONE;
```

**Hasilnya** (contoh):

```text
          jam           | suhu_rata | jumlah_bacaan 
------------------------+-----------+---------------
 2026-06-22 22:00:00+07 |      25.3 |           252
 2026-06-22 23:00:00+07 |      24.6 |           360
 2026-06-23 00:00:00+07 |      23.8 |           360
(3 rows)
```

Bacaan mentah 22 Juni sudah tidak ada, tetapi rata-rata suhu per jamnya masih bisa dijawab. Inilah pembagian kerja yang dirancang sejak Konsep 7: data mentah disimpan 90 hari, ringkasannya selamanya. Terakhir, lihat petugas barunya:

```sql
SELECT j.job_id, j.application_name, j.schedule_interval, s.last_run_status, s.last_run_duration, s.next_start
FROM timescaledb_information.jobs j
JOIN timescaledb_information.job_stats s USING (job_id)
WHERE j.job_id >= 1000
ORDER BY j.job_id;
```

**Hasilnya** (contoh):

```text
 job_id |              application_name              | schedule_interval | last_run_status | last_run_duration |          next_start           
--------+--------------------------------------------+-------------------+-----------------+-------------------+-------------------------------
   1000 | Refresh Continuous Aggregate Policy [1000] | 00:30:00          | Success         | 00:00:00.088782   | 2026-10-20 15:51:15.417701+00
   1001 | Retention Policy [1001]                    | 1 day             | Success         | 00:00:00.156763   | 2026-10-21 15:22:35.656334+00
(2 rows)
```

Kueri ini menggabungkan daftar *job* (`jobs`, diberi nama pendek `j`) dengan riwayat kerjanya (`job_stats`, nama pendek `s`) lewat `JOIN` (Modul 17 Konsep 8). `USING (job_id)` berarti "kolom penghubungnya sama-sama bernama `job_id`". *Job* **1001** membuang tiga puluh jilid dalam 0,16 detik, lalu dijadwalkan bekerja lagi sehari kemudian. Bandingkan dengan `DELETE` di tabel biasa pada Praktik 4.7: yang dibuang sama-sama sekitar 30 hari bacaan, tetapi kali ini ukurannya benar-benar turun.

#### 6.4 Catat keadaan sebelum columnstore

Sekarang giliran memadatkan. Catat dulu:

```sql
SELECT pg_size_pretty(hypertable_size('readings')) AS ukuran;
SELECT count(*) AS akan_dipadatkan FROM show_chunks('readings', older_than => INTERVAL '7 days');
```

**Hasilnya** (contoh):

```text
 ukuran 
--------
 152 MB
(1 row)

 akan_dipadatkan 
-----------------
              83
(1 row)
```

Dari 91 jilid, 83 lebih tua daripada 7 hari dan akan dipadatkan. Delapan jilid terbaru tetap disimpan per baris karena masih ditulisi.

#### 6.5 Migrasi `005_columnstore.sql`

Di folder `backend/migrasi`, buat file baru **`005_columnstore.sql`**:

```sql
-- 005_columnstore.sql - padatkan jilid yang lebih tua daripada 7 hari dengan menyimpannya per kolom: columnstore (Modul 18).
-- segmentby: bacaan dikelompokkan per perangkat; orderby: di dalam kelompok, diurutkan dari yang terbaru.
-- Jilid yang sudah dipadatkan tetap bisa dibaca, ditambah, dan diubah seperti biasa.
ALTER TABLE readings SET (
  timescaledb.enable_columnstore,
  timescaledb.segmentby = 'device_id',
  timescaledb.orderby   = 'ts DESC'
);
CALL add_columnstore_policy('readings', after => INTERVAL '7 days');
```

Isinya dua perintah dari Konsep 8: `ALTER TABLE … SET (…)` menyalakan columnstore untuk `readings` dengan pengelompokan per perangkat dan urutan waktu, lalu `CALL add_columnstore_policy(…)` memasang petugas pemadatnya. Perhatikan bedanya dengan 004: kebijakan retensi dipasang dengan `SELECT`, sedangkan kebijakan columnstore dengan `CALL` karena `add_columnstore_policy` adalah prosedur. Di terminal pertama:

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.2.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 005_columnstore.sql
1 migrasi baru diterapkan, 4 sudah ada sebelumnya.
```

#### 6.6 Lihat hasilnya

Tunggu sekitar lima detik, lalu di psql:

```sql
SELECT pg_size_pretty(hypertable_size('readings')) AS ukuran;
SELECT pg_size_pretty(before_compression_total_bytes) AS sebelum,
       pg_size_pretty(after_compression_total_bytes)  AS sesudah
FROM hypertable_columnstore_stats('readings');
```

**Hasilnya** (contoh):

```text
 ukuran 
--------
 30 MB
(1 row)

 sebelum | sesudah 
---------+---------
 137 MB  | 13 MB
(1 row)
```

**Dari 152 MB menjadi 30 MB**, sekitar seperlimanya, dalam tiga detik kerja *job* columnstore. **`hypertable_columnstore_stats`** hanya merinci 83 jilid yang dipadatkan: dari 137 MB menjadi 13 MB, sepuluh kali lebih kecil. Sisanya, sekitar 17 MB, adalah delapan jilid terbaru yang masih per baris dan "kerangka" jilid-jilid padat. Lihat status jilid-jilid terbaru:

```sql
SELECT chunk_name, range_start, is_compressed FROM timescaledb_information.chunks
WHERE hypertable_name = 'readings' ORDER BY range_start DESC LIMIT 10;
```

**Hasilnya** (contoh):

```text
     chunk_name     |      range_start       | is_compressed 
--------------------+------------------------+---------------
 _hyper_1_9_chunk   | 2026-10-20 00:00:00+00 | f
 _hyper_1_8_chunk   | 2026-10-19 00:00:00+00 | f
 _hyper_1_7_chunk   | 2026-10-18 00:00:00+00 | f
 _hyper_1_6_chunk   | 2026-10-17 00:00:00+00 | f
 _hyper_1_5_chunk   | 2026-10-16 00:00:00+00 | f
 _hyper_1_4_chunk   | 2026-10-15 00:00:00+00 | f
 _hyper_1_3_chunk   | 2026-10-14 00:00:00+00 | f
 _hyper_1_2_chunk   | 2026-10-13 00:00:00+00 | f
 _hyper_1_1_chunk   | 2026-10-12 00:00:00+00 | t
 _hyper_1_121_chunk | 2026-10-11 00:00:00+00 | t
(10 rows)
```

Delapan jilid terbaru berstatus `f` (*false*, belum dipadatkan); mulai jilid 12 Oktober ke belakang semuanya `t` (*true*, sudah dipadatkan). Jilid 13 Oktober belum dipadatkan karena sebagian isinya belum berumur 7 hari. Petugas pemadat bekerja setiap 12 jam, jadi besok jilid itu ikut dipadatkan. Ketiga petugasmu kini lengkap:

```sql
SELECT j.job_id, j.application_name, j.schedule_interval, s.last_run_status, s.last_run_duration, s.next_start
FROM timescaledb_information.jobs j
JOIN timescaledb_information.job_stats s USING (job_id)
WHERE j.job_id >= 1000
ORDER BY j.job_id;
```

**Hasilnya** (contoh):

```text
 job_id |              application_name              | schedule_interval | last_run_status | last_run_duration |          next_start           
--------+--------------------------------------------+-------------------+-----------------+-------------------+-------------------------------
   1000 | Refresh Continuous Aggregate Policy [1000] | 00:30:00          | Success         | 00:00:00.088782   | 2026-10-20 15:51:15.417701+00
   1001 | Retention Policy [1001]                    | 1 day             | Success         | 00:00:00.156763   | 2026-10-21 15:22:35.656334+00
   1002 | Columnstore Policy [1002]                  | 12:00:00          | Success         | 00:00:02.936432   | 2026-10-21 03:23:03.619804+00
(3 rows)
```

Mulai sekarang database merawat dirinya sendiri: meringkas setiap 30 menit, membuang yang tua setiap hari, dan memadatkan setiap 12 jam.

#### 6.7 Kiriman terlambat ke jilid yang sudah dipadatkan

Jilid padat bukan arsip beku. Bayangkan jaringan rumah putus semalaman, lalu bacaan yang tertahan dikirim belakangan. Di Modul 27, jembatan broker di Raspberry Pi akan melakukan hal seperti itu. Bacaan semalam masih masuk ke jilid minggu ini, yang belum dipadatkan. Supaya kiriman terlambat benar-benar mendarat di jilid padat, contoh ini memakai bacaan yang jauh lebih tua. Coba kirim bacaan dari **30 hari lalu** dengan bentuk `INSERT` yang sama seperti backend v0.2 (**ganti `2026-09-20` dengan tanggal 30 hari lalu** di kelima tempatnya, yaitu dua kali di kotak pertama dan sekali di setiap kotak SQL berikutnya):

```sql
SELECT chunk_name, is_compressed FROM timescaledb_information.chunks
WHERE hypertable_name = 'readings' AND range_start = '2026-09-20 00:00:00+00';
INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air)
VALUES ('beef00000001', '2026-09-20 12:00:05+00', '1.4.0', 27.5, 70, 1500, 60, false, 70)
ON CONFLICT (device_id, ts) DO NOTHING;
```

**Hasilnya** (nama jilidmu bisa berbeda):

```text
     chunk_name     | is_compressed 
--------------------+---------------
 _hyper_1_100_chunk | t
(1 row)

INSERT 0 1
```

Jilidnya sudah dipadatkan (`t`), tetapi bacaan baru tetap masuk: `INSERT 0 1`. Detiknya sengaja `:05` karena bacaan uji selalu jatuh di detik `:00`, `:10`, `:20`, dan seterusnya sehingga stempel waktu ini belum terpakai. Jalankan `INSERT` yang sama sekali lagi:

```sql
INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air)
VALUES ('beef00000001', '2026-09-20 12:00:05+00', '1.4.0', 27.5, 70, 1500, 60, false, 70)
ON CONFLICT (device_id, ts) DO NOTHING;
```

**Hasilnya:** `INSERT 0 0`. Walaupun jilidnya padat, kiriman ganda tetap tersimpan sekali, seperti di Modul 17 Praktik 6. Tanpa `ON CONFLICT`, kunci utama tetap menjaga:

```sql
INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air)
VALUES ('beef00000001', '2026-09-20 12:00:05+00', '1.4.0', 27.5, 70, 1500, 60, false, 70);
```

**Hasilnya:**

```text
ERROR:  duplicate key value violates unique constraint "100_readings_pkey"
DETAIL:  Key (device_id, ts)=(beef00000001, 2026-09-20 12:00:05+00) already exists.
```

Nama aturannya kini memuat nomor jilid (`100_readings_pkey`) karena setiap jilid membawa salinan kunci utamanya sendiri. Bacaan terlambat itu bisa dibaca seperti biasa:

```sql
SELECT ts, suhu FROM readings WHERE device_id = 'beef00000001' AND ts = '2026-09-20 12:00:05+00';
```

**Hasilnya:**

```text
           ts           | suhu 
------------------------+------
 2026-09-20 12:00:05+00 | 27.5
(1 row)
```

TimescaleDB menyimpan bacaan susulan ini di bagian kecil yang belum padat di dalam jilid yang sama. Petugas pemadat akan merapikannya pada putaran berikutnya. Keluar dari psql dengan `\q`.

#### 6.8 Simpan ke cabang

Di terminal pertama (folder `backend`):

```text
git add migrasi/004_retensi.sql migrasi/005_columnstore.sql
git commit -m "retensi 90 hari dan columnstore (Modul 18 Praktik 6)"
git push
```

> [!TIP]
> **Tidak jalan?**
>
> - `GAGAL di 005_columnstore.sql: add_columnstore_policy(unknown, after => interval) is a procedure` → kebijakan columnstore ditulis dengan `SELECT`. Ubah menjadi `CALL add_columnstore_policy(…)`, lalu jalankan lagi `npm run migrasi`.
> - `GAGAL di 005_columnstore.sql: columnstore not enabled on hypertable "readings"` → bagian `ALTER TABLE readings SET (…)` terlewat atau salah ketik. Salin ulang isi file dari 6.5.
> - Di 6.3, jumlah jilid masih 121 → *job* retensi belum sempat bekerja. Tunggu beberapa detik lagi, lalu ulangi. Kalau tetap 121, jalankan `CALL run_job(1001);`. Nomor *job*-mu ada di kolom `job_id` kueri terakhir 6.3.
> - Di 6.6, ukurannya masih 152 MB → sama: tunggu sebentar, atau jalankan `CALL run_job(1002);`.
> - Di 6.3, `ringkasan_lebih_90_hari` bernilai 0 → langkah 5.4 terlewat sebelum retensi bekerja. Ringkasan untuk bacaan yang sudah dibuang tidak bisa dibuat lagi. Lanjutkan saja modulnya; angka-angkamu di Praktik 7–8 akan lebih kecil daripada contoh.
> - Kiriman terlambat menjawab `INSERT 0 0` pada percobaan pertama → stempel waktunya bentrok dengan bacaan uji yang sudah ada. Pastikan detiknya `:05`, bukan `:00`.
> - `ERROR:  duplicate key value violates unique constraint …` pada percobaan **pertama** → sama: stempel waktunya bentrok dengan bacaan uji. Gunakan `:05`.

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 9](#9-backup-dan-restore-fotokopi-arsip-lalu-buktikan-bisa-dipulihkan) (➡️ di akhir Konsep 9 akan mengantarmu ke Praktik 7).

### Praktik 7 — Backup dan restore yang terbukti (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan dua terminal di folder `rumah-pintar-mini/backend`, **Docker Desktop**, dan **psql** di dalam kontainer. Di **Windows**, pakai terminal **PowerShell** bawaan VS Code (baik Windows PowerShell 5.1 maupun PowerShell 7 bisa dipakai), **bukan Git Bash**. Kalau terminal VS Code-mu ternyata Git Bash, klik panah kecil di samping ikon **+** di panel terminal, pilih **PowerShell** (atau **Windows PowerShell**), lalu ketik `cd backend` di terminal baru itu. Di macOS dan Linux, pakai terminal biasa: semua perintahnya sama persis.

Konsep 9 berpesan: backup yang belum pernah di-restore sama dengan tidak punya backup. Praktik ini menjalankan pesan itu dalam empat langkah: catat sidik jari database asli, buat fotokopinya, bangun database baru dari fotokopi itu, lalu buktikan isinya sama persis.

#### 7.1 Diamkan dulu database-nya

Bukti "sama persis" hanya bermakna kalau isi database asli tidak berubah selama praktik ini. Kalau backend v0.2 atau simulator perangkat dari modul sebelumnya masih menyala di salah satu terminal, matikan dengan **Ctrl + C**. *Job* TimescaleDB boleh tetap bekerja. Hanya *job* retensi yang mengubah isi bacaan, dan langkah 7.2 menjalankannya lebih dulu.

Di dunia nyata, `pg_dump` boleh dijalankan saat aplikasi menyala. Ia memotret isi database pada satu saat, jadi fotokopinya tetap utuh walaupun bacaan baru terus masuk. Backend hanya dimatikan di sini supaya angka asli dan salinan bisa dicocokkan.

#### 7.2 Sidik jari database asli

Di terminal kedua, masuk ke psql seperti biasa (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`). Pertama, jalankan petugas retensi sekarang juga (nomor *job* retensimu ada di daftar *job* Praktik 6.3):

```sql
CALL run_job(1001);
```

**Hasilnya:** `CALL`. Database salinan nanti langsung menjalankan semua petugasnya begitu dipulihkan (7.4), termasuk retensi. Setiap pukul 07.00 WIB, satu jilid lagi melewati batas 90 hari, sedangkan database asli baru membuangnya pada jadwal retensi berikutnya. Tanpa langkah ini, salinan bisa langsung kehilangan satu jilid yang di database asli masih ada, dan bukti di 7.5 tidak cocok. Karena itu juga, kerjakan 7.2 sampai 7.5 tanpa jeda yang melewati pukul 07.00 WIB. Sekarang, masih di psql, jalankan kueri bukti ini:

```sql
SELECT (SELECT count(*) FROM readings) AS bacaan,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS sidik_jari,
       (SELECT count(*) FROM readings_per_jam) AS ringkasan,
       (SELECT count(*) FROM show_chunks('readings')) AS jilid,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS tugas;
```

**Hasilnya** (contoh; tunggu sekitar 2–3 detik):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas 
--------+----------------------------------+-----------+-------+-------
 785394 | 4af27a1271c640a4fa1d914cf2c26392 |      3263 |    91 |     3
(1 row)
```

Kueri ini menanyakan lima hal sekaligus. Setiap `(SELECT …)` di dalam kurung adalah satu pertanyaan kecil yang jawabannya menjadi satu kolom:

| Kolom | Isinya |
| :--- | :--- |
| `bacaan` | Banyaknya bacaan. Di contoh ini: 785.393 dari Praktik 6, ditambah satu kiriman terlambat di 6.7. Untuk setiap pukul 07.00 WIB yang sudah lewat sejak Praktik 6, angkamu lebih kecil 8.640 dan `jilid`-mu berkurang satu karena retensi (termasuk `CALL run_job(1001);` barusan) membuang satu jilid lagi. |
| `sidik_jari` | **`md5`** mengubah teks apa pun menjadi 32 karakter "sidik jari". `md5(r::text)` membuat sidik jari setiap baris, `string_agg(…, '' ORDER BY r.device_id, r.ts)` merangkai semuanya dengan urutan tetap, lalu `md5` terakhir meringkas rangkaian itu menjadi satu sidik jari. Kalau satu angka saja berubah di satu baris, sidik jarinya berubah total. |
| `ringkasan` | Banyaknya baris buku ringkasan `readings_per_jam`. |
| `jilid` | Banyaknya *chunk* hypertable `readings`. |
| `tugas` | Banyaknya *job* buatanmu (1000, 1001, 1002). |

Sidik jarimu pasti berbeda dari contoh karena data ujimu dimuat pada menit yang berbeda. Yang penting nanti: sidik jari database salinan harus **sama dengan sidik jarimu sendiri**. Salin baris hasilnya ke Notepad atau catatanmu, lalu keluar dari psql dengan `\q`.

#### 7.3 Fotokopi: `pg_dump`

Di terminal pertama (folder `backend`), buat fotokopinya **di dalam kontainer**:

```text
docker exec rumahpintar-db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
```

**Hasilnya** (sekitar 1–2 detik):

```text
pg_dump: warning: there are circular foreign-key constraints on this table:
pg_dump: detail: continuous_agg
pg_dump: hint: You might not be able to restore the dump without using --disable-triggers or temporarily dropping the constraints.
pg_dump: hint: Consider using a full dump instead of a --data-only dump to avoid this problem.
```

| Bagian | Artinya |
| :--- | :--- |
| `pg_dump` | Program bawaan PostgreSQL di dalam kontainer, jadi versinya pasti cocok dengan database-nya. Kamu tidak perlu memasang apa pun di laptop. |
| `-d rumahpintar` | Database yang difotokopi. |
| `-Fc` | Format *custom*: satu berkas terkemas dan dipadatkan, yang bisa dibaca `pg_restore`. |
| `-f /tmp/rumahpintar.dump` | Tulis berkasnya ke folder sementara di dalam kontainer. |

Peringatan *circular foreign-key constraints* (kunci tamu yang melingkar) itu wajar. Tabel katalog milik TimescaleDB yang mencatat buku ringkasan (`continuous_agg`) punya kunci tamu yang menunjuk ke tabel itu sendiri. Isi tabel katalog seperti itu selalu disalin sebagai "data saja", jadi `pg_dump` mengingatkan bahwa memulihkan baris-barisnya bisa terganjal kunci tamu itu. Itulah sebabnya baris `hint` terakhir menyebut `--data-only`. Dokumentasi TimescaleDB menyebut pesan seperti ini biasanya aman diabaikan, dan restore di 7.4 akan membuktikannya. Backup yang kamu buat sendiri adalah backup lengkap, berisi bentuk tabel sekaligus datanya.

Sekarang salin berkasnya ke laptop, ke folder baru `backup`. **Ganti `2026-10-20` di nama berkas dengan tanggal hari ini** supaya backup-backup berikutnya tidak saling menimpa. Pada backup berikutnya, `mkdir backup` boleh dilewati karena foldernya sudah ada (kalau tetap dijalankan, jawabannya `… already exists.`, atau `File exists` di macOS, dan itu tidak berbahaya):

```text
mkdir backup
docker cp rumahpintar-db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-20.dump
```

**Hasilnya** di PowerShell (contoh; jalur, tanggal, dan jamnya mengikuti laptopmu; di macOS dan Linux, `mkdir` tidak menulis apa-apa):

```text
    Directory: C:\Users\<nama>\…\rumah-pintar-mini\backend

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d----          20/10/2026    23:24                backup

Successfully copied 4.99MB (transferred 4.99MB) to C:\Users\<nama>\…\rumah-pintar-mini\backend\backup\rumahpintar-2026-10-20.dump
```

Periksa berkasnya dengan `dir backup` (di macOS dan Linux, `ls -l backup`):

```text
    Directory: C:\Users\<nama>\…\rumah-pintar-mini\backend\backup

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---          20/10/2026    23:24        4991511 rumahpintar-2026-10-20.dump
```

Sekitar **5 MB** untuk seluruh database: 785 ribu bacaan, buku ringkasan, enam tabel, dan ketiga *job*. Format `-Fc` memadatkan isinya, mirip file ZIP.

> [!WARNING]
> **Jangan membuat backup dengan tanda `>`** (misalnya `docker exec rumahpintar-db pg_dump … > berkas.dump`) walaupun cara itu banyak muncul di internet. Di Windows PowerShell 5.1, tanda `>` mengubah isi berkas menjadi teks UTF-16. Berkasnya jadi hampir dua kali lebih besar dan **rusak**: `pg_restore` menolaknya dengan `input file does not appear to be a valid archive`. Cara `-f` lalu `docker cp` di atas aman di semua terminal.

#### 7.4 Bangun arsip baru: restore ke `rumahpintar_pulih`

Fotokopi dipulihkan ke **database baru** bernama `rumahpintar_pulih`, di kontainer yang sama. Database asli tidak disentuh sama sekali. Jalankan perintah-perintah ini satu per satu di terminal pertama, dengan nama berkas yang sama seperti di 7.3:

```text
docker cp backup/rumahpintar-2026-10-20.dump rumahpintar-db:/tmp/pulih.dump
docker exec rumahpintar-db createdb -U postgres -T template0 rumahpintar_pulih
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "CREATE EXTENSION timescaledb;"
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_pre_restore();"
docker exec rumahpintar-db pg_restore -U postgres -d rumahpintar_pulih /tmp/pulih.dump
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_post_restore();"
```

**Hasilnya**, berurutan untuk keenam perintah:

```text
Successfully copied 4.99MB (transferred 4.99MB) to rumahpintar-db:/tmp/pulih.dump
```

```text
CREATE EXTENSION
```

```text
 timescaledb_pre_restore 
-------------------------
 t
(1 row)
```

```text
 timescaledb_post_restore 
--------------------------
 t
(1 row)
```

Perintah kedua (`createdb`) dan kelima (`pg_restore`) tidak menulis apa-apa kalau berhasil; `pg_restore` butuh sekitar 5 detik. Inilah yang terjadi di setiap langkah:

1. **`docker cp backup/… rumahpintar-db:/tmp/pulih.dump`**: berkas di laptop disalin balik ke kontainer. Yang dipulihkan sengaja salinan **laptop**, bukan `/tmp/rumahpintar.dump` yang masih ada di kontainer. Saat bencana sungguhan, kontainernya mungkin sudah tidak ada; yang tersisa hanya berkas di laptop atau flashdisk.
2. **`createdb -T template0 rumahpintar_pulih`**: buat database kosong. `template0` adalah cetakan database yang benar-benar polos. Cetakan bawaan yang biasa dipakai, `template1`, di image ini sudah memuat TimescaleDB, sedangkan restore paling aman dimulai dari database polos.
3. **`CREATE EXTENSION timescaledb`**: pasang TimescaleDB versi 2.30.2, sama dengan database asal (syarat dari Konsep 9).
4. **`timescaledb_pre_restore()`**: minta TimescaleDB berhenti bekerja sebentar dan bersiap menerima isi. Jawaban `t` (*true*) berarti siap.
5. **`pg_restore`**: bangun ulang semua tabel, *chunk*, buku ringkasan, dan *job* dari fotokopi.
6. **`timescaledb_post_restore()`**: hidupkan lagi TimescaleDB. Para petugas di database salinan langsung bekerja.

Jangan menambahkan `-j` (memulihkan dengan beberapa pekerja sekaligus) ke `pg_restore`: dokumentasi TimescaleDB menyebut cara itu tidak memulihkan katalog TimescaleDB dengan benar. Dua langkah TimescaleDB itu juga jangan sampai terlewat. Akibat melewatkannya sudah dibahas di Konsep 9: tanpa langkah 4, ada baris yang hilang dan kunci utama tidak terpasang, sedangkan tanpa langkah 6, sebagian besar bacaan seolah lenyap.

#### 7.5 ⭐ Buktikan isinya sama

Di terminal kedua, masuk ke psql, kali ini ke database **salinan**:

```text
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar_pulih
```

Jalankan lagi kueri bukti dari 7.2, persis sama:

```sql
SELECT (SELECT count(*) FROM readings) AS bacaan,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS sidik_jari,
       (SELECT count(*) FROM readings_per_jam) AS ringkasan,
       (SELECT count(*) FROM show_chunks('readings')) AS jilid,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS tugas;
```

**Hasilnya** (contoh):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas 
--------+----------------------------------+-----------+-------+-------
 785394 | 4af27a1271c640a4fa1d914cf2c26392 |      3263 |    91 |     3
(1 row)
```

Cocokkan dengan catatanmu dari 7.2, karakter demi karakter. Banyaknya bacaan, sidik jari 785 ribu baris, buku ringkasan, jilid, dan *job*-nya **sama persis**. **Syarat lulus kedua terpenuhi**: backup-mu terbukti bisa dipulihkan.

Satu hal menarik lagi:

```sql
SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database WHERE datname IN ('rumahpintar', 'rumahpintar_pulih') ORDER BY 1;
```

**Hasilnya** (contoh):

```text
      datname      | pg_size_pretty 
-------------------+----------------
 rumahpintar       | 46 MB
 rumahpintar_pulih | 40 MB
(2 rows)
```

Isinya sama, tetapi salinannya sedikit lebih kecil. Database asli menyimpan sisa-sisa kerja selama modul ini, seperti baris mati dan ruang kosong, sedangkan salinan dibangun rapat dari nol. **`pg_database`** adalah daftar semua database di kontainer, dan **`pg_database_size`** mengukur satu database utuh.

#### 7.6 Bersihkan

Bukti sudah didapat, jadi database salinan boleh dibuang. Keluar dari psql dengan `\q`, lalu di terminal pertama:

```text
docker exec rumahpintar-db dropdb -U postgres rumahpintar_pulih
docker exec rumahpintar-db rm /tmp/rumahpintar.dump /tmp/pulih.dump
```

Kedua perintah tidak menulis apa-apa kalau berhasil. **`dropdb`** menghapus database salinan beserta isinya, dan **`rm`** (*remove*) menghapus dua berkas sementara di dalam kontainer. Hati-hati mengetik nama database: `dropdb` tidak bertanya ulang.

Berkas di folder `backup` **tetap disimpan**. Supaya benar-benar aman, salin juga ke tempat lain, misalnya flashdisk atau Google Drive: backup yang hanya ada di laptop yang sama ikut hilang kalau laptopnya rusak. Perlakukan berkas itu seperti data pribadi karena isinya seluruh database.

#### 7.7 Jangan masukkan backup ke Git

Berkas backup besar dan berisi data, jadi tidak boleh masuk Git. Di VS Code, buka **`backend/.gitignore`** (dibuat di Modul 16), lalu tambahkan dua baris ini di paling bawah:

```text
# fotokopi database (pg_dump): besar dan berisi data pribadi, simpan di luar Git
backup/
```

Simpan, lalu di terminal pertama:

```text
git status
```

**Hasilnya:** `.gitignore` tercatat sebagai `modified`, dan folder `backup/` **tidak** muncul di daftar. Simpan perubahannya:

```text
git add .gitignore
git commit -m "folder backup tidak ikut Git (Modul 18 Praktik 7)"
git push
```

> [!TIP]
> **Tidak jalan?**
>
> - `pg_dump: error: could not open output file "C:/Users/<nama>/AppData/Local/Temp/rumahpintar.dump": No such file or directory` → kamu memakai **Git Bash**, yang mengubah `/tmp/…` menjadi folder Temp Windows. Pindah ke terminal PowerShell, atau tulis dua garis miring: `//tmp/rumahpintar.dump`.
> - `invalid output path: directory "C:\\…\\backend\\backup" does not exist` → folder `backup` belum dibuat. Pastikan terminal berada di folder `backend`, jalankan `mkdir backup`, lalu ulangi `docker cp`.
> - `pg_restore: error: input file does not appear to be a valid archive` → berkas backup rusak, biasanya karena dibuat dengan `>`. Ulangi 7.3 dengan `-f` dan `docker cp`.
> - `createdb: error: database creation failed: ERROR:  database "rumahpintar_pulih" already exists` → sisa percobaan sebelumnya. Jalankan `docker exec rumahpintar-db dropdb -U postgres rumahpintar_pulih`, lalu ulangi 7.4 dari `createdb`.
> - `ERROR:  extension "timescaledb" already exists` → `createdb` dijalankan tanpa `-T template0`. Buang database itu dengan `dropdb`, lalu ulangi 7.4 dari `createdb`.
> - `pg_restore` menulis beberapa `ERROR`, ditutup dengan `pg_restore: warning: errors ignored on restore: 3` → `timescaledb_pre_restore()` terlewat. Buang database salinan dengan `dropdb`, lalu ulangi 7.4 dari `createdb` (🚨 membahasnya lebih rinci).
> - Di 7.5, `bacaan` jauh lebih kecil, misalnya 68 ribu → `timescaledb_post_restore()` belum dijalankan. Jalankan perintah keenam di 7.4, lalu ulangi kueri bukti.
> - Di 7.5, `bacaan` salinan kurang beberapa ribu (8.640 untuk setiap jilid, yaitu sehari penuh bacaan uji) dan `jilid`-nya lebih sedikit, sedangkan `ringkasan` dan `tugas` sama → retensi di salinan sudah membuang jilid tua yang di database asli belum dibuang (`CALL run_job(1001);` di 7.2 terlewat, atau pukul 07.00 WIB lewat di antara 7.2 dan 7.4). Keluar dari psql salinan dengan `\q`, masuk ke `rumahpintar` seperti di 7.2, jalankan `CALL run_job(1001);`, lalu jalankan lagi kueri bukti di sana. Kini angkanya sama dengan salinan.
> - Sidik jari berbeda, padahal semua langkah sudah benar → isi database asli berubah sesudah 7.2, misalnya karena backend masih menyala. Matikan backend, jalankan lagi kueri bukti di `rumahpintar`, lalu ulangi 7.3–7.5. Jalankan juga kedua kueri bukti di psql: teks setiap baris ikut zona sesi, jadi sidik jari dari DBeaver (WIB) selalu berbeda dari sidik jari psql (UTC).
> - `dropdb: error: database removal failed: ERROR:  database "rumahpintar_pulih" is being accessed by other users` → psql di terminal kedua (atau aplikasi lain) masih tersambung ke database salinan. Keluar dulu dengan `\q`, lalu ulangi `dropdb`. Database salinannya belum terhapus, jadi tidak ada yang rusak.

> ⬆️ **Selesai Praktik 7?** Kembali ke [Konsep 10](#10-dari-backend-satu-parameter-bucket) (➡️ di akhir Konsep 10 akan mengantarmu ke Praktik 8).

### Praktik 8 — Backend v0.3: riwayat per ember (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama untuk `npm run dev`, terminal kedua untuk perintah lain, keduanya di folder `backend`), **browser**, **Bruno**, dan **Docker Desktop**. Broker MQTT dan Node 1 (atau simulator `alat/simulator-perangkat.js` dari Modul 16) boleh dinyalakan seperti di Modul 17 Praktik 5.6 supaya bacaan baru ikut masuk ke ringkasan. Simulator dijalankan seperti di Modul 16 Praktik 7.2: buka terminal ketiga, ketik `cd alat`, lalu `node simulator-perangkat.js mqtt://192.168.1.37:1883` dengan alamat brokermu. Perangkat palsunya bernomor `f00d00000001` sampai `f00d00000010`. Dua yang pertama sama dengan perangkat latihan, tetapi bacaannya hanya untuk jam sekarang, jadi angka hari-hari sebelum H tidak berubah.

Database sudah siap: hypertable, buku ringkasan, retensi, dan columnstore. Sekarang backend membukanya untuk dunia luar lewat satu parameter baru, `bucket` (Konsep 10). Ada empat file yang kamu ubah: `package.json`, `src/db/arsip.ts`, `src/routes/perangkat.ts`, dan `src/server.ts`. Semua perubahan berupa **tambahan** atau penggantian bagian tertentu, jadi rute lain yang mungkin kamu buat sendiri (misalnya dari 🧩 Modul 16–17) tetap aman.

#### 8.1 Naikkan versinya

Di terminal kedua (folder `backend`):

```text
npm version 0.3.0 --no-git-tag-version
```

**Hasilnya:** `v0.3.0`. Seperti di Modul 17 Praktik 5.5, angka versi di `package.json` dan `package-lock.json` berubah sekaligus. Lalu buka `package.json` dan perbarui baris `"description"` menjadi:

```json
"description": "Backend Rumah Pintar Mini (Modul 16-18): mendengar MQTT, memeriksa kontrak data, menyimpan semua pesan ke database deret waktu, dan menyediakan API riwayat beserta ringkasannya",
```

#### 8.2 Buku arsip membaca ringkasan: `src/db/arsip.ts`

Ada dua perubahan di `src/db/arsip.ts`.

1. Biarkan baris komentar kedua (`// Gudang di memori (gudang.ts) …`) apa adanya, lalu ganti baris komentar pertama (`// arsip.ts - menulis pesan …`) dengan dua baris ini:

   ```ts
   // arsip.ts - menulis pesan yang sudah lolos pemeriksaan kontrak ke database, dan membacanya lagi untuk API riwayat
   // (bacaan mentah, atau ringkasannya per 15 menit, per jam, dan per hari).
   ```

2. Cari baris `// Apakah database bisa dihubungi sekarang? Dipakai GET /health.` (di atas fungsi `databaseHidup`). **Tepat di atas baris itu**, tambahkan blok ini:

   ```ts
   // Ukuran ember (bucket) yang boleh diminta API riwayat: 15 menit, 1 jam, atau 1 hari.
   export type Ember = "15m" | "1h" | "1d";

   // Satu titik ringkasan: rata-rata, terendah, dan tertinggi dalam satu ember, beserta banyaknya bacaan di dalamnya.
   interface BarisRingkasan {
     waktu: Date; // awal ember
     suhu_rata: number | null;
     suhu_min: number | null;
     suhu_maks: number | null;
     kelembapan_rata: number | null;
     tanah_rata: number | null;
     cahaya_rata: number | null;
     jumlah_bacaan: number;
   }

   // Satu kueri tetap untuk setiap ukuran ember. Teks dari pengguna tidak pernah disambung ke SQL: yang dipilih hanya
   // salah satu dari tiga kueri ini. Angka di-cast ke float8 dan int supaya pg mengirimnya sebagai number, bukan teks.
   const KUERI_RINGKASAN: Record<Ember, string> = {
     // per 15 menit: dihitung langsung dari bacaan mentah di hypertable readings (rentangnya pendek)
     "15m": `SELECT time_bucket('15 minutes', ts) AS waktu,
               round(avg(suhu)::numeric, 1)::float8       AS suhu_rata,
               min(suhu)                                  AS suhu_min,
               max(suhu)                                  AS suhu_maks,
               round(avg(kelembapan)::numeric, 1)::float8 AS kelembapan_rata,
               round(avg(tanah)::numeric, 1)::float8      AS tanah_rata,
               round(avg(cahaya)::numeric, 1)::float8     AS cahaya_rata,
               count(*)::int                              AS jumlah_bacaan
             FROM readings
             WHERE device_id = $1 AND ts >= $2 AND ts < $3
             GROUP BY waktu
             ORDER BY waktu`,
     // per jam: dibaca dari buku ringkasan readings_per_jam (continuous aggregate, migrasi 003)
     "1h": `SELECT jam AS waktu,
              round(suhu_rata::numeric, 1)::float8 AS suhu_rata,
              suhu_min,
              suhu_maks,
              round(kelembapan_rata, 1)::float8    AS kelembapan_rata,
              round(tanah_rata, 1)::float8         AS tanah_rata,
              round(cahaya_rata, 1)::float8        AS cahaya_rata,
              jumlah_bacaan::int                   AS jumlah_bacaan
            FROM readings_per_jam
            WHERE device_id = $1 AND jam >= $2 AND jam < $3
            ORDER BY jam`,
     // per hari WIB: ringkasan per jam digabung lagi. Rata-rata harian = jumlah (rata x banyaknya nilai) semua jam dibagi
     // jumlah banyaknya nilai, jadi tetap tepat walaupun ada jam yang terisi sebagian. nullif mencegah pembagian dengan nol
     // kalau sepanjang hari kolom itu kosong (NULL)
     "1d": `SELECT time_bucket('1 day', jam, 'Asia/Jakarta') AS waktu,
              round((sum(suhu_rata * suhu_n) / nullif(sum(suhu_n), 0))::numeric, 1)::float8          AS suhu_rata,
              min(suhu_min)                                                                         AS suhu_min,
              max(suhu_maks)                                                                        AS suhu_maks,
              round(sum(kelembapan_rata * kelembapan_n) / nullif(sum(kelembapan_n), 0), 1)::float8 AS kelembapan_rata,
              round(sum(tanah_rata * tanah_n) / nullif(sum(tanah_n), 0), 1)::float8                AS tanah_rata,
              round(sum(cahaya_rata * cahaya_n) / nullif(sum(cahaya_n), 0), 1)::float8             AS cahaya_rata,
              sum(jumlah_bacaan)::int                                                               AS jumlah_bacaan
            FROM readings_per_jam
            WHERE device_id = $1 AND jam >= $2 AND jam < $3
            GROUP BY waktu
            ORDER BY waktu`,
   };

   // Ringkasan bacaan satu perangkat per ember dalam rentang [dari, sampai), terlama lebih dulu.
   export async function ambilRingkasan(deviceId: string, dari: Date, sampai: Date, ember: Ember) {
     const hasil = await pool.query<BarisRingkasan>(KUERI_RINGKASAN[ember], [deviceId, dari, sampai]);
     return hasil.rows.map((baris) => ({ ...baris, waktu: waktuKontrak(baris.waktu) })); // waktu sebagai teks
   }
   ```

Isinya empat bagian:

| Bagian | Gunanya |
| :--- | :--- |
| `type Ember` | Tipe TypeScript yang hanya mengizinkan tiga teks: `"15m"`, `"1h"`, dan `"1d"`. |
| `BarisRingkasan` | Bentuk satu baris hasil kueri ringkasan, seperti `BarisBacaan` di Modul 17: `waktu` datang sebagai `Date`, angka sebagai `number`, dan kolom kosong sebagai `null`. |
| `KUERI_RINGKASAN` | **Kamus** berisi tiga kueri SQL tetap, satu untuk setiap ukuran ember (🔁 langkah 1). `Record<Ember, string>` berarti "objek yang kuncinya tepat ketiga nilai `Ember`, dan isinya teks". Kalau satu kunci terlupa, `npm run cek` langsung menegur. |
| `ambilRingkasan` | Mengambil satu kueri dari kamus, mengirim `device_id` dan rentang waktunya sebagai parameter `$1`, `$2`, `$3`, lalu menulis `waktu` dengan format kontrak data, seperti `ambilRiwayat`. |

Tiga kueri itu mengulang apa yang sudah kamu coba di psql:

- **`15m`** dihitung langsung dari hypertable dengan `time_bucket('15 minutes', ts)` (Praktik 3). Rentangnya pendek, jadi tetap cepat.
- **`1h`** dibaca dari buku ringkasan `readings_per_jam` (Praktik 5), tanpa menghitung ulang bacaan mentah.
- **`1d`** menggabungkan ringkasan per jam menjadi hari WIB dengan rumus `rata × n` dari Praktik 5.8. **`nullif(sum(suhu_n), 0)`** mengubah pembagi 0 menjadi `NULL` sehingga hari tanpa satu pun nilai suhu menghasilkan `null`, bukan galat "pembagian dengan nol".

Akhiran **`::float8`** dan **`::int`** mengubah hasilnya menjadi angka biasa sehingga library `pg` mengirimnya sebagai angka (*number*), bukan teks (🔁 langkah 5).

#### 8.3 Pintu riwayat menerima `bucket`: `src/routes/perangkat.ts`

Ada tujuh perubahan di `src/routes/perangkat.ts`. Hasil akhirnya bisa dibandingkan dengan file [`perangkat.ts` akhir](kode/backend/src/routes/perangkat.ts).

1. Di baris paling atas, ubah komentarnya menjadi:

   ```ts
   // perangkat.ts - rute /devices: daftar perangkat, bacaan terbaru, riwayat dari database (mentah atau ringkasan),
   // dan perintah.
   ```

2. Ubah baris impor dari buku arsip supaya ikut mengambil `ambilRingkasan`:

   ```ts
   import { ambilRingkasan, ambilRiwayat, arsipkanPerintah, waktuKontrak } from "../db/arsip.ts";
   ```

3. Di bawah baris-baris `import`, tambahkan **kamus ember** dan fungsi **`hitungRentang`**:

   ```ts
   const MENIT = 60 * 1000; // dalam milidetik, seperti Date.getTime()
   const JAM = 60 * MENIT;
   const HARI = 24 * JAM;
   const BATAS_EMBER = 1000; // paling banyak 1.000 ember (titik grafik) per permintaan

   // Kamus ember: lebar satu ember, rentang bawaan kalau from tidak diisi, dan geseran supaya hari dimulai 00.00 WIB.
   const EMBER = {
     "15m": { lebar: 15 * MENIT, bawaan: HARI, geser: 0 },
     "1h": { lebar: JAM, bawaan: 7 * HARI, geser: 0 },
     "1d": { lebar: HARI, bawaan: 30 * HARI, geser: 7 * JAM }, // WIB = UTC + 7 jam
   };

   // Rentang yang sebenarnya ditanyakan. to kosong = sekarang. from kosong = 1 jam sebelum to (bacaan mentah) atau
   // rentang bawaan embernya. Dengan bucket, awal rentang dibulatkan ke bawah ke awal ember supaya ember pertama utuh.
   function hitungRentang(q: { from?: string; to?: string; bucket?: keyof typeof EMBER }) {
     const sampai = q.to ? new Date(q.to) : new Date();
     if (q.bucket === undefined) {
       return { dari: q.from ? new Date(q.from) : new Date(sampai.getTime() - JAM), sampai };
     }
     const { lebar, bawaan, geser } = EMBER[q.bucket];
     const awal = q.from ? new Date(q.from).getTime() : sampai.getTime() - bawaan;
     return { dari: new Date(Math.floor((awal + geser) / lebar) * lebar - geser), sampai }; // misalnya 10.37 -> 10.30
   }
   ```

4. Di bawah baris `const Jenis = …;`, tambahkan pilihan ember untuk Zod:

   ```ts
   const Ember = z.enum(["15m", "1h", "1d"]);
   ```

5. Ganti seluruh `const Rentang = …;`, mulai dari `const Rentang = z.object({` sampai `});` penutupnya, dengan versi baru ini:

   ```ts
   const Rentang = z.object({
     from: z.iso.datetime({ offset: true }).optional()
       .describe("awal rentang, misalnya 2026-10-20T10:00:00+07:00 (bawaan: 1 jam sebelum to; dengan bucket: 1, 7, atau 30 hari)"),
     to: z.iso.datetime({ offset: true }).optional().describe("akhir rentang, tidak ikut dihitung (bawaan: sekarang)"),
     bucket: Ember.optional()
       .describe("ringkas per 15 menit (15m), per jam (1h), atau per hari WIB (1d); tanpa bucket = bacaan mentah"),
   }).refine((r) => !r.from || !r.to || new Date(r.from) < new Date(r.to), { // rentang terbalik ditolak dengan kode 400
     message: "harus lebih akhir daripada from", path: ["to"],
     when: (hasil) => hasil.issues.length === 0, // urutan diperiksa hanya kalau from dan to sudah lolos pemeriksaan format
   }).refine((r) => { // ringkasan dengan terlalu banyak ember juga ditolak dengan kode 400
     if (r.bucket === undefined) return true; // bacaan mentah sudah dibatasi 1.000 bacaan oleh ambilRiwayat
     const { dari, sampai } = hitungRentang(r);
     return Math.ceil((sampai.getTime() - dari.getTime()) / EMBER[r.bucket].lebar) <= BATAS_EMBER;
   }, {
     message: `rentang terlalu panjang: paling banyak ${BATAS_EMBER} ember (15m sekitar 10 hari, 1h sekitar 41 hari, `
       + "1d sekitar 2,7 tahun)",
     path: ["from"],
     when: (hasil) => hasil.issues.length === 0,
   });
   ```

6. Di bawah `const Bacaan = …;`, tambahkan bentuk satu titik ringkasan:

   ```ts
   const TitikRingkasan = z.object({
     waktu: z.string(), suhu_rata: angka, suhu_min: angka, suhu_maks: angka, kelembapan_rata: angka, tanah_rata: angka,
     cahaya_rata: angka, jumlah_bacaan: z.number(),
   });
   ```

7. Ganti seluruh rute `app.get("/devices/:id/readings", …)`, mulai dari baris itu sampai `});` penutupnya (tepat di atas `app.post("/devices/:id/command", …)`), dengan:

   ```ts
     app.get("/devices/:id/readings", {
       schema: {
         tags: ["perangkat"],
         summary: "Riwayat satu perangkat dari database: bacaan mentah (paling banyak 1.000) atau ringkasan per ember",
         params: ParamId,
         querystring: Rentang,
         response: {
           200: z.union([
             z.object({
               device_id: z.string(), dari: z.string(), sampai: z.string(), jumlah: z.number(), terpotong: z.boolean(),
               bacaan: z.array(Bacaan),
             }),
             z.object({
               device_id: z.string(), dari: z.string(), sampai: z.string(), ember: Ember, jumlah: z.number(),
               ringkasan: z.array(TitikRingkasan),
             }),
           ]).describe("tanpa bucket: bacaan mentah, terpotong = ada lebih dari 1.000 bacaan; dengan bucket: satu titik "
             + "ringkasan per ember. Keduanya terlama lebih dulu"),
           503: Galat.describe("database sedang tidak bisa dihubungi"),
         },
       },
     }, async (req, reply) => {
       const { dari, sampai } = hitungRentang(req.query);
       const ember = req.query.bucket;
       try {
         if (ember !== undefined) {
           const ringkasan = await ambilRingkasan(req.params.id, dari, sampai, ember);
           return {
             device_id: req.params.id, dari: waktuKontrak(dari), sampai: waktuKontrak(sampai), ember, jumlah: ringkasan.length,
             ringkasan,
           };
         }
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

Inilah yang baru:

- **Kamus `EMBER`** adalah kamus dari 🔁 langkah 1, kini dengan `geser` untuk hari WIB. **`hitungRentang`** memakai trik 🔁 langkah 2 dan 4: tanpa `bucket`, rentangnya tetap seperti Modul 17; dengan `bucket`, awal rentang dibulatkan ke bawah ke awal ember (`Math.floor`), dan untuk `1d` digeser 7 jam dulu supaya hari dimulai pukul 00.00 WIB.
- **`bucket: Ember.optional()`**: Zod hanya menerima `15m`, `1h`, atau `1d`. Nilai lain ditolak dengan `400` sebelum satu kueri pun sampai ke database.
- **`.refine(…)` kedua** menghitung banyaknya ember dengan `Math.ceil` (🔁 langkah 3). Lebih dari 1.000 ember ditolak dengan `400`. Pilihan `when` memastikan pemeriksaan ini hanya berjalan kalau `from`, `to`, dan `bucket` sudah lolos pemeriksaan sebelumnya.
- **`z.union([… , …])`** di bagian `response`: jawaban `200` kini punya dua bentuk, "bacaan mentah" atau "ringkasan", dan keduanya tercantum di `/docs`.
- Di dalam rute, **`if (ember !== undefined)`** memilih jalur ringkasan. Tanpa `bucket`, kodenya sama persis dengan Modul 17.

#### 8.4 `server.ts` v0.3

Di `src/server.ts`, ubah komentar baris pertama:

```ts
// server.ts - pintu masuk backend Rumah Pintar Mini v0.3 (Modul 18: riwayat bisa diringkas per 15 menit, jam, dan hari).
```

Lalu, di dalam `await app.register(swagger, { … })`, ubah baris `openapi` supaya `/docs` menyebut versi baru:

```ts
openapi: { info: { title: "Rumah Pintar Mini API", description: "Backend v0.3 (Modul 18)", version: "0.3.0" } },
```

#### 8.5 Jalankan

Di terminal kedua, periksa tipenya:

```text
npm run cek
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.3.0 cek
> tsc --noEmit
```

Tidak ada baris lain, artinya bersih. Lalu, di terminal pertama (folder `backend`), jalankan `npm run dev`. **Hasilnya** (contoh; jam dan alamat brokermu berbeda):

```text
[22:30:09] INFO: database siap
[22:30:09] INFO: Server listening at http://127.0.0.1:8080
[22:30:09] INFO: dokumentasi API: http://127.0.0.1:8080/docs
[22:30:09] INFO: tersambung ke broker mqtt://127.0.0.1:1883
```

Baris terakhir hanya muncul kalau broker menyala. Tanpa broker, backend tetap bisa menjawab semua pertanyaan riwayat dari database.

#### 8.6 ⭐ Tanya ringkasannya lewat browser

Seperti di Praktik 3, contoh ini memakai data latihan dan hari H = 20 Oktober 2026. Ganti tanggal-tanggal di alamatnya dengan tanggal H-mu: `2026-10-13` dengan H-7, `2026-10-19` dengan H-1, dan `2026-10-20` dengan H.

**1. Per jam, tujuh hari penuh.** Buka alamat ini di browser:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=1h&from=2026-10-13T00:00:00%2B07:00&to=2026-10-20T00:00:00%2B07:00
```

**Hasilnya** (dirapikan dan dipendekkan):

```text
{
  "device_id": "f00d00000001",
  "dari": "2026-10-12T17:00:00Z",
  "sampai": "2026-10-19T17:00:00Z",
  "ember": "1h",
  "jumlah": 168,
  "ringkasan": [
    {"waktu": "2026-10-12T17:00:00Z", "suhu_rata": 23.1, "suhu_min": 22.7, "suhu_maks": 23.3, "kelembapan_rata": 79.7,
     "tanah_rata": 61.5, "cahaya_rata": 22.3, "jumlah_bacaan": 6},
    … 167 titik lagi …
  ]
}
```

Tujuh hari × 24 jam = **168 titik**, satu per jam, semuanya dibaca dari buku ringkasan. Setiap titik memuat suhu rata-rata, terendah, dan tertinggi; rata-rata kelembapan, tanah, dan cahaya; serta banyaknya bacaan. Seperti di Modul 17, semua waktu ditulis dalam UTC: titik pertama `2026-10-12T17:00:00Z` adalah pukul 00.00 WIB tanggal 13.

**2. Per hari, tujuh hari penuh.** Ganti `1h` dengan `1d` di alamat yang sama:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=1d&from=2026-10-13T00:00:00%2B07:00&to=2026-10-20T00:00:00%2B07:00
```

**Hasilnya:** `"ember":"1d"` dan `"jumlah":7`. Ketujuh titiknya, kalau dirangkum:

| `waktu` (UTC) | Hari WIB | `suhu_rata` | `suhu_min` | `suhu_maks` | `jumlah_bacaan` |
| :--- | :--- | ---: | ---: | ---: | ---: |
| `2026-10-12T17:00:00Z` | 13 Oktober | `26.2` | `21.8` | `30.6` | `144` |
| `2026-10-13T17:00:00Z` | 14 Oktober | `25.6` | `21.1` | `30` | `144` |
| `2026-10-14T17:00:00Z` | 15 Oktober | `26.5` | `22` | `30.8` | `144` |
| `2026-10-15T17:00:00Z` | 16 Oktober | `27.1` | `22.6` | `31.6` | `144` |
| `2026-10-16T17:00:00Z` | 17 Oktober | `26.7` | `22.3` | `31.1` | `144` |
| `2026-10-17T17:00:00Z` | 18 Oktober | `25.8` | `21.4` | `30.2` | `144` |
| `2026-10-18T17:00:00Z` | 19 Oktober | `26.3` | `22` | `30.6` | `144` |

Kolom `suhu_rata` ini sudah kamu lihat dua kali: di tabel syarat lulus Modul 17 Praktik 4.5, dan di Praktik 3.4 modul ini. Kini angka yang sama datang dari API, dihitung dari buku ringkasan per jam dengan rumus `rata × n`. Setiap hari dimulai pukul 17.00 UTC, yaitu 00.00 WIB, berkat `geser` di kamus `EMBER` dan `'Asia/Jakarta'` di kueri `1d`.

**3. Per 15 menit, satu jam pagi.** Ganti `2026-10-19` dengan tanggal H-1-mu di kedua tempat:

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=15m&from=2026-10-19T06:00:00%2B07:00&to=2026-10-19T07:00:00%2B07:00
```

**Hasilnya** (dipendekkan): empat titik dengan `suhu_rata` `23.6`, `23.4`, `24.2`, dan `23.8`, serta `jumlah_bacaan` `2`, `1`, `2`, dan `1`. Persis seperti `time_bucket` di Praktik 3.2.

**4. Tanpa `from`.** Rentang bawaan berlaku. Coba perangkat uji:

```text
http://127.0.0.1:8080/devices/beef00000001/readings?bucket=1h
```

**Hasilnya** (contoh, dipendekkan):

```text
{"device_id":"beef00000001","dari":"2026-10-13T15:00:00Z","sampai":"2026-10-20T15:30:22Z","ember":"1h","jumlah":169,
"ringkasan":[{"waktu":"2026-10-13T15:00:00Z","suhu_rata":25.5, … ,"jumlah_bacaan":360}, … ]}
```

Rentang bawaan `1h` adalah tujuh hari sampai sekarang. `sampai` adalah saat kamu bertanya (di contoh ini `15:30:22Z`, pukul 22.30 WIB), sedangkan `dari` dibulatkan ke bawah ke awal jam: `15:00:00Z`, bukan `15:30:22Z`. Karena itu, ember pertama selalu utuh, dan jumlahnya 169 titik, bukan 168. Kalau data ujimu dimuat beberapa hari lalu, titiknya lebih sedikit karena jam-jam sesudah kamu memuatnya memang tidak punya bacaan. Kalau Node 1 atau simulator sedang menyala, coba juga alamat yang sama dengan `device_id`-nya, lalu muat ulang setelah beberapa menit: `jumlah_bacaan` pada titik terakhir terus bertambah karena jam yang sedang berjalan dihitung langsung dari bacaan mentah (ringkasan *real-time*, Praktik 5.5).

**5. Pertanyaan yang ditolak.** Ketiganya dijawab `400` dengan `"code":"FST_ERR_VALIDATION"`:

- **Ember yang tidak tersedia**: `http://127.0.0.1:8080/devices/f00d00000001/readings?bucket=5m`. `message`-nya `querystring/bucket Pilihan tidak valid: diharapkan salah satu dari "15m"|"1h"|"1d"`. Huruf besar (`1H`) dan `bucket=` kosong juga ditolak dengan pesan yang sama.
- **Terlalu banyak ember**: `http://127.0.0.1:8080/devices/beef00000001/readings?bucket=15m&from=2026-09-20T00:00:00%2B07:00` (sebulan dalam ember 15 menit, hampir 3.000 ember). `message`-nya `querystring/from rentang terlalu panjang: paling banyak 1000 ember (15m sekitar 10 hari, 1h sekitar 41 hari, 1d sekitar 2,7 tahun)`. Rentang yang sama dengan `bucket=1d` lolos.
- **Rentang terbalik**, sama seperti Modul 17: `message`-nya `querystring/to harus lebih akhir daripada from`.

**6. Tanpa `bucket`, semuanya seperti dulu.** Buka alamat contoh Modul 17 Praktik 7.3 langkah 2 (ganti tanggalnya dengan H-1-mu):

```text
http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-19T06:00:00%2B07:00&to=2026-10-19T07:00:00%2B07:00
```

**Hasilnya** sama persis dengan Modul 17: `"jumlah":6`, `"terpotong":false`, dan enam bacaan mentah. Aplikasi yang sudah memakai API v0.2 tidak perlu diubah.

#### 8.7 Parameter barunya di `/docs`

Buka `http://127.0.0.1:8080/docs`. Lencana versi di samping judul `Rumah Pintar Mini API` kini `0.3.0`, dan keterangan di bawahnya kini `Backend v0.3 (Modul 18)`. Klik baris **GET** `/devices/{id}/readings`. Ringkasannya berubah menjadi `Riwayat satu perangkat dari database: bacaan mentah (paling banyak 1.000) atau ringkasan per ember`, dan di bagian **Parameters** ada kolom baru **`bucket`** (bertanda `query`), lengkap dengan keterangannya. Karena `bucket` hanya punya tiga pilihan, Swagger UI menuliskan `Available values : 15m, 1h, 1d` dan menampilkannya sebagai daftar pilihan (*dropdown*) berisi `--`, `15m`, `1h`, dan `1d`, bukan kotak isian bebas. Pilihan `--` berarti `bucket` tidak dikirim sehingga jawabannya bacaan mentah.

Coba langsung: klik **Try it out**, pilih `1d` di `bucket`, isi `id` dengan `f00d00000001`, isi `from` dengan `2026-10-13T00:00:00+07:00` dan `to` dengan `2026-10-20T00:00:00+07:00` (pakai tanggal H-7 dan H-mu), lalu klik **Execute**. **Server response** menampilkan kode `200` dan tujuh titik yang sama dengan langkah 2 di 8.6. Di bagian **Responses**, **Example Value** untuk kode `200` hanya memperlihatkan bentuk pertama, yaitu bacaan mentah. Klik **Schema** di sebelahnya: di sana tertulis `anyOf`, diikuti dua bentuk `{...}` yang bisa dibuka satu per satu. Itulah kedua bentuk jawaban dari `z.union`: bacaan mentah dan ringkasan.

![Mencoba bucket=1d langsung dari /docs: dua potongan tangkapan layar asli Swagger UI backend v0.3, setelah Try it out diklik, bucket 1d dipilih, from, to, dan id diisi, lalu Execute diklik, dengan empat nomor dan satu sisipan kecil. Atas, baris rute GET /devices/{id}/readings dengan ringkasan riwayat satu perangkat dari database, bacaan mentah (paling banyak 1.000) atau ringkasan per ember, serta tombol Cancel. Bagian Parameters, nomor 1, memuat from, string($date-time), (query), awal rentang, misalnya 2026-10-20T10:00:00+07:00, dengan bawaan 1 jam sebelum to atau, dengan bucket, 1, 7, atau 30 hari, diisi 2026-10-13T00:00:00+07:00; to, string($date-time), (query), akhir rentang, tidak ikut dihitung, dengan bawaan sekarang, diisi 2026-10-20T00:00:00+07:00; bucket, string, (query), ringkas per 15 menit (15m), per jam (1h), atau per hari WIB (1d), tanpa bucket = bacaan mentah, dengan daftar pilihan berisi 1d yang ditunjuk panah oranye, sedangkan nama bucket diberi garis tepi oranye; dan id, bertanda bintang dan required, string, (path), device_id perangkat, misalnya a4cf12e5b7c0, diisi f00d00000001. Di bawahnya tombol biru Execute, nomor 2, di samping Clear. Bawah, Request URL, nomor 3, http://127.0.0.1:8080/devices/f00d00000001/readings?from=2026-10-13T00%3A00%3A00%2B07%3A00&to=2026-10-20T00%3A00%3A00%2B07%3A00&bucket=1d, dengan bucket=1d digarisbawahi. Lalu Server response, nomor 4: Code 200 dan Response body yang diawali device_id f00d00000001, dari 2026-10-12T17:00:00Z, sampai 2026-10-19T17:00:00Z, ember 1d dan jumlah 7 (keduanya digarisbawahi), lalu ringkasan dengan titik pertama waktu 2026-10-12T17:00:00Z dan suhu_rata 26.2 (keduanya digarisbawahi), suhu_min 21.8, suhu_maks 30.6, kelembapan_rata 76.3, tanah_rata 58.6, cahaya_rata 1112.1, dan jumlah_bacaan 144. Keterangan kanan nomor 1, Parameters: bucket bertanda (query) dan tidak wajib, daftar pilihannya berisi --, 15m, 1h, dan 1d, dan yang dipilih 1d. Sisipan kecil di bawahnya memperlihatkan baris bucket sebelum Try it out diklik, yaitu tulisan Available values : 15m, 1h, 1d dan daftar pilihan abu-abu yang masih berisi --. Nomor 2, Execute, mengirim permintaan GET ke backend v0.3, dan tanda + di kotak isian boleh ditulis apa adanya. Nomor 3, Request URL, memuat bucket=1d di ujung alamat; tanda + dan titik dua dibungkus Swagger UI menjadi %2B dan %3A. Nomor 4, Server response, kode 200, ember 1d, dan jumlah 7; titik pertama 2026-10-12T17:00:00Z adalah pukul 00.00 WIB tanggal 13, dengan suhu_rata 26.2. Catatan bawah: ketujuh titiknya sama dengan langkah 2 di 8.6; data latihan perangkat f00d00000001 tanggalnya mengikuti hari H-mu dengan angka yang sama; kotak jawaban bisa digulir untuk enam titik lainnya.](aset/swagger-ember.png)

#### 8.8 Simpan permintaannya di Bruno

1. Di Bruno, buka permintaan **riwayat Node 1** dari Modul 17, lalu klik kanan **tab**-nya dan pilih **Clone Request**. Ubah **Request Name** menjadi `riwayat per jam Node 1`, lalu klik **Clone**.
2. Di tab baru itu, tambahkan `?bucket=1h` di ujung URL sehingga menjadi `{{baseUrl}}/devices/a4cf12e5b7c0/readings?bucket=1h` (dengan `device_id` Node 1-mu). Tab **Params** langsung memuat baris `bucket` bernilai `1h`.
3. Tab **Assert** sudah ikut tersalin: `res.status` `eq` `200` dan `res.body.jumlah` `gt` `0`.
4. Simpan (**Ctrl + S**), lalu klik **Send**. Tab **Tests** di panel jawaban berisi `Assertions (2), Passed: 2, Failed: 0`.

Tes kedua lolos selama ada bacaan Node 1 dalam tujuh hari terakhir. Kalau minggu ini Node 1 belum pernah menyala, nyalakan sebentar Node 1 atau simulatornya, atau ganti `device_id` di URL dengan `f00d00000001`.

#### 8.9 Simpan ke cabang

Di terminal kedua (folder `backend`):

```text
git add .
git status
git commit -m "backend v0.3: riwayat per ember (Modul 18 Praktik 8)"
git push
```

Di bagian `Changes to be committed`, `git status` harus menyebut lima file yang berubah (`package.json`, `package-lock.json`, `src/db/arsip.ts`, `src/routes/perangkat.ts`, dan `src/server.ts`) dan satu file baru (`bruno/riwayat per jam Node 1.yml`). Folder `backup/` tidak ikut, berkat `.gitignore` dari Praktik 7.

> [!TIP]
> **Tidak jalan?**
>
> - `npm run cek` menulis `error TS2741: Property '"1d"' is missing in type …` → salah satu kunci di `KUERI_RINGKASAN` terlewat. Kalau kuncinya salah ketik (misalnya `"1D"`), pesannya lain: `error TS2353: Object literal may only specify known properties, and '"1D"' does not exist in type 'Record<Ember, string>'`. Bandingkan dengan blok di 8.2.
> - `bucket=1h` atau `bucket=1d` dijawab `503` padahal `/health` menjawab `"database":true` → buku ringkasan `readings_per_jam` belum ada di database ini (migrasi 003 belum dijalankan). Log backend menulis `relation "readings_per_jam" does not exist`. Jalankan Praktik 5.2 dan 5.4.
> - `bucket=1h` untuk data latihan menjawab angka yang berbeda dari 8.6 langkah 1 → tanggal di alamat belum diganti dengan tanggal H-mu, atau kamu mengisi ulang data latihan sesudah Praktik 5 (🚨 membahasnya).
> - Semua alamat dijawab `"jumlah":0` → `device_id` salah ketik, atau rentangnya tidak berisi data. Periksa tanggalnya.
> - Tes Bruno `res.body.jumlah gt 0` gagal → tidak ada bacaan Node 1 dalam tujuh hari terakhir. Lihat catatan di bawah 8.8.

> ➡️ **Selesai Praktik 8?** Kerjakan Tingkat 1 dari [🧩 Tantangan mandiri](#-tantangan-mandiri), lalu langkah A dan B di [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini): di sana backend v0.3 digabung ke `main` lewat *pull request*. Tingkat 2 dan 3 dikerjakan sesudah itu, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul masalah yang paling mirip dengan yang kamu alami. Untuk hampir semua masalah di modul ini, tiga pemeriksaan ini menunjukkan letak masalahnya: **`docker ps`** (kontainer `rumahpintar-db` menyala?), **`SELECT * FROM schema_migrations;`** di psql (migrasi mana saja yang sudah tercatat?), dan **`docker logs --tail 30 rumahpintar-db`** (apa kata PostgreSQL dan TimescaleDB?). Masalah Docker, port, dan sandi database dibahas di 🚨 Modul 17. Untuk galat TypeScript dari `npm run cek`, bandingkan file-mu dengan [`kode/backend/`](kode/backend/), lalu lihat juga 🚨 Modul 16.

<details>
<summary><b>Migrasi <code>002_hypertable.sql</code> gagal, atau <code>readings</code> telanjur menjadi hypertable</b></summary>

| Gejala | Penyebab | Obat |
| :--- | :--- | :--- |
| `npm run migrasi` menjawab `GAGAL di 002_hypertable.sql: table "readings" is already a hypertable`. | Isi `002` sudah pernah kamu jalankan sendiri di psql atau DBeaver, jadi `readings` sudah menjadi hypertable, tetapi buku catatan migrasi belum tahu. | Catat migrasinya sebagai sudah diterapkan, di psql: `INSERT INTO schema_migrations (versi) VALUES ('002_hypertable.sql');`. Lalu jalankan lagi `npm run migrasi`: jawabannya kini `0 migrasi baru diterapkan, 2 sudah ada sebelumnya.` |
| Saat isi `002` dijalankan langsung di psql: `ERROR:  LOCK TABLE can only be used in transaction blocks`. | `LOCK TABLE` hanya berlaku di dalam transaksi, dan psql menjalankan setiap kalimat sendiri-sendiri. | Jangan jalankan migrasi dengan tangan. Pakai `npm run migrasi`, yang membungkus setiap file dengan `BEGIN … COMMIT`. Kalau kalimat `create_hypertable` sesudahnya sempat berhasil (`(1,t)`), `readings` sudah menjadi hypertable: obati dengan baris pertama tabel ini. |
| `npm run migrasi` menjawab `GAGAL di 002_hypertable.sql: table "readings" is not empty` (di psql: `ERROR:  table "readings" is not empty`, disertai `HINT:  You can migrate data by specifying 'migrate_data => true' …`). | Bagian `migrate_data => true` terlewat, padahal `readings` sudah berisi data. | Salin ulang isi `002_hypertable.sql` dari Praktik 2.1, lalu jalankan lagi `npm run migrasi`. Migrasi yang gagal tidak tercatat, jadi aman diulang. |

Cara "catat sebagai sudah diterapkan" yang sama berlaku untuk migrasi lain yang telanjur kamu jalankan dengan tangan. Misalnya, `GAGAL di 004_retensi.sql: retention policy already exists for hypertable "readings"` diobati dengan `INSERT INTO schema_migrations (versi) VALUES ('004_retensi.sql');`. Pastikan dulu isinya memang sudah berlaku, misalnya dengan melihat daftar *job* di Praktik 6.3.

</details>

<details>
<summary><b>Buku ringkasan kosong, tidak lengkap, atau angkanya berbeda dari data mentah</b></summary>

- **Perangkat uji hanya punya 72 baris ringkasan.** Petugas hanya meringkas tiga hari terakhir. Jalankan sekali `CALL refresh_continuous_aggregate('readings_per_jam', NULL, now() - INTERVAL '1 hour');` seperti di Praktik 5.4 **asal retensi (Praktik 6) belum dipasang**. Kalau retensi sudah telanjur bekerja, lihat bagian lipat berikutnya.
- **`ERROR:  refresh window too small`**, disertai `DETAIL:  The refresh window must cover at least one bucket of data.` Jendela yang kamu minta lebih pendek daripada satu ember (satu jam). Periksa kedua batas waktunya: awal jendela harus paling sedikit dua jam sebelum akhirnya.
- **Angka ringkasan untuk jam-jam lama berbeda dari data mentah.** Data mentah lama diubah sesudah diringkas, misalnya karena kamu mengosongkan lalu mengisi ulang data latihan (Kemenangan Cepat langkah 2) sesudah Praktik 5, pada hari yang berbeda. Petugas hanya meringkas ulang tiga hari terakhir, jadi jam-jam yang lebih tua tetap memakai angka lama. Ringkas ulang delapan hari terakhir:

  ```sql
  CALL refresh_continuous_aggregate('readings_per_jam', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');
  ```

  Jendela ini aman karena seluruhnya masih di dalam batas retensi 90 hari.
- **`docker logs rumahpintar-db` penuh baris seperti `LOG:  continuous aggregate refresh (individual invalidation) on "readings_per_jam" in window [ … ]`.** Itu catatan kerja petugas ringkasan, wajar. Kalau ada juga `could not refresh continuous aggregate "readings_per_jam" due to a concurrent refresh`, petugas kebetulan bekerja bersamaan dengan `CALL refresh_continuous_aggregate(…)` milikmu. Biasanya perintahmu tetap berhasil, dan petugas mencoba lagi pada jadwal berikutnya. Kalau justru perintahmu yang gagal dengan pesan serupa, ulangi saja beberapa detik kemudian.

</details>

<details>
<summary><b>Ringkasan lama hilang setelah <code>refresh_continuous_aggregate</code> dengan awal <code>NULL</code></b></summary>

Inilah jebakan dari Konsep 7. Kalau `CALL refresh_continuous_aggregate('readings_per_jam', NULL, …)` dijalankan **sesudah** retensi bekerja, TimescaleDB menghitung ulang semua jam dari data mentah. Untuk jam-jam yang lebih tua daripada 90 hari, data mentahnya sudah dibuang, jadi ringkasannya ikut dihapus. Di laptop lab, ringkasan perangkat uji turun dari 2.881 menjadi 2.176 baris, dan ringkasan yang lebih tua daripada 90 hari tinggal 16 dari 721.

**Pencegahannya**: sesudah Praktik 6, jangan pernah lagi memakai `NULL` sebagai awal jendela. Kalau perlu meringkas ulang, pakai awal yang masih di dalam 90 hari, misalnya `now() - INTERVAL '8 days'`.

**Kalau sudah telanjur**: ringkasan itu tidak bisa dibuat ulang dari data mentah karena data mentahnya sudah tidak ada. Untuk modul ini, ringkasan perangkat uji yang hilang tidak mengganggu praktik berikutnya, jadi kamu boleh melanjutkan. Satu-satunya jalan untuk mendapatkannya kembali adalah backup yang dibuat **sebelum** kejadian, misalnya dari Praktik 7. Pulihkan ke database baru seperti Praktik 7.4, lalu periksa isinya di sana. Itulah gunanya backup.

</details>

<details>
<summary><b>Retensi atau columnstore tampak tidak bekerja</b></summary>

| Gejala | Penyebab | Obat |
| :--- | :--- | :--- |
| Sesudah `npm run migrasi`, jumlah jilid masih 121, atau ukurannya masih 152 MB. | *Job*-nya belum sempat berjalan. Biasanya hanya butuh beberapa detik. | Tunggu sebentar, lalu periksa lagi. Kamu juga bisa menjalankannya sekarang dengan `CALL run_job(1001);` (retensi) atau `CALL run_job(1002);` (columnstore). Nomornya ada di kolom `job_id` daftar *job*. |
| `CALL run_job(1001);` menjawab `CALL`, tetapi tidak ada yang berubah, dan `total_runs` di `job_stats` tetap. | *Job*-nya sudah bekerja sendiri sesaat setelah dipasang, jadi tidak ada lagi yang perlu dibuang. Selain itu, `run_job` dijalankan di sesimu sendiri dan tidak dicatat di `job_stats`. | Tidak perlu diobati. |
| Bacaan tertua berumur lebih dari 90 hari, bahkan sampai hampir 92 hari. | Retensi membuang jilid **utuh**, dan petugasnya hanya bekerja sekali sehari. Jilid yang sebagian isinya masih lebih muda daripada 90 hari menunggu giliran besok. | Tidak perlu diobati (Konsep 7). |
| `GAGAL di 005_columnstore.sql: columnstore policy already exists for hypertable or continuous aggregate "readings"`. | Isi `005` sudah pernah kamu jalankan sendiri di psql. | Catat sebagai sudah diterapkan: `INSERT INTO schema_migrations (versi) VALUES ('005_columnstore.sql');`. |

</details>

<details>
<summary><b>Backup atau restore bermasalah</b></summary>

| Gejala | Penyebab | Obat |
| :--- | :--- | :--- |
| `pg_dump: error: could not open output file "C:/Users/<nama>/AppData/Local/Temp/rumahpintar.dump": No such file or directory` | Terminalnya **Git Bash**, yang mengubah setiap argumen berawalan `/tmp/…` menjadi folder Temp Windows sebelum sampai ke Docker. | Pakai terminal PowerShell, atau tulis dua garis miring: `//tmp/rumahpintar.dump`. Cara yang sama berlaku untuk `pg_restore`, `psql -f`, dan `rm` di Praktik 7.6. |
| `pg_restore: error: input file does not appear to be a valid archive`, dan berkas backup-nya hampir dua kali lebih besar daripada 5 MB. | Backup dibuat dengan `>` di Windows PowerShell 5.1, yang menulis ulang isinya sebagai teks UTF-16. | Buat ulang backup dengan cara Praktik 7.3: `-f /tmp/…` lalu `docker cp`. |
| `pg_restore: error: could not open input file "/tmp/pulih.dump": No such file or directory` | Langkah pertama Praktik 7.4 (`docker cp` berkas backup ke kontainer) terlewat atau gagal. | Ulangi `docker cp backup/… rumahpintar-db:/tmp/pulih.dump` dengan nama berkasmu. |
| `createdb: error: database creation failed: ERROR:  database "rumahpintar_pulih" already exists` | Sisa percobaan sebelumnya. | Jalankan `docker exec rumahpintar-db dropdb -U postgres rumahpintar_pulih`, lalu ulangi Praktik 7.4 dari `createdb`. |
| `ERROR:  extension "timescaledb" already exists` | `createdb` dijalankan tanpa `-T template0`, jadi database baru sudah membawa TimescaleDB dari cetakan bawaan. | Buang database itu dengan `dropdb`, lalu ulangi Praktik 7.4 dari `createdb`. |

**Lupa `timescaledb_pre_restore()`.** `pg_restore` menulis tiga galat, lalu menutupnya dengan peringatan:

```text
pg_restore: error: COPY failed for table "_hyper_1_100_chunk": ERROR:  could not find hypertable with id 1
DETAIL:  Assertion 'ht' failed.
CONTEXT:  COPY _hyper_1_100_chunk, line 1
pg_restore: error: could not execute query: ERROR:  ONLY option not supported on hypertable operations
Command was: ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_pkey PRIMARY KEY (device_id, ts);


pg_restore: error: could not execute query: ERROR:  ONLY option not supported on hypertable operations
Command was: ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(device_id);


pg_restore: warning: errors ignored on restore: 3
```

Sekilas hasilnya hampir benar: jumlah bacaannya kurang **satu** (bacaan terlambat dari Praktik 6.7 yang tersimpan di bagian jilid yang belum dipadatkan), dan sidik jarinya berbeda. Yang lebih berbahaya tidak terlihat dari jumlah baris: `\d readings` di database itu hanya memuat `readings_ts_idx`, tanpa kunci utama dan tanpa kunci tamu, dua penjaga yang dibangun di Modul 17. Buang database salinan itu dengan `dropdb`, lalu ulangi Praktik 7.4 dari `createdb`, kali ini lengkap.

**Lupa `timescaledb_post_restore()`.** Tidak ada galat sama sekali, tetapi database salinan masih dalam "mode restore":

- `SHOW timescaledb.restoring;` menjawab `on`.
- `SELECT count(*) FROM readings;` hanya menghitung bacaan di jilid yang belum dipadatkan, misalnya **68.190**, bukan 785.394.
- *Job*-nya tidak pernah berjalan, dan bacaan baru yang ditulis ke database ini menghilang dari pandangan setelah `post_restore` akhirnya dijalankan.

Obatnya: jalankan perintah keenam Praktik 7.4 (`SELECT timescaledb_post_restore();`), lalu ulangi kueri bukti. Itulah juga alasan backend harus dimatikan selama restore: jangan biarkan apa pun menulis ke database yang sedang dipulihkan.

**Versi TimescaleDB harus sama.** Database tujuan restore harus memakai TimescaleDB versi yang sama dengan database asal (Konsep 9). Di modul ini keduanya berada di kontainer yang sama, jadi syarat itu otomatis terpenuhi. Saat memulihkan ke komputer atau server lain, pakai image yang sama persis, `timescale/timescaledb:2.30.2-pg17`.

</details>

<details>
<summary><b>Backend v0.3 menjawab <code>503</code>, <code>400</code>, atau angka yang aneh</b></summary>

| Gejala | Penyebab | Obat |
| :--- | :--- | :--- |
| `bucket=1h` dan `bucket=1d` dijawab `503` `{"pesan":"database sedang tidak bisa dihubungi, coba lagi sebentar lagi"}`, padahal `/health` menjawab `"database":true` dan `bucket=15m` menjawab `200`. Log backend menulis `ERROR: riwayat f00d00000001 gagal dibaca dari database: relation "readings_per_jam" does not exist`. | Database ini belum punya buku ringkasan: migrasi `003` belum dijalankan, atau backend tersambung ke database lain (periksa `DATABASE_URL` di `.env`). Backend v0.3 menjawab setiap galat database dengan `503`, jadi log-lah yang menyebut penyebab sebenarnya. | Jalankan Praktik 5.2 dan 5.4. |
| `400` dengan `rentang terlalu panjang: paling banyak 1000 ember …`. | Rentangnya menghasilkan lebih dari 1.000 ember. | Perkecil rentangnya, atau pakai ember yang lebih lebar (`1h` atau `1d`). |
| Pada `bucket=1d`, `waktu` setiap titik berakhiran `T00:00:00Z` (pukul 07.00 WIB), bukan `T17:00:00Z`. | Hari dihitung menurut UTC: `'Asia/Jakarta'` di kueri `1d` terlewat. | Bandingkan dengan blok di Praktik 8.2. |
| Pada `bucket=1d`, `waktu` sudah berakhiran `T17:00:00Z`, tetapi `dari` berakhiran `T00:00:00Z`, dan titik pertama bisa hanya berisi bacaan sejak pukul 07.00 WIB. | `geser: 7 * JAM` di kamus `EMBER` terlewat, jadi awal rentang dibulatkan ke awal hari UTC, bukan hari WIB. | Bandingkan dengan blok di Praktik 8.3. |
| Semua jawaban berisi `"jumlah":0`. | `device_id` salah ketik, atau rentangnya tidak berisi data. Data latihan hanya mencakup tujuh hari sebelum hari H (ditambah hari H sampai jam kamu mengisinya), dan data uji 120 hari sebelum kamu memuatnya. Sesudah retensi di Praktik 6, bacaan mentahnya, yang dipakai tanpa `bucket` dan oleh `bucket=15m`, tinggal 90 hari terakhir. | Periksa `device_id` dan tanggalnya. |

</details>

<details>
<summary><b>Laptop terasa berat, atau ruang disk berkurang banyak</b></summary>

- **Memuat sejuta baris lambat sekali, atau berhenti dengan `No space left on device`.** Ruang disk tidak cukup. Kosongkan ruang dulu (lihat 🚨 Modul 17, bagian ruang disk). Kalau tabel pembanding dari Praktik 4.6 masih ada, buang dengan `DROP TABLE readings_biasa;`.
- **Kueri pertama sesudah memuat data jauh lebih lambat daripada contoh.** Database masih sibuk menulis catatan perubahannya. Tunggu satu atau dua menit, lalu ulangi.
- **Volume `rumahpintar-data` kini berukuran ratusan MB, padahal ukuran hypertable hanya 30 MB.** Sebagian besar isinya adalah **catatan perubahan** (*write-ahead log*, WAL) milik PostgreSQL, yang mencatat setiap perubahan sebelum ditulis ke tabel. Setelah `INSERT` sejuta baris, catatan itu membesar, dan PostgreSQL menyimpan sebagian berkasnya untuk dipakai ulang. Di laptop lab, volume itu berukuran sekitar 780 MB di akhir modul. Ini wajar. Jangan pernah menghapus isi folder data PostgreSQL dengan tangan.

</details>

<details>
<summary><b>Tampilan psql membingungkan</b></summary>

- **psql berhenti dengan `--More--`.** Jawabannya lebih panjang daripada layar. Tekan **Spasi** untuk halaman berikutnya, atau **q** untuk berhenti (Modul 17 Praktik 3.8).
- **Baris `EXPLAIN` terlipat-lipat dan sulit dibaca.** Itu hanya tampilan terminal yang sempit. Besarkan panel terminal VS Code dengan tombol **Maximize Panel Size** (ikon ^ di pojok kanan atas panel), lalu jalankan lagi kuerinya.
- **Jam tampil dengan `+00`, bukan `+07`.** Zona sesi psql adalah UTC. Ketik `SET TIME ZONE 'Asia/Jakarta';` untuk melihatnya dalam WIB, dan `RESET TIME ZONE;` untuk kembali. Isi database tidak berubah; yang berubah hanya cara psql menuliskan jamnya.
- **SQL dijawab dengan galat terminal, misalnya `The term 'ts' is not recognized …` di PowerShell atau `zsh: …` di macOS.** Kueri itu diketik di terminal biasa, bukan di psql. Masuk dulu dengan `docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`; tanda kamu sudah di psql adalah awalan `rumahpintar=#`.
- **`npm` atau `git` diketik di psql, lalu tidak terjadi apa-apa dan awal barisnya menjadi `rumahpintar-#`.** Bagi psql, itu awal kalimat SQL, jadi ia menunggu titik koma. Ketik `\r` lalu tekan **Enter** untuk membuang baris itu (psql menjawab `Query buffer reset (cleared).`), lalu jalankan perintahnya di terminal pertama.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Tidak ada yang wajib dikerjakan, dan modul berikutnya tidak bergantung padanya.

<details>
<summary><b>InfluxDB: database deret waktu yang lain</b></summary>

TimescaleDB bukan satu-satunya database untuk data deret waktu. Yang paling terkenal di dunia IoT adalah **InfluxDB**. Versi terbarunya, **InfluxDB 3 Core**, bersifat sumber terbuka (lisensi MIT atau Apache 2, boleh pilih), ditulis dengan bahasa Rust, menyimpan data dalam berkas **Apache Parquet** di disk atau penyimpanan awan, dan bisa ditanya, baik dengan SQL maupun dengan bahasanya sendiri, InfluxQL. Data dikirim dalam format teks ringkas yang disebut *line protocol* (protokol baris). Baris berikut berarti "bacaan Node 1 `a4cf12e5b7c0` pukul 03.30.48 UTC tanggal 20 Oktober 2026, suhu 28,5, kelembapan 71". Angka panjang di ujungnya adalah waktunya dalam nanodetik sejak 1970.

```text
readings,device_id=a4cf12e5b7c0 suhu=28.5,kelembapan=71 1792467048000000000
```

Kapan memilih yang mana?

| | TimescaleDB (modul ini) | InfluxDB 3 Core |
| :--- | :--- | :--- |
| Dasarnya | Tambahan untuk PostgreSQL | Database tersendiri |
| Tabel biasa dan relasi (`devices`, `commands`, `users`) | Ada di database yang sama, bisa di-`JOIN` | Tidak dirancang untuk itu; perlu database kedua |
| Bahasa | SQL PostgreSQL penuh | SQL dan InfluxQL |
| Backup | Satu `pg_dump` untuk semuanya | Terpisah dari database relasionalmu |
| Paling cocok untuk | Aplikasi yang mencampur data sensor dengan data biasa | Metrik murni dalam jumlah sangat besar, terutama data terbaru |

Rumah Pintar Mini menyimpan perangkat, perintah, pengguna, dan aturan di samping bacaan sensor. Satu database PostgreSQL dengan TimescaleDB membuat semuanya tetap di satu tempat, dengan satu bahasa dan satu backup. Itulah alasan kurikulum ini memilihnya. Klaim "mana yang lebih cepat" sangat bergantung pada jenis data dan cara mengujinya, jadi jangan percaya grafik perbandingan dari pembuat salah satu produk begitu saja.

</details>

<details>
<summary><b>Partisi PostgreSQL biasa: hypertable buatan tangan</b></summary>

PostgreSQL sendiri bisa memotong tabel per waktu tanpa TimescaleDB, dengan **partisi deklaratif** (*declarative partitioning*):

```sql
CREATE TABLE bacaan_contoh (device_id text NOT NULL, ts timestamptz NOT NULL, suhu double precision)
  PARTITION BY RANGE (ts);
CREATE TABLE bacaan_contoh_2026_10_20 PARTITION OF bacaan_contoh
  FOR VALUES FROM ('2026-10-20 00:00:00+00') TO ('2026-10-21 00:00:00+00');
```

Mirip hypertable, tetapi ada tiga perbedaan penting dan satu persamaan:

1. **Setiap partisi dibuat dengan tangan.** Bacaan untuk tanggal yang belum punya partisi **ditolak**: `INSERT` bacaan tanggal 21 ke tabel contoh di atas dijawab `ERROR:  no partition of relation "bacaan_contoh" found for row`. Hypertable membuat *chunk* baru sendiri.
2. **Tabel yang sudah berisi tidak bisa diubah menjadi tabel berpartisi.** Kamu harus membuat tabel baru lalu memindahkan datanya, sedangkan `create_hypertable(…, migrate_data => true)` bisa langsung.
3. **Tidak ada kebijakan otomatis, buku ringkasan, atau columnstore.** Membuang partisi lama memang secepat retensi (`DROP TABLE` satu partisi), tetapi harus dijadwalkan sendiri.
4. Pemangkasan partisi (*partition pruning*) dan syarat "kunci unik harus memuat kolom waktu" sama persis dengan hypertable.

Di balik layar, *chunk* TimescaleDB bukan partisi deklaratif, melainkan **tabel anak** dari `readings`, hasil pewarisan tabel (*inheritance*). Itulah sebabnya `\d readings` di Praktik 2 menulis `Number of child tables`.

</details>

<details>
<summary><b><code>time_bucket_gapfill</code>: grafik tanpa lubang</b></summary>

Kalau Node 1 mati dua jam, `time_bucket` tidak menghasilkan baris apa pun untuk dua jam itu. Grafik yang menghubungkan titik-titiknya akan menarik garis lurus melewati lubang itu, seolah-olah datanya ada. **`time_bucket_gapfill`** membuat baris untuk **setiap** ember dalam rentang, termasuk yang kosong, dan **`locf`** (*last observation carried forward*) bisa mengisi ember kosong dengan nilai terakhir yang diketahui.

Data uji berhenti pada menit kamu memuatnya, jadi anggap saja perangkat uji "mati" sejak itu. Ganti tanggal dan jam di kedua batas waktu di bawah ini supaya rentangnya mencakup tiga jam sebelum dan dua jam sesudah data ujimu berakhir. Di contoh ini, data berakhir pukul 15.18 UTC tanggal 20 Oktober. Kalau lupa kapan data ujimu berakhir, tanyakan dulu dengan `SELECT max(ts) FROM readings WHERE device_id = 'beef00000001';`, yang menjawab dalam UTC seperti kueri di bawah. Lalu jalankan:

```sql
SELECT time_bucket_gapfill('1 hour', ts) AS jam,
       round(avg(suhu)::numeric, 1) AS suhu_rata,
       locf(round(avg(suhu)::numeric, 1)) AS suhu_terisi,
       count(*) AS jumlah
FROM readings
WHERE device_id = 'beef00000001'
  AND ts >= '2026-10-20 12:00:00+00' AND ts < '2026-10-20 18:00:00+00'
GROUP BY jam
ORDER BY jam;
```

**Hasilnya** (di laptop lab):

```text
          jam           | suhu_rata | suhu_terisi | jumlah 
------------------------+-----------+-------------+--------
 2026-10-20 12:00:00+00 |      28.5 |        28.5 |    360
 2026-10-20 13:00:00+00 |      27.5 |        27.5 |    360
 2026-10-20 14:00:00+00 |      26.5 |        26.5 |    360
 2026-10-20 15:00:00+00 |      25.9 |        25.9 |    109
 2026-10-20 16:00:00+00 |           |        25.9 |       
 2026-10-20 17:00:00+00 |           |        25.9 |       
(6 rows)
```

Dengan `time_bucket` biasa, jawabannya hanya empat baris. Di sini, ember pukul 16.00 dan 17.00 tetap muncul: `suhu_rata` kosong (`NULL`), sedangkan `suhu_terisi` meneruskan nilai terakhir, 25,9. Mana yang lebih jujur untuk grafik? Biasanya kolom yang kosong supaya pengguna melihat bahwa perangkatnya sempat mati. `locf` cocok untuk nilai yang memang bertahan, misalnya status pompa.

Satu syarat: rentang waktunya harus **tertutup** di `WHERE`. Tanpa batas akhir (`ts < …`), TimescaleDB tidak tahu harus berhenti di ember mana, dan menolak dengan `ERROR:  missing time_bucket_gapfill argument: could not infer finish from WHERE clause`.

</details>

<details>
<summary><b>Ringkasan bertingkat: buku ringkasan harian di atas buku ringkasan per jam</b></summary>

Backend v0.3 menghitung rata-rata harian setiap kali `bucket=1d` diminta, dari 24 baris ringkasan per hari. Itu sudah cepat. Kalau suatu hari pertanyaan harian menjadi sangat sering, buku ringkasan bisa dibuat **di atas buku ringkasan lain** (*hierarchical continuous aggregate*):

```sql
CREATE MATERIALIZED VIEW readings_per_hari
WITH (timescaledb.continuous, timescaledb.materialized_only = false) AS
SELECT time_bucket('1 day', jam, 'Asia/Jakarta') AS hari,
       device_id,
       sum(suhu_rata * suhu_n) / nullif(sum(suhu_n), 0) AS suhu_rata,
       min(suhu_min) AS suhu_min,
       max(suhu_maks) AS suhu_maks,
       sum(jumlah_bacaan) AS jumlah_bacaan
FROM readings_per_jam
GROUP BY hari, device_id
WITH NO DATA;
```

Perhatikan rumusnya: rata-rata harian **tidak** ditulis `avg(suhu_rata)` karena rata-rata dari rata-rata adalah jebakan (Praktik 5.8). Kolom `suhu_n` di buku ringkasan per jam membuat rumus yang tepat bisa dipakai di tingkat berikutnya.

Di laptop lab, buku ringkasan ini dicoba di **salinan** database, lalu diisi dan ditanya seperti ini:

```sql
CALL refresh_continuous_aggregate('readings_per_hari', NULL, now() - INTERVAL '1 day');
SET TIME ZONE 'Asia/Jakarta';
SELECT hari, round(suhu_rata::numeric, 1) AS suhu_rata, suhu_min, suhu_maks, jumlah_bacaan
FROM readings_per_hari WHERE device_id = 'f00d00000001' ORDER BY hari;
```

Awal `NULL` aman di sini karena sumbernya buku ringkasan per jam, yang tidak terkena retensi. **Hasilnya:**

```text
          hari          | suhu_rata | suhu_min | suhu_maks | jumlah_bacaan 
------------------------+-----------+----------+-----------+---------------
 2026-10-13 00:00:00+07 |      26.2 |     21.8 |      30.6 |           144
 2026-10-14 00:00:00+07 |      25.6 |     21.1 |        30 |           144
 2026-10-15 00:00:00+07 |      26.5 |       22 |      30.8 |           144
 2026-10-16 00:00:00+07 |      27.1 |     22.6 |      31.6 |           144
 2026-10-17 00:00:00+07 |      26.7 |     22.3 |      31.1 |           144
 2026-10-18 00:00:00+07 |      25.8 |     21.4 |      30.2 |           144
 2026-10-19 00:00:00+07 |      26.3 |       22 |      30.6 |           144
 2026-10-20 00:00:00+07 |      26.1 |     21.6 |      30.5 |           134
(8 rows)
```

Tujuh hari penuhnya sama dengan Modul 17 Praktik 4.5, kali ini dari tingkat ringkasan kedua. Baris terakhir adalah hari H, yang baru terisi sampai jam data latihan diisi. Kalau ingin mencobanya, kerjakan di salinan, bukan di database utama. Buku ringkasan kedua juga butuh petugas sendiri (`add_continuous_aggregate_policy`) supaya tetap mutakhir, dan salinan bisa dibuang lagi sesudah selesai. Salinan Praktik 7 sudah kamu buang di 7.6, jadi buat lagi dengan keenam perintah 7.4 (berkas di folder `backup` masih ada), lalu masuk dengan `docker exec -it rumahpintar-db psql -U postgres -d rumahpintar_pulih` dan jalankan kedua kotak SQL di atas. Sesudah selesai, keluar dengan `\q`, buang salinannya dengan `dropdb` seperti di 7.6, lalu hapus berkas sementaranya dengan `docker exec rumahpintar-db rm /tmp/pulih.dump`. Kali ini `/tmp/rumahpintar.dump` sudah tidak ada, jadi tidak perlu ikut dihapus.

</details>

<details>
<summary><b>Menipiskan titik untuk grafik: dari ember ke LTTB</b></summary>

Sebulan bacaan Node 1 berisi sekitar 259 ribu titik, padahal grafik di layar ponsel hanya selebar beberapa ratus piksel. Cara menipiskan titik-titik itu disebut ***downsampling***. Ada dua pendekatan:

1. **Ember waktu**, seperti backend v0.3: satu titik per jam atau per hari. Sederhana dan cepat, tetapi rata-rata bisa menyembunyikan lonjakan sesaat. Itulah sebabnya setiap titik ringkasan juga membawa `suhu_min` dan `suhu_maks`: grafik bisa menggambar pita terendah–tertinggi di sekitar garis rata-rata sehingga lonjakan tidak hilang.
2. **LTTB** (*Largest-Triangle-Three-Buckets*): algoritme yang memilih titik-titik **asli** yang paling menjaga bentuk grafik, misalnya 500 dari 259 ribu. TimescaleDB menyediakannya sebagai fungsi `lttb(…)` di paket tambahan **TimescaleDB Toolkit**. Paket itu tidak ada di image ringan yang dipakai modul ini, tetapi ada di image `timescale/timescaledb-ha` yang jauh lebih besar. Algoritmenya juga cukup pendek untuk ditulis sendiri dalam TypeScript, di backend atau langsung di dashboard.

Dashboard Fase 4 akan memakai pendekatan pertama karena API-nya sudah siap sejak modul ini.

</details>

<details>
<summary><b>DBeaver dan TimescaleDB</b></summary>

Koneksi **PostgreSQL** `rumahpintar` dari Modul 17 sudah cukup untuk semua kueri di modul ini: editor SQL-nya sama saja. DBeaver juga punya jenis koneksi khusus bernama **TimescaleDB** (cari "TimescaleDB" di jendela **Connect to a database**). Menurut kode sumber DBeaver, bedanya terutama di panel statistik: koneksi jenis TimescaleDB menghitung ukuran hypertable dari semua *chunk*-nya, sedangkan koneksi PostgreSQL biasa bisa menampilkan ukuran `readings` yang sangat kecil karena isinya ada di tabel-tabel anak. Cara paling pasti untuk mengetahui ukurannya tetap SQL:

```sql
SELECT pg_size_pretty(hypertable_size('readings'));
```

Beberapa tempat menarik di pohon **Database Navigator**:

- Skema **`_timescaledb_internal`** berisi semua *chunk* (`_hyper_1_…_chunk`), buku ringkasan yang tersimpan (`_materialized_hypertable_2`), dan pasangan padat setiap *chunk* yang sudah dipadatkan (`…_compressed`).
- `readings_per_jam` tampil sebagai *view* di skema `public`.
- Skema-skema `timescaledb_information`, `_timescaledb_catalog`, dan `_timescaledb_functions` milik TimescaleDB. Lihat boleh, ubah jangan.

</details>

## 🧩 Tantangan mandiri

Tingkat 1 cukup dikerjakan di psql atau DBeaver. Tingkat 2 dan 3 mengubah kode backend dan database, jadi kerjakan **setelah** ➕ B (cabang `fitur/timescaledb` sudah di-*merge*), di cabang baru dari `main`, seperti Modul 16–17: `git switch main`, `git pull`, lalu `git switch -c fitur/<nama-tantangan>`. Tingkat 1 dan 2 punya kunci jawaban; isi lengkap kedua file kunci Tingkat 2 ada di [`kode/tantangan/kunci/`](kode/tantangan/kunci/).

### Tingkat 1 — Pagi, siang, sore, malam di teras (ubah sedikit)

Kueri pertama di Praktik 5.8 menghitung rata-rata **harian** perangkat uji dari buku ringkasan. Ubah kueri itu supaya menjawab: **rata-rata, terendah, dan tertinggi suhu per 6 jam di teras** (`f00d00000002`) pada hari H-1, dengan ember yang dimulai pukul 00.00, 06.00, 12.00, dan 18.00 WIB. Yang perlu diubah: lebar embernya, perangkatnya, rentang tanggalnya, dan kolom yang ditampilkan (tambahkan `min(suhu_min)` dan `max(suhu_maks)`).

<details>
<summary><b>Kunci Tingkat 1</b></summary>

```sql
SET TIME ZONE 'Asia/Jakarta';
SELECT time_bucket('6 hours', jam, 'Asia/Jakarta') AS enam_jam,
       round((sum(suhu_rata * suhu_n) / sum(suhu_n))::numeric, 1) AS suhu_rata,
       min(suhu_min) AS suhu_min,
       max(suhu_maks) AS suhu_maks,
       sum(jumlah_bacaan) AS jumlah
FROM readings_per_jam
WHERE device_id = 'f00d00000002'
  AND jam >= '2026-10-19 00:00:00+07' AND jam < '2026-10-20 00:00:00+07'
GROUP BY enam_jam
ORDER BY enam_jam;
RESET TIME ZONE;
```

**Hasilnya** (tanggalmu mengikuti H-1; angkanya sama):

```text
        enam_jam        | suhu_rata | suhu_min | suhu_maks | jumlah 
------------------------+-----------+----------+-----------+--------
 2026-10-19 00:00:00+07 |      24.2 |     23.4 |        25 |     36
 2026-10-19 06:00:00+07 |      27.8 |       25 |      30.6 |     36
 2026-10-19 12:00:00+07 |      31.3 |     30.7 |      32.1 |     36
 2026-10-19 18:00:00+07 |      27.9 |     24.8 |      30.7 |     36
(4 rows)
```

- Rata-ratanya tetap memakai rumus `rata × n` (Praktik 5.8), sedangkan terendah dan tertinggi cukup `min` dan `max` dari nilai per jam: terendah dari semua jam adalah terendah enam jam itu.
- Siang (12.00–18.00) paling panas, dan teras sekitar 1,5 derajat lebih panas daripada ruang tamu.
- Coba hapus `'Asia/Jakarta'` dari `time_bucket`. Embernya kini dimulai pukul **01.00, 07.00, 13.00, dan 19.00** WIB karena ember 6 jam dihitung dari tengah malam UTC dan 7 jam bukan kelipatan 6. Untuk ember 15 menit dan 1 jam, zona waktu tidak berpengaruh, tetapi untuk ember 6 jam, seperti ember harian, zona waktu penting.

</details>

### Tingkat 2 — Ember 6 jam lewat API (isi bagian rumpang)

Tambahkan pilihan **`bucket=6h`** ke API riwayat, dengan ember 6 jam WIB seperti Tingkat 1. Isi setiap `____` di bawah ini.

Di **`src/db/arsip.ts`**, ubah tipe `Ember`:

```ts
export type Ember = "15m" | "1h" | "____" | "1d";
```

Lalu, di dalam `KUERI_RINGKASAN`, di antara kueri `"1h"` dan komentar `// per hari WIB: …`, tambahkan kueri keempat:

```ts
  // per 6 jam WIB (Tantangan Tingkat 2): ringkasan per jam digabung per 6 jam dengan rumus yang sama seperti 1d,
  // jadi embernya dimulai pukul 00.00, 06.00, 12.00, dan 18.00 WIB
  "6h": `SELECT time_bucket('____', jam, '____') AS waktu,
           round((sum(suhu_rata * ____) / nullif(sum(suhu_n), 0))::numeric, 1)::float8          AS suhu_rata,
           min(suhu_min)                                                                         AS suhu_min,
           max(suhu_maks)                                                                        AS suhu_maks,
           round(sum(kelembapan_rata * kelembapan_n) / nullif(sum(kelembapan_n), 0), 1)::float8 AS kelembapan_rata,
           round(sum(tanah_rata * tanah_n) / nullif(sum(tanah_n), 0), 1)::float8                AS tanah_rata,
           round(sum(cahaya_rata * cahaya_n) / nullif(sum(cahaya_n), 0), 1)::float8             AS cahaya_rata,
           sum(jumlah_bacaan)::int                                                               AS jumlah_bacaan
         FROM ____
         WHERE device_id = $1 AND jam >= $2 AND jam < $3
         GROUP BY waktu
         ORDER BY waktu`,
```

Di **`src/routes/perangkat.ts`**, tambahkan baris ini ke kamus `EMBER`, di antara `"1h"` dan `"1d"`:

```ts
  "6h": { lebar: ____ * JAM, bawaan: 7 * HARI, geser: ____ * JAM }, // 00.00, 06.00, 12.00, 18.00 WIB (Tantangan Tingkat 2)
```

Setelah itu, perbarui pilihan Zod:

```ts
const Ember = z.enum(["15m", "1h", "____", "1d"]);
```

Kalau mau rapi, perbarui juga keterangan `bucket` dan pesan "rentang terlalu panjang" supaya menyebut `6h` (lihat file kunci). Uji dengan `npm run cek`, lalu buka di browser (tanggal H-1 dan H-mu):

```text
http://127.0.0.1:8080/devices/f00d00000002/readings?bucket=6h&from=2026-10-19T00:00:00%2B07:00&to=2026-10-20T00:00:00%2B07:00
```

**Hasilnya** berisi empat titik, dengan `waktu` `2026-10-18T17:00:00Z`, `2026-10-18T23:00:00Z`, `2026-10-19T05:00:00Z`, dan `2026-10-19T11:00:00Z`, serta `suhu_rata` `24.2`, `27.8`, `31.3`, dan `27.9`: sama persis dengan jawaban Tingkat 1. Coba juga `?bucket=5m`: pesan `400`-nya kini menyebut `"15m"|"1h"|"6h"|"1d"`.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

- Di tipe dan di Zod: `"6h"`. Urutannya bebas, tetapi urutan di `z.enum` menentukan urutan pilihan di pesan `400` dan di *dropdown* `/docs`.
- Di SQL: `time_bucket('6 hours', jam, 'Asia/Jakarta')`, `sum(suhu_rata * suhu_n)`, dan `FROM readings_per_jam`. Zona waktu wajib karena ember 6 jam tanpa zona dimulai pukul 01.00, 07.00, 13.00, dan 19.00 WIB (Tingkat 1). Sumbernya buku ringkasan per jam, seperti `1d`, jadi kueri ini tetap cepat untuk rentang berbulan-bulan.
- Di kamus: `lebar: 6 * JAM` dan `geser: 7 * JAM`. Geserannya sama dengan `1d`: majukan 7 jam ke WIB, bulatkan ke kelipatan 6 jam, lalu mundurkan lagi 7 jam (🔁 langkah 4). Hasilnya, `from=…T10:20:00+07:00` dibulatkan ke pukul 06.00 WIB.
- `Record<Ember, string>` menjagamu: kalau `"6h"` sudah ditambahkan ke tipe `Ember`, tetapi kuerinya belum, `npm run cek` menulis `error TS2741: Property '"6h"' is missing in type …`. Kalau `"6h"` ditambahkan ke `z.enum`, tetapi lupa ditambahkan ke kamus `EMBER`, `npm run cek` juga menegur di `hitungRentang`.

Isi lengkap kedua file: [`arsip.ts`](kode/tantangan/kunci/backend/src/db/arsip.ts) dan [`perangkat.ts`](kode/tantangan/kunci/backend/src/routes/perangkat.ts).

</details>

### Tingkat 3 — `device_health` juga data deret waktu (buat dari nol)

Tabel **`device_health`** menyimpan `vitals` setiap perangkat (kekuatan sinyal, lama menyala, sisa memori) setiap beberapa menit. Itu juga buku harian. Buat migrasi baru **`006_device_health.sql`** yang:

1. mengubah `device_health` menjadi hypertable dengan *chunk* **7 hari** (data `vitals` jauh lebih jarang daripada `telemetry`, jadi jilid mingguan sudah cukup kecil), dan
2. membuang `vitals` yang lebih tua daripada **30 hari** secara otomatis.

Petunjuk:

- Contohlah `002_hypertable.sql` dan `004_retensi.sql`. `device_health` juga punya kunci tamu ke `devices`, jadi kuncilah tabel `devices` dulu dengan `LOCK TABLE` seperti di `002`.
- Tabelnya mungkin sudah berisi `vitals` dari Modul 17, jadi jangan lupa `migrate_data => true`.
- Kunci utamanya, `(device_id, ts)`, sudah memuat kolom waktu, jadi syarat Konsep 2 terpenuhi.
- Jalankan dengan `npm run migrasi`.

**Periksa sendiri jawabanmu.** Di psql:

- `SELECT hypertable_name FROM timescaledb_information.hypertables ORDER BY 1;` harus menjawab dua baris: `device_health` dan `readings`.
- Daftar *job* (`SELECT job_id, application_name, schedule_interval, hypertable_name FROM timescaledb_information.jobs WHERE job_id >= 1000 ORDER BY job_id;`) harus memuat baris baru `Retention Policy [1003]` untuk `device_health`, dengan jadwal `1 day`. Nomornya bisa lebih besar kalau kamu pernah membuat *job* lain.
- `\d device_health` harus memuat indeks baru `device_health_ts_idx`, sama seperti `readings_ts_idx` di Praktik 2.

Tingkat ini tidak punya kunci; ketiga pemeriksaan itulah kuncinya.

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini mendapat **riwayat yang siap tumbuh** dan **backend v0.3**. Tabel `readings` kini dijilid per hari, buku ringkasan per jam diperbarui sendiri, bacaan mentah dibuang setelah 90 hari dan dipadatkan setelah 7 hari, backup terbukti bisa dipulihkan, dan API riwayat bisa menjawab per 15 menit, per jam, atau per hari WIB. Kontrak data tetap versi 1.2 karena bentuk pesan MQTT tidak berubah.

![Diagram proyek Rumah Pintar Mini setelah Modul 18: riwayat kini siap tumbuh bertahun-tahun; garis putus-putus berarti pilihan, pensiun, atau menyusul. Atas, dari kiri: Node 2 Kebun v1.0.0 dengan baterai 18650, tidak berubah, mengirim ESP-NOW ke Node 1 Rumah v1.4.0 (sensor, relay, jembatan Node 2, sensor RS-485), juga tidak berubah. Node 1 mengirim MQTT ke Gateway Raspberry Pi 192.168.1.37 yang berisi Mosquitto, broker MQTT, dan Node-RED dengan dashboard, kartu Kebun, dan grup Sensor RS-485; baris otomasi kipas dicoret, pudar, dan bergaris putus-putus dengan label pensiun sejak Modul 16. Node-RED tetap melayani dashboard di HP. Kiri tengah, kotak putus-putus simulator (pilihan): 10 perangkat palsu di laptop, f00d00000001 sampai f00d00000010, pengganti perangkat sungguhan, tersambung ke Mosquitto lewat garis MQTT putus-putus. Di bawahnya catatan jujur: database dan backup ada di laptop, dan repositori hanya menyimpan migrasi dan resep data uji, bukan datanya. Tengah, kotak hijau Laptop, backend di 127.0.0.1:8080, berisi backend v0.3, yaitu Fastify + TypeScript ringan, berlangganan rpm/#, kontrak data 1.2 sebagai skema Zod, papan pengumuman di memori, arsip ke database, dan versi 0.3.0 di /docs, serta API yang sama dengan v0.2 ditambah bucket, yaitu GET /health, GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, GET /devices/:id/readings dengan ?bucket=15m|1h|1d (baru), POST /devices/:id/command, dan GET /docs. Panah hijau rpm/# turun dari gateway ke backend, dan panah cmd naik dari backend ke gateway. Di bawah backend, garis pg (pool) dua arah menuju kotak biru Docker Desktop: kontainer rumahpintar-db, PostgreSQL 17 + TimescaleDB 2.30.2, volume rumahpintar-data, loket 127.0.0.1:5432, dengan readings = hypertable, dijilid per hari (baru), buku ringkasan readings_per_jam (baru), petugas untuk ringkasan setiap 30 menit, retensi 90 hari, dan columnstore setelah 7 hari (baru), serta tabel lain yang tetap, yaitu devices, device_health, commands, users, dan rules. Di kanan, empat tamu: Bruno dengan permintaan baru riwayat per jam Node 1 dan browser untuk membuka /docs, keduanya lewat HTTP ke backend; DBeaver lewat loket 5432 dan psql lewat docker exec, keduanya ke database. Di bawahnya, kartu folder backup/ (baru), berkas pg_dump yang tidak masuk Git, dengan panah dari Docker Desktop. Bawah, GitHub rumah-pintar-mini: backend/migrasi/002_hypertable.sql sampai 005_columnstore.sql baru, backend/src/ ditambah ?bucket, backend/uji/beban-1-juta.sql baru, backend/README.md v0.3, KONTRAK-DATA.md tetap 1.2, backend/bruno/riwayat per jam Node 1.yml baru, backend/.gitignore ditambah backup/, dan firmware/ tidak berubah. Kanan bawah, kotak putus-putus menyusul: Modul 19 realtime, aturan otomatis, dan notifikasi Telegram; Modul 20 login dan peran; dan Modul 22–23 dashboard React dengan grafik dari ?bucket.](aset/diagram-proyek-modul-18.png)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini` beserta terminalnya) dan **browser** yang sudah masuk ke GitHub.
>
> ⭐ **Wajib** — langkah B menggabungkan semua pekerjaan Modul 18 ke `main`, dan Modul 19 dimulai dari sana.

| File di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `backend/migrasi/002_hypertable.sql` | **baru**: `readings` menjadi hypertable (Praktik 2) |
| `backend/uji/beban-1-juta.sql` | **baru**: resep data uji sejuta baris (Praktik 4) |
| `backend/migrasi/003_ringkasan_per_jam.sql` | **baru**: buku ringkasan per jam beserta petugasnya (Praktik 5) |
| `backend/migrasi/004_retensi.sql`, `005_columnstore.sql` | **baru**: retensi 90 hari dan columnstore setelah 7 hari (Praktik 6) |
| `backend/.gitignore` | folder `backup/` tidak ikut Git (Praktik 7) |
| `backend/src/db/arsip.ts`, `src/routes/perangkat.ts`, `src/server.ts` | riwayat per ember (`bucket`), keterangan dan versi 0.3.0 di `/docs` (Praktik 8) |
| `backend/package.json`, `package-lock.json` | versi 0.3.0 dan deskripsi baru, tanpa paket baru (Praktik 8) |
| `backend/bruno/riwayat per jam Node 1.yml` | **baru** (Praktik 8) |
| `backend/README.md` | cara menjalankan backend v0.3, termasuk backup dan restore (langkah A) |

### A. Perbarui `backend/README.md`

Teman satu tim yang meng-*clone* repositorimu kini butuh satu langkah tambahan sesudah migrasi (meringkas riwayat sekali), dan semua orang perlu tahu cara membuat serta memulihkan backup. Ganti isi `backend/README.md` dengan:

````markdown
# Backend Rumah Pintar Mini

Backend v0.3 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.2 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL dengan tambahan TimescaleDB (lewat Docker), dan menyediakan API berdokumentasi. Riwayat bacaan bisa diminta mentah atau sudah diringkas per 15 menit, per jam, atau per hari.

## Menjalankan

1. Pasang Node.js 24 LTS dan Docker Desktop.
2. Jalankan database, cukup sekali (ganti `ganti-sandi-ini` dengan sandimu; pakai huruf, angka, dan tanda minus saja):

   ```text
   docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. Di folder ini, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` (alamat broker) dan sandi database di `DATABASE_URL`.
5. Buat tabel-tabelnya dengan `npm run migrasi`.
6. Petugas ringkasan hanya meringkas ulang 3 hari terakhir. Riwayat yang lebih tua dan masuk sekaligus (bacaan yang sudah ada sebelum migrasi `003`, data latihan dari `npm run isi-riwayat`, atau uji beban di bawah) baru tersimpan di buku ringkasan per jam kalau diringkas **sekali** dengan perintah ini, sesudah datanya masuk:

   ```text
   docker exec rumahpintar-db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', NULL, now() - INTERVAL '1 hour');"
   ```

   Jangan mengulang perintah ini setelah retensi (migrasi `004`) membuang data lama: jendela `NULL` ikut menghapus ringkasan lama yang bacaan mentahnya sudah dibuang.
7. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis |
| `npm run cek` | memeriksa tipe TypeScript (jalankan sebelum setiap *commit*) |
| `npm run migrasi` | menjalankan file SQL baru di folder `migrasi/` (aman diulang) |
| `npm run isi-riwayat` | mengisi data latihan 7 hari untuk perangkat latihan `f00d00000001` dan `f00d00000002` |

Untuk uji beban, `uji/beban-1-juta.sql` memuat 1.036.801 bacaan palsu (satu setiap 10 detik selama 120 hari) untuk perangkat uji `beef00000001`. Jalankan dari folder ini:

```text
docker cp uji/beban-1-juta.sql rumahpintar-db:/tmp/beban-1-juta.sql
docker exec rumahpintar-db psql -U postgres -d rumahpintar -f /tmp/beban-1-juta.sql
```

## API

| Rute | Gunanya |
| :--- | :--- |
| `GET /health` | server hidup? tersambung ke broker dan database? berapa pesan diterima dan ditolak? |
| `GET /devices` | semua perangkat yang terdengar sejak server menyala |
| `GET /devices/:id/latest` | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | kesehatan terakhir satu perangkat |
| `GET /devices/:id/readings?from=…&to=…` | riwayat bacaan mentah dari database (bawaan: satu jam terakhir; paling banyak 1.000 bacaan) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | ringkasan riwayat per 15 menit, per jam, atau per hari WIB (bawaan: 1 hari, 7 hari, atau 30 hari terakhir; paling banyak 1.000 ember) |
| `POST /devices/:id/command` | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` |

Dengan `bucket`, jawabannya berbentuk `{ device_id, dari, sampai, ember, jumlah, ringkasan: [ { waktu, suhu_rata, suhu_min, suhu_maks, kelembapan_rata, tanah_rata, cahaya_rata, jumlah_bacaan } ] }`. `waktu` adalah awal ember (UTC), dan `dari` dibulatkan ke bawah ke awal ember. Ringkasan per 15 menit dihitung langsung dari bacaan mentah, ringkasan per jam dibaca dari `readings_per_jam`, dan ringkasan per hari menggabungkan ringkasan per jam menjadi hari WIB. Rata-rata hariannya tepat sama dengan hitungan dari bacaan mentah karena setiap jam menyimpan rata-rata dan banyaknya nilai (`suhu_rata` dan `suhu_n`, dan seterusnya).

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`).

## Database

Bentuk tabel ditulis sebagai file SQL bernomor di folder `migrasi/`. File yang sudah diterapkan tidak boleh diubah; setiap perubahan baru masuk ke file dengan nomor berikutnya.

| File | Isinya |
| :--- | :--- |
| `001_skema_awal.sql` | tabel `devices`, `readings`, `device_health`, `commands`, `users`, dan `rules` |
| `002_hypertable.sql` | `readings` menjadi hypertable TimescaleDB, dipotong per hari (00.00 UTC) |
| `003_ringkasan_per_jam.sql` | *continuous aggregate* `readings_per_jam` (rata-rata, terendah, tertinggi, dan banyaknya nilai per jam) beserta jadwal pembaruannya (setiap 30 menit, 3 hari terakhir) |
| `004_retensi.sql` | bacaan mentah yang lebih tua daripada 90 hari dibuang setiap hari; ringkasan per jamnya tetap disimpan |
| `005_columnstore.sql` | bacaan yang lebih tua daripada 7 hari dipadatkan per kolom (columnstore) setiap 12 jam |

`npm run migrasi` juga membuat tabel `schema_migrations` (catatan migrasi yang sudah diterapkan). Tugas terjadwal TimescaleDB dapat dilihat dengan `SELECT * FROM timescaledb_information.jobs WHERE job_id >= 1000;`.

## Backup & restore

Fotokopi seluruh database dibuat **di dalam kontainer** (memakai `pg_dump` yang versinya pasti cocok), lalu disalin ke folder `backup/` (tidak ikut Git):

```text
docker exec rumahpintar-db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
mkdir backup
docker cp rumahpintar-db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-20.dump
```

Ganti `2026-10-20` di nama berkas dengan tanggal hari ini supaya backup-backup berikutnya tidak saling menimpa. Pada backup berikutnya, `mkdir backup` boleh dilewati karena foldernya sudah ada.

Perintah di bagian ini sama persis di PowerShell (Windows), Terminal macOS, dan Linux. `pg_dump` menulis satu peringatan *circular foreign-key constraints* (`detail: continuous_agg`) beserta dua `hint`; itu wajar. Jangan membuat berkas dump dengan `>` (misalnya `pg_dump … > berkas.dump`): di Windows PowerShell 5.1 berkasnya rusak, jadi selalu pakai `-f` lalu `docker cp`. Di Git Bash, tulis `//tmp/…` (dua garis miring) karena Git Bash mengubah `/tmp/…` menjadi folder Windows.

Membangun ulang di database baru `rumahpintar_pulih` (di kontainer yang sama; TimescaleDB harus versi yang sama, 2.30.2):

```text
docker cp backup/rumahpintar-2026-10-20.dump rumahpintar-db:/tmp/pulih.dump
docker exec rumahpintar-db createdb -U postgres -T template0 rumahpintar_pulih
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "CREATE EXTENSION timescaledb;"
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_pre_restore();"
docker exec rumahpintar-db pg_restore -U postgres -d rumahpintar_pulih /tmp/pulih.dump
docker exec rumahpintar-db psql -U postgres -d rumahpintar_pulih -c "SELECT timescaledb_post_restore();"
```

Jangan memakai `pg_restore -j`, dan jangan melewatkan `timescaledb_pre_restore()` atau `timescaledb_post_restore()`. Untuk membuktikan datanya sama, jalankan dulu `CALL run_job(…);` di `rumahpintar` dengan nomor *job* `Retention Policy` (nomornya terlihat lewat kueri `timescaledb_information.jobs` di bagian Database). Database salinan langsung menjalankan *job* retensinya begitu dipulihkan, jadi database asli harus sudah membuang jilid yang sama. Lalu jalankan kueri ini di psql pada `rumahpintar` dan `rumahpintar_pulih`, dan bandingkan satu barisnya:

```sql
SELECT (SELECT count(*) FROM readings) AS bacaan,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS sidik_jari,
       (SELECT count(*) FROM readings_per_jam) AS ringkasan,
       (SELECT count(*) FROM show_chunks('readings')) AS jilid,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS tugas;
```

Setelah terbukti, hapus salinannya dengan `docker exec rumahpintar-db dropdb -U postgres rumahpintar_pulih`.

## Batasan v0.3

- `GET /devices`, `latest`, dan `vitals` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Riwayat bacaan dan perintah tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Bacaan mentah hanya disimpan 90 hari; yang lebih tua tinggal ringkasan per jamnya.
- Hari pada ringkasan `1d` adalah hari WIB (`Asia/Jakarta`), juga bagi perangkat di WITA atau WIT.
- Server hanya menerima tamu dari laptop ini (`127.0.0.1`) karena API belum punya *login*.
````

Lalu simpan ke cabang `fitur/timescaledb`. Di terminal kedua (folder `backend`):

```text
git add README.md
git commit -m "README backend v0.3 (Modul 18)"
git push
```

### B. ⭐ Gabungkan `fitur/timescaledb` ke `main` lewat *pull request*

Semua *commit* Praktik 2–8 dan langkah A ada di cabang `fitur/timescaledb`. Saatnya meninjau dan menggabungkannya, persis seperti Modul 17 ➕ B:

1. **Buka *pull request*.** Di repositori `rumah-pintar-mini` di GitHub, klik **Compare & pull request** pada pita kuning cabang `fitur/timescaledb`. Kalau pitanya sudah hilang, buka tab **Pull requests** → **New pull request**, lalu pilih **base: `main`** ← **compare: `fitur/timescaledb`**. Di bawah **Apa yang berubah?**, tulis misalnya: `Backend v0.3: readings menjadi hypertable, ringkasan per jam otomatis, retensi 90 hari, columnstore, backup dan restore, serta API riwayat per ember (?bucket=15m|1h|1d).` Klik **Create pull request**.
2. ***Review* dengan checklist.** Di tab **Files changed**, pastikan keempat migrasi baru (`002` sampai `005`) dan `uji/beban-1-juta.sql` ikut. Pastikan juga **tidak ada** file `.env`, folder `backup/`, atau berkas berakhiran `.dump`: berkas backup berisi seluruh database dan tidak boleh masuk Git. Lalu centang checklist di tab **Conversation** sesuai keadaan sebenarnya. Butir `KONTRAK-DATA.md` boleh dicentang: bentuk pesan MQTT tidak berubah. Kirim ringkasan lewat **Review changes** → **Comment** → **Submit review**.
3. ***Merge.*** Pilih **Create a merge commit**, klik **Merge pull request** → **Confirm merge**, lalu **Delete branch**.
4. **Pulang ke `main` di laptop.** Di terminal kedua:

   ```text
   git switch main
   git pull --prune
   git branch -d fitur/timescaledb
   ```

Database tidak terpengaruh oleh perpindahan cabang ini. Migrasi `002`–`005` sudah tercatat di `schema_migrations`, jadi `npm run migrasi` di `main` menjawab `0 migrasi baru diterapkan, 5 sudah ada sebelumnya.`

### C. Simpan catatan belajarmu

Angka-angka yang kamu ukur sendiri di modul ini adalah bukti terbaik bahwa kamu memahaminya. Buka repositori **`belajar-iot`** di jendela VS Code baru (**File → New Window**, lalu **File → Open Folder…**), buat file **`modul-18/catatan.md`** di samping `pemanasan.js` dari 🔁, lalu isi dengan angka dari layarmu sendiri:

```markdown
# Catatan Modul 18 — TimescaleDB

| Yang diukur | Angkaku |
| :--- | :--- |
| Kueri syarat lulus, Praktik 4.4 (`Time`) | … ms |
| `Execution Time` tabel biasa / hypertable / buku ringkasan (Praktik 4.6, 4.5, 5.6) | … / … / … ms |
| Ukuran hypertable: sebelum retensi / sesudah retensi / sesudah columnstore (Praktik 6) | … / … / … MB |
| Ringkasan lebih tua daripada 90 hari: sebelum / sesudah retensi | … / … |
| Sidik jari asli dan salinan (Praktik 7.2 dan 7.5) | … |

Yang paling mengejutkanku: …
```

Lakukan *commit* dan *push* di repositori **`belajar-iot`** dengan GitHub Desktop atau terminal.

### D. Bersihkan perangkat uji (tidak wajib)

Perangkat uji `beef00000001` tidak mengganggu apa pun, dan retensi akan membuang bacaan mentahnya sedikit demi sedikit dalam 90 hari ke depan. Kalau kamu ingin database yang rapi sekarang, kerjakan langkah ini **setelah** 🧩. Di psql:

```sql
DELETE FROM readings WHERE device_id = 'beef00000001';
DELETE FROM devices WHERE device_id = 'beef00000001';
CALL refresh_continuous_aggregate('readings_per_jam', now() - INTERVAL '90 days', now() - INTERVAL '1 hour');
SELECT device_id, count(*), min(jam), max(jam) FROM readings_per_jam GROUP BY 1 ORDER BY 1;
```

**Hasilnya** (contoh):

```text
DELETE 783110
DELETE 1
CALL
  device_id   | count |          min           |          max           
--------------+-------+------------------------+------------------------
 beef00000001 |   721 | 2026-06-22 15:00:00+00 | 2026-07-22 15:00:00+00
 f00d00000001 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
 f00d00000002 |   191 | 2026-10-12 17:00:00+00 | 2026-10-20 15:00:00+00
(3 rows)
```

- Bacaan mentah dihapus lebih dulu, baru perangkatnya; urutan sebaliknya ditolak kunci tamu (Modul 17 Praktik 6.4). `DELETE` juga bekerja di jilid yang sudah dipadatkan.
- Buku ringkasan tidak ikut terhapus oleh `DELETE`. `CALL refresh_continuous_aggregate(…)` dengan jendela 90 hari meringkas ulang jam-jam itu dari data mentah yang kini kosong sehingga ringkasannya hilang.
- Ringkasan perangkat uji yang **lebih tua daripada 90 hari** (721 baris di contoh) tetap ada, persis seperti rancangan Konsep 7: ringkasan bertahan walaupun data mentahnya sudah tidak ada. Biarkan saja; ukurannya kecil sekali dibandingkan dengan bacaan mentah yang baru saja dihapus. Jangan memakai awal `NULL` untuk menghapusnya (🚨).

Data uji bisa dimuat lagi kapan saja dengan dua perintah di Praktik 4.2. Sesudahnya, ringkas ulang dengan jendela 90 hari seperti di atas (bukan `NULL`) karena petugas ringkasan hanya menengok tiga hari ke belakang. Bacaan yang lebih tua daripada 90 hari akan dibuang lagi oleh retensi pada putaran berikutnya.

**Bukti lulus Modul 18** (bandingkan dengan ✅ di bawah): kueri syarat lulus di bawah satu detik dari sejuta baris (Praktik 4.4), sidik jari database asli dan salinan yang sama persis (Praktik 7.5), dan *pull request* `fitur/timescaledb` yang sudah di-*merge*.

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Data deret waktu** (*time-series data*) | Data yang setiap barisnya ditandai waktu dan terus bertambah, misalnya bacaan sensor. Jarang diubah, dan biasanya ditanya per rentang waktu. "Buku harian", bukan "buku telepon". |
| **TimescaleDB** | Tambahan (*extension*) untuk PostgreSQL yang mengurus data deret waktu: hypertable, `time_bucket`, buku ringkasan otomatis, retensi, dan columnstore. Modul ini memakai versi 2.30.2 edisi Community. |
| **Tiger Data** | Nama baru perusahaan pembuat TimescaleDB (dulu bernama Timescale). Dokumentasinya ada di `tigerdata.com/docs`. |
| ***Extension*** (tambahan) | Paket yang menambah kemampuan PostgreSQL tanpa mengganti database-nya. `\dx` di psql menampilkan daftarnya. |
| **Hypertable** | Tabel yang dijilid otomatis menurut waktu. Dari luar tetap satu tabel (`readings`); di dalamnya terbagi menjadi banyak *chunk*. Dibuat dengan `create_hypertable`. |
| ***Chunk*** (potongan, jilid) | Tabel kecil di dalam hypertable yang menampung satu rentang waktu; di modul ini satu hari, dari pukul 00.00 UTC (07.00 WIB). Tinggal di skema `_timescaledb_internal`. |
| **`time_bucket`** (ember waktu) | Fungsi TimescaleDB yang mengubah setiap `ts` menjadi awal embernya, misalnya per 15 menit, per jam, atau per hari. Argumen ketiga, `'Asia/Jakarta'`, membuat ember harian (dan ember 6 jam) mengikuti hari WIB. |
| ***Continuous aggregate*** (agregat berkelanjutan, "buku ringkasan", CAGG) | Ringkasan berbentuk *view* yang hasilnya disimpan dan diperbarui sedikit demi sedikit oleh TimescaleDB, misalnya `readings_per_jam`. |
| **Ringkasan *real-time*** | Pengaturan `materialized_only = false`: jam-jam sesudah jam terakhir yang sudah diringkas dihitung langsung dari data mentah saat ditanya sehingga jam-jam terbaru selalu ikut tampil. |
| ***Refresh*** (meringkas ulang) | Menghitung ulang buku ringkasan untuk satu jendela waktu, dengan `CALL refresh_continuous_aggregate(…)` atau oleh petugas terjadwal. Awal jendela `NULL` berarti "dari data paling tua"; jangan dipakai lagi sesudah retensi bekerja. |
| **Rata-rata dari rata-rata** | Jebakan menghitung rata-rata gabungan dari beberapa rata-rata yang isinya tidak sama banyak. Rumus yang benar: jumlah (`rata × n`) dibagi jumlah `n`. Karena itulah buku ringkasan menyimpan `suhu_n`. |
| ***Job*** (tugas terjadwal) | Pekerjaan yang dijalankan penjadwal latar TimescaleDB menurut jadwalnya sendiri. *Job* buatanmu bernomor mulai 1000; daftarnya di `timescaledb_information.jobs`. |
| **Kebijakan** (*policy*) | Aturan yang kamu pasang, lalu dijalankan *job*: pembaruan ringkasan (`add_continuous_aggregate_policy`), retensi (`add_retention_policy`), dan columnstore (`add_columnstore_policy`). Langsung bekerja begitu dipasang. |
| **Retensi** (*retention*) | Membuang data mentah yang lebih tua daripada batas tertentu (di modul ini 90 hari) per *chunk* utuh, bukan dengan `DELETE` baris demi baris. Buku ringkasan tidak ikut dibuang. |
| **Columnstore** | Cara menyimpan *chunk* lama per kolom (bukan per baris) sehingga jauh lebih padat (di modul ini 152 MB menjadi 30 MB). Nama lamanya kompresi (*compression*). |
| **`segmentby`** dan **`orderby`** | Pengaturan columnstore: kelompokkan per perangkat (`device_id`), lalu urutkan menurut waktu (`ts DESC`) di dalam setiap kelompok. |
| **`EXPLAIN (ANALYZE)`** | Perintah yang menjalankan sebuah kueri lalu menceritakan rencananya: langkah-langkahnya, indeks yang dipakai, dan lama sebenarnya (`Execution Time`). |
| **`Seq Scan`** dan **`Index Scan`** | Dua cara membaca tabel: dari awal sampai akhir (`Seq Scan`), atau melompat lewat indeks langsung ke baris yang dicari (`Index Scan`). |
| **Pemangkasan *chunk*** (*chunk exclusion*) | Kemampuan hypertable melewati *chunk* yang rentang waktunya tidak cocok dengan `WHERE`, sebelum kueri berjalan. Di Praktik 4, sebanyak 113 dari 121 *chunk* dipangkas. |
| **`\timing`** | Perintah psql yang menyalakan (`on`) atau mematikan (`off`) catatan lama setiap perintah, `Time: … ms`. |
| ***Dead tuples*** dan ***autovacuum*** | Baris "mati" yang ditinggalkan `DELETE` dan `UPDATE`, beserta petugas kebersihan PostgreSQL yang membersihkannya belakangan. |
| **WAL** (*write-ahead log*) | Catatan perubahan yang ditulis PostgreSQL sebelum mengubah tabel supaya data selamat kalau listrik padam. Membesar setelah banyak `INSERT`. |
| **`generate_series`** | Fungsi PostgreSQL yang membuat deretan angka atau waktu, misalnya satu baris setiap 10 detik selama 120 hari. |
| **`setseed`** | Menetapkan benih "dadu" `random()` sehingga urutan angka acak sesudahnya selalu sama. |
| **`docker cp`** | Menyalin berkas dari laptop ke dalam kontainer, atau sebaliknya. |
| **Backup** dan **restore** | Backup adalah fotokopi seluruh database ke satu berkas; restore adalah membangun database baru dari berkas itu. Backup yang belum pernah di-restore sama dengan tidak punya backup. |
| **`pg_dump`** dan **`pg_restore`** | Program bawaan PostgreSQL untuk membuat backup (`-Fc`: format *custom* yang terkemas dan dipadatkan) dan memulihkannya. Di modul ini dijalankan di dalam kontainer. |
| **`timescaledb_pre_restore()`** dan **`timescaledb_post_restore()`** | Dua fungsi yang mengapit `pg_restore` untuk database TimescaleDB: menghentikan pekerja latar dan menyiapkan katalog, lalu menghidupkannya lagi. |
| **`template0`** | Cetakan database yang benar-benar polos. Dipakai `createdb -T template0` untuk database tujuan restore. |
| **Sidik jari** (`md5`) | Ringkasan 32 karakter dari sebuah teks. Kalau satu karakter saja berubah, sidik jarinya berubah total. Dipakai untuk membuktikan dua database berisi data yang sama persis. |
| **`bucket`** | Parameter baru API v0.3 (`?bucket=15m`, `1h`, atau `1d`) yang meminta riwayat diringkas per ember. Tanpa `bucket`, API menjawab bacaan mentah seperti Modul 17. |
| ***Enum*** (`z.enum`) | Daftar pilihan tetap. Zod menolak nilai di luar daftar dengan `400` sebelum sampai ke database. |
| **`Record<Kunci, Isi>`** | Tipe TypeScript untuk objek yang kuncinya ditentukan, misalnya `Record<Ember, string>`: harus punya tepat satu isian teks untuk setiap jenis ember. |
| **`UNION ALL`** | Menumpuk hasil beberapa `SELECT` menjadi satu tabel. |
| ***Downsampling*** | Menipiskan titik data untuk grafik, misalnya dengan ember waktu atau algoritme LTTB (🔬). |

## 📝 Kuis (5 soal)

1. Di Praktik 4, rencana kueri "rata-rata per jam 7 hari terakhir" pada hypertable hanya memuat 8 dari 121 *chunk*. Mengapa *chunk* lainnya tidak dibuka? Lalu, mengapa tabel biasa dengan indeks yang sama ternyata hampir sama cepat untuk kueri itu, dan di mana keunggulan hypertable yang sebenarnya?
2. Jam 10.00 berisi 360 bacaan dengan rata-rata suhu 30,0 °C. Jam 11.00 baru berisi 60 bacaan dengan rata-rata 26,0 °C. Berapa rata-rata suhu yang benar untuk kedua jam itu? Berapa hasilnya kalau dihitung sebagai "rata-rata dari rata-rata"? Kolom apa di buku ringkasan yang membuat jawaban yang benar bisa dihitung?
3. Sebulan setelah retensi 90 hari terpasang, temanmu menjalankan `CALL refresh_continuous_aggregate('readings_per_jam', NULL, now() - INTERVAL '1 hour');` "supaya ringkasannya segar". Apa akibatnya? Jendela seperti apa yang aman?
4. Temanmu membuat backup setiap malam di Windows PowerShell 5.1 dengan `docker exec rumahpintar-db pg_dump -U postgres -d rumahpintar -Fc > backup.dump`, dan belum pernah mencoba me-restore-nya. Apa yang salah dengan cara itu, dan bagaimana membuktikan bahwa sebuah backup benar-benar bisa dipakai?
5. Seseorang mengusulkan agar backend v0.3 langsung menyambung teks `bucket` ke SQL (misalnya `` `SELECT time_bucket('${req.query.bucket}', ts) …` ``) supaya bisa menerima ember berapa saja. Mengapa usul itu berbahaya? Apa yang dilakukan backend v0.3 sebagai gantinya, dan apa jawabannya untuk `?bucket=1H`?

<details>
<summary><b>Kunci jawaban</b></summary>

1. Setiap *chunk* menyimpan rentang waktunya sendiri, jadi TimescaleDB tahu bahwa *chunk* yang seluruh isinya lebih tua daripada tujuh hari tidak mungkin berisi jawaban. *Chunk* itu dilewati sebelum kueri berjalan (pemangkasan *chunk*, Konsep 4). Tabel biasa hampir sama cepat karena kunci utama `(device_id, ts)` juga indeks yang bisa melompat langsung ke perangkat dan rentang waktu yang dicari: untuk kueri ini, indekslah yang paling menentukan. Keunggulan hypertable yang sebenarnya ada di tempat lain: buku ringkasan yang menjawab dalam kurang dari 1 ms (Praktik 5), retensi yang membuang jilid utuh dalam sekejap dan langsung mengecilkan ukurannya, serta columnstore yang memadatkan data lama (Praktik 6).
2. Rata-rata yang benar: (360 × 30,0 + 60 × 26,0) ÷ (360 + 60) = 12.360 ÷ 420 ≈ **29,4 °C**. "Rata-rata dari rata-rata": (30,0 + 26,0) ÷ 2 = **28,0 °C**, terlalu rendah karena jam yang hanya berisi 60 bacaan diberi bobot yang sama dengan jam yang berisi 360. Kolom **`suhu_n`** (banyaknya nilai suhu per jam) membuat rumus `rata × n` bisa dihitung dari buku ringkasan (Konsep 5, Praktik 5.8).
3. Untuk jam-jam yang lebih tua daripada 90 hari, data mentahnya sudah dibuang retensi. *Refresh* dengan awal `NULL` menghitung ulang **semua** jam dari data mentah, jadi ringkasan jam-jam lama itu ikut **terhapus**, dan tidak bisa dibuat lagi kecuali dari backup (Konsep 7, 🚨). Jendela yang aman seluruhnya berada di dalam masa retensi, misalnya `now() - INTERVAL '8 days'` sampai `now() - INTERVAL '1 hour'`. Petugas ringkasan sendiri sudah aman karena hanya menengok tiga hari ke belakang.
4. Di Windows PowerShell 5.1, tanda `>` menulis ulang isi berkas sebagai teks UTF-16, jadi berkasnya hampir dua kali lebih besar dan rusak: `pg_restore` menolaknya dengan `input file does not appear to be a valid archive`. Karena tidak pernah dicoba, kerusakan itu baru ketahuan saat backup-nya dibutuhkan. Buat backup dengan `-f /tmp/…` di dalam kontainer lalu `docker cp`, dan buktikan secara berkala: pulihkan ke database baru (`createdb -T template0`, `CREATE EXTENSION timescaledb`, `timescaledb_pre_restore()`, `pg_restore`, `timescaledb_post_restore()`), lalu bandingkan jumlah baris, sidik jari `md5`, buku ringkasan, jilid, dan *job* dengan database asli (Praktik 7).
5. Menyambung teks dari luar ke SQL membuka pintu *SQL injection* (Modul 17 Konsep 10): siapa pun bisa menyelipkan perintah SQL lewat alamat API. Ember yang terlalu kecil juga bisa memaksa database membuat jutaan ember. Backend v0.3 hanya menerima tiga nilai tetap lewat `z.enum(["15m", "1h", "1d"])`, memakainya sebagai kunci kamus untuk memilih satu dari tiga kueri SQL tetap, dan mengirim `device_id` serta rentang waktunya sebagai parameter `$1`, `$2`, `$3`. Selain itu, permintaan yang menghasilkan lebih dari 1.000 ember ditolak. `?bucket=1H` dijawab **`400`** dengan `querystring/bucket Pilihan tidak valid: diharapkan salah satu dari "15m"|"1h"|"1d"` karena huruf besar berbeda dari huruf kecil (Konsep 10, Praktik 8.6).

</details>

---

## ✅ Checklist kelulusan Modul 18

Syarat lulus dari Silabus: **kueri "rata-rata per jam 7 hari terakhir" dari 1 juta baris selesai dalam waktu kurang dari 1 detik, dan backup-restore menghasilkan data yang sama.** **Jalur simulator** (belum punya Node 1 dan Node 2): semua butir boleh dicentang dengan data latihan, data uji, dan simulator Modul 16.

- [ ] Pemanasan ulang JavaScript selesai, dan jawaban "Uji dirimu" sudah kucocokkan dengan kuncinya (🔁).
- [ ] `\dx` menunjukkan TimescaleDB 2.30.2, dan aku sudah meringkas bacaan per 15 menit dengan `time_bucket` (Kemenangan Cepat).
- [ ] Pekerjaan minggu ini ada di cabang `fitur/timescaledb` (Praktik 1).
- [ ] ⭐ `readings` menjadi hypertable lewat migrasi `002`, dan aku bisa menunjukkan *chunk*-nya di psql (Praktik 2).
- [ ] Aku bisa menjelaskan mengapa ember 15 menit dan 1 jam tidak butuh zona waktu, sedangkan ember harian butuh `'Asia/Jakarta'` (Praktik 3).
- [ ] ⭐ Sejuta baris data uji termuat, dan kueri **rata-rata per jam 7 hari terakhir** selesai jauh di bawah 1 detik; aku juga bisa membaca rencananya dengan `EXPLAIN (ANALYZE)` dan membandingkannya dengan tabel biasa secara jujur (Praktik 4).
- [ ] ⭐ Buku ringkasan `readings_per_jam` berisi seluruh riwayat, menjawab kueri yang sama dalam waktu sekitar 1 ms, dan rata-rata harian dari rumus `rata × n` sama persis dengan data mentah (Praktik 5).
- [ ] Retensi 90 hari dan columnstore terpasang, ringkasan yang lebih tua daripada 90 hari tetap utuh, dan ukuran hypertable turun jauh (Praktik 6).
- [ ] ⭐ Backup-ku terbukti bisa dipulihkan: database salinan punya jumlah bacaan, sidik jari, buku ringkasan, jilid, dan *job* yang sama persis dengan aslinya (Praktik 7).
- [ ] ⭐ API v0.3 menjawab `bucket=15m`, `1h`, dan `1d`, menolak nilai lain dengan `400`, dan tes Bruno `riwayat per jam Node 1` lulus (Praktik 8).
- [ ] `backend/README.md` sudah diperbarui untuk v0.3 (➕ A).
- [ ] ⭐ Semua pekerjaan Modul 18 sudah ada di `main` repositori `rumah-pintar-mini` lewat *pull request*, tanpa `.env` dan tanpa berkas backup (➕ B).

🎉 **Riwayat Rumah Pintar Mini kini siap tumbuh bertahun-tahun.** Kueri atas sejuta baris dijawab dalam hitungan milidetik, ringkasan diperbarui sendiri, data lama dibuang dan dipadatkan tanpa disuruh, dan kamu sudah membuktikan bahwa backup-nya bisa dipulihkan. Data sudah rapi di arsip. Langkah berikutnya: membuat backend bereaksi terhadap data itu secara langsung.

> ➡️ **Modul berikutnya:** Modul 19 — Realtime, Kendali Dua Arah, Aturan Otomatis (Cloud & Lokal), & Notifikasi. Data mengalir ke browser tanpa *refresh*, aturan seperti "kalau suhu di atas 30 °C selama 2 menit, nyalakan kipas" bisa diatur tanpa mengubah kode, Node 1 tetap menjalankan aturan pengamannya sendiri saat server tidak terjangkau, dan Telegram mengirim peringatan kalau ada masalah.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- TimescaleDB 2.30.2 (dokumentasi Tiger Data): [memahami hypertable](https://www.tigerdata.com/docs/learn/hypertables/understand-hypertables), [*chunk*](https://www.tigerdata.com/docs/learn/chunks/understanding-chunks) dan [ukurannya](https://www.tigerdata.com/docs/learn/hypertables/sizing-hypertable-chunks), [`create_hypertable`](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/create_hypertable), [`show_chunks`](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/show_chunks), [`hypertable_size`](https://www.tigerdata.com/docs/reference/timescaledb/hypertables/hypertable_size), [indeks hypertable](https://www.tigerdata.com/docs/learn/hypertables/hypertable-indexes), [kunci utama dan kolom waktu](https://www.tigerdata.com/docs/learn/data-model/primary-keys-time-and-uniqueness), [ember waktu](https://www.tigerdata.com/docs/learn/data-lifecycle/time-buckets/about-time-buckets) dan [`time_bucket`](https://www.tigerdata.com/docs/reference/timescaledb/hyperfunctions/time-series-utilities/time_bucket), [*continuous aggregate*](https://www.tigerdata.com/docs/learn/continuous-aggregates) ([membuatnya](https://www.tigerdata.com/docs/build/continuous-aggregates/create-a-continuous-aggregate), [`CREATE MATERIALIZED VIEW`](https://www.tigerdata.com/docs/reference/timescaledb/continuous-aggregates/create_materialized_view), [agregat *real-time*](https://www.tigerdata.com/docs/learn/continuous-aggregates/real-time-aggregates), [kebijakan *refresh*](https://www.tigerdata.com/docs/build/continuous-aggregates/refresh-policies), [`add_continuous_aggregate_policy`](https://www.tigerdata.com/docs/reference/timescaledb/continuous-aggregates/add_continuous_aggregate_policy), [`refresh_continuous_aggregate`](https://www.tigerdata.com/docs/reference/timescaledb/continuous-aggregates/refresh_continuous_aggregate)), retensi ([cara kerjanya](https://www.tigerdata.com/docs/learn/data-lifecycle/data-retention/about-data-retention), [bersama *continuous aggregate*](https://www.tigerdata.com/docs/learn/data-lifecycle/data-retention/data-retention-with-continuous-aggregates), [`add_retention_policy`](https://www.tigerdata.com/docs/reference/timescaledb/data-retention/add_retention_policy)), columnstore ([menyiapkannya](https://www.tigerdata.com/docs/build/columnar-storage/setup-hypercore), [`ALTER TABLE`](https://www.tigerdata.com/docs/reference/timescaledb/hypercore/alter_table)), [backup dan restore logis](https://www.tigerdata.com/docs/deploy/self-hosted/backup-and-restore/logical-backup) dan [`timescaledb_pre_restore`](https://www.tigerdata.com/docs/reference/timescaledb/administration/timescaledb_pre_restore), [edisi TimescaleDB](https://www.tigerdata.com/docs/get-started/choose-your-path/timescaledb-editions), serta kode sumber dan catatan perubahan di [github.com/timescale/timescaledb](https://github.com/timescale/timescaledb) (*tag* 2.30.2: `sql/restoring.sql`, `sql/policy_api.sql`, `CHANGELOG.md`). Image: [`timescale/timescaledb` di Docker Hub](https://hub.docker.com/r/timescale/timescaledb) (*tag* `2.30.2-pg17`).
- PostgreSQL 17: [`EXPLAIN`](https://www.postgresql.org/docs/17/sql-explain.html) dan [cara membacanya](https://www.postgresql.org/docs/17/using-explain.html), [indeks berurutan](https://www.postgresql.org/docs/17/indexes-ordering.html), [`generate_series`](https://www.postgresql.org/docs/17/functions-srf.html), [`random` dan `setseed`](https://www.postgresql.org/docs/17/functions-math.html), [`md5`](https://www.postgresql.org/docs/17/functions-string.html) dan [`string_agg`](https://www.postgresql.org/docs/17/functions-aggregate.html), [fungsi tanggal dan waktu](https://www.postgresql.org/docs/17/functions-datetime.html), [memuat data dalam jumlah besar](https://www.postgresql.org/docs/17/populate.html), [`VACUUM` rutin](https://www.postgresql.org/docs/17/routine-vacuuming.html) (*dead tuples*), [WAL](https://www.postgresql.org/docs/17/wal-intro.html), [`pg_dump`](https://www.postgresql.org/docs/17/app-pgdump.html), [`pg_restore`](https://www.postgresql.org/docs/17/app-pgrestore.html), [`createdb`](https://www.postgresql.org/docs/17/app-createdb.html), [database templat](https://www.postgresql.org/docs/17/manage-ag-templatedbs.html) (`template0`), [partisi deklaratif](https://www.postgresql.org/docs/17/ddl-partitioning.html) (🔬), dan [psql](https://www.postgresql.org/docs/17/app-psql.html) (`\timing`, *pager*).
- Docker: [`docker container cp`](https://docs.docker.com/reference/cli/docker/container/cp/) dan [`docker container exec`](https://docs.docker.com/reference/cli/docker/container/exec/). PowerShell: [pengalihan keluaran `>`](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_redirection) (mengapa berkas biner rusak di Windows PowerShell 5.1).
- Dari Modul 16–17: [Fastify](https://fastify.dev/docs/latest/) 5.12.7, [Zod](https://zod.dev) 4.6.7 (`z.enum`, `.refine` dengan `when`), [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) 7.0.0, [node-postgres](https://node-postgres.com) (`pg` 8.23.1), [TypeScript](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) 7.0.2 (`Record<Kunci, Isi>`), [Bruno](https://docs.usebruno.com) 4.2.1, dan Swagger UI 5.32.6 lewat [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) 6.1.2.
- Bacaan tambahan 🔬: [InfluxDB 3 Core](https://docs.influxdata.com/influxdb3/core/) dan [README-nya](https://github.com/influxdata/influxdb) (lisensi MIT atau Apache 2), [`time_bucket_gapfill`](https://www.tigerdata.com/docs/reference/timescaledb/hyperfunctions/time_bucket_gapfill/time_bucket_gapfill), [*continuous aggregate* bertingkat](https://www.tigerdata.com/docs/learn/continuous-aggregates/hierarchical-continuous-aggregates), [`lttb` di TimescaleDB Toolkit](https://www.tigerdata.com/docs/reference/toolkit/downsampling/lttb) dan [cara memasang Toolkit](https://www.tigerdata.com/docs/deploy/self-hosted/tooling/install-toolkit), algoritme LTTB dari [flot-downsample](https://github.com/sveinn-steinarsson/flot-downsample), serta [DBeaver dengan TimescaleDB](https://www.tigerdata.com/docs/integrate/query-administration/dbeaver) dan kode sumber [DBeaver 26.2.3](https://github.com/dbeaver/dbeaver) (jenis koneksi TimescaleDB).

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-18`, `jilid-hypertable`, `buku-ringkasan`, `retensi-ringkasan`, `backup-restore`, `diagram-proyek-modul-18` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Perilaku hypertable, buku ringkasan, retensi, dan restore dari dokumentasi TimescaleDB di atas; angka (jumlah jilid, ukuran, sidik jari) dari lab penulis untuk modul ini. | CC BY 4.0 |
| `swagger-ember.png` | Tangkapan layar asli halaman `/docs` backend v0.3 modul ini (Swagger UI 5.32.6 lewat @fastify/swagger-ui 6.1.2) di laptop penulis: rute `GET /devices/{id}/readings` yang dicoba dengan **Try it out** dan `bucket=1d`; dipotong dan disusun ulang, dengan judul, nomor, dan keterangan oleh penulis. | Swagger UI berlisensi Apache 2.0; @fastify/swagger-ui berlisensi MIT; gambar: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua perintah, SQL, dan kode modul ini dijalankan penulis di laptop Windows dengan Docker Desktop 4.77 (Docker Engine 29.5.3) dan image `timescale/timescaledb:2.30.2-pg17` (PostgreSQL 17.11, TimescaleDB 2.30.2) yang sama dengan Modul 17, di kontainer lab tersendiri, dengan urutan langkah yang sama persis dengan modul ini. Kode backend diperiksa dengan `npm run cek` (TypeScript 7.0.2) dan dijalankan dengan Node.js 24.21.0. Keluaran `docker cp` direkam di terminal PowerShell sungguhan karena pesan `Successfully copied …` hanya muncul di terminal. Perintah backup dan restore juga diuji di Windows PowerShell 5.1, PowerShell 7, dan Bash. Waktu (milidetik), ukuran, nama *chunk*, nomor *job*, dan stempel waktu di layarmu bisa berbeda, jadi keluaran seperti itu ditandai **contoh**. Jam di log backend contoh ditulis dalam WIB. Data latihan dibuat dengan `npm run isi-riwayat`, jadi rata-rata hari-hari sebelum hari H sama di laptop siapa pun; data uji dibuat dengan `setseed`, jadi banyaknya baris sama persis dan rata-ratanya hampir sama.

---

[⬅️ Modul 17](../modul-17-sql-dan-skema-database/README.md) · [Fase 3](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 19 — Realtime, Kendali Dua Arah, Aturan Otomatis (Cloud & Lokal), & Notifikasi** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-19--realtime-kendali-dua-arah-aturan-otomatis-cloud--lokal--notifikasi))
