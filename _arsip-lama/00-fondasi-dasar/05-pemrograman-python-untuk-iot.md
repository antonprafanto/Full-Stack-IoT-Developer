# 🐍 Modul 0.5: Pemrograman Python dari Nol — Khusus Edge Gateway, Data Parsing & Cloud

> **Tingkat Kesulitan:** Sangat Ramah Pemula (*Zero Prerequisite*)  
> **Estimasi Waktu Membaca & Praktik:** 20–25 Menit  
> **Tools yang Digunakan:** Browser Web (Kompiler Online [Programiz Python](https://www.programiz.com/python-programming/online-compiler/) atau [OnlineGDB Python](https://www.onlinegdb.com/online_python_compiler))  

---

## 🌟 Mengapa Seorang IoT Developer Wajib Menguasai Python?

Di modul sebelumnya, kita mempelajari **C++** yang bertugas sebagai *otot pekerja* di dalam chip silikon ESP32.  
Lalu, di manakah peran **Python** dalam arsitektur Fullstack IoT?

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DUET MAUT EMBEDDED C++ vs PYTHON                     │
├────────────────────────────────────────────────────────────────────────┤
│ • C++ (Pada ESP32 / Chip Sensor) : Kecepatan kilat, hemat RAM & baterai│
│ • Python (Pada Raspberry Pi & Cloud): Otak pengolah data, penerjemah   │
│   format JSON, server web FastAPI, dan kecerdasan buatan (AI/ML).      │
└────────────────────────────────────────────────────────────────────────┘
```

Python adalah bahasa pemrograman yang paling populer di dunia karena sintaksnya **sangat mirip dengan bahasa Inggris sehari-hari**. Anda tidak perlu pusing memikirkan tipe data yang kaku atau tanda kurung kurawal yang membingungkan.

Di modul ini, kita akan mempelajari konsep Python yang paling sering digunakan dalam proyek IoT: **Pengolahan Format JSON, Struktur Data Sensor, Virtual Environment, dan Pemrograman Asinkron (`asyncio`)**!

---

## 🧭 Peta Pembelajaran Modul Ini

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR MATERI MODUL 0.5                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Tipe Data Dasar & Struktur Koleksi Data IoT (List, Dict, Tuple)     │
│ 2. Format JSON: Bahasa Universal Pertukaran Data IoT (dumps vs loads)  │
│ 3. Logika Filter Data: Membuang Nilai Sensor yang Rusak (Noise)        │
│ 4. Manajemen Paket & Virtual Environment (Mengapa Wajib Pakai venv?)   │
│ 5. Pemrograman Asinkron (Asyncio): Analogi "Koki Restoran Cerdas"      │
│ 6. Uji Coba Virtual: Menjalankan Gateway IoT Asinkron di Browser       │
│ 7. Glosarium & Kuis Singkat                                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Tipe Data Dasar & Struktur Koleksi Data IoT

Di Python, Anda tidak perlu mendeklarasikan tipe data secara manual. Python cukup cerdas untuk menebaknya secara otomatis:

```python
# Tipe Data Dasar
nama_perangkat = "ESP32-Suhu-Gudang" # String (Teks)
jumlah_sensor  = 4                   # Integer (Bilangan Bulat)
tegangan_baterai = 3.75              # Float (Bilangan Desimal)
status_online  = True                # Boolean (True / False)
```

Namun, di IoT kita jarang mengolah data satuan. Kita mengolah **kumpulan data**:

---

### A. List `[]` (Daftar Antrean Data Sensor)
List digunakan untuk menyimpan deretan data historis yang bisa ditambah atau diubah:
```python
# Menyimpan 5 pembacaan suhu terakhir
riwayat_suhu = [28.5, 29.1, 28.9, 30.2, 29.8]

# Menambahkan data baru yang baru saja masuk dari sensor
riwayat_suhu.append(31.0)

# Menghitung rata-rata suhu
rata_rata = sum(riwayat_suhu) / len(riwayat_suhu)
print(f"Rata-rata Suhu: {rata_rata:.2f} °C") # Output: 29.58 °C
```

---

### B. Tuples `()` (Data Permanen yang Tidak Boleh Berubah)
Tuple digunakan untuk data yang sifatnya paten/konstan (misalnya koordinat GPS):
```python
# Koordinat GPS Pabrik (Latitude, Longitude)
lokasi_pabrik = (-6.2088, 106.8456)

# lokasi_pabrik[0] = -7.0  <-- INI AKAN ERROR! Tuple tidak bisa diubah-ubah (Immutable).
```

---

### C. Dictionary `{}` (Kamus Pasangan Kunci-Nilai / Key-Value)
Dictionary adalah struktur data paling penting di IoT karena merepresentasikan **paket data telemetri lengkap**:

```python
# Paket telemetri dari satu perangkat sensor
telemetri = {
    "device_id": "SENSOR-NODE-01",
    "temperature": 29.5,
    "humidity": 75.0,
    "battery_pct": 92,
    "is_alarm": False
}

# Mengakses nilai tertentu
print(telemetri["temperature"]) # Output: 29.5
```

---

## 2. Format JSON: Bahasa Universal Pertukaran Data IoT

Ketika ESP32 mengirim data ke Raspberry Pi atau Server Cloud melalui protokol HTTP/MQTT, data dikirim dalam bentuk teks standar bernama **JSON (JavaScript Object Notation)**.

```
       [ ESP32 ]                                             [ SERVER CLOUD ]
   Data Sensor C++ ──► json.dumps() ──► TEKS JSON MURNI ──► json.loads() ──► Python Dict
                         (Packing)       '{"suhu": 30.5}'     (Unpacking)
```

Python memiliki modul bawaan bernama `json` dengan dua fungsi utama:
1. **`json.dumps()` (*Dictionary $\rightarrow$ Teks String JSON*):**  
   Mengemas data dictionary Python menjadi sebaris teks string untuk dikirim lewat kabel/Wi-Fi.
2. **`json.loads()` (*Teks String JSON $\rightarrow$ Dictionary*):**  
   Membongkar teks string kiriman ESP32 kembali menjadi dictionary Python agar mudah diolah.

### Contoh Kode:
```python
import json

# 1. Teks string JSON mentah yang diterima dari jaringan Wi-Fi
pesan_masuk = '{"device": "ESP32-01", "suhu": 32.4, "status": "OK"}'

# 2. Bongkar teks JSON menjadi Dictionary Python
data_dict = json.loads(pesan_masuk)

print("Nama Perangkat :", data_dict["device"]) # Output: ESP32-01
print("Nilai Suhu     :", data_dict["suhu"])   # Output: 32.4

# 3. Ubah kembali Dictionary menjadi string JSON terkompresi untuk disimpan
data_dict["suhu"] = 33.0 # Update nilai
pesan_kirim = json.dumps(data_dict)
print("Pesan Terkirim :", pesan_kirim) # Output: {"device": "ESP32-01", "suhu": 33.0, "status": "OK"}
```

---

## 3. Logika Filter Data: Membuang Nilai Sensor yang Rusak (*Noise Filtering*)

Sensor fisik terkadang mengalami gangguan sesaat (misal: kabel tersenggol sehingga nilai suhu tiba-tiba melonjak menjadi `999.0`). Di Python Gateway, kita bisa membuang data rusak tersebut menggunakan fitur elegan bernama **List Comprehension**:

```python
# Daftar data sensor yang tercampur dengan pembacaan noise rusak
raw_data = [28.2, 28.5, 999.0, 28.4, -50.0, 29.0]

# Filter: Ambil HANYA nilai suhu yang masuk akal (antara 0 °C s/d 50 °C)
clean_data = [suhu for suhu in raw_data if 0.0 <= suhu <= 50.0]

print("Data Mentah Rusak :", raw_data)
print("Data Bersih Siap  :", clean_data) # Output: [28.2, 28.5, 28.4, 29.0]
```

---

## 4. Manajemen Paket & Virtual Environment (`venv`)

Di laptop Anda atau Raspberry Pi, Anda mungkin mengerjakan 3 proyek IoT berbeda:
- Proyek A butuh library `paho-mqtt` versi 1.6.
- Proyek B butuh library `paho-mqtt` versi 2.0.

Jika Anda menginstal library langsung ke sistem operasi (`pip install ...`), kedua library akan saling menimpa dan merusak program Anda (*Dependency Conflict*)!

### Solusinya: Selalu Buat Virtual Environment!
Virtual Environment adalah "ruang isolasi / kamar pribadi" untuk setiap folder proyek Anda.

```
┌────────────────────────────────────────────────────────┐
│  KOMPUTER / RASPBERRY PI                               │
│  ├── Proyek A (Folder A) ──► [ venv-A (paho-mqtt 1.6) ]│ (Terisolasi aman!)
│  └── Proyek B (Folder B) ──► [ venv-B (paho-mqtt 2.0) ]│ (Tidak bentrok!)
└────────────────────────────────────────────────────────┘
```

### 3 Perintah Standar Membuat Virtual Environment di Terminal:
```bash
# 1. Buat folder lingkungan virtual bernama '.venv'
python -m venv .venv

# 2. Aktifkan lingkungan virtual
# Pada Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Pada Linux / Raspberry Pi / macOS:
source .venv/bin/activate

# 3. Sekarang Anda bisa menginstal library apapun dengan aman!
pip install paho-mqtt fastapi uvicorn
```

---

## 5. Pemrograman Asinkron (`asyncio`): Analogi Koki Cerdas

Bayangkan seorang koki di restoran:
- **Koki Tradisional (*Blocking / Synchronous*):** Memasukkan air ke panci, lalu **berdiri diam menatap panci selama 10 menit** sampai mendidih, baru setelah itu mulai memotong wortel. *(Sangat lambat dan membuang waktu!).*
- **Koki Cerdas (*Asynchronous / Non-Blocking*):** Memasukkan air ke panci, menyalakan kompor, lalu **sambil menunggu air mendidih**, koki langsung memotong wortel, mencuci piring, dan menyiapkan bumbu!

```
       BLOCKING (SYNCHRONOUS)                ASYNCHRONOUS (NON-BLOCKING)
       
   Sensor 1 (Tunggu 2 dt) ────┐          Sensor 1 ──► [ MENUNGGU DATA ] ──┐
                              ▼                                           │ (Dikerjakan
   Sensor 2 (Tunggu 2 dt) ────┤          Sensor 2 ──► [ MENUNGGU DATA ] ──┼─► BERSAMAAN!
                              ▼                                           │
   Sensor 3 (Tunggu 2 dt) ────┘          Sensor 3 ──► [ MENUNGGU DATA ] ──┘
   TOTAL WAKTU = 6 DETIK!                TOTAL WAKTU = HANYA 2 DETIK!
```

### Mengapa Asinkron Sangat Krusial di IoT Gateway?
Sebuah gateway Raspberry Pi harus melayani **ratusan sensor ESP32 sekaligus**. Jika gateway menggunakan kode blocking biasa, gateway akan macet/lag setiap kali ada satu sensor yang jaringan Wi-Fi-nya lambat.

### Kode Python Asinkron dengan `async` dan `await`:
```python
import asyncio

# Fungsi asinkron simulasi membaca sensor jarak jauh
async def baca_sensor(nama_sensor, jeda_detik):
    print(f"[{nama_sensor}] Mulai meminta data ke sensor...")
    # 'await' memberitahu CPU: "Sambil menunggu respons jaringan, kerjakan tugas lain!"
    await asyncio.sleep(jeda_detik) 
    print(f"[{nama_sensor}] Data berhasil diterima!")
    return {nama_sensor: 28.5}

async def main():
    print("=== GATEWAY IOT AKTIF: MEMBACA 3 SENSOR SERENTAK ===")
    
    # Menjalankan 3 pembacaan sensor secara bersamaan (Paralel)
    hasil = await asyncio.gather(
        baca_sensor("Sensor-Suhu-Tangki-1", 2),
        baca_sensor("Sensor-Tekanan-Pipa", 2),
        baca_sensor("Sensor-Level-Air", 2)
    )
    
    print("\n=== SEMUA DATA TERKUMPUL ===")
    print(hasil)

# Menjalankan loop event asinkron
asyncio.run(main())
```

> [!NOTE]
> **Hasil Eksekusi:** Ketiga sensor selesai dibaca dalam waktu **hanya 2 detik** (bukan $2+2+2 = 6\text{ detik}$)!

---

## 6. Uji Coba Virtual di Browser (Tanpa Instalasi Apapun)

Mari kita uji skrip Gateway IoT terpadu ini sekarang juga di browser Anda!

### Langkah Praktik (3 Menit):
1. Buka kompiler Python online gratis ini: **[Programiz Python Online Compiler](https://www.programiz.com/python-programming/online-compiler/)**.
2. Hapus seluruh kode di layar editor, lalu salin dan tempelkan program simulasi gateway IoT ini:

```python
import json

def proses_telemetri_gateway(payload_mentah: str):
    print("1. Menerima paket mentah dari ESP32...")
    
    try:
        # A. Deserialisasi teks JSON ke Dictionary
        data = json.loads(payload_mentah)
        
        # B. Ekstraksi data
        device = data.get("device_id", "UNKNOWN")
        suhu = data.get("suhu_celsius", 0.0)
        
        # C. Validasi dan filter anomali
        if suhu < -40.0 or suhu > 85.0:
            print(f"⚠️ PERINGATAN: Nilai suhu {suhu}°C di luar nalar! Data dibuang.")
            return None
        
        # D. Transformasi data (tambahkan status alarm)
        data["is_overheat"] = True if suhu > 35.0 else False
        data["gateway_status"] = "PROCESSED_OK"
        
        print(f"2. Data {device} valid! Suhu: {suhu}°C (Overheat: {data['is_overheat']})")
        
        # E. Serialisasi kembali ke JSON rapi untuk dikirim ke Cloud
        return json.dumps(data, indent=2)

    except json.JSONDecodeError:
        print("❌ ERROR: Format paket bukan JSON yang valid!")
        return None

# UJI COBA: Simulasi 2 paket masuk dari jaringan Wi-Fi
paket_normal = '{"device_id": "ESP32-PROD-01", "suhu_celsius": 38.2, "baterai_volt": 3.7}'
paket_rusak  = '{"device_id": "ESP32-PROD-02", "suhu_celsius": 999.0, "baterai_volt": 3.2}'

print("=== PENGUJIAN PAKET 1 (NORMAL) ===")
hasil_1 = proses_telemetri_gateway(paket_normal)
print("Paket Siap Kirim ke Cloud:\n", hasil_1)

print("\n=== PENGUJIAN PAKET 2 (NOISE RUSAK) ===")
hasil_2 = proses_telemetri_gateway(paket_rusak)
```

3. Klik tombol biru **Run ▶** di bagian atas layar.
4. **Perhatikan:** Konsol akan langsung memvalidasi paket, mendeteksi suhu panas ($38.2^\circ\text{C} \rightarrow$ `is_overheat: true`), dan membuang paket rusak ($999.0^\circ\text{C}$) secara cerdas! 🎉

---

## 7. 📖 Glosarium Istilah Penting Modul 0.5

| Istilah Teknis | Penjelasan Sederhana |
| :--- | :--- |
| **JSON (JavaScript Object Notation)** | Format teks standar universal berbentuk pasangan `{"kunci": "nilai"}` untuk pertukaran data antar sistem. |
| **`json.dumps()`** | Mengubah struktur data Python (Dictionary/List) menjadi teks string JSON (*Serialization*). |
| **`json.loads()`** | Membongkar teks string JSON menjadi struktur data Python (*Deserialization*). |
| **Virtual Environment (`venv`)** | Ruang kerja terisolasi untuk menginstal pustaka/library Python tanpa mengganggu sistem operasi utama. |
| **Asynchronous (`asyncio`)** | Paradigma pemrograman non-blocking di mana CPU tidak perlu menganggur saat menunggu respons jaringan yang lambat. |
| **`async` / `await`** | Kata kunci sakti di Python untuk menandai fungsi asinkron dan titik jeda cerdas penunggu respon I/O. |

---

## 📝 Kuis Refleksi & Pemahaman Diri

Uji pemahaman Anda dengan 3 pertanyaan singkat ini:
1. Apa fungsi dari perintah `json.loads()` saat sebuah Gateway menerima pesan teks dari ESP32?
2. Mengapa di Raspberry Pi kita sangat disarankan menggunakan Virtual Environment (`venv`) sebelum menginstal library via `pip`?
3. Apa perbedaan utama antara proses *Blocking* (Synchronous) vs *Non-Blocking* (Asynchronous) saat membaca 10 sensor melalui koneksi internet?

---

> [!TIP]
> **Status Selesai:**  
> Luar biasa! Anda sekarang telah menguasai dua bahasa inti pilar IoT: **C++ untuk Hardware** dan **Python untuk Gateway/Cloud Data Processing**.  
> Buka file [TODO.md](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/TODO.md) dan tandai `[x]` pada modul 0.5, lalu mari kita tuntaskan modul penutup Fase 0: **[Modul 0.6: Setup Tools Lingkungan Kerja & Simulator Wokwi](file:///c:/Users/anton/vibecoding/Fullstack_IOT_2026/00-fondasi-dasar/README.md)**! 🚀
