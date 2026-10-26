# 🟪 Fase 4 — Frontend: Dashboard React Realtime (Modul 22–25)

🌐 **Bahasa Indonesia** · [English](../en/phase-4-frontend-dashboard/README.md)

> **Tujuan fase:** wajah produk — dashboard yang enak dipakai di HP maupun laptop, oleh orang yang tidak tahu apa itu MQTT. Dashboard dibangun di laptop dan mengambil datanya dari backend v1.0 buatan Fase 3. Untuk sementara ia masih dibuka lewat jaringan rumah; "bisa dibuka dari mana saja" menyusul di Modul 27.

Kerjakan modulnya **berurutan**. Satu modul = satu minggu (6–10 jam, dicicil). Klik judul modul untuk membuka artikelnya.

| Minggu | Modul | Perangkat keras | Alat yang dipasang di modul ini | Status |
| :---: | :--- | :--- | :--- | :--- |
| 22 | **[Modul 22 — HTML, CSS, & React (TypeScript) dari Nol untuk Dashboard IoT](modul-22-react-dasar/README.md)** | tidak wajib: data dari backend v1.0 di laptop beserta simulator perangkat Modul 21 (atau Kit A + B yang sudah menyala) | Vite 8.3.5 (template `react-ts` dari create-vite 9.3.1), React 19.3.1, Tailwind CSS 4.3.3 (`@tailwindcss/vite`), React DevTools | ✅ tersedia |
| 23 | **[Modul 23 — Dashboard Realtime: Grafik, Gauge, Riwayat, & Status](modul-23-dashboard-realtime/README.md)** | Kit A + B, atau backend v1.0 di laptop beserta simulator perangkat Modul 21; ditambah HP di WiFi rumah yang sama (pilihan) | socket.io-client 4.8.4, Zustand 5.0.16, Recharts 3.10.1, date-fns 4.4.0 | ✅ tersedia |
| 24 | **[Modul 24 — Kendali, Form Aturan, Peran, & Rute Terproteksi](modul-24-kendali-aturan-peran/README.md)** | Kit A + B, atau backend di laptop (v1.0, naik ke 1.1 di Praktik 6) beserta simulator perangkat Modul 21; ditambah HP di WiFi rumah yang sama dan satu orang penguji | React Router 8.5.0, react-hook-form 7.91.0, @hookform/resolvers 5.9.2, Zod 4.6.7 (sama dengan backend) | ✅ tersedia |
| 25 | Modul 25 — Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan | Kit A + B (atau simulator) | Grafana, react-leaflet | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-25--visualisasi-profesional-grafana-peta-perangkat--laporan) |

## 🎯 Tanda lulus Fase 4

Sebelum lanjut ke Fase 5, pastikan bukti-bukti ini sudah ada di repositori GitHub-mu ([Silabus §8](../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)):

1. Kuis setiap modul (5 soal) **≥ 4 benar**.
2. **Proyek checkpoint:** dashboard dipakai orang lain **tanpa dibantu**.
3. **Artefak:** video demo di HP dan tautan Grafana.

Modul 22 membuka fase ini: Rumah Pintar Mini mendapat wajah pertamanya. Kamu mulai dari dasar, yaitu membedah halaman sakelar Modul 10 dengan HTML (kerangka), CSS (kulit), dan JavaScript (otot) di DevTools browser. Sesudah itu kamu membangun **dashboard v0.1** di folder `frontend` dengan Vite, React, TypeScript, dan Tailwind CSS v4. Dashboard ini *login* dengan *cookie* dari Modul 20, menampilkan daftar perangkat beserta lencana kuncinya dari Modul 21, lalu membuka bacaan terbaru semua sensor setiap perangkat. Tampilannya tetap rapi di layar HP. Data diambil sekali saat layar dibuka; angka yang bergerak sendiri menyusul di Modul 23.

