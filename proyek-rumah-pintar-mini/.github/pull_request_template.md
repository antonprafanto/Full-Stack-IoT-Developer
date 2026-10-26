## Apa yang berubah?

<!-- Satu atau dua kalimat: fitur apa yang ditambahkan atau diperbaiki, dan mengapa. -->

## Checklist sebelum *merge*

- [ ] `npm run cek` lolos, tanpa galat tipe
- [ ] **(Modul 22)** Kalau `frontend/` berubah: di folder `frontend`, `npm run build` dan `npm run lint` lulus tanpa galat dan tanpa peringatan
- [ ] **(Modul 23)** Satu-satunya peringatan yang boleh muncul di `npm run build` adalah peringatan ukuran `Some chunks are larger than 500 kB` (Recharts, sudah dijelaskan di Modul 23); `npm run lint` tetap tanpa peringatan
- [ ] **(Modul 24)** Kalau `backend/src/schemas/kontrak.ts` atau `aturan-dasar.ts` berubah: salinannya di `frontend/src/skema/` ikut diperbarui, dan `npm run cek-skema` di folder `frontend` mencetak dua baris `SAMA`
- [ ] Server menyala dengan `npm run dev`, tanpa galat di terminal
- [ ] Rute baru sudah dicoba di Bruno, tesnya lulus, dan permintaannya ikut tersimpan di `backend/bruno/`
- [ ] Rute baru muncul di `/docs`, lengkap dengan keterangannya
- [ ] **(Modul 24)** Metode HTTP baru yang dipanggil dashboard (misalnya `DELETE`) ada di `methods` CORS backend (`src/auth/keamanan.ts`), dan sudah dicoba dari browser, bukan hanya dari Bruno (Bruno tidak mengirim *preflight*)
- [ ] Tidak ada `.env` atau kata sandi di tab **Files changed**
- [ ] `KONTRAK-DATA.md` ikut diperbarui kalau bentuk pesan MQTT berubah

## Checklist keamanan

<!-- Sejak Modul 20. Centang hanya yang benar-benar sudah kamu periksa. -->

