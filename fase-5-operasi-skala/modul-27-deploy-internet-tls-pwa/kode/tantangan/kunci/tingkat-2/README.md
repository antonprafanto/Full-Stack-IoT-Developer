# Kunci Tantangan 2 Modul 27: pintu admin lewat terowongan SSH

**Tugas (isi rumpang):** di VPS, loket backend (8080), database (5432), dan Grafana (3000) sengaja hanya `127.0.0.1`: tidak bisa
diketuk dari internet. Kamu tetap ingin memakai Swagger (`/docs`), DBeaver, dan Grafana dari laptop. Isi bagian `____` supaya ketiganya
lewat **terowongan SSH**: SSH membuka loket di laptopmu dan meneruskan setiap ketukan, terenkripsi, ke loket `127.0.0.1` di VPS. Tidak ada
pintu baru di VPS, dan ufw tidak perlu diubah.

> [!NOTE]
> Perintah di kunci ini adalah fitur standar OpenSSH (`ssh -L`). Penulis belum menjalankannya ke VPS sungguhan; uji dengan server SSH
> tiruan di mesin penulis menyusul di rekaman akhir modul. `rumah` = pengguna biasa di VPS (Praktik 5), `<IP-VPS>` = alamat VPS-mu.

## Soal dan jawabannya

| Soal | Jawaban |
| :--- | :--- |
| Swagger: `ssh -L ____:127.0.0.1:____ rumah@<IP-VPS>`, lalu buka `http://localhost:____/docs` | `ssh -L 8080:127.0.0.1:8080 rumah@<IP-VPS>`, lalu `http://localhost:8080/docs` |
| DBeaver: `ssh -L ____:127.0.0.1:5432 rumah@<IP-VPS>`, lalu DBeaver ke **Host** `localhost`, **Port** `____` | `ssh -L 15432:127.0.0.1:5432 rumah@<IP-VPS>`, lalu **Host** `localhost`, **Port** `15432` |
| Ketiganya sekaligus dalam SATU perintah | `ssh -L 8080:127.0.0.1:8080 -L 15432:127.0.0.1:5432 -L 3000:127.0.0.1:3000 rumah@<IP-VPS>` |
| Hanya terowongan, tanpa membuka terminal VPS | tambahkan `-N`: `ssh -N -L 8080:127.0.0.1:8080 rumah@<IP-VPS>` (berhenti dengan **Ctrl + C**) |

Cara membaca `-L 15432:127.0.0.1:5432`: **loket di laptop** `15432` → (terowongan SSH) → dari sisi VPS, ketuk `127.0.0.1:5432`. Angka
kiri boleh kamu pilih sendiri (selama belum dipakai di laptop); angka kanan adalah loket di VPS (`ports:` di `compose.cloud.yml`).
`127.0.0.1` di bagian tengah dibaca DARI VPS, jadi artinya "VPS itu sendiri", bukan laptopmu.

## Kenapa angkanya begitu

- **Swagger wajib `8080` di kiri, dan dibuka lewat `localhost`.** Satpam backend hanya menerima *login* dari halaman yang terdaftar:
  daftar `CORS_ORIGIN` (di VPS hanya `https://iot.namaanda.my.id`) ditambah halaman backend sendiri, `http://localhost:8080`. Dengan
  `-L 18080:…`, halaman Swagger menjadi `http://localhost:18080` dan tombol **Execute** untuk `POST /auth/login` dijawab `403
  permintaan dari halaman http://localhost:18080 ditolak`. `http://127.0.0.1:8080/docs` juga ditolak (sama seperti Modul 26). Jadi
  hentikan dulu backend laptop yang memakai 8080 (memang harus mati: satu backend per token bot, Praktik 7).
- **Database memakai `15432`, bukan `5432`,** supaya tidak bentrok dengan database laptop yang mungkin masih menyala di `5432`. DBeaver
  tidak punya pemeriksaan asal halaman, jadi angka kiri bebas. *Login* dengan akun hanya-baca `grafana_baca` untuk melihat-lihat; akun
  `postgres` hanya bila memang perlu mengubah.
- **Grafana (`3000`)** hanya perlu terowongan bila kamu TIDAK membukanya di `https://iot…/grafana/` (Praktik 7; `GRAFANA_ALAMAT`
  kosong di `.env` VPS): lalu `http://localhost:3000`. Kalau Grafana sudah di `/grafana/`, pakai saja alamat HTTPS-nya; terowongan ke
  Grafana yang dipasang di subjalur belum dicoba penulis.

## Aman?

Terowongan hanya bisa dibuat oleh orang yang bisa *login* SSH ke VPS (kunci ed25519 Praktik 5, tanpa sandi). Loket di laptop dibuka SSH
di `127.0.0.1` saja (bawaan OpenSSH), jadi orang lain di WiFi kafe tidak ikut masuk lewat laptopmu. Tutup terowongan sesudah selesai
(**Ctrl + C** atau `exit`).
