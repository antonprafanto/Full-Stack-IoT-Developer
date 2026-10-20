# 🟩 Fase 3 — Backend & Data: Node.js/TypeScript + PostgreSQL (Modul 16–21)

🌐 **Bahasa Indonesia** · [English](../en/phase-3-backend-data/README.md)

> **Tujuan fase:** "kantor pusat" yang mengingat semuanya, mengambil keputusan, dan punya kunci pintu. **Backend dan database dikembangkan di laptop**, sedangkan Raspberry Pi tetap menjadi broker yang menyala 24 jam. Mengunci jalur komunikasi dengan TLS/HTTPS dan memasang semuanya di internet adalah urusan Fase 5. Setiap modul fase ini dimulai dengan **pemanasan ulang JavaScript** sekitar satu jam.

Kerjakan modulnya **berurutan**. Satu modul = satu minggu (6–10 jam, dicicil). Klik judul modul untuk membuka artikelnya.

| Minggu | Modul | Perangkat keras | Alat yang dipasang di modul ini | Status |
| :---: | :--- | :--- | :--- | :--- |
| 16 | **[Modul 16 — Backend Pertama dengan TypeScript Ringan: Menerima Data, API, & Git untuk Tim](modul-16-backend-typescript-api-git/README.md)** | Kit A + B dari Fase 2 (Node 1, Node 2, gateway Pi), atau laptop saja dengan simulator 10 perangkat | Fastify 5.12.7, Zod 4.6.7, mqtt.js 5.16.1, TypeScript 7.0.2 (pemeriksa tipe), Bruno 4.2.1, Git 2.56.0 (Windows) atau Command Line Tools (macOS), GitHub CLI 2.102.0 (macOS) | ✅ tersedia |
| 17 | **[Modul 17 — Database Pertama: SQL Dasar & Skema "Rumah Pintar Mini" (PostgreSQL via Docker)](modul-17-sql-dan-skema-database/README.md)** | Kit A + B dari Fase 2, atau laptop saja dengan data latihan dan simulator Modul 16 | Docker Desktop 4.95, image `timescale/timescaledb:2.30.2-pg17` (PostgreSQL 17.11 + TimescaleDB 2.30.2), DBeaver Community 26.2.3, `pg` 8.23.1 | ✅ tersedia |
| 18 | Modul 18 — TimescaleDB: Data Deret Waktu, Agregasi Otomatis, Retensi, & Backup | — (data dari backend atau simulator) | TimescaleDB, DBeaver, `pg_dump` | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-18--timescaledb-data-deret-waktu-agregasi-otomatis-retensi--backup) |
| 19 | Modul 19 — Realtime, Kendali Dua Arah, Aturan Otomatis (Cloud & Lokal), & Notifikasi | Kit A + B (atau laptop) | Socket.IO, node-cron, grammY, Vitest | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-19--realtime-kendali-dua-arah-aturan-otomatis-cloud--lokal--notifikasi) |
| 20 | Modul 20 — Keamanan Pengguna: Login, JWT di Cookie, Peran, & Pengaman API | Kit A + B (atau laptop) | bcrypt, @fastify/jwt, @fastify/cookie, @fastify/rate-limit, @fastify/cors | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-20--keamanan-pengguna-login-jwt-di-cookie-peran--pengaman-api) |
| 21 | Modul 21 — Keamanan Perangkat: API Key, Provisioning Sederhana, & Hak Akses Broker (ACL) | Kit A + B (atau laptop) | Mosquitto (*password file* dan ACL), Zod, Bruno | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-21--keamanan-perangkat-api-key-provisioning-sederhana--hak-akses-broker-acl) |

## 🎯 Tanda lulus Fase 3

Sebelum lanjut ke Fase 4, pastikan bukti-bukti ini sudah ada di repositori GitHub-mu ([Silabus §8](../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)):

1. Kuis setiap modul (5 soal) **≥ 4 benar**.
2. **Proyek checkpoint:** backend berkunci (untuk manusia dan perangkat), dengan aturan otomatis (di server dan pengaman lokal di perangkat) serta notifikasi Telegram.
3. **Artefak:** koleksi Bruno, dokumentasi `/docs` (OpenAPI), skema SQL, dan *pull request* yang di-*merge*.

Modul 16 membuka fase ini: Rumah Pintar Mini mendapat server buatanmu sendiri. Backend v0.1 ditulis dengan Node.js 24 dan TypeScript ringan. Ia mendengarkan semua pesan MQTT perangkat, memeriksa setiap pesan dengan kontrak data yang ditulis sebagai skema Zod, dan menyediakan API berdokumentasi di `/docs` untuk membaca perangkat serta menyalakan relay sambil menunggu `ack`-nya. API itu diuji dengan Bruno dan simulator sepuluh perangkat palsu. Fitur pertamanya juga dikerjakan seperti di tim sungguhan: lewat *branch*, *pull request*, dan *review* dengan checklist. Node-RED pensiun sebagai otak: otomasinya dimatikan, sedangkan dashboard-nya tetap dipakai.

Modul 17 memberi backend ingatan jangka panjang. Database PostgreSQL berjalan di kontainer Docker di laptop, bentuk tabelnya ditulis sebagai migrasi bernomor, dan SQL dipakai untuk pertanyaan nyata seperti rata-rata suhu per hari atau jam tanah paling kering. Backend v0.2 menyimpan setiap pesan yang lolos pemeriksaan kontrak, menolak kiriman ganda dengan kunci `(device_id, ts)`, mencatat setiap perintah, dan menyediakan API riwayat `GET /devices/:id/readings`.

## 📂 Isi setiap folder modul

| Isi | Gunanya |
| :--- | :--- |
| `README.md` | Artikel modulnya — mulai membaca dari sini. GitHub menampilkannya otomatis saat kamu membuka folder modul. |
| `kode/` | Kode setiap tahap praktik, siap dibandingkan dengan milikmu. Di Modul 16: `pemanasan/`, `kemenangan-cepat/`, `tahap/praktik-2` sampai `praktik-6` (keadaan backend di akhir setiap praktik), `backend/` (keadaan akhir, lengkap dengan koleksi Bruno), `alat/` (simulator), `.github/` (templat *pull request*), dan `tantangan/kunci/`. Di Modul 17: `pemanasan/`, `tahap/praktik-3` sampai `praktik-5`, `backend/` (backend v0.2, lengkap dengan migrasi dan koleksi Bruno), dan `tantangan/kunci/`. File `.env` tidak pernah disertakan: salin `.env.example`, lalu isi milikmu sendiri. |
| `aset/` | Gambar-gambar artikel, beserta `SUMBER.md` yang mencatat sumber dan lisensi setiap gambar. |

---

[⬅️ Fase 2 — Konektivitas](../fase-2-konektivitas/README.md) · [Halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md) · **Mulai: [Modul 16](modul-16-backend-typescript-api-git/README.md) ➡️**
