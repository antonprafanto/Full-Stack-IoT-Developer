# Frontend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../en/mini-smart-home/frontend/README.md)

Dashboard v0.2 proyek Rumah Pintar Mini: halaman web React 19 + TypeScript dengan Tailwind CSS v4, dibuat dengan Vite 8 (templat `react-ts` dari create-vite 9.3.1). Dashboard *login* dengan akun Modul 20, lalu menampilkan data *live* dari backend v1.0 lewat Socket.IO: daftar perangkat dengan status merah/hijau dan "terakhir dilihat", detail perangkat dengan angka yang berubah sendiri, grafik 5 menit terakhir, dan gauge. Layar riwayat menampilkan 1 jam, 24 jam, atau 7 hari terakhir sebagai grafik dan tabel berhalaman, dan bisa diunduh sebagai CSV. Tampilannya dirancang rapi di HP dan laptop dan mengikuti mode gelap sistem; dashboard juga bisa dibuka dari HP di WiFi rumah (lihat "Batasan v0.2"). Tombol kendali menyusul di Modul 24.

## Menjalankan

1. Pasang Node.js 24 LTS (Vite 8 butuh minimal Node.js 20.19 atau 22.12).
2. Nyalakan backend v1.0 seperti di `backend/README.md` (kontainer database `rumahpintar-db` di Docker Desktop dan broker MQTT sudah menyala, lalu `npm run dev` di folder `backend`) beserta sumber datanya: Node 1 dan Node 2 (Kit A + B), atau simulator perangkat Modul 21 di folder `alat` dengan perangkat latihan `f00d00000001` yang sudah terdaftar. `CORS_ORIGIN` di `backend/.env` harus memuat `http://localhost:5173` (nilai bawaannya sudah memuatnya).
3. Di folder ini, jalankan `npm install`.
4. Jalankan `npm run dev`, lalu buka **`http://localhost:5173`** di Chrome atau Edge. Pakai `localhost`, bukan `127.0.0.1`: di Windows, Vite hanya mendengar di `localhost`, dan nama host halaman harus sama dengan nama host API supaya *cookie* login ikut terkirim.
5. Masuk dengan akun yang dibuat di Modul 20: `viewer@rumah.test` (hanya melihat) atau `admin@rumah.test`. Sandinya milikmu sendiri; dashboard tidak pernah menyimpannya.

Riwayat 7 hari butuh data 7 hari. Kalau grafik "7 hari" hanya berisi beberapa titik, isi data latihan di folder `backend` dengan `npm run isi-riwayat`, lalu ringkas ulang buku ringkasan per jam:

```
docker exec rumahpintar-db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', now() - INTERVAL '8 days', now() - INTERVAL '1 hour');"
```

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | *dev server* di `http://localhost:5173` yang memperbarui halaman setiap kali kode disimpan (HMR). Portnya dikunci (`strictPort`): kalau 5173 sedang terpakai, Vite berhenti dengan galat, tidak pindah diam-diam ke 5174 |
| `npm run dev:hp` | sama dengan `npm run dev`, tetapi juga bisa dibuka perangkat lain di WiFi rumah (`vite --host`). Hanya untuk "mode HP", lihat di bawah |
| `npm run build` | memeriksa tipe TypeScript (`tsc -b`), lalu membuat versi siap pakai di folder `dist/`. Satu peringatan kuning `Some chunks are larger than 500 kB after minification` itu normal sejak Modul 23 (pustaka grafik Recharts membuat berkas JavaScript-nya besar); build tetap berhasil |
| `npm run preview` | menyajikan isi `dist/` di `http://localhost:5173` untuk dicoba (hentikan `npm run dev` dulu). Untuk HP: `npm run preview -- --host` |
| `npm run lint` | memeriksa kode dengan oxlint; bersih = tidak ada peringatan atau galat yang dicetak |

## Alamat backend (`.env.local`, tidak wajib)

Tanpa setelan apa pun, dashboard memanggil backend di nama host halaman + port `8080`: halaman `http://localhost:5173` → API `http://localhost:8080`, dan halaman `http://<IP-laptop>:5173` di HP → API `http://<IP-laptop>:8080`. Sambungan *live* (Socket.IO) memakai alamat yang sama. Kalau backend-mu di alamat lain, salin `.env.example` menjadi `.env.local`, isi `VITE_API_BASE` (misalnya `VITE_API_BASE=http://localhost:8081`), lalu jalankan ulang `npm run dev`. `.env.local` tidak ikut Git, dan untuk mode HP baris `VITE_API_BASE` harus tetap diberi `#`. Semua variabel `VITE_…` ikut tertanam di JavaScript yang dikirim ke browser, jadi isinya alamat saja, **tidak pernah** rahasia.

## Membuka dari HP (WiFi rumah)

HP dan laptop harus tersambung ke WiFi rumah yang sama (bukan WiFi tamu). Nyalakan "mode HP" hanya selama mencoba, di WiFi rumah yang kamu percaya, lalu kembalikan ke "mode laptop".

