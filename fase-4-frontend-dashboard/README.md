# 🟪 Fase 4 — Frontend: Dashboard React Realtime (Modul 22–25)

🌐 **Bahasa Indonesia** · [English](../en/phase-4-frontend-dashboard/README.md)

> **Tujuan fase:** wajah produk — dashboard yang enak dipakai di HP maupun laptop, oleh orang yang tidak tahu apa itu MQTT. Dashboard dibangun di laptop dan mengambil datanya dari backend v1.0 buatan Fase 3. Untuk sementara ia masih dibuka lewat jaringan rumah; "bisa dibuka dari mana saja" menyusul di Modul 27.

Kerjakan modulnya **berurutan**. Satu modul = satu minggu (6–10 jam, dicicil). Klik judul modul untuk membuka artikelnya.

| Minggu | Modul | Perangkat keras | Alat yang dipasang di modul ini | Status |
| :---: | :--- | :--- | :--- | :--- |
| 22 | **[Modul 22 — HTML, CSS, & React (TypeScript) dari Nol untuk Dashboard IoT](modul-22-react-dasar/README.md)** | tidak wajib: data dari backend v1.0 di laptop beserta simulator perangkat Modul 21 (atau Kit A + B yang sudah menyala) | Vite 8.3.5 (template `react-ts` dari create-vite 9.3.1), React 19.3.1, Tailwind CSS 4.3.3 (`@tailwindcss/vite`), React DevTools | ✅ tersedia |
| 23 | Modul 23 — Dashboard Realtime: Grafik, Gauge, Riwayat, & Status | Kit A + B (atau simulator) | socket.io-client, Zustand, Recharts, date-fns | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-23--dashboard-realtime-grafik-gauge-riwayat--status) |
| 24 | Modul 24 — Kendali, Form Aturan, Peran, & Rute Terproteksi | Kit A + B (atau simulator) | React Router v7, react-hook-form, Zod (dipakai ulang dari backend) | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-24--kendali-form-aturan-peran--rute-terproteksi) |
| 25 | Modul 25 — Visualisasi Profesional: Grafana, Peta Perangkat, & Laporan | Kit A + B (atau simulator) | Grafana, react-leaflet | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-25--visualisasi-profesional-grafana-peta-perangkat--laporan) |

## 🎯 Tanda lulus Fase 4

Sebelum lanjut ke Fase 5, pastikan bukti-bukti ini sudah ada di repositori GitHub-mu ([Silabus §8](../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)):

1. Kuis setiap modul (5 soal) **≥ 4 benar**.
2. **Proyek checkpoint:** dashboard dipakai orang lain **tanpa dibantu**.
3. **Artefak:** video demo di HP dan tautan Grafana.

Modul 22 membuka fase ini: Rumah Pintar Mini mendapat wajah pertamanya. Kamu mulai dari dasar, yaitu membedah halaman sakelar Modul 10 dengan HTML (kerangka), CSS (kulit), dan JavaScript (otot) di DevTools browser. Sesudah itu kamu membangun **dashboard v0.1** di folder `frontend` dengan Vite, React, TypeScript, dan Tailwind CSS v4. Dashboard ini *login* dengan *cookie* dari Modul 20, menampilkan daftar perangkat beserta lencana kuncinya dari Modul 21, lalu membuka bacaan terbaru semua sensor setiap perangkat. Tampilannya tetap rapi di layar HP. Data diambil sekali saat layar dibuka; angka yang bergerak sendiri menyusul di Modul 23.

## 📂 Isi setiap folder modul

| Isi | Gunanya |
| :--- | :--- |
| `README.md` | Artikel modulnya — mulai membaca dari sini. GitHub menampilkannya otomatis saat kamu membuka folder modul. |
| `kode/` | Kode setiap tahap praktik, siap dibandingkan dengan milikmu. Di Modul 22: `pemanasan/`, `kemenangan-cepat/`, `praktik-1/` (halaman Modul 10 yang dibedah, beserta latihan tambahannya), `tahap/praktik-2` sampai `praktik-7` (keadaan `frontend` di akhir setiap praktik), `frontend/` (dashboard v0.1, keadaan akhir), `.github/` (templat *pull request*), dan `tantangan/kunci/`. File `.env` tidak pernah disertakan: salin `.env.example`, lalu isi milikmu sendiri. |
| `aset/` | Gambar-gambar artikel, beserta `SUMBER.md` yang mencatat sumber dan lisensi setiap gambar. |

---

[⬅️ Fase 3 — Backend & Data](../fase-3-backend-data/README.md) · [Halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md) · **Mulai: [Modul 22](modul-22-react-dasar/README.md) ➡️**
