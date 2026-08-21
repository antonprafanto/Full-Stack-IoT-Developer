# 🌐 04 - Protokol Nirkabel & Platform Enterprise

Folder ini berisi contoh implementasi protokol nirkabel modern, kompresi data biner, dan integrasi platform IoT enterprise (**Fase 4 & Fase 5**):

## 📂 Struktur Direktori:
- `protobuf-schemas/` : Schema `.proto` dan kode kompilasi Nanopb (C++) serta Python parser.
- `store-and-forward/` : Implementasi buffer antrean LittleFS Flash FIFO untuk kondisi offline.
- `lorawan-chirpstack/` : Konfigurasi node LoRaWAN SX1262/SX1276 dan server ChirpStack v4 (AS923).
- `matter-thread/` : Contoh proyek Matter over Thread (ESP32-C6) dan OpenThread Border Router (OTBR).
- `antares-onem2m/` : Contoh integrasi library resmi `AntaresESP32HTTP` / `AntaresESP32MQTT`, Webhook forwarder, dan Telkom LoRaWAN.

---

## 🎯 Target Pembelajaran:
1. Mengompresi payload data menggunakan Protocol Buffers (Protobuf) untuk menghemat kuota >80%.
2. Memastikan zero data-loss saat sinyal putus berjam-jam menggunakan mekanisme *Store-and-Forward*.
3. Menguasai ekosistem Smart Home global (**Matter/Thread**) dan platform nasional (**Antares.id oneM2M**).
