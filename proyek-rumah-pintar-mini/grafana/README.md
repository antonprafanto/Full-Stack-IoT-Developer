# Grafana Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../en/mini-smart-home/grafana/README.md)

Grafana adalah dashboard **tim teknis** Rumah Pintar Mini ([Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md)): panel kesehatan perangkat (RSSI, *uptime*, *heap* Node 1; paket per jam Node 2) dan *alert* "node diam" ke Telegram, dibaca langsung dari database TimescaleDB (Modul 17–18). Dashboard untuk penghuni rumah tetap `frontend/` (Modul 22–24). Sejak [Modul 26](../../fase-5-operasi-skala/modul-26-docker-compose/README.md), Grafana adalah layanan `grafana` di `compose.cloud.yml` (akar proyek), memakai lemari `rumahpintar-grafana-data` yang sama dengan Modul 25, dan **dirakit dari berkas** di folder ini (*provisioning*): data source, dashboard, aturan *alert*, dan *contact point* Telegram langsung ada begitu Grafana menyala, tanpa klik.

Folder ini menyimpan **resep** Grafana, bukan Grafana-nya: semua isinya boleh ikut Git karena **tidak ada rahasia** di dalamnya. Sandi admin Grafana, sandi akun database `grafana_baca`, dan token bot Telegram hanya ada di `.env` akar proyek (tidak ikut Git); berkas di sini menyebut nama variabelnya saja.

| Berkas | Isinya |
| :--- | :--- |
| [`pengguna-grafana.sql`](pengguna-grafana.sql) | akun database `grafana_baca` yang hanya bisa membaca (tanpa sandi). Sejak Modul 26 dijalankan layanan sekali-jalan `akun-grafana`, yang lalu menyamakan sandinya dengan `GRAFANA_BACA_SANDI` di `.env` |
| [`dashboards/kesehatan-sistem.json`](dashboards/kesehatan-sistem.json) | dashboard "Kesehatan Sistem", ekspor JSON **Classic** Modul 25 Praktik 9; sejak Modul 26 setiap panel menunjuk data source ber-uid tetap `rumahpintar-db` |
| [`provisioning/datasources/rumahpintar.yaml`](provisioning/datasources/rumahpintar.yaml) | data source PostgreSQL `rumahpintar-db` (host `db:5432`, database `rumahpintar`, akun `grafana_baca`, TimescaleDB, **Max open** 4); sandinya dari `$GRAFANA_BACA_SANDI` |
| [`provisioning/dashboards/rumahpintar.yaml`](provisioning/dashboards/rumahpintar.yaml) | penyedia dashboard: setiap JSON di `dashboards/` masuk folder "Rumah Pintar Mini", terkunci di layar (`allowUiUpdates: false`) |
| [`provisioning/alerting/node-diam.yaml`](provisioning/alerting/node-diam.yaml) | aturan *alert* "Node diam" (ekspor Modul 25; sampai Modul 25 tersimpan di `alerting/` sebagai arsip) |
| [`provisioning/alerting/kontak-telegram.yaml`](provisioning/alerting/kontak-telegram.yaml) | *contact point* "Telegram Rumah Pintar" (isian layar Modul 25 4.1); token dan chat_id dari `$TELEGRAM_BOT_TOKEN` dan `$TELEGRAM_CHAT_ID` |
| [`provisioning/plugins/tanpa-plugin.yaml`](provisioning/plugins/tanpa-plugin.yaml) | daftar plugin yang sengaja kosong (tanpa berkas ini, log Grafana menulis `level=error` tentang folder `plugins`) |

## Menjalankan (Docker Compose, Modul 26)

Semua perintah diketik dari **akar proyek**. Isi dulu di `.env` akar (contohnya `.env.example`): `GRAFANA_BACA_SANDI`, `GRAFANA_ADMIN_SANDI`, dan (tidak wajib) `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. Lalu:

```text
docker compose up -d
```

Urutannya diatur `compose.cloud.yml`: database sehat → `migrasi` → `akun-grafana` (membuat `grafana_baca` bila belum ada, lalu menyamakan sandinya dengan `.env`, dan berhenti sendiri) → `grafana`. `docker compose ps` menunjukkan `grafana` `(healthy)` begitu `http://127.0.0.1:3000/api/health` menjawab `"database": "ok"`.

