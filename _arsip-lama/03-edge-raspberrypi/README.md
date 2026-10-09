# 🍓 03 - Edge Gateway & Linux Systems (Raspberry Pi)

Folder ini berisi skrip Python gateway, konfigurasi servis Linux, dan komunikasi protokol industri (**Fase 4 & Fase 7**):

## 📂 Struktur Direktori:
- `modbus-poller/` : Skrip pembacaan sensor/alat industri Modbus RTU (RS-485) & Modbus TCP.
- `systemd-services/` : File unit `systemd` (`iot-gateway.service`) dengan auto-restart dan log journal.
- `os-hardening/` : Skrip konfigurasi *OverlayFS (Read-Only Root Filesystem)* dan `log2ram`.
- `local-broker/` : Konfigurasi Mosquitto MQTT lokal dengan TLS dan bridging ke cloud.
- `edge-analytics/` : Implementasi Kalman Filter dan database lokal DuckDB/SQLite.

---

## 🎯 Target Pembelajaran:
1. Membangun Linux Edge Gateway yang tahan banting terhadap mati listrik mendadak (*Anti-SD Card Corruption*).
2. Membaca Power Meter 3-Phase industri melalui bus RS-485 Modbus.
3. Melakukan pemfilteran noise data sensor langsung di Edge sebelum dikirim ke Cloud.
