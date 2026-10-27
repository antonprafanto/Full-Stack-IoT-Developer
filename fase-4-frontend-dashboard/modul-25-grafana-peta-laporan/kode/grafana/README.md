# Grafana Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../en/mini-smart-home/grafana/README.md)

Grafana adalah dashboard **tim teknis** Rumah Pintar Mini ([Modul 25](../../README.md)): panel kesehatan perangkat (RSSI, *uptime*, *heap* Node 1; paket per jam Node 2) dan *alert* "node diam" ke Telegram, dibaca langsung dari database TimescaleDB (Modul 17–18). Dashboard untuk penghuni rumah tetap `frontend/` (Modul 22–24). Grafana berjalan di laptop sebagai kontainer Docker, di samping kontainer database `rumahpintar-db`.

Folder ini menyimpan **resep** Grafana, bukan Grafana-nya: semua isinya boleh ikut Git karena **tidak ada rahasia** di dalamnya. Sandi admin Grafana, sandi akun database `grafana_baca`, dan token bot Telegram tidak pernah ditulis di sini.

| Berkas | Isinya |
| :--- | :--- |
| [`pengguna-grafana.sql`](pengguna-grafana.sql) | akun database `grafana_baca` yang hanya bisa membaca (tanpa sandi; sandinya diketik dengan `\password`) |
| [`dashboards/kesehatan-sistem.json`](dashboards/kesehatan-sistem.json) | dashboard "Kesehatan Sistem", diekspor dari Grafana sebagai JSON **Classic** (Modul 25 Praktik 9) |
| [`alerting/node-diam.yaml`](alerting/node-diam.yaml) | aturan *alert* "node diam", diekspor dari Grafana (tanpa *contact point*: token bot tidak pernah diekspor) |

## Menjalankan

Perintah di bawah dijalankan dari folder proyek `rumah-pintar-mini` dan tidak memakai fitur khusus satu *shell* (tanpa `<`, `>`, atau `$(…)`), jadi diketik apa adanya di PowerShell (Windows), Terminal macOS, maupun Linux. Kontainer database `rumahpintar-db` (Modul 17) harus sudah berjalan.

1. **Lorong antarkontainer** (*network*): Grafana di dalam kontainer tidak bisa memakai `localhost:5432` (itu kontainer Grafana sendiri), jadi kedua kontainer dipertemukan di satu *network* buatan bernama `rumahpintar`. Cukup sekali:

   ```text
   docker network create rumahpintar
   ```

   ```text
   docker network connect rumahpintar rumahpintar-db
   ```

2. **Grafana** (satu baris; unduh dulu `docker pull grafana/grafana:13.2.4`, sekitar 445 MB untuk arm64):

   ```text
   docker run -d --name rumahpintar-grafana --network rumahpintar -p 127.0.0.1:3000:3000 -e GF_PLUGINS_PREINSTALL_DISABLED=true -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_SNAPSHOTS_EXTERNAL_ENABLED=false -e GF_PUBLIC_DASHBOARDS_ENABLED=false -v rumahpintar-grafana-data:/var/lib/grafana --restart unless-stopped grafana/grafana:13.2.4
   ```

   `127.0.0.1:3000` = hanya bisa dibuka dari laptop ini. `GF_PLUGINS_PREINSTALL_DISABLED=true` mencegah unduhan plugin sekitar 290 MB saat Grafana pertama menyala; tiga setelan `false` berikutnya mematikan kiriman ke luar (statistik pemakaian ke stats.grafana.org, *snapshot* ke server Grafana, dan dashboard publik). Yang TETAP menghubungi internet: pemeriksaan versi baru Grafana dan pluginnya ke grafana.com, umpan berita, dan gambar avatar (Gravatar); semuanya tanpa isi dashboard atau data rumahmu. Kalau ingin pemeriksaan versi ikut mati, tambahkan `-e GF_ANALYTICS_CHECK_FOR_UPDATES=false -e GF_ANALYTICS_CHECK_FOR_PLUGIN_UPDATES=false` sebelum `-v`. Semua isi Grafana (dashboard, *alert*, akun) tersimpan di volume `rumahpintar-grafana-data`, jadi tetap ada walaupun kontainernya dibuat ulang. Tulis versinya persis (`13.2.4`): image `grafana/grafana-oss` sudah tidak diperbarui, dan tanpa tag kamu mendapat versi lain yang menunya bisa berbeda.
3. Buka `http://localhost:3000`, masuk dengan `admin` / `admin`, lalu di layar **Update your password** ketik sandi baru dan klik **Submit** (jangan **Skip**: sandi `admin` tetap berlaku kalau dilewati).
4. **Akun database hanya-baca** (sekali saja). Salin berkas SQL ke kontainer database, jalankan, lalu ketik sandi `grafana_baca` dua kali (tidak tampil di layar dan tidak masuk riwayat terminal):

   ```text
   docker cp grafana/pengguna-grafana.sql rumahpintar-db:/tmp/pengguna-grafana.sql
   ```

   ```text
   docker exec rumahpintar-db psql -U postgres -d rumahpintar -f /tmp/pengguna-grafana.sql
   ```

   ```text
   docker exec -it rumahpintar-db psql -U postgres -d rumahpintar -c "\password grafana_baca"
   ```

   Kalau perintah kedua diulang (misalnya berkasnya dijalankan dua kali), baris pertamanya menjawab `ERROR:  role "grafana_baca" already exists`: itu wajar, baris-baris lainnya tetap berlaku.

