# Lembar tugas uji pengguna — dashboard Rumah Pintar Mini v1.0 (Modul 24)

Lembar ini dipakai di **Praktik 10**. Cetak (atau tulis ulang) bagian **B** untuk penguji; bagian **A** dan **C** untukmu sebagai
pelajar yang menyiapkan dan mengamati. Catat hasilnya di `lembar-catatan.md`.

## A. Persiapan (dikerjakan pelajar, sebelum penguji datang)

1. **Akun penguji sementara berperan admin.** Di folder `backend`, dari PowerShell atau Terminal macOS (bukan Git Bash: sandinya
   ditanyakan di terminal):

   ```
   npm run pengguna -- tambah penguji@rumah.test "Penguji" admin
   ```

   Sandinya minimal 15 karakter. Tulis email dan sandinya di **kartu kertas** untuk penguji; jangan disimpan di berkas, chat, atau
   foto. Akun ini dihapus lagi di akhir (bagian C).
2. **Kondisi awal:** lampu **padam**, dan **belum ada** aturan siram (kalau ada dari latihan Praktik 8, hapus dulu di layar
   **Aturan**). Untuk jalur simulator: `tandon acak` dan `tanah acak` di terminal simulator.
3. **Mode HP** (Modul 23): `HOST=0.0.0.0` dan IP laptop di `CORS_ORIGIN` pada `backend/.env`, lalu `npm run dev:hp` di folder
   `frontend`. Buka `http://<IP-laptop>:8080/health` dari HP penguji dulu: harus menjawab.
4. Siapkan `lembar-catatan.md` (atau kertasnya), jam/pengukur waktu, dan minta izin bila ingin merekam layar atau suara (boleh
   menolak; rekaman tidak wajib).
5. Penguji memakai **HP-nya sendiri** di WiFi rumah yang sama. Yang dibuka penguji hanya alamat `http://<IP-laptop>:5173`; kamu
   tidak memegang HP-nya.

## B. Untuk penguji (bacakan atau berikan kartu ini)

> Terima kasih sudah mau mencoba. Yang diuji **dashboard-nya**, bukan kamu: kalau bingung, itu tanda tampilannya yang perlu
> diperbaiki. Sambil mengerjakan, ceritakan dengan suara keras apa yang sedang kamu pikirkan ("saya cari tombol…", "ini maksudnya
> apa ya…"). Saya tidak akan membantu selama tugas berjalan; saya hanya boleh membacakan ulang tugasnya.

1. Buka alamat ini di HP-mu: `http://______________:5173` (diisi pelajar), lalu **masuk** dengan email dan sandi di kartu.
2. **Nyalakan lampu** di rumah ini.
3. **Atur supaya tanaman disiram otomatis kalau tanahnya lebih kering dari 30 %.**
4. **Keluar** dari dashboard.

## C. Aturan selama uji dan sesudahnya (pelajar)

- **Tanpa bantuan.** Selama tugas berjalan kamu hanya boleh membacakan ulang kalimat tugasnya. Tidak menunjuk layar, tidak
  memberi petunjuk, tidak menjawab "pencet yang itu".
- **Macet lebih dari 2 menit** (atau penguji menyerah/bertanya langsung) = tugas itu **"dibantu"**: boleh dibantu supaya uji bisa
  berlanjut, tetapi tugas itu **belum lulus**. Perbaiki yang membingungkan (label, letak, pesan), lalu ulangi tugas itu — dengan
  penguji yang sama sesudah jeda, atau penguji lain.
- Catat untuk setiap tugas: berhasil / dibantu / gagal, lama (menit:detik), dan kalimat penguji yang menarik **tanpa nama
  lengkap**.
- **Bukti dari log backend** (terminal `npm run dev` di folder `backend`), salin barisnya ke lembar catatan:
  - tugas 1: `login: akun N (admin), sesi N, IP 192.168.…` (IP-nya = IP HP penguji, bukan `127.0.0.1`);
  - tugas 2: `perintah c-… (api) ke <device_id>: lampu = true, ack ok=true dalam N ms`;
  - tugas 3: `Aturan N (…) dibuat lewat API: …` (lalu, untuk membuktikan aturannya berlaku: simulator `tanah 25`, atau tanah
    Kit A yang memang kering → kejadian `🌱 Tanah … — pompa menyiram 5 detik otomatis`);
  - tugas 4: `logout: sesi N`.
- **Syarat L4 dikerjakan pelajar sendiri:** di HP yang sama, masuk dengan akun **viewer**, buka layar detail perangkat dan layar
  **Aturan**: tidak boleh ada tombol kendali, **+ Aturan baru**, atau **Ubah**.
- **Sesudah uji:** hapus akun penguji (`npm run pengguna -- hapus penguji@rumah.test`), sobek atau simpan kartu sandinya, kembalikan
  **mode laptop** (`HOST` dan `CORS_ORIGIN`, lalu `npm run dev`), dan pastikan HP penguji tidak bisa membuka dashboard lagi.