1. Buka `http://localhost:3000`. Lemari Grafana baru (laptop baru): masuk sebagai `admin` dengan `GRAFANA_ADMIN_SANDI`. Lemari Modul 25: sandi admin **lamamu** tetap berlaku; `GRAFANA_ADMIN_SANDI` hanya dipakai Grafana saat lemarinya masih kosong.
2. **Dashboards → Rumah Pintar Mini → Kesehatan Sistem**: panel berisi data begitu ada perangkat terdaftar yang mengirim data. Dashboard ini dari berkas: **Edit → Save** menjawab `This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source.`
3. **Alerting → Alert rules**: "Node diam" (grup `kesehatan-node`) bertanda *Provisioned*. **Alerting → Contact points**: "Telegram Rumah Pintar" bertanda *Provisioned*; klik **Test** untuk mengirim pesan uji (butuh token dan chat_id asli di `.env`).
4. Kosong di `.env`, Telegram tetap tidak wajib: `compose.cloud.yml` memberi Grafana nilai pengganti `belum-diisi` dan `0`, supaya Grafana tetap menyala (*contact point* Telegram tanpa token membuat Grafana gagal menyala, jatuh bangun). *Alert* tetap dihitung dan tampil di layar; hanya kirimannya ke Telegram yang gagal.

**Pindah dari Modul 25: ambil alih ke berkas.** Lemari Modul 25 sudah berisi aturan "Node diam", *contact point* "Telegram Rumah Pintar", dan data source buatan layar. Kalau berkas *provisioning* dipasang begitu saja di atasnya, *contact point* itu berisi **dua** integrasi Telegram dan setiap *alert* terkirim **dua kali**. Karena itu, SEBELUM Grafana pertama kali menyala dengan folder `provisioning/` (Modul 26 Praktik 7), di Grafana yang masih berjalan:

1. Kalau dashboard "Kesehatan Sistem" kamu ubah sesudah ekspor Modul 25 Praktik 9, ekspor lagi (**Export → Export as JSON**, Classic), timpa `dashboards/kesehatan-sistem.json`, lalu ganti setiap uid data source di dalamnya menjadi `rumahpintar-db`.
2. **Alerting → Alert rules**: hapus aturan "Node diam".
3. **Alerting → Contact points**: hapus "Telegram Rumah Pintar".
4. **Connections → Data sources**: hapus data source lama `grafana-postgresql-datasource` (dashboard dan aturan dari berkas memakai `rumahpintar-db`). Dashboard lain buatan layar yang masih memakai data source lama, misalnya `Panel pertama` dari Kemenangan Cepat Modul 25, sesudah itu tampil merah tanpa data: hapus juga, atau ganti data source panelnya dengan `rumahpintar-db` (sesudah langkah 5) lalu **Save**.
5. `docker compose up -d`, lalu periksa langkah 2–3 di atas: Save dashboard ditolak, aturan "Node diam" *Provisioned* dan `Normal`, **Test** *contact point* sampai. Akun admin dan sandinya tetap dari lemari lama.

**Mengubah dashboard atau aturan sesudah Modul 26.** Benda dari berkas terkunci di layar: tombol **Save** dashboard ditolak (`allowUiUpdates: false`), dan aturan serta *contact point* tidak bisa diedit. Ubah lewat layar sebagai percobaan, lalu ekspor (dashboard: **Export → Export as JSON**, Classic, uid data source tetap `rumahpintar-db`; aturan: **More → Export rules group → YAML**), timpa berkas di folder ini, jalankan `docker compose restart grafana`, lalu *commit*. Dashboard dibaca ulang dari berkas setiap 30 detik; aturan, *contact point*, dan data source baru terbaca sesudah `restart`.

