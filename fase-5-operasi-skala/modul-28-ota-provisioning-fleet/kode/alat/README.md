# 🧰 Alat bantu Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../en/mini-smart-home/tools/README.md)

Folder ini berisi program-program kecil Node.js yang dibuat di [Modul 4](../../../../fase-0-fondasi/modul-04-javascript-nodejs/README.md), [Modul 11](../../../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md), [Modul 16](../../../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md), [Modul 19](../../../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md), [Modul 20](../../../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md), dan [Modul 21](../../../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md) (simulatornya diperbarui lagi di [Modul 24](../../../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md) dan [Modul 25](../../../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md)), lalu dipakai berulang kali di modul-modul berikutnya. Semuanya sudah diuji dengan **Node.js 24.21.0**. Tiga program pertama tidak membutuhkan library dari npm; `pemeriksa-kontrak.js` dan `simulator-perangkat.js` membutuhkan library **mqtt** 5.16.1, dan `terminal-live.js` membutuhkan **socket.io-client** 4.8.4 (lihat "Cara memakai").

| File | Gunanya | Dipakai lagi di |
| :--- | :--- | :--- |
| [`generate-dummy.js`](../../../../proyek-rumah-pintar-mini/alat/generate-dummy.js) | Membuat bacaan sensor palsu yang bentuknya persis seperti [kontrak data](../../../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini). Jalankan langsung untuk menulis `data/bacaan.json` atau pinjam fungsinya: `import { buatTelemetri } from "./generate-dummy.js";` | Modul 10 (data uji sebelum sensor siap), Modul 16 (simulator perangkat untuk *backend*), Modul 22 (dashboard sebelum ada sensor sungguhan) |
| [`penerima-webhook.js`](../../../../proyek-rumah-pintar-mini/alat/penerima-webhook.js) | Server mini di port 3000 yang mencetak setiap kiriman dan membalas `{"ok":true}`. | Modul 10 (ESP32 mengirim bacaan pertamanya lewat WiFi ke laptop), lalu Modul 22 sebagai penerima uji |
| [`kirim-data.js`](../../../../proyek-rumah-pintar-mini/alat/kirim-data.js) | Pengirim uji: berpura-pura menjadi ESP32 dan mengirim 3 bacaan ke `http://localhost:3000/telemetry`. | Modul 10, untuk menguji penerima tanpa papan |
| [`pemeriksa-kontrak.js`](pemeriksa-kontrak.js) | Satpam kontrak data: berlangganan `rpm/#` di broker MQTT, lalu memberi cap **LULUS** atau **GAGAL** pada setiap pesan sesuai [`KONTRAK-DATA.md`](../KONTRAK-DATA.md), lengkap dengan alasannya dan lama setiap jawaban `ack`. | Modul 11 (syarat lulus Node 1 v1.2), Modul 14 (versi 1.1: `telemetry` Node 2 diperiksa dengan kolomnya sendiri), Modul 15 (versi 1.2: tiga kolom sensor RS-485 di `telemetry` Node 1), Modul 19 (versi 1.3: `state` di `telemetry` dan `ack`, laporan mode offline di `vitals`, isi `config`, `set` yang tertempel), Modul 21 (versi 1.4: masuk ke broker berkunci dengan akun `pemeriksa` dari `alat/.env`; alamat boleh membawa port), Modul 28 (versi 1.6: `reset_reason` + `fw` + laporan `ota` di `vitals`, perintah `update` dan `jeda` di `config`; `update` yang tertempel ditandai GAGAL), lalu setiap kali firmware berubah atau perangkat baru ditambahkan |
| [`simulator-perangkat.js`](simulator-perangkat.js) | Sepuluh perangkat palsu (`f00d00000001` sampai `f00d00000010`) yang berbicara MQTT persis menurut kontrak data: status `online`/`offline` (wasiat, *Last Will*), `telemetry` setiap 10 detik dari `buatTelemetri()` (sejak Modul 19 dengan `state` dan kiriman segera saat aktuator berubah), `vitals` saat tersambung dan setiap 5 menit, serta jawaban `ack` untuk setiap perintah, termasuk `config` (disimpan di `data/arsip-simulator.json`). Sejak Modul 19, suhu bisa diatur dari terminal (`suhu 33`, `suhu acak`), dan saat broker tak terjangkau 2 menit simulator masuk mode offline, menjalankan pengaman kipas, lalu melapor lewat `vitals` sekitar 10 detik setelah tersambung lagi. Sejak Modul 21, setiap perangkat palsu masuk ke broker dengan akunnya sendiri (nama pengguna = `device_id`, kunci dari `alat/.env`); perangkat tanpa kunci tidak dijalankan, dan kunci yang ditolak broker dicoba lagi 60 detik kemudian. Sejak Modul 24, kelembapan tanah dan isi tandon juga bisa diatur dari terminal (`tanah 25`, `tandon 15`), dan perintah pompa ditolak seperti Node 1 (`pompa ditolak: air tandon kurang`) kalau isi tandon di bawah 20 %. Sejak Modul 25, perangkat palsu pertama juga bisa membawa **Kebun tiruan** `f00d000000b2`, Node 2 palsu yang datanya ia terbitkan seperti Node 1 asli menerbitkan data Node 2 (`kebun mulai`, `kebun cabut`, `kebun pasang`). Mode `bersihkan` menghapus status *retained* mereka dari broker. | Modul 16 (menguji backend tanpa papan), Modul 19 (aturan otomatis dan uji "broker mati"), Modul 24 (aturan "siram jika tanah < 30 %" dan tombol pompa yang ditolak, tanpa Kit A), Modul 25 (*alert* "node diam" dan "cabut baterai Node 2" tanpa Kit B), Modul 28 (pembaruan firmware TIRUAN, rollback tiruan, kode klaim, dan armada banyak perangkat, tanpa papan), lalu setiap modul yang butuh banyak perangkat |
| [`buat-bin-tiruan.js`](buat-bin-tiruan.js) | Membuat berkas `.bin` **TIRUAN** (bukan firmware) untuk berlatih pembaruan firmware tanpa papan: bait pertama `0xE9` dan teks "BUKAN FIRMWARE ASLI", ukuran bawaan 1.196.032 byte, pilihan `--uji` untuk latihan rollback. Tidak membutuhkan library dari npm; ujinya `node --test buat-bin-tiruan.test.js`. Lihat "Berkas firmware tiruan untuk jalur tanpa Kit (Modul 28)" di bawah. | Modul 28 (jalur tanpa Kit: diunggah di layar Armada, lalu "dipasang" perangkat tiruan simulator) |
| [`terminal-live.js`](../../../../proyek-rumah-pintar-mini/alat/terminal-live.js) | "Terminal kecil" yang tersambung ke backend lewat Socket.IO, mengikuti satu perangkat (`ikuti`), lalu menampilkan setiap bacaannya begitu tiba, perubahan status semua perangkat, dan buku kejadian. Menyambung ulang sendiri saat backend dimulai ulang. Sejak Modul 20, terminal ini *login* dulu dengan akun dari `alat/.env` (cukup akun `viewer`), lalu memperbarui gelangnya sendiri (*refresh*) setiap kali server memutusnya karena kedaluwarsa. | Modul 19, Modul 20 (Socket.IO berkunci), lalu Modul 23 (dashboard *live* memakai acara yang sama) |

