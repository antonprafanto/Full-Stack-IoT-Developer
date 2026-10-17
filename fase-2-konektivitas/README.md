# 🟦 Fase 2 — Konektivitas: WiFi, MQTT, Gateway Raspberry Pi, & Protokol Lapangan (Modul 10–15)

🌐 **Bahasa Indonesia** · [English](../en/phase-2-connectivity/README.md)

> **Tujuan fase:** perangkat "berbicara" ke dunia luar dengan protokol standar, ada "kantor pos" lokal (Raspberry Pi), dan kamu mengenal protokol yang benar-benar dipakai di lapangan. **Semua masih di jaringan rumahmu**: membuka perangkat ke internet adalah urusan Fase 5.

Kerjakan modulnya **berurutan**. Satu modul = satu minggu (6–10 jam, dicicil). Klik judul modul untuk membuka artikelnya.

| Minggu | Modul | Perangkat keras | Alat yang dipasang di modul ini | Status |
| :---: | :--- | :--- | :--- | :--- |
| 10 | **[Modul 10 — WiFi & HTTP: Perangkat Mulai Berbicara dengan Jaringan](modul-10-wifi-dan-http/README.md)** | Kit A tanpa komponen baru, ditambah laptop, HP, dan WiFi 2,4 GHz (sebagian praktik bisa di Wokwi) | library WiFiManager dan ArduinoJson; WiFi, HTTPClient, WebServer, dan ESPmDNS (bawaan paket esp32) | ✅ tersedia |
| 11 | Modul 11 — MQTT: Bahasa Resmi Dunia IoT & Kontrak Data Proyek | Kit A + laptop sebagai broker | Mosquitto, MQTTX, library PubSubClient | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-11--mqtt-bahasa-resmi-dunia-iot--kontrak-data-proyek) |
| 12 | Modul 12 — Raspberry Pi & Linux Dasar: Gateway yang Selalu Hidup | Kit B (atau laptop / Pi Zero 2 W) | Raspberry Pi Imager, SSH, Mosquitto | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-12--raspberry-pi--linux-dasar-gateway-yang-selalu-hidup) |
| 13 | Modul 13 — Node-RED & Dashboard 2: Dashboard Pertama Tanpa Koding | Kit B (atau laptop) | Node-RED + `@flowfuse/node-red-dashboard` | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-13--node-red--dashboard-2-dashboard-pertama-tanpa-koding) |
| 14 | Modul 14 — Node 2 "Kebun": Sensor Bertenaga Baterai via ESP-NOW | Kit A Tahap 2 (2 ESP32, baterai) | library esp_now bawaan paket esp32, INA219 | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-14--node-2-kebun-sensor-bertenaga-baterai-via-esp-now) |
| 15 | Modul 15 — Lab Modbus RTU/RS-485 & Memilih Protokol yang Tepat | Kit A Tahap 2 (2 ESP32, 2 MAX485) | ModbusMaster, eModbus, modul MAX485 | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-15--lab-modbus-rturs-485--memilih-protokol-yang-tepat) |

## 🎯 Tanda lulus Fase 2

Sebelum lanjut ke Fase 3, pastikan bukti-bukti ini sudah ada di repositori GitHub-mu ([Silabus §8](../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)):

1. Kuis setiap modul (5 soal) **≥ 4 benar**.
2. **Proyek checkpoint:** Node 1 + Node 2 + gateway Raspberry Pi + lab Modbus.
3. **Artefak:** `KONTRAK-DATA.md` dan flow Node-RED (JSON).

Modul 10 membuka fase ini: Node 1 v1.1 tersambung ke WiFi rumah tanpa kata sandi di kodenya, tahu jam yang tepat, mengirim bacaannya dalam bentuk JSON sesuai kontrak data, dan lampunya bisa dimatikan dari HP. Mulai Modul 11, kiriman yang sama berjalan lewat MQTT.

## 📂 Isi setiap folder modul

| Isi | Gunanya |
| :--- | :--- |
| `README.md` | Artikel modulnya — mulai membaca dari sini. GitHub menampilkannya otomatis saat kamu membuka folder modul. |
| `kode/` | Satu folder per sketsa, siap dibuka di Arduino IDE. Sketsa yang menyambung ke WiFi membawa tab `secrets.h` berisi **contoh** nama dan kata sandi WiFi: ganti isinya dengan WiFi-mu di laptopmu sendiri, dan jangan pernah meng-*commit* `secrets.h` yang berisi kata sandi asli. Folder `node-1-rumah` juga berisi `diagram.json` dan `libraries.txt` untuk dicoba di Wokwi. |
| `aset/` | Gambar-gambar artikel, beserta `SUMBER.md` yang mencatat sumber dan lisensi setiap gambar. |

---

[⬅️ Fase 1 — ESP32 Embedded](../fase-1-esp32-embedded/README.md) · [Halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md) · **Mulai: [Modul 10](modul-10-wifi-dan-http/README.md) ➡️**
