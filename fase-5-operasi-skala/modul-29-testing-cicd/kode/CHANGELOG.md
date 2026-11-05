# Catatan perubahan (CHANGELOG) Rumah Pintar Mini

Semua perubahan penting proyek ini dicatat di sini, yang terbaru di atas. Bentuknya mengikuti
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), dengan nama jenis perubahan dari terjemahan resminya
([bahasa Indonesia, 1.0.0](https://keepachangelog.com/id-ID/1.0.0/)): Ditambahkan, Diubah, Akan Dihilangkan, Dihilangkan,
Diperbaiki, Keamanan. Nomor versinya mengikuti [Pemversian Semantik 2.0.0](https://semver.org/lang/id/): MAYOR.MINOR.PATCH.

- Satu nomor versi untuk server: backend dan dashboard (web) selalu bernomor sama, sama dengan tag image di
  `compose.cloud.yml` dan tag Git `v<versi>` yang dibuat robot. Firmware (Node 1, Node 2), `KONTRAK-DATA.md`, dan
  `PETA-PIN.md` tetap bernomor sendiri.
- Pull request yang mengubah apa pun yang dipasang di VPS/Pi (isi image backend dan web, `compose.cloud.yml`, konfigurasi
  broker di `edge/`, Grafana, skrip `.sh`) wajib menaikkan versi DAN menulis entrinya di sini; robot
  (`skrip/cek-versi.mjs`) menolak yang lupa.
- Perubahan yang sudah di-merge tetapi belum dirilis ditulis di bagian "Belum Dirilis" dulu.
- Riwayat sebelum 2.0.0 (backend 1.x, web 1.x) ada di README setiap modul.

## [Belum Dirilis]

## [2.0.0] - 2026-11-04

Rumah Pintar Mini v2.0: pipeline produksi (Modul 29). MAYOR karena cara MEMASANG berubah, bukan API-nya: VPS dan Pi jalur
gratis tidak lagi membangun image sendiri, melainkan menarik image buatan robot untuk dua jenis prosesor; Pi memperbarui
dirinya lewat systemd timer; cabang `main` dijaga aturan cabang.

### Ditambahkan

- Robot pemeriksa dan pemasang (GitHub Actions, `.github/workflows/ci.yml`): setiap pull request ke `main` diperiksa
  (`periksa`, `uji`, `bangun`); sesudah merge, image backend dan web dikirim ke GHCR untuk amd64 dan arm64, dicoba dulu di
  staging sekali pakai di mesin robot (`skrip/uji-asap.sh`), lalu rilis ditandai tag `v<versi>` dan VPS dipasang lewat SSH
  dengan kunci khusus yang hanya bisa menjalankan `skrip/pasang.sh`.
- Pi memperbarui dirinya sendiri: `skrip/systemd/rumahpintar-perbarui.timer` menjalankan `skrip/pasang.sh` setiap 15 menit
  (rilis bertanda terbaru di `main` dari Git, lalu `docker compose pull` dan `up -d --no-build`).
- Backend: 20 integration test dengan database TimescaleDB uji (`backend/src/integrasi/`, `npm run test:integrasi`). Hanya
  mau berjalan di database yang namanya berakhiran `_uji`.
- Backend: `GET /health` menyebut `versi` server yang sedang berjalan; dokumentasi `/docs` memakai nomor yang sama (keduanya
  dibaca dari `package.json`).
- Backend: lint dengan oxlint 1.89.0 (`npm run lint`), alat dan versi yang sama dengan frontend. Di kedua folder, satu
  peringatan lint pun kini membuat `npm run lint` gagal (`--deny-warnings`), jadi robot benar-benar merah karenanya.
- Dashboard: nomor versi (`v2.0.0`) tampil di layar Masuk dan di kepala dashboard, di bawah judul.
- Frontend: tes Vitest pertama untuk fungsi murni (waktu WIB, CSV, uraian aturan), lewat `npm test`.
- `CHANGELOG.md` ini dan `skrip/cek-versi.mjs` (robot menolak versi yang tidak sama di semua tempat, tidak naik, atau tanpa
  entri di sini).

### Diubah

- Satu nomor versi untuk server: backend 1.5.0 dan web 1.4.0 menjadi 2.0.0, begitu juga tiga tag image di
  `compose.cloud.yml`.
- Dockerfile backend dan frontend: tahap Node berjalan di prosesor mesin pembangun (`FROM --platform=$BUILDPLATFORM`) dan
  tahap akhir tanpa `RUN`, jadi satu runner membangun image amd64 dan arm64 tanpa emulasi.
- Backend: rakitan server Fastify pindah ke `src/app.ts` (`buatApp()`), dipakai bersama oleh `src/server.ts` dan tes
  integrasi.
- VPS dan Pi jalur gratis menarik image buatan robot dan memasangnya dengan `docker compose up -d --no-build`, tidak
  membangunnya lagi.
