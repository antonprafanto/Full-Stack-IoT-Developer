# 🟧 Fase 1 — ESP32 Embedded: Sensor, Aktuator, & Firmware Tangguh (Modul 5–9)

> **Tujuan fase:** Node 1 "Rumah" yang berdiri sendiri — membaca lingkungan, menampilkan data di layar, menggerakkan sesuatu, dengan catu daya sendiri dan firmware yang tidak gampang macet — plus bekal hemat daya untuk Node 2.

Kerjakan modulnya **berurutan**. Satu modul = satu minggu (6–10 jam, dicicil). Klik judul modul untuk membuka artikelnya.

| Minggu | Modul | Perangkat keras | Alat yang dipasang di modul ini | Status |
| :---: | :--- | :--- | :--- | :--- |
| 5 | **[Modul 5 — Anatomi ESP32, Peta Pin Kanonik, Catu Daya, & Mengendalikan Dunia Nyata](modul-05-gpio-dan-peta-pin/README.md)** | Kit A Tahap 1 + kabel USB A–A (sebagian besar praktik bisa di Wokwi) | library ESP32Servo | ✅ tersedia |
| 6 | **[Modul 6 — Membaca Sensor: Analog, Digital, & Kalibrasi](modul-06-membaca-sensor/README.md)** | Kit A Tahap 1 (sebagian besar praktik bisa di Wokwi) | library DHT sensor (Adafruit) + Adafruit Unified Sensor, Serial Plotter | ✅ tersedia |
| 7 | **[Modul 7 — Protokol Bus Sensor: I2C, 1-Wire, SPI, Layar OLED, & Membaca Skematik](modul-07-bus-sensor-oled-skematik/README.md)** | Kit A Tahap 2 (hampir semua praktik bisa di Wokwi) | library Adafruit SSD1306 + GFX + BusIO, Adafruit BME280, OneWire + DallasTemperature; SD bawaan paket esp32 | ✅ tersedia |
| 8 | Modul 8 — Firmware Tangguh: millis(), State Machine, Kode Modular, Watchdog, & Debugging | Kit A | library Preferences (bawaan paket esp32) | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-8--firmware-tangguh-millis-state-machine-kode-modular-watchdog--debugging) |
| 9 | Modul 9 — Catu Daya & Hemat Daya: Adaptor, Baterai, Deep Sleep, & Mengukur Arus | Kit A (+ INA219, 18650/TP4056/MT3608) | library Adafruit INA219 | ⏳ segera terbit — [ringkasan](../SILABUS.md#modul-9--catu-daya--hemat-daya-adaptor-baterai-deep-sleep--mengukur-arus) |

## 🎯 Tanda lulus Fase 1

Sebelum lanjut ke Fase 2, pastikan bukti-bukti ini sudah ada di repositori GitHub-mu ([Silabus §8](../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase)):

1. Kuis setiap modul (5 soal) **≥ 4 benar**.
2. **Proyek checkpoint:** Node 1 hidup mandiri 24 jam dari adaptor, ditambah sketsa baterai yang arusnya terukur.
3. **Artefak:** firmware Node 1 v1.0, foto rangkaian, `PETA-PIN.md`, dan video 30 detik.

Modul 5 sudah menyumbang dua artefak pertamamu: **`PETA-PIN.md`** dan **foto rangkaian** meja kerjamu. Modul 6 menambah foto rakitan sensor dan catatan kalibrasimu. Modul 7 menambah gambar skematik Node 1 buatanmu sendiri.

## 📂 Isi setiap folder modul

| Isi | Gunanya |
| :--- | :--- |
| `README.md` | Artikel modulnya — mulai membaca dari sini. GitHub menampilkannya otomatis saat kamu membuka folder modul. |
| `kode/` | Satu folder per sketsa, siap dibuka di Arduino IDE. Setiap folder juga berisi `diagram.json` (dan `libraries.txt` bila perlu library) untuk dicoba di Wokwi. Folder berawalan `wokwi-` hanya berisi rangkaian Wokwi untuk tantangan, tanpa sketsa. |
| `aset/` | Gambar-gambar artikel, beserta `SUMBER.md` yang mencatat sumber dan lisensi setiap gambar. |

---

[⬅️ Fase 0 — Fondasi](../fase-0-fondasi/README.md) · [Halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md) · **Mulai: [Modul 5](modul-05-gpio-dan-peta-pin/README.md) ➡️**
