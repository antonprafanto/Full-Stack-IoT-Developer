# Kode Modul 4 — JavaScript & Node.js

Folder ini berisi **semua kode Modul 4**. Isinya hampir sama dengan folder `modul-04` milikmu di akhir modul: bedanya, di sini tidak ada tangkapan layar `server-mini.png`, dan ada tambahan contoh 🔬 di folder `bonus/`. Setiap file sudah diuji dengan **Node.js 24.21.0** dan **npm 11.19.0**.

| File | Dipakai di | Isinya |
| :--- | :--- | :--- |
| [`halo.js`](halo.js) | Praktik 3 | Program pertama: nama, umur, dan jam sekarang. |
| [`package.json`](package.json) | Praktik 4 dan 7 | "KTP proyek": `"type": "module"` dan daftar library (dayjs). |
| [`generate-dummy.js`](generate-dummy.js) | Praktik 4 | Pembuat bacaan sensor palsu sesuai kontrak data (Lampiran A Silabus). |
| [`data/bacaan.json`](data/bacaan.json) | Praktik 4–5, 7 | Contoh hasil `generate-dummy.js`: 100 bacaan. |
| [`statistik.js`](statistik.js) | Praktik 5 ⭐ | Suhu terendah, tertinggi, dan rata-rata dari 100 bacaan. |
| [`tunggu.js`](tunggu.js) | Praktik 6 ⭐ | Simulasi menunggu sensor dengan `Promise` dan `await`. |
| [`waktu.js`](waktu.js) | Praktik 7 | Memakai library dayjs dari npm. |
| [`package-lock.json`](package-lock.json) | Praktik 7 | "Struk belanja": versi persis library yang terpasang. |
| [`.gitignore`](.gitignore) | Praktik 7 | Memberi tahu Git agar mengabaikan folder `node_modules/`. |
| [`cuaca.js`](cuaca.js) | Praktik 8 | Cuaca terkini dari API Open-Meteo (butuh internet). |
| [`penerima-webhook.js`](penerima-webhook.js) | Praktik 9 ⭐ | Server mini di port 3000 yang mencetak setiap kiriman. |
| [`kirim-data.js`](kirim-data.js) | Praktik 9 ⭐ | Mengirim 3 bacaan palsu ke `penerima-webhook.js`. |
| [`bonus/`](bonus/) | 🔬 Bedah Teknis | `urutan-event-loop.js`, `tanpa-membeku.js`, dan `cek-ejaan.js`. |

## Cara menjalankan folder ini

1. Unduh atau *clone* repositori ini, lalu buka folder `kode` ini di VS Code (**File → Open Folder…**).
2. Buka terminal (**Terminal → New Terminal**) dan pasang library-nya sekali saja:

   ```bash
   npm install
   ```

   Lalu, npm membaca `package.json` dan `package-lock.json`, kemudian memasang dayjs versi 1.11.23 ke folder `node_modules/`.
3. Jalankan file mana pun dengan `node nama-file.js`, misalnya `node statistik.js`. File di folder `bonus/` dijalankan dengan menyebut foldernya, misalnya `node bonus/urutan-event-loop.js`. Untuk Praktik 9, jalankan `node penerima-webhook.js` di satu terminal dan `node kirim-data.js` di terminal kedua.

Langkah lengkapnya, beserta penjelasan setiap baris, ada di [README Modul 4](../README.md).
