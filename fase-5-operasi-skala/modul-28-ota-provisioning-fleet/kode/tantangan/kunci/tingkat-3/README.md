# Kunci Tantangan 3 Modul 28: gelombang otomatis (canary, tunggu sehat, lalu sisanya bertahap)

**Tugas:** tombol **Perbarui semua** (Modul 28) mengirim rilis ke SEMUA perangkat sekaligus begitu satu canary berhasil, dan Telegram
mengirim dua kabar per perangkat (🔄 berhenti sengaja, lalu ✅ online lagi): 20 perangkat = 40 pesan. Buat **gelombang otomatis** di backend:
canary dulu; kalau berhasil, canary harus tetap sehat selama 10 menit; sesudah itu perangkat lain diperbarui bertahap per gelombang yang makin
besar. **Rem darurat:** satu perangkat saja kembali ke versi lama (*rollback*), gagal, atau tanpa kabar = gelombang berhenti dan sisanya tidak
dikirimi. Telegram cukup **satu ringkasan per gelombang**.

| Berkas kunci | Ditaruh di proyek sebagai |
| :--- | :--- |
| [`backend/src/services/gelombang.ts`](backend/src/services/gelombang.ts) | berkas BARU `backend/src/services/gelombang.ts`: rencana gelombang, pengiriman per tahap, masa tunggu sehat, rem darurat, ringkasan Telegram |
| [`backend/src/routes/gelombang.ts`](backend/src/routes/gelombang.ts) | berkas BARU `backend/src/routes/gelombang.ts`: `POST /armada/gelombang` (mulai), `GET /armada/gelombang` (keadaan), `POST /armada/gelombang/berhenti` (hentikan) |
| [`backend/src/services/gelombang.test.ts`](backend/src/services/gelombang.test.ts) | berkas BARU `backend/src/services/gelombang.test.ts`: 10 uji Vitest tanpa database, broker, dan Telegram |
| [`backend/bruno/`](backend/bruno/) | tiga permintaan Bruno BARU di `backend/bruno/`: `mulai gelombang`, `keadaan gelombang`, `hentikan gelombang` (seq 40–42) |
| [`perubahan.diff`](perubahan.diff) | empat perubahan kecil di berkas yang sudah ada (+43 baris, −2): `backend/src/services/ota.ts`, `backend/src/services/telegram.ts`, `backend/src/services/telegram.test.ts` (+1 uji), `backend/src/server.ts` |

Tanpa paket npm baru, tanpa migrasi, tanpa perubahan firmware dan dashboard.

## Jalan gelombangnya

1. **Mulai** (admin): `POST /armada/gelombang` dengan `{"versi": "1.7.3"}`. Syaratnya sama dengan **Perbarui semua**: rilisnya ada, tidak
   ditarik, bukan rilis uji, dan tidak ada canary yang pernah gagal atau *rollback* memakai versi itu. Ditambah: paling sedikit satu perangkat
   canary, dan tidak ada gelombang lain yang sedang berjalan (semuanya `409` dengan alasannya). Rencananya dibuat sekali: tahap **canary** =
   semua Node 1 aktif bertanda canary; perangkat lain (urut `device_id`) dibagi menjadi gelombang 2, 4, 8, … perangkat (`ukuran_awal`, bawaan 2,
   lalu dua kali lipat). 20 perangkat = gelombang 2, 4, 8, 6.
2. **Kirim per tahap.** Semua perangkat satu tahap dikirimi sekaligus lewat `mintaUpdate()` di `ota.ts`, aturan yang sama dengan tombol
   **Perbarui** per perangkat. Perangkat yang sudah memakai versi itu ditandai `sudah` (tidak dikirimi). Perangkat yang dilewati (offline,
   jenisnya belum dikenal, atau menolak perintah) dicatat di ringkasan, tetapi TIDAK menarik rem.
3. **Hasil per perangkat** tiba seperti biasa (laporan `vitals.ota`, atau `kedaluwarsa` dari pengawas `OTA_BATAS_MENIT`), lewat
   `kabarkan()` di `ota.ts`. Perubahan di `ota.ts` hanya meneruskan setiap kabar itu ke `kabarGelombang()`. Kabar yang tiba bersamaan
   (pengawas kedaluwarsa menandai beberapa perangkat sekaligus) diperiksa sekali sesudah semuanya tercatat, supaya ringkasannya lengkap.