| Setelan | Mode laptop (bawaan) | Mode HP (sementara) |
| :--- | :--- | :--- |
| `HOST` di `backend/.env` | `127.0.0.1` | `0.0.0.0` (bukan alamat IP WiFi: dengan alamat IP, backend berhenti melayani `localhost`) |
| `CORS_ORIGIN` di `backend/.env` | `http://localhost:5173,http://127.0.0.1:5173` | ditambah `,http://<IP-laptop>:5173`. Satu baris ini berlaku untuk `fetch` dan Socket.IO sekaligus |
| Perintah Vite | `npm run dev` | `npm run dev:hp` |
| Alamat di browser | `http://localhost:5173` di laptop | `http://<IP-laptop>:5173` di HP |

1. Cari alamat IPv4 WiFi laptop: di Windows `ipconfig`, bagian `Wireless LAN adapter Wi-Fi`; di macOS `ipconfig getifaddr en0`. Abaikan alamat adaptor lain (vEthernet, Docker, VPN) yang juga dicetak Vite.
2. Ubah dua baris `backend/.env` di atas, lalu simpan (`npm run dev` di backend memulai ulang sendiri). Database tetap `127.0.0.1`: ia tidak ikut terbuka ke WiFi.
3. Di folder ini, jalankan `npm run dev:hp`. Kalau Windows bertanya, izinkan **Node.js JavaScript Runtime** hanya untuk jaringan **Private**.
4. Di HP, buka `http://<IP-laptop>:8080/health` dulu (harus menjawab), lalu `http://<IP-laptop>:5173`, dan masuk dengan akun **viewer**. *Login* di laptop tidak ikut ke HP: *cookie* melekat pada nama host (`localhost` dan alamat IP itu dua nama berbeda).
5. Selesai mencoba, dan selalu sebelum laptop dibawa ke jaringan lain: kembalikan `HOST` dan `CORS_ORIGIN`, lalu jalankan Vite lagi dengan `npm run dev`. Alamat IP bisa berubah besok (router membagikannya ulang); kalau HP tidak bisa membuka lagi, cari IP-nya lagi.

## Isi folder `src/`

| Berkas | Isinya |
| :--- | :--- |
| `main.tsx` | titik masuk dari templat: memasang `App` ke `<div id="root">` di dalam `StrictMode` |
| `App.tsx` | memeriksa *login* (`GET /auth/me`), menjaga sambungan *live* selama *login*, dan memilih satu layar dengan *state* biasa: *login*, daftar, detail, atau riwayat; tombol **Keluar** |
| `api.ts` | satu pintu ke backend: `fetch` dengan `credentials: "include"`, `GalatApi` yang tahu kode HTTP, *refresh* sekali saat dijawab 401, bacaan 5 menit terakhir, dan riwayat 1 jam / 24 jam / 7 hari |
| `soket.ts` | satu sambungan Socket.IO untuk seluruh dashboard (`withCredentials: true`), pemulihan sambungan, `ikuti`/`berhenti`, dan hook `useRealtime()` yang meneruskan acara `telemetry` dan `status` ke toko |
| `toko.ts` | toko Zustand: keadaan sambungan, daftar perangkat, status, bacaan terbaru, "terakhir dilihat", dan titik grafik 5 menit |
| `waktu.ts` | jam WIB, "… detik yang lalu" (date-fns), batas data basi, label sumbu waktu, dan detak satu detik (`useSekarang`) |
| `csv.ts` | menyusun dan mengunduh CSV di browser (titik koma, desimal koma, BOM) |
| `types.ts` | tipe data dari kontrak data 1.4 (Lampiran A), jawaban API, dan acara Socket.IO backend v1.0 |
| `components/Login.tsx` | formulir *login* minimal |
| `components/DaftarPerangkat.tsx` | `GET /devices` + data *live*: kartu perangkat merah/hijau dengan suhu terbaru dan "terakhir dilihat" |
| `components/DetailPerangkat.tsx` | semua sensor satu perangkat (Node 1 atau Node 2), grafik 5 menit, dan gauge; angkanya berubah sendiri |
| `components/GrafikLive.tsx` | grafik garis 5 menit terakhir (Suhu / Cahaya / Kelembapan) dengan celah yang jujur |
| `components/Gauge.tsx` | gauge setengah lingkaran 0-100 % (kelembapan tanah, air tandon) |
| `components/Riwayat.tsx` | layar riwayat: pemilih rentang, grafik, tabel, tombol **Unduh CSV**, dan lama memuat |
| `components/GrafikRiwayat.tsx` | grafik riwayat rata-rata (dan terendah-tertinggi untuk suhu) dengan celah yang jujur |
| `components/TabelRiwayat.tsx` | tabel riwayat terbaru dulu, 24 baris per halaman |
| `components/KartuSensor.tsx` | satu kartu sensor (label, angka, satuan) yang dipakai ulang |
| `components/Lencana.tsx` | lencana berwarna untuk `status` dan `kunci` |
| `components/LencanaKoneksi.tsx` | lencana sambungan di kepala: Live, Menyambung ulang…, atau Terputus |
| `components/TerakhirDilihat.tsx` | "terakhir dilihat … yang lalu" + tanda "data basi" |
| `components/Pemilih.tsx` | deretan tombol "pilih satu" yang dipakai grafik dan riwayat |
| `index.css` | `@import "tailwindcss";` (Tailwind CSS v4, tanpa `tailwind.config.js`) + warna grafik yang ikut mode gelap |

