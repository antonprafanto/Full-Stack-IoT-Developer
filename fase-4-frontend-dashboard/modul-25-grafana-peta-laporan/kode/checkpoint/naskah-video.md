# Naskah video demo HP: 🎉 Checkpoint Fase 4 (Modul 25)

Silabus meminta bukti Fase 4 berupa **video demo HP + tautan Grafana**. Video ini pendek (**60–90 detik**), direkam dari layar HP-mu
sendiri dengan fitur rekam layar bawaan HP, dan memperlihatkan bahwa dashboard buatanmu benar-benar dipakai dari HP: angka *live*,
kendali, peta, dan kabar Telegram. "Tautan Grafana" = tautan GitHub ke berkas JSON dashboard di `grafana/dashboards/` plus satu tangkapan
layar dashboard Grafana (Grafana belum dibuka ke internet sebelum Modul 27).

## Sebelum merekam (5 menit)

1. Nyalakan semuanya seperti biasa: database, broker, backend 1.2, simulator atau Node 1/Node 2, Grafana.
2. Nyalakan **mode HP** (Modul 23, `frontend/README.md` "Membuka dari HP"): `HOST=0.0.0.0`, `CORS_ORIGIN` + `http://<IP-laptop>:5173`,
   `npm run dev:hp`. Buka `http://<IP-laptop>:5173` di HP dan **masuk dulu sebelum mulai merekam** (layar Masuk dan sandi tidak ikut terekam).
3. Pastikan titik di **Peta** adalah titik contoh (sekitar Monas) atau sudah disamarkan, bukan titik rumahmu.
4. Nyalakan mode **Jangan Ganggu** di HP, supaya notifikasi pribadi (chat lain, email) tidak muncul di tengah rekaman.
5. Di Telegram, siapkan chat dengan bot Modul 19 yang sudah berisi pesan 🔴/✅ dari Grafana (Praktik 5) dan 📊 laporan CSV (Praktik 9).

## Naskah (60–90 detik)

| Detik | Yang ditunjukkan | Yang boleh kamu ucapkan (pilihan) |
| :---: | :--- | :--- |
| 0–10 | Layar **Perangkat** di HP: kartu hijau/merah, lencana **Live** | "Ini dashboard Rumah Pintar Mini buatanku, dibuka dari HP di WiFi rumah." |
| 10–25 | Ketuk satu perangkat: angka dan grafik 5 menit bergerak sendiri | "Angkanya *live* dari sensor, tanpa memuat ulang." |
| 25–40 | Bagian **Kendali**: nyalakan lampu → "Menunggu konfirmasi perangkat…" → menyala; matikan lagi | "Perintahnya dikonfirmasi perangkat dulu." |
| 40–55 | Menu **Peta**: lingkaran hijau/abu-abu, ketuk satu → popup nama, status, terakhir dilihat | "Peta perangkat dari database, warnanya ikut status." |
| 55–75 | Pindah ke Telegram: pesan 🔴 *alert* Grafana (dan ✅ pulih), lalu berkas 📊 `laporan-….csv` | "Kalau node diam, tim teknis dikabari Grafana; tiap pagi laporan CSV datang sendiri." |
| 75–90 | Kembali ke dashboard, akhiri rekaman | "Dashboard untuk penghuni, Grafana untuk tim teknis." |

Tidak harus persis: yang penting keempat hal (live, kendali, peta, Telegram) terlihat dalam satu rekaman tanpa dipotong-potong. Kalau
Node 2/baterai atau Telegram sungguhan belum kamu punya, rekam bagian yang sudah ada dan tulis terus terang di catatan belajarmu.

## Yang TIDAK boleh terekam

- **Sandi** apa pun: layar Masuk dashboard, layar login Grafana, papan ketik saat mengetik sandi.
- **Token bot** Telegram dan isi `backend/.env` (juga `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, sandi database dan broker).
- **chat_id** Telegram dan halaman pengaturan bot/BotFather. Formulir *contact point* Grafana juga: medan **BOT API Token** di sana
  menampilkan token apa adanya (bukan titik-titik sandi).
- **Koordinat persis rumahmu** (titik di Peta, popup dengan lintang/bujur, aplikasi peta lain): pakai titik contoh atau samarkan.
- **Alamat IP publik** rumahmu (misalnya dari situs "what is my IP"); alamat IP WiFi laptop (`192.168.…`) juga sebaiknya tidak disorot.
- **Data pribadi lain**: notifikasi chat/email, nama WiFi, email akun, wajah atau suara anggota keluarga yang tidak setuju direkam.

Sebelum membagikan, putar ulang videonya sekali dari awal sampai akhir khusus untuk mencari hal-hal di atas.

## Sesudah merekam (2 menit)

Kembalikan **mode laptop** (Modul 23, `frontend/README.md` "Membuka dari HP") sebelum lanjut ke *pull request*:

1. Ketuk **Keluar** di dashboard HP (selagi HP masih bisa menjangkau backend); kalau kamu memakai akun penguji sementara, hapus
   akunnya (`npm run pengguna -- hapus …`).
2. Di `backend/.env`: `HOST=127.0.0.1` lagi, dan hapus `,http://<IP-laptop>:5173` dari `CORS_ORIGIN`. Simpan (backend `npm run dev`
   mulai ulang sendiri).
3. Hentikan Vite (`Ctrl + C`) lalu jalankan `npm run dev` biasa (bukan `npm run dev:hp`).
4. Matikan mode **Jangan Ganggu** kalau tadi kamu nyalakan khusus untuk merekam.

## Menyimpan bukti

- Unggah video sebagai **video tidak publik** (hanya yang punya tautan yang bisa menonton), atau simpan di penyimpanan pribadimu. Jangan
  memasukkan berkas video ke Git proyek; cukup tautannya di catatan belajar `belajar-iot/modul-25/`.
- "Tautan Grafana": tautan GitHub ke `grafana/dashboards/kesehatan-sistem.json` di cabang `main` sesudah *pull request* Modul 25, ditambah
  satu tangkapan layar dashboard Kesehatan Sistem tanpa data pribadi. *Snapshot* eksternal dan *public dashboard* Grafana TIDAK dipakai
  (keduanya dimatikan di perintah `docker run`): *snapshot* eksternal mengirim data rumahmu ke internet, dan *public dashboard* membukanya tanpa login.

## Lembar bukti Checkpoint Fase 4

Centang hanya yang **sudah terjadi**. Checkpoint boleh ditutup belakangan (misalnya uji oleh orang lain baru sempat minggu depan).

- [ ] Kuis Modul 22–25: minimal 4 jawaban benar di setiap kuis (Silabus §8, Fase 4)
- [ ] Dashboard dipakai orang lain dari HP tanpa dibantu (hasil Modul 24 Praktik 10: L1–L3)
- [ ] Video demo HP 60–90 detik (tautan: …)
- [ ] Tautan GitHub JSON dashboard Grafana + tangkapan layarnya (tautan: …)
- [ ] Catatan "kapan memakai yang mana": dashboard React untuk penghuni, Grafana untuk tim teknis, Node-RED untuk percobaan cepat
