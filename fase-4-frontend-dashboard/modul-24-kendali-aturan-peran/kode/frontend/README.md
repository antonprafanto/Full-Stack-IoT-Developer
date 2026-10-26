# Frontend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../en/mini-smart-home/frontend/README.md)

Dashboard v1.0 proyek Rumah Pintar Mini: halaman web React 19 + TypeScript dengan Tailwind CSS v4, dibuat dengan Vite 8 (templat `react-ts` dari create-vite 9.3.1). Setiap layar punya alamat sendiri (React Router v8, mode deklaratif), dan layar di balik *login* dijaga rute terproteksi. Dashboard menampilkan data *live* dari backend lewat Socket.IO (daftar perangkat, detail dengan grafik 5 menit dan gauge, riwayat 1 jam / 24 jam / 7 hari dengan tabel dan CSV), dan sejak Modul 24 juga **mengendalikan** perangkat: akun admin menyalakan lampu dan kipas dengan status "Menunggu konfirmasi perangkat…", menyiram dengan pompa, serta membuat, mengubah, menonaktifkan, dan menghapus aturan otomatis lewat formulir yang diperiksa skema Zod yang sama dengan backend. Akun viewer melihat semua data tanpa tombol kendali. Kejadian penting (aturan bertindak, perangkat terputus) muncul sebagai *toast*. Tampilannya dirancang rapi di HP dan laptop, mengikuti mode gelap sistem, dan bisa dibuka dari HP di WiFi rumah (lihat "Batasan v1.0").

## Menjalankan

1. Pasang Node.js 24 LTS (Vite 8 butuh minimal Node.js 20.19 atau 22.12; React Router 8 butuh Node.js 22.22 atau lebih baru).
2. Nyalakan **backend v1.1** seperti di `backend/README.md` (kontainer database `rumahpintar-db` di Docker Desktop dan broker MQTT sudah menyala, lalu `npm run dev` di folder `backend`) beserta sumber datanya: Node 1 dan Node 2 (Kit A + B), atau simulator perangkat di folder `alat` dengan perangkat latihan `f00d00000001` yang sudah terdaftar. Dashboard v1.0 butuh backend 1.1: aturan "turun di bawah" (misalnya siram jika tanah < 30 %) dan tombol **Hapus aturan** tidak ada di backend v1.0. `CORS_ORIGIN` di `backend/.env` harus memuat `http://localhost:5173` (nilai bawaannya sudah memuatnya).
3. Di folder ini, jalankan `npm install`.
4. Jalankan `npm run dev`, lalu buka **`http://localhost:5173`** di Chrome atau Edge. Pakai `localhost`, bukan `127.0.0.1`: di Windows, Vite hanya mendengar di `localhost`, dan nama host halaman harus sama dengan nama host API supaya *cookie* login ikut terkirim.
5. Masuk dengan akun yang dibuat di Modul 20: `admin@rumah.test` (melihat dan mengendalikan) atau `viewer@rumah.test` (hanya melihat). Sandinya milikmu sendiri; dashboard tidak pernah menyimpannya.

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
| `npm run cek-skema` | memeriksa bahwa salinan skema di `src/skema/` sama persis dengan aslinya di `../backend/src/schemas/` (lihat "Salinan skema"). Hasil yang benar: dua baris `SAMA` |

Paket yang ditambahkan di Modul 24 dipasang dengan versi tertulis: `npm install react-router@8.5.0 react-hook-form@7.91.0 @hookform/resolvers@5.9.2 zod@4.6.7`. Perintah tanpa versi bisa gagal (`npm error code ERESOLVE`, karena `@hookform/resolvers` 6.0.0); jangan memakai `--legacy-peer-deps`.

## Peta rute

Semua alamat ada di satu tempat: `<Routes>` di `src/App.tsx`. Alamat halaman sengaja berbahasa Indonesia supaya tidak tertukar dengan alamat API backend (`/auth`, `/devices`, `/rules`). `npm run dev` dan `npm run preview` menyajikan `index.html` untuk alamat mana pun, jadi **F5** dan tautan langsung ke `/perangkat/f00d00000001` tetap jalan; server lain (Modul 26–27) butuh aturan yang sama ("semua alamat → `index.html`").

| Alamat | Layar | Siapa |
| :--- | :--- | :--- |
| `/masuk` | formulir masuk (react-hook-form + Zod) | tamu; yang sudah masuk langsung dipindah ke layar tujuannya |
| `/` | dialihkan ke `/perangkat` | yang sudah masuk |
| `/perangkat` | daftar perangkat *live* | admin & viewer |
| `/perangkat/:id` | detail, grafik 5 menit, gauge; bagian **Kendali** hanya untuk admin | admin & viewer |
| `/perangkat/:id/riwayat` | riwayat, tabel, **Unduh CSV** | admin & viewer |
| `/aturan` | daftar aturan otomatis dalam kalimat biasa; tombol **+ Aturan baru** dan **Ubah** hanya untuk admin | admin & viewer |
| `/aturan/baru`, `/aturan/:id` | formulir aturan (buat, ubah, nonaktifkan, hapus) | admin; viewer melihat layar "Khusus admin" |
| alamat lain | "Halaman tidak ditemukan" + tautan ke daftar perangkat | semua |

