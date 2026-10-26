# Lembar catatan uji pengguna — dashboard Rumah Pintar Mini v1.0 (Modul 24)

Isi satu lembar untuk setiap penguji. Tulis penguji **tanpa nama lengkap** (misalnya "Penguji 1, kakak, 30-an tahun"). Simpan
lembar yang sudah terisi di `belajar-iot/modul-24/` (➕ F), tanpa sandi, tanpa nama lengkap, tanpa foto wajah.

## Data uji

| Isian | Catatan |
| :--- | :--- |
| Tanggal dan jam (WIB) | |
| Penguji | |
| HP penguji (merek/jenis, browser) | |
| Jalur data (Kit A + B / simulator `f00d00000001`) | |
| Alamat yang dibuka (`http://<IP-laptop>:5173`) | |
| Izin rekam layar/suara (ya/tidak) | |

## Hasil per tugas

Hasil: **berhasil** (tanpa bantuan) / **dibantu** (macet > 2 menit atau dibantu) / **gagal**. Hanya "berhasil" yang dihitung lulus.

| Tugas | Hasil | Lama (mm:ss) | Di mana macet / ragu | Kutipan penguji (tanpa nama) | Bukti log backend |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 Masuk | | | | | `login: akun … (admin), sesi …, IP …` |
| 2 Nyalakan lampu | | | | | `perintah … (api) ke …: lampu = true, ack ok=true …` |
| 3 Aturan siram < 30 % | | | | | `Aturan … dibuat lewat API: …` |
| 4 Keluar | | | | | `logout: sesi …` |

**Bukti aturan siram berlaku** (sesudah tugas 3): kejadian/toast `🌱 Tanah … % — pompa menyiram 5 detik otomatis` (jam: ______),
dan kartu/keadaan pompa `Menyiram` lalu `Diam`.

**L4 (pelajar, akun viewer di HP yang sama):** tombol kendali di layar detail: ada / tidak ada · **+ Aturan baru** dan **Ubah** di
layar Aturan: ada / tidak ada.

## Yang diperbaiki sesudah uji

| Yang membingungkan | Perbaikan (berkas, perubahan) | Diuji ulang? Hasilnya |
| :--- | :--- | :--- |
| | | |

## Contoh format — isian rekaan

> Baris di bawah ini **rekaan**, hanya untuk memperlihatkan cara mengisi. Bukan hasil uji sungguhan.

| Tugas | Hasil | Lama (mm:ss) | Di mana macet / ragu | Kutipan penguji (tanpa nama) | Bukti log backend |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 3 Aturan siram < 30 % | dibantu | 2:40 | mencari "siram" di layar Perangkat, belum menemukan menu **Aturan** | "Aturannya di mana ya, di lampu?" | — (aturan belum dibuat) |

| Yang membingungkan | Perbaikan (berkas, perubahan) | Diuji ulang? Hasilnya |
| :--- | :--- | :--- |
| Menu **Aturan** tidak terlihat dari layar Perangkat | (contoh) tambah kalimat petunjuk di layar Daftar | ya, berhasil 1:10 |
