# Frontend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../en/mini-smart-home/frontend/README.md)

Dashboard v1.3 proyek Rumah Pintar Mini: halaman web React 19 + TypeScript dengan Tailwind CSS v4, dibuat dengan Vite 8 (templat `react-ts` dari create-vite 9.3.1). Setiap layar punya alamat sendiri (React Router v8, mode deklaratif), dan layar di balik *login* dijaga rute terproteksi. Dashboard menampilkan data *live* dari backend lewat Socket.IO (daftar perangkat, detail dengan grafik 5 menit dan gauge, riwayat 1 jam / 24 jam / 7 hari dengan tabel dan CSV), dan sejak Modul 24 juga **mengendalikan** perangkat: akun admin menyalakan lampu dan kipas dengan status "Menunggu konfirmasi perangkat…", menyiram dengan pompa, serta membuat, mengubah, menonaktifkan, dan menghapus aturan otomatis lewat formulir yang diperiksa skema Zod yang sama dengan backend. Akun viewer melihat semua data tanpa tombol kendali. Kejadian penting (aturan bertindak, perangkat terputus) muncul sebagai *toast*. Sejak Modul 25 (v1.1) ada layar **Peta**: setiap perangkat yang punya titik (`lat`, `lng` dari backend 1.2) tampil sebagai lingkaran hijau/abu-abu di atas peta OpenStreetMap, berwarna menurut status *live*-nya. Tampilannya dirancang rapi di HP dan laptop, mengikuti mode gelap sistem, dan bisa dibuka dari HP di WiFi rumah (lihat "Batasan v1.3"). Dengan v1.1, dashboard Fase 4 lengkap: data *live* (Modul 23), kendali dan peran (Modul 24), dan peta perangkat (Modul 25, 🎉 Checkpoint Fase 4). Dashboard teknis Grafana BUKAN bagian folder ini: ia tinggal di kontainernya sendiri, dengan berkasnya di folder `grafana/` proyek.

