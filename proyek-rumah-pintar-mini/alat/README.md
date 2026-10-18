# 🧰 Alat bantu Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](../../en/mini-smart-home/tools/README.md)

Folder ini berisi program-program kecil Node.js yang dibuat di [Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md) dan [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md), lalu dipakai berulang kali di modul-modul berikutnya. Semuanya sudah diuji dengan **Node.js 24.21.0**. Tiga program pertama tidak membutuhkan library dari npm; `pemeriksa-kontrak.js` membutuhkan library **mqtt** 5.16.1 (lihat "Cara memakai").

| File | Gunanya | Dipakai lagi di |
| :--- | :--- | :--- |
| [`generate-dummy.js`](generate-dummy.js) | Membuat bacaan sensor palsu yang bentuknya persis seperti [kontrak data](../../SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini). Jalankan langsung untuk menulis `data/bacaan.json` atau pinjam fungsinya: `import { buatTelemetri } from "./generate-dummy.js";` | Modul 10 (data uji sebelum sensor siap), Modul 16 (simulator perangkat untuk *backend*), Modul 22 (dashboard sebelum ada sensor sungguhan) |
| [`penerima-webhook.js`](penerima-webhook.js) | Server mini di port 3000 yang mencetak setiap kiriman dan membalas `{"ok":true}`. | Modul 10 (ESP32 mengirim bacaan pertamanya lewat WiFi ke laptop), lalu Modul 16 dan 22 sebagai penerima uji |
| [`kirim-data.js`](kirim-data.js) | Pengirim uji: berpura-pura menjadi ESP32 dan mengirim 3 bacaan ke `http://localhost:3000/telemetry`. | Modul 10 dan 16, untuk menguji penerima tanpa papan |
| [`pemeriksa-kontrak.js`](pemeriksa-kontrak.js) | Satpam kontrak data: berlangganan `rpm/#` di broker MQTT, lalu memberi cap **LULUS** atau **GAGAL** pada setiap pesan sesuai [`KONTRAK-DATA.md`](../KONTRAK-DATA.md), lengkap dengan alasannya dan lama setiap jawaban `ack`. | Modul 11 (syarat lulus Node 1 v1.2), Modul 14 (versi 1.1: `telemetry` Node 2 diperiksa dengan kolomnya sendiri), lalu setiap kali firmware berubah atau perangkat baru ditambahkan |

## Cara memakai

Buka folder `alat` ini di terminal (misalnya **Terminal → New Terminal** di VS Code, lalu `cd alat`), kemudian:

```bash
node generate-dummy.js 3
```

```bash
node penerima-webhook.js
```

Biarkan penerima berjalan, lalu buka terminal kedua (**Terminal → Split Terminal**). Lirik *prompt*-nya: kalau belum berakhiran `alat` (biasanya di Windows), ketik `cd alat` dulu; kalau sudah (biasanya di macOS dan Linux), langsung saja. Setelah itu, jalankan:

```bash
node kirim-data.js
```

Hentikan penerima dengan **Ctrl + C**. Penjelasan lengkap setiap baris ada di Modul 4 Praktik 4 dan Praktik 9.

Untuk `pemeriksa-kontrak.js`, pasang dulu library-nya sekali saja (di folder `alat` ini), lalu jalankan selagi broker MQTT menyala:

```bash
npm install mqtt@5.16.1
```

```bash
node pemeriksa-kontrak.js
```

Tanpa tambahan apa pun, pemeriksa menyambung ke broker di laptop yang sama (`127.0.0.1`) dan memeriksa semua topik `rpm/#`; untuk broker di komputer lain, tulis alamatnya di belakang, misalnya `node pemeriksa-kontrak.js 192.168.1.10`. Di broker publik (jalur Wokwi), tulis juga `device_id` perangkatmu supaya hanya pesannya yang diperiksa, misalnya `node pemeriksa-kontrak.js broker.emqx.io 240ac45e114b`. Berhenti dengan **Ctrl + C**; sebelum berhenti, ia mencetak ringkasan LULUS/GAGAL. Penjelasannya ada di Modul 11 Praktik 8.

## Catatan

- `package.json` di folder ini berisi `"type": "module"` supaya `import`/`export` bisa dipakai. File ini dibuat dengan `npm init -y` lalu `npm pkg set type=module`, sama seperti di Modul 4. Sejak Modul 11, ia juga mencatat library `mqtt` di bagian `dependencies`, dan `package-lock.json` mencatat versi persis setiap library pembantunya.
- `.gitignore` menyuruh Git mengabaikan `node_modules/` dan `data/`: data palsu tidak perlu disimpan di repositori proyek.
- **Penerima ini sengaja polos:** siapa pun yang bisa menghubungi laptopmu boleh mengirim apa saja, tanpa kata sandi. Pakai hanya di jaringan rumah. Cara menguncinya dibahas di Modul 20, 21, dan 27.

---

[⬅️ Kembali ke proyek](../README.md) · [Modul 4](../../fase-0-fondasi/modul-04-javascript-nodejs/README.md) · [Silabus](../../SILABUS.md)
