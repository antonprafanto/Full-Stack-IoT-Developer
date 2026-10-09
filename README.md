# 🚀 Fullstack IoT Developer: Zero to Expert

**Kurikulum belajar mandiri 24 modul (±6 bulan) — dari orang awam total sampai mampu membangun sistem IoT lengkap: sensor → ESP32 → Raspberry Pi → server Node.js → dashboard di HP.**

Ditulis dalam Bahasa Indonesia yang ramah awam. Tidak perlu latar belakang elektronika maupun pemrograman.

| | |
| :--- | :--- |
| 🧰 **Hardware** | ESP32 (node sensor) + Raspberry Pi (gateway). Modul 1–8 bisa 100 % tanpa hardware lewat simulator Wokwi. |
| 💻 **Software** | C++ (Arduino) untuk firmware · JavaScript end-to-end: Node.js 24, Fastify, PostgreSQL + TimescaleDB, MQTT (Mosquitto), React 19, Docker. |
| 🏠 **Proyek benang merah** | "Rumah Pintar Mini" — tumbuh dari LED berkedip (Modul 1) menjadi sistem online dengan OTA, monitoring, dan CI/CD (Modul 23), lalu proyek akhir Anda sendiri (Modul 24). |
| 💸 **Biaya** | Mulai Rp 0 (simulator) · ±Rp 500 rb untuk kit ESP32 · ±Rp 2 jt jika ingin Raspberry Pi sungguhan. |

![Arsitektur fullstack IoT yang dibangun di kurikulum ini](aset/arsitektur-fullstack-iot.png)

## 📖 Mulai dari mana?

1. Baca **[SILABUS.md](SILABUS.md)** — peta lengkap 6 fase × 4 modul, alat yang dibutuhkan, dan cara belajar (±15 menit).
2. Salin **[PROGRES.md](PROGRES.md)** ke catatan Anda sendiri (atau *fork* repo ini) untuk mencentang kemajuan.
3. Buka **Modul 1** di `fase-0-fondasi/modul-01-peta-besar-iot/` dan kerjakan berurutan. Setiap modul = ±1 minggu @ 6–10 jam.

> **Status:** silabus dalam tahap tinjauan (Oktober 2026). Materi modul akan ditambahkan berurutan mulai dari Modul 1.

## 🗺️ Peta kurikulum

| Fase | Modul | Fokus | Hasil nyata |
| :---: | :---: | :--- | :--- |
| 0 | 1–4 | Fondasi: listrik ramah awam, C++ untuk ESP32, JavaScript/Node.js, peralatan | LED berkedip di simulator & di meja; nyaman membaca kode |
| 1 | 5–8 | ESP32 embedded: GPIO, sensor, I2C/1-Wire/SPI, OLED, firmware tangguh & hemat daya | Perangkat mandiri yang hidup 24 jam tanpa restart |
| 2 | 9–12 | Konektivitas: WiFi & HTTP, MQTT, Raspberry Pi gateway + Node-RED, ESP-NOW/BLE | Dua node + gateway yang tahan putus internet |
| 3 | 13–16 | Backend & data: Node.js API, PostgreSQL + TimescaleDB, realtime & aturan otomatis, Telegram, keamanan | Server yang mengingat, memutuskan, dan aman |
| 4 | 17–20 | Frontend: React dashboard realtime, kendali, login, PWA, Grafana & peta | Dashboard di HP yang bisa dipakai orang lain |
| 5 | 21–24 | Operasi: Docker & deploy ke VPS, OTA & fleet, monitoring/backup/CI/CD, **capstone** | Sistem online 24/7 + proyek portofolio |

Rincian tiap modul (tujuan, topik, praktik, kriteria lulus) ada di [SILABUS.md](SILABUS.md#7-rincian-24-modul).

## 📁 Struktur repositori

```
fase-0-fondasi/ … fase-5-operasi-skala/   ← satu folder per modul: README.md (artikel) + aset/ + kode/
proyek-rumah-pintar-mini/                 ← kode proyek benang merah versi terbaru
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
