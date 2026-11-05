# Modul 29 — Testing & CI/CD: Setiap Perubahan Diuji dan Dipasang Otomatis

🌐 **Bahasa Indonesia** · [English](../../en/phase-5-operations-scale/module-29-testing-cicd/README.md)

*Fase 5 · Minggu 29 · Perangkat keras: **server dari Modul 27–28** (VPS dan Pi gerbang; jalur gratis: Pi saja; tanpa Pi: VPS, laptop sebagai gerbang), tanpa perangkat keras baru · Akun: GitHub dengan repo `rumah-pintar-mini` **publik** · Prasyarat: **Modul 28** (backend 1.5.0, frontend 1.4.0, dan `compose.cloud.yml` di `main`), Modul 27 (VPS, SSH, Tunnel), Modul 16 (Git tim), Modul 19 (*unit test*), Modul 12 (systemd) · Waktu: ±10 jam dicicil dalam satu minggu, ditambah menunggu jam weker Pi (paling lambat ±17 menit; jalur gratis ±9 jam) · Biaya: gratis untuk repo publik (GitHub Actions, GHCR, aturan cabang); server dan domain tetap dari Modul 27*

[⬅️ Modul 28](../modul-28-ota-provisioning-fleet/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 30 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data)

---

[Modul 28 ditutup](../modul-28-ota-provisioning-fleet/README.md#-checklist-kelulusan-modul-28) dengan rumah yang bisa diperbarui tanpa kabel, beserta satu batas yang jujur: *image* server masih dipasang lewat SSH tanpa uji otomatis. [Halaman pertama Silabus](../../SILABUS.md#setelah-menyelesaikan-32-modul-anda-akan-mampu) menjanjikan sistem yang tetap hidup, termasuk "perubahan kode diuji dan dipasang otomatis (*CI/CD*)". Modul 29 melunasinya dengan **robot**: GitHub Actions, yang menguji setiap *pull request* dan memasang setiap rilis ke VPS. Lingkupnya satu kalimat: minggu ini setiap perubahan kode diuji robot, dibungkus menjadi *image* untuk dua jenis prosesor, lalu dipasang sendiri ke VPS dan Pi; tahu lebih dulu saat ada yang rusak, cadangan otomatis, dan *runbook* (panduan pemulihan) menyusul di Modul 30.

Banyak janji lama dilunasi minggu ini. Lipatan bedah teknis [Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#-bedah-teknis-opsional) menunda pemeriksaan otomatis di setiap *pull request* ke sini: kode keluar `1` dari tes yang gagal akan membuat pemeriksaan itu menolak PR. Sepuluh *unit test* pertama dari [Konsep 6 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#6-unit-test-memeriksa-otak-aturan-tanpa-perangkat) kini 203, tetapi belum satu pun menyentuh database sungguhan. [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#9-lokasi-adalah-data-perangkat-api-bukan-tempelan-di-layar) menunda pembahasan tuntas SemVer ke Modul 29, dan [Modul 28](../modul-28-ota-provisioning-fleet/README.md#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest) menundanya bersama `CHANGELOG` dan *tag* versi. [Modul 26](../modul-26-docker-compose/README.md#11-toko-image-ghcr-dan-arsitektur) mengirim *image* ke GHCR dengan tangan dan menjanjikan satu *image* dua prosesor yang dibuat otomatis; pembaruan otomatis gerbang Pi juga "menunggu Modul 29" ([6.4 Modul 26](../modul-26-docker-compose/README.md#64--pi-samakan-acl-salin-berkas-sandi-lama-ke-lemari-gerbang-lalu-matikan-broker-apt-10-menit)). Catatan istilah: *staging* di modul ini berarti gladi resik versi baru, bukan CA latihan Let's Encrypt di [Konsep 6 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal).

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Satu perubahan kecil = ±10 langkah tangan di tiga mesin, termasuk SSH ke VPS (`git pull`, `docker compose build`, `up -d`) dan ke Pi (`git pull`, *restart* broker). | Sesudah *merge*, semuanya dikerjakan tangan (Modul 27 ➕ E dan 7.4). | **Robot memasang VPS, Pi memasang dirinya sendiri** ([Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri)–8, [Praktik 9](#praktik-9--rilis-pertama-200-tag-oleh-robot-pemasang-satu-skrip-dan-paket-publik-35-menit)–12) |
| Tes hanya jalan kalau kamu ingat, di laptopmu dengan isinya sendiri. | GitHub baru menyimpan kode; belum ada yang memeriksanya. | **Robot pemeriksa di setiap *pull request*** ([Konsep 3](#3-ci-robot-yang-membaca-kode-keluar)–4, [Praktik 4](#praktik-4--robot-pemeriksa-di-setiap-pull-request-40-menit)) |
| 203 tes hijau, tetapi tak satu pun menjalankan kueri SQL. | Tes yang butuh database memakai tiruan (`vi.mock`), yang tidak menjalankan SQL. | **20 *integration test* dengan database uji** sekali pakai ([Konsep 1](#1-piramida-uji-bahan--resep--dapur--pelanggan)–2, [Praktik 3](#praktik-3--database-uji-dan-20-integration-test-60-menit)) |
| VPS ([Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#2-vps-komputer-sewaan-yang-menyala-24-jam)) dan Pi jalur gratis membangun *image* sendiri; VPS 2 GB sampai diberi *swap* untuk *build*. | *Image* buatanmu hanya untuk prosesor mesin pembangunnya: VPS amd64, Pi arm64. | **Satu *image* untuk dua prosesor**, dibangun robot dan dikirim ke GHCR ([Konsep 5](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi)–6, [Praktik 7](#praktik-7--satu-image-dua-prosesor-dikirim-robot-ke-ghcr-35-menit)) |
| GitHub tidak bisa mengetuk Pi. | Pi ada di balik router rumah, tanpa *port forwarding* ([Konsep 1 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#1-dari-rumah-ke-internet-tiga-pintu-dua-jalur)). | **Pi bertanya sendiri setiap 15 menit** lewat jam weker systemd ([Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri)–8, [Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit)) |
| Nomor versi ditulis tangan di ≥ 4 tempat (backend 1.5.0, web 1.4.0), tanpa pemeriksa, `CHANGELOG`, atau *tag*. | Baru firmware yang versinya diperiksa (Modul 28). | **Satu nomor 2.0.0**, satpam versi, `CHANGELOG.md`, dan *tag* `v2.0.0` buatan robot ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur), [Praktik 6](#praktik-6--satu-nomor-versi-200-satpam-versi-changelogmd-dan-versi-di-layar-30-menit), 9) |
| Satu *merge* yang tesnya merah bisa merusak `main`. | Tombol *merge* tidak peduli warna tes. | **Aturan cabang** (*branch protection*), palang di depan `main` ([Konsep 11](#11-aturan-cabang-palang-di-depan-main), [Praktik 5](#praktik-5--aturan-cabang-pr-merah-tidak-bisa-di-merge-20-menit)) |

Syarat lulus dari [Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis): "*pull request* kecil yang di-*merge* tampil di produksi (VPS dan Pi) tanpa Anda SSH, dan PR yang tesnya gagal tidak bisa di-*merge*." Modul ini memecahnya menjadi satu prasyarat dan tiga bukti:

- **L0** (prasyarat, bukan bagian ✅): repo `rumah-pintar-mini` publik, dan robot memeriksa setiap *pull request* sampai hijau dengan ke-223 tes benar-benar dijalankan, termasuk 20 *integration test* dengan database uji (*job* `uji`: `Tests  223 passed (223)`, tanpa tes yang dilewati).
- **L1** PR merah tidak bisa di-*merge*: aturan cabang `main` mewajibkan *pull request* dan *check* robot yang hijau, tanpa pengecualian, juga untukmu sebagai pemilik repo. PR `coba/merah` yang satu tesnya sengaja salah tidak bisa di-*merge*, dan `git push` langsung ke `main` ditolak.
- **L2** PR kecil tampil di produksi tanpa kamu SSH: sesudah PR C (teks layar **Masuk** yang lebih jelas, versi 2.0.1) di-*merge*, robot menguji, membangun *image*, menggladinya di *staging* sekali pakai, memberi *tag* `v2.0.1`, lalu memasangnya di VPS. `https://iot.namaanda.my.id` menampilkan teks baru dan `v2.0.1` (muat ulang dua kali), `/api/health` menulis `"versi":"2.0.1"`, dan selama itu tidak ada terminal SSH-mu yang terbuka.
- **L3** Pi memperbarui dirinya sendiri: jam weker systemd di Pi menemukan rilis `v2.0.1` dan memasangnya, biasanya paling lambat ±17 menit sesudah *tag* dibuat, ditambah lama menarik *image*; jurnalnya mencatat `v2.0.0 -> v2.0.1 terpasang (gerbang)`. Di jalur utama, Pi gerbang memasang konfigurasi `edge/` rilis itu bersama *image* resmi Mosquitto, dan broker di-*restart* hanya bila salah satunya berubah. Yang dinilai pemasangannya: membaca jurnal lewat SSH sesudahnya boleh.

**Tanpa kamu SSH ≠ tanpa SSH**: robot tetap masuk ke VPS lewat SSH, dengan kunci yang hanya bisa menjalankan satu skrip. Silabus (v1.0.31) mencatat pecahan ini dan bunyi setiap jalur di baris ✅, serta membaca "20 test hijau" di daftar praktiknya sebagai 20 *integration test* API dengan database uji (203 *unit test* lama tetap hijau); kalimat ✅-nya tetap.

Untuk Rumah Pintar Mini, server kini punya **satu nomor versi**: backend 1.5.0 dan dashboard 1.4.0 sama-sama naik ke **2.0.0**, MAYOR karena cara memasangnya berubah (VPS dan Pi memasang rilis buatan robot), bukan API-nya. *Tag* Git pertama, `v2.0.0`, dibuat robot; PR kecil menjadi **2.0.1**, dan *revert*-nya **2.0.2**. Tanpa migrasi baru (tetap `011`) dan tanpa paket produksi baru; paket pengembang baru hanya oxlint 1.89.0 (backend) dan Vitest 5.0.5 (dashboard), versi yang sudah dipakai folder sebelahnya. Robot memakai *action* resmi `actions/checkout@v7`, `actions/cache@v6`, `docker/setup-buildx-action@v4`, `docker/login-action@v4`, dan `docker/build-push-action@v7` (Kemenangan Cepat: `actions/setup-node@v7`) di *runner* `ubuntu-24.04`. *Image* pihak ketiga sama dengan Modul 28, dan TimescaleDB `2.30.2-pg17` juga menjadi database uji. Firmware Node 1 dan Node 2, `KONTRAK-DATA.md` 1.6, dan `PETA-PIN.md` versi 7 tidak berubah. Inilah "v2.0 — pipeline produksi" di Silabus. CI/CD dan kuis modul ini ikut [tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase).

> [!IMPORTANT]
> **Urutan wajib:** cadangan (Praktik 1) → **PR A** (Praktik 2–4) → aturan cabang (Praktik 5) → **PR B** (Praktik 6–9; `bangun` masuk aturan cabang di 7.6) → langkah tangan sekali: paket GHCR publik (9.7), VPS beralih ke menarik ([10.1](#101--terakhir-kali-ssh-untuk-memasang-sh-skrippasangsh-menarik-200-10-menit)) **sebelum** kunci robot dan `VPS_HOST` (10.6), lalu jam weker Pi (Praktik 11) → **PR C** (Praktik 12) → **PR D** (Praktik 13). Sebabnya: *check* wajib harus sudah pernah berjalan, robot mengirim *image* dan membuat *tag* hanya dari `main`, dan tanpa `skrip/pasang.sh` di VPS, robot gagal (`cannot open …/skrip/pasang.sh`).

**Pilih jalurmu:**

| Jalur | Yang kamu punya | Produksi di | Siapa memasang | Bukti | Praktik | Waktu |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **Utama** | repo publik, VPS, Pi gerbang | VPS, `https://iot.namaanda.my.id`; gerbang di Pi | robot lewat SSH (VPS), jam weker (Pi) | L0–L3 | 1–13 | ±10 jam |
| **Gratis** | repo publik, Pi (pusat + gerbang), Cloudflare Tunnel, domain | Pi, lewat Tunnel | jam weker Pi (`pasang-vps` dilewati: `VPS_HOST` kosong) | L0, L1, L2-gratis (tampil lewat Tunnel), L3 | tanpa 10 | ±9 jam |
| **Tanpa Pi** | repo publik, VPS, laptop sebagai gerbang | VPS | robot lewat SSH | L0–L2: lulus jalur tanpa Pi (L3 tidak berlaku) | tanpa 11 | ±9,5 jam |
| **Laptop saja** | repo publik | tidak ada | — | L0, L1, *image* dua prosesor di GHCR: **belum lulus** | 1–9 | — |
| **Repo privat** (akun gratis) | sesuai jalurmu | sesuai jalurmu | sama, + token baca GHCR dan kunci baca repo (*deploy key*) | L2, L3 (memotong kuota menit); L1 tidak (aturan cabang akun gratis hanya untuk repo publik): **belum lulus** sampai repo publik atau paket berbayar | tanpa 5 | — |
| **Tanpa akun GitHub** | laptop | tidak ada | — | **belum lulus** (L1–L3 butuh GitHub) | 2, 3, 6.1–6.5, [6.7](#67--satpam-versi-di-laptop-lulus-sengaja-gagal-lalu-commit-5-menit); cara penulis meniru robot di [🔬](#-bedah-teknis-opsional) (kontainernya `--privileged`, setara root) | — |
| **Tanpa Kit / Wokwi** | tanpa ESP32 | sesuai jalurmu | sesuai jalurmu | tanpa bunyi khusus (Modul 29 tidak menyentuh ESP32) | sesuai jalurmu | sama |

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Tanda.** ⭐ = wajib untuk lulus; praktik wajib per jalur ada di pengantar [🔧](#-praktik-langkah-demi-langkah). Kotak 🔀 (**Jalur gratis:**, **Tanpa Pi:**, **Repo privat:**) menjelaskan yang berbeda di jalur lain.
> - **Tabel bukti:**
>
>   | Syarat | Praktik | Yang kamu lihat |
>   | :-: | :-- | :-- |
>   | L0 | [4.4](#44--l0-sengaja-merah-sekali-lalu-semua-hijau-8-menit) | tab **Checks** PR A hijau; *job* `uji` menulis `Tests  223 passed (223)` |
>   | L1 | [5.3](#53--l1-pr-cobamerah-merah-tombol-merge-terkunci-6-menit) (dan 5.2) | PR `coba/merah` ✗, tombol *merge* terkunci tanpa pilihan melewati aturan; `git push` langsung ke `main` ditolak |
>   | L2 | [12.4](#124--l2-robot-memasang-vps-layar-masuk-menulis-v201-8-menit) | layar **Masuk** `https://iot.namaanda.my.id` dengan teks baru dan `v2.0.1` (muat ulang dua kali); `/api/health` `"versi":"2.0.1"`; tanpa terminal SSH |
>   | L3 | [12.5](#125--l3-pi-memasang-201-sendiri-dibaca-dari-jurnalnya-6-menit) | jurnal Pi `v2.0.0 -> v2.0.1 terpasang (gerbang)`; jalur gratis: `(pusat gerbang)` dan dashboard dari Pi `v2.0.1` |
>
> - **Kotak 🖥️** di awal praktik menyebut mesin, alat, dan foldernya: **VS Code** (terminal di akar proyek `rumah-pintar-mini`, `backend`, atau `frontend`), **Docker Desktop** atau Docker Engine untuk database uji, **GitHub** di browser, terminal SSH ke VPS (`ssh rumah@203.0.113.10`) dan ke Pi (`ssh budi@gateway.local`), **Chrome**, dan **HP**. Docker Desktop, Windows, macOS, dan PowerShell belum diuji penulis.
> - **Kotak Hasilnya** direkam di **Raspberry Pi 5 dengan Ubuntu 26.04 (arm64)**. Satu mesin itu memerankan laptop, GitHub, GHCR, VPS, dan Pi; labelnya menyebut asalnya, misalnya **Hasilnya (lab penulis, robot tiruan):**. Layar GitHub selalu ditandai di tempatnya: dari dokumen GitHub, belum direkam penulis.
>
>   | Dunia nyatamu | Tiruan di lab penulis |
>   | :-- | :-- |
>   | GitHub dan *runner* `ubuntu-24.04` (amd64) | *forge* tiruan Gitea 28.2.0 + Gitea Runner 5.2.4 (arm64) yang menjalankan `ci.yml` apa adanya |
>   | GHCR | toko *image* lokal tanpa sandi |
>   | VPS `203.0.113.10`, Pi gerbang, Pi jalur gratis | kontainer Docker-in-Docker (arm64, HTTP lokal, tanpa domain); robot masuk ke "VPS" lewat SSH sungguhan |
>   | jam weker systemd | penjadwal tiruan tiap ±1 menit + `systemd-analyze verify` |
>   | HP; Node 1 | Chrome tanpa layar selebar 375 px; simulator Modul 28 |
>
>   Angka waktu di kotak Hasilnya adalah angka robot tiruan di satu Raspberry Pi 5 dengan *image* lokal, bukan GitHub; jam ditulis WIB. Nama dan alamat lab diganti contoh milikmu (`<akun>`, `iot.namaanda.my.id`). Rincian: [🔬](#-bedah-teknis-opsional), [📚](#-sumber--atribusi-gambar).

> [!IMPORTANT]
> **Status jujur: penulis tidak punya akun GitHub, VPS, Pi kedua, atau domain, jadi tidak satu pun layar GitHub direkam.** Teks layar GitHub dikutip dari dokumen resminya (dibaca 31 Oktober–5 November 2026); gambar layarnya rekonstruksi berlabel. Pada 4 November 2026 penulis menjalankan `ci.yml` apa adanya dengan **robot tiruan**; semua yang dipasangnya berjalan dengan Docker sungguhan.
>
> | Bagian | Diuji penulis (kode sungguhan) | Ditiru lokal (di Raspberry Pi 5 penulis) | Hanya dari dokumen / belum |
> | :-- | :-- | :-- | :-- |
> | Tes | 203 *unit test* + 20 *integration test* dengan TimescaleDB uji sungguhan, pengaman `_uji`, kesalahan SQL sengaja tertangkap; 5 tes Vitest dashboard; oxlint dua folder | — | — |
> | Robot (`ci.yml`) | semua *job*, termasuk *action* resmi (`uses:`), dalam puluhan putaran hijau dan merah | *forge* tiruan (layarnya bukan layar GitHub) | layar GitHub; `GITHUB_TOKEN`, `permissions`, `concurrency`, *runner* x64, dan waktu di GitHub |
> | *Image* dua prosesor | amd64 + arm64 tanpa emulasi; isi amd64 diperiksa (program x86-64); arm64 dijalankan | toko *image* lokal | GHCR sungguhan (paket privat → publik, izin Actions); *image* amd64 dijalankan |
> | *Staging*, *tag* rilis | `staging` hijau di setiap rilis, merah tepat pada dua rilis yang sengaja dirusak (setelan wajib baru lupa, broker salah tulis): tanpa *tag*, "VPS" dan "Pi" tidak tersentuh; *tag* beranotasi buatan robot | token robot *forge* | *tag* buatan `GITHUB_TOKEN`; tarikan ±1,14 GB di *runner* GitHub |
> | VPS | `pasang.sh` 2.0.0 → 2.0.4 (broker di-*restart* hanya saat konfigurasinya berubah); kunci `restrict,command=` lewat SSH sungguhan: hijau di setiap rilis, merah tepat pada tiga kesalahan sengaja | kontainer dengan sshd, HTTP lokal | VPS amd64 dengan IP publik dan ufw; HTTPS domain dan uji asap ber-domain |
> | Pi | `pasang.sh` mode `gerbang` dan `pusat gerbang` (jalur gratis); *dynamic security* bertahan, jembatan dan Node 1 tiruan tersambung lagi sesudah *restart* broker; unit + *timer* lulus `systemd-analyze verify` | kontainer; jam weker = penjadwal tiruan | jam weker systemd berjalan (`list-timers`, `journalctl`, sesudah *reboot*) |
> | Aturan cabang | — | *forge* tiruan menolak *push* langsung dan *merge* PR merah, juga untuk admin | aturan cabang GitHub dan layarnya (gambar Konsep 11 = rekonstruksi) |
> | Dashboard | versi di layar **Masuk** dan kepala; PWA baru menampilkannya sesudah muat ulang kedua (Chrome 156, HTTP lokal) | — | HP sungguhan, HTTPS domain |
> | Opsional | `node:test` (satu tes) | — | Wokwi CI, Playwright, *runner* ARM64 asli, QEMU |
>
> Kamulah penguji pertamanya di GitHub: centang [✅](#-checklist-kelulusan-modul-29) hanya yang benar-benar terjadi di repomu.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Repo publik = log robot publik.** Jangan pernah mencetak rahasia (`echo`, `set -x`); rahasia hanya di **Secrets** ([10.6](#106--secrets-dan-variables-di-github-vps_kunci_ssh-vps_host-dan-vps_known_hosts-8-menit)).
> 2. **Kunci robot ≠ kunci pribadimu.** Kunci kedua khusus robot selalu berawalan `restrict,command=`, barisnya ditulis sendiri (bukan `ssh-copy-id`), lalu diuji `whoami` ([10.2](#102--kunci-robot-di-laptop-sshrobot_rumah-tanpa-frasa-sandi-5-menit)–10.4).
> 3. **Tes integrasi hanya ke database `…_uji`** yang sekali pakai, tidak pernah ke database rumah ([3.8](#38-pengaman-menolak-database-bernama-rumahpintar-4-menit)).
> 4. **Paket GHCR publik tidak bisa diprivatkan lagi.** Pastikan isinya hanya berkas repo publik dan library (tanpa `.env`, tanpa kunci) ([9.7](#97--paket-ghcr-menjadi-publik-tarik-tanpa-login-dua-prosesor-4-menit)).
> 5. **Jangan menyunting berkas di VPS atau Pi**, termasuk `chmod +x` dan `git pull` tangan sesudah peralihan: ubah lewat *pull request*. Skrip berhenti bila salinan repo di sana tersunting ([10.8](#108-mulai-sekarang-vps-hanya-berubah-lewat-pull-request-3-menit)).
> 6. **Skrip dan kamu tidak pernah menjalankan `docker compose down -v`, `prune`, atau `git reset --hard`** di VPS atau Pi, dan tidak pernah `sudo sh skrip/pasang.sh` ([9.3](#93--pemasang-satu-skrip-skrippasangsh-dan-dua-berkas-unit-7-menit)).
> 7. **"Tanpa kamu SSH" ≠ "tanpa SSH".** Robot tetap masuk ke VPS lewat SSH; karena itu kuncinya dibatasi ([Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri)).

Seperti Modul 16–28, modul ini diawali [🔁 Pemanasan ulang](#-pemanasan-ulang-versi-langkah-tangan-dan-satu-kode-keluar-30-menit). Hari pertama cukup pemanasan, [🏆 Kemenangan Cepat](#-kemenangan-cepat-robot-pertama-centang-hijau-lalu-silang-merah-15-menit), [Konsep 1](#1-piramida-uji-bahan--resep--dapur--pelanggan) sampai [Konsep 4](#4-lint--test--build-gagal-cepat), lalu [Praktik 1](#praktik-1--meja-kerja-cabang-repo-publik-dan-cadangan-10-menit) dan [Praktik 2](#praktik-2--lint-backend-dan-uji-frontend-oxlint-dan-vitest-25-menit); VPS dan Pi-mu baru berubah di [Praktik 10](#praktik-10--vps-beralih-ke-menarik-kunci-robot-yang-hanya-bisa-satu-skrip-45-menit) dan [Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit). Urutan baca sebelas konsep ada di awal [🧠](#-konsep-mengapa); lipatan [🚨](#-kalau-tidak-jalan) dibuka saat perlu, [🔬](#-bedah-teknis-opsional) boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang versi, langkah tangan, dan satu kode keluar (30 menit)](#-pemanasan-ulang-versi-langkah-tangan-dan-satu-kode-keluar-30-menit)
4. [🏆 Kemenangan Cepat: robot pertama, centang hijau lalu silang merah (15 menit)](#-kemenangan-cepat-robot-pertama-centang-hijau-lalu-silang-merah-15-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Piramida uji](#1-piramida-uji-bahan--resep--dapur--pelanggan) · [2 Database uji](#2-yang-tidak-terlihat-tiruan-integration-test-dengan-database-uji) · [3 CI: robot pembaca kode keluar](#3-ci-robot-yang-membaca-kode-keluar) · [4 Gagal cepat](#4-lint--test--build-gagal-cepat) · [5 Satu *image* dua prosesor](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi) · [6 Toko *image* dan izin robot](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables) · [7 Dorong vs tarik](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri) · [8 Jam weker systemd](#8-systemd-timer-jam-weker-untuk-satpam-modul-12) · [9 *Staging* vs produksi](#9-staging-vs-produksi-gladi-resik-vs-pentas) · [10 SemVer, `CHANGELOG`, dan *tag*](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur) · [11 Aturan cabang](#11-aturan-cabang-palang-di-depan-main)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Meja kerja](#praktik-1--meja-kerja-cabang-repo-publik-dan-cadangan-10-menit) · [2 *Lint* dan Vitest](#praktik-2--lint-backend-dan-uji-frontend-oxlint-dan-vitest-25-menit) · [3 Database uji dan 20 *integration test*](#praktik-3--database-uji-dan-20-integration-test-60-menit) · [4 Robot pemeriksa](#praktik-4--robot-pemeriksa-di-setiap-pull-request-40-menit) · [5 Aturan cabang](#praktik-5--aturan-cabang-pr-merah-tidak-bisa-di-merge-20-menit) · [6 Satu nomor versi 2.0.0](#praktik-6--satu-nomor-versi-200-satpam-versi-changelogmd-dan-versi-di-layar-30-menit) · [7 *Image* dua prosesor](#praktik-7--satu-image-dua-prosesor-dikirim-robot-ke-ghcr-35-menit) · [8 *Staging*](#praktik-8--staging-sekali-pakai-di-mesin-robot-25-menit) · [9 Rilis pertama 2.0.0](#praktik-9--rilis-pertama-200-tag-oleh-robot-pemasang-satu-skrip-dan-paket-publik-35-menit) · [10 VPS menarik](#praktik-10--vps-beralih-ke-menarik-kunci-robot-yang-hanya-bisa-satu-skrip-45-menit) · [11 Pi memperbarui sendiri](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit) · [12 PR kecil 2.0.1](#praktik-12--pr-kecil-201-sampai-ke-produksi-tanpa-kamu-ssh-30-menit) · [13 *Revert* menjadi 2.0.2](#praktik-13--kembali-ke-versi-sebelumnya-revert-menjadi-202-20-menit)
   - Jalur gratis: tanpa Praktik 10 · Tanpa Pi: tanpa Praktik 11 · Repo privat: Praktik 5 tidak tersedia di akun gratis
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-29)

## 🎯 Setelah modul ini kamu bisa…

1. **Menulis *integration test* API dengan database TimescaleDB uji sekali pakai**, dan tahu kesalahan apa yang hanya tertangkap olehnya: kueri SQL salah yang lolos dari 203 tes tiruan.
2. **Membiarkan robot GitHub Actions memeriksa setiap *pull request***: cek tipe, *lint*, 223 tes, dan *build*, dengan membaca kode keluar (`0` = centang hijau, selain itu silang merah).
3. **Memasang aturan cabang yang menolak PR merah**, juga untukmu sebagai pemilik repo.
4. **Membangun satu *image* untuk dua jenis prosesor tanpa emulasi** (VPS amd64, Pi arm64), lalu mengirimnya ke GHCR dengan token sementara robot.
5. **Menggladi setiap rilis di *staging* sekali pakai**: mesin robot, data palsu, dibuang sesudahnya. Rilis yang merah di sana tidak pernah sampai ke VPS dan Pi.
6. **Memberi proyek satu nomor versi SemVer** (2.0.0), `CHANGELOG.md`, dan *tag* rilis buatan robot.
7. **Membiarkan robot memasang VPS lewat SSH** dengan kunci yang hanya bisa menjalankan satu skrip.
8. **Membuat Pi memperbarui dirinya sendiri** dengan jam weker systemd: Pi bertanya setiap 15 menit dan memasang rilis bertanda yang baru.
9. **Kembali ke versi sebelumnya dengan *revert***, maju untuk mundur (2.0.2 berisi isi 2.0.0), dan menyebut batasnya dengan jujur: database tidak ikut mundur, dan *image* lama menumpuk sampai Modul 30.

Singkatnya, alur kerja tim *engineering* sungguhan: setiap perubahan diuji otomatis, dibungkus menjadi *image*, lalu dipasang ke VPS dan Pi tanpa kamu SSH.

## 🧰 Yang perlu disiapkan

Tidak ada perangkat keras atau aplikasi baru, dan untuk repo publik semuanya gratis (GitHub Actions, GHCR, aturan cabang). Kolom jalurnya sama dengan tabel **Pilih jalurmu**.

| Yang disiapkan | Utama | Gratis | Tanpa Pi | Keterangan |
| :--- | :-: | :-: | :-: | :--- |
| **Hasil Modul 28** di `main` | ✓ | ✓ | ✓ | Backend 1.5.0 (203 *unit test*), frontend 1.4.0, `compose.cloud.yml`, dan `edge/` dengan *dynamic security*, semuanya menyala; dicek di [🔁 Langkah 1](#langkah-1--inventaris-rumah-modul-28-nomor-versi-203-tes-dan-image-buatan-sendiri). |
| **Akun GitHub**, repo `rumah-pintar-mini` | ✓ | ✓ | ✓ | Sejak Modul 3; publik atau privat diputuskan di [1.2](#12--repo-rumah-pintar-mini-publik-atau-privat-periksa-di-settings--general-lalu-putuskan-3-menit). |
| **VPS** Modul 27 | ✓ | — | ✓ | Pengguna `rumah` anggota grup `docker`, kunci SSH ed25519, *login* sandi dan root mati, ufw 22/80/443/8883. *Swap* 2 GB tidak lagi dipakai untuk *build*: VPS menarik *image*. |
| **Pi** | gerbang | pusat + gerbang | — | Pengguna `budi` (Modul 12) anggota grup `docker` (Modul 26). Tanpa Pi, laptop tetap gerbang. |
| **Docker di laptop** | ✓ | ✓ | ✓ | Docker Desktop (sejak Modul 17) atau Docker Engine di Linux, untuk database uji ([3.1](#31--database-uji-sekali-pakai-rumahpintar-db-uji-di-loket-5433-6-menit)). |

Pakai versi tertulis supaya hasilmu sama; Silabus (v1.0.31) mencatat alat dan versinya di Modul 29.

| Alat | Versi (per 4 November 2026) |
| :--- | :--- |
| Vitest (baru di dashboard), oxlint (baru di backend) | 5.0.5 dan 1.89.0, sama dengan folder sebelahnya (5.1.0 dan 1.91.0 sengaja belum dipakai) |
| GitHub Actions | *runner* `ubuntu-24.04` (bukan `ubuntu-latest`, yang diumumkan pindah ke Ubuntu 26.04 pada November 2026); `actions/checkout@v7`, `actions/cache@v6`; Kemenangan Cepat: `actions/setup-node@v7` |
| `docker buildx`, GHCR | `docker/setup-buildx-action@v4`, `docker/login-action@v4`, `docker/build-push-action@v7` |
| Node.js 24, *image* | `node:24.22.1-alpine3.24` (robot), `timescale/timescaledb:2.30.2-pg17` (database uji): sama dengan Modul 28 |
| SSH, systemd *timer* | bawaan; kunci ed25519 kedua khusus robot, jam weker di Pi |

Contoh di internet masih `actions/checkout@v4` atau `ubuntu-latest`? Lihat lipatan pertama di [🚨](#-kalau-tidak-jalan).

**Berkas yang berubah minggu ini** (cocokkan di [➕ F](#f-cocokkan-proyekmu-berkas-baru-dan-berubah-tiga-diff-dan-butir-modul-29-di-templat-pull-request)):

| Tempat | Berkas |
| :--- | :--- |
| Akar proyek | baru: `.github/workflows/ci.yml`, `CHANGELOG.md`; diubah: `compose.cloud.yml` (tiga baris `image:`), `.env.example`, `.gitattributes`, templat *pull request*, README |
| `skrip/` | baru: `pasang.sh`, `uji-asap.sh`, `cek-versi.mjs`, `systemd/rumahpintar-perbarui.service` dan `.timer` |
| `backend/` 2.0.0 | baru: `.oxlintrc.json`, `src/app.ts`, `src/config/versi-server.ts`, `src/integrasi/` (`siapkan.ts` + 6 berkas, 20 *integration test*); diubah: `src/server.ts`, `src/routes/kesehatan.ts`, `src/services/versi.test.ts`, `package.json` dan *lock*, `Dockerfile`, `.dockerignore`, README |
| `frontend/` 2.0.0 | baru di `src/`: `waktu.test.ts`, `csv.test.ts`, `aturan.test.ts`, `versi.d.ts`; diubah: `vite.config.ts`, `Masuk.tsx` dan `TataLetak.tsx` (versi di layar), `index.css`, `package.json` dan *lock*, `Dockerfile`, `.dockerignore`, README |
| `edge/` | README saja |
| Tetap | firmware (Node 1 1.7.x, Node 2 1.0.0), `KONTRAK-DATA.md` 1.6, `PETA-PIN.md` 7, migrasi `001…011`, `alat/`, `grafana/`, *image* pihak ketiga |
| Di luar proyek | bahan latihan `kemenangan-cepat/halo.yml` dan kunci 🧩 `tantangan/kunci/` |

Tiga *diff* ([`backend-2.0.diff`](kode/backend-2.0.diff), [`frontend-2.0.diff`](kode/frontend-2.0.diff), [`edge.diff`](kode/edge.diff)) memuat seluruh perubahan `backend/`, `frontend/`, dan `edge/`, untuk mencocokkan. Praktik menyalin berkas satu per satu karena berkasnya datang dalam dua *pull request*; jangan menimpa foldermu dengan [`kode/`](kode/).

**Empat *pull request*** (di-*merge* dengan **Create a merge commit**, seperti Modul 16) dan dua cabang buangan:

| PR | Cabang | Isi | Praktik |
| :-: | :-- | :-- | :-- |
| A | `fitur/uji-robot` | *lint*, Vitest, database uji, robot `periksa` + `uji` (versi belum naik) | [1.1](#11-cabang-fituruji-robot-dari-main-yang-terbaru-3-menit)–4.5 |
| B | `fitur/pipeline` | versi 2.0.0, *image* dua prosesor, *staging*, *tag* rilis, pemasang | [6.1](#61--cabang-fiturpipeline-dan-tiga-baris-gitattributes-3-menit)–9.5 |
| C | `perbaikan/teks-masuk` | satu teks di layar **Masuk**, versi 2.0.1 | [12.1](#121--cabang-perbaikanteks-masuk-satu-teks-di-layar-masuk-satpam-versi-menolak-4-menit)–12.3 |
| D | buatan tombol **Revert** | isi 2.0.0 dengan nomor 2.0.2 | [13.1](#131-tombol-revert-di-pr-c-satpam-versi-menolak-versi-turun-5-menit)–13.3 |
| — | `coba/robot`, `coba/merah` | ditutup tanpa *merge* | Kemenangan Cepat, [5.2](#52--push-langsung-ke-main-ditolak-3-menit) |

**Waktunya** ±10 jam (jalur gratis ±9 jam, tanpa Pi ±9,5 jam), ditambah menunggu jam weker Pi (biasanya paling lambat ±17 menit): pemanasan 30 menit, Kemenangan Cepat 15, konsep ±90, praktik 415 termasuk menunggu robot, ➕ 30, kuis dan checklist 20.

## 🔁 Pemanasan ulang versi, langkah tangan, dan satu kode keluar (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal di akar proyek dan `backend`), **Docker Desktop**, terminal SSH ke VPS dan Pi, **Chrome**, dan **GitHub**.

Lima bekal, semuanya hanya **membaca** (suntingan Langkah 3 dikembalikan).

> 🔀 **Jalur gratis:** "VPS" di Langkah 1, 2, dan 4 = Pi-mu. **Tanpa Pi:** lewati bagian Pi.

### Langkah 1 — Inventaris rumah Modul 28: nomor versi, 203 tes, dan *image* buatan sendiri

Di mana saja nomor versi ditulis? Di terminal akar proyek (bash; atau **Ctrl + Shift + F** di VS Code), satu per satu:

```text
grep -n '"version"' backend/package.json frontend/package.json
```

```text
grep -n 'image: ${TOKO_IMAGE' compose.cloud.yml
```

**Hasilnya (lab penulis, laptop):**

```text
backend/package.json:3:  "version": "1.5.0",
frontend/package.json:4:  "version": "1.4.0",
208:    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-backend:1.5.0
222:    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-backend:1.5.0
257:    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-web:1.4.0
```

Dua nomor di lima baris, ditulis tangan, tanpa pemeriksa. Lalu tiga pemeriksaan; hasil lab penulis ada sesudah → (laptop, "VPS" tiruan):

1. Terminal `backend`: `npm test` → `Test Files  25 passed (25)`, `Tests  203 passed (203)`.
2. Chrome: `https://iot.namaanda.my.id/api/health` → `{"ok":true,"broker":true,"database":true,"diterima":5,"ditolak":0,"diabaikan":0}`, belum ada `versi`.
3. Terminal SSH VPS, folder `~/rumah-pintar-mini`: `docker compose ps` → semua `Up`; kolom `IMAGE`: `ghcr.io/<akun>/rumah-pintar-mini-backend:1.5.0` dan `…-web:1.4.0` (alamat GHCR), padahal biasanya dibangun VPS sendiri (7.4 Modul 27). Di Pi (folder `edge`): hanya `mosquitto`, *image* resmi.

**Nanti di** [3.2](#32--satu-rakitan-server-buatapp-di-srcappts-203-tes-tetap-hijau-10-menit), [6.2](#62--satu-nomor-200-npm-version-tiga-baris-image-dan-envexample-6-menit), dan [10.1](#101--terakhir-kali-ssh-untuk-memasang-sh-skrippasangsh-menarik-200-10-menit).

### Langkah 2 — Hitung langkah tangan satu perubahan kecil, dari laptop sampai VPS dan Pi

Misalkan satu teks layar **Masuk** diubah. Sejak [➕ Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#-tambahan-ke-rumah-pintar-mini) (bagian E), jalannya begini:

| Mesin | Langkah tangan |
| :-- | :-- |
| Laptop | `npm test` (kalau ingat), *commit*, *push* |
| GitHub | buka *pull request*, *merge* |
| VPS | SSH, `git pull`, `docker compose build`, `docker compose up -d` |
| Pi | SSH, `git pull`, `docker compose restart mosquitto` bila `edge/` berubah |

Hitung langkahmu dan catat di `belajar-iot/modul-29/pemanasan.md`: biasanya ±10 langkah di tiga mesin, ±15–25 menit (perkiraan). Minggu ini baris VPS dan Pi dikerjakan robot dan jam weker. **Nanti di** [12.6](#126--hapus-cabang-dan-catat-waktu-stopwatch-3-menit) dan [➕ E](#e-changelogmd-dan-tag-v200-v201-v202-catat-waktu-stopwatch-mu): *stopwatch*-nya.

### Langkah 3 — Bahasa robot: kode keluar `0` dan `1` dari `npm test`

Setiap perintah meninggalkan **kode keluar**: `0` = berhasil, selain itu gagal. Janji [🔬 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#-bedah-teknis-opsional) (lipatan *Bruno CLI …*): kode `1` membuat pemeriksaan otomatis menolak PR. Di terminal `backend` (bash; PowerShell, tidak diuji: `npm test > $null; "kode keluar: $LASTEXITCODE"`):

```text
npm test > /dev/null; echo "kode keluar: $?"
```

**Hasilnya (lab penulis, laptop):** `kode keluar: 0`. Sekarang sengaja salah: di `src/services/versi.test.ts` baris 8, ubah `.toBe(1)` menjadi `.toBe(2)`, simpan, lalu jalankan tanpa `> /dev/null`:

```text
npm test; echo "kode keluar: $?"
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
AssertionError: expected 1 to be 2 // Object.is equality
 Test Files  1 failed | 24 passed (25)
      Tests  1 failed | 202 passed (203)
kode keluar: 1
```

Kembalikan dengan `git restore src/services/versi.test.ts`, lalu ulangi perintah pertama: `kode keluar: 0`. Robot hanya membaca angka ini. **Nanti di** [KC Langkah 4](#langkah-4--ubah-satu-expect-silang-merah-dan-kode-keluar-1-di-log-4-menit) dan [Konsep 3](#3-ci-robot-yang-membaca-kode-keluar).

### Langkah 4 — Prosesor laptop, VPS, dan Pi: `docker version` dan `docker buildx ls`

Di laptop, lalu di terminal SSH VPS dan Pi:

```text
docker version --format '{{.Server.Arch}}'
```

Intel atau AMD (laptop, VPS) menjawab `amd64`; Pi, Mac Apple silicon, dan Snapdragon `arm64`. **Hasilnya (lab penulis):** `arm64` di ketiganya (semuanya diperankan Raspberry Pi 5 penulis). Lalu di laptop:

```text
docker buildx ls
```

**Hasilnya (lab penulis, laptop):** satu pembangun `default`, `PLATFORMS` hanya `linux/arm64`, prosesornya sendiri. Di Docker Desktop daftarnya lebih panjang (emulasi; tidak diuji penulis). VPS dan Pi berbeda prosesor, karena itu Modul 27 membangun *image* di mesin pemakainya. **Nanti di** [Konsep 5](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi) dan [Praktik 7](#praktik-7--satu-image-dua-prosesor-dikirim-robot-ke-ghcr-35-menit).

### Langkah 5 — GitHub dan Pi: repo publik, paket GHCR Modul 26, dan `systemctl list-timers`

Layar GitHub: dari dokumennya (5 November 2026), tidak direkam penulis.

1. **Repo publik?** Buka `https://github.com/<akun>/rumah-pintar-mini` di jendela *incognito* Chrome (**Ctrl + Shift + N**): tampil = publik (bisa dibuka siapa pun). Setelannya: **Settings** → **General**, paling bawah; putuskan di [1.2](#12--repo-rumah-pintar-mini-publik-atau-privat-periksa-di-settings--general-lalu-putuskan-3-menit).
2. **Paket GHCR Modul 26?** Di jendela itu, `https://github.com/<akun>?tab=packages`: yang tampil = publik, yang hanya tampil sesudah *login* = privat. Yang tertaut ke repo (`LABEL` Modul 26) ada di bagian **Packages** kolom kanan halaman repo. Tanpa paket pun boleh. **Nanti di** [9.7](#97--paket-ghcr-menjadi-publik-tarik-tanpa-login-dua-prosesor-4-menit).
3. **Jam weker Pi.** Di terminal SSH Pi:

```text
systemctl list-timers
```

Satpam Modul 12 sudah punya jam weker bawaan. Menurut `man systemctl` (systemd 259), kolom `NEXT` = kapan berbunyi lagi, `UNIT` = jam wekernya, `ACTIVATES` = layanan yang dibangunkannya. Isinya berbeda per Pi; tidak direkam penulis (Pi tiruan tanpa systemd). **Nanti di** [Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12) dan [11.4](#114--nyalakan-jam-weker-enable---now-dan-list-timers-5-menit).

<details>
<summary>Kunci uji dirimu</summary>

1. **Kenapa robot cukup membaca kode keluar?** Setiap alat sudah memutuskan sendiri lulus atau tidak dan melapor dengan satu angka; pesan galatnya untuk manusia.
2. **Prosesor VPS dan Pi?** Biasanya `amd64` dan `arm64`; *image* buatan sendiri hanya untuk prosesor pembangunnya.
3. **Berapa langkah, dan mana yang paling sering lupa?** ±10; jawabanmu sendiri, misalnya `npm test` atau *restart* broker Pi.

</details>

## 🏆 Kemenangan Cepat: robot pertama, centang hijau lalu silang merah (15 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** (terminal di akar proyek `rumah-pintar-mini`) dan **GitHub** di browser.

Sampai Modul 28, 203 *unit test* backend hanya jalan kalau kamu ingat. Robot pertamamu, satu berkas YAML untuk GitHub Actions, menjalankannya di setiap *pull request*. Kamu melihatnya hijau, lalu sengaja merah, dengan bahasa yang sama seperti [🔁 Langkah 3](#langkah-3--bahasa-robot-kode-keluar-0-dan-1-dari-npm-test): kode keluar. Semuanya di cabang buangan `coba/robot`; `main`, VPS, dan Pi tidak tersentuh.

> [!NOTE]
> **Belum direkam penulis:** layar GitHub di sini (tab **Checks**, log, tombol) dari dokumen GitHub (dibaca 5 November 2026). Berkas `halo.yml` yang sama dijalankan apa adanya oleh robot tiruan penulis di Raspberry Pi 5 (arm64), termasuk `actions/setup-node@v7`: *job*-nya hijau dalam 52 detik dan merah dalam 39 detik (contoh robot tiruan, bukan waktu GitHub; caranya di [🔬](#-bedah-teknis-opsional) *Bagaimana penulis menguji …*).

> 🔀 **Repo privat:** setiap *run* (satu putaran kerja robot) memotong kuota menit bulanan akun gratis ([Konsep 3](#3-ci-robot-yang-membaca-kode-keluar)); latihan sependek ini tetap boleh.

### Langkah 1 — Cabang `coba/robot` dari `main` yang terbaru (1 menit)

Di laptop, buka terminal VS Code di akar proyek. Pastikan `git status` bersih (semua perubahan sudah di-*commit*), lalu:

```text
git switch main
git pull
git switch -c coba/robot
```

**Hasilnya (lab penulis, laptop; baris terakhir):** `Switched to a new branch 'coba/robot'`.

### Langkah 2 — Robot pertama di `.github/workflows/halo.yml` (4 menit)

Folder `.github/` sudah ada sejak Modul 16 (templat *pull request*). Di VS Code, buat folder `workflows` di dalamnya, lalu berkas `halo.yml` di folder itu. Isinya blok di bawah (atau **Copy raw file** dari [`kode/kemenangan-cepat/halo.yml`](kode/kemenangan-cepat/halo.yml)); simpan dengan **Ctrl + S**.

```yaml
# halo.yml - Kemenangan Cepat Modul 29: robot pertama. Taruh berkas ini di .github/workflows/halo.yml di cabang
# coba/robot SAJA, buka pull request, lihat centang hijau, lalu buat merah. Pull request itu ditutup TANPA merge, jadi
# berkas ini tidak pernah masuk main (robot sungguhannya .github/workflows/ci.yml, Praktik 4).
name: halo

# kapan robot bekerja: setiap pull request dibuka, atau cabangnya mendapat commit baru
on: pull_request

# token robot hanya boleh MEMBACA isi repo
permissions:
  contents: read

jobs:
  tes-backend:
    runs-on: ubuntu-24.04                  # komputer sewaan GitHub (Ubuntu 24.04), dihapus lagi sesudah job selesai
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v7          # ambil isi repo pada commit pull request ini
      - uses: actions/setup-node@v7        # pasang Node.js, versi yang sama dengan Dockerfile backend dan dashboard
        with:
          node-version: 24.22.1
      - name: pasang library (persis menurut package-lock.json)
        working-directory: backend
        run: npm ci
      - name: unit test
        working-directory: backend
        run: npm test                      # kode keluar 0 = centang hijau; selain 0 = silang merah
```

Baca komentarnya: itulah pelajarannya. Yang tidak tertulis di sana:

- Spasi di depan baris bermakna: dua spasi per tingkat, tanpa tab. Tempel apa adanya.
- Setiap `-` di bawah `steps:` adalah satu langkah: `uses:` memanggil program siap pakai (*action*), `run:` menjalankan perintah seperti di terminalmu, di folder `working-directory:` (`backend`); `name:` menjadi nama langkah di log.
- GitHub hanya membaca robot di folder `.github/workflows/`; `timeout-minutes: 10` menghentikan *job* yang macet sesudah 10 menit.
- `actions/setup-node` paling sering kamu temui di contoh internet; robot sungguhanmu nanti memakai wadah (kontainer) Node yang sama dengan `Dockerfile` backend dan dashboard ([Konsep 4](#4-lint--test--build-gagal-cepat)).

### Langkah 3 — *Commit*, *push*, dan buka *pull request*: centang hijau di tab Checks (4 menit)

```text
git add .github/workflows/halo.yml
git commit -m "coba: robot pertama (halo.yml)"
git push -u origin coba/robot
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
 1 file changed, 27 insertions(+)
 create mode 100644 .github/workflows/halo.yml
 * [new branch]      coba/robot -> coba/robot
```

Di GitHub, buka *pull request* seperti [Praktik 8 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#praktik-8--git-untuk-tim-branch-pull-request-dan-review-45-menit): **Compare & pull request**, judul `coba robot (jangan di-merge)`, templat deskripsinya biarkan, lalu **Create pull request**. Buka tab **Checks**, yang menunjukkan pemeriksaan mana yang berjalan dan kenapa lulus atau gagal: *workflow* `halo` mula-mula masih berjalan, lalu centang hijau (lamanya di GitHub belum diukur penulis). Pilih *job* `tes-backend`, lalu buka langkahnya satu per satu sampai `unit test`.

**Hasilnya (lab penulis, robot tiruan; log *job* `tes-backend`, dipotong):**

```text
node: v24.22.1
added 225 packages, and audited 226 packages in 11s
 Test Files  25 passed (25)
      Tests  203 passed (203)
   Start at  01:04:01
   Duration  13.40s (import 49%, tests 39%, transform 11%, worker 2%)
```

Jumlah tesnya sama dengan [🔁 Langkah 1](#langkah-1--inventaris-rumah-modul-28-nomor-versi-203-tes-dan-image-buatan-sendiri), tetapi mesinnya lain: mesin robot yang baru dan kosong, `npm ci` memasang 225 library dari nol, Node persis 24.22.1, dan `Start at` berjam UTC (01.04 = 08.04 WIB).

### Langkah 4 — Ubah satu `expect`: silang merah dan kode keluar `1` di log (4 menit)

Ulangi kesalahan [🔁 Langkah 3](#langkah-3--bahasa-robot-kode-keluar-0-dan-1-dari-npm-test): di `backend/src/services/versi.test.ts` baris 8, ubah `.toBe(1)` menjadi `.toBe(2)`, lalu simpan.

```text
git commit -am "coba: satu expect sengaja salah"
git push
```

Setiap *push* ke cabang *pull request* menyalakan *run* baru. Kali ini tab **Checks** berakhir dengan silang merah. Buka log *job* itu; menurut dokumen GitHub, langkah yang gagal langsung terbuka.

**Hasilnya (lab penulis, robot tiruan; langkah `unit test`, dipotong):**

```text
AssertionError: expected 1 to be 2 // Object.is equality
 ❯ src/services/versi.test.ts:8:47
 Test Files  1 failed | 24 passed (25)
##[error]Process completed with exit code 1.
```

Tiga baris pertama ditulis Vitest untukmu: apa yang salah, di baris mana, dan berapa berkas tes yang gagal. Baris terakhir ditulis mesin robot (awalan `##[error]` bisa tampil lain di GitHub): `npm test` keluar dengan kode `1`, jadi langkah `unit test` dan *job*-nya merah. Robot tidak membaca `AssertionError`; ia hanya membaca angka itu.

### Langkah 5 — Tutup *pull request* tanpa *merge*, lalu hapus cabangnya (2 menit)

Menurut dokumen GitHub: di bagian bawah halaman *pull request*, di bawah kotak komentar, klik **Close pull request** (bukan **Merge pull request**), lalu **Delete branch**. Di terminal:

```text
git switch main
git branch -D coba/robot
git ls-files .github
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
Deleted branch coba/robot (was <sha>).
.github/pull_request_template.md
```

`-D` berhuruf besar karena cabang ini memang tidak pernah di-*merge*; `.toBe(2)` ikut hilang bersamanya. `git ls-files .github` membuktikan `halo.yml` tidak pernah masuk `main`: robot sungguhanmu, `ci.yml`, datang di [Praktik 4](#praktik-4--robot-pemeriksa-di-setiap-pull-request-40-menit), berjalan di PR A ([4.2](#42--commit-push-dan-buka-pr-a-dua-check-berjalan-bersamaan-5-menit)), dan sengaja dibuat merah sekali lagi di [4.4](#44--l0-sengaja-merah-sekali-lalu-semua-hijau-8-menit). Dua robot untuk tes yang sama hanya menggandakan *check*.

**Kamu vs robot:**

| | Kamu ([🔁 Langkah 3](#langkah-3--bahasa-robot-kode-keluar-0-dan-1-dari-npm-test)) | Robot (`halo.yml`) |
| :-- | :-- | :-- |
| Siapa ingat menjalankan tes | kamu, kalau ingat | robot, setiap kali |
| Di mesin siapa | laptopmu, dengan isi dan Node-nya sendiri | mesin sewaan yang baru setiap kali, Node 24.22.1 persis, hanya isi *commit* |
| Kapan | sebelum *push*, kalau ingat | saat *pull request* dibuka, lalu setiap *push* ke cabangnya |
| Yang dibaca | pesan di layar | kode keluar |
| Siapa melihat hasilnya | kamu | siapa pun yang membuka tab **Checks** (repo publik = log publik) |

> ➡️ **Berikutnya:** [Konsep 1](#1-piramida-uji-bahan--resep--dapur--pelanggan) dan [Konsep 2](#2-yang-tidak-terlihat-tiruan-integration-test-dengan-database-uji) menjelaskan kenapa 203 tes yang baru dijalankan robot belum cukup, lalu [Konsep 3](#3-ci-robot-yang-membaca-kode-keluar) dan [Konsep 4](#4-lint--test--build-gagal-cepat) menjelaskan robot yang baru kamu lihat. Sesudah itu kerjakan [Praktik 1](#praktik-1--meja-kerja-cabang-repo-publik-dan-cadangan-10-menit) dan [Praktik 2](#praktik-2--lint-backend-dan-uji-frontend-oxlint-dan-vitest-25-menit); VPS dan Pi-mu baru berubah di [Praktik 10](#praktik-10--vps-beralih-ke-menarik-kunci-robot-yang-hanya-bisa-satu-skrip-45-menit) dan [Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit).

## 🧠 Konsep "Mengapa"

Sebelas konsep ini tidak perlu dibaca sekaligus. Bacalah berselang-seling dengan praktiknya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1–4 → Praktik 1 (meja kerja), Praktik 2 (*lint* dan uji frontend), Praktik 3 (database uji dan 20 *integration test*), lalu Praktik 4 (robot pemeriksa di *pull request* pertama)
2. Konsep 11 → Praktik 5 (aturan cabang)
3. Konsep 10 → Praktik 6 (satu nomor versi 2.0.0) → Konsep 5–6 → Praktik 7 (*image* dua prosesor)
4. Konsep 9 → Praktik 8 (*staging*) → Konsep 7–8 → Praktik 9 (rilis pertama 2.0.0), Praktik 10 (VPS), dan Praktik 11 (Pi)
5. Praktik 12 (PR kecil 2.0.1 sampai ke produksi) → Praktik 13 (*revert* menjadi 2.0.2)

Praktik 1–9 dikerjakan di laptop dan di GitHub: VPS dan Pi-mu baru berubah di Praktik 10 dan 11 (cadangan di Praktik 1 hanya membaca). Potongan berkas, perintah, dan tabel di bagian konsep cukup dibaca; semuanya diketik dan dijalankan di praktik.

Modul 28 ditutup dengan batas yang jujur: *image* server masih dipasang lewat SSH tanpa uji otomatis ([akhir Modul 28](../modul-28-ota-provisioning-fleet/README.md#-checklist-kelulusan-modul-28)). Konsep 1–2 menjawab **apa** yang diuji dan kenapa 203 tes saja belum cukup. Konsep 3–4 menjawab **siapa** yang menjalankannya dan dalam urutan apa. Konsep 5–9 membawa hasilnya ke VPS dan Pi, lalu Konsep 10–11 menjaga nomor versi dan cabang `main`.

### 1. Piramida uji: bahan → resep → dapur → pelanggan

[Konsep 6 Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#6-unit-test-memeriksa-otak-aturan-tanpa-perangkat) memberimu 10 *unit test* (uji satuan) pertama untuk otak aturan. Sejak itu jumlahnya tumbuh di hampir setiap modul, dan di akhir Modul 28 `npm test` di folder `backend` menulis `Tests  203 passed (203)` ([🔁 Langkah 1](#langkah-1--inventaris-rumah-modul-28-nomor-versi-203-tes-dan-image-buatan-sendiri)). Namun, 203 tes hijau belum menjamin rumahmu jalan. Yang membedakan satu tes dengan tes lain adalah **berapa banyak bagian sungguhan yang ikut bekerja** saat tes itu dijalankan.

Bayangkan sebuah restoran. Koki bisa **mencicipi bahan** satu per satu: garamnya asin, cabainya pedas. Itu cepat, murah, dan bisa diulang seratus kali sehari, tetapi belum membuktikan masakannya enak. Ia juga bisa **memasak resep di dapur latihan**: kompor, wajan, dan bahan sungguhan, tetapi tanpa pelanggan. Terakhir, **pelanggan memesan sampai makanan datang**: pelayan, dapur, dan kasir bekerja bersama. Cara terakhir paling meyakinkan, tetapi paling lambat dan paling mudah goyah karena setiap bagian bisa tersendat. Tiga cara mencicipi ini adalah tiga lapis piramida uji yang dijanjikan [Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) (unit → integrasi → *end-to-end*):

| Lapis | Analogi | Yang sungguhan bekerja | Yang ditiru atau dilewati | Di proyekmu sesudah Modul 29 | Lama (contoh Pi 5 penulis) |
| :-- | :-- | :-- | :-- | :-- | :-- |
| *unit test* | mencicipi bahan | satu fungsi, atau satu rute API | database dan broker (tiruan `vi.mock`); jaringan dilewati (`app.inject`) | backend **203** tes (25 berkas) + dashboard **5** tes (3 berkas, baru di [2.3](#23--vitest-505-di-frontend-tiga-berkas-tes-lima-tes-pertama-dashboard-8-menit)) | backend ±15 detik, dashboard ±9 detik, tanpa Docker |
| *integration test* | memasak resep di dapur latihan | rute API + kueri SQL + database TimescaleDB uji | broker (alamat mati) dan Telegram | **20** tes (6 berkas di `backend/src/integrasi/`, baru di Praktik 3) | ±13 detik, ditambah ±5 detik menyalakan database uji |
| *end-to-end test* | pelanggan memesan sampai makanan datang | peramban → Caddy → backend → database → broker | tidak ada | **0** di jalur utama | paling lambat |

**Dua jenis tes di lapis paling bawah.** Jenis pertama menguji **fungsi murni**, seperti `nilaiAmbang()` Modul 19 atau `bandingkanVersi()` Modul 28: masukan masuk, keluaran keluar, tanpa jam, database, atau MQTT sungguhan. Jenis kedua, sejak [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#110-tes-dan-simpan-ke-cabang-7-menit), menguji **rute tanpa jaringan**: server Fastify dirakit, lalu diketuk dengan `app.inject()` tanpa membuka loket mana pun, sementara tabel database diganti tabel tiruan di memori dengan `vi.mock`. Keduanya cepat dan tidak butuh Docker, jadi cocok dijalankan setiap kali kamu mengubah satu baris. Harga kecepatan itu dibahas di Konsep 2: tabel tiruan tidak pernah menjalankan satu kueri SQL pun.

**Bentuk piramida.** Banyak tes kecil yang cepat di bawah, sedikit tes besar yang lambat di atas. Itu bukan aturan angka, melainkan kebiasaan: setiap kesalahan diuji di lapis **serendah** mungkin yang masih bisa menangkapnya. Logika histeresis cukup diuji dengan *unit test*. Kueri yang melanggar aturan tabel butuh *integration test*. Tombol yang lupa disambungkan ke API hanya ketahuan oleh *end-to-end test*. Di jalur utama modul ini, lapis puncaknya masih kosong: *end-to-end test* butuh peramban sungguhan yang dikendalikan program (Playwright), dan itu dibahas sebagai bacaan di [🔬](#-bedah-teknis-opsional) *Playwright: satu alur Masuk → dashboard sebagai end-to-end test* (belum dijalankan penulis).

**Dashboard mendapat tes pertamanya.** Sejak lahir di Modul 22, dashboard belum pernah punya satu tes pun. Di Praktik 2 ia mendapat Vitest 5.0.5, alat yang sama dengan backend ([Silabus](../../SILABUS.md#3-pilihan-teknologi--alasannya): "Vitest (backend & frontend)"), dan lima tes fungsi murni: jam WIB di layar (`waktu.ts`), isi berkas CSV (`csv.ts`), dan kalimat aturan (`aturan.ts`). Tanpa peramban dan tanpa backend: lapis paling bawah dulu.

**Di robot, semuanya wajib jalan.** Di laptop, `npm test` tanpa database uji melewati 20 *integration test* (`Tests  203 passed | 20 skipped (223)`), jadi tetap bisa dijalankan tanpa Docker; dengan database uji, semua 223 tes jalan sekaligus (±29 detik di Pi 5 penulis, di laptopmu berbeda). Robot (Konsep 3) selalu menyalakan database uji, dan satu tes yang dilewati saja membuatnya merah (Konsep 4). Cara dengan database uji kamu jalankan sendiri di [3.6](#36--20-integration-test-hijau-lalu-223-tes-sekaligus-8-menit).

![Diagram piramida uji Rumah Pintar Mini (Konsep 1): banyak tes kecil yang cepat di bawah, sedikit tes besar yang lambat di atas; angka = proyek sesudah Modul 29. Sumbu kiri: atas lambat dan yakin, bawah cepat dan banyak. Puncak, garis putus-putus: end-to-end, 0 tes, pelanggan; kartunya: pelanggan memesan sampai makanan datang, peramban ke Caddy ke backend ke database ke broker, semuanya sungguhan: paling yakin, tetapi paling lambat dan mudah goyah; di modul ini 0 tes, Playwright = Bedah Teknis (opsional). Tengah, warna aksen: integration test, 20 tes, baru di Modul 29, dapur latihan; kartunya: memasak resep di dapur latihan, rute + SQL + database TimescaleDB sungguhan (broker palsu): CHECK, ON CONFLICT, time_bucket, migrasi 001–011 dari nol; 20 tes di 6 berkas src/integrasi/, lewat buatApp() = rakitan yang sama dengan produksi; hanya database berakhiran _uji. Dasar: unit test, 203 + 5 tes, backend + frontend, bahan; kartunya: mencicipi bahan satu per satu: fungsi murni (sejak Modul 19) dan rute tanpa jaringan (app.inject, sejak Modul 21) dengan database dan broker tiruan (vi.mock); backend 203 tes (25 berkas), frontend 5 tes Vitest (waktu WIB, CSV, uraian aturan); tanpa Docker, tanpa jaringan. Kiri bawah, npm test di folder backend (laptop): tanpa database uji, 20 integration test dilewati: Tests 203 passed, 20 skipped (223); dengan DATABASE_URL_UJI: Tests 223 passed (223). Pi 5 penulis: ±15 detik tanpa, ±29 detik dengan database uji; robot (job uji): database uji selalu ada, satu tes skipped = merah. Kanan bawah, yang hanya tertangkap database (lab penulis): SQL salah di src/db/perangkat.ts, $5 diganti upper($5); unit test tetap hijau karena database tiruan tidak menjalankan SQL; integration test merah (6 dari 20): database menolak baris itu (CHECK devices_kunci_hash_check), backend menjawab 503; pelajaran: tiruan cepat, database sungguhan jujur.](aset/piramida-uji-proyek.png)

### 2. Yang tidak terlihat tiruan: *integration test* dengan database uji

Kalimat inti konsep ini pendek: **tiruan tidak menjalankan SQL**. Tak satu pun dari 203 tes backend menyentuh database: tes rute mengganti modul `src/db/` dengan `vi.mock`, dan tesnya sendiri yang menentukan jawaban "database": perangkat tersimpan, baris tidak ada, dan seterusnya. Kalau kueri SQL yang sungguhan salah tulis, tiruannya tetap menjawab manis, dan tesnya tetap hijau.

**Dibuktikan penulis (lab penulis, laptop).** Di baris 44 `backend/src/db/perangkat.ts`, isian `$5` (sidik SHA-256 kunci perangkat yang disimpan) diganti `upper($5)`, jadi sidiknya tertulis dengan huruf besar. Kesalahan satu kata ini kamu ulangi sendiri di [3.7](#37--sengaja-salah-di-sql-203-tes-tiruan-hijau-integration-test-merah-8-menit):

| Yang dijalankan | Hasilnya |
| :-- | :-- |
| `npm test` tanpa database uji (203 tes dengan tiruan) | `Tests  203 passed \| 20 skipped (223)`, kode keluar `0`: **hijau** |
| `npm run test:integrasi` dengan database uji (20 tes) | `Tests  6 failed \| 14 passed (20)`, kode keluar `1`: **merah** |

Sebabnya ada di migrasi `010_kunci_perangkat.sql` dari Modul 21: `CHECK (kunci_hash ~ '^[0-9a-f]{64}$')` hanya menerima 64 huruf heksadesimal **kecil**. Database menolak barisnya (log backend: `new row for relation "devices" violates check constraint "devices_kunci_hash_check"`), backend menjawab `503`, dan tes yang mengharapkan `201` gagal: `AssertionError: expected 503 to be 201 // Object.is equality`. Di produksi, satu kata itu berarti setiap pendaftaran perangkat berkunci lewat `POST /devices` dijawab `503`, padahal 203 tes hijau semua.

**Yang hanya ketahuan dengan database sungguhan.** Contoh di atas bukan satu-satunya. Dua puluh *integration test* di `backend/src/integrasi/` sengaja memilih hal yang tidak bisa dibuktikan tiruan, dan setiap berkasnya lebih dulu menjalankan program migrasi `001`–`011` (dari nol bila databasenya masih kosong):

| Yang dibuktikan database sungguhan | Sejak | Berkas tes |
| :-- | :-- | :-- |
| sidik kunci lolos `CHECK`; daftar ulang `409` tanpa menimpa baris | Modul 21 | `perangkat.test.ts` (4 tes) |
| riwayat 1 jam urut waktu; ringkasan `time_bucket()` TimescaleDB; kiriman ganda = satu baris (`ON CONFLICT`) | Modul 17–18 | `bacaan.test.ts` (3) |
| sesi *login* tersimpan sebagai sidik; *refresh* memutar token; *logout* menghapus baris | Modul 20 | `masuk.test.ts` (4) |
| aturan dihapus, buku kejadiannya tetap (kunci tamu `ON DELETE SET NULL`) | Modul 19 | `aturan.test.ts` (3) |
| kode klaim ditukar sekali dalam satu transaksi; kode kedaluwarsa ditolak | Modul 28 | `klaim.test.ts` (3) |
| metadata rilis firmware dan rilis uji; `GET /armada` membaca kesehatan terakhir (`LATERAL`) | Modul 28 | `firmware-armada.test.ts` (3) |

**Database uji = dapur latihan.** Ia kosong, sekali pakai, namanya selalu berakhiran `_uji`, dan tidak pernah menjadi dapur rumah:

- **Kosong dan sekali pakai.** Di laptop, database uji adalah satu kontainer TimescaleDB dengan *image* yang sama dengan produksi (`timescale/timescaledb:2.30.2-pg17`; migrasi `002`–`005` butuh TimescaleDB, jadi `postgres` polos tidak bisa). Datanya disimpan di memori (`--tmpfs`) sehingga hilang saat kontainernya berhenti, dan loketnya `5433` supaya tidak bertabrakan dengan database rumah di `5432` ([3.1](#31--database-uji-sekali-pakai-rumahpintar-db-uji-di-loket-5433-6-menit)). Di robot, perannya dipegang layanan `db` di *job* `uji` (Konsep 3).
- **Hanya database `…_uji`.** Tes integrasi menulis dan menghapus baris, jadi `src/integrasi/siapkan.ts` memeriksa dua kali: nama database di alamat `DATABASE_URL_UJI` sebelum tersambung, lalu `current_database()` sesudah tersambung; yang menentukan adalah database yang benar-benar tersambung. Alamat database rumahmu ditolak sebelum satu baris pun disentuh: `DATABASE_URL_UJI menunjuk database "rumahpintar", bukan database uji …` ([3.8](#38-pengaman-menolak-database-bernama-rumahpintar-4-menit)).
- **Program migrasi yang sama.** Setiap berkas tes menjalankan `node src/db/migrasi.ts`, program yang sama dengan layanan `migrasi` di Compose. Vitest menjalankan berkas-berkas tes bersamaan, jadi migrasinya diantre dengan `pg_advisory_lock` (kunci antrean milik PostgreSQL: satu berkas memigrasi, berkas lain menunggu giliran), dan setiap berkas memakai `device_id`, email, dan nama aturan miliknya sendiri supaya tidak saling mengganggu ([3.3](#33--srcintegrasisiapkants-pengaman-_uji-dan-migrasi-yang-diantre-6-menit)).
- **Tanpa `DATABASE_URL_UJI`, 20 tes dilewati.** Laptop tanpa Docker tetap bisa menjalankan `npm test`; robot tidak boleh melewatinya (Konsep 4).

**Satu rakitan server: `buatApp()`.** Sampai Modul 28, `src/server.ts` merakit server, lalu langsung menyambung ke database dan broker serta membuka loket `8080`, jadi tes tidak bisa mengambil rakitannya tanpa ikut menyalakan semuanya. Di Praktik 3, rakitan itu pindah ke `src/app.ts` sebagai fungsi `buatApp()`: Fastify, pengaman, semua rute, dan dokumen API, tanpa loket. `server.ts` memanggil `await buatApp()` lalu menyambung dan membuka loket; tes integrasi memanggil `buatApp()` yang sama lalu mengetuknya dengan `app.inject()`. Jadi, yang diuji adalah rakitan produksi, bukan rakitan buatan tes. Penulis membandingkan dokumen API Modul 28 dan Modul 29 (lab penulis): 30 jalur yang sama, dan satu-satunya yang berbeda `/health`, yang kini menyebut `versi` ([3.2](#32--satu-rakitan-server-buatapp-di-srcappts-203-tes-tetap-hijau-10-menit)).

**Kenapa bukan berkas Compose ketiga atau Testcontainers.** [Konsep 10 Modul 26](../modul-26-docker-compose/README.md#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) memutuskan dua berkas Compose sampai akhir; database uji cukup satu baris `docker run` di laptop dan satu layanan di robot. Testcontainers (library yang menyalakan kontainer dari dalam tes) berarti paket baru, dan halaman modul PostgreSQL-nya tidak menyebut TimescaleDB (dibaca 31 Oktober 2026). Inilah *integration test* API dengan database uji yang dijanjikan Silabus.

### 3. CI: robot yang membaca kode keluar

Sampai Modul 28, tes hanya jalan kalau kamu ingat menjalankannya, di laptopmu dengan isinya sendiri. Modul ini menyerahkannya ke **robot**: GitHub Actions, layanan GitHub yang menjalankan perintah di komputer milik GitHub setiap kali perubahan dikirim ke sana. [Silabus](../../SILABUS.md#3-pilihan-teknologi--alasannya) sudah memasangkannya sejak awal: Git dan *pull request* di Modul 16, GitHub Actions di Modul 29. Pemeriksaan otomatis ini disebut **CI** (*continuous integration*, penggabungan berkelanjutan): setiap perubahan diperiksa sebelum digabung ke `main`. Lanjutannya, memasang hasil yang lulus ke VPS dan Pi tanpa kamu SSH, disebut **CD** (*continuous delivery* atau *deployment*: pengiriman dan pemasangan berkelanjutan) dan dibahas di Konsep 5–9. Robot proyekmu bernama `ci`, robot pemeriksa dan pemasang: satu berkas `.github/workflows/ci.yml` yang kamu susun dari Praktik 4 sampai Praktik 9.

**Robot tidak mengerti kode.** Ia menjalankan perintah yang sama dengan yang kamu ketik di terminal, lalu **membaca kode keluarnya**: `0` = centang hijau, selain itu silang merah. Itu bahasa yang kamu pelajari di [🔁 Langkah 3](#langkah-3--bahasa-robot-kode-keluar-0-dan-1-dari-npm-test) dan kamu lihat di [KC Langkah 4](#langkah-4--ubah-satu-expect-silang-merah-dan-kode-keluar-1-di-log-4-menit): satu `expect` yang salah membuat `npm test` keluar dengan kode `1`. Lipatan *Bruno CLI: semua tes dengan satu perintah* di [🔬 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#-bedah-teknis-opsional) sudah menjanjikannya: kode keluar `1` seperti itulah yang membuat pemeriksaan otomatis menolak *pull request*. Robot tidak membaca isi pesan galatnya; kamulah yang membacanya di log.

**Lima kata robot.** Rangkaian pemeriksaan dari *pull request* sampai produksi disebut *pipeline*, **jalur perakitan**. Lima kata di bawah dipakai di seluruh modul:

| Kata | Artinya | Di proyekmu |
| :-- | :-- | :-- |
| *workflow* | satu berkas YAML di folder `.github/workflows/`, dibaca GitHub sendiri | `ci.yml`, bernama `ci` (`halo.yml` Kemenangan Cepat hanya di cabang `coba/robot`) |
| *event* (pemicu) | kejadian yang menyalakan *workflow* | `pull_request` ke `main` (PR dibuka, mendapat *commit* baru, atau dibuka lagi) dan `push` ke `main` (termasuk PR yang di-*merge*) |
| *job* (pos) | sekumpulan langkah di satu mesin; *job* berbeda = mesin berbeda, berjalan bersamaan kecuali disuruh menunggu | `periksa`, `uji`, `bangun`, `staging`, `tandai-rilis`, `pasang-vps` |
| *step* (langkah) | perintah terminal (`run:`, boleh beberapa baris) atau satu *action* siap pakai (`uses:`); langkah merah = langkah sesudahnya di pos itu dilewati (kecuali langkah khusus saat gagal) | `npm test`, `actions/checkout@v7` |
| *runner* (mesin sewaan) | komputer GitHub yang menjalankan satu *job*: baru setiap kali, dihapus sesudahnya | `ubuntu-24.04` (prosesor x64; untuk repo publik 4 CPU dan 16 GB RAM, menurut dokumen GitHub) |

*Runner* juga bisa komputermu sendiri (*self-hosted*), tetapi untuk repo publik itu berbahaya: [🔬](#-bedah-teknis-opsional) *Runner sendiri di Pi (self-hosted): kenapa berbahaya untuk repo publik*.

**Langkah siap pakai dan wadah Node.** Langkah `uses:` memanggil *action*, program kecil siap pakai: `actions/checkout@v7` menyalin repo ke mesin robot, `actions/cache@v6` menyimpan unduhan npm. Proyek ini hanya memakai *action* dari penerbit resminya (`actions/*` dan `docker/*`) dengan *tag* mayor seperti `@v7` (Konsep 6). *Job* `periksa` dan `uji` berjalan di dalam **wadah** (kontainer, *container*) `node:24.22.1-alpine3.24`, Node yang sama persis dengan `Dockerfile` backend dan dashboard (Konsep 4). Database uji untuk *job* `uji` adalah *service container* bernama `db`: kontainer pendamping yang dinyalakan robot sebelum langkah pertama dan dibuang bersama mesinnya. Dari dalam wadah *job*, alamatnya cukup nama layanannya, `db`, persis seperti di Docker Compose.

**YAML: spasi di depan baris = makna.** Berkas robot ditulis dalam YAML. Potongan awal `ci.yml` ini cukup dibaca dulu; tahap pertamanya kamu tempel di [4.1](#41--githubworkflowsciyml-tahap-a-job-periksa-dan-uji-15-menit):

```yaml
name: ci

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
# …
jobs:
  periksa:
    name: periksa
    runs-on: ubuntu-24.04                        # ditulis persis (bukan ubuntu-latest): tidak berubah diam-diam
    container: node:24.22.1-alpine3.24           # Node yang SAMA dengan Dockerfile backend dan dashboard
    timeout-minutes: 15                          # bawaan GitHub 360 menit: job yang macet dihentikan jauh lebih cepat
    steps:
      - run: apk add --no-cache git tar
      - uses: actions/checkout@v7
      # …
```

Cara membacanya: `nama: nilai` adalah satu setelan, dan baris yang masuk **dua spasi** lebih dalam adalah milik baris di atasnya. `pull_request:` dan `push:` sejajar karena keduanya anak `on:`, dan setiap `branches: [main]` milik pemicu tepat di atasnya. `jobs:` berisi pos-pos, `periksa:` adalah satu pos, dan `steps:` adalah daftar langkahnya, setiap langkah diawali `-`; `run: |` = perintahnya beberapa baris di bawahnya (bukan pipa). Teks sesudah `#` adalah komentar; komentar berbahasa Indonesia di `ci.yml` adalah bagian pelajaran, jadi bacalah. Tab dilarang di YAML: pakai spasi. Satu spasi yang bergeser bisa mengubah arti setelan atau membuat berkasnya tidak sah.

**Kapan robot berjalan.** Robot berjalan saat perubahan **dikirim ke GitHub** (*push*) atau diajukan lewat *pull request*: *push* ke `main` atau ke cabang PR menyalakan satu *run* baru (satu putaran kerja robot). Robot tidak berjalan saat kamu menyimpan berkas di VS Code, atau saat kamu membuat *commit* yang belum di-*push*; [glosarium Silabus](../../SILABUS.md#12-glosarium-mini-istilah-yang-muncul-di-silabus-ini) (v1.0.31) mencatat pengertian ini.

**Log publik.** Di repo publik, siapa pun bisa membuka tab **Actions** dan membaca log robotmu, termasuk setiap baris yang dicetak perintahmu. Karena itu, rahasia tidak pernah dicetak (`echo`, `set -x`), dan nilainya hanya disimpan di **Secrets**, yang tampil sebagai `***` di log (Konsep 6).

**Biaya.** Untuk repo publik, robot gratis: dokumen penagihan GitHub (dibaca 31 Oktober 2026) menulis "The use of standard GitHub-hosted runners is free: In public repositories". Repo privat di akun gratis mendapat kuota bulanan senilai $12, setara 2.000 menit Linux x64, dan setiap *run* memotongnya. [Silabus §5.5](../../SILABUS.md#55-biaya-layanan-fase-5) juga mencatat GitHub Actions dan Container Registry gratis untuk repo publik.

**Angka di modul ini.** Penulis tidak punya akun GitHub. Berkas `ci.yml` yang sama dijalankan apa adanya oleh **robot tiruan** di satu Raspberry Pi 5 (caranya di [🔬](#-bedah-teknis-opsional) *Bagaimana penulis menguji …*), jadi setiap angka waktu robot di modul ini adalah angka robot tiruan dengan *image* lokal, bukan angka GitHub. Berapa lama robot GitHub bekerja untuk repomu belum diukur penulis.

Peta di bawah adalah seluruh jalur perakitan yang kamu bangun sampai Praktik 9: pita atas berjalan di setiap *pull request*, pita bawah di setiap *push* ke `main`. Kembalilah ke peta ini setiap kali sebuah pos baru ditambahkan.

![Diagram peta pipeline dari pull request sampai VPS dan Pi (Konsep 3, dipakai lagi di Konsep 4, 6, dan 9): jalur perakitan .github/workflows/ci.yml, enam pos (job); pos merah = pos sesudahnya dilewati. Pita 1, setiap pull request ke main (tanpa rahasia, kirim, atau pasang): bersamaan periksa (kontainer Node: satpam versi, firmware, cek tipe, lint, tes frontend, cek-skema, build, audit) dan uji (database uji, 203 + 20 = 223 tes); lalu bangun (needs keduanya: image backend + web, amd64 + arm64, tidak dikirim); lalu aturan cabang = palang di depan main (Konsep 11), terangkat bila tiga check hijau: ada yang merah = tombol Merge pull request terkunci, juga untuk pemilik repo, PR berhenti di sini; semua hijau = tombol terbuka (Create a merge commit, Modul 16). Merge = push ke main: robot berjalan lagi; rilis baru sampai ke VPS (didorong) dan Pi (menarik sendiri). Pita 2, setiap push ke main (rahasia dan izin menulis hanya di sini): periksa ∥ uji lagi; bangun lalu kirim ke GHCR (tag versi dan sha 7 huruf; versi yang sudah ada tidak dikirim); staging, versi baru saja: gladi resik di mesin robot, Compose sama, image baru, rahasia acak, database kosong, pull, up --wait, uji asap, dibuang; tandai-rilis: tag beranotasi (misalnya v2.0.1) = rilis ini boleh dipasang, isinya catatan versi itu dari CHANGELOG.md; pasang-vps, bila Variables VPS_HOST diisi: SSH dengan kunci robot, VPS menjalankan skrip/pasang.sh, laporan harus menyebut versi itu terpasang. GHCR (toko image): paket publik, staging menarik dari sana; Pi gerbang tidak dihubungi robot: jam weker tiap 15 menit (Konsep 8), Pi bertanya sendiri ada tag baru; VPS pusat didorong robot lewat SSH: pasang.sh menarik image, up --no-build, uji asap. Push tanpa versi baru (misalnya hanya dokumen): periksa, uji, bangun jalan (rilis-baru = tidak, tanpa image); staging, tag, pemasangan dilewati (if), bukan kegagalan. Izin token per job (Konsep 6): bawaan contents: read; bangun + packages: write; staging + packages: read; tandai-rilis contents: write (satu-satunya yang menulis); pasang-vps tanpa token. Contoh robot tiruan penulis (ci.yml apa adanya di forge Gitea + Gitea Runner + Docker-in-Docker, Raspberry Pi 5 arm64, toko image lokal; bukan GitHub): periksa ±110–135 detik ∥ uji ±75–105, bangun ±95–125, staging ±50–75, tandai-rilis ±3–5, pasang-vps ±30 detik; merge sampai VPS tiruan terpasang ±5–6½ menit; rilis yang staging-nya merah tidak pernah bertanda; di GitHub staging juga menarik ±1,1 GB image, belum diukur.](aset/peta-pipeline.png)

### 4. *Lint* → *test* → *build*: gagal cepat

Urutan di Silabus, *lint* → *test* → *build image* → *push* ke GHCR → *deploy*, punya satu alasan: **gagal cepat**. Pemeriksaan yang murah dijalankan lebih dulu, yang mahal belakangan, dan jalur perakitan berhenti di pos pertama yang merah. Jawaban "merah" datang secepat mungkin, dan robot tidak membuang waktu membangun atau mengirim *image* dari kode yang sudah pasti salah.

**Antarpos: `needs`.** `periksa` dan `uji` tidak saling membutuhkan, jadi keduanya berjalan bersamaan di dua mesin. *Job* `bangun` menulis `needs: [periksa, uji]`: ia baru mulai kalau keduanya hijau. Bila *job* yang ditunggu merah atau dilewati, *job* yang menunggunya ikut dilewati (abu-abu). Jadi, satu tes merah di `uji` menghentikan seluruh jalur: tanpa *image*, *staging*, *tag*, atau pemasangan (peta di [Konsep 3](#3-ci-robot-yang-membaca-kode-keluar)).

**Di dalam pos: yang murah dulu.** Sesudah tiga langkah persiapan (`apk add`, menyalin repo, dan `safe.directory`), *job* `periksa` menjalankan langkah-langkah ini, berurutan:

| Langkah (nama persis di `ci.yml`) | Yang diperiksa |
| :-- | :-- |
| `versi - satu nomor di semua tempat; yang dipasang berubah = versi naik` (mulai [6.6](#66--tahap-b1-langkah-versi-di-job-periksa-2-menit)) | satpam versi: satu nomor di semua tempat, naik bila yang dipasang ke VPS dan Pi berubah (Konsep 10) |
| `firmware - sakelar uji Modul 28 mati, tanpa .bin, build/, atau kunci.h di Git` | sakelar `UJI_KUNCI_SALAH` bernilai `0`; tidak ada berkas firmware atau kunci di Git |
| `simpanan npm (unduhan library dipakai ulang selama package-lock.json sama)` | (menyiapkan unduhan npm) |
| `backend - cek tipe, lint, audit` | `npm ci` → `npm run cek` → `npm run lint` → audit |
| `frontend - lint, tes, cek skema, build, audit` | `npm ci` → *lint* → 5 tes → `cek-skema` → *build* → audit |

Dua langkah pertama hanya membaca berkas, jadi selesai dalam hitungan detik, sebelum ratusan paket npm diunduh. Di dalam satu langkah, baris-baris `run:` dijalankan berurutan dan berhenti di baris pertama yang gagal: tipe yang salah menghentikan langkah backend sebelum *lint* dan audit.

**`npm ci` di wadah produksi.** Robot memasang library dengan `npm ci`, bukan `npm install`: `npm ci` memasang persis versi di `package-lock.json` (seperti di Dockerfile [Modul 26](../modul-26-docker-compose/README.md#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy)), berhenti bila `package.json` tidak cocok dengannya, dan tidak pernah menulis ulang keduanya. Wadahnya `node:24.22.1-alpine3.24`, jadi tes berjalan di Node dan Alpine yang sama dengan backend di VPS dan Pi. Simpanan npm (`actions/cache@v6`) menyimpan folder unduhan `~/.npm`, bukan `node_modules`, dengan kunci simpanan (`key:`) dari sidik `package-lock.json`; `npm ci` tetap memeriksa sidik setiap paket. Langkah pertama `apk add --no-cache git tar` memasang `git` (menyalin repo, satpam versi) dan `tar` lengkap karena `tar` bawaan Alpine tidak mengenal pilihan yang dipakai *action* simpanan itu ([🚨](#-kalau-tidak-jalan) *Kontainer Alpine di robot …*).

**Tiga pemeriksa, tiga pertanyaan.** `npm run cek` (`tsc --noEmit`) bertanya: tipe datanya cocok? `npm test` bertanya: perilakunya benar? *Lint* adalah **pemeriksa ejaan kode**: ia membaca kode tanpa menjalankannya dan mencari pola yang hampir selalu salah, misalnya `debugger;` yang tertinggal atau perbandingan dua nilai tetap. Backend belum pernah punya *lint*: ESLint tidak bisa dipasang karena `typescript-eslint` belum menerima TypeScript 7 (lipatan *ESLint dan Prettier …* di [🔬 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#-bedah-teknis-opsional); jangan dipaksa dengan `--force` atau `--legacy-peer-deps`). Jalan keluarnya oxlint 1.89.0, versi yang sama dengan frontend. Aturannya hampir semua bertingkat peringatan, dan peringatan saja tidak mengubah kode keluar, jadi tanpa `--deny-warnings` *lint* hampir selalu hijau (lab penulis). Dengan `--deny-warnings` di skrip `lint` kedua folder, satu peringatan = kode keluar `1` = robot merah. Saat pertama dipasang di backend, oxlint menemukan tepat satu: `Found 1 warning and 0 errors.` ([2.1](#21--lint-backend-dengan-oxlint-1890-oxlintrcjson---deny-warnings-dan-satu-temuan-8-menit)).

**Skema dan audit.** `npm run cek-skema` membandingkan salinan skema di `frontend/src/skema/` dengan aslinya di folder `backend` (Modul 24), jadi robot memegang seluruh repo. `npm audit --omit=dev --audit-level=high` merah hanya untuk celah *high* atau *critical* di library yang ikut ke produksi. Per 4 November 2026, backend tetap menulis `4 moderate severity vulnerabilities` dengan kode keluar `0`, dan frontend `found 0 vulnerabilities`. `npm audit` polos sudah berkode keluar `1` di kedua folder sejak hari pertama, dan robot yang selalu merah mengajari orang mengabaikan warna merah; laporan lengkapnya tetap dibaca manusia lewat butir templat PR, melanjutkan kebiasaan [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos) ([2.5](#25-npm-audit-seperti-robot-merah-hanya-untuk-celah-tinggi-lalu-commit-3-menit)). Celah baru bisa diumumkan kapan saja, jadi robot bisa merah tanpa satu baris kodemu berubah.

**Firmware: alarm yang terlambat.** Berkas `.bin`, folder `build/`, dan `kunci.h` bisa berisi kunci ESP-NOW. Robot memang merah bila salah satunya ikut Git, tetapi begitu kunci ter-*push* ke repo publik, siapa pun mungkin sudah membacanya: kuncinya wajib diganti, tidak cukup dihapus dari Git.

**Hijau palsu dilarang.** Centang hijau yang tidak benar-benar menguji disebut **hijau palsu**: `continue-on-error: true` (langkah boleh gagal tanpa membuat pos merah), `if: false` (langkah tidak pernah jalan), `.skip` atau `.only` di tes, atau menghapus tes yang merah. Robot menjaga satu jebakan sendiri: bila keluaran `npm test` di *job* `uji` memuat kata `skipped`, langkahnya berhenti dengan `GAGAL  ada tes yang dilewati (skipped): di robot semua tes wajib jalan, juga 20 integration test`. Sisanya dijaga manusia: PR yang mengubah `.github/workflows/` dibaca di tab **Files changed** (Konsep 11). Kamu membuat robot merah dengan sengaja di [4.4](#44--l0-sengaja-merah-sekali-lalu-semua-hijau-8-menit).

**Pagar waktu dan nama mesin.** `timeout-minutes: 15` memotong batas bawaan GitHub (360 menit), jadi *job* yang macet dihentikan jauh lebih cepat. `runs-on: ubuntu-24.04` ditulis persis: menurut README *image* *runner* GitHub (dibaca 4 November 2026), `ubuntu-latest` diumumkan pindah ke Ubuntu 26.04 pada November 2026. Pelajarannya sama dengan *tag* persis tanpa `latest` di Modul 26: yang tidak ditulis persis bisa berganti diam-diam. Obat untuk setiap langkah yang merah ada di [🚨](#-kalau-tidak-jalan), kelompok **Robot merah di `periksa`** dan **Robot merah di `uji`**.

> ⬆️ **Sudah membaca Konsep 1–4?** Lanjut ke [Praktik 1](#praktik-1--meja-kerja-cabang-repo-publik-dan-cadangan-10-menit) sampai [Praktik 4](#praktik-4--robot-pemeriksa-di-setiap-pull-request-40-menit): meja kerja, *lint* dan uji frontend, database uji, lalu robot pemeriksa di *pull request* pertama. [Konsep 11](#11-aturan-cabang-palang-di-depan-main) baru dibutuhkan sebelum [Praktik 5](#praktik-5--aturan-cabang-pr-merah-tidak-bisa-di-merge-20-menit).

### 5. Satu *image* untuk dua prosesor: dibuat robot tanpa emulasi

Di [🔁 Langkah 4](#langkah-4--prosesor-laptop-vps-dan-pi-docker-version-dan-docker-buildx-ls), kamu melihat VPS dan Pi berbeda prosesor: VPS **amd64** (Intel atau AMD), Pi **arm64**. *Image* buatan sendiri hanya berisi program untuk prosesor mesin yang membangunnya ([Konsep 11 Modul 26](../modul-26-docker-compose/README.md#11-toko-image-ghcr-dan-arsitektur)), jadi VPS ([7.4 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#74-docker-compose-build-di-vps-sebelum-layanan-lain-menyala-12-menit)) dan Pi jalur gratis ([11.3 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#113-dua-lemari-external-dan-docker-compose-build-di-pi-12-menit)) membangun *image*-nya masing-masing: lama, butuh unduhan npm di setiap mesin, dan VPS 2 GB diberi *swap* sebagai cadangan *build*. Mulai minggu ini robot membangunnya **sekali** untuk dua prosesor, lalu VPS dan Pi hanya menarik.

**Satu nama, satu daftar isi.** Cetakan resmi seperti `node` dan `caddy` sudah lama begini ([Konsep 2 Modul 26](../modul-26-docker-compose/README.md#2-cetakan-berlapis-image-tag-digest-dan-arsitektur)): satu nama + *tag*, misalnya `ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0`, menunjuk **indeks multi-arsitektur**, yaitu daftar isi berisi satu cetakan amd64 dan satu cetakan arm64. `docker compose pull` di VPS mengambil yang amd64, di Pi yang arm64, tanpa perintah tambahan. [Silabus](../../SILABUS.md#modul-26--docker--docker-compose-satu-perintah-untuk-semua-layanan) menjanjikan pembahasan tuntasnya di modul ini.

**Tiga cara membuat cetakan untuk prosesor lain:**

| Cara | Yang terjadi | Harganya |
| :-- | :-- | :-- |
| *Runner* ARM64 asli (`ubuntu-24.04-arm`) | dua mesin sewaan, masing-masing membangun untuk prosesornya sendiri, lalu kedua hasil digabung menjadi satu indeks | gratis untuk repo publik, memotong kuota bulanan repo privat; dua *job* ditambah langkah penggabung |
| **Emulasi** QEMU | satu mesin berpura-pura menjadi prosesor lain setiap kali menjalankan `RUN` | menurut dokumen Docker, bisa jauh lebih lambat daripada membangun di prosesor aslinya; di Linux, emulatornya biasanya didaftarkan ke sistem (mengubah setelan mesin) |
| ***Cross-build*** `$BUILDPLATFORM` (**kita**) | semua `RUN` berjalan di prosesor pembangun; tahap akhir per prosesor hanya menyalin | beberapa baris `Dockerfile` berubah; tanpa emulator di mana pun |

Bayangkan dapur restoran. Masakannya (berkas JavaScript di `node_modules` dan folder `dist/`) sama untuk semua tamu, jadi cukup dimasak sekali di **dapur** milik prosesor pembangun; yang dipilih sesuai prosesor tamu hanya **piring saji**, yaitu tahap akhir `Dockerfile`. Di kedua `Dockerfile`, tahap pertama kini diawali `FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24` (backend `AS paket`, web `AS bangun`). BuildKit (mesin pembangun di balik `docker build`) mengisi `$BUILDPLATFORM` dengan prosesor mesin yang membangun, di robot GitHub `linux/amd64`. Tahap akhir (Node untuk backend, Caddy untuk web) diambil dalam varian prosesor sasaran, tanpa satu `RUN` pun: hanya `COPY` dan setelan. Backend dulu masih punya `RUN mkdir … && chown …` di tahap akhir; kini `mkdir` berjalan di tahap `paket`, dan `chown` diganti `COPY --from=paket --chown=node:node` ([7.1](#71--dua-dockerfile-lintas-prosesor-dengan-buildplatform-8-menit)). Tanpa `RUN` di tahap akhir, tidak ada program prosesor lain yang perlu dijalankan, jadi tidak perlu emulator.

**Kenapa aman.** Hasil *build* web (HTML, CSS, JavaScript) memang sama untuk semua prosesor. Library produksi backend juga JavaScript biasa, kecuali **bcrypt** (sidik jari sandi, Modul 20), yang membawa **program jadi** untuk Alpine di prosesor x64 (nama lain amd64) **dan** arm64, lalu memilih yang cocok saat server menyala. Penulis memeriksanya di Pi 5 (arm64): `npm ci --omit=dev` yang dipaksa memilih paket seolah-olah di mesin x64 menghasilkan `node_modules` yang sama persis dengan hasil `npm ci` biasa di Pi itu (6.201 berkas, beda 0), dan *image* amd64 buatan robot tiruan berisi program `node` untuk amd64 serta bcrypt versi x64.

![Diagram satu image untuk dua prosesor (Konsep 5): tahap Node berjalan di prosesor pembangun ($BUILDPLATFORM), tahap akhir hanya menyalin, tanpa emulasi. 1, dapur di prosesor pembangun, sekali saja: mesin sewaan robot ubuntu-24.04 (amd64), $BUILDPLATFORM = linux/amd64. Backend, tahap paket: FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS paket, …, RUN npm ci --omit=dev, RUN mkdir -p /app/data-firmware. Web, tahap bangun: FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS bangun, …, RUN npm ci, COPY . ., ARG VITE_API_BASE=/api, RUN npm run build. Semua RUN (menjalankan program) ada di sini; hasilnya, node_modules dan folder dist/, sama untuk semua prosesor. Panah disalin ke 2, piring saji per prosesor sasaran, hanya COPY: linux/amd64 (VPS, kebanyakan laptop) dan linux/arm64 (Pi, Mac Apple silicon), masing-masing backend FROM node:24.22.1-alpine3.24, COPY --from=paket (2×), 3 × COPY + USER node, dan web FROM caddy:2.11.7-alpine, COPY --from=bangun; tanpa RUN, tanpa emulator; image dasar (node, caddy) diambil dalam varian prosesor sasaran. Panah dikirim ke toko image: job bangun, platforms: linux/amd64,linux/arm64, saat push ke main. 3, GHCR: satu nama, satu indeks, ukuran terkompres di lab tiruan: ghcr.io/akun/rumah-pintar-mini-backend:2.0.0 amd64 72,2 MB, arm64 72,0 MB; rumah-pintar-mini-web:2.0.0 amd64 25,2 MB, arm64 24,0 MB; tag 2.0.0 dan sha 7 huruf menunjuk indeks yang sama; indeks juga memuat 2 catatan asal-usul (attestation, unknown/unknown), bukan image ketiga. Panah ditarik ke 4, docker compose pull memilih varian sendiri: VPS (pusat) amd64; Pi jalur gratis (pusat di Pi) arm64; laptop teman amd64 atau arm64; staging di mesin robot amd64; Pi jalur utama = gerbang: image resmi Mosquitto, dua prosesor dari penerbitnya. Bawah: bcrypt (sandi, Modul 20) adalah satu-satunya paket yang bukan JavaScript biasa: bcrypt@6.0.0 membawa versi siap pakai linux-x64 dan linux-arm64 (musl, untuk Alpine), dipilih saat berjalan; lab penulis: di Pi arm64, npm ci dengan --cpu=x64 (seolah di mesin x64) = berkas yang sama dengan npm ci biasa (6.201 berkas, beda 0). Cara lain (Bedah Teknis): runner ARM asli (ubuntu-24.04-arm), indeks digabung; emulasi QEMU, jauh lebih lambat. Contoh robot tiruan penulis: di Pi 5 (arm64) membangun amd64 + arm64 tanpa emulasi; image arm64 berjalan di staging dan VPS tiruan; isi image amd64 diperiksa, belum dijalankan.](aset/satu-image-dua-prosesor.png)

**Bukti di toko.** `docker buildx imagetools inspect ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0` ([9.7](#97--paket-ghcr-menjadi-publik-tarik-tanpa-login-dua-prosesor-4-menit)) mendaftar `linux/amd64`, `linux/arm64`, dan dua baris `unknown/unknown` bertanda `attestation-manifest`. Dua baris terakhir itu **catatan asal-usul *build***, bukan *image* ketiga. Contoh ukuran terkompres di lab penulis (toko *image* lokal pengganti GHCR): backend 72,17 MB (amd64) / 71,95 MB (arm64), web 25,24 / 24,00 MB. Di log *job* `bangun`, setiap `RUN` hanya muncul untuk prosesor pembangun, sedangkan `COPY` tahap akhir muncul dua kali, `[linux/amd64 stage-1 …]` dan `[linux/arm64 stage-1 …]` ([7.4](#74--commit-push-dan-buka-pr-b-bangun-membangun-tanpa-mengirim-7-menit)).

**Dua jebakan.** (1) `Dockerfile` lama (tanpa `$BUILDPLATFORM`) dibangun dengan `--platform linux/amd64` oleh pembangun tanpa emulator, misalnya Docker Engine di Pi: BuildKit mencoba **menjalankan** `npm ci` milik prosesor lain dan berhenti dengan `exec /bin/sh: exec format error` (lab penulis, `Dockerfile` Modul 28 di Pi 5). (2) Pembangun yang membawa emulator tidak gagal, tetapi diam-diam meniru prosesor lain: lambat, dan kamu tidak sadar. Docker Desktop membawanya, dan menurut riset penulis 31 Okt, pembangun yang dinyalakan `docker/setup-buildx-action` juga membawa emulatornya sendiri, jadi `Dockerfile` lama kemungkinan tidak gagal di robot GitHub, hanya lambat (belum dicoba penulis di GitHub). Ketiga cara dibandingkan di [🔬](#-bedah-teknis-opsional) lipatan *Tiga cara dua prosesor …*; obatnya di [🚨](#-kalau-tidak-jalan) *`exec format error`, atau job `bangun` lambat sekali*.

**Jujur.** *Image* amd64 belum pernah **dijalankan** penulis, sama dengan [🔬 Modul 26](../modul-26-docker-compose/README.md#-bedah-teknis-opsional) (lipatan *Satu image untuk dua arsitektur …*): tidak ada mesin amd64 di lab, dan emulasi tidak dipakai. Isinya diperiksa, dan varian arm64 dijalankan di *staging*, "VPS", dan "Pi" tiruan. Di GitHub, mesin robot amd64, jadi *staging* ([Konsep 9](#9-staging-vs-produksi-gladi-resik-vs-pentas)) menyalakan varian amd64 sebelum VPS-mu; varian arm64 pertama kali menyala di Pi jalur gratis, dan uji asap `skrip/pasang.sh` di sana yang memeriksanya. Silabus (v1.0.31) mencatat cara ini di bagian Modul 29: dibangun tanpa emulasi di satu *runner*, dengan *runner* ARM64 asli dan QEMU sebagai pembanding, dan QEMU tidak wajib.

### 6. Toko *image* dan izin robot: `GITHUB_TOKEN`, `permissions`, Secrets, dan Variables

Di [Praktik 10 Modul 26](../modul-26-docker-compose/README.md#praktik-10--toko-image-ghcr-manual-35-menit), kamu mengirim *image* ke GHCR dengan tangan, memakai PAT *classic* milikmu yang tersimpan di laptop. Robot tidak memakai token pribadimu. Untuk setiap *job*, GitHub membuat **token sementara robot** sendiri, bernama **`GITHUB_TOKEN`** ([Silabus](../../SILABUS.md#modul-26--docker--docker-compose-satu-perintah-untuk-semua-layanan) menjanjikan GHCR otomatis di modul ini). Yang boleh dilakukan token itu ditulis di `ci.yml`, di bagian `permissions`, dan menurut dokumen GitHub, izin yang tidak disebut berarti tidak ada. Prinsipnya: **izin sekecil mungkin, per *job***.

| *Job* | Izin token robot | Untuk apa |
| :-- | :-- | :-- |
| bawaan (kepala `ci.yml`): `periksa`, `uji` | `contents: read` | membaca isi repo; *job* yang menulis `permissions` sendiri hanya memakai daftarnya |
| `bangun` | `contents: read`, `packages: write` | mengirim *image* ke GHCR |
| `staging` | `contents: read`, `packages: read` | menarik *image* yang baru dikirim, juga selagi paketnya masih privat |
| `tandai-rilis` | `contents: write` | satu-satunya *job* yang menulis ke repo: membuat *tag* rilis |
| `pasang-vps` | `{}` | tidak butuh token GitHub sama sekali |

Letak setiap *job* di jalur perakitan ada di gambar [Konsep 3](#3-ci-robot-yang-membaca-kode-keluar).

**Dua nama untuk satu cetakan.** Setiap kiriman `bangun` ([7.3](#73--tahap-b2-job-bangun-untuk-linuxamd64-dan-linuxarm64-8-menit)) mendapat dua *tag* yang menunjuk indeks yang sama: nomor versi (`2.0.0`, yang ditulis di `compose.cloud.yml`) dan `sha-<7 huruf>`, tujuh huruf pertama *commit* yang membangunnya (jejak "cetakan ini dari *commit* mana"). Nama tokonya `ghcr.io/${GITHUB_REPOSITORY_OWNER,,}`: tanda `,,` mengubah nama akunmu menjadi huruf kecil, karena GHCR menolak huruf besar (Modul 26: akun `Budi-Santoso` ditulis `ghcr.io/budi-santoso`). Sebelum membangun, langkah `sudah ada di toko? (tag versi tidak pernah ditimpa)` memeriksa apakah versi itu sudah ada di toko; kalau sudah, tidak ada yang dibangun atau dikirim ulang. Isi di balik `2.0.0` tidak pernah berganti, sesuai aturan "*tag* persis" Modul 26.

**Dari *pull request*, tidak ada yang dikirim.** Di PR, `bangun` hanya mencoba membangun: kodenya belum di-*merge*, dan karena *tag* versi di toko tidak pernah ditimpa, kiriman dari PR akan mengunci nomor versi itu dengan isi yang belum final. Menurut dokumen GitHub, PR dari *fork* (salinan repo milik orang lain) hanya mendapat token baca, dan **Secrets** tidak dikirim ke sana: orang asing yang membuka PR tidak bisa menulis ke paketmu atau membaca rahasiamu. Pemicu lain, `pull_request_target`, menjalankan *workflow* dengan hak repomu untuk PR siapa pun, dan dokumen GitHub memperingatkan bahwa kode yang tidak tepercaya di pemicu itu bisa membuka celah keamanan. `ci.yml` tidak memakainya; kamu juga jangan.

**Privat dulu, publik selamanya** ([Konsep 11 Modul 26](../modul-26-docker-compose/README.md#11-toko-image-ghcr-dan-arsitektur)). Paket GHCR baru bisa privat walaupun repomu publik (dokumen GitHub tidak seragam: bawaannya privat, tetapi paket buatan `GITHUB_TOKEN` disebut mewarisi visibilitas repo; belum diuji penulis); karena itu `staging` masuk ke GHCR dengan izin `packages: read`. VPS dan Pi menarik **tanpa *login***, jadi paket yang masih privat kamu jadikan publik sekali dengan tangan: **Package settings** → **Change visibility** ([9.7](#97--paket-ghcr-menjadi-publik-tarik-tanpa-login-dua-prosesor-4-menit)). Langkah ini satu arah: paket publik tidak bisa diprivatkan lagi. Isinya hanya berkas repo publikmu ditambah library npm, karena rahasia tidak pernah masuk Git (Modul 20 dan 26); bila ragu, periksa dulu dengan `docker history --no-trunc`.

**Label `source` menautkan paket ke repo.** Robot menempelkan label `org.opencontainers.image.source` berisi alamat repomu (`labels:` di `ci.yml`, menimpa baris `LABEL … <akun>` di `Dockerfile`). Menurut dokumen GitHub, paket yang tertaut mewarisi izin akses repo-nya (tidak visibilitasnya), jadi *workflow* repo itu boleh menulis ke sana. Paket yang dulu kamu kirim dengan tangan di Modul 26 tanpa tertaut bisa menolak robot dengan `denied` ([🚨](#-kalau-tidak-jalan) *Kirim ke GHCR ditolak …*; belum dicoba penulis di GHCR sungguhan).

**Secrets lawan Variables.** Di **Settings** → **Secrets and variables** → **Actions** ada dua laci ([10.6](#106--secrets-dan-variables-di-github-vps_kunci_ssh-vps_host-dan-vps_known_hosts-8-menit)). **Secrets** untuk rahasia: isinya disamarkan menjadi `***` di log. **Variables** untuk setelan yang bukan rahasia: isinya terbaca di log. Selain `GITHUB_TOKEN` yang dibuat GitHub sendiri, robot kita hanya butuh satu rahasia, `VPS_KUNCI_SSH` (kunci robot, Konsep 7). `VPS_HOST`, `VPS_USER`, dan `VPS_KNOWN_HOSTS` cukup **Variables**: alamat VPS memang publik lewat DNS, dan sidik kunci host bukan rahasia. Repo publik berarti log robot bisa dibaca siapa pun, jadi jangan pernah mencetak rahasia dengan `echo` atau menyalakan `set -x` di langkah yang memegang rahasia ([Konsep 11 Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#11-rahasia-dan-privasi-yang-tidak-boleh-bocor)).

***Tag* mayor lawan *pin* SHA.** `uses: actions/checkout@v7` memakai *tag* mayor `v7`, yang mengikuti rilis v7 terbaru penerbitnya. Dokumen GitHub menyarankan mengunci (*pin*) *action* ke SHA *commit* penuhnya, yang tidak bisa dipindah. Kurikulum memilih *tag* mayor, hanya dari penerbit resmi (`actions/…` dan `docker/…`), supaya terbaca pemula; harga pilihan itu dan cara *pin* ada di [🔬](#-bedah-teknis-opsional) lipatan *Pin SHA, Dependabot, dan `actions.lock` …*.

> ⬆️ **Sudah membaca Konsep 5–6?** Lanjut ke [Praktik 7](#praktik-7--satu-image-dua-prosesor-dikirim-robot-ke-ghcr-35-menit): satu *image* untuk dua prosesor, dikirim robot ke GHCR. Belum mengerjakan [Praktik 6](#praktik-6--satu-nomor-versi-200-satpam-versi-changelogmd-dan-versi-di-layar-30-menit)? Baca [Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur) dan kerjakan Praktik 6 dulu: *image* 2.0.0 butuh nomor versinya.

### 7. Dorong vs tarik: robot mengetuk VPS, Pi bertanya sendiri

Sesudah robot membuat *tag* rilis, dua mesin produksi harus tahu ada versi baru. Caranya berbeda, karena letak keduanya berbeda ([Konsep 1 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#1-dari-rumah-ke-internet-tiga-pintu-dua-jalur)):

- **VPS punya alamat publik** (`203.0.113.10`) dan pintu SSH 22. Robot bisa **mengetuk**: *job* `pasang-vps` masuk lewat SSH sebagai `rumah` dan menyuruh VPS memasang rilis itu. Inilah **dorong**.
- **Pi tinggal di balik router rumah**, tanpa *port forwarding*. Tidak ada yang bisa mengetuknya dari internet, termasuk GitHub. Jadi **Pi bertanya sendiri** setiap 15 menit lewat jam weker ([Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)): `git fetch --tags` ke GitHub, lalu, hanya bila ada rilis baru, `docker compose pull` (*image* resmi Mosquitto; di jalur gratis juga backend dan web dari GHCR). Keduanya sambungan **keluar**, seperti jembatan dan `cloudflared` di Modul 27, dan tanpa akun, karena repo dan paketnya publik. Inilah **tarik**.

[Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) menyebut keduanya di konsep modul ini: *deploy* ke VPS lewat SSH, dan GitHub yang tidak bisa "menghubungi" Pi di rumah.

**Kunci robot: kunci kedua yang hanya membuka satu pintu.** Robot butuh kunci SSH, tetapi **bukan** kunci pribadimu ([Konsep 3 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#3-kunci-ssh-dan-pengguna-biasa-login-sandi-dan-root-dimatikan)). Kamu membuat sepasang kunci ed25519 baru khusus robot ([10.2](#102--kunci-robot-di-laptop-sshrobot_rumah-tanpa-frasa-sandi-5-menit)). Bagian privatnya hanya keluar dari laptopmu ke **Secrets** `VPS_KUNCI_SSH`; bagian publiknya ditulis di `~/.ssh/authorized_keys` milik `rumah`, dengan awalan pembatas ([10.3](#103--baris-kunci-robot-di-authorized_keys-vps-restrict-dan-command-ditulis-sendiri-6-menit)):

```text
restrict,command="sh /home/rumah/rumah-pintar-mini/skrip/pasang.sh" ssh-ed25519 AAAA… robot-pasang
```

- `command="…"`: apa pun perintah yang dikirim lewat kunci ini, yang dijalankan VPS hanya `pasang.sh`.
- `restrict`: tanpa terminal, dan tanpa terowongan (`ssh -L` ditolak).

Kunci ini sengaja tanpa frasa sandi, karena robot tidak bisa mengetik; pelindungnya **Secrets** dan awalan tadi. Baris itu kamu tulis sendiri, sebab `ssh-copy-id` menambahkan kunci **tanpa** awalan, dan kunci tanpa awalan sama kuatnya dengan kunci pribadimu. Di lab penulis (SSH sungguhan ke kontainer pengganti VPS), `whoami` yang dikirim lewat kunci robot dijawab laporan `pasang.sh` (`… v2.0.0 sudah terpasang (pusat): tidak ada rilis baru`), bukan `rumah`, dan `ssh -L` ditolak dengan `administratively prohibited` ([10.4](#104--uji-pembatas-whoami-dijawab-pasangsh-bukan-rumah-4-menit)).

**Penanda: lupa membatasi = merah, bukan hijau palsu.** *Job* `pasang-vps` tidak mengirim perintah sungguhan. Kata terakhir di perintah `ssh`-nya adalah **penanda**, `kunci-robot-belum-dibatasi-command`. Dengan `command=`, VPS mengabaikannya dan menjalankan `pasang.sh`; robot lalu membaca laporannya dan hanya hijau bila laporan itu menyebut versi rilis ini `terpasang` atau `sudah terpasang` ([9.2](#92--tahap-b4-bagian-2-job-pasang-vps-yang-masih-tidur-5-menit)). Tanpa `command=`, VPS mencoba menjalankan kata itu sebagai perintah, dan *job* merah dengan `bash: line 1: kunci-robot-belum-dibatasi-command: command not found` (lab penulis: kode keluar 127; dengan pembatas, 0).

**Sidik VPS dicocokkan manusia.** Robot hanya mau masuk ke mesin yang sidik kuncinya sama dengan **Variables** `VPS_KNOWN_HOSTS`, yaitu baris hasil `ssh-keyscan` yang kamu cocokkan sendiri dengan `ssh-keygen -lf` di VPS ([10.5](#105--sidik-vps-ssh-keyscan-dicocokkan-dengan-ssh-keygen--lf-6-menit)), seperti sapaan SSH pertama di Modul 27. `ci.yml` menulis `StrictHostKeyChecking=yes`. Petunjuk di internet yang memakai `StrictHostKeyChecking=no` membuat robot mau masuk ke mesin mana pun yang mengaku VPS-mu, lalu memercayai laporan palsunya. Sidik yang tidak cocok berakhir dengan `Host key verification failed.` (lab penulis: kode keluar 255).

**Pintu 22 tetap terbuka untuk internet**, seperti aturan ufw Modul 27. Alamat mesin robot GitHub berganti-ganti, dan dokumen GitHub tidak menyarankan memakai daftar alamatnya sebagai daftar izin; awalan `from="…"` (daftar alamat yang boleh memakai kunci) di `authorized_keys` pun tidak praktis. Mengunci pintu 22 ke alamat rumahmu berarti robot tidak bisa masuk ([🚨](#-kalau-tidak-jalan) *`VPS tidak melaporkan v… terpasang`, atau robot tidak bisa masuk ke port 22*). Penjaganya tetap kebiasaan Modul 27: hanya kunci, *login* sandi dan root mati.

**Jujur: grup `docker` setara root.** Dokumen Docker menulisnya terang-terangan: "The `docker` group grants root-level privileges to the user." Pengguna `rumah` anggota grup itu. Kunci robot yang bocor hanya bisa memanggil `pasang.sh`, dan `pasang.sh` hanya memasang rilis yang ditandai robot di `main`, tetapi celah di skrip itu adalah celah dengan hak root. Karena itu skripnya kamu baca utuh di [9.3](#93--pemasang-satu-skrip-skrippasangsh-dan-dua-berkas-unit-7-menit), dan isinya hanya berubah lewat *pull request*.

**Kenapa VPS tidak ikut menarik?** Bisa saja (belum diuji penulis): skripnya sama, tinggal ditambah jam weker di VPS, lalu `VPS_HOST` dikosongkan supaya jam weker dan robot tidak menjalankan `pasang.sh` bersamaan. Dorong dipilih karena Silabus meminta *deploy* lewat SSH, dan karena robot langsung tahu hasilnya: pemasangan yang gagal membuat `pasang-vps` merah di tab **Actions**, lalu diulang dengan **Re-run failed jobs**. Pi yang gagal mengulang sendiri di putaran berikutnya, dan hasilnya kamu baca di jurnalnya ([Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit)). Di jalur gratis, `VPS_HOST` dibiarkan kosong: `pasang-vps` dilewati, dan Pi menarik pusat sekaligus gerbang. Tanpa Pi, yang ada hanya dorong.

Satu kalimat untuk diingat: **tanpa kamu SSH ≠ tanpa SSH**. Robot tetap masuk ke VPS lewat SSH, dengan kunci yang hanya bisa menjalankan satu skrip; yang hilang hanya terminal SSH-mu.

![Diagram dorong ke VPS, tarik dari Pi (Konsep 7): VPS punya alamat publik, robot mengetuk lewat SSH; Pi di balik router rumah, Pi yang bertanya sendiri. Kiri, GitHub (repo publik). Robot, job pasang-vps: Secrets VPS_KUNCI_SSH = kunci robot privat; Variables VPS_HOST, VPS_USER (kosong = rumah), VPS_KNOWN_HOSTS (sidik VPS); ssh -T, BatchMode=yes: tanpa terminal, tanpa sandi; StrictHostKeyChecking=yes: VPS palsu ditolak; kata terakhir = penanda kunci-robot-belum-dibatasi-command; jalan sesudah tandai-rilis membuat tag. Kenapa kunci robot dibatasi: anggota grup docker = setara root; tanpa command= (misalnya ssh-copy-id) kunci ini = kunci rumah; karena penanda, VPS menjawab command not found, job merah. Tag rilis di main: v2.0.0, v2.0.1, … hanya buatan robot, sesudah staging hijau; git fetch tanpa akun. GHCR: image backend + web, paket publik. Panah DORONG (robot yang memulai; tanpa kamu SSH ≠ tanpa SSH) ke VPS: contoh 203.0.113.10, SSH pintu 22 (Modul 27), pengguna rumah; ~/.ssh/authorized_keys, kunci kedua yang hanya membuka satu pintu, satu baris: restrict,command=sh /home/rumah/rumah-pintar-mini/skrip/pasang.sh (dalam tanda petik) ssh-ed25519 AAAA… robot-pasang; command=: apa pun perintahnya, yang jalan hanya pasang.sh; restrict: tanpa terminal, tanpa terowongan (ssh -L ditolak); pasang.sh (pusat): tag terbaru, tarik dari GHCR, up --no-build; laporan harus menyebut versi itu terpasang. Rumah, router tanpa port forwarding: GitHub tidak bisa mengetuk Pi (garis merah bersilang). Pi gerbang (PASANG_BAGIAN=gerbang), jam weker tiap 15 menit (Konsep 8): 1 git fetch --tags; 2 git merge --ff-only, hanya maju; 3 docker compose pull: image resmi Mosquitto; jalur gratis + backend dan web dari GHCR; 4 up -d --no-build --wait, cek Restarting; 5 jurnal: v2.0.0 menjadi v2.0.1 terpasang. Panah TARIK putus-putus (Pi yang memulai): tag baru, image (jalur gratis). Tabel: yang memulai robot vs jam weker; kapan beberapa menit sesudah merge vs tiap 15 menit + acak ≤ 1 menit, paling lambat ±17 menit sesudah tag + tarik image; butuh alamat publik, SSH, kunci terbatas, sidik VPS vs internet keluar saja, repo publik (paket publik: jalur gratis); gagal: job merah, Re-run failed jobs vs putaran berikutnya mengulang. Lab tiruan: SSH sungguhan ke VPS tiruan (kontainer): dengan command= kode 0; tanpa command= command not found, 127; sidik beda: Host key verification failed., 255.](aset/dorong-vs-tarik.png)

### 8. systemd *timer*: jam weker untuk satpam Modul 12

Di [Konsep 7 Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#7-layanan-dan-systemd-satpam-yang-tidak-pernah-tidur), systemd adalah **satpam yang tidak pernah tidur**: menyalakan layanan, membangunkan yang tumbang, dan mencatat semuanya di *journal*. Satpam itu juga punya **jam weker**: unit `.timer`, yang membangunkan sebuah `.service` menurut jadwal. Di [🔁 Langkah 5](#langkah-5--github-dan-pi-repo-publik-paket-ghcr-modul-26-dan-systemctl-list-timers), `systemctl list-timers` sudah memperlihatkan jam weker bawaan sistem. Minggu ini kita menambah satu pasang, di folder `skrip/systemd/`:

- **`rumahpintar-perbarui.service`** = tugasnya. `Type=oneshot` artinya **satpam yang sekali jalan lalu duduk lagi**: ia menjalankan `/bin/sh /home/budi/rumah-pintar-mini/skrip/pasang.sh` sampai selesai, lalu berhenti, tidak seperti Mosquitto yang menyala terus. Ia berjalan sebagai `User=budi` (pengguna biasa anggota grup `docker`, bukan root), dengan `Environment=PASANG_BAGIAN=gerbang` (Pi jalur utama; jalur gratis `Environment="PASANG_BAGIAN=pusat gerbang"`).
- **`rumahpintar-perbarui.timer`** = jadwalnya: `OnBootSec=5min` (5 menit sesudah Pi menyala, saat jaringan dan Docker sudah siap), `OnUnitActiveSec=15min` (15 menit sesudah putaran sebelumnya **dimulai**, juga bila putaran itu gagal), dan `RandomizedDelaySec=60` (tambahan acak 0–60 detik, supaya banyak Pi tidak bertanya ke GitHub dan GHCR pada detik yang sama).

Akibatnya, rilis baru biasanya terpasang di Pi **paling lambat ±17 menit** sesudah robot membuat *tag*-nya (15 menit + acak sampai 1 menit + ketelitian jam weker sampai 1 menit), ditambah lama menarik *image*. Pembanding yang sering kamu temui, `OnCalendar=` (jam dinding, misalnya setiap seperempat jam), bisa ditemani `Persistent=true` untuk mengejar putaran yang terlewat saat Pi mati; menurut dokumen systemd, `Persistent=` hanya berlaku untuk `OnCalendar=`. Jadwal "sesudah menyala, lalu setiap 15 menit" tidak butuh keduanya. Jadwal berikutnya dibaca dengan `systemctl list-timers rumahpintar-perbarui.timer`, catatan setiap putaran dengan `journalctl -u rumahpintar-perbarui.service -n 30` (ingat Modul 12: di Raspberry Pi OS, isi *journal* hilang saat Pi menyala ulang).

**Kenapa Git dulu, baru `docker compose pull`.** [Silabus](../../SILABUS.md#3-pilihan-teknologi--alasannya) menulis pembaruan Pi sebagai *timer* yang menjalankan `docker compose pull && up -d`. Masalahnya, `compose.cloud.yml` dan `edge/compose.edge.yml` menulis *tag* persis, misalnya `…-backend:2.0.0`, tanpa `latest` ([Konsep 2 Modul 26](../modul-26-docker-compose/README.md#2-cetakan-berlapis-image-tag-digest-dan-arsitektur)). `docker compose pull` saja hanya menarik ulang `2.0.0`; ia tidak pernah tahu `2.0.1` ada. Nomor baru itu datang lewat Git, karena `compose.cloud.yml` di rilis 2.0.1 menulis `2.0.1`. Jadi urutannya: ambil **rilis** terbaru dari Git, baru `docker compose pull && up -d`. Silabus (v1.0.31) mencatat bunyi ini: *systemd timer* yang mengambil rilis terbaru dari Git (*tag* `v<versi>`), lalu menjalankan `docker compose pull && up -d`. Kenapa *tag* kanal seperti `:produksi` tidak dipakai ada di [🔬](#-bedah-teknis-opsional) lipatan *Tag kanal `:produksi` lawan tag Git …*.

**Rilis = *tag* `v<versi>` buatan robot.** Robot baru membuat *tag* sesudah *image* versi itu ada di GHCR dan *staging* lulus ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)). VPS dan Pi hanya memasang **rilis bertanda** itu, jadi Pi tidak pernah menunggu *image* yang belum ada, dan tidak pernah memasang *commit* yang belum diuji. Pola lama "ikuti `main`" (`git pull` saja) tidak begitu: di riset penulis 31 Okt (penjadwal tiruan tiap menit), Pi gagal 3–5 putaran berturut-turut sesudah setiap *merge*, karena berkas Compose bertag baru tiba lebih dulu daripada *image*-nya.

**Satu putaran `skrip/pasang.sh`** (skrip yang sama dengan VPS; berkasnya dibaca utuh di [9.3](#93--pemasang-satu-skrip-skrippasangsh-dan-dua-berkas-unit-7-menit)):

1. Berhenti bila dijalankan dengan `sudo` atau sebagai root, bila salinan repo tidak di `main`, atau bila ada berkas yang disunting langsung di mesin itu.
2. `git fetch --tags`, lalu ambil *tag* rilis terbaru yang ada di `main` GitHub. Sama dengan catatan `.git/rumahpintar-terpasang`? Selesai tanpa menyentuh Docker: `v2.0.1 sudah terpasang (gerbang): tidak ada rilis baru`.
3. `git merge --ff-only` ke *tag* itu (hanya maju lurus); nomor versi di `backend/package.json` harus sama dengan *tag*-nya.
4. `docker compose pull`, lalu `docker compose up -d --no-build --wait`: mesin produksi tidak pernah membangun *image*.
5. *Restart* broker (di pusat, juga Grafana) **sekali per rilis**, dan hanya bila konfigurasi yang dibacanya langsung dari repo berubah, misalnya `gerbang.conf` atau `acl-broker`. *Restart*, bukan HUP: di gerbang, HUP membuang antrean simpan-teruskan (Modul 27).
6. Tunggu 15 detik dan pastikan tidak ada layanan `Restarting` (di pusat: uji asap, [Konsep 9](#9-staging-vs-produksi-gladi-resik-vs-pentas)), lalu catat, misalnya `v2.0.0 -> v2.0.1 terpasang (gerbang)`. Layanan yang baru mogok sesudah ±10 detik berjalan bisa lolos; pemantau yang terus berjaga menyusul di Modul 30.

Gagal di langkah mana pun berarti berhenti dengan pesan `GAGAL:` dan kode keluar 1, lalu putaran berikutnya mengulang. Bila gagal sesudah `merge` tetapi sebelum `up` (misalnya *image* belum bisa ditarik), kontainer lama tetap berjalan, tetapi salinan repo sudah di rilis baru, jadi berkas yang dibaca langsung dari repo (misalnya dashboard Grafana) bisa sudah berganti. Skrip ini tidak pernah menjalankan `down -v`, `prune`, atau `git reset --hard`.

![Diagram jam weker Pi, satu putaran pemasangan (Konsep 8): satpam systemd (Modul 12) yang dibangunkan jam weker; skrip/pasang.sh bagian gerbang (Pi jalur utama). Kiri atas, rumahpintar-perbarui.timer: OnBootSec=5min, OnUnitActiveSec=15min, RandomizedDelaySec=60: 5 menit sesudah Pi menyala, lalu 15 menit sesudah putaran sebelumnya mulai (juga bila gagal), + acak 0–60 detik; rilis baru terpasang paling lambat ±17 menit sesudah tag, + tarik image. Membangunkan rumahpintar-perbarui.service: Type=oneshot, User=budi, Environment=PASANG_BAGIAN=gerbang, ExecStart=/bin/sh /home/budi/rumah-pintar-mini/skrip/pasang.sh, TimeoutStartSec=15min; budi = anggota grup docker, bukan root; jalur gratis PASANG_BAGIAN=pusat gerbang. Sepuluh langkah, kanan = teks jurnal: 1 bukan root, kalau root GAGAL: jangan dijalankan dengan sudo; 2 di main tanpa suntingan, kalau tidak GAGAL: ada berkas yang disunting langsung; 3 git fetch --tags origin, gagal: GAGAL: tidak bisa mengambil tag dari GitHub; 4 tag rilis terbaru di main (git tag --list pola v + angka --merged origin/main --sort=-v:refname): sama dengan catatan = v2.0.1 sudah terpasang (gerbang): tidak ada rilis baru, Docker tidak disentuh; belum ada tag = belum ada rilis; 5 git merge --ff-only v2.0.1^{commit}, hanya maju, versi package.json = tag, gagal: GAGAL: tidak bisa maju lurus, atau berisi versi lain; 6 folder edge: docker compose pull --quiet, image resmi Mosquitto, gagal: GAGAL: image gerbang belum bisa ditarik, kontainer lama tetap jalan; 7 up -d --no-build --wait, gagal: GAGAL: gerbang gagal dinyalakan; 8 gerbang.conf atau acl-broker berubah: restart mosquitto, sekali per rilis, bukan HUP; 9 tunggu 15 detik, ada yang Restarting: GAGAL: broker gerbang jatuh bangun; 10 catat .git/rumahpintar-terpasang, jurnal hijau: v2.0.0 menjadi v2.0.1 terpasang. GAGAL di mana pun: kode keluar 1, 15 menit lagi diulang; tidak pernah down -v, prune, git reset --hard. Bagian pusat (VPS, Pi jalur gratis): pull, up, restart mosquitto atau grafana bila konfigurasinya berubah, lalu uji asap (image, /health versi dan database, dashboard lewat Caddy). Baca hasil: systemctl list-timers rumahpintar-perbarui.timer; journalctl -u rumahpintar-perbarui.service -n 30. Batas jujur: broker yang baru mogok sesudah ±10 detik bisa lolos (pemantau = Modul 30); lab penulis, gerbang tiruan, 4 rilis: 2.0.0 dengan tangan, 2.0.1, 2.0.2, 2.0.4 dibangunkan penjadwal tiruan tiap ±1 menit (bukan systemd); jadwal timer hanya dicek systemd-analyze verify (systemd 259).](aset/timer-pi-alur.png)

**Gerbang tidak punya *image* buatan sendiri** ([Konsep 10 Modul 26](../modul-26-docker-compose/README.md#10-dua-berkas-sampai-akhir-pusat-dan-gerbang)). Di Pi jalur utama, yang diperbarui adalah *image* resmi Mosquitto bertag persis di `edge/compose.edge.yml` dan konfigurasi broker dari folder `edge/`. Inilah janji [6.4 Modul 26](../modul-26-docker-compose/README.md#64--pi-samakan-acl-salin-berkas-sandi-lama-ke-lemari-gerbang-lalu-matikan-broker-apt-10-menit): alur `git pull` + `docker compose restart mosquitto` yang dulu kamu kerjakan dengan tangan ("pembaruan otomatis menunggu Modul 29") kini dikerjakan skrip. `edge/.env` dan `edge/jembatan/pusat.conf` berisi rahasia dan tidak ikut Git, jadi tetap tangan. Pi jalur gratis menjalankan bagian `pusat gerbang`: *image* backend dan web varian arm64 dari GHCR, ditambah gerbang.

**Kenapa bukan Watchtower.** Watchtower, program populer yang memperbarui kontainer bila *image*-nya berganti, sudah diarsipkan pemiliknya pada 17 Des 2025 (Silabus mencatatnya). Lagi pula ia hanya melihat *image*, bukan konfigurasi `edge/`, dan dengan *tag* persis ia tidak pernah melihat versi baru.

**Jujur.** Penulis tidak menjalankan jam weker systemd sungguhan. Kedua berkas unit lulus `systemd-analyze verify` (systemd 259), dan putaran `pasang.sh` bagian `gerbang` dijalankan dengan Docker sungguhan di "Pi" tiruan: rilis 2.0.0 dengan tangan, rilis berikutnya dibangunkan penjadwal tiruan tiap ±1 menit, bukan systemd. Bentuk keluaran `list-timers` dan `journalctl` di [11.4](#114--nyalakan-jam-weker-enable---now-dan-list-timers-5-menit) dan [11.5](#115--satu-putaran-sekarang-systemctl-start-lalu-baca-journalctl-8-menit) mengikuti dokumen systemd. Memasang salinan unitnya ada di [11.2](#112--dua-berkas-unit-di-etcsystemdsystem-sesuaikan-salinannya-bukan-berkas-repo-8-menit), dan jadwal tiap 5 menit lewat *drop-in* di [🧩 Tingkat 1](#tingkat-1--pi-bertanya-setiap-5-menit-drop-in-untuk-jam-weker-ubah-sedikit-20-menit).

> ⬆️ **Sudah membaca Konsep 7–8?** Lanjut ke [Praktik 9](#praktik-9--rilis-pertama-200-tag-oleh-robot-pemasang-satu-skrip-dan-paket-publik-35-menit) (rilis pertama dan `skrip/pasang.sh`), lalu [Praktik 10](#praktik-10--vps-beralih-ke-menarik-kunci-robot-yang-hanya-bisa-satu-skrip-45-menit) (VPS) dan [Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit) (Pi). Belum mengerjakan [Praktik 8](#praktik-8--staging-sekali-pakai-di-mesin-robot-25-menit)? Baca [Konsep 9](#9-staging-vs-produksi-gladi-resik-vs-pentas) dan kerjakan Praktik 8 dulu.

### 9. *Staging* vs produksi: gladi resik vs pentas

Sebelum pentas, pemain teater menjalani **gladi resik**: panggung, kostum, lampu, dan urutan adegan yang sama persis, tetapi tanpa penonton. Lampu yang padam saat gladi hanya diketahui kru, dan masih sempat dibetulkan. Dalam perangkat lunak, gladi resik disebut ***staging***: versi baru dinyalakan lengkap dengan data palsu sebelum menyentuh **produksi** (*production*), yaitu **pentas**: VPS-mu (jalur utama) atau Pi-mu (jalur gratis), dengan akun, perangkat, dan riwayat rumahmu. [Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) memasangkan keduanya di konsep modul ini. *Staging* di sini bukan CA latihan Let's Encrypt, yang oleh dokumennya juga disebut *staging* ([Konsep 6 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#6-sertifikat-dibahas-tuntas-rantai-nama-dan-tanggal)).

**Gladinya di mesin robot.** VPS 2 GB hanya muat satu pusat ([Silabus §5.5](../../SILABUS.md#55-biaya-layanan-fase-5): 1 GB pun tidak cukup untuk database, Grafana, dan API), dan [Konsep 10 Modul 26](../modul-26-docker-compose/README.md#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) memutuskan tidak ada berkas Compose ketiga. Karena itu, gladi resik dijalankan *job* `staging` di mesin sewaan robot, yang memang dibuang sesudah *job*-nya selesai:

| | Gladi resik (*staging*) | Pentas (produksi) |
| :-- | :-- | :-- |
| Mesin | mesin sewaan robot (amd64), dibuang sesudahnya | VPS atau Pi, menyala terus |
| Berkas Compose | `compose.cloud.yml` | `compose.cloud.yml` yang sama |
| *Image* | yang baru dikirim *job* `bangun` ke GHCR | rilis bertanda yang sama, ditarik |
| Data | database kosong, migrasi `001`–`011` dari nol | akun, perangkat, dan riwayat rumahmu |
| Rahasia | `.env` berisi rahasia acak yang tidak pernah dicetak | `.env` milikmu |
| *Tag* rilis | dibuat hanya bila gladi lulus | hanya rilis bertanda yang dipasang |

Isi *job*-nya kamu tempel di [8.2](#82--tahap-b3-job-staging-dengan-rahasia-acak-dan-lemari-kosong-10-menit). Ringkasnya: `.env` berisi `COMPOSE_FILE`, `TOKO_IMAGE`, dan enam rahasia wajib yang dibuat acak dengan resep di kepala `.env.example` (hanya bisa dibaca pemiliknya, `umask 077`; Telegram dan domain kosong); dua lemari kosong dari `docker volume create`; lalu `docker compose pull --quiet` dan `docker compose up -d --no-build --wait --wait-timeout 300`, persis seperti di VPS dan Pi. Robot masuk ke GHCR dengan izin `packages: read` ([Konsep 6](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables)), karena paket yang baru dibuat masih privat. Bila ada yang gagal, langkah terakhir mencetak `docker compose ps -a` dan 40 baris log terakhir tiap layanan (langkah ini ikut gagal bila berkas Compose tak terbaca); log itu publik, tetapi rahasia acaknya tidak pernah tercetak. Tidak perlu `down -v`: seluruh mesin dibuang bersama isinya.

`staging` hanya berjalan pada *push* ke `main` yang membawa versi baru (keluaran `rilis-baru` = `ya` dari *job* `bangun`). Di *pull request*, *image*-nya belum dikirim ke mana pun, jadi gladi pertamamu baru di [9.5](#95--merge-pr-b-robot-mengirim-image-200-staging-lulus-tag-dibuat-8-menit). *Merge* yang hanya mengubah dokumen tidak menyalakan `staging`, tidak membuat *tag*, dan tidak mengetuk VPS.

**Uji asap.** Gladi diakhiri **uji asap** (*smoke test*), istilah dari elektronika: nyalakan dulu rangkaiannya, lihat ada asap atau tidak, baru periksa rinci. `skrip/uji-asap.sh` hanya membaca, tidak menyalakan atau mematikan apa pun, dan memeriksa empat hal ([8.1](#81--uji-asap-skripuji-asapsh-empat-pemeriksaan-yang-hanya-membaca-6-menit)):

1. Sesudah 15 detik, tidak ada layanan yang jatuh bangun (`Restarting`). Pemeriksaan ini perlu karena `up --wait` hanya bisa menunggu layanan yang punya pemeriksaan kesehatan (*healthcheck*): Mosquitto atau Caddy yang mogok berulang tetap ditulisnya `Healthy` (lab penulis).
2. `backend` dan `web` berjalan dengan *image* bertag versi itu.
3. `/health`, ditanya dari dalam kontainer backend, menyebut `versi` itu dan `"database":true`.
4. Dashboard dan `/api/health` terjawab lewat Caddy.

Kode keluar `0` berarti keempatnya lulus. Skrip yang sama dijalankan `skrip/pasang.sh` sesudah memasang di VPS dan di Pi jalur gratis. Batasnya: layanan yang baru mogok sesudah ±10 detik berjalan bisa lolos, karena Docker langsung menyalakannya lagi; pemantau yang terus berjaga menyusul di Modul 30.

**Merah di gladi, tidak pernah sampai ke pentas.** Tangganya `bangun` → `staging` → `tandai-rilis` → `pasang-vps` dan jam weker Pi (peta di [Konsep 3](#3-ci-robot-yang-membaca-kode-keluar)). *Tag* rilis baru dibuat sesudah `staging` lulus, sedangkan VPS dan Pi hanya memasang rilis bertanda. Di lab penulis (robot tiruan), rilis latihan 2.0.5 sengaja memuat baris `listener_salah_ketik 1883` di `edge/pusat.conf`. Semua *check* PR-nya hijau: tes dan satpam versi tidak membaca isi konfigurasi broker. Sesudah *merge*, `up --wait` tetap menulis `Healthy` untuk Mosquitto, tetapi uji asap berhenti dengan `GAGAL  layanan jatuh bangun (Restarting): mosquitto -> docker compose logs <layanan>`. `tandai-rilis` dan `pasang-vps` dilewati, "VPS" dan "Pi" tiruan tetap di rilis 2.0.4, dan *image* 2.0.5 tertinggal di toko tanpa *tag* Git, tidak pernah dipasang ([8.3](#83--yang-ditangkap-staging-broker-salah-tulis-tanpa-tag-vps-dan-pi-tidak-tersentuh-5-menit)).

**Yang hanya tertangkap gladi** adalah kesalahan di luar kode program, yang tidak tersentuh tes mana pun: salah ketik di `compose.cloud.yml`, setelan wajib baru yang lupa ditambahkan, `Dockerfile` yang lupa menyalin berkas, atau konfigurasi broker yang salah. Migrasi pun diulang di database kosong, kali ini dari dalam *image* yang akan dipasang. Setelan wajib baru juga dicoba di robot tiruan (rilis latihan 2.0.3): satu setelan wajib ditambahkan ke `compose.cloud.yml` tanpa ditambahkan ke *job* `staging`. *Check* PR tetap hijau, lalu `staging` merah dalam 7 detik dengan `required variable SAPAAN_DASHBOARD is missing a value`, galat yang sudah kamu kenal dari Modul 26. Karena itu, setelan wajib baru selalu ditulis di dua tempat: `.env` mesin produksi dan langkah `.env` di *job* `staging`. Harga rancangan ini: kesalahan seperti itu baru ketahuan sesudah *merge*, jadi `main` sudah memuatnya. Rilisnya saja yang tidak pernah dipasang, dan perbaikannya datang lewat PR berikutnya dengan versi yang naik lagi.

**Jujur.** Mesin robot GitHub amd64, jadi `staging` hanya menyalakan varian amd64; varian arm64 diperiksa uji asap `skrip/pasang.sh` di Pi jalur gratis (Konsep 5). Setiap `staging` di GitHub menarik ±1,14 GB *image* (TimescaleDB, Grafana, Mosquitto, backend, dan web), dan lamanya di GitHub belum diukur penulis. Di lab penulis, *job* `staging` selesai dalam 51–75 detik: angka robot tiruan di satu Raspberry Pi 5 dengan *image* dasar dimuat lokal, bukan GitHub.

**Persetujuan manusia sebelum pentas?** GitHub juga punya *environment*, lingkungan bernama seperti `produksi` yang bisa menahan sebuah *job* sampai peninjau (*reviewer*) yang kamu tunjuk menyetujuinya. Menurut dokumen GitHub, di akun gratis peninjau wajib hanya tersedia untuk repo publik. Modul ini tidak memakainya, karena gerbangnya `staging` dan *tag*; mencobanya bersama teman adalah salah satu pilihan [🧩 Tingkat 3](#tingkat-3--pilih-satu-vps-sebagai-canary-persetujuan-sebelum-produksi-atau-rilis-github-otomatis-buat-dari-nol-60-menit). Silabus (v1.0.31) mencatat gladi ini di konsep Modul 29: *staging* sekali pakai di mesin robot, lawan *production*.

> ⬆️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 8](#praktik-8--staging-sekali-pakai-di-mesin-robot-25-menit): *staging* sekali pakai di mesin robot. Sesudahnya baca [Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri) dan [Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12) sebelum [Praktik 9](#praktik-9--rilis-pertama-200-tag-oleh-robot-pemasang-satu-skrip-dan-paket-publik-35-menit).

### 10. SemVer, `CHANGELOG`, dan *tag*: satu nomor, lalu maju untuk mundur

[Konsep 9 Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#9-lokasi-adalah-data-perangkat-api-bukan-tempelan-di-layar) memakai pola SemVer dengan janji "dibahas tuntas di Modul 29", dan [Konsep 5 Modul 28](../modul-28-ota-provisioning-fleet/README.md#5-versi-dan-semver-versi_firmware-fw-dan-daftar-rilis-manifest) menunda SemVer untuk seluruh proyek, `CHANGELOG`, dan *tag* versi ke sini. [Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) meminta "SemVer & `CHANGELOG`" serta "`CHANGELOG` & *tag* versi pertama". Sampai Modul 28, nomor backend 1.5.0 dan dashboard 1.4.0 ditulis tangan di empat tempat atau lebih, tanpa pemeriksa, `CHANGELOG`, atau *tag*.

**Tiga angka.** SemVer (*Semantic Versioning*) menulis versi sebagai MAYOR.MINOR.PATCH (Modul 25 dan 28 menulis angka pertamanya dengan ejaan Inggris, MAJOR). Angka yang naik memberi tahu pemakai lama seberapa besar perubahannya:

| Angka | Naik bila | Di proyek ini |
| :-- | :-- | :-- |
| PATCH (ketiga) | perbaikan kecil, yang lain tetap | 2.0.0 → 2.0.1: satu teks di layar **Masuk** ([12.2](#122--versi-201-patch-di-10-tempat-dan-entri-changelogmd-5-menit)) |
| MINOR (kedua) | fitur baru, cara lama tetap jalan | kelak, misalnya 2.0.2 → 2.1.0 |
| MAYOR (pertama) | pemakai lama terpaksa ikut berubah | backend 1.5.0 dan dashboard 1.4.0 → 2.0.0 |

**Siapa pemakai lama sebuah server?** Aturan SemVer aslinya berbicara tentang API: MAYOR naik bila program yang memakai API itu harus diubah. API rumahmu hampir tidak berubah minggu ini: jalurnya tetap 30, dan `/health` hanya bertambah `versi` ([Konsep 2](#2-yang-tidak-terlihat-tiruan-integration-test-dengan-database-uji)). Namun, server juga dipakai orang yang memasangnya, yaitu kamu, dan **cara memasang** berubah: VPS dan Pi jalur gratis tidak lagi membangun *image*, tetapi menarik *image* buatan robot; Pi memasang sendiri dengan jam weker; dan `main` dijaga aturan cabang. Itulah sebabnya nomornya 2.0.0.

**Satu nomor untuk server.** Backend dan dashboard kini selalu bernomor sama, dan nomor yang sama tertulis di tiga baris `image:` di `compose.cloud.yml`, di entri rilis teratas `CHANGELOG.md`, dan di *tag* Git `v2.0.0`; dari luar, nomor itu terbaca di `/api/health` dan di bawah judul layar **Masuk**. Yang perlu kamu ingat hanya satu nomor, misalnya "Rumah Pintar Mini 2.0.1". Harganya kecil: di PR C hanya satu teks dashboard yang berubah, tetapi backend ikut naik ke 2.0.1, dan robot membangun ulang kedua *image*. Firmware Node 1 (1.7.x) dan Node 2 (1.0.0), `KONTRAK-DATA.md` 1.6, dan `PETA-PIN.md` versi 7 tetap bernomor sendiri: semuanya berubah menurut jadwalnya sendiri, dan firmware sudah punya aturan SemVer-nya sejak Modul 28 (`fw`).

**Satpam versi: yang dipasang berubah = versi naik.** `skrip/cek-versi.mjs` memeriksa nomor itu di 10 tempat: dua `package.json`, dua tempat di setiap `package-lock.json`, tiga baris `image:`, dan entri teratas `CHANGELOG.md` ([6.4](#64--satpam-versi-skripcek-versimjs-satu-nomor-di-10-tempat-hanya-boleh-naik-5-menit)). Di setiap *pull request*, ia juga membandingkan cabangmu dengan `origin/main`: bila ada yang **dipasang** di VPS atau Pi berubah, versinya wajib naik. Yang dipasang = isi *image* backend dan web, `compose.cloud.yml`, konfigurasi broker di `edge/`, `grafana/provisioning/`, `grafana/dashboards/`, `grafana/pengguna-grafana.sql`, dan `skrip/*.sh`; dokumen (`*.md`), tes, Bruno, dan berkas robot di `.github/` tidak. Sebabnya: robot hanya membuat rilis untuk nomor yang belum pernah dirilis, dan VPS serta Pi hanya memasang rilis. Tanpa satpam ini, perubahan yang lupa dinaikkan versinya tidak pernah sampai ke produksi, dan tidak ada pesan galat yang memberitahumu.

Nomor juga tidak pernah turun. Nomor pra-rilis seperti `2.1.0-rc.1`, yang sah menurut SemVer, ditolak dengan pesan `bukan MAYOR.MINOR.PATCH angka saja`, karena di proyek ini setiap nomor langsung menjadi rilis yang dipasang. Versi `0.y.z` menurut SemVer menandai masa awal pengembangan; backend sudah 1.0.0 sejak [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#82-backend-v100-7-menit). Bagian "versi wajib naik" di satpam ini bisa kamu tulis sendiri di [🧩 Tingkat 2](#tingkat-2--satpam-versi-bagian-versi-wajib-naik-yang-masih-kosong-isi-bagian-rumpang-30-menit).

**`CHANGELOG.md`: buku catatan perubahan untuk manusia.** Riwayat *commit* (`git log`) ditulis untuk pengembang, langkah demi langkah. `CHANGELOG.md` ditulis untuk orang yang memasang dan memakai, dengan satu pertanyaan: apa yang berubah bagiku di versi ini? Bentuknya mengikuti Keep a Changelog 1.1.0 (prinsipnya: "Changelogs are *for humans*, not machines."), dengan nama jenis dari terjemahan resmi versi 1.0.0: Ditambahkan, Diubah, Akan Dihilangkan, Dihilangkan, Diperbaiki, dan Keamanan. Yang terbaru di atas. Paling atas selalu `## [Belum Dirilis]`, tempat catatan yang sudah masuk `main` tetapi belum ikut rilis mana pun (misalnya tes atau dokumen). Di bawahnya ada satu bagian per rilis, misalnya `## [2.0.0] - 2026-11-04` dengan tanggalmu sendiri. Tanggalnya ditulis tahun-bulan-hari (format ISO), dan satpam versi membaca baris itu, jadi bentuknya harus persis ([6.5](#65--changelogmd-buku-catatan-perubahan-untuk-manusia-4-menit)).

***Tag* Git: penanda halaman.** *Tag* adalah nama yang ditempel pada satu *commit*, seperti penanda halaman di buku riwayat. *Tag* rilis `v2.0.0` adalah *tag* beranotasi: ia membawa pesan berisi `Rumah Pintar Mini 2.0.0` dan bagian `CHANGELOG` versi itu, yang bisa kamu baca dengan `git show v2.0.0` ([9.6](#96--tag-pertama-v200-isinya-catatan-changelog-versi-itu-3-menit)). Pembuatnya *job* `tandai-rilis`, satu-satunya *job* dengan izin `contents: write`, dan hanya sesudah `staging` lulus ([Konsep 9](#9-staging-vs-produksi-gladi-resik-vs-pentas)). VPS dan Pi mengikuti penanda ini, bukan ujung `main` ([Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)). Karena itu, kamu tidak pernah membuat, memindah, atau menghapus *tag* `v…` sendiri, juga lewat **Releases** → **Draft a new release**. *Tag* tangan di `main` bisa membuat Pi memasang rilis yang tidak pernah digladi, sedangkan *tag* yang dipindah membuat `git fetch` di VPS dan Pi gagal ([🚨](#-kalau-tidak-jalan) *`would clobber existing tag` di VPS atau Pi*).

**Maju untuk mundur.** Kata *rollback* sudah dipakai untuk dua hal lain di kurikulum ini: tombol dashboard yang mundur saat perangkat menolak (Modul 24) dan firmware yang kembali sendiri ke versi lama (Modul 28). Untuk server, kembali ke versi sebelumnya dikerjakan dengan ***revert***: tombol **Revert** di *pull request* yang bermasalah membuat PR baru berisi kebalikan perubahannya. *Revert* polos ikut mengembalikan nomor ke 2.0.0, dan satpam versi menolaknya: `GAGAL  versi 2.0.0 lebih KECIL dari 2.0.1 di origin/main: versi hanya boleh naik. …`. Jadi isinya lama, tetapi nomornya **naik**: 2.0.2 berisi isi 2.0.0, dengan entri `### Diperbaiki` "mengembalikan …". Entri 2.0.1 tetap tercatat, karena rilis itu memang pernah terpasang ([Praktik 13](#praktik-13--kembali-ke-versi-sebelumnya-revert-menjadi-202-20-menit)). Inilah **maju untuk mundur**: VPS dan Pi hanya pernah maju ke *tag* terbaru, *tag* lama tidak pernah dipindah, dan `CHANGELOG.md` mencatat apa yang sungguh terjadi.

**Database tidak ikut mundur.** *Revert* mengembalikan kode dan *image*, bukan isi database. Migrasi berjalan setiap kali pusat dinyalakan, dan membatalkan kodenya tidak membatalkan tabel atau kolom yang sudah dibuat. Karena itu, dalam satu rilis migrasi hanya boleh **menambah** (tabel, kolom, atau indeks baru), supaya *image* versi sebelumnya tetap cocok dengan databasenya; butir Modul 29 di templat PR mengingatkannya. Minggu ini tidak ada migrasi baru (tetap `011`). Memasang *tag* lama dengan tangan di VPS atau Pi adalah langkah darurat untuk *runbook* (panduan pemulihan) di Modul 30, bukan cara kembali sehari-hari.

![Diagram garis waktu versi: satu nomor untuk server (Konsep 10): SemVer MAYOR.MINOR.PATCH; yang dipasang berubah = versi naik; maju untuk mundur. Atas, 2.0.1 dengan nama bagian: MAYOR = pemakai lama terpaksa ikut berubah, 1.5.0 ke 2.0.0; MINOR = fitur baru, cara lama tetap jalan, 2.0.2 ke 2.1.0; PATCH = perbaikan kecil, yang lain tetap, 2.0.0 ke 2.0.1. Garis waktu: Modul 28, backend 1.5.0 dan web 1.4.0, dua nomor, ditulis tangan, tanpa satpam; 2.0.0, tag v2.0.0: MAYOR, cara MEMASANG berubah, bukan API-nya: VPS menarik image robot, Pi memasang sendiri, main dijaga, tag pertama; 2.0.1, tag v2.0.1: PATCH, satu teks di layar Masuk, sampai ke VPS dan Pi tanpa kamu SSH; 2.0.2, tag v2.0.2: PATCH, tombol Revert: isi kembali seperti 2.0.0, nomor tetap NAIK (maju untuk mundur); garis putus-putus ke Modul 30, v2.1, MINOR (rencana). Kotak merah: revert polos (versi kembali 2.0.0) ditolak satpam versi di job periksa: GAGAL versi 2.0.0 lebih KECIL dari 2.0.1 di origin/main: versi hanya boleh naik. Kiri: tag rilis = penanda halaman yang hanya ditempel robot; jangan dibuat, dipindah, atau dihapus dengan tangan (juga lewat Releases). Kiri bawah, CHANGELOG.md, buku catatan perubahan untuk manusia: Belum Dirilis; 2.0.2 (contoh, Praktik 13), Diperbaiki: mengembalikan teks layar Masuk; 2.0.1 (contoh, Praktik 12), Diubah: teks layar Masuk; 2.0.0 - 2026-11-04, Ditambahkan: robot pemeriksa dan pemasang (GitHub Actions …), Diubah: satu nomor versi untuk server, backend 1.5.0 …; tanggal ISO YYYY-MM-DD wajib; tag rilis berisi bagian versinya. Kanan, satu nomor di 10 tempat, dijaga skrip/cek-versi.mjs: backend/package.json dan frontend/package.json; package-lock.json (dua folder × dua tempat); compose.cloud.yml, tiga baris image; CHANGELOG.md, entri rilis teratas; yang dipasang berubah tanpa naik = robot merah; di backend dan frontend: npm version 2.0.1 --no-git-tag-version. Terlihat dari luar, tanpa kamu SSH: /api/health menyebut versi 2.0.1, juga /api/docs (OpenAPI); dashboard v2.0.1 di bawah judul (muat ulang dua kali); tag Git v2.0.1, image …:2.0.1, sha 7 huruf; VPS dan Pi hanya memasang versi yang punya tag. Bawah: nomor sendiri, tidak ikut naik: firmware Node 1 1.7.x (Modul 28), Node 2 1.0.0, KONTRAK-DATA.md 1.6, PETA-PIN.md 7. Maju untuk mundur: revert mengembalikan kode dan image, bukan isi database; migrasi dalam satu rilis hanya MENAMBAH, jadi image lama tetap cocok.](aset/garis-waktu-versi.png)

> ⬆️ **Sudah membaca Konsep 10?** Lanjut ke [Praktik 6](#praktik-6--satu-nomor-versi-200-satpam-versi-changelogmd-dan-versi-di-layar-30-menit): satu nomor versi 2.0.0, satpam versi, dan `CHANGELOG.md`. [Konsep 5](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi) dan [Konsep 6](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables) dibaca sebelum [Praktik 7](#praktik-7--satu-image-dua-prosesor-dikirim-robot-ke-ghcr-35-menit).

### 11. Aturan cabang: palang di depan `main`

Sejak [Praktik 8 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#praktik-8--git-untuk-tim-branch-pull-request-dan-review-45-menit), setiap perubahan lewat cabang, *pull request*, *review checklist*, dan **Create a merge commit**. Namun, tombol **Merge pull request** tidak peduli warna robot: PR merah tetap bisa di-*merge*, dan *push* langsung ke `main` pun masih bisa. **Aturan cabang** (*branch protection*) adalah **palang di depan `main`**: palangnya hanya terangkat bila tiga lampu (*check*) `periksa`, `uji`, dan `bangun` hijau, juga untukmu sebagai pemilik repo. Inilah *branch protection* di [Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) (PR wajib lolos uji sebelum *merge*), sekaligus klausa kedua syarat lulusnya: "PR yang tesnya gagal tidak bisa di-*merge*" (syarat **L1**, dibuktikan di [5.3](#53--l1-pr-cobamerah-merah-tombol-merge-terkunci-6-menit)).

**Empat setelan aturan klasik** untuk `main` (**Settings** → **Branches**, [5.1](#51--aturan-klasik-untuk-main-di-settings--branches-empat-setelan-8-menit)). Penulis tidak punya akun GitHub, jadi nama setelan dan perilakunya dikutip dari dokumen GitHub, tidak direkam:

1. **Require a pull request before merging**: semua perubahan lewat PR, dan `git push` langsung ke `main` ditolak ([5.2](#52--push-langsung-ke-main-ditolak-3-menit)). Persetujuan wajibnya 0, karena di dokumen GitHub tertulis "Pull request authors cannot approve their own pull requests." Kalau kamu bekerja sendirian, satu persetujuan wajib saja membuat PR-mu tidak pernah bisa di-*merge*.
2. **Require status checks to pass before merging**: *check* wajib `periksa` dan `uji` di Praktik 5, lalu `bangun` di [7.6](#76--bangun-masuk-aturan-cabang-tiga-check-wajib-4-menit).
3. **Require branches to be up to date before merging**: cabang PR harus memuat `main` terbaru, jadi robot menguji gabungan yang sesungguhnya. Bila dua PR sama-sama menaikkan versi ke 2.0.1, yang di-*merge* belakangan diuji ulang di atas `main` yang baru, dan satpam versi memintanya naik ke 2.0.2.
4. **Do not allow bypassing the above settings**: menurut dokumen GitHub, tanpa centang ini aturan cabang tidak berlaku untuk admin repo, dan pemilik repo adalah admin, yaitu kamu. PR merah tetap bisa kamu *merge*, dan syarat L1 hanya hijau di atas kertas.

Gambar di bawah adalah rekonstruksi dari dokumen GitHub, bukan tangkapan layar: susunan dan bunyi di layarmu bisa sedikit berbeda.

![Diagram aturan cabang: PR merah tidak bisa di-merge (Konsep 11); aturan cabang = palang di depan main. REKONSTRUKSI dari dokumen GitHub, BUKAN tangkapan layar; susunan disederhanakan, letak dan teks di layarmu bisa sedikit berbeda. Kiri, pull request coba/merah ke main, PR merah (Praktik 5): satu expect di integration test diubah. Checks (nama check = nama job): ci / periksa (pull_request) berhasil; ci / uji (pull_request) gagal, wajib; baris putus-putus: check bangun menyusul di Praktik 7, job-nya belum ada di Praktik 5. Kotak merge (tab Conversation), merah: tombol Merge pull request abu-abu bergembok, mati karena check wajib uji gagal; tidak ada pilihan melewati aturan (bypass), juga untuk pemilik repo. Kanan, pull request perbaikan/teks-masuk ke main, PR hijau (Praktik 12): ketiga check (periksa, uji, bangun) berhasil; kotak merge hijau: tombol Merge pull request hijau, lalu Create a merge commit, Confirm merge, Delete branch (sama dengan Modul 16); robot melanjutkan di main (Konsep 3). Bawah, Settings, Branches, aturan klasik untuk main: empat kotak centang. 1 Require a pull request before merging: persetujuan wajib 0, penulis PR tidak bisa menyetujui PR-nya sendiri; push langsung ke main ditolak. 2 Require status checks to pass before merging: wajibkan periksa, uji (Praktik 5) dan bangun (Praktik 7); nama job persis, job tanpa filter paths, check pernah berhasil dalam 7 hari terakhir; staging tidak ikut diwajibkan: di PR ia dilewati (if), dan job yang dilewati dihitung lulus. 3 Require branches to be up to date before merging: cabang PR harus memuat main terbaru, tombol Update branch bila main sudah maju. 4 Do not allow bypassing the above settings: tanpa centang ini, kamu sebagai pemilik repo (admin) tetap bisa merge PR yang merah. Syarat: repo publik (akun gratis: aturan cabang hanya untuk repo publik); pull request pertama yang membawa ci.yml di-merge dulu, karena check baru bisa dipilih sesudah pernah berjalan; aturan ini tidak menggantikan review checklist Modul 16.](aset/kotak-merge-aturan-cabang.png)

**Nama *check*, 7 hari, tanpa `paths`.** *Check* wajib dipilih dengan nama *job*-nya (`name:` di `ci.yml`); di tab **Checks**, menurut dokumen GitHub, ia tampil sebagai `ci / periksa (pull_request)`. Mengganti nama *job* berarti mengganti aturannya juga. Menurut dokumen GitHub, *check* wajib harus pernah lulus di repo itu dalam 7 hari terakhir: karena itu aturan dipasang sesudah PR A ([4.5](#45--merge-pr-a-lalu-robot-berjalan-lagi-di-main-4-menit)), dan `bangun` baru diwajibkan sesudah berjalan di PR B. `ci.yml` sengaja tanpa filter `paths` (*workflow* jalan hanya bila berkas tertentu berubah), karena *workflow* yang dilewati filter membuat *check* wajibnya menunggu selamanya: `Waiting for status to be reported`. Terakhir, menurut dokumen yang sama, *job* yang dilewati melapor lulus. `bangun` dilewati bila `uji` merah, jadi kalau hanya `bangun` yang diwajibkan, PR dengan tes merah tetap lolos; karena itu ketiganya diwajibkan sendiri-sendiri. `staging` dan *job* sesudahnya tidak ikut diwajibkan, karena di PR mereka selalu dilewati.

**Palang menjaga warna, manusia menjaga isi.** PR yang mengubah berkas di `.github/workflows/` ikut mengubah robot yang memeriksanya, misalnya dengan menambah `continue-on-error: true`, jadi *check*-nya bisa hijau palsu. Karena itu, sebelum *merge*, baca perubahannya di tab **Files changed**: butir Modul 29 di templat PR meminta tidak ada langkah yang "dihijaukan" dengan `continue-on-error`, `if: false`, `.skip`/`.only`, atau tes yang dihapus. Aturan cabang juga tidak menggantikan *review checklist* Modul 16.

**Repo publik dan *rulesets*.** Menurut dua sumber resmi GitHub (dokumen dan halaman harga), di akun gratis aturan cabang klasik maupun bentuk barunya, *rulesets*, hanya tersedia untuk repo publik. Repo privat butuh paket berbayar, jadi syarat L1 belum bisa dicapai ([1.2](#12--repo-rumah-pintar-mini-publik-atau-privat-periksa-di-settings--general-lalu-putuskan-3-menit)). [Silabus §5.5](../../SILABUS.md#55-biaya-layanan-fase-5) (v1.0.31) mencatatnya: GitHub Actions, Container Registry, dan aturan cabang gratis untuk repo publik, sedangkan repo privat akun gratis mendapat kuota menit bulanan dan butuh paket berbayar untuk aturan cabang. *Rulesets* bisa berlapis (yang paling ketat yang berlaku), bisa dimatikan sementara tanpa dihapus, dan aturan yang aktif bisa dilihat siapa pun yang bisa membaca repo. Modul ini memakai aturan klasik karena keempat nama setelannya bisa dikutip langsung dari dokumen. Gejalanya ada di [🚨](#-kalau-tidak-jalan), kelompok **Aturan cabang**.

> ⬆️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 5](#praktik-5--aturan-cabang-pr-merah-tidak-bisa-di-merge-20-menit): aturan cabang, sesudah *pull request* pertama di-*merge* di [4.5](#45--merge-pr-a-lalu-robot-berjalan-lagi-di-main-4-menit). Kalau kamu membacanya lebih awal, kembalilah ke praktik yang sedang kamu kerjakan.

## 🔧 Praktik langkah demi langkah

Praktik 1–4, 6–9, dan 12 wajib untuk semua jalur; Praktik 5 wajib kecuali untuk repo privat; [Praktik 10](#praktik-10--vps-beralih-ke-menarik-kunci-robot-yang-hanya-bisa-satu-skrip-45-menit) wajib untuk jalur utama dan tanpa Pi; [Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit) wajib untuk jalur utama dan jalur gratis; Praktik 13 dianjurkan, tanpa ⭐. Langkah bertanda ⭐ adalah buktinya. Syarat **L0** dibuktikan di [4.4](#44--l0-sengaja-merah-sekali-lalu-semua-hijau-8-menit), **L1** di [5.3](#53--l1-pr-cobamerah-merah-tombol-merge-terkunci-6-menit) (bersama [5.2](#52--push-langsung-ke-main-ditolak-3-menit)), **L2** di [12.4](#124--l2-robot-memasang-vps-layar-masuk-menulis-v201-8-menit), dan **L3** di [12.5](#125--l3-pi-memasang-201-sendiri-dibaca-dari-jurnalnya-6-menit).

Urutannya mengikuti urutan wajib di pembuka modul: cadangan (Praktik 1) → **PR A** (Praktik 2–4) → aturan cabang (Praktik 5) → **PR B** (Praktik 6–9) → langkah tangan sekali: paket GHCR publik ([9.7](#97--paket-ghcr-menjadi-publik-tarik-tanpa-login-dua-prosesor-4-menit)), VPS (Praktik 10), dan Pi (Praktik 11) → **PR C** (Praktik 12) → **PR D** (Praktik 13). Sebabnya, aturan cabang hanya bisa mewajibkan *check* yang pernah berjalan, dan robot hanya mengirim *image* serta membuat *tag* dari `main`. Berkas yang berubah di-*commit* di cabang praktiknya, dengan pesan pendek tentang isinya, misalnya `feat: lint backend dan Vitest frontend` (`feat:` = fitur baru). PR di-*merge* dengan **Create a merge commit** ([Praktik 8 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#praktik-8--git-untuk-tim-branch-pull-request-dan-review-45-menit)) sesudah robotnya hijau.

Praktik ditulis untuk jalur utama (VPS dan Pi gerbang). Jalur lain memakai urutan yang sama; bedanya di kotak 🔀 (**Jalur gratis:**, **Tanpa Pi:**, **Repo privat:**).

**Cara mencicil:** **hari 1** 🔁, 🏆, Konsep 1–4, Praktik 1–2 · **hari 2** Praktik 3–4, Konsep 11, Praktik 5 · **hari 3** Konsep 10, Praktik 6, Konsep 5–6, Praktik 7 · **hari 4** Konsep 9, Praktik 8, Konsep 7–8, Praktik 9 · **hari 5** Praktik 10–11 · **hari 6** Praktik 12–13, ➕, kuis, dan checklist.

> [!NOTE]
> **Rumahmu selama minggu ini.** Praktik 1–9 dikerjakan di laptop dan GitHub; VPS dan Pi tidak berubah (cadangan 1.3 hanya membaca). [10.1](#101--terakhir-kali-ssh-untuk-memasang-sh-skrippasangsh-menarik-200-10-menit) membuat ulang `backend` dan `web` di VPS dengan *image* tarikan (jalur gratis: di Pi, 11.1), jadi dashboard putus sesaat (lab penulis: 5,5–7,6 detik, contoh). Praktik 12 dan 13 sama, tetapi tanpa tanganmu. Broker gerbang Pi tidak di-*restart* di 2.0.0–2.0.2 karena `edge/` tidak berubah ([11.6](#116--broker-gerbang-tidak-di-restart-node-1-tetap-online-4-menit)). Node 1 dan data rumah tetap jalan.

### Praktik 1 — Meja kerja: cabang, repo publik, dan cadangan (10 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, terminal di **akar proyek** (1.1, 1.2); **GitHub** di browser (1.2); terminal mesin produksi (1.3): **SSH ke VPS** (`ssh rumah@203.0.113.10`, folder `~/rumah-pintar-mini`; jalur gratis: SSH ke Pi, `ssh budi@gateway.local`). Bahannya: 🔁 Langkah 1 dan [5](#langkah-5--github-dan-pi-repo-publik-paket-ghcr-modul-26-dan-systemctl-list-timers), serta resep cadangan [Modul 26 9.1](../modul-26-docker-compose/README.md#91-pg_dump-di-dalam-kontainer-lalu-docker-compose-cp-ke-backup-8-menit).
>
> ⭐ **Wajib** — langkah 1.2 dan 1.3: repo publik; arsip cadangan bertanggal hari ini ada di `backup/` mesin produksi, dan baris sidik jari riwayatnya tercatat.

#### 1.1 Cabang `fitur/uji-robot` dari `main` yang terbaru (3 menit)

Cabang ini menampung PR A. Di terminal laptop:

```text
git switch main
git pull
git switch -c fitur/uji-robot
```

**Hasilnya (lab penulis, laptop):**

```text
Already on 'main'
Your branch is up to date with 'origin/main'.
Already up to date.
Switched to a new branch 'fitur/uji-robot'
```

Praktik 1 tidak mengubah berkas proyek, jadi tanpa *commit*.

#### 1.2 ⭐ Repo `rumah-pintar-mini` publik atau privat: periksa di Settings → General, lalu putuskan (3 menit)

Di akun gratis, aturan cabang hanya tersedia untuk repo publik ([Konsep 11](#11-aturan-cabang-palang-di-depan-main)). Setelannya: **Settings** → **General**, bagian **Danger Zone** paling bawah. Cara memeriksa termudah: repo yang terbuka di jendela *incognito* (🔁 Langkah 5) = publik. Biasanya sudah publik sejak Modul 3; kalau begitu, langkah ini selesai. Masih privat? Putuskan sekarang. Sebelum menjadikannya publik, periksa riwayat Git di terminal laptop:

```text
git log --all --full-history --oneline -- '*.env' '*kunci.h' '*.bin' '*backup/*' '*jembatan/*.conf'
```

Tanpa keluaran = berkas rahasia itu tidak pernah di-*commit*. Ada baris? Ganti dulu rahasia di berkas itu (sandi, token, kunci baru) karena riwayat repo publik terbaca siapa pun; *secret scanning* hanya jaring pengaman terakhir ([Konsep 11 Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#11-rahasia-dan-privasi-yang-tidak-boleh-bocor)). Lalu di **Danger Zone** tadi: **Change visibility** → pilih publik → ikuti konfirmasinya sampai **Make this repository public** (dari dokumen GitHub, dibaca 5 November 2026; tidak direkam penulis). Ini langkah 1 "Sekali saja" di [README proyek](kode/README.md#diuji-dan-dipasang-otomatis-modul-29).

> 🔀 **Repo privat:** lewati Praktik 5 (syarat **L1** belum bisa di akun gratis; [🚨](#-kalau-tidak-jalan)). Robot memotong kuota menit bulanan, dan VPS serta Pi kelak butuh token baca GHCR dan kunci baca repo (*deploy key*). Belum lulus sampai repo publik atau paket berbayar.

**Kamu lulus langkah ⭐ ini** kalau `https://github.com/<akun>/rumah-pintar-mini` terbuka di jendela *incognito*.

#### 1.3 ⭐ Cadangan sebelum robot memasang: `pg_dump`, `docker compose cp`, dan sidik jari riwayat (4 menit)

Kalau peralihan ke *image* robot merusak sesuatu, arsip ini dipulihkan dengan resep 9.2 Modul 26. Di terminal mesin produksi, siapkan folder dengan `mkdir -p backup`, lalu:

```text
docker compose exec db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
```

**Hasilnya (lab penulis, "VPS" tiruan):** empat baris wajar seperti Modul 26, dibuka `pg_dump: warning: there are circular foreign-key constraints …`. Salin arsipnya keluar, dengan tanggal hari ini di namanya:

```text
docker compose cp db:/tmp/rumahpintar.dump backup/rumahpintar-2026-11-04-sebelum-m29.dump
```

**Hasilnya (lab penulis, "VPS" tiruan):** `rumahpintar-db-1 Copied …`. Cek `git status --short`: kosong, karena `backup/` diabaikan Git. Arsip ini berisi seluruh riwayat dan akunmu: simpan sebagai data pribadi. Lalu sidik jari riwayat:

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

**Hasilnya (lab penulis, "VPS" tiruan; angkamu berbeda):**

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2143 | a5f7faa9788cb5840880322a8487cfaf |       353 |     9 |     3 |    1 |         2
(1 row)
```

Salin barisnya beserta tanggal dan jam WIB ke `belajar-iot/modul-29/sidik-jari.md` dengan judul "Sebelum robot (1.3)". Node 1 terus mengirim dan retensi 90 hari membuang jilid lama, jadi hanya `akun` dan `perangkat` yang harus sama sesudah [10.1](#101--terakhir-kali-ssh-untuk-memasang-sh-skrippasangsh-menarik-200-10-menit) dan [12.4](#124--l2-robot-memasang-vps-layar-masuk-menulis-v201-8-menit).

**Kamu lulus langkah ⭐ ini** kalau `backup/` di mesin produksi berisi arsip bertanggal hari ini dan baris sidik jarinya tersimpan di `sidik-jari.md`.

> ⬆️ **Selesai Praktik 1?** Lanjut ke [Praktik 2](#praktik-2--lint-backend-dan-uji-frontend-oxlint-dan-vitest-25-menit): *lint* backend dan uji frontend, semuanya di laptop.

### Praktik 2 — *Lint* backend dan uji frontend: oxlint dan Vitest (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop (cabang `fitur/uji-robot`), terminal di folder **`backend`**, lalu **`frontend`**. Tanpa Docker; VPS dan Pi tidak disentuh. Konsep yang dipakai: 1, 4.
>
> ⭐ **Wajib** — langkah 2.1, 2.2, 2.3, dan 2.4: *lint* kedua folder menulis `Found 0 warnings and 0 errors.` dengan `--deny-warnings`, lima tes dashboard hijau, lalu merah sekali dan hijau lagi.

Robot (Praktik 4) menjalankan perintah yang sama dan hanya membaca kode keluarnya ([Konsep 4](#4-lint--test--build-gagal-cepat)): hijaukan dulu di laptop. Di PowerShell (tidak diuji penulis), ganti `echo "kode keluar: $?"` dengan `"kode keluar: $LASTEXITCODE"`.

#### 2.1 ⭐ *Lint* backend dengan oxlint 1.89.0: `.oxlintrc.json`, `--deny-warnings`, dan satu temuan (8 menit)

Backend belum pernah punya *lint*: ESLint tidak bisa dipasang karena `typescript-eslint` belum menerima TypeScript 7 (lipatan *ESLint dan Prettier …* di [🔬 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#-bedah-teknis-opsional)). Penggantinya oxlint, versi yang sama dengan *lock* frontend. Di terminal, masuk ke folder `backend` (`cd backend`):

```text
npm i -D -E oxlint@1.89.0
```

`-D` = alat pengembang (tidak ikut *image*), `-E` = versi persis, tanpa `^`. **Hasilnya (lab penulis, laptop; dipotong):** `added 2 packages, and audited 228 packages in 13s` · `4 moderate severity vulnerabilities`, lalu saran `npm audit fix --force`: **jangan** dijalankan (2.5).

Klik kanan folder **`backend`** → **New File…** → `.oxlintrc.json`, isi dengan empat baris [berkas kode](kode/backend/.oxlintrc.json):

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "oxc"]
}
```

Isinya: aturan inti oxlint ditambah *plugin* `typescript` dan `oxc` (= frontend tanpa `react`); daftar `plugins` menggantikan bawaannya, jadi `unicorn` sengaja tidak dipakai. Di `backend/package.json`, tambahkan skrip `lint` di bawah `"cek"`:

```diff
     "cek": "tsc --noEmit",
+    "lint": "oxlint --deny-warnings",
```

Aturan oxlint bertingkat **peringatan**, dan peringatan tidak mengubah kode keluar: tanpa `--deny-warnings`, robot tidak pernah merah karena *lint*. Dengannya, satu peringatan pun = kode keluar `1`. Jalankan:

```text
npm run lint; echo "kode keluar: $?"
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
  ⚠ eslint(no-constant-binary-expression): Unexpected constant relational comparison
    ╭─[src/services/versi.test.ts:16:12]
 15 │   it("1.10.0 LEBIH BARU daripada 1.9.0 (perbandingan teks biasa salah di sini)", () => {
 16 │     expect("1.10.0" < "1.9.0").toBe(true); // teks: "1" < "9", jadi salah
    ·            ──────────────────
 17 │     expect(bandingkanVersi("1.10.0", "1.9.0")).toBe(1);
    ╰────
  help: Both sides of the < are literal values

Found 1 warning and 0 errors.
Finished in 56ms on 68 files with 83 rules using 4 threads.
kode keluar: 1
```

Membandingkan dua teks tetap hampir selalu salah, tetapi tes Modul 28 ini sengaja melakukannya untuk membuktikan bahwa versi tidak boleh dibandingkan sebagai teks. Matikan aturannya untuk baris itu saja, dengan alasan: sisipkan baris komentar di atas baris 16 `src/services/versi.test.ts`, persis seperti [berkas kode](kode/backend/src/services/versi.test.ts).

```diff
+    // oxlint-disable-next-line no-constant-binary-expression -- sengaja: dua teks tetap untuk menunjukkan perbandingan teks salah
     expect("1.10.0" < "1.9.0").toBe(true); // teks: "1" < "9", jadi salah
```

Jangan membuang `--deny-warnings`: itu hijau palsu. Ulangi `npm run lint; echo "kode keluar: $?"`. **Hasilnya (lab penulis, laptop; dipotong):** `Found 0 warnings and 0 errors.` · `Finished in 120ms on 68 files with 83 rules using 4 threads.` · `kode keluar: 0`. Merah lagi kelak? [🚨](#-kalau-tidak-jalan) *Lint merah karena satu peringatan …*.

**Kamu lulus langkah ⭐ ini** kalau `npm run lint` di `backend` berubah dari `Found 1 warning and 0 errors.` (`kode keluar: 1`) menjadi `Found 0 warnings and 0 errors.` (`kode keluar: 0`).

#### 2.2 ⭐ *Lint* frontend ikut `--deny-warnings` (2 menit)

Dashboard memakai oxlint sejak Modul 22, tetapi tanpa `--deny-warnings`. Di `frontend/package.json`:

```diff
-    "lint": "oxlint",
+    "lint": "oxlint --deny-warnings",
```

Pindah ke folder `frontend` (`cd ../frontend`), lalu `npm run lint; echo "kode keluar: $?"`. **Hasilnya (lab penulis, laptop; dipotong):** `Found 0 warnings and 0 errors.` · `Finished in 259ms on 59 files with 116 rules using 4 threads.` · `kode keluar: 0`.

**Kamu lulus langkah ⭐ ini** kalau `npm run lint` di `frontend` menulis `> oxlint --deny-warnings` dan `Found 0 warnings and 0 errors.` (`kode keluar: 0`).

#### 2.3 ⭐ Vitest 5.0.5 di frontend: tiga berkas tes, lima tes pertama dashboard (8 menit)

[Silabus](../../SILABUS.md#3-pilihan-teknologi--alasannya) menulis "Vitest (backend & frontend)", tetapi dashboard belum punya satu tes pun. Ia mendapat Vitest yang sama persis dengan backend, mulai dari lapis paling bawah piramida (Konsep 1): fungsi murni, tanpa peramban dan backend. Di terminal `frontend`:

```text
npm i -D -E vitest@5.0.5
```

**Hasilnya (lab penulis, laptop; dipotong):** `added 17 packages, and audited 442 packages in 9s` · `10 vulnerabilities (2 low, 8 moderate)` (= Modul 28, semuanya alat *build*). Tambahkan skrip `test` di bawah `lint` (`vitest run` = jalan sekali, lalu keluar dengan kodenya):

```diff
     "lint": "oxlint --deny-warnings",
+    "test": "vitest run",
```

Buat `frontend/src/waktu.test.ts` berisi blok di bawah, lalu ambil [`csv.test.ts`](kode/frontend/src/csv.test.ts) dan [`aturan.test.ts`](kode/frontend/src/aturan.test.ts) ke folder yang sama dengan **Copy raw file**.

```ts
// waktu.test.ts - uji pembantu jam di layar (Modul 29). Jam dashboard selalu WIB, apa pun zona waktu laptop, HP, atau
// komputer robot yang menjalankan tes ini (robot GitHub Actions memakai jam UTC). Jalankan dari folder frontend: npm test
import { afterEach, describe, expect, it, vi } from "vitest";
import { jamRelatif, jamWib, MENIT } from "./waktu";

describe("jam di layar (waktu.ts)", () => {
  // sesudah setiap tes: kembalikan zona waktu asli komputer ini (vi.stubEnv di bawah hanya meminjamnya)
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("jamWib: jam WIB, apa pun zona waktu komputernya", () => {
    // UTC (robot), WIB, WITA, WIT. vi.stubEnv("TZ", …) = seolah-olah komputer ini diatur ke zona waktu itu. Hanya berlaku
    // untuk format yang dibuat SAAT dipanggil (toLocaleTimeString di jamWib). Pembentuk Intl.DateTimeFormat yang dibuat sekali
    // saat waktu.ts dimuat (JAM_MENIT dan kawan-kawan) memakai zona waktu saat dimuat: itu dijaga robot yang berjam UTC.
    for (const zona of ["UTC", "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]) {
      vi.stubEnv("TZ", zona);
      // Z di ujung = jam UTC. WIB = UTC + 7 jam.
      expect(jamWib("2026-10-24T09:27:10Z")).toBe("16.27.10 WIB");
      expect(jamWib("2026-10-24T17:05:00Z")).toBe("00.05.00 WIB"); // sudah lewat tengah malam di Indonesia
    }
  });

  it("jamRelatif: di bawah 5 detik 'baru saja' (juga bila jam server sedikit lebih cepat), sesudahnya '… yang lalu'", () => {
    const sekarang = Date.parse("2026-10-24T09:30:00Z");
    expect(jamRelatif(sekarang - 3000, sekarang)).toBe("baru saja");
    // jam server 2 detik lebih cepat daripada jam HP: tetap "baru saja", bukan "dalam waktu 2 detik"
    expect(jamRelatif(sekarang + 2000, sekarang)).toBe("baru saja");
    expect(jamRelatif(sekarang - 45 * 1000, sekarang)).toBe("45 detik yang lalu");
    expect(jamRelatif(sekarang - 3 * MENIT, sekarang)).toBe("3 menit yang lalu");
  });
});
```

Baca komentarnya: laptop berzona WIB tetap menulis jam yang benar walau `jamWib` lupa `timeZone`, robot berjam UTC tidak. `vi.stubEnv("TZ", zona)` meminjam empat zona, termasuk `UTC`, jadi kesalahan itu tertangkap di laptop mana pun. Dua berkas lain menjaga CSV untuk Excel dan kalimat di layar **Aturan** ([rinciannya](kode/frontend/README.md#uji-otomatis-modul-29)). Impor dari `vitest` ditulis jelas karena `npm run build` (`tsc -b`) ikut memeriksa tes. Tanpa berkas setelan baru: Vitest membaca `vite.config.ts`.

Supaya tes tidak mengubah isi *image* web, ganti dua berkas lagi (**Copy raw file**): [`frontend/.dockerignore`](kode/frontend/.dockerignore) mendapat baris `src/**/*.test.ts`, dan di [`frontend/src/index.css`](kode/frontend/src/index.css) baris pertama `@import "tailwindcss";` menjadi:

```css
/* … */
@import "tailwindcss" source(none);
@source "../src";
@source not "../src/**/*.test.ts";
@source "../index.html";
```

Bawaannya, Tailwind membaca semua berkas teks di `frontend`, juga README dan tes, sehingga kata biasa seperti `transform` bisa menjadi kelas CSS (temuan lab penulis). Lalu:

```text
npm test; echo "kode keluar: $?"
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
 ✓ src/csv.test.ts (2 tests) 30ms
 ✓ src/aturan.test.ts (1 test) 64ms
 ✓ src/waktu.test.ts (2 tests) 29ms
 Test Files  3 passed (3)
      Tests  5 passed (5)
   Duration  9.25s (import 89%, transform 9%, tests 1%, worker 1%)
kode keluar: 0
```

Urutan baris `✓` bisa berbeda; `import 89%` = memuat `date-fns`, bukan tesnya; waktunya contoh. Jalankan juga `npm run build`: tetap lulus, dengan baris `PWA v2.0.0` (lab penulis), yaitu versi paket `vite-plugin-pwa`, bukan versi dashboard-mu (1.4.0 sampai Praktik 6).

**Kamu lulus langkah ⭐ ini** kalau `npm test` menulis `Tests  5 passed (5)` dengan `kode keluar: 0`, dan `npm run build` selesai tanpa galat.

#### 2.4 ⭐ Sengaja merah sekali: `jamWib` tanpa zona waktu, lalu hijau lagi (4 menit)

Tes yang belum pernah merah belum terbukti menjaga apa-apa. Di `frontend/src/waktu.ts` baris 25 (fungsi `jamWib`), hapus `, { timeZone: "Asia/Jakarta" }`:

```diff
-  return new Date(t).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
+  return new Date(t).toLocaleTimeString("id-ID") + " WIB";
```

Simpan, lalu `npm test; echo "kode keluar: $?"`.

**Hasilnya (lab penulis, laptop; dipotong):**

```text
     × jamWib: jam WIB, apa pun zona waktu komputernya 22ms
AssertionError: expected '09.27.10 WIB' to be '16.27.10 WIB' // Object.is equality
 ❯ src/waktu.test.ts:19:46
      Tests  1 failed | 4 passed (5)
kode keluar: 1
```

Tanpa `timeZone`, jam mengikuti zona komputer: di UTC `09.27.10`, bukan `16.27.10` WIB. Terminal penulis yang berzona WIB pun merah. Kembalikan dengan `git restore src/waktu.ts`; `npm test` hijau lagi (`kode keluar: 0`, lab penulis). Robot menangkap kesalahan yang sama di [4.4](#44--l0-sengaja-merah-sekali-lalu-semua-hijau-8-menit).

**Kamu lulus langkah ⭐ ini** kalau `npm test` merah dengan `Tests  1 failed | 4 passed (5)` (`kode keluar: 1`), lalu hijau lagi sesudah `git restore`.

#### 2.5 `npm audit` seperti robot: merah hanya untuk celah tinggi, lalu *commit* (3 menit)

Robot mengaudit library dengan `--omit=dev` (hanya yang ikut ke produksi) dan `--audit-level=high` (kode keluar `1` hanya untuk celah *high* atau *critical*). Di `frontend`, lalu di `backend` (`cd ../backend`):

```text
npm audit --omit=dev --audit-level=high; echo "kode keluar: $?"
```

**Hasilnya (lab penulis, laptop, 4 November 2026):** frontend `found 0 vulnerabilities`, kode keluar `0`; backend (dipotong):

```text
glob  3.0.0 - 14.0.1
minimatch  <11.0.1
4 moderate severity vulnerabilities
kode keluar: 0
```

Keempatnya satu rantai milik halaman `/docs` (`@fastify/swagger-ui` → `@fastify/static` → `glob`, `minimatch`); belum ada perbaikan di rentang versi kita ([Batasan v2.0](kode/backend/README.md#batasan-v20)). `npm audit` polos berkode keluar `1` di kedua folder (lab penulis), dan laporan lengkapnya tetap kamu baca seperti di [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#10-jujur-lalu-lintas-di-rumah-masih-polos). Celah baru bisa membuat robot merah tanpa kodemu berubah ([🚨](#-kalau-tidak-jalan) *`npm audit` merah …*). **Jangan** `npm audit fix --force`: menurut laporannya, itu memasang `@fastify/swagger-ui@2.1.0` yang kuno.

Di akar proyek (`cd ..`), `git status --short` hanya menyebut berkas praktik ini: `backend` (`.oxlintrc.json`, `package.json`, *lock*, `versi.test.ts`) dan `frontend` (tiga tes, `.dockerignore`, `package.json`, *lock*, `index.css`). Lalu:

```text
git add backend frontend
git commit -m "feat: lint backend dan Vitest frontend"
```

Belum di-*push*: PR A dibuka di [4.2](#42--commit-push-dan-buka-pr-a-dua-check-berjalan-bersamaan-5-menit).

> ⬆️ **Selesai Praktik 2?** Lanjut ke [Praktik 3](#praktik-3--database-uji-dan-20-integration-test-60-menit): database uji dan 20 *integration test*. Nyalakan Docker di laptopmu dulu.

### Praktik 3 — Database uji dan 20 *integration test* (60 menit)

> 🖥️ **Alat yang dipakai:** **Docker Desktop** (Windows/macOS) atau Docker Engine (Linux) yang menyala di laptop; **VS Code**, cabang `fitur/uji-robot`, terminal di folder **`backend`**. Database rumahmu, VPS, dan Pi tidak disentuh. Konsep yang dipakai: 1, 2.
>
> ⭐ **Wajib** — langkah 3.1 sampai 3.7 dan 3.9: 20 *integration test* hijau, lalu 223 tes sekaligus, dan satu kesalahan SQL yang lolos dari 203 tes tiruan tetapi tertangkap *integration test*.

Backend mendapat lapis tengah piramida ([Konsep 1](#1-piramida-uji-bahan--resep--dapur--pelanggan)): tes yang menjalankan kueri SQL sungguhan di database uji kosong ([Konsep 2](#2-yang-tidak-terlihat-tiruan-integration-test-dengan-database-uji)). Berkasnya ada di [`kode/backend/`](kode/backend/): buka di GitHub, klik **Copy raw file**, lalu tempel sebagai berkas bernama sama di folder `backend` (berkas lama: ganti seluruh isinya). Versi tetap 1.5.0 sampai Praktik 6. Di PowerShell (tidak diuji penulis), ganti `echo "kode keluar: $?"` dengan `"kode keluar: $LASTEXITCODE"`.

#### 3.1 ⭐ Database uji sekali pakai: `rumahpintar-db-uji` di loket 5433 (6 menit)

Nyalakan Docker Desktop dan tunggu sampai siap. Satu baris ini sama di PowerShell, Terminal macOS, dan Linux:

```text
docker run --rm -d --name rumahpintar-db-uji -p 127.0.0.1:5433:5432 --tmpfs /var/lib/postgresql/data -e POSTGRES_PASSWORD=uji-bukan-rahasia -e POSTGRES_DB=rumahpintar_uji -e TIMESCALEDB_TELEMETRY=off timescale/timescaledb:2.30.2-pg17
```

Bandingkan dengan `docker run` database rumah (Modul 17): `--rm` = kontainer terhapus sendiri begitu dihentikan; `--tmpfs` = data di memori tanpa lemari, hilang saat berhenti (dapur latihan selalu mulai kosong); loket `5433` (hanya dari laptop ini) karena 5432 milik database rumah; nama database berakhiran `_uji` (3.3); sandi tertulis itu bukan rahasia karena isinya hanya data uji. *Image*-nya sama dengan produksi (migrasinya butuh TimescaleDB, bukan `postgres` polos), jadi biasanya sudah ada di laptopmu. Ulangi perintah ini sampai menjawab `accepting connections`:

```text
docker exec rumahpintar-db-uji pg_isready -h 127.0.0.1 -U postgres -d rumahpintar_uji
```

**Hasilnya (lab penulis, laptop):** `docker run` menjawab satu baris ID kontainer; `pg_isready` empat kali `127.0.0.1:5432 - no response`, lalu `127.0.0.1:5432 - accepting connections`, ±5,5 detik sesudah `docker run` (contoh). `5432` = loket di dalam kontainer; dari laptop, 5433. Loket 5433 sudah terpakai, atau tes nanti menulis `database uji tidak bisa dihubungi`? Lihat [🚨](#-kalau-tidak-jalan), kelompok **Database uji di laptop**.

**Kamu lulus langkah ⭐ ini** kalau `pg_isready` menjawab `accepting connections`.

#### 3.2 ⭐ Satu rakitan server: `buatApp()` di `src/app.ts`, 203 tes tetap hijau (10 menit)

Tes integrasi butuh rakitan server produksi, tetapi tanpa broker dan loket 8080. Ambil dengan **Copy raw file**: [`src/app.ts`](kode/backend/src/app.ts) (baru), [`src/server.ts`](kode/backend/src/server.ts), [`src/config/versi-server.ts`](kode/backend/src/config/versi-server.ts) (baru), dan [`src/routes/kesehatan.ts`](kode/backend/src/routes/kesehatan.ts). Rakitan `server.ts` Modul 28 (baris 40–103) pindah ke `buatApp()` di `app.ts` ([Konsep 2](#2-yang-tidak-terlihat-tiruan-integration-test-dengan-database-uji)); kepalanya menjelaskan gunanya:

```ts
// Kenapa dipisah? Tes integrasi (src/integrasi/) memanggil buatApp() lalu mengetuk rutenya lewat app.inject() dengan database
// uji SUNGGUHAN. Jadi yang diuji adalah rakitan YANG SAMA dengan produksi, bukan rakitan tiruan buatan tes: rute yang lupa
// didaftarkan ikut ketahuan (contoh: tanpa ruteKlaim, tiga tes klaim merah dengan 404), begitu juga satpam login yang hilang
// …
export async function buatApp(opsi: OpsiApp = {}): Promise<FastifyInstance> {
```

`server.ts` tinggal memanggil `const app = await buatApp();`, mencatat satu baris log baru (`backend Rumah Pintar Mini <versi> menyala`), lalu menyalakan sisanya (database, MQTT, Telegram, …) dan membuka loket seperti dulu. Versinya dibaca dari `package.json` di satu tempat, `src/config/versi-server.ts` (bukan `services/versi.ts`, milik versi firmware Modul 28), dan `/health` (`src/routes/kesehatan.ts`) menyebutnya:

```ts
const paket = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string };

export const VERSI_SERVER: string = paket.version; // misalnya "2.0.0"
// …
    return { ok: true, versi: VERSI_SERVER, broker: brokerTersambung(), database: await databaseHidup(),
```

Versinya masih `1.5.0`; naik di [6.2](#62--satu-nomor-200-npm-version-tiga-baris-image-dan-envexample-6-menit) dan terlihat di VPS di [10.1](#101--terakhir-kali-ssh-untuk-memasang-sh-skrippasangsh-menarik-200-10-menit). Kode jawaban `/health` tetap selalu `200` (`503` = Modul 30). Lalu `npm run cek`, kemudian `npm test`.

**Hasilnya (lab penulis, laptop):** `npm run cek` tanpa keluaran selain kepala npm (`> tsc --noEmit`); `npm test` lulus 203 tes seperti [🔁 Langkah 1](#langkah-1--inventaris-rumah-modul-28-nomor-versi-203-tes-dan-image-buatan-sendiri) (`Tests  203 passed (203)`): rakitannya sama, hanya pindah berkas.

**Kamu lulus langkah ⭐ ini** kalau `npm run cek` tanpa galat dan `npm test` menulis `Tests  203 passed (203)`.

#### 3.3 ⭐ `src/integrasi/siapkan.ts`: pengaman `_uji` dan migrasi yang diantre (6 menit)

Di Explorer VS Code, klik kanan folder **`src`** di `backend` → **New Folder…**, beri nama `integrasi`. Di dalamnya, buat `siapkan.ts` dari [berkas kode](kode/backend/src/integrasi/siapkan.ts) (**Copy raw file**). Ini bukan tes: setiap berkas tes memanggil `siapkanUji()` sebelum tesnya. Kepalanya (baris 1–25) menulis lima langkah persiapan; ini pengamannya:

```ts
  // 1. pengaman nama database, sebelum ada sambungan apa pun
  const nama = namaDatabase(URL_UJI);
  if (!nama.endsWith("_uji")) throw tolakBukanUji(nama);
  // …
    if (!tersambung.rows[0].nama.endsWith("_uji")) throw tolakBukanUji(tersambung.rows[0].nama);
```

Lapis pertama membaca nama di alamat `DATABASE_URL_UJI` sebelum tersambung; lapis kedua memeriksa `SELECT current_database()` sesudahnya: yang menentukan adalah database yang benar-benar tersambung. Pesan tolaknya memuat nama database saja, tanpa alamat yang berisi sandi. Langkah lainnya: setelan tes ditimpa semua (broker mati `mqtt://127.0.0.1:1`, `JWT_SECRET` acak sekali pakai, folder firmware sementara, akun broker otomatis `mati`, Telegram kosong), jadi setelan di terminalmu tidak terbawa; migrasi `node src/db/migrasi.ts` diantre `pg_advisory_lock` karena berkas tes berjalan bersamaan; server `buatApp({ log: "galat-saja" })`: tes hijau senyap, tes merah mencetak alasan `503` satu baris (3.7).

**Kamu lulus langkah ⭐ ini** kalau `siapkan.ts` ada di `src/integrasi/` dan kamu bisa menunjuk kedua baris pengamannya.

#### 3.4 ⭐ Enam berkas *integration test*, lalu baca `perangkat.test.ts` (10 menit)

Ambil keenam berkas tes dari [`kode/backend/src/integrasi/`](kode/backend/src/integrasi/) ke folder yang sama dengan **Copy raw file**: `perangkat.test.ts`, `bacaan.test.ts`, `masuk.test.ts`, `aturan.test.ts`, `klaim.test.ts`, dan `firmware-armada.test.ts`. Yang pertama dibaca utuh:

```ts
// perangkat.test.ts - tes INTEGRASI daftar resmi perangkat (Modul 21 + 28) dengan database uji SUNGGUHAN (Modul 29).
// Bedanya dengan routes/perangkat.test.ts: di sana tabel devices diganti tiruan di memori (vi.mock), jadi kueri SQL di
// src/db/perangkat.ts tidak pernah dijalankan. Di sini INSERT, UPDATE, transaksi, CHECK, dan kunci asing benar-benar diperiksa
// PostgreSQL. Contoh nyata: kalau src/db/perangkat.ts suatu hari salah menulis sidik kunci (misalnya upper($5), huruf besar),
// 203 tes tiruan tetap hijau, tetapi CHECK (kunci_hash ~ '^[0-9a-f]{64}$') di migrasi 010 menolak barisnya: POST /devices
// dijawab 503 dan tes pertama di bawah merah.
// Jalankan (database uji menyala, DATABASE_URL_UJI terisi; lihat siapkan.ts): npm run test:integrasi
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { adaDatabaseUji, daftarkanPerangkat, hapusPerangkatUji, siapkanUji } from "./siapkan.ts";
import type { Uji } from "./siapkan.ts";

// device_id milik berkas ini saja (awalan 2901): berkas tes integrasi lain berjalan bersamaan dengan ID-nya sendiri
const BARU = "290100000001";
const GANDA = "290100000002";
const DAFTAR = "290100000003";
const CABUT = "290100000004";
const SEMUA = [BARU, GANDA, DAFTAR, CABUT];
const sidik = (kunci: string) => createHash("sha256").update(kunci).digest("hex"); // dihitung sendiri, bukan oleh kode server
// versi server dibaca sendiri dari package.json (bukan dari src/config/versi-server.ts yang sedang diuji)
const VERSI = (JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string }).version;

describe.skipIf(!adaDatabaseUji)("integrasi (database uji): perangkat", () => {
  let uji: Uji;
  beforeAll(async () => { uji = await siapkanUji(); }, 60_000); // migrasi bisa menunggu giliran berkas lain
  beforeEach(() => hapusPerangkatUji(uji.pool, SEMUA)); // setiap tes mulai tanpa perangkat milik berkas ini
  afterAll(async () => {
    if (!uji) return; // siapkanUji() gagal (misalnya pengaman _uji menolak): galatnya sudah dilaporkan
    await hapusPerangkatUji(uji.pool, SEMUA);
    await uji.tutup();
  });

  it("POST /devices: kunci tampil sekali, database hanya menyimpan sidik SHA-256-nya (CHECK kunci_hash)", async () => {
    const jawab = await uji.app.inject({ method: "POST", url: "/devices", cookies: uji.gelang("admin"),
      payload: { device_id: BARU, nama: "Uji integrasi", lokasi: "lab robot" } });
    expect(jawab.statusCode).toBe(201);
    const { kunci } = jawab.json() as { kunci: string };
    expect(kunci).toMatch(/^[A-Za-z0-9_-]{43}$/);

    // baca langsung dari tabel: yang tersimpan sidik jarinya (64 heksadesimal huruf kecil), bukan kuncinya
    const baris = await uji.pool.query<{ kunci_hash: string; nama: string; terdaftar: Date | null }>(
      "SELECT kunci_hash, nama, terdaftar FROM devices WHERE device_id = $1", [BARU]);
    expect(baris.rowCount).toBe(1);
    expect(baris.rows[0].kunci_hash).toBe(sidik(kunci));
    expect(baris.rows[0].kunci_hash).not.toContain(kunci);
    expect(baris.rows[0].nama).toBe("Uji integrasi");
    expect(baris.rows[0].terdaftar).toBeInstanceOf(Date);
  });

  it("daftar ulang device_id yang sama: 409, nama dan sidik kunci di database tidak berubah", async () => {
    const kunci = await daftarkanPerangkat(uji, GANDA, "Node asli");
    const lagi = await uji.app.inject({ method: "POST", url: "/devices", cookies: uji.gelang("admin"),
      payload: { device_id: GANDA, nama: "Node penyusup" } });
    expect(lagi.statusCode).toBe(409);

    // ON CONFLICT ... WHERE terdaftar IS NULL: baris yang sudah terdaftar tidak boleh ditimpa
    const baris = await uji.pool.query("SELECT nama, kunci_hash FROM devices WHERE device_id = $1", [GANDA]);
    expect(baris.rows).toEqual([{ nama: "Node asli", kunci_hash: sidik(kunci) }]);
  });

  it("GET /devices dari database tanpa membocorkan kunci; tanpa login 401; /health menyebut versi dan database", async () => {
    const kunci = await daftarkanPerangkat(uji, DAFTAR, "Node daftar");
    const jawab = await uji.app.inject({ method: "GET", url: "/devices", cookies: uji.gelang("viewer") }); // viewer boleh melihat
    expect(jawab.statusCode).toBe(200);

    const daftar = jawab.json() as { device_id: string; nama: string | null; kunci: string }[];
    expect(daftar.find((p) => p.device_id === DAFTAR)).toMatchObject({ nama: "Node daftar", kunci: "aktif" });
    expect(jawab.body).not.toContain(kunci);
    expect(jawab.body).not.toContain(sidik(kunci));
    expect(jawab.body).not.toContain("kunci_hash");

    // rakitan produksi (buatApp) ikut dijaga: satpam login terpasang, dan /health (bukti versi di VPS/Pi) menyebut versi
    // package.json serta database yang tersambung
    expect((await uji.app.inject({ method: "GET", url: "/devices" })).statusCode).toBe(401);
    const sehat = await uji.app.inject({ method: "GET", url: "/health" });
    expect(sehat.statusCode).toBe(200);
    expect(sehat.json()).toMatchObject({ ok: true, versi: VERSI, database: true });
  });

  it("cabut (Nonaktifkan): sidik kunci dihapus, waktu cabut dan status offline tertulis, kejadian masuk tabel events", async () => {
    await daftarkanPerangkat(uji, CABUT);
    const jawab = await uji.app.inject({ method: "POST", url: `/devices/${CABUT}/cabut`, cookies: uji.gelang("admin") });
    expect(jawab.statusCode).toBe(200);

    const baris = await uji.pool.query<{ kunci_hash: string | null; dicabut: Date | null; status: string }>(
      "SELECT kunci_hash, dicabut, status FROM devices WHERE device_id = $1", [CABUT]);
    expect(baris.rows[0]).toMatchObject({ kunci_hash: null, status: "offline" });
    expect(baris.rows[0].dicabut).toBeInstanceOf(Date);
    // buku kejadian ditulis rute tanpa ditunggu (catatKejadian), jadi barisnya ditunggu sebentar (paling lama 1 detik)
    await vi.waitFor(async () => {
      const kejadian = await uji.pool.query("SELECT jenis, sumber FROM events WHERE device_id = $1", [CABUT]);
      expect(kejadian.rows).toEqual([{ jenis: "dicabut", sumber: "api" }]);
    });

    const lagi = await uji.app.inject({ method: "POST", url: `/devices/${CABUT}/cabut`, cookies: uji.gelang("admin") });
    expect(lagi.statusCode).toBe(404); // sudah dicabut: tidak ada yang berubah lagi
  });
});
```

Empat tesnya: (1) kunci tampil sekali, database hanya menyimpan sidiknya (`CHECK kunci_hash`); (2) daftar ulang `409` tanpa menimpa baris (`ON CONFLICT … WHERE terdaftar IS NULL`); (3) `GET /devices` tidak membocorkan kunci, tanpa *login* `401`, dan `/health` menyebut versi `package.json` serta `"database":true`; (4) cabut. Bedanya dengan tes bertiruan: jawaban API dicek lagi langsung di tabel (`uji.pool.query`). Tanpa `DATABASE_URL_UJI`, `describe.skipIf` melewati semuanya; `beforeEach` menghapus perangkat milik berkas ini, jadi setiap tes mandiri. Keenam berkas berjalan bersamaan, jadi masing-masing memakai data sendiri (`device_id` `2901…` sampai `2906…`, email, nama aturan). Yang hanya bisa dibuktikan database di setiap berkas: tabel Konsep 2 dan [README backend](kode/backend/README.md#diuji-dengan-database-uji-modul-29). Tes pertama di atas kamu ubah lagi di [5.2](#52--push-langsung-ke-main-ditolak-3-menit)–[5.3](#53--l1-pr-cobamerah-merah-tombol-merge-terkunci-6-menit).

**Kamu lulus langkah ⭐ ini** kalau `src/integrasi/` berisi tujuh berkas: `siapkan.ts` dan enam berkas tes.

#### 3.5 ⭐ `.dockerignore` dan skrip `test:integrasi` (3 menit)

`siapkan.ts` tidak berakhiran `.test.ts`, jadi baris lama `src/**/*.test.ts` tidak menahannya keluar dari *image*. Ganti isi `backend/.dockerignore` dengan [berkas kode](kode/backend/.dockerignore) (**Copy raw file**); yang baru dua baris terakhir dan komentarnya:

```text
src/integrasi
.oxlintrc.json
```

Di `backend/package.json`, tambahkan skrip `test:integrasi` (perhatikan koma baru di baris `test`):

```diff
-    "test": "vitest run"
+    "test": "vitest run",
+    "test:integrasi": "vitest run src/integrasi"
```

**Kamu lulus langkah ⭐ ini** kalau kedua baris itu ada di `.dockerignore` dan skrip `test:integrasi` ada di `package.json`.

#### 3.6 ⭐ 20 *integration test* hijau, lalu 223 tes sekaligus (8 menit)

Alamat database uji diberikan lewat setelan `DATABASE_URL_UJI`. Di bash, setelan itu hanya berlaku untuk satu perintah:

```bash
DATABASE_URL_UJI=postgres://postgres:uji-bukan-rahasia@127.0.0.1:5433/rumahpintar_uji npm run test:integrasi; echo "kode keluar: $?"
```

Di PowerShell (tidak diuji penulis), setelan berlaku di jendela itu sampai dihapus:

```powershell
$env:DATABASE_URL_UJI = "postgres://postgres:uji-bukan-rahasia@127.0.0.1:5433/rumahpintar_uji"
npm run test:integrasi; "kode keluar: $LASTEXITCODE"
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
> rumah-pintar-mini-backend@1.5.0 test:integrasi
> vitest run src/integrasi

 ✓ src/integrasi/bacaan.test.ts (3 tests) 4886ms
 ✓ src/integrasi/firmware-armada.test.ts (3 tests) 5054ms
 ✓ src/integrasi/aturan.test.ts (3 tests) 6229ms
 ✓ src/integrasi/klaim.test.ts (3 tests) 4469ms
 ✓ src/integrasi/perangkat.test.ts (4 tests) 4475ms
 ✓ src/integrasi/masuk.test.ts (4 tests) 6707ms

 Test Files  6 passed (6)
      Tests  20 passed (20)
   Duration  13.34s (tests 97%, import 2%)

kode keluar: 0
```

Urutan berkas dan waktunya bisa berbeda. `tests 97%` = sebagian besar menunggu giliran migrasi dan bcrypt (`masuk.test.ts`), bukan SQL yang lambat. Inilah "20 test hijau" di [Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis). Sekarang semuanya sekaligus, seperti robot: perintah yang sama, dengan `npm test` sebagai ganti `npm run test:integrasi`.

**Hasilnya (lab penulis, laptop; dipotong):**

```text
 Test Files  31 passed (31)
      Tests  223 passed (223)
   Duration  28.90s (tests 68%, import 29%, transform 2%, worker 1%)
kode keluar: 0
```

Inilah yang dijalankan robot di *job* `uji` (Praktik 4); di sana satu tes yang dilewati pun merah ([Konsep 4](#4-lint--test--build-gagal-cepat)).

**Kamu lulus langkah ⭐ ini** kalau hasilnya `Tests  20 passed (20)` lalu `Tests  223 passed (223)`, keduanya dengan `kode keluar: 0`.

#### 3.7 ⭐ Sengaja salah di SQL: 203 tes tiruan hijau, *integration test* merah (8 menit)

Ini contoh [Konsep 2](#2-yang-tidak-terlihat-tiruan-integration-test-dengan-database-uji). Di `src/db/perangkat.ts` baris 44 (fungsi `daftarkanPerangkat`), ubah `now(), $5,` menjadi `now(), upper($5),`, lalu simpan; sidik kunci kini berhuruf besar:

```diff
-       VALUES ($1, CASE WHEN $4::text IS NULL THEN 'belum-diketahui' ELSE 'node2' END, $2, $3, $4, now(), $5,
+       VALUES ($1, CASE WHEN $4::text IS NULL THEN 'belum-diketahui' ELSE 'node2' END, $2, $3, $4, now(), upper($5),
```

Jalankan dulu tanpa database uji (PowerShell: `Remove-Item Env:DATABASE_URL_UJI` lebih dulu): `npm test; echo "kode keluar: $?"`.

**Hasilnya (lab penulis, laptop; dipotong):**

```text
 Test Files  25 passed | 6 skipped (31)
      Tests  203 passed | 20 skipped (223)
kode keluar: 0
```

Hijau karena tiruan tidak menjalankan SQL. Lalu `npm run test:integrasi` dengan database uji seperti 3.6 (PowerShell: isi lagi `$env:DATABASE_URL_UJI`).

**Hasilnya (lab penulis, laptop; dipotong):**

```text
{"level":50,…,"msg":"registrasi 290100000001 gagal: new row for relation \"devices\" violates check constraint \"devices_kunci_hash_check\""}
     × POST /devices: kunci tampil sekali, database hanya menyimpan sidik SHA-256-nya (CHECK kunci_hash) 153ms
AssertionError: expected 503 to be 201 // Object.is equality
 Test Files  2 failed | 4 passed (6)
      Tests  6 failed | 14 passed (20)
kode keluar: 1
```

Baris JSON = log `galat-saja`, dipotong sampai `msg`: `CHECK (kunci_hash ~ '^[0-9a-f]{64}$')` migrasi `010` hanya menerima huruf kecil, database menolak barisnya, backend menjawab `503`, dan `toBe(201)` di tes pertama gagal. Merah: empat tes `perangkat.test.ts` dan dua `firmware-armada.test.ts`; di produksi, pendaftaran berkunci lewat `POST /devices` gagal. Kembalikan dengan `git restore src/db/perangkat.ts`; `test:integrasi` harus kembali `Tests  20 passed (20)`.

**Kamu lulus langkah ⭐ ini** kalau 203 tes hijau tanpa database uji, `Tests  6 failed | 14 passed (20)` dengan database uji, lalu hijau lagi sesudah `git restore`.

#### 3.8 Pengaman menolak database bernama `rumahpintar` (4 menit)

Aman dicoba: alamatnya tetap database uji di loket 5433, hanya namanya `rumahpintar`, dan pengaman menolak sebelum tersambung. Di bash:

```bash
DATABASE_URL_UJI=postgres://postgres:uji-bukan-rahasia@127.0.0.1:5433/rumahpintar npm run test:integrasi; echo "kode keluar: $?"
```

PowerShell: isi `$env:DATABASE_URL_UJI` dengan alamat itu, lalu baris kedua 3.6.

**Hasilnya (lab penulis, laptop; dipotong):**

```text
 FAIL  src/integrasi/aturan.test.ts > integrasi (database uji): aturan otomatis
Error: DATABASE_URL_UJI menunjuk database "rumahpintar", bukan database uji: nama database harus berakhiran _uji (misalnya rumahpintar_uji). Tes integrasi menulis dan menghapus baris, jadi tidak dijalankan. Jangan pernah mengarahkannya ke database rumahmu.
 ❯ tolakBukanUji src/integrasi/siapkan.ts:54:10
 Test Files  6 failed (6)
      Tests  20 skipped (20)
kode keluar: 1
```

Satu pesan per berkas, tanpa sandi: alamat database rumahmu tidak akan pernah dipakai tes integrasi ([🚨](#-kalau-tidak-jalan)).

#### 3.9 ⭐ Tanpa database: 20 tes dilewati, lalu `docker stop` dan *commit* (5 menit)

Di PowerShell, hapus dulu setelannya: `Remove-Item Env:DATABASE_URL_UJI` (tanpa itu, `npm test` di jendela itu tetap memakai alamat terakhir: tes integrasi tidak dilewati, dan sesudah `docker stop` merah, misalnya `database uji tidak bisa dihubungi …`). Lalu `npm test`. **Hasilnya (lab penulis, laptop; dipotong):** `Test Files  25 passed | 6 skipped (31)` dan `Tests  203 passed | 20 skipped (223)`. Tanpa Docker pun semua *unit test* tetap jalan. Matikan database uji:

```text
docker stop rumahpintar-db-uji
```

**Hasilnya (lab penulis, laptop):** `rumahpintar-db-uji`; kontainer dan datanya hilang. Dari akar proyek (`cd ..`), `git status --short` hanya boleh menyebut berkas `backend` ini: `.dockerignore`, `package.json`, `src/server.ts`, `src/routes/kesehatan.ts` (diubah), serta `src/app.ts`, `src/config/versi-server.ts`, dan folder `src/integrasi/` (baru). Lalu, satu per satu:

```text
git add backend
```

```text
git commit -m "feat: database uji dan 20 integration test"
```

Belum di-*push*: PR A dibuka di Praktik 4, bersama robotnya.

**Kamu lulus langkah ⭐ ini** kalau `npm test` tanpa database uji menulis `Tests  203 passed | 20 skipped (223)`, `docker stop` menjawab `rumahpintar-db-uji`, dan *commit* itu ada di cabang `fitur/uji-robot`.

> ⬆️ **Selesai Praktik 3?** Lanjut ke [Praktik 4](#praktik-4--robot-pemeriksa-di-setiap-pull-request-40-menit): robot pemeriksa menjalankan semua yang baru kamu jalankan, di setiap *pull request*.

### Praktik 4 — Robot pemeriksa di setiap *pull request* (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, cabang `fitur/uji-robot`, terminal di **akar proyek**; **GitHub** di browser (tab **Pull requests**, **Checks**, dan **Actions**). VPS dan Pi tidak disentuh. Konsep yang dipakai: 3, 4.
>
> ⭐ **Wajib** — langkah 4.1 sampai 4.5: robot `ci` memeriksa PR A, merah sekali dengan sengaja, lalu hijau di `periksa` dan `uji` dengan `Tests  223 passed (223)` (syarat **L0**), dan hijau lagi di `main` sesudah *merge*.

Semua yang kamu jalankan di Praktik 2 dan 3 kini dijalankan robot di setiap *pull request*: pemeriksaan otomatis yang dijanjikan lipatan *ESLint dan Prettier …* di [🔬 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#-bedah-teknis-opsional). Robotnya satu berkas, `.github/workflows/ci.yml`, yang kamu susun dalam lima tahap (A, lalu B1–B4) sampai Praktik 9. Tahap A berisi dua *job* pertama di peta [Konsep 3](#3-ci-robot-yang-membaca-kode-keluar): `periksa` dan `uji`. Versi proyek tetap 1.5.0 dan 1.4.0 sampai Praktik 6.

#### 4.1 ⭐ `.github/workflows/ci.yml` tahap A: *job* `periksa` dan `uji` (15 menit)

Di VS Code, buat folder `workflows` di dalam `.github/` (bila belum ada), lalu berkas `ci.yml` di dalamnya. Tempel blok ini apa adanya, termasuk komentar dan spasi di depan baris (spasi = makna, Konsep 3), lalu simpan dengan **Ctrl + S**:

```yaml
# ci.yml - robot pemeriksa dan pemasang Rumah Pintar Mini (Modul 29). GitHub Actions membaca berkas ini sendiri.
#
#   Setiap pull request ke main : periksa dan uji (bersamaan) -> bangun (image dicoba dibangun, TIDAK dikirim ke mana pun)
#   Setiap push ke main (= PR di-merge): periksa dan uji -> bangun + kirim image ke GHCR -> staging (gladi resik di mesin
#                                 robot) -> tandai-rilis (tag v<versi>) -> pasang-vps (lewat SSH)
# Job yang merah menghentikan semua job sesudahnya. Pi tidak dihubungi dari sini (GitHub tidak bisa mengetuk Pi di balik
# router): Pi memasang rilis bertanda itu sendiri setiap 15 menit (skrip/systemd/rumahpintar-perbarui.timer).
#
# Nama job periksa, uji, dan bangun = nama "status check" yang diwajibkan aturan cabang main (Settings -> Branches).
# Mengganti nama job berarti aturan cabangnya juga harus diganti.
# Setelan di GitHub (Settings -> Secrets and variables -> Actions), hanya untuk jalur dengan VPS:
#   Variables: VPS_HOST         alamat VPS; kosong = job pasang-vps dilewati (jalur gratis, jalur tanpa VPS)
#              VPS_USER         pengguna di VPS; kosong = rumah
#              VPS_KNOWN_HOSTS  sidik kunci host VPS (hasil ssh-keyscan yang sudah kamu cocokkan); bukan rahasia
#   Secrets  : VPS_KUNCI_SSH    kunci privat KHUSUS robot; di VPS kunci ini hanya bisa menjalankan skrip/pasang.sh
# Repo publik = log robot bisa dibaca siapa pun: jangan pernah mencetak rahasia (echo, set -x).
name: ci

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

# Izin bawaan token robot (GITHUB_TOKEN) untuk SEMUA job: hanya membaca isi repo. Job yang butuh lebih menulis izinnya
# sendiri di bawah (bangun: kirim image; staging: tarik image; tandai-rilis: buat tag). Izin yang tidak disebut = tidak ada.
permissions:
  contents: read

# Dua push beruntun ke cabang PR yang sama: run yang lama dibatalkan (yang penting hanya yang terbaru). Di main run yang
# SEDANG berjalan tidak pernah dibatalkan, jadi dua pemasangan tidak pernah berjalan bersamaan. Yang boleh MENUNGGU hanya
# satu: merge ketiga yang datang saat satu run berjalan dan satu menunggu membatalkan run yang menunggu (abu-abu,
# "cancelled"). Aman: run terbaru membawa semua perubahan sebelumnya dan merilis versinya sendiri.
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  # ---------------------------------------------------------------------------------------------------------------------
  # periksa: yang murah dan cepat dulu. Satpam versi, firmware, lalu cek tipe, lint, tes frontend, build, audit library.
  # ---------------------------------------------------------------------------------------------------------------------
  periksa:
    name: periksa
    runs-on: ubuntu-24.04                        # ditulis persis (bukan ubuntu-latest): tidak berubah diam-diam
    container: node:24.22.1-alpine3.24           # Node yang SAMA dengan Dockerfile backend dan dashboard
    timeout-minutes: 15                          # bawaan GitHub 360 menit: job yang macet dihentikan jauh lebih cepat
    steps:
      # image Node Alpine tidak membawa git (checkout, cek-versi) dan tar lengkap (simpanan npm)
      - run: apk add --no-cache git tar
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0                         # riwayat lengkap: cek-versi membandingkan dengan main
      # di dalam wadah, folder repo milik pengguna lain: tanpa baris ini git menolak bekerja di sana
      - run: git config --global --add safe.directory "$GITHUB_WORKSPACE"
      # Berkas .bin, folder build/, dan kunci.h bisa berisi kunci ESP-NOW. Robot = alarm yang TERLAMBAT: di repo publik,
      # kunci yang sudah ter-push wajib diganti, tidak cukup dihapus dari Git. :(glob) = ** berarti folder berapa pun
      # (juga nol), icase = .BIN juga.
      - name: firmware - sakelar uji Modul 28 mati, tanpa .bin, build/, atau kunci.h di Git
        run: |
          if ! grep -q '^const int UJI_KUNCI_SALAH = 0;' firmware/node-1-rumah/konfigurasi.h; then
            echo "GAGAL  firmware/node-1-rumah/konfigurasi.h: UJI_KUNCI_SALAH harus 0 di kode yang di-commit (Modul 28)"
            exit 1
          fi
          bin=$(git ls-files ':(glob,icase)**/*.bin' ':(glob)firmware/**/build/**' ':(glob)**/kunci.h')
          if [ -n "$bin" ]; then
            echo "GAGAL  berkas firmware atau kunci ikut Git (bisa berisi kunci ESP-NOW): $bin"
            exit 1
          fi
          echo "LULUS  UJI_KUNCI_SALAH = 0, tidak ada berkas .bin, folder build/, atau kunci.h di Git"
      - name: simpanan npm (unduhan library dipakai ulang selama package-lock.json sama)
        uses: actions/cache@v6
        with:
          path: ~/.npm
          key: npm-periksa-${{ hashFiles('backend/package-lock.json', 'frontend/package-lock.json') }}
          restore-keys: npm-periksa-
      - name: backend - cek tipe, lint, audit
        working-directory: backend
        run: |
          npm ci
          npm run cek
          npm run lint
          npm audit --omit=dev --audit-level=high
      - name: frontend - lint, tes, cek skema, build, audit
        working-directory: frontend
        run: |
          npm ci
          npm run lint
          npm test
          npm run cek-skema
          npm run build
          npm audit --omit=dev --audit-level=high

  # ---------------------------------------------------------------------------------------------------------------------
  # uji: 203 unit test + 20 integration test dengan database uji sungguhan (berjalan bersamaan dengan periksa)
  # ---------------------------------------------------------------------------------------------------------------------
  uji:
    name: uji
    runs-on: ubuntu-24.04
    container: node:24.22.1-alpine3.24
    timeout-minutes: 15
    services:
      # Database UJI sekali pakai: image yang sama dengan produksi (migrasi 002-005 butuh TimescaleDB), kosong setiap kali
      # job ini mulai, dibuang sesudahnya. Dari wadah job, alamatnya = nama layanan ini (db), seperti di Docker Compose.
      db:
        image: timescale/timescaledb:2.30.2-pg17
        env:
          POSTGRES_PASSWORD: uji-bukan-rahasia    # bukan rahasia: database ini hanya hidup beberapa menit di mesin robot
          POSTGRES_DB: rumahpintar_uji            # berakhiran _uji: tes integrasi menolak nama database lain
          TIMESCALEDB_TELEMETRY: "off"
        options: >-
          --health-cmd "pg_isready -h 127.0.0.1 -U postgres -d rumahpintar_uji"
          --health-interval 5s --health-timeout 3s --health-retries 30
    env:
      DATABASE_URL_UJI: postgres://postgres:uji-bukan-rahasia@db:5432/rumahpintar_uji
      # src/config/env.ts memeriksa SEMUA setelan, juga saat hanya menjalankan migrasi: isi nilai uji yang sah. Bukan rahasia
      # sungguhan; tes integrasi sendiri menimpanya lagi dengan nilai acak.
      MQTT_URL: mqtt://127.0.0.1:1
      JWT_SECRET: uji-robot-bukan-rahasia-sungguhan-0123456789
    steps:
      - run: apk add --no-cache git tar
      - uses: actions/checkout@v7
      - name: simpanan npm
        uses: actions/cache@v6
        with:
          path: ~/.npm
          key: npm-uji-${{ hashFiles('backend/package-lock.json') }}
          restore-keys: npm-uji-
      - name: pasang library
        working-directory: backend
        run: npm ci
      - name: migrasi database uji dua kali (kali kedua harus "0 migrasi baru diterapkan")
        working-directory: backend
        run: |
          DATABASE_URL="$DATABASE_URL_UJI" node src/db/migrasi.ts
          DATABASE_URL="$DATABASE_URL_UJI" node src/db/migrasi.ts > "$RUNNER_TEMP/migrasi-kedua.txt"
          cat "$RUNNER_TEMP/migrasi-kedua.txt"
          grep -q '^0 migrasi baru diterapkan' "$RUNNER_TEMP/migrasi-kedua.txt"
      # npm test MELEWATI (skipped) tes integrasi bila DATABASE_URL_UJI kosong, juga tes yang ditandai .skip, dan kode
      # keluarnya tetap 0. Di laptop itu boleh; di robot tidak: satu tes yang dilewati pun membuat job ini merah.
      - name: unit test + integration test (database uji); tes yang dilewati = merah
        working-directory: backend
        run: |
          set -o pipefail
          npm test 2>&1 | tee "$RUNNER_TEMP/tes.txt"
          if grep -q skipped "$RUNNER_TEMP/tes.txt"; then
            echo "GAGAL  ada tes yang dilewati (skipped): di robot semua tes wajib jalan, juga 20 integration test"
            echo "       (DATABASE_URL_UJI di env: job uji terisi? tes yang ditandai .skip?)"
            exit 1
          fi
```

Blok ini = baris 1–54 dan 62–157 berkas akhir [`kode/.github/workflows/ci.yml`](kode/.github/workflows/ci.yml), yang kamu capai di Praktik 9. Sisanya kamu sisipkan bertahap: langkah `versi` di bawah baris `safe.directory` ([6.6](#66--tahap-b1-langkah-versi-di-job-periksa-2-menit)), lalu di bawah *job* `uji`: `bangun` ([7.3](#73--tahap-b2-job-bangun-untuk-linuxamd64-dan-linuxarm64-8-menit)), `staging` ([8.2](#82--tahap-b3-job-staging-dengan-rahasia-acak-dan-lemari-kosong-10-menit)), `tandai-rilis` dan `pasang-vps` ([9.1](#91--tahap-b4-bagian-1-job-tandai-rilis-5-menit)–[9.2](#92--tahap-b4-bagian-2-job-pasang-vps-yang-masih-tidur-5-menit)). Jangan menyalin berkas akhirnya sekarang: ia memanggil skrip yang baru datang di Praktik 6–9. Komentarnya adalah pelajaran; tambahannya:

| Bagian | Tambahannya |
| :-- | :-- |
| komentar baris 1–16 dan kepala *job* `periksa` | gambaran robot lengkap, termasuk satpam versi (6.6) dan *job* yang baru datang di Praktik 7–9 |
| `on:` | dua pemicu Konsep 3, tanpa filter `paths`: *workflow* yang dilewati filter membuat *check* wajib menunggu selamanya ([Konsep 11](#11-aturan-cabang-palang-di-depan-main)) |
| `permissions`, `concurrency` | izin token robot per *job* ada di [Konsep 6](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables); *run* PR lama yang belum selesai dibatalkan *push* baru (4.4) |
| `safe.directory` | tanpa baris ini `git` menolak bekerja (robot tiruan penulis): `fatal: detected dubious ownership in repository at '/__w/rumah-pintar-mini/rumah-pintar-mini'` |
| `firmware - …` | butir templat PR Modul 28 (sakelar uji, berkas `.bin`), kini diperiksa robot |
| `backend - …`, `frontend - …` | perintah yang biasa kamu ketik di laptop, didahului `npm ci` ([Konsep 4](#4-lint--test--build-gagal-cepat)) |
| *job* `uji` | database uji 3.1 menjadi layanan `db` (`--health-cmd`: robot menunggu sampai `pg_isready` lulus), lalu migrasi dua kali dan 223 tes; satu tes `skipped` = merah |

**Kamu lulus langkah ⭐ ini** kalau `.github/workflows/ci.yml` berisi blok di atas dengan spasi apa adanya: dua *job*, `periksa` dan `uji`.

#### 4.2 ⭐ *Commit*, *push*, dan buka PR A: dua *check* berjalan bersamaan (5 menit)

> [!NOTE]
> **Belum direkam penulis:** layar GitHub di 4.2–4.5 (tombol, tab **Checks** dan **Actions**, nama *check*) dari dokumen GitHub (dibaca 5 November 2026). Tahap A yang sama dijalankan apa adanya oleh robot tiruan penulis; angka waktunya contoh di Raspberry Pi 5, bukan waktu GitHub.

```text
git add .github/workflows/ci.yml
git commit -m "feat: robot pemeriksa (ci.yml: periksa dan uji)"
git push -u origin fitur/uji-robot
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
 * [new branch]      fitur/uji-robot -> fitur/uji-robot
branch 'fitur/uji-robot' set up to track 'origin/fitur/uji-robot'.
```

Ketiga *commit* Praktik 2–4 kini di GitHub. Buka PR A seperti [KC Langkah 3](#langkah-3--commit-push-dan-buka-pull-request-centang-hijau-di-tab-checks-4-menit), dengan judul `Uji otomatis: lint, Vitest frontend, 20 integration test, dan robot pemeriksa` dan templat deskripsi yang diisi seperti biasa, lalu buka tab **Checks**.

**Yang tampil di GitHub (dari dokumen GitHub, belum direkam penulis):** *workflow* `ci` dengan dua *check* yang mulai bersamaan, `ci / periksa (pull_request)` dan `ci / uji (pull_request)`: nama *workflow*, nama *job*, lalu pemicunya.

**Kamu lulus langkah ⭐ ini** kalau tab **Checks** PR A menyebut dua *check* dari *workflow* `ci`: `periksa` dan `uji`.

#### 4.3 ⭐ Baca log robot: `periksa` dan `uji` dengan 223 tes (8 menit)

Tunggu sampai keduanya selesai, lalu klik `periksa`: setiap `- run:` atau `- uses:` di `ci.yml` = satu langkah di log, berjudul `name:`-nya (atau perintah/*action*-nya, bila tanpa `name:`), diapit langkah buatan robot. Buka satu per satu, lalu `uji`.

**Hasilnya (lab penulis, robot tiruan, 4 November 2026; *job* `periksa`, baris bermakna):**

```text
LULUS  UJI_KUNCI_SALAH = 0, tidak ada berkas .bin, folder build/, atau kunci.h di Git
added 227 packages, and audited 228 packages in 15s
Found 0 warnings and 0 errors.
Finished in 124ms on 77 files with 83 rules using 4 threads.
4 moderate severity vulnerabilities
added 441 packages, and audited 442 packages in 43s
Found 0 warnings and 0 errors.
Finished in 355ms on 62 files with 116 rules using 4 threads.
 Test Files  3 passed (3)
      Tests  5 passed (5)
SAMA  src/skema/kontrak.ts
SAMA  src/skema/aturan-dasar.ts
✓ 1717 modules transformed.
PWA v2.0.0
found 0 vulnerabilities
```

Urutannya = urutan baris `run:`: firmware, backend (`npm ci`, `cek` tanpa keluaran, *lint*, audit yang tetap hijau), lalu frontend (`npm ci`, *lint*, 5 tes, dua `SAMA`, *build*, audit). `PWA v2.0.0` = versi paket `vite-plugin-pwa`, bukan versi dashboard-mu, yang di log yang sama masih `rumah-pintar-mini-frontend@1.4.0`.

**Hasilnya (lab penulis, robot tiruan; *job* `uji`, dipotong):**

```text
9 migrasi baru diterapkan, 0 sudah ada sebelumnya.
0 migrasi baru diterapkan, 9 sudah ada sebelumnya.
 Test Files  31 passed (31)
      Tests  223 passed (223)
   Start at  01:17:28
```

Di atas `Test Files` ada 31 baris `✓ src/…`, satu per berkas tes; tidak ada `skipped`, jadi penjaga diam. `Start at` berjam UTC (08.17 WIB). Di robot tiruan penulis, `periksa` 118 detik bersamaan dengan `uji` 80 detik: *run* 120 detik (contoh). Warna log dibuang di sini. Merah padahal kodemu benar? [🚨](#-kalau-tidak-jalan), kelompok **Robot merah di `periksa`** dan **Robot merah di `uji`**.

**Kamu lulus langkah ⭐ ini** kalau log `uji` menulis `Tests  223 passed (223)` tanpa baris `GAGAL`, dan kamu bisa menunjuk langkah tempat 5 tes frontend berjalan.

#### 4.4 ⭐ L0: sengaja merah sekali, lalu semua hijau (8 menit)

Ulangi kesalahan [2.4](#24--sengaja-merah-sekali-jamwib-tanpa-zona-waktu-lalu-hijau-lagi-4-menit): di `frontend/src/waktu.ts` baris 25, hapus `, { timeZone: "Asia/Jakarta" }`, simpan, lalu:

```text
git commit -am "coba: jamWib tanpa timeZone (sengaja merah)"
git push
```

*Push* baru = *run* baru; *run* 4.3-mu sudah selesai, jadi tidak dibatalkan `concurrency` (penulis mendorong sebelum *run*-nya selesai: `cancelled` di robot tiruan). `periksa` kini merah di langkah `frontend - lint, tes, cek skema, build, audit`; `uji` tetap hijau di mesinnya sendiri.

**Hasilnya (lab penulis, robot tiruan; langkah itu, dipotong):**

```text
AssertionError: expected '09.27.10 WIB' to be '16.27.10 WIB' // Object.is equality
 ❯ src/waktu.test.ts:19:46
      Tests  1 failed | 4 passed (5)
##[error]Process completed with exit code 1.
```

Blok `run:` berhenti di perintah pertama yang gagal, jadi `cek-skema`, *build*, dan audit frontend tidak berjalan. Karena robot menyetel `GITHUB_ACTIONS=true`, Vitest juga mencetak perintah `::error` berisi berkas dan baris tes itu; menurut dokumen GitHub, perintah itu menjadi anotasi di halaman *run*. Kembalikan dengan *commit* baru yang membalik *commit* terakhir:

```text
git revert --no-edit HEAD
git push
```

**Hasilnya (lab penulis, laptop; baris pertama):** `[fitur/uji-robot <sha>] Revert "coba: jamWib tanpa timeZone (sengaja merah)"`. *Run* berikutnya hijau di kedua *check*, seperti 4.3. Itulah syarat **L0**: robot memeriksa *pull request*-mu, dan ke-223 tes benar-benar berjalan.

**Kamu lulus langkah ⭐ ini** kalau `periksa` sempat merah karena `AssertionError`, lalu sesudah `git revert` kedua *check* PR A hijau dan `uji` menulis `Tests  223 passed (223)`.

#### 4.5 ⭐ *Merge* PR A, lalu robot berjalan lagi di `main` (4 menit)

*Merge* PR A seperti [Praktik 8 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#praktik-8--git-untuk-tim-branch-pull-request-dan-review-45-menit): **Merge pull request** (pilihan **Create a merge commit**) → **Confirm merge** → **Delete branch**. Aturan cabang belum ada, jadi saat ini tombol itu tetap bisa ditekan walau robot merah; Praktik 5 mengubahnya. Di laptop:

```text
git switch main
git pull --prune
git branch -d fitur/uji-robot
```

**Hasilnya (lab penulis, laptop; baris terakhir):** `Deleted branch fitur/uji-robot (was <sha>).`

*Merge* = *push* ke `main`, jadi robot berjalan lagi: tab **Actions**, *run* teratas *workflow* `ci` (pemicu `push`) hijau di `periksa` dan `uji` (robot tiruan penulis: 105 detik). Kedua *check* kini pernah lulus di repomu, syarat untuk mewajibkannya di Praktik 5 ([Konsep 11](#11-aturan-cabang-palang-di-depan-main): dalam 7 hari terakhir).

> 🔀 **Repo privat:** setiap *run* memotong kuota menit bulanan.

**Kamu lulus langkah ⭐ ini** kalau `main` di laptop berisi `.github/workflows/ci.yml` dan *run* `push` teratas di tab **Actions** hijau di `periksa` dan `uji`.

> ⬆️ **Selesai Praktik 4?** Baca [Konsep 11](#11-aturan-cabang-palang-di-depan-main), lalu lanjut ke [Praktik 5](#praktik-5--aturan-cabang-pr-merah-tidak-bisa-di-merge-20-menit): aturan cabang yang menolak PR merah, juga untukmu sebagai pemilik repo.

### Praktik 5 — Aturan cabang: PR merah tidak bisa di-*merge* (20 menit)

> 🖥️ **Alat yang dipakai:** **GitHub** di browser (**Settings** → **Branches**, tab **Pull requests** dan **Checks**); **VS Code** di laptop, terminal di **akar proyek**. VPS dan Pi tidak disentuh. Konsep yang dipakai: 11.
>
> ⭐ **Wajib kecuali repo privat** — langkah 5.1 sampai 5.4: aturan klasik untuk `main` dengan empat setelan; *push* langsung ke `main` ditolak, dan PR `coba/merah` yang tesnya merah tidak bisa di-*merge*, juga olehmu (syarat **L1**).

Sejak [4.5](#45--merge-pr-a-lalu-robot-berjalan-lagi-di-main-4-menit), `periksa` dan `uji` pernah lulus di `main`, jadi keduanya kini bisa diwajibkan. Palang dari [Konsep 11](#11-aturan-cabang-palang-di-depan-main) dipasang sekali lewat layar setelan GitHub, tanpa berkas; ubahan tesnya hanya di cabang buangan `coba/merah`.

> [!NOTE]
> **Belum direkam penulis:** layar GitHub di 5.1–5.4 (tombol, kotak centang, kotak *merge*) dari dokumen GitHub (dibaca 5 November 2026); gambarnya rekonstruksi di Konsep 11. Aturan yang setara dicoba penulis di *forge* tiruan, pengganti GitHub di lab penulis: *push* langsung ke `main` ditolak, dan PR merah tidak bisa di-*merge*, juga oleh admin. Teks layarnya bukan teks GitHub ([🔬](#-bedah-teknis-opsional) *Bagaimana penulis menguji …*); log tesnya dari robot tiruan penulis.

> 🔀 **Repo privat:** menurut dokumen GitHub, di akun gratis aturan cabang hanya tersedia untuk repo publik. Lewati Praktik 5; syarat **L1** baru bisa dicapai dengan repo publik atau paket berbayar.

#### 5.1 ⭐ Aturan klasik untuk `main` di Settings → Branches: empat setelan (8 menit)

Langkahnya dari dokumen GitHub *Managing a branch protection rule*:

1. Di halaman repo `rumah-pintar-mini`, klik **Settings** (tidak terlihat? buka menu tarik-turun di deretan tab, lalu klik **Settings**).
2. Di bilah samping, bagian **Code, planning, and automation**, klik **Branches**.
3. Di bawah **Branch protection rules**, klik **Add classic branch protection rule** (aturan klasik, bukan *ruleset*: Konsep 11).
4. Di kolom **Branch name pattern**, ketik `main`.
5. Centang **Require a pull request before merging**, lalu pastikan **Require approvals** di bawahnya tidak tercentang (hapus centangnya bila ada): persetujuan 0, karena kamu tidak bisa menyetujui PR-mu sendiri.
6. Centang **Require status checks to pass before merging**, lalu pastikan **Require branches to be up to date before merging** ikut tercentang (menurut dokumen GitHub, itu bawaannya). Di kolom pencarian di bawahnya, ketik `periksa` dan pilih *check*-nya, lalu `uji`. `bangun` menyusul di [7.6](#76--bangun-masuk-aturan-cabang-tiga-check-wajib-4-menit), sesudah pertama kali berjalan di PR B.
7. Centang **Do not allow bypassing the above settings**. Setelan lain biarkan seperti bawaannya.
8. Klik **Create**.

Jangan lewatkan langkah 7. Menurut dokumen GitHub, tanpa centang itu aturan cabang tidak berlaku untuk admin repo, dan pemilik repo adalah admin: PR merah tetap bisa kamu *merge*. `periksa` atau `uji` tidak muncul di pencarian? *Check* wajib harus pernah lulus dalam 7 hari terakhir; kalau 4.5 sudah lebih lama dari itu, buka [🚨](#-kalau-tidak-jalan), kelompok **Aturan cabang**.

**Kamu lulus langkah ⭐ ini** kalau **Settings** → **Branches** memuat satu aturan untuk `main`, dan sesudah klik **Edit** di sebelahnya, keempat setelan tampak tercentang dengan *check* wajib `periksa` dan `uji`, sedangkan **Require approvals** tidak tercentang.

#### 5.2 ⭐ *Push* langsung ke `main` ditolak (3 menit)

Bukti pertama: kamu sendiri pun tidak bisa lagi melewati PR. Di terminal laptop, pastikan `git status` bersih (semua perubahan sudah di-*commit*), lalu:

```text
git switch main
git pull
git switch -c coba/merah
```

Di `backend/src/integrasi/perangkat.test.ts` baris 37 (tes pertama, [3.4](#34--enam-berkas-integration-test-lalu-baca-perangkattestts-10-menit)), ubah `toBe(201)` menjadi `toBe(200)`, simpan, lalu coba kirim *commit*-nya langsung ke `main`:

```text
git commit -am "coba: tes integrasi sengaja merah"
git push origin coba/merah:main
```

`coba/merah:main` berarti "kirim isi cabang `coba/merah` di laptop ke cabang `main` di GitHub", jalan pintas tanpa PR. GitHub menolaknya, dan Git keluar dengan kode `1`; baris terakhirnya `error: failed to push some refs to …` (bentuk umum Git, sama di *forge* tiruan penulis). Di atasnya GitHub menulis alasannya. Menurut contoh di dokumen GitHub (*Troubleshooting required status checks*, dibaca 5 November 2026), bunyinya kira-kira `remote: error: GH006: Protected branch update failed for refs/heads/main.`, disusul satu baris sebab. `main` di GitHub tidak berubah; *commit* tadi tetap di cabang `coba/merah` di laptop.

*Push*-nya malah diterima, tanpa baris `error:`? Aturan belum mengikatmu, misalnya karena langkah 7 di 5.1 terlewat, dan tes merah kini ada di `main`. Betulkan aturannya dulu ([🚨](#-kalau-tidak-jalan) *PR merah masih bisa di-merge …*), lalu kembalikan `main` lewat PR berisi *commit* pembaliknya (bukan `git push --force`, yang menimpa riwayat):

```text
git switch main
git pull
git switch -c balik/merah
git revert --no-edit HEAD
git push -u origin balik/merah
```

Buka PR-nya, *merge* sesudah hijau, lalu hapus cabangnya seperti [4.5](#45--merge-pr-a-lalu-robot-berjalan-lagi-di-main-4-menit), tetapi baris terakhir di laptop menjadi `git branch -D coba/merah balik/merah`. Sesudah itu ulangi 5.2 dari awal.

**Kamu lulus langkah ⭐ ini** kalau *push* itu ditolak dan *commit* terbaru `main` di GitHub bukan `coba: tes integrasi sengaja merah`.

#### 5.3 ⭐ L1: PR `coba/merah` merah, tombol *merge* terkunci (6 menit)

Kini lewat jalan yang benar:

```text
git push -u origin coba/merah
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
 * [new branch]      coba/merah -> coba/merah
branch 'coba/merah' set up to track 'origin/coba/merah'.
```

Buka *pull request* seperti [KC Langkah 3](#langkah-3--commit-push-dan-buka-pull-request-centang-hijau-di-tab-checks-4-menit), dengan judul `coba merah (jangan di-merge)`. Robot berjalan: `periksa` hijau, `uji` merah. Buka log `uji` di tab **Checks**.

**Hasilnya (lab penulis, robot tiruan; *job* `uji`, dipotong):**

```text
     × POST /devices: kunci tampil sekali, database hanya menyimpan sidik SHA-256-nya (CHECK kunci_hash) 236ms
AssertionError: expected 201 to be 200 // Object.is equality
 ❯ src/integrasi/perangkat.test.ts:37:30
 Test Files  1 failed | 30 passed (31)
      Tests  1 failed | 222 passed (223)
##[error]Process completed with exit code 1.
```

Satu dari 223 tes merah sudah cukup untuk membuat *job* `uji` merah (79 detik di robot tiruan penulis, contoh). Buka lagi PR-nya dari tab **Pull requests**, lalu gulir ke kotak *merge* di bagian bawah.

**Yang tampil di GitHub (dari dokumen GitHub, belum direkam penulis):** *check* wajib yang gagal membuat PR tidak bisa di-*merge*, dan berkat **Do not allow bypassing the above settings**, larangan itu berlaku juga untuk admin repo, yaitu kamu: tidak ada pilihan untuk melewatinya. Bunyi persis kotak *merge*-nya tidak dikutip dokumen; bentuknya kira-kira seperti rekonstruksi di [Konsep 11](#11-aturan-cabang-palang-di-depan-main). Tombol **Merge pull request** masih bisa ditekan, atau ada pilihan untuk tetap *merge*? Langkah 7 di 5.1 terlewat: [🚨](#-kalau-tidak-jalan) *PR merah masih bisa di-merge …*.

Bersama penolakan di 5.2, inilah syarat **L1**: PR yang tesnya gagal tidak bisa di-*merge*, dan `main` tidak bisa diubah tanpa PR, juga oleh pemilik repo.

**Kamu lulus langkah ⭐ ini** kalau `uji` di PR `coba/merah` merah dan kotak *merge*-nya menolak tanpa pilihan untuk melewati aturan.

#### 5.4 ⭐ Tutup PR tanpa *merge*, lalu hapus cabang `coba/merah` (3 menit)

Tutup PR seperti [KC Langkah 5](#langkah-5--tutup-pull-request-tanpa-merge-lalu-hapus-cabangnya-2-menit): **Close pull request**, lalu **Delete branch**. Di laptop:

```text
git switch main
git pull --prune
git branch -D coba/merah
```

**Hasilnya (lab penulis, laptop; baris terakhir):** `Deleted branch coba/merah (was <sha>).`

`-D` berhuruf besar karena cabang ini memang tidak pernah di-*merge*; `toBe(200)` ikut hilang bersamanya. Aturan cabang adalah setelan GitHub, bukan berkas, jadi Praktik 5 tidak mengubah berkas apa pun di `main`. Mulai sekarang setiap perubahan, juga milikmu, masuk lewat PR yang hijau.

**Kamu lulus langkah ⭐ ini** kalau PR `coba/merah` tertutup tanpa *merge*, cabangnya hilang di GitHub dan di laptop, dan aturan `main` tetap ada di **Settings** → **Branches**.

> ⬆️ **Selesai Praktik 5?** Baca [Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur), lalu lanjut ke [Praktik 6](#praktik-6--satu-nomor-versi-200-satpam-versi-changelogmd-dan-versi-di-layar-30-menit): satu nomor versi 2.0.0 di cabang baru `fitur/pipeline`.

### Praktik 6 — Satu nomor versi 2.0.0, satpam versi, `CHANGELOG.md`, dan versi di layar (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, cabang baru `fitur/pipeline`, terminal di **akar proyek** (sebentar di `backend` dan `frontend`). Tanpa Docker; VPS dan Pi tidak disentuh. Konsep yang dipakai: 10.
>
> ⭐ **Wajib** — langkah 6.1 sampai 6.7: satu nomor 2.0.0 di 10 tempat dan di layar dashboard, `CHANGELOG.md` pertama, dan satpam versi yang menulis `LULUS`, lalu `GAGAL` saat satu nomor sengaja beda.

Praktik 6–9 mengisi **PR B**, yang dibuka di 7.4. Backend 1.5.0 dan dashboard 1.4.0 menjadi satu nomor, 2.0.0, yang dijaga satpam versi di laptop dan di robot ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)). Di PowerShell (tidak diuji penulis), ganti `echo "kode keluar: $?"` dengan `"kode keluar: $LASTEXITCODE"`.

#### 6.1 ⭐ Cabang `fitur/pipeline` dan tiga baris `.gitattributes` (3 menit)

Di terminal laptop:

```text
git switch main
git pull
git switch -c fitur/pipeline
```

Tanpa akun GitHub (belum diuji penulis): ganti `git pull` (gagal tanpa `origin`) dengan `git merge fitur/uji-robot` supaya `main` memuat Praktik 2–3.

Minggu ini datang tiga jenis berkas baru yang dibaca program di Linux: `.mjs` (satpam versi) serta `.service` dan `.timer` (systemd di Pi). Ganti isi `.gitattributes` di akar proyek dengan [berkas kode](kode/.gitattributes) (**Copy raw file**); yang baru tiga baris terakhir dan komentarnya:

```text
*.mjs text eol=lf
*.service text eol=lf
*.timer text eol=lf
```

Git menyimpan dan menulis berkas itu dengan akhir baris LF, juga di Windows. Aturannya dipasang sebelum berkasnya dibuat, supaya LF sejak `git add` pertama.

**Kamu lulus langkah ⭐ ini** kalau cabangmu `fitur/pipeline` dan `.gitattributes` berakhir dengan tiga baris di atas.

#### 6.2 ⭐ Satu nomor 2.0.0: `npm version`, tiga baris `image:`, dan `.env.example` (6 menit)

Naikkan nomor di kedua folder dengan perintah dari [8.2 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#82-backend-v100-7-menit):

```text
cd backend
npm version 2.0.0 --no-git-tag-version
cd ../frontend
npm version 2.0.0 --no-git-tag-version
cd ..
```

**Hasilnya (lab penulis, laptop):** `v2.0.0`, sekali per folder; yang berubah enam baris: `"version"` di setiap `package.json` dan dua tempat di setiap `package-lock.json`. Tanpa *commit* dan *tag*: *tag* `v2.0.0` dibuat robot (Praktik 9). Kode backend tidak perlu diubah: sejak Praktik 3, `/health` dan `/docs` membaca nomornya dari `package.json`.

Ganti isi `compose.cloud.yml` dengan [berkas kode](kode/compose.cloud.yml) (**Copy raw file**). Tiga baris `image:` (baris 210 `migrasi`, 227 `backend`, 263 `web`) kini bertag sama, dan komentarnya menulis cara baru: robot membangun, VPS dan Pi hanya menarik.

```yaml
    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-backend:2.0.0
# …
    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-backend:2.0.0
# …
    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-web:2.0.0
```

Tidak ada layanan atau setelan `.env` baru. Ganti juga [`.env.example`](kode/.env.example) (**Copy raw file**); yang baru hanya komentar di atas `TOKO_IMAGE`: toko tempat VPS dan Pi menarik harus sama persis dengan toko tempat robot mengirim, `ghcr.io/<akun huruf kecil>` (Praktik 10).

**Kamu lulus langkah ⭐ ini** kalau kedua `package.json` menulis `"version": "2.0.0"` dan ketiga baris `image:` berakhir `:2.0.0`.

#### 6.3 ⭐ Versi di layar: `__VERSI_WEB__` dari `package.json` (5 menit)

Nomor yang terpasang tampil di bawah judul dashboard. Ganti isi `frontend/vite.config.ts` dengan [berkas kode](kode/frontend/vite.config.ts) (**Copy raw file**). Intinya dua baris:

```ts
const paket: { version: string } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
// …
  define: { __VERSI_WEB__: JSON.stringify(paket.version) },
```

Setiap kali Vite berjalan (`npm run dev`, `npm run build`, `npm test`), ia membaca `package.json` dan mengganti setiap `__VERSI_WEB__` di kode dashboard dengan `"2.0.0"`. Supaya TypeScript mengenal nama itu, klik kanan folder **`src`** di `frontend` → **New File…** → `versi.d.ts`:

```ts
// versi.d.ts - Modul 29: memberi tahu TypeScript bahwa __VERSI_WEB__ ada. Isinya (misalnya "2.0.0") ditulis Vite saat build
// dan saat npm run dev dari "version" di package.json (define di vite.config.ts), jadi tidak tertulis di berkas mana pun di src/.
declare const __VERSI_WEB__: string;
```

Lalu ganti [`src/halaman/Masuk.tsx`](kode/frontend/src/halaman/Masuk.tsx) dan [`src/components/TataLetak.tsx`](kode/frontend/src/components/TataLetak.tsx) (**Copy raw file**). Keduanya mendapat baris yang sama tepat di bawah judul: `<p className="text-xs text-slate-500 dark:text-slate-400">v{__VERSI_WEB__}</p>`. Di kepala dashboard (`TataLetak.tsx`), judul dan versi dibungkus satu `<div>`: di lebar 375 px, versi dan lencana `Menyambung ulang…` di samping judul membuat judulnya terlipat (lab penulis). Di terminal `frontend` (`cd frontend`), jalankan `npm run lint`, `npm test`, lalu `npm run build`.

**Hasilnya (lab penulis, laptop; dipotong):**

```text
Found 0 warnings and 0 errors.
Finished in 259ms on 63 files with 116 rules using 4 threads.
 Test Files  3 passed (3)
      Tests  5 passed (5)
✓ 1717 modules transformed.
PWA v2.0.0
```

63 berkas = 59 di 2.2, tiga berkas tes, dan `versi.d.ts`. `PWA v2.0.0` tetap versi paket `vite-plugin-pwa` (2.3), bukan nomormu. Di layar produksi: `v2.0.0` di [10.1](#101--terakhir-kali-ssh-untuk-memasang-sh-skrippasangsh-menarik-200-10-menit), `v2.0.1` di [12.4](#124--l2-robot-memasang-vps-layar-masuk-menulis-v201-8-menit). Kembali ke akar proyek (`cd ..`).

**Kamu lulus langkah ⭐ ini** kalau ketiga perintah di `frontend` selesai tanpa galat.

#### 6.4 ⭐ Satpam versi `skrip/cek-versi.mjs`: satu nomor di 10 tempat, hanya boleh naik (5 menit)

Satpamnya satu berkas JavaScript yang dijalankan Node.js langsung, tanpa paket npm. Klik kanan folder **`skrip`** di akar proyek → **New File…** → `cek-versi.mjs`, lalu tempel isi [berkas kode](kode/skrip/cek-versi.mjs) (**Copy raw file**). Kepalanya = cara pakai:

```js
//   node skrip/cek-versi.mjs                     -> nomor versi SAMA di semua tempat?
//   BASIS=origin/main node skrip/cek-versi.mjs   -> + dibanding cabang tujuan (BASIS, ambil dulu dengan git fetch): kalau yang
//                                                   DIPASANG di VPS/Pi berubah, versinya sudah naik (SemVer)?
//   PowerShell: $env:BASIS = "origin/main"; node skrip/cek-versi.mjs   (sesudahnya: Remove-Item Env:BASIS)
```

Bagian 1 skrip mengumpulkan nomor dari 10 tempat: dua `package.json`, dua tempat di setiap *lock*, tiga baris `image:`, dan entri rilis teratas `CHANGELOG.md` (6.5). Satu yang beda = `GAGAL` beserta tabel semua tempat; nomor pra-rilis seperti `2.1.0-rc.1` juga ditolak. Bagian 2 (hanya bila `BASIS` diisi) membandingkan cabangmu dengan `main`:

```js
  const dipasang = berubah.filter(ikutDipasang);
  // …
  if (!naik && versi !== versiBasis) {
  // …
  } else if (dipasang.length > 0 && !naik) {
    salah.push(`yang dipasang di VPS/Pi berubah (${contoh}) tetapi versinya masih ${versi} (= ${basis}). Tanpa versi baru, `
```

Nomor yang lebih kecil daripada di `main` = `GAGAL` ([13.1](#131-tombol-revert-di-pr-c-satpam-versi-menolak-versi-turun-5-menit)); berkas yang **dipasang** berubah, tetapi nomornya tidak naik = `GAGAL` ([12.1](#121--cabang-perbaikanteks-masuk-satu-teks-di-layar-masuk-satpam-versi-menolak-4-menit)). Daftar "yang dipasang" ada di fungsi `ikutDipasang()`, sama dengan Konsep 10. Bagian ini bisa kamu tulis sendiri di [🧩 Tingkat 2](#tingkat-2--satpam-versi-bagian-versi-wajib-naik-yang-masih-kosong-isi-bagian-rumpang-30-menit).

**Kamu lulus langkah ⭐ ini** kalau `skrip/cek-versi.mjs` ada dan kamu bisa menunjuk kedua aturan bagian 2 di atas.

#### 6.5 ⭐ `CHANGELOG.md`: buku catatan perubahan untuk manusia (4 menit)

Buat `CHANGELOG.md` di akar proyek dari [berkas kode](kode/CHANGELOG.md) (**Copy raw file**), lalu ganti `2026-11-04` dengan tanggal hari ini, tetap tahun-bulan-hari:

```markdown
## [Belum Dirilis]

## [2.0.0] - 2026-11-04

Rumah Pintar Mini v2.0: pipeline produksi (Modul 29). MAYOR karena cara MEMASANG berubah, bukan API-nya: VPS dan Pi jalur
gratis tidak lagi membangun image sendiri, melainkan menarik image buatan robot untuk dua jenis prosesor; Pi memperbarui
dirinya lewat systemd timer; cabang `main` dijaga aturan cabang.

### Ditambahkan
<!-- … -->
```

Kepalanya (dibuang di sini) menulis aturan main. `## [Belum Dirilis]` kosong dulu; di bawahnya satu bagian per rilis: alasan MAYOR, lalu `### Ditambahkan` dan `### Diubah`, ditulis untuk orang yang memasang, bukan daftar *commit*. Satpam membaca baris `## [2.0.0] - <tanggal>` persis: tanggal berbentuk lain, misalnya `4-11-2026`, dijawab `GAGAL  CHANGELOG.md: belum ada entri rilis berbentuk "## [x.y.z] - YYYY-MM-DD"` (bunyi kode). Bagian `## [2.0.0]` ini pula yang menjadi isi *tag* `v2.0.0` ([9.6](#96--tag-pertama-v200-isinya-catatan-changelog-versi-itu-3-menit)).

**Kamu lulus langkah ⭐ ini** kalau `CHANGELOG.md` di akar proyek memuat `## [Belum Dirilis]` di atas `## [2.0.0] - <tanggalmu>`.

#### 6.6 ⭐ Tahap B1: langkah `versi` di *job* `periksa` (2 menit)

Buka `.github/workflows/ci.yml` dari [4.1](#41--githubworkflowsciyml-tahap-a-job-periksa-dan-uji-15-menit). Di *job* `periksa`, tempel tujuh baris ini tepat di bawah baris `safe.directory` dan di atas komentar `# Berkas .bin, …`, dengan spasi apa adanya:

```yaml
      - name: versi - satu nomor di semua tempat; yang dipasang berubah = versi naik
        run: |
          if [ "$GITHUB_EVENT_NAME" = pull_request ]; then
            BASIS="origin/$GITHUB_BASE_REF" node skrip/cek-versi.mjs
          else
            node skrip/cek-versi.mjs
          fi
```

Di *pull request*, GitHub mengisi `GITHUB_BASE_REF` dengan `main`: robot menjalankan kedua bagian, seperti `BASIS=origin/main` di laptop. Di *push* ke `main` hanya bagian 1: aturan "naik" sudah dijaga di PR. Langkah ini sengaja paling depan, sebelum `npm ci`: nomor yang lupa naik langsung merah ([Konsep 4](#4-lint--test--build-gagal-cepat)). Tanpa baris `safe.directory`, satpam di PR berhenti `GAGAL  origin/main tidak bisa dibandingkan dengan HEAD: …` ([🚨](#-kalau-tidak-jalan), kelompok **Robot merah di `periksa`**).

**Kamu lulus langkah ⭐ ini** kalau langkah `versi - …` ada di antara baris `safe.directory` dan langkah `firmware - …`, sejajar dengan `- run:` di atasnya.

#### 6.7 ⭐ Satpam versi di laptop: `LULUS`, sengaja `GAGAL`, lalu *commit* (5 menit)

Satpam melihat perubahan lewat `git diff`, yang belum mengenal berkas baru sebelum di-`git add`. Di akar proyek, pastikan `git status --short` hanya menyebut berkas praktik ini, lalu:

```bash
node skrip/cek-versi.mjs
git add -A
git fetch
BASIS=origin/main node skrip/cek-versi.mjs; echo "kode keluar: $?"
```

PowerShell: baris terakhir seperti kepala skrip (6.4).

**Hasilnya (lab penulis, laptop):**

```text
LULUS  satu nomor versi 2.0.0 di 10 tempat (package.json, package-lock.json, compose.cloud.yml, CHANGELOG.md)
LULUS  satu nomor versi 2.0.0 di 10 tempat (package.json, package-lock.json, compose.cloud.yml, CHANGELOG.md); dibanding origin/main (1.5.0): versi naik, 9 berkas yang dipasang berubah
kode keluar: 0
```

Baris pertama = robot di *push*, baris kedua = robot di PR. Sembilan berkas yang dipasang: dua `package.json`, dua *lock*, `compose.cloud.yml`, dan empat berkas dashboard 6.3; `.gitattributes`, `.env.example`, `CHANGELOG.md`, `cek-versi.mjs`, dan `ci.yml` tidak. `git add -A` belum *commit*. Tanpa akun GitHub: `BASIS=main` (belum diuji penulis).

Sekarang sengaja beda: di `compose.cloud.yml` baris 263 (`web`), ganti `2.0.0` dengan `1.4.0`, simpan, lalu `node skrip/cek-versi.mjs; echo "kode keluar: $?"`.

**Hasilnya (lab penulis, laptop):**

```text
GAGAL  nomor versi harus SAMA di semua tempat ini, sekarang ada 2 nomor (2.0.0, 1.4.0):
         2.0.0  backend/package.json
         2.0.0  frontend/package.json
         2.0.0  backend/package-lock.json ("version")
         2.0.0  backend/package-lock.json (packages[""].version)
         2.0.0  frontend/package-lock.json ("version")
         2.0.0  frontend/package-lock.json (packages[""].version)
         2.0.0  compose.cloud.yml (image rumah-pintar-mini-backend)
         2.0.0  compose.cloud.yml (image rumah-pintar-mini-backend)
         1.4.0  compose.cloud.yml (image rumah-pintar-mini-web)
         2.0.0  CHANGELOG.md (entri rilis teratas)
       Naikkan bersama-sama: di folder backend dan frontend "npm version <versi> --no-git-tag-version"
       (package.json + package-lock.json), tiga baris image di compose.cloud.yml, dan entri
       "## [<versi>] - <tanggal>" di CHANGELOG.md.
kode keluar: 1
```

Tabelnya menunjuk tempat yang beda (dua baris backend = `migrasi` dan `backend`), dan tiga baris terakhirnya = resep menaikkan versi di [12.2](#122--versi-201-patch-di-10-tempat-dan-entri-changelogmd-5-menit) dan [13.2](#132-versi-202-berisi-isi-200-entri-201-tetap-tercatat-7-menit). Kembalikan `1.4.0` menjadi `2.0.0`, simpan, lalu ulangi `node skrip/cek-versi.mjs`: `LULUS` lagi (lab penulis). *Commit*:

```text
git add -A
git commit -m "feat: satu nomor versi 2.0.0, satpam versi, CHANGELOG"
```

Belum di-*push*: PR B dibuka di 7.4, sesudah *job* `bangun`.

**Kamu lulus langkah ⭐ ini** kalau satpam menulis `LULUS` (`9 berkas yang dipasang berubah`), lalu `GAGAL` dengan `kode keluar: 1`, lalu `LULUS` lagi, dan `git status --short` kosong sesudah *commit*.

> ⬆️ **Selesai Praktik 6?** Baca [Konsep 5](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi) dan [Konsep 6](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables), lalu lanjut ke [Praktik 7](#praktik-7--satu-image-dua-prosesor-dikirim-robot-ke-ghcr-35-menit).

### Praktik 7 — Satu *image* dua prosesor, dikirim robot ke GHCR (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, cabang `fitur/pipeline`, terminal di **akar proyek**; **GitHub** di browser (tab **Checks** PR B, **Settings** → **Branches**). VPS dan Pi tidak disentuh. Konsep yang dipakai: 5, 6.
>
> ⭐ **Wajib** — langkah 7.1 dan 7.3 sampai 7.6: *job* `bangun` membangun *image* dua prosesor di PR B tanpa mengirimnya, lalu menjadi *check* wajib ketiga.

#### 7.1 ⭐ Dua Dockerfile lintas-prosesor dengan `$BUILDPLATFORM` (8 menit)

Ganti seluruh isi [`backend/Dockerfile`](kode/backend/Dockerfile) dan [`frontend/Dockerfile`](kode/frontend/Dockerfile) lewat **Copy raw file**. Selain komentar, yang berubah di backend hanya ini (`-` lama, `+` baru):

```diff
-FROM node:24.22.1-alpine3.24 AS paket
+FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS paket
 # …
 RUN npm ci --omit=dev
+RUN mkdir -p /app/data-firmware
 # …
 FROM node:24.22.1-alpine3.24
 # …
-RUN mkdir -p /app/data-firmware && chown node:node /app/data-firmware
+COPY --from=paket --chown=node:node /app/data-firmware /app/data-firmware
```

Di frontend, hanya tahap `bangun`:

```diff
-FROM node:24.22.1-alpine3.24 AS bangun
+FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.24 AS bangun
```

`$BUILDPLATFORM` = prosesor mesin pembangun (robot GitHub: amd64): `npm ci` dan `npm run build` berjalan sekali di sana untuk dua prosesor (bcrypt membawa program jadi untuk keduanya), dan tahap akhir per prosesor tinggal `COPY`, jadi tanpa emulator ([Konsep 5](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi)).

**Kamu lulus langkah ⭐ ini** kalau tahap pertama kedua `Dockerfile` diawali `FROM --platform=$BUILDPLATFORM` dan tahap akhir backend tanpa `RUN`.

#### 7.2 Bangun di laptop untuk prosesormu sendiri (opsional, 4 menit)

`Dockerfile` baru tetap bisa dibangun di laptop (Docker menyala, `.env` laptop berisi setelan wajib), untuk prosesormu saja:

```text
docker compose build
```

Compose ikut membangun `migrasi` (cetakannya sama dengan `backend`), jadi percobaan pertama bisa berhenti dengan `image "…/rumah-pintar-mini-backend:2.0.0": already exists`; ulangi perintahnya ([🚨](#-kalau-tidak-jalan) *`docker compose build` pertama kali …*). **Jangan** `docker push` hasilnya: robot tidak menimpa *tag* `2.0.0` yang sudah ada, jadi *image* dua prosesornya batal dibuat.

#### 7.3 ⭐ Tahap B2: *job* `bangun` untuk `linux/amd64` dan `linux/arm64` (8 menit)

Di `ci.yml`, sisakan satu baris kosong di bawah baris terakhir *job* `uji` (`fi`), taruh kursor di kolom paling kiri, lalu tempel blok ini apa adanya (`bangun:` sejajar `uji:`):

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # bangun: satu image untuk dua jenis prosesor (amd64 = VPS, arm64 = Pi) tanpa emulasi: tahap Node di Dockerfile berjalan
  # di prosesor robot ($BUILDPLATFORM), tahap akhir hanya menyalin. Pull request: dibangun saja. Push ke main: dikirim ke GHCR.
  # ---------------------------------------------------------------------------------------------------------------------
  bangun:
    name: bangun
    needs: [periksa, uji]                        # hanya kalau keduanya hijau
    runs-on: ubuntu-24.04                        # mesin robot biasa (amd64) yang sudah membawa Docker dan buildx
    timeout-minutes: 30
    permissions:
      contents: read
      packages: write                            # token robot boleh mengirim image ke paket GHCR milik repo ini
    outputs:
      toko: ${{ steps.nama.outputs.toko }}
      versi: ${{ steps.nama.outputs.versi }}
      rilis-baru: ${{ steps.nama.outputs.rilis-baru }}
    steps:
      - uses: actions/checkout@v7
      - name: nama toko, versi, dan rilis baru atau bukan
        id: nama
        run: |
          # GHCR hanya menerima huruf kecil: ${GITHUB_REPOSITORY_OWNER,,} = nama akun pemilik repo dalam huruf kecil
          echo "toko=ghcr.io/${GITHUB_REPOSITORY_OWNER,,}" >> "$GITHUB_OUTPUT"
          # satu nomor untuk backend dan web (cek-versi di job periksa sudah memastikan keduanya sama)
          versi=$(node -p "require('./backend/package.json').version")
          echo "versi=$versi" >> "$GITHUB_OUTPUT"
          echo "pendek=${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"
          # tag v<versi> belum ada di GitHub = rilis baru (staging, tag, dan pasang hanya untuk rilis baru). Kode keluar 2 =
          # tag itu memang tidak ada; kode lain = GitHub tidak bisa ditanya: merah, jangan menebak
          if git ls-remote --exit-code --tags origin "refs/tags/v$versi" > /dev/null; then
            echo "rilis-baru=tidak" >> "$GITHUB_OUTPUT"
            echo "v$versi sudah dirilis: tidak ada rilis baru dari push ini"
          else
            kode=$?
            [ "$kode" = 2 ] || { echo "GAGAL  tag rilis di GitHub tidak bisa diperiksa (ls-remote, kode $kode)"; exit 1; }
            echo "rilis-baru=ya" >> "$GITHUB_OUTPUT"
          fi
      - uses: docker/setup-buildx-action@v4      # pembangun BuildKit: satu perintah untuk beberapa jenis prosesor
      - name: masuk ke GHCR (hanya saat push ke main)
        if: github.event_name == 'push'
        uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}  # token sementara buatan GitHub untuk job ini, bukan token pribadimu
      # Hanya untuk rilis BARU: versi yang sudah bertanda pasti sudah ada di toko (tag dibuat sesudah staging menariknya),
      # jadi push yang hanya mengubah dokumen tidak membangun dan tidak mengirim apa pun (langkah image di bawah ikut lewat).
      - name: sudah ada di toko? (tag versi tidak pernah ditimpa)
        id: ada
        if: github.event_name == 'push' && steps.nama.outputs.rilis-baru == 'ya'
        env:
          TOKO: ${{ steps.nama.outputs.toko }}
          VERSI: ${{ steps.nama.outputs.versi }}
        run: |
          for nama in backend web; do
            if docker buildx imagetools inspect "$TOKO/rumah-pintar-mini-$nama:$VERSI" > /dev/null 2>&1; then
              echo "$nama=ya" >> "$GITHUB_OUTPUT"
              echo "rumah-pintar-mini-$nama:$VERSI sudah ada di toko: tidak dibangun dan tidak dikirim ulang"
            else
              echo "$nama=tidak" >> "$GITHUB_OUTPUT"
            fi
          done
      # Indeks image juga memuat catatan asal-usul build (attestation, tertulis platform unknown/unknown): bukan image ketiga.
      - name: image backend (amd64 + arm64)
        if: github.event_name == 'pull_request' || steps.ada.outputs.backend == 'tidak'
        uses: docker/build-push-action@v7
        with:
          context: ./backend
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name == 'push' }}
          tags: |
            ${{ steps.nama.outputs.toko }}/rumah-pintar-mini-backend:${{ steps.nama.outputs.versi }}
            ${{ steps.nama.outputs.toko }}/rumah-pintar-mini-backend:sha-${{ steps.nama.outputs.pendek }}
          # menautkan paket GHCR ke repo ini (menimpa baris LABEL <akun> di Dockerfile)
          labels: org.opencontainers.image.source=${{ github.server_url }}/${{ github.repository }}
      - name: image web (amd64 + arm64)
        if: github.event_name == 'pull_request' || steps.ada.outputs.web == 'tidak'
        uses: docker/build-push-action@v7
        with:
          context: ./frontend
          build-args: VITE_API_BASE=/api           # sama dengan args di compose.cloud.yml dan handle_path di Caddyfile
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name == 'push' }}
          tags: |
            ${{ steps.nama.outputs.toko }}/rumah-pintar-mini-web:${{ steps.nama.outputs.versi }}
            ${{ steps.nama.outputs.toko }}/rumah-pintar-mini-web:sha-${{ steps.nama.outputs.pendek }}
          labels: org.opencontainers.image.source=${{ github.server_url }}/${{ github.repository }}
```

Berkasmu kini = baris 1–244 [berkas akhir](kode/.github/workflows/ci.yml). Komentarnya pelajaran (izin, toko huruf kecil, *tag* `sha-…`: Konsep 6). Di luar komentar: `${{ … }}` diisi GitHub sebelum langkah jalan (`$versi` diisi terminal robot); `if:` = langkah jalan hanya bila syaratnya benar; `toko=…` yang ditulis langkah `id: nama` ke `$GITHUB_OUTPUT` menjadi `steps.nama.outputs.toko`, dan `outputs` meneruskannya ke *job* Praktik 8–9; `pendek` = 7 huruf pertama *commit*.

**Kamu lulus langkah ⭐ ini** kalau `ci.yml` berisi tiga *job* dengan `bangun:` sejajar `uji:`.

#### 7.4 ⭐ *Commit*, *push*, dan buka PR B: `bangun` membangun tanpa mengirim (7 menit)

> [!NOTE]
> **Belum direkam penulis:** layar GitHub di 7.4–7.6 dari dokumen GitHub (dibaca 5 November 2026); berkasnya dijalankan robot tiruan penulis.

```text
git commit -am "feat: image dua prosesor tanpa emulasi (job bangun)"
git push -u origin fitur/pipeline
```

Buka PR B seperti PR A, judul `Pipeline 2.0.0: satu nomor versi, image dua prosesor, staging, rilis bertanda, dan pemasang`. Di tab **Checks**, `periksa` dan `uji` berjalan bersamaan, lalu *check* ketiga `ci / bangun (pull_request)` (nama dari dokumen GitHub). Di robot tiruan penulis, langkah `versi` kini menghitung 11 berkas yang dipasang berubah: 9 di 6.7 + dua `Dockerfile`.

**Hasilnya (lab penulis, robot tiruan; *job* `bangun`, *image* backend, dipotong):**

```text
#11 [linux/arm64 paket 4/5] RUN npm ci --omit=dev
#13 [linux/amd64 stage-1 3/7] COPY --from=paket /app/node_modules ./node_modules
#14 [linux/arm64 stage-1 3/7] COPY --from=paket /app/node_modules ./node_modules
```

`RUN` muncul sekali, untuk prosesor pembangun; `COPY` tahap akhir dua kali: dua *image* tanpa emulator. Mesin robot tiruan penulis arm64; di robot GitHub (amd64), tahap `paket` tertulis `linux/amd64` (belum direkam penulis). *Image* web sama. `WARNING: No output specified …` di akhir tiap *image* = hasilnya hanya di *cache* pembangun, tidak dikirim. Robot tiruan penulis: `bangun` 91 detik, *run* 208 detik (contoh, bukan waktu GitHub). Kenapa bukan emulasi atau *runner* ARM64: [🔬](#-bedah-teknis-opsional) *Tiga cara dua prosesor …*.

**Kamu lulus langkah ⭐ ini** kalau ketiga *check* PR B hijau dan log `bangun` memuat `COPY` tahap akhir untuk `linux/amd64` dan `linux/arm64`.

#### 7.5 ⭐ Dari PR tidak ada *image* yang dikirim ke GHCR (4 menit)

Di blok 7.3, syarat `github.event_name == 'push'` ada di langkah *login*, di langkah `sudah ada di toko? …`, dan di `push:` kedua `build-push-action`; dari PR, `push` bernilai `false`. Di log PR robot tiruan penulis, kedua langkah itu tidak muncul. Alasannya (Konsep 6): kiriman dari PR akan mengunci nomor versinya dengan kode yang belum di-*merge*, dan PR dari *fork* hanya mendapat token baca.

**Kamu lulus langkah ⭐ ini** kalau kamu bisa menunjuk ketiga syarat itu dan menyebut dua alasannya.

#### 7.6 ⭐ `bangun` masuk aturan cabang: tiga *check* wajib (4 menit)

> 🔀 **Repo privat:** tanpa aturan cabang (Praktik 5), jadi lewati 7.6.

`bangun` sudah pernah lulus (7.4), jadi kini bisa diwajibkan (dokumen GitHub *Managing a branch protection rule*):

1. **Settings** → **Branches** seperti [5.1](#51--aturan-klasik-untuk-main-di-settings--branches-empat-setelan-8-menit), lalu klik **Edit** di sebelah kanan aturan `main`.
2. Di bawah **Require status checks to pass before merging**, ketik `bangun` di kolom pencarian dan pilih *check*-nya.
3. Klik **Save changes**.

Ketiga *check* diwajibkan sendiri-sendiri karena *job* yang dilewati melapor lulus (Konsep 11): kalau `uji` merah, `bangun` dilewati. Setelan ini tanpa *commit*.

**Kamu lulus langkah ⭐ ini** kalau aturan `main` mewajibkan `periksa`, `uji`, dan `bangun`.

> ⬆️ **Selesai Praktik 7?** Baca [Konsep 9](#9-staging-vs-produksi-gladi-resik-vs-pentas), lalu lanjut ke [Praktik 8](#praktik-8--staging-sekali-pakai-di-mesin-robot-25-menit): *staging* sekali pakai. PR B tetap terbuka sampai [9.5](#95--merge-pr-b-robot-mengirim-image-200-staging-lulus-tag-dibuat-8-menit).

### Praktik 8 — *Staging* sekali pakai di mesin robot (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, cabang `fitur/pipeline` (PR B masih terbuka sejak 7.4), terminal di **akar proyek**. Tanpa Docker; VPS dan Pi tidak disentuh. Konsep yang dipakai: 9.
>
> ⭐ **Wajib** — langkah 8.1 sampai 8.4: `skrip/uji-asap.sh` dan *job* `staging` ada di cabangmu, kamu bisa membaca log gladi yang merah, dan keduanya di-*commit*.

Tahap B3 menambah gladi resik dari [Konsep 9](#9-staging-vs-produksi-gladi-resik-vs-pentas) ke robot: rilis baru dinyalakan di mesin robot dengan data palsu, lalu diuji asap. Praktik ini hanya menyiapkan berkasnya.

#### 8.1 ⭐ Uji asap `skrip/uji-asap.sh`: empat pemeriksaan yang hanya membaca (6 menit)

Klik kanan folder **`skrip`** di akar proyek → **New File…** → `uji-asap.sh`, lalu tempel isi [berkas kode](kode/skrip/uji-asap.sh) (**Copy raw file**). Kepalanya menulis keempat pemeriksaan:

```sh
#   1. sesudah 15 detik tidak ada layanan yang jatuh bangun (Restarting). "up --wait" hanya bisa menunggu layanan yang punya
# …
#   2. backend dan web berjalan dengan image bertag versi itu
#   3. GET /health backend: "versi" = versi itu dan "database": true (/health tetap selalu 200; pemantau = Modul 30)
#   4. dashboard lewat Caddy: halaman utama, dan /api/health (Caddy meneruskan /api ke backend yang baru)
# Kode keluar 0 = LULUS semua; 1 = ada yang GAGAL, pesannya menyebut yang mana. Skrip ini hanya MEMBACA: tidak menyalakan,
# mematikan, atau mengubah apa pun.
```

Di bawahnya, setiap pemeriksaan hanya beberapa baris: (1) `sleep 15`, lalu `docker compose ps --status restarting` (layanan yang baru mogok sesudah ±10 detik berjalan bisa lolos); (2) kolom *image* dari `docker compose ps`; (3) `/health` ditanya dengan `node` dari DALAM kontainer backend, karena *image* Node tidak membawa `curl`; `"broker":false` hanya `PERINGATAN` (backend yang baru menyala bisa masih menyambung); (4) tanpa domain (*staging*, Pi jalur gratis), `wget` di dalam kontainer web bertanya ke Caddy; dengan domain (VPS), `curl --resolve` memakai HTTPS sungguhan ke mesin itu sendiri, tanpa DNS (belum direkam penulis). Bila semuanya lulus, keluarannya enam baris `LULUS`, ditutup `LULUS  uji asap versi <versi>` (9.5); yang gagal berhenti di baris `GAGAL  …` (8.3). Robot dan `skrip/pasang.sh` memanggilnya `sh skrip/uji-asap.sh <versi>`, jadi berkasnya tidak perlu ditandai bisa dijalankan.

**Kamu lulus langkah ⭐ ini** kalau `skrip/uji-asap.sh` ada di samping `cek-versi.mjs` dan kamu bisa menunjuk pemeriksaan yang menangkap layanan jatuh bangun walau `up --wait` menulis `Healthy`.

#### 8.2 ⭐ Tahap B3: *job* `staging` dengan rahasia acak dan lemari kosong (10 menit)

Buka `.github/workflows/ci.yml`. *Job* `bangun` dari 7.3 kini yang terakhir: tempel blok ini di akhir berkas, sesudah baris `labels:` milik *image* web, dipisah satu baris kosong. Spasi di depan baris apa adanya.

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # staging: gladi resik. compose.cloud.yml yang SAMA dengan VPS/Pi jalur gratis, image yang baru dikirim, database
  # kosong, dan rahasia acak sekali pakai, di mesin robot yang dibuang sesudahnya. Rilis yang gagal di sini tidak pernah
  # mendapat tag, jadi VPS dan Pi tidak pernah memasangnya. Yang dinyalakan di sini image amd64 (mesin robot = amd64):
  # image arm64 pertama kali menyala di Pi jalur gratis dan diperiksa uji asap skrip/pasang.sh di sana. Ini BUKAN
  # "staging" CA latihan Let's Encrypt di Modul 27.
  # ---------------------------------------------------------------------------------------------------------------------
  staging:
    name: staging
    needs: bangun
    if: github.event_name == 'push' && needs.bangun.outputs.rilis-baru == 'ya'
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    permissions:
      contents: read
      packages: read                             # menarik image yang baru dikirim, juga selama paketnya masih privat
    steps:
      - uses: actions/checkout@v7
      - uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: .env staging (rahasia acak, ikut dibuang bersama mesin ini) dan lemari riwayat kosong
        env:
          TOKO: ${{ needs.bangun.outputs.toko }}
        run: |
          # resep acak yang sama dengan kepala .env.example; nilainya tidak pernah dicetak
          acak() { node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"; }
          umask 077
          {
            echo "COMPOSE_FILE=compose.cloud.yml"
            echo "TOKO_IMAGE=$TOKO"
            # enam rahasia wajib di compose.cloud.yml (TOKO_IMAGE yang ketujuh, di atas)
            for nama in POSTGRES_PASSWORD JWT_SECRET MQTT_PASSWORD MOSQUITTO_DYNSEC_PASSWORD \
              GRAFANA_BACA_SANDI GRAFANA_ADMIN_SANDI; do
              echo "$nama=$(acak)"
            done
          } > .env
          docker volume create rumahpintar-data
          docker volume create rumahpintar-grafana-data
      - name: tarik image dan nyalakan, persis seperti di VPS dan Pi
        run: |
          docker compose pull --quiet
          docker compose up -d --no-build --wait --wait-timeout 300
      - name: uji asap
        env:
          VERSI: ${{ needs.bangun.outputs.versi }}
        run: sh skrip/uji-asap.sh "$VERSI"
      - name: keadaan layanan dan log (hanya bila ada yang gagal)
        if: failure()
        run: |
          docker compose ps -a
          docker compose logs --no-color --tail 40
```

Yang perlu kamu kenali di blok itu (alasannya di Konsep 9):

- `needs` dan `if`: berjalan sesudah `bangun` hijau, hanya pada *push* ke `main` dengan `rilis-baru` = `ya` (keluaran 7.3); *merge* tanpa versi baru, misalnya dokumen saja, tidak digladi.
- *Login* memakai `GITHUB_TOKEN` buatan GitHub untuk *job* itu, dengan izin baca saja (`packages: read`): tidak ada **Secrets** yang perlu kamu isi.
- `checkout` membawa `compose.cloud.yml`, berkas `edge/` dan `grafana/` yang dibaca layanan, serta uji asap dari *commit* yang sama.
- `.env` berisi `COMPOSE_FILE`, `TOKO_IMAGE`, dan enam rahasia acak yang tidak pernah dicetak ke log publik; setelan wajib baru kelak ditulis juga di sini. Dua `docker volume create` = lemari riwayat `external` yang dibuat sekali di setiap mesin baru.
- Tarik dan nyalakan = dua perintah yang sama dengan `skrip/pasang.sh` di VPS dan Pi; langkah terakhir hanya berjalan bila ada yang gagal (8.3).

Yang digladi varian amd64 (komentar di atas *job*), dan setiap gladi di GitHub menarik ±1,14 GB *image*; lamanya belum diukur penulis.

**Kamu lulus langkah ⭐ ini** kalau `ci.yml` berakhir di baris `docker compose logs --no-color --tail 40`, `staging:` sejajar dengan `bangun:`, dan kamu bisa menjelaskan kenapa `staging` tidak berjalan di PR B.

#### 8.3 ⭐ Yang ditangkap *staging*: broker salah tulis, tanpa *tag*, VPS dan Pi tidak tersentuh (5 menit)

Cukup dibaca; jangan ditiru di repomu. Rilis latihan penulis 2.0.5 mengganti baris 7 `edge/pusat.conf`, `listener 1883`, dengan `listener_salah_ketik 1883`. Di robot tiruan, PR-nya hijau karena baik satpam versi maupun tes tidak membaca isi konfigurasi broker; PR itu lalu di-*merge*.

**Hasilnya (lab penulis, robot tiruan; *job* `staging`, dipotong):**

```text
Container rumahpintar-mosquitto-1 Healthy
GAGAL  layanan jatuh bangun (Restarting): mosquitto -> docker compose logs <layanan>
rumahpintar-mosquitto-1   eclipse-mosquitto:2.1.2-alpine   …   Restarting (3) 17 seconds ago
mosquitto-1  | …: Error: Unknown configuration variable 'listener_salah_ketik'.
mosquitto-1  | …: Error found at /mosquitto/config/mosquitto.conf:7.
```

Baris pertama dari langkah tarik dan nyalakan: `up --wait` berkode `0` dan menulis `Healthy` untuk Mosquitto, yang tidak punya *healthcheck*. Baris kedua dari uji asap: kode `1`, *job* merah. Sisanya dari langkah log: statusnya (`(3)` = kode keluar terakhir Mosquitto) dan sebabnya, baris 7 `edge/pusat.conf`, yang di dalam kontainer bernama `mosquitto.conf`. Sesudah itu `tandai-rilis` dan `pasang-vps` (Praktik 9) dilewati: tanpa *tag* `v2.0.5`, "VPS" dan "Pi" tiruan tetap di 2.0.4, dan *image* 2.0.5 yang sudah dikirim `bangun` tidak pernah dipasang. *Staging*-mu merah? [🚨](#-kalau-tidak-jalan), kelompok ***Staging* merah**.

**Kamu lulus langkah ⭐ ini** kalau kamu bisa menunjuk langkah yang menangkap salah ketik itu dan menyebut kenapa VPS dan Pi tetap di rilis lama.

#### 8.4 ⭐ *Commit*: *staging* sungguhan pertama baru berjalan sesudah *merge* (2 menit)

```text
git add skrip/uji-asap.sh .github/workflows/ci.yml
git commit -m "feat: staging sekali pakai"
```

Belum di-*push*: *commit* Praktik 8 dan 9 dikirim bersama di 9.4. Di PR pun `staging` selalu dilewati, karena *image*-nya baru dikirim sesudah *merge*; gladi pertamamu berjalan di [9.5](#95--merge-pr-b-robot-mengirim-image-200-staging-lulus-tag-dibuat-8-menit), untuk rilis 2.0.0.

**Kamu lulus langkah ⭐ ini** kalau `git log -1 --oneline` berakhir `feat: staging sekali pakai` dan `git status --short` kosong.

#### 8.5 Uji asap dengan tangan: `sh skrip/uji-asap.sh` di VPS atau Pi (2 menit)

Sesudah Praktik 10 (VPS) atau 11 (Pi jalur gratis), skrip ini juga ada di mesin produksi, dan `skrip/pasang.sh` menjalankannya sesudah setiap pemasangan. Saat ragu, jalankan sendiri dari akar proyek di sana: `sh skrip/uji-asap.sh` (tanpa angka = versi di `backend/package.json`) atau `sh skrip/uji-asap.sh 2.0.1`; ia hanya membaca. Pi jalur utama (gerbang saja) tidak memakainya.

> ⬆️ **Selesai Praktik 8?** Baca [Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri) dan [Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12), lalu lanjut ke [Praktik 9](#praktik-9--rilis-pertama-200-tag-oleh-robot-pemasang-satu-skrip-dan-paket-publik-35-menit): rilis pertama 2.0.0.

### Praktik 9 — Rilis pertama 2.0.0: *tag* oleh robot, pemasang satu skrip, dan paket publik (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dan Docker di laptop, cabang `fitur/pipeline`, terminal di **akar proyek**; **GitHub** di browser. VPS dan Pi tidak disentuh. Konsep yang dipakai: 6, 7, 8, 10.
>
> ⭐ **Wajib** — langkah 9.1 sampai 9.7: rilis 2.0.0 dengan *tag* buatan robot dan paket GHCR publik.

#### 9.1 ⭐ Tahap B4, bagian 1: *job* `tandai-rilis` (5 menit)

Di `ci.yml`, sisakan satu baris kosong sesudah baris terakhir (`docker compose logs --no-color --tail 40`), lalu tempel apa adanya dari kolom paling kiri:

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # tandai-rilis: tag Git v<versi> pada commit ini = "rilis ini boleh dipasang". VPS dan Pi hanya mengikuti tag ini.
  # ---------------------------------------------------------------------------------------------------------------------
  tandai-rilis:
    name: tandai-rilis
    needs: [bangun, staging]
    if: github.event_name == 'push'              # pengaman kedua: pull request tidak pernah membuat tag
    runs-on: ubuntu-24.04
    timeout-minutes: 5
    permissions:
      contents: write                            # SATU-SATUNYA job yang boleh menulis ke repo: membuat tag
    steps:
      - uses: actions/checkout@v7
      - name: tag beranotasi v<versi>, isinya catatan versi itu dari CHANGELOG.md
        env:
          VERSI: ${{ needs.bangun.outputs.versi }}
        run: |
          tag="v$VERSI"
          if git ls-remote --exit-code --tags origin "refs/tags/$tag" > /dev/null; then
            echo "$tag sudah ada: dilewati (tag rilis tidak pernah dipindah)"
            exit 0
          fi
          {
            echo "Rumah Pintar Mini $VERSI"
            echo
            awk -v judul="## [$VERSI]" 'index($0, judul) == 1 { ambil = 1; next } /^## \[/ { ambil = 0 } ambil' CHANGELOG.md
          } > "$RUNNER_TEMP/catatan-rilis.txt"
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          # --cleanup=whitespace: baris "### Ditambahkan" dari CHANGELOG tetap ada (bawaannya, baris berawal # dibuang)
          git tag --annotate "$tag" --cleanup=whitespace --file "$RUNNER_TEMP/catatan-rilis.txt" "$GITHUB_SHA"
          git push origin "refs/tags/$tag"
          echo "$tag dibuat untuk commit $GITHUB_SHA"
```

*Tag* dibuat hanya sesudah `staging` lulus (`needs`) dan tidak pernah ditimpa. Isinya bagian versi itu dari `CHANGELOG.md`, sampai judul `## [` berikutnya (`awk`).

**Kamu lulus langkah ⭐ ini** kalau `tandai-rilis:` sejajar `staging:`.

#### 9.2 ⭐ Tahap B4, bagian 2: *job* `pasang-vps` yang masih tidur (5 menit)

Di bawah blok 9.1, sisakan satu baris kosong, lalu tempel blok terakhir dengan cara yang sama:

```yaml
  # ---------------------------------------------------------------------------------------------------------------------
  # pasang-vps: robot mengetuk VPS lewat SSH. Kunci robot di VPS hanya bisa menjalankan skrip/pasang.sh (command= di
  # authorized_keys): VPS sendiri yang mengambil tag terbaru lalu memasangnya. Robot hanya mengirim sebuah PENANDA dan
  # membaca laporan pasang.sh, jadi kunci yang lupa dibatasi membuat job ini merah, bukan hijau tanpa memasang apa pun.
  # ---------------------------------------------------------------------------------------------------------------------
  pasang-vps:
    name: pasang-vps
    needs: [bangun, tandai-rilis]                # bangun: nomor versi rilis ini (needs.bangun.outputs.versi)
    if: github.event_name == 'push' && vars.VPS_HOST != ''   # VPS_HOST kosong (jalur gratis, tanpa VPS) = dilewati
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    permissions: {}                              # tidak butuh token GitHub sama sekali
    concurrency: pasang-vps                      # satu pemasangan VPS pada satu waktu, juga saat run diulang tangan
    steps:
      - name: kunci robot dan sidik VPS
        env:
          KUNCI: ${{ secrets.VPS_KUNCI_SSH }}
          SIDIK_VPS: ${{ vars.VPS_KNOWN_HOSTS }}
        run: |
          umask 077
          mkdir -p ~/.ssh
          printf '%s\n' "$KUNCI" > ~/.ssh/kunci_robot
          printf '%s\n' "$SIDIK_VPS" > ~/.ssh/known_hosts
      - name: pasang rilis di VPS (lewat skrip/pasang.sh)
        env:
          TUJUAN: ${{ vars.VPS_USER || 'rumah' }}@${{ vars.VPS_HOST }}
          VERSI: ${{ needs.bangun.outputs.versi }}
        # -T: tanpa terminal; BatchMode: tidak pernah menanyakan sandi; StrictHostKeyChecking=yes: VPS yang sidiknya tidak
        # cocok dengan VPS_KNOWN_HOSTS ditolak (bukan "no"!); IdentitiesOnly: hanya kunci robot ini yang dicoba.
        # Kata terakhir = PENANDA, bukan perintah: dengan command= di authorized_keys, VPS mengabaikannya dan menjalankan
        # pasang.sh. TANPA command= (kunci belum dibatasi), VPS mencoba menjalankannya -> "command not found" -> merah.
        # Lalu laporan pasang.sh harus menyebut versi rilis ini terpasang. Run LAMA yang diulang sesudah ada rilis yang lebih
        # baru juga merah (VPS sudah di rilis lain): yang diulang selalu run terbaru.
        run: |
          set -o pipefail
          ssh -T -i ~/.ssh/kunci_robot -o BatchMode=yes -o StrictHostKeyChecking=yes -o IdentitiesOnly=yes \
            -o ConnectTimeout=20 -o ServerAliveInterval=30 "$TUJUAN" kunci-robot-belum-dibatasi-command \
            | tee "$RUNNER_TEMP/pasang.txt"
          grep -Eq "v$VERSI (terpasang|sudah terpasang)" "$RUNNER_TEMP/pasang.txt" \
            || { echo "GAGAL  VPS tidak melaporkan v$VERSI terpasang (baca laporan pasang.sh di atas)"; exit 1; }
```

*Job* ini tidur selama **Variables** `VPS_HOST` kosong ([10.6](#106--secrets-dan-variables-di-github-vps_kunci_ssh-vps_host-dan-vps_known_hosts-8-menit)): rilis 2.0.0 melewatinya; di jalur gratis selamanya. Penanda di akhir perintah `ssh`: [Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri). Berkasmu kini = [berkas akhir](kode/.github/workflows/ci.yml) (374 baris; ragu? timpa isinya lewat **Copy raw file**).

**Kamu lulus langkah ⭐ ini** kalau `ci.yml`-mu sama dengan berkas akhir: enam *job*.

#### 9.3 ⭐ Pemasang satu skrip: `skrip/pasang.sh` dan dua berkas unit (7 menit)

Klik kanan folder **`skrip`** → **New File…** → `pasang.sh`, lalu tempel isi [`kode/skrip/pasang.sh`](kode/skrip/pasang.sh) (**Copy raw file**). Dengan cara yang sama, dari [`kode/skrip/systemd/`](kode/skrip/systemd/), buat `systemd/rumahpintar-perbarui.service` dan `systemd/rumahpintar-perbarui.timer` (foldernya ikut dibuat; dipasang di 11.2). Ketiganya harus ikut rilis 2.0.0.

Skrip ini dijalankan di VPS (10.1) dan Pi dengan hak grup `docker`, setara root, jadi bacalah utuh, komentarnya juga; urutannya = diagram [Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12):

```sh
#!/bin/sh
# pasang.sh - Modul 29: pasang RILIS terbaru Rumah Pintar Mini di mesin ini. Satu skrip untuk VPS dan Pi:
#   VPS: dipanggil robot (job pasang-vps di .github/workflows/ci.yml) lewat SSH dengan kunci khusus. Baris kunci itu di
#        ~/.ssh/authorized_keys pengguna rumah membuatnya HANYA bisa menjalankan skrip ini, apa pun perintah yang dikirim:
#          restrict,command="sh /home/rumah/rumah-pintar-mini/skrip/pasang.sh" ssh-ed25519 AAAA... robot-pasang
#   Pi : dipanggil jam weker systemd setiap 15 menit (skrip/systemd/rumahpintar-perbarui.timer). GitHub tidak bisa mengetuk
#        Pi di balik router rumah, jadi Pi yang bertanya sendiri.
#   Tangan, dari akar proyek (sekali, saat beralih dari "membangun image sendiri" ke "menarik image buatan robot"):
#        sh skrip/pasang.sh
# Selalu dipanggil lewat "sh" oleh pemilik salinan repo (anggota grup docker), BUKAN dengan sudo. Berkas di repo tidak
# bertanda boleh-dijalankan, dan jangan di-chmod +x di VPS/Pi (Git menganggapnya suntingan, lalu skrip ini berhenti).
#
# RILIS = tag Git v<versi> (misalnya v2.0.1) di cabang main GitHub. Robot membuatnya SESUDAH image versi itu ada di GHCR dan
# lulus staging; tag yang tidak ada di main (misalnya dibuat tangan di cabang lain) diabaikan. Jadi mesin ini hanya memasang
# commit yang sudah diuji robot, dan tidak pernah menunggu image yang belum ada.
# Urutan: tag rilis terbaru -> majukan main ke tag itu (--ff-only) -> tarik image -> nyalakan ulang yang berubah
# (--no-build: mesin ini tidak pernah membangun image) -> restart broker bila konfigurasinya berubah -> uji asap.
# Gagal di langkah mana pun = berhenti dengan pesan GAGAL dan kode keluar 1. Gagal sebelum "up" (misalnya image belum bisa
# ditarik): kontainer lama tetap berjalan, tetapi salinan repo sudah di rilis baru, jadi berkas yang dibaca langsung dari
# repo (misalnya dashboard Grafana) bisa sudah berganti. Pi mengulang di putaran berikutnya (15 menit kemudian); VPS
# mengulang saat robot datang lagi (rilis berikutnya, atau Re-run failed jobs pada job pasang-vps), atau dengan
# sh skrip/pasang.sh di VPS. Skrip ini TIDAK PERNAH menjalankan down -v, prune, atau git reset --hard.
#
# Yang dipasang dipilih PASANG_BAGIAN (diisi berkas unit systemd; bawaan: pusat):
#   pusat           compose.cloud.yml di akar proyek: VPS (jalur utama), juga laptop
#   gerbang         edge/compose.edge.yml: Pi jalur utama (Pi = gerbang saja; image resmi Mosquitto + konfigurasi edge/)
#   pusat gerbang   keduanya: Pi jalur gratis (Pi = pusat + gerbang)
set -eu

jam() { date '+%Y-%m-%d %H:%M:%S %Z'; }
kabar() { echo "$(jam) $*"; }
gagal() { echo "$(jam) GAGAL: $*" >&2; exit 1; }

# Ada jalur ini yang berubah sejak rilis yang terpasang sebelumnya? (tanpa catatan rilis lama: dianggap tidak)
ada_yang_berubah() {
  [ -n "$lama_commit" ] && [ -n "$(git diff --name-only "$lama_commit" HEAD -- "$@")" ]
}

# Restart SEKALI per rilis: putaran yang mengulang sesudah uji asap gagal tidak me-restart layanan yang sama lagi (broker
# yang di-restart = semua perangkat putus sesaat). Catatannya (.git/rumahpintar-terpasang.restart) dihapus begitu rilis
# itu terpasang.
restart_sekali() { # restart_sekali <bagian> <layanan>
  if grep -qxF "$tag $1 $2" "$catatan.restart" 2> /dev/null; then
    kabar "$2 sudah di-restart untuk $tag: dilewati"
    return 0
  fi
  docker compose restart "$2" || gagal "restart $2 gagal: docker compose logs $2"
  echo "$tag $1 $2" >> "$catatan.restart"
}

pasang_pusat() {
  kabar "pusat: tarik image $tag (compose.cloud.yml)"
  docker compose pull --quiet || gagal "image untuk $tag belum bisa ditarik (sebabnya di pesan Docker di atas). Paket GHCR \
masih privat? TOKO_IMAGE di .env salah ketik atau berhuruf besar? Setelan wajib baru belum ada di .env? Kontainer lama \
tetap berjalan."
  docker compose up -d --no-build --wait --wait-timeout 300 || gagal "pusat gagal dinyalakan atau belum sehat (paling \
lama 5 menit): docker compose ps -a, lalu docker compose logs <layanan>"
  # Berkas yang dibaca kontainer langsung dari repo (bind mount): "up" tidak melihat isinya berubah, jadi layanan yang
  # membacanya di-restart di sini. backend dan web tidak perlu: tag image keduanya naik setiap rilis, jadi selalu dibuat
  # ulang.
  # (Broker pusat hanya memakai salah satu dari pusat.conf dan pusat-internet.conf, KONF_PUSAT di .env; ubahan berkas yang
  # tidak dipakai juga me-restartnya: sekali putus yang tidak perlu, tidak berbahaya.)
  if ada_yang_berubah edge/acl-broker edge/pusat.conf edge/pusat-internet.conf; then
    kabar "konfigurasi broker pusat berubah: restart mosquitto"
    restart_sekali pusat mosquitto
  fi
  if ada_yang_berubah grafana/provisioning; then
    kabar "provisioning Grafana berubah: restart grafana"
    restart_sekali pusat grafana
  fi
  sh skrip/uji-asap.sh "${tag#v}"
  docker compose ps --format 'table {{.Service}}\t{{.Image}}\t{{.Status}}'
}

pasang_gerbang() {
  # Gerbang tidak punya image buatan sendiri: yang diperbarui adalah image resmi bertag persis di edge/compose.edge.yml dan
  # konfigurasi broker dari repo. edge/jembatan/pusat.conf (sandi jembatan) tidak ikut Git: ubahannya tetap tangan.
  restart=tidak
  if ada_yang_berubah edge/gerbang.conf edge/acl-broker; then restart=ya; fi
  kabar "gerbang: tarik image $tag (edge/compose.edge.yml)"
  (
    cd edge
    docker compose pull --quiet || gagal "image gerbang belum bisa ditarik (sebabnya di pesan Docker di atas): internet? \
Setelan wajib baru belum ada di edge/.env? Kontainer lama tetap berjalan."
    docker compose up -d --no-build --wait --wait-timeout 120 \
      || gagal "gerbang gagal dinyalakan: docker compose ps -a dan docker compose logs mosquitto (folder edge)"
    if [ "$restart" = ya ]; then
      # restart, BUKAN kill -HUP: di gerbang, HUP membuang antrean simpan-teruskan yang belum terkirim ke pusat (Modul 27)
      kabar "konfigurasi broker gerbang berubah: restart mosquitto"
      restart_sekali gerbang mosquitto
    fi
    # up --wait tidak bisa menunggu Mosquitto (tanpa healthcheck): beri waktu 15 detik, lalu cari yang jatuh bangun. Broker
    # yang baru mogok sesudah ±10 detik berjalan bisa lolos (terlihat "running"); pemantau yang terus berjaga = Modul 30.
    sleep 15
    [ -z "$(docker compose ps --status restarting --format '{{.Service}}')" ] \
      || gagal "broker gerbang jatuh bangun (Restarting): docker compose logs mosquitto (folder edge)"
    echo "LULUS  gerbang: tidak ada layanan yang jatuh bangun (15 detik sesudah dinyalakan)"
    docker compose ps --format 'table {{.Service}}\t{{.Image}}\t{{.Status}}'
  )
}

pasang() {
  # Bukan root: git yang berjalan sebagai root meninggalkan berkas milik root di .git, lalu putaran berikutnya (timer,
  # robot) gagal menulis catatannya dan memasang ulang setiap kali.
  [ "$(id -u)" != 0 ] || gagal "jangan dijalankan dengan sudo atau sebagai root: jalankan sebagai pemilik salinan repo \
(anggota grup docker). Docker menolak tanpa sudo? Keluar lalu masuk lagi supaya grup docker berlaku."
  # akar proyek (folder di atas skrip/): compose.cloud.yml, .env, dan folder edge/
  cd "$(dirname "$0")/.."
  # "pusat gerbang", "pusat,gerbang", dan spasi ganda dianggap sama
  bagian=$(echo $(echo "${PASANG_BAGIAN:-pusat}" | tr ',' ' '))
  [ -n "$bagian" ] || gagal "PASANG_BAGIAN kosong; yang dikenal: pusat, gerbang, atau \"pusat gerbang\""
  for b in $bagian; do
    case "$b" in
      pusat|gerbang) ;;
      *) gagal "PASANG_BAGIAN berisi \"$b\"; yang dikenal: pusat, gerbang, atau \"pusat gerbang\"" ;;
    esac
  done
  # Catatan rilis terakhir yang BERHASIL dipasang skrip ini, di folder .git (tidak pernah ikut commit). Jalur lengkap, karena
  # bagian gerbang bekerja dari folder edge/.
  catatan="$(git rev-parse --absolute-git-dir)/rumahpintar-terpasang"

  # 1) Salinan repo di mesin ini: di cabang main dan tanpa suntingan. Ubahan selalu lewat pull request, bukan di VPS/Pi.
  cabang=$(git symbolic-ref --quiet --short HEAD || echo "(bukan cabang)")
  [ "$cabang" = main ] || gagal "salinan repo di mesin ini sedang di $cabang, bukan main: git switch main"
  kotor=$(git status --porcelain --untracked-files=no)
  [ -z "$kotor" ] || gagal "ada berkas yang disunting langsung di mesin ini (lihat: git diff):
$kotor
Ubah lewat pull request. Kembalikan berkas di sini dengan: git restore <berkas>"

  # 2) Tag rilis terbaru di main GitHub (repo publik: git fetch tanpa akun; --tags juga memperbarui origin/main).
  #    --merged origin/main = hanya tag yang ada di main; --sort=-v:refname = urut nomor versi, terbesar dulu
  git fetch --tags origin || gagal "tidak bisa mengambil tag dari GitHub: baca pesan git di atas (internet? alamat \
origin: git remote -v; tag rilis dipindah di GitHub: would clobber existing tag; berkas .git milik root: Permission denied)"
  tag=$(git tag --list 'v[0-9]*' --merged origin/main --sort=-v:refname | head -n 1)
  if [ -z "$tag" ]; then
    kabar "belum ada rilis (tag v<versi>) di GitHub: tidak ada yang dipasang"
    return 0
  fi
  terpasang=$(cat "$catatan" 2> /dev/null || true)
  if [ "$terpasang" = "$tag $bagian" ]; then
    kabar "$tag sudah terpasang ($bagian): tidak ada rilis baru"
    return 0
  fi
  lama=${terpasang%% *}
  kabar "memasang $tag ($bagian); sebelumnya: ${lama:-belum pernah lewat skrip ini}"

  # 3) Majukan main ke rilis itu. --ff-only = hanya maju lurus: main yang punya commit buatan mesin ini membuat skrip
  #    berhenti, dan main yang sudah di depan tag (sesudah git pull tangan) tidak dimundurkan. ^{commit} = commit tag itu.
  sebelum=$(git rev-parse HEAD)
  git merge --ff-only --quiet "$tag^{commit}" || gagal "main di mesin ini tidak bisa maju lurus ke $tag: baca pesan git di \
atas (commit yang dibuat di sini? berkas tak terlacak bernama sama dengan berkas baru rilis itu? git log --oneline -3)"
  # main yang sudah di DEPAN tag boleh, asal versinya sama (robot menjamin: yang dipasang berubah = versi naik). Versi lain =
  # salinan ini berisi versi yang belum dirilis (git pull tangan): tunggu tag-nya, jangan pasang yang belum lulus staging.
  versi_repo=$(sed -n 's/^  "version": "\([^"]*\)".*/\1/p' backend/package.json | head -n 1)
  [ "$versi_repo" = "${tag#v}" ] || gagal "salinan repo di mesin ini berisi versi $versi_repo, padahal rilis terbaru $tag \
(git pull tangan?). Tidak ada yang dipasang; putaran berikutnya memasangnya begitu robot membuat tag v$versi_repo."
  # Rilis ini membawa pasang.sh yang baru? Shell sudah membaca isi lamanya, jadi skrip dijalankan ulang SEKALI dengan isi
  # barunya (catatan rilis belum ditulis, jadi putaran ulang memasang rilis yang sama dari awal).
  if [ -z "${PASANG_ULANG:-}" ] && ! git diff --quiet "$sebelum" HEAD -- skrip/pasang.sh; then
    kabar "skrip/pasang.sh ikut berubah di $tag: dijalankan ulang dengan isi barunya"
    PASANG_ULANG=1
    export PASANG_ULANG
    exec sh skrip/pasang.sh
  fi
  lama_commit=""
  if [ -n "$lama" ]; then lama_commit=$(git rev-parse --quiet --verify "$lama^{commit}" || true); fi

  # 4) Pasang bagian-bagiannya; satu saja gagal = berhenti (catatan rilis tidak diperbarui, putaran berikutnya mengulang)
  for b in $bagian; do
    if [ "$b" = pusat ]; then pasang_pusat; else pasang_gerbang; fi
  done
  printf '%s\n' "$tag $bagian" > "$catatan"
  rm -f "$catatan.restart"
  kabar "${lama:-belum pernah} -> $tag terpasang ($bagian)"
}

# Fungsi di atas dibaca utuh dulu, baru dijalankan: git merge bisa mengganti berkas skrip ini sendiri di tengah jalan.
pasang "$@"; exit $?
```

Cari juga: `--merged origin/main` (*tag* tangan di cabang lain diabaikan), `restart_sekali`, dan `exec` (`pasang.sh` baru langsung dipakai).

**Kamu lulus langkah ⭐ ini** kalau ketiga berkas ada dan kamu bisa menunjuk baris yang menolak root dan yang memilih *tag*.

#### 9.4 ⭐ README dan templat *pull request*, lalu *commit* dan *push* (3 menit)

Ganti isi `backend/README.md`, `frontend/README.md`, `edge/README.md` (isi lagi tabelnya), dan `.github/pull_request_template.md` dengan berkasnya di [`kode/`](kode/) (**Copy raw file**; ringkasannya di ➕ F); README akar: tambahkan bagian Modul 29 seperti ➕ Modul 28. Lalu kirim *commit* Praktik 8 dan 9:

```text
git add -A
git commit -m "feat: rilis bertanda dan pemasang"
git push
```

**Kamu lulus langkah ⭐ ini** kalau ketiga *check* wajib PR B hijau; tiga *job* lain dilewati (ini PR, bukan *push*).

#### 9.5 ⭐ *Merge* PR B: robot mengirim *image* 2.0.0, *staging* lulus, *tag* dibuat (8 menit)

> [!NOTE]
> **Belum direkam penulis:** layar GitHub di 9.5–9.7 dari dokumen GitHub (dibaca 5 November 2026); berkas dan perintahnya dijalankan dengan robot tiruan dan toko *image* lokal.

*Merge* PR B dan hapus cabang `fitur/pipeline` seperti 4.5. Tab **Actions**, *run* `push` teratas: `periksa` dan `uji` → `bangun` (kini mengirim) → `staging` → `tandai-rilis`; `pasang-vps` dilewati.

**Hasilnya (lab penulis, robot tiruan; dipotong):**

```text
#23 pushing manifest for ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0@sha256:…
LULUS  tidak ada layanan yang jatuh bangun (15 detik sesudah dinyalakan)
LULUS  backend berjalan dengan ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0
LULUS  web berjalan dengan ghcr.io/<akun>/rumah-pintar-mini-web:2.0.0
LULUS  /health backend: {"ok":true,"versi":"2.0.0","broker":true,"database":true,"diterima":0,"ditolak":0,"diabaikan":0}
LULUS  dashboard dan /api/health lewat Caddy (http://127.0.0.1:80 (di dalam kontainer web))
LULUS  uji asap versi 2.0.0
 * [new tag]         v2.0.0 -> v2.0.0
v2.0.0 dibuat untuk commit <sha>
```

Enam `LULUS` = gladi resik pertamamu lulus ([8.4](#84--commit-staging-sungguhan-pertama-baru-berjalan-sesudah-merge-2-menit)). Robot tiruan di Raspberry Pi 5, *image* dasar lokal: *run* 4 menit 47 detik (contoh; GitHub belum diukur). *Tag* itu tidak memicu *run* baru: pemicu `push` di `ci.yml` hanya untuk cabang `main`. `bangun` merah `denied`? [🚨](#-kalau-tidak-jalan) *Kirim ke GHCR ditolak …*.

**Kamu lulus langkah ⭐ ini** kalau *run* `push` teratas hijau sampai `tandai-rilis`.

#### 9.6 ⭐ *Tag* pertama `v2.0.0`: isinya catatan `CHANGELOG` versi itu (3 menit)

Di GitHub: halaman repo → **Releases** (kanan daftar berkas) → **Tags**: ada `v2.0.0`. Di laptop:

```text
git fetch --tags
git show v2.0.0 --no-patch
```

**Hasilnya (lab penulis, laptop; dipotong):**

```text
tag v2.0.0
Tagger: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>

Rumah Pintar Mini 2.0.0
…
### Ditambahkan
```

Lalu menyusul bagian `## [2.0.0]` `CHANGELOG.md`-mu: inilah "`CHANGELOG` & *tag* versi pertama" di Silabus. *Tag* `v…` hanya buatan robot ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)).

**Kamu lulus langkah ⭐ ini** kalau `git show` menulis `Rumah Pintar Mini 2.0.0` dan catatan 2.0.0-mu.

#### 9.7 ⭐ Paket GHCR menjadi publik: tarik tanpa *login*, dua prosesor (4 menit)

Paket GHCR baru bisa privat ([Konsep 6](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables)), padahal VPS dan Pi menarik tanpa *login*. Publik itu selamanya; isinya hanya berkas repo publik dan library npm (bila ragu: `docker history --no-trunc` pada *image* 7.2, cara 10.3 Modul 26). Paket yang belum publik: halaman repo → **Packages** → paketnya → **Package settings** → **Change visibility** → **Public** → ketik namanya → **I understand the consequences, change package visibility**. Di laptop, tanpa *login*:

```text
docker pull ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0
docker buildx imagetools inspect ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0
```

**Hasilnya (lab penulis; toko *image* lokal tanpa sandi menggantikan paket publik; dipotong):**

```text
Status: Downloaded newer image for ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0
  Platform:    linux/amd64
  Platform:    linux/arm64
```

Dua prosesor; dua baris `unknown/unknown` sesudahnya = catatan asal-usul (Konsep 5). Ulangi untuk `rumah-pintar-mini-web`. `unauthorized` = masih privat ([🚨](#-kalau-tidak-jalan) *Tarik image ditolak …*).

> 🔀 **Repo privat:** paket tetap privat (isinya kodemu); VPS dan Pi menarik dengan token baca GHCR, belum diuji penulis.

**Kamu lulus langkah ⭐ ini** kalau kedua paket tertarik tanpa *login* (repo privat: sesudah *login*) dengan `linux/amd64` dan `linux/arm64`.

> ⬆️ **Selesai Praktik 9?** Lanjut: [Praktik 10](#praktik-10--vps-beralih-ke-menarik-kunci-robot-yang-hanya-bisa-satu-skrip-45-menit) (VPS); jalur gratis: [Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit) (Pi).

### Praktik 10 — VPS beralih ke menarik: kunci robot yang hanya bisa satu skrip (45 menit)

> 🖥️ **Alat yang dipakai:** **terminal SSH ke VPS** (`ssh rumah@203.0.113.10`, folder `~/rumah-pintar-mini`), **terminal laptop**, **Chrome**, dan **GitHub** di browser. Konsep yang dipakai: 7.
>
> ⭐ **Wajib untuk jalur utama dan tanpa Pi** — langkah 10.1 sampai 10.6: VPS menjalankan 2.0.0 yang ditarik dari GHCR, `whoami` lewat kunci robot dijawab `pasang.sh`, sidik VPS cocok, dan **Secrets** serta **Variables** robot terisi.

> 🔀 **Jalur gratis:** lewati praktik ini. Peralihan Pi-mu ada di [11.1](#111--git-pull-terakhir-dengan-tangan-di-pi-5-menit), dan `VPS_HOST` tidak pernah diisi.

Sejak [7.4 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#74-docker-compose-build-di-vps-sebelum-layanan-lain-menyala-12-menit), VPS membangun *image*-nya sendiri. Mulai sekarang ia **menarik** *image* buatan robot, dan robot mendapat kunci yang hanya bisa menjalankan `skrip/pasang.sh` ([Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri)). Urutannya penting: `pasang.sh` harus sudah ada di VPS (10.1) sebelum robot diberi alamatnya (10.6). Tanpa *commit*: berkas proyek tidak berubah. Ganti `203.0.113.10` dengan IP VPS-mu dan `<akun>` dengan akun GitHub-mu dalam huruf kecil.

#### 10.1 ⭐ Terakhir kali SSH untuk memasang: `sh skrip/pasang.sh` menarik 2.0.0 (10 menit)

Di terminal VPS:

```text
cd ~/rumah-pintar-mini
git status --short --branch
```

Hanya `## main...origin/main` = di `main` dan tanpa suntingan. Ambil isi `main` terbaru (repo publik: tanpa akun), lalu periksa toko *image* di `.env`:

```text
git pull
grep '^TOKO_IMAGE=' .env
```

Baris terakhir harus `TOKO_IMAGE=ghcr.io/<akun>`, huruf kecil (beda? betulkan dengan `nano .env`). Lalu pasang, selalu lewat `sh`, tanpa `sudo` dan tanpa `chmod +x` (isinya di [9.3](#93--pemasang-satu-skrip-skrippasangsh-dan-dua-berkas-unit-7-menit), alasannya di 10.8):

```text
sh skrip/pasang.sh
```

**Hasilnya (lab penulis, "VPS" tiruan; dipotong):**

```text
2026-11-04 01:49:30 UTC memasang v2.0.0 (pusat); sebelumnya: belum pernah lewat skrip ini
2026-11-04 01:49:30 UTC pusat: tarik image v2.0.0 (compose.cloud.yml)
 ✔ Image ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0 Pulled      4.3s
 ✔ Image ghcr.io/<akun>/rumah-pintar-mini-web:2.0.0     Pulled      1.4s
…
LULUS  dashboard dan /api/health lewat Caddy (http://127.0.0.1:80 (di dalam kontainer web))
LULUS  uji asap versi 2.0.0
backend     ghcr.io/<akun>/rumah-pintar-mini-backend:2.0.0   Up 22 seconds (healthy)
db          timescale/timescaledb:2.30.2-pg17                Up 51 minutes (healthy)
…
2026-11-04 01:50:02 UTC belum pernah -> v2.0.0 terpasang (pusat)
```

`Pulled` tanpa `Building`: *image* ditarik, tidak dibangun. Baris `…` = sisa kemajuan Compose dan empat baris `LULUS` lain. Hanya `migrasi`, `backend`, dan `web` yang dibuat ulang; database, broker, dan Grafana tetap `Up` (pemasangan pertama tidak me-*restart* apa pun). Stempel jam VPS = UTC (Modul 27): `01:49` = 08.49 WIB. Lab penulis: ±31 detik (contoh).

"VPS" tiruan penulis = kontainer arm64, HTTP lokal tanpa domain. Di VPS-mu baris Caddy menjadi `LULUS  dashboard dan /api/health lewat Caddy (https://iot.namaanda.my.id)` (teks skripnya; belum direkam penulis), dan yang ditarik varian amd64 (hingga ±97 MB), yang belum pernah dijalankan penulis ([Konsep 5](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi)). Gagal? [🚨](#-kalau-tidak-jalan), kelompok **`pasang.sh` di VPS atau Pi**.

**Data rumahmu tetap.** Ulangi sidik jari [1.3](#13--cadangan-sebelum-robot-memasang-pg_dump-docker-compose-cp-dan-sidik-jari-riwayat-4-menit): `akun` dan `perangkat` harus sama dengan catatanmu; `bacaan`, `sidik_jari`, dan `ringkasan` boleh bergerak (Node 1 terus mengirim). Di lab penulis, `docker compose logs migrasi` diakhiri `0 migrasi baru diterapkan, 9 sudah ada sebelumnya.`, dan dashboard sempat tidak menjawab `200` selama ±7,6 detik.

**Lihat tanpa terminal.** Di Chrome, buka `https://iot.namaanda.my.id` dan muat ulang **dua kali** (PWA, Modul 27): di bawah judul layar **Masuk** (atau judul kepala) kini tertulis `v2.0.0`. `/api/health` menulis `"versi":"2.0.0"`, dan `/api/docs` berlencana `2.0.0`, bukan `1.5.0`. Akun lamamu tetap bisa masuk. Gambar di bawah dari lab penulis (mesin tiruan); di layarmu alamat dan datanya milikmu.

![Komposit tangkapan layar asli Rumah Pintar Mini 2.0.0 di VPS tiruan (kontainer Docker-in-Docker di lab penulis; image dari robot dan toko tiruan), Chrome 156 di Linux, laptop 1280 piksel, mode terang; bilah alamat tidak tertangkap. Praktik 10.1, 4 Nov 2026 pukul 10.50 WIB, sesudah sh skrip/pasang.sh; alamat lab http://172.29.50.31 sama dengan https://iot.namaanda.my.id milikmu. Kiri atas: kartu layar Masuk dengan judul Rumah Pintar Mini, di bawahnya v2.0.0 (nomor 1), lalu Masuk dengan akun Modul 20 untuk melihat dashboard., kolom Email dan Sandi, tombol Masuk. Kanan atas: /api/health dibuka di peramban, kotak Pretty-print milik Chrome dan satu baris JSON: ok true, versi 2.0.0 (nomor 2), broker true, database true, diterima 5, ditolak 0, diabaikan 0. Bawah: bagian atas /api/docs (Swagger UI fastify): judul Rumah Pintar Mini API dengan lencana 2.0.0 (nomor 3) dan OAS 3.0, alamat http://172.29.50.31/api/docs/json, lalu uraian API panjang yang diakhiri kalimat bergaris bawah Sejak 2.0.0 (Modul 29): satu nomor versi untuk backend dan dashboard, dibaca dari package.json (angka di samping judul halaman ini), dan GET /health menyebut versi yang sedang berjalan. (nomor 4). Legenda bernomor di kanan atas: satu nomor yang sama terbaca di tiga tempat, termasuk sebelum masuk.](aset/health-dan-docs-versi.png)

Layar **Armada** (`/armada`, Modul 28) tetap menampilkan perangkat, versi firmware, dan rilismu; tombol **Perbarui** tidak perlu diklik.

![Komposit tangkapan layar asli layar Armada Rumah Pintar Mini 2.0.0 di VPS tiruan (kontainer Docker-in-Docker; image dari robot tiruan), Chrome 156 di Linux, laptop 1280 piksel, mode terang; bilah alamat tidak tertangkap. Praktik 10.1, 4 Nov 2026 pukul 10.50 WIB, kira-kira semenit sesudah sh skrip/pasang.sh; akun, perangkat, riwayat, dan rilis 1.7.1 dibuat saat VPS masih 1.5.0 (Modul 28). Kiri atas: kepala Rumah Pintar Mini dengan v2.0.0 di bawah judul (nomor 1), lencana Live, menu Perangkat, Peta, Aturan, Armada, Admin Rumah (admin), Keluar; ringkasan 1 perangkat aktif · rilis terbaru Node 1: 1.7.1 · 1 perlu diperbarui (nomor 2); kartu Latihan ruang tamu, Online, perlu diperbarui, Node 1 · ruang tamu · f00d00000001 · terakhir dilihat baru saja (nomor 3; simulator lewat Pi gerbang tiruan); kesehatan: versi firmware 1.7.0 → 1.7.1, menyala ulang karena POWERON, sinyal -45 dBm (sangat kuat), RAM 176 KB bebas, lama menyala 5 menit, vitals Rab, 4 Nov, 10.50 WIB (nomor 4); Perbarui ke versi 1.7.1 (terbaru) dengan tombol Perbarui, tidak diklik (nomor 5). Kiri bawah: rilis firmware Node 1 1.7.1 terbaru, 1.196.032 byte (61 % rak), diunggah Rab, 4 Nov, 10.36 WIB, sidik sha256 e60066a4…, Canary: 0 berhasil, 0 gagal atau rollback (nomor 6; berkas tiruan). Legenda bernomor di kanan.](aset/armada-tetap-jalan.png)

**Kamu lulus langkah ⭐ ini** kalau laporan `pasang.sh` diakhiri `belum pernah -> v2.0.0 terpasang (pusat)`, `/api/health` menulis `"versi":"2.0.0"`, dan `akun` serta `perangkat` sama dengan catatan 1.3.

#### 10.2 ⭐ Kunci robot di laptop: `~/.ssh/robot_rumah` tanpa frasa sandi (5 menit)

Ini kunci **kedua**, khusus robot; kunci pribadimu dari Modul 27 tidak disentuh. Di terminal laptop (Linux, macOS):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/robot_rumah -N "" -C robot-pasang
```

PowerShell (tidak diuji penulis): tanpa `-N ""`, lalu tekan **Enter** dua kali saat ditanya frasa sandi.

```powershell
ssh-keygen -t ed25519 -f "$HOME\.ssh\robot_rumah" -C robot-pasang
```

`-f`: berkas baru, kunci pribadimu tidak tertimpa; `-N ""`: tanpa frasa sandi, karena robot tidak bisa mengetiknya.

**Hasilnya (lab penulis, laptop; dipotong):**

```text
Your identification has been saved in /home/kamu/.ssh/robot_rumah
Your public key has been saved in /home/kamu/.ssh/robot_rumah.pub
The key fingerprint is:
SHA256:… robot-pasang
```

`robot_rumah` = kunci **privat**: jangan diperlihatkan ke orang lain, ditempel ke catatan, *chat*, atau AI, atau di-*commit*; tempatnya hanya **Secrets** (10.6). `robot_rumah.pub` = kunci publik untuk VPS.

**Kamu lulus langkah ⭐ ini** kalau `ls -l ~/.ssh/robot_rumah*` (PowerShell: `dir $HOME\.ssh\robot_*`) menulis dua berkas, dan yang tanpa `.pub` bertanda `-rw-------` (Linux, macOS).

#### 10.3 ⭐ Baris kunci robot di `authorized_keys` VPS: `restrict` dan `command`, ditulis sendiri (6 menit)

Di laptop, tampilkan kunci publik robot dengan `cat ~/.ssh/robot_rumah.pub` (PowerShell: `Get-Content $HOME\.ssh\robot_rumah.pub`), lalu salin barisnya. Di terminal VPS:

```text
nano ~/.ssh/authorized_keys
```

Baris kunci pribadimu jangan disentuh. Di baris baru di bawahnya, ketik awalan pembatas persis seperti blok di bawah (sampai `pasang.sh"` dan satu spasi), lalu tempel baris tadi di belakangnya (Windows: klik kanan; macOS: **Cmd + V**; Linux: **Ctrl + Shift + V**). Jadinya satu baris:

```text
restrict,command="sh /home/rumah/rumah-pintar-mini/skrip/pasang.sh" ssh-ed25519 AAAA… robot-pasang
```

Simpan (**Ctrl + O**, **Enter**), keluar (**Ctrl + X**). Jangan memakai `ssh-copy-id` seperti untuk kunci pribadimu di Modul 27: ia menambahkan kunci **tanpa** awalan, dan kunci robot tanpa awalan sama kuatnya dengan kuncimu. Biarkan jendela SSH ini terbuka sampai SSH-mu dari jendela baru tetap masuk, berjaga-jaga bila baris kuncimu ikut rusak.

**Kamu lulus langkah ⭐ ini** kalau `tail -n 1 ~/.ssh/authorized_keys` menulis baris itu, dengan isi `robot_rumah.pub` di tempat `AAAA…`.

#### 10.4 ⭐ Uji pembatas: `whoami` dijawab `pasang.sh`, bukan `rumah` (4 menit)

Dari terminal **laptop**, kirim `whoami` ("siapa saya?") lewat kunci robot:

```text
ssh -i ~/.ssh/robot_rumah rumah@203.0.113.10 whoami
```

**Hasilnya (lab penulis, SSH ke kontainer pengganti VPS):**

```text
2026-11-04 01:51:17 UTC v2.0.0 sudah terpasang (pusat): tidak ada rilis baru
```

`whoami` diabaikan; yang menjawab `pasang.sh`, dan karena 2.0.0 sudah terpasang, ia selesai tanpa menyentuh Docker. `ssh -L` lewat kunci ini pun ditolak: `channel 1: open failed: administratively prohibited: open failed` (lab penulis). Jawabanmu `rumah`? Mungkin laptopmu lebih dulu mencoba kunci pribadimu dari `ssh-agent`: ulangi dengan `-o IdentitiesOnly=yes` sesudah `-i ~/.ssh/robot_rumah`. Masih `rumah` atau `Permission denied`: awalan 10.3 salah ketik atau terpecah dua baris. Betulkan, sebab robot akan merah ([🚨](#-kalau-tidak-jalan), kelompok **`pasang-vps` dan SSH**).

**Kamu lulus langkah ⭐ ini** kalau jawabannya baris `pasang.sh` itu, bukan `rumah`.

#### 10.5 ⭐ Sidik VPS: `ssh-keyscan` dicocokkan dengan `ssh-keygen -lf` (6 menit)

Robot hanya masuk ke mesin yang sidik kuncinya ada di **Variables** `VPS_KNOWN_HOSTS`. Di terminal laptop:

```text
ssh-keyscan -t ed25519 203.0.113.10
```

**Hasilnya (lab penulis, laptop):**

```text
# 203.0.113.10:22 SSH-2.0-OpenSSH_10.3
203.0.113.10 ssh-ed25519 AAAA…
```

Baris yang diawali alamat VPS = isi `VPS_KNOWN_HOSTS` (baris `#` ikut tersalin pun tidak apa-apa). Jawaban lewat jaringan bisa dipalsukan, jadi cocokkan dulu sidiknya. Di laptop:

```text
ssh-keyscan -t ed25519 203.0.113.10 | ssh-keygen -lf -
```

Di terminal **VPS**, dari berkas kuncinya sendiri:

```text
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

**Hasilnya (lab penulis; deret sidik lab tidak dikutip):** laptop `256 SHA256:… 203.0.113.10 (ED25519)`, VPS `256 SHA256:… root@… (ED25519)`, dan deret sesudah `SHA256:` sama persis. Cocokkan sendiri, seperti [5.2 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#52-ssh-pertama-dan-sidik-jari-host-5-menit). Beda? Berhenti, jangan isi `VPS_KNOWN_HOSTS`; periksa alamatnya, lalu tanyakan penyedia VPS-mu. PowerShell: perintahnya sama (tidak diuji penulis).

**Kamu lulus langkah ⭐ ini** kalau kedua sidik sama, dan baris `203.0.113.10 ssh-ed25519 AAAA…` siap untuk 10.6.

#### 10.6 ⭐ Secrets dan Variables di GitHub: `VPS_KUNCI_SSH`, `VPS_HOST`, dan `VPS_KNOWN_HOSTS` (8 menit)

> [!NOTE]
> **Belum direkam penulis:** layar GitHub di 10.6 dari dokumen GitHub *Using secrets in GitHub Actions* dan *Store information in variables* (dibaca 5 November 2026).

1. Di halaman repo, klik **Settings**. Di bilah samping, bagian **Security**: **Secrets and variables** → **Actions**.
2. Tab **Secrets** → **New repository secret**. **Name**: `VPS_KUNCI_SSH`. **Secret**: seluruh isi `~/.ssh/robot_rumah`, dari `-----BEGIN OPENSSH PRIVATE KEY-----` sampai `-----END OPENSSH PRIVATE KEY-----` (tampilkan dengan perintah 10.3 tanpa `.pub`, salin, tempel, lalu tutup jendela terminalnya). Klik **Add secret**.
3. Tab **Variables** → **New repository variable**. **Name**: `VPS_HOST`; **Value**: `203.0.113.10`, alamat yang sama dengan yang di-*keyscan*, karena sidik dicatat per alamat. Klik **Add variable**. Ulangi untuk `VPS_KNOWN_HOSTS` dengan baris dari 10.5.

`VPS_USER` tidak perlu dibuat: tanpa itu, robot masuk sebagai `rumah`. **Secrets** disamarkan `***` di log robot; **Variables** terbaca di log publik, dan itu wajar ([Konsep 6](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables)). Setelan per jalur:

| Setelan | Jalur utama | Jalur gratis | Tanpa Pi |
| :-- | :-- | :-- | :-- |
| **Variables** `VPS_HOST` | `203.0.113.10` | kosong (`pasang-vps` dilewati) | `203.0.113.10` |
| **Variables** `VPS_USER` | kosong (= `rumah`) | — | kosong |
| **Variables** `VPS_KNOWN_HOSTS` | baris `ssh-keyscan -t ed25519 203.0.113.10` | — | sama |
| **Secrets** `VPS_KUNCI_SSH` | isi `~/.ssh/robot_rumah` | — | sama |
| `.env` `TOKO_IMAGE` (VPS) | `ghcr.io/<akun huruf kecil>` | — | sama |
| `.env` `TOKO_IMAGE` (Pi) | — (gerbang tanpa *image* buatan sendiri) | `ghcr.io/<akun huruf kecil>` | — |
| Unit Pi `PASANG_BAGIAN` | `gerbang` | `"pusat gerbang"` (berpetik) | — (tanpa jam weker) |
| Unit Pi `User=` / jalur | `budi` / `/home/budi/rumah-pintar-mini` (sesuaikan) | sama | — |

Tidak ada setelan `.env` baru di Modul 29 (`.env.example` hanya mendapat komentar). `TOKO_IMAGE` harus huruf kecil, karena GHCR menolak huruf besar, dan sama dengan toko robot (`ghcr.io/${GITHUB_REPOSITORY_OWNER,,}`). Setelan wajib baru kelak ditulis di DUA tempat: `.env` mesin produksi dan langkah `.env` *job* `staging`; lupa yang kedua, `staging` merah lebih dulu, dan memang itu gunanya.

Robot baru memakainya pada rilis berikutnya ([12.4](#124--l2-robot-memasang-vps-layar-masuk-menulis-v201-8-menit)): `ci.yml` sengaja tanpa pemicu "jalankan sekarang" (`workflow_dispatch`).

**Kamu lulus langkah ⭐ ini** kalau tab **Secrets** menyebut `VPS_KUNCI_SSH`, dan tab **Variables** menyebut `VPS_HOST` serta `VPS_KNOWN_HOSTS`.

#### 10.7 Salinan kunci privat robot di laptop: hapus atau simpan (3 menit)

Salinan kunci privat di laptop hanya berguna untuk mengulang 10.4. **Hapus** (`rm ~/.ssh/robot_rumah`; PowerShell: `Remove-Item $HOME\.ssh\robot_rumah`) bila laptopmu sering dibawa atau dipakai bersama; **simpan** bila ingin menguji lagi. Hilang: buat pasangan baru (10.2), lalu ganti baris VPS (10.3) dan isi **Secrets** (10.6). Bocor: hapus dulu barisnya di VPS; sampai itu terjadi, pemegangnya hanya bisa menjalankan `pasang.sh`.

#### 10.8 Mulai sekarang: VPS hanya berubah lewat *pull request* (3 menit)

`pasang.sh` berhenti dengan `GAGAL:` bila salinan repo di VPS tidak seperti harapannya. Jadi di VPS jangan lagi `git pull` dengan tangan (`berisi versi …, padahal rilis terbaru …`), menyunting berkas proyek atau `chmod +x` (`ada berkas yang disunting langsung di mesin ini`), `sudo sh skrip/pasang.sh` (`jangan dijalankan dengan sudo atau sebagai root`), atau membuat, memindah, atau menghapus *tag* `v…`, juga di laptop dan **Releases** (*tag* yang dipindah: `would clobber existing tag`). Yang tetap tangan: `.env` (di luar Git) dan cadangan. Robot perlu dihentikan sementara? Hapus `VPS_HOST` dari **Variables**: `pasang-vps` dilewati, VPS tetap di rilis terakhirnya. Pesannya di [🚨](#-kalau-tidak-jalan), kelompok **`pasang.sh` di VPS atau Pi**.

> ⬆️ **Selesai Praktik 10?** Jalur utama: lanjut ke [Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit) (Pi). Tanpa Pi: lewati Praktik 11, lanjut ke [Praktik 12](#praktik-12--pr-kecil-201-sampai-ke-produksi-tanpa-kamu-ssh-30-menit).

### Praktik 11 — Pi memperbarui dirinya sendiri: jam weker systemd (40 menit)

> 🖥️ **Alat yang dipakai:** **terminal SSH ke Pi** (`ssh budi@gateway.local`, Modul 12), folder `~/rumah-pintar-mini`; **Chrome** di 11.6 (layar **Armada**). Konsep yang dipakai: 8.
>
> ⭐ **Wajib untuk jalur utama dan jalur gratis** — langkah 11.1 sampai 11.6: jam weker terjadwal, satu putaran tercatat di jurnal dengan 2.0.0 terpasang, dan broker gerbang tidak di-*restart* (kecuali *image*-nya baru).

> 🔀 **Tanpa Pi:** lewati praktik ini (L3 tidak berlaku), lanjut ke Praktik 12.

Sejak [6.4 Modul 26](../modul-26-docker-compose/README.md#64--pi-samakan-acl-salin-berkas-sandi-lama-ke-lemari-gerbang-lalu-matikan-broker-apt-10-menit), gerbang diperbarui dengan tangan: `git pull`, lalu `docker compose restart mosquitto` bila konfigurasinya berubah. Kini satpam Pi mendapat jam weker yang menjalankan `skrip/pasang.sh` setiap 15 menit ([Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)). Tanpa *commit*: berkas proyek tidak berubah.

#### 11.1 ⭐ `git pull` terakhir dengan tangan di Pi (5 menit)

Di terminal Pi:

```text
cd ~/rumah-pintar-mini
git status --short --branch
```

Hanya `## main...origin/main` = di `main` tanpa suntingan. Lalu, untuk terakhir kalinya dengan tangan:

```text
git pull
ls skrip/systemd
```

`ls` menjawab `rumahpintar-perbarui.service` dan `rumahpintar-perbarui.timer` (lab penulis, "Pi" tiruan). Sesudah ini, salinan repo di Pi hanya dimajukan `pasang.sh` sampai *tag* rilis; `git pull` tangan membuat skrip itu berhenti (11.5). Bila tarikan ini mengubah `gerbang.conf` atau `acl-broker` (2.0.0 tidak), jalankan sekali `docker compose restart mosquitto` di folder `edge`: putaran pertama skrip tidak tahu yang berubah sebelumnya.

> 🔀 **Jalur gratis:** Pi-mu juga pusat, yang membangun *image* sendiri ([11.3 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#113-dua-lemari-external-dan-docker-compose-build-di-pi-12-menit)). Beralihlah ke menarik seperti [10.1](#101--terakhir-kali-ssh-untuk-memasang-sh-skrippasangsh-menarik-200-10-menit): `grep '^TOKO_IMAGE=' .env` harus menjawab `TOKO_IMAGE=ghcr.io/<akun>` (huruf kecil), lalu:
>
> ```text
> PASANG_BAGIAN="pusat gerbang" sh skrip/pasang.sh
> ```
>
> **Hasilnya (lab penulis, "Pi" tiruan, contoh ±48 detik; dipotong):** `memasang v2.0.0 (pusat gerbang); …`, enam `LULUS` uji asap pusat, `LULUS  gerbang: …`, lalu `belum pernah -> v2.0.0 terpasang (pusat gerbang)`. Varian arm64 dinyalakan pertama kali di sini.

**Kamu lulus langkah ⭐ ini** kalau `ls skrip/systemd` menjawab kedua berkas unit (jalur gratis: laporannya diakhiri `terpasang (pusat gerbang)`).

#### 11.2 ⭐ Dua berkas unit di `/etc/systemd/system/`: sesuaikan salinannya, bukan berkas repo (8 menit)

Baca dulu kedua berkas ([9.3](#93--pemasang-satu-skrip-skrippasangsh-dan-dua-berkas-unit-7-menit)); komentarnya bagian pelajaran, dan kepala `.service` = resep praktik ini:

```ini
# rumahpintar-perbarui.service - Modul 29: satpam systemd (Modul 12) yang SEKALI jalan memasang rilis terbaru Rumah Pintar
# Mini di Pi (skrip/pasang.sh), lalu selesai. Yang membangunkannya setiap 15 menit: rumahpintar-perbarui.timer di sebelahnya.
#
# Pasang (di Pi, dari akar proyek). Sesuaikan tiga hal di bawah dengan Pi-mu di SALINANNYA (/etc/systemd/system/...,
# lewat sudo nano), BUKAN di berkas repo ini: berkas repo yang disunting membuat pasang.sh berhenti. Tiga hal itu: User=
# (pengguna Pi, anggota grup docker), jalur /home/budi/rumah-pintar-mini (dua tempat), dan PASANG_BAGIAN (jalur utama:
# gerbang; jalur gratis: pusat gerbang).
#   sudo cp skrip/systemd/rumahpintar-perbarui.service skrip/systemd/rumahpintar-perbarui.timer /etc/systemd/system/
#   sudo nano /etc/systemd/system/rumahpintar-perbarui.service
#   systemd-analyze verify /etc/systemd/system/rumahpintar-perbarui.service /etc/systemd/system/rumahpintar-perbarui.timer
#     (tanpa keluaran = tidak ada salah tulis; baca keluarannya, jangan hanya kode keluarnya)
#   sudo systemctl daemon-reload
#   sudo systemctl enable --now rumahpintar-perbarui.timer
# Coba sekali sekarang juga: sudo systemctl start rumahpintar-perbarui.service   (menunggu sampai selesai)
# Jadwal berikutnya       : systemctl list-timers rumahpintar-perbarui.timer
# Catatan (log)           : journalctl -u rumahpintar-perbarui.service -n 30
# Berkas di /etc/systemd/system adalah SALINAN: sesudah mengubah berkas di repo, salin lagi dan daemon-reload.
[Unit]
Description=Rumah Pintar Mini: pasang rilis terbaru (tag v<versi>) dari GitHub dan GHCR
# butuh jaringan (GitHub, GHCR) dan Docker yang sudah menyala
Wants=network-online.target
After=network-online.target docker.service
Requires=docker.service

[Service]
# oneshot = sekali jalan sampai selesai, lalu berhenti (bukan layanan yang menyala terus)
Type=oneshot
# pengguna biasa anggota grup docker, BUKAN root (pemilik salinan repo di folder rumahnya)
User=budi
WorkingDirectory=/home/budi/rumah-pintar-mini
# Pi jalur utama = gerbang saja. Pi jalur gratis (pusat + gerbang di Pi yang sama): ganti baris ini dengan
#   Environment="PASANG_BAGIAN=pusat gerbang"
# (tanda petik wajib karena ada spasi)
Environment=PASANG_BAGIAN=gerbang
# lewat sh: berkas di repo sengaja tidak bertanda boleh-dijalankan (chmod +x)
ExecStart=/bin/sh /home/budi/rumah-pintar-mini/skrip/pasang.sh
# satu putaran paling lama 15 menit (tarikan image pertama di Pi bisa lama); lewat dari itu dihentikan dan dicatat gagal
TimeoutStartSec=15min
```

```ini
# rumahpintar-perbarui.timer - Modul 29: jam weker untuk rumahpintar-perbarui.service. Pi bertanya ke GitHub "ada rilis
# baru?" 5 menit sesudah menyala, lalu setiap 15 menit. Rilis baru biasanya terpasang paling lambat ±17 menit sesudah robot
# membuat tagnya (15 menit + acak sampai 1 menit + ketelitian jam weker systemd sampai 1 menit), ditambah lama menarik image.
# Cara memasang: lihat kepala rumahpintar-perbarui.service.
[Unit]
Description=Jadwal pembaruan Rumah Pintar Mini (setiap 15 menit)

[Timer]
# 5 menit sesudah Pi menyala (Docker dan jaringan sudah siap)
OnBootSec=5min
# lalu 15 menit sesudah putaran sebelumnya DIMULAI, juga bila putaran itu gagal
OnUnitActiveSec=15min
# tambahan acak 0-60 detik: banyak Pi tidak bertanya ke GitHub dan GHCR pada detik yang sama
RandomizedDelaySec=60
Unit=rumahpintar-perbarui.service

[Install]
WantedBy=timers.target
```

`[Install]` hanya ada di `.timer`: yang masuk daftar tugas pagi jam wekernya, layanannya cukup dibangunkan. Salin keduanya, lalu buka salinan `.service`:

```text
sudo cp skrip/systemd/rumahpintar-perbarui.service skrip/systemd/rumahpintar-perbarui.timer /etc/systemd/system/
```

```text
sudo nano /etc/systemd/system/rumahpintar-perbarui.service
```

Pengguna Pi-mu bukan `budi` (`whoami`)? Ganti di `User=` dan jalur `/home/budi/rumah-pintar-mini` (`WorkingDirectory=`, `ExecStart=`); pengguna itu harus anggota grup `docker` (`groups`). Jalur gratis (tabel [10.6](#106--secrets-dan-variables-di-github-vps_kunci_ssh-vps_host-dan-vps_known_hosts-8-menit)): `Environment=PASANG_BAGIAN=gerbang` menjadi `Environment="PASANG_BAGIAN=pusat gerbang"` (petik wajib: ada spasi). Simpan (**Ctrl + O**, **Enter**), keluar (**Ctrl + X**). Sunting selalu **salinannya**: berkas repo yang disunting membuat `pasang.sh` berhenti. Jadwal lain lewat *drop-in*: [🧩 Tingkat 1](#tingkat-1--pi-bertanya-setiap-5-menit-drop-in-untuk-jam-weker-ubah-sedikit-20-menit).

**Kamu lulus langkah ⭐ ini** kalau salinan itu menulis pengguna, jalur, serta bagian Pi-mu, dan `git status --short` tanpa keluaran.

#### 11.3 ⭐ `systemd-analyze verify`: dua berkas sekaligus, baca keluarannya (4 menit)

Sebelum dinyalakan, periksa salah tulis di **kedua** berkas:

```text
systemd-analyze verify /etc/systemd/system/rumahpintar-perbarui.service /etc/systemd/system/rumahpintar-perbarui.timer
```

**Hasilnya (lab penulis, systemd-analyze verify):** tanpa keluaran (kode `0`) = tidak ada salah tulis, untuk salinan jalur utama maupun gratis (systemd 259 di kontainer dengan unit Docker tiruan, bukan Pi sungguhan). Kenapa dua berkas? Bila kedua jadwal salah tulis (`5 menit`, `15 menit`), `verify` untuk `.service` saja tetap diam; dengan `.timer`:

**Hasilnya (lab penulis, *timer* sengaja dirusak; kode `1`):**

```text
/etc/systemd/system/rumahpintar-perbarui.timer:10: Failed to parse timer value, ignoring: 5 menit
/etc/systemd/system/rumahpintar-perbarui.timer:12: Failed to parse timer value, ignoring: 15 menit
rumahpintar-perbarui.timer: Timer unit lacks value setting. Refusing.
Unit rumahpintar-perbarui.timer has a bad unit file setting.
```

Baca keluarannya, bukan hanya kode keluarnya: komentar di belakang nilai hanya menghasilkan `Failed to parse timer value, ignoring: 5min # 5 menit sesudah menyala` dengan kode `0`, dan jadwal itu tetap dibuang. Pesan lain: [🚨](#-kalau-tidak-jalan), kelompok **Jam weker Pi**.

**Kamu lulus langkah ⭐ ini** kalau perintah itu tidak menulis apa pun.

#### 11.4 ⭐ Nyalakan jam weker: `enable --now` dan `list-timers` (5 menit)

```text
sudo systemctl daemon-reload
sudo systemctl enable --now rumahpintar-perbarui.timer
```

`daemon-reload` = systemd membaca ulang berkas unit (ulangi setiap salinannya diubah); `enable` = **jam weker** masuk daftar tugas pagi (Modul 12); `--now` = sekaligus menyala. Keluarannya: `Created symlink …` (belum direkam penulis).

```text
systemctl list-timers rumahpintar-perbarui.timer
```

**Yang tampil (dari dokumen systemd, dibaca 5 November 2026; belum direkam penulis):** satu baris; `NEXT`, `LEFT` = kapan dan berapa lama lagi berdering; `LAST`, `PASSED` = kapan terakhir; `UNIT`, `ACTIVATES` = jam weker dan layanannya. Menurut dokumen *systemd.timer*, `OnBootSec=` yang sudah lewat langsung berdering begitu jam weker menyala (ditambah jeda acak), jadi putaran pertama bisa mendahului 11.5.

**Kamu lulus langkah ⭐ ini** kalau `systemctl is-enabled rumahpintar-perbarui.timer` menjawab `enabled` dan kolom `NEXT` berisi waktu.

#### 11.5 ⭐ Satu putaran sekarang: `systemctl start`, lalu baca `journalctl` (8 menit)

```text
sudo systemctl start rumahpintar-perbarui.service
```

Untuk layanan `oneshot`, `start` menunggu putaran selesai, lalu kembali tanpa keluaran. Baca jurnal satpam ([5.1 Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#51-buku-catatan-satpam-journalctl)):

```text
journalctl -u rumahpintar-perbarui.service -n 30
```

**Hasilnya (lab penulis, "Pi" tiruan; dipotong):**

```text
2026-11-04 08:57:25 WIB memasang v2.0.0 (gerbang); sebelumnya: belum pernah lewat skrip ini
2026-11-04 08:57:25 WIB gerbang: tarik image v2.0.0 (edge/compose.edge.yml)
…
LULUS  gerbang: tidak ada layanan yang jatuh bangun (15 detik sesudah dinyalakan)
SERVICE     IMAGE                            STATUS
mosquitto   eclipse-mosquitto:2.1.2-alpine   Up 57 minutes
2026-11-04 08:57:42 WIB belum pernah -> v2.0.0 terpasang (gerbang)
2026-11-04 08:57:42 WIB v2.0.0 sudah terpasang (gerbang): tidak ada rilis baru
```

Di lab, `pasang.sh` dipanggil langsung (`budi`, `PASANG_BAGIAN=gerbang`), bukan oleh systemd; di jurnalmu setiap baris diawali tanggal, nama Pi, dan nama proses, ditambah catatan systemd saat layanan mulai dan selesai (belum direkam penulis). Putaran kedua (baris terakhir) tidak memanggil Docker: `.git/rumahpintar-terpasang` sudah berisi `v2.0.0 gerbang`. Jam weker berdering lebih dulu (11.4)? Pemasangannya tercatat dari putaran itu.

> 🔀 **Jalur gratis:** tertulis `v2.0.0 sudah terpasang (pusat gerbang)` (dipasang di 11.1). Hanya `(gerbang)`? Rilis berikutnya pun hanya memasang gerbang: betulkan `Environment=` (11.2), `daemon-reload`, lalu `start` lagi.

Catatan lain ([README gerbang](kode/edge/README.md#pi-memperbarui-dirinya-sendiri-modul-29)):

| Catatan | Artinya |
| :-- | :-- |
| `belum ada rilis (tag v<versi>) di GitHub: tidak ada yang dipasang` | robot belum pernah membuat *tag* rilis |
| `GAGAL: ada berkas yang disunting langsung di mesin ini` | ubah lewat *pull request*; `git restore <berkas>` |
| `GAGAL: salinan repo di mesin ini berisi versi …` | `git pull` tangan; terpasang begitu *tag*-nya ada |
| `GAGAL: broker gerbang jatuh bangun (Restarting)` | konfigurasi rusak: `docker compose logs mosquitto` |
| `GAGAL: jangan dijalankan dengan sudo atau sebagai root` | `User=` di salinan unit hilang |

**Kamu lulus langkah ⭐ ini** kalau jurnalnya memuat `terpasang (gerbang)` (jalur gratis: `terpasang (pusat gerbang)`), tanpa `GAGAL:`.

#### 11.6 ⭐ Broker gerbang tidak di-*restart*, Node 1 tetap `Online` (4 menit)

```text
cd edge
docker compose ps
```

`STATUS` broker `mosquitto` masih `Up` sejak sebelum 11.1 (lab penulis: waktu mulainya tidak berubah), dan layar **Armada** tetap menulis Node 1 `Online`. Broker di-*restart* bila *image* resminya, `gerbang.conf`, atau `acl-broker` berubah (lab penulis: Node 1 tiruan putus sesaat lalu `online` lagi, akun *dynamic security* bertahan).

**Kamu lulus langkah ⭐ ini** kalau `STATUS` broker belum berganti (kecuali *image*-nya baru) dan Node 1 `Online` di **Armada**.

#### 11.7 Menghentikan jam weker sementara, dan yang tetap tangan (3 menit)

Saat memperbaiki sesuatu dengan tangan di Pi, hentikan dulu jam wekernya (nyalakan lagi: `enable --now`):

```text
sudo systemctl disable --now rumahpintar-perbarui.timer
```

Yang tetap tangan: `edge/.env` dan `edge/jembatan/pusat.conf` (rahasia, di luar Git; baris baru `jembatan.contoh.conf` kamu salin sendiri, seperti Modul 27–28), dan salinan unit (unit repo berubah = salin, sesuaikan, `daemon-reload`). Aturan [10.8](#108-mulai-sekarang-vps-hanya-berubah-lewat-pull-request-3-menit) berlaku juga di Pi.

#### 11.8 Pi kini menyusul sendiri sesudah setiap *tag* rilis (3 menit)

Sesudah robot membuat *tag* rilis baru, Pi memasangnya di putaran berikutnya, biasanya paling lambat ±17 menit sesudah *tag* dibuat (15 menit + acak sampai 1 menit + ketelitian jam weker sampai 1 menit), ditambah lama menarik *image*. Sebelum *tag* ada, putaran hanya menulis `sudah terpasang` tanpa menarik apa pun. Bukti L3 di [12.5](#125--l3-pi-memasang-201-sendiri-dibaca-dari-jurnalnya-6-menit).

> ⬆️ **Selesai Praktik 11?** Lanjut ke [Praktik 12](#praktik-12--pr-kecil-201-sampai-ke-produksi-tanpa-kamu-ssh-30-menit): PR kecil 2.0.1 sampai ke produksi tanpa kamu SSH. Siapkan *stopwatch*.

### Praktik 12 — PR kecil 2.0.1 sampai ke produksi tanpa kamu SSH (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop, terminal di **akar proyek**; **GitHub** di browser; **Chrome** dan **HP** untuk dashboard; *stopwatch* (jam HP). Terminal SSH ke VPS dan Pi ditutup di 12.3; VPS dibaca lagi di 12.4, Pi di 12.5. Konsep yang dipakai: 7, 8, 10.
>
> ⭐ **Wajib** — langkah 12.1 sampai 12.6: PR C membawa versi 2.0.1 ke VPS (**L2**) dan ke Pi (**L3**) tanpa kamu SSH.

Inilah ujian modul ini: satu perubahan kecil di dashboard, dari laptop sampai ke produksi.

#### 12.1 ⭐ Cabang `perbaikan/teks-masuk`: satu teks di layar Masuk, satpam versi menolak (4 menit)

Di terminal laptop:

```text
git switch main
git pull
git switch -c perbaikan/teks-masuk
```

Di `frontend/src/halaman/Masuk.tsx` baris 59, tepat di bawah baris `v{__VERSI_WEB__}`, ubah teks ajakannya:

```diff
-        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Masuk dengan akun Modul 20 untuk melihat dashboard.</p>
+        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Masuk dengan akunmu untuk melihat dashboard rumah.</p>
```

Simpan, lalu tanyakan [satpam versi](#64--satpam-versi-skripcek-versimjs-satu-nomor-di-10-tempat-hanya-boleh-naik-5-menit) seperti robot di PR (PowerShell: seperti 6.7):

```bash
git fetch
BASIS=origin/main node skrip/cek-versi.mjs; echo "kode keluar: $?"
```

**Hasilnya (lab penulis, laptop):**

```text
GAGAL  yang dipasang di VPS/Pi berubah (frontend/src/halaman/Masuk.tsx) tetapi versinya masih 2.0.0 (= origin/main). Tanpa versi baru, robot tidak membuat rilis dan perubahan ini tidak pernah sampai ke VPS/Pi. Naikkan nomornya menurut SemVer: PATCH untuk perbaikan (2.0.0 -> 2.0.1), MINOR untuk fitur baru (2.0.0 -> 2.1.0), MAYOR bila pemakai lama terpaksa ikut berubah (2.0.0 -> 3.0.0).
kode keluar: 1
```

Teks layar ikut masuk *image* web, jadi berkas ini "dipasang"; perbaikan kecil yang tidak mengubah cara pakai = PATCH ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)).

**Kamu lulus langkah ⭐ ini** kalau satpam menolak dengan `GAGAL  yang dipasang di VPS/Pi berubah …` dan `kode keluar: 1`.

#### 12.2 ⭐ Versi 2.0.1 (PATCH) di 10 tempat dan entri `CHANGELOG.md` (5 menit)

Resepnya sama dengan [6.2](#62--satu-nomor-200-npm-version-tiga-baris-image-dan-envexample-6-menit):

```text
cd backend
npm version 2.0.1 --no-git-tag-version
cd ../frontend
npm version 2.0.1 --no-git-tag-version
cd ..
```

Backend ikut naik walau isinya tidak berubah: satu nomor untuk seluruh rilis. Di `compose.cloud.yml`, ganti `:2.0.0` di ujung ketiga baris `image:` (baris 210, 227, dan 263) dengan `:2.0.1`. Di `CHANGELOG.md`, sisipkan entri di bawah `## [Belum Dirilis]`, bertanggal hari ini:

```markdown
## [Belum Dirilis]

## [2.0.1] - 2026-11-04

### Diubah

- Layar Masuk: teks ajakan lebih jelas ("Masuk dengan akunmu untuk melihat dashboard rumah.").

## [2.0.0] - 2026-11-04
```

Ulangi perintah satpam 12.1.

**Hasilnya (lab penulis, laptop):**

```text
LULUS  satu nomor versi 2.0.1 di 10 tempat (package.json, package-lock.json, compose.cloud.yml, CHANGELOG.md); dibanding origin/main (2.0.0): versi naik, 6 berkas yang dipasang berubah
kode keluar: 0
```

Enam berkas yang dipasang: dua `package.json`, dua *lock*, `compose.cloud.yml`, dan `Masuk.tsx`. Entri `## [2.0.1]` inilah yang nanti menjadi isi *tag* `v2.0.1`.

**Kamu lulus langkah ⭐ ini** kalau satpam menulis `LULUS … 2.0.1 …` dengan `6 berkas yang dipasang berubah`.

#### 12.3 ⭐ PR C hijau, tutup semua jendela SSH, lalu *merge* dan mulai *stopwatch* (4 menit)

> [!NOTE]
> **Belum direkam penulis:** layar GitHub di 12.3–12.5 dari dokumen GitHub (dibaca 5 November 2026); berkas dan perintahnya dijalankan penulis dengan robot tiruan serta "VPS" dan "Pi" tiruan.

```text
git add -A
git commit -m "perbaikan: teks ajakan layar Masuk (2.0.1)"
git push -u origin perbaikan/teks-masuk
```

Buka PR C seperti PR A dan B, judul `Layar Masuk: teks ajakan lebih jelas (2.0.1)`, lalu tunggu ketiga *check* wajib di tab **Checks** (`periksa`, `uji`, `bangun`) hijau. Sambil menunggu, tutup setiap terminal SSH ke VPS dan Pi (`exit`): mulai sekarang yang memasang hanya robot dan jam weker. Klik **Merge pull request** (pilihan **Create a merge commit**) → **Confirm merge**, dan mulai *stopwatch* tepat saat itu.

**Kamu lulus langkah ⭐ ini** kalau PR C ter-*merge* sesudah ketiga *check* hijau, *stopwatch* berjalan, dan tidak ada terminal SSH ke VPS atau Pi yang terbuka.

#### 12.4 ⭐ L2: robot memasang VPS, layar Masuk menulis `v2.0.1` (8 menit)

Tab **Actions**, *run* `push` teratas: `periksa` dan `uji` → `bangun` (mengirim 2.0.1) → `staging` → `tandai-rilis` (*tag* `v2.0.1`) → `pasang-vps`, yang kini tidak dilewati karena `VPS_HOST` terisi ([10.6](#106--secrets-dan-variables-di-github-vps_kunci_ssh-vps_host-dan-vps_known_hosts-8-menit)). Sesudah `pasang-vps` hijau, buka log langkah `pasang rilis di VPS (lewat skrip/pasang.sh)`: isinya laporan `pasang.sh` dari VPS-mu sendiri.

Lalu di Chrome, buka `https://iot.namaanda.my.id` (sedang masuk? klik **Keluar**: teks ajakan hanya ada di layar **Masuk**) dan muat ulang **dua kali** ([PWA, Konsep 11 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#11-pwa-dari-pintasan-menjadi-aplikasi)): yang pertama biasanya masih menampilkan versi lama dari simpanan PWA, yang kedua teks baru dan `v2.0.1` di bawah judul layar **Masuk**. `/api/health` menulis `"versi":"2.0.1"`. Hentikan *stopwatch*. Gambar di bawah dari lab penulis (mesin tiruan); di layarmu alamat dan datanya milikmu.

![Komposit tiga tangkapan layar asli bagian atas layar Masuk Rumah Pintar Mini di VPS tiruan (kontainer Docker-in-Docker), Chrome 156 di Linux, laptop 1280 piksel, mode terang; bilah alamat tidak tertangkap. Praktik 12.4, 4 Nov 2026, rilis 2.0.1 dipasang robot tiruan lewat SSH (job pasang-vps), tanpa SSH tangan; PWA lab diizinkan di HTTP lokal lewat setelan Chrome. Atas, sebelum merge 10.57.30 WIB: v2.0.0 dan Masuk dengan akun Modul 20 untuk melihat dashboard. (nomor 1). Tengah, muat ulang pertama 11.02.33 WIB sesudah /api/health sudah menyebut 2.0.1: masih v2.0.0 dan teks lama, diambil dari simpanan PWA (nomor 2). Bawah, muat ulang kedua 11.02.38 WIB: v2.0.1 dan Masuk dengan akunmu untuk melihat dashboard rumah. (nomor 3). Di bawahnya /api/health di peramban pukul 11.02.45 WIB: ok true, versi 2.0.1 (nomor 4), broker true, database true. Legenda di kanan setiap potongan. Paling bawah, stopwatch contoh lab, bukan GitHub: merge 10.57.31, tag v2.0.1 11.02.17, VPS v2.0.0 ke v2.0.1 terpasang 11.02.46 WIB, jadi 5 menit 15 detik.](aset/versi-di-produksi.png)

**Hasilnya (lab penulis, robot tiruan; log `pasang-vps`, dipotong):**

```text
 * [new tag]         v2.0.1     -> v2.0.1
2026-11-04 02:16:33 UTC memasang v2.0.1 (pusat); sebelumnya: v2.0.0
2026-11-04 02:16:33 UTC pusat: tarik image v2.0.1 (compose.cloud.yml)
…
 Container rumahpintar-migrasi-1 Recreate
 Container rumahpintar-web-1 Recreate
…
 Container rumahpintar-backend-1 Recreate
…
LULUS  /health backend: {"ok":true,"versi":"2.0.1","broker":true,"database":true,"diterima":3,"ditolak":0,"diabaikan":0}
…
2026-11-04 02:17:03 UTC v2.0.0 -> v2.0.1 terpasang (pusat)
```

Baris pertama ditulis Git di VPS: VPS sendiri yang mengambil *tag* baru; robot hanya mengetuk. Hanya `migrasi`, `web`, dan `backend` yang dibuat ulang; dashboard sempat putus (lab penulis: ±6 detik). Di lab penulis, *merge* → "VPS" terpasang ±5–6½ menit (6 menit 08 detik; gambar: 5 menit 15 detik): contoh robot tiruan di Raspberry Pi 5 dengan *image* dasar lokal, bukan GitHub; di GitHub belum diukur penulis. Sesudahnya, SSH untuk membaca boleh lagi: ulangi sidik jari 1.3, dan `akun` serta `perangkat` harus sama.

**Tanpa kamu SSH ≠ tanpa SSH:** robot tetap masuk ke VPS lewat SSH, dengan kunci yang hanya bisa menjalankan `pasang.sh` ([Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri)); yang hilang hanya SSH-mu. `pasang-vps` merah? Betulkan sebabnya, lalu **Re-run failed jobs**, bukan **Re-run all jobs** ([🚨](#-kalau-tidak-jalan), kelompok **`pasang-vps` dan SSH**). Layar tetap `v2.0.0`: kelompok **Produksi masih versi lama**.

> 🔀 **Jalur gratis:** `pasang-vps` dilewati (`VPS_HOST` kosong); biarkan *stopwatch* berjalan sampai **L2-gratis** dari Pi di 12.5.

**Kamu lulus langkah ⭐ ini** kalau `pasang-vps` hijau dengan laporan `v2.0.0 -> v2.0.1 terpasang (pusat)`, layar **Masuk** di domainmu menulis teks baru dan `v2.0.1`, dan `/api/health` menulis `"versi":"2.0.1"`. Inilah syarat **L2**.

#### 12.5 ⭐ L3: Pi memasang 2.0.1 sendiri, dibaca dari jurnalnya (6 menit)

Di Pi tidak ada yang kamu kerjakan: pada putaran jam weker berikutnya, biasanya paling lambat ±17 menit sesudah *tag* `v2.0.1` dibuat, ditambah lama menarik *image*, Pi memasangnya sendiri ([Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)). Yang dinilai pemasangannya; membaca jurnalnya lewat SSH sesudahnya boleh. Di terminal SSH ke Pi:

```text
journalctl -u rumahpintar-perbarui.service -n 30
```

**Hasilnya (lab penulis, "Pi" tiruan; jam weker diganti penjadwal tiruan, baris `pasang.sh` saja):**

```text
2026-11-04 09:16:46 WIB memasang v2.0.1 (gerbang); sebelumnya: v2.0.0
…
2026-11-04 09:17:03 WIB v2.0.0 -> v2.0.1 terpasang (gerbang)
```

Baris tengahnya seperti [11.5](#115--satu-putaran-sekarang-systemctl-start-lalu-baca-journalctl-8-menit). Penjadwal tiruan penulis bertanya tiap ±1 menit, bukan 15, jadi "Pi" terpasang 6 menit 08 detik sesudah *merge* (contoh). Broker gerbang tidak di-*restart* (`edge/` tidak berubah), dan Node 1 tetap `Online` di **Armada**.

> 🔀 **Jalur gratis:** jurnalnya menulis `v2.0.0 -> v2.0.1 terpasang (pusat gerbang)` (lab penulis: 7 menit 09 detik sesudah *merge*). Buka dashboard-mu lewat Tunnel di HP dan muat ulang dua kali: teks baru dan `v2.0.1` = **L2-gratis**, dipasang jam weker Pi tanpa *job* SSH dan tanpa kamu SSH.

Di jalur gratis, tampilannya seperti di bawah (lab penulis: "Pi" tiruan yang `pasang.sh`-nya dijalankan sekali dengan tangan untuk tangkapan ini, mode perangkat Chrome 375 px, bukan HP sungguhan).

![Komposit dua tangkapan layar asli dashboard Rumah Pintar Mini 2.0.1 di Pi jalur gratis tiruan (kontainer Docker-in-Docker, bukan Raspberry Pi), mode perangkat Chrome 156 375 piksel bermode gelap di Linux, bukan HP sungguhan; bilah alamat tidak tertangkap. Praktik 12.5 jalur gratis, 4 Nov 2026 pukul 11.06 WIB; di Pi lab, PASANG_BAGIAN=pusat gerbang sh skrip/pasang.sh dijalankan sekali dengan tangan dan memasang 2.0.1; dashboard dibuka lewat terowongan SSH lab, pengganti Cloudflare Tunnel. Kiri, layar Perangkat sesudah masuk: kepala Rumah Pintar Mini dengan v2.0.1 di bawah judul (nomor 1) dan lencana Live (nomor 2), menu Perangkat, Peta, Aturan, Armada, Admin Rumah (admin), Keluar; Daftar Perangkat dengan kartu Latihan ruang tamu, Online, kunci aktif, ruang tamu · f00d00000001, Suhu 29.4 °C, terakhir dilihat 6 detik yang lalu (nomor 3; simulator lewat broker gerbang di Pi yang sama). Tengah, layar Masuk: Rumah Pintar Mini, v2.0.1, Masuk dengan akunmu untuk melihat dashboard rumah. (nomor 4), kolom Email dan Sandi, tombol Masuk. Legenda bernomor di kanan.](aset/versi-di-hp-gelap.png)

> 🔀 **Tanpa Pi:** L3 tidak berlaku; lanjut ke 12.6.

**Kamu lulus langkah ⭐ ini** kalau jurnal Pi menulis `v2.0.0 -> v2.0.1 terpasang (gerbang)` (jalur gratis: `(pusat gerbang)`, dan dashboard dari Pi menulis `v2.0.1`) tanpa kamu SSH untuk memasang. Inilah syarat **L3**.

#### 12.6 ⭐ Hapus cabang dan catat waktu *stopwatch* (3 menit)

Di halaman PR C, klik **Delete branch**. Di laptop:

```text
git switch main
git pull --prune
git branch -d perbaikan/teks-masuk
```

Di `belajar-iot/modul-29/pemanasan.md`, di samping hitungan 🔁 Langkah 2, catat untuk ➕ E: angka *stopwatch*, jam *merge*, jam VPS terpasang (stempel `pasang-vps` UTC + 7 jam), jam Pi terpasang (jurnal), dan langkah tanganmu kali ini. Waktu robot GitHub berubah-ubah menurut antrean: jangan bandingkan dengan angka penulis.

**Kamu lulus langkah ⭐ ini** kalau `perbaikan/teks-masuk` hilang di GitHub dan di laptop, dan catatan itu lengkap.

> ⬆️ **Selesai Praktik 12?** Lanjut ke [Praktik 13](#praktik-13--kembali-ke-versi-sebelumnya-revert-menjadi-202-20-menit): kembali ke versi sebelumnya dengan *revert*, nomornya tetap naik.

### Praktik 13 — Kembali ke versi sebelumnya: *revert* menjadi 2.0.2 (20 menit)

> 🖥️ **Alat yang dipakai:** **GitHub** di browser, **VS Code** di laptop (terminal di **akar proyek**), **Chrome**. VPS dan Pi tidak kamu sentuh. Konsep yang dipakai: 10.

Misalkan teks baru itu membingungkan. Jalan mundurnya sama dengan jalan maju: *pull request*, robot, rilis baru. Praktik ini dianjurkan, tanpa ⭐.

#### 13.1 Tombol Revert di PR C: satpam versi menolak versi turun (5 menit)

> [!NOTE]
> **Belum direkam penulis:** tombol **Revert** dari dokumen GitHub *Reverting a pull request* (dibaca 5 November 2026); untuk robot tiruan, penulis membuat *commit* berisi sama dengan `git revert`.

Buka PR C (tab **Pull requests**, daftar **Closed**), lalu klik **Revert** di bagian bawahnya. Menurut dokumen, GitHub membuat *pull request* baru yang membalik *merge commit* PR C (bila formulirnya tampil dulu, klik **Create pull request**): inilah **PR D**. Robot berjalan, dan `periksa` merah di langkah `versi`, jauh sebelum `npm ci`.

**Hasilnya (lab penulis, robot tiruan; *job* `periksa`, langkah `versi`):**

```text
GAGAL  versi 2.0.0 lebih KECIL dari 2.0.1 di origin/main: versi hanya boleh naik. Mengembalikan isi lama (revert)? Isinya boleh lama, nomornya tetap NAIK (misalnya 2.0.2), dengan entri "Diperbaiki: mengembalikan …" di CHANGELOG.md.
```

*Revert* polos membalik semua isi PR C, termasuk nomornya. Seandainya lolos dari [satpam versi](#64--satpam-versi-skripcek-versimjs-satu-nomor-di-10-tempat-hanya-boleh-naik-5-menit) pun, *tag* `v2.0.0` sudah ada: robot tidak membuat rilis, dan teks lama tidak pernah sampai ke VPS dan Pi.

#### 13.2 Versi 2.0.2 berisi isi 2.0.0, entri 2.0.1 tetap tercatat (7 menit)

Isinya sudah benar; nomornya yang harus naik. Di laptop, `git fetch`: baris `[new branch]` menyebut cabang PR D, biasanya `revert-<nomor PR C>-perbaikan/teks-masuk` (dokumen GitHub tidak menyebut polanya; pakai yang tertulis). Pindah ke sana, lalu ambil lagi `CHANGELOG.md` dari `main`: *revert* ikut menghapus entri `## [2.0.1]`, padahal rilis itu pernah terpasang dan catatannya harus tetap ada.

```text
git switch revert-<nomor>-perbaikan/teks-masuk
git restore --source=origin/main CHANGELOG.md
```

Naikkan nomor seperti 12.2, kali ini ke 2.0.2 (`npm version` di `backend` dan `frontend`, tiga baris `image:`), lalu sisipkan entri di atas `## [2.0.1]`:

```markdown
## [2.0.2] - 2026-11-04

### Diperbaiki

- Layar Masuk: mengembalikan teks ajakan 2.0.0 (*revert* 2.0.1).
```

**Hasilnya (lab penulis, laptop; perintah satpam 12.1):** `LULUS  satu nomor versi 2.0.2 di 10 tempat (…); dibanding origin/main (2.0.1): versi naik, 6 berkas yang dipasang berubah`. Lalu kirim:

```text
git add -A
git commit -m "perbaikan: revert 2.0.1 sebagai rilis 2.0.2"
git push
```

Robot berjalan lagi di PR D; kali ini ketiga *check* hijau.

#### 13.3 *Merge*: VPS dan Pi memasang 2.0.2 sendiri (5 menit)

*Merge* PR D seperti 12.3, lalu hapus cabang `revert-<nomor>-perbaikan/teks-masuk` di GitHub dan laptop seperti 12.6. Robot berjalan seperti 12.4.

**Hasilnya (lab penulis, robot tiruan):** log `pasang-vps` memuat `2026-11-04 02:30:13 UTC memasang v2.0.2 (pusat); sebelumnya: v2.0.1`, lalu `2026-11-04 02:30:42 UTC v2.0.1 -> v2.0.2 terpasang (pusat)`.

Pi menyusul pada putaran berikutnya: `v2.0.1 -> v2.0.2 terpasang (gerbang)` (jalur gratis: `(pusat gerbang)`). Lab penulis (robot dan penjadwal tiruan, contoh): VPS 6 menit 05 detik, "Pi" 6 menit 36 detik sesudah *merge*. Muat ulang dashboard dua kali: layar **Masuk** kembali menulis `Masuk dengan akun Modul 20 untuk melihat dashboard.`, kini dengan `v2.0.2`. Isi 2.0.0 bernomor 2.0.2: inilah **maju untuk mundur** ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)).

#### 13.4 Batas maju untuk mundur: *image* bisa mundur, database tidak (3 menit)

*Revert* mengembalikan kode dan *image*, bukan isi database. Karena itu, migrasi dalam satu rilis hanya boleh menambah tabel, kolom, atau indeks, supaya *image* sebelumnya tetap cocok dengan databasenya (minggu ini tidak ada migrasi baru). Memasang *tag* lama dengan tangan di VPS atau Pi, misalnya saat robotnya sendiri rusak, adalah langkah darurat untuk *runbook* Modul 30, bukan cara kembali sehari-hari. Setiap rilis juga meninggalkan *image* lama di VPS (jalur gratis: di Pi; lab penulis: ±100 MB per rilis yang tidak terpakai lagi, contoh); membereskannya dengan aman juga bagian Modul 30.

> ⬆️ **Selesai Praktik 13?** Lanjut ke [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini): cocokkan proyekmu dan catat waktu *stopwatch*-mu. [🧩 Tantangan](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip masalahmu (Compose dan VPS: [🚨 Modul 27](../modul-27-deploy-internet-tls-pwa/README.md#-kalau-tidak-jalan)). Lirik dulu log *job* yang merah (tab **Actions**), laporan `pasang.sh` (VPS: log `pasang-vps`; Pi: `journalctl -u rumahpintar-perbarui.service -n 30`), atau `docker compose logs <layanan>`. "Lab penulis" = rekaman di Raspberry Pi 5 penulis (robot, "VPS", dan "Pi" tiruan); "teks dari kode" belum direkam; layar GitHub dari dokumennya (dibaca 31 Oktober–5 November 2026; layarmu bisa berbeda). Tempel log ke forum atau AI tanpa `.env`, kunci, atau isi **Secrets**.

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (<code>actions/checkout@v7</code>, <code>ubuntu-24.04</code>, oxlint 1.89.0, tanpa QEMU)</b></summary>

Per 4 November 2026 ([🧰](#-yang-perlu-disiapkan)).

| Petunjuk lama | Yang benar untuk versi kita |
| :--- | :--- |
| `@v3`/`@v4` dari `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`; `actions/cache@v4` | `@v7` (`setup-node` hanya di Kemenangan Cepat; `ci.yml` memakai *container* Node); `actions/cache@v6` |
| `::set-output` | `echo "nama=nilai" >> "$GITHUB_OUTPUT"` |
| `ubuntu-latest` | `ubuntu-24.04` (`ubuntu-latest` diumumkan pindah ke 26.04, November 2026) |
| `ubuntu-slim` | `ubuntu-24.04` (`ubuntu-slim` tanpa server Docker, batas 15 menit) |
| QEMU (`setup-qemu-action`, `tonistiigi/binfmt`) | tanpa emulasi: `$BUILDPLATFORM` (Praktik 7) atau `ubuntu-24.04-arm` (🔬) |
| Watchtower (diarsipkan 17 Desember 2025) | jam weker systemd + `pasang.sh` |
| `:latest`, atau `docker compose pull && up -d` saja | *tag* persis + rilis bertanda Git (Konsep 8) |
| PAT di Actions | `GITHUB_TOKEN` + `permissions` |
| `StrictHostKeyChecking=no` | `known_hosts` dari **Variables** + `StrictHostKeyChecking=yes` |
| `appleboy/ssh-action` | `ssh` bawaan *runner* |
| `ssh-copy-id` untuk kunci robot | baris `restrict,command=…` ditulis sendiri |
| `pull_request_target` | `pull_request` |
| `npm install` di robot | `npm ci` |
| `docker-compose` | `docker compose` (Modul 26) |
| ESLint + `typescript-eslint` (belum menerima TypeScript 7) | oxlint 1.89.0 `--deny-warnings` |
| "2.000 menit sebulan" | repo publik: *runner* standar gratis; privat akun gratis: $12/bulan, setara 2.000 menit Linux x64 |
| "PlatformIO: Arduino-ESP32 3.x hanya lewat *fork*" | `platform-espressif32` v8.0.0 (19 Oktober 2026) mendukung 3.3.12 |
| `[Unreleased]`, `Added` | `[Belum Dirilis]`, `Ditambahkan` (terjemahan resmi) |
| `npm version patch` (membuat *commit* + *tag*) | `npm version <x.y.z> --no-git-tag-version` |
| `git push --tags`, **Draft a new release** | *tag* hanya dari `tandai-rilis` |
| **Re-run all jobs** saat `pasang-vps` merah | **Re-run failed jobs** |

</details>

**Robot merah di `periksa`**

<details>
<summary><b>Satpam versi: <code>tidak bisa dibandingkan dengan HEAD</code>, atau git menolak: <code>detected dubious ownership</code></b></summary>

Langkah `versi` (6.6), teks dari kode: `GAGAL  origin/main tidak bisa dibandingkan dengan HEAD: …` + `pesan git: …` (sebab sebenarnya). Di `periksa` (4.1): tanpa `fetch-depth: 0`, robot hanya menyalin satu *commit*; tanpa baris `safe.directory`, git menolak folder milik pengguna lain (lab penulis, robot tiruan: `fatal: detected dubious ownership in repository at '/__w/rumah-pintar-mini/rumah-pintar-mini'`). Di laptop: `git fetch` dulu.

</details>

<details>
<summary><b>Satpam versi: <code>nomor versi harus SAMA di semua tempat ini</code>, atau <code>yang dipasang di VPS/Pi berubah</code> tetapi versinya belum naik</b></summary>

Lab penulis ([6.7](#67--satpam-versi-di-laptop-lulus-sengaja-gagal-lalu-commit-5-menit)): `GAGAL  nomor versi harus SAMA di semua tempat ini, sekarang ada 2 nomor (2.0.0, 1.4.0):` + daftar 10 tempat; baris bernomor lain (`1.4.0  compose.cloud.yml (image rumah-pintar-mini-web)`) = yang tertinggal. `yang dipasang di VPS/Pi berubah`: berkas dalam kurung ikut dipasang, jadi versi wajib naik. Obat keduanya: `npm version <versi> --no-git-tag-version` di `backend` DAN `frontend`, tiga baris `image:`, entri `CHANGELOG.md` (12.2).

</details>

<details>
<summary><b>Satpam versi: versi <code>lebih KECIL</code> dari <code>origin/main</code> (<i>revert</i> polos), atau <code>bukan MAYOR.MINOR.PATCH angka saja</code></b></summary>

Lab penulis (robot tiruan, PR *revert* polos): `GAGAL  versi 2.0.0 lebih KECIL dari 2.0.1 di origin/main: versi hanya boleh naik. …`: naikkan ke versi berikutnya; entri `CHANGELOG` rilis lama tetap (13.2). Lab penulis (laptop): `GAGAL  backend/package.json: versi "2.1.0-rc.1" bukan MAYOR.MINOR.PATCH angka saja (misalnya 2.0.1)`: nomor ini menjadi *tag* rilis, jadi tanpa `-rc`.

</details>

<details>
<summary><b>Firmware: <code>UJI_KUNCI_SALAH harus 0</code>, atau <code>berkas firmware atau kunci ikut Git</code></b></summary>

Teks dari kode: `GAGAL  firmware/node-1-rumah/konfigurasi.h: UJI_KUNCI_SALAH harus 0 di kode yang di-commit (Modul 28)`: kembalikan ke `0`, *commit*. `GAGAL  berkas firmware atau kunci ikut Git (bisa berisi kunci ESP-NOW): …` (lab penulis: `build/`, `.BIN`, `kunci.h`): `git rm -r --cached <berkas>`, tulis di `.gitignore`, *commit*. Yang sudah ter-*push* ke repo publik sudah terbaca orang: ganti kunci ESP-NOW (Praktik 8 Modul 14) dan `SANDI_PORTAL` (5.2 Modul 28).

</details>

<details>
<summary><b><i>Lint</i> merah karena satu peringatan: <code>Found 1 warning and 0 errors.</code></b></summary>

`--deny-warnings`: satu peringatan = kode `1`. Lab penulis (robot tiruan, `debugger;` tertinggal): `::warning file=src/services/csv.ts,line=29,…,title=eslint(no-debugger)::…` lalu `Found 1 warning and 0 errors.` (aturan di dalam kurung). Betulkan sampai `npm run lint` menulis `Found 0 warnings and 0 errors.`. Yang sengaja: satu baris `oxlint-disable-next-line <aturan> -- sengaja: <alasan>` (2.1), bukan menghapus `--deny-warnings`.

</details>

<details>
<summary><b><code>npm audit</code> merah, padahal kodenya tidak berubah</b></summary>

`npm audit --omit=dev --audit-level=high` merah hanya untuk celah **tinggi atau kritis** di library produksi, dan laporan celah baru terbit kapan saja. Jalankan di laptop, baca versi perbaikannya, naikkan lewat PR biasa. Jangan `npm audit fix --force` atau menurunkan `--audit-level`.

</details>

<details>
<summary><b>Kontainer Alpine di robot: <code>JavaScript Actions in Alpine containers are only supported on x64 Linux runners</code>, atau <code>tar: unrecognized option: posix</code></b></summary>

Pesan pertama (sumber `actions/runner`, belum direkam penulis): `runs-on` diganti *runner* ARM (`ubuntu-24.04-arm`), padahal *action* JavaScript di *container* Alpine hanya jalan di x64; kembalikan `ubuntu-24.04`. Pesan kedua (lab penulis): `tar` hilang dari `apk add --no-cache git tar`; `tar` bawaan Alpine tidak mengenal `--posix` (menurut sumber `actions/cache`: hanya peringatan).

</details>

**Robot merah di `uji`**

<details>
<summary><b><code>Setelan DATABASE_URL di .env: belum diisi</code> atau <code>Setelan MQTT_URL di .env: belum diisi</code></b></summary>

Migrasi berhenti sebelum tes: backend memeriksa semua setelan. Lab penulis (robot tiruan, `DATABASE_URL_UJI` dihapus dari `env:`): `Setelan DATABASE_URL di .env: belum diisi` · `Salin .env.example menjadi .env …` (kalimat untuk laptop). Blok `env:` *job* `uji` wajib memuat `DATABASE_URL_UJI`, `MQTT_URL`, `JWT_SECRET` persis seperti 4.1; tanpa `MQTT_URL`: bentuk kedua (lab penulis, laptop).

</details>

<details>
<summary><b><code>ada tes yang dilewati (skipped)</code></b></summary>

Lab penulis (robot tiruan, satu `it.skip` tertinggal):

```text
      Tests  222 passed | 1 skipped (223)
GAGAL  ada tes yang dilewati (skipped): di robot semua tes wajib jalan, juga 20 integration test
```

Sebabnya `.skip` tertinggal (`git grep -n "\.skip("` di `backend`); `DATABASE_URL_UJI` kosong sudah merah di migrasi. Hapus `.skip`-nya, bukan penjaganya.

</details>

<details>
<summary><b><code>AssertionError</code>: tes mana yang gagal, dan di baris berapa</b></summary>

Robot hanya membaca kode `1`; isinya di log Vitest ([4.3](#43--baca-log-robot-periksa-dan-uji-dengan-223-tes-8-menit); contoh di 5.3): baris `×` = nama tes; `AssertionError: expected 201 to be 200` = hasilnya `201`, harapannya `200`; `❯ src/integrasi/perangkat.test.ts:37:30` = berkas, baris, kolom. Ulangi di laptop (*integration test*: database uji, 3.6). Hanya merah di robot? Jam robot UTC (`vi.stubEnv("TZ", …)` di `waktu.test.ts`).

</details>

**Database uji di laptop**

<details>
<summary><b><code>database uji tidak bisa dihubungi</code>, atau loket 5433 sudah dipakai</b></summary>

Teks dari kode: `database uji tidak bisa dihubungi (…): kontainer database uji sudah dinyalakan, dan loket serta sandinya sama dengan DATABASE_URL_UJI?`. Kontainernya hilang sesudah `docker stop` (`--rm`): ulangi [3.1](#31--database-uji-sekali-pakai-rumahpintar-db-uji-di-loket-5433-6-menit); di PowerShell, periksa setelan lama (3.9). Loket 5433 dipakai program lain (pesannya belum direkam penulis)? Ganti di DUA tempat: `-p 127.0.0.1:5434:5432` dan `…@127.0.0.1:5434/rumahpintar_uji`.

</details>

<details>
<summary><b><code>bukan database uji</code>, atau <code>tabel firmware di database uji berisi rilis lain</code></b></summary>

`Error: DATABASE_URL_UJI menunjuk database "rumahpintar", bukan database uji: …` = pengaman 3.8 bekerja sebelum tersambung; nama database wajib berakhiran `_uji`. Lab penulis (rilis `1.7.0` sengaja ditaruh di database uji): `Error: tabel firmware di database uji berisi rilis lain (1.7.0): …`, 3 tes merah. Obatnya: `docker stop rumahpintar-db-uji`, lalu 3.1 lagi.

</details>

<details>
<summary><b>Ekstensi <code>timescaledb</code> tidak ada: <i>image</i> <code>postgres</code> polos</b></summary>

Migrasi `002`–`005` butuh TimescaleDB. Dengan `postgres` polos, tes berhenti di `migrasi database uji gagal:` (teks dari kode) + pesan PostgreSQL (belum direkam penulis). Pakai `timescale/timescaledb:2.30.2-pg17` seperti 3.1.

</details>

**Aturan cabang**

<details>
<summary><b>PR menunggu selamanya (<code>Waiting for status to be reported</code> atau persetujuan), atau nama <i>check</i> tidak muncul di daftar</b></summary>

*Check* wajibnya tidak pernah dilaporkan: namanya beda dengan nama *job* (`periksa`, `uji`, `bangun`), atau *workflow*-nya tidak berjalan (dokumen GitHub: misalnya karena filter `paths`). Samakan di **Settings** → **Branches** → **Edit** ([5.1](#51--aturan-klasik-untuk-main-di-settings--branches-empat-setelan-8-menit)). Tidak muncul di pencarian: *check* harus pernah lulus dalam 7 hari terakhir (7.6); jalankan robot dulu. Semua *check* hijau, tetapi PR menunggu persetujuan (*review*)? Menurut dokumen GitHub, penulis PR tidak bisa menyetujui PR-nya sendiri: hapus centang **Require approvals** (5.1 langkah 5).

</details>

<details>
<summary><b>PR merah masih bisa di-<i>merge</i>: kotak Do not allow bypassing the above settings belum dicentang</b></summary>

Menurut dokumen GitHub, tanpa kotak itu aturan cabang tidak berlaku untuk admin repo, yaitu kamu. **Settings** → **Branches** → **Edit** di aturan `main` → centang **Do not allow bypassing the above settings** → **Save changes**. Bila *push* di 5.2 sempat diterima, kembalikan `main` dulu seperti di 5.2. Lalu ulangi 5.2 dan 5.3.

</details>

<details>
<summary><b>Repo privat: aturan cabang tidak tersedia di akun gratis</b></summary>

Menurut dokumen GitHub, aturan cabang (klasik maupun *rulesets*) di akun gratis hanya untuk repo publik. Jadikan repo publik sesudah memastikan riwayatnya bebas rahasia (1.2), atau pakai paket berbayar; sampai itu, **L1** belum terbukti.

</details>

<details>
<summary><b>Cabang PR tertinggal dari <code>main</code></b></summary>

Akibat **Require branches to be up to date before merging**. Menurut dokumen GitHub (dibaca 5 November 2026): klik **Update branch** di bagian *merge* halaman PR; atau di cabangmu: `git pull --no-rebase --no-edit origin main`, lalu `git push`. Robot berjalan lagi; dua PR bernomor sama? Satpam versi meminta yang belakangan naik lagi.

</details>

***Image* dan GHCR**

<details>
<summary><b><code>exec format error</code>, atau <i>job</i> <code>bangun</code> lambat sekali</b></summary>

`exec format error` = program prosesor lain DIJALANKAN tanpa emulator. Lab penulis (`Dockerfile` backend LAMA, `--platform linux/amd64` di laptop arm64): `#8 3.063 exec /bin/sh: exec format error` di `RUN npm ci --omit=dev`. Obatnya `FROM --platform=$BUILDPLATFORM` ([7.1](#71--dua-dockerfile-lintas-prosesor-dengan-buildplatform-8-menit)). `bangun` lambat sekali dengan `Dockerfile` lama = emulasi diam-diam: pembangun `setup-buildx-action` membawa emulatornya (Konsep 5; belum dicoba penulis di GitHub).

</details>

<details>
<summary><b>Kirim ke GHCR ditolak: <code>must be lowercase</code>, <code>denied</code>, atau <code>permission_denied</code></b></summary>

Nama toko wajib huruf kecil: robot sudah (`ghcr.io/${GITHUB_REPOSITORY_OWNER,,}`), `TOKO_IMAGE` di `.env` belum tentu (lab penulis: `… repository name (<Akun>/rumah-pintar-mini-backend) must be lowercase`). `denied`/`permission_denied` di `bangun` (belum direkam penulis): `packages: write` hilang, atau paket Modul 26 bernama sama tidak tertaut ke repo. Menurut dokumen GitHub (dibaca 5 November 2026): **Package settings** → **Manage Actions access** → **Add repository** → `rumah-pintar-mini`, **Role** **Write**; lalu **Re-run failed jobs**.

</details>

<details>
<summary><b>Tarik <i>image</i> ditolak: <code>unauthorized</code>, atau <code>no matching manifest for linux/amd64</code></b></summary>

Belum direkam penulis. `unauthorized` tanpa *login* = paket masih privat (9.7), backend DAN web. `no matching manifest for linux/amd64` (Pi: `linux/arm64`) = *tag* itu satu prosesor, biasanya kiriman tangan (Modul 26, atau `docker push` 7.2). Robot tidak menimpa *tag* versi yang sudah ada: obatnya versi berikutnya lewat PR.

</details>

<details>
<summary><b><code>docker compose build</code> pertama kali: <code>already exists</code></b></summary>

Lab penulis (Compose 2.40.3): `ERROR: image "…/rumah-pintar-mini-backend:1.5.0": already exists`. `migrasi` dan `backend` berbagi nama *image*, jadi dua ekspor bertabrakan. Ulangi perintahnya; percobaan kedua lulus. Sejak Modul 29 hanya di laptop (7.2).

</details>

***Staging* merah**

<details>
<summary><b><code>layanan jatuh bangun (Restarting)</code> di <i>staging</i></b></summary>

Contohnya di [8.3](#83--yang-ditangkap-staging-broker-salah-tulis-tanpa-tag-vps-dan-pi-tidak-tersentuh-5-menit): `GAGAL  layanan jatuh bangun (Restarting): mosquitto -> docker compose logs <layanan>`; langkah log sesudahnya menulis sebabnya. Betulkan di cabang baru dan naikkan versi (`main` sudah membawa nomor yang merah), lalu PR. VPS dan Pi tetap di rilis sebelumnya.

</details>

<details>
<summary><b><code>required variable MQTT_PASSWORD is missing a value</code>, dan setelan wajib baru lainnya</b></summary>

Lab penulis (robot tiruan, latihan: setelan wajib baru tidak ditulis di *job* `staging`): PR hijau (tidak ada *job* PR yang membaca setelan Compose); sesudah *merge*, `staging` merah di `docker compose pull --quiet`: `… required variable SAPAAN_DASHBOARD is missing a value: isi SAPAAN_DASHBOARD di .env`; langkah log ikut merah, pesannya sama. Setelan wajib baru ditulis di DUA tempat: langkah `.env staging …` di `ci.yml` dan `.env` mesin produksi (+ `.env.example`). Tanpa `.env` sama sekali: `required variable MQTT_PASSWORD is missing a value: isi MQTT_PASSWORD di .env` (lab penulis, laptop).

</details>

<details>
<summary><b><code>--wait</code> habis waktu 300 detik, atau <i>staging</i> lama sekali</b></summary>

`up -d --no-build --wait --wait-timeout 300` menunggu layanan ber-*healthcheck* (database, backend, Grafana) sehat paling lama 5 menit; merah = ada yang tidak pernah sehat (lab penulis: `container … is unhealthy`): baca langkah log. Hijau tetapi lama: robot GitHub menarik ±1,14 GB per *staging* (batas `timeout-minutes: 15`); waktunya belum diukur penulis (lab: 51–75 detik, *image* dasar lokal).

</details>

***Tag* rilis dan menjalankan ulang**

<details>
<summary><b><i>Tag</i> rilis tidak dibuat, atau <code>pasang-vps</code> dilewati sesudah Re-run all jobs</b></summary>

*Tag* hanya dibuat sesudah `staging` lulus, untuk versi yang belum bertanda ([9.1](#91--tahap-b4-bagian-1-job-tandai-rilis-5-menit)); *merge* tanpa versi naik memang tanpa rilis. **Re-run all jobs** mengulang dari awal padahal *tag*-nya ada (lab penulis, *forge* tiruan): `v2.0.0 sudah dirilis: tidak ada rilis baru dari push ini`, lalu `staging`, `tandai-rilis`, `pasang-vps` dilewati. Untuk `pasang-vps` yang merah: **Re-run failed jobs**.

</details>

<details>
<summary><b><code>would clobber existing tag</code> di VPS atau Pi</b></summary>

*Tag* `v…` dipindah di GitHub. `git fetch --tags` di VPS dan Pi menolak menimpa *tag* yang sudah ada (lab penulis, Git sungguhan): `! [rejected] v2.0.2 -> v2.0.2 (would clobber existing tag)`, lalu `GAGAL: tidak bisa mengambil tag dari GitHub: …`; rilis baru tidak terpasang lagi. Cegah dengan aturan 10.8; memulihkannya = langkah tangan darurat (*runbook* Modul 30).

</details>

**`pasang-vps` dan SSH**

<details>
<summary><b><code>kunci-robot-belum-dibatasi-command: command not found</code></b></summary>

Lab penulis (robot tiruan, kunci robot di VPS tanpa awalan, seperti hasil `ssh-copy-id`): `bash: line 1: kunci-robot-belum-dibatasi-command: command not found` · `##[error]Process completed with exit code 127.`. Kata itu penanda, yang diabaikan VPS bila ada `restrict,command="…"`. Betulkan barisnya ([10.3](#103--baris-kunci-robot-di-authorized_keys-vps-restrict-dan-command-ditulis-sendiri-6-menit)), uji `whoami` (10.4), lalu **Re-run failed jobs**.

</details>

<details>
<summary><b><code>REMOTE HOST IDENTIFICATION HAS CHANGED!</code> lalu <code>Host key verification failed.</code></b></summary>

Lab penulis (robot tiruan, `VPS_KNOWN_HOSTS` milik mesin lain): `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` … `Host key verification failed.`, kode `255`: robot memang menolak sidik yang beda. Sebab biasa: VPS dipasang ulang; tanpa `WARNING` = `VPS_HOST` beda alamat dengan yang di-*keyscan*. Ulangi 10.5 (cocokkan sidiknya!), ganti `VPS_KNOWN_HOSTS` (10.6), **Re-run failed jobs**.

</details>

<details>
<summary><b><code>Permission denied (publickey)</code></b></summary>

Lab penulis (robot tiruan, **Secrets** berisi kunci lain): `rumah@203.0.113.10: Permission denied (publickey).`, kode `255`. **Secrets** `VPS_KUNCI_SSH` = seluruh `~/.ssh/robot_rumah` (`-----BEGIN …` sampai `-----END …`), bukan `.pub`; `authorized_keys` VPS memuat pasangannya, satu baris utuh; `VPS_USER` kosong (= `rumah`). Isi **Secrets** hanya bisa diganti: tempel ulang, **Re-run failed jobs**.

</details>

<details>
<summary><b><code>cannot open /home/rumah/rumah-pintar-mini/skrip/pasang.sh</code></b></summary>

Lab penulis ("VPS" tiruan): `sh: 0: cannot open /home/rumah/rumah-pintar-mini/skrip/pasang.sh: No such file`. `VPS_HOST` diisi sebelum `pasang.sh` ada di VPS: kerjakan 10.1, lalu **Re-run failed jobs**.

</details>

<details>
<summary><b><code>VPS tidak melaporkan v… terpasang</code>, atau robot tidak bisa masuk ke port 22</b></summary>

`GAGAL  VPS tidak melaporkan v<versi> terpasang (baca laporan pasang.sh di atas)`: SSH berhasil, tetapi laporan `pasang.sh` tidak menyebut versi itu. Baca baris `GAGAL:` di atasnya, atau kamu mengulang *run* LAMA (lab penulis: `… v1.9.9 terpasang …`): ulangi *run* terbaru saja. Robot tidak bisa masuk sama sekali (`ConnectTimeout=20` habis; pesannya belum direkam penulis): port 22 dikunci ke alamat rumah? Alamat robot GitHub berganti-ganti; buka port 22, hanya untuk kunci (Konsep 7).

</details>

**`pasang.sh` di VPS atau Pi**

<details>
<summary><b><code>ada berkas yang disunting langsung di mesin ini</code>, atau salinan repo <code>bukan main</code></b></summary>

Lab penulis ("VPS" tiruan, sesudah `chmod +x skrip/pasang.sh`):

```text
2026-11-04 02:43:55 UTC GAGAL: ada berkas yang disunting langsung di mesin ini (lihat: git diff):
 M skrip/pasang.sh
```

Git mencatat izin berkas juga ([9.3](#93--pemasang-satu-skrip-skrippasangsh-dan-dua-berkas-unit-7-menit)). Ubahan yang perlu → PR; berkasnya dikembalikan (lab penulis: sesudah `chmod -x`, `v2.0.2 sudah terpasang (pusat)`). Teks dari kode: `GAGAL: salinan repo di mesin ini sedang di <cabang>, bukan main: git switch main`.

</details>

<details>
<summary><b><code>berisi versi …, padahal rilis terbaru …</code>, atau <code>tidak bisa maju lurus</code></b></summary>

Teks dari kode: `GAGAL: salinan repo di mesin ini berisi versi …, padahal rilis terbaru … (git pull tangan?). …`: versi yang belum lulus *staging* tidak dipasang; begitu *tag*-nya ada, putaran berikutnya memasangnya. `GAGAL: main di mesin ini tidak bisa maju lurus ke v…: …`: *commit* buatan mesin itu, atau berkas tak terlacak bernama sama dengan berkas baru (lab penulis: `untracked working tree files would be overwritten by merge`). Pindahkan berkas itu ke luar folder repo; *commit* buatan mesin = darurat (Modul 30).

</details>

<details>
<summary><b><code>image untuk v… belum bisa ditarik</code></b></summary>

Teks dari kode: `GAGAL: image untuk v… belum bisa ditarik (sebabnya di pesan Docker di atas). …`. Pesan Docker-nya: `unauthorized` (paket privat, 9.7), `must be lowercase` (`TOKO_IMAGE`), `required variable … is missing a value` (`.env` mesin itu), atau `not found` (versi tidak ada di toko; lab penulis: `… failed to resolve reference "ghcr.io/<akun>/rumah-pintar-mini-backend:9.9.9": …: not found`). Betulkan, lalu ulangi (Pi: putaran berikutnya; VPS: **Re-run failed jobs**).

</details>

<details>
<summary><b>Belum sehat sesudah dipasang: <code>gagal dinyalakan atau belum sehat</code>, <code>bukan versi</code>, atau <code>restart mosquitto gagal</code></b></summary>

Teks dari kode: `GAGAL: pusat gagal dinyalakan atau belum sehat (paling lama 5 menit): docker compose ps -a, lalu docker compose logs <layanan>`; uji asap: `GAGAL  layanan jatuh bangun (Restarting): …`, `GAGAL  backend tidak tersambung ke database: …`, `GAGAL  backend berjalan dengan …, bukan versi …`. Jalankan perintah yang disebutnya. `GAGAL: restart mosquitto gagal: …` (lab penulis, Docker tiruan): putaran berikutnya mengulang *restart*-nya, lalu sekali per rilis (`… sudah di-restart untuk v…: dilewati`).

</details>

<details>
<summary><b><code>jangan dijalankan dengan sudo atau sebagai root</code>, atau <code>PASANG_BAGIAN</code> salah tulis</b></summary>

Lab penulis (Docker tiruan): `GAGAL: jangan dijalankan dengan sudo atau sebagai root: …`. Jalankan `sh skrip/pasang.sh` tanpa `sudo`; salinan unit Pi wajib punya `User=` (11.2). `GAGAL: PASANG_BAGIAN berisi "…"; …` atau `GAGAL: PASANG_BAGIAN kosong; …`: periksa `Environment=` di salinan unit; jalur gratis berpetik: `Environment="PASANG_BAGIAN=pusat gerbang"`.

</details>

<details>
<summary><b><code>tidak bisa mengambil tag dari GitHub</code></b></summary>

Teks dari kode: `GAGAL: tidak bisa mengambil tag dari GitHub: baca pesan git di atas (internet? alamat origin: git remote -v; tag rilis dipindah di GitHub: would clobber existing tag; berkas .git milik root: Permission denied)`. Yang terakhir = git pernah dijalankan dengan `sudo`; kembalikan pemilik folder repo ke penggunamu sekali (`chown -R`, pola 5.3 Modul 27; belum dicoba penulis). Repo privat: butuh kunci baca repo.

</details>

<details>
<summary><b><code>Some service image(s) must be built from source</code>: jangan menghapus <code>--no-build</code></b></summary>

Lab penulis (Compose 2.40.3, versi baru belum di toko): `pull` menulis `WARNING: Some service image(s) must be built from source by running:` dan kode `1`; `up -d --no-build` pun berhenti (`No such image: …`), kontainer LAMA tetap `Up (healthy)`. Tanpa `--no-build`, Compose membangun sendiri di VPS/Pi versi yang tidak pernah digladi. Di VPS/Pi selalu `--no-build`; *image* belum ada = tunggu robot.

</details>

**Jam weker Pi**

<details>
<summary><b>Jam weker tidak muncul di <code>list-timers</code>, atau jurnalnya kosong</b></summary>

Yang dinyalakan `.timer`, bukan `.service` ([11.4](#114--nyalakan-jam-weker-enable---now-dan-list-timers-5-menit)); `.service` tanpa `[Install]`. Salinan unit diubah? `sudo systemctl daemon-reload`. Jurnal kosong: nama di `journalctl -u` salah ketik, atau belum berdering (`NEXT`, `LEFT`); paksa: `sudo systemctl start rumahpintar-perbarui.service`.

</details>

<details>
<summary><b><code>systemd-analyze verify</code> menulis <code>Failed to parse</code>, <code>Timer unit lacks value setting. Refusing.</code>, atau <code>Neither a valid executable name nor an absolute path</code></b></summary>

Lab penulis (systemd 259.9, salinan dirusak): `Failed to parse timer value, ignoring: 5 menit` + `rumahpintar-perbarui.timer: Timer unit lacks value setting. Refusing.` → `5min`, `15min`. `Failed to parse Type=sekali, ignoring: Invalid argument`, `Neither a valid executable name nor an absolute path: skrip/pasang.sh` → `Type=oneshot`, jalur penuh. `Unit docker.service not found.` = mesin tanpa Docker. *Drop-in* yang mengosongkan `OnUnitActiveSec=` tanpa `OnBootSec=` menghapus SEMUA jadwal (🧩 Tingkat 1). Betulkan, `verify` sampai diam, `daemon-reload`.

</details>

<details>
<summary><b>Jam weker berjalan sebagai root, atau pengguna Pi bukan anggota grup <code>docker</code></b></summary>

Tanpa `User=` di salinan `.service`, jam weker berjalan sebagai root, dan `pasang.sh` menolak: tulis `User=budi` (penggunamu), lalu `daemon-reload`. Pengguna itu wajib anggota grup `docker` (`groups budi`; bila bukan, Docker menolak soketnya, pesannya belum direkam penulis): masukkan ke grup itu seperti 6.1 Modul 26, lalu satu putaran `sudo systemctl start rumahpintar-perbarui.service`.

</details>

**Produksi masih versi lama**

<details>
<summary><b>Layar masih menulis versi lama, atau <code>/api/health</code> tanpa <code>versi</code></b></summary>

PWA: muat ulang **dua kali**. `/api/health` tanpa `"versi"` = backend mesin itu masih 1.5.0: kerjakan 10.1 (jalur gratis 11.1). `"versi"` lama padahal *tag* baru ada: VPS = log `pasang-vps` ([12.4](#124--l2-robot-memasang-vps-layar-masuk-menulis-v201-8-menit)); Pi = tunggu (biasanya paling lambat ±17 menit + menarik *image*), lalu `journalctl`. *Tag* belum ada: robot belum selesai atau `staging` merah.

</details>

<details>
<summary><b><code>Healthy</code> padahal jatuh bangun, atau layanan yang mogok sesudah ±10 detik lolos pemeriksaan</b></summary>

`up --wait` menulis `Healthy` untuk layanan tanpa *healthcheck* (Mosquitto, Caddy) walau jatuh bangun; karena itu ada uji asap (8.3). Uji asap memeriksa sekali, 15 detik sesudah menyala: yang mogok sesudah ±10 detik bisa terlihat `running`. Curiga? `docker compose ps` beberapa kali, lalu `docker compose logs <layanan>`. Pemantau terus-menerus = Modul 30.

</details>

<details>
<summary><b>Disk VPS atau Pi makin penuh oleh <i>image</i> lama</b></summary>

Setiap rilis meninggalkan *image* lama (lab penulis, "Pi" tiruan: ±100 MB per rilis, contoh); lihat `docker system df`. Jangan `docker compose down -v` (lemari data terhapus) atau `prune` dengan tangan; `pasang.sh` pun tidak. Membereskannya dengan aman = Modul 30.

</details>

**Pesan yang boleh diabaikan**

<details>
<summary><b>Boleh diabaikan: <code>4 moderate severity vulnerabilities</code>, <code>PWA v2.0.0</code>, <code>unknown/unknown</code>, <code>belum ada rilis</code> sebelum PR B, dan <code>PERINGATAN  backend belum tersambung ke broker</code> sesaat</b></summary>

- `4 moderate …` (backend, per 4 November 2026): tingkat sedang; robot merah hanya untuk tinggi dan kritis (2.5).
- `PWA v2.0.0` = versi paket `vite-plugin-pwa`.
- `unknown/unknown` di `imagetools inspect` = catatan asal-usul *build*.
- `belum ada rilis (tag v<versi>) di GitHub: …` = robot belum pernah membuat *tag*.
- `PERINGATAN  backend belum tersambung ke broker …` = backend masih menyambung; masih `"broker":false` beberapa menit kemudian? `docker compose logs backend`.

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: tiga opsi Silabus (Wokwi CI, `node:test`, Playwright), jalan lain yang sengaja tidak diambil, dan cara penulis menguji. Kecuali ditandai "lab penulis" atau "riset", isinya dari dokumen resmi (dibaca 31 Oktober–5 November 2026) dan **belum dijalankan penulis**.

<details>
<summary><b>Wokwi CI: firmware diuji robot di simulator (bacaan, tidak diuji penulis)</b></summary>

Opsi Silabus: robot menyalakan firmware di simulator Wokwi di *cloud* dan menunggu satu kalimat di Serial. Menurut dokumen Wokwi, *action* `wokwi/wokwi-ci-action@v1` (v1.3.0) dipasang sesudah langkah kompilasi firmware (lipatan *Firmware di robot …*), dengan *input* `token`, `path` (folder `wokwi.toml`), dan `expect_text` (kalimat yang ditunggu); tokennya (diawali `wok_`, 44 karakter) dibuat di dashboard Wokwi CI dan disimpan di **Secrets** sebagai `WOKWI_CLI_TOKEN`. Kenapa tidak di jalur utama:

- Butuh akun Wokwi dan token sungguhan, yang tidak dipakai di lab penulis: belum diuji.
- *Action*-nya mengunduh program Wokwi untuk Linux x64 saja: jalan di `ubuntu-24.04`, tidak di *runner* ARM64 atau di Pi.
- Kuota belum jelas: menurut dokumen Wokwi, akun gratis 50 menit simulasi per 30 hari (paling lama 5 menit per sesi), tetapi halaman harganya hanya mencantumkan menit CI untuk Wokwi Pro. Cek ulang.
- Repo-mu belum punya `wokwi.toml`.

Jalur utama cukup dua pemeriksaan murah di `periksa` ([Konsep 4](#4-lint--test--build-gagal-cepat)).

</details>

<details>
<summary><b><code>node:test</code>: tes yang sama tanpa Vitest</b></summary>

Node.js punya alat tes bawaan, `node:test` (stabil sejak Node 20); Node 24 menjalankan berkas `.ts` langsung, dan panduan *Testing* resmi Fastify memakai `node:test` bersama `app.inject`. Tes pertama `versi.test.ts` (Modul 28) ditulis ulang penulis di berkas latihan `backend/src/services/versi.node.test.ts` (tidak ada di `kode/`, tidak di-*commit*):

```ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bandingkanVersi } from "./versi.ts";

describe("bandingkanVersi", () => {
  it("MAJOR, lalu MINOR, lalu PATCH; hasil -1, 0, atau 1", () => {
    assert.equal(bandingkanVersi("1.7.1", "1.7.0"), 1);
    assert.equal(bandingkanVersi("1.7.0", "1.7.1"), -1);
    assert.equal(bandingkanVersi("1.7.1", "1.7.1"), 0);
    assert.equal(bandingkanVersi("2.0.0", "1.99.99"), 1);
    assert.equal(bandingkanVersi("1.6.0", "1.7.0"), -1);
  });
});
```

`describe` dan `it` sama; `expect(…).toBe(1)` menjadi `assert.equal(…, 1)`. Di terminal folder `backend`:

```text
node --test src/services/versi.node.test.ts
```

**Hasilnya (lab penulis, laptop; Node 24.21.0):**

```text
▶ bandingkanVersi
  ✔ MAJOR, lalu MINOR, lalu PATCH; hasil -1, 0, atau 1 (6.315054ms)
✔ bandingkanVersi (21.165856ms)
ℹ tests 1
ℹ suites 1
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 830.923892
```

Kode keluar `0`. Ubah `1` di ujung baris `assert.equal` pertama menjadi `2`: keluarannya memuat `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:` (`actual: 1,` `expected: 2,`) dan kode keluar `1`, bahasa yang sama untuk robot. Hapus berkas latihannya sesudah mencoba. Proyek tetap Vitest: 223 tes sudah memakainya, Silabus memilih Vitest untuk kedua folder, dan *coverage* `node:test` masih eksperimental menurut dokumen Node.

</details>

<details>
<summary><b>Playwright: satu alur Masuk → dashboard sebagai <i>end-to-end test</i></b></summary>

Puncak piramida ([Konsep 1](#1-piramida-uji-bahan--resep--dapur--pelanggan)) masih kosong. Playwright (`@playwright/test` 1.64.1) mengendalikan peramban sungguhan dari program: buka `/masuk`, isi email dan sandi, klik **Masuk**, lalu tunggu kepala dashboard dengan nomor versinya. Satu tes itu melewati jalan yang sama dengan pemakai: peramban → Caddy → backend → database.

Menurut dokumennya, Playwright mendukung Ubuntu 26.04 arm64. Di robot, `npx playwright install --with-deps` mengunduh peramban dan paket sistemnya setiap *run*, dan contoh CI resminya (masih `actions/checkout@v6`) menyimpan laporan sebagai *artifact* (berkas hasil *job* yang disimpan GitHub untuk diunduh) lewat `actions/upload-artifact@v4`. Tempat alaminya *job* `staging`, satu-satunya tempat seluruh tumpukan menyala, sesudah uji asap; harganya unduhan peramban dan menit robot setiap rilis, ditambah akun uji, karena database *staging* selalu kosong. Belum dijalankan penulis: unduhan Playwright (`playwright-core`) tidak diizinkan di lab ini.

</details>

<details>
<summary><b><i>Pin</i> SHA, Dependabot, dan <code>actions.lock</code>: kenapa kurikulum memakai <i>tag</i> mayor</b></summary>

`uses: actions/checkout@v7` mengikuti rilis v7 terbaru penerbitnya ([Konsep 6](#6-toko-image-dan-izin-robot-github_token-permissions-secrets-dan-variables)). Dokumen keamanan GitHub (dibaca 5 November 2026) menyarankan yang lebih ketat:

- ***Pin* SHA**: `uses: actions/checkout@<SHA commit 40 karakter>` + komentar versinya; SHA tidak bisa dipindah, jadi isi *action* tidak berganti diam-diam. Ambil SHA dari *tag* rilis repo aslinya, bukan dari *fork* atau contoh dokumen (SHA di contoh dokumen GHCR tidak cocok dengan *tag* rilis mana pun, dicek penulis 31 Okt).
- **Dependabot**, bot GitHub pengawas versi dan celah keamanan, tidak memberi peringatan celah untuk *action* ber-*pin* SHA, hanya untuk yang bertag versi.
- ***Workflow lockfile*** `.github/workflows/actions.lock` mencatat *commit* setiap *action* beserta *action* yang dipakainya. Dokumen menyebutnya perlindungan terkuat, pengganti *pin* SHA; statusnya masih *public preview* sejak 14 Okt 2026.

Kurikulum memilih *tag* mayor dari `actions/…` dan `docker/…` saja, supaya setiap baris terbaca pemula. Catatan alat: actionlint 1.7.12 (pemeriksa berkas *workflow*; `ci.yml` 0 galat di lab penulis) belum mengenal *input* `checkout@v7`, `cache@v6`, dan `setup-node@v7`, jadi salah ketik di sana lolos.

</details>

<details>
<summary><b><i>Runner</i> sendiri di Pi (<i>self-hosted</i>): kenapa berbahaya untuk repo publik</b></summary>

Pi yang menyala terus tampak seperti mesin robot gratis: pasang program *runner* GitHub, daftarkan ke repo, lalu `runs-on: self-hosted`. Untuk repo publik, jangan. Mesin sewaan GitHub dibuang sesudah setiap *job* ([Konsep 3](#3-ci-robot-yang-membaca-kode-keluar)); *runner* sendiri tidak, padahal siapa pun boleh membuka PR ke repo publik, dan kode PR itu ikut berjalan di Pi-mu, di jaringan rumah, bahkan bisa menetap di sana. Kata dokumen keamanan GitHub (dibaca 5 November 2026), *runner* sendiri "should almost never be used for public repositories". Di repo privat pun, risiko itu datang dari siapa saja yang bisa membuka PR.

Tarif platform *runner* sendiri yang diumumkan untuk Maret 2026 ditunda GitHub tanpa tanggal baru; dokumen tagihannya masih menulisnya gratis. Jam weker Pi ([Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)) tidak butuh *runner*: Pi hanya **bertanya** ke GitHub, tidak menjalankan kode PR siapa pun.

</details>

<details>
<summary><b>Tiga cara dua prosesor: <i>runner</i> ARM64 asli, QEMU, dan BuildKit yang membawa emulatornya sendiri</b></summary>

[Konsep 5](#5-satu-image-untuk-dua-prosesor-dibuat-robot-tanpa-emulasi) memilih *cross-build* `$BUILDPLATFORM` ([7.1](#71--dua-dockerfile-lintas-prosesor-dengan-buildplatform-8-menit)). Dua cara pertama belum dijalankan penulis:

- ***Runner* ARM64 asli** `ubuntu-24.04-arm` (gratis untuk repo publik; di repo privat memotong kuota): tiap prosesor dibangun di mesinnya sendiri (matriks dua *job*), lalu digabung menjadi satu indeks dengan `docker buildx imagetools create`, atau otomatis lewat *workflow* siap pakai `docker/github-builder` (v1), yang contoh resminya meminta izin `id-token: write`.
- **QEMU**: `docker/setup-qemu-action@v4` mendaftarkan emulator ke kernel mesin robot. Aman di mesin sewaan yang dibuang sesudah *job*, tetapi di mesinmu sendiri itu mengubah setelan sistem.
- **Emulator bawaan BuildKit** (koreksi kecil untuk lipatan *Satu image untuk dua arsitektur …* di [🔬 Modul 26](../modul-26-docker-compose/README.md#-bedah-teknis-opsional)): "emulatornya harus didaftarkan dulu ke kernel" benar untuk pembangun bawaan Docker (*driver* `docker`), yang gagal seketika dengan `exec format error`. Pembangun *driver* `docker-container` buatan `setup-buildx-action` membawa emulatornya sendiri dan memakainya diam-diam: di riset penulis 31 Okt (Pi 5, arm64 → amd64), daftar prosesornya tanpa amd64, tetapi `Dockerfile` lama backend lulus dalam 162 detik lewat emulator itu (*cross-build*: 16 detik).

Pembangun itu memakai `moby/buildkit:buildx-stable-1`, *tag* bergerak: BuildKit v0.33.1 di riset 31 Okt, v0.34.2 di log `bangun` lab akhir 4 Nov. Mau persis seperti aturan Modul 26? Langkah `setup-buildx-action` belum punya `with:`; tambahkan `with:` berisi `driver-opts: image=moby/buildkit:v0.34.2`.

</details>

<details>
<summary><b>Bagaimana penulis menguji: robot tiruan, toko <i>image</i> lokal, dan "VPS" serta "Pi" tiruan</b></summary>

Semua kotak **Hasilnya** dibuat di satu Raspberry Pi 5 (Ubuntu 26.04 arm64), tanpa akun GitHub, VPS, Pi kedua, atau domain, dalam dua tahap:

1. **Saat kode ditulis:** program kecil penulis menjalankan blok `run:` `ci.yml` apa adanya (`uses:` ditiru); skrip diuji dengan `docker` tiruan, kunci robot dengan SSH sungguhan ke kontainer Alpine, berkas unit dengan `systemd-analyze verify` (systemd 259.9).
2. **Lab akhir, 4 November 2026:** `ci.yml` dijalankan apa adanya, juga `uses:`, oleh *forge* tiruan Gitea 28.2.0 (pengganti GitHub) dengan Gitea Runner 5.2.4 (dulu bernama `act_runner`); *action* resmi diunduh dari github.com tanpa akun. Docker robot, "VPS", dan dua "Pi" masing-masing satu kontainer Docker-in-Docker (*dind*) yang wajib `--privileged`; robot masuk ke "VPS" lewat SSH sungguhan dengan kunci `restrict,command=`. GHCR = toko *image* lokal (`registry:3.1.2`) tanpa sandi, bernama `ghcr.io` hanya di DNS lab, jadi "tarik tanpa *login*" di lab bukan bukti paket GHCR publik. Jam weker = penjadwal tiruan tiap ±1 menit; semuanya HTTP lokal tanpa domain, tanpa emulasi.

Teks layar Gitea, juga baris `remote:` saat *push*, tidak pernah dikutip sebagai teks GitHub. Dua gambar di bawah = **tiruan lokal (Gitea 28.2.0), bukan layar GitHub**: teks, tombol, dan durasinya milik Gitea di Pi 5.

![Komposit dua tangkapan layar asli forge tiruan Gitea 28.2.0 di lab penulis, bukan layar GitHub; Chrome 156 di Linux, laptop 1280 piksel, mode terang. Bedah Teknis 7, 4 Nov 2026; robot = Gitea Runner 5.2.4 dengan mesin tiruan Docker-in-Docker menjalankan ci.yml modul ini; teks, ikon, dan durasi milik Gitea di Raspberry Pi 5. Atas, run PR merah 10.51 sampai 10.54 WIB: judul bersilang merah coba: tes integrasi sengaja merah (tangkapan aturan cabang) #3, teks dalam kurung = catatan kerja penulis, dan tombol Re-run failed jobs (nomor 1); daftar job: periksa hijau 2m42s, uji gagal 1m54s (nomor 2), bangun, staging, tandai-rilis, pasang-vps dilewati 0s (nomor 3); Status Failure, Total duration 2m42s, dan 6 jobs · 4 dependencies · 17% success (nomor 4); grafik periksa dan uji, bangun, staging. Bawah, run rilis 2.0.1 sesudah merge PR, 10.57 sampai 11.02 WIB: Merge pull request Layar Masuk: teks ajakan lebih jelas (2.0.1) (#3) from perbaikan/teks-masuk into main #5; keenam job hijau: periksa 1m51s, uji 1m24s, bangun 1m44s, staging 55s, tandai-rilis 4s, pasang-vps 28s (nomor 5); Status Success, Total duration 5m12s, Artifacts 2 = catatan build .dockerbuild dari build-push-action, bukan image (nomor 6). Legenda bernomor dua kolom di bawah.](aset/robot-tiruan-hijau-merah.png)

*Merge* PR merah lewat API *forge* dijawab `HTTP 405` dengan `Not all required status checks successful`, juga untuk admin situs dengan pilihan paksa, sama dengan riset penulis 31 Okt. Tombol `Create merge commit (When checks succeed)` khas Gitea (menjadwalkan *merge*); kotak *merge* GitHub ada di rekonstruksi [Konsep 11](#11-aturan-cabang-palang-di-depan-main).

![Tangkapan layar asli forge tiruan Gitea 28.2.0 di lab penulis, bukan layar GitHub; Chrome 156 di Linux, laptop 1280 piksel, mode terang. Bedah Teknis 7, 4 Nov 2026 pukul 10.54 WIB, masuk sebagai pemilik repo lab; teks, tombol, dan warna milik Gitea. Halaman pull request coba merah (jangan di-merge) #2, Open, PembacaM29 wants to merge 1 commits from coba/merah into main, tab Conversation; blok komentar PR (catatan kerja penulis) dipotong; satu komit coba: tes integrasi sengaja merah (tangkapan aturan cabang) dengan tanda silang, teks dalam kurung = catatan kerja penulis. Kotak check: Some required checks failed (nomor 1); ci / uji (pull_request) Failing after 1m54s, Required (nomor 2); ci / periksa (pull_request) Successful in 2m42s dan ci / bangun (pull_request) Skipped, keduanya Required (nomor 3); staging, tandai-rilis, pasang-vps Skipped; Some required checks were not successful. (nomor 4); There is no key available to sign this commit.; tombol merah Create merge commit (When checks succeed) dengan panah pilihan (nomor 5; khas Gitea); View command line instructions. Legenda di kanan: merge lewat API dijawab HTTP 405 Not all required status checks successful, juga untuk admin situs.](aset/pr-merah-diblok-tiruan.png)

**Beda dengan GitHub**, jadi angka waktunya hanya contoh: mesin arm64, bukan amd64; *image* pihak ketiga dimuat dari mesin, bukan ditarik ±1,14 GB; Gitea mengabaikan `environment`. **Kerepotan khas lab**, bukan masalahmu di GitHub, VPS, atau Pi: nama tanpa titik tidak diteruskan DNS Docker dari lorong *job* (obatnya `--add-host`); profil AppArmor `mosquitto` mesin penulis menempel ke Mosquitto di Docker bersarang, diatasi berkas Compose lab di luar Git.

**Mau meniru tanpa akun GitHub?** Kontainer `--privileged` setara root di mesinmu: pakai mesin latihan, bukan mesin berisi data rumah, dan hapus semuanya sesudahnya. Pastikan `ghcr.io` di setiap *dind* menunjuk toko lokalmu; penulis sekali lupa, dan *login* robot sampai ke GHCR sungguhan (ditolak `denied`, tanpa kirim atau tarik apa pun). Yang diuji, ditiru, dan hanya dari dokumen: kotak status di awal modul. Mesin, versi, dan padanan nama: [📚](#-sumber--atribusi-gambar).

</details>

<details>
<summary><b>Firmware di robot: kompilasi-cek tanpa <i>artifact</i>, karena berkas <code>.bin</code> berisi kunci</b></summary>

Robot menjaga firmware hanya dengan dua pemeriksaan murah ([Konsep 4](#4-lint--test--build-gagal-cepat), [4.1](#41--githubworkflowsciyml-tahap-a-job-periksa-dan-uji-15-menit)). Langkah berikutnya yang wajar: **kompilasi-cek** Node 1 dan Node 2 di setiap PR, supaya salah ketik C++ ketahuan sebelum *merge*. Bentuknya (belum dijalankan penulis di robot): `arduino-cli` 1.5.1, paket `esp32:esp32` 3.3.12, dan library versi persis (Node 1: Modul 28; Node 2: Modul 14); `kunci.contoh.h` disalin menjadi `kunci.h` di kedua folder (kunci contoh, bukan kuncimu); lalu `arduino-cli compile`. Paket esp32 = unduhan ±1,8 GB per *run*, kecuali `~/.arduino15` disimpan dengan `actions/cache`. PlatformIO juga mendukung 3.3.12 sejak `platform-espressif32` v8.0.0 (19 Okt 2026); kurikulum tetap `arduino-cli`, yang memakai paket papan yang sama dengan Arduino IDE-mu.

Yang **tidak** boleh: *artifact* firmware. Berkas `.bin` Node 1 memuat kunci ESP-NOW dan sandi portal dari `kunci.h`; firmware sungguhan yang dibangun robot (dengan kunci dari **Secrets**) lalu disimpan sebagai *artifact* bisa diunduh orang lain dari repo publik. Firmware sungguhanmu tetap dikompilasi di laptop, lalu diunggah lewat dashboard (Modul 28).

</details>

<details>
<summary><b><i>Tag</i> kanal <code>:produksi</code> lawan <i>tag</i> Git: kenapa tidak cukup <code>docker compose pull</code></b></summary>

Bunyi Silabus `docker compose pull && up -d` bisa dipakai harfiah dengan *tag* kanal: robot menempelkan *tag* `produksi` ke versi terbaru, dan berkas Compose di VPS dan Pi menulis `…-backend:produksi`. Kurikulum memilih *tag* Git ([Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)), karena *tag* kanal:

- melanggar "*tag* persis" [Modul 26](../modul-26-docker-compose/README.md#2-cetakan-berlapis-image-tag-digest-dan-arsitektur), seperti `latest`: isinya berganti diam-diam, dan namanya tidak memberi tahu versi yang jalan;
- tidak membawa konfigurasi `edge/` dan berkas Compose, yang datang lewat Git;
- membuat mundur butuh *digest* (`@sha256:…`) versi lama yang kamu catat sendiri, sedangkan *revert* dengan *tag* Git tercatat di riwayat ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)).

*Tag* `v<versi>` mengikat kode, konfigurasi, dan nomor *image* dalam satu *commit*: Pi memasang ketiganya bersama.

</details>

<details>
<summary><b>Conventional Commits dan pembuat rilis otomatis (disebut, tidak dipakai)</b></summary>

Conventional Commits 1.0.0 mengatur pesan *commit*: `jenis(lingkup): keterangan`. Menurut spesifikasinya, `fix` = rilis PATCH, `feat` = MINOR, `BREAKING CHANGE` (atau `!` sesudah jenisnya) = MAYOR, dan jenis lain tidak mengubah versi. Alat pembuat rilis otomatis membaca pesan itu untuk menaikkan versi, menulis `CHANGELOG`, dan membuat *tag*.

Pesan *commit* modul ini mirip bentuknya (`feat: …`, `perbaikan: …`), tetapi hanya untuk manusia: alat itu tidak akan menaikkan versi untuk `perbaikan: …` di PR C. Di kurikulum, nomor versi diputuskan manusia dan dijaga satpam versi, `CHANGELOG.md` ditulis untuk manusia, dan *tag* hanya dibuat robot sesudah *staging* ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)). Rilis GitHub (halaman catatan rilis dari *tag* Git) menjadi etalase di Modul 32; pilihan (c) Tingkat 3 di [🧩](#-tantangan-mandiri) membuatnya otomatis. Jangan membuatnya dengan tangan lewat **Releases** → **Draft a new release**: tombol itu bisa membuat *tag* `v…` baru.

</details>

<details>
<summary><b><i>Cache</i> <code>type=gha</code>, <i>coverage</i>, catatan asal-usul <code>unknown/unknown</code>, dan deskripsi paket</b></summary>

Belum dijalankan penulis, kecuali catatan asal-usul:

- ***Cache* *build* `type=gha`**: `cache-from: type=gha,scope=backend` dan `cache-to: type=gha,mode=max,scope=backend` di `build-push-action` (web: `scope=web`; tanpa `scope`, kedua *image* saling menimpa). Disarankan dokumen Docker untuk GitHub Actions, tetapi berlabel *Experimental*; untungnya kecil bagi kita, karena setiap rilis menaikkan versi di `package.json` sehingga lapis `npm ci` tetap dibangun ulang.
- ***Coverage*** (persen baris kode yang dijalankan tes): `npm i -D -E @vitest/coverage-v8@5.0.5` (versinya wajib sama dengan Vitest), lalu `npx vitest run --coverage`. Angkanya bukan syarat lulus: baris yang dijalankan belum tentu diperiksa.
- **Catatan asal-usul**: dua baris `unknown/unknown` bertanda `attestation-manifest` di `imagetools inspect` ([9.7](#97--paket-ghcr-menjadi-publik-tarik-tanpa-login-dua-prosesor-4-menit)) = catatan asal-usul *build* (*provenance*) buatan `build-push-action` (lab penulis), bukan *image* ketiga. Tidak mau? `provenance: false` di kedua langkah *image* ([7.3](#73--tahap-b2-job-bangun-untuk-linuxamd64-dan-linuxarm64-8-menit)).
- **Deskripsi paket**: menurut dokumen GHCR, *image* dua prosesor mendapat keterangan halaman paketnya dari *annotations* indeks (contohnya `annotation-index.org.opencontainers.image.description=…`), bukan dari `LABEL` di `Dockerfile`; tanpa itu, halaman paketmu kemungkinan tanpa keterangan.

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** Tingkat 1: **terminal SSH ke Pi**. Tingkat 2: **VS Code**, terminal di **akar proyek**. Tingkat 3: **VS Code** dan **GitHub** di browser.

Semuanya opsional (tanpa ⭐), sesudah [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini). Tanpa Pi: lewati Tingkat 1; jalur gratis: Tingkat 3 hanya (c).

### Tingkat 1 — Pi bertanya setiap 5 menit: *drop-in* untuk jam weker (ubah sedikit, 20 menit)

> [!NOTE]
> Belum dijalankan penulis di systemd sungguhan; berkasnya hanya diperiksa `systemd-analyze verify` (systemd 259).

Buat Pi bertanya setiap 5 menit **tanpa** menyunting berkas unit. Caranya *drop-in*: berkas `.conf` yang menimpa sebagian isi jam weker, di folder `/etc/systemd/system/rumahpintar-perbarui.timer.d/` (buat dengan `sudo mkdir -p`; [Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)). Petunjuk: di dokumen *systemd.timer*, cari arti setelan jadwal yang kosong.

**Uji dirimu:** `systemd-analyze verify` seperti [11.3](#113--systemd-analyze-verify-dua-berkas-sekaligus-baca-keluarannya-4-menit) (*drop-in* ikut terbaca) harus tanpa keluaran; lalu `sudo systemctl daemon-reload` dan `sudo systemctl restart rumahpintar-perbarui.timer`. **Lulus kalau** `systemctl show rumahpintar-perbarui.timer -p TimersMonotonic` memuat `OnBootUSec=5min` dan `OnUnitActiveUSec=5min` tanpa `15min`, dan `journalctl -u rumahpintar-perbarui.service` mencatat putaran tiap ±5–7 menit (dari dokumen systemd; belum direkam penulis).

<details>
<summary><b>Kunci Tingkat 1</b></summary>

`jeda-5-menit.conf` tanpa komentar (berkas, cara pasang dan batal: [`tingkat-1/`](kode/tantangan/kunci/tingkat-1/)):

```ini
[Timer]
OnUnitActiveSec=
OnBootSec=5min
OnUnitActiveSec=5min
```

Setiap jadwal yang ditulis berlaku: tanpa `OnUnitActiveSec=` kosong, 15 menit yang lama tetap ada. Nilai kosong mengosongkan **semua** jadwal, juga `OnBootSec=5min` dari berkas asli, jadi baris itu ditulis lagi. Tanpanya, Pi yang dinyalakan ulang diam-diam berhenti memasang rilis: `OnUnitActiveSec` dihitung dari putaran sebelumnya, yang belum ada (dokumen *systemd.timer*). `verify` tidak menangkapnya (masih ada satu jadwal), tetapi aturannya terlihat bila *drop-in* hanya berisi `OnUnitActiveSec=`:

**Hasilnya (lab penulis, systemd-analyze verify; kode `1`):**

```text
rumahpintar-perbarui.timer: Timer unit lacks value setting. Refusing.
Unit rumahpintar-perbarui.timer has a bad unit file setting.
```

Harganya: GitHub ditanya 3× lebih sering (`git fetch` tiap 5 menit); GHCR tetap hanya saat rilis baru (putaran `sudah terpasang` tanpa Docker).

</details>

### Tingkat 2 — Satpam versi: bagian "versi wajib naik" yang masih kosong (isi bagian rumpang, 30 menit)

Kerangka [`cek-versi-rumpang.mjs`](kode/tantangan/kunci/tingkat-2/cek-versi-rumpang.mjs) memeriksa satu nomor di 10 tempat, tetapi bagian 2 ([6.4](#64--satpam-versi-skripcek-versimjs-satu-nomor-di-10-tempat-hanya-boleh-naik-5-menit)) masih TODO: (1) `ikutDipasang()`, daftar berkas yang ikut dipasang; (2) versi turun = `GAGAL`; (3) yang dipasang berubah tanpa versi naik = `GAGAL`. Di akar proyek: `git switch main`, `git pull`, `git switch -c coba/versi`; tempel kerangka (**Copy raw file**) menimpa `skrip/cek-versi.mjs`, isi TODO-nya, lalu *commit* supaya `git restore .` tidak menghapus jawabanmu.

**Uji dirimu:** `git fetch`, lalu setiap baris [tabel percobaan](kode/tantangan/kunci/tingkat-2/README.md#percobaan) (versi = `main`-mu): ubahan kecil, `BASIS=origin/main node skrip/cek-versi.mjs` (PowerShell: seperti 6.7), cocokkan, `git restore .`. **Lulus kalau** semuanya sesuai; kerangka apa adanya meleset 7 dari 20 skenario penulis.

**Hasilnya (lab penulis, laptop; `main` lab 2.0.4):** `Masuk.tsx` diubah, versi tetap; kerangka (kode `0`), lalu jawaban (kode `1`):

```text
LULUS  satu nomor versi 2.0.4 di 10 tempat (…); dibanding origin/main: tidak ada berkas yang dipasang berubah, versi tetap 2.0.4 (boleh)
GAGAL  yang dipasang di VPS/Pi berubah (frontend/src/halaman/Masuk.tsx) tetapi versinya masih 2.0.4 (= origin/main). …
```

Selesai: `git switch main`, `git branch -D coba/versi`.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Jawabannya = `skrip/cek-versi.mjs` (*diff*-nya di [`tingkat-2/`](kode/tantangan/kunci/tingkat-2/)). TODO 1 = yang dibaca VPS dan Pi: backend daftar "yang ikut" (`Dockerfile`, `package*.json`, `migrasi/`, `src/` tanpa `src/integrasi/`, …), frontend daftar "yang tidak ikut" (`Dockerfile`-nya menyalin seluruh folder), ditambah `compose.cloud.yml`, konfigurasi `edge/`, `grafana/`, dan `skrip/*.sh`; dokumen dan tes tidak. TODO 2 dan 3 = `if` lalu `else if`, "turun" dulu: *revert* polos mendapat satu pesan tepat.

</details>

### Tingkat 3 — Pilih satu: VPS sebagai *canary*, persetujuan sebelum produksi, atau rilis GitHub otomatis (buat dari nol, 60 menit)

> [!NOTE]
> Tanpa kunci; belum dicoba penulis (robot tiruannya mengabaikan `environment`). Cek setelan dan perintah di dokumen resmi.

- **(a) VPS sebagai *canary*.** Kini *tag* dibuat sebelum VPS dipasang (9.2: `needs: [bangun, tandai-rilis]`). Balik: `pasang-vps` memasang *commit* *run* itu, baru `tandai-rilis` menandainya bila VPS sehat; Pi tetap mengikuti *tag* ([Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri)). Petunjuk: dengan `command=`, kata kiriman robot terbaca `pasang.sh` di `SSH_ORIGINAL_COMMAND` (dokumen sshd); terima hanya 40 karakter `0-9a-f` yang ada di `origin/main`. Jebakan: *job* yang `needs`-nya dilewati ikut dilewati (jalur tanpa `VPS_HOST`); VPS menjalankan `pasang.sh` lamanya (bila rusak, pembaruan berhenti). **Lulus kalau** rilis yang gagal di VPS tidak mendapat *tag*, yang sehat mendapat *tag* lalu Pi menyusul, dan tanpa `VPS_HOST` *tag* tetap dibuat.
- **(b) Persetujuan sebelum produksi** ([Konsep 9](#9-staging-vs-produksi-gladi-resik-vs-pentas)). Buat *environment* `produksi` dengan temanmu sebagai peninjau wajib (*required reviewer*; akun gratis: hanya repo publik), tulis `environment: produksi` di `pasang-vps`, dan pindahkan `VPS_KUNCI_SSH` menjadi rahasia *environment*: hanya *job* yang menyebut *environment* itu yang bisa membacanya (dokumen GitHub). Sendirian? Jadikan dirimu peninjau, tanpa **Prevent self-review** (setelan itu melarang yang memicu *run* menyetujuinya). **Lulus kalau** *run* rilis berikutnya menunggu di `pasang-vps` sampai disetujui, lalu VPS terpasang; Pi tidak ikut menunggu (*tag* sudah dibuat).
- **(c) Rilis GitHub otomatis.** *Job* baru sesudah `tandai-rilis` membuat rilis di **Releases** dari *tag* itu, berisi potongan `CHANGELOG` yang sama (`awk` di 9.1); `contents: write` di *job* itu juga (perbarui templat PR); rilis yang sudah ada dilewati. Di `ci.yml`, bukan *workflow* yang menunggu *tag*: *tag* buatan `GITHUB_TOKEN` tidak memicu *workflow* lain (dokumen GitHub). Misalnya GitHub CLI `gh` di *runner*, tanpa *action* pihak ketiga. **Lulus kalau** catatan rilis berikutnya sama dengan pesan *tag*-nya (`git show v<versi>`), tanpa *tag* tambahan.

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini menjadi **v2.0, *pipeline* produksi**. Keempat *pull request* (termasuk PR D, Praktik 13) sudah di-*merge*, jadi A–D memeriksa yang berjalan, E mencatat, dan F mencocokkan (±30 menit, tanpa ⭐). Keadaan Rumah Pintar Mini sesudah Modul 29:

![Diagram Rumah Pintar Mini v2.0 sesudah Modul 29: diuji robot, dipasang sendiri (Tambahan); panah = siapa yang memulai, putus-putus = tarik atau menyusul. Laptop: cabang, ubah, naikkan versi, pull request; npm test + database uji rumahpintar-db-uji (loket 5433), npm run test:integrasi, node skrip/cek-versi.mjs; Checks hijau, Merge. Panah PR ke GitHub (repo publik; palang di depan main = aturan cabang): robot ci.yml, PR periksa ∥ uji lalu bangun; push ke main bangun + kirim, staging, tandai-rilis, pasang-vps; hanya rilis bertanda yang dipasang; log robot publik: jangan cetak rahasia. GHCR: backend dan web, amd64 + arm64, paket publik; versi yang staging-nya merah tanpa tag Git. Tag rilis v2.0.0, v2.0.1, v2.0.2, hanya robot. Secrets VPS_KUNCI_SSH; Variables VPS_HOST, VPS_USER, VPS_KNOWN_HOSTS. Cek tanpa kamu SSH: https://iot.namaanda.my.id, nomor versi di bawah judul layar Masuk (muat ulang dua kali), /api/health menulis versi 2.0.1; jalur gratis lewat Cloudflare Tunnel. VPS (jalur utama): backend + web dari GHCR, up --no-build; dipasang robot lewat SSH, kunci restrict,command= di pengguna rumah, pasang.sh (pusat) + uji asap; kamu tidak SSH lagi; image lama menumpuk (Modul 30). Rumah, router tanpa port forwarding: Node 1 1.7.x dan Node 2 1.0.0 tidak berubah; Pi gerbang: image resmi Mosquitto, jam weker 15 menit (User=budi), pasang.sh (gerbang), panah tarik tag; jalur gratis: pusat juga di Pi. Pita: sesudah Modul 29 backend dan dashboard satu nomor 2.0.0 (latihanmu 2.0.1, 2.0.2), kontrak data 1.6, firmware dan migrasi tetap. Bawah, empat pull request (uji + robot, pipeline + rilis 2.0.0, PATCH 2.0.1, revert 2.0.2), berkas: ci.yml, app.ts + src/integrasi/, backend dan frontend 2.0.0, dua Dockerfile, compose.cloud.yml, cek-versi.mjs, pasang.sh, uji-asap.sh, unit systemd, CHANGELOG.md, .gitattributes, templat PR, README; tidak pernah ikut Git: .env, edge/.env, edge/jembatan/pusat.conf, backup/, kunci robot privat (hanya di Secrets), .git/rumahpintar-terpasang. Menyusul Modul 30: Uptime Kuma + Telegram kurang dari 2 menit, /health 503, cadangan otomatis ke luar VPS + uji pulih, runbook, image lama dan disk penuh, MINOR v2.1. Jujur: robot, GitHub, GHCR, VPS, dan Pi gerbang sungguhan tidak diuji (ditiru di Pi 5 penulis, layar GitHub rekonstruksi); image amd64 belum dijalankan; timer hanya dicek systemd-analyze; broker yang baru mogok sesudah ±10 detik bisa lolos.](aset/keadaan-proyek-m29.png)

> 🖥️ **Alat yang dipakai:** **VS Code** di laptop (terminal di **akar proyek**, `backend`, dan `frontend`; E: folder `belajar-iot`), **GitHub** dan **Chrome**, serta terminal SSH ke Pi untuk membaca jurnal (D). Layar GitHub: dari dokumen GitHub, seperti di praktik.

### A. Uji: 203 *unit test*, 20 *integration test*, 5 tes dashboard, dan *lint* di dua folder

Backend punya 203 *unit test* tanpa SQL dan 20 *integration test* dengan database uji `…_uji` ([Praktik 3](#praktik-3--database-uji-dan-20-integration-test-60-menit)), dashboard 5 tes, dan kedua folder diperiksa oxlint `--deny-warnings` ([Praktik 2](#praktik-2--lint-backend-dan-uji-frontend-oxlint-dan-vitest-25-menit)). Cek tanpa Docker, di `backend` lalu `frontend`: `npm run lint` → `Found 0 warnings and 0 errors.`; `npm test` → `Tests  203 passed | 20 skipped (223)` (ke-20 *integration test* dijalankan robot) dan `Tests  5 passed (5)`.

### B. Robot dan aturan cabang: `ci.yml` dengan enam *job*, tiga *check* wajib

Di setiap *pull request*, `.github/workflows/ci.yml` ([Praktik 4](#praktik-4--robot-pemeriksa-di-setiap-pull-request-40-menit)) menjalankan `periksa` dan `uji` bersamaan, lalu `bangun` tanpa mengirim; sesudah *merge*, `bangun` mengirim, lalu `staging`, `tandai-rilis`, dan `pasang-vps`. Aturan cabang `main` ([Praktik 5](#praktik-5--aturan-cabang-pr-merah-tidak-bisa-di-merge-20-menit) dan 7.6) menahan setiap PR sampai `periksa`, `uji`, dan `bangun` hijau, juga untukmu. Cek: tab **Actions**, *run* `push` teratas hijau sampai `pasang-vps` (jalur gratis: dilewati), dan **Settings** → **Branches** masih memuat aturan `main`.

### C. Satu *image* dua prosesor di GHCR, paketnya publik

*Image* `rumah-pintar-mini-backend` dan `rumah-pintar-mini-web` untuk `linux/amd64` (VPS) dan `linux/arm64` (Pi) dibangun robot tanpa emulasi (Praktik 7), dan paketnya publik sejak [9.7](#97--paket-ghcr-menjadi-publik-tarik-tanpa-login-dua-prosesor-4-menit): VPS dan Pi jalur gratis menariknya tanpa *login*, tanpa membangun lagi. Cek dari laptop tanpa *login* (hasilnya seperti di 9.7: `linux/amd64` dan `linux/arm64`):

```text
docker buildx imagetools inspect ghcr.io/<akun>/rumah-pintar-mini-web:2.0.2
```

### D. VPS dipasang robot dengan kunci terbatas, Pi dengan jam weker

Robot mengetuk VPS lewat SSH dengan kunci yang hanya bisa menjalankan `skrip/pasang.sh` ([Praktik 10](#praktik-10--vps-beralih-ke-menarik-kunci-robot-yang-hanya-bisa-satu-skrip-45-menit)); Pi bertanya sendiri tiap 15 menit lewat `rumahpintar-perbarui.timer`, sebagai `budi`, bukan root ([Praktik 11](#praktik-11--pi-memperbarui-dirinya-sendiri-jam-weker-systemd-40-menit)). Keduanya hanya memasang rilis bertanda. Cek: `https://iot.namaanda.my.id/api/health` menulis `"versi":"2.0.2"`, layar **Masuk** `v2.0.2` (muat ulang dua kali), dan `journalctl -u rumahpintar-perbarui.service -n 30` di Pi mencatat tiap ±15 menit `… v2.0.2 sudah terpasang (gerbang): tidak ada rilis baru`.

> 🔀 **Jalur gratis:** tanpa VPS; `/api/health` lewat Tunnel, jurnal Pi `(pusat gerbang)`. **Tanpa Pi:** tanpa jurnal.

### E. `CHANGELOG.md` dan *tag* `v2.0.0`, `v2.0.1`, `v2.0.2`: catat waktu *stopwatch*-mu

`CHANGELOG.md` ([6.5](#65--changelogmd-buku-catatan-perubahan-untuk-manusia-4-menit)) kini berisi `[Belum Dirilis]`, `[2.0.2]`, `[2.0.1]`, dan `[2.0.0]`, terbaru di atas; setiap rilis punya *tag* buatan robot berisi bagiannya (9.6). Di terminal akar proyek:

```text
git fetch --tags
git tag -n1
git diff --stat v2.0.0 v2.0.2
```

`git tag` menulis tiga *tag* rilis (`v2.0.0`, `v2.0.1`, `v2.0.2`), masing-masing berisi `Rumah Pintar Mini <versi>`. `git diff` hanya menyebut `CHANGELOG.md`, dua `package.json`, dua *lock*, dan `compose.cloud.yml`, tanpa `Masuk.tsx`: isinya sama, nomornya naik, maju untuk mundur ([Praktik 13](#praktik-13--kembali-ke-versi-sebelumnya-revert-menjadi-202-20-menit)).

Catat di `belajar-iot/modul-29/catatan.md` (tanpa sandi, kunci, atau isi `.env`): jalurmu, tanggal L0–L3, langkah tanganmu dulu (🔁 Langkah 2) dan kini, menit *merge* → VPS dan *merge* → Pi ([12.6](#126--hapus-cabang-dan-catat-waktu-stopwatch-3-menit)), serta yang belum kauuji; lalu *commit* dan *push*.

### F. Cocokkan proyekmu: berkas baru dan berubah, tiga diff, dan butir Modul 29 di templat *pull request*

Daftar berkasnya di tabel [🧰](#-yang-perlu-disiapkan). Isinya harus sama dengan berkas senama di [`kode/`](kode/), kecuali versimu 2.0.2 (dua `package.json`, dua *lock*, tiga baris `image:`), tanggalmu dan entri 2.0.1–2.0.2 di `CHANGELOG.md`, dan `<akun>` di `LABEL` kedua `Dockerfile`. Perubahan `backend/`, `frontend/`, dan `edge/` terhadap Modul 28 ada di tiga *diff*: [`backend-2.0.diff`](kode/backend-2.0.diff), [`frontend-2.0.diff`](kode/frontend-2.0.diff), dan [`edge.diff`](kode/edge.diff). Pohon proyek [Silabus §9](../../SILABUS.md#9-struktur-folder-repositori) (v1.0.31) mencatat `.github/` (templat *pull request* Modul 16, *workflow* CI/CD Modul 29), `CHANGELOG.md`, dan `skrip/` dengan pemasang rilis, uji asap, satpam versi, dan berkas unit systemd.

README proyek dari [9.4](#94--readme-dan-templat-pull-request-lalu-commit-dan-push-3-menit) kini punya bagian [Diuji dan dipasang otomatis (Modul 29)](kode/README.md#diuji-dan-dipasang-otomatis-modul-29). Di templat *pull request*, dua butir **(Modul 26)** serta butir `npm audit` ikut diperbarui, dan butir **(Modul 29)** ada enam, tiga di **Checklist sebelum *merge*** dan tiga di **Checklist keamanan**:

```markdown
- [ ] **(Modul 29)** Semua check robot di tab **Checks** hijau (`periksa`, `uji`, `bangun`), tanpa langkah yang "dihijaukan" dengan `continue-on-error`, `if: false`, `.skip`/`.only`, atau tes yang dihapus; di laptop `npm test` backend dan frontend lulus, dan *integration test* lulus dengan database uji (`npm run test:integrasi` di folder `backend`)
- [ ] **(Modul 29)** Kalau yang dipasang di VPS/Pi berubah (kode atau `Dockerfile` backend dan frontend, `compose.cloud.yml`, konfigurasi broker di `edge/`, `grafana/`, atau `skrip/*.sh`): versi dinaikkan menurut SemVer di SEMUA tempat sekaligus (dua `package.json` + lock, tiga tag image `compose.cloud.yml`) dan `CHANGELOG.md` punya entri `## [<versi>] - <tanggal>`; `node skrip/cek-versi.mjs` (dengan `BASIS=origin/main` sesudah `git fetch`) menulis `LULUS`. Mengembalikan isi lama (*revert*) = isi lama dengan nomor yang tetap NAIK
- [ ] **(Modul 29)** Perilaku baru punya tes (*unit test* untuk fungsi, *integration test* dengan database uji untuk rute yang membaca/menulis database); migrasi baru hanya MENAMBAH (tabel, kolom, atau indeks baru) supaya image versi sebelumnya tetap cocok dengan databasenya, dan riwayat dicadangkan dengan tangan sebelum rilis bermigrasi (cadangan otomatis menyusul di Modul 30)
<!-- … -->
- [ ] **(Modul 29)** Robot: `permissions` sekecil mungkin (atas `contents: read`; `packages: write` hanya job `bangun`, `contents: write` hanya `tandai-rilis`), tanpa `pull_request_target`, action hanya dari `actions/*` dan `docker/*` bertag mayor, dan tidak ada rahasia di berkas *workflow* atau log (repo publik: log robot bisa dibaca siapa pun; tanpa `echo` rahasia dan tanpa `set -x`)
- [ ] **(Modul 29)** Kunci SSH robot = kunci KHUSUS (bukan kunci pribadimu), hanya tersimpan di **Secrets** (`VPS_KUNCI_SSH`) dan di VPS dibatasi `restrict,command="sh /home/rumah/rumah-pintar-mini/skrip/pasang.sh"` (ditulis sendiri, bukan lewat `ssh-copy-id`; `ssh -i <kunci robot> rumah@<VPS> whoami` menjawab baris `pasang.sh`, bukan `rumah`); robot memeriksa sidik VPS (`VPS_KNOWN_HOSTS`, `StrictHostKeyChecking=yes`, tidak pernah `no`)
- [ ] **(Modul 29)** *Integration test* hanya ke database `…_uji` sekali pakai, tidak pernah ke database rumah; aturan cabang `main` tetap aktif (PR wajib, check `periksa`/`uji`/`bangun` wajib, **Do not allow bypassing**); `skrip/pasang.sh` dan timer Pi tidak memuat `down -v`, `prune`, atau `git reset --hard`, dan timer berjalan sebagai pengguna biasa anggota grup `docker`, bukan root
```

Yang tetap tangan: paket GHCR publik (sekali), kunci robot beserta **Secrets** dan **Variables**-nya, salinan unit di `/etc/systemd/system/`, `.env` di VPS dan Pi, `edge/.env`, dan `edge/jembatan/pusat.conf`. Yang menyusul di Modul 30: pemantau, cadangan otomatis, *runbook*, membereskan *image* lama yang menumpuk, dan penjadwal yang lebih lengkap untuk cron sertifikat Modul 27.

**Rumah Pintar Mini v2.0: setiap perubahan diuji robot dan sampai ke VPS dan Pi tanpa kamu SSH.** Silabus (v1.0.31) memberi ➕ [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data) nomor v2.1, karena v2.0 sudah dipakai di sini.

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| ***Artifact*** | Berkas hasil *job* yang disimpan GitHub untuk diunduh; `.bin` firmware (berisi kunci) tidak pernah menjadi *artifact*. |
| **Aturan cabang** (*branch protection*) | Palang di depan `main`: terangkat hanya bila *check* wajib hijau, juga untuk pemilik repo. Akun gratis: hanya repo publik. |
| **`$BUILDPLATFORM`** (*cross-build*) | Dapur (`RUN`) di prosesor pembangun, piring saji (tahap akhir tanpa `RUN`) per prosesor: *image* amd64 dan arm64 tanpa emulasi. |
| ***Bypass*** | Melewati aturan cabang. Pemilik repo adalah admin, jadi **Do not allow bypassing the above settings** wajib dicentang. |
| **`CHANGELOG.md`** | Buku catatan perubahan untuk manusia: `## [Belum Dirilis]`, lalu satu bagian per rilis, yang menjadi isi *tag*-nya. |
| **CI/CD** | Robot yang menguji (CI) dan memasang (CD) setiap kali perubahan dikirim ke GitHub (*push*) atau diajukan lewat *pull request*. |
| ***Container job*** | *Job* `periksa` dan `uji` di wadah `node:24.22.1-alpine3.24`, Node yang sama dengan `Dockerfile` backend dan dashboard. |
| **Database uji** | Dapur latihan: TimescaleDB kosong sekali pakai, namanya wajib berakhiran `_uji`; tidak pernah database rumahmu. |
| ***Deploy*** | Memasang ke produksi; di sini selalu lewat `skrip/pasang.sh`. |
| **Dorong** dan **tarik** | Robot mengetuk VPS beralamat publik lewat SSH (dorong); Pi di balik router bertanya sendiri ke GitHub (tarik). |
| **Emulasi** | Berpura-pura menjadi prosesor lain (QEMU); bisa jauh lebih lambat. Tidak dipakai di sini. |
| ***End-to-end test*** | Pelanggan memesan sampai makanan datang: dari peramban sampai database; paling lambat, belum dipakai (🔬 Playwright). |
| **GHCR** (*registry*, toko *image*) | `ghcr.io/<akun huruf kecil>`. Paket baru bisa privat; yang publik ditarik tanpa *login* dan tidak bisa diprivatkan lagi. |
| **`GITHUB_TOKEN`** | Token sementara robot untuk setiap *job*, pengganti PAT pribadimu; izinnya di `permissions`. |
| **Indeks multi-arsitektur** | Daftar isi di balik satu nama dan *tag*: cetakan amd64 dan arm64; setiap mesin menarik yang cocok. |
| ***Integration test*** | Memasak resep di dapur latihan: rute API, SQL, dan database uji; 20 tes di `backend/src/integrasi/`. |
| **Jam weker** (systemd *timer*) | `rumahpintar-perbarui.timer`: 5 menit sesudah Pi menyala, lalu setiap 15 menit + acak ≤ 60 detik. |
| ***Job***, ***step***, dan ***action*** | Pos di mesinnya sendiri; langkah di pos itu: `run:` atau `uses:` (*action* siap pakai). |
| **`known_hosts`** | Daftar kunci mesin yang dipercaya; robot hanya masuk ke VPS yang kuncinya cocok dengan `VPS_KNOWN_HOSTS`. |
| **Kode keluar** | `0` = berhasil (centang hijau), selain itu gagal (silang merah); hanya ini yang dibaca robot. |
| **Kunci robot** | Kunci SSH kedua tanpa frasa sandi; di VPS berawalan `restrict,command=`: apa pun yang dikirim, yang jalan `pasang.sh`. |
| ***Lint*** | Pemeriksa ejaan kode (oxlint), tanpa menjalankan kode; dengan `--deny-warnings`, satu peringatan = merah. |
| **Maju untuk mundur** (*revert*) | Isi lama dengan nomor yang naik: 2.0.2 berisi isi 2.0.0. Database tidak ikut mundur. |
| **`oneshot`** | Satpam yang sekali jalan lalu duduk lagi: `pasang.sh` berjalan sampai selesai, lalu berhenti. |
| **`permissions`** | Izin `GITHUB_TOKEN` per *job*, sekecil mungkin; `contents: write` hanya untuk `tandai-rilis`. |
| ***Pipeline*** | Jalur perakitan dari *pull request* sampai produksi; pos yang merah menghentikan pos sesudahnya (`needs`). |
| **Piramida uji** | Banyak tes cepat di bawah, sedikit tes lambat di puncak; kesalahan diuji di lapis serendah mungkin. |
| **Rilis bertanda** | Versi yang lulus robot dan *staging*, ditandai robot dengan *tag* `v<versi>`; hanya itu yang dipasang VPS dan Pi. |
| ***Runner*** | Mesin sewaan GitHub (`ubuntu-24.04`) untuk satu *job*, dihapus sesudahnya. |
| **Secrets** dan **Variables** | Laci rahasia (`***` di log, `VPS_KUNCI_SSH`) dan laci setelan biasa (terbaca di log, `VPS_HOST`). |
| **SemVer** | MAYOR.MINOR.PATCH: PATCH perbaikan kecil, MINOR fitur baru, MAYOR bila pemakai lama (juga kamu yang memasang) terpaksa ikut berubah. |
| ***Staging*** dan **produksi** (*production*) | Gladi resik versi baru dengan data palsu sebelum ke produksi, yaitu pentas: VPS atau Pi dengan data rumahmu. Bukan CA latihan Let's Encrypt Modul 27. |
| ***Status check*** | Hasil satu *job* di tab **Checks** (dokumen GitHub: `ci / periksa (pull_request)`); aturan cabang memilih nama *job*-nya. |
| ***Tag*** Git | Penanda halaman pada satu *commit*; *tag* rilis `v…` hanya dibuat robot dan tidak pernah dipindah. |
| **Uji asap** (*smoke test*) | Nyalakan, lihat ada asap atau tidak: `skrip/uji-asap.sh`, empat pemeriksaan yang hanya membaca. |
| ***Unit test*** | Mencicipi bahan: satu fungsi, atau satu rute dengan tiruan `vi.mock`; cepat, tetapi tidak menjalankan SQL. |
| ***Workflow*** dan ***event*** | Berkas `.github/workflows/ci.yml` (*workflow* `ci`) dan pemicunya: `pull_request` dan `push` ke `main`. |
| **YAML** | Bahasa berkas robot: baris yang dua spasi lebih dalam milik baris di atasnya; tanpa tab. |

## 📝 Kuis (5 soal)

[Tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase) meminta paling sedikit 4 benar di setiap kuis Modul 26–30.

1. Tiga tes: peramban yang masuk lalu membuka dashboard; `POST /devices` ke database uji sungguhan; `jamWib()` dengan jam UTC buatan. (a) Urutkan dari lapis piramida terbawah. (b) Sidik kunci perangkat ditulis `upper($5)`. Lapis mana yang menangkapnya, apa yang menolaknya, dan kenapa 203 *unit test* backend tetap hijau?
2. Robot sudah membuat *tag* `v2.0.1`. Di Pi jalur gratis, temanmu hanya menjalankan `docker compose pull` lalu `up -d`, tanpa Git. (a) Kenapa dashboard tetap `v2.0.0`? (b) Kenapa jam weker mengikuti *tag* rilis, bukan ujung `main`?
3. Aturan `main`-mu mewajibkan PR serta *check* `periksa`, `uji`, dan `bangun`, tetapi PR yang `uji`-nya merah masih bisa kamu *merge*. (a) Setelan apa yang lupa, dan kenapa kamu bisa lolos? (b) Kenapa `bangun` saja tidak cukup?
4. Rumah Pintar Mini kini versi 2.0.2. Nomor berapa untuk setiap perubahan ini, masing-masing dari 2.0.2? (a) Salah ketik di layar **Armada** dibetulkan. (b) Grafik baru; layar dan rute lama tetap. (c) Backend menolak menyala tanpa satu setelan `.env` wajib baru.
5. (a) Kenapa robot mengetuk VPS, sedangkan Pi bertanya sendiri? (b) Robot tetap masuk ke VPS lewat SSH. Lalu apa arti "tanpa kamu SSH", dan apa yang membatasi kunci robot?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) `jamWib()` = *unit test* (paling cepat), `POST /devices` = *integration test*, alur peramban = *end-to-end test*. (b) Di *integration test*: `CHECK (kunci_hash ~ '^[0-9a-f]{64}$')` dari migrasi `010` menolak huruf besar, dan backend menjawab `503`, padahal tes mengharapkan `201`. Tak satu pun dari 203 *unit test* menjalankan SQL: tes rute memakai tiruan `vi.mock` ([Konsep 2](#2-yang-tidak-terlihat-tiruan-integration-test-dengan-database-uji)).
2. (a) `compose.cloud.yml` di Pi masih menulis *tag* persis `…:2.0.0`, jadi `pull` hanya menarik ulang 2.0.0; nomor 2.0.1 datang lewat Git. Karena itu `pasang.sh` lebih dulu `git fetch --tags` dan `merge --ff-only` ke *tag* terbaru, baru `pull` dan `up` ([Konsep 8](#8-systemd-timer-jam-weker-untuk-satpam-modul-12)). (b) Robot membuat *tag* sesudah *image* versi itu ada di GHCR dan *staging* lulus. Ujung `main` bisa membawa berkas Compose bertag baru sebelum *image*-nya ada, atau *commit* yang belum digladi.
3. (a) **Do not allow bypassing the above settings**. Menurut dokumen GitHub, tanpa centang ini aturan cabang tidak berlaku untuk admin, dan pemilik repo, yaitu kamu, adalah admin ([Konsep 11](#11-aturan-cabang-palang-di-depan-main)). (b) `bangun` dilewati saat `uji` merah (`needs`), dan menurut dokumen yang sama, *job* yang dilewati melapor lulus; karena itu ketiganya diwajibkan.
4. (a) 2.0.3, PATCH: perbaikan kecil. (b) 2.1.0, MINOR: fitur baru, cara lama tetap jalan. (c) 3.0.0, MAYOR: pemakai lama, yaitu kamu yang memasang, terpaksa ikut berubah. Setelan itu ditulis di `.env` mesin produksi dan di langkah `.env` *job* `staging`; lupa yang kedua, `staging` merah lebih dulu ([Konsep 10](#10-semver-changelog-dan-tag-satu-nomor-lalu-maju-untuk-mundur)).
5. (a) VPS punya alamat publik dan pintu 22: robot mengetuk (dorong) dan langsung tahu hasilnya di `pasang-vps`. Pi di balik router tanpa *port forwarding* tidak bisa diketuk, jadi jam wekernya bertanya ke GitHub setiap 15 menit (tarik) ([Konsep 7](#7-dorong-vs-tarik-robot-mengetuk-vps-pi-bertanya-sendiri)). (b) Yang hilang hanya terminal SSH-mu. Kunci robot berawalan `restrict,command=`: apa pun yang dikirim, yang jalan hanya `pasang.sh`, tanpa terminal dan terowongan. Tetap rahasiakan: grup `docker` setara root.

</details>

---

## ✅ Checklist kelulusan Modul 29

Syarat lulus dari [Silabus](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis): "*pull request* kecil yang di-*merge* tampil di produksi (VPS dan Pi) tanpa Anda SSH, dan PR yang tesnya gagal tidak bisa di-*merge*." Pecahannya **L0** (prasyarat), **L1**, **L2**, dan **L3**. **Jalur utama:** L1 + L2 (VPS) + L3 (gerbang). **Jalur gratis:** L1 + L2-gratis (tampil lewat Tunnel, dipasang jam weker Pi tanpa *job* SSH) + L3. **Tanpa Pi:** L1 + L2, lulus jalur tanpa Pi. **Laptop saja**, **repo privat** akun gratis, dan **tanpa akun GitHub**: belum lulus. Tanpa Kit dan Wokwi: sama dengan jalurmu.

> [!NOTE]
> **Penulis menjalankan `ci.yml` dengan robot tiruan di satu Raspberry Pi 5, bukan di GitHub.** Layar dan aturan cabang GitHub, GHCR dan VPS sungguhan, dan jam weker systemd yang berjalan belum direkam ([📚](#-sumber--atribusi-gambar)). Centang hanya yang terjadi di repo dan mesinmu.

- [ ] **L0** Repo publik; PR A hijau di `periksa` dan `uji`, dengan `Tests  223 passed (223)` tanpa baris `GAGAL` ([4.4](#44--l0-sengaja-merah-sekali-lalu-semua-hijau-8-menit)).
- [ ] **L1** *Push* langsung ke `main` ditolak; PR `coba/merah` ✗, dan kotak *merge*-nya menolak tanpa pilihan melewati aturan, juga untukmu ([5.3](#53--l1-pr-cobamerah-merah-tombol-merge-terkunci-6-menit)).
- [ ] **L2** PR C di-*merge* tanpa terminal SSH-mu; `pasang-vps` melapor `v2.0.0 -> v2.0.1 terpasang (pusat)`; layar **Masuk** di domainmu menulis teks baru dan `v2.0.1`, `/api/health` `"versi":"2.0.1"` ([12.4](#124--l2-robot-memasang-vps-layar-masuk-menulis-v201-8-menit)). **L2-gratis:** sama, lewat Tunnel, dipasang jam weker Pi.
- [ ] **L3** Jurnal Pi menulis `v2.0.0 -> v2.0.1 terpasang (gerbang)` (jalur gratis: `(pusat gerbang)`), dipasang tanpa kamu SSH ([12.5](#125--l3-pi-memasang-201-sendiri-dibaca-dari-jurnalnya-6-menit)).
- [ ] Pemanasan cocok dengan "Kunci uji dirimu"; `halo.yml` hijau lalu merah, `coba/robot` ditutup tanpa *merge* (Kemenangan Cepat).
- [ ] ⭐ Repo publik; cadangan hari ini di `backup/` dan sidik jari "Sebelum robot (1.3)" tercatat (Praktik 1).
- [ ] ⭐ `Found 0 warnings and 0 errors.` di dua folder dengan `--deny-warnings`; `Tests  5 passed (5)`, merah sekali, lalu hijau (Praktik 2).
- [ ] ⭐ `Tests  20 passed (20)`, lalu `Tests  223 passed (223)`; `upper($5)` tertangkap *integration test*; tanpa database `20 skipped` (Praktik 3).
- [ ] ⭐ `ci.yml` tahap A; PR A merah sekali, lalu hijau dan di-*merge*; *run* `push` hijau (Praktik 4).
- [ ] ⭐ Kecuali repo privat: aturan klasik `main` dengan empat setelan, *check* wajib `periksa` dan `uji` (Praktik 5).
- [ ] ⭐ 2.0.0 di 10 tempat dan di layar; `CHANGELOG.md`; satpam versi `LULUS`, `GAGAL`, lalu `LULUS` (Praktik 6).
- [ ] ⭐ `$BUILDPLATFORM` di dua `Dockerfile`; `bangun` hijau dengan `COPY` untuk `linux/amd64` dan `linux/arm64`; tiga *check* wajib (Praktik 7).
- [ ] ⭐ `skrip/uji-asap.sh` dan *job* `staging` di-*commit*; kamu tahu kenapa gladi yang merah tidak sampai ke VPS dan Pi (Praktik 8).
- [ ] ⭐ `ci.yml` enam *job*; sesudah *merge* PR B, *run* `push` hijau sampai `tandai-rilis`; `git show v2.0.0` menulis `Rumah Pintar Mini 2.0.0`; kedua paket publik ditarik tanpa *login* untuk dua prosesor (Praktik 9).
- [ ] ⭐ Jalur utama dan tanpa Pi: `belum pernah -> v2.0.0 terpasang (pusat)`, `akun` dan `perangkat` tetap; kunci robot teruji `whoami`; sidik VPS cocok; **Secrets** dan **Variables** terisi (Praktik 10).
- [ ] ⭐ Jalur utama dan gratis: `systemd-analyze verify` tanpa keluaran; jam weker `enabled`; jurnal `-> v2.0.0 terpasang` (gratis: `sudah terpasang`) tanpa `GAGAL:`; broker gerbang tidak di-*restart* (Praktik 11).
- [ ] ⭐ Satpam versi menolak tanpa versi naik, lalu `LULUS … 2.0.1 …`; L2, L3, dan jam *stopwatch* tercatat (Praktik 12).
- [ ] *Revert* ditolak satpam versi, lalu 2.0.2 berisi isi 2.0.0 dan entri 2.0.1 tetap; VPS dan Pi memasangnya sendiri (Praktik 13, dianjurkan).
- [ ] Keamanan: rahasia hanya di **Secrets**, tidak pernah di *workflow* atau log; `permissions` terkecil per *job*; kunci robot `restrict,command=`, `whoami` dijawab `pasang.sh`; tes integrasi hanya ke `…_uji`; aturan cabang tanpa *bypass*; tanpa `down -v`, `prune`, atau `git reset --hard`; jam weker sebagai `budi`, bukan root; `.env` tidak di Git.
- [ ] Proyek cocok dengan `kode/` (➕ F).

**Setiap perubahan kode Rumah Pintar Mini kini diuji robot, dibungkus menjadi *image* untuk dua jenis prosesor, lalu dipasang sendiri ke VPS dan Pi.** Tahu lebih dulu saat ada yang rusak, cadangan otomatis, dan *runbook* menyusul di Modul 30; sampai saat itu `/health` selalu menjawab `200`, cadangan database masih tangan, dan *image* lama menumpuk di disk.

> ➡️ **Modul berikutnya:** Modul 30 — Monitoring, Backup, Runbook: Tahu Lebih Dulu, Tidak Pernah Kehilangan Data (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data)). Kamu akan tahu lebih dulu dari pengguna saat ada yang rusak, tidak pernah kehilangan data, dan orang lain bisa mengoperasikan sistemmu dari dokumentasi.

## 📚 Sumber & atribusi gambar

**Sumber resmi** (dibaca 31 Oktober–5 November 2026):

- **GitHub Actions**: [sintaks *workflow*](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [*event*](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), [`GITHUB_OUTPUT`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands), [*service container*](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers), [*runner*](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) dan [README *image* `ubuntu-24.04`](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md) (20261026.354.1), [penagihan](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [*secure use*](https://docs.github.com/en/actions/reference/security/secure-use), [Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets), [Variables](https://docs.github.com/en/actions/concepts/workflows-and-actions/variables), [*environment*](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments); kode sumber [`actions/runner`](https://github.com/actions/runner) dan [`actions/toolkit`](https://github.com/actions/toolkit).
- **GHCR dan repo**: [Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), [paket dari Actions](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions), [visibilitas paket](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility), [penagihan paket](https://docs.github.com/en/billing/concepts/product-billing/github-packages), [melihat paket](https://docs.github.com/en/packages/learn-github-packages/viewing-packages); [visibilitas repo](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), [aturan cabang](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) dan [cara memasangnya](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule), [*rulesets*](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets), [*required status checks*](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks), [persetujuan PR](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews), [*revert*](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/reverting-a-pull-request).
- **Docker, systemd, SSH**: [*multi-platform build*](https://docs.docker.com/build/building/multi-platform/), [`build-push-action`](https://github.com/docker/build-push-action), [`docker compose up`](https://docs.docker.com/reference/cli/docker/compose/up/), [grup `docker`](https://docs.docker.com/engine/install/linux-postinstall/); Watchtower [diarsipkan 17 Desember 2025](https://github.com/containrrr/watchtower); [systemd.timer](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html), [systemd.service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), [systemd-analyze](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html); OpenSSH [sshd](https://man.openbsd.org/sshd#AUTHORIZED_KEYS_FILE_FORMAT) (`restrict`, `command=`) dan [ssh_config](https://man.openbsd.org/ssh_config).
- **Versi dan uji**: [SemVer 2.0.0](https://semver.org/) ([bahasa Indonesia](https://semver.org/lang/id/)), [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) (nama jenis: [id-ID 1.0.0](https://keepachangelog.com/id-ID/1.0.0/)), [Vitest](https://vitest.dev/guide/) 5, [oxlint](https://oxc.rs/docs/guide/usage/linter.html), Fastify [*Testing*](https://fastify.dev/docs/latest/Guides/Testing/); hanya 🔬: [`node:test`](https://nodejs.org/docs/latest-v24.x/api/test.html), [Playwright](https://playwright.dev/docs/intro) 1.64, [Wokwi CI](https://docs.wokwi.com/wokwi-ci/getting-started) dan [harganya](https://wokwi.com/pricing).

**Gambar.** Rincian per berkas: [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| 8 diagram (`piramida-uji-proyek` … `keadaan-proyek-m29`) | Diagram orisinal dari `kode/`, dokumen di atas, dan lab tiruan penulis; `kotak-merge-aturan-cabang` = **rekonstruksi** dari dokumen GitHub, bukan tangkapan layar. | CC BY 4.0 (`.svg` di `aset/`) |
| 4 komposit (`health-dan-docs-versi` … `versi-di-hp-gelap`) | Tangkapan asli Chrome 156 tanpa layar, 4 Nov 2026 10.50–11.06 WIB, dari "VPS" dan "Pi gratis" tiruan (HTTP lokal; 375 px = mode perangkat Chrome, **bukan HP**); rilis 1.7.1 = berkas tiruan. | Caddy dan Swagger UI (Apache-2.0); React, Fastify, Tailwind CSS, Socket.IO, Workbox (MIT) tampil apa adanya untuk tujuan pendidikan; judul, nomor, keterangan CC BY 4.0 |
| 2 komposit 🔬 (`robot-tiruan-hijau-merah`, `pr-merah-diblok-tiruan`) | Tangkapan asli **Gitea 28.2.0** di lab penulis, **bukan layar GitHub**; catatan kerja penulis di komentar PR dipotong. | Gitea dan Gitea Runner (MIT); judul, nomor, keterangan CC BY 4.0 |

**Tentang kotak Hasilnya.** "Lab penulis" umumnya **lab akhir**, 4 November 2026 ±07.40–11.20 WIB, pada `kode/` persis, di **Raspberry Pi 5 16 GB dengan Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3, buildx 0.30.1, Node.js 24.21.0 dan npm 11.19.0 sebagai laptop (kontainer robot: 24.22.1 dan 11.19.1), Chrome 156 tanpa layar. Beberapa kotak dan angka dari lab kode sebelumnya, pada kode yang sama (mis. skrip dengan `docker` tiruan; actionlint 1.7.12: 0 galat). "Teks dari kode" belum direkam; label "riset" = kode calon 31 Oktober (pola lama `git pull`).

Mesin itu memerankan laptop, GitHub, GHCR, VPS, Pi, dan HP ([🔬](#-bedah-teknis-opsional) *Bagaimana penulis menguji …*; ringkasannya: kotak status di awal modul). *Forge* Gitea 28.2.0 + Gitea Runner 5.2.4 menjalankan `ci.yml` apa adanya, juga *action* resmi; label `ubuntu-24.04` = *image* `gitea/runner-images:ubuntu-24.04` arm64, Docker robot = Docker-in-Docker. GHCR = toko *image* lokal `registry:3.1.2` tanpa sandi, bernama `ghcr.io` hanya di DNS lab, jadi "tarik tanpa *login*" di lab bukan bukti paket publik. "VPS" dan "Pi" = kontainer `docker:29.9.2-dind` + sshd (Alpine, OpenSSH 10.3), HTTP lokal tanpa domain; robot masuk ke "VPS" lewat SSH sungguhan. Jam weker = penjadwal tiruan tiap 60 detik + acak ≤ 10 detik; berkas unit hanya diperiksa `systemd-analyze verify` (systemd 259.9). *Image* pihak ketiga dimuat dari mesin, bukan ditarik. Rilis latihan penulis: 2.0.3 dan 2.0.5 sengaja merah di *staging* (tanpa *tag*), 2.0.4 mengubah konfigurasi broker.

| Rekaman lab | Ditulis di naskah |
| :--- | :--- |
| *forge* tiruan, pemilik repo `PembacaM29`, toko *image* lokal | `https://github.com/<akun>/…`, `<akun>`, `ghcr.io/<akun>` |
| "VPS" (di tangkapan `172.29.50.31`), HTTP lokal | `203.0.113.10`, `https://iot.namaanda.my.id` |
| "Pi gerbang" dan "Pi gratis" | `192.168.1.37` (`gateway.local`) |
| loket lab 64xx–65xx; jalur *job* di *forge* | loket pembaca; `/__w/rumah-pintar-mini/rumah-pintar-mini` |
| *hash commit*, sidik host, tanggal *tag* | `<sha>`, `SHA256:…`, tidak dikutip |
| Node 1 = simulator Modul 28 (`f00d00000001` "Latihan ruang tamu") | Node 1-mu |

Penggantian hanya pada baris yang selain itu sama persis. Jam ditulis WIB: jam mesin penulis WITA (WIB + 1 jam) ditulis ulang; log robot dan `Start at` Vitest UTC (+7 jam); `pasang.sh` mencap jam menurut zona mesinnya ("VPS" UTC, "Pi" WIB). Angka waktu dan ukuran = **contoh** robot tiruan di satu Raspberry Pi 5, bukan GitHub: *merge* → "VPS" terpasang ±5–6½ menit, "Pi" ±6–8 menit karena penjadwalnya 60 detik, bukan 15 menit. Kontainer `--privileged` (setara root) diizinkan khusus untuk lab akhir ini, lalu dihapus bersama semua sisa lab; setelan emulasi (binfmt) mesin tidak diubah; pindai rahasia di rekaman dan gambar: 0. Di luar izin itu, jadi tidak dipakai: systemd sungguhan di kontainer, unduhan Playwright, akun GitHub uji, dan QEMU.

Yang **tidak** diuji: GitHub sungguhan (layar, aturan cabang, `concurrency`, `GITHUB_TOKEN`, *runner* x64 dan waktunya; tiruannya di 🔬), GHCR sungguhan (paket privat → publik), *image* amd64 yang dijalankan, VPS sungguhan, uji asap ber-domain HTTPS, jembatan TLS 8883 (di lab MQTT polos), jam weker systemd yang berjalan (`list-timers`, `journalctl`), Cloudflare Tunnel, HP, sebagian besar 🔬, 🧩 Tingkat 3, Docker Desktop, Windows, macOS, dan PowerShell.

Yang **belum terbukti** saat terbit: *job* `staging` di *runner* GitHub (Docker 28.0.4, Compose 2.38.2: tarikan ±1,14 GB, `up --wait` dengan layanan sekali jalan, loket yang bebas); *tag* buatan `GITHUB_TOKEN` yang tidak memicu *run* baru (dokumen); izin Actions untuk paket buatan Modul 26 dan pesan tarik paket yang masih privat; `Dockerfile` lama yang dibangun untuk arm64 lewat emulasi; waktu *merge* → produksi di GitHub; PWA lewat HTTPS di HP; jam weker sesudah *reboot*. Saat naskah ini ditulis (November 2026), `ci.yml` belum pernah berjalan di GitHub sungguhan.

---

[⬅️ Modul 28](../modul-28-ota-provisioning-fleet/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 30 — Monitoring, Backup, Runbook: Tahu Lebih Dulu, Tidak Pernah Kehilangan Data** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data))
