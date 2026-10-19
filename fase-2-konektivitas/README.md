# 🟦 Fase 2 — Konektivitas: WiFi, MQTT, Gateway Raspberry Pi, & Protokol Lapangan (Modul 10–15)

🌐 **Bahasa Indonesia** · [English](../en/phase-2-connectivity/README.md)

> **Tujuan fase:** perangkat "berbicara" ke dunia luar dengan protokol standar, ada "kantor pos" lokal (Raspberry Pi), dan kamu mengenal protokol yang benar-benar dipakai di lapangan. **Semua masih di jaringan rumahmu**: membuka perangkat ke internet adalah urusan Fase 5.

Kerjakan modulnya **berurutan**. Satu modul = satu minggu (6–10 jam, dicicil). Klik judul modul untuk membuka artikelnya.

| Minggu | Modul | Perangkat keras | Alat yang dipasang di modul ini | Status |
| :---: | :--- | :--- | :--- | :--- |
| 10 | **[Modul 10 — WiFi & HTTP: Perangkat Mulai Berbicara dengan Jaringan](modul-10-wifi-dan-http/README.md)** | Kit A tanpa komponen baru, ditambah laptop, HP, dan WiFi 2,4 GHz (sebagian praktik bisa di Wokwi) | library WiFiManager dan ArduinoJson; WiFi, HTTPClient, WebServer, dan ESPmDNS (bawaan paket esp32) | ✅ tersedia |
| 11 | **[Modul 11 — MQTT: Bahasa Resmi Dunia IoT & Kontrak Data Proyek](modul-11-mqtt-dan-kontrak-data/README.md)** | Kit A tanpa komponen baru, ditambah laptop sebagai broker (semua sketsa bisa dicoba di Wokwi dengan broker publik) | Mosquitto, MQTTX, library PubSubClient3, library `mqtt` untuk Node.js | ✅ tersedia |
| 12 | **[Modul 12 — Raspberry Pi & Linux Dasar: Gateway yang Selalu Hidup](modul-12-raspberry-pi-dan-linux/README.md)** | Kit B: Raspberry Pi 5 atau Pi 4, kartu microSD *high-endurance*, adaptor resmi, kabel LAN (jalur laptop tersedia; Wokwi tidak menyimulasikan Pi) | Raspberry Pi Imager 2.0.12, SSH, Mosquitto 2.0.21 di Raspberry Pi OS Trixie | ✅ tersedia |
| 13 | **[Modul 13 — Node-RED & Dashboard 2: Dashboard Pertama Tanpa Koding](modul-13-node-red-dashboard/README.md)** | Kit B: gateway Pi dari Modul 12, Node 1, HP (jalur laptop tersedia) | Node-RED 5.0.8 dan FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) 1.33.0 | ✅ tersedia |
| 14 | **[Modul 14 — Node 2 "Kebun": Sensor Bertenaga Baterai via ESP-NOW](modul-14-node-2-esp-now/README.md)** | Kit A Tahap 2: papan ESP32 kedua dengan rangkaian baterai Modul 9, BME280, DS18B20, sensor tanah ke-2, INA219 (jalur Wokwi sebagian) | ESP-NOW bawaan paket esp32 3.3.12, Adafruit BME280, OneWire + DallasTemperature, Adafruit INA219 | ✅ tersedia |
| 15 | **[Modul 15 — Lab Modbus RTU/RS-485 & Memilih Protokol yang Tepat](modul-15-modbus-rs485-dan-protokol/README.md)** | Kit A Tahap 2: papan kedua (Node 2 dipinjam), dua modul MAX485, kabel UTP 5 m, resistor 4,7 kΩ dan 10 kΩ (jalur Wokwi sebagian: chip tiruan) | ModbusMaster 2.0.1, ModbusRTUSlave 3.1.2, chip tiruan Wokwi | ✅ tersedia |

## 🎯 Tanda lulus Fase 2

Sebelum lanjut ke Fase 3, pastikan bukti-bukti ini sudah ada di repositori GitHub-mu ([Silabus §8](../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)):

1. Kuis setiap modul (5 soal) **≥ 4 benar**.
2. **Proyek checkpoint:** Node 1 + Node 2 + gateway Raspberry Pi + lab Modbus.
3. **Artefak:** `KONTRAK-DATA.md` dan flow Node-RED (JSON).

Modul 10 membuka fase ini: Node 1 v1.1 tersambung ke WiFi rumah tanpa kata sandi di kodenya, tahu jam yang tepat, mengirim bacaannya dalam bentuk JSON sesuai kontrak data, dan lampunya bisa dimatikan dari HP. Modul 11 memindahkan seluruh komunikasinya ke MQTT: Node 1 v1.2 berbicara lewat broker Mosquitto dengan kontrak data yang dipakai sampai akhir kurikulum, dan artefak pertama fase ini, `KONTRAK-DATA.md`, mulai tersimpan di proyekmu. Modul 12 memindahkan broker itu ke gateway Raspberry Pi yang menyala 24 jam dengan alamat tetap, sebagai layanan yang menyala dan bangkit sendiri, lengkap dengan resep membangunnya ulang di `edge/README.md`: Node 1 v1.2.1 tetap tersambung walaupun laptop dimatikan. Modul 13 memberi gateway itu wajah dan otak pertama: Node-RED menampilkan kelima sensor Node 1 di dashboard HP, mengirim perintah sesuai kontrak data dari sakelar dan tombol, dan menyalakan kipas sendiri dengan histeresis, tanpa satu baris pun perubahan di firmware Node 1. Modul 14 menambahkan perangkat kedua: Node 2 "Kebun" hidup dari baterai, membaca BME280, DS18B20, dan sensor tanah ke-2, lalu berbicara langsung ke Node 1 lewat ESP-NOW tanpa router. Node 1 v1.3.0 menjadi jembatannya ke broker, tetap mendengar Node 2 saat router mati, dan Node-RED menampilkannya di kartu Kebun dengan `device_id` Node 2 sendiri. Modul 15 menutup fase ini dengan bahasa industri: lewat sepasang kawat RS-485 dan modul MAX485, Node 1 v1.4.0 bertanya dengan Modbus RTU ke sensor tanah tiruan di papan kedua, memasukkan jawabannya ke `telemetry` (kontrak data 1.2), dan grup Sensor RS-485 di Node-RED menampilkannya lewat kabel 5 m. Modul ini juga memberi peta untuk memilih protokol yang tepat: WiFi, ESP-NOW, RS-485, LoRa/LoRaWAN, Zigbee/Thread dan Matter, NB-IoT, serta BLE.

## 📂 Isi setiap folder modul

| Isi | Gunanya |
| :--- | :--- |
| `README.md` | Artikel modulnya — mulai membaca dari sini. GitHub menampilkannya otomatis saat kamu membuka folder modul. |
| `kode/` | Satu folder per sketsa, siap dibuka di Arduino IDE. Sketsa yang menyambung ke WiFi membawa tab `secrets.h` berisi **contoh** nama dan kata sandi WiFi: ganti isinya dengan WiFi-mu di laptopmu sendiri, dan jangan pernah meng-*commit* `secrets.h` yang berisi kata sandi asli. Folder `node-1-rumah` juga berisi `diagram.json` dan `libraries.txt` untuk dicoba di Wokwi. |
| `aset/` | Gambar-gambar artikel, beserta `SUMBER.md` yang mencatat sumber dan lisensi setiap gambar. |

---

[⬅️ Fase 1 — ESP32 Embedded](../fase-1-esp32-embedded/README.md) · [Halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md) · **Mulai: [Modul 10](modul-10-wifi-dan-http/README.md) ➡️**
