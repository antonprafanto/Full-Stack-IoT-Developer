# 📜 Kontrak Data — Rumah Pintar Mini

🌐 **Bahasa Indonesia** · [English](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/mini-smart-home/DATA-CONTRACT.md)

> **Versi kontrak 1.2** ([Modul 15](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md), Oktober 2026; versi 1.1 dari Modul 14, versi 1.0 dari Modul 11). Rujukan utamanya adalah [Lampiran A Silabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/SILABUS.md#14-lampiran-a--kontrak-data-rumah-pintar-mini); file ini salinan kerjanya yang ikut tersimpan di proyek. **Aturan mainnya:** setiap perubahan ditulis di sini dan di Lampiran A dulu, baru kodenya diubah, lalu versi firmware dinaikkan.

Kontrak data adalah "bahasa bersama" semua bagian proyek: firmware, broker, alat pemeriksa, *gateway* (Modul 12), Node-RED (Modul 13), *backend* (Modul 16), database (Modul 17), dan dashboard (Modul 22). Selama semuanya mengikuti kontrak ini, setiap bagian bisa dibuat pada minggu yang berbeda dan tetap cocok satu sama lain. Penjelasan lengkapnya ada di [Modul 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md).

## 1. Identitas perangkat

- **`device_id`**: 12 digit heksadesimal **huruf kecil** dari alamat MAC WiFi chip, tanpa titik dua. Contoh: alamat MAC `A4:CF:12:E5:B7:C0` menjadi `a4cf12e5b7c0`. Di firmware dibaca dengan `esp_read_mac(mac, ESP_MAC_WIFI_STA)`.
- Dipakai sebagai bagian topik, nama klien MQTT (*client ID*), dan kelak kunci tabel `devices` (Modul 17), nama pengguna broker (Modul 21), serta identitas pembaruan firmware (Modul 28).
- **Lokasi bukan bagian topik.** "Ruang tamu" atau "kebun" adalah keterangan di database supaya firmware perangkat yang dipindahkan tidak perlu diubah.

## 2. Topik

Awalan `rpm` = Rumah Pintar Mini. Topik selalu huruf kecil dan **tidak** diawali garis miring.

| Topik | Arah | Isi | *Retained* | Kapan |
| :--- | :--- | :--- | :---: | :--- |
| `rpm/<device_id>/telemetry` | perangkat → broker | semua bacaan sensor dalam satu JSON | tidak | Node 1: setiap 10 detik, dan segera saat ada kejadian penting. Node 2: sekali setiap kali bangun (5 menit), diterbitkan Node 1 |
| `rpm/<device_id>/status` | perangkat → broker | teks `online`, `offline`, atau `offline-mode` | **ya** | `online` saat tersambung; `offline` diterbitkan broker (*Last Will*). Node 2: keduanya diterbitkan Node 1 (bagian 5) |
| `rpm/<device_id>/vitals` | perangkat → broker | kesehatan perangkat | tidak | sekali setelah tersambung, lalu setiap 5 menit |
| `rpm/<device_id>/cmd` | broker → perangkat | satu perintah | hanya `config` (Modul 19) | kapan saja |
| `rpm/<device_id>/ack` | perangkat → broker | jawaban atas satu perintah | tidak | segera setelah perintah diterima |

Node 2 (ESP-NOW) tidak tersambung ke broker. Mulai Modul 14, **Node 1 menerbitkan atas namanya** di `rpm/<device_id Node 2>/telemetry` dan `/status`: Node 1 menerima paket ESP-NOW Node 2, memberinya `ts`, menahannya selama broker tidak terjangkau, lalu menerbitkannya dengan `device_id` Node 2. `device_id` Node 2 dibuat dengan cara yang sama, dari alamat MAC WiFi Node 2. Node 2 tidak mengirim `vitals` dan tidak menerima `cmd`.

*Wildcard* yang sering dipakai pelanggan: `rpm/+/status` (status semua perangkat), `rpm/<device_id>/#` (semua pesan satu perangkat), dan `rpm/#` (seluruh proyek).

## 3. Sambungan MQTT setiap perangkat

| Hal | Ketentuan |
| :--- | :--- |
| Versi MQTT | 3.1.1 |
| Alamat broker | di jaringan rumah: alamat IP (bukan nama) dan port `1883`; aturan untuk broker di internet (TLS, port `8883`) menyusul di Modul 27 |
| Nama klien (*client ID*) | `device_id` |
| *Clean session* | `true`: perintah lama tidak disimpan selama perangkat mati |
| *Keep-alive* | 15 detik (broker menyatakan perangkat hilang setelah 22,5 detik) |
| Wasiat (*Last Will*) | topik `status`, isi `offline`, QoS 1, *retained* |
| Setelah tersambung | terbitkan `online` (*retained*), lalu berlangganan `cmd` dengan QoS 1 |
| QoS terbitan | `telemetry`, `vitals`, `ack`: QoS 0 |
| Wadah pesan | paling sedikit 512 byte (`setBufferSize(512)`) |
| Menyambung ulang | paling sering setiap 5 detik, setiap percobaan paling lama sekitar 1 detik |

## 4. `telemetry`

```json
{"ts":"2026-10-18T01:30:12Z","fw":"1.2.0","suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64}
```

| Kolom | Tipe | Satuan dan rentang | Sensor Node 1 (pin) | Kalau bacaan gagal |
| :--- | :--- | :--- | :--- | :--- |
| `ts` | teks | waktu UTC ISO-8601, misalnya `2026-10-18T01:30:12Z`, dibuat perangkat saat bacaan diambil | jam NTP | pesan tidak diterbitkan |
| `fw` | teks | versi firmware SemVer, misalnya `1.2.0` | — | — |
| `suhu` | angka desimal, satu angka di belakang koma | °C, −40 sampai 80 | DHT22 (D14) | `null` |
| `kelembapan` | bilangan bulat | % kelembapan relatif, 0–100 | DHT22 (D14) | `null` |
| `cahaya` | bilangan bulat | 0 (gelap gulita) sampai 4095 (sangat terang) | LDR + 10 kΩ (VP/GPIO 36) | — |
| `tanah` | bilangan bulat | %, 0 = sekering di udara, 100 = sebasah di air | sensor tanah kapasitif (VN/GPIO 39) | — |
| `gerak` | boolean | `true` = PIR melihat gerakan | PIR HC-SR501 (D34) | — |
| `level_air` | bilangan bulat | % isi tandon, 0 = kosong, 100 = penuh | HC-SR04 (TRIG D15, ECHO D35) | `null` |

**Kiriman segera** (*report-by-exception*) terjadi saat salah satu keadaan ini **berubah**: ada atau tidaknya gerakan; gelap atau terang (gelap = `cahaya` di bawah `1000`); tanah di bawah atau di atas ambang siram; air tandon di bawah atau di atas 20 %. Kiriman segera paling sering setiap 2 detik, dan jadwal 10 detik berikutnya dihitung dari kiriman terakhir.

### Kolom sensor RS-485 di `telemetry` Node 1 (mulai kontrak 1.2, Modul 15)

Tiga kolom ini hanya ada kalau sensor tanah RS-485 terpasang dan dinyalakan dengan perintah `rs485 on` di Node 1. Ketiganya selalu datang bersama; kalau sensornya tidak dipakai, ketiganya tidak ditulis sama sekali.

```json
{"ts":"2026-10-19T02:10:05Z","fw":"1.4.0","suhu":28.5,"kelembapan":71,"cahaya":2310,"tanah":37,"gerak":false,"level_air":64,"tanah_rs485":58.5,"suhu_tanah":25.3,"ec":1200}
```

| Kolom | Tipe | Satuan dan rentang | Sumber (Modbus RTU, fungsi 03) | Kalau bacaan gagal |
| :--- | :--- | :--- | :--- | :--- |
| `tanah_rs485` | angka desimal, satu angka di belakang koma | % kelembapan tanah menurut sensor RS-485, 0–100 | loker 0 dibagi 10 | `null` |
| `suhu_tanah` | angka desimal, satu angka di belakang koma | °C, −55 sampai 125 (nama dan artinya sama dengan kolom Node 2) | loker 1 dibagi 10, bertanda | `null` |
| `ec` | bilangan bulat | µS/cm (daya hantar listrik tanah), 0–20.000 | loker 2 | `null` |

Sensor RS-485 dibaca setiap 10 detik; `telemetry` membawa bacaan terakhirnya. Kalau pembacaan terakhir gagal (sensor tidak menjawab, CRC salah, atau *exception*), ketiga kolom ditulis `null`. Nama `tanah_rs485` sengaja dibedakan dari `tanah`: Node 1 sudah punya `tanah` dari sensor kapasitif, dan kedua alat mengukur dengan cara dan skala yang berbeda. Peta loker di atas milik sensor tiruan Modul 15; sensor sungguhan punya peta sendiri, tetapi kolomnya tetap sama.

### `telemetry` Node 2 (mulai kontrak 1.1, Modul 14)

```json
{"ts":"2026-10-25T01:30:12Z","fw":"1.0.0","suhu":29.4,"kelembapan":78,"tekanan":1008.6,"suhu_tanah":27.3,"tanah":41}
```

| Kolom | Tipe | Satuan dan rentang | Sensor Node 2 (pin) | Kalau bacaan gagal |
| :--- | :--- | :--- | :--- | :--- |
| `ts` | teks | waktu UTC ISO-8601, **dibuat Node 1 saat paket ESP-NOW diterima** | jam NTP Node 1 | pesan ditahan sampai jam Node 1 disetel |
| `fw` | teks | versi firmware **Node 2** (dibawa paket), misalnya `1.0.0` | — | — |
| `suhu` | angka desimal, satu angka di belakang koma | °C udara, −40 sampai 80 | BME280 (I2C: D21/D22) | `null` |
| `kelembapan` | bilangan bulat | % kelembapan relatif, 0–100 | BME280 | `null` |
| `tekanan` | angka desimal, satu angka di belakang koma | hPa, 300–1.100 | BME280 | `null` |
| `suhu_tanah` | angka desimal, satu angka di belakang koma | °C, −55 sampai 125 | DS18B20 (D27) | `null` |
| `tanah` | bilangan bulat | %, hasil kalibrasi dua titik sensor tanah ke-2 | sensor tanah kapasitif ke-2 (VN/GPIO 39, listriknya dari D32) | `null` |
| `baterai` | angka desimal, dua angka di belakang koma | volt baterai, 2,5–4,5 | pembagi tegangan (VP/GPIO 36), **pilihan** | `null`; kolomnya tidak ada kalau tidak dipasang |

**Kolom menurut perangkat.** Setiap perangkat hanya menulis kolom sensor yang ia punya: Node 1 tidak pernah menulis `tekanan`, dan Node 2 tidak pernah menulis `cahaya`. Kolom sensor yang tidak dipasang tidak ditulis; kolom sensor yang gagal dibaca ditulis `null`. Nama yang sama berarti hal yang sama (`suhu` = suhu udara di sekitar perangkat, `tanah` = persen kelembapan tanah, `suhu_tanah` = suhu tanah, baik dari DS18B20 Node 2 maupun dari sensor RS-485 Node 1) supaya database dan grafik bisa membandingkan rumah dan kebun tanpa kolom baru.

## 5. `status`

Teks biasa, bukan JSON:

| Isi | Artinya | Diterbitkan oleh |
| :--- | :--- | :--- |
| `online` | perangkat tersambung | perangkat, setiap kali berhasil menyambung |
| `offline` | perangkat hilang tanpa pamit (listrik padam, WiFi putus, macet) | broker, dari wasiat perangkat |
| `offline-mode` | perangkat sengaja berhenti, misalnya sebelum pembaruan firmware | perangkat (dipakai mulai Modul 28) |

**Status Node 2** diterbitkan **Node 1** (*retained*): `online` saat paket sah pertama dari Node 2 tiba, `offline` kalau tidak ada paket selama **3 × jeda Node 2 + 1 menit** (jeda 5 menit = 16 menit). Node 2 tidak punya sambungan MQTT sendiri, jadi tidak punya wasiat. Karena itu, status Node 2 berarti "Node 1 masih mendengar Node 2", dan baru bisa dipercaya selama status Node 1 sendiri `online`.

## 6. `vitals`

```json
{"ts":"2026-10-18T01:30:00Z","rssi":-61,"uptime_s":86400,"heap_free":183200}
```

| Kolom | Isi |
| :--- | :--- |
| `ts` | waktu UTC, seperti di `telemetry` |
| `rssi` | kekuatan sinyal WiFi dalam dBm, bilangan bulat negatif |
| `uptime_s` | sudah berapa detik perangkat menyala |
| `heap_free` | sisa memori *heap* dalam byte |
| `reset_reason` | **mulai Modul 28:** `POWERON`, `BROWNOUT`, `SW`, `PANIC`, `WDT`, `DEEPSLEEP`, atau `UNKNOWN` |

## 7. `cmd`

```json
{"id":"c-20261018-0001","ts":"2026-10-18T01:31:05Z","aksi":"set","target":"lampu","nilai":true}
```

| Kolom | Isi |
| :--- | :--- |
| `id` | teks unik untuk setiap perintah, paling panjang 39 huruf; perangkat menjawab dengan `id` yang sama |
| `ts` | waktu perintah dibuat (UTC). Boleh dilewati saat perintah diketik manual di MQTTX |
| `aksi` | `set`, `config` (Modul 19), atau `update` (Modul 28) |

**`aksi: "set"`** menggerakkan satu aktuator:

| `target` | `nilai` | Catatan |
| :--- | :--- | :--- |
| `lampu` | `true` / `false` | relay D32 |
| `kipas` | `true` / `false` | relay D33 |
| `pompa` | bilangan bulat 1–10 (detik) | ditolak kalau air tandon di bawah 20 % atau tidak terbaca |
| `tirai` | bilangan bulat 0–180 (derajat) | servo D26 |

**`aksi: "config"`** (Modul 19) membawa `ambang`, misalnya `{"suhu_kipas_on":30,"tanah_siram":30}`, dikirim *retained*, dan disimpan perangkat di NVS. **`aksi: "update"`** (Modul 28) membawa `url` dan `versi` firmware baru. Sampai modul-modul itu, perangkat menjawab keduanya dengan `ok:false`.

**Jangan pernah** mengirim perintah `set` dengan tanda *retained*: broker menyerahkannya lagi setiap kali perangkat menyambung, dan perangkat mengerjakannya lagi begitu ingatan `id`-nya kosong, misalnya setelah *restart* (bagian 9, aturan 8).

## 8. `ack`

```json
{"id":"c-20261018-0001","ts":"2026-10-18T01:31:05Z","ok":true,"state":{"kipas":false,"lampu":true,"pompa":false,"tirai":90}}
{"id":"c-20261018-0002","ts":"2026-10-18T01:31:40Z","ok":false,"pesan":"nilai pompa harus 1-10 detik","state":{"kipas":false,"lampu":true,"pompa":false,"tirai":90}}
```

| Kolom | Isi |
| :--- | :--- |
| `id` | sama dengan `id` perintahnya |
| `ts` | waktu jawaban (UTC), atau `null` kalau jam perangkat belum disetel |
| `ok` | `true` kalau perintah dikerjakan, `false` kalau ditolak |
| `pesan` | alasan penolakan; **wajib** ada kalau `ok` bernilai `false` |
| `state` | keadaan **semua** aktuator saat ini: `kipas`, `lampu`, `pompa` (boolean), `tirai` (derajat) |

## 9. Aturan bersama

1. `ts` dibuat perangkat, bukan server, supaya data susulan (Modul 27) tercatat pada waktu kejadian. Node 2 tidak punya jam yang bisa dipercaya, jadi `ts`-nya dibuat **Node 1**, perangkat penghubungnya di rumah, saat paket ESP-NOW diterima, dan tetap dipakai walaupun pesannya baru terbit belakangan (misalnya setelah router mati).
2. Database menolak duplikat `(device_id, ts)` (Modul 17).
3. `telemetry` setiap 10 detik **dan** segera saat ada kejadian penting (bagian 4). Node 2: sekali setiap kali bangun, tanpa kiriman segera.
4. Setiap `cmd` dijawab satu `ack` dengan `id` yang sama dalam 5 detik; target Node 1 di bawah 1 detik. Pesan yang bukan JSON, tanpa `id`, atau ber-`id` lebih dari 39 huruf tidak bisa dijawab dan hanya dicatat di log perangkat.
5. `cmd` berjenis `config` dikirim *retained* dan disimpan perangkat di NVS sebagai dasar aturan pengaman lokal (Modul 19).
6. Perangkat hanya boleh menulis ke topik `device_id`-nya sendiri; aturan ini ditegakkan oleh daftar izin broker (Modul 21). Satu pengecualian: Node 1 juga menulis `telemetry` dan `status` Node 2, dan daftar izin Modul 21 mencatatnya.
7. Bacaan gagal ditulis `null` di JSON, untuk semua kolom. Angka penanda seperti `-1` tidak pernah keluar dari perangkat.
8. Perintah ber-`id` sama hanya dikerjakan sekali; perangkat mengingat paling sedikit delapan `id` terakhir dan mengabaikan pengulangannya. Ingatan ini hilang saat perangkat *restart*, jadi perintah `set` tidak boleh dikirim *retained* (bagian 7).
9. Setiap perangkat hanya mengirim kolom sensor yang ia punya (bagian 4, "Kolom menurut perangkat").

## 10. Memeriksa kepatuhan

Jalankan [`alat/pemeriksa-kontrak.js`](alat/pemeriksa-kontrak.js) (`node pemeriksa-kontrak.js` di folder `alat`, setelah `npm install`). Ia berlangganan `rpm/#` dan memberi cap **LULUS** atau **GAGAL** pada setiap pesan, lengkap dengan alasannya dan lama jawaban setiap `ack`. Di broker publik, tulis juga `device_id`-mu di belakang alamat broker (`node pemeriksa-kontrak.js broker.emqx.io <device_id>`) supaya hanya pesan perangkatmu yang diperiksa. Setiap perubahan firmware harus lolos pemeriksaan ini sebelum di-*commit*. Sejak kontrak 1.1, pemeriksa mengenali `telemetry` Node 2 dari kolom khasnya, memeriksanya dengan daftar kolom Node 2, dan menandainya `(telemetry Node 2)`. Sejak kontrak 1.2 (pemeriksa versi 1.2), kolom khas itu adalah `tekanan` karena `suhu_tanah` kini juga bisa datang dari Node 1; pemeriksa juga memastikan tiga kolom RS-485 Node 1 selalu lengkap.

## 11. Riwayat perubahan

| Versi kontrak | Modul | Perubahan |
| :--- | :--- | :--- |
| 1.2 | Modul 15 | Node 1 boleh membawa tiga kolom sensor tanah RS-485 (Modbus RTU): `tanah_rs485`, `suhu_tanah`, dan `ec`, selalu bersama dan hanya kalau sensornya dipasang dan dinyalakan (`rs485 on`); `null` kalau pembacaan terakhir gagal. Data Node 2 tidak berubah. |
| 1.1 | Modul 14 | Node 2 lewat Node 1: kolom baru `tekanan`, `suhu_tanah`, dan `baterai` (pilihan); kolom sensor menurut perangkat (aturan 9); `ts` Node 2 dibuat Node 1 saat paket diterima; `status` Node 2 diterbitkan Node 1; `tanah` Node 2 boleh `null`; Node 1 boleh menulis topik Node 2 (aturan 6). Data Node 1 tidak berubah. |
| 1.0 | Modul 11 | Kontrak mulai dipakai lewat MQTT. Ditetapkan: bacaan gagal ditulis `null`; *client ID* = `device_id`; `telemetry` setiap 10 detik ditambah kiriman segera; `vitals` tanpa `reset_reason` sampai Modul 28; kolom `pesan` di `ack`; target `set` beserta rentang nilainya; `id` perintah paling panjang 39 huruf; perintah ber-`id` sama diabaikan. |

## Perangkatku

Isi tabel ini di salinan milikmu sendiri (repositori `rumah-pintar-mini`).

| Perangkat | `device_id` | Broker | Catatan |
| :--- | :--- | :--- | :--- |
| Node 1 "Rumah" | | | |
| Node 2 "Kebun" (mulai Modul 14) | | | |

---

[⬅️ Kembali ke proyek](README.md) · [Modul 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md) · [Silabus](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/SILABUS.md)
