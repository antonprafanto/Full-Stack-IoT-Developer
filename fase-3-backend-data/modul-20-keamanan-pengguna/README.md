# Modul 20 — Keamanan Pengguna: Login, JWT di Cookie, Peran, & Pengaman API

🌐 **Bahasa Indonesia** · [English](../../en/phase-3-backend-data/module-20-user-security/README.md)

*Fase 3 · Minggu 20 · Perangkat keras (*hardware*): **Kit A + B** (Node 1 dan gateway Pi dari Modul 12–15) **atau laptop saja** (simulator perangkat Modul 19) · Prasyarat: **Modul 19** (backend v0.4, database `rumahpintar`, dan terminal kecil) · Waktu: 9–11 jam, dicicil dalam satu minggu*

[⬅️ Modul 19](../modul-19-realtime-aturan-notifikasi/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 21 ➡️](../modul-21-keamanan-perangkat-broker/README.md)

---

Rumahmu kini bereaksi sendiri: bacaan mengalir *live* ke terminal, kipas dinyalakan aturan, pompa menyiram setiap pagi, dan Telegram mengabarimu saat suhu naik. Namun, ada satu pertanyaan yang belum pernah diajukan backend kepada siapa pun yang mengetuk pintunya: **"Kamu siapa?"** Siapa saja yang bisa mengirim `POST /devices/:id/command` boleh menyalakan pompa. Siapa saja yang bisa mengirim `PUT /rules/1` boleh menaikkan ambang kipas ke 45 °C sehingga kipas hampir tidak pernah menyala lagi. Siapa saja yang menyambung ke Socket.IO boleh mengintip suhu, kelembapan, dan gerakan di rumahmu, dan dari situ menebak kapan rumah sedang kosong.

Selama ini hal itu belum jadi masalah besar karena backend hanya mendengar di `127.0.0.1`, yaitu hanya bisa diketuk dari laptop itu sendiri. Namun, keadaan itu tidak akan bertahan lama. Modul 22 membuat dashboard di browser, dan Fase 5 memindahkan backend ke server yang bisa diketuk dari internet. Saat itu tiba, pintunya harus sudah berkunci. Minggu ini kamu memasang kuncinya: **akun dengan kata sandi, *login*, peran, dan penjaga di setiap pintu**, dengan cara yang lazim dipakai aplikasi web sungguhan dan sering ditanyakan di wawancara kerja.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Siapa pun yang bisa mengetuk API boleh menyalakan pompa dan mengubah aturan. | Backend tidak menanyakan identitas. | **Akun dan *login*** `POST /auth/login`, lalu **satpam** di setiap pintu: tanpa *login*, semua *endpoint* (alamat API) menjawab **401** (Konsep 2 dan 6, Praktik 2–3) |
| Kalau sandi akun disimpan apa adanya, database yang bocor membocorkan semua sandi. | Database bisa bocor lewat cadangan (*backup*), laptop yang hilang, atau kesalahan kecil. | **Sidik jari sandi** dengan bcrypt: database hanya menyimpan sidik jarinya, bukan sandinya (Konsep 3, Praktik 1) |
| Setelah *login*, setiap permintaan harus membuktikan pengirimnya tanpa mengirim sandi lagi. | HTTP tidak punya ingatan: setiap permintaan berdiri sendiri. | **JWT** ("gelang masuk konser") berumur 15 menit, disimpan di ***cookie* `httpOnly`** yang tidak bisa dibaca JavaScript (Konsep 4–5, Praktik 2) |
| Gelang yang bocor tetap berlaku sampai habis, dan *logout* (keluar) tidak benar-benar mengunci. | JWT tidak bisa ditarik kembali sebelum kedaluwarsa. | ***Refresh token*** ("kartu terusan") yang dicatat di tabel `sesi`: diganti setiap dipakai, dan dicabut saat *logout* (Konsep 7, Praktik 4) |
| Semua orang yang masuk boleh melakukan apa saja. | Belum ada pembagian hak. | **Peran `admin` dan `viewer`**: akun `viewer` hanya boleh melihat, dan setiap upaya mengubah sesuatu dijawab **403** (Konsep 6, Praktik 3) |
| Penebak sandi otomatis bisa mencoba ribuan sandi per menit. | Tidak ada batas percobaan. | ***Rate limiting*** (pembatasan laju): paling banyak 10 percobaan *login* per menit dari satu alamat; percobaan ke-11 dijawab **429** (Konsep 8, Praktik 5) |
| Halaman web lain di browser-mu bisa ikut menumpang *login*-mu. | Browser mengirim *cookie* (kuki) secara otomatis. | **CORS** dan **pemeriksaan asal** (kepala `Origin`): hanya halaman yang kamu izinkan yang boleh memerintah backend (Konsep 5 dan 9, Praktik 6) |
| Terminal kecil melihat data *live* tanpa *login*. | Socket.IO punya pintu sendiri yang tidak dijaga satpam API. | **Socket.IO ikut dikunci**: saat terminal atau browser menyambung, Socket.IO memeriksa *cookie* yang sama (Konsep 10, Praktik 7) |
| Rahasia seperti sandi database, token bot, dan kunci JWT bisa ikut ke GitHub. | Satu `git add .` yang ceroboh sudah cukup. | **`.env` + `.gitignore` + GitHub *secret scanning*** (pemindaian rahasia), dan data pribadi disimpan seminimal mungkin (Konsep 11, Praktik 8) |

Di akhir minggu, **tanpa *login* semua *endpoint* menjawab 401**, **akun `viewer` gagal menyalakan relay (HTTP 403)**, dan **percobaan *login* ke-11 dalam semenit ditolak**. Itulah tiga syarat lulus modul ini. Backend naik ke **v0.5: berkunci untuk manusia**. Kunci untuk perangkat (akun broker dan hak akses topik MQTT) menyusul di Modul 21.

![Peta jalan Modul 20. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 3 Backend dan data, Modul 16 sampai 21, disorot dengan bingkai hijau. Modul 1 sampai 19 bertanda selesai, Modul 21 berwarna hijau, dan Modul 20 ditandai KAMU DI SINI dengan catatan: rumah dikunci untuk manusia, yaitu akun, login, peran, dan pengaman API. Di bawahnya, kotak Modul 20 minggu ini, 9 sampai 11 jam dicicil; Kit A + B atau laptop saja, lanjutan langsung Modul 19 dengan backend v0.4 dan database rumahpintar. Daftar kegiatan: pemanasan ulang JavaScript, yaitu sidik jari, bilangan acak, gelang dan satpam mini; Kemenangan Cepat, sidik jari kata sandi pertamamu dengan bcrypt; Praktik 1, rahasia, tabel sesi, dan akun pertama; Praktik 2, login dan gelang di cookie; Praktik 3, satpam di setiap pintu, dengan syarat lulus tanpa login 401 dan viewer yang mencoba menyalakan relay 403; Praktik 4, refresh dan logout; Praktik 5, batasi percobaan login, dengan syarat lulus percobaan ke-11 dalam semenit ditolak; Praktik 6, CORS dan pemeriksaan asal; Praktik 7, Socket.IO ikut dikunci; Praktik 8, rahasia, privasi, dan uji kelulusan; dan Tambahan, backend v0.5 dan pull request yang ditinjau dengan checklist keamanan. Praktik 3, 5, 7, 8, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: dua jalur, yaitu perangkat (Node 1 dan gateway Pi) atau laptop (broker di laptop dan simulator Modul 19), dan firmware tidak berubah minggu ini; hampir semuanya terjadi di laptop: backend, database, Bruno, terminal, dan browser (Chrome atau Edge).](aset/peta-jalan-modul-20.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Hampir semuanya terjadi di laptop**: backend, database, Bruno, terminal, dan browser. Perangkat hanya dibutuhkan di tiga tempat: Praktik 3 dan 🧩 Tingkat 1, untuk membuktikan bahwa akun yang berhak masih bisa menyalakan relay (perintah butuh jawaban `ack` dari perangkat), dan Praktik 7, untuk data *live* di terminal kecil. **Jalur perangkat** memakai Node 1 dan broker Mosquitto di Pi (Modul 12–15). **Jalur laptop** memakai layanan Mosquitto di laptop dan simulator perangkat Modul 19. Firmware tidak berubah minggu ini.
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **terminal VS Code** (di folder `backend` atau `alat`), **psql**, **Bruno**, dan **browser** (Chrome atau Edge) beserta DevTools-nya. Pengguna Windows: pakai terminal VS Code bawaan (PowerShell), **bukan Git Bash**, karena prompt kata sandi di Praktik 1 butuh terminal yang bisa menyembunyikan ketikan.
> - **Lanjutan langsung Modul 19.** Kontainer `rumahpintar-db`, database `rumahpintar` (migrasi 001–005 dan 007), backend v0.4 di cabang `main`, koleksi Bruno, dan folder `alat` dipakai lagi apa adanya.
> - **Alamatnya selalu `http://127.0.0.1:8080`**, persis seperti Modul 16–19, baik di Bruno, terminal, maupun browser. Jangan diganti dengan `localhost:8080`: *cookie* melekat pada **nama host**, jadi *login* di satu nama tidak berlaku di nama yang lain.
> - **Kotak Hasilnya.** Semua perintah dan kode modul ini dijalankan penulis di laptop Windows dengan Node.js 24, PowerShell 5.1 dan 7, Bruno CLI, dan Chrome. Bruno versi desktop tidak terpasang di laptop penulis, jadi langkah di jendela Bruno ditulis dari Modul 16–19 dan kode sumber Bruno (rinciannya di 📚 Sumber). Jam, nomor sesi, lama jawaban (milidetik), dan isi token di layarmu pasti berbeda, jadi keluaran seperti itu ditandai **contoh**. Token, *cookie*, dan sidik jari sandi dari akun lab penulis sengaja dipotong dengan `…`; yang tampil utuh hanyalah contoh latihan yang tidak dipakai di mana pun. Milikmu sendiri adalah **rahasia**.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di VS Code, browser, dan Bruno. **Kecuali di terminal:** menghentikan program yang sedang berjalan tetap **Ctrl + C**. Perintah terminal sama persis di Windows dan macOS, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Kata sandi akun hanya diketik di tempat yang memang disiapkan untuknya**: prompt `npm run pengguna`, formulir *login* (termasuk **Try it out** di `/docs`), pengelola sandimu, dan file yang tidak ikut Git, yaitu `backend/bruno/.env`, `alat/.env`, serta berkas uji `login*.json` kalau kamu mengerjakan bagian pilihan curl. Jangan pernah menulisnya sebagai argumen perintah, di kode, di file `.yml` Bruno, atau di tangkapan layar.
> 2. **`JWT_SECRET` adalah stempel pembuat gelang.** Siapa pun yang memegangnya bisa membuat gelang `admin` palsu. Simpan hanya di file `.env`. Kalau telanjur bocor, buat yang baru: semua gelang lama, termasuk gelang palsu buatan orang lain, langsung tidak sah. Pemilik akun yang sah cukup me-*refresh* dengan kartu terusannya untuk mendapat gelang baru.
> 3. **Jangan pernah memberikan isi *cookie* `akses` atau `sesi` kepada orang lain**, termasuk saat bertanya di forum atau grup. Pemegang *cookie* itu masuk sebagai kamu sampai *cookie*-nya kedaluwarsa.
> 4. **Satu gembok tidak cukup; keamanan itu berlapis.** Backend tetap hanya mendengar di `127.0.0.1` minggu ini (`HOST` jangan diubah menjadi `0.0.0.0`). Membuka backend ke jaringan dan internet baru dilakukan di Fase 5, bersama HTTPS.
> 5. **Bentuk tabel tetap hanya diubah lewat file migrasi**, seperti Modul 17–19.

Ritme modul ini sama dengan Modul 1–19. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🏆 Kemenangan Cepat: sidik jari kata sandi pertamamu (20 menit)](#-kemenangan-cepat-sidik-jari-kata-sandi-pertamamu-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Model ancaman](#1-model-ancaman-siapa-yang-mungkin-iseng-dan-apa-akibatnya) · [2 401 lawan 403](#2-autentikasi-dan-otorisasi-401-lawan-403) · [3 Sidik jari sandi](#3-sidik-jari-kata-sandi-simpan-sidik-jari-bukan-wajah) · [4 JWT](#4-jwt-gelang-masuk-konser) · [5 *Cookie* `httpOnly`](#5-cookie-httponly-bukan-localstorage) · [6 Satpam & peran](#6-satpam-di-setiap-pintu-peran-admin-dan-viewer) · [7 *Refresh token* & *logout*](#7-refresh-token-dan-logout-kartu-terusan-di-loket) · [8 *Rate limiting*](#8-rate-limiting-jam-pasir-untuk-penebak-sandi) · [9 CORS](#9-cors-mengapa-browser-menolak) · [10 Socket.IO dikunci](#10-socketio-ikut-dikunci-pintu-aula-memakai-gelang-yang-sama) · [11 Rahasia & privasi](#11-rahasia-dan-privasi-yang-tidak-boleh-bocor)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Akun pertama](#praktik-1--rahasia-tabel-sesi-dan-akun-pertama-60-menit) · [2 *Login*](#praktik-2--login-dan-gelang-di-cookie-50-menit) · [3 Satpam](#praktik-3--satpam-di-setiap-pintu-401-dan-403-50-menit) · [4 *Refresh* & *logout*](#praktik-4--refresh-dan-logout-50-menit) · [5 *Rate limit*](#praktik-5--batasi-percobaan-login-30-menit) · [6 CORS](#praktik-6--cors-dan-pemeriksaan-asal-40-menit) · [7 Socket.IO](#praktik-7--socketio-ikut-dikunci-50-menit) · [8 Uji kelulusan](#praktik-8--rahasia-privasi-dan-uji-kelulusan-40-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-20)

## 🎯 Setelah modul ini kamu bisa…

1. **Menyusun model ancaman sederhana** untuk Rumah Pintar Mini: siapa yang mungkin iseng, lewat pintu mana, dan apa akibatnya, lalu memilih kunci yang sepadan.
2. **Menyimpan kata sandi sebagai sidik jari bcrypt**, dan menjelaskan kenapa sidik jari tidak bisa dibalik, kenapa setiap sidik jari diberi "garam", dan kenapa sandi yang panjang lebih penting daripada sandi yang rumit.
3. **Membuat *login*** `POST /auth/login` yang memberi **JWT di *cookie* `httpOnly`**, dan menjelaskan kenapa token itu tidak disimpan di `localStorage`.
4. **Memakai *refresh token*** yang diganti setiap kali dipakai, dan ***logout*** yang benar-benar mencabut sesi di database.
5. **Mengunci semua *endpoint*** dengan satu satpam (tanpa *login* → **401**) dan **membedakan peran `admin` dan `viewer`** (`viewer` yang mencoba mengubah sesuatu → **403**).
6. **Membatasi percobaan *login*** menjadi 10 per menit (yang ke-11 → **429**) dan mengujinya dengan Bruno.
7. **Menjelaskan kenapa browser menolak** permintaan lintas asal (**CORS**), menyetel daftar asal yang diizinkan, dan **menolak perintah dari halaman asing** dengan pemeriksaan `Origin`.
8. **Mengunci Socket.IO** dengan *cookie* yang sama sehingga terminal kecil harus *login* dulu sebelum boleh melihat data *live*.
9. **Menjaga rahasia** (`.env`, `.gitignore`, GitHub *secret scanning*) dan **privasi data pengguna**, lalu meninjau *pull request* dengan **checklist keamanan**.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 19** | Docker Desktop dengan kontainer **`rumahpintar-db`** yang menyala, database `rumahpintar` (migrasi 001–005 dan 007), **backend v0.4** yang sudah di-*merge* ke `main` di Modul 19 ➕ C, serta folder `alat` berisi terminal kecil dan simulator perangkat. |
| **Node.js 24, VS Code, Git, Bruno** | Sama seperti Modul 16–19. |
| **Broker MQTT dan sumber bacaan** | **Jalur perangkat:** Mosquitto di Pi dan Node 1. **Jalur laptop:** layanan Mosquitto di laptop dan simulator perangkat Modul 19. Keduanya hanya dibutuhkan untuk membuktikan bahwa akun yang berhak masih bisa memerintah perangkat (Praktik 3 dan 🧩 Tingkat 1) dan untuk data *live* di terminal kecil (Praktik 7). |
| **Browser Chrome atau Edge** | Untuk `/docs` (Praktik 3, 6, dan 8) dan tab **Console** di **DevTools** (Praktik 6). Browser lain bisa dipakai, tetapi tampilan DevTools-nya berbeda dari modul ini. |
| **Terminal yang bisa menyembunyikan ketikan** | **Windows:** terminal VS Code (PowerShell) atau Windows Terminal. **macOS:** terminal VS Code atau aplikasi Terminal. Git Bash tidak dipakai untuk `npm run pengguna` (Praktik 1). |
| **Koneksi internet** | Untuk `npm install` lima paket baru: bcrypt, @fastify/cookie, @fastify/jwt, @fastify/rate-limit, dan @fastify/cors. Tambahannya kecil: 20 paket (termasuk paket pendukungnya), dan folder `node_modules` hanya bertambah sekitar 4 MB. |
| **Akun GitHub** | Sudah ada sejak Modul 16. Praktik 8 menengok tab **Security and quality** repositori `rumah-pintar-mini`, dan ➕ menggabungkan semua pekerjaan lewat *pull request*. |

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, dan folder repositori `belajar-iot`.

Seperti Modul 16–19, modul Fase 3 dibuka dengan pemanasan JavaScript. Hampir semua kunci minggu ini dibangun dari lima kemampuan kecil yang sudah tersedia di Node.js, tanpa memasang apa pun: **sidik jari** (*hash*) dengan `createHash`, **bilangan acak yang tidak bisa ditebak** dengan `randomBytes`, **mengubah objek menjadi teks dan sebaliknya** dengan `Buffer` dan *base64url*, **tanda tangan** dengan `createHmac`, dan **`Set`** sebagai daftar tamu. Di akhir pemanasan, kelimanya kamu rangkai menjadi "gelang konser" dan "satpam" mini. Versi sungguhannya kamu pasang di backend pada Praktik 2–3. Ketik kodenya sendiri (jangan disalin-tempel), jalankan setelah setiap langkah, lalu cocokkan hasilnya.

**Siapkan foldernya.** Buka folder repositori **`belajar-iot`** di VS Code, klik dulu ruang kosong di panel Explorer, buat folder baru **`modul-20`**, lalu jalankan di terminal:

```text
cd modul-20
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` diperlukan karena file ini memakai `import` (sama seperti pemanasan Modul 16–19). Lalu buat file **`pemanasan.js`** di folder `modul-20`.

### Langkah 1 — Sidik jari: `createHash`

Fungsi ***hash*** mengubah teks apa pun menjadi deretan huruf dan angka yang panjangnya selalu sama. Hasilnya seperti **sidik jari**: teks yang sama selalu menghasilkan sidik jari yang sama, beda satu huruf saja sudah menghasilkan sidik jari yang sama sekali lain, dan dari sidik jarinya kamu **tidak bisa menghitung balik** teks aslinya. Ketik di `pemanasan.js`:

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 20
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";

// 1. Sidik jari: createHash
const sidikJari = (teks) => createHash("sha256").update(teks).digest("hex");
console.log(sidikJari("kopi pagi"));
console.log(sidikJari("kopi pagi"));
console.log(sidikJari("kopi pagI"));
console.log(sidikJari("kopi pagi").length, sidikJari("kalimat yang jauh lebih panjang daripada kopi pagi").length);
```

Simpan (**Ctrl + S**), lalu jalankan di terminal:

```text
node pemanasan.js
```

**Hasilnya:**

```text
2b622b806b64eb5b4a1e0e79bf4213d80c381939d283892fa82fc35f16ee5fd7
2b622b806b64eb5b4a1e0e79bf4213d80c381939d283892fa82fc35f16ee5fd7
511f584f6dbd45e60b051f14e2e4a8e1c0d210b0414853898f5f92017e35c4c3
64 64
```

- **`node:crypto`** adalah modul bawaan Node.js untuk urusan kriptografi (ilmu sandi). Tidak perlu `npm install`.
- **`createHash("sha256")`** memilih resep sidik jari bernama **SHA-256**, `.update(teks)` memasukkan teksnya, dan `.digest("hex")` mengeluarkan hasilnya sebagai 64 huruf heksadesimal (0–9 dan a–f).
- Dua baris pertama sama persis, padahal dihitung terpisah. Baris ketiga hanya beda satu huruf besar di ujung (`pagI`), tetapi sidik jarinya berubah total. Baik teks pendek maupun panjang sama-sama menghasilkan 64 huruf.

Sidik jari tidak bisa dihitung balik, tetapi bisa **ditebak**: hitung sidik jari sebuah tebakan, lalu bandingkan. Bayangkan sidik jari sebuah sandi bocor dari database orang lain. Tambahkan di paling bawah:

```js
const bocor = "bee5688aea66a47460b19c76f8f199c6b9585eb726f8322b1429793863609ca2";
const sandiPopuler = ["123456", "password", "qwerty", "rahasia123", "iloveyou"];
for (const tebakan of sandiPopuler) {
  if (sidikJari(tebakan) === bocor) console.log(`ketemu: ${tebakan}`);
}
const mulai = performance.now();
for (let i = 0; i < 100_000; i++) sidikJari(`tebakan-${i}`);
console.log(`100.000 tebakan: ${Math.round(performance.now() - mulai)} ms`);
```

**Hasilnya** (baris baru; angka milidetik di laptopmu berbeda):

```text
ketemu: rahasia123
100.000 tebakan: 454 ms
```

- Penebak tidak perlu membalik sidik jari. Ia cukup mencoba sandi-sandi populer satu per satu, dan `rahasia123` langsung ketemu.
- **`performance.now()`** memberi waktu sekarang dalam milidetik, jadi selisih dua pembacaannya adalah lama sebuah pekerjaan. Laptop penulis menghitung 100.000 sidik jari SHA-256 dalam kurang dari setengah detik, dan kartu grafis milik penyerang bisa menghitung miliaran sidik jari per detik. Inilah sebabnya **SHA-256 terlalu cepat untuk menyimpan kata sandi**. Kemenangan Cepat sebentar lagi memperkenalkan bcrypt, sidik jari yang **sengaja dibuat lambat** (Konsep 3).

### Langkah 2 — Bilangan acak yang tidak bisa ditebak: `randomBytes`

Setelah *login*, backend memberi browser sebuah tanda pengenal panjang yang nanti ditukarkan dengan gelang baru (Konsep 7). Tanda itu harus **acak dan tidak bisa ditebak**. `Math.random()` tidak cukup: angkanya dibuat untuk permainan dan simulasi, bukan untuk rahasia. Tambahkan:

```js
// 2. Bilangan acak yang tidak bisa ditebak
const token1 = randomBytes(32).toString("base64url");
const token2 = randomBytes(32).toString("base64url");
console.log(token1);
console.log(token2);
console.log(token1.length, token1 === token2);
```

**Hasilnya** (baris baru; **contoh**, dua baris pertamamu pasti berbeda):

```text
AEawGEod4f2sGj_ny5GyPoHinvN-98qS8s6n7Bkri1s
1nBQzrBXabpoIaNLmtndxHpXRzOfkR4t0remqWoWuu4
43 false
```

- **`randomBytes(32)`** mengambil 32 *byte* acak dari sumber acak sistem operasi, yang memang dibuat untuk keperluan rahasia.
- **`.toString("base64url")`** menuliskan 32 *byte* itu sebagai 43 huruf yang aman ditaruh di alamat web dan *cookie*: huruf besar dan kecil, angka, `-`, dan `_`.
- Peluang dua token kembar praktis nol: ada 2²⁵⁶ kemungkinan, lebih banyak daripada jumlah atom di Bumi.

### Langkah 3 — Membuat dan membaca "gelang"

**JWT** (Konsep 4) adalah tiga potong teks *base64url* yang disambung titik: **kepala** (jenis tanda tangan), **isi** (siapa pemakainya dan sampai kapan berlaku), dan **tanda tangan**. Langkah ini membuat gelang sederhana dengan resep yang sama. Tambahkan:

```js
// 3. Membuat dan membaca "gelang"
const RAHASIA = "stempel-panitia-hanya-panitia-yang-tahu";
const keTeks = (objek) => Buffer.from(JSON.stringify(objek)).toString("base64url");
const tandaTangan = (kepalaDanIsi) => createHmac("sha256", RAHASIA).update(kepalaDanIsi).digest("base64url");
function buatGelang(isi) {
  const kepalaDanIsi = `${keTeks({ alg: "HS256", typ: "JWT" })}.${keTeks(isi)}`;
  return `${kepalaDanIsi}.${tandaTangan(kepalaDanIsi)}`;
}
const detikSekarang = () => Math.floor(Date.now() / 1000);
const gelang = buatGelang({ sub: "2", peran: "viewer", exp: detikSekarang() + 900 });
console.log(gelang);
const [kepala, isi, tanda] = gelang.split(".");
console.log(JSON.parse(Buffer.from(isi, "base64url").toString()));
```

**Hasilnya** (baris baru; **contoh**, angka `exp` dan kedua potongan terakhir di layarmu berbeda):

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicGVyYW4iOiJ2aWV3ZXIiLCJleHAiOjE3OTI2MjkyNjZ9.1Pde6pbm4yib_yGnNBeFDGggZY8xf8eK0pHpPid5998
{ sub: '2', peran: 'viewer', exp: 1792629266 }
```

- **`keTeks`** mengubah objek menjadi teks JSON, lalu menjadi *base64url*. `Buffer.from(…, "base64url").toString()` di baris terakhir membaliknya.
- **`createHmac("sha256", RAHASIA)`** membuat sidik jari yang **dicampur rahasia**. Hasilnya adalah tanda tangan: hanya pemegang `RAHASIA` yang bisa membuat tanda tangan yang cocok.
- **`exp`** (*expiry*, kedaluwarsa) adalah detik saat gelang berhenti berlaku. `Date.now()` memberi milidetik sejak 1 Januari 1970, jadi dibagi 1.000 lalu dibulatkan ke bawah. `+ 900` berarti 15 menit dari sekarang.
- **Perhatikan baris kedua:** isi gelang terbaca tanpa rahasia apa pun. Gelang **ditandatangani, bukan dirahasiakan**. Karena itu, isi JWT tidak boleh memuat sandi, email, atau data pribadi lain.
- Potongan pertama selalu `eyJhbGciOi…`. Kepala dan isi JWT adalah objek JSON yang ditulis rapat, jadi selalu diawali `{"`, dan dalam *base64url* awalan itu menjadi `eyJ`. Kalau suatu hari kamu melihat teks panjang berawalan `eyJ`, kemungkinan besar itu JWT, dan isinya bisa dibaca siapa saja.

### Langkah 4 — Memeriksa gelang: tanda tangan dan kedaluwarsa

Siapa pun bisa membaca isi gelang, jadi siapa pun juga bisa **mengubahnya**, misalnya mengubah `viewer` menjadi `admin`. Yang tidak bisa ia lakukan adalah membuat tanda tangan baru yang cocok karena ia tidak tahu `RAHASIA`. Tambahkan:

```js
// 4. Memeriksa gelang: tanda tangan dan kedaluwarsa
function periksaGelang(teks) {
  const [kepala, isi, tanda] = teks.split(".");
  if (tandaTangan(`${kepala}.${isi}`) !== tanda) return null; // tanda tangan tidak cocok: palsu
  const data = JSON.parse(Buffer.from(isi, "base64url").toString());
  if (data.exp <= detikSekarang()) return null; // sudah kedaluwarsa
  return data;
}
const gelangPalsu = `${kepala}.${keTeks({ sub: "2", peran: "admin", exp: detikSekarang() + 900 })}.${tanda}`;
const gelangBasi = buatGelang({ sub: "2", peran: "viewer", exp: detikSekarang() - 1 });
console.log(periksaGelang(gelang)?.peran, periksaGelang(gelangPalsu), periksaGelang(gelangBasi));
assert.equal(periksaGelang(gelangPalsu), null);
```

**Hasilnya** (baris baru):

```text
viewer null null
```

- **Gelang asli** lolos, dan perannya terbaca: `viewer`.
- **Gelang palsu** memakai isi baru (`admin`) dengan tanda tangan lama. Tanda tangan yang dihitung ulang dari isi baru tidak sama dengan tanda tangan yang ditempel, jadi jawabannya `null`.
- **Gelang basi** bertanda tangan asli, tetapi `exp`-nya sudah lewat satu detik, jadi juga `null`.
- **`?.`** (Modul 17) membaca `peran` hanya kalau hasilnya bukan `null`. `assert.equal` di baris terakhir diam karena pemeriksaannya benar; kalau suatu hari gelang palsu lolos, baris itu menghentikan program.
- Library JWT sungguhan yang kamu pasang di Praktik 2 melakukan pemeriksaan yang sama, ditambah beberapa pemeriksaan lain, misalnya jenis tanda tangan di kepala gelang.

### Langkah 5 — Satpam mini: `Set` sebagai daftar pintu terbuka

Satpam backend (Konsep 6) menjawab tiga pertanyaan untuk setiap permintaan: apakah pintu ini boleh dilewati tanpa gelang? Kalau tidak, apakah gelangnya asli dan belum basi? Kalau ya, apakah perannya boleh melakukan ini? **`Set`** adalah kumpulan nilai tanpa kembaran, cocok untuk daftar tamu yang cukup ditanya "ada atau tidak?". Tambahkan:

```js
// 5. Satpam mini: Set berisi pintu yang boleh dilewati tanpa gelang
const TERBUKA = new Set(["POST /auth/login", "GET /health"]);
function satpam(metode, rute, gelangTeks) {
  if (TERBUKA.has(`${metode} ${rute}`)) return 200; // pintu terbuka
  const pemakai = gelangTeks === undefined ? null : periksaGelang(gelangTeks);
  if (pemakai === null) return 401; // tidak bergelang, gelangnya palsu, atau sudah basi
  if (pemakai.peran !== "admin" && metode !== "GET") return 403; // viewer hanya boleh melihat
  return 200;
}
const gelangAdmin = buatGelang({ sub: "1", peran: "admin", exp: detikSekarang() + 900 });
console.log(
  satpam("GET", "/health"),
  satpam("GET", "/devices"),
  satpam("GET", "/devices", gelang),
  satpam("POST", "/devices/f00d00000001/command", gelang),
  satpam("POST", "/devices/f00d00000001/command", gelangPalsu),
  satpam("POST", "/devices/f00d00000001/command", gelangAdmin),
);
```

**Hasilnya** (seluruh keluaran; **contoh**, baris token, gelang, dan milidetik di layarmu berbeda):

```text
2b622b806b64eb5b4a1e0e79bf4213d80c381939d283892fa82fc35f16ee5fd7
2b622b806b64eb5b4a1e0e79bf4213d80c381939d283892fa82fc35f16ee5fd7
511f584f6dbd45e60b051f14e2e4a8e1c0d210b0414853898f5f92017e35c4c3
64 64
ketemu: rahasia123
100.000 tebakan: 454 ms
AEawGEod4f2sGj_ny5GyPoHinvN-98qS8s6n7Bkri1s
1nBQzrBXabpoIaNLmtndxHpXRzOfkR4t0remqWoWuu4
43 false
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwicGVyYW4iOiJ2aWV3ZXIiLCJleHAiOjE3OTI2MjkyNjZ9.1Pde6pbm4yib_yGnNBeFDGggZY8xf8eK0pHpPid5998
{ sub: '2', peran: 'viewer', exp: 1792629266 }
viewer null null
200 401 200 403 401 200
```

Enam jawaban satpam, dari kiri:

1. `GET /health` tanpa gelang: **200**, pintunya memang terbuka.
2. `GET /devices` tanpa gelang: **401**, belum *login*.
3. `GET /devices` dengan gelang `viewer`: **200**, `viewer` boleh melihat.
4. `POST …/command` dengan gelang `viewer`: **403**, sudah dikenal, tetapi tidak berhak.
5. `POST …/command` dengan gelang palsu: **401**, gelang palsu sama dengan tidak bergelang.
6. `POST …/command` dengan gelang `admin`: **200**.

Angka 401 dan 403 itulah dua syarat lulus pertama modul ini. Bedanya dibahas di Konsep 2.

**Uji dirimu (10 menit).** Tanpa melihat kunci:

1. Apakah sidik jari `"kopi pagi "` (dengan satu spasi di akhir) sama dengan sidik jari `"kopi pagi"`? Buktikan dengan satu baris `console.log`.
2. Buat gelang `admin` untuk akun `"3"`, lalu tanyakan satpam soal `PUT /rules/1` dengan gelang itu dan dengan gelang `viewer`. Apa dua jawabannya?
3. Ubah **satu huruf terakhir** gelang `viewer`, lalu tanyakan satpam soal `GET /devices`. Apa jawabannya, dan mengapa?

<details>
<summary>Kunci uji dirimu</summary>

```js
// uji 1: satu spasi di akhir
console.log(sidikJari("kopi pagi ") === sidikJari("kopi pagi"));

// uji 2: gelang admin untuk akun 3
const gelangAdmin3 = buatGelang({ sub: "3", peran: "admin", exp: detikSekarang() + 900 });
console.log(satpam("PUT", "/rules/1", gelangAdmin3), satpam("PUT", "/rules/1", gelang));

// uji 3: satu huruf tanda tangan diubah
const rusak = gelang.slice(0, -1) + (gelang.endsWith("A") ? "B" : "A");
console.log(satpam("GET", "/devices", rusak));
```

1. Hasilnya `false`. Bagi komputer, spasi adalah huruf juga, jadi sidik jarinya berbeda total. Inilah sebabnya sandi yang diketik dengan spasi tambahan tidak cocok.
2. Hasilnya `200 403`: `admin` boleh mengubah aturan, `viewer` tidak.
3. Hasilnya `401`. Huruf terakhir gelang adalah bagian tanda tangan. Tanda tangan yang berubah tidak cocok lagi dengan kepala dan isinya, jadi gelang itu dianggap palsu. `gelang.endsWith("A") ? "B" : "A"` memastikan hurufnya benar-benar berganti. Catatan: satpam mini ini membandingkan tanda tangan sebagai teks. Library JWT sungguhan membandingkannya sebagai *byte*, dan huruf terakhir tanda tangan HS256 hanya membawa 4 bit. Jadi, pada gelang sungguhan, mengganti `A` dengan `B` di ujung bisa tetap lolos karena *byte*-nya sama. Itu bukan celah karena isi gelangnya tidak berubah. Untuk melihat 401, ubah huruf di tengah tanda tangan atau di bagian isi.

</details>

Pemanasan selesai. File `pemanasan.js` disimpan ke GitHub bersama catatan belajarmu di ➕.

> ➡️ **Lanjut** ke [🏆 Kemenangan Cepat](#-kemenangan-cepat-sidik-jari-kata-sandi-pertamamu-20-menit).

## 🏆 Kemenangan Cepat: sidik jari kata sandi pertamamu (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini`) dengan satu terminal. Backend, database, dan broker belum perlu dinyalakan.

Dalam 20 menit, kamu memasang **bcrypt** dan melihat sendiri tiga sifat yang membuatnya cocok untuk kata sandi: sandi yang sama menghasilkan sidik jari yang **berbeda** setiap kali, keduanya tetap **cocok** dengan sandi aslinya, dan setiap sidik jari **sengaja dibuat lambat**.

### Langkah 1 — Siapkan cabang kerja (2 menit)

Buka folder **`rumah-pintar-mini`** di VS Code (**File → Open Folder…**), lalu buka terminal (**Terminal → New Terminal**). Terminal baru selalu mulai di folder `rumah-pintar-mini`. Buat cabang kerja minggu ini dari `main` yang terbaru:

```text
git switch main
git pull
git switch -c fitur/keamanan-pengguna
```

**Hasilnya** (baris terakhir):

```text
Switched to a new branch 'fitur/keamanan-pengguna'
```

### Langkah 2 — Pasang bcrypt (6 menit)

Masuk ke folder `backend`, lalu pasang bcrypt:

```text
cd backend
npm install bcrypt@6.0.0
```

**Hasilnya** (**contoh**; angka `audited` dan lama detiknya bisa sedikit berbeda):

```text
added 3 packages, and audited 209 packages in 17s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   bcrypt@6.0.0 (install: node-gyp-build)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
```

Pemasangannya berhasil (`found 0 vulnerabilities`), tetapi npm menambahkan empat baris peringatan. Sebagian paket npm membawa **skrip pemasangan** (*install script*): program kecil yang dijalankan otomatis saat paket dipasang. Skrip seperti itu bisa menjalankan apa saja di laptopmu sehingga sering dipakai paket npm yang disusupi untuk mencuri data. Itulah sebabnya npm versi baru (11.18 ke atas) mulai meminta kamu **menyetujui** setiap paket yang membawa skrip pemasangan. Untuk sekarang, permintaan itu baru berupa pengingat: skripnya tetap dijalankan, tetapi npm terus mengingatkan sampai kamu memeriksanya, dan npm versi berikutnya akan menahan skrip yang belum disetujui. Skrip bcrypt hanya memeriksa apakah program jadinya cocok dengan laptopmu. Paket bcrypt 6 sudah membawa program jadi untuk Windows, macOS, dan Linux, jadi kamu tidak perlu memasang kompiler apa pun.

Sebelum menyetujuinya, pasang dulu **keterangan tipe** bcrypt untuk TypeScript. `-D` berarti paket ini hanya dibutuhkan selama pengembangan (*devDependencies*), seperti `typescript` sendiri:

```text
npm install -D @types/bcrypt@6.0.0
```

**Hasilnya:** baris `added 1 package, …` dan `found 0 vulnerabilities`, lalu peringatan serupa muncul lagi (kali ini mungkin tertulis `(install: node-gyp rebuild)`; itu tidak berarti bcrypt dikompilasi ulang). Peringatan itu akan muncul di **setiap** `npm install` sampai kamu menyetujuinya. Setujui sekarang:

```text
npm install-scripts approve bcrypt
```

**Hasilnya:**

```text
Approved bcrypt:
  added bcrypt@6.0.0
```

Kalau npm justru menjawab `Unknown command: "install-scripts"`, dan peringatan `npm warn install-scripts` tadi memang tidak pernah muncul, npm-mu lebih tua daripada 11.18 (periksa dengan `npm -v`). Perbarui Node.js 24 ke rilis LTS terbaru seperti di Modul 4 Praktik 3, lalu ulangi langkah ini. Mac lama yang tertahan di Node.js 22 cukup melewati langkah persetujuan: bcrypt tetap terpasang lengkap, hanya bagian `allowScripts` di bawah yang tidak ada.

Buka **`package.json`**. Selain dua paket baru di `dependencies` dan `devDependencies`, kini ada bagian baru di paling bawah:

```json
  "allowScripts": {
    "bcrypt@6.0.0": true
  }
```

Persetujuan itu terkunci pada **versi** `6.0.0`. Kalau suatu hari bcrypt dinaikkan versinya, npm bertanya lagi karena skrip di versi baru belum pernah kamu periksa. Jalankan `npm install` sekali lagi untuk memastikan peringatannya hilang.

**Hasilnya** (**contoh**):

```text
up to date, audited 210 packages in 3s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### Langkah 3 — Sidik jari pertama (8 menit)

Di panel Explorer, klik dulu ruang kosong, lalu klik kanan folder **`backend`** → **New File…**, beri nama **`coba-bcrypt.js`**. File ini hanya untuk latihan dan dihapus lagi di akhir Kemenangan Cepat. Ketik:

```js
// coba-bcrypt.js - Kemenangan Cepat Modul 20: sidik jari sandi pertamamu. Hapus file ini setelah selesai.
import bcrypt from "bcrypt";

const sandi = "ini cuma latihan, bukan sandiku"; // teks latihan: jangan pernah dipakai sebagai sandi sungguhan

console.time("lama membuat satu sidik jari");
const satu = await bcrypt.hash(sandi, 12); // 12 = cost: bcrypt mengulang hitungannya 2^12 = 4.096 kali
console.timeEnd("lama membuat satu sidik jari");
const dua = await bcrypt.hash(sandi, 12); // sandi yang SAMA di-hash sekali lagi

console.log("sidik jari 1:", satu);
console.log("sidik jari 2:", dua);
console.log("sama persis?", satu === dua);
console.log("sandi benar cocok?", await bcrypt.compare(sandi, satu));
console.log("sandi salah cocok?", await bcrypt.compare("ini cuma latihan, bukan sandimu", satu));
```

Simpan (**Ctrl + S**), lalu jalankan di terminal (masih di folder `backend`):

```text
node coba-bcrypt.js
```

**Hasilnya** (**contoh**; sidik jari dan lamanya pasti berbeda di laptopmu):

```text
lama membuat satu sidik jari: 749.301ms
sidik jari 1: $2b$12$RH2LUiS.qIB8wN6UeKnLUOfSpKX1ln7wfIBYD5KGGUDwSn2N4fuTy
sidik jari 2: $2b$12$XrsFo4oMY72Zj0K7pUsMJO7go6s5u.ocaX1UXLzymOReN7J/FS8za
sama persis? false
sandi benar cocok? true
sandi salah cocok? false
```

Itulah kemenangan cepatmu. Perhatikan empat hal:

- **Sidik jari 1 dan 2 berbeda**, padahal sandinya sama. Setiap kali, bcrypt mencampur sandi dengan **garam** acak yang baru (Konsep 3). Kedua teks sama-sama diawali `$2b$12$`: versi resep bcrypt dan angka biayanya (*cost*) `12`.
- **`bcrypt.compare()` tetap menjawab `true`** untuk sandi yang benar. Ia membaca garam dari teks sidik jari itu sendiri, menghitung ulang, lalu membandingkan.
- **Satu huruf berbeda di ujung** (`sandimu` lawan `sandiku`) sudah cukup untuk `false`.
- **Satu sidik jari butuh ratusan milidetik.** `console.time()` dan `console.timeEnd()` mengukur waktu di antara keduanya. Di laptop penulis yang sedang sibuk, angkanya sekitar 0,75 detik; di laptop yang santai, sekitar 0,3 detik. Kalau kamu menjalankannya sekali lagi, kedua sidik jari berganti lagi, tetapi ketiga jawaban di bawahnya tetap sama.

Bandingkan dengan pemanasan langkah 1: SHA-256 menghitung 100.000 sidik jari dalam kurang dari setengah detik, sedangkan bcrypt butuh waktu sekitar itu untuk **satu** sidik jari saja. Untuk sejuta tebakan, laptop yang sama butuh sekitar 5 detik dengan SHA-256, tetapi sekitar 3,5 hari dengan bcrypt.

Hapus file latihannya: klik kanan **`coba-bcrypt.js`** di Explorer → **Delete** → **Move to Recycle Bin** (macOS: **Move to Trash**). Perubahan `package.json` dan `package-lock.json` disimpan ke Git di akhir Praktik 1.

> ➡️ **Lanjut** ke [🧠 Konsep "Mengapa"](#-konsep-mengapa): baca Konsep 1–3, lalu kerjakan Praktik 1.

## 🧠 Konsep "Mengapa"

Ada sebelas konsep. Tidak perlu dibaca sekaligus sebelum praktik. Urutannya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–3 → Praktik 1 (rahasia, tabel sesi, dan akun pertama)
2. Konsep 4–5 → Praktik 2 (*login* dan gelang di *cookie*)
3. Konsep 6 → Praktik 3 (satpam di setiap pintu)
4. Konsep 7 → Praktik 4 (*refresh* dan *logout*)
5. Konsep 8 → Praktik 5 (batas percobaan *login*)
6. Konsep 9 → Praktik 6 (CORS dan pemeriksaan asal)
7. Konsep 10 → Praktik 7 (Socket.IO ikut dikunci)
8. Konsep 11 → Praktik 8 (rahasia, privasi, dan uji kelulusan)

Kotak ⬆️/➡️ di akhir setiap praktik dan di akhir setiap kelompok konsep di atas mengantarmu ke langkah berikutnya. Potongan kode di bagian konsep cukup dibaca: semuanya ditulis dan dijalankan di praktik.

### 1. Model ancaman: siapa yang mungkin iseng dan apa akibatnya

Pemilik rumah tidak memasang pintu brankas bank di dapur, tetapi juga tidak membiarkan pintu depan terbuka semalaman. Kunci yang tepat bergantung pada dua pertanyaan: **siapa yang mungkin masuk** dan **apa akibatnya kalau ia berhasil**. Daftar sederhana berisi jawaban kedua pertanyaan itu disebut **model ancaman** (*threat model*). Tidak perlu rumit; empat kolom sudah cukup. Untuk Rumah Pintar Mini:

| Siapa yang mungkin iseng | Lewat pintu mana | Akibatnya | Kuncinya minggu ini |
| :--- | :--- | :--- | :--- |
| Anggota rumah atau tamu yang iseng, misalnya adik yang suka mematikan lampu kamar orang lain | API, lewat Bruno sekarang atau lewat dashboard mulai Modul 22 | Lampu padam, kipas menyala tengah malam, ambang kipas diubah | Akun dan *login* (401); peran `viewer` untuk orang yang cukup melihat (403). Konsep 2 dan 6 |
| Penebak sandi otomatis (*bot*) yang mencoba sandi populer satu per satu | `POST /auth/login`, terutama setelah backend bisa diketuk dari internet di Fase 5 | Akun `admin` diambil alih, lalu semua aktuator dan aturan dikuasainya | Sandi panjang, sidik jari bcrypt, dan paling banyak 10 percobaan per menit. Konsep 3 dan 8 |
| Halaman web lain yang kamu buka di browser yang sama | Browser, yang otomatis membawa *cookie* *login*-mu | Perintah terkirim atas namamu tanpa kamu sadari | `SameSite`, pemeriksaan asal, dan CORS. Konsep 5 dan 9 |
| Orang yang mendapat salinan database | File hasil `pg_dump` di folder `backup/` (Modul 18), atau laptop yang hilang | Semua akun dan sesi ikut bocor | Database hanya menyimpan sidik jari sandi dan sidik jari *refresh token*. Konsep 3 dan 7 |
| Orang yang mengintip data *live* | Socket.IO | Kebiasaan rumah terbaca: kapan ada gerakan, kapan rumah kosong | Socket.IO ikut dikunci. Konsep 10 |
| Kamu sendiri, saat terburu-buru | `git add .` lalu *push* ke GitHub | Sandi database, token bot, dan `JWT_SECRET` terpampang di internet | `.env`, `.gitignore`, dan GitHub *secret scanning*. Konsep 11 |

Satu hal perlu dikatakan dengan jujur. Sejak Modul 16, backend hanya mendengar di **`127.0.0.1`** (`HOST=127.0.0.1` di `.env`), jadi HP atau laptop lain di WiFi rumahmu belum bisa mengetuknya sama sekali. Ancaman yang benar-benar ada **minggu ini** adalah program dan halaman web lain di laptopmu sendiri, serta kesalahan seperti rahasia yang ikut ke GitHub. Kuncinya tetap dipasang sekarang karena Modul 22 membawa dashboard ke browser dan Fase 5 membawa backend ke internet. Memasang kunci saat rumah masih sepi jauh lebih mudah daripada saat tamunya sudah berdatangan.

Empat prinsip memandu semua kunci minggu ini:

1. **Terkunci secara bawaan** (*deny by default*). Semua pintu terkunci, dan hanya beberapa yang sengaja dibuka. Rute baru yang kelak kamu tambahkan otomatis ikut terkunci, jadi lupa memasang gembok tidak membuat pintu terbuka.
2. **Hak sekecil mungkin** (*least privilege*). Orang dan program yang cukup melihat diberi akun `viewer`. Terminal kecil buatanmu pun memakai akun `viewer`.
3. **Berlapis** (*defense in depth*). Satu kunci boleh gagal; kunci berikutnya masih menahan. Sandi yang lemah pun masih dilindungi batas percobaan, dan *cookie* yang ikut terlampir pada permintaan dari halaman asing tetap terhalang pemeriksaan asal.
4. **Rahasia tidak pernah tinggal di kode.** Kode boleh dibaca siapa saja karena repositori `rumah-pintar-mini`-mu publik. Semua rahasia tinggal di `.env`.

Ada juga yang **belum** dikunci minggu ini: perangkat dan broker MQTT (Modul 21), enkripsi lalu lintas dengan HTTPS (Fase 5), serta verifikasi dua langkah dan *login* dengan Google (cukup dibahas di 🔬).

![Diagram model ancaman: siapa yang mungkin iseng dan apa akibatnya, Konsep 1. Setiap kartu berisi tiga baris: lewat pintu mana, akibatnya, dan kuncinya minggu ini. Di tengah, kartu hijau Rumah Pintar Mini dengan ikon rumah, backend 127.0.0.1:8080, dan daftar yang dijaga: aktuator (lampu, kipas, pompa, tirai); aturan dan jadwal (kipas otomatis, siram pagi); data live dan riwayat (suhu, kelembapan, gerakan); serta akun dan rahasia (sidik jari sandi, sesi, .env). Enam kartu pelaku dengan ikon garis yang netral mengelilinginya, masing-masing dengan panah menuju rumah. Kiri atas, adik atau tamu yang iseng, Konsep 2 dan 6: lewat API, yaitu Bruno atau dashboard Modul 22; akibatnya lampu padam dan ambang kipas diubah; kuncinya login (401) dan peran viewer (403). Kiri tengah, penebak sandi otomatis (bot), Konsep 3 dan 8: lewat POST /auth/login, terutama di Fase 5; akibatnya akun admin diambil alih; kuncinya sandi panjang, bcrypt, dan 10 percobaan per menit. Kiri bawah, halaman web lain di browser-mu, Konsep 5 dan 9: lewat browser, yang membawa cookie-mu otomatis; akibatnya perintah terkirim atas namamu; kuncinya SameSite, pemeriksaan asal, dan CORS. Kanan atas, pemegang salinan database, Konsep 3 dan 7: lewat folder backup/ (Modul 18) atau laptop yang hilang; akibatnya semua akun dan sesi ikut bocor; kuncinya hanya sidik jari yang disimpan. Kanan tengah, pengintip data live, Konsep 10: lewat Socket.IO; akibatnya kebiasaan rumah terbaca, misalnya kapan rumah kosong; kuncinya Socket.IO ikut dikunci. Kanan bawah, kamu sendiri saat terburu-buru, Konsep 11: lewat perintah git add titik lalu push ke GitHub; akibatnya rahasia terpampang di GitHub; kuncinya .env, .gitignore, dan secret scanning. Di bawahnya, empat prinsip yang memandu semua kunci minggu ini: 1, terkunci secara bawaan (deny by default), semua pintu terkunci dan hanya beberapa yang sengaja dibuka; 2, hak sekecil mungkin (least privilege), yang cukup melihat diberi akun viewer, terminal kecil juga; 3, berlapis (defense in depth), satu kunci boleh gagal dan kunci berikutnya masih menahan; 4, rahasia tidak pernah tinggal di kode, semua rahasia tinggal di .env. Kotak catatan jujur paling bawah: minggu ini backend hanya mendengar di 127.0.0.1, jadi HP atau laptop lain di WiFi rumahmu belum bisa mengetuknya; Modul 22 membawa dashboard ke browser dan Fase 5 membawa backend ke internet, jadi kuncinya dipasang sekarang, selagi rumah masih sepi; yang belum dikunci minggu ini adalah perangkat dan broker MQTT (Modul 21), serta HTTPS (Fase 5).](aset/model-ancaman.png)

### 2. Autentikasi dan otorisasi: 401 lawan 403

Setiap penjaga pintu sebenarnya mengajukan dua pertanyaan yang berbeda:

- **Autentikasi** (*authentication*): "**Kamu siapa?** Buktikan." Buktinya adalah *login* dengan email dan sandi, lalu gelang yang ditunjukkan di setiap permintaan berikutnya.
- **Otorisasi** (*authorization*): "**Kamu boleh melakukan ini?**" Jawabannya bergantung pada peranmu.

Bayangkan sebuah konser. Di gerbang masuk, petugas memeriksa tiketmu dan memasang gelang di tanganmu: itu autentikasi. Di depan pintu belakang panggung, petugas lain melihat warna gelangmu. Gelang penonton tidak boleh masuk, gelang kru boleh: itu otorisasi. Backend menjawab kedua kegagalan itu dengan kode status yang berbeda:

| Kode | Nama resminya | Artinya di backend v0.5 | Di konser |
| :--- | :--- | :--- | :--- |
| **401** | `Unauthorized` | belum *login*, gelangnya palsu, atau gelangnya sudah kedaluwarsa | "Gelangnya mana?" |
| **403** | `Forbidden` | sudah dikenal, tetapi perannya tidak boleh melakukan itu | "Maaf, gelangmu bukan gelang kru." |
| **429** | `Too Many Requests` | terlalu banyak percobaan *login* dalam semenit (Konsep 8) | "Antre dulu, tunggu jam pasirnya habis." |

Nama resmi kode 401 memang menyesatkan. *Unauthorized* terdengar seperti "tidak berhak", padahal artinya "**belum terbukti siapa kamu**". Ingat saja begini: **401 = "kamu siapa?"**, **403 = "aku tahu kamu siapa, tetapi tidak boleh."**

Urutan pemeriksaannya selalu sama: identitas dulu, hak kemudian. Orang yang belum *login* lalu mencoba menyalakan relay dijawab **401**, bukan 403, karena backend belum tahu siapa dia. Alamat yang tidak ada pun dijawab 401 untuk orang yang belum *login*. Dengan begitu, orang asing tidak bisa mencari tahu rute mana saja yang ada di backend-mu. Setelah *login*, alamat yang tidak ada dijawab `404` seperti biasa.

Ketiga syarat lulus modul ini memeriksa ketiga kode itu: tanpa *login* semua *endpoint* menjawab **401** (autentikasi), akun `viewer` gagal menyalakan relay dengan **403** (otorisasi), dan percobaan *login* ke-11 dalam semenit ditolak dengan **429**.

### 3. Sidik jari kata sandi: simpan sidik jari, bukan wajah

Untuk memeriksa sandi, backend harus menyimpan **sesuatu** tentang sandi itu. Namun, kalau yang disimpan adalah sandinya sendiri, siapa pun yang mendapat salinan database langsung tahu semua sandi, padahal banyak orang memakai sandi yang sama untuk email dan media sosialnya. Mengunci database saja tidak cukup karena salinan database bisa tersebar lewat cadangan (*backup*), laptop yang hilang, atau kesalahan kecil.

Jalan keluarnya: **simpan sidik jari, bukan wajah.** Polisi bisa mencocokkan sidik jari seseorang tanpa perlu menyimpan foto wajahnya. Begitu juga backend. Saat akun dibuat, backend menghitung **sidik jari** (*hash*) sandinya dan hanya menyimpan sidik jari itu. Saat *login*, backend menghitung sidik jari sandi yang diketik, lalu membandingkannya. Dari sidik jari, sandi aslinya tidak bisa dihitung balik.

Pemanasan langkah 1 menunjukkan bahwa sidik jari biasa seperti SHA-256 terlalu **cepat**: laptop biasa pun sanggup menghitung ratusan ribu tebakan per detik. Karena itu, sandi diberi sidik jari dengan **bcrypt**, yang punya dua kelebihan:

1. **Sengaja lambat.** Algoritma bcrypt mengulang hitungannya 2 pangkat *cost* kali. Dengan **angka biaya** (*cost*) **12**, ada 4.096 putaran, dan satu sidik jari butuh sekitar 0,3 detik di laptop penulis (bisa sampai sekitar 1 detik saat laptop sedang sibuk). Bagi manusia yang *login*, 0,3 detik tidak terasa. Bagi penebak, setiap tebakan juga butuh waktu selama itu: dengan satu inti prosesor, sejuta tebakan butuh sekitar 3,5 hari, dan kartu grafis tercepat pun hanya sanggup mencoba ribuan tebakan bcrypt per detik, bukan miliaran seperti SHA-256. Setiap kenaikan *cost* satu angka membuatnya dua kali lebih lama.
2. **Diberi garam** (*salt*). Sebelum dihitung, setiap sandi dicampur dengan 16 *byte* acak yang disebut **garam**. Akibatnya, dua akun dengan sandi yang sama tetap punya sidik jari berbeda, dan penebak tidak bisa memakai "kamus sidik jari" yang sudah dihitung sebelumnya. Ia harus menebak satu per satu untuk setiap akun.

Garam tidak perlu dirahasiakan; ia disimpan bersama sidik jarinya dalam satu teks sepanjang 60 huruf:

```text
$2b$12$mCgEV8BHKGueg1vUTZtbW.hWprLVUZn6hfQskfy8p9rD0ZJ.8Ayie
```

| Bagian | Isinya |
| :--- | :--- |
| `$2b$` | versi resep bcrypt |
| `12$` | angka biaya (*cost*) |
| 22 huruf berikutnya | garam |
| 31 huruf terakhir | sidik jari sandi yang sudah dicampur garam |

Saat *login*, `bcrypt.compare(sandiYangDiketik, sidikJariTersimpan)` membaca versi, *cost*, dan garam dari teks itu, menghitung ulang, lalu menjawab `true` atau `false`.

Ada tiga aturan tambahan yang dipakai backend v0.5:

- **Panjang minimal 15 karakter, tanpa aturan campuran.** Pedoman sandi terbaru dari NIST (lembaga standar Amerika Serikat; NIST SP 800-63B-4, Juli 2025) mewajibkan sandi yang menjadi satu-satunya bukti identitas paling sedikit **15 karakter**, dan justru **melarang** aturan "wajib ada huruf besar, angka, dan simbol" serta kewajiban mengganti sandi secara berkala. Sandi yang panjang jauh lebih sulit ditebak daripada sandi pendek yang rumit, dan lebih mudah diingat. Pakai **kalimat sandi**: beberapa kata acak yang hanya kamu ketahui, misalnya gabungan nama benda di sekitarmu dengan kebiasaan yang tidak diketahui orang. Jangan memakai contoh dari modul mana pun, termasuk modul ini. NIST juga mewajibkan penolakan sandi yang ada di daftar sandi populer atau bocor; backend v0.5 belum memeriksanya, jadi bagian itu masih menjadi tanggung jawabmu saat memilih kalimat sandi.
- **Paling panjang 72 *byte*.** Algoritma bcrypt hanya membaca 72 *byte* pertama dan diam-diam membuang sisanya. Backend menolak sandi yang lebih panjang supaya tidak ada yang mengira sisa sandinya ikut diperiksa. Satu huruf biasa sama dengan 1 *byte*, huruf beraksen seperti `é` 2 *byte*, dan satu emoji 4 *byte*.
- **Email salah dan sandi salah dijawab sama persis.** Keduanya mendapat `401` dengan pesan `email atau sandi salah`, dan keduanya **sama lamanya**. Untuk email yang tidak terdaftar, backend tetap menjalankan bcrypt pada sidik jari palsu yang dibuat saat server mulai. Tanpa trik ini, email yang tidak terdaftar dijawab dalam beberapa milidetik, sedangkan email terdaftar butuh ratusan milidetik, dan penyerang bisa mengetahui email mana yang punya akun hanya dari lamanya jawaban.

Sidik jari ini disimpan di kolom baru `sandi_hash` tabel `users` (Praktik 1). Akun yang `sandi_hash`-nya kosong tidak bisa *login*.

![Diagram sidik jari kata sandi: simpan sidik jari, bukan wajah, Konsep 3. bcrypt sengaja lambat dengan angka biaya 12 dan memberi garam; database hanya menyimpan sidik jarinya. Kiri, saat akun dibuat dengan npm run pengguna di Praktik 1: kotak kalimat sandi yang ditampilkan sebagai enam belas titik, paling sedikit 15 karakter, dan kotak garam acak 16 byte yang dibuat otomatis, berbeda setiap kali, dan tidak rahasia karena ikut disimpan. Keduanya masuk ke kotak hijau bcrypt: angka biaya (cost) 12, 2 pangkat 12 sama dengan 4.096 putaran, sekitar 0,3 detik di laptop penulis. Hasilnya satu teks 60 huruf, $2b$12$mCgEV8BHKGueg1vUTZtbW.hWprLVUZn6hfQskfy8p9rD0ZJ.8Ayie, yang dipecah menjadi empat potong berlabel: $2b$, versi resep; 12$, angka biaya; mCgEV8BHKGueg1vUTZtbW., garam, 22 huruf dari 16 byte acak; dan hWprLVUZn6hfQskfy8p9rD0ZJ.8Ayie, sidik jari sandi, 31 huruf yang sudah dicampur garam. Catatan: sandi yang sama dibuat dua kali menghasilkan sidik jari berbeda karena garamnya berbeda. Kotak biru database: disimpan di kolom sandi_hash tabel users; hanya sidik jari ini, sandinya sendiri tidak pernah disimpan. Kanan, saat login dengan POST /auth/login: sandi yang diketik dan sidik jari tersimpan dari users.sandi_hash, yang diawali $2b$12$mCgEV8BH, masuk ke kotak hijau bcrypt.compare(), yang membaca versi, biaya, dan garam dari teks sidik jari itu, lalu menghitung ulang. Hasilnya true (cocok) sehingga sesi dan gelang dibuat (Konsep 4), atau false (tidak cocok) sehingga dijawab 401 dengan pesan email atau sandi salah. Catatan: sandinya tidak pernah dibalik dari sidik jari; yang dibandingkan adalah dua sidik jari. Kiri bawah, mengapa bcrypt, bukan SHA-256: silang merah untuk SHA-256 dari pemanasan langkah 1, terlalu cepat untuk sandi, 100.000 tebakan dalam kurang dari setengah detik di laptop penulis, dan kartu grafis milik penyerang bisa mencoba miliaran kali per detik; centang hijau untuk bcrypt dengan angka biaya 12, sengaja lambat, sekitar 0,3 detik untuk satu tebakan (sampai sekitar 1 detik saat laptop sibuk), sejuta tebakan dengan satu inti prosesor sekitar 3,5 hari, dan kartu grafis tercepat hanya ribuan per detik; angka biaya naik satu berarti dua kali lebih lama. Kanan bawah, aturan sandi backend v0.5 dengan tiga centang: paling sedikit 15 karakter tanpa aturan campuran, pakai kalimat sandi (NIST SP 800-63B-4); paling panjang 72 byte, lebih dari itu ditolak, bukan dipotong diam-diam; email salah sama dengan sandi salah, pesan dan lamanya sama berkat bcrypt pada sidik jari palsu.](aset/sidik-jari-sandi.png)

> ➡️ **Sudah membaca Konsep 1–3?** Lanjut ke [Praktik 1 — Rahasia, tabel sesi, dan akun pertama](#praktik-1--rahasia-tabel-sesi-dan-akun-pertama-60-menit). Konsep 4–5 dibaca sebelum Praktik 2.

### 4. JWT: gelang masuk konser

HTTP tidak punya ingatan. Setiap permintaan berdiri sendiri, jadi setelah *login* pun backend tidak tahu bahwa `GET /devices` berikutnya datang dari orang yang sama. Mengirim email dan sandi di setiap permintaan jelas buruk: sandinya makin sering lewat jaringan, dan setiap permintaan harus menunggu bcrypt 0,3 detik.

Konser besar menyelesaikan masalah yang mirip dengan **gelang**. Tiketmu diperiksa sekali di gerbang, lalu tanganmu dipasangi gelang. Setelah itu, petugas di setiap pintu cukup melihat gelangmu tanpa memeriksa tiket lagi. Gelangnya sulit dipalsukan dan hanya berlaku untuk hari itu.

Backend v0.5 memakai gelang yang sama, yaitu **JWT** (*JSON Web Token*, sering dibaca "jot"). Kamu sudah membuat versi sederhananya di pemanasan langkah 3–4: tiga potong teks *base64url* yang disambung titik, **kepala.isi.tanda-tangan**. Isi gelang yang dibuat backend seperti ini (**contoh**):

```json
{"sub":"1","peran":"admin","sid":1,"iat":1792638611,"exp":1792639511}
```

| Kunci | Artinya |
| :--- | :--- |
| `sub` | *subject* (pemilik gelang): nomor akun di tabel `users`, ditulis sebagai teks |
| `peran` | `admin` atau `viewer` (Konsep 6) |
| `sid` | nomor sesi di tabel `sesi`, yaitu *login* yang menghasilkan gelang ini (Konsep 7) |
| `iat` | *issued at*: kapan gelang dibuat, dalam detik sejak 1 Januari 1970 |
| `exp` | kapan gelang kedaluwarsa: `iat` + 900 detik, yaitu **15 menit** |

Tanda tangannya dibuat dengan resep **HS256** (HMAC-SHA256, persis `createHmac` di pemanasan) dan sebuah kunci rahasia, **`JWT_SECRET`**, yang hanya ada di file `.env` backend. Kunci ini ibarat **stempel panitia**. Tanpa stempel, tidak ada yang bisa membuat gelang yang lolos pemeriksaan. Dengan stempel, siapa pun bisa membuat gelang `admin` untuk dirinya sendiri. Karena itu, `JWT_SECRET` dibuat dari 32 *byte* acak (`randomBytes`, pemanasan langkah 2), disimpan hanya di `.env`, dan diperiksa saat server mulai: kalau kosong, terlalu pendek, atau masih berisi teks contoh, server menolak berjalan.

Gelang punya satu kelebihan besar dan satu kelemahan besar:

- **Kelebihannya: diperiksa tanpa membuka database.** Satpam cukup menghitung ulang tanda tangan dan melihat `exp`. Itu jauh lebih cepat daripada mencari sesi di database pada setiap permintaan.
- **Kelemahannya: tidak bisa ditarik kembali.** Gelang yang sudah dipasang tetap sah sampai `exp` walaupun pemiliknya sudah *logout* atau perannya sudah diturunkan. Karena itu, umurnya dibuat **pendek**, hanya 15 menit. Cara memperpanjangnya tanpa *login* ulang dibahas di Konsep 7.

Ingat juga pelajaran pemanasan langkah 3: isi gelang **bisa dibaca siapa saja** tanpa kunci. Gelang ditandatangani, bukan dirahasiakan. Itulah sebabnya gelang backend v0.5 hanya memuat nomor akun, peran, dan nomor sesi, tanpa email, nama, apalagi sandi.

### 5. *Cookie* `httpOnly`, bukan `localStorage`

Gelang harus disimpan di browser supaya bisa ditunjukkan di setiap permintaan. Tutorial di internet biasanya memakai salah satu dari dua tempat:

- **`localStorage`**: laci kecil milik setiap situs di browser. JavaScript di halaman itu bebas membuka laci, membaca isinya, lalu menempelkan gelangnya sendiri ke setiap permintaan.
- ***Cookie*** (kuki): catatan kecil yang dititipkan server ke browser. Server mengirimnya lewat kepala jawaban `Set-Cookie` (**kepala** adalah *header*, yang di Modul 16 disebut "kepala surat"; di Bruno terlihat di tab **Headers**), dan **browser sendiri** yang melampirkannya ke setiap permintaan berikutnya ke server yang sama, lewat kepala `Cookie`.

Jawaban *login* backend v0.5 memuat dua kepala `Set-Cookie` (**contoh**; isinya dipotong):

```text
set-cookie: akses=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
set-cookie: sesi=LiQc7smW…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict
```

*Cookie* `akses` berisi gelang (JWT), dan *cookie* `sesi` berisi kartu terusan (Konsep 7). Kenapa *cookie*, bukan `localStorage`? Karena dua cara itu tumbang oleh serangan yang berbeda.

**Serangan pertama: XSS** (*cross-site scripting*). Misalkan suatu hari ada JavaScript asing yang berhasil berjalan di halaman dashboard-mu, misalnya dari library npm yang disusupi atau teks yang ditampilkan tanpa disaring. Kalau gelangnya ada di `localStorage`, skrip itu cukup membaca laci lalu mengirim gelangnya ke mana saja. Pencurinya bisa memakai gelang itu dari komputernya sendiri sampai kedaluwarsa. *Cookie* bertanda **`HttpOnly`** tidak bisa dibaca JavaScript sama sekali; `document.cookie` tidak memperlihatkannya. XSS tetap berbahaya karena skrip asing masih bisa berbuat jahat selama halaman itu terbuka, tetapi gelangnya tidak bisa dibawa kabur.

**Serangan kedua: CSRF** (*cross-site request forgery*, pemalsuan permintaan lintas situs). Kelebihan *cookie* juga kelemahannya: browser melampirkannya **otomatis**. Kalau kamu membuka halaman lain, halaman itu bisa menyuruh browser-mu mengirim `POST` ke backend-mu, dan *cookie*-mu ikut terlampir. Penangkalnya ada tiga lapis:

1. **`SameSite=Strict`**: browser tidak melampirkan *cookie* pada permintaan yang dipicu halaman dari **situs** lain.
2. **Pemeriksaan asal** (kepala `Origin`): browser modern selalu menulis kepala `Origin` pada permintaan `POST` dan `PUT`, dan backend menolak asal yang tidak dikenalnya. Lapis ini perlu karena dua halaman di `127.0.0.1` dengan nomor port berbeda masih dianggap satu situs (Konsep 9, Praktik 6).
3. **CORS**: sebelum mengirim permintaan berisi JSON dari halaman asing, browser bertanya dulu lewat *preflight* (pemeriksaan pendahuluan), dan backend tidak mengizinkannya; halaman asing juga tidak bisa membaca jawaban backend (Konsep 9).

| | `localStorage` | *Cookie* `HttpOnly` |
| :--- | :--- | :--- |
| Bisa dibaca JavaScript halaman? | Ya | Tidak |
| Dilampirkan ke permintaan | Oleh kode yang kamu tulis | Otomatis oleh browser |
| Celah utamanya | XSS: gelang dicuri dan dipakai di tempat lain | CSRF: permintaan dikirim atas namamu |
| Penangkalnya | Tidak ada yang tuntas, selain mencegah XSS sepenuhnya | `SameSite`, pemeriksaan asal, dan CORS |

Setiap atribut di kepala `Set-Cookie` tadi punya tugas:

| Atribut | Tugasnya |
| :--- | :--- |
| `HttpOnly` | JavaScript tidak bisa membaca *cookie* ini |
| `SameSite=Strict` | tidak dilampirkan pada permintaan yang dipicu situs lain |
| `Path=/` | `akses` dilampirkan ke semua alamat backend. `sesi` memakai `Path=/auth`, jadi hanya dilampirkan ke `/auth/…` |
| `Max-Age` | umurnya dalam detik: 900 untuk `akses`, sisa umur sesi (paling lama 7 hari) untuk `sesi` |
| `Secure` | hanya dikirim lewat HTTPS. Backend memasangnya **otomatis** kalau permintaannya datang lewat HTTPS (Fase 5; kalau HTTPS diurus proksi di depan backend, Fastify perlu diberi tahu lewat setelan `trustProxy`); di `http://127.0.0.1` atribut ini belum dipasang |

*Cookie* bukan hanya urusan browser. **Bruno** menyimpan *cookie* dari jawaban *login* secara otomatis dan melampirkannya ke permintaan berikutnya. Perintah **curl** melakukannya kalau diminta (`-c` untuk menyimpan, `-b` untuk mengirim). **Terminal kecil** di Praktik 7 membaca kepala `Set-Cookie` sendiri.

![Diagram JWT: gelang masuk konser, disimpan di cookie httpOnly, Konsep 4 dan 5; gelang ditandatangani, bukan dirahasiakan, dan browser yang melampirkannya, bukan kode JavaScript. Bagian atas: gelang adalah JWT, tiga potong teks base64url yang disambung titik, dengan contoh isi dari Konsep 4; potongan isi dan tanda tangan dipotong. Satu baris token: potongan kepala eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 berlatar abu-abu, titik, potongan isi eyJzdWIiOiIxIiwicGVyYW4iOiJhZG1pbiIsInNp dan seterusnya berlatar hijau muda, titik, lalu potongan tanda tangan CaO6abpZ dan seterusnya berlatar hijau tua. Dari setiap potongan, garis turun ke kolom penjelasnya. Kolom kepala: alg HS256 dan typ JWT; resep tanda tangannya HS256 (HMAC-SHA256, persis createHmac di pemanasan langkah 3); kepala dan isi JWT adalah objek JSON yang ditulis rapat, jadi selalu diawali kurung kurawal buka dan tanda petik, dan dalam base64url awalan itu menjadi eyJ; teks panjang berawalan eyJ kemungkinan besar JWT, dan isinya bisa dibaca siapa saja. Kolom isi: sub 1, peran admin, sid 1, iat 1792638611, dan exp 1792639511, dengan arti tiap kunci: sub, nomor akun di tabel users, sebagai teks; peran, admin atau viewer; sid, nomor sesi di tabel sesi (Konsep 7); iat, kapan gelang dibuat, dalam detik sejak 1970; exp, kedaluwarsa, yaitu iat ditambah 900 detik, sama dengan 15 menit. Kotak hijau: bisa dibaca siapa saja, tanpa kunci, jadi tanpa email, nama, apalagi sandi. Kolom tanda tangan, dengan ikon stempel: stempel panitia, hanya backend yang tahu; HMAC-SHA256 dari kepala.isi dengan JWT_SECRET; JWT_SECRET adalah 32 byte acak yang hanya ada di .env, dan kalau kosong, pendek, atau masih teks contoh, server menolak berjalan; silang merah: kalau isinya diubah dari viewer menjadi admin, tanda tangan tidak cocok lagi, dan jawabannya 401. Bagian bawah: disimpan di browser sebagai dua cookie karena jawaban login memuat dua kepala Set-Cookie. Kartu browser yang menyimpan, lalu melampirkan sendiri: cookie akses sama dengan gelang (JWT), dengan Path=/ dan Max-Age=900 (15 menit); cookie sesi sama dengan kartu terusan (Konsep 7), dengan Path=/auth dan umur paling lama 7 hari; keduanya HttpOnly dan SameSite=Strict; Bruno juga menyimpan cookie otomatis. Panah hijau dilampirkan otomatis, lewat kepala Cookie, menuju kartu backend 127.0.0.1:8080: cookie akses ke semua alamat, cookie sesi hanya ke /auth/ dan seterusnya. Di kanan, perbandingan: laci localStorage, cara di banyak tutorial, dengan silang merah: bisa dibaca JavaScript halaman, dan celahnya XSS, gelang dicuri lalu dipakai di tempat lain sampai kedaluwarsa; lawan cookie HttpOnly milik backend v0.5, dengan ikon gembok dan centang hijau: document.cookie tidak memperlihatkannya, dan yang perlu dijaga adalah CSRF, permintaan dikirim atas namamu, dengan penangkal SameSite, pemeriksaan asal, dan CORS.](aset/gelang-jwt.png)

> ➡️ **Sudah membaca Konsep 4–5?** Lanjut ke [Praktik 2 — *Login* dan gelang di *cookie*](#praktik-2--login-dan-gelang-di-cookie-50-menit). Konsep 6 dibaca sebelum Praktik 3.

### 6. Satpam di setiap pintu: peran `admin` dan `viewer`

Ada dua cara memasang kunci. Cara pertama: setiap rute memeriksa sendiri, misalnya dengan menambahkan pemeriksaan gelang di awal setiap fungsi rute. Kelemahannya, cukup **lupa satu rute** dan pintu itu terbuka lebar. Cara kedua: satu **satpam** di pintu masuk gedung yang memeriksa **setiap** permintaan sebelum permintaan itu sampai ke rute mana pun. Backend v0.5 memakai cara kedua, lewat ***hook*** (kait) `onRequest` Fastify yang dipasang **sebelum** semua rute. Rute baru yang kelak kamu tambahkan otomatis ikut dijaga. Inilah prinsip **terkunci secara bawaan** dari Konsep 1.

Satpam menjawab tiga pertanyaan secara berurutan, persis seperti satpam mini di pemanasan langkah 5:

1. **Apakah pintu ini termasuk pintu terbuka?** Kalau ya, silakan lewat.
2. **Apakah gelangnya asli dan belum kedaluwarsa?** Kalau tidak bergelang, gelangnya palsu, atau gelangnya basi: **401**.
3. **Apakah perannya boleh melakukan ini?** Akun `viewer` hanya boleh melihat (`GET` dan `HEAD`). Selain itu: **403**, dengan pesan `akun viewer hanya boleh melihat; perintah dan perubahan khusus admin`.

Praktik 6 menambahkan satu pertanyaan lagi di urutan paling depan: dari halaman mana permintaan ini datang (Konsep 9).

Pintu yang sengaja dibuka hanya lima, masing-masing dengan alasannya:

| Pintu terbuka | Alasannya |
| :--- | :--- |
| `POST /auth/login` | Kalau pintu *login* dikunci, tidak ada yang bisa *login*. Pintu ini dijaga batas percobaan (Konsep 8). |
| `POST /auth/refresh` | Dipakai saat gelang sudah kedaluwarsa, jadi pintu ini tidak mungkin mensyaratkan gelang. Pintu ini dijaga *cookie* `sesi` (Konsep 7). |
| `POST /auth/logout` | Harus selalu berhasil, juga untuk gelang yang sudah basi. |
| `GET /health` dan `HEAD /health` | Dipakai program pemantau dan pemeriksa kesehatan Docker (Fase 5), yang tidak bisa *login*. Isinya hanya kabar sehat (server, broker, dan database) serta jumlah pesan yang diterima dan ditolak, tanpa data rumah. |
| `/docs` | Hanya dokumentasi. Tombol **Try it out** di sana tetap mengetuk rute yang terkunci, jadi tetap butuh *login*. |

Semua rute lain terkunci, dan hak setiap peran seperti ini:

| Rute | `admin` | `viewer` |
| :--- | :---: | :---: |
| `GET /devices`, `GET /devices/:id/latest`, `…/vitals`, `…/readings`, `…/state` | ✅ | ✅ |
| `GET /rules` | ✅ | ✅ |
| `GET /auth/me` (siapa yang sedang *login*) | ✅ | ✅ |
| `POST /devices/:id/command` (menyalakan relay dan aktuator lain) | ✅ | ❌ 403 |
| `POST /rules`, `PUT /rules/:id`, `POST /rules/:id/jalankan` | ✅ | ❌ 403 |

Peran akun tersimpan di kolom `peran` tabel `users`, yang sudah ada sejak Modul 17 dengan dua pilihan, `admin` dan `viewer`. Saat *login*, peran itu ditulis ke dalam gelang. Akibatnya, kalau peran seseorang diubah, gelang lamanya masih membawa peran lama sampai kedaluwarsa, paling lama 15 menit. Ini konsekuensi kelemahan gelang di Konsep 4, dan alasan lain kenapa umurnya pendek.

Dua penjelasan terakhir. **Bot Telegram tidak terdampak**: ia sudah punya kuncinya sendiri sejak Modul 19 (hanya melayani `TELEGRAM_CHAT_ID`), dan perintahnya masuk lewat fungsi `perintahkan()` di dalam backend, bukan lewat HTTP. **Socket.IO punya pintu sendiri** yang tidak dilewati satpam ini. Pintu itu dibahas di Konsep 10.

![Diagram satpam di setiap pintu: peran admin dan viewer, Konsep 6 dan 10; dua pintu, satu gelang: API dijaga satpam, Socket.IO dijaga penjaga pintu aula. Paling atas, kapsul hijau cookie akses sama dengan satu gelang, dengan dua panah: ke kiri, ditunjukkan di setiap permintaan, menuju pintu HTTP; ke kanan, ditunjukkan sekali saat handshake, menuju pintu aula. Kolom kiri, pintu HTTP: satpam, dengan ikon perisai; hook onRequest dipasang sebelum semua rute, jadi rute baru otomatis ikut dijaga: terkunci secara bawaan. Permintaan HTTP melewati pertanyaan berurutan di sepanjang satu garis alur. Langkah 0, bertanda Praktik 6: asal halaman dikenal? Hanya untuk selain GET dan HEAD yang membawa kepala Origin; kalau tidak, 403. Langkah 1: pintu terbuka? Yaitu POST /auth/login, /auth/refresh, dan /auth/logout, GET dan HEAD /health, serta /docs; kalau ya, lewat. Langkah 2: gelang asli dan belum basi? Cookie akses dengan tanda tangan yang cocok dan exp yang belum lewat; kalau tidak, 401. Langkah 3: perannya boleh? viewer hanya boleh GET dan HEAD; kalau tidak, 403 dengan pesan akun viewer hanya boleh melihat; perintah dan perubahan khusus admin. Lolos semua: rute dijalankan, 200. Catatan: urutannya selalu identitas dulu (401), hak kemudian (403); tanpa login, alamat yang tidak ada pun dijawab 401 sehingga orang asing tidak bisa mencari tahu rute mana saja yang ada; langkah 0 ditambahkan di Praktik 6 (Konsep 9). Kolom tengah, hak setiap peran, yang tersimpan di kolom peran tabel users, berupa tabel rute dengan kolom admin dan viewer: GET /devices, GET /devices/:id/latest, serta /vitals, /readings, dan /state: admin dan viewer boleh; GET /rules: keduanya boleh; GET /auth/me (siapa yang sedang login): keduanya boleh; POST /devices/:id/command (menyalakan relay dan aktuator lain): admin boleh, viewer 403; POST /rules, PUT /rules/:id, dan POST /rules/:id/jalankan: admin boleh, viewer 403. Catatan: saat login, peran ditulis ke dalam gelang; kalau peran diubah, gelang lama tetap membawa peran lama sampai kedaluwarsa, paling lama 15 menit, dan itu alasan lain umurnya pendek. Kotak abu-abu: bot Telegram tidak terdampak karena punya kuncinya sendiri sejak Modul 19, yaitu hanya melayani TELEGRAM_CHAT_ID, dan perintahnya lewat perintahkan() di dalam backend, bukan lewat HTTP, jadi tidak lewat satpam. Kolom kanan, pintu aula /socket.io/, dengan ikon pintu: Socket.IO menjawab sendiri sebelum Fastify, jadi satpam tidak pernah melihat tamu pintu ini, dan penjaganya sendiri, di kotak hijau, adalah allowRequest ditambah io.use(). Langkah 0, dengan lingkaran abu-abu seperti langkah 0 satpam: asal halaman diperiksa dengan daftar yang sama dengan satpam, lewat allowRequest; halaman asing ditolak dengan 403, sedangkan permintaan tanpa Origin, misalnya dari klien Node, boleh. Langkah 1: baca cookie akses dari permintaan handshake. Langkah 2: periksa gelangnya dengan stempel yang sama, JWT_SECRET. Langkah 3, hasilnya: kotak hijau, lolos, masuk room sesi:sid dan pemiliknya dicatat di socket.data; atau kotak merah, ditolak lewat connect_error dengan pesan belum login, atau sesi habis atau tidak sah: refresh atau login lagi. Kotak abu-abu: diperiksa sekali, di pintu; sambungan diputus saat gelangnya kedaluwarsa, dan saat logout atau saat backend mencabut sesinya karena kartu lama dipakai lagi, untuk seisi room sesi:sid. Catatan bawah: terminal kecil kini login dulu dengan akun viewer.](aset/satpam-dan-peran.png)

> ➡️ **Sudah membaca Konsep 6?** Lanjut ke [Praktik 3 — Satpam di setiap pintu: 401 dan 403](#praktik-3--satpam-di-setiap-pintu-401-dan-403-50-menit). Konsep 7 dibaca sebelum Praktik 4.

### 7. *Refresh token* dan *logout*: kartu terusan di loket

Konsep 4 meninggalkan dilema. Gelang yang **berumur pendek** (15 menit) aman, tetapi menyebalkan: setiap 15 menit kamu harus *login* ulang. Gelang yang **berumur panjang** (seminggu) nyaman, tetapi berbahaya: gelang yang bocor sah selama seminggu dan tidak bisa ditarik.

Jalan keluarnya adalah **dua benda** dengan tugas berbeda. Selain gelang, pengunjung festival beberapa hari biasanya membawa **kartu terusan**. Gelang dipakai di setiap pintu dan berganti setiap hari. Kartu terusan hanya ditunjukkan di **loket**, untuk ditukar dengan gelang baru, dan nomornya dicatat panitia di buku loket.

| | Gelang | Kartu terusan |
| :--- | :--- | :--- |
| Nama teknisnya | JWT akses | ***refresh token*** |
| *Cookie*-nya | `akses`, `Path=/` | `sesi`, `Path=/auth` |
| Ditunjukkan di | setiap permintaan | hanya di loket `/auth/…` |
| Umurnya | 15 menit | paling lama 7 hari sejak *login* |
| Diperiksa dengan | tanda tangan dan `exp`, tanpa database | barisnya di tabel `sesi` |
| Bisa dicabut? | tidak; ditunggu sampai kedaluwarsa | ya, hapus barisnya |

Kartu terusan backend v0.5 **bukan JWT**. Isinya hanya 32 *byte* acak (`randomBytes`, pemanasan langkah 2) yang tidak berarti apa-apa. Yang memberinya arti adalah **barisnya di tabel `sesi`**, satu baris untuk setiap *login* di setiap browser atau program. Database tidak menyimpan kartunya, melainkan **sidik jari SHA-256**-nya. Kali ini SHA-256 yang cepat sudah cukup karena kartunya 256 bit acak, bukan sandi buatan manusia; tidak ada "kartu populer" yang bisa ditebak. Orang yang mendapat salinan database pun tidak bisa memakai sidik jari itu sebagai kartu.

Alurnya:

1. ***Login*** (`POST /auth/login`): backend membuat baris sesi baru, lalu mengirim dua *cookie*, yaitu gelang dan kartu terusan.
2. **Selama 15 menit**, setiap permintaan membawa gelang, dan satpam memeriksanya tanpa membuka database.
3. **Gelang kedaluwarsa**: permintaan berikutnya dijawab **401**. Klien lalu mengetuk loket `POST /auth/refresh` dengan kartu terusannya. Backend mencari baris sesinya, membaca ulang akunnya dari tabel `users` (jadi perubahan peran berlaku di sini), lalu memberi **gelang baru** dan **kartu terusan baru**. Kartu yang lama tidak berlaku lagi. Mengganti kartu setiap kali dipakai seperti ini disebut **rotasi**.
4. ***Logout*** (`POST /auth/logout`): baris sesinya dihapus, kedua *cookie* dikosongkan, dan sambungan Socket.IO sesi itu diputus. Kartu terusannya mati seketika.
5. **Tujuh hari setelah *login***, sesinya habis walaupun rajin di-*refresh*, dan kamu harus *login* lagi.

Rotasi punya bonus: **pencurian kartu bisa ketahuan**. Backend mengingat kartu sebelumnya di kolom `token_lama`. Kalau kartu lama itu muncul lagi di loket, kemungkinan besar ada dua orang yang memegang kartu yang sama, yaitu kamu dan pencurinya. Backend tidak tahu siapa yang asli, jadi sesinya dicabut, dan keduanya harus *login* ulang. Ada satu pengecualian: kartu lama yang muncul lagi **kurang dari 30 detik** setelah diganti dianggap wajar, misalnya dua tab browser yang kebetulan me-*refresh* bersamaan. Dalam kasus itu, backend cukup memberi gelang baru, tanpa mencabut sesi.

Ada satu batas yang perlu kamu ingat. *Logout* mematikan kartu terusan, tetapi **gelang yang sudah telanjur dibawa orang lain tetap sah sampai kedaluwarsa**, paling lama 15 menit. Itulah harga dari gelang yang diperiksa tanpa database, dan alasan umurnya dibuat pendek. Hal yang sama berlaku saat sandi diganti: semua sesi akun itu dicabut, dan gelang yang beredar habis dengan sendirinya dalam 15 menit.

![Diagram refresh token dan logout: kartu terusan di loket, Konsep 7. Gelang adalah cookie akses berumur 15 menit; kartu terusan adalah cookie sesi yang hanya dikirim ke /auth/ dan berumur paling lama 7 hari. Waktu berjalan dari atas ke bawah, dengan tiga garis hidup: klien (browser, Bruno, terminal kecil), backend, dan tabel sesi (satu baris per login). Ada tujuh langkah bernomor. 1, login, dengan email dan sandi yang diperiksa bcrypt (Konsep 3): klien mengirim POST /auth/login; backend menulis baris baru ke tabel sesi, dengan token_hash berisi sidik jari SHA-256 kartu, lalu mengirim dua cookie ke klien: gelang (15 menit) dan kartu terusan. 2, selama 15 menit, setiap permintaan membawa gelang: GET /devices dengan gelang dijawab 200; backend hanya memeriksa tanda tangan dan exp, dan database tidak dibuka. 3, gelang basi, 15 menit kemudian: GET /devices dengan gelang basi dijawab 401. 4, refresh dengan rotasi, dan peran dibaca ulang dari tabel users: klien mengirim POST /auth/refresh dengan kartu terusan; backend menemukan kartu yang cocok dengan token_hash, lalu memutarnya: token_lama diisi token_hash, dan token_hash diisi sidik jari SHA-256 kartu baru; klien menerima gelang baru dan kartu baru, dan kartu lama tidak berlaku lagi. 5, kartu lama dipakai lagi, misalnya oleh pencurinya: POST /auth/refresh dengan kartu lama cocok dengan token_lama. Kotak jingga: kurang dari 30 detik sejak diganti dianggap toleransi, misalnya dua tab me-refresh bersamaan, jadi cukup gelang baru dan sesi tetap. Kotak merah: 30 detik atau lebih berarti kemungkinan dicuri, sesi dicabut dengan menghapus barisnya, dan kamu serta pencurinya sama-sama harus login ulang. 6, logout, dan kartu terusan mati seketika: POST /auth/logout, baris dihapus dari tabel sesi, kedua cookie dikosongkan, dan sambungan Socket.IO sesi itu diputus. 7, tujuh hari sejak login, walau rajin di-refresh: POST /auth/refresh dengan kartu terusan, backend melihat kolom kedaluwarsa sudah lewat, lalu menjawab 401: sesi habis, login lagi. Kotak catatan jujur di bawah: logout mematikan kartu terusan, tetapi gelang yang telanjur beredar tetap sah sampai kedaluwarsa, paling lama 15 menit; begitu juga saat sandi diganti.](aset/gelang-dan-kartu-terusan.png)

> ➡️ **Sudah membaca Konsep 7?** Lanjut ke [Praktik 4 — *Refresh* dan *logout*](#praktik-4--refresh-dan-logout-50-menit). Konsep 8 dibaca sebelum Praktik 5.

### 8. *Rate limiting*: jam pasir untuk penebak sandi

Sidik jari bcrypt membuat setiap tebakan lambat, tetapi penebak tetap bisa mencoba terus-menerus, siang dan malam. Pintu *login* butuh satu kunci lagi: **batas percobaan**, atau ***rate limiting*** (pembatasan laju).

Bayangkan sebuah **jam pasir** di loket *login*. Setiap alamat IP mendapat **10 kesempatan** setiap kali jam pasir dibalik, yaitu setiap **60 detik**. Percobaan ke-11 sebelum pasirnya habis dijawab **429 `Too Many Requests`** dengan pesan `terlalu banyak percobaan: coba lagi dalam N detik`. Begitu pasirnya habis, hitungannya kembali ke nol.

Beberapa hal tentang jam pasir ini:

- **Semua percobaan dihitung**, termasuk yang berhasil. Aturannya jadi sederhana dan adil: siapa pun hanya punya 10 ketukan per menit. Pengguna sungguhan jarang *login* lebih dari dua atau tiga kali per menit.
- **Percobaan ke-11 ditolak walaupun sandinya benar.** Selama pasirnya belum habis, loket bahkan tidak memeriksa sandinya. Inilah yang diuji syarat lulus ketiga.
- **Jawabannya membawa kepala penjelas**: `retry-after` (berapa detik lagi boleh mencoba), serta `x-ratelimit-limit`, `x-ratelimit-remaining`, dan `x-ratelimit-reset` (batasnya, sisanya, dan kapan dihitung ulang). Program yang sopan membaca `retry-after` lalu menunggu.
- **Hitungannya disimpan di memori backend**, jadi kembali ke nol setiap kali backend dimulai ulang. Untuk satu backend di laptop, itu cukup. Backend yang berjalan di banyak server sekaligus menyimpan hitungannya di tempat bersama, misalnya Redis (Fase 5).

Hitung sebentar. Sepuluh tebakan per menit sama dengan 14.400 tebakan sehari dari satu alamat. Untuk kalimat sandi 15 karakter, jumlah itu tidak ada artinya.

Kenapa kuncinya **alamat IP**, bukan email yang dicoba? Batas per email memang menahan penebak yang memakai banyak alamat IP sekaligus, tetapi ada efek sampingnya: **siapa pun bisa mengunci akun `admin` asli** hanya dengan sengaja salah 10 kali per menit memakai email akun `admin`. Pertimbangan ini dibahas lebih lanjut di 🔬.

> ➡️ **Sudah membaca Konsep 8?** Lanjut ke [Praktik 5 — Batasi percobaan *login*](#praktik-5--batasi-percobaan-login-30-menit). Konsep 9 dibaca sebelum Praktik 6.

### 9. CORS: mengapa browser menolak

Mulai Modul 22, dashboard React berjalan di browser dan memanggil backend dengan JavaScript. Saat itu kamu hampir pasti bertemu pesan merah di DevTools seperti `… has been blocked by CORS policy …`. Pesan itu bukan galat backend; **browser**-lah yang menolak. Untuk memahaminya, kenali dulu istilah **asal** (*origin*): gabungan **skema**, **nama host**, dan **port** sebuah halaman.

| Alamat halaman | Asalnya |
| :--- | :--- |
| `http://127.0.0.1:8080/docs` | `http://127.0.0.1:8080` |
| `http://localhost:5173/` (Vite, Modul 22) | `http://localhost:5173` |
| `http://127.0.0.1:5173/` | `http://127.0.0.1:5173`, **berbeda** dari baris di atasnya karena nama hostnya berbeda |

Browser menjalankan aturan **asal yang sama** (*same-origin policy*). JavaScript di halaman dari asal A boleh **mengirim** permintaan ke asal B, tetapi **tidak boleh membaca jawabannya**, kecuali B mengizinkannya lewat kepala jawaban seperti `access-control-allow-origin: http://127.0.0.1:5173`. Cara memberi izin lintas asal inilah yang disebut **CORS** (*Cross-Origin Resource Sharing*). Bayangkan browser sebagai **kurir** yang setia pada aturan: ia hanya menyerahkan surat balasan ke halaman yang namanya tercantum di surat izin dari server.

Untuk permintaan yang lebih "berisiko", misalnya `PUT`, atau `POST` dengan isi JSON, browser bahkan **bertanya dulu** sebelum mengirim. Ia mengirim permintaan `OPTIONS` yang disebut ***preflight*** (pemeriksaan pendahuluan): "Bolehkah halaman `http://127.0.0.1:5173` mengirim `PUT` ke sini, dengan *cookie*?" Kalau jawabannya tidak memuat izin, permintaan sebenarnya tidak pernah dikirim. *Preflight* tidak membawa *cookie*, jadi izin CORS harus dijawab **sebelum** satpam bekerja. Kalau satpam bekerja lebih dulu, *preflight* dijawab 401, dan browser melaporkannya sebagai `CORS error`.

Backend v0.5 memakai **@fastify/cors** dengan tiga setelan:

- **Daftar asal yang diizinkan**, dari setelan `CORS_ORIGIN` di `.env`. Bawaannya `http://localhost:5173,http://127.0.0.1:5173`, alamat Vite yang dipakai Modul 22.
- **`credentials: true`**: halaman di asal itu boleh mengirim *cookie*. Untuk itu, daftarnya harus ditulis lengkap. Tanda bintang (`*`, "semua asal") justru ditolak browser untuk permintaan yang membawa *cookie*.
- **Metode yang diizinkan** ditambah `PUT` karena `PUT /rules/:id` ikut dipakai dashboard.

Dua hal sering membuat pemula salah paham:

1. **CORS bukan kunci server.** CORS adalah aturan **browser** untuk melindungi penggunanya. Bruno, curl, dan terminal kecil sama sekali tidak memedulikannya. Kunci server tetap *login* dan satpam.
2. ***Site* tidak sama dengan *origin*.** `SameSite` di Konsep 5 bekerja per **situs** (*site*), yaitu skema dan nama domain utamanya **tanpa port**. Untuk alamat IP seperti `127.0.0.1`, situsnya adalah alamat itu sendiri, sedangkan `app.rumah.test` dan `api.rumah.test` masih satu situs. Karena itu, `http://127.0.0.1:5500` (misalnya halaman lain di laptopmu) dan `http://127.0.0.1:8080` adalah **dua asal berbeda, tetapi satu situs**, dan *cookie* `SameSite=Strict` tetap terlampir pada permintaan di antara keduanya. Halaman semacam itu memang tidak bisa membaca jawaban backend (CORS menahannya), tetapi permintaannya tetap sampai, dan menyalakan relay tidak butuh membaca jawaban. Karena itu, satpam diberi pemeriksaan tambahan: untuk permintaan selain `GET` dan `HEAD`, kepala `Origin` yang ditulis browser harus ada di daftar asal yang dikenal. Kalau tidak: **403**.

Ada satu pelajaran praktis lagi: `localhost` dan `127.0.0.1` adalah **dua situs berbeda** bagi browser walaupun keduanya menunjuk laptop yang sama. *Cookie* yang didapat dari `http://127.0.0.1:8080` tidak pernah dikirim ke `http://localhost:8080`, dan halaman di `http://localhost:5173` yang memanggil `http://127.0.0.1:8080` pun tidak membawa *cookie*-nya walaupun CORS-nya sudah benar. Itulah sebabnya modul ini selalu memakai `127.0.0.1`, dan Modul 22 membuat dashboard dan API tampak satu asal lewat proksi Vite.

![Diagram CORS: mengapa browser menolak, Konsep 9. Browser adalah kurir yang setia pada aturan; backend di http://127.0.0.1:8080 dengan CORS_ORIGIN bawaan. Kiri atas, asal (origin) sama dengan skema ditambah nama host ditambah port, dengan dua contoh yang bagian-bagiannya diberi kurung: http://127.0.0.1:8080, yaitu skema http, nama host 127.0.0.1, dan port 8080; serta http://localhost:5173, yaitu skema http, nama host localhost, dan port 5173. Catatan: beda satu bagian saja, termasuk port, berarti asal yang lain. Kanan atas, situs (site) sama dengan skema ditambah nama domain utama, tanpa port (untuk alamat IP, alamat itu sendiri): http://127.0.0.1:5500 dan http://127.0.0.1:8080 adalah dua asal, tetapi satu situs; http://localhost dan http://127.0.0.1 adalah dua situs berbeda walaupun laptopnya sama; SameSite bekerja per situs, CORS bekerja per asal. Tengah, tiga halaman di browser yang sama mengirim permintaan ke backend. Di kiri tiga kartu halaman; di tengah pita abu-abu browser sebagai kurir, dengan ikon amplop, yang melampirkan cookie atau tidak, lalu memutuskan apakah jawabannya boleh diserahkan ke halaman; di kanan kotak hijau backend http://127.0.0.1:8080. Halaman a, http://127.0.0.1:5173, ada di CORS_ORIGIN dan satu situs dengan backend: langkah 1, preflight OPTIONS menanyakan bolehkah PUT dengan cookie; @fastify/cors melihat asal itu ada di daftar dan menjawab izin sebelum satpam bekerja, yaitu access-control-allow-origin http://127.0.0.1:5173 dan access-control-allow-credentials true; langkah 2, PUT /rules/1 dengan cookie; satpam melihat gelang sah dengan peran admin; jawaban 200 diserahkan ke halaman. Halaman b, http://iseng.test, situs lain, halaman asing di tab lain: GET /devices dikirim tanpa cookie karena SameSite=Strict; backend menjawab 401 karena tanpa cookie, dan access-control-allow-origin tidak ada di jawaban; jawaban tanpa izin CORS itu ditahan kurir dengan tanda silang merah: CORS error di DevTools, dan halaman tidak mendapat apa-apa. Halaman c, http://127.0.0.1:5500, asal lain, tetapi situs sama, misalnya halaman lain di laptopmu: POST dari form, dan karena situsnya sama, cookie ikut; permintaan sederhana ini tanpa preflight dan tetap sampai; satpam memeriksa kepala Origin, http://127.0.0.1:5500 tidak ada di daftar asal yang dikenal, jadi 403 dan perintahnya ditolak (langkah 0 satpam, Praktik 6). Bawah kiri, kotak hijau: CORS adalah aturan browser, bukan kunci server; Bruno, curl, dan terminal kecil tidak memedulikannya; kunci server tetap login dan satpam. Bawah kanan: localhost tidak sama dengan 127.0.0.1, dua situs berbeda; cookie dari http://127.0.0.1:8080 tidak pernah dikirim ke http://localhost:8080, dan modul ini selalu memakai 127.0.0.1.](aset/cors-dan-asal.png)

> ➡️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 6 — CORS dan pemeriksaan asal](#praktik-6--cors-dan-pemeriksaan-asal-40-menit). Konsep 10 dibaca sebelum Praktik 7.

### 10. Socket.IO ikut dikunci: pintu aula memakai gelang yang sama

Socket.IO menumpang di server HTTP yang sama dengan Fastify, tetapi ia **menjawab sendiri** semua permintaan ke `/socket.io/` **sebelum** Fastify melihatnya. Akibatnya, satpam Fastify tidak pernah melihat tamu yang menyambung ke Socket.IO. Setelah Praktik 3 pun, terminal kecil Modul 19 masih bisa menonton data *live* tanpa *login*. Gedung konser kita ternyata punya **pintu aula** di samping, dan pintu itu butuh penjaganya sendiri.

Kabar baiknya, penjaga itu bisa memakai **gelang yang sama**. Socket.IO selalu memulai sambungan dengan permintaan HTTP biasa yang disebut ***handshake*** (jabat tangan), dan permintaan itu membawa *cookie* seperti permintaan lain. Browser melampirkannya otomatis; klien Node seperti terminal kecil menuliskannya sendiri. Penjaga pintu aula dipasang dengan **`io.use()`**, yang berjalan sekali setiap kali ada klien yang menyambung:

1. Baca *cookie* `akses` dari kepala permintaan *handshake*.
2. Periksa gelangnya dengan stempel yang sama (`JWT_SECRET`).
3. Kalau lolos, catat pemiliknya di `socket.data` dan masukkan sambungannya ke *room* `sesi:<sid>`. Kalau tidak, tolak dengan pesan `belum login` atau `sesi habis atau tidak sah: refresh atau login lagi`. Klien menerima pesan itu lewat acara `connect_error`.

Ada perbedaan penting dengan HTTP. Satpam HTTP memeriksa gelang di **setiap** permintaan, sedangkan penjaga aula hanya memeriksa **sekali**, di pintu. Sambungan yang sudah di dalam aula akan tetap terbuka berjam-jam walaupun gelangnya sudah kedaluwarsa. Karena itu, backend memasang dua aturan tambahan:

- **Saat gelang kedaluwarsa, sambungan diputus.** Klien yang ingin tetap tersambung harus me-*refresh* dulu, lalu menyambung lagi dengan gelang baru.
- **Saat *logout*, atau saat backend mencabut sesi karena kartu terusan lama dipakai lagi, sambungan sesi itu langsung diputus.** Itulah gunanya *room* `sesi:<sid>`: backend cukup memutus semua sambungan di *room* itu. Sesi yang dicabut dari luar backend, misalnya oleh `npm run pengguna` saat sandi diganti, baru berakhir ketika gelangnya kedaluwarsa karena klien tidak bisa me-*refresh* lagi.

Pintu aula juga memakai **pemeriksaan asal yang sama** dengan satpam HTTP: *handshake* dari halaman yang asalnya tidak dikenal ditolak, sedangkan klien Node yang tidak menulis kepala `Origin` tetap boleh menyambung asalkan gelangnya sah. Pemeriksaan ini dipasang lewat pilihan `allowRequest` Socket.IO, yang memakai daftar asal yang sama dengan satpam HTTP. Kolom kanan gambar di akhir [Konsep 6](#6-satpam-di-setiap-pintu-peran-admin-dan-viewer) merangkum seluruh penjaga pintu aula ini.

Terminal kecil buatanmu ikut berubah. Ia kini *login* dulu dengan akun **`viewer`** (prinsip hak sekecil mungkin: terminal itu hanya perlu melihat), menyimpan kedua *cookie* dari jawaban *login*, lalu menyambung. Saat diputus karena gelangnya kedaluwarsa, ia me-*refresh* sendiri lalu menyambung lagi.

> ➡️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 7 — Socket.IO ikut dikunci](#praktik-7--socketio-ikut-dikunci-50-menit). Konsep 11 dibaca sebelum Praktik 8.

### 11. Rahasia dan privasi: yang tidak boleh bocor

Mulai minggu ini, file `.env` backend menyimpan lebih banyak rahasia. Begitu juga dua file `.env` baru:

| Rahasia | Tempatnya | Kalau bocor |
| :--- | :--- | :--- |
| Sandi database (di `DATABASE_URL`) | `backend/.env` | Seluruh isi database terbuka bagi siapa pun yang bisa menjangkau port-nya |
| `TELEGRAM_BOT_TOKEN` | `backend/.env` | Orang lain bisa mengirim pesan atas nama bot-mu |
| `JWT_SECRET` (baru) | `backend/.env` | Orang lain bisa membuat gelang `admin` palsu |
| Sandi akun untuk Bruno (baru) | `backend/bruno/.env` | Akunnya diambil alih |
| Sandi akun terminal kecil (baru) | `alat/.env` | Akun `viewer`-nya diambil alih |

Ketiga file itu **tidak boleh** ikut Git. Pertahanan utamanya tetap **`.gitignore`**, seperti sejak Modul 16. Yang ikut Git hanya **`.env.example`**: salinan tanpa rahasia yang menunjukkan setelan apa saja yang harus diisi.

GitHub juga punya penjaga tambahan: ***secret scanning*** (pemindaian rahasia). Untuk repositori publik, GitHub memindai setiap *push* dan mencari teks yang **bentuknya** cocok dengan ratusan pola rahasia dari berbagai penyedia layanan, misalnya kunci AWS atau token GitHub. Temuannya muncul sebagai peringatan di tab **Security and quality** repositori (di tampilan lama GitHub, tab ini bernama **Security**). Untuk sebagian pola, *push*-nya bahkan langsung ditahan (***push protection***). Namun, penjaga ini terbatas: **ia hanya mengenali bentuk yang sudah diketahuinya.** Token bot Telegram dikenali dan diberi peringatan, tetapi *push*-nya tidak ditahan. `JWT_SECRET` buatanmu hanyalah 43 huruf acak, dan bentuk seperti itu tidak dikenali sama sekali. Jadi, *secret scanning* adalah jaring pengaman terakhir, bukan pengganti `.gitignore`.

Kalau sebuah rahasia telanjur ter-*push*, urutannya: **ganti rahasianya dulu**, baru bersihkan. Walaupun *commit*-nya dihapus, rahasia yang sudah pernah tampil di GitHub harus dianggap bocor karena salinannya mungkin sudah diambil orang. Untuk `JWT_SECRET`, buat yang baru; semua gelang lama langsung tidak sah. Untuk token bot, minta token baru lewat @BotFather.

**Privasi** adalah sisi lain dari rahasia: data milik **orang lain** yang kamu simpan. Prinsipnya sederhana: **simpan seperlunya, jaga yang disimpan, dan hapus yang tidak dipakai.** Backend v0.5 menerapkannya seperti ini:

- **Yang disimpan tentang setiap akun hanya email, nama, peran, sidik jari sandi, kapan akun dibuat, dan kapan sandi diganti.** Tabel `sesi` sengaja tidak mencatat alamat IP atau jenis browser.
- **Gelang hanya memuat nomor akun, peran, dan nomor sesi** karena isinya bisa dibaca siapa saja.
- **Log tidak pernah memuat sandi, gelang, atau kartu terusan.** Log hanya mencatat metode (`GET`, `POST`, …), alamat, kode jawaban, nomor akun, dan alamat IP percobaan *login* (supaya penebak sandi terlihat). Praktik 8 membuktikannya.
- **Menghapus akun ikut menghapus semua sesinya.**
- **Data sensor juga data pribadi.** Riwayat gerakan dan suhu menceritakan kapan rumah ramai dan kapan kosong. Itulah sebabnya data *live* dan riwayat ikut dikunci.

Di Indonesia, data pribadi dilindungi **Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi**. Untuk proyek di rumah sendiri, kamu tidak perlu mendalami pasal-pasalnya. Kebiasaan "simpan seperlunya, jaga, hapus" di atas sudah merupakan langkah awal yang baik.

> ➡️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 8 — Rahasia, privasi, dan uji kelulusan](#praktik-8--rahasia-privasi-dan-uji-kelulusan-40-menit).

## 🔧 Praktik langkah demi langkah

### Praktik 1 — Rahasia, tabel sesi, dan akun pertama (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini`; terminal di folder `backend`), **Docker Desktop** dengan kontainer `rumahpintar-db` yang menyala, dan **psql** di dalam kontainer itu. Pengguna Windows: pakai terminal VS Code bawaan (PowerShell), **bukan Git Bash**.

Backend belum bisa memeriksa siapa pun karena belum ada satu akun pun. Praktik ini menyiapkan tiga hal: **stempel panitia** (`JWT_SECRET`) di `.env`, **tempat menyimpan sidik jari sandi dan sesi** di database (migrasi `008`), dan **dua akun pertama**, satu `admin` dan satu `viewer`. Akun sengaja dibuat lewat terminal, bukan lewat API. Hanya orang yang memegang laptop server beserta file `.env`-nya yang boleh membuat akun, jadi tidak ada pintu "daftar" yang bisa diketuk orang asing.

#### 1.1 Buat stempel panitia: `JWT_SECRET` (5 menit)

Buka terminal di folder `backend` (kalau terminal Kemenangan Cepat masih terbuka, kamu sudah di sana; kalau membuka terminal baru, ketik dulu `cd backend`), lalu buat 32 *byte* acak:

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

**Hasilnya** (**contoh**; milikmu pasti berbeda, dan **jangan pernah memakai yang tercetak di modul ini**):

```text
afECyYqdbI2sLmD3uDDo1wHsarmrX_6xzW7QdzBib70
```

- **`node -e "…"`** menjalankan satu baris JavaScript tanpa membuat file. Isinya sama dengan pemanasan langkah 2: 32 *byte* dari sumber acak sistem operasi, ditulis sebagai 43 karakter *base64url*.
- Perintah yang sama berjalan di PowerShell 5.1, PowerShell 7, dan Terminal macOS.

Pilih seluruh baris hasilnya, lalu salin (**Ctrl + C**). Buka file **`.env`** di folder `backend`, lalu tambahkan dua baris ini di paling bawah:

```text
# Modul 20: kunci untuk menandatangani gelang (JWT). Rahasia: jangan dibagikan, jangan di-commit.
JWT_SECRET=ganti-dengan-hasil-perintah-tadi
```

Ganti teks `ganti-dengan-hasil-perintah-tadi` dengan hasil salinanmu (**Ctrl + V**) sehingga barisnya menjadi `JWT_SECRET=` diikuti 43 karakter acak milikmu, tanpa spasi dan tanpa tanda petik. Simpan (**Ctrl + S**). Ingat Konsep 4: siapa pun yang tahu nilai ini bisa membuat gelang `admin` palsu. Setiap laptop atau server punya `JWT_SECRET`-nya sendiri, dan menggantinya membuat semua gelang lama tidak sah sehingga setiap klien harus me-*refresh* dulu sebelum bisa memakai backend lagi.

Teman satu tim juga perlu tahu bahwa setelan ini wajib, tanpa melihat isinya. Buka **`.env.example`**, lalu tambahkan di paling bawah:

```text
# Modul 20: kunci tanda tangan JWT, minimal 32 karakter acak. Buat sendiri dengan perintah ini, lalu tempel hasilnya:
#   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
JWT_SECRET=ganti-dengan-hasil-perintah-di-atas
```

`.env.example` ikut Git, jadi isinya hanya contoh yang jelas-jelas bukan rahasia. Kata `ganti-dengan-…` itu nanti ditolak backend supaya tidak ada yang lupa mengisinya.

#### 1.2 Periksa `.env` dengan Zod (10 menit)

Sejak Modul 16, `src/config/env.ts` hanya memeriksa apakah sebuah setelan **ada**. Sekarang `.env` berisi rahasia yang harus memenuhi syarat: `JWT_SECRET` minimal 32 karakter dan bukan teks contoh. Pemeriksaannya diserahkan ke **Zod**, pemeriksa yang sama dengan kontrak data sejak Modul 16. Buka **`src/config/env.ts`**, lalu ganti seluruh isinya dengan:

```ts
// env.ts - setelan server dari file .env (dibaca Node.js lewat --env-file), diperiksa skema Zod sekali saat server mulai.
// Modul 20: .env kini juga berisi rahasia (JWT_SECRET), jadi isinya diperiksa seketat pesan dari perangkat.
import { z } from "zod";

z.config(z.locales.id()); // pesan galat Zod dalam bahasa Indonesia (file ini dibaca paling awal, sebelum kontrak.ts)

const kosong = (nilai: unknown) => (nilai === "" ? undefined : nilai); // baris "NAMA=" tanpa isi = belum diisi
const wajib = z.preprocess(kosong, z.string({ error: "belum diisi" }));

const Setelan = z.object({
  MQTT_URL: wajib, // alamat broker, misalnya mqtt://192.168.1.37:1883
  DATABASE_URL: wajib, // alamat database, misalnya postgres://postgres:<sandi>@127.0.0.1:5432/rumahpintar
  PORT: z.preprocess(kosong, z.coerce.number().int().min(1).max(65535).default(8080)), // nomor loket server
  HOST: z.preprocess(kosong, z.string().default("127.0.0.1")), // 127.0.0.1 = hanya bisa diketuk dari laptop ini
  // Modul 19: Telegram tidak wajib. Kosong = notifikasi Telegram mati.
  TELEGRAM_BOT_TOKEN: z.string().default(""), // token dari @BotFather: rahasia, seperti kata sandi
  TELEGRAM_CHAT_ID: z.string().default(""), // chat_id pemilik (balasan /start)
  TELEGRAM_API_ROOT: z.string().default(""), // kosong = server Telegram sungguhan (lab: server Bot API tiruan)
  // Modul 20: kunci untuk menandatangani JWT. Siapa pun yang tahu kunci ini bisa membuat "gelang" palsu.
  JWT_SECRET: z.preprocess(kosong, z.string({ error: "belum diisi" })
    .min(32, "terlalu pendek (minimal 32 karakter); buat yang baru dengan perintah di .env.example")
    .refine((s) => !s.startsWith("ganti"), "masih berisi contoh dari .env.example; buat rahasia baru")),
});

const hasil = Setelan.safeParse(process.env);
if (!hasil.success) {
  // tampilkan SEMUA masalah sekaligus, supaya tidak perlu bolak-balik memperbaiki satu per satu
  for (const masalah of hasil.error.issues) console.error(`Setelan ${masalah.path.join(".")} di .env: ${masalah.message}`);
  console.error("Salin .env.example menjadi .env (atau buka .env-mu), perbaiki setelan di atas, lalu jalankan lagi.");
  process.exit(1); // berhenti di sini: tanpa setelan yang benar server tidak boleh berjalan
}

export const env = hasil.data;
```

- **`z.config(z.locales.id())`** membuat pesan galat bawaan Zod berbahasa Indonesia. File ini dibaca paling awal oleh backend, jadi setelan bahasanya berlaku untuk semua skema Zod lain.
- **`kosong`** mengubah baris seperti `JWT_SECRET=` (tanpa isi) menjadi "belum ada" sehingga dianggap belum diisi. **`z.preprocess()`** menjalankan fungsi itu sebelum Zod memeriksa nilainya.
- **`PORT`** diubah dari teks menjadi angka (`z.coerce.number()`), harus bilangan bulat 1–65.535, dan memakai `8080` kalau kosong.
- **`JWT_SECRET`** wajib ada, minimal 32 karakter, dan tidak boleh diawali `ganti`, yaitu teks contoh dari `.env.example`.
- **`safeParse()`** tidak langsung berhenti pada masalah pertama. Semua masalah dicetak sekaligus, lalu `process.exit(1)` menghentikan program karena backend tanpa setelan yang benar tidak boleh berjalan.
- Nama setelannya tidak berubah (`env.MQTT_URL`, `env.PORT`, dan seterusnya), jadi file lain tidak perlu diubah.

Coba pemeriksaannya. Di `.env`, beri tanda `#` di depan baris `JWT_SECRET=…` sehingga baris itu dianggap komentar, simpan, lalu jalankan:

```text
npm run dev
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.4.0 dev
> node --watch --env-file=.env src/server.ts

Setelan JWT_SECRET di .env: belum diisi
Salin .env.example menjadi .env (atau buka .env-mu), perbaiki setelan di atas, lalu jalankan lagi.
Failed running 'src/server.ts'. Waiting for file changes before restarting...
```

Backend menolak berjalan, dan `npm run dev` menunggu ada file yang berubah. Biarkan terminal itu, lalu hapus lagi tanda `#` di `.env` dan simpan. `npm run dev` ikut mengawasi `.env`, jadi backend dimulai ulang dengan sendirinya.

**Hasilnya** (**contoh**; jalur file di layarmu berbeda):

```text
Change detected in 'C:\\…\\rumah-pintar-mini\\backend\\.env'
Restarting 'src/server.ts'
[08:56:50] INFO: database siap
[08:56:50] INFO: aturan dimuat: 2 aktif dari 3
[08:56:50] INFO: jadwal aturan 2 (Siram pagi) dipasang: "0 6 * * *" Asia/Jakarta, berikutnya 23 Okt 2026, 06.00 WIB
[08:56:52] INFO: notifikasi Telegram mati: TELEGRAM_BOT_TOKEN belum diisi
[08:56:52] INFO: Server listening at http://127.0.0.1:8080
[08:56:52] INFO: dokumentasi API: http://127.0.0.1:8080/docs
[08:56:52] INFO: tersambung ke broker mqtt://127.0.0.1:1883
[08:56:52] INFO: config c-20261022-015652-1 ke f00d00000001: suhu_kipas_on 30 dari aturan 1 (retained)
```

Backend menyala seperti biasa. Baris `notifikasi Telegram mati` hanya muncul kalau `TELEGRAM_BOT_TOKEN`-mu kosong. Pesan galat lain yang mungkin kamu temui:

| Isi `.env` | Pesannya |
| :--- | :--- |
| `JWT_SECRET=ganti-dengan-hasil-perintah-di-atas` (disalin dari `.env.example`) | `Setelan JWT_SECRET di .env: masih berisi contoh dari .env.example; buat rahasia baru` |
| `JWT_SECRET=rahasia-saya-123` (16 karakter) | `Setelan JWT_SECRET di .env: terlalu pendek (minimal 32 karakter); buat yang baru dengan perintah di .env.example` |
| `JWT_SECRET=` (barisnya ada, isinya kosong) | `Setelan JWT_SECRET di .env: belum diisi` |
| `MQTT_URL=` kosong **dan** `JWT_SECRET` masih contoh | dua baris sekaligus: `Setelan MQTT_URL di .env: belum diisi` lalu `Setelan JWT_SECRET di .env: masih berisi contoh dari .env.example; buat rahasia baru` |

Hentikan backend dengan **Ctrl + C**: sisa praktik ini belum membutuhkannya.

#### 1.3 Migrasi `008`: tempat sidik jari dan sesi (10 menit)

Di panel Explorer, klik dulu ruang kosong, lalu klik kanan folder **`backend/migrasi`** → **New File…**, beri nama **`008_login_dan_sesi.sql`**, lalu ketik:

```sql
-- 008_login_dan_sesi.sql - akun bisa login (Modul 20): sidik jari kata sandi (hash bcrypt) di tabel users, dan tabel sesi
-- untuk refresh token. Satu baris sesi = satu login yang masih aktif di satu browser atau perangkat.

-- Tabel users sudah disiapkan sejak Modul 17 (migrasi 001), tetapi belum punya kata sandi. Yang disimpan hanya sidik
-- jarinya (hash bcrypt, 60 huruf, diawali $2b$). Akun yang sandi_hash-nya kosong (NULL) tidak bisa login.
-- Email selalu disimpan dengan huruf kecil, jadi Budi@Rumah.test dan budi@rumah.test adalah akun yang sama.
ALTER TABLE users
  ADD COLUMN sandi_hash   text CHECK (sandi_hash ~ '^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$'),
  ADD COLUMN sandi_diubah timestamptz,
  ADD CONSTRAINT users_email_huruf_kecil CHECK (email = lower(email));

-- Login yang masih aktif. Refresh token aslinya (32 byte acak) hanya ada di cookie browser; database menyimpan SHA-256-nya,
-- jadi orang yang mencuri isi database tidak bisa memakainya. Setiap POST /auth/refresh menukar token lama dengan token
-- baru (rotasi): token_hash diganti, token sebelumnya dipindah ke token_lama. Kalau token_lama dipakai lagi, besar
-- kemungkinan token itu dicuri, jadi sesinya dihapus (semua yang memakai sesi itu harus login ulang).
CREATE TABLE sesi (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pengguna_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- akun dihapus = semua sesinya ikut terhapus
  token_hash  text NOT NULL UNIQUE,                                      -- SHA-256 refresh token yang berlaku sekarang
  token_lama  text,                                                      -- SHA-256 refresh token sebelumnya
  dibuat      timestamptz NOT NULL DEFAULT now(),                        -- kapan login
  diperbarui  timestamptz NOT NULL DEFAULT now(),                        -- kapan terakhir di-refresh (rotasi)
  kedaluwarsa timestamptz NOT NULL                                       -- 7 hari setelah login: sesudah itu login lagi
);
CREATE INDEX sesi_pengguna_idx ON sesi (pengguna_id);
CREATE INDEX sesi_token_lama_idx ON sesi (token_lama);
```

- **`ALTER TABLE users`** menambahkan dua kolom ke tabel `users` yang sudah disiapkan sejak Modul 17: **`sandi_hash`** (sidik jari bcrypt) dan **`sandi_diubah`** (kapan sandi terakhir diganti).
- **`CHECK (sandi_hash ~ '…')`** menolak apa pun yang bentuknya bukan sidik jari bcrypt 60 karakter. Kalau suatu hari ada kode yang tidak sengaja mencoba menyimpan sandi apa adanya, database menolaknya. Tanda `~` artinya "cocok dengan pola" (*regular expression*).
- **`CHECK (email = lower(email))`** memastikan email selalu tersimpan dengan huruf kecil, jadi satu orang tidak bisa punya dua akun hanya karena beda huruf besar.
- **Tabel `sesi`** mencatat setiap *login* yang masih aktif: pemiliknya (`pengguna_id`), sidik jari kartu terusan sekarang (`token_hash`) dan sebelumnya (`token_lama`), kapan dibuat, kapan terakhir di-*refresh*, dan kapan kedaluwarsa (Konsep 7). **`ON DELETE CASCADE`** berarti sesi ikut terhapus saat akunnya dihapus.
- **Dua indeks** mempercepat pencarian sesi menurut pemilik dan menurut kartu lama.

Jalankan migrasinya:

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.4.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 008_login_dan_sesi.sql
1 migrasi baru diterapkan, 6 sudah ada sebelumnya.
```

Enam migrasi lama adalah `001`–`005` dan `007`. Nomor `006` memang tidak ada di repositorimu kecuali kamu mengerjakan Tantangan Tingkat 3 Modul 18; kalau kamu mengerjakannya, baris terakhirnya menyebut `7 sudah ada sebelumnya`, lalu `8 sudah ada sebelumnya` saat perintah ini diulang.

Jalankan sekali lagi untuk memastikan tidak ada yang diterapkan dua kali:

```text
npm run migrasi
```

**Hasilnya** (baris terakhir):

```text
0 migrasi baru diterapkan, 7 sudah ada sebelumnya.
```

`npm run migrasi` juga membaca `.env` lewat `src/config/env.ts`. Itulah sebabnya `JWT_SECRET` harus diisi lebih dulu: tanpa setelan itu, `npm run migrasi` pun berhenti dengan pesan `Setelan JWT_SECRET di .env: belum diisi`.

#### 1.4 Aturan dan sidik jari sandi: `src/auth/sandi.ts` (5 menit)

Buat folder baru untuk semua urusan keamanan: klik kanan folder **`backend/src`** → **New Folder…**, beri nama **`auth`**. Lalu klik kanan folder `auth` → **New File…**, beri nama **`sandi.ts`**, dan ketik:

```ts
// sandi.ts - aturan kata sandi dan "sidik jari"-nya (hash bcrypt), Modul 20. Database hanya menyimpan sidik jari:
// dari sidik jari, sandi aslinya tidak bisa dihitung balik, tetapi sandi yang diketik bisa dicocokkan dengannya.
import bcrypt from "bcrypt";
import { z } from "zod";

// cost 12 = 2^12 putaran: sekitar 0,3 detik di laptop i5 tahun 2021. Naik 1 = dua kali lebih lama (OWASP: minimal 10, < 1 detik).
export const COST = 12;

// Aturan sandi baru (NIST SP 800-63B-4): yang penting PANJANG, bukan campuran huruf besar-angka-simbol.
// bcrypt hanya membaca 72 byte pertama, jadi sandi yang lebih panjang ditolak (bukan diam-diam dipotong).
export const Sandi = z.string()
  .min(15, "sandi minimal 15 karakter; pakai kalimat sandi: beberapa kata yang hanya kamu yang tahu")
  .refine((s) => Buffer.byteLength(s, "utf8") <= 72, "sandi maksimal 72 byte (batas bcrypt; satu emoji = 4 byte)");

export function buatSidikJari(sandi: string): Promise<string> {
  return bcrypt.hash(sandi, COST); // garam (salt) acak dibuat otomatis dan ikut tersimpan di dalam hasilnya
}

// Sidik jari palsu untuk email yang tidak terdaftar: bcrypt.compare tetap dijalankan, jadi jawaban "email salah" sama
// lamanya dengan "sandi salah" dan penyerang tidak bisa menebak email mana yang terdaftar dari lamanya jawaban.
// Dibuat SEKALI saat server mulai (bukan saat pertama dibutuhkan: itu membuat percobaan pertama dua kali lebih lama).
const sidikPalsu = bcrypt.hash("bukan sandi siapa pun", COST);

// Hasilnya true kalau sandi cocok. sidikJari undefined/null = akun tidak ada atau belum punya sandi (tetap dihitung).
export async function cocokkanSandi(sandi: string, sidikJari: string | null | undefined): Promise<boolean> {
  if (sidikJari === null || sidikJari === undefined) {
    await bcrypt.compare(sandi, await sidikPalsu); // hasilnya dibuang: hanya supaya waktunya sama
    return false;
  }
  return bcrypt.compare(sandi, sidikJari);
}
```

- **`COST = 12`** adalah angka biaya bcrypt dari Konsep 3.
- **`Sandi`** adalah skema Zod untuk aturan sandi: minimal 15 karakter, dan paling panjang 72 *byte*. `Buffer.byteLength(s, "utf8")` menghitung *byte*, bukan karakter, sehingga 19 emoji (38 karakter JavaScript, 76 *byte*) ditolak.
- **`buatSidikJari()`** membuat sidik jari. Garam acaknya dibuat bcrypt sendiri.
- **`sidikPalsu`** dibuat **sekali saat program mulai**, lalu dipakai `cocokkanSandi()` untuk email yang tidak terdaftar supaya jawabannya sama lamanya dengan sandi yang salah (Konsep 3). Perhatikan bahwa ia disimpan sebagai *promise* (janji hasil) tanpa `await`: hitungannya berjalan di latar belakang saat server mulai, dan baru ditunggu saat pertama kali dibutuhkan.

#### 1.5 Akun di database: `src/db/pengguna.ts` (5 menit)

Klik kanan folder **`backend/src/db`** → **New File…**, beri nama **`pengguna.ts`**, lalu ketik:

```ts
// pengguna.ts - akun (tabel users) dan login yang masih aktif (tabel sesi), Modul 20. Sidik jari sandi (sandi_hash)
// hanya keluar dari file ini lewat cariUntukLogin: fungsi lain tidak pernah mengambilnya.
import { pool } from "./pool.ts";

export type Peran = "admin" | "viewer";

export interface Pengguna {
  id: number;
  email: string;
  nama: string;
  peran: Peran;
}

const KOLOM = "id, email, nama, peran";

export async function cariUntukLogin(email: string): Promise<(Pengguna & { sandi_hash: string | null }) | undefined> {
  const hasil = await pool.query<Pengguna & { sandi_hash: string | null }>(
    `SELECT ${KOLOM}, sandi_hash FROM users WHERE email = $1`, [email]);
  return hasil.rows[0];
}

export async function semuaPengguna(): Promise<(Pengguna & { punya_sandi: boolean; sesi_aktif: number })[]> {
  const hasil = await pool.query<Pengguna & { punya_sandi: boolean; sesi_aktif: number }>(
    `SELECT u.id, u.email, u.nama, u.peran, u.sandi_hash IS NOT NULL AS punya_sandi,
            (SELECT count(*)::int FROM sesi s WHERE s.pengguna_id = u.id AND s.kedaluwarsa > now()) AS sesi_aktif
     FROM users u ORDER BY u.id`);
  return hasil.rows;
}

export async function tambahPengguna(email: string, nama: string, peran: Peran, sandiHash: string): Promise<Pengguna> {
  const hasil = await pool.query<Pengguna>(
    `INSERT INTO users (email, nama, peran, sandi_hash, sandi_diubah) VALUES ($1, $2, $3, $4, now()) RETURNING ${KOLOM}`,
    [email, nama, peran, sandiHash]);
  return hasil.rows[0];
}

// Ganti sandi, lalu cabut semua sesinya: siapa pun yang masih login dengan sandi lama harus login ulang.
export async function gantiSandi(email: string, sandiHash: string): Promise<Pengguna | undefined> {
  const hasil = await pool.query<Pengguna>(
    `UPDATE users SET sandi_hash = $2, sandi_diubah = now() WHERE email = $1 RETURNING ${KOLOM}`, [email, sandiHash]);
  const p = hasil.rows[0];
  if (p !== undefined) await pool.query("DELETE FROM sesi WHERE pengguna_id = $1", [p.id]);
  return p;
}

export async function gantiPeran(email: string, peran: Peran): Promise<Pengguna | undefined> {
  const hasil = await pool.query<Pengguna>(`UPDATE users SET peran = $2 WHERE email = $1 RETURNING ${KOLOM}`, [email, peran]);
  return hasil.rows[0];
}

export async function hapusPengguna(email: string): Promise<boolean> {
  const hasil = await pool.query("DELETE FROM users WHERE email = $1", [email]); // sesinya ikut terhapus (CASCADE)
  return hasil.rowCount === 1;
}
```

- **`KOLOM`** sengaja tidak memuat `sandi_hash`. Hanya `cariUntukLogin()` yang mengambil sidik jari sandi, jadi fungsi lain tidak mungkin mengirimkannya ke API atau log secara tidak sengaja.
- **`semuaPengguna()`** menghitung sesi yang masih aktif untuk setiap akun, dan hanya menjawab **apakah** akun itu punya sandi (`punya_sandi`), bukan sidik jarinya.
- **`gantiSandi()`** juga menghapus semua sesi akun itu sehingga siapa pun yang masih memegang kartu terusan lama harus *login* ulang (Konsep 7).
- Semua kueri memakai parameter `$1`, `$2`, seperti Modul 17, sehingga email yang aneh pun tidak bisa menyusupkan perintah SQL.

#### 1.6 Pengurus akun dari terminal: `npm run pengguna` (10 menit)

Klik kanan folder **`backend/src/db`** → **New File…**, beri nama **`kelola-pengguna.ts`**, lalu ketik:

```ts
// kelola-pengguna.ts - membuat dan mengurus akun dari terminal (Modul 20). Sengaja TIDAK ada rute API untuk mendaftar:
// akun hanya bisa dibuat oleh orang yang memegang laptop server dan file .env-nya.
// Jalankan dari folder backend:
//   npm run pengguna -- tambah <email> "<nama>" <admin|viewer>   sandi ditanyakan dan tidak tampil di layar
//   npm run pengguna -- sandi <email>                            ganti sandi; semua sesi akun itu dicabut
//   npm run pengguna -- peran <email> <admin|viewer>
//   npm run pengguna -- hapus <email>
//   npm run pengguna -- daftar
// Sandi TIDAK PERNAH ditulis sebagai argumen: argumen tersimpan di riwayat terminal dan terlihat di daftar proses.
import { z } from "zod";
import { pool } from "./pool.ts";
import { Sandi, buatSidikJari } from "../auth/sandi.ts";
import { cariUntukLogin, gantiPeran, gantiSandi, hapusPengguna, semuaPengguna, tambahPengguna } from "./pengguna.ts";
import type { Peran } from "./pengguna.ts";

const Email = z.email("email tidak sah").max(254);
const PeranSah = z.enum(["admin", "viewer"], "peran harus admin atau viewer");

// Tanya sandi tanpa menampilkannya: terminal dibuat "mentah" (raw) supaya setiap tombol sampai ke program tanpa
// ditampilkan, lalu program hanya menulis * untuk setiap karakter.
function tanyaTersembunyi(label: string): Promise<string> {
  const masuk = process.stdin;
  if (!masuk.isTTY) { // misalnya jendela Git Bash (mintty): ketikan tidak bisa disembunyikan, jadi jangan bertanya
    throw new Error("terminal ini tidak bisa menyembunyikan ketikan sandi; jalankan perintah ini di terminal VS Code "
      + "(PowerShell) atau Terminal macOS");
  }
  process.stdout.write(label);
  masuk.setRawMode(true);
  masuk.setEncoding("utf8");
  masuk.resume();
  return new Promise((selesai) => {
    let isi: string[] = [];
    const dengar = (data: string) => {
      if (data.startsWith("\u001b")) return; // tombol panah dan sejenisnya: abaikan
      for (const huruf of data) {
        if (huruf === "\r" || huruf === "\n") { // Enter
          masuk.off("data", dengar);
          masuk.setRawMode(false);
          masuk.pause();
          process.stdout.write("\n");
          return selesai(isi.join(""));
        }
        if (huruf === "\u0003") { // Ctrl + C
          process.stdout.write("\n");
          process.exit(130);
        }
        if (huruf === "\u007f" || huruf === "\b") { // Backspace (macOS/Linux mengirim \u007f, Windows \b)
          if (isi.length > 0) {
            isi = isi.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (huruf < " ") continue; // tombol kendali lain (Tab dan sebagainya)
        isi.push(huruf);
        process.stdout.write("*");
      }
    };
    masuk.on("data", dengar);
  });
}

async function mintaSandiBaru(): Promise<string> {
  for (let coba = 1; coba <= 3; coba++) {
    const sandi = await tanyaTersembunyi("Sandi baru: ");
    const periksa = Sandi.safeParse(sandi);
    if (!periksa.success) {
      console.log(periksa.error.issues[0].message);
      continue;
    }
    if (await tanyaTersembunyi("Ketik sekali lagi: ") !== sandi) {
      console.log("dua sandi itu tidak sama, ulangi");
      continue;
    }
    return sandi;
  }
  throw new Error("sandi belum dibuat setelah 3 kali percobaan");
}

function periksa<T>(skema: z.ZodType<T>, nilai: string | undefined): T {
  const hasil = skema.safeParse(nilai);
  if (!hasil.success) throw new Error(`${nilai ?? "(kosong)"}: ${hasil.error.issues[0].message}`);
  return hasil.data;
}

const CARA_PAKAI = `Cara pakai (dari folder backend):
  npm run pengguna -- tambah <email> "<nama>" <admin|viewer>
  npm run pengguna -- sandi <email>
  npm run pengguna -- peran <email> <admin|viewer>
  npm run pengguna -- hapus <email>
  npm run pengguna -- daftar`;

const [perintah, ...argumen] = process.argv.slice(2);
try {
  if (perintah === "tambah" && argumen.length === 3) {
    const email = periksa(Email, argumen[0]).toLowerCase(); // Budi@Rumah.test dan budi@rumah.test = akun yang sama
    const peran: Peran = periksa(PeranSah, argumen[2]);
    if (await cariUntukLogin(email) !== undefined) throw Object.assign(new Error("sudah terdaftar"), { code: "23505" });
    const sandi = await mintaSandiBaru(); // email diperiksa dulu, supaya ketikan sandi tidak terbuang percuma
    const akun = await tambahPengguna(email, argumen[1], peran, await buatSidikJari(sandi));
    console.log(`akun ${akun.id} dibuat: ${akun.email} (${akun.nama}, ${akun.peran})`);
  } else if (perintah === "sandi" && argumen.length === 1) {
    const email = periksa(Email, argumen[0]).toLowerCase();
    if (await cariUntukLogin(email) === undefined) throw new Error(`${email} tidak terdaftar`);
    const akun = await gantiSandi(email, await buatSidikJari(await mintaSandiBaru()));
    console.log(`sandi ${akun?.email} diganti; semua sesinya dicabut (harus login lagi)`);
  } else if (perintah === "peran" && argumen.length === 2) {
    const email = periksa(Email, argumen[0]).toLowerCase();
    const akun = await gantiPeran(email, periksa(PeranSah, argumen[1]));
    console.log(akun ? `${akun.email} sekarang ${akun.peran} (berlaku paling lambat 15 menit lagi, saat gelangnya diperbarui)`
      : `${email} tidak terdaftar`);
  } else if (perintah === "hapus" && argumen.length === 1) {
    const email = periksa(Email, argumen[0]).toLowerCase();
    console.log(await hapusPengguna(email) ? `${email} dihapus beserta semua sesinya` : `${email} tidak terdaftar`);
  } else if (perintah === "daftar") {
    console.table(await semuaPengguna()); // sidik jari sandi tidak ikut ditampilkan
  } else {
    console.log(CARA_PAKAI);
    process.exitCode = 1;
  }
} catch (galat) {
  const kode = (galat as { code?: string }).code;
  if (kode === "23505") console.error("email itu sudah terdaftar; untuk mengganti sandinya: npm run pengguna -- sandi <email>");
  else console.error(`gagal: ${(galat as Error).message}`);
  process.exitCode = 1;
}
await pool.end(); // tutup kolam supaya program selesai
```

- Sandi **tidak pernah** dikirim sebagai argumen perintah. Argumen tersimpan di riwayat terminal (tekan **↑** dan sandimu muncul lagi) dan bisa dilihat program lain di daftar proses.
- **`tanyaTersembunyi()`** menyembunyikan ketikan. `setRawMode(true)` membuat terminal **mentah** (*raw*): setiap tombol langsung sampai ke program **tanpa ditampilkan**, lalu program menulis `*` sendiri untuk setiap karakter. **Enter** mengakhiri, **Backspace** menghapus satu karakter, dan **Ctrl + C** membatalkan. Terminal yang tidak bisa dibuat mentah, misalnya jendela Git Bash, ditolak dengan pesan yang jelas supaya sandinya tidak terlihat di layar.
- **`mintaSandiBaru()`** meminta sandi **dua kali** dan memeriksanya dengan skema `Sandi`. Ada tiga kesempatan.
- Email diperiksa **lebih dulu** (bentuknya, lalu apakah sudah terdaftar) supaya kamu tidak mengetik sandi panjang dengan percuma. Email selalu diubah menjadi huruf kecil.
- **`console.table()`** menampilkan daftar akun sebagai tabel, tanpa sidik jari sandi.
- **`await pool.end()`** di baris terakhir menutup sambungan database supaya program selesai sendiri.

Sekarang daftarkan skripnya. Buka **`package.json`**, lalu tambahkan satu baris di bagian `"scripts"`, tepat di bawah baris `"isi-riwayat"` (dan di atas baris `"test"`):

```json
    "pengguna": "node --env-file=.env src/db/kelola-pengguna.ts",
```

Baris baru itu diakhiri koma, sama seperti baris-baris lain di atas `"test"`.

#### 1.7 Buat akun `admin` dan `viewer` (10 menit)

Buat akun `admin` pertamamu. Email dan namanya boleh kamu ganti; modul ini memakai domain **`.test`**, yang memang disediakan untuk contoh dan tidak dimiliki siapa pun. **Biasakan menulis kata `--`**: ia memberi tahu npm bahwa kata-kata sesudahnya milik skrip `pengguna`, bukan milik npm. Kata biasa sebenarnya tetap diteruskan tanpa `--`, tetapi pilihan yang diawali tanda minus, seperti `--reporter=tree` di Praktik 4.4, hanya sampai ke skrip kalau ada `--`.

```text
npm run pengguna -- tambah admin@rumah.test "Admin Rumah" admin
```

Ketik kalimat sandimu saat diminta (minimal 15 karakter, misalnya beberapa kata acak yang hanya kamu ketahui; jangan memakai contoh dari modul ini), tekan **Enter**, lalu ketik sekali lagi. Yang tampil hanya bintang.

**Hasilnya** (**contoh**; jumlah bintangnya mengikuti panjang sandimu):

```text
> rumah-pintar-mini-backend@0.4.0 pengguna
> node --env-file=.env src/db/kelola-pengguna.ts tambah admin@rumah.test Admin Rumah admin

Sandi baru: ****************************
Ketik sekali lagi: ****************************
akun 1 dibuat: admin@rumah.test (Admin Rumah, admin)
```

Ulangi untuk akun `viewer`, dengan sandi yang **berbeda**:

```text
npm run pengguna -- tambah viewer@rumah.test "Tamu Rumah" viewer
```

**Hasilnya** (**contoh**):

```text
Sandi baru: ****************************
Ketik sekali lagi: ****************************
akun 2 dibuat: viewer@rumah.test (Tamu Rumah, viewer)
```

Catat kedua sandi itu di pengelola sandi (*password manager*) atau di kertas yang kamu simpan sendiri, bukan di pesan *chat*, catatan HP, atau file di dalam folder repositori: keduanya dipakai lagi di Praktik 2. Kalau ada yang salah, skrip menjelaskannya. Misalnya, saat penulis mencoba membuat akun ketiga dengan `npm run pengguna -- tambah coba@rumah.test "Coba Gagal" viewer` (tidak perlu kamu tiru), sandi pertama terlalu pendek, sandi kedua terlalu panjang, dan pada percobaan ketiga, dua ketikannya tidak sama:

```text
Sandi baru: **************
sandi minimal 15 karakter; pakai kalimat sandi: beberapa kata yang hanya kamu yang tahu
Sandi baru: ********************************************************************************
sandi maksimal 72 byte (batas bcrypt; satu emoji = 4 byte)
Sandi baru: ***********************
Ketik sekali lagi: **********************
dua sandi itu tidak sama, ulangi
gagal: sandi belum dibuat setelah 3 kali percobaan
```

Email yang sudah terdaftar ditolak **sebelum** sandi ditanyakan, termasuk kalau hanya huruf besarnya yang berbeda (`Admin@Rumah.TEST` sama dengan `admin@rumah.test`):

```text
email itu sudah terdaftar; untuk mengganti sandinya: npm run pengguna -- sandi <email>
```

Peran selain `admin` dan `viewer` juga ditolak sebelum sandi ditanyakan, misalnya `gagal: tamu: peran harus admin atau viewer`. Kalau kamu lupa cara memakainya, jalankan `npm run pengguna` tanpa kata apa pun: skrip itu menampilkan kelima perintahnya.

Lihat daftar akunmu:

```text
npm run pengguna -- daftar
```

**Hasilnya:**

```text
┌─────────┬────┬─────────────────────┬───────────────┬──────────┬─────────────┬────────────┐
│ (index) │ id │ email               │ nama          │ peran    │ punya_sandi │ sesi_aktif │
├─────────┼────┼─────────────────────┼───────────────┼──────────┼─────────────┼────────────┤
│ 0       │ 1  │ 'admin@rumah.test'  │ 'Admin Rumah' │ 'admin'  │ true        │ 0          │
│ 1       │ 2  │ 'viewer@rumah.test' │ 'Tamu Rumah'  │ 'viewer' │ true        │ 0          │
└─────────┴────┴─────────────────────┴───────────────┴──────────┴─────────────┴────────────┘
```

Kolom `(index)` adalah nomor baris buatan `console.table()`, bukan nomor akun. `sesi_aktif` masih `0` karena belum ada yang *login*; angka itu bertambah di Praktik 2.

#### 1.8 Intip tabel `users` (3 menit)

Buka psql di dalam kontainer database, seperti Modul 17–19:

```text
docker exec -it rumahpintar-db psql -U postgres -d rumahpintar
```

Lalu jalankan:

```sql
SELECT id, email, nama, peran, left(sandi_hash, 7) AS awal, length(sandi_hash) AS panjang FROM users;
```

**Hasilnya:**

```text
 id |       email       |    nama     | peran  |  awal   | panjang
----+-------------------+-------------+--------+---------+---------
  1 | admin@rumah.test  | Admin Rumah | admin  | $2b$12$ |      60
  2 | viewer@rumah.test | Tamu Rumah  | viewer | $2b$12$ |      60
(2 rows)
```

Yang tersimpan hanya sidik jari 60 karakter berawalan `$2b$12$`, bukan sandimu. Keluar dari psql dengan `\q`.

#### 1.9 Tes sandi dengan Vitest (5 menit)

Klik kanan folder **`backend/src/auth`** → **New File…**, beri nama **`auth.test.ts`**, lalu ketik:

```ts
// auth.test.ts - unit test logika login (Modul 20): aturan sandi dan sidik jari bcrypt.
// Tanpa database dan tanpa server. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { Sandi, buatSidikJari, cocokkanSandi } from "./sandi.ts";

describe("aturan sandi (Sandi)", () => {
  it("14 karakter ditolak, 15 karakter diterima", () => {
    expect(Sandi.safeParse("a".repeat(14)).success).toBe(false);
    expect(Sandi.safeParse("a b c d e f g h").success).toBe(true); // tepat 15 karakter: spasi ikut dihitung
  });
  it("lebih dari 72 byte ditolak: bcrypt diam-diam memotongnya", () => {
    expect(Sandi.safeParse("a".repeat(72)).success).toBe(true);
    expect(Sandi.safeParse("a".repeat(73)).success).toBe(false);
    expect(Sandi.safeParse("😀".repeat(19)).success).toBe(false); // 19 emoji = 38 karakter JavaScript, tetapi 76 byte
  });
});

// bcrypt sengaja lambat (sekitar 0,3 detik per hitungan di laptop i5, bisa >1 detik di laptop sibuk atau lambat), jadi batas
// waktu tes ini dinaikkan dari bawaan Vitest 5 detik menjadi 30 detik.
const LAMBAT = 30_000;

describe("sidik jari sandi (bcrypt)", () => {
  it("sandi benar cocok, sandi salah tidak, dan sidik jari selalu berbeda (garam acak)", async () => {
    const satu = await buatSidikJari("sandi khusus untuk tes ini");
    const dua = await buatSidikJari("sandi khusus untuk tes ini");
    expect(satu).toMatch(/^\$2b\$12\$.{53}$/);
    expect(satu).not.toBe(dua);
    expect(await cocokkanSandi("sandi khusus untuk tes ini", satu)).toBe(true);
    expect(await cocokkanSandi("sandi khusus untuk tes itu", satu)).toBe(false);
  }, LAMBAT);
  it("akun tidak ada (sidik jari kosong): hasilnya false, bukan galat", async () => {
    expect(await cocokkanSandi("apa saja", undefined)).toBe(false);
    expect(await cocokkanSandi("apa saja", null)).toBe(false);
  }, LAMBAT);
});
```

- Dua tes pertama memeriksa aturan sandi: tepat 14 dan 15 karakter, 72 dan 73 *byte*, dan 19 emoji.
- Dua tes berikutnya memeriksa bcrypt: sandi benar cocok, sandi salah tidak, sidik jari selalu berbeda, dan akun yang tidak ada dijawab `false` tanpa galat.
- **`LAMBAT`** menaikkan batas waktu tes bcrypt dari bawaan Vitest, 5 detik, menjadi 30 detik. Algoritma bcrypt sengaja lambat, dan di laptop yang sedang sibuk, satu tes bisa butuh beberapa detik.

Jalankan semua tes:

```text
npm test
```

**Hasilnya** (**contoh**; lama milidetiknya berbeda):

```text
> rumah-pintar-mini-backend@0.4.0 test
> vitest run


 RUN  v5.0.5 C:/…/rumah-pintar-mini/backend

 ✓ src/aturan/mesin.test.ts (11 tests) 260ms
 ✓ src/auth/auth.test.ts (4 tests) 9897ms
   ✓ sidik jari sandi (bcrypt) (2)
     ✓ sandi benar cocok, sandi salah tidak, dan sidik jari selalu berbeda (garam acak) 6801ms
     ✓ akun tidak ada (sidik jari kosong): hasilnya false, bukan galat 3082ms

 Test Files  2 passed (2)
      Tests  15 passed (15)
   Start at  09:28:45
   Duration  18.77s (tests 41%, transform 35%, import 24%)
```

**`Tests  15 passed (15)`**: 11 tes otak aturan dari Modul 19 ditambah 4 tes baru. Vitest hanya merinci tes yang lambat, dan kedua tes bcrypt memang lambat: di laptop penulis yang sedang sibuk, satu tes butuh hampir 7 detik. Itulah gunanya batas waktu 30 detik.

#### 1.10 Simpan ke cabang (2 menit)

```text
git add package.json package-lock.json .env.example src/config/env.ts migrasi/008_login_dan_sesi.sql src/auth src/db/pengguna.ts src/db/kelola-pengguna.ts
git status
git commit -m "Akun dan sidik jari sandi: JWT_SECRET, env.ts dengan Zod, migrasi 008, npm run pengguna (Modul 20 Praktik 1)"
```

Perhatikan bahwa `.env` **tidak** ikut ditulis di `git add`. Baris `git status` di tengah blok menunjukkan apa yang akan di-*commit*, seperti kebiasaan sejak Modul 16: `.env` tidak boleh muncul di daftar `Changes to be committed` maupun `Untracked files`.

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 4–5](#4-jwt-gelang-masuk-konser) sebelum Praktik 2.

### Praktik 2 — *Login* dan gelang di *cookie* (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal di folder `backend`), **Bruno** dengan koleksi `backend/bruno` dan *environment* `lokal`, serta terminal kedua di folder `backend` untuk perintah lain selama backend berjalan (2.6). Kontainer `rumahpintar-db` tetap menyala.

Akun sudah ada. Sekarang backend butuh **loket *login***: `POST /auth/login` memeriksa email dan sandi, mencatat sesi baru di tabel `sesi`, lalu memasang dua *cookie* `HttpOnly`, yaitu gelang (`akses`) dan kartu terusan (`sesi`). Pintu-pintu lain **belum** dikunci; satpamnya baru datang di Praktik 3. Jadi, di akhir praktik ini semua rute lama masih bisa diketuk tanpa *login*, seperti Modul 19.

#### 2.1 Pasang `@fastify/cookie` dan `@fastify/jwt` (3 menit)

Di terminal folder `backend`:

```text
npm install @fastify/cookie@11.1.3 @fastify/jwt@10.2.5
```

**Hasilnya** (**contoh**):

```text
added 14 packages, and audited 224 packages in 10s

54 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Kalau `npm install` tampak diam cukup lama di akhir, biasanya ia sedang menjalankan pemeriksaan keamanan paket (audit) ke server npm. Tunggu sampai selesai.

- **`@fastify/cookie`** membuat Fastify bisa membaca kepala `Cookie` dan mengirim kepala `Set-Cookie`.
- **`@fastify/jwt`** membuat dan memeriksa gelang. Versinya ditulis **persis**: versi 10.2.5 memuat perbaikan keamanan (pada versi sebelumnya, gelang bisa terbit tanpa `exp`, yaitu tidak pernah kedaluwarsa, kalau fungsi tanda tangannya dipanggil dengan setelan tambahan), jadi jangan memakai yang lebih lama.
- Keduanya tidak membawa skrip pemasangan, jadi tidak ada yang perlu disetujui seperti bcrypt.

#### 2.2 Umur gelang dan kartu terusan: `src/auth/token.ts` (5 menit)

Klik kanan folder **`backend/src/auth`** → **New File…**, beri nama **`token.ts`**, lalu ketik:

```ts
// token.ts - umur "gelang" (JWT akses) dan refresh token (Modul 20). Refresh token = 32 byte acak, BUKAN JWT. Isinya
// tidak berarti apa-apa; yang memberinya arti adalah barisnya di tabel sesi. Database hanya menyimpan SHA-256-nya: token
// 256 bit acak tidak bisa ditebak, jadi hash cepat sudah cukup (bcrypt hanya perlu untuk sandi buatan manusia).
import { createHash, randomBytes } from "node:crypto";

export const UMUR_AKSES_DETIK = 15 * 60; // JWT akses ("gelang konser"): 15 menit
export const UMUR_SESI_DETIK = 7 * 24 * 60 * 60; // refresh token ("kartu terusan"): 7 hari sejak login, lalu login lagi

export function buatTokenSesi(): string {
  return randomBytes(32).toString("base64url"); // 43 karakter acak; aman ditaruh di cookie
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex"); // 64 karakter heksadesimal
}
```

- **`UMUR_AKSES_DETIK`** dan **`UMUR_SESI_DETIK`** adalah 15 menit dan 7 hari, ditulis dalam detik.
- **`buatTokenSesi()`** membuat kartu terusan: 32 *byte* acak, persis pemanasan langkah 2.
- **`hashToken()`** membuat sidik jari SHA-256 kartu itu, persis pemanasan langkah 1. Konsep 7 menjelaskan kenapa SHA-256 yang cepat sudah cukup untuk kartu acak, padahal tidak cukup untuk sandi.

#### 2.3 Pengaman: `src/auth/keamanan.ts` (8 menit)

Klik kanan folder **`backend/src/auth`** → **New File…**, beri nama **`keamanan.ts`**, lalu ketik:

```ts
// keamanan.ts - pengaman API (Modul 20): cookie dan JWT ("gelang konser"). Gelang ditandatangani dengan JWT_SECRET dan
// disimpan di cookie httpOnly, jadi JavaScript di halaman tidak bisa membacanya.
import type { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { env } from "../config/env.ts";
import type { Peran } from "../db/pengguna.ts";
import { UMUR_AKSES_DETIK, UMUR_SESI_DETIK } from "./token.ts";

// isi "gelang" (JWT akses): nomor akun (sub), perannya, dan nomor sesi (sid). Bukan rahasia: siapa pun yang memegang
// token bisa membaca isinya, jadi jangan menaruh email, nama, atau data pribadi lain di sini.
export interface IsiToken {
  sub: string;
  peran: Peran;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: IsiToken; // yang ditandatangani reply.jwtSign
    user: IsiToken & { iat: number; exp: number }; // yang dibaca req.jwtVerify ke req.user
  }
}

export const COOKIE_AKSES = "akses";
export const COOKIE_SESI = "sesi";

// httpOnly: JavaScript di halaman tidak bisa membaca cookie (pencuri lewat XSS tidak mendapat token).
// sameSite strict: browser tidak mengirim cookie pada permintaan yang dipicu situs lain (CSRF).
// secure auto: atribut Secure dipasang kalau permintaannya lewat HTTPS (Fase 5); di http://127.0.0.1 tidak.
const DASAR = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const OPSI_AKSES = { ...DASAR, path: "/", maxAge: UMUR_AKSES_DETIK }; // path "/" WAJIB: tanpa itu hanya /auth/...
export const OPSI_SESI = { ...DASAR, path: "/auth", maxAge: UMUR_SESI_DETIK }; // hanya dikirim ke /auth/...

export async function pasangKeamanan(app: FastifyInstance): Promise<void> {
  await app.register(cookie); // tanpa secret: JWT sudah bertanda tangan, refresh token dicek ke database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: COOKIE_AKSES, signed: false },
    sign: { expiresIn: UMUR_AKSES_DETIK }, // angka = detik (900); teks seperti "1h30m" ditolak sejak 10.2.3
    verify: { onlyCookie: true }, // gelang hanya dibaca dari cookie, bukan dari header Authorization
  });
}
```

- **`IsiToken`** menjelaskan isi gelang kepada TypeScript: `sub`, `peran`, dan `sid` (Konsep 4). Blok **`declare module "@fastify/jwt"`** memberi tahu TypeScript bahwa gelang yang dibuat dan dibaca library itu berbentuk `IsiToken` sehingga `req.user.peran` di Praktik 3 tidak dianggap salah ketik.
- **`DASAR`** berisi tiga atribut yang sama untuk kedua *cookie*: `httpOnly`, `sameSite: "strict"`, dan `secure: "auto"` (Konsep 5). `as const` membuat TypeScript mengingat nilainya persis, bukan sekadar "teks".
- **`OPSI_AKSES`** memakai `path: "/"`. Bagian ini **wajib ditulis**: tanpa `path`, *cookie* hanya berlaku di folder alamat tempat ia dibuat, yaitu `/auth`, sehingga gelang tidak pernah terbawa ke `/devices`. **`OPSI_SESI`** sengaja memakai `path: "/auth"` supaya kartu terusan hanya terbawa ke loket.
- **`app.register(cookie)`** dipanggil tanpa rahasia. *Cookie* bisa juga "ditandatangani" sendiri, tetapi di sini tidak perlu: gelang sudah bertanda tangan JWT, dan kartu terusan diperiksa ke database.
- **`app.register(jwt, …)`** memberi library JWT empat setelan: stempelnya (`JWT_SECRET`), nama *cookie* tempat gelang disimpan, umur gelang dalam **angka detik** (`900`), dan `onlyCookie: true`, artinya gelang hanya dibaca dari *cookie*, tidak dari kepala `Authorization`.

#### 2.4 Catat sesi baru: `buatSesi()` (3 menit)

Buka **`src/db/pengguna.ts`**, lalu tambahkan di paling bawah:

```ts
// ---- sesi (refresh token) ----

export async function buatSesi(penggunaId: number, tokenHash: string, umurDetik: number): Promise<number> {
  await pool.query("DELETE FROM sesi WHERE kedaluwarsa < now()"); // bersih-bersih: buang sesi yang sudah kedaluwarsa
  const hasil = await pool.query<{ id: string }>(
    `INSERT INTO sesi (pengguna_id, token_hash, kedaluwarsa) VALUES ($1, $2, now() + make_interval(secs => $3))
     RETURNING id`, [penggunaId, tokenHash, umurDetik]);
  return Number(hasil.rows[0].id); // bigint datang dari pg sebagai teks
}
```

- Sebelum mencatat sesi baru, fungsi ini **membuang sesi yang sudah kedaluwarsa**, jadi tabel `sesi` tidak terus menggemuk.
- **`make_interval(secs => $3)`** mengubah 604.800 detik menjadi selang waktu PostgreSQL sehingga `kedaluwarsa` tepat 7 hari setelah *login*.
- Kolom `id` bertipe `bigint`, dan library `pg` mengirimnya sebagai teks supaya angka yang sangat besar tidak terpotong. `Number()` mengubahnya lagi menjadi angka biasa.

#### 2.5 Loket *login*: `src/routes/auth.ts` (8 menit)

Klik kanan folder **`backend/src/routes`** → **New File…**, beri nama **`auth.ts`**, lalu ketik:

```ts
// auth.ts - rute /auth (Modul 20): login. JWT akses (15 menit) dan refresh token (7 hari) dikirim sebagai cookie httpOnly,
// tidak pernah di isi jawaban, jadi JavaScript di halaman tidak bisa membacanya.
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { COOKIE_AKSES, COOKIE_SESI, OPSI_AKSES, OPSI_SESI } from "../auth/keamanan.ts";
import { cocokkanSandi } from "../auth/sandi.ts";
import { buatTokenSesi, hashToken, UMUR_SESI_DETIK } from "../auth/token.ts";
import { buatSesi, cariUntukLogin } from "../db/pengguna.ts";
import type { Pengguna } from "../db/pengguna.ts";

const Galat = z.object({ pesan: z.string() });
const Profil = z.object({
  id: z.number(), email: z.string(), nama: z.string(), peran: z.enum(["admin", "viewer"]),
}).describe("akun yang sedang login");
const Masuk = z.object({
  email: z.email("email tidak sah").max(254).describe("email akun, misalnya budi@rumah.test"),
  sandi: z.string().min(1).max(200).describe("kata sandi akun"),
});

const profil = (p: Pengguna) => ({ id: p.id, email: p.email, nama: p.nama, peran: p.peran });

// tanda tangani JWT akses baru, lalu taruh di cookie "akses"
async function pasangAkses(reply: FastifyReply, p: Pengguna, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(p.id), peran: p.peran, sid });
  reply.setCookie(COOKIE_AKSES, token, OPSI_AKSES);
}

export const ruteAuth: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    schema: {
      tags: ["akun"],
      summary: "Login dengan email dan sandi; hasilnya dua cookie httpOnly (akses 15 menit, sesi 7 hari)",
      body: Masuk,
      response: {
        200: Profil,
        401: Galat.describe("email atau sandi salah (sengaja tidak dibedakan)"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const akun = await cariUntukLogin(email);
      const cocok = await cocokkanSandi(req.body.sandi, akun?.sandi_hash); // akun tidak ada: tetap dihitung, hasil false
      if (akun === undefined || !cocok) {
        req.log.warn(`login gagal: ${akun === undefined ? "email tidak terdaftar" : `akun ${akun.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ pesan: "email atau sandi salah" });
      }
      const tokenSesi = buatTokenSesi();
      const sid = await buatSesi(akun.id, hashToken(tokenSesi), UMUR_SESI_DETIK);
      await pasangAkses(reply, akun, sid);
      reply.setCookie(COOKIE_SESI, tokenSesi, OPSI_SESI);
      req.log.info(`login: akun ${akun.id} (${akun.peran}), sesi ${sid}, IP ${req.ip}`);
      return profil(akun);
    } catch (galat) {
      req.log.error(`login gagal diproses: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });
};
```

- **`Masuk`** memeriksa isi permintaan: email yang sah dan sandi yang tidak kosong. Aturan 15 karakter sengaja **tidak** dipakai di sini. Loket hanya mencocokkan; aturan sandi diperiksa saat sandi dibuat.
- Email diubah menjadi huruf kecil, lalu **`cocokkanSandi()` selalu dijalankan**, juga untuk email yang tidak terdaftar (`akun?.sandi_hash` bernilai `undefined`). Dengan begitu, jawabannya sama lamanya (Konsep 3).
- Email salah dan sandi salah dijawab **persis sama**: `401` dengan `{"pesan":"email atau sandi salah"}`. Alasan sebenarnya hanya ditulis di **log backend**, yang tidak pernah dilihat tamu.
- Kalau cocok: kartu terusan dibuat, sidik jarinya dicatat lewat `buatSesi()`, gelang ditandatangani lewat **`reply.jwtSign()`** lalu dipasang dengan `reply.setCookie()`, dan kartu terusan dipasang di *cookie* kedua.
- Jawabannya hanya profil akun (`id`, `email`, `nama`, `peran`). **Token tidak pernah ditulis di isi jawaban**; ia hanya ada di kepala `Set-Cookie`, jadi JavaScript halaman tidak pernah memegangnya.
- Kalau database sedang mati, jawabannya `503` dengan pesan yang jelas, bukan galat 500 yang membingungkan.

#### 2.6 Sambungkan ke `server.ts` (3 menit)

Buka **`src/server.ts`**, lalu buat empat perubahan kecil.

1. Di bawah baris `import { env } from "./config/env.ts";`, tambahkan:

   ```ts
   import { pasangKeamanan } from "./auth/keamanan.ts";
   import { ruteAuth } from "./routes/auth.ts";
   ```

2. Di dalam *hook* `onResponse`, ganti baris komentarnya dengan dua baris berikut. Kodenya tidak berubah; komentarnya mengingatkan apa yang **tidak** boleh masuk log:

   ```ts
     // ...jadi diganti satu baris per permintaan (hook = "middleware" Fastify). Hanya metode, alamat, dan kode jawaban:
     // isi permintaan (sandi!) dan cookie (token!) tidak pernah ditulis ke log.
   ```

3. Tepat **sebelum** baris `await app.register(swagger, {`, tambahkan:

   ```ts
   await pasangKeamanan(app); // Modul 20: cookie dan JWT (SEBELUM rute)
   ```

   Pengaman dipasang sebelum Swagger dan semua rute karena setiap rute membutuhkan *cookie* dan JWT yang sudah siap.
4. Tepat **sebelum** baris `await app.register(ruteKesehatan);`, tambahkan:

   ```ts
   await app.register(ruteAuth); // Modul 20
   ```

Simpan semuanya, lalu periksa:

```text
npm run cek
```

**Hasilnya:** hanya dua baris judul (`> rumah-pintar-mini-backend@0.4.0 cek` dan `> tsc --noEmit`), tanpa pesan galat. Lalu jalankan backend dengan `npm run dev`. Log awalnya sama seperti di Praktik 1.2. Mulai sekarang, biarkan backend berjalan di terminal ini (**terminal pertama**). Terminal yang sedang menjalankan program tidak bisa menerima perintah lain, jadi buka **terminal kedua** (**Terminal → New Terminal**), lalu masuk ke folder `backend` dengan `cd backend`. Di Praktik 2–8, `npm run cek`, `npm install`, `npm test`, `npm run pengguna`, curl, dan `git` dijalankan di terminal kedua ini, kecuali disebut lain.

#### 2.7 Coba *login* lewat Bruno (10 menit)

Sandi tidak boleh ditulis di file permintaan Bruno karena file `.yml` itu ikut Git. Bruno bisa membaca sandi dari file **`.env`** di folder koleksinya.

1. Di Explorer VS Code, klik dulu ruang kosong, lalu klik kanan folder **`backend/bruno`** → **New File…**, beri nama **`.env`**, lalu isi dengan sandi kedua akunmu:

   ```text
   SANDI_ADMIN=sandi-akun-admin-milikmu
   SANDI_VIEWER=sandi-akun-viewer-milikmu
   ```

   Ganti kedua nilai itu dengan sandi yang kamu buat di Praktik 1.7, lalu simpan. Kalau sandimu mengandung tanda `#`, apit nilainya dengan petik ganda (`SANDI_ADMIN="…"`) karena tanpa petik, `#` dianggap awal komentar. File ini **tidak ikut Git**: `backend/bruno/.gitignore`, yang dibuat Bruno di Modul 16, sudah memuat baris `.env*`. Bruno langsung membaca file ini, jadi tidak perlu ditutup dulu.
2. Di Bruno, buka koleksi `backend/bruno` dan pilih *environment* **`lokal`**. Klik permintaan **`nyalakan lampu`** di bilah samping supaya tab-nya terbuka, lalu klik kanan **tab** itu (di deretan tab atas) dan pilih **Clone Request**, seperti Modul 16–19. Di dialog **Clone Request**, isi **Request Name** dengan **`login admin`**, lalu klik **Clone**. Permintaan barunya langsung terbuka di tab sendiri. (Menu **Clone** di bilah samping langsung membuat salinan bernama `nyalakan lampu copy` tanpa dialog; kalau telanjur, klik kanan salinan itu → **Rename**.)
3. Ubah URL-nya menjadi `{{baseUrl}}/auth/login`, lalu ganti isi tab **Body** dengan:

   ```json
   {
     "email": "admin@rumah.test",
     "sandi": "{{process.env.SANDI_ADMIN}}"
   }
   ```

   `{{process.env.SANDI_ADMIN}}` diganti Bruno dengan isi `SANDI_ADMIN` dari `bruno/.env` saat permintaan dikirim. Yang tersimpan di file `login admin.yml` tetap tulisan `{{process.env.SANDI_ADMIN}}`, bukan sandimu.
4. Di tab **Assert**, baris `res.status` `eq` `200` ikut tersalin dari `nyalakan lampu`. Tambahkan baris kedua: ketik `res.body.peran` di kolom **Expr**, biarkan **Operator** `equals` (`eq`), lalu ketik `admin` di kolom **Value**.
5. Simpan (**Ctrl + S**), lalu klik **Send**.

**Hasilnya:** panel jawaban menulis `200 OK`, dan isinya profil akunmu:

```json
{"id":1,"email":"admin@rumah.test","nama":"Admin Rumah","peran":"admin"}
```

Tab **Tests** menulis `Assertions (2), Passed: 2, Failed: 0`. Kalau laptopmu sedang sibuk, jawaban *login* bisa butuh satu sampai dua detik: bcrypt memang sengaja lambat (Konsep 3).

Sekarang buka tab **Headers** di panel jawaban. Ada dua baris `set-cookie` (**contoh**; isinya dipotong):

```text
set-cookie: akses=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicGVyYW4iOiJhZG1pbiIsInNpZCI6MSwiaWF0IjoxNzkyNjM4NjExLCJleHAiOjE3OTI2Mzk1MTF9.CaO6abpZ…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
set-cookie: sesi=LiQc7smW…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict
```

Inilah gelang dan kartu terusan dari Konsep 5, lengkap dengan atributnya. Tidak ada token di isi jawaban; keduanya hanya ada di kepala `set-cookie`. Bruno menyimpan kedua *cookie* itu secara otomatis, sama seperti browser, dan melampirkannya ke setiap permintaan berikutnya ke `127.0.0.1`. Untuk melihatnya, klik tombol **Cookies** (ikon kue) di bilah bawah jendela Bruno. Jendela yang terbuka memuat tabel dengan kolom **Name**, **Value**, **Path**, **Expires**, **Secure**, **HTTP Only**, dan **Actions**: ada `akses` dengan `Path` `/` dan `sesi` dengan `Path` `/auth`, keduanya bertanda **HTTP Only**. Kolom **Value** dan tab **Headers** memuat isi *cookie*-mu yang masih berlaku, dan tab **Timeline** bisa menampilkan isi permintaan yang sudah diisi sandi: jangan memotret jendela-jendela itu saat bertanya di grup.

Buat juga permintaan untuk akun `viewer`. Klik kanan tab **`login admin`** → **Clone Request**, isi **Request Name** dengan **`login viewer`**, klik **Clone**, lalu ubah dua hal: di tab **Body**, email menjadi `viewer@rumah.test` dan sandi menjadi `{{process.env.SANDI_VIEWER}}`; di tab **Assert**, nilai `admin` menjadi `viewer`. Simpan, lalu klik **Send**. Hasilnya `200 OK` dengan `"peran":"viewer"`. Karena *cookie*-nya bernama sama, gelang `viewer` kini **menggantikan** gelang `admin` di Bruno. Mulai sekarang, permintaan Bruno berikutnya berjalan sebagai akun yang **terakhir** *login*.

#### 2.8 Baca isi gelangmu (5 menit)

Isi gelang bisa dibaca tanpa kunci (Konsep 4). Buktikan dengan gelangmu sendiri. Di tab **Headers** jawaban `login admin`, salin teks gelang dari baris `set-cookie: akses=…`: mulai dari `eyJ` sampai **sebelum** titik koma pertama. Lalu, di terminal kedua, ketik perintah ini dan tempel gelangmu di akhirnya, menggantikan `GELANG-MU`:

```text
node -e "const [kepala, isi] = process.argv[1].split('.'); console.log(Buffer.from(kepala, 'base64url').toString()); console.log(Buffer.from(isi, 'base64url').toString())" GELANG-MU
```

**Hasilnya** (**contoh**):

```text
{"alg":"HS256","typ":"JWT"}
{"sub":"1","peran":"admin","sid":1,"iat":1792638611,"exp":1792639511}
```

- Baris pertama adalah kepala gelang: resep tanda tangannya HS256.
- Baris kedua adalah isinya: akun nomor `1`, peran `admin`, sesi nomor `1`. Selisih `exp` dan `iat` tepat 900 detik, yaitu 15 menit.
- Perintah ini sama dengan pemanasan langkah 3, hanya ditulis dalam satu baris. `process.argv[1]` adalah teks yang kamu tempel di akhir perintah.
- Tidak ada email, nama, atau sandi di dalamnya. Namun, tetap jangan pernah menempel gelang **yang masih berlaku** di forum atau grup: siapa pun yang memegangnya bisa masuk sebagai kamu sampai kedaluwarsa.

#### 2.9 Sandi salah dan email yang tidak terdaftar (5 menit)

Sekarang lihat apa yang terjadi kalau sandinya salah. Klik kanan tab **`login admin`** → **Clone Request**, isi **Request Name** dengan **`login salah`**, klik **Clone**, lalu ubah dua hal:

- Di tab **Body**, ganti `"{{process.env.SANDI_ADMIN}}"` dengan sandi yang jelas salah, misalnya `"bukan sandi yang benar"`. Sandi salah ini boleh ditulis langsung karena memang bukan rahasia.
- Di tab **Assert**, ubah nilai baris pertama menjadi `401`, lalu ubah baris kedua menjadi `res.body.pesan` `eq` `email atau sandi salah`.

Simpan, lalu klik **Send**.

**Hasilnya:** `401 Unauthorized` dengan isi:

```json
{"pesan":"email atau sandi salah"}
```

Ganti email di tab **Body** dengan email yang tidak terdaftar, misalnya `tidak.ada@rumah.test`, lalu klik **Send** lagi. Jawabannya **persis sama**: penyerang tidak bisa membedakan "email tidak ada" dari "sandi salah". Setelah itu, kembalikan emailnya menjadi `admin@rumah.test`, lalu simpan (**Ctrl + S**). Permintaan `login salah` dipakai lagi di Praktik 5.

Hanya log backend yang tahu bedanya. Di terminal backend (**contoh**; penulis mengirim sandi salah, email tidak terdaftar, dan sandi benar bergantian lewat curl; ini dua putaran pertamanya):

```text
[10:12:58] WARN: login gagal: akun 1 (IP 127.0.0.1)
[10:12:58] INFO: POST /auth/login -> 401 (650 ms)
[10:12:59] WARN: login gagal: email tidak terdaftar (IP 127.0.0.1)
[10:12:59] INFO: POST /auth/login -> 401 (946 ms)
[10:13:01] INFO: login: akun 1 (admin), sesi 2, IP 127.0.0.1
[10:13:01] INFO: POST /auth/login -> 200 (1115 ms)
[10:13:02] WARN: login gagal: akun 1 (IP 127.0.0.1)
[10:13:02] INFO: POST /auth/login -> 401 (518 ms)
[10:13:03] WARN: login gagal: email tidak terdaftar (IP 127.0.0.1)
[10:13:03] INFO: POST /auth/login -> 401 (937 ms)
[10:13:04] INFO: login: akun 1 (admin), sesi 3, IP 127.0.0.1
[10:13:04] INFO: POST /auth/login -> 200 (529 ms)
```

- Ketiga jenis jawaban sama-sama butuh ratusan milidetik karena bcrypt selalu dijalankan. Angkanya naik-turun mengikuti kesibukan laptop, tetapi tidak ada yang jauh lebih cepat. Tanpa sidik jari palsu dari Praktik 1.4, jawaban untuk email yang tidak terdaftar datang hanya dalam beberapa milidetik.
- Setiap *login* yang berhasil membuat sesi baru (`sesi 2`, `sesi 3`). Log mencatat **nomor** akun dan alamat IP, tetapi tidak pernah mencatat email yang dicoba, sandi, atau isi *cookie* (Konsep 11).
- Jalankan `npm run pengguna -- daftar` di terminal kedua (folder `backend`): kolom `sesi_aktif` kini menghitung *login*-mu yang masih berlaku.

#### 2.10 (Pilihan) *Login* dari terminal: curl dan PowerShell

Bruno sudah cukup untuk modul ini. Bagian ini untuk kamu yang ingin melihat *cookie* dari terminal. Karena isinya sandi dan *cookie*, kedua berkas uji di bawah ini **rahasia**. Supaya tidak mungkin ikut Git, tambahkan dulu tiga baris ini (satu komentar dan dua pola) di paling bawah **`backend/.gitignore`**:

```text
# berkas uji curl Modul 20: berisi sandi dan cookie
login*.json
kue*.txt
```

Tanda `*` berarti "apa saja", jadi `login.json`, `login-salah.json`, dan berkas serupa yang kamu buat nanti ikut diabaikan.

Lalu buat file **`login.json`** di folder `backend`, berisi email dan sandi akun `admin`-mu. Semua perintah curl dan PowerShell di bagian ini dijalankan di terminal kedua, **di folder `backend`**: di folder lain, curl tidak menemukan `login.json`, dan `kue.txt` tercipta di luar jangkauan `backend/.gitignore`.

```json
{ "email": "admin@rumah.test", "sandi": "sandi-akun-admin-milikmu" }
```

**curl** (**Windows:** ketik `curl.exe`; **macOS:** cukup `curl`). `-i` menampilkan kepala jawaban, `-c kue.txt` menyimpan *cookie* ke berkas `kue.txt`, dan `--data-binary "@login.json"` mengirim isi berkas itu apa adanya. Membaca JSON dari berkas adalah satu-satunya cara yang hasilnya sama di Windows PowerShell 5.1 dan PowerShell 7; tanda petik di dalam perintah diperlakukan berbeda oleh keduanya.

```text
curl.exe -i -c kue.txt -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login
```

**Hasilnya** (**contoh**; isi *cookie* dipotong):

```text
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
set-cookie: akses=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicGVyYW4iOiJhZG1pbiIsInNpZCI6NywiaWF0Ijox…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
set-cookie: sesi=KjnqnFQF…; Max-Age=604800; Path=/auth; HttpOnly; SameSite=Strict
content-length: 72
Date: Thu, 22 Oct 2026 03:16:08 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"id":1,"email":"admin@rumah.test","nama":"Admin Rumah","peran":"admin"}
```

Buka `kue.txt` di VS Code untuk melihat isinya, tetapi jangan dibagikan: di dalamnya ada *cookie*-mu yang masih berlaku. Formatnya "Netscape", yang dibaca curl berikutnya dengan `-b kue.txt` (Praktik 4.6 dan 6.6). Awalan `#HttpOnly_` menandai *cookie* `HttpOnly`, dan kolom ketiga adalah `Path`-nya: `/auth` untuk `sesi`, `/` untuk `akses`.

**PowerShell** (khusus Windows; pengguna macOS cukup memakai curl di atas) punya "keranjang *cookie*" sendiri. `-SessionVariable sesi` menyimpan semua *cookie* jawaban ke variabel `$sesi`, yang nanti dipakai lagi dengan `-WebSession $sesi`:

```text
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8080/auth/login -ContentType "application/json" -InFile login.json -SessionVariable sesi
$sesi.Cookies.GetCookies("http://127.0.0.1:8080/auth") | Format-Table Name, Path, HttpOnly, Expires
```

**Hasilnya** (**contoh**; Windows PowerShell 5.1):

```text
id email            nama        peran
-- -----            ----        -----
 1 admin@rumah.test Admin Rumah admin


Name  Path  HttpOnly Expires
----  ----  -------- -------
sesi  /auth     True 10/29/2026 10:24:17 AM
akses /         True 10/22/2026 10:39:17 AM
```

`akses` kedaluwarsa 15 menit lagi, sedangkan `sesi` 7 hari lagi. PowerShell 7 menulis tanggal yang sama dalam format dan zona waktu yang berbeda. Setiap *login* membuat sesi baru, jadi jangan heran kalau `npm run pengguna -- daftar` kini menunjukkan beberapa sesi aktif.

#### 2.11 Simpan ke cabang (2 menit)

```text
git add package.json package-lock.json .gitignore src/auth src/routes/auth.ts src/db/pengguna.ts src/server.ts "bruno/login admin.yml" "bruno/login viewer.yml" "bruno/login salah.yml"
git commit -m "Login: POST /auth/login, JWT di cookie httpOnly, kartu terusan di tabel sesi (Modul 20 Praktik 2)"
```

`bruno/.env` tidak ditulis di `git add`. Kalaupun kamu menulis `git add bruno`, file itu tetap tidak ikut karena `bruno/.gitignore` mengabaikannya. Kalau kamu melewati 2.10, `git add` tetap menerima `.gitignore` yang tidak berubah tanpa masalah.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 6](#6-satpam-di-setiap-pintu-peran-admin-dan-viewer) sebelum Praktik 3.

### Praktik 3 — Satpam di setiap pintu: 401 dan 403 (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, terminal kedua di folder `backend` untuk perintah lain), **Bruno**, dan **browser** untuk `/docs`. **Jalur perangkat:** Node 1 menyala. **Jalur laptop:** simulator Modul 19 menyala untuk satu perangkat supaya perintah dari akun `admin` dijawab `ack`. Jalankan `node simulator-perangkat.js mqtt://127.0.0.1:1883 1` di terminal tersendiri, di folder `alat`, dan jangan mengetik perintah lain di terminal itu karena simulator membaca setiap baris sebagai perintah suhu.
>
> ⭐ **Wajib** — dua syarat lulus pertama: tanpa *login* semua *endpoint* menjawab **401**, dan akun `viewer` gagal menyalakan relay (**403**).

Loket *login* sudah buka, tetapi pintu-pintu lain masih terbuka lebar. Praktik ini memasang **satpam** dari Konsep 6: satu *hook* `onRequest` yang memeriksa setiap permintaan sebelum sampai ke rute mana pun.

#### 3.1 Pasang satpam (15 menit)

Buka **`src/auth/keamanan.ts`**, lalu ganti seluruh isinya dengan:

```ts
// keamanan.ts - pengaman API (Modul 20): cookie, JWT ("gelang konser"), dan "satpam" yang memeriksa SETIAP permintaan
// HTTP: wajib login (kecuali daftar rute terbuka), dan akun viewer hanya boleh melihat.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { env } from "../config/env.ts";
import type { Peran } from "../db/pengguna.ts";
import { UMUR_AKSES_DETIK, UMUR_SESI_DETIK } from "./token.ts";

// isi "gelang" (JWT akses): nomor akun (sub), perannya, dan nomor sesi (sid). Bukan rahasia: siapa pun yang memegang
// token bisa membaca isinya, jadi jangan menaruh email, nama, atau data pribadi lain di sini.
export interface IsiToken {
  sub: string;
  peran: Peran;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: IsiToken; // yang ditandatangani reply.jwtSign
    user: IsiToken & { iat: number; exp: number }; // yang dibaca req.jwtVerify ke req.user
  }
}

export const COOKIE_AKSES = "akses";
export const COOKIE_SESI = "sesi";

// httpOnly: JavaScript di halaman tidak bisa membaca cookie (pencuri lewat XSS tidak mendapat token).
// sameSite strict: browser tidak mengirim cookie pada permintaan yang dipicu situs lain (CSRF).
// secure auto: atribut Secure dipasang kalau permintaannya lewat HTTPS (Fase 5); di http://127.0.0.1 tidak.
const DASAR = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const OPSI_AKSES = { ...DASAR, path: "/", maxAge: UMUR_AKSES_DETIK }; // path "/" WAJIB: tanpa itu hanya /auth/...
export const OPSI_SESI = { ...DASAR, path: "/auth", maxAge: UMUR_SESI_DETIK }; // hanya dikirim ke /auth/...

// Rute yang boleh diketuk TANPA login. Semua rute lain wajib login, termasuk rute baru yang kelak ditambahkan.
export const RUTE_TERBUKA = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: pemeriksa kesehatan seperti wget --spider (Docker, Fase 5)
]);
const MEMBACA = new Set(["GET", "HEAD"]); // satu-satunya metode yang boleh dipakai akun viewer

export async function pasangKeamanan(app: FastifyInstance): Promise<void> {
  await app.register(cookie); // tanpa secret: JWT sudah bertanda tangan, refresh token dicek ke database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: COOKIE_AKSES, signed: false },
    sign: { expiresIn: UMUR_AKSES_DETIK }, // angka = detik (900); teks seperti "1h30m" ditolak sejak 10.2.3
    verify: { onlyCookie: true }, // gelang hanya dibaca dari cookie, bukan dari header Authorization
  });
  app.addHook("onRequest", satpam); // satu satpam di pintu depan: berlaku untuk SEMUA rute
}

async function satpam(req: FastifyRequest, reply: FastifyReply) {
  const url = req.routeOptions.url; // pola rute, misalnya /devices/:id/command (undefined = tidak ada: tamu 401, sudah login 404)
  if (RUTE_TERBUKA.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // ada cookie akses? tanda tangannya asli? belum kedaluwarsa? isinya masuk req.user
  } catch {
    return reply.code(401).send({ pesan: "belum login atau sesi sudah habis: login lewat POST /auth/login" });
  }
  if (req.user.peran !== "admin" && !MEMBACA.has(req.method)) { // diperiksa SEBELUM isi permintaan divalidasi
    req.log.warn(`ditolak (403): akun ${req.user.sub} (${req.user.peran}) mencoba ${req.method} ${req.url}`);
    return reply.code(403).send({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
  }
}
```

Yang baru dibandingkan Praktik 2:

- **`RUTE_TERBUKA`** adalah daftar pintu terbuka dari Konsep 6, disimpan sebagai `Set` seperti pemanasan langkah 5. Setiap anggotanya ditulis dengan bentuk `METODE /pola`. `POST /auth/refresh` dan `POST /auth/logout` sudah ikut didaftarkan walaupun rutenya baru dibuat di Praktik 4.
- **`MEMBACA`** berisi dua metode yang boleh dipakai akun `viewer`: `GET` dan `HEAD`.
- **`app.addHook("onRequest", satpam)`** memasang satpam untuk **semua** rute. Karena `pasangKeamanan()` dipanggil sebelum rute mana pun didaftarkan, tidak ada rute yang terlewat.
- **`req.routeOptions.url`** adalah **pola** rute, misalnya `/devices/:id/command`, bukan alamat lengkapnya. Dengan pola itu, satu baris di daftar pintu terbuka berlaku untuk semua `device_id`. Untuk alamat yang tidak ada, nilainya `undefined`, jadi satpam tetap meminta gelang dan menjawab 401 (Konsep 2).
- **`url === "/docs" || url?.startsWith("/docs/")`** membuka semua halaman dokumentasi: halaman HTML-nya, berkas JavaScript dan CSS-nya, serta `/docs/json`. Garis miring di `"/docs/"` sengaja ditulis supaya rute lain yang kebetulan diawali `/docs`, misalnya `/docsrahasia`, tetap terkunci.
- **`req.jwtVerify()`** membaca *cookie* `akses`, memeriksa tanda tangan dan `exp`-nya, lalu menaruh isi gelang di **`req.user`**. Apa pun masalahnya (tidak ada *cookie*, tanda tangan palsu, gelang basi), jawabannya satu pesan 401 yang sama.
- **Pemeriksaan peran** terjadi **sebelum** isi permintaan diperiksa Zod. Akun `viewer` yang mengirim `POST` dengan isi berantakan pun mendapat 403, bukan 400, jadi ia tidak bisa memakai pesan galat Zod untuk mempelajari bentuk isi yang benar. Penolakan dicatat di log sebagai `WARN`.

#### 3.2 `GET /auth/me`: siapa yang sedang *login*? (5 menit)

Sekarang ada `req.user`, jadi loket bisa menjawab pertanyaan "aku sedang *login* sebagai siapa?". Buka **`src/db/pengguna.ts`**, lalu tambahkan fungsi ini tepat di bawah fungsi `cariUntukLogin()`:

```ts
export async function ambilPengguna(id: number): Promise<Pengguna | undefined> {
  const hasil = await pool.query<Pengguna>(`SELECT ${KOLOM} FROM users WHERE id = $1`, [id]);
  return hasil.rows[0];
}
```

Lalu buka **`src/routes/auth.ts`** dan ganti seluruh isinya dengan:

```ts
// auth.ts - rute /auth (Modul 20): login dan "siapa saya". JWT akses (15 menit) dan refresh token (7 hari) dikirim sebagai
// cookie httpOnly, tidak pernah di isi jawaban, jadi JavaScript di halaman tidak bisa membacanya.
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { COOKIE_AKSES, COOKIE_SESI, OPSI_AKSES, OPSI_SESI } from "../auth/keamanan.ts";
import { cocokkanSandi } from "../auth/sandi.ts";
import { buatTokenSesi, hashToken, UMUR_SESI_DETIK } from "../auth/token.ts";
import { ambilPengguna, buatSesi, cariUntukLogin } from "../db/pengguna.ts";
import type { Pengguna } from "../db/pengguna.ts";

const Galat = z.object({ pesan: z.string() });
const Profil = z.object({
  id: z.number(), email: z.string(), nama: z.string(), peran: z.enum(["admin", "viewer"]),
}).describe("akun yang sedang login");
const Masuk = z.object({
  email: z.email("email tidak sah").max(254).describe("email akun, misalnya budi@rumah.test"),
  sandi: z.string().min(1).max(200).describe("kata sandi akun"),
});

const profil = (p: Pengguna) => ({ id: p.id, email: p.email, nama: p.nama, peran: p.peran });

// tanda tangani JWT akses baru, lalu taruh di cookie "akses"
async function pasangAkses(reply: FastifyReply, p: Pengguna, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(p.id), peran: p.peran, sid });
  reply.setCookie(COOKIE_AKSES, token, OPSI_AKSES);
}

const TERBUKA = { security: [] }; // Swagger: rute ini tidak butuh cookie (tanpa gembok)

export const ruteAuth: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Login dengan email dan sandi; hasilnya dua cookie httpOnly (akses 15 menit, sesi 7 hari)",
      body: Masuk,
      response: {
        200: Profil,
        401: Galat.describe("email atau sandi salah (sengaja tidak dibedakan)"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const akun = await cariUntukLogin(email);
      const cocok = await cocokkanSandi(req.body.sandi, akun?.sandi_hash); // akun tidak ada: tetap dihitung, hasil false
      if (akun === undefined || !cocok) {
        req.log.warn(`login gagal: ${akun === undefined ? "email tidak terdaftar" : `akun ${akun.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ pesan: "email atau sandi salah" });
      }
      const tokenSesi = buatTokenSesi();
      const sid = await buatSesi(akun.id, hashToken(tokenSesi), UMUR_SESI_DETIK);
      await pasangAkses(reply, akun, sid);
      reply.setCookie(COOKIE_SESI, tokenSesi, OPSI_SESI);
      req.log.info(`login: akun ${akun.id} (${akun.peran}), sesi ${sid}, IP ${req.ip}`);
      return profil(akun);
    } catch (galat) {
      req.log.error(`login gagal diproses: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.get("/auth/me", {
    schema: {
      tags: ["akun"],
      summary: "Siapa yang sedang login (dibaca dari database, bukan dari isi JWT)",
      response: { 200: Profil, 401: Galat.describe("belum login, atau akunnya sudah dihapus") },
    },
  }, async (req, reply) => {
    const akun = await ambilPengguna(Number(req.user.sub)); // req.user diisi satpam dari gelang yang sah
    if (akun === undefined) return reply.code(401).send({ pesan: "akun ini sudah tidak ada" });
    return profil(akun);
  });
};
```

- **`GET /auth/me`** tidak termasuk pintu terbuka, jadi satpam sudah memeriksa gelangnya sebelum rute ini berjalan. Nomor akunnya diambil dari `req.user.sub`.
- Profilnya dibaca dari **database**, bukan dari isi gelang. Kalau akunnya sudah dihapus, jawabannya 401 walaupun gelangnya masih sah.
- **`TERBUKA`** (`security: []`) menandai `POST /auth/login` sebagai rute tanpa gembok di `/docs` (3.3).

#### 3.3 Gembok di `/docs` (5 menit)

Swagger UI bisa menandai rute mana yang butuh *login* dengan ikon gembok. Buka **`src/server.ts`**, lalu ganti blok `openapi: { … }` di dalam `app.register(swagger, { … })` dengan:

```ts
  openapi: {
    info: { title: "Rumah Pintar Mini API", description: "Backend v0.4 (Modul 19)", version: "0.4.0" },
    components: {
      securitySchemes: { // Modul 20: rute bergembok butuh cookie akses dari POST /auth/login
        cookieAkses: { type: "apiKey", in: "cookie", name: "akses", description: "JWT akses (httpOnly) dari POST /auth/login" },
      },
    },
    security: [{ cookieAkses: [] }], // bawaan: semua rute bergembok; rute terbuka menulis security: []
  },
```

- **`securitySchemes.cookieAkses`** memberi tahu Swagger bahwa rute dikunci dengan *cookie* bernama `akses`.
- **`security: [{ cookieAkses: [] }]`** berarti **semua** rute bergembok, sejalan dengan prinsip terkunci secara bawaan. Rute yang terbuka menulis `security: []` sendiri.

Rute `/auth/login` sudah diberi `security: []` lewat `TERBUKA` di 3.2. Tinggal `/health`. Buka **`src/routes/kesehatan.ts`**, lalu tambahkan satu baris tepat di bawah `tags: ["server"],`:

```ts
      security: [], // Modul 20: tetap terbuka tanpa login (pemantau dan Docker healthcheck tidak bisa login)
```

Ganti juga komentar di baris `await pasangKeamanan(app);` di `server.ts` supaya sesuai dengan isinya sekarang:

```ts
await pasangKeamanan(app); // Modul 20: cookie, JWT, dan satpam di setiap permintaan (SEBELUM rute)
```

Simpan semuanya, lalu jalankan `npm run cek` (tanpa pesan galat). Kalau `npm run dev` masih berjalan, backend sudah dimulai ulang dengan sendirinya.

#### 3.4 ⭐ Tanpa *login*: semua pintu menjawab 401 (10 menit)

Bruno masih menyimpan gelang dari Praktik 2. Untuk menguji sebagai tamu tanpa *login*, hapus dulu *cookie*-nya: klik tombol **Cookies** (ikon kue) di bilah bawah Bruno. Di baris judul domain `127.0.0.1`, klik ikon tempat sampah, lalu **Clear All** di jendela `Clear Domain Cookies`. (Bisa juga satu per satu: ikon tempat sampah di kolom **Actions** setiap baris, lalu **Delete**.) Lalu kirim permintaan-permintaan lama dari Modul 16–19 satu per satu. Jangan kirim `login admin` atau `login viewer` dulu karena keduanya memasang *cookie* lagi.

**Hasilnya:** `health` tetap `200 OK`, sedangkan semua permintaan lain dijawab **`401 Unauthorized`** dengan isi:

```json
{"pesan":"belum login atau sesi sudah habis: login lewat POST /auth/login"}
```

Tab **Tests** permintaan lama itu kini merah (`expected 401 to equal 200`) karena Assert-nya masih mengharapkan 200. Itu wajar: tamu memang tidak boleh masuk.

Penulis juga mengetuk **setiap** pintu backend dengan `curl.exe` tanpa *cookie*. Hasil lengkapnya:

| Permintaan | Jawaban tanpa *login* |
| :--- | :--- |
| `GET /health`, `HEAD /health` | **200** (pintu terbuka) |
| `GET /devices`, `HEAD /devices` | **401** |
| `GET /devices/{id}/latest`, `…/vitals`, `…/readings`, `…/state` | **401** |
| `POST /devices/{id}/command` | **401** |
| `GET /rules`, `POST /rules`, `PUT /rules/1`, `POST /rules/2/jalankan` | **401** |
| `GET /auth/me` | **401** |
| `POST /auth/refresh`, `POST /auth/logout` | **401** (rutenya baru dibuat di Praktik 4, jadi sekarang sama dengan alamat yang tidak ada) |
| `GET /tidak-ada` | **401**, bukan 404 |
| `POST /auth/login` tanpa isi | **400** (pintu terbuka, tetapi isinya tidak sah) |
| `GET /docs`, `GET /docs/json` | **200** (pintu terbuka) |
| `GET /socket.io/?EIO=4&transport=polling` | **200** — pintu aula masih terbuka! Socket.IO dikunci di Praktik 7 (Konsep 10). |

Itulah **syarat lulus pertama**: tanpa *login*, semua *endpoint* menjawab 401, kecuali pintu yang sengaja dibuka dengan alasan yang jelas.

#### 3.5 ⭐ Akun `viewer`: 403 (10 menit)

Kirim **`login viewer`**, lalu buat permintaan baru untuk loket "siapa saya": buka tab **`daftar perangkat`**, klik kanan tab itu → **Clone Request**, isi **Request Name** dengan **`siapa saya`**, klik **Clone**, ubah URL-nya menjadi `{{baseUrl}}/auth/me`, simpan, lalu klik **Send**. Kemudian kirim `daftar perangkat`, `nyalakan lampu`, `ubah ambang kipas`, dan `jalankan jadwal siram`.

**Hasilnya:**

| Permintaan | Jawaban | Isi |
| :--- | :--- | :--- |
| `login viewer` | **200** | `{"id":2,"email":"viewer@rumah.test","nama":"Tamu Rumah","peran":"viewer"}` |
| `siapa saya` | **200** | profil yang sama |
| `daftar perangkat` | **200** | daftar perangkatmu |
| `nyalakan lampu` | **403** | `{"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}` |
| `ubah ambang kipas` | **403** | pesan yang sama |
| `jalankan jadwal siram` | **403** | pesan yang sama |

Relay lampu tidak berbunyi "klik", dan perintahnya bahkan tidak pernah dikirim ke broker. Log backend mencatat setiap penolakan (**contoh**):

```text
[10:38:10] INFO: login: akun 2 (viewer), sesi 11, IP 127.0.0.1
[10:38:10] INFO: POST /auth/login -> 200 (665 ms)
[10:38:10] INFO: GET /auth/me -> 200 (14 ms)
[10:38:11] INFO: GET /devices -> 200 (4 ms)
[10:38:11] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices/a4cf12e5b7c0/command
[10:38:11] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
[10:38:11] WARN: ditolak (403): akun 2 (viewer) mencoba PUT /rules/1
[10:38:11] INFO: PUT /rules/1 -> 403 (1 ms)
[10:38:11] WARN: ditolak (403): akun 2 (viewer) mencoba POST /rules/2/jalankan
[10:38:11] INFO: POST /rules/2/jalankan -> 403 (1 ms)
```

Penolakan hanya butuh 1 milidetik karena satpam berhenti sebelum database atau broker disentuh. Tab **Tests** ketiga permintaan itu merah (`expected 403 to equal 200`): Assert-nya dibuat untuk akun `admin`, dan merahnya justru bukti satpam bekerja.

Itulah **syarat lulus kedua**: akun `viewer` gagal menyalakan relay dengan **HTTP 403**.

#### 3.6 Akun `admin` tetap boleh (5 menit)

Kirim **`login admin`**, lalu `nyalakan lampu` dan `keadaan aktuator Node 1`. Gelang `admin` menggantikan gelang `viewer` di Bruno.

**Hasilnya** (**contoh**; jalur laptop memakai `f00d00000001`, jadi isi `state`-nya bisa berbeda):

```json
{"id":"c-20261022-033915-2","lama_ms":16,"ack":{"id":"c-20261022-033915-2","ts":"2026-10-22T03:39:15Z","ok":true,"state":{"kipas":false,"lampu":true,"pompa":false,"tirai":90}}}
```

Relay lampu berbunyi "klik" seperti biasa, dan `keadaan aktuator Node 1` menunjukkan `"desired":{"lampu":true}` dengan `"selisih":[]`. Semua fitur Modul 19 tetap berjalan untuk akun yang berhak. Akhiri dengan `matikan lampu`.

#### 3.7 Gembok di `/docs` dan *login* lewat browser (5 menit)

Buka `http://127.0.0.1:8080/docs` di browser. Ingat: selalu `127.0.0.1`, bukan `localhost`.

![Tangkapan layar Swagger UI di backend penulis sesudah satpam terpasang, Praktik 3.7; versi backend di judul masih 0.4.0 dan baru dinaikkan di Praktik 8; port lab penulis 8201, di laptopmu 8080. Kiri: halaman /docs berjudul Rumah Pintar Mini API dengan tombol Authorize bertanda 3 di kanan atas, lalu grup akun, server, dan perangkat. Baris POST /auth/login dan GET /health, keduanya bertanda 2, tidak bergembok, sedangkan GET /auth/me dan semua rute perangkat seperti GET /devices, POST /devices/{id}/command, dan GET /devices/{id}/state punya ikon gembok kecil di kanan; gembok di baris GET /auth/me bertanda 1. Kanan atas: jawaban Try it out POST /auth/login, kode 200 dengan isi id 1, email admin@rumah.test, nama Admin Rumah, peran admin; kotak Response headers bertanda 4 hanya berisi connection, content-length, content-type, date, dan keep-alive, tanpa set-cookie. Kanan bawah: Try it out GET /devices; kotak Curl bertanda 5 berisi curl -X GET ke http://127.0.0.1:8201/devices dengan kepala accept saja, tanpa cookie; kode jawaban 200 bertanda 6 dengan daftar satu perangkat a4cf12e5b7c0, jenis node1, status online. Keterangan di bawah daftar rute: 1 gembok, rute ini butuh cookie akses, security global di server.ts; 2 tanpa gembok, dua pintu terbuka, POST /auth/login dan GET /health; 3 Authorize tidak dipakai, browser sendiri yang membawa cookie; 4 login lewat Try it out, 200, kepala set-cookie tidak ditampilkan browser; 5 kotak Curl tanpa cookie, disalin ke terminal sama dengan 401; 6 GET /devices sesudah login, 200, browser melampirkan cookie akses.](aset/docs-bergembok.png)

1. Rute yang terkunci kini bergembok (**1**), kecuali dua pintu terbuka: `POST /auth/login` dan `GET /health` (**2**). Tombol **Authorize** (**3**) muncul karena skema keamanan baru, tetapi **tidak dipakai**: tombol itu untuk kunci yang diketik sendiri, sedangkan *cookie* dibawa browser secara otomatis.
2. Buka `POST /auth/login`, klik **Try it out**, ganti contoh isinya dengan email dan sandi akunmu (selama sandi itu masih tertulis, jangan mengambil tangkapan layar atau berbagi layar; cara menghapusnya ada di butir terakhir daftar ini), lalu klik **Execute**. Jawabannya `200` dengan profil akun. Perhatikan bahwa **Response headers** (**4**) tidak memuat `set-cookie`: browser menyembunyikan kepala itu dari JavaScript halaman, termasuk dari Swagger UI. *Cookie*-nya tetap tersimpan di browser.
3. Buka `GET /devices`, klik **Try it out** lalu **Execute**. Jawabannya `200` (**6**) karena browser melampirkan *cookie* `akses` secara otomatis. Kotak **Curl** (**5**) tidak memuat *cookie* sama sekali: kalau perintah itu disalin ke terminal, jawabannya 401.
4. Hapus isi kotak sandi di **Try it out** `POST /auth/login` sebelum mengambil tangkapan layar atau berbagi layar: Swagger UI menampilkan sandimu apa adanya di kotak isi permintaan **dan** di kotak **Curl**-nya.

#### 3.8 Simpan ke cabang (2 menit)

```text
git add src/auth/keamanan.ts src/db/pengguna.ts src/routes/auth.ts src/routes/kesehatan.ts src/server.ts "bruno/siapa saya.yml"
git commit -m "Satpam: tanpa login 401, akun viewer hanya melihat (403), gembok di /docs (Modul 20 Praktik 3)"
```

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 7](#7-refresh-token-dan-logout-kartu-terusan-di-loket) sebelum Praktik 4.

### Praktik 4 — *Refresh* dan *logout* (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, terminal kedua di folder `backend` untuk perintah lain), **Bruno**, dan **psql** (di terminal kedua). Bagian 4.6 memakai **curl** (pilihan).

Gelang kini dipakai di setiap pintu, tetapi umurnya hanya 15 menit, dan loket belum punya cara menggantinya tanpa *login* ulang. Praktik ini membuka dua loket baru dari Konsep 7: **`POST /auth/refresh`** (tukar kartu terusan dengan gelang baru, sambil memutar kartunya) dan **`POST /auth/logout`** (cabut sesi). Keduanya sudah terdaftar sebagai pintu terbuka sejak Praktik 3.

#### 4.1 Kartu lama dan toleransi 30 detik: `src/auth/token.ts` (5 menit)

Buka **`src/auth/token.ts`**, lalu ganti seluruh isinya dengan:

```ts
// token.ts - umur "gelang" (JWT akses) dan refresh token (Modul 20). Refresh token = 32 byte acak, BUKAN JWT. Isinya
// tidak berarti apa-apa; yang memberinya arti adalah barisnya di tabel sesi. Database hanya menyimpan SHA-256-nya: token
// 256 bit acak tidak bisa ditebak, jadi hash cepat sudah cukup (bcrypt hanya perlu untuk sandi buatan manusia).
import { createHash, randomBytes } from "node:crypto";

export const UMUR_AKSES_DETIK = 15 * 60; // JWT akses ("gelang konser"): 15 menit
export const UMUR_SESI_DETIK = 7 * 24 * 60 * 60; // refresh token ("kartu terusan"): 7 hari sejak login, lalu login lagi
export const TOLERANSI_MS = 30_000; // token yang baru diganti boleh dipakai lagi 30 detik (dua permintaan bersamaan)

export function buatTokenSesi(): string {
  return randomBytes(32).toString("base64url"); // 43 karakter acak; aman ditaruh di cookie
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex"); // 64 karakter heksadesimal
}

// Apa yang harus dilakukan dengan refresh token yang TIDAK cocok dengan token_hash mana pun, tetapi cocok dengan
// token_lama sebuah sesi? (logika murni, diuji Vitest)
// - diganti kurang dari TOLERANSI_MS yang lalu: permintaan lain dari browser yang sama kebetulan lebih dulu me-refresh
//   (misalnya dua tab) -> beri JWT akses baru saja, sesi tetap;
// - 30 detik atau lebih: token lama dipakai lagi, kemungkinan dicuri -> cabut sesinya.
export function nilaiTokenLama(diperbarui: Date, sekarang: number): "toleransi" | "curian" {
  return sekarang - diperbarui.getTime() < TOLERANSI_MS ? "toleransi" : "curian";
}
```

- **`TOLERANSI_MS`** adalah 30 detik dari Konsep 7.
- **`nilaiTokenLama()`** adalah **fungsi murni**, seperti otak aturan Modul 19: jam dikirim sebagai angka, jadi bisa diuji tanpa menunggu 30 detik sungguhan. Kartu lama yang muncul lagi **kurang dari** 30 detik setelah diganti dianggap `"toleransi"`; selebihnya `"curian"`.

#### 4.2 Putar, cari, dan hapus sesi: `src/db/pengguna.ts` (5 menit)

Buka **`src/db/pengguna.ts`**, lalu tambahkan empat fungsi ini di paling bawah, di bawah `buatSesi()`:

```ts
// Rotasi: tukar token lama dengan token baru dalam SATU perintah UPDATE. Kalau dua permintaan membawa token yang sama
// bersamaan, hanya satu yang menang; yang lain tidak menemukan barisnya lagi.
export async function putarSesi(hashLama: string, hashBaru: string):
  Promise<{ id: number; pengguna_id: number; kedaluwarsa: Date } | undefined> {
  const hasil = await pool.query<{ id: string; pengguna_id: number; kedaluwarsa: Date }>(
    `UPDATE sesi SET token_lama = token_hash, token_hash = $2, diperbarui = now()
     WHERE token_hash = $1 AND kedaluwarsa > now()
     RETURNING id, pengguna_id, kedaluwarsa`, [hashLama, hashBaru]);
  const baris = hasil.rows[0];
  return baris === undefined ? undefined : { ...baris, id: Number(baris.id) };
}

// Token yang sudah diganti (token_lama) dipakai lagi?
export async function cariSesiTokenLama(hash: string): Promise<{ id: number; pengguna_id: number; diperbarui: Date } | undefined> {
  const hasil = await pool.query<{ id: string; pengguna_id: number; diperbarui: Date }>(
    "SELECT id, pengguna_id, diperbarui FROM sesi WHERE token_lama = $1 AND kedaluwarsa > now()", [hash]);
  const baris = hasil.rows[0];
  return baris === undefined ? undefined : { ...baris, id: Number(baris.id) };
}

export async function hapusSesi(id: number): Promise<void> {
  await pool.query("DELETE FROM sesi WHERE id = $1", [id]);
}

// Logout: hapus sesi yang token sekarangnya cocok. Hasilnya nomor sesi yang dihapus.
export async function hapusSesiDenganToken(hash: string): Promise<number | undefined> {
  const hasil = await pool.query<{ id: string }>("DELETE FROM sesi WHERE token_hash = $1 RETURNING id", [hash]);
  return hasil.rows[0] === undefined ? undefined : Number(hasil.rows[0].id);
}
```

- **`putarSesi()`** adalah inti rotasi: **satu** perintah `UPDATE` memindahkan sidik jari kartu sekarang ke `token_lama`, menulis sidik jari kartu baru, dan mencatat waktunya. Karena semuanya terjadi dalam satu perintah, dua permintaan bersamaan yang membawa kartu yang sama tidak mungkin sama-sama menang: yang kedua tidak menemukan barisnya lagi, lalu jatuh ke pemeriksaan kartu lama.
- **`cariSesiTokenLama()`** mencari sesi dengan kartu **sebelumnya** yang cocok, untuk mendeteksi kartu lama yang dipakai lagi.
- **`hapusSesi()`** dan **`hapusSesiDenganToken()`** mencabut sesi. Yang kedua dipakai *logout* dan mengembalikan nomor sesinya.

#### 4.3 Loket *refresh* dan *logout*: `src/routes/auth.ts` (10 menit)

Buka **`src/routes/auth.ts`**, lalu ganti seluruh isinya dengan:

```ts
// auth.ts - rute /auth (Modul 20): login, refresh, logout, dan "siapa saya". JWT akses (15 menit) dan refresh token
// (7 hari) dikirim sebagai cookie httpOnly, tidak pernah di isi jawaban, jadi JavaScript di halaman tidak bisa membacanya.
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { COOKIE_AKSES, COOKIE_SESI, OPSI_AKSES, OPSI_SESI } from "../auth/keamanan.ts";
import { cocokkanSandi } from "../auth/sandi.ts";
import { buatTokenSesi, hashToken, nilaiTokenLama, UMUR_SESI_DETIK } from "../auth/token.ts";
import {
  ambilPengguna, buatSesi, cariSesiTokenLama, cariUntukLogin, hapusSesi, hapusSesiDenganToken, putarSesi,
} from "../db/pengguna.ts";
import type { Pengguna } from "../db/pengguna.ts";

const Galat = z.object({ pesan: z.string() });
const Profil = z.object({
  id: z.number(), email: z.string(), nama: z.string(), peran: z.enum(["admin", "viewer"]),
}).describe("akun yang sedang login");
const Masuk = z.object({
  email: z.email("email tidak sah").max(254).describe("email akun, misalnya budi@rumah.test"),
  sandi: z.string().min(1).max(200).describe("kata sandi akun"),
});

const profil = (p: Pengguna) => ({ id: p.id, email: p.email, nama: p.nama, peran: p.peran });

// tanda tangani JWT akses baru, lalu taruh di cookie "akses"
async function pasangAkses(reply: FastifyReply, p: Pengguna, sid: number): Promise<void> {
  const token = await reply.jwtSign({ sub: String(p.id), peran: p.peran, sid });
  reply.setCookie(COOKIE_AKSES, token, OPSI_AKSES);
}

// kosongkan kedua cookie (atribut sama dengan saat dipasang; clearCookie sendiri mengisi Max-Age=0)
function hapusCookie(reply: FastifyReply): void {
  reply.clearCookie(COOKIE_AKSES, OPSI_AKSES).clearCookie(COOKIE_SESI, OPSI_SESI);
}

const TERBUKA = { security: [] }; // Swagger: rute ini tidak butuh cookie (tanpa gembok)

export const ruteAuth: FastifyPluginAsyncZod = async (app) => {
  app.post("/auth/login", {
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Login dengan email dan sandi; hasilnya dua cookie httpOnly (akses 15 menit, sesi 7 hari)",
      body: Masuk,
      response: {
        200: Profil,
        401: Galat.describe("email atau sandi salah (sengaja tidak dibedakan)"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    const email = req.body.email.toLowerCase();
    try {
      const akun = await cariUntukLogin(email);
      const cocok = await cocokkanSandi(req.body.sandi, akun?.sandi_hash); // akun tidak ada: tetap dihitung, hasil false
      if (akun === undefined || !cocok) {
        req.log.warn(`login gagal: ${akun === undefined ? "email tidak terdaftar" : `akun ${akun.id}`} (IP ${req.ip})`);
        return reply.code(401).send({ pesan: "email atau sandi salah" });
      }
      const tokenSesi = buatTokenSesi();
      const sid = await buatSesi(akun.id, hashToken(tokenSesi), UMUR_SESI_DETIK);
      await pasangAkses(reply, akun, sid);
      reply.setCookie(COOKIE_SESI, tokenSesi, OPSI_SESI);
      req.log.info(`login: akun ${akun.id} (${akun.peran}), sesi ${sid}, IP ${req.ip}`);
      return profil(akun);
    } catch (galat) {
      req.log.error(`login gagal diproses: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.post("/auth/refresh", {
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Tukar cookie sesi dengan JWT akses baru (cookie sesi ikut diganti: rotasi)",
      response: {
        200: Profil,
        401: Galat.describe("cookie sesi tidak ada, kedaluwarsa, sudah logout, atau dicabut: login lagi"),
      },
    },
  }, async (req, reply) => {
    const token = req.cookies[COOKIE_SESI];
    if (token === undefined || token === "") return reply.code(401).send({ pesan: "belum login: cookie sesi tidak ada" });
    const hash = hashToken(token);
    const tokenBaru = buatTokenSesi();
    const sesi = await putarSesi(hash, hashToken(tokenBaru));
    if (sesi !== undefined) {
      const akun = await ambilPengguna(sesi.pengguna_id); // peran dibaca lagi dari database: perubahan peran berlaku di sini
      if (akun !== undefined) {
        reply.setCookie(COOKIE_SESI, tokenBaru,
          { ...OPSI_SESI, maxAge: Math.floor((sesi.kedaluwarsa.getTime() - Date.now()) / 1000) }); // sisa umur sesi
        await pasangAkses(reply, akun, sesi.id);
        return profil(akun);
      }
    } else {
      const lama = await cariSesiTokenLama(hash);
      if (lama !== undefined && nilaiTokenLama(lama.diperbarui, Date.now()) === "toleransi") {
        const akun = await ambilPengguna(lama.pengguna_id); // permintaan bersamaan: cukup gelang baru, sesi tetap
        if (akun !== undefined) {
          await pasangAkses(reply, akun, lama.id);
          return profil(akun);
        }
      } else if (lama !== undefined) {
        await hapusSesi(lama.id);
        req.log.warn(`refresh token lama sesi ${lama.id} (akun ${lama.pengguna_id}) dipakai lagi: sesi dicabut (IP ${req.ip})`);
      }
    }
    hapusCookie(reply);
    return reply.code(401).send({ pesan: "sesi sudah tidak berlaku: silakan login lagi" });
  });

  app.post("/auth/logout", {
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Logout: sesi di database dihapus dan kedua cookie dikosongkan",
      response: { 200: Galat.describe("selalu berhasil, juga kalau memang belum login") },
    },
  }, async (req, reply) => {
    const token = req.cookies[COOKIE_SESI];
    let sid = token ? await hapusSesiDenganToken(hashToken(token)) : undefined;
    if (sid === undefined) { // cookie sesi tidak terbawa? coba nomor sesi dari gelang akses yang masih sah
      try {
        await req.jwtVerify(); // isi gelang masuk ke req.user
        sid = req.user.sid;
        await hapusSesi(sid);
      } catch { /* tidak login: tidak ada yang perlu dihapus */ }
    }
    if (sid !== undefined) req.log.info(`logout: sesi ${sid}`);
    hapusCookie(reply);
    return { pesan: "sudah logout" };
  });

  app.get("/auth/me", {
    schema: {
      tags: ["akun"],
      summary: "Siapa yang sedang login (dibaca dari database, bukan dari isi JWT)",
      response: { 200: Profil, 401: Galat.describe("belum login, atau akunnya sudah dihapus") },
    },
  }, async (req, reply) => {
    const akun = await ambilPengguna(Number(req.user.sub)); // req.user diisi satpam dari gelang yang sah
    if (akun === undefined) return reply.code(401).send({ pesan: "akun ini sudah tidak ada" });
    return profil(akun);
  });
};
```

- **`hapusCookie()`** mengosongkan kedua *cookie* dengan atribut yang sama seperti saat dipasang. *Cookie* hanya bisa dihapus kalau nama dan `Path`-nya cocok.
- **`POST /auth/refresh`** membaca kartu terusan dari *cookie* `sesi`, lalu mencoba memutarnya dengan `putarSesi()`. Kalau berhasil, akunnya dibaca **ulang** dari database (perubahan peran berlaku di sini), kartu baru dipasang dengan **sisa** umur sesinya, dan gelang baru ditandatangani.
- Kalau kartu itu tidak cocok dengan kartu mana pun yang berlaku, loket memeriksa apakah ia **kartu lama** sebuah sesi. Kurang dari 30 detik sejak diganti: cukup beri gelang baru (toleransi). Tepat 30 detik atau lebih: sesinya dicabut, dan log menulis `WARN`. Kedua kemungkinan lain, yaitu kartu tidak dikenal sama sekali atau sesi sudah kedaluwarsa, berakhir sama: kedua *cookie* dikosongkan, dan jawabannya 401 `sesi sudah tidak berlaku: silakan login lagi`.
- **`POST /auth/logout`** menghapus sesi berdasarkan kartu terusannya. Kalau *cookie* `sesi` tidak terbawa (misalnya karena `Path`-nya), loket memakai nomor sesi (`sid`) dari gelang yang masih sah. Apa pun yang terjadi, kedua *cookie* dikosongkan dan jawabannya 200.
- Kedua rute baru memakai `...TERBUKA`, jadi tampil tanpa gembok di `/docs`, sama seperti `POST /auth/login`.

#### 4.4 Tes kartu terusan (5 menit)

Buka **`src/auth/auth.test.ts`**, lalu ganti seluruh isinya dengan:

```ts
// auth.test.ts - unit test logika login (Modul 20): aturan sandi, sidik jari bcrypt, refresh token, dan token lama.
// Tanpa database dan tanpa server. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { Sandi, buatSidikJari, cocokkanSandi } from "./sandi.ts";
import { TOLERANSI_MS, buatTokenSesi, hashToken, nilaiTokenLama } from "./token.ts";

describe("aturan sandi (Sandi)", () => {
  it("14 karakter ditolak, 15 karakter diterima", () => {
    expect(Sandi.safeParse("a".repeat(14)).success).toBe(false);
    expect(Sandi.safeParse("a b c d e f g h").success).toBe(true); // tepat 15 karakter: spasi ikut dihitung
  });
  it("lebih dari 72 byte ditolak: bcrypt diam-diam memotongnya", () => {
    expect(Sandi.safeParse("a".repeat(72)).success).toBe(true);
    expect(Sandi.safeParse("a".repeat(73)).success).toBe(false);
    expect(Sandi.safeParse("😀".repeat(19)).success).toBe(false); // 19 emoji = 38 karakter JavaScript, tetapi 76 byte
  });
});

// bcrypt sengaja lambat (sekitar 0,3 detik per hitungan di laptop i5, bisa >1 detik di laptop sibuk atau lambat), jadi batas
// waktu tes ini dinaikkan dari bawaan Vitest 5 detik menjadi 30 detik.
const LAMBAT = 30_000;

describe("sidik jari sandi (bcrypt)", () => {
  it("sandi benar cocok, sandi salah tidak, dan sidik jari selalu berbeda (garam acak)", async () => {
    const satu = await buatSidikJari("sandi khusus untuk tes ini");
    const dua = await buatSidikJari("sandi khusus untuk tes ini");
    expect(satu).toMatch(/^\$2b\$12\$.{53}$/);
    expect(satu).not.toBe(dua);
    expect(await cocokkanSandi("sandi khusus untuk tes ini", satu)).toBe(true);
    expect(await cocokkanSandi("sandi khusus untuk tes itu", satu)).toBe(false);
  }, LAMBAT);
  it("akun tidak ada (sidik jari kosong): hasilnya false, bukan galat", async () => {
    expect(await cocokkanSandi("apa saja", undefined)).toBe(false);
    expect(await cocokkanSandi("apa saja", null)).toBe(false);
  }, LAMBAT);
});

describe("refresh token", () => {
  it("43 karakter base64url, tidak pernah sama", () => {
    const a = buatTokenSesi();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(buatTokenSesi()).not.toBe(a);
  });
  it("hash SHA-256 selalu sama untuk token yang sama (bisa dicari di database)", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashToken("abd")).not.toBe(hashToken("abc"));
  });
  it("token lama dipakai lagi: dalam 30 detik = toleransi, sesudahnya = curian", () => {
    const diganti = new Date("2026-10-22T06:00:00+07:00");
    expect(nilaiTokenLama(diganti, diganti.getTime() + 5_000)).toBe("toleransi");
    expect(nilaiTokenLama(diganti, diganti.getTime() + TOLERANSI_MS)).toBe("curian");
    expect(nilaiTokenLama(diganti, diganti.getTime() + 60 * 60_000)).toBe("curian");
  });
});
```

Tiga tes baru ada di kelompok `refresh token`:

- Kartu terusan selalu 43 karakter *base64url*, dan dua kartu tidak pernah sama.
- SHA-256 dari teks yang sama selalu sama. Nilai `ba7816bf…` adalah sidik jari SHA-256 resmi untuk teks `abc`, yang dipakai di banyak buku dan standar untuk menguji SHA-256.
- Kartu lama yang muncul lagi 5 detik setelah diganti dianggap toleransi, sedangkan **tepat** 30 detik atau satu jam kemudian dianggap curian.

Jalankan semua tes dengan daftar lengkapnya:

```text
npm test -- --reporter=tree
```

**Hasilnya** (**contoh**, diringkas; lama milidetiknya berbeda):

```text
 ✓ src/aturan/mesin.test.ts (11 tests) 29ms
   ✓ aturan kipas (nilaiAmbang) (8)
     …
   ✓ peringatan Telegram (perluKabari) (1)
     …
   ✓ skema aturan (Zod) (2)
     …
 ✓ src/auth/auth.test.ts (7 tests) 2437ms
   ✓ aturan sandi (Sandi) (2)
     ✓ 14 karakter ditolak, 15 karakter diterima 6ms
     ✓ lebih dari 72 byte ditolak: bcrypt diam-diam memotongnya 1ms
   ✓ sidik jari sandi (bcrypt) (2)
     ✓ sandi benar cocok, sandi salah tidak, dan sidik jari selalu berbeda (garam acak) 1623ms
     ✓ akun tidak ada (sidik jari kosong): hasilnya false, bukan galat 799ms
   ✓ refresh token (3)
     ✓ 43 karakter base64url, tidak pernah sama 2ms
     ✓ hash SHA-256 selalu sama untuk token yang sama (bisa dicari di database) 1ms
     ✓ token lama dipakai lagi: dalam 30 detik = toleransi, sesudahnya = curian 1ms

 Test Files  2 passed (2)
      Tests  18 passed (18)
```

`--` sesudah `npm test` meneruskan `--reporter=tree` ke Vitest (sama seperti `npm run pengguna -- …`), dan reporter `tree` menuliskan setiap tes, termasuk yang cepat. Baris `…` di atas adalah 11 tes otak aturan Modul 19 yang sudah kamu kenal. Totalnya **18 tes lulus**: 11 dari Modul 19 dan 7 dari modul ini.

Untuk melihat gunanya tes batas, ubah sebentar satu tanda di `nilaiTokenLama()`: ganti `<` dengan `<=`, simpan, lalu jalankan `npm test` lagi.

**Hasilnya** (**contoh**, diringkas; garis pemisahnya dipendekkan, dan lama milidetiknya berbeda):

```text
 ✓ src/aturan/mesin.test.ts (11 tests) 209ms
 ❯ src/auth/auth.test.ts (7 tests | 1 failed) 5319ms
   ✓ aturan sandi (Sandi) (2)
     ✓ 14 karakter ditolak, 15 karakter diterima 99ms
     ✓ lebih dari 72 byte ditolak: bcrypt diam-diam memotongnya 19ms
   ✓ sidik jari sandi (bcrypt) (2)
     ✓ sandi benar cocok, sandi salah tidak, dan sidik jari selalu berbeda (garam acak) 3624ms
     ✓ akun tidak ada (sidik jari kosong): hasilnya false, bukan galat 1392ms
   ❯ refresh token (3)
     ✓ 43 karakter base64url, tidak pernah sama 27ms
     ✓ hash SHA-256 selalu sama untuk token yang sama (bisa dicari di database) 31ms
     × token lama dipakai lagi: dalam 30 detik = toleransi, sesudahnya = curian 102ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/auth/auth.test.ts > refresh token > token lama dipakai lagi: dalam 30 detik = toleransi, sesudahnya = curian
AssertionError: expected 'toleransi' to be 'curian' // Object.is equality

Expected: "curian"
Received: "toleransi"

 ❯ src/auth/auth.test.ts:51:71
     49|     const diganti = new Date("2026-10-22T06:00:00+07:00");
     50|     expect(nilaiTokenLama(diganti, diganti.getTime() + 5_000)).toBe("toleransi");
     51|     expect(nilaiTokenLama(diganti, diganti.getTime() + TOLERANSI_MS)).toBe("curian");
       |                                                                       ^
     52|     expect(nilaiTokenLama(diganti, diganti.getTime() + 60 * 60_000)).toBe("curian");
     53|   });

 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 17 passed (18)
```

Tes itu memeriksa **tepat** detik ke-30. Dengan `<=`, kartu yang dipakai lagi tepat 30 detik kemudian masih dianggap toleransi, padahal aturannya "kurang dari 30 detik". Vitest menunjuk barisnya (`auth.test.ts:51`), nilai yang diharapkan (`"curian"`), dan nilai yang didapat (`"toleransi"`). Kembalikan `<=` menjadi `<`, lalu pastikan `npm test` kembali menulis `Tests  18 passed (18)`.

#### 4.5 Coba di Bruno: `refresh` dan `logout` (10 menit)

Buat dua permintaan baru di Bruno dengan **Clone Request** (klik kanan tab permintaan lama → **Clone Request** → isi **Request Name** → **Clone**), seperti Modul 19:

| Permintaan baru | Di-*clone* dari | Ubah menjadi |
| :--- | :--- | :--- |
| `refresh` | `login admin` | URL `{{baseUrl}}/auth/refresh`; tab **Body** diubah menjadi **No Body**; di tab **Assert**, hapus baris `res.body.peran` (cukup `res.status` `eq` `200`) |
| `logout` | `refresh` | URL `{{baseUrl}}/auth/logout`; di tab **Assert**, tambahkan `res.body.pesan` `eq` `sudah logout` |

Simpan keduanya. Lalu kirim berurutan: `login admin`, `refresh`, `siapa saya`, `logout`, dan `daftar perangkat`.

**Hasilnya:**

| Permintaan | Jawaban |
| :--- | :--- |
| `login admin` | **200**, dua *cookie* baru |
| `refresh` | **200**, profil `admin`; tab **Headers** memuat dua `set-cookie` **baru**: kartu terusan sudah diganti |
| `siapa saya` | **200** dengan gelang baru |
| `logout` | **200** `{"pesan":"sudah logout"}` |
| `daftar perangkat` | **401**: gelang dan kartu terusan sudah dibuang |

Untuk melihat rotasinya di database, kirim `login admin` dan `refresh` sekali lagi, lalu buka psql di terminal kedua seperti Praktik 1.8 (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`) dan jalankan:

```sql
SELECT id, pengguna_id, left(token_hash, 12) AS token_hash, left(token_lama, 12) AS token_lama,
       date_trunc('second', now() - dibuat) AS sejak_login,
       date_trunc('second', kedaluwarsa - now()) AS sisa_umur
FROM sesi ORDER BY id DESC LIMIT 3;
```

Baris teratas punya `token_lama` yang terisi: sidik jari kartu sebelum *refresh*. `sisa_umur` mendekati `6 days 23:59`, dan terus berkurang sampai 7 hari habis. Keluar dari psql dengan `\q` sebelum lanjut: terminal kedua dipakai lagi untuk curl (4.6), PowerShell (4.7), dan `git` (4.9).

#### 4.6 (Pilihan) Kartu lama yang dipakai lagi

Bruno selalu memakai kartu terusan **terbaru** yang ia simpan, jadi kartu lama sulit dipakai lagi dari Bruno. Dengan curl, kartu lama bisa ditulis sendiri di kepala `Cookie`. Kalau kamu membuat `login.json` di Praktik 2.10, jalankan langkah-langkah ini di terminal kedua, di folder `backend` (macOS: `curl`, bukan `curl.exe`); kalau tidak, cukup baca hasil penulis di bawah. Langkah 3 harus selesai dalam 30 detik setelah langkah 2. Cara paling mudah: ketik perintah langkah 2, lalu `;`, lalu perintah langkah 3 yang sudah berisi T0, semuanya dalam satu baris, baru tekan **Enter** sekali; kedua perintah dijalankan berurutan. Jawaban langkah 3 langsung menyambung di baris yang sama dengan akhir jawaban langkah 2 (`…"peran":"admin"}HTTP/1.1 200 OK`) karena isi jawaban backend tidak diakhiri baris baru.

1. *Login* dan simpan *cookie*-nya: `curl.exe -i -c kue.txt -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login`. Catat isi *cookie* `sesi` dari baris `set-cookie: sesi=…` (sampai sebelum titik koma). Sebut saja kartu itu **T0**.
2. *Refresh* dengan kartu itu, dan simpan kartu barunya ke berkas yang sama: `curl.exe -i -b kue.txt -c kue.txt -X POST http://127.0.0.1:8080/auth/refresh`.
3. **Dalam 30 detik**, pakai T0 sekali lagi: `curl.exe -i -X POST http://127.0.0.1:8080/auth/refresh -H "Cookie: sesi=T0"` (ganti `T0` dengan kartu yang kamu catat).
4. Tunggu **lebih dari 30 detik**, lalu jalankan lagi perintah langkah 3 **saja** dengan mengetik atau menempelnya ulang. Jangan memanggil baris gabungan tadi dengan **↑**. Baris itu ikut menjalankan langkah 2 lagi sehingga kartu terusanmu diputar sekali lagi. Akibatnya, T0 tidak dikenali sama sekali, sesinya tidak dicabut, dan hasilnya tidak sama dengan tabel di bawah.
5. Coba *refresh* dengan kartu yang sah (yang tersimpan di `kue.txt`): jalankan lagi perintah langkah 2 saja.

**Hasilnya** di laptop penulis (**contoh**; isi *cookie* dipotong):

| Langkah | Jawaban | Isi tabel `sesi` sesudahnya |
| :--- | :--- | :--- |
| 1. *login* | **200**, dua `set-cookie` (gelang dan kartu T0) | baris sesi `18`, `token_hash` `ba1af888b290…`, `token_lama` kosong |
| 2. *refresh* dengan T0 | **200**, dua `set-cookie` baru: `sesi=mL3MgSB8…; Max-Age=604784` dan gelang baru | `token_hash` `b542afb2cf6b…`, `token_lama` `ba1af888b290…` (rotasi) |
| 3. T0 lagi, 2 detik kemudian | **200**, hanya gelang baru (toleransi) | tidak berubah |
| 4. T0 lagi, 40 detik kemudian | **401** `{"pesan":"sesi sudah tidak berlaku: silakan login lagi"}`, dua `set-cookie` pengosong | **barisnya hilang**: sesi dicabut |
| 5. kartu sah (T1) | **401**, pesan yang sama | tidak ada baris |

Perhatikan `Max-Age=604784` pada langkah 2: kartu baru tidak mendapat 7 hari penuh, melainkan **sisa umur** sesinya. Umur mutlak 7 hari dihitung sejak *login*, tidak diperpanjang oleh *refresh*.

Log backend mencatat kejadian itu (**contoh**):

```text
[11:01:08] INFO: login: akun 1 (admin), sesi 18, IP 127.0.0.1
[11:01:08] INFO: POST /auth/login -> 200 (1075 ms)
[11:01:23] INFO: POST /auth/refresh -> 200 (13 ms)
[11:01:25] INFO: POST /auth/refresh -> 200 (17 ms)
[11:02:06] WARN: refresh token lama sesi 18 (akun 1) dipakai lagi: sesi dicabut (IP 127.0.0.1)
[11:02:06] INFO: POST /auth/refresh -> 401 (21 ms)
[11:02:07] INFO: POST /auth/refresh -> 401 (16 ms)
```

Inilah deteksi pencurian dari Konsep 7. Backend tidak tahu siapa yang asli, jadi **semua** pemegang sesi itu, termasuk pemilik sahnya pada langkah 5, harus *login* ulang. *Refresh* butuh belasan milidetik saja, jauh lebih cepat daripada *login*, karena kartu terusan diperiksa dengan SHA-256, bukan bcrypt.

#### 4.7 *Logout*

Kirim **`logout`** di Bruno.

**Hasilnya:** `200 OK` dengan `{"pesan":"sudah logout"}`. Tab **Headers** memuat dua `set-cookie` **pengosong**:

```text
set-cookie: akses=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
set-cookie: sesi=; Max-Age=0; Path=/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
```

`Max-Age=0` dan tanggal kedaluwarsa 1 Januari 1970 menyuruh browser dan Bruno **membuang** kedua *cookie* saat itu juga. Atributnya (`Path`, `HttpOnly`, `SameSite`) sama dengan saat dipasang karena *cookie* hanya terhapus kalau nama, `Path`, dan domainnya cocok. Baris sesinya juga hilang dari tabel `sesi`. Sekarang kirim **`siapa saya`**: jawabannya **401**.

*Logout* selalu menjawab 200, juga untuk orang yang memang belum *login*. Tidak ada gunanya memberi tahu orang asing apakah sesinya masih ada.

Pengguna PowerShell dari Praktik 2.10: `POST` tanpa isi ditolak Fastify (`415 Unsupported Media Type` di Windows PowerShell 5.1, `400 … Body cannot be empty when content-type is set to 'application/json'` di PowerShell 7) karena PowerShell menulis kepala `content-type` yang tidak cocok. Kirim isi JSON kosong:

```text
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8080/auth/logout -ContentType "application/json" -Body "{}" -WebSession $sesi
```

Jawabannya `sudah logout`, dan `$sesi` tidak lagi menyimpan *cookie* apa pun.

**Batas gelang, dibuktikan.** Sebelum *logout*, penulis menyalin isi gelang `akses`, lalu memakainya lagi **sesudah** *logout* (**contoh**):

| Permintaan dengan gelang salinan | Jawaban |
| :--- | :--- |
| `GET /auth/me` | **200** `{"id":1,"email":"admin@rumah.test","nama":"Admin Rumah","peran":"admin"}` |
| `POST /auth/refresh` | **401** `{"pesan":"belum login: cookie sesi tidak ada"}` |

Gelang yang telanjur disalin tetap sah sampai `exp`-nya, paling lama 15 menit, karena satpam memeriksanya tanpa membuka database (Konsep 4 dan 7). Namun, ia tidak bisa diperpanjang: kartu terusannya sudah mati. Itulah sebabnya gelang dibuat berumur pendek, dan gelang yang masih berlaku tidak boleh dibagikan ke siapa pun.

#### 4.8 Gelang yang kedaluwarsa sungguhan

Satu uji lagi butuh kesabaran: biarkan gelang benar-benar kedaluwarsa. Kirim `login admin`, kerjakan hal lain selama **lebih dari 15 menit** (misalnya lanjut membaca Konsep 8), lalu kirim `daftar perangkat`, `refresh`, dan `daftar perangkat` sekali lagi.

**Hasilnya:**

| Permintaan | Jawaban |
| :--- | :--- |
| `daftar perangkat` (lebih dari 15 menit sesudah *login*) | **401** `belum login atau sesi sudah habis: login lewat POST /auth/login` |
| `refresh` | **200**: kartu terusan masih berlaku, gelang baru dipasang |
| `daftar perangkat` | **200** |

Bruno sendiri sudah membuang gelang itu karena `Max-Age=900` habis, jadi permintaan pertama berangkat tanpa gelang. Penulis juga mencoba mengirim gelang basi itu secara paksa lewat curl: satpam tetap menjawab 401 karena `exp`-nya sudah lewat. Log backend (**contoh**):

```text
[11:49:29] INFO: GET /devices -> 401 (1 ms)
[11:49:31] INFO: GET /devices -> 401 (2 ms)
[11:49:32] INFO: POST /auth/refresh -> 200 (192 ms)
[11:49:33] INFO: GET /devices -> 200 (2 ms)
```

Inilah pola yang kelak dijalankan dashboard React secara otomatis (Modul 22): kalau jawabannya 401, ketuk `refresh` sekali, lalu ulangi permintaannya. Kalau `refresh` pun 401, barulah tampilkan formulir *login*.

#### 4.9 Simpan ke cabang (2 menit)

```text
git add src/auth/token.ts src/auth/auth.test.ts src/db/pengguna.ts src/routes/auth.ts bruno/refresh.yml bruno/logout.yml
git commit -m "Refresh dengan rotasi, logout, dan tes kartu terusan (Modul 20 Praktik 4)"
```

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 8](#8-rate-limiting-jam-pasir-untuk-penebak-sandi) sebelum Praktik 5.

### Praktik 5 — Batasi percobaan *login* (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, terminal kedua di folder `backend` untuk perintah lain) dan **Bruno**. Bagian 5.5 memakai **curl** (pilihan).
>
> ⭐ **Wajib** — syarat lulus ketiga: percobaan *login* ke-11 dalam semenit ditolak.

Loket *login* masih bisa diketuk tanpa henti. Praktik ini memasang jam pasir dari Konsep 8: paling banyak **10 percobaan per menit** dari satu alamat IP.

#### 5.1 Pasang `@fastify/rate-limit` (2 menit)

```text
npm install @fastify/rate-limit@11.2.1
```

**Hasilnya** (**contoh**):

```text
added 1 package, and audited 225 packages in 4s

55 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 5.2 Jam pasir di `src/auth/keamanan.ts` (8 menit)

Buka **`src/auth/keamanan.ts`**, lalu ganti seluruh isinya dengan:

```ts
// keamanan.ts - pengaman API (Modul 20): cookie, JWT ("gelang konser"), rate limit, dan "satpam" yang memeriksa SETIAP
// permintaan HTTP: wajib login (kecuali daftar rute terbuka), dan akun viewer hanya boleh melihat.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.ts";
import type { Peran } from "../db/pengguna.ts";
import { UMUR_AKSES_DETIK, UMUR_SESI_DETIK } from "./token.ts";

// isi "gelang" (JWT akses): nomor akun (sub), perannya, dan nomor sesi (sid). Bukan rahasia: siapa pun yang memegang
// token bisa membaca isinya, jadi jangan menaruh email, nama, atau data pribadi lain di sini.
export interface IsiToken {
  sub: string;
  peran: Peran;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: IsiToken; // yang ditandatangani reply.jwtSign
    user: IsiToken & { iat: number; exp: number }; // yang dibaca req.jwtVerify ke req.user
  }
}

export const COOKIE_AKSES = "akses";
export const COOKIE_SESI = "sesi";

// httpOnly: JavaScript di halaman tidak bisa membaca cookie (pencuri lewat XSS tidak mendapat token).
// sameSite strict: browser tidak mengirim cookie pada permintaan yang dipicu situs lain (CSRF).
// secure auto: atribut Secure dipasang kalau permintaannya lewat HTTPS (Fase 5); di http://127.0.0.1 tidak.
const DASAR = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const OPSI_AKSES = { ...DASAR, path: "/", maxAge: UMUR_AKSES_DETIK }; // path "/" WAJIB: tanpa itu hanya /auth/...
export const OPSI_SESI = { ...DASAR, path: "/auth", maxAge: UMUR_SESI_DETIK }; // hanya dikirim ke /auth/...

// Rute yang boleh diketuk TANPA login. Semua rute lain wajib login, termasuk rute baru yang kelak ditambahkan.
export const RUTE_TERBUKA = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: pemeriksa kesehatan seperti wget --spider (Docker, Fase 5)
]);
const MEMBACA = new Set(["GET", "HEAD"]); // satu-satunya metode yang boleh dipakai akun viewer

export async function pasangKeamanan(app: FastifyInstance): Promise<void> {
  await app.register(cookie); // tanpa secret: JWT sudah bertanda tangan, refresh token dicek ke database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: COOKIE_AKSES, signed: false },
    sign: { expiresIn: UMUR_AKSES_DETIK }, // angka = detik (900); teks seperti "1h30m" ditolak sejak 10.2.3
    verify: { onlyCookie: true }, // gelang hanya dibaca dari cookie, bukan dari header Authorization
  });
  await app.register(rateLimit, {
    global: false, // hanya rute yang memintanya (POST /auth/login); hitungan disimpan di memori: restart = mulai dari nol
    errorResponseBuilder: (_req, konteks) => Object.assign(
      new Error(`terlalu banyak percobaan: coba lagi dalam ${Math.ceil(konteks.ttl / 1000)} detik`),
      { statusCode: konteks.statusCode }, // 429
    ),
  });
  app.addHook("onRequest", satpam); // satu satpam di pintu depan: berlaku untuk SEMUA rute
}

async function satpam(req: FastifyRequest, reply: FastifyReply) {
  const url = req.routeOptions.url; // pola rute, misalnya /devices/:id/command (undefined = tidak ada: tamu 401, sudah login 404)
  if (RUTE_TERBUKA.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // ada cookie akses? tanda tangannya asli? belum kedaluwarsa? isinya masuk req.user
  } catch {
    return reply.code(401).send({ pesan: "belum login atau sesi sudah habis: login lewat POST /auth/login" });
  }
  if (req.user.peran !== "admin" && !MEMBACA.has(req.method)) { // diperiksa SEBELUM isi permintaan divalidasi
    req.log.warn(`ditolak (403): akun ${req.user.sub} (${req.user.peran}) mencoba ${req.method} ${req.url}`);
    return reply.code(403).send({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
  }
}
```

- **`global: false`** berarti jam pasir **tidak** dipasang di semua rute, hanya di rute yang memintanya. Membaca data rumah dengan Bruno atau dashboard tidak perlu dibatasi; yang perlu dijaga hanya pintu *login*.
- **`errorResponseBuilder`** menyusun jawaban 429 dalam bahasa Indonesia. `konteks.ttl` adalah sisa waktu jam pasir dalam milidetik, jadi dibagi 1.000 lalu dibulatkan ke atas menjadi detik.
- Hitungannya disimpan di **memori** backend (Konsep 8).

#### 5.3 Pasang jam pasirnya di pintu *login* (5 menit)

Buka **`src/routes/auth.ts`**. Di dalam `app.post("/auth/login", { … })`, tambahkan baris `config` tepat **di atas** baris `schema: {`, lalu tambahkan jawaban `429` ke daftar `response` sehingga bagian awal rute itu menjadi:

```ts
  app.post("/auth/login", {
    config: { rateLimit: { max: 10, timeWindow: 60_000 } }, // percobaan ke-11 dalam semenit dari IP yang sama: 429
    schema: {
      tags: ["akun"], ...TERBUKA,
      summary: "Login dengan email dan sandi; hasilnya dua cookie httpOnly (akses 15 menit, sesi 7 hari)",
      body: Masuk,
      response: {
        200: Profil,
        401: Galat.describe("email atau sandi salah (sengaja tidak dibedakan)"),
        429: z.object({ statusCode: z.number(), error: z.string(), message: z.string() })
          .describe("lebih dari 10 percobaan login dalam semenit dari alamat IP yang sama"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
```

- **`config.rateLimit`** adalah setelan khusus rute ini: `max: 10` percobaan dalam `timeWindow: 60_000` milidetik, yaitu satu menit.
- Jawaban **`429`** dicatat di skema supaya muncul di `/docs`, lengkap dengan keterangannya.

Simpan, lalu jalankan `npm run cek` (tanpa pesan galat). `npm run dev` memulai ulang backend dengan sendirinya.

#### 5.4 ⭐ Percobaan ke-11 ditolak (10 menit)

Pakai dua permintaan dari Praktik 2: **`login salah`** (sandi salah) dan **`login admin`** (sandi benar).

1. Klik **Send** pada `login salah` **sepuluh kali** berturut-turut, dalam waktu kurang dari satu menit. Setiap kali, jawabannya `401 Unauthorized`. Buka tab **Headers** jawaban terakhir: `x-ratelimit-remaining` sudah `0`. Kalau jawaban 429 muncul sebelum klik kesepuluh, berarti kamu sudah *login* beberapa kali dalam semenit terakhir: **semua** percobaan dihitung, termasuk yang berhasil. Tunggu satu menit, lalu ulangi.
2. Segera klik **Send** pada **`login admin`**, yang sandinya **benar**.

**Hasilnya:** `429 Too Many Requests`, dengan isi (**contoh**; angka detiknya berbeda):

```json
{"statusCode":429,"error":"Too Many Requests","message":"terlalu banyak percobaan: coba lagi dalam 49 detik"}
```

Tab **Tests** `login admin` merah (`expected 429 to equal 200`) karena Assert-nya mengharapkan *login* yang berhasil. Merah di sini justru tanda jam pasirnya bekerja.

Tab **Headers** jawaban itu memuat:

```text
x-ratelimit-limit: 10
x-ratelimit-remaining: 0
x-ratelimit-reset: 49
retry-after: 49
```

Itulah **syarat lulus ketiga**: percobaan ke-11 dalam semenit ditolak **walaupun sandinya benar**. Selama jam pasir belum habis, loket bahkan tidak memeriksa sandi. Log backend menunjukkan bedanya (**contoh**):

```text
[12:08:40] WARN: login gagal: akun 1 (IP 127.0.0.1)
[12:08:40] INFO: POST /auth/login -> 401 (410 ms)
[12:08:40] INFO: POST /auth/login -> 429 (4 ms)
```

Percobaan ke-10 masih menjalankan bcrypt (410 ms), sedangkan percobaan ke-11 ditolak dalam 4 milidetik, sebelum menyentuh database atau bcrypt.

3. Tunggu sampai `retry-after` habis (kurang dari satu menit), lalu klik **Send** pada `login admin` lagi. Jawabannya kembali **200**, dan kepala `x-ratelimit-remaining` menjadi `9`.

#### 5.5 (Pilihan) Sebelas percobaan dari terminal

Kalau kamu membuat `login.json` di Praktik 2.10, buat juga salinannya bernama **`login-salah.json`** di folder `backend`, lalu ganti sandi di dalamnya dengan sandi yang salah. Berkas itu sudah diabaikan Git lewat baris `login*.json` di `backend/.gitignore`. Jalankan perintah di bawah ini di terminal kedua (folder `backend`). Di PowerShell, `1..10 | ForEach-Object { … }` menjalankan perintah di dalam kurung kurawal sepuluh kali, dan `-w "%{http_code} "` membuat curl hanya menulis kode jawabannya:

```text
1..10 | ForEach-Object { curl.exe -s -o NUL -w "%{http_code} " -H "content-type: application/json" --data-binary "@login-salah.json" http://127.0.0.1:8080/auth/login }; curl.exe -i -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login
```

**Hasilnya** (**contoh**; Windows PowerShell 5.1 dan PowerShell 7 sama):

```text
401 401 401 401 401 401 401 401 401 401 HTTP/1.1 429 Too Many Requests
x-ratelimit-limit: 10
x-ratelimit-remaining: 0
x-ratelimit-reset: 29
retry-after: 29
content-type: application/json; charset=utf-8
content-length: 109
Date: Thu, 22 Oct 2026 05:15:47 GMT
Connection: keep-alive
Keep-Alive: timeout=72

{"statusCode":429,"error":"Too Many Requests","message":"terlalu banyak percobaan: coba lagi dalam 29 detik"}
```

**macOS:** ganti `1..10 | ForEach-Object { … }` dengan `for i in 1 2 3 4 5 6 7 8 9 10; do …; done`, `curl.exe` dengan `curl`, dan `NUL` dengan `/dev/null`. Cara lain lewat Bruno CLI ada di 🔬.

#### 5.6 Jam pasir di memori

Jam pasir disimpan di memori backend. Buktikan: tunggu satu menit sejak *login* terakhir supaya jam pasirnya kosong, lalu kirim `login salah` tiga kali (kepala `x-ratelimit-remaining` turun menjadi `7`), hentikan backend dengan **Ctrl + C**, jalankan lagi `npm run dev`, lalu kirim `login admin`.

**Hasilnya:** `200 OK`, dan `x-ratelimit-remaining` kembali `9`. Hitungan lama hilang bersama proses backend yang dihentikan.

Untuk satu backend di laptop, itu tidak masalah: penebak sandi tidak bisa mematikan backend-mu. Backend yang berjalan di beberapa server sekaligus (Fase 5) menyimpan hitungannya di tempat bersama, misalnya Redis, supaya setiap server melihat angka yang sama.

#### 5.7 Simpan ke cabang (2 menit)

```text
git add package.json package-lock.json src/auth/keamanan.ts src/routes/auth.ts
git commit -m "Batas 10 percobaan login per menit, percobaan ke-11 dijawab 429 (Modul 20 Praktik 5)"
```

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 9](#9-cors-mengapa-browser-menolak) sebelum Praktik 6.

### Praktik 6 — CORS dan pemeriksaan asal (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, terminal kedua di folder `backend` untuk perintah lain), **browser** (Chrome atau Edge) beserta **DevTools**-nya, dan **Bruno**. Bagian 6.5 dan 6.6 memakai **curl** (pilihan).

Praktik ini memasang dua hal dari Konsep 9. Pertama, **CORS**: daftar halaman web yang boleh membaca jawaban backend dari browser, disiapkan untuk dashboard Modul 22. Kedua, **pemeriksaan asal**: satpam menolak perintah dari halaman yang tidak dikenal walaupun *cookie*-mu ikut terbawa.

#### 6.1 Pasang `@fastify/cors` (2 menit)

```text
npm install @fastify/cors@11.3.1
```

**Hasilnya** (**contoh**):

```text
added 1 package, and audited 226 packages in 2s

56 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 6.2 Setelan `CORS_ORIGIN` (5 menit)

Daftar asal yang diizinkan disimpan di `.env` supaya bisa diubah tanpa menyentuh kode. Buka **`src/config/env.ts`**, lalu tambahkan tiga baris ini (satu komentar dan dua baris kode) di dalam `z.object({ … })`, tepat di bawah setelan `JWT_SECRET`:

```ts
  // Modul 20: alamat halaman web (origin) yang boleh memanggil API ini dari browser, dipisah koma. Modul 22: Vite di 5173.
  CORS_ORIGIN: z.preprocess(kosong, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((teks) => teks.split(",").map((asal) => asal.trim()).filter((asal) => asal !== ""))),
```

- Kalau `CORS_ORIGIN` tidak ditulis di `.env`, nilainya `http://localhost:5173,http://127.0.0.1:5173`: alamat Vite yang dipakai Modul 22.
- **`.transform()`** memecah teks yang dipisahkan koma menjadi daftar (*array*), lalu membuang spasi dan isian kosong. Hasilnya, `env.CORS_ORIGIN` di kode lain sudah berupa daftar asal.

Tambahkan juga dua baris ini di paling bawah **`.env.example`** supaya teman satu tim tahu setelan itu ada:

```text
# Modul 20: halaman web (origin) yang boleh memanggil API dari browser, dipisah koma (Modul 22: Vite di port 5173)
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

`.env`-mu sendiri tidak perlu diubah sekarang: nilai bawaannya sudah benar.

#### 6.3 CORS dan pemeriksaan asal di `src/auth/keamanan.ts` (10 menit)

Buka **`src/auth/keamanan.ts`**, lalu ganti seluruh isinya dengan:

```ts
// keamanan.ts - pengaman API (Modul 20): CORS, cookie, JWT ("gelang konser"), rate limit, dan "satpam" yang memeriksa
// SETIAP permintaan HTTP: asal halaman (Origin), wajib login (kecuali daftar rute terbuka), dan akun viewer hanya boleh
// melihat.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.ts";
import type { Peran } from "../db/pengguna.ts";
import { UMUR_AKSES_DETIK, UMUR_SESI_DETIK } from "./token.ts";

// isi "gelang" (JWT akses): nomor akun (sub), perannya, dan nomor sesi (sid). Bukan rahasia: siapa pun yang memegang
// token bisa membaca isinya, jadi jangan menaruh email, nama, atau data pribadi lain di sini.
export interface IsiToken {
  sub: string;
  peran: Peran;
  sid: number;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: IsiToken; // yang ditandatangani reply.jwtSign
    user: IsiToken & { iat: number; exp: number }; // yang dibaca req.jwtVerify ke req.user
  }
}

export const COOKIE_AKSES = "akses";
export const COOKIE_SESI = "sesi";

// httpOnly: JavaScript di halaman tidak bisa membaca cookie (pencuri lewat XSS tidak mendapat token).
// sameSite strict: browser tidak mengirim cookie pada permintaan yang dipicu situs lain (CSRF).
// secure auto: atribut Secure dipasang kalau permintaannya lewat HTTPS (Fase 5); di http://127.0.0.1 tidak.
const DASAR = { httpOnly: true, sameSite: "strict", secure: "auto" } as const;
export const OPSI_AKSES = { ...DASAR, path: "/", maxAge: UMUR_AKSES_DETIK }; // path "/" WAJIB: tanpa itu hanya /auth/...
export const OPSI_SESI = { ...DASAR, path: "/auth", maxAge: UMUR_SESI_DETIK }; // hanya dikirim ke /auth/...

// Rute yang boleh diketuk TANPA login. Semua rute lain wajib login, termasuk rute baru yang kelak ditambahkan.
export const RUTE_TERBUKA = new Set([
  "POST /auth/login", "POST /auth/refresh", "POST /auth/logout",
  "GET /health", "HEAD /health", // HEAD: pemeriksa kesehatan seperti wget --spider (Docker, Fase 5)
]);
const MEMBACA = new Set(["GET", "HEAD"]); // satu-satunya metode yang boleh dipakai akun viewer
// Halaman web (origin) yang boleh MENGUBAH sesuatu lewat browser: daftar CORS + server ini sendiri (Swagger UI di /docs).
export const ASAL_BOLEH = new Set([...env.CORS_ORIGIN, `http://${env.HOST}:${env.PORT}`, `http://localhost:${env.PORT}`]);

export async function pasangKeamanan(app: FastifyInstance): Promise<void> {
  // CORS dipasang PALING DULU: preflight (OPTIONS) dari browser tidak membawa cookie, jadi harus dijawab sebelum satpam.
  await app.register(cors, {
    origin: env.CORS_ORIGIN, // daftar persis, bukan "*": dengan credentials, "*" ditolak browser
    credentials: true, // izinkan browser mengirim cookie dari halaman di origin itu
    methods: ["GET", "HEAD", "POST", "PUT"], // PUT /rules/:id; bawaan plugin hanya GET, HEAD, POST
  });
  await app.register(cookie); // tanpa secret: JWT sudah bertanda tangan, refresh token dicek ke database
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: COOKIE_AKSES, signed: false },
    sign: { expiresIn: UMUR_AKSES_DETIK }, // angka = detik (900); teks seperti "1h30m" ditolak sejak 10.2.3
    verify: { onlyCookie: true }, // gelang hanya dibaca dari cookie, bukan dari header Authorization
  });
  await app.register(rateLimit, {
    global: false, // hanya rute yang memintanya (POST /auth/login); hitungan disimpan di memori: restart = mulai dari nol
    errorResponseBuilder: (_req, konteks) => Object.assign(
      new Error(`terlalu banyak percobaan: coba lagi dalam ${Math.ceil(konteks.ttl / 1000)} detik`),
      { statusCode: konteks.statusCode }, // 429
    ),
  });
  app.addHook("onRequest", satpam); // satu satpam di pintu depan: berlaku untuk SEMUA rute
}

async function satpam(req: FastifyRequest, reply: FastifyReply) {
  // CSRF: <form> di halaman lain pada host yang sama (misalnya aplikasi lain di http://127.0.0.1:3000) tetap membawa
  // cookie SameSite=Strict karena masih satu "site". Browser selalu menulis header Origin pada POST/PUT; curl, Bruno, dan
  // Node tidak menulisnya, jadi mereka tidak terganggu.
  const asal = req.headers.origin;
  if (!MEMBACA.has(req.method) && asal !== undefined && !ASAL_BOLEH.has(asal)) {
    req.log.warn(`ditolak (403): ${req.method} ${req.url} dari halaman ${asal}`);
    return reply.code(403).send({ pesan: `permintaan dari halaman ${asal} ditolak` });
  }
  const url = req.routeOptions.url; // pola rute, misalnya /devices/:id/command (undefined = tidak ada: tamu 401, sudah login 404)
  if (RUTE_TERBUKA.has(`${req.method} ${url}`) || url === "/docs" || url?.startsWith("/docs/")) return;
  try {
    await req.jwtVerify(); // ada cookie akses? tanda tangannya asli? belum kedaluwarsa? isinya masuk req.user
  } catch {
    return reply.code(401).send({ pesan: "belum login atau sesi sudah habis: login lewat POST /auth/login" });
  }
  if (req.user.peran !== "admin" && !MEMBACA.has(req.method)) { // diperiksa SEBELUM isi permintaan divalidasi
    req.log.warn(`ditolak (403): akun ${req.user.sub} (${req.user.peran}) mencoba ${req.method} ${req.url}`);
    return reply.code(403).send({ pesan: "akun viewer hanya boleh melihat; perintah dan perubahan khusus admin" });
  }
}
```

- **`ASAL_BOLEH`** adalah daftar halaman yang boleh **mengubah** sesuatu lewat browser: isi `CORS_ORIGIN`, ditambah backend itu sendiri, yaitu `http://127.0.0.1:8080` dan `http://localhost:8080`. Dua yang terakhir membuat **Try it out** di `/docs` tetap bisa mengirim `POST`.
- **`app.register(cors, …)`** dipasang **paling dulu**, sebelum *cookie*, JWT, dan satpam. *Preflight* `OPTIONS` dari browser tidak membawa *cookie*, jadi ia harus dijawab sebelum satpam sempat menolaknya dengan 401 (Konsep 9). `credentials: true` mengizinkan halaman dari asal itu mengirim *cookie*, dan `methods` ditambah `PUT` untuk `PUT /rules/:id`.
- **Langkah pertama satpam kini memeriksa asal.** Untuk permintaan selain `GET` dan `HEAD`, kalau kepala `Origin` ada dan tidak termasuk `ASAL_BOLEH`, jawabannya **403** `permintaan dari halaman … ditolak`, dan log mencatat `WARN`. Permintaan **tanpa** kepala `Origin`, seperti dari Bruno, curl, dan terminal kecil, tidak terpengaruh karena hanya browser yang menulis kepala itu.

Simpan, lalu jalankan `npm run cek` (tanpa pesan galat).

#### 6.4 "Mengapa browser menolak?" di DevTools (10 menit)

Pesan CORS hanya muncul di browser, jadi lihat langsung di sana. Untuk percobaan ini kita memanfaatkan aturan dari Konsep 9: `http://localhost:8080` dan `http://127.0.0.1:8080` adalah **dua asal berbeda** walaupun backend-nya sama.

1. Pastikan `npm run dev` berjalan, lalu buka **`http://localhost:8080/docs`** di Chrome atau Edge. Kali ini memang `localhost` supaya halaman ini punya asal yang lain.
2. Tekan **F12** (macOS: **Cmd + Option + I**) untuk membuka DevTools, lalu pilih tab **Console**.
3. **Ketik** (jangan tempel; Chrome menolak kode yang ditempel ke Console sampai kamu mengetik `allow pasting`) perintah ini, lalu tekan **Enter**:

   ```js
   await (await fetch("http://127.0.0.1:8080/health")).json()
   ```

   Halaman dari asal `http://localhost:8080` meminta jawaban dari asal `http://127.0.0.1:8080`, dan asal halaman itu belum ada di `CORS_ORIGIN`. Console menulis pesan merah: itu memang yang diharapkan, dan artinya dijelaskan di bawah gambar.
4. Buka `.env` di folder `backend` (bukan `bruno/.env`), tambahkan baris `CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080`, lalu simpan. `npm run dev` memulai ulang backend.
5. Kembali ke Console, tekan **↑** untuk memanggil lagi perintah tadi, lalu tekan **Enter**.

![Tangkapan layar Chrome DevTools, tab Console, Praktik 6.4; port lab penulis 8201, di laptopmu 8080. Atas, bertanda 1, sebelum: asal http://localhost:8201 belum ada di CORS_ORIGIN. Console menampilkan baris merah Access to fetch at http://127.0.0.1:8201/health from origin http://localhost:8201 has been blocked by CORS policy: No Access-Control-Allow-Origin header is present on the requested resource, lalu Failed to load resource: net::ERR_FAILED, baris blocked by CORS policy yang sama sekali lagi, dan baris GET http://127.0.0.1:8201/health net::ERR_FAILED 200 (OK); baris pertama dan baris terakhir diberi bingkai. Bawah, bertanda 2, sesudah: asal halaman itu ditambahkan ke CORS_ORIGIN dan backend dimulai ulang. Console menampilkan perintah await (await fetch(http://127.0.0.1:8201/health)).json() dan hasilnya ok: true, broker: true, database: true, diterima: 13, ditolak: 0, yang diberi bingkai. Keterangan bawah: 1 merah, blocked by CORS policy; baris GET …/health … 200 (OK) berarti backend sudah menjawab, browser yang menahan; 2 isi jawaban kini sampai ke halaman karena kepala access-control-allow-origin ada di jawaban backend.](aset/cors-di-devtools.png)

- **Sebelum** (**1**): Console menulis `Access to fetch at 'http://127.0.0.1:8080/health' from origin 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.` Perintahmu sendiri berakhir dengan galat `TypeError: Failed to fetch`. Perhatikan juga baris `GET http://127.0.0.1:8080/health net::ERR_FAILED 200 (OK)`. Backend sudah menjawab **200**, dan log backend pun mencatat `GET /health -> 200`, tetapi browser menolak menyerahkan jawaban itu ke halaman. Itulah inti CORS: **browser** yang menahan, bukan backend. Di tangkapan **1**, `fetch` dijalankan dua kali oleh skrip penulis, jadi pesan merahnya muncul dua kali, sedangkan baris perintah dan galat `TypeError`-nya tidak tampak.
- **Sesudah** (**2**): asal halaman sudah terdaftar, jadi backend menambahkan kepala `access-control-allow-origin: http://localhost:8080` ke jawabannya, dan isinya sampai ke halaman, yaitu `{ok: true, broker: true, database: true, …}`.

Hapus lagi baris `CORS_ORIGIN` yang tadi kamu tambahkan di `.env` (nilai bawaannya sudah benar), lalu simpan. Mulai sekarang, kalau Modul 22 menulis `CORS error`, kamu tahu tempat memeriksanya: asal halaman, isi `CORS_ORIGIN`, dan urutan CORS sebelum satpam.

#### 6.5 (Pilihan) Melihat *preflight* dengan curl

Browser mengirim *preflight* tanpa terlihat. Dengan curl, kamu bisa mengirimnya sendiri dan melihat jawabannya. Asal yang terdaftar:

```text
curl.exe -i -X OPTIONS http://127.0.0.1:8080/devices/a4cf12e5b7c0/command -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

**Hasilnya** (**contoh**):

```text
HTTP/1.1 204 No Content
vary: Origin, Access-Control-Request-Headers
access-control-allow-origin: http://localhost:5173
access-control-allow-credentials: true
access-control-allow-methods: GET, HEAD, POST, PUT
access-control-allow-headers: content-type
content-length: 0
```

Ulangi dengan `-H "Origin: http://iseng.test"`. Jawabannya tetap `204`, tetapi baris **`access-control-allow-origin` hilang**. Tanpa baris itu, browser menolak mengirim permintaan sebenarnya. Perhatikan juga bahwa *preflight* dijawab tanpa *cookie* dan tanpa gelang: CORS memang bekerja sebelum satpam.

#### 6.6 Perintah dari halaman asing ditolak (5 menit)

Tiru browser yang mengirim perintah dari halaman lain di laptopmu, misalnya `http://127.0.0.1:5500`. Kalau kamu membuat `login.json` di Praktik 2.10, buat juga berkas **`perintah.json`** di folder `backend` berisi `{"target":"lampu","nilai":true}` (bukan rahasia; boleh dihapus sesudahnya). *Login* dulu, lalu kirim perintah lampu dengan *cookie* `admin` **dan** kepala `Origin` halaman asing:

```text
curl.exe -s -o NUL -c kue.txt -H "content-type: application/json" --data-binary "@login.json" http://127.0.0.1:8080/auth/login
curl.exe -i -b kue.txt -H "Origin: http://127.0.0.1:5500" -H "content-type: application/json" --data-binary "@perintah.json" http://127.0.0.1:8080/devices/a4cf12e5b7c0/command
```

Jalankan kedua perintah itu di terminal kedua (folder `backend`). Jalur laptop memakai `f00d00000001` sebagai pengganti `a4cf12e5b7c0`, dan pengguna macOS menulis `curl` serta `-o /dev/null` sebagai pengganti `curl.exe` dan `-o NUL`. Isi JSON sengaja dibaca dari berkas karena tanda petik di dalam perintah diperlakukan berbeda oleh Windows PowerShell 5.1 dan PowerShell 7 (Praktik 2.10).

**Hasilnya** (**contoh**):

```text
HTTP/1.1 403 Forbidden
vary: Origin
access-control-allow-credentials: true
content-type: application/json; charset=utf-8
content-length: 65

{"pesan":"permintaan dari halaman http://127.0.0.1:5500 ditolak"}
```

*Cookie*-nya sah dan perannya `admin`, tetapi satpam menolaknya **sebelum** gelang diperiksa karena asalnya tidak dikenal. Bruno tidak terpengaruh: kirim `nyalakan lampu` sebagai `admin` di Bruno, dan jawabannya tetap 200 karena Bruno tidak menulis kepala `Origin`. Kalau Node 1 atau simulator sedang tidak menyala, rute perintah menjawab 409, 503, atau 504, tetapi tetap bukan 403.

**Bukti dari browser sungguhan.** Penulis menjalankan halaman kecil di `http://127.0.0.1:8202` (alamat lain di laptop yang sama) yang otomatis mengirim `<form method="POST" enctype="text/plain">` ke `http://127.0.0.1:8080/rules/3/jalankan` ketika browser yang sama sudah *login* sebagai `admin`. Isinya sengaja teks polos karena formulir biasa (`application/x-www-form-urlencoded`) sudah dijawab `415` oleh Fastify sebelum sampai ke rute, sedangkan teks polos diterima (🔬 "Lapisan tambahan melawan CSRF"). Hasilnya:

| Kode backend | Jawaban yang tampil di browser |
| :--- | :--- |
| Praktik 5 (tanpa pemeriksaan asal) | `{"pesan":"aturan 3 tidak aktif"}`: permintaan **sampai ke rute** karena *cookie* `admin` ikut terbawa (satu situs). Kalau aturan 3 aktif, pompa ikut menyiram. |
| Praktik 6 (dengan pemeriksaan asal) | `{"pesan":"permintaan dari halaman http://127.0.0.1:8202 ditolak"}`: satpam menolak **sebelum** rute berjalan. |

Log backend versi Praktik 6 (**contoh**):

```text
[12:35:37] WARN: ditolak (403): POST /rules/3/jalankan dari halaman http://127.0.0.1:8202
[12:35:37] INFO: POST /rules/3/jalankan -> 403 (1 ms)
```

Inilah celah *same-site* dari Konsep 9: `SameSite=Strict` tidak menahan halaman lain di host yang sama, tetapi pemeriksaan asal menahannya.

#### 6.7 Simpan ke cabang (2 menit)

```text
git add package.json package-lock.json .env.example src/config/env.ts src/auth/keamanan.ts
git commit -m "CORS untuk dashboard dan pemeriksaan asal di satpam (Modul 20 Praktik 6)"
```

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 10](#10-socketio-ikut-dikunci-pintu-aula-memakai-gelang-yang-sama) sebelum Praktik 7.

### Praktik 7 — Socket.IO ikut dikunci (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan beberapa terminal: backend (`npm run dev`, folder `backend`), terminal kedua di folder `backend` untuk `npm run cek`, `npm run pengguna`, dan `git`, serta terminal kecil (folder `alat`). **Jalur perangkat:** Node 1 menyala. **Jalur laptop:** simulator Modul 19 untuk `f00d00000001` menyala di terminalnya sendiri (folder `alat`, dengan perintah `node simulator-perangkat.js mqtt://127.0.0.1:1883 1` seperti di Praktik 3); jangan mengetik perintah lain di terminal simulator karena simulator membaca setiap baris sebagai perintah suhu.
>
> ⭐ **Wajib** — API dan sambungan *realtime* sama-sama terkunci.

Tabel Praktik 3.4 menyisakan satu pintu yang terbuka: `/socket.io/` dijawab 200 tanpa *login*. Praktik ini memasang penjaga pintu aula dari Konsep 10, lalu memperbarui terminal kecil supaya *login* dulu sebelum menyambung.

#### 7.1 Penjaga pintu aula: `src/services/realtime.ts` (15 menit)

Buka **`src/services/realtime.ts`**, lalu ganti seluruh isinya dengan:

```ts
// realtime.ts - Socket.IO: data mengalir ke terminal dan browser tanpa refresh (Modul 19), dikunci di Modul 20.
// Setiap perangkat punya satu room bernama "perangkat:<device_id>". Klien yang ingin melihat satu perangkat mengirim
// "ikuti", lalu hanya menerima telemetry perangkat itu. Perubahan status dan buku kejadian dikirim ke semua klien.
// Socket.IO menjawab sendiri permintaan /socket.io/ SEBELUM Fastify melihatnya, jadi satpam Fastify (hook onRequest) TIDAK
// menjaga pintu ini: Socket.IO punya penjaga sendiri (allowRequest + io.use) dengan aturan dan cookie yang sama.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/kontrak.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import type { Kejadian } from "../db/arsip.ts";
import { cariPerangkat } from "./gudang.ts";
import { env } from "../config/env.ts";
import { ASAL_BOLEH, COOKIE_AKSES } from "../auth/keamanan.ts";
import type { IsiToken } from "../auth/keamanan.ts";

type Telemetry = TelemetryNode1 | TelemetryNode2;

// jawaban server untuk "ikuti" (ack Socket.IO): berhasil atau tidak, dan bacaan terakhir perangkat itu
interface JawabanIkuti {
  ok: boolean;
  pesan?: string;
  terbaru?: Telemetry | null;
}

// acara dari server ke klien, beserta isinya
interface KeKlien {
  telemetry: (deviceId: string, isi: Telemetry) => void;
  status: (deviceId: string, status: Status) => void;
  kejadian: (kejadian: Kejadian) => void;
}

// acara dari klien ke server; "balas" adalah ack Socket.IO
interface DariKlien {
  ikuti: (deviceId: string, balas: (jawaban: JawabanIkuti) => void) => void;
  berhenti: (deviceId: string) => void;
}

// Modul 20: data yang diingat server untuk setiap klien: isi gelangnya (JWT akses) saat tersambung
interface DataSoket {
  pengguna: IsiToken & { iat: number; exp: number };
}

let io: Server<DariKlien, KeKlien, Record<string, never>, DataSoket> | undefined;

export function mulaiRealtime(app: FastifyInstance): void {
  io = new Server<DariKlien, KeKlien, Record<string, never>, DataSoket>(app.server, { // menumpang di server HTTP Fastify
    cors: { origin: env.CORS_ORIGIN, credentials: true }, // daftar origin yang sama dengan API (Modul 22)
    // Modul 20: asal halaman diperiksa dengan aturan yang SAMA dengan satpam: tanpa Origin = klien Node (terminal kecil)
    allowRequest: (req, jawab) => jawab(null, req.headers.origin === undefined || ASAL_BOLEH.has(req.headers.origin)),
  });
  // Modul 20: penjaga pintu Socket.IO. Berjalan sekali saat klien menyambung (handshake), dengan cookie yang sama.
  io.use((socket, next) => {
    const cookie = app.parseCookie(socket.request.headers.cookie ?? "");
    const token = cookie[COOKIE_AKSES];
    if (token === undefined) return next(new Error("belum login"));
    try {
      socket.data.pengguna = app.jwt.verify<IsiToken & { iat: number; exp: number }>(token);
      next();
    } catch {
      next(new Error("sesi habis atau tidak sah: refresh atau login lagi"));
    }
  });
  io.on("connection", (socket) => {
    const { sub, peran, sid, exp } = socket.data.pengguna;
    app.log.info(`klien realtime tersambung: ${socket.id} (akun ${sub}, ${peran})`);
    void socket.join(`sesi:${sid}`); // logout sesi ini = putuskan semua sambungannya (putuskanSesi)
    // gelang hanya diperiksa di pintu: saat kedaluwarsa, sambungan diputus; klien refresh lalu menyambung lagi
    const habis = setTimeout(() => socket.disconnect(true), exp * 1000 - Date.now());
    socket.on("ikuti", (deviceId, balas) => {
      if (typeof balas !== "function") return; // klien tidak meminta jawaban: abaikan
      if (!DeviceId.safeParse(deviceId).success) { // jangan percaya klien, sama seperti jangan percaya perangkat
        return balas({ ok: false, pesan: "device_id harus 12 digit heksadesimal huruf kecil" });
      }
      socket.join(`perangkat:${deviceId}`);
      app.log.info(`klien ${socket.id} mengikuti ${deviceId}`);
      // pesan yang terlewat saat klien terputus tidak dikirim ulang, jadi kirim bacaan terakhirnya sekarang
      balas({ ok: true, terbaru: cariPerangkat(deviceId)?.telemetry ?? null });
    });
    socket.on("berhenti", (deviceId) => {
      socket.leave(`perangkat:${deviceId}`);
    });
    socket.on("disconnect", (alasan) => {
      clearTimeout(habis);
      app.log.info(`klien realtime terputus: ${socket.id} (${alasan})`);
    });
  });
  // Saat server ditutup dengan rapi, putuskan semua klien Socket.IO lebih dulu; kalau tidak, app.close() menunggu mereka.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
}

// Modul 20: logout atau sesi dicabut -> putuskan semua sambungan Socket.IO milik sesi itu
export function putuskanSesi(sid: number): void {
  io?.in(`sesi:${sid}`).disconnectSockets(true);
}

// kirim satu telemetry HANYA ke klien yang mengikuti perangkat itu
export function siarkanTelemetry(deviceId: string, isi: Telemetry): void {
  io?.to(`perangkat:${deviceId}`).emit("telemetry", deviceId, isi);
}

// kirim perubahan status ke SEMUA klien
export function siarkanStatus(deviceId: string, status: Status): void {
  io?.emit("status", deviceId, status);
}

// kirim satu baris buku kejadian ke SEMUA klien
export function siarkanKejadian(kejadian: Kejadian): void {
  io?.emit("kejadian", kejadian);
}
```

Yang baru dibandingkan Modul 19:

- **`allowRequest`** memeriksa asal halaman dengan daftar **`ASAL_BOLEH`** yang sama dengan satpam HTTP. Klien tanpa kepala `Origin`, seperti terminal kecil, boleh lanjut ke pemeriksaan gelang; halaman browser dari asal yang tidak dikenal ditolak `403` di sini.
- **`cors`** memakai `CORS_ORIGIN` yang sama dengan API, untuk dashboard Modul 22.
- **`io.use()`** adalah penjaga pintu aula. Ia membaca kepala `Cookie` permintaan *handshake* dengan `app.parseCookie()`, mengambil gelang `akses`, lalu memeriksanya dengan `app.jwt.verify()`, yaitu stempel yang sama dengan satpam. Kalau tidak ada gelang, klien ditolak dengan `belum login`; kalau gelangnya palsu atau basi, dengan `sesi habis atau tidak sah: refresh atau login lagi`. Kalau lolos, isi gelang disimpan di `socket.data.pengguna`.
- **`socket.join("sesi:<sid>")`** memasukkan setiap sambungan ke *room* sesinya, dan **`putuskanSesi()`** memutus semua sambungan di *room* itu.
- **`setTimeout(…, exp * 1000 - Date.now())`** memutus sambungan tepat saat gelangnya kedaluwarsa (`exp` dalam detik, `Date.now()` dalam milidetik), dan `clearTimeout()` membatalkannya kalau klien sudah terputus lebih dulu.
- Log `klien realtime tersambung` kini menyebut nomor akun dan perannya.

#### 7.2 *Logout* dan kartu curian ikut memutus sambungan (5 menit)

Loket `/auth` perlu memberi tahu pintu aula saat sebuah sesi berakhir. Buka **`src/routes/auth.ts`**, lalu buat tiga perubahan kecil:

1. Di bawah baris `import type { Pengguna } from "../db/pengguna.ts";`, tambahkan:

   ```ts
   import { putuskanSesi } from "../services/realtime.ts";
   ```

2. Di rute `POST /auth/refresh`, cari baris `await hapusSesi(lama.id);` (bagian kartu lama yang dicurigai dicuri), lalu tambahkan satu baris tepat di bawahnya:

   ```ts
           putuskanSesi(lama.id); // Modul 20 Praktik 7: sambungan Socket.IO sesi itu ikut diputus
   ```

3. Di rute `POST /auth/logout`, ganti baris `if (sid !== undefined) req.log.info(`… dengan:

   ```ts
       if (sid !== undefined) {
         putuskanSesi(sid); // Modul 20 Praktik 7: sambungan Socket.IO sesi ini ikut diputus
         req.log.info(`logout: sesi ${sid}`);
       }
   ```

   Sesuaikan juga `summary` rute itu supaya `/docs` menjelaskannya: `"Logout: sesi di database dihapus, kedua cookie dikosongkan, sambungan Socket.IO sesi ini diputus"`.

Di `src/server.ts`, cukup perbarui komentar baris `mulaiRealtime(app);` menjadi `// Modul 19: Socket.IO di alamat /socket.io/ (Modul 20: ikut dikunci)`. Kodenya tidak berubah karena `realtime.ts` kini membaca `env` dan `ASAL_BOLEH` sendiri.

Simpan semuanya, lalu jalankan `npm run cek` (tanpa pesan galat).

#### 7.3 Terminal Modul 19 kini ditolak (3 menit)

Buka terminal baru untuk terminal kecil (**Terminal → New Terminal**; terminal baru selalu mulai di folder `rumah-pintar-mini`), masuk ke folder `alat`, lalu jalankan terminal kecil **versi Modul 19** seperti biasa (untuk jalur perangkat, pakai `device_id` Node 1-mu):

```text
cd alat
node terminal-live.js http://127.0.0.1:8080 f00d00000001
```

**Hasilnya** (**contoh**):

```text
[13.34.36] belum bisa tersambung: belum login
```

Terminal itu menulis satu baris, lalu selesai sendiri. Penjaga pintu aula menolaknya karena tidak membawa gelang, dan Socket.IO tidak mencoba menyambung lagi setelah ditolak penjaga: mengulang permintaan yang sama tidak akan mengubah jawabannya.

#### 7.4 Terminal kecil versi Modul 20 (15 menit)

Terminal kecil kini harus *login* sendiri. Ia memakai akun **`viewer`**: terminal itu hanya melihat, jadi tidak perlu hak `admin` (hak sekecil mungkin, Konsep 1).

1. Di Explorer, klik dulu ruang kosong, lalu klik kanan folder **`alat`** → **New File…**, beri nama **`.env.example`**, dan ketik:

   ```text
   # Salin file ini menjadi .env (di folder alat), lalu isi akun untuk terminal-live.js. File .env tidak ikut Git.
   # Pakai akun viewer: terminal kecil hanya melihat, jadi tidak perlu hak admin.
   EMAIL_TERMINAL=viewer@rumah.test
   SANDI_TERMINAL=
   ```

2. Buka **`alat/.gitignore`**, lalu tambahkan dua baris ini di paling bawah supaya `alat/.env` tidak pernah ikut Git, bahkan sebelum file itu dibuat:

   ```text
   # Modul 20: akun terminal-live.js (berisi sandi), contohnya di .env.example
   .env
   ```

3. Sekarang buat **`alat/.env`** dengan isi yang sama dengan `.env.example`, lalu isi `SANDI_TERMINAL=` dengan sandi akun `viewer` dari Praktik 1.7. Kalau sandimu mengandung tanda `#`, apit nilainya dengan petik ganda (`SANDI_TERMINAL="…"`), seperti di `bruno/.env`: tanpa petik, Node.js membuang semua yang ada sesudah `#`.

4. Buka **`alat/terminal-live.js`**, lalu ganti seluruh isinya dengan:

   ```js
   // terminal-live.js — "terminal kecil" yang menampilkan bacaan live SATU perangkat lewat Socket.IO. Modul 19, dikunci di Modul 20.
   // Butuh library socket.io-client:  npm install socket.io-client@4.8.4
   // Modul 20: butuh file alat/.env (tidak ikut Git) berisi akun untuk terminal ini; contohnya di alat/.env.example.
   // Jalankan (backend harus menyala):  node --env-file=.env terminal-live.js http://127.0.0.1:8080 f00d00000001
   // Berhenti: Ctrl + C

   import { io } from "socket.io-client";

   const alamat = process.argv[2] || "http://127.0.0.1:8080";
   const deviceId = process.argv[3];
   if (deviceId === undefined) {
     console.log("Tulis device_id perangkatnya, misalnya: node --env-file=.env terminal-live.js http://127.0.0.1:8080 f00d00000001");
     process.exit(1);
   }
   // Modul 20: akun untuk terminal ini. Cukup akun viewer: terminal hanya melihat (hak sekecil mungkin).
   const email = process.env.EMAIL_TERMINAL;
   const sandi = process.env.SANDI_TERMINAL;
   if (!email || !sandi) {
     console.log("Isi EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env, lalu jalankan dengan: node --env-file=.env terminal-live.js …");
     process.exit(1);
   }

   const jam = () => new Date().toLocaleTimeString("id-ID"); // jam laptop, misalnya 07.15.02
   const kue = new Map(); // cookie dari backend: "akses" (gelang 15 menit) dan "sesi" (kartu terusan 7 hari)

   // simpan cookie dari header Set-Cookie, misalnya "akses=eyJ…; Max-Age=900; Path=/; HttpOnly; SameSite=Strict".
   // Yang disimpan hanya bagian sebelum titik koma pertama; nilai kosong = cookie dihapus server.
   function simpanCookie(jawaban) {
     for (const teks of jawaban.headers.getSetCookie()) {
       const [nama, ...nilai] = teks.split(";")[0].split("=");
       if (nilai.join("=") === "") kue.delete(nama);
       else kue.set(nama, nilai.join("="));
     }
   }

   // login dengan email dan sandi: jawabannya membawa cookie akses dan sesi
   async function login() {
     const jawaban = await fetch(`${alamat}/auth/login`, {
       method: "POST",
       headers: { "content-type": "application/json" },
       body: JSON.stringify({ email, sandi }),
     });
     if (!jawaban.ok) throw new Error(`login ditolak (${jawaban.status})`);
     simpanCookie(jawaban);
     console.log(`[${jam()}] login sebagai ${email}`);
   }

   // gelang habis: tukar kartu terusan (cookie sesi) dengan gelang baru, tanpa login ulang (baris sesi tidak bertambah)
   async function refresh() {
     if (!kue.has("sesi")) return false;
     const jawaban = await fetch(`${alamat}/auth/refresh`, { method: "POST", headers: { cookie: `sesi=${kue.get("sesi")}` } });
     simpanCookie(jawaban);
     if (!jawaban.ok) {
       console.log(`[${jam()}] refresh ditolak (${jawaban.status}), login ulang`);
       return false;
     }
     console.log(`[${jam()}] gelang diperbarui (refresh)`);
     return true;
   }

   const socket = io(alamat, { autoConnect: false }); // jangan menyambung sebelum punya gelang

   // refresh dulu; kalau gagal, login ulang; lalu sambung dengan cookie akses di header handshake
   let gagalBeruntun = 0;
   async function perbaruiLaluSambung() {
     if (++gagalBeruntun > 3) { // ditolak terus walau gelang baru: jangan berputar-putar
       console.log(`[${jam()}] ditolak server terus-menerus; berhenti`);
       process.exit(1);
     }
     try {
       if (!(await refresh())) await login();
       socket.io.opts.extraHeaders = { cookie: `akses=${kue.get("akses")}` }; // dipakai setiap kali menyambung
       socket.connect();
     } catch (galat) {
       if (galat instanceof TypeError) { // fetch gagal: backend belum bisa dihubungi (misalnya sedang dimulai ulang)
         console.log(`[${jam()}] backend belum bisa dihubungi, coba lagi 5 detik lagi`);
         gagalBeruntun--;
         setTimeout(perbaruiLaluSambung, 5000);
         return;
       }
       console.log(`[${jam()}] ${galat.message}. Periksa EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env.`);
       process.exit(1);
     }
   }

   function tampilkan(id, isi, keterangan = "") {
     // kontrak 1.3: telemetry Node 1 membawa state, jadi keadaan kipas dan lampu ikut tampil
     const aktuator = isi.state ? `  kipas ${isi.state.kipas ? "NYALA" : "padam"}  lampu ${isi.state.lampu ? "NYALA" : "padam"}` : "";
     console.log(`[${jam()}] ${id}  suhu ${isi.suhu} °C  lembap ${isi.kelembapan} %  tanah ${isi.tanah} %${aktuator}${keterangan}`);
   }

   // "connect" terpanggil lagi setiap kali tersambung ulang. Room hilang saat terputus, jadi "ikuti" dikirim lagi di sini.
   socket.on("connect", async () => {
     gagalBeruntun = 0;
     console.log(`[${jam()}] tersambung ke ${alamat} (${socket.io.engine.transport.name})`);
     socket.io.engine.once("upgrade", (transport) => console.log(`[${jam()}] jalur ditingkatkan ke ${transport.name}`));
     try {
       const jawaban = await socket.timeout(5000).emitWithAck("ikuti", deviceId);
       if (!jawaban.ok) {
         console.log(`[${jam()}] ditolak server: ${jawaban.pesan}`);
         return;
       }
       console.log(`[${jam()}] mengikuti ${deviceId}`);
       if (jawaban.terbaru) tampilkan(deviceId, jawaban.terbaru, "  (bacaan terakhir)");
     } catch {
       console.log(`[${jam()}] server tidak menjawab "ikuti" dalam 5 detik`);
     }
   });

   socket.on("telemetry", (id, isi) => tampilkan(id, isi));
   socket.on("status", (id, status) => console.log(`[${jam()}] ${id} sekarang ${status}`));
   socket.on("kejadian", (kejadian) => console.log(`[${jam()}] kejadian: ${kejadian.pesan}`)); // buku kejadian (Modul 19)
   socket.on("connect_error", (galat) => {
     if (socket.active) { // gangguan sementara (misalnya backend sedang dimulai ulang): Socket.IO mencoba lagi sendiri
       console.log(`[${jam()}] belum bisa tersambung: ${galat.message}`);
     } else { // Modul 20: ditolak penjaga pintu Socket.IO (belum login atau gelang habis)
       console.log(`[${jam()}] ditolak server: ${galat.message}`);
       perbaruiLaluSambung();
     }
   });
   socket.on("disconnect", (alasan) => {
     console.log(`[${jam()}] terputus: ${alasan}`);
     // "io server disconnect" = server memutus kita dengan sengaja: gelang habis, logout, atau server dimatikan.
     // Socket.IO tidak menyambung ulang sendiri dalam keadaan itu: perbarui gelang dulu, lalu sambung lagi.
     if (alasan === "io server disconnect") perbaruiLaluSambung();
   });

   perbaruiLaluSambung(); // Modul 20: belum punya kartu terusan, jadi langkah pertamanya login
   ```

- **`--env-file=.env`** membuat Node.js membaca `alat/.env`, persis seperti backend. Email dan sandi tidak pernah ditulis di perintah.
- **`kue`** adalah `Map` (pemanasan Modul 19) tempat terminal menyimpan *cookie*-nya sendiri. **`simpanCookie()`** membaca setiap kepala `Set-Cookie` dengan `getSetCookie()`, lalu menyimpan bagian sebelum titik koma pertama. *Cookie* yang dikosongkan backend ikut dihapus.
- **`login()`** dan **`refresh()`** mengetuk loket yang sama dengan Bruno. Kartu terusan dikirim sendiri lewat kepala `cookie` karena Node.js tidak punya keranjang *cookie* seperti browser.
- **`io(alamat, { autoConnect: false })`** mencegah Socket.IO menyambung sebelum gelang siap. **`socket.io.opts.extraHeaders`** menempelkan gelang `akses` ke setiap *handshake*, termasuk sambungan ulang.
- **`perbaruiLaluSambung()`** mencoba *refresh* lebih dulu, baru *login* ulang kalau *refresh* gagal. Dengan begitu, terminal yang berjalan berjam-jam tidak membuat baris sesi baru setiap 15 menit. Kalau backend belum bisa dihubungi (`TypeError` dari `fetch`), ia mencoba lagi setiap 5 detik; kalau ditolak tiga kali berturut-turut walaupun gelangnya baru, ia berhenti.
- Saat diputus server (`io server disconnect`) atau ditolak penjaga (`connect_error` dengan `socket.active` bernilai `false`), terminal memperbarui gelangnya lalu menyambung lagi.

Di terminal kecil yang sama (folder `alat`), jalankan versi barunya. Untuk jalur perangkat, ganti `f00d00000001` dengan `device_id` Node 1-mu:

```text
node --env-file=.env terminal-live.js http://127.0.0.1:8080 f00d00000001
```

**Hasilnya** (**contoh**; jalur perangkat menampilkan bacaan Node 1-mu):

```text
[13.37.05] login sebagai viewer@rumah.test
[13.37.05] tersambung ke http://127.0.0.1:8080 (websocket)
[13.37.05] mengikuti f00d00000001
[13.37.05] f00d00000001  suhu 30.9 °C  lembap 75 %  tanah 37 %  kipas padam  lampu padam  (bacaan terakhir)
[13.37.06] f00d00000001  suhu 26.5 °C  lembap 82 %  tanah 21 %  kipas padam  lampu padam
[13.37.16] f00d00000001  suhu 27.1 °C  lembap 84 %  tanah 57 %  kipas padam  lampu padam
```

Log backend mencatat siapa yang menyambung (**contoh**):

```text
[13:37:05] INFO: login: akun 2 (viewer), sesi 34, IP 127.0.0.1
[13:37:05] INFO: POST /auth/login -> 200 (662 ms)
[13:37:05] INFO: klien realtime tersambung: pGSZ4nPaofFSwoaHAAAB (akun 2, viewer)
[13:37:05] INFO: klien pGSZ4nPaofFSwoaHAAAB mengikuti f00d00000001
```

Kalau terminal langsung berhenti dengan `Isi EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env, …`, berkas `alat/.env` belum diisi. Kalau Node.js menulis `.env: not found`, berkas itu belum dibuat di folder `alat`, atau kamu menjalankan perintahnya dari folder lain.

#### 7.5 Diputus saat gelang kedaluwarsa, lalu tersambung lagi (20 menit menunggu)

Biarkan terminal kecil berjalan lebih dari 15 menit sejak baris `login sebagai …`. Kamu boleh mengerjakan bagian lain sambil menunggu.

**Hasilnya** (**contoh**; tepat 15 menit setelah *login*):

```text
[13.52.00] f00d00000001  suhu 27.1 °C  lembap 81 %  tanah 48 %  kipas padam  lampu padam
[13.52.05] terputus: io server disconnect
[13.52.05] gelang diperbarui (refresh)
[13.52.05] tersambung ke http://127.0.0.1:8080 (polling)
[13.52.05] jalur ditingkatkan ke websocket
[13.52.05] mengikuti f00d00000001
[13.52.05] f00d00000001  suhu 27.1 °C  lembap 81 %  tanah 48 %  kipas padam  lampu padam  (bacaan terakhir)
```

Di log backend (**contoh**):

```text
[13:52:05] INFO: klien realtime terputus: pGSZ4nPaofFSwoaHAAAB (server namespace disconnect)
[13:52:05] INFO: POST /auth/refresh -> 200 (258 ms)
[13:52:05] INFO: klien realtime tersambung: xIGejogS7aYmtyWlAAAG (akun 2, viewer)
[13:52:05] INFO: klien xIGejogS7aYmtyWlAAAG mengikuti f00d00000001
```

Penjaga pintu aula memutus sambungan tepat saat gelangnya kedaluwarsa (`server namespace disconnect`). Terminal kecil menukar kartu terusannya dengan gelang baru, lalu menyambung lagi dengan nomor sambungan baru dalam waktu kurang dari satu detik, tanpa *login* ulang dan tanpa baris sesi baru.

**(Pilihan, sampai 15 menit) Sandi diganti dari luar backend.** Selagi terminal kecil berjalan, ganti sandi akun `viewer` dari terminal kedua (folder `backend`, bukan terminal simulator) dengan `npm run pengguna -- sandi viewer@rumah.test`, lalu catat sandi barunya di pengelola sandimu. Skrip itu menghapus semua sesi `viewer` di database, tetapi ia berjalan di proses terpisah, jadi tidak bisa memutus sambungan di backend. Terminal kecil tetap menampilkan bacaan sampai gelangnya habis, lalu (**contoh**):

```text
[14.07.05] terputus: io server disconnect
[14.07.05] refresh ditolak (401), login ulang
[14.07.05] login ditolak (401). Periksa EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env.
```

Kartu terusannya sudah dicabut, dan sandi lama di `alat/.env` tidak berlaku lagi, jadi terminal berhenti. Perbarui `SANDI_TERMINAL` di `alat/.env` dan `SANDI_VIEWER` di `backend/bruno/.env` dengan sandi baru, lalu jalankan lagi terminal kecilnya. Inilah batas yang jujur dari Konsep 10: sesi yang dicabut dari luar backend baru berakhir saat gelangnya kedaluwarsa.

#### 7.6 *Logout* memutus sambungan sesi itu

Terminal kecil punya sesinya sendiri, terpisah dari sesi Bruno, jadi *logout* dari Bruno tidak memutusnya. Penulis menguji pemutusan ini dengan skrip kecil yang *login*, menyambung ke Socket.IO, lalu *logout* dari **sesi yang sama** (**contoh**, log backend):

```text
[13:39:44] INFO: login: akun 1 (admin), sesi 35, IP 127.0.0.1
[13:39:44] INFO: klien realtime tersambung: ngJH1yG4nMyvPMQ2AAAD (akun 1, admin)
[13:39:47] INFO: klien realtime terputus: ngJH1yG4nMyvPMQ2AAAD (server namespace disconnect)
[13:39:47] INFO: logout: sesi 35
[13:39:47] INFO: POST /auth/logout -> 200 (105 ms)
```

Sambungan diputus **saat itu juga**, sebelum jawaban *logout* dikirim. Hal yang sama terjadi saat kartu terusan lama dipakai lagi 30 detik atau lebih sesudah diganti: log menulis `klien realtime terputus: … (server namespace disconnect)` tepat sebelum `refresh token lama sesi 36 (akun 1) dipakai lagi: sesi dicabut`.

Satu batas tetap berlaku (Konsep 7): skrip itu juga mencoba menyambung lagi **sesudah** *logout* dengan salinan gelang yang belum kedaluwarsa, dan berhasil karena penjaga pintu aula hanya memeriksa gelang. Namun, gelang itu tidak bisa diperpanjang: *refresh* dengan kartu terusannya dijawab `401 sesi sudah tidak berlaku: silakan login lagi`, dan sambungannya diputus paling lambat saat gelang itu kedaluwarsa.

#### 7.7 (Pilihan) Pintu aula dari curl

Socket.IO selalu memulai sambungan dengan permintaan HTTP biasa (Modul 19). Tanpa *cookie*, permintaan pertama itu masih dijawab `200` karena penjaga `io.use()` baru bekerja saat klien meminta masuk aula. Yang menarik adalah asal halaman:

```text
curl.exe -i "http://127.0.0.1:8080/socket.io/?EIO=4&transport=polling" -H "Origin: http://iseng.test"
```

**Hasilnya** (**contoh**):

```text
HTTP/1.1 403 Forbidden
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json
Date: Thu, 22 Oct 2026 06:38:38 GMT
Connection: keep-alive
Keep-Alive: timeout=72
Transfer-Encoding: chunked

{"code":4,"message":"Forbidden"}
```

Ini jawaban `allowRequest`: asal `http://iseng.test` tidak ada di `ASAL_BOLEH`. Dengan `-H "Origin: http://localhost:5173"`, asal yang terdaftar untuk Modul 22, jawabannya `200` dan memuat `Access-Control-Allow-Origin: http://localhost:5173`. Kalau penulis melanjutkan sambungan tanpa *cookie* itu sampai meminta masuk aula, jawabannya memuat pesan `belum login` dari `io.use()`.

#### 7.8 Simpan ke cabang (2 menit)

Jalankan di terminal kedua, yang berada di folder `backend` (bukan di terminal yang sedang menjalankan backend, terminal kecil, atau simulator). Berkas di folder `alat` ditulis dengan jalur `../alat/…`:

```text
git add src/services/realtime.ts src/routes/auth.ts src/server.ts ../alat/terminal-live.js ../alat/.env.example ../alat/.gitignore
git commit -m "Socket.IO ikut dikunci; terminal kecil login dengan akun viewer (Modul 20 Praktik 7)"
```

Pastikan `alat/.env` tidak ikut: `git status` tidak boleh menyebutnya.

> ⬆️ **Selesai Praktik 7?** Kembali ke [Konsep 11](#11-rahasia-dan-privasi-yang-tidak-boleh-bocor) sebelum Praktik 8.

### Praktik 8 — Rahasia, privasi, dan uji kelulusan (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, dan terminal kedua untuk pemeriksaan dan Git), **Bruno**, dan **browser** yang sudah masuk ke GitHub.
>
> ⭐ **Wajib** — bukti bahwa rahasia tidak masuk ke log ataupun Git, dan gladi bersih ketiga syarat lulus Modul 20 dalam sekali jalan.

Semua kunci sudah terpasang. Sebelum pekerjaan minggu ini dikirim ke GitHub, backend diberi nomor versinya, lalu kamu memeriksa tiga hal yang tidak terlihat dari luar: log tidak membocorkan rahasia, file `.env` tidak ikut Git, dan GitHub ikut berjaga. Terakhir, ketiga syarat lulus diuji berurutan, seperti penguji yang datang memeriksa rumahmu.

#### 8.1 Backend v0.5.0 (5 menit)

Biarkan `npm run dev` tetap berjalan di terminal pertama. Di terminal kedua, pastikan kamu berada di folder `backend`: ujung baris perintahnya harus `backend>` (macOS: `backend %`). Lalu jalankan:

```text
npm version 0.5.0 --no-git-tag-version
```

**Hasilnya:**

```text
v0.5.0
```

Seperti di Modul 19, `npm version` mengubah nomor versi di `package.json` dan `package-lock.json` sekaligus, dan `--no-git-tag-version` mencegahnya membuat *commit* sendiri. Lalu perbarui tiga tempat yang masih menyebut versi lama:

1. Di **`backend/package.json`**, ganti baris `"description"` dengan:

   ```json
     "description": "Backend Rumah Pintar Mini (Modul 16-20): mendengar MQTT, memeriksa kontrak data, menyimpan semua pesan ke database deret waktu, menyediakan API riwayat, data realtime, perintah, aturan otomatis, jadwal, dan notifikasi Telegram, serta login dengan peran admin dan viewer",
   ```

2. Di **`backend/src/server.ts`**, ganti dua baris komentar paling atas dengan:

   ```ts
   // server.ts - pintu masuk backend Rumah Pintar Mini v0.5 (Modul 20: login, JWT di cookie, peran, dan pengaman API, di atas
   // Modul 19: data realtime, perintah satu pintu, aturan otomatis, jadwal, dan notifikasi Telegram).
   ```

   Ganti juga baris `await pasangKeamanan(app);` beserta komentarnya karena satpam kini dibantu CORS dan jam pasir:

   ```ts
   await pasangKeamanan(app); // Modul 20: CORS, cookie, JWT, rate limit, dan satpam di setiap permintaan (SEBELUM rute)
   ```

3. Masih di `server.ts`, ganti baris `info: { title: "Rumah Pintar Mini API", description: "Backend v0.4 (Modul 19)", version: "0.4.0" },` dengan:

   ```ts
       info: {
         title: "Rumah Pintar Mini API",
         description: "Backend v0.5 (Modul 20). Semua rute butuh login, kecuali yang tidak bergembok. Login dulu lewat "
           + "POST /auth/login (Try it out): browser menyimpan cookie akses dan mengirimnya sendiri ke rute lain. "
           + "Akun viewer hanya boleh melihat (GET); perintah dan perubahan dijawab 403.",
         version: "0.5.0",
       },
   ```

Simpan, lalu jalankan `npm run cek` di terminal kedua (tanpa pesan galat). Backend di terminal pertama sudah dimulai ulang sendiri saat `server.ts` disimpan. Buka `http://127.0.0.1:8080/docs`: judulnya kini menyebut `0.5.0`, dan di bawahnya tertulis cara *login* lewat **Try it out**. Teman satu tim yang baru pertama kali membuka `/docs` langsung tahu bahwa pintu-pintunya terkunci dan bagaimana cara masuknya.

#### 8.2 Log yang tidak membocorkan apa-apa (5 menit)

Konsep 11 berjanji bahwa log hanya mencatat metode, alamat, kode jawaban, nomor akun, dan alamat IP percobaan *login*. Buktikan dengan log-mu sendiri.

1. Di Bruno, kirim berurutan: **`login admin`**, **`refresh`**, **`siapa saya`**, **`login salah`**, dan **`logout`**. Sekarang log backend memuat *login* yang berhasil, kartu terusan yang diganti, *login* yang gagal, dan *logout*.
2. Klik di dalam terminal tempat `npm run dev` berjalan, lalu tekan **Ctrl + F** (macOS: **Cmd + F**). Kotak pencarian muncul di pojok kanan atas terminal.
3. Ketik kata-kata di bawah ini satu per satu. Setiap kali, kotak pencarian harus menulis `No results`:
   - `eyJ`, awal setiap gelang JWT (pemanasan langkah 3);
   - `akses=` dan `sesi=`, nama kedua *cookie*;
   - `@rumah.test`, atau bagian belakang email akunmu;
   - delapan huruf pertama sandi `admin`-mu (jangan terlalu pendek: tiga atau empat huruf bisa kebetulan cocok dengan kata biasa di log, misalnya `login` atau `sesi`).

Yang **ada** di log hanyalah baris-baris seperti ini (**contoh**; penulis merekamnya sesudah gladi 8.5, jadi jam dan nomor sesinya lebih besar daripada log di 8.5):

```text
[14:32:01] INFO: login: akun 1 (admin), sesi 38, IP 127.0.0.1
[14:32:01] INFO: POST /auth/login -> 200 (313 ms)
[14:32:01] INFO: POST /auth/refresh -> 200 (8 ms)
[14:32:02] INFO: GET /auth/me -> 200 (6 ms)
[14:32:02] WARN: login gagal: akun 1 (IP 127.0.0.1)
[14:32:02] INFO: POST /auth/login -> 401 (429 ms)
[14:32:02] INFO: logout: sesi 38
[14:32:02] INFO: POST /auth/logout -> 200 (5 ms)
```

Akun disebut dengan **nomor**, bukan email. *Login* dengan email yang tidak terdaftar pun hanya ditulis `email tidak terdaftar`, tanpa email yang dicoba (Praktik 2). Alamat IP sengaja dicatat untuk percobaan *login* supaya penebak sandi terlihat. Penulis menjalankan pencarian yang sama pada **seluruh** log backend selama modul ini ditulis, yaitu 740 baris: tidak satu baris pun memuat `eyJ`, `akses=`, `sesi=`, kata `cookie`, `@rumah.test`, kata `sandi`, ataupun isi sandi dan `JWT_SECRET` lab.

Bandingkan dengan log yang **ceroboh**. Banyak contoh di internet menulis seluruh isi permintaan ke log "supaya mudah dicari galatnya". Kalau backend-mu melakukan itu, setiap *login* akan meninggalkan email dan sandi asli di log, lalu ikut tersalin ke mana pun log itu dikirim.

#### 8.3 File rahasia tidak ikut Git (5 menit)

Di terminal kedua (folder `backend`), naik dulu ke folder `rumah-pintar-mini` karena jalur berkas di perintah ini ditulis dari sana. Biarkan `npm run dev` tetap berjalan di terminal pertama.

```text
cd ..
git check-ignore -v backend/.env backend/bruno/.env alat/.env
```

**Hasilnya:**

```text
backend/.gitignore:4:.env       backend/.env
backend/bruno/.gitignore:2:.env*        backend/bruno/.env
alat/.gitignore:4:.env  alat/.env
```

`git check-ignore -v` menjawab pertanyaan "apakah file ini diabaikan Git, dan karena baris mana?". Setiap baris jawabannya berbentuk `file .gitignore:nomor baris:pola`, diikuti nama file yang ditahan. Ketiga file `.env` ditahan oleh tiga `.gitignore` yang berbeda: milik backend sejak Modul 16, milik koleksi Bruno (dibuat Bruno sendiri), dan milik `alat` (baris `.env`-nya kamu tambahkan di Praktik 7). **Kalau salah satu file tidak muncul di jawaban, file itu tidak ditahan.** Tambahkan namanya ke `.gitignore` di folder yang sama sebelum menjalankan `git add` apa pun.

`.gitignore` hanya menahan file yang **belum** pernah tercatat Git. File yang telanjur di-*commit* tetap diikuti Git walaupun namanya kemudian ditulis di `.gitignore`. Jadi, periksa juga daftar file yang sudah tercatat:

```text
git ls-files "*.env"
```

Perintah ini **tidak menulis apa pun** kalau tidak ada satu pun file `.env` yang tercatat Git. Itulah jawaban yang benar. Kalau ada nama file yang muncul, misalnya `backend/.env`, file itu sudah ikut ter-*push* di salah satu modul sebelumnya. Ikuti 🚨 "`.env`, `JWT_SECRET`, atau sandi telanjur ter-*push* ke GitHub": ganti dulu rahasianya, baru keluarkan filenya dari Git dengan `git rm --cached`.

Kalau kamu mengerjakan bagian pilihan curl, periksa juga berkas ujinya: `git check-ignore -v backend/login.json backend/login-salah.json backend/kue.txt` menjawab tiga baris dari `backend/.gitignore` (baris 8 untuk `login*.json` dan baris 9 untuk `kue*.txt`).

#### 8.4 GitHub ikut berjaga (5 menit)

Buka repositori `rumah-pintar-mini` di GitHub. Di bawah nama repositori, klik tab **Security and quality** (kalau tidak terlihat, klik **⋯** di ujung deretan tab), lalu di menu kiri, pada bagian **Vulnerability alerts**, klik **Secret scanning**.

- **Daftarnya kosong:** belum pernah ada rahasia yang bentuknya dikenali dan ter-*push* ke repositori ini. Ingat batasnya (Konsep 11): `JWT_SECRET` buatanmu tidak akan pernah muncul di sini karena bentuknya tidak dikenali, jadi pertahanan utamanya tetap `.gitignore` dan pemeriksaan 8.3.
- **Ada peringatan**, misalnya **Telegram Bot Token**: token itu pernah ter-*push*, di cabang mana pun dan kapan pun. Anggap bocor: minta token baru lewat `/token` di @BotFather, tulis di `backend/.env`, lalu tutup peringatannya. GitHub tidak memberi tahu Telegram, jadi token lama baru mati setelah kamu sendiri yang menggantinya.

*Secret scanning* gratis untuk repositori **publik**, dan `rumah-pintar-mini` dibuat publik sejak Modul 3. Kalau repositorimu privat, menu itu mungkin tidak tersedia. Selain itu, akun GitHub-mu sendiri menyalakan ***push protection*** secara bawaan: *push* ke repositori publik yang memuat rahasia dengan bentuk yang dikenali, misalnya token GitHub, langsung ditolak sebelum sampai. Pengaturannya ada di foto profil → **Settings** → **Code security**, bagian **Push protection for yourself**. Biarkan menyala.

#### 8.5 ⭐ Gladi bersih tiga syarat lulus (10 menit)

Kerjakan di Bruno dengan backend yang masih berjalan. Syarat 3 butuh jam pasir yang kosong: tidak boleh ada *login* dalam semenit sebelum langkah 3. Langkah 8.2 baru saja mengirim dua *login* (`login admin` dan `login salah`), jadi kerjakan syarat 1 dulu dengan santai. Kotak **Hasilnya** di bawah berasal dari satu gladi yang sama di laptop penulis, dengan kode akhir modul ini.

**Syarat 1 — tanpa *login*, semua *endpoint* menjawab 401.**

1. Kirim **`logout`** supaya Bruno tidak lagi menyimpan gelang apa pun.
2. Kirim **`daftar perangkat`**, **`nyalakan lampu`**, **`ubah ambang kipas`**, **`keadaan aktuator Node 1`**, dan **`siapa saya`**. Semuanya dijawab **401** dengan `{"pesan":"belum login atau sesi sudah habis: login lewat POST /auth/login"}`, dan relay tidak berbunyi sama sekali. Kirim juga **`health`**: jawabannya tetap **200**.

Dengan kode akhir, penulis mengulang ketukan ke semua pintu dari Praktik 3.4. Kesebelas permintaan ke *endpoint* data dan perintah (termasuk `HEAD /devices`), `GET /auth/me`, dan alamat yang tidak ada (`GET /tidak-ada`) menjawab **401**, sedangkan `GET /health`, `HEAD /health`, dan `/docs` tetap **200**. Dua loket yang sekarang sudah dibuka berperilaku seperti yang dirancang di Praktik 4: `POST /auth/refresh` tanpa kartu terusan dijawab **401** oleh loketnya sendiri, dan `POST /auth/logout` selalu **200**. Pintu aula Socket.IO sudah dibuktikan di Praktik 7: tanpa gelang, sambungannya ditolak dengan `belum login`.

**Syarat 3 — percobaan *login* ke-11 dalam semenit ditolak.**

3. Klik **Send** pada **`login salah`** sepuluh kali berturut-turut, dalam waktu kurang dari satu menit. Kesepuluhnya dijawab `401`.
4. Segera kirim **`login admin`**, yang sandinya benar. Jawabannya **`429 Too Many Requests`**:

   ```json
   {"statusCode":429,"error":"Too Many Requests","message":"terlalu banyak percobaan: coba lagi dalam 56 detik"}
   ```

5. Tunggu sampai `retry-after` habis (kurang dari satu menit). Jam pasir juga akan menghitung *login* di syarat berikutnya.

**Syarat 2 — akun `viewer` gagal menyalakan relay.**

6. Kirim **`login viewer`** (200), lalu **`nyalakan lampu`**. Jawabannya **`403 Forbidden`**:

   ```json
   {"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}
   ```

7. Kirim **`logout`** untuk menutup gladi.

**Hasilnya** di log backend (**contoh**, mulai dari syarat 3; *login* salah ketiga sampai ketujuh diringkas menjadi `…`):

```text
[14:15:13] WARN: login gagal: akun 1 (IP 127.0.0.1)
[14:15:13] INFO: POST /auth/login -> 401 (346 ms)
[14:15:13] WARN: login gagal: akun 1 (IP 127.0.0.1)
[14:15:13] INFO: POST /auth/login -> 401 (334 ms)
…
[14:15:16] WARN: login gagal: akun 1 (IP 127.0.0.1)
[14:15:16] INFO: POST /auth/login -> 401 (360 ms)
[14:15:16] WARN: login gagal: akun 1 (IP 127.0.0.1)
[14:15:16] INFO: POST /auth/login -> 401 (401 ms)
[14:15:17] WARN: login gagal: akun 1 (IP 127.0.0.1)
[14:15:17] INFO: POST /auth/login -> 401 (358 ms)
[14:15:17] INFO: POST /auth/login -> 429 (2 ms)
[14:16:16] INFO: login: akun 2 (viewer), sesi 37, IP 127.0.0.1
[14:16:16] INFO: POST /auth/login -> 200 (385 ms)
[14:16:16] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices/a4cf12e5b7c0/command
[14:16:16] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
[14:16:16] INFO: logout: sesi 37
[14:16:16] INFO: POST /auth/logout -> 200 (7 ms)
```

Sepuluh *login* salah masing-masing butuh sekitar 350 ms karena bcrypt bekerja, sedangkan yang ke-11 ditolak dalam 2 ms tanpa memeriksa sandi. Satu menit kemudian, *login* `viewer` diterima, dan perintahnya ditolak satpam dalam 1 ms sebelum menyentuh broker. Ketiga syarat lulus terbukti.

#### 8.6 Pemeriksaan otomatis (5 menit)

Di terminal kedua, masuk lagi ke folder `backend`, lalu jalankan tiga pemeriksaan ini:

```text
cd backend
npm run cek
npm test
npm audit
```

`npm run cek` selesai tanpa pesan galat, dan ringkasan `npm test` memuat **`Tests  18 passed (18)`**: 11 tes otak aturan dari Modul 19, ditambah 7 tes keamanan modul ini (4 tes sandi dari Praktik 1, yaitu 2 tes aturan sandi dan 2 tes sidik jari bcrypt, serta 3 tes kartu terusan dari Praktik 4). `npm audit` mengirim daftar paket yang terpasang ke server npm, lalu mencocokkannya dengan daftar kerentanan yang sudah diketahui. **Hasilnya:**

```text
found 0 vulnerabilities
```

Pemeriksaan ini butuh internet. Kalau yang tampil hanya garis kecil yang berputar lebih dari satu menit, tekan **Ctrl + C**, lalu jalankan `npm audit --no-progress`. Pilihan itu mematikan animasi berputarnya. Di laptop penulis, `npm audit` tanpa pilihan itu berkali-kali macet di terminal PowerShell, sedangkan `npm audit --no-progress` di terminal yang sama selesai dalam 7 detik dengan hasil yang sama.

Kalau suatu hari `npm audit` menemukan kerentanan, bacalah nama paket dan tingkat bahayanya dulu. `npm audit fix` hanya menaikkan versi yang masih cocok dengan `package.json`, sedangkan `npm audit fix --force` boleh melompat ke versi utama baru yang bisa merusak kode. Jangan menjalankan yang kedua tanpa membaca daftarnya. Untuk modul ini, semua versi paket sudah dipilih supaya bebas dari kerentanan yang diketahui pada saat modul ditulis.

#### 8.7 Simpan ke cabang dan kirim ke GitHub (5 menit)

Masih di terminal kedua, ketik:

```text
cd ..
git add backend/package.json backend/package-lock.json backend/src/server.ts
git status
git commit -m "Backend v0.5.0: login, peran, dan pengaman API (Modul 20 Praktik 8)"
git push -u origin fitur/keamanan-pengguna
```

Di bagian `Changes to be committed`, `git status` hanya menyebut tiga file itu. Pastikan tidak ada `.env` di mana pun dalam daftarnya. Kalau kamu mengerjakan Praktik 6.6, `backend/perintah.json` mungkin muncul di bagian `Untracked files`. Biarkan saja: berkas itu sengaja tidak ditulis di `git add`, dan akan dihapus di ➕ C.

Ini *push* pertama cabang `fitur/keamanan-pengguna`. `-u` mencatat cabang itu di GitHub sebagai pasangan cabang lokalmu, jadi setelah ini cukup `git push`. Kalau GitHub menolak *push*-nya karena menemukan rahasia (*push protection*), **jangan** dipaksa lewat. Pesan penolakannya menyebut nama berkas dan barisnya, dan rahasia itu harus diganti (🚨).

> ➡️ **Selesai Praktik 8?** Kerjakan Tingkat 1 dari [🧩 Tantangan mandiri](#-tantangan-mandiri), lalu langkah A–E di [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini): di sana semua pekerjaan Modul 20 digabungkan ke `main` lewat *pull request* "keamanan pengguna" yang ditinjau dengan checklist keamanan. Tingkat 2 dan 3 dikerjakan sesudah itu, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul masalah yang mirip dengan yang kamu alami.

<details>
<summary><b><code>npm install</code> menulis <code>npm warn install-scripts … not yet covered by allowScripts</code>, <code>npm install-scripts</code> tidak dikenal, bcrypt gagal dipasang, atau <code>npm audit</code> tidak kunjung selesai</b></summary>

- **Peringatan empat baris `npm warn install-scripts` di setiap `npm install`** berarti persetujuan skrip pemasangan bcrypt belum dicatat. Jalankan `npm install-scripts approve bcrypt` di folder `backend` (Kemenangan Cepat langkah 2), lalu pastikan `package.json` memuat `"allowScripts": { "bcrypt@6.0.0": true }`. Persetujuan itu ikut Git, jadi teman satu tim tidak perlu menyetujuinya lagi.
- **`npm install-scripts approve bcrypt` dijawab `Unknown command: "install-scripts"`**: npm-mu lebih tua daripada 11.18 (periksa dengan `npm -v`) dan belum mengenal persetujuan ini. Paket bcrypt sudah terpasang lengkap karena npm lama menjalankan skrip pemasangan tanpa bertanya. Perbarui Node.js 24 ke rilis LTS terbaru seperti Modul 4 Praktik 3, lalu jalankan lagi `npm install-scripts approve bcrypt`. Mac lama yang tertahan di Node.js 22 cukup melewati langkah persetujuan.
- **`npm install bcrypt@6.0.0` gagal dengan banyak baris `gyp ERR!`**: laptopmu memakai sistem yang tidak dibawakan program jadi oleh bcrypt 6 (program jadinya hanya tersedia untuk Windows, macOS, dan Linux pada prosesor yang umum) sehingga npm mencoba mengompilasinya sendiri dan tidak menemukan kompiler. Pakai pengganti tanpa kompiler, **bcryptjs**: jalankan `npm uninstall bcrypt @types/bcrypt`, lalu `npm install bcryptjs@3.0.3`, dan di `src/auth/sandi.ts` (atau di `coba-bcrypt.js` kalau kamu masih di Kemenangan Cepat) ganti baris `import bcrypt from "bcrypt";` dengan `import bcrypt from "bcryptjs";`. Paket bcryptjs tidak membawa skrip pemasangan, jadi `npm install-scripts approve bcrypt` dan bagian `allowScripts` tidak diperlukan. Cara pakainya sama, dan sidik jari buatan keduanya saling cocok. Karena ditulis dalam JavaScript murni, bcryptjs sedikit lebih lambat.
- **`npm install` diam lama sekali di akhir**: npm sedang menjalankan pemeriksaan keamanan paket (audit) ke server npm. Tunggu sampai selesai. Kalau jaringanmu sedang putus-sambung, pemeriksaan itu bisa gagal karena waktunya habis; jalankan lagi `npm install` begitu jaringan stabil.
- **`npm audit` (Praktik 8.6) hanya menampilkan garis kecil yang berputar**, lebih dari satu menit: tekan **Ctrl + C**, lalu jalankan `npm audit --no-progress`. Di laptop penulis, cara ini selesai dalam beberapa detik, padahal `npm audit` tanpa pilihan itu berkali-kali macet di terminal PowerShell yang sama.

</details>

<details>
<summary><b>Backend, <code>npm run migrasi</code>, atau <code>npm run pengguna</code> berhenti dengan <code>Setelan JWT_SECRET di .env: …</code></b></summary>

Mulai Modul 20, semua program backend memeriksa `.env` lewat `src/config/env.ts`, termasuk `npm run migrasi` dan `npm run pengguna`. Bacalah akhir baris pesannya:

| Pesan | Artinya | Perbaikannya |
| :--- | :--- | :--- |
| `belum diisi` | baris `JWT_SECRET=` tidak ada, isinya kosong, atau diawali `#` | buat dengan perintah di Praktik 1.1, lalu tempel di `.env` |
| `masih berisi contoh dari .env.example; buat rahasia baru` | isinya masih `ganti-dengan-…` | ganti dengan 43 karakter acak hasil perintah itu |
| `terlalu pendek (minimal 32 karakter); …` | isinya kurang dari 32 karakter | buat ulang dengan perintahnya; jangan mengarang sendiri |

Kalau ada beberapa masalah sekaligus, semuanya ditulis berurutan, misalnya `Setelan MQTT_URL di .env: belum diisi` di atas pesan `JWT_SECRET`. Pastikan juga `.env` ada di folder `backend` (bukan di `rumah-pintar-mini`) dan sudah disimpan.

</details>

<details>
<summary><b><code>npm run pengguna</code> menolak atau tidak ditemukan</b></summary>

- **`gagal: terminal ini tidak bisa menyembunyikan ketikan sandi; jalankan perintah ini di terminal VS Code (PowerShell) atau Terminal macOS`**: kamu menjalankannya di jendela yang tidak bisa menyembunyikan ketikan, misalnya Git Bash (mintty). Buka terminal VS Code bawaan (PowerShell) atau Windows Terminal, lalu ulangi perintahnya.
- **`npm error Missing script: "pengguna"`**: baris `"pengguna": …` belum ditambahkan ke `package.json` (Praktik 1.6), atau `package.json` belum disimpan. Periksa koma di akhir baris itu.
- **Cara pakai tercetak, dan tidak ada yang terjadi**: jumlah argumennya tidak pas, misalnya salah satu argumen terlewat, atau nama yang berisi spasi tidak diapit petik ganda sehingga terhitung dua argumen. Bentuknya `npm run pengguna -- tambah <email> "<nama>" <admin|viewer>`, dengan nama diapit petik ganda kalau berisi spasi.
- **`email itu sudah terdaftar; …`**: akunnya memang sudah ada, mungkin dengan huruf besar yang berbeda. Lihat `npm run pengguna -- daftar`. Untuk mengganti sandinya: `npm run pengguna -- sandi <email>`.
- **`gagal: sandi belum dibuat setelah 3 kali percobaan`**: tiga kali sandi terlalu pendek, terlalu panjang, atau kedua ketikannya tidak sama. Ulangi perintahnya; pesan di atas baris itu menyebut alasan setiap percobaan.

</details>

<details>
<summary><b><i>Login</i> selalu dijawab <code>401</code> <code>email atau sandi salah</code>, padahal sandinya benar</b></summary>

- **Email salah ketik**: lihat daftar email yang benar dengan `npm run pengguna -- daftar`. Huruf besar dan kecil tidak berpengaruh.
- **`bruno/.env` tidak cocok**: nama setelannya harus persis `SANDI_ADMIN` dan `SANDI_VIEWER`, filenya di folder `backend/bruno` (sejajar dengan `opencollection.yml`), dan sudah disimpan. Kalau sandimu mengandung `#`, apit nilainya dengan petik ganda: tanpa petik, semua yang ada sesudah `#` dianggap komentar dan terbuang.
- **Spasi tersembunyi**: spasi di awal atau akhir sandi ikut dihitung. Tulis ulang barisnya tanpa spasi tambahan.
- **Masih ragu?** Buat sandi baru dengan `npm run pengguna -- sandi <email>`, lalu salin sandi itu ke `bruno/.env`.

</details>

<details>
<summary><b><i>Login</i> berhasil (<code>200</code>), tetapi permintaan berikutnya tetap <code>401</code></b></summary>

- **Gelang sudah berumur lebih dari 15 menit**: kirim `refresh`, lalu ulangi permintaannya (Praktik 4.8).
- **Alamat bercampur**: *login* lewat `http://127.0.0.1:8080`, tetapi permintaan berikutnya ke `http://localhost:8080` (atau sebaliknya). *Cookie* melekat pada nama host. Di Bruno, periksa *environment* `lokal`: `baseUrl` harus `http://127.0.0.1:8080`. Di browser, buka `/docs` lewat `127.0.0.1`.
- **Bruno tidak mengirim *cookie***: buka **Preferences → General**, lalu pastikan **Store Cookies automatically** dan **Send Cookies automatically** dicentang.
- **Gelang tidak terbawa ke `/devices`**: kalau kamu mengetik ulang `keamanan.ts`, pastikan `OPSI_AKSES` memuat `path: "/"`. Tanpa itu, *cookie* `akses` hanya berlaku di `/auth/…`.
- **Akun yang sedang *login* sudah dihapus**: `GET /auth/me` menjawab `akun ini sudah tidak ada`. *Login* dengan akun lain.

</details>

<details>
<summary><b><code>403</code> <code>akun viewer hanya boleh melihat; …</code>, padahal aku ingin mengubah sesuatu</b></summary>

Bruno memakai gelang dari *login* **terakhir**. Kalau terakhir kali kamu mengirim `login viewer`, semua permintaan berikutnya berjalan sebagai `viewer`. Kirim `login admin`, lalu ulangi permintaannya. Kalau perannya baru saja diubah dengan `npm run pengguna -- peran …`, kirim `refresh` dulu: gelang lama masih membawa peran lama sampai diganti (Konsep 6).

</details>

<details>
<summary><b><code>429 Too Many Requests</code>, padahal baru sekali salah sandi</b></summary>

Jam pasir menghitung **semua** percobaan *login* dari alamat IP-mu dalam 60 detik terakhir, termasuk yang berhasil, dan termasuk percobaan dari Bruno, curl, `/docs`, dan terminal kecil sekaligus. Tunggu sesuai `retry-after` (paling lama satu menit), atau mulai ulang backend: hitungannya disimpan di memori, jadi kembali ke nol (Praktik 5.6).

</details>

<details>
<summary><b>Browser menulis <code>blocked by CORS policy</code>, atau backend menjawab <code>403</code> <code>permintaan dari halaman … ditolak</code></b></summary>

- **`blocked by CORS policy`**: asal halaman itu tidak ada di `CORS_ORIGIN`. Ingat bahwa asal mencakup port: `http://localhost:5173` dan `http://localhost:5174` adalah dua asal. Tambahkan asal yang tepat ke `CORS_ORIGIN` di `.env`, dipisahkan dengan koma, lalu simpan. Kalau kamu mengetik ulang `keamanan.ts`, pastikan `app.register(cors, …)` berada **sebelum** satpam; kalau terbalik, *preflight* dijawab 401, dan browser melaporkannya sebagai galat CORS.
- **`403` `permintaan dari halaman … ditolak`**: permintaan `POST` atau `PUT` datang dari halaman browser yang asalnya tidak dikenal. Kalau halaman itu memang milikmu, misalnya dashboard Modul 22 di port lain, tambahkan asalnya ke `CORS_ORIGIN`. Kalau asalnya tertulis `null`, permintaan itu datang dari berkas HTML yang dibuka langsung dari folder (alamatnya diawali `file://`); jalankan halaman itu lewat server lokal, seperti Vite di Modul 22. Bruno, curl, dan terminal kecil tidak pernah terkena penolakan ini.

</details>

<details>
<summary><b>Terminal kecil menulis <code>belum login</code>, <code>.env: not found</code>, atau <code>login ditolak</code></b></summary>

- **`belum bisa tersambung: belum login`** (satu baris, lalu selesai sendiri): `alat/terminal-live.js` masih versi Modul 19, yang tidak pernah *login*. Ganti isinya dengan kode Praktik 7.4.
- **`node.exe: .env: not found`** (macOS: `node: .env: not found`): berkas `alat/.env` belum dibuat, atau perintahnya dijalankan dari folder lain. Ujung baris perintahnya harus `alat>` (macOS: `alat %`).
- **`Isi EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env, …`**: berkasnya ada, tetapi salah satu setelan kosong, namanya salah ketik, berkasnya belum disimpan, atau perintahnya ditulis tanpa `--env-file=.env`.
- **`login ditolak (401). Periksa EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env.`**: email atau sandinya salah, atau sandi akun itu baru saja diganti dengan `npm run pengguna -- sandi`. Coba pasangan yang sama dengan `login viewer` di Bruno. Kalau sandinya mengandung `#`, apit nilainya dengan petik ganda.
- **`login ditolak (429). …`**: jatah sepuluh percobaan *login* sudah terpakai sebelum pasirnya habis, misalnya karena kamu baru saja menguji Praktik 5. Tunggu satu menit, lalu jalankan lagi.
- **`backend belum bisa dihubungi, coba lagi 5 detik lagi`** berulang-ulang: backend belum menyala, atau alamat di perintahnya salah. Terminal terus mencoba sendiri.
- **`terputus: io server disconnect` setiap 15 menit**, lalu `gelang diperbarui (refresh)` dan `tersambung ke …`: tidak ada yang salah. Server memang memutus sambungan saat gelangnya kedaluwarsa, dan terminal memperbarui gelangnya sendiri (Praktik 7.5).

</details>

<details>
<summary><b><code>git check-ignore</code> tidak menyebut salah satu file <code>.env</code>, atau <code>git ls-files "*.env"</code> menyebut sebuah file</b></summary>

- **`alat/.env` tidak disebut**: dua baris dari Praktik 7.4 belum ada di `alat/.gitignore`, atau file itu belum disimpan. Tambahkan, simpan, lalu jalankan lagi `git check-ignore -v`.
- **`backend/bruno/.env` tidak disebut**: file `backend/bruno/.gitignore`, yang dibuat Bruno bersama koleksinya di Modul 16, tidak ada atau tidak memuat `.env*`. Buat file itu (atau tambahkan barisnya) dengan isi satu baris: `.env*`.
- **`backend/.env` tidak disebut**: baris `.env` di `backend/.gitignore` dari Modul 16 hilang. Tambahkan lagi.
- **`git ls-files "*.env"` menyebut sebuah file**: file itu sudah tercatat Git, jadi `.gitignore` tidak lagi menahannya, dan isinya sudah ada di GitHub kalau pernah di-*push*. Ikuti bagian lipat terakhir di 🚨 ini, "`.env`, `JWT_SECRET`, atau sandi telanjur ter-*push* ke GitHub": ganti rahasianya dulu, baru keluarkan filenya dengan `git rm --cached`.

</details>

<details>
<summary><b>PowerShell menjawab <code>415 Unsupported Media Type</code> atau <code>Body cannot be empty …</code> untuk <code>POST /auth/logout</code> atau <code>/auth/refresh</code></b></summary>

`Invoke-RestMethod` tanpa isi menulis kepala `content-type` yang tidak cocok: Windows PowerShell 5.1 dijawab `415`, PowerShell 7 dijawab `400` `FST_ERR_CTP_EMPTY_JSON_BODY`. Kirim isi JSON kosong: `-ContentType "application/json" -Body "{}"` (Praktik 4.7). Bruno dan `/docs` tidak mengalami ini.

</details>

<details>
<summary><b>Tes bcrypt di <code>npm test</code> gagal dengan <code>Test timed out in 5000ms</code></b></summary>

Batas waktu bawaan Vitest adalah 5 detik, sedangkan bcrypt di laptop yang sibuk bisa lebih lama. Pastikan kedua tes bcrypt di `src/auth/auth.test.ts` diakhiri `}, LAMBAT);`, seperti kode Praktik 1.9, dan konstanta `LAMBAT` bernilai `30_000`.

</details>

<details>
<summary><b>Lupa sandi akun <code>admin</code></b></summary>

Tidak ada tombol "lupa sandi", dan memang sengaja: hanya pemegang laptop server dan file `.env`-nya yang boleh mengurus akun. Di terminal folder `backend`, jalankan `npm run pengguna -- sandi admin@rumah.test` (email akun `admin`-mu), lalu ketik sandi baru dua kali. Semua sesi akun itu ikut dicabut, jadi semua tempat yang masih *login* dengan akun itu harus *login* ulang. Perbarui juga `SANDI_ADMIN` di `bruno/.env`.

</details>

<details>
<summary><b><code>.env</code>, <code>JWT_SECRET</code>, atau sandi telanjur ter-<i>push</i> ke GitHub</b></summary>

Rahasia yang pernah tampil di GitHub harus dianggap bocor walaupun *commit*-nya kamu hapus. Urutannya:

1. **Ganti rahasianya dulu.** `JWT_SECRET` baru: buat dengan perintah Praktik 1.1, simpan di `.env`, lalu mulai ulang backend; semua gelang lama langsung tidak sah. Sandi akun: `npm run pengguna -- sandi <email>`. Token bot Telegram: minta yang baru lewat `/token` di @BotFather. Sandi database: ganti di kontainer, lalu di `DATABASE_URL`.
2. **Keluarkan filenya dari Git** tanpa menghapusnya dari laptop: di folder `backend`, jalankan `git rm --cached .env` (atau `git rm --cached bruno/.env`; untuk `alat/.env`, jalankan `git rm --cached .env` di folder `alat`), pastikan namanya ada di `.gitignore`, lalu *commit* dan *push*.
3. **Membersihkan riwayat** cukup dibaca di 🔬; setelah langkah 1, rahasia lama di riwayat sudah tidak berguna bagi siapa pun.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Tidak ada yang wajib dikerjakan, dan modul berikutnya tidak bergantung padanya.

<details>
<summary><b>OWASP Top 10:2025 versi ramah awam</b></summary>

**OWASP** (*Open Worldwide Application Security Project*) adalah komunitas terbuka yang, antara lain, menerbitkan daftar **sepuluh risiko keamanan aplikasi web yang paling sering ditemukan**. Daftar ini sering ditanyakan di wawancara kerja. Versi terbarunya adalah **OWASP Top 10:2025**. Berikut kesepuluhnya, dikaitkan dengan Rumah Pintar Mini (kolom kanan adalah tafsiran penulis, bukan teks OWASP):

| Kode | Nama resminya | Contohnya di Rumah Pintar Mini |
| :--- | :--- | :--- |
| A01 | *Broken Access Control* (kendali akses yang jebol) | Akun `viewer` bisa menyalakan relay, atau ada rute yang lupa dikunci. Inilah inti modul ini: satpam terkunci secara bawaan, 401, dan 403. |
| A02 | *Security Misconfiguration* (salah setel) | CORS dengan `*` dan *cookie*, `/docs` dibuka di internet tanpa pertimbangan, `HOST=0.0.0.0` sebelum ada *login*, pesan galat yang membocorkan detail server. |
| A03 | *Software Supply Chain Failures* (rantai pasok perangkat lunak) | Paket npm yang disusupi atau usang. Kebiasaan sejak Modul 16 membantu: versi persis, `package-lock.json`, dan `npm audit`. |
| A04 | *Cryptographic Failures* (kriptografi yang lemah) | Sandi disimpan apa adanya atau dengan sidik jari cepat seperti SHA-256, `JWT_SECRET` yang pendek, atau tanpa HTTPS di internet (Fase 5). |
| A05 | *Injection* (penyusupan perintah) | SQL yang disusun dengan menyambung teks. Sudah dicegah sejak Modul 17 dengan parameter `$1`, `$2`. XSS di dashboard menyusul di Modul 22. |
| A06 | *Insecure Design* (rancangan yang tidak aman) | Pintu *login* tanpa batas percobaan, atau sistem yang dibangun tanpa pernah memikirkan model ancamannya. |
| A07 | *Authentication Failures* (autentikasi yang gagal) | Sandi lemah diterima, gelang tidak pernah kedaluwarsa, atau *logout* yang tidak mencabut apa pun. |
| A08 | *Software or Data Integrity Failures* (keaslian perangkat lunak dan data) | Pembaruan firmware lewat udara tanpa pemeriksaan keaslian (Modul 28), atau JWT yang diterima tanpa memeriksa tanda tangannya. |
| A09 | *Security Logging and Alerting Failures* (pencatatan dan peringatan) | *Login* gagal dan jawaban 429 tidak pernah dicatat. Sebaliknya, sandi dan token juga tidak boleh ikut tercatat. |
| A10 | *Mishandling of Exceptional Conditions* (salah menangani keadaan tak terduga) | Galat yang tidak tertangani mematikan server, atau pemeriksaan peran yang melempar galat lalu dilewati begitu saja ("gagal terbuka"). |

Dibandingkan dengan versi 2021, A10 adalah kategori baru, A03 diperluas dari "komponen yang rentan dan usang" menjadi seluruh rantai pasok, dan SSRF (*Server-Side Request Forgery*) kini digabungkan ke dalam A01. Untuk perangkat IoT sendiri, OWASP punya daftar terpisah, **OWASP IoT Top 10**, yang dibahas di Modul 21.

</details>

<details>
<summary><b>"<i>Login</i> dengan Google": OAuth 2.0 dan OpenID Connect</b></summary>

Banyak aplikasi menawarkan tombol "Masuk dengan Google". Di baliknya ada dua standar: **OAuth 2.0** (cara aplikasi meminta izin atas nama pengguna) dan **OpenID Connect** atau OIDC (lapisan di atas OAuth yang menjawab "orang ini siapa").

Bayangkan **resepsionis gedung yang menelepon kantor penerbit KTP**. Resepsionis tidak menyimpan data KTP-mu; ia cukup bertanya, "Benarkah orang di depan saya ini pemilik KTP nomor sekian?" Kalau kantor KTP menjawab "benar", resepsionis memberimu kartu tamu **buatan gedung itu sendiri**. Alur resmi Google untuk server punya enam langkah:

1. Backend membuat **token antipemalsuan** (*state*) yang acak.
2. Browser dialihkan ke halaman Google. Pengguna *login* di sana, dan sandinya tidak pernah lewat backend-mu.
3. Google mengembalikan browser ke **alamat balikan** (*redirect URI*) yang sudah didaftarkan, membawa sebuah kode dan *state* tadi. Backend memastikan *state*-nya sama.
4. Backend menukar kode itu, langsung ke server Google, dengan **ID token**.
5. Backend membaca identitas dari ID token. Yang dipakai adalah `sub` (nomor akun Google), bukan email, karena email bisa berganti.
6. Backend **membuat sesinya sendiri**: gelang di *cookie* `akses` dan kartu terusan, persis seperti modul ini.

Langkah 6 adalah pelajaran pentingnya: *login* dengan Google **tidak menggantikan** apa yang kamu bangun minggu ini. Google hanya menggantikan pemeriksaan sandi. Gelang, kartu terusan, satpam, dan peran tetap milik backend-mu. Modul ini tidak mempraktikkannya karena butuh akun dan proyek Google Cloud, alurnya paling enak diuji dari frontend (Modul 22), dan rumah pintar lokal sebaiknya tetap bisa dibuka walaupun internet putus. Kalau kelak kamu membuatnya, ikuti **RFC 9700** (praktik terbaik keamanan OAuth 2.0, Januari 2025): pakai PKCE (*Proof Key for Code Exchange*), dan alamat balikan harus HTTPS kecuali `localhost`.

</details>

<details>
<summary><b>Verifikasi dua langkah (2FA) dengan kode enam digit</b></summary>

**Verifikasi dua langkah** (2FA, *two-factor authentication*) meminta dua bukti dari jenis berbeda: sesuatu yang kamu **tahu** (sandi) dan sesuatu yang kamu **punya** (HP). Yang paling umum adalah kode enam digit dari aplikasi seperti Google Authenticator, Microsoft Authenticator, atau Aegis. Standarnya bernama **TOTP** (*Time-based One-Time Password*, RFC 6238).

Cara kerjanya mirip **dua arloji kembar yang memegang resep rahasia yang sama**. Saat 2FA diaktifkan, server dan aplikasi di HP berbagi satu kunci rahasia, biasanya lewat kode QR. Setiap **30 detik**, keduanya menghitung angka enam digit dari "kunci rahasia + jam sekarang" dengan HMAC, saudara dekat tanda tangan gelang di pemanasan langkah 3. Kalau angka yang kamu ketik sama dengan hitungan server, berarti kamu memegang HP itu. Tidak ada yang dikirim lewat internet saat menghitung, jadi aplikasinya tetap bekerja dalam mode pesawat asalkan jam HP-nya benar.

Menurut OWASP, verifikasi berlapis seperti ini adalah pertahanan terbaik terhadap sebagian besar serangan sandi. Namun, ada catatannya:

- **Kode bisa dipancing** (*phishing*): situs palsu bisa meminta kode itu lalu memakainya dalam 30 detik.
- **HP hilang berarti terkunci di luar.** Karena itu, saat mengaktifkan 2FA, pengguna diberi beberapa **kode pemulihan** sekali pakai untuk disimpan di tempat aman.
- Langkah yang lebih kuat lagi adalah ***passkey*** (kunci sandi), yang tidak bisa dipancing situs palsu.

Pedoman NIST juga membedakan sandi tanpa dan dengan faktor kedua: sandi yang menjadi satu-satunya faktor wajib minimal 15 karakter, sedangkan sandi yang ditemani faktor kedua cukup minimal 8 karakter.

</details>

<details>
<summary><b>bcrypt, Argon2id, dan cara menaikkan <i>cost</i> kelak</b></summary>

Algoritma bcrypt lahir pada 1999 dan masih dipakai sangat luas. Panduan penyimpanan sandi OWASP kini menempatkan **Argon2id** di urutan pertama (dengan memori minimal 19 MiB, 2 putaran, 1 jalur), lalu scrypt, dan menyebut bcrypt sebagai pilihan untuk "sistem lama" dengan syarat *cost* minimal 10 dan sandi paling panjang 72 *byte*. Kelebihan Argon2id: ia memakai **banyak memori** sehingga kartu grafis penebak tidak bisa menjalankan ribuan tebakan sekaligus semudah pada bcrypt.

Modul ini tetap memakai bcrypt karena Silabus memintanya, paketnya membawa program jadi untuk Windows dan macOS (tanpa perlu kompiler), dan dengan *cost* 12 ia masih sangat cukup untuk rumah pintar.

Laptop makin cepat setiap tahun, jadi *cost* sebaiknya dinaikkan kelak. Sidik jari lama tidak perlu dibuang. Teks bcrypt menyimpan *cost*-nya sendiri (`$2b$12$…`), jadi caranya: saat seseorang berhasil *login*, periksa *cost* sidik jarinya; kalau masih lebih kecil daripada *cost* baru, hitung ulang sidik jari dari sandi yang baru saja ia ketik, lalu simpan. Dalam beberapa minggu, semua akun aktif sudah berpindah ke *cost* baru tanpa ada yang menyadarinya.

</details>

<details>
<summary><b>Batas percobaan per email: mengapa tidak dipasang</b></summary>

Jam pasir backend v0.5 menghitung per **alamat IP**. Penebak yang punya banyak alamat IP, misalnya jaringan komputer yang sudah dibobol, bisa mencoba 10 sandi per menit dari **setiap** alamatnya. Karena itu, panduan autentikasi OWASP menyarankan penghitung kegagalan yang melekat pada **akunnya**, bukan pada alamat IP.

Penulis sempat mencoba batas per email di laptop lab. Hasilnya menunjukkan sisi gelapnya: siapa pun yang tahu email akun `admin` bisa **mengunci pemilik akun itu** dengan sengaja salah 10 kali setiap menit. Ini disebut serangan penolakan layanan (*denial of service*) terhadap akun. Karena itu, sistem besar memakai campuran cara yang lebih halus:

- **Jeda yang makin panjang** untuk akun yang terus gagal (1 detik, 2 detik, 4 detik, …), bukan penguncian total.
- **Tantangan tambahan** seperti CAPTCHA setelah beberapa kegagalan.
- **Pemberitahuan ke pemilik akun** saat ada banyak percobaan gagal.
- **Verifikasi dua langkah**, yang membuat sandi yang berhasil ditebak saja tidak cukup.

Untuk backend di laptop yang hanya bisa diketuk dari `127.0.0.1`, batas per IP sudah sepadan dengan ancamannya. Pertimbangan ini dibuka lagi saat backend pindah ke internet di Fase 5.

</details>

<details>
<summary><b>Lapisan tambahan melawan CSRF</b></summary>

Backend v0.5 menahan CSRF dengan tiga lapis: `SameSite=Strict`, pemeriksaan `Origin`, dan CORS. Dua lapis lain sering kamu temui di tutorial:

- **Menutup pintu teks polos.** Formulir HTML biasa hanya bisa mengirim tiga jenis isi: `application/x-www-form-urlencoded`, `multipart/form-data`, dan `text/plain`. Fastify secara bawaan menolak dua yang pertama, tetapi **menerima `text/plain`**. Karena API Rumah Pintar Mini hanya berbicara JSON, satu baris `app.removeContentTypeParser("text/plain")` membuat isi teks polos dijawab `415 Unsupported Media Type`. Lapis ini tidak dipasang di kode utama karena skrip di halaman lain masih bisa mengirim `POST` tanpa isi dan tanpa kepala `content-type`, dan rute yang memang tidak butuh isi, misalnya `POST /rules/:id/jalankan`, menerima permintaan seperti itu. Dari situs lain, permintaan semacam ini sudah tertahan oleh `SameSite=Strict`. Namun, dari halaman di situs yang sama, misalnya `http://127.0.0.1:5500`, hanya pemeriksaan `Origin` yang menahannya.
- **Token CSRF.** Server memberi halaman sebuah token acak yang harus ikut dikirim di kepala permintaan, misalnya `x-csrf-token`. Halaman asing tidak bisa membaca token itu, jadi permintaannya ditolak. Cara ini menambah pekerjaan di setiap formulir dan klien. Untuk Rumah Pintar Mini, `SameSite=Strict` ditambah pemeriksaan `Origin` sudah menahan semua percobaan di lab penulis. Namun, panduan CSRF OWASP menyebut `SameSite` hanya lapisan tambahan, kecuali semua syaratnya terpenuhi, termasuk "tidak berbagi situs dengan layanan yang tidak sepenuhnya kamu kendalikan". Karena itu, sistem besar dengan banyak subdomain atau formulir HTML klasik tetap memakai token CSRF.

</details>

<details>
<summary><b>Menarik gelang sebelum kedaluwarsa: daftar hitam JWT</b></summary>

Gelang (JWT) tidak bisa ditarik sebelum `exp`. Kalau 15 menit masih terlalu lama, misalnya karena kamu ingin akun yang dihapus langsung terkunci saat itu juga, ada dua cara:

1. **Daftar hitam.** Simpan nomor sesi (`sid`) yang sudah dicabut, lalu satpam memeriksanya di setiap permintaan. Daftar itu cukup menyimpan sesi yang dicabut kurang dari 15 menit yang lalu karena gelang yang lebih tua sudah kedaluwarsa dengan sendirinya.
2. **Periksa sesi di setiap permintaan.** Satpam mencari baris `sesi` untuk setiap gelang. Ini membuat pemeriksaan gelang tidak lagi "tanpa database".

Kedua cara itu menukar kecepatan dengan kepastian: setiap permintaan kini membuka database atau Redis. Untuk Rumah Pintar Mini, umur gelang 15 menit adalah kompromi yang lazim dipakai. Kalau ingin mencoba, cara pertama bisa dibuat dengan `Set` di memori, mirip daftar pintu terbuka di pemanasan.

</details>

<details>
<summary><b>Menguji batas percobaan secara otomatis dengan Bruno</b></summary>

Mengeklik **Send** sebelas kali cukup untuk sekali uji. Kalau kamu ingin uji yang bisa diulang dengan satu perintah, pakai **Bruno CLI** dari 🔬 Modul 16. Pilihan `--iteration-count 11` menjalankan permintaan yang sama sebelas kali berturut-turut. Bruno CLI dijalankan dari folder koleksi `backend/bruno` di terminal kedua (backend tetap menyala di terminal pertama). Kalau ujung baris perintahnya `backend>` (macOS: `backend %`), seperti selama Praktik 5, masuk dengan `cd bruno` dan kembali sesudahnya dengan `cd ..`. Kalau masih `rumah-pintar-mini>` (macOS: `rumah-pintar-mini %`), misalnya sesudah Praktik 8.7, masuk dengan `cd backend/bruno` dan kembali dengan `cd ../..`. Perintahnya:

```text
npx @usebruno/cli@4.2.1 run "login salah.yml" --env lokal --iteration-count 11
```

**Hasilnya** (**contoh**, diringkas):

```text
Iteration: 1

login salah (401 Unauthorized) - 1655 ms
Assertions
   ✓ res.status: eq 401
   ✓ res.body.pesan: eq email atau sandi salah
Ran all requests - 1655 ms

…

Iteration: 11

login salah (429 Too Many Requests) - 8 ms
Assertions
   ✕ res.status: eq 401
      expected 429 to equal 401
   ✕ res.body.pesan: eq email atau sandi salah
      expected undefined to equal 'email atau sandi salah'
Ran all requests - 8 ms
```

Tabel ringkasan di bagian akhir menulis `11 (10 Passed, 1 Failed)`. Iterasi ke-11 gagal karena Assert `login salah` mengharapkan 401, padahal jawabannya 429; justru itulah bukti jam pasirnya bekerja. Untuk uji otomatis yang hijau semuanya, buat permintaan terpisah dengan Assert `res.status` `eq` `429`. Bruno juga menyediakan `bru.runner.setNextRequest()` di tab **Script** untuk mengatur urutan dan pengulangan permintaan di **Runner**; lihat [dokumentasi skrip Bruno](https://docs.usebruno.com/testing/script/javascript-reference). Ingat, jam pasir menghitung per alamat IP: setelah perintah ini, tunggu satu menit sebelum *login* lagi.

</details>

<details>
<summary><b>Membersihkan rahasia dari riwayat Git</b></summary>

Kalau rahasia telanjur ter-*push*, langkah pertama selalu **mengganti rahasianya** (Konsep 11). Dokumentasi GitHub sendiri menyebutkan bahwa menulis ulang riwayat Git sering kali tidak sepadan dengan repotnya karena rahasia yang sudah diganti tidak berguna lagi bagi siapa pun.

Kalau kamu tetap ingin menghapusnya dari riwayat, misalnya karena file itu juga berisi data pribadi, alat yang disarankan GitHub adalah **`git-filter-repo`** (versi 2.47 atau lebih baru) dengan pilihan `--sensitive-data-removal`, lalu *force push*. Efek sampingnya besar: semua *hash commit* berubah, klon milik orang lain bisa memasukkan kembali riwayat lama, *fork* tetap menyimpan salinannya, dan *pull request* yang terbuka harus ditutup dulu. Karena itu, bagian ini cukup dibaca. Pencegahannya jauh lebih murah: `.gitignore` sejak awal, dan menengok tab **Files changed** sebelum *merge*.

</details>

## 🧩 Tantangan mandiri

Tingkat 1 cukup dikerjakan lewat Bruno dan terminal, tanpa mengubah kode. Tingkat 2 dan 3 mengubah kode backend, jadi kerjakan **setelah** ➕ D (cabang `fitur/keamanan-pengguna` sudah di-*merge*), di cabang baru dari `main`, seperti Modul 16–19: `git switch main`, `git pull`, lalu `git switch -c fitur/<nama-tantangan>`. Tingkat 1 dan 2 punya kunci jawaban; isi lengkap file kunci Tingkat 2 ada di [`kode/tantangan/kunci/`](kode/tantangan/kunci/).

### Tingkat 1 — Gelang yang terlambat tahu (20 menit)

Konsep 6 menyebut bahwa perubahan peran baru berlaku setelah gelangnya diganti. Buktikan sendiri dengan backend menyala dan Node 1 tersambung (untuk jalur laptop, simulator Modul 19 seperti di Praktik 3) karena langkah 4 butuh jawaban `ack`:

1. Di Bruno, kirim `login viewer`, lalu `nyalakan lampu`. Jawabannya **403**.
2. Di terminal kedua, masuk dulu ke folder `backend` (sesudah Praktik 8.7, terminal itu masih di folder `rumah-pintar-mini`, jadi ketik `cd backend`), lalu naikkan peran akun itu dengan `npm run pengguna -- peran viewer@rumah.test admin`.
3. Kirim `nyalakan lampu` lagi **tanpa** *login* ulang. Apa jawabannya, dan mengapa?
4. Kirim `refresh`, lalu `nyalakan lampu` sekali lagi. Apa yang berubah? Sesudah itu, kirim `matikan lampu` supaya lampunya padam lagi.
5. Kembalikan perannya (`npm run pengguna -- peran viewer@rumah.test viewer`), lalu kirim `refresh` dan `nyalakan lampu`. Pastikan jawabannya kembali **403**.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

1. `login viewer` dijawab 200, dan `nyalakan lampu` dijawab **403** `{"pesan":"akun viewer hanya boleh melihat; perintah dan perubahan khusus admin"}`, seperti Praktik 3.5.
2. Terminal menjawab `viewer@rumah.test sekarang admin (berlaku paling lambat 15 menit lagi, saat gelangnya diperbarui)`. Pesan itu sudah membocorkan jawabannya.
3. **Masih 403.** Satpam tidak bertanya ke database. Ia hanya membaca gelang, dan gelang yang kamu pegang dicetak saat *login* di langkah 1, dengan `"peran":"viewer"` di dalamnya. Gelang itu tetap sah sampai `exp`, paling lama 15 menit. Coba kirim `siapa saya` di antara langkah 3 dan 4: jawabannya sudah `"peran":"admin"` karena loket itu membaca tabel `users`, sedangkan satpam tetap membaca gelang lama.
4. Loket *refresh* membaca ulang akunmu dari tabel `users` (Konsep 7), lalu mencetak gelang baru dengan `"peran":"admin"`. Kali ini `nyalakan lampu` dijawab **200**, dan relay lampu berbunyi "klik". Kirim juga `matikan lampu` sebelum lanjut karena sebentar lagi akun ini tidak boleh lagi memerintah.
5. Setelah perannya dikembalikan dan gelangnya diperbarui, `nyalakan lampu` kembali dijawab **403**.

Log backend dari percobaan penulis (**contoh**, baris `siapa saya` dan `matikan lampu` tidak ditampilkan):

```text
[15:37:31] INFO: login: akun 2 (viewer), sesi 43, IP 127.0.0.1
[15:37:31] INFO: POST /auth/login -> 200 (869 ms)
[15:37:35] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices/a4cf12e5b7c0/command
[15:37:35] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (7 ms)
[15:39:11] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices/a4cf12e5b7c0/command
[15:39:11] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
[15:39:50] INFO: POST /auth/refresh -> 200 (115 ms)
[15:39:52] INFO: perintah c-20261022-083952-2 (api) ke a4cf12e5b7c0: lampu = true, ack ok=true dalam 34 ms
[15:39:52] INFO: POST /devices/a4cf12e5b7c0/command -> 200 (54 ms)
[15:41:41] INFO: POST /auth/refresh -> 200 (72 ms)
[15:41:43] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices/a4cf12e5b7c0/command
[15:41:43] INFO: POST /devices/a4cf12e5b7c0/command -> 403 (1 ms)
```

Penolakan `-> 403` yang kedua terjadi **sesudah** peran di database diubah. Itulah "gelang yang terlambat tahu". Kebalikannya lebih penting: akun yang **diturunkan** dari `admin` ke `viewer` masih bisa memerintah sampai gelangnya diperbarui, paling lama 15 menit. Itu harga gelang yang diperiksa tanpa database (Konsep 7). Kalau akun itu harus dikunci sepenuhnya, ganti juga sandinya (`npm run pengguna -- sandi …`) supaya kartu terusannya ikut dicabut. Gelang yang sedang dipegangnya tetap sah sampai habis, paling lama 15 menit; cara menarik gelang lebih cepat dibahas di 🔬 "Menarik gelang sebelum kedaluwarsa: daftar hitam JWT".

</details>

### Tingkat 2 — Keluar dari semua perangkat (45–60 menit)

HP-mu hilang, dan di HP itu kamu masih *login*. Tambahkan rute **`POST /auth/logout-semua`** yang mencabut **semua** sesi milik akun yang sedang *login*, memutus semua sambungan Socket.IO-nya, mengosongkan kedua *cookie*, lalu menjawab `{"pesan":"semua sesi akun ini sudah dicabut","jumlah":<berapa sesi>}`.

Petunjuk:

- Di `src/db/pengguna.ts`, buat fungsi `hapusSemuaSesi(penggunaId)` yang menghapus semua baris `sesi` milik akun itu dengan `DELETE … RETURNING id`, lalu mengembalikan daftar nomornya.
- Di `src/routes/auth.ts`, tulis rutenya. Nomor akun ada di `req.user.sub` (teks, jadi ubah dengan `Number()`). Panggil `putuskanSesi()` untuk setiap nomor sesi, lalu kosongkan *cookie* seperti `POST /auth/logout`.
- Rute ini **tidak** termasuk pintu terbuka karena hanya orang yang sedang *login* yang boleh memakainya. Namun, akun `viewer` juga harus boleh keluar dari semua perangkatnya, padahal satpam menolak `POST` dari `viewer`. Tambahkan pengecualian kecil di satpam untuk rute ini.
- Uji dengan dua sesi sekaligus: *login* di Bruno **dan** jalankan terminal kecil dengan akun yang sama. Setelah `logout-semua` dari Bruno, terminal kecil harus langsung terputus, dan *refresh* dari kedua tempat dijawab 401. Terminal kecil lalu *login* ulang sendiri dengan sandi di `alat/.env` dan tersambung lagi dengan sesi baru. Itu wajar karena `logout-semua` mencabut sesi, bukan sandi.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Isi lengkap ketiga file kunci ada di [`kode/tantangan/kunci/backend/`](kode/tantangan/kunci/backend/): `src/db/pengguna.ts`, `src/routes/auth.ts`, dan `src/auth/keamanan.ts`, ditambah permintaan Bruno `bruno/logout semua.yml`. Bagian pentingnya:

- **`hapusSemuaSesi()` cukup satu kueri:** `DELETE FROM sesi WHERE pengguna_id = $1 RETURNING id`. `RETURNING id` mengembalikan nomor setiap sesi yang terhapus, lalu `Number()` mengubahnya menjadi angka karena `bigint` datang dari pg sebagai teks.
- **Urutan di rute itu penting:** hapus sesinya dulu, baru panggil `putuskanSesi()` untuk setiap nomor. Klien yang diputus biasanya langsung mencoba *refresh*, dan saat itu kartu terusannya harus sudah tidak ada.
- **Pengecualian satpam hanya satu baris**, ditulis **sesudah** gelang diperiksa dan **sebelum** pemeriksaan peran:

  ```ts
  if (`${req.method} ${url}` === "POST /auth/logout-semua") return;
  ```

  Karena letaknya di situ, tamu tanpa gelang tetap dijawab 401, halaman asing tetap 403 (pemeriksaan asal ada di paling atas), dan `POST` lain dari akun `viewer` tetap 403. Rute ini juga tidak diberi `TERBUKA`, jadi di `/docs` ia bergembok.

**Hasilnya** (**contoh**). `login viewer` di Bruno, terminal kecil berjalan dengan akun yang sama, lalu `logout semua`:

```json
{"pesan":"semua sesi akun ini sudah dicabut","jumlah":2}
```

Di terminal kecil:

```text
[16.00.06] terputus: io server disconnect
[16.00.07] refresh ditolak (401), login ulang
[16.00.08] login sebagai viewer@rumah.test
[16.00.08] tersambung ke http://127.0.0.1:8080 (websocket)
[16.00.08] mengikuti a4cf12e5b7c0
```

Di log backend:

```text
[16:00:06] INFO: klien realtime terputus: WxF1am_8GbdzD58lAAAA (server namespace disconnect)
[16:00:06] INFO: logout semua: akun 2, 2 sesi dicabut
[16:00:06] INFO: POST /auth/logout-semua -> 200 (67 ms)
[16:00:07] INFO: POST /auth/refresh -> 401 (123 ms)
[16:00:08] INFO: login: akun 2 (viewer), sesi 46, IP 127.0.0.1
[16:00:08] INFO: POST /auth/login -> 200 (1349 ms)
```

Sesudahnya, `refresh` di Bruno dijawab 401 `{"pesan":"belum login: cookie sesi tidak ada"}` karena kedua *cookie* sudah dikosongkan. Kartu terusan lama yang sempat disalin orang dijawab 401 `sesi sudah tidak berlaku: silakan login lagi`. Akun `admin` pun bisa memakai rute ini: dengan satu sesi, jawabannya `"jumlah":1`.

Perhatikan terminal kecil di atas. Sambungannya benar-benar diputus, dan *refresh*-nya ditolak, tetapi ia langsung *login* lagi karena sandinya tersimpan di `alat/.env`. Jadi, keluar dari semua perangkat mencabut **sesi**, bukan **sandi**. Kalau HP yang hilang itu menyimpan sandimu, atau kamu curiga ada orang yang tahu sandinya, ganti sandinya dengan `npm run pengguna -- sandi <email>`: semua sesi ikut dicabut, dan sandi lama tidak bisa dipakai untuk *login* lagi. Batasnya tetap sama seperti *logout* biasa (Konsep 7): gelang yang sedang dipegang perangkat itu masih sah paling lama 15 menit, termasuk untuk menyambung lagi ke Socket.IO (Praktik 7.6). Setelah itu, *refresh*-nya ditolak dan *login*-nya gagal, jadi perangkat itu benar-benar terkunci di luar.

</details>

### Tingkat 3 — Siapa yang menekan tombol? (60–90 menit)

Sejak Modul 19, tabel `commands` mencatat **sumber** setiap perintah (`api`, `aturan`, `jadwal`, atau `telegram`), tetapi belum mencatat **siapa** yang menekan tombolnya. Buatlah catatan itu:

- Tulis migrasi **`009_pengguna_di_perintah.sql`** yang menambahkan kolom `pengguna_id` ke tabel `commands`, menunjuk `users (id)` dengan `ON DELETE SET NULL` supaya riwayat perintah tidak ikut hilang saat akun dihapus.
- Beri `perintahkan()` satu parameter pilihan untuk nomor akun, lalu isi dari `req.user.sub` di rute `POST /devices/:id/command`. Perintah dari aturan, jadwal, dan Telegram tetap tanpa nomor akun.
- Tulis kueri yang menjawab "siapa menyalakan lampu hari ini, dan jam berapa?", dengan nama akun dari tabel `users`.

Nomor `009` dipakai tantangan ini. Kalau kamu melewatinya, tidak apa-apa: migrasi utama Modul 21 tetap bernomor `010`, dan `npm run migrasi` menerapkan file menurut urutan nomornya walaupun ada nomor yang terlewat. Tingkat 3 sengaja tanpa kunci; cocokkan hasilmu dengan Konsep 11 (data seperlunya) dan dengan *pull request*-mu sendiri.

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini **berkunci untuk manusia**. Hanya akun terdaftar yang bisa masuk, sandinya disimpan sebagai sidik jari, gelang berumur 15 menit dan kartu terusannya tinggal di *cookie* `HttpOnly`, satpam menjaga setiap pintu HTTP, pintu aula Socket.IO memakai gelang yang sama, penebak sandi tertahan jam pasir, dan halaman asing tidak bisa menumpang *login*-mu.

![Diagram proyek Rumah Pintar Mini setelah Modul 20: rumah kini berkunci untuk manusia, yaitu akun, login, peran, dan pengaman API; garis putus-putus berarti pilihan, pensiun, atau menyusul. Baris atas, dari kiri: Node 2 Kebun v1.0.0 dengan baterai 18650, tidak berubah, mengirim lewat ESP-NOW ke Node 1 Rumah v1.5.0, yang punya pengaman kipas lokal, mode offline, dan config ke NVS dari Modul 19, dan tidak berubah minggu ini. Node 1 mengirim MQTT ke gateway Raspberry Pi 192.168.1.37 yang berisi Mosquitto, broker MQTT yang belum berkunci, dan Node-RED dengan dashboard, kartu Kebun, dan grup Sensor RS-485, sedangkan otomasi kipas tetap pensiun sejak Modul 16. Pi tersambung ke HP (Node-RED dan Telegram); Telegram, dengan peringatan dan /status, tidak berubah. Di kiri tengah, kartu putus-putus simulator Modul 19 (pilihan), pengganti perangkat sungguhan, f00d00000001 sampai f00d00000010, tidak berubah karena perangkat dan broker baru dikunci di Modul 21, dengan jalur MQTT putus-putus ke broker. Di bawahnya, kotak catatan jujur dengan empat butir: backend masih hanya di 127.0.0.1 (laptop); gelang yang telanjur disalin tetap sah, paling lama 15 menit; hitungan jam pasir di memori, nol lagi saat backend restart; MQTT dan broker belum berkunci (Modul 21). Kotak besar Laptop, backend di 127.0.0.1:8080, menerima rpm/# dari broker, mengirim cmd (set, config), dan tersambung ke Telegram lewat internet, HTTPS keluar dengan long polling. Di dalamnya, kotak hijau backend v0.5, berkunci untuk manusia: Fastify dan TypeScript dengan kontrak data 1.3, lalu yang baru: akun dan login dengan sidik jari bcrypt; JWT di cookie httpOnly; refresh token dan tabel sesi; satpam 401 dan 403; peran admin dan viewer; rate limit login 10 per menit; CORS dan pemeriksaan asal; Socket.IO ikut dikunci; .env yang diperiksa Zod; dan Vitest 18 tes, termasuk 7 tes keamanan yang baru; serta yang tetap: realtime, aturan, jadwal, bot Telegram, dan 0.5.0 di /docs. Daftar API terbagi dua. Terbuka tanpa login: GET /health, GET /docs, serta POST /auth/login, POST /auth/refresh, dan POST /auth/logout yang baru. Butuh login, ditandai gembok, untuk semua yang lain: GET /auth/me yang baru, GET /devices, GET /devices/:id/latest, /vitals, /readings, dan /state, GET /rules, POST /devices/:id/command, POST /rules, PUT /rules/:id, dan POST /rules/:id/jalankan; POST dan PUT khusus admin. Backend tersambung lewat pg (pool) ke kotak biru Docker Desktop, kontainer rumahpintar-db: PostgreSQL 17 dan TimescaleDB 2.30.2, volume rumahpintar-data, loket 127.0.0.1:5432; tabel baru sesi berisi SHA-256 kartu terusan yang berumur 7 hari; users ditambah sandi_hash dan sandi_diubah; akun contoh admin@rumah.test (admin) dan viewer@rumah.test (viewer); dan yang tetap: readings, events, commands, rules, serta petugas. Di kanan, para tamu backend: terminal kecil yang login dengan akun viewer dari alat/.env, lalu memakai cookie yang sama di handshake Socket.IO, dan menerima data live; Bruno yang menyimpan cookie otomatis, dengan 6 permintaan baru dan sandi di bruno/.env yang tidak ikut Git; dan browser yang membuka /docs, memakai Try it out POST /auth/login dulu, lalu cookie dibawa browser; catatan: semuanya membawa cookie akses, yaitu gelang. Untuk database: DBeaver lewat loket 5432, psql lewat docker exec, dan folder backup/ berisi berkas pg_dump dari Modul 18. Kiri bawah, kartu GitHub rumah-pintar-mini: cabang fitur/keamanan-pengguna menjadi pull request ke main, dan pull request keamanan pengguna ditinjau dengan checklist keamanan, lalu di-merge. Berkas yang baru atau berubah: backend/package.json, ditambah 5 paket, allowScripts bcrypt, skrip pengguna, dan versi 0.5.0; backend/migrasi/008_login_dan_sesi.sql, baru; backend/src/routes/auth.ts, baru; backend/src/auth/, baru, berisi sandi.ts, token.ts, keamanan.ts, dan auth.test.ts; backend/src/db/pengguna.ts dan kelola-pengguna.ts, baru; backend/src/services/realtime.ts, dikunci; backend/src/config/env.ts dan .env.example, dengan Zod serta JWT_SECRET dan CORS_ORIGIN; backend/src/routes/kesehatan.ts, /health terbuka; backend/.gitignore, ditambah pola berkas uji curl login bintang .json dan kue bintang .txt; backend/src/server.ts, keamanan dipasang sebelum rute, gembok di /docs, dan versi 0.5.0; backend/bruno/, ditambah 6 permintaan; backend/README.md, v0.5; alat/terminal-live.js, login dengan akun viewer; alat/.env.example, baru; alat/.gitignore, ditambah .env; dan .github/pull_request_template.md, ditambah Checklist keamanan. Kotak bergembok: tidak pernah ikut Git: backend/.env, backend/bruno/.env, alat/.env, serta berkas uji login bintang .json dan kue bintang .txt. Kanan bawah, tiga kartu putus-putus yang menyusul: Modul 21, kunci perangkat, yaitu API key, provisioning, dan hak akses broker (ACL); Modul 22, dashboard React yang dimulai dengan form login minimal, dan asal Vite 5173 sudah ada di CORS_ORIGIN; Fase 5, HTTPS dan cookie Secure saat backend dibuka ke internet.](aset/diagram-proyek-modul-20.png)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini` beserta terminalnya) dan **browser** yang sudah masuk ke GitHub.
>
> ⭐ **Wajib** — langkah D menggabungkan semua pekerjaan Modul 20 ke `main`, dan Modul 21 dimulai dari sana.

| File di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `backend/package.json`, `package-lock.json` | paket bcrypt (dengan `allowScripts`), @fastify/cookie, @fastify/jwt, @fastify/rate-limit, dan @fastify/cors; `@types/bcrypt` sebagai alat pengembangan; skrip `pengguna`; versi 0.5.0 (Kemenangan Cepat, Praktik 1, 2, 5, 6, dan 8) |
| `backend/src/config/env.ts`, `.env.example` | seluruh `.env` diperiksa Zod saat menyala, ditambah setelan `JWT_SECRET` dan `CORS_ORIGIN` (Praktik 1 dan 6) |
| `backend/migrasi/008_login_dan_sesi.sql` | **baru**: sidik jari sandi di tabel `users` dan tabel `sesi` untuk kartu terusan (Praktik 1) |
| `backend/src/auth/sandi.ts`, `token.ts`, `auth.test.ts` | **baru**: sidik jari sandi, kartu terusan, dan 7 *unit test* (Praktik 1, 2, dan 4) |
| `backend/src/auth/keamanan.ts` | **baru**: *cookie*, JWT, satpam, jam pasir, CORS, dan pemeriksaan asal (Praktik 2, 3, 5, dan 6) |
| `backend/src/db/pengguna.ts`, `kelola-pengguna.ts` | **baru**: akun dan sesi di database, serta perintah `npm run pengguna` (Praktik 1–4) |
| `backend/src/routes/auth.ts` | **baru**: `POST /auth/login`, `/auth/refresh`, `/auth/logout`, dan `GET /auth/me` (Praktik 2–5 dan 7) |
| `backend/src/routes/kesehatan.ts` | `/health` tetap terbuka dan tanpa gembok di `/docs` (Praktik 3) |
| `backend/src/services/realtime.ts` | Socket.IO ikut dikunci (Praktik 7) |
| `backend/src/server.ts` | keamanan dipasang sebelum rute, gembok di `/docs`, Socket.IO berkunci, dan versi 0.5.0 (Praktik 2, 3, 7, dan 8) |
| `backend/.gitignore` | berkas uji curl `login*.json` dan `kue*.txt` (Praktik 2) |
| `backend/bruno/` | enam permintaan baru: `login admin`, `login viewer`, `login salah`, `siapa saya`, `refresh`, dan `logout` (Praktik 2–4); sandinya di `bruno/.env`, yang tidak ikut Git |
| `alat/terminal-live.js`, `.env.example`, `.gitignore` | terminal kecil yang *login* dengan akun `viewer`; `alat/.env` tidak ikut Git (Praktik 7) |
| `backend/README.md` | cara menjalankan dan memakai backend v0.5 (langkah A) |
| `.github/pull_request_template.md` | bagian **Checklist keamanan** (langkah B) |

### A. Perbarui `backend/README.md`

Teman satu tim yang meng-*clone* repositorimu kini harus tahu hal-hal yang tidak bisa ditebak dari kodenya: `JWT_SECRET` wajib diisi sebelum apa pun dijalankan, akun pertama dibuat lewat `npm run pengguna`, dan hampir semua rute butuh *login*. Ganti isi `backend/README.md` dengan:

````markdown
# Backend Rumah Pintar Mini

Backend v0.5 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.3 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL dengan tambahan TimescaleDB (lewat Docker), dan menyediakan API berdokumentasi. Riwayat bacaan bisa diminta mentah atau sudah diringkas per 15 menit, per jam, atau per hari. Sejak Modul 19, bacaan juga mengalir *live* lewat Socket.IO, semua perintah lewat satu pintu (dengan keadaan yang diinginkan dan yang dilaporkan), aturan otomatis dan jadwal disimpan di database dan bisa diubah lewat API tanpa memulai ulang server, setiap kejadian penting dicatat, dan peringatan dikirim lewat Telegram. Sejak Modul 20, API dan Socket.IO **berkunci**: tamu harus *login* dulu, akun `viewer` hanya boleh melihat, percobaan *login* dibatasi, dan halaman web lain tidak bisa menyuruh server atas nama pengguna.

## Menjalankan

1. Pasang Node.js 24 LTS dan Docker Desktop.
2. Jalankan database, cukup sekali (ganti `ganti-sandi-ini` dengan sandimu; pakai huruf, angka, dan tanda minus saja):

   ```text
   docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. Di folder ini, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` (alamat broker) dan sandi database di `DATABASE_URL`.
5. Buat kunci tanda tangan JWT dengan perintah ini, lalu tempel hasilnya (43 karakter acak) di `JWT_SECRET` pada `.env`. Langkah ini wajib **sebelum** langkah berikutnya: server, `npm run migrasi`, dan `npm run pengguna` menolak berjalan kalau `JWT_SECRET` kosong, kurang dari 32 karakter, atau masih berisi contoh.

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

6. Buat tabel-tabelnya dengan `npm run migrasi`.
7. Petugas ringkasan hanya meringkas ulang 3 hari terakhir. Riwayat yang lebih tua dan masuk sekaligus (bacaan yang sudah ada sebelum migrasi `003`, data latihan dari `npm run isi-riwayat`, atau uji beban di bawah) baru tersimpan di buku ringkasan per jam kalau diringkas **sekali** dengan perintah ini, sesudah datanya masuk:

   ```text
   docker exec rumahpintar-db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', NULL, now() - INTERVAL '1 hour');"
   ```

   Jangan mengulang perintah ini setelah retensi (migrasi `004`) membuang data lama: jendela `NULL` ikut menghapus ringkasan lama yang bacaan mentahnya sudah dibuang.
8. Buat akun pertama: satu `admin` dan (sebaiknya) satu `viewer`. Sandi ditanyakan dua kali dan hanya tampil sebagai `*`; jalankan di terminal VS Code (PowerShell) atau Terminal macOS, bukan di jendela Git Bash.

   ```text
   npm run pengguna -- tambah admin@rumah.test "Admin Rumah" admin
   npm run pengguna -- tambah viewer@rumah.test "Tamu Rumah" viewer
   ```

9. (Tidak wajib) Untuk peringatan Telegram, isi `TELEGRAM_BOT_TOKEN` (token dari @BotFather) dan `TELEGRAM_CHAT_ID` (angka yang dibalas bot saat kamu mengirim `/start`) di `.env`. Kosong = notifikasi Telegram mati. Token itu rahasia, seperti kata sandi.
10. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`. Untuk mencoba rute bergembok di sana, *login* dulu lewat **Try it out** di `POST /auth/login`; browser menyimpan *cookie*-nya dan mengirimnya sendiri ke rute lain (tombol **Authorize** tidak dipakai).

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode atau `.env` disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis; **Ctrl + C** menghentikannya dengan rapi (di Windows, `npm run dev` + **Ctrl + C** mematikan server seketika) |
| `npm run cek` | memeriksa tipe TypeScript, termasuk file uji (jalankan sebelum setiap *commit*) |
| `npm test` | menjalankan *unit test* *rules engine* (`src/aturan/*.test.ts`) dan *login* (`src/auth/*.test.ts`) dengan Vitest |
| `npm run migrasi` | menjalankan file SQL baru di folder `migrasi/` (aman diulang) |
| `npm run isi-riwayat` | mengisi data latihan 7 hari untuk perangkat latihan `f00d00000001` dan `f00d00000002` |
| `npm run pengguna -- tambah <email> "<nama>" <admin\|viewer>` | membuat akun; sandi ditanyakan dan hanya tampil sebagai `*` (minimal 15 karakter, maksimal 72 *byte*) |
| `npm run pengguna -- sandi <email>` | mengganti sandi; semua sesi akun itu dicabut (harus *login* lagi) |
| `npm run pengguna -- peran <email> <admin\|viewer>` | mengganti peran (berlaku paling lambat 15 menit lagi, saat gelangnya diperbarui) |
| `npm run pengguna -- hapus <email>` | menghapus akun beserta semua sesinya |
| `npm run pengguna -- daftar` | menampilkan semua akun (tanpa sidik jari sandi) |

Untuk uji beban, `uji/beban-1-juta.sql` memuat 1.036.801 bacaan palsu (satu setiap 10 detik selama 120 hari) untuk perangkat uji `beef00000001`. Jalankan dari folder ini:

```text
docker cp uji/beban-1-juta.sql rumahpintar-db:/tmp/beban-1-juta.sql
docker exec rumahpintar-db psql -U postgres -d rumahpintar -f /tmp/beban-1-juta.sql
```

## *Login* dan pengaman

- **Akun** hanya dibuat dari terminal (`npm run pengguna`); tidak ada rute pendaftaran di API. Database menyimpan sidik jari sandi (bcrypt, *cost* 12), bukan sandinya.
- **`POST /auth/login`** menjawab dua *cookie* `HttpOnly; SameSite=Strict`: `akses` (JWT 15 menit, `Path=/`) dan `sesi` (*refresh token* 7 hari, `Path=/auth`; database hanya menyimpan SHA-256-nya). Email salah dan sandi salah dijawab sama: `401 {"pesan":"email atau sandi salah"}`.
- **Gelang habis?** `POST /auth/refresh` menukar *cookie* `sesi` dengan gelang baru dan kartu terusan baru (rotasi). Kartu terusan lama yang dipakai lagi 30 detik atau lebih sesudah diganti dianggap curian: sesinya dicabut. **`POST /auth/logout`** menghapus sesi, mengosongkan kedua *cookie*, dan memutus sambungan Socket.IO sesi itu.
- **Rute terbuka** (tanpa *login*): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET`/`HEAD /health`, dan `/docs`. Semua rute lain, termasuk rute baru dan URL yang tidak ada, menjawab `401` bagi tamu.
- **Peran**: `admin` boleh semua; `viewer` hanya `GET`/`HEAD` (selain itu `403`).
- ***Rate limit***: paling banyak 10 percobaan `POST /auth/login` per menit dari alamat IP yang sama; percobaan ke-11 dijawab `429` dengan kepala `retry-after`. Hitungannya di memori: server dimulai ulang = mulai dari nol.
- **CORS dan asal halaman**: halaman web di `CORS_ORIGIN` (`.env`, bawaan `http://localhost:5173,http://127.0.0.1:5173` untuk Modul 22) boleh memanggil API dari browser dengan *cookie*. Permintaan selain `GET`/`HEAD` yang membawa kepala `Origin` dari halaman lain ditolak `403`; curl, Bruno, dan Node tidak mengirim `Origin`, jadi tidak terganggu.
- **Bruno**: koleksi `bruno/` punya permintaan `login admin`, `login viewer`, `login salah`, `siapa saya`, `refresh`, dan `logout`. Sandinya dibaca dari `bruno/.env` (tidak ikut Git) berisi `SANDI_ADMIN=…` dan `SANDI_VIEWER=…`. Kirim `login admin` atau `login viewer` dulu; *cookie*-nya dipakai otomatis oleh permintaan lain.

## API

| Rute | Siapa | Gunanya |
| :--- | :--- | :--- |
| `POST /auth/login` | terbuka | *login* dengan `{ "email": …, "sandi": … }`; jawabannya `{ id, email, nama, peran }` + *cookie* `akses` dan `sesi` |
| `POST /auth/refresh` | terbuka (*cookie* `sesi`) | gelang baru + kartu terusan baru |
| `POST /auth/logout` | terbuka | menghapus sesi dan kedua *cookie*; selalu `{"pesan":"sudah logout"}` |
| `GET /auth/me` | login | akun yang sedang *login* (dibaca dari database) |
| `GET /health` | terbuka | server hidup? tersambung ke broker dan database? berapa pesan diterima dan ditolak? |
| `GET /devices` | login | semua perangkat yang terdengar sejak server menyala |
| `GET /devices/:id/latest` | login | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | login | kesehatan terakhir satu perangkat |
| `GET /devices/:id/readings?from=…&to=…` | login | riwayat bacaan mentah dari database (bawaan: satu jam terakhir; paling banyak 1.000 bacaan) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | login | ringkasan riwayat per 15 menit, per jam, atau per hari WIB (bawaan: 1 hari, 7 hari, atau 30 hari terakhir; paling banyak 1.000 ember) |
| `POST /devices/:id/command` | admin | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` (dengan `sumber` `api`) |
| `GET /devices/:id/state` | login | keadaan aktuator: yang diinginkan server (`desired`), yang terakhir dilaporkan perangkat (`reported`, dari `telemetry.state` atau `ack.state`), kapan laporan itu tiba, dan aktuator yang belum cocok (`selisih`) |
| `GET /rules` | login | semua aturan otomatis yang sedang dipakai server; aturan jadwal ditambah `berikutnya` (UTC) |
| `POST /rules` | admin | buat aturan baru: ambang (`kondisi.jenis` `ambang` + `aksi.jenis` `sakelar`) atau jadwal (`jadwal` + `perintah`); langsung berlaku |
| `PUT /rules/:id` | admin | ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server, dan ambang aturan kipas dikirim ke perangkat sebagai `config` *retained* |
| `POST /rules/:id/jalankan` | admin | jalankan aksi satu aturan jadwal sekarang juga (untuk menguji, tanpa menunggu jamnya) |

"login" = akun apa pun yang sudah *login* (`admin` atau `viewer`). Data *live* tersedia lewat **Socket.IO** di alamat yang sama (`/socket.io/`), juga dengan *cookie* `akses`: kirim `ikuti` dengan `device_id` (jawabannya membawa bacaan terakhir) untuk menerima acara `telemetry` perangkat itu; acara `status` dan `kejadian` dikirim ke semua klien. Tanpa *cookie*, sambungan ditolak (`connect_error` `belum login`); saat gelang kedaluwarsa, server memutus sambungan dan klien harus *refresh* lalu menyambung lagi. Contoh klien: `alat/terminal-live.js` (akun dibaca dari `alat/.env`).

Aturan otomatis disimpan di tabel `rules` sebagai data JSON yang diperiksa Zod. Aturan ambang menyala kalau besarannya **di atas** `nyala_di_atas` terus-menerus selama `selama_detik` detik, lalu padam **di bawah** `padam_di_bawah`. Aturan jadwal memakai cron 5 bidang dan selalu dihitung dalam WIB (`Asia/Jakarta`), apa pun zona waktu laptopnya. Contoh aturan kipas:

```json
{"nama":"Kipas otomatis","aktif":true,
 "kondisi":{"jenis":"ambang","device_id":"a4cf12e5b7c0","besaran":"suhu","nyala_di_atas":30,"padam_di_bawah":28,"selama_detik":120},
 "aksi":{"jenis":"sakelar","device_id":"a4cf12e5b7c0","target":"kipas","kabari":true}}
```

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
| `007_aturan_dan_kejadian.sql` | `rules.diubah` dan pemeriksaan bentuk JSON; `commands.sumber` (`api`, `aturan`, `jadwal`, `telegram`), `commands.aturan_id`, dan `commands.state`; tabel buku kejadian `events` (nomor 006 sengaja dilewati: dipakai Tantangan Tingkat 3 Modul 18) |
| `008_login_dan_sesi.sql` | `users.sandi_hash` (sidik jari bcrypt) dan `users.sandi_diubah`, email wajib huruf kecil, tabel `sesi` (SHA-256 *refresh token* sekarang dan sebelumnya, kedaluwarsa 7 hari; ikut terhapus bersama akunnya) |

Contoh: siapa menyalakan kipas hari ini (WIB)?

```sql
SELECT dikirim AT TIME ZONE 'Asia/Jakarta' AS waktu_wib, device_id, sumber, aturan_id, ack_ok
FROM commands
WHERE target = 'kipas' AND nilai = 'true'
  AND dikirim >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
ORDER BY dikirim;
```

`npm run migrasi` juga membuat tabel `schema_migrations` (catatan migrasi yang sudah diterapkan). Tugas terjadwal TimescaleDB dapat dilihat dengan `SELECT * FROM timescaledb_information.jobs WHERE job_id >= 1000;`.

## Backup & restore

Fotokopi seluruh database dibuat **di dalam kontainer** (memakai `pg_dump` yang versinya pasti cocok), lalu disalin ke folder `backup/` (tidak ikut Git):

```text
docker exec rumahpintar-db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
mkdir backup
docker cp rumahpintar-db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-20.dump
```

Ganti `2026-10-20` di nama berkas dengan tanggal hari ini supaya backup-backup berikutnya tidak saling menimpa. Pada backup berikutnya, `mkdir backup` boleh dilewati karena foldernya sudah ada. Sejak Modul 20, fotokopi ini juga berisi akun dan sidik jari sandinya: simpan sebaik menyimpan `.env`.

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

## Batasan v0.5

- `GET /devices`, `latest`, `vitals`, dan `state` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Keadaan yang diinginkan (`desired`) dan hitungan "selama" setiap aturan juga hilang saat server dimulai ulang; riwayat bacaan, perintah, aturan, kejadian, akun, dan sesi tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Bacaan mentah hanya disimpan 90 hari; yang lebih tua tinggal ringkasan per jamnya.
- Hari pada ringkasan `1d` adalah hari WIB (`Asia/Jakarta`), juga bagi perangkat di WITA atau WIT. Jadwal aturan juga dihitung dalam WIB.
- Aturan dan jadwal hanya berjalan selama backend menyala. Jadwal yang terlambat lebih dari 15 menit (misalnya laptop tidur pukul 06.00) tidak dijalankan belakangan, hanya dicatat; kalau backend mati pada jam itu, tidak ada yang dicatat. Saat broker tak terjangkau, Node 1 menjalankan pengaman kipasnya sendiri dengan ambang dari `config`.
- Perubahan aturan langsung di database (misalnya lewat DBeaver) baru terbaca saat server dimulai ulang atau saat aturan lain diubah lewat API; pakai API `/rules`.
- Gelang (JWT akses) yang sudah dibagikan tetap berlaku sampai kedaluwarsa (paling lama 15 menit), juga sesudah *logout*, ganti peran, ganti sandi, atau hapus akun; sambungan Socket.IO yang sedang berjalan pun baru diputus saat gelangnya habis (kecuali *logout* dari sesi itu sendiri, atau kartu terusan lama yang dipakai lagi 30 detik atau lebih sesudah diganti, yang langsung memutusnya).
- Hitungan *rate limit* disimpan di memori satu server: dimulai ulang = nol, dan tidak cocok untuk beberapa server sekaligus.
- *Cookie* belum `Secure` karena server masih `http://`; HTTPS menyusul di Fase 5. Server masih hanya menerima tamu dari laptop ini (`HOST=127.0.0.1`); perangkat (MQTT) belum punya kunci sendiri (Modul 21).
````

Lalu simpan ke cabang `fitur/keamanan-pengguna`. Di terminal kedua, pastikan kamu berada di folder `backend`: ujung baris perintahnya harus `backend>` (macOS: `backend %`). Kalau masih `rumah-pintar-mini>` (macOS: `rumah-pintar-mini %`) karena kamu langsung datang dari Praktik 8.7, ketik dulu `cd backend`. Lalu jalankan:

```text
git add README.md
git commit -m "README backend v0.5 (Modul 20)"
cd ..
```

### B. Tambahkan checklist keamanan ke templat *pull request*

Sejak Modul 16, setiap *pull request* di repositorimu otomatis berisi checklist dari `.github/pull_request_template.md`. Silabus meminta *pull request* minggu ini ditinjau dengan **checklist keamanan**. Alih-alih menuliskannya sekali saja, tambahkan checklist itu ke templat supaya setiap *pull request* berikutnya ikut diperiksa dengan cara yang sama. Buka **`.github/pull_request_template.md`**, lalu tambahkan di paling bawah:

```markdown
## Checklist keamanan

<!-- Sejak Modul 20. Centang hanya yang benar-benar sudah kamu periksa. -->

- [ ] Tidak ada `.env`, `bruno/.env`, `alat/.env`, `login*.json`, `kue*.txt`, sandi, atau token di tab **Files changed**; sandi di permintaan Bruno ditulis `{{process.env.…}}`
- [ ] Setelan rahasia baru (kalau ada) ditambahkan ke `.env.example` tanpa nilai asli, dan diperiksa Zod di `src/config/env.ts`
- [ ] Rute baru sudah dicoba di Bruno sesudah `logout` (dijawab 401), lalu dengan akun `viewer` (403 kalau rutenya mengubah sesuatu)
- [ ] Tidak ada rute baru di `RUTE_TERBUKA` tanpa alasan yang ditulis di *pull request* ini; rute yang memeriksa sandi ikut dijaga jam pasir (`config.rateLimit`)
- [ ] Log baru tidak mencatat sandi, gelang, kartu terusan, *cookie*, email, atau isi permintaan; akun cukup disebut dengan nomornya
- [ ] Sandi dan *refresh token* hanya disimpan sebagai sidik jari, data pribadi baru hanya disimpan kalau memang dipakai, dan data *live* baru hanya dikirim ke *room* Socket.IO yang boleh menerimanya
- [ ] `CORS_ORIGIN` hanya berisi alamat halaman yang memang kita jalankan, satu per satu, dan tidak pernah `*`
- [ ] `npm test` lulus, paket npm baru dipasang dengan versi persis (`npm install nama@versi`) dan tercatat di `package-lock.json`, `npm audit` menjawab `found 0 vulnerabilities`, dan `allowScripts` hanya bertambah untuk paket yang memang butuh skrip pemasangan
```

Butir-butirnya menjawab baris-baris model ancaman di Konsep 1, ditambah satu butir untuk paket npm yang kamu pasang. Simpan, lalu kirim ke GitHub:

```text
git add .github/pull_request_template.md
git commit -m "Templat pull request: checklist keamanan (Modul 20)"
git push
```

### C. Hapus berkas uji dari laptop

Kalau kamu mengerjakan bagian pilihan curl di Praktik 2, 4, 5, dan 6, folder `backend` kini berisi berkas uji seperti `login.json` dan `login-salah.json` (berisi email dan sandi), `kue.txt` (berisi *cookie* hasil *login*), serta `perintah.json`. Baris `login*.json` dan `kue*.txt` di `backend/.gitignore` sudah menahan tiga yang pertama dari Git, tetapi isinya tetap **rahasia**. `perintah.json` tidak rahasia, tetapi juga tidak ditahan `.gitignore`, jadi bisa ikut terbawa oleh `git add .` yang terburu-buru. Hapus keempatnya sekarang lewat Explorer VS Code (klik kanan → **Delete**): kamu bisa membuatnya lagi kapan saja.

### D. ⭐ Gabungkan `fitur/keamanan-pengguna` ke `main` lewat *pull request* "keamanan pengguna"

1. **Buka *pull request*.** Di repositori `rumah-pintar-mini` di GitHub, klik **Compare & pull request** pada pita kuning cabang `fitur/keamanan-pengguna`. Kalau pitanya sudah hilang, buka tab **Pull requests** → **New pull request**, lalu pilih **base: `main`** ← **compare: `fitur/keamanan-pengguna`**. Beri judul `Keamanan pengguna`. Di bawah **Apa yang berubah?**, tulis misalnya: `Backend v0.5: akun dan login (sidik jari bcrypt), JWT di cookie httpOnly, refresh token dengan rotasi dan tabel sesi, satpam 401/403 untuk peran admin dan viewer, batas 10 percobaan login per menit, CORS dan pemeriksaan asal, Socket.IO ikut dikunci, dan .env yang diperiksa Zod. Terminal kecil login dengan akun viewer.` GitHub hanya memakai templat yang sudah ada di cabang `main` (Modul 16 Praktik 8.1), jadi kotak deskripsi ini baru memuat checklist lama; **Checklist keamanan** dari langkah B baru muncul sendiri di *pull request* berikutnya, sesudah cabang ini di-*merge*. Untuk *pull request* ini, salin bagian **Checklist keamanan** dari `.github/pull_request_template.md` di VS Code ke bagian bawah deskripsi, lalu klik **Create pull request**.
2. ***Review* dengan checklist keamanan.** Kerjakan butir demi butir, lalu centang yang benar-benar terpenuhi:
   - Di tab **Files changed**, pastikan **tidak ada** `backend/.env`, `backend/bruno/.env`, `alat/.env`, `login.json`, atau `kue.txt`. Buka juga permintaan Bruno `login admin.yml` dan `login viewer.yml`: isi sandinya harus `{{process.env.SANDI_ADMIN}}` dan `{{process.env.SANDI_VIEWER}}`, bukan sandi sungguhan.
   - Butir setelan rahasia: `.env.example` memuat `JWT_SECRET` dan `CORS_ORIGIN` tanpa nilai asli, dan keduanya diperiksa Zod di `src/config/env.ts` (Praktik 1 dan 6).
   - Butir rute baru: buktinya adalah gladi Praktik 8.5. Rute `/auth` baru yang tidak terbuka, yaitu `GET /auth/me`, dijawab 401 tanpa *login*. Tambahan di `RUTE_TERBUKA` hanya tiga loket `/auth`; alasannya tertulis di Konsep 6, dan loket *login* dijaga jam pasir.
   - Butir paket npm: `npm test` meluluskan 18 tes, lima paket baru dipasang dengan versi persis (`npm install nama@versi`) dan terkunci di `package-lock.json` (di `package.json`, npm menuliskannya dengan awalan `^`, misalnya `"^10.2.5"`), `npm audit` menjawab `found 0 vulnerabilities` (Praktik 8.6), dan hanya `bcrypt@6.0.0` yang ada di `allowScripts`.
   - Butir lainnya sudah kamu buktikan sendiri minggu ini: log di Praktik 8.2, sidik jari di Praktik 1 dan 4, Socket.IO di Praktik 7, dan `CORS_ORIGIN` di Praktik 6.

   Kirim ringkasannya lewat **Review changes** → **Comment** → **Submit review**. Kalau ada file rahasia yang telanjur muncul di **Files changed**, **jangan di-*merge***: ganti rahasianya lebih dulu (Konsep 11), hapus file itu dari Git dengan `git rm --cached <nama file>`, lalu *commit* dan *push* lagi.
3. ***Merge.*** Pilih **Create a merge commit**, klik **Merge pull request** → **Confirm merge**, lalu **Delete branch**.
4. **Pulang ke `main` di laptop.** Di terminal:

   ```text
   git switch main
   git pull --prune
   git branch -d fitur/keamanan-pengguna
   ```

Database tidak terpengaruh oleh perpindahan cabang ini. Migrasi `008` sudah tercatat di `schema_migrations`, dan akun yang kamu buat tetap ada.

### E. Simpan catatan belajarmu

Buka repositori **`belajar-iot`** di jendela VS Code baru (**File → New Window**, lalu **File → Open Folder…**), buat file **`modul-20/catatan.md`** di samping `pemanasan.js` dari 🔁, lalu isi dengan angka dari layarmu sendiri:

```markdown
# Catatan Modul 20 — Keamanan pengguna

| Yang diukur | Angkaku |
| :--- | :--- |
| Lama membuat satu sidik jari bcrypt dengan cost 12 (Kemenangan Cepat) | … ms |
| Lama jawaban login dengan email salah lawan sandi salah (Praktik 2) | … ms lawan … ms |
| Unit test yang hijau (Praktik 4) | … dari … |
| retry-after pada percobaan login ke-11 (Praktik 5) | … detik |
| Berapa menit terminal kecil tersambung sebelum diputus karena gelangnya kedaluwarsa (Praktik 7) | … menit |

Yang paling mengejutkanku: …
```

Lakukan *commit* dan *push* di repositori **`belajar-iot`** dengan GitHub Desktop atau terminal.

**Bukti lulus Modul 20** (bandingkan dengan ✅ di bawah): jawaban 401 untuk semua rute tanpa *login* dan 403 untuk `nyalakan lampu` dari akun `viewer` (Praktik 3), jawaban 429 pada percobaan *login* ke-11 dalam semenit (Praktik 5), dan *pull request* "keamanan pengguna" yang sudah ditinjau dengan checklist keamanan lalu di-*merge*.

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Model ancaman** (*threat model*) | Daftar sederhana: siapa yang mungkin iseng, lewat pintu mana, apa akibatnya, dan kunci apa yang sepadan. |
| **Autentikasi** (*authentication*) | Membuktikan siapa kamu, misalnya dengan *login* lalu menunjukkan gelang. Gagal: **401**. |
| **Otorisasi** (*authorization*) | Memutuskan apa yang boleh kamu lakukan, berdasarkan peranmu. Gagal: **403**. |
| **401 `Unauthorized`** | Belum *login*, atau gelangnya palsu atau sudah kedaluwarsa. Artinya "kamu siapa?", bukan "tidak berhak". |
| **403 `Forbidden`** | Sudah dikenal, tetapi tidak boleh melakukan itu, misalnya akun `viewer` yang mencoba menyalakan relay. |
| **429 `Too Many Requests`** | Terlalu banyak permintaan dalam waktu singkat; di modul ini, percobaan *login* ke-11 dalam semenit. |
| **Sidik jari** (*hash*) | Hasil fungsi satu arah yang panjangnya tetap: teks sama, sidik jari sama; beda satu huruf, sidik jari berubah total; tidak bisa dihitung balik. |
| **bcrypt** | Resep sidik jari khusus kata sandi yang sengaja lambat dan selalu memakai garam. Hasilnya teks 60 huruf berawalan `$2b$`. |
| **Garam** (*salt*) | Bilangan acak 16 *byte* yang dicampur ke setiap sandi sebelum dihitung sehingga sandi yang sama menghasilkan sidik jari berbeda. |
| **Angka biaya** (*cost*) | Seberapa berat bcrypt bekerja: 2 pangkat *cost* putaran. Modul ini memakai 12; naik satu angka berarti dua kali lebih lama. |
| **Kalimat sandi** (*passphrase*) | Sandi panjang dari beberapa kata yang mudah diingat pemiliknya. Lebih kuat daripada sandi pendek yang rumit. |
| **JWT** (*JSON Web Token*) | "Gelang masuk konser": tiga potong teks *base64url* (kepala, isi, tanda tangan). Isinya bisa dibaca siapa saja, tetapi tidak bisa diubah tanpa ketahuan. |
| **`JWT_SECRET`** | Kunci rahasia untuk menandatangani gelang ("stempel panitia"). Hanya ada di `.env` backend. |
| **HMAC** (*hash-based message authentication code*) | Sidik jari yang dicampur kunci rahasia. Dipakai sebagai tanda tangan JWT (HS256). |
| **SHA-256** | Resep sidik jari cepat yang hasilnya 64 huruf heksadesimal. Cocok untuk kartu terusan yang acak, tetapi terlalu cepat untuk kata sandi. |
| ***base64url*** | Cara menulis *byte* apa saja sebagai huruf, angka, `-`, dan `_` sehingga aman ditaruh di alamat web dan *cookie*. |
| **Kepala** (*header*) | Baris keterangan di awal permintaan atau jawaban HTTP, misalnya `Set-Cookie`, `Cookie`, `Origin`, dan `retry-after`. Di Bruno terlihat di tab **Headers**. |
| ***Cookie*** (kuki) | Catatan kecil yang dititipkan server ke browser lewat `Set-Cookie`, lalu dilampirkan browser otomatis ke setiap permintaan berikutnya ke server yang sama. |
| **`HttpOnly`** | Atribut *cookie*: JavaScript halaman tidak bisa membacanya. |
| **`SameSite`** | Atribut *cookie*: apakah *cookie* ikut terlampir pada permintaan yang dipicu situs lain. `Strict` berarti tidak pernah. |
| **XSS** (*cross-site scripting*) | JavaScript asing yang berhasil berjalan di halamanmu. Bisa mencuri token di `localStorage`, tetapi tidak bisa membaca *cookie* `HttpOnly`. |
| **CSRF** (*cross-site request forgery*) | Halaman lain menyuruh browser-mu mengirim permintaan ke backend-mu, dengan *cookie*-mu ikut terlampir. |
| ***Refresh token*** ("kartu terusan") | Token acak berumur panjang (paling lama 7 hari) yang hanya ditunjukkan di loket `/auth/refresh` untuk ditukar dengan gelang baru. Database hanya menyimpan sidik jari SHA-256-nya. |
| **Sesi** | Satu *login* di satu browser atau program; satu baris di tabel `sesi`. Dicabut saat *logout*, saat sandi diganti, atau saat kartu terusan lama dipakai lagi. |
| **Rotasi** | Mengganti kartu terusan setiap kali dipakai sehingga kartu curian bisa ketahuan. |
| **Peran** | Hak akun: `admin` boleh semuanya, `viewer` hanya boleh melihat (`GET` dan `HEAD`). |
| **Satpam** | *Hook* `onRequest` Fastify yang memeriksa setiap permintaan HTTP sebelum sampai ke rute: asal, pintu terbuka, gelang, lalu peran. |
| **Terkunci secara bawaan** (*deny by default*) | Semua pintu terkunci, kecuali yang sengaja dibuka. Rute baru otomatis ikut terkunci. |
| **Hak sekecil mungkin** (*least privilege*) | Setiap orang dan program hanya diberi hak yang benar-benar ia butuhkan, misalnya terminal kecil memakai akun `viewer`. |
| ***Rate limiting*** (pembatasan laju) | Membatasi jumlah permintaan per waktu. Di modul ini: 10 percobaan *login* per menit dari satu alamat IP ("jam pasir"). |
| **Asal** (*origin*) | Gabungan skema, nama host, dan port sebuah halaman, misalnya `http://localhost:5173`. |
| **Situs** (*site*) | Skema dan nama domain utama tanpa port (untuk alamat IP, alamat itu sendiri). `http://127.0.0.1:5500` dan `http://127.0.0.1:8080` adalah dua asal, tetapi satu situs. |
| **CORS** (*Cross-Origin Resource Sharing*) | Cara server mengizinkan halaman dari asal lain membaca jawabannya. Aturan browser, bukan kunci server. |
| ***Preflight*** (pemeriksaan pendahuluan) | Permintaan `OPTIONS` yang dikirim browser sebelum permintaan lintas asal yang "berisiko", untuk menanyakan izin. |
| ***Handshake*** (jabat tangan) | Permintaan HTTP pertama Socket.IO. Membawa *cookie* seperti permintaan lain, jadi bisa dipakai untuk memeriksa gelang. |
| ***Secret scanning*** (pemindaian rahasia) | Fitur GitHub yang mencari pola rahasia yang dikenalnya di repositori dan *push*. Jaring pengaman terakhir, bukan pengganti `.gitignore`. |
| ***Push protection*** | Bagian *secret scanning* yang langsung menolak *push* berisi rahasia dengan bentuk yang dikenali, sebelum sampai ke GitHub. |
| **OWASP** | Komunitas keamanan aplikasi terbuka yang menerbitkan, antara lain, daftar OWASP Top 10. Dibahas di 🔬. |

## 📝 Kuis (5 soal)

1. Tuliskan kode status yang diterima, beserta alasannya, untuk lima permintaan ini: (a) `GET /rules` tanpa *cookie*; (b) `PUT /rules/1` dari akun `viewer`; (c) `GET /devices` dengan gelang `admin` yang kedaluwarsa dua menit lalu; (d) percobaan *login* ke-11 dalam semenit, dengan sandi yang **benar**; (e) `GET /tidak-ada` tanpa *login*.
2. Ayah dan ibumu kebetulan memakai sandi yang sama, lalu salinan tabel `users` bocor. (a) Apakah kolom `sandi_hash` keduanya sama? Mengapa? (b) Mengapa penebak tidak bisa sekadar mencocokkannya dengan daftar sidik jari sandi populer yang sudah jadi? (c) Mana yang diterima `npm run pengguna` sebagai sandi baru: `Kopi Pagi #1`, `kopi pagi di teras belakang`, atau sandi berisi 20 emoji? Mengapa?
3. Sebuah library npm yang disusupi berhasil menjalankan JavaScript-nya di halaman dashboard-mu. Apa yang bisa ia lakukan seandainya gelang disimpan di `localStorage`? Apa yang **tidak** bisa ia lakukan karena gelang disimpan di *cookie* `HttpOnly`? Apa yang **masih** bisa ia lakukan?
4. Pencuri berhasil menyalin *cookie* `sesi`-mu pada pukul 09.00. Browser-mu me-*refresh* pada 09.15, lalu pencuri mencoba me-*refresh* dengan kartu curiannya pada 09.20. Apa yang terjadi pada 09.20? Bagaimana kalau urutannya terbalik: pencuri me-*refresh* lebih dulu pada 09.10, lalu browser-mu pada 09.15?
5. Kamu sedang membuka proyek web lain di `http://127.0.0.1:5500`, dan halaman itu ternyata berisi skrip yang mengirim `POST` ke `http://127.0.0.1:8080/devices/f00d00000001/command` dengan *cookie*. (a) Apakah `SameSite=Strict` menahannya? (b) Apakah CORS menahannya? (c) Lapis mana yang akhirnya menolak, dan dengan kode berapa? (d) Apa bedanya kalau halaman itu dibuka dari `http://localhost:5500`?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) **401**: belum *login*. (b) **403**: dikenal, tetapi `viewer` hanya boleh `GET`/`HEAD`. (c) **401**: gelang yang kedaluwarsa sama dengan tidak bergelang; klien perlu me-*refresh* lewat `POST /auth/refresh` (Konsep 7). (d) **429**: selama jam pasir belum habis, loket tidak memeriksa sandi sama sekali (Konsep 8). (e) **401**, bukan 404: satpam tidak mau memberi tahu orang asing rute mana yang ada (Konsep 2).
2. (a) **Tidak sama** karena setiap sidik jari bcrypt memakai garam acak sendiri (Konsep 3, Kemenangan Cepat). (b) Daftar sidik jari jadi hanya berguna untuk sidik jari tanpa garam. Dengan garam, penebak harus menghitung ulang setiap tebakan untuk setiap akun, dan setiap hitungan bcrypt butuh sekitar 0,3 detik. (c) Hanya **`kopi pagi di teras belakang`** (27 karakter). `Kopi Pagi #1` ditolak karena kurang dari 15 karakter walaupun berisi huruf besar, angka, dan simbol. Sandi 20 emoji ditolak karena 20 × 4 = 80 *byte*, melebihi batas 72 *byte* bcrypt. Ingat: jangan pernah memakai contoh sandi dari modul.
3. Dengan `localStorage`, skrip itu bisa **membaca gelangnya dan mengirimnya ke mana saja**, lalu pencurinya memakai gelang itu dari komputernya sendiri sampai kedaluwarsa. Dengan *cookie* `HttpOnly`, skrip itu **tidak bisa membaca** gelangnya. Namun, selama halaman itu terbuka, skrip itu **masih bisa** mengirim permintaan atas namamu karena browser tetap melampirkan *cookie*-nya. `HttpOnly` memperkecil kerugian; mencegah XSS tetap wajib (Konsep 5).
4. Pada 09.15, kartu itu sudah diganti (rotasi) dan pindah ke kolom `token_lama`. Pada 09.20, lebih dari 30 detik kemudian, kartu lama itu muncul lagi, jadi backend menganggapnya **curian dan mencabut sesinya**. Pencuri ditolak (401), dan browser-mu juga harus *login* ulang. Urutan terbalik berakhir sama: pada 09.10 pencuri mendapat gelang dan kartu baru, lalu pada 09.15 browser-mu menunjukkan kartu yang sudah diganti 5 menit sebelumnya sehingga sesinya dicabut. Bedanya, pencuri masih memegang gelang yang sah sampai **09.25** (15 menit sejak 09.10) karena gelang tidak bisa ditarik (Konsep 7).
5. (a) **Tidak**: `127.0.0.1:5500` dan `127.0.0.1:8080` adalah satu situs, jadi *cookie* `SameSite=Strict` tetap terlampir. (b) **Tidak sepenuhnya**: CORS hanya mencegah halaman itu membaca jawabannya. Permintaan "sederhana" tetap terkirim, dan permintaan dengan isi JSON memang tertahan *preflight*, tetapi skrip jahat tidak wajib memakai JSON. (c) **Pemeriksaan asal di satpam**: browser menulis `Origin: http://127.0.0.1:5500`, yang tidak ada di daftar, jadi satpam menjawab **403** sebelum permintaan sampai ke rute (Praktik 6). (d) `localhost` dan `127.0.0.1` adalah **dua situs berbeda**, jadi *cookie*-mu sama sekali tidak terlampir (Konsep 9). Namun, jawabannya tetap **403**: pemeriksaan asal adalah langkah pertama satpam, dan `http://localhost:5500` juga tidak ada di daftar asal. Seandainya pemeriksaan asal tidak ada, jawabannya **401** karena permintaan itu tidak bergelang.

</details>

---

## ✅ Checklist kelulusan Modul 20

Syarat lulus dari Silabus: **tanpa *login* semua *endpoint* menjawab 401, akun `viewer` gagal menyalakan relay (HTTP 403), dan percobaan *login* ke-11 dalam semenit ditolak.** **Jalur tanpa perangkat:** semua butir boleh dicentang dengan simulator Modul 19 (jalur laptop).

- [ ] Pemanasan ulang JavaScript selesai, dan jawaban "Uji dirimu" sudah kucocokkan dengan kuncinya (🔁).
- [ ] Sandi yang sama kuberi sidik jari bcrypt dua kali dan hasilnya berbeda, tetapi keduanya cocok dengan sandi itu (Kemenangan Cepat).
- [ ] Backend menolak menyala tanpa `JWT_SECRET` yang layak, migrasi `008_login_dan_sesi.sql` sudah diterapkan, dan aku punya akun `admin` serta `viewer` yang dibuat dengan `npm run pengguna` (Praktik 1).
- [ ] *Login* memberi dua *cookie* `HttpOnly`, email yang salah dan sandi yang salah dijawab sama, dan aku sudah membaca isi gelangku sendiri (Praktik 2).
- [ ] ⭐ Tanpa *login*, semua *endpoint* menjawab **401**, kecuali pintu yang sengaja dibuka, dan akun `viewer` yang mencoba menyalakan relay mendapat **403** (Praktik 3).
- [ ] *Refresh* mengganti kedua *cookie*, kartu terusan lama yang dipakai lagi mencabut sesinya, *logout* mengunci kembali, dan `npm test` menulis 18 tes yang hijau (Praktik 4).
- [ ] ⭐ Percobaan *login* ke-11 dalam semenit ditolak dengan **429** walaupun sandinya benar (Praktik 5).
- [ ] Halaman dari asal yang diizinkan mendapat izin CORS, dan permintaan `POST` dari asal yang tidak dikenal ditolak **403** (Praktik 6).
- [ ] ⭐ Terminal kecil tanpa *login* ditolak Socket.IO, sedangkan terminal kecil versi Modul 20 *login* dengan akun `viewer`, menampilkan data *live*, dan tersambung lagi sendiri setelah gelangnya kedaluwarsa (Praktik 7).
- [ ] ⭐ Log backend tidak memuat sandi atau token, ketiga file `.env` ditahan `.gitignore` (`git check-ignore -v` menyebut ketiganya, dan `git ls-files "*.env"` tidak menulis apa pun), dan gladi ketiga syarat lulus berhasil dalam sekali jalan (Praktik 8).
- [ ] ⭐ Templat *pull request* sudah punya **checklist keamanan**, dan semua pekerjaan Modul 20 sudah ada di `main` lewat *pull request* "keamanan pengguna" yang ditinjau dengan checklist itu, tanpa file `.env` mana pun (➕).

🎉 **Rumah Pintar Mini kini berkunci untuk manusia.** Hanya akun yang terdaftar yang bisa masuk, setiap peran hanya boleh melakukan bagiannya, penebak sandi tertahan jam pasir, halaman asing tidak bisa menumpang *login*-mu, dan data *live* pun ikut dikunci. Masih ada satu pintu yang terbuka: **broker MQTT**. Perangkat apa pun di WiFi rumahmu masih bisa menerbitkan pesan atas nama Node 1 atau mengirim `cmd` ke relay tanpa lewat backend sama sekali.

> ➡️ **Modul berikutnya:** Modul 21 — Keamanan Perangkat: API Key, Provisioning Sederhana, & Hak Akses Broker (ACL). Setiap perangkat mendapat kuncinya sendiri, hanya boleh berbicara di topiknya sendiri, dan perangkat palsu tidak bisa menyusup.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- Paket backend: [bcrypt](https://github.com/kelektiv/node.bcrypt.js) 6.0.0, [@fastify/jwt](https://github.com/fastify/fastify-jwt) 10.2.5, [@fastify/cookie](https://github.com/fastify/fastify-cookie) 11.1.3, [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit) 11.2.1, dan [@fastify/cors](https://github.com/fastify/fastify-cors) 11.3.1; [*hook* Fastify](https://fastify.dev/docs/latest/Reference/Hooks/) (`onRequest`); Socket.IO 4.8.4: [*middleware*](https://socket.io/docs/v4/middlewares/) (`io.use`) dan [pilihan server](https://socket.io/docs/v4/server-options/) (`cors`, `allowRequest`); [skema keamanan *cookie* di OpenAPI](https://swagger.io/docs/specification/v3_0/authentication/cookie-authentication/).
- Node.js 24.21.0: [modul `crypto`](https://nodejs.org/docs/latest-v24.x/api/crypto.html) (`createHash`, `createHmac`, `randomBytes`).
- Spesifikasi: [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) (JWT), [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725) (praktik terbaik JWT), [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238) (TOTP), [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) (praktik terbaik keamanan OAuth 2.0), dan [RFC 2606](https://datatracker.ietf.org/doc/html/rfc2606) (nama domain `.test` untuk contoh).
- Pedoman: [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) (aturan kata sandi, Juli 2025); OWASP Cheat Sheet Series: [penyimpanan sandi](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [autentikasi](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [manajemen sesi](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [pencegahan CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), dan [verifikasi berlapis](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html); [OWASP Top 10:2025](https://top10.owasp.org/2025/).
- MDN: [*cookie* HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies), [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [kepala `Origin`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin), [asal](https://developer.mozilla.org/en-US/docs/Glossary/Origin), dan [situs](https://developer.mozilla.org/en-US/docs/Glossary/Site).
- GitHub: [*secret scanning*](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), [*push protection*](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection), [daftar pola yang dikenali](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns), dan [menghapus data sensitif dari repositori](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
- Bruno: [*cookie*](https://docs.usebruno.com/send-requests/res-data-cookies/cookies), [file `.env` untuk rahasia](https://docs.usebruno.com/secrets-management/dotenv-file), dan [pilihan `bru run`](https://docs.usebruno.com/bru-cli/run/options).
- Bacaan tambahan 🔬: [OpenID Connect di Google](https://developers.google.com/identity/openid-connect/openid-connect).
- [Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) (JDIH BPK).

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-20`, `model-ancaman`, `sidik-jari-sandi`, `gelang-jwt`, `satpam-dan-peran`, `gelang-dan-kartu-terusan`, `cors-dan-asal`, `diagram-proyek-modul-20` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Perilaku bcrypt, JWT, *cookie*, CORS, dan Socket.IO dari dokumentasi dan spesifikasi di atas; angka dan pesan dari lab penulis untuk modul ini (backend v0.5). Contoh sidik jari, gelang, dan kartu terusan di gambar dibuat khusus untuk contoh, bukan milik akun sungguhan. | CC BY 4.0 |
| `docs-bergembok.png` | Tangkapan layar asli Swagger UI (`/docs`) backend Rumah Pintar Mini penulis di Google Chrome, sesudah satpam terpasang di Praktik 3; dipotong dan disusun ulang, dengan judul, nomor, dan keterangan oleh penulis. | Swagger UI berlisensi Apache-2.0; tangkapan layar Oktober 2026, dipakai untuk tujuan pendidikan, penanda oleh penulis. Judul, nomor, dan keterangan: CC BY 4.0 |
| `cors-di-devtools.png` | Tangkapan layar asli Console Google Chrome DevTools di laptop penulis, sebelum dan sesudah asal halaman ditambahkan ke `CORS_ORIGIN` (Praktik 6.4); dipotong dan disusun ulang, dengan judul, nomor, dan keterangan oleh penulis. | Tangkapan layar Google Chrome DevTools, © Google LLC, Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis. Judul, nomor, dan keterangan: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua perintah dan kode modul ini dijalankan penulis di laptop Windows 11 dengan Node.js 24.21.0 dan npm 11.19.0, database di kontainer lab `timescale/timescaledb:2.30.2-pg17` yang berisi keadaan akhir Modul 19, broker MQTT kecil di laptop, serta simulator perangkat Modul 19, dengan urutan langkah yang sama persis dengan modul ini. Perintah terminal diuji di Windows PowerShell 5.1 dan PowerShell 7.6 dengan curl 8.21.0, dan halaman `/docs` serta DevTools dibuka di Google Chrome. Bruno versi desktop tidak terpasang di laptop penulis: langkah di jendela Bruno ditulis dari Modul 16–19 dan kode sumber Bruno 4.2.1, sedangkan jawaban dan hasil Assert diambil dari Bruno CLI 4.2.1 (`bru run`) dengan koleksi yang sama. Tab **Security and quality** dan pengaturan *push protection* GitHub ditulis dari dokumentasi resmi GitHub di atas, tanpa akun uji. Perintah macOS dan jalur perangkat (Node 1 dan Pi sungguhan) tidak dicoba ulang di modul ini; backend memerintah Node 1 lewat jalur yang sama dengan Modul 19. Penulis memakai port lain di lab (`8201`), yang di sini ditulis `8080`, kecuali di dua tangkapan layar. Jam di contoh log ditulis dalam WIB. Jam, nomor sesi, lama jawaban, angka `retry-after`, dan isi gelang di layarmu pasti berbeda, jadi keluaran seperti itu ditandai **contoh**.

---

[⬅️ Modul 19](../modul-19-realtime-aturan-notifikasi/README.md) · [Fase 3](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 21 — Keamanan Perangkat: API Key, Provisioning Sederhana, & Hak Akses Broker (ACL)](../modul-21-keamanan-perangkat-broker/README.md) ➡️**
