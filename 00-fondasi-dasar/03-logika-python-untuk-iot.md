# 🐍 Modul 0.3: Logika Pemrograman Python dari Nol untuk Edge Gateway & Cloud IoT

> **Fase 0: Fondasi Dasar**  
> **Target Pembaca:** Pemula yang ingin mempelajari Python untuk mengolah data IoT di Raspberry Pi dan Server Cloud.  
> **Estimasi Waktu Belajar:** 30–45 Menit  
> **Alat Praktik:** Komputer Laptop (Python 3.10+) atau [Google Colab (Browser Gratis)](https://colab.research.google.com)

---

## 🧭 Daftar Isi Modul
1. [Peran Python dalam Arsitektur Fullstack IoT](#1-peran-python-dalam-arsitektur-fullstack-iot)
2. [Variabel & Tipe Data Dasar](#2-variabel--tipe-data-dasar)
3. [Struktur Data Kunci IoT: List `[]` dan Dictionary `{}` (Format JSON)](#3-struktur-data-kunci-iot-list--dan-dictionary---format-json)
4. [Fungsi & Modul: Mengorganisir Skrip IoT](#4-fungsi--modul-mengorganisir-skrip-iot)
5. [Manajemen Virtual Environment (`venv`) & Package Manager (`pip`)](#5-manajemen-virtual-environment-venv--package-manager-pip)
6. [Pengenalan Pemrograman Asinkron (`asyncio`): Mengapa IoT Butuh Async?](#6-pengenalan-pemrograman-asinkron-asyncio-mengapa-iot-butuh-async)
7. [Laboratorium Praktik: Menulis Skrip Parser Telemetri IoT Pertama](#7-laboratorium-praktik-menulis-skrip-parser-telemetri-iot-pertama)
8. [Glosarium & Rangkuman](#8-glosarium--rangkuman)

---

## 1. Peran Python dalam Arsitektur Fullstack IoT

Jika C++ adalah bahasa untuk **ujung perangkat keras (ESP32)**, maka Python adalah bahasa utama untuk **jembatan data (Raspberry Pi Gateway & Cloud Backend)**:

```
┌────────────────────────┬──────────────────────────────────────────────┐
│     LAPISAN IOT        │     BAHASA & TUGAS UTAMA                     │
├────────────────────────┼──────────────────────────────────────────────┤
│ 1. Device Silikon      │ C++ (ESP32)  : Baca Voltase Sensor Pin       │
│ 2. Edge Gateway        │ PYTHON (RPi) : Terima Serial/MQTT & Filter Data│
│ 3. Cloud Ingestion     │ PYTHON / Node: Simpan Data ke Database Cloud │
│ 4. Dashboard Web       │ TypeScript   : Visualisasi Grafik di Layar   │
└────────────────────────┴──────────────────────────────────────────────┘
```

> 💡 **Mengapa Python Sangat Disukai di IoT?**  
> Python memiliki sintaks yang sangat mirip bahasa Inggris manusia sehari-hari, didukung ribuan pustaka siap pakai untuk protokol jaringan (MQTT, Modbus, Bluetooth, WebSockets, dan AI/Machine Learning).

---

## 2. Variabel & Tipe Data Dasar

Di Python, Anda **tidak perlu** mendeklarasikan tipe data secara manual (Python otomatis mendeteksi tipenya):

```python
# 1. String (Teks)
nama_perangkat = "ESP32_LivingRoom"

# 2. Integer (Bilangan Bulat)
detak_jantung = 72

# 3. Float (Bilangan Desimal)
suhu_ruangan = 28.75

# 4. Boolean (Benar / Salah)
lampu_menyala = True

print(f"Perangkat {nama_perangkat} membaca suhu {suhu_ruangan}°C (Status Lampu: {lampu_menyala})")
```

---

## 3. Struktur Data Kunci IoT: List `[]` dan Dictionary `{}` (Format JSON)

Di dunia IoT, format pertukaran data standar internasional adalah **JSON (*JavaScript Object Notation*)**. Di Python, format JSON ini dipetakan secara identik menjadi **Dictionary `{}`**:

```
                       STRUKTUR DATA DICTIONARY IOT
                       
                     ┌───────────────┬───────────────┐
                     │     KUNCI     │     NILAI     │
                     ├───────────────┼───────────────┤
                     │ "device_id"   │ "NODE_01"     │
                     │ "temperature" │ 29.5          │
                     │ "humidity"    │ 65.0          │
                     │ "relay_state" │ True          │
                     └───────────────┴───────────────┘
```

### 💻 Contoh Kode Python:

```python
import json

# 1. Mendefinisikan Dictionary Telemetri Sensor
data_sensor = {
    "device_id": "NODE_01",
    "temperature": 29.5,
    "humidity": 65.0,
    "relay_state": True,
    "tags": ["factory", "zone_a"] # List di dalam dictionary
}

# 2. Mengakses nilai berdasarkan Kunci (Key)
print("Suhu Terbaca:", data_sensor["temperature"]) # Mencetak: 29.5

# 3. Mengubah Dictionary menjadi teks JSON untuk dikirim lewat jaringan
payload_json = json.dumps(data_sensor)
print("Payload Siap Kirim via MQTT:", payload_json)
```

---

## 4. Fungsi & Modul: Mengorganisir Skrip IoT

Fungsi di Python dibuat menggunakan kata kunci `def`:

```python
def evaluasi_kondisi_mesin(suhu: float, getaran: float) -> str:
    """Fungsi untuk mengevaluasi apakah mesin dalam kondisi bahaya."""
    if suhu > 75.0 or getaran > 5.0:
        return "🚨 ALARM: Potensi Kerusakan Mesin!"
    return "✅ NORMAL: Mesin Beroperasi Stabil."

# Menguji fungsi
status = evaluasi_kondisi_mesin(suhu=82.0, getaran=3.1)
print(status) # Mencetak: 🚨 ALARM: Potensi Kerusakan Mesin!
```

---

## 5. Manajemen Virtual Environment (`venv`) & Package Manager (`pip`)

Setiap proyek IoT Python sebaiknya memiliki ruang terisolasi sendiri agar dependensi paket library tidak bentrok dengan proyek lain di komputer Anda.

### 🛠️ Langkah-Langkah Membuat Virtual Environment:
```bash
# 1. Buka Terminal di folder proyek Anda
# 2. Buat folder virtual environment bernama .venv
python -m venv .venv

# 3. Aktifkan Virtual Environment:
# Di Windows PowerShell:
.venv\Scripts\Activate.ps1
# Di Linux / Mac:
source .venv/bin/activate

# 4. Instal library IoT populer (misal library MQTT Paho):
pip install paho-mqtt
```

---

## 6. Pengenalan Pemrograman Asinkron (`asyncio`): Mengapa IoT Butuh Async?

Bayangkan sebuah server gateway yang harus menerima data dari **1.000 perangkat ESP32** secara bersamaan:
- **Metode Sinkron Konvensional (Lambat):** Server melayani Perangkat 1 $\rightarrow$ Tunggu selesai $\rightarrow$ Baru melayani Perangkat 2 $\rightarrow$ Antrean macet parah!
- **Metode Asinkron (`asyncio` - Cepat):** Server menyapa Perangkat 1 $\rightarrow$ Sambil menunggu data datang, server langsung melayani Perangkat 2, 3, 4 $\rightarrow$ Tidak ada waktu CPU yang terbuang menganggur!

```python
import asyncio

async def baca_sensor_lora(node_id: int):
    print(f"📡 Mulai membaca data dari Node {node_id}...")
    # Mensimulasikan jeda komunikasi radio selama 1 detik secara non-blocking
    await asyncio.sleep(1)
    print(f"✅ Data berhasil diterima dari Node {node_id}!")

async def main():
    # Menjalankan pembacaan 3 node sekaligus secara paralel
    await asyncio.gather(
        baca_sensor_lora(1),
        baca_sensor_lora(2),
        baca_sensor_lora(3)
    )

# Menjalankan event loop
asyncio.run(main())
```

*Output akan menampilkan ketiga node mulai membaca dan selesai bersamaan hanya dalam waktu 1 detik total!*

---

## 7. Laboratorium Praktik: Menulis Skrip Parser Telemetri IoT Pertama

Mari kita tulis skrip Python lengkap yang mensimulasikan penerimaan paket data mentah, memvalidasi datanya, dan menyaring anomali:

```python
# ==========================================================
# PRAKTIK MODUL 0.3: SIMULASI PARSER DATA IOT DI EDGE GATEWAY
# ==========================================================
import json

raw_mqtt_message = '{"node": "ESP32_A1", "temp": 42.8, "hum": 70.2, "battery_v": 3.7}'

def proses_telemetri(raw_json_str: str):
    # 1. Parsing teks JSON menjadi Dictionary Python
    data = json.loads(raw_json_str)
    
    node = data.get("node")
    temp = data.get("temp")
    battery = data.get("battery_v")
    
    print(f"--- LAPORAN TELEMETRI DARI {node} ---")
    print(f"Suhu: {temp}°C | Baterai: {battery}V")
    
    # 2. Rule Engine / Peringatan
    if temp > 40.0:
        print("🚨 PERINGATAN: Suhu melampaui batas aman!")
    if battery < 3.3:
        print("🪫 BATERAI LEMAH: Segera ganti baterai perangkat.")
    print("----------------------------------------")

# Uji coba parser
proses_telemetri(raw_mqtt_message)
```

---

## 8. Glosarium & Rangkuman

| Istilah | Penjelasan Sederhana |
| :--- | :--- |
| **JSON** | Format teks standar berbasis kunci-nilai (*key-value*) untuk bertukar data antar perangkat di internet. |
| **Dictionary (`{}`)** | Struktur data di Python yang menyimpan data dalam pasangan `kunci: nilai`. |
| **`asyncio`** | Pustaka Python untuk menjalankan banyak tugas I/O (jaringan/serial) secara bersamaan tanpa memblokir sistem. |
| **`pip`** | Alat pengunduh dan penginstal pustaka Python resmi dari Python Package Index (PyPI). |

---

> 🎉 **Selamat!** Anda telah menguasai seluruh fondasi dasar (**Fase 0**): dari konsep listrik, perakitan breadboard, logika pemrograman C++ mikrokontroler, hingga skrip Python untuk gateway.
> 
> 👉 **Langkah Selanjutnya:** Mari kita masuk ke **Fase 1** untuk mulai menguasai hardware fisik ESP32 di **[01-embedded-esp32/README.md](../01-embedded-esp32/README.md)**!