**v1.2 (Modul 26)** mengemas dashboard sebagai **image Docker** (layanan `web` di `compose.cloud.yml`, akar proyek): Node.js hanya dipakai saat membangun, lalu **Caddy** menyajikan isi `dist/` di `http://localhost` dan meneruskan setiap alamat `/api/…` ke backend, jadi halaman dan API berada di satu alamat. Kode dashboard hanya berubah tiga baris di `src/soket.ts` (sambungan *live* lewat jalur `/api/socket.io/`), dan `npm run dev` tetap jalan seperti sebelumnya. Rinciannya di [Menjalankan dengan Docker Compose](#menjalankan-dengan-docker-compose-modul-26) dan [Catatan versi 1.2](#catatan-versi-12).

**v1.3 (Modul 27)** menjadikan dashboard **aplikasi yang bisa dipasang** (PWA, *Progressive Web App*) di HP dan laptop: satu paket pengembang baru, `vite-plugin-pwa` 2.0.0, menulis *manifest* (nama, ikon, warna aplikasi) dan *service worker* (petugas kecil di browser yang menyimpan cangkang dashboard) saat `npm run build`. Ikon tab kini gambar rumah (bukan lagi logo Vite), dan ada ikon aplikasi 192 dan 512 px. Data rumah tidak pernah disimpan: angka tetap diminta ke server, dan saat internet putus aplikasi terpasang tetap terbuka dengan pesan "Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi." Pemasangannya butuh alamat aman, `https://` (VPS atau jalur gratis Modul 27) atau `http://localhost`. Rinciannya di [Aplikasi di HP (PWA, Modul 27)](#aplikasi-di-hp-pwa-modul-27) dan [Catatan versi 1.3](#catatan-versi-13).

## Menjalankan dengan Docker Compose (Modul 26)

Cara sehari-hari ("mode rumah"): dashboard menyala bersama seluruh rumah, tanpa Node.js dan tanpa `npm install` di laptop. Semua perintah diketik dari **akar proyek** (folder yang berisi `compose.cloud.yml`). Langkah lengkapnya ada di [Modul 26](../../../modul-26-docker-compose/README.md).

1. Nyalakan seluruh rumah seperti di `backend/README.md` bagian "Menjalankan dengan Docker Compose" (`.env` akar, lalu `docker compose up -d`). Layanan `web` baru dinyalakan sesudah backend `(healthy)`.
2. Buka **`http://localhost`** di Chrome atau Edge (tanpa nomor port: loket 80). Kalau port 80 di laptopmu sudah dipakai program lain, ganti `PORT_WEB` di `.env` akar (misalnya `8081`), tulis alamat yang sama di `CORS_ORIGIN` di `.env` itu (`http://localhost:8081,http://127.0.0.1:8081`), jalankan `docker compose up -d` lagi, lalu buka `http://localhost:8081`. Tanpa `CORS_ORIGIN` yang cocok, tombol **Masuk** dijawab `403 permintaan dari halaman http://localhost:8081 ditolak`.
3. Masuk dengan akunmu. Akun Modul 20 ada di lemari database, jadi tetap berlaku; di laptop baru, buat akun pertama dengan `docker compose exec backend …` (lihat `backend/README.md`).

| Perintah (dari akar proyek) | Gunanya |
| :--- | :--- |
| `docker compose ps` | `web` harus `Up`. Kolom PORTS juga menulis `443/tcp, 2019/tcp, 443/udp`: itu hanya catatan bawaan image Caddy; yang benar-benar dibuka ke laptop hanya `127.0.0.1:80->80/tcp` |
| `docker compose logs web` | log Caddy (format JSON). Empat baris `"level":"warn"` saat menyala itu wajar di Modul 26: `admin endpoint disabled`, `server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server`, `HTTP/2 skipped because it requires TLS`, dan `HTTP/3 skipped because it requires TLS`. Itu juga wajar di laptop sejak Modul 27 (`DOMAIN_WEB` kosong = HTTP saja); di VPS, Caddy menulis log sertifikatnya sendiri (lihat Modul 27) |
| `docker compose build web` lalu `docker compose up -d web` | membangun ulang image sesudah kode dashboard berubah (tag = `version` di `package.json`). Di Raspberry Pi 5 penulis (v1.3, dengan paket PWA): ±127 detik dari awal (`npm ci` ±67 detik + `npm run build` ±55 detik), ±60 detik bila daftar library tidak berubah (hanya `npm run build` yang diulang). Sebelum v1.3: ±103 detik dari awal |
| `docker compose restart web` | membaca ulang `caddy/Caddyfile` sesudah kamu mengubahnya (±1 detik) |

**Cara kerjanya.**

- **Dua tahap** ([`Dockerfile`](Dockerfile)). Tahap `bangun` (`node:24.22.1-alpine3.24`) menjalankan `npm ci` lalu `npm run build`. Tahap akhir (`caddy:2.11.7-alpine`) hanya membawa isi `dist/` (di `/srv`) dan `Caddyfile`: tanpa Node.js, tanpa `node_modules`, tanpa kode sumber. Image buatan penulis (Raspberry Pi 5, arm64) berukuran **90,4 MB** di disk dan **24 MB** terkompres (yang diunduh dari toko image). [`.dockerignore`](.dockerignore) menahan `node_modules`, `dist`, dan `.env.local` milik laptopmu.
- **Alamat API dibakar saat build.** Baris `ARG VITE_API_BASE=/api` di `Dockerfile` (diisi `args` di `compose.cloud.yml`) membuat Vite menulis teks `/api` langsung ke JavaScript, menggantikan alamat bawaan "nama host halaman + `:8080`". Mengubahnya berarti membangun ulang image; `.env.local` tidak pernah dibaca image.
- **Satu alamat untuk halaman dan API.** Caddy ([`caddy/Caddyfile`](caddy/Caddyfile)) meneruskan setiap alamat berawalan `/api` ke backend dan membuang awalannya: `http://localhost/api/devices` → `backend:8080/devices`. `backend` adalah nama layanan di lorong Compose. Karena halaman dan API sama-sama `http://localhost`, browser tidak perlu izin CORS lintas port, dan *cookie* `SameSite=Strict` ikut terkirim.
- **Sambungan *live*.** Socket.IO membaca `io("/api")` sebagai *namespace* (nama ruang di dalam server), bukan jalur, sehingga lencana tidak pernah **Live** (`connect_error: server error`). Karena itu `src/soket.ts` sejak v1.2: kalau `BASE` diawali `/` (atau kosong), jalurnya diberikan lewat opsi `path` (`/api/socket.io`). Di mode kembang `BASE` berisi alamat lengkap (`http://localhost:8080`), jadi cara lama tetap dipakai.
- **Jalur *cookie* `sesi`.** Backend memasang *cookie* `sesi` (kartu terusan 7 hari) berjalur `/auth`, padahal dari browser alamatnya `/api/auth`. Baris `header_down Set-Cookie "Path=/auth" "Path=/api/auth"` di Caddyfile mengganti jalurnya; tanpa itu kamu terlempar ke layar **Masuk** setiap 15 menit (*refresh* dijawab `401 belum login: cookie sesi tidak ada`). Backend sendiri tidak berubah.
- **Semua alamat layar dijawab `index.html`** (*SPA fallback*, janji Modul 24): `try_files {path} /index.html`. F5 di `/peta` atau `/perangkat/f00d00000001` tetap membuka layarnya. Berkas JavaScript dan CSS di `/assets/…` tidak ikut aturan itu: berkas yang tidak ada (misalnya `/assets/lama.js`) dijawab `404`, bukan halaman `index.html`.
- **Dashboard baru cepat terpakai.** Halaman `index.html` dikirim dengan `Cache-Control: no-cache`: browser selalu bertanya dulu ke Caddy sebelum memakai salinan simpanannya (Caddy menjawab `304` bila belum berubah). Sejak v1.3 aturan yang sama berlaku untuk `sw.js` dan `manifest.webmanifest`, jadi browser cepat tahu ada versi baru; tetapi karena *service worker* menyajikan cangkang dari simpanannya, versi baru baru tampil pada **pembukaan berikutnya** sesudah browser selesai mengambilnya di belakang layar (lihat "Aplikasi di HP"). Berkas `/assets/…` boleh disimpan lama oleh browser, karena namanya bersidik dan berganti setiap *build*.
- **Caddyfile dari repo.** Compose memasang folder `frontend/caddy/` ke `/etc/caddy` (hanya-baca); salinan di dalam image hanya dipakai kalau image dijalankan sendirian. Caddy membaca berkas itu saat menyala saja (`admin off`), jadi sesudah mengubahnya: `docker compose restart web`.
- **HTTP di laptop, HTTPS di internet (Modul 27).** Alamat situs di Caddyfile adalah `{$DOMAIN_WEB::80}`: bila `DOMAIN_WEB` di `.env` akar kosong (laptop, Pi jalur gratis), Caddy melayani HTTP biasa di port 80 untuk nama apa pun yang diketik, persis Modul 26. Di VPS, `DOMAIN_WEB=iot.namaanda.my.id`: Caddy meminta sertifikat Let's Encrypt sendiri, melayani HTTPS, dan mengalihkan `http://` ke `https://`. Alamat broker (`DOMAIN_MQTT`) dijawab `404` "Alamat ini untuk broker MQTT (port 8883), bukan dashboard.", dan `/grafana/` diteruskan ke Grafana bila `GRAFANA_ALAMAT` diisi (lihat `grafana/README.md`). Langkahnya ada di [Modul 27](../../README.md).
- **Backend mati?** Halaman tetap terbuka (Caddy yang menyajikannya), tetapi setiap permintaan `/api` dijawab `502` tanpa isi: layar **Masuk** menulis `Terjadi gangguan (502).`, dan dashboard yang sudah terbuka menampilkan lencana **Menyambung ulang…** sampai backend kembali. `docker compose logs web` menulis sebabnya, misalnya `dial tcp: lookup backend on 127.0.0.11:53: server misbehaving` (layanan `backend` dihentikan) atau `connect: connection refused` (backend sedang menyala). Periksa `docker compose ps` dan `docker compose logs backend`.
- **Dokumentasi API** tetap di loket backend, `http://localhost:8080/docs` (lihat `backend/README.md`). `http://localhost/api/docs` tidak bisa dipakai di balik Caddy: aset halamannya salah alamat, dan tombol **Try it out** memanggil API tanpa awalan `/api`.

**Mencoba image ini sendirian** (tanpa Compose, dari folder `frontend`, tanpa folder `backend`): `docker build -t rumah-pintar-mini-web:1.3.0 .`, lalu `docker run -d --rm --name coba-web -p 127.0.0.1:8088:80 rumah-pintar-mini-web:1.3.0`. `http://localhost:8088/` dan `http://localhost:8088/peta` menjawab halaman dashboard (200), sedangkan `http://localhost:8088/api/health` menjawab `502`, karena di luar Compose tidak ada layanan bernama `backend`. Hentikan dengan `docker stop coba-web`.

## Mode kembang (Vite, `npm run dev`)

Untuk mengubah kode dashboard: Vite memperbarui halaman setiap kali berkas disimpan (HMR), tanpa membangun image. Dashboard di mode ini memanggil backend **mode kembang** (`npm run dev` di folder `backend`; lihat `backend/README.md` bagian "Mode kembang"), karena `CORS_ORIGIN` backend kontainer hanya mengizinkan `http://localhost`. Hanya satu backend yang boleh menyala: dari akar proyek, `docker compose stop backend web` dulu; selesai mengembangkan, **Ctrl + C** di kedua terminal `npm run dev`, lalu `docker compose start backend web`.

1. Pasang Node.js 24 LTS (Vite 8 butuh minimal Node.js 20.19 atau 22.12; React Router 8 butuh Node.js 22.22 atau lebih baru).
2. Nyalakan **backend** mode kembang seperti di `backend/README.md` (database `db` dan broker pusat `mosquitto` dari Compose tetap menyala, lalu `npm run dev` di folder `backend`; sebelum Modul 26: kontainer `rumahpintar-db` di Docker Desktop dan broker MQTT) beserta sumber datanya: Node 1 dan Node 2 (Kit A + B), atau simulator perangkat di folder `alat` dengan perangkat latihan `f00d00000001` yang sudah terdaftar. Layar **Peta** butuh backend 1.2 atau lebih baru (backend 1.1 tidak mengirim `lat`/`lng`; layar Peta lalu menulis "Backend belum mengirim titik peta (lat, lng). Halaman Peta butuh backend 1.2 (Modul 25)."), dan minimal backend 1.1 untuk layar lain: aturan "turun di bawah" (misalnya siram jika tanah < 30 %) dan tombol **Hapus aturan** tidak ada di backend v1.0. `CORS_ORIGIN` di `backend/.env` harus memuat `http://localhost:5173` (nilai bawaannya sudah memuatnya).
3. Di folder ini, jalankan `npm install`.
4. Jalankan `npm run dev`, lalu buka **`http://localhost:5173`** di Chrome atau Edge. Pakai `localhost`, bukan `127.0.0.1`: di Windows, Vite hanya mendengar di `localhost`, dan nama host halaman harus sama dengan nama host API supaya *cookie* login ikut terkirim.
5. Masuk dengan akun yang dibuat di Modul 20: `admin@rumah.test` (melihat dan mengendalikan) atau `viewer@rumah.test` (hanya melihat). Sandinya milikmu sendiri; dashboard tidak pernah menyimpannya.

Riwayat 7 hari butuh data 7 hari. Kalau grafik "7 hari" hanya berisi beberapa titik, isi data latihan di folder `backend` dengan `npm run isi-riwayat`, lalu ringkas ulang buku ringkasan per jam (dari akar proyek; sebelum Modul 26 perintahnya `docker exec rumahpintar-db psql …`):

```
docker compose exec db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
```

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | *dev server* di `http://localhost:5173` yang memperbarui halaman setiap kali kode disimpan (HMR). Portnya dikunci (`strictPort`): kalau 5173 sedang terpakai, Vite berhenti dengan galat, tidak pindah diam-diam ke 5174 |
| `npm run dev:hp` | sama dengan `npm run dev`, tetapi juga bisa dibuka perangkat lain di WiFi rumah (`vite --host`). Hanya untuk "mode HP", lihat di bawah |
| `npm run build` | memeriksa tipe TypeScript (`tsc -b`), lalu membuat versi siap pakai di folder `dist/`. Satu peringatan kuning `Some chunks are larger than 500 kB after minification` itu normal sejak Modul 23 (pustaka grafik Recharts membuat berkas JavaScript-nya besar; sejak Modul 25 Leaflet menambah sekitar 157 kB, atau 46 kB sesudah dikompres gzip); build tetap berhasil. Sejak v1.3 keluarannya ditutup bagian `PWA v2.0.0`, `mode generateSW`, `precache 10 entries (…KiB)`, dan `files generated` `dist/sw.js` + `dist/workbox-….js` |
| `npm run preview` | menyajikan isi `dist/` di `http://localhost:5173` untuk dicoba (hentikan `npm run dev` dulu). Untuk HP: `npm run preview -- --host`. Bukan server sungguhan: sejak Modul 26, `dist/` disajikan Caddy di image web. **Sejak v1.3:** preview memasang *service worker* di `http://localhost:5173`, dan `npm run dev` sesudahnya di alamat yang sama tetap menampilkan hasil build LAMA dari simpanannya. Sebelum kembali ke `npm run dev`, buka DevTools → **Application** → **Storage** → **Clear site data** (lihat "Aplikasi di HP") |
| `npm run lint` | memeriksa kode dengan oxlint; bersih = tidak ada peringatan atau galat yang dicetak |
| `npm run cek-skema` | memeriksa bahwa salinan skema di `src/skema/` sama persis dengan aslinya di `../backend/src/schemas/` (lihat "Salinan skema"). Hasil yang benar: dua baris `SAMA` |

Paket yang ditambahkan di Modul 24 dipasang dengan versi tertulis: `npm install react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7`. Perintah tanpa versi bisa gagal (`npm error code ERESOLVE`, karena `@hookform/resolvers` 6.0.0); jangan memakai `--legacy-peer-deps`.

Paket PWA (Modul 27) adalah paket **pengembang** (`-D`, hanya dipakai saat build) dengan versi persis: `npm install -D -E vite-plugin-pwa@2.0.0`. Ia menarik sekitar 300 paket pembantu (Workbox, Babel), jadi `node_modules` membesar dari ±245 MB menjadi ±321 MB; isi `dist/` hanya bertambah ±16 kB. Sesudah pemasangan, npm menulis `4 low severity vulnerabilities`: semuanya satu temuan di `deepmerge` (dipakai alat build Workbox, berjalan di laptopmu saat `npm run build`, tidak ikut ke browser), dan per Oktober 2026 belum ada versi perbaikannya. `npm audit --omit=dev` (paket yang ikut ke browser) menulis `found 0 vulnerabilities`. **Jangan** menjalankan `npm audit fix --force`: perintah itu "memperbaiki" dengan memasang `vite-plugin-pwa` 0.2.1 yang kuno dan merusak build.

Paket peta (Modul 25) juga dipasang dengan versi tertulis: `npm install leaflet@1.9.4 react-leaflet@5.0.0`, lalu `npm install -D @types/leaflet@1.9.22`. Jangan menyalin perintah dari halaman pemasangan react-leaflet (`react@rc`, `react-leaflet@next`): per Oktober 2026 perintah itu memasang versi uji lama (React 19.0.0-rc.1, react-leaflet 5.0.0-rc.2).

## Peta rute

Semua alamat ada di satu tempat: `<Routes>` di `src/App.tsx`. Alamat halaman sengaja berbahasa Indonesia supaya tidak tertukar dengan alamat API backend (`/auth`, `/devices`, `/rules`). `npm run dev` dan `npm run preview` menyajikan `index.html` untuk alamat mana pun, jadi **F5** dan tautan langsung ke `/perangkat/f00d00000001` tetap jalan. Sejak Modul 26, Caddy di image web memakai aturan yang sama (`try_files {path} /index.html` di `caddy/Caddyfile`).

| Alamat | Layar | Siapa |
| :--- | :--- | :--- |
| `/masuk` | formulir masuk (react-hook-form + Zod) | tamu; yang sudah masuk langsung dipindah ke layar tujuannya |
| `/` | dialihkan ke `/perangkat` | yang sudah masuk |
| `/perangkat` | daftar perangkat *live* | admin & viewer |
| `/perangkat/:id` | detail, grafik 5 menit, gauge; bagian **Kendali** hanya untuk admin | admin & viewer |
| `/perangkat/:id/riwayat` | riwayat, tabel, **Unduh CSV** | admin & viewer |
| `/peta` | peta perangkat (Modul 25): lingkaran hijau/abu-abu menurut status *live*, popup + tautan ke detail | admin & viewer |
| `/aturan` | daftar aturan otomatis dalam kalimat biasa; tombol **+ Aturan baru** dan **Ubah** hanya untuk admin | admin & viewer |
| `/aturan/baru`, `/aturan/:id` | formulir aturan (buat, ubah, nonaktifkan, hapus) | admin; viewer melihat layar "Khusus admin" |
| alamat lain | "Halaman tidak ditemukan" + tautan ke daftar perangkat | semua |

Layar yang dibuka tanpa *login* (misalnya tautan `/perangkat/f00d00000001/riwayat` di jendela privat) dipindah ke `/masuk`; sesudah masuk, dashboard kembali ke layar tadi. Sesudah tombol **Keluar**, orang berikutnya selalu mulai dari `/perangkat`.

## Peta perangkat (Modul 25)

- **Sumber titiknya** kolom `lat` (lintang) dan `lng` (bujur) di tabel `devices`, yang dikirim backend 1.2 di `GET /devices`. Titik diatur **admin** lewat API, bukan ditulis di kode frontend: Bruno `atur lokasi perangkat` (`PUT /devices/:id/lokasi` dengan `{ "lat": -6.1754, "lng": 106.8272 }`; angka bertitik desimal, `null` + `null` menghapus titik). Akun viewer dijawab 403.
- **Kapan titik baru tampil?** Layar Peta mengambil ulang `GET /devices` setiap kali dibuka. Titik yang diubah lewat Bruno tampil sesudah kamu membuka menu **Peta** lagi (dari layar lain), tanpa F5. Selama layar Peta terbuka, titik tidak bergerak sendiri: perubahan titik tidak dikirim lewat Socket.IO. Kalau pengambilan ulang itu gagal (misalnya database mati sesaat), peta tetap memakai daftar yang sudah ada dan *toast* menulis "Daftar perangkat gagal dimuat ulang: titik di peta mungkin belum yang terbaru."; layar lain tidak ikut terganggu.
- **Warna** ikut status *live* di toko (acara Socket.IO, tanpa *polling*): hijau = `online`; abu-abu = offline, mode offline, belum diketahui, atau kunci dicabut / belum terdaftar (kirimannya diabaikan backend). Warna selalu ditemani kata: keterangan di bawah peta dan lencana status di popup. Ingat, "online" adalah status MQTT terakhir: Node 2 (Kebun) yang diam tetap hijau sampai statusnya `offline` terbit (16 menit sesudah paket terakhirnya), dan tetap hijau selama Node 1 penghubungnya ikut mati (status Node 2 diterbitkan oleh Node 1). Jadi "terakhir dilihat" di popup tetap perlu dibaca, dan untuk "data berhenti datang" andalkan *alert* "node diam" di Grafana.
- **Popup** (ketuk lingkaran): nama, lokasi, `device_id`, status, "terakhir dilihat", dan tautan **Buka detail →** ke `/perangkat/<id>`.
- Peta **dipaskan** ke semua titik (`fitBounds`, paling dekat zoom 18) saat dibuka dan saat ada titik yang berpindah, bukan saat status berubah, jadi peta yang sedang kamu geser tidak melompat sendiri. Perangkat tanpa titik ditulis di bawah peta ("Belum punya titik: …"). Kalau belum ada satu pun titik, layar menulis "Belum ada perangkat dengan koordinat. Isi lewat Bruno `atur lokasi perangkat`."
- **Penanda = `CircleMarker`** (lingkaran SVG), bukan `Marker` berikon bawaan Leaflet: ikon bawaan memakai berkas gambar yang hilang sesudah `npm run build` (penanda lenyap di `npm run preview`, padahal di `npm run dev` tampil). Lingkaran tidak butuh berkas gambar.
- **Kotak peta wajib punya tinggi** (`h-96` = 384 px di `PetaPerangkat.tsx`; tanpa tinggi, peta setinggi 0 px dan tidak terlihat), dan CSS Leaflet wajib dimuat (`import "leaflet/dist/leaflet.css"`; tanpa itu ubin berserakan). Kelas `isolate` menjaga lapisan-lapisan Leaflet (z-index 400–1000) tetap di dalam kotak peta, supaya *toast* (z-50) tetap tampil di atasnya.
- **Ubin peta** datang langsung dari server OpenStreetMap (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, satu konstanta di `src/peta.ts`, sesuai kebijakan ubin OSM "jangan tanam alamat ubin di banyak tempat"). Syaratnya: atribusi "© OpenStreetMap contributors" selalu terlihat di pojok peta (jangan disembunyikan), browser mengirim *Referer* (bawaan browser sudah), dan **tidak boleh** mengunduh ubin secara massal atau menyimpannya untuk dipakai tanpa internet. Layanan ubin ini gratis tanpa jaminan (tanpa SLA) dan bisa diblokir bila dipakai berlebihan; beberapa titik untuk satu rumah jauh di bawah batas itu.
- **Mode gelap:** bingkai halaman, keterangan, dan kotak popup beserta tombol ✕-nya ikut gelap (aturan di `index.css`); **ubin peta tetap terang**, karena itu gambar dari OpenStreetMap yang tidak kita ubah warnanya.
- **Privasi:** koordinat rumah adalah data pribadi (alamat rumahmu). Contoh di modul memakai titik fiktif di tempat umum (sekitar Monas, Jakarta). Sebelum membagikan tangkapan layar peta, pakai titik contoh atau samarkan lokasinya.
- **Lisensi pustaka peta:** Leaflet 1.9.4 berlisensi BSD-2-Clause. react-leaflet 5.0.0 (beserta `@react-leaflet/core`) berlisensi **Hippocratic License 2.1**: gratis dipakai dan diubah, dengan syarat pemakaiannya sejalan dengan prinsip hak asasi manusia (Deklarasi Universal Hak Asasi Manusia PBB, disebut di teks lisensinya). Syarat tambahan itu membuatnya **tidak** termasuk lisensi sumber terbuka yang diakui OSI (GitHub menampilkannya sebagai `NOASSERTION`). Untuk proyek belajar ini tidak menjadi masalah; untuk produk yang dijual, baca dulu teks lengkapnya (`node_modules/react-leaflet/LICENSE.md`), atau pakai Leaflet langsung tanpa react-leaflet (dibahas di Bedah Teknis Modul 25).

## Peran: admin dan viewer

- Peran dibaca dari jawaban `GET /auth/me` dan `POST /auth/login`, lalu hanya disimpan di memori tab (toko Zustand), tidak pernah di `localStorage`.
- Tombol kendali, **+ Aturan baru**, dan **Ubah** baru digambar sesudah peran admin **pasti** (`useAdmin()` di `toko.ts`), jadi tidak sempat berkedip di layar viewer.
- Menyembunyikan tombol hanya kenyamanan layar, **bukan pengaman**. Yang menjaga tetap satpam backend: setiap perintah dan perubahan dari akun viewer dijawab `403 akun viewer hanya boleh melihat; perintah dan perubahan khusus admin`, dari dashboard, Bruno, atau jalan lain.
- Peran yang diubah lewat `npm run pengguna` di backend baru terlihat sesudah halaman dimuat ulang atau gelang akses (15 menit) diperbarui.

## Tombol kendali

- **Lampu dan kipas** (`components/TombolSakelar.tsx`): begitu diketuk, tombol langsung berganti (*optimistic UI*, `useOptimistic` + `useTransition` React 19) dan menulis "Menunggu konfirmasi perangkat…" sampai backend meneruskan jawaban perangkat (*ack*, paling lama 5 detik). Keadaan akhirnya diambil dari *ack*. Kalau perintahnya gagal, tombol kembali sendiri ke keadaan yang dilaporkan perangkat, dan *toast* menjelaskan sebabnya: perangkat menolak (`ack.ok` `false`), 409 (perangkat offline, perintah sebelumnya masih menunggu), 503, server tidak menjawab. Jawaban **504** berarti "belum dikonfirmasi perangkat; server mencoba lagi bila perangkat terdengar dalam 2 menit": perintah lampu dan kipas belum batal, jadi lampu bisa menyala sendiri beberapa saat kemudian. Sejak backend 1.4 (Modul 27) perintah dari dashboard atau Telegram yang tetap tidak dikerjakan perangkat dilupakan sesudah 2 menit (log backend: `… tidak dikerjakan lebih dari 2 menit: tidak dikirim lagi`), supaya lampu tidak tiba-tiba menyala berjam-jam kemudian saat internet rumah pulih.
- **Pompa** (`components/TombolPompa.tsx`): 3, 5, atau 10 detik, sengaja **tidak** optimis (air yang sudah keluar tidak bisa ditarik lagi; perintah yang diulang = menyiram dua kali). Layar baru berubah sesudah *ack*, dan tombolnya mati selama pompa masih menyiram. Backend tidak mengirim ulang perintah pompa sesudah 504.
- Tombol mati (dengan alasannya tertulis) kalau perangkat tidak online atau jenisnya belum diketahui. Node 2 dan perangkat yang kuncinya dicabut atau belum terdaftar tidak punya bagian **Kendali**. Tirai hanya ditampilkan (tombolnya: Tantangan Modul 24).
- Jawaban `POST /devices/:id/command` diperiksa dengan skema `Ack` (salinan dari backend) memakai `safeParse`, bukan sekadar dipercaya.

## Aturan otomatis

- Layar `/aturan` menulis setiap aturan sebagai kalimat (`uraikanAturan()` di `src/aturan.ts`), misalnya "Kalau kelembapan tanah di Simulator 1 di bawah 30 % selama 10 detik, siram 5 detik (sekali). Aturan siap lagi sesudah kelembapan tanah naik di atas 35 %." Kalimat ini dibuat di browser, jadi bisa sedikit berbeda dari kalimat kejadian buatan backend.
- Formulirnya satu untuk buat dan ubah (`components/FormAturan.tsx`, dengan tiga bagian kecil `BagianKapan.tsx`, `BagianLalu.tsx`, dan `KonfirmasiHapus.tsx` yang memakai formulir yang sama lewat `FormProvider`): **Kapan?** (angka naik melewati batas, angka turun di bawah batas, atau jam tertentu dengan cron 5 bidang WIB), **Lalu?** (nyalakan lampu/kipas selama aturan menyala, atau kirim satu perintah sekali), pratinjau kalimat yang berubah sambil mengetik, sakelar **Aktif**, dan **Hapus aturan** dengan konfirmasi. Isiannya diperiksa skema `Aturan` yang sama dengan backend (react-hook-form + `zodResolver`); pesan bawaan Zod diganti yang lebih ramah ("Isi dengan angka", "Wajib diisi"), sedangkan pesan milik skema (misalnya histeresis) sama persis dengan yang dikirim backend. Backend tetap memeriksa ulang; galat 400-nya (misalnya `ekspresi cron tidak sah`) ditaruh di kolomnya, dan galat untuk bagian yang tidak punya kolom (misalnya `kondisi.jenis` dari backend lama yang belum mengenal `ambang-bawah`) ditulis di atas tombol **Simpan aturan**. Kolom angka menerima `2,5` maupun `2.5` (keduanya dua setengah); kolom bilangan bulat menolak keduanya dengan "Isi dengan bilangan bulat (tanpa koma)". Tulis angka ribuan tanpa titik (`1000`, bukan `1.000`, yang dibaca browser sebagai 1). Sesudah disimpan atau dihapus, layar pindah ke `/aturan` dengan `replace`, jadi **Back** tidak membuka lagi formulir lama.
- Setiap aturan yang dibuat, diubah, atau dihapus dari dashboard mana pun membuat layar `/aturan` yang sedang terbuka mengambil ulang daftarnya sendiri (kejadian `aturan-diubah`).

## Kabar di layar (*toast*)

- Sumbernya dua: hasil tindakanmu sendiri (perintah gagal, aturan disimpan) dan acara `kejadian` dari backend (aturan bertindak, jadwal berjalan, perangkat terputus, mode offline, perintah yang dikirim ulang). `aturan-diubah` tidak dijadikan *toast*.
- Paling banyak 2 sekaligus (yang ketiga mendorong yang paling lama keluar), masing-masing hilang sendiri sesudah 4 detik (`setTimeout`, bukan `setInterval`) atau ditutup dengan tombol ✕ (44 × 44 px). Wadahnya (`components/WadahToast.tsx`) dipasang `TataLetak` di antara kepala dan isi layar, jadi selalu ada di semua layar sesudah masuk, dengan `role="status"` dan `aria-live="polite"`: pembaca layar mengumumkan isinya tanpa memindah fokus. Warna selalu ditemani ikon dan teks.
- Letaknya mengikuti lebar layar, supaya tidak menutupi tombol yang sedang dipakai. Di layar 1280 px ke atas: pojok kanan atas, di ruang kosong samping kolom isi, menempel di tepi atas saat halaman digulir. Di HP dan tablet (di bawah 1280 px tidak ada ruang kosong di samping isi): di BAWAH layar, ditambah jarak garis sistem HP bila ada (`env(safe-area-inset-bottom)`). Supaya tombol paling bawah (**Simpan aturan**, **Hapus aturan**) selalu bisa digulir ke atas toast, isi halaman diberi ruang kosong 16rem di bawah (`pb-64` di `<main>`), dan `scroll-pb-64` di `<html>` (`index.html`) membuat browser yang menggulir sendiri ke tombol atau kolom (tombol Tab, kolom yang salah isi) berhenti di atas toast. Diuji di 375 px dan 1280 px, terang dan gelap, juga saat tiga toast datang sekaligus: **Keluar**, **+ Aturan baru**, **Ubah**, Lampu, Kipas, tombol pompa, **Simpan aturan**, **Batal**, **Hapus aturan**, dan **Ya, hapus** tidak tertutup. Yang tetap bisa terjadi di HP: tombol yang kebetulan tepat di tepi bawah layar saat toast datang tertutup sampai halaman digulir sedikit lagi (atau toast ditutup ✕, paling lama 4 detik). Di layar yang pendek atau sangat sempit (HP yang dimiringkan, atau HP selebar 320 px) toast bisa menutupi baris Lampu/Kipas atau tombol pompa, termasuk toast dari tombol yang baru diketuk. Ketukan yang jatuh di kartu toast tidak sampai ke tombol di bawahnya: tutup dulu toast-nya dengan ✕ atau tunggu sampai hilang. Ruang kosong wadahnya (di luar kartu) tidak menghalangi ketukan.
- Warna *toast* kejadian diambil dari data, bukan dari kalimatnya: perangkat terputus (status perangkat di toko bukan `online`), dan aturan atau jadwal yang tindakannya tidak terlaksana (`data.ok` `false` dari backend 1.1, atau `data.hasil` `tanpa-ack`/`tidak-dikirim`) berwarna merah; lainnya abu-abu.

## Keluar

Tombol **Keluar** bekerja dalam empat langkah: (1) memutus sambungan *live* lebih dulu, (2) `POST /auth/logout` supaya backend menghapus *cookie* `HttpOnly` (JavaScript tidak bisa menghapusnya), (3) mengosongkan SEMUA isi toko dan *toast*, sehingga orang berikutnya di tab yang sama tidak melihat sisa data atau tombol akun sebelumnya, (4) penjaga rute memindahkan layar ke `/masuk`. Kalau tombol **Back** memulihkan halaman lama utuh dari *back/forward cache* browser (bisa terjadi bila alamatnya dulu diketik langsung di bilah alamat), `App.tsx` memuat ulang halaman itu (`pageshow` dengan `persisted`), sehingga isi akun sebelumnya hanya tampil sekejap lalu diganti layar Masuk. Kalau server tidak menjawab saat Keluar, layar Masuk menulis terus terang bahwa sesi di server belum terhapus. Sesi yang habis (atau *logout* dari tab lain) memakai pengosong yang sama, lalu menulis "Sesi sudah habis. Silakan masuk lagi."

## Salinan skema (`src/skema/`)

`src/skema/kontrak.ts` dan `src/skema/aturan-dasar.ts` adalah **salinan identik** dari `backend/src/schemas/` (penjelasan di `src/skema/README.md`). Jangan mengubahnya di frontend: ubah di backend, salin ulang, lalu jalankan `npm run cek-skema` dari folder ini. Skrip `cek-skema.js` membandingkan isi kedua berkas baris demi baris (akhir baris CRLF dan LF dianggap sama), mencetak `SAMA` atau `BEDA` beserta baris pertama yang berbeda, dan keluar dengan kode 1 bila ada yang berbeda. `src/skema/masuk.ts` bukan salinan: skema formulir Masuk ditulis sendiri meniru `backend/src/routes/auth.ts`.

## Alamat backend (`.env.local`, tidak wajib)

Tanpa setelan apa pun, dashboard memanggil backend di nama host halaman + port `8080`: halaman `http://localhost:5173` → API `http://localhost:8080`, dan halaman `http://<IP-laptop>:5173` di HP → API `http://<IP-laptop>:8080`. Sambungan *live* (Socket.IO) memakai alamat yang sama. Kalau backend-mu di alamat lain, salin `.env.example` menjadi `.env.local`, isi `VITE_API_BASE` (misalnya `VITE_API_BASE=http://localhost:8081`), lalu jalankan ulang `npm run dev`. `.env.local` tidak ikut Git, dan untuk mode HP baris `VITE_API_BASE` harus tetap diberi `#`. Semua variabel `VITE_…` ikut tertanam di JavaScript yang dikirim ke browser, jadi isinya alamat saja, **tidak pernah** rahasia. Semua ini hanya untuk mode kembang: image web Docker selalu memakai `/api` (dibakar saat build, lihat "Menjalankan dengan Docker Compose"), dan `.env.local` tidak ikut ke image.

## Membuka dari HP (WiFi rumah)

**Mode rumah (Docker Compose, Modul 26)** cukup diatur di `.env` akar: `ALAMAT_WEB=0.0.0.0` (loket web dibuka ke WiFi rumah, bukan hanya `127.0.0.1`) dan alamat halaman di HP ditambahkan ke `CORS_ORIGIN`, misalnya `http://localhost,http://127.0.0.1,http://<IP-laptop>` (dengan port-nya juga kalau `PORT_WEB` bukan 80), lalu `docker compose up -d`. HP membuka `http://<IP-laptop>`, tanpa port 5173. Kembalikan kedua baris itu sesudah mencoba. Tabel dan langkah di bawah ini untuk **mode kembang** (Vite).

HP dan laptop harus tersambung ke WiFi rumah yang sama (bukan WiFi tamu). Nyalakan "mode HP" hanya selama mencoba, di WiFi rumah yang kamu percaya, lalu kembalikan ke "mode laptop". Sejak v1.0 akun admin bisa mengendalikan perangkat dari HP: sandi admin melewati `http://` polos (belum terenkripsi, HTTPS menyusul di Modul 27), jadi untuk penguji pakai akun sementara dan hapus sesudahnya.

| Setelan | Mode laptop (bawaan) | Mode HP (sementara) |
| :--- | :--- | :--- |
| `HOST` di `backend/.env` | `127.0.0.1` | `0.0.0.0` (bukan alamat IP WiFi: dengan alamat IP, backend berhenti melayani `localhost`) |
| `CORS_ORIGIN` di `backend/.env` | `http://localhost:5173,http://127.0.0.1:5173` | ditambah `,http://<IP-laptop>:5173`. Satu baris ini berlaku untuk `fetch` (termasuk perintah, simpan, dan hapus aturan) dan Socket.IO sekaligus. Tanpa itu, perintah dari HP dijawab `403 permintaan dari halaman http://<IP-laptop>:5173 ditolak` |
| Perintah Vite | `npm run dev` | `npm run dev:hp` |
| Alamat di browser | `http://localhost:5173` di laptop | `http://<IP-laptop>:5173` di HP |

1. Cari alamat IPv4 WiFi laptop: di Windows `ipconfig`, bagian `Wireless LAN adapter Wi-Fi`; di macOS `ipconfig getifaddr en0`. Abaikan alamat adaptor lain (vEthernet, Docker, VPN) yang juga dicetak Vite.
2. Ubah dua baris `backend/.env` di atas, lalu simpan (`npm run dev` di backend memulai ulang sendiri). Database tetap `127.0.0.1`: ia tidak ikut terbuka ke WiFi.
3. Di folder ini, jalankan `npm run dev:hp`. Kalau Windows bertanya, izinkan **Node.js JavaScript Runtime** hanya untuk jaringan **Private**.
4. Di HP, buka `http://<IP-laptop>:8080/health` dulu (harus menjawab), lalu `http://<IP-laptop>:5173`, dan masuk. *Login* di laptop tidak ikut ke HP: *cookie* melekat pada nama host (`localhost` dan alamat IP itu dua nama berbeda).
5. Selesai mencoba, dan selalu sebelum laptop dibawa ke jaringan lain: kembalikan `HOST` dan `CORS_ORIGIN`, lalu jalankan Vite lagi dengan `npm run dev`. Alamat IP bisa berubah besok (router membagikannya ulang); kalau HP tidak bisa membuka lagi, cari IP-nya lagi.

**Tambahkan ke layar utama.** Dashboard bisa dijadikan pintasan di layar utama HP (Chrome Android: menu ⋮ → pilihan pemasangan atau pintasan, misalnya **Install and create shortcut** → **Create shortcut** di HP berbahasa Inggris; iPhone, Safari berbahasa Indonesia: **Bagikan** → **Tambah ke Layar Utama**, atau **Add to Home Screen** di HP berbahasa Inggris). Untuk iPhone, `index.html` memasang ikon `public/apple-touch-icon.png` (180 × 180 px: gambar garis rumah sederhana di atas latar terang penuh, dibuat sendiri dari SVG) dan nama pendek "Rumah Pintar". Lewat `http://<IP-laptop>` ini hanya pintasan, bukan aplikasi terpasang: alamat IP WiFi bukan alamat aman, jadi browser tidak memasang *service worker*, dan pintasannya rusak kalau IP laptop berubah. Aplikasi sungguhan (PWA) ada sejak v1.3 lewat `https://` (Modul 27): lihat bagian berikut.

## Aplikasi di HP (PWA, Modul 27)

Sejak v1.3, `npm run build` (juga di dalam `docker compose build web`) menambah empat berkas ke `dist/`, semuanya dibuat `vite-plugin-pwa` dari setelan di [`vite.config.ts`](vite.config.ts):

| Berkas di `dist/` | Isinya |
| :--- | :--- |
| `manifest.webmanifest` | kartu nama aplikasi: nama "Rumah Pintar Mini", nama pendek "Rumah Pintar", bahasa `id`, alamat awal `/`, jendela sendiri tanpa bilah alamat (`standalone`), warna, dan empat ikon. Tautannya (`<link rel="manifest">`) ditambahkan sendiri ke `index.html` |
| `sw.js` + `workbox-….js` | *service worker*: menyimpan **cangkang** dashboard (HTML, JavaScript, CSS, ikon; 10 berkas, ±1 MB) supaya aplikasi terbuka cepat dan tetap terbuka saat internet putus |
| `registerSW.js` | tiga baris kecil yang memasang `sw.js` sesudah halaman selesai dimuat |

**Yang disimpan dan yang tidak.** Hanya cangkang. Setiap alamat layar (`/perangkat`, `/peta`, `/perangkat/f00d00000001/riwayat`, …) dijawab `index.html` dari simpanan, lalu React Router memilih layarnya. Alamat yang **bukan** layar dashboard selalu diteruskan ke server dan tidak pernah diganti `index.html`: `/api/…` (data dan sambungan *live*), `/grafana/…` (Grafana di alamat yang sama, Modul 27), dan `/socket.io/…`. Tanpa pengecualian `/grafana`, membuka `https://iot…/grafana/` di browser yang pernah membuka dashboard menampilkan layar "Halaman tidak ditemukan" milik dashboard, bukan Grafana (dicoba penulis). Data rumah, bacaan, riwayat, dan ubin peta tidak pernah disimpan: angka di layar selalu dari server, jadi tidak ada angka basi yang tampak baru.

**Alamat aman.** Browser hanya memasang *service worker* dan menawarkan pemasangan aplikasi di alamat aman: `https://…` atau `http://localhost`. Jadi:

| Alamat | Aplikasi terpasang? |
| :--- | :--- |
| `http://localhost` (mode rumah, laptop) | ya, untuk mencoba di laptop (Chrome atau Edge) |
| `https://iot.namaanda.my.id` (VPS atau jalur gratis Modul 27) | ya, di HP dan laptop, dari mana saja |
| `http://<IP-laptop>` atau `http://<IP-laptop>:5173` (mode HP, WiFi rumah) | tidak: hanya pintasan (lihat di atas) |
| `http://localhost:5173` (`npm run dev`) | tidak: mode kembang tanpa *service worker* |

**Memasang.** Laptop (Chrome atau Edge): buka alamatnya, lalu pakai menu pemasangan aplikasi browser (tombol di bilah alamat atau menu ⋮); dashboard lalu terbuka di jendela sendiri dengan ikon rumah. HP Android (Chrome): buka `https://iot.namaanda.my.id`, lalu menu ⋮ → pilihan pemasangan aplikasi. iPhone (Safari, label Indonesia): ⋯ → **Bagikan** → **Tambah ke Layar Utama** (bila tidak ada: **Edit Tindakan**) → nyalakan **Buka sebagai App Web** → **Tambah**. Label menu Chrome di HP berbeda per versi dan bahasa; pemasangan di HP sungguhan belum dicoba penulis (lihat "Batasan v1.3").

**Memeriksa di laptop** (DevTools, F12): tab **Application** → **Manifest** (nama, ikon, tanpa galat) dan **Service workers** (`sw.js` dengan status *activated*). Di Chrome 156 penulis, `http://localhost` dinyatakan bisa dipasang (tanpa galat pemasangan), *service worker* aktif pada kunjungan pertama, dan mulai kunjungan kedua setiap layar dijawab dari simpanannya.

**Saat internet putus** (mode pesawat, WiFi mati, atau server mati): aplikasi terpasang tetap terbuka dan menampilkan layar **Masuk** dengan pesan `Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi.` Begitu tersambung lagi, buka ulang aplikasinya (atau muat ulang); *cookie* login yang masih berlaku langsung membawamu kembali ke dashboard. Tanpa *service worker*, yang tampil adalah halaman galat browser.

**Versi baru.** Setelan `registerType: 'autoUpdate'` membuat *service worker* baru langsung dipakai tanpa bertanya, tetapi tidak memuat ulang halaman yang sedang terbuka. Sesudah image web dibangun ulang: pembukaan (atau muat ulang) **pertama** masih menampilkan versi lama dari simpanan sambil browser mengambil versi baru di belakang layar; pembukaan **berikutnya**, sesudah browser selesai mengambil versi baru itu (biasanya beberapa detik; di jaringan HP yang lambat bisa lebih lama), menampilkan versi baru (dicoba penulis: versi baru tampil pada muat ulang kedua, tanpa langkah lain). Aplikasi di HP yang hanya dikembalikan dari daftar aplikasi terakhir belum tentu memeriksa versi baru: tutup lalu buka lagi. Isian formulir yang sedang diketik tidak hilang karena pembaruan.

**Membuang *service worker*** (misalnya sesudah `npm run preview`, atau saat ragu dashboard yang tampil sudah versi terbaru): DevTools → **Application** → **Storage** → **Clear site data**, lalu muat ulang. Ini juga menghapus *cookie* login di alamat itu (kamu perlu masuk lagi).

**Ikon.** `public/favicon.svg` (ikon tab, menggantikan logo petir bawaan Vite) adalah gambar rumah garis dengan pintu teal yang sama dengan `apple-touch-icon.png` Modul 24, di atas ubin terang bersudut bulat. `pwa-64x64.png`, `pwa-192x192.png`, dan `pwa-512x512.png` dibuat penulis sekali dari `favicon.svg` (sudut tembus pandang); `maskable-icon-512x512.png` adalah versi berlatar terang penuh untuk peluncur Android, yang memotong ikon menjadi lingkaran atau kotak bulat: gambar rumahnya ada di dalam lingkaran aman 80 % di tengah. Semua PNG ikut repo, jadi kamu tidak perlu membuatnya sendiri. `apple-touch-icon.png` (iPhone) tetap berkas Modul 24.


## Isi folder `src/`

| Berkas | Isinya |
| :--- | :--- |
| `main.tsx` | titik masuk: memasang `App` di dalam `StrictMode` dan `<BrowserRouter>` |
| `App.tsx` | memeriksa *login* sekali (`GET /auth/me`), menjaga sambungan *live* sekali (di atas `<Routes>`, jadi pindah layar tidak memutusnya), dan peta rute di satu tempat |
| `api.ts` | satu pintu ke backend: `fetch` dengan `credentials: "include"`, `GalatApi` yang tahu kode HTTP, *refresh* sekali saat dijawab 401, bacaan dan riwayat, `kirimPerintah()` (+ `Ack.safeParse`), `ambilAturan()` (+ `safeParse`), `buatAturan()`, `ubahAturan()`, `hapusAturan()` |
| `soket.ts` | satu sambungan Socket.IO (`withCredentials: true`; sejak v1.2, `BASE` yang diawali `/` dipakai sebagai opsi `path`: `/api/socket.io`), pemulihan sambungan, `ikuti`/`berhenti`, hook `useRealtime()`; acara `kejadian` → *toast*; daftar perangkat diambil ulang setiap kali sambungan PULIH (status yang berubah selama putus) |
| `toko.ts` | toko Zustand: sesi dan peran (`useAdmin()`), sambungan, daftar perangkat, status, bacaan terbaru, "terakhir dilihat", titik grafik 5 menit, `terapkanKeadaan()` dari *ack*, `kosongkanSemua()`, `sesiHabis()` |
| `toast.ts` | toko *toast* kecil: `toast(pesan, jenis)`, paling banyak 2, hilang sesudah 4 detik |
| `aturan.ts` | bentuk jawaban `GET /rules`, `uraikanAturan()` (aturan → kalimat), isi bawaan formulir, pilihan perangkat, peta pesan ramah, dan pembaca galat 400 backend |
| `kolom.tsx` | pembantu kolom formulir aturan: gaya kotak dan label, id kolom, `useKolom()` (pesan galat + `aria-invalid`/`aria-describedby`) |
| `skema/` | `kontrak.ts` dan `aturan-dasar.ts` = salinan identik dari backend; `masuk.ts` = skema formulir Masuk; `README.md` |
| `waktu.ts` | jam WIB, "… detik yang lalu" (date-fns), batas data basi, label sumbu waktu, dan detak satu detik (`useSekarang`) |
| `csv.ts` | menyusun dan mengunduh CSV di browser (titik koma, desimal koma, BOM) |
| `types.ts` | tipe data dari kontrak data 1.5 (Lampiran A; bentuk pesan sama dengan 1.4), jawaban API, dan acara Socket.IO |
| `peta.ts` | setelan peta dalam satu konstanta `PETA` (Modul 25): alamat ubin OSM, atribusi, zoom, warna penanda |
| `halaman/` | satu berkas pembungkus tipis per layar: `Masuk`, `Daftar`, `Detail`, `Riwayat`, `Peta`, `Aturan`, `FormAturan`, `TidakDitemukan`. Layar yang memakai `:id` mencari datanya sendiri dari alamat |
| `components/JagaMasuk.tsx` | penjaga rute: "Memeriksa sesi…", pindah ke `/masuk` (membawa alamat tujuan), atau `<Outlet />` |
| `components/KhususAdmin.tsx` | penjaga kedua: layar "Khusus admin" untuk akun *viewer*, atau `<Outlet />` untuk admin |
| `components/TataLetak.tsx` | bingkai sesudah masuk: kepala (lencana sambungan, menu **Perangkat** / **Peta** / **Aturan**, nama + peran, **Keluar**), wadah *toast* (dan ruang kosong di bawah isi untuknya), mengambil daftar perangkat sekali, `<Outlet />` |
| `components/TombolSakelar.tsx`, `components/TombolPompa.tsx` | tombol kendali (lihat "Tombol kendali") |
| `components/WadahToast.tsx` | tempat *toast* tampil: di bawah layar HP dan tablet, di pojok kanan atas layar 1280 px ke atas |
| `components/DaftarAturan.tsx`, `components/FormAturan.tsx` | daftar aturan dalam kalimat dan formulir aturan (isian, simpan, hapus, pratinjau) |
| `components/BagianKapan.tsx`, `components/BagianLalu.tsx`, `components/KonfirmasiHapus.tsx` | bagian formulir aturan: **Kapan?**, **Lalu?** (+ Telegram dan **Aktif**), dan tombol **Hapus aturan** dengan kotak "yakin?"-nya |
| `components/DaftarPerangkat.tsx` | kartu perangkat merah/hijau dengan suhu terbaru dan "terakhir dilihat"; setiap kartu tautan ke `/perangkat/<id>` |
| `components/DetailPerangkat.tsx` | semua sensor satu perangkat (Node 1 atau Node 2), bagian **Kendali** (admin), grafik 5 menit, dan gauge |
| `components/PetaPerangkat.tsx` | peta perangkat (Modul 25): `MapContainer` bertinggi tetap, ubin OSM + atribusi, `CircleMarker` berwarna status *live*, popup + tautan detail, `fitBounds`, pesan kosong; mengambil ulang `GET /devices` setiap kali dibuka |
| `components/GrafikLive.tsx`, `Gauge.tsx`, `Riwayat.tsx`, `GrafikRiwayat.tsx`, `TabelRiwayat.tsx`, `KartuSensor.tsx`, `Lencana.tsx`, `LencanaKoneksi.tsx`, `TerakhirDilihat.tsx`, `Pemilih.tsx` | komponen Modul 22–23 (grafik, gauge, riwayat, kartu, lencana) |
| `index.css` | `@import "tailwindcss";` (Tailwind CSS v4, tanpa `tailwind.config.js`) + warna grafik yang ikut mode gelap + kotak popup peta yang ikut mode gelap (Modul 25) |

## *Login* dan keamanan

- Dashboard tidak menyimpan sandi, token, atau peran. Backend memasang dua *cookie* `HttpOnly; SameSite=Strict`: `akses` (15 menit, jalur `/`) dan `sesi` (7 hari, jalur `/auth`; lewat Caddy di mode rumah jalurnya ditulis ulang menjadi `/api/auth`). Lewat `https://` (Modul 27, backend 1.4 dengan `TRUST_PROXY`), keduanya juga ber-`Secure`: browser hanya mengirimnya lewat sambungan terenkripsi. *Service worker* tidak pernah menyimpan jawaban `/api`, jadi *cookie* dan data akun tidak ikut tersimpan di simpanannya. JavaScript tidak bisa membacanya; browser yang mengirimkannya karena setiap `fetch` memakai `credentials: "include"` dan Socket.IO memakai `withCredentials: true`. Tidak ada apa pun yang disimpan di `localStorage`.
- Kalau sebuah permintaan dijawab 401 (*cookie* `akses` sudah habis), `api.ts` memanggil `POST /auth/refresh` **sekali**, lalu mengulang permintaannya sekali. Kalau *refresh* juga gagal, toko dikosongkan dan layar pindah ke `/masuk`.
- Permintaan tanpa isi (`POST /auth/logout`, `POST /auth/refresh`, `DELETE /rules/:id`) dikirim TANPA kepala `Content-Type: application/json`: backend menolak permintaan yang mengaku membawa JSON tetapi isinya kosong (400).
- Sambungan *live* diputus server setiap kali *cookie* `akses` habis (15 menit) dan saat *logout*. Dashboard lalu memanggil *refresh* dan menyambung lagi sendiri; kalau *refresh* ditolak (misalnya sudah *logout* di tab lain), layar pindah ke `/masuk`. Sesudah 3 kali gagal beruntun lencana menjadi **Terputus**, dan halaman perlu dimuat ulang sesudah backend pulih.
- Data baru hanya datang lewat Socket.IO: tidak ada *polling*. `setInterval` hanya dipakai di `waktu.ts` untuk jam di layar.
- Nama perangkat, nama aturan, dan kalimat kejadian ditampilkan sebagai teks JSX yang otomatis diloloskan React; dashboard tidak memakai `dangerouslySetInnerHTML`.

## Batasan v1.3

- **Di rumah masih `http://` polos.** Mode HP (WiFi rumah) membuka dashboard tanpa enkripsi; sandi (juga sandi admin) lewat polos. Dari internet, dashboard dibuka lewat `https://` (Modul 27: VPS, atau Pi + Cloudflare Tunnel). HTTPS butuh nama domain, jadi alamat IP di WiFi rumah tetap HTTP.
- **Aplikasi terpasang hanya cangkang.** Tanpa internet, aplikasi terbuka tetapi tidak menampilkan angka apa pun (tidak ada data luring), tidak bisa mengendalikan perangkat, dan tidak mengirim notifikasi *push*; kabar tetap lewat Telegram (Modul 19, 25). Perintah yang diketuk saat terputus tidak disimpan untuk dikirim nanti.
- **Versi baru tampil pada pembukaan berikutnya** sesudah image web dibangun ulang dan browser selesai mengambilnya di belakang layar (lihat "Aplikasi di HP"), bukan langsung seperti v1.2. Biasanya cukup membuka lagi atau muat ulang dua kali dengan jeda beberapa detik.
- **`npm run preview` meninggalkan *service worker*** di `http://localhost:5173`; `npm run dev` sesudahnya menampilkan build lama sampai *site data* dibersihkan (DevTools → **Application** → **Storage** → **Clear site data**). Dicoba penulis.
- **Pemasangan di HP belum dicoba penulis.** Yang diuji: Chrome 156 tanpa layar di Raspberry Pi (manifest tanpa galat, bisa dipasang, *service worker* aktif, cangkang luring, pembaruan versi) di `http://localhost`, dan di `https://` dengan nama domain dan sertifikat tiruan (VPS dan Let's Encrypt ditiru di lab, termasuk Grafana `/grafana/` dengan *service worker* aktif). Tombol pemasangan Chrome Android, ikon di peluncur HP, dan Safari iPhone belum dicoba; label menu ditulis dari dokumentasi.
- **Image web dibangun untuk satu awalan API, `/api`.** Alamat itu dibakar ke JavaScript saat build; dashboard Compose tidak bisa diarahkan ke backend di alamat lain tanpa membangun ulang image. Image juga hanya untuk jenis prosesor mesin yang membangunnya (arm64 di Pi atau Mac Apple silicon, amd64 di kebanyakan laptop Windows); image untuk keduanya sekaligus dibahas di Modul 29.
- **Jalur *cookie* `sesi` ditambal di Caddy** (`header_down`), bukan di backend. Kalau kelak jalur *cookie* di backend berubah, `caddy/Caddyfile` harus ikut diubah.
- **`VITE_API_BASE` hanya boleh berupa jalur (`/api`) atau alamat tanpa jalur** (`http://localhost:8080`). Alamat lengkap yang berjalur, misalnya `http://localhost/api`, belum didukung sambungan *live*: Socket.IO membaca `/api` di ujungnya sebagai *namespace*, jadi lencana tidak pernah **Live**.
- **Dashboard Compose tidak memperbarui diri sendiri.** Mengubah kode berarti `docker compose build web` + `docker compose up -d web` (±1 menit di Pi 5); untuk mengubah sambil melihat hasilnya, pakai mode kembang (Vite).
- **Menyembunyikan tombol bukan pengaman.** Peran di layar hanya kenyamanan; satpam backend (403) yang menjaga. Peran yang diubah baru terlihat sesudah muat ulang atau ≤ 15 menit.
- **Hanya sebagian jawaban API yang diperiksa Zod**: *ack* perintah dan daftar aturan. Jawaban lain (perangkat, bacaan, riwayat, acara Socket.IO) tetap dipercaya lewat tipe TypeScript.
- **Sesudah 504, tampilan kembali ke keadaan terlapor**, padahal backend masih akan mengirim ulang perintah lampu atau kipas bila perangkat terdengar dalam 2 menit (backend 1.4; sesudah itu tidak); dashboard tidak menampilkan perintah yang masih tertunda.
- **Tirai belum punya tombol**, dan jadwal aturan diisi sebagai teks cron 5 bidang (dengan tiga contoh siap klik), belum dengan pemilih jam dan hari.
- **Riwayat ringkasan hanya empat besaran**: suhu (rata-rata, terendah, tertinggi), kelembapan udara, kelembapan tanah, dan cahaya. Tekanan udara, baterai, dan air tandon hanya tampil di kartu *live*. Rentangnya mengikuti nilai bawaan API: 1 jam (bacaan mentah), 24 jam (per 15 menit), dan 7 hari (per jam).
- **Grafik 5 menit hanya untuk perangkat yang mengirim tiap 10 detik** (Node 1 dan simulator). Node 2 mengirim tiap 5 menit, jadi grafiknya dilihat di layar riwayat.
- **Kiriman yang lewat selama sambungan putus tidak dikirim ulang server.** Begitu tersambung lagi, grafik 5 menit diisi ulang dari database, daftar perangkat (dan statusnya) diambil ulang, dan kartu diisi bacaan terakhir yang diingat backend. Sesudah backend dinyalakan ulang, keadaan lampu, kipas, pompa, dan tirai baru muncul di kiriman berikutnya karena tidak disimpan di database; sampai saat itu tombol kendali belum tampil.
- **Peta butuh internet.** Ubin datang dari server OpenStreetMap (gratis, tanpa jaminan, bisa diblokir bila dipakai berlebihan). Tanpa internet, kotak peta abu-abu polos; lingkaran penanda tetap digambar. Ubin tidak boleh diunduh massal atau disimpan untuk luring.
- **Titik peta tidak bergerak *live*.** Titik yang diubah admin tampil sesudah menu **Peta** dibuka lagi; yang *live* hanya warna status.
- **Penanda tidak bisa dipilih dengan tombol Tab.** Kotak peta sendiri bisa difokus dengan Tab lalu digeser dengan tombol panah (bawaan Leaflet), tetapi lingkaran penanda dan popup-nya hanya bisa dibuka dengan klik atau ketuk. Isi yang sama (nama, status, terakhir dilihat, tautan detail) ada di layar **Perangkat**.
- **Ubin peta tetap terang di mode gelap**, dan untuk satu rumah titik-titiknya berdekatan (beberapa meter, zoom 18): peta paling berguna saat perangkat tersebar (kebun, rumah lain).
- **Mode gelap mengikuti setelan sistem** HP atau laptop; belum ada tombol terang/gelap.
- "Rapi di HP" diperiksa dengan mode perangkat DevTools (lebar 375 px, HP tegak) dan Chrome tanpa layar selebar 412 px, dan mode HP dicoba dengan membuka alamat IP WiFi laptop dari laptop itu sendiri; pemakaian oleh orang lain dari HP sungguhan dan pintasan layar utama belum dicoba penulis. Image web dan Caddyfile diuji penulis di Raspberry Pi 5 (Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3) dengan Chrome 156; HTTPS diuji dengan nama domain dan penerbit sertifikat tiruan di mesin penulis, bukan Let's Encrypt sungguhan; Docker Desktop di Windows dan macOS belum dicoba. Tailwind CSS v4 butuh browser yang cukup baru (Chrome 111+, Safari 16.4+, Firefox 128+).

## Catatan versi 1.3

Dashboard v1.3 (Modul 27) = v1.2 + aplikasi terpasang (PWA). Satu paket pengembang baru, tanpa perubahan layar; kontrak data tetap (bentuk pesan sama dengan 1.4, kontrak 1.5 hanya menambah aturan broker internet). Pasangannya di internet adalah backend 1.4 (`TRUST_PROXY`: *cookie* `Secure` dan pembatas *login* per tamu di balik Caddy); di `http://localhost` v1.3 juga jalan dengan backend 1.3, hanya saja *toast* perintah gagal ("… bila perangkat terdengar dalam 2 menit") baru benar dengan backend 1.4; backend 1.3 masih mengirim ulang perintah itu kapan pun perangkat terdengar lagi.

- `package.json` dan `package-lock.json`: `version` 1.3.0; devDependency baru `vite-plugin-pwa` **2.0.0** (versi persis, tanpa `^`); paket lain tidak berubah versi.
- `vite.config.ts`: `VitePWA({ registerType: 'autoUpdate', manifest, workbox })`; `globPatterns` hanya berkas build, `navigateFallbackDenylist` untuk `/api`, `/grafana`, dan `/socket.io`.
- `index.html`: `<meta name="theme-color" content="#1d293d">` (sama dengan `theme_color` manifest) dan komentar ikon; tautan manifest dan `registerSW.js` ditambahkan plugin saat build.
- `public/`: `favicon.svg` diganti gambar rumah; berkas baru `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`.
- `src/api.ts`: pesan saat server tidak terjangkau kini netral di hasil build (`Tidak bisa menghubungi server. Periksa sambungan internetmu, lalu coba lagi.`); petunjuk `localhost:5173` dan `CORS_ORIGIN` hanya di mode kembang (`npm run dev`).
- `src/components/TombolSakelar.tsx`: kalimat *toast* 504 mengikuti backend 1.4 (`… server mencoba lagi bila perangkat terdengar dalam 2 menit.`).
- `caddy/Caddyfile` (bagian infrastruktur Modul 27): alamat situs `{$DOMAIN_WEB::80} {$DOMAIN_MQTT}`, jawaban `404` untuk nama broker, `/grafana/` ke Grafana, penerus tepercaya untuk jalur gratis; aturan `no-cache` M26 kini juga berlaku untuk `sw.js` dan `manifest.webmanifest`. `Dockerfile`: komentar saja (tag 1.3.0).

## Catatan versi 1.2

Dashboard v1.2 (Modul 26) = v1.1 + kemasan Docker. Tanpa paket npm baru, tanpa perubahan layar; kontrak data tetap 1.4. Mode rumah butuh backend 1.3 (cetakan Docker dan `compose.cloud.yml`); di mode kembang, v1.2 tetap jalan dengan backend 1.2.

- `src/soket.ts`: tiga baris. `BASE` yang diawali `/` (misalnya `/api` di balik Caddy) atau kosong dipakai sebagai jalur Socket.IO (`io({ path: "/api/socket.io", … })`), bukan *namespace*. Mode kembang tidak berubah.
- Berkas baru: `Dockerfile` (dua tahap, `ARG VITE_API_BASE=/api`), `.dockerignore`, `caddy/Caddyfile` (`index.html` dengan `Cache-Control: no-cache`, `/assets/…` yang tidak ada dijawab `404`).
- `.env.example`: dua baris komentar (berkas ini hanya untuk mode kembang).
- `package.json` dan `package-lock.json`: `version` 1.2.0.