4. **Tunggu sehat** sesudah canary lolos: selama `tunggu_menit` (bawaan **10**), setiap 5 detik canary diperiksa: masih `online`, pesan
   terbarunya (telemetry atau vitals) masih menyebut versi baru, dan tidak menyala ulang (perkiraan jam menyala = `ts` vitals dikurangi
   `uptime_s`; vitals selalu dikirim setiap kali perangkat tersambung). Satu masalah = rem darurat.
5. **Gelombang berikutnya** dikirim begitu semua perangkat gelombang sebelumnya punya hasil akhir (`berhasil`, `sudah`, atau dilewati).
6. **Rem darurat:** satu `rollback`, `gagal`, atau `kedaluwarsa` = gelombang berhenti. Perintah yang sudah terkirim di tahap itu tidak
   ditarik kembali (hasilnya tetap dicatat); tahap berikutnya tidak pernah dikirim.
7. **Telegram:** satu ringkasan per tahap (`🌊` lanjut, `✅` selesai, `🛑` rem darurat, `⏹️` berhenti tanpa kegagalan). `telegram.ts` mendapat
   `diamkanKabarBerhenti()`: selama pembaruan sebuah perangkat dari gelombang berjalan, kabar 🔄 dan pasangan ✅-nya diam. Kabar 📴 "tidak
   kembali sesudah berhenti sengaja" tetap dikirim: itu tanda bahaya, bukan kabar rutin.
8. **Hentikan** (admin): `POST /armada/gelombang/berhenti`, tanpa badan. **Keadaan** (semua peran): `GET /armada/gelombang`, termasuk status
   setiap perangkat (`antre`, `berjalan`, `berhasil`, `sudah`, `rollback`, `gagal`, `kedaluwarsa`, `ditolak`, `dilewati`).

Gelombang hidup di memori backend: backend dimulai ulang = gelombang berhenti dan tidak dilanjutkan sendiri. Mulai lagi dengan versi yang
sama: perangkat yang sudah memakainya ditandai `sudah`.

## Langkah

1. Salin tiga berkas baru di `backend/src/` dan tiga berkas Bruno ke tempatnya, lalu terapkan `perubahan.diff`: simpan di akar proyek dan
   jalankan `git apply perubahan.diff` (hapus berkas diff-nya sesudah itu), atau ketik perubahannya dengan tangan (baris `+` ditambah, baris
   `-` dibuang; setiap tambahan diberi komentar "Tantangan 3 Modul 28").
2. Di folder `backend`: `npm run cek` lalu `npm test`. Hasil di lab penulis: `Test Files  26 passed (26)` dan `Tests  214 passed (214)`
   (203 uji Modul 28 + 10 uji gelombang + 1 uji Telegram).
3. Dari akar proyek: `docker compose up -d --build backend`.
4. Coba dengan simulator: daftarkan beberapa perangkat tiruan (Bruno `daftarkan perangkat latihan` dengan `device_id` lain, kuncinya ke
   `alat/.env`), centang **Canary** di satu kartu, buat dan unggah berkas tiruan
   ([`alat/buat-bin-tiruan.js`](../../../alat/buat-bin-tiruan.js), misalnya `node buat-bin-tiruan.js 1.7.3 ../../firmware-tiruan`), lalu
   kirim Bruno `mulai gelombang` dengan `"versi": "1.7.3"`. Untuk latihan boleh ditambah `"tunggu_menit": 1` supaya tidak menunggu 10 menit;
   di rumah sungguhan biarkan 10. Ikuti dengan Bruno `keadaan gelombang`, layar **Armada**, dan Telegram.
5. Coba rem daruratnya: buat berkas `--uji` versi baru dan unggah **tanpa** centang **Rilis uji** (berpura-pura ada firmware rusak yang lolos
   pemeriksaan; gelombang menolak rilis yang ditandai uji). Canary kembali ke versi lama, gelombang berhenti, perangkat lain tidak dikirimi.
   Sesudah itu tarik rilis rusak itu (Bruno `tarik rilis uji`, ganti versinya).

## Hasilnya (lab penulis)

