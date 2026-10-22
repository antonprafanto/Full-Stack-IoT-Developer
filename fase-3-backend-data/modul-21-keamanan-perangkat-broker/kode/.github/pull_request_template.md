## Apa yang berubah?

<!-- Satu atau dua kalimat: fitur apa yang ditambahkan atau diperbaiki, dan mengapa. -->

## Checklist sebelum *merge*

- [ ] `npm run cek` lolos, tanpa galat tipe
- [ ] Server menyala dengan `npm run dev`, tanpa galat di terminal
- [ ] Rute baru sudah dicoba di Bruno, tesnya lulus, dan permintaannya ikut tersimpan di `backend/bruno/`
- [ ] Rute baru muncul di `/docs`, lengkap dengan keterangannya
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
- [ ] `npm test` lulus, paket npm baru dipasang dengan versi persis (`npm install nama@versi`) dan tercatat di `package-lock.json`, `npm audit` menjawab `found 0 vulnerabilities`, dan `allowScripts` hanya bertambah untuk paket yang memang butuh skrip pemasangan
