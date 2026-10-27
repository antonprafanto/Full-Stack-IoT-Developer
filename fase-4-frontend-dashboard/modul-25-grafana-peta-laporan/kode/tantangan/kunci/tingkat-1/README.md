# Kunci Tantangan 1 Modul 25: alert "sinyal lemah"

**Tugas:** aturan alert kedua di Grafana yang mengabari tim teknis kalau sinyal WiFi sebuah node lemah: **rata-rata RSSI 15 menit
terakhir di bawah −75 dBm**. RSSI makin negatif = sinyal makin lemah. Batas −75 dBm hanya *konvensi umum* yang sering dipakai (kira-kira:
di atas −67 dBm bagus, di bawah −80 dBm rawan putus), bukan standar resmi: sesuaikan dengan rumahmu.

Berkas kunci: [`sinyal-lemah.yaml`](sinyal-lemah.yaml), ekspor grup **kesehatan-node** dari Grafana 13.2.4 lab penulis sesudah aturan ini
dibuat **lewat layar** (Alert rules → baris grup `kesehatan-node` → **More** → **Export rules group** → **YAML** → **Download**). Grafana
13.2.4 hanya mengekspor satu grup utuh, jadi berkas itu memuat dua aturan: **Node diam** (sama dengan `grafana/alerting/node-diam.yaml`)
lalu **Sinyal WiFi lemah** (kunci tantangan ini). Berkas itu untuk dibandingkan dengan aturanmu, bukan untuk ditempel: `datasourceUid` di
dalamnya milik Grafana penulis.

## Isi aturan

Buat lewat **Alerting → Alert rules → New alert rule**, dengan cara yang sama seperti aturan **Node diam** di Praktik 4 (mode bawaan,
sakelar **Advanced options** tetap mati). Yang berbeda hanya isinya:

| Bagian layar | Isi |
| :--- | :--- |
| **1.** Name | `Sinyal WiFi lemah` |
| **2.** kueri | data source PostgreSQL (`grafana_baca`) sudah terpilih; ubah **Builder** menjadi **Code**, tempel kueri di bawah; **Format** tetap `Table` (bawaan formulir alert) |
| Alert condition | `WHEN` **Last** `OF QUERY` **IS BELOW** `-75` (pilih **Is below** di menu yang semula **IS ABOVE**). Grafana menyimpannya sebagai A (kueri) → B *Reduce* "Last" → C *Threshold*, sama dengan Node diam |
| **3.** Folder | **Rumah Pintar Mini** |
| **4.** evaluasi | **Select an evaluation group…** → `kesehatan-node` (setiap `1m`, grup Node diam); **Pending period** klik **None** (bawaan formulir `1m`): rata-rata 15 menit sudah meredam naik-turun sinyal |
| Configure no data and error handling | *Alert state if no data or all values are null* **Normal** (bawaan `No Data`); *execution error or timeout* tetap **Error** |
| **5.** notifikasi | **Contact point** `Telegram Rumah Pintar` → **Muting, grouping and timings (optional)** → **Override grouping** → di **Group by** ketik `device_id` lalu Enter (`grafana_folder` dan `alertname` selalu ikut), sama dengan Node diam. Halaman *Notification policies* tidak disentuh: tanpa *contact point* di aturan ini, alert-nya tidak pernah sampai ke Telegram |
| **6.** Summary | `{{ $labels.node }} ({{ $labels.device_id }}): sinyal WiFi lemah, rata-rata {{ with $values.A }}{{ .Value }}{{ end }} dBm dalam 15 menit terakhir` |

Lalu **Save**.

```sql
SELECT h.device_id,
       coalesce(d.nama, h.device_id) AS node,
       round(avg(h.rssi))::float8 AS rssi_rata
FROM device_health h
JOIN devices d ON d.device_id = h.device_id
WHERE h.ts > now() - INTERVAL '15 minutes'
  AND d.terdaftar IS NOT NULL AND d.dicabut IS NULL
GROUP BY h.device_id, d.nama
```

Satu baris = satu node, jadi satu aturan menjaga semua node sekaligus (pola **B** Konsep 7): kolom teks `device_id` dan `node` menjadi
label alert, kolom angka `rssi_rata` menjadi nilainya. Vitals datang tiap 5 menit, jadi 15 menit = sekitar 3 vitals per node.

## Mencobanya tanpa merusak WiFi

RSSI simulator acak antara −40 dan −79 dBm (rata-rata 15 menitnya biasanya sekitar −55 sampai −65), jadi dengan batas −75 aturan ini
tenang. Untuk melihatnya menyala, **sementara** buka aturannya → **Edit**, ubah angka di **Alert condition** menjadi `-50`, **Save**, tunggu
evaluasi berikutnya (≤ 1 menit) ditambah 30 detik (*group wait*), lalu kembalikan ke `-75` dengan cara yang sama.

**Hasilnya (lab penulis, 27 Okt 2026 ±02.32–02.42 WIB, Grafana 13.2.4 + simulator 1 perangkat; Telegram = server Bot API tiruan,
pesan di bawah = teks yang diterimanya):**

```text
02.32.33  Save (aturan baru, batas -75)   Normal (pratinjau: Latihan ruang tamu -63)
02.35.42  Save (batas -50)
02.37.05  🔴 Latihan ruang tamu (f00d00000001): sinyal WiFi lemah, rata-rata -60 dBm dalam 15 menit terakhir
02.38.10  Save (batas -75 lagi)
02.42.05  ✅ Latihan ruang tamu kembali mengirim data.
```

Pesan ✅ memakai baris "pulih" templat *contact point* Praktik 4, yang ditulis untuk Node diam ("kembali mengirim data"); untuk aturan
ini artinya "sinyalnya kembali di atas batas". Kalimatnya ikut templat itu, bukan Summary aturan ini.

## Yang perlu diingat

- **Node 2 tidak punya vitals**, jadi tidak pernah muncul di aturan ini. Node yang berhenti mengirim vitals juga hilang dari hasil kueri;
  bila node itu sedang 🔴 sinyal lemah, hilangnya baris membuat aturan ini mengirim ✅ "kembali mengirim data." padahal node justru diam
  (templat 4.1 dipakai bersama). Diam = tugas aturan **Node diam**, bukan aturan ini.
- RSSI adalah urusan **tim teknis** (Grafana), bukan penghuni rumah: karena itu alert ini tidak dibuat di backend atau dashboard React.
- Jangan menurunkan batas ke angka yang biasa terjadi di rumahmu: alert yang menyala terus akan diabaikan orang.
- Kalau grup `kesehatan-node` diekspor lagi sesudah tantangan ini (misalnya Praktik 9 diulang), berkas `grafana/alerting/node-diam.yaml`
  ikut memuat aturan ini.