Raspberry Pi 5, Docker Engine 29.1.3, Compose 2.40.3, 2 Nov 2026 ±13.42–14.07 WIB. Pusat = `compose.cloud.yml` mode laptop (database,
broker pusat, Caddy, backend 1.5.0 + kunci ini), `AKUN_BROKER_OTOMATIS=pusat`, Telegram = server Bot API **tiruan**. Perangkat = **21 perangkat
tiruan** dari `alat/simulator-perangkat.js` (`f00d00000001` canary, `f00d00000002` sampai `f00d00000021`); berkas firmware = berkas tiruan
`buat-bin-tiruan.js`. Masa tunggu sehat **dipendekkan menjadi 1 menit** (`"tunggu_menit": 1`), dan `OTA_BATAS_MENIT=2` (bawaan 10) supaya
kedaluwarsa tidak perlu ditunggu lama. Semua angka waktu = angka simulator di mesin penulis, bukan ESP32 lewat WiFi.

**Jalan mulus** (berkas tiruan 1.7.7, 21 perangkat): `POST /armada/gelombang` dijawab `202`. Keadaannya menurut `GET /armada/gelombang`:

```text
14.02.00 WIB  berjalan | canary | {'antre': 1}
14.02.06 WIB  tunggu-sehat | canary | {'berhasil': 1}
14.03.06 WIB  berjalan | gelombang 1 dari 4 | {'berjalan': 2}
14.03.13 WIB  berjalan | gelombang 2 dari 4 | {'berjalan': 4}
14.03.17 WIB  berjalan | gelombang 3 dari 4 | {'berjalan': 8}
14.03.23 WIB  berjalan | gelombang 4 dari 4 | {'berjalan': 6}
14.03.27 WIB  selesai | gelombang 4 dari 4 | {'berhasil': 6}
```

Telegram, seperti yang diterima server Telegram tiruan: **5 pesan** untuk 21 perangkat (cara lama: 42), tanpa satu pun 🔄/✅ per perangkat.

```text
🌊 Gelombang 1.7.7 · canary: 1 berhasil. Tunggu 1 menit: canary harus tetap online dengan 1.7.7, lalu gelombang 1 dari 4 (2 perangkat).
🌊 Gelombang 1.7.7 · gelombang 1 dari 4: 2 berhasil. Lanjut gelombang 2 dari 4 (4 perangkat).
🌊 Gelombang 1.7.7 · gelombang 2 dari 4: 4 berhasil. Lanjut gelombang 3 dari 4 (8 perangkat).
🌊 Gelombang 1.7.7 · gelombang 3 dari 4: 8 berhasil. Lanjut gelombang 4 dari 4 (6 perangkat).
✅ Gelombang 1.7.7 SELESAI · gelombang 4 dari 4: 6 berhasil. Semua tahap: 21 berhasil, dalam 1 menit 27 detik.
```

**Rem darurat di canary** (berkas tiruan `--uji` 1.7.8, diunggah tanpa centang uji): canary gagal masuk broker, 70 detik kemudian kembali ke
1.7.7, dan gelombang berhenti. Satu pesan; 20 perangkat lain tetap 1.7.7 (gelombang 1–4 `antre`, tidak pernah dikirimi). Pada percobaan
yang sama dengan berkas `--uji` 1.7.4, memulai gelombang versi itu lagi dijawab `409 {"pesan":"1 perangkat canary pernah gagal atau
rollback memakai 1.7.4: jangan disebarkan"}`.

```text
🛑 Gelombang 1.7.8 BERHENTI (rem darurat) · canary: 1 kembali ke versi lama (rollback) (f00d00000001: tidak tersambung ke broker dalam 60 detik). 20 perangkat lain TIDAK dikirimi: periksa dulu, lalu tarik rilisnya.
```

**Rem darurat di tengah** (berkas tiruan 1.7.6): canary dan gelombang 1 berhasil. Keempat perangkat gelombang 2 berjalan di satu proses
simulator yang dimatikan paksa (`kill -9`, seperti listrik padam) tepat sesudah keempatnya selesai mengunduh. Tanpa kabar 2 menit, keempatnya
`kedaluwarsa`, dan gelombang 3 dan 4 (14 perangkat) tidak dikirim. Pesan ketiga (dua pesan sebelumnya ringkasan canary dan gelombang 1):

