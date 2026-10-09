# 🚀 Fullstack IoT Developer: Zero to Expert

**Kurikulum belajar mandiri 32 modul (satu modul = satu minggu, ±8 bulan) — dari orang awam total sampai mampu membangun sistem IoT lengkap: sensor → ESP32 → Raspberry Pi → server Node.js → dashboard di HP.**

Ditulis dalam Bahasa Indonesia yang ramah awam. Tidak perlu latar belakang elektronika maupun pemrograman.

| | |
| :--- | :--- |
| 🧰 **Hardware** | ESP32 DevKit V1 ×2 (Node "Rumah" & Node "Kebun") + Raspberry Pi 5 (gateway; Pi 4 tetap didukung). Modul 1–9 bisa ±90 % tanpa hardware lewat simulator Wokwi. |
| 💻 **Software** | Sedikit C++ (Arduino) untuk chip · JavaScript/TypeScript ringan untuk semua sisanya: Node.js 24, Fastify, PostgreSQL + TimescaleDB, MQTT (Mosquitto), Modbus RTU, React 19, Docker. |
| 🏠 **Proyek benang merah** | "Rumah Pintar Mini" — tumbuh dari LED berkedip (Modul 1) menjadi sistem online dengan TLS, OTA, CI/CD, dan monitoring (Modul 30), lalu proyek akhir Anda sendiri (Modul 31–32). Semua bertegangan rendah (USB 5 V) — tidak pernah menyentuh listrik 220 V. |
| 💸 **Biaya** | Mulai Rp 0 (simulator) · ±Rp 500–950 rb untuk kit ESP32 (2 board) · ±Rp 1,3–2,2 jt jika ingin Raspberry Pi sungguhan · VPS + domain opsional di ±2 bulan terakhir. |

![Arsitektur fullstack IoT yang dibangun di kurikulum ini](aset/arsitektur-fullstack-iot.png)

## 📖 Mulai dari mana?

1. Baca **[SILABUS.md](SILABUS.md)** — peta lengkap 6 fase / 32 modul, prasyarat & alat yang dibutuhkan, dan cara belajar (±20 menit). Pemula cukup membaca §1, §2, §4, §5 dulu; ada glosarium di §12 dan "kontrak data" proyek di Lampiran A.
2. Salin **[PROGRES.md](PROGRES.md)** ke catatan Anda sendiri (atau *fork* repo ini) untuk mencentang kemajuan.
3. Buka **Modul 1** di `fase-0-fondasi/modul-01-peta-besar-iot/` dan kerjakan berurutan. Setiap modul = 1 minggu @ 6–10 jam (Modul N = Minggu N).

> **Status:** silabus **v1.0 disetujui** (9 Oktober 2026). Materi modul sedang ditulis berurutan mulai dari Modul 1 — lihat [PROGRES.md](PROGRES.md) untuk daftar modul.

## 🗺️ Peta kurikulum

| Fase | Modul (= Minggu) | Fokus | Hasil nyata |
| :---: | :---: | :--- | :--- |
| 0 | 1–4 | Fondasi: listrik ramah awam & unggah pertama ke ESP32, C++, JavaScript/Node.js, peralatan dipasang saat dibutuhkan | LED berkedip di simulator & di meja; nyaman membaca kode |
| 1 | 5–9 | ESP32 embedded: peta pin kanonik, catu daya, sensor, I2C/1-Wire/SPI, OLED, firmware tangguh, hemat daya & baterai | Node 1 "Rumah" mandiri yang hidup 24 jam tanpa restart; bekal Node 2 bertenaga baterai |
| 2 | 10–15 | Konektivitas: WiFi & HTTP, MQTT + kontrak data, Raspberry Pi & Linux, Node-RED, Node 2 via ESP-NOW, lab Modbus RTU/RS-485 | Dua node + gateway Pi di jaringan rumah |
| 3 | 16–21 | Backend & data: Fastify + TypeScript ringan + OpenAPI, SQL & skema, TimescaleDB, realtime & aturan otomatis (cloud + pengaman lokal), keamanan pengguna & perangkat | Server yang mengingat, memutuskan, dan berkunci |
| 4 | 22–25 | Frontend: React dashboard realtime, kendali, peran, Grafana & peta | Dashboard di HP yang bisa dipakai orang lain |
| 5 | 26–32 | Operasi: Docker Compose, deploy ke internet + TLS/HTTPS + bridge Pi→VPS + PWA, OTA & fleet, testing & CI/CD, monitoring & backup, **capstone** & portofolio | Sistem online 24/7 terenkripsi + proyek portofolio |

Rincian tiap modul (tujuan, konsep inti, alat, praktik, kriteria lulus) ada di [SILABUS.md](SILABUS.md#7-rincian-32-modul).

## 📁 Struktur repositori

```
fase-0-fondasi/ … fase-5-operasi-skala/   ← 32 folder modul: README.md (artikel) + aset/ + kode/
proyek-rumah-pintar-mini/                 ← kode proyek benang merah (firmware 2 node, edge, backend, frontend, compose)
aset/                                     ← gambar lintas modul
_arsip-lama/                              ← kurikulum versi sebelumnya (tidak perlu dibaca)
```

## 🖼️ Tentang gambar & atribusi

Gambar dari internet hanya dipakai jika lisensinya mengizinkan dan **selalu** disertai sumber + lisensi tepat di bawah gambar (serta rekap di `aset/SUMBER.md` tiap modul). Diagram buatan sendiri dilisensikan **CC BY 4.0**.

## 🤝 Kontribusi

Menemukan salah ketik, penjelasan yang membingungkan, atau rangkaian yang tidak jalan? Buka *issue* atau *pull request* — kritik dari pemula adalah masukan paling berharga untuk materi ramah awam.

## 📜 Lisensi

Teks & diagram: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.id) · Kode contoh: [MIT](https://opensource.org/licenses/MIT). Gambar pihak ketiga mengikuti lisensi masing-masing sebagaimana dicantumkan.

---

Dibuat oleh [antonprafanto](https://github.com/antonprafanto) · Kodingindonesia
