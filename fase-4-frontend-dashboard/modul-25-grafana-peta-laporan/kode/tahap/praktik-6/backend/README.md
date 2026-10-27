# Backend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../../../en/mini-smart-home/backend/README.md)

Backend v1.1 proyek Rumah Pintar Mini: server Node.js 24 dengan TypeScript ringan yang mendengarkan semua pesan MQTT `rpm/#`, memeriksa setiap pesan dengan kontrak data 1.4 (skema Zod), menyimpan keadaan terakhir setiap perangkat di memori, mengarsipkan semua pesan ke database PostgreSQL dengan tambahan TimescaleDB (lewat Docker), dan menyediakan API berdokumentasi. Riwayat bacaan bisa diminta mentah atau sudah diringkas per 15 menit, per jam, atau per hari. Sejak Modul 19, bacaan juga mengalir *live* lewat Socket.IO, semua perintah lewat satu pintu (dengan keadaan yang diinginkan dan yang dilaporkan), aturan otomatis dan jadwal disimpan di database dan bisa diubah lewat API tanpa memulai ulang server, setiap kejadian penting dicatat, dan peringatan dikirim lewat Telegram. Sejak Modul 20, API dan Socket.IO **berkunci untuk manusia**: tamu harus *login* dulu, akun `viewer` hanya boleh melihat, percobaan *login* dibatasi, dan halaman web lain tidak bisa menyuruh server atas nama pengguna. Sejak Modul 21, backend juga **berkunci untuk perangkat**: hanya perangkat yang didaftarkan admin (dengan kunci per perangkat) yang datanya diproses, pesan dari perangkat yang belum terdaftar atau kuncinya dicabut diabaikan, dan backend sendiri masuk ke broker dengan akunnya sendiri. 🎉 **Checkpoint Fase 3: rumah berkunci untuk manusia dan perangkat.**