```text
🛑 Gelombang 1.7.6 BERHENTI (rem darurat) · gelombang 2 dari 4: 4 tanpa kabar (kedaluwarsa) (f00d00000004: tanpa kabar dari perangkat; f00d00000005: tanpa kabar dari perangkat; f00d00000006: tanpa kabar dari perangkat; f00d00000007: tanpa kabar dari perangkat). 14 perangkat lain TIDAK dikirimi: periksa dulu, lalu tarik rilisnya.
```

Begitu proses simulator itu dinyalakan lagi, keempat perangkat tiruan melapor `rollback` (`padam di tengah masa uji`); hasil itu ikut tercatat
di `GET /armada/gelombang`, tanpa pesan Telegram tambahan.

**Masa tunggu sehat** (berkas tiruan 1.7.9): canary berhasil, lalu 20 detik kemudian diketik `restart` di simulator canary (berhenti sengaja dan
menyala ulang). Dalam 5 detik gelombang berhenti, dan gelombang 1 tidak dikirim. Kabar 🔄/✅ canary tetap terkirim, karena pembaruannya sudah
selesai (yang diam hanya kabar perangkat yang SEDANG diperbarui gelombang):

```text
🌊 Gelombang 1.7.9 · canary: 1 berhasil. Tunggu 1 menit: canary harus tetap online dengan 1.7.9, lalu gelombang 1 dari 4 (2 perangkat).
🔄 f00d00000001 berhenti sengaja (pembaruan firmware atau restart), sebentar lagi online kembali
🛑 Gelombang 1.7.9 BERHENTI (rem darurat): canary f00d00000001 berhenti sengaja (offline-mode) selama masa tunggu sehat. 20 perangkat lain TIDAK dikirimi: periksa dulu, lalu tarik rilisnya.
✅ f00d00000001 online lagi sesudah berhenti sengaja (5 detik)
```

Juga dicek: rilis uji (centang **Rilis uji**) → `409 {"pesan":"1.7.2 rilis UJI: tidak pernah dikirim ke banyak perangkat"}`; gelombang kedua
selagi yang pertama berjalan → `409 {"pesan":"gelombang 1.7.4 masih berjalan: tunggu selesai, atau hentikan dulu"}`; akun viewer boleh melihat
(`GET` `200`) tetapi mulai/hentikan dijawab `403`. Belum dicoba penulis: armada sungguhan (ESP32), lebih dari 21 perangkat, dan masa tunggu
10 menit penuh (di lab dipendekkan menjadi 1 menit).

## Batas

- Gelombang tidak bertahan saat backend dimulai ulang (disimpan di memori, bukan database). Menyimpannya di tabel baru adalah langkah
  berikutnya yang wajar.
- Jeda hanya sesudah canary. Gelombang berikutnya langsung dikirim begitu gelombang sebelumnya selesai; untuk armada besar, jeda singkat di
  antara gelombang (misalnya 2 menit) menambah kesempatan menangkap perangkat yang bermasalah sesudah lolos masa uji.
- Perangkat yang dilewati (offline saat gilirannya) tidak dikirimi lagi oleh gelombang itu: perbarui sendiri nanti, atau mulai gelombang
  versi yang sama sekali lagi.
- Pengawas kesehatan canary memakai status, versi, dan perkiraan jam menyala. Kerusakan yang tidak membuat perangkat terputus atau menyala
  ulang (misalnya sensor yang tiba-tiba membaca nol) tidak terdeteksi gelombang ini.
- Gelombang yang berhenti (rem darurat atau **Hentikan**) tetap mendiamkan kabar 🔄/✅ perangkat yang pembaruannya masih `berjalan`,
  sampai hasil akhirnya tiba. Kalau gelombang BARU dimulai sebelum hasil itu tiba, hasilnya tidak lagi dikenali: kabar 🔄/✅ perangkat itu
  bisa tetap diam sampai backend dimulai ulang (📴 tetap dikirim). Sebelum memulai gelombang baru, tunggu sampai `GET /armada/gelombang`
  tidak lagi menyebut perangkat `berjalan`. Perbaikan yang wajar: `berhenti()` mencabut diam perangkat yang masih `berjalan`, atau
  `mulaiGelombang()` membersihkan sisa gelombang lama.