## *Login* dan keamanan

- Dashboard tidak menyimpan sandi atau token. Backend memasang dua *cookie* `HttpOnly; SameSite=Strict`: `akses` (15 menit) dan `sesi` (7 hari). JavaScript tidak bisa membacanya; browser yang mengirimkannya karena setiap `fetch` memakai `credentials: "include"` dan Socket.IO memakai `withCredentials: true`. Tidak ada apa pun yang disimpan di `localStorage`, termasuk pilihan tema.
- Kalau sebuah permintaan dijawab 401 (*cookie* `akses` sudah habis), `api.ts` memanggil `POST /auth/refresh` **sekali**, lalu mengulang permintaannya sekali. Kalau *refresh* juga gagal, layar kembali ke formulir *login*.
- Sambungan *live* diputus server setiap kali *cookie* `akses` habis (15 menit) dan saat *logout*. Dashboard lalu memanggil *refresh* dan menyambung lagi sendiri; kalau *refresh* ditolak (misalnya sudah *logout* di tab lain), layar kembali ke formulir *login*. Kalau backend sedang bermasalah (misalnya database mati) saat gelang perlu diperbarui, dashboard mencoba lagi; sesudah 3 kali gagal beruntun lencana menjadi **Terputus**, dan halaman perlu dimuat ulang sesudah backend pulih. Tombol **Keluar** memutus sambungan *live* lebih dulu, baru menghapus sesi.
- Data baru hanya datang lewat Socket.IO: tidak ada *polling*. `setInterval` hanya dipakai di `waktu.ts` untuk jam di layar.
- Nama dan lokasi perangkat ditampilkan sebagai teks JSX yang otomatis diloloskan React; dashboard tidak memakai `dangerouslySetInnerHTML`.

## Batasan v0.2

- **Tanpa kendali.** Lampu, kipas, pompa, dan tirai hanya ditampilkan. Tombol kendali, tampilan menurut peran, rute terproteksi, dan *logout* yang lebih lengkap menyusul di Modul 24. **Keluar** v0.2 memutus sambungan *live* dan menghapus sesi, tetapi data yang sudah dimuat tetap ada di memori tab sampai halaman dimuat ulang.
- **Hanya jaringan rumah, dan masih `http://` polos.** Mode HP di atas membuka dashboard dari perangkat lain di WiFi rumah; dari internet dengan HTTPS menyusul di Modul 27.
- **Riwayat ringkasan hanya empat besaran**: suhu (rata-rata, terendah, tertinggi), kelembapan udara, kelembapan tanah, dan cahaya. Tekanan udara, baterai, dan air tandon hanya tampil di kartu *live*. Rentangnya mengikuti nilai bawaan API: 1 jam (bacaan mentah), 24 jam (per 15 menit), dan 7 hari (per jam).
- **Grafik 5 menit hanya untuk perangkat yang mengirim tiap 10 detik** (Node 1 dan simulator). Node 2 mengirim tiap 5 menit, jadi grafiknya dilihat di layar riwayat.
- **Kiriman yang lewat selama sambungan putus tidak dikirim ulang server.** Begitu tersambung lagi, grafik 5 menit diisi ulang dari database; kartu diisi bacaan terakhir yang diingat backend (jawaban `ikuti`), atau tetap menampilkan angka lamanya beserta jamnya sampai kiriman berikutnya. Sesudah backend dinyalakan ulang, ingatan backend masih kosong: kartu Node 1 memakai bacaan terakhir dari database (5 menit terakhir; jamnya tertulis di "diperbarui pukul …"), tetapi keadaan lampu, kipas, pompa, dan tirai baru muncul di kiriman berikutnya karena tidak disimpan di database. Node 2 menulis "Belum ada bacaan" sampai mengirim lagi (tiap 5 menit). Perangkat yang belum terdaftar atau kuncinya dicabut tidak diikuti: kirimannya diabaikan backend (Modul 21).
- **Status yang berubah selama sambungan putus** (misalnya perangkat mati saat WiFi HP terputus) baru terlihat sesudah Daftar Perangkat dibuka lagi atau halaman dimuat ulang: server hanya mengirim status saat berubah, dan tidak mengulangnya untuk sambungan baru. Tanda "data basi" tetap muncul sesudah 30 detik tanpa kiriman (Node 2: 16 menit).
- **Mode gelap mengikuti setelan sistem** HP atau laptop; belum ada tombol terang/gelap.
- "Rapi di HP" diperiksa dengan mode perangkat DevTools (lebar 375 px), dan mode HP dicoba dengan membuka alamat IP WiFi laptop dari laptop itu sendiri; keduanya belum dicoba di HP sungguhan. Tailwind CSS v4 butuh browser yang cukup baru (Chrome 111+, Safari 16.4+, Firefox 128+).