**v1.1 (Modul 24)** menambah tiga hal kecil yang dibutuhkan dashboard v1.0: aturan **di bawah ambang** (misalnya siram kalau tanah di bawah 30 %), aturan ambang yang **mengirim perintah sekali** (misalnya pompa 5 detik), dan **hapus aturan** (`DELETE /rules/:id`). Tanpa migrasi database dan tanpa perubahan kontrak data (tetap 1.4); rinciannya di [Catatan versi 1.1](#catatan-versi-11).

## Menjalankan

1. Pasang Node.js 24 LTS dan Docker Desktop.
2. Jalankan database, cukup sekali (ganti `ganti-sandi-ini` dengan sandimu; pakai huruf, angka, dan tanda minus saja):

   ```text
   docker run -d --name rumahpintar-db -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=ganti-sandi-ini -e POSTGRES_DB=rumahpintar -e TIMESCALEDB_TELEMETRY=off -v rumahpintar-data:/var/lib/postgresql/data --restart unless-stopped timescale/timescaledb:2.30.2-pg17
   ```

3. Di folder ini, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`, lalu isi `MQTT_URL` (alamat broker, **tanpa** nama pengguna/sandi di dalamnya) dan sandi database di `DATABASE_URL`. Sejak Modul 21, isi juga `MQTT_USERNAME` dan `MQTT_PASSWORD`: akun broker milik backend, yang kamu buat di mesin broker dengan `mosquitto_passwd backend`. Buat sandinya dengan perintah `randomBytes(32)` yang sama dengan `JWT_SECRET` di bawah. Kalau brokermu belum dikunci, keduanya boleh dikosongkan (backend masuk tanpa akun, dengan peringatan).
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
| `npm test` | menjalankan *unit test* dengan Vitest: *rules engine* dan skema aturan (`src/aturan/*.test.ts`; sejak Modul 24 juga aturan di bawah ambang), *login* (`src/auth/auth.test.ts`), kunci perangkat (`src/auth/kunci.test.ts`, Modul 21), buku tamu dan lapis kedua (`src/services/daftar.test.ts`), rute registrasi (`src/routes/perangkat.test.ts`), rute hapus aturan beserta satpamnya: tamu 401, *viewer* 403, *preflight* `DELETE` (`src/routes/aturan.test.ts`, Modul 24), dan aturan siram yang berjalan: pompa dikirim sekali, padam tanpa perintah, perintah yang ditolak ditandai `ok: false`, aturan yang dihapus atau dinonaktifkan tidak bertindak lagi (`src/services/otomasi.test.ts`, Modul 24) |
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
- **Bruno**: koleksi `bruno/` punya permintaan `login admin`, `login viewer`, `login salah`, `siapa saya`, `refresh`, dan `logout`, serta (Modul 21) `daftarkan Node 1`, `daftarkan Node 2 lewat Node 1`, `daftarkan perangkat latihan`, `ganti kunci perangkat latihan`, dan `cabut kunci perangkat latihan`, dan (Modul 24) `buat aturan siram tanah` dan `hapus aturan` (ganti angka di alamat `hapus aturan` dengan `id` dari jawaban `buat aturan siram tanah`; bawaannya `4`, nomor aturan pertama sesudah tiga aturan Modul 19). Sandinya dibaca dari `bruno/.env` (tidak ikut Git) berisi `SANDI_ADMIN=…` dan `SANDI_VIEWER=…`. Kirim `login admin` atau `login viewer` dulu; *cookie*-nya dipakai otomatis oleh permintaan lain.

## API

| Rute | Siapa | Gunanya |
| :--- | :--- | :--- |
| `POST /auth/login` | terbuka | *login* dengan `{ "email": …, "sandi": … }`; jawabannya `{ id, email, nama, peran }` + *cookie* `akses` dan `sesi` |
| `POST /auth/refresh` | terbuka (*cookie* `sesi`) | gelang baru + kartu terusan baru |
| `POST /auth/logout` | terbuka | menghapus sesi dan kedua *cookie*; selalu `{"pesan":"sudah logout"}` |
| `GET /auth/me` | login | akun yang sedang *login* (dibaca dari database) |
| `GET /health` | terbuka | server hidup? tersambung ke broker dan database? berapa pesan `diterima`, `ditolak` (gagal kontrak), dan `diabaikan` (dari perangkat tak terdaftar/dicabut, Modul 21)? |
| `GET /devices` | login | daftar perangkat dari database: yang terdaftar, yang dicabut, dan baris lama yang belum terdaftar; kolom `kunci` menandai `aktif`/`dicabut`/`tanpa-kunci`/`belum-terdaftar` (sidik jari kunci tidak pernah ikut) |
| `POST /devices` | admin | daftarkan perangkat (Modul 21): jawabannya memuat `kunci` 43 huruf **yang hanya tampil sekali ini** dan `langkah` berikutnya; `penghubung` untuk perangkat ESP-NOW (Node 2) yang datanya diterbitkan Node 1 (tanpa kunci) |
| `POST /devices/:id/kunci` | admin | buat kunci baru (kunci lama langsung tidak berlaku); juga menghidupkan lagi perangkat yang dicabut |
| `POST /devices/:id/cabut` | admin | cabut kunci perangkat yang hilang atau dicuri: backend langsung mengabaikan datanya, perintah kepadanya dijawab 409 |
| `GET /devices/:id/latest` | login | bacaan `telemetry` terbaru satu perangkat |
| `GET /devices/:id/vitals` | login | kesehatan terakhir satu perangkat |
| `GET /devices/:id/readings?from=…&to=…` | login | riwayat bacaan mentah dari database (bawaan: satu jam terakhir; paling banyak 1.000 bacaan) |
| `GET /devices/:id/readings?bucket=15m\|1h\|1d&from=…&to=…` | login | ringkasan riwayat per 15 menit, per jam, atau per hari WIB (bawaan: 1 hari, 7 hari, atau 30 hari terakhir; paling banyak 1.000 ember) |
| `POST /devices/:id/command` | admin | kirim perintah `set` ke Node 1, tunggu `ack`-nya paling lama 5 detik, lalu catat di tabel `commands` (dengan `sumber` `api`); perangkat yang belum terdaftar dijawab 404, yang kuncinya dicabut 409 |
| `GET /devices/:id/state` | login | keadaan aktuator: yang diinginkan server (`desired`), yang terakhir dilaporkan perangkat (`reported`, dari `telemetry.state` atau `ack.state`), kapan laporan itu tiba, dan aktuator yang belum cocok (`selisih`) |
| `GET /rules` | login | semua aturan otomatis yang sedang dipakai server; aturan jadwal ditambah `berikutnya` (UTC) |
| `POST /rules` | admin | buat aturan baru: ambang naik (`kondisi.jenis` `ambang`) atau, sejak Modul 24, ambang turun (`ambang-bawah`) dengan aksi `sakelar` atau `perintah` (dikirim sekali), atau jadwal (`jadwal` + `perintah`); langsung berlaku |
| `PUT /rules/:id` | admin | ganti seluruh isi satu aturan; langsung berlaku tanpa memulai ulang server, dan ambang aturan kipas dikirim ke perangkat sebagai `config` *retained* |
| `DELETE /rules/:id` | admin | hapus satu aturan (Modul 24); langsung tidak berlaku, jawabannya `{ id, nama, pesan }`. Keadaan yang diinginkannya ikut dilupakan, jadi perangkat yang menyala ulang tidak menerima lagi perintah aturan itu; aktuator yang sedang dinyalakannya dibiarkan apa adanya. Riwayat perintah dan kejadiannya tetap ada (kolom `aturan_id`-nya menjadi kosong). Untuk menyimpan aturan tanpa menjalankannya, pakai `PUT` dengan `"aktif": false` |
| `POST /rules/:id/jalankan` | admin | jalankan aksi satu aturan jadwal sekarang juga (untuk menguji, tanpa menunggu jamnya) |

"login" = akun apa pun yang sudah *login* (`admin` atau `viewer`). Data *live* tersedia lewat **Socket.IO** di alamat yang sama (`/socket.io/`), juga dengan *cookie* `akses`: kirim `ikuti` dengan `device_id` (jawabannya membawa bacaan terakhir) untuk menerima acara `telemetry` perangkat itu; acara `status` dan `kejadian` dikirim ke semua klien. Tanpa *cookie*, sambungan ditolak (`connect_error` `belum login`); saat gelang kedaluwarsa, server memutus sambungan dan klien harus *refresh* lalu menyambung lagi. Contoh klien: `alat/terminal-live.js` (akun dibaca dari `alat/.env`).

Aturan otomatis disimpan di tabel `rules` sebagai data JSON yang diperiksa Zod. Aturan ambang menyala kalau besarannya **di atas** `nyala_di_atas` terus-menerus selama `selama_detik` detik, lalu padam **di bawah** `padam_di_bawah`. Aturan jadwal memakai cron 5 bidang dan selalu dihitung dalam WIB (`Asia/Jakarta`), apa pun zona waktu laptopnya. Contoh aturan kipas:

```json
{"nama":"Kipas otomatis","aktif":true,
 "kondisi":{"jenis":"ambang","device_id":"a4cf12e5b7c0","besaran":"suhu","nyala_di_atas":30,"padam_di_bawah":28,"selama_detik":120},
 "aksi":{"jenis":"sakelar","device_id":"a4cf12e5b7c0","target":"kipas","kabari":true}}
```

Sejak Modul 24 (v1.1), aturan ambang juga bisa berarah **turun** (`ambang-bawah`): menyala kalau besarannya **di bawah** `nyala_di_bawah` terus-menerus selama `selama_detik` detik, lalu padam (siap lagi) **di atas** `padam_di_atas`, yang harus lebih besar daripada `nyala_di_bawah` (histeresis). Kedua arah ambang boleh memakai aksi `sakelar` (kipas atau lampu menyala selama aturan menyala) atau aksi `perintah`, yang dikirim **sekali** saat aturan menyala; saat aturan padam tidak ada perintah yang dikirim. Jadwal tetap hanya boleh memakai aksi `perintah`. Contoh "siram jika tanah < 30 %":

```json
{"nama":"Siram jika tanah < 30 %","aktif":true,
 "kondisi":{"jenis":"ambang-bawah","device_id":"a4cf12e5b7c0","besaran":"tanah","nyala_di_bawah":30,"padam_di_atas":35,"selama_detik":10},
 "aksi":{"jenis":"perintah","device_id":"a4cf12e5b7c0","perintah":{"target":"pompa","nilai":5},"kabari":true}}
```

Saat tanah bertahan di bawah 30 % selama 10 detik, pompa menyiram 5 detik dan kejadian `🌱 Tanah 25 % — pompa menyiram 5 detik otomatis` tercatat. Pompa tidak menyiram lagi selama tanah belum sempat naik di atas 35 % (`✅ Tanah naik ke 36 % — aturan siap lagi`); keputusan hanya diambil saat aturan berganti keadaan. Kalau perangkat menolak perintahnya (misalnya `pompa ditolak: air tandon kurang`) atau tidak menjawab dalam 5 detik, kejadiannya berbunyi `⚠️ Tanah 25 % — perintah pompa ditolak perangkat: pompa ditolak: air tandon kurang` (atau `… pompa TIDAK menjawab perintah (tidak dikirim ulang)`), dan aturan itu baru menyiram lagi pada kekeringan berikutnya atau setelah aturannya disimpan ulang (misalnya dinonaktifkan lalu diaktifkan lagi); tanpa jeda ini, tandon yang kosong akan memicu kejadian yang sama setiap beberapa detik.

Bentuk aturan ditulis di `src/schemas/aturan-dasar.ts` (tanpa node-cron, sehingga salinan identiknya bisa dipakai dashboard di browser, Modul 24); `src/schemas/aturan.ts` memakai semua isinya lalu menambah satu pemeriksaan yang hanya bisa di server: isi ekspresi cron (`ekspresi cron tidak sah`).

Dengan `bucket`, jawabannya berbentuk `{ device_id, dari, sampai, ember, jumlah, ringkasan: [ { waktu, suhu_rata, suhu_min, suhu_maks, kelembapan_rata, tanah_rata, cahaya_rata, jumlah_bacaan } ] }`. `waktu` adalah awal ember (UTC), dan `dari` dibulatkan ke bawah ke awal ember. Ringkasan per 15 menit dihitung langsung dari bacaan mentah, ringkasan per jam dibaca dari `readings_per_jam`, dan ringkasan per hari menggabungkan ringkasan per jam menjadi hari WIB. Rata-rata hariannya tepat sama dengan hitungan dari bacaan mentah karena setiap jam menyimpan rata-rata dan banyaknya nilai (`suhu_rata` dan `suhu_n`, dan seterusnya).

Koleksi Bruno untuk semua rute ada di folder `bruno/` (pilih *environment* `lokal`).

## Keamanan perangkat dan broker (Modul 21)

Sampai Modul 20, backend membuat baris `devices` otomatis untuk perangkat **apa pun** yang mengirim pesan, dan siapa pun yang bisa menghubungi broker boleh menerbitkan ke topik mana pun. Modul 21 menutup keduanya.

- **Daftar resmi + kunci per perangkat.** Perangkat harus didaftarkan admin lewat `POST /devices`. Jawabannya memuat **kunci** 32 *byte* acak (43 huruf `base64url`) yang **hanya tampil sekali**; database hanya menyimpan sidik jari SHA-256-nya (seperti *refresh token* Modul 20). `POST /devices/:id/kunci` membuat kunci baru (yang lama langsung mati), `POST /devices/:id/cabut` mencabutnya. Jawaban registrasi juga memuat `langkah`: pasang kunci yang sama ke perangkat (ketik `kunci <isi>` di Serial Monitor, atau `KUNCI_<DEVICE_ID>=…` di `alat/.env` untuk simulator) dan ke broker (`mosquitto_passwd` di mesin broker). Perangkat ESP-NOW (Node 2) didaftarkan dengan `penghubung` (device\_id Node 1) dan **tidak** diberi kunci: datanya diterbitkan Node 1.
- **Lapis kedua di backend.** Walaupun broker sudah menjaga pintu, backend memeriksa lagi: pesan dari perangkat yang **belum terdaftar** atau **sudah dicabut** diabaikan seketika (dicatat `DIABAIKAN …` paling sering sekali semenit per perangkat, dihitung di `/health` sebagai `diabaikan`), perintah kepadanya dijawab 404/409, dan backend **tidak lagi** membuat baris `devices` otomatis. Jadi walaupun berkas sandi broker dan database sempat tidak sama, perangkat yang tidak berhak tetap tertolak.
- **Akun broker milik backend.** Backend masuk ke broker dengan akunnya sendiri (`MQTT_USERNAME`/`MQTT_PASSWORD` di `.env`, **bukan** di dalam `MQTT_URL`), bukan sebagai perangkat atau manusia. Kalau broker menolak akunnya (CONNACK 5), backend mencatatnya sekali dan mencoba lagi tiap 60 detik; begitu akunnya diperbaiki di broker dan broker dimuat ulang, backend pulih sendiri tanpa dijalankan ulang.
- **Broker (di luar backend).** Berkas contoh `edge/mosquitto-lan.conf`, `edge/gateway-pi.conf`, dan `edge/acl-broker` mengunci broker dengan `allow_anonymous false`, `password_file`, `acl_file` (pola `%u` = `device_id`), dan `use_username_as_clientid`. Lihat `edge/README.md`.

**🎉 Checkpoint Fase 3.** Rumah kini berkunci untuk manusia (akun, login, peran, pengaman API — Modul 20) *dan* untuk perangkat (kunci per perangkat, lapis kedua, akun broker, ACL — Modul 21). Yang **belum** aman, dan jujur disebut: lalu lintas MQTT dan HTTP masih tanpa enkripsi di LAN (kunci terbaca polos oleh penyadap di jaringan yang sama) — wajib TLS sebelum dibuka ke internet (Modul 27); kunci di NVS ESP32 terbaca siapa pun yang memegang papan (*flash encryption*, 🔬); dan hitungan *rate limit* masih di memori.

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
| `010_kunci_perangkat.sql` | kolom kunci di `devices`: `terdaftar`, `kunci_hash` (SHA-256, 64 huruf heksadesimal), `kunci_dibuat`, `dicabut`, dan `penghubung` (Node 2 → Node 1); empat `CHECK` yang menjaga kunci, pencabutan, dan penghubung tetap konsisten (nomor 009 sengaja dilewati: dipakai Tantangan Tingkat 3 Modul 20) |

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

## Catatan versi 1.1

Backend 1.1.0 dibuat di Modul 24 supaya dashboard v1.0 bisa membuat aturan "siram jika tanah < 30 %" dan menghapus aturan.

- **Kondisi `ambang-bawah`** (`nyala_di_bawah`, `padam_di_atas`, `selama_detik`), dinilai otak yang sama dengan kondisi `ambang` (`nilaiAmbangBawah` di `src/aturan/mesin.ts`).
- **Aksi `perintah` untuk kondisi ambang** (naik atau turun): dikirim sekali saat aturan menyala. Pasangan yang ditolak tinggal jadwal + sakelar, dengan pesan `400` baru `kondisi jadwal berpasangan dengan aksi perintah; aksi sakelar hanya untuk kondisi ambang atau ambang-bawah` (v1.0: `kondisi ambang berpasangan dengan aksi sakelar; kondisi jadwal dengan aksi perintah`, dan ambang + perintah masih ditolak).
- **`DELETE /rules/:id`** (admin), dan `DELETE` ditambahkan ke `methods` CORS di `src/auth/keamanan.ts` supaya browser lolos *preflight*. Kejadian `aturan-diubah` untuk aturan yang dihapus ditulis dengan `aturan_id` kosong (nomornya ada di `data.id`), karena barisnya sudah tidak ada. Perintah dan kejadian aturan yang dihapus saat perintahnya masih menunggu *ack* juga tetap tercatat, dengan `aturan_id` kosong.
- **Aturan yang dihapus atau dinonaktifkan tidak bertindak lagi**, juga lewat rekonsiliasi: keadaan yang diinginkannya dilupakan (`lupakanKeinginanAturan()` di `src/services/perintah.ts`). Di v1.0, lampu yang dinyalakan aturan yang sudah dinonaktifkan dinyalakan lagi saat perangkatnya menyala ulang.
- **`data.ok` di kejadian `aturan` dan `jadwal`**: `true` kalau perangkat menjawab ok, `false` kalau perintahnya ditolak, tidak dijawab, tidak terkirim, atau jadwalnya terlewat, `null` kalau tidak ada perintah yang dikirim (aturan siap lagi). Dashboard v1.0 memakainya untuk warna kabar, tanpa menebak dari kalimat.
- **Pengingat Telegram** aturan `perintah` berbunyi `… — aturan "Siram jika tanah < 30 %" belum siap lagi (menunggu tanah di atas 35) (pengingat)`, bukan "masih menyala": pompanya sudah lama padam.
- **Skema dipecah dua**: `src/schemas/aturan-dasar.ts` (semua bentuk aturan, hanya butuh `zod` dan `kontrak.ts`, disalin identik ke `frontend/src/skema/`) dan `src/schemas/aturan.ts` (menambah pemeriksaan cron dengan node-cron, hanya di server). Berkas lain di backend tetap mengimpor dari `aturan.ts`.
- **Tanpa migrasi database**: kondisi dan aksi disimpan sebagai JSON (`jsonb`), dan `commands.aturan_id` serta `events.aturan_id` sudah `ON DELETE SET NULL` sejak migrasi `007`. Kontrak data tetap **1.4**; firmware tidak berubah.
- **Turun versi**: backend v1.0 yang membaca aturan berbentuk baru tidak mogok; aturan itu dilewati dengan peringatan `aturan N dilewati: …` (lihat `muatAturan()`), aturan lainnya tetap berjalan. Aturan yang dilewati juga TIDAK tampil di `GET /rules` v1.0 (dashboard seolah kehilangan aturan itu); datanya utuh di database dan tampil lagi begitu naik ke 1.1. Jangan menyimpan aturan bernomor itu lewat `PUT` v1.0: isinya akan ditimpa bentuk v1.0.
- Versi `1.1.0` di `package.json` dan di `/docs`.

## Batasan v1.1

- `GET /devices/:id/latest`, `vitals`, dan `state` masih dibaca dari memori, jadi kosong lagi setiap server dimulai ulang. Keadaan yang diinginkan (`desired`) dan hitungan "selama" setiap aturan juga hilang saat server dimulai ulang; riwayat bacaan, perintah, aturan, kejadian, akun, dan sesi tersimpan permanen di database.
- Bacaan yang datang saat database tidak bisa dihubungi tidak tersimpan.
- Bacaan mentah hanya disimpan 90 hari; yang lebih tua tinggal ringkasan per jamnya.
- Hari pada ringkasan `1d` adalah hari WIB (`Asia/Jakarta`), juga bagi perangkat di WITA atau WIT. Jadwal aturan juga dihitung dalam WIB.
- Aturan dan jadwal hanya berjalan selama backend menyala. Jadwal yang terlambat lebih dari 15 menit (misalnya laptop tidur pukul 06.00) tidak dijalankan belakangan, hanya dicatat; kalau backend mati pada jam itu, tidak ada yang dicatat. Saat broker tak terjangkau, Node 1 menjalankan pengaman kipasnya sendiri dengan ambang dari `config`.
- Perubahan aturan langsung di database (misalnya lewat DBeaver) baru terbaca saat server dimulai ulang atau saat aturan lain diubah lewat API; pakai API `/rules`.
- Aturan dengan aksi `perintah` (misalnya pompa sekali) hanya bertindak saat aturannya berganti keadaan. Karena hitungannya hilang saat server dimulai ulang atau aturannya diubah, perintahnya dikirim sekali lagi kalau kondisinya masih terpenuhi sesudah itu.
- Menonaktifkan atau menghapus aturan kipas **tidak** mencabut `config` *retained* `suhu_kipas_on` yang sudah terkirim: Node 1 tetap memakai angka terakhir itu sebagai pengaman lokal saat broker tak terjangkau.
- Menghapus atau menonaktifkan aturan `sakelar` yang sedang menyala **tidak** memadamkan aktuatornya: kipas atau lampu dibiarkan dalam keadaan terakhir (server tidak mengirim perintah apa pun). Padamkan lewat tombol dashboard atau `POST /devices/:id/command`.
- Backend hanya mengirim `suhu_kipas_on`, tidak pernah `tanah_siram`. Node 1 v1.6.0 tetap menyiram sendiri (3 detik, lalu jeda 30 detik) kalau tanah di bawah ambang lokalnya, bawaan 30 %, juga saat backend menyala. Supaya aturan siram di server yang bertindak lebih dulu, turunkan ambang lokal di bawah ambang aturan server lewat Serial Monitor (`ambang 20`); siram lokal lalu baru bertindak kalau tanah tetap mengering sampai di bawah 20 %, misalnya saat backend mati atau WiFi putus. Pengaman tandon firmware (`pompa ditolak: air tandon kurang` di bawah 20 %) tetap menjaga keduanya.
- Gelang (JWT akses) yang sudah dibagikan tetap berlaku sampai kedaluwarsa (paling lama 15 menit), juga sesudah *logout*, ganti peran, ganti sandi, atau hapus akun; sambungan Socket.IO yang sedang berjalan pun baru diputus saat gelangnya habis (kecuali *logout* dari sesi itu sendiri, atau kartu terusan lama yang dipakai lagi 30 detik atau lebih sesudah diganti, yang langsung memutusnya).
- Hitungan *rate limit* disimpan di memori satu server: dimulai ulang = nol, dan tidak cocok untuk beberapa server sekaligus.
- *Cookie* belum `Secure` karena server masih `http://`; HTTPS menyusul di Fase 5. Server masih hanya menerima tamu dari laptop ini (`HOST=127.0.0.1`).
- **Lalu lintas MQTT (dan HTTP) masih tanpa enkripsi.** Nama pengguna dan kunci perangkat terkirim polos di LAN: siapa pun yang bisa melihat paket di jaringan yang sama bisa membacanya (buktikan sendiri dengan `alat/penyadap.js`). Di jaringan rumah tertutup risikonya masih kecil, tetapi **wajib TLS sebelum dibuka ke internet** (Modul 27). Kunci di NVS ESP32 juga terbaca siapa pun yang memegang papan (*flash encryption*, 🔬).
- Daftar perangkat terdaftar dimuat ke memori saat server menyala; perubahan `devices` langsung di database (bukan lewat API) baru terbaca saat server dimulai ulang. `GET /devices` sendiri selalu dibaca segar dari database.