Layar yang dibuka tanpa *login* (misalnya tautan `/perangkat/f00d00000001/riwayat` di jendela privat) dipindah ke `/masuk`; sesudah masuk, dashboard kembali ke layar tadi. Sesudah tombol **Keluar**, orang berikutnya selalu mulai dari `/perangkat`.

## Peran: admin dan viewer

- Peran dibaca dari jawaban `GET /auth/me` dan `POST /auth/login`, lalu hanya disimpan di memori tab (toko Zustand), tidak pernah di `localStorage`.
- Tombol kendali, **+ Aturan baru**, dan **Ubah** baru digambar sesudah peran admin **pasti** (`useAdmin()` di `toko.ts`), jadi tidak sempat berkedip di layar viewer.
- Menyembunyikan tombol hanya kenyamanan layar, **bukan pengaman**. Yang menjaga tetap satpam backend: setiap perintah dan perubahan dari akun viewer dijawab `403 akun viewer hanya boleh melihat; perintah dan perubahan khusus admin`, dari dashboard, Bruno, atau jalan lain.
- Peran yang diubah lewat `npm run pengguna` di backend baru terlihat sesudah halaman dimuat ulang atau gelang akses (15 menit) diperbarui.

## Tombol kendali

- **Lampu dan kipas** (`components/TombolSakelar.tsx`): begitu diketuk, tombol langsung berganti (*optimistic UI*, `useOptimistic` + `useTransition` React 19) dan menulis "Menunggu konfirmasi perangkat…" sampai backend meneruskan jawaban perangkat (*ack*, paling lama 5 detik). Keadaan akhirnya diambil dari *ack*. Kalau perintahnya gagal, tombol kembali sendiri ke keadaan yang dilaporkan perangkat, dan *toast* menjelaskan sebabnya: perangkat menolak (`ack.ok` `false`), 409 (perangkat offline, perintah sebelumnya masih menunggu), 503, server tidak menjawab. Jawaban **504** berarti "belum dikonfirmasi perangkat; server akan mencoba lagi saat perangkat terdengar": perintah lampu dan kipas TIDAK batal, jadi lampu bisa menyala sendiri beberapa saat kemudian.
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

Tanpa setelan apa pun, dashboard memanggil backend di nama host halaman + port `8080`: halaman `http://localhost:5173` → API `http://localhost:8080`, dan halaman `http://<IP-laptop>:5173` di HP → API `http://<IP-laptop>:8080`. Sambungan *live* (Socket.IO) memakai alamat yang sama. Kalau backend-mu di alamat lain, salin `.env.example` menjadi `.env.local`, isi `VITE_API_BASE` (misalnya `VITE_API_BASE=http://localhost:8081`), lalu jalankan ulang `npm run dev`. `.env.local` tidak ikut Git, dan untuk mode HP baris `VITE_API_BASE` harus tetap diberi `#`. Semua variabel `VITE_…` ikut tertanam di JavaScript yang dikirim ke browser, jadi isinya alamat saja, **tidak pernah** rahasia.

## Membuka dari HP (WiFi rumah)

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

**Tambahkan ke layar utama.** Dashboard bisa dijadikan pintasan di layar utama HP (Chrome Android: menu ⋮ → **Install and create shortcut** → **Create shortcut**; iPhone: Bagikan → **Add to Home Screen**). Untuk iPhone, `index.html` memasang ikon `public/apple-touch-icon.png` (180 × 180 px: gambar garis rumah sederhana di atas latar terang penuh, dibuat sendiri dari SVG) dan nama pendek "Rumah Pintar". Ini hanya pintasan ke `http://<IP-laptop>:5173`, bukan aplikasi terpasang: PWA butuh HTTPS (Modul 27), dan pintasannya rusak kalau IP laptop berubah.

## Isi folder `src/`

