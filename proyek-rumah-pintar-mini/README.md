# 🏠 Proyek Rumah Pintar Mini — versi rujukan

Folder ini berisi **kode proyek benang merah** kurikulum dalam versi terbarunya. Setiap modul menambahkan satu-dua bagian; folder `kode/` di setiap modul menyimpan "potret" pada minggu itu, sedangkan folder ini selalu berisi versi paling baru.

> **Untuk pembelajar:** proyekmu sendiri tinggal di repositori milikmu, `rumah-pintar-mini`, yang dibuat dengan GitHub Desktop di [Modul 3](../fase-0-fondasi/modul-03-cpp-untuk-esp32/README.md#-tambahan-ke-rumah-pintar-mini). Folder ini adalah **kunci jawaban dan rujukan**. Kerangka v0.1.0 (Modul 3) dan folder `alat/` (Modul 4) memang disalin utuh; mulai Modul 5 kamu mengisinya sendiri — bandingkan dengan milikmu kalau ada yang macet, tetapi jangan menyalinnya mentah-mentah.

## Isi saat ini

| Bagian | Versi | Mulai modul | Keterangan |
| :--- | :--- | :---: | :--- |
| [`firmware/node-1-rumah/`](firmware/node-1-rumah/node-1-rumah.ino) | 0.1.0 | [Modul 3](../fase-0-fondasi/modul-03-cpp-untuk-esp32/README.md) | Kerangka program Node 1 "Rumah": fungsi-fungsi berlabel yang diisi bertahap di Modul 5–19. Sudah bisa dijalankan: mencetak bacaan contoh ke Serial Monitor dan mengedipkan LED status di D4. |
| [`alat/`](alat/README.md) | — | [Modul 4](../fase-0-fondasi/modul-04-javascript-nodejs/README.md) | Tiga alat bantu Node.js: `generate-dummy.js` (bacaan sensor palsu sesuai kontrak data), `penerima-webhook.js` (server mini di port 3000), dan `kirim-data.js` (pengirim uji). Dipakai lagi di Modul 10, 16, dan 22. |

## Yang akan menyusul

Sesuai [struktur di Silabus](../SILABUS.md#9-struktur-folder-repositori): `PETA-PIN.md` (Modul 5), `KONTRAK-DATA.md` (Modul 11), `firmware/node-2-kebun/` (Modul 9 dan 14), `edge/` (Modul 12–15), `backend/` (Modul 16–21), `frontend/` (Modul 22–25), dan `compose.cloud.yml` (Modul 26–27).

---

[⬅️ Kembali ke halaman depan](../README.md) · [Silabus](../SILABUS.md) · [Pelacak progres](../PROGRES.md)
