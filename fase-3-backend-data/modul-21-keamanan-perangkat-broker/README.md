# Modul 21 — Keamanan Perangkat: API Key, Provisioning Sederhana, & Hak Akses Broker (ACL)

🌐 **Bahasa Indonesia** · [English](../../en/phase-3-backend-data/module-21-device-broker-security/README.md)

*Fase 3 · Minggu 21 · Perangkat keras (*hardware*): **Kit A + B** (Node 1, gateway Pi, dan papan Node 2 yang dipinjam sebentar sebagai "penyusup") **atau laptop saja** (simulator perangkat dan MQTTX) · Prasyarat: **Modul 20** (backend v0.5 dengan akun dan *login*) · Waktu: 9–11 jam, dicicil dalam satu minggu*

[⬅️ Modul 20](../modul-20-keamanan-pengguna/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 22 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-22--html-css--react-typescript-dari-nol-untuk-dashboard-iot)

---

Minggu lalu kamu mengunci pintu depan rumah. Backend kini bertanya **"Kamu siapa?"** kepada setiap orang yang mengetuk API: tanpa *login* jawabannya 401, akun `viewer` yang mencoba menyalakan relay dijawab 403, dan penebak sandi tertahan setelah 10 percobaan. Namun, rumahmu masih punya **pintu samping yang tidak pernah dikunci sejak Modul 11: broker MQTT**.

Coba bayangkan tamu yang tersambung ke WiFi rumahmu. Ia membuka MQTTX di laptopnya, masuk ke broker tanpa nama dan tanpa sandi, lalu menerbitkan satu pesan ke topik `rpm/a4cf12e5b7c0/cmd`:

```json
{"id":"c-iseng-1","ts":"2026-10-23T01:00:00Z","aksi":"set","target":"pompa","nilai":true}
```

Node 1 patuh: pompanya menyala. Akun `admin`, satpam, dan semua kunci Modul 20 dilewati begitu saja karena perintah itu **tidak pernah melewati backend**. Tamu yang sama juga bisa menerbitkan `telemetry` palsu atas nama Node 1, misalnya suhu 45 °C. Backend menyimpannya di database, menampilkannya di terminal kecil, dan memakainya untuk aturan otomatis, persis seperti bacaan sungguhan. Broker tidak menanyakan siapa pengirimnya, dan tidak memeriksa apakah pengirim itu boleh menulis ke topik tersebut.

Minggu ini kamu memasang kunci untuk perangkat:

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Siapa pun di WiFi rumah bisa masuk ke broker, lalu menyalakan pompa lewat `cmd` tanpa melewati backend. | Broker menerima tamu tanpa nama (`allow_anonymous true` sejak Modul 11–12). | **Akun broker untuk setiap perangkat dan program.** Tanpa nama dan sandi yang terdaftar, broker menolak dengan `Connection refused: Not authorized` (Konsep 6, Praktik 4) |
| Kalau semua perangkat memakai satu sandi bersama, satu papan yang hilang membuka semuanya. | Belum ada identitas per perangkat. | **Kunci sendiri untuk setiap perangkat**: 43 huruf acak yang dibuat backend dan hanya disimpan sebagai sidik jari (Konsep 2, Praktik 1) |
| Backend mencatat data dari perangkat apa pun yang mengaku-ngaku, termasuk papan uji dan simulator yang terlupa. | Sejak Modul 17, backend membuat baris `devices` baru untuk setiap `device_id` yang belum dikenalnya. | **Daftar resmi** di backend: hanya perangkat yang didaftarkan admin yang didengarkan; pesan perangkat lain diabaikan dan dicatat di log (Konsep 3–4, Praktik 1–2) |
| Kunci perangkat harus tinggal di perangkat, tetapi tidak boleh masuk kode atau GitHub. | Kode firmware Node 1 ada di repositori publik. | **Kunci disimpan di NVS lewat Serial Monitor** (`kunci <isi>`), bukan di kode (Konsep 5, Praktik 3) |
| Perangkat dengan akun yang sah tetap bisa mengirim data atas nama perangkat lain, bahkan menendangnya dari broker. | Broker belum punya aturan topik, dan nama klien (*client ID*) bisa dipalsukan. | **Daftar izin (ACL) dengan pola `%u`** dan `use_username_as_clientid`: setiap perangkat hanya boleh menulis ke `rpm/<device_id>/…` miliknya dan membaca `cmd`-nya sendiri (Konsep 7–8, Praktik 5–6) |
| Perangkat yang hilang atau dicuri tetap bisa masuk. | Belum ada cara mencabut kunci satu perangkat. | **Cabut kunci** di backend (berlaku seketika) dan di broker (`mosquitto_passwd -D`), lalu pulihkan dengan kunci baru (Konsep 9, Praktik 7) |
| Nama pengguna dan kunci terkirim tanpa enkripsi di jaringan rumah. | MQTT di pintu 1883 belum memakai TLS. | **Belum diobati minggu ini, dan modul ini jujur soal itu.** Kamu melihat sendiri kuncinya terkirim polos, lalu belajar mengapa itu masih bisa diterima di jaringan rumah tetapi wajib dibereskan sebelum broker dibuka ke internet di Modul 27 (Konsep 10, Praktik 8) |

Di akhir minggu, **MQTTX tanpa sandi ditolak broker**, **perangkat yang "menyamar" ke topik perangkat lain ditolak daftar izin**, dan **perangkat yang kuncinya dicabut tidak bisa mengirim data lagi**. Itulah tiga syarat lulus modul ini. Backend naik ke **v1.0: berkunci untuk manusia dan perangkat**, dan Fase 3 selesai: 🎉 **Checkpoint Fase 3**.

![Peta jalan Modul 21. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 3 Backend dan data, Modul 16 sampai 21, disorot dengan bingkai hijau. Modul 1 sampai 20 bertanda selesai, Modul 21 berwarna merah dan ditandai KAMU DI SINI dengan catatan: rumah dikunci untuk perangkat, yaitu kunci per perangkat, akun broker, dan daftar izin. Tepat di sebelah kanan Modul 21 ada label hijau Checkpoint Fase 3 dengan tanda perayaan. Di bawahnya, kotak Modul 21 minggu ini, 9 sampai 11 jam dicicil; Kit A + B atau laptop saja, lanjutan langsung Modul 20 dengan backend v0.5 yang sudah punya akun dan login. Daftar kegiatan: pemanasan ulang JavaScript, yaitu kunci acak, sidik jari dan pembanding yang adil, pola topik %u, buku tamu Map, dan sandi di paket hanyalah byte; Kemenangan Cepat, broker latihan yang menolak tamu tanpa sandi; Praktik 1, daftar resmi dan kunci perangkat; Praktik 2, lapis kedua dan akun broker untuk backend; Praktik 3, Node 1 dan alat memasang kuncinya; Praktik 4, mengunci pintu broker, dengan syarat lulus MQTTX tanpa sandi ditolak broker; Praktik 5, daftar izin, setiap perangkat di topiknya sendiri; Praktik 6, penyusup ditolak dan tercatat, dengan syarat lulus perangkat yang menyamar ke topik lain ditolak; Praktik 7, mencabut kunci perangkat yang hilang, dengan syarat lulus perangkat yang kuncinya dicabut tidak bisa mengirim data lagi; Praktik 8, jujur soal enkripsi, dan uji kelulusan; dan Tambahan, backend v1.0, kontrak data 1.4, dan pull request keamanan perangkat. Praktik 4, 6, 7, 8, dan Tambahan bertanda bintang, wajib untuk lulus. Catatan bawah: urutannya penting, pasang kunci dulu (Praktik 1–3), baru ganti gembok, yaitu broker dikunci di Praktik 4; tiga jalur, yaitu perangkat (gateway Pi, Node 1, dan papan Node 2 yang dipinjam sebagai penyusup), laptop (Mosquitto di laptop, simulator, dan MQTTX sebagai penyusup), atau Wokwi (hanya firmware v1.6.0).](aset/peta-jalan-modul-21.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Tiga jalur, seperti Modul 19.** **Jalur perangkat** memakai broker Mosquitto di gateway Pi, Node 1 dengan firmware baru v1.6.0, dan papan Node 2 yang dipinjam sebentar sebagai "penyusup" di Praktik 6, seperti papan yang dipinjam di Modul 15. **Jalur laptop** memakai layanan Mosquitto di laptop dari Modul 12, simulator perangkat, dan MQTTX sebagai penyusup. **Jalur Wokwi** hanya dipakai untuk mencoba firmware v1.6.0 di Praktik 3, dengan broker publik `test.mosquitto.org` yang memeriksa sandi.
> - **Urutannya penting: pasang kunci dulu, baru ganti gembok.** Praktik 1–3 memberi kunci kepada backend, perangkat, dan alat selagi broker masih terbuka. Broker yang belum dikunci tidak memeriksa nama dan sandi, jadi tidak ada yang terputus. Praktik 4 baru mengunci broker. Kalau urutannya dibalik, Node 1, backend, dan dashboard Node-RED langsung tertolak.
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **terminal VS Code** (di folder `backend`, `alat`, atau `edge`), **terminal SSH ke Pi** (jalur perangkat), **Bruno**, **MQTTX**, dan **Serial Monitor** Arduino IDE.
> - **Lanjutan langsung Modul 20.** Kontainer `rumahpintar-db`, database `rumahpintar` (migrasi sampai 008, akun `admin@rumah.test` dan `viewer@rumah.test`), backend v0.5 di cabang `main`, koleksi Bruno beserta `bruno/.env`, dan `alat/.env` dipakai lagi apa adanya.
> - **Kotak Hasilnya.** Keluaran backend, Bruno CLI, simulator, alat, dan firmware (Wokwi) direkam penulis di laptop Windows dengan Node.js 24. **Mosquitto tidak terpasang di laptop penulis minggu ini**, jadi keluaran Mosquitto (catatan broker dan isi berkas sandi) ditulis dari kode sumber resminya, versi 2.0.21 (Pi) dan 2.1.2 (laptop), dan ditandai **contoh**. Teks di jendela MQTTX dan Bruno desktop juga ditulis dari kode sumber kedua aplikasi itu. Rinciannya ada di 📚 Sumber. Jam, kunci, dan `device_id` di layarmu pasti berbeda.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan di VS Code, browser, Bruno, dan MQTTX. **Kecuali di terminal:** menghentikan program yang sedang berjalan tetap **Ctrl + C**. Perintah terminal sama di Windows dan macOS, kecuali disebut lain.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Kunci perangkat hanya lewat tempat yang aman**: disalin sekali dari jawaban API ke **pengelola sandimu**, ditempel ke prompt `mosquitto_passwd` di mesin broker, lalu diketik ke perangkatnya (Serial Monitor) atau ke `alat/.env` (simulator). Jangan pernah menaruhnya di kode, Git, file `.yml` Bruno, catatan belajar, *chat*, atau tangkapan layar.
> 2. **Berkas sandi broker (`sandi-broker`) tidak ikut Git.** Isinya memang hanya sidik jari, bukan sandi, tetapi sidik jari pun tidak perlu dipamerkan.
> 3. **Selalu sisakan satu jalan pulang.** Jangan menutup terminal SSH ke Pi selagi mengubah pengaturan broker. Kalau broker gagal menyala, perbaiki lewat terminal yang masih terbuka.
> 4. **Setiap kali daftar izin (ACL) diubah, broker di-*restart* (dimulai ulang), bukan di-*reload* (dimuat ulang).** Di Pi, ACL yang salah ketik lalu di-*reload* bisa membuat broker berjalan **tanpa ACL sama sekali** (Konsep 9).
> 5. **Lalu lintas belum dienkripsi.** Jangan membuat *port forwarding* ke broker, dan jangan menyambungkan perangkat ke broker rumahmu lewat WiFi umum. Itu baru aman setelah TLS di Modul 27.

Ritme modul ini sama dengan Modul 1–20. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang JavaScript (30–45 menit)](#-pemanasan-ulang-javascript-3045-menit)
4. [🏆 Kemenangan Cepat: broker latihan yang menolak tamu tanpa sandi (20 menit)](#-kemenangan-cepat-broker-latihan-yang-menolak-tamu-tanpa-sandi-20-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Model ancaman perangkat](#1-model-ancaman-perangkat-siapa-yang-bisa-menyamar-sebagai-node-1) · [2 Kunci sendiri](#2-kunci-sendiri-untuk-setiap-perangkat) · [3 Daftar resmi](#3-daftar-resmi-dan-provisioning-sederhana) · [4 Lapis kedua](#4-lapis-kedua-backend-hanya-mendengarkan-perangkat-terdaftar) · [5 Kunci di perangkat](#5-kunci-di-dalam-perangkat-nvs-serial-monitor-dan-batasnya) · [6 Penjaga pintu broker](#6-penjaga-pintu-broker-berkas-sandi-dan-satu-akun-untuk-setiap-program) · [7 Daftar izin](#7-daftar-izin-acl-setiap-perangkat-di-topiknya-sendiri) · [8 Nama klien palsu](#8-nama-klien-bisa-dipalsukan-use_username_as_clientid) · [9 Mencabut kunci](#9-mencabut-kunci-perangkat-yang-hilang) · [10 Lalu lintas polos](#10-jujur-lalu-lintas-di-rumah-masih-polos)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Daftar resmi](#praktik-1--daftar-resmi-dan-kunci-perangkat-60-menit) · [2 Lapis kedua](#praktik-2--lapis-kedua-dan-akun-broker-untuk-backend-45-menit) · [3 Kunci di perangkat](#praktik-3--node-1-dan-alat-memasang-kuncinya-60-menit) · [4 Mengunci broker](#praktik-4--mengunci-pintu-broker-60-menit) · [5 Daftar izin](#praktik-5--daftar-izin-setiap-perangkat-di-topiknya-sendiri-45-menit) · [6 Penyusup](#praktik-6--penyusup-ditolak-dan-tercatat-40-menit) · [7 Cabut kunci](#praktik-7--mencabut-kunci-perangkat-yang-hilang-40-menit) · [8 Uji kelulusan](#praktik-8--jujur-soal-enkripsi-dan-uji-kelulusan-40-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-21)

## 🎯 Setelah modul ini kamu bisa…

1. **Menyusun model ancaman untuk perangkat dan broker**: siapa yang bisa menyamar sebagai Node 1, lewat pintu mana, dan apa akibatnya.
2. **Memberi setiap perangkat kuncinya sendiri** (*API key*): 43 huruf acak yang dibuat backend dan hanya disimpan sebagai sidik jari SHA-256, lalu menjelaskan mengapa kunci acak cukup memakai SHA-256 sedangkan sandi buatan manusia butuh bcrypt.
3. **Mendaftarkan perangkat lewat API** (`POST /devices`) sebagai *provisioning* sederhana, dan membuat backend **mengabaikan** perangkat yang belum terdaftar atau kuncinya sudah dicabut.
4. **Menyimpan kunci di NVS Node 1 lewat Serial Monitor**, bukan di kode, dan membuat firmware menunggu dengan sabar saat ditolak broker.
5. **Mengunci Mosquitto** dengan berkas sandi (`mosquitto_passwd`) dan satu akun untuk setiap program, sehingga **MQTTX tanpa sandi ditolak**.
6. **Menulis daftar izin (ACL) dengan pola `%u`** sehingga setiap perangkat hanya bisa menulis ke topiknya sendiri, lalu menjelaskan mengapa pola `%c` saja bisa ditipu.
7. **Membuktikan penyusup ditolak dan tercatat** di log broker, lalu **mencabut kunci perangkat yang hilang** dan memulihkannya dengan kunci baru.
8. **Menyebut dengan jujur apa yang belum aman**: lalu lintas MQTT masih polos (kamu melihatnya sendiri), kunci di NVS terbaca oleh siapa pun yang memegang papannya, dan butir-butir daftar periksa OWASP IoT Top 10 yang baru dibereskan nanti.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 20** | Docker Desktop dengan kontainer **`rumahpintar-db`** yang menyala, database `rumahpintar` (migrasi sampai 008), **backend v0.5** yang sudah di-*merge* ke `main` di Modul 20 ➕ D, akun `admin@rumah.test` dan `viewer@rumah.test` beserta `bruno/.env`, serta folder `alat` dengan `alat/.env`. |
| **Node.js 24, VS Code, Git, Bruno, MQTTX** | Sama seperti Modul 16–20. MQTTX dipakai sejak Modul 11. |
| **Mosquitto** | **Jalur perangkat:** Mosquitto 2.0.21 di gateway Pi (Modul 12), dibuka lewat terminal SSH. **Jalur laptop:** layanan Mosquitto 2.1.2 di laptop (Modul 12 Praktik 7), diatur lewat terminal Administrator (Windows) atau Terminal (macOS). Alat pembuat akun **`mosquitto_passwd`** sudah ikut terpasang bersama Mosquitto. |
| **Perangkat** | **Jalur perangkat:** Node 1 dengan kabel USB dan Arduino IDE (firmware v1.6.0 di Praktik 3), dan papan ESP32 Node 2 yang dipinjam sebentar di Praktik 6, lalu dikembalikan ke firmware Node 2. **Jalur laptop:** simulator perangkat dari folder `alat`. **Jalur Wokwi:** cukup browser, tanpa akun. |
| **Node-RED di Pi** (jalur perangkat) | Dashboard Modul 13 masih membaca broker. Ia mendapat akunnya sendiri di Praktik 4. |
| **Koneksi internet** | Tidak ada paket npm baru minggu ini. Internet hanya dibutuhkan untuk jalur Wokwi dan broker publik `test.mosquitto.org`. |
| **Akun GitHub** | Sudah ada sejak Modul 16. ➕ menggabungkan semua pekerjaan lewat *pull request* "keamanan perangkat". |

## 🔁 Pemanasan ulang JavaScript (30–45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, **Node.js 24**, dan folder repositori `belajar-iot`.

Seperti Modul 16–20, modul Fase 3 dibuka dengan pemanasan JavaScript. Kunci perangkat minggu ini dibangun dari lima kemampuan kecil yang sudah tersedia di Node.js, tanpa memasang apa pun: **kunci acak** dengan `randomBytes`, **sidik jari dan pembanding yang adil** dengan `createHash` dan `timingSafeEqual`, **mencocokkan topik dengan pola**, **buku tamu** dengan `Map`, dan **membaca *byte*** dengan `Buffer`. Kelimanya muncul lagi di backend, di broker, dan di firmware.

**Siapkan foldernya.** Buka folder repositori **`belajar-iot`** di VS Code, klik dulu ruang kosong di panel Explorer, buat folder baru **`modul-21`**, lalu jalankan di terminal:

```text
cd modul-21
npm init -y
npm pkg set type=module
```

`npm pkg set type=module` diperlukan karena file ini memakai `import` (sama seperti pemanasan Modul 16–20). Lalu buat file **`pemanasan.js`** di folder `modul-21`.

### Langkah 1 — Kunci perangkat: `randomBytes`

Kunci perangkat harus **acak dan tidak bisa ditebak**, persis seperti kartu terusan di Modul 20. Resepnya pun sama: 32 *byte* acak, ditulis sebagai teks *base64url*.

```js
// pemanasan.js - pemanasan ulang JavaScript sebelum Modul 21
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// 1. Kunci perangkat: 32 byte acak, ditulis sebagai 43 huruf base64url
const buatKunci = () => randomBytes(32).toString("base64url");
const kunciNode1 = buatKunci();
console.log(kunciNode1, kunciNode1.length);
const bentukKunci = /^[A-Za-z0-9_-]{43}$/;
console.log(bentukKunci.test(kunciNode1));
console.log(bentukKunci.test(kunciNode1 + " "));
console.log(bentukKunci.test(kunciNode1.slice(0, 42)));
```

Simpan (**Ctrl + S**), lalu jalankan di terminal:

```text
node pemanasan.js
```

**Hasilnya** (**contoh**: kunci di baris pertamamu pasti berbeda, dan berbeda lagi setiap kali dijalankan):

```text
5woD7coal_Dpmz8lLzZzOwYaxTCg5dQ9_alfT9kRnuw 43
true
false
false
```

- **`randomBytes(32)`** mengambil 32 *byte* dari sumber acak sistem operasi, yang memang dibuat untuk rahasia. **`.toString("base64url")`** menuliskannya dengan 64 macam huruf yang aman ditempel di mana saja: A–Z, a–z, 0–9, `-`, dan `_`. Hasilnya selalu **43 huruf**.
- **`bentukKunci`** adalah **pola teks** (*regular expression*): `^` berarti "dari awal", `[A-Za-z0-9_-]{43}` berarti "tepat 43 huruf dari himpunan itu", dan `$` berarti "sampai akhir". Backend minggu ini memeriksa kunci dengan pola yang sama.
- Baris ketiga dan keempat memperlihatkan dua salah tempel yang paling sering terjadi: **spasi ikut tersalin di ujung**, dan **satu huruf tertinggal**. Pola menolak keduanya. Di perangkat, kunci yang salah tempel seperti itu membuat broker menolak sambungan.

### Langkah 2 — Sidik jari dan pembanding yang adil: `createHash` dan `timingSafeEqual`

Backend tidak menyimpan kunci, hanya sidik jari SHA-256-nya (Konsep 2). Untuk memeriksa sebuah kunci, hitung sidik jarinya, lalu bandingkan dengan yang tersimpan. Tambahkan di paling bawah:

```js
// 2. Sidik jari dan pembanding yang adil
const sidikJari = (teks) => createHash("sha256").update(teks).digest("hex");
const tersimpan = sidikJari(kunciNode1); // yang disimpan backend di kolom kunci_hash
function cocokkanKunci(kunci, sidikJariTersimpan) {
  const a = Buffer.from(sidikJari(kunci), "hex");
  const b = Buffer.from(sidikJariTersimpan, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
console.log(tersimpan.length);
console.log(cocokkanKunci(kunciNode1, tersimpan));
const bedaSatuHuruf = (kunciNode1[0] === "A" ? "B" : "A") + kunciNode1.slice(1);
console.log(cocokkanKunci(bedaSatuHuruf, tersimpan));
console.log(cocokkanKunci(buatKunci(), tersimpan));
```

**Hasilnya** (baris baru):

```text
64
true
false
false
```

- **`createHash("sha256")`** kamu kenal dari Modul 20: hasilnya 64 huruf heksadesimal, panjangnya selalu sama. Kolom `kunci_hash` di database minggu ini berisi teks seperti itu.
- **`timingSafeEqual(a, b)`** membandingkan dua deret *byte* yang **panjangnya sama** dan selalu memeriksa **semua** *byte*-nya. Pembanding biasa (`===`) boleh berhenti di huruf pertama yang berbeda, jadi dua teks yang awalnya mirip butuh waktu sedikit lebih lama untuk dinyatakan berbeda. Penebak yang sangat sabar bisa mengukur selisih waktu sekecil itu untuk menebak isi sedikit demi sedikit. `timingSafeEqual` menutup celah itu. Panjang keduanya diperiksa dulu (`a.length === b.length`) karena `timingSafeEqual` melempar galat kalau panjangnya berbeda.
- `bedaSatuHuruf` adalah kunci yang sama, kecuali huruf pertamanya. Satu huruf saja sudah cukup membuatnya ditolak. Kunci baru dari `buatKunci()` tentu ditolak juga.

Backend minggu ini belum perlu memeriksa kunci sendiri karena brokerlah yang memeriksanya. Fungsi `cocokkanKunci` dipakai lagi di 🧩 Tingkat 2, dan kelak di Modul 28 saat perangkat mengunduh firmware dari backend.

### Langkah 3 — Mencocokkan topik dengan pola

Daftar izin broker (Konsep 7) berisi baris seperti `pattern write rpm/%u/telemetry`. Supaya baris itu tidak terasa seperti sihir, buat versi mininya sendiri. Tambahkan:

```js
// 3. Mencocokkan topik dengan pola daftar izin
function cocokPola(pola, topik, pengguna) {
  if (pengguna.includes("+") || pengguna.includes("#") || pengguna.includes("/")) return false;
  const p = pola.split("/").map((tingkat) => (tingkat === "%u" ? pengguna : tingkat));
  const t = topik.split("/");
  for (let i = 0; i < p.length; i++) {
    if (p[i] === "#") return true;
    if (i >= t.length) return false;
    if (p[i] !== "+" && p[i] !== t[i]) return false;
  }
  return p.length === t.length;
}
console.log(cocokPola("rpm/%u/telemetry", "rpm/a4cf12e5b7c0/telemetry", "a4cf12e5b7c0"));
console.log(cocokPola("rpm/%u/telemetry", "rpm/a4cf12e5b7c0/telemetry", "c0ba00000001"));
console.log(cocokPola("rpm/+/cmd", "rpm/a4cf12e5b7c0/cmd", "backend"));
console.log(cocokPola("rpm/#", "rpm/a4cf12e5b7c0/status", "pemantau"));
console.log(cocokPola("rpm/%u/telemetry", "rpm/a4cf12e5b7c0/telemetry", "+"));
```

**Hasilnya** (baris baru):

```text
true
false
true
true
false
```

- **`split("/")`** memecah pola dan topik menjadi tingkat-tingkat (Modul 11 Konsep 4). Tingkat `%u` diganti nama pengguna, lalu kedua daftar dibandingkan satu per satu: `+` cocok dengan tepat satu tingkat apa saja, dan `#` cocok dengan semua tingkat sisanya.
- Baris pertama dan kedua adalah inti modul ini. Pola yang sama mengizinkan Node 1 menulis ke topiknya sendiri, tetapi menolak `c0ba00000001` yang mencoba menulis ke topik Node 1.
- Baris ketiga dan keempat adalah aturan untuk akun `backend` (boleh menulis ke `cmd` perangkat mana pun) dan `pemantau` (boleh membaca semua `rpm/…`).
- Baris terakhir menjawab pertanyaan iseng: bagaimana kalau seseorang memakai **`+`** sebagai nama penggunanya, supaya `rpm/%u/telemetry` menjadi `rpm/+/telemetry` dan cocok dengan topik siapa saja? Baris pertama fungsi menolaknya. Mosquitto melakukan hal yang sama: nama pengguna yang berisi `+` atau `#` tidak pernah lolos lewat pola.

### Langkah 4 — Buku tamu dengan `Map`: daftar resmi dan lapis kedua

Backend menyimpan daftar resmi di memori supaya tidak perlu bertanya ke database untuk setiap pesan (Konsep 4). Struktur yang pas untuk itu adalah **`Map`**, buku catatan per perangkat yang kamu pakai sejak Modul 19. Tambahkan:

```js
// 4. Buku tamu dengan Map: daftar resmi dan lapis kedua
const daftarResmi = new Map([
  ["a4cf12e5b7c0", { nama: "Node 1 ruang tamu", dicabut: null }],
  ["246f28b1c7d4", { nama: "Node 2 kebun", dicabut: null }],
  ["c0ba00000001", { nama: "papan uji", dicabut: "2026-10-23T02:10:00Z" }],
]);
function izin(deviceId) {
  const perangkat = daftarResmi.get(deviceId);
  if (perangkat === undefined) return "belum-terdaftar";
  if (perangkat.dicabut !== null) return "dicabut";
  return "terdaftar";
}
for (const id of ["a4cf12e5b7c0", "c0ba00000001", "f00d00000009"]) {
  const keputusan = izin(id);
  console.log(id, keputusan, keputusan === "terdaftar" ? "-> diproses" : "-> DIABAIKAN");
}
```

**Hasilnya** (baris baru):

```text
a4cf12e5b7c0 terdaftar -> diproses
c0ba00000001 dicabut -> DIABAIKAN
f00d00000009 belum-terdaftar -> DIABAIKAN
```

- **`new Map([...])`** membuat buku catatan dari daftar pasangan `[kunci, isi]`. **`.get(id)`** mengambil isinya, atau `undefined` kalau `id` itu tidak ada di buku.
- **`izin()`** adalah **fungsi murni** (Modul 19): ia hanya membaca buku dan mengembalikan satu dari tiga keadaan, tanpa mengubah apa pun. Fungsi seperti ini mudah diuji dengan *unit test*, dan versi sungguhannya ada di `src/services/daftar.ts` backend minggu ini.
- Perhatikan bahwa `c0ba00000001` **ada** di buku, tetapi tetap diabaikan karena kuncinya sudah dicabut. Itulah gunanya kolom `dicabut`: riwayatnya tetap tercatat, tetapi pesannya tidak lagi didengarkan.

### Langkah 5 — Sandi di paket hanyalah *byte*: `Buffer`

Konsep 10 menyebut bahwa paket MQTT membawa kunci sebagai *byte* polos. Di MQTT, setiap teks di dalam paket ditulis dengan cara yang sama: **dua *byte* panjang**, lalu **isi teksnya**. Buat paket mini berisi nama pengguna dan kunci, lalu baca lagi. Tambahkan:

```js
// 5. Sandi di paket hanyalah byte
function teksMqtt(teks) {
  const isi = Buffer.from(teks, "utf8");
  const panjang = Buffer.alloc(2);
  panjang.writeUInt16BE(isi.length);
  return Buffer.concat([panjang, isi]);
}
const paket = Buffer.concat([teksMqtt("a4cf12e5b7c0"), teksMqtt("Qx3-contoh-kunci")]);
console.log(paket.toString("hex"));
console.log(paket.length);
const panjangNama = paket.readUInt16BE(0);
const nama = paket.toString("utf8", 2, 2 + panjangNama);
const panjangSandi = paket.readUInt16BE(2 + panjangNama);
const sandi = paket.toString("utf8", 4 + panjangNama, 4 + panjangNama + panjangSandi);
console.log(nama, sandi);
```

**Hasilnya** (baris baru):

```text
000c61346366313265356237633000105178332d636f6e746f682d6b756e6369
32
a4cf12e5b7c0 Qx3-contoh-kunci
```

- **`Buffer`** adalah deretan *byte* di Node.js. **`writeUInt16BE`** menulis angka panjang ke dalam dua *byte*: `000c` = 12, panjang `a4cf12e5b7c0`, dan `0010` = 16, panjang `Qx3-contoh-kunci`.
- Di baris heksadesimal itu, setiap huruf menjadi dua angka heksadesimal: `61` adalah `a`, `34` adalah `4`, dan seterusnya. Itu bukan sandi, hanya cara lain menulis huruf yang sama.
- Tiga baris terakhir kode membaca paket itu kembali, **tanpa kunci apa pun**. Cukup tahu aturan "dua *byte* panjang, lalu isinya". Siapa pun yang menangkap paket CONNECT di jaringan bisa melakukan hal yang sama, dan itulah yang dibuktikan alat penyadap di Praktik 8.

<details>
<summary>Kunci uji dirimu</summary>

1. **Mengapa kunci perangkat cukup disimpan sebagai sidik jari SHA-256, sedangkan sandi akun di Modul 20 memakai bcrypt?** Sandi akun dipilih manusia, jadi bisa ditebak dari daftar sandi populer, dan bcrypt sengaja membuat setiap tebakan lambat. Kunci perangkat diambil acak dari 2<sup>256</sup> kemungkinan, jadi tidak ada daftar tebakan yang berguna. Lambat atau cepat, menebaknya tetap mustahil.
2. **Apa hasil `cocokPola("rpm/%u/cmd", "rpm/a4cf12e5b7c0/cmd", "a4cf12e5b7c0")`, dan bagaimana kalau penggunanya `c0ba00000001`?** `true` untuk Node 1, karena `%u` menjadi `a4cf12e5b7c0` dan setiap tingkatnya sama. `false` untuk `c0ba00000001`, karena tingkat keduanya berbeda.
3. **Apa yang dicetak `izin("246f28b1c7d4")`?** `terdaftar`. Node 2 ada di buku dan `dicabut`-nya `null`. Bahwa Node 2 tidak punya kunci tidak penting bagi `izin()`, karena datanya diterbitkan Node 1 (Konsep 3).
4. **Kunci yang ditempel dengan spasi di ujungnya ditolak `bentukKunci.test()`. Apa akibatnya kalau spasi itu lolos dan ikut tersimpan di perangkat?** Bagi broker, kunci berspasi adalah kunci yang berbeda, jadi sidik jarinya tidak cocok dan sambungan ditolak dengan kode 5. Itu sebabnya backend memeriksa bentuk kunci, dan firmware menolak menyimpan kunci yang berisi spasi atau huruf asing.

</details>

## 🏆 Kemenangan Cepat: broker latihan yang menolak tamu tanpa sandi (20 menit)

> 🖥️ **Alat yang dipakai:** **Jalur laptop:** terminal VS Code di folder `belajar-iot/modul-21`. **Jalur perangkat:** terminal SSH ke Pi (`ssh budi@192.168.1.37`, Modul 12). Keduanya ditambah **MQTTX** di laptop.

Sebelum mengunci broker sungguhan, rasakan dulu bagaimana broker yang terkunci menjawab. Kamu akan menyalakan **broker latihan kedua** di pintu **1884**, dengan satu akun saja. Broker utama di pintu 1883 tidak disentuh sama sekali, jadi Node 1, backend, dan dashboard tetap berjalan seperti biasa selama kamu berlatih.

### Langkah 1 — Buat akun pertama dengan `mosquitto_passwd` (5 menit)

Buat folder latihan, lalu masuk ke sana.

**Jalur laptop** (terminal VS Code, di folder `modul-21` dari pemanasan):

```text
mkdir latihan-kunci
cd latihan-kunci
```

**Jalur perangkat** (terminal SSH ke Pi):

```bash
mkdir ~/latihan-kunci && cd ~/latihan-kunci
```

Lalu buat berkas sandi baru berisi satu akun bernama `tamu-resmi`:

```text
mosquitto_passwd -c sandi-latihan tamu-resmi
```

`-c` berarti "buat berkas baru". Terminal menanyakan sandi dua kali. Ketik sandi yang mudah kamu ingat selama 20 menit ini, misalnya `latihan-pintu-samping`, lalu tekan **Enter**. Huruf yang kamu ketik **tidak tampil sama sekali**, bahkan tanpa `*`. Itu memang disengaja.

**Hasilnya** (**contoh**, Mosquitto 2.1.2 di laptop):

```text
Adding password for user tamu-resmi
Password:
Reenter password:
```

Di Pi (Mosquitto 2.0.21) baris pertama itu tidak muncul; hanya dua pertanyaan sandinya. Kalau kedua ketikan berbeda, alat itu menjawab `Error: Passwords do not match.` dan tidak membuat apa pun; ulangi saja perintahnya.

Intip isi berkasnya dengan `cat sandi-latihan` (perintah ini juga dikenal PowerShell). **Hasilnya** (**contoh**, sidik jarinya dipotong):

```text
tamu-resmi:$7$1000$2ZbM8T1x…$m4YqVq0E…
```

Yang tersimpan bukan sandimu, melainkan sidik jarinya beserta garamnya (Konsep 6). Di Pi, angka setelah `$7$` adalah `101`, bukan `1000`: Mosquitto 2.0.21 memakai lebih sedikit putaran.

### Langkah 2 — Tulis pengaturan broker latihan (5 menit)

Buat berkas **`latihan.conf`** di folder `latihan-kunci` yang sama. Jalur laptop: klik kanan folder `latihan-kunci` di panel Explorer VS Code → **New File…**. Jalur perangkat: `nano latihan.conf` di terminal SSH. Isinya:

```text
# latihan.conf - broker latihan Kemenangan Cepat Modul 21: pintu 1884, hanya untuk akun yang terdaftar
listener 1884
allow_anonymous false
password_file sandi-latihan
```

Simpan (laptop: **Ctrl + S**; nano: **Ctrl + O**, **Enter**, lalu **Ctrl + X**). Ingat aturan Modul 11: Mosquitto hanya menganggap `#` sebagai catatan kalau letaknya **di awal baris**.

### Langkah 3 — Nyalakan, lalu ketuk tanpa sandi (5 menit)

Jalankan broker latihan dari folder `latihan-kunci`. **Jalur laptop:**

```text
mosquitto -v -c latihan.conf
```

**Jalur perangkat:** di Pi, program brokernya ada di `/usr/sbin`, jadi tulis jalurnya lengkap:

```bash
/usr/sbin/mosquitto -v -c latihan.conf
```

**Hasilnya** (**contoh**, laptop; baris `…` berisi keterangan fitur):

```text
1792721520: mosquitto version 2.1.2 starting
1792721520: Config loaded from latihan.conf.
…
1792721520: Opening ipv4 listen socket on port 1884.
1792721520: Opening ipv6 listen socket on port 1884.
…
1792721520: mosquitto version 2.1.2 running
```

Biarkan terminal itu terbuka. Sekarang buka **MQTTX** dan buat sambungan baru (ikon **+**, **New Connection**):

1. **Name**: `Latihan kunci`.
2. **Host**: `127.0.0.1` (jalur laptop) atau `192.168.1.37` (jalur perangkat, alamat gateway Pi-mu).
3. **Port**: `1884`.
4. **Username** dan **Password**: biarkan **kosong**.
5. Klik **Connect** di kanan atas.

**Hasilnya:** MQTTX menampilkan pemberitahuan merah **`Error: Connection refused: Not authorized`**, dan sambungannya tidak hijau. Di terminal broker muncul (**contoh**, laptop):

```text
1792721560: New connection from 127.0.0.1:53470 on port 1884.
…
1792721560: Client mqttx_5f2b8a1c [127.0.0.1:53470] disconnected: not authorised.
```

Itulah syarat lulus pertama modul ini dalam bentuk kecil: **tamu tanpa sandi ditolak.** `mqttx_5f2b8a1c` adalah nama klien buatan MQTTX; di layarmu angkanya berbeda. Di Pi, baris terakhirnya sedikit lain: `Client mqttx_5f2b8a1c disconnected, not authorised.`

### Langkah 4 — Ketuk dengan nama dan sandi (5 menit)

Edit sambungan `Latihan kunci` di MQTTX: isi **Username** `tamu-resmi` dan **Password** sandi dari langkah 1, simpan, lalu klik **Connect** lagi.

**Hasilnya:** pemberitahuan hijau **`Connected`**. Terminal broker menulis (**contoh**, laptop):

```text
1792721585: New client connected from 127.0.0.1:53481 as mqttx_5f2b8a1c (p5, c1, k60, u'tamu-resmi').
```

`u'tamu-resmi'` adalah nama pengguna yang dibawa MQTTX, dan `p5` berarti MQTT 5, versi bawaan MQTTX. Coba juga satu kali dengan sandi yang **salah**: jawabannya kembali `Error: Connection refused: Not authorized`, persis sama dengan tanpa sandi. Broker sengaja tidak memberi tahu bagian mana yang salah.

Selesai berlatih, bereskan:

1. Di MQTTX, klik **Disconnect**, lalu hapus sambungan `Latihan kunci` (klik kanan namanya di daftar kiri → **Delete**).
2. Hentikan broker latihan dengan **Ctrl + C** di terminalnya.
3. Hapus folder `latihan-kunci` beserta isinya (jalur laptop: klik kanan foldernya di panel Explorer → **Delete**; jalur perangkat: `cd ~ && rm -r ~/latihan-kunci`). Berkas sandi latihan tidak perlu disimpan, apalagi ikut Git.

Cukup tiga baris pengaturan untuk membuat broker menolak tamu tanpa sandi. Praktik 4 memasang tiga baris yang sama ke broker sungguhan, tetapi baru **setelah** semua penghuni rumah, yaitu backend, Node 1, alat, dan Node-RED, memegang kuncinya masing-masing.

> ➡️ **Berikutnya:** baca Konsep 1–3, lalu kerjakan [Praktik 1 — Daftar resmi dan kunci perangkat](#praktik-1--daftar-resmi-dan-kunci-perangkat-60-menit).

## 🧠 Konsep "Mengapa"

Ada sepuluh konsep. Tidak perlu dibaca sekaligus sebelum praktik. Urutannya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–3 → Praktik 1 (daftar resmi dan kunci perangkat)
2. Konsep 4 → Praktik 2 (lapis kedua dan akun broker untuk backend)
3. Konsep 5 → Praktik 3 (Node 1 dan alat memasang kuncinya)
4. Konsep 6 → Praktik 4 (mengunci pintu broker)
5. Konsep 7–8 → Praktik 5 (daftar izin) dan Praktik 6 (penyusup)
6. Konsep 9 → Praktik 7 (mencabut kunci)
7. Konsep 10 → Praktik 8 (jujur soal enkripsi dan uji kelulusan)

Kotak ⬆️/➡️ di akhir setiap praktik dan di akhir setiap kelompok konsep di atas mengantarmu ke langkah berikutnya. Potongan kode dan pengaturan di bagian konsep cukup dibaca: semuanya ditulis dan dijalankan di praktik.

### 1. Model ancaman perangkat: siapa yang bisa menyamar sebagai Node 1

Di Modul 11 kamu membayangkan broker sebagai **kantor pos** di tengah rumah: perangkat menitipkan surat (pesan) dengan alamat (topik), dan siapa pun yang berlangganan alamat itu menerima salinannya. Sampai minggu ini, kantor pos itu sangat ramah. Ia menerima surat dari **siapa saja**, dengan **nama pengirim apa saja**, untuk **alamat mana saja**, tanpa pernah menanyakan kartu identitas.

Model ancaman Modul 20 (Konsep 1) kini perlu satu kolom tambahan: perangkat dan broker.

| Siapa yang mungkin iseng | Lewat pintu mana | Akibatnya | Kuncinya minggu ini |
| :--- | :--- | :--- | :--- |
| Tamu yang tersambung ke WiFi rumahmu, atau adik yang memasang MQTTX di HP-nya | Broker di pintu 1883, tanpa nama dan sandi | Pompa menyala lewat `cmd` tanpa melewati backend; bacaan palsu tercatat di database dan dipakai aturan otomatis | Akun broker dan `allow_anonymous false` (Konsep 6) |
| Papan uji yang punya akun sah, tetapi diprogram untuk mengaku sebagai Node 1 | Topik milik Node 1 dan nama klien Node 1 | Bacaan palsu atas nama Node 1, dan Node 1 yang asli ditendang dari broker | Daftar izin (ACL) dengan pola `%u`, dan `use_username_as_clientid` (Konsep 7–8) |
| Perangkat yang belum pernah didaftarkan, misalnya simulator lama atau papan percobaan yang terlupa | Broker, lalu backend | Data asing ikut tersimpan dan tampil seperti data rumahmu | Daftar resmi di backend dan lapis kedua (Konsep 3–4) |
| Orang yang memegang papan yang hilang atau dicuri | Kunci yang tersimpan di dalam papan itu | Ia bisa masuk ke broker atas nama perangkat itu dari mana saja di jaringanmu | Mencabut kunci perangkat itu saja (Konsep 9) |
| Penyadap yang tersambung ke WiFi yang sama | Lalu lintas MQTT yang belum dienkripsi | Nama pengguna dan kunci terbaca | **Belum dikunci minggu ini**; dibahas jujur di Konsep 10, dibereskan dengan TLS di Modul 27 |

Baris pertama yang paling mendesak. Selama broker menerima tamu tanpa nama, semua kunci Modul 20 hanya menjaga pintu depan, sementara pintu sampingnya terbuka lebar. Minggu ini pintu samping itu dikunci dengan empat prinsip yang sama dengan Modul 20: **terkunci secara bawaan**, **hak sekecil mungkin**, **berlapis**, dan **rahasia tidak pernah tinggal di kode**.

Ada satu hal yang perlu dikatakan dengan jujur. WiFi rumahmu sudah memakai sandi WiFi dan enkripsi WPA2 atau WPA3, jadi orang di luar rumah yang tidak tahu sandi WiFi-nya tidak bisa menyambung atau menguping. Yang dijaga minggu ini adalah orang dan perangkat yang **sudah** berada di dalam jaringanmu: tamu yang kamu beri sandi WiFi, perangkat murahan yang kamu pasang, dan papan percobaanmu sendiri.

### 2. Kunci sendiri untuk setiap perangkat

Manusia masuk dengan email dan sandi, lalu memegang gelang 15 menit (Modul 20). Cara itu tidak cocok untuk perangkat:

- **Tidak ada orang yang mengetik.** Node 1 menyala 24 jam dan menyambung ulang sendiri setiap kali WiFi atau broker kembali. Ia tidak bisa membuka formulir *login*.
- **Perangkat memegang rahasianya terus-menerus.** Gelang yang habis setiap 15 menit dan kartu terusan di *cookie* adalah alat browser. Perangkat cukup memegang satu rahasia yang tetap, dan menunjukkannya setiap kali menyambung ke broker.
- **Satu perangkat, satu kunci.** Kalau semua perangkat memakai satu sandi bersama, satu papan yang hilang memaksamu mengganti sandi di semua perangkat. Dengan kunci per perangkat, kamu cukup mencabut kunci papan yang hilang; yang lain tetap berjalan.

Rahasia milik perangkat ini disebut **kunci perangkat**. Di dunia industri, rahasia semacam ini biasa disebut ***API key***. Bentuknya kamu kenal dari Modul 20: **32 *byte* acak yang ditulis sebagai 43 huruf *base64url***, resep yang sama dengan `JWT_SECRET` dan kartu terusan. Nama pengguna perangkat di broker adalah `device_id`-nya sendiri, misalnya `a4cf12e5b7c0`, seperti yang sudah dijanjikan kontrak data sejak Modul 11.

Backend tidak menyimpan kunci itu. Database hanya menyimpan **sidik jari SHA-256**-nya, 64 huruf heksadesimal di kolom `kunci_hash`. Di Modul 20 (Konsep 3), sandi manusia disimpan dengan bcrypt yang sengaja lambat karena manusia memilih sandi yang bisa ditebak. Kunci perangkat tidak dipilih manusia: ia diambil dari 2<sup>256</sup> kemungkinan. SHA-256 memang cepat, sekitar 100.000 tebakan dalam setengah detik di laptop penulis (Modul 20). Namun, menebak satu kunci tetap butuh waktu jauh lebih lama daripada umur alam semesta, bahkan kalau semua komputer di dunia ikut menebak. Jadi, SHA-256 yang cepat sudah cukup, persis seperti kartu terusan di tabel `sesi`.

Kunci itu hanya punya tiga salinan, dan masing-masing punya alasan:

| Tempat | Yang disimpan | Mengapa |
| :--- | :--- | :--- |
| **Backend** (tabel `devices`) | Sidik jari SHA-256 | Daftar resmi: siapa yang terdaftar, sejak kapan, dan apakah kuncinya sudah dicabut |
| **Broker** (berkas sandi Mosquitto) | Sidik jari buatan Mosquitto sendiri | Broker yang memeriksa kunci setiap kali perangkat menyambung (Konsep 6) |
| **Perangkat** (NVS Node 1 atau `alat/.env` simulator) | **Kuncinya sendiri** | Perangkat harus bisa menunjukkan kunci yang asli (Konsep 5) |

Tabel di atas adalah tempat kunci (atau sidik jarinya) **disimpan**. Yang kamu **pasang dengan tangan** cuma dua: berkas sandi broker dan perangkat. Backend sudah memegang sidik jarinya sejak membuatnya, jadi kamu tidak pernah menempel kunci ke sana.

Begitu dibuat, kunci hanya tampil **sekali**, di jawaban saat perangkat didaftarkan. Karena ia harus kamu salin ke berkas sandi broker dan ke perangkat, simpan salinanmu di **pengelola sandi** (tempat yang sama dengan sandi Modul 20) sampai keduanya terpasang. Pengelola sandi memang alat untuk itu. Jadi kunci yang **sama persis** nanti ada di tiga tempat: pengelola sandimu, berkas sandi broker, dan perangkat. Di luar itu, dan prompt tempat kamu menempelkannya, kunci tidak boleh ada: tidak di kode, Git, berkas `.yml` Bruno, log, catatan belajar, *chat*, atau tangkapan layar.

### 3. Daftar resmi dan *provisioning* sederhana

Memberi perangkat baru identitas, kunci, dan haknya disebut ***provisioning*** (penyiapan perangkat). Pabrik yang membuat ribuan perangkat memakai layanan khusus untuk ini (🔬 "*Provisioning* di industri"). Rumah Pintar Mini cukup memakai cara sederhana dengan tiga langkah:

1. **Backend mendaftarkan perangkat.** Admin mengirim `POST /devices` berisi `device_id` perangkat (Node 1 mencetaknya di Serial Monitor lewat perintah `info`). Backend membuat kunci acak, menyimpan sidik jarinya, dan menjawab dengan kuncinya beserta daftar `langkah` berikutnya. Jawaban itulah satu-satunya kesempatan melihat kuncinya.
2. **Perangkat diberi kunci.** Admin mengetik `kunci <isi kunci>` di Serial Monitor Node 1 (atau menulis satu baris di `alat/.env` untuk simulator). Kunci tersimpan di NVS dan dipakai setiap kali menyambung.
3. **Broker diberi tahu.** Di mesin tempat broker berjalan (Pi, atau laptop untuk jalur laptop), admin menjalankan `mosquitto_passwd` dan menempelkan kunci yang sama. Mosquitto menyimpan sidik jarinya di berkas sandi. (Minggu ini, dua langkah terakhir dikerjakan untuk semua perangkat sekaligus: perangkat memasang kuncinya di Praktik 3, lalu broker dikunci di Praktik 4.)

![Diagram provisioning sederhana: satu kunci perangkat, tiga langkah, Konsep 3. Contoh Node 1 a4cf12e5b7c0; kunci dibuat backend, lalu dipasang di perangkat dan di broker. Tiga kolom bernomor dari kiri ke kanan, dihubungkan panah. Kolom 1, berpita hijau: Backend mendaftarkan perangkat, di laptop, admin lewat Bruno. Admin mengirim POST /devices dengan isi JSON device_id a4cf12e5b7c0. Panah ke bawah: kunci 43 huruf acak, digambar sebagai kapsul kunci berisi potongan J2B dan elipsis, tiga huruf pertama kunci contoh modul ini; dibuat dengan randomBytes(32) dan ditulis sebagai base64url. Panah ke kotak biru database: tabel devices, kolom kunci_hash, berisi sidik jari SHA-256, 64 huruf heksadesimal; kuncinya sendiri tidak disimpan. Panah ke jawaban 201, kunci tampil sekali, dengan isi JSON device_id a4cf12e5b7c0, kunci J2B dan seterusnya, serta langkah; langkah adalah yang dikerjakan berikutnya di perangkat dan di broker. Kolom 2, berpita abu-abu: Perangkat diberi kunci, lewat Serial Monitor Node 1. Admin mengetik kunci diikuti kapsul kunci J2B, lalu Enter. Serial Monitor menjawab: Kunci broker disimpan ke NVS (43 huruf); kuncinya sendiri tidak pernah dicetak utuh. Panah ke kotak NVS Node 1, label kunci_broker, yang tetap ada saat restart dan saat firmware baru diunggah. Panah ke: setiap kali menyambung ke broker, Node 1 memakai nama pengguna a4cf12e5b7c0 dan sandi berupa kunci J2B; broker mencocokkannya dengan berkas sandi (Konsep 6). Catatan: simulator di jalur laptop memakai satu baris di alat/.env, misalnya KUNCI_F00D00000001= diikuti kuncinya. Kolom 3, berpita teal: Broker diberi tahu, di mesin tempat broker berjalan (gateway Pi). Admin menjalankan sudo mosquitto_passwd /etc/mosquitto/sandi-broker a4cf12e5b7c0, lalu menempelkan kunci yang sama di dua pertanyaan, Password dan Reenter password, masing-masing dengan kapsul kunci J2B; huruf yang ditempel tidak tampil sama sekali. Panah ke kotak teal: berkas sandi sandi-broker mendapat satu baris, a4cf12e5b7c0:$7$101$Bv3VQb7kNVkOTXCK$0qxDdhLe dan seterusnya, yaitu sidik jari buatan Mosquitto, bukan kuncinya. Panah ke perintah muat ulang broker supaya berkasnya dibaca lagi: sudo systemctl reload mosquitto. Catatan: Mosquitto tidak bisa membaca database backend, ia hanya mengenal berkasnya sendiri, jadi kedua daftar bisa tidak sama; penambalnya adalah langkah di jawaban API dan lapis kedua di backend (Konsep 4). Di bawah, kotak tiga salinan, masing-masing punya alasan: backend menyimpan sidik jari SHA-256 sebagai daftar resmi, yaitu siapa yang terdaftar, sejak kapan, dan apakah kuncinya sudah dicabut; perangkat menyimpan kuncinya sendiri di NVS Node 1 atau alat/.env simulator, karena harus bisa menunjukkan kunci yang asli; broker menyimpan sidik jari buatan Mosquitto sendiri untuk memeriksa kunci setiap kali perangkat menyambung. Pita bergembok: di luar ketiga tempat itu, kunci tidak boleh ada, tidak di kode, Git, log, catatan belajar, atau tangkapan layar. Kotak putus-putus paling bawah: Node 2 246f28b1c7d4 didaftarkan tanpa kunci, dengan penghubung a4cf12e5b7c0 (Node 1), karena ia tidak pernah menyambung ke broker; jawaban backend memuat baris daftar izin untuk Node 1, di bawah user a4cf12e5b7c0: topic write rpm/246f28b1c7d4/telemetry dan baris serupa yang berakhiran /status.](aset/alur-kunci-perangkat.png)

Node 2 sedikit berbeda. Ia tidak pernah menyambung ke broker: Node 1 menerbitkan datanya atas namanya sejak Modul 14. Jadi Node 2 didaftarkan **tanpa kunci**, dengan keterangan `penghubung` berisi `device_id` Node 1. Backend lalu menjawab dengan tiga baris daftar izin (`user <Node 1>` ditambah dua baris `topic write`) yang membolehkan Node 1 menulis ke topik Node 2 (Konsep 7).

Kamu mungkin bertanya, mengapa ada dua daftar: daftar resmi di backend dan berkas sandi di broker? Jawabannya, Mosquitto tidak bisa membaca database kita. Ia hanya mengenal berkasnya sendiri. Akibatnya, kedua daftar bisa tidak sama, misalnya karena kamu lupa menjalankan `mosquitto_passwd`. Ada dua penambal untuk itu: jawaban API selalu menuliskan `langkah` yang harus dikerjakan di broker, dan backend punya lapis kedua (Konsep 4). Cara yang membuat backend menulis berkas sandi Mosquitto sendiri adalah 🧩 Tingkat 3, dan cara tanpa berkas sama sekali dibahas di 🔬 "Mosquitto *dynamic security*".

### 4. Lapis kedua: backend hanya mendengarkan perangkat terdaftar

Sejak Modul 17, backend punya kebiasaan yang ramah tetapi berbahaya: setiap kali ada pesan dari `device_id` yang belum dikenalnya, ia **membuat baris baru** di tabel `devices` (`INSERT … ON CONFLICT` di `db/arsip.ts`). Buku tamunya menulis sendiri nama siapa pun yang lewat. Itu memudahkan Modul 16–20, tetapi itu juga berarti perangkat yang mengaku-ngaku langsung dianggap anggota rumah.

Mulai minggu ini, buku tamu itu hanya **dibaca**. Backend memuat daftar resmi dari tabel `devices` saat menyala, lalu memeriksa setiap pesan yang masuk:

| Keadaan perangkat | Pesannya |
| :--- | :--- |
| **Terdaftar**, kuncinya aktif (atau tanpa kunci karena lewat penghubung, seperti Node 2) | Diproses seperti biasa: disimpan, disiarkan lewat Socket.IO, dipakai aturan otomatis, dan diteruskan ke Telegram |
| **Belum terdaftar**, termasuk baris lama dari Modul 17–20 yang belum diklaim | **Diabaikan**, dan log menulis `DIABAIKAN … belum terdaftar`, paling sering sekali semenit untuk setiap perangkat |
| **Kuncinya dicabut** | **Diabaikan**, dengan log `DIABAIKAN … kuncinya sudah dicabut` |
| Daftar resmi belum bisa dibaca, misalnya database belum menyala | **Diabaikan semuanya** sampai daftarnya terbaca; backend mencoba lagi setiap 10 detik |

Baris terakhir disebut **gagal tertutup** (*fail closed*): saat ragu, tolak. Lebih baik kehilangan beberapa bacaan selama database mati daripada menerima semua pesan tanpa memeriksa. Jumlah pesan yang diabaikan juga terlihat di `GET /health` sebagai `diabaikan`.

Mengapa backend perlu memeriksa lagi kalau broker sudah memeriksa? Karena keamanan itu berlapis. Pengaturan broker bisa keliru, misalnya daftar izin yang salah ketik (Konsep 9), dan pencabutan di backend berlaku **seketika**, bahkan sebelum kamu sempat mengubah berkas sandi di broker. Kalau satu lapis gagal, lapis lain masih menahan.

Baris lama di tabel `devices` tidak dihapus. Riwayat bacaannya tetap ada dan tetap bisa dilihat. Saat perangkat itu didaftarkan, barisnya "diklaim" dan pesannya didengarkan lagi.

> ⬆️ **Sudah membaca Konsep 1–4?** Lanjut ke [Praktik 1 — Daftar resmi dan kunci perangkat](#praktik-1--daftar-resmi-dan-kunci-perangkat-60-menit), lalu [Praktik 2](#praktik-2--lapis-kedua-dan-akun-broker-untuk-backend-45-menit). Konsep 5 menunggumu sebelum Praktik 3.

### 5. Kunci di dalam perangkat: NVS, Serial Monitor, dan batasnya

Perangkat harus memegang kuncinya yang asli, karena kunci itulah yang ia tunjukkan kepada broker. Pertanyaannya: **di mana menyimpannya?**

- **Bukan di kode.** Kode firmware Node 1 ada di repositori publik `rumah-pintar-mini`. Kunci yang ditulis di `konfigurasi.h` ikut ter-*push* ke GitHub, dan setiap papan yang diunggah dari kode itu memakai kunci yang sama. Dua kesalahan sekaligus.
- **Di NVS** (*Non-Volatile Storage*), memori yang tidak hilang saat listrik padam, yang sudah kamu kenal dari Modul 8 dan dipakai untuk ambang kipas di Modul 19. Isi NVS tetap ada saat papan di-*restart*, dan juga saat kamu mengunggah firmware baru dari Arduino IDE, selama pilihan **Erase All Flash Before Sketch Upload** tetap **Disabled** (bawaannya memang begitu).

Firmware v1.6.0 menambahkan tiga perintah Serial Monitor:

| Perintah | Hasilnya |
| :--- | :--- |
| `kunci` | Menampilkan **status** kunci tanpa membuka isinya: panjangnya, ditambah empat huruf terakhirnya kalau kuncinya panjang (16 huruf atau lebih) |
| `kunci <isi>` | Menyimpan kunci ke NVS, lalu langsung mencoba menyambung lagi ke broker dengan kunci itu |
| `kunci hapus` | Menghapus kunci dari NVS |

Firmware **tidak pernah mencetak kunci secara utuh**, karena isi Serial Monitor sering disalin ke forum atau grup saat orang bertanya. Huruf besar dan kecil di kunci juga dijaga apa adanya: `Ab` dan `aB` adalah dua kunci yang berbeda.

Ada satu kebiasaan baru saat ditolak broker. Biasanya Node 1 mencoba menyambung lagi setiap 5 detik, karena broker yang mati memang suatu saat menyala lagi. Kunci yang salah tidak akan menjadi benar dengan sendirinya. Jadi, begitu broker menjawab "tidak diizinkan", Node 1 menulis `MQTT DITOLAK broker (kode 5)` di Serial Monitor, menampilkan `OFFLINE: MQTT DITOLAK` di layar, dan hanya mencoba lagi **setiap 60 detik**. Log broker pun tidak dibanjiri percobaan yang pasti gagal. Simulator perangkat dan backend berperilaku sama.

Simulator perangkat (jalur laptop) tidak punya NVS. Kuncinya ditulis di `alat/.env`, satu baris untuk setiap perangkat latihan, misalnya `KUNCI_F00D00000001=…`. Berkas itu sudah diabaikan Git sejak Modul 20.

Batasnya perlu diketahui juga: **siapa pun yang memegang papannya bisa membaca NVS**. Cukup sambungkan kabel USB dan salin seluruh isi *flash* dengan alat seperti esptool. Itulah alasan setiap perangkat diberi kunci sendiri yang bisa dicabut satu per satu (Konsep 9). Fitur ESP32 yang mengacak isi *flash* supaya tidak terbaca dibahas di 🔬 "*Secure boot* dan *flash encryption*", tetapi tidak dicoba di papan utama karena sifatnya permanen.

> ⬆️ **Sudah membaca Konsep 5?** Lanjut ke [Praktik 3 — Node 1 dan alat memasang kuncinya](#praktik-3--node-1-dan-alat-memasang-kuncinya-60-menit).

### 6. Penjaga pintu broker: berkas sandi dan satu akun untuk setiap program

Mosquitto bisa menjaga pintunya sendiri. Cukup dua baris pengaturan:

```text
allow_anonymous false
password_file /etc/mosquitto/sandi-broker
```

Baris pertama melarang tamu tanpa nama pengguna. Baris kedua menunjuk **berkas sandi** (*password file*), daftar nama pengguna beserta sidik jari sandinya. Berkas itu tidak pernah ditulis dengan tangan. Alat **`mosquitto_passwd`**, yang ikut terpasang bersama Mosquitto, menanyakan sandi dua kali lalu menulis satu baris seperti ini (**contoh**, sidik jarinya dipotong):

```text
a4cf12e5b7c0:$7$101$Bv3VQb7kNVkOTXCK$0qxDdhLe…
```

`$7$` adalah nama resepnya (PBKDF2-SHA512), `101` jumlah putarannya, lalu garam acak dan sidik jarinya, persis gagasan Modul 20 (Konsep 3). Mosquitto 2.0.21 di Pi memakai 101 putaran dan garam 12 *byte*. Mosquitto 2.1.2 di laptop memakai 1.000 putaran dan garam 64 *byte*, dan bentuk baru itu **tidak dikenali** Mosquitto 2.0.21. Jadi, **berkas sandi selalu dibuat di mesin tempat broker berjalan**, bukan di laptop lalu disalin ke Pi.

Saat sebuah klien menyambung, broker mencocokkan nama pengguna dan sandinya dengan berkas itu. Apa pun yang salah, entah tanpa nama pengguna, nama yang tidak dikenal, atau sandi yang keliru, jawabannya selalu sama: **kode 5, `Not authorized`** (di MQTT 5: `0x87`). Broker sengaja tidak memberi tahu bagian mana yang salah, sama seperti pesan `email atau sandi salah` di Modul 20. Log broker di Pi mencatatnya, misalnya `Client a4cf12e5b7c0 disconnected, not authorised.`

Siapa saja yang perlu akun? **Setiap program yang menyambung ke broker mendapat akunnya sendiri**:

| Akun | Dipakai oleh | Haknya setelah Praktik 5 |
| :--- | :--- | :--- |
| `backend` | backend v1.0 | membaca semua `rpm/#`, menulis perintah ke `rpm/+/cmd` |
| `nodered` | Node-RED di Pi (jalur perangkat) | sama dengan `backend`: dashboard membaca, sakelar Kipas mengirim perintah |
| `pemantau` | MQTTX | hanya membaca `rpm/#` (dan `$SYS/#`, data kesehatan broker) |
| `pemeriksa` | `alat/pemeriksa-kontrak.js` | hanya membaca `rpm/#` |
| `a4cf12e5b7c0` | Node 1 (`device_id` milikmu) | topiknya sendiri, ditambah `telemetry` dan `status` Node 2 |
| `f00d00000001` | simulator: perangkat latihan, di semua jalur | topiknya sendiri |

Mengapa tidak satu akun "admin" untuk semuanya? Karena **hak sekecil mungkin**: MQTTX yang hanya untuk mengintip tidak perlu boleh menyalakan pompa. Selain itu, akun yang terpisah bisa dicabut terpisah, dan ada alasan ketiga yang muncul di Konsep 8: dua program yang memakai akun yang sama akan saling tendang.

Satu hal tentang urutan. Begitu `allow_anonymous false` berlaku, setiap program tanpa akun langsung tertolak. Karena itu, Praktik 1–3 memasang kunci di backend, perangkat, dan alat lebih dulu, dan Praktik 4 membuat semua akun di broker **sebelum** mengunci pintunya. Selagi `password_file` belum dipasang, broker yang masih terbuka tidak memeriksa nama dan sandi yang dibawa klien, jadi tidak ada yang terputus.

![Diagram penjaga pintu broker, dengan dua pertanyaan: Kamu siapa?, lalu Kamu boleh apa?, Konsep 6 sampai 8. Berkas sandi diperiksa saat menyambung; daftar izin diperiksa untuk setiap pesan yang dikirim. Tiga kartu. Kiri, dengan ikon kantor pos teal: Pintu broker 1883, tiga tugas penjaga, Mosquitto dengan allow_anonymous false. Garis alur turun dari kapsul paket CONNECT, yang membawa nama klien, nama pengguna, dan sandi. Langkah 1, Kamu siapa?: nama pengguna dan sandi dicocokkan dengan berkas sandi sandi-broker; cabang tidak menuju kapsul merah kode 5. Kotak merah: tanpa nama pengguna, nama tak dikenal, atau sandi salah, jawabannya selalu sama, kode 5 Not authorized (MQTT 5: 0x87); log broker di Pi: Client … disconnected, not authorised. Langkah 2, nama klien diganti nama pengguna, use_username_as_clientid true: penyusup c0ba00000001 yang mengaku a4cf12e5b7c0 tetap tercatat c0ba00000001, jadi tidak ada yang ditendang; pola %c dan %u pun menunjuk perangkat yang sama. Kapsul hijau: lolos, tersambung. Sesudah garis putus-putus, kapsul setiap paket PUBLISH, berisi topik dan isi pesan. Langkah 3, Kamu boleh apa?: topik dicocokkan dengan daftar izin acl-broker; cabang tidak menuju kapsul merah dibuang. Kotak merah: dibuang diam-diam, pengirim tidak diputus; MQTTX (MQTT 5, QoS 1) menampilkan Publish error: Not authorized; log tingkat debug mencatat Denied PUBLISH from dan seterusnya. Kapsul hijau: lolos, diteruskan ke pelanggan. Kartu tengah: Daftar izin, pola %u, Konsep 7; semua yang tidak disebut dilarang. Kotak teal berisi pattern write rpm/%u/telemetry. %u adalah nama pengguna yang sudah terbukti dengan sandi; baris pattern berlaku untuk semua akun. Kartu berbingkai hijau, Node 1, akun a4cf12e5b7c0: baris itu baginya berbunyi write rpm/a4cf12e5b7c0/telemetry; ia menulis ke rpm/a4cf12e5b7c0/telemetry; centang hijau, cocok, diteruskan ke pelanggan. Kartu berbingkai merah, penyusup, dengan ikon papan abu-abu, akun c0ba00000001: baris itu baginya berbunyi write rpm/c0ba00000001/telemetry; ia menulis ke rpm/a4cf12e5b7c0/telemetry; silang merah, tidak cocok, dibuang diam-diam. Kotak abu-abu: langganan tidak pernah ditolak; penyusup yang berlangganan rpm/# tetap dijawab berhasil; yang disaring adalah setiap pesan, saat akan dikirim kepadanya, sehingga ia hanya menerima pesan yang boleh ia baca, yaitu cmd miliknya sendiri, dan tidak menerima apa pun dari Node 1. Kartu kanan: Satu akun untuk setiap program, Konsep 6, haknya setelah Praktik 5, setiap akun dengan ikon pemakainya. backend, dipakai backend v1.0: membaca semua rpm/#, menulis perintah ke rpm/+/cmd. nodered, dipakai Node-RED di Pi (jalur perangkat): sama dengan backend, dashboard membaca dan sakelar Kipas mengirim perintah. pemantau, dipakai MQTTX: hanya membaca rpm/# (dan $SYS/#, data kesehatan broker). pemeriksa, dipakai alat/pemeriksa-kontrak.js: hanya membaca rpm/#. a4cf12e5b7c0, dipakai Node 1 (device_id milikmu): topiknya sendiri, ditambah telemetry dan status Node 2. f00d00000001, dipakai simulator (jalur laptop): topiknya sendiri. Kotak teal, mengapa satu akun per program: hak sekecil mungkin, karena MQTTX untuk mengintip tidak perlu boleh menyalakan pompa; bisa dicabut terpisah; dan dua program dengan satu akun saling tendang.](aset/penjaga-pintu-broker.png)

> ⬆️ **Sudah membaca Konsep 6?** Lanjut ke [Praktik 4 — Mengunci pintu broker](#praktik-4--mengunci-pintu-broker-60-menit).

### 7. Daftar izin (ACL): setiap perangkat di topiknya sendiri

Berkas sandi menjawab pertanyaan **"Kamu siapa?"** (autentikasi). Pertanyaan kedua, **"Kamu boleh apa?"** (otorisasi), dijawab **daftar izin** (*Access Control List*, ACL). Pasangan ini sama dengan 401 lawan 403 di Modul 20 (Konsep 2), hanya kali ini di broker.

Daftar izin adalah berkas teks biasa. Mosquitto membacanya dari atas ke bawah, dan **semua yang tidak disebut dilarang**. Inti daftar izin Rumah Pintar Mini hanya lima baris:

```text
pattern write rpm/%u/telemetry
pattern write rpm/%u/status
pattern write rpm/%u/vitals
pattern write rpm/%u/ack
pattern read rpm/%u/cmd
```

Baris `pattern` berlaku untuk **semua akun**, dan `%u` diganti **nama pengguna yang sudah terbukti dengan sandi**. Untuk akun `a4cf12e5b7c0`, baris pertama berbunyi `write rpm/a4cf12e5b7c0/telemetry`: Node 1 boleh menulis bacaan **di topiknya sendiri**. Untuk akun penyusup `c0ba00000001`, baris yang sama berbunyi `write rpm/c0ba00000001/telemetry`. Penyusup itu boleh menulis bacaan atas namanya sendiri, tetapi tidak atas nama Node 1:

| Akun | Mencoba | Hasilnya |
| :--- | :--- | :--- |
| `a4cf12e5b7c0` (Node 1) | menulis ke `rpm/a4cf12e5b7c0/telemetry` | ✅ cocok dengan `pattern write rpm/%u/telemetry` |
| `a4cf12e5b7c0` (Node 1) | membaca `rpm/a4cf12e5b7c0/cmd` | ✅ cocok dengan `pattern read rpm/%u/cmd` |
| `c0ba00000001` (penyusup) | menulis ke `rpm/a4cf12e5b7c0/telemetry` | ❌ tidak ada baris yang cocok, jadi dilarang |
| `c0ba00000001` (penyusup) | menulis ke `rpm/a4cf12e5b7c0/cmd` | ❌ dilarang; perangkat bahkan tidak boleh menulis ke `cmd`-nya sendiri |
| `pemantau` (MQTTX) | menulis ke `rpm/a4cf12e5b7c0/cmd` | ❌ dilarang; `pemantau` hanya boleh membaca |

Akun selain perangkat mendapat baris `user` sendiri. Baris `topic` di bawahnya hanya berlaku untuk akun itu, sampai baris `user` berikutnya:

```text
user backend
topic read rpm/#
topic write rpm/+/cmd
```

Pengecualian Node 2 juga ditulis dengan cara ini, di bawah baris `user` milik Node 1 (`device_id` milikmu sendiri tentu berbeda):

```text
user a4cf12e5b7c0
topic write rpm/246f28b1c7d4/telemetry
topic write rpm/246f28b1c7d4/status
```

Lalu, apa yang terjadi saat penyusup menulis ke topik yang dilarang? **Broker membuang pesannya diam-diam.** Pengirim tidak diputus, dan di MQTT 3.1.1, versi yang dipakai Node 1, pengirim bahkan tidak tahu pesannya dibuang. Hanya ada tiga tanda:

- **MQTTX**, yang memakai MQTT 5, mendapat jawaban `Publish error: Not authorized`, tetapi hanya untuk pesan QoS 1 (Modul 11 Konsep 6). Pesan QoS 0 tidak dijawab sama sekali.
- **Log broker** mencatat `Denied PUBLISH from …`, tetapi hanya kalau broker diminta mencatat tingkat **`debug`**. Pengaturan bawaan Pi tidak mencatat tingkat itu, jadi `gateway-pi.conf` minggu ini menambahkan baris `log_type`.
- **Tidak ada yang sampai.** Pelanggan di `rpm/a4cf12e5b7c0/telemetry`, termasuk backend, tidak pernah menerima pesan palsu itu.

Langganan diperlakukan sedikit berbeda. Daftar izin Mosquitto **tidak pernah menolak langganan**: penyusup yang berlangganan `rpm/#` tetap dijawab "berhasil". Yang disaring adalah setiap pesan saat akan dikirimkan kepadanya. Hasilnya, ia hanya menerima pesan yang boleh ia baca, yaitu `cmd` miliknya sendiri, dan tidak menerima apa pun dari Node 1.

> ⬆️ **Sudah membaca Konsep 7?** Baca juga Konsep 8 sebelum [Praktik 5 — Daftar izin](#praktik-5--daftar-izin-setiap-perangkat-di-topiknya-sendiri-45-menit), karena keduanya dipasang bersama.

### 8. Nama klien bisa dipalsukan: `use_username_as_clientid`

Setiap klien MQTT memilih **nama klien** (*client ID*)-nya sendiri. Node 1 memakai `device_id`-nya sejak Modul 11. Broker punya satu aturan tentang nama klien: **satu nama, satu sambungan**. Kalau klien kedua masuk dengan nama yang sama, klien pertama ditendang keluar. Kamu pernah melihatnya di Modul 11 (Konsep 5) saat dua jendela MQTTX memakai nama klien yang sama dan saling tendang.

Aturan itu bisa disalahgunakan. Penyusup yang punya akun sah, misalnya `c0ba00000001`, cukup menyambung dengan nama klien `a4cf12e5b7c0`. Akibatnya dua:

1. **Node 1 yang asli ditendang** keluar dari broker. Begitu Node 1 menyambung lagi, giliran penyusup yang ditendang, dan keduanya bisa saling tendang terus-menerus.
2. Kalau daftar izin memakai pola **`%c`** (nama klien) alih-alih `%u` (nama pengguna), penyusup itu juga **boleh menulis ke topik Node 1**, karena nama kliennya memang `a4cf12e5b7c0`. Nama klien tidak dibuktikan dengan sandi; nama pengguna dibuktikan.

Silabus kurikulum ini awalnya menulis "ACL dengan pola `%c`". Saat modul ini disiapkan, kode sumber Mosquitto dan uji coba memperlihatkan celah di atas, jadi modul ini memakai **pola `%u`** dan menambahkan satu baris pengaturan yang menutup celah kedua:

```text
use_username_as_clientid true
```

Dengan baris ini, broker **mengganti nama klien setiap tamu dengan nama penggunanya**. Penyusup `c0ba00000001` yang mengaku bernama `a4cf12e5b7c0` tetap tercatat sebagai `c0ba00000001`, jadi tidak ada yang ditendang. Pola `%c` dan `%u` pun menunjuk perangkat yang sama, dan Silabus diubah sedikit untuk mencatat keputusan ini.

Baris ini punya satu akibat yang perlu diingat: nama klien setiap program kini sama dengan **nama akunnya**. Backend tercatat sebagai `backend`, MQTTX sebagai `pemantau`, dan seterusnya. Dua program yang memakai akun yang sama akan saling tendang. Itulah alasan ketiga untuk **satu akun bagi setiap program** (Konsep 6): jangan membuka dua sambungan MQTTX dengan akun `pemantau` sekaligus.

`use_username_as_clientid` adalah pengaturan milik `listener`, jadi ditulis **di bawah** baris `listener 1883`. Mosquitto juga tidak membacanya ulang saat di-*reload*, jadi menambahkannya butuh *restart*.

> ⬆️ **Sudah membaca Konsep 7–8?** Lanjut ke [Praktik 5 — Daftar izin](#praktik-5--daftar-izin-setiap-perangkat-di-topiknya-sendiri-45-menit), lalu [Praktik 6 — Penyusup ditolak dan tercatat](#praktik-6--penyusup-ditolak-dan-tercatat-40-menit).

### 9. Mencabut kunci perangkat yang hilang

Bayangkan papan Node 1 hilang, atau papan percobaan yang pernah kamu beri kunci dipinjamkan ke teman. Kunci di dalamnya masih berlaku. Mencabutnya dilakukan di **dua lapis**, persis seperti cara kunci itu dipasang:

1. **Backend: berlaku seketika.** Admin mengirim `POST /devices/:id/cabut`. Backend menghapus sidik jari kuncinya dan mencatat waktu pencabutannya. Mulai detik itu, semua pesan dari perangkat itu diabaikan (`DIABAIKAN … kuncinya sudah dicabut`), dan perintah ke perangkat itu dijawab **409**.
2. **Broker: menutup pintunya.** Di mesin broker, admin menghapus akunnya dengan `mosquitto_passwd -D`, lalu memuat ulang broker. Menurut kode sumber Mosquitto, saat memuat ulang berkas sandi, broker memeriksa lagi semua klien yang sedang tersambung dan **memutus** klien yang akunnya sudah tidak ada. Perangkat itu lalu mencoba menyambung lagi dan dijawab `Not authorized`.

![Diagram mencabut kunci perangkat yang hilang: dua lapis, Konsep 9. Contoh: papan Node 1 a4cf12e5b7c0 hilang; kunci dicabut di dua tempat, persis seperti cara kunci itu dipasang. Kiri, garis waktu dari atas ke bawah. Awal: papan Node 1 hilang, atau papan percobaan dipinjamkan ke teman; kunci di dalamnya masih berlaku, dan pemegangnya bisa masuk ke broker atas nama Node 1. Langkah 1, kartu hijau Lapis 1, backend, berlaku seketika: admin mengirim POST /devices/a4cf12e5b7c0/cabut; backend menghapus sidik jari kuncinya dan mencatat waktu pencabutannya. Mulai detik itu, pesan dari perangkat itu dicatat DIABAIKAN … kuncinya sudah dicabut, dan perintah ke perangkat itu, jawaban POST /devices/:id/command, adalah 409. Langkah 2, kartu teal Lapis 2, broker, menutup pintunya: di mesin broker (Pi), hapus akunnya lalu muat ulang, dengan sudo mosquitto_passwd -D /etc/mosquitto/sandi-broker a4cf12e5b7c0 dan sudo systemctl reload mosquitto. Menurut kode sumber Mosquitto, semua klien yang tersambung diperiksa lagi, dan Node 1 diputus; percobaan berikutnya dijawab kode 5, Not authorized; Node 1 menulis MQTT DITOLAK broker (kode 5) dan mencoba lagi setiap 60 detik. Kotak kuning: wasiat offline tidak terkirim saat akunnya dicabut, sehingga status retained bisa tetap online; keadaan resmi perangkat dilihat di GET /devices, kolom kunci bernilai dicabut, bukan di status. Langkah terakhir, bertanda centang hijau: pemulihan saat papan sudah ditemukan, dan jangan memakai kunci lamanya lagi. 1, backend: POST /devices/a4cf12e5b7c0/kunci membuat kunci baru; 2, broker: mosquitto_passwd dengan kunci baru, lalu muat ulang broker; 3, perangkat: kunci diikuti isi kunci baru, di Serial Monitor Node 1; siapa tahu kunci lama itu sudah disalin. Kanan, kartu muat ulang atau mulai ulang, dua cara yang berbeda. Muat ulang (reload): kalau yang diubah berkas sandi, yaitu menambah, mengganti, atau menghapus akun dengan mosquitto_passwd; di Pi sudo systemctl reload mosquitto; sambungan yang sah tidak terputus. Mulai ulang (restart): kalau yang diubah daftar izin, atau pengaturan seperti use_username_as_clientid; di Pi sudo systemctl restart mosquitto; semua klien tersambung lagi dalam beberapa detik. Kotak merah, mengapa daftar izin butuh restart: menurut kode sumbernya, Mosquitto 2.0.21 (Pi) yang memuat ulang daftar izin yang salah ketik tetap berjalan tanpa daftar izin sama sekali, sehingga semua akun boleh menulis ke mana saja, dan tandanya hanya dua baris Error di log; dengan restart, berkas yang salah membuat broker gagal menyala, sehingga kesalahannya langsung terlihat. Kotak abu-abu, di laptop: keduanya cukup dengan menghentikan brokernya, lalu menyalakannya lagi.](aset/dua-lapis-pencabutan.png)

Ada satu akibat kecil yang perlu diketahui. Menurut kode sumber Mosquitto, perangkat yang diputus karena akunnya dicabut **tidak** dikirimi wasiat (*Last Will*) `offline`. Pesan `status` *retained*-nya bisa tetap `online`. Karena itu, keadaan resmi perangkat dilihat dari daftar resmi (`GET /devices`, kolom `kunci`: `dicabut`), bukan dari `status`.

Untuk memulihkan perangkat yang sudah ditemukan, jangan memakai kunci lamanya lagi, karena siapa tahu kunci itu sudah disalin. Kirim `POST /devices/:id/kunci` untuk membuat **kunci baru**, tambahkan lagi akunnya di broker dengan kunci baru itu, lalu ketik `kunci <isi baru>` di perangkatnya.

**Muat ulang (*reload*) atau mulai ulang (*restart*)?** Dua cara itu berbeda:

| Yang diubah | Caranya | Mengapa |
| :--- | :--- | :--- |
| Berkas sandi (menambah, mengganti, atau menghapus akun dengan `mosquitto_passwd`) | **Muat ulang**: di Pi `sudo systemctl reload mosquitto`. Sambungan yang sah tidak terputus. | `mosquitto_passwd` selalu menulis baris yang benar, jadi tidak ada risiko berkas rusak. |
| Daftar izin, atau pengaturan seperti `use_username_as_clientid` | **Mulai ulang**: di Pi `sudo systemctl restart mosquitto`. Semua klien tersambung lagi dalam beberapa detik. | `use_username_as_clientid` tidak ikut dimuat ulang. Lebih penting lagi, menurut kode sumbernya, Mosquitto 2.0.21 yang memuat ulang daftar izin **yang salah ketik** tetap berjalan **tanpa daftar izin sama sekali**: semua akun boleh menulis ke mana saja, dan tandanya hanya dua baris `Error` di log. Dengan *restart*, berkas yang salah membuat broker gagal menyala, dan kesalahan itu langsung terlihat. |

Di laptop, broker berkunci minggu ini berjalan di terminal VS Code (Praktik 4), jadi kedua jenis perubahan cukup dengan **Ctrl + C** di terminal broker, lalu menjalankannya lagi. Tidak ada beda antara muat ulang dan mulai ulang di sana: brokernya memang mati sebentar, lalu semua klien tersambung lagi sendiri.

> ⬆️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 7 — Mencabut kunci perangkat yang hilang](#praktik-7--mencabut-kunci-perangkat-yang-hilang-40-menit).

### 10. Jujur: lalu lintas di rumah masih polos

Semua kunci minggu ini punya satu kelemahan yang sama: **lalu lintas MQTT di pintu 1883 tidak dienkripsi**. Saat Node 1 menyambung, paket pertamanya, CONNECT, membawa nama klien, nama pengguna, dan kunci sebagai *byte* polos. Siapa pun yang bisa melihat lalu lintas di jaringanmu bisa membaca kunci itu. Di Praktik 8 kamu melihatnya sendiri dengan alat kecil `alat/penyadap.js`.

![Diagram kunci perangkat di dalam paket CONNECT: terbaca polos, Konsep 10. MQTT di pintu 1883 belum dienkripsi; paket pertama Node 1 membawa nama pengguna dan kuncinya apa adanya. Atas, tiga kartu dari kiri ke kanan, dihubungkan panah berlabel CONNECT dan byte polos: Node 1 a4cf12e5b7c0, yang menyambung dengan kuncinya; penyadap, yaitu siapa pun di jalur yang sama, dan di Praktik 8 alat/penyadap.js di 127.0.0.1:1884 yang mencetak isi CONNECT; dan broker, Mosquitto di pintu 1883, tanpa enkripsi. Tengah, paket CONNECT Node 1 (MQTT 3.1.1) byte demi byte, 119 byte seluruhnya, sebagai deretan kotak byte heksadesimal dengan artinya di kanan: 10 75, jenis paket CONNECT, lalu 117 byte lagi; 00 04 lalu 4d 51 54 54, nama protokol MQTT; 04, versi protokol 4 sama dengan MQTT 3.1.1; ee, bendera: ada nama pengguna, sandi, dan wasiat; 00 0f, keep-alive 15 detik; 00 0c lalu 61 34 63 66 31 32 dan seterusnya, nama klien a4cf12e5b7c0; 00 17 lalu 72 70 6d 2f 61 34 dan seterusnya, topik wasiat rpm/a4cf12e5b7c0/status; 00 07 lalu 6f 66 66 6c 69 6e 65, isi wasiat offline; 00 0c lalu 61 34 63 66 31 32 dan seterusnya, nama pengguna a4cf12e5b7c0; dan baris yang disorot merah, 00 2b lalu 4a 32 42 dan seterusnya, kunci 43 huruf J2BPlozrp88Z-rmVr2EnhfJkgOxAY3xxGYzVSjQejOE, terbaca polos. Keterangan: kotak abu-abu adalah dua byte panjang, 00 0c sama dengan 12, 00 17 sama dengan 23, dan 00 2b sama dengan 43 (pemanasan langkah 5); kotak putih adalah isinya, setiap huruf satu byte, misalnya 61 sama dengan a dan 34 sama dengan 4; kotak merah adalah kunci perangkat, terbaca utuh, tanpa kunci apa pun untuk membukanya (kunci contoh modul ini). Bawah kiri, kotak kuning, sekarang: pintu 1883, jaringan rumah, masih bisa diterima untuk sementara, karena WiFi rumahmu sudah dienkripsi antara perangkat dan router (WPA2 atau WPA3); broker tidak bisa diketuk dari internet, karena tidak ada port forwarding ke Pi atau laptopmu; dan jadi penyadap harus sudah berada di dalam jaringanmu, sehingga risikonya nyata, tetapi kecil. Bawah kanan, kotak hijau bergembok, Modul 27: TLS, pintu 8883, wajib sebelum broker dibuka ke internet: seluruh isi sambungan terenkripsi, termasuk paket CONNECT, sehingga kuncinya tidak terbaca lagi; di internet, pesan melewati banyak jaringan milik orang lain, dan broker yang terbuka diketuk penebak sandi otomatis setiap hari; cara yang lebih kuat lagi, sertifikat untuk setiap perangkat (mTLS), dibahas di Bedah Teknis.](aset/kunci-di-paket-connect.png)

Lalu, mengapa itu masih bisa diterima untuk sementara?

- **WiFi rumahmu sudah dienkripsi** antara perangkat dan router (WPA2 atau WPA3). Orang di luar rumah yang tidak tahu sandi WiFi tidak bisa menguping.
- **Broker tidak bisa diketuk dari internet.** Tidak ada *port forwarding* ke Pi atau laptopmu, dan aturan aman minggu ini memintamu tetap begitu.
- Jadi, penyadap harus **sudah berada di dalam jaringanmu**. Risiko itu nyata, tetapi kecil, dan sudah dikurangi oleh kunci per perangkat, daftar izin, dan pencabutan.

Mengapa wajib dibereskan sebelum ke internet? Di internet, pesan melewati banyak jaringan milik orang lain, dan broker yang terbuka diketuk penebak sandi otomatis setiap hari. **Modul 27** menambahkan **TLS** (pintu 8883), sehingga seluruh isi sambungan, termasuk paket CONNECT, terenkripsi. Cara yang lebih kuat lagi, yaitu sertifikat untuk setiap perangkat (mTLS), dibahas di 🔬.

Untuk melihat gambaran besarnya, OWASP (organisasi nirlaba di bidang keamanan aplikasi) menerbitkan **OWASP IoT Top 10** edisi 2018, sepuluh kesalahan keamanan perangkat IoT yang paling sering terjadi. Berikut posisi Rumah Pintar Mini setelah modul ini:

| No. | Kesalahan (nama resminya) | Artinya | Rumah Pintar Mini |
| :--- | :--- | :--- | :--- |
| I1 | *Weak, Guessable, or Hardcoded Passwords* | sandi lemah, mudah ditebak, atau tertanam di kode | ✅ kunci acak 43 huruf per perangkat, tidak di kode; sandi manusia minimal 15 karakter (Modul 20) |
| I2 | *Insecure Network Services* | layanan jaringan yang terbuka tanpa perlu | 🟡 broker dan backend dikunci; broker belum TLS (Modul 27) |
| I3 | *Insecure Ecosystem Interfaces* | API, *web*, atau aplikasi pendamping yang lemah | ✅ *login*, peran, dan satpam di API (Modul 20); daftar izin di broker (modul ini) |
| I4 | *Lack of Secure Update Mechanism* | tidak ada cara memperbarui firmware dengan aman | ⏳ pembaruan lewat udara (OTA) di Modul 28 |
| I5 | *Use of Insecure or Outdated Components* | komponen usang atau berlubang | 🟡 kebiasaan `npm audit` dan `apt full-upgrade` (Modul 12 dan 16) |
| I6 | *Insufficient Privacy Protection* | data pribadi tidak dijaga | 🟡 data pengguna seminimal mungkin (Modul 20); data *live* hanya untuk yang *login* |
| I7 | *Insecure Data Transfer and Storage* | data dikirim atau disimpan tanpa perlindungan | ❌ lalu lintas MQTT dan HTTP masih polos (Modul 27 dan Fase 5); NVS belum dienkripsi |
| I8 | *Lack of Device Management* | tidak bisa mendata dan mencabut perangkat | ✅ daftar resmi dan pencabutan kunci (modul ini); pengelolaan banyak perangkat di Modul 28 |
| I9 | *Insecure Default Settings* | pengaturan bawaan yang tidak aman | ✅ `allow_anonymous false` dan terkunci secara bawaan (modul ini dan Modul 20) |
| I10 | *Lack of Physical Hardening* | papan mudah dibongkar dan dibaca | ⏳ dibahas di 🔬 (*secure boot*, *flash encryption*); kotak perangkat di Modul 28 |

Tidak ada sistem yang "aman sepenuhnya". Yang bisa kamu lakukan adalah tahu persis apa yang sudah dikunci, apa yang belum, dan kapan yang belum itu dibereskan. Tabel di atas adalah jawabanmu untuk pertanyaan itu.

> ⬆️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 8 — Jujur soal enkripsi dan uji kelulusan](#praktik-8--jujur-soal-enkripsi-dan-uji-kelulusan-40-menit).

## 🔧 Praktik langkah demi langkah

### Praktik 1 — Daftar resmi dan kunci perangkat (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, terminal kedua di folder `backend` untuk perintah lain), **Docker Desktop** (kontainer `rumahpintar-db` menyala), dan **Bruno**.

Praktik ini membuat backend menjadi **daftar resmi** perangkat (Konsep 3): tabel `devices` mendapat kolom kunci, backend bisa membuat kunci 43 huruf untuk setiap perangkat, dan pesan dari perangkat mana pun belum disaring dulu (itu Praktik 2). Broker belum disentuh sama sekali.

#### 1.1 Siapkan cabang kerja (2 menit)

Buka folder `rumah-pintar-mini` di VS Code. Di terminal kedua (yang belum menjalankan apa pun), mulai dari `main` yang terbaru, lalu buat cabang baru:

```text
git switch main
git pull
git switch -c fitur/keamanan-perangkat
```

Lalu masuk ke folder `backend`: `cd backend`. Di terminal pertama, nyalakan backend seperti biasa: masuk ke folder `backend`, lalu `npm run dev`. Biarkan berjalan selama praktik; setiap kali berkas `.ts` disimpan, backend memulai ulang sendiri.

#### 1.2 Migrasi `010`: tempat kunci di tabel `devices` (8 menit)

Bentuk tabel diubah lewat migrasi bernomor, seperti Modul 17–20. Klik kanan folder **`backend/migrasi`** → **New File…**, beri nama **`010_kunci_perangkat.sql`**, lalu ketik:

```sql
-- 010_kunci_perangkat.sql - daftar resmi perangkat dan kuncinya (Modul 21). Sampai Modul 20, baris devices dibuat otomatis
-- untuk perangkat APA PUN yang mengirim pesan. Mulai Modul 21, perangkat harus didaftarkan admin (POST /devices); pesan dari
-- perangkat yang belum terdaftar atau sudah dicabut diabaikan backend.
-- Nomor 009 sengaja dilewati: 009_pengguna_di_perintah.sql adalah Tantangan Tingkat 3 Modul 20 yang mungkin sudah kamu buat.

-- Kunci perangkat (32 byte acak) hanya ditampilkan SEKALI saat dibuat; database menyimpan SHA-256-nya saja (64 huruf
-- heksadesimal), sama seperti refresh token di Modul 20. Perangkat ESP-NOW (Node 2) tidak tersambung ke broker, jadi tidak
-- punya kunci: datanya diterbitkan perangkat penghubungnya (Node 1).
ALTER TABLE devices
  ADD COLUMN terdaftar    timestamptz,                                 -- kapan didaftarkan admin; NULL = belum terdaftar
  ADD COLUMN kunci_hash   text CHECK (kunci_hash ~ '^[0-9a-f]{64}$'),  -- SHA-256 kunci yang berlaku sekarang
  ADD COLUMN kunci_dibuat timestamptz,                                 -- kapan kunci itu dibuat (registrasi atau ganti kunci)
  ADD COLUMN dicabut      timestamptz,                                 -- kapan dicabut; NULL = boleh mengirim data
  ADD COLUMN penghubung   text REFERENCES devices (device_id),         -- perangkat yang menerbitkan datanya (Node 2 -> Node 1)
  ADD CONSTRAINT devices_kunci_lengkap CHECK ((kunci_hash IS NULL) = (kunci_dibuat IS NULL)),
  ADD CONSTRAINT devices_penghubung_tanpa_kunci CHECK (penghubung IS NULL OR kunci_hash IS NULL),
  ADD CONSTRAINT devices_bukan_penghubung_sendiri CHECK (penghubung <> device_id),
  ADD CONSTRAINT devices_dicabut_tanpa_kunci CHECK (dicabut IS NULL OR kunci_hash IS NULL);

-- Baris lama (dibuat otomatis Modul 17-20) tetap ada beserta riwayatnya, tetapi belum terdaftar: data barunya diabaikan sampai
-- admin mendaftarkan device_id itu (riwayatnya tidak hilang).
```

- **`ALTER TABLE devices ADD COLUMN …`** menambah lima kolom ke tabel yang sudah ada. Baris lama tidak hilang; kolom barunya kosong (`NULL`) untuk semua baris lama.
- **`terdaftar`** berisi waktu perangkat didaftarkan admin. Baris lama yang dibuat otomatis Modul 17–20 berisi `NULL`, artinya **belum terdaftar**.
- **`kunci_hash`** hanya menerima tepat 64 huruf heksadesimal (`CHECK (kunci_hash ~ '^[0-9a-f]{64}$')`), yaitu bentuk sidik jari SHA-256. Kalau suatu hari ada kode yang keliru mencoba menyimpan kuncinya sendiri, database menolaknya.
- **`dicabut`** dan **`penghubung`** dipakai di Praktik 7 dan untuk Node 2. `REFERENCES devices (device_id)` memastikan `penghubung` selalu menunjuk perangkat yang ada.
- Empat **`CONSTRAINT … CHECK`** menjaga aturan yang masuk akal: sidik jari dan waktu pembuatannya selalu datang berpasangan, perangkat lewat penghubung tidak punya kunci, perangkat tidak boleh menjadi penghubungnya sendiri, dan perangkat yang dicabut tidak punya kunci lagi.

Nomornya `010`, bukan `009`: nomor 009 sengaja dilewati karena dipakai 🧩 Tingkat 3 Modul 20. Kalau kamu tidak mengerjakannya, tidak apa-apa; `npm run migrasi` menerapkan berkas menurut urutan nomornya walaupun ada yang terlewat. Jalankan di terminal kedua:

```text
npm run migrasi
```

**Hasilnya:**

```text
> rumah-pintar-mini-backend@0.5.0 migrasi
> node --env-file=.env src/db/migrasi.ts

diterapkan: 010_kunci_perangkat.sql
1 migrasi baru diterapkan, 7 sudah ada sebelumnya.
```

Kalau kamu mengerjakan 🧩 Tingkat 3 Modul 20, baris terakhirnya menyebut `8 sudah ada sebelumnya`. Jalankan sekali lagi: kali ini `0 migrasi baru diterapkan`, karena migrasi yang sudah tercatat tidak pernah dijalankan dua kali.

#### 1.3 Kunci dan sidik jarinya: `src/auth/kunci.ts` (5 menit)

Klik kanan folder **`backend/src/auth`** → **New File…**, beri nama **`kunci.ts`**, lalu ketik:

```ts
// kunci.ts - kunci perangkat (API key per perangkat, Modul 21). Kunci = 32 byte acak, ditampilkan SEKALI saat dibuat, lalu
// dipakai perangkat sebagai kata sandi broker MQTT (dan kelak untuk HTTP, misalnya unduh firmware di Modul 28). Database hanya
// menyimpan SHA-256-nya: kunci 256 bit acak tidak bisa ditebak, jadi hash cepat sudah cukup (bcrypt hanya perlu untuk sandi
// buatan manusia, Modul 20). Kunci TIDAK PERNAH ditulis ke log atau ke Git.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// bentuk kunci: 43 huruf base64url (A-Z, a-z, 0-9, - dan _), aman diketik di terminal, Serial Monitor, dan MQTTX
export const Kunci = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "kunci perangkat harus 43 huruf base64url");

export function buatKunci(): string {
  return randomBytes(32).toString("base64url");
}

export function hashKunci(kunci: string): string {
  return createHash("sha256").update(kunci).digest("hex"); // 64 huruf heksadesimal
}

// Apakah kunci yang dibawa cocok dengan sidik jari di database? Perbandingannya waktu-konstan (timingSafeEqual): lama
// jawabannya tidak bergantung pada berapa huruf awal yang sudah benar, jadi tidak bisa ditebak huruf demi huruf.
// Di Modul 21 yang memeriksa kunci adalah broker (password file); fungsi ini untuk backend kelak (Modul 28).
export function cocokkanKunci(kunci: string, kunciHash: string | null): boolean {
  if (kunciHash === null) return false; // perangkat tanpa kunci (dicabut, atau Node 2 lewat Node 1)
  const dibawa = Buffer.from(hashKunci(kunci), "hex");
  const tersimpan = Buffer.from(kunciHash, "hex");
  return dibawa.length === tersimpan.length && timingSafeEqual(dibawa, tersimpan);
}
```

Isinya sama dengan langkah 1 dan 2 pemanasan, dalam bentuk TypeScript:

- **`Kunci`** adalah skema Zod dengan pola teks yang sama dengan `bentukKunci` di pemanasan. Pesan galatnya ramah: `kunci perangkat harus 43 huruf base64url`.
- **`buatKunci()`** dan **`hashKunci()`** adalah `randomBytes(32).toString("base64url")` dan SHA-256 heksadesimal.
- **`cocokkanKunci()`** membandingkan dengan `timingSafeEqual`. Komentarnya menjelaskan bahwa minggu ini fungsi itu belum dipakai rute mana pun, karena yang memeriksa kunci adalah broker. Ia sudah disiapkan untuk 🧩 Tingkat 2 dan Modul 28.

#### 1.4 Daftar resmi di database: `src/db/perangkat.ts` (8 menit)

Klik kanan folder **`backend/src/db`** → **New File…**, beri nama **`perangkat.ts`**, lalu ketik:

```ts
// perangkat.ts - daftar resmi perangkat di tabel devices (Modul 21, migrasi 010): registrasi oleh admin, ganti kunci, cabut.
// Sidik jari kunci (kunci_hash) hanya DITULIS dari file ini; daftar perangkat tidak pernah membacanya.
import { pool } from "./pool.ts";

// satu baris daftar perangkat seperti yang ditampilkan GET /devices (tanpa sidik jari kunci)
export interface BarisPerangkat {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  nama: string | null;
  lokasi: string | null;
  status: string;
  terakhir_dilihat: Date | null;
  terdaftar: Date | null;
  kunci_dibuat: Date | null;
  dicabut: Date | null;
  penghubung: string | null;
}

const KOLOM = "device_id, jenis, nama, lokasi, status, terakhir_dilihat, terdaftar, kunci_dibuat, dicabut, penghubung";

export async function semuaPerangkatDb(): Promise<BarisPerangkat[]> {
  const hasil = await pool.query<BarisPerangkat>(`SELECT ${KOLOM} FROM devices ORDER BY device_id`);
  return hasil.rows;
}

// Daftarkan perangkat. device_id yang sudah punya baris lama (dibuat otomatis Modul 17-20) "diklaim": riwayatnya tetap.
// Hasilnya undefined kalau device_id itu SUDAH terdaftar (pakai ganti kunci, bukan registrasi ulang).
export async function daftarkanPerangkat(deviceId: string, nama: string | null, lokasi: string | null,
  penghubung: string | null, kunciHash: string | null): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `INSERT INTO devices (device_id, jenis, nama, lokasi, penghubung, terdaftar, kunci_hash, kunci_dibuat)
     VALUES ($1, CASE WHEN $4::text IS NULL THEN 'belum-diketahui' ELSE 'node2' END, $2, $3, $4, now(), $5,
             CASE WHEN $5::text IS NULL THEN NULL ELSE now() END)
     ON CONFLICT (device_id) DO UPDATE SET
       nama = coalesce($2, devices.nama),
       lokasi = coalesce($3, devices.lokasi),
       jenis = CASE WHEN $4::text IS NULL THEN devices.jenis ELSE 'node2' END,
       penghubung = $4, terdaftar = now(), kunci_hash = $5, kunci_dibuat = EXCLUDED.kunci_dibuat, dicabut = NULL
     WHERE devices.terdaftar IS NULL
     RETURNING ${KOLOM}`,
    [deviceId, nama, lokasi, penghubung, kunciHash],
  );
  return hasil.rows[0];
}

// Kunci baru untuk perangkat terdaftar yang tersambung ke broker (juga menghidupkan lagi perangkat yang dicabut).
export async function gantiKunciPerangkat(deviceId: string, kunciHash: string): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `UPDATE devices SET kunci_hash = $2, kunci_dibuat = now(), dicabut = NULL
     WHERE device_id = $1 AND terdaftar IS NOT NULL AND penghubung IS NULL
     RETURNING ${KOLOM}`,
    [deviceId, kunciHash],
  );
  return hasil.rows[0];
}

// Cabut: sidik jari kunci dihapus, waktu pencabutan dicatat. Hasilnya undefined kalau belum terdaftar atau sudah dicabut.
export async function cabutPerangkat(deviceId: string): Promise<BarisPerangkat | undefined> {
  const hasil = await pool.query<BarisPerangkat>(
    `UPDATE devices SET kunci_hash = NULL, kunci_dibuat = NULL, dicabut = now()
     WHERE device_id = $1 AND terdaftar IS NOT NULL AND dicabut IS NULL
     RETURNING ${KOLOM}`,
    [deviceId],
  );
  return hasil.rows[0];
}
```

- **`semuaPerangkatDb()`** membaca semua baris `devices`. Perhatikan daftar kolomnya (`KOLOM`): `kunci_hash` **tidak ikut**. Sidik jari kunci hanya pernah **ditulis** dari berkas ini, tidak pernah dibaca untuk ditampilkan.
- **`daftarkanPerangkat()`** memakai `INSERT … ON CONFLICT (device_id) DO UPDATE … WHERE devices.terdaftar IS NULL`. Artinya: kalau `device_id` itu belum ada, buat baris baru; kalau sudah ada sebagai baris lama yang **belum terdaftar**, "klaim" baris itu (riwayat bacaannya tetap); kalau sudah **terdaftar**, jangan ubah apa pun. Pada kasus terakhir, `RETURNING` tidak mengembalikan baris, jadi fungsinya menghasilkan `undefined`, dan rute nanti menjawab 409.
- **`gantiKunciPerangkat()`** mengganti sidik jari dengan yang baru dan mengosongkan `dicabut`. Kunci lama langsung tidak berlaku, dan perangkat yang pernah dicabut hidup lagi.
- **`cabutPerangkat()`** menghapus sidik jari dan mencatat waktu pencabutan. Kita memakainya di Praktik 7.

#### 1.5 Buku tamu di memori: `src/services/daftar.ts` (5 menit)

Klik kanan folder **`backend/src/services`** → **New File…**, beri nama **`daftar.ts`**, lalu ketik:

```ts
// daftar.ts - "buku tamu" perangkat di memori (Modul 21): siapa yang terdaftar dan siapa yang sudah dicabut.
// Isinya dimuat dari tabel devices saat server mulai, lalu diperbarui rute registrasi, ganti kunci, dan cabut, jadi backend
// tidak perlu bertanya ke database untuk setiap pesan.
import type { BarisPerangkat } from "../db/perangkat.ts";

export type Izin = "terdaftar" | "belum-terdaftar" | "dicabut" | "belum-dimuat";

interface Catatan {
  dicabut: boolean;
}

const daftar = new Map<string, Catatan>(); // hanya perangkat yang terdaftar (aktif atau dicabut)
let termuat = false;

// keputusan murni (diuji Vitest): boleh tidaknya sebuah perangkat dilayani
export function nilaiIzin(sudahDimuat: boolean, catatan: Catatan | undefined): Izin {
  if (!sudahDimuat) return "belum-dimuat"; // daftar belum terbaca dari database: jangan percaya siapa pun dulu
  if (catatan === undefined) return "belum-terdaftar";
  return catatan.dicabut ? "dicabut" : "terdaftar";
}

export function izinPerangkat(deviceId: string): Izin {
  return nilaiIzin(termuat, daftar.get(deviceId));
}

export function isiDaftar(baris: Pick<BarisPerangkat, "device_id" | "terdaftar" | "dicabut">[]): number {
  daftar.clear();
  for (const b of baris) if (b.terdaftar !== null) daftar.set(b.device_id, { dicabut: b.dicabut !== null });
  termuat = true;
  return daftar.size;
}

export function catatTerdaftar(deviceId: string): void {
  daftar.set(deviceId, { dicabut: false });
}

export function catatDicabut(deviceId: string): void {
  daftar.set(deviceId, { dicabut: true });
}
```

Ini adalah versi TypeScript langkah 4 pemanasan:

- **`nilaiIzin()`** adalah fungsi murni yang memutuskan satu dari empat keadaan. Keadaan keempat, **`belum-dimuat`**, berlaku selama daftar belum berhasil dibaca dari database: backend belum boleh percaya kepada siapa pun (gagal tertutup, Konsep 4).
- **`isiDaftar()`** mengisi buku dari baris database. Hanya baris yang `terdaftar`-nya terisi yang masuk ke buku; baris lama otomatis dianggap belum terdaftar.
- **`catatTerdaftar()`** dan **`catatDicabut()`** dipanggil rute saat ada perubahan, sehingga buku di memori selalu sama dengan database tanpa membaca ulang tabelnya.

#### 1.6 Rute pendaftaran: `src/routes/perangkat.ts` (12 menit)

Buka **`src/routes/perangkat.ts`**. Ada tiga perubahan.

1. **Bagian `import`.** Cari baris `import { cariPerangkat, semuaPerangkat } from "../services/gudang.ts";`, lalu ganti dengan lima baris ini:

   ```ts
   import { cariPerangkat } from "../services/gudang.ts";
   import { cabutPerangkat, daftarkanPerangkat, gantiKunciPerangkat, semuaPerangkatDb } from "../db/perangkat.ts";
   import type { BarisPerangkat } from "../db/perangkat.ts";
   import { buatKunci, hashKunci } from "../auth/kunci.ts";
   import { catatDicabut, catatTerdaftar, izinPerangkat } from "../services/daftar.ts";
   ```

   `semuaPerangkat` dari `gudang.ts` tidak dipakai lagi: daftar perangkat kini dibaca dari database, bukan dari memori yang hanya berisi perangkat yang pernah terdengar sejak backend menyala.

2. **Skema dan fungsi bantu.** Cari blok `const TitikRingkasan = z.object({ … });`. Tepat **di bawah** blok itu (sesudah baris `});`-nya), tambahkan:

   ```ts
   // Modul 21: satu baris daftar perangkat. kunci = keadaan kuncinya, bukan kuncinya (database tidak menyimpan kunci).
   const Perangkat = z.object({
     device_id: z.string(),
     nama: z.string().nullable(),
     lokasi: z.string().nullable(),
     jenis: Jenis,
     status: z.string().describe("online, offline, offline-mode, atau belum-diketahui (status MQTT terakhir)"),
     terakhir_dilihat: z.string().nullable().describe("waktu server saat pesan terakhir perangkat ini tiba"),
     kunci: z.enum(["aktif", "dicabut", "tanpa-kunci", "belum-terdaftar"])
       .describe("aktif = boleh mengirim data; tanpa-kunci = perangkat ESP-NOW lewat penghubung; belum-terdaftar = baris lama"),
     terdaftar: z.string().nullable().describe("kapan didaftarkan admin"),
     kunci_dibuat: z.string().nullable().describe("kapan kunci yang berlaku sekarang dibuat"),
     dicabut: z.string().nullable().describe("kapan kuncinya dicabut"),
     penghubung: z.string().nullable().describe("perangkat ESP-NOW: device_id yang menerbitkan datanya"),
   });
   const Registrasi = z.strictObject({
     device_id: DeviceId.describe("device_id perangkat (12 digit heksadesimal huruf kecil dari alamat MAC), misalnya a4cf12e5b7c0"),
     nama: z.string().min(1).max(60).optional().describe("nama yang mudah diingat, misalnya Node 1 ruang tamu"),
     lokasi: z.string().min(1).max(60).optional().describe("misalnya ruang tamu"),
     penghubung: DeviceId.optional()
       .describe("hanya untuk perangkat ESP-NOW (Node 2): device_id Node 1 yang menerbitkan datanya; perangkat ini tidak diberi kunci"),
   });
   const KunciBaru = z.object({
     device_id: z.string(),
     kunci: z.string().nullable().describe("43 huruf; HANYA ditampilkan sekali ini. null untuk perangkat ESP-NOW"),
     langkah: z.array(z.string()).describe("yang harus dilakukan berikutnya"),
   });
   const SALAH_DATABASE = "database sedang tidak bisa dihubungi, coba lagi sebentar lagi";

   const iso = (waktu: Date | null) => (waktu === null ? null : waktuKontrak(waktu));

   function tampilkan(b: BarisPerangkat) {
     const kunci = b.terdaftar === null ? "belum-terdaftar" as const
       : b.dicabut !== null ? "dicabut" as const
         : b.penghubung !== null ? "tanpa-kunci" as const : "aktif" as const;
     return {
       device_id: b.device_id, nama: b.nama, lokasi: b.lokasi, jenis: b.jenis, status: b.status,
       terakhir_dilihat: iso(b.terakhir_dilihat), kunci, terdaftar: iso(b.terdaftar), kunci_dibuat: iso(b.kunci_dibuat),
       dicabut: iso(b.dicabut), penghubung: b.penghubung,
     };
   }

   // petunjuk langkah berikutnya, supaya kunci langsung dipasang di perangkat dan di broker
   function langkahKunci(id: string): string[] {
     return ["Simpan kunci ini sekarang: kunci hanya tampil sekali ini (database hanya menyimpan sidik jarinya).",
       `Perangkat: ketik  kunci <kunci>  di Serial Monitor (simulator: KUNCI_${id.toUpperCase()}=<kunci> di alat/.env)`,
       `Broker: mosquitto_passwd <berkas sandi broker> ${id} di mesin broker, tempel kunci dua kali, lalu muat ulang broker`];
   }

   function langkahTanpaKunci(id: string, penghubung: string): string[] {
     return ["Perangkat ESP-NOW tanpa kunci. Pastikan tiga baris ini ada di berkas ACL broker, lalu restart broker:",
       `user ${penghubung}`, `topic write rpm/${id}/telemetry`, `topic write rpm/${id}/status`];
   }
   ```

   - **`Perangkat`** adalah bentuk satu baris jawaban `GET /devices`. Kolom **`kunci`** berisi **keadaan** kunci (`aktif`, `dicabut`, `tanpa-kunci`, atau `belum-terdaftar`), bukan kuncinya, karena backend memang tidak menyimpan kunci.
   - **`Registrasi`** memakai `z.strictObject`: kolom yang tidak dikenal, misalnya `"kunci"` yang ikut terkirim, membuat permintaan ditolak 400. Siapa pun yang mengirim permintaan tidak bisa memilih kuncinya sendiri: kunci selalu dibuat backend.
   - **`langkahKunci()`** dan **`langkahTanpaKunci()`** menulis petunjuk `langkah` yang ikut di jawaban, sesuai urutan modul ini: perangkat dulu, lalu broker.

3. **Rute.** Cari rute lama `app.get("/devices", { … });` (ringkasannya `Daftar semua perangkat yang pernah terdengar`). Ganti **seluruh blok rute itu**, dari `app.get("/devices", {` sampai `});` penutupnya, dengan:

   ```ts
     app.get("/devices", {
       schema: {
         tags: ["perangkat"],
         summary: "Daftar perangkat di database: yang terdaftar, yang dicabut, dan baris lama yang belum terdaftar",
         response: {
           200: z.array(Perangkat).describe("urut device_id; kunci dan sidik jarinya tidak pernah ikut"),
           503: Galat.describe("database sedang tidak bisa dihubungi"),
         },
       },
     }, async (req, reply) => {
       try {
         return (await semuaPerangkatDb()).map(tampilkan);
       } catch (galat) {
         req.log.error(`daftar perangkat gagal dibaca: ${(galat as Error).message}`);
         return reply.code(503).send({ pesan: SALAH_DATABASE });
       }
     });

     // ---- Modul 21: registrasi perangkat, ganti kunci, cabut kunci (hanya admin: satpam menolak viewer untuk POST) ----

     app.post("/devices", {
       schema: {
         tags: ["perangkat"],
         summary: "Daftarkan perangkat; kuncinya hanya ditampilkan SEKALI di jawaban ini",
         body: Registrasi,
         response: {
           201: KunciBaru.describe("perangkat terdaftar; simpan kuncinya sekarang"),
           409: Galat.describe("sudah terdaftar (pakai ganti kunci), atau penghubung tidak sah"),
           503: Galat.describe("database sedang tidak bisa dihubungi"),
         },
       },
     }, async (req, reply) => {
       const { device_id: id, nama, lokasi, penghubung } = req.body;
       if (penghubung !== undefined) { // perangkat ESP-NOW: tanpa kunci, datanya diterbitkan penghubungnya
         if (penghubung === id) return reply.code(409).send({ pesan: "penghubung tidak boleh perangkat itu sendiri" });
         if (izinPerangkat(penghubung) !== "terdaftar") {
           return reply.code(409).send({ pesan: `penghubung ${penghubung} belum terdaftar atau sudah dicabut; daftarkan Node 1 dulu` });
         }
       }
       const kunci = penghubung === undefined ? buatKunci() : null;
       try {
         const baris = await daftarkanPerangkat(id, nama ?? null, lokasi ?? null, penghubung ?? null,
           kunci === null ? null : hashKunci(kunci)); // database hanya menerima sidik jarinya
         if (baris === undefined) {
           return reply.code(409).send({ pesan: `${id} sudah terdaftar; untuk kunci baru pakai POST /devices/${id}/kunci` });
         }
         catatTerdaftar(id);
         req.log.info(`perangkat ${id} didaftarkan oleh akun ${req.user.sub}${penghubung === undefined ? "" : ` (lewat ${penghubung})`}`);
         const langkah = penghubung === undefined ? langkahKunci(id) : langkahTanpaKunci(id, penghubung);
         return reply.code(201).send({ device_id: id, kunci, langkah });
       } catch (galat) {
         req.log.error(`registrasi ${id} gagal: ${(galat as Error).message}`);
         return reply.code(503).send({ pesan: SALAH_DATABASE });
       }
     });

     app.post("/devices/:id/kunci", {
       schema: {
         tags: ["perangkat"],
         summary: "Buat kunci baru (kunci lama langsung tidak berlaku); juga menghidupkan lagi perangkat yang dicabut",
         params: ParamId,
         response: {
           200: KunciBaru.describe("kunci baru; simpan sekarang"),
           404: Galat.describe("perangkat belum terdaftar, atau perangkat ESP-NOW (tidak punya kunci)"),
           503: Galat.describe("database sedang tidak bisa dihubungi"),
         },
       },
     }, async (req, reply) => {
       const id = req.params.id;
       const kunci = buatKunci();
       try {
         const baris = await gantiKunciPerangkat(id, hashKunci(kunci));
         if (baris === undefined) return reply.code(404).send({ pesan: `${id} belum terdaftar, atau perangkat tanpa kunci (ESP-NOW)` });
         catatTerdaftar(id);
         req.log.info(`kunci baru untuk ${id} dibuat oleh akun ${req.user.sub}`);
         return { device_id: id, kunci, langkah: langkahKunci(id) };
       } catch (galat) {
         req.log.error(`ganti kunci ${id} gagal: ${(galat as Error).message}`);
         return reply.code(503).send({ pesan: SALAH_DATABASE });
       }
     });

     app.post("/devices/:id/cabut", {
       schema: {
         tags: ["perangkat"],
         summary: "Cabut kunci perangkat (hilang atau dicuri): backend tidak melayaninya lagi",
         params: ParamId,
         response: {
           200: z.object({ device_id: z.string(), dicabut: z.string(), langkah: z.array(z.string()) })
             .describe("dicabut; hapus juga akunnya dari broker"),
           404: Galat.describe("perangkat belum terdaftar atau sudah dicabut"),
           503: Galat.describe("database sedang tidak bisa dihubungi"),
         },
       },
     }, async (req, reply) => {
       const id = req.params.id;
       try {
         const baris = await cabutPerangkat(id);
         if (baris === undefined) return reply.code(404).send({ pesan: `${id} belum terdaftar atau sudah dicabut` });
         catatDicabut(id);
         req.log.warn(`kunci ${id} DICABUT oleh akun ${req.user.sub}`);
         return {
           device_id: id, dicabut: waktuKontrak(baris.dicabut ?? new Date()),
           langkah: baris.penghubung === null
             ? [`Hapus akunnya dari broker: mosquitto_passwd -D <berkas sandi broker> ${id}`,
               "Muat ulang broker (Pi: sudo systemctl reload mosquitto; laptop: Ctrl + C lalu jalankan lagi)"]
             : [`Hapus dua baris rpm/${id}/... dari blok user ${baris.penghubung} di berkas ACL broker, lalu restart broker`],
         };
       } catch (galat) {
         req.log.error(`cabut ${id} gagal: ${(galat as Error).message}`);
         return reply.code(503).send({ pesan: SALAH_DATABASE });
       }
     });
   ```

   - **`GET /devices`** kini membaca database dan menampilkan setiap baris lewat `tampilkan()`.
   - **`POST /devices`** membuat kunci (kecuali untuk perangkat ESP-NOW yang memakai `penghubung`), menyerahkan **sidik jarinya** ke database, lalu mengembalikan **kuncinya** di jawaban `201`. Kunci itu tidak disimpan di mana pun di backend: jawaban inilah satu-satunya tempat ia muncul.
   - **`POST /devices/:id/kunci`** dan **`POST /devices/:id/cabut`** dipakai di Praktik 7.
   - Ketiga rute `POST` itu tidak menulis kunci ke log. Log hanya mencatat siapa yang mendaftarkan, misalnya `perangkat a4cf12e5b7c0 didaftarkan oleh akun 1`.
   - Satpam Modul 20 tetap menjaga semuanya: tanpa *login* jawabannya 401, dan akun `viewer` yang mencoba `POST` dijawab 403. Tidak ada kode tambahan untuk itu.

#### 1.7 Muat buku tamu saat backend menyala: `src/server.ts` (3 menit)

Buka **`src/server.ts`**. Di bagian `import`, di bawah baris `import { databaseHidup } from "./db/arsip.ts";`, tambahkan:

```ts
import { semuaPerangkatDb } from "./db/perangkat.ts";
import { isiDaftar } from "./services/daftar.ts";
```

Lalu cari baris `mulaiRealtime(app);` (yang berkomentar `Modul 19: Socket.IO …`). Tepat di bawahnya, sebelum `mulaiMqtt(…)`, tambahkan:

```ts
// Modul 21: buku tamu perangkat terdaftar dimuat dari database. Kalau database belum bisa dihubungi, dicoba lagi setiap
// 10 detik (dicatat paling sering semenit sekali).
let percobaanDaftar = 0;
async function muatDaftarPerangkat(): Promise<void> {
  try {
    const jumlah = isiDaftar(await semuaPerangkatDb());
    app.log.info(`daftar perangkat dimuat: ${jumlah} perangkat terdaftar`);
  } catch (galat) {
    if (percobaanDaftar % 6 === 0) {
      app.log.error(`daftar perangkat belum bisa dimuat (${(galat as Error).message}); dicoba lagi setiap 10 detik`);
    }
    percobaanDaftar++;
    setTimeout(() => void muatDaftarPerangkat(), 10_000);
  }
}
await muatDaftarPerangkat();
```

Buku tamu dimuat **sebelum** backend tersambung ke broker, jadi pesan MQTT pertama sudah bisa diperiksa. Kalau database belum menyala, backend tetap jalan dan mencoba lagi setiap 10 detik; catatannya ditulis paling sering semenit sekali supaya log tidak penuh.

Simpan semua berkas. Di terminal pertama, `npm run dev` memulai ulang sendiri, dan log-nya kini memuat satu baris baru (**contoh**):

```text
[01:43:03] INFO: daftar perangkat dimuat: 0 perangkat terdaftar
```

`0` itu benar: perangkatmu belum ada yang didaftarkan.

#### 1.8 Lima permintaan Bruno (8 menit)

Minggu ini ada satu perangkat yang dipakai **semua pembaca**, di jalur mana pun: **perangkat latihan `f00d00000001`** dari simulator di folder `alat`. Ia menjadi perangkat percobaan untuk lapis kedua (Praktik 2) dan pencabutan kunci (Praktik 7), supaya Node 1-mu tidak perlu ikut dicabut.

Di Bruno, buka koleksi `backend/bruno` dan pilih *environment* **`lokal`**. Buat lima permintaan baru dengan cara yang sama seperti Modul 16–20: buka tab permintaan **`nyalakan lampu`**, klik kanan **tab**-nya → **Clone Request**, isi **Request Name**, lalu klik **Clone**.

1. **`daftarkan Node 1`**: URL `{{baseUrl}}/devices`, tab **Body** diganti dengan isi di bawah, dan di tab **Assert** nilai `res.status` diubah menjadi `201`. Ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu:

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "nama": "Node 1 ruang tamu",
     "lokasi": "ruang tamu"
   }
   ```

2. **`daftarkan Node 2 lewat Node 1`** (*clone* dari `daftarkan Node 1`): ganti **Body** dengan isi di bawah, memakai `device_id` Node 2 dan Node 1 milikmu.

   ```json
   {
     "device_id": "246f28b1c7d4",
     "nama": "Node 2 kebun",
     "lokasi": "kebun",
     "penghubung": "a4cf12e5b7c0"
   }
   ```

3. **`daftarkan perangkat latihan`** (*clone* dari `daftarkan Node 1`): ganti **Body** dengan isi di bawah. `device_id`-nya sama untuk semua pembaca, karena simulator selalu memakai `f00d00000001` untuk perangkat latihan pertamanya.

   ```json
   {
     "device_id": "f00d00000001",
     "nama": "Latihan ruang tamu",
     "lokasi": "ruang tamu"
   }
   ```

4. **`ganti kunci perangkat latihan`** (*clone* dari `daftarkan perangkat latihan`): URL `{{baseUrl}}/devices/f00d00000001/kunci`, di tab **Body** pilih **No Body**, dan nilai Assert `res.status` menjadi `200`.
5. **`cabut kunci perangkat latihan`** (*clone* dari `ganti kunci perangkat latihan`): URL `{{baseUrl}}/devices/f00d00000001/cabut`.

**Jangan kirim nomor 4 dan 5 sekarang.** Keduanya baru dipakai di Praktik 7.

#### 1.9 Daftarkan perangkatmu (10 menit)

1. Kirim **`login admin`**, lalu **`daftar perangkat`** (permintaan `GET /devices` dari Modul 16). **Hasilnya** (**contoh**, dipotong): semua perangkat lamamu muncul dengan `"kunci": "belum-terdaftar"`:

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "nama": null,
     "lokasi": null,
     "jenis": "node1",
     "status": "online",
     "terakhir_dilihat": "2026-10-22T10:52:31Z",
     "kunci": "belum-terdaftar",
     "terdaftar": null,
     "kunci_dibuat": null,
     "dicabut": null,
     "penghubung": null
   }
   ```

   Baris-baris itu dibuat otomatis oleh backend sejak Modul 17. Di laptop penulis, daftarnya juga memuat `beef00000001` (data uji beban Modul 18) serta `f00d00000001` dan `f00d00000002` (perangkat latihan simulator).

2. **Siapkan tempat menyimpan kunci sebelum mengirim.** Kunci hanya tampil sekali. Simpan di **pengelola sandimu**, tempat yang sama dengan sandi akun Modul 20, dengan nama yang jelas, misalnya `kunci broker a4cf12e5b7c0`. Kunci-kunci itu dipakai di Praktik 3 (perangkat) dan Praktik 4 (broker).
3. **Jalur perangkat:** kirim **`daftarkan Node 1`**. **Hasilnya:** `201 Created`, dengan isi (**contoh**; kuncinya pakai kunci contoh modul ini, yang tidak berlaku di mana pun):

   ```json
   {
     "device_id": "a4cf12e5b7c0",
     "kunci": "J2BPlozrp88Z-rmVr2EnhfJkgOxAY3xxGYzVSjQejOE",
     "langkah": [
       "Simpan kunci ini sekarang: kunci hanya tampil sekali ini (database hanya menyimpan sidik jarinya).",
       "Perangkat: ketik  kunci <kunci>  di Serial Monitor (simulator: KUNCI_A4CF12E5B7C0=<kunci> di alat/.env)",
       "Broker: mosquitto_passwd <berkas sandi broker> a4cf12e5b7c0 di mesin broker, tempel kunci dua kali, lalu muat ulang broker"
     ]
   }
   ```

   **Salin kuncinya sekarang** (klik dua kali di dalam teks kunci di panel jawaban, lalu **Ctrl + C**) ke pengelola sandimu. Kalau telanjur hilang sebelum dipasang, tidak apa-apa: buat kunci baru dengan permintaan seperti `ganti kunci perangkat latihan`, tetapi dengan URL `{{baseUrl}}/devices/<device_id>/kunci` milik perangkat itu. Kunci lama langsung tidak berlaku.
4. **Jalur perangkat:** kirim **`daftarkan Node 2 lewat Node 1`**. **Hasilnya:** `201 Created`, dengan `"kunci": null` dan tiga baris daftar izin:

   ```json
   {
     "device_id": "246f28b1c7d4",
     "kunci": null,
     "langkah": [
       "Perangkat ESP-NOW tanpa kunci. Pastikan tiga baris ini ada di berkas ACL broker, lalu restart broker:",
       "user a4cf12e5b7c0",
       "topic write rpm/246f28b1c7d4/telemetry",
       "topic write rpm/246f28b1c7d4/status"
     ]
   }
   ```

   Ketiga baris itu dipakai di Praktik 5. Kalau Node 1 belum didaftarkan, permintaan ini ditolak 409: `penghubung … belum terdaftar atau sudah dicabut; daftarkan Node 1 dulu`.
5. **Semua jalur:** kirim **`daftarkan perangkat latihan`**, lalu simpan kuncinya juga, misalnya dengan nama `kunci broker f00d00000001`. Jawabannya sama bentuknya dengan nomor 3; baris keduanya kini menyebut `KUNCI_F00D00000001=<kunci> di alat/.env`, tempat kunci ini dipasang di Praktik 3.
6. Kirim **`daftarkan perangkat latihan`** sekali lagi. **Hasilnya:** `409 Conflict`:

   ```json
   {"pesan":"f00d00000001 sudah terdaftar; untuk kunci baru pakai POST /devices/f00d00000001/kunci"}
   ```

   Pendaftaran ulang sengaja ditolak, supaya tidak ada yang bisa "mendaftarkan ulang" perangkatmu untuk mendapat kunci baru diam-diam. Tab **Tests** memang menulis satu Assert gagal (`expected 409 to equal 201`), dan itu hasil yang kita harapkan.
7. Coba sebagai tamu: kirim **`login viewer`**, lalu `daftarkan perangkat latihan`. **Hasilnya:** `403 Forbidden` dengan pesan satpam Modul 20, `akun viewer hanya boleh melihat; perintah dan perubahan khusus admin`. Kirim lagi **`login admin`** sesudahnya.
8. Kirim **`daftar perangkat`** sekali lagi. Perangkat yang kamu daftarkan kini `"kunci": "aktif"`, dengan `terdaftar` dan `kunci_dibuat` terisi. Node 2 (jalur perangkat) `"jenis": "node2"`, `"kunci": "tanpa-kunci"`, dan `"penghubung": "a4cf12e5b7c0"`. Perangkat yang tidak kamu daftarkan, misalnya `f00d00000002`, tetap `belum-terdaftar`.

Log backend di terminal pertama mencatat semuanya (**contoh** dari laptop penulis, yang sengaja mengirim `daftarkan Node 1` dua kali; baris untuk perangkat latihan tidak ditampilkan):

```text
[01:46:21] INFO: perangkat a4cf12e5b7c0 didaftarkan oleh akun 1
[01:46:21] INFO: POST /devices -> 201 (42 ms)
[01:46:21] INFO: perangkat 246f28b1c7d4 didaftarkan oleh akun 1 (lewat a4cf12e5b7c0)
[01:46:21] INFO: POST /devices -> 201 (208 ms)
[01:46:21] INFO: POST /devices -> 409 (44 ms)
[01:47:32] WARN: ditolak (403): akun 2 (viewer) mencoba POST /devices
[01:47:32] INFO: POST /devices -> 403 (1 ms)
```

Tidak ada satu baris pun yang memuat kunci. Itulah yang kita mau.

> [!NOTE]
> **Kalau `device_id`-mu salah ketik**, misalnya huruf besar, jawabannya `400` dengan pesan `body/device_id device_id harus 12 digit heksadesimal huruf kecil`. Kalau kamu iseng menambahkan kolom `"kunci"` ke isi permintaan, jawabannya `400` dengan pesan ``body/ Kunci tidak dikenali : "kunci"``. Kata "Kunci" di pesan itu berasal dari Zod dan artinya "kolom JSON", bukan kunci perangkat: Zod menolak kolom `kunci` yang tidak dikenal (`z.strictObject`), karena kunci selalu dibuat backend.

#### 1.10 Tes dan simpan ke cabang (7 menit)

Ada tiga berkas tes baru. Dua yang pertama pendek. Klik kanan folder **`backend/src/auth`** → **New File…**, beri nama **`kunci.test.ts`**, lalu ketik:

```ts
// kunci.test.ts - unit test kunci perangkat (Modul 21): bentuk kunci, sidik jari SHA-256, dan pencocokan waktu-konstan.
// Tanpa database dan tanpa broker. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { Kunci, buatKunci, cocokkanKunci, hashKunci } from "./kunci.ts";

describe("kunci perangkat", () => {
  it("43 huruf base64url, lolos skema Kunci, dan tidak pernah sama", () => {
    const a = buatKunci();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Kunci.safeParse(a).success).toBe(true);
    const banyak = new Set(Array.from({ length: 1000 }, () => buatKunci()));
    expect(banyak.size).toBe(1000);
  });
  it("skema Kunci menolak kunci yang terpotong atau berisi huruf lain", () => {
    expect(Kunci.safeParse("a".repeat(42)).success).toBe(false);
    expect(Kunci.safeParse("a".repeat(42) + "=").success).toBe(false); // base64 biasa, bukan base64url
    expect(Kunci.safeParse(" " + "a".repeat(42)).success).toBe(false); // spasi ikut tertempel
  });
  it("sidik jari = SHA-256 heksadesimal 64 huruf, selalu sama untuk kunci yang sama", () => {
    expect(hashKunci("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const k = buatKunci();
    expect(hashKunci(k)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashKunci(k)).toBe(hashKunci(k));
    expect(hashKunci(k)).not.toContain(k);
  });
  it("cocokkanKunci: kunci benar cocok, kunci lain tidak, perangkat tanpa kunci (dicabut) tidak pernah cocok", () => {
    const k = buatKunci();
    const sidik = hashKunci(k);
    expect(cocokkanKunci(k, sidik)).toBe(true);
    expect(cocokkanKunci(buatKunci(), sidik)).toBe(false);
    expect(cocokkanKunci(k.slice(0, 42) + (k.endsWith("A") ? "B" : "A"), sidik)).toBe(false); // beda satu huruf terakhir
    expect(cocokkanKunci(k, null)).toBe(false);
  });
});
```

Lalu klik kanan folder **`backend/src/services`** → **New File…**, beri nama **`daftar.test.ts`**, lalu ketik:

```ts
// daftar.test.ts - unit test buku tamu perangkat (Modul 21): siapa yang terdaftar dan siapa yang sudah dicabut.
// Tanpa database dan tanpa broker. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { catatDicabut, catatTerdaftar, isiDaftar, izinPerangkat, nilaiIzin } from "./daftar.ts";

describe("buku tamu perangkat", () => {
  it("keputusan murni: belum dimuat, belum terdaftar, terdaftar, dicabut", () => {
    expect(nilaiIzin(false, { dicabut: false })).toBe("belum-dimuat"); // database belum terbaca: jangan percaya siapa pun
    expect(nilaiIzin(true, undefined)).toBe("belum-terdaftar");
    expect(nilaiIzin(true, { dicabut: false })).toBe("terdaftar");
    expect(nilaiIzin(true, { dicabut: true })).toBe("dicabut");
  });
  it("daftar dari database: baris lama tanpa tanggal terdaftar tetap dianggap belum terdaftar", () => {
    const sekarang = new Date();
    const jumlah = isiDaftar([
      { device_id: "a4cf12e5b7c0", terdaftar: sekarang, dicabut: null },
      { device_id: "f00d00000001", terdaftar: null, dicabut: null }, // dibuat otomatis Modul 17-20
      { device_id: "c0ba00000001", terdaftar: sekarang, dicabut: sekarang },
    ]);
    expect(jumlah).toBe(2);
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
    expect(izinPerangkat("f00d00000001")).toBe("belum-terdaftar");
    expect(izinPerangkat("c0ba00000001")).toBe("dicabut");
    catatDicabut("a4cf12e5b7c0"); // POST /devices/:id/cabut
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("dicabut");
    catatTerdaftar("a4cf12e5b7c0"); // POST /devices/:id/kunci menghidupkan lagi
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
  });
});
```

Berkas ketiga, **`src/routes/perangkat.test.ts`**, menguji keempat rute **tanpa database**: tabel `devices` diganti tabel tiruan di memori dengan `vi.mock`, dan Fastify dijalankan tanpa jaringan dengan `app.inject`. Tesnya 149 baris, jadi boleh disalin langsung dari [berkas kode modul ini](kode/backend/src/routes/perangkat.test.ts) (klik ikon **Copy raw file** di GitHub), lalu ditempel ke berkas baru `backend/src/routes/perangkat.test.ts`.

<details>
<summary>Isi lengkap <code>src/routes/perangkat.test.ts</code></summary>

```ts
// perangkat.test.ts - uji rute daftar resmi perangkat (Modul 21) TANPA database: tabel devices diganti tiruan di memori
// (vi.mock), server Fastify dijalankan tanpa jaringan (app.inject). Yang diuji: kunci tampil sekali, yang tersimpan hanya
// sidik jarinya, registrasi ganda ditolak, ganti kunci, cabut, perangkat ESP-NOW tanpa kunci. Satpam login (Modul 20) tidak
// ikut dipasang di sini: 401 dan 403 sudah dijaga keamanan.ts untuk SEMUA rute. Jalankan: npm test
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
});

// tabel devices tiruan: device_id -> baris (termasuk kunci_hash, yang di database sungguhan juga ada)
const tabel = vi.hoisted(() => new Map<string, Record<string, unknown>>());
vi.mock("../db/perangkat.ts", () => {
  const KOSONG = { jenis: "belum-diketahui", nama: null, lokasi: null, status: "belum-diketahui", terakhir_dilihat: null,
    terdaftar: null, kunci_hash: null, kunci_dibuat: null, dicabut: null, penghubung: null };
  const tanpaHash = (b: Record<string, unknown>) => { const { kunci_hash: _, ...sisa } = b; return sisa; };
  return {
    semuaPerangkatDb: async () => [...tabel.values()].map(tanpaHash),
    daftarkanPerangkat: async (id: string, nama: string | null, lokasi: string | null, penghubung: string | null,
      kunciHash: string | null) => {
      const lama = tabel.get(id);
      if (lama?.terdaftar) return undefined;
      const baru = { ...KOSONG, ...lama, device_id: id, nama: nama ?? lama?.nama ?? null, lokasi, penghubung,
        jenis: penghubung ? "node2" : (lama?.jenis ?? "belum-diketahui"), terdaftar: new Date(), kunci_hash: kunciHash,
        kunci_dibuat: kunciHash ? new Date() : null, dicabut: null };
      tabel.set(id, baru);
      return tanpaHash(baru);
    },
    gantiKunciPerangkat: async (id: string, kunciHash: string) => {
      const b = tabel.get(id);
      if (!b?.terdaftar || b.penghubung) return undefined;
      Object.assign(b, { kunci_hash: kunciHash, kunci_dibuat: new Date(), dicabut: null });
      return tanpaHash(b);
    },
    cabutPerangkat: async (id: string) => {
      const b = tabel.get(id);
      if (!b?.terdaftar || b.dicabut) return undefined;
      Object.assign(b, { kunci_hash: null, kunci_dibuat: null, dicabut: new Date() });
      return tanpaHash(b);
    },
  };
});

import Fastify from "fastify";
import type { LightMyRequestResponse } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { rutePerangkat } from "./perangkat.ts";
import { isiDaftar, izinPerangkat } from "../services/daftar.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
// pengganti satpam: setiap permintaan dianggap datang dari akun admin nomor 1
app.addHook("onRequest", async (req) => {
  req.user = { sub: "1", peran: "admin", sid: 1, iat: 0, exp: 0 };
});
await app.register(rutePerangkat);

const sha256 = (teks: string) => createHash("sha256").update(teks).digest("hex");
const post = (url: string, body?: object): Promise<LightMyRequestResponse> =>
  app.inject({ method: "POST", url, ...(body === undefined ? {} : { payload: body }) });

beforeAll(() => {
  // satu baris lama dari Modul 17-20 (dibuat otomatis, belum terdaftar), lalu daftar di memori dimuat seperti saat server mulai
  tabel.set("a4cf12e5b7c0", { device_id: "a4cf12e5b7c0", jenis: "node1", nama: null, lokasi: null, status: "online",
    terakhir_dilihat: new Date(), terdaftar: null, kunci_hash: null, kunci_dibuat: null, dicabut: null, penghubung: null });
  isiDaftar([...tabel.values()] as never);
});
afterAll(() => app.close());

describe("daftar resmi perangkat", () => {
  let kunciPertama = "";

  it("baris lama belum terdaftar: GET /devices menandainya belum-terdaftar", async () => {
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("belum-terdaftar");
    const jawab = await app.inject({ method: "GET", url: "/devices" });
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json()[0]).toMatchObject({ device_id: "a4cf12e5b7c0", kunci: "belum-terdaftar", terdaftar: null });
  });

  it("POST /devices: 201, kunci 43 huruf tampil SEKALI, database hanya menyimpan SHA-256-nya", async () => {
    const jawab = await post("/devices", { device_id: "a4cf12e5b7c0", nama: "Node 1 ruang tamu" });
    expect(jawab.statusCode).toBe(201);
    const isi = jawab.json();
    expect(isi.kunci).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(isi.langkah.length).toBe(3);
    kunciPertama = isi.kunci;
    expect(tabel.get("a4cf12e5b7c0")?.kunci_hash).toBe(sha256(kunciPertama));
    expect(JSON.stringify([...tabel.values()])).not.toContain(kunciPertama);
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
  });

  it("GET /devices tidak pernah memuat kunci maupun sidik jarinya", async () => {
    const teks = (await app.inject({ method: "GET", url: "/devices" })).body;
    expect(teks).not.toContain(kunciPertama);
    expect(teks).not.toContain(sha256(kunciPertama));
    expect(teks).not.toContain("kunci_hash");
    expect(JSON.parse(teks)[0]).toMatchObject({ kunci: "aktif", nama: "Node 1 ruang tamu" });
  });

  it("registrasi kedua untuk device_id yang sama: 409", async () => {
    const jawab = await post("/devices", { device_id: "a4cf12e5b7c0" });
    expect(jawab.statusCode).toBe(409);
    expect(jawab.json().pesan).toContain("sudah terdaftar");
  });

  it("isi yang tidak sah: 400 (device_id huruf besar, kolom asing)", async () => {
    expect((await post("/devices", { device_id: "A4CF12E5B7C0" })).statusCode).toBe(400);
    expect((await post("/devices", { device_id: "a4cf12e5b7c1", kunci: "pilihan-sendiri" })).statusCode).toBe(400);
  });

  it("ganti kunci: kunci baru berbeda, sidik jari kunci lama langsung terhapus", async () => {
    const jawab = await post("/devices/a4cf12e5b7c0/kunci");
    expect(jawab.statusCode).toBe(200);
    const baru = jawab.json().kunci as string;
    expect(baru).not.toBe(kunciPertama);
    expect(tabel.get("a4cf12e5b7c0")?.kunci_hash).toBe(sha256(baru));
  });

  it("perangkat ESP-NOW (Node 2): tanpa kunci, penghubung wajib terdaftar, jawaban berisi baris ACL", async () => {
    expect((await post("/devices", { device_id: "246f28b1c7d4", penghubung: "0123456789ab" })).statusCode).toBe(409);
    const jawab = await post("/devices", { device_id: "246f28b1c7d4", nama: "Node 2 kebun", penghubung: "a4cf12e5b7c0" });
    expect(jawab.statusCode).toBe(201);
    expect(jawab.json().kunci).toBeNull();
    expect(jawab.json().langkah).toContain("topic write rpm/246f28b1c7d4/telemetry");
    expect((await post("/devices/246f28b1c7d4/kunci")).statusCode).toBe(404); // perangkat ESP-NOW tidak punya kunci
  });

  it("cabut: 200, buku tamu langsung mencatat dicabut, cabut kedua 404, sidik jarinya terhapus", async () => {
    expect((await post("/devices", { device_id: "f00d00000001" })).statusCode).toBe(201);
    const jawab = await post("/devices/f00d00000001/cabut");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.json().dicabut).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    expect(izinPerangkat("f00d00000001")).toBe("dicabut");
    expect(tabel.get("f00d00000001")?.kunci_hash).toBeNull();
    expect((await post("/devices/f00d00000001/cabut")).statusCode).toBe(404);
    const daftar = (await app.inject({ method: "GET", url: "/devices" })).json();
    expect(daftar.find((p: { device_id: string }) => p.device_id === "f00d00000001").kunci).toBe("dicabut");
  });

  it("perangkat yang dicabut bisa dihidupkan lagi dengan kunci baru", async () => {
    const jawab = await post("/devices/f00d00000001/kunci");
    expect(jawab.statusCode).toBe(200);
    expect(izinPerangkat("f00d00000001")).toBe("terdaftar");
  });
});
```

</details>

Yang diuji ketiga berkas itu: kunci selalu 43 huruf dan tidak pernah sama, sidik jarinya SHA-256, kunci yang beda satu huruf ditolak, baris lama dianggap belum terdaftar, database hanya menerima sidik jari, pendaftaran ulang ditolak 409, ganti kunci membuat kunci lama tidak berlaku, dan Node 2 tidak mendapat kunci. Jalankan di terminal kedua:

```text
npm run cek
npm test
```

**Hasilnya:** `npm run cek` selesai tanpa pesan galat, dan `npm test` menulis (**contoh**, bagian akhir):

```text
 RUN  v5.0.5 C:/…/rumah-pintar-mini/backend

 ✓ src/auth/kunci.test.ts (4 tests) 18ms
 ✓ src/aturan/mesin.test.ts (11 tests) 23ms
 ✓ src/services/daftar.test.ts (2 tests) 6ms
 ✓ src/auth/auth.test.ts (7 tests) 2645ms
   ✓ sidik jari sandi (bcrypt) (2)
     ✓ sandi benar cocok, sandi salah tidak, dan sidik jari selalu berbeda (garam acak) 1612ms
     ✓ akun tidak ada (sidik jari kosong): hasilnya false, bukan galat 1020ms
 ✓ src/routes/perangkat.test.ts (9 tests) 486ms
   ✓ daftar resmi perangkat (9)
     ✓ baris lama belum terdaftar: GET /devices menandainya belum-terdaftar 325ms

 Test Files  5 passed (5)
      Tests  33 passed (33)
   Start at  01:52:43
   Duration  8.51s (import 39%, transform 37%, tests 23%)
```

Dari 18 tes menjadi **33**. Simpan pekerjaanmu ke cabang:

```text
git add migrasi/010_kunci_perangkat.sql src/auth/kunci.ts src/auth/kunci.test.ts src/db/perangkat.ts src/services/daftar.ts src/services/daftar.test.ts src/routes/perangkat.ts src/routes/perangkat.test.ts src/server.ts "bruno/daftarkan Node 1.yml" "bruno/daftarkan Node 2 lewat Node 1.yml" "bruno/daftarkan perangkat latihan.yml" "bruno/ganti kunci perangkat latihan.yml" "bruno/cabut kunci perangkat latihan.yml"
git status
git commit -m "Daftar resmi perangkat: migrasi 010, kunci per perangkat, POST /devices (Modul 21 Praktik 1)"
```

Nama berkas Bruno yang mengandung spasi diapit petik ganda. `git status` di tengah menunjukkan apa yang akan di-*commit*; tidak ada kunci di berkas mana pun, karena kunci hanya ada di jawaban yang sudah kamu salin ke pengelola sandi.

> ⬆️ **Selesai Praktik 1?** Baca [Konsep 4](#4-lapis-kedua-backend-hanya-mendengarkan-perangkat-terdaftar) kalau belum, lalu lanjut ke [Praktik 2 — Lapis kedua dan akun broker untuk backend](#praktik-2--lapis-kedua-dan-akun-broker-untuk-backend-45-menit).

### Praktik 2 — Lapis kedua dan akun broker untuk backend (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, terminal kedua di folder `backend` untuk perintah lain, terminal ketiga di folder `alat` untuk simulator dan terminal kecil) dan **Bruno**.

Praktik ini memasang **lapis kedua** (Konsep 4): backend berhenti membuat baris `devices` otomatis dan mengabaikan pesan dari perangkat yang belum terdaftar atau kuncinya sudah dicabut. Backend juga mendapat **akun broker** sendiri di `.env`. Broker masih terbuka, jadi akun itu belum diperiksa siapa pun; ia baru penting di Praktik 4.

#### 2.1 Berhenti membuat baris `devices` otomatis: `src/db/arsip.ts` (3 menit)

Buka **`src/db/arsip.ts`**. Cari fungsi `catatPerangkat` (diawali komentar `// Pastikan perangkat punya baris di tabel devices …`), lalu ganti komentar dan seluruh fungsinya dengan:

```ts
// Perbarui jenis, status, dan waktu terakhir terdengar perangkat. Modul 21: baris devices TIDAK lagi dibuat otomatis; hanya
// perangkat terdaftar (POST /devices) yang pesannya sampai ke sini (lapis kedua di mqtt.ts). Kolom yang tidak diberikan
// (null) tidak menimpa isi lama, berkat coalesce.
async function catatPerangkat(deviceId: string, jenis: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `UPDATE devices SET
       jenis = coalesce($2, jenis),
       status = coalesce($3, status),
       terakhir_dilihat = now()
     WHERE device_id = $1`,
    [deviceId, jenis, status],
  );
}
```

`INSERT … ON CONFLICT` diganti `UPDATE … WHERE device_id = $1`. Kalau `device_id` itu tidak ada di tabel, `UPDATE` tidak mengubah apa pun dan tidak membuat baris baru. Mulai sekarang, baris `devices` hanya lahir dari `POST /devices`.

#### 2.2 Catatan "DIABAIKAN" yang tidak membanjir: `src/services/daftar.ts` (5 menit)

Perangkat yang belum terdaftar tetap mengirim `telemetry` setiap 10 detik. Kalau setiap pesan dicatat, log backend tenggelam. Buka **`src/services/daftar.ts`**, lalu ganti seluruh isinya dengan:

```ts
// daftar.ts - "buku tamu" perangkat di memori (Modul 21): siapa yang terdaftar dan siapa yang sudah dicabut.
// Isinya dimuat dari tabel devices saat server mulai, lalu diperbarui rute registrasi, ganti kunci, dan cabut, jadi backend
// tidak perlu bertanya ke database untuk setiap pesan.
// Buku tamu ini LAPIS KEDUA: broker (password file + ACL) adalah lapis pertama. Kalau broker lupa dimuat ulang setelah
// sebuah kunci dicabut, atau berkas sandi broker dan database tidak sama, backend tetap mengabaikan pesan perangkat yang
// tidak berhak (mqtt.ts) dan tidak mengirim perintah kepadanya (perintah.ts).
import type { FastifyBaseLogger } from "fastify";
import type { BarisPerangkat } from "../db/perangkat.ts";

export type Izin = "terdaftar" | "belum-terdaftar" | "dicabut" | "belum-dimuat";

interface Catatan {
  dicabut: boolean;
}

const daftar = new Map<string, Catatan>(); // hanya perangkat yang terdaftar (aktif atau dicabut)
let termuat = false;

// keputusan murni (diuji Vitest): boleh tidaknya sebuah perangkat dilayani
export function nilaiIzin(sudahDimuat: boolean, catatan: Catatan | undefined): Izin {
  if (!sudahDimuat) return "belum-dimuat"; // daftar belum terbaca dari database: jangan percaya siapa pun dulu
  if (catatan === undefined) return "belum-terdaftar";
  return catatan.dicabut ? "dicabut" : "terdaftar";
}

export function izinPerangkat(deviceId: string): Izin {
  return nilaiIzin(termuat, daftar.get(deviceId));
}

export function isiDaftar(baris: Pick<BarisPerangkat, "device_id" | "terdaftar" | "dicabut">[]): number {
  daftar.clear();
  for (const b of baris) if (b.terdaftar !== null) daftar.set(b.device_id, { dicabut: b.dicabut !== null });
  termuat = true;
  return daftar.size;
}

export function catatTerdaftar(deviceId: string): void {
  daftar.set(deviceId, { dicabut: false });
}

export function catatDicabut(deviceId: string): void {
  daftar.set(deviceId, { dicabut: true });
}

// ---- pesan yang diabaikan: dicatat di log, tetapi paling sering sekali semenit per perangkat (perangkat yang belum
// terdaftar mengirim telemetry setiap 10 detik; log tidak boleh tenggelam karenanya) ----
export const JEDA_LOG_MS = 60_000;
const terakhirDicatat = new Map<string, { waktu: number; terlewat: number }>();

const ALASAN: Record<Exclude<Izin, "terdaftar">, string> = {
  "belum-terdaftar": "belum terdaftar (daftarkan dulu lewat POST /devices)",
  "dicabut": "kuncinya sudah dicabut",
  "belum-dimuat": "daftar perangkat belum terbaca dari database",
};

// Hasilnya kalimat log, atau null kalau masih dalam jeda (logika murni, diuji Vitest)
export function kalimatAbaikan(topik: string, deviceId: string, izin: Exclude<Izin, "terdaftar">, sekarang: number): string | null {
  const catatan = terakhirDicatat.get(deviceId);
  if (catatan !== undefined && sekarang - catatan.waktu < JEDA_LOG_MS) {
    catatan.terlewat++;
    return null;
  }
  const tambahan = catatan !== undefined && catatan.terlewat > 0 ? ` (+${catatan.terlewat} pesan lain sejak catatan terakhir)` : "";
  terakhirDicatat.set(deviceId, { waktu: sekarang, terlewat: 0 });
  return `DIABAIKAN ${topik}: ${deviceId} ${ALASAN[izin]}${tambahan}`;
}

export function catatAbaikan(topik: string, deviceId: string, izin: Exclude<Izin, "terdaftar">, log: FastifyBaseLogger): void {
  const kalimat = kalimatAbaikan(topik, deviceId, izin, Date.now());
  if (kalimat !== null) log.warn(kalimat);
}
```

Yang baru ada di bagian bawah:

- **`kalimatAbaikan()`** adalah fungsi murni yang menulis kalimat log, misalnya `DIABAIKAN rpm/f00d00000002/status: f00d00000002 belum terdaftar (daftarkan dulu lewat POST /devices)`. Untuk perangkat yang sama, kalimat berikutnya baru ditulis **semenit kemudian**, ditambah jumlah pesan yang terlewat, misalnya `(+5 pesan lain sejak catatan terakhir)`. Selama jeda itu, hasilnya `null`.
- **`catatAbaikan()`** meneruskan kalimat itu ke log sebagai peringatan (`WARN`).
- Komentar di kepala berkas menjelaskan bahwa buku tamu ini adalah **lapis kedua**; lapis pertamanya broker.

#### 2.3 Lapis kedua dan akun broker: `src/services/mqtt.ts` (12 menit)

Buka **`src/services/mqtt.ts`**. Ada tiga perubahan.

1. Di bawah baris `import { kabari, kabariStatus } from "./telegram.ts";`, tambahkan:

   ```ts
   import { catatAbaikan, izinPerangkat } from "./daftar.ts";
   ```

2. Ganti **seluruh fungsi `mulaiMqtt`**, dari baris `export function mulaiMqtt(url: string, log: FastifyBaseLogger): void {` sampai kurung kurawal `}` penutupnya, dengan:

   ```ts
   const JEDA_BIASA_MS = 5000; // broker mati atau jaringan putus: coba lagi setiap 5 detik (seperti perangkat, kontrak bagian 3)
   const JEDA_DITOLAK_MS = 60_000; // Modul 21: broker MENOLAK akun backend: coba lagi pelan-pelan, supaya log broker tidak banjir

   // Modul 21: akun broker milik backend sendiri (bukan akun perangkat, bukan akun manusia), dari MQTT_USERNAME/MQTT_PASSWORD
   export interface AkunBroker {
     username: string;
     password: string;
   }

   export function mulaiMqtt(url: string, akun: AkunBroker | null, log: FastifyBaseLogger): void {
     const idKlien = "backend-" + Math.random().toString(16).slice(2, 8); // nama unik; broker berkunci memakai nama akunnya
     klien = mqtt.connect(url, {
       clientId: idKlien,
       reconnectPeriod: JEDA_BIASA_MS,
       ...(akun === null ? {} : { username: akun.username, password: akun.password }),
       reconnectOnConnackError: true, // Modul 21: tanpa ini, sekali ditolak broker = berhenti mencoba selamanya
     });
     let ditolak = false; // sedang ditolak broker? (supaya pesan panjangnya hanya ditulis sekali)
     klien.on("connect", () => {
       if (klien !== undefined) klien.options.reconnectPeriod = JEDA_BIASA_MS;
       ditolak = false;
       log.info(`tersambung ke broker ${url}${akun === null ? " TANPA akun" : ` sebagai ${akun.username}`}`);
       klien?.subscribe("rpm/#", { qos: 1 });
       kirimSemuaConfig(); // Modul 19: broker tanpa persistence lupa config retained saat dimulai ulang (kontrak aturan 10)
     });
     klien.on("reconnect", () => {
       if (!ditolak) log.warn(`broker belum terjangkau, mencoba lagi dalam ${JEDA_BIASA_MS / 1000} detik`);
     });
     klien.on("error", (galat) => {
       const kode = (galat as Error & { code?: number }).code;
       if (kode === 4 || kode === 5 || kode === 134 || kode === 135) { // CONNACK: akun ditolak (MQTT 3.1.1 dan MQTT 5)
         if (klien !== undefined) klien.options.reconnectPeriod = JEDA_DITOLAK_MS;
         if (!ditolak) {
           log.error(`broker MENOLAK backend (${galat.message}, kode ${kode}): ` + (akun === null
             ? "backend masuk tanpa akun, padahal broker sudah dikunci; isi MQTT_USERNAME dan MQTT_PASSWORD di .env"
             : `periksa MQTT_USERNAME dan MQTT_PASSWORD di .env, akun "${akun.username}" di password file broker `
               + "(mosquitto_passwd), lalu muat ulang broker")
             + `. Dicoba lagi setiap ${JEDA_DITOLAK_MS / 1000} detik.`);
         }
         ditolak = true;
         return;
       }
       log.error(`galat MQTT: ${galat.message}`);
     });
     // paket.retain = true: pesan lama yang disimpan broker, dikirim ulang karena backend baru berlangganan (Modul 19)
     klien.on("message", (topik, isi, paket) => terima(topik, isi.toString(), paket.retain, log));
   }
   ```

   - **`AkunBroker`** adalah nama pengguna dan sandi milik backend sendiri. Backend punya akun broker yang terpisah dari akun perangkat dan dari akun manusia di tabel `users` (Konsep 6).
   - `...(akun === null ? {} : { username: …, password: … })` menambahkan nama pengguna dan sandi hanya kalau akunnya ada.
   - **`reconnectOnConnackError: true`** sangat penting. Tanpa baris ini, pustaka `mqtt` berhenti mencoba menyambung **untuk selamanya** setelah sekali ditolak broker. Backend akan diam: `/health` menulis `broker: false` sampai kamu menjalankannya ulang, walaupun akunnya sudah kamu perbaiki di broker.
   - Kalau broker menjawab kode **5** (atau 4, 134, 135; empat bentuk "akun ditolak" di MQTT 3.1.1 dan MQTT 5), backend menulis satu pesan galat yang jelas, lalu mencoba lagi **setiap 60 detik**, bukan setiap 5 detik. Setelah tersambung lagi, jedanya kembali 5 detik.

3. Cari fungsi `terima`. Tepat di bawah baris `if (jenis === "cmd") return; // perintah …`, tambahkan:

   ```ts
     // Modul 21, lapis kedua: hanya perangkat yang terdaftar dan kuncinya belum dicabut yang datanya diproses
     const izin = izinPerangkat(deviceId);
     if (izin !== "terdaftar") {
       hitungan.diabaikan++;
       return catatAbaikan(topik, deviceId, izin, log);
     }
   ```

   Inilah lapis kedua. Pemeriksaannya ada **sebelum** pemeriksaan kontrak, gudang, arsip, Socket.IO, aturan otomatis, dan Telegram, jadi pesan perangkat yang tidak berhak tidak menyentuh semua itu.

#### 2.4 Hitungan `diabaikan` di `/health` (3 menit)

1. Buka **`src/services/gudang.ts`**. Ganti baris `export const hitungan = { diterima: 0, ditolak: 0 };` dengan:

   ```ts
   export const hitungan = { diterima: 0, ditolak: 0, diabaikan: 0 }; // Modul 21: diabaikan = pengirim belum terdaftar/dicabut
   ```

2. Buka **`src/routes/kesehatan.ts`**, lalu ganti seluruh isinya dengan:

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
         security: [], // Modul 20: tetap terbuka tanpa login (pemantau dan Docker healthcheck tidak bisa login)
         summary: "Keadaan server: hidup, tersambung ke broker dan database, serta jumlah pesan",
         response: {
           200: z.object({ ok: z.boolean(), broker: z.boolean(), database: z.boolean(), diterima: z.number(), ditolak: z.number(),
             diabaikan: z.number().describe("Modul 21: pesan dari perangkat yang belum terdaftar atau sudah dicabut") })
             .describe("server hidup; broker dan database = bisa dihubungi atau tidak"),
         },
       },
     }, async () => {
       return { ok: true, broker: brokerTersambung(), database: await databaseHidup(), diterima: hitungan.diterima, ditolak: hitungan.ditolak,
         diabaikan: hitungan.diabaikan };
     });
   };
   ```

   `GET /health` tetap terbuka tanpa *login* (Modul 20), dan kini juga menyebut berapa pesan yang diabaikan.

#### 2.5 Perintah hanya untuk perangkat yang berhak: `src/services/perintah.ts` (3 menit)

Buka **`src/services/perintah.ts`**. Di bawah baris-baris `import`, tambahkan:

```ts
import { izinPerangkat } from "./daftar.ts";
```

Lalu, di fungsi `perintahkan`, tepat di bawah baris pembukanya (`aturanId: number | null = null): Promise<HasilPerintah> {`), tambahkan:

```ts
  const izin = izinPerangkat(deviceId); // Modul 21: perangkat yang belum terdaftar atau dicabut tidak menerima perintah
  if (izin === "dicabut") return { status: "tidak-dikirim", kode: 409, pesan: `kunci perangkat ${deviceId} sudah dicabut` };
  if (izin !== "terdaftar") return { status: "tidak-dikirim", kode: 404, pesan: `perangkat ${deviceId} belum terdaftar` };
```

Perintah ke perangkat yang belum terdaftar dijawab **404** `perangkat … belum terdaftar`, dan ke perangkat yang kuncinya dicabut dijawab **409** `kunci perangkat … sudah dicabut`. Aturan otomatis dan jadwal juga lewat pintu ini (Modul 19), jadi keduanya pun berhenti memerintah perangkat yang tidak berhak.

Di **`src/routes/perangkat.ts`**, keterangan Swagger untuk rute perintah ikut diperbarui. Cari blok `app.post("/devices/:id/command", …)`, lalu ubah dua baris `404:` dan `409:` di dalam `response` menjadi:

```ts
        404: Galat.describe("perangkat belum terdaftar (Modul 21) atau belum pernah terdengar"),
        409: Galat.describe("kunci perangkat sudah dicabut (Modul 21), perangkat offline, Node 2, jenisnya belum diketahui, "
          + "atau perintah sebelumnya untuk aktuator yang sama masih menunggu ack"),
```

#### 2.6 Akun broker backend di `.env` (8 menit)

1. Buka **`src/config/env.ts`**, lalu ganti seluruh isinya dengan:

   ```ts
   // env.ts - setelan server dari file .env (dibaca Node.js lewat --env-file), diperiksa skema Zod sekali saat server mulai.
   // Modul 20: .env kini juga berisi rahasia (JWT_SECRET), jadi isinya diperiksa seketat pesan dari perangkat.
   import { z } from "zod";

   z.config(z.locales.id()); // pesan galat Zod dalam bahasa Indonesia (file ini dibaca paling awal, sebelum kontrak.ts)

   const kosong = (nilai: unknown) => (nilai === "" ? undefined : nilai); // baris "NAMA=" tanpa isi = belum diisi
   const wajib = z.preprocess(kosong, z.string({ error: "belum diisi" }));

   const Setelan = z.object({
     // alamat broker, misalnya mqtt://192.168.1.37:1883. Modul 21: TANPA nama pengguna dan sandi di dalamnya (alamat ini ditulis
     // ke log saat tersambung); akunnya di dua setelan berikut
     MQTT_URL: wajib.pipe(z.string()
       .regex(/^mqtts?:\/\//, "harus diawali mqtt:// (atau mqtts:// mulai Modul 27), misalnya mqtt://192.168.1.37:1883")
       .refine((url) => !url.includes("@"), "jangan menaruh nama pengguna atau sandi di MQTT_URL; pakai MQTT_USERNAME dan MQTT_PASSWORD")),
     // Modul 21: akun broker milik backend sendiri (dibuat dengan mosquitto_passwd). Keduanya kosong = masuk tanpa akun (hanya
     // berhasil di broker yang masih terbuka); kalau salah satu diisi, yang lain wajib diisi.
     MQTT_USERNAME: z.string().default(""),
     MQTT_PASSWORD: z.string().default(""),
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
     // Modul 20: alamat halaman web (origin) yang boleh memanggil API ini dari browser, dipisah koma. Modul 22: Vite di 5173.
     CORS_ORIGIN: z.preprocess(kosong, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
       .transform((teks) => teks.split(",").map((asal) => asal.trim()).filter((asal) => asal !== ""))),
   }).refine((s) => s.MQTT_USERNAME !== "" || s.MQTT_PASSWORD === "", { // Modul 21: akun broker harus lengkap
     message: "MQTT_PASSWORD diisi tetapi MQTT_USERNAME kosong", path: ["MQTT_USERNAME"],
   }).refine((s) => s.MQTT_PASSWORD !== "" || s.MQTT_USERNAME === "", {
     message: "MQTT_USERNAME diisi tetapi MQTT_PASSWORD kosong (sandi akun backend dari mosquitto_passwd)", path: ["MQTT_PASSWORD"],
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

   - **`MQTT_URL`** kini wajib diawali `mqtt://` (atau `mqtts://` mulai Modul 27) dan **tidak boleh** memuat tanda `@`. Pustaka `mqtt` sebenarnya menerima alamat seperti `mqtt://backend:sandi@192.168.1.37:1883`, tetapi alamat ini ditulis ke log setiap kali backend tersambung, jadi sandinya ikut tercetak. Akunnya dipisah ke dua setelan.
   - **`MQTT_USERNAME`** dan **`MQTT_PASSWORD`** boleh kosong berdua (backend masuk tanpa akun, hanya berhasil di broker yang masih terbuka). Kalau salah satunya diisi, yang lain wajib diisi; dua `.refine()` di bawah memeriksanya.

2. Buka **`.env.example`**. Di bawah baris `MQTT_URL=…`, tambahkan:

   ```text
   # Modul 21: akun broker milik backend (dibuat di mesin broker dengan mosquitto_passwd). Buat sandinya dengan perintah yang
   # sama dengan JWT_SECRET di bawah. Jangan menaruh nama pengguna atau sandi di MQTT_URL.
   MQTT_USERNAME=backend
   MQTT_PASSWORD=
   ```

3. Buka **`src/server.ts`**. Ganti baris `mulaiMqtt(env.MQTT_URL, app.log);` dengan:

   ```ts
   if (env.MQTT_USERNAME === "") {
     app.log.warn("MQTT_USERNAME kosong: backend masuk ke broker TANPA akun (hanya berhasil di broker yang belum dikunci)");
   }
   mulaiMqtt(env.MQTT_URL, env.MQTT_USERNAME === "" ? null : { username: env.MQTT_USERNAME, password: env.MQTT_PASSWORD }, app.log);
   ```

4. Buat sandi akun broker backend. Di terminal kedua, jalankan perintah yang sama dengan pembuatan `JWT_SECRET` di Modul 20:

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Simpan hasilnya di pengelola sandimu dengan nama `akun broker backend`. Sandi ini dipasang ke broker di Praktik 4.
5. Buka **`.env`** milikmu (bukan `.env.example`). Di bawah baris `MQTT_URL=…`, tambahkan dua baris, dengan sandi dari langkah 4, lalu simpan:

   ```text
   MQTT_USERNAME=backend
   MQTT_PASSWORD=sandi-dari-langkah-4
   ```

Begitu `.env` disimpan, `npm run dev` di terminal pertama memulai ulang sendiri, karena `node --watch` ikut memantau `.env` (Modul 16). **Hasilnya** (**contoh**, dipotong):

```text
[02:05:32] INFO: daftar perangkat dimuat: 2 perangkat terdaftar
[02:05:33] INFO: tersambung ke broker mqtt://192.168.1.37:1883 sebagai backend
```

Broker masih terbuka, jadi ia menerima backend apa pun nama dan sandinya (Konsep 6). Yang penting, backend kini **membawa** akunnya. Angka `2` di baris pertama adalah perangkat yang kamu daftarkan di Praktik 1; di laptopmu angkanya mengikuti jumlah perangkatmu. Alamat broker di layarmu tentu alamat broker-mu sendiri.

Sebelum mengisi `.env` dengan benar, penulis sengaja membuat tiga kesalahan untuk melihat jawaban Zod. Masing-masing diikuti baris `Salin .env.example menjadi .env (atau buka .env-mu), perbaiki setelan di atas, lalu jalankan lagi.`, dan backend tidak menyala:

```text
Setelan MQTT_URL di .env: jangan menaruh nama pengguna atau sandi di MQTT_URL; pakai MQTT_USERNAME dan MQTT_PASSWORD
Setelan MQTT_PASSWORD di .env: MQTT_USERNAME diisi tetapi MQTT_PASSWORD kosong (sandi akun backend dari mosquitto_passwd)
Setelan MQTT_USERNAME di .env: MQTT_PASSWORD diisi tetapi MQTT_USERNAME kosong
```

Kalau `.env`-mu belum memuat kedua baris itu sama sekali, backend tetap menyala, dengan peringatan `MQTT_USERNAME kosong: backend masuk ke broker TANPA akun (hanya berhasil di broker yang belum dikunci)`.

#### 2.7 Lihat lapis kedua bekerja (8 menit)

Untuk melihat pesan yang diabaikan, butuh perangkat yang **belum terdaftar**. Simulator perangkat dari folder `alat` cocok: perangkat latihan keduanya, `f00d00000002`, tidak kamu daftarkan.

1. Di terminal ketiga, masuk ke folder `alat` (`cd alat`, dari folder `rumah-pintar-mini`), lalu jalankan simulator Modul 19 dengan dua perangkat latihan. Ganti `192.168.1.37` dengan alamat broker-mu (jalur laptop: `127.0.0.1`):

   ```text
   node simulator-perangkat.js mqtt://192.168.1.37:1883 2
   ```

   Simulator ini masih versi lama yang tidak membawa akun. Broker yang masih terbuka menerimanya.
2. Perhatikan log backend di terminal pertama. **Hasilnya** (**contoh**):

   ```text
   [03:44:22] WARN: DIABAIKAN rpm/f00d00000002/status: f00d00000002 belum terdaftar (daftarkan dulu lewat POST /devices)
   [03:45:30] WARN: DIABAIKAN rpm/f00d00000002/telemetry: f00d00000002 belum terdaftar (daftarkan dulu lewat POST /devices) (+7 pesan lain sejak catatan terakhir)
   ```

   Pesan `f00d00000002` diabaikan, dan catatannya muncul paling sering sekali semenit. Pesan `f00d00000001`, perangkat latihan yang sudah kamu daftarkan di Praktik 1, diproses seperti biasa.
3. Di Bruno, kirim **`health`**. Kolom `diabaikan` kini lebih dari nol. **Hasilnya** (**contoh**):

   ```json
   {
     "ok": true,
     "broker": true,
     "database": true,
     "diterima": 34,
     "ditolak": 0,
     "diabaikan": 12
   }
   ```

4. Jalankan terminal kecil di terminal keempat, mengikuti perangkat latihan yang terdaftar: dari folder `alat`, `node --env-file=.env terminal-live.js http://127.0.0.1:8080 f00d00000001`. Bacaannya tampil seperti di Modul 20. Jalankan sekali lagi untuk `f00d00000002`: terminal kecil tersambung, tetapi **tidak ada bacaan yang muncul**, karena backend tidak pernah menyiarkannya.
5. Hentikan simulator dan kedua terminal kecil dengan **Ctrl + C**. Simulator baru, yang membawa kunci, dipasang di Praktik 3.

Kalau kamu mengirim perintah ke `f00d00000002`, misalnya lewat **Try it out** di `/docs`, jawabannya `404` dengan pesan `perangkat f00d00000002 belum terdaftar`.

#### 2.8 Tes dan simpan ke cabang (6 menit)

Buka **`src/services/daftar.test.ts`**, lalu ganti seluruh isinya dengan versi yang menambah dua tes untuk catatan `DIABAIKAN`:

```ts
// daftar.test.ts - unit test buku tamu perangkat (Modul 21): siapa yang terdaftar dan siapa yang sudah dicabut, dan log
// "DIABAIKAN" lapis kedua yang tidak membanjir. Tanpa database dan tanpa broker. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { JEDA_LOG_MS, catatDicabut, catatTerdaftar, isiDaftar, izinPerangkat, kalimatAbaikan, nilaiIzin } from "./daftar.ts";

describe("buku tamu perangkat", () => {
  it("keputusan murni: belum dimuat, belum terdaftar, terdaftar, dicabut", () => {
    expect(nilaiIzin(false, { dicabut: false })).toBe("belum-dimuat"); // database belum terbaca: jangan percaya siapa pun
    expect(nilaiIzin(true, undefined)).toBe("belum-terdaftar");
    expect(nilaiIzin(true, { dicabut: false })).toBe("terdaftar");
    expect(nilaiIzin(true, { dicabut: true })).toBe("dicabut");
  });
  it("daftar dari database: baris lama tanpa tanggal terdaftar tetap dianggap belum terdaftar", () => {
    const sekarang = new Date();
    const jumlah = isiDaftar([
      { device_id: "a4cf12e5b7c0", terdaftar: sekarang, dicabut: null },
      { device_id: "f00d00000001", terdaftar: null, dicabut: null }, // dibuat otomatis Modul 17-20
      { device_id: "c0ba00000001", terdaftar: sekarang, dicabut: sekarang },
    ]);
    expect(jumlah).toBe(2);
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
    expect(izinPerangkat("f00d00000001")).toBe("belum-terdaftar");
    expect(izinPerangkat("c0ba00000001")).toBe("dicabut");
    catatDicabut("a4cf12e5b7c0"); // POST /devices/:id/cabut
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("dicabut");
    catatTerdaftar("a4cf12e5b7c0"); // POST /devices/:id/kunci menghidupkan lagi
    expect(izinPerangkat("a4cf12e5b7c0")).toBe("terdaftar");
  });
});

describe("log DIABAIKAN (lapis kedua)", () => {
  it("pesan pertama dicatat, pesan berikutnya dalam semenit tidak, lalu dicatat lagi dengan jumlah yang terlewat", () => {
    const t0 = Date.parse("2026-10-23T08:00:00+08:00");
    const topik = "rpm/c0ba00000002/telemetry";
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0))
      .toBe("DIABAIKAN rpm/c0ba00000002/telemetry: c0ba00000002 kuncinya sudah dicabut");
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0 + 10_000)).toBeNull();
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0 + 20_000)).toBeNull();
    expect(kalimatAbaikan(topik, "c0ba00000002", "dicabut", t0 + JEDA_LOG_MS))
      .toBe("DIABAIKAN rpm/c0ba00000002/telemetry: c0ba00000002 kuncinya sudah dicabut (+2 pesan lain sejak catatan terakhir)");
  });
  it("jeda dihitung per perangkat", () => {
    const t0 = Date.parse("2026-10-23T09:00:00+08:00");
    expect(kalimatAbaikan("rpm/f00d00000009/status", "f00d00000009", "belum-terdaftar", t0)).toContain("belum terdaftar");
    expect(kalimatAbaikan("rpm/f00d00000010/status", "f00d00000010", "belum-terdaftar", t0)).not.toBeNull();
  });
});
```

Tes pertama memastikan catatan berikutnya baru muncul setelah `JEDA_LOG_MS` (semenit) dengan jumlah yang terlewat, dan tes kedua memastikan jedanya dihitung **per perangkat**. Jalankan di terminal kedua:

```text
npm run cek
npm test
```

**Hasilnya:** `npm run cek` tanpa galat, dan `npm test` diakhiri `Tests  35 passed (35)`. Simpan ke cabang:

```text
git add src/db/arsip.ts src/services/daftar.ts src/services/daftar.test.ts src/services/mqtt.ts src/services/gudang.ts src/routes/kesehatan.ts src/services/perintah.ts src/routes/perangkat.ts src/config/env.ts src/server.ts .env.example
git status
git commit -m "Lapis kedua: abaikan perangkat tak terdaftar, akun broker backend di .env (Modul 21 Praktik 2)"
```

`.env` milikmu, yang kini berisi sandi akun broker, tetap tidak ikut Git, dan `git status` tidak menyebutnya.

> ⬆️ **Selesai Praktik 2?** Baca [Konsep 5](#5-kunci-di-dalam-perangkat-nvs-serial-monitor-dan-batasnya), lalu lanjut ke [Praktik 3 — Node 1 dan alat memasang kuncinya](#praktik-3--node-1-dan-alat-memasang-kuncinya-60-menit).

### Praktik 3 — Node 1 dan alat memasang kuncinya (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** untuk mengubah firmware di folder `firmware/node-1-rumah` dan menjalankan alat di folder `alat` (terminal pertama tetap menjalankan `npm run dev`), **Arduino IDE** dengan Serial Monitor (jalur perangkat) atau proyek **Wokwi** Node 1-mu (jalur Wokwi), browser untuk membuka file kurikulum di GitHub, **terminal SSH ke Pi** (jalur perangkat), dan **Bruno**. Konsep yang dipakai: Konsep 5.
>
> 🖥️ **Tiga jalur, satu firmware.** Semua pembaca mengerjakan langkah 3.1–3.5 supaya firmware di repositorimu menjadi v1.6.0. **Jalur perangkat** mengunggahnya ke Node 1, lalu memasang kunci Node 1 (3.6). **Jalur Wokwi** menjalankannya di Wokwi dengan broker publik yang memeriksa sandi (3.7). **Jalur laptop** cukup memeriksa firmware dengan tombol **Verify** di Arduino IDE (3.6, langkah pertama). Setelah itu, semua jalur memasang kunci di simulator dan pemeriksa kontrak (3.8–3.10).

Broker di rumahmu masih terbuka. Praktik ini membuat semua program yang biasa masuk ke broker **membawa identitasnya sendiri**: Node 1 membawa nama pengguna `a4cf12e5b7c0` beserta kuncinya, simulator membawa `f00d00000001` beserta kuncinya, dan pemeriksa kontrak membawa akun `pemeriksa`. Backend sudah membawa akunnya sejak Praktik 2. Broker yang belum dikunci tidak memeriksa apa pun, jadi hampir tidak ada yang berubah di layar. Justru itu tandanya urutan kita benar: begitu broker dikunci di Praktik 4, semuanya sudah siap.

> [!NOTE]
> **Dua "kunci" di Node 1.** Sejak Modul 14, folder `node-1-rumah` punya `kunci.contoh.h`, contoh isi `kunci.h` untuk **kunci enkripsi ESP-NOW** antara Node 1 dan Node 2. Itu kunci yang lain lagi. Kunci minggu ini adalah **kunci broker**, sandi Node 1 untuk masuk ke Mosquitto. Kunci broker sengaja tidak ditaruh di `kunci.h`: isi file `.h` ikut masuk ke dalam firmware saat dikompilasi, jadi mengganti kuncinya (Praktik 7) berarti mengompilasi dan mengunggah ulang. Kunci di NVS cukup diganti lewat Serial Monitor dalam hitungan detik, tanpa menyentuh kode.

Node 1 v1.6.0 = v1.5.0 + perubahan di delapan file, tanpa file baru dan tanpa library baru:

| File | Perubahan | Cara |
| :--- | :--- | :--- |
| `konfigurasi.h` | versi `1.6.0` dan sakelar `WOKWI_BERKUNCI` | ketik (langkah 3.1) |
| `pengaturan.h` / `.cpp` | kunci broker di NVS, dengan label `kunci_broker` | ketik (langkah 3.2) |
| `jaringan.h` | tiga fungsi baru | ketik (langkah 3.3) |
| `jaringan.cpp` | masuk dengan nama pengguna dan kunci, catatan `DITOLAK`, jeda 60 detik | salin dari kurikulum (langkah 3.3) |
| `perintah.cpp` | wadah baris 80 huruf, perintah `kunci`, `kunci <isi>`, dan `kunci hapus` | salin dari kurikulum (langkah 3.4) |
| `layar.cpp`, `node-1-rumah.ino` | `OFFLINE: MQTT DITOLAK` di layar, dan komentar | ketik (langkah 3.5) |

**Jalur Wokwi:** kerjakan perubahannya di VS Code pada folder `firmware/node-1-rumah` repositorimu, lalu salin isi setiap file yang berubah ke tab bernama sama di proyek Wokwi Node 1-mu (`node-1-rumah.ino` ke tab `sketch.ino`). **Kecuali `konfigurasi.h`:** di tab Wokwi, ulangi saja perubahan langkah 3.1, supaya `PAKAI_WOKWI = true` milik Wokwi tidak tertimpa.

#### 3.1 `konfigurasi.h` (3 menit)

1. Ubah nomor versinya:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.5.0";
   ```

   menjadi:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.6.0";
   ```

2. Di **paling bawah** file, setelah baris `LAMA_UJI_OFFLINE`, sisakan satu baris kosong, lalu tambahkan:

   ```cpp
   // ---------- Modul 21: akun broker ----------
   // Nama pengguna broker = device_id. Kuncinya TIDAK ditulis di kode: ketik "kunci <isi>" di Serial Monitor (disimpan di NVS).
   const bool WOKWI_BERKUNCI = false;  // Wokwi saja: true = broker publik BERKUNCI test.mosquitto.org:1884, akun publik "rw"
   ```

   Hanya ada satu setelan baru, dan isinya **bukan** kunci. `WOKWI_BERKUNCI` hanya dipakai jalur Wokwi (langkah 3.7). Di repositorimu dan di papan sungguhan, nilainya tetap `false`.

#### 3.2 `pengaturan.h` dan `pengaturan.cpp` (8 menit)

1. Di **`pengaturan.h`**, di bawah baris `bool simpanAmbangSuhuKipas(float derajat);`, tambahkan:

   ```cpp
   const char* kunciBroker();                  // Modul 21: kunci broker dari NVS; "" kalau belum ada. JANGAN dicetak utuh
   bool simpanKunciBroker(const char* isi);    // Modul 21: false kalau bukan 1-64 huruf A-Z, a-z, 0-9, - atau _
   void hapusKunciBroker();                    // Modul 21: perintah "kunci hapus"
   ```

2. Di **`pengaturan.cpp`**, di bawah baris `static float suhuKipas = SUHU_KIPAS_ON_BAWAAN;`, tambahkan:

   ```cpp
   static char kunci[65] = "";  // Modul 21: kunci broker, paling panjang 64 huruf + tanda akhir teks; "" = belum ada
   ```

   Wadahnya 65 laci: kunci paling panjang 64 huruf, ditambah satu laci untuk tanda akhir teks (Modul 8). Kunci buatan backend panjangnya 43 huruf.

3. Masih di `pengaturan.cpp`, di fungsi `muatPengaturan()`, tepat di bawah baris `logInfo("Ambang suhu_kipas_on: %.1f C (%s)", suhuKipas, asal);`, tambahkan:

   ```cpp
     if (arsip.isKey("kunci_broker")) {  // Modul 21; isKey dulu supaya label yang belum ada tidak dianggap galat
       arsip.getString("kunci_broker", kunci, sizeof(kunci));
     }
     logInfo("Kunci broker: %s", kunci[0] != '\0' ? "tersimpan di NVS" : "BELUM ADA (ketik: kunci <isi>)");
   ```

   Saat Node 1 menyala, kunci dibaca dari NVS. Perhatikan catatannya: hanya `tersimpan di NVS` atau `BELUM ADA`, tidak pernah isi kuncinya.

4. Di **paling bawah** `pengaturan.cpp`, setelah fungsi `simpanAmbangSuhuKipas()`, sisakan satu baris kosong, lalu tambahkan:

   ```cpp
   // ---------- Modul 21: kunci broker ----------
   // Disimpan di NVS dengan label "kunci_broker" (12 huruf), tidak pernah di kode atau di Git, dan tidak pernah dicetak utuh.
   const char* kunciBroker() {
     return kunci;
   }

   // Huruf yang boleh ada di kunci: A-Z, a-z, 0-9, tanda - dan _ (huruf kunci buatan backend). Spasi, tanda = dan
   // huruf lain hampir pasti salah salin.
   static bool hurufKunciSah(char h) {
     return (h >= 'A' && h <= 'Z') || (h >= 'a' && h <= 'z') || (h >= '0' && h <= '9') || h == '-' || h == '_';
   }

   bool simpanKunciBroker(const char* isi) {
     size_t panjang = strlen(isi);
     if (panjang == 0 || panjang >= sizeof(kunci)) {  // 1-64 huruf; tidak harus tepat 43 (Wokwi: readwrite)
       return false;
     }
     for (size_t i = 0; i < panjang; i++) {
       if (!hurufKunciSah(isi[i])) {
         return false;
       }
     }
     if (strcmp(isi, kunci) != 0) {  // sama: tidak perlu menulis ulang (jumlah tulis flash terbatas)
       arsip.putString("kunci_broker", isi);
       snprintf(kunci, sizeof(kunci), "%s", isi);
       logInfo("Kunci broker disimpan ke NVS (%u huruf).", (unsigned)panjang);
     }
     return true;
   }

   void hapusKunciBroker() {
     if (arsip.isKey("kunci_broker")) {
       arsip.remove("kunci_broker");
       logInfo("Kunci broker dihapus dari NVS.");
     }
     kunci[0] = '\0';
   }
   ```

   - **`simpanKunciBroker()`** menolak isi yang kosong, lebih dari 64 huruf, atau mengandung huruf di luar `A–Z`, `a–z`, `0–9`, `-`, dan `_`. Kunci dari backend hanya memakai huruf-huruf itu (*base64url*, Konsep 2), jadi spasi atau tanda `=` hampir pasti tanda salah salin. Panjangnya tidak harus tepat 43 huruf, karena jalur Wokwi memakai sandi publik `readwrite` yang hanya 9 huruf.
   - Kunci yang sama tidak ditulis ulang, karena jumlah tulis memori *flash* ada batasnya.
   - Label NVS-nya, `kunci_broker`, panjangnya 12 huruf, masih di bawah batas 15 huruf (Modul 8).

#### 3.3 `jaringan.h` dan `jaringan.cpp` (8 menit)

1. Di **`jaringan.h`**, perbarui catatan di baris `teksJaringan()` supaya menyebut teks layar yang baru:

   ```cpp
   const char* teksJaringan();            // untuk layar: "ok, MQTT ok", "ok, MQTT putus", "ok, MQTT DITOLAK", "putus", "mati"
   ```

   Lalu, di **paling bawah** file, tambahkan:

   ```cpp
   const char* penggunaBroker();          // Modul 21: nama pengguna broker (device_id; Wokwi berkunci: "rw")
   bool mqttDitolak();                    // Modul 21: true kalau broker menolak kunci pada percobaan terakhir
   void gantiKunciBroker();               // Modul 21: kunci baru atau dihapus: sambung ulang SEKARANG dengan kunci itu
   ```

2. **`jaringan.cpp`** berubah di banyak tempat, jadi isinya diganti seluruhnya. Buka [`kode/firmware/node-1-rumah/jaringan.cpp`](kode/firmware/node-1-rumah/jaringan.cpp) di tab baru browser, klik ikon **Copy raw file**, kembali ke VS Code, buka `jaringan.cpp`, tekan **Ctrl + A**, lalu tempel (**Ctrl + V**). Penggantian ini aman: alamat broker Pi-mu tersimpan di `konfigurasi.h`, bukan di `jaringan.cpp`.

Yang baru di `jaringan.cpp`:

- **Masuk dengan nama pengguna dan kunci.** `mqtt.connect()` kini membawa nama pengguna (`device_id`) dan kunci dari NVS. Kalau kuncinya belum ada, yang dikirim `nullptr`: hanya nama pengguna, tanpa sandi.

  ```cpp
    const char* kunci = kunciBroker();  // Modul 21: dari NVS; "" = belum ada
    // Nama klien = device_id; nama pengguna = device_id (Wokwi berkunci: rw); kunci dari NVS (nullptr = tanpa kunci);
    // lalu surat wasiat: topik status, QoS 1, retained, isi "offline" (Modul 11, Konsep 7).
    if (mqtt.connect(idPerangkat, pengguna, kunci[0] != '\0' ? kunci : nullptr, topikStatus, 1, true, "offline")) {
  ```

- **Ditolak broker.** Kode 4 dan 5 adalah jawaban broker sendiri, artinya "nama atau sandi salah" dan "tidak diizinkan". Mosquitto selalu menjawab 5. Setiap penolakan dicatat, dan percobaan berikutnya baru 60 detik kemudian (`JEDA_COBA_DITOLAK`). Kegagalan lain, misalnya broker mati, tetap dicoba setiap 5 detik seperti dulu:

  ```cpp
    ditolakBroker = (kode == 4 || kode == 5);  // Modul 21: jawaban broker sendiri, bukan masalah jaringan
    if (ditolakBroker) {  // dicatat setiap percobaan (paling sering 1 kali per menit)
      logError("MQTT DITOLAK broker (kode %d): kunci %s. Dicoba lagi %lu detik lagi.", kode,
               kunci[0] != '\0' ? "salah, belum didaftarkan, atau sudah dicabut" : "belum diisi", JEDA_COBA_DITOLAK / 1000);
      logInfo("Kunci baru? Ketik di Serial Monitor: kunci <isi>, lalu Enter.");
    } else if (kode != kodeGagalTerakhir) {  // kegagalan yang sama tidak dicatat setiap 5 detik
      logError("MQTT gagal tersambung ke broker setelah %lu ms: %s (kode %d). Broker di gateway menyala?",
               millis() - mulai, namaKeadaanMqtt(kode), kode);
    }
    kodeGagalTerakhir = kode;
  ```

- **`gantiKunciBroker()`** dipanggil setiap kali kunci diganti atau dihapus. Sambungan lama ditutup **tanpa pamit**, sama seperti `uji offline` di Modul 19, lalu Node 1 langsung mencoba masuk lagi dengan kunci barunya tanpa menunggu jeda:

  ```cpp
  // Kunci baru (atau dihapus): coba sekarang, tanpa menunggu jeda. Sambungan lama ditutup TANPA pamit seperti "uji offline",
  // jadi broker menerbitkan wasiat "offline" dulu; begitu kunci baru diterima, status kembali "online".
  void gantiKunciBroker() {
    ditolakBroker = false;
    sudahCobaMqtt = false;
    if (mqtt.connected()) {
      klienJaringan.stop();
    }
  }
  ```

  Karena tanpa pamit, broker menerbitkan wasiat `offline` dulu, lalu Node 1 menerbitkan `online` lagi begitu diterima. Status Node 1 berkedip sesaat, dan itu wajar.

- **Ditolak juga dihitung mode offline.** Kalau broker menolak terus selama 2 menit, Node 1 masuk mode offline (Modul 19) dan pengaman kipasnya bekerja. Catatannya berbunyi `MODE OFFLINE: broker menolak kunci selama 120 detik`, supaya kamu tahu penyebabnya kunci, bukan kabel.
- Perintah `wifi` kini juga menulis nama pengguna broker dan apakah kunci sudah tersimpan.
- **Khusus Wokwi berkunci** (`PAKAI_WOKWI` dan `WOKWI_BERKUNCI` sama-sama `true`), Node 1 masuk ke `test.mosquitto.org` pintu 1884 dengan nama pengguna `rw`, bukan ke `broker.emqx.io`.

#### 3.4 `perintah.cpp` (5 menit)

`perintah.cpp` juga diganti seluruhnya. Buka [`kode/firmware/node-1-rumah/perintah.cpp`](kode/firmware/node-1-rumah/perintah.cpp), klik **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi `perintah.cpp`-mu. Kalau kamu pernah menambahkan perintah sendiri di file ini, misalnya dari 🧩 modul sebelumnya, salin dulu bagian itu, lalu tempel lagi setelah penggantian.

Yang baru di `perintah.cpp`:

- **Wadah baris 80 huruf** (`PANJANG_BARIS_MAKS`, dulu 40). `kunci` ditambah spasi dan kunci 43 huruf sudah 49 huruf. Wadah lama akan memotong kuncinya diam-diam, dan Node 1 menyimpan kunci yang salah tanpa memberi tahu. Baris yang lebih panjang dari 80 huruf kini ditolak utuh dengan pesan `Baris lebih dari 80 huruf: diabaikan.`
- **Huruf besar-kecil dijaga.** Perintah biasanya diubah ke huruf kecil dulu (`toLowerCase()`), supaya `LAMPU ON` sama dengan `lampu on`. Untuk kunci, yang disimpan adalah salinan aslinya (`asli`). Kalau ikut diubah ke huruf kecil, kunci 43 huruf dari backend tidak akan pernah cocok.
- **`cetakKunci()`** menulis keadaan kunci tanpa membuka isinya: panjangnya, ditambah empat huruf terakhir hanya kalau kuncinya 16 huruf atau lebih.

  ```cpp
  // Modul 21: keadaan kunci broker TANPA membuka isinya: hanya panjang dan 4 huruf terakhir (kalau kuncinya panjang).
  static void cetakKunci() {
    const char* kunci = kunciBroker();
    size_t panjang = strlen(kunci);
    if (panjang == 0) {
      Serial.printf("kunci: BELUM ADA. Node 1 masuk sebagai %s tanpa kunci; broker yang sudah dikunci akan menolaknya.\n",
                    penggunaBroker());
      Serial.println("kunci: ketik kunci <isi> (salin dari pendaftaran perangkat), lalu Enter.");
      return;
    }
    if (panjang >= 16) {
      Serial.printf("kunci: tersimpan di NVS, %u huruf, berakhiran ...%s\n", (unsigned)panjang, kunci + panjang - 4);
    } else {
      Serial.printf("kunci: tersimpan di NVS, %u huruf\n", (unsigned)panjang);  // kunci pendek: ujungnya pun dirahasiakan
    }
  }
  ```

- **Tiga perintah baru**: `kunci`, `kunci hapus`, dan `kunci <isi>`.

  ```cpp
    } else if (perintah == "kunci") {
      cetakKunci();  // Modul 21: keadaan kunci broker, tanpa membuka isinya
      Serial.printf("kunci: nama pengguna broker %s, WiFi %s\n", penggunaBroker(), teksJaringan());
      return;
    } else if (perintah == "kunci hapus") {
      if (kunciBroker()[0] != '\0') {
        hapusKunciBroker();  // Modul 21: mulai sekarang Node 1 masuk tanpa kunci (broker berkunci menolaknya)
        gantiKunciBroker();
      }
      cetakKunci();
      return;
    } else if (perintah.startsWith("kunci ")) {
      String isi = asli.substring(6);  // dari baris ASLI: huruf besar-kecil kunci tetap
      isi.trim();
      if (isi == kunciBroker() && mqttSiap()) {
        Serial.println("kunci: sama dengan yang tersimpan dan sudah tersambung, tidak diubah.");
        return;
      }
      if (!simpanKunciBroker(isi.c_str())) {  // kunci yang sama tidak ditulis ulang ke NVS
        Serial.println("kunci: tidak disimpan. Hanya boleh huruf A-Z, a-z, angka 0-9, tanda - dan _, tanpa spasi, "
                       "paling panjang 64 huruf.");
        return;
      }
      gantiKunciBroker();  // Modul 21: langsung dicoba, tanpa menunggu jeda
      cetakKunci();
      Serial.printf("kunci: Node 1 mencoba masuk ke broker sebagai %s dengan kunci ini sekarang.\n", penggunaBroker());
      return;
  ```

  Kalau kunci yang diketik sama dengan yang tersimpan dan Node 1 sudah tersambung, tidak ada yang diubah. Kalau kuncinya sama tetapi Node 1 sedang ditolak, ia mencoba lagi **sekarang** tanpa menunggu 60 detik. Ini berguna setelah kamu memperbaiki berkas sandi di broker (Praktik 4).

#### 3.5 `layar.cpp` dan `node-1-rumah.ino` (4 menit)

1. Di **`layar.cpp`**, ubah catatan di baris `#include "jaringan.h"` menjadi:

   ```cpp
   #include "jaringan.h"  // Modul 10: teksJaringan(); Modul 19: modeOffline(); Modul 21: mqttDitolak()
   ```

   Lalu, di fungsi `gambarHalamanStatus()`, ganti dua baris ini:

   ```cpp
     if (modeOffline()) {
       snprintf(teks, sizeof(teks), "MODE OFFLINE");  // Modul 19: broker tak terjangkau lebih dari 2 menit
   ```

   dengan:

   ```cpp
     if (modeOffline()) {  // Modul 19: broker tak terjangkau lebih dari 2 menit; Modul 21: atau menolak kunci
       snprintf(teks, sizeof(teks), "%s", mqttDitolak() ? "OFFLINE: MQTT DITOLAK" : "MODE OFFLINE");
   ```

   `OFFLINE: MQTT DITOLAK` tepat 21 huruf, batas satu baris layar OLED dengan huruf ukuran 1 (Modul 7). Sebelum 2 menit, baris itu berbunyi `WiFi ok, MQTT DITOLAK`, yang juga 21 huruf.

2. Di **`node-1-rumah.ino`**, ganti baris pertama dengan:

   ```cpp
   // Node 1 "Rumah" - firmware v1.6.0 (Modul 21: masuk ke broker dengan nama pengguna dan kunci)
   ```

   Di atas baris `// Baru di v1.5.0: …`, sisipkan:

   ```cpp
   // Baru di v1.6.0: Node 1 masuk ke broker dengan nama pengguna = device_id dan kunci perangkatnya sendiri. Kuncinya tidak
   // pernah ditulis di kode: ketik "kunci <isi>" di Serial Monitor sekali, dan Node 1 menyimpannya di NVS. Kalau broker
   // menolak (kunci salah, belum diisi, atau dicabut), Serial Monitor dan layar menulis DITOLAK, dan Node 1 mencoba lagi
   // setiap 60 detik saja supaya log broker tidak banjir.
   ```

   Lalu, di daftar perintah, ubah baris `// rs485, rs485 on, rs485 off, uji offline, restart.` menjadi:

   ```cpp
   // rs485, rs485 on, rs485 off, uji offline, kunci, kunci <isi>, kunci hapus, restart.
   ```

#### 3.6 Jalur perangkat: unggah, lalu pasang kunci Node 1 (10 menit)

**Jalur laptop** cukup mengerjakan langkah 1 dengan tombol **Verify** (ikon centang), bukan **Upload**: tanpa papan pun bisa, asalkan paket esp32 dan library Node 1 dari Modul 10–15 sudah terpasang. Kalau Arduino IDE selesai tanpa galat, firmware-mu siap untuk hari ketika papannya ada. Lanjutkan ke 3.8.

1. Pastikan papan yang terpilih adalah **ESP32 Dev Module**, dengan **Partition Scheme** **Minimal SPIFFS**, **Flash Mode** **DIO**, port papan **Node 1**, dan **Erase All Flash Before Sketch Upload** tetap **Disabled** (semuanya di menu **Tools**). Klik **Upload**. Arduino IDE menulis kira-kira:

   ```text
   Sketch uses 1194232 bytes (60%) of program storage space. Maximum is 1966080 bytes.
   Global variables use 56684 bytes (17%) of dynamic memory, leaving 270996 bytes for local variables. Maximum is 327680 bytes.
   ```

   Ukurannya sekitar 2,7 kilobyte lebih besar daripada v1.5.0 dan masih jauh dari batasnya.

2. Buka Serial Monitor Node 1 (**New Line**, 115200 baud). Di antara baris-baris awalnya ada (**contoh**: baris-baris ini direkam penulis di Wokwi dengan broker publik terbuka, lalu alamat broker dan `device_id`-nya diganti dengan milik jalur perangkat):

   ```text
   [00:00:02] INFO  Node 1 Rumah - firmware 1.6.0
   [00:00:02] INFO  Kunci broker: BELUM ADA (ketik: kunci <isi>)
   [00:00:05] INFO  MQTT tersambung ke broker 192.168.1.37:1883 dalam 954 ms, sebagai a4cf12e5b7c0
   ```

   Node 1 kini masuk dengan nama pengguna `a4cf12e5b7c0`, tetapi **tanpa kunci**, dan broker yang masih terbuka tetap menerimanya.

3. Ambil kunci Node 1 dari pengelola sandimu, yang kamu simpan di Praktik 1.9 dengan nama `kunci broker a4cf12e5b7c0`. Di kotak kirim Serial Monitor, ketik `kunci` dan satu spasi, tempel kuncinya (**Ctrl + V**), lalu tekan **Enter**. **Hasilnya** (**contoh**, dengan kunci contoh modul ini; asal-usulnya sama dengan langkah 2):

   ```text
   [00:00:13] INFO  Kunci broker disimpan ke NVS (43 huruf).
   kunci: tersimpan di NVS, 43 huruf, berakhiran ...ejOE
   kunci: Node 1 mencoba masuk ke broker sebagai a4cf12e5b7c0 dengan kunci ini sekarang.
   [00:00:13] ERROR MQTT PUTUS: sambungan terputus (kode -3). Node 1 tetap bekerja dan mencoba lagi setiap 5 detik.
   [00:00:13] INFO  MQTT tersambung ke broker 192.168.1.37:1883 dalam 471 ms, sebagai a4cf12e5b7c0
   ```

   - **Cocokkan ujungnya.** Bandingkan `...ejOE` dengan empat huruf terakhir kunci di pengelola sandimu. Dengan cara ini kamu memastikan kunci tersalin utuh tanpa menampilkannya.
   - **`MQTT PUTUS` di tengahnya disengaja.** Node 1 menutup sambungan lama supaya bisa masuk lagi dengan kunci barunya. Status Node 1 sempat `offline` sesaat (terlihat di terminal kecil atau log backend), lalu `online` lagi. Telegram tetap diam, karena putusnya jauh di bawah 60 detik (Modul 19).
   - **Broker masih terbuka, jadi kunci apa pun diterima**, bahkan kunci yang salah ketik. Yang kita pastikan di sini adalah Node 1 **menyimpan dan membawa** kuncinya. Benar atau tidaknya kunci itu baru ketahuan setelah broker dikunci di Praktik 4. Itulah gunanya mencocokkan empat huruf terakhir.

   Kalau yang muncul `kunci: tidak disimpan. Hanya boleh huruf A-Z, a-z, angka 0-9, tanda - dan _, tanpa spasi, paling panjang 64 huruf.`, kemungkinan tanda petik `"` dari jawaban Bruno ikut tersalin. Salin lagi kuncinya tanpa tanda petik.

4. Ketik `restart`. Setelah Node 1 menyala lagi, Serial Monitor menulis `Kunci broker: tersimpan di NVS`, lalu Node 1 tersambung seperti biasa. Kunci ada di NVS, jadi ia tetap ada setelah *restart*, setelah listrik padam, dan setelah firmware berikutnya diunggah (selama **Erase All Flash Before Sketch Upload** tetap **Disabled**).
5. Ketik `wifi`. Di antara barisnya ada (**contoh**, asal-usulnya sama dengan langkah 2):

   ```text
   mqtt: tersambung ke 192.168.1.37:1883 sebagai a4cf12e5b7c0
   mqtt: nama pengguna a4cf12e5b7c0, kunci tersimpan (rinciannya: ketik kunci)
   ```

Gagal kompilasi dengan `'kunciBroker' was not declared in this scope`? Baris di `pengaturan.h` (langkah 3.2) terlewat. Pesan serupa untuk `penggunaBroker`, `mqttDitolak`, atau `gantiKunciBroker` berarti baris di `jaringan.h` terlewat (langkah 3.3), dan untuk `WOKWI_BERKUNCI`, bagian baru di `konfigurasi.h` (langkah 3.1) terlewat.

#### 3.7 Jalur Wokwi: ditolak dulu, lalu diterima (12 menit)

Wokwi tidak bisa menjangkau broker di rumahmu, jadi sejak Modul 11 Node 1 di Wokwi memakai broker publik. Untuk modul ini ada broker publik yang pas: **`test.mosquitto.org`**, yang dikelola proyek Mosquitto sendiri. Pintu 1884-nya **berkunci**: hanya nama pengguna dan sandi yang terdaftar yang diterima. Untuk latihan, pengelolanya menyediakan akun `rw` dengan sandi `readwrite`, yang ditulis terang-terangan di halaman depan [test.mosquitto.org](https://test.mosquitto.org/). Sandi itu memang bukan rahasia siapa pun. Dengan broker ini, Node 1-mu bisa merasakan "ditolak" lalu "diterima" sebelum broker rumah dikunci.

> [!WARNING]
> **Jangan mengetik kunci perangkatmu yang asli di Wokwi**, misalnya kunci `f00d00000001` dari Praktik 1. Node 1 di Wokwi mengirim kunci ke broker publik lewat internet tanpa enkripsi (Konsep 10). Di Wokwi, cukup pakai sandi publik `readwrite`.

1. Di tab **`konfigurasi.h`** proyek Wokwi-mu, pastikan `PAKAI_WOKWI = true`, lalu ubah baris `WOKWI_BERKUNCI` menjadi:

   ```cpp
   const bool WOKWI_BERKUNCI = true;  // Wokwi saja: true = broker publik BERKUNCI test.mosquitto.org:1884, akun publik "rw"
   ```

   Tidak ada library baru, jadi tab `libraries.txt` dan `diagram.json` tidak berubah. Klik **▶**.

2. **Hasilnya** (**rekaman uji Wokwi**, dipotong):

   ```text
   [00:00:02] INFO  Node 1 Rumah - firmware 1.6.0
   [00:00:02] INFO  Kunci broker: BELUM ADA (ketik: kunci <isi>)
   [00:00:03] INFO  Mode Wokwi: menyambung ke Wokwi-GUEST tanpa portal, broker publik test.mosquitto.org:1884.
   [00:00:05] INFO  WiFi tersambung ke "Wokwi-GUEST": IP 10.10.0.1, sinyal -70 dBm, channel 6
   [00:00:06] ERROR MQTT DITOLAK broker (kode 5): kunci belum diisi. Dicoba lagi 60 detik lagi.
   [00:00:06] INFO  Kunci baru? Ketik di Serial Monitor: kunci <isi>, lalu Enter.
   ```

   Node 1 masuk sebagai `rw` tanpa sandi, dan broker menolaknya dengan kode 5. Ketik `kunci` untuk melihat keadaannya:

   ```text
   kunci: BELUM ADA. Node 1 masuk sebagai rw tanpa kunci; broker yang sudah dikunci akan menolaknya.
   kunci: ketik kunci <isi> (salin dari pendaftaran perangkat), lalu Enter.
   kunci: nama pengguna broker rw, WiFi ok, MQTT DITOLAK
   ```

3. Jangan buru-buru. Biarkan Node 1 ditolak selama 2 menit menurut jam di Serial Monitor (Wokwi berjalan lebih lambat daripada jam sungguhan, jadi bisa beberapa menit). **Hasilnya** (**rekaman uji Wokwi**, baris sensor dihilangkan):

   ```text
   [00:01:06] ERROR MQTT DITOLAK broker (kode 5): kunci belum diisi. Dicoba lagi 60 detik lagi.
   [00:01:06] INFO  Kunci baru? Ketik di Serial Monitor: kunci <isi>, lalu Enter.
   [00:02:03] ERROR MODE OFFLINE: broker menolak kunci selama 120 detik. Pengaman lokal bekerja: kipas menyala di atas 30.0 C.
   [00:02:06] ERROR MQTT DITOLAK broker (kode 5): kunci belum diisi. Dicoba lagi 60 detik lagi.
   [00:02:06] INFO  Kunci baru? Ketik di Serial Monitor: kunci <isi>, lalu Enter.
   ```

   Percobaannya tepat 60 detik sekali: `00:00:06`, `00:01:06`, `00:02:06`. Setelah 2 menit, Node 1 masuk mode offline (Modul 19), dan pengaman kipasnya tetap menjaga rumah walaupun broker menolaknya.

4. Sekarang ketik `kunci readwrite`, lalu **Enter**. **Hasilnya** (**rekaman uji Wokwi**):

   ```text
   [00:02:09] INFO  Kunci broker disimpan ke NVS (9 huruf).
   kunci: tersimpan di NVS, 9 huruf
   kunci: Node 1 mencoba masuk ke broker sebagai rw dengan kunci ini sekarang.
   [00:02:10] INFO  MQTT tersambung ke broker test.mosquitto.org:1884 dalam 691 ms, sebagai rw
   [00:02:10] INFO  MODE OFFLINE SELESAI setelah 7 detik: broker terjangkau lagi. Pengaman menyalakan kipas 0 kali.
   [00:02:11] INFO  Terbit telemetry (jadwal 10 detik)
   ```

   Kunci baru langsung dicoba tanpa menunggu 60 detik. Karena kuncinya hanya 9 huruf, `kunci` tidak menampilkan ujungnya sama sekali (`tersimpan di NVS, 9 huruf`): empat huruf terakhir dari kunci sependek itu terlalu banyak membocorkan isinya. Layar OLED menceritakan hal yang sama:

   ![Komposit dua tangkapan simulasi Wokwi Node 1 v1.6.0, menunjukkan broker berkunci yang menolak lalu menerima. Judul: Node 1 di Wokwi, ditolak lalu diterima broker berkunci; broker publik test.mosquitto.org pintu 1884 (akun latihan rw) memeriksa sandi; rekaman uji Wokwi. Kartu pertama, pita merah, berjudul 1. Tanpa kunci, panah, DITOLAK (kode 5). Di kiri, layar OLED Node 1: Menyala selama 00:00:14, Restart POWERON, Nyala ke-1, baris WiFi ok, MQTT DITOLAK, lalu v1.6.0 bebas 207KB. Di kanan, potongan Serial Monitor: baris ERROR MQTT DITOLAK broker (kode 5): kunci belum diisi. Dicoba lagi 60 detik lagi, lalu INFO Kunci baru? Ketik di Serial Monitor: kunci <isi>, lalu Enter. Keterangan: Layar WiFi ok, MQTT DITOLAK; Node 1 mencoba lagi tiap 60 detik. Kartu kedua, pita hijau, berjudul 2. Ketik kunci readwrite, panah, DITERIMA. Di kiri, layar OLED: Menyala selama 00:02:16, Restart POWERON, Nyala ke-1, baris WiFi ok, MQTT ok, lalu v1.6.0 bebas 205KB. Di kanan, potongan Serial Monitor: INFO MQTT tersambung ke broker test.mosquitto.org:1884 dalam 691 ms, sebagai rw, lalu MODE OFFLINE SELESAI setelah 7 detik, dan INFO Terbit telemetry (jadwal 10 detik). Keterangan: Layar WiFi ok, MQTT ok; telemetry mengalir lagi.](aset/wokwi-kunci-broker.png)

5. **Coba juga:**
   - **Huruf besar-kecil.** Ketik `kunci READWRITE`. Node 1 menyimpannya apa adanya, menutup sambungan, lalu ditolak: `MQTT DITOLAK broker (kode 5): kunci salah, belum didaftarkan, atau sudah dicabut. Dicoba lagi 60 detik lagi.` Ketik lagi `kunci readwrite` untuk tersambung kembali.
   - **Kunci bertahan saat *restart*.** Ketik `restart`. Setelah menyala lagi, Serial Monitor menulis `Kunci broker: tersimpan di NVS`, dan Node 1 langsung tersambung.
   - **Kebiasaan Wokwi.** Hentikan simulasi (**■**), lalu jalankan lagi (**▶**). Kuncinya hilang (`Kunci broker: BELUM ADA`), karena Wokwi mengosongkan NVS setiap kali simulasi dihentikan (Modul 8). Di papan sungguhan, kunci tetap ada.
   - **Isi yang salah.** Ketik `kunci read write`, dengan spasi di tengah. Node 1 tidak menyimpan apa pun: `kunci: tidak disimpan. Hanya boleh huruf A-Z, a-z, angka 0-9, tanda - dan _, tanpa spasi, paling panjang 64 huruf.`

Untuk kembali ke broker publik terbuka seperti di Modul 19, ubah lagi `WOKWI_BERKUNCI` di tab Wokwi menjadi `false`.

#### 3.8 Simulator dan pemeriksa kontrak versi Modul 21 (8 menit)

Langkah 3.8–3.10 untuk **semua jalur**. Jalur Wokwi memakai broker di laptop, sama dengan jalur laptop.

1. Buka [`kode/alat/simulator-perangkat.js`](kode/alat/simulator-perangkat.js) di GitHub, klik **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi **`alat/simulator-perangkat.js`**-mu.
2. Lakukan hal yang sama untuk [`kode/alat/pemeriksa-kontrak.js`](kode/alat/pemeriksa-kontrak.js) → **`alat/pemeriksa-kontrak.js`**, dan untuk [`kode/alat/README.md`](kode/alat/README.md) → **`alat/README.md`** (keterangan folder `alat` kini menyebut akun broker dan `--env-file=.env`).
3. Buka **`alat/.env.example`**, lalu ganti seluruh isinya dengan:

   ```text
   # Salin file ini menjadi .env (di folder alat), lalu isi akun dan kuncinya. File .env tidak ikut Git.
   # Pakai akun viewer: terminal kecil hanya melihat, jadi tidak perlu hak admin.
   EMAIL_TERMINAL=viewer@rumah.test
   SANDI_TERMINAL=
   # Modul 21: akun broker untuk pemeriksa-kontrak.js (hanya boleh membaca rpm/#). Buat sandinya seperti JWT_SECRET backend:
   #   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   PENGGUNA_PEMERIKSA=pemeriksa
   KUNCI_PEMERIKSA=
   # Modul 21: kunci broker perangkat latihan simulator, satu baris per perangkat (dari jawaban POST /devices di backend)
   KUNCI_F00D00000001=
   ```

Yang baru di kedua alat:

- **Simulator:** setiap perangkat palsu masuk dengan akunnya sendiri.

  ```js
      username: deviceId, // Modul 21: nama pengguna broker = device_id
      password: kunciPerangkat(deviceId), // Modul 21: dari alat/.env
  ```

  `kunciPerangkat()` membaca `KUNCI_F00D00000001`, `KUNCI_F00D00000002`, dan seterusnya dari `alat/.env`. Perangkat yang kuncinya belum ada **tidak dijalankan sama sekali**, karena tanpa kunci ia toh akan ditolak broker yang sudah dikunci. Kalau broker menolak kuncinya, simulator menulis `DITOLAK broker (kode 5)` dan mencoba lagi setiap 60 detik, sama dengan Node 1. Mode `bersihkan` kini hanya menghapus status *retained* perangkat palsu yang kuncinya ada, karena setiap perangkat hanya boleh menulis ke topiknya sendiri (Praktik 5).
- **Pemeriksa kontrak** (versi 1.4) masuk dengan akun `pemeriksa`:

  ```js
    username: process.env.PENGGUNA_PEMERIKSA, // Modul 21: akun "hanya membaca" dari alat/.env (kosong = tanpa akun)
    password: process.env.KUNCI_PEMERIKSA,
  ```

  Di Praktik 5, akun ini hanya diizinkan **membaca** `rpm/#`, karena pemeriksa memang tidak pernah menulis apa pun. Alamat broker kini juga boleh membawa *port*, misalnya `127.0.0.1:1884`. Tanpa *port*, pemeriksa tetap memakai 1883.

4. Buat sandi untuk akun `pemeriksa`. Di terminal kedua, jalankan perintah yang sama dengan Praktik 2:

   ```text
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Simpan hasilnya di pengelola sandimu dengan nama `akun broker pemeriksa`. Sandi ini dipasang ke broker di Praktik 4.
5. Buka **`alat/.env`** milikmu (bukan `.env.example`), berkas yang kamu buat di Modul 20 untuk terminal kecil. Di bawah dua baris yang sudah ada, tambahkan tiga baris ini, lalu simpan:

   ```text
   PENGGUNA_PEMERIKSA=pemeriksa
   KUNCI_PEMERIKSA=sandi-dari-langkah-4
   KUNCI_F00D00000001=kunci-perangkat-latihan-dari-praktik-1
   ```

   `KUNCI_F00D00000001` diisi kunci perangkat latihan yang kamu simpan di Praktik 1.9 dengan nama `kunci broker f00d00000001`. Tulis persis seperti contoh: tanpa spasi di sekitar `=` dan tanpa tanda petik.

#### 3.9 Coba: semua membawa kunci, broker masih terbuka (10 menit)

1. Di terminal ketiga (folder `alat`), coba dulu **tanpa** `--env-file=.env`, supaya kamu kenal pesannya. Ganti `192.168.1.37` dengan alamat broker-mu (jalur laptop dan Wokwi: `127.0.0.1`):

   ```text
   node simulator-perangkat.js mqtt://192.168.1.37:1883 1
   ```

   **Hasilnya:**

   ```text
   f00d00000001: kunci belum ada di alat/.env (KUNCI_F00D00000001=...), tidak dijalankan.
   Tidak ada perangkat palsu yang punya kunci. Isi alat/.env, lalu jalankan dengan: node --env-file=.env …
   ```

   Tanpa `--env-file=.env`, Node.js tidak membaca `alat/.env`, jadi simulator tidak menemukan kunci apa pun dan berhenti sendiri.

2. Sekarang jalankan dengan benar, untuk dua perangkat latihan:

   ```text
   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 2
   ```

   **Hasilnya** (**contoh**):

   ```text
   f00d00000002: kunci belum ada di alat/.env (KUNCI_F00D00000002=...), tidak dijalankan.
   1 perangkat palsu menuju mqtt://192.168.1.37:1883. Ketik "suhu 33" atau "suhu acak". Hentikan dengan Ctrl+C.
   f00d00000001: online
   f00d00000001: ambang sama dengan yang tersimpan {"suhu_kipas_on":30,"tanah_siram":30}
   f00d00000001: perintah c-20261022-191150-1 -> ok=true
   ```

   `f00d00000002` tidak punya kunci, karena memang tidak kamu daftarkan, jadi ia tidak dijalankan. `f00d00000001` masuk dengan nama pengguna dan kuncinya. Dua baris terakhir adalah `config` *retained* dari aturan Modul 19, yang diterima lagi setiap kali perangkat menyambung. Biarkan simulator berjalan.

3. Di terminal keempat (juga di folder `alat`), jalankan pemeriksa kontrak dengan akunnya. Jalur laptop dan Wokwi cukup menulis `node --env-file=.env pemeriksa-kontrak.js`, tanpa alamat:

   ```text
   node --env-file=.env pemeriksa-kontrak.js 192.168.1.37
   ```

   **Hasilnya** (**contoh**, dipotong):

   ```text
   Pemeriksa kontrak siap di broker 192.168.1.37:1883 (langganan rpm/#) — tekan Ctrl + C untuk berhenti.
   [02.18.26] rpm/f00d00000001/cmd  LULUS  [retained]
   [02.18.26] rpm/a4cf12e5b7c0/status  LULUS  [retained]
   [02.18.26] rpm/246f28b1c7d4/status  LULUS  [retained]
   [02.18.26] rpm/f00d00000001/status  LULUS  [retained]
   [02.18.29] rpm/f00d00000001/telemetry  LULUS
   [02.18.33] rpm/a4cf12e5b7c0/telemetry  LULUS
   [02.18.38] rpm/246f28b1c7d4/telemetry  LULUS  (telemetry Node 2)
   ```

   Semuanya `LULUS`. Jalur laptop dan Wokwi hanya melihat baris `f00d00000001`. Hentikan pemeriksa dengan **Ctrl + C** setelah beberapa baris.

4. Di Bruno, kirim **`login admin`**, lalu **`daftar perangkat`**. Perangkat yang membawa kunci kini `"status": "online"` dan `"kunci": "aktif"`. **Hasilnya** (**contoh**, satu baris saja):

   ```json
   {
     "device_id": "f00d00000001",
     "nama": "Latihan ruang tamu",
     "lokasi": "ruang tamu",
     "jenis": "node1",
     "status": "online",
     "terakhir_dilihat": "2026-10-22T19:21:19Z",
     "kunci": "aktif",
     "terdaftar": "2026-10-22T19:09:28Z",
     "kunci_dibuat": "2026-10-22T19:09:28Z",
     "dicabut": null,
     "penghubung": null
   }
   ```

   Di jalur perangkat, baris `a4cf12e5b7c0` juga `online` dan `aktif`, dan Node 2 tetap `tanpa-kunci` dengan `penghubung` `a4cf12e5b7c0`.

5. **Jalur perangkat:** lihat buktinya di catatan broker. Di terminal SSH ke Pi, jalankan:

   ```bash
   sudo tail -n 20 /var/log/mosquitto/mosquitto.log
   ```

   Di antara baris-baris terakhirnya ada (**contoh**, ditulis dari kode sumber Mosquitto 2.0.21):

   ```text
   1792811707: New client connected from 192.168.1.23:52731 as a4cf12e5b7c0 (p2, c1, k15, u'a4cf12e5b7c0').
   1792811768: New client connected from 192.168.1.10:50837 as f00d00000001 (p2, c1, k15, u'f00d00000001').
   1792811769: New client connected from 192.168.1.10:50839 as pemeriksa-7dc9cd (p2, c1, k60, u'pemeriksa').
   ```

   Sampai Modul 20, baris Node 1 berakhir `(p2, c1, k15).` Kini ada `u'…'`, nama pengguna (*username*) yang dibawa setiap klien. Sandi dan kunci tidak pernah ditulis di catatan broker. Baris backend (`u'backend'`) sudah muncul sejak Praktik 2. Hanya satu klien yang masih datang tanpa nama: Node-RED, yang nama kliennya diawali `nodered`. Ia mendapat akunnya di Praktik 4.

Kalau kamu langsung lanjut ke Praktik 4, biarkan simulator berjalan. Kalau ingin istirahat dulu, hentikan saja dengan **Ctrl + C**; Praktik 4 menjalankannya lagi.

#### 3.10 Simpan ke cabang (3 menit)

Sebelum menyimpan, pastikan kedelapan file di folder `firmware/node-1-rumah` repositorimu sudah berisi versi baru (kalau kamu memakai Wokwi, bukan hanya tab Wokwi-nya), dan `WOKWI_BERKUNCI` di `konfigurasi.h` repositorimu tetap `false`. Di terminal kedua (folder `backend`), ketik:

```text
git add ../firmware/node-1-rumah ../alat/simulator-perangkat.js ../alat/pemeriksa-kontrak.js ../alat/README.md ../alat/.env.example
git status
git commit -m "Perangkat membawa kunci: Node 1 v1.6.0, simulator dan pemeriksa dengan akun broker (Modul 21 Praktik 3)"
```

`alat/.env`, yang kini berisi kunci perangkat latihan dan sandi akun `pemeriksa`, tidak ikut Git, dan `git status` tidak menyebutnya. Kunci Node 1 hanya ada di NVS papannya, tidak di file mana pun.

> ⬆️ **Selesai Praktik 3?** Baca [Konsep 6](#6-penjaga-pintu-broker-berkas-sandi-dan-satu-akun-untuk-setiap-program), lalu lanjut ke [Praktik 4 — Mengunci pintu broker](#praktik-4--mengunci-pintu-broker-60-menit).

### Praktik 4 — Mengunci pintu broker (60 menit)

> 🖥️ **Alat yang dipakai:** **Jalur perangkat:** terminal SSH ke Pi (`ssh budi@192.168.1.37`) dan editor Node-RED di browser (`http://192.168.1.37:1880`). **Jalur laptop dan Wokwi:** **Terminal (Admin)** di Windows (macOS: **Terminal**) untuk menghentikan layanan Mosquitto, lalu terminal VS Code di folder `edge`. **Semua jalur:** **MQTTX**, **Bruno**, dan terminal VS Code yang menjalankan backend dan simulator. Konsep yang dipakai: Konsep 6, ditambah satu baris dari Konsep 8.
>
> ⭐ **Wajib** — syarat lulus pertama: MQTTX tanpa sandi ditolak broker.

Semua penghuni rumah yang sah sudah memegang kuncinya. Sekarang giliran broker memeriksa kunci itu. Ada tiga pekerjaan: membuat **berkas sandi** berisi satu akun untuk setiap program, memberi Node-RED akunnya (jalur perangkat), lalu mengganti pengaturan broker dan menyalakannya ulang. Setelah itu, tamu tanpa sandi ditolak.

Inilah akun-akun yang dibuat. Semua sandinya sudah ada di pengelola sandimu, kecuali dua yang dibuat di langkah 4.1:

| Akun (nama pengguna) | Dipakai oleh | Sandinya | Jalur |
| :--- | :--- | :--- | :--- |
| `backend` | backend (`backend/.env`) | sandi acak dari Praktik 2.6 | semua |
| `nodered` | Node-RED di Pi | sandi acak baru (langkah 4.1) | perangkat |
| `pemantau` | MQTTX milikmu | sandi acak baru (langkah 4.1) | semua |
| `pemeriksa` | pemeriksa kontrak (`alat/.env`) | sandi acak dari Praktik 3.8 | semua |
| `a4cf12e5b7c0` | Node 1 (pakai `device_id` milikmu) | kunci Node 1 dari Praktik 1.9 | perangkat |
| `f00d00000001` | simulator, perangkat latihan | kunci perangkat latihan dari Praktik 1.9 | semua |

Node 2 tidak butuh akun: ia tidak pernah menyambung ke broker sendiri, karena pesannya diteruskan Node 1 lewat ESP-NOW. Jalur laptop yang masih menjalankan Node-RED di laptop (Modul 13 Praktik 8) juga membuat akun `nodered`.

#### 4.1 Dua sandi baru: `nodered` dan `pemantau` (3 menit)

Di terminal kedua VS Code, jalankan perintah pembuat sandi dari Praktik 2 **dua kali**:

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Simpan hasil pertama di pengelola sandimu dengan nama `akun broker nodered`, dan hasil kedua dengan nama `akun broker pemantau`. Jalur laptop tanpa Node-RED cukup membuat yang kedua.

#### 4.2 Jalur perangkat: daftar akun di Pi (10 menit)

Semua perintah di langkah ini diketik **di Pi**, lewat terminal SSH. Biarkan terminal SSH ini terbuka sampai Praktik 4 selesai: itulah jalan pulangmu kalau ada yang salah (aturan aman nomor 3).

1. Buat berkas sandi dengan akun pertama, `backend`:

   ```bash
   sudo mosquitto_passwd -c /etc/mosquitto/sandi-broker backend
   ```

   Terminal bertanya `Password:`. Tempel sandi akun `backend` dari pengelola sandimu dengan klik kanan (macOS: **Cmd + V**), lalu tekan **Enter**. Sandinya **tidak tampil sama sekali**, sama seperti di Kemenangan Cepat. Ulangi untuk `Reenter password:`. Kalau berhasil, `mosquitto_passwd` versi Pi tidak menulis apa pun.

   Berkasnya sengaja ditaruh di `/etc/mosquitto`, **di luar** folder `conf.d`. Folder `conf.d` khusus untuk berkas pengaturan `.conf` yang dibaca broker saat menyala.

2. Tambahkan lima akun lainnya, satu perintah untuk setiap akun. Perhatikan: **tanpa `-c`**.

   ```bash
   sudo mosquitto_passwd /etc/mosquitto/sandi-broker nodered
   sudo mosquitto_passwd /etc/mosquitto/sandi-broker pemantau
   sudo mosquitto_passwd /etc/mosquitto/sandi-broker pemeriksa
   sudo mosquitto_passwd /etc/mosquitto/sandi-broker a4cf12e5b7c0
   sudo mosquitto_passwd /etc/mosquitto/sandi-broker f00d00000001
   ```

   Jalankan satu per satu, dan setiap kali tempel sandi yang cocok dari tabel di atas, dua kali. Untuk `a4cf12e5b7c0` dan `f00d00000001`, sandinya adalah **kunci perangkat** dari Praktik 1.9: kunci yang sama dengan yang tersimpan di NVS Node 1 dan di `alat/.env`.

   > [!WARNING]
   > **`-c` hanya untuk akun pertama.** `-c` berarti "buat berkas baru". Di Pi, `-c` **menimpa berkas lama tanpa bertanya**, jadi semua akun yang sudah ada ikut hilang. Kalau telanjur, ulangi saja langkah 1 dan 2 dari awal.

3. Serahkan berkas itu kepada broker, lalu tutup untuk yang lain:

   ```bash
   sudo chown mosquitto:mosquitto /etc/mosquitto/sandi-broker
   sudo chmod 600 /etc/mosquitto/sandi-broker
   ```

   Di Pi, broker menyala sebagai `root`, lalu segera pindah menjadi pengguna `mosquitto` sebelum membaca berkas sandi. `chown` menjadikan `mosquitto` pemilik berkas itu, dan `chmod 600` berarti hanya pemiliknya yang boleh membaca dan menulisnya. Menurut kode sumber Mosquitto, tanpa `chown` broker tidak bisa membaca berkas buatan `sudo` dan **gagal menyala** di langkah 4.4.

4. Periksa hasilnya:

   ```bash
   sudo ls -l /etc/mosquitto/sandi-broker
   sudo cat /etc/mosquitto/sandi-broker
   ```

   **Hasilnya** (**contoh**; garam dan sidik jarinya diganti `…`):

   ```text
   -rw------- 1 mosquitto mosquitto 739 Oct 23 10:21 /etc/mosquitto/sandi-broker
   backend:$7$101$…$…
   nodered:$7$101$…$…
   pemantau:$7$101$…$…
   pemeriksa:$7$101$…$…
   a4cf12e5b7c0:$7$101$…$…
   f00d00000001:$7$101$…$…
   ```

   `-rw-------` berarti hanya pemiliknya, `mosquitto`, yang boleh membaca dan menulis. Ada enam baris, satu untuk setiap akun. Setiap baris berisi nama pengguna, resep `$7$` dengan 101 putaran, garam 16 huruf, dan sidik jari 88 huruf, sehingga panjangnya 120–125 huruf (Konsep 6). Tidak ada satu pun sandi atau kunci aslinya di berkas ini.

#### 4.3 Jalur perangkat: Node-RED memakai akunnya (5 menit)

Broker masih terbuka, jadi Node-RED yang membawa akun tetap diterima seperti biasa. Kerjakan ini **sebelum** broker dikunci; kalau tidak, dashboard-mu tertolak.

1. Buka editor Node-RED di browser laptop, `http://192.168.1.37:1880`, lalu masuk dengan akun editor dari Modul 13.
2. Klik dua kali salah satu node MQTT, misalnya `telemetry Node 1`. Di baris **Server** (`Mosquitto di gateway`), klik **ikon pensil** di sebelah kanannya.
3. Di jendela pengaturan broker, buka tab **Security**. Isi **Username** dengan `nodered`, lalu tempel sandi `akun broker nodered` ke **Password**.
4. Klik **Update**, lalu **Done**, lalu **Deploy** di kanan atas.

Titik hijau `connected` di bawah node-node MQTT tetap menyala. Semua node MQTT memakai node broker yang sama, jadi akun cukup diisi sekali (Modul 13). Seperti kata sandi lain milik Node-RED, nama pengguna dan sandi ini disimpan terkunci di `flows_cred.json`, tidak ikut ekspor `edge/node-red-flows.json`, dan tidak ikut Git.

#### 4.4 Jalur perangkat: kunci pintunya, lalu *restart* (10 menit)

1. Di terminal SSH, buka berkas pengaturan broker dari Modul 12:

   ```bash
   sudo nano /etc/mosquitto/conf.d/gateway-pi.conf
   ```

   Hapus seluruh isinya: tekan **Ctrl + K** berulang kali sampai berkasnya kosong. Lalu ketik isi baru berikut, simpan (**Ctrl + O**, **Enter**), dan keluar (**Ctrl + X**):

   ```text
   # gateway-pi.conf - broker Rumah Pintar Mini di gateway Raspberry Pi (Modul 12), dikunci di Modul 21.
   # Tempatnya di Pi: /etc/mosquitto/conf.d/gateway-pi.conf. Akun ada di /etc/mosquitto/sandi-broker (mosquitto_passwd).
   # Lalu lintas belum dienkripsi: jangan membuat port forwarding ke Pi (Modul 27).
   listener 1883
   # tanpa nama pengguna dan sandi yang terdaftar, tidak boleh masuk
   allow_anonymous false
   password_file /etc/mosquitto/sandi-broker
   # nama klien selalu = nama pengguna (device_id): tidak ada yang bisa menyamar atau menendang perangkat lain
   use_username_as_clientid true
   ```

   Baris yang diawali `#` hanya catatan untuk manusia dan boleh disingkat. Empat baris lainnya harus diketik persis:

   - `listener 1883`: pintu yang sama dengan Modul 12.
   - `allow_anonymous false`: tamu tanpa nama pengguna tidak boleh masuk.
   - `password_file /etc/mosquitto/sandi-broker`: daftar akun dari langkah 4.2.
   - `use_username_as_clientid true`: nama klien setiap tamu diganti dengan nama penggunanya, jadi tidak ada yang bisa menyamar dengan nama klien perangkat lain. Alasan lengkapnya ada di Konsep 8.

2. Nyalakan ulang broker. Ini **restart**, bukan *reload*: `use_username_as_clientid` tidak ikut terbaca saat *reload* (Konsep 9).

   ```bash
   sudo systemctl restart mosquitto
   systemctl status mosquitto
   ```

   `Active:` harus `active (running)`. Muncul `failed`? Buka "Broker gagal menyala setelah dikunci" di 🚨. Terminal SSH-mu masih terbuka, jadi kamu bisa langsung memperbaikinya.

3. Lihat siapa saja yang masuk lagi:

   ```bash
   sudo tail -n 20 /var/log/mosquitto/mosquitto.log
   ```

   **Hasilnya** (**contoh**, ditulis dari kode sumber Mosquitto 2.0.21, dipotong):

   ```text
   1792813805: mosquitto version 2.0.21 terminating
   1792813805: Saving in-memory database to /var/lib/mosquitto//mosquitto.db.
   1792813806: mosquitto version 2.0.21 starting
   1792813806: Config loaded from /etc/mosquitto/mosquitto.conf.
   1792813806: Opening ipv4 listen socket on port 1883.
   1792813806: Opening ipv6 listen socket on port 1883.
   1792813806: mosquitto version 2.0.21 running
   1792813807: New connection from 192.168.1.23:52741 on port 1883.
   1792813807: New client connected from 192.168.1.23:52741 as a4cf12e5b7c0 (p2, c1, k15, u'a4cf12e5b7c0').
   1792813811: New connection from 192.168.1.10:51022 on port 1883.
   1792813811: New client connected from 192.168.1.10:51022 as backend (p2, c1, k60, u'backend').
   1792813812: New connection from 192.168.1.10:51024 on port 1883.
   1792813812: New client connected from 192.168.1.10:51024 as f00d00000001 (p2, c1, k15, u'f00d00000001').
   ```

   Semua yang membawa kunci masuk lagi dalam beberapa detik. Perhatikan nama backend: dulu `backend-2a2580` (nama acak buatan backend), kini **`backend`**, sama dengan nama akunnya. Itulah kerja `use_username_as_clientid`. Node-RED juga kini tercatat sebagai `nodered`. Kalau ada program yang belum membawa akun, di log muncul baris `Client … disconnected, not authorised.` Baris seperti itu yang berasal dari MQTTX-mu memang diharapkan; kita membahasnya di 4.6.

4. **Di laptop**, buka `edge/gateway-pi.conf` di VS Code, lalu ganti seluruh isinya dengan isi yang sama dengan langkah 1. Berkas ini adalah salinan pengaturan Pi di repositorimu, dan disimpan ke Git di 4.8.

Lanjut ke 4.6. Langkah 4.5 khusus untuk jalur laptop dan Wokwi.

#### 4.5 Jalur laptop dan Wokwi: daftar akun dan broker berkunci di terminal (15 menit)

Seperti Modul 19 Praktik 7, broker berkunci dijalankan di **terminal VS Code** dari folder `edge`, bukan sebagai layanan. Dengan begitu, catatan broker langsung terlihat, dan menyalakan ulang cukup dengan **Ctrl + C** lalu menjalankannya lagi. Cara mengunci layanan laptop secara permanen ada di 🔬.

1. **Buat berkas sandi.** Buka terminal baru di VS Code (**Terminal → New Terminal**), yang langsung berada di folder `rumah-pintar-mini`, lalu masuk ke folder `edge`:

   ```text
   cd edge
   ```

   Buat akun pertama dengan `-c`:

   ```text
   mosquitto_passwd -c sandi-broker backend
   ```

   **Hasilnya** (**contoh**, Mosquitto 2.1.2):

   ```text
   Adding password for user backend
   Password:
   Reenter password:
   ```

   Di setiap pertanyaan, tempel sandi akun `backend` (**Ctrl + V**; macOS: **Cmd + V**), lalu tekan **Enter**. Sandinya tidak tampil. Lalu tambahkan akun lainnya, **tanpa `-c`**, dan tempel sandi yang cocok dari tabel di atas:

   ```text
   mosquitto_passwd sandi-broker pemantau
   mosquitto_passwd sandi-broker pemeriksa
   mosquitto_passwd sandi-broker f00d00000001
   ```

   Masih menjalankan Node-RED di laptop? Tambahkan juga `mosquitto_passwd sandi-broker nodered`, lalu isi akunnya di Node-RED seperti 4.3, dengan alamat editor `http://127.0.0.1:1880`.

   Berkas sandi buatan `mosquitto_passwd` di laptop otomatis hanya bisa dibaca akunmu sendiri, jadi tidak perlu `chown` seperti di Pi.

2. **Jangan sampai ikut Git.** Buka `.gitignore` di folder `rumah-pintar-mini` (bukan `alat/.gitignore` atau `backend/.gitignore`), lalu tambahkan dua baris ini di paling bawah dan simpan:

   ```text
   # Modul 21: berkas sandi broker (sidik jari akun MQTT): tidak pernah ikut ke GitHub. Daftar izin edge/acl-broker boleh ikut.
   edge/sandi-broker
   ```

3. **Tulis pengaturannya.** Buka `edge/mosquitto-lan.conf`, lalu ganti seluruh isinya dengan:

   ```text
   # mosquitto-lan.conf - broker latihan Modul 11 untuk jaringan rumah, dikunci di Modul 21.
   # Jalankan dari folder edge: mosquitto -v -c mosquitto-lan.conf. Matikan broker sebelum laptop tersambung ke WiFi umum.
   # Akun ada di sandi-broker (dibuat mosquitto_passwd di laptop ini; tidak ikut Git).
   listener 1883
   # tanpa nama pengguna dan sandi yang terdaftar, tidak boleh masuk
   allow_anonymous false
   password_file sandi-broker
   # nama klien selalu = nama pengguna (device_id): tidak ada yang bisa menyamar atau menendang perangkat lain
   use_username_as_clientid true
   ```

   Empat baris pengaturannya sama dengan Pi (lihat penjelasannya di 4.4 langkah 1), kecuali `password_file sandi-broker`, yang menunjuk berkas di folder `edge` ini.

4. **Hentikan layanan Mosquitto laptop.** Dua broker tidak bisa memakai port 1883 bersamaan. Di Windows, buka **Terminal (Admin)** (klik kanan tombol **Start** → **Terminal (Admin)**), lalu:

   ```powershell
   net stop mosquitto
   ```

   Di macOS: `brew services stop mosquitto`. Di Linux: `sudo systemctl stop mosquitto`. Mulai detik ini, backend dan simulator menulis bahwa broker tak terjangkau. Itu wajar; mereka terus mencoba.

   Mulai sekarang sampai akhir modul, broker berkunci kamu jalankan di **terminal** ini (langkah 5), persis seperti broker latihan Modul 11. Layanan Mosquitto lama sengaja dibiarkan berhenti supaya tidak berebut pintu 1883. Kalau suatu saat kamu ingin broker berkunci menyala sendiri sebagai layanan (tanpa terminal terbuka), caranya ada di 🔬 "Mengunci layanan Mosquitto di laptop secara permanen"; untuk modul ini, broker di terminal sudah cukup.

5. **Nyalakan broker berkunci** di terminal folder `edge` tadi:

   ```text
   mosquitto -v -c mosquitto-lan.conf
   ```

   **Hasilnya** (**contoh**, Mosquitto 2.1.2; baris `…` berisi keterangan fitur dan catatan rinci dari `-v`):

   ```text
   1792813805: mosquitto version 2.1.2 starting
   1792813805: Config loaded from mosquitto-lan.conf.
   …
   1792813805: Opening ipv4 listen socket on port 1883.
   1792813805: Opening ipv6 listen socket on port 1883.
   …
   1792813805: mosquitto version 2.1.2 running
   1792813806: New connection from 127.0.0.1:53611 on port 1883.
   1792813806: New client connected from 127.0.0.1:53611 as backend (p4, c1, k60, u'backend').
   …
   1792813808: New connection from 127.0.0.1:53615 on port 1883.
   1792813808: New client connected from 127.0.0.1:53615 as f00d00000001 (p4, c1, k15, u'f00d00000001').
   ```

   Backend dan simulator masuk lagi sendiri dalam beberapa detik. Nama backend kini **`backend`**, bukan `backend-2a2580` seperti dulu: itulah kerja `use_username_as_clientid` (Konsep 8). Biarkan terminal broker ini menyala selama Praktik 4–8.

#### 4.6 ⭐ MQTTX tanpa sandi ditolak (7 menit)

1. Di MQTTX, pilih sambunganmu yang lama, **Gateway Pi** (jalur perangkat) atau **Broker laptop** (jalur laptop dan Wokwi). Sambungan itu dibuat di Modul 11–12 **tanpa** nama pengguna. Kalau belum mencoba menyambung sendiri, klik **Connect**.

   **Hasilnya:** pemberitahuan merah **`Error: Connection refused: Not authorized`**, dan nama sambungannya tidak hijau. Log broker mencatat (**contoh**, ditulis dari kode sumber Mosquitto). Di Pi:

   ```text
   1792813862: New connection from 192.168.1.10:53388 on port 1883.
   1792813862: Client mqttx_3f9a1c2b disconnected, not authorised.
   ```

   Di laptop (2.1.2), baris keduanya sedikit lain: `Client mqttx_3f9a1c2b [127.0.0.1:53701] disconnected: not authorised.` `mqttx_3f9a1c2b` adalah nama klien buatan MQTTX; di layarmu angkanya berbeda.

   **Itulah syarat lulus pertama modul ini.** Tamu tanpa sandi, seperti tamu iseng di pembuka modul, tidak bisa lagi masuk ke broker, apalagi menyalakan pompa.

2. Sekarang beri MQTTX akunnya. Ubah sambungan itu lewat pilihan **Edit**-nya, seperti saat mengganti **Host** di Modul 11–12. Isi **Username** dengan `pemantau`, tempel sandi `akun broker pemantau` ke **Password**, lalu klik **Connect** di kanan atas.

   **Hasilnya:** pemberitahuan hijau **`Connected`**. Log broker (**contoh**, Pi):

   ```text
   1792813901: New client connected from 192.168.1.10:53390 as pemantau (p5, c1, k60, u'pemantau').
   ```

   Nama kliennya kini `pemantau`, bukan `mqttx_3f9a1c2b`. Karena itu, jangan membuka dua sambungan MQTTX dengan akun `pemantau` sekaligus: keduanya akan saling tendang (Konsep 8).

3. Coba sekali lagi dengan sandi yang **salah**, misalnya hapus satu huruf terakhirnya. Jawabannya kembali `Error: Connection refused: Not authorized`, sama persis dengan tanpa sandi. Kembalikan sandinya yang benar, lalu **Connect** lagi.
4. Tambahkan langganan `rpm/#` (**+ New Subscription**). Pesan dari semua perangkat mengalir seperti biasa.

> [!IMPORTANT]
> **Penjaga pintu baru memeriksa siapa yang masuk, belum apa yang boleh dilakukan di dalam.** Sampai Praktik 5, setiap akun yang sah, termasuk `pemantau` di MQTTX, masih boleh menulis ke topik mana pun, termasuk `rpm/a4cf12e5b7c0/cmd`. Jangan heran kalau percobaan seperti itu masih berhasil. Praktik 5 memasang daftar izin yang menutupnya.

#### 4.7 Semua penghuni rumah tetap tersambung (10 menit)

Periksa satu per satu, dari terminal yang masih terbuka sejak Praktik 3.

1. **Backend** (terminal pertama). **Hasilnya** (**contoh**, dipotong; jalur laptop: `mqtt://127.0.0.1:1883`):

   ```text
   [02:46:33] WARN: broker belum terjangkau, mencoba lagi dalam 5 detik
   [02:46:33] INFO: tersambung ke broker mqtt://192.168.1.37:1883 sebagai backend
   [02:46:33] INFO: config c-20261022-194633-2 ke f00d00000001: suhu_kipas_on 30 dari aturan 1 (retained)
   [02:46:33] INFO: config c-20261022-194633-2 ke f00d00000001: ack ok=true
   ```

   Baris `WARN` ditulis saat backend mulai mencoba menyambung lagi, dan langsung disusul `tersambung … sebagai backend`. Sebelumnya mungkin ada satu baris `ERROR: galat MQTT: read ECONNRESET`, bergantung pada cara broker berhenti. `npm run dev` **tidak** perlu dijalankan ulang.

2. **Simulator** (terminal ketiga). **Hasilnya** (**contoh**):

   ```text
   f00d00000001: broker tak terjangkau, mencoba lagi setiap 5 detik
   f00d00000001: online
   f00d00000001: ambang sama dengan yang tersimpan {"suhu_kipas_on":30,"tanah_siram":30}
   f00d00000001: perintah c-20261022-194633-2 -> ok=true
   ```

   Kalau simulatornya sudah kamu hentikan di akhir Praktik 3, jalankan lagi: `node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 2` (jalur laptop: `mqtt://127.0.0.1:1883`).

3. **Node 1** (jalur perangkat). Di Serial Monitor, `MQTT PUTUS: …` saat broker dinyalakan ulang, lalu beberapa detik kemudian `MQTT tersambung ke broker 192.168.1.37:1883 … sebagai a4cf12e5b7c0`. Kalau yang muncul `MQTT DITOLAK broker (kode 5): kunci salah, belum didaftarkan, atau sudah dicabut.`, kunci di NVS dan di berkas sandi tidak sama. Buka "Node 1 atau simulator DITOLAK setelah broker dikunci" di 🚨.

4. **Pemeriksa kontrak** (terminal keempat). Pemeriksa sengaja tidak menyambung ulang sendiri, jadi jalankan lagi:

   ```text
   node --env-file=.env pemeriksa-kontrak.js 192.168.1.37
   ```

   **Hasilnya** (**contoh**, dipotong; jalur laptop dan Wokwi: tanpa alamat, dan hanya baris `f00d00000001`):

   ```text
   Pemeriksa kontrak siap di broker 192.168.1.37:1883 (langganan rpm/#) — tekan Ctrl + C untuk berhenti.
   [02.47.37] rpm/f00d00000001/cmd  LULUS  [retained]
   [02.47.37] rpm/a4cf12e5b7c0/status  LULUS  [retained]
   [02.47.37] rpm/246f28b1c7d4/status  LULUS  [retained]
   [02.47.37] rpm/f00d00000001/status  LULUS  [retained]
   [02.47.39] rpm/246f28b1c7d4/telemetry  LULUS  (telemetry Node 2)
   [02.47.41] rpm/f00d00000001/telemetry  LULUS
   [02.47.45] rpm/a4cf12e5b7c0/telemetry  LULUS
   ```

   Hentikan dengan **Ctrl + C**, lalu coba sekali **tanpa** `--env-file=.env`: `node pemeriksa-kontrak.js 192.168.1.37`. **Hasilnya:**

   ```text
   Broker 192.168.1.37:1883 menolak akun pemeriksa (kode 5). Isi PENGGUNA_PEMERIKSA dan KUNCI_PEMERIKSA di alat/.env, lalu jalankan dengan: node --env-file=.env pemeriksa-kontrak.js …
   ```

   Tanpa `alat/.env`, pemeriksa datang tanpa nama, dan broker menolaknya seperti tamu lain.

5. **Node-RED** (jalur perangkat). Buka dashboard `http://192.168.1.37:1880/dashboard/rumah`. Angka-angkanya tetap berganti setiap 10 detik.
6. **Bruno.** Kirim **`login admin`**, **`daftar perangkat`**, lalu **`health`**. Perangkat yang membawa kunci tetap `"status": "online"`, dan `/health` menulis `"broker": true`. **Hasilnya** (**contoh**, `health`):

   ```json
   {
     "ok": true,
     "broker": true,
     "database": true,
     "diterima": 184,
     "ditolak": 0,
     "diabaikan": 0
   }
   ```

**Coba juga: satu akun, satu sambungan.** Selagi pemeriksa berjalan dengan akunnya, jalankan pemeriksa kedua di terminal lain dengan perintah yang sama. Yang kedua masuk, sedangkan yang pertama berhenti dengan pesan (**contoh**):

```text
Sambungan ke broker 192.168.1.37:1883 putus: broker dimatikan, atau akun pemeriksa yang sama dipakai program lain (satu akun = satu sambungan). Jalankan lagi pemeriksanya.
Ringkasan: 13 pesan LULUS, 0 pesan GAGAL.
```

Nama klien keduanya sama-sama `pemeriksa` (Konsep 8), dan broker hanya mengizinkan satu sambungan untuk setiap nama klien. Hentikan pemeriksa kedua dengan **Ctrl + C**.

#### 4.8 Simpan ke cabang (5 menit)

Repositorimu menyimpan pengaturan **kedua** broker, apa pun jalurmu. Jadi, sebelum menyimpan:

- Pastikan `edge/gateway-pi.conf` berisi pengaturan dari 4.4 langkah 1, dan `edge/mosquitto-lan.conf` berisi pengaturan dari 4.5 langkah 3. Jalur perangkat yang belum mengubah `mosquitto-lan.conf`, dan jalur laptop yang belum mengubah `gateway-pi.conf`, salin sekarang isinya dari langkah-langkah itu.
- Pastikan `.gitignore` di folder `rumah-pintar-mini` sudah memuat dua baris dari 4.5 langkah 2. Jalur perangkat pun menambahkannya, supaya berkas sandi tidak pernah ikut Git kalau suatu hari kamu membuatnya di laptop.

Di terminal kedua (folder `backend`), periksa dulu bahwa berkas sandi memang diabaikan Git:

```text
git check-ignore -v ../edge/sandi-broker
```

**Hasilnya** (**contoh**; angka `4` adalah nomor baris di `.gitignore`-mu):

```text
.gitignore:4:edge/sandi-broker	../edge/sandi-broker
```

Satu baris itu berarti Git mengabaikan berkas sandimu. Jalur perangkat juga melihat baris yang sama walaupun berkasnya tidak ada di laptop: aturannya sudah siap. Kalau tidak ada keluaran sama sekali, baris di `.gitignore` belum tersimpan. Lalu simpan:

```text
git add ../edge/gateway-pi.conf ../edge/mosquitto-lan.conf ../.gitignore
git status
git commit -m "Broker dikunci: berkas sandi, satu akun untuk setiap program, use_username_as_clientid (Modul 21 Praktik 4)"
```

`git status` tidak boleh menyebut `edge/sandi-broker`. Di Pi, berkas sandinya memang tidak pernah ada di repositori.

> ⬆️ **Selesai Praktik 4?** Baca [Konsep 7](#7-daftar-izin-acl-setiap-perangkat-di-topiknya-sendiri) dan [Konsep 8](#8-nama-klien-bisa-dipalsukan-use_username_as_clientid), lalu lanjut ke [Praktik 5 — Daftar izin](#praktik-5--daftar-izin-setiap-perangkat-di-topiknya-sendiri-45-menit).

### Praktik 5 — Daftar izin: setiap perangkat di topiknya sendiri (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (berkas baru `edge/acl-broker`, terminal kedua di folder `backend`), **MQTTX** dengan akun `pemantau`, **Bruno**, dan **pemeriksa kontrak**. **Jalur perangkat:** terminal SSH ke Pi dan Serial Monitor Node 1. **Jalur laptop dan Wokwi:** terminal broker di folder `edge`. Konsep yang dipakai: Konsep 7 dan 8.

Broker kini tahu **siapa** yang masuk. Praktik ini mengatur **apa** yang boleh dilakukan setiap akun di dalam, lewat **daftar izin** (ACL) dengan pola `%u`. Mulai dulu dengan melihat lubang yang masih tersisa.

#### 5.1 Lubang yang tersisa: MQTTX masih bisa memerintah (3 menit)

Di MQTTX, sambunganmu sudah masuk sebagai `pemantau` sejak Praktik 4. Di kotak kirim bagian bawah, pilih format **Plaintext**, isi topik dengan `rpm/a4cf12e5b7c0/cmd` (jalur laptop dan Wokwi: `rpm/f00d00000001/cmd`), lalu kirim pesan ini:

```json
{"id":"c-iseng-2","ts":"2026-10-24T04:00:00Z","aksi":"set","target":"lampu","nilai":true}
```

**Hasilnya:** lampu Node 1 **menyala**. Jalur laptop dan Wokwi melihatnya di terminal simulator (**contoh**):

```text
f00d00000001: perintah c-iseng-2 -> ok=true
```

Log backend pun menulis `INFO: ack c-iseng-2 tiba, tetapi tidak ada perintah yang menunggunya`: Node 1 menjawab perintah yang tidak pernah dikirim backend. Akun `pemantau` sah, jadi penjaga pintu membiarkannya masuk, dan di dalam belum ada aturan apa pun. Akun itu hanya untuk mengintip, tetapi kini bisa menyalakan lampu, dan sama mudahnya pompa. Jalur perangkat: padamkan lagi lampunya dengan **`matikan lampu`** di Bruno.

#### 5.2 Tulis daftar izin: `edge/acl-broker` (10 menit)

Di VS Code, klik kanan folder **`edge`** → **New File…**, beri nama **`acl-broker`** (tanpa akhiran), lalu ketik:

```text
# acl-broker - daftar izin broker Rumah Pintar Mini (Modul 21).
# Mosquitto membaca berkas ini dari atas ke bawah. Baris berawalan # adalah catatan (# harus huruf pertama baris).
# Akun yang tidak disebut di sini tidak boleh menulis atau membaca apa pun.
# Setiap kali berkas ini diubah, RESTART broker (bukan reload).

# 1) Setiap perangkat hanya boleh "bicara" di topiknya sendiri. Baris pattern berlaku untuk SEMUA akun;
#    %u diganti nama pengguna yang sudah terbukti dengan sandi, yaitu device_id perangkat itu.
pattern write rpm/%u/telemetry
pattern write rpm/%u/status
pattern write rpm/%u/vitals
pattern write rpm/%u/ack
pattern read rpm/%u/cmd

# 2) Satu pengecualian di kontrak data (aturan 6): Node 1 menerbitkan telemetry dan status Node 2.
#    Ganti a4cf12e5b7c0 dengan device_id Node 1-mu dan 246f28b1c7d4 dengan device_id Node 2-mu.
user a4cf12e5b7c0
topic write rpm/246f28b1c7d4/telemetry
topic write rpm/246f28b1c7d4/status

# 3) Backend: membaca semua pesan perangkat, mengirim perintah (set dan config) ke cmd.
user backend
topic read rpm/#
topic write rpm/+/cmd

# 4) Node-RED di gateway Pi: dashboard membaca, sakelar Kipas mengirim cmd.
user nodered
topic read rpm/#
topic write rpm/+/cmd

# 5) Pemeriksa kontrak (alat/pemeriksa-kontrak.js): hanya membaca.
user pemeriksa
topic read rpm/#

# 6) Pemantau (MQTTX, mosquitto_sub): hanya melihat, termasuk statistik broker di $SYS.
user pemantau
topic read rpm/#
topic read $SYS/#
```

Ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu dan `246f28b1c7d4` dengan `device_id` Node 2-mu, persis seperti tiga baris yang diberikan backend saat kamu mendaftarkan Node 2 di Praktik 1.9. Jalur laptop dan Wokwi boleh membiarkan keduanya apa adanya; blok itu tidak berpengaruh tanpa Node 1.

Cara membacanya (Konsep 7):

- **Blok 1, `pattern`**, berlaku untuk **semua** akun. `%u` diganti nama pengguna akun yang sedang memeriksa. Untuk akun `f00d00000001`, baris `pattern write rpm/%u/telemetry` menjadi `write rpm/f00d00000001/telemetry`. Setiap perangkat boleh menulis keempat topik miliknya dan membaca `cmd`-nya sendiri, tidak lebih.
- **Blok 2, `user a4cf12e5b7c0`**, adalah satu-satunya pengecualian di kontrak data (aturan 6): Node 1 menerbitkan `telemetry` dan `status` Node 2, karena Node 2 berbicara lewat ESP-NOW.
- **Blok 3–6** memberi hak kepada program: `backend` dan `nodered` membaca semuanya dan boleh menulis ke `cmd` perangkat mana pun (`rpm/+/cmd`), sedangkan `pemeriksa` dan `pemantau` **hanya membaca**. `$SYS/#` adalah topik statistik milik broker sendiri.
- **Yang tidak disebut, tidak boleh.** Setelah daftar izin dipasang, akun apa pun hanya boleh melakukan yang tertulis di sini. Karena itu, tidak ada baris yang mengizinkan siapa pun menulis ke `cmd` selain `backend` dan `nodered`.

Catatan `#` hanya boleh di awal baris, sama dengan berkas `.conf`.

#### 5.3 Jalur perangkat: pasang di Pi, lalu *restart* (10 menit)

1. **Kirim berkasnya ke Pi.** Di terminal kedua (folder `backend`), salin dengan `scp`, alat dari Modul 12 Praktik 6.2, kali ini ke arah sebaliknya: **dari** laptop **ke** Pi.

   ```text
   scp ../edge/acl-broker budi@192.168.1.37:acl-broker
   ```

   Tanpa garis miring setelah titik dua, berkasnya masuk ke folder rumahmu di Pi (`/home/budi`). Masukkan kata sandi Pi saat diminta.

2. **Di Pi** (terminal SSH), pindahkan ke tempatnya, serahkan kepada broker, lalu bersihkan salinan di folder rumah:

   ```bash
   sudo cp ~/acl-broker /etc/mosquitto/acl-broker
   sudo chown mosquitto:mosquitto /etc/mosquitto/acl-broker
   sudo chmod 600 /etc/mosquitto/acl-broker
   rm ~/acl-broker
   ```

   Sama dengan berkas sandi: di luar `conf.d`, milik `mosquitto`, dan hanya pemiliknya yang boleh membaca. Tanpa `chown` dan `chmod`, Mosquitto 2.0.21 menulis tiga peringatan `Warning: File /etc/mosquitto/acl-broker …` di log.

3. **Tunjuk daftar izinnya dari pengaturan broker.** Buka lagi `sudo nano /etc/mosquitto/conf.d/gateway-pi.conf`. Isi lengkapnya kini menjadi seperti ini; yang baru adalah baris `acl_file`, catatan di atas lima baris `log_type`, dan kelima baris `log_type` itu sendiri:

   ```text
   # gateway-pi.conf - broker Rumah Pintar Mini di gateway Raspberry Pi (Modul 12), dikunci di Modul 21.
   # Tempatnya di Pi: /etc/mosquitto/conf.d/gateway-pi.conf. Akun ada di /etc/mosquitto/sandi-broker (mosquitto_passwd),
   # daftar izin di /etc/mosquitto/acl-broker. Lalu lintas belum dienkripsi: jangan membuat port forwarding ke Pi (Modul 27).
   listener 1883
   # tanpa nama pengguna dan sandi yang terdaftar, tidak boleh masuk
   allow_anonymous false
   password_file /etc/mosquitto/sandi-broker
   acl_file /etc/mosquitto/acl-broker
   # nama klien selalu = nama pengguna (device_id): tidak ada yang bisa menyamar atau menendang perangkat lain
   use_username_as_clientid true
   # catatan: lima jenis ini menggantikan bawaan; "debug" perlu supaya "Denied PUBLISH" (penyusup ditolak) tercatat
   log_type error
   log_type warning
   log_type notice
   log_type information
   log_type debug
   ```

   - **`acl_file /etc/mosquitto/acl-broker`** memasang daftar izin.
   - **Lima baris `log_type`** menggantikan pilihan catatan bawaan. Yang penting adalah **`debug`**: tanpa baris itu, penyusup yang ditolak (`Denied PUBLISH`) tidak tercatat sama sekali. Hati-hati, menulis `log_type debug` **saja** justru membuat catatan masuk-keluar klien hilang, jadi tulis kelimanya. Akibatnya, log menjadi jauh lebih ramai, karena setiap pesan ikut dicatat. Kalau suatu hari kartu microSD-mu mulai penuh, hapus baris `log_type debug`; harganya, penyusup tidak lagi tercatat.

   Simpan (**Ctrl + O**, **Enter**) dan keluar (**Ctrl + X**).

4. **Restart, bukan reload** (aturan aman nomor 4):

   ```bash
   sudo systemctl restart mosquitto
   systemctl status mosquitto
   ```

   `Active:` harus `active (running)`. Semua klien tersambung lagi dalam beberapa detik, termasuk MQTTX `pemantau` dan Node-RED.

5. **Di laptop**, perbarui juga salinan di repositorimu: ganti seluruh isi `edge/gateway-pi.conf` dengan isi yang sama dengan langkah 3.

#### 5.4 Jalur laptop dan Wokwi: pasang di broker terminal (5 menit)

1. Buka `edge/mosquitto-lan.conf`, lalu ganti seluruh isinya dengan:

   ```text
   # mosquitto-lan.conf - broker latihan Modul 11 untuk jaringan rumah, dikunci di Modul 21.
   # Jalankan dari folder edge: mosquitto -v -c mosquitto-lan.conf. Matikan broker sebelum laptop tersambung ke WiFi umum.
   # Akun ada di sandi-broker (dibuat mosquitto_passwd di laptop ini; tidak ikut Git), daftar izin di acl-broker.
   listener 1883
   # tanpa nama pengguna dan sandi yang terdaftar, tidak boleh masuk
   allow_anonymous false
   password_file sandi-broker
   acl_file acl-broker
   # nama klien selalu = nama pengguna (device_id): tidak ada yang bisa menyamar atau menendang perangkat lain
   use_username_as_clientid true
   ```

   Yang baru hanya baris `acl_file acl-broker` dan catatan di kepalanya. Broker yang dijalankan dengan `-v` sudah mencatat semuanya, termasuk `Denied PUBLISH`, jadi baris `log_type` tidak perlu.

2. macOS dan Linux saja: `chmod 600 acl-broker` di terminal folder `edge`, supaya broker tidak memperingatkan bahwa berkas itu bisa dibaca semua pengguna. Windows tidak memeriksa hal ini.
3. Di terminal broker, tekan **Ctrl + C**, lalu jalankan lagi:

   ```text
   mosquitto -v -c mosquitto-lan.conf
   ```

   Backend, simulator, dan MQTTX tersambung lagi sendiri. Pemeriksa kontrak, kalau sedang berjalan, ikut berhenti; jalankan lagi dengan `node --env-file=.env pemeriksa-kontrak.js`.

#### 5.5 Uji: `pemantau` hanya boleh melihat (7 menit)

1. Di MQTTX, pastikan sambunganmu hijau lagi. Kalau belum, klik **Connect**. Langganan `rpm/#` tetap menerima pesan dari semua perangkat: daftar izin mengizinkan `pemantau` membaca.
2. Kirim lagi pesan dari 5.1 ke topik yang sama, tetapi kali ini pilih **QoS 1** di kotak kirim. **Hasilnya:** pemberitahuan merah **`Error: Publish error: Not authorized`**. Lampu Node 1 tidak menyala, dan simulator diam.

   Gelembung pesanmu mungkin tetap muncul di daftar sebagai pesan terkirim. Itu hanya catatan MQTTX bahwa ia sudah mengirimkannya; broker membuang pesan itu, dan tidak ada perangkat yang menerimanya.

3. Lihat buktinya di log broker. **Jalur perangkat:**

   ```bash
   sudo grep "Denied PUBLISH" /var/log/mosquitto/mosquitto.log | tail -n 3
   ```

   **Hasilnya** (**contoh**, ditulis dari kode sumber Mosquitto 2.0.21):

   ```text
   1792814461: Denied PUBLISH from pemantau (d0, q1, r0, m2, 'rpm/a4cf12e5b7c0/cmd', ... (89 bytes))
   ```

   **Jalur laptop:** baris yang sama muncul di terminal broker, diikuti `Sending PUBACK to pemantau (m2, rc135)`. Angka 135 (`0x87`) adalah kode "tidak diizinkan" yang dikirim balik ke MQTTX.

Mengapa harus QoS 1? Dengan **QoS 0**, broker tidak menjawab apa pun, jadi MQTTX tidak tahu pesannya dibuang dan tidak menampilkan galat. Pesannya tetap dibuang. Coba sendiri: kirim sekali lagi dengan QoS 0. Tidak ada pemberitahuan merah, lampu tetap padam, dan log broker tetap mencatat `Denied PUBLISH … (d0, q0, …)`. Hal yang sama terjadi kalau sambungan MQTTX-mu memakai MQTT 3.1.1: versi itu tidak punya kode alasan di jawabannya. Pelajarannya: **"terkirim tanpa galat" belum tentu "diterima"**. Bukti yang bisa dipercaya adalah perangkat yang tidak bereaksi dan catatan broker.

#### 5.6 Uji: yang sah tetap berjalan (8 menit)

1. **Perintah dari backend tetap sampai.** **Jalur perangkat:** di Bruno, kirim **`nyalakan lampu`**, lalu **`matikan lampu`**. **Hasilnya** (**contoh**, `nyalakan lampu`):

   ```json
   {
     "id": "c-20261022-200442-3",
     "lama_ms": 7,
     "ack": {
       "id": "c-20261022-200442-3",
       "ts": "2026-10-22T20:04:42Z",
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

   Akun `backend` boleh menulis `rpm/+/cmd`, dan Node 1 boleh membaca `rpm/a4cf12e5b7c0/cmd`. **Jalur laptop dan Wokwi:** lihat terminal simulator. Begitu backend tersambung lagi setelah broker dinyalakan ulang, ia menerbitkan ulang `config` *retained* (Modul 19), dan simulator menjawabnya: `ambang sama dengan yang tersimpan …` lalu `perintah c-… -> ok=true`. Itu juga perintah dari backend yang lolos daftar izin.

2. **Pengecualian Node 2 bekerja** (jalur perangkat). Data Node 2 tetap sampai, karena Node 1 boleh menerbitkan `telemetry` dan `status` milik Node 2. Kartu **Kebun** di dashboard Node-RED tetap terisi setiap kali Node 2 bangun.
3. **Pemeriksa kontrak** tetap `LULUS` dengan akun `pemeriksa` yang hanya boleh membaca. Jalankan lagi kalau tadi ikut berhenti (`node --env-file=.env pemeriksa-kontrak.js 192.168.1.37`; jalur laptop: tanpa alamat). **Hasilnya** (**contoh**, dipotong):

   ```text
   Pemeriksa kontrak siap di broker 192.168.1.37:1883 (langganan rpm/#) — tekan Ctrl + C untuk berhenti.
   [03.02.05] rpm/f00d00000001/cmd  LULUS  [retained]
   [03.02.05] rpm/a4cf12e5b7c0/status  LULUS  [retained]
   [03.02.05] rpm/246f28b1c7d4/status  LULUS  [retained]
   [03.02.05] rpm/f00d00000001/status  LULUS  [retained]
   [03.02.06] rpm/a4cf12e5b7c0/telemetry  LULUS
   [03.02.10] rpm/246f28b1c7d4/telemetry  LULUS  (telemetry Node 2)
   [03.02.12] rpm/f00d00000001/telemetry  LULUS
   ```

   Pesan yang ditolak daftar izin, seperti perintah dari MQTTX tadi, tidak pernah sampai ke pemeriksa, jadi tidak ada satu pun cap `GAGAL`.

4. **Bruno `health`:** `"broker": true`.

Kalau ada yang berhenti bekerja setelah langkah ini, misalnya dashboard tidak lagi bisa menyalakan kipas atau data Node 2 tidak sampai, biasanya ada `device_id` yang salah ketik di `acl-broker`. Buka "Setelah daftar izin dipasang, ada yang tidak sampai" di 🚨.

#### 5.7 Simpan ke cabang (2 menit)

Di terminal kedua (folder `backend`):

```text
git add ../edge/acl-broker ../edge/gateway-pi.conf ../edge/mosquitto-lan.conf
git status
git commit -m "Daftar izin broker: pola %u, pengecualian Node 2, akun hanya-baca (Modul 21 Praktik 5)"
```

`acl-broker` boleh masuk Git: isinya hanya aturan, tanpa sandi.

> ⬆️ **Selesai Praktik 5?** Lanjut ke [Praktik 6 — Penyusup ditolak dan tercatat](#praktik-6--penyusup-ditolak-dan-tercatat-40-menit).

### Praktik 6 — Penyusup ditolak dan tercatat (40 menit)

> 🖥️ **Alat yang dipakai:** **Bruno**, **MQTTX** dengan dua sambungan (`pemantau` dan sambungan baru `Penyusup`), terminal broker atau terminal SSH ke Pi untuk membaca log, dan pemeriksa kontrak. **Jalur perangkat** ditambah **Arduino IDE** dengan papan Node 2 yang dipinjam sebentar, seperti di Modul 15. Konsep yang dipakai: Konsep 7 dan 8.
>
> ⭐ **Wajib** — syarat lulus kedua: perangkat yang menyamar ke topik perangkat lain ditolak daftar izin, dan penolakannya tercatat di log broker.

Penyusup yang paling berbahaya bukan tamu tanpa sandi, karena tamu seperti itu sudah ditolak di pintu sejak Praktik 4. Yang berbahaya adalah perangkat yang **punya akun sah**, lalu mencoba berbuat lebih dari haknya: misalnya papan percobaan yang pernah kamu beri kunci, atau papan yang kuncinya bocor. Di praktik ini kamu memerankan penyusup itu dengan perangkat uji **`c0ba00000001`**. Ia didaftarkan secara sah, lalu mencoba tiga hal:

1. memakai **nama klien** perangkat korban, supaya korban ditendang dari broker;
2. menerbitkan `telemetry` **palsu** atas nama korban;
3. berlangganan **semua** pesan rumah (`rpm/#`).

Korbannya Node 1 `a4cf12e5b7c0` (jalur perangkat) atau perangkat latihan `f00d00000001` (jalur laptop dan Wokwi).

#### 6.1 Daftarkan perangkat uji (5 menit)

1. Di Bruno, *clone* **`daftarkan perangkat latihan`** dengan nama `daftarkan perangkat uji`, lalu ganti **Body**-nya dengan:

   ```json
   {
     "device_id": "c0ba00000001",
     "nama": "Perangkat uji (penyusup)",
     "lokasi": "meja kerja"
   }
   ```

2. Kirim **`login admin`**, lalu **`daftarkan perangkat uji`**. **Hasilnya:** `201 Created`, dengan kunci baru dan `langkah` yang sama bentuknya dengan Praktik 1.9. Simpan kuncinya di pengelola sandimu dengan nama `kunci broker c0ba00000001`.
3. Permintaan `daftarkan perangkat uji` cukup dipakai sekali. Hapus lagi dari koleksi (klik kanan namanya → **Delete**), supaya tidak ikut Git.

Mengapa didaftarkan dengan resmi? Karena penyusup yang ingin kita uji justru penyusup yang **sah di pintu**. Backend pun mencatatnya sebagai perangkat terdaftar, jadi lapis kedua tidak membantu di sini. Yang diuji hanyalah daftar izin di broker.

#### 6.2 Beri perangkat uji akun broker (5 menit)

Tidak ada baris baru di `acl-broker`: blok `pattern` sudah berlaku untuk akun apa pun, termasuk `c0ba00000001`. Cukup tambahkan akunnya ke berkas sandi.

**Jalur perangkat** (terminal SSH ke Pi):

```bash
sudo mosquitto_passwd /etc/mosquitto/sandi-broker c0ba00000001
sudo systemctl reload mosquitto
```

Tempel kunci `c0ba00000001` dua kali. Kali ini cukup **reload**, karena yang berubah hanya berkas sandi (Konsep 9). Sambungan yang sudah ada tidak terputus.

**Jalur laptop dan Wokwi:** terminal broker sedang dipakai, jadi buka terminal baru di VS Code, lalu:

```text
cd edge
mosquitto_passwd sandi-broker c0ba00000001
```

Setelah menempel kunci dua kali, kembali ke terminal broker, tekan **Ctrl + C**, lalu jalankan lagi `mosquitto -v -c mosquitto-lan.conf`. Backend, simulator, dan MQTTX `pemantau` tersambung lagi sendiri.

#### 6.3 ⭐ Penyusup lewat MQTTX (semua jalur, 12 menit)

1. **Siapkan pengamat.** Di MQTTX, pastikan sambungan `pemantau`-mu (**Gateway Pi** atau **Broker laptop**) hijau dan berlangganan `rpm/#`. Biarkan juga Serial Monitor Node 1 (jalur perangkat) atau terminal simulator (jalur laptop dan Wokwi) terlihat di layar.
2. **Buat sambungan penyusup.** Di MQTTX, buat sambungan baru (ikon **+**):
   - **Name**: `Penyusup`
   - **Host**: `192.168.1.37` (jalur perangkat) atau `127.0.0.1` (jalur laptop dan Wokwi), **Port** `1883`
   - **Client ID**: hapus isinya, lalu ketik `device_id` korban: `a4cf12e5b7c0` (jalur perangkat) atau `f00d00000001` (jalur laptop dan Wokwi). Inilah penyamarannya.
   - **Username**: `c0ba00000001`, **Password**: kunci `c0ba00000001`
   - **MQTT Version**: biarkan **5.0**

   Klik **Connect**. **Hasilnya:** `Connected`. Akunnya sah, jadi penjaga pintu membiarkannya masuk.

3. **Korban tidak ditendang.** Lihat Serial Monitor Node 1 atau terminal simulator: tidak ada `MQTT PUTUS` dan tidak ada `broker tak terjangkau`. Log broker menjelaskan sebabnya (**contoh**, ditulis dari kode sumber Mosquitto 2.0.21; di laptop, baris yang sama muncul di terminal broker):

   ```text
   1792815600: New connection from 192.168.1.10:53412 on port 1883.
   1792815600: New client connected from 192.168.1.10:53412 as c0ba00000001 (p5, c1, k60, u'c0ba00000001').
   ```

   MQTTX mengaku bernama `a4cf12e5b7c0`, tetapi broker mencatatnya sebagai **`c0ba00000001`**. `use_username_as_clientid` mengganti nama klien dengan nama pengguna yang sudah dibuktikan sandinya (Konsep 8). Tanpa baris itu, Node 1 akan ditendang keluar saat ini juga.

4. **Langganan semua pesan.** Di sambungan `Penyusup`, tambahkan langganan `rpm/#`. MQTTX tidak menampilkan galat apa pun, tetapi **tidak ada satu pesan pun yang masuk**, bahkan status *retained* yang biasanya langsung muncul. Daftar izin hanya mengizinkan perangkat membaca `cmd`-nya sendiri, dan broker menyaring setiap pesan lain sebelum diantar.
5. **Telemetry palsu.** Masih di sambungan `Penyusup`, pilih **QoS 1**, isi topik `rpm/a4cf12e5b7c0/telemetry` (jalur laptop dan Wokwi: `rpm/f00d00000001/telemetry`), lalu kirim:

   ```json
   {"ts":"2026-10-24T04:20:00Z","fw":"6.6.6","suhu":45.5,"kelembapan":10,"cahaya":0,"tanah":0,"gerak":true,"level_air":0}
   ```

   **Hasilnya:** pemberitahuan merah **`Error: Publish error: Not authorized`**. Isi pesan ini sah menurut kontrak data, jadi yang menghentikannya memang daftar izin, bukan pemeriksaan isi di backend.

6. **Tidak ada yang tertipu.** Di sambungan `pemantau`, tidak ada `telemetry` dengan `"fw":"6.6.6"` atau `"suhu":45.5`; yang ada hanya bacaan asli korban. Jalur perangkat: kirim **`bacaan terbaru Node 1`** di Bruno. `fw`-nya tetap `1.6.0` dan suhunya tetap suhu ruanganmu.
7. **Penolakannya tercatat.** **Jalur perangkat** (terminal SSH ke Pi):

   ```bash
   sudo grep "Denied PUBLISH" /var/log/mosquitto/mosquitto.log | tail -n 3
   ```

   **Hasilnya** (**contoh**, ditulis dari kode sumber Mosquitto 2.0.21; baris terakhir adalah kirimanmu barusan):

   ```text
   1792815631: Denied PUBLISH from c0ba00000001 (d0, q1, r0, m1, 'rpm/a4cf12e5b7c0/telemetry', ... (118 bytes))
   ```

   **Jalur laptop:** baris `Denied PUBLISH from c0ba00000001 …` muncul di terminal broker, diikuti `Sending PUBACK to c0ba00000001 (m1, rc135)`.

   Nama yang tercatat adalah nama **akun** penyusup, `c0ba00000001`, bukan nama yang ia akui. Langganan `rpm/#` tadi tidak ditolak: daftar izin Mosquitto memang tidak menolak langganan, tetapi menyaring pesannya saat diantar. Yang ditolak terang-terangan dan tercatat adalah `PUBLISH` ke topik orang lain. **Itulah syarat lulus kedua modul ini.**

8. **Yang memang haknya tetap boleh.** Kirim pesan yang sama dari `Penyusup`, tetapi ke topiknya sendiri: `rpm/c0ba00000001/telemetry`. Tidak ada galat, dan sambungan `pemantau` menerimanya. Akun sah memang boleh berbicara di topiknya sendiri. Itulah alasan kunci perangkat uji harus dicabut begitu latihan selesai: kamu melakukannya di akhir Praktik 7.

Selesai? Klik **Disconnect** di sambungan `Penyusup`, lalu hapus sambungan itu (klik kanan namanya → **Delete**). Kunci `c0ba00000001` jangan dipakai di mana pun lagi.

Ingat pelajaran QoS dari Praktik 5: kalau kamu mengirim telemetry palsu dengan **QoS 0**, MQTTX tidak menampilkan apa pun, dan pesannya tetap dibuang. Penyusup yang memakai QoS 0 bahkan tidak tahu bahwa ia gagal; hanya log broker yang tahu.

#### 6.4 Jalur perangkat: penyusup sungguhan di papan Node 2 (15 menit)

Sekarang penyusupnya papan ESP32 sungguhan. Pinjam papan Node 2 sebentar, seperti di Modul 15; setelah latihan, Node 2 kembali ke kebun dengan firmware-nya sendiri.

1. Colokkan USB papan Node 2 ke laptop. Di Arduino IDE, buka **File → New Sketch**, hapus isinya, lalu tempel kode berikut. Simpan sebagai `modul21_penyusup` di folder `modul-21` repositori `belajar-iot`.

   ```cpp
   // Modul 21 - Praktik 6, papan KEDUA (papan Node 2 yang dipinjam): si "penyusup".
   // Hanya untuk broker MILIKMU SENDIRI (Mosquitto di gateway Pi atau di laptop), bukan broker orang lain.
   // Papan ini masuk ke broker dengan akunnya SENDIRI, yaitu perangkat uji c0ba00000001 yang kamu daftarkan sah di
   // backend, BUKAN dengan akun Node 1. Sesudah diterima masuk, ia mencoba tiga hal yang bukan haknya:
   //   1. menerbitkan telemetry PALSU ke topik Node 1 (rpm/<ID_NODE1>/telemetry), lalu mengulangnya setiap 15 detik
   //   2. berlangganan semua pesan proyek (rpm/#)
   //   3. menerbitkan atas nama Node 2 (rpm/<ID_NODE2>/telemetry); di daftar izin, hak itu hanya milik Node 1
   // Pelajarannya: PubSubClient tidak tahu pesannya dibuang broker (publish() tetap menjawab true), dan langganan rpm/#
   // "berhasil" tetapi kosong. Buktinya ada di log broker (baris "Denied PUBLISH") dan di MQTTX pemantau, yang tidak
   // pernah menerima pesan palsu itu.
   // Selesai latihan: cabut kunci perangkat uji, lalu unggah lagi firmware Node 2 (node-2-kebun) ke papan ini.
   // Library: PubSubClient3 versi 3.3.2 (sama dengan Node 1). Paket esp32 3.3.12.

   #include <WiFi.h>
   #include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
   #include "secrets.h"       // WIFI_NAMA, WIFI_SANDI, dan KUNCI_PENYUSUP; tidak pernah ikut ke GitHub

   #ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
   #error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
   #endif

   const char ALAMAT_BROKER[] = "192.168.1.37";  // GANTI dengan alamat gateway Pi-mu (sama dengan Node 1)
   const uint16_t PORT_BROKER = 1883;
   const char ID_NODE1[] = "a4cf12e5b7c0";       // GANTI dengan device_id Node 1-mu: topik yang mau "dipalsukan"
   const char ID_NODE2[] = "246f28b1c7d4";       // GANTI dengan device_id Node 2-mu
   const char NAMA_PENYUSUP[] = "c0ba00000001";  // device_id perangkat uji = nama klien = nama pengguna broker
   const unsigned long JEDA_PALSU = 15000;       // telemetry palsu diulang setiap 15 detik
   const unsigned long JEDA_COBA = 30000;        // masuk ditolak? coba lagi 30 detik kemudian

   WiFiClient klienJaringan;          // sambungan TCP ke broker
   PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
   char topikNode1[40];  // rpm/<ID_NODE1>/telemetry
   char topikNode2[40];  // rpm/<ID_NODE2>/telemetry
   unsigned long waktuCobaTerakhir = 0;
   unsigned long waktuPalsuTerakhir = 0;
   bool sudahMencoba = false;
   int nomorPalsu = 0;

   // Dipanggil library setiap ada pesan dari langganan rpm/#. Kalau daftar izin broker benar, pesan perangkat lain
   // tidak pernah sampai ke sini.
   void saatPesanMasuk(char* topik, byte* isi, unsigned int panjang) {
     Serial.printf("[!] MENERIMA %s (%u byte): kalau ini pesan perangkat lain, daftar izin bocor!\n", topik, panjang);
   }

   // Percobaan 1: telemetry palsu atas nama Node 1. publish() menjawab true begitu pesan diserahkan ke sambungan TCP;
   // di MQTT 3.1.1, PubSubClient tidak pernah diberi tahu bahwa broker membuangnya.
   void terbitkanPalsu() {
     nomorPalsu++;
     char isi[48];
     snprintf(isi, sizeof(isi), "{\"fw\":\"PALSU\",\"suhu\":99.9,\"ke\":%d}", nomorPalsu);
     bool hasil = mqtt.publish(topikNode1, isi);
     Serial.printf("[1] publish ke %s -> publish() = %s (true BUKAN berarti diterima broker!)\n", topikNode1,
                   hasil ? "true" : "false");
   }

   // Masuk dengan akun sendiri, lalu tiga percobaan yang seharusnya ditolak daftar izin (ACL) broker.
   void cobaMenyusup() {
     Serial.printf("Masuk ke broker %s:%u sebagai %s ...\n", ALAMAT_BROKER, PORT_BROKER, NAMA_PENYUSUP);
     if (!mqtt.connect(NAMA_PENYUSUP, NAMA_PENYUSUP, KUNCI_PENYUSUP)) {
       int kode = mqtt.state();
       Serial.printf("[x] broker menolak MASUK (kode %d): %s Dicoba lagi %lu detik lagi.\n", kode,
                     kode == 5 ? "kunci perangkat uji salah atau sudah dicabut." : "lihat tabel kode state() Modul 11.",
                     JEDA_COBA / 1000);
       return;
     }
     Serial.printf("[ok] MASUK diterima: akun %s memang sah. Sekarang mencoba yang bukan haknya.\n", NAMA_PENYUSUP);
     terbitkanPalsu();
     waktuPalsuTerakhir = millis();
     bool hasil = mqtt.subscribe("rpm/#", 1);  // juga true: PubSubClient tidak memeriksa jawaban broker (SUBACK)
     Serial.printf("[2] subscribe rpm/# -> subscribe() = %s. Tidak muncul baris [!]? Langganan diterima, tetapi kosong.\n",
                   hasil ? "true" : "false");
     hasil = mqtt.publish(topikNode2, "{\"fw\":\"PALSU-N2\"}");
     Serial.printf("[3] publish ke %s -> publish() = %s\n", topikNode2, hasil ? "true" : "false");
     Serial.println("[i] Sekarang lihat log broker (Denied PUBLISH ...) dan MQTTX pemantau: pesan palsu tidak sampai.");
   }

   void setup() {
     Serial.begin(115200);
     delay(500);
     Serial.println();
     Serial.println("Penyusup (papan Node 2 dipinjam). Hanya untuk latihan daftar izin broker Modul 21.");
     snprintf(topikNode1, sizeof(topikNode1), "rpm/%s/telemetry", ID_NODE1);
     snprintf(topikNode2, sizeof(topikNode2), "rpm/%s/telemetry", ID_NODE2);

     WiFi.mode(WIFI_STA);
     WiFi.begin(WIFI_NAMA, WIFI_SANDI);
     Serial.printf("Menyambung ke WiFi \"%s\"", WIFI_NAMA);
     while (WiFi.status() != WL_CONNECTED) {  // menunggu di sini boleh: sketsa latihan kecil tanpa watchdog
       Serial.print(".");
       delay(250);
     }
     Serial.println(" tersambung.");
     mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
     mqtt.setCallback(saatPesanMasuk);
   }

   void loop() {
     if (!mqtt.connected()) {
       if (!sudahMencoba || millis() - waktuCobaTerakhir >= JEDA_COBA) {
         sudahMencoba = true;
         waktuCobaTerakhir = millis();
         cobaMenyusup();
       }
       return;
     }
     mqtt.loop();  // menjaga sambungan, dan menjalankan saatPesanMasuk() kalau ada pesan masuk
     if (millis() - waktuPalsuTerakhir >= JEDA_PALSU) {
       waktuPalsuTerakhir = millis();
       terbitkanPalsu();
     }
   }
   ```

2. Buat tab baru bernama **`secrets.h`**, seperti di Modul 10, lalu isi dengan contoh ini. Ganti ketiga teksnya dengan nama dan sandi WiFi rumahmu, serta kunci `c0ba00000001`, **bukan** kunci Node 1:

   ```cpp
   // secrets.h - RAHASIA: nama dan kata sandi WiFi-mu, serta kunci perangkat uji.
   // File ini CONTOH. Ganti ketiga teks di bawah dengan milikmu sendiri.
   // Di repositorimu sendiri, secrets.h diabaikan Git lewat .gitignore (Modul 10, Praktik 1)
   // sehingga kata sandi dan kuncimu tidak pernah ikut terunggah ke GitHub.
   #pragma once

   const char WIFI_NAMA[] = "NamaWiFiRumahmu";   // nama WiFi (SSID), huruf besar-kecil harus sama persis
   const char WIFI_SANDI[] = "KataSandiWiFimu";  // kata sandi WiFi
   const char KUNCI_PENYUSUP[] = "TempelKunciPerangkatUjiDiSini";  // kunci perangkat uji c0ba00000001, BUKAN kunci Node 1
   ```

   `secrets.h` sudah diabaikan Git di repositori `belajar-iot` sejak Modul 10, jadi kunci perangkat uji tidak ikut terunggah.

3. Di bagian atas `modul21_penyusup.ino`, ganti `192.168.1.37`, `a4cf12e5b7c0`, dan `246f28b1c7d4` dengan alamat Pi, `device_id` Node 1, dan `device_id` Node 2 milikmu.
4. Pilih **DOIT ESP32 DEVKIT V1** dan port papan Node 2, klik **Upload**, lalu buka Serial Monitor-nya (115200 baud). **Hasilnya** (**contoh**: ditulis dari kode sketsa; sketsa ini sudah dikompilasi penulis, tetapi belum dijalankan dengan broker berkunci sungguhan):

   ```text
   Penyusup (papan Node 2 dipinjam). Hanya untuk latihan daftar izin broker Modul 21.
   Menyambung ke WiFi "NamaWiFiRumahmu"........ tersambung.
   Masuk ke broker 192.168.1.37:1883 sebagai c0ba00000001 ...
   [ok] MASUK diterima: akun c0ba00000001 memang sah. Sekarang mencoba yang bukan haknya.
   [1] publish ke rpm/a4cf12e5b7c0/telemetry -> publish() = true (true BUKAN berarti diterima broker!)
   [2] subscribe rpm/# -> subscribe() = true. Tidak muncul baris [!]? Langganan diterima, tetapi kosong.
   [3] publish ke rpm/246f28b1c7d4/telemetry -> publish() = true
   [i] Sekarang lihat log broker (Denied PUBLISH ...) dan MQTTX pemantau: pesan palsu tidak sampai.
   [1] publish ke rpm/a4cf12e5b7c0/telemetry -> publish() = true (true BUKAN berarti diterima broker!)
   ```

   `publish()` menjawab `true` setiap kali, karena PubSubClient menganggap tugasnya selesai begitu pesan diserahkan ke sambungan. Dengan MQTT 3.1.1, broker tidak pernah memberi tahu bahwa pesannya dibuang. Sang penyusup mengira berhasil.

5. Buktinya ada di tempat lain. Log broker mencatat setiap percobaan, dan percobaan pertama diulang setiap 15 detik (**contoh**, ditulis dari kode sumber Mosquitto 2.0.21):

   ```bash
   sudo grep "Denied PUBLISH" /var/log/mosquitto/mosquitto.log | tail -n 3
   ```

   ```text
   1792815903: Denied PUBLISH from c0ba00000001 (d0, q0, r0, m0, 'rpm/a4cf12e5b7c0/telemetry', ... (33 bytes))
   1792815903: Denied PUBLISH from c0ba00000001 (d0, q0, r0, m0, 'rpm/246f28b1c7d4/telemetry', ... (17 bytes))
   1792815918: Denied PUBLISH from c0ba00000001 (d0, q0, r0, m0, 'rpm/a4cf12e5b7c0/telemetry', ... (33 bytes))
   ```

   Percobaan ketiga juga ditolak: menerbitkan atas nama Node 2 hanya hak Node 1 (blok 2 `acl-broker`). MQTTX `pemantau` tidak pernah menerima `"fw":"PALSU"`, dan kartu **Kebun** di dashboard tetap menampilkan data Node 2 yang asli.

6. **Kembalikan Node 2.** Buka sketsa `node-2-kebun` dari repositori `rumah-pintar-mini`, pilih papan dan pengaturan Node 2 seperti di Modul 14, lalu klik **Upload**. Node 2 kembali ke kebun.

Praktik ini tidak mengubah berkas apa pun di repositori `rumah-pintar-mini`, jadi tidak ada yang perlu di-*commit*.

> ⬆️ **Selesai Praktik 6?** Baca [Konsep 9](#9-mencabut-kunci-perangkat-yang-hilang), lalu lanjut ke [Praktik 7 — Mencabut kunci perangkat yang hilang](#praktik-7--mencabut-kunci-perangkat-yang-hilang-40-menit).

### Praktik 7 — Mencabut kunci perangkat yang hilang (40 menit)

> 🖥️ **Alat yang dipakai:** **Bruno**, terminal VS Code yang menjalankan backend (terminal pertama) dan simulator (terminal ketiga), **MQTTX** dengan akun `pemantau`, serta terminal SSH ke Pi (jalur perangkat) atau terminal broker di folder `edge` (jalur laptop dan Wokwi). Konsep yang dipakai: Konsep 9.
>
> ⭐ **Wajib** — syarat lulus ketiga: perangkat yang kuncinya dicabut tidak bisa mengirim data lagi.

Anggap saja perangkat latihan `f00d00000001` adalah papan yang **hilang dari teras**. Kuncinya masih tersimpan di dalamnya, dan siapa pun yang menemukannya bisa memakainya. Kamu mencabut kuncinya di dua lapis, melihat bahwa ia benar-benar tidak bisa mengirim data lagi, lalu memulihkannya dengan kunci baru seolah-olah papannya sudah ketemu. Semua jalur memakai perangkat latihan yang sama, jadi Node 1-mu tidak perlu ikut dicabut.

#### 7.1 Siapkan pengamatan (3 menit)

1. Di terminal ketiga (folder `alat`), jalankan simulator untuk **satu** perangkat latihan (jalur laptop dan Wokwi: `mqtt://127.0.0.1:1883`):

   ```text
   node --env-file=.env simulator-perangkat.js mqtt://192.168.1.37:1883 1
   ```

   Tunggu sampai muncul `f00d00000001: online`.

2. Di MQTTX (`pemantau`), berlangganan `rpm/f00d00000001/#`. Bacaannya masuk setiap 10 detik.
3. Biarkan log backend (terminal pertama) terlihat.

#### 7.2 Lapis pertama: cabut di backend (5 menit)

Di Bruno, kirim **`login admin`**, lalu **`cabut kunci perangkat latihan`**. **Hasilnya:** `200 OK` (**contoh**):

```json
{
  "device_id": "f00d00000001",
  "dicabut": "2026-10-22T20:13:23Z",
  "langkah": [
    "Hapus akunnya dari broker: mosquitto_passwd -D <berkas sandi broker> f00d00000001",
    "Muat ulang broker (Pi: sudo systemctl reload mosquitto; laptop: Ctrl + C lalu jalankan lagi)"
  ]
}
```

Lihat log backend. **Hasilnya** (**contoh**):

```text
[03:13:23] WARN: kunci f00d00000001 DICABUT oleh akun 1
[03:13:23] INFO: POST /devices/f00d00000001/cabut -> 200 (23 ms)
[03:13:29] WARN: DIABAIKAN rpm/f00d00000001/telemetry: f00d00000001 kuncinya sudah dicabut
[03:14:29] WARN: DIABAIKAN rpm/f00d00000001/telemetry: f00d00000001 kuncinya sudah dicabut (+5 pesan lain sejak catatan terakhir)
```

**Seketika**, dari bacaan berikutnya, backend mengabaikan perangkat itu: datanya tidak masuk database, tidak tampil di terminal kecil, dan tidak memicu aturan otomatis. Perintah ke perangkat itu pun ditolak. Kalau kamu mencobanya, misalnya lewat **Try it out** di `/docs` untuk `POST /devices/f00d00000001/command`, jawabannya `409` dengan isi `{"pesan":"kunci perangkat f00d00000001 sudah dicabut"}`.

Namun, perhatikan MQTTX: **bacaannya masih masuk**. Broker belum tahu apa-apa, karena akun `f00d00000001` masih ada di berkas sandinya. Di dunia nyata, papan yang hilang itu masih bisa memakai broker rumahmu. Itulah alasan pencabutan dilakukan di dua lapis.

Kirim juga **`daftar perangkat`**. Baris perangkat latihan kini berbunyi (**contoh**):

```json
{
  "device_id": "f00d00000001",
  "nama": "Latihan ruang tamu",
  "lokasi": "ruang tamu",
  "jenis": "node1",
  "status": "online",
  "terakhir_dilihat": "2026-10-22T20:13:19Z",
  "kunci": "dicabut",
  "terdaftar": "2026-10-22T19:09:28Z",
  "kunci_dibuat": null,
  "dicabut": "2026-10-22T20:13:23Z",
  "penghubung": null
}
```

`kunci_dibuat` kosong lagi, karena sidik jari kuncinya sudah dihapus dari database. `status` masih `online`. Kolom itu hanya kabar terakhir dari perangkat, sedangkan keadaan resminya ada di kolom **`kunci`**.

#### 7.3 ⭐ Lapis kedua: tutup pintunya di broker (8 menit)

**Jalur perangkat** (terminal SSH ke Pi):

```bash
sudo mosquitto_passwd -D /etc/mosquitto/sandi-broker f00d00000001
sudo systemctl reload mosquitto
```

`-D` menghapus satu akun (*delete*), tanpa bertanya apa pun. Cukup **reload**, karena yang berubah hanya berkas sandi.

**Jalur laptop dan Wokwi:** di terminal folder `edge` (bukan terminal broker), jalankan `mosquitto_passwd -D sandi-broker f00d00000001`. Lalu, di terminal broker, tekan **Ctrl + C** dan jalankan lagi `mosquitto -v -c mosquitto-lan.conf`.

**Hasilnya** di terminal simulator:

```text
f00d00000001: broker tak terjangkau, mencoba lagi setiap 5 detik
f00d00000001: DITOLAK broker (kode 5): kunci salah, belum didaftarkan, atau sudah dicabut. Dicoba lagi 60 detik lagi.
f00d00000001: DITOLAK broker (kode 5): kunci salah, belum didaftarkan, atau sudah dicabut. Dicoba lagi 60 detik lagi.
```

Baris pertama muncul karena sambungan simulator baru saja diputus; brokernya sendiri tetap hidup. Sejak itu, setiap percobaan menyambung **ditolak**, semenit sekali. Di MQTTX, bacaan `f00d00000001` **berhenti**. **Itulah syarat lulus ketiga modul ini:** perangkat yang kuncinya dicabut tidak bisa mengirim data lagi, ke backend maupun ke broker.

Log broker di Pi mencatatnya (**contoh**, ditulis dari kode sumber Mosquitto 2.0.21; lihat dengan `sudo tail -n 20 /var/log/mosquitto/mosquitto.log`):

```text
1792816205: Reloading config.
1792816205: Client f00d00000001 disconnected.
1792816210: Client f00d00000001 disconnected, not authorised.
1792816270: Client f00d00000001 disconnected, not authorised.
```

Di laptop, terminal broker menulis `Client f00d00000001 [127.0.0.1:…] disconnected: not authorised.` semenit sekali.

> [!NOTE]
> **Kalau simulator tidak terputus setelah *reload* di Pi.** Menurut kode sumber Mosquitto, *reload* memeriksa ulang setiap klien yang sedang tersambung dan memutus yang akunnya sudah dihapus. Dokumentasi Mosquitto justru menulis bahwa klien yang sudah tersambung tidak terpengaruh. Penulis belum bisa membuktikan yang mana dengan Mosquitto sungguhan. Kalau di Pi-mu `f00d00000001` tetap tersambung dan bacaannya masih masuk di MQTTX, nyalakan ulang broker dengan `sudo systemctl restart mosquitto`. Setelah itu, sambungan ulangnya pasti ditolak. Lapis pertama tidak bergantung pada perilaku ini: backend sudah mengabaikan perangkat itu sejak 7.2.

Ada dua hal lain yang wajar terjadi:

- Wasiat `offline` tidak dikirim saat broker memutus klien yang dicabut, dan backend juga mengabaikan pesan status sesudah pencabutan. Jadi, `GET /devices` bisa tetap menulis `"status": "online"`. Kolom `kunci` yang menjadi patokan.
- Kalau simulator ditolak lebih dari 2 menit, ia masuk **mode offline** Modul 19 (`MODE OFFLINE: broker tak terjangkau 2 menit; …`) dan pengaman kipasnya mulai bekerja. Itu sama dengan perilaku Node 1 sungguhan.

#### 7.4 Papannya ketemu: pulihkan dengan kunci baru (12 menit)

Kunci lama tidak boleh dipakai lagi, karena siapa tahu kunci itu sudah disalin selama papannya hilang (Konsep 9).

1. **Kunci baru di backend.** Di Bruno, kirim **`ganti kunci perangkat latihan`**. **Hasilnya:** `200 OK` dengan kunci baru dan `langkah` (**contoh**, dengan kunci contoh kedua modul ini, yang juga tidak berlaku di mana pun):

   ```json
   {
     "device_id": "f00d00000001",
     "kunci": "o-kd07KCz3W-qx5u1-5A4o9wPw2OzxerY-bpiIomQOU",
     "langkah": [
       "Simpan kunci ini sekarang: kunci hanya tampil sekali ini (database hanya menyimpan sidik jarinya).",
       "Perangkat: ketik  kunci <kunci>  di Serial Monitor (simulator: KUNCI_F00D00000001=<kunci> di alat/.env)",
       "Broker: mosquitto_passwd <berkas sandi broker> f00d00000001 di mesin broker, tempel kunci dua kali, lalu muat ulang broker"
     ]
   }
   ```

   Ganti isi `kunci broker f00d00000001` di pengelola sandimu dengan kunci baru ini. Log backend menulis `kunci baru untuk f00d00000001 dibuat oleh akun 1`, dan sejak itu backend mendengarkan perangkat latihan lagi.

2. **Kunci baru di broker.** **Jalur perangkat:**

   ```bash
   sudo mosquitto_passwd /etc/mosquitto/sandi-broker f00d00000001
   sudo systemctl reload mosquitto
   ```

   **Jalur laptop dan Wokwi:** `mosquitto_passwd sandi-broker f00d00000001` di terminal folder `edge`, lalu **Ctrl + C** dan jalankan lagi broker di terminal broker. Tempel kunci baru dua kali.

3. **Kunci baru di perangkat.** Buka `alat/.env`, ganti nilai `KUNCI_F00D00000001=` dengan kunci baru, lalu simpan. Simulator hanya membaca `.env` saat mulai, jadi hentikan dengan **Ctrl + C**, lalu jalankan lagi perintah dari 7.1. **Hasilnya** (**contoh**):

   ```text
   1 perangkat palsu menuju mqtt://192.168.1.37:1883. Ketik "suhu 33" atau "suhu acak". Hentikan dengan Ctrl+C.
   f00d00000001: online
   f00d00000001: ambang sama dengan yang tersimpan {"suhu_kipas_on":30,"tanah_siram":30}
   f00d00000001: perintah c-20261022-201204-1 -> ok=true
   ```

   Untuk Node 1 sungguhan, langkah ketiga ini adalah perintah `kunci <kunci baru>` di Serial Monitor (Praktik 3).

4. **Periksa.** Bacaan `f00d00000001` kembali mengalir di MQTTX. Di Bruno, **`daftar perangkat`** menulis (**contoh**, baris perangkat latihan dipotong):

   ```json
   {
     "device_id": "f00d00000001",
     "status": "online",
     "kunci": "aktif",
     "kunci_dibuat": "2026-10-22T20:17:28Z",
     "dicabut": null
   }
   ```

   `kunci_dibuat` kini waktu kunci baru dibuat, dan `dicabut` kosong lagi.

Perhatikan urutannya: kali ini **broker diberi kunci baru sebelum perangkat**, kebalikan dari urutan pemasangan awal (Konsep 3, yang memasang ke perangkat dulu). Alasannya, broker **sudah terkunci** sekarang. Kalau perangkat memasang kunci barunya lebih dulu, ia ditolak broker dan baru mencoba lagi 60 detik kemudian — tidak berbahaya, hanya membuatmu menunggu. Dengan broker lebih dulu, perangkat langsung diterima begitu kuncinya diganti.

#### 7.5 Latihan: cabut perangkat uji sendiri (7 menit)

Perangkat uji `c0ba00000001` dari Praktik 6 masih memegang kunci yang sah. Sekarang kamu tahu caranya, jadi cabut kuncinya sendiri, **tanpa** memulihkannya:

1. **Backend:** di Bruno, *clone* **`cabut kunci perangkat latihan`**, ubah URL-nya menjadi `{{baseUrl}}/devices/c0ba00000001/cabut`, kirim, lalu hapus lagi *clone* itu.
2. **Broker:** hapus akun `c0ba00000001` dengan `mosquitto_passwd -D`, lalu muat ulang broker seperti 7.3.
3. **Pengelola sandi:** jangan dihapus dulu. Ganti namanya menjadi `kunci broker c0ba00000001 (DICABUT)`. Kunci yang sudah mati ini dipakai sekali lagi di Praktik 8 untuk membuktikan bahwa ia memang tidak berlaku, lalu dihapus.
4. **Periksa:** di **`daftar perangkat`**, baris `c0ba00000001` menulis `"kunci": "dicabut"`.

Barisnya tetap ada di daftar resmi sebagai catatan bahwa perangkat itu pernah terdaftar lalu dicabut. Praktik ini tidak mengubah berkas apa pun di repositori, jadi tidak ada yang perlu di-*commit*.

> ⬆️ **Selesai Praktik 7?** Baca [Konsep 10](#10-jujur-lalu-lintas-di-rumah-masih-polos), lalu lanjut ke [Praktik 8 — Jujur soal enkripsi dan uji kelulusan](#praktik-8--jujur-soal-enkripsi-dan-uji-kelulusan-40-menit).

### Praktik 8 — Jujur soal enkripsi dan uji kelulusan (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal pertama menjalankan `npm run dev`, terminal kedua di folder `backend` untuk perintah dan Git, terminal ketiga dan keempat di folder `alat`), **MQTTX**, **Bruno**, dan **browser** yang sudah masuk ke GitHub. Konsep yang dipakai: Konsep 10.
>
> ⭐ **Wajib** — melihat sendiri bahwa kunci terkirim polos, lalu gladi bersih ketiga syarat lulus Modul 21 dalam sekali jalan.

Broker sudah terkunci, daftar izin sudah terpasang, dan perangkat yang dicabut sudah tak berdaya. Sebelum semuanya dikirim ke GitHub, modul ini jujur dulu tentang satu hal yang **belum** aman: lalu lintas MQTT masih polos. Lalu backend naik ke v1.0, dan ketiga syarat lulus diuji berurutan.

#### 8.1 ⭐ Lihat sendiri: kunci terkirim polos (10 menit)

Kunci perangkat memang membuktikan "kamu siapa", tetapi di jaringan rumah ia masih dikirim **tanpa amplop**. Siapa pun yang bisa melihat paket di jaringan yang sama bisa membacanya. Daripada percaya begitu saja, kamu memakai **penyadap** kecil: sebuah perantara yang berdiri di antara MQTTX dan broker, meneruskan semuanya apa adanya, tetapi mencetak isi paket pertama (CONNECT).

> [!WARNING]
> **Pakai kunci yang sudah mati.** Untuk melihat kunci di layar dengan aman, pakai kunci `c0ba00000001` yang sudah kamu cabut di Praktik 7.5. Kunci itu tidak berlaku di mana pun lagi, jadi tidak masalah kalau terlihat. Jangan pernah menjalankan penyadap dengan kunci yang masih aktif, apalagi merekam layarnya.

1. Buat berkas baru **`alat/penyadap.js`**. Isinya cukup disalin dari kurikulum: buka [`kode/alat/penyadap.js`](kode/alat/penyadap.js) di GitHub, klik **Copy raw file**, lalu tempel ke berkas baru `alat/penyadap.js`. Alat ini tidak butuh library dari npm.
2. Di terminal ketiga (folder `alat`), jalankan penyadap. Ia mendengar di pintu 1884 (yang kini kosong lagi: broker latihan Kemenangan Cepat sudah kamu matikan) dan meneruskan ke broker-mu. Ganti `192.168.1.37` dengan alamat broker-mu (jalur laptop dan Wokwi: `127.0.0.1`):

   ```text
   node penyadap.js 192.168.1.37
   ```

   **Hasilnya:**

   ```text
   Penyadap siap di 127.0.0.1:1884, meneruskan ke broker 192.168.1.37:1883. Ctrl + C untuk berhenti.
   ```

3. Di MQTTX, buat sambungan baru (ikon **+**): **Name** `Lewat penyadap`, **Host** `127.0.0.1`, **Port** `1884`, **Client ID** `c0ba00000001` (hapus nama acak bawaan MQTTX, ketik ini), **Username** `c0ba00000001`, **Password** kunci `c0ba00000001` yang sudah dicabut, **MQTT Version** `3.1.1`. Klik **Connect**.

   MQTTX menyambung ke penyadap, bukan langsung ke broker. Karena kunci `c0ba00000001` sudah dicabut, broker menolaknya (`Not authorized`), dan itu tidak mengapa: yang kita amati adalah apa yang **penyadap** lihat sebelum pesan sampai ke broker. **Hasilnya** di terminal penyadap (**contoh**; kuncinya kunci yang sudah dicabut):

   ```text
   [03.23.40] sambungan baru dari 127.0.0.1:62482 -> 192.168.1.37:1883
     CONNECT MQTT versi 3.1.1
     nama klien    : c0ba00000001
     nama pengguna : c0ba00000001
     kunci (sandi) : R26oUT4bKiHHIYH0tUrToMLeHTJTIFKZc7_JMFE05oc   <- terbaca polos oleh siapa pun di jalur ini
     broker menjawab: CONNACK 5 (tidak diizinkan)
   ```

   Nama pengguna dan **kunci lengkap** terbaca jelas, huruf demi huruf. Penyadap tidak perlu tahu sandi apa pun; ia cukup duduk di jalur TCP dan membaca. Broker sendiri (`mosquitto -v`) tidak pernah mencetak kunci, tetapi jalur jaringannya terbuka.

4. Hentikan penyadap dengan **Ctrl + C**, lalu hapus sambungan `Lewat penyadap` di MQTTX (klik kanan → **Delete**). Setelah terbukti, **hapus** `kunci broker c0ba00000001 (DICABUT)` dari pengelola sandimu: tugasnya sudah selesai.

Inilah batas jujur Konsep 10. Kunci menjawab "kamu siapa", tetapi tidak menyembunyikan isi percakapan. Di jaringan rumah yang tertutup, risikonya masih kecil. Begitu broker dibuka ke internet, amplopnya **wajib** dipasang: itulah TLS di Modul 27, yang mengubah `mqtt://` menjadi `mqtts://` di pintu 8883. Daftar lengkap yang sudah dan belum dibereskan ada di [Konsep 10](#10-jujur-lalu-lintas-di-rumah-masih-polos) dan 🔬 "OWASP IoT Top 10".

#### 8.2 Backend v1.0.0 (7 menit)

Biarkan `npm run dev` tetap berjalan di terminal pertama. Di terminal kedua (folder `backend`), naikkan nomor versinya, seperti di Modul 19–20:

```text
npm version 1.0.0 --no-git-tag-version
```

**Hasilnya:** `v1.0.0`. Perintah ini mengubah `package.json` dan `package-lock.json` sekaligus, tanpa membuat *commit*. Lalu perbarui dua tempat lain:

1. Di **`backend/package.json`**, ganti baris `"description"` dengan:

   ```json
     "description": "Backend Rumah Pintar Mini (Modul 16-21): mendengar MQTT, memeriksa kontrak data, menyimpan semua pesan ke database deret waktu, menyediakan API riwayat, data realtime, perintah, aturan otomatis, jadwal, dan notifikasi Telegram, login dengan peran admin dan viewer, serta daftar resmi perangkat dengan kunci per perangkat dan akun broker tersendiri",
   ```

2. Di **`backend/src/server.ts`**, ganti dua baris komentar paling atas (yang diawali `// server.ts -`) dengan:

   ```ts
   // server.ts - pintu masuk backend Rumah Pintar Mini v1.0 (Modul 21: daftar resmi perangkat dan kuncinya, akun broker sendiri,
   // pesan dari perangkat tak terdaftar/dicabut diabaikan; di atas Modul 20: login, JWT di cookie, peran, dan pengaman API, dan
   // Modul 19: data realtime, perintah satu pintu, aturan otomatis, jadwal, dan notifikasi Telegram).
   ```

   Lalu, di `app.register(swagger, …)`, ganti seluruh blok `info: { … },` dengan:

   ```ts
       info: {
         title: "Rumah Pintar Mini API",
         description: "Backend v1.0 (Modul 21). Semua rute butuh login, kecuali yang tidak bergembok. Login dulu lewat "
           + "POST /auth/login (Try it out): browser menyimpan cookie akses dan mengirimnya sendiri ke rute lain. "
           + "Akun viewer hanya boleh melihat (GET); perintah dan perubahan dijawab 403. Perangkat didaftarkan admin lewat "
           + "POST /devices; kuncinya hanya tampil sekali, dan pesan dari perangkat tak terdaftar atau dicabut diabaikan.",
         version: "1.0.0",
       },
   ```

Simpan, lalu jalankan `npm run cek` (tanpa galat). Backend di terminal pertama sudah dimulai ulang sendiri. Buka `http://127.0.0.1:8080/docs` (jalur lab: port milikmu): judulnya kini `1.0.0`, dan deskripsinya menyebut pendaftaran perangkat. Empat rute `/devices` yang baru dari Praktik 1 muncul di daftar dengan gemboknya.

#### 8.3 ⭐ Gladi bersih tiga syarat lulus (13 menit)

Sekarang ketiga syarat lulus diuji berurutan, seperti penguji yang datang memeriksa rumahmu. Siapkan MQTTX dengan sambungan `pemantau` yang hijau dan berlangganan `rpm/#`, lalu kerjakan berurutan.

**Syarat 1 — tamu tanpa sandi ditolak broker.**

1. Di MQTTX, buat sambungan baru tanpa nama pengguna dan sandi (atau pakai lagi sambungan lamamu dari Praktik 4.6 sebelum diberi akun), ke broker-mu di pintu 1883. Klik **Connect**.
2. **Hasilnya:** `Error: Connection refused: Not authorized`. Hapus lagi sambungan uji itu.

**Syarat 2 — perangkat yang menyamar ke topik perangkat lain ditolak daftar izin.** Ini mengulang Praktik 6 dengan singkat. Kalau kamu masih ingat buktinya dari sana, boleh langsung ke syarat 3.

3. Daftarkan lagi perangkat uji `c0ba00000001` (Praktik 6.1), pasang akunnya di broker (Praktik 6.2), lalu buat sambungan MQTTX `Penyusup` dengan **Client ID** `a4cf12e5b7c0` (jalur laptop: `f00d00000001`) dan akun `c0ba00000001`. Masuk diterima, tetapi menerbitkan `telemetry` ke `rpm/a4cf12e5b7c0/telemetry` dengan QoS 1 dijawab **`Error: Publish error: Not authorized`**, dan MQTTX `pemantau` tidak menerima satu pun pesan palsu.
4. Cabut lagi kunci `c0ba00000001` (Praktik 7.5) supaya rumahmu bersih. Kunci yang baru dicabut ini dipakai di syarat 3.

**Syarat 3 — perangkat yang kuncinya dicabut tidak bisa mengirim data lagi.**

5. Di MQTTX, ubah sambungan `Penyusup` tadi: kosongkan **Client ID** supaya MQTTX membuat nama acak, biarkan akun `c0ba00000001` dengan kunci yang **sudah dicabut**. Klik **Connect**.
6. **Hasilnya:** `Error: Connection refused: Not authorized`. Perangkat yang kuncinya dicabut tidak bisa masuk lagi, sama seperti tamu tanpa sandi. Hapus sambungan `Penyusup`.

Kalau kamu lebih suka satu layar yang rapi, ketiga syarat juga terlihat dari sisi pustaka MQTT.js (yang dipakai MQTTX). Inilah gladi yang dijalankan penulis dengan satu skrip (**contoh**, kode 135 = `0x87`, "tidak diizinkan" di MQTT 5):

```text
== Syarat lulus 1: klien tanpa sandi ditolak broker
  tanpa nama pengguna/sandi -> DITOLAK: Connection refused: Not authorized (code 135)
== Syarat lulus 2: perangkat menyamar ke topik Node 1 ditolak ACL
  masuk dengan akun c0ba00000001, nama klien a4cf12e5b7c0 -> TERSAMBUNG (akun memang sah)
  publish telemetry PALSU ke rpm/a4cf12e5b7c0/telemetry QoS 1 -> DITOLAK: Publish error: Not authorized (code 135)
  telemetry Node 1 PALSU yang berhasil disebarkan ke pelanggan lain: 0 (harus 0)
== Syarat lulus 3: perangkat yang kuncinya dicabut tidak bisa masuk lagi
  masuk dengan kunci c0ba00000001 yang SUDAH DICABUT -> DITOLAK: Connection refused: Not authorized (code 135)
```

Ketiganya terbukti: tamu tanpa sandi ditolak, penyamar tidak bisa menulis atas nama orang lain, dan kunci yang dicabut mati total.

#### 8.4 Pemeriksaan otomatis (5 menit)

Di terminal kedua (folder `backend`):

```text
npm run cek
npm test
npm audit --no-progress
```

`npm run cek` selesai tanpa galat. `npm test` menulis **`Tests  35 passed (35)`** (**contoh**, bagian akhir):

```text
 Test Files  5 passed (5)
      Tests  35 passed (35)
   Start at  03:34:10
   Duration  3.56s (import 51%, tests 37%, transform 11%, worker 1%)
```

Dari 18 tes di Modul 20 menjadi **35**: 11 otak aturan, 7 keamanan pengguna, ditambah 4 kunci, 4 buku tamu dan lapis kedua, dan 9 rute registrasi dari modul ini. `npm audit --no-progress` menjawab **`found 0 vulnerabilities`**: tidak ada paket npm baru minggu ini. (Pilihan `--no-progress` mematikan animasi berputar yang kadang macet di PowerShell, seperti di Modul 20.)

#### 8.5 Simpan ke cabang (5 menit)

Masih di terminal kedua:

```text
git add package.json package-lock.json src/server.ts ../alat/penyadap.js
git status
git commit -m "Backend v1.0.0 dan penyadap jujur: lalu lintas MQTT masih polos (Modul 21 Praktik 8)"
```

`git status` hanya menyebut keempat berkas itu; tidak ada `.env`, `sandi-broker`, atau kunci di mana pun. Dengan ini, semua kode Modul 21 sudah tersimpan di cabang `fitur/keamanan-perangkat`. Bagian ➕ menggabungkannya ke `main` lewat *pull request* "keamanan perangkat".

> 🎉 **Checkpoint Fase 3 — rumah berkunci untuk manusia dan perangkat.** Empat modul terakhir membangun otak rumah (backend dan database, Modul 16–18), menghidupkannya (realtime, aturan, notifikasi, Modul 19), lalu menguncinya: untuk manusia dengan akun, *login*, peran, dan pengaman API (Modul 20), dan minggu ini untuk perangkat dengan kunci per perangkat, lapis kedua, akun broker, dan daftar izin. Backend kini **v1.0**. Yang belum aman sudah kamu sebut sendiri dengan jujur, dan dibereskan di Fase 5 (TLS di Modul 27). Fase 4 berikutnya memberi rumah ini **wajah**: dashboard React yang kamu bangun dari nol.

> ⬆️ **Selesai Praktik 8?** Kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) kalau mau, lalu langkah di [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini): di sana kontrak data dinaikkan ke 1.4, templat *pull request* diperbarui, dan semua pekerjaan Modul 21 digabungkan ke `main` lewat *pull request* "keamanan perangkat".

## 🚨 Kalau Tidak Jalan?

Klik judul masalah yang mirip dengan yang kamu alami. Perintah `mosquitto_passwd`, `mosquitto`, dan `systemctl` dibahas di Modul 11–12; yang di sini khusus hal baru Modul 21.

<details>
<summary><b>Broker gagal menyala setelah dikunci (<code>systemctl status</code> menulis <code>failed</code>, atau terminal broker langsung kembali ke <em>prompt</em>)</b></summary>

Urutkan dari penyebab yang paling sering:

- **Jalur perangkat, `chown`/`chmod` terlewat (Praktik 4.2 langkah 3).** Di Pi, broker menyala sebagai `root` lalu pindah menjadi pengguna `mosquitto`. Berkas sandi buatan `sudo mosquitto_passwd` dimiliki `root` dan tidak bisa dibaca `mosquitto`, jadi broker berhenti. Jalankan `sudo chown mosquitto:mosquitto /etc/mosquitto/sandi-broker /etc/mosquitto/acl-broker` lalu `sudo chmod 600 …`, dan `sudo systemctl restart mosquitto`.
- **Lihat sebabnya langsung.** Di Pi: `sudo tail -n 20 /var/log/mosquitto/mosquitto.log`. Di laptop (broker di terminal), pesannya ada tepat di atas *prompt* yang kembali. Baris `Error: Unable to open pwfile …` berarti berkas sandi tidak terbaca (hak akses, atau salah nama di `password_file`). Baris `Error: Unable to open config file …` berarti salah nama berkas `.conf` di perintah `-c`.
- **Salah ketik nama berkas.** Di `gateway-pi.conf`/`mosquitto-lan.conf`, `password_file` dan `acl_file` harus menunjuk berkas yang benar-benar ada. Jalur Pi memakai jalur lengkap (`/etc/mosquitto/sandi-broker`); jalur laptop memakai jalur relatif (`sandi-broker`), dan brokernya harus dijalankan **dari folder `edge`**.
- **Berkas sandi dibuat di mesin yang salah.** Berkas sandi dari laptop (Mosquitto 2.1.2) **tidak bisa** dipakai Pi (2.0.21): bentuk garamnya berbeda, dan setiap barisnya dibuang dengan `Error: Unable to decode password salt …`. Selalu buat berkas sandi **di mesin tempat broker berjalan** (Praktik 4).
- **Di Pi, `restart` dulu (bukan `reload`) setiap kali ACL atau `use_username_as_clientid` diubah.** `reload` tidak membaca ulang `use_username_as_clientid`, dan ACL yang salah ketik lalu di-*reload* di 2.0.21 justru membuat broker berjalan **tanpa ACL** (Konsep 9). Dengan `restart`, berkas yang salah membuat broker berhenti, dan kesalahannya langsung terlihat.

</details>

<details>
<summary><b>Node 1 atau simulator DITOLAK setelah broker dikunci (<code>MQTT DITOLAK broker (kode 5)</code>)</b></summary>

Kode 5 berarti broker menolak nama pengguna dan kunci. Broker sengaja tidak memberi tahu bagian mana yang salah, jadi periksa satu per satu:

- **Kunci di tiga tempat harus sama persis.** Kunci yang sama harus ada di (1) jawaban `POST /devices` (pengelola sandimu), (2) berkas sandi broker (`mosquitto_passwd <id>` di mesin broker), dan (3) perangkat (`kunci <isi>` di Serial Monitor, atau `KUNCI_<DEVICE_ID>=` di `alat/.env`). Kalau salah satu berbeda satu huruf, ditolak. Ketik `kunci` di Serial Monitor Node 1 untuk memastikan empat huruf terakhirnya cocok dengan kunci di pengelola sandi.
- **Nama pengguna = `device_id` huruf kecil.** Akun di broker harus bernama persis `a4cf12e5b7c0` (12 digit heksadesimal huruf kecil), bukan huruf besar atau nama lain.
- **Huruf besar-kecil kunci.** Kunci *base64url* membedakan huruf besar dan kecil. Kalau kamu mengetiknya ulang dengan tangan, salin-tempel saja; satu huruf yang salah kapital sudah membuatnya ditolak.
- **Kunci tersalin utuh.** Kunci 43 huruf kadang terpotong saat disalin dari panel jawaban Bruno, atau tanda petik `"` ikut tersalin. Buat kunci baru dengan `POST /devices/:id/kunci`, lalu salin lagi dengan hati-hati, pasang di ketiga tempat.
- **Kunci baru? Pasang di ketiga tempat.** Begitu kamu memanggil `POST /devices/:id/kunci`, kunci lama langsung mati. Perbarui berkas sandi broker dan perangkat/`.env` juga, lalu muat ulang broker.
- **Node 1 mencoba lagi tiap 60 detik.** Setelah kamu memperbaiki berkas sandi dan memuat ulang broker, ketik ulang `kunci <isi>` di Serial Monitor supaya Node 1 mencoba **sekarang** tanpa menunggu.

</details>

<details>
<summary><b>Setelah daftar izin dipasang, ada yang tidak sampai (dashboard tidak bisa menyalakan kipas, data Node 2 hilang, pemeriksa GAGAL)</b></summary>

Daftar izin menolak diam-diam: pesan yang ditolak tidak dikembalikan dengan galat (kecuali PUBLISH QoS 1 di MQTT 5), hanya dibuang. Jadi gejalanya "sesuatu berhenti bekerja", bukan pesan galat. Periksa `edge/acl-broker`:

- **`device_id` salah ketik.** Blok `user a4cf12e5b7c0` dan dua baris di bawahnya, `topic write rpm/246f28b1c7d4/telemetry` dan `topic write rpm/246f28b1c7d4/status`, harus memakai `device_id` Node 1 dan Node 2 **milikmu**, sama persis dengan tiga baris yang diberikan backend di Praktik 1.9. Kalau Node 2 di dashboard berhenti terisi, biasanya di sinilah salahnya.
- **Lupa *restart* setelah mengubah ACL.** ACL hanya terbaca ulang saat broker di-*restart* (Pi: `sudo systemctl restart mosquitto`; laptop: **Ctrl + C** lalu jalankan lagi). `reload` tidak cukup, dan di Pi malah berbahaya (Konsep 9).
- **Baris `pattern` vs `topic`.** `pattern` berlaku untuk semua akun dengan `%u` diganti nama penggunanya; `topic` (di dalam blok `user …`) hanya untuk akun itu. Kalau kamu menaruh `topic write rpm/%u/telemetry` tanpa `user`, `%u` tidak terisi dan tidak ada yang cocok.
- **Backend atau Node-RED kehilangan hak `cmd`.** Pastikan blok `user backend` dan `user nodered` memuat `topic write rpm/+/cmd`. Tanpa itu, perintah dari dashboard dan API tidak sampai ke perangkat, walaupun backend sendiri tetap tersambung.
- **Catatan `#` harus di awal baris.** Sama dengan berkas `.conf`: `#` di tengah baris dianggap bagian dari aturan.

</details>

<details>
<summary><b><code>mosquitto_passwd</code> menghapus akun lain, atau menolak dengan <code>File exists</code></b></summary>

- **Semua akun hilang setelah menambah satu akun.** Kamu memakai `-c` untuk akun kedua dan seterusnya. `-c` berarti "buat berkas baru" dan **menimpa** berkas lama. Hanya akun pertama memakai `-c`; sisanya tanpa `-c`. Ulangi Praktik 4.2 dari awal.
- **macOS: `Error: Unable to open file … for writing. File exists.`** Mosquitto 2.1.2 di macOS menolak `-c` kalau berkasnya sudah ada (berbeda dari Pi yang menimpanya). Hapus dulu berkas lamanya, atau tambahkan akun tanpa `-c`.
- **`Warning: User <nama> not found in password file.`** Saat `-D` (hapus), nama akun itu memang sudah tidak ada. Tidak berbahaya.

</details>

<details>
<summary><b>MQTTX "berhasil" mengirim pesan terlarang, atau tidak menampilkan galat apa pun</b></summary>

- **QoS 0 tidak pernah memberi tanda.** Di kotak kirim MQTTX, QoS 0 tidak menunggu jawaban broker, jadi pesan yang dibuang daftar izin pun terlihat "terkirim". Pilih **QoS 1** untuk melihat `Error: Publish error: Not authorized`. Bukti yang lebih bisa dipercaya: perangkat tidak bereaksi, dan log broker menulis `Denied PUBLISH`.
- **MQTT 3.1.1 juga diam.** Kalau sambungan MQTTX-mu memakai MQTT 3.1.1, jawaban PUBACK-nya tidak membawa kode alasan, jadi tidak ada galat merah walaupun QoS 1. Pakai **MQTT 5.0** (bawaan MQTTX) untuk melihat penolakannya.
- **Gelembung pesan tetap muncul di daftar.** Itu catatan MQTTX bahwa ia sudah mengirim, bukan tanda broker menerimanya. Yang penting pelanggan lain (`pemantau`, pemeriksa) tidak menerimanya.

</details>

<details>
<summary><b>Backend menulis <code>broker belum terjangkau</code> lalu <code>broker MENOLAK backend</code></b></summary>

Saat broker **hidup** tetapi menolak akun backend (sandi `backend` di berkas sandi broker salah), pustaka `mqtt` tetap mencetak `WARN: broker belum terjangkau, mencoba lagi dalam 5 detik` sesaat sebelum pesan yang sebenarnya, `ERROR: broker MENOLAK backend (Connection refused: Not authorized, kode 5): …`. Baris `belum terjangkau` itu agak menyesatkan (brokernya sebenarnya terjangkau, hanya menolak), tetapi tidak berbahaya. Yang perlu kamu lakukan ada di baris `MENOLAK`: periksa `MQTT_USERNAME`/`MQTT_PASSWORD` di `backend/.env` dan akun `backend` di berkas sandi broker, lalu muat ulang broker. Begitu cocok, backend pulih sendiri dalam satu menit, tanpa `npm run dev` dijalankan ulang. `/health` menulis `"broker": false` selama ditolak.

</details>

<details>
<summary><b><code>GET /devices</code> menulis <code>"status": "online"</code> untuk perangkat yang baru kamu cabut</b></summary>

Ini wajar dan sudah dijelaskan di Praktik 7.3. Saat broker memutus klien yang akunnya dicabut, wasiat `offline` **tidak** dikirim, jadi pesan `status` *retained* perangkat itu bisa tetap `online` di broker. Backend pun mengabaikan pesan status sesudah pencabutan. Patokan yang benar adalah kolom **`kunci`** di `GET /devices` (`dicabut`), bukan `status`. Dashboard Modul 22 nanti juga membaca kolom `kunci`.

</details>

<details>
<summary><b>Backend tiba-tiba "restart sendiri" saat <code>npm test</code> (Windows), atau <code>GET /devices/:id/vitals</code> menjawab 404</b></summary>

- **Backend restart saat `npm test`.** Kalau `npm test` dijalankan di folder yang sama sementara `npm run dev` masih hidup, `node --watch` di Windows kadang mencetak `Change detected in '…\node_modules\…'` dan memulai ulang backend. Penyebabnya: Vitest membaca berkas-berkas di `node_modules`, dan pemantau berkas Windows ikut memperhatikan waktu akses berkas. Tidak merusak (backend menyambung lagi), hanya membingungkan. Jalankan `npm test` di terminal yang berbeda dari `npm run dev`, atau hentikan `npm run dev` sebentar.
- **`GET /devices/:id/vitals` 404 sesudah backend restart.** `vitals` disimpan di memori (batasan v1.0), jadi kosong lagi setiap backend dimulai ulang, sampai perangkat mengirim `vitals` berikutnya (Node 1 hanya mengirimnya saat menyambung dan tiap 5 menit). `telemetry` yang mengalir 10 detik sekali tidak terpengaruh. Tunggu beberapa menit, atau sambungkan ulang perangkatnya.

</details>

<details>
<summary><b><code>scp</code> ke Pi gagal, atau berkas tidak muncul di tempatnya</b></summary>

- **`Permission denied`** saat `scp ... budi@192.168.1.37:/etc/mosquitto/…`: folder `/etc` butuh `sudo`, dan `scp` tidak bisa `sudo`. Salin dulu ke folder rumahmu (`scp ... budi@192.168.1.37:acl-broker`), lalu di Pi `sudo cp ~/acl-broker /etc/mosquitto/acl-broker` (Praktik 5.3).
- **Pola `scp` selalu *dari* lalu *ke*.** `scp ../edge/acl-broker budi@192.168.1.37:acl-broker` menyalin berkas laptop **ke** Pi. Kalau terbalik, kamu malah menimpa berkas laptop.
- **Host key berubah.** Kalau `scp` memperingatkan `REMOTE HOST IDENTIFICATION HAS CHANGED`, biasanya kamu memasang ulang Pi. Ikuti petunjuk di Modul 12 🚨 untuk memperbarui `known_hosts`.

</details>

<details>
<summary><b>Node-RED menjadi merah "disconnected" setelah broker dikunci (jalur perangkat)</b></summary>

Kamu melewati Praktik 4.3, atau mengisi akunnya setelah broker dikunci. Node-RED masuk ke broker tanpa akun, jadi ditolak. Buka node broker `Mosquitto di gateway` → tab **Security** → isi **Username** `nodered` dan **Password** sandi `akun broker nodered`, lalu **Update**, **Done**, **Deploy**. Kalau sandinya benar, titik di bawah node MQTT kembali hijau `connected` dalam beberapa detik. Pastikan juga akun `nodered` ada di berkas sandi broker dan blok `user nodered` ada di `acl-broker`.

</details>

<details>
<summary><b>Pesan Zod <code>Kunci tidak dikenali : "kunci"</code> saat <code>POST /devices</code></b></summary>

Ini sudah disinggung di Praktik 1.9. Kalau kamu menambahkan kolom `"kunci"` ke isi (*body*) `POST /devices`, Zod menolaknya dengan `body/ Kunci tidak dikenali : "kunci"`. Kata "Kunci" di pesan itu adalah terjemahan Zod untuk "kolom JSON yang tidak dikenal" (*unrecognized key*), **bukan** kunci perangkat. Backend selalu membuat kunci sendiri, jadi kamu tidak perlu (dan tidak boleh) mengirim kolom `kunci`. Hapus kolom itu dari *body*-mu; isi yang benar hanya `device_id`, dan boleh `nama`, `lokasi`, `jenis`, serta `penghubung`.

</details>

## 🔬 Bedah Teknis (opsional)

Bagian ini boleh dilewati. Isinya menjelaskan "mengapa" yang lebih dalam dan pilihan lain yang dipakai di dunia kerja.

<details>
<summary><b>Mosquitto <i>dynamic security</i></b></summary>

Rumah Pintar Mini memakai dua daftar: daftar resmi di backend, dan berkas sandi serta daftar izin di broker. Mosquitto 2.x punya cara ketiga yang menghapus berkas sama sekali: ***dynamic security plugin*** (pengaman dinamis).

- **Akun, kelompok, dan peran disimpan plugin** di satu berkas JSON milik broker, lalu **diubah saat broker berjalan** lewat pesan MQTT ke topik khusus `$CONTROL/dynamic-security/v1` atau lewat alat `mosquitto_ctrl`. Contoh perintahnya berbentuk JSON seperti `{"commands":[{"command":"createClient","username":"a4cf12e5b7c0","password":"…"}]}`.
- **Perubahan berlaku seketika**, tanpa muat ulang. Menurut kode sumbernya, akun yang dihapus atau dinonaktifkan langsung ditendang dari broker, dan log Mosquitto 2.0.21 menulis `Client … been disconnected by administrative action.` (kalimat Inggrisnya memang begitu di kode sumbernya).
- **Langganan juga bisa ditolak**, tidak seperti berkas daftar izin biasa (Konsep 7).
- Backend bisa menjadi pengelolanya: `POST /devices` cukup mengirim `createClient` ke broker, dan `POST /devices/:id/cabut` mengirim `deleteClient`. Dua daftar menjadi satu alur.

Mengapa modul ini tidak memakainya? Ada tiga alasan. Pertama, butuh satu **akun admin broker** yang sangat berkuasa, dan sandinya harus disimpan backend: kalau bocor, seluruh broker jatuh. Kedua, Mosquitto 2.0.21 di Pi belum mengenal pengganti `%u` di aturan plugin ini, jadi setiap perangkat butuh perannya sendiri. Ketiga, untuk tiga atau empat perangkat, berkas sandi dan daftar izin yang bisa dibaca dengan mata jauh lebih mudah dipahami. Untuk ratusan perangkat, *dynamic security* (atau broker lain yang membaca akun dari database) adalah langkah berikutnya yang wajar.

</details>

<details>
<summary><b>Resep <code>$7$</code>: mengapa berkas sandi buatan laptop ditolak Pi</b></summary>

Setiap baris berkas sandi Mosquitto berbentuk `nama:$7$<putaran>$<garam>$<sidik jari>`. `$7$` berarti resep **PBKDF2-SHA512**: sandi dan garamnya diaduk dengan SHA-512 berulang kali sebanyak angka `<putaran>`, mirip gagasan "sengaja lambat" bcrypt di Modul 20. Garam dan sidik jarinya ditulis dalam *base64* biasa (boleh berakhiran `=`).

| | Mosquitto 2.0.21 (Pi) | Mosquitto 2.1.2 (laptop) |
| :--- | :--- | :--- |
| Putaran bawaan `mosquitto_passwd` | 101 | 1.000 |
| Panjang garam | 12 *byte* (16 huruf) | 64 *byte* (88 huruf) |
| Garam yang diterima saat memuat berkas | **hanya 12 *byte*** | 12 atau 64 *byte* |

Karena Mosquitto 2.0.21 hanya menerima garam 12 *byte*, setiap baris buatan `mosquitto_passwd` 2.1.2 dibuang dengan pesan `Error: Unable to decode password salt for user …, removing entry.`, dan semua akun itu ditolak. Arah sebaliknya aman: Mosquitto 2.1.2 masih menerima garam 12 *byte*. Kesimpulannya sederhana: **jalankan `mosquitto_passwd` di mesin broker**.

Resep yang sama bisa dihitung di Node.js dengan `crypto.pbkdf2Sync(sandi, garam, 101, 64, "sha512")`. Saat modul ini disiapkan, rumus itu dicocokkan dengan tiga contoh resmi di folder uji Mosquitto, dan hasilnya sama persis sampai *byte* terakhir. Rumus itulah bahan 🧩 Tingkat 3.

</details>

<details>
<summary><b>Muat ulang yang berbahaya: daftar izin salah ketik di Mosquitto 2.0</b></summary>

Konsep 9 menyarankan *restart*, bukan *reload*, setiap kali daftar izin diubah. Alasannya ada di kode sumber Mosquitto 2.0.21:

1. Saat dimuat ulang, broker membaca lagi berkas sandi dan daftar izin, tetapi **tidak memeriksa** apakah pembacaan daftar izin berhasil.
2. Kalau daftar izin berisi baris yang salah, misalnya `topik read rpm/#` (seharusnya `topic`), pembacaannya gagal **sebelum** pemeriksa izin dipasang lagi.
3. Tanpa satu pun pemeriksa izin, Mosquitto memutuskan "boleh" untuk semua permintaan.

Akibatnya, broker tetap berjalan, tetapi **tanpa daftar izin sama sekali**: semua akun boleh menulis ke topik mana pun. Tandanya hanya dua baris di log: `Error: Invalid line in acl_file "/etc/mosquitto/acl-broker": topik read rpm/#.` dan `Error opening acl file "/etc/mosquitto/acl-broker".` Penulis menyimpulkan perilaku ini dari kode sumbernya, belum dari broker sungguhan.

Mosquitto 2.1 memperbaikinya dengan cara lain: berkas yang rusak saat dimuat ulang membuat broker **berhenti**. Itu lebih aman, tetapi broker yang berjalan sebagai layanan bisa mati diam-diam. Pilihan `mosquitto --test-config` yang baru di 2.1 pun tidak menolong, karena ia hanya memeriksa berkas pengaturan utama, bukan daftar izin.

Dengan *restart*, berkas yang salah membuat broker **gagal menyala**. Itu terlihat jelas di `sudo systemctl status mosquitto` dan di log, dan kamu bisa langsung memperbaikinya. Kegagalan yang terlihat lebih baik daripada kegagalan yang diam-diam.

</details>

<details>
<summary><b><i>Secure boot</i> dan <i>flash encryption</i></b></summary>

Konsep 5 menyebut bahwa siapa pun yang memegang papan bisa menyalin isi *flash*-nya, termasuk kunci di NVS. ESP32 punya dua fitur untuk itu, keduanya dijelaskan di dokumentasi resmi Espressif:

- ***Flash encryption*** mengenkripsi isi *flash*, termasuk firmware dan NVS, dengan kunci 256 bit yang disimpan di **eFuse**. Isi *flash* yang disalin dengan kabel USB hanya berupa *byte* acak.
- ***Secure boot* v2** memeriksa **tanda tangan digital** bootloader dan firmware setiap kali papan menyala. Firmware yang tidak ditandatangani dengan kunci privatmu ditolak, jadi orang lain tidak bisa mengganti firmware papanmu dengan firmware buatannya.

**eFuse** adalah "sekring" kecil di dalam chip yang hanya bisa dibakar **sekali seumur hidup**. Setelah dibakar, tidak ada jalan kembali. Salah langkah bisa membuat papan tidak bisa diisi firmware lagi. Itulah sebabnya kedua fitur ini **hanya dibahas**, tidak dicoba di papan Node 1 atau papan belajarmu. Fitur ini dipakai di perangkat produksi, biasanya dengan proses pabrik yang sudah teruji, dan mode *Development* tersedia untuk mencobanya di papan khusus percobaan. Keduanya menjawab butir I10 OWASP IoT Top 10 (Konsep 10).

</details>

<details>
<summary><b>mTLS: sertifikat untuk setiap perangkat</b></summary>

TLS (Modul 27) membuat perangkat bisa memastikan bahwa ia berbicara dengan broker yang benar, dan mengenkripsi seluruh lalu lintasnya. **mTLS** (*mutual TLS*, TLS dua arah) melangkah lebih jauh: broker **juga** meminta sertifikat dari setiap perangkat.

- Setiap perangkat memegang **kunci privat** yang tidak pernah meninggalkan papannya. Yang dikirim hanya bukti bahwa ia memegang kunci itu, jadi tidak ada sandi yang bisa disadap seperti di Praktik 8.
- Mosquitto mendukungnya dengan pengaturan `require_certificate true`. Dengan `use_identity_as_username true`, nama di sertifikat perangkat dipakai sebagai nama penggunanya, sehingga daftar izin `%u` minggu ini tetap berlaku.
- Mencabut perangkat berarti mencabut sertifikatnya.

Cara inilah yang dipakai layanan IoT besar seperti AWS IoT. Untuk Rumah Pintar Mini, nama pengguna dan kunci sudah cukup di jaringan rumah; TLS menyusul di Modul 27.

</details>

<details>
<summary><b><i>Provisioning</i> di industri</b></summary>

Rumah Pintar Mini menyiapkan perangkat dengan tangan: satu `POST /devices`, satu `mosquitto_passwd`, dan satu perintah Serial. Pabrik yang membuat ribuan perangkat tidak bisa begitu.

- **AWS IoT *Fleet Provisioning***: setiap perangkat keluar dari pabrik dengan sertifikat "klaim" yang sama. Saat pertama kali menyala, perangkat menukarkannya dengan sertifikat dan kunci privat **unik miliknya sendiri**, lalu mendaftarkan diri sebagai "benda" (*thing*) baru. Sesudah itu ia hanya memakai sertifikat unik itu.
- **Azure IoT Hub *Device Provisioning Service* (DPS)**: layanan pendamping yang mengenali perangkat baru lewat sertifikat atau kunci, lalu mendaftarkannya otomatis ke IoT Hub yang tepat.

Intinya sama dengan modul ini: **setiap perangkat mendapat identitasnya sendiri**, tidak ada sandi bersama, dan setiap identitas bisa dicabut satu per satu. Bedanya hanya pada skala dan otomatisasinya. Modul 28 membahas pengelolaan banyak perangkat.

</details>

<details>
<summary><b>Mengunci layanan Mosquitto di laptop secara permanen</b></summary>

Jalur laptop di modul ini menjalankan broker berkunci di terminal VS Code, seperti Modul 11. Layanan Mosquitto yang kamu pasang di Modul 12 Praktik 7 tetap memakai pengaturan lamanya, tanpa kunci, setiap kali kamu menyalakannya lagi. Kalau kamu ingin layanan itu juga berkunci:

- **Windows**: tambahkan empat baris Praktik 4 ke `C:\Program Files\Mosquitto\mosquitto.conf` (cara menyuntingnya sama dengan Modul 12 Praktik 7) dengan **jalur lengkap**, misalnya `password_file C:\Program Files\Mosquitto\sandi-broker`, karena layanan tidak berjalan dari folder `edge`. Buat berkas sandinya dengan `mosquitto_passwd` di terminal Administrator di folder itu, lalu `net stop mosquitto` dan `net start mosquitto`.
- **macOS**: tambahkan baris yang sama ke `/opt/homebrew/etc/mosquitto/mosquitto.conf` (Mac Intel: `/usr/local/etc/…`) dengan jalur lengkap, lalu `brew services restart mosquitto`.

Catatan jujur: penulis belum menguji cara ini. Di Windows, `mosquitto_passwd` membuat berkas yang hanya boleh dibaca akun pembuatnya, dan layanan berjalan sebagai akun sistem Windows, jadi bisa saja layanan tidak bisa membaca berkas itu. Karena catatan layanan di Windows hanya bisa dibaca akun sistem (Modul 12), cara paling mudah memeriksanya adalah mencoba menyambung dengan MQTTX: kalau akun yang benar pun ditolak, kembalikan `mosquitto.conf` dari salinan `mosquitto.conf.asli`, lalu pakai broker di terminal saja.

</details>

## 🧩 Tantangan mandiri

Kerjakan di cabang baru dari `main` **sesudah** ➕ selesai (pekerjaan Modul 21 sudah di `main`): `git switch main`, `git pull`, lalu `git switch -c coba/m21-tantangan`. Tidak ada kunci jawaban; yang penting kamu mencobanya. Kalau hasilnya rapi, buka *pull request*-nya sendiri.

### Tingkat 1 — Tambah perangkat latihan kedua tanpa menyentuh kode (20 menit)

Daftar izin dengan pola `%u` dirancang supaya menambah perangkat **tidak** perlu mengubah berkas apa pun. Buktikan: hidupkan perangkat latihan kedua, `f00d00000002`, sampai datanya masuk, **tanpa** mengetik satu baris pun di `acl-broker` atau kode.

**Tugas.** Daftarkan `f00d00000002` lewat `POST /devices`, pasang kuncinya di tiga tempat (backend sudah; broker dengan `mosquitto_passwd`; `alat/.env` dengan `KUNCI_F00D00000002=`), lalu jalankan simulator untuk dua perangkat (`… simulator-perangkat.js mqtt://… 2`). Keduanya harus `online`, dan `pemeriksa-kontrak.js` harus memberi `LULUS` pada pesan keduanya.

**Petunjuk.** Baris `pattern write rpm/%u/telemetry` sudah berlaku untuk `f00d00000002` juga, karena `%u` diganti nama penggunanya. Yang perlu ditambah hanya **akun** di berkas sandi (muat ulang broker, bukan *restart*, karena ACL tidak berubah) dan **kunci** di `alat/.env`.

**Lulus kalau:** `GET /devices` menulis `f00d00000002` `online`/`aktif`, pemeriksa memberi `LULUS`, dan kamu **tidak** mengubah `acl-broker`. Renungkan: seandainya ACL memakai `%c` dan daftar `user …` satu per satu, berapa berkas yang harus diubah untuk setiap perangkat baru?

### Tingkat 2 — "Kenapa ditolak?" rute `cek-kunci` (45–60 menit)

Saat Node 1 menulis `MQTT DITOLAK broker (kode 5)`, kamu tidak tahu apakah kuncinya salah, atau akunnya belum ada di broker. Backend memegang sidik jari kunci, jadi ia bisa menjawab satu pertanyaan sempit: "apakah kunci ini kunci yang berlaku untuk perangkat ini?" Bangun rute `POST /devices/:id/cek-kunci` untuk itu. Rute ini sengaja **tidak** ada di kode utama, karena ia menerima kunci di *body* dan harus dibuat sangat hati-hati.

**Tugas.** Tambahkan:

1. Di `src/db/perangkat.ts`, fungsi `ambilKunciHash(deviceId)` yang mengembalikan `kunci_hash` perangkat terdaftar (`undefined` kalau belum terdaftar, `null` kalau dicabut). Ini satu-satunya tempat `kunci_hash` boleh keluar dari berkas itu.
2. Di `src/routes/perangkat.ts`, rute `POST /devices/:id/cek-kunci` (admin) yang menerima `{ "kunci": "…" }`, lalu menjawab `{ "device_id": "…", "cocok": true|false }`. Perangkat yang dicabut atau belum terdaftar dijawab `404`.

**Petunjuk.** Pembandingnya `cocokkanKunci()` dari `src/auth/kunci.ts` (sudah ada, dan sudah diuji), yang memakai `timingSafeEqual` dari pemanasan langkah 2. **Jangan** memakai `===`. Beri rute ini `config: { rateLimit: { max: 10, timeWindow: 60_000 } }` seperti `POST /auth/login`, supaya tidak bisa dipakai menebak kunci. Dan jangan pernah mencatat kunci dari *body* ke log.

**Lulus kalau:** kunci yang benar menjawab `cocok: true`, kunci yang salah `cocok: false`, perangkat yang dicabut `404`, dan tes baru di `src/routes/perangkat.test.ts` membuktikannya tanpa database (pakai `vi.mock` seperti tes yang sudah ada). Pikirkan: mengapa rute ini **tidak** dipasang di kode utama, padahal kelihatannya berguna? (Petunjuk: ia menerima kunci mentah di jaringan yang masih polos, dan membuka pintu untuk menebak kunci satu per satu. Lebih aman tidak ada sama sekali.)

### Tingkat 3 — Backend membuat berkas sandi broker sendiri (60–90 menit)

Minggu ini kamu menyalin kunci dari backend ke broker **dengan tangan**, lewat `mosquitto_passwd`. Di pabrik dengan ratusan perangkat, itu mustahil. Resep `$7$` Mosquitto sebenarnya hanya PBKDF2-HMAC-SHA512, yang ada di Node.js (`crypto.pbkdf2`). Jadi backend bisa membangkitkan baris berkas sandi sendiri, langsung dalam bentuk yang dimengerti broker.

**Tugas.** Tulis skrip `backend/src/alat/buat-sandi-broker.ts` (dijalankan dengan `node`) yang, untuk satu `device_id` dan kuncinya, mencetak satu baris berkas sandi Mosquitto 2.0.21:

```text
a4cf12e5b7c0:$7$101$<garam base64>$<sidik jari base64>
```

dengan 101 putaran, garam acak 12 *byte*, dan sidik jari PBKDF2-HMAC-SHA512 sepanjang 64 *byte*, keduanya dalam base64.

**Petunjuk.** Bentuk barisnya `nama:$7$<iterasi>$<garam base64>$<hash base64>`. Garam acak: `randomBytes(12)`. Sidik jari: `pbkdf2Sync(kunci, garam, 101, 64, "sha512")`. Keduanya `toString("base64")` (base64 biasa, **bukan** `base64url`). Mosquitto 2.0.21 hanya menerima garam **12 *byte*** (laptop 2.1.2 memakai 1.000 putaran dan garam 64 *byte*, yang **tidak** dikenali Pi).

**Lulus kalau:** baris buatan skripmu, ditaruh di berkas sandi Pi, membuat perangkat itu bisa masuk, sama seperti baris buatan `mosquitto_passwd`. Uji dengan satu perangkat latihan. Renungkan risikonya: begitu backend bisa menulis berkas sandi broker, backend memegang "kunci induk" seluruh broker. Di mana berkas itu disimpan, dan siapa yang boleh menyuruh backend membuatnya? (Inilah yang dibahas 🔬 "*Provisioning* di industri": AWS IoT dan Azure DPS memisahkan tugas ini ke layanan tersendiri.)

## ➕ Tambahan ke "Rumah Pintar Mini"

Lima langkah untuk membereskan dokumen, lalu menggabungkan semua pekerjaan Modul 21 ke `main`. Langkah A–D menyiapkan berkas; langkah E menyatukannya lewat *pull request* "keamanan perangkat". Beginilah seluruh proyek setelah minggu ini, berkunci untuk manusia dan perangkat:

![Diagram proyek Rumah Pintar Mini setelah Modul 21: rumah kini berkunci untuk manusia dan perangkat; garis putus-putus berarti menyusul. Baris atas, dari kiri: Node 2 Kebun v1.0.0 dengan baterai 18650, tidak berubah, tanpa kunci, lewat Node 1, mengirim lewat ESP-NOW ke Node 1 Rumah v1.6.0, yang menyimpan kunci broker di NVS (kunci_broker, diisi lewat Serial) dan memakai akun a4cf12e5b7c0; firmware baru dari Praktik 3. Node 1 mengirim MQTT beserta kuncinya ke gateway Raspberry Pi 192.168.1.37. Di dalamnya, kartu hijau Mosquitto berkunci, baru: allow_anonymous false, sandi-broker dan acl-broker, serta use_username_as_clientid true; dan kartu Node-RED dengan dashboard, kartu Kebun, dan grup Sensor RS-485, kini dengan akun nodered di tab Security, baru. Pi tersambung ke HP (Node-RED dan Telegram); Telegram, dengan peringatan dan /status, tidak berubah. Di kiri tengah, kartu klien broker di laptop, satu akun untuk setiap program, dengan garis MQTT ke broker, masing-masing dengan akunnya: MQTTX dengan akun pemantau yang hanya membaca; pemeriksa kontrak dengan akun pemeriksa; simulator (pilihan), f00d00000001, kuncinya di alat/.env; dan penyadap (pilihan), alat/penyadap.js untuk Praktik 8. Di bawahnya, kotak jujur, belum aman, dengan empat butir: lalu lintas MQTT dan HTTP masih polos (TLS di Modul 27); kunci di NVS terbaca siapa pun yang memegang papannya; backend masih hanya di 127.0.0.1 (laptop); hitungan rate limit di memori, nol lagi saat backend restart. Kotak besar Laptop, backend di 127.0.0.1:8080, menerima rpm/# dari broker dan mengirim cmd (set, config) dengan akun backend, serta tersambung ke Telegram lewat internet, HTTPS keluar dengan long polling. Di dalamnya, kotak hijau backend v1.0, berkunci untuk manusia dan perangkat: Fastify dan TypeScript dengan kontrak data 1.4, lalu yang baru: daftar resmi perangkat; kunci per perangkat, 43 huruf acak, disimpan sebagai SHA-256; lapis kedua, perangkat belum terdaftar atau dicabut diabaikan; akun broker backend di .env; /health menghitung diabaikan; dan Vitest 35 tes, 17 di antaranya baru untuk kunci dan daftar; serta yang tetap: login, peran, dan satpam dari Modul 20, realtime, aturan, jadwal, bot Telegram, dan 1.0.0 di /docs. Daftar API terbagi dua. Terbuka tanpa login: GET /health, GET /docs, POST /auth/login, POST /auth/refresh, dan POST /auth/logout. Butuh login, ditandai gembok, untuk semua yang lain: GET /devices, kini dari database; POST /devices, POST /devices/:id/kunci, dan POST /devices/:id/cabut, ketiganya baru; POST /devices/:id/command; GET /auth/me; empat rute GET /devices/:id/ lainnya; GET /rules, POST /rules, PUT /rules/:id, dan POST /rules/:id/jalankan; POST dan PUT khusus admin. Backend tersambung lewat pg (pool) ke kotak biru Docker Desktop, kontainer rumahpintar-db: PostgreSQL 17 dan TimescaleDB 2.30.2, volume rumahpintar-data, loket 127.0.0.1:5432; migrasi 010_kunci_perangkat.sql yang baru menambah kolom terdaftar, kunci_hash, kunci_dibuat, dicabut, dan penghubung di devices; baris lama Modul 17–20 tetap ada, tetapi belum terdaftar; dan yang tetap: readings, events, commands, rules, users, serta sesi. Di kanan, para tamu backend: terminal kecil yang login dengan akun viewer dari alat/.env, dengan Socket.IO yang hanya menyiarkan perangkat terdaftar, dan menerima data live; Bruno dengan 5 permintaan baru, yaitu daftarkan Node 1, Node 2, dan perangkat latihan, serta ganti dan cabut kunci; dan browser yang membuka /docs, memakai Try it out POST /auth/login dulu, lalu cookie dibawa browser; catatan: semuanya membawa cookie akses, yaitu gelang. Untuk database: DBeaver dan psql lewat loket 5432 dan docker exec, tidak berubah, serta folder backup/ berisi berkas pg_dump dari Modul 18. Kiri bawah, kartu GitHub rumah-pintar-mini: cabang fitur/keamanan-perangkat menjadi pull request ke main, dan pull request keamanan perangkat ditinjau dengan checklist keamanan, lalu di-merge. Berkas yang baru atau berubah: backend/package.json dan package-lock.json, versi 1.0.0; backend/migrasi/010_kunci_perangkat.sql, baru; backend/src/auth/kunci.ts dan kunci.test.ts, baru; backend/src/db/perangkat.ts, baru; backend/src/services/daftar.ts dan daftar.test.ts, baru, buku tamu dan lapis kedua; backend/src/routes/perangkat.ts dan perangkat.test.ts, untuk daftarkan, ganti kunci, dan cabut; backend/src/services/mqtt.ts, gudang.ts, dan perintah.ts, untuk lapis kedua, hitungan diabaikan, serta jawaban 404 dan 409; backend/src/config/env.ts dan .env.example, dengan MQTT_USERNAME dan MQTT_PASSWORD; backend/src/db/arsip.ts, hanya UPDATE; backend/src/routes/kesehatan.ts, ditambah diabaikan; backend/src/server.ts, 1.0.0; backend/bruno/, ditambah 5 permintaan; backend/README.md, v1.0; alat/simulator-perangkat.js dan pemeriksa-kontrak.js, dengan akun broker dari alat/.env; alat/penyadap.js, baru; alat/.env.example, ditambah kunci per perangkat; alat/README.md, Modul 21; edge/acl-broker, baru; edge/gateway-pi.conf dan mosquitto-lan.conf, dikunci; edge/README.md, Modul 21; firmware/node-1-rumah/, v1.6.0; KONTRAK-DATA.md, 1.4; .gitignore, ditambah edge/sandi-broker; dan .github/pull_request_template.md, ditambah butir keamanan perangkat di Checklist keamanan. Kotak bergembok: tidak pernah ikut Git: .env, bruno/.env, alat/.env, dan edge/sandi-broker. Kanan bawah, kartu hijau Checkpoint Fase 3 dengan tanda perayaan: berkunci untuk manusia dan perangkat; Fase 3 (Modul 16–21) selesai, backend v1.0. Di bawahnya, tiga kartu putus-putus yang menyusul: Modul 22–23, dashboard React di browser; Modul 27, TLS (pintu 8883) dan broker di internet; Modul 28, OTA dan pengelolaan banyak perangkat.](aset/diagram-proyek-modul-21.png)

| Berkas | Isi | Langkah |
| :--- | :--- | :--- |
| `KONTRAK-DATA.md` | kontrak data naik ke **1.4**: baris akun broker dan aturan 6 (ACL `%u`) | A |
| `backend/README.md` | cara menjalankan dan memakai backend **v1.0** | B |
| `edge/README.md` | cara mengunci broker (berkas sandi, ACL, restart vs reload) | C |
| `.github/pull_request_template.md` | tiga butir **Checklist keamanan** untuk keamanan perangkat | D |

### A. Kontrak data 1.4

`KONTRAK-DATA.md` di folder `rumah-pintar-mini` adalah "bahasa bersama" semua bagian proyek (Modul 11). Modul 21 menambahkan **akun broker** ke dalamnya, tanpa mengubah bentuk satu pesan pun. Buka [`kode/KONTRAK-DATA.md`](kode/KONTRAK-DATA.md) di GitHub, klik **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi `KONTRAK-DATA.md`-mu. Yang berubah dari versi 1.3:

- **Bagian 3 (Aturan MQTT)** mendapat baris **Akun broker**: nama pengguna = `device_id`, sandi = kunci perangkat 43 huruf dari `POST /devices`, dan broker memaksa nama klien = nama pengguna (`use_username_as_clientid`).
- **Aturan 6** kini menyebut daftar izin (ACL) pola `%u` dan pengecualian Node 1 → Node 2, menggantikan janji lama "ditegakkan daftar izin broker (Modul 21)".
- **Riwayat perubahan** mendapat baris versi 1.4, dengan catatan tegas bahwa bentuk pesan `telemetry`, `status`, `vitals`, `cmd`, dan `ack` **tidak berubah**.

Selebihnya identik. Perangkat lama tidak perlu diperbarui hanya karena kontraknya naik ke 1.4: yang berubah bukan isi pesan, melainkan cara perangkat masuk ke broker.

### B. Perbarui `backend/README.md`

Teman satu tim yang meng-*clone* repositorimu harus tahu hal yang tidak bisa ditebak dari kode: backend kini butuh `MQTT_USERNAME`/`MQTT_PASSWORD`, perangkat didaftarkan lewat `POST /devices`, dan pesan dari perangkat tak terdaftar diabaikan. Buka [`kode/backend/README.md`](kode/backend/README.md) di GitHub, **Copy raw file**, lalu tempelkan sebagai pengganti seluruh isi `backend/README.md`-mu. Versi v1.0 ini menambahkan bagian **"Keamanan perangkat dan broker (Modul 21)"**, memperbarui tabel API dengan empat rute `/devices` baru, mencatat migrasi `010`, dan menulis ulang **"Batasan v1.0"** dengan jujur: lalu lintas masih polos, dan daftar perangkat dimuat ke memori.

### C. Tulis `edge/README.md`

Folder `edge` menyimpan pengaturan broker dan Node-RED sejak Modul 12–13. Buka [`kode/edge/README.md`](kode/edge/README.md), **Copy raw file**, lalu tempelkan sebagai pengganti `edge/README.md`-mu. Bagian baru **"Mengunci broker (Modul 21)"** merangkum semua yang kamu kerjakan minggu ini di satu tempat: membuat berkas sandi dengan `mosquitto_passwd` **di mesin broker**, `chown`/`chmod` di Pi, kapan **restart** dan kapan **reload**, satu akun untuk setiap program, dan mengisi akun Node-RED di tab **Security**. Berkas `acl-broker`, `gateway-pi.conf`, dan `mosquitto-lan.conf` ikut masuk tabel berkas, dan `sandi-broker` ditandai **tidak pernah ikut Git**.

### D. Tambahkan tiga butir ke Checklist keamanan

Templat *pull request* dari Modul 16, yang diberi **Checklist keamanan** di Modul 20, mendapat tiga butir khusus keamanan perangkat. Buka [`kode/.github/pull_request_template.md`](kode/.github/pull_request_template.md), **Copy raw file**, lalu tempelkan sebagai pengganti `.github/pull_request_template.md`-mu. Tiga butir baru (bertanda **(Modul 21)**) memeriksa: kunci perangkat hanya sidik jari, sekali tampil, dan tidak di `MQTT_URL`; daftar izin broker tetap seketat mungkin dan broker di-*restart* setelah ACL diubah; serta `edge/sandi-broker` tidak ikut Git dan lapis kedua tidak di-*bypass*.

### E. ⭐ Gabungkan `fitur/keamanan-perangkat` ke `main` lewat *pull request* "keamanan perangkat"

Sebelum mulai, simpan keempat dokumen di atas ke cabang:

```text
git add KONTRAK-DATA.md backend/README.md edge/README.md .github/pull_request_template.md
git commit -m "Dokumen v1.0: kontrak 1.4, README backend dan edge, checklist keamanan perangkat (Modul 21)"
git push -u origin fitur/keamanan-perangkat
```

Ini *push* pertama cabang ini, jadi `-u` mencatat pasangannya di GitHub.

1. **Buka *pull request*.** Di GitHub, klik **Compare & pull request** pada pita kuning cabang `fitur/keamanan-perangkat` (atau tab **Pull requests** → **New pull request**, **base: `main`** ← **compare: `fitur/keamanan-perangkat`**). Beri judul `Keamanan perangkat`. Di **Apa yang berubah?**, tulis misalnya: `Backend v1.0: daftar resmi perangkat dengan kunci per perangkat (SHA-256, migrasi 010), POST/GET /devices dan cabut/ganti kunci, lapis kedua yang mengabaikan perangkat tak terdaftar atau dicabut, akun broker backend, firmware Node 1 v1.6.0 (kunci di NVS lewat Serial), simulator dan pemeriksa dengan akun, broker dikunci (sandi, ACL %u, use_username_as_clientid), dan penyadap yang membuktikan lalu lintas masih polos.` Kali ini kotak deskripsinya **sudah** memuat **Checklist keamanan** lengkap, termasuk tiga butir Modul 21, karena templat dari Modul 20 sudah ada di `main`. Klik **Create pull request**.
2. ***Review* dengan checklist keamanan.** Kerjakan butir demi butir, lalu centang yang benar-benar terpenuhi:
   - Di tab **Files changed**, pastikan **tidak ada** `backend/.env`, `backend/bruno/.env`, `alat/.env`, `edge/sandi-broker`, `login*.json`, `kue*.txt`, atau kunci perangkat. Buka permintaan Bruno baru (`daftarkan Node 1.yml` dan kawan-kawan): tidak ada kunci di dalamnya, karena kunci hanya ada di jawaban yang kamu salin ke pengelola sandi.
   - Butir **(Modul 21)** kunci: `migrasi/010` menyimpan `kunci_hash` (SHA-256), bukan kunci; `GET /devices` tidak pernah memuatnya (Praktik 1); dan akun broker ada di `MQTT_USERNAME`/`MQTT_PASSWORD`, bukan di `MQTT_URL` (Praktik 2).
   - Butir **(Modul 21)** ACL: `edge/acl-broker` memakai pola `%u` dengan hak sekecil mungkin, dan kamu membuktikan penyusup ditolak di Praktik 6.
   - Butir **(Modul 21)** berkas sandi dan lapis kedua: `git check-ignore -v edge/sandi-broker` menunjukkan berkas itu diabaikan (Praktik 4.8), dan `db/arsip.ts` tidak lagi membuat baris `devices` otomatis (Praktik 2).
   - Butir paket npm: `npm test` meluluskan **35** tes, tidak ada paket npm baru (`npm audit` `found 0 vulnerabilities`), dan `allowScripts` tidak bertambah (Praktik 8.4).

   Kirim ringkasannya lewat **Review changes** → **Comment** → **Submit review**. Kalau ada berkas rahasia yang telanjur muncul, **jangan di-*merge***: hapus dengan `git rm --cached <nama>`, pastikan namanya ada di `.gitignore`, lalu *commit* dan *push* lagi.
3. ***Merge.*** Pilih **Create a merge commit**, klik **Merge pull request** → **Confirm merge**, lalu **Delete branch**.
4. **Pulang ke `main`:**

   ```text
   git switch main
   git pull --prune
   git branch -d fitur/keamanan-perangkat
   ```

Database tidak terpengaruh perpindahan cabang ini: migrasi `010` sudah tercatat, dan perangkat yang kamu daftarkan tetap ada. Broker dan firmware juga tidak ikut berpindah bersama cabang; keduanya sudah terpasang di mesinnya masing-masing.

### F. Simpan catatan belajarmu

Buka repositori **`belajar-iot`** di jendela VS Code baru, buat berkas **`modul-21/catatan.md`** di samping `pemanasan.js` dari 🔁, lalu isi dengan angka dari layarmu sendiri:

```markdown
# Catatan Modul 21 — Keamanan perangkat dan broker

| Yang diukur | Angkaku |
| :--- | :--- |
| Panjang kunci perangkat dari POST /devices | … huruf |
| Jawaban broker saat MQTTX tanpa sandi (Praktik 4) | … |
| Kode yang ditolak broker saat kunci salah (Praktik 3) | kode … |
| Jeda Node 1 mencoba lagi setelah ditolak (Praktik 3) | … detik |
| Unit test yang hijau (Praktik 8) | … dari … |
| Empat huruf terakhir kunci Node 1-ku (untuk mencocokkan, bukan rahasia) | …{empat huruf} |

Yang paling mengejutkanku: …
```

*Commit* dan *push* di repositori **`belajar-iot`**.

**Bukti lulus Modul 21** (bandingkan dengan ✅ di bawah): MQTTX tanpa sandi ditolak broker (Praktik 4), perangkat yang menyamar ke topik Node 1 ditolak daftar izin dan tercatat (Praktik 6), perangkat yang kuncinya dicabut tidak bisa mengirim data lagi (Praktik 7), dan *pull request* "keamanan perangkat" yang sudah ditinjau lalu di-*merge*.

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Model ancaman** (*threat model*) | Daftar sederhana: siapa yang mungkin menyusup, lewat pintu mana, apa akibatnya, dan kunci apa yang sepadan. Minggu ini pintunya broker MQTT. |
| **Kunci perangkat** (*device key*, *API key*) | 43 huruf acak (*base64url*) yang dibuat backend untuk satu perangkat, dipakai sebagai sandi perangkat itu ke broker. Hanya tampil sekali; database menyimpan sidik jarinya. |
| **Sidik jari** (*hash*) | Hasil fungsi satu arah yang panjangnya tetap: teks sama, sidik jari sama; beda satu huruf, berubah total; tidak bisa dihitung balik. |
| **SHA-256** | Resep sidik jari cepat, hasilnya 64 huruf heksadesimal. Cocok untuk kunci perangkat yang **acak** (Konsep 2), terlalu cepat untuk sandi buatan manusia (itu memakai bcrypt, Modul 20). |
| **`timingSafeEqual`** | Pembanding dua *byte* yang selalu memeriksa semuanya, sehingga lamanya tidak membocorkan di huruf ke berapa dua kunci mulai berbeda. Dipakai agar kunci tidak bisa ditebak dari selisih waktu. |
| ***base64url*** | Cara menulis *byte* sebagai huruf, angka, `-`, dan `_`. Kunci perangkat memakai ini; `base64` biasa (dengan `+` dan `/`) dipakai garam dan sidik jari di berkas sandi Mosquitto. |
| **Daftar resmi** (*registry*) | Tabel `devices` di backend: hanya perangkat yang didaftarkan admin (`terdaftar` terisi) yang didengarkan. |
| ***Provisioning*** | Proses memberi perangkat baru identitas dan kuncinya. Di modul ini: `POST /devices` membuat kunci, lalu kunci itu dipasang ke perangkat dan broker (Konsep 3). |
| **Lapis kedua** | Pemeriksaan kedua di backend: walaupun broker sudah menjaga pintu, backend tetap mengabaikan pesan dari perangkat yang belum terdaftar atau kuncinya dicabut (Konsep 4). |
| **Gagal tertutup** (*fail closed*) | Saat ragu, menolak. Backend mengabaikan perangkat yang tidak dikenalnya, bukan menerimanya; broker menolak akun yang tidak ada, bukan membiarkannya masuk. |
| **NVS** (*Non-Volatile Storage*) | Memori ESP32 yang tidak hilang saat listrik padam. Node 1 menyimpan kuncinya di sini (label `kunci_broker`), bukan di kode (Konsep 5). |
| **Broker** | Kantor pos MQTT (Mosquitto). Sejak minggu ini ia memeriksa siapa yang masuk dan apa yang boleh ditulis. |
| **`allow_anonymous false`** | Pengaturan broker: tamu tanpa nama pengguna tidak boleh masuk. Pasangannya `password_file`. |
| **Berkas sandi** (*password file*) | Daftar nama pengguna dan sidik jari sandinya di broker, dibuat `mosquitto_passwd`. Bentuk barisnya `nama:$7$<iterasi>$<garam>$<sidik jari>`. Tidak pernah ikut Git. |
| **`mosquitto_passwd`** | Alat bawaan Mosquitto untuk membuat dan mengubah berkas sandi. `-c` membuat berkas baru (menimpa!), `-D` menghapus satu akun. Selalu dijalankan di mesin broker. |
| **`$7$`** | Nama resep sidik jari Mosquitto: PBKDF2-HMAC-SHA512. Pi (2.0.21) memakai 101 putaran dan garam 12 *byte*; laptop (2.1.2) memakai 1.000 dan 64, yang tidak dikenali Pi. |
| **CONNACK** | Jawaban broker atas permintaan masuk (CONNECT). Kode **0** berarti diterima; kode **5** (`0x87` di MQTT 5) berarti `Not authorized`, apa pun yang salah. |
| **Daftar izin** (*ACL*, *Access Control List*) | Berkas `acl-broker`: aturan topik apa yang boleh ditulis dan dibaca setiap akun. Mosquitto membacanya dari atas ke bawah; yang tidak disebut, tidak boleh. |
| **Pola `%u`** | Di daftar izin, `%u` diganti **nama pengguna** yang sudah dibuktikan dengan sandi (yaitu `device_id`). `pattern write rpm/%u/telemetry` berlaku untuk semua perangkat sekaligus. |
| **Pola `%c`** | Seperti `%u`, tetapi memakai **nama klien** (*client ID*), yang **tidak** dibuktikan sandi dan bisa dipalsukan. Modul ini memakai `%u`, bukan `%c` (Konsep 8). |
| **Nama klien** (*client ID*) | Nama yang dipilih sendiri setiap klien MQTT. Broker hanya mengizinkan satu sambungan per nama klien, jadi nama yang sama saling menendang. |
| **`use_username_as_clientid`** | Pengaturan broker: nama klien setiap tamu diganti dengan nama penggunanya. Menutup celah penyamaran nama klien, dan membuat `%c` dan `%u` menunjuk perangkat yang sama (Konsep 8). |
| **Mencabut** (*revoke*) | Mematikan kunci satu perangkat tanpa menyentuh yang lain: di backend (`POST /devices/:id/cabut`, berlaku seketika) dan di broker (`mosquitto_passwd -D` + muat ulang). |
| **Muat ulang** (*reload*) vs **mulai ulang** (*restart*) | Muat ulang untuk perubahan **berkas sandi** (sambungan sah tidak terputus). Mulai ulang untuk perubahan **daftar izin** atau `use_username_as_clientid`; di Pi, ACL salah + reload berbahaya (Konsep 9). |
| **Wasiat** (*Last Will*) | Pesan `offline` yang broker terbitkan saat perangkat putus mendadak. Tidak dikirim saat broker memutus perangkat karena akunnya dicabut. |
| **Hak sekecil mungkin** (*least privilege*) | Setiap program hanya diberi hak yang ia butuhkan: MQTTX yang mengintip tidak boleh menulis `cmd`, pemeriksa hanya boleh membaca. |
| **OWASP IoT Top 10** | Daftar sepuluh risiko keamanan IoT yang paling sering, dari komunitas OWASP. Dibahas di 🔬; kunci lemah dan antarmuka tak aman ada di dalamnya. |
| **TLS** (*Transport Layer Security*) | "Amplop" yang menyembunyikan isi lalu lintas dari penyadap. Belum dipasang minggu ini (lalu lintas masih polos); menyusul di Modul 27 (`mqtts://`, port 8883). |

## 📝 Kuis (5 soal)

1. Untuk setiap program ini, sebutkan apakah ia butuh akun broker sendiri dan hak apa yang sepadan: (a) Node 1; (b) Node 2 "Kebun" yang berbicara lewat ESP-NOW; (c) backend; (d) MQTTX yang kamu pakai untuk mengintip; (e) pemeriksa kontrak.
2. Kamu memasang kunci baru untuk Node 1 lewat `POST /devices/a4cf12e5b7c0/kunci`, tetapi lupa memperbaruinya di dua tempat lain. (a) Di tiga tempat mana kunci itu harus sama? (b) Apa yang ditulis Serial Monitor Node 1, dan seberapa sering ia mencoba lagi? (c) Apakah bacaan Node 1 masih masuk ke database selama itu?
3. Seorang tamu di WiFi rumahmu punya akun broker yang sah, `c0ba00000001`, karena papannya pernah kamu pinjami kunci. Ia menyambung ke broker dengan nama klien `a4cf12e5b7c0` (nama klien Node 1), lalu menerbitkan `telemetry` palsu ke `rpm/a4cf12e5b7c0/telemetry`. (a) Apakah Node 1 ditendang keluar? Mengapa? (b) Apakah pesan palsunya sampai ke backend? (c) Di mana jejaknya terlihat? (d) Apa yang berubah seandainya daftar izin memakai `%c`, bukan `%u`?
4. Setelah kamu menjalankan `POST /devices/f00d00000001/cabut`, tetapi **sebelum** menyentuh broker: (a) Apakah backend masih menyimpan bacaan f00d00000001? (b) Apakah broker masih menerima f00d00000001? (c) `GET /devices` menulis `status` apa dan `kunci` apa untuk perangkat itu? (d) Kolom mana yang menjadi patokan keadaannya?
5. Kamu menjalankan `alat/penyadap.js` di antara MQTTX dan broker, lalu MQTTX masuk dengan nama pengguna `backend` dan sandinya. (a) Apa yang bisa dibaca penyadap dari paket CONNECT? (b) Apakah `mosquitto -v` juga mencetak sandi itu? (c) Mengapa ini masih bisa diterima di jaringan rumah, tetapi wajib dibereskan sebelum broker dibuka ke internet? (d) Apa obatnya, dan di modul berapa?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) **Node 1**: ya, akun `a4cf12e5b7c0`; menulis topiknya sendiri (`telemetry`, `status`, `vitals`, `ack`), membaca `cmd`-nya, plus menulis `telemetry`/`status` Node 2. (b) **Node 2**: **tidak** punya akun; ia tidak pernah menyambung ke broker sendiri, pesannya diteruskan Node 1 lewat ESP-NOW. (c) **backend**: ya, akun `backend`; membaca semua `rpm/#`, menulis `rpm/+/cmd`. (d) **MQTTX**: ya, akun `pemantau`; hanya membaca `rpm/#` dan `$SYS/#`. (e) **pemeriksa**: ya, akun `pemeriksa`; hanya membaca `rpm/#`. Akun `pemantau` dan `pemeriksa` terpisah karena satu akun hanya boleh satu sambungan (Konsep 8).
2. (a) Kunci harus sama di **jawaban `POST /devices`** (pengelola sandimu), **berkas sandi broker** (`mosquitto_passwd a4cf12e5b7c0`), dan **perangkat** (`kunci <isi>` di Serial Monitor Node 1). (b) `MQTT DITOLAK broker (kode 5): …`, dan ia mencoba lagi **setiap 60 detik** saja, supaya log broker tidak banjir (Konsep 5). (c) **Tidak.** Broker menolak Node 1, jadi tidak ada pesan yang sampai; dan seandainya kuncinya masih benar di satu tempat, lapis kedua backend tetap memprosesnya hanya kalau perangkatnya terdaftar. Node 1 juga masuk mode offline setelah 2 menit dan menjalankan pengaman kipas lokal.
3. (a) **Tidak ditendang**, karena `use_username_as_clientid` mengganti nama kliennya dengan nama penggunanya, `c0ba00000001`. Nama klien `a4cf12e5b7c0` yang ia kirim diabaikan (Konsep 8). (b) **Tidak.** Daftar izin hanya mengizinkan `c0ba00000001` menulis topiknya sendiri, jadi broker membuang pesan ke `rpm/a4cf12e5b7c0/telemetry`. (c) Di **log broker**, baris `Denied PUBLISH from c0ba00000001 …` (tingkat debug), dan di MQTTX `pemantau` yang tidak pernah menerima pesan palsu itu. (d) Dengan `%c`, nama kliennya `a4cf12e5b7c0`, jadi daftar izin akan mengira ia Node 1 dan **mengizinkannya menulis** atas nama Node 1, sekaligus menendang Node 1 yang asli. Itulah sebabnya modul ini memakai `%u`.
4. (a) **Tidak lagi.** Sejak detik pencabutan, lapis kedua backend mengabaikan pesan f00d00000001 (`DIABAIKAN … kuncinya sudah dicabut`). (b) **Masih**, karena akunnya belum dihapus dari berkas sandi broker. Inilah alasan pencabutan dilakukan di dua lapis (Konsep 9). (c) `status` bisa tetap **`online`** (wasiat tidak terkirim), `kunci` menjadi **`dicabut`**. (d) Kolom **`kunci`** yang menjadi patokan, bukan `status`.
5. (a) Penyadap bisa membaca **nama pengguna dan sandi (kunci) lengkap**, huruf demi huruf, karena keduanya ada di paket CONNECT yang dikirim polos. (b) **Tidak.** Mosquitto tidak pernah mencetak sandi ke log; yang terbuka adalah jalur jaringannya, bukan catatan broker. (c) Di jaringan rumah tertutup, hanya perangkat yang sudah ada di WiFi-mu yang bisa menyadap, jadi risikonya kecil. Di internet, siapa pun di sepanjang jalur bisa membacanya. (d) Obatnya **TLS** (`mqtts://`, port 8883), yang memasang "amplop" pada lalu lintas; dibahas di **Modul 27**.

</details>

---

## ✅ Checklist kelulusan Modul 21

Syarat lulus dari Silabus: **MQTTX tanpa sandi ditolak broker, perangkat yang menyamar ke topik perangkat lain ditolak daftar izin (dan tercatat di log), dan perangkat yang kuncinya dicabut tidak bisa mengirim data lagi.** **Jalur tanpa perangkat:** semua butir boleh dicentang dengan simulator dan MQTTX (jalur laptop).

- [ ] Pemanasan ulang JavaScript selesai, dan jawabanku sudah kucocokkan dengan “Kunci uji dirimu” (🔁).
- [ ] Broker latihan di pintu 1884 menolak MQTTX tanpa sandi, lalu menerimanya setelah diberi akun (Kemenangan Cepat).
- [ ] Migrasi `010_kunci_perangkat.sql` sudah diterapkan, `POST /devices` memberi kunci yang hanya tampil sekali, dan `GET /devices` menandai setiap perangkat `aktif`/`dicabut`/`tanpa-kunci`/`belum-terdaftar` tanpa pernah memuat sidik jarinya (Praktik 1).
- [ ] Backend mengabaikan pesan dari perangkat yang belum terdaftar (`DIABAIKAN …`, dihitung di `/health`), berhenti membuat baris `devices` otomatis, dan membawa akun broker sendiri dari `.env` (Praktik 2).
- [ ] Firmware Node 1 v1.6.0 menyimpan kuncinya di NVS lewat `kunci <isi>` (tidak di kode), menulis `DITOLAK` saat kuncinya belum cocok, dan simulator serta pemeriksa membawa akunnya dari `alat/.env` (Praktik 3).
- [ ] ⭐ Setelah broker dikunci (berkas sandi, `allow_anonymous false`, `use_username_as_clientid`), **MQTTX tanpa sandi ditolak** dengan `Not authorized`, sedangkan semua program yang membawa kunci tersambung sendiri (Praktik 4).
- [ ] Daftar izin `%u` terpasang: akun `pemantau` hanya bisa membaca (percobaan menulis `cmd` dijawab `Not authorized`), perintah backend tetap sampai, dan data Node 2 tetap mengalir lewat Node 1 (Praktik 5).
- [ ] ⭐ Perangkat uji berakun sah yang menyamar ke topik Node 1 **ditolak daftar izin**, Node 1 tidak tertendang, dan penolakannya **tercatat** di log broker (`Denied PUBLISH`), sementara MQTTX pemantau tidak pernah menerima pesan palsunya (Praktik 6).
- [ ] ⭐ Perangkat yang kuncinya dicabut **tidak bisa mengirim data lagi** (diabaikan backend seketika, lalu ditolak broker setelah dimuat ulang), dan bisa dipulihkan dengan kunci baru (Praktik 7).
- [ ] ⭐ Aku melihat sendiri kunci terkirim polos lewat `alat/penyadap.js`, backend naik ke **v1.0**, gladi ketiga syarat lulus berhasil dalam sekali jalan, dan `npm test` meluluskan 35 tes (Praktik 8).
- [ ] ⭐ Templat *pull request* sudah punya tiga butir keamanan perangkat, dan semua pekerjaan Modul 21 sudah ada di `main` lewat *pull request* "keamanan perangkat", tanpa `edge/sandi-broker` atau kunci mana pun (➕).

🎉 **Checkpoint Fase 3 — Rumah Pintar Mini berkunci untuk manusia dan perangkat.** Backend kini **v1.0**. Hanya perangkat yang kamu daftarkan yang didengarkan, masing-masing dengan kuncinya sendiri yang bisa dicabut; broker menolak tamu tanpa sandi dan menjaga setiap perangkat di topiknya sendiri; dan kamu sudah jujur menyebut apa yang belum aman. Fase 3, dari backend sampai keamanan, selesai.

> ➡️ **Fase berikutnya:** Fase 4 memberi rumah ini **wajah**. Modul 22 memulai dashboard React dari nol — HTML, CSS, dan TypeScript — yang membaca API berkunci yang baru saja kamu bangun, dimulai dengan formulir *login* kecil. Asal `http://localhost:5173` miliknya sudah ada di `CORS_ORIGIN` sejak Modul 20, menunggu.

## 📚 Sumber & atribusi gambar

**Dokumentasi, spesifikasi, dan kode sumber yang dipakai** (diakses Oktober 2026):

- **Mosquitto** (broker MQTT): [kode sumber](https://github.com/eclipse-mosquitto/mosquitto) versi **2.0.21** (gateway Raspberry Pi, dari Debian Trixie) dan **2.1.2** (laptop, penginstal resmi dan Homebrew), serta [dokumentasi resmi](https://mosquitto.org/documentation/): [`mosquitto.conf(5)`](https://mosquitto.org/man/mosquitto-conf-5.html) (`allow_anonymous`, `password_file`, `acl_file`, `use_username_as_clientid`, `log_type`), [`mosquitto_passwd(1)`](https://mosquitto.org/man/mosquitto_passwd-1.html), [`mosquitto-tls(7)`](https://mosquitto.org/man/mosquitto-tls-7.html) (untuk Modul 27), dan [daftar kendali akses (ACL)](https://mosquitto.org/man/mosquitto-conf-5.html#idm361). Perilaku yang dikutip di kotak **Hasilnya** (teks log, kode CONNACK, urutan pemeriksaan ACL, apa yang terjadi saat *reload*) ditelusuri langsung dari kode sumber kedua versi itu dan ditandai **contoh**, karena Mosquitto tidak terpasang di laptop penulis minggu ini (lihat "Tentang kotak Hasilnya").
- **Spesifikasi MQTT**: [MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) dan [MQTT 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html) (OASIS): bentuk paket CONNECT (nama pengguna dan sandi), kode jawaban CONNACK (`0x00`, `0x87`), dan PUBACK dengan kode alasan.
- **Pustaka klien MQTT**: [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.16.1 (dipakai backend, dan — versi 4.3.7 — di dalam MQTTX): `reconnectOnConnackError` dan teks galat `Connection refused: Not authorized` / `Publish error: Not authorized`; [PubSubClient](https://github.com/knolleary/pubsubclient) (varian PubSubClient3) 3.3.2 di firmware Node 1: `connect(id, user, pass, …)` dan nilai `state()`. Perilaku broker tiruan untuk menguji sisi klien memakai [mqtt-packet](https://github.com/mqttjs/mqtt-packet) 9.0.2; semua keluaran broker tiruan ditandai **TIRUAN**, bukan Mosquitto.
- **Node.js 24.21.0**: [modul `crypto`](https://nodejs.org/docs/latest-v24.x/api/crypto.html) (`randomBytes`, `createHash`, `timingSafeEqual`, `pbkdf2`) dan [`--env-file`](https://nodejs.org/docs/latest-v24.x/api/cli.html#--env-fileconfig).
- **ESP32**: [dokumentasi NVS (*Non-Volatile Storage*)](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/storage/nvs_flash.html), serta [*flash encryption*](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/security/flash-encryption.html) dan [*secure boot v2*](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/security/secure-boot-v2.html) untuk 🔬.
- **Pedoman keamanan**: [OWASP IoT Top 10 (2018)](https://owasp.org/www-project-internet-of-things/) dan [OWASP IoT Security Verification Standard](https://owasp.org/www-project-iot-security-verification-standard/); OWASP Cheat Sheet Series: [*secrets management*](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) dan [otorisasi](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- **Penyedia IoT terkelola** (🔬 *provisioning* industri): [AWS IoT Core *fleet provisioning*](https://docs.aws.amazon.com/iot/latest/developerguide/provision-wo-cert.html) dan [Azure IoT Hub Device Provisioning Service](https://learn.microsoft.com/en-us/azure/iot-dps/about-iot-dps).
- **Node-RED** (jalur perangkat): [node MQTT](https://cookbook.nodered.org/mqtt/) dan [pengelolaan kredensial](https://nodered.org/docs/user-guide/runtime/securing-node-red#credentials).
- **MQTTX**: [kode sumber](https://github.com/emqx/MQTTX) 1.13.1 (pesan antarmuka ditulis dari kode sumber, karena desktopnya tidak dipakai untuk jalur Wokwi).

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan file sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Daftar lengkapnya, per file, ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-21`, `alur-kunci-perangkat`, `penjaga-pintu-broker`, `dua-lapis-pencabutan`, `kunci-di-paket-connect`, `diagram-proyek-modul-21` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Perilaku kunci, berkas sandi, ACL, CONNACK, dan isi paket CONNECT dari dokumentasi dan kode sumber di atas; angka dan pesan dari lab penulis untuk modul ini (backend v1.0, firmware v1.6.0). Contoh kunci dan sidik jari di gambar dibuat khusus untuk contoh, bukan milik perangkat sungguhan. | CC BY 4.0 |
| `wokwi-kunci-broker.png` | Tangkapan layar asli simulasi [Wokwi](https://wokwi.com) Node 1 v1.6.0 milik penulis (Serial Monitor dan layar OLED), saat Node 1 ditolak lalu diterima broker publik `test.mosquitto.org`; dipotong dan disusun ulang, dengan judul dan keterangan oleh penulis. | Simulasi Wokwi, tangkapan layar Oktober 2026, dipakai untuk tujuan pendidikan, penanda oleh penulis. Judul dan keterangan: CC BY 4.0 |

**Tentang kotak Hasilnya.** Semua perintah dan kode modul ini dijalankan penulis di laptop Windows 11 dengan Node.js 24.21.0 dan npm 11.19.0, database di kontainer lab `timescale/timescaledb:2.30.2-pg17` yang berisi keadaan akhir Modul 20, dengan urutan langkah yang sama persis dengan modul ini. Backend v1.0, simulator, pemeriksa kontrak, terminal kecil, dan penyadap diuji sungguhan; jawaban dan hasil Assert Bruno diambil dari Bruno CLI 4.2.1 (`bru run`), sedangkan teks di jendela Bruno desktop ditulis dari Modul 16–20 dan kode sumbernya. **Mosquitto tidak terpasang di laptop penulis minggu ini**, jadi keluaran broker (catatan `mosquitto.log`, teks `New client connected`/`disconnected, not authorised`/`Denied PUBLISH`, isi berkas sandi, dan reaksi saat *reload*) ditulis dari kode sumber resmi Mosquitto 2.0.21 (Pi) dan 2.1.2 (laptop), dan ditandai **contoh**; reaksi pustaka klien (MQTT.js, PubSubClient) terhadap jawaban broker diuji nyata lewat broker tiruan yang meniru Mosquitto. Firmware Node 1 v1.6.0 diuji di **Wokwi** dengan broker publik `test.mosquitto.org` (akun latihan publik `rw`), bukan di papan sungguhan; keluaran Serial dan OLED-nya adalah **rekaman uji Wokwi**. Jalur perangkat (Node 1, gateway Pi, papan Node 2 sebagai penyusup) dan perintah macOS ditulis dari modul-modul sebelumnya dan kode sumber, tidak dicoba ulang di modul ini. Penulis memakai port lain di lab (`8240`), yang di sini ditulis `8080`. Jam di contoh log Wokwi adalah lama perangkat menyala; cap waktu epoch di log broker memakai zona WITA laptop penulis. Jam, kunci, sidik jari, dan `device_id` di layarmu pasti berbeda, jadi keluaran seperti itu ditandai **contoh** atau **rekaman uji Wokwi**.

---

[⬅️ Modul 20](../modul-20-keamanan-pengguna/README.md) · [Fase 3](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 22 — HTML, CSS, & React (TypeScript) dari Nol untuk Dashboard IoT** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-22--html-css--react-typescript-dari-nol-untuk-dashboard-iot))
