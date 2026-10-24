# Frontend Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../../../en/phase-4-frontend-dashboard/module-22-react-basics/code/frontend/README.md)

Dashboard v0.1 proyek Rumah Pintar Mini: halaman web React 19 + TypeScript dengan Tailwind CSS v4, dibuat dengan Vite 8 (templat `react-ts` dari create-vite 9.3.1). Dashboard *login* dengan akun Modul 20, lalu menampilkan daftar perangkat (dengan lencana `status` dan `kunci` Modul 21) dan bacaan terbaru semua sensor setiap perangkat dari backend v1.0, rapi di HP dan laptop. Data *live*, grafik, dan tombol kendali belum ada; semuanya menyusul di Modul 23–24.

## Menjalankan

1. Pasang Node.js 24 LTS (Vite 8 butuh minimal Node.js 20.19 atau 22.12).
2. Nyalakan backend v1.0 seperti di `backend/README.md` (kontainer database `rumahpintar-db` di Docker Desktop dan broker MQTT sudah menyala, lalu `npm run dev` di folder `backend`) beserta sumber datanya: Node 1 dan Node 2 (Kit A + B), atau simulator perangkat Modul 21 di folder `alat` dengan perangkat latihan `f00d00000001` yang sudah terdaftar. `CORS_ORIGIN` di `backend/.env` harus memuat `http://localhost:5173` (nilai bawaannya sudah memuatnya).
3. Di folder ini, jalankan `npm install`.
4. Jalankan `npm run dev`, lalu buka **`http://localhost:5173`** di Chrome atau Edge. Pakai `localhost`, bukan `127.0.0.1`: di Windows, Vite hanya mendengar di `localhost`, dan nama host halaman harus sama dengan nama host API supaya *cookie* login ikut terkirim.
5. Masuk dengan akun yang dibuat di Modul 20: `viewer@rumah.test` (hanya melihat) atau `admin@rumah.test`. Sandinya milikmu sendiri; dashboard tidak pernah menyimpannya.

| Perintah | Gunanya |
| :--- | :--- |
| `npm run dev` | *dev server* di `http://localhost:5173` yang memperbarui halaman setiap kali kode disimpan (HMR). Portnya dikunci (`strictPort`): kalau 5173 sedang terpakai, Vite berhenti dengan galat, tidak pindah diam-diam ke 5174 |
| `npm run build` | memeriksa tipe TypeScript (`tsc -b`), lalu membuat versi siap pakai di folder `dist/` |
| `npm run preview` | menyajikan isi `dist/` di `http://localhost:5173` untuk dicoba (hentikan `npm run dev` dulu) |
| `npm run lint` | memeriksa kode dengan oxlint; bersih = tidak ada peringatan atau galat yang dicetak |

## Alamat backend (`.env.local`, tidak wajib)

Tanpa setelan apa pun, dashboard memanggil backend di nama host halaman + port `8080`: halaman `http://localhost:5173` → API `http://localhost:8080`. Kalau backend-mu di alamat lain, salin `.env.example` menjadi `.env.local`, isi `VITE_API_BASE` (misalnya `VITE_API_BASE=http://localhost:8081`), lalu jalankan ulang `npm run dev`. `.env.local` tidak ikut Git. Semua variabel `VITE_…` ikut tertanam di JavaScript yang dikirim ke browser, jadi isinya alamat saja, **tidak pernah** rahasia.

## Isi folder `src/`

| Berkas | Isinya |
| :--- | :--- |
| `main.tsx` | titik masuk dari templat: memasang `App` ke `<div id="root">` di dalam `StrictMode` |
| `App.tsx` | memeriksa *login* (`GET /auth/me`), lalu memilih satu dari tiga layar dengan *state* biasa: *login*, daftar perangkat, atau detail perangkat; tombol **Keluar** |
| `api.ts` | satu pintu ke backend: `fetch` dengan `credentials: "include"`, `GalatApi` yang tahu kode HTTP, dan *refresh* sekali saat dijawab 401 |
| `types.ts` | tipe data dari kontrak data 1.4 (Lampiran A) dan dari jawaban API backend v1.0 |
| `components/Login.tsx` | formulir *login* minimal |
| `components/DaftarPerangkat.tsx` | `GET /devices`: kartu perangkat dengan lencana `status` dan `kunci` |
| `components/DetailPerangkat.tsx` | `GET /devices/:id/latest`: bacaan terbaru semua sensor Node 1 atau Node 2, dengan jam WIB |
| `components/KartuSensor.tsx` | satu kartu sensor (label, angka, satuan) yang dipakai ulang |
| `components/Lencana.tsx` | lencana berwarna untuk `status` dan `kunci` |
| `index.css` | `@import "tailwindcss";` (Tailwind CSS v4, tanpa `tailwind.config.js`) |

## *Login* dan keamanan

- Dashboard tidak menyimpan sandi atau token. Backend memasang dua *cookie* `HttpOnly; SameSite=Strict`: `akses` (15 menit) dan `sesi` (7 hari). JavaScript tidak bisa membacanya; browser yang mengirimkannya karena setiap `fetch` memakai `credentials: "include"`. Tidak ada apa pun yang disimpan di `localStorage`.
- Kalau sebuah permintaan dijawab 401 (*cookie* `akses` sudah habis), `api.ts` memanggil `POST /auth/refresh` **sekali**, lalu mengulang permintaannya sekali. Kalau *refresh* juga gagal, layar kembali ke formulir *login*.
- Nama dan lokasi perangkat ditampilkan sebagai teks JSX yang otomatis diloloskan React; dashboard tidak memakai `dangerouslySetInnerHTML`.

## Batasan v0.1

- **Statis.** Bacaan diambil sekali saat layarnya dibuka. Untuk angka yang lebih baru, kembali ke daftar lalu buka lagi perangkatnya. Data *live*, grafik, dan riwayat menyusul di Modul 23.
- **Tanpa kendali.** Lampu dan kipas hanya ditampilkan. Tombol kendali, tampilan menurut peran, rute terproteksi, dan *logout* yang lebih lengkap menyusul di Modul 24.
- **Hanya jaringan rumah, dan untuk sekarang hanya laptop ini.** Backend mendengar di `127.0.0.1` dan Vite di `localhost`, jadi dashboard hanya bisa dibuka dari laptop yang menjalankannya. Membukanya dari HP lewat WiFi rumah menyusul di Modul 23; dari internet di Modul 27.
- **Bacaan terbaru dari memori backend.** Sesudah backend dinyalakan ulang, detail perangkat menulis "Belum ada bacaan" sampai perangkat itu mengirim lagi (Node 1: tiap 10 detik). Perangkat yang belum terdaftar atau kuncinya dicabut tidak pernah mendapat bacaan baru: kirimannya diabaikan backend (Modul 21).
- "Rapi di HP" diperiksa dengan mode perangkat DevTools (lebar 375 px), belum di HP sungguhan. Tailwind CSS v4 butuh browser yang cukup baru (Chrome 111+, Safari 16.4+, Firefox 128+).
