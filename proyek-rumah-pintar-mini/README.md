# 🏠 Proyek Rumah Pintar Mini — versi rujukan

Folder ini berisi **kode proyek benang merah** kurikulum dalam versi terbarunya. Setiap modul menambahkan satu-dua bagian; folder `kode/` di setiap modul menyimpan "potret" pada minggu itu, sedangkan folder ini selalu berisi versi paling baru.

> **Untuk pembelajar:** proyekmu sendiri tinggal di repositori milikmu, `rumah-pintar-mini`, yang dibuat dengan GitHub Desktop di [Modul 3](../fase-0-fondasi/modul-03-cpp-untuk-esp32/README.md#-tambahan-ke-rumah-pintar-mini). Folder ini adalah **kunci jawaban dan rujukan**. Kerangka v0.1.0 (Modul 3), folder `alat/` (Modul 4), dan `PETA-PIN.md` (Modul 5) memang disalin utuh. Mulai Modul 5, isi firmware kamu tulis sendiri dengan panduan di setiap modul — bandingkan dengan milikmu kalau ada yang macet, tetapi jangan menyalinnya mentah-mentah.

## Isi saat ini

| Bagian | Versi | Mulai modul | Keterangan |
| :--- | :--- | :---: | :--- |
| [`firmware/node-1-rumah/`](firmware/node-1-rumah/node-1-rumah.ino) | 0.2.0 | [Modul 3](../fase-0-fondasi/modul-03-cpp-untuk-esp32/README.md), diperbarui di [Modul 5](../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#-tambahan-ke-rumah-pintar-mini) | Program Node 1 "Rumah". Sejak v0.2.0, semua aktuator terpasang di pin kanonik: relay lampu dan kipas, pompa lewat MOSFET, servo tirai, buzzer, dan tombol manual. Bisa dicoba lewat Serial Monitor (`lampu on`, `kipas off`, `pompa 3`, `tirai 90`, `bunyi`, `status`) dan mencetak alasan *restart* saat menyala. Butuh library ESP32Servo 3.2.1. Sensor masih berupa angka contoh. |
| [`PETA-PIN.md`](PETA-PIN.md) | 1 | [Modul 5](../fase-1-esp32-embedded/modul-05-gpio-dan-peta-pin/README.md#3-anggaran-pin-dan-peta-pin-kanonik-node-1-dan-node-2) | Peta pin kanonik Node 1 dan Node 2, pin yang dihindari, pembagian rel daya di meja kerja, dan aturan emas catu daya. Berlaku sampai Modul 28. |
| [`alat/`](alat/README.md) | — | [Modul 4](../fase-0-fondasi/modul-04-javascript-nodejs/README.md) | Tiga alat bantu Node.js: `generate-dummy.js` (bacaan sensor palsu sesuai kontrak data), `penerima-webhook.js` (server mini di port 3000), dan `kirim-data.js` (pengirim uji). Dipakai lagi di Modul 10, 16, dan 22. |

## Yang akan menyusul

Sesuai [struktur di Silabus](../SILABUS.md#9-struktur-folder-repositori): `KONTRAK-DATA.md` (Modul 11), `firmware/node-2-kebun/` (Modul 9 dan 14), `edge/` (Modul 12–15), `backend/` (Modul 16–21), `frontend/` (Modul 22–25), dan `compose.cloud.yml` (Modul 26–27).

---

[⬅️ Kembali ke halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md)
