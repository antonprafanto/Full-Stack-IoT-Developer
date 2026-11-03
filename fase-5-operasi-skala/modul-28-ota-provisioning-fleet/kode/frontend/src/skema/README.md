# `src/skema/` — salinan skema dari backend

`kontrak.ts` dan `aturan-dasar.ts` di folder ini adalah **SALINAN** dari `backend/src/schemas/` (Modul 24). Dengan salinan ini, formulir di browser memeriksa isian dengan aturan yang persis sama dengan backend, dan jawaban `ack` diperiksa dengan skema yang sama dengan yang dipakai server.

- **Jangan mengubah salinannya di sini.** Ubah di backend dulu, salin ulang kedua berkas ke folder ini, lalu jalankan `npm run cek-skema` dari folder `frontend`. Hasil yang benar: dua baris `SAMA`. Akhir baris CRLF (Windows) dan LF dianggap sama.
- **Kenapa disalin, bukan diimpor dari `../backend`?** `backend/src/schemas/aturan.ts` memakai node-cron, yang tidak bisa jalan di browser (halaman menjadi putih). Selain itu frontend harus bisa di-*build* sendirian, tanpa folder `backend` dan `node_modules`-nya. Backend tetap memeriksa ulang setiap isian, termasuk ekspresi cron yang tidak bisa diperiksa di browser.
- Kedua salinan mengimpor dengan akhiran `.ts` (`./kontrak.ts`), sama dengan gaya backend. Frontend mengizinkannya lewat `allowImportingTsExtensions` di `tsconfig.app.json`; berkas frontend lainnya tetap mengimpor tanpa akhiran.
- `kontrak.ts` memanggil `z.config(z.locales.id())`, jadi semua pesan galat bawaan Zod di dashboard berbahasa Indonesia.
- Sejak Modul 28, `kontrak.ts` adalah kontrak data **1.6** (backend 1.5). Layar Armada memakai aturan versinya untuk kolom versi formulir **Unggah firmware**: `Versi` sendiri tidak diekspor berkas itu, jadi dipinjam lewat `LaporanOta.shape.versi` (aturan yang sama: `x.y.z`), ditambah satu pemeriksaan di formulir itu sendiri: tanpa nol di depan (`1.07.1` ditolak, aturan versi rilis backend 1.5). Salinan ini tetap tidak diubah di frontend.
- `masuk.ts` **bukan** salinan: skema formulir Masuk ditulis sendiri, meniru skema `Masuk` di `backend/src/routes/auth.ts`.
