# Modul 19 — Realtime, Kendali Dua Arah, Aturan Otomatis (Cloud & Lokal), & Notifikasi

🌐 **Bahasa Indonesia** · [English](../../en/phase-3-backend-data/module-19-realtime-rules-notifications/README.md)

*Fase 3 · Minggu 19 · Perangkat keras (*hardware*): **Kit A + B** (Node 1 dan gateway Pi dari Modul 12–15) **atau laptop saja** (simulator Modul 16 versi baru dan Wokwi) · Prasyarat: **Modul 18** (backend v0.3 dan database `rumahpintar` dengan TimescaleDB) · Waktu: 9–11 jam, dicicil dalam satu minggu*

[⬅️ Modul 18](../modul-18-timescaledb/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 20 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-20--keamanan-pengguna-login-jwt-di-cookie-peran--pengaman-api)

---

Backend-mu kini sudah pandai mengingat: setiap bacaan tersimpan di database, dirangkum per jam, dibuang sendiri setelah 90 hari, dan punya backup yang terbukti bisa dipulihkan. Namun, ia masih **pasif**. Bacaan baru hanya terlihat di browser kalau seseorang menekan *refresh*. Perintah memang bisa dikirim lewat API, tetapi tidak ada yang memutuskan kapan kipas harus menyala. Sejak otomasi kipas Node-RED dipensiunkan di Modul 16, **tidak ada satu pun yang menyalakan kipas secara otomatis**. Kalau suhu ruang tamu naik ke 33 °C saat kamu di luar rumah, kamu baru tahu ketika membuka dashboard. Lebih parah lagi, kalau laptop mati atau kabel LAN Pi tercabut, rumah kehilangan otaknya sama sekali.

Minggu ini backend belajar **bereaksi**. Data mengalir ke layar begitu tiba, perintah dari server sampai ke perangkat dengan konfirmasi, aturan otomatis bisa diubah tanpa menyentuh kode, Node 1 tetap menjaga rumah saat server tidak terjangkau, dan HP-mu menerima peringatan lewat Telegram.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Bacaan baru hanya terlihat setelah halaman di-*refresh*. | Pada HTTP, klien selalu yang bertanya; server tidak bisa memulai pembicaraan. | **WebSocket lewat Socket.IO**: server mendorong bacaan begitu tiba, dengan satu *room* untuk setiap perangkat (Konsep 1–2, Praktik 1) |
| Server tidak tahu pasti apakah kipas sedang menyala. | Keadaan aktuator hanya ikut di `ack`, sedangkan firmware juga mengubah aktuator sendiri. | Pola **perintah → ack → batas waktu** dan **keadaan yang diinginkan lawan yang dilaporkan** (*desired* lawan *reported*); `telemetry` membawa `state` di kontrak data 1.3 (Konsep 3–4, Praktik 2) |
| Tidak ada yang menyalakan kipas otomatis. | Otomasi Node-RED sudah pensiun, dan backend belum punya otak. | **Mesin aturan** (*rules engine*): "kalau suhu di atas 30 °C selama 2 menit, nyalakan kipas; padamkan di bawah 28 °C" (Konsep 5, Praktik 3) |
| Mengubah ambang suhu berarti mengubah kode lalu *restart*. | Aturan ditulis di dalam kode. | Aturan disimpan di tabel `rules` dan diubah lewat API **`/rules`**, berlaku saat itu juga (Konsep 7, Praktik 4) |
| Siram pagi bergantung pada ingatan manusia. | Backend belum punya penjadwal. | **node-cron**: "siram 10 detik setiap pukul 06.00 WIB" (Konsep 8, Praktik 5) |
| Kamu baru tahu ada masalah saat membuka dashboard. | Belum ada notifikasi. | **Bot Telegram** (grammY) yang mengirim peringatan dalam 10 detik dan menjawab `/status`, tanpa membanjiri HP (Konsep 9, Praktik 6) |
| Kalau broker (di laptop atau di Pi) atau jaringan Pi mati, tidak ada yang menjaga rumah. | Semua keputusan otomatis ada di server. | **Pengaman lokal di firmware** Node 1 v1.5.0: ambang terakhir disimpan di NVS, dan Node 1 mengatur kipasnya sendiri setelah 2 menit kehilangan broker (Konsep 10, Praktik 7) |
| Logika aturan belum pernah diuji otomatis. | Belum ada *unit test* (uji satuan). | **Vitest**: 10 uji satuan untuk mesin aturan (Konsep 6, Praktik 3) |

Di akhir minggu, mengubah ambang suhu lewat API **langsung mengubah perilaku kipas tanpa *restart* server**, Node 1 **tetap bereaksi saat broker dimatikan**, dan Telegram-mu **menerima peringatan dalam 10 detik**. Itulah tiga syarat lulus modul ini. Backend naik ke **v0.4**, firmware Node 1 ke **v1.5.0**, dan kontrak data ke **1.3**.

![Peta jalan Modul 19. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 3 Backend dan data, Modul 16 sampai 21, disorot dengan bingkai hijau. Modul 1 sampai 18 bertanda selesai, Modul 20 dan 21 berwarna hijau, dan Modul 19 ditandai KAMU DI SINI dengan catatan: rumah mulai bereaksi, yaitu data live, aturan otomatis, Telegram, dan pengaman lokal. Di bawahnya, kotak Modul 19 minggu ini, 9 sampai 11 jam dicicil; Kit A + B atau laptop saja, lanjutan langsung Modul 18 dengan backend v0.3 dan database rumahpintar. Daftar kegiatan: pemanasan ulang JavaScript, yaitu Map, fungsi murni, assert, dan setTimeout; Kemenangan Cepat, data live di terminal; Praktik 1, data live lewat Socket.IO dengan satu room per perangkat; Praktik 2, satu pintu perintah dan keadaan perangkat; Praktik 3, otak aturan dan 10 unit test; Praktik 4, aturan di database yang diubah lewat API, dengan syarat lulus ubah ambang tanpa restart; Praktik 5, jadwal siram pagi dengan node-cron; Praktik 6, bot Telegram yang tahu diri, dengan syarat lulus peringatan paling lama 10 detik; Praktik 7, pengaman lokal di Node 1, dengan syarat lulus tetap bereaksi saat broker mati; Praktik 8, uji kelulusan dan simpan ke cabang; dan Tambahan, backend v0.4, firmware v1.5.0, kontrak data 1.3, dan pull request ke main. Praktik 3, 4, 6, 7, 8, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: tiga jalur, yaitu perangkat (Node 1 dan gateway Pi), laptop (broker di laptop dan simulator Modul 19), atau firmware Node 1 di Wokwi; bot Telegram dibuat dengan akun Telegram-mu sendiri, gratis, lewat @BotFather di Praktik 6.](aset/peta-jalan-modul-19.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Ada tiga jalur, pilih yang sesuai perlengkapanmu.** **Jalur perangkat**: Node 1 sungguhan, gateway Pi, dan broker Mosquitto di Pi (Modul 12–15). **Jalur laptop**: broker di laptop dan simulator perangkat versi Modul 19 menggantikan Node 1. **Firmware di Wokwi**: Node 1 v1.5.0 dicoba di simulator Wokwi lewat broker publik; di luar Praktik 7, pembaca jalur ini mengikuti jalur laptop. Setiap langkah menyebut jalurnya kalau caranya berbeda. Perintah simulator ditulis dengan alamat broker laptop (`mqtt://127.0.0.1:1883`). Jalur perangkat, yang juga memakai simulator di Praktik 1–6, menggantinya dengan alamat Pi-mu, misalnya `mqtt://192.168.1.37:1883`.
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **terminal VS Code** (di folder `backend` atau `alat`), **psql** (jendela SQL di dalam kontainer database), **DBeaver**, **Bruno**, browser, **Telegram** di HP atau laptop, Arduino IDE, atau Wokwi. `device_id` Node 1 `a4cf12e5b7c0` dan alamat Pi `192.168.1.37` hanya contoh; pakai milikmu sendiri.
> - **Lanjutan langsung Modul 18.** Kontainer `rumahpintar-db`, database `rumahpintar`, koneksi DBeaver, dan backend v0.3 di cabang `main` dipakai lagi apa adanya.
> - **Kotak Hasilnya.** Semua perintah dan kode modul ini dijalankan penulis di laptop Windows dengan Node.js 24, broker MQTT kecil di laptop (aedes, yang seperti Mosquitto di laptop tidak menyimpan pesan *retained* saat dimulai ulang), simulator perangkat, dan Wokwi. Bot Telegram dicoba lewat server tiruan Telegram di laptop penulis karena bot sungguhan butuh akun Telegram pribadi; langkah membuat bot diambil dari dokumentasi resmi Telegram. Jam, `id` perintah, dan lama jawaban (milidetik) di layarmu bisa berbeda, jadi keluaran seperti itu ditandai **contoh**. Bentuk keluarannya sama.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di VS Code, DBeaver, browser, dan Bruno. **Kecuali di terminal:** menghentikan program yang sedang berjalan tetap **Ctrl + C**. Perintah terminal sama persis di Windows dan macOS, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Mulai minggu ini, aktuator bisa bergerak sendiri.** Kipas, lampu, dan pompa dinyalakan oleh aturan, jadwal, atau pengaman lokal, bukan hanya olehmu. Selama mencoba, jauhkan tangan dan kabel dari kipas, dan pastikan selang pompa masuk ke wadah.
> 2. **Token bot Telegram adalah kunci bot-mu.** Siapa pun yang memegangnya bisa mengirim pesan atas nama bot-mu. Simpan hanya di file `.env` (yang tidak ikut Git), jangan di-*commit*, jangan ditempel di grup, dan cabut lewat @BotFather kalau telanjur bocor.
> 3. **Satu aktuator, satu otak utama.** Pastikan otomasi kipas Node-RED dari Modul 13 tetap mati (Modul 16 ➕ A memensiunkannya). Kalau dua otak mengatur kipas yang sama, kipasnya bisa menyala-padam bergantian.
> 4. **Perintah `set` tidak pernah dikirim *retained*.** Yang boleh *retained* hanya `config` (ambang), sesuai kontrak data. Perintah `set` yang tertempel di broker diserahkan lagi setiap kali perangkat menyambung, dan dikerjakan lagi setiap kali perangkat menyala ulang (ingatan `id`-nya kosong).
> 5. **Bentuk tabel tetap hanya diubah lewat file migrasi**, seperti Modul 17–18.

Ritme modul ini sama dengan Modul 1–18. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🏆 Kemenangan Cepat: data *live* di terminal (20 menit)](#-kemenangan-cepat-data-live-di-terminal-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 WebSocket](#1-websocket-telepon-bukan-kotak-surat) · [2 *Room*](#2-room-satu-saluran-untuk-setiap-perangkat) · [3 Perintah → ack](#3-perintah--ack--batas-waktu-perintah-yang-tahu-nasibnya) · [4 Diinginkan & dilaporkan](#4-keadaan-yang-diinginkan-lawan-yang-dilaporkan) · [5 Mesin aturan](#5-mesin-aturan-aturan-sebagai-data-bukan-kode) · [6 *Unit test*](#6-unit-test-memeriksa-otak-aturan-tanpa-perangkat) · [7 Aturan di database](#7-aturan-di-database-diubah-lewat-api-berlaku-saat-itu-juga) · [8 Penjadwalan](#8-penjadwalan-jam-beker-untuk-server) · [9 Telegram](#9-notifikasi-telegram-penting-cepat-dan-tidak-cerewet) · [10 Pengaman lokal](#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Socket.IO](#praktik-1--data-live-lewat-socketio-40-menit) · [2 Perintah & keadaan](#praktik-2--satu-pintu-perintah-dan-keadaan-perangkat-45-menit) · [3 Otak aturan & *unit test*](#praktik-3--otak-aturan-dan-10-unit-test-60-menit) · [4 Aturan lewat API](#praktik-4--aturan-di-database-diubah-lewat-api-60-menit) · [5 Jadwal](#praktik-5--jadwal-siram-pagi-25-menit) · [6 Telegram](#praktik-6--bot-telegram-yang-tahu-diri-60-menit) · [7 Pengaman lokal](#praktik-7--pengaman-lokal-di-node-1-60-menit) · [8 Uji kelulusan](#praktik-8--uji-kelulusan-dan-simpan-ke-cabang-30-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-19)

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan beda HTTP *polling* dan WebSocket**, lalu **mengalirkan bacaan *live*** (langsung, begitu tiba) dari backend ke terminal lewat Socket.IO, dengan satu *room* untuk setiap perangkat.
2. **Mengirim semua perintah lewat satu pintu** (API, aturan, jadwal, dan Telegram) dengan pola perintah → ack → batas waktu, dan **membandingkan keadaan yang diinginkan server dengan yang dilaporkan perangkat**.
3. **Menulis mesin aturan berbasis data** ("di atas 30 °C selama 2 menit", histeresis 30/28) sebagai fungsi murni, lalu **mengujinya dengan 10 *unit test* Vitest**.
4. **Menyimpan aturan di database dan mengubahnya lewat API** sehingga ambang suhu baru langsung berlaku **tanpa *restart* server**.
5. **Menjadwalkan perintah menurut jam WIB** dengan node-cron, misalnya siram 10 detik setiap pukul 06.00.
6. **Membuat bot Telegram** yang mengirim peringatan **dalam 10 detik** dan menjawab `/status`, tanpa membanjiri HP-mu.
7. **Memasang pengaman lokal di firmware Node 1 v1.5.0** (ambang dari `config` *retained* disimpan di NVS, mode offline setelah 2 menit) dan membuktikan Node 1 **tetap bereaksi saat broker dimatikan**.
8. **Mencatat siapa menyalakan apa dan kapan** di tabel `commands` dan `events`, dan memperbarui kontrak data ke **versi 1.3**.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 18** | Docker Desktop dengan kontainer **`rumahpintar-db`** yang menyala, database `rumahpintar` (migrasi 001–005), koneksi DBeaver, dan **backend v0.3** yang sudah di-*merge* ke `main` di Modul 18 ➕ B. |
| **Node.js 24, VS Code, Git, Bruno** | Sama seperti Modul 16–18. |
| **Broker MQTT** | **Jalur perangkat:** Mosquitto di Pi (Modul 12). **Jalur laptop:** layanan Mosquitto di laptop (Modul 12 Praktik 7). Praktik 7.10 nanti memindahkannya sebentar ke terminal VS Code lalu menghentikannya, jadi pakai broker yang boleh kamu matikan. |
| **Sumber bacaan** | **Jalur perangkat:** Node 1 (dan Node 2 kalau ada) dari Modul 14–15, ditambah simulator perangkat di folder `alat` untuk satu perangkat tambahan di Praktik 1–6. **Jalur laptop:** simulator perangkat saja. Simulator versi Modul 19 disalin dari kurikulum di Praktik 2. |
| **MQTTX** | Dari Modul 11, untuk mengintip dan menerbitkan pesan MQTT dengan tangan. |
| **Akun Telegram** | Di HP atau di aplikasi Telegram laptop, untuk membuat bot lewat @BotFather (Praktik 6). Gratis. |
| **Untuk firmware Node 1 v1.5.0** (Praktik 7) | **Jalur perangkat:** Arduino IDE 2 dengan paket **esp32 3.x** dan library Node 1 dari Modul 10–15. **Tanpa perangkat:** browser untuk **Wokwi**, seperti modul-modul firmware sebelumnya. |
| **Koneksi internet** | Untuk `npm install` (Socket.IO, node-cron, grammY, Vitest; folder `node_modules` backend bertambah sekitar 45 MB) dan untuk bot Telegram. |

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, dan folder repositori `belajar-iot`.

Seperti Modul 16–18, modul Fase 3 dibuka dengan pemanasan JavaScript. Otak aturan, pengingat Telegram, dan pencatat keadaan perangkat minggu ini memakai lima kemampuan kecil: **`Map`** sebagai buku catatan per perangkat, **fungsi murni** yang menerima jam sebagai angka, pemeriksaan hasil dengan **`assert`**, penundaan dan pembatalan pekerjaan dengan **`setTimeout`** dan **`clearTimeout`**, serta gabungan semuanya untuk memutuskan **kapan harus mengabari**. Pemanasan ini mengulang kelimanya dalam satu file kecil. Ketik kodenya sendiri (jangan disalin-tempel), jalankan setelah setiap langkah, lalu cocokkan hasilnya.

**Siapkan foldernya.** Buka folder repositori **`belajar-iot`** di VS Code, klik dulu ruang kosong di panel Explorer, buat folder baru **`modul-19`**, lalu jalankan di terminal:

```text
cd modul-19
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` diperlukan karena file ini memakai `import` (sama seperti pemanasan Modul 16–17). Lalu buat file **`pemanasan.js`** di folder `modul-19`.

### Langkah 1 — `Map`: buku catatan per perangkat

Backend perlu mengingat sesuatu **untuk setiap perangkat**: bacaan terakhir, keinginan terakhir, perintah yang masih menunggu, dan penunda peringatan. **`Map`** adalah wadah pasangan **kunci → isi**, mirip objek sebagai kamus di Modul 18, tetapi dibuat khusus untuk catatan yang bertambah dan berkurang selama program berjalan. Ketik di `pemanasan.js`:

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 19
import assert from "node:assert/strict";

// 1. Map: buku catatan per perangkat
const terakhir = new Map();
terakhir.set("a4cf12e5b7c0", { suhu: 28.5, kipas: false });
terakhir.set("f00d00000001", { suhu: 31.2, kipas: true });
console.log("jumlah perangkat:", terakhir.size);
console.log(terakhir.get("a4cf12e5b7c0"));
console.log(terakhir.has("f00d00000099"), terakhir.get("f00d00000099") ?? "belum pernah mengirim");
for (const [id, bacaan] of terakhir) {
  console.log(`${id}: ${bacaan.suhu} °C, kipas ${bacaan.kipas ? "menyala" : "padam"}`);
}
```

Simpan (**Ctrl + S**), lalu jalankan di terminal:

```text
node pemanasan.js
```

**Hasilnya:**

```text
jumlah perangkat: 2
{ suhu: 28.5, kipas: false }
false belum pernah mengirim
a4cf12e5b7c0: 28.5 °C, kipas padam
f00d00000001: 31.2 °C, kipas menyala
```

- **`set(kunci, isi)`** menyimpan, **`get(kunci)`** mengambil, **`has(kunci)`** bertanya "ada?", dan **`size`** menghitung isinya. `get` untuk kunci yang tidak ada menghasilkan `undefined`, jadi **`??`** (Modul 17) memberinya pengganti yang ramah.
- **`for (const [id, bacaan] of terakhir)`** berjalan dari pasangan ke pasangan. Kurung siku di depannya membongkar setiap pasangan menjadi dua variabel.
- Baris `import assert …` di atas belum dipakai; ia menunggu langkah 3.

### Langkah 2 — Fungsi murni: jam dikirim sebagai angka

Aturan "suhu di atas 30 °C **selama 2 menit**" membutuhkan jam. Kalau fungsi membaca jam sendiri dengan `Date.now()`, hasilnya berubah setiap kali dijalankan dan sulit diperiksa. Jalan keluarnya: jam **dikirim sebagai angka** (milidetik) oleh pemanggil. Fungsi yang hasilnya hanya bergantung pada masukannya disebut **fungsi murni**. Tambahkan di paling bawah:

```js
// 2. Fungsi murni: jam dikirim sebagai angka (milidetik)
function sudahSelama(sejak, sekarang, detik) {
  return sejak !== null && sekarang - sejak >= detik * 1000;
}
console.log(sudahSelama(0, 119_000, 120), sudahSelama(0, 120_000, 120), sudahSelama(null, 999_000, 120));
```

**Hasilnya** (baris baru):

```text
false true false
```

- `sejak` adalah saat suhu mulai melewati ambang, dan `sekarang` adalah jam saat ini, keduanya dalam milidetik. Pada `119_000` (detik ke-119), fungsi menjawab `false`; tepat pada detik ke-120, `true`.
- Garis bawah di `119_000` hanya pemisah ribuan supaya mudah dibaca; JavaScript mengabaikannya.
- `sejak` bernilai `null` berarti "belum mulai menghitung", jadi jawabannya selalu `false`.

### Langkah 3 — Memeriksa dengan `assert`

Memeriksa hasil dengan mata (`false true false`) cepat melelahkan. Lebih baik program yang memeriksanya. Modul bawaan Node.js **`assert`** melakukan persis itu: kalau hasilnya sesuai, ia diam; kalau tidak, ia menghentikan program dengan galat. Inilah bentuk paling sederhana dari **uji satuan** (Konsep 6). Tambahkan:

```js
// 3. Memeriksa dengan assert
assert.equal(sudahSelama(0, 120_000, 120), true);
assert.equal(sudahSelama(0, 119_999, 120), false);
assert.deepEqual(terakhir.get("f00d00000001"), { suhu: 31.2, kipas: true });
console.log("semua pemeriksaan lulus");
```

**Hasilnya** (baris baru):

```text
semua pemeriksaan lulus
```

- **`assert.equal(hasil, harapan)`** memeriksa dua nilai sederhana. **`assert.deepEqual`** memeriksa isi objek sampai ke dalam: dua objek yang dibuat terpisah tetap dianggap sama kalau isinya sama.

Sekarang buat satu pemeriksaan yang sengaja salah. Di pemeriksaan kedua (`sudahSelama(0, 119_999, 120)`), ubah `false` menjadi `true`, simpan, lalu jalankan lagi.

**Hasilnya** (diringkas; jalur file di layarmu berbeda, dan nomor barisnya bisa bergeser kalau kamu tidak menyisakan satu baris kosong di antara setiap langkah):

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

false !== true

    at file:///…/modul-19/pemanasan.js:23:8
```

Program berhenti di pemeriksaan yang gagal, dan pesannya menyebut hasil yang didapat (`false`), yang diharapkan (`true`), serta nomor barisnya (`23`). Baris `semua pemeriksaan lulus` tidak tercetak. Kembalikan `true` itu menjadi `false` sebelum lanjut.

### Langkah 4 — Menunda dan membatalkan: `setTimeout` dan `clearTimeout`

Perangkat yang putus-sambung sebentar tidak perlu membangunkan siapa pun. Backend menunda peringatan `offline` selama 60 detik, dan **membatalkannya** kalau perangkat kembali sebelum waktunya (Konsep 9). Di sini jedanya dipersingkat menjadi 2 detik. Tambahkan:

```js
// 4. Menunda dan membatalkan: setTimeout dan clearTimeout
const penunda = new Map();
function perangkatOffline(id) {
  console.log(`${id} offline, tunggu dulu...`);
  const t = setTimeout(() => {
    penunda.delete(id);
    console.log(`PERINGATAN: ${id} offline lebih dari 2 detik`);
  }, 2000);
  penunda.set(id, t);
}
function perangkatOnline(id) {
  const t = penunda.get(id);
  if (t === undefined) return;
  clearTimeout(t);
  penunda.delete(id);
  console.log(`${id} kembali online, peringatan dibatalkan`);
}
perangkatOffline("a4cf12e5b7c0");
perangkatOffline("f00d00000001");
setTimeout(() => perangkatOnline("a4cf12e5b7c0"), 500);
```

**Hasilnya** (baris baru; dua baris terakhir muncul setelah jeda setengah detik dan dua detik):

```text
a4cf12e5b7c0 offline, tunggu dulu...
f00d00000001 offline, tunggu dulu...
a4cf12e5b7c0 kembali online, peringatan dibatalkan
PERINGATAN: f00d00000001 offline lebih dari 2 detik
```

- **`setTimeout(fungsi, ms)`** menjadwalkan fungsi untuk dijalankan nanti, lalu langsung mengembalikan sebuah "tiket". Program tidak berhenti menunggu.
- Tiketnya disimpan di `Map` **`penunda`**, satu untuk setiap perangkat. **`clearTimeout(tiket)`** membatalkan jadwal itu. Node 1 (`a4cf12e5b7c0`) kembali setelah setengah detik, jadi peringatannya batal. Perangkat `f00d00000001` tidak kembali, jadi peringatannya tercetak setelah 2 detik.
- Node.js baru selesai setelah semua jadwal yang belum dibatalkan dijalankan. Itulah sebabnya program kini berjalan sekitar dua detik.

### Langkah 5 — Kapan harus mengabari?

Langkah terakhir menggabungkan semuanya menjadi aturan *debouncing* (peredam) Telegram (Konsep 9): kabari saat keadaannya **berubah**, diam selama keadaannya tetap aman, dan selama keadaannya tetap berbahaya, ingatkan **paling sering sekali setiap 30 menit**. Tambahkan:

```js
// 5. Kapan harus mengabari?
const TIGA_PULUH_MENIT = 30 * 60_000;
function perluKabari(bahaya, bahayaSebelumnya, terakhirDikabari, sekarang) {
  if (bahaya !== bahayaSebelumnya) return true; // keadaan berubah: selalu kabari
  if (!bahaya) return false; // tetap aman: diam
  return sekarang - terakhirDikabari >= TIGA_PULUH_MENIT; // tetap bahaya: paling sering 30 menit sekali
}
console.log(
  perluKabari(true, false, 0, 0),
  perluKabari(true, true, 0, 10 * 60_000),
  perluKabari(true, true, 0, 30 * 60_000),
  perluKabari(false, true, 0, 31 * 60_000),
  perluKabari(false, false, 0, 99 * 60_000),
);
```

**Hasilnya** (seluruh keluaran):

```text
jumlah perangkat: 2
{ suhu: 28.5, kipas: false }
false belum pernah mengirim
a4cf12e5b7c0: 28.5 °C, kipas padam
f00d00000001: 31.2 °C, kipas menyala
false true false
semua pemeriksaan lulus
a4cf12e5b7c0 offline, tunggu dulu...
f00d00000001 offline, tunggu dulu...
true false true true false
a4cf12e5b7c0 kembali online, peringatan dibatalkan
PERINGATAN: f00d00000001 offline lebih dari 2 detik
```

- Lima jawaban `perluKabari`, dari kiri: suhu **mulai** panas (kabari); masih panas, baru 10 menit sejak pesan terakhir (diam); masih panas, sudah 30 menit (ingatkan lagi); **kembali** sejuk (kabari); tetap sejuk (diam).
- Perhatikan urutannya: baris langkah 5 tercetak **sebelum** dua pesan langkah 4, padahal kodenya di bawah. Pesan langkah 4 baru dicetak setelah jedanya habis, sedangkan langkah 5 berjalan saat itu juga. Backend bekerja dengan cara yang sama: bacaan baru terus diproses selagi peringatan yang ditunda menunggu gilirannya.

**Uji dirimu (10 menit).** Tanpa melihat kunci:

1. Kipas Node 1 dinyalakan. Perbarui catatan Node 1 di `terakhir` supaya `kipas` menjadi `true` **tanpa** mengetik ulang suhunya. Berapa `terakhir.size` sesudahnya?
2. Suhu mulai panas pada detik ke-5 (`sejak` = `5_000`). Apa jawaban `sudahSelama` pada `125_000` dan pada `124_999`, dengan batas 120 detik?
3. Pesan terakhir dikirim pada menit ke-5, dan keadaannya masih berbahaya. Apa jawaban `perluKabari` pada menit ke-34 dan ke-35?

<details>
<summary>Kunci uji dirimu</summary>

```js
// uji 1: perbarui satu kolom dengan spread (Modul 17)
terakhir.set("a4cf12e5b7c0", { ...terakhir.get("a4cf12e5b7c0"), kipas: true });
console.log(terakhir.get("a4cf12e5b7c0"), terakhir.size);

// uji 2: dua menit sejak detik ke-5
console.log(sudahSelama(5_000, 125_000, 120), sudahSelama(5_000, 124_999, 120));

// uji 3: pengingat paling sering 30 menit sekali
console.log(perluKabari(true, true, 5 * 60_000, 34 * 60_000), perluKabari(true, true, 5 * 60_000, 35 * 60_000));
```

1. Hasilnya `{ suhu: 28.5, kipas: true }` dan `2`. `set` dengan kunci yang sudah ada **mengganti** isinya, bukan menambah catatan baru.
2. Hasilnya `true false`: 125.000 − 5.000 = 120.000 milidetik, tepat 2 menit; satu milidetik sebelumnya belum cukup.
3. Hasilnya `false true`: pada menit ke-34 baru lewat 29 menit sejak pesan terakhir, dan pada menit ke-35 genap 30 menit.

</details>

Pemanasan selesai. File `pemanasan.js` disimpan ke GitHub bersama catatan belajarmu di ➕ D.

> ➡️ **Lanjut** ke [🏆 Kemenangan Cepat](#-kemenangan-cepat-data-live-di-terminal-20-menit).

## 🏆 Kemenangan Cepat: data *live* di terminal (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini`) dengan **tiga terminal** (backend, simulator khusus jalur laptop, dan terminal kecil), **Docker Desktop**, dan broker MQTT (Mosquitto di Pi, atau layanan Mosquitto di laptop dari Modul 12). Bacaan datang dari Node 1 sungguhan atau dari simulator Modul 16.

Dalam 20 menit, bacaan sensor muncul di terminal **begitu tiba di backend**, tanpa satu kali pun bertanya. Backend v0.3 hanya ditambah satu file kecil dan empat baris.

### Langkah 1 — Siapkan cabang dan nyalakan yang dibutuhkan (4 menit)

1. Buka folder **`rumah-pintar-mini`** di VS Code (**File → Open Folder…**), lalu buka terminal pertama (**Terminal → New Terminal**). Terminal baru selalu mulai di folder `rumah-pintar-mini`. Buat cabang kerja minggu ini dari `main` yang terbaru:

   ```text
   git switch main
   git pull
   git switch -c fitur/otomasi
   ```

   **Hasilnya** (baris terakhir):

   ```text
   Switched to a new branch 'fitur/otomasi'
   ```

2. Pastikan **Docker Desktop** menyala dan kontainer **`rumahpintar-db`** berjalan (ikon hijau di tab **Containers**). Kalau belum, klik **▶** di barisnya, atau jalankan `docker start rumahpintar-db` di terminal.
3. Pastikan **broker MQTT** menyala: Mosquitto di Pi (jalur perangkat) atau di laptop (jalur laptop). Di laptop, brokernya adalah layanan Mosquitto yang kamu pasang di Modul 12 Praktik 7. Layanan itu menyala sendiri bersama laptop, jadi tidak perlu terminal. Praktik 7.10 nanti memindahkannya sebentar ke terminal VS Code supaya bisa dimatikan dengan sengaja.
4. Pastikan **ada bacaan yang masuk**. **Jalur perangkat:** nyalakan Node 1. **Jalur laptop:** buka terminal kedua (**Terminal → New Terminal**), lalu jalankan simulator Modul 16 untuk satu perangkat:

   ```text
   cd alat
   node simulator-perangkat.js mqtt://127.0.0.1:1883 1
   ```

   **Hasilnya:**

   ```text
   1 perangkat palsu menuju mqtt://127.0.0.1:1883. Hentikan dengan Ctrl+C.
   f00d00000001: online
   ```

   Biarkan terminal ini berjalan. Simulator yang dipakai di sini **sengaja** versi Modul 16 yang sudah ada di folder `alat`; versi Modul 19 menyusul di Praktik 2.

### Langkah 2 — Pasang Socket.IO (3 menit)

Backend memakai paket **`socket.io`**, dan terminal kecil buatanmu memakai **`socket.io-client`** (Konsep 1). Di terminal pertama, masuk ke folder `backend`:

```text
cd backend
npm install socket.io@4.8.4
```

**Hasilnya:**

```text
added 17 packages, and audited 164 packages in 5s

40 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Lalu pasang kliennya di folder `alat`:

```text
cd ../alat
npm install socket.io-client@4.8.4
cd ../backend
```

**Hasilnya** (di antara kedua perintah `cd`):

```text
added 7 packages, and audited 52 packages in 11s

5 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Angka `audited` dan lama detiknya di layarmu bisa sedikit berbeda (**contoh**). Yang penting adalah baris `added …` dan `found 0 vulnerabilities`.

### Langkah 3 — Backend menyiarkan setiap bacaan (7 menit)

Di panel Explorer, klik kanan folder **`backend/src/services`** → **New File…**, beri nama **`realtime.ts`**, lalu ketik:

```ts
// realtime.ts - Socket.IO: data mengalir ke terminal dan browser tanpa refresh (Modul 19).
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";

let io: Server | undefined;

export function mulaiRealtime(app: FastifyInstance): void {
  io = new Server(app.server); // menumpang di server HTTP Fastify, di alamat /socket.io/
  io.on("connection", (socket) => app.log.info(`klien realtime tersambung: ${socket.id}`));
}

// kirim satu telemetry ke SEMUA klien yang sedang tersambung
export function siarkanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  io?.emit("telemetry", deviceId, isi);
}
```

- **`new Server(app.server)`** memasang Socket.IO di server HTTP milik Fastify. Keduanya berbagi port `8080`: permintaan biasa tetap dilayani Fastify, dan sambungan Socket.IO masuk lewat alamat khusus `/socket.io/`.
- **`io.emit("telemetry", deviceId, isi)`** mengirim satu pesan bernama `telemetry` ke **semua** klien yang sedang tersambung. Tanda **`?.`** (Modul 17) mencegah galat kalau Socket.IO belum dipasang.

Sekarang sambungkan file itu ke dua tempat.

1. Buka **`src/services/mqtt.ts`**. Di bawah baris `import { arsipkanStatus, arsipkanTelemetry, arsipkanVitals } from "../db/arsip.ts";`, tambahkan:

   ```ts
   import { siarkanTelemetry } from "./realtime.ts";
   ```

   Lalu cari baris `simpanTelemetry(deviceId, hasil.data);` di bagian `telemetry`, dan tambahkan satu baris tepat di bawahnya:

   ```ts
       siarkanTelemetry(deviceId, hasil.data); // Modul 19: langsung diteruskan ke klien Socket.IO
   ```

   Bacaan disiarkan **setelah** lolos pemeriksaan kontrak, jadi layar tidak pernah menerima pesan yang ditolak.

2. Buka **`src/server.ts`**. Di bawah baris `import { mulaiMqtt } from "./services/mqtt.ts";`, tambahkan:

   ```ts
   import { mulaiRealtime } from "./services/realtime.ts";
   ```

   Lalu tambahkan satu baris tepat **sebelum** baris `mulaiMqtt(env.MQTT_URL, app.log);`:

   ```ts
   mulaiRealtime(app); // Modul 19: Socket.IO di alamat /socket.io/
   ```

   Socket.IO dipasang sebelum `app.listen()`, jadi alamat `/socket.io/` sudah siap begitu server mulai menerima tamu.

Simpan ketiga file, lalu periksa:

```text
npm run cek
```

**Hasilnya:** hanya dua baris judul (`> rumah-pintar-mini-backend@0.3.0 cek` dan `> tsc --noEmit`) tanpa pesan lain. Artinya, TypeScript tidak menemukan kesalahan.

### Langkah 4 — Terminal kecil yang mendengarkan (4 menit)

Jalankan backend di terminal pertama (masih di folder `backend`):

```text
npm run dev
```

**Hasilnya** (**contoh**; jamnya mengikuti laptopmu):

```text
[05:59:30] INFO: database siap
[05:59:31] INFO: Server listening at http://127.0.0.1:8080
[05:59:31] INFO: dokumentasi API: http://127.0.0.1:8080/docs
[05:59:31] INFO: tersambung ke broker mqtt://127.0.0.1:1883
```

Di panel Explorer, klik kanan folder **`alat`** → **New File…**, beri nama **`terminal-live.js`**, lalu ketik:

```js
// terminal-live.js — "terminal kecil": bacaan live dari backend lewat Socket.IO (Modul 19, Kemenangan Cepat).
import { io } from "socket.io-client";

const socket = io(process.argv[2] || "http://127.0.0.1:8080");
socket.on("connect", () => console.log("tersambung ke backend"));
socket.on("telemetry", (deviceId, isi) => console.log(`${deviceId}  suhu ${isi.suhu} °C  tanah ${isi.tanah} %`));
```

Buka terminal ketiga, masuk ke folder `alat`, lalu jalankan:

```text
cd alat
node terminal-live.js
```

**Hasilnya** (**contoh**; satu baris setiap kali bacaan tiba, terus bertambah sampai kamu menekan **Ctrl + C**):

```text
tersambung ke backend
a4cf12e5b7c0  suhu 28.5 °C  tanah 37 %
f00d00000001  suhu 25.8 °C  tanah 27 %
a4cf12e5b7c0  suhu 28.5 °C  tanah 37 %
f00d00000001  suhu 32.3 °C  tanah 36 %
```

Sementara itu, terminal backend mencatat tamunya:

```text
[06:00:21] INFO: klien realtime tersambung: iIMSOuaFwvyCQw2SAAAA
```

Itulah kemenangan cepatmu: **bacaan muncul begitu tiba**, tanpa *refresh* dan tanpa pertanyaan berulang. Baris dari Node 1 (`a4cf12e5b7c0`) hanya muncul kalau Node 1-mu menyala; di jalur laptop, yang tampil hanya `f00d00000001`. Teks acak setelah `tersambung:` adalah nomor sambungan Socket.IO, berbeda setiap kali.

Coba satu hal lagi. Simpan ulang `src/server.ts` (**Ctrl + S** tanpa mengubah apa pun). `npm run dev` memulai ulang backend, sambungan terminal kecil terputus sesaat, lalu baris `tersambung ke backend` muncul lagi **dengan sendirinya**, dan bacaan kembali mengalir. Menyambung ulang otomatis adalah salah satu hal yang disediakan Socket.IO tanpa kode tambahan.

### Langkah 5 — Intip jabat tangan Socket.IO (2 menit)

Bagaimana Socket.IO memulai sambungannya? Buka terminal keempat (atau hentikan sebentar terminal kecil dengan **Ctrl + C**), lalu minta "salam pembuka"-nya dengan `curl` (**Windows:** ketik `curl.exe`, lengkap dengan `.exe`; di Windows PowerShell 5.1, `curl` tanpa `.exe` adalah perintah lain; **macOS:** cukup `curl`):

```text
curl.exe "http://127.0.0.1:8080/socket.io/?EIO=4&transport=polling"
```

**Hasilnya** (**contoh**; `sid` selalu berbeda):

```text
0{"sid":"FumyYLytQpDru1QxAAAB","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}
```

Sambungan Socket.IO selalu dimulai dengan permintaan **HTTP biasa** seperti ini (`transport=polling`). Jawabannya memberi nomor sesi (`sid`) dan mengabarkan bahwa sambungan boleh **naik kelas** ke WebSocket (`"upgrades":["websocket"]`); terminal kecilmu melakukannya sendiri sesaat setelah tersambung. `pingInterval` 25.000 milidetik berarti kedua pihak saling menyapa setiap 25 detik untuk memastikan sambungannya masih hidup (Konsep 1). Permintaan `curl` ini tidak dihitung sebagai klien, jadi baris `klien realtime tersambung` tidak muncul di log backend.

Biarkan backend, simulator (jalur laptop), dan terminal kecil menyala kalau kamu langsung lanjut. Perubahan ini disimpan ke Git di akhir Praktik 1.

> ➡️ **Lanjut** ke [🧠 Konsep "Mengapa"](#-konsep-mengapa): baca Konsep 1–2, lalu kerjakan Praktik 1.

## 🧠 Konsep "Mengapa"

Ada sepuluh konsep. Tidak perlu dibaca sekaligus sebelum praktik. Urutannya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–2 → Praktik 1 (data *live* lewat Socket.IO)
2. Konsep 3–4 → Praktik 2 (perintah dan keadaan perangkat)
3. Konsep 5–6 → Praktik 3 (otak aturan dan *unit test*)
4. Konsep 7 → Praktik 4 (aturan di database, diubah lewat API)
5. Konsep 8 → Praktik 5 (jadwal)
6. Konsep 9 → Praktik 6 (Telegram)
7. Konsep 10 → Praktik 7 (pengaman lokal di Node 1) → Praktik 8 (uji kelulusan)

Kotak ⬆️/➡️ di akhir setiap praktik dan di akhir setiap kelompok konsep di atas mengantarmu ke langkah berikutnya. Potongan kode di bagian konsep cukup dibaca: semuanya ditulis dan dijalankan di praktik.

### 1. WebSocket: telepon, bukan kotak surat

Sejak Modul 16, setiap percakapan dengan backend memakai **HTTP**: browser atau Bruno bertanya, backend menjawab, lalu sambungannya selesai. Polanya seperti **kotak surat**. Kalau kamu menunggu kabar, satu-satunya cara adalah bolak-balik memeriksa kotak surat. Dalam bahasa web, cara ini disebut *polling* (bertanya berulang-ulang): halaman meminta `GET /devices/:id/latest` setiap beberapa detik. Kalau terlalu jarang, kabarnya terlambat. Kalau terlalu sering, kebanyakan pertanyaan dijawab "belum ada yang baru", dan backend sibuk melayani pertanyaan sia-sia.

**WebSocket** bekerja seperti **telepon**. Klien menelepon backend sekali, lalu sambungannya dibiarkan terbuka. Selama sambungan itu hidup, **kedua pihak boleh bicara kapan saja**: backend bisa langsung "mendorong" bacaan baru begitu tiba dari MQTT, tanpa menunggu ditanya. Satu sambungan dipakai terus-menerus, jadi tidak ada lagi tanya-jawab yang sia-sia.

| | HTTP *polling* (kotak surat) | WebSocket (telepon) |
| :--- | :--- | :--- |
| Siapa yang memulai | Selalu klien | Klien menelepon sekali, lalu kedua pihak bebas bicara |
| Bacaan baru sampai | Pada pemeriksaan berikutnya (terlambat sampai satu jeda) | Begitu tiba di backend |
| Pertanyaan sia-sia | Banyak ("belum ada yang baru") | Tidak ada |
| Cocok untuk | Data yang jarang berubah, laporan, riwayat (API Modul 16–18) | Data *live*, keadaan perangkat, peringatan |

Modul ini memakai **Socket.IO**, library yang dibangun di atas WebSocket. Socket.IO menambahkan hal-hal yang harus kamu buat sendiri kalau memakai WebSocket murni: menyambung ulang otomatis saat sambungan putus, *room* (Konsep 2), jawaban untuk setiap pesan (*acknowledgement*), dan jalan cadangan. Saat pertama menyambung, Socket.IO memakai HTTP biasa dulu, lalu "naik kelas" ke WebSocket begitu bisa. Ada satu konsekuensinya: **server dan klien harus sama-sama memakai Socket.IO**. Klien WebSocket murni tidak bisa bicara dengan server Socket.IO, begitu juga sebaliknya. Backend memakai paket `socket.io`, dan terminal kecil buatanmu memakai paket `socket.io-client`.

Jangan tertukar dengan MQTT. Keduanya sama-sama "mendorong", tetapi tugasnya berbeda: **MQTT** menghubungkan perangkat dengan broker dan backend, sedangkan **Socket.IO** menghubungkan backend dengan layar manusia (terminal sekarang, dashboard React *live* di Modul 23). Browser tidak dibiarkan langsung berlangganan broker: ia cukup bicara dengan backend, dan backend-lah yang memeriksa dan menyaring pesan, lalu nanti (Modul 20) juga memeriksa izin penggunanya.

### 2. *Room*: satu saluran untuk setiap perangkat

Bayangkan backend menyiarkan **setiap** bacaan ke **setiap** layar yang tersambung. Selama hanya ada Node 1, tidak apa-apa. Begitu ada Node 2, sepuluh perangkat simulator, dan tiga layar yang masing-masing hanya peduli pada satu ruangan, setiap layar dibanjiri bacaan yang tidak ia butuhkan.

Socket.IO menyediakan ***room*** (ruang): kelompok sambungan yang diberi nama. Backend memasukkan sambungan ke *room* bernama `perangkat:<device_id>`, misalnya `perangkat:a4cf12e5b7c0`, lalu mengirim bacaan Node 1 **hanya ke *room* itu**. Layar yang ingin mengikuti Node 1 cukup meminta masuk ke *room*-nya. Layar lain tidak menerima apa-apa dari Node 1.

Di modul ini, backend dan klien saling mengirim lima macam pesan (Socket.IO menyebutnya *event*, acara):

| Pesan | Arah | Penerima | Isi |
| :--- | :--- | :--- | :--- |
| `ikuti` | klien → backend | — | `device_id` yang ingin diikuti. Backend memeriksanya dengan Zod, memasukkan klien ke *room*-nya, lalu menjawab dengan bacaan terakhir perangkat itu supaya layar tidak kosong selagi menunggu. |
| `berhenti` | klien → backend | — | keluar dari *room* sebuah perangkat |
| `telemetry` | backend → klien | *room* perangkat itu saja | bacaan yang baru tiba dan lolos kontrak data |
| `status` | backend → klien | semua klien | perangkat yang `online` atau `offline` (dari LWT, Modul 11) |
| `kejadian` | backend → klien | semua klien | catatan penting: kipas dinyalakan aturan, perintah gagal, jadwal berjalan (Konsep 7) |

Satu hal di tabel itu perlu dibedakan. Jawaban Socket.IO untuk pesan `ikuti` juga disebut *acknowledgement*, tetapi ia **bukan** `ack` MQTT dari perangkat. *Acknowledgement* Socket.IO hanya berarti "backend sudah menerima permintaanmu", sedangkan `ack` MQTT berarti "perangkat sudah mengerjakan perintahmu" (Konsep 3).

![Diagram kotak surat lawan telepon: HTTP polling dan WebSocket, Konsep 1 dan 2; waktu berjalan dari atas ke bawah, dan bacaan baru tiba di backend pada detik ke-7. Kiri atas, kartu HTTP polling sama dengan kotak surat, dengan ikon kotak surat: layar bertanya setiap 5 detik, backend hanya bisa menjawab. Ada dua garis hidup, layar dan backend. Layar mengirim GET /devices/:id/latest dan dijawab belum ada yang baru; lima detik kemudian ia bertanya lagi apakah ada yang baru, dan dijawab belum. Titik hijau di garis backend menandai bacaan baru yang tiba pada detik 7, tetapi layar baru menerimanya pada pertanyaan berikutnya, dengan jawaban hijau: ini, bacaan baru, terlambat 3 detik. Pertanyaan keempat dijawab belum lagi. Catatan: jarang bertanya, kabarnya terlambat; sering bertanya, backend sibuk menjawab belum. Kanan atas, kartu WebSocket sama dengan telepon, dengan ikon gagang telepon: menelepon sekali, lalu kedua pihak bebas bicara. Layar memulai dengan jabat tangan HTTP biasa, GET /socket.io/?EIO=4&transport=polling, dan dijawab dengan nomor sesi sid serta upgrades websocket. Sesudah itu, pita hijau muda di antara kedua garis hidup bertuliskan naik kelas ke WebSocket, dan sambungan dibiarkan terbuka: kedua pihak boleh bicara kapan saja. Saat bacaan baru tiba pada detik 7, backend langsung mendorong telemetry ke layar, didorong langsung tanpa ditanya, begitu juga bacaan berikutnya. Catatan: bacaan sampai begitu tiba, tidak ada tanya-jawab yang sia-sia; sambungan dijaga, kedua pihak saling menyapa setiap 25 detik. Bawah, kartu Room: satu saluran untuk setiap perangkat, Konsep 2. Dari kiri: dua perangkat, Node 1 a4cf12e5b7c0 dan simulator f00d00000001, mengirim lewat broker MQTT ke backend. Kotak backend hijau bertuliskan Socket.IO di /socket.io/, satu port dengan Fastify 8080, dan berisi dua room: perangkat:a4cf12e5b7c0 dan perangkat:f00d00000001. Di kanan, terminal kecil A mengikuti a4cf12e5b7c0 dan terminal kecil B mengikuti f00d00000001. Setiap terminal mengirim ikuti ke room-nya dan menerima telemetry hanya dari room itu: terminal A menampilkan bacaan a4cf12e5b7c0 suhu 28.5 °C, terminal B menampilkan bacaan f00d00000001 suhu 32 °C, dan keduanya menampilkan baris yang sama, f00d00000001 sekarang offline. Keterangan bawah: ikuti dijawab (acknowledgement) dengan bacaan terakhir supaya layar tidak kosong selagi menunggu; status dan kejadian dikirim ke semua klien sehingga baris offline yang sama muncul di kedua terminal. Di kiri bawah: MQTT menghubungkan perangkat dengan backend, Socket.IO menghubungkan backend dengan layar.](aset/polling-dan-websocket.png)

> ➡️ **Sudah membaca Konsep 1–2?** Lanjut ke [Praktik 1 — Data *live* lewat Socket.IO](#praktik-1--data-live-lewat-socketio-40-menit). Konsep 3–4 dibaca sebelum Praktik 2.

### 3. Perintah → ack → batas waktu: perintah yang tahu nasibnya

Sejak Modul 11, setiap perintah ke perangkat punya `id`, dan perangkat menjawab dengan `ack` ber-`id` sama. Backend Modul 16 sudah menunggu jawaban itu paling lama **5 detik**: kalau `ack` datang, perintahnya berhasil atau ditolak dengan alasan; kalau tidak datang, perintahnya dianggap gagal dan API menjawab `504`. Pola ini disebut **perintah → ack → batas waktu** (*command → ack → timeout*). Tanpa pola ini, server mengirim perintah lalu berharap saja, seperti melempar surat ke halaman rumah orang tanpa tahu suratnya dibaca atau tidak.

Mulai minggu ini, perintah tidak hanya datang dari API. Aturan otomatis, jadwal, dan bot Telegram juga menyuruh perangkat. Supaya keempatnya diperlakukan sama, semua perintah lewat **satu pintu**: fungsi `perintahkan()` di `src/services/perintah.ts`. Fungsi itu mengirim `cmd`, menunggu `ack`, lalu mencatat hasilnya ke tabel `commands` beserta **sumbernya** (`api`, `aturan`, `jadwal`, atau `telegram`). Tindakan aturan dan jadwal juga dicatat di buku kejadian dan disiarkan ke Socket.IO sebagai `kejadian` (Konsep 7), begitu pula perintah yang dikirim ulang oleh rekonsiliasi (Konsep 4); perintah biasa dari API dan Telegram cukup tercatat di `commands`. Setiap perintah berakhir dengan salah satu dari empat nasib:

| Nasib | Artinya | Contoh |
| :--- | :--- | :--- |
| Dijawab, `ok: true` | Perangkat mengerjakannya | kipas menyala; `ack.state` melaporkan `"kipas": true` |
| Dijawab, `ok: false` | Perangkat menolak dengan alasan | `nilai pompa harus 1-10 detik`, atau pompa ditolak karena air tandon kurang |
| Tanpa `ack` | 5 detik lewat tanpa jawaban | perangkat baru saja putus, atau `cmd` hilang di jalan |
| Tidak dikirim | Backend menolak sebelum mengirim | perangkat `offline`, atau perintah sebelumnya untuk aktuator yang sama masih menunggu `ack` |

Aturan "satu perintah menunggu untuk setiap aktuator" mencegah perintah bertumpuk saat jaringan tersendat: perintah lampu boleh dikirim selagi perintah kipas masih menunggu, tetapi perintah kipas kedua harus menunggu jawaban perintah kipas pertama.

### 4. Keadaan yang diinginkan lawan yang dilaporkan

Ingat *remote* (pengendali jarak jauh) AC di rumah. Di layar *remote* tertulis 24 °C dan "menyala", padahal AC-nya sendiri bisa saja mati karena listrik sempat padam. Yang tertulis di *remote* adalah **keadaan yang diinginkan**. Yang terjadi pada AC adalah **keadaan yang dilaporkan**. Dua hal itu tidak selalu sama.

Backend v0.4 menyimpan keduanya untuk setiap perangkat:

- **Diinginkan** (*desired*): keadaan yang terakhir diminta server untuk aktuator yang keadaannya bertahan, yaitu `kipas`, `lampu`, dan `tirai`. Pompa tidak termasuk karena perintahnya hanya denyut 1–10 detik yang padam sendiri.
- **Dilaporkan** (*reported*): keadaan yang terakhir dilaporkan perangkat. Sampai Modul 18, laporan itu hanya datang lewat `ack.state`, padahal firmware juga mengubah aktuator sendiri, misalnya lampu otomatis dan siram otomatis sejak Modul 6. Karena itu, **kontrak data 1.3** menambahkan objek `state`, yang bentuknya sama persis dengan `ack.state`, ke `telemetry` Node 1, dan Node 1 mengirim `telemetry` segera setiap kali keadaan aktuatornya berubah.
- **Selisih**: aktuator yang keadaannya berbeda antara yang diinginkan dan yang dilaporkan.

Rute baru `GET /devices/:id/state` memperlihatkan ketiganya:

```json
{"device_id":"f00d00000001","desired":{"kipas":true},"reported":{"kipas":false,"lampu":false,"pompa":false,"tirai":90},"reported_pada":"2026-10-21T00:12:08.511Z","selisih":["kipas"]}
```

Kalau ada selisih, backend **mencocokkan ulang** (rekonsiliasi): ia mengirim perintah itu sekali lagi. Namun, ia hanya melakukannya kalau perangkat sedang `online`, tidak ada perintah untuk aktuator itu yang masih menunggu `ack`, sudah lewat paling sedikit 30 detik sejak percobaan terakhir, **dan** keinginan itu belum pernah terpenuhi sejak dikirim. Syarat terakhir penting. Node 1 juga punya otak sendiri: lampu otomatis menyala saat ada gerakan di ruang gelap, dan pengaman lokal (Konsep 10) bisa menyalakan kipas. Kalau backend "membetulkan" setiap perbedaan tanpa syarat, server dan Node 1 akan saling melawan setiap 30 detik. Satu-satunya pengecualian: perangkat yang **baru menyala ulang** (`uptime_s` di `vitals` kurang dari 60 detik). Relay-nya padam semua saat menyala, jadi semua keinginan server untuk perangkat itu dicocokkan lagi.

Ada dua keterbatasan yang perlu kamu ketahui sejak awal. **Keadaan yang diinginkan hanya disimpan di memori backend**, jadi isinya kosong lagi setiap kali backend dijalankan ulang; riwayat perintahnya tetap ada di tabel `commands`. Selain itu, keadaan yang dilaporkan hanya sesegar `telemetry` terakhir: kalau perangkat `offline`, angkanya berhenti diperbarui. Karena itu, `status` perangkat tetap penting. Status itu berasal dari **wasiat** (*Last Will*, LWT) Modul 11: broker menerbitkan `offline` atas nama perangkat yang hilang tanpa pamit. Mulai minggu ini, backend menyiarkan perubahan status lewat Socket.IO dan mengabarimu lewat Telegram kalau sebuah perangkat `offline` lebih dari 60 detik.

![Diagram satu pintu perintah dan keadaan yang diinginkan lawan yang dilaporkan, Konsep 3 dan 4: API, aturan, jadwal, dan Telegram memakai perintahkan() yang sama; contohnya simulator f00d00000001. Kiri, Konsep 3, perintah, ack, batas waktu. Empat sumber yang dicatat di kolom sumber tabel commands: API (Bruno) dengan nilai api, mesin aturan dengan nilai aturan, jadwal dengan nilai jadwal, dan bot Telegram dengan nilai telegram. Keempatnya bertemu di satu kotak hijau, satu pintu perintahkan() di src/services/perintah.ts. Di kanannya ada broker dan Node 1. Dari satu pintu, cmd dengan id melewati broker ke Node 1; Node 1 mengerjakannya, lalu menjawab ack dengan id yang sama dan state. Jam pasir di sisi backend: menunggu paling lama 5 detik. Di bawahnya, tabel empat nasib setiap perintah dengan kolom nasib, artinya, dan kode API. Dijawab ok true, centang hijau: perangkat mengerjakannya, ack.state melaporkan kipas true, kode 200. Dijawab ok false, silang merah: perangkat menolak dengan alasan, misalnya nilai pompa harus 1-10 detik, kode 200. Tanpa ack, jam pasir merah: 5 detik lewat tanpa jawaban, perangkat baru putus atau cmd hilang di jalan, kode 504. Tidak dikirim, tanda dilarang abu-abu: backend menolak sebelum mengirim karena perangkat offline atau perintah sebelumnya untuk aktuator yang sama masih menunggu ack, kode 409. Catatan: kode API adalah jawaban rute POST /devices/:id/command, dan perintah yang terkirim dicatat di commands. Kanan, Konsep 4, keadaan yang diinginkan lawan yang dilaporkan. Kotak hijau diinginkan (desired): yang terakhir diminta server, di memori backend, berisi kipas true. Kotak dilaporkan (reported): dari state di telemetry dan ack, kontrak 1.3, berisi kipas false, lampu false, pompa false, tirai 90. Pita selisih berisi kipas: kipas diinginkan menyala, dilaporkan padam. Di bawahnya, jawaban GET /devices/f00d00000001/state dalam bentuk JSON: device_id f00d00000001, desired kipas true, reported kipas false, lampu false, pompa false, tirai 90, reported_pada 2026-10-21T00:12:08.511Z, dan selisih kipas. Lalu daftar centang: backend mencocokkan ulang, yaitu mengirim perintah itu lagi, hanya kalau perangkat sedang online, tidak ada perintah untuk aktuator itu yang masih menunggu ack, sudah lewat paling sedikit 30 detik sejak percobaan terakhir, dan keinginan itu belum pernah terpenuhi sejak dikirim. Kecuali perangkat baru menyala ulang, dengan uptime_s kurang dari 60 di vitals: relay-nya padam semua, jadi semua keinginan untuk perangkat itu dicocokkan lagi. Syarat terakhir mencegah server melawan otak Node 1 sendiri, yaitu lampu otomatis dan pengaman lokal, setiap 30 detik. Kotak catatan bawah: keadaan yang diinginkan hanya disimpan di memori, kosong lagi setiap kali backend dijalankan ulang; riwayat perintahnya tetap di tabel commands.](aset/perintah-dan-keadaan.png)

> ➡️ **Sudah membaca Konsep 3–4?** Lanjut ke [Praktik 2 — Satu pintu perintah dan keadaan perangkat](#praktik-2--satu-pintu-perintah-dan-keadaan-perangkat-45-menit). Konsep 5–6 dibaca sebelum Praktik 3.

### 5. Mesin aturan: aturan sebagai data, bukan kode

Di Modul 13, otomasi kipas dibuat di Node-RED: kotak-kotak flow yang disambung kabel virtual. Minggu ini otomasi itu pindah ke backend, dalam bentuk yang lebih tertib. Mulai dari kalimat biasa:

> Kalau suhu Node 1 **di atas 30 °C selama 2 menit**, nyalakan kipas. Padamkan lagi kalau suhunya **di bawah 28 °C**.

Kalimat itu ditulis sebagai **data**, bukan sebagai kode, lalu disimpan sebagai satu baris di tabel `rules` yang sudah kamu buat di Modul 17:

```json
{
  "nama": "Kipas otomatis Node 1",
  "aktif": true,
  "kondisi": { "jenis": "ambang", "device_id": "a4cf12e5b7c0", "besaran": "suhu",
               "nyala_di_atas": 30, "padam_di_bawah": 28, "selama_detik": 120 },
  "aksi":    { "jenis": "sakelar", "device_id": "a4cf12e5b7c0", "target": "kipas", "kabari": true }
}
```

Bagian backend yang membaca data seperti itu lalu memutuskan apa yang harus dilakukan disebut **mesin aturan** (*rules engine*). Menulis aturan sebagai data punya tiga keuntungan. Pertama, aturan bisa **diubah tanpa menyentuh kode**: cukup ubah angkanya lewat API (Konsep 7). Kedua, setiap aturan **diperiksa Zod** sebelum dipakai, baik yang datang dari API maupun yang dibaca dari database, jadi aturan rusak ditolak dengan pesan yang jelas. Ketiga, **tidak ada rumus teks yang dijalankan sebagai kode**. Mesin aturan hanya mengenal bentuk-bentuk yang sudah ditentukan (`ambang`, `jadwal`, `sakelar`, `perintah`) sehingga tidak ada cara untuk menyelipkan perintah berbahaya lewat isi aturan.

Tiga gagasan membuat aturan kipas itu berperilaku baik:

1. **"Selama 2 menit"**. Hitungan dimulai pada bacaan pertama yang di atas 30 °C. Kalau ada satu saja bacaan yang 30 °C atau kurang, bacaan yang gagal (`null`), atau jeda tanpa bacaan lebih dari 60 detik, hitungannya **diulang dari nol**. Dengan `telemetry` setiap 10 detik, kipas baru dinyalakan pada bacaan panas ke-13 (detik ke-120). Suhu yang hanya melonjak sebentar, misalnya karena sensor terkena sinar matahari sesaat, tidak menyalakan kipas.
2. **Histeresis** (Modul 13). Batas nyala (30 °C) dan batas padam (28 °C) sengaja berbeda. Kalau keduanya sama, suhu yang berayun di sekitar 30 °C membuat kipas menyala-padam setiap beberapa detik. Celah 2 °C membuat kipas tetap menyala sampai ruangan benar-benar lebih sejuk.
3. **Memutuskan hanya saat melintas.** Mesin aturan mengeluarkan "nyalakan" satu kali, tepat saat suhu melintasi batas, bukan di setiap bacaan panas. Keadaan yang dilaporkan (Konsep 4) dipakai saat ingatan sebuah aturan dibuat dari awal, yaitu sesudah backend dimulai ulang atau aturannya diubah: kalau perangkat melaporkan kipas sedang menyala, aturan dianggap sudah menyala, jadi kipas itu tidak dinyalakan dua kali dan tetap dipadamkan pada waktunya.

![Grafik mesin aturan: di atas 30 °C selama 2 menit, dengan histeresis, Konsep 5. Satu titik sama dengan satu bacaan telemetry setiap 10 detik, dan angka aturannya sama dengan uji Vitest Praktik 3. Sumbu mendatar adalah detik sejak bacaan panas pertama, dari 0 sampai 300; sumbu tegak adalah suhu, 27 sampai 32 °C. Dua garis putus-putus mendatar: nyala di atas 30 °C dan padam di bawah 28 °C; pita hijau muda di antaranya bertuliskan celah histeresis: tetap seperti sebelumnya. Dua bacaan sebelum detik 0 masih di bawah 30, belum di atas 30. Mulai detik 0 suhu di atas 30 dan naik pelan sampai sekitar 32,3 °C. Kurung di atas detik 0 sampai 120 bertuliskan selama 2 menit: 13 bacaan panas berturut-turut. Titik hijau di detik 120 bertuliskan nyalakan, bacaan ke-13, detik ke-120, dengan catatan: keputusan hanya saat melintas, bacaan panas berikutnya diam. Setelah kipas menyala, suhu turun dan melewati celah 28 sampai 30 tanpa keputusan baru, lalu titik hijau kedua di detik 240 bertuliskan padamkan, bacaan pertama di bawah 28 °C (27,8). Di akhir grafik suhu naik lagi ke dalam celah, dan kipas tetap padam. Di bawah grafik, lajur kipas: PADAM sampai detik 120, NYALA dari detik 120 sampai 240 (tetap menyala walau suhu masuk celah), lalu PADAM (tetap padam). Kiri bawah, kartu Aturan sebagai data, satu baris di tabel rules (Modul 17): kondisi dengan jenis ambang, besaran suhu, nyala_di_atas 30, padam_di_bawah 28, dan selama_detik 120; aksi dengan jenis sakelar dan target kipas; device_id di kedua bagian dan kabari tidak ditampilkan, dan contoh lengkapnya ada di Konsep 5. Kanan bawah, kartu Satu bacaan tepat 30 °C mengulang hitungan, uji ke-4 Praktik 3: harus di atas 30, bukan sama dengan 30. Deretan titik 31 °C dari detik 0 sampai 60 (hitungan pertama: 60 detik), satu titik tepat di garis batas 30 °C pada detik 70 (tepat 30 °C, hitungan diulang dari nol), lalu deretan titik 31 °C lagi dari detik 80 sampai 190 (hitungan baru mulai detik 80; di detik 190 baru 110 detik). Hasilnya: tidak ada nyalakan sampai detik 190, diperiksa dengan not.toContain. Hitungan juga diulang oleh bacaan null (sensor gagal) dan jeda tanpa bacaan lebih dari 60 detik.](aset/mesin-aturan.png)

Selain aturan **ambang** seperti di atas, mesin aturan modul ini mengenal satu jenis lagi: aturan **jadwal** ("siram 10 detik setiap pukul 06.00", Konsep 8). Aturan ambang hanya mengatur kipas dan lampu. Pompa sengaja tidak diberi aturan ambang di server karena Node 1 sudah menyiram sendiri berdasarkan sensor tanah sejak Modul 6; dua otak untuk satu pompa bisa menyiram dua kali.

### 6. *Unit test*: memeriksa otak aturan tanpa perangkat

Bagaimana kamu tahu aturan "selama 2 menit" benar-benar menunggu 120 detik, bukan 110 atau 130? Menunggu kipas di depan Node 1 sambil memanaskan sensor bisa, tetapi lambat dan tidak bisa diulang dengan persis. Ada cara yang jauh lebih cepat: **uji satuan** (*unit test*).

Kuncinya, otak aturan ditulis sebagai **fungsi murni**: hasilnya hanya bergantung pada masukannya. Fungsi `nilaiAmbang()` tidak membaca jam, database, atau MQTT sendiri. Semua yang ia butuhkan diberikan oleh pemanggilnya: aturan, ingatan sebelumnya, bacaan, dan **jam sekarang dalam bentuk angka milidetik**. Hasilnya berupa keputusan ("nyalakan", "padamkan", atau tidak melakukan apa-apa) dan ingatan baru. Karena jam hanyalah angka, "2 menit kemudian" cukup ditulis sebagai `120_000`, dan uji satuan selesai dalam hitungan milidetik.

Uji satuan adalah program kecil yang memanggil fungsi itu dengan masukan yang sudah disiapkan, lalu **memeriksa** hasilnya:

```ts
it("menyalakan kipas setelah 120 detik di atas 30 °C", () => {
  // … bacaan 31 °C pada detik 0, 10, 20, …, 120
  expect(keputusan).toBe("nyalakan");
});
```

`expect(…).toBe(…)` berarti "hasilnya harus sama dengan ini". Kalau sama, uji itu **lulus** (✓); kalau tidak, uji **gagal** (×) dan pesan galatnya menunjukkan apa yang diharapkan dan apa yang didapat. Alat yang mencari dan menjalankan semua uji itu adalah **Vitest**, dan perintahnya `npm test`. Di Praktik 3 kamu menulis 10 uji: menyala tepat di detik ke-120; tidak menyala di detik ke-110; hitungan diulang setelah satu bacaan sejuk, setelah bacaan `null`, dan setelah jeda panjang; tetap menyala di celah histeresis; padam di bawah 28 °C; dan seterusnya. Sekali ditulis, semuanya bisa dijalankan lagi kapan saja dalam satu detik, misalnya setiap kali kamu mengubah otak aturan.

Uji satuan tidak menggantikan uji dengan perangkat sungguhan. Ia memastikan **logikanya** benar. Bagian yang menyambungkan logika itu ke MQTT, database, dan Telegram tetap dicoba di Praktik 4–8.

> ➡️ **Sudah membaca Konsep 5–6?** Lanjut ke [Praktik 3 — Otak aturan dan 10 *unit test*](#praktik-3--otak-aturan-dan-10-unit-test-60-menit). Konsep 7 dibaca sebelum Praktik 4.

### 7. Aturan di database, diubah lewat API, berlaku saat itu juga

Syarat lulus pertama modul ini berbunyi: mengubah ambang suhu lewat API **langsung mengubah perilaku kipas tanpa *restart* server**. Jalannya seperti ini:

1. Kamu mengirim `PUT /rules/1` dengan ambang baru, misalnya `nyala_di_atas` 32, dari Bruno atau Swagger.
2. Backend memeriksa isinya dengan Zod, lalu menyimpannya ke tabel `rules` (`UPDATE … RETURNING`).
3. Backend **memuat ulang** daftar aturan di memorinya. Mesin aturan tidak membaca database setiap kali bacaan tiba (puluhan kali per menit); ia memakai salinan di memori, dan salinan itu diganti setiap kali aturan berubah. Hitungan "selama" untuk aturan yang berubah diulang dari nol.
4. Untuk aturan kipas, backend menerbitkan **`config`** ke Node 1: `{"aksi":"config","ambang":{"suhu_kipas_on":32}}`, dengan QoS 1 dan *retained*. Node 1 menyimpan angka itu di NVS sebagai ambang pengaman lokalnya (Konsep 10).
5. Perubahan itu dicatat di **buku kejadian** (tabel `events`): siapa mengubah aturan apa, kapan.

Mengapa `config` dikirim *retained*, padahal kontrak data melarang `set` *retained*? Karena `config` hanya berisi ambang, dan ambang yang sama dikerjakan dua kali pun hasilnya tetap sama. Pesan *retained* disimpan broker dan diserahkan lagi setiap kali perangkat berlangganan, jadi Node 1 yang baru menyala ulang, Node 1 pengganti, atau Node 1 yang NVS-nya kosong langsung menerima ambang terakhir tanpa server perlu tahu kapan ia menyala. Perintah `set pompa` tidak boleh begitu: kalau tertempel di broker, pompa menyiram lagi setiap kali Node 1 menyala ulang lalu menyambung karena ingatan `id` perintahnya ikut hilang (kontrak aturan 8). Satu hal yang perlu diingat: broker hanya menyimpan **satu** pesan *retained* untuk setiap topik. Menghapus pesan *retained* di topik `cmd` (misalnya lewat **Clear Retained Message** di MQTTX) ikut menghapus `config`. Karena itu, backend menerbitkan ulang `config` setiap kali ia tersambung ke broker.

Minggu ini juga ada **migrasi `007_aturan_dan_kejadian.sql`**. Nomor 006 sengaja dilewati karena dipakai tantangan 🧩 Tingkat 3 Modul 18 (`006_device_health.sql`); kalau kamu mengerjakan tantangan itu, file-mu tetap aman. Migrasi 007 menambahkan tiga hal:

| Tabel | Perubahan | Untuk apa |
| :--- | :--- | :--- |
| `rules` | kolom `diubah`, dan pemeriksaan bahwa `kondisi` dan `aksi` berupa objek JSON | mengetahui kapan aturan terakhir diubah, dan menolak isi yang bukan objek |
| `commands` | kolom `sumber` (`api`, `aturan`, `jadwal`, `telegram`), `aturan_id`, dan `state` | menjawab "siapa menyalakan kipas, dan atas aturan yang mana?" |
| `events` (baru) | satu baris untuk setiap kejadian yang perlu diketahui manusia | aturan mulai bekerja, perintah gagal, status perangkat berubah, jadwal terlewat, laporan mode offline |

![Diagram aturan di database: ubah ambang lewat API, berlaku saat itu juga, Konsep 7; contohnya PUT /rules/1 dengan nyala_di_atas 32, dan backend tidak dimulai ulang sekali pun. Atas, lima langkah dari kiri ke kanan, dengan kurung hijau di atas langkah 2 sampai 5 bertuliskan semuanya terjadi di dalam backend yang sedang berjalan: tanpa restart server. Langkah 1, Bruno atau Swagger: PUT /rules/1 berisi aturan lengkap, dengan nyala_di_atas 32 dan padam_di_bawah 30. Langkah 2, Zod memeriksa dengan skema Aturan; isi yang salah dijawab 400, dan database tidak disentuh. Langkah 3, PostgreSQL, kotak biru database: UPDATE rules … RETURNING; aturan tersimpan permanen di tabel rules. Langkah 4, muat ulang ke memori, kotak hijau: muatAturan(), salinan di memori diganti, dan hitungan selama 2 menit untuk aturan ini diulang dari nol. Langkah 5, mesin aturan menilai bacaan berikutnya dengan ambang yang baru: nilaiBacaan() lalu nilaiAmbang(). Dari langkah 4 ada dua cabang. Cabang kiri, catatKejadian(): buku kejadian, tabel events, mendapat baris baru berjenis aturan-diubah, yaitu siapa mengubah aturan apa dan kapan; lalu Socket.IO mengirim kejadian ke semua klien, dan terminal kecil menulis kejadian: Aturan 1 (Kipas …. Cabang kanan, kirimSemuaConfig(): pesan config retained dengan QoS 1, berisi aksi config dan ambang suhu_kipas_on 32, ke topik cmd Node 1; lalu broker, yang menyimpan satu pesan retained per topik; lalu Node 1, yang menyimpannya di NVS (Konsep 10). Catatan: hanya config yang boleh retained karena isinya ambang, dikerjakan dua kali pun hasilnya sama; perintah set tidak pernah retained. Bawah, kotak bukti di Praktik 4.8, log backend dalam jam WIB: ambang 32 tidak menyalakan kipas pada suhu 31 °C, lalu ambang diturunkan lagi ke 30 tanpa restart. Baris log: 06:51:40 Aturan 1 (Kipas otomatis) diubah lewat API; 06:51:40 config ke f00d00000001, suhu_kipas_on 30 dari aturan 1 (retained); 06:51:40 PUT /rules/1 -> 200 (16 ms); 06:51:48 aturan 1 (Kipas otomatis): suhu 31 di atas 30, kipas dinyalakan kalau bertahan 120 detik; 06:53:48 perintah (aturan) ke f00d00000001: kipas = true, ack ok=true dalam 3 ms; 06:53:48 aturan 1 (Kipas otomatis): ikon termometer, Suhu 31 °C — kipas dinyalakan otomatis. Kalimat penutup: bacaan pertama sesudah perubahan memulai hitungan (06.51.48), dan tepat 2 menit kemudian (06.53.48) aturan menyalakan kipas.](aset/aturan-tanpa-restart.png)

> ➡️ **Sudah membaca Konsep 7?** Lanjut ke [Praktik 4 — Aturan di database, diubah lewat API](#praktik-4--aturan-di-database-diubah-lewat-api-60-menit). Konsep 8 dibaca sebelum Praktik 5.

### 8. Penjadwalan: jam beker untuk server

Aturan ambang bereaksi terhadap **bacaan**. Ada pekerjaan lain yang bereaksi terhadap **jam**: menyiram kebun setiap pagi atau mematikan lampu teras tengah malam. Untuk itu, backend butuh jam beker, dan modul ini memakai **node-cron**.

Waktu jadwal ditulis sebagai **ekspresi cron**, lima bidang yang dipisahkan spasi:

```text
┌──────── menit (0–59)
│ ┌────── jam (0–23)
│ │ ┌──── tanggal (1–31)
│ │ │ ┌── bulan (1–12)
│ │ │ │ ┌ hari dalam seminggu (0–7; 0 dan 7 = Minggu)
│ │ │ │ │
0 6 * * *
```

Tanda `*` berarti "setiap". Jadi, `0 6 * * *` berarti "menit ke-0, jam 6, setiap tanggal, setiap bulan, setiap hari", yaitu **setiap hari pukul 06.00**. Beberapa contoh lain:

| Ekspresi | Artinya |
| :--- | :--- |
| `0 6 * * *` | setiap hari pukul 06.00 |
| `30 17 * * *` | setiap hari pukul 17.30 |
| `0 6 * * 1-5` | pukul 06.00 hari Senin sampai Jumat |
| `*/15 * * * *` | setiap 15 menit |

Ada dua hal yang sering membuat jadwal "meleset":

- **Zona waktu.** Pukul 06.00 menurut jam siapa? Laptop pembaca di Makassar atau Jayapura memakai WITA atau WIT, dan server di Modul 27 mungkin memakai UTC. Karena itu, setiap jadwal di modul ini memakai zona **`Asia/Jakarta`** (WIB) yang ditulis jelas di kode, apa pun zona waktu laptopnya. (Laptop penulis sendiri memakai WITA.)
- **Laptop yang tidur.** node-cron hanya bisa membunyikan beker selama program backend berjalan. Kalau laptop tidur pukul 06.00 lalu bangun paling lambat 15 menit kemudian, backend modul ini menyuruh node-cron tetap menjalankan jadwalnya walaupun terlambat (Praktik 5). Kalau laptop baru bangun lebih dari 15 menit kemudian, jadwal itu **terlewat**: node-cron versi 4 **tidak** menjalankannya belakangan, tetapi melaporkannya. Backend mencatat jadwal yang terlewat di buku kejadian dan mengabarimu lewat Telegram supaya kamu tahu kebun belum disiram. Kalau backend sedang mati pada jam itu, tidak ada yang bisa melapor sama sekali. Inilah salah satu alasan backend sungguhan nanti dijalankan di server yang menyala terus (Modul 26–27).

Banyak tutorial node-cron di internet masih memakai versi 3. Beberapa pilihannya, misalnya `scheduled` dan `runOnInit`, tidak ada lagi di versi 4.6.0 yang dipakai modul ini. Kalau contoh dari internet tidak jalan, periksa dulu versinya.

> ➡️ **Sudah membaca Konsep 8?** Lanjut ke [Praktik 5 — Jadwal siram pagi](#praktik-5--jadwal-siram-pagi-25-menit). Konsep 9 dibaca sebelum Praktik 6.

### 9. Notifikasi Telegram: penting, cepat, dan tidak cerewet

**Telegram** punya fitur **bot**: akun Telegram yang dijalankan oleh program, bukan oleh manusia. Bot bisa mengirim pesan kepadamu dan membaca pesan yang kamu kirim kepadanya. Bot dibuat lewat bot resmi Telegram bernama **@BotFather**: kamu mengetik `/newbot`, memberi nama, lalu menerima **token**, kunci rahasia panjang yang dipakai program untuk mengendalikan bot itu. Siapa pun yang memegang token bisa memakai bot-mu, jadi token diperlakukan seperti sandi: disimpan di `.env`, tidak pernah ikut Git.

Supaya bot tahu ke mana harus mengirim peringatan, ia butuh **`chat_id`**, nomor percakapan antara kamu dan bot. Cara termudah mendapatkannya: kirim `/start` ke bot-mu, lalu bot membalas dengan nomor itu. Nomor tersebut juga dipakai sebagai daftar izin: bot hanya menjawab `/status` kalau yang bertanya adalah `chat_id` milikmu.

Bot di laptop memakai cara ***long polling***: backend bertanya ke server Telegram, "ada pesan baru untukku?", dan Telegram menahan pertanyaan itu sampai ada pesan atau sampai 30 detik berlalu, lalu backend bertanya lagi. Cara ini bekerja dari balik router rumah, tanpa alamat IP publik. Cara lain, *webhook*, membuat Telegram yang menghubungi backend sehingga backend harus bisa dijangkau dari internet dengan HTTPS; itu urusan Modul 26–27. Program bot-nya ditulis dengan library **grammY**.

Notifikasi yang baik itu **penting, cepat, dan tidak cerewet**:

- **Penting.** Hanya kejadian yang perlu ditindaklanjuti manusia: kipas dinyalakan otomatis karena panas, perintah gagal, perangkat `offline`, dan jadwal terlewat.
- **Cepat.** Syarat lulus modul ini: peringatan sampai **dalam 10 detik**, dihitung sejak bacaan yang memicunya. Backend mencatat jedanya di log untuk setiap pesan.
- **Tidak cerewet.** Tanpa pengaman, suhu yang bertahan di 33 °C bisa memicu pesan setiap 10 detik, dan kamu akan mematikan notifikasinya dalam satu jam. Cara meredamnya disebut ***debouncing*** (meredam pantulan, seperti tombol di Modul 5): kabari **saat keadaannya berubah** (mulai panas, kembali sejuk), ingatkan **paling sering sekali setiap 30 menit** selama keadaan bahaya bertahan, dan tunda pesan `offline` selama **60 detik** karena perangkat yang hanya putus-sambung sebentar tidak perlu membangunkan siapa pun.

![Diagram notifikasi Telegram: penting, cepat, dan tidak cerewet, Konsep 9; bot dibuat sekali lewat @BotFather, backend bertanya dengan long polling, dan pesan diredam (debouncing). Kolom kiri, Membuat bot (sekali saja), empat langkah bernomor. 1: di Telegram, buka @BotFather, kirim /newbot, lalu beri nama dan nama pengguna yang diakhiri bot. 2: BotFather membalas token; kotak bergembok: kunci rahasia bot-mu, siapa pun yang memegangnya bisa mengendalikan bot-mu, simpan di backend/.env saja; lalu baris TELEGRAM_BOT_TOKEN=…, dan .env tidak ikut Git sejak Modul 16. 3: kirim /start ke bot-mu, dan bot membalas: Halo! chat_id kamu: 777000111, Tulis angka ini sebagai TELEGRAM_CHAT_ID di .env backend. 4: salin chat_id ke .env, TELEGRAM_CHAT_ID=777000111; /status hanya dijawab untuk chat_id ini, daftar izin bot-mu. Kotak putus-putus: token telanjur bocor? Kirim /token ke @BotFather untuk membuat token baru, lalu ganti isi .env; token lama tidak berlaku lagi. Catatan: bot dibuat dengan akun Telegram-mu sendiri, gratis (Praktik 6). Kolom tengah, Long polling: backend yang bertanya. Dari atas: HP-mu dengan aplikasi Telegram, tersambung dengan server Telegram yang menyimpan pesan untuk bot-mu, percakapan dengan bot. Dari jaringan rumah, panah hijau naik bertuliskan getUpdates dan pertanyaan ada pesan baru untukku; panah turun membawa jawaban berupa pesan baru, misalnya /status. Jam pasir: ditahan sampai ada pesan, paling lama 30 detik. Kotak jaringan rumah berisi router tanpa alamat IP publik dan backend di laptop, grammY bot.start(), yang bertanya lagi setiap kali jawaban datang. Catatan: peringatan dikirim dengan sendMessage, juga lewat koneksi keluar; cara lain, webhook, membuat Telegram yang menghubungi backend sehingga backend harus bisa dijangkau dari internet dengan HTTPS, urusan Modul 26–27. Kolom kanan, Debouncing: satu siang yang panas, contoh aturan kipas Node 1 dengan bacaan setiap 10 detik, dalam garis waktu tegak. Pukul 13.02, titik hijau: 2 menit di atas 30 °C, kipas dinyalakan; keadaan berubah, dikirim, dengan gelembung pesan berikon termometer: Suhu 33 °C — kipas dinyalakan otomatis. Pukul 13.12, lingkaran abu-abu: masih 33 °C 10 menit kemudian; tidak berubah, diam, 60 bacaan dan 0 pesan. Pukul 13.32, titik hijau: masih panas, 30 menit sejak pesan terakhir; pengingat dikirim, berikon termometer: Suhu masih 33 °C — kipas tetap menyala (pengingat). Pukul 13.48, titik hijau: turun di bawah 28 °C, kipas dipadamkan; kembali aman, dikirim, berikon centang hijau: Suhu turun ke 27 °C — kipas dipadamkan. Pukul 14.05, lingkaran abu-abu: Node 1 putus 20 detik, lalu kembali; kurang dari 60 detik, diam. Pukul 14.20, titik hijau: Node 1 putus lebih dari 60 detik; dikirim 60 detik kemudian, berikon ponsel mati: a4cf12e5b7c0 offline sejak 14.20 WIB. Kotak bawah: cepat, paling lama 10 detik sejak bacaan pemicu (syarat lulus); log backend di lab penulis: Telegram terkirim 0,6 detik setelah bacaan ….](aset/telegram-dan-peredam.png)

> ➡️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 6 — Bot Telegram yang tahu diri](#praktik-6--bot-telegram-yang-tahu-diri-60-menit). Konsep 10 dibaca sebelum Praktik 7.

### 10. Pengaman lokal: Node 1 menjaga rumah saat server hilang

Otak di server itu pintar: ia melihat semua perangkat, menyimpan riwayat, dan bisa mengirim pesan Telegram. Namun, ia jauh. Kalau laptop mati, broker berhenti, atau kabel LAN Pi tercabut, perintah dari server tidak akan sampai. Otak di dalam Node 1 sederhana, tetapi **selalu ada**. Sistem yang tangguh memakai keduanya: server untuk keputusan yang butuh gambaran besar, perangkat untuk pengaman yang tidak boleh berhenti. Node 1 sendiri sudah punya otak lokal sejak Modul 6: siram otomatis dan lampu otomatis. Minggu ini kipas ikut dijaga.

Cara kerja **pengaman lokal** di firmware Node 1 v1.5.0:

1. **Ambang dari server, disimpan di NVS.** Setiap kali aturan kipas diubah (Konsep 7), Node 1 menerima `config` berisi `suhu_kipas_on`, memeriksanya (harus angka 15–45 °C), lalu menyimpannya di NVS (Modul 8). Angka itu bertahan walaupun listrik padam. Selama belum pernah menerima `config`, Node 1 memakai angka bawaan 30 °C.
2. **Mode offline setelah 2 menit.** Node 1 menghitung sudah berapa lama broker tak terjangkau sejak sambungan terakhir. Putus sebentar itu biasa (WiFi berkedip, broker di-*restart*), jadi pengaman baru bekerja kalau broker hilang **terus-menerus selama 2 menit**. Saat itu Node 1 masuk **mode offline**, dan halaman status OLED menulis `MODE OFFLINE`.
3. **Kipas diatur sendiri, hanya dalam mode offline.** Kalau suhu di atas `suhu_kipas_on`, Node 1 menyalakan kipas. Kalau suhu turun di bawah `suhu_kipas_on − 2`, kipas yang ia nyalakan sendiri ia padamkan lagi, juga sesudah broker kembali. Prinsipnya **"yang menyalakan, dia yang memadamkan"**: kipas yang dinyalakan server atau olehmu lewat perintah tidak diganggu pengaman, dan begitu ada perintah kipas baru, kipas pindah ke tangan si pemberi perintah. Kalau sensor DHT22 gagal dibaca, pengaman diam.
4. **Laporan saat tersambung lagi.** Sekitar 10 detik setelah broker kembali, Node 1 mengirim `vitals` yang membawa dua kolom tambahan kontrak 1.3: `offline_s` (berapa detik Node 1 berada dalam mode offline) dan `kipas_lokal` (berapa kali pengaman menyalakan kipas). Backend mencatatnya di buku kejadian dan mengabarimu lewat Telegram. Jeda 10 detik itu disengaja. Saat broker kembali, backend juga baru menyambung ulang dan butuh beberapa detik untuk berlangganan, sedangkan `vitals` tidak tertempel (*retained*) di broker. Laporan yang terbit terlalu cepat bisa lewat begitu saja tanpa ada yang mendengar.

Mengapa laporannya lewat `vitals`, bukan lewat `status`? Karena `status` menyatakan keadaan **sekarang** (`online` atau `offline`), dan begitu Node 1 tersambung lagi, statusnya memang `online`. Laporan "tadi aku offline 5 menit dan menyalakan kipas dua kali" adalah cerita tentang **masa lalu**, dan `vitals` memang tempat Node 1 bercerita tentang kesehatannya. Isi `status` ketiga, `offline-mode`, tetap disimpan untuk Modul 28.

Untuk mencoba pengaman tanpa mencabut kabel, firmware v1.5.0 punya perintah Serial baru, **`uji offline`**: Node 1 memutus sambungan broker dengan sengaja (tanpa pamit sehingga broker menerbitkan wasiat `offline`) dan menahan diri untuk tidak menyambung lagi selama 3 menit. Perintah ini satu-satunya cara mencoba mode offline di Wokwi karena Wokwi memakai broker publik yang tidak bisa kamu matikan. Saat sambungan diputus, Serial tetap menulis `… mencoba lagi setiap 5 detik` (kartu 2 pada gambar di bawah). Itu pesan umum untuk setiap putus sambungan; selama uji ini, percobaan menyambung ditahan sampai 3 menit lewat.

Ada satu celah yang perlu diakui dengan jujur. Pengaman lokal hanya bekerja kalau **broker** tak terjangkau. Kalau yang mati adalah **backend** di laptop, sedangkan broker di Pi tetap menyala, Node 1 tetap tersambung dan tidak masuk mode offline, padahal aturan server juga ikut mati. Selama backend masih dijalankan di laptop, kipas tidak diatur siapa pun dalam keadaan itu. Penutup celah ini adalah backend yang menyala terus di server sungguhan (Modul 26–27).

![Diagram pengaman lokal: Node 1 menjaga kipas saat broker hilang, Konsep 10; firmware Node 1 v1.5.0, dengan angka dari uji Wokwi penulis: suhu_kipas_on 31 °C, broker diputus dengan uji offline. Atas, garis waktu dengan delapan nomor penanda dan empat lajur. Lajur broker: terjangkau, lalu tak terjangkau (merah muda) mulai penanda 1, lalu terjangkau lagi mulai penanda 6. Lajur Node 1: tersambung; MQTT PUTUS, menghitung 2 menit, mulai penanda 2; MODE OFFLINE: pengaman lokal bekerja (merah) mulai penanda 3; tersambung lagi mulai penanda 6. Lajur kipas: padam; NYALA mulai penanda 4; padam mulai penanda 5; NYALA (milik pengaman) lagi sebelum broker kembali dan tetap menyala sesudahnya; padam di penanda 8. Lajur suhu DHT22: 28,5 °C, 33,0 °C, 28,5, 33,0 °C, lalu 28,0 °C. Waktu sejak broker hilang: 0, 2 menit, dan 3 menit (uji offline). Di bawahnya delapan kartu bernomor, masing-masing dengan potongan Serial, kecuali kartu 7 yang berisi potongan pesan vitals. 1, Broker hilang: kabel LAN Pi dicabut, broker dimatikan, atau perintah Serial uji offline; Serial: uji offline: sambungan broker diputus; mode offline mulai 2 menit lagi, sambung lagi 3 menit lagi. 2, Node 1 menyadarinya: pada uji offline seketika, sedangkan kabel yang dicabut baru terasa 15–30 detik kemudian; Serial: ERROR MQTT PUTUS: sambungan terputus (kode -3). Node 1 tetap bekerja dan mencoba lagi setiap 5 detik. 3, 2 menit tanpa broker: mode offline, dan OLED menulis MODE OFFLINE di halaman status; Serial: ERROR MODE OFFLINE: broker tak terjangkau 120 detik. Pengaman lokal bekerja: kipas menyala di atas 31.0 C. 4, Suhu di atas suhu_kipas_on: 33,0 °C lebih dari 31,0 °C, pengaman lokal menyalakan kipas sendiri; Serial: Pengaman lokal: suhu 33.0 C di atas 31.0 C, kipas dinyalakan. 5, Di bawah suhu_kipas_on − 2: 28,5 °C kurang dari 29,0 °C, kipas dipadamkan; 29,5 °C, di antara 29 dan 31, diam; Serial: Pengaman lokal: suhu 28.5 C di bawah 29.0 C, kipas dipadamkan. 6, Broker kembali: 33,0 °C lagi sempat menyalakan kipas untuk kedua kalinya; Serial: MODE OFFLINE SELESAI setelah 60 detik: broker terjangkau lagi. Pengaman menyalakan kipas 2 kali. 7, Laporan di vitals pertama: dikirim 10 detik sesudah tersambung supaya backend sempat berlangganan; isi vitals offline_s 60 dan kipas_lokal 2, lalu backend mencatat kejadian mode-offline dan mengabari pemilik lewat Telegram. 8, Kipas milik pengaman: yang menyalakan, dia yang memadamkan; sudah tersambung, 28,0 °C, kipas dipadamkan; Serial: Pengaman lokal: suhu 28.0 C di bawah 29.0 C, kipas dipadamkan. Kiri bawah, kotak teal Ambang dari server, disimpan di NVS: server menerbitkan config retained (QoS 1) setiap aturan kipas berubah, berisi aksi config dan ambang suhu_kipas_on 31; Node 1 memeriksanya (angka 15–45 °C), lalu menyimpan suhu_kipas_on di NVS, dan angkanya bertahan walaupun listrik padam; selama belum pernah menerima config, angka bawaannya 30 °C; kipas padam lagi di bawah suhu_kipas_on − 2 (celah tetap 2 °C). Kanan bawah, kotak putus-putus Celah yang perlu kamu ketahui: pengaman lokal hanya bekerja kalau broker tak terjangkau; kalau yang mati adalah backend di laptop, sedangkan broker di Pi tetap menyala, Node 1 tetap tersambung dan tidak masuk mode offline, padahal aturan server ikut berhenti. Penutupnya: backend di server yang menyala terus (Modul 26–27).](aset/pengaman-lokal.png)

> ➡️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 7 — Pengaman lokal di Node 1](#praktik-7--pengaman-lokal-di-node-1-60-menit).

## 🔧 Praktik langkah demi langkah

### Praktik 1 — Data *live* lewat Socket.IO (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini`) dengan **empat terminal** untuk backend, simulator (jalur perangkat juga menjalankannya untuk satu perangkat tambahan), dan dua terminal kecil. Broker MQTT dan kontainer `rumahpintar-db` menyala seperti di Kemenangan Cepat.

Kemenangan Cepat menyiarkan **setiap** bacaan ke **setiap** klien. Praktik ini merapikannya sesuai Konsep 2: klien memilih perangkat yang ingin diikuti, backend memeriksa pilihannya, dan bacaan hanya dikirim ke *room* perangkat itu. Perubahan status perangkat (`online`/`offline`) tetap dikirim ke semua klien.

#### 1.1 Satu *room* untuk setiap perangkat

Buka **`backend/src/services/realtime.ts`** dan ganti seluruh isinya dengan versi lengkap ini:

```ts
// realtime.ts - Socket.IO: data mengalir ke terminal dan browser tanpa refresh (Modul 19).
// Setiap perangkat punya satu room bernama "perangkat:<device_id>". Klien yang ingin melihat satu perangkat mengirim
// "ikuti", lalu hanya menerima telemetry perangkat itu. Perubahan status dikirim ke semua klien.
import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { DeviceId } from "../schemas/kontrak.ts";
import type { Status, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { cariPerangkat } from "./gudang.ts";

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
}

// acara dari klien ke server; "balas" adalah ack Socket.IO
interface DariKlien {
  ikuti: (deviceId: string, balas: (jawaban: JawabanIkuti) => void) => void;
  berhenti: (deviceId: string) => void;
}

let io: Server<DariKlien, KeKlien> | undefined;

export function mulaiRealtime(app: FastifyInstance): void {
  io = new Server<DariKlien, KeKlien>(app.server); // menumpang di server HTTP Fastify, di alamat /socket.io/
  io.on("connection", (socket) => {
    app.log.info(`klien realtime tersambung: ${socket.id}`);
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
    socket.on("disconnect", (alasan) => app.log.info(`klien realtime terputus: ${socket.id} (${alasan})`));
  });
  // Saat server ditutup dengan rapi, putuskan semua klien Socket.IO lebih dulu; kalau tidak, app.close() menunggu mereka.
  app.addHook("preClose", (done) => {
    io?.local.disconnectSockets(true);
    done();
  });
}

// kirim satu telemetry HANYA ke klien yang mengikuti perangkat itu
export function siarkanTelemetry(deviceId: string, isi: Telemetry): void {
  io?.to(`perangkat:${deviceId}`).emit("telemetry", deviceId, isi);
}

// kirim perubahan status ke SEMUA klien
export function siarkanStatus(deviceId: string, status: Status): void {
  io?.emit("status", deviceId, status);
}
```

Ada empat bagian:

- **Daftar pesan** (`KeKlien` dan `DariKlien`). Dua *interface* (antarmuka tipe) ini memberi tahu TypeScript nama setiap pesan dan isinya (Konsep 2). Kalau kelak kamu salah ketik `"telemetri"` atau mengirim isi yang bentuknya lain, `npm run cek` langsung menegur. Keduanya diberikan ke `new Server<DariKlien, KeKlien>(…)`.
- **`ikuti`**. Klien mengirim `device_id`, dan backend **tidak langsung percaya**: `DeviceId.safeParse` (skema Zod yang sama dengan kontrak data) memeriksa bentuknya. Yang tidak sah dijawab `ok: false` dengan alasannya. Yang sah dimasukkan ke *room* `perangkat:<device_id>` dengan `socket.join`, lalu dijawab `ok: true` beserta **bacaan terakhir** perangkat itu dari papan pengumuman (`cariPerangkat`). Pesan yang terlewat selama klien belum tersambung tidak dikirim ulang, jadi bacaan terakhir inilah yang mengisi layar selagi bacaan baru ditunggu. Fungsi `balas` adalah *acknowledgement* Socket.IO, bukan `ack` MQTT.
- **`berhenti`** mengeluarkan klien dari *room* dengan `socket.leave`, dan **`disconnect`** mencatat klien yang pergi beserta alasannya.
- **`preClose`**. Saat backend ditutup dengan rapi (Praktik 6), Fastify menunggu semua sambungan selesai. Sambungan Socket.IO tidak pernah selesai sendiri, jadi *hook* ini memutus semuanya lebih dulu.

Di bawahnya ada dua fungsi siaran. **`siarkanTelemetry`** kini memakai `io.to("perangkat:…")`, jadi bacaan hanya sampai ke *room* perangkat itu. **`siarkanStatus`** memakai `io.emit`, jadi status sampai ke semua klien.

#### 1.2 Status ke semua klien

Buka **`backend/src/services/mqtt.ts`**.

1. Ubah baris impor dari Kemenangan Cepat menjadi:

   ```ts
   import { siarkanStatus, siarkanTelemetry } from "./realtime.ts";
   ```

2. Cari baris `simpanStatus(deviceId, hasil.data);` di bagian `status`, lalu tambahkan satu baris tepat di bawahnya:

   ```ts
       siarkanStatus(deviceId, hasil.data); // Modul 19
   ```

3. Ubah komentar di baris `siarkanTelemetry(…)` menjadi `// Modul 19: langsung diteruskan ke klien yang mengikuti perangkat ini` supaya komentarnya sesuai dengan perilaku barunya.

Simpan kedua file, lalu periksa dengan `npm run cek` di terminal backend (hentikan dulu `npm run dev` dengan **Ctrl + C**, atau buka terminal baru lalu masuk ke folder `backend` dengan `cd backend`). Tidak boleh ada pesan galat.

#### 1.3 Terminal kecil yang mengikuti satu perangkat

Buka **`alat/terminal-live.js`** dan ganti seluruh isinya:

```js
// terminal-live.js — "terminal kecil" yang menampilkan bacaan live SATU perangkat lewat Socket.IO. Modul 19.
// Butuh library socket.io-client:  npm install socket.io-client@4.8.4
// Jalankan (backend harus menyala):  node terminal-live.js http://127.0.0.1:8080 f00d00000001
// Berhenti: Ctrl + C

import { io } from "socket.io-client";

const alamat = process.argv[2] || "http://127.0.0.1:8080";
const deviceId = process.argv[3];
if (deviceId === undefined) {
  console.log("Tulis device_id perangkatnya, misalnya: node terminal-live.js http://127.0.0.1:8080 f00d00000001");
  process.exit(1);
}

const jam = () => new Date().toLocaleTimeString("id-ID"); // jam laptop, misalnya 07.15.02
const socket = io(alamat);

function tampilkan(id, isi, keterangan = "") {
  console.log(`[${jam()}] ${id}  suhu ${isi.suhu} °C  lembap ${isi.kelembapan} %  tanah ${isi.tanah} %${keterangan}`);
}

// "connect" terpanggil lagi setiap kali tersambung ulang. Room hilang saat terputus, jadi "ikuti" dikirim lagi di sini.
socket.on("connect", async () => {
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
socket.on("connect_error", (galat) => console.log(`[${jam()}] belum bisa tersambung: ${galat.message}`));
socket.on("disconnect", (alasan) => {
  console.log(`[${jam()}] terputus: ${alasan}`);
  // "io server disconnect" = server memutus kita dengan sengaja (misalnya dimatikan dengan Ctrl + C). Socket.IO tidak
  // menyambung ulang sendiri dalam keadaan itu, jadi kita minta sendiri; saat server menyala lagi, kita tersambung lagi.
  if (alasan === "io server disconnect") socket.connect();
});
```

- Alamat backend dan `device_id` diambil dari **`process.argv`**: kata ketiga dan keempat di baris perintah. Tanpa `device_id`, program menjelaskan cara memakainya lalu berhenti.
- **`emitWithAck("ikuti", deviceId)`** mengirim permintaan dan **menunggu jawabannya** dengan `await`. **`timeout(5000)`** membatasi lama menunggunya 5 detik supaya program tidak menunggu selamanya kalau backend diam.
- Permintaan `ikuti` sengaja dikirim di dalam **`connect`**. Saat sambungan putus, keanggotaan *room* ikut hilang. Karena `connect` terpanggil lagi setiap kali Socket.IO menyambung ulang, terminal kecil selalu masuk lagi ke *room*-nya tanpa campur tanganmu.
- Baris `jalur ditingkatkan ke websocket` memperlihatkan "naik kelas" dari HTTP ke WebSocket (Konsep 1).
- `disconnect` dengan alasan **`io server disconnect`** berarti backend memutus klien dengan sengaja, misalnya saat dimatikan dengan rapi. Dalam keadaan itu Socket.IO tidak menyambung ulang sendiri, jadi program memintanya dengan `socket.connect()`.

#### 1.4 Coba dengan dua terminal kecil

Jalankan lagi backend di terminal pertama (`npm run dev`), lalu hentikan terminal kecil versi Kemenangan Cepat di terminal ketiga (**Ctrl + C**). **Jalur perangkat:** biarkan Node 1 menyala, buka terminal baru untuk simulator (`cd alat`), lalu jalankan simulator untuk **satu** perangkat dengan alamat broker Pi-mu (misalnya `node simulator-perangkat.js mqtt://192.168.1.37:1883 1`) supaya ada perangkat `f00d00000001` yang bisa diikuti dan dihentikan di langkah ini. **Jalur laptop:** di terminal simulator, hentikan simulator (**Ctrl + C**), lalu jalankan lagi untuk **dua** perangkat:

```text
node simulator-perangkat.js mqtt://127.0.0.1:1883 2
```

Di terminal ketiga (folder `alat`), ikuti perangkat pertama:

```text
node terminal-live.js http://127.0.0.1:8080 f00d00000001
```

Buka terminal keempat, masuk ke folder `alat` (`cd alat`), lalu ikuti perangkat kedua: **jalur perangkat** `a4cf12e5b7c0` (ganti dengan `device_id` Node 1-mu), **jalur laptop** `f00d00000002`.

```text
node terminal-live.js http://127.0.0.1:8080 a4cf12e5b7c0
```

**Hasilnya** di terminal ketiga (**contoh**):

```text
[06.09.19] tersambung ke http://127.0.0.1:8080 (polling)
[06.09.19] jalur ditingkatkan ke websocket
[06.09.19] mengikuti f00d00000001
[06.09.25] f00d00000001  suhu 32 °C  lembap 65 %  tanah 30 %
[06.09.35] f00d00000001  suhu 28.7 °C  lembap 56 %  tanah 55 %
[06.09.45] f00d00000001  suhu 31.9 °C  lembap 55 %  tanah 35 %
```

**Hasilnya** di terminal keempat (**contoh**, Node 1):

```text
[06.09.21] tersambung ke http://127.0.0.1:8080 (polling)
[06.09.21] jalur ditingkatkan ke websocket
[06.09.21] mengikuti a4cf12e5b7c0
[06.09.25] a4cf12e5b7c0  suhu 28.5 °C  lembap 71 %  tanah 37 %
[06.09.35] a4cf12e5b7c0  suhu 28.5 °C  lembap 71 %  tanah 37 %
```

Setiap terminal kecil **hanya** menampilkan perangkat yang diikutinya. Terkadang sambungan baru sudah sempat naik kelas sebelum `connect` sehingga baris pertama langsung menulis `(websocket)` dan baris `jalur ditingkatkan …` tidak muncul. Itu wajar. Terminal backend mencatat kedua tamunya:

```text
[06:09:19] INFO: klien realtime tersambung: fP9IXYan9uqr-RSLAAAA
[06:09:19] INFO: klien fP9IXYan9uqr-RSLAAAA mengikuti f00d00000001
[06:09:21] INFO: klien realtime tersambung: orP8Tec3jUshm-lmAAAB
[06:09:21] INFO: klien orP8Tec3jUshm-lmAAAB mengikuti a4cf12e5b7c0
```

Sekarang hentikan simulator (**Ctrl + C** di terminalnya). Simulator hilang tanpa pamit, jadi broker menerbitkan wasiat `offline` atas namanya (Modul 11), dan **kedua** terminal kecil menampilkan baris yang sama karena status dikirim ke semua klien (dengan simulator dua perangkat, ada satu baris lagi untuk `f00d00000002`):

```text
[06.10.48] f00d00000001 sekarang offline
```

Jalankan lagi simulatornya sebelum lanjut (jalur laptop untuk dua perangkat, jalur perangkat untuk satu) supaya bacaan tetap mengalir.

#### 1.5 Klien yang keliru dan klien yang datang belakangan

Di terminal keempat, hentikan terminal kecil (**Ctrl + C**), lalu coba `device_id` yang tidak sah:

```text
node terminal-live.js http://127.0.0.1:8080 ABC
```

**Hasilnya** (**contoh**):

```text
[06.09.25] tersambung ke http://127.0.0.1:8080 (polling)
[06.09.25] jalur ditingkatkan ke websocket
[06.09.25] ditolak server: device_id harus 12 digit heksadesimal huruf kecil
```

Pemeriksaan Zod di `ikuti` bekerja: backend menolak tanpa ikut bingung. (Jam di contoh ini lebih awal daripada baris `offline` di 1.4 karena penulis mencobanya sebelum simulator dihentikan.) Hentikan dengan **Ctrl + C**, lalu coba tanpa `device_id` sama sekali (`node terminal-live.js http://127.0.0.1:8080`). Programnya menolak sebelum menyambung:

```text
Tulis device_id perangkatnya, misalnya: node terminal-live.js http://127.0.0.1:8080 f00d00000001
```

Terakhir, ikuti lagi perangkat kedua seperti di 1.4. Kali ini terminal kecil langsung menampilkan **bacaan terakhir** dari jawaban `ikuti`, tanpa menunggu bacaan berikutnya:

```text
[06.10.53] tersambung ke http://127.0.0.1:8080 (websocket)
[06.10.53] mengikuti a4cf12e5b7c0
[06.10.53] a4cf12e5b7c0  suhu 28.5 °C  lembap 71 %  tanah 37 %  (bacaan terakhir)
[06.10.55] a4cf12e5b7c0  suhu 28.5 °C  lembap 71 %  tanah 37 %
```

#### 1.6 Backend berhenti, terminal kecil menunggu

Hentikan backend dengan **Ctrl + C** di terminal pertama. Kedua terminal kecil tidak ikut berhenti. Mereka terus mencoba menyambung lagi, mula-mula setiap 1–3 detik, lalu makin jarang sampai sekitar setiap 5 detik (**contoh**, baris-baris awalnya):

```text
[06.11.44] terputus: transport close
[06.11.45] belum bisa tersambung: xhr poll error
[06.11.48] belum bisa tersambung: xhr poll error
[06.11.50] belum bisa tersambung: xhr poll error
```

Jalankan lagi backend (`npm run dev`). Dalam beberapa detik, kedua terminal kecil tersambung dan mengikuti perangkatnya lagi dengan sendirinya:

```text
[06.12.26] tersambung ke http://127.0.0.1:8080 (polling)
[06.12.26] jalur ditingkatkan ke websocket
[06.12.26] mengikuti f00d00000001
```

Alasan `transport close` berarti sambungannya terputus begitu saja karena backend mati mendadak. Praktik 6 menambahkan cara berhenti yang rapi; kalau backend dijalankan dengan `npm start` lalu dihentikan dengan **Ctrl + C**, alasannya menjadi `io server disconnect`.

#### 1.7 Simpan ke cabang

Hentikan kedua terminal kecil, lalu hentikan juga backend di terminal pertama (**Ctrl + C** di setiap terminal). Terminal yang sedang menjalankan program tidak bisa menerima perintah lain. Terminal pertama masih berada di folder `backend`, jadi `cd ..` di bawah membawanya kembali ke folder `rumah-pintar-mini`. Simpan pekerjaanmu:

```text
cd ..
git add backend alat
git status --short
git commit -m "Data live lewat Socket.IO dengan room per perangkat (Modul 19 Praktik 1)"
```

**Hasilnya** `git status --short` (**contoh**):

```text
M  alat/package-lock.json
M  alat/package.json
A  alat/terminal-live.js
M  backend/package-lock.json
M  backend/package.json
M  backend/src/server.ts
M  backend/src/services/mqtt.ts
A  backend/src/services/realtime.ts
```

Folder `node_modules` di `backend` dan `alat` tidak ikut karena keduanya sudah tercantum di file `.gitignore` masing-masing (Modul 4 dan 16).

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 3–4](#3-perintah--ack--batas-waktu-perintah-yang-tahu-nasibnya) sebelum Praktik 2.

### Praktik 2 — Satu pintu perintah dan keadaan perangkat (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (backend, simulator, dan terminal kecil), browser untuk **`/docs`** (Swagger UI), dan **MQTTX** dari Modul 11. Jalur perangkat: Node 1 masih memakai firmware v1.4.0 sampai Praktik 7, jadi `telemetry`-nya belum membawa `state`; pakai simulator untuk praktik ini, atau cukup amati perintah dan `ack`-nya.

Praktik ini menerapkan Konsep 3–4: semua perintah lewat satu pintu (`perintahkan()`), backend mengingat keadaan yang **diinginkan**, dan perangkat melaporkan keadaan aktuatornya di setiap `telemetry` (kontrak data **1.3**).

#### 2.1 Simulator dan pemeriksa kontrak versi Modul 19

Kontrak data 1.3 menambahkan objek **`state`** ke `telemetry` Node 1, dua kolom laporan mode offline ke `vitals`, dan rincian isi `config` (Konsep 4, 7, dan 10). Isi lengkapnya kamu salin ke `KONTRAK-DATA.md` di ➕ B. Dua alat di folder `alat` perlu diperbarui ke versi baru, dan keduanya cukup disalin dari kurikulum, tidak perlu diketik:

1. Buka [`kode/alat/simulator-perangkat.js`](kode/alat/simulator-perangkat.js) di GitHub, klik **Copy raw file** (ikon salin di kanan atas kotak kode), lalu tempelkan sebagai pengganti seluruh isi **`alat/simulator-perangkat.js`**-mu.
2. Lakukan hal yang sama untuk [`kode/alat/pemeriksa-kontrak.js`](kode/alat/pemeriksa-kontrak.js) → **`alat/pemeriksa-kontrak.js`**.

Simulator versi Modul 19 bisa melakukan empat hal baru: menulis `state` di setiap `telemetry`, mengirim `telemetry` segera saat aktuatornya berubah, menyimpan `config` ke `data/arsip-simulator.json` sebagai pengganti NVS, dan menerima perintah suhu dari terminal (`suhu 33`, `suhu acak`). Kemampuan mode offline-nya dipakai di Praktik 7. Di terminal simulator, hentikan simulator lama (**Ctrl + C**), lalu jalankan versi barunya untuk satu perangkat (jalur perangkat memakai alamat broker Pi-mu, misalnya `mqtt://192.168.1.37:1883`, dan Node 1 boleh tetap menyala):

```text
node simulator-perangkat.js mqtt://127.0.0.1:1883 1
```

**Hasilnya:**

```text
1 perangkat palsu menuju mqtt://127.0.0.1:1883. Ketik "suhu 33" atau "suhu acak". Hentikan dengan Ctrl+C.
f00d00000001: online
```

Kalau kamu berlangganan `rpm/f00d00000001/#` di MQTTX, setiap `telemetry` kini diakhiri objek `state` (**contoh**):

```json
{"ts":"2026-10-20T22:41:55Z","fw":"0.1.0","suhu":28.5,"kelembapan":66,"cahaya":2075,"tanah":39,"gerak":false,"level_air":50,"state":{"kipas":false,"lampu":false,"pompa":false,"tirai":90}}
```

Biarkan simulator berjalan. Backend v0.3 masih memakai skema kontrak 1.2, jadi untuk sementara ia **menolak** `telemetry` baru ini (kolom `state` belum dikenal); langkah berikutnya memperbaikinya.

#### 2.2 Skema kontrak 1.3: `kontrak.ts`

Buka **`backend/src/schemas/kontrak.ts`**.

1. Ubah komentar baris pertama: `kontrak data 1.2` menjadi `kontrak data 1.3`.
2. `TelemetryNode1` kini memakai `Keadaan`, jadi **pindahkan** skema `Keadaan` (empat baris `kipas`, `lampu`, `pompa`, `tirai`) dari bawah `Vitals` ke **atas** baris komentar `TelemetryNode1`. Di v0.3, `Keadaan` belum punya komentar, jadi tambahkan juga satu baris komentar di atasnya. Hasilnya seperti ini:

   ```ts
   // keadaan keempat aktuator, sama di ack (kontrak 1.0) dan di telemetry Node 1 (kontrak 1.3)
   export const Keadaan = z.strictObject({
     kipas: z.boolean(),
     lampu: z.boolean(),
     pompa: z.boolean(),
     tirai: z.number().int().min(0).max(180),
   });
   ```

3. Di dalam `TelemetryNode1`, tambahkan satu baris tepat di bawah `ec: bulat(0, 20000).optional(),`:

   ```ts
     state: Keadaan.optional(),
   ```

   `optional()` membuat Node 1 berfirmware lama (tanpa `state`) tetap diterima. Ganti juga komentar satu baris di atas `TelemetryNode1` dengan dua baris ini: `// telemetry Node 1 (kontrak 1.0) ditambah tiga kolom sensor RS-485 yang boleh tidak ada (kontrak 1.2) dan keadaan` dan `// aktuator (kontrak 1.3; firmware yang lebih lama belum menulisnya, jadi boleh tidak ada)`.

4. Ganti skema `Vitals` dengan versi yang menerima laporan mode offline:

   ```ts
   // vitals (kontrak 1.0) ditambah laporan mode offline (kontrak 1.3): offline_s dan kipas_lokal selalu datang bersama
   export const Vitals = z
     .strictObject({
       ts: Waktu,
       rssi: z.number().int().max(0),
       uptime_s: z.number().int().min(0),
       heap_free: z.number().int().min(0),
       offline_s: z.number().int().min(0).optional(),
       kipas_lokal: z.number().int().min(0).optional(),
     })
     .refine((v) => (v.offline_s === undefined) === (v.kipas_lokal === undefined),
       "laporan mode offline harus lengkap: offline_s dan kipas_lokal selalu datang bersama");
   ```

   `.refine` (Modul 16) memeriksa aturan yang melibatkan dua kolom sekaligus: keduanya ada, atau keduanya tidak ada.

5. Di daftar `export type` di paling bawah, tambahkan baris ini sebagai baris pertamanya:

   ```ts
   export type Keadaan = z.infer<typeof Keadaan>;
   ```

#### 2.3 Papan pengumuman mencatat laporan: `gudang.ts`

Buka **`backend/src/services/gudang.ts`**.

1. Tambahkan `Keadaan` ke baris impor tipe: `import type { Ack, Keadaan, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";`.
2. Tambahkan tiga kolom di akhir *interface* `Perangkat`, tepat di bawah `vitals: Vitals | null;`:

   ```ts
     reported: Keadaan | null; // Modul 19: keadaan aktuator yang terakhir dilaporkan perangkat (telemetry.state atau ack.state)
     reported_ts: string | null; // Modul 19: ts laporan itu, menurut jam perangkat
     reported_pada: string | null; // Modul 19: waktu server (UTC) saat laporan itu tiba
   ```

3. Di fungsi `ambilAtauBuat`, objek perangkat baru kini harus punya ketiga kolom itu. Ganti baris `p = { device_id: … };` dengan:

   ```ts
       p = {
         device_id: deviceId, jenis: "belum-diketahui", status: "belum-diketahui", terakhir_dilihat: "", telemetry: null,
         vitals: null, reported: null, reported_ts: null, reported_pada: null,
       };
   ```

4. Tambahkan fungsi baru tepat di atas `export function simpanTelemetry`:

   ```ts
   // Modul 19: simpan laporan keadaan aktuator, kecuali laporan itu lebih tua daripada yang sudah tersimpan (ts perangkat).
   // Waktu berformat kontrak (2026-10-21T06:10:12Z) bisa dibandingkan langsung sebagai teks. Hasilnya true kalau dipakai.
   export function simpanLaporan(deviceId: string, keadaan: Keadaan, ts: string | null): boolean {
     const p = ambilAtauBuat(deviceId);
     if (ts !== null && p.reported_ts !== null && ts < p.reported_ts) return false;
     p.reported = keadaan;
     p.reported_ts = ts ?? p.reported_ts; // ack.ts boleh null (jam perangkat belum disetel)
     p.reported_pada = new Date().toISOString();
     return true;
   }
   ```

   Laporan bisa datang terlambat, misalnya `telemetry` susulan yang sempat tertahan di jaringan. Dengan membandingkan `ts` perangkat, laporan yang lebih tua tidak menimpa laporan yang lebih baru. (`ts` hanya sampai detik, jadi dua laporan dalam detik yang sama dipakai menurut urutan tibanya.)

#### 2.4 Satu pintu untuk semua perintah: `log.ts` dan `perintah.ts`

Mulai minggu ini, beberapa bagian backend yang tidak memegang objek `app` milik Fastify (perintah, aturan, jadwal, dan Telegram) perlu menulis ke log server. Supaya semuanya menulis ke buku log yang sama, buat dulu file kecil **`backend/src/services/log.ts`** (klik kanan folder **`services`** → **New File…**):

```ts
// log.ts - satu "buku log" untuk layanan yang tidak memegang app Fastify (perintah, aturan, jadwal, Telegram).
// server.ts mengisinya dengan app.log sekali, sesaat setelah server dibuat (Modul 19).
import type { FastifyBaseLogger } from "fastify";

let pencatat: FastifyBaseLogger | undefined;

export function pakaiLog(logServer: FastifyBaseLogger): void {
  pencatat = logServer;
}

export const log = {
  info: (pesan: string) => pencatat?.info(pesan),
  warn: (pesan: string) => pencatat?.warn(pesan),
  error: (pesan: string) => pencatat?.error(pesan),
};
```

`pakaiLog(app.log)` dipanggil sekali oleh `server.ts` (langkah 2.6). Sesudah itu, file mana pun bisa menulis `log.info("…")`, dan barisnya muncul di terminal backend dengan jam dan format yang sama dengan log Fastify.

Lalu buat file **`perintah.ts`** di folder yang sama, dan ketik:

```ts
// perintah.ts - satu pintu untuk SEMUA perintah ke perangkat (Modul 19): API, aturan otomatis, jadwal, dan Telegram
// memakai fungsi yang sama, perintahkan(). Di sini juga dicatat keadaan yang DIINGINKAN server (desired) untuk aktuator
// yang keadaannya bertahan (kipas, lampu, tirai), lalu dicocokkan dengan keadaan yang DILAPORKAN perangkat (reported).
import type { Ack, Keadaan, PerintahSet } from "../schemas/kontrak.ts";
import { cariPerangkat, simpanLaporan, tungguAck } from "./gudang.ts";
import { brokerTersambung, buatIdPerintah, kirimPerintah } from "./mqtt.ts";
import { arsipkanPerintah } from "../db/arsip.ts";
import { log } from "./log.ts";

export type Sumber = "api" | "aturan" | "jadwal" | "telegram"; // siapa yang menyuruh

// Hasil satu perintah. "dijawab" = ada ack (ok true atau false), "tanpa-ack" = tidak dijawab dalam 5 detik,
// "tidak-dikirim" = perintah tidak diterbitkan sama sekali (kodenya dipakai API sebagai kode HTTP).
export type HasilPerintah =
  | { status: "dijawab"; id: string; lama_ms: number; ack: Ack }
  | { status: "tanpa-ack"; id: string; lama_ms: number }
  | { status: "tidak-dikirim"; kode: 404 | 409 | 503; pesan: string };

const BATAS_ACK_MS = 5000; // setiap cmd dijawab ack dalam 5 detik (kontrak aturan 4)
const JEDA_COBA_LAGI_MS = 30_000; // rekonsiliasi: paling sering sekali setiap 30 detik per aktuator

// pompa tidak punya keadaan yang bertahan: perintahnya denyut 1-10 detik yang padam sendiri
type PerintahTetap = Extract<PerintahSet, { target: "kipas" | "lampu" | "tirai" }>;

// Satu keinginan server untuk satu aktuator.
interface Keinginan {
  perintah: PerintahTetap;
  sumber: Sumber;
  aturanId: number | null;
  dicoba: number; // kapan perintahnya terakhir dikirim (milidetik, seperti Date.now())
  terpenuhi: boolean; // sudah pernah dilaporkan perangkat sesuai keinginan?
}

const keinginan = new Map<string, Map<string, Keinginan>>(); // device_id -> (target -> keinginan)
const menungguAck = new Set<string>(); // "<device_id>/<target>" yang perintahnya sedang menunggu ack

export async function perintahkan(deviceId: string, perintah: PerintahSet, sumber: Sumber,
  aturanId: number | null = null): Promise<HasilPerintah> {
  const p = cariPerangkat(deviceId);
  if (p === undefined) return { status: "tidak-dikirim", kode: 404, pesan: `perangkat ${deviceId} belum pernah terdengar` };
  if (p.jenis === "node2") return { status: "tidak-dikirim", kode: 409, pesan: "Node 2 tidak menerima perintah (kontrak bagian 2)" };
  if (p.jenis !== "node1") {
    return { status: "tidak-dikirim", kode: 409, pesan: "jenis perangkat belum diketahui: tunggu telemetry pertamanya" };
  }
  if (p.status !== "online") return { status: "tidak-dikirim", kode: 409, pesan: `perangkat sedang ${p.status}, perintah tidak dikirim` };
  if (!brokerTersambung()) return { status: "tidak-dikirim", kode: 503, pesan: "backend sedang tidak tersambung ke broker" };
  const kunci = `${deviceId}/${perintah.target}`;
  if (menungguAck.has(kunci)) { // satu aktuator, satu perintah yang sedang ditunggu
    return { status: "tidak-dikirim", kode: 409, pesan: `perintah ${perintah.target} sebelumnya masih menunggu ack` };
  }

  if (perintah.target !== "pompa") catatKeinginan(deviceId, perintah, sumber, aturanId);
  const id = buatIdPerintah();
  const mulai = Date.now();
  menungguAck.add(kunci);
  const menunggu = tungguAck(id, BATAS_ACK_MS); // mulai menunggu SEBELUM mengirim
  kirimPerintah(deviceId, id, perintah);
  const ack = await menunggu;
  menungguAck.delete(kunci);
  const lama = Date.now() - mulai;
  arsipkanPerintah(id, deviceId, perintah, new Date(mulai), ack, lama)
    .catch((galat) => log.error(`gagal mencatat perintah ${id} ke database: ${galat.message}`));
  if (ack === null) {
    log.warn(`perintah ${id} (${sumber}) ke ${deviceId}: tidak ada ack dalam 5 detik`);
    return { status: "tanpa-ack", id, lama_ms: lama };
  }
  if (!ack.ok) keinginan.get(deviceId)?.delete(perintah.target); // ditolak perangkat: jangan dicoba lagi
  log.info(`perintah ${id} (${sumber}) ke ${deviceId}: ${perintah.target} = ${perintah.nilai}, ack ok=${ack.ok} dalam ${lama} ms`);
  return { status: "dijawab", id, lama_ms: lama, ack };
}

function catatKeinginan(deviceId: string, perintah: PerintahTetap, sumber: Sumber, aturanId: number | null): void {
  let milikPerangkat = keinginan.get(deviceId);
  if (milikPerangkat === undefined) {
    milikPerangkat = new Map();
    keinginan.set(deviceId, milikPerangkat);
  }
  milikPerangkat.set(perintah.target, { perintah, sumber, aturanId, dicoba: Date.now(), terpenuhi: false });
}

// Dipanggil mqtt.ts setiap kali telemetry atau ack perangkat tiba. keadaan = state di pesan itu (null kalau telemetry
// firmware lama yang belum membawa state).
export function catatLaporan(deviceId: string, keadaan: Keadaan | null, ts: string | null): void {
  if (keadaan !== null && simpanLaporan(deviceId, keadaan, ts)) {
    for (const k of keinginan.get(deviceId)?.values() ?? []) {
      if (keadaan[k.perintah.target] === k.perintah.nilai) k.terpenuhi = true;
    }
  }
  cocokkan(deviceId);
}

// Rekonsiliasi: kirim lagi keinginan yang BELUM terbukti dikerjakan perangkat. Keinginan yang sudah pernah terpenuhi
// tidak dipaksakan lagi: kalau sesudah itu aktuatornya diubah aturan lokal perangkat atau MQTTX, server tidak melawan.
function cocokkan(deviceId: string): void {
  const p = cariPerangkat(deviceId);
  if (p === undefined || p.reported === null || p.status !== "online") return;
  for (const k of keinginan.get(deviceId)?.values() ?? []) {
    const { target, nilai } = k.perintah;
    if (k.terpenuhi || p.reported[target] === nilai) continue; // sudah sesuai
    if (menungguAck.has(`${deviceId}/${target}`)) continue; // perintah sebelumnya masih ditunggu
    if (Date.now() - k.dicoba < JEDA_COBA_LAGI_MS) continue; // terlalu cepat: tunggu dulu
    const pesan = `${target} ${deviceId} dilaporkan ${p.reported[target]}, padahal diinginkan ${nilai} (${k.sumber}); `
      + "perintah dikirim lagi";
    log.warn(`cocokkan ${pesan}`);
    void perintahkan(deviceId, k.perintah, k.sumber, k.aturanId);
  }
}

// Dipanggil mqtt.ts kalau vitals membawa uptime_s kecil: perangkat baru menyala (lagi), dan semua relay-nya padam saat
// menyala. Keinginan yang sudah terpenuhi pun dicocokkan lagi.
export function perangkatMenyalaUlang(deviceId: string, uptime: number): void {
  const daftar = keinginan.get(deviceId);
  if (daftar === undefined || daftar.size === 0) return;
  log.warn(`${deviceId} baru menyala ulang (uptime ${uptime} detik): keinginan server dicocokkan lagi`);
  for (const k of daftar.values()) k.terpenuhi = false;
}

// Untuk GET /devices/:id/state: desired, reported, kapan reported tiba, dan aktuator yang belum cocok.
export function keadaanPerangkat(deviceId: string) {
  const p = cariPerangkat(deviceId);
  if (p === undefined) return undefined;
  const desired: { kipas?: boolean; lampu?: boolean; tirai?: number } = {};
  const selisih: string[] = [];
  for (const { perintah } of keinginan.get(deviceId)?.values() ?? []) {
    if (perintah.target === "tirai") desired.tirai = perintah.nilai;
    else desired[perintah.target] = perintah.nilai;
    if (p.reported === null || p.reported[perintah.target] !== perintah.nilai) selisih.push(perintah.target);
  }
  return { device_id: deviceId, desired, reported: p.reported, reported_pada: p.reported_pada, selisih };
}
```

File ini adalah inti Konsep 3–4. Bacalah dari atas ke bawah:

- **`HasilPerintah`** menuliskan nasib setiap perintah (tabel Konsep 3): `dijawab`, `tanpa-ack`, atau `tidak-dikirim` beserta kode HTTP yang pantas (`404`, `409`, `503`).
- **`perintahkan()`** memeriksa perangkatnya dulu (pemeriksaan yang sama dengan rute v0.3), lalu menerapkan dua aturan baru: **satu aktuator, satu perintah yang menunggu** (`menungguAck`), dan keinginan hanya dicatat untuk aktuator yang keadaannya bertahan (bukan pompa). Sesudah itu, polanya sama dengan Modul 16: mulai menunggu `ack` **sebelum** mengirim, kirim, tunggu paling lama 5 detik, lalu catat ke tabel `commands`. Perintah yang ditolak perangkat (`ok: false`) dihapus dari daftar keinginan supaya tidak dicoba lagi.
- **`Keinginan`** menyimpan perintahnya, sumbernya, kapan terakhir dicoba, dan **`terpenuhi`**: sudah pernah dilaporkan perangkat sesuai keinginan atau belum. Tipe **`PerintahTetap`** di atasnya memakai **`Extract<…>`** milik TypeScript, yang menyaring `PerintahSet` hingga tinggal perintah dengan `target` `kipas`, `lampu`, atau `tirai`. Jadi, perintah pompa tidak mungkin masuk daftar keinginan.
- **`catatLaporan()`** dipanggil setiap kali `telemetry` atau `ack` tiba. Ia menyimpan laporan lewat `simpanLaporan`, menandai keinginan yang kini terpenuhi, lalu memanggil `cocokkan()`.
- **`cocokkan()`** adalah rekonsiliasi Konsep 4. Keinginan dikirim lagi hanya kalau belum pernah terpenuhi, berbeda dengan laporan, tidak ada perintah untuk aktuator itu yang masih menunggu `ack`, dan sudah lewat 30 detik sejak percobaan terakhir. `void` di depan `perintahkan(…)` berarti "jalankan tanpa menunggu hasilnya".
- **`perangkatMenyalaUlang()`** mengosongkan tanda `terpenuhi` semua keinginan sebuah perangkat yang baru menyala sehingga semuanya dicocokkan lagi.
- **`keadaanPerangkat()`** menyusun jawaban untuk `GET /devices/:id/state`.

#### 2.5 Rute perintah lewat pintu yang sama, dan rute keadaan: `perangkat.ts`

Buka **`backend/src/routes/perangkat.ts`**.

1. Ubah baris kedua komentar kepala menjadi `// perintah, dan keadaan aktuator (desired/reported, Modul 19).`
2. Ganti empat baris impor di bawah `import type { FastifyPluginAsyncZod } …` dengan:

   ```ts
   import { Ack, DeviceId, Keadaan, PerintahSet, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
   import { cariPerangkat, semuaPerangkat } from "../services/gudang.ts";
   import { keadaanPerangkat, perintahkan } from "../services/perintah.ts";
   import { ambilRingkasan, ambilRiwayat, waktuKontrak } from "../db/arsip.ts";
   ```

3. Di rute `POST /devices/:id/command`, ubah keterangan `409` menjadi:

   ```ts
           409: Galat.describe("perangkat offline, Node 2, jenisnya belum diketahui, atau perintah sebelumnya untuk "
             + "aktuator yang sama masih menunggu ack"),
   ```

4. Masih di rute itu, ganti **seluruh isi** fungsi `async (req, reply) => { … }` (dari `const p = cariPerangkat(…)` sampai `return { id: idPerintah, lama_ms: lama, ack };`) dengan empat baris:

   ```ts
       const hasil = await perintahkan(req.params.id, req.body, "api"); // Modul 19: lewat satu pintu yang sama
       if (hasil.status === "tidak-dikirim") return reply.code(hasil.kode).send({ pesan: hasil.pesan });
       if (hasil.status === "tanpa-ack") return reply.code(504).send({ pesan: `tidak ada ack untuk ${hasil.id} dalam 5 detik` });
       return { id: hasil.id, lama_ms: hasil.lama_ms, ack: hasil.ack };
   ```

5. Tambahkan rute baru di bawahnya, sebelum `};` penutup file:

   ```ts
     app.get("/devices/:id/state", {
       schema: {
         tags: ["perangkat"],
         summary: "Keadaan aktuator: yang diinginkan server (desired) dan yang dilaporkan perangkat (reported)",
         params: ParamId,
         response: {
           200: z.object({
             device_id: z.string(),
             desired: z.object({ kipas: z.boolean().optional(), lampu: z.boolean().optional(), tirai: z.number().optional() })
               .describe("keadaan yang diinginkan server untuk kipas, lampu, dan tirai (pompa tidak: perintahnya sekali jalan)"),
             reported: Keadaan.nullable().describe("keadaan terakhir yang dilaporkan perangkat lewat telemetry atau ack"),
             reported_pada: z.string().nullable().describe("waktu server saat laporan itu tiba"),
             selisih: z.array(z.string()).describe("aktuator yang keadaannya belum sama dengan keinginan server"),
           }).describe("desired, reported, dan selisihnya"),
           404: Galat.describe("perangkat belum pernah terdengar"),
         },
       },
     }, async (req, reply) => {
       const keadaan = keadaanPerangkat(req.params.id);
       if (keadaan === undefined) return reply.code(404).send({ pesan: `perangkat ${req.params.id} belum pernah terdengar` });
       return keadaan;
     });
   ```

#### 2.6 MQTT memberi kabar: `mqtt.ts` dan `server.ts`

Buka **`backend/src/services/mqtt.ts`**.

1. Di bawah baris `import { siarkanStatus, siarkanTelemetry } from "./realtime.ts";`, tambahkan:

   ```ts
   import { catatLaporan, perangkatMenyalaUlang } from "./perintah.ts";
   ```

2. Di bagian `telemetry`, ganti lima baris mulai `simpanTelemetry(deviceId, hasil.data);` sampai `.then((baru) => …)` (termasuk baris `const ts = hasil.data.ts;` di antaranya) dengan versi yang memberi nama `isi` pada data yang sudah diperiksa dan mencatat laporan keadaannya:

   ```ts
       const isi = hasil.data;
       simpanTelemetry(deviceId, isi);
       siarkanTelemetry(deviceId, isi); // Modul 19: langsung diteruskan ke klien yang mengikuti perangkat ini
       if (!("tekanan" in isi)) catatLaporan(deviceId, isi.state ?? null, isi.ts); // Modul 19: keadaan aktuator (kontrak 1.3)
       arsipkanTelemetry(deviceId, isi)
         .then((baru) => { if (!baru) log.info(`kiriman ganda dilewati: ${deviceId} ${isi.ts}`); })
   ```

   Baris `.catch(gagalArsip(topik, log));` di bawahnya tetap. Pemeriksaan `"tekanan" in isi` melewatkan Node 2, yang tidak punya aktuator.

3. Di bagian `vitals`, tambahkan dua baris tepat di bawah `simpanVitals(deviceId, hasil.data);`:

   ```ts
       // Modul 19: vitals pertama sesudah perangkat menyala membawa uptime kecil; semua relay-nya baru saja padam
       if (hasil.data.uptime_s < 60) perangkatMenyalaUlang(deviceId, hasil.data.uptime_s);
   ```

4. Di bagian `ack`, tambahkan satu baris tepat di bawah `if (!hasil.success) return tolak(…);`:

   ```ts
       catatLaporan(deviceId, hasil.data.state, hasil.data.ts); // Modul 19: setiap ack sah memperbarui keadaan yang dilaporkan
   ```

Lalu buka **`backend/src/server.ts`**. Di bawah `import { mulaiRealtime } from "./services/realtime.ts";`, tambahkan `import { pakaiLog } from "./services/log.ts";`. Lalu tambahkan satu baris tepat di bawah penutup `});` milik `const app = Fastify({ … });`, sebelum `app.addHook("onResponse", …)`:

```ts
pakaiLog(app.log); // Modul 19: layanan lain (perintah, aturan, jadwal, Telegram) menulis ke log yang sama
```

Simpan semuanya. Di terminal pertama, masuk lagi ke folder `backend` (`cd backend`; sejak *commit* Praktik 1 terminal itu berada di `rumah-pintar-mini`), lalu jalankan `npm run cek`. Tidak boleh ada galat.

#### 2.7 Terminal kecil menampilkan kipas dan lampu

Buka **`alat/terminal-live.js`** dan ganti fungsi `tampilkan` dengan:

```js
function tampilkan(id, isi, keterangan = "") {
  // kontrak 1.3: telemetry Node 1 membawa state, jadi keadaan kipas dan lampu ikut tampil
  const aktuator = isi.state ? `  kipas ${isi.state.kipas ? "NYALA" : "padam"}  lampu ${isi.state.lampu ? "NYALA" : "padam"}` : "";
  console.log(`[${jam()}] ${id}  suhu ${isi.suhu} °C  lembap ${isi.kelembapan} %  tanah ${isi.tanah} %${aktuator}${keterangan}`);
}
```

#### 2.8 Coba: perintah, keadaan, dan rekonsiliasi

Jalankan backend (`npm run dev`) dan terminal kecil untuk perangkat simulator (`node terminal-live.js http://127.0.0.1:8080 f00d00000001`). Lalu buka **`http://127.0.0.1:8080/docs`** di browser.

1. Buka rute **`GET /devices/{id}/state`** → **Try it out** → isi `id` dengan `f00d00000001` → **Execute**. **Hasilnya** (**contoh**):

   ```json
   {
     "device_id": "f00d00000001",
     "desired": {},
     "reported": {
       "kipas": false,
       "lampu": false,
       "pompa": false,
       "tirai": 90
     },
     "reported_pada": "2026-10-20T23:22:31.244Z",
     "selisih": []
   }
   ```

   Belum ada keinginan (`desired` kosong), dan laporannya datang dari `telemetry` terakhir.

2. Buka **`POST /devices/{id}/command`** → **Try it out** → isi `id` dengan `f00d00000001` dan *body* dengan `{"target":"kipas","nilai":true}` → **Execute**. **Hasilnya** (**contoh**):

   ```json
   {
     "id": "c-20261020-232239-1",
     "lama_ms": 6,
     "ack": {
       "id": "c-20261020-232239-1",
       "ts": "2026-10-20T23:22:39Z",
       "ok": true,
       "state": {
         "kipas": true,
         "lampu": false,
         "pompa": false,
         "tirai": 90
       }
     }
   }
   ```

   Terminal kecil langsung menampilkan `kipas NYALA`, dan log backend menulis sumbernya:

   ```text
   [06:22:39] INFO: perintah c-20261020-232239-1 (api) ke f00d00000001: kipas = true, ack ok=true dalam 6 ms
   ```

3. Kirim dua perintah lagi lewat rute yang sama: `{"target":"tirai","nilai":45}` dan `{"target":"pompa","nilai":3}`. Lalu buka lagi `GET /devices/{id}/state`. **Hasilnya** (**contoh**):

   ```json
   {
     "device_id": "f00d00000001",
     "desired": {
       "kipas": true,
       "tirai": 45
     },
     "reported": {
       "kipas": true,
       "lampu": false,
       "pompa": true,
       "tirai": 45
     },
     "reported_pada": "2026-10-20T23:22:40.670Z",
     "selisih": []
   }
   ```

   Kipas dan tirai tercatat sebagai keinginan; pompa tidak tercatat karena perintahnya hanya denyut 3 detik. Laporan menunjukkan pompa sedang menyala saat itu, dan beberapa detik kemudian padam sendiri.

4. Sekarang matikan kipas **tanpa lewat backend**, seolah-olah otak lain yang melakukannya. Di MQTTX, terbitkan ke topik `rpm/f00d00000001/cmd` (QoS 0, **tanpa** *retained*):

   ```json
   {"id":"mqttx-1","aksi":"set","target":"kipas","nilai":false}
   ```

   Log backend menulis `ack mqttx-1 tiba, tetapi tidak ada perintah yang menunggunya`, dan `GET /devices/{id}/state` kini menunjukkan `"kipas": false` di `reported` dengan `"selisih": ["kipas"]`. Tunggu satu menit, lalu lihat lagi: selisihnya masih ada, dan backend **tidak** mengirim ulang perintah kipas. Keinginan kipas sudah pernah terpenuhi, jadi backend tidak melawan otak lain (Konsep 4).

5. Hentikan simulator (**Ctrl + C**), tunggu 10 detik, lalu jalankan lagi. Perangkat yang baru menyala melaporkan `uptime_s` kecil, dan backend mencocokkan semua keinginannya. **Hasilnya** di log backend (**contoh**; perintah ulang baru dikirim beberapa detik kemudian, setelah laporan berikutnya tiba dan 30 detik lewat sejak percobaan terakhir):

   ```text
   [06:27:37] WARN: f00d00000001 baru menyala ulang (uptime 0 detik): keinginan server dicocokkan lagi
   [06:27:49] WARN: cocokkan f00d00000001: kipas dilaporkan false, padahal diinginkan true (api); perintah dikirim lagi
   [06:27:49] WARN: cocokkan f00d00000001: tirai dilaporkan 90, padahal diinginkan 45 (api); perintah dikirim lagi
   [06:27:49] INFO: perintah c-20261020-232749-3 (api) ke f00d00000001: kipas = true, ack ok=true dalam 5 ms
   [06:27:49] INFO: perintah c-20261020-232749-4 (api) ke f00d00000001: tirai = 45, ack ok=true dalam 7 ms
   ```

   Simulator yang baru menyala memulai semua aktuatornya dalam keadaan padam (tirai 90°), persis seperti Node 1 sungguhan, lalu backend mengembalikan keinginannya.

6. Terakhir, hentikan simulator lagi dan kirim `{"target":"lampu","nilai":true}`. **Hasilnya** kode `409`:

   ```json
   {
     "pesan": "perangkat sedang offline, perintah tidak dikirim"
   }
   ```

   Jalankan lagi simulatornya sebelum lanjut.

Satu hal perlu kamu ingat: setiap kali file backend disimpan, `npm run dev` memulai ulang backend, dan keinginan yang disimpan di memori ikut hilang (`"desired": {}`). Itu sesuai Konsep 4; riwayat perintahnya tetap ada di tabel `commands`. Sebelum menyimpan ke cabang, hentikan backend di terminal pertama (**Ctrl + C**). Terminal itu masih berada di folder `backend`, dan `cd ..` di bawah membawanya ke folder `rumah-pintar-mini`.

#### 2.9 Simpan ke cabang

```text
cd ..
git add backend alat
git commit -m "Satu pintu perintah, keadaan desired/reported, dan kontrak data 1.3 di backend (Modul 19 Praktik 2)"
```

Simulator boleh tetap berjalan di terminalnya sendiri. Folder `alat/data/`, tempat simulator menyimpan `config` mulai Praktik 4, tidak akan ikut karena sudah tercantum di `alat/.gitignore`.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 5–6](#5-mesin-aturan-aturan-sebagai-data-bukan-kode) sebelum Praktik 3.

### Praktik 3 — Otak aturan dan 10 *unit test* (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal di folder `backend`. Praktik ini tidak butuh broker, perangkat, atau database: otak aturan diuji sendirian.
>
> ⭐ **Wajib** — sepuluh *unit test* mesin aturan yang hijau adalah salah satu hasil utama modul ini (Silabus: "10 *unit test* *rules engine* hijau").

Praktik ini menerapkan Konsep 5–6: aturan ditulis sebagai data yang diperiksa Zod, otaknya ditulis sebagai fungsi murni, lalu diuji dengan Vitest. Otak ini belum disambungkan ke MQTT; itu tugas Praktik 4.

#### 3.1 Pasang Vitest

Hentikan `npm run dev` kalau masih berjalan (**Ctrl + C**). Sejak *commit* Praktik 2 terminal pertama berada di folder `rumah-pintar-mini`, jadi masuk lagi ke folder `backend` dengan `cd backend` (ujung baris perintahnya kini `backend>`; di macOS `backend %`). Di sana, pasang Vitest sebagai **alat pengembangan** (`--save-dev`): ia hanya dipakai saat menulis dan memeriksa kode, bukan saat backend berjalan. Paket `vite` ditulis juga karena Vitest membutuhkannya:

```text
npm install --save-dev vitest@5.0.5 vite@8.3.4
```

**Hasilnya:**

```text
added 35 packages, and audited 199 packages in 33s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Paketnya cukup besar: folder `node_modules` bertambah sekitar 40 MB, jadi beri waktu kalau koneksimu lambat. Lalu buka **`backend/package.json`** dan tambahkan satu skrip di bagian `"scripts"`, di bawah `"isi-riwayat"` (jangan lupa koma di akhir baris `"isi-riwayat": …`):

```json
    "test": "vitest run"
```

`vitest run` menjalankan semua uji sekali lalu selesai. Tanpa kata `run`, Vitest terus mengawasi file dan menguji ulang setiap kali kamu menyimpan.

#### 3.2 Bentuk aturan: `schemas/aturan.ts`

Klik kanan folder **`backend/src/schemas`** → **New File…**, beri nama **`aturan.ts`**, lalu ketik:

```ts
// aturan.ts - bentuk aturan otomatis (Modul 19) sebagai skema Zod. Aturan adalah DATA, bukan kode: hanya bentuk yang
// dikenal di sini yang boleh masuk, baik lewat API maupun dari database.
import { z } from "zod";
import { DeviceId } from "./kontrak.ts";

// besaran telemetry yang boleh dipakai aturan ambang
const Besaran = z.enum(["suhu", "kelembapan", "cahaya", "tanah", "level_air", "tanah_rs485", "suhu_tanah"]);

// "Kalau <besaran> perangkat itu di atas <nyala_di_atas> terus-menerus selama <selama_detik> detik, aturan menyala;
// aturan padam lagi kalau <besaran> di bawah <padam_di_bawah>."
export const KondisiAmbang = z.strictObject({
  jenis: z.literal("ambang"),
  device_id: DeviceId,
  besaran: Besaran,
  nyala_di_atas: z.number(),
  padam_di_bawah: z.number(),
  selama_detik: z.number().int().min(0).max(3600),
}).refine((k) => k.padam_di_bawah < k.nyala_di_atas, {
  message: "padam_di_bawah harus lebih kecil daripada nyala_di_atas (histeresis)",
  path: ["padam_di_bawah"],
});

// "... maka nyalakan <target> perangkat itu, dan padamkan lagi saat aturan padam."
export const AksiSakelar = z.strictObject({
  jenis: z.literal("sakelar"),
  device_id: DeviceId,
  target: z.enum(["kipas", "lampu"]),
  kabari: z.boolean(), // kirim pesan Telegram saat aturan ini bertindak?
});

// Isi POST /rules dan PUT /rules/:id, sekaligus bentuk kolom-kolom tabel rules.
export const Aturan = z.strictObject({
  nama: z.string().min(1).max(60),
  aktif: z.boolean(),
  kondisi: KondisiAmbang,
  aksi: AksiSakelar,
});

export type KondisiAmbang = z.infer<typeof KondisiAmbang>;
export type Aturan = z.infer<typeof Aturan>;
```

- **`KondisiAmbang`**, **`AksiSakelar`**, dan **`Aturan`** adalah bentuk JSON aturan di Konsep 5, dituliskan sebagai skema Zod. `z.literal("ambang")` hanya menerima teks `ambang` persis, dan `z.enum([…])` hanya menerima besaran yang ada di daftar.
- **`.refine`** pada `KondisiAmbang` memastikan histeresisnya masuk akal: batas padam harus **lebih kecil daripada** batas nyala. `path: ["padam_di_bawah"]` membuat pesan galatnya menunjuk kolom yang salah.
- Skema ini dipakai di dua pintu: isi permintaan API (Praktik 4) dan baris yang dibaca dari tabel `rules`. Isi tabel bisa diubah dengan tangan lewat DBeaver, jadi isi database pun tidak langsung dipercaya.

#### 3.3 Otak aturan: `aturan/mesin.ts`

Klik kanan folder **`backend/src`** → **New Folder…**, beri nama **`aturan`**. Di dalamnya, buat file **`mesin.ts`**:

```ts
// mesin.ts - "otak" aturan otomatis (Modul 19), berupa fungsi MURNI: tidak membaca jam, database, atau MQTT sendiri.
// Semua yang dibutuhkan datang lewat argumen, jadi masukan yang sama selalu memberi hasil yang sama (mudah diuji).
import type { KondisiAmbang } from "../schemas/aturan.ts";

// Ingatan satu aturan ambang dari bacaan ke bacaan.
export interface Ingatan {
  aktif: boolean; // aturan sedang "menyala" (misalnya kipas seharusnya menyala)?
  sejak: number | null; // kapan bacaan mulai berada di atas ambang nyala (milidetik); null = tidak sedang menunggu
  terakhir: number | null; // kapan bacaan terakhir dinilai (milidetik)
}

export const INGATAN_AWAL: Ingatan = { aktif: false, sejak: null, terakhir: null };
export const JEDA_MAKS_MS = 60_000; // bacaan berjarak lebih dari 60 detik: hitungan "selama" diulang dari nol

export type Keputusan = "nyalakan" | "padamkan" | null; // null = tidak ada yang perlu dikerjakan

// Nilai satu bacaan. sekarang = jam saat bacaan tiba (milidetik, seperti Date.now()), diberikan oleh pemanggil.
// Keputusan hanya keluar saat aturan BERGANTI keadaan (di tepi), bukan di setiap bacaan.
export function nilaiAmbang(k: KondisiAmbang, ingatan: Ingatan, nilai: number | null, sekarang: number):
  { ingatan: Ingatan; keputusan: Keputusan } {
  const terputus = ingatan.terakhir !== null && sekarang - ingatan.terakhir > JEDA_MAKS_MS;
  const dasar: Ingatan = { ...ingatan, terakhir: sekarang, sejak: terputus ? null : ingatan.sejak };
  if (nilai === null) { // sensor gagal dibaca: jangan memutuskan apa pun, dan hitungan "selama" diulang
    return { ingatan: { ...dasar, sejak: null }, keputusan: null };
  }
  if (!dasar.aktif) {
    if (nilai <= k.nyala_di_atas) return { ingatan: { ...dasar, sejak: null }, keputusan: null }; // belum panas
    const sejak = dasar.sejak ?? sekarang; // bacaan panas pertama memulai hitungan
    if (sekarang - sejak >= k.selama_detik * 1000) {
      return { ingatan: { ...dasar, aktif: true, sejak: null }, keputusan: "nyalakan" };
    }
    return { ingatan: { ...dasar, sejak }, keputusan: null }; // panas, tetapi belum cukup lama: menunggu
  }
  if (nilai < k.padam_di_bawah) return { ingatan: { ...dasar, aktif: false, sejak: null }, keputusan: "padamkan" };
  return { ingatan: dasar, keputusan: null }; // masih di atas ambang padam (di dalam celah histeresis): tetap menyala
}

// Debouncing notifikasi: kabari saat situasi berubah, dan selama masih bahaya ingatkan paling sering 30 menit sekali.
export type Situasi = "aman" | "bahaya";

export interface CatatanKabar {
  situasi: Situasi; // situasi yang terakhir dikabarkan
  terakhirDikirim: number | null; // kapan pesan terakhir dikirim (milidetik)
}

export const CATATAN_AWAL: CatatanKabar = { situasi: "aman", terakhirDikirim: null };
export const PENGINGAT_MS = 30 * 60_000;

export function perluKabari(c: CatatanKabar, baru: Situasi, sekarang: number): { kirim: boolean; catatan: CatatanKabar } {
  if (baru !== c.situasi) return { kirim: true, catatan: { situasi: baru, terakhirDikirim: sekarang } }; // berubah
  if (baru === "bahaya" && c.terakhirDikirim !== null && sekarang - c.terakhirDikirim >= PENGINGAT_MS) {
    return { kirim: true, catatan: { ...c, terakhirDikirim: sekarang } }; // pengingat
  }
  return { kirim: false, catatan: c }; // diam
}
```

Bagian pertama adalah aturan ambang:

- **`Ingatan`** adalah catatan satu aturan dari bacaan ke bacaan: apakah aturan sedang menyala (`aktif`), sejak kapan bacaan berada di atas batas nyala (`sejak`), dan kapan bacaan terakhir dinilai (`terakhir`). Semua jam disimpan sebagai angka milidetik, seperti di pemanasan.
- **`nilaiAmbang`** tidak pernah memanggil `Date.now()`. Jam sekarang diberikan oleh pemanggilnya lewat `sekarang`, dan hasilnya hanya bergantung pada keempat masukannya. Itulah fungsi murni.
- Urutan pemeriksaannya mengikuti tiga gagasan Konsep 5: **jeda lebih dari 60 detik** atau **bacaan `null`** mengulang hitungan; saat aturan belum menyala, bacaan yang tidak **di atas** `nyala_di_atas` (`<=`) juga mengulang hitungan, dan "nyalakan" baru keluar setelah `selama_detik` (`>=`); saat aturan sudah menyala, hanya bacaan **di bawah** `padam_di_bawah` yang memadamkannya.
- `{ ...dasar, sejak: null }` adalah *spread* (Modul 17): salinan ingatan dengan satu kolom diganti. Ingatan lama tidak pernah diubah langsung, jadi tidak ada efek samping.

Bagian kedua adalah ***debouncing*** Telegram (Konsep 9). Bentuknya sedikit berbeda dengan `perluKabari` di pemanasan: alih-alih empat angka terpisah, ia menyimpan satu **`CatatanKabar`** (situasi terakhir yang dikabarkan dan kapan pesan terakhir dikirim), lalu mengembalikan keputusan `kirim` beserta catatan barunya. Aturannya sama: kabari saat situasi berubah, ingatkan paling sering 30 menit sekali selama keadaan masih berbahaya, selebihnya diam.

#### 3.4 Sepuluh uji: `aturan/mesin.test.ts`

Di folder yang sama, buat file **`mesin.test.ts`**. Vitest mencari sendiri semua file yang namanya diakhiri **`.test.ts`**.

```ts
// mesin.test.ts - unit test pertama proyek (Modul 19): menguji otak aturan tanpa MQTT, database, atau jam sungguhan.
// Jalankan: npm test
import { describe, expect, it } from "vitest";
import { CATATAN_AWAL, INGATAN_AWAL, PENGINGAT_MS, nilaiAmbang, perluKabari } from "./mesin.ts";
import type { Ingatan, Keputusan } from "./mesin.ts";
import { Aturan } from "../schemas/aturan.ts";
import type { KondisiAmbang } from "../schemas/aturan.ts";

// aturan kipas contoh: menyala di atas 30 °C selama 2 menit, padam di bawah 28 °C
const KIPAS: KondisiAmbang = {
  jenis: "ambang", device_id: "f00d00000001", besaran: "suhu", nyala_di_atas: 30, padam_di_bawah: 28, selama_detik: 120,
};
const T0 = Date.parse("2026-10-21T13:00:00+07:00"); // jam pura-pura: tes tidak perlu menunggu 2 menit sungguhan
const MENYALA: Ingatan = { aktif: true, sejak: null, terakhir: T0 }; // aturan yang kipasnya sudah menyala

// Nilai beberapa bacaan [detik sejak T0, nilai] berurutan. Hasilnya ingatan terakhir dan semua keputusan.
function jalankan(bacaan: [number, number | null][], awal: Ingatan = INGATAN_AWAL) {
  let ingatan = awal;
  const keputusan: Keputusan[] = [];
  for (const [detik, nilai] of bacaan) {
    const hasil = nilaiAmbang(KIPAS, ingatan, nilai, T0 + detik * 1000);
    ingatan = hasil.ingatan;
    keputusan.push(hasil.keputusan);
  }
  return { ingatan, keputusan };
}

// bacaan setiap 10 detik dari detik `mulai` sampai `sampai`, semuanya bernilai `nilai`
function setiap10Detik(mulai: number, sampai: number, nilai: number | null): [number, number | null][] {
  const daftar: [number, number | null][] = [];
  for (let detik = mulai; detik <= sampai; detik += 10) daftar.push([detik, nilai]);
  return daftar;
}

describe("aturan kipas (nilaiAmbang)", () => {
  it("suhu 29,5 °C: tidak ada keputusan, kipas tetap padam", () => {
    const { ingatan, keputusan } = jalankan(setiap10Detik(0, 300, 29.5));
    expect(keputusan.every((k) => k === null)).toBe(true);
    expect(ingatan.aktif).toBe(false);
  });

  it("suhu 31 °C baru 60 detik: masih menunggu", () => {
    const { ingatan, keputusan } = jalankan(setiap10Detik(0, 60, 31));
    expect(keputusan.at(-1)).toBeNull();
    expect(ingatan.sejak).toBe(T0); // hitungan dimulai dari bacaan panas pertama
  });

  it("suhu 31 °C selama 120 detik: kipas dinyalakan, sekali saja", () => {
    const { keputusan } = jalankan(setiap10Detik(0, 150, 31));
    expect(keputusan[12]).toBe("nyalakan"); // bacaan ke-13, detik ke-120
    expect(keputusan.filter((k) => k === "nyalakan")).toHaveLength(1); // detik 130-150 tidak menyalakan lagi
  });

  it("tepat 30 °C di tengah hitungan: hitungan diulang (harus DI ATAS 30)", () => {
    const { ingatan, keputusan } = jalankan([...setiap10Detik(0, 60, 31), [70, 30], ...setiap10Detik(80, 190, 31)]);
    expect(keputusan).not.toContain("nyalakan"); // detik 80 sampai 190 baru 110 detik
    expect(ingatan.sejak).toBe(T0 + 80_000);
  });

  it("sudah menyala, suhu 29 °C (di antara 28 dan 30): tetap menyala", () => {
    const { ingatan, keputusan } = jalankan(setiap10Detik(10, 100, 29), MENYALA);
    expect(keputusan.every((k) => k === null)).toBe(true);
    expect(ingatan.aktif).toBe(true);
  });

  it("sudah menyala, suhu 27,9 °C: kipas dipadamkan", () => {
    const { ingatan, keputusan } = jalankan([[10, 27.9]], MENYALA);
    expect(keputusan[0]).toBe("padamkan");
    expect(ingatan.aktif).toBe(false);
  });

  it("bacaan null (sensor gagal): tidak memutuskan, hitungan diulang", () => {
    const { ingatan, keputusan } = jalankan([...setiap10Detik(0, 100, 31), [110, null], ...setiap10Detik(120, 200, 31)]);
    expect(keputusan).not.toContain("nyalakan");
    expect(ingatan.sejak).toBe(T0 + 120_000);
  });

  it("jeda antarbacaan lebih dari 60 detik: hitungan diulang", () => {
    const { ingatan, keputusan } = jalankan([[0, 31], [50, 31], [130, 31]]); // detik 50 ke 130 = 80 detik tanpa kabar
    expect(keputusan).not.toContain("nyalakan");
    expect(ingatan.sejak).toBe(T0 + 130_000);
  });
});

describe("peringatan Telegram (perluKabari)", () => {
  it("kabari saat berubah, ingatkan 30 menit sekali selama bahaya, kabari lagi saat pulih", () => {
    let catatan = CATATAN_AWAL;
    let hasil = perluKabari(catatan, "bahaya", T0);
    expect(hasil.kirim).toBe(true); // aman -> bahaya
    catatan = hasil.catatan;
    expect(perluKabari(catatan, "bahaya", T0 + 10 * 60_000).kirim).toBe(false); // 10 menit kemudian: diam
    hasil = perluKabari(catatan, "bahaya", T0 + PENGINGAT_MS);
    expect(hasil.kirim).toBe(true); // 30 menit kemudian: pengingat
    catatan = hasil.catatan;
    expect(perluKabari(catatan, "aman", T0 + PENGINGAT_MS + 60_000).kirim).toBe(true); // bahaya -> aman: pesan pulih
  });
});

describe("skema aturan (Zod)", () => {
  it("menolak padam_di_bawah yang tidak lebih kecil daripada nyala_di_atas", () => {
    const aturan = {
      nama: "Kipas otomatis", aktif: true, kondisi: KIPAS,
      aksi: { jenis: "sakelar", device_id: "f00d00000001", target: "kipas", kabari: true },
    };
    expect(Aturan.safeParse(aturan).success).toBe(true);
    const terbalik = { ...aturan, kondisi: { ...KIPAS, padam_di_bawah: 30 } }; // 30 tidak lebih kecil daripada 30
    expect(Aturan.safeParse(terbalik).success).toBe(false);
  });
});
```

- **`describe("…", () => { … })`** mengelompokkan uji yang sejenis, dan **`it("…", () => { … })`** adalah satu uji dengan kalimat yang menjelaskan perilakunya. Kalimat itulah yang nanti tercetak di terminal, jadi tulislah seperti kalimat aturan.
- **`expect(hasil).toBe(harapan)`** memeriksa satu hasil (Konsep 6). Pemeriksa lain yang dipakai: **`toBeNull()`**, **`toContain(…)`** (daftar memuat sesuatu), **`not.toContain(…)`** (daftar tidak memuat sesuatu), dan **`toHaveLength(n)`** (panjang daftar).
- **`T0`** adalah jam pura-pura. Fungsi pembantu **`setiap10Detik`** membuat daftar bacaan seperti `telemetry` sungguhan, dan **`jalankan`** menilai daftar itu bacaan demi bacaan. Uji "selama 120 detik" selesai dalam beberapa milidetik, tanpa menunggu dua menit.
- Delapan uji pertama memeriksa aturan kipas, termasuk batas-batasnya: tepat 30 °C tidak dihitung **di atas** 30, 29 °C masih di dalam celah histeresis, dan 27,9 °C sudah di bawah 28. Uji kesembilan memeriksa *debouncing*, dan uji kesepuluh memeriksa bahwa skema Zod menolak histeresis yang terbalik.

#### 3.5 Jalankan ujinya

```text
npm test
```

**Hasilnya** (**contoh**; jalur di baris `RUN`, jam, dan milidetiknya di layarmu berbeda):

```text
> rumah-pintar-mini-backend@0.3.0 test
> vitest run


 RUN  v5.0.5 C:/…/rumah-pintar-mini/backend

 ✓ src/aturan/mesin.test.ts (10 tests) 19ms
   ✓ aturan kipas (nilaiAmbang) (8)
     ✓ suhu 29,5 °C: tidak ada keputusan, kipas tetap padam 3ms
     ✓ suhu 31 °C baru 60 detik: masih menunggu 1ms
     ✓ suhu 31 °C selama 120 detik: kipas dinyalakan, sekali saja 2ms
     ✓ tepat 30 °C di tengah hitungan: hitungan diulang (harus DI ATAS 30) 1ms
     ✓ sudah menyala, suhu 29 °C (di antara 28 dan 30): tetap menyala 1ms
     ✓ sudah menyala, suhu 27,9 °C: kipas dipadamkan 0ms
     ✓ bacaan null (sensor gagal): tidak memutuskan, hitungan diulang 1ms
     ✓ jeda antarbacaan lebih dari 60 detik: hitungan diulang 1ms
   ✓ peringatan Telegram (perluKabari) (1)
     ✓ kabari saat berubah, ingatkan 30 menit sekali selama bahaya, kabari lagi saat pulih 1ms
   ✓ skema aturan (Zod) (1)
     ✓ menolak padam_di_bawah yang tidak lebih kecil daripada nyala_di_atas 7ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  06:35:29
   Duration  535ms (import 78%, transform 10%, tests 8%, worker 4%)
```

Sepuluh tanda **✓** hijau dan baris **`Tests  10 passed (10)`**: inilah hasil utama praktik ini. Angka di ujung setiap baris adalah lama ujinya, dan `Duration` adalah lama seluruh pemeriksaan, kurang dari satu detik.

#### 3.6 Lihat uji yang gagal

Uji yang selalu hijau belum membuktikan apa-apa sebelum kamu melihatnya bisa merah. Buka **`mesin.ts`** dan ubah satu tanda di baris `if (sekarang - sejak >= k.selama_detik * 1000) {`: ganti **`>=`** dengan **`>`**, seolah-olah kamu salah ketik. Simpan, lalu jalankan `npm test` lagi.

**Hasilnya** (**contoh**, diringkas di bagian atasnya):

```text
 ❯ src/aturan/mesin.test.ts (10 tests | 1 failed) 38ms
   ❯ aturan kipas (nilaiAmbang) (8)
     ✓ suhu 29,5 °C: tidak ada keputusan, kipas tetap padam 3ms
     ✓ suhu 31 °C baru 60 detik: masih menunggu 0ms
     × suhu 31 °C selama 120 detik: kipas dinyalakan, sekali saja 19ms
     ✓ tepat 30 °C di tengah hitungan: hitungan diulang (harus DI ATAS 30) 1ms
…
 FAIL  src/aturan/mesin.test.ts > aturan kipas (nilaiAmbang) > suhu 31 °C selama 120 detik: kipas dinyalakan, sekali saja
AssertionError: expected null to be 'nyalakan' // Object.is equality

- Expected:
"nyalakan"

+ Received:
null

 ❯ src/aturan/mesin.test.ts:50:27
     48|   it("suhu 31 °C selama 120 detik: kipas dinyalakan, sekali saja", () => {
     49|     const { keputusan } = jalankan(setiap10Detik(0, 150, 31));
     50|     expect(keputusan[12]).toBe("nyalakan"); // bacaan ke-13, detik ke-120
       |                           ^
     51|     expect(keputusan.filter((k) => k === "nyalakan")).toHaveLength(1); // detik 130-150 tidak menyalakan lagi
     52|   });

…
 Test Files  1 failed (1)
      Tests  1 failed | 9 passed (10)
```

Satu tanda kecil ternyata menggeser keputusan: dengan `>`, tepat 120 detik belum dianggap cukup, jadi bacaan ke-13 belum menyalakan kipas (`Received: null`). Vitest menunjuk uji yang gagal, nilai yang diharapkan (`Expected`), nilai yang didapat (`Received`), dan baris kodenya. Kesalahan seperti ini hampir mustahil terlihat saat mencoba dengan perangkat sungguhan, tetapi langsung tertangkap oleh uji satuan. Kembalikan tanda itu menjadi **`>=`**, simpan, dan jalankan `npm test` sekali lagi sampai `Tests  10 passed (10)`.

#### 3.7 Periksa tipe dan simpan ke cabang

File uji juga diperiksa TypeScript karena ia berada di folder `src`:

```text
npm run cek
```

Tidak boleh ada galat. Lalu simpan:

```text
cd ..
git add backend
git commit -m "Otak aturan sebagai fungsi murni dan 10 unit test Vitest (Modul 19 Praktik 3)"
```

> ⬆️ **Selesai Praktik 3?** Kembali ke [Konsep 7](#7-aturan-di-database-diubah-lewat-api-berlaku-saat-itu-juga) sebelum Praktik 4.

### Praktik 4 — Aturan di database, diubah lewat API (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (backend, simulator, dan terminal kecil), browser untuk **`/docs`**, dan **psql** di kontainer database (`docker exec -it rumahpintar-db psql -U postgres -d rumahpintar`). Jalur laptop memakai simulator Modul 19 karena suhunya bisa diatur dari terminal (`suhu 31`). Jalur perangkat: suhu Node 1 sungguhan sulit diatur tepat, jadi kerjakan dulu praktik ini dengan simulator, lalu coba aturannya pada Node 1 setelah Praktik 7.
>
> ⭐ **Wajib** — syarat lulus pertama: mengubah ambang suhu lewat API langsung mengubah perilaku kipas **tanpa *restart* server**.

Otak aturan dari Praktik 3 kini disambungkan ke dunia nyata: aturan disimpan di tabel `rules`, dibaca ke memori, dinilai setiap kali `telemetry` tiba, dan bertindak lewat pintu perintah dari Praktik 2. Setiap tindakannya dicatat di buku kejadian baru (Konsep 7).

#### 4.1 Migrasi 007

Klik kanan folder **`backend/migrasi`** → **New File…**, beri nama **`007_aturan_dan_kejadian.sql`**, lalu ketik:

```sql
-- 007_aturan_dan_kejadian.sql - aturan otomatis bisa diubah lewat API, setiap perintah mencatat siapa yang menyuruh,
-- dan buku kejadian "siapa menyalakan apa, kapan" (Modul 19).
-- Nomor 006 sengaja dilewati: 006_device_health.sql adalah Tantangan Tingkat 3 Modul 18 yang mungkin sudah kamu buat.

-- Tabel rules sudah disiapkan sejak Modul 17 (migrasi 001). Kini dicatat kapan terakhir diubah, dan kondisi serta aksi
-- wajib berupa objek JSON { ... }.
ALTER TABLE rules
  ADD COLUMN diubah timestamptz NOT NULL DEFAULT now(),
  ADD CONSTRAINT rules_kondisi_objek CHECK (jsonb_typeof(kondisi) = 'object'),
  ADD CONSTRAINT rules_aksi_objek CHECK (jsonb_typeof(aksi) = 'object');

-- Setiap perintah kini mencatat siapa yang menyuruh. Perintah lama semuanya dari API, jadi bawaannya 'api'.
ALTER TABLE commands
  ADD COLUMN sumber    text NOT NULL DEFAULT 'api' CHECK (sumber IN ('api', 'aturan', 'jadwal', 'telegram')),
  ADD COLUMN aturan_id integer REFERENCES rules (id) ON DELETE SET NULL, -- aturan yang menyuruh (kalau ada)
  ADD COLUMN state     jsonb;                                            -- ack.state; NULL = tidak ada ack

-- Buku kejadian: satu baris untuk setiap hal yang perlu diketahui manusia.
CREATE TABLE events (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  waktu     timestamptz NOT NULL DEFAULT now(),
  device_id text REFERENCES devices (device_id),  -- NULL untuk kejadian yang bukan milik satu perangkat
  jenis     text NOT NULL
            CHECK (jenis IN ('aturan', 'aturan-diubah', 'jadwal', 'status', 'mode-offline', 'perintah')),
  sumber    text NOT NULL,                        -- api, aturan, jadwal, telegram, atau perangkat
  aturan_id integer REFERENCES rules (id) ON DELETE SET NULL,
  pesan     text NOT NULL,                        -- kalimat untuk manusia, sama dengan pesan Telegram-nya
  data      jsonb                                 -- rincian mentah: bacaan, perintah, hasil
);
CREATE INDEX events_waktu_idx ON events (waktu DESC);
```

Tiga perubahannya dijelaskan di tabel Konsep 7. Dua hal baru dalam SQL-nya:

- **`ADD CONSTRAINT … CHECK (jsonb_typeof(kondisi) = 'object')`** membuat database sendiri menolak `kondisi` yang bukan objek JSON, misalnya teks atau daftar. Itu lapis pengaman kedua, sesudah Zod di backend.
- **`REFERENCES rules (id) ON DELETE SET NULL`**: kalau suatu hari sebuah aturan dihapus, riwayat perintah dan kejadiannya tetap ada, dan kolom `aturan_id`-nya menjadi kosong.

Jalankan migrasinya **sebelum** menjalankan backend versi baru. Hentikan `npm run dev` kalau masih berjalan. Di terminal pertama, masuk lagi ke folder `backend` (`cd backend`; sejak *commit* Praktik 3 terminal itu berada di `rumah-pintar-mini`), lalu jalankan:

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.3.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 007_aturan_dan_kejadian.sql
1 migrasi baru diterapkan, 5 sudah ada sebelumnya.
```

Kalau kamu mengerjakan 🧩 Tingkat 3 Modul 18, angkanya menjadi `6 sudah ada sebelumnya` karena `006_device_health.sql` ikut terhitung. Nomor 006 yang dilewati tidak merusak apa pun: pelari migrasi hanya menjalankan file yang belum tercatat, berurutan menurut nama.

Lihat hasilnya di psql. Buka terminal baru, lalu masuk dengan `docker exec -it rumahpintar-db psql -U postgres -d rumahpintar` seperti Modul 18. Semua perintah lama, sejak Modul 17 sampai Praktik 2, otomatis mendapat `sumber` bernilai `api`, yaitu nilai bawaannya. Kueri ini menampilkan tiga yang tertua, jadi di layarmu yang muncul mungkin perintah dari Modul 17:

```sql
SELECT id, target, sumber, aturan_id, state FROM commands ORDER BY dikirim LIMIT 3;
```

**Hasilnya** (**contoh**):

```text
         id          | target | sumber | aturan_id | state 
---------------------+--------+--------+-----------+-------
 c-20261020-232239-1 | kipas  | api    |           | 
 c-20261020-232240-2 | tirai  | api    |           | 
 c-20261020-232240-3 | pompa  | api    |           | 
(3 rows)
```

Kolom `state` untuk perintah lama kosong karena dulu belum dicatat. Mulai Praktik 4, setiap perintah yang dijawab menyimpan `ack.state`-nya.

#### 4.2 Database: aturan, kejadian, dan sumber perintah

Buka **`backend/src/db/arsip.ts`**.

1. Tambahkan baris impor di bawah `import type { Ack, PerintahSet, … } from "../schemas/kontrak.ts";`:

   ```ts
   import type { Aturan } from "../schemas/aturan.ts";
   ```

2. Ganti fungsi **`arsipkanPerintah`** (beserta komentar di atasnya) dengan versi yang juga mencatat sumber, aturan, dan keadaan:

   ```ts
   // Satu perintah beserta hasilnya: ack (ok atau ditolak) atau null kalau tidak ada ack dalam 5 detik. Modul 19: juga
   // siapa yang menyuruh (sumber), aturan mana (kalau dari aturan atau jadwal), dan keadaan aktuator menurut ack-nya.
   export async function arsipkanPerintah(idPerintah: string, deviceId: string, perintah: PerintahSet, dikirim: Date,
     ack: Ack | null, lamaMs: number, sumber: string, aturanId: number | null): Promise<void> {
     await pool.query(
       `INSERT INTO commands (id, device_id, dikirim, target, nilai, ack_ok, ack_pesan, lama_ms, sumber, aturan_id, state)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
       [idPerintah, deviceId, dikirim, perintah.target, JSON.stringify(perintah.nilai), ack?.ok ?? null,
         ack?.pesan ?? null, lamaMs, sumber, aturanId, ack === null ? null : JSON.stringify(ack.state)],
     );
   }
   ```

3. Tambahkan blok berikut **tepat di bawah** fungsi itu:

   ```ts
   // Modul 19: satu baris tabel rules, apa adanya (kondisi dan aksi diperiksa Zod oleh otomasi.ts sebelum dipakai).
   export interface BarisAturan {
     id: number;
     nama: string;
     aktif: boolean;
     kondisi: unknown;
     aksi: unknown;
     dibuat: Date;
     diubah: Date;
   }

   const KOLOM_ATURAN = "id, nama, aktif, kondisi, aksi, dibuat, diubah";

   export async function ambilSemuaAturan(): Promise<BarisAturan[]> {
     const hasil = await pool.query<BarisAturan>(`SELECT ${KOLOM_ATURAN} FROM rules ORDER BY id`);
     return hasil.rows;
   }

   export async function tambahAturan(a: Aturan): Promise<BarisAturan> {
     const hasil = await pool.query<BarisAturan>(
       `INSERT INTO rules (nama, aktif, kondisi, aksi) VALUES ($1, $2, $3, $4) RETURNING ${KOLOM_ATURAN}`,
       [a.nama, a.aktif, JSON.stringify(a.kondisi), JSON.stringify(a.aksi)],
     );
     return hasil.rows[0];
   }

   // Hasilnya undefined kalau aturan bernomor itu tidak ada.
   export async function ubahAturan(id: number, a: Aturan): Promise<BarisAturan | undefined> {
     const hasil = await pool.query<BarisAturan>(
       `UPDATE rules SET nama = $2, aktif = $3, kondisi = $4, aksi = $5, diubah = now() WHERE id = $1 RETURNING ${KOLOM_ATURAN}`,
       [id, a.nama, a.aktif, JSON.stringify(a.kondisi), JSON.stringify(a.aksi)],
     );
     return hasil.rows[0];
   }

   // Modul 19: buku kejadian (tabel events, migrasi 007).
   export type JenisKejadian = "aturan" | "aturan-diubah" | "jadwal" | "status" | "mode-offline" | "perintah";

   export interface KejadianBaru {
     device_id: string | null; // null untuk kejadian yang bukan milik satu perangkat (misalnya aturan diubah)
     jenis: JenisKejadian;
     sumber: string; // api, aturan, jadwal, telegram, perangkat
     aturan_id: number | null;
     pesan: string; // kalimat untuk manusia, sama dengan pesan Telegram-nya
     data?: unknown; // rincian mentah
   }

   // kejadian yang sudah tersimpan: ditambah nomor dan waktunya (inilah isi acara Socket.IO "kejadian")
   export interface Kejadian extends KejadianBaru {
     id: number;
     waktu: string;
   }

   export async function simpanKejadian(k: KejadianBaru): Promise<Kejadian> {
     const hasil = await pool.query<{ id: string; waktu: Date }>(
       `INSERT INTO events (device_id, jenis, sumber, aturan_id, pesan, data) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, waktu`,
       [k.device_id, k.jenis, k.sumber, k.aturan_id, k.pesan, k.data === undefined ? null : JSON.stringify(k.data)],
     );
     const { id, waktu } = hasil.rows[0];
     return { id: Number(id), waktu: waktuKontrak(waktu), ...k }; // bigint datang dari pg sebagai teks
   }
   ```

   Empat fungsi baru itu memakai `SELECT`, `INSERT`, dan `UPDATE` dari Modul 17, ditambah satu kata baru, **`RETURNING`**. Isinya `SELECT` semua aturan, `INSERT … RETURNING` aturan baru, `UPDATE … RETURNING` aturan yang diubah (hasilnya `undefined` kalau nomornya tidak ada), dan `INSERT … RETURNING` satu kejadian. `RETURNING` membuat database langsung menjawab dengan baris yang baru ditulis, lengkap dengan `id` dan waktunya. Kolom `kondisi`, `aksi`, dan `data` bertipe `jsonb`, jadi isinya dikirim sebagai teks JSON (`JSON.stringify`).

Lalu buka **`backend/src/services/perintah.ts`**. Di dalam `perintahkan()`, ubah panggilan `arsipkanPerintah(…)` supaya ikut mengirim sumber dan aturannya:

```ts
  arsipkanPerintah(id, deviceId, perintah, new Date(mulai), ack, lama, sumber, aturanId)
```

#### 4.3 Bentuk aturan dan bentuk ambang

Buka **`backend/src/schemas/aturan.ts`** dan ganti bagian dari komentar `// Isi POST /rules dan PUT /rules/:id, …` sampai akhir file dengan:

```ts
// Kolom-kolom satu aturan (nama, aktif, kondisi, aksi), tanpa pemeriksaan gabungan.
export const IsiAturan = z.strictObject({
  nama: z.string().min(1).max(60),
  aktif: z.boolean(),
  kondisi: KondisiAmbang,
  aksi: AksiSakelar,
});

// Isi POST /rules dan PUT /rules/:id. Ambang aturan kipas juga dikirim ke perangkat sebagai suhu_kipas_on (config,
// kontrak 1.3), jadi rentangnya harus sama dengan yang diterima perangkat: 15-45 °C.
export const Aturan = IsiAturan.refine((a) => !(a.kondisi.besaran === "suhu" && a.aksi.target === "kipas")
  || (a.kondisi.nyala_di_atas >= 15 && a.kondisi.nyala_di_atas <= 45), {
  message: "untuk aturan kipas, nyala_di_atas harus 15-45 °C (ikut dikirim ke perangkat sebagai suhu_kipas_on)",
  path: ["kondisi", "nyala_di_atas"],
});

export type KondisiAmbang = z.infer<typeof KondisiAmbang>;
export type Aturan = z.infer<typeof Aturan>;

// aturan yang sudah tersimpan di database: ditambah nomor dan waktunya
export type AturanTersimpan = Aturan & { id: number; dibuat: string; diubah: string };
```

`Aturan` kini dibangun dari **`IsiAturan`** ditambah satu pemeriksaan gabungan: untuk aturan kipas berdasarkan suhu, `nyala_di_atas` harus 15–45 °C. Angka itu juga dikirim ke Node 1 sebagai `suhu_kipas_on`, dan Node 1 hanya menerima rentang itu (kontrak 1.3). Tanpa pemeriksaan ini, backend bisa menempelkan `config` yang pasti ditolak perangkat. **`AturanTersimpan`** adalah aturan yang sudah punya nomor dan waktu dari database.

Lalu buka **`backend/src/schemas/kontrak.ts`** dan tambahkan skema isi `config` tepat di atas daftar `export type`:

```ts
// ambang aturan pengaman lokal yang dikirim lewat cmd "config" (kontrak 1.3 bagian 7): paling sedikit satu kunci
export const Ambang = z
  .strictObject({
    suhu_kipas_on: z.number().min(15).max(45).optional(),
    tanah_siram: z.number().int().min(0).max(100).optional(),
  })
  .refine((a) => a.suhu_kipas_on !== undefined || a.tanah_siram !== undefined, "ambang harus berisi suhu_kipas_on atau tanah_siram");
```

Tambahkan juga `export type Ambang = z.infer<typeof Ambang>;` di bawah baris `export type Keadaan = …`.

#### 4.4 Buku kejadian: `kejadian.ts`

Buat file **`backend/src/services/kejadian.ts`**:

```ts
// kejadian.ts - buku kejadian (Modul 19): setiap hal yang perlu diketahui manusia ("siapa menyalakan apa, kapan")
// ditulis ke tabel events, lalu disiarkan ke semua klien Socket.IO sebagai acara "kejadian".
import { simpanKejadian } from "../db/arsip.ts";
import type { KejadianBaru } from "../db/arsip.ts";
import { siarkanKejadian } from "./realtime.ts";
import { log } from "./log.ts";

export function catatKejadian(kejadian: KejadianBaru): void {
  simpanKejadian(kejadian)
    .then((baris) => siarkanKejadian(baris))
    .catch((galat) => log.error(`gagal mencatat kejadian "${kejadian.pesan}": ${(galat as Error).message}`));
}
```

Satu fungsi, dua tugas: menulis kejadian ke tabel `events`, lalu menyiarkan baris yang sudah tersimpan ke semua klien Socket.IO. Untuk siarannya, buka **`backend/src/services/realtime.ts`**:

1. Tambahkan `import type { Kejadian } from "../db/arsip.ts";` di bawah impor `kontrak.ts`.
2. Di *interface* `KeKlien`, tambahkan baris `kejadian: (kejadian: Kejadian) => void;` di bawah baris `status`.
3. Ubah akhir komentar kepala menjadi `Perubahan status dan buku kejadian dikirim ke semua klien.`
4. Tambahkan fungsi baru di akhir file:

   ```ts
   // kirim satu baris buku kejadian ke SEMUA klien
   export function siarkanKejadian(kejadian: Kejadian): void {
     io?.emit("kejadian", kejadian);
   }
   ```

Perintah yang dikirim ulang oleh rekonsiliasi (Konsep 4) juga masuk buku kejadian. Buka **`backend/src/services/perintah.ts`**, tambahkan `import { catatKejadian } from "./kejadian.ts";` di bawah impor `arsip.ts`, lalu di dalam `cocokkan()` tambahkan baris ini tepat di bawah ``log.warn(`cocokkan ${pesan}`);``:

```ts
    catatKejadian({ device_id: deviceId, jenis: "perintah", sumber: k.sumber, aturan_id: k.aturanId, pesan, data: k.perintah });
```

#### 4.5 Otak yang bekerja: `otomasi.ts`

Buat file **`backend/src/services/otomasi.ts`**. Inilah bagian yang menghubungkan tabel `rules`, otak murni dari Praktik 3, dan pintu perintah:

```ts
// otomasi.ts - menjalankan aturan otomatis dari tabel rules (Modul 19): memuat aturan ke memori, menilai setiap bacaan
// dengan otak murni (aturan/mesin.ts), bertindak lewat perintahkan(), mengirim ambang kipas ke perangkat (config), dan
// mencatat setiap tindakan di buku kejadian.
import { Aturan } from "../schemas/aturan.ts";
import type { AturanTersimpan } from "../schemas/aturan.ts";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { INGATAN_AWAL, nilaiAmbang } from "../aturan/mesin.ts";
import type { Ingatan } from "../aturan/mesin.ts";
import { ambilSemuaAturan, tambahAturan, ubahAturan, waktuKontrak } from "../db/arsip.ts";
import type { BarisAturan } from "../db/arsip.ts";
import { cariPerangkat, tungguAck } from "./gudang.ts";
import { buatIdPerintah, kirimConfig, ringkas } from "./mqtt.ts";
import { perintahkan } from "./perintah.ts";
import type { HasilPerintah } from "./perintah.ts";
import { catatKejadian } from "./kejadian.ts";
import { log } from "./log.ts";

const BACAAN_BASI_MS = 60_000; // bacaan yang ts-nya lebih tua daripada 60 detik (data susulan) tidak dinilai
let daftar: AturanTersimpan[] = []; // semua aturan yang sah, urut nomor
const ingatan = new Map<number, Ingatan>(); // nomor aturan -> ingatan nilaiAmbang

// Muat ulang semua aturan dari database. Baris yang tidak sah (misalnya diubah dengan tangan lewat DBeaver) dilewati.
export async function muatAturan(): Promise<void> {
  const sah: AturanTersimpan[] = [];
  for (const baris of await ambilSemuaAturan()) {
    const hasil = Aturan.safeParse({ nama: baris.nama, aktif: baris.aktif, kondisi: baris.kondisi, aksi: baris.aksi });
    if (!hasil.success) {
      log.warn(`aturan ${baris.id} dilewati: ${ringkas(hasil.error)}`);
      continue;
    }
    sah.push({ ...hasil.data, id: baris.id, dibuat: waktuKontrak(baris.dibuat), diubah: waktuKontrak(baris.diubah) });
  }
  daftar = sah;
  log.info(`aturan dimuat: ${sah.filter((a) => a.aktif).length} aktif dari ${sah.length}`);
}

export function semuaAturan(): AturanTersimpan[] {
  return daftar;
}

// POST /rules: simpan aturan baru, lalu langsung berlaku
export async function buatAturan(isi: Aturan): Promise<AturanTersimpan> {
  return setelahBerubah(await tambahAturan(isi), "dibuat");
}

// PUT /rules/:id: hasilnya undefined kalau aturan bernomor itu tidak ada
export async function gantiAturan(id: number, isi: Aturan): Promise<AturanTersimpan | undefined> {
  const baris = await ubahAturan(id, isi);
  return baris === undefined ? undefined : setelahBerubah(baris, "diubah");
}

async function setelahBerubah(baris: BarisAturan, kata: string): Promise<AturanTersimpan> {
  ingatan.delete(baris.id); // ambang baru = hitungan "selama" baru
  await muatAturan();
  const a = daftar.find((x) => x.id === baris.id);
  if (a === undefined) throw new Error(`aturan ${baris.id} tidak sah setelah disimpan`);
  const pesan = `Aturan ${a.id} (${a.nama}) ${kata} lewat API: ${uraikan(a)}`;
  log.info(pesan);
  catatKejadian({ device_id: null, jenis: "aturan-diubah", sumber: "api", aturan_id: a.id, pesan,
    data: { nama: a.nama, aktif: a.aktif, kondisi: a.kondisi, aksi: a.aksi } });
  kirimSemuaConfig();
  return a;
}

// kalimat pendek untuk log dan buku kejadian
function uraikan(a: AturanTersimpan): string {
  const k = a.kondisi;
  return `${a.aksi.target} ${a.aksi.device_id} menyala kalau ${k.besaran} ${k.device_id} di atas ${k.nyala_di_atas} `
    + `selama ${k.selama_detik} detik, padam di bawah ${k.padam_di_bawah}${a.aktif ? "" : " (tidak aktif)"}`;
}

// Kirim ambang pengaman ke setiap perangkat yang punya aturan kipas berdasarkan suhu: suhu_kipas_on = nyala_di_atas
// (kontrak 1.3, config retained). Dipanggil setiap kali backend tersambung ke broker dan setiap kali aturan berubah.
export function kirimSemuaConfig(): void {
  const sudah = new Set<string>(); // satu perangkat, satu ambang: aturan kipas aktif bernomor terkecil
  for (const a of daftar) {
    if (!a.aktif || a.kondisi.besaran !== "suhu" || a.aksi.target !== "kipas" || sudah.has(a.aksi.device_id)) continue;
    sudah.add(a.aksi.device_id);
    void kirimAmbang(a.aksi.device_id, a.kondisi.nyala_di_atas, a.id);
  }
}

async function kirimAmbang(deviceId: string, suhu: number, aturanId: number): Promise<void> {
  const id = buatIdPerintah();
  const menunggu = tungguAck(id, 5000); // mulai menunggu SEBELUM mengirim, seperti perintah set
  kirimConfig(deviceId, id, { suhu_kipas_on: suhu });
  log.info(`config ${id} ke ${deviceId}: suhu_kipas_on ${suhu} dari aturan ${aturanId} (retained)`);
  const ack = await menunggu;
  if (ack === null) {
    log.warn(`config ${id} ke ${deviceId}: belum dijawab dalam 5 detik; config tetap tertempel di broker sampai perangkat tersambung`);
  } else {
    log.info(`config ${id} ke ${deviceId}: ack ok=${ack.ok}${ack.pesan === undefined ? "" : ` (${ack.pesan})`}`);
  }
}

// Dipanggil mqtt.ts untuk setiap telemetry yang lolos kontrak.
export function nilaiBacaan(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  const sekarang = Date.now();
  if (sekarang - Date.parse(isi.ts) > BACAAN_BASI_MS) return; // data susulan: bukan keadaan sekarang
  const bacaan: Record<string, unknown> = isi;
  for (const a of daftar) {
    if (!a.aktif || a.kondisi.device_id !== deviceId) continue;
    const mentah = bacaan[a.kondisi.besaran];
    const nilai = typeof mentah === "number" ? mentah : null; // null: sensor gagal, atau kolom tidak dimiliki perangkat
    const lama = ingatan.get(a.id) ?? ingatanAwal(a);
    const { ingatan: baru, keputusan } = nilaiAmbang(a.kondisi, lama, nilai, sekarang);
    ingatan.set(a.id, baru);
    if (keputusan !== null) {
      void bertindak(a, keputusan, nilai, isi.ts, lama);
    } else if (lama.sejak === null && baru.sejak !== null) {
      log.info(`aturan ${a.id} (${a.nama}): ${a.kondisi.besaran} ${nilai} di atas ${a.kondisi.nyala_di_atas}; `
        + `${a.aksi.target} dinyalakan kalau bertahan ${a.kondisi.selama_detik} detik`);
    } else if (lama.sejak !== null && baru.sejak === null) {
      log.info(`aturan ${a.id} (${a.nama}): hitungan diulang (${a.kondisi.besaran} ${nilai ?? "tidak terbaca"})`);
    }
  }
}

// Setelah backend dimulai ulang atau aturannya diubah: kalau perangkat melaporkan aktuatornya sedang menyala, anggap
// aturan sedang menyala supaya nanti dipadamkan pada waktunya.
function ingatanAwal(a: AturanTersimpan): Ingatan {
  return { ...INGATAN_AWAL, aktif: cariPerangkat(a.aksi.device_id)?.reported?.[a.aksi.target] === true };
}

async function bertindak(a: AturanTersimpan, keputusan: "nyalakan" | "padamkan", nilai: number | null, tsBacaan: string,
  lama: Ingatan): Promise<void> {
  const nyala = keputusan === "nyalakan";
  const hasil = await perintahkan(a.aksi.device_id, { target: a.aksi.target, nilai: nyala }, "aturan", a.id);
  if (hasil.status === "tidak-dikirim") {
    ingatan.set(a.id, lama); // keputusan belum terlaksana: bacaan berikutnya memutuskan lagi
    log.warn(`aturan ${a.id} (${a.nama}): ${a.aksi.target} tidak bisa di${nyala ? "nyala" : "padam"}kan: ${hasil.pesan}`);
    return;
  }
  const pesan = kalimat(a, nyala, nilai, hasil);
  log.info(`aturan ${a.id} (${a.nama}): ${pesan}`);
  catatKejadian({ device_id: a.aksi.device_id, jenis: "aturan", sumber: "aturan", aturan_id: a.id, pesan,
    data: { keputusan, nilai, ts_bacaan: tsBacaan, perintah: hasil.id, hasil: hasil.status } });
}

const LABEL: Record<string, [string, string, string]> = { // besaran -> [emoji, nama, satuan]
  suhu: ["🌡️", "Suhu", " °C"], kelembapan: ["💧", "Kelembapan", " %"], cahaya: ["💡", "Cahaya", ""],
  tanah: ["🌱", "Tanah", " %"], level_air: ["🚰", "Air tandon", " %"], tanah_rs485: ["🌱", "Tanah (RS-485)", " %"],
  suhu_tanah: ["🌡️", "Suhu tanah", " °C"],
};
const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27,8"

// Kalimat untuk manusia, misalnya "🌡️ Suhu 33 °C — kipas dinyalakan otomatis" (sama dengan pesan Telegram-nya).
function kalimat(a: AturanTersimpan, nyala: boolean, nilai: number | null, hasil: HasilPerintah): string {
  const [emoji, nama, satuan] = LABEL[a.kondisi.besaran];
  const teks = nilai === null ? "-" : angka.format(nilai);
  const target = a.aksi.target;
  if (hasil.status === "tanpa-ack") return `⚠️ ${nama} ${teks}${satuan} — ${target} TIDAK menjawab perintah (dicoba lagi)`;
  if (hasil.status === "dijawab" && !hasil.ack.ok) {
    return `⚠️ ${nama} ${teks}${satuan} — perintah ${target} ditolak perangkat: ${hasil.ack.pesan}`;
  }
  return nyala ? `${emoji} ${nama} ${teks}${satuan} — ${target} dinyalakan otomatis`
    : `✅ ${nama} turun ke ${teks}${satuan} — ${target} dipadamkan`;
}
```

Bacalah per fungsi:

- **`muatAturan()`** membaca semua baris `rules`, memeriksa setiap baris dengan skema `Aturan` (baris yang tidak sah dilewati dan dicatat di log), lalu menyimpan daftar yang sah di memori. Fungsi ini dipanggil saat server mulai dan setiap kali aturan berubah.
- **`buatAturan()`** dan **`gantiAturan()`** dipakai rute `/rules`. Keduanya menyimpan ke database, lalu **`setelahBerubah()`** mengerjakan langkah 3–5 Konsep 7: ingatan aturan itu dihapus (hitungan "selama" dimulai lagi dari nol), daftar dimuat ulang, kejadian `aturan-diubah` dicatat, dan `config` dikirim.
- **`kirimSemuaConfig()`** mengirim `suhu_kipas_on` ke setiap perangkat yang punya aturan kipas berdasarkan suhu. Fungsi ini juga dipanggil setiap kali backend tersambung ke broker karena broker tanpa penyimpanan (*persistence*), seperti Mosquitto di laptop Windows dan macOS, melupakan pesan *retained* saat dimulai ulang. `config` juga ditunggu `ack`-nya, tetapi tidak gagal kalau perangkat sedang mati: pesannya tetap tertempel di broker sampai perangkat menyambung.
- **`nilaiBacaan()`** dipanggil untuk setiap `telemetry`. Bacaan yang `ts`-nya lebih tua daripada 60 detik dilewati karena bacaan itu data susulan, bukan keadaan sekarang. Untuk setiap aturan aktif milik perangkat itu, ia mengambil nilai besarannya, memanggil **`nilaiAmbang()`**, menyimpan ingatan barunya, dan mencatat di log saat hitungan dimulai atau diulang.
- **`bertindak()`** mengirim perintah lewat **`perintahkan(…, "aturan", a.id)`**. Kalau perintah tidak bisa dikirim (misalnya perangkat `offline`), ingatan dikembalikan supaya bacaan berikutnya memutuskan lagi. Kalimat hasilnya, misalnya `🌡️ Suhu 31 °C — kipas dinyalakan otomatis`, dicatat di log dan buku kejadian. Di Praktik 6, kalimat yang sama dikirim ke Telegram.
- **`ingatanAwal()`** dipakai saat ingatan sebuah aturan dibuat dari awal, yaitu setelah backend dimulai ulang atau aturannya diubah: kalau perangkat melaporkan kipasnya menyala, aturan dianggap sedang menyala sehingga nanti kipas tetap dipadamkan saat suhu turun (Konsep 5).

#### 4.6 Rute `/rules`

Buat file **`backend/src/routes/aturan.ts`**:

```ts
// aturan.ts - rute /rules (Modul 19): melihat, membuat, dan mengubah aturan otomatis tanpa mengubah kode dan tanpa
// memulai ulang server. Isi setiap aturan diperiksa skema Zod di schemas/aturan.ts.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Aturan, IsiAturan } from "../schemas/aturan.ts";
import { buatAturan, gantiAturan, semuaAturan } from "../services/otomasi.ts";

const Galat = z.object({ pesan: z.string() });
const ParamId = z.object({ id: z.coerce.number().int().min(1).describe("nomor aturan, misalnya 1") });
const AturanLengkap = IsiAturan.extend({
  id: z.number().describe("nomor aturan"),
  dibuat: z.string().describe("kapan aturan dibuat (UTC)"),
  diubah: z.string().describe("kapan aturan terakhir diubah (UTC)"),
});

export const ruteAturan: FastifyPluginAsyncZod = async (app) => {
  app.get("/rules", {
    schema: {
      tags: ["aturan"],
      summary: "Semua aturan otomatis yang sedang dipakai server",
      response: { 200: z.array(AturanLengkap).describe("aturan yang sah, urut nomor") },
    },
  }, async () => semuaAturan());

  app.post("/rules", {
    schema: {
      tags: ["aturan"],
      summary: "Buat aturan otomatis baru; langsung berlaku tanpa memulai ulang server",
      body: Aturan,
      response: {
        201: AturanLengkap.describe("aturan tersimpan dan langsung dipakai"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      return reply.code(201).send(await buatAturan(req.body));
    } catch (galat) {
      req.log.error(`aturan baru gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.put("/rules/:id", {
    schema: {
      tags: ["aturan"],
      summary: "Ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server",
      params: ParamId,
      body: Aturan,
      response: {
        200: AturanLengkap.describe("aturan tersimpan dan langsung dipakai"),
        404: Galat.describe("aturan bernomor itu tidak ada"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      const aturan = await gantiAturan(req.params.id, req.body);
      if (aturan === undefined) return reply.code(404).send({ pesan: `aturan ${req.params.id} tidak ada` });
      return aturan;
    } catch (galat) {
      req.log.error(`aturan ${req.params.id} gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });
};
```

Polanya sama dengan rute Modul 16–18: skema Zod untuk isi permintaan dan jawaban, `describe` untuk Swagger, dan kode `503` kalau database tidak bisa dihubungi. **`z.coerce.number()`** mengubah teks `"1"` dari alamat `/rules/1` menjadi angka `1`. **`PUT`** mengganti **seluruh** isi aturan, jadi kirim aturan lengkap, bukan hanya angka yang berubah.

#### 4.7 Menyambungkan semuanya

Buka **`backend/src/services/mqtt.ts`** dan ganti seluruh isinya dengan versi ini (perubahannya tersebar di banyak tempat, jadi lebih aman diganti utuh):

```ts
// mqtt.ts - backend sebagai klien MQTT: mendengar rpm/#, memeriksa setiap pesan, menyimpannya, dan mengirim perintah.
import mqtt from "mqtt";
import type { FastifyBaseLogger } from "fastify";
import type { ZodError } from "zod";
import { Ack, DeviceId, Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";
import type { Ambang, PerintahSet } from "../schemas/kontrak.ts";
import { cariPerangkat, hitungan, serahkanAck, simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";
import { arsipkanStatus, arsipkanTelemetry, arsipkanVitals } from "../db/arsip.ts";
import { siarkanStatus, siarkanTelemetry } from "./realtime.ts";
import { catatLaporan, perangkatMenyalaUlang } from "./perintah.ts";
import { kirimSemuaConfig, nilaiBacaan } from "./otomasi.ts";
import { catatKejadian } from "./kejadian.ts";

let klien: mqtt.MqttClient | undefined;

export function mulaiMqtt(url: string, log: FastifyBaseLogger): void {
  const idKlien = "backend-" + Math.random().toString(16).slice(2, 8); // nama unik, bukan device_id
  klien = mqtt.connect(url, { clientId: idKlien, reconnectPeriod: 5000 });
  klien.on("connect", () => {
    log.info(`tersambung ke broker ${url}`);
    klien?.subscribe("rpm/#", { qos: 1 });
    kirimSemuaConfig(); // Modul 19: broker tanpa persistence lupa config retained saat dimulai ulang (kontrak aturan 10)
  });
  klien.on("reconnect", () => log.warn("broker belum terjangkau, mencoba lagi dalam 5 detik"));
  klien.on("error", (galat) => log.error(`galat MQTT: ${galat.message}`));
  // paket.retain = true: pesan lama yang disimpan broker, dikirim ulang karena backend baru berlangganan (Modul 19)
  klien.on("message", (topik, isi, paket) => terima(topik, isi.toString(), paket.retain, log));
}

export function brokerTersambung(): boolean {
  return klien?.connected ?? false;
}

function tolak(topik: string, alasan: string, log: FastifyBaseLogger): void {
  hitungan.ditolak++;
  log.warn(`DITOLAK ${topik}: ${alasan}`);
}

// gagal menulis ke database (misalnya kontainer database dimatikan): catat di log, tetapi server tetap berjalan
function gagalArsip(topik: string, log: FastifyBaseLogger) {
  return (galat: Error) => log.error(`gagal menyimpan ${topik} ke database: ${galat.message}`);
}

// ringkas daftar masalah dari Zod, misalnya "kelembapan: Terlalu besar: diharapkan number menjadi <=100"
export function ringkas(galat: ZodError): string {
  return galat.issues.map((m) => `${m.path.join(".") || "isi"}: ${m.message}`).join("; ");
}

function terima(topik: string, teks: string, retained: boolean, log: FastifyBaseLogger): void {
  const bagian = topik.split("/"); // ["rpm", device_id, jenis]
  if (bagian.length !== 3) return tolak(topik, "topik harus berbentuk rpm/<device_id>/<jenis>", log);
  const [, deviceId, jenis] = bagian;
  if (!DeviceId.safeParse(deviceId).success) return tolak(topik, "device_id tidak sah", log);
  if (jenis === "cmd") return; // perintah (dari backend ini atau MQTTX), bukan data perangkat

  if (jenis === "status") {
    if (teks === "") return; // pesan kosong = seseorang menghapus status retained (Modul 11), bukan status baru
    const hasil = Status.safeParse(teks);
    if (!hasil.success) return tolak(topik, `status "${teks}" tidak dikenal`, log);
    const sebelumnya = cariPerangkat(deviceId)?.status;
    simpanStatus(deviceId, hasil.data);
    const arsip = arsipkanStatus(deviceId, hasil.data);
    arsip.catch(gagalArsip(topik, log));
    if (hasil.data !== sebelumnya) { // Modul 19: hanya perubahan yang disiarkan dan dicatat
      siarkanStatus(deviceId, hasil.data);
      if (!retained) { // status retained saat backend menyala = keadaan lama, bukan kejadian baru
        const pesan = hasil.data === "online" ? `${deviceId} tersambung lagi (online)` : `${deviceId} terputus (${hasil.data})`;
        arsip.then(() => catatKejadian({ device_id: deviceId, jenis: "status", sumber: "perangkat", aturan_id: null, pesan }))
          .catch(() => {}); // gagal menyimpan status sudah dicatat gagalArsip
      }
    }
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
    const isi = hasil.data;
    simpanTelemetry(deviceId, isi);
    siarkanTelemetry(deviceId, isi); // Modul 19: langsung diteruskan ke klien yang mengikuti perangkat ini
    if (!("tekanan" in isi)) catatLaporan(deviceId, isi.state ?? null, isi.ts); // Modul 19: keadaan aktuator (kontrak 1.3)
    nilaiBacaan(deviceId, isi); // Modul 19: aturan otomatis
    arsipkanTelemetry(deviceId, isi)
      .then((baru) => { if (!baru) log.info(`kiriman ganda dilewati: ${deviceId} ${isi.ts}`); })
      .catch(gagalArsip(topik, log));
  } else if (jenis === "vitals") {
    const hasil = Vitals.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    const isi = hasil.data;
    simpanVitals(deviceId, isi);
    // Modul 19: vitals pertama sesudah perangkat menyala membawa uptime kecil; semua relay-nya baru saja padam
    if (isi.uptime_s < 60) perangkatMenyalaUlang(deviceId, isi.uptime_s);
    const arsip = arsipkanVitals(deviceId, isi);
    arsip.catch(gagalArsip(topik, log));
    if (isi.offline_s !== undefined) { // Modul 19: laporan mode offline (kontrak 1.3)
      const pesan = `${deviceId} kembali dari mode offline setelah ${isi.offline_s} detik; `
        + `pengaman lokal menyalakan kipas ${isi.kipas_lokal} kali`;
      log.warn(pesan);
      arsip.then(() => catatKejadian({ device_id: deviceId, jenis: "mode-offline", sumber: "perangkat", aturan_id: null,
        pesan, data: { offline_s: isi.offline_s, kipas_lokal: isi.kipas_lokal } })).catch(() => {});
    }
  } else if (jenis === "ack") {
    const hasil = Ack.safeParse(json);
    if (!hasil.success) return tolak(topik, ringkas(hasil.error), log);
    catatLaporan(deviceId, hasil.data.state, hasil.data.ts); // Modul 19: setiap ack sah memperbarui keadaan yang dilaporkan
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

// Modul 19: ambang aturan pengaman lokal (kontrak 1.3 bagian 7). QoS 1 dan retained: perangkat yang baru menyala atau
// baru tersambung langsung menerimanya begitu berlangganan cmd.
export function kirimConfig(deviceId: string, idPerintah: string, ambang: Ambang): void {
  const cmd = { id: idPerintah, ts: new Date().toISOString().slice(0, 19) + "Z", aksi: "config", ambang };
  klien?.publish(`rpm/${deviceId}/cmd`, JSON.stringify(cmd), { qos: 1, retain: true });
}
```

Yang baru dibandingkan dengan Praktik 2:

- Saat tersambung ke broker: **`kirimSemuaConfig()`**.
- **`paket.retain`** ikut diteruskan ke `terima()`. Pesan *retained* adalah pesan lama yang diserahkan broker karena backend baru berlangganan, bukan kejadian baru.
- **`status`** hanya disiarkan dan dicatat di buku kejadian kalau **berubah**, dan tidak dicatat kalau pesannya *retained*. Tanpa ini, setiap kali backend dijalankan, semua perangkat tercatat "tersambung lagi".
- **`telemetry`**: satu baris baru, **`nilaiBacaan(deviceId, isi)`**.
- **`vitals`** yang membawa `offline_s` (laporan mode offline, kontrak 1.3) dicatat sebagai kejadian `mode-offline`. Laporan ini datang dari Node 1 v1.5.0 di Praktik 7.
- Fungsi baru **`kirimConfig()`**: QoS 1 dan **`retain: true`**, berbeda dengan `kirimPerintah()` untuk `set`, yang tidak pernah *retained*. Fungsi `ringkas()` kini diekspor karena dipakai juga oleh `otomasi.ts`.

Lalu buka **`backend/src/server.ts`**:

1. Tambahkan dua impor: `import { ruteAturan } from "./routes/aturan.ts";` di bawah impor `rutePerangkat`, dan `import { muatAturan } from "./services/otomasi.ts";` di bawah impor `mulaiRealtime`.
2. Daftarkan rutenya di bawah `await app.register(rutePerangkat);`:

   ```ts
   await app.register(ruteAturan); // Modul 19
   ```

3. Muat aturan sesudah pemeriksaan database (sesudah baris `else app.log.warn("database belum bisa dihubungi: …");`):

   ```ts
   try {
     await muatAturan(); // Modul 19: aturan otomatis dari tabel rules
   } catch (galat) {
     app.log.error(`aturan otomatis belum bisa dimuat: ${(galat as Error).message}`);
   }
   ```

   Kalau database belum siap, server tetap menyala tanpa aturan; pesan galatnya menjelaskan sebabnya.

Terakhir, buka **`alat/terminal-live.js`** dan tambahkan satu baris di bawah `socket.on("status", …)`:

```js
socket.on("kejadian", (kejadian) => console.log(`[${jam()}] kejadian: ${kejadian.pesan}`)); // buku kejadian (Praktik 4)
```

Simpan semuanya, jalankan `npm run cek`, lalu `npm test` (kesepuluh uji Praktik 3 harus tetap hijau).

#### 4.8 ⭐ Ubah ambang tanpa *restart*

Jalankan backend (`npm run dev`). **Hasilnya** (**contoh**):

```text
[06:47:51] INFO: database siap
[06:47:51] INFO: aturan dimuat: 0 aktif dari 0
[06:47:51] INFO: Server listening at http://127.0.0.1:8080
[06:47:51] INFO: dokumentasi API: http://127.0.0.1:8080/docs
[06:47:51] INFO: tersambung ke broker mqtt://127.0.0.1:1883
```

Pastikan simulator Modul 19 berjalan untuk satu perangkat. Jalankan ulang terminal kecil di terminal ketiga (**Ctrl + C** kalau masih berjalan, lalu `node terminal-live.js http://127.0.0.1:8080 f00d00000001`) karena baris `kejadian` yang ditambahkan di 4.7 baru terbaca setelah programnya dimulai ulang. Kalau kipasnya masih menyala dari Praktik 2, padamkan dulu lewat `POST /devices/{id}/command` dengan `{"target":"kipas","nilai":false}`. Di terminal simulator, ketik **`suhu 29`** lalu tekan **Enter**; simulator menjawab `Suhu: 29.0 °C`, dan semua bacaannya kini 29 °C.

1. **Buat aturan.** Di `/docs`, buka **`POST /rules`** → **Try it out**, isi *body* berikut (jalur perangkat juga memakai `f00d00000001` milik simulator; aturan ini baru dipindahkan ke Node 1-mu di Praktik 7), lalu klik **Execute**:

   ```json
   {"nama":"Kipas otomatis","aktif":true,"kondisi":{"jenis":"ambang","device_id":"f00d00000001","besaran":"suhu","nyala_di_atas":30,"padam_di_bawah":28,"selama_detik":120},"aksi":{"jenis":"sakelar","device_id":"f00d00000001","target":"kipas","kabari":true}}
   ```

   **Hasilnya** kode `201` dengan aturan yang tersimpan, kini lengkap dengan `"id": 1` serta waktu `dibuat` dan `diubah`. Log backend (**contoh**):

   ```text
   [06:49:00] INFO: aturan dimuat: 1 aktif dari 1
   [06:49:00] INFO: Aturan 1 (Kipas otomatis) dibuat lewat API: kipas f00d00000001 menyala kalau suhu f00d00000001 di atas 30 selama 120 detik, padam di bawah 28
   [06:49:00] INFO: config c-20261020-234900-2 ke f00d00000001: suhu_kipas_on 30 dari aturan 1 (retained)
   [06:49:00] INFO: POST /rules -> 201 (30 ms)
   [06:49:00] INFO: config c-20261020-234900-2 ke f00d00000001: ack ok=true
   ```

   Terminal simulator menulis `f00d00000001: ambang sama dengan yang tersimpan {"suhu_kipas_on":30,"tanah_siram":30}`. Angka bawaan simulator memang 30 °C, sama dengan Node 1, jadi belum ada yang perlu disimpan; ambang yang berbeda baru tersimpan di langkah 2 (`ambang disimpan {"suhu_kipas_on":32,"tanah_siram":30}`). Terminal kecil menampilkan baris `kejadian: Aturan 1 (Kipas otomatis) dibuat lewat API: …`.

2. **Naikkan ambangnya.** Buka **`PUT /rules/{id}`** → **Try it out**, isi `id` dengan `1` dan *body* dengan isi yang sama, tetapi dengan `"nyala_di_atas":32,"padam_di_bawah":30` → **Execute** (kode `200`). Lalu ketik **`suhu 31`** di terminal simulator, dan tunggu **dua setengah menit**. Kipas **tidak** menyala: 31 °C tidak di atas ambang 32. `GET /devices/{id}/state` menunjukkan `"kipas": false` di `reported`, dan juga di `desired` kalau tadi kamu memadamkan kipas lewat API (kalau tidak, `desired` masih kosong).

3. **Turunkan ambangnya, tanpa *restart*.** Kirim lagi `PUT /rules/1` dengan `"nyala_di_atas":30,"padam_di_bawah":28`. Simulator masih membaca 31 °C. Log backend (**contoh**):

   ```text
   [06:51:40] INFO: Aturan 1 (Kipas otomatis) diubah lewat API: kipas f00d00000001 menyala kalau suhu f00d00000001 di atas 30 selama 120 detik, padam di bawah 28
   [06:51:40] INFO: config c-20261020-235140-4 ke f00d00000001: suhu_kipas_on 30 dari aturan 1 (retained)
   [06:51:40] INFO: PUT /rules/1 -> 200 (16 ms)
   [06:51:40] INFO: config c-20261020-235140-4 ke f00d00000001: ack ok=true
   [06:51:48] INFO: aturan 1 (Kipas otomatis): suhu 31 di atas 30; kipas dinyalakan kalau bertahan 120 detik
   [06:53:48] INFO: perintah c-20261020-235348-5 (aturan) ke f00d00000001: kipas = true, ack ok=true dalam 3 ms
   [06:53:48] INFO: aturan 1 (Kipas otomatis): 🌡️ Suhu 31 °C — kipas dinyalakan otomatis
   ```

   Bacaan pertama sesudah perubahan memulai hitungan, dan **tepat dua menit kemudian** kipas dinyalakan oleh aturan. Server tidak dimulai ulang sekali pun. Terminal kecil menampilkannya juga:

   ```text
   [06.53.48] kejadian: 🌡️ Suhu 31 °C — kipas dinyalakan otomatis
   [06.53.50] f00d00000001  suhu 31 °C  lembap 69 %  tanah 46 %  kipas NYALA  lampu padam
   ```

   Inilah syarat lulus pertama modul ini. **Jalur perangkat:** ulangi langkah 2–3 dengan Node 1 pada gladi bersih Praktik 8, setelah firmware v1.5.0 terpasang di Praktik 7.

4. **Biarkan suhunya turun.** Ketik **`suhu 27`**. Bacaan berikutnya berada di bawah 28 °C, dan kipas langsung dipadamkan:

   ```text
   [06:54:10] INFO: perintah c-20261020-235410-6 (aturan) ke f00d00000001: kipas = false, ack ok=true dalam 2 ms
   [06:54:10] INFO: aturan 1 (Kipas otomatis): ✅ Suhu turun ke 27 °C — kipas dipadamkan
   ```

#### 4.9 Siapa menyalakan kipas hari ini?

Buku kejadian dan kolom `sumber` kini menjawab pertanyaan itu. Di psql:

```sql
SELECT id, target, nilai, sumber, aturan_id, ack_ok, lama_ms FROM commands
WHERE device_id = 'f00d00000001' ORDER BY dikirim DESC LIMIT 3;
```

**Hasilnya** (**contoh**):

```text
         id          | target | nilai | sumber | aturan_id | ack_ok | lama_ms 
---------------------+--------+-------+--------+-----------+--------+---------
 c-20261020-235410-6 | kipas  | false | aturan |         1 | t      |       2
 c-20261020-235348-5 | kipas  | true  | aturan |         1 | t      |       3
 c-20261020-234847-1 | kipas  | false | api    |           | t      |      10
(3 rows)
```

Lalu lihat buku kejadiannya dengan waktu WIB (Modul 17 Konsep 9). **`left(pesan, 45)`** hanya mengambil 45 karakter pertama pesannya supaya tabelnya muat di layar:

```sql
SELECT id, waktu AT TIME ZONE 'Asia/Jakarta' AS waktu_wib, jenis, sumber, aturan_id, left(pesan, 45) AS pesan
FROM events ORDER BY id;
```

**Hasilnya** (**contoh**):

```text
 id |         waktu_wib          |     jenis     | sumber | aturan_id |                     pesan                     
----+----------------------------+---------------+--------+-----------+-----------------------------------------------
  1 | 2026-10-21 06:49:00.868307 | aturan-diubah | api    |         1 | Aturan 1 (Kipas otomatis) dibuat lewat API: k
  2 | 2026-10-21 06:49:05.613401 | aturan-diubah | api    |         1 | Aturan 1 (Kipas otomatis) diubah lewat API: k
  3 | 2026-10-21 06:51:40.475475 | aturan-diubah | api    |         1 | Aturan 1 (Kipas otomatis) diubah lewat API: k
  4 | 2026-10-21 06:53:48.413123 | aturan        | aturan |         1 | 🌡️ Suhu 31 °C — kipas dinyalakan otomatis
  5 | 2026-10-21 06:54:10.3509   | aturan        | aturan |         1 | ✅ Suhu turun ke 27 °C — kipas dipadamkan
(5 rows)
```

Terakhir, inilah jawaban paling ringkas untuk "siapa menyalakan kipas hari ini", lengkap dengan nama aturannya. Kueri ini memakai **`LEFT JOIN`**, saudara `JOIN` dari Modul 17 Konsep 8. `JOIN` biasa membuang baris `commands` yang tidak punya pasangan di `rules`, misalnya perintah dari API. `LEFT JOIN` tetap menampilkan baris itu dengan nama aturan yang kosong:

```sql
SELECT to_char(c.dikirim AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS jam_wib, c.sumber, r.nama AS aturan, c.ack_ok
FROM commands c LEFT JOIN rules r ON r.id = c.aturan_id
WHERE c.target = 'kipas' AND c.nilai = 'true'
  AND c.dikirim >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
ORDER BY c.dikirim;
```

**Hasilnya** (**contoh**):

```text
 jam_wib  | sumber |     aturan     | ack_ok 
----------+--------+----------------+--------
 06:22:39 | api    |                | t
 06:25:53 | api    |                | t
 06:27:10 | api    |                | t
 06:27:49 | api    |                | t
 06:53:48 | aturan | Kipas otomatis | t
(5 rows)
```

Di contoh ini, kipas dinyalakan empat kali dari API (perintahmu dan rekonsiliasi di Praktik 2; di layarmu jumlahnya bergantung pada berapa kali kamu mencoba) dan sekali oleh aturan "Kipas otomatis". Baris `date_trunc(…)` menghitung pukul 00.00 WIB hari ini sehingga yang tampil hanya perintah hari ini. Sebelum menyimpan ke cabang, hentikan backend di terminal pertama (**Ctrl + C**). Terminal itu masih di folder `backend`, dan `cd ..` di bawah membawanya ke `rumah-pintar-mini`.

#### 4.10 Simpan ke cabang

```text
cd ..
git add backend alat
git commit -m "Aturan otomatis di database, API /rules, config retained, dan buku kejadian (Modul 19 Praktik 4)"
```

> ⬆️ **Selesai Praktik 4?** Kembali ke [Konsep 8](#8-penjadwalan-jam-beker-untuk-server) sebelum Praktik 5.

### Praktik 5 — Jadwal siram pagi (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (backend dan simulator), browser untuk **`/docs`**, dan **psql**. Jalur laptop memakai simulator `f00d00000001` seperti Praktik 4. Jalur perangkat memakai Node 1 untuk aturan jadwal ini (pompa sungguhan akan menyala, jadi pastikan selangnya masuk ke wadah dan air tandon di atas 20 %).

Praktik ini menerapkan Konsep 8: mesin aturan mendapat jenis kedua, aturan **jadwal**, yang dijalankan node-cron menurut jam WIB.

#### 5.1 Pasang node-cron

Hentikan `npm run dev` kalau masih berjalan (**Ctrl + C**). Di terminal pertama, masuk lagi ke folder `backend` (`cd backend`; sejak *commit* Praktik 4 terminal itu berada di `rumah-pintar-mini`), lalu jalankan:

```text
npm install node-cron@4.6.0
```

**Hasilnya:**

```text
added 1 package, and audited 200 packages in 6s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Satu paket saja, tanpa paket pembantu, dan sudah membawa tipe TypeScript-nya sendiri. Jangan memasang `@types/node-cron`: paket itu berisi tipe untuk node-cron versi 3, bukan versi 4.6.0.

#### 5.2 Bentuk aturan jadwal

Buka **`backend/src/schemas/aturan.ts`** dan ganti seluruh isinya dengan versi yang mengenal dua jenis aturan:

```ts
// aturan.ts - bentuk aturan otomatis (Modul 19) sebagai skema Zod. Aturan adalah DATA, bukan kode: hanya bentuk yang
// dikenal di sini yang boleh masuk, baik lewat API maupun dari database.
import { z } from "zod";
import cron from "node-cron";
import { DeviceId, PerintahSet } from "./kontrak.ts";

// besaran telemetry yang boleh dipakai aturan ambang
const Besaran = z.enum(["suhu", "kelembapan", "cahaya", "tanah", "level_air", "tanah_rs485", "suhu_tanah"]);

// "Kalau <besaran> perangkat itu di atas <nyala_di_atas> terus-menerus selama <selama_detik> detik, aturan menyala;
// aturan padam lagi kalau <besaran> di bawah <padam_di_bawah>."
export const KondisiAmbang = z.strictObject({
  jenis: z.literal("ambang"),
  device_id: DeviceId,
  besaran: Besaran,
  nyala_di_atas: z.number(),
  padam_di_bawah: z.number(),
  selama_detik: z.number().int().min(0).max(3600),
}).refine((k) => k.padam_di_bawah < k.nyala_di_atas, {
  message: "padam_di_bawah harus lebih kecil daripada nyala_di_atas (histeresis)",
  path: ["padam_di_bawah"],
});

// "Setiap <cron> (jam WIB) ..." — ekspresi cron 5 bidang: menit jam tanggal bulan hari, misalnya "0 6 * * *"
export const KondisiJadwal = z.strictObject({
  jenis: z.literal("jadwal"),
  cron: z.string()
    .refine((teks) => teks.trim().split(/\s+/).length === 5, "jadwal memakai 5 bidang: menit jam tanggal bulan hari")
    .refine((teks) => cron.validate(teks), "ekspresi cron tidak sah"),
});

// "... maka nyalakan <target> perangkat itu, dan padamkan lagi saat aturan padam."
export const AksiSakelar = z.strictObject({
  jenis: z.literal("sakelar"),
  device_id: DeviceId,
  target: z.enum(["kipas", "lampu"]),
  kabari: z.boolean(), // kirim pesan Telegram saat aturan ini bertindak?
});

// "... maka kirim satu perintah set", misalnya pompa 10 detik. Memakai skema perintah yang sama dengan API.
export const AksiPerintah = z.strictObject({
  jenis: z.literal("perintah"),
  device_id: DeviceId,
  perintah: PerintahSet,
  kabari: z.boolean(),
});

// Kolom-kolom satu aturan (nama, aktif, kondisi, aksi), tanpa pemeriksaan gabungan.
export const IsiAturan = z.strictObject({
  nama: z.string().min(1).max(60),
  aktif: z.boolean(),
  kondisi: z.discriminatedUnion("jenis", [KondisiAmbang, KondisiJadwal]),
  aksi: z.discriminatedUnion("jenis", [AksiSakelar, AksiPerintah]),
});

// Isi POST /rules dan PUT /rules/:id.
export const Aturan = IsiAturan
  .refine((a) => (a.kondisi.jenis === "ambang") === (a.aksi.jenis === "sakelar"), {
    message: "kondisi ambang berpasangan dengan aksi sakelar; kondisi jadwal dengan aksi perintah",
    path: ["aksi", "jenis"],
  })
  // Ambang aturan kipas juga dikirim ke perangkat sebagai suhu_kipas_on (config, kontrak 1.3), jadi rentangnya harus sama
  // dengan yang diterima perangkat: 15-45 °C.
  .refine((a) => a.kondisi.jenis !== "ambang" || a.aksi.jenis !== "sakelar" || a.kondisi.besaran !== "suhu"
    || a.aksi.target !== "kipas" || (a.kondisi.nyala_di_atas >= 15 && a.kondisi.nyala_di_atas <= 45), {
    message: "untuk aturan kipas, nyala_di_atas harus 15-45 °C (ikut dikirim ke perangkat sebagai suhu_kipas_on)",
    path: ["kondisi", "nyala_di_atas"],
  });

export type KondisiAmbang = z.infer<typeof KondisiAmbang>;
export type AksiSakelar = z.infer<typeof AksiSakelar>;
export type Aturan = z.infer<typeof Aturan>;

// aturan yang sudah tersimpan di database: ditambah nomor dan waktunya
export type AturanTersimpan = Aturan & { id: number; dibuat: string; diubah: string };
```

- **`KondisiJadwal`** menerima ekspresi cron (Konsep 8) dengan dua pemeriksaan: harus **5 bidang**, dan harus sah menurut **`cron.validate()`** milik node-cron. node-cron sebenarnya juga menerima 6 bidang (dengan detik di depan), tetapi jadwal per detik tidak masuk akal untuk menyiram, jadi modul ini hanya memakai bentuk 5 bidang.
- **`AksiPerintah`** memakai ulang skema **`PerintahSet`** dari kontrak data, jadi aturan jadwal tidak mungkin menyuruh `pompa` 20 detik atau `tirai` 200°: skema yang sama dengan API sudah menolaknya.
- **`z.discriminatedUnion("jenis", […])`** berarti "salah satu dari bentuk-bentuk ini, dibedakan oleh kolom `jenis`". Kalau `jenis` bernilai `jadwal`, Zod memeriksa isinya dengan `KondisiJadwal`; kalau `ambang`, dengan `KondisiAmbang`.
- **`Aturan`** kini punya dua pemeriksaan gabungan: kondisi `ambang` harus berpasangan dengan aksi `sakelar`, dan kondisi `jadwal` dengan aksi `perintah`; lalu batas 15–45 °C dari Praktik 4.

#### 5.3 Juru jadwal: `jadwal.ts`

Buat file **`backend/src/services/jadwal.ts`**:

```ts
// jadwal.ts - aturan jadwal (Modul 19): perintah yang dijalankan pada jam tertentu, misalnya "siram 10 detik setiap
// 06.00 WIB", dengan node-cron 4.6.0. Zona waktunya SELALU Asia/Jakarta (WIB), apa pun zona waktu laptopnya.
import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import type { AturanTersimpan } from "../schemas/aturan.ts";
import { perintahkan } from "./perintah.ts";
import type { HasilPerintah } from "./perintah.ts";
import { catatKejadian } from "./kejadian.ts";
import { log } from "./log.ts";

export const ZONA = "Asia/Jakarta";
const tugas = new Map<number, ScheduledTask>(); // nomor aturan -> tugas node-cron

// jam WIB untuk manusia, misalnya "22 Okt 2026, 06.00 WIB"
const formatWib = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, dateStyle: "medium", timeStyle: "short" });
export const jamWib = (waktu: Date) => `${formatWib.format(waktu)} WIB`;

// Bongkar semua tugas lama, lalu pasang lagi dari daftar aturan. Dipanggil setiap kali aturan dimuat ulang.
export function pasangJadwal(daftar: AturanTersimpan[]): void {
  for (const t of tugas.values()) t.destroy();
  tugas.clear();
  for (const a of daftar) {
    if (!a.aktif || a.kondisi.jenis !== "jadwal") continue;
    const t = cron.schedule(a.kondisi.cron, () => jalankanJadwal(a), {
      name: `aturan-${a.id}`,
      timezone: ZONA, // tanpa ini, jadwal mengikuti zona laptop (laptop UTC+8 menyiram pukul 05.00 WIB)
      noOverlap: true, // kalau jadwal sebelumnya belum selesai, jangan jalankan dua kali bersamaan
      missedExecutionTolerance: 15 * 60_000, // terlambat sampai 15 menit (misalnya laptop baru bangun) tetap dijalankan
    });
    t.on("execution:missed", (konteks) => jadwalTerlewat(a, konteks.date));
    tugas.set(a.id, t);
    const berikutnya = t.getNextRun();
    log.info(`jadwal aturan ${a.id} (${a.nama}) dipasang: "${a.kondisi.cron}" ${ZONA}, `
      + `berikutnya ${berikutnya === null ? "-" : jamWib(berikutnya)}`);
  }
}

// untuk GET /rules: kapan jadwal aturan ini berjalan lagi (null kalau bukan aturan jadwal atau tidak aktif)
export function jadwalBerikutnya(id: number): Date | null {
  return tugas.get(id)?.getNextRun() ?? null;
}

// Jalankan aksi aturan jadwal sekarang: dipanggil node-cron pada jamnya, atau POST /rules/:id/jalankan untuk menguji.
export async function jalankanJadwal(a: AturanTersimpan): Promise<HasilPerintah> {
  if (a.aksi.jenis !== "perintah") throw new Error(`aturan ${a.id} bukan aturan jadwal`);
  const { device_id: deviceId, perintah } = a.aksi;
  log.info(`jadwal aturan ${a.id} (${a.nama}) berjalan: ${perintah.target} = ${perintah.nilai} ke ${deviceId}`);
  const hasil = await perintahkan(deviceId, perintah, "jadwal", a.id);
  let pesan: string;
  if (hasil.status === "dijawab" && hasil.ack.ok) {
    pesan = perintah.target === "pompa" ? `🚿 ${a.nama}: pompa menyala ${perintah.nilai} detik`
      : `⏰ ${a.nama}: ${perintah.target} = ${perintah.nilai}`;
  } else if (hasil.status === "dijawab") {
    pesan = `⚠️ ${a.nama}: perintah ${perintah.target} ditolak perangkat (${hasil.ack.pesan})`;
  } else if (hasil.status === "tanpa-ack") {
    pesan = `⚠️ ${a.nama}: ${deviceId} tidak menjawab perintah ${perintah.target}`;
  } else {
    pesan = `⚠️ ${a.nama}: perintah ${perintah.target} tidak dikirim (${hasil.pesan})`;
  }
  log.info(`jadwal aturan ${a.id}: ${pesan}`);
  catatKejadian({ device_id: deviceId, jenis: "jadwal", sumber: "jadwal", aturan_id: a.id, pesan,
    data: { perintah, hasil: hasil.status } });
  return hasil;
}

// node-cron 4 TIDAK memutar ulang jadwal yang terlewat (misalnya laptop tidur pukul 06.00): kita hanya bisa mencatatnya.
function jadwalTerlewat(a: AturanTersimpan, waktu: Date): void {
  const pesan = `⏰ Jadwal ${a.nama} pada ${jamWib(waktu)} terlewat (laptop tidur atau backend sibuk?)`;
  log.warn(pesan);
  catatKejadian({ device_id: null, jenis: "jadwal", sumber: "jadwal", aturan_id: a.id, pesan, data: { terlewat: waktu } });
}

// berhenti dengan rapi: hentikan semua tugas, tunggu yang sedang berjalan (node-cron 4.6.0)
export async function hentikanJadwal(): Promise<void> {
  await cron.shutdown();
}
```

- **`pasangJadwal()`** membongkar semua tugas lama (`destroy()`), lalu memasang satu tugas node-cron untuk setiap aturan jadwal yang aktif. Membongkar lalu memasang ulang adalah cara paling sederhana supaya perubahan aturan langsung berlaku.
- Pilihan **`timezone: ZONA`** (`Asia/Jakarta`) membuat `0 6 * * *` berarti pukul 06.00 **WIB**, apa pun zona waktu laptopnya. **`noOverlap: true`** mencegah jadwal yang sama berjalan dua kali bersamaan, dan **`missedExecutionTolerance`** tetap menjalankan jadwal yang terlambat sampai 15 menit, misalnya karena laptop baru bangun.
- Jadwal yang terlambat lebih lama memicu acara **`execution:missed`**, dan **`jadwalTerlewat()`** mencatatnya di log dan buku kejadian. node-cron 4 tidak pernah menjalankannya belakangan (Konsep 8).
- **`jalankanJadwal()`** mengirim perintah lewat **`perintahkan(…, "jadwal", a.id)`**, lalu menulis kalimat hasilnya, misalnya `🚿 Siram pagi: pompa menyala 10 detik`, ke log dan buku kejadian.
- **`jamWib()`** menulis waktu untuk manusia dengan **`Intl.DateTimeFormat`** berzona `Asia/Jakarta`, misalnya `22 Okt 2026, 06.00 WIB`.
- **`import type { ScheduledTask }`** hanya mengambil **tipe** tugas node-cron untuk TypeScript, tanpa membawa kode apa pun. `Map<number, ScheduledTask>` adalah buku catatan "nomor aturan → tugas node-cron" yang dipakai `pasangJadwal()` untuk membongkar tugas lama.

#### 5.4 Otomasi mengenal dua jenis aturan

Buka **`backend/src/services/otomasi.ts`** dan ganti seluruh isinya:

```ts
// otomasi.ts - menjalankan aturan otomatis dari tabel rules (Modul 19): memuat aturan ke memori, menilai setiap bacaan
// dengan otak murni (aturan/mesin.ts), bertindak lewat perintahkan(), mengirim ambang kipas ke perangkat (config),
// memasang aturan jadwal (jadwal.ts), dan mencatat setiap tindakan di buku kejadian.
import { Aturan } from "../schemas/aturan.ts";
import type { AksiSakelar, AturanTersimpan, KondisiAmbang } from "../schemas/aturan.ts";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { INGATAN_AWAL, nilaiAmbang } from "../aturan/mesin.ts";
import type { Ingatan } from "../aturan/mesin.ts";
import { ambilSemuaAturan, tambahAturan, ubahAturan, waktuKontrak } from "../db/arsip.ts";
import type { BarisAturan } from "../db/arsip.ts";
import { cariPerangkat, tungguAck } from "./gudang.ts";
import { buatIdPerintah, kirimConfig, ringkas } from "./mqtt.ts";
import { perintahkan } from "./perintah.ts";
import type { HasilPerintah } from "./perintah.ts";
import { pasangJadwal } from "./jadwal.ts";
import { catatKejadian } from "./kejadian.ts";
import { log } from "./log.ts";

const BACAAN_BASI_MS = 60_000; // bacaan yang ts-nya lebih tua daripada 60 detik (data susulan) tidak dinilai
let daftar: AturanTersimpan[] = []; // semua aturan yang sah, urut nomor
const ingatan = new Map<number, Ingatan>(); // nomor aturan -> ingatan nilaiAmbang

// Muat ulang semua aturan dari database. Baris yang tidak sah (misalnya diubah dengan tangan lewat DBeaver) dilewati.
export async function muatAturan(): Promise<void> {
  const sah: AturanTersimpan[] = [];
  for (const baris of await ambilSemuaAturan()) {
    const hasil = Aturan.safeParse({ nama: baris.nama, aktif: baris.aktif, kondisi: baris.kondisi, aksi: baris.aksi });
    if (!hasil.success) {
      log.warn(`aturan ${baris.id} dilewati: ${ringkas(hasil.error)}`);
      continue;
    }
    sah.push({ ...hasil.data, id: baris.id, dibuat: waktuKontrak(baris.dibuat), diubah: waktuKontrak(baris.diubah) });
  }
  daftar = sah;
  log.info(`aturan dimuat: ${sah.filter((a) => a.aktif).length} aktif dari ${sah.length}`);
  pasangJadwal(sah); // aturan jadwal: tugas node-cron dibongkar lalu dipasang lagi
}

export function semuaAturan(): AturanTersimpan[] {
  return daftar;
}

export function cariAturan(id: number): AturanTersimpan | undefined {
  return daftar.find((a) => a.id === id);
}

// POST /rules: simpan aturan baru, lalu langsung berlaku
export async function buatAturan(isi: Aturan): Promise<AturanTersimpan> {
  return setelahBerubah(await tambahAturan(isi), "dibuat");
}

// PUT /rules/:id: hasilnya undefined kalau aturan bernomor itu tidak ada
export async function gantiAturan(id: number, isi: Aturan): Promise<AturanTersimpan | undefined> {
  const baris = await ubahAturan(id, isi);
  return baris === undefined ? undefined : setelahBerubah(baris, "diubah");
}

async function setelahBerubah(baris: BarisAturan, kata: string): Promise<AturanTersimpan> {
  ingatan.delete(baris.id); // ambang baru = hitungan "selama" baru
  await muatAturan();
  const a = cariAturan(baris.id);
  if (a === undefined) throw new Error(`aturan ${baris.id} tidak sah setelah disimpan`);
  const pesan = `Aturan ${a.id} (${a.nama}) ${kata} lewat API: ${uraikan(a)}`;
  log.info(pesan);
  catatKejadian({ device_id: null, jenis: "aturan-diubah", sumber: "api", aturan_id: a.id, pesan,
    data: { nama: a.nama, aktif: a.aktif, kondisi: a.kondisi, aksi: a.aksi } });
  kirimSemuaConfig();
  return a;
}

// kalimat pendek untuk log dan buku kejadian
function uraikan(a: AturanTersimpan): string {
  const { kondisi: k, aksi } = a;
  const mati = a.aktif ? "" : " (tidak aktif)";
  if (k.jenis === "jadwal" && aksi.jenis === "perintah") {
    return `${aksi.perintah.target} ${aksi.device_id} = ${aksi.perintah.nilai} setiap "${k.cron}" WIB${mati}`;
  }
  if (k.jenis === "ambang" && aksi.jenis === "sakelar") {
    return `${aksi.target} ${aksi.device_id} menyala kalau ${k.besaran} ${k.device_id} di atas ${k.nyala_di_atas} `
      + `selama ${k.selama_detik} detik, padam di bawah ${k.padam_di_bawah}${mati}`;
  }
  return "bentuk aturan tidak dikenal";
}

// Kirim ambang pengaman ke setiap perangkat yang punya aturan kipas berdasarkan suhu: suhu_kipas_on = nyala_di_atas
// (kontrak 1.3, config retained). Dipanggil setiap kali backend tersambung ke broker dan setiap kali aturan berubah.
export function kirimSemuaConfig(): void {
  const sudah = new Set<string>(); // satu perangkat, satu ambang: aturan kipas aktif bernomor terkecil
  for (const a of daftar) {
    const { kondisi, aksi } = a;
    if (!a.aktif || kondisi.jenis !== "ambang" || aksi.jenis !== "sakelar") continue;
    if (kondisi.besaran !== "suhu" || aksi.target !== "kipas" || sudah.has(aksi.device_id)) continue;
    sudah.add(aksi.device_id);
    void kirimAmbang(aksi.device_id, kondisi.nyala_di_atas, a.id);
  }
}

async function kirimAmbang(deviceId: string, suhu: number, aturanId: number): Promise<void> {
  const id = buatIdPerintah();
  const menunggu = tungguAck(id, 5000); // mulai menunggu SEBELUM mengirim, seperti perintah set
  kirimConfig(deviceId, id, { suhu_kipas_on: suhu });
  log.info(`config ${id} ke ${deviceId}: suhu_kipas_on ${suhu} dari aturan ${aturanId} (retained)`);
  const ack = await menunggu;
  if (ack === null) {
    log.warn(`config ${id} ke ${deviceId}: belum dijawab dalam 5 detik; config tetap tertempel di broker sampai perangkat tersambung`);
  } else {
    log.info(`config ${id} ke ${deviceId}: ack ok=${ack.ok}${ack.pesan === undefined ? "" : ` (${ack.pesan})`}`);
  }
}

// Dipanggil mqtt.ts untuk setiap telemetry yang lolos kontrak.
export function nilaiBacaan(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  const sekarang = Date.now();
  if (sekarang - Date.parse(isi.ts) > BACAAN_BASI_MS) return; // data susulan: bukan keadaan sekarang
  const bacaan: Record<string, unknown> = isi;
  for (const a of daftar) {
    const { kondisi, aksi } = a;
    if (!a.aktif || kondisi.jenis !== "ambang" || aksi.jenis !== "sakelar" || kondisi.device_id !== deviceId) continue;
    const mentah = bacaan[kondisi.besaran];
    const nilai = typeof mentah === "number" ? mentah : null; // null: sensor gagal, atau kolom tidak dimiliki perangkat
    const lama = ingatan.get(a.id) ?? ingatanAwal(aksi);
    const { ingatan: baru, keputusan } = nilaiAmbang(kondisi, lama, nilai, sekarang);
    ingatan.set(a.id, baru);
    if (keputusan !== null) {
      void bertindak(a, kondisi, aksi, keputusan, nilai, isi.ts, lama);
    } else if (lama.sejak === null && baru.sejak !== null) {
      log.info(`aturan ${a.id} (${a.nama}): ${kondisi.besaran} ${nilai} di atas ${kondisi.nyala_di_atas}; `
        + `${aksi.target} dinyalakan kalau bertahan ${kondisi.selama_detik} detik`);
    } else if (lama.sejak !== null && baru.sejak === null) {
      log.info(`aturan ${a.id} (${a.nama}): hitungan diulang (${kondisi.besaran} ${nilai ?? "tidak terbaca"})`);
    }
  }
}

// Setelah backend dimulai ulang atau aturannya diubah: kalau perangkat melaporkan aktuatornya sedang menyala, anggap
// aturan sedang menyala supaya nanti dipadamkan pada waktunya.
function ingatanAwal(aksi: AksiSakelar): Ingatan {
  return { ...INGATAN_AWAL, aktif: cariPerangkat(aksi.device_id)?.reported?.[aksi.target] === true };
}

async function bertindak(a: AturanTersimpan, kondisi: KondisiAmbang, aksi: AksiSakelar, keputusan: "nyalakan" | "padamkan",
  nilai: number | null, tsBacaan: string, lama: Ingatan): Promise<void> {
  const nyala = keputusan === "nyalakan";
  const hasil = await perintahkan(aksi.device_id, { target: aksi.target, nilai: nyala }, "aturan", a.id);
  if (hasil.status === "tidak-dikirim") {
    ingatan.set(a.id, lama); // keputusan belum terlaksana: bacaan berikutnya memutuskan lagi
    log.warn(`aturan ${a.id} (${a.nama}): ${aksi.target} tidak bisa di${nyala ? "nyala" : "padam"}kan: ${hasil.pesan}`);
    return;
  }
  const pesan = kalimat(kondisi, aksi, nyala, nilai, hasil);
  log.info(`aturan ${a.id} (${a.nama}): ${pesan}`);
  catatKejadian({ device_id: aksi.device_id, jenis: "aturan", sumber: "aturan", aturan_id: a.id, pesan,
    data: { keputusan, nilai, ts_bacaan: tsBacaan, perintah: hasil.id, hasil: hasil.status } });
}

const LABEL: Record<string, [string, string, string]> = { // besaran -> [emoji, nama, satuan]
  suhu: ["🌡️", "Suhu", " °C"], kelembapan: ["💧", "Kelembapan", " %"], cahaya: ["💡", "Cahaya", ""],
  tanah: ["🌱", "Tanah", " %"], level_air: ["🚰", "Air tandon", " %"], tanah_rs485: ["🌱", "Tanah (RS-485)", " %"],
  suhu_tanah: ["🌡️", "Suhu tanah", " °C"],
};
const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27,8"

// Kalimat untuk manusia, misalnya "🌡️ Suhu 33 °C — kipas dinyalakan otomatis" (sama dengan pesan Telegram-nya).
function kalimat(kondisi: KondisiAmbang, aksi: AksiSakelar, nyala: boolean, nilai: number | null,
  hasil: HasilPerintah): string {
  const [emoji, nama, satuan] = LABEL[kondisi.besaran];
  const teks = nilai === null ? "-" : angka.format(nilai);
  if (hasil.status === "tanpa-ack") return `⚠️ ${nama} ${teks}${satuan} — ${aksi.target} TIDAK menjawab perintah (dicoba lagi)`;
  if (hasil.status === "dijawab" && !hasil.ack.ok) {
    return `⚠️ ${nama} ${teks}${satuan} — perintah ${aksi.target} ditolak perangkat: ${hasil.ack.pesan}`;
  }
  return nyala ? `${emoji} ${nama} ${teks}${satuan} — ${aksi.target} dinyalakan otomatis`
    : `✅ ${nama} turun ke ${teks}${satuan} — ${aksi.target} dipadamkan`;
}
```

Perubahannya dibandingkan dengan Praktik 4:

- **`muatAturan()`** kini juga memanggil **`pasangJadwal(sah)`**, jadi setiap kali aturan dimuat ulang, jadwalnya ikut dipasang ulang.
- Karena `kondisi` dan `aksi` kini punya dua kemungkinan bentuk, kode yang khusus untuk aturan ambang memeriksa jenisnya dulu: **`if (… kondisi.jenis !== "ambang" || aksi.jenis !== "sakelar" …) continue;`**. Sesudah pemeriksaan itu, TypeScript tahu bahwa `kondisi` pasti `KondisiAmbang` sehingga `kondisi.besaran` boleh dipakai. Itu sebabnya `bertindak` dan `kalimat` kini menerima `kondisi` dan `aksi` yang sudah dipastikan bentuknya, dan `ingatanAwal` cukup menerima `aksi`.
- **`uraikan()`** punya kalimat untuk aturan jadwal, dan fungsi baru **`cariAturan()`** dipakai rute di langkah berikut.

#### 5.5 Rute: kapan berikutnya, dan jalankan sekarang

Buka **`backend/src/routes/aturan.ts`** dan ganti seluruh isinya:

```ts
// aturan.ts - rute /rules (Modul 19): melihat, membuat, dan mengubah aturan otomatis tanpa mengubah kode dan tanpa
// memulai ulang server, serta menjalankan aturan jadwal sekarang juga untuk mengujinya.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack } from "../schemas/kontrak.ts";
import { Aturan, IsiAturan } from "../schemas/aturan.ts";
import type { AturanTersimpan } from "../schemas/aturan.ts";
import { buatAturan, cariAturan, gantiAturan, semuaAturan } from "../services/otomasi.ts";
import { jadwalBerikutnya, jalankanJadwal } from "../services/jadwal.ts";
import { waktuKontrak } from "../db/arsip.ts";

const Galat = z.object({ pesan: z.string() });
const ParamId = z.object({ id: z.coerce.number().int().min(1).describe("nomor aturan, misalnya 1") });
const AturanLengkap = z.object({
  id: z.number().describe("nomor aturan"),
  ...IsiAturan.shape,
  dibuat: z.string().describe("kapan aturan dibuat (UTC)"),
  diubah: z.string().describe("kapan aturan terakhir diubah (UTC)"),
  berikutnya: z.string().nullable().describe("aturan jadwal: kapan berjalan lagi (UTC); selain itu null"),
});

// aturan tersimpan + kapan jadwalnya berjalan lagi
function lengkapi(a: AturanTersimpan) {
  const berikutnya = jadwalBerikutnya(a.id);
  return { ...a, berikutnya: berikutnya === null ? null : waktuKontrak(berikutnya) };
}

export const ruteAturan: FastifyPluginAsyncZod = async (app) => {
  app.get("/rules", {
    schema: {
      tags: ["aturan"],
      summary: "Semua aturan otomatis yang sedang dipakai server",
      response: { 200: z.array(AturanLengkap).describe("aturan yang sah, urut nomor") },
    },
  }, async () => semuaAturan().map(lengkapi));

  app.post("/rules", {
    schema: {
      tags: ["aturan"],
      summary: "Buat aturan otomatis baru; langsung berlaku tanpa memulai ulang server",
      body: Aturan,
      response: {
        201: AturanLengkap.describe("aturan tersimpan dan langsung dipakai"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      return reply.code(201).send(lengkapi(await buatAturan(req.body)));
    } catch (galat) {
      req.log.error(`aturan baru gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.put("/rules/:id", {
    schema: {
      tags: ["aturan"],
      summary: "Ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server",
      params: ParamId,
      body: Aturan,
      response: {
        200: AturanLengkap.describe("aturan tersimpan dan langsung dipakai"),
        404: Galat.describe("aturan bernomor itu tidak ada"),
        503: Galat.describe("database sedang tidak bisa dihubungi"),
      },
    },
  }, async (req, reply) => {
    try {
      const aturan = await gantiAturan(req.params.id, req.body);
      if (aturan === undefined) return reply.code(404).send({ pesan: `aturan ${req.params.id} tidak ada` });
      return lengkapi(aturan);
    } catch (galat) {
      req.log.error(`aturan ${req.params.id} gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.post("/rules/:id/jalankan", {
    schema: {
      tags: ["aturan"],
      summary: "Jalankan aksi satu aturan jadwal sekarang juga (untuk menguji, tanpa menunggu jamnya)",
      params: ParamId,
      response: {
        200: z.object({ id: z.string(), lama_ms: z.number(), ack: Ack }).describe("perangkat menjawab dengan ack"),
        404: Galat.describe("aturan bernomor itu tidak ada"),
        409: Galat.describe("bukan aturan jadwal, aturannya tidak aktif, atau perintahnya tidak bisa dikirim"),
        503: Galat.describe("backend tidak tersambung ke broker"),
        504: Galat.describe("tidak ada ack dalam 5 detik"),
      },
    },
  }, async (req, reply) => {
    const aturan = cariAturan(req.params.id);
    if (aturan === undefined) return reply.code(404).send({ pesan: `aturan ${req.params.id} tidak ada` });
    if (aturan.kondisi.jenis !== "jadwal") return reply.code(409).send({ pesan: `aturan ${aturan.id} bukan aturan jadwal` });
    if (!aturan.aktif) return reply.code(409).send({ pesan: `aturan ${aturan.id} tidak aktif` });
    const hasil = await jalankanJadwal(aturan);
    if (hasil.status === "tidak-dikirim") return reply.code(hasil.kode === 404 ? 409 : hasil.kode).send({ pesan: hasil.pesan });
    if (hasil.status === "tanpa-ack") return reply.code(504).send({ pesan: `tidak ada ack untuk ${hasil.id} dalam 5 detik` });
    return { id: hasil.id, lama_ms: hasil.lama_ms, ack: hasil.ack };
  });
};
```

- Setiap aturan di jawaban API kini membawa kolom **`berikutnya`**: kapan jadwalnya berjalan lagi (UTC), atau `null` untuk aturan ambang dan aturan yang tidak aktif. `id` kini ditulis paling depan supaya mudah dibaca.
- Rute baru **`POST /rules/:id/jalankan`** menjalankan aksi aturan jadwal **sekarang juga** supaya kamu bisa menguji tanpa menunggu pukul 06.00 besok. Aturan yang bukan jadwal atau tidak aktif dijawab `409`.

#### 5.6 Uji ke-11

Buka **`backend/src/aturan/mesin.test.ts`** dan tambahkan satu uji di akhir kelompok `describe("skema aturan (Zod)", …)`, tepat sebelum `});` penutup terakhirnya:

```ts
  it("aturan jadwal: \"0 6 * * *\" diterima, \"61 * * * *\" ditolak", () => { // Praktik 5
    const siram = {
      nama: "Siram pagi", aktif: true, kondisi: { jenis: "jadwal", cron: "0 6 * * *" },
      aksi: { jenis: "perintah", device_id: "f00d00000001", perintah: { target: "pompa", nilai: 10 }, kabari: true },
    };
    expect(Aturan.safeParse(siram).success).toBe(true);
    expect(Aturan.safeParse({ ...siram, kondisi: { jenis: "jadwal", cron: "61 * * * *" } }).success).toBe(false);
  });
```

Jalankan `npm run cek`, lalu `npm test`. Baris `Tests` di ringkasannya kini **`Tests  11 passed (11)`**. Syarat "10 *unit test* hijau" tetap terpenuhi: sepuluh uji Praktik 3 tidak berubah, dan sekarang ada satu tambahan.

#### 5.7 Coba jadwalnya

Pastikan simulator Modul 19 masih berjalan untuk satu perangkat (jalur perangkat: Node 1 juga menyala; aturan kipas masih menuju simulator, dan aturan siram ini menuju Node 1), lalu jalankan backend (`npm run dev`). Di `/docs`, buka **`POST /rules`** dan buat aturan siram pagi (jalur perangkat: ganti `device_id` dengan milik Node 1-mu):

```json
{"nama":"Siram pagi","aktif":true,"kondisi":{"jenis":"jadwal","cron":"0 6 * * *"},"aksi":{"jenis":"perintah","device_id":"f00d00000001","perintah":{"target":"pompa","nilai":10},"kabari":true}}
```

**Hasilnya** kode `201` (**contoh**, bagian akhirnya):

```json
  "dibuat": "2026-10-21T00:01:51Z",
  "diubah": "2026-10-21T00:01:51Z",
  "berikutnya": "2026-10-21T23:00:00Z"
```

`23:00:00Z` adalah pukul 06.00 WIB keesokan harinya karena WIB = UTC + 7. Log backend menulisnya dalam WIB (**contoh**, tiga baris pertama; sesudahnya ada baris `config … suhu_kipas_on 30 dari aturan 1 (retained)` dan `ack ok=true`-nya karena setiap perubahan aturan menerbitkan ulang `config`, Konsep 7):

```text
[07:01:51] INFO: aturan dimuat: 2 aktif dari 2
[07:01:51] INFO: jadwal aturan 2 (Siram pagi) dipasang: "0 6 * * *" Asia/Jakarta, berikutnya 22 Okt 2026, 06.00 WIB
[07:01:51] INFO: Aturan 2 (Siram pagi) dibuat lewat API: pompa f00d00000001 = 10 setiap "0 6 * * *" WIB
```

Kamu tentu tidak perlu menunggu sampai pukul 06.00. Buka **`POST /rules/{id}/jalankan`**, isi `id` dengan `2`, lalu klik **Execute**. **Hasilnya** kode `200` dengan `ack` yang menunjukkan `"pompa": true`, dan log backend (**contoh**):

```text
[07:01:56] INFO: jadwal aturan 2 (Siram pagi) berjalan: pompa = 10 ke f00d00000001
[07:01:56] INFO: perintah c-20261021-000156-4 (jadwal) ke f00d00000001: pompa = 10, ack ok=true dalam 6 ms
[07:01:56] INFO: jadwal aturan 2: 🚿 Siram pagi: pompa menyala 10 detik
[07:01:56] INFO: POST /rules/2/jalankan -> 200 (41 ms)
```

Sekarang buktikan node-cron benar-benar berjalan pada jamnya. Lihat jam WIB sekarang (di laptop WITA kurangi 1 jam, di laptop WIT kurangi 2 jam), tambahkan **3 menit**, lalu buat aturan uji dengan menit dan jam itu. Contohnya, kalau sekarang pukul 07.01 WIB, pakai `4 7 * * *` (pukul 07.04):

```json
{"nama":"Uji jadwal","aktif":true,"kondisi":{"jenis":"jadwal","cron":"4 7 * * *"},"aksi":{"jenis":"perintah","device_id":"f00d00000001","perintah":{"target":"pompa","nilai":2},"kabari":false}}
```

Tunggu sampai jamnya tiba. **Hasilnya** di log backend, tepat pada detik ke-0 menit itu (**contoh**):

```text
[07:04:00] INFO: jadwal aturan 3 (Uji jadwal) berjalan: pompa = 2 ke f00d00000001
[07:04:00] INFO: perintah c-20261021-000400-5 (jadwal) ke f00d00000001: pompa = 2, ack ok=true dalam 7 ms
[07:04:00] INFO: jadwal aturan 3: 🚿 Uji jadwal: pompa menyala 2 detik
```

Lalu **matikan aturan uji itu** supaya tidak menyiram setiap hari: kirim `PUT /rules/3` dengan isi yang sama, tetapi `"aktif":false`. Di jawabannya, `berikutnya` menjadi `null`, dan log menulis `… (tidak aktif)`.

Coba juga beberapa aturan yang keliru lewat `POST /rules`. Semuanya ditolak `400` sebelum menyentuh database:

| Isi yang dicoba | Pesan di jawaban `400` |
| :--- | :--- |
| `"cron":"61 * * * *"` (menit 61) | `body/kondisi/cron ekspresi cron tidak sah` |
| `"cron":"*/30 * * * * *"` (6 bidang) | `body/kondisi/cron jadwal memakai 5 bidang: menit jam tanggal bulan hari` |
| kondisi `jadwal` dengan aksi `sakelar` | `body/aksi/jenis kondisi ambang berpasangan dengan aksi sakelar; kondisi jadwal dengan aksi perintah` |
| aturan kipas dengan `"nyala_di_atas":50` | `body/kondisi/nyala_di_atas untuk aturan kipas, nyala_di_atas harus 15-45 °C (ikut dikirim ke perangkat sebagai suhu_kipas_on)` |

Permintaan `POST /rules/1/jalankan` (aturan kipas) juga ditolak dengan kode `409` dan pesan `aturan 1 bukan aturan jadwal`.

#### 5.8 Jejaknya di database

Di psql, perintah-perintah dari jadwal kini bersumber `jadwal`:

```sql
SELECT to_char(dikirim AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS jam_wib, id, target, nilai, sumber, aturan_id, ack_ok
FROM commands WHERE sumber = 'jadwal' ORDER BY dikirim;
```

**Hasilnya** (**contoh**):

```text
 jam_wib  |         id          | target | nilai | sumber | aturan_id | ack_ok 
----------+---------------------+--------+-------+--------+-----------+--------
 07:01:56 | c-20261021-000156-4 | pompa  | 10    | jadwal |         2 | t
 07:04:00 | c-20261021-000400-5 | pompa  | 2     | jadwal |         3 | t
(2 rows)
```

Jam di kolom `jam_wib` sama dengan jam di log backend: keduanya WIB. Sebelum menyimpan ke cabang, hentikan backend di terminal pertama (**Ctrl + C**). Terminal itu masih di folder `backend`, dan `cd ..` di bawah membawanya ke `rumah-pintar-mini`.

#### 5.9 Simpan ke cabang

```text
cd ..
git add backend
git commit -m "Aturan jadwal dengan node-cron, zona Asia/Jakarta (Modul 19 Praktik 5)"
```

> ⬆️ **Selesai Praktik 5?** Kembali ke [Konsep 9](#9-notifikasi-telegram-penting-cepat-dan-tidak-cerewet) sebelum Praktik 6.

### Praktik 6 — Bot Telegram yang tahu diri (60 menit)

> 🖥️ **Alat yang dipakai:** aplikasi **Telegram** di HP atau laptop (untuk @BotFather dan bot-mu), **VS Code** (backend, simulator, dan terminal kecil), dan browser untuk **`/docs`**. Semua jalur, termasuk jalur perangkat (dengan alamat broker Pi), menguji aturan kipas dengan simulator `f00d00000001` seperti Praktik 4 karena suhunya bisa diatur dari terminal. Aturan **Siram pagi** tetap menuju perangkat yang kamu pakai di Praktik 5.
>
> ⭐ **Wajib** — syarat lulus ketiga modul ini: peringatan sampai ke Telegram-mu **dalam 10 detik** sejak bacaan yang memicunya.

Praktik ini menerapkan Konsep 9. Backend mendapat bot Telegram yang mengabari tiga hal: tindakan aturan otomatis (kipas menyala dan padam), jadwal yang berjalan, dan perangkat yang `offline` lebih dari 60 detik. Bot juga menjawab dua perintah: `/start` (memberi tahu `chat_id`-mu) dan `/status` (ringkasan rumah, hanya untuk pemiliknya).

#### 6.1 Buat bot di @BotFather

Langkah ini mengikuti dokumentasi resmi Telegram ([core.telegram.org/bots/features#botfather](https://core.telegram.org/bots/features#botfather)) dan dikerjakan di aplikasi Telegram, bukan di VS Code.

1. Buka Telegram, lalu cari **@BotFather** di kotak pencarian. Pastikan nama penggunanya persis `@BotFather` karena banyak akun tiruan bernama mirip. Cara lain yang pasti benar: buka tautan resmi [t.me/botfather](https://t.me/botfather).
2. Saat pertama kali membuka percakapan (*chat*) dengan bot, Telegram menampilkan tombol **Start** di bawah. Tekan tombol itu (atau ketik `/start` lalu kirim). BotFather membalas dengan daftar perintahnya.
3. Kirim **`/newbot`**. BotFather menanyakan **nama** bot, yaitu nama yang tampil di daftar kontak. Ketik misalnya `Rumah Pintar Mini`.
4. BotFather lalu menanyakan ***username*** (nama pengguna) bot. Aturannya: 5–32 karakter, hanya huruf Latin, angka, dan garis bawah, serta harus diakhiri `bot`, misalnya `rumah_pintar_budi_bot`. Nama pengguna itu tidak boleh sama dengan nama pengguna lain di seluruh Telegram, jadi tambahkan nama atau angka sampai diterima. Nama pengguna tidak bisa diganti nanti.
5. BotFather membalas dengan **token** bot-mu. Bentuknya seperti contoh di dokumentasi Telegram ini (contoh, bukan token sungguhan):

   ```text
   110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
   ```

   Salin token milikmu. Langkah 6.3 menaruhnya di `.env`.

BotFather kini juga punya tampilan aplikasi mini (*Mini App*) dengan fungsi yang sama. Modul ini memakai perintah teks di atas karena lebih mudah diikuti langkah demi langkah.

> ⚠️ **Token = kunci bot-mu.** Menurut dokumentasi Telegram, siapa pun yang memegang token bisa mengendalikan bot-mu. Jangan menaruhnya di kode, README, tangkapan layar, atau grup Telegram. Tempatnya hanya di `backend/.env`, yang tidak ikut Git sejak Modul 16. Kalau token telanjur bocor atau hilang, kirim **`/token`** ke @BotFather untuk membuat token baru, lalu ganti isi `.env`.

#### 6.2 Pasang grammY

Hentikan `npm run dev` kalau masih berjalan (**Ctrl + C**). Di terminal pertama, masuk lagi ke folder `backend` (`cd backend`; sejak *commit* Praktik 5 terminal itu berada di `rumah-pintar-mini`), lalu pasang library bot Telegram **grammY**:

```text
npm install grammy@1.46.0
```

**Hasilnya:**

```text
added 6 packages, and audited 206 packages in 4s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Pasang dulu sebelum menulis kode bot. Kalau file yang mengimpor `grammy` sudah ada sebelum paketnya terpasang, `npm run cek` menolak dengan galat `error TS2307: Cannot find module 'grammy' or its corresponding type declarations.`

#### 6.3 Setelan Telegram di `.env`

Buka **`backend/.env.example`** dan tambahkan tiga baris ini di bagian paling bawah:

```text
# Telegram (Modul 19, tidak wajib): token dari @BotFather dan chat_id-mu (balasan /start). Kosong = notifikasi mati.
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

`.env.example` ikut Git, jadi isinya dibiarkan **kosong**. Lalu buka **`backend/.env`**, tambahkan tiga baris yang sama, dan isi `TELEGRAM_BOT_TOKEN` dengan token dari @BotFather (tanpa spasi dan tanpa tanda petik). `TELEGRAM_CHAT_ID` dibiarkan kosong dulu; angkanya didapat di langkah 6.6.

Lalu buka **`backend/src/config/env.ts`** dan tambahkan keempat baris ini (satu komentar dan tiga setelan) di dalam `export const env = { … }`, tepat di bawah baris `HOST`:

```ts
  // Modul 19: Telegram tidak wajib. Kosong = notifikasi Telegram mati.
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "", // token dari @BotFather: rahasia, seperti kata sandi
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "", // chat_id pemilik (balasan /start)
  TELEGRAM_API_ROOT: process.env.TELEGRAM_API_ROOT ?? "", // kosong = server Telegram sungguhan (lab: server Bot API tiruan)
```

- Ketiganya **tidak wajib**: kalau kosong, nilainya `""` dan backend tetap berjalan tanpa Telegram. Ketiganya berbeda dengan `MQTT_URL` dan `DATABASE_URL`, yang membuat backend berhenti kalau tidak diisi.
- **`TELEGRAM_API_ROOT`** tidak perlu kamu tulis di `.env`. Kalau kosong, backend memakai server Telegram sungguhan. Penulis memakainya untuk menguji kode modul ini dengan server Telegram tiruan di laptop (lihat 🔬 Bedah Teknis).

#### 6.4 Bot-nya: `telegram.ts`

Buat file **`backend/src/services/telegram.ts`** (klik kanan folder **`services`** → **New File…**):

```ts
// telegram.ts - bot Telegram (Modul 19, grammY 1.46.0): peringatan dari aturan otomatis, /start untuk mengetahui
// chat_id, dan /status khusus pemilik. Kosongkan TELEGRAM_BOT_TOKEN di .env untuk mematikannya.
import { Bot, GrammyError, HttpError } from "grammy";
import { CATATAN_AWAL, perluKabari } from "../aturan/mesin.ts";
import type { CatatanKabar, Situasi } from "../aturan/mesin.ts";
import { semuaPerangkat } from "./gudang.ts";
import { log } from "./log.ts";

let bot: Bot | undefined;
let chatPemilik: number | undefined;
const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }); // 2.4 -> "2,4"
const jamWib = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });

export function mulaiTelegram(token: string, chatId: string, apiRoot: string): void {
  if (token === "") {
    log.info("notifikasi Telegram mati: TELEGRAM_BOT_TOKEN belum diisi");
    return;
  }
  chatPemilik = chatId === "" ? undefined : Number(chatId);
  // apiRoot kosong = server Telegram sungguhan; lab memakai server Bot API tiruan (TELEGRAM_API_ROOT)
  bot = new Bot(token, apiRoot === "" ? undefined : { client: { apiRoot } });
  bot.command("start", (ctx) => ctx.reply(`Halo! chat_id kamu: ${ctx.chat.id}\nTulis angka ini sebagai TELEGRAM_CHAT_ID di .env backend.`));
  bot.command("status", async (ctx) => {
    if (ctx.chat.id !== chatPemilik) { // siapa pun bisa menemukan bot: layani pemiliknya saja
      await ctx.reply("Maaf, bot ini hanya melayani pemiliknya.");
      return;
    }
    await ctx.reply(ringkasanStatus());
  });
  bot.catch((galat) => log.error(`galat bot Telegram: ${String(galat.error)}`)); // galat di dalam penangan perintah
  // start() baru selesai saat bot berhenti, jadi JANGAN ditunggu (await); .catch menangkap 401 (token salah) dan 409
  bot.start({ drop_pending_updates: true, onStart: (info) => log.info(`bot Telegram @${info.username} siap (long polling)`) })
    .catch((galat) => log.error(`bot Telegram berhenti: ${(galat as Error).message}`));
  if (chatPemilik === undefined) log.warn("TELEGRAM_CHAT_ID belum diisi: kirim /start ke bot untuk mengetahui chat_id-mu");
}

// Kirim satu pesan ke pemilik. tsBacaan (pilihan) = ts bacaan pemicu, untuk mengukur jedanya (syarat lulus <= 10 detik).
export async function kabari(teks: string, tsBacaan?: string): Promise<boolean> {
  if (bot === undefined || chatPemilik === undefined) return false;
  try {
    await bot.api.sendMessage(chatPemilik, teks);
    const jeda = tsBacaan === undefined ? ""
      : ` ${angka.format((Date.now() - Date.parse(tsBacaan)) / 1000)} detik setelah bacaan ${tsBacaan}`;
    log.info(`Telegram terkirim${jeda}: ${teks}`);
    return true;
  } catch (galat) {
    if (galat instanceof GrammyError) log.error(`Telegram menolak pesan: ${galat.description}`); // Bot API menjawab ok:false
    else if (galat instanceof HttpError) log.error(`server Telegram tidak terjangkau: ${galat.message}`);
    else log.error(`Telegram gagal: ${(galat as Error).message}`);
    return false;
  }
}

// Debouncing: kabari hanya saat situasi berubah, dan selama masih bahaya paling sering 30 menit sekali (perluKabari).
// kunci = "aturan:<nomor>". pengingat = true untuk bacaan biasa selama bahaya (bukan perubahan).
const catatan = new Map<string, CatatanKabar>();

export async function kabariKalauPerlu(kunci: string, situasi: Situasi, teks: string, tsBacaan: string,
  pengingat = false): Promise<void> {
  const lama = catatan.get(kunci);
  if (pengingat && lama === undefined) return; // belum pernah mengabari sejak backend menyala: jangan mulai dari pengingat
  const { kirim, catatan: baru } = perluKabari(lama ?? CATATAN_AWAL, situasi, Date.now());
  catatan.set(kunci, baru);
  if (kirim) await kabari(teks, tsBacaan);
}

// Status perangkat: "offline" baru dikabarkan kalau bertahan 60 detik (WiFi yang berkedip tidak membuat ramai).
const tundaOffline = new Map<string, ReturnType<typeof setTimeout>>(); // device_id -> pengatur waktu 60 detik
const sejakOffline = new Map<string, number>(); // device_id -> kapan offline (yang sudah dikabarkan)

export function kabariStatus(deviceId: string, status: string): void {
  if (status === "online") {
    const pengatur = tundaOffline.get(deviceId);
    if (pengatur !== undefined) { // kembali sebelum 60 detik: batal, tidak ada pesan
      clearTimeout(pengatur);
      tundaOffline.delete(deviceId);
      return;
    }
    const sejak = sejakOffline.get(deviceId);
    if (sejak !== undefined) {
      sejakOffline.delete(deviceId);
      void kabari(`✅ ${deviceId} online lagi (offline ${Math.round((Date.now() - sejak) / 60_000)} menit)`);
    }
    return;
  }
  if (tundaOffline.has(deviceId) || sejakOffline.has(deviceId)) return;
  const mulai = Date.now();
  tundaOffline.set(deviceId, setTimeout(() => {
    tundaOffline.delete(deviceId);
    sejakOffline.set(deviceId, mulai);
    void kabari(`📴 ${deviceId} offline sejak ${jamWib.format(mulai)} WIB`);
  }, 60_000));
}

// isi balasan /status: keadaan terakhir setiap perangkat di gudang memori
function ringkasanStatus(): string {
  const baris = [`📋 Rumah Pintar Mini, ${jamWib.format(Date.now())} WIB`];
  for (const p of semuaPerangkat()) {
    baris.push(`${p.device_id} (${p.jenis}): ${p.status}`);
    const t = p.telemetry;
    if (t !== null) baris.push(`  suhu ${t.suhu === null ? "-" : angka.format(t.suhu)} °C, kelembapan ${t.kelembapan ?? "-"} %, tanah ${t.tanah ?? "-"} %`);
    const r = p.reported;
    if (r !== null) baris.push(`  kipas ${r.kipas ? "menyala" : "padam"}, lampu ${r.lampu ? "menyala" : "padam"}, tirai ${r.tirai}°`);
    if (p.vitals !== null) baris.push(`  sinyal ${p.vitals.rssi} dBm, menyala ${Math.floor(p.vitals.uptime_s / 60)} menit`);
  }
  if (baris.length === 1) baris.push("Belum ada perangkat yang terdengar sejak backend menyala.");
  return baris.join("\n");
}

// berhenti dengan rapi: konfirmasi update terakhir ke Telegram supaya tidak diproses dua kali
export async function hentikanTelegram(): Promise<void> {
  if (bot?.isRunning()) await bot.stop();
}
```

Penjelasan bagian-bagiannya:

- **`mulaiTelegram()`** tidak melakukan apa-apa kalau token kosong (hanya menulis satu baris log). Kalau ada token, ia membuat `new Bot(token)` dan mendaftarkan dua perintah. **`/start`** membalas siapa pun dengan `chat_id`-nya sendiri. **`/status`** dijawab hanya kalau yang bertanya adalah `chat_id` pemilik karena siapa pun bisa menemukan bot-mu lewat nama penggunanya.
- **`bot.start()`** menjalankan *long polling* (Konsep 9). Ia baru selesai saat bot berhenti, jadi **tidak boleh di-`await`**: backend akan tertahan di baris itu dan tidak pernah sampai ke `app.listen()`. Sebagai gantinya, `.catch` menangkap galat yang menghentikan bot, misalnya token salah (`401`), supaya backend tidak ikut mati. Pilihan **`drop_pending_updates: true`** membuang pesan yang menumpuk saat backend mati supaya `/status` kemarin tidak dijawab hari ini.
- **`bot.catch()`** menangkap galat di dalam penangan perintah (`/start`, `/status`). Tanpanya, galat di sana menghentikan bot.
- **`kabari()`** mengirim satu pesan kepada pemilik dengan `bot.api.sendMessage()`. Kalau `tsBacaan` diberikan, log menulis jeda dari bacaan pemicu sampai server Telegram menerima pesannya. Itulah angka yang kamu periksa untuk syarat lulus. Kegagalan tidak pernah menjatuhkan backend: **`GrammyError`** berarti Telegram menjawab, tetapi menolak (misalnya token dicabut), sedangkan **`HttpError`** berarti server Telegram tidak terjangkau (misalnya internet putus).
- **`kabariKalauPerlu()`** adalah peredam (*debouncing*). Ia memakai **`perluKabari()`** dari Praktik 3, yang sudah diuji, dan menyimpan satu `CatatanKabar` per aturan di sebuah `Map` (pemanasan langkah 1). Pengingat tidak pernah menjadi pesan pertama: kalau backend baru menyala saat kipas sudah menyala, bot diam sampai aturan itu menyalakan kipas lagi (pesan "dipadamkan" pertama sesudah backend dimulai ulang pun tidak dikirim karena catatan awalnya sudah "aman"; kejadiannya tetap tercatat di buku kejadian).
- **`kabariStatus()`** menunda pesan `offline` dengan **`setTimeout`** 60 detik, dan membatalkannya dengan **`clearTimeout`** kalau perangkat kembali `online` sebelum waktunya (pemanasan langkah 4). Pesan `online lagi` hanya dikirim kalau pesan `offline`-nya memang sudah terkirim. Tipe `ReturnType<typeof setTimeout>` di `Map` `tundaOffline` berarti "apa pun yang dikembalikan `setTimeout`", yaitu tiket penunda dari pemanasan langkah 4.
- **`ringkasanStatus()`** menyusun balasan `/status` dari gudang memori (Modul 16). Jam memakai **`Intl.DateTimeFormat`** berzona `Asia/Jakarta`, dan angka memakai koma desimal (`28,5`).
- **`hentikanTelegram()`** dipakai langkah 6.10 untuk berhenti dengan rapi.

Semua pesan berupa teks biasa dengan emoji. Pemformatan khusus Telegram (huruf tebal dan sejenisnya) sengaja tidak dipakai karena tanda baca tertentu di dalamnya harus diberi tanda khusus dan mudah membuat pesan ditolak.

#### 6.5 Sambungkan ke aturan, jadwal, dan status

Bot sudah ada, tetapi belum ada yang menyuruhnya mengabari. Empat file perlu disambungkan.

**`backend/src/services/otomasi.ts`** — tambahkan `import { kabariKalauPerlu } from "./telegram.ts";` di bawah `import { catatKejadian } from "./kejadian.ts";`. Lalu, di fungsi `nilaiBacaan()`, sisipkan cabang `else if` baru di antara `void bertindak(…);` dan `} else if (lama.sejak === null …` sehingga bagian itu menjadi:

```ts
    if (keputusan !== null) {
      void bertindak(a, kondisi, aksi, keputusan, nilai, isi.ts, lama);
    } else if (baru.aktif && aksi.kabari) { // masih menyala: pengingat paling sering 30 menit sekali (perluKabari)
      const [emoji, nama, satuan] = LABEL[kondisi.besaran];
      void kabariKalauPerlu(`aturan:${a.id}`, "bahaya",
        `${emoji} ${nama} masih ${nilai === null ? "-" : angka.format(nilai)}${satuan} — ${aksi.target} tetap menyala (pengingat)`,
        isi.ts, true);
    } else if (lama.sejak === null && baru.sejak !== null) {
```

Cabang ini berjalan untuk setiap bacaan selama aturan masih menyala, tetapi `kabariKalauPerlu()` baru mengirim pengingat kalau sudah 30 menit sejak pesan terakhir. Lalu, di akhir fungsi `bertindak()`, tambahkan dua baris tepat sebelum `}` penutupnya:

```ts
  const pesan = kalimat(kondisi, aksi, nyala, nilai, hasil);
  log.info(`aturan ${a.id} (${a.nama}): ${pesan}`);
  catatKejadian({ device_id: aksi.device_id, jenis: "aturan", sumber: "aturan", aturan_id: a.id, pesan,
    data: { keputusan, nilai, ts_bacaan: tsBacaan, perintah: hasil.id, hasil: hasil.status } });
  // Telegram SESUDAH hasil ack diketahui supaya isi pesannya jujur; jedanya diukur dari bacaan pemicu (tsBacaan)
  if (aksi.kabari) void kabariKalauPerlu(`aturan:${a.id}`, nyala ? "bahaya" : "aman", pesan, tsBacaan);
}
```

Pesan Telegram dikirim **sesudah** jawaban perangkat diketahui. Jadi, isinya jujur: kalau perangkat tidak menjawab, pesannya berbunyi `tidak menjawab`, bukan `dinyalakan`.

**`backend/src/services/jadwal.ts`** — tambahkan `import { kabari } from "./telegram.ts";` di bawah impor `catatKejadian`. Lalu tambahkan baris berikut di **dua** tempat, yaitu di `jalankanJadwal()` tepat di bawah `catatKejadian({ … });` (sebelum `return hasil;`), dan di akhir `jadwalTerlewat()`, juga di bawah `catatKejadian({ … });`:

```ts
  if (a.aksi.kabari) void kabari(pesan);
```

**`backend/src/services/mqtt.ts`** — tambahkan `import { kabari, kabariStatus } from "./telegram.ts";` di bawah `import { catatKejadian } from "./kejadian.ts";`. Di bagian `status`, tambahkan baris `kabariStatus(…)` di dalam `if (!retained) { … }` sehingga blok itu menjadi:

```ts
      if (!retained) { // status retained saat backend menyala = keadaan lama, bukan kejadian baru
        const pesan = hasil.data === "online" ? `${deviceId} tersambung lagi (online)` : `${deviceId} terputus (${hasil.data})`;
        arsip.then(() => catatKejadian({ device_id: deviceId, jenis: "status", sumber: "perangkat", aturan_id: null, pesan }))
          .catch(() => {}); // gagal menyimpan status sudah dicatat gagalArsip
        kabariStatus(deviceId, hasil.data); // Telegram: offline baru dikabarkan kalau bertahan 60 detik
      }
```

Di bagian `vitals`, tambahkan baris `void kabari(…)` di akhir blok laporan mode offline (Praktik 7 memakainya):

```ts
    if (isi.offline_s !== undefined) { // Modul 19: laporan mode offline (kontrak 1.3)
      const pesan = `${deviceId} kembali dari mode offline setelah ${isi.offline_s} detik; `
        + `pengaman lokal menyalakan kipas ${isi.kipas_lokal} kali`;
      log.warn(pesan);
      arsip.then(() => catatKejadian({ device_id: deviceId, jenis: "mode-offline", sumber: "perangkat", aturan_id: null,
        pesan, data: { offline_s: isi.offline_s, kipas_lokal: isi.kipas_lokal } })).catch(() => {});
      void kabari(`📶 ${pesan}`);
    }
```

**`backend/src/server.ts`** — tambahkan `import { mulaiTelegram } from "./services/telegram.ts";` di bawah `import { muatAturan } from "./services/otomasi.ts";`. Lalu tambahkan satu baris tepat **sebelum** `await app.listen(…)`:

```ts
mulaiTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, env.TELEGRAM_API_ROOT); // Modul 19: tidak ditunggu
```

Jalankan `npm run cek` (harus bersih), lalu `npm test`. Ringkasannya masih **`Tests  11 passed (11)`**: bot Telegram tidak mengubah otak aturan, hanya menambah siapa yang dikabari.

#### 6.6 Berkenalan dengan bot-mu: `/start` dan `chat_id`

Pastikan simulator berjalan untuk satu perangkat dan terminal kecil mengikuti `f00d00000001`. Jalankan backend (`npm run dev`). **Hasilnya** (**contoh** dari percobaan lain, jadi jamnya tidak bersambung dengan 6.7–6.10; hanya bagian awalnya, dan di layarmu tertulis nama pengguna bot-mu sendiri):

```text
[09:37:42] INFO: database siap
[09:37:42] INFO: aturan dimuat: 2 aktif dari 3
[09:37:42] INFO: jadwal aturan 2 (Siram pagi) dipasang: "0 6 * * *" Asia/Jakarta, berikutnya 22 Okt 2026, 06.00 WIB
[09:37:42] WARN: TELEGRAM_CHAT_ID belum diisi: kirim /start ke bot untuk mengetahui chat_id-mu
[09:37:42] INFO: Server listening at http://127.0.0.1:8080
[09:37:42] INFO: dokumentasi API: http://127.0.0.1:8080/docs
[09:37:42] INFO: bot Telegram @rumah_pintar_tiruan_bot siap (long polling)
[09:37:42] INFO: tersambung ke broker mqtt://127.0.0.1:1883
```

Baris **`bot Telegram @… siap (long polling)`** berarti tokenmu diterima Telegram. Baris `WARN` di atasnya mengingatkan bahwa `TELEGRAM_CHAT_ID` masih kosong. Urutan baris `bot Telegram … siap` dan `tersambung ke broker` bisa bertukar karena keduanya menunggu jawaban dari jaringan pada saat yang sama.

Sekarang buka bot-mu di Telegram: cari nama penggunanya, atau buka tautan `https://t.me/<username_bot-mu>`. Tekan **Start**. Bot membalas (**contoh**; angkanya milikmu sendiri):

```text
Halo! chat_id kamu: 777000111
Tulis angka ini sebagai TELEGRAM_CHAT_ID di .env backend.
```

Salin angka itu ke `backend/.env`, misalnya `TELEGRAM_CHAT_ID=777000111`, lalu simpan. `npm run dev` mengawasi `.env` juga, jadi backend memulai ulang dengan sendirinya (terminal menulis `Change detected in …` lalu `Restarting 'src/server.ts'`), dan peringatan `TELEGRAM_CHAT_ID belum diisi` tidak muncul lagi. Sebelum angka itu tersimpan, bot belum tahu siapa pemiliknya, jadi `/status` darimu pun dijawab `Maaf, bot ini hanya melayani pemiliknya.`

> 💡 Pesan yang kamu kirim ke bot saat backend mati **dibuang** begitu backend menyala (`drop_pending_updates`). Kalau bot diam setelah kamu menekan **Start**, pastikan dulu log sudah menulis `bot Telegram … siap`, lalu kirim `/start` sekali lagi.

Kirim **`/status`** ke bot-mu. **Hasilnya** (**contoh**):

```text
📋 Rumah Pintar Mini, 07.17 WIB
a4cf12e5b7c0 (node1): online
  suhu 28,5 °C, kelembapan 71 %, tanah 37 %
f00d00000001 (node1): online
  suhu 26,8 °C, kelembapan 76 %, tanah 48 %
  kipas padam, lampu padam, tirai 90°
  sinyal -40 dBm, menyala 0 menit
```

Setiap perangkat yang terdengar sejak backend menyala mendapat satu baris status, lalu bacaan terakhirnya, keadaan aktuator yang dilaporkan (kalau ada), dan `vitals`-nya (kalau sudah ada). Perangkat yang daftarnya lebih pendek, seperti `a4cf12e5b7c0` di contoh ini, memang belum mengirim `state` atau `vitals` sejak backend menyala. Kalau ada temanmu yang mengirim `/status` ke bot-mu, ia hanya mendapat `Maaf, bot ini hanya melayani pemiliknya.`

#### 6.7 Uji syarat lulus: peringatan dalam 10 detik

Aturan **Kipas otomatis** dari Praktik 4 (nomor 1: nyala di atas 30 °C selama 120 detik, padam di bawah 28 °C, `"kabari": true`) dan **Siram pagi** dari Praktik 5 (nomor 2, `"kabari": true`) masih tersimpan. Keduanya kini mengabarimu lewat Telegram.

1. **Picu kipas.** Di terminal simulator, ketik **`suhu 33`** lalu tekan **Enter**. Log backend langsung menulis bahwa hitungan 120 detik dimulai (**contoh**):

   ```text
   [07:11:02] INFO: aturan 1 (Kipas otomatis): suhu 33 di atas 30; kipas dinyalakan kalau bertahan 120 detik
   ```

2. **Tunggu 2 menit.** Kipas menyala, dan dalam detik yang sama pesan Telegram terkirim (**contoh**):

   ```text
   [07:13:02] INFO: perintah c-20261021-001302-2 (aturan) ke f00d00000001: kipas = true, ack ok=true dalam 2 ms
   [07:13:02] INFO: aturan 1 (Kipas otomatis): 🌡️ Suhu 33 °C — kipas dinyalakan otomatis
   [07:13:02] INFO: Telegram terkirim 0,6 detik setelah bacaan 2026-10-21T00:13:02Z: 🌡️ Suhu 33 °C — kipas dinyalakan otomatis
   ```

   HP-mu menerima pesan **`🌡️ Suhu 33 °C — kipas dinyalakan otomatis`**, dan terminal kecil menulis baris `kejadian:` dengan kalimat yang sama. Angka **`0,6 detik`** adalah jeda dari bacaan pemicu (`00:13:02Z` = 07.13.02 WIB) sampai server Telegram menerima pesannya. Angka itu jauh di bawah 10 detik: **syarat lulus ketiga terpenuhi.** Notifikasi di HP biasanya muncul sesaat kemudian. Kalau HP sedang menghemat baterai, notifikasinya bisa terlambat, tetapi pesannya sudah ada di percakapan begitu Telegram dibuka.

3. **Buktikan bot tidak cerewet.** Biarkan suhu tetap 33 °C selama satu atau dua menit. Simulator terus mengirim bacaan setiap 10 detik, tetapi **tidak ada pesan kedua**. Pengingat `… masih 33 °C — kipas tetap menyala (pengingat)` baru dikirim kalau keadaan bahaya bertahan 30 menit. Kamu tidak perlu menunggunya: *unit test* Praktik 3 sudah membuktikan aturan 30 menit itu.

4. **Kembalikan suhu.** Ketik **`suhu 25`**. Begitu bacaan 25 °C tiba, kipas dipadamkan dan pesan Telegram terkirim (**contoh**):

   ```text
   [07:13:34] INFO: perintah c-20261021-001334-3 (aturan) ke f00d00000001: kipas = false, ack ok=true dalam 2 ms
   [07:13:34] INFO: aturan 1 (Kipas otomatis): ✅ Suhu turun ke 25 °C — kipas dipadamkan
   [07:13:34] INFO: Telegram terkirim 0,7 detik setelah bacaan 2026-10-21T00:13:34Z: ✅ Suhu turun ke 25 °C — kipas dipadamkan
   ```

5. **Jadwal.** Di `/docs`, jalankan **`POST /rules/{id}/jalankan`** dengan `id` = `2`. Log menulis (**contoh**):

   ```text
   [07:13:45] INFO: jadwal aturan 2 (Siram pagi) berjalan: pompa = 10 ke f00d00000001
   [07:13:45] INFO: perintah c-20261021-001345-4 (jadwal) ke f00d00000001: pompa = 10, ack ok=true dalam 4 ms
   [07:13:45] INFO: jadwal aturan 2: 🚿 Siram pagi: pompa menyala 10 detik
   [07:13:45] INFO: POST /rules/2/jalankan -> 200 (16 ms)
   [07:13:45] INFO: Telegram terkirim: 🚿 Siram pagi: pompa menyala 10 detik
   ```

   Pesan jadwal tidak dipicu bacaan, jadi log tidak menulis jedanya. Pukul 06.00 WIB besok, pesan yang sama datang sendiri.

#### 6.8 Uji pesan `offline`: tunggu 60 detik

1. **Putus lama.** Hentikan simulator (**Ctrl + C** di terminalnya). Terminal kecil langsung menulis `f00d00000001 sekarang offline`, tetapi Telegram diam dulu. Setelah 60 detik, log menulis (**contoh**):

   ```text
   [07:15:05] INFO: Telegram terkirim: 📴 f00d00000001 offline sejak 07.14 WIB
   ```

2. **Sambung lagi.** Jalankan lagi simulatornya (`node simulator-perangkat.js mqtt://127.0.0.1:1883 1`). Log menulis (**contoh**):

   ```text
   [07:15:21] WARN: f00d00000001 baru menyala ulang (uptime 0 detik): keinginan server dicocokkan lagi
   [07:15:21] INFO: ack c-20261021-000952-1 tiba, tetapi tidak ada perintah yang menunggunya
   [07:15:21] INFO: Telegram terkirim: ✅ f00d00000001 online lagi (offline 1 menit)
   ```

   Baris `ack … tidak ada perintah yang menunggunya` itu wajar. Simulator yang baru menyala menerima lagi `config` *retained* dari broker dan menjawabnya, padahal backend sudah lama selesai menunggu jawaban itu.

3. **Putus sebentar.** Hentikan simulator lagi, lalu jalankan kembali **sebelum** 60 detik, misalnya setelah 20 detik. Terminal kecil menulis `offline` lalu `online`, tetapi Telegram **tidak** menerima apa-apa. WiFi yang berkedip tidak membangunkan siapa pun.

#### 6.9 Kalau Telegram bermasalah, rumah tetap jalan

Telegram hanya pembawa kabar. Kalau ia bermasalah, aturan, jadwal, dan perintah harus tetap berjalan. Buktikan sendiri: di `backend/.env`, ubah **satu huruf** di `TELEGRAM_BOT_TOKEN`, lalu simpan. Backend memulai ulang, dan log menulis (**contoh**):

```text
[07:19:31] INFO: Server listening at http://127.0.0.1:8080
[07:19:31] INFO: dokumentasi API: http://127.0.0.1:8080/docs
[07:19:31] INFO: tersambung ke broker mqtt://127.0.0.1:1883
[07:19:31] INFO: config c-20261021-001931-1 ke f00d00000001: suhu_kipas_on 30 dari aturan 1 (retained)
[07:19:31] ERROR: bot Telegram berhenti: Call to 'getMe' failed! (401: Unauthorized)
[07:19:31] INFO: config c-20261021-001931-1 ke f00d00000001: ack ok=true
```

Bot berhenti, tetapi server, broker, dan `config` tetap jalan. Kembalikan token yang benar, simpan, dan baris `bot Telegram @… siap` muncul lagi. Tabel berikut merangkum baris `ERROR` itu dan tiga baris lain yang muncul saat penulis menguji. Tidak satu pun menghentikan backend:

| Baris log | Artinya | Yang dilakukan |
| :--- | :--- | :--- |
| `bot Telegram berhenti: Call to 'getMe' failed! (401: Unauthorized)` | Token di `.env` salah sejak backend menyala. | Salin ulang token dari @BotFather, simpan `.env`. |
| `bot Telegram berhenti: Call to 'getUpdates' failed! (401: Unauthorized)` | Token dicabut saat backend sedang berjalan, misalnya kamu membuat token baru lewat `/token`. | Tulis token baru di `.env`, simpan. Bot yang sudah berhenti tidak menyala sendiri sampai backend dimulai ulang. |
| `Telegram menolak pesan: Unauthorized` | Pesan tidak terkirim karena token tidak berlaku lagi. Perintahnya sendiri tetap terkirim ke perangkat. | Sama dengan baris di atasnya. |
| `server Telegram tidak terjangkau: Network request for 'sendMessage' failed!` | Internet laptop putus, atau server Telegram tidak bisa dihubungi. | Periksa internet. Pesan yang gagal tidak dikirim ulang, tetapi kejadiannya tetap tercatat di buku kejadian (tabel `events`). |

#### 6.10 Berhenti dengan rapi

Mulai minggu ini, backend memegang banyak hal yang masih "terbuka": pertanyaan *long polling* ke Telegram, juru jadwal node-cron, klien Socket.IO, sambungan MQTT, dan kolam sambungan database. Saat kamu menekan **Ctrl + C**, Node.js biasanya langsung mematikan semuanya di tengah jalan. Lebih sopan kalau backend menutupnya satu per satu: bot mengonfirmasi pesan terakhir ke Telegram, jadwal yang sedang berjalan ditunggu sampai selesai, dan klien Socket.IO diberi tahu bahwa server pamit.

Buka **`backend/src/services/mqtt.ts`** dan tambahkan fungsi ini tepat di bawah fungsi `brokerTersambung()`:

```ts
// Modul 19: berhenti dengan rapi — kirim DISCONNECT ke broker lalu tutup sambungan
export async function hentikanMqtt(): Promise<void> {
  await klien?.endAsync();
}
```

Lalu buka **`backend/src/server.ts`** dan ganti seluruh isinya dengan versi ini:

```ts
// server.ts - pintu masuk backend Rumah Pintar Mini v0.3 (Modul 18: riwayat bisa diringkas per 15 menit, jam, dan hari).
// Jalankan: npm run dev (otomatis mulai ulang saat file disimpan) atau npm start.
import Fastify, { LogController } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env.ts";
import { ruteKesehatan } from "./routes/kesehatan.ts";
import { rutePerangkat } from "./routes/perangkat.ts";
import { ruteAturan } from "./routes/aturan.ts";
import { hentikanMqtt, mulaiMqtt } from "./services/mqtt.ts";
import { mulaiRealtime } from "./services/realtime.ts";
import { muatAturan } from "./services/otomasi.ts";
import { hentikanJadwal } from "./services/jadwal.ts";
import { hentikanTelegram, mulaiTelegram } from "./services/telegram.ts";
import { pakaiLog } from "./services/log.ts";
import { databaseHidup } from "./db/arsip.ts";
import { pool } from "./db/pool.ts";

const app = Fastify({
  logger: { transport: { target: "pino-pretty", options: { translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,reqId" } } },
  logController: new LogController({ disableRequestLogging: true }), // log bawaan per permintaan terlalu panjang...
});
pakaiLog(app.log); // Modul 19: layanan lain (perintah, aturan, jadwal, Telegram) menulis ke log yang sama
app.addHook("onResponse", async (req, reply) => {
  // ...jadi diganti satu baris per permintaan (hook = "middleware" Fastify)
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
app.setValidatorCompiler(validatorCompiler); // skema Zod memeriksa isi permintaan...
app.setSerializerCompiler(serializerCompiler); // ...dan bentuk jawaban

await app.register(swagger, {
  openapi: { info: { title: "Rumah Pintar Mini API", description: "Backend v0.3 (Modul 18)", version: "0.3.0" } },
  transform: jsonSchemaTransform, // skema Zod yang sama menjadi dokumentasi OpenAPI
});
await app.register(swaggerUi, { routePrefix: "/docs" });
await app.register(ruteKesehatan);
await app.register(rutePerangkat);
await app.register(ruteAturan); // Modul 19

if (await databaseHidup()) app.log.info("database siap");
else app.log.warn("database belum bisa dihubungi: periksa kontainer database dan DATABASE_URL di .env");
try {
  await muatAturan(); // Modul 19: aturan otomatis dari tabel rules
} catch (galat) {
  app.log.error(`aturan otomatis belum bisa dimuat: ${(galat as Error).message}`);
}
mulaiRealtime(app); // Modul 19: Socket.IO di alamat /socket.io/
mulaiMqtt(env.MQTT_URL, app.log);
mulaiTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, env.TELEGRAM_API_ROOT); // Modul 19: tidak ditunggu
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`dokumentasi API: http://${env.HOST}:${env.PORT}/docs`);

// Modul 19: berhenti dengan rapi saat Ctrl + C (SIGINT) atau SIGTERM. Begitu sinyal ini punya pendengar, Ctrl + C tidak
// lagi mematikan Node.js, jadi semua yang masih terbuka ditutup satu per satu, lalu process.exit(0).
async function berhenti(sinyal: string): Promise<void> {
  app.log.info(`${sinyal} diterima: backend berhenti dengan rapi`);
  try {
    await hentikanTelegram(); // konfirmasi update terakhir ke Telegram
    await hentikanJadwal(); // node-cron: tunggu tugas yang sedang berjalan
    await app.close(); // preClose memutus klien Socket.IO, lalu server HTTP ditutup
    await hentikanMqtt(); // DISCONNECT ke broker
    await pool.end(); // tutup kolam sambungan database
  } catch (galat) {
    app.log.error(`gagal berhenti dengan rapi: ${(galat as Error).message}`);
  }
  app.log.info("backend berhenti");
  process.exit(0);
}
process.once("SIGINT", () => void berhenti("SIGINT"));
process.once("SIGTERM", () => void berhenti("SIGTERM"));
```

Yang baru ada di bagian bawah:

- **`process.once("SIGINT", …)`** mendengarkan sinyal **Ctrl + C**, dan `SIGTERM` adalah sinyal "tolong berhenti" yang dikirim program lain. `once` berarti hanya sekali: kalau berhenti dengan rapi ternyata macet, **Ctrl + C** kedua mematikan backend seperti biasa.
- **`berhenti()`** menutup semuanya satu per satu: bot Telegram, juru jadwal, server HTTP beserta Socket.IO, MQTT, lalu database.
- **`process.exit(0)`** mengakhiri program dengan pasti. Begitu `SIGINT` punya pendengar, **Ctrl + C** tidak lagi mematikan Node.js; program baru selesai sendiri kalau tidak ada lagi yang terbuka. Satu saja yang tertinggal, misalnya penunda pesan `offline` yang masih menghitung 60 detik, membuat backend tetap hidup sampai urusan itu selesai, bahkan masih mengirim Telegram sesudah menulis `backend berhenti`. Dengan `process.exit(0)`, sisa urusan seperti itu tidak ditunggu.

Hentikan dulu `npm run dev` yang masih berjalan sejak 6.6 (**Ctrl + C** di terminal pertama). Di terminal yang sama, jalankan `npm run cek`, kemudian jalankan backend dengan **`npm start`** (bukan `npm run dev`). Tunggu sampai terminal kecil mengikuti `f00d00000001`, lalu tekan **Ctrl + C** di terminal backend. **Hasilnya** (**contoh**):

```text
[07:24:52] INFO: SIGINT diterima: backend berhenti dengan rapi
[07:24:52] INFO: klien realtime terputus: 3TaGCuwqDEdX8ph4AAAA (server namespace disconnect)
[07:24:52] INFO: backend berhenti
```

Terminal kecil menulis `terputus: io server disconnect`, yaitu tanda backend pamit dengan sengaja, lalu terus mencoba menyambung lagi sampai backend dijalankan kembali.

Mengapa harus `npm start`? Di Windows, `npm run dev` (mode `--watch`) mematikan backend seketika saat **Ctrl + C** ditekan, tanpa melewati `berhenti()`. Baris `SIGINT diterima` tidak muncul, dan terminal kecil menulis `terputus: transport close`. Akibatnya kecil: saat dinyalakan lagi, backend membuang pesan Telegram yang menumpuk, mengirim ulang `config` ambang, dan membaca keadaan kipas yang dilaporkan perangkat supaya kipas tetap dipadamkan pada waktunya (`ingatanAwal()`, Praktik 4). Penulis belum menguji perilaku `npm run dev` di macOS dan Linux. Kebiasaan yang baik: **`npm run dev`** saat mengubah kode, **`npm start`** saat backend dijalankan untuk dipakai, misalnya semalaman.

#### 6.11 Simpan ke cabang

```text
cd ..
git status
```

Pastikan daftar perubahan **tidak** menyebut `backend/.env`. File itu berisi tokenmu dan sudah diabaikan Git sejak Modul 16. Lalu:

```text
git add backend
git commit -m "Bot Telegram grammY: peringatan, /start, /status, berhenti dengan rapi (Modul 19 Praktik 6)"
```

> ⬆️ **Selesai Praktik 6?** Kembali ke [Konsep 10](#10-pengaman-lokal-node-1-menjaga-rumah-saat-server-hilang) sebelum Praktik 7.

### Praktik 7 — Pengaman lokal di Node 1 (60 menit)

> 🖥️ **Alat yang dipakai:** **Arduino IDE** dengan `node-1-rumah.ino` dari repositori `rumah-pintar-mini` (jalur perangkat) atau proyek **Wokwi** Node 1-mu (jalur Wokwi), browser untuk membuka file kurikulum di GitHub, dan **VS Code** untuk backend, simulator, dan terminal kecil. Jalur Wokwi juga memakai **MQTTX** dengan sambungan **Broker publik** dari Modul 11. Konsep yang dipakai: Konsep 10.
>
> ⭐ **Wajib** — syarat lulus kedua: perangkat tetap bereaksi saat broker dimatikan.
>
> 🖥️ **Tiga jalur, satu firmware.** Semua pembaca mengerjakan langkah 7.1–7.6 supaya firmware di repositorimu menjadi v1.5.0. **Jalur perangkat** mengunggahnya ke Node 1 (7.7) lalu mencabut kabel LAN Pi (7.9). **Jalur Wokwi** menjalankannya di Wokwi (7.7W) lalu memakai perintah `uji offline` (7.8W). **Jalur laptop** (tanpa perangkat dan tanpa uji di Wokwi) cukup memeriksa firmware dengan tombol **Verify** di Arduino IDE (tanpa papan pun bisa asalkan paket esp32 dan library Node 1 dari Modul 10–15 sudah terpasang; kalau belum, salin file yang berubah ke proyek Wokwi Node 1-mu seperti petunjuk jalur Wokwi di bawah, lalu klik **▶** supaya Wokwi mengompilasinya), lalu membuktikan syarat lulusnya dengan simulator di 7.10. Jam `[00:00:13]` di Serial Monitor adalah lama Node 1 menyala, bukan jam dinding.

Node 1 v1.5.0 menjalankan Konsep 10: menerima ambang kipas dari server lewat `config` dan menyimpannya di NVS, masuk mode offline setelah broker hilang 2 menit, menyalakan kipas sendiri selama mode offline, lalu melapor lewat `vitals` setelah tersambung lagi. Ia juga menulis `state` di setiap `telemetry` (kontrak 1.3) dan mendapat perintah Serial baru, `uji offline`.

Node 1 v1.5.0 = v1.4.0 + perubahan di dua belas file, tanpa file baru dan tanpa library baru:

| File | Perubahan | Cara |
| :--- | :--- | :--- |
| `konfigurasi.h` | versi `1.5.0`, enam angka untuk pengaman lokal dan mode offline | ketik (langkah 7.1) |
| `pengaturan.h` / `.cpp` | ambang `suhu_kipas_on` di NVS | ketik (langkah 7.2) |
| `aktuator.h` / `.cpp` | tanda pemilik kipas | ketik (langkah 7.3) |
| `aturan.h` / `.cpp` | kipas pengaman | ketik (langkah 7.4) |
| `jaringan.h` | tiga fungsi baru | ketik (langkah 7.5) |
| `jaringan.cpp` | `config`, mode offline, laporan, `state`, dan `uji offline` | salin dari kurikulum (langkah 7.5) |
| `perintah.cpp`, `layar.cpp`, `node-1-rumah.ino` | `ambang` mencetak dua baris, perintah `uji offline`, `MODE OFFLINE` di OLED, dan komentar | ketik (langkah 7.6) |

**Jalur Wokwi:** kerjakan perubahannya di VS Code pada folder `firmware/node-1-rumah` repositorimu, lalu salin isi setiap file yang berubah ke tab bernama sama di proyek Wokwi Node 1-mu (`node-1-rumah.ino` ke tab `sketch.ino`). **Kecuali `konfigurasi.h`:** di tab Wokwi, ulangi saja dua perubahan langkah 7.1 supaya `PAKAI_WOKWI = true` milik Wokwi tidak tertimpa.

#### 7.1 `konfigurasi.h`

1. Ubah nomor versinya:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.4.0";
   ```

   menjadi:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.5.0";
   ```

2. Di **paling bawah** file, setelah baris `JEDA_BACA_RS485_LAMBAT`, sisakan satu baris kosong, lalu tambahkan:

   ```cpp
   // ---------- Modul 19: aturan pengaman lokal dan mode offline ----------
   // Ambang kipas dikirim server lewat perintah "config" dan disimpan di NVS (label "suhu_kipas_on").
   const float SUHU_KIPAS_ON_BAWAAN = 30.0;          // Lampiran A: "suhu_kipas_on"; dipakai selama NVS belum berisi ambang
   const float SUHU_KIPAS_MIN = 15.0;                // config dengan suhu_kipas_on di luar 15-45 °C ditolak
   const float SUHU_KIPAS_MAKS = 45.0;
   const float SELISIH_KIPAS = 2.0;                  // kipas pengaman padam di bawah suhu_kipas_on - 2 °C (histeresis)
   const unsigned long BATAS_MODE_OFFLINE = 120000;  // broker tak terjangkau 2 menit terus-menerus = mode offline
   const unsigned long LAMA_UJI_OFFLINE = 180000;    // perintah "uji offline": broker dianggap hilang selama 3 menit
   ```

   `SUHU_KIPAS_ON_BAWAAN` dipakai selama server belum pernah mengirim ambang. `SELISIH_KIPAS` adalah histeresis pengaman: dengan ambang 30 °C, kipas menyala di atas 30 °C dan padam di bawah 28 °C, sama dengan aturan server. Dua angka terakhir adalah 2 menit sebelum mode offline dan 3 menit lama perintah `uji offline`, dalam milidetik.

#### 7.2 `pengaturan.h` dan `pengaturan.cpp`

1. Di **`pengaturan.h`**, di bawah baris `void simpanSensorRS485Dipakai(bool pakai);`, tambahkan:

   ```cpp
   float ambangSuhuKipas();                    // Modul 19: kipas pengaman menyala di atas angka ini (°C)
   bool ambangSuhuKipasDariNvs();              // Modul 19: true kalau angka itu dari NVS (dikirim server lewat config)
   bool simpanAmbangSuhuKipas(float derajat);  // Modul 19: menjawab false kalau di luar SUHU_KIPAS_MIN-SUHU_KIPAS_MAKS
   ```

2. Di **`pengaturan.cpp`**, di bawah baris `static bool pakaiRS485 = false;`, tambahkan:

   ```cpp
   static float suhuKipas = SUHU_KIPAS_ON_BAWAAN;  // Modul 19: ambang kipas pengaman, dalam °C
   ```

3. Masih di `pengaturan.cpp`, di fungsi `muatPengaturan()`, tepat di bawah baris `pakaiRS485 = arsip.getBool("rs485", false);`, tambahkan:

   ```cpp
     suhuKipas = arsip.getFloat("suhu_kipas_on", SUHU_KIPAS_ON_BAWAAN);  // Modul 19
     asal = "angka bawaan";
     if (ambangSuhuKipasDariNvs()) {
       asal = "dari NVS";
     }
     logInfo("Ambang suhu_kipas_on: %.1f C (%s)", suhuKipas, asal);
   ```

4. Di **paling bawah** `pengaturan.cpp`, setelah fungsi `simpanSensorRS485Dipakai()`, tambahkan:

   ```cpp

   float ambangSuhuKipas() {
     return suhuKipas;
   }

   bool ambangSuhuKipasDariNvs() {
     return arsip.isKey("suhu_kipas_on");  // 13 huruf: masih di bawah batas 15 huruf
   }

   bool simpanAmbangSuhuKipas(float derajat) {
     if (!(derajat >= SUHU_KIPAS_MIN && derajat <= SUHU_KIPAS_MAKS)) {  // ditulis begini supaya NAN ikut ditolak
       return false;
     }
     if (derajat == suhuKipas && ambangSuhuKipasDariNvs()) {
       return true;  // angkanya sudah sama: tidak perlu menulis ulang (jumlah tulis flash terbatas)
     }
     arsip.putFloat("suhu_kipas_on", derajat);
     suhuKipas = derajat;
     logInfo("Ambang suhu_kipas_on disimpan ke NVS: %.1f C", suhuKipas);
     return true;
   }
   ```

Polanya sama dengan ambang `tanah_siram` di Modul 8: label baru `suhu_kipas_on` di map `node1`, kali ini berisi angka pecahan (`getFloat` dan `putFloat`). `simpanAmbangSuhuKipas()` menolak angka di luar 15–45 °C, termasuk `NAN` (bukan angka), dan hanya menulis ke NVS kalau angkanya berubah karena jumlah penulisan *flash* terbatas.

#### 7.3 `aktuator.h` dan `aktuator.cpp`

1. Di **`aktuator.h`**, ganti baris `void aturKipas(bool nyala);` dengan dua baris ini:

   ```cpp
   void aturKipas(bool nyala);                   // perintah manual (Serial Monitor) atau dari server
   void aturKipasPengaman(bool nyala);           // Modul 19: khusus untuk aturan pengaman lokal
   ```

   Lalu, di bawah baris `bool kipasMenyala();`, tambahkan:

   ```cpp
   bool kipasDariPengaman();  // Modul 19: true kalau kipas yang menyala itu dinyalakan aturan pengaman lokal
   ```

2. Di **`aktuator.cpp`**, di bawah baris `static bool kipas = false;`, tambahkan:

   ```cpp
   static bool kipasMilikPengaman = false;  // Modul 19: true kalau kipas dinyalakan aturan pengaman lokal
   ```

3. Masih di `aktuator.cpp`, ganti seluruh fungsi `aturKipas()` dengan dua fungsi ini:

   ```cpp
   void aturKipas(bool nyala) {
     kipas = nyala;
     kipasMilikPengaman = false;  // Modul 19: perintah manual atau dari server: kipas bukan lagi milik pengaman
     tulisRelay(PIN_RELAY_KIPAS, nyala);
   }

   void aturKipasPengaman(bool nyala) {
     kipas = nyala;
     kipasMilikPengaman = nyala;
     tulisRelay(PIN_RELAY_KIPAS, nyala);
   }
   ```

4. Di bawah fungsi `kipasMenyala()`, tambahkan:

   ```cpp

   bool kipasDariPengaman() {
     return kipasMilikPengaman;
   }
   ```

Inilah prinsip **"yang menyalakan, dia yang memadamkan"** dalam kode, persis seperti catatan "lampu ini milik aturan otomatis" (`lampuMilikOtomatis`) untuk lampu otomatis sejak Modul 6. `aturKipasPengaman()` mencatat bahwa kipas dinyalakan pengaman. `aturKipas()`, yang dipakai perintah Serial dan perintah dari server, selalu menghapus catatan itu: begitu ada perintah kipas, kipas pindah ke tangan si pemberi perintah.

#### 7.4 `aturan.h` dan `aturan.cpp`

1. Di **`aturan.h`**, ganti baris pertama dengan:

   ```cpp
   // aturan.h - aturan otomatis lokal Node 1: siram otomatis, lampu otomatis (Modul 6), dan kipas pengaman (Modul 19)
   ```

2. Di **`aturan.cpp`**, di bawah baris `#include "aktuator.h"`, tambahkan:

   ```cpp
   #include "jaringan.h"  // Modul 19: modeOffline() dan catatKipasLokal()
   ```

3. Masih di `aturan.cpp`, tepat **di atas** baris `void jalankanAturan(BacaanSensor b) {`, tambahkan:

   ```cpp
   // ---------- Kipas pengaman lokal (Modul 19) ----------
   // Biasanya server yang mengatur kipas. Pengaman ini hanya MENYALAKAN kipas dalam mode offline (broker tak terjangkau
   // lebih dari 2 menit). Kipas yang ia nyalakan sendiri juga ia padamkan sendiri di bawah suhu_kipas_on - 2 °C, walaupun
   // broker sudah terjangkau lagi, kecuali server atau kamu sudah mengambil alih kipas itu dengan perintah kipas.
   static void kipasPengaman(BacaanSensor b) {
     if (isnan(b.suhu)) {
       return;  // DHT22 gagal dibaca: jangan menebak, biarkan kipas apa adanya
     }
     float batasNyala = ambangSuhuKipas();
     float batasPadam = batasNyala - SELISIH_KIPAS;
     if (modeOffline() && !kipasMenyala() && b.suhu > batasNyala) {
       logInfo("Pengaman lokal: suhu %.1f C di atas %.1f C, kipas dinyalakan.", b.suhu, batasNyala);
       aturKipasPengaman(true);
       catatKipasLokal();  // dihitung untuk laporan mode offline
     } else if (kipasDariPengaman() && b.suhu < batasPadam) {
       logInfo("Pengaman lokal: suhu %.1f C di bawah %.1f C, kipas dipadamkan.", b.suhu, batasPadam);
       aturKipasPengaman(false);
     }
   }

   ```

4. Di dalam `jalankanAturan()`, ganti baris catatan `// Modul 19 menambahkan kipas otomatis (Lampiran A: "suhu_kipas_on")` dengan:

   ```cpp
     kipasPengaman(b);  // Modul 19 (Lampiran A: "suhu_kipas_on")
   ```

   Baris catatan itu sudah menunggu sejak Modul 6: kini tempatnya diisi.

`kipasPengaman()` dipanggil untuk setiap bacaan, sekitar setiap 2 detik, bersama siram otomatis dan lampu otomatis. Ia hanya **menyalakan** kipas dalam mode offline, dan hanya kalau kipas sedang padam dan suhu **di atas** ambang. Ia **memadamkan** kipas hanya kalau kipas itu miliknya dan suhu sudah di bawah ambang − 2, juga sesudah broker kembali. Kalau DHT22 gagal dibaca (`isnan`), pengaman diam dan tidak menebak.

#### 7.5 `jaringan.h` dan `jaringan.cpp`

1. Di **paling bawah** **`jaringan.h`**, tambahkan:

   ```cpp
   bool modeOffline();                    // Modul 19: true selama broker tak terjangkau lebih dari 2 menit
   void catatKipasLokal();                // Modul 19: dipanggil pengaman setiap kali menyalakan kipas (untuk laporan)
   void mulaiUjiOffline();                // Modul 19: perintah Serial "uji offline"
   ```

2. **`jaringan.cpp`** berubah di banyak tempat, jadi isinya diganti seluruhnya. Buka [`kode/firmware/node-1-rumah/jaringan.cpp`](kode/firmware/node-1-rumah/jaringan.cpp) di tab baru browser, klik ikon **Copy raw file**, kembali ke Arduino IDE (jalur Wokwi: VS Code), buka `jaringan.cpp`, tekan **Ctrl + A**, lalu tempel (**Ctrl + V**). Penggantian ini aman: alamat broker Pi-mu tersimpan di `konfigurasi.h`, bukan di `jaringan.cpp`.

Yang baru di `jaringan.cpp`:

- **`kerjakanConfig()`** menjalankan perintah `config`. Semua ambang diperiksa dulu: kunci lain selain `suhu_kipas_on` dan `tanah_siram`, tipe yang salah, atau angka di luar rentang membuat seluruh perintah ditolak dengan `ack` `ok:false`. Baru kalau semuanya sah, ambang disimpan ke NVS. `config` *retained* yang datang lagi setiap kali Node 1 menyambung dikenali dari `id`-nya dan tidak dikerjakan dua kali selama Node 1 menyala (sesudah *restart*, ingatan `id` kosong, jadi `config` itu dikerjakan sekali lagi tanpa menulis ulang NVS; lihat 7.8).
- **`jagaModeOffline()`** menghitung sudah berapa lama broker tak terjangkau sejak sambungan terakhir, lalu mengatur keluar-masuk mode offline:

  ```cpp
  // Modul 19: mode offline = WiFi atau broker tak terjangkau terus-menerus selama BATAS_MODE_OFFLINE, dihitung dari saat
  // terakhir tersambung. Selama mode offline, aturan pengaman kipas (aturan.cpp) bekerja sendiri.
  static void jagaModeOffline() {
    unsigned long sekarang = millis();
    if (mqttSiap()) {
      waktuTerakhirSiap = sekarang;
      if (offline) {
        offline = false;
        waktuSelesaiOffline = sekarang;
        unsigned long lama = (sekarang - waktuMasukOffline) / 1000;
        laporanDetik += lama;  // dijumlahkan: kalau vitals belum sempat terkirim, mode offline berikutnya ikut dihitung
        laporanKipas += kipasLokal;
        laporanMenunggu = true;  // ikut vitals pertama sesudah tersambung, TUNDA_LAPORAN kemudian (jagaMqtt)
        logInfo("MODE OFFLINE SELESAI setelah %lu detik: broker terjangkau lagi. Pengaman menyalakan kipas %u kali.", lama,
                kipasLokal);
      }
      return;
    }
    if (!offline && sekarang - waktuTerakhirSiap >= BATAS_MODE_OFFLINE) {
      offline = true;
      waktuMasukOffline = sekarang;
      kipasLokal = 0;
      logError("MODE OFFLINE: broker tak terjangkau %lu detik. Pengaman lokal bekerja: kipas menyala di atas %.1f C.",
               BATAS_MODE_OFFLINE / 1000, ambangSuhuKipas());
    }
  }
  ```

- **Laporan ditunda 10 detik.** `vitals` pertama sesudah mode offline membawa `offline_s` dan `kipas_lokal`, tetapi baru dikirim 10 detik setelah tersambung (Konsep 10):

  ```cpp
      // Modul 19: sesudah mode offline, vitals pertama (yang membawa laporan) menunggu TUNDA_LAPORAN dulu. Server biasanya
      // ikut kehilangan broker dan baru menyambung lagi beberapa detik kemudian. vitals tidak retained, jadi laporan yang
      // terbit sebelum server berlangganan lagi tidak akan pernah sampai.
      bool laporanMenungguServer = laporanMenunggu && millis() - waktuSelesaiOffline < TUNDA_LAPORAN;
      if (!laporanMenungguServer && (!sudahKirimVitals || millis() - waktuVitalsTerakhir >= JEDA_VITALS)) {
        kirimVitals();
      }
  ```

- **`tulisKeadaan()`** menulis objek `state` yang sama persis ke `ack` dan ke setiap `telemetry`. Perubahan kipas, lampu, pompa, atau sudut tirai kini juga memicu kiriman segera, misalnya `Terbit telemetry (kipas menyala)`.
- **`mulaiUjiOffline()`** memutus sambungan broker tanpa pamit (broker pun langsung menerbitkan wasiat `offline`), lalu menahan Node 1 supaya tidak menyambung lagi selama 3 menit. Perintah `restart` menghentikan uji ini lebih awal.
- **Khusus Wokwi** (`PAKAI_WOKWI`), alamat IP broker publik disimpan begitu tersambung. Di Wokwi, mencari alamat `broker.emqx.io` lewat DNS setelah lama putus bisa memakan lebih dari 5 detik, dan *watchdog* (Modul 8) pun me-*restart* Node 1. Dengan alamat yang disimpan, sambung ulang tidak perlu DNS lagi. Jalur perangkat memakai alamat IP Pi, jadi tidak terkena.
- Wadah JSON diperbesar: `telemetry` dari 256 menjadi 320 byte untuk `state`, dan `vitals` dari 128 menjadi 192 byte untuk laporan mode offline. Ukurannya diukur penulis di ESP32 (Wokwi): `telemetry` terpanjang yang masuk akal 242 byte (kasus terburuk dengan angka pecahan yang panjang mencapai 253 byte, nyaris memenuhi wadah lama yang hanya 256 byte), dan `vitals` berlaporan paling panjang 129 byte.

#### 7.6 `perintah.cpp`, `layar.cpp`, dan `node-1-rumah.ino`

1. Di **`perintah.cpp`**, di fungsi `cetakAmbang()`, di bawah baris `Serial.printf("ambang: tanah_siram = %d %% (%s)\n", ambangTanahSiram(), asal);`, tambahkan:

   ```cpp
     asal = "angka bawaan";  // Modul 19: ambang kipas pengaman, dikirim server lewat config
     if (ambangSuhuKipasDariNvs()) {
       asal = "dari NVS";
     }
     Serial.printf("ambang: suhu_kipas_on = %.1f C (%s); kipas pengaman padam di bawah %.1f C\n", ambangSuhuKipas(), asal,
                   ambangSuhuKipas() - SELISIH_KIPAS);
   ```

2. Masih di `perintah.cpp`, cari baris `} else if (perintah == "restart") {`, lalu sisipkan **di atasnya**:

   ```cpp
     } else if (perintah == "uji offline") {
       mulaiUjiOffline();  // Modul 19: latihan broker hilang selama 3 menit
       return;
   ```

3. Di daftar perintah paling bawah, ubah baris `Serial.println("kirim, node2, node2 nol, rs485, rs485 on, rs485 off, restart");` menjadi:

   ```cpp
       Serial.println("kirim, node2, node2 nol, rs485, rs485 on, rs485 off, uji offline, restart");
   ```

4. Di **`layar.cpp`**, ubah catatan di baris `#include "jaringan.h"` menjadi:

   ```cpp
   #include "jaringan.h"  // Modul 10: teksJaringan(); Modul 19: modeOffline()
   ```

   Lalu, di fungsi `gambarHalamanStatus()`, ganti baris `snprintf(teks, sizeof(teks), "WiFi %s", teksJaringan());` beserta catatannya dengan:

   ```cpp
     if (modeOffline()) {
       snprintf(teks, sizeof(teks), "MODE OFFLINE");  // Modul 19: broker tak terjangkau lebih dari 2 menit
     } else {
       snprintf(teks, sizeof(teks), "WiFi %s", teksJaringan());  // Modul 11: misalnya "WiFi ok, MQTT ok"
     }
   ```

5. Di **`node-1-rumah.ino`**, ganti baris pertama dengan:

   ```cpp
   // Node 1 "Rumah" - firmware v1.5.0 (Modul 19: aturan pengaman lokal dan mode offline)
   ```

   Di atas baris `// Baru di v1.4.0: …`, sisipkan:

   ```cpp
   // Baru di v1.5.0: Node 1 menerima perintah "config" dari server: ambang suhu_kipas_on dan tanah_siram, disimpan di
   // NVS. Kalau broker tak terjangkau lebih dari 2 menit (mode offline), pengaman lokal menyalakan kipas sendiri di atas
   // suhu_kipas_on dan memadamkannya di bawah suhu_kipas_on - 2 C; laporannya ikut vitals pertama, 10 detik sesudah
   // tersambung lagi. telemetry kini membawa keadaan keempat aktuator (state) dan terbit segera saat aktuator berubah
   // (kontrak data 1.3). Perintah "uji offline" melatih semua itu tanpa mencabut kabel.
   ```

   Lalu, di daftar perintah, ubah baris `// rs485, rs485 on, rs485 off, restart.` menjadi:

   ```cpp
   // rs485, rs485 on, rs485 off, uji offline, restart.
   ```

#### 7.7 Unggah (jalur perangkat)

1. Pastikan papan yang terpilih adalah **ESP32 Dev Module**, dengan **Partition Scheme** **Minimal SPIFFS** dan **Flash Mode** **DIO**, dan port papan **Node 1**. Klik **Upload**. Arduino IDE menulis kira-kira:

   ```text
   Sketch uses 1191524 bytes (60%) of program storage space. Maximum is 1966080 bytes.
   Global variables use 56572 bytes (17%) of dynamic memory, leaving 271108 bytes for local variables. Maximum is 327680 bytes.
   ```

   Ukurannya sekitar 4,8 kilobyte lebih besar daripada v1.4.0 dan masih jauh dari batasnya.

2. Buka Serial Monitor Node 1. Di antara baris-baris awalnya ada (**rekaman uji Wokwi**):

   ```text
   [00:00:02] INFO  Node 1 Rumah - firmware 1.5.0
   [00:00:02] INFO  Alasan restart terakhir: POWERON
   [00:00:02] INFO  Nyala ke-1. Ambang tanah_siram: 30 % (angka bawaan)
   [00:00:02] INFO  Ambang suhu_kipas_on: 30.0 C (angka bawaan)
   ```

   Di papan asli, angka di baris `Nyala ke-…` tentu lebih dari 1, dan ambang `tanah_siram` adalah ambang milikmu dari Modul 8.

Gagal kompilasi dengan `'ambangSuhuKipas' was not declared in this scope`? Baris di `pengaturan.h` (langkah 7.2) terlewat. Pesan serupa untuk `aturKipasPengaman` atau `kipasDariPengaman` berarti baris di `aktuator.h` terlewat (langkah 7.3), dan untuk `modeOffline`, `catatKipasLokal`, atau `mulaiUjiOffline`, baris di `jaringan.h` (langkah 7.5) atau `#include "jaringan.h"` di `aturan.cpp` (langkah 7.4) terlewat.

#### 7.7W Jalur Wokwi

Tidak ada library baru, jadi tab `libraries.txt` dan `diagram.json` tidak berubah. Pastikan kedua belas tab sudah berisi versi baru dan `konfigurasi.h` di Wokwi tetap `PAKAI_WOKWI = true`, lalu klik **▶**. Serial Monitor menulis baris-baris awal yang sama dengan langkah 7.7, ditambah `Mode Wokwi: menyambung ke Wokwi-GUEST tanpa portal, broker publik broker.emqx.io.`

Ingat kebiasaan Wokwi sejak Modul 8: NVS kosong lagi setiap kali simulasi dihentikan (**■**) lalu dijalankan (**▶**). Untuk meniru listrik padam, ketik `restart`.

#### 7.8 Ambang dari server: `config`

Langkah ini untuk jalur perangkat dan jalur Wokwi; jalur laptop langsung ke 7.10. Ketik `ambang` di kotak kirim Serial Monitor. **Hasilnya** (**rekaman uji Wokwi**):

```text
ambang: tanah_siram = 30 % (angka bawaan)
ambang: suhu_kipas_on = 30.0 C (angka bawaan); kipas pengaman padam di bawah 28.0 C
```

Sekarang kirim ambang dari luar.

**Jalur perangkat:** pindahkan aturan kipas ke Node 1-mu. Nyalakan dulu backend di terminal pertama (`npm run dev` di folder `backend`; sejak *commit* Praktik 6 terminal itu berada di `rumah-pintar-mini`, jadi ketik `cd backend` dulu). Lalu di `/docs`, kirim `PUT /rules/1` dengan isi aturan Praktik 4, tetapi kedua `device_id`-nya diganti dengan `device_id` Node 1-mu, `nyala_di_atas` diisi **1 °C di atas suhu kamarmu** (lihat OLED; dibulatkan ke atas), dan `padam_di_bawah` diisi 2 °C di bawahnya. Contohnya, untuk kamar 28,6 °C: `"nyala_di_atas":30,"padam_di_bawah":28`. Dengan ambang di atas suhu kamar, kipas belum menyala selama Node 1 masih tersambung. Log backend menulis `config … ke <device_id>: suhu_kipas_on 30 dari aturan 1 (retained)` lalu `ack ok=true`, dan Serial Monitor Node 1 menulis `Ambang suhu_kipas_on disimpan ke NVS: …` serta `Perintah c-…: config ambang dikerjakan.` (kalau angkanya sama dengan yang sudah tersimpan, baris pertama tidak muncul).

**Jalur Wokwi:** backend di laptopmu tidak bisa menjangkau Wokwi, jadi kirim `config` dengan tangan lewat MQTTX, sambungan **Broker publik**:

1. Tambahkan langganan `rpm/<device_id-mu>/#` (`device_id` Node 1 simulasimu tercetak di Serial Monitor, misalnya `240ac45e114b`).
2. Di kotak kirim, isi topik `rpm/<device_id-mu>/cmd`, pilih **QoS 1**, centang **Retain** (`config` memang dikirim *retained*, kontrak aturan 5), lalu kirim pesan JSON ini:

   ```json
   {"id":"cfg-uji-1","ts":"2026-10-20T23:22:34Z","aksi":"config","ambang":{"suhu_kipas_on":31,"tanah_siram":35}}
   ```

3. Hilangkan lagi centang **Retain** supaya perintah berikutnya tidak ikut tertempel.

**Hasilnya** di Serial Monitor (**rekaman uji Wokwi**):

```text
[00:00:10] INFO  Ambang suhu_kipas_on disimpan ke NVS: 31.0 C
[00:00:10] INFO  Ambang tanah_siram disimpan ke NVS: 35 %
[00:00:10] INFO  Perintah cfg-uji-1: config ambang dikerjakan.
```

Di MQTTX, `ack` `{"id":"cfg-uji-1",…,"ok":true,"state":{…}}` tiba sekitar satu detik kemudian. Ketik `ambang` lagi: kedua barisnya kini berakhir dengan `(dari NVS)`, dan kipas pengaman padam di bawah `29.0 C`. Coba juga satu `config` yang keliru, tanpa **Retain** dan dengan `id` baru (`id` yang sama akan diabaikan): `{"id":"cfg-uji-2","aksi":"config","ambang":{"suhu_kipas_on":50}}`. Node 1 menolaknya:

```text
[00:00:15] ERROR Perintah cfg-uji-2 ditolak: suhu_kipas_on harus angka 15-45
```

`ack`-nya berisi `ok:false` dengan `"pesan":"suhu_kipas_on harus angka 15-45"`, dan ambang yang tersimpan tidak berubah. Terakhir, buktikan ambang itu tahan listrik padam: ketik `restart`. Setelah menyala lagi, Serial Monitor menulis `Ambang suhu_kipas_on: 31.0 C (dari NVS)`, lalu `Perintah cfg-uji-1: config ambang dikerjakan.` tanpa baris `disimpan ke NVS`: `config` *retained* tiba lagi, tetapi angkanya sama, jadi NVS tidak ditulis ulang.

#### 7.8W ⭐ Uji pengaman di Wokwi: `uji offline`

Wokwi memakai broker publik yang tidak bisa kamu matikan, jadi broker "dihilangkan" dengan perintah `uji offline`. Wokwi berjalan lebih lambat daripada waktu sungguhan (di laptop penulis hanya sekitar 30 % kecepatan aslinya) sehingga 3 menit uji ini bisa memakan sekitar 10 menit jam dinding.

1. Ketik `uji offline`. **Hasilnya** (**rekaman uji Wokwi**, dari simulasi tanpa `restart`; sesudah `restart` di 7.8, jam di Serial Monitor Wokwi tidak kembali ke nol, jadi angkanya di layarmu lebih besar):

   ```text
   uji offline: sambungan broker diputus; mode offline mulai 2 menit lagi, sambung lagi 3 menit lagi.
   [00:00:13] ERROR MQTT PUTUS: sambungan terputus (kode -3). Node 1 tetap bekerja dan mencoba lagi setiap 5 detik.
   ```

   Di MQTTX, `status` Node 1 berubah menjadi `offline` pada detik yang sama: wasiatnya diterbitkan broker. Baris `… mencoba lagi setiap 5 detik` adalah pesan umum setiap kali sambungan putus (Konsep 10); selama uji ini Node 1 tidak mencoba menyambung sampai 3 menit lewat.

2. Tunggu 2 menit (jam simulasi). Serial Monitor menulis:

   ```text
   [00:02:13] ERROR MODE OFFLINE: broker tak terjangkau 120 detik. Pengaman lokal bekerja: kipas menyala di atas 31.0 C.
   ```

   Tekan lama tombol D13 untuk membuka halaman status OLED: baris `WiFi …` kini berbunyi `MODE OFFLINE`. Simulasi Wokwi lambat, jadi tahan tombolnya beberapa detik sampai Serial menulis `Tombol ditekan lama: halaman status ditampilkan 10 detik.`. Tekanan yang terlalu singkat terbaca sebagai tekan pendek, dan lampu menyala (`Tombol: lampu on`).

3. Klik DHT22 di rangkaian dan geser suhunya ke **33**. Pada bacaan berikutnya:

   ```text
   [00:02:19] INFO  Pengaman lokal: suhu 33.0 C di atas 31.0 C, kipas dinyalakan.
   ```

   LED biru `kipas` di rangkaian menyala, padahal tidak ada server yang menyuruh. **Itulah syarat lulus kedua.** (Lampu kecil `LED1` di modul relay Wokwi justru padam saat relay bekerja; yang menandai kipas adalah LED biru.)

4. Geser suhu ke **29,5**: kipas tetap menyala (29,5 belum di bawah 29). Geser ke **28,5**: `Pengaman lokal: suhu 28.5 C di bawah 29.0 C, kipas dipadamkan.` Geser lagi ke **33**, dan kipas menyala lagi.

5. Biarkan sampai 3 menit uji habis. Node 1 menyambung sendiri, lalu 10 detik kemudian mengirim laporannya (**rekaman uji Wokwi**):

   ```text
   [00:03:13] INFO  Uji offline selesai: Node 1 menyambung ke broker lagi.
   [00:03:13] INFO  MQTT tersambung ke broker broker.emqx.io:1883 dalam 474 ms, sebagai 240ac45e114b
   [00:03:13] INFO  MODE OFFLINE SELESAI setelah 60 detik: broker terjangkau lagi. Pengaman menyalakan kipas 2 kali.
   [00:03:13] INFO  Terbit telemetry (kipas menyala)
   [00:03:19] ERROR MQTT PUTUS: sambungan terputus (kode -3). Node 1 tetap bekerja dan mencoba lagi setiap 5 detik.
   [00:03:20] INFO  MQTT tersambung ke broker broker.emqx.io:1883 dalam 473 ms, sebagai 240ac45e114b
   [00:03:23] INFO  Laporan mode offline terkirim bersama vitals: offline_s=60, kipas_lokal=2
   ```

   Sambungan Wokwi ke broker publik sempat berkedip pada `00:03:19`, tetapi laporannya tetap dikirim 10 detik setelah mode offline selesai. Di MQTTX, `vitals` yang membawa laporan itu tiba (**rekaman uji Wokwi**):

   ```json
   {"ts":"2026-10-21T03:35:16Z","rssi":-85,"uptime_s":203,"heap_free":209484,"offline_s":60,"kipas_lokal":2}
   ```

   Kipas masih menyala karena suhu masih 33 °C.

6. Geser suhu ke **28**: `Pengaman lokal: suhu 28.0 C di bawah 29.0 C, kipas dipadamkan.` Node 1 sudah tersambung lagi, tetapi kipas yang dinyalakan pengaman tetap dipadamkan pengaman sendiri: yang menyalakan, dia yang memadamkan.

Gambar berikut merangkum uji ini dari satu kali simulasi Wokwi penulis: LED biru kipas (1), halaman status OLED (2), penggeser DHT22 (3), dan baris-baris Serial yang penting (4–7).

![Tangkapan layar Wokwi proyek Node 1 v1.5.0 setelah perintah Serial uji offline, dengan ambang suhu_kipas_on 31,0 °C dari config, dan tujuh nomor. Kiri, potongan rangkaian: 1, LED biru kipas menyala di atas relay kipas, sedangkan LED kuning lampu padam; di bawah ada ESP32 dan modul OLED yang dibingkai dengan nomor 2. Kanan atas, OLED diperbesar dengan nomor 2: Menyala selama: 00:02:22, Restart: POWERON, Nyala ke-1, MODE OFFLINE, v1.5.0 bebas 207KB. Keterangan: 1, LED kipas menyala, relay kipas digerakkan pengaman lokal di Node 1, bukan oleh server; 2, OLED: MODE OFFLINE menggantikan baris WiFi di halaman status (tombol ditekan lama). Nomor 3, jendela Editing DHT22 dengan penggeser Temperature 33.0°C dan Humidity 71.0%; keterangan: DHT22 digeser ke 33,0 °C (klik sensornya saat simulasi berjalan), di atas ambang 31,0 °C yang tersimpan di NVS. Catatan: Wokwi memakai broker publik yang tidak bisa kamu matikan, jadi mode offline dicoba dengan uji offline: Node 1 memutus sambungan dan menahan diri untuk tidak menyambung lagi selama 3 menit. Bawah, potongan Serial Monitor, urut waktu. 4, ambang dari NVS, lalu uji offline, putus tanpa pamit: ambang: suhu_kipas_on = 31.0 C (dari NVS); kipas pengaman padam di bawah 29.0 C; uji offline: sambungan broker diputus; mode offline mulai 2 menit lagi, sambung lagi 3 menit lagi; lalu 00:00:13 ERROR MQTT PUTUS: sambungan terputus (kode -3). Node 1 tetap bekerja dan mencoba lagi setiap 5 detik. 5, 2 menit kemudian, mode offline: 00:02:13 ERROR MODE OFFLINE: broker tak terjangkau 120 detik. Pengaman lokal bekerja: kipas menyala di atas 31.0 C. 6, suhu 33,0 °C, kipas dinyalakan: 00:02:19 INFO suhu=33.0 C kelembapan=71 % cahaya=3094 tanah=70 % gerak=tidak level_air=52 %, lalu 00:02:19 INFO Pengaman lokal: suhu 33.0 C di atas 31.0 C, kipas dinyalakan. 7, laporan ikut vitals, 10 detik sesudah tersambung: 00:03:23 INFO Laporan mode offline terkirim bersama vitals: offline_s=60, kipas_lokal=2.](aset/wokwi-pengaman-lokal.png)

Selesai menguji, hapus `config` yang tertempel di broker publik: di MQTTX, isi topik `rpm/<device_id-mu>/cmd`, lalu pilih **Clear Retained Message** (tombol kecil bersegitiga di sebelah kanan tombol **Meta**), dan hilangkan lagi centang **Retain** yang ikut tercentang. Broker publik bisa dibaca siapa saja. Node 1 tetap memakai ambangnya dari NVS.

#### 7.9 ⭐ Uji pengaman dengan perangkat: cabut kabel LAN Pi

> ⚠️ **Catatan jujur:** penulis menguji pengaman ini di Wokwi (7.8W) dan dengan simulator (7.10), belum dengan Node 1 dan Pi sungguhan. Baris-baris Serial di bawah sama dengan rekaman Wokwi karena kodenya sama; yang berbeda hanya cara putusnya (lihat langkah 2).

Mencabut kabel LAN Pi memutus broker untuk semua yang ada di rumah: Node 1, backend di laptop, dan dashboard Node-RED. Server tidak bisa menolong, jadi Node 1 harus menolong dirinya sendiri. Pi tetap menyala; **jangan** mencabut listriknya karena kartu microSD bisa rusak (Modul 12).

1. Pastikan aturan kipas sudah menuju Node 1 dengan ambang 1 °C di atas suhu kamar (7.8), Serial Monitor Node 1 terbuka, dan backend menyala.
2. Cabut kabel LAN dari Pi. Dalam 15–30 detik, Node 1 menyadari broker hilang dan menulis `MQTT PUTUS: broker tidak menjawab tepat waktu (kode -4)`, lalu mencoba lagi setiap 5 detik. Backend di laptop juga menulis `broker belum terjangkau, mencoba lagi dalam 5 detik` berulang-ulang; itu memang bagian dari uji ini. Selama 15–30 detik pertama, Serial Monitor masih menulis `Terbit telemetry (jadwal 10 detik)`, padahal pesannya tidak pernah sampai. `telemetry` dikirim dengan QoS 0 (Modul 11), jadi "terbit" hanya berarti pesannya sudah diserahkan ke bagian jaringan ESP32, belum tentu diterima broker. **Pi Zero 2 W** (tanpa colokan LAN) atau Pi yang tetap memakai alamat yang sama lewat WiFi: hentikan broker dari terminal SSH dengan `sudo systemctl stop mosquitto`.
3. Tunggu sekitar 2 menit sejak Node 1 menyadarinya, sampai muncul `MODE OFFLINE: broker tak terjangkau 120 detik. Pengaman lokal bekerja: kipas menyala di atas … C.` dan halaman status OLED menulis `MODE OFFLINE`.
4. Hangatkan DHT22: genggam sensornya dengan jari, atau tiup dengan pengering rambut (*hair dryer*) dari jarak sekitar 30 cm, sampai suhunya melewati ambang. Relay kipas berbunyi "klik", kipas berputar, dan Serial Monitor menulis `Pengaman lokal: suhu … C di atas … C, kipas dinyalakan.`
5. Colokkan lagi kabel LAN (atau `sudo systemctl start mosquitto`). Dalam beberapa detik Node 1 menulis `MQTT tersambung …` dan `MODE OFFLINE SELESAI setelah … detik …`, lalu 10 detik kemudian `Laporan mode offline terkirim bersama vitals: …`. Log backend menulis `WARN: <device_id> kembali dari mode offline …`, dan Telegram-mu menerima pesan `📶` yang sama (contohnya di 7.10).
6. Saat sensor mendingin, kipas baru padam sendiri di bawah ambang − 2. Karena ambangmu dekat suhu kamar, mungkin kipas tetap menyala. Padamkan saja lewat `/docs`: `POST /devices/{id}/command` dengan `{"target":"kipas","nilai":false}`. Perintah itu sekaligus mengambil alih kipas dari pengaman.

Terakhir, kembalikan ambang aturan kipas ke angka yang kamu inginkan sehari-hari dengan `PUT /rules/1`.

#### 7.10 ⭐ Uji pengaman dengan simulator: matikan broker laptop (jalur laptop)

Simulator Modul 19 menjalankan pengaman yang sama dengan firmware v1.5.0. Kali ini broker Mosquitto laptop harus berjalan di terminal VS Code karena langkah 2 menghentikannya dengan **Ctrl + C**. Pindahkan brokernya **lebih dulu**, sebelum menyiapkan yang lain. Kalau simulator masih berjalan dari Praktik 6, matikan dulu (**Ctrl + C**) karena simulator yang kehilangan broker lebih dari 2 menit selama perpindahan ini telanjur masuk mode offline sebelum uji dimulai. Sejak Modul 12, brokermu berjalan sebagai layanan, jadi hentikan dulu layanannya seperti bagian "Melihat catatan" di Modul 12 Praktik 7: di Windows, `net stop mosquitto` di **Terminal (Admin)**; di macOS, `brew services stop mosquitto`; di Linux, `sudo systemctl stop mosquitto`. Dua broker tidak bisa memakai port 1883 bersamaan. Lalu buka terminal baru di VS Code, ketik `cd edge`, lalu `mosquitto -v -c mosquitto-lan.conf` (folder `edge` di `rumah-pintar-mini` berisi `mosquitto-lan.conf` sejak Modul 11). Kalau broker laptopmu memang sudah berjalan di terminal VS Code, cukup pakai terminal itu. Biarkan terminal broker ini menyala sampai gladi Praktik 8 selesai; di akhir 8.4 kamu menyalakan lagi layanannya. Sesudah broker di terminal menyala, siapkan yang lain seperti Praktik 6, yaitu backend di terminal pertama (`npm run dev` di folder `backend`; ketik `cd backend` dulu kalau terminalnya masih di `rumah-pintar-mini`), simulator untuk satu perangkat, dan terminal kecil yang mengikuti `f00d00000001`.

1. Di terminal simulator, ketik **`suhu 29`**. Suhu tetap di bawah ambang 30 °C, jadi tidak ada kipas yang menyala sebelum uji, dan angkanya tidak berubah-ubah seperti `suhu acak`.
2. **Matikan broker**: tekan **Ctrl + C** di terminal Mosquitto. **Hasilnya** di terminal simulator:

   ```text
   f00d00000001: broker tak terjangkau, mencoba lagi setiap 5 detik
   ```

   Log backend menulis sepasang baris ini setiap 5 detik (**contoh**; sebelumnya mungkin ada satu baris `ERROR: galat MQTT: read ECONNRESET`, bergantung pada cara broker berhenti):

   ```text
   [10:28:53] WARN: broker belum terjangkau, mencoba lagi dalam 5 detik
   [10:28:53] ERROR: galat MQTT: connect ECONNREFUSED 127.0.0.1:1883
   ```

   Terminal kecil diam saja: backend tidak mendengar wasiat `offline` simulator karena wasiat itu ikut hilang bersama broker yang mati.

3. **Tunggu 2 menit.** Terminal simulator menulis:

   ```text
   f00d00000001: MODE OFFLINE: broker tak terjangkau 2 menit; pengaman menyalakan kipas di atas 30 °C
   ```

4. Ketik **`suhu 33`**. **Hasilnya:**

   ```text
   Suhu: 33.0 °C
   f00d00000001: pengaman lokal: suhu 33.0 °C, kipas dinyalakan
   ```

   Broker mati, backend tidak terjangkau, tetapi kipas menyala. **Itulah syarat lulus kedua.**

5. **Nyalakan broker lagi** dengan perintah yang sama (`mosquitto -v -c mosquitto-lan.conf`), lalu kerjakan langkah 6 **kurang dari 2 menit** kemudian (alasannya ada di bawah). **Hasilnya** di terminal simulator (**contoh**; lama mode offline dan `id` perintah di layarmu berbeda):

   ```text
   f00d00000001: MODE OFFLINE SELESAI setelah 51 detik; pengaman menyalakan kipas 1 kali
   f00d00000001: online
   f00d00000001: ambang sama dengan yang tersimpan {"suhu_kipas_on":30,"tanah_siram":30}
   f00d00000001: perintah c-20261021-033139-6 -> ok=true
   f00d00000001: laporan mode offline terkirim bersama vitals (offline_s=51, kipas_lokal=1)
   ```

   Baris terakhir muncul 10 detik setelah `online`. Log backend (**contoh**):

   ```text
   [10:31:39] INFO: tersambung ke broker mqtt://127.0.0.1:1883
   [10:31:39] INFO: config c-20261021-033139-6 ke f00d00000001: suhu_kipas_on 30 dari aturan 1 (retained)
   [10:31:39] INFO: config c-20261021-033139-6 ke f00d00000001: ack ok=true
   [10:31:44] INFO: aturan 1 (Kipas otomatis): suhu 33 di atas 30; kipas dinyalakan kalau bertahan 120 detik
   [10:31:49] WARN: f00d00000001 kembali dari mode offline setelah 51 detik; pengaman lokal menyalakan kipas 1 kali
   [10:31:49] INFO: Telegram terkirim: 📶 f00d00000001 kembali dari mode offline setelah 51 detik; pengaman lokal menyalakan kipas 1 kali
   ```

   - Begitu tersambung, backend menerbitkan ulang `config` *retained* karena broker laptop yang baru dinyalakan sudah melupakan semua pesan *retained* (kontrak aturan 10). Simulator menjawab `ambang sama dengan yang tersimpan`: ambangnya masih aman di "NVS"-nya.
   - Aturan kipas di server mulai menghitung 120 detik dari bacaan 33 °C pertama. Karena itu, kerjakan langkah 6 **kurang dari 2 menit** setelah broker menyala. Kalau terlambat, aturan server ikut mengirim `kipas = true`, kipas pindah ke tangan server, dan di langkah 6 yang memadamkannya adalah aturan server (`✅ Suhu turun ke 27 °C — kipas dipadamkan`), bukan pengaman lokal.
   - Laporan mode offline masuk ke buku kejadian, tampil di terminal kecil sebagai `kejadian: f00d00000001 kembali dari mode offline setelah 51 detik; pengaman lokal menyalakan kipas 1 kali`, dan sampai di Telegram-mu.

6. Ketik **`suhu 27`**. **Hasilnya:**

   ```text
   Suhu: 27.0 °C
   f00d00000001: pengaman lokal: suhu 27.0 °C, kipas dipadamkan
   ```

   Simulator sudah tersambung lagi, tetapi kipas milik pengaman tetap dipadamkan pengaman sendiri, dan log backend hanya menulis `aturan 1 (Kipas otomatis): hitungan diulang (suhu 27)`.

Pemeriksa kontrak 1.3 juga bisa memeriksa laporan itu, dan gladi 8.4 memakainya. Pemeriksa yang sudah berjalan ikut berhenti saat broker mati, jadi jalankan pemeriksa begitu broker menyala lagi (langkah 5) di terminal baru: `cd alat`, lalu `node pemeriksa-kontrak.js 127.0.0.1 f00d00000001`. Jangan memakai terminal simulator (yang juga berada di folder `alat`) karena simulator membaca setiap ketikan sebagai perintah suhu. Laporannya baru terbit sekitar 10 detik sesudah simulator tersambung, jadi masih sempat. `vitals` berlaporan itu diberi cap `rpm/f00d00000001/vitals  LULUS  (laporan mode offline: 51 detik, kipas 1 kali)`.

#### 7.11 Jejaknya di database

Laporan mode offline tersimpan di buku kejadian dengan jenis `mode-offline`. (Jalur Wokwi: backend di laptop tidak mendengar broker publik, jadi kueri ini masih menjawab `(0 rows)` sampai kamu mengerjakan uji simulator di gladi Praktik 8.) Di psql:

```sql
SELECT to_char(waktu AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS jam_wib, device_id, sumber, data
FROM events WHERE jenis = 'mode-offline' ORDER BY waktu DESC LIMIT 1;
```

**Hasilnya** (**contoh**):

```text
 jam_wib  |  device_id   |  sumber   |                data                 
----------+--------------+-----------+-------------------------------------
 10:31:49 | f00d00000001 | perangkat | {"offline_s": 51, "kipas_lokal": 1}
(1 row)
```

Kolom `sumber` berisi `perangkat`: keputusan menyalakan kipas selama mode offline diambil Node 1 sendiri, bukan server. Kolom `data` menyimpan kedua angka laporan apa adanya, jadi kelak dashboard bisa menghitung berapa lama dan berapa sering rumahmu "berjaga sendiri".

#### 7.12 Simpan ke cabang

Sebelum menyimpan, pastikan kedua belas file di folder `firmware/node-1-rumah` repositorimu sudah berisi versi baru (kalau kamu memakai Wokwi, bukan hanya tab Wokwi-nya). Terminal pertama mungkin masih menjalankan backend (7.8 atau 7.10), jadi buka terminal baru (**Terminal → New Terminal**), yang langsung berada di folder `rumah-pintar-mini`, lalu ketik:

```text
git add firmware
git commit -m "Firmware Node 1 v1.5.0: config di NVS, mode offline, pengaman kipas, laporan di vitals (Modul 19 Praktik 7)"
```

Firmware v1.5.0 kini tersimpan di cabang `fitur/otomasi`; langkah 8.5 mengirim semuanya ke GitHub.

> ➡️ **Selesai Praktik 7?** Lanjut ke [Praktik 8 — Uji kelulusan dan simpan ke cabang](#praktik-8--uji-kelulusan-dan-simpan-ke-cabang-30-menit) tanpa kembali ke konsep.

### Praktik 8 — Uji kelulusan dan simpan ke cabang (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (backend, simulator, terminal kecil, dan terminal broker), **Bruno**, browser untuk **`/docs`**, dan **Telegram**. Jalur perangkat memakai Node 1 v1.5.0 dan Pi seperti Praktik 7.
>
> ⭐ **Wajib** — gladi bersih ketiga syarat lulus Modul 19 dalam sekali jalan.

Semua bagian sudah kamu bangun satu per satu. Praktik ini memberi backend nomor versinya, menambahkan permintaan Bruno untuk rute baru, lalu menguji ketiga syarat lulus berurutan, seperti penguji yang datang memeriksa rumahmu.

#### 8.1 Backend v0.4.0

Hentikan `npm run dev` kalau masih berjalan (**Ctrl + C**), lalu pastikan terminal pertama berada di folder `backend`. Ujung baris perintahnya harus `backend>` (macOS: `backend %`); kalau masih `rumah-pintar-mini`, ketik `cd backend` dulu. Lalu jalankan:

```text
npm version 0.4.0 --no-git-tag-version
```

**Hasilnya:**

```text
v0.4.0
```

`npm version` mengubah nomor versi di `package.json` dan `package-lock.json` sekaligus. Pilihan `--no-git-tag-version` mencegahnya membuat *commit* dan *tag* Git sendiri; kamu menyimpannya dengan `git commit` di langkah 8.5. Lalu perbarui tiga tempat yang menyebut versi lama:

1. Di **`backend/package.json`**, ganti baris `"description"` dengan:

   ```json
     "description": "Backend Rumah Pintar Mini (Modul 16-19): mendengar MQTT, memeriksa kontrak data, menyimpan semua pesan ke database deret waktu, menyediakan API riwayat, data realtime, perintah, aturan otomatis, jadwal, dan notifikasi Telegram",
   ```

2. Di **`backend/src/server.ts`**, ganti baris pertama dengan dua baris ini:

   ```ts
   // server.ts - pintu masuk backend Rumah Pintar Mini v0.4 (Modul 19: data realtime, perintah satu pintu, aturan otomatis,
   // jadwal, dan notifikasi Telegram).
   ```

3. Masih di `server.ts`, ganti baris `openapi: { info: … "Backend v0.3 (Modul 18)", version: "0.3.0" } },` dengan:

   ```ts
     openapi: { info: { title: "Rumah Pintar Mini API", description: "Backend v0.4 (Modul 19)", version: "0.4.0" } },
   ```

Jalankan lagi backend (`npm run dev`), lalu buka `http://127.0.0.1:8080/docs`. Judul halamannya kini menyebut `0.4.0` dan `Backend v0.4 (Modul 19)`, dan daftar rutenya bertambah: `/devices/{id}/state`, `/rules`, `/rules/{id}`, dan `/rules/{id}/jalankan`.

#### 8.2 Empat permintaan Bruno

Buka koleksi `backend/bruno` di Bruno, pilih *environment* **`lokal`**, lalu buat empat permintaan dengan **Clone Request** (klik kanan tab permintaan lama → **Clone Request** → isi **Request Name** → **Clone**). Jalur perangkat memakai `device_id` Node 1-mu; jalur laptop dan jalur Wokwi memakai `f00d00000001`.

| Permintaan baru | Di-*clone* dari | Ubah menjadi |
| :--- | :--- | :--- |
| `daftar aturan` | `daftar perangkat` | URL `{{baseUrl}}/rules` |
| `ubah ambang kipas` | `nyalakan lampu` | metode **PUT**, URL `{{baseUrl}}/rules/1`, dan isi tab **Body** dengan JSON aturan kipas Praktik 4 (ambang 30/28) |
| `jalankan jadwal siram` | `daftar aturan` | metode **POST**, URL `{{baseUrl}}/rules/2/jalankan`, tanpa isi |
| `keadaan aktuator Node 1` | `bacaan terbaru Node 1` | URL `{{baseUrl}}/devices/<device_id-mu>/state` |

Semua tab **Assert** ikut tersalin: `res.status` `eq` `200`. Simpan setiap permintaan (**Ctrl + S**), lalu klik **Send** satu per satu. Tab **Tests** di panel jawabannya berisi `Assertions (1), Passed: 1, Failed: 0`. Hati-hati dengan `jalankan jadwal siram`: permintaan itu benar-benar menyalakan pompa 10 detik dan mengirim pesan Telegram.

#### 8.3 Pemeriksaan otomatis

Buka terminal baru (**Terminal → New Terminal**), masuk ke folder `backend` dengan `cd backend`, lalu jalankan dua perintah ini. Jangan memakai terminal kedua karena simulator yang berjalan di sana membaca setiap baris yang kamu ketik sebagai perintah suhu.

```text
npm run cek
npm test
```

`npm run cek` selesai tanpa pesan galat, dan ringkasan `npm test` memuat **`Tests  11 passed (11)`**. Lalu buka satu terminal baru lagi, masuk ke folder `alat` (`cd alat`), dan jalankan pemeriksa kontrak 1.3 selama simulator atau Node 1 berjalan (alamat brokermu; jalur laptop `127.0.0.1`), misalnya `node pemeriksa-kontrak.js 127.0.0.1 f00d00000001`. Setiap `telemetry`, `vitals`, `cmd`, dan `ack` harus diberi cap `LULUS`. Biarkan pemeriksa berjalan selama gladi di bawah. Saat broker dimatikan di syarat 2, pemeriksa ikut berhenti; jalankan lagi begitu broker menyala supaya `vitals` berlaporan ikut diperiksa (7.10).

#### 8.4 ⭐ Gladi bersih tiga syarat lulus

Siapkan semuanya seperti Praktik 7.10: broker, backend (`npm run dev`), simulator untuk satu perangkat, dan terminal kecil yang mengikuti `f00d00000001`. **Jalur perangkat:** pakai Node 1 v1.5.0 dengan aturan kipas yang menuju Node 1. Suhu kamar sulit diatur, jadi untuk syarat 1 ambangnya yang digeser: mula-mula sekitar 2 °C **di atas** suhu kamarmu (kipas diam), lalu sekitar 2 °C **di bawahnya** (kipas menyala 2 menit kemudian); untuk memadamkannya, naikkan lagi ambangnya sampai `padam_di_bawah` pun di atas suhu kamar (misalnya `nyala_di_atas` 4 °C dan `padam_di_bawah` 2 °C di atas suhu kamar). Syarat 2 dikerjakan seperti Praktik 7.9. Kotak **Hasilnya** di bawah berasal dari satu gladi yang sama di laptop penulis, dengan simulator dan server Telegram tiruan.

**Syarat 1 — ambang diubah lewat API, kipas ikut berubah, tanpa *restart*.**

1. Kirim `PUT /rules/1` dengan `"nyala_di_atas":32,"padam_di_bawah":30` (lewat `/docs`, atau ubah sebentar isi permintaan Bruno `ubah ambang kipas`).
2. Di terminal simulator, ketik **`suhu 31`**. Tunggu **2 menit lebih**: suhu 31 °C tidak di atas 32, jadi kipas tetap padam.
3. Kirim lagi `PUT /rules/1` dengan `"nyala_di_atas":30,"padam_di_bawah":28`. Server **tidak** dimulai ulang. Sekitar 2 menit kemudian kipas menyala. **Hasilnya** di log backend (**contoh**, baris-baris pentingnya):

   ```text
   [10:23:46] INFO: Aturan 1 (Kipas otomatis) diubah lewat API: kipas f00d00000001 menyala kalau suhu f00d00000001 di atas 32 selama 120 detik, padam di bawah 30
   [10:23:46] INFO: config c-20261021-032346-2 ke f00d00000001: suhu_kipas_on 32 dari aturan 1 (retained)
   [10:26:02] INFO: Aturan 1 (Kipas otomatis) diubah lewat API: kipas f00d00000001 menyala kalau suhu f00d00000001 di atas 30 selama 120 detik, padam di bawah 28
   [10:26:02] INFO: config c-20261021-032602-3 ke f00d00000001: suhu_kipas_on 30 dari aturan 1 (retained)
   [10:26:09] INFO: aturan 1 (Kipas otomatis): suhu 31 di atas 30; kipas dinyalakan kalau bertahan 120 detik
   [10:28:10] INFO: perintah c-20261021-032810-4 (aturan) ke f00d00000001: kipas = true, ack ok=true dalam 6 ms
   [10:28:10] INFO: aturan 1 (Kipas otomatis): 🌡️ Suhu 31 °C — kipas dinyalakan otomatis
   [10:28:10] INFO: Telegram terkirim 0,2 detik setelah bacaan 2026-10-21T03:28:10Z: 🌡️ Suhu 31 °C — kipas dinyalakan otomatis
   ```

   Selama ambang 32, tidak ada satu baris pun tentang kipas. Begitu ambang turun ke 30, bacaan 31 °C berikutnya memulai hitungan, dan tepat 2 menit kemudian kipas menyala. Setiap perubahan ambang juga dikirim ke perangkat sebagai `config` (`suhu_kipas_on 32`, lalu `30`) supaya pengaman lokalnya memakai angka yang sama dengan server.

**Syarat 3 — Telegram dalam 10 detik.** Baris terakhir di atas sekaligus buktinya: `Telegram terkirim 0,2 detik setelah bacaan …`, dan HP-mu menerima `🌡️ Suhu 31 °C — kipas dinyalakan otomatis`.

4. Ketik **`suhu 27`**. Kipas dipadamkan, dan Telegram-mu menerima `✅ Suhu turun ke 27 °C — kipas dipadamkan` (di gladi ini 0,3 detik setelah bacaan).

**Syarat 2 — perangkat tetap bereaksi saat broker dimatikan.** Kerjakan Praktik 7.10 langkah 1–6: `suhu 29`, matikan broker, tunggu mode offline, `suhu 33`, nyalakan broker, lalu `suhu 27`. Contoh keluaran di 7.10 berasal dari gladi yang sama, jadi jam-jamnya bersambung dengan blok di atas. Kali ini, sebelum mengetik `suhu 27` (langkah 6), kirim dulu permintaan Bruno `keadaan aktuator Node 1` (jalur laptop dan jalur Wokwi: dengan `f00d00000001`). Kerjakan keduanya dalam 2 menit setelah broker menyala; alasannya ada di 7.10 langkah 5. **Hasilnya** (**contoh**, dirapikan):

```json
{
  "device_id": "f00d00000001",
  "desired": { "kipas": false },
  "reported": { "kipas": true, "lampu": false, "pompa": false, "tirai": 90 },
  "reported_pada": "2026-10-21T03:31:54.470Z",
  "selisih": ["kipas"]
}
```

Server terakhir menginginkan kipas **padam** (perintah aturan pada langkah 4 gladi ini, saat kamu mengetik `suhu 27` sesudah syarat 1), sedangkan simulator melaporkan kipas **menyala** karena pengaman lokalnya yang menyalakan. Ada selisih, tetapi server **tidak** mengirim ulang perintah `kipas = false`: keinginannya sudah pernah terpenuhi, jadi perubahan sesudahnya dianggap keputusan otak lain (Konsep 4). Kalau server melawan, kipas akan dipadamkan padahal suhunya 33 °C. Setelah `suhu 27`, pengaman memadamkan kipasnya sendiri, dan permintaan yang sama menjawab `"selisih": []`.

Ketiga syarat lulus terbukti. Tulis di catatanmu (➕ D): angka "detik setelah bacaan" dari syarat 3, serta `offline_s` dan `kipas_lokal` dari laporan mode offline. **Jalur laptop dan jalur Wokwi:** gladi sudah selesai, jadi hentikan broker di terminal VS Code (**Ctrl + C**) dan nyalakan lagi layanannya: `net start mosquitto` di **Terminal (Admin)** (Windows), `brew services start mosquitto` (macOS), atau `sudo systemctl start mosquitto` (Linux).

#### 8.5 Simpan ke cabang dan kirim ke GitHub

Di terminal tempat kamu menjalankan `npm test` di 8.3 (folder `backend`; backend di terminal pertama boleh tetap menyala), ketik:

```text
cd ..
git add backend
git status
git commit -m "Backend v0.4.0 dan permintaan Bruno untuk aturan, jadwal, dan keadaan aktuator (Modul 19 Praktik 8)"
git push -u origin fitur/otomasi
```

Di bagian `Changes to be committed`, `git status` menyebut `backend/package.json`, `backend/package-lock.json`, `backend/src/server.ts`, dan empat file baru di `backend/bruno/`. Pastikan `.env` **tidak** ada di daftar itu. Ini *push* pertama cabang `fitur/otomasi`: `-u` mencatat cabang itu di GitHub sebagai pasangan cabang lokalmu, jadi setelah ini cukup `git push`.

> ➡️ **Selesai Praktik 8?** Kerjakan Tingkat 1 dari [🧩 Tantangan mandiri](#-tantangan-mandiri), lalu langkah A–C di [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini): di sana semua pekerjaan Modul 19 digabung ke `main` lewat *pull request*. Tingkat 2 dan 3 dikerjakan sesudah itu, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul masalah yang mirip dengan yang kamu alami.

<details>
<summary><b>Terminal kecil terus menulis <code>belum bisa tersambung: xhr poll error</code>, atau tidak menampilkan bacaan</b></summary>

- **`xhr poll error` berulang-ulang** berarti permintaan HTTP pertama Socket.IO tidak dijawab. Backend belum menyala, sedang dimulai ulang, atau alamatnya salah. Alamat terminal kecil harus sama dengan alamat `/docs`, misalnya `http://127.0.0.1:8080`, bukan alamat broker.
- **`ditolak server: device_id harus 12 digit heksadesimal huruf kecil`**: `device_id` di perintah `node terminal-live.js …` salah ketik. Salin dari `GET /devices`.
- **Tersambung dan mengikuti, tetapi tidak ada bacaan**: perangkat itu belum mengirim `telemetry` sejak backend menyala (simulator mati, Node 1 belum tersambung ke broker), atau backend menolaknya. Lihat log backend: baris `DITOLAK rpm/…` menyebut alasannya. Firmware v1.4.0 dan simulator lama tetap diterima, tetapi `state`-nya kosong.
- **Setiap terminal kecil menerima bacaan semua perangkat**: backend masih memakai siaran Kemenangan Cepat (`io.emit` ke semua klien). Ganti `realtime.ts` dengan versi Praktik 1.

</details>

<details>
<summary><b><code>npm test</code> gagal, atau tidak ditemukan</b></summary>

- `npm error Missing script: "test"` berarti skrip `"test": "vitest run"` belum ditambahkan ke `backend/package.json` (Praktik 3.1). Perhatikan koma di akhir baris sebelumnya.
- Ada uji bertanda `×`: baca baris `AssertionError` di bawahnya. `expected null to be 'nyalakan'` berarti fungsi menjawab `null` (tidak memutuskan apa-apa), padahal uji mengharapkan `"nyalakan"`. Bandingkan bagian yang diuji di `mesin.ts` dengan kode Praktik 3.3, terutama tanda `>`, `>=`, `<`, dan `<=`.
- `npm run cek` menulis `error TS2307: Cannot find module 'vitest' or its corresponding type declarations.` (atau `'grammy'`, `'node-cron'`, `'socket.io'`): `npm run cek` memeriksa semua file di `src`, termasuk file uji, jadi paket yang dipakai harus sudah terpasang. Jalankan lagi perintah `npm install` di praktik yang memasang paket itu.

</details>

<details>
<summary><b>Log backend menulis <code>aturan otomatis belum bisa dimuat: column "diubah" does not exist</code></b></summary>

Migrasi `007_aturan_dan_kejadian.sql` belum dijalankan ke database. Backend tetap menyala, tetapi tanpa aturan. Hentikan backend, jalankan `npm run migrasi` di folder `backend` (jawabannya `1 migrasi baru diterapkan, 5 sudah ada sebelumnya.`), lalu jalankan lagi backend (Praktik 4).

</details>

<details>
<summary><b><code>POST /rules</code>, <code>PUT /rules/…</code>, atau <code>POST /rules/{id}/jalankan</code> ditolak</b></summary>

- **`400`** selalu menyebut kolom yang salah. Yang paling sering: `padam_di_bawah` tidak lebih kecil daripada `nyala_di_atas`, ambang aturan kipas di luar 15–45 °C, ekspresi cron yang bukan 5 bidang, atau nama kolom yang salah ketik. Untuk yang terakhir, Zod menulis dua hal sekaligus: kolom yang benar dianggap kosong, dan kolom yang salah ketik tidak dikenal. Misalnya, kalau `nyala_di_atas` tertulis `nyala_diatas`, pesannya `body/kondisi/nyala_di_atas Input tidak valid: diharapkan number, diterima undefined, body/kondisi Kunci tidak dikenali : "nyala_diatas"`. Spasi sebelum titik dua (atau huruf `s` kalau kolom yang tidak dikenal lebih dari satu: `Kunci tidak dikenali s: …`) adalah sisa terjemahan bahasa Inggris *key*/*keys* yang belum rapi. Yang penting, kolom di dalam tanda petik ganda itu tidak dikenal.
- **`409` dengan `aturan 1 bukan aturan jadwal`**: `POST /rules/{id}/jalankan` hanya untuk aturan jadwal yang aktif. Aturan kipas berjalan sendiri dari bacaan.
- **`415 Unsupported Media Type`** atau **`400 FST_ERR_CTP_EMPTY_JSON_BODY`** saat memanggil `POST /rules/{id}/jalankan` dari PowerShell (`Invoke-WebRequest` atau `Invoke-RestMethod`): rute ini tidak membutuhkan isi, sedangkan PowerShell mengirim kepala `content-type` yang tidak cocok. Pakai **`/docs`** atau Bruno (tab **Body** dibiarkan **No Body**); keduanya dijawab `200`.

</details>

<details>
<summary><b>Aturan yang kuubah lewat DBeaver tidak berlaku, atau log menulis <code>aturan … dilewati</code></b></summary>

Backend membaca tabel `rules` saat menyala dan setiap kali aturan diubah **lewat API**. Perubahan langsung di database (DBeaver, psql) baru terbaca saat backend dimulai ulang atau saat aturan lain diubah lewat API (saat itu semua aturan dimuat ulang), dan `config`-nya baru terbit ke perangkat pada saat itu, bukan saat kamu menyimpan di DBeaver. Kalau isi barisnya tidak sah menurut skema Zod, backend melewatinya dengan baris `WARN: aturan … dilewati: …` dan tetap memakai aturan lain. Ubah aturan lewat `PUT /rules/{id}` supaya semuanya langsung berlaku.

</details>

<details>
<summary><b>Kipas tidak dinyalakan aturan server, padahal suhunya di atas ambang</b></summary>

Periksa log backend dari atas ke bawah:

1. Ada baris `aturan 1 (…): suhu … di atas …; kipas dinyalakan kalau bertahan 120 detik`? Kalau tidak ada, aturannya tidak aktif, `device_id` di aturan berbeda dengan perangkatmu, atau suhunya tidak **di atas** ambang: tepat 30,0 untuk ambang 30 belum dihitung.
2. Ada `hitungan diulang`? Satu bacaan di bawah ambang, bacaan `null` (DHT22 gagal), atau jeda lebih dari 60 detik di antara dua bacaan mengulang hitungan 120 detik dari nol. Bacaan yang `ts`-nya lebih tua daripada 60 detik menurut jam laptop tidak dinilai sama sekali, tanpa baris log: itu data susulan, atau jam laptop mendahului jam Node 1 lebih dari satu menit. Kalau Node 1 tidak pernah memicu aturan, sedangkan simulator bisa, pastikan jam laptop disetel otomatis dari internet (nyalakan **Set time automatically** di pengaturan tanggal-jam laptop, seperti 🚨 Modul 11).
3. Ada `kipas tidak bisa dinyalakan: …`? Perintahnya tidak dikirim, dan alasannya tertulis, misalnya perangkat sedang `offline` atau backend tidak tersambung ke broker. Bacaan berikutnya mencoba lagi.

</details>

<details>
<summary><b>Jadwal siram tidak berjalan pukul 06.00</b></summary>

- **Laptop tidur atau backend mati pada jam itu.** node-cron 4 tidak memutar ulang jadwal yang terlewat. Kalau laptop yang tidur bangun paling lambat 15 menit sesudahnya, jadwal masih dijalankan; kalau lebih lama, log dan buku kejadian mencatat `⏰ Jadwal … terlewat (laptop tidur atau backend sibuk?)`. Kalau backend sedang mati (tidak berjalan) pada jam itu, tidak ada yang tercatat sama sekali, dan backend yang dinyalakan sesudahnya langsung menunggu jadwal berikutnya. Ini batasan backend di laptop; Modul 26–27 memindahkannya ke server yang menyala terus.
- **`berikutnya` di `GET /rules` menunjukkan jam yang aneh.** Kolom itu ditulis dalam UTC: `2026-10-21T23:00:00Z` adalah pukul 06.00 WIB tanggal 22. Log backend menulisnya dalam WIB.
- **Contoh dari internet tidak jalan.** Banyak tutorial masih memakai node-cron 3. Pilihan seperti `scheduled` dan `runOnInit` tidak ada di versi 4.6.0, dan paket `@types/node-cron` hanya untuk versi 3: jangan dipasang.

</details>

<details>
<summary><b>Bot Telegram diam, atau menjawab <code>Maaf, bot ini hanya melayani pemiliknya.</code></b></summary>

- **Log tidak pernah menulis `bot Telegram @… siap`.** Kalau ada `notifikasi Telegram mati: TELEGRAM_BOT_TOKEN belum diisi`, tokennya belum tertulis di `.env` (atau `.env` belum disimpan). Kalau ada `bot Telegram berhenti: Call to 'getMe' failed! (401: Unauthorized)`, tokennya salah: salin ulang dari @BotFather, tanpa spasi dan tanpa tanda petik. Kalau tidak ada keduanya, laptop mungkin belum tersambung ke internet: grammY terus mencoba menghubungi Telegram tanpa menulis apa pun di log, dan baris `siap` baru muncul begitu internet tersambung.
- **Log menulis `siap`, tetapi bot tidak membalas.** Pesan yang dikirim saat backend mati dibuang begitu backend menyala, jadi kirim `/start` sekali lagi. Kalau internet laptop putus, grammY mencoba lagi setiap 3 detik **tanpa menulis apa pun** di log; periksa koneksinya. Untuk melihat percobaan yang gagal itu, jalankan backend dengan variabel lingkungan `DEBUG=grammy:error` (PowerShell: `$env:DEBUG="grammy:error"; npm run dev`; macOS: `DEBUG=grammy:error npm run dev`).
- **`/status` dijawab `Maaf, bot ini hanya melayani pemiliknya.`** `TELEGRAM_CHAT_ID` di `.env` kosong, ada angka yang salah, atau belum disimpan (backend belum dimulai ulang). Bisa juga kamu mengirim dari akun Telegram atau grup lain: `chat_id` grup berbeda dan biasanya negatif. Kirim `/start` dari percakapan yang ingin kamu pakai, lalu salin angkanya persis.
- **Log menulis `bot Telegram berhenti: … (409: Conflict …)`.** Dua program *long polling* memakai token yang sama, misalnya backend di laptop lain atau salinan backend dengan `PORT` berbeda. (Backend kedua dengan `.env` yang sama di laptop yang sama biasanya langsung berhenti dengan `EADDRINUSE` karena port-nya sudah terpakai, sebelum sempat menghubungi Telegram.) Satu token hanya boleh dipakai satu program *long polling*. Matikan salah satunya, lalu mulai ulang backend yang tersisa.
- **Peringatan terkirim (log menulis `Telegram terkirim …`), tetapi notifikasi HP terlambat.** Fitur hemat baterai HP bisa menunda notifikasi. Pesannya sudah ada di percakapan begitu Telegram dibuka.

</details>

<details>
<summary><b>Token bot telanjur ter-<i>commit</i>, dikirim ke grup, atau terlihat di tangkapan layar</b></summary>

Anggap token itu sudah bocor. Buka @BotFather, kirim `/token`, pilih bot-mu, lalu tulis token baru di `backend/.env`. Menghapus file dari *commit* berikutnya tidak cukup karena riwayat Git dan salinan orang lain masih menyimpannya. Pastikan juga `.env` tercantum di `.gitignore` folder `backend` (sejak Modul 16) supaya kejadian ini tidak terulang.

</details>

<details>
<summary><b>Windows: <code>npm run dev</code> memulai ulang sendiri, berhenti mendadak, atau bertanya <code>Terminate batch job (Y/N)?</code></b></summary>

- **`Change detected in '…node_modules…'` lalu `Restarting 'src/server.ts'`, padahal kamu tidak menyimpan apa pun.** Windows yang mencatat "kapan file terakhir dibaca" (*last access time*) bisa membuat `node --watch` mengira ada file berubah, misalnya sesaat setelah backend menyala atau saat program lain membaca file di `src`. Tidak ada yang rusak, tetapi semua yang hanya disimpan di memori ikut hilang: keadaan yang diinginkan, hitungan "selama", dan ingatan aturan. Kalau mengganggu, jalankan backend dengan `npm start`.
- **Ctrl + C tidak menulis `SIGINT diterima`.** Di Windows, `npm run dev` mematikan backend seketika tanpa jalur berhenti rapi. Itu wajar; pakai `npm start` kalau ingin berhenti dengan rapi (Praktik 6.10).
- **`Terminate batch job (Y/N)?`** muncul kalau npm dijalankan dari Command Prompt (`cmd.exe`). Ketik `Y`, lalu tekan **Enter**. Terminal bawaan VS Code di Windows adalah PowerShell, yang tidak menanyakannya.

</details>

<details>
<summary><b>Firmware v1.5.0 gagal dikompilasi</b></summary>

Pesan `'…' was not declared in this scope` menunjuk langkah yang terlewat:

| Nama di pesan galat | Periksa |
| :--- | :--- |
| `SUHU_KIPAS_ON_BAWAAN`, `SELISIH_KIPAS`, `BATAS_MODE_OFFLINE`, `LAMA_UJI_OFFLINE` | blok Modul 19 di `konfigurasi.h` (7.1) |
| `ambangSuhuKipas`, `ambangSuhuKipasDariNvs`, `simpanAmbangSuhuKipas` | `pengaturan.h` (7.2) |
| `aturKipasPengaman`, `kipasDariPengaman` | `aktuator.h` (7.3) |
| `modeOffline`, `catatKipasLokal`, `mulaiUjiOffline` | `jaringan.h` (7.5), lalu `#include "jaringan.h"` di `aturan.cpp` (7.4) |
| `suhuKipas` | variabel di bagian atas `pengaturan.cpp` (7.2 langkah 2) |
| `kipasMilikPengaman` | variabel di bagian atas `aktuator.cpp` (7.3 langkah 2) |

Kalau galatnya menunjuk `jaringan.cpp`, salin ulang file itu dengan **Copy raw file** (7.5). Isinya harus utuh dari baris pertama sampai baris terakhir.

</details>

<details>
<summary><b>Wokwi: Library Manager menulis <code>Error loading library index :-(</code></b></summary>

Daftar library Wokwi diunduh dari alamat `libraries.wokwi.workers.dev`. Saat modul ini diuji, DNS penyedia internet penulis memblokir alamat itu sehingga pencarian library gagal. Firmware v1.5.0 tidak butuh library baru, jadi proyek Node 1-mu tetap jalan. Kalau kamu membuat proyek baru, buat file **`libraries.txt`** lewat **▾ → New file...**, lalu isi dengan daftar dari [`kode/firmware/node-1-rumah/libraries.txt`](kode/firmware/node-1-rumah/libraries.txt) modul ini, yang sama dengan Modul 15 (`libraries.txt` proyek Node 1-mu yang lama juga bisa disalin). Wokwi membaca file itu dan memasang library-nya seperti biasa. Rangkaian Node 1 untuk proyek baru itu ada di [`diagram.json`](kode/firmware/node-1-rumah/diagram.json) di folder yang sama: salin isinya ke tab `diagram.json` proyek barumu.

</details>

<details>
<summary><b>Wokwi: <code>uji offline</code> lama sekali, atau ambangnya kembali ke 30</b></summary>

- **Lama sekali.** Simulasi Wokwi berjalan lebih lambat daripada waktu sungguhan (di laptop penulis hanya sekitar 30 % kecepatan aslinya). Jam di Serial Monitor adalah jam simulasi: 2 menit mode offline bisa memakan 6–7 menit jam dinding, dan seluruh `uji offline` sekitar 10 menit. Biarkan tab Wokwi tetap di depan; browser memperlambat tab yang tersembunyi.
- **`uji offline` berhenti sebelum 3 menit.** Perintah `restart` (atau tombol EN) menghentikannya.
- **Ambang kembali `30.0 C (angka bawaan)`.** NVS Wokwi kosong lagi setiap kali simulasi dihentikan (**■**) lalu dijalankan (**▶**). Kirim lagi `config` lewat MQTTX, dan pakai `restart` untuk meniru listrik padam.
- **`MQTT PUTUS … (kode -3)` sesekali, lalu tersambung lagi.** Di Wokwi, sambungan ke broker publik memang kadang berkedip. Kedipan seperti ini tidak memicu mode offline karena mode itu baru aktif setelah 2 menit putus terus-menerus.
- **Sesudah `uji offline`, Node 1 tidak pernah tersambung lagi.** Serial menulis sekali `MQTT gagal tersambung ke broker setelah … ms: gagal tersambung ke broker (kode -2)`, lalu diam, dan mode offline tidak pernah selesai. Di Wokwi, Node 1 menyimpan alamat IP broker publik saat pertama kali tersambung supaya tidak perlu mencarinya lagi, dan sesekali alamat itu berhenti menjawab. Ketik `restart` (ambang di NVS tetap tersimpan), lalu ulangi `uji offline`.
- **Serial menulis `Laporan mode offline terkirim …`, tetapi laporannya tidak terlihat di MQTTX.** Kalau sambungan ke broker publik berkedip tepat sesudah laporan terbit, `vitals` itu hilang di jalan karena QoS 0 tidak dikirim ulang. Ulangi `uji offline`.

</details>

<details>
<summary><b>Pengaman tidak menyalakan kipas dalam mode offline</b></summary>

- **Belum masuk mode offline.** Baris `MODE OFFLINE: …` baru muncul 2 menit setelah Node 1 **menyadari** broker hilang. Dengan kabel dicabut, Node 1 baru sadar 15–30 detik kemudian, jadi tunggu sekitar 2,5 menit.
- **Jalur laptop: broker tidak benar-benar mati.** Kalau `mosquitto -v -c mosquitto-lan.conf` di 7.10 langsung berhenti dengan `Error: Only one usage of each socket address …` (macOS dan Linux: `Error: Address already in use`), layanan Mosquitto dari Modul 12 masih menyala. Akibatnya, **Ctrl + C** di langkah 2 tidak mematikan apa pun, dan simulator tetap tersambung. Hentikan dulu layanannya seperti di 7.10, jalankan lagi `mosquitto -v -c mosquitto-lan.conf` di terminal itu, lalu ulangi dari langkah 1.
- **Suhu tidak di atas ambang.** Pengaman memakai ambang dari NVS, bukan angka di aturan server saat ini kalau `config` terakhir belum pernah sampai. Ketik `ambang` untuk melihat angkanya.
- **Kipas sudah menyala sebelum broker hilang**, misalnya dinyalakan server atau perintah Serial. Kipas itu bukan milik pengaman, jadi pengaman tidak menyentuhnya.
- **DHT22 gagal dibaca.** Pengaman sengaja diam kalau suhunya tidak terbaca, daripada menebak.

</details>

<details>
<summary><b>Kipas yang dinyalakan pengaman tidak padam setelah broker kembali</b></summary>

Pengaman hanya memadamkan kipasnya sendiri di bawah **ambang − 2**, misalnya di bawah 28 °C untuk ambang 30 °C. Kalau ambangnya dekat suhu kamar, suhu kamar mungkin tidak pernah turun serendah itu. Padamkan lewat `POST /devices/{id}/command` dengan `{"target":"kipas","nilai":false}`; perintah itu sekaligus mengambil alih kipas dari pengaman. Server juga tidak memadamkannya sendiri karena keinginan server yang sudah pernah terpenuhi tidak dipaksakan lagi (Konsep 4).

</details>

<details>
<summary><b>Node 1 sudah tersambung lagi, tetapi backend tidak mencatat laporan mode offline</b></summary>

- **Tunggu 10 detik.** Laporan sengaja dikirim 10 detik setelah tersambung (Konsep 10).
- **Backend tersambung lebih dari 10 detik sesudah perangkat**, misalnya backend baru dinyalakan belakangan. `vitals` tidak *retained*, jadi laporan yang terbit sebelum backend berlangganan tidak pernah sampai. Laporan itu tidak dikirim ulang.
- **Perangkat menyala ulang sebelum sempat melapor.** Laporan hanya disimpan di memori, jadi ikut hilang.
- **Simulator versi lama** mengirim laporannya seketika, sebelum backend sempat berlangganan. Salin lagi `alat/simulator-perangkat.js` dari kurikulum (Praktik 2.1).
- Untuk melihat apakah laporannya terbit, jalankan pemeriksa kontrak 1.3 **begitu** broker menyala lagi, atau berlangganan `rpm/<device_id>/vitals` di MQTTX. Laporannya baru terbit sekitar 10 detik setelah perangkat tersambung, jadi masih sempat. Pemeriksa yang dijalankan saat broker masih mati langsung berhenti dengan pesan `Tidak bisa tersambung ke broker …`. Di Wokwi, broker publiknya tidak pernah mati, jadi pemeriksa boleh berjalan sejak sebelum `uji offline`.

</details>

<details>
<summary><b><code>config</code> ditolak perangkat (<code>ok:false</code>), terus-menerus setiap kali menyala</b></summary>

Pesan penolakannya menyebut sebabnya: `suhu_kipas_on harus angka 15-45`, `tanah_siram harus bilangan bulat 0-100`, `ambang tidak dikenal: …`, atau `ambang harus berisi suhu_kipas_on atau tanah_siram`. Angka harus ditulis sebagai angka, bukan teks: `"suhu_kipas_on":30`, bukan `"suhu_kipas_on":"30"`. Karena `config` dikirim *retained*, `config` yang salah ditolak lagi **setiap kali** perangkat menyambung. Kirim `config` yang benar ke topik yang sama (pesan *retained* yang baru menggantikan yang lama), atau hapus dengan **Clear Retained Message** di MQTTX. Backend menerbitkan ulang `config` yang benar setiap kali ia tersambung ke broker dan setiap kali aturan diubah.

</details>

<details>
<summary><b>Log backend menulis <code>ack c-… tiba, tetapi tidak ada perintah yang menunggunya</code></b></summary>

Itu wajar. Perangkat yang baru menyambung menerima lagi `config` *retained* dari broker dan menjawabnya, padahal backend sudah selesai menunggu jawaban itu sejak lama. Baris yang sama juga muncul kalau kamu mengirim perintah lewat MQTTX karena backend tidak menunggu `ack` untuk perintah yang bukan miliknya.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Tidak ada yang wajib dikerjakan, dan modul berikutnya tidak bergantung padanya.

<details>
<summary><b>Socket.IO, WebSocket murni, dan SSE</b></summary>

Socket.IO bukan satu-satunya cara mengalirkan data dari server ke layar. Dua pilihan lain yang sering kamu temui adalah WebSocket murni dan SSE (*Server-Sent Events*, kiriman dari server):

| | Socket.IO 4.8.4 (modul ini) | WebSocket murni (`@fastify/websocket` 11.3.4) | SSE (`@fastify/sse` 0.6.1) |
| :--- | :--- | :--- | :--- |
| Arah | Dua arah | Dua arah | Satu arah: server → browser |
| Berjalan di atas | Protokolnya sendiri, di atas WebSocket atau HTTP *long polling* | WebSocket apa adanya | HTTP biasa (`text/event-stream`) |
| Sambung ulang | Otomatis | Dibuat sendiri | Otomatis oleh `EventSource` di browser |
| *Room* dan siaran | Bawaan (`join`, `to`) | Dibuat sendiri | Dibuat sendiri |
| Jawaban (*acknowledgement*) | Bawaan (`emitWithAck`) | Dibuat sendiri | Tidak ada karena satu arah |
| Klien | Harus klien Socket.IO | Klien WebSocket apa pun | `EventSource` bawaan browser |

Karena Socket.IO punya protokol sendiri, klien WebSocket murni tidak bisa langsung berbicara dengannya. Itulah sebabnya `terminal-live.js` memakai paket `socket.io-client`. Jawaban `curl.exe` di Kemenangan Cepat pun diawali angka `0`: kode paket "buka" milik **Engine.IO**, lapisan pengangkut di bawah Socket.IO.

Kalau data hanya perlu mengalir ke browser, SSE sudah cukup dan lebih sederhana. Modul ini memilih Socket.IO karena *room*, jawaban, dan sambung ulangnya sudah tersedia, dan karena Modul 20 akan memeriksa identitas pengguna saat jabat tangannya (*handshake*).

</details>

<details>
<summary><b>AWS dan Azure: <i>desired</i> dan <i>reported</i> versi industri</b></summary>

Pola Konsep 3 dan 4 bukan karangan kurikulum ini. Layanan IoT awan terbesar memakai gagasan yang sama, hanya dengan nama lain:

| Gagasan | Azure IoT Hub | AWS IoT | Rumah Pintar Mini (kontrak 1.3) |
| :--- | :--- | :--- | :--- |
| Perintah sekarang, harus dijawab, gagal kalau tidak dijawab | *Direct method* (batas waktu bawaan 30 detik) | — | `cmd` `"aksi":"set"` → `ack` dalam 5 detik, API menjawab `504` |
| Keadaan yang diinginkan, bertahan walau perangkat putus | *Desired properties* di *device twin* | `desired` di *Device Shadow* | `cmd` `"aksi":"config"` *retained*, `desired` di memori backend |
| Laporan keadaan dari perangkat | *Reported properties* | `reported` | `state` di `telemetry` dan `ack` |
| Selisih keduanya | — | `delta` | `selisih` di `GET /devices/{id}/state` |
| Menjodohkan jawaban dengan perintah | Nomor permintaan | `clientToken` | `id` perintah |

Dokumentasi Azure bahkan memberi contoh yang sama dengan modul ini: *direct method* cocok untuk "menyalakan kipas" yang harus dijawab saat itu juga, sedangkan *desired properties* dipakai untuk keadaan jangka panjang yang dibaca perangkat begitu tersambung lagi. MQTT versi 5 juga punya cara bawaan untuk menjodohkan jawaban (*Response Topic* dan *Correlation Data*). Kontrak proyek memakai MQTT 3.1.1, jadi penjodohnya dibuat sendiri: kolom `id` di `cmd` dan `ack`.

</details>

<details>
<summary><b>Home Assistant: aturan otomatis di rumah pintar sungguhan</b></summary>

**Home Assistant**, perangkat lunak rumah pintar sumber terbuka yang populer, punya pemicu *numeric state* dengan dua pilihan yang mirip aturan ambang modul ini:

- `above: 30` bereaksi saat nilai **melintas** dari 30 ke atasnya, dan tidak terus bereaksi selama nilainya tetap di atas 30. Sama dengan `nilaiAmbang()`, yang hanya memutuskan di tepi.
- `for` berarti nilainya harus **bertahan** selama waktu tertentu, sama dengan `selama_detik`. Dokumentasinya juga jujur: hitungan `for` diulang dari nol kalau Home Assistant dimulai ulang. Hitungan "120 detik" backend kita pun hilang saat *restart*.

Home Assistant juga mencatat **siapa** yang mengubah sebuah keadaan: manusia atau otomasi. Itulah gagasan di balik kolom `sumber` dan `aturan_id` di tabel `commands` dan `events`. Setelah Modul 20 menambahkan *login*, pengguna yang masuk bisa menjadi sumber berikutnya.

</details>

<details>
<summary><b>Antrean perintah dan <i>message queue</i></b></summary>

Backend v0.4 tidak menyimpan antrean perintah. Perintah untuk perangkat yang `offline` langsung ditolak `409`, dan perintah yang tidak dijawab dalam 5 detik dianggap gagal. Itu disengaja. Perintah lama yang tertahan lalu terkirim belakangan justru berbahaya: bayangkan kipas yang tiba-tiba menyala satu jam setelah kamu memintanya. Keadaan yang memang harus bertahan memakai jalan lain: `config` *retained* di broker dan `desired` yang dicocokkan ulang (Konsep 4).

Ada pekerjaan yang memang harus tahan *restart*, misalnya "kirim laporan bulanan" atau "coba kirim ulang pesan gagal sampai berhasil". Untuk itu, orang memakai **antrean pekerjaan tahan *restart*** (*durable job queue*):

- **pg-boss** (12.38.0) menyimpan antreannya di PostgreSQL, jadi cocok dengan database proyek ini tanpa server tambahan. Ia mendukung percobaan ulang dengan jeda yang makin panjang dan jadwal ala cron.
- **BullMQ** (6.3.19) menyimpan antreannya di **Redis**, sebuah server database lain yang sangat cepat.

README node-cron sendiri menyarankan hal serupa: untuk pekerjaan yang butuh percobaan ulang dan prioritas, pakai antrean seperti BullMQ. Ingat juga Konsep 8: node-cron 4 tidak memutar ulang jadwal yang terlambat lebih dari batas toleransinya, dan tidak tahu apa pun tentang jadwal yang lewat saat backend mati. Antrean tahan *restart* menyimpan pekerjaan dan riwayatnya di database sehingga pekerjaan yang sudah masuk antrean tetap dikerjakan begitu backend menyala lagi.

</details>

<details>
<summary><b>Idempotensi: perintah yang terkirim dua kali</b></summary>

Sebuah operasi disebut **idempoten** kalau hasilnya tetap sama, baik dikerjakan sekali maupun dua kali. "Nyalakan kipas" idempoten (kipas yang sudah menyala tetap menyala), sedangkan "siram 10 detik" tidak (dua kali berarti 20 detik).

Proyek ini sudah punya satu lapis pengaman: Node 1 mengingat delapan `id` perintah terakhir, jadi `cmd` yang sama yang terkirim dua kali oleh broker (QoS 1 bisa begitu) hanya dikerjakan sekali (kontrak aturan 8). Lapis kedua belum ada: kalau aplikasi mengirim `POST /devices/{id}/command` dua kali karena tombolnya terklik ganda atau sinyal HP putus-sambung, backend membuat **dua** `id` berbeda, dan pompa menyiram dua kali. (Aturan "satu perintah menunggu untuk setiap aktuator" dari Konsep 3 hanya menolak permintaan kedua yang tiba selagi yang pertama masih menunggu `ack`, padahal penantian itu biasanya cuma beberapa milidetik.)

Cara umum menutup celah itu adalah **kunci idempotensi** (*idempotency key*). Aplikasi membuat satu kode acak untuk setiap tindakan pengguna, lalu mengirimnya di kepala HTTP `Idempotency-Key`. Server menyimpan kunci itu beserta jawabannya:

| Permintaan yang datang | Jawaban server |
| :--- | :--- |
| Kunci baru | Kerjakan seperti biasa, simpan kunci dan jawabannya |
| Kunci lama, isi sama, jawaban sudah ada | Kirim **jawaban yang tersimpan**, tanpa mengerjakan ulang |
| Kunci lama, permintaan pertama masih dikerjakan | `409 Conflict` |
| Kunci lama, isi berbeda | `422 Unprocessable Content`: satu kunci tidak boleh dipakai untuk dua permintaan berbeda |

Aturan ini berasal dari usulan standar IETF *The Idempotency-Key HTTP Header Field* (belum menjadi RFC). Stripe, layanan pembayaran yang terkenal dengan API-nya, memakai pola yang sama; kuncinya baru boleh dibuang setelah berumur sekitar 24 jam. Di PostgreSQL, "simpan kunci kalau belum ada" bisa ditulis dengan `INSERT … ON CONFLICT DO NOTHING`, dan pembersihan harian cocok untuk tugas node-cron.

</details>

<details>
<summary><b>Server Telegram tiruan: cara penulis menguji bot tanpa akun</b></summary>

Kode modul ini diuji tanpa bot Telegram sungguhan supaya tidak ada token asli yang beredar. Caranya, grammY bisa diarahkan ke alamat server Bot API lain dengan pilihan `apiRoot`, dan `telegram.ts` sudah menyiapkannya lewat `TELEGRAM_API_ROOT`:

```ts
bot = new Bot(token, apiRoot === "" ? undefined : { client: { apiRoot } });
```

grammY menyusun alamat setiap panggilan sebagai `<apiRoot>/bot<token>/<nama panggilan>` dan selalu mengirimnya sebagai POST berisi JSON. Penulis membuat server kecil di laptop yang melayani empat panggilan yang dipakai bot ini: `getMe` (bot ini siapa?), `deleteWebhook`, `getUpdates` (ada pesan baru?), dan `sendMessage`. Server tiruan itu juga bisa berpura-pura menjadi pengguna yang mengirim `/start` atau `/status`, menolak semua panggilan dengan `401` seperti token yang dicabut, dan dimatikan untuk meniru internet putus. Dari situlah baris-baris `ERROR` di langkah 6.9 berasal.

Catatan server tiruan itu memperlihatkan *long polling* dari sisi server (jam UTC):

```text
2026-10-21T00:10:22.202Z getUpdates offset=1 timeout=30 -> 0 update setelah ditahan 30008 ms
2026-10-21T00:10:49.928Z [uji] pesan dari 555000222: /start (update_id 1000)
2026-10-21T00:10:49.929Z getUpdates offset=1 timeout=30 -> 1 update setelah ditahan 27722 ms
2026-10-21T00:10:49.935Z sendMessage
2026-10-21T00:10:49.936Z sendMessage ke 555000222: Halo! chat_id kamu: 555000222
Tulis angka ini sebagai TELEGRAM_CHAT_ID di .env backend.
```

Pertanyaan `getUpdates` ditahan sampai 30 detik. Kalau tidak ada pesan, jawabannya kosong dan bot langsung bertanya lagi. Begitu ada pesan, pertanyaan yang sedang ditahan langsung dijawab (di contoh ini setelah menunggu 27,7 detik), dan 6 milidetik kemudian bot sudah mengirim balasannya.

Dua hal lain yang perlu kamu tahu tentang cara bot menerima pesan:

- ***Webhook*** adalah kebalikannya: Telegram yang mengetuk server kita setiap ada pesan. Cara ini butuh alamat HTTPS yang bisa dijangkau dari internet, jadi baru masuk akal setelah backend pindah ke server sungguhan (Modul 26–27). Kedua cara itu tidak bisa dipakai bersamaan untuk satu bot. Karena itu, grammY memanggil `deleteWebhook` setiap kali bot dinyalakan.
- **Satu token hanya boleh dipakai satu program *long polling*.** Kalau dua program menyala dengan token yang sama (misalnya backend di dua laptop), Telegram menolak salah satunya dengan galat `409` (*Conflict*), dan bot itu berhenti.

Batas laju Telegram juga longgar untuk kebutuhan kita. Dokumentasi resminya menyarankan tidak mengirim lebih dari satu pesan per detik ke satu percakapan. Berkat peredam, bot rumah ini paling banyak mengirim beberapa pesan per jam.

</details>

## 🧩 Tantangan mandiri

Tingkat 1 cukup dikerjakan lewat `/docs` atau Bruno, tanpa mengubah kode. Tingkat 2 dan 3 mengubah kode backend, jadi kerjakan **setelah** ➕ C (cabang `fitur/otomasi` sudah di-*merge*), di cabang baru dari `main`, seperti Modul 16–18: `git switch main`, `git pull`, lalu `git switch -c fitur/<nama-tantangan>`. Tingkat 1 dan 2 punya kunci jawaban; isi lengkap file kunci Tingkat 2 ada di [`kode/tantangan/kunci/`](kode/tantangan/kunci/).

### Tingkat 1 — Siram pagi dan sore (ubah sedikit)

Saat musim kemarau, tanaman perlu disiram dua kali sehari. Ubah aturan **Siram pagi** (aturan 2) supaya pompa menyala 10 detik pada pukul **06.00 dan 17.00 WIB**, tanpa membuat aturan baru dan tanpa mengubah kode. Petunjuk: ekspresi cron menerima daftar angka yang dipisahkan koma.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Kirim `PUT /rules/2` dengan isi yang sama seperti Praktik 5, hanya `cron`-nya yang diganti (jalur perangkat: `device_id` milikmu):

```json
{"nama":"Siram pagi","aktif":true,"kondisi":{"jenis":"jadwal","cron":"0 6,17 * * *"},"aksi":{"jenis":"perintah","device_id":"f00d00000001","perintah":{"target":"pompa","nilai":10},"kabari":true}}
```

**Hasilnya** kode `200`, dengan `"berikutnya":"2026-10-21T10:00:00Z"` (**contoh**, dikirim sebelum pukul 17.00 WIB): pukul 10.00 UTC sama dengan 17.00 WIB hari ini. Log backend (**contoh**):

```text
[10:51:47] INFO: jadwal aturan 2 (Siram pagi) dipasang: "0 6,17 * * *" Asia/Jakarta, berikutnya 21 Okt 2026, 17.00 WIB
[10:51:47] INFO: Aturan 2 (Siram pagi) diubah lewat API: pompa f00d00000001 = 10 setiap "0 6,17 * * *" WIB
```

- `6,17` di bidang jam berarti "jam 6 **dan** jam 17". Bidang menit `0` berlaku untuk keduanya.
- Kalau kamu mengirimnya sesudah pukul 17.00 WIB, `berikutnya` menjadi pukul 06.00 WIB besok (`…T23:00:00Z`).
- Nama aturannya boleh diganti, misalnya `Siram pagi dan sore`. Nama itu ikut muncul di log, buku kejadian, dan pesan Telegram.
- Untuk kembali ke sekali sehari, kirim lagi isi yang sama dengan `"cron":"0 6 * * *"`.

</details>

### Tingkat 2 — Nyalakan kipas dari Telegram (isi bagian rumpang)

Selama ini bot hanya mengabari. Tambahkan perintah **`/kipas`** supaya pemilik bisa menyalakan dan memadamkan kipas dari HP, misalnya `/kipas f00d00000001 on`. Perintah ini harus lewat pintu yang sama dengan API, aturan, dan jadwal (dengan sumber **`telegram`**) supaya tercatat di tabel `commands` dan tetap mematuhi semua pengaman `perintahkan()`.

Di **`src/services/telegram.ts`**, tambahkan `import { perintahkan } from "./perintah.ts";` di bawah impor `semuaPerangkat`. Lalu, di dalam `mulaiTelegram()`, tepat di bawah penutup `});` milik `bot.command("status", …)`, tambahkan blok berikut dan isi setiap `____`:

```ts
  bot.command("____", async (ctx) => { // Tantangan Tingkat 2, misalnya "/kipas f00d00000001 on"
    if (ctx.chat.id !== ____) {
      await ctx.reply("Maaf, bot ini hanya melayani pemiliknya.");
      return;
    }
    const [deviceId, kata] = ctx.match.trim().split(/\s+/); // ctx.match = teks sesudah "/kipas"
    if (deviceId === "" || (kata !== "on" && kata !== "off")) {
      await ctx.reply("Cara pakai: /kipas <device_id> on, atau /kipas <device_id> off");
      return;
    }
    const hasil = await perintahkan(deviceId, { target: "kipas", nilai: kata === "____" }, "____");
    if (hasil.status === "dijawab" && hasil.ack.ok) {
      await ctx.reply(`✅ kipas ${deviceId} ${kata === "on" ? "menyala" : "padam"} (dijawab dalam ${hasil.lama_ms} ms)`);
    } else if (hasil.status === "dijawab") {
      await ctx.reply(`⚠️ ${deviceId} menolak perintah kipas: ${hasil.ack.pesan ?? "tanpa alasan"}`);
    } else if (hasil.status === "tanpa-ack") {
      await ctx.reply(`⚠️ ${deviceId} tidak menjawab dalam 5 detik`);
    } else {
      await ctx.reply(`⚠️ perintah tidak dikirim: ${hasil.pesan}`);
    }
  });
```

`ctx.match` berisi teks sesudah nama perintahnya, misalnya `f00d00000001 on`. Uji dengan `npm run cek`, jalankan backend, lalu kirim ke bot-mu: `/kipas f00d00000001 on`, `/kipas f00d00000001 off`, dan `/kipas` saja.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

- `bot.command("kipas", …)`: nama perintahnya, tanpa garis miring. grammY menolak `bot.command("/kipas", …)` dengan galat.
- `if (ctx.chat.id !== chatPemilik)`: perintah yang **mengubah** sesuatu di rumah lebih berbahaya daripada `/status`, jadi wajib dibatasi untuk pemilik saja.
- `nilai: kata === "on"` dan sumber `"telegram"`.

**Hasilnya** (**contoh**, diuji penulis lewat server Telegram tiruan). Balasan bot berturut-turut untuk `/kipas f00d00000001 on`, `/kipas f00d00000001 off`, `/kipas`, `/kipas f00d00000001 nyala`, `/kipas a4cf12e5b7c0 on` (perangkat yang belum terdengar sejak backend menyala), dan `/kipas f00d00000001 on` dari akun orang lain:

```text
✅ kipas f00d00000001 menyala (dijawab dalam 4 ms)
✅ kipas f00d00000001 padam (dijawab dalam 7 ms)
Cara pakai: /kipas <device_id> on, atau /kipas <device_id> off
Cara pakai: /kipas <device_id> on, atau /kipas <device_id> off
⚠️ perintah tidak dikirim: perangkat a4cf12e5b7c0 belum pernah terdengar
Maaf, bot ini hanya melayani pemiliknya.
```

Log backend menulis `perintah c-… (telegram) ke f00d00000001: kipas = true, ack ok=true dalam 4 ms`, dan di psql:

```sql
SELECT to_char(dikirim AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS') AS jam_wib, id, target, nilai, sumber, ack_ok
FROM commands WHERE sumber = 'telegram' ORDER BY dikirim;
```

```text
 jam_wib  |         id          | target | nilai |  sumber  | ack_ok 
----------+---------------------+--------+-------+----------+--------
 10:51:52 | c-20261021-035152-4 | kipas  | true  | telegram | t
 10:51:56 | c-20261021-035156-5 | kipas  | false | telegram | t
(2 rows)
```

Perintah dari Telegram juga menjadi keadaan yang diinginkan server, persis seperti perintah lewat API: `GET /devices/f00d00000001/state` sesudahnya menjawab `"desired":{"kipas":false}`. Kalau kipas itu sedang dinyalakan pengaman lokal, `/kipas … off` sekaligus mengambil alih kipas itu (Konsep 10). Isi lengkap file: [`telegram.ts`](kode/tantangan/kunci/backend/src/services/telegram.ts).

</details>

### Tingkat 3 — Laporan harian pukul 20.00 WIB (buat dari nol)

Setiap malam pukul **20.00 WIB**, bot mengirim ringkasan hari itu untuk setiap perangkat, misalnya `📊 Ringkasan 21 Okt: f00d00000001 suhu rata-rata 28,1 °C (25–33 °C)`. Buat file baru **`src/services/laporan.ts`** dengan fungsi `pasangLaporanHarian()`, lalu panggil fungsi itu sekali dari `server.ts`, di dekat `mulaiTelegram(…)`.

Petunjuk:

- Pakai node-cron seperti `jadwal.ts`: `cron.schedule("0 20 * * *", …, { name: "laporan-harian", timezone: ZONA })`. Konstanta `ZONA` sudah diekspor `jadwal.ts`. Tugas ini bukan aturan di tabel `rules`, jadi tidak ikut dibongkar `pasangJadwal()`, tetapi tetap ikut berhenti saat `cron.shutdown()` dipanggil waktu backend berhenti dengan rapi.
- Ambil angkanya dari buku ringkasan Modul 18 dengan rumus `rata × n`, misalnya:

  ```sql
  SELECT device_id,
         round((sum(suhu_rata * suhu_n) / nullif(sum(suhu_n), 0))::numeric, 1) AS suhu_rata,
         min(suhu_min) AS suhu_min, max(suhu_maks) AS suhu_maks
  FROM readings_per_jam
  WHERE jam >= date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta'
  GROUP BY device_id ORDER BY device_id;
  ```

  `WHERE` itu berarti "sejak pukul 00.00 WIB hari ini". Jalankan dari kode dengan `pool.query(…)` (`src/db/pool.ts`), seperti fungsi-fungsi di `arsip.ts`.
- Susun teksnya, lalu kirim dengan `kabari(teks)`. Untuk angka desimal, pakai `Intl.NumberFormat("id-ID", …)` seperti di `telegram.ts` supaya tertulis `28,1`, bukan `28.1`.

**Periksa sendiri jawabanmu.** Untuk sementara, ganti `"0 20 * * *"` dengan waktu dua menit dari sekarang, misalnya `"52 10 * * *"` kalau sekarang pukul 10.50 WIB. Tepat pada menit itu, log menulis `Telegram terkirim: 📊 …`, dan HP-mu menerima ringkasannya. `npm run cek` dan `npm test` harus tetap bersih. Kembalikan jadwalnya ke `"0 20 * * *"` sebelum *commit*. Tingkat ini tidak punya kunci; ketiga pemeriksaan itulah kuncinya.

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini mendapat **otak otomasi**, di server dan di Node 1, beserta **notifikasi**. Bacaan mengalir *live* lewat Socket.IO, semua perintah lewat satu pintu dengan jawaban yang ditunggu, aturan dan jadwal tersimpan di database dan bisa diubah lewat API, setiap tindakan tercatat di buku kejadian, Telegram mengabari pemiliknya, dan Node 1 menjaga kipas sendiri saat broker hilang. Backend naik ke **v0.4**, firmware Node 1 ke **v1.5.0**, dan kontrak data ke **1.3**.

![Diagram proyek Rumah Pintar Mini setelah Modul 19: rumah mulai bereaksi sendiri dengan data live, aturan otomatis, Telegram, dan pengaman lokal; garis putus-putus berarti pilihan, pensiun, atau menyusul. Baris atas dari kiri: Node 2 Kebun v1.0.0 dengan baterai 18650, tidak berubah, mengirim ESP-NOW ke Node 1 Rumah v1.5.0, kotak teal: baru menerima config ke NVS, punya pengaman kipas lokal, mode offline, dan state di telemetry, firmware baru dari Praktik 7. Node 1 mengirim MQTT ke Gateway Raspberry Pi 192.168.1.37, yang berisi Mosquitto (broker MQTT) dan Node-RED (dashboard, kartu Kebun, grup Sensor RS-485), dengan kotak putus-putus otomasi kipas yang dicoret, tetap pensiun sejak Modul 16. Pi tersambung ke HP (Node-RED dan Telegram). Di bawah HP ada kotak Telegram, server Bot API untuk peringatan dan /status: panah peringatan naik ke HP, dan panah /status turun dari HP. Di kiri, simulator Modul 19 (pilihan, kotak putus-putus): pengganti perangkat sungguhan, f00d00000001 sampai f00d00000010, suhunya diatur dari terminal (suhu 33), dan masuk mode offline saat broker mati; ia tersambung ke broker lewat MQTT. Tengah, kotak hijau Laptop, backend di 127.0.0.1:8080. Broker mengirim rpm/# ke backend, dan backend mengirim cmd (set dan config) ke broker. Telegram tersambung ke backend lewat internet, HTTPS keluar, long polling. Kotak backend v0.4: Fastify dan TypeScript dengan kontrak data 1.3; baru: Socket.IO di /socket.io/, satu pintu perintahkan(), desired dan reported, mesin aturan dengan Vitest, juru jadwal node-cron, bot Telegram grammY dengan long polling; arsip ke database, versi 0.4.0 di /docs. Daftar API v0.3 ditambah yang baru: GET /health, GET /devices, GET /devices/:id/latest, GET /devices/:id/vitals, GET /devices/:id/readings, POST /devices/:id/command, GET /devices/:id/state (baru), GET /rules (baru), POST /rules (baru), PUT /rules/:id (baru), POST /rules/:id/jalankan (baru), dan GET /docs. Di bawahnya, lewat pg (pool), kotak biru Docker Desktop: kontainer rumahpintar-db, PostgreSQL 17 dan TimescaleDB 2.30.2, volume rumahpintar-data, loket 127.0.0.1:5432; tabel baru events sebagai buku kejadian, commands ditambah sumber, aturan_id, dan state, rules ditambah diubah dan kini dipakai backend, dan yang tetap: hypertable readings, readings_per_jam, dan petugas. Tamu di kanan: terminal kecil (Socket.IO, terminal-live.js) menerima data live; Bruno (ditambah aturan, keadaan, jadwal) dan browser yang membuka /docs memakai HTTP; DBeaver lewat loket 5432 dan psql lewat docker exec ke database; folder backup/ berisi berkas pg_dump dari Modul 18. Kiri bawah, catatan jujur: backend masih di laptop; kalau laptop mati, aturan server ikut berhenti, dan pengaman lokal hanya menjaga kipas saat broker hilang. Bawah, kotak GitHub rumah-pintar-mini, cabang fitur/otomasi lalu pull request ke main: backend/migrasi/007_aturan_dan_kejadian.sql (baru); backend/src/services/ realtime, perintah, otomasi, jadwal, telegram, kejadian, log (baru); backend/src/aturan/mesin.ts dan mesin.test.ts (baru); backend/src/routes/aturan.ts (baru); alat/terminal-live.js (baru); alat/simulator-perangkat.js dan pemeriksa-kontrak.js (1.3); KONTRAK-DATA.md (1.3); backend/README.md (v0.4); firmware/node-1-rumah/ (v1.5.0); backend/.env.example ditambah TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID (kosong); backend/src/schemas/aturan.ts (baru); dan backend/bruno/ ditambah 4 permintaan. Kanan bawah, kotak putus-putus menyusul: Modul 20, login dan peran, Socket.IO ikut dikunci; Modul 21, kunci perangkat dan hak akses broker (ACL); Modul 22–23, dashboard React dengan data live lewat Socket.IO.](aset/diagram-proyek-modul-19.png)

> 🖥️ **Alat yang dipakai:** **VS Code** (folder `rumah-pintar-mini` beserta terminalnya) dan **browser** yang sudah masuk ke GitHub.
>
> ⭐ **Wajib** — langkah C menggabungkan semua pekerjaan Modul 19 ke `main`, dan Modul 20 dimulai dari sana.

| File di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `backend/package.json`, `package-lock.json` | paket `socket.io`, `node-cron`, dan `grammy`; `vitest` dan `vite` sebagai alat pengembangan; skrip `test`; versi 0.4.0 (Kemenangan Cepat, Praktik 3, 5, 6, dan 8) |
| `backend/src/services/realtime.ts` | **baru**: Socket.IO dengan satu *room* untuk setiap perangkat (Kemenangan Cepat, Praktik 1) |
| `backend/src/services/log.ts`, `perintah.ts` | **baru**: satu pintu untuk semua perintah, keadaan yang diinginkan dan yang dilaporkan (Praktik 2) |
| `backend/src/schemas/kontrak.ts`, `src/services/gudang.ts`, `src/routes/perangkat.ts` | kontrak data 1.3 dan rute `GET /devices/:id/state` (Praktik 2) |
| `backend/src/aturan/mesin.ts`, `mesin.test.ts`, `src/schemas/aturan.ts` | **baru**: otak aturan dan 11 *unit test* (Praktik 3 dan 5) |
| `backend/migrasi/007_aturan_dan_kejadian.sql` | **baru**: kolom baru di `rules` dan `commands`, serta tabel `events` (Praktik 4) |
| `backend/src/services/otomasi.ts`, `kejadian.ts`, `src/routes/aturan.ts`, `src/db/arsip.ts` | **baru** dan diubah: aturan dari database, buku kejadian, dan API `/rules` (Praktik 4) |
| `backend/src/services/jadwal.ts` | **baru**: jadwal dengan node-cron (Praktik 5) |
| `backend/src/services/telegram.ts`, `src/config/env.ts`, `.env.example` | **baru** dan diubah: bot Telegram (Praktik 6) |
| `backend/src/server.ts`, `src/services/mqtt.ts` | semua bagian di atas disambungkan, berhenti dengan rapi, dan versi 0.4.0 di `/docs` (Kemenangan Cepat sampai Praktik 8) |
| `backend/bruno/` | empat permintaan baru untuk aturan, jadwal, dan keadaan aktuator (Praktik 8) |
| `alat/terminal-live.js`, `alat/package.json`, `package-lock.json` | **baru** dan diubah: terminal kecil dan paket `socket.io-client` (Kemenangan Cepat; terminal kecil diperbarui lagi di Praktik 1, 2, dan 4) |
| `alat/simulator-perangkat.js`, `alat/pemeriksa-kontrak.js` | simulator versi Modul 19 dan pemeriksa versi 1.3 (Praktik 2) |
| `firmware/node-1-rumah/` | **v1.5.0**: `config` disimpan di NVS, mode offline, pengaman kipas, `state` di `telemetry`, dan perintah `uji offline` (Praktik 7) |
| `KONTRAK-DATA.md` | versi 1.3 (langkah B) |
| `backend/README.md` | cara menjalankan dan memakai backend v0.4 (langkah A) |

### A. Perbarui `backend/README.md`

Teman satu tim yang meng-*clone* repositorimu perlu tahu tiga hal baru: setelan Telegram yang boleh dikosongkan, perintah `npm test`, dan rute serta aturan otomatis yang kini tersedia. Ganti isi `backend/README.md` dengan:

````markdown
# Backend Rumah Pintar Mini

Backend v0.4 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.3 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL dengan tambahan TimescaleDB (lewat Docker), dan menyediakan API berdokumentasi. Riwayat bacaan bisa diminta mentah atau sudah diringkas per 15 menit, per jam, atau per hari. Sejak Modul 19, bacaan juga mengalir *live* lewat Socket.IO, semua perintah lewat satu pintu (dengan keadaan yang diinginkan dan yang dilaporkan), aturan otomatis dan jadwal disimpan di database dan bisa diubah lewat API tanpa memulai ulang server, setiap kejadian penting dicatat, dan peringatan dikirim lewat Telegram.

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
7. (Tidak wajib) Untuk peringatan Telegram, isi `TELEGRAM_BOT_TOKEN` (token dari @BotFather) dan `TELEGRAM_CHAT_ID` (angka yang dibalas bot saat kamu mengirim `/start`) di `.env`. Kosong = notifikasi Telegram mati. Token itu rahasia, seperti kata sandi.
8. Jalankan `npm run dev`, lalu buka dokumentasinya di `http://127.0.0.1:8080/docs`.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | menjalankan server dan memulainya ulang setiap kali kode disimpan |
| `npm start` | menjalankan server tanpa mulai ulang otomatis; **Ctrl + C** menghentikannya dengan rapi (di Windows, `npm run dev` + **Ctrl + C** mematikan server seketika) |
| `npm run cek` | memeriksa tipe TypeScript, termasuk file uji (jalankan sebelum setiap *commit*) |
| `npm test` | menjalankan *unit test* *rules engine* (`src/aturan/*.test.ts`) dengan Vitest |
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
| `POST /devices/:id/command` | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` (dengan `sumber` `api`) |
| `GET /devices/:id/state` | keadaan aktuator: yang diinginkan server (`desired`), yang terakhir dilaporkan perangkat (`reported`, dari `telemetry.state` atau `ack.state`), kapan laporan itu tiba, dan aktuator yang belum cocok (`selisih`) |
| `GET /rules` | semua aturan otomatis yang sedang dipakai server; aturan jadwal ditambah `berikutnya` (UTC) |
| `POST /rules` | buat aturan baru: ambang (`kondisi.jenis` `ambang` + `aksi.jenis` `sakelar`) atau jadwal (`jadwal` + `perintah`); langsung berlaku |
| `PUT /rules/:id` | ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server, dan ambang aturan kipas dikirim ke perangkat sebagai `config` *retained* |
| `POST /rules/:id/jalankan` | jalankan aksi satu aturan jadwal sekarang juga (untuk menguji, tanpa menunggu jamnya) |

Data *live* tersedia lewat **Socket.IO** di alamat yang sama (`/socket.io/`): kirim `ikuti` dengan `device_id` (jawabannya membawa bacaan terakhir) untuk menerima acara `telemetry` perangkat itu; acara `status` dan `kejadian` dikirim ke semua klien. Contoh klien: `alat/terminal-live.js`.

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

## Batasan v0.4

- `GET /devices`, `latest`, `vitals`, dan `state` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Keadaan yang diinginkan (`desired`) dan hitungan "selama" setiap aturan juga hilang saat server dimulai ulang; riwayat bacaan, perintah, aturan, dan kejadian tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Bacaan mentah hanya disimpan 90 hari; yang lebih tua tinggal ringkasan per jamnya.
- Hari pada ringkasan `1d` adalah hari WIB (`Asia/Jakarta`), juga bagi perangkat di WITA atau WIT. Jadwal aturan juga dihitung dalam WIB.
- Aturan dan jadwal hanya berjalan selama backend menyala. Jadwal yang terlambat lebih dari 15 menit (misalnya laptop tidur pukul 06.00) tidak dijalankan belakangan, hanya dicatat; kalau backend mati pada jam itu, tidak ada yang dicatat. Saat broker tak terjangkau, Node 1 menjalankan pengaman kipasnya sendiri dengan ambang dari `config`.
- Perubahan aturan langsung di database (misalnya lewat DBeaver) baru terbaca saat server dimulai ulang atau saat aturan lain diubah lewat API; pakai API `/rules`.
- Server hanya menerima tamu dari laptop ini (`127.0.0.1`) karena API dan Socket.IO belum punya *login*.
````

Lalu simpan ke cabang `fitur/otomasi`. Terminal dari 8.5 masih berada di folder `rumah-pintar-mini`, jadi masuk dulu ke folder `backend` (`cd backend`), lalu jalankan:

```text
git add README.md
git commit -m "README backend v0.4 (Modul 19)"
```

### B. Perbarui `KONTRAK-DATA.md` ke versi 1.3

1. Di VS Code dengan folder `rumah-pintar-mini`, buka `KONTRAK-DATA.md`, lalu salin dulu isi tabel **Perangkatku** (paling bawah) ke catatanmu: penggantian berikut ikut mengosongkan tabel itu.
2. Buka [`proyek-rumah-pintar-mini/KONTRAK-DATA.md`](../../proyek-rumah-pintar-mini/KONTRAK-DATA.md) di tab baru, klik **Copy raw file**, lalu ganti seluruh isi file-mu dengannya (**Ctrl + A**, lalu **Ctrl + V**).
3. Isi lagi tabel **Perangkatku** dari catatanmu, lalu simpan (**Ctrl + S**).

Versi 1.3 menambahkan bagian **Keadaan aktuator `state` di `telemetry` Node 1**, laporan mode offline di `vitals`, rincian isi `config`, aturan bersama nomor 10 tentang pesan *retained*, dan baris riwayat 1.3. Simpan ke cabang. Kembali dulu ke folder `rumah-pintar-mini` (`cd ..`), lalu jalankan:

```text
git add KONTRAK-DATA.md
git commit -m "Kontrak data 1.3: state di telemetry, laporan mode offline, rincian config (Modul 19)"
git push
```

### C. ⭐ Gabungkan `fitur/otomasi` ke `main` lewat *pull request*

Semua *commit* Kemenangan Cepat sampai Praktik 8, serta langkah A dan B, ada di cabang `fitur/otomasi`. Saatnya meninjau dan menggabungkannya, persis seperti Modul 18 ➕ B:

1. **Buka *pull request*.** Di repositori `rumah-pintar-mini` di GitHub, klik **Compare & pull request** pada pita kuning cabang `fitur/otomasi`. Kalau pitanya sudah hilang, buka tab **Pull requests** → **New pull request**, lalu pilih **base: `main`** ← **compare: `fitur/otomasi`**. Di bawah **Apa yang berubah?**, tulis misalnya: `Backend v0.4: data live lewat Socket.IO, satu pintu perintah dengan desired/reported, aturan otomatis dan jadwal di database (API /rules), buku kejadian, bot Telegram, dan berhenti dengan rapi. Firmware Node 1 v1.5.0 dengan pengaman lokal dan mode offline. Kontrak data 1.3.` Klik **Create pull request**.
2. ***Review* dengan checklist.** Di tab **Files changed**, pastikan migrasi `007_aturan_dan_kejadian.sql`, `src/aturan/mesin.test.ts`, dan folder `firmware/node-1-rumah` ikut. Pastikan juga **tidak ada** file `.env`: file itu kini berisi token bot Telegram-mu. Kalau `.env` sampai muncul di daftar, jangan di-*merge*: buat token baru lewat `/token` di @BotFather lebih dulu karena token di riwayat GitHub sudah dianggap bocor. Lalu centang checklist di tab **Conversation** sesuai keadaan sebenarnya. Butir `KONTRAK-DATA.md` boleh dicentang karena langkah B sudah memperbaruinya. Kirim ringkasan lewat **Review changes** → **Comment** → **Submit review**.
3. ***Merge.*** Pilih **Create a merge commit**, klik **Merge pull request** → **Confirm merge**, lalu **Delete branch**.
4. **Pulang ke `main` di laptop.** Di terminal:

   ```text
   git switch main
   git pull --prune
   git branch -d fitur/otomasi
   ```

Database tidak terpengaruh oleh perpindahan cabang ini. Migrasi `007` sudah tercatat di `schema_migrations`, jadi `npm run migrasi` di `main` tidak menerapkan apa pun lagi.

### D. Simpan catatan belajarmu

Buka repositori **`belajar-iot`** di jendela VS Code baru (**File → New Window**, lalu **File → Open Folder…**), buat file **`modul-19/catatan.md`** di samping `pemanasan.js` dari 🔁, lalu isi dengan angka dari layarmu sendiri:

```markdown
# Catatan Modul 19 — Realtime, aturan otomatis, dan notifikasi

| Yang diukur | Angkaku |
| :--- | :--- |
| Lama jawaban `ack` perintah kipas lewat API (Praktik 2) | … ms |
| Unit test yang hijau (Praktik 3 dan 5) | … dari … |
| Dari `PUT /rules/1` sampai kipas menyala, tanpa *restart* (Praktik 4) | … detik |
| Jeda Telegram "detik setelah bacaan" (Praktik 6) | … detik |
| Lama mode offline (`offline_s`) dan berapa kali pengaman menyalakan kipas (`kipas_lokal`) (Praktik 7) | … detik, … kali |

Yang paling mengejutkanku: …
```

Lakukan *commit* dan *push* di repositori **`belajar-iot`** dengan GitHub Desktop atau terminal.

**Bukti lulus Modul 19** (bandingkan dengan ✅ di bawah): perilaku kipas yang berubah setelah `PUT /rules/1` tanpa *restart* (Praktik 4), Node 1 atau simulator yang menyalakan kipas sendiri dalam mode offline lalu melapor saat tersambung lagi (Praktik 7), log `Telegram terkirim … detik setelah bacaan` dengan angka di bawah 10 (Praktik 6), dan *pull request* `fitur/otomasi` yang sudah di-*merge*.

---

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| ***Realtime*** (waktu nyata) | Data sampai ke layar begitu tiba di backend, tanpa menunggu ditanya dan tanpa *refresh*. |
| **HTTP *polling*** (bertanya berulang) | Klien bertanya ke server setiap beberapa detik, "ada yang baru?". Seperti bolak-balik memeriksa kotak surat. |
| **WebSocket** | Sambungan yang dibuka sekali lalu dibiarkan terbuka sehingga server dan klien bisa saling mengirim pesan kapan saja. Seperti telepon. |
| **Socket.IO** | Library di atas WebSocket yang menambahkan sambung ulang otomatis, *room*, dan jawaban (*acknowledgement*). Server memakai paket `socket.io`, klien memakai `socket.io-client`; keduanya versi 4.8.4. |
| ***Room*** (ruang) | Kelompok sambungan Socket.IO yang diberi nama, misalnya `perangkat:a4cf12e5b7c0`. Bacaan satu perangkat hanya dikirim ke *room*-nya. |
| ***Event*** (acara) Socket.IO | Pesan bernama yang dikirim lewat Socket.IO, misalnya `telemetry`, `status`, `kejadian`, `ikuti`, dan `berhenti`. |
| ***Handshake*** (jabat tangan) | Permintaan HTTP pertama Socket.IO (`/socket.io/?EIO=4&transport=polling`) yang memberi nomor sesi (`sid`) sebelum sambungan naik kelas ke WebSocket. |
| **Terminal kecil** | Program `alat/terminal-live.js` yang mengikuti satu perangkat lewat Socket.IO dan menampilkan bacaan serta kejadiannya secara *live*. |
| **Perintah → ack → batas waktu** | Pola perintah ke perangkat: kirim `cmd` ber-`id`, tunggu `ack` ber-`id` sama, dan anggap gagal kalau tidak dijawab dalam 5 detik. |
| **`perintahkan()`** | Satu pintu untuk semua perintah ke perangkat. API, aturan, jadwal, dan Telegram memakainya, dengan label `sumber` yang berbeda. |
| ***Desired*** (keadaan yang diinginkan) | Keadaan aktuator yang diinginkan server, misalnya "kipas menyala". Disimpan di memori backend untuk kipas, lampu, dan tirai. |
| ***Reported*** (keadaan yang dilaporkan) | Keadaan aktuator menurut perangkat sendiri, dari `state` di `telemetry` dan `ack`. |
| **Selisih** | Aktuator yang keadaannya berbeda antara yang diinginkan dan yang dilaporkan. Tampil di `GET /devices/:id/state`. |
| **Rekonsiliasi** (pencocokan ulang) | Mengirim ulang keadaan yang diinginkan kalau belum pernah terpenuhi atau perangkat baru menyala ulang, paling sering sekali setiap 30 detik per aktuator. |
| ***Rules engine*** (mesin aturan) | Bagian backend yang menilai setiap bacaan dengan aturan yang disimpan sebagai **data** (tabel `rules`), bukan sebagai kode. |
| **Aturan ambang** dan **aturan jadwal** | Dua jenis aturan modul ini: "kalau suhu di atas 30 °C selama 2 menit, nyalakan kipas" (`ambang` + `sakelar`), dan "setiap pukul 06.00 WIB, siram 10 detik" (`jadwal` + `perintah`). |
| **Histeresis** | Dua batas berbeda untuk menyala dan padam (misalnya nyala di atas 30 °C, padam di bawah 28 °C) supaya aktuator tidak terus menyala-padam di sekitar satu angka. |
| **"Selama"** (`selama_detik`) | Syarat bahwa nilai harus bertahan di atas batas nyala terus-menerus selama waktu tertentu sebelum aturan bertindak. |
| **Fungsi murni** (*pure function*) | Fungsi yang hasilnya hanya bergantung pada masukannya dan tidak mengubah apa pun di luar dirinya, misalnya `nilaiAmbang()` dan `perluKabari()`. Paling mudah diuji. |
| ***Unit test*** (uji satuan) | Program kecil yang memeriksa satu bagian kode secara otomatis, tanpa perangkat dan tanpa database. |
| **Vitest** | Alat *unit test* untuk JavaScript dan TypeScript. `describe` mengelompokkan uji, `it` adalah satu uji, dan `expect(…).toBe(…)` memeriksa hasilnya. Dijalankan dengan `npm test`. |
| **Buku kejadian** (tabel `events`) | Catatan "siapa menyalakan apa, kapan, dan mengapa": tindakan aturan, jadwal, perubahan aturan, status perangkat, dan laporan mode offline. |
| **Migrasi `007`** | File `007_aturan_dan_kejadian.sql`: kolom baru di `rules` dan `commands`, serta tabel `events`. Nomor `006` sengaja dilewati karena dipakai 🧩 Tingkat 3 Modul 18. |
| **`config` *retained*** | Perintah `cmd` berisi ambang (`suhu_kipas_on`, `tanah_siram`) yang ditempel di broker sehingga perangkat menerimanya lagi setiap kali tersambung. |
| **node-cron** | Library penjadwal untuk Node.js (versi 4.6.0) yang menjalankan fungsi pada jam tertentu menurut ekspresi cron. |
| **Ekspresi cron** | Lima bidang jadwal: menit, jam, tanggal, bulan, dan hari dalam pekan. `0 6 * * *` berarti pukul 06.00 setiap hari. |
| **Bot Telegram** | Akun Telegram yang dijalankan program. Dibuat lewat **@BotFather**. |
| **Token bot** | Kunci rahasia dari @BotFather untuk mengendalikan bot. Disimpan hanya di `.env`; bisa diganti lewat `/token` kalau bocor. |
| **`chat_id`** | Nomor percakapan antara kamu dan bot. Bot mengirim peringatan ke nomor ini, dan hanya melayani `/status` dari nomor ini. |
| **grammY** | Library bot Telegram untuk Node.js (versi 1.46.0). |
| ***Long polling*** | Cara bot menerima pesan: bertanya ke server Telegram, dan pertanyaannya ditahan sampai ada pesan atau 30 detik berlalu. Bekerja dari balik router tanpa alamat IP publik. |
| ***Webhook*** | Kebalikan *long polling*: Telegram yang mengetuk server kita setiap ada pesan. Butuh alamat HTTPS publik (Modul 26–27). |
| ***Debouncing*** (peredam) | Meredam pesan yang berulang: kabari saat keadaan berubah, ingatkan paling sering 30 menit sekali selama keadaan masih berbahaya, dan tunda pesan `offline` 60 detik. |
| **Berhenti dengan rapi** (*graceful shutdown*) | Menutup semua yang masih terbuka (bot, jadwal, server, MQTT, database) satu per satu sebelum program keluar. |
| **`SIGINT`** dan **`SIGTERM`** | Sinyal "tolong berhenti" untuk program. `SIGINT` dikirim saat kamu menekan **Ctrl + C**; `SIGTERM` biasanya dikirim program lain. |
| **Pengaman lokal** | Aturan kipas di firmware Node 1 v1.5.0 yang bekerja sendiri saat broker tak terjangkau, dengan ambang dari `config` yang disimpan di NVS. |
| **Mode offline** | Keadaan Node 1 setelah broker tak terjangkau terus-menerus selama 2 menit. Ditulis `MODE OFFLINE` di OLED, lalu dilaporkan lewat `vitals` (`offline_s`, `kipas_lokal`) saat tersambung lagi. |
| **`uji offline`** | Perintah Serial firmware v1.5.0 yang memutus sambungan broker dengan sengaja dan menahan sambung ulang selama 3 menit, untuk mencoba mode offline tanpa mencabut kabel. |
| **"Yang menyalakan, dia yang memadamkan"** | Prinsip kepemilikan aktuator: pengaman lokal hanya memadamkan kipas yang ia nyalakan sendiri; begitu ada perintah kipas lain, kipas pindah ke tangan si pemberi perintah. |
| **Kontrak data 1.3** | Versi kontrak minggu ini: `state` di `telemetry` Node 1, laporan mode offline di `vitals`, dan rincian isi `config`. |
| **Idempotensi** | Sifat operasi yang hasilnya sama walaupun dikerjakan dua kali. Dibahas di 🔬. |

## 📝 Kuis (5 soal)

1. Dashboard keluargamu bertanya `GET /devices/:id/latest` setiap 2 detik, sedangkan Node 1 mengirim `telemetry` rutin setiap 10 detik. Dalam satu jam, berapa pertanyaan yang dikirim satu dashboard, dan berapa yang paling banyak membawa bacaan baru? Apa yang berubah kalau dashboard memakai Socket.IO, dan mengapa dashboard tetap tidak langsung berlangganan broker MQTT?
2. Server menginginkan kipas Node 1 menyala, dan Node 1 sudah pernah melaporkan kipasnya menyala. Lalu dua hal terjadi: (a) adikmu memadamkan kipas lewat Serial Monitor dengan `kipas off`; (b) keesokan harinya listrik padam sebentar sehingga Node 1 menyala ulang dengan semua relay padam. Pada kejadian mana backend mengirim ulang perintah kipas, dan mengapa?
3. Aturan kipas: nyala di atas 30 °C selama 120 detik, padam di bawah 28 °C. Bacaan datang setiap 10 detik: 31 °C dari detik 0 sampai detik 50, tepat 30,0 °C pada detik 60, lalu 31 °C lagi mulai detik 70. Pada bacaan detik berapa kipas dinyalakan? Sesudah itu, suhu turun ke 29 °C; apa yang terjadi, dan kapan kipas dipadamkan?
4. Suhu 33 °C bertahan 70 menit sejak kipas dinyalakan otomatis, lalu turun ke 25 °C. Berapa pesan Telegram yang kamu terima dari aturan kipas, dan apa saja isinya? Lalu, mengapa pesan `offline` ditunda 60 detik?
5. Node 1 berfirmware v1.5.0 dengan ambang `suhu_kipas_on` 30 °C, dan suhu kamar 33 °C. Apa yang dilakukan Node 1 dalam tiga kejadian ini: (a) kabel LAN Pi dicabut selama 5 menit; (b) laptop yang menjalankan backend mati, sedangkan broker di Pi tetap menyala; (c) setelah kejadian (a), broker kembali, suhu masih 33 °C, dan aturan kipas di server sedang tidak aktif. Siapa yang memadamkan kipas itu nanti?

<details>
<summary><b>Kunci jawaban</b></summary>

1. 3.600 detik ÷ 2 detik = **1.800 pertanyaan** per jam, dan paling banyak 3.600 ÷ 10 = **360** yang membawa bacaan baru. Sisanya, **1.440 pertanyaan (80 %)**, dijawab "belum ada yang baru". Bacaan baru juga bisa terlambat sampai 2 detik. Dengan Socket.IO, dashboard menyambung sekali, mengikuti *room* `perangkat:<device_id>`, dan backend mendorong setiap bacaan begitu tiba: 360 pesan, tidak ada yang sia-sia, tanpa jeda tunggu (Konsep 1–2). Dashboard tetap bicara dengan backend, bukan broker, karena backend-lah yang memeriksa dan menyaring pesan, dan mulai Modul 20 juga memeriksa izin penggunanya.
2. Hanya pada **(b)**. Pada (a), keinginan server sudah pernah terpenuhi, jadi laporan "kipas padam" berarti ada otak lain (manusia atau aturan lokal) yang sengaja mengubahnya. Backend tidak melawan; ia hanya menampilkan `kipas` di `selisih` (Konsep 4, Praktik 2). Pada (b), `vitals` pertama sesudah menyala membawa `uptime_s` kecil (di bawah 60 detik). Itu tanda semua relay baru saja padam karena listrik, bukan karena keputusan siapa pun, jadi backend menulis `baru menyala ulang … keinginan server dicocokkan lagi` dan mengirim ulang perintah kipas.
3. Hitungan dimulai pada detik 0, lalu **diulang** pada detik 60 karena 30,0 tidak **di atas** 30 (`<=` mengulang hitungan). Hitungan dimulai lagi pada detik 70, dan kipas dinyalakan pada bacaan **detik 190**, tepat 120 detik kemudian. Saat suhu turun ke 29 °C, kipas **tetap menyala** karena 29 belum di bawah 28 (histeresis). Kipas baru dipadamkan pada bacaan pertama **di bawah 28 °C** (Konsep 5, Praktik 3).
4. **Empat pesan**: `🌡️ Suhu 33 °C — kipas dinyalakan otomatis` saat kipas menyala, pengingat `🌡️ Suhu masih 33 °C — kipas tetap menyala (pengingat)` pada menit ke-30 dan ke-60, lalu `✅ Suhu turun ke 25 °C — kipas dipadamkan` saat suhu turun. Bacaan-bacaan lain selama 70 menit itu (sekitar 420 bacaan) tidak memicu pesan apa pun (Konsep 9). Pesan `offline` ditunda 60 detik karena WiFi atau broker yang putus-sambung sebentar tidak perlu membangunkan siapa pun; kalau perangkat kembali sebelum 60 detik, tidak ada pesan sama sekali (Praktik 6.8).
5. (a) Setelah broker tak terjangkau terus-menerus **2 menit**, Node 1 masuk **mode offline** dan menyalakan kipas sendiri karena 33 di atas 30. Saat tersambung lagi, `vitals` pertamanya membawa `offline_s` dan `kipas_lokal`, lalu backend mencatatnya di buku kejadian dan mengabarimu lewat Telegram. (b) **Tidak ada apa-apa**: Node 1 masih tersambung ke broker, jadi tidak masuk mode offline, padahal aturan di server ikut mati. Itulah celah jujur Konsep 10, yang baru tertutup setelah backend berjalan di server sungguhan (Modul 26–27). (c) Kipas tetap menyala karena 33 belum di bawah 28. Walaupun Node 1 sudah tersambung lagi, yang memadamkannya nanti adalah **pengaman lokal sendiri**, yaitu saat suhu turun di bawah 30 − 2 = **28 °C** ("yang menyalakan, dia yang memadamkan"). Kalau sebelum itu server atau kamu mengirim perintah kipas, kipas pindah ke tangan si pemberi perintah.

</details>

---

## ✅ Checklist kelulusan Modul 19

Syarat lulus dari Silabus: **mengubah ambang suhu lewat API langsung mengubah perilaku kipas tanpa *restart* server, perangkat tetap bereaksi saat broker dimatikan, dan Telegram-mu menerima peringatan ≤ 10 detik.** **Jalur tanpa perangkat:** semua butir boleh dicentang dengan simulator Modul 19 (jalur laptop), atau dengan simulator dan firmware v1.5.0 di Wokwi (jalur Wokwi).

- [ ] Pemanasan ulang JavaScript selesai, dan jawaban "Uji dirimu" sudah kucocokkan dengan kuncinya (🔁).
- [ ] Terminal kecil menampilkan bacaan *live* lewat Socket.IO, dan pekerjaan minggu ini ada di cabang `fitur/otomasi` (Kemenangan Cepat).
- [ ] Setiap terminal kecil hanya menerima bacaan perangkat yang ia ikuti, dan menyambung lagi sendiri saat backend dimulai ulang (Praktik 1).
- [ ] Semua perintah lewat `perintahkan()`, dan `GET /devices/{id}/state` menunjukkan keadaan yang diinginkan, yang dilaporkan, dan selisihnya (Praktik 2).
- [ ] ⭐ `npm test` menulis 10 *unit test* mesin aturan yang hijau (Praktik 3; 11 setelah Praktik 5).
- [ ] ⭐ Mengubah ambang aturan kipas lewat `PUT /rules/1` langsung mengubah perilaku kipas **tanpa *restart* server**, dan semua tindakannya tercatat di tabel `commands` dan `events` (Praktik 4).
- [ ] Aturan "siram 10 detik setiap pukul 06.00 WIB" tersimpan, `berikutnya` menunjukkan pukul 06.00 WIB esok hari, dan jadwal uji berjalan tepat pada menitnya (Praktik 5).
- [ ] ⭐ Bot Telegram-ku mengirim `🌡️ Suhu 33 °C — kipas dinyalakan otomatis` **dalam 10 detik** sejak bacaan pemicunya, menjawab `/status` hanya untukku, dan tidak cerewet (Praktik 6).
- [ ] Backend yang dijalankan dengan `npm start` berhenti dengan rapi saat kutekan **Ctrl + C** (Praktik 6).
- [ ] ⭐ Node 1 v1.5.0 (atau Wokwi, atau simulator Modul 19 di 7.10) masuk mode offline setelah 2 menit tanpa broker, menyalakan kipas sendiri saat panas, dan melaporkan mode offline lewat `vitals` saat tersambung lagi (Praktik 7).
- [ ] ⭐ Gladi bersih ketiga syarat lulus berhasil dalam sekali jalan, `npm test` hijau, dan keempat permintaan Bruno baru lulus (Praktik 8).
- [ ] `backend/README.md` sudah diperbarui untuk v0.4, dan `KONTRAK-DATA.md` sudah versi 1.3 (➕ A–B).
- [ ] ⭐ Semua pekerjaan Modul 19 sudah ada di `main` repositori `rumah-pintar-mini` lewat *pull request*, tanpa `.env` (➕ C).

🎉 **Rumah Pintar Mini kini bereaksi sendiri.** Data mengalir ke layar begitu tiba, perintah sampai ke perangkat dengan konfirmasi, aturan bisa diubah tanpa menyentuh kode, Node 1 menjaga rumah saat server hilang, dan HP-mu mendapat kabar dalam hitungan detik. Masih ada satu lubang besar: siapa pun yang bisa menjangkau backend-mu bisa menyalakan relay. Minggu depan pintunya dikunci.

> ➡️ **Modul berikutnya:** Modul 20 — Keamanan Pengguna: Login, JWT di Cookie, Peran, & Pengaman API. Sistem tidak bisa lagi dibuka sembarang orang, ada akun dengan peran berbeda, dan API serta sambungan Socket.IO sama-sama terkunci.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- Socket.IO 4.8.4: [ikhtisar](https://socket.io/docs/v4/), [cara kerjanya](https://socket.io/docs/v4/how-it-works/), [memasang server](https://socket.io/docs/v4/server-initialization/) dan [pilihannya](https://socket.io/docs/v4/server-options/), [*room*](https://socket.io/docs/v4/rooms/), [mengirim *event* dan jawaban (*acknowledgement*)](https://socket.io/docs/v4/emitting-events/), [API server](https://socket.io/docs/v4/server-api/) (`disconnectSockets`), [klien](https://socket.io/docs/v4/client-initialization/) dan [API klien](https://socket.io/docs/v4/client-api/), [jaminan pengiriman](https://socket.io/docs/v4/delivery-guarantees/), [CORS](https://socket.io/docs/v4/handling-cors/), [masalah sambungan](https://socket.io/docs/v4/troubleshooting-connection-issues/), serta kode sumber [socket.io 4.8.4](https://github.com/socketio/socket.io) dan engine.io 6.6.11.
- node-cron 4.6.0: [nodecron.com](https://nodecron.com) ([sintaks cron](https://nodecron.com/cron-syntax), [pilihan penjadwalan](https://nodecron.com/scheduling-options), [zona waktu](https://nodecron.com/timezones-and-dst), [pindah dari versi 3](https://nodecron.com/migrating-from-v3)) dan kode sumbernya di [github.com/node-cron/node-cron](https://github.com/node-cron/node-cron) (*tag* `v4.6.0`).
- Telegram Bot API: [pengantar bot](https://core.telegram.org/bots), [fitur bot dan @BotFather](https://core.telegram.org/bots/features#botfather), [perintah bot](https://core.telegram.org/bots/features#commands), [tutorial resmi](https://core.telegram.org/bots/tutorial), [referensi Bot API](https://core.telegram.org/bots/api) (`getUpdates`, `sendMessage`, [pemformatan](https://core.telegram.org/bots/api#formatting-options), [`chat_id`](https://core.telegram.org/bots/api#chat)), dan [FAQ batas laju](https://core.telegram.org/bots/faq).
- grammY 1.46.0: [mulai](https://grammy.dev/guide/getting-started), [dasar-dasar](https://grammy.dev/guide/basics), [perintah](https://grammy.dev/guide/commands), [Bot API](https://grammy.dev/guide/api), [galat](https://grammy.dev/guide/errors), [*long polling* lawan *webhook*](https://grammy.dev/guide/deployment-types), [berhenti dengan rapi](https://grammy.dev/advanced/reliability), [batas laju](https://grammy.dev/advanced/flood), [`ApiClientOptions`](https://grammy.dev/ref/core/apiclientoptions) (`apiRoot`), [FAQ](https://grammy.dev/resources/faq), dan kode sumbernya di [github.com/grammyjs/grammY](https://github.com/grammyjs/grammY) (*tag* `v1.46.0`).
- Vitest 5.0.5: [panduan](https://vitest.dev/guide/), [`expect`](https://vitest.dev/api/expect), dan [reporter](https://vitest.dev/guide/reporters).
- Node.js 24.21.0: [sinyal proses](https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events) (`SIGINT`, `SIGTERM`), [`--watch`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--watch), dan [`--env-file`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--env-filefile). [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1 (`endAsync`). Dari Modul 16–18: [Fastify](https://fastify.dev/docs/latest/) 5.12.7 ([*hook*](https://fastify.dev/docs/latest/Reference/Hooks/) `preClose` dan `onResponse`), [Zod](https://zod.dev/api) 4.6.7 (`discriminatedUnion`, `.refine`, pesan berbahasa Indonesia), [node-postgres](https://node-postgres.com) 8.23.1, TypeScript 7.0.2, [Bruno](https://docs.usebruno.com) 4.2.1, dan PostgreSQL 17 ([`ALTER TABLE`](https://www.postgresql.org/docs/17/sql-altertable.html), [fungsi JSON](https://www.postgresql.org/docs/17/functions-json.html), [`INSERT … ON CONFLICT`](https://www.postgresql.org/docs/17/sql-insert.html)).
- Firmware: [Preferences ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/preferences.html) (`getFloat`, `putFloat`, `isKey`; paket esp32 3.3.12), [PubSubClient3](https://github.com/hmueller01/pubsubclient3) 3.3.2, [ArduinoJson](https://arduinojson.org/v7/) 7.4.3, spesifikasi [MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) (wasiat, *retained*, *keep-alive*), dan Wokwi: [ESP32 dan WiFi](https://docs.wokwi.com/guides/esp32-wifi), [DHT22](https://docs.wokwi.com/parts/wokwi-dht22), serta [harga dan *gateway*](https://wokwi.com/pricing). [NetworkManager](https://networkmanager.dev/docs/api/latest/NetworkManager.conf.html) untuk perilaku Pi saat kabel LAN dicabut.
- Bacaan tambahan 🔬: [@fastify/websocket](https://github.com/fastify/fastify-websocket) 11.3.4, [@fastify/sse](https://github.com/fastify/sse) 0.6.1, [`EventSource` di MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) dan [WebSocket di MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API); Azure IoT Hub ([panduan awan → perangkat](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-c2d-guidance), [*direct method*](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-direct-methods), [*device twin*](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-device-twins)), [AWS IoT Device Shadow](https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-document.html), [MQTT 5](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) (*Response Topic*, *Correlation Data*); Home Assistant ([pemicu *numeric state*](https://www.home-assistant.io/triggers/numeric_state/), [*threshold*](https://www.home-assistant.io/integrations/threshold/), [*context* pada *state object*](https://www.home-assistant.io/docs/configuration/state_object/)); [pg-boss](https://github.com/timgit/pg-boss) 12.38.0 dan [BullMQ](https://docs.bullmq.io/); usulan standar IETF [*The Idempotency-Key HTTP Header Field*](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header) dan [permintaan idempoten di Stripe](https://docs.stripe.com/api/idempotent_requests).

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-19`, `polling-dan-websocket`, `perintah-dan-keadaan`, `mesin-aturan`, `aturan-tanpa-restart`, `telegram-dan-peredam`, `pengaman-lokal`, `diagram-proyek-modul-19` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Perilaku Socket.IO, node-cron, grammY, dan Bot API dari dokumentasi di atas; langkah @BotFather dari dokumentasi resmi Telegram; angka dan teks log dari lab penulis untuk modul ini (backend v0.4, uji Vitest, uji Wokwi firmware v1.5.0). | CC BY 4.0 |
| `wokwi-pengaman-lokal.png` | Tangkapan layar asli [Wokwi](https://wokwi.com) proyek Node 1 v1.5.0 di laptop penulis setelah perintah `uji offline` (rangkaian, OLED, jendela DHT22, dan Serial Monitor); dipotong dan disusun ulang, dengan judul, nomor, dan keterangan oleh penulis. | Tangkapan layar Wokwi, © Wokwi (CodeMagic LTD), Oktober 2026; dipakai untuk tujuan pendidikan, penanda oleh penulis. Judul, nomor, dan keterangan: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua perintah dan kode modul ini dijalankan penulis di laptop Windows 11 dengan Node.js 24.21.0 dan npm 11.19.0, database di kontainer lab `timescale/timescaledb:2.30.2-pg17` seperti Modul 17–18, broker MQTT kecil di laptop (aedes, yang seperti Mosquitto di laptop tidak menyimpan pesan *retained* saat dimulai ulang), dan simulator perangkat Modul 19, dengan urutan langkah yang sama persis dengan modul ini. Uji "broker mati" memakai broker kedua di port lain supaya broker utama lab tidak ikut dimatikan. Bot Telegram diuji terhadap server Bot API tiruan di laptop penulis lewat `TELEGRAM_API_ROOT` (🔬), tanpa akun atau token sungguhan; langkah @BotFather diambil dari dokumentasi resmi Telegram. Firmware v1.5.0 dikompilasi dengan arduino-cli dan paket esp32 3.3.12, lalu diuji di Wokwi lewat broker publik. Jalur perangkat (Node 1 dan Pi sungguhan, kabel LAN dicabut) belum dicoba penulis; langkah-langkahnya diturunkan dari kode firmware yang sama dan dokumentasi di atas. Jam di contoh log backend ditulis dalam WIB, sedangkan jam `[00:00:13]` di Serial Monitor adalah lama Node 1 menyala. Jam, `id` perintah, lama jawaban, dan angka acak di layarmu bisa berbeda, jadi keluaran seperti itu ditandai **contoh**.

---

[⬅️ Modul 18](../modul-18-timescaledb/README.md) · [Fase 3](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 20 — Keamanan Pengguna: Login, JWT di Cookie, Peran, & Pengaman API** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-20--keamanan-pengguna-login-jwt-di-cookie-peran--pengaman-api))
