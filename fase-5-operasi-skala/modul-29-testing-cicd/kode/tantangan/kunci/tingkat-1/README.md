# Kunci Tantangan 1 Modul 29: Pi bertanya setiap 5 menit

**Tugas (ubah sedikit):** 15 menit terasa lama saat kamu sedang berlatih memasang rilis. Buat Pi bertanya "ada rilis baru?"
setiap 5 menit, **tanpa** mengubah `skrip/systemd/rumahpintar-perbarui.timer` di repo (berkas itu tetap 15 menit), lalu
buktikan jedanya dari jurnal.

> [!NOTE]
> **Belum dijalankan penulis di systemd sungguhan.** Penulis tidak menyalakan systemd di Pi-nya untuk Modul 29 (systemd mesin
> penulis tidak boleh diubah); isi berkas di bawah mengikuti dokumen `systemd.timer` dan `systemd.unit` (bagian *drop-in*) dan
> diperiksa dengan `systemd-analyze verify` (systemd 259, tanpa menyalakan systemd). Jalankan langkahnya di Pi-mu sendiri dan
> cocokkan dengan "Hasil yang benar".

| Berkas kunci | Ditaruh di Pi sebagai |
| :--- | :--- |
| [`rumahpintar-perbarui.timer.d/jeda-5-menit.conf`](rumahpintar-perbarui.timer.d/jeda-5-menit.conf) | `/etc/systemd/system/rumahpintar-perbarui.timer.d/jeda-5-menit.conf` |

## Jawabannya

Berkas *drop-in*: folder `<nama unit>.d/` di sebelah berkas unit, berisi berkas `.conf` yang **menimpa sebagian** isi unitnya.
Berkas aslinya tidak disentuh, jadi salinan dari repo tetap sama dengan milik pembaca lain, dan tantangan ini mudah dibatalkan.

```ini
[Timer]
OnUnitActiveSec=
OnBootSec=5min
OnUnitActiveSec=5min
```

Baris kosong `OnUnitActiveSec=` itulah intinya. Setelan jadwal seperti `OnUnitActiveSec=` boleh ditulis berkali-kali, dan
**semua** nilainya berlaku bersamaan. Nilai kosong mengosongkan **semua** jadwal timer itu dulu, bukan hanya
`OnUnitActiveSec=`: `OnBootSec=5min` dari berkas aslinya ikut terhapus. Karena itu `OnBootSec=5min` ditulis lagi. Tanpa baris
itu semuanya tampak benar sampai Pi dinyalakan ulang: `OnUnitActiveSec=` dihitung dari putaran sebelumnya, padahal sesudah
menyala belum ada putaran apa pun, jadi tidak ada yang membangunkan timer dan Pi diam-diam berhenti memasang rilis (menurut
dokumen `systemd.timer`). `systemd-analyze verify` TIDAK menangkap kesalahan ini (timer masih punya satu jadwal), tetapi
memperlihatkan aturannya: *drop-in* yang hanya berisi `OnUnitActiveSec=` membuatnya menulis `Timer unit lacks value setting`,
artinya `OnBootSec=5min` dari berkas aslinya ikut terhapus.

Tanpa baris kosong, Pi punya dua jadwal: 15 menit yang lama DAN 5 menit yang baru. Hasilnya kebetulan tetap ±5 menit, tetapi
coba ganti `5min` menjadi `30min` tanpa baris kosong: jadwal 15 menit yang lama diam-diam tetap berjalan, dan Pi tetap
bertanya setiap ±15 menit.

Pasang (di Pi):

```bash
sudo mkdir -p /etc/systemd/system/rumahpintar-perbarui.timer.d
sudo nano /etc/systemd/system/rumahpintar-perbarui.timer.d/jeda-5-menit.conf
```

Tempel isi berkas kunci, simpan (**Ctrl + O**, **Enter**, **Ctrl + X**), lalu periksa timernya (tanpa keluaran = tidak ada
salah tulis; `systemd-analyze verify` membaca berkas *drop-in* di folder `.timer.d` sekalian) dan nyalakan ulang:

```bash
systemd-analyze verify /etc/systemd/system/rumahpintar-perbarui.timer
sudo systemctl daemon-reload
sudo systemctl restart rumahpintar-perbarui.timer
```

(Cara lain tanpa menyalin berkas: `sudo systemctl edit rumahpintar-perbarui.timer` membuka penyunting untuk berkas *drop-in*
`override.conf` di folder yang sama; tulis empat baris `[Timer]` di atas di tempat yang ditunjuk, simpan, dan systemd langsung
membaca ulang.)

## Hasil yang benar

- `systemctl cat rumahpintar-perbarui.timer` menampilkan DUA berkas: unit aslinya (`OnUnitActiveSec=15min`) dan, di bawahnya,
  `# /etc/systemd/system/rumahpintar-perbarui.timer.d/jeda-5-menit.conf` dengan dua baris `OnUnitActiveSec` dan satu
  `OnBootSec`.
- `systemctl show rumahpintar-perbarui.timer -p TimersMonotonic` memuat `OnBootUSec=5min` **dan** `OnUnitActiveUSec=5min`
  (tanpa `15min`). Kalau `OnBootUSec` tidak ada, Pi berhenti memasang rilis sesudah dinyalakan ulang.
- `systemctl list-timers rumahpintar-perbarui.timer`: putaran berikutnya paling lambat ±7 menit lagi (5 menit + acak 0–60 detik
  + ketelitian jam weker systemd, bawaannya sampai 1 menit).
- `journalctl -u rumahpintar-perbarui.service --since "30 min ago"`: baris `sudah terpasang` (atau `terpasang`) berjarak ±5–7
  menit, bukan ±15–17 menit.

Membatalkan: `sudo rm -r /etc/systemd/system/rumahpintar-perbarui.timer.d`, lalu `sudo systemctl daemon-reload` dan
`sudo systemctl restart rumahpintar-perbarui.timer`.

Jangan memendekkannya sampai hitungan detik: setiap putaran menghubungi GitHub, dan putaran yang memasang rilis memakai CPU,
jaringan, serta kartu microSD Pi. 5 menit sudah lebih dari cukup untuk berlatih.