## Cara memakai

Buka folder `alat` ini di terminal (misalnya **Terminal → New Terminal** di VS Code, lalu `cd alat`), kemudian:

```bash
node generate-dummy.js 3
```

```bash
node penerima-webhook.js
```

Biarkan penerima berjalan, lalu buka terminal kedua (**Terminal → Split Terminal**). Lirik *prompt*-nya: kalau belum berakhiran `alat` (biasanya di Windows), ketik `cd alat` dulu; kalau sudah (biasanya di macOS dan Linux), langsung saja. Setelah itu, jalankan:

```bash
node kirim-data.js
```

Hentikan penerima dengan **Ctrl + C**. Penjelasan lengkap setiap baris ada di Modul 4 Praktik 4 dan Praktik 9.

Untuk `pemeriksa-kontrak.js`, pasang dulu library-nya sekali saja (di folder `alat` ini), lalu jalankan selagi broker MQTT menyala:

```bash
npm install mqtt@5.16.1
```

Sejak Modul 21, broker di rumah berkunci, jadi pemeriksa dan simulator butuh akun broker. Sejak Modul 26, broker di laptop adalah **broker pusat** Docker Compose (layanan `mosquitto` di `compose.cloud.yml`; dari laptop ini alamatnya `127.0.0.1:1883`): akunnya dibuat di dalam kontainer, dari akar proyek, dengan `docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker pemeriksa` (lalu akun perangkat latihan, misalnya `f00d00000001`, dengan kuncinya), kemudian `docker compose restart mosquitto`. Data dari broker gerbang Pi juga sampai ke broker pusat lewat jembatan, jadi pemeriksa yang tersambung ke broker pusat melihat pesan perangkat sungguhan juga. Salin `.env.example` menjadi `.env` di folder `alat` ini (kalau belum), lalu isi `KUNCI_PEMERIKSA` dengan sandi akun `pemeriksa` (akun yang hanya boleh membaca `rpm/#`, dibuat di broker dengan `mosquitto_passwd`) dan `KUNCI_F00D00000001` dengan kunci perangkat latihan dari jawaban `POST /devices` di backend. File `.env` tidak ikut Git. Jalankan keduanya dengan `--env-file=.env`:

```bash
node --env-file=.env pemeriksa-kontrak.js
```

Tanpa tambahan apa pun, pemeriksa menyambung ke broker di laptop yang sama (`127.0.0.1`; sejak Modul 26 = broker pusat Compose) dan memeriksa semua topik `rpm/#`; untuk broker di komputer lain, tulis alamatnya di belakang, misalnya `node --env-file=.env pemeriksa-kontrak.js 192.168.1.10`, dan untuk port selain 1883 tulis juga port-nya, misalnya `127.0.0.1:1884`. Kalau broker menolak akunnya, pemeriksa berhenti dengan pesan `Broker 127.0.0.1:1883 menolak akun pemeriksa (kode 5). …`. Di broker publik (jalur Wokwi), tulis juga `device_id` perangkatmu supaya hanya pesannya yang diperiksa, misalnya `node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b` (tanpa `--env-file`: broker publik itu tidak berkunci). Berhenti dengan **Ctrl + C**; sebelum berhenti, ia mencetak ringkasan LULUS/GAGAL. Penjelasannya ada di Modul 11 Praktik 8 dan Modul 21.

Simulator memakai library yang sama. Tulis alamat broker lengkap (diawali `mqtt://`) di belakang nama filenya: sejak Modul 26 biasanya broker pusat di laptop ini, `mqtt://127.0.0.1:1883` (sebelumnya broker Pi, misalnya `mqtt://192.168.1.37:1883`, yang tetap boleh dipakai: datanya sampai ke pusat lewat jembatan). Isian kedua (pilihan) adalah jumlah perangkat palsunya, misalnya `1`. Hanya perangkat yang kuncinya ada di `alat/.env` (`KUNCI_F00D00000001=…`, `KUNCI_F00D00000002=…`, dan seterusnya) yang dijalankan; yang lain dilewati dengan pesan `kunci belum ada di alat/.env`. Jalankan seperti ini, lalu hentikan dengan **Ctrl + C** kalau sudah selesai:

```bash
node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1
```

**Ke broker di internet (Modul 27, pusat di VPS).** Simulator yang sama bisa menyambung langsung ke pintu TLS VPS, tanpa mengubah kodenya: tulis `mqtts://` (bukan `mqtt://`), **nama** broker (bukan IP: sertifikatnya hanya berlaku untuk nama itu), dan port 8883. Akun dan kunci setiap perangkat palsu harus ada di broker VPS (`mosquitto_passwd` di VPS) dan perangkatnya terdaftar di backend VPS. Node.js memeriksa sertifikat VPS dengan daftar akar CA bawaannya, yang sudah memuat akar Let's Encrypt (ISRG Root X1), jadi tidak perlu berkas CA:

```bash
node --env-file=.env simulator-perangkat.js mqtts://mqtt.namaanda.my.id:8883 1
```