- [ ] Tidak ada `.env`, `bruno/.env`, `alat/.env`, `edge/sandi-broker`, `login*.json`, `kue*.txt`, sandi, kunci perangkat, atau token di tab **Files changed**; sandi di permintaan Bruno ditulis `{{process.env.…}}`
- [ ] Setelan rahasia baru (kalau ada) ditambahkan ke `.env.example` tanpa nilai asli, dan diperiksa Zod di `src/config/env.ts`
- [ ] Rute baru sudah dicoba di Bruno sesudah `logout` (dijawab 401), lalu dengan akun `viewer` (403 kalau rutenya mengubah sesuatu)
- [ ] Tidak ada rute baru di `RUTE_TERBUKA` tanpa alasan yang ditulis di *pull request* ini; rute yang memeriksa sandi ikut dijaga jam pasir (`config.rateLimit`)
- [ ] Log baru tidak mencatat sandi, gelang, kartu terusan, *cookie*, email, atau isi permintaan; akun cukup disebut dengan nomornya
- [ ] Sandi dan *refresh token* hanya disimpan sebagai sidik jari, data pribadi baru hanya disimpan kalau memang dipakai, dan data *live* baru hanya dikirim ke *room* Socket.IO yang boleh menerimanya
- [ ] `CORS_ORIGIN` hanya berisi alamat halaman yang memang kita jalankan, satu per satu, dan tidak pernah `*`
- [ ] **(Modul 21)** Kunci perangkat hanya disimpan sebagai sidik jari SHA-256, ditampilkan sekali, dan tidak pernah di log, Git, atau jawaban `GET /devices`; akun broker backend ada di `MQTT_USERNAME`/`MQTT_PASSWORD`, bukan di dalam `MQTT_URL`
- [ ] **(Modul 21)** Daftar izin broker `edge/acl-broker` masih membatasi tiap akun seketat mungkin (perangkat hanya topiknya sendiri, pola `%u` + `use_username_as_clientid`); perangkat atau topik baru ditambahkan dengan hak sekecil mungkin, dan broker di-*restart* (bukan reload) sesudah ACL diubah
- [ ] **(Modul 21)** `edge/sandi-broker` tidak ikut Git, dan tidak ada perilaku baru yang mem-*bypass* lapis kedua (pesan dari perangkat tak terdaftar/dicabut tetap diabaikan, backend tidak membuat baris `devices` otomatis)
- [ ] **(Modul 22)** Tidak ada rahasia di variabel `VITE_…` (semuanya ikut terkirim ke browser), dan `frontend/.env.local` tidak ikut Git; yang boleh ikut hanya `frontend/.env.example` tanpa nilai rahasia
- [ ] **(Modul 22)** Dashboard tidak menyimpan sandi atau token di `localStorage` (login hanya lewat *cookie* `HttpOnly` dari backend, `fetch` dengan `credentials: "include"`), dan data dari API ditampilkan sebagai teks JSX, tanpa `dangerouslySetInnerHTML`
- [ ] **(Modul 23)** Tidak ada *polling*: data baru hanya datang lewat Socket.IO, dan `git grep -n setInterval frontend/src` hanya menemukan jam di `frontend/src/waktu.ts`
- [ ] **(Modul 23)** Setiap `socket.on(…)` punya `socket.off(…)` dengan fungsi yang sama di *cleanup* efeknya, dan soket tetap dibuat sekali di `frontend/src/soket.ts` (bukan di dalam komponen)
- [ ] **(Modul 23)** Mode HP sudah dikembalikan ke mode laptop (`HOST=127.0.0.1`, alamat IP dihapus dari `CORS_ORIGIN`, Vite tanpa `--host`), dan `backend/.env` yang berisi IP laptop tidak ikut Git
- [ ] **(Modul 23)** Tidak ada berkas percobaan di tab **Files changed**: `frontend/public/coba-live.html` (Kemenangan Cepat) dan folder `frontend/src/uji/` (Praktik 6)
- [ ] **(Modul 24)** Tombol kendali dan menu admin hanya digambar kalau peran admin sudah pasti (`useAdmin()`), DAN backend tetap menolaknya: dicek di Bruno dengan `login viewer` lalu `nyalakan lampu` (dan setiap rute baru yang mengubah sesuatu) → 403. Menyembunyikan tombol bukan pengaman
- [ ] **(Modul 24)** **Keluar** dan sesi habis mengosongkan SEMUA toko (`kosongkanSemua()`): sesudah admin keluar, akun viewer yang masuk di tab yang sama tidak melihat sisa data, *toast*, atau tombol admin
- [ ] **(Modul 24)** Peran dan token tetap tidak pernah disimpan di `localStorage`; peran dibaca dari `GET /auth/me` / jawaban login
- [ ] **(Modul 24)** Tidak ada berkas percobaan `frontend/src/components/TombolPertama.tsx` (Kemenangan Cepat) di tab **Files changed**; akun penguji uji pengguna sudah dihapus (`npm run pengguna -- hapus …`) dan mode HP sudah dikembalikan
- [ ] `npm test` lulus, paket npm baru dipasang dengan versi persis (`npm install nama@versi`) dan tercatat di `package-lock.json`, `npm audit` menjawab `found 0 vulnerabilities`, dan `allowScripts` hanya bertambah untuk paket yang memang butuh skrip pemasangan
- [ ] **(Modul 24)** Tidak ada perintah pasang tanpa versi di naskah, README, atau catatan, dan tidak ada `--legacy-peer-deps`/`overrides` untuk "memaksa" pemasangan (contoh: `@hookform/resolvers@5.9.2`, bukan versi terbaru yang gagal ERESOLVE)