5. **Data source** di Grafana: **Connections → Data sources → Add data source → PostgreSQL**, Host URL `rumahpintar-db:5432` (nama kontainer, lewat lorong `rumahpintar`), Database name `rumahpintar`, Username `grafana_baca` dan sandinya, TLS/SSL Mode `disable`, **TimescaleDB** dinyalakan, **Max open** (bagian **Connection limits**) diisi `4`, lalu **Save & test** sampai muncul **Database Connection OK**. Angka 4 itu penting: akun `grafana_baca` boleh paling banyak 5 sambungan, sedangkan Grafana tanpa angka ini boleh membuka sampai 100; dengan 4, Grafana mengantre sendiri dan masih tersisa satu sambungan untuk psql. Kalau angka itu baru diubah pada data source yang sedang dipakai dashboard, **Save & test** pertama bisa menjawab `too many connections for role "grafana_baca"` (sambungan lama belum dilepas): tunggu beberapa detik lalu klik **Save & test** lagi.
6. Dashboard dan aturan *alert* dibuat lewat layar Grafana (Modul 25 Praktik 2–4), lalu diekspor ke folder `dashboards/` dan `alerting/` di sini. Untuk memulihkannya di Grafana lain, impor JSON dashboard (**Dashboards → New → Import dashboard**) dan pilih data source PostgreSQL-mu saat ditanya; di Grafana yang sama, klik **Change uid** dulu supaya dashboard lama tidak tertimpa. *Contact point* Telegram (token bot + chat_id Modul 19) dan aturan *alert* **dibuat ulang** lewat layar: berkas YAML di `alerting/` adalah arsip, karena menu **Import alert rules** Grafana 13.2.4 hanya menerima aturan format Prometheus. Memasang YAML itu sebagai berkas *provisioning* baru dibahas di Modul 26 (Grafana menolak menyala kalau *contact point* bernama sama belum ada: `receiver Telegram Rumah Pintar does not exist`).

## Keamanan

- Grafana hanya di `127.0.0.1:3000`, dengan sandi `admin` yang sudah diganti saat masuk pertama kali.
- Grafana membaca database dengan `grafana_baca`, **bukan** `postgres`: hanya `SELECT` pada `readings`, `readings_per_jam`, `device_health`, `events`, `commands`, dan kolom tertentu `devices` (tanpa `kunci_hash`). `users` dan `sesi` (sidik jari sandi, token sesi) tidak bisa dibacanya; `INSERT`, `DROP`, dan semacamnya ditolak (`cannot execute … in a read-only transaction`); kueri yang lebih lama dari 10 detik dihentikan. Karena izinnya per kolom, `SELECT * FROM devices` ditolak (`permission denied for table devices`): selalu tulis nama kolomnya.
- Token bot hanya ada di `backend/.env` dan di *contact point* Grafana (tersimpan di volume Grafana; enkripsinya memakai kunci bawaan yang sama di semua instalasi selama `GF_SECURITY_SECRET_KEY` tidak diatur, jadi jaga volume itu seperti menjaga token), tidak pernah di JSON, YAML, Git, atau tangkapan layar. Sebelum *commit*, cari kata `token` dan chat_id-mu di berkas ekspor: hasilnya harus kosong.

## Batasan

- Grafana hanya menyala selama laptop menyala (sama dengan backend). Server yang menyala terus menyusul di Modul 26–27.
- *Alert* "node diam" membaca waktu bacaan terakhir di database. Kalau **backend** mati, tidak ada bacaan baru yang tersimpan, jadi **semua** node tampak diam sekaligus. Kalau **database** mati, aturan menjadi *Error* (`DatasourceError`) dan datang pesan tanpa nama node; di lab penulis (DB mati ±80 detik, grup 1 menit) node yang sedang 🔴 tetap 🔴, tetapi kabar "pulih" palsu pernah teramati saat aturan dievaluasi tiap 10 detik.
- Akun `grafana_baca` boleh paling banyak 5 sambungan sekaligus. Dengan **Max open** `4` di data source (langkah 5), satu Grafana tidak pernah melewatinya, walau dashboard dibuka di dua tab atau di laptop dan HP bersamaan. Tanpa itu (bawaan 100), dua tab yang memuat dashboard bersamaan sudah bisa membuat sebagian panel merah atau kosong dengan galat `too many connections for role "grafana_baca"`; dua Grafana yang memakai akun yang sama juga.
- Kalau Grafana gagal membaca database, pesan *alert* datang tanpa nama node (`🔴 [no value] ([no value]) tidak mengirim data, …`, lalu `✅  kembali mengirim data.`): itu tanda masalah database atau Grafana, bukan node yang diam.
- Pesan *alert* tanpa gambar panel (perender gambar Grafana tidak dipasang).