Di lab penulis (VPS dan Let's Encrypt tiruan, Pebble), Node diberi akar CA tiruannya lewat `NODE_EXTRA_CA_CERTS=<berkas akar>`; hasilnya `f00d00000001: online`, dan log broker VPS menulis `Client f00d00000001 negotiated TLSv1.3 cipher TLS_AES_256_GCM_SHA384`. Belum diuji penulis dengan Let's Encrypt sungguhan. `pemeriksa-kontrak.js` tetap hanya polos (`mqtt://`): jalankan di jaringan yang sama dengan brokernya.

Kalau broker menolak kunci sebuah perangkat palsu (kunci salah, belum dipasang di broker, atau sudah dicabut), simulator menulis `f00d00000001: DITOLAK broker (kode 5): kunci salah, belum didaftarkan, atau sudah dicabut. Dicoba lagi 60 detik lagi.` dan mencoba lagi setiap 60 detik.

Kata `bersihkan` di tempat isian kedua menghapus status *retained* perangkat palsu dari broker (setiap perangkat masuk dengan akunnya sendiri), lalu programnya selesai sendiri. Sejak Modul 25, status Kebun tiruan ikut dihapus lewat `f00d00000001` (hanya berlaku kalau blok ACL Kebun sudah dibuka). `config` *retained* di topik `cmd` tidak ikut dihapus: hanya akun `backend` dan `nodered` yang boleh menulis `cmd`, dan config itu hanya bisa dibaca perangkat itu sendiri.

```bash
node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 bersihkan
```

Selagi simulator berjalan, ketik `suhu 33` lalu **Enter** di terminal yang sama supaya semua perangkat palsu membaca 33,0 °C (pakai titik untuk desimal, misalnya `suhu 29.5`); `suhu acak` mengembalikan suhu acak 25,0–33,0 °C. Penjelasan simulator ada di Modul 16 Praktik 7 dan Modul 19.

Sejak Modul 24, dua isian lain juga bisa diatur dengan cara yang sama, berupa bilangan bulat 0–100:

| Ketik | Akibatnya |
| :--- | :--- |
| `tanah 25` | semua perangkat palsu membaca kelembapan tanah 25 % (untuk menguji aturan "siram jika tanah < 30 %"); `tanah acak` mengembalikan tanah acak 20–60 %. Simulator **tidak** membasahi tanah sesudah pompa menyala: ketik sendiri `tanah 40` untuk "tanah sudah basah lagi" |
| `tandon 15` | isi tandon (`level_air`) 15 %. Selama isinya di bawah 20 %, setiap perintah pompa dijawab `ack` dengan `"ok": false` dan `"pesan": "pompa ditolak: air tandon kurang"`, sama persis dengan Node 1, dan terminal simulator menulis `f00d00000001: pompa DITOLAK: air tandon tinggal 15 %`. `tandon acak` mengembalikan isi tandon acak 30–90 % (selalu cukup) |

Angka yang diketik ikut terkirim bersama `telemetry` berikutnya (paling lama 10 detik kemudian), sedangkan penolakan pompa berlaku seketika.

### Kebun tiruan (Modul 25)

Untuk pembaca **tanpa Node 2 sungguhan**: perangkat palsu pertama `f00d00000001` berperan sebagai Node 1 yang menerbitkan data Node 2 palsu `f00d000000b2` ("Kebun tiruan"), persis seperti Node 1 asli menerbitkan data Node 2 ([`KONTRAK-DATA.md`](../KONTRAK-DATA.md) bagian 1 dan 5). Siapkan sekali saja:

1. **Izin broker.** Di `edge/acl-broker`, hapus `# ` (pagar dan spasinya) di depan tiga baris blok `2b) Jalur laptop (Modul 25)`: `user f00d00000001`, `topic write rpm/f00d000000b2/telemetry`, dan `topic write rpm/f00d000000b2/status`. Simpan, lalu **restart** broker (bukan *reload*; lihat `edge/README.md`): broker pusat Compose (Modul 26) dengan `docker compose restart mosquitto` dari akar proyek. Tanpa langkah ini broker membuang data Kebun diam-diam, tanpa pesan galat di simulator.
2. **Daftarkan Kebun** di backend sebagai perangkat ESP-NOW dengan penghubung `f00d00000001`: Bruno `daftarkan Kebun tiruan` (`POST /devices` dengan `"device_id": "f00d000000b2"` dan `"penghubung": "f00d00000001"`). Kebun tidak punya kunci, jadi `alat/.env` tidak berubah; yang wajib ada tetap `KUNCI_F00D00000001`.
3. Jalankan simulator seperti biasa (cukup satu perangkat palsu: isian kedua `1`), lalu ketik di terminal yang sama:

| Ketik | Akibatnya |
| :--- | :--- |
| `kebun mulai` | Kebun menyala: satu paket `telemetry` Node 2 sekarang, lalu setiap **300 detik**. Paket pertama membuat `f00d00000001` menerbitkan status `online` Kebun (*retained*). Terminal menulis `f00d000000b2: Kebun bangun pukul 21.18.05 WIB, paketnya diterbitkan f00d00000001` setiap kali Kebun bangun |
| `kebun cabut` | "mencabut baterai" Kebun: paketnya berhenti. Terminal menulis jam paket terakhir dan perkiraan jam status `offline`, misalnya `Baterai Kebun DICABUT pukul 21.23.06 WIB. Paket terakhirnya pukul 21.23.05 WIB; status offline baru terbit sekitar pukul 21.39.05 WIB (960 detik sesudah paket terakhir).` |
| `kebun pasang` | "memasang baterai" lagi: Kebun langsung bangun dan mengirim paket (status kembali `online`), lalu setiap 300 detik |

Paket Kebun berbentuk `telemetry` Node 2 kontrak 1.1, misalnya `{"ts":"2026-10-26T14:18:05Z","fw":"1.0.0","suhu":28,"kelembapan":67,"tekanan":1008.2,"suhu_tanah":25.6,"tanah":44}`: ada `tekanan` (dari situ backend mengenali Node 2), tanpa `baterai`, tanpa `vitals`, dan `ts`-nya dibuat "Node 1" saat paket diterima. Status `offline` diterbitkan `f00d00000001` sesudah **960 detik** tanpa paket (3 × 300 detik + 1 menit), sama dengan jembatan Node 1 v1.6.0.

Jeda 300 detik **sengaja tidak bisa dipercepat**: *alert* "node diam" di Grafana (Modul 25) menghitung keterlambatan Node 2 dari jadwal 5 menit ini, jadi menunggu beberapa menit memang bagian dari ujinya. Kalau simulator dihentikan (**Ctrl + C**), Kebun ikut diam, tetapi status terakhirnya tetap `online` di broker: Node 2 tidak punya wasiat, dan penerbitnya sudah mati, persis Node 2 asli saat Node 1 padam. Status yang tidak lagi jujur seperti itu adalah alasan *alert* Grafana memakai waktu data terakhir, bukan status. Simulator ini tidak menyimpan paket Kebun selama broker tak terjangkau (Node 1 asli menyimpannya di rak, lalu menerbitkannya belakangan).

### Pembaruan firmware tiruan, rollback tiruan, dan kode klaim (Modul 28)

Sejak Modul 28, setiap perangkat palsu meniru **rancangan firmware Node 1 1.7.0** ([`KONTRAK-DATA.md`](../KONTRAK-DATA.md) 1.6). Simulator tidak mem-*flash* apa pun dan berkas yang "dipasangnya" hanya diperiksa, tidak dijalankan; semua angka waktunya angka simulator di jaringan lab, **bukan** angka ESP32 lewat WiFi.

- **Versi.** Perangkat palsu yang belum pernah menyimpan versi mulai dengan firmware **1.7.0** (`telemetry.fw`, `vitals` dengan `reset_reason` dan `fw`). `--fw=1.6.0` di mana saja pada perintah membuat perangkat baru memakai firmware lama (tanpa `reset_reason`/`fw` di `vitals`, menolak `update` dengan `aksi update belum didukung (Modul 28)`), untuk menguji urutan pasang "backend dulu, baru firmware". Versi yang sudah terpasang tersimpan di `data/arsip-simulator.json` (pengganti NVS).
- **Alamat server.** Setiap perangkat palsu menyimpan **alamat server rumah** di "NVS", seperti kolom **Alamat server** di portal Node 1 1.7.0 (atau perintah Serial `server`): alamat dari `klaim` (di bawah), atau ketik `server http://192.168.1.10` di terminal simulator, atau bawaannya `ALAMAT_SERVER` di `alat/.env` (pengganti nilai bawaan `konfigurasi.h`). Isinya harus **sama persis** dengan `ALAMAT_SERVER` di `.env` akar (tanpa `/` di akhir). Ketikan (juga bawaan dari `alat/.env`) dirapikan dan diperiksa persis seperti portal Node 1 dan `ALAMAT_SERVER` backend: spasi di tepi dan `/` di akhir dibuang, huruf besar menjadi kecil, lalu paling panjang 64 huruf, `http://` atau `https://`, nama server hanya huruf kecil, angka, titik, dan `-` (tanpa `_`), port 1–65535 bila ditulis, tanpa jalur; `http://` hanya ke alamat IP rumah (simulator juga `127.x`). Bawaan yang bentuknya salah tidak dipakai, seperti papan sungguhan: simulator mencetak `ALAMAT_SERVER di alat/.env tidak dipakai: …` saat mulai. Perangkat hanya mau mengunduh firmware dari `<alamat server>/fw/node-1/<versi>.bin`: perintah `update` dengan `url` ke server lain dijawab `ack ok:false` `url bukan server rumah ini` dan kuncinya tidak pernah terkirim (tanpa aturan ini, akun lain yang boleh menulis `rpm/+/cmd`, misalnya `nodered`, bisa memanen kunci perangkat lewat server palsu). Belum diisi = `alamat server belum diisi (Serial: server <alamat>)`.
- **Perintah `update`** (dari tombol **Perbarui** di `/armada` atau `POST /devices/:id/update`): isinya diperiksa (versi, `url` = `<alamat server>/fw/node-1/<versi>.bin`, `sha256`, `ukuran`, `http://` hanya ke alamat IP rumah; simulator juga menerima `127.x` karena berjalan di mesin yang sama dengan server lab), dijawab `ack ok:true` seketika (= **diterima**), lalu perangkat menerbitkan `offline-mode`, memutus MQTT dengan rapi (tanpa wasiat), dan mengunduh berkasnya **seperti HTTPUpdate Arduino-ESP32 3.3.12**: `GET … HTTP/1.0`, `User-Agent: ESP32-http-Update`, Basic Auth `device_id:kunci`, `x-ESP32-STA-MAC` huruf besar, `x-ESP32-version`. Syaratnya juga sama: `200` + `Content-Length` (tanpa itu `-101`), bait pertama `0xE9` (`-106`), SHA-256 = isi perintah (`Update 15`); `304` = tidak ada pembaruan, `403` = `-103`, `404` = `-102`; server diam 8 detik sebelum menjawab = `-11`. Gagal = tetap versi lama, tersambung lagi, `vitals.ota` `gagal` dengan alasannya. Data yang berhenti **di tengah** berkas: lewat `https://` gagal sesudah 30 detik (`Update 6`); lewat `http://` perangkat "menyala ulang" oleh *watchdog* sesudah 60 detik (`reset_reason` `WDT`, laporan `gagal` `menyala ulang saat mengunduh (WDT)`), sama dengan Node 1 asli. `update` kedua sebelum unduhan pertama selesai = `pembaruan lain sedang berjalan`; `versi` di bawah 1.7.0 ditolak (firmware itu tidak punya rollback). Berhasil = "menyala ulang" 5 detik dengan versi baru (`reset_reason` `SW`).
- **Masa uji 60 detik.** Versi baru **sah** begitu broker menerima kuncinya, perangkat berlangganan `cmd`, dan menerbitkan `online` (aturan firmware, bukan menunggu PUBACK); laporannya `berhasil`. Berkas TIRUAN yang memuat penanda `UJI_KUNCI_SALAH` meniru firmware 1.7.2-uji (saklar `UJI_KUNCI_SALAH 1`): kunci brokernya dirusak di RAM, broker menolaknya (`DITOLAK broker (kode 5)`), 60 detik lewat, dan perangkat "kembali sendiri" ke versi lama (`rollback`). Laporan `ota` ikut paling banyak 3 `vitals`. Simulator yang dihentikan di tengah masa uji juga kembali ke versi lama saat dijalankan lagi (seperti listrik padam).
- **`config`** boleh membawa `jeda.vitals_s` (60–3600): jeda `vitals` perangkat itu berubah dan tersimpan. `telemetry` tetap 10 detik.
- Ketik **`restart`** = semua perangkat palsu berhenti sengaja (`offline-mode`, putus rapi), lalu menyala ulang (seperti perintah Serial `restart` firmware 1.7.0); **`ota`** = versi, alamat server, masa uji, dan laporan yang menunggu setiap perangkat palsu; **`server http://192.168.1.10`** = alamat server rumah semua perangkat palsu yang sedang berjalan (tersimpan di `data/`).
- **Kode klaim** ("papan baru" tanpa portal): buat kode di `/armada` (atau Bruno `buat kode klaim`), lalu:

```bash
node simulator-perangkat.js mqtt://127.0.0.1:1883 klaim 7K2M-QF9D http://127.0.0.1 f00d00000003
```

  Isian: alamat broker tempat perangkat masuk (gerbang Pi, atau broker pusat), kata `klaim`, kodenya, **alamat server** (yang juga diketik di portal; tanpa `/` di akhir), dan `device_id` (bawaan `f00d00000003`). Simulator memanggil `POST <alamat server>/api/provision/klaim`, menyimpan kuncinya dan alamat server itu di `data/arsip-simulator.json` (kunci tidak pernah dicetak), lalu langsung tersambung: `f00d00000003: klaim BERHASIL dalam … ms`, kemudian `f00d00000003: online (firmware 1.7.0)`. Akun brokernya dibuat backend sendiri bila `AKUN_BROKER_OTOMATIS` di `.env` akar bukan `mati`. Kode yang salah, kedaluwarsa, atau sudah dipakai: `klaim DITOLAK 403: …`. Sesudah itu, perangkat yang sama dijalankan seperti biasa (kuncinya diambil dari `data/`, `alat/.env` tidak perlu diubah).

Klaim butuh awalan `/api` di depan `provision/klaim`, yaitu jalan lewat Caddy (`http://127.0.0.1`, mode rumah Docker Compose). Backend mode kembang tanpa Caddy (`npm run dev`, `http://127.0.0.1:8080`) tidak punya awalan itu dan menjawab `401 belum login…`: untuk mode kembang, daftarkan perangkat palsu dengan `POST /devices` (Bruno) seperti Modul 21.

Isi `data/arsip-simulator.json` (versi, kunci hasil klaim, alamat server, rencana pembaruan) adalah "NVS" semua perangkat palsu dan **berisi kunci**: folder `data/` tidak ikut Git. Hapus berkas itu untuk mengembalikan semua perangkat palsu ke keadaan pabrik.

`terminal-live.js` butuh backend yang menyala dan library-nya (sekali saja, di folder `alat` ini):

```bash
npm install socket.io-client@4.8.4
```

Sejak Modul 20, Socket.IO backend berkunci, jadi terminal ini butuh akun. Salin `.env.example` menjadi `.env` di folder `alat` ini, lalu isi `EMAIL_TERMINAL` (misalnya `viewer@rumah.test`, akun dengan peran `viewer`) dan `SANDI_TERMINAL` (sandi akun itu). File `.env` tidak ikut Git (lihat `.gitignore`). Jalankan dengan `--env-file=.env`:

```bash
node --env-file=.env terminal-live.js http://127.0.0.1:8080 f00d00000001
```

Isian pertama adalah alamat backend, isian kedua `device_id` perangkat yang ingin diikuti. Terminal ini *login* sendiri; saat server memutusnya karena gelangnya kedaluwarsa (setiap 15 menit), ia memperbarui gelangnya (*refresh*) lalu menyambung lagi. Kalau *login* ditolak (misalnya sandinya sudah diganti), ia berhenti dengan pesan `login ditolak (401). Periksa EMAIL_TERMINAL dan SANDI_TERMINAL di alat/.env.` Penjelasannya ada di Modul 19 Praktik 1 dan Modul 20 Praktik 7.

### Berkas firmware tiruan untuk jalur tanpa Kit (Modul 28)

Tanpa ESP32 dan Arduino IDE, kamu tetap bisa mencoba seluruh jalan pembaruan firmware (unggah di layar **Armada**, sidik jari SHA-256, unduhan berkunci, masa uji, dan rollback) dengan perangkat tiruan dari simulator. Yang dibutuhkan hanya berkas `.bin` untuk diunggah, dan `buat-bin-tiruan.js` membuatnya dengan Node.js saja, tanpa library dari npm.

> [!WARNING]
> **Bukan firmware asli.** Isinya hanya satu baris teks penanda dan bait acak; ESP32 tidak bisa menjalankannya. Jangan di-*flash* ke papan (Arduino IDE, `esptool`, atau tombol **Upload**) dan jangan dikirim ke papan sungguhan lewat **Perbarui**: berkas ini khusus perangkat tiruan simulator.

Dari folder `alat`, buat dua berkas: rilis biasa 1.7.1, dan rilis uji 1.7.2 untuk latihan rollback. `../../firmware-tiruan` adalah folder `firmware-tiruan` di samping folder repositorimu (di luar Git), dan dibuat sendiri kalau belum ada:

```bash
node buat-bin-tiruan.js 1.7.1 ../../firmware-tiruan
node buat-bin-tiruan.js 1.7.2 ../../firmware-tiruan --uji
```

Keluaran perintah pertama di lab penulis. Baris pertama menulis jalur lengkap di komputermu (di contoh ini folder proyeknya `/home/rumah/rumah-pintar-mini`; di Windows misalnya `C:\Users\…\firmware-tiruan\…`):

```text
Berkas TIRUAN dibuat: /home/rumah/firmware-tiruan/node-1-1.7.1-TIRUAN.bin
  versi        1.7.1 (rilis biasa)
  ukuran       1196032 byte (61 % satu rak program 1966080 byte)
  bait pertama 0xE9, lalu teks "BUKAN FIRMWARE ASLI ..."
  SHA-256      e60066a43e379d2caba71b0173947065aeabe8cb977d24b8fa0e58dc883a2a0c
Unggah di layar Armada (Unggah firmware Node 1) dengan versi 1.7.1. SHA-256 yang ditampilkan server harus sama dengan di atas.
BUKAN firmware asli: jangan di-flash ke papan dan jangan dikirim ke papan sungguhan. Khusus perangkat tiruan (simulator).
```

Isinya selalu sama untuk versi, ukuran, dan pilihan yang sama, jadi SHA-256 di atas juga yang muncul di komputermu. Firmware asli tidak begitu: jam kompilasi ikut tertanam di dalamnya, sehingga sidik jarinya berubah setiap kali dikompilasi. Berkas kedua (`node-1-1.7.2-UJI-TIRUAN.bin`, SHA-256 `55d3e757e038a69f990e5ca1d8158ec8433ba4b82f7d110ee7f19c2a60f5154f`) membawa penanda `UJI_KUNCI_SALAH` di 512 bait pertamanya.

| Isian | Gunanya |
| :--- | :--- |
| isian pertama (wajib) | versi x.y.z tanpa nol di depan, misalnya `1.7.1`. Aturannya sama dengan server: `1.07.1` atau `v1.7.1` ditolak |
| isian kedua | folder tujuan; bawaannya folder tempat perintah dijalankan |
| `--uji` | penanda `UJI_KUNCI_SALAH`: perangkat tiruan yang memasangnya meniru firmware 1.7.2-uji (kunci broker salah, masa uji 60 detik lewat, lalu kembali sendiri ke versi lama). Unggah dengan centang **Rilis uji** |
| `--ukuran=1300000` | ukuran lain dalam byte (1.024 sampai 4.194.304). Di atas 1.966.080 (satu rak program) berkasnya tetap dibuat, untuk melihat penolakannya: layar **Armada** menulis `Terlalu besar: …` sebelum mengunggah; lewat Bruno/`curl` server menjawab `400` (terlalu besar), atau `413` di atas 2.097.152 byte (batas unggah) |

Sesudah itu: (1) di layar **Armada**, buka **Unggah firmware Node 1**, pilih berkasnya, isi versinya (untuk berkas `UJI`, centang juga **Rilis uji**), lalu klik **Unggah firmware**. SHA-256 yang ditampilkan di bawah formulir (dihitung server dari berkas yang diterimanya) harus sama dengan keluaran alat. (2) Jalankan simulator dengan `ALAMAT_SERVER` di `alat/.env` (bagian Modul 28 di atas), lalu klik **Perbarui** di kartu perangkat tiruan, persis seperti untuk Node 1. Di lab penulis (backend 1.5.0 di balik Caddy, perangkat tiruan `f00d00000001`; angka simulator, bukan ESP32 lewat WiFi), unggahan 1.7.1 dijawab `201` dengan `"sha256":"e60066a43e379d2caba71b0173947065aeabe8cb977d24b8fa0e58dc883a2a0c"`, sama dengan keluaran alat; 1.7.2 dengan centang uji dijawab `201` dengan `"uji":true`; pembaruan ke 1.7.1 `berhasil` dalam 5 detik, dan ke 1.7.2 kembali ke versi lama (`rollback`, `tidak tersambung ke broker dalam 60 detik`) dalam 71 detik.

Yang dijaga alat ini:

- **Tidak pernah menimpa** berkas yang sudah ada (`… sudah ada: tidak ditimpa.`). Server juga tidak pernah menimpa versi yang sudah diunggah, jadi biasanya yang kamu perlukan adalah versi baru.
- **Berkas `.bin` tidak ikut Git.** Sejak Modul 28, `.gitignore` di akar proyek mengabaikan `*.bin`. Kalau folder tujuan ada di dalam repositori Git yang `.gitignore`-nya belum memuat baris `*.bin`, alat menolak dan menyarankan folder di luar repositori. Di dalam repositori yang sudah aman, berkasnya tetap dibuat, dengan catatan "lebih rapi di luar repositori".
- Sidik jari berkas bisa kamu cek sendiri: `sha256sum <berkas>` (Linux), `shasum -a 256 <berkas>` (macOS), atau `Get-FileHash <berkas>` (PowerShell di Windows; hurufnya kapital).

Ujinya memakai penguji bawaan Node.js (juga tanpa library npm). Dari folder `alat`:

```bash
node --test buat-bin-tiruan.test.js
```

Hasil di lab penulis: `ℹ tests 7`, `ℹ pass 7`, `ℹ fail 0`.

## Catatan

- `package.json` di folder ini berisi `"type": "module"` supaya `import`/`export` bisa dipakai. File ini dibuat dengan `npm init -y` lalu `npm pkg set type=module`, sama seperti di Modul 4. Sejak Modul 11, ia juga mencatat library `mqtt` di bagian `dependencies`, dan `package-lock.json` mencatat versi persis setiap library pembantunya.
- `.gitignore` menyuruh Git mengabaikan `node_modules/` dan `data/`: data palsu tidak perlu disimpan di repositori proyek. Sejak Modul 20, Git juga mengabaikan `.env` (akun `terminal-live.js`, berisi sandi; sejak Modul 21 juga akun broker pemeriksa dan kunci perangkat latihan); contohnya ada di `.env.example`.
- **Penerima ini sengaja polos:** siapa pun yang bisa menghubungi laptopmu boleh mengirim apa saja, tanpa kata sandi. Pakai hanya di jaringan rumah. Cara menguncinya dibahas di Modul 20, 21, dan 27.
- **`penyadap.js` di depan pintu TLS 8883 (Modul 27):** `node penyadap.js <alamat broker> 8883 1884`. Klien yang mencoba **tanpa TLS** ke 8883 tetap mengirim nama pengguna dan kuncinya polos (penyadap mencetaknya) sebelum broker menolaknya: uji "tanpa TLS ditolak" hanya dengan akun uji seperti `pemeriksa`, jangan dengan kunci perangkat. Bagian TLS tidak perlu kamu ulang: klien TLS yang mengetuk penyadap di `127.0.0.1` menolak tersambung, karena sertifikat broker hanya berlaku untuk nama `mqtt.…` (pemeriksaan nama itulah yang melindungimu dari penyadap). Di lab penulis (penyadap dan kliennya di mesin yang sama), pemeriksaan nama sengaja dimatikan khusus untuk uji ini, dan hasilnya: klien TLS hanya tercatat `sambungan baru dari … -> …:8883`, tanpa nama pengguna dan kunci (isinya terenkripsi).

---

[⬅️ Kembali ke proyek](../README.md) · [Modul 4](../../../../fase-0-fondasi/modul-04-javascript-nodejs/README.md) · [Silabus](../../../../SILABUS.md)