| Berkas | Isinya |
| :--- | :--- |
| `main.tsx` | titik masuk: memasang `App` di dalam `StrictMode` dan `<BrowserRouter>` |
| `App.tsx` | memeriksa *login* sekali (`GET /auth/me`), menjaga sambungan *live* sekali (di atas `<Routes>`, jadi pindah layar tidak memutusnya), dan peta rute di satu tempat |
| `api.ts` | satu pintu ke backend: `fetch` dengan `credentials: "include"`, `GalatApi` yang tahu kode HTTP, *refresh* sekali saat dijawab 401, bacaan dan riwayat, `kirimPerintah()` (+ `Ack.safeParse`), `ambilAturan()` (+ `safeParse`), `buatAturan()`, `ubahAturan()`, `hapusAturan()` |
| `soket.ts` | satu sambungan Socket.IO (`withCredentials: true`), pemulihan sambungan, `ikuti`/`berhenti`, hook `useRealtime()`; acara `kejadian` → *toast*; daftar perangkat diambil ulang setiap kali sambungan PULIH (status yang berubah selama putus) |
| `toko.ts` | toko Zustand: sesi dan peran (`useAdmin()`), sambungan, daftar perangkat, status, bacaan terbaru, "terakhir dilihat", titik grafik 5 menit, `terapkanKeadaan()` dari *ack*, `kosongkanSemua()`, `sesiHabis()` |
| `toast.ts` | toko *toast* kecil: `toast(pesan, jenis)`, paling banyak 2, hilang sesudah 4 detik |
| `aturan.ts` | bentuk jawaban `GET /rules`, `uraikanAturan()` (aturan → kalimat), isi bawaan formulir, pilihan perangkat, peta pesan ramah, dan pembaca galat 400 backend |
| `kolom.tsx` | pembantu kolom formulir aturan: gaya kotak dan label, id kolom, `useKolom()` (pesan galat + `aria-invalid`/`aria-describedby`) |
| `skema/` | `kontrak.ts` dan `aturan-dasar.ts` = salinan identik dari backend; `masuk.ts` = skema formulir Masuk; `README.md` |
| `waktu.ts` | jam WIB, "… detik yang lalu" (date-fns), batas data basi, label sumbu waktu, dan detak satu detik (`useSekarang`) |
| `csv.ts` | menyusun dan mengunduh CSV di browser (titik koma, desimal koma, BOM) |
| `types.ts` | tipe data dari kontrak data 1.4 (Lampiran A), jawaban API, dan acara Socket.IO |
| `halaman/` | satu berkas pembungkus tipis per layar: `Masuk`, `Daftar`, `Detail`, `Riwayat`, `Aturan`, `FormAturan`, `TidakDitemukan`. Layar yang memakai `:id` mencari datanya sendiri dari alamat |
| `components/JagaMasuk.tsx` | penjaga rute: "Memeriksa sesi…", pindah ke `/masuk` (membawa alamat tujuan), atau `<Outlet />` |
| `components/KhususAdmin.tsx` | penjaga kedua: layar "Khusus admin" untuk akun *viewer*, atau `<Outlet />` untuk admin |
| `components/TataLetak.tsx` | bingkai sesudah masuk: kepala (lencana sambungan, menu **Perangkat** / **Aturan**, nama + peran, **Keluar**), wadah *toast* (dan ruang kosong di bawah isi untuknya), mengambil daftar perangkat sekali, `<Outlet />` |
| `components/TombolSakelar.tsx`, `components/TombolPompa.tsx` | tombol kendali (lihat "Tombol kendali") |
| `components/WadahToast.tsx` | tempat *toast* tampil: di bawah layar HP dan tablet, di pojok kanan atas layar 1280 px ke atas |
| `components/DaftarAturan.tsx`, `components/FormAturan.tsx` | daftar aturan dalam kalimat dan formulir aturan (isian, simpan, hapus, pratinjau) |
| `components/BagianKapan.tsx`, `components/BagianLalu.tsx`, `components/KonfirmasiHapus.tsx` | bagian formulir aturan: **Kapan?**, **Lalu?** (+ Telegram dan **Aktif**), dan tombol **Hapus aturan** dengan kotak "yakin?"-nya |
| `components/DaftarPerangkat.tsx` | kartu perangkat merah/hijau dengan suhu terbaru dan "terakhir dilihat"; setiap kartu tautan ke `/perangkat/<id>` |
| `components/DetailPerangkat.tsx` | semua sensor satu perangkat (Node 1 atau Node 2), bagian **Kendali** (admin), grafik 5 menit, dan gauge |
| `components/GrafikLive.tsx`, `Gauge.tsx`, `Riwayat.tsx`, `GrafikRiwayat.tsx`, `TabelRiwayat.tsx`, `KartuSensor.tsx`, `Lencana.tsx`, `LencanaKoneksi.tsx`, `TerakhirDilihat.tsx`, `Pemilih.tsx` | komponen Modul 22–23 (grafik, gauge, riwayat, kartu, lencana) |
| `index.css` | `@import "tailwindcss";` (Tailwind CSS v4, tanpa `tailwind.config.js`) + warna grafik yang ikut mode gelap |

