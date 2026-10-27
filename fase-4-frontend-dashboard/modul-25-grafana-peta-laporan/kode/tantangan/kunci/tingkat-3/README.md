# Kunci Tantangan 3 Modul 25: laporan mingguan Senin 07.00

**Tugas:** selain laporan harian, backend mengirim **laporan mingguan** setiap **Senin 07.00 WIB** berisi data **minggu lalu** (Senin 00.00
sampai Senin 00.00 WIB, tujuh hari), memakai kueri, pembuat CSV, dan pengirim berkas yang SAMA dengan laporan harian Praktik 8.

Berkas kunci (hanya yang berubah dari backend 1.2.0, jalur relatif terhadap folder `backend`):

| Berkas | Perubahan |
| :--- | :--- |
| `src/services/laporan-mingguan.ts` | **baru** (74 baris): `rentangMingguan(sekarang)` (hari dalam seminggu dihitung dari tanggal WIB, bukan jam laptop), `namaLaporanMingguan()` → `laporan-mingguan-YYYY-MM-DD.csv` (tanggal Senin awal), `keteranganMingguan()`, `kirimLaporanMingguan()`, `mulaiLaporanMingguan(jadwal)` (node-cron `timezone: "Asia/Jakarta"`, `noOverlap`, "minggu lalu" dihitung dari jam jadwal `konteks.date` seperti laporan harian, jadwal terlewat hanya dikabarkan) |
| `src/services/laporan-mingguan.test.ts` | **baru**, 5 tes (laptop tes sengaja di UTC−4): rentang Senin–Senin WIB, hari lain dalam minggu yang sama, pergantian hari menurut WIB, Telegram mati, isi kiriman |
| `src/services/laporan.ts` | +10/−4: kueri laporan dipisah menjadi `ambilBarisLaporan(dari, sampai)` (diekspor) supaya laporan mingguan memakai kueri yang sama; `kirimLaporan()` memanggilnya. Perilaku laporan harian tidak berubah (12 tesnya tetap lulus) |
| `src/config/env.ts` | +5: setelan `LAPORAN_MINGGUAN_JADWAL`, bawaan `0 7 * * 1` (bidang ke-5 = hari: 1 = Senin), diperiksa seperti `LAPORAN_JADWAL` (5 bidang, `cron.validate`) |
| `src/server.ts` | +2: `mulaiLaporanMingguan(env.LAPORAN_MINGGUAN_JADWAL)` sesudah laporan harian; berhenti bersama `hentikanJadwal()` (`cron.shutdown()`) |
| `.env.example` | +2: `LAPORAN_MINGGUAN_JADWAL=0 7 * * 1` dengan keterangan |

Cara memakai: salin berkas-berkas itu ke folder `backend` proyekmu, lalu `npm run cek` dan `npm test`.

## Mencobanya tanpa menunggu Senin

Seperti gladi laporan harian (Praktik 9): sementara isi `LAPORAN_MINGGUAN_JADWAL` dengan jam beberapa menit ke depan setiap hari,
misalnya `2 23 * * *`, simpan `.env` (backend `npm run dev` mulai ulang sendiri), tunggu, lalu kembalikan ke `0 7 * * 1`. Isinya tetap
"minggu lalu", apa pun harinya.

**Hasilnya (lab penulis, 26 Okt 2026 23.00–23.02 WIB; backend kunci ini sebagai proses kedua, database lab berisi data latihan
`isi-riwayat`, Telegram = server Bot API tiruan):**

```text
INFO: laporan mingguan dijadwalkan: "02 23 * * *" Asia/Jakarta, berikutnya 26 Okt 2026, 23.02 WIB
INFO: laporan mingguan berjalan sesuai jadwal
INFO: Telegram terkirim: berkas laporan-mingguan-2026-10-19.csv (367 byte), 📊 Laporan mingguan Rumah Pintar Mini 19 Okt 2026 - 25 Okt 2026: 3 perangkat
```

Berkas yang diterima tiruan diawali BOM (`EF BB BF`), baris diakhiri CRLF, dan `jumlah_bacaan` per perangkat (1008) sama dengan
`SELECT sum(jumlah_bacaan) FROM readings_per_jam` untuk 19–26 Okt 00.00 WIB. `npm run cek` lulus; `npm test`: `Test Files 15 passed (15)`,
`Tests 101 passed (101)` (backend 1.2: 14 berkas / 96 tes).

## Catatan

- Kolom laporan mingguan sama dengan laporan harian (15 kolom): rata-rata dan jumlah dihitung untuk 7 hari sekaligus, `menyala_ulang`
  dan `kali_terputus` = jumlah selama seminggu.
- Hari pertama sesudah memasang: laporan "minggu lalu" bisa kosong kalau database baru berisi data beberapa hari.
- Seperti laporan harian, laporan mingguan hanya terkirim selama laptop dan backend menyala pada Senin 07.00 (toleransi 15 menit);
  yang terlewat tidak dikirim belakangan.