**Sebelum Modul 26** (tanpa Compose), Grafana dijalankan dengan `docker run -d --name rumahpintar-grafana --network rumahpintar -p 127.0.0.1:3000:3000 -e GF_PLUGINS_PREINSTALL_DISABLED=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_SNAPSHOTS_EXTERNAL_ENABLED=false -e GF_PUBLIC_DASHBOARDS_ENABLED=false -v rumahpintar-grafana-data:/var/lib/grafana --restart unless-stopped grafana/grafana:13.2.4`, akun `grafana_baca` lewat `docker cp` + `psql -f pengguna-grafana.sql` + `\password grafana_baca`, dan data source, dashboard, aturan, serta *contact point* dibuat lewat layar (Modul 25). Kontainer `rumahpintar-grafana` itu harus dihentikan dan dihapus (`docker stop`, `docker rm`; lemarinya tetap) sebelum layanan `grafana` Compose menyala: dua Grafana dengan database dan aturan yang sama = setiap *alert* terkirim dua kali.

## Lewat HTTPS di `/grafana/` (Modul 27)

Di VPS (dan Pi jalur gratis), Grafana juga dibuka lewat alamat dashboard, di bawah jalur `/grafana/`: `https://iot.namaanda.my.id/grafana/`, satu nama dan satu sertifikat dengan dashboard ([Modul 27](../../fase-5-operasi-skala/modul-27-deploy-internet-tls-pwa/README.md)). Cukup satu baris di `.env` akar: `GRAFANA_ALAMAT=https://iot.namaanda.my.id/grafana/`. `compose.cloud.yml` menjadikannya alamat Grafana (`GF_SERVER_ROOT_URL`, juga dipakai tautan di kabar *alert* Telegram) dan Grafana melayani jalur itu sendiri (`GF_SERVER_SERVE_FROM_SUB_PATH=true`); Caddy (`frontend/caddy/Caddyfile`) meneruskan `/grafana/…` ke `grafana:3000` tanpa membuang awalannya dan memberi *cookie* login Grafana atribut `Secure`. Login, dashboard, dan Grafana Live (WebSocket) terbukti jalan di lab penulis (VPS dan Let's Encrypt tiruan). `GRAFANA_ALAMAT` kosong (laptop) = Grafana tetap di `http://localhost:3000` seperti Modul 25–26; jalur `/grafana/` di dashboard laptop tidak dipakai. Loket `127.0.0.1:3000` tetap ada, juga di VPS: dari laptop lewat terowongan SSH (`ssh -L 3000:127.0.0.1:3000 rumah@<IP VPS>`, lalu `http://localhost:3000`).

Karena halaman login Grafana kini terbuka ke internet: sandi admin Grafana harus kuat (bukan sandi laptop), dan orang lain diberi akun sendiri berperan Viewer (dibuat admin Grafana), bukan sandi admin. Grafana 13.2.4 menahan tebakan sandi: di lab penulis, sesudah 6 kali salah untuk akun `admin`, sandi yang benar pun dijawab `Invalid username or password` selama ±5 menit (Grafana tidak memberi tahu bahwa akunnya sedang ditahan), lalu bisa masuk lagi.

## Keamanan

- Grafana hanya di `127.0.0.1:3000` (loket `PORT_GRAFANA` di `.env`), dengan sandi admin yang bukan `admin`. Sejak Modul 27, tamu dari internet hanya lewat Caddy HTTPS di `/grafana/` (bagian sebelumnya).
- Setelan Modul 25 dibawa persis di `compose.cloud.yml`: `GF_PLUGINS_PREINSTALL_DISABLED=true` (tanpa unduhan plugin ±290 MB) dan tiga setelan `false` yang mematikan kiriman ke luar (statistik pemakaian, *snapshot*, dashboard publik). Yang TETAP menghubungi internet: pemeriksaan versi baru Grafana dan pluginnya, umpan berita, dan gambar avatar; semuanya tanpa isi dashboard atau data rumahmu.
- Grafana membaca database dengan `grafana_baca`, **bukan** `postgres`: hanya `SELECT` pada `readings`, `readings_per_jam`, `device_health`, `events`, `commands`, dan kolom tertentu `devices` (tanpa `kunci_hash`). `users` dan `sesi` tidak bisa dibacanya; `INSERT`, `DROP`, dan semacamnya ditolak (`cannot execute … in a read-only transaction`); kueri yang lebih lama dari 10 detik dihentikan. Karena izinnya per kolom, `SELECT * FROM devices` ditolak (`permission denied for table devices`): selalu tulis nama kolomnya.
- **Token bot Telegram** kini ada di `.env` akar (dan `backend/.env` untuk mode kembang), lalu tersimpan juga di lemari Grafana sebagai isian *contact point*. Enkripsinya memakai kunci bawaan Grafana selama `GF_SECURITY_SECRET_KEY` tidak diatur: **jangan** menambahkan `GF_SECURITY_SECRET_KEY` baru di atas lemari Modul 25 (isian rahasia lama tidak terbaca lagi). Jaga `.env` dan lemari itu seperti menjaga token. `docker compose config` mencetak token dan semua sandi apa adanya: jangan menempel keluarannya ke mana pun. Token tidak pernah ada di JSON, YAML, Git, atau tangkapan layar; sebelum *commit*, cari kata `token` dan chat_id-mu di folder ini: hasilnya harus kosong.

## Batasan

- Grafana hanya menyala selama laptop (dan Docker Desktop) menyala, sama dengan backend. Sejak Modul 26 kontainernya dinyalakan lagi oleh Docker kalau berhenti sendiri (`restart: unless-stopped`); sejak Modul 27 Grafana bisa tinggal di VPS (atau Pi) yang menyala terus.
- *Alert* "node diam" membaca waktu bacaan terakhir di database. Kalau **backend** mati, tidak ada bacaan baru yang tersimpan, jadi **semua** node tampak diam sekaligus. Kalau **database** mati, aturan menjadi *Error* (`DatasourceError`) dan datang pesan tanpa nama node; di lab penulis (DB mati ±80 detik, grup 1 menit) node yang sedang 🔴 tetap 🔴, tetapi kabar "pulih" palsu pernah teramati saat aturan dievaluasi tiap 10 detik.
- Akun `grafana_baca` boleh paling banyak 5 sambungan sekaligus. Dengan `maxOpenConns: 4` di data source, satu Grafana tidak pernah melewatinya, walau dashboard dibuka di dua tab atau di laptop dan HP bersamaan; dua Grafana yang memakai akun yang sama bisa melewatinya (`too many connections for role "grafana_baca"`).
- Kalau Grafana gagal membaca database, pesan *alert* datang tanpa nama node (`🔴 [no value] ([no value]) tidak mengirim data, …`, lalu `✅  kembali mengirim data.`): itu tanda masalah database atau Grafana (misalnya uid data source yang tidak cocok), bukan node yang diam.
- Selama belum ada perangkat terdaftar (misalnya laptop teman yang baru menyalakan Compose), panel yang memakai variabel Node menulis `db query error: ERROR: syntax error at or near ")" (SQLSTATE 42601)`; hilang sendiri begitu perangkat pertama terdaftar.
- Pesan *alert* tanpa gambar panel (perender gambar Grafana tidak dipasang).
- **Saat internet rumah putus** (pusat di VPS, Modul 27), tidak ada bacaan baru yang sampai ke database VPS, jadi *alert* "node diam" bisa menyala untuk node yang sebenarnya sehat di rumah; sesudah tersambung lagi, bacaan susulan masuk dengan waktu aslinya dan *alert* pulih sendiri. Di lab penulis (VPS dan internet tiruan, internet rumah dicabut 10 menit): 🔴 Node 1 tiba ±5,5 menit sesudah bacaan terakhirnya sampai di VPS, ✅ baru tiba ±5 menit **sesudah** bacaan susulan masuk (jeda kelompok kabar), dan 🔴 Kebun (Node 2, jadwal 5 menit) sempat terkirim sesaat sesudah susulannya sendiri sudah masuk. Angka di VPS dan internet sungguhan bisa berbeda.