## *Login* dan keamanan

- Dashboard tidak menyimpan sandi, token, atau peran. Backend memasang dua *cookie* `HttpOnly; SameSite=Strict`: `akses` (15 menit) dan `sesi` (7 hari). JavaScript tidak bisa membacanya; browser yang mengirimkannya karena setiap `fetch` memakai `credentials: "include"` dan Socket.IO memakai `withCredentials: true`. Tidak ada apa pun yang disimpan di `localStorage`.
- Kalau sebuah permintaan dijawab 401 (*cookie* `akses` sudah habis), `api.ts` memanggil `POST /auth/refresh` **sekali**, lalu mengulang permintaannya sekali. Kalau *refresh* juga gagal, toko dikosongkan dan layar pindah ke `/masuk`.
- Permintaan tanpa isi (`POST /auth/logout`, `POST /auth/refresh`, `DELETE /rules/:id`) dikirim TANPA kepala `Content-Type: application/json`: backend menolak permintaan yang mengaku membawa JSON tetapi isinya kosong (400).
- Sambungan *live* diputus server setiap kali *cookie* `akses` habis (15 menit) dan saat *logout*. Dashboard lalu memanggil *refresh* dan menyambung lagi sendiri; kalau *refresh* ditolak (misalnya sudah *logout* di tab lain), layar pindah ke `/masuk`. Sesudah 3 kali gagal beruntun lencana menjadi **Terputus**, dan halaman perlu dimuat ulang sesudah backend pulih.
- Data baru hanya datang lewat Socket.IO: tidak ada *polling*. `setInterval` hanya dipakai di `waktu.ts` untuk jam di layar.
- Nama perangkat, nama aturan, dan kalimat kejadian ditampilkan sebagai teks JSX yang otomatis diloloskan React; dashboard tidak memakai `dangerouslySetInnerHTML`.

## Batasan v1.0

- **Hanya jaringan rumah, dan masih `http://` polos.** Mode HP di atas membuka dashboard dari perangkat lain di WiFi rumah; sandi (juga sandi admin) lewat tanpa enkripsi. Akses dari internet dengan HTTPS, dan aplikasi terpasang (PWA), menyusul di Modul 27.
- **Menyembunyikan tombol bukan pengaman.** Peran di layar hanya kenyamanan; satpam backend (403) yang menjaga. Peran yang diubah baru terlihat sesudah muat ulang atau ≤ 15 menit.
- **Hanya sebagian jawaban API yang diperiksa Zod**: *ack* perintah dan daftar aturan. Jawaban lain (perangkat, bacaan, riwayat, acara Socket.IO) tetap dipercaya lewat tipe TypeScript.
- **Sesudah 504, tampilan kembali ke keadaan terlapor**, padahal backend masih akan mengirim ulang perintah lampu atau kipas saat perangkat terdengar lagi; dashboard tidak menampilkan perintah yang masih tertunda.
- **Tirai belum punya tombol**, dan jadwal aturan diisi sebagai teks cron 5 bidang (dengan tiga contoh siap klik), belum dengan pemilih jam dan hari.
- **Riwayat ringkasan hanya empat besaran**: suhu (rata-rata, terendah, tertinggi), kelembapan udara, kelembapan tanah, dan cahaya. Tekanan udara, baterai, dan air tandon hanya tampil di kartu *live*. Rentangnya mengikuti nilai bawaan API: 1 jam (bacaan mentah), 24 jam (per 15 menit), dan 7 hari (per jam).
- **Grafik 5 menit hanya untuk perangkat yang mengirim tiap 10 detik** (Node 1 dan simulator). Node 2 mengirim tiap 5 menit, jadi grafiknya dilihat di layar riwayat.
- **Kiriman yang lewat selama sambungan putus tidak dikirim ulang server.** Begitu tersambung lagi, grafik 5 menit diisi ulang dari database, daftar perangkat (dan statusnya) diambil ulang, dan kartu diisi bacaan terakhir yang diingat backend. Sesudah backend dinyalakan ulang, keadaan lampu, kipas, pompa, dan tirai baru muncul di kiriman berikutnya karena tidak disimpan di database; sampai saat itu tombol kendali belum tampil.
- **Mode gelap mengikuti setelan sistem** HP atau laptop; belum ada tombol terang/gelap.
- "Rapi di HP" diperiksa dengan mode perangkat DevTools (lebar 375 px, HP tegak), dan mode HP dicoba dengan membuka alamat IP WiFi laptop dari laptop itu sendiri; pemakaian oleh orang lain dari HP sungguhan dan pintasan layar utama belum dicoba penulis. Tailwind CSS v4 butuh browser yang cukup baru (Chrome 111+, Safari 16.4+, Firefox 128+).