Modul 23 membuat wajah itu hidup. Dashboard tidak lagi bertanya sekali: backend **mendorong** setiap bacaan baru lewat satu soket Socket.IO yang berkunci *cookie* yang sama, dan toko Zustand membagikannya ke semua layar. Kartu perangkat kini merah atau hijau dengan keterangan "terakhir dilihat", detail perangkat mendapat grafik garis 5 menit dan *gauge*, dan layar Riwayat menampilkan 1 jam, 24 jam, atau 7 hari dari ember TimescaleDB lengkap dengan tabel berhalaman dan ekspor CSV. Kamu juga belajar memilih visual yang jujur, mengukur gambar ulang dengan React DevTools, mengaktifkan mode gelap, dan membuka dashboard dari HP lewat WiFi rumah, lalu mengembalikannya ke mode laptop.

Modul 24 membuat dashboard itu bisa **memerintah**, bukan hanya melihat. Setiap layar kini punya alamat sendiri, jadi **Back**, **F5**, dan tautan langsung bekerja; penjaga di depan pintu halaman mengantar orang yang belum masuk ke layar Masuk. Akun admin menyalakan lampu dan kipas dengan tombol yang langsung berganti sambil menunggu konfirmasi perangkat dan mundur sendiri kalau gagal, sedangkan akun viewer tidak melihat satu tombol kendali pun (backend tetap menolak perintahnya). Backend naik ke 1.1 supaya aturan seperti "siram jika tanah < 30 %" bisa dibuat dari formulir yang diperiksa skema Zod yang sama dengan backend. Kejadian penting, misalnya aturan yang menyala atau perangkat yang terputus, kini muncul sebagai kabar singkat di layar (*toast*). Di akhir minggu, kamu memeriksa aksesibilitas dasarnya, lalu orang lain mencoba dashboard-mu dari HP-nya lewat WiFi rumah tanpa dibantu.

## 📂 Isi setiap folder modul

| Isi | Gunanya |
| :--- | :--- |
| `README.md` | Artikel modulnya — mulai membaca dari sini. GitHub menampilkannya otomatis saat kamu membuka folder modul. |
| `kode/` | Kode setiap tahap praktik, siap dibandingkan dengan milikmu. Di Modul 22: `pemanasan/`, `kemenangan-cepat/`, `praktik-1/` (halaman Modul 10 yang dibedah, beserta latihan tambahannya), `tahap/praktik-2` sampai `praktik-7` (keadaan `frontend` di akhir setiap praktik), `frontend/` (dashboard v0.1, keadaan akhir), `.github/` (templat *pull request*), dan `tantangan/kunci/`. Di Modul 23: `pemanasan/`, `kemenangan-cepat/` (`coba-live.html`), `tahap/praktik-1` sampai `praktik-10` (keadaan `frontend` di akhir setiap praktik), `praktik-6/` (berkas uji sementara Praktik 6), `frontend/` (dashboard v0.2, keadaan akhir), `.github/` (templat *pull request*), dan `tantangan/kunci/`. Di Modul 24: `pemanasan/`, `kemenangan-cepat/` (`TombolPertama.tsx` dan `DetailPerangkat.tsx` yang memasangnya), `tahap/praktik-1` sampai `praktik-10` tanpa `praktik-6` (keadaan `frontend` di akhir setiap praktik; Praktik 6 hanya mengubah backend dan simulator), `backend/` (backend 1.1.0, keadaan akhir) beserta `backend-1.1.diff` (perubahannya dari v1.0), `alat/` (simulator dengan perintah `tanah` dan `tandon`) beserta `alat.diff`, `frontend/` (dashboard v1.0, keadaan akhir), `uji-pengguna/` (lembar tugas dan lembar catatan uji pengguna), `.github/` (templat *pull request*), dan `tantangan/kunci/`. File `.env` tidak pernah disertakan: salin `.env.example`, lalu isi milikmu sendiri. |
| `aset/` | Gambar-gambar artikel, beserta `SUMBER.md` yang mencatat sumber dan lisensi setiap gambar. |

---

[⬅️ Fase 3 — Backend & Data](../fase-3-backend-data/README.md) · [Halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md) · **Mulai: [Modul 22](modul-22-react-dasar/README.md) ➡️**
