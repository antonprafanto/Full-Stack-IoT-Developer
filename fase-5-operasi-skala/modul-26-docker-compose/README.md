# Modul 26 — Docker & Docker Compose: Satu Perintah untuk Semua Layanan

🌐 **Bahasa Indonesia** · [English](../../en/phase-5-operations-scale/module-26-docker-compose/README.md)

*Fase 5 · Minggu 26 · Perangkat keras: **Kit B** (Raspberry Pi) atau laptop saja · Prasyarat: **Modul 25** (backend 1.2.0, frontend 1.1.0, Grafana di `main`), Modul 17 (Docker secukupnya), Modul 21 (broker berkunci) · Waktu: 10–12 jam, dicicil dalam satu minggu (jalur ⭐ ±9 jam)*

[⬅️ Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 27 ➡️ (segera terbit — baca ringkasannya di Silabus)](../../SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa)

---

[Modul 25 ditutup](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#-checklist-kelulusan-modul-25) dengan satu janji: Grafana pindah ke Docker Compose dengan lemari `rumahpintar-grafana-data` yang sama, dan dashboard, aturan, serta *contact point*-mu ikut serta. Dengan janji itu, **Fase 5 dibuka**. Menurut [Silabus](../../SILABUS.md#-fase-5--operasi--skala-deploy-ota-cicd--capstone-modul-2632), tujuan fase ini membawa sistemmu dari "jalan di jaringan rumah saya" menjadi "jalan di internet, 24/7, terenkripsi, bisa diperbarui, dan tidak kehilangan data". Modul 26 adalah langkah pertamanya: **membungkus seluruh sistem** supaya bisa dinyalakan dengan satu perintah dan dibawa ke mesin lain. Semuanya **masih di jaringan rumah**; internet, HTTPS, dan TLS menunggu di Modul 27.

Banyak janji lama dilunasi minggu ini. [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari) memakai Docker "secukupnya" dan menunda isi kontainer, image buatan sendiri, dan Docker Compose sampai Modul 26; Silabus pun menulis ["Compose penuh di Modul 26"](../../SILABUS.md#3-pilihan-teknologi--alasannya). [Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#9-backup-dan-restore-fotokopi-arsip-lalu-buktikan-bisa-dipulihkan) berpesan bahwa backup yang belum pernah di-*restore* sama dengan tidak punya backup. [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#6-satpam-di-setiap-pintu-peran-admin-dan-viewer) menyiapkan `HEAD /health` untuk pemeriksa kesehatan Docker. Modul 22 dan [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#3-satu-alamat-untuk-satu-layar-react-router-mode-deklaratif) menunggu server sungguhan yang menyajikan `dist/` dan tetap menjawab F5 di semua alamat. [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong) menunda bedah lorong `rumahpintar` dan menyebut YAML aturan *alert*-nya arsip sampai *provisioning* di Modul 26.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Menyalakan rumah butuh dua `docker run`, dua atau tiga terminal `npm run dev`, dan broker yang diurus systemd di Pi. | Setiap bagian punya resep menyala sendiri, tersebar di 25 modul. | **Satu `docker compose up -d`** menyalakan semuanya, dari database sampai Grafana ([Konsep 5](#5-satu-berkas-untuk-satu-rumah-docker-compose), [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit)) |
| Laptop teman tidak bisa menjalankan proyekmu: "di laptop saya jalan". | Versi program, sistem operasi, dan setelan berbeda di tiap mesin; urutan menyalakannya hanya ada di kepalamu. | **Cetakan** backend dan web, satu berkas Compose, dan `.env.example` ([Konsep 1](#1-di-laptop-saya-jalan-peti-kemas-untuk-program)–5, Praktik 2–3, [Praktik 11](#praktik-11--uji-laptop-bersih-45-menit)) |
| Dashboard hanya hidup selama Vite menyala. | `vite preview` bukan server sungguhan, dan `dist/` belum punya penyaji. | **Caddy** menyajikan `dist/` dan meneruskan `/api` ke backend ([Konsep 4](#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy), Praktik 3) |
| Grafana dirakit lewat klik; YAML ekspor Modul 25 hanya arsip. | Belum ada berkas yang dibaca Grafana saat menyala. | **Grafana sebagai berkas** (*provisioning*) dari folder `grafana/` ([Konsep 9](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana), [Praktik 7](#praktik-7--grafana-sebagai-berkas-provisioning-dan-akun-grafana_baca-sekali-jalan-40-menit)) |
| Program berhenti = sistem mati sampai kamu menyalakannya lagi. | Tidak ada yang mengawasi program di terminalmu. | **Aturan bangkit** (*restart policy*) dan **pemeriksaan kesehatan** (*healthcheck*) ([Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log), [Praktik 8](#praktik-8--bangkit-sendiri-dan-data-yang-bertahan-30-menit)) |
| Seluruh riwayat bergantung pada satu lemari di satu laptop. | Cadangan Modul 18 dibuat sekali dengan tangan, dan resepnya belum mengenal Compose. | **Cadangan lemari dan uji pulih** ke proyek terpisah ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan), [Praktik 9](#praktik-9--cadangan-lemari-dan-uji-pulih-ke-proyek-terpisah-35-menit)) |

Di akhir minggu, satu perintah menyalakan seluruh rumahmu, dan rumah itu bisa dibawa ke laptop lain. Itulah syarat lulus dari [Silabus](../../SILABUS.md#modul-26--docker--docker-compose-satu-perintah-untuk-semua-layanan): **di laptop yang "bersih" (atau milik teman), `git clone` + `docker compose up -d` menjalankan seluruh sistem dalam < 10 menit, dan data riwayat tetap ada setelah `docker compose down && up`.** Modul ini memecahnya menjadi empat bukti:

- **L1** laptop bersih < 10 menit: *stopwatch* dari `git clone` sampai halaman **Masuk** di `http://localhost` (11.2). Catat dua angka, **total** dan **tanpa unduhan**, ditambah kecepatan internetmu. Memasang Docker dan Git serta membuat akun GitHub tidak dihitung.
- **L2** layanan bawaan menyala: `db`, `mosquitto`, `backend`, `web`, dan `grafana` hidup, sedangkan `akun-broker`, `migrasi`, dan `akun-grafana` tampil `Exited (0)` di `docker compose ps -a` (11.3). Layanan opsional (`uptime-kuma`, `cloudflared`, `nodered`) bukan bagian L2.
- **L3** sidik jari riwayat sama sesudah `docker compose down` lalu `docker compose up -d`, bukan `down -v` (8.4 dan 11.4).
- **L4** (Kit B) Pi menjalankan `edge/compose.edge.yml`. Node 1 (dan Node 2 lewat Node 1) masuk ke broker kontainer dengan alamat dan akun lama, tanpa mengubah firmware; datanya tampil *live* di dashboard laptop lewat jembatan (*bridge*), dan tombol lampu dijawab `ack` (6.6).

Di **jalur laptop**, bunyinya L1 + L2 + L3, dan pengganti L4 adalah simulator dan Kebun tiruan yang menerbitkan ke broker pusat lalu tampil *live* ([5.5](#55--data-live-lewat-broker-pusat-simulator-kebun-tiruan-dan-tombol-lampu-7-menit)); gerbang boleh dicoba di laptop yang sama, seperti cara penulis menguji ([6.7](#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)). Kalimat ✅ tetap, tetapi dibaca jujur: di antara `git clone` dan `up -d` ada pengisian `.env` (rahasia tidak ikut Git) dan, di laptop baru, dua `docker volume create`. Silabus (v1.0.28) mencatat pecahan L1–L4 ini, bunyi jalur laptop, dan asumsi unduhan ±1,1 GB di baris ✅. Uji "hangat" penulis di mesin yang sama (image resmi sudah ada) sampai di halaman **Masuk** dalam 62,3 detik.

Untuk Rumah Pintar Mini, backend naik ke **1.3.0** (siap dikemas dalam cetakan Docker; tanpa migrasi, tanpa paket baru), dashboard ke **1.2.0** (tiga baris `soket.ts` dan cetakan Caddy), folder `grafana/` menjadi berkas *provisioning*, dan ada berkas baru di akar proyek (antara lain `compose.cloud.yml` dan `.env.example`) serta di `edge/` (`compose.edge.yml`). Kontrak data tetap **1.4**, dan firmware Node 1 (v1.6.0) serta Node 2 (v1.0.0) tidak berubah. Modul 26 bukan Checkpoint: kuisnya ikut [tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase) di akhir fase.

![Peta jalan Modul 26. Atas, enam fase kurikulum; Fase 5 Operasi dan skala (Modul 26–32) berbingkai merah-ungu dengan bendera Fase 5 dibuka. Modul 1–25 selesai; Modul 26 merah bertanda KAMU DI SINI, Modul 27–32 belum. Catatan: seluruh rumah dalam Docker Compose, satu perintah di laptop dan di Pi; cetakan backend dan web, Grafana dari berkas, masih di jaringan rumah. Kotak Modul 26 minggu ini, 10–12 jam dicicil, jalur bintang ±9 jam; Kit B atau laptop saja, Docker Desktop 4.96.2+ atau Engine 29, disk ±6 GB, hasil Modul 25 di main. Kiri: pemanasan Docker dan YAML; Kemenangan Cepat, dua layanan satu perintah; P1 meja kerja dan sidik jari data lama; P2 cetakan backend 1.3.0; P3 cetakan web 1.2.0, Vite ke Caddy; P4 lemari pindah, database dan Grafana ke Compose; P5 seluruh rumah dalam satu perintah. Kanan: P6 gerbang Pi, edge/compose.edge.yml + jembatan (jalur laptop: simulator); P7 Grafana sebagai berkas, ambil alih aturan, contact point, lalu data source lama; P8 bangkit sendiri dan data yang bertahan; P9 cadangan lemari dan uji pulih; P10 toko image, GHCR manual, arm64 lawan amd64; P11 uji laptop bersih; Tambahan: pull request Seluruh sistem dalam Docker Compose. Bintang (wajib): P1–P8, P11, pull request. Bawah, syarat lulus pecahan ✅ Silabus: L1 laptop bersih, dari git clone sampai halaman Masuk kurang dari 10 menit, catat total, tanpa unduhan, dan kecepatan internet; L2 layanan bawaan menyala, db, backend, grafana sehat, mosquitto, web, sekali jalan Exited (0); L3 sidik jari riwayat sama sesudah docker compose down lalu up -d, bukan down -v; L4 Kit B, Pi menjalankan edge/compose.edge.yml, Node 1 masuk dengan alamat dan akun lama (firmware tidak diubah), data tampil live. Jalur laptop: L1 + L2 + L3, pengganti L4 simulator ke broker pusat. Kalimat ✅ Silabus: di laptop yang bersih (atau milik teman), git clone + docker compose up -d menjalankan seluruh sistem dalam kurang dari 10 menit, dan data riwayat tetap ada setelah docker compose down && up; catatan v1.0.28: prasyarat tidak dihitung, unduhan ±1,1 GB. Dibuktikan: L1, L2 Praktik 11; L3 Praktik 8 dan 11; L4 Praktik 6; lab penulis hangat 62,3 s sampai halaman Masuk. Berubah: backend 1.3.0, frontend 1.2.0, grafana/ jadi provisioning, dua berkas Compose baru. Tetap: kontrak data 1.4, firmware, migrasi 001–010. Internet, HTTPS, TLS MQTT, dan jembatan tahan putus menyusul di Modul 27.](aset/peta-jalan-modul-26.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Dua jalur, satu pusat.** Di kedua jalur, laptop menjalankan pusat `compose.cloud.yml` ([Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang)). **Kit B**: Pi menjalankan gerbang, broker Mosquitto dalam kontainer yang dimasuki Node 1 seperti biasa ([Praktik 6](#praktik-6--gerbang-pi-kit-b-docker-engine-edgecomposeedgeyml-dan-jembatan-lan-70-menit-jalur-laptop-25-menit)). **Jalur laptop**: simulator dan Kebun tiruan menerbitkan langsung ke broker pusat.
> - **Mode rumah dan mode kembang.** Mode rumah = Compose: `backend` dan `web` di kontainer, dashboard di `http://localhost`. Mode kembang = `npm run dev` dan Vite seperti Modul 16–25, untuk mengubah kode. **Satu backend saja yang menyala**, mode rumah ATAU mode kembang ([5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit)).
> - **Pindahan.** Rumah lamamu berhenti di 1.2 dan baru menyala lagi di [5.3](#53--satu-perintah-menyalakan-seluruh-rumah-docker-compose-up--d---build-dan-ps--a-10-menit) (jalur perangkat: data Node 1 baru sampai lagi di 6.6). Selama itu bacaan tidak tercatat, dan aturan Grafana lama mengirim 🔴 "Node diam" sungguhan; ✅ datang sendiri sesudah data kembali.
> - **Tabel bukti**: tempat setiap syarat dibuktikan, dan tandanya.
>
>   | Syarat | Dibuktikan di | Yang kamu lihat |
>   | :-: | :-- | :-- |
>   | L1 | [11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit) | halaman **Masuk** di `http://localhost/masuk`, sebelum *stopwatch* lewat 10 menit |
>   | L2 | [11.3](#113--l2-layanan-bawaan-menyala-grafana-dari-berkas-dan-riwayat-contoh-8-menit) | `docker compose ps -a`: lima layanan `Up` (tiga `(healthy)`) dan tiga sekali jalan `Exited (0)` |
>   | L3 | [8.4](#84--l3-sidik-jari-sama-sesudah-docker-compose-down-lalu-up--d-8-menit), [11.4](#114--l3-di-tempat-uji-sidik-jari-sebelum-dan-sesudah-down-7-menit) | `bacaan` dan `sidik_jari` sesudah `down` lalu `up -d` sama dengan sebelumnya |
>   | L4 | [6.6](#66--l4-node-1-masuk-dengan-akun-lama-data-live-di-dashboard-dan-ack-lampu-12-menit) (jalur laptop: 5.5) | log broker laptop `New bridge connected … as jembatan-pi`, lencana **Live**, dan `ack` lampu |
>
> - **Kotak 🖥️ di setiap praktik menyebut alatnya**: **VS Code** di proyek `rumah-pintar-mini` (terminal di **akar proyek** untuk semua `docker compose` pusat, juga terminal `backend`, `frontend`, dan `alat`); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux); **terminal SSH ke Pi** (Kit B); **Chrome** atau **Edge**; **Bruno**; **MQTTX**; **GitHub**; dan **Telegram**.
> - **Kotak Hasilnya.** Keluaran direkam penulis di **Raspberry Pi 5 dengan Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3 (paket Ubuntu), dan Chrome 156. Satu mesin itu memerankan laptop DAN Pi sekaligus (dua proyek Compose, gerbang di loket lain). Perintah `docker compose` sama di semua OS; Compose 5.6.1 di Docker Desktop, menurut dokumentasi resmi, fungsinya identik dengan v2. Baris kemajuan seperti `[+] Running 11/11` bisa tampil lain di versimu; yang dibaca adalah kata keadaannya: `Created`, `Started`, `Healthy`, `Exited`. Telegram di lab penulis adalah **server Bot API tiruan**, dan GHCR diperankan **toko image tiruan** (`registry:3.1.2` di `127.0.0.1`). Nama, loket, IP, dan jalur lab disamarkan, jam ditulis WIB, dan ukuran serta waktu hanya **contoh** (rincian di [📚 Sumber](#-sumber--atribusi-gambar)).
> - **Status jujur: penulis belum menguji** Docker Desktop (Windows, macOS), PowerShell dan CMD, Raspberry Pi OS sungguhan, ESP32 sungguhan ke broker kontainer, dua mesin di LAN, HP sungguhan, aplikasi MQTTX, image amd64, GHCR dan GitHub sungguhan, *restart* Docker atau *reboot*, serta laptop teman dengan internet rumah. Semua itu tugasmu; jangan mencentang butir yang belum benar-benar terjadi di [✅](#-checklist-kelulusan-modul-26).
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk pintasan VS Code dan browser. **Kecuali di terminal:** menghentikan program tetap **Ctrl + C**, juga di Mac.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Loket database, Grafana, backend, dan Uptime Kuma hanya `127.0.0.1`.** Broker dan web dibuka ke jaringan rumah hanya bila perlu, **tanpa *port forwarding*** (belum ada TLS sampai Modul 27). Broker pusat sengaja mendengar di semua antarmuka karena gerbang Pi dan ESP32 masuk dari LAN; di WiFi umum, hentikan dengan `docker compose stop mosquitto` ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan), [5.1](#51-broker-pusat-edgepusatconf-blok-acl-jembatan-pi-serta-layanan-akun-broker-dan-mosquitto-12-menit)).
> 2. **`.env` (juga `edge/.env`) tidak pernah masuk Git** dan tidak ditempel ke forum atau AI. Begitu juga keluaran `docker compose config`, yang mencetak semua rahasia ([Konsep 9](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana)).
> 3. **Jangan `docker compose down -v`, `docker volume rm rumahpintar-…`, atau `docker system prune --volumes`** di laptop yang menyimpan riwayat aslimu: akun broker atau riwayatmu ikut terhapus ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan), [8.5](#85-jangan-down--v-lalu-opsional-restart-docker-atau-reboot-pi-4-menit)).
> 4. **Image publik bisa dibuka siapa saja.** Pasang `.dockerignore` dulu, periksa `docker history --no-trunc` dulu, baru *push* dan jadikan publik (2.2, [2.4](#24--docker-build-ukuran-image-dan-docker-history-tanpa-rahasia-10-menit), [10.3](#103-periksa-docker-history-lalu-jadikan-paketnya-publik-8-menit)).
> 5. **Grup `docker` di Pi setara root.** Masukkan hanya akunmu sendiri ([6.1](#61-pi-docker-engine-dari-repo-apt-docker-grup-docker-dan-git-20-menit), [🔬](#-bedah-teknis-opsional)).
> 6. **Satu backend saja yang menyala**, mode rumah ATAU mode kembang. Dua backend saling menendang di broker, dan Telegram menjawab `409 Conflict` ([5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit)).

Seperti Modul 16–25, modul ini diawali [🔁 Pemanasan ulang Docker secukupnya & YAML](#-pemanasan-ulang-docker-secukupnya--yaml-35-menit). Hari pertama cukup pemanasan, [🏆 Kemenangan Cepat](#-kemenangan-cepat-dua-layanan-satu-perintah-25-menit), Konsep 1–4, [1.1](#11-cabang-fiturdocker-compose-dan-rencana-pindahan-3-menit), lalu [Praktik 2](#praktik-2--cetakan-backend-130-45-menit) dan [Praktik 3](#praktik-3--cetakan-web-120-vite--caddy-45-menit): rumah lamamu tetap menyala. [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) sampai [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit) dikerjakan dalam satu duduk, ±2,5 jam. Sebelas konsep dibaca berselang-seling dengan praktiknya; urutannya ada di awal [🧠](#-konsep-mengapa). Bagian lipat di [🚨](#-kalau-tidak-jalan) dibuka saat perlu; bagian lipat di [🔬](#-bedah-teknis-opsional) boleh dilewati.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🔁 Pemanasan ulang Docker secukupnya & YAML (35 menit)](#-pemanasan-ulang-docker-secukupnya--yaml-35-menit)
4. [🏆 Kemenangan Cepat: dua layanan, satu perintah (25 menit)](#-kemenangan-cepat-dua-layanan-satu-perintah-25-menit)
5. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Peti kemas untuk program](#1-di-laptop-saya-jalan-peti-kemas-untuk-program) · [2 Cetakan berlapis](#2-cetakan-berlapis-image-tag-digest-dan-arsitektur) · [3 `Dockerfile`](#3-resep-cetakan-dockerfile-dan-dockerignore) · [4 Dapur dan meja saji](#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy) · [5 Docker Compose](#5-satu-berkas-untuk-satu-rumah-docker-compose) · [6 Lemari dan jendela](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan) · [7 Lorong dibedah](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan) · [8 Menyala berurutan](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log) · [9 `.env` dan *provisioning*](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana) · [10 Pusat dan gerbang](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) · [11 Toko image](#11-toko-image-ghcr-dan-arsitektur)
6. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Sidik jari data lama](#praktik-1--meja-kerja-dan-sidik-jari-data-lama-20-menit) · [2 Cetakan backend](#praktik-2--cetakan-backend-130-45-menit) · [3 Cetakan web](#praktik-3--cetakan-web-120-vite--caddy-45-menit) · [4 Lemari pindah](#praktik-4--lemari-pindah-database-dan-grafana-ke-compose-tanpa-kehilangan-data-50-menit) · [5 Seluruh rumah](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit) · [6 Gerbang Pi](#praktik-6--gerbang-pi-kit-b-docker-engine-edgecomposeedgeyml-dan-jembatan-lan-70-menit-jalur-laptop-25-menit) · [7 Grafana sebagai berkas](#praktik-7--grafana-sebagai-berkas-provisioning-dan-akun-grafana_baca-sekali-jalan-40-menit) · [8 Bangkit sendiri](#praktik-8--bangkit-sendiri-dan-data-yang-bertahan-30-menit) · [9 Cadangan dan uji pulih](#praktik-9--cadangan-lemari-dan-uji-pulih-ke-proyek-terpisah-35-menit) · [10 Toko image](#praktik-10--toko-image-ghcr-manual-35-menit) · [11 Uji laptop bersih](#praktik-11--uji-laptop-bersih-45-menit)
7. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
8. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
9. [🧩 Tantangan mandiri](#-tantangan-mandiri)
10. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
11. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-26)

## 🎯 Setelah modul ini kamu bisa…

1. **Menjelaskan "di laptop saya jalan" dengan bahasamu sendiri**: cetakan (*image*), kontainer, lemari (*volume*), dan lorong (*network*) sebagai peti kemas yang bisa dibawa ke mesin mana pun, sedangkan data dan rahasia (`.env`) sengaja tidak ikut di dalamnya.
2. **Menulis `Dockerfile` dua tahap** (*multi-stage*) untuk backend 1.3.0 dan dashboard 1.2.0, dengan `.dockerignore` yang menahan rahasia di luar cetakan (dibuktikan isi `/app` tanpa `.env`); dashboard disajikan Caddy di `http://localhost` tanpa Vite, F5 aman di semua alamat.
3. **Menyalakan seluruh rumah dengan satu `docker compose up -d`** dari `compose.cloud.yml`: database, broker, backend, web, dan Grafana, ditambah tiga layanan sekali jalan yang menyiapkan akun dan migrasi lalu pulang dengan `Exited (0)`.
4. **Memindahkan riwayat dan Grafana ke Compose tanpa kehilangan data**, di atas lemari lama yang sama, lalu membuktikannya dengan sidik jari riwayat yang sama persis sebelum dan sesudah pindah.
5. **Membuat Grafana menyala lengkap dari berkas** (*provisioning*): data source, dashboard, *contact point*, dan aturan "Node diam" dibaca dari folder `grafana/`, sesudah kamu mengambil alih isi lamanya tanpa *alert* ganda.
6. **Membuat layanan bangkit sendiri** dengan pemeriksaan kesehatan (*healthcheck*), urutan menyala, dan aturan bangkit (*restart policy*), lalu membuktikan bedanya program yang berhenti sendiri (hidup lagi) dengan `docker compose stop` (tetap mati).
7. **Menjalankan broker gerbang di Pi dalam kontainer** (Kit B) lewat `edge/compose.edge.yml` dan jembatan LAN ke laptop; Node 1 tetap masuk dengan alamat dan akun lama, tanpa firmware baru.
8. **Berpindah antara mode rumah dan mode kembang**: Compose untuk menjalankan rumah, `npm run dev` untuk mengubah kode, dan selalu hanya satu backend yang menyala.
9. **Mencadangkan lemari dan menguji pulihnya** di proyek terpisah, tanpa menyentuh riwayat aslimu.
10. **Menitipkan cetakan di toko image** (*registry*) GHCR, lalu menguji "laptop bersih": dari `git clone` sampai halaman **Masuk** dalam < 10 menit, dengan riwayat yang tetap ada sesudah `docker compose down` lalu `up -d`.

## 🧰 Yang perlu disiapkan

| Yang disiapkan | Keterangan |
| :--- | :--- |
| **Hasil Modul 25** di `main` | Backend 1.2.0, frontend 1.1.0, dan folder `grafana/`, ditambah rumah lama yang menyala: kontainer `rumahpintar-db` dan `rumahpintar-grafana`, lorong `rumahpintar`, serta lemari `rumahpintar-data` dan `rumahpintar-grafana-data` (diperiksa di [🔁 Langkah 1](#langkah-1--inventaris-rumahmu-kontainer-lemari-lorong-cetakan-dan-ruang-disk)). |
| **Docker** | [Docker Desktop](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#-persiapan-memasang-docker-desktop-3045-menit-sekali-saja) ≥ 4.96.2 (Windows, macOS; membawa Engine 29.9.2 dan Compose 5.6.1; tidak diuji penulis) atau Docker Engine 29 dengan plugin Compose (Linux). Perintahnya `docker compose` dengan spasi; `docker-compose` (versi 1) tidak dipakai. |
| **Ruang disk ±6 GB** | Untuk semua image (TimescaleDB dan Grafana sudah ±4 GB), dua cetakan buatanmu, dan cadangan. |
| **Sandi lama** dari pengelola sandimu | Sandi postgres (Modul 17) untuk `.env` di [4.2](#42-kebersihan-git-dulu-gitignore-gitattributes-lalu-env-dengan-sandi-postgres-lama-5-menit), dan sandi admin Grafana (Modul 25) sejak 1.3 sampai [7.4](#74--docker-compose-up--d-provisioned-tombol-test-dan-save-yang-ditolak-10-menit). Lemari lama tetap memakai sandi lama. |
| **Jalur data** (pilih satu) | **Kit B:** Node 1 (dan Node 2) serta Pi dengan Raspberry Pi OS **64-bit** (`dpkg --print-architecture`: `arm64`), SSH, sandi `sudo`, dan Git ([6.1](#61-pi-docker-engine-dari-repo-apt-docker-grup-docker-dan-git-20-menit)). Pi OS 32-bit hanya didukung sampai Docker Engine 28, jadi pakai jalur laptop. **Jalur laptop:** simulator `f00d00000001` dan Kebun tiruan. |
| **Node.js 24, VS Code, Git, Bruno, Chrome/Edge** | Sama dengan Modul 25, ditambah MQTTX ([KC Langkah 4](#langkah-4--mqttx-lewat-loket-1884-pesan-dari-kontainer-pengirim-6-menit)) dan repositori `belajar-iot` (folder `modul-26`). |
| **Akun GitHub** | Cabang dan *pull request* (➕ E); toko image GHCR di [Praktik 10](#praktik-10--toko-image-ghcr-manual-35-menit) (opsional). |
| **Bot Telegram Modul 19** (tidak wajib) | [Token dan `chat_id`](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#63-setelan-telegram-di-env) yang sama, nanti disalin ke `.env` akar. |

**Unduh tiga image kecil sekarang**, sebelum hari pertama: ±100 MB (TimescaleDB dan Grafana sudah ada sejak Modul 17 dan 25), dan waktunya tidak dihitung dalam [KC Langkah 1](#langkah-1--baca-composeyaml-lalu-nyalakan-dengan-docker-compose-up--d-8-menit). Dengan Docker menyala, ketik di terminal mana saja (misalnya terminal VS Code) **satu perintah per image**, dan tunggu *prompt* kembali sebelum perintah berikutnya:

```text
docker pull eclipse-mosquitto:2.1.2-alpine
```

```text
docker pull caddy:2.11.7-alpine
```

```text
docker pull node:24.22.1-alpine3.24
```

`docker pull` hanya menerima satu nama; tiga nama sekaligus ditolak dengan `docker: 'docker pull' requires 1 argument`. Ketiganya kini tampil di `docker image ls`. Lalu periksa Compose:

```text
docker compose version
```

**Hasilnya** (contoh, lab penulis):

```text
Docker Compose version 2.40.3+ds1-0ubuntu1
```

Di Docker Desktop angkanya 5.x; yang penting perintahnya dikenali. Versi yang dipakai modul ini (Oktober 2026; Silabus v1.0.28 ikut mencatat Caddy dan versi ini di daftar alat Modul 26):

| Komponen | Versi | Catatan |
| :--- | :--- | :--- |
| Docker Engine, Docker Desktop | 29.x, ≥ 4.96.2 | Pi: repo apt Docker; penulis: Engine 29.1.3 paket Ubuntu `docker.io` |
| `docker compose` | 5.6.1 (Desktop), 2.40.3 (penulis) | fungsinya identik, menurut dokumentasi resmi |
| `timescale/timescaledb` | `2.30.2-pg17` | tetap; jangan 2.31.0, `-oss`, atau `-pg18` |
| `grafana/grafana` | `13.2.4` | tetap; 13.2.5 dan 13.3.0 sudah ada, tetapi tidak dipakai |
| `eclipse-mosquitto` | `2.1.2-alpine` | baru: broker pusat dan gerbang |
| `caddy` | `2.11.7-alpine` | baru: penyaji web, tanpa HTTPS |
| `node` | `24.22.1-alpine3.24` | baru: dasar cetakan backend dan web |
| `louislam/uptime-kuma`, `cloudflare/cloudflared`, `nodered/node-red` | `2.5.8-slim`, `2026.10.5`, `5.0.9-24` | hanya di profil yang mati (Modul 30 dan 🧩 Tingkat 2, Modul 27, opsional) |

Paket npm tidak ada yang baru (`pino-pretty` 13.2.0 hanya pindah ke `dependencies`), dan Node.js tetap 24 (penulis: 24.21.0).

**Waktunya** ±11,4 jam, belum termasuk unduhan dan menunggu: pemanasan 35 menit, Kemenangan Cepat 25, konsep ±100, praktik 475, ➕ 30, serta kuis dan checklist 20. Jalur ⭐ saja ±9 jam.

## 🔁 Pemanasan ulang Docker secukupnya & YAML (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminalnya, dan **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana` menyala.

Lima bekal sebelum Compose: tidak ada yang dinyalakan, dihapus, atau diubah. **Nanti di …** menunjuk tempat pemakaiannya. Buat folder **`modul-26/pemanasan`** di repositori **`belajar-iot`**, buka terminal VS Code di sana, dan salin lembar [`inventaris.md`](kode/pemanasan/inventaris.md) (**Copy raw file**) ke `modul-26`. Kolom **Di laptopmu** diisi sepanjang pemanasan, tanpa sandi, token, atau isi `.env`.

### Langkah 1 — Inventaris rumahmu: kontainer, lemari, lorong, cetakan, dan ruang disk

Jalankan satu per satu untuk bagian 1 lembar inventaris:

```text
docker ps -a
docker volume ls
docker network ls
docker image ls
docker system df
```

Sesudah Modul 25 biasanya ada kontainer `rumahpintar-db` dan `rumahpintar-grafana` (`Up`), lorong `rumahpintar` (selain `bridge`, `host`, `none` bawaan Docker), dan dua lemari. **Hasilnya** `docker volume ls` (contoh, dipotong):

```text
DRIVER    VOLUME NAME
local     rumahpintar-data
local     rumahpintar-grafana-data
```

`docker image ls` di Docker Engine 29.1.3 penulis berkolom `DISK USAGE` (di disk) dan `CONTENT SIZE` (≈ ukuran unduhan); versi lain bisa berbeda. `docker system df` cukup dibaca, tanpa *prune* (aturan aman nomor 3). Nama yang berbeda dari contoh itulah yang dicatat.

**Nanti di [4.3](#43--hapus-kontainer-lama-lemarinya-tetap-docker-stop-docker-rm-dan-docker-network-rm-8-menit):** kontainer lama dihapus, kedua lemari dipakai Compose apa adanya. Nama yang bentrok adalah sebab galat paling sering minggu ini.

### Langkah 2 — Siapa memakai loket 80, 1883, 3000, 5173, 5432, dan 8080?

Compose memakai loket 80 (dashboard), 8080 (backend), 5432 (database), 3000 (Grafana), dan 1883 (broker pusat); Vite tetap 5173. Loket yang dibuka Docker:

```text
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

**Hasilnya (contoh):**

```text
NAMES                 PORTS
rumahpintar-grafana   127.0.0.1:3000->3000/tcp
rumahpintar-db        127.0.0.1:5432->5432/tcp
```

Program di luar Docker (broker laptop lama, `npm run dev`, IIS):

- Linux dan Pi: `ss -ltnp`. Loket buatan Docker tampil tanpa nama program, dan backend `npm run dev` tampil sebagai `"MainThread"`.
- macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(tidak diuji penulis)*.
- Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,1883,3000,5173,5432,8080` *(tidak diuji penulis)*.

Catat di bagian 2 lembar inventaris. Loket 80 terpakai? Nanti `PORT_WEB=8081` dan `CORS_ORIGIN` di `.env`. **Nanti di [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit):** broker lama jalur laptop (Modul 11/12) di 1883 dihentikan di kotak awalnya.

### Langkah 3 — YAML dari nol: `latihan.yaml`, variabel wajib, dan jebakan Tab

Berkas Compose ditulis dalam **YAML**. Buat **`latihan.yaml`** di folder `pemanasan`, lalu baca komentarnya dari atas ke bawah: itulah pelajarannya.

```yaml
# latihan.yaml - Pemanasan Modul 26, langkah 3-4: YAML dan variabel lingkungan dalam satu berkas Compose kecil.
# Berkas ini TIDAK untuk dinyalakan. Cukup minta Compose MEMBACANYA dengan "config": Compose mencetak ulang isinya seperti yang
# ia pahami (nilai variabel sudah diisi, angka sudah diubah menjadi teks), tanpa menyalakan apa pun. Dari folder ini:
#   docker compose -f latihan.yaml config                          -> galat: PEMILIK belum diisi (lihat ${PEMILIK:?...})
#   docker compose -f latihan.yaml --env-file latihan.env config   -> berhasil, dengan nilai dari latihan.env
#
# Aturan YAML yang dipakai di sini:
# - "kunci: nilai" = peta (pasangan nama dan isi). Isi yang menjorok ke kanan di bawah sebuah kunci adalah milik kunci itu.
# - Menjorok dengan SPASI (di berkas ini 2 spasi per tingkat), JANGAN Tab: Tab membuat Compose berhenti dengan galat
#   "found character that cannot start any token".
# - Baris yang diawali "- " = satu butir daftar.
# - Tanda # = komentar sampai akhir baris; Compose mengabaikannya.
name: latihan-yaml

services:
  sapa:
    # teks biasa boleh tanpa tanda kutip
    image: eclipse-mosquitto:2.1.2-alpine
    # daftar boleh ditulis menurun (dengan "- ") atau sebaris dalam [ ]. $$ = tanda $ untuk sh, bukan untuk Compose.
    command: ["sh", "-c", "echo $$SAPAAN, $$PEMILIK"]
    environment:
      # Tiga bentuk variabel. Nilainya dicari di lingkungan terminal, lalu di .env folder ini (atau --env-file):
      #   ${NAMA:-bawaan}  bawaan dipakai bila NAMA kosong atau tidak ada
      #   ${NAMA:?pesan}   Compose BERHENTI dengan pesan itu bila NAMA kosong atau tidak ada (untuk rahasia wajib)
      #   ${NAMA}          bila tidak ada: peringatan "variable is not set", lalu diisi teks kosong
      SAPAAN: ${SAPAAN:-halo}
      PEMILIK: ${PEMILIK:?isi PEMILIK di latihan.env}
      KOTA: ${KOTA}
      # Angka tanpa kutip dibaca sebagai ANGKA dulu, baru diubah menjadi teks: nol di depan dan nol di belakang hilang.
      KODE_TANPA_KUTIP: 007       # menjadi "7"
      KODE: "007"                 # tetap "007"
      VERSI_TANPA_KUTIP: 1.10     # menjadi "1.1"
      VERSI: "1.10"               # tetap "1.10"
      # Compose 2.40.3 membaca off tanpa kutip pun sebagai teks "off", tetapi pembaca YAML lama membacanya "false".
      # Tanda kutip membuatnya pasti teks di mana pun (proyek kita menulis TIMESCALEDB_TELEMETRY: "off").
      TELEMETRI: "off"
    ports:
      # "loket-laptop:port-kontainer". Selalu dikutip: isinya berisi titik dua dan bukan sekadar kata.
      - "127.0.0.1:1885:1883"
    logging:
      driver: json-file
      options:
        max-size: 10m
        # tanda kutip: setelan log Docker hanya menerima teks; Compose 2.40.3 mengubah 3 menjadi "3" sendiri, tetapi kutip
        # membuat maksudnya jelas
        max-file: "3"
```

`-f` = nama berkasnya (tanpa `-f`, Compose mencari `compose.yaml`); `config` mencetak ulang isinya seperti yang Compose pahami:

```text
docker compose -f latihan.yaml config
```

**Hasilnya** (Compose berhenti, *exit code* 1):

```text
WARN[0000] The "KOTA" variable is not set. Defaulting to a blank string.
error while interpolating services.sapa.environment.PEMILIK: required variable PEMILIK is missing a value: isi PEMILIK di latihan.env
```

Baris `error` selalu ada: `${PEMILIK:?…}` menghentikan Compose dengan pesanmu. Baris `WARN` hanya kadang muncul (lab penulis: 10 dari 30 kali). **Nanti di [Konsep 5](#5-satu-berkas-untuk-satu-rumah-docker-compose):** rahasia wajib proyek memakai `:?`, jadi `.env` yang belum lengkap ketahuan sebelum apa pun menyala.

**Jebakan Tab.** Tab di depan `image:` (biasanya terbawa dari teks salinan) → `yaml: line 18: found character that cannot start any token`. Coba geser `ports:` satu spasi ke kanan, simpan, jalankan `config` lagi → `yaml: line 17: did not find expected key`. Nomor baris bisa mendahului baris yang salah (`ports:` di baris 37): periksa dari situ ke bawah. Kembalikan.

### Langkah 4 — Variabel lingkungan dari `latihan.env`: nilai bawaan, isian kosong, dan angka tanpa kutip

Buat **`latihan.env`** di folder yang sama; bentuknya sama dengan `.env` proyek:

```text
# latihan.env - contoh variabel untuk latihan.yaml (Pemanasan Modul 26, langkah 4). Bentuknya sama dengan .env proyek:
# satu NAMA=nilai per baris, tanpa spasi di sekitar tanda =, tanpa tanda kutip. Tidak ada rahasia di sini.
PEMILIK=Budi
SAPAAN=selamat pagi
# KOTA sengaja tidak ditulis: config lalu menulis peringatan bahwa variabel KOTA tidak ada (dan mengisinya teks kosong)
```

`--env-file` mengambil nilai dari berkas itu (seperti `node --env-file=.env` di backend):

```text
docker compose -f latihan.yaml --env-file latihan.env config
```

**Hasilnya** (dipotong; *exit code* 0):

```text
WARN[0000] The "KOTA" variable is not set. Defaulting to a blank string.
…
      - echo $$SAPAAN, $$PEMILIK
    environment:
      KODE: "007"
      KODE_TANPA_KUTIP: "7"
      KOTA: ""
      PEMILIK: Budi
      SAPAAN: selamat pagi
      TELEMETRI: "off"
      VERSI: "1.10"
      VERSI_TANPA_KUTIP: "1.1"
```

Kunci diurutkan abjad, komentar dibuang, `${SAPAAN:-halo}` menjadi `selamat pagi`, `KOTA` kosong. **Jebakan YAML sesungguhnya adalah angka:** tanpa kutip, `007` menjadi `"7"` dan `1.10` menjadi `"1.1"`. `off` tanpa kutip tetap teks bagi Compose 2.40.3, tetapi pembaca YAML lain bisa membacanya `false`; karena itu dikutip.

Ubah baris `SAPAAN` di `latihan.env` menjadi `SAPAAN=`, jalankan lagi: `SAPAAN: halo`. Kembalikan. **Nanti di [5.1](#51-broker-pusat-edgepusatconf-blok-acl-jembatan-pi-serta-layanan-akun-broker-dan-mosquitto-12-menit):** `$$` = satu tanda `$` untuk `sh` di dalam kontainer, dipakai `akun-broker`.

### Langkah 5 — Membaca setelan kontainer lama dengan `docker inspect`, tanpa membocorkan sandi

Setelan `docker run` Modul 17 kini hanya tersimpan di kontainer `rumahpintar-db` ([1.2 Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#12-periksa-kontainernya-docker-ps-docker-inspect-dan-docker-network-inspect-7-menit) memeriksa Grafana begini). Jalankan lima perintah bagian 3 lembar inventaris satu per satu. **Hasilnya** (contoh; aturan bangkit, lemari, lalu nama variabel):

```text
{"Name":"unless-stopped","MaximumRetryCount":0}
volume rumahpintar-data -> /var/lib/postgresql/data
POSTGRES_PASSWORD
POSTGRES_DB
TIMESCALEDB_TELEMETRY
…
```

Perintah variabel sengaja hanya mencetak **nama**: `docker inspect rumahpintar-db` tanpa `--format` mencetak isi `POSTGRES_PASSWORD`, jadi jangan tempel ke forum atau AI. Kutip `'{{…}}'` (juga Langkah 2) tidak diuji penulis di PowerShell/CMD; bila galat, pakai Git Bash.

Pastikan sandi postgres dan admin Grafana lama ada di pengelola sandimu. **Nanti di [4.1](#41-composecloudyml-tahap-pertama-db-dan-grafana-di-atas-dua-lemari-external-10-menit):** setelan ini menjadi layanan `db` (sandi postgres lama ke `.env` di 4.2).

<details>
<summary>Kunci uji dirimu</summary>

1. **Langkah 1: kenapa kontainer yang berhenti tidak tampil di `docker ps`?** Tanpa `-a`, hanya yang berjalan. Layanan sekali jalan yang selesai (`Exited (0)`) nanti juga hanya tampak di `docker compose ps -a`.
2. **Langkah 4: ganti `007` dan `1.10` tanpa kutip dengan `0x1F` dan `1e3`.** `"31"` dan `"1000"`, tanpa galat: dibaca sebagai angka.
3. **Langkah 4: hapus tanda kutip di `TELEMETRI: "off"`.** Tetap `"off"` di Compose 2.40.3, tanpa galat.

Kembalikan setiap baris yang kamu ubah.

</details>

## 🏆 Kemenangan Cepat: dua layanan, satu perintah (25 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** di repositori `belajar-iot` dengan terminalnya, **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux), dan **MQTTX**.

Dalam 25 menit ini, satu berkas menyalakan dua kontainer sekaligus: broker MQTT latihan dan pengirim yang menerbitkan pesan ke broker itu setiap 2 detik. Pengirim menemukan broker hanya dari **nama layanannya**. Proyek "Rumah Pintar Mini" belum disentuh, dan image kedua kontainer itu sudah kamu unduh di [🧰](#-yang-perlu-disiapkan).

> [!NOTE]
> **Latihan saja.** Broker ini **tanpa akun**, berlawanan dengan aturan [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#6-penjaga-pintu-broker-berkas-sandi-dan-satu-akun-untuk-setiap-program): broker selalu berkunci. Di sini aman karena loketnya hanya `127.0.0.1:1884` (laptop ini saja, bukan WiFi rumah) dan dibongkar di Langkah 6. Broker pusat proyekmu tetap berkunci ([5.1](#51-broker-pusat-edgepusatconf-blok-acl-jembatan-pi-serta-layanan-akun-broker-dan-mosquitto-12-menit)).

### Langkah 1 — Baca `compose.yaml`, lalu nyalakan dengan `docker compose up -d` (8 menit)

1. Di repositori **`belajar-iot`**, buat folder **`modul-26/kemenangan-cepat`**.
2. Di folder itu, buat berkas **`compose.yaml`**, isi dengan berkas berikut (**Copy raw file** dari [`kode/kemenangan-cepat/compose.yaml`](kode/kemenangan-cepat/compose.yaml)), lalu simpan (**Ctrl + S**):

```yaml
# compose.yaml - Kemenangan Cepat Modul 26: dua layanan, satu perintah.
# Nama berkas ini adalah nama BAWAAN Docker Compose, jadi di folder ini cukup: docker compose up -d   (tanpa -f)
# LATIHAN SAJA: broker di bawah TANPA akun (allow_anonymous), hanya bisa dihubungi dari laptop ini (127.0.0.1), dan
# dibongkar di langkah terakhir dengan: docker compose down
# Proyek Compose-nya bernama sama dengan folder ini (kemenangan-cepat).
services:
  # Layanan 1: broker MQTT latihan. Image resmi, tag persis (sama dengan broker pusat proyek), tanpa "latest".
  broker:
    image: eclipse-mosquitto:2.1.2-alpine
    # berkas setelan bawaan di dalam image ini: listener 1883 tanpa akun (allow_anonymous true)
    command: ["mosquitto", "-c", "/mosquitto-no-auth.conf"]
    ports:
      # kiri = loket di laptopmu (1884, supaya tidak bentrok dengan broker 1883 yang mungkin sudah ada),
      # kanan = port di dalam kontainer. 127.0.0.1 = hanya laptop ini, bukan seluruh WiFi.
      - "127.0.0.1:1884:1883"
    # Image Mosquitto menyiapkan folder data dan log sebagai lemari. Di latihan ini keduanya cukup di memori (tmpfs):
    # hilang saat kontainer dihapus, dan tidak meninggalkan lemari tanpa nama sesudah "docker compose down".
    tmpfs:
      - /mosquitto/data
      - /mosquitto/log

  # Layanan 2: pengirim. Image yang sama (sudah ada di laptop, tanpa unduhan lagi), tetapi yang dijalankan mosquitto_pub.
  pengirim:
    image: eclipse-mosquitto:2.1.2-alpine
    # Alamat broker = NAMA LAYANAN "broker": di lorong (network) Compose, setiap layanan dikenal dengan namanya.
    # Port 1883 = port di DALAM kontainer broker, bukan loket 1884 di laptop. $$ = tanda $ untuk sh, bukan untuk Compose.
    command:
      - sh
      - -c
      - |
        n=0
        while true; do
          n=$$((n + 1))
          mosquitto_pub -h broker -p 1883 -t latihan/sapa -m "halo dari kontainer pengirim, pesan ke-$$n"
          echo "terkirim pesan ke-$$n"
          sleep 2
        done
    # nyalakan broker lebih dulu (urutan menyala saja: belum menunggu broker "siap", itu dibahas di Konsep 8)
    depends_on:
      - broker
    # sh sebagai proses pertama mengabaikan sinyal berhenti; init kecil ini meneruskannya, jadi "down" tidak menunggu 10 detik
    init: true
    tmpfs:
      - /mosquitto/data
      - /mosquitto/log
```

Yang perlu kamu tangkap:

- **Satu cetakan, dua kontainer.** `broker` dan `pengirim` memakai cetakan yang sama. `command` broker menunjuk `/mosquitto-no-auth.conf`, setelan tanpa akun yang sudah ada di dalam cetakan itu.
- **Loket** `"127.0.0.1:1884:1883"`: kiri = loket 1884 di laptop (bukan 1883, supaya tidak bentrok dengan broker lamamu), kanan = port di dalam kontainer.
- **Nama layanan adalah alamat.** Pengirim memanggil broker dengan `-h broker -p 1883` di lorong buatan Compose ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)). `$$` = tanda `$` untuk `sh`, bukan untuk Compose ([🔁 Langkah 4](#langkah-4--variabel-lingkungan-dari-latihanenv-nilai-bawaan-isian-kosong-dan-angka-tanpa-kutip)). `depends_on` hanya mengatur urutan menyala.
- **Dua setelan yang terbukti perlu.** Tanpa `tmpfs` (folder sementara di memori), setiap `up` meninggalkan lemari tanpa nama ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)). Tanpa `init: true`, `sh` sebagai proses pertama mengabaikan sinyal berhenti, sehingga `down` menunggu batas 10 detik lalu mematikannya paksa (±12 detik di lab penulis; [Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log)).

3. Di panel Explorer, klik kanan folder `kemenangan-cepat` → **Open in Integrated Terminal**. Semua perintah Kemenangan Cepat dijalankan di terminal ini:

```text
docker compose up -d
```

Tanpa `-f`, karena `compose.yaml` adalah nama berkas bawaan Compose. Nama proyeknya = nama folder, jadi lorongnya `kemenangan-cepat_default`. Broker menyala lebih dulu karena `depends_on`.

**Hasilnya** (contoh; ±2,4 detik di lab penulis karena image sudah ada):

```text
[+] Running 3/3
 ✔ Network kemenangan-cepat_default       Created      0.2s
 ✔ Container kemenangan-cepat-broker-1    Started      1.1s
 ✔ Container kemenangan-cepat-pengirim-1  Started      1.3s
```

### Langkah 2 — `docker compose ps`: broker punya loket, pengirim tidak (2 menit)

```text
docker compose ps
```

**Hasilnya** (contoh):

```text
NAME                          IMAGE                            COMMAND                  SERVICE    CREATED          STATUS          PORTS
kemenangan-cepat-broker-1     eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   broker     23 seconds ago   Up 23 seconds   127.0.0.1:1884->1883/tcp
kemenangan-cepat-pengirim-1   eclipse-mosquitto:2.1.2-alpine   "/docker-entrypoint.…"   pengirim   23 seconds ago   Up 22 seconds   1883/tcp
```

Dua baris `Up`. Hanya broker yang punya loket di laptop (`127.0.0.1:1884->1883/tcp`). `1883/tcp` pada pengirim hanya catatan bawaan image: pengirim bicara di dalam lorong saja.

### Langkah 3 — Baca log pengirim dengan `docker compose logs -f` (3 menit)

```text
docker compose logs -f pengirim
```

**Hasilnya** (contoh; baris lama tampil sekaligus, lalu satu baris baru setiap 2 detik):

```text
pengirim-1  | terkirim pesan ke-1
pengirim-1  | terkirim pesan ke-2
…
pengirim-1  | terkirim pesan ke-18
^C
```

`-f` = terus mengikuti. **Ctrl + C** hanya berhenti membaca; kontainernya tetap jalan.

### Langkah 4 — MQTTX lewat loket 1884: pesan dari kontainer pengirim (6 menit)

1. Di MQTTX, buat sambungan baru (ikon **+**, seperti [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#23-sambungkan-mqttx-ke-broker-laptop)): **Name** `Latihan KC`, **Host** `127.0.0.1`, **Port** `1884`, **Username** dan **Password** kosong. Klik **Connect**.
2. Klik **New Subscription**, isi **Topic** `latihan/#`, lalu **Confirm**.

**Hasilnya** (lab penulis, tanpa aplikasi MQTTX: perannya dimainkan klien MQTT baris perintah di mesin yang sama):

```text
latihan/sapa halo dari kontainer pengirim, pesan ke-26
latihan/sapa halo dari kontainer pengirim, pesan ke-27
latihan/sapa halo dari kontainer pengirim, pesan ke-28
```

Pesan tiba setiap 2 detik. MQTTX masuk lewat **loket 1884 di laptop**, sedangkan pengirim memanggil **`broker:1883` di dalam lorong**: tempatnya berbeda, alamatnya pun berbeda.

### Langkah 5 — Masuk ke kontainer broker: nama layanan adalah alamat (4 menit)

```text
docker compose exec broker sh
```

*Prompt* berubah menjadi `/ #`: kamu di dalam Linux kecil milik broker. Ketik `ls /`, lalu `getent hosts pengirim`, lalu `exit`.

**Hasilnya** (contoh, dipotong; IP lorongmu berbeda):

```text
/ # ls /
…
dev                     lib                     mosquitto-no-auth.conf  run                     tmp
…
/ # getent hosts pengirim
172.20.0.3        pengirim  pengirim
/ # exit
```

Ada `mosquitto-no-auth.conf`, setelan yang dipakai broker. `getent` menjawab IP untuk nama `pengirim`: di lorong, layanan lain dikenal dari namanya. `exit` kembali ke terminal laptop.

### Langkah 6 — Bongkar dengan `docker compose down`, tanpa sisa (2 menit)

```text
docker compose down
```

**Hasilnya** (contoh; ±1,7 detik di lab penulis):

```text
[+] Running 3/3
 ✔ Container kemenangan-cepat-pengirim-1  Removed      0.4s
 ✔ Container kemenangan-cepat-broker-1    Removed      0.4s
 ✔ Network kemenangan-cepat_default       Removed      0.2s
```

Dua kontainer dan lorongnya hilang, loket 1884 bebas lagi, dan tidak ada lemari tertinggal karena folder data broker hanya di memori (`tmpfs`; di lab penulis, `docker volume ls` sesudahnya sama dengan sebelumnya). Satu cetakan, dua kontainer, satu lorong, satu perintah: `compose.cloud.yml` nanti melakukan hal yang sama untuk seluruh rumahmu.

> ➡️ **Berikutnya:** baca [Konsep 1](#1-di-laptop-saya-jalan-peti-kemas-untuk-program), lalu buat cabang baru di [1.1](#11-cabang-fiturdocker-compose-dan-rencana-pindahan-3-menit). Rumah lamamu tetap menyala sampai [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit): dua cetakan di [Praktik 2](#praktik-2--cetakan-backend-130-45-menit) dan [Praktik 3](#praktik-3--cetakan-web-120-vite--caddy-45-menit) dikerjakan lebih dulu.

## 🧠 Konsep "Mengapa"

Sebelas konsep ini tidak perlu dibaca sekaligus. Bacalah berselang-seling dengan praktiknya:

1. Kemenangan Cepat (sudah kamu kerjakan) → Konsep 1 → 1.1 (cabang baru; rumah lamamu tetap menyala)
2. Konsep 2–4 (boleh sambil menunggu *build*) → Praktik 2 (cetakan backend) dan Praktik 3 (cetakan web)
3. Konsep 5–8, lalu Konsep 10 → 1.2–1.4, Praktik 4 (lemari pindah), dan Praktik 5 (seluruh rumah) dalam satu duduk, ±2,5 jam
4. Praktik 6 (gerbang Pi untuk Kit B; jalur laptop cukup 6.7), memakai Konsep 10
5. Konsep 9 → Praktik 7 (Grafana sebagai berkas)
6. Praktik 8 (bangkit sendiri) memakai Konsep 8; Praktik 9 (cadangan, opsional) memakai bagian cadangan Konsep 6
7. Konsep 11 → Praktik 10 (toko image, opsional) dan Praktik 11 (uji laptop bersih)

Rumah lamamu berhenti di 1.2 dan baru menyala lagi di 5.3, jadi Konsep 5–8 dan 10 dibaca sebelum 1.2, bukan di tengah pindahan. Potongan YAML, `Dockerfile`, dan perintah di bagian konsep cukup dibaca; semuanya diketik dan dijalankan di praktik.

Modul 17 berjanji bahwa isi kontainer, membuat image sendiri, dan Docker Compose "dibedah di Modul 26" ([Docker secukupnya](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari)). Konsep 1–4 membedah peti kemasnya; Konsep 5–11 menyusun rumahnya.

### 1. "Di laptop saya jalan": peti kemas untuk program

Bayangkan temanmu ingin menjalankan Rumah Pintar Mini di laptopnya. Sampai Modul 25, ia harus mengulang semua yang kamu kumpulkan selama 25 modul: Node.js 24 dan `npm install` di `backend` dan `frontend`; database TimescaleDB 2.30.2 lewat `docker run` (Modul 17); Grafana 13.2.4 dengan lorong `rumahpintar` (Modul 25); broker Mosquitto berkunci (di Pi lewat paket apt, atau di laptop sebagai layanan); berkas `.env` berisi sandi yang memang tidak ada di Git; lalu dua atau tiga terminal `npm run dev`. Satu saja yang meleset, dan ia akan mengucapkan kalimat yang sangat dikenal para pemrogram: **"Di laptop saya jalan, kok di laptopmu tidak?"**

Beda kecil pun cukup: broker Mosquitto 2.0 menolak berkas sandi buatan Mosquitto 2.1 dengan `not authorised` (Konsep 10). Masalahnya bukan kodemu, melainkan **lingkungannya**: versi program, sistem operasi, setelan, dan langkah menyalakan yang tersebar di 25 modul dan di kepalamu.

**Peti kemas.** Dulu barang di kapal dikemas dengan caranya sendiri-sendiri: karung, peti kayu, drum. Setiap pelabuhan harus tahu cara mengangkat semuanya. Peti kemas berukuran standar mengakhiri kerepotan itu: apa pun isinya, kapal dan derek cukup mengenal satu bentuk. Silabus menyebut kontainer Docker "kontainer kapal" karena alasan yang sama. Program dikemas **bersama semua yang dibutuhkannya** (Linux kecil, Node.js versi persis, library, kode, dan cara menyalakannya) dalam bentuk standar, sehingga "kapal" mana pun bisa membawanya tanpa peduli isinya: Docker di laptopmu, di laptop teman, di Pi, dan kelak di VPS (Modul 27).

Di Modul 17 kamu mengenal kontainer sebagai kue yang dicetak dari cetakan. Peti kemas adalah kue yang sama, dilihat dari sisi lain: bukan "dicetak dari mana", melainkan "bisa dibawa ke mana saja". Istilah kerja kita tetap **kontainer**.

**Kontainer bukan mesin virtual.** Mesin virtual (misalnya VirtualBox) menjalankan sistem operasi tamu yang lengkap, dengan kernelnya sendiri. Kernel adalah inti sistem operasi yang mengatur prosesor, memori, dan disk. Kontainer jauh lebih ringan: isinya hanya program dan library-nya, sedangkan kernelnya dipakai bersama dengan mesin yang menjalankannya. Karena tidak ada sistem operasi yang perlu dinyalakan, kontainer siap dalam hitungan detik. Kernel itu harus Linux. Di Linux dan Pi, kontainer langsung memakai kernel mesinnya. Di Windows dan macOS, seperti kata [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari), Docker Desktop diam-diam menjalankan satu Linux kecil (di Windows lewat WSL 2), dan semua kontainer tinggal di dalamnya.

**Yang sengaja TIDAK ikut peti.** Tiga hal ini tinggal di luar, dan itulah yang membuat peti boleh dibuang lalu dibuat ulang kapan saja:

- **Data** tinggal di lemari. Riwayat bacaanmu tetap di `rumahpintar-data`, dan isi Grafana di `rumahpintar-grafana-data`, lemari lama yang sama ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)).
- **Rahasia** tinggal di `.env`. Cetakan bisa dibagikan ke siapa saja, bahkan dipajang publik di internet, jadi sandi dan token tidak boleh ada di dalamnya. Docker Compose memberikannya saat kontainer dinyalakan ([Konsep 9](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana)), dan `.dockerignore` menjaga supaya tidak terselip ([Konsep 3](#3-resep-cetakan-dockerfile-dan-dockerignore)).
- **Setelan rumahmu** tinggal di berkas repo (`edge/pusat.conf`, `frontend/caddy/`, `grafana/provisioning/`) yang dipasang hanya-baca ke kontainer. Mengubah setelan tidak perlu membuat cetakan baru.

Satu catatan jujur: "sama di mana saja" berlaku untuk **jenis prosesor yang sama**. Cetakan yang kamu buat di Pi atau di Mac Apple silicon ditolak laptop Intel atau AMD. Sebabnya ada di Konsep 2, jalan keluarnya di [Konsep 11](#11-toko-image-ghcr-dan-arsitektur).

Kamus Docker Modul 17 dan 25 tetap berlaku. Minggu ini ditambah satu kata, **toko**:

| Istilah | Bayangkan | Di Modul 26 |
| :--- | :--- | :--- |
| **Cetakan** (*image*) | cetakan kue: berisi semua yang dibutuhkan, tidak pernah berubah | buatanmu sendiri: `rumah-pintar-mini-backend:1.3.0` ([Praktik 2](#praktik-2--cetakan-backend-130-45-menit)) dan `rumah-pintar-mini-web:1.2.0` ([Praktik 3](#praktik-3--cetakan-web-120-vite--caddy-45-menit)); siap pakai: `timescale/timescaledb:2.30.2-pg17`, `grafana/grafana:13.2.4`, `eclipse-mosquitto:2.1.2-alpine` |
| **Kontainer** (*container*) | kue yang dicetak; dilihat dari sisi "dibawa ke mana saja", peti kemas | `rumahpintar-db-1`, `rumahpintar-backend-1`, dan teman-temannya |
| **Loket** (*port*) | loket dari luar ke dalam kontainer | `127.0.0.1:5432`, `127.0.0.1:8080`, dan `http://localhost` (loket 80) |
| **Lemari** (*volume*) | lemari di luar kue: isinya tetap walau kuenya dibuang | `rumahpintar-data` dan `rumahpintar-grafana-data`, lemari lamamu |
| **Lorong** (*network*) | lorong antarkontainer; di dalamnya mereka saling memanggil dengan NAMA | `rumahpintar_default`, dibuat Compose ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)) |
| **Toko image** (*registry*), **baru** | toko tempat cetakan dititipkan (*push*) dan diambil (*pull*) | Docker Hub, asal semua cetakan siap pakai sejak Modul 17; GHCR, toko milik GitHub untuk cetakanmu sendiri ([Konsep 11](#11-toko-image-ghcr-dan-arsitektur)) |

![Diagram peti kemas untuk program (Konsep 1). Kiri, tanpa peti kemas: laptopmu jalan (Node.js 24 terpasang, npm install di laptop ini, database, broker, Grafana kamu rakit di Modul 12–25, .env berisi sandimu); laptop teman tidak jalan, karena Node.js versi lain atau belum terpasang, database, broker, Grafana belum ada, dan tidak ada .env (sandi memang tidak di Git). Di laptop saya jalan, kok di laptopmu tidak? Langkah menyalakan rumahmu tersebar di 25 modul dan di kepalamu. Kanan, dengan peti kemas (merah-ungu): cetakan (image) rumah-pintar-mini-backend:1.3.0 berlapis, dari bawah: Linux Alpine kecil (dasar cetakan), Node.js 24.22.1 (versi persis), node_modules (186 paket, untuk Linux), src/ + migrasi/ (kode backend), cara menyala node src/server.ts. Panah docker run ke kontainer, peti yang sedang jalan, bercentang di Windows, macOS, Linux, dan Raspberry Pi: isi peti sama persis di mana pun ada Docker, untuk jenis prosesor yang sama (Konsep 11); kapal tidak peduli isi peti, ukurannya standar. Tengah, kontainer bukan mesin virtual: dua mesin virtual masing-masing membawa sistem operasi tamu lengkap di atas pengatur mesin virtual (hypervisor); lima kontainer db, mosquitto, backend, web, grafana hanya program + library-nya di atas Docker Engine dan kernel Linux yang SAMA. Docker Desktop (Windows, macOS): kontainer berjalan di dalam satu Linux kecil yang disiapkan Docker Desktop, Windows lewat WSL 2; Linux dan Pi: langsung. Bawah, yang sengaja TIDAK ikut peti: data ke lemari (volume) rumahpintar-data dan rumahpintar-grafana-data, riwayat tetap ada walau peti dibuang; rahasia ke .env, tidak di Git dan tidak di cetakan (.dockerignore), Compose memberikannya; setelan rumah ke berkas repo edge/pusat.conf, frontend/caddy/, grafana/provisioning/ yang dipasang hanya-baca.](aset/peti-kemas-program.png)

> ⬆️ **Sudah membaca Konsep 1?** Kerjakan [1.1](#11-cabang-fiturdocker-compose-dan-rencana-pindahan-3-menit) saja dulu (cabang baru; rumah lama tetap menyala), lalu baca Konsep 2–4 sebelum [Praktik 2](#praktik-2--cetakan-backend-130-45-menit).

### 2. Cetakan berlapis: *image*, *tag*, *digest*, dan arsitektur

Cetakan bukan satu gumpalan besar. Ia tersusun dari **lapisan** (*layer*): setiap langkah resep pembuatnya (Konsep 3) menyimpan berkas yang ditambahkan langkah itu sebagai satu lapisan, ditumpuk di atas lapisan sebelumnya. Cetakan backend 1.3.0-mu, dari bawah: lapisan-lapisan cetakan dasar `node:24.22.1-alpine3.24` (Linux Alpine kecil dan Node.js 24.22.1), lalu `node_modules`, `package.json`, `migrasi/`, `src/`, dan catatan cara menyalakannya. Perintah `docker history` memperlihatkan tumpukannya, langkah terakhir paling atas.

**Hasilnya (contoh, dipotong):**

```text
$ docker history rumah-pintar-mini-backend:1.3.0
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
13aa9992d8ac   42 seconds ago   CMD ["node" "src/server.ts"]                    0B        buildkit.dockerfile.v0
<missing>      42 seconds ago   EXPOSE [8080/tcp]                               0B        buildkit.dockerfile.v0
<missing>      42 seconds ago   USER node                                       0B        buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY src ./src # buildkit                       315kB     buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY migrasi ./migrasi # buildkit               45.1kB    buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY package.json ./ # buildkit                 12.3kB    buildkit.dockerfile.v0
<missing>      42 seconds ago   COPY /app/node_modules ./node_modules # buil…   64.6MB    buildkit.dockerfile.v0
…
```

`<missing>` di kolom `IMAGE` bukan galat; lapisannya tetap ada di dalam cetakan. Lihat kolom `SIZE`: `node_modules` 64,6 MB, sedangkan kode `src` hanya 315 kB. Angka ini menjelaskan kenapa urutan langkah resep penting.

**Lapisan disimpan sebagai *cache*.** Saat membangun ulang, Docker memeriksa resep langkah demi langkah. Kalau sebuah langkah dan semua langkah sebelumnya tidak berubah, lapisannya diambil dari simpanan (di layar *build* tertulis `CACHED`). Begitu satu langkah berubah, langkah itu dan semua langkah sesudahnya dikerjakan ulang. Karena itu resep kita menyalin `package.json` dan `package-lock.json` lebih dulu, memasang library dengan `npm ci`, baru menyalin kode. Mengubah satu berkas di `src/` hanya membuat ulang lapisan `COPY src`; lapisan `npm ci` tetap `CACHED`. Di Pi 5 penulis, *build* tanpa *cache* lapisan makan 45,8 detik, lebih dari separuhnya untuk `npm ci`. Kalau tidak ada yang berubah sama sekali, semua langkah `CACHED` dan *build* selesai dalam 1,9 detik. Angka di laptopmu pasti berbeda; polanya sama.

**Nama, *tag*, dan *digest*.** Nama cetakan punya dua bagian, dipisah titik dua: nama dan ***tag***, misalnya `node:24.22.1-alpine3.24` atau `eclipse-mosquitto:2.1.2-alpine`. *Tag* adalah label yang ditempel pemilik cetakan, dan label **bisa dipindah** ke isi yang lain. Contoh nyata saat modul ini ditulis: cetakan `postgres:17.11-trixie` dibangun ulang pemiliknya pada 28 Oktober 2026, jadi *tag* yang sama sejak hari itu menunjuk isi yang berbeda. Yang tidak pernah berpindah adalah ***digest***, sidik jari isi cetakan (`sha256:…`): isinya berubah sedikit saja, *digest*-nya lain. Log *build* backend mencatat *digest* cetakan dasar yang benar-benar dipakai, `node:24.22.1-alpine3.24@sha256:06d7adf3…8b53`. Cara mengunci cetakan dengan *digest* ada di [🔬](#-bedah-teknis-opsional).

**Jebakan `latest`.** Tanpa *tag*, Docker memakai *tag* `latest`. Artinya "apa pun yang ditempeli label itu hari ini", bukan "versi terbaru yang stabil", dan isinya bisa berganti tanpa kamu sadari. Saat modul ini ditulis, `eclipse-mosquitto:latest` menunjuk 2.1.2. Lebih menjebak lagi, `louislam/uptime-kuma:latest` justru menunjuk seri 1 yang lama, padahal Uptime Kuma kita seri 2 (`2.5.8-slim`). Karena itu kurikulum ini **selalu menulis *tag* persis**, dan kamu juga.

**Arsitektur.** Program di dalam cetakan sudah diterjemahkan ke bahasa mesin untuk satu jenis prosesor. Dua jenis yang kita temui: **amd64** (laptop dan PC Intel atau AMD) dan **arm64** (Raspberry Pi 64-bit, Mac Apple silicon, laptop Snapdragon). Cetakan resmi seperti `node`, `caddy`, `timescale/timescaledb`, `grafana/grafana`, dan `eclipse-mosquitto` diterbitkan sebagai **indeks multi-arsitektur**: satu *tag* berisi beberapa versi, dan Docker otomatis mengambil yang cocok dengan mesinmu. Itulah sebabnya perintah yang sama jalan di laptop dan di Pi. Cetakan buatanmu sendiri lain cerita: `docker build` di Pi menghasilkan cetakan arm64 saja. Akibatnya bagi laptop teman, dan jalan keluarnya, ada di [Konsep 11](#11-toko-image-ghcr-dan-arsitektur).

![Diagram cetakan berlapis, dapur dan meja saji (Konsep 2–4), angka build penulis di Raspberry Pi 5 (arm64); baris Dockerfile dipersingkat, salin dari berkasnya. Kiri, backend 1.3.0, backend/Dockerfile: tahap paket (dapur, dibuang sesudah build) FROM node:24.22.1-alpine3.24 AS paket, COPY package.json package-lock.json, RUN npm ci --omit=dev (186 paket, tanpa alat pengembang); hanya node_modules yang dibawa ke tahap akhir (meja saji = isi image): FROM node:24.22.1-alpine3.24, ENV NODE_ENV=production, COPY --from=paket /app/node_modules ./node_modules, COPY src ./src (juga package.json, migrasi), USER node (bukan root, uid 1000), CMD node src/server.ts tanpa npm start. Hasil 313 MB di disk, 71,9 MB unduhan terkompres. Kanan, web 1.2.0, frontend/Dockerfile: tahap bangun (dapur Node.js) COPY package.json package-lock.json, RUN npm ci (110 paket, + TypeScript, Vite), COPY . ., ARG VITE_API_BASE=/api (dibakar ke JavaScript), RUN npm run build ke dist/ ±1,1 MB; hanya dist/ yang dibawa ke tahap akhir FROM caddy:2.11.7-alpine, COPY caddy/Caddyfile, COPY --from=bangun /app/dist /srv; tanpa CMD (image Caddy sudah membawanya), Compose memasang folder frontend/caddy/ di atasnya. Hasil 90,4 MB di disk, 24 MB unduhan, tanpa Node.js. Tengah kiri, lapisan dan cache (disederhanakan): basis, COPY package.json package-lock.json, RUN npm ci --omit=dev (lama, 24,6 s) tetap CACHED, COPY src dibangun ulang: ubah satu berkas src/ hanya mengulang lapisan itu; build kedua tanpa perubahan 1,9 s, tanpa cache lapisan (basis sudah ada) 45,8 s; web pertama 103 s (npm ci 49,5 s + npm run build 49,3 s), ubah kode ±50 s. Tengah kanan, batang ukuran: backend dua tahap 313 MB / 71,9 MB; backend npm ci penuh, alat pengembang ikut (uji riset, basis 24.21.0) 404 MB / 94,8 MB; web Caddy + dist/ 90,4 MB / 24 MB. Bawah: jebakan --omit=dev, library yang dipakai saat server jalan harus di dependencies, cetakan 1.2 mogok dengan unable to determine transport target for pino-pretty, backend 1.3.0 memindahkannya; tag dan digest, tag node:24.22.1-alpine3.24 bisa dipindah, digest sha256:06d7adf3…8b53 tidak; .dockerignore menahan .env, node_modules, backup, bruno, uji; latest bisa berganti diam-diam (Mosquitto latest = 2.1, Uptime Kuma latest = seri 1), tulis tag persis.](aset/lapisan-dan-multistage.png)

### 3. Resep cetakan: `Dockerfile` dan `.dockerignore`

Sampai Modul 25 kamu hanya memakai cetakan buatan orang lain. Minggu ini kamu membuat dua cetakan sendiri. Resepnya ditulis di berkas bernama **`Dockerfile`** (tanpa ekstensi) di folder programnya, `backend/Dockerfile` dan `frontend/Dockerfile`, dan dikerjakan berurutan dari atas ke bawah, satu lapisan per langkah (lihat gambar di Konsep 2). Kata-kata yang akan kamu temui:

| Perintah | Artinya | Contoh dari `backend/Dockerfile` |
| :--- | :--- | :--- |
| `FROM` | mulai dari cetakan dasar ini | `FROM node:24.22.1-alpine3.24` |
| `WORKDIR` | folder kerja di dalam cetakan (dibuat bila belum ada) | `WORKDIR /app` |
| `COPY` | salin berkas dari folder proyekmu ke dalam cetakan | `COPY package.json package-lock.json ./` |
| `RUN` | jalankan perintah saat *build*; hasilnya disimpan sebagai lapisan | `RUN npm ci --omit=dev` |
| `ENV` | variabel lingkungan yang tertanam di cetakan | `ENV NODE_ENV=production` |
| `LABEL` | keterangan yang ditempel di cetakan (dipakai GHCR, Konsep 11) | `LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini"` |
| `USER` | jalankan program sebagai pengguna ini, bukan root | `USER node` |
| `EXPOSE` | catatan "program ini mendengar di port ini di dalam kontainer"; tidak membuka loket | `EXPOSE 8080` |
| `CMD` | perintah yang dijalankan saat kontainer menyala | `CMD ["node", "src/server.ts"]` |

Tidak ada langkah kompilasi TypeScript: Node 24 menjalankan berkas `.ts` langsung (Modul 16), jadi cetakan cukup membawa `src/` apa adanya. Urutan baris adalah urutan lapisan: yang jarang berubah ditulis lebih dulu, kode belakangan (Konsep 2). Setiap blok di kedua `Dockerfile` berkomentar "mengapa" dalam bahasa Indonesia; kamu membacanya blok demi blok di [2.3](#23-dockerfile-dua-tahap-blok-demi-blok-10-menit) dan [3.3](#33-dockerfile-web-dan-dockerignore-lalu-docker-build-dari-folder-frontend-12-menit).

**Kenapa `CMD ["node", "src/server.ts"]`, bukan `npm start`?** Ada dua alasan.

1. **Sinyal berhenti.** Saat kontainer dihentikan, Docker mengirim sinyal `SIGTERM` ke program utamanya, lalu menunggu ia berhenti sendiri. Backend-mu sudah menanggapinya sejak [Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#610-berhenti-dengan-rapi): `SIGTERM diterima: backend berhenti dengan rapi`. Kalau yang dijalankan `npm start`, program utamanya npm, jadi sinyal itu sampai ke npm, bukan ke Node; panduan resmi Node.js untuk Docker menyarankan menjalankan `node` langsung supaya sinyal tidak ditelan npm. Bentuk daftar `["node", "src/server.ts"]` (bentuk *exec*) membuat `node` sendiri menjadi program utama, tanpa perantara shell. Panduan yang sama mengingatkan bahwa Node tidak dirancang menjadi program pertama (PID 1) di kontainer: program pertama yang tidak memasang penangan sinyal sendiri mengabaikan `SIGTERM`. Backend kita aman karena memasang penangannya, sedangkan `sh` di layanan `pengirim` Kemenangan Cepat diberi `init: true` ([Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log)).
2. **Skrip npm lama mewajibkan `.env`.** Skrip `start` backend 1.2 berbunyi `node --env-file=.env src/server.ts`. Di dalam kontainer tidak ada `.env` (rahasia tidak ikut peti), jadi Node langsung berhenti dengan `node: .env: not found` (kode keluar 9). Di kontainer, setelan datang dari Compose sebagai variabel lingkungan. Backend 1.3.0 mengganti empat skrip (`start`, `migrasi`, `isi-riwayat`, `pengguna`) dengan `--env-file-if-exists=.env`: kalau berkasnya tidak ada, Node cukup menulis `.env not found. Continuing without it.` lalu jalan terus. Skrip `dev` tetap `--env-file=.env` karena mode kembang memang wajib punya `.env` ([2.1](#21-backend-130-pino-pretty-pindah-skrip-npm-tanpa-env-wajib-dan-log-tanpa-health-10-menit)).

**`.dockerignore`: yang tidak boleh ikut.** Saat `docker build ./backend` berjalan, Docker lebih dulu mengirim isi folder `backend` (disebut **konteks *build***) ke mesin pembuat cetakan, dan `COPY` hanya bisa mengambil dari kiriman itu. Berkas `.dockerignore`, yang bentuknya mirip `.gitignore`, menyaring apa yang tidak boleh terkirim ([2.2](#22-dockerignore-rahasia-dan-node_modules-tidak-ikut-cetakan-5-menit)):

- `node_modules` milik laptopmu. Isinya dibuat ulang di dalam cetakan oleh `npm ci` karena sebagian library membawa kode mesin khusus untuk sistem operasi laptopmu. Di lab penulis, `node_modules` laptop saja ±127 MB, sedangkan konteks yang terkirim dengan saringan hanya 336,77 kB.
- `.env` dan `.env.*` (kecuali `.env.example`), `backup`, `bruno`, `uji`, `login*.json`, dan `kue*.txt`, karena berisi sandi, token, dan *cookie*.
- `src/**/*.test.ts`, berkas uji yang tidak dipakai server.

Kenapa seketat itu? **Cetakan yang dibagikan bisa dibongkar siapa pun, lapis demi lapis.** Kalau `.env` sempat tersalin ke satu lapisan, menghapusnya di langkah berikutnya tidak menolong karena lapisan lama tetap ada di dalam cetakan. Penulis membangun cetakan dari salinan proyek yang masih berisi `backend/.env` dan `node_modules/`, lalu memeriksa isinya: folder `/app` hanya berisi `migrasi`, `node_modules`, `package.json`, dan `src`, dan pencarian berkas `.env*` di seluruh cetakan tidak menemukan apa pun. Kamu memeriksanya sendiri dengan `docker history --no-trunc` di [2.4](#24--docker-build-ukuran-image-dan-docker-history-tanpa-rahasia-10-menit), sebelum cetakan dipajang di toko ([Praktik 10](#praktik-10--toko-image-ghcr-manual-35-menit)).

**`USER node`.** Cetakan dasar `node` sudah membawa pengguna biasa bernama `node` (uid 1000; uid = nomor pengguna di Linux, Konsep 6). Backend tidak butuh hak root, jadi resep berpindah ke pengguna itu sebelum `CMD`: kalau suatu hari ada celah di program, kerusakannya lebih kecil. Buktinya di [2.5](#25-cetakan-tanpa-rahasia-docker-run-yang-menolak-menyala-lalu-pengguna-node-10-menit): `uid=1000(node) gid=1000(node) groups=1000(node),1000(node)`.

**Tanpa `HEALTHCHECK` di `Dockerfile`.** Resep boleh memuat perintah pemeriksaan kesehatan, tetapi kita sengaja menaruhnya di satu tempat saja: berkas Compose, bersama urutan menyala yang memakainya ([Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log)).

### 4. Dapur dan meja saji: *multi-stage*, image kecil, dan Caddy

Di [Modul 22](../../fase-4-frontend-dashboard/modul-22-react-dasar/README.md#82-hidangan-siap-saji-npm-run-build-lalu-cicipi-dengan-npm-run-preview-8-menit), `npm run dev` adalah dapur dan `npm run build` menghasilkan hidangan siap saji. Membuat cetakan punya masalah yang mirip: memasak butuh banyak alat (TypeScript, Vite, Vitest, puluhan library pembantu), padahal menyajikan cukup hidangannya. Kalau dapur ikut diangkut ke meja, cetakan jadi besar, lambat diunduh, dan membawa alat yang tidak perlu ada di server. Jalan keluarnya ***multi-stage*** (bertahap): satu `Dockerfile` dengan dua `FROM`. Tahap pertama adalah **dapur**: memasang alat dan memasak. Tahap kedua adalah **meja saji**: mulai lagi dari cetakan dasar yang bersih, lalu hanya menyalin hasil masakan dari dapur (`COPY --from=…`). Dapurnya dibuang dan tidak ikut ke cetakan akhir. Gambar di Konsep 2 memperlihatkan kedua resep berdampingan.

**Backend: dapur bernama `paket`.** Tahap `paket` hanya menjalankan `npm ci --omit=dev`, yaitu memasang 186 paket persis menurut `package-lock.json`, tanpa alat pengembang. Tahap akhir mengambil folder `node_modules` dari sana, lalu menyalin `package.json`, `migrasi/`, dan `src/`. Ukurannya di Pi 5 penulis (arm64; di laptopmu pasti berbeda):

| Cetakan | Di disk | Diunduh (terkompres) |
| :--- | ---: | ---: |
| `node:24.22.1-alpine3.24` (dasar) | 239 MB | 62,6 MB |
| `rumah-pintar-mini-backend:1.3.0` (dua tahap, `--omit=dev`) | 313 MB | 71,9 MB |
| backend dengan `npm ci` penuh, alat pengembang ikut (prototipe riset, dasar Node 24.21.0) | 404 MB | 94,8 MB |
| `caddy:2.11.7-alpine` (dasar) | 89,2 MB | 24 MB |
| `rumah-pintar-mini-web:1.2.0` (Caddy + `dist/`) | 90,4 MB | 24 MB |

Ukuran kedua cetakan buatanmu kamu lihat sendiri lewat `docker image ls` di [2.4](#24--docker-build-ukuran-image-dan-docker-history-tanpa-rahasia-10-menit) dan 3.3: di Docker Engine 29 penulis, kolomnya bernama `DISK USAGE` dan `CONTENT SIZE`; nama kolomnya bisa berbeda di versi Docker lain. Angka "diunduh" itulah yang menentukan berapa lama laptop teman menunggu.

**Jebakan `--omit=dev`: kisah `pino-pretty`.** Library di `devDependencies` tidak ikut ke meja saji. Backend 1.2 menaruh `pino-pretty` (perapi tampilan log) di sana, padahal ia dipakai **saat server berjalan**. Di lab penulis, cetakan dengan `package.json` versi 1.2 langsung mogok begitu dinyalakan: `Error: unable to determine transport target for "pino-pretty"`. Aturannya: library yang dipakai saat server berjalan harus berada di `dependencies`. Backend 1.3.0 memindahkannya ([2.1](#21-backend-130-pino-pretty-pindah-skrip-npm-tanpa-env-wajib-dan-log-tanpa-health-10-menit)); versinya tetap 13.2.0, hanya pindah blok.

**Alpine, bukan Debian.** Cetakan dasar kita varian **Alpine**, Linux kecil yang memakai library C bernama musl, bukan glibc seperti Debian, Ubuntu, dan Raspberry Pi OS. Untuk kebanyakan program Node tidak ada bedanya, kecuali library yang membawa kode mesin, seperti bcrypt. bcrypt 6.0.0 membawa versi siap pakai untuk musl, dan di cetakan arm64 penulis ia jalan tanpa kompiler. Versi musl untuk amd64 belum dijalankan penulis karena lab penulis tidak punya mesin Intel atau AMD.

**Web: dapur Node, meja saji Caddy.** Dashboard React sesudah `npm run build` hanyalah berkas statis: `index.html`, satu berkas JavaScript ±1 MB, CSS, dan ikon. Menyajikannya tidak butuh Node sama sekali. Tahap `bangun` di `frontend/Dockerfile` memasang semua alat (`npm ci`, 110 paket) lalu menjalankan `npm run build`; tahap akhir mulai dari cetakan **Caddy**, menyalin `Caddyfile`, dan dari dapur hanya mengambil isi `dist/` ke `/srv`. Hasilnya hampir sama besar dengan Caddy sendiri, dan tidak ada `node` di dalamnya. Yang makan waktu adalah dapurnya: *build* web pertama di Pi 5 penulis 103 detik, dibagi hampir rata antara `npm ci` dan `npm run build`. Konteks *build*-nya hanya folder `frontend`, tanpa folder `backend`, sehingga janji [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend) bahwa frontend bisa di-*build* sendirian ditepati di [3.3](#33-dockerfile-web-dan-dockerignore-lalu-docker-build-dari-folder-frontend-12-menit). Catatan jujur: Caddy di cetakan ini berjalan sebagai root, bawaan cetakan Caddy, berbeda dengan backend yang memakai `USER node`.

**`VITE_API_BASE` dibakar saat *build*.** Seperti di [Modul 22](../../fase-4-frontend-dashboard/modul-22-react-dasar/README.md#4-vite-dan-folder-frontend-dapur-pengembangan-di-localhost5173), semua `VITE_…` diganti teks tetap saat `npm run build`, lalu ikut terkirim ke browser. Di cetakan web nilainya diatur baris `ARG VITE_API_BASE=/api`: dashboard memanggil API di **jalur `/api` pada alamat yang sama** dengan halamannya. Mengganti nilainya berarti membangun ulang cetakan; isinya alamat, bukan rahasia.

**Caddy, server sungguhan untuk `dist/`.** Modul 22 dan 24 berjanji: `npm run preview` hanya untuk mencicipi, dan server sungguhan untuk `dist/` harus menjawab semua alamat layar dengan `index.html`. **Caddy** adalah server web kecil itu. Berkas setelannya, `frontend/caddy/Caddyfile` ([3.2](#32-frontendcaddycaddyfile-pintu-api-aset-yang-hilang-dan-fallback-spa-10-menit)), memberinya tiga tugas:

1. **Pintu depan** (*reverse proxy*): satu alamat `http://localhost` untuk halaman dan API. Tamu ke `/api/…` diantar ke layanan `backend`; rinciannya di [Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan).
2. **Aset** di `/assets/…` disajikan apa adanya, dan berkas yang tidak ada dijawab `404`.
3. ***SPA fallback***: alamat layar seperti `/peta` atau `/perangkat/f00d00000001` bukan berkas, jadi dijawab `index.html` lewat `try_files {path} /index.html`, lalu React Router memilih layarnya. F5 di layar mana pun tetap jalan, sesuai janji [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#3-satu-alamat-untuk-satu-layar-react-router-mode-deklaratif).

**HTTP saja, untuk sekarang.** Caddy terkenal karena memasang HTTPS sendiri, tetapi di rumah kita belum punya nama domain. Maka alamat situs di Caddyfile ditulis **`:80`**: HTTP biasa di port 80 kontainer, untuk alamat apa pun yang diketik di browser. Banyak tutorial memakai `auto_https off`, padahal menurut dokumentasi Caddy setelan itu hanya mematikan sertifikat dan pengalihan, tidak membuat situs dilayani lewat HTTP; yang menentukan adalah alamat `:80`. Saat menyala, Caddy menulis empat peringatan (`warn`) yang wajar untuk keadaan ini: `admin endpoint disabled`, `server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server`, `HTTP/2 skipped because it requires TLS`, dan `HTTP/3 skipped because it requires TLS`. Kamu melihatnya sendiri di [3.4](#34--uji-cetakan-web-sendirian-di-loket-8088-200-404-dan-502-yang-wajar-8-menit). Di Modul 27, `:80` cukup diganti nama domain, dan Caddy memasang HTTPS sendiri.

Daftar alat [Silabus §5.1](../../SILABUS.md#51-perangkat-lunak-semua-gratis-diinstal-tepat-saat-dibutuhkan) menaruh Caddy di Modul 27 (untuk HTTPS), sedangkan rincian Modul 26 di Silabus sudah memasukkannya ke `compose.cloud.yml`. Silabus v1.0.28 mencatat keduanya: Caddy menjadi penyaji web sejak Modul 26 (tanpa HTTPS, juga di daftar alat Modul 26), dan HTTPS tetap di Modul 27.

> ⬆️ **Sudah membaca Konsep 2–4?** Lanjut ke [Praktik 2](#praktik-2--cetakan-backend-130-45-menit) dan [Praktik 3](#praktik-3--cetakan-web-120-vite--caddy-45-menit). Konsep 5–8 dan [Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) dibaca sebelum [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit), karena 1.2 sampai [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit) dikerjakan dalam satu duduk.

### 5. Satu berkas untuk satu rumah: Docker Compose

Sampai Modul 25, menyalakan rumahmu berarti mengingat banyak hal: dua `docker run` panjang beserta lorongnya, dua atau tiga terminal `npm run dev`, dan broker yang menyala sebagai layanan sistem di Pi atau laptop. Di laptop teman, semuanya harus diketik ulang, persis dan berurutan. **Docker Compose** menuliskan seluruh rumah itu di **satu berkas** YAML. Setiap bagian rumah menjadi satu **layanan** (*service*): `db`, `mosquitto`, `backend`, `web`, `grafana`, dan seterusnya. Compose membaca berkas itu, lalu membuat lorong, lemari, dan kontainer untuk semuanya dengan satu perintah. Kamu sudah mencobanya dengan dua layanan di [Kemenangan Cepat](#-kemenangan-cepat-dua-layanan-satu-perintah-25-menit); `compose.cloud.yml` proyekmu memuat delapan layanan bawaan dan satu layanan berprofil (Konsep 10).

**Dari `docker run` ke berkas.** Setiap bagian perintah [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari) punya tempatnya sendiri:

| `docker run` Modul 17 | Di `compose.cloud.yml` |
| :--- | :--- |
| `--name rumahpintar-db` | nama layanan `db`; kontainernya bernama `rumahpintar-db-1` (nama proyek + layanan + nomor urut) |
| `timescale/timescaledb:2.30.2-pg17` | `image:` |
| `-e POSTGRES_PASSWORD=…` | `environment:`, nilainya dari `.env` |
| `-p 127.0.0.1:5432:5432` | `ports:` (Konsep 7) |
| `-v rumahpintar-data:/var/lib/postgresql/data` | `volumes:` (Konsep 6) |
| `--restart unless-stopped` | `restart:` (Konsep 8) |
| `docker network create` + `connect` (Modul 25) | tidak perlu (Konsep 7) |

**Kerangka berkasnya.** Cuplikan `compose.cloud.yml` di bawah membuang komentar dan beberapa bagian (`# …`); berkas utuhnya kamu tulis bertahap di Praktik 4, 5, dan 7:

```yaml
name: rumahpintar

x-setelan-backend: &setelan-backend
  MQTT_URL: mqtt://mosquitto:1883
  # …
  JWT_SECRET: ${JWT_SECRET:?isi JWT_SECRET di .env}
  # …

services:
  # …
  backend:
    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-backend:1.3.0
    build: ./backend
    environment: *setelan-backend
    ports:
      - "127.0.0.1:${PORT_BACKEND:-8080}:8080"
    # …
```

- `name: rumahpintar` = nama **proyek Compose**, awalan semua yang dibuatnya: kontainer `rumahpintar-backend-1`, lorong `rumahpintar_default`, lemari `rumahpintar_data-broker`. Tanpa `name:`, nama proyek = nama folder (Kemenangan Cepat: `kemenangan-cepat`). Proyek uji Praktik 9 (`-p uji-pulih`) dan Praktik 11 (`COMPOSE_PROJECT_NAME`) memakai berkas yang sama dengan nama proyek lain, jadi tidak bertabrakan dengan rumahmu.
- `x-setelan-backend: &setelan-backend` = bahan rujukan (*anchor*): bagian berawalan `x-` bukan layanan; `&` memberinya nama, `*setelan-backend` memakainya. Setelan backend cukup ditulis sekali untuk `backend` dan `migrasi`; batas log `x-log` (Konsep 8) dipakai semua layanan dengan cara yang sama.
- `image:` = nama cetakan; `build: ./backend` = folder resepnya (`backend/Dockerfile`, Konsep 3) untuk membangun cetakan itu (paragraf `TOKO_IMAGE` di bawah).
- `docker compose …` memakai **nama layanan** (`docker compose exec db …`); `docker` biasa memakai **nama kontainer** (`docker inspect rumahpintar-backend-1`).

**`.env` dan tanda `${…}`.** Compose mengisi setiap `${…}` dari berkas `.env` di folder yang sama, yaitu akar proyek (isinya di [4.2](#42-kebersihan-git-dulu-gitignore-gitattributes-lalu-env-dengan-sandi-postgres-lama-5-menit), perannya di Konsep 9). Bentuk-bentuknya sudah kamu coba di 🔁 Pemanasan:

| Tulisan | Bila kosong atau tidak ada di `.env` | Di proyek |
| :--- | :--- | :--- |
| `${X}` | diisi kosong (bila barisnya tidak ada: dengan peringatan) | tidak dipakai (contohnya `KOTA` di Pemanasan) |
| `${X:-bawaan}` | dipakai nilai bawaannya | `${PORT_DB:-5432}`, `${LEMARI_DB:-rumahpintar-data}` |
| `${X:?pesan}` | Compose **berhenti** dan menampilkan pesannya | rahasia wajib, juga `TOKO_IMAGE` |
| `$$` | bukan variabel: satu tanda `$` yang diteruskan ke `sh` di dalam kontainer | `"$$MQTT_PASSWORD"` di layanan `akun-broker` |

Di lab penulis, saat `TOKO_IMAGE` di `.env` masih kosong:

```text
$ docker compose config --quiet
error while interpolating services.migrasi.image: required variable TOKO_IMAGE is missing a value: isi TOKO_IMAGE di .env
```

Bila beberapa baris masih kosong, nama variabel di pesan itu bisa berganti setiap kali dicoba: isi semuanya.

**Nama berkas dan `COMPOSE_FILE`.** Tanpa `-f`, Compose mencari berkas bernama bawaan `compose.yaml` (Kemenangan Cepat). Berkas kita bernama `compose.cloud.yml` sesuai Silabus, karena proyek ini punya dua berkas Compose (Konsep 10); baris `COMPOSE_FILE=compose.cloud.yml` di `.env` memberi tahu Compose nama itu, jadi `docker compose up -d` di akar proyek sudah cukup. Belum ada `.env`, atau terminalmu di folder lain? Compose menjawab `no configuration file provided: not found`: pindah ke akar proyek dan buat `.env` (4.2); `-f compose.cloud.yml` saja tetap berhenti. Folder `edge` punya `.env` dan `COMPOSE_FILE` sendiri.

**Perintah sehari-hari**, semuanya dari akar proyek (mulai dipakai di [4.4](#44--docker-compose-up--d-lemari-lama-dikenali-skipping-initialization-8-menit) dan [5.3](#53--satu-perintah-menyalakan-seluruh-rumah-docker-compose-up--d---build-dan-ps--a-10-menit)):

| Perintah | Gunanya |
| :--- | :--- |
| `docker compose up -d` | buat dan nyalakan layanan bawaan; diulang sesudah berkas atau `.env` berubah, hanya layanan yang setelannya berubah yang dibuat ulang |
| `docker compose up -d --build` | bangun ulang cetakan dari `build:` dulu |
| `docker compose up -d --wait` | kembali ke terminal sesudah semua layanan sehat (Konsep 8) |
| `docker compose ps -a` | daftar kontainer proyek, termasuk layanan sekali jalan yang sudah selesai |
| `docker compose logs <layanan>` | baca log (Konsep 8) |
| `docker compose exec <layanan> <perintah>` | jalankan perintah di kontainer yang sedang menyala |
| `docker compose stop` / `start` | hentikan atau nyalakan lagi, tanpa menghapus |
| `docker compose down` | hapus kontainer dan lorong; lemari tetap (Konsep 6); profil `pantau` menyala? `docker compose --profile pantau down` |
| `docker compose config --quiet` | periksa berkas dan `.env`; diam berarti beres |

**Jangan lupa `--quiet`.** Tanpa itu, `docker compose config` mencetak seluruh berkas dengan isi `.env` sudah dimasukkan, termasuk setiap sandi dan token. Keluarannya tidak boleh ditempel ke forum, isu GitHub, atau AI.

**Tutorial lama dan versi Compose.** Banyak tutorial membuka berkasnya dengan `version: "3.8"`; Compose kini mengabaikan baris itu dan memperingatkan ``WARN … the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion`` (`…` = jalur berkasmu), jadi berkas kita tanpa `version:`. Perintahnya `docker compose` dengan spasi, bukan `docker-compose` (Compose versi 1). Rekaman penulis memakai Compose 2.40.3 (paket Ubuntu); Docker Desktop membawa Compose 5.x (5.6.1 saat ditulis), yang menurut dokumentasi resminya "functionally identical to Compose v2". Tampilan baris kemajuannya bisa berbeda; baca kata keadaannya: `Created`, `Started`, `Healthy`, `Exited`.

**`TOKO_IMAGE` wajib.** Layanan `backend`, `migrasi`, dan `web` memuat `image:` **dan** `build:`. Bila cetakan itu belum ada di laptop, Compose lebih dulu mencoba **menarik** (*pull*) dari toko image di alamat `image:`; kalau gagal, ia hanya memperingatkan, lalu membangunnya sendiri dari `build:` (terbukti di lab penulis dengan toko image tiruan yang mati dan yang kosong; jawaban `denied` GHCR sungguhan tidak diuji). Karena itu, `TOKO_IMAGE` sengaja **tanpa nilai bawaan**: bawaan seperti `ghcr.io/nama-akunmu` bisa membuat Compose menarik image orang lain yang kebetulan bernama sama. Kamu mengisinya di [5.2](#52-composecloudyml-tahap-kedua-migrasi-backend-web-dan-toko_image-di-env-15-menit) dengan `ghcr.io/<akun-huruf-kecil>`. Isinya bukan rahasia: sesudah [10.2](#102-docker-login-ghcrio-lalu-docker-compose-build-dan-push-13-menit) mengisi toko itu, laptop teman di [11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit) cukup menarik image-mu (Konsep 11). `migrasi` dan `backend` memakai cetakan yang sama, jadi dibangun sekali saja.

Gambar di bawah merangkum `compose.cloud.yml`: layanan, lorong, loket, dan lemari, yang dibedah Konsep 6 dan 7.

![Diagram anatomi compose.cloud.yml (Konsep 5–7), proyek rumahpintar. Atas: Docker Hub dan toko image, ditarik saat up pertama, image resmi bertag persis, backend dan web dari TOKO_IMAGE atau dibangun (build:); WiFi rumah, gerbang Pi 192.168.1.37 lewat jembatan ke 192.168.1.10:1883, HP hanya di mode HP (ALAMAT_WEB=0.0.0.0). Di laptop: akar proyek (compose.cloud.yml + .env berisi rahasia, loket, COMPOSE_FILE, TOKO_IMAGE, lalu docker compose up -d); browser (http://localhost ke dashboard, http://localhost:3000 ke Grafana) masuk lewat loket :80 dan :3000; alat (Bruno dan Swagger localhost:8080/docs, DBeaver :5432, simulator :1883, npm run dev) lewat loket :8080, :5432, :1883. Di Docker, lorong rumahpintar_default dibuat Compose, nama layanan = alamat. Baris pertama: web (Caddy, image …/rumah-pintar-mini-web:1.2.0, build ./frontend, berkas ./frontend/caddy ke /etc/caddy, Up, loket 127.0.0.1:80) dengan panah /api/* ke backend:8080; backend (API + Socket.IO, image …-backend:1.3.0, build ./backend, HOST=0.0.0.0, healthy, loket 127.0.0.1:8080) ke mosquitto:1883; mosquitto broker pusat (eclipse-mosquitto:2.1.2-alpine, berkas ./edge/pusat.conf dan ./edge/acl-broker hanya-baca, Up) dengan loket 1883 semua antarmuka (merah-ungu). Backend ke db:5432. Baris kedua: grafana 13.2.4 (berkas ./grafana/provisioning dan ./grafana/dashboards, healthy, loket 127.0.0.1:3000) ke db:5432 sebagai grafana_baca; db alias lama rumahpintar-db (timescale/timescaledb:2.30.2-pg17, formulir POSTGRES_… hanya lemari kosong, healthy, loket 127.0.0.1:5432); uptime-kuma pudar, profil pantau, mati di up -d biasa, Modul 30, loket 127.0.0.1:3001. Sekali jalan, garis putus-putus, Exited (0): akun-grafana, migrasi, akun-broker; terlihat dengan docker compose ps -a. Lemari: rumahpintar-grafana-data dan rumahpintar-data external, milik kamu, tidak pernah dibuat atau dihapus Compose; rumahpintar_data-broker milik Compose, ikut terhapus oleh docker compose down -v. Bawah: loket 127.0.0.1 hanya program di laptop, tanpa IP = WiFi rumah juga dan melewati firewall, HOST=0.0.0.0 di dalam tidak membuka apa pun; localhost di kontainer = kontainer itu sendiri; down menghapus kontainer dan lorong, lemari tetap, down -v menghapus lemari milik Compose, lemari external selamat.](aset/anatomi-compose-cloud.png)

### 6. Lemari dan jendela: *volume*, *bind mount*, dan cadangan

Kontainer boleh dibuang dan dicetak ulang kapan saja: `docker compose down` menghapusnya, `up -d` mencetaknya lagi. Yang harus bertahan disimpan di luar kontainer. **Lemari** (*volume*) sudah kamu kenal sejak Modul 17. Yang baru adalah **jendela** (*bind mount*): berkas atau folder proyekmu yang terlihat dari dalam kontainer, misalnya `edge/pusat.conf` yang dibaca broker. `compose.cloud.yml` memakai empat jenis tempat:

| Jenis | Di proyek | Pemiliknya | Kena `down -v`? |
| :--- | :--- | :--- | :--- |
| lemari `external` | `rumahpintar-data` (database), `rumahpintar-grafana-data` | kamu | tidak pernah |
| lemari milik Compose | `rumahpintar_data-broker` (berkas sandi broker), `rumahpintar_data-kuma` | Compose | **ikut terhapus** |
| jendela | `./edge/pusat.conf`, `./edge/acl-broker`, `./frontend/caddy`, `./grafana/provisioning` | repo Git | tidak |
| `tmpfs` | folder log Mosquitto, folder data `akun-grafana` | memori (sementara) | — |

**Lemari milikmu: `external`.** Bagian `volumes:` di akhir berkas, tanpa komentar:

```yaml
volumes:
  data-db:
    external: true
    name: ${LEMARI_DB:-rumahpintar-data}
  data-grafana:
    external: true
    name: ${LEMARI_GRAFANA:-rumahpintar-grafana-data}
  data-broker:
  data-kuma:
```

`external: true` berarti lemari itu milikmu: Compose memakainya, tetapi tidak pernah membuat atau menghapusnya. Di laptopmu keduanya sudah ada sejak Modul 17 dan 25, jadi berkas [4.1](#41-composecloudyml-tahap-pertama-db-dan-grafana-di-atas-dua-lemari-external-10-menit) langsung memakai riwayat dan Grafana lamamu. Di laptop baru, `up -d` berhenti dengan `external volume "…" not found` sampai kamu membuatnya sekali dengan dua `docker volume create` ([11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit)). Namanya dari `.env` (`LEMARI_DB`, `LEMARI_GRAFANA`), supaya proyek uji Praktik 9 dan 11 bisa memakai lemari lain. Lupa menulis `external`? Compose tetap memakai lemari lama itu dengan peringatan ``already exists but was not created by Docker Compose. Use `external: true` to use an existing volume``, yang di terminal biasa sering tertimpa baris kemajuan. Lemari itu lalu dianggap bagian proyek: di proyek uji lab penulis, ia ikut terhapus oleh `down -v` (`Volume … Removed`).

> [!WARNING]
> **Jangan `docker compose down -v`, `docker volume rm rumahpintar-…`, atau `docker system prune --volumes`** di laptop yang menyimpan riwayat aslimu. `down` biasa hanya menghapus kontainer dan lorong; `-v` ikut menghapus lemari milik Compose. Dengan `-v`, riwayatmu memang selamat karena `external` (terbukti di lab penulis), tetapi berkas sandi broker hilang: `akun-broker` hanya membuat ulang akun `backend`, jadi akun perangkat (juga simulator) dan `jembatan-pi` harus ditambah lagi satu per satu. Buktinya di [8.5](#85-jangan-down--v-lalu-opsional-restart-docker-atau-reboot-pi-4-menit).

**Formulir hanya untuk lemari kosong.** Seperti Modul 17, `POSTGRES_PASSWORD` hanya dibaca saat lemari database masih kosong. Lemari lamamu sudah berisi sandi, jadi `.env` memuat sandi postgres **lama**; mengganti baris itu tidak mengganti sandi di database. Log [4.4](#44--docker-compose-up--d-lemari-lama-dikenali-skipping-initialization-8-menit) membuktikannya: `PostgreSQL Database directory appears to contain a database; Skipping initialization`. Sandi `.env` yang tidak cocok membuat `migrasi` gagal masuk (`password authentication failed for user "postgres"`, lab penulis). Grafana sama: `GRAFANA_ADMIN_SANDI` hanya berlaku untuk lemari Grafana yang kosong (Konsep 9).

**Jendela: konfigurasi dari repo.** Jendela ditulis `./jalur/di/proyek:/jalur/di/kontainer`, relatif terhadap folder `compose.cloud.yml`; akhiran `:ro` = kontainer hanya boleh membaca. Konfigurasinya ikut Git dan diubah di repo. Tiga hal yang diuji penulis di Docker Engine Linux (Docker Desktop tidak diuji):

1. **Berkas tunggal lawan folder.** Sebagian editor (juga `sed -i`) menyimpan dengan membuat berkas baru pengganti berkas lama. Kontainer yang memasang **berkas tunggal** tetap membaca isi **lama** sampai `docker compose restart <layanan>` (cukup *restart*); yang memasang **folder** langsung melihat isi baru. Caddyfile dipasang sebagai folder `./frontend/caddy`; Mosquitto memakai berkas tunggal, jadi sesudah mengubah `edge/acl-broker` atau `edge/pusat.conf`: `docker compose restart mosquitto` ([5.5](#55--data-live-lewat-broker-pusat-simulator-kebun-tiruan-dan-tombol-lampu-7-menit)), seperti aturan "*restart*, bukan *reload*" Modul 21.
2. **Folder sumber yang belum ada** dibuat Docker sebagai folder kosong milik `root`, dan kamu tidak bisa menulis ke dalamnya (`Permission denied`). Karena itu, `edge/jembatan/README.md` ikut Git: folder `jembatan/` sudah ada sesudah `git clone` (Konsep 10).
3. **Pemilik berkas.** Program di kontainer berjalan sebagai pengguna bernomor (uid): postgres 70, Grafana 472, Mosquitto 1883, backend `node` 1000; di Linux dan Pi, nomor itulah yang menentukan siapa boleh membaca. Berkas sandi broker disimpan di lemari (`/mosquitto/data/sandi-broker`), bukan jendela: di lab penulis, berkas `600` milik pengguna laptop yang dipasang sebagai jendela membuat Mosquitto jatuh bangun dengan `Unable to open pwfile`.

**`tmpfs` mencegah lemari tanpa nama.** Resep image Mosquitto dan TimescaleDB menandai beberapa folder sebagai lemari. Tanpa tempat untuk folder itu, Docker membuat lemari tanpa nama (deretan huruf-angka panjang di `docker volume ls`) setiap kontainernya dibuat baru, dan `down` tidak menghapusnya (lab kode penulis: ±3 per siklus; dengan `tmpfs`: 0). `tmpfs` memberi folder sementara di memori, seperti di Kemenangan Cepat; di proyek ia dipasang di `akun-broker`, `mosquitto`, dan `akun-grafana`.

**Lemari bukan cadangan.** Lemari selamat dari `down`, tetapi tidak dari disk rusak, laptop hilang, atau perintah keliru, dan pegangan [Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#9-backup-dan-restore-fotokopi-arsip-lalu-buktikan-bisa-dipulihkan) tetap: cadangan yang belum pernah dipulihkan sama dengan tidak punya cadangan. Database dicadangkan dengan `pg_dump` di dalam layanan `db`, boleh selagi menyala. Lemari Grafana boleh di-`tar` sesudah layanannya di-`stop` (lab penulis: berhenti, salin, menyala lagi dalam ±9 detik), dengan image yang berjalan sebagai root (`node:24.22.1-alpine3.24`), bukan image Grafana (uid 472: `tar: can't open … Permission denied`). Lemari database yang sedang dipakai **tidak boleh** di-`tar`: berkasnya sedang ditulis, jadi salinannya bisa tidak utuh. [Praktik 9](#praktik-9--cadangan-lemari-dan-uji-pulih-ke-proyek-terpisah-35-menit) membuat keduanya dan memulihkan arsip database ke proyek terpisah; cadangan otomatis dan di luar rumah menunggu Modul 30.

### 7. Lorong dibedah: *network* Compose, loket, dan pintu depan

Di Modul 25 kamu membuat lorong `rumahpintar` dengan tangan, dan [Konsep 2 Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong) menjanjikan bedahnya di sini. Compose membuat lorong sendiri untuk setiap proyek, bernama `<proyek>_default`; untuk rumahmu `rumahpintar_default`. Semua layanan di berkas masuk ke sana, dan di dalamnya **nama layanan adalah alamat**, seperti `pengirim` memanggil `broker` di [KC Langkah 5](#langkah-5--masuk-ke-kontainer-broker-nama-layanan-adalah-alamat-4-menit): `backend` dan `migrasi` memanggil `db:5432` dan `mosquitto:1883` (`x-setelan-backend`), Caddy di `web` memanggil `backend:8080`, dan `akun-grafana` memanggil `db`.

**Alias: nama lama tetap dikenal.** *Data source* buatan layarmu di Modul 25 menuju `rumahpintar-db:5432`, padahal kontainer database kini bernama `rumahpintar-db-1`. Layanan `db` diberi nama kedua (*alias*) di lorong:

```yaml
    networks:
      default:
        aliases:
          - rumahpintar-db
```

Di lab penulis, *data source* lama itu tetap menjawab `Database Connection OK` sesudah pindah ([4.5](#45--sidik-jari-sesudah-sama-dengan-sebelum-lalu-periksa-grafana-di-lemari-yang-sama-12-menit)), sampai digantikan berkas di Praktik 7.

**Port dalam lawan loket.** Aturan Modul 25 tetap: di dalam kontainer, `localhost` adalah kontainer itu sendiri, jadi `127.0.0.1` di pemeriksaan kesehatan (Konsep 8) memang berarti "diriku", dan layanan lain selalu dipanggil dengan namanya. Di baris `ports`, angka **kanan** adalah port di dalam kontainer (selalu sama: db 5432, backend 8080, Grafana 3000), angka **kiri** loket di laptop yang bisa kamu ganti lewat `PORT_*` di `.env`. Di lorong, yang dipakai port dalam: mengganti `PORT_BACKEND` tidak mengubah `backend:8080`. Layanan tanpa `ports` (`migrasi`, `akun-broker`, `akun-grafana`) tidak punya loket di laptop sama sekali.

**`HOST=0.0.0.0` tidak membuka backend ke WiFi.** Seperti kata [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#1-model-ancaman-siapa-yang-mungkin-iseng-dan-apa-akibatnya), backend mendengar di `HOST=127.0.0.1` supaya hanya laptop itu yang bisa mengetuknya. Di kontainer, `HOST: 0.0.0.0` berarti mendengar di semua antarmuka **di dalam** kontainer, supaya Caddy dan pemeriksaan kesehatan bisa masuk. Siapa di luar laptop yang bisa mengetuk ditentukan loketnya, dan loket backend `127.0.0.1:${PORT_BACKEND:-8080}:8080` hanya untuk laptop ini. Janji Modul 20 tetap.

**Loket tanpa IP = seluruh WiFi.** Loket tanpa alamat (`"${PORT_MQTT:-1883}:1883"`) terbuka di semua antarmuka laptop, dan menurut dokumentasi Docker juga melewati *firewall* laptop. `docker compose ps` membedakannya: `127.0.0.1:8080->8080/tcp` lawan `0.0.0.0:1883->1883/tcp, [::]:1883->1883/tcp`. Hanya broker pusat yang sengaja begitu, karena gerbang Pi dan ESP32 jalur laptop masuk dari WiFi rumah; ia berakun (Modul 21) dan tetap tanpa *port forwarding* di router (belum TLS, Modul 27). Broker ini ikut menyala di WiFi mana pun: di WiFi umum `docker compose stop mosquitto`, di rumah `docker compose start mosquitto`. Loket web dibuka ke WiFi hanya di mode HP ([🧩 Tingkat 1](#tingkat-1--dashboard-dari-hp-mode-hp-lewat-env-ubah-sedikit-20-menit)).

**Caddy, pintu depan.** Layanan `web` adalah pintu depan (*reverse proxy*): satu alamat, `http://localhost`, untuk halaman dan API. Tamu ke `/api/…` diantar ke `backend:8080` (awalan `/api` dibuang), tamu lain mendapat halaman dashboard. Halaman dan API kini satu asal (*origin*), jadi *cookie* `SameSite=Strict` Modul 20 ikut terkirim tanpa urusan CORS lintas port. Empat akibatnya, ditulis jujur:

1. **Tambalan jalur *cookie*.** Backend memasang *cookie* `sesi` berjalur `/auth`, padahal browser memanggilnya lewat `/api/auth`. Satu baris `header_down` di Caddyfile menulis ulang jalurnya ([3.2](#32-frontendcaddycaddyfile-pintu-api-aset-yang-hilang-dan-fallback-spa-10-menit)): tambalan di pintu depan, bukan perubahan backend.
2. **Socket.IO.** `io("/api")` dibaca Socket.IO sebagai *namespace* (nama ruang), bukan jalur, jadi frontend 1.2.0 menyambung lewat jalur `/api/socket.io` (tiga baris `soket.ts`, [3.1](#31-frontend-120-tiga-baris-soketts-lalu-lint-build-dan-cek-skema-10-menit)).
3. **Pembatas *login* dibagi semua tamu web.** Pembatas 10 percobaan per menit per IP [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#8-rate-limiting-jam-pasir-untuk-penebak-sandi) kini melihat satu IP untuk semua tamu web: IP kontainer `web` (log backend lab penulis: `IP 172.19.0.7`). Satu penebak sandi membuat semua penghuni yang masuk lewat `http://localhost` ikut ditolak `429` (`terlalu banyak percobaan: coba lagi dalam …`) sampai semenit, sedangkan Bruno lewat loket backend tetap masuk. Obatnya, `trustProxy`, menunggu Modul 27 bersama HTTPS.
4. **Swagger lewat loket backend.** Di balik `/api`, halaman Swagger rusak (asetnya dijawab halaman dashboard), jadi buka **`http://localhost:8080/docs`** ([5.4](#54--masuk-lewat-caddy-di-httplocalhost-f5-bruno-dan-swagger-8-menit)). Dari `http://127.0.0.1:8080/docs`, *login* **Try it out** ditolak `403` `permintaan dari halaman http://127.0.0.1:8080 ditolak`: dengan `HOST=0.0.0.0`, halaman itu tidak lagi termasuk asal yang dikenal backend, kecuali kamu menambahkannya ke `CORS_ORIGIN`.

**Memanggil laptop dari kontainer.** Gerbang yang dicoba di laptop yang sama ([6.7](#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)) perlu mengetuk mesin tempat Docker berjalan, bukan layanan di lorong: `extra_hosts` `pusat:${ALAMAT_PUSAT}` dengan `ALAMAT_PUSAT=host-gateway`, nama khusus Docker untuk mesin itu sendiri (di Pi, isinya IP laptop; Konsep 10). Docker Desktop juga mengenal `host.docker.internal` (tidak diuji penulis; Docker Engine Linux tidak mengenalnya, Konsep 2 Modul 25). Gejala loket dan nama lainnya ada di [🚨](#-kalau-tidak-jalan).

### 8. Menyala berurutan dan bangkit sendiri: *healthcheck*, `depends_on`, *restart policy*, dan log

**"Menyala" belum tentu "siap".** Database yang baru menyala butuh beberapa detik sebelum mau menerima tamu; di lemari baru, Postgres bahkan menjalankan server sementara dulu. Di prototipe riset penulis, `migrasi` yang hanya menunggu database "menyala" mulai 0,3 detik sesudahnya dan gagal `ECONNREFUSED` (exit 1). Karena itu, tiga layanan diberi **pemeriksaan kesehatan** (*healthcheck*): perintah yang dijalankan Docker berkala di dalam kontainer, bertanya "masih sehat?". Jawabannya tampil di `docker compose ps` sebagai `(healthy)` atau `(health: starting)`:

| Layanan | Pemeriksaan | Jarak |
| :--- | :--- | :--- |
| `db` | `pg_isready -h 127.0.0.1 -U postgres -d rumahpintar` (tanpa `-h`, bisa lolos saat server sementara tadi masih jalan) | 5 detik |
| `backend` | `node -e "fetch('http://127.0.0.1:8080/health',{method:'HEAD'})…"` = `HEAD /health` yang dijanjikan [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#6-satpam-di-setiap-pintu-peran-admin-dan-viewer) untuk pemeriksa Docker (image Node tanpa `curl`) | 15 detik |
| `grafana` | `curl -fsS http://127.0.0.1:3000/api/health` | 15 detik |
| `mosquitto`, `web` | tidak ada | — |

Saat baru menyala, backend dan Grafana diperiksa tiap 2 detik; sejak 1.3.0, log backend tidak mencatat pemeriksaan `/health` yang berhasil.

**`depends_on`: siapa menunggu siapa.** Di Kemenangan Cepat, `depends_on` hanya mengatur urutan menyala. Proyek memakai tiga syarat: **`service_started`** (cukup sudah menyala: `backend` menunggu `mosquitto`, karena backend menyambung ulang sendiri tiap 5 detik), **`service_healthy`** (tunggu sehat: `migrasi` dan `backend` menunggu `db`, `web` menunggu `backend`), dan **`service_completed_successfully`** (tunggu layanan sekali jalan selesai dengan kode 0: `mosquitto` menunggu `akun-broker`, `backend` menunggu `migrasi`, `grafana` menunggu `akun-grafana`).

**Layanan sekali jalan** seperti petugas yang datang, mengerjakan satu tugas, lalu pulang: `akun-broker` membuat akun broker `backend`, `migrasi` menerapkan berkas `migrasi/*.sql` yang baru, `akun-grafana` membuat akun `grafana_baca`. Ketiganya membuat bila belum ada dan melewati bila sudah ada, jadi aman diulang (`berkas sandi broker sudah ada: dilewati`, `0 migrasi baru diterapkan, 8 sudah ada sebelumnya.`, `akun grafana_baca sudah ada: dilewati`). Sesudah pulang, statusnya `Exited (0)` dan hanya tampil di **`docker compose ps -a`** ([5.3](#53--satu-perintah-menyalakan-seluruh-rumah-docker-compose-up--d---build-dan-ps--a-10-menit)). `docker compose start` ikut menjalankan lagi petugas di rantai `depends_on`, dan itu aman. `docker compose up -d --wait` menunggu semuanya sehat: sekali jalan yang `Exited (0)` tidak dianggap gagal, dan layanan tanpa pemeriksaan ditulis `Healthy` begitu menyala ([11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit)).

Di lab penulis (lemari berisi, image sudah ada), `up -d` di [8.4](#84--l3-sidik-jari-sama-sesudah-docker-compose-down-lalu-up--d-8-menit) berjalan begini: `akun-broker` `Exited` 3,2 s → `mosquitto` `Started` 3,4 s; `db` `Healthy` 9,1 s → `migrasi` `Exited` 10,1 s → `akun-grafana` `Exited` 11,3 s → `grafana` `Started` 11,6 s; `backend` `Healthy` 20,5 s → `web` `Started` 21,1 s; seluruhnya ±24 detik. Dengan `--wait` (proyek uji Praktik 11) ±25,6 detik, dan Grafana paling akhir sehat. Di laptopmu angkanya pasti berbeda.

**Aturan bangkit (*restart policy*).** `restart:` menentukan kapan Docker menghidupkan lagi kontainer yang berhenti. Sekali jalan memakai `"no"`, layanan lain `unless-stopped` (sama dengan Modul 17):

| Kejadian | `"no"` | `on-failure` | `always` | `unless-stopped` |
| :--- | :---: | :---: | :---: | :---: |
| program di dalam berhenti sendiri, kode 0 (`exec backend kill 1`) ¹ | mati | mati | hidup | **hidup** |
| program *crash*, kode bukan 0 ² | mati | hidup | hidup | hidup |
| `docker compose stop` ¹ | mati | mati | mati | **mati** |
| `docker kill` / `docker compose kill` ³ | mati | mati | mati | mati |
| Docker dinyalakan ulang (*reboot*), layanan sedang jalan ² | mati | ⁴ | hidup | hidup |
| Docker dinyalakan ulang sesudah layanan di-`stop` ² | mati | ⁴ | hidup | mati |

¹ direkam penulis untuk `unless-stopped` ([8.1](#81--docker-compose-exec-backend-kill-1-backend-hidup-lagi-sendiri-8-menit), [8.2](#82-pembanding-sesudah-docker-compose-stop-backend-backend-tetap-mati-6-menit)); ² dokumentasi dan kode Docker, tidak direkam; ³ prototipe riset dan kode Docker; ⁴ dokumentasi dan kode Docker tidak sepakat, dan modul ini tidak memakainya.

Silabus meminta "mematikan satu kontainer dan melihatnya hidup lagi sendiri". `stop` dan `kill` dihormati Docker sebagai keputusanmu, jadi yang dimaksud adalah **program di dalam kontainer yang berhenti sendiri**. `docker compose exec backend kill 1` meminta proses pertama kontainer (backend) berhenti dari dalam; backend [berhenti dengan rapi](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#610-berhenti-dengan-rapi) dengan kode 0, lalu `unless-stopped` menghidupkannya (lab penulis: `RestartCount` 1, siap lagi ±7 detik). Itu meniru program yang berhenti sendiri, bukan *crash*: `kill -SEGV 1` dari dalam diabaikan (prototipe riset). Program yang terus jatuh dicoba lagi dengan jeda yang makin panjang, sampai 1 menit (kode Docker).

**Proses pertama dan `init: true`.** Proses pertama kontainer hanya bereaksi pada sinyal berhenti yang ia tangani sendiri. Backend menanganinya sejak Modul 19, jadi `stop` selesai seketika; `sh` di `pengirim` Kemenangan Cepat tidak, jadi Docker menunggu batas 10 detik lalu mematikannya paksa. `init: true` menaruh program kecil di depan `sh` yang meneruskan sinyalnya (lab: `down` 11,8 → 1,6 detik). `db` berisi ±1,04 juta bacaan pun berhenti dalam 1,8 detik, jadi `stop_grace_period` (batas tunggu yang lebih lama) tidak perlu.

**Sehat bukan berarti rumah beres.** `unhealthy` **tidak** membuat Docker menghidupkan ulang kontainer (kode Docker; tidak diuji penulis); pemeriksaan kesehatan hanya dipakai untuk urutan, `ps`, dan `--wait`. `/health` juga menjawab 200 walau broker dan database putus (lab penulis: `{"ok":true,"broker":false,"database":false,…}`). Pemantau yang mengabari orang menunggu [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data). Batas backend 1.3: aturan otomatis dimuat sekali saat backend menyala (gagal bila database belum siap), dan sesudah laptop atau Docker dinyalakan ulang, Docker bisa menyalakan kontainer tanpa urutan `depends_on`. Layar **Aturan** kosong walau backend `(healthy)`? `docker compose restart backend` ([🚨](#-kalau-tidak-jalan); tidak direkam penulis).

**Laptop tidur, rumah tidur.** `unless-stopped` menutup "backend lupa dinyalakan" dan "program berhenti sendiri", tetapi seperti kata [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari), semuanya hanya hidup selama Docker menyala, dan laptop yang tidur menidurkan bot, *alert*, dan laporan pagi. [Server yang menyala terus](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#9-notifikasi-telegram-penting-cepat-dan-tidak-cerewet) baru terwujud di Modul 27. *Restart* Docker dan *reboot* boleh kamu coba di [8.5](#85-jangan-down--v-lalu-opsional-restart-docker-atau-reboot-pi-4-menit).

**Log.** Docker menyimpan semua yang ditulis kontainer ke layarnya, bawaannya tanpa batas; *anchor* `x-log` membatasinya 3 berkas × 10 MB per kontainer. Membacanya ([5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit)): `docker compose logs backend`, ditambah `-f` (ikuti terus; **Ctrl + C** hanya berhenti membaca), `--since 5m` (5 menit terakhir), `-n 50` (50 baris terakhir), atau `-t` (cap waktu Docker, UTC). Jam log backend sudah WIB berkat `TZ: Asia/Jakarta`; Mosquitto dan Caddy menulis angka detik sejak 1 Januari 1970, sedangkan Grafana memakai UTC (WIB = UTC + 7).

![Diagram menyala berurutan, bangkit sendiri (Konsep 8). Atas, garis waktu docker compose up -d di lab penulis (Pi 5, lemari berisi, image ada); angka = ujung batang, detik di layar Compose; awal batang disimpulkan dari depends_on. db langsung menyala, Healthy 9,1 s, lalu tetap berjalan; akun-broker Exited 3,2 s; mosquitto menunggu akun-broker selesai, Started 3,4 s; migrasi menunggu db sehat, Exited 10,1 s; akun-grafana menunggu migrasi, Exited 11,3 s; grafana menunggu akun-grafana, Started 11,6 s; backend menunggu db sehat, migrasi selesai, mosquitto menyala, Healthy 20,5 s; web menunggu backend sehat, Started 21,1 s. Cara membaca: batang = menyala sampai Started atau Healthy, garis = tetap berjalan, kotak putus-putus = sekali jalan lalu Exited, garis putus-putus = menunggu syarat. Dengan --wait semua ditunggu sehat, lab 25,6 s, Grafana paling akhir 23,1 s. Tanpa service_healthy, migrasi menyala 0,3 s sesudah db dan gagal ECONNREFUSED, exit 1 (uji riset). Tengah: running belum tentu siap, healthcheck db pg_isready -h 127.0.0.1 tiap 5 s, backend HEAD /health lewat node -e, grafana curl -fsS …/api/health, mosquitto dan web tanpa healthcheck; unhealthy TIDAK me-restart, healthcheck hanya untuk urutan, ps, dan --wait, /health tetap 200 walau broker atau DB putus, pemantau sungguhan Modul 30; sekali jalan aman diulang: berkas sandi broker sudah ada dilewati, 0 migrasi baru diterapkan, 8 sudah ada sebelumnya, akun grafana_baca sudah ada dilewati. Bawah, tabel siapa yang hidup lagi sendiri, kolom restart no (sekali jalan), unless-stopped (5 layanan Modul 26), always (pembanding): exec backend kill 1 dari dalam, tidak, hidup lagi, hidup lagi, direkam (unless-stopped) Up 2 seconds, RestartCount 1; crash dengan kode bukan 0, tidak, hidup lagi, hidup lagi, keduanya dengan jeda makin panjang sampai 1 menit, dokumen + kode Docker; docker compose stop backend, tidak di ketiganya, direkam (unless-stopped) Exited (0), tunggu start; docker compose kill backend, tidak di ketiganya, uji riset; reboot saat layanan jalan, tidak, hidup lagi, hidup lagi, dokumen, tidak direkam; reboot sesudah layanan di-stop, tidak, tidak, hidup lagi, dokumen. kill 1 meniru program yang berhenti sendiri, bukan crash. Sesudah docker compose down tidak ada yang hidup lagi; laptop tidur = semuanya tidur, 24 jam = Modul 27.](aset/menyala-berurutan.png)

> ⬆️ **Sudah membaca Konsep 5–8?** Baca juga [Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang); [Konsep 9](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana) menunggu sampai sebelum [Praktik 7](#praktik-7--grafana-sebagai-berkas-provisioning-dan-akun-grafana_baca-sekali-jalan-40-menit). Sesudah itu, kerjakan [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) sampai [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit) dalam satu duduk.

### 9. Rahasia dan konfigurasi sebagai berkas: `.env` dan *provisioning* Grafana

Selain data di lemari, Konsep 1 meninggalkan dua hal di luar peti kemas: rahasia di `.env` dan setelan rumah di berkas repo. Contoh terbesarnya Grafana: di Modul 25 kamu merakitnya lewat klik; mulai Praktik 7, ia dirakit dari berkas.

**Tiga `.env`, tiga pembaca.**

| Berkas | Dibaca oleh | Isinya |
| :--- | :--- | :--- |
| `.env` di akar proyek ([4.2](#42-kebersihan-git-dulu-gitignore-gitattributes-lalu-env-dengan-sandi-postgres-lama-5-menit)) | Compose pusat, mode rumah | semua rahasia rumah, ditambah `COMPOSE_FILE`, `TOKO_IMAGE`, loket, dan nama lemari |
| `backend/.env` ([5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit)) | `npm run dev`, mode kembang | setelan backend saja |
| `edge/.env` ([6.3](#63-pi-cabang-dari-github-edgeenv-jembatanpusatconf-dan-isi-composeedgeyml-8-menit)) | Compose gerbang di Pi | `ALAMAT_PUSAT`, `PORT_GERBANG`, `TUNNEL_TOKEN` (kosong) |

Backend di kontainer tidak membaca `backend/.env`: setelannya datang dari `.env` akar lewat `x-setelan-backend` (Konsep 5). Sandi postgres (di `backend/.env` tertulis di dalam `DATABASE_URL`) dan `MQTT_PASSWORD` harus sama di kedua berkas, karena database dan akun broker `backend` hanya ada satu.

**Aturannya sama untuk ketiganya.** Tidak ikut Git: `.gitignore` menahan `.env` dan `.env.*`, dan yang ikut hanya `.env.example`, berisi nama baris tanpa nilai rahasia. Di Linux, macOS, dan Pi, berkasnya diberi mode `600` (`chmod 600 .env`) supaya hanya pemiliknya yang bisa membaca; Windows tidak memakai `chmod` (tidak diuji penulis). Sandi postgres lemari lama (4.2), `JWT_SECRET` (5.2), dan token Telegram tetap dipakai; rahasia baru lainnya dibuat acak dengan resep dari `.env.example`:

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Hasilnya 43 karakter yang hanya berisi huruf, angka, `-`, dan `_`. Sandi postgres ikut tertulis di alamat database (`postgres://postgres:<sandi>@db:5432/rumahpintar`), jadi `@`, `:`, atau `/` di dalam sandi akan merusak alamatnya, sedangkan `$` dibaca Compose sebagai awal variabel. Laptop tanpa Node.js menjalankan baris yang sama lewat `docker run --rm node:24.22.1-alpine3.24 node -e "…"` ([11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit); tanda kutipnya di PowerShell dan CMD tidak diuji penulis).

**Satu berkas bocor, semua bocor.** `.env` akar memuat sekaligus sandi postgres, kunci JWT, sandi broker, sandi `grafana_baca`, sandi admin Grafana, dan token Telegram. Jangan menempelnya ke forum, isu GitHub, atau AI, begitu juga keluaran `docker compose config` tanpa `--quiet` (Konsep 5) dan `docker inspect` tanpa `--format` ([🔁 Langkah 5](#langkah-5--membaca-setelan-kontainer-lama-dengan-docker-inspect-tanpa-membocorkan-sandi)). Compose juga punya fitur *secrets*; alasan proyek ini tetap memakai `.env` ada di [🔬](#-bedah-teknis-opsional).

**Grafana dari berkas.** Isi Grafana Modul 25 (*data source*, dashboard, *contact point*, dan aturan *alert*) tersimpan di lemari `rumahpintar-grafana-data`, sedangkan berkas di folder `grafana/` hanya arsip ([9.2 Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit)). `git clone` di laptop teman hanya memberi Grafana kosong. ***Provisioning*** (penyiapan dari berkas) membaliknya: setiap kali menyala, Grafana memasang semua yang tertulis di folder *provisioning*. `compose.cloud.yml` memasang `./grafana/provisioning` dan `./grafana/dashboards` sebagai jendela hanya-baca (Konsep 6), menepati janji [🔬](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#-bedah-teknis-opsional) *Dashboard sebagai kode* Modul 25. Isi `grafana/provisioning` ([7.1](#71-berkas-provisioning-data-source-rumahpintar-db-dashboard-contact-point-dan-aturan-12-menit)):

| Berkas | Memasang | Yang penting |
| :--- | :--- | :--- |
| `datasources/rumahpintar.yaml` | *data source* `rumahpintar-db` | uid (kode pengenal) tetap `rumahpintar-db`, `url: db:5432`, akun `grafana_baca`, `maxOpenConns: 4` (Modul 25) |
| `dashboards/rumahpintar.yaml` | setiap `.json` di `grafana/dashboards`, ke folder `Rumah Pintar Mini` | `allowUiUpdates: false`, `disableDeletion: true`, `updateIntervalSeconds: 30` |
| `alerting/node-diam.yaml` | aturan `Node diam` | dipindah dari `grafana/alerting/`; `datasourceUid: rumahpintar-db` |
| `alerting/kontak-telegram.yaml` | *contact point* `Telegram Rumah Pintar` | templat Modul 25; token dan chat_id dari `.env` |
| `plugins/tanpa-plugin.yaml` | daftar plugin kosong | menghapus satu-satunya `level=error` di log Grafana |

**Uid tetap.** Panel dan aturan menunjuk *data source* lewat uid, bukan lewat namanya. *Data source* buatan layar mendapat uid acak yang berbeda di setiap Grafana; berkas Modul 26 memberinya uid tetap `rumahpintar-db`, dan JSON dashboard (11 tempat) serta `node-diam.yaml` menunjuk uid itu. Hasilnya, semuanya langsung tersambung di Grafana mana pun, termasuk Grafana berlemari kosong di laptop teman ([11.3](#113--l2-layanan-bawaan-menyala-grafana-dari-berkas-dan-riwayat-contoh-8-menit)).

**Kenapa berkas Modul 25 tidak bisa dipasang apa adanya.** Ekspor JSON Modul 25 menulis *data source* sebagai `${DS_GRAFANA-POSTGRESQL-DATASOURCE}`, tempat kosong yang biasanya diisi layar **Import** dengan *data source* pilihanmu. *Provisioning* tidak bertanya, jadi tempat kosong itu terpasang apa adanya. Di proyek uji terpisah penulis (lemari kosong), dashboard-nya terpasang, tetapi variabel Node dan kelima panelnya bertanda segitiga merah (`Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found`) dan kosong (`No data`). YAML aturan Modul 25 lebih berbahaya: `datasourceUid`-nya uid acak *data source* layarmu, yang tidak ada di Grafana lain. Aturan itu galat, lalu Grafana mengirim 🔴 palsu (lab penulis, ke server Telegram tiruan): `🔴 [no value] ([no value]) tidak mengirim data, terlambat  menit dari jadwalnya`. Jebakan ketiga: *contact point* Telegram tanpa token membuat Grafana jatuh bangun (terus dimulai ulang) dengan `could not find Bot Token in settings`. Telegram tidak wajib sejak Modul 19, jadi bila `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` kosong, `compose.cloud.yml` memberi bawaan aman `belum-diisi` dan `0`: Grafana tetap menyala dan *alert* tetap tercatat, hanya kirimannya ke Telegram yang gagal.

![Tangkapan layar asli Grafana 13.2.4 bertema gelap di Chrome 156, Linux di Raspberry Pi 5 yang berperan sebagai laptop, 1280 piksel, dari PROYEK UJI terpisah dengan lemari kosong: di folder provisioning hanya berkas dashboard yang diganti ekspor Modul 25 apa adanya; aturan dan contact point tetap berkas Modul 26, Telegram server tiruan lab. Remah roti di atas: Dashboards, Rumah Pintar Mini, Kesehatan Sistem (nomor 5): dashboard-nya sendiri berhasil dipasang dari berkas ke folder Rumah Pintar Mini. Variabel Node di kiri atas bertanda segitiga merah dan kosong (nomor 1); pemilih waktu Last 6 hours WIB, Refresh 1m, Edit. Kelima panel, RSSI (kekuatan sinyal WiFi), Uptime (lama menyala), Heap (sisa memori), Paket Node 2 per jam (seharusnya 12), dan Menit terlambat dari jadwal, masing-masing punya segitiga merah di pojok kiri judulnya (nomor 2). Tetikus diarahkan ke segitiga panel RSSI dan muncul tooltip Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found (nomor 3). Di tengah panel tertulis No data (nomor 4), padahal kuerinya tidak pernah sampai ke database. Obatnya: setiap uid data source di JSON diganti rumahpintar-db, seperti berkas Modul 26.](aset/grafana-provisioning-salah.png)

**Rahasia tetap di `.env`.** Berkas *provisioning* ikut Git, jadi isinya hanya nama variabel: `password: $GRAFANA_BACA_SANDI`, `bottoken: $TELEGRAM_BOT_TOKEN`, `chatid: "$TELEGRAM_CHAT_ID"`. Nilainya mengalir dari `.env` ke `environment:` layanan `grafana`, lalu dibaca Grafana di dalam kontainer. Bentuknya `$NAMA`, bukan `${NAMA}`: menurut dokumentasi Grafana, bentuk berkurung bisa dibaca dua kali bila nilainya sendiri memuat `$`. Akun database `grafana_baca` diurus layanan sekali jalan `akun-grafana`: dibuat bila belum ada, lalu sandinya disamakan dengan `GRAFANA_BACA_SANDI` setiap `up`, jadi sandi baru yang acak pun boleh.

**"*Provisioned*" berarti terkunci di layar.** Aturan dan *contact point* dari berkas bertanda **Provisioned**, dan tombol **Edit** *contact point* berganti **View**. Dashboard tidak bertanda di daftarnya, tetapi **Save** ditolak dengan laci yang diawali "This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source." ([7.4](#74--docker-compose-up--d-provisioned-tombol-test-dan-save-yang-ditolak-10-menit)). *Data source*-nya pun terkunci (`editable: false`). Ini disengaja: berkas di Git menjadi satu-satunya sumber kebenaran. Mengubah sesuatu sesudah Modul 26: coba di layar, ekspor seperti 7.3 (a), timpa berkasnya di `grafana/`, `docker compose restart grafana`, lalu *commit*.

**Lemari lama: ambil alih dulu.** Lemari Modul 25-mu sudah berisi aturan `Node diam`, *contact point* `Telegram Rumah Pintar`, dan *data source* buatan layar. Kalau berkas dipasang begitu saja di atasnya, isi layar dan isi berkas tercampur: di prototipe riset penulis, *contact point* itu berisi dua integrasi Telegram, sehingga **setiap *alert* terkirim dua kali**. Karena itu [7.3](#73--ambil-alih-hapus-aturan-lalu-contact-point-lalu-data-source-lama-10-menit) mengerjakan **ambil alih** sekali, di Grafana yang masih berjalan:

1. **Alerting** (peringatan) → **Alert rules** (aturan peringatan): hapus aturan `Node diam`.
2. **Alerting** → **Notification configuration** (pengaturan kabar) → **Contact points**: hapus `Telegram Rumah Pintar`.
3. **Connections** (koneksi) → **Data sources** (sumber data): hapus `grafana-postgresql-datasource`.
4. `docker compose up -d` dengan `compose.cloud.yml` akhir: berkas memasang ketiganya kembali.

Urutannya penting karena aturan memakai *contact point*. Selama aturan masih ada, Grafana 13.2.4 menolak menghapus *contact point*: **Delete** di menu **More** abu-abu, dengan keterangan "Contact point is referenced by one or more alert rules" (lewat API: `409` `Receiver is used by 1 rule(s)`). **Notification policies** (kebijakan kabar) tidak perlu disentuh. Dashboard `Kesehatan Sistem` tidak dihapus: berkas mengambil alihnya tanpa membuat kembaran, asalkan uid dashboard di JSON sama dengan uid di lemari, yaitu ekspor Modul 25 milikmu sendiri (lab penulis: `admkvrq`; uid-mu berbeda). `Panel pertama` dari KC Modul 25 ikut kehilangan *data source*-nya ([7.4](#74--docker-compose-up--d-provisioned-tombol-test-dan-save-yang-ditolak-10-menit)). Di lab penulis, sesudah ambil alih, setiap node yang diam mendapat tepat satu 🔴 dan satu ✅.

**Sandi admin dan kunci Grafana.** `GRAFANA_ADMIN_SANDI` (diteruskan sebagai `GF_SECURITY_ADMIN_PASSWORD`) hanya dipakai saat lemari Grafana masih kosong, seperti `POSTGRES_PASSWORD` di Konsep 6: di lemari Modul 25, admin tetap masuk dengan sandi lamanya (lab penulis: sandi `.env` ditolak `401`). Jangan menambahkan `GF_SECURITY_SECRET_KEY`: lemari lamamu menyandikan sandi dan token dengan kunci bawaan Grafana, dan menurut dokumentasinya kunci itu tidak bisa diganti tanpa mengisi ulang semuanya.

**Dua arti *provisioning*.** Di Grafana: memasang isi Grafana dari berkas. Di [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#3-daftar-resmi-dan-provisioning-sederhana) dan Modul 28: menyiapkan perangkat baru beserta kunci dan haknya. Namanya sama, urusannya berbeda.

**Janji Modul 25 berubah.** YAML aturan yang dulu arsip kini pindah dari `grafana/alerting/node-diam.yaml` ke `grafana/provisioning/alerting/node-diam.yaml` dan benar-benar dipasang; satu-satunya perubahan isinya `datasourceUid: rumahpintar-db`.

![Diagram Grafana dirakit dari berkas, provisioning (Konsep 9, Praktik 7). Kiri, repo folder grafana/, ikut Git tanpa rahasia: datasources (rumahpintar-db, uid tetap, db:5432), dashboards (folder Rumah Pintar Mini, allowUiUpdates: false), dashboards/kesehatan-sistem.json (uid = ekspor Modul 25 milikmu), alerting/node-diam.yaml (datasourceUid: rumahpintar-db), kontak-telegram.yaml (token $TELEGRAM_BOT_TOKEN), plugins/tanpa-plugin.yaml, pengguna-grafana.sql (akun grafana_baca). Di bawahnya .env, tanpa Git: GRAFANA_BACA_SANDI, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (kosong: belum-diisi, 0), GRAFANA_ADMIN_SANDI hanya untuk lemari kosong. Tengah, docker compose up -d: akun-grafana sekali jalan menyamakan sandi grafana_baca dengan .env, grafana 13.2.4 memasang kedua folder hanya-baca. Kanan, hasil tanpa klik di lemari rumahpintar-grafana-data yang sama: data source rumahpintar-db, Database Connection OK; dashboard Kesehatan Sistem berisi data, Save ditolak: This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source; aturan Node diam Provisioned, Normal; contact point Telegram Rumah Pintar Provisioned, Used by 1 alert rules; admin sandi lama (200), GRAFANA_ADMIN_SANDI diabaikan (401). Tengah bawah, ambil alih sekali di Grafana hasil Praktik 4, sebelum provisioning dipasang: 1 hapus aturan Node diam (dashboard diubah sejak Modul 25? ekspor lagi dulu); 2 hapus contact point Telegram Rumah Pintar; 3 hapus data source lama grafana-postgresql-datasource (Panel pertama KC Modul 25 ikut rusak: hapus atau ganti data source-nya dulu); 4 docker compose up -d, berkas menggantikan aturan, contact point, dashboard. Urutan salah ditolak: di layar Delete contact point abu-abu, tooltip Contact point is referenced by one or more alert rules; API: 409 Receiver is used by 1 rule(s); tanpa ambil alih, setiap alert terkirim dua kali. Tidak dihapus: dashboard Kesehatan Sistem diambil alih bila uid di JSON-mu = uid di lemari (lab penulis admkvrq), JSON ber-uid lain bisa memunculkan dua dashboard senama; kebijakan notifikasi tetap bawaan. Bawah, jebakan: uid acak berkas mentah, panel merah Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found dan aturan 🔴 palsu; token kosong, Grafana jatuh bangun could not find Bot Token in settings; mengubah sesudah Modul 26: coba di layar, ekspor, timpa berkas, docker compose restart grafana, commit.](aset/grafana-dari-berkas.png)

> ⬆️ **Sudah membaca Konsep 9?** Lanjut ke [Praktik 7](#praktik-7--grafana-sebagai-berkas-provisioning-dan-akun-grafana_baca-sekali-jalan-40-menit). Urutan ambil alih di [7.3](#73--ambil-alih-hapus-aturan-lalu-contact-point-lalu-data-source-lama-10-menit) sama dengan urutan di gambar tadi.

### 10. Dua berkas sampai akhir: pusat dan gerbang

Silabus menjanjikan **dua berkas Compose yang dipakai sampai akhir**, dan proyekmu kini memilikinya. **Pusat** menjalankan otak rumah. **Gerbang** (*gateway*), istilah modul ini untuk Pi, menjalankan broker tempat perangkat masuk. Pembagiannya persis baris Modul 26 di tabel [Silabus §2.2](../../SILABUS.md#22-di-mana-otak-nya-berjalan-dari-waktu-ke-waktu): broker di Pi, otak di laptop, masih di jaringan rumah.

| | Pusat | Gerbang |
| :--- | :--- | :--- |
| Berkas, dinyalakan dari | `compose.cloud.yml`, akar proyek | `edge/compose.edge.yml`, folder `edge` |
| Proyek Compose | `rumahpintar` | `rumahpintar-gerbang` |
| Berjalan di | laptop (Modul 27: VPS) | Raspberry Pi, Kit B |
| Layanan bawaan | `db`, `akun-broker`, `mosquitto`, `migrasi`, `backend`, `web` (Caddy), `akun-grafana`, `grafana` | `mosquitto` (broker gerbang + jembatan) |
| Berprofil, mati | `uptime-kuma` (profil `pantau`) | `cloudflared` (profil `terowongan`), `nodered` (profil `nodered`) |

Itulah daftar Silabus: pusat = Mosquitto, API, database, Grafana, web dengan Caddy, dan Uptime Kuma; gerbang = Mosquitto dengan jembatan (*bridge*), cloudflared, dan Node-RED opsional. Grafana tetap di samping database: [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong) menyebut pemindahannya ke Pi "pekerjaan Modul 26–27", dan Grafana baru tinggal di Pi bila kamu memilih jalur gratis Modul 27, yang menjalankan seluruh pusat di Pi. Gerbang hanya memakai cetakan resmi multi-arsitektur, jadi Pi tidak memerlukan cetakan buatanmu.

**Profil: sakelar di dalam berkas.** Layanan bertanda `profiles:` sudah tertulis, tetapi mati sampai profilnya disebut:

```yaml
  uptime-kuma:
    image: louislam/uptime-kuma:2.5.8-slim
    profiles: ["pantau"]
    # …
```

`docker compose --profile pantau up -d` menyalakannya, `docker compose --profile pantau down` mematikan seluruh rumah, Uptime Kuma juga. Tanpa `--profile`, `down` membiarkan Uptime Kuma menyala, berikut lorongnya (`Resource is still in use`, lab penulis). Kenapa ditulis sekarang? Supaya kedua berkas lengkap sejak Modul 26 tanpa mengunduh atau menyalakan apa pun sebelum waktunya: Uptime Kuma baru diatur di [Modul 30](../../SILABUS.md#modul-30--monitoring-backup-runbook-tahu-lebih-dulu-tidak-pernah-kehilangan-data) (lab penulis: ±196 MiB RAM, tidak ditarik `docker compose pull` tanpa profilnya); cloudflared butuh token Cloudflare Modul 27 (`TUNNEL_TOKEN` sengaja kosong, profilnya tidak dinyalakan di modul ini); Node-RED tetap layanan systemd Modul 13 (pindah ke kontainer: [🔬](#-bedah-teknis-opsional)). [🧩 Tingkat 2](#tingkat-2--uptime-kuma-profil-pantau-dan-satu-monitor-lewat-nama-layanan-isi-bagian-rumpang-40-menit) menyalakan `pantau` dengan satu monitor; [🧩 Tingkat 3](#tingkat-3--simulator-dalam-kontainer-profil-simulasi-di-berkas-compose-tambahan-buat-dari-nol-6090-menit) membuat profil sendiri.

> [!NOTE]
> **Catatan istilah.** Silabus semula menulis bahwa kamu akan memahami "dua 'profil' yang akan dipakai sampai akhir". Yang dimaksud adalah dua berkas Compose ini, bukan fitur `profiles:` di atas. Karena keduanya mudah tertukar, Silabus v1.0.28 menulisnya "dua berkas Compose", dan modul ini memakai kata **profil** hanya untuk sakelar layanan.

**Jembatan LAN pertama.** Di jalur Kit B, Node 1 tetap menyambung ke IP Pi port 1883 dengan akun lamanya, jadi firmware tidak berubah; yang berganti hanya broker di Pi, dari paket apt menjadi kontainer. Datanya sampai ke backend di laptop lewat **jembatan** (*bridge*): broker gerbang membuka satu sambungan ke broker pusat sebagai klien berakun `jembatan-pi`, lalu meneruskan topik pilihan. Isi `edge/jembatan.contoh.conf` tanpa komentar (`# …` = baris sandi):

```text
connection pusat
address pusat:1883
remote_clientid jembatan-pi
remote_username jembatan-pi
# …
topic rpm/+/telemetry out 1
topic rpm/+/status out 1
topic rpm/+/vitals out 1
topic rpm/+/ack out 1
topic rpm/+/cmd in 1
```

- `out` = naik dari gerbang ke pusat, `in` = turun ke gerbang (perintah backend); `1` = QoS 1. Di broker pusat, blok `7) jembatan-pi` di `edge/acl-broker` mengizinkan akun itu menulis empat topik naik dan membaca `rpm/+/cmd` ([ACL Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#7-daftar-izin-acl-setiap-perangkat-di-topiknya-sendiri)); setiap perangkat tetap diperiksa broker gerbang dengan blok lamanya.
- Mosquitto tidak membaca variabel di `.conf`, jadi nama `pusat` diarahkan Compose ke IP laptop lewat `extra_hosts` `pusat:${ALAMAT_PUSAT}`. IP laptop bisa berganti, seperti di [mode HP Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop), dan jembatan pun putus: pesan alamat tetap di router seperti Pi di Modul 12.
- `remote_clientid` membuat nama klien jembatan tetap, walau kontainernya dibuat ulang. Salinan berisi sandi, `edge/jembatan/pusat.conf`, tidak ikut Git.

Di lab penulis, broker pusat mencatat `New bridge connected from <IP>:<port> as jembatan-pi (p4, c0, k60, u'jembatan-pi').`, dan perintah lampu yang dikirim lewat API melewati pusat, jembatan, dan gerbang, lalu kembali sebagai `ack` dalam 17 milidetik ([6.5](#65--nyalakan-gerbang-connecting-bridge-di-pi-dan-new-bridge-connected-di-laptop-10-menit), [6.6](#66--l4-node-1-masuk-dengan-akun-lama-data-live-di-dashboard-dan-ack-lampu-12-menit)).

**Batas jujur jembatan pertama.** Belum TLS: pesan dan sandi lewat WiFi tanpa enkripsi, dan port 8883 yang dijanjikan sejak Modul 11 menunggu Modul 27, jadi broker tidak boleh dibuka ke internet lewat *port forwarding*. Belum menahan data: jembatan menyambung ulang sendiri, tetapi telemetry yang dikirim selama pusat mati hilang (prototipe riset penulis); laptop tidur = bacaan Kit B tidak tercatat. Jembatan yang menyimpan lalu meneruskan pesan (*store-and-forward*) adalah inti Modul 27.

**Mosquitto 2.1.2 di kedua sisi.** Pi Modul 12 memakai Mosquitto 2.0.21 dari apt, laptop Windows dan macOS Modul 11 memakai 2.1.2. Broker 2.0 tidak bisa membaca berkas sandi buatan 2.1 (lab penulis: `Connection Refused: not authorised`), sedangkan 2.1.2 membaca keduanya. Karena itu pusat dan gerbang sama-sama memakai `eclipse-mosquitto:2.1.2-alpine`, dan gerbang memakai berkas sandi lama Pi apa adanya, disalin ke lemari datanya (6.4): Node 1 dan Node-RED masuk dengan akun lamanya.

**Mode rumah dan mode kembang.** Pusat menjalankan `backend` dan `web` di kontainer: **mode rumah**, di `http://localhost`. Saat mengubah kode, kamu memakai **mode kembang** seperti Modul 16–25 (`npm run dev` dan Vite) terhadap `db` dan broker pusat ([5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit)). Aturannya: **satu backend saja**. Pindah: `docker compose stop backend web`, lalu `npm run dev`. Kembali: **Ctrl + C**, lalu `docker compose start backend web`. Dua backend sekaligus saling menendang di broker (`session taken over`), dan Telegram menolak salah satunya dengan `409 Conflict` (lab penulis, Telegram tiruan: bot yang kalah tidak pulih sendiri).

**Sesudah Modul 26: tetap dua berkas ini.** Modul 27 memindahkan pusat ke VPS dengan domain dan HTTPS lewat Caddy, menaikkan jembatan ke TLS yang menahan data saat internet putus, dan memasang dashboard sebagai aplikasi di HP (PWA); jalur gratisnya menjalankan semuanya di Pi dengan Cloudflare Tunnel (profil `terowongan`). [Modul 29](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) membangun dan mendorong image secara otomatis untuk dua jenis prosesor. Modul 30 menyalakan Uptime Kuma dan cadangan otomatis. Caddyfile, `edge/*.conf`, `edge/acl-broker`, dan berkas *provisioning* Grafana (Konsep 9) hanyalah konfigurasi pendukung yang dipasang sebagai jendela, bukan berkas Compose ketiga.

![Diagram dua berkas sampai akhir, pusat dan gerbang (Konsep 10), juga keadaan proyek sesudah Modul 26. Kiri: Node 2 Kebun v1.0.0 lewat ESP-NOW ke Node 1 Rumah v1.6.0, firmware tidak berubah, tetap ke 192.168.1.37:1883 dengan akun lama. Gerbang Raspberry Pi 192.168.1.37: edge/compose.edge.yml, proyek rumahpintar-gerbang; mosquitto gerbang (eclipse-mosquitto:2.1.2-alpine, loket 1883 untuk perangkat, berkas gerbang.conf, acl-broker, jembatan/pusat.conf tanpa Git, lemari berisi berkas sandi lama Pi); pudar: cloudflared profil terowongan dan nodered profil nodered, mati; Node-RED systemd tetap, bukan kontainer; paket apt mosquitto dimatikan. Tengah, jembatan LAN polos 1883, belum TLS, akun jembatan-pi: keluar QoS 1 rpm/+/telemetry, status, vitals, ack; masuk QoS 1 rpm/+/cmd; remote_clientid jembatan-pi tetap; pusat mati = pesan hilang, menahan pesan Modul 27; ALAMAT_PUSAT di edge/.env = IP laptop. Kanan, laptop pusat 192.168.1.10: compose.cloud.yml, proyek rumahpintar, satu docker compose up -d; mosquitto pusat ke backend 1.3.0 ke db; web 1.2.0 Caddy ke backend; grafana 13.2.4 ke db; uptime-kuma profil pantau mati; sekali jalan akun-broker, migrasi, akun-grafana; lemari external rumahpintar-data dan rumahpintar-grafana-data. Tengah bawah: browser http://localhost dan :3000, HP lewat mode HP; Telegram lewat HTTPS keluar, token hanya di .env; satu backend saja, mode rumah atau mode kembang (stop backend web lalu npm run dev), dua backend saling menendang di broker. Bawah kiri, GitHub cabang fitur/docker-compose, pull request Seluruh sistem dalam Docker Compose, 16 baris berkas: Compose 9 layanan (uptime-kuma di profil pantau), .env.example, Dockerfile dan Caddyfile, backend 1.3.0 (99 tes lulus), frontend 1.2.0, provisioning Grafana, edge (compose.edge.yml, pusat.conf, jembatan, edge/.env.example, jembatan/README.md, acl-broker), sidik-jari.sql, .gitignore, templat PR; tetap kontrak data 1.4, firmware, migrasi. Tidak pernah ikut Git: .env, edge/.env, edge/jembatan/pusat.conf, backup/, isi lemari. Kanan bawah, menyusul: Modul 27 VPS, HTTPS, TLS MQTT 8883, jembatan menahan pesan; Modul 29 GitHub Actions, image multi-arsitektur; Modul 30 Uptime Kuma, backup otomatis, runbook. Jujur: laptop tidur = semuanya tidur; penebak sandi bisa mengunci semua tamu web; image hanya untuk arsitektur pembuatnya; Docker Desktop belum diuji.](aset/dua-berkas-pusat-gerbang.png)

> ⬆️ **Sudah membaca Konsep 10?** Kalau Konsep 5–8 juga sudah, kerjakan [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) sampai [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit) dalam satu duduk, lalu [Praktik 6](#praktik-6--gerbang-pi-kit-b-docker-engine-edgecomposeedgeyml-dan-jembatan-lan-70-menit-jalur-laptop-25-menit) (Kit B) atau [6.7](#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit) (jalur laptop).

### 11. Toko image: GHCR dan arsitektur

Silabus menyebut *registry* sebagai ["toko" tempat bungkusan disimpan](../../SILABUS.md#12-glosarium-mini-istilah-yang-muncul-di-silabus-ini). Cetakan resmi datang dari toko Docker Hub sejak Modul 17, tetapi dua cetakan buatanmu baru ada di laptopmu, jadi laptop teman harus membangunnya sendiri. **GHCR** (GitHub Container Registry, `ghcr.io`) adalah toko milik GitHub: kamu menitipkan (*push*) cetakan ke sana, dan orang lain mengambilnya (*pull*). Di Modul 26 semuanya dikerjakan dengan tangan ([Praktik 10](#praktik-10--toko-image-ghcr-manual-35-menit)); Modul 29 mengotomatiskannya.

**Alamat etalase.** Nama lengkap cetakan di toko, `ghcr.io/<akun-huruf-kecil>/rumah-pintar-mini-backend:1.3.0`, terdiri atas toko, etalasemu (nama akun GitHub dalam huruf kecil), nama cetakan, dan *tag*, yaitu versi di `package.json` (web: `rumah-pintar-mini-web:1.2.0`); tidak pernah `latest`. Compose menyusunnya dari `TOKO_IMAGE` di `.env` (Konsep 5). Isinya bukan rahasia: tulis di `.env.example` milikmu, supaya laptop teman langsung menarik image-mu. Huruf besar ditolak: `docker compose config --quiet` masih diam, tetapi `up` berhenti dengan `invalid reference format: repository name (…) must be lowercase` (lab penulis). Akun `Budi-Santoso` ditulis `ghcr.io/budi-santoso`.

**Kunci toko: PAT *classic*.** Menurut dokumentasi GitHub, GHCR hanya menerima *personal access token* (PAT) jenis *classic*, semacam sandi khusus untuk alat. Beri izin `write:packages` saja; bila halaman GitHub ikut mencentang `repo`, hapus centangnya. Pilih masa berlaku pendek, simpan di pengelola sandi, lalu `docker login ghcr.io -u <akun>` dan tempel token saat diminta ([10.1](#101-token-github-pat-classic-writepackages-tanpa-repo-7-menit)).

**Privat dulu, publik selamanya.** Paket pertama di GHCR selalu privat. Supaya laptop teman bisa menarik tanpa `docker login`, jadikan publik lewat **Package settings** → **Change visibility** → **Public**. Langkah ini satu arah ("Once you make a package public, you cannot make it private again."), dan cetakan publik bisa dibongkar siapa pun, jadi `.dockerignore` (Konsep 3) dan `docker history --no-trunc` ([10.3](#103-periksa-docker-history-lalu-jadikan-paketnya-publik-8-menit)) diperiksa dulu. Baris `LABEL org.opencontainers.image.source` di kedua `Dockerfile` menautkan paket ke repomu. Penyimpanan dan transfer GHCR **saat ini gratis**, publik maupun privat ([Silabus §5.5](../../SILABUS.md#55-biaya-layanan-fase-5)); GitHub berjanji memberi tahu setidaknya sebulan sebelum aturannya berubah.

**Satu cetakan, satu jenis prosesor.** Cetakan resmi berisi versi untuk beberapa arsitektur (Konsep 2), tetapi `docker build` hanya membuat cetakan untuk prosesor mesin yang membangunnya: laptop Intel atau AMD = `linux/amd64`; Mac Apple silicon, laptop Snapdragon, dan Pi 64-bit = `linux/arm64`. Cek mesinmu dengan `docker version --format '{{.Server.Arch}}'` (lab penulis: `arm64`). Cetakan buatan Pi atau Mac yang ditarik laptop Intel ditolak (lab penulis, `docker pull --platform linux/amd64` dari toko tiruan):

```text
Error response from daemon: no matching manifest for linux/amd64 in the manifest list entries: no match for platform in manifest: not found
```

Jalan keluarnya di Modul 26: teman yang prosesornya berbeda membangun sendiri dengan `docker compose up -d --build`, lebih lama dan butuh unduhan npm (belum diuji penulis di laptop amd64; [10.4](#104-arsitektur-arm64-lawan-amd64-dan-jalan-keluar-untuk-laptop-teman-7-menit)). Satu image untuk dua arsitektur dibuat otomatis di Modul 29; perintah manualnya diintip di [🔬](#-bedah-teknis-opsional).

**Yang direkam penulis.** Lab penulis memakai toko tiruan GHCR (`registry:3.1.2` di `127.0.0.1`, tanpa akun): mendorong kedua cetakan butuh 3,7 detik, dan uji laptop bersih yang menariknya (hangat: image resmi sudah ada) sampai di halaman **Masuk** dalam 62,3 detik ([11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit)). PAT, `docker login ghcr.io`, halaman paket, dan tarik tanpa *login* dari GHCR publik tidak direkam; nama menu GitHub diambil dari dokumentasinya.

![Diagram toko image dari laptopmu ke laptop teman (Konsep 11, Praktik 10–11). Atas, empat langkah: 1 laptopmu membangun, TOKO_IMAGE=ghcr.io/akun di .env (huruf kecil semua), docker compose build, hasil …/rumah-pintar-mini-backend:1.3.0 dan …-web:1.2.0, sebelum didorong periksa .dockerignore dan docker history --no-trunc tanpa sandi; 2 masuk ke toko, token PAT classic hanya write:packages (hapus centang repo bila ikut), masa berlaku pendek, docker login ghcr.io -u akun, docker compose push backend web; 3 GHCR, paket pertama selalu privat, Package settings, Change visibility, Public, TIDAK bisa dikembalikan, LABEL org.opencontainers.image.source menautkan paket ke repo, GHCR saat ini gratis, publik maupun privat; 4 laptop teman, git clone, .env dengan TOKO_IMAGE sama, docker compose up -d menarik image backend dan web tanpa login dan image resmi dari Docker Hub, tanpa Node.js dan tanpa build, bila prosesornya sama. Lab penulis: GHCR ditiru registry:3.1.2 di 127.0.0.1, docker compose push 3,7 s; login, halaman paket, dan GHCR publik tidak direkam. Tengah, cetakan dibuat untuk satu jenis prosesor: laptop Intel atau AMD linux/amd64; Mac Apple silicon dan Windows Snapdragon linux/arm64; Raspberry Pi OS 64-bit linux/arm64 (lab penulis: Pi 5 dengan Ubuntu 26.04); cek mesin docker version --format {{.Server.Arch}}, cek image docker image inspect --format {{.Os}}/{{.Architecture}}; image resmi TimescaleDB, Grafana, Mosquitto, Caddy multi-arsitektur. Image dibangun di Pi atau Mac (arm64) ditarik laptop Intel: docker pull --platform linux/amd64 gagal, Error response from daemon: no matching manifest for linux/amd64 in the manifest list entries: no match for platform in manifest: not found (direkam lawan registry tiruan). Obat di Modul 26: laptop teman membangun sendiri dengan docker compose up -d --build, butuh waktu dan unduhan npm, di laptop amd64 belum diuji penulis; satu image untuk dua arsitektur = Modul 29. Bawah: image: + build: di layanan yang sama, Compose menarik dulu, image belum ada di toko memberi peringatan lalu Compose membangun sendiri (terbukti), karena itu TOKO_IMAGE wajib dan tanpa bawaan, supaya Compose tidak menarik image orang lain yang bernama sama; galat sering: required variable TOKO_IMAGE is missing a value berarti baris .env belum diisi, invalid reference format … must be lowercase berarti nama akun harus huruf kecil.](aset/toko-image-dan-arsitektur.png)

> ⬆️ **Sudah membaca Konsep 11?** Lanjut ke [Praktik 10](#praktik-10--toko-image-ghcr-manual-35-menit) (opsional) dan [Praktik 11](#praktik-11--uji-laptop-bersih-45-menit). Kalau kamu membacanya lebih awal, kembalilah ke praktik yang sedang kamu kerjakan.

## 🔧 Praktik langkah demi langkah

Praktik 1–8 dan 11 wajib; Praktik 6 wajib untuk Kit B, sedangkan jalur laptop menggantinya dengan [5.5](#55--data-live-lewat-broker-pusat-simulator-kebun-tiruan-dan-tombol-lampu-7-menit) (dan, bila mau, [6.7](#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit)). Langkah bertanda ⭐ (1.2, 2.4, 3.4, 4.3, 4.4, 4.5, 5.3, 5.4, 5.5, 6.4, 6.5, 6.6, 7.3, 7.4, 8.1, 8.4, 11.2, 11.3, dan 11.4) adalah buktinya, ditambah [➕ E](#e--gabungkan-fiturdocker-compose-ke-main-lewat-pull-request-seluruh-sistem-dalam-docker-compose). Praktik 9 (cadangan) opsional tetapi sangat dianjurkan, dan Praktik 10 (toko image) adalah jalan yang disarankan supaya laptop teman cukup menarik image-mu. Yang juga boleh dilewati: bagian opsional 8.5 dan 9.4, 🔬, dan 🧩. Syarat lulus: **L1** di 11.2, **L2** di 11.3, **L3** di 8.4 dan 11.4, **L4** di 6.6 (jalur laptop: 5.5).

Semua `docker compose` pusat dijalankan dari **akar proyek** (folder `rumah-pintar-mini`, tempat `compose.cloud.yml` nanti berada); hanya Praktik 6 memakai folder `edge` di Pi. Sebelum 1.2 rumahmu berjalan dalam mode kembang (`npm run dev`); sejak 5.3 mode rumah, dan cara berpindah ada di 5.6. Praktik yang mengubah berkas diakhiri *commit*; cabang `fitur/docker-compose` di-*push* ke GitHub di 6.2 (supaya Pi bisa mengambil berkas gerbang) dan 11.1 (sebelum uji laptop bersih), lalu digabung ke `main` lewat *pull request* di ➕ E. Pembanding: [`kode/tahap/`](kode/tahap/) berisi `compose.cloud.yml` di akhir Praktik 4 dan 5, dan [`kode/`](kode/) berisi hasil akhirnya (dengan `backend-1.3.diff` dan `frontend-1.2.diff`). Jangan menimpa seluruh foldermu dengannya.

> [!IMPORTANT]
> **Pindahan: rumah lama berhenti di 1.2 dan baru menyala lagi di [5.3](#53--satu-perintah-menyalakan-seluruh-rumah-docker-compose-up--d---build-dan-ps--a-10-menit)** (jalur perangkat: data Node 1 baru sampai ke backend lagi di 6.6). Selama itu bacaan tidak tercatat, dan aturan Grafana lama mengirim 🔴 "Node diam" sungguhan. Itu wajar; ✅ datang sendiri sesudah data kembali (terbukti di lab penulis). Praktik 2 dan 3 tidak butuh rumah mati, jadi cicil begini: **1.1 → Praktik 2 → Praktik 3** (rumah lama tetap menyala), lalu **1.2–1.4 → Praktik 4 → Praktik 5 dalam satu duduk**, ±2,5 jam.

### Praktik 1 — Meja kerja dan sidik jari data lama (20 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal di **akar proyek** (Git dan `docker`) serta terminal `backend`, `frontend`, dan (jalur laptop) `alat` dari rumah lama; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana` menyala; **Chrome** atau **Edge** (Grafana `http://localhost:3000`); **Telegram**. Konsep yang dipakai: 1 dan 6.
>
> ⭐ **Wajib** — langkah 1.2: baris sidik jari riwayat tersimpan di catatanmu, diambil sesudah backend (dan simulator) berhenti.

#### 1.1 Cabang `fitur/docker-compose` dan rencana pindahan (3 menit)

Di terminal akar proyek, ambil `main` terbaru, lalu buat cabang untuk seluruh pekerjaan Modul 26:

```text
git switch main
git pull
git switch -c fitur/docker-compose
```

**Hasilnya** (baris terakhir): `Switched to a new branch 'fitur/docker-compose'`. `git status` sesudahnya harus bersih. Rencana pindahan: kotak **Pindahan** di atas; sisihkan ±2,5 jam tanpa jeda untuk 1.2 sampai Praktik 5.

> ➡️ **Berhenti di sini dulu.** Rumah lamamu tetap menyala selama kamu membuat dua cetakan: baca Konsep 2–4, kerjakan [Praktik 2](#praktik-2--cetakan-backend-130-45-menit) dan [Praktik 3](#praktik-3--cetakan-web-120-vite--caddy-45-menit), lalu baca Konsep 5–8 dan [Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) sebelum kembali ke [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit).

#### 1.2 ⭐ Hentikan penulis data, lalu ambil sidik jari riwayat dengan `skrip/sidik-jari.sql` (8 menit)

Yang menulis bacaan ke database hanya backend. Tekan **Ctrl + C** di:

1. terminal `backend` (`npm run dev`) → `SIGINT diterima: backend berhenti dengan rapi` (lab penulis; di Windows tidak muncul, Modul 19 6.10);
2. terminal `frontend` (Vite): tanpa backend, dashboard lama tidak berguna;
3. jalur laptop: terminal `alat` (simulator dan Kebun tiruan). Kit B: Node 1 dan broker Pi boleh tetap menyala.

`rumahpintar-db` dan `rumahpintar-grafana` **tetap menyala**: keduanya yang diperiksa. Di Explorer VS Code, buat folder **`skrip`** di akar proyek (**New Folder…**), lalu berkas **`sidik-jari.sql`** di dalamnya (**New File…**), tempel isi ini, dan simpan (**Ctrl + S**):

```sql
-- sidik-jari.sql - "sidik jari" riwayat Rumah Pintar Mini (Modul 26): satu baris angka untuk membuktikan bahwa riwayat
-- di database TIDAK hilang dan TIDAK berubah sesudah dipindah ke Docker Compose (Praktik 1 dan 4) atau sesudah
-- "docker compose down" lalu "up" (Praktik 8). Dasarnya kueri Modul 18 Praktik 7.2, ditambah jumlah akun dan perangkat.
--
-- Jalankan SEBELUM dan SESUDAH, dengan backend dan simulator mati (tidak ada bacaan baru di antaranya), dari akar proyek.
-- Simpan keluarannya ke berkas, lalu bandingkan:
--   Linux, macOS, Pi (bash/zsh):
--     docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
--   PowerShell (Windows; tidak diuji penulis):
--     Get-Content skrip/sidik-jari.sql | docker compose exec -T db psql -U postgres -d rumahpintar
--   Sebelum Modul 26 (kontainer lama rumahpintar-db): ganti "docker compose exec -T db" dengan "docker exec -i rumahpintar-db".
-- (-T / -i = isi berkas ini dikirim ke psql lewat masukan standar, tanpa layar terminal di kontainer.)
--
-- Yang menentukan: kolom bacaan dan sidik_jari HARUS sama persis (juga akun dan perangkat). Kolom ringkasan boleh
-- berbeda tanpa ada data yang hilang: tugas latar TimescaleDB (lihat kolom tugas) bisa meringkas ulang buku ringkasan per
-- jam di antara dua pengukuran.
SELECT (SELECT count(*) FROM readings) AS bacaan,
       (SELECT md5(string_agg(md5(r::text), '' ORDER BY r.device_id, r.ts)) FROM readings AS r) AS sidik_jari,
       (SELECT count(*) FROM readings_per_jam) AS ringkasan,
       (SELECT count(*) FROM show_chunks('readings')) AS jilid,
       (SELECT count(*) FROM timescaledb_information.jobs WHERE job_id >= 1000) AS tugas,
       (SELECT count(*) FROM users) AS akun,
       (SELECT count(*) FROM devices) AS perangkat;
```

Lima kolom pertama = kueri bukti [Modul 18 7.2](../../fase-3-backend-data/modul-18-timescaledb/README.md#72-sidik-jari-database-asli): `bacaan` (jumlah baris `readings`), `sidik_jari` (md5 seluruh baris, urut perangkat dan waktu; satu angka berubah, sidik jarinya lain), `ringkasan`, `jilid`, dan `tugas`. Kolom baru: `akun` dan `perangkat` (semua baris `devices`). Sebelum Compose, jalankan dari terminal akar proyek (bash/zsh: Linux, macOS):

```text
docker exec -i rumahpintar-db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

`<` mengirim isi berkas ke `psql` lewat `-i`. PowerShell (tidak diuji penulis):

```text
Get-Content skrip/sidik-jari.sql | docker exec -i rumahpintar-db psql -U postgres -d rumahpintar
```

**Hasilnya** (lab penulis; angkamu pasti berbeda):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2318 | aa2aa442bf9868ca730b42ccab4cffba |       379 |     9 |     3 |    2 |         3
(1 row)
```

Di lab: 2 × 1132 riwayat contoh + 54 bacaan simulator, akun admin dan viewer, tiga perangkat. Salin judul kolom dan barisnya (bukan dengan `>`) ke `belajar-iot/modul-26/sidik-jari.md`, dengan judul "Sebelum pindah" dan jamnya (WIB).

Nanti yang menentukan: `bacaan`, `sidik_jari`, `akun`, dan `perangkat` **sama persis**. `ringkasan` boleh berubah tanpa data hilang, karena tugas latar TimescaleDB bisa meringkas ulang buku ringkasan per jam di antaranya (lab penulis: 379 menjadi 145, tanpa satu bacaan pun hilang). Baris ini hanya dibandingkan di [4.5](#45--sidik-jari-sesudah-sama-dengan-sebelum-lalu-periksa-grafana-di-lemari-yang-sama-12-menit). Jangan melewati pukul 07.00 WIB sebelum 4.5: retensi harian Modul 18 bisa membuang jilid lama. `skrip/` baru di-*commit* di 4.6.

**Kamu lulus langkah ⭐ ini** kalau backend (dan simulator) sudah berhenti, dan baris sidik jari lengkapnya tersimpan di `sidik-jari.md`.

#### 1.3 Sidik jari Grafana: dashboard, aturan, *contact point*, dan tombol Test (5 menit)

Di Chrome, buka `http://localhost:3000`, masuk sebagai `admin` dengan sandi lamamu, lalu catat di `sidik-jari.md`:

- **Dashboards**: `Kesehatan Sistem` (folder `Rumah Pintar Mini`) dan `Panel pertama` (KC Modul 25).
- **Alerting → Alert rules**: `Node diam` di grup `kesehatan-node`, `Normal` atau sudah `Firing` (wajar, lihat di bawah).
- **Alerting → Notification configuration → Contact points**: `Telegram Rumah Pintar`.
- **Connections → Data sources**: `grafana-postgresql-datasource`.

Di baris `Telegram Rumah Pintar`, klik **Edit** → **Test** → **Send test notification**, dan catat jamnya.

**Hasilnya:** `Test notification sent successfully`, lalu `🔴 Notification test` tiba dari bot-mu (lab penulis: sedetik kemudian di server Telegram tiruan). Sekitar enam menit sesudah backend berhenti, 🔴 tiba untuk setiap perangkat (lab penulis, Telegram tiruan):

```text
🔴 Latihan ruang tamu (f00d00000001) tidak mengirim data, terlambat 5.9 menit dari jadwalnya
```

Itu tanda pindahan. Catatan Grafana ini dibandingkan lagi di 4.5 dan 7.4.

#### 1.4 Ruang disk dengan `docker system df`, tanpa *prune* (4 menit)

```text
docker system df
```

**Hasilnya** (lab penulis, contoh; mesinnya berisi sisa lab lain):

```text
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          9         5         7.259GB   6.038GB (83%)
Containers      10        5         401.4kB   176.1kB (43%)
Local Volumes   36        11        436MB     215.6MB (49%)
Build Cache     94        0         1.99GB    572.3MB
```

`RECLAIMABLE` hanya perkiraan Docker tentang yang bisa dibuang. Modul ini tidak pernah memakai *prune* (aturan aman nomor 3); barang lama dihapus satu per satu dengan namanya. Lalu periksa sisa disk: `df -h /` (Linux, macOS; kolom `Avail`) atau File Explorer → **This PC** (Windows, tidak direkam penulis). Perlu ±6 GB kosong; catat keduanya.

> ⬆️ **Selesai Praktik 1?** Sidik jarimu tercatat dan rumah lama sedang berhenti: lanjut langsung ke [Praktik 4](#praktik-4--lemari-pindah-database-dan-grafana-ke-compose-tanpa-kehilangan-data-50-menit). Belum mengerjakan Praktik 2 dan 3 (tepat di bawah)? Kerjakan sekarang; keduanya tidak memakai database.

### Praktik 2 — Cetakan backend 1.3.0 (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal `backend` dari rumah lama (boleh tetap menyala; sesudah 1.2 biarkan mati), satu terminal kosong di folder **`backend`** untuk `npm` dan Git (klik kanan folder `backend` → **Open in Integrated Terminal**), dan terminal di **akar proyek** untuk `docker`; **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux); internet untuk `npm`. Praktik ini tidak menyentuh database. Konsep yang dipakai: 2, 3, dan 4.
>
> ⭐ **Wajib** — langkah 2.4: cetakan `rumah-pintar-mini-backend:1.3.0` terbangun dari akar proyek, ukurannya tampil di `docker image ls`, dan `docker history --no-trunc` tidak memuat sandi atau token.

Backend naik ke **1.3.0** dengan tiga perubahan kecil, tanpa migrasi dan tanpa paket npm baru, lalu dikemas menjadi cetakan pertamamu. Keadaan akhirnya: [`kode/backend/`](kode/backend/); semua perubahannya: [`kode/backend-1.3.diff`](kode/backend-1.3.diff). **Cara menyalin:** ketik potongan yang ditampilkan, atau buka berkas bernama sama di `kode/backend/` di GitHub, klik **Copy raw file**, lalu tempel menggantikan isinya. Backend lama yang masih menyala (`npm run dev`) memulai ulang sendiri setiap kali berkas `src/` disimpan; biarkan.

#### 2.1 Backend 1.3.0: `pino-pretty` pindah, skrip npm tanpa `.env` wajib, dan log tanpa `/health` (10 menit)

**(a) `pino-pretty` ke `dependencies`.** Perapi log ini dipakai saat server berjalan, jadi tidak boleh tertinggal di dapur ([Konsep 4](#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy)). Di terminal kosong (folder `backend`):

```text
npm install --save-prod pino-pretty@13.2.0
```

**Hasilnya** (lab penulis):

```text
npm warn idealTree Removing devDependencies.pino-pretty in favor of dependencies.pino-pretty

up to date, audited 226 packages in 5s

56 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

`npm warn` itu yang kita minta: `pino-pretty` pindah blok. `up to date` = tidak ada yang diunduh. Di `package-lock.json`, 12 baris `"dev": true` hilang (`pino-pretty` dan 11 library pembantunya kini ikut produksi), tanpa satu versi pun berubah.

**(b) Empat skrip tanpa `.env` wajib** ([Konsep 3](#3-resep-cetakan-dockerfile-dan-dockerignore)). Buka `backend/package.json`. Di blok `"scripts"`, ganti `--env-file=.env` menjadi `--env-file-if-exists=.env` pada `start`, `migrasi`, `isi-riwayat`, dan `pengguna`, lalu simpan (**Ctrl + S**). `dev` **tetap** `--env-file=.env` karena mode kembang memang wajib punya `.env`. Hasilnya:

```json
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.ts",
    "start": "node --env-file-if-exists=.env src/server.ts",
    "cek": "tsc --noEmit",
    "migrasi": "node --env-file-if-exists=.env src/db/migrasi.ts",
    "isi-riwayat": "node --env-file-if-exists=.env src/db/isi-riwayat.ts",
    "pengguna": "node --env-file-if-exists=.env src/db/kelola-pengguna.ts",
    "test": "vitest run"
  },
```

**(c) Log tanpa ketukan `/health`.** Di Compose, pemeriksaan kesehatan mengetuk `HEAD /health` setiap 15 detik ([Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log)): 5.760 baris yang sama setiap hari, dan baris penting tenggelam. Ganti isi `src/services/log.ts` dengan [`kode/backend/src/services/log.ts`](kode/backend/src/services/log.ts) (**Copy raw file**). Yang baru hanya fungsi murni di akhirnya, di bawah empat baris komentar "mengapa":

```ts
// …
export function perluDicatat(metode: string, alamat: string, kode: number): boolean {
  const jalur = alamat.split("?")[0]; // tanpa ?… di belakangnya
  const ketukanKesehatan = (metode === "GET" || metode === "HEAD") && jalur === "/health";
  return !(ketukanKesehatan && kode < 400);
}
```

`/health` yang **gagal** tetap tercatat supaya masalahnya terlihat. Pemakainya satu baris di *hook* `onResponse`. Ganti isi `src/server.ts` dengan [`kode/backend/src/server.ts`](kode/backend/src/server.ts) (**Copy raw file**); yang berubah hanya komentar kepala, impor, satu baris di *hook* (dan dua baris komentarnya), serta keterangan dan `version: "1.3.0"` di `/docs`:

```ts
import { pakaiLog, perluDicatat } from "./services/log.ts";
// …
app.addHook("onResponse", async (req, reply) => {
  // …
  if (!perluDicatat(req.method, req.url, reply.statusCode)) return;
  req.log.info(`${req.method} ${req.url} -> ${reply.statusCode} (${Math.round(reply.elapsedTime)} ms)`);
});
```

Dua berkas lagi lewat **Copy raw file**: [`src/services/log.test.ts`](kode/backend/src/services/log.test.ts) (BARU: klik kanan `src/services` → **New File…**; 3 tes untuk aturan tadi, termasuk alamat mirip seperti `/healthz`) dan [`src/auth/keamanan.ts`](kode/backend/src/auth/keamanan.ts) (hanya komentar `RUTE_TERBUKA` yang diperbarui).

**Nomor versi dan tes.** Di terminal kosong, satu per satu:

```text
npm pkg set version=1.3.0
```

```text
npm install
```

`npm pkg set` tidak mencetak apa pun dan hanya mengubah `package.json`; `npm install` menyamakan `package-lock.json` (tanpanya, berkas itu di lab penulis masih bertuliskan `1.2.0` di dua tempat). **Hasilnya:** `up to date, audited 226 packages in 5s` … `found 0 vulnerabilities`. Lalu:

```text
npm run cek
```

```text
npm test
```

**Hasilnya** (lab penulis, dipotong):

```text
> rumah-pintar-mini-backend@1.3.0 cek
> tsc --noEmit
```

```text
 Test Files  15 passed (15)
      Tests  99 passed (99)
```

Backend 1.2.0 berisi 14 berkas / 96 tes; tambahannya 3 tes `log.test.ts`. Ada yang merah? Bandingkan berkasmu dengan `kode/backend/`.

#### 2.2 `.dockerignore`: rahasia dan `node_modules` tidak ikut cetakan (5 menit)

Di Explorer, klik kanan folder **`backend`** → **New File…**, beri nama **`.dockerignore`** (diawali titik, tanpa ekstensi), isi dengan berkas ini (**Copy raw file** dari [`kode/backend/.dockerignore`](kode/backend/.dockerignore)), lalu simpan:

```text
# .dockerignore - berkas yang TIDAK ikut dikirim ke docker build (Modul 26). Image yang dibagikan (GHCR publik) bisa dibongkar
# siapa pun, lapis demi lapis: rahasia tidak boleh masuk, bahkan ke tahap yang nanti dibuang.
# Library hasil npm install di laptop: tidak pernah disalin ke image (Dockerfile memasang sendiri: npm ci --omit=dev);
# dikecualikan supaya konteks build tetap kecil.
node_modules
# Rahasia mode kembang (.env) dan salinannya; hanya contohnya (.env.example) yang boleh.
.env
.env.*
!.env.example
# Fotokopi database, koleksi Bruno, uji beban, dan berkas uji curl Modul 20 (berisi sandi dan cookie).
backup
bruno
uji
login*.json
kue*.txt
# Berkas uji Vitest tidak dipakai server yang berjalan.
src/**/*.test.ts
```

Bentuknya seperti `.gitignore`: satu pola per baris, `#` komentar, `!` pengecualian. Letaknya di folder `backend`, folder yang dikirim sebagai konteks *build* di 2.4. Tiga kelompok yang ditahan, alasannya di [Konsep 3](#3-resep-cetakan-dockerfile-dan-dockerignore): `node_modules` laptopmu (dibuat ulang di dalam cetakan), semua yang berisi sandi, token, atau *cookie* (`.env`, `backup`, `bruno`, `uji`, `login*.json`, `kue*.txt`), dan berkas uji Vitest. `.env` tetap di laptopmu untuk mode kembang, hanya tidak masuk cetakan.

#### 2.3 `Dockerfile` dua tahap, blok demi blok (10 menit)

Klik kanan **`backend`** → **New File…**, beri nama **`Dockerfile`** (D besar, tanpa ekstensi), isi (**Copy raw file** dari [`kode/backend/Dockerfile`](kode/backend/Dockerfile)), lalu simpan:

```dockerfile
# Dockerfile - cetakan (image) backend Rumah Pintar Mini 1.3.0 (Modul 26). Dua tahap ("multi-stage"):
#   tahap "paket": memasang library npm persis menurut package-lock.json, TANPA alat pengembang (TypeScript, Vitest, Vite)
#   tahap akhir  : Node.js 24 + library dari tahap "paket" + kode src/ dan migrasi/, berjalan sebagai pengguna "node" (bukan root)
# Tidak ada tahap kompilasi: Node 24 menjalankan berkas .ts langsung (type stripping, Modul 16).
# Dibangun dari folder proyek dengan: docker compose build backend   (atau: docker build -t rumah-pintar-mini-backend:1.3.0 ./backend)

# Tag persis, bukan "latest" atau "24-alpine": cetakan yang sama hari ini dan bulan depan. Alpine = image Node terkecil;
# bcrypt membawa versi siap pakai untuk Alpine (musl), jadi tidak perlu kompiler.
FROM node:24.22.1-alpine3.24 AS paket
WORKDIR /app
# package*.json disalin LEBIH DULU daripada kode: selama daftar library tidak berubah, lapisan "npm ci" diambil dari cache
# dan build ulang sesudah mengubah kode hanya beberapa detik.
COPY package.json package-lock.json ./
# --omit=dev: alat pengembang tidak ikut. Sejak 1.3.0, pino-pretty ada di "dependencies" karena dipakai saat server berjalan
# (tanpa itu server di kontainer mogok: unable to determine transport target for "pino-pretty"). Cache npm tidak perlu
# dibersihkan: tahap ini dibuang, hanya folder node_modules yang dibawa ke tahap akhir.
RUN npm ci --omit=dev

FROM node:24.22.1-alpine3.24
# Menautkan image di GHCR ke repositori GitHub-mu (Modul 26 Praktik 10). Ganti <akun> dengan nama akun GitHub-mu (huruf
# kecil) dan rumah-pintar-mini dengan nama repositorimu bila berbeda. Tanpa label ini, paket di GHCR tidak tertaut ke repo.
LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=paket /app/node_modules ./node_modules
COPY package.json ./
COPY migrasi ./migrasi
COPY src ./src
# Pengguna "node" (uid 1000) sudah tersedia di image node. Server tidak butuh hak root: kalau ada celah, kerusakannya lebih kecil.
USER node
# Hanya catatan "server ini mendengar di 8080 di dalam kontainer". Loket di laptop diatur compose.cloud.yml (ports).
EXPOSE 8080
# Bentuk daftar (exec), bukan "npm start": sinyal berhenti dari Docker (SIGTERM) langsung sampai ke Node, jadi backend
# berhenti dengan rapi. Tanpa --env-file: di kontainer, setelan datang dari Docker Compose (environment), bukan dari .env.
CMD ["node", "src/server.ts"]
```

Baca komentarnya dari atas ke bawah. Yang perlu kamu tangkap:

- **Dua `FROM`, dua tahap.** `FROM … AS paket` adalah dapur: hanya `package.json`, `package-lock.json`, dan `npm ci --omit=dev`. `FROM` kedua adalah meja saji, mulai lagi dari cetakan dasar yang bersih; karena tanpa nama, di log *build* ia tertulis `stage-1`.
- **`COPY --from=paket`** mengambil `node_modules` hasil dapur; sisa dapur tidak ikut. Sesudahnya `package.json`, `migrasi/`, dan `src/`: yang paling sering berubah paling bawah ([Konsep 2](#2-cetakan-berlapis-image-tag-digest-dan-arsitektur)).
- **`LABEL … <akun>`** biarkan apa adanya. [10.2](#102-docker-login-ghcrio-lalu-docker-compose-build-dan-push-13-menit) menggantinya dengan nama akun GitHub-mu (huruf kecil); sampai saat itu label ini tidak mengganggu apa pun.
- **`ENV NODE_ENV=production`** (anjuran panduan resmi `node`), **`USER node`**, **`EXPOSE 8080`**, dan **`CMD`**: alasannya di Konsep 3.
- **Yang tidak ada:** `.env`, sandi, `HEALTHCHECK` (di Compose saja), dan `npm cache clean --force` (*cache* npm ikut terbuang bersama dapur).

#### 2.4 ⭐ `docker build`, ukuran image, dan `docker history` tanpa rahasia (10 menit)

Di terminal **akar proyek** (folder `rumah-pintar-mini`):

```text
docker build -t rumah-pintar-mini-backend:1.3.0 ./backend
```

`-t` memberi nama dan *tag* (= versi di `package.json`); `./backend` adalah konteks *build*, folder tempat `Dockerfile` dan `.dockerignore`. Cetakan dasar `node:24.22.1-alpine3.24` sudah kamu unduh di [🧰](#-yang-perlu-disiapkan), jadi yang diunduh hanya library npm.

**Hasilnya** (lab penulis, dipotong). Mesin penulis masih menyimpan lapisan uji sebelumnya, jadi *build* pertama diukur dengan tambahan `--no-cache`; laptopmu mengerjakan langkah yang sama:

```text
[+] Building 44.7s (13/13) FINISHED                                                                       docker:default
 => [internal] load build context                                                                                    0.1s
 => => transferring context: 336.77kB                                                                                0.1s
 => [paket 3/4] COPY package.json package-lock.json ./                                                               0.3s
 => [paket 4/4] RUN npm ci --omit=dev                                                                               24.6s
 => [stage-1 3/6] COPY --from=paket /app/node_modules ./node_modules                                                 3.3s
 => [stage-1 6/6] COPY src ./src                                                                                     0.1s
 => exporting to image                                                                                              13.2s
 => => naming to docker.io/library/rumah-pintar-mini-backend:1.3.0                                                   0.0s
```

Seluruhnya ±45 detik di Pi 5 penulis, lebih dari separuhnya `npm ci`. `transferring context: 336.77kB` = kiriman yang sudah disaring `.dockerignore`. Baris `npm notice New major version of npm available! 11.19.1 -> 12.2.1`, bila muncul, abaikan: jangan memperbarui npm di dalam cetakan. Jalankan perintah yang sama sekali lagi: semua langkah `CACHED`, selesai dalam ±2 detik (lab: 1,9 s).

Lalu lihat ukurannya:

```text
docker image ls rumah-pintar-mini-backend
```

**Hasilnya** (lab penulis, arm64, dipotong; contoh):

```text
IMAGE                             ID             DISK USAGE   CONTENT SIZE   EXTRA
rumah-pintar-mini-backend:1.3.0   13aa9992d8ac        313MB         71.9MB
```

313 MB di disk, 71,9 MB diunduh, seperti tabel Konsep 4; nama kolomnya bisa lain di versi Docker lain. Terakhir, baca resep yang terekam di cetakan, utuh:

```text
docker history --no-trunc rumah-pintar-mini-backend:1.3.0
```

Kolom `CREATED BY` berisi setiap langkah resep. Cari sandi, token, atau isi `.env` di baris `ENV`, `ARG`, `LABEL`, dan `RUN`. Dari resepmu hanya ada `ENV NODE_ENV=production` dan `LABEL` dengan `<akun>`; baris-baris terbawah milik cetakan dasar `node`. Perhatikan juga: tidak ada `RUN npm ci` karena langkah itu milik dapur yang dibuang; yang tersisa hasilnya, `COPY /app/node_modules ./node_modules`. Di lab penulis, 20 baris `docker history --no-trunc` backend dicocokkan dengan semua sandi dan token lab: tidak satu pun muncul.

**Kamu lulus langkah ⭐ ini** kalau `docker build` selesai tanpa galat, `docker image ls` menampilkan `rumah-pintar-mini-backend:1.3.0` dengan ukurannya, dan `docker history --no-trunc` tidak memuat sandi, token, atau isi `.env`.

#### 2.5 Cetakan tanpa rahasia: `docker run` yang menolak menyala, lalu pengguna `node` (10 menit)

Nyalakan cetakannya tanpa setelan apa pun (`--rm` = kontainer dihapus begitu berhenti):

```text
docker run --rm rumah-pintar-mini-backend:1.3.0
```

**Hasilnya** (lab penulis; kode keluar 1):

```text
Setelan MQTT_URL di .env: belum diisi
Setelan DATABASE_URL di .env: belum diisi
Setelan JWT_SECRET di .env: belum diisi
Salin .env.example menjadi .env (atau buka .env-mu), perbaiki setelan di atas, lalu jalankan lagi.
```

Ini tanda **baik**: cetakan tidak membawa rahasia, jadi backend berhenti di pemeriksa setelan [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#12-periksa-env-dengan-zod-10-menit). Pesannya menyebut `.env` karena ditulis untuk mode kembang; di kontainer, setelan datang dari Compose ([Konsep 3](#3-resep-cetakan-dockerfile-dan-dockerignore)). Kodenya sengaja tidak diubah.

Seandainya `pino-pretty` tetap di `devDependencies`, setelan lengkap pun tidak menolong: begitu Fastify membuat pencatat lognya, Node berhenti. Bukti dari cetakan pembanding penulis (`package.json` dan `package-lock.json` 1.2; dipotong), cukup dibaca:

```text
Error: unable to determine transport target for "pino-pretty"
    at fixTarget (/app/node_modules/pino/lib/transport.js:295:13)
```

`--entrypoint` mengganti program yang dijalankan cetakan, sekali ini saja; `id` menyebut penggunanya:

```text
docker run --rm --entrypoint id rumah-pintar-mini-backend:1.3.0
```

**Hasilnya:** `uid=1000(node) gid=1000(node) groups=1000(node),1000(node)`, bukan root. Lalu intip isi folder kerjanya:

```text
docker run --rm --entrypoint ls rumah-pintar-mini-backend:1.3.0 -a /app
```

**Hasilnya** (lab penulis, dibangun dari salinan yang punya `backend/.env` dan `node_modules`): hanya `.`, `..`, `migrasi`, `node_modules`, `package.json`, dan `src`. Tidak ada `.env`: `.dockerignore` bekerja. Nama tanpa awalan ini hanya untuk uji; di [5.2](#52-composecloudyml-tahap-kedua-migrasi-backend-web-dan-toko_image-di-env-15-menit), Compose membangun cetakan yang sama dengan nama berawalan `TOKO_IMAGE`.

**Simpan ke cabang.** Di terminal folder `backend` (cabang `fitur/docker-compose`):

```text
git add package.json package-lock.json src Dockerfile .dockerignore
```

```text
git commit -m "Backend 1.3.0: cetakan Docker dua tahap, pino-pretty di dependencies, log tanpa /health (Modul 26 Praktik 2)"
```

> ⬆️ **Selesai Praktik 2?** Lanjut ke [Praktik 3](#praktik-3--cetakan-web-120-vite--caddy-45-menit): cetakan kedua, untuk dashboard.

### Praktik 3 — Cetakan web 1.2.0: Vite → Caddy (45 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal `frontend` dari rumah lama (Vite boleh tetap menyala) dan satu terminal kosong di folder **`frontend`** untuk `npm`, `docker`, dan Git (klik kanan folder `frontend` → **Open in Integrated Terminal**); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux); **Chrome** atau **Edge**; internet untuk `npm`. Praktik ini juga tidak menyentuh database. Konsep yang dipakai: 4 dan 7.
>
> ⭐ **Wajib** — langkah 3.4: cetakan `rumah-pintar-mini-web:1.2.0` menyala sendirian di loket 8088, lalu menjawab `200` untuk `/` dan `/peta`, `404` untuk aset yang tidak ada, dan `502` untuk `/api/health`.

Dashboard naik ke **1.2.0**: tiga baris kode, tiga berkas baru, tanpa paket npm baru. Keadaan akhirnya: [`kode/frontend/`](kode/frontend/); semua perubahannya: [`kode/frontend-1.2.diff`](kode/frontend-1.2.diff). Cara menyalinnya sama dengan Praktik 2.

#### 3.1 Frontend 1.2.0: tiga baris `soket.ts`, lalu *lint*, *build*, dan `cek-skema` (10 menit)

Di cetakan web, dashboard memanggil API di jalur `/api` pada alamat halamannya sendiri ([Konsep 4](#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy)). Untuk `fetch` itu cukup, tetapi Socket.IO membaca `io("/api")` sebagai *namespace* (nama ruang), bukan jalur ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)). Buka `src/soket.ts`, ganti baris 16 (`export const socket … = io(BASE, { withCredentials: true, autoConnect: false });`) dengan enam baris ini, lalu simpan:

```ts
// Modul 26: di image Docker, BASE = "/api" (jalur di alamat halaman ini, diteruskan Caddy ke backend). io("/api") akan
// membacanya sebagai namespace Socket.IO, bukan jalur, jadi jalurnya diberikan lewat opsi path: /api/socket.io/.
// BASE kosong (VITE_API_BASE=/) = API di akar alamat halaman ini: jalurnya /socket.io/.
export const socket: Socket<KeKlien, DariKlien> = BASE === "" || BASE.startsWith("/")
  ? io({ path: `${BASE}/socket.io`, withCredentials: true, autoConnect: false })
  : io(BASE, { withCredentials: true, autoConnect: false });
```

`BASE` = `/api` (cetakan) → jalur `/api/socket.io` di alamat halaman ini; alamat lengkap seperti `http://localhost:8080` (mode kembang) → baris lama. Jadi dashboard mode kembang (Vite) tetap menyambung seperti sebelumnya.

Lalu nomor versi. Di terminal kosong (folder `frontend`), satu per satu:

```text
npm pkg set version=1.2.0
```

```text
npm install
```

**Hasilnya** (lab penulis): `npm pkg set` diam; `npm install` menulis `up to date, audited 111 packages in 3s` … `found 0 vulnerabilities`. Di `package-lock.json` hanya dua baris `version` yang berubah. Jangan memakai `npm install --package-lock-only` di folder ini: di lab penulis, ia menambah 60 baris lock tak terpakai.

Tiga pemeriksaan [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#101-dashboard-100-lint-build-cek-skema-dan-nomor-versi-15-menit), satu per satu:

```text
npm run lint
```

```text
npm run build
```

```text
npm run cek-skema
```

**Hasilnya** (lab penulis, dipotong; tiga perintah berurutan):

```text
Found 0 warnings and 0 errors.

dist/index.html                     1.15 kB │ gzip:   0.64 kB
dist/assets/index-DeVyEM1Y.css     39.16 kB │ gzip:  11.87 kB
dist/assets/index-C-aUsTUm.js   1,047.88 kB │ gzip: 312.14 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
…
✓ built in 5.58s

SAMA  src/skema/kontrak.ts
SAMA  src/skema/aturan-dasar.ts
```

Patokannya: *lint* bersih, *build* lolos dengan satu peringatan ukuran, dua `SAMA` (nama ber-hash dan angkanya bisa berbeda). `dist/` ini hanya bukti; cetakan memasak `dist/`-nya sendiri di 3.3.

#### 3.2 `frontend/caddy/Caddyfile`: pintu `/api`, aset yang hilang, dan *fallback* SPA (10 menit)

Di Explorer, klik kanan folder **`frontend`** → **New Folder…**, beri nama **`caddy`**. Klik kanan `caddy` → **New File…**, beri nama **`Caddyfile`** (C besar, tanpa ekstensi), isi (**Copy raw file** dari [`kode/frontend/caddy/Caddyfile`](kode/frontend/caddy/Caddyfile)), lalu simpan:

```text
# Caddyfile - pintu depan dashboard Rumah Pintar Mini (Modul 26): menyajikan isi dist/ dan meneruskan /api/... ke backend.
# Salinan berkas ini ikut di dalam image web. Docker Compose memasang FOLDER frontend/caddy/ di atasnya (bukan berkas
# tunggal), jadi berkas di repo inilah yang dipakai. Sesudah mengubahnya: docker compose restart web
{
	# Caddy biasanya membuka "loket admin" (2019) untuk mengubah setelan sambil jalan. Tidak kita pakai: setelan hanya
	# dibaca dari berkas ini saat Caddy menyala.
	admin off
}

# ":80" = HTTP biasa di port 80 kontainer, untuk alamat mana pun yang diketik di browser (localhost, IP laptop).
# Modul 27 mengganti ":80" dengan nama domain, lalu Caddy memasang HTTPS sendiri. ("auto_https off" TIDAK membuat Caddy
# melayani HTTP; alamat ":80" inilah yang membuatnya.)
:80 {
	# jawaban dikompres sebelum dikirim: JavaScript dashboard ±1 MB tiba di browser sekitar 300 kB
	encode zstd gzip

	# /api/devices -> backend:8080/devices (awalan /api dibuang dulu). Sambungan live ikut: /api/socket.io/ -> backend:8080/socket.io/
	# "backend" = nama layanan di compose.cloud.yml (lorong Compose), bukan localhost.
	handle_path /api/* {
		reverse_proxy backend:8080 {
			# Backend memasang cookie "sesi" (kartu terusan 7 hari) berjalur /auth, padahal browser memanggilnya lewat
			# /api/auth. Tanpa baris ini browser tidak mengirim cookie itu ke /api/auth/refresh, dan kamu terlempar ke
			# layar Masuk setiap 15 menit. Baris ini mengganti jalurnya di jawaban backend: Path=/auth -> Path=/api/auth.
			header_down Set-Cookie "Path=/auth" "Path=/api/auth"
		}
	}

	# /assets/...: JavaScript dan CSS hasil build. Namanya bersidik (misalnya index-DcefnpS2.js) dan berganti setiap
	# build, jadi browser boleh menyimpannya lama. Berkas yang tidak ada dijawab 404 (bukan index.html): galatnya jujur.
	handle /assets/* {
		root * /srv
		file_server
	}

	# Selain /api dan /assets: berkas dashboard di /srv (isi dist/). Alamat layar seperti /peta atau /perangkat/f00d00000001
	# bukan berkas, jadi dijawab index.html, lalu React Router memilih layarnya ("SPA fallback", janji Modul 24). Tanpa ini,
	# F5 di layar mana pun selain / menjawab 404.
	handle {
		root * /srv
		# no-cache = browser wajib bertanya dulu ke Caddy sebelum memakai index.html simpanannya (Caddy menjawab 304 bila
		# belum berubah). Tanpa ini, sesudah image web dibangun ulang browser bisa tetap menampilkan dashboard LAMA sampai F5.
		header Cache-Control "no-cache"
		try_files {path} /index.html
		file_server
	}
}
```

Komentarnya menjelaskan setiap baris; ringkasnya:

- **Blok `{ admin off }`** mematikan loket admin Caddy (port 2019): Caddy membaca berkas ini hanya saat menyala, jadi sesudah berkas diubah, jalankan `docker compose restart web` (mulai Praktik 5).
- **`:80`** = HTTP biasa di port 80 kontainer, untuk alamat apa pun ([Konsep 4](#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy)). `encode zstd gzip` mengecilkan JavaScript ±1 MB menjadi sekitar 300 kB di perjalanan.
- **Tiga blok `handle` saling eksklusif:** setiap permintaan masuk ke tepat satu blok, dan blok tanpa pola menampung sisanya. `handle_path /api/*` membuang awalan `/api`, lalu `reverse_proxy backend:8080` mengantarnya ke layanan `backend` di lorong Compose; baris `header_down` adalah tambalan jalur *cookie* (3.5). `handle /assets/*` menyajikan JavaScript dan CSS apa adanya, jadi aset yang tidak ada dijawab `404`. Blok terakhir adalah *fallback* SPA: `try_files {path} /index.html`, ditambah `Cache-Control "no-cache"` supaya browser selalu bertanya dulu sebelum memakai `index.html` simpanannya (kisahnya di [🔬](#-bedah-teknis-opsional)).

Kenapa satu folder `caddy/`, bukan berkas lepas di `frontend/`? Compose kelak memasang **folder** ini ke kontainer `web`: folder langsung memperlihatkan isi baru, sedangkan berkas tunggal yang dipasang bisa tetap terbaca isi lamanya ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)). Salinan di dalam cetakan hanya dipakai saat cetakan dicoba sendirian, seperti di 3.4.

#### 3.3 `Dockerfile` web dan `.dockerignore`, lalu `docker build` dari folder `frontend` (12 menit)

Klik kanan **`frontend`** → **New File…**, beri nama **`Dockerfile`**, isi (**Copy raw file** dari [`kode/frontend/Dockerfile`](kode/frontend/Dockerfile)), lalu simpan:

```dockerfile
# Dockerfile - cetakan (image) web Rumah Pintar Mini 1.2.0 (Modul 26). Dua tahap ("multi-stage"):
#   tahap "bangun": Node.js mengubah kode React + TypeScript menjadi berkas siap saji (npm run build -> folder dist/)
#   tahap akhir   : hanya Caddy + isi dist/. Node.js, node_modules, dan kode sumber tertinggal di tahap bangun.
# Dibangun dari folder proyek dengan: docker compose build web   (atau dari folder ini saja, tanpa folder backend:
# docker build -t rumah-pintar-mini-web:1.2.0 .)

# Tag persis (sama dengan cetakan backend), bukan "latest": cetakan yang sama hari ini dan bulan depan.
FROM node:24.22.1-alpine3.24 AS bangun
WORKDIR /app
# package*.json disalin LEBIH DULU daripada kode: selama daftar library tidak berubah, lapisan "npm ci" diambil dari cache
# dan build ulang sesudah mengubah kode jauh lebih cepat. Semua library ikut (termasuk alat pengembang TypeScript dan Vite),
# karena tahap ini memang membangun; tidak satu pun ikut ke image akhir.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Alamat API DIBAKAR ke JavaScript saat build: Vite mengganti import.meta.env.VITE_API_BASE dengan teks ini. "/api" =
# jalur di alamat halaman yang sama, diteruskan Caddy ke backend (caddy/Caddyfile). Mengubahnya = build ulang image.
# Isinya alamat, BUKAN rahasia: semua VITE_... ikut terkirim ke browser siapa pun.
ARG VITE_API_BASE=/api
RUN npm run build

# Tahap akhir: Caddy (tanpa Node.js). Tag persis.
FROM caddy:2.11.7-alpine
# Menautkan image di GHCR ke repositori GitHub-mu (Modul 26 Praktik 10). Ganti <akun> dengan nama akun GitHub-mu (huruf
# kecil) dan rumah-pintar-mini dengan nama repositorimu bila berbeda. Keterangan (description) menggantikan keterangan
# bawaan image Caddy, supaya halaman paketmu di GHCR tidak menulis bahwa isinya "web server Caddy" saja.
LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini" \
      org.opencontainers.image.description="Dashboard Rumah Pintar Mini (React) disajikan Caddy"
# Caddyfile bawaan di dalam image, supaya image ini bisa dicoba sendirian (docker run). Docker Compose memasang folder
# caddy/ dari repo di atasnya.
COPY caddy/Caddyfile /etc/caddy/Caddyfile
# Hanya hasil build yang dibawa dari tahap bangun: berkas HTML, CSS, JavaScript, dan ikon (sekitar 1 MB).
COPY --from=bangun /app/dist /srv
# Tanpa CMD dan EXPOSE: image Caddy sudah membawanya ("caddy run --config /etc/caddy/Caddyfile --adapter caddyfile",
# port 80 di dalam kontainer). Loket di laptop diatur compose.cloud.yml (ports).
```

Polanya sama dengan resep backend, dengan tiga beda:

- **Dapurnya memasang semua library** (`npm ci` tanpa `--omit=dev`), karena TypeScript dan Vite memang dipakai untuk memasak. Tidak satu pun ikut ke meja saji.
- **`ARG VITE_API_BASE=/api` sesudah `npm ci`.** `ARG` adalah nilai yang hanya ada selama *build*; Vite membakarnya ke JavaScript. Letaknya di bawah `npm ci`, jadi mengganti alamat tidak membuang lapisan `npm ci` dari *cache*.
- **Meja sajinya Caddy**, bukan Node: `COPY caddy/Caddyfile` dan `COPY --from=bangun /app/dist /srv`, tanpa `CMD` dan `EXPOSE` (keduanya bawaan cetakan Caddy). `LABEL` memberi dua label: `source` (`<akun>` diganti di 10.2, seperti di backend) dan `description`, yang menimpa keterangan bawaan Caddy.

Lalu buat **`.dockerignore`** di `frontend` dengan cara yang sama (**Copy raw file** dari [`kode/frontend/.dockerignore`](kode/frontend/.dockerignore)), lalu simpan:

```text
# .dockerignore - berkas yang TIDAK ikut dikirim ke docker build (Modul 26). Image yang dibagikan (GHCR publik) bisa dibongkar
# siapa pun: berkas setelan pribadi tidak boleh masuk, bahkan ke tahap bangun yang nanti dibuang.
# Library hasil npm install di laptop: tahap bangun memasang sendiri (npm ci); COPY . . tidak boleh mencampurnya
# dengan milik laptop (versinya bisa lain; kode mesin Windows/macOS tidak jalan di Linux).
node_modules
# Hasil build lama di laptop: image membangunnya sendiri.
dist
# Setelan lokal mode kembang (.env.local berisi VITE_API_BASE milik laptopmu). Hanya contohnya (.env.example) yang boleh.
.env
.env.*
!.env.example
*.local
```

Yang paling penting `*.local`: `.env.local` milikmu (alamat API mode kembang) tidak pernah masuk, jadi cetakan selalu memakai `/api`. Ganti juga isi `frontend/.env.example` (**Copy raw file** dari [`kode/frontend/.env.example`](kode/frontend/.env.example)). Yang baru: dua baris komentar (berkas itu khusus mode kembang).

Di terminal folder `frontend` (titik di akhir = folder ini sebagai konteks *build*):

```text
docker build -t rumah-pintar-mini-web:1.2.0 .
```

**Hasilnya** (lab penulis, dipotong; seperti di 2.4, *build* pertama diukur dengan `--no-cache`):

```text
[+] Building 102.6s (15/15) FINISHED                                                                      docker:default
 => [bangun 4/6] RUN npm ci                                                                                         49.5s
 => [bangun 6/6] RUN npm run build                                                                                  49.3s
```

103 detik di Pi 5 penulis, dibagi hampir rata antara `npm ci` dan `npm run build`. Konteksnya hanya folder `frontend`, tanpa folder `backend`: janji [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#8-satu-aturan-dua-penjaga-skema-zod-yang-sama-di-browser-dan-backend) bahwa frontend bisa di-*build* sendirian kini terbukti. Jalankan lagi tanpa perubahan: semua `CACHED`, ±2 detik (lab: 2,3 detik). Sesudah kode berubah, hanya `npm run build` yang diulang (lab: ±50 detik); itu juga terjadi bila yang diubah baris `LABEL` di `Dockerfile`, karena `COPY . .` ikut menyalinnya. Lalu:

```text
docker image ls rumah-pintar-mini-web
```

**Hasilnya** (lab penulis, arm64; contoh):

```text
IMAGE                         ID             DISK USAGE   CONTENT SIZE   EXTRA
rumah-pintar-mini-web:1.2.0   bc2f69743174       90.4MB           24MB
```

Hampir sama dengan cetakan Caddy sendiri (tabel Konsep 4): tanpa Node, `node_modules`, atau kode sumber. Nama tanpa awalan ini hanya untuk uji; di 5.3 Compose membangun cetakan yang sama dengan awalan `TOKO_IMAGE`.

#### 3.4 ⭐ Uji cetakan web sendirian di loket 8088: 200, 404, dan 502 yang wajar (8 menit)

Sebelum masuk Compose, cetakan diuji sendirian di loket 8088, yang tidak dipakai rumah lama:

```text
docker run -d --rm --name coba-web -p 127.0.0.1:8088:80 rumah-pintar-mini-web:1.2.0
```

Perintah ini hanya mencetak ID panjang. `--rm` = kontainer dihapus begitu berhenti; `-p 127.0.0.1:8088:80` = loket 8088 laptop ini ke port 80 kontainer. Tanyakan kode status empat alamat, satu per satu (`-sI` = hanya kepala jawaban; PowerShell: `curl.exe`, tidak diuji penulis):

```text
curl -sI http://localhost:8088/
```

```text
curl -sI http://localhost:8088/peta
```

```text
curl -sI http://localhost:8088/assets/tidak-ada.js
```

```text
curl -sI http://localhost:8088/api/health
```

**Hasilnya** (lab penulis; baris pertama tiap jawaban, berurutan):

```text
HTTP/1.1 200 OK
HTTP/1.1 200 OK
HTTP/1.1 404 Not Found
HTTP/1.1 502 Bad Gateway
```

`/` dan `/peta` sama-sama dijawab `index.html` (`Content-Length: 1150`, `Cache-Control: no-cache`): `/peta` bukan berkas, jadi *fallback* SPA bekerja, dan F5 di layar mana pun aman. Aset yang tidak ada dijawab `404`. `502` itu wajar: Caddy mencoba mengantar `/api/health` ke `backend`, padahal di luar Compose tidak ada layanan bernama itu. Lewat Compose ([5.4](#54--masuk-lewat-caddy-di-httplocalhost-f5-bruno-dan-swagger-8-menit)), `/api` sampai ke backend. Lalu baca lognya:

```text
docker logs coba-web
```

**Hasilnya** (lab penulis, dipotong):

```text
{"level":"warn",…,"msg":"admin endpoint disabled"}
{"level":"warn",…,"msg":"server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server",…}
{"level":"warn",…,"msg":"HTTP/2 skipped because it requires TLS",…}
{"level":"warn",…,"msg":"HTTP/3 skipped because it requires TLS",…}
{"level":"error",…,"msg":"dial tcp: lookup backend on 192.168.1.1:53: no such host",…,"status":502,…}
```

Empat `warn` itu wajar ([Konsep 4](#4-dapur-dan-meja-saji-multi-stage-image-kecil-dan-caddy)). Baris `error` adalah `502` tadi: kontainer `docker run` biasa tidak berada di lorong Compose, jadi nama `backend` dicari ke DNS jaringanmu dan tidak ditemukan. Alamat DNS-nya berbeda di setiap laptop. Di Chrome, `http://localhost:8088/peta` memuat dashboard lalu pindah ke layar **Masuk** dengan pesan `Terjadi gangguan (502).`, karena `/api/auth/me` juga dijawab `502` (dari kode; tidak direkam penulis). Selesai, hentikan:

```text
docker stop coba-web
```

Jawabannya `coba-web`; berkat `--rm`, kontainernya ikut terhapus dan loket 8088 bebas lagi.

**Kamu lulus langkah ⭐ ini** kalau keempat `curl` menjawab `200`, `200`, `404`, dan `502`, lalu `coba-web` sudah dihentikan.

#### 3.5 Dua jebakan yang sudah dibereskan: Socket.IO di balik `/api` dan jalur *cookie* `sesi` (5 menit)

Cukup dibaca: keduanya ditemukan di lab penulis dan sudah dibereskan versi 1.2.0.

1. **Tanpa tiga baris 3.1.** Frontend 1.1 yang dibangun dengan `VITE_API_BASE=/api` meminta *namespace* `/api` lewat jalur `/socket.io/`, dan Caddy menjawab jalur itu dengan `index.html`. Klien Socket.IO di lab penulis: `connect_error: server error`, berulang; lencana tidak pernah **Live**.
2. **Tanpa `header_down`.** Backend memasang *cookie* `sesi` dengan `Path=/auth`, jadi browser tidak mengirimnya ke `/api/auth/refresh`. Di lab penulis, `POST /api/auth/refresh` dijawab `401` `{"pesan":"belum login: cookie sesi tidak ada"}`: begitu gelang `akses` 15 menit habis, kamu terlempar ke layar **Masuk**. Dengan tambalan, jawabannya `200`.

Keduanya bekerja di 5.4; gejalanya ada di [🚨](#-kalau-tidak-jalan). **Simpan ke cabang.** Di terminal folder `frontend`:

```text
git add package.json package-lock.json .env.example src/soket.ts caddy Dockerfile .dockerignore
```

```text
git commit -m "Frontend 1.2.0: cetakan Docker dengan Caddy, Socket.IO lewat /api (Modul 26 Praktik 3)"
```

> ⬆️ **Selesai Praktik 3?** Baca [Konsep 5](#5-satu-berkas-untuk-satu-rumah-docker-compose) sampai [Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log) dan [Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang), lalu kerjakan [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) sampai [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit) dalam satu duduk (±2,5 jam).

### Praktik 4 — Lemari pindah: database dan Grafana ke Compose tanpa kehilangan data (50 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal di **akar proyek** (Git dan `docker`) dan terminal `backend` (4.6); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan `rumahpintar-db` dan `rumahpintar-grafana` masih menyala; **Chrome** atau **Edge** (Grafana `http://localhost:3000`); **Telegram**; pengelola sandimu (sandi postgres dan admin Grafana lama). Konsep yang dipakai: 5, 6, dan 7.
>
> ⭐ **Wajib** — langkah 4.3, 4.4, dan 4.5: kontainer lama terhapus sementara kedua lemarinya tetap ada, `docker compose up -d` memakai lemari lama (`Skipping initialization`), dan sidik jari sesudah pindah sama dengan 1.2.

Praktik ini menepati dua janji: [Silabus](../../SILABUS.md#modul-26--docker--docker-compose-satu-perintah-untuk-semua-layanan) ("database & Grafana pindah ke kontainer tanpa kehilangan data") dan [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#2-grafana-tinggal-di-samping-database-satu-docker-run-dan-sebuah-lorong) (lemari `rumahpintar-grafana-data` yang sama). Caranya: kontainer lama dibuang, lemarinya dipakai Compose apa adanya. Rumah lamamu berhenti sejak 1.2 dan baru menyala lagi di 5.3.

#### 4.1 `compose.cloud.yml` tahap pertama: `db` dan `grafana` di atas dua lemari `external` (10 menit)

Di Explorer VS Code, buat berkas baru (**New File…**) di akar proyek (sejajar folder `backend`) bernama **`compose.cloud.yml`**, tempel isi ini (**Copy raw file** dari [`kode/tahap/praktik-4/compose.cloud.yml`](kode/tahap/praktik-4/compose.cloud.yml)), lalu simpan (**Ctrl + S**):

```yaml
# compose.cloud.yml - TAHAP Praktik 4 Modul 26: hanya database dan Grafana, memakai dua lemari LAMA (Modul 17 dan 25).
# Isinya ditulis di akar proyek (bukan di folder tahap ini). Berkas akhir Modul 26: ../../compose.cloud.yml.
# Jalankan dari akar proyek:  docker compose up -d   (.env berisi COMPOSE_FILE=compose.cloud.yml dan sandi postgres LAMA)
# Sebelumnya kontainer lama dihentikan dan dihapus (lemarinya tetap): docker stop + docker rm rumahpintar-grafana rumahpintar-db
name: rumahpintar

services:
  # Database TimescaleDB (Modul 17-18), lemari rumahpintar-data yang sama sejak Modul 17.
  db:
    image: timescale/timescaledb:2.30.2-pg17
    environment:
      # Formulir ini hanya dibaca saat lemari masih KOSONG. Lemari lama sudah berisi sandi: tulis sandi LAMA di .env.
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?isi POSTGRES_PASSWORD di .env}
      POSTGRES_DB: rumahpintar
      TIMESCALEDB_TELEMETRY: "off"
    volumes:
      - data-db:/var/lib/postgresql/data
    ports:
      # 127.0.0.1 = hanya laptop ini (DBeaver, psql, npm run dev). Tanpa 127.0.0.1, Docker membuka loket ke seluruh WiFi.
      - "127.0.0.1:${PORT_DB:-5432}:5432"
    networks:
      default:
        # nama lama kontainer Modul 17-25: data source Grafana buatan layar (host rumahpintar-db:5432) tetap tersambung
        aliases:
          - rumahpintar-db
    healthcheck:
      # "running" belum tentu "siap menerima tamu"; -h 127.0.0.1 supaya tidak lolos terlalu dini saat lemari baru diisi
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U postgres -d rumahpintar"]
      interval: 5s
      timeout: 3s
      retries: 30
      start_period: 60s
    restart: unless-stopped

  # Grafana 13.2.4 (Modul 25) dengan setelan Modul 25 persis dan lemari rumahpintar-grafana-data yang sama: dashboard,
  # aturan, contact point, dan akun admin lamamu ikut. Dirakit dari berkas (provisioning) baru di Praktik 7.
  grafana:
    image: grafana/grafana:13.2.4
    environment:
      GF_PLUGINS_PREINSTALL_DISABLED: "true"
      GF_ANALYTICS_REPORTING_ENABLED: "false"
      GF_SNAPSHOTS_EXTERNAL_ENABLED: "false"
      GF_PUBLIC_DASHBOARDS_ENABLED: "false"
    volumes:
      - data-grafana:/var/lib/grafana
    ports:
      - "127.0.0.1:${PORT_GRAFANA:-3000}:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  # Lemari riwayat milik KAMU ("external"): Compose tidak pernah membuat atau menghapusnya, juga tidak dengan "down -v".
  data-db:
    external: true
    name: ${LEMARI_DB:-rumahpintar-data}
  data-grafana:
    external: true
    name: ${LEMARI_GRAFANA:-rumahpintar-grafana-data}
```

Baca komentarnya dari atas, lalu bandingkan dengan lembar inventarismu ([🔁 Langkah 5](#langkah-5--membaca-setelan-kontainer-lama-dengan-docker-inspect-tanpa-membocorkan-sandi)):

- **`db`** = `docker run` [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#2-docker-secukupnya-cetakan-kontainer-loket-dan-lemari) yang ditulis ulang (tabel Konsep 5): cetakan, lemari, dan `unless-stopped` yang sama. Loketnya tetap `127.0.0.1`: janji Modul 17 terjaga, database hanya untuk laptop ini. Yang baru: nama kedua `rumahpintar-db` di lorong (Konsep 7) dan pemeriksaan kesehatan (Konsep 8).
- **`grafana`** membawa empat setelan `GF_…` Modul 25 persis ([1.2 Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#12-periksa-kontainernya-docker-ps-docker-inspect-dan-docker-network-inspect-7-menit)) dan baru menyala sesudah `db` sehat (`service_healthy`). Pemeriksaan kesehatannya menyusul di 5.2, *provisioning*-nya di Praktik 7.
- **`volumes:`**: dua lemari `external` (Konsep 6), tidak dibuat dan tidak pernah dihapus Compose. Namanya dari `LEMARI_DB` dan `LEMARI_GRAFANA` di `.env`, dengan bawaan nama lemari Modul 17 dan 25.

Berkas ini tumbuh di 5.2 dan 7.2.

#### 4.2 Kebersihan Git dulu: `.gitignore`, `.gitattributes`, lalu `.env` dengan sandi postgres lama (5 menit)

`.env` yang sebentar lagi kamu buat berisi sandi postgres, padahal `.gitignore` akar Modul 25 hanya menahan `kunci.h` dan `edge/sandi-broker` (`.env` backend ditahan `backend/.gitignore`). Jadi **pagarnya dipasang dulu, baru rahasianya ditulis.**

**(a) `.gitignore`.** Ganti isi `.gitignore` di akar proyek dengan [`kode/.gitignore`](kode/.gitignore) (**Copy raw file**): empat baris lamanya tetap, ditambah blok Modul 26 berkomentar. Aturan barunya, tanpa komentar:

```text
.env
.env.*
!.env.example
edge/jembatan/*.conf
backup/
```

`.env` dan salinannya tidak ikut Git di folder mana pun; `!` = pengecualian untuk `.env.example`. Dua baris terakhir untuk Praktik 6 dan 9.

**(b) `.gitattributes`.** Berkas baru di akar proyek, nama **`.gitattributes`** (diawali titik), isi lewat **Copy raw file** dari [`kode/.gitattributes`](kode/.gitattributes):

```text
# .gitattributes - Modul 26: berkas yang dibaca program di DALAM kontainer Linux harus berakhir-baris LF (bukan CRLF).
# Git for Windows bisa mengubah LF menjadi CRLF saat checkout (core.autocrlf); baris di bawah mencegahnya untuk berkas ini,
# karena tanda CR yang tidak terlihat itu merusak skrip sh. (Mosquitto 2.1.2, Caddy 2.11.7, dan Compose terbukti tahan di
# lab Modul 26, tetapi tidak semua program setoleran itu: lebih aman semua berkas ini tetap LF.)
*.sh text eol=lf
*.conf text eol=lf
Caddyfile text eol=lf
acl-broker text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
.env.example text eol=lf
Dockerfile text eol=lf
.dockerignore text eol=lf
```

Artinya: berkas-berkas itu selalu berakhir baris LF (gaya Linux), juga di Windows. Di lab penulis, CRLF (gaya Windows) hanya merusak skrip `.sh`, dan proyek ini tanpa `.sh`; LF tetap dipilih demi kerapian.

**(c) `.env.example`.** Berkas baru di akar proyek, nama **`.env.example`**, isi lewat **Copy raw file** dari [`kode/.env.example`](kode/.env.example):

```text
# .env.example - setelan Docker Compose PUSAT Rumah Pintar Mini (Modul 26) untuk compose.cloud.yml di folder ini.
# Salin menjadi .env (cp .env.example .env), isi baris yang kosong, lalu di Linux/macOS/Pi: chmod 600 .env
# .env berisi SEMUA rahasia rumahmu: tidak pernah ikut Git (lihat .gitignore), tidak pernah ditempel ke forum, isu, atau AI.
# Begitu juga keluaran "docker compose config": perintah itu mencetak semua rahasia di bawah apa adanya.
#
# Buat setiap sandi/rahasia acak dengan salah satu perintah ini, lalu tempel hasilnya (43 karakter: huruf, angka, - dan _
# saja, jadi aman di alamat database dan di YAML):
#   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
#   docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
# (baris kedua untuk laptop tanpa Node.js; image-nya sama dengan dasar cetakan backend)

# Nama berkas Compose. Dengan baris ini, "docker compose up -d" di folder ini sudah cukup (tanpa -f compose.cloud.yml).
COMPOSE_FILE=compose.cloud.yml

# Toko image (Praktik 10): ghcr.io/ + nama akun GitHub-mu dalam huruf kecil, misalnya ghcr.io/budi-santoso. Bukan rahasia:
# boleh kamu tulis langsung di .env.example milikmu, supaya laptop teman yang menyalinnya langsung menarik image-mu.
TOKO_IMAGE=

# --- Rahasia (wajib) ---
# Sandi postgres. Lemari rumahpintar-data dari Modul 17 SUDAH menyimpan sandinya: tulis sandi LAMA-mu di sini (mengganti
# baris ini TIDAK mengganti sandi di database). Laptop baru (lemari kosong): sandi acak baru.
POSTGRES_PASSWORD=
# Kunci tanda tangan JWT backend (Modul 20), minimal 32 karakter acak.
JWT_SECRET=
# Sandi akun broker "backend". Layanan akun-broker memakainya untuk membuat akun itu SEKALI, saat lemari broker masih kosong.
# Mengganti sandi ini kemudian: ubah baris ini, lalu (dari folder ini)
#   docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker backend   (ketik sandi baru 2x)
#   docker compose restart mosquitto      (broker membaca berkas sandi yang baru)
#   docker compose up -d                  (backend dibuat ulang dengan sandi baru dari .env)
# Mode kembang (backend/.env) memakai akun yang sama: ganti juga MQTT_PASSWORD di sana.
MQTT_PASSWORD=
# Sandi akun database grafana_baca (Modul 25). Boleh sandi BARU (acak), juga bila pindah dari Modul 25: layanan akun-grafana
# menyamakan sandi akun ini di database dengan baris ini setiap "docker compose up", dan data source Grafana dari berkas
# (grafana/provisioning) memakai baris yang sama.
GRAFANA_BACA_SANDI=
# Sandi admin Grafana, hanya dipakai saat lemari Grafana masih kosong. Lemari Modul 25 tetap memakai sandi admin lamamu.
GRAFANA_ADMIN_SANDI=

# --- Telegram (tidak wajib; Modul 19 dan 25). Kosong = notifikasi backend mati, kiriman Grafana ke Telegram gagal. ---
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
# Jam laporan harian CSV, cron 5 bidang dalam WIB (bawaan 07.00 WIB).
LAPORAN_JADWAL=0 7 * * *
# Hanya untuk server Bot API tiruan di lab; biarkan berkomentar.
# TELEGRAM_API_ROOT=

# --- Alamat halaman dan loket (port) di laptop ini ---
# Halaman (origin) yang boleh login dari browser, dipisah koma. Kalau PORT_WEB bukan 80, tulis port-nya juga,
# misalnya http://localhost:8081,http://127.0.0.1:8081. Mode HP: tambahkan http://<IP laptop>, misalnya http://192.168.1.20
CORS_ORIGIN=http://localhost,http://127.0.0.1
# 127.0.0.1 = dashboard hanya bisa dibuka dari laptop ini. 0.0.0.0 = mode HP: semua perangkat di WiFi rumah bisa membukanya.
ALAMAT_WEB=127.0.0.1
# Ganti angka di kiri bila loket itu sudah dipakai program lain di laptopmu (misalnya PORT_WEB=8081).
PORT_WEB=80
# PORT_BACKEND bukan 8080 (misalnya 8082)? Tambahkan http://localhost:8082 ke CORS_ORIGIN, supaya login lewat
# Try it out di http://localhost:8082/docs tidak ditolak 403. Bruno dan alat/terminal-live.js tidak terpengaruh.
PORT_BACKEND=8080
PORT_DB=5432
PORT_GRAFANA=3000
PORT_MQTT=1883
PORT_KUMA=3001

# --- Lemari (volume) riwayat, dibuat SEKALI dengan "docker volume create <nama>" (lemari Modul 17 dan 25 sudah ada) ---
LEMARI_DB=rumahpintar-data
LEMARI_GRAFANA=rumahpintar-grafana-data

# --- Profil yang ikut menyala dengan "docker compose up -d". Kosong = hanya layanan bawaan. pantau = Uptime Kuma (Modul 30).
# Tanpa baris ini, profil dinyalakan dengan "docker compose --profile pantau up -d" dan dimatikan dengan
# "docker compose --profile pantau down" (tanpa --profile, Uptime Kuma tetap menyala).
# COMPOSE_PROFILES=pantau
```

Daftar setelan rumah tanpa satu nilai rahasia pun, jadi aman ikut Git. Dari atas: resep rahasia acak (Konsep 9), `COMPOSE_FILE` (Konsep 5), `TOKO_IMAGE`, rahasia wajib, Telegram, alamat dan loket, nama lemari, profil. Dari rahasianya, baru `POSTGRES_PASSWORD` yang dipakai; sisanya diisi saat dipakai: [5.1](#51-broker-pusat-edgepusatconf-blok-acl-jembatan-pi-serta-layanan-akun-broker-dan-mosquitto-12-menit), [5.2](#52-composecloudyml-tahap-kedua-migrasi-backend-web-dan-toko_image-di-env-15-menit), dan [7.2](#72-composecloudyml-akhir-layanan-akun-grafana-dan-rahasia-grafana-di-env-8-menit).

**(d) `.env` milikmu.** Di terminal akar proyek (Linux, macOS, Pi; Windows: `copy .env.example .env`, tidak diuji penulis):

```text
cp .env.example .env
```

Buka `.env` di VS Code dan isi:

1. **`POSTGRES_PASSWORD=`** dengan sandi postgres **lama** (Modul 17), bukan sandi baru: lemari lama sudah menyimpan sandinya (Konsep 6). Sandi itu juga tertulis di `backend/.env`, di `DATABASE_URL` antara `//postgres:` dan `@`. Salah ketik belum terasa di praktik ini; baru di 5.3 layanan `migrasi` gagal masuk (`password authentication failed for user "postgres"`).
2. Di Modul 17 kamu memakai loket 5433 atau 5434? Ubah `PORT_DB=5432` menjadi nomormu, supaya DBeaver dan `backend/.env` tetap cocok.
3. Nama lemari di inventarismu ([🔁 Langkah 1](#langkah-1--inventaris-rumahmu-kontainer-lemari-lorong-cetakan-dan-ruang-disk)) lain? Tulis di `LEMARI_DB` dan `LEMARI_GRAFANA`. Nama yang tidak ada membuat Compose menolak menyala (`external volume "…" not found`) tanpa menyentuh lemari mana pun.

Simpan, lalu kunci berkasnya (Linux, macOS, Pi; Windows tanpa `chmod`):

```text
chmod 600 .env
```

**(e) Periksa.** Sebelum ada yang dihapus, pastikan Compose bisa membaca berkas dan `.env`-mu:

```text
docker compose config --quiet
```

**Hasilnya:** tanpa keluaran (lab penulis: kode keluar 0). `POSTGRES_PASSWORD` masih kosong? Compose berhenti dengan pesan berakhiran `isi POSTGRES_PASSWORD di .env`. Tanpa `--quiet`, sandimu tercetak. Terakhir, `git status` harus menyebut `.gitignore` (berubah) serta `.gitattributes`, `.env.example`, `compose.cloud.yml`, dan `skrip/` (baru), **tanpa `.env`** (lab penulis: `.env` tidak muncul). *Commit*-nya di 4.6.

#### 4.3 ⭐ Hapus kontainer lama, lemarinya tetap: `docker stop`, `docker rm`, dan `docker network rm` (8 menit)

Langkah ini **wajib sebelum 4.4**. Kontainer adalah kuenya, lemari di luar kue (Modul 17): yang dihapus hanya kue. Perintahnya `docker rm`, **bukan** `docker volume rm` (aturan aman nomor 3). Di terminal akar proyek, satu per satu:

```text
docker stop rumahpintar-grafana rumahpintar-db
```

```text
docker rm rumahpintar-grafana rumahpintar-db
```

**Hasilnya** (lab penulis): setiap perintah mencetak ulang kedua nama. Lemarinya masih ada?

```text
docker volume ls --filter name=rumahpintar
```

**Hasilnya** (lab penulis, tanpa lemari alat lab):

```text
DRIVER    VOLUME NAME
local     rumahpintar-data
local     rumahpintar-grafana-data
```

Lalu lorong buatan tanganmu di Modul 25; Compose membuat lorongnya sendiri (Konsep 7):

```text
docker network rm rumahpintar
```

**Hasilnya:** `rumahpintar`. Ditolak dengan `… network rumahpintar has active endpoints (name:"…" …)`? Kontainer lain (namanya di `name:"…"`) masih menempel: bila itu sisa percobaanmu, hentikan dan hapus seperti tadi, lalu ulangi. Lorong lama yang tertinggal pun tidak mengganggu Compose (lab kode penulis).

> [!WARNING]
> **Kenapa 4.3 tidak boleh dilewati.** Selagi `rumahpintar-db` lama memegang loket 5432, `docker compose up -d` berhenti dengan `Bind for 127.0.0.1:5432 failed: port is already allocated` (lab penulis). Kontainer barunya tidak pernah menjalankan Postgres, jadi lemari aman, dan `docker compose down` membersihkan sisanya. Yang berbahaya justru loket yang **berbeda**, misalnya kontainer lama di 5433 sementara `PORT_DB` 5432: `db` baru tetap menyala, dan dua Postgres bisa memakai satu lemari bersamaan. Penulis tidak mencobanya; urutan 4.3 → 4.4 mencegahnya. Galat sejenis: [🚨](#-kalau-tidak-jalan) *Kontainer lama menghalangi …*.

**Kamu lulus langkah ⭐ ini** kalau `docker ps -a` tidak lagi menyebut `rumahpintar-db` dan `rumahpintar-grafana`, sedangkan kedua lemarinya masih ada.

#### 4.4 ⭐ `docker compose up -d`: lemari lama dikenali, `Skipping initialization` (8 menit)

Di terminal akar proyek (tanpa `-f`: `COMPOSE_FILE` di `.env` menunjuk berkasnya):

```text
docker compose up -d
```

**Hasilnya** (lab penulis; satu baris layanan khusus lab dibuang):

```text
[+] Running 3/3
 ✔ Network rumahpintar_default      Created    0.2s
 ✔ Container rumahpintar-db-1       Healthy    7.1s
 ✔ Container rumahpintar-grafana-1  Started    7.4s
```

Lorong baru dibuat, dan Grafana menunggu `db` `Healthy`; seluruhnya ±9 detik di lab, tanpa peringatan lemari (keduanya `external`). Lalu:

```text
docker compose ps
```

**Hasilnya** (lab penulis, dipotong):

```text
NAME                    IMAGE                               COMMAND                  SERVICE   CREATED          STATUS                    PORTS
rumahpintar-db-1        timescale/timescaledb:2.30.2-pg17   "docker-entrypoint.s…"   db        30 seconds ago   Up 29 seconds (healthy)   127.0.0.1:5432->5432/tcp
rumahpintar-grafana-1   grafana/grafana:13.2.4              "/run.sh"                grafana   29 seconds ago   Up 22 seconds             127.0.0.1:3000->3000/tcp
```

Nama kontainer kini `rumahpintar-db-1` (Konsep 5), kedua loket `127.0.0.1`, dan hanya `db` yang diperiksa kesehatannya. Bukti database tidak dibuat dari nol:

```text
docker compose logs db
```

**Hasilnya** (lab penulis, dua baris; cari dengan **Ctrl + F** di terminal VS Code):

```text
db-1  | PostgreSQL Database directory appears to contain a database; Skipping initialization
db-1  | 2026-10-28 14:00:17.683 UTC [1] LOG:  database system is ready to accept connections
```

"Sudah berisi database; penyiapan dilewati": formulir `POSTGRES_…` tidak dibaca, lemari lama dipakai apa adanya (Konsep 6). Jam log database = UTC (14.00 UTC = 21.00 WIB).

**Kamu lulus langkah ⭐ ini** kalau `db` berstatus `(healthy)` dan lognya memuat `Skipping initialization`.

#### 4.5 ⭐ Sidik jari sesudah sama dengan sebelum, lalu periksa Grafana di lemari yang sama (12 menit)

Skrip 1.2, kini lewat layanan `db` (`-T`: masukannya dari berkas, bukan keyboard). bash/zsh:

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

PowerShell (tidak diuji penulis):

```text
Get-Content skrip/sidik-jari.sql | docker compose exec -T db psql -U postgres -d rumahpintar
```

**Hasilnya** (lab penulis; sama persis dengan baris 1.2-nya):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2318 | aa2aa442bf9868ca730b42ccab4cffba |       379 |     9 |     3 |    2 |         3
(1 row)
```

Bandingkan dengan baris "Sebelum pindah" di `sidik-jari.md` ([1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit)). `bacaan`, `sidik_jari`, `akun`, dan `perangkat` sama persis = **riwayatmu pindah tanpa kehilangan satu bacaan pun**; `ringkasan` boleh berbeda. Simpan barisnya dengan judul "Sesudah pindah (4.5)". Berbeda? Jangan lanjut dulu: pastikan tidak ada backend lain yang menyala dan `LEMARI_DB` menunjuk lemari lamamu.

Lalu Grafana. Buka `http://localhost:3000`, masuk sebagai `admin` dengan sandi **lama** (`GRAFANA_ADMIN_SANDI` di `.env` hanya untuk lemari kosong), dan ulangi catatan [1.3](#13-sidik-jari-grafana-dashboard-aturan-contact-point-dan-tombol-test-5-menit):

- **Dashboards**: `Kesehatan Sistem` dan `Panel pertama`.
- **Alerting → Alert rules**: `Node diam`, kini kemungkinan `Firing`: 🔴 selama pindahan (1.3) berasal dari sini. Wajar; ✅ datang sesudah data kembali.
- **Alerting → Notification configuration → Contact points** → `Telegram Rumah Pintar` → **Test** → **Send test notification** → `Test notification sent successfully`, lalu `🔴 Notification test` tiba.
- **Connections → Data sources** → `grafana-postgresql-datasource` → **Save & test** → `Database Connection OK`. *Data source* ini menuju `rumahpintar-db:5432`, kontainer yang sudah kamu hapus; yang menjawab kini layanan `db` lewat nama keduanya (Konsep 7).

**Hasilnya** (lab penulis, lewat API yang sama dengan layar): sandi admin lama diterima, isi sama persis dengan 1.3, `Database Connection OK`, dan **Test** pukul 21.01.12 WIB diterima server Telegram tiruan sedetik kemudian.

**Kamu lulus langkah ⭐ ini** kalau keempat kolom penentu sama dengan 1.2, dan Grafana utuh: sandi admin lama, dua dashboard, aturan `Node diam`, **Test** sampai.

#### 4.6 Mode kembang masih jalan terhadap layanan `db` (7 menit)

`backend/.env` menuju loket `127.0.0.1:5432`, yang kini milik layanan `db`; tidak ada yang perlu diubah. Di terminal `backend`:

```text
npm run dev
```

**Hasilnya** (lab penulis, dipotong; jam WIB):

```text
> rumah-pintar-mini-backend@1.3.0 dev
> node --watch --env-file=.env src/server.ts

[21:01:31] INFO: database siap
[21:01:31] INFO: aturan dimuat: 0 aktif dari 0
[21:01:31] INFO: daftar perangkat dimuat: 2 perangkat terdaftar
[21:01:31] INFO: laporan harian dijadwalkan: "0 7 * * *" Asia/Jakarta, berikutnya 29 Okt 2026, 07.00 WIB
[21:01:31] INFO: Server listening at http://127.0.0.1:8080
[21:01:31] INFO: dokumentasi API: http://127.0.0.1:8080/docs
```

`database siap` = backend 1.3.0 masuk ke database Compose; baris lain (dipotong) menyebut broker lamamu (`MQTT_URL`). Tekan **Ctrl + C** (`SIGINT diterima: backend berhenti dengan rapi`): mode rumah mulai di 5.3, cara berpindah mode di [5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit). Bacaan yang sempat masuk tidak mengganggu, karena sidik jari 4.5 sudah tercatat.

**Simpan ke cabang.** Di terminal akar proyek (nama berkas satu per satu, tanpa `.env`):

```text
git add compose.cloud.yml .env.example .gitignore .gitattributes skrip
```

```text
git commit -m "Compose tahap 1: db dan Grafana di lemari lama, .env.example, .gitignore, .gitattributes (Modul 26 Praktik 4)"
```

`git status` sesudahnya tidak boleh menyebut `.env`.

> ⬆️ **Selesai Praktik 4?** Lanjut langsung ke [Praktik 5](#praktik-5--seluruh-rumah-dalam-satu-perintah-broker-pusat-migrasi-backend-dan-web-60-menit). Dashboard dan backend baru menyala lagi di [5.3](#53--satu-perintah-menyalakan-seluruh-rumah-docker-compose-up--d---build-dan-ps--a-10-menit).

### Praktik 5 — Seluruh rumah dalam satu perintah: broker pusat, migrasi, backend, dan web (60 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal di **akar proyek** (`docker compose` dan Git), terminal `alat` (5.5), serta terminal `backend` dan `frontend` (5.6); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux); **Chrome** atau **Edge**; **Bruno**; **Telegram**; pengelola sandimu. Konsep yang dipakai: 5, 7, 8, dan 10.
>
> ⭐ **Wajib** — langkah 5.3, 5.4, dan 5.5: satu `docker compose up -d --build` menyalakan seluruh rumah (`docker compose ps -a`), kamu masuk lewat Caddy di `http://localhost`, lalu data *live* mengalir lewat broker pusat dan lampu dijawab `ack`.

Di samping `db` dan `grafana` kini ada broker pusat, `migrasi`, `backend`, dan `web` (Caddy). Di 5.3 rumahmu menyala lagi, seluruhnya di kontainer: **mode rumah**. Seperti tabel [Silabus §2.2](../../SILABUS.md#22-di-mana-otak-nya-berjalan-dari-waktu-ke-waktu), otaknya di laptop, broker perangkat Kit B tetap di Pi (Praktik 6), dan semuanya masih di jaringan rumah.

> [!IMPORTANT]
> **Loket 1883 harus bebas dulu.** Lembar inventarismu ([🔁 Langkah 2](#langkah-2--siapa-memakai-loket-80-1883-3000-5173-5432-dan-8080)) mencatat pemakainya, biasanya broker lama jalur laptop dari [Modul 11](../../fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md#3-broker-di-laptop-mosquitto-dua-baris-konfigurasi-dan-firewall) atau [Modul 12 Praktik 7](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#praktik-7--jalur-laptop-mosquitto-sebagai-layanan-30-menit). Hentikan dengan perintah kedua modul itu (*tidak diuji penulis di modul ini*): di terminal VS Code, **Ctrl + C**; Linux `sudo systemctl disable --now mosquitto`; macOS `brew services stop mosquitto`; Windows, di **Terminal (Admin)** dari `C:\Program Files\Mosquitto`, `net stop mosquitto` lalu `.\mosquitto uninstall` (supaya tidak menyala lagi bersama Windows). Berkas lamanya jangan dihapus: itu jalan mundurmu. Kit B: broker Pi tetap menyala sampai 6.4.

#### 5.1 Broker pusat: `edge/pusat.conf`, blok ACL `jembatan-pi`, serta layanan `akun-broker` dan `mosquitto` (12 menit)

**(a) `edge/pusat.conf`.** Klik kanan folder **`edge`** → **New File…**, beri nama **`pusat.conf`**, isi (**Copy raw file** dari [`kode/edge/pusat.conf`](kode/edge/pusat.conf)), lalu simpan:

```text
# pusat.conf - broker PUSAT Rumah Pintar Mini di dalam kontainer (Modul 26, layanan mosquitto di compose.cloud.yml).
# Menyala di laptop (Modul 26) dan kelak di VPS (Modul 27). Backend masuk lewat nama layanan mosquitto:1883; gerbang Pi masuk
# lewat jembatan dengan akun jembatan-pi; simulator alat/ lewat loket 1883 laptop. Jalur di bawah = jalur DI DALAM kontainer.
# Sesudah mengubah berkas ini atau acl-broker: docker compose restart mosquitto (restart, bukan reload).
listener 1883
# tanpa nama pengguna dan sandi yang terdaftar, tidak boleh masuk (Modul 21)
allow_anonymous false
# berkas sandi tinggal di lemari data-broker (dibuat mosquitto_passwd DI DALAM kontainer; image menyerahkannya ke pengguna
# mosquitto setiap kali menyala, jadi tanpa urusan pemilik berkas di laptop)
password_file /mosquitto/data/sandi-broker
acl_file /mosquitto/config/acl-broker
# nama klien selalu = nama pengguna: tidak ada yang bisa menyamar atau menendang klien lain
use_username_as_clientid true
# pesan retained (status perangkat, config dari backend) dan sesi disimpan di lemari: tidak hilang saat kontainer dibuat ulang
persistence true
persistence_location /mosquitto/data/
# log ke layar kontainer: dibaca dengan docker compose logs mosquitto (dibatasi 3 x 10 MB oleh compose.cloud.yml)
log_dest stdout
log_type error
log_type warning
log_type notice
log_type information
# hapus # di depan baris berikut untuk melihat juga pesan yang DITOLAK daftar izin (Denied PUBLISH, Modul 21);
# akibatnya log jauh lebih ramai
# log_type debug
```

Intinya sama dengan `mosquitto-lan.conf` [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#6-penjaga-pintu-broker-berkas-sandi-dan-satu-akun-untuk-setiap-program). Yang baru: berkas sandi di lemari, `persistence true` (pesan *retained* selamat saat kontainer dibuat ulang), dan log ke layar kontainer. Jalurnya = jalur **di dalam** kontainer.

**(b) Blok ACL `7) jembatan-pi`.** Buka `edge/acl-broker`-mu, jangan ditimpa (blok 2 berisi device_id-mu; jalur laptop juga blok 2b dari [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#51-siapkan-kebun-node-2-yang-terdengar-atau-kebun-tiruan-dari-simulator-15-menit)). Tambahkan blok 7 dari [`kode/edge/acl-broker`](kode/edge/acl-broker) di paling bawah (`# …` = dua baris penjelasannya), lalu simpan; akunnya dibuat di [6.2](#62-laptop-berkas-gerbang-di-edge-akun-jembatan-pi-lalu-push-cabang-5-menit):

```text
# 7) Jembatan gerbang Pi (Modul 26): berlaku di broker PUSAT (compose.cloud.yml), tempat jembatan masuk dengan akun ini.
# …
user jembatan-pi
topic write rpm/+/telemetry
topic write rpm/+/status
topic write rpm/+/vitals
topic write rpm/+/ack
topic read rpm/+/cmd
```

**(c) Dua layanan broker** (sudah ada di berkas 5.2; komentar dibuang, `# …` = dilewati):

```yaml
  akun-broker:
    # …
    environment:
      MQTT_PASSWORD: ${MQTT_PASSWORD:?isi MQTT_PASSWORD di .env}
    command:
      - sh
      - -c
      - |
        set -e
        if [ -f /mosquitto/data/sandi-broker ]; then
          echo "berkas sandi broker sudah ada: dilewati"
        else
          mosquitto_passwd -b -c /mosquitto/data/sandi-broker backend "$$MQTT_PASSWORD"
          chmod 600 /mosquitto/data/sandi-broker
          echo "akun broker backend dibuat"
        fi
    # …
    tmpfs:
      - /mosquitto/log
    restart: "no"
    # …
  mosquitto:
    # …
    volumes:
      - ./edge/pusat.conf:/mosquitto/config/mosquitto.conf:ro
      - ./edge/acl-broker:/mosquitto/config/acl-broker:ro
      - data-broker:/mosquitto/data
    # …
    ports:
      - "${PORT_MQTT:-1883}:1883"
    depends_on:
      akun-broker:
        condition: service_completed_successfully
    # …
```

`akun-broker` = layanan **sekali jalan**: membuat akun `backend` hanya bila berkas sandi di lemari `data-broker` belum ada. `$$` = tanda `$` untuk `sh` ([🔁 Langkah 4](#langkah-4--variabel-lingkungan-dari-latihanenv-nilai-bawaan-isian-kosong-dan-angka-tanpa-kutip)); `tmpfs` mencegah lemari tanpa nama ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)). `mosquitto` memasang dua berkas repo hanya-baca (`:ro`). Loketnya tanpa `127.0.0.1`, jadi terbuka ke WiFi rumah untuk gerbang Pi dan ESP32 ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)); di WiFi umum, `docker compose stop mosquitto` (aturan aman nomor 1).

**(d) Sandi akun `backend`.** Di terminal akar proyek, perintah `JWT_SECRET` [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#11-buat-stempel-panitia-jwt_secret-5-menit):

```text
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Tempel hasilnya di `.env` akar, baris `MQTT_PASSWORD=`, simpan, dan catat di pengelola sandimu. `akun-broker` memakainya sekali, saat lemari broker kosong (mengganti sandi kelak: komentar `.env.example`).

#### 5.2 `compose.cloud.yml` tahap kedua: `migrasi`, `backend`, `web`, dan `TOKO_IMAGE` di `.env` (15 menit)

Buka [`kode/tahap/praktik-5/compose.cloud.yml`](kode/tahap/praktik-5/compose.cloud.yml) di GitHub, klik **Copy raw file**, lalu tempel menggantikan **seluruh** isi `compose.cloud.yml`-mu dan simpan. Semua layanan kini memakai batas log `x-log`, dan `grafana` mendapat pemeriksaan kesehatan `curl` (*provisioning* menunggu Praktik 7). Potongan yang baru:

```yaml
x-setelan-backend: &setelan-backend
  MQTT_URL: mqtt://mosquitto:1883
  # …
  DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD:?isi POSTGRES_PASSWORD di .env}@db:5432/rumahpintar
  HOST: 0.0.0.0
  # …
  TZ: Asia/Jakarta
# …
services:
  # …
  migrasi:
    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-backend:1.3.0
    build: ./backend
    command: ["node", "src/db/migrasi.ts"]
    environment: *setelan-backend
    # …
  backend:
    # …
    ports:
      - "127.0.0.1:${PORT_BACKEND:-8080}:8080"
    depends_on:
      db:
        condition: service_healthy
      mosquitto:
        condition: service_started
      migrasi:
        condition: service_completed_successfully
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8080/health',{method:'HEAD'}).then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
      # …
  web:
    image: ${TOKO_IMAGE:?isi TOKO_IMAGE di .env}/rumah-pintar-mini-web:1.2.0
    build:
      context: ./frontend
      args:
        VITE_API_BASE: /api
    volumes:
      - ./frontend/caddy:/etc/caddy:ro
    ports:
      - "${ALAMAT_WEB:-127.0.0.1}:${PORT_WEB:-80}:80"
    depends_on:
      backend:
        condition: service_healthy
    # …
```

Setelan backend datang dari `.env` akar, bukan `backend/.env`; alamatnya nama layanan, dan `HOST: 0.0.0.0` hanya berlaku di dalam kontainer ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)). `migrasi` = cetakan backend dengan perintah lain. `backend` sehat bila `HEAD /health` dijawab, ketukan yang dijanjikan [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#6-satpam-di-setiap-pintu-peran-admin-dan-viewer); `web` menunggunya, jadi `/api` tidak lagi `502` seperti di [3.4](#34--uji-cetakan-web-sendirian-di-loket-8088-200-404-dan-502-yang-wajar-8-menit). Di akhir berkas, `uptime-kuma` berprofil `pantau` dan mati sampai dinyalakan ([🧩 Tingkat 2](#tingkat-2--uptime-kuma-profil-pantau-dan-satu-monitor-lewat-nama-layanan-isi-bagian-rumpang-40-menit)); dengan `web` (Caddy), isi berkas pusat kini sesuai Silabus ([Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang)).

Lalu isi dua baris lagi di `.env` akar:

1. **`JWT_SECRET=`**: salin dari `backend/.env`, seperti lab penulis. Rahasia baru = semua orang harus **Masuk** lagi.
2. **`TOKO_IMAGE=ghcr.io/<akun-huruf-kecil>`**, misalnya `ghcr.io/budi-santoso`. Wajib walau toko image baru dipakai di [10.2](#102-docker-login-ghcrio-lalu-docker-compose-build-dan-push-13-menit), supaya Compose tidak pernah menarik image orang lain ([Konsep 5](#5-satu-berkas-untuk-satu-rumah-docker-compose)).

Telegram boleh kosong sampai [7.2](#72-composecloudyml-akhir-layanan-akun-grafana-dan-rahasia-grafana-di-env-8-menit) (log backend: `notifikasi Telegram mati: TELEGRAM_BOT_TOKEN belum diisi`; Grafana lama tetap mengirim). Periksa:

```text
docker compose config --quiet
```

**Hasilnya:** diam (lab penulis: kode keluar 0). Ada yang masih kosong? Misalnya:

```text
error while interpolating services.migrasi.image: required variable TOKO_IMAGE is missing a value: isi TOKO_IMAGE di .env
```

Bagian depannya berganti-ganti (lab penulis); bacalah akhirnya, `isi <NAMA> di .env`.

#### 5.3 ⭐ Satu perintah menyalakan seluruh rumah: `docker compose up -d --build` dan `ps -a` (10 menit)

Inilah perintah Silabus. Di terminal akar proyek (`--build` = bangun dulu cetakan `backend` dan `web`):

```text
docker compose up -d --build
```

**Hasilnya** (lab penulis, dipotong; toko image tiruan lab ditulis `ghcr.io/<akun>`, baris Telegram tiruan lab dibuang):

```text
[+] Building 5.5s (30/30) FINISHED
…
 ✔ ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0  Built              0.0s
 ✔ ghcr.io/<akun>/rumah-pintar-mini-web:1.2.0      Built              0.0s
 ✔ Volume rumahpintar_data-broker                  Created            0.0s
 ✔ Container rumahpintar-db-1                      Healthy           11.2s
 ✔ Container rumahpintar-akun-broker-1             Exited             4.8s
 ✔ Container rumahpintar-mosquitto-1               Started            5.0s
 ✔ Container rumahpintar-grafana-1                 Started            9.2s
 ✔ Container rumahpintar-migrasi-1                 Exited            11.7s
 ✔ Container rumahpintar-backend-1                 Healthy           21.6s
 ✔ Container rumahpintar-web-1                     Started           21.9s
```

Lapisan Praktik 2–3 masih tersimpan, jadi semuanya `CACHED` (±31 detik seluruhnya); tanpa itu, cetakan dimasak dari nol seperti di 2.4 dan 3.3 (Pi 5 penulis: 45,8 dan 103 detik). `db` dan `grafana` dibuat ulang, lemarinya tetap. `address already in use`? Loket 1883 atau 80 masih terpakai ([🚨](#-kalau-tidak-jalan)). Lalu:

```text
docker compose ps -a
```

**Hasilnya** (lab penulis, contoh):

```text
NAME                        IMAGE                                            COMMAND                  SERVICE       CREATED          STATUS                      PORTS
rumahpintar-akun-broker-1   eclipse-mosquitto:2.1.2-alpine                   "/docker-entrypoint.…"   akun-broker   31 seconds ago   Exited (0) 26 seconds ago
rumahpintar-backend-1       ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0   "docker-entrypoint.s…"   backend       29 seconds ago   Up 17 seconds (healthy)     127.0.0.1:8080->8080/tcp
rumahpintar-db-1            timescale/timescaledb:2.30.2-pg17                "docker-entrypoint.s…"   db            30 seconds ago   Up 26 seconds (healthy)     127.0.0.1:5432->5432/tcp
rumahpintar-grafana-1       grafana/grafana:13.2.4                           "/run.sh"                grafana       29 seconds ago   Up 20 seconds (healthy)     127.0.0.1:3000->3000/tcp
rumahpintar-migrasi-1       ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0   "docker-entrypoint.s…"   migrasi       29 seconds ago   Exited (0) 17 seconds ago
rumahpintar-mosquitto-1     eclipse-mosquitto:2.1.2-alpine                   "/docker-entrypoint.…"   mosquitto     30 seconds ago   Up 25 seconds               0.0.0.0:1883->1883/tcp, [::]:1883->1883/tcp
rumahpintar-web-1           ghcr.io/<akun>/rumah-pintar-mini-web:1.2.0       "caddy run --config …"   web           28 seconds ago   Up 6 seconds                443/tcp, 127.0.0.1:80->80/tcp, 2019/tcp, 443/udp
```

`mosquitto` dan `web` memang tanpa pemeriksaan kesehatan. Dua sekali jalan `Exited (0)`: pulang dengan tugas beres; tanpa `-a` keduanya tidak tampil. Hanya broker yang terbuka ke WiFi (`0.0.0.0`); `443` dan `2019` di baris `web` bawaan image Caddy, tidak dibuka. Terakhir:

```text
docker compose logs migrasi akun-broker
```

**Hasilnya** (lab penulis):

```text
migrasi-1  | 0 migrasi baru diterapkan, 8 sudah ada sebelumnya.
akun-broker-1  | Adding password for user backend
akun-broker-1  | akun broker backend dibuat
```

`migrasi` gagal `password authentication failed for user "postgres"`? `POSTGRES_PASSWORD` bukan sandi lama ([4.2](#42-kebersihan-git-dulu-gitignore-gitattributes-lalu-env-dengan-sandi-postgres-lama-5-menit)).

**Kamu lulus langkah ⭐ ini** kalau `ps -a` menunjukkan tiga `(healthy)`, `mosquitto` dan `web` `Up`, dua sekali jalan `Exited (0)`, dan `migrasi` menulis `0 migrasi baru diterapkan`.

#### 5.4 ⭐ Masuk lewat Caddy di `http://localhost`: F5, Bruno, dan Swagger (8 menit)

Di Chrome, buka **`http://localhost`** (loket 80, pintu depan Caddy) → `/masuk`. **Masuk** dengan akun **lamamu**: akun tersimpan di lemari database. **Hasilnya:** `/perangkat` dengan lencana **Live** dan `Admin Rumah (admin)`; di lab penulis, akun lama dari lemari Modul 17–25 diterima lewat Caddy (`/auth/me`: peran `admin`). Perangkatmu baru `Online` di 5.5 atau 6.6.

Ketik langsung `http://localhost/peta` dan `http://localhost/perangkat/f00d00000001`, lalu **F5**: halamannya utuh, janji F5 [Modul 24](../../fase-4-frontend-dashboard/modul-24-kendali-aturan-peran/README.md#15--back-f5-dan-tautan-langsung-layar-bertahan-sambungan-live-tidak-putus-10-menit) ditepati (lab penulis: lima alamat `200` `text/html`). Bruno, *environment* `lokal` (`http://127.0.0.1:8080`): **`login admin`** lalu **`daftar perangkat`** → `200` lewat loket backend (lab penulis: lewat `curl`). Swagger: **`http://localhost:8080/docs`**, bukan `127.0.0.1` (*login* **Try it out** `403`, [Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)); abaikan `0.0.0.0` di log backend. Terakhir (PowerShell: `curl.exe`, tidak diuji penulis):

```text
curl -I http://localhost:8080/health
```

**Hasilnya** (lab penulis, baris pertama): `HTTP/1.1 200 OK`. `-I` = `HEAD`, ketukan pemeriksa kesehatan tiap 15 detik, dan backend 1.3.0 tidak mencatatnya: `docker compose logs backend | grep -c /health` (bash) menjawab `0` di lab penulis. Gambar lab penulis (simulator 5.5 sudah menyala; kanan bawah = [🧩 Tingkat 1](#tingkat-1--dashboard-dari-hp-mode-hp-lewat-env-ubah-sedikit-20-menit)):

![Komposit empat tangkapan layar asli dashboard Rumah Pintar Mini v1.2 bertema terang, disajikan Caddy di Docker Compose, di Chrome 156, Linux di Raspberry Pi 5 sebagai laptop, Praktik 5.4. Kiri atas, http://localhost/masuk: kartu Rumah Pintar Mini, Masuk dengan akun Modul 20 untuk melihat dashboard, Email admin@rumah.test, Sandi berisi titik-titik, tombol hijau Masuk (nomor 1). Kanan atas, http://localhost/perangkat sesudah Masuk: kepala Rumah Pintar Mini dengan lencana hijau Live (nomor 2), menu Perangkat, Peta, Aturan, Admin Rumah (admin), Keluar; Daftar Perangkat dengan kartu Latihan ruang tamu, Online, kunci aktif, ruang tamu · f00d00000001, Suhu 27.3 °C, terakhir dilihat baru saja (nomor 3); kartu Latihan teras, belum terdaftar, kiriman diabaikan backend; kartu Kebun (tiruan), Online, lewat penghubung (nomor 3), Suhu 29.2 °C, terakhir dilihat 2 menit yang lalu. Kiri bawah, halaman detail yang dibuka langsung di http://localhost/perangkat/f00d00000001 seperti sesudah F5: Kembali ke daftar, Riwayat, judul Latihan ruang tamu (nomor 4) dengan kunci aktif, node1, Online, terakhir dilihat 8 detik yang lalu, Kendali Lampu Mati dan Kipas Mati, Pompa siram selama 3, 5, 10 detik, kartu grafik garis Suhu (°C) · 5 menit terakhir dengan tombol Suhu, Cahaya, Kelembapan, sumbu 24 sampai 36 dan jam 22.54 sampai 22.58 (nomor 5), di bawahnya diperbarui pukul 22.57.51 WIB (nomor 5). Kanan bawah, Tantangan Tingkat 1 mode HP, mode perangkat Chrome 375 piksel di mesin yang sama, bukan HP sungguhan, alamat http://192.168.1.10/perangkat: kepala Rumah Pintar Mini dengan Live (nomor 6), menu dalam dua baris, Daftar Perangkat dengan tiga kartu bertumpuk, Latihan ruang tamu Suhu 30.9 °C dan Kebun (tiruan) Suhu 26.2 °C. Data dari simulator f00d00000001 dan Kebun tiruan sejak 22.25 WIB; IP LAN mesin lab disamarkan menjadi 192.168.1.10.](aset/dashboard-lewat-caddy.png)

**Kamu lulus langkah ⭐ ini** kalau kamu masuk lewat `http://localhost` dengan akun lama, F5 tetap menampilkan dashboard, Bruno menjawab `200`, dan `curl -I` `200 OK`.

#### 5.5 ⭐ Data *live* lewat broker pusat: simulator, Kebun tiruan, dan tombol lampu (7 menit)

Broker pusat baru mengenal akun `backend`. Perangkat latihan `f00d00000001` ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#38-simulator-dan-pemeriksa-kontrak-versi-modul-21-8-menit)) butuh akunnya, bersandi `KUNCI_F00D00000001` dari `alat/.env`. Di terminal akar proyek (tempel kuncinya dua kali):

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker f00d00000001
```

**Hasilnya:** `Password:`, `Reenter password:`, `Adding password for user f00d00000001`. Tanpa `-u mosquitto` (pemilik berkas sandi) muncul peringatan `owner is not root`. Lalu *restart*, bukan *reload* ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#44-jalur-perangkat-kunci-pintunya-lalu-restart-10-menit)):

```text
docker compose restart mosquitto
```

Backend menulis `broker belum terjangkau, mencoba lagi dalam 5 detik`, lalu `tersambung ke broker mqtt://mosquitto:1883 sebagai backend` (lab penulis). Akun lain (`pemeriksa`, `pemantau`, Node 1, `jembatan-pi` di 6.2) dibuat dengan dua perintah yang sama. Di terminal `alat`:

```text
node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1883 1
```

Sesudah `f00d00000001: online`, jalur laptop mengetik `kebun mulai` (Kit B tidak; blok 2b hanya jalur laptop). **Hasilnya** (lab penulis, dipotong):

```text
f00d00000001: online
kebun mulai
Kebun tiruan f00d000000b2 menyala lewat f00d00000001: satu paket sekarang, lalu setiap 300 detik.
f00d000000b2: Kebun bangun pukul 21.08.56 WIB, paketnya diterbitkan f00d00000001
```

Alamat jalur laptop tetap; yang menjawab kini broker kontainer. Dashboard: **Live**, `Latihan ruang tamu` `Online`, Kebun `Online` `lewat penghubung`. Di detail `Latihan ruang tamu`, kartu **Kendali**, ketuk **Lampu**: `Mati` menjadi `Nyala` sesudah `ack`. Lab penulis mengirim perintah yang sama lewat API di balik Caddy; log backend:

```text
backend-1  | [21:09:53] INFO: perintah c-20261028-140953-1 (api) ke f00d00000001: lampu = true, ack ok=true dalam 19 ms
```

Lalu ✅ Grafana lama datang sendiri, seperti yang diterima server Telegram tiruan di lab penulis: `✅ Latihan ruang tamu kembali mengirim data.` (juga Kebun). Kit B: Node 1 dan Node 2 di 6.6. Jalur laptop dengan ESP32 sungguhan (tidak diuji penulis): firmware tetap; cukup akun Node 1 di broker pusat. Bagi jalur laptop, langkah ini **pengganti L4** ([Silabus §5.3](../../SILABUS.md#53-kit-b--raspberry-pi-sebagai-gateway-dibutuhkan-mulai-modul-12)); gerbang di laptop yang sama ada di [6.7](#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit).

**Kamu lulus langkah ⭐ ini** kalau lencana **Live** menyala, perangkat latihan (dan Kebun) `Online`, dan lampu dijawab `ack`.

#### 5.6 Log kontainer, lalu berpindah antara mode rumah dan mode kembang (8 menit)

```text
docker compose logs -f backend
```

**Hasilnya** (lab penulis, dipotong; jam WIB berkat `TZ`):

```text
backend-1  | [21:04:52] INFO: database siap
…
backend-1  | [21:04:52] INFO: tersambung ke broker mqtt://mosquitto:1883 sebagai backend
backend-1  | [21:05:38] INFO: login: akun 1 (admin), sesi 2, IP 172.19.0.7
```

**Ctrl + C** hanya berhenti membaca; variasinya `--since 5m`, `-n 50`, `-t` ([Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log)). IP `172.19.0.7` = Caddy.

**Mode kembang** (mengubah kode, seperti Modul 16–25), **satu backend saja**:

1. Terminal akar: `docker compose stop backend web` (lab penulis: keduanya `Stopped`).
2. Salin [`kode/backend/.env.example`](kode/backend/.env.example) (**Copy raw file**) ke `backend/.env.example`. Di `backend/.env`-mu: `MQTT_URL=mqtt://127.0.0.1:1883` (Kit B: tadinya IP Pi) dan `MQTT_PASSWORD` = milik `.env` akar; `DATABASE_URL` dan `PORT=8080` tetap.
3. `npm run dev` di terminal `backend` (lab penulis: `tersambung ke broker mqtt://127.0.0.1:1883 sebagai backend`) dan `frontend`, lalu `http://localhost:5173` → **Masuk** → **Live**. Ada `frontend/.env.local`? Isinya harus `VITE_API_BASE=http://localhost:8080`; dengan `127.0.0.1`, *cookie* tak terkirim (`Sesi sudah habis`, [Modul 22](../../fase-4-frontend-dashboard/modul-22-react-dasar/README.md#9-login-dari-browser-cookie-cors-dan-localhost)).
4. Kembali: **Ctrl + C** di keduanya (`SIGINT diterima: backend berhenti dengan rapi`), lalu `docker compose start backend web` (lab penulis: `akun-broker` dan `migrasi` ikut jalan lalu `Exited`, aman).

> [!WARNING]
> **Dua backend sekaligus?** Di loket yang sama, `npm run dev` gagal `address already in use 127.0.0.1:8080`. Di loket lain, keduanya saling menendang di broker (`session taken over`, `broker belum terjangkau`), dan bila token Telegram terisi (7.2), Telegram menolak salah satunya dengan `409: Conflict` (lab penulis, Telegram tiruan); bot yang kalah baru hidup lagi sesudah `docker compose restart backend`.

Simpan ke cabang dari terminal akar (`.env` ditahan `.gitignore`):

```text
git add compose.cloud.yml edge/pusat.conf edge/acl-broker backend/.env.example
```

```text
git commit -m "Seluruh rumah dalam Docker Compose: broker pusat, migrasi, backend, web (Modul 26 Praktik 5)"
```

> ⬆️ **Selesai Praktik 5?** Lanjut ke [Praktik 6](#praktik-6--gerbang-pi-kit-b-docker-engine-edgecomposeedgeyml-dan-jembatan-lan-70-menit-jalur-laptop-25-menit) bila punya Kit B, atau langsung ke [6.7](#67-jalur-laptop-pengganti-l4-lalu-gerbang-di-laptop-yang-sama-525-menit) bila tanpa Pi. Dasarnya ada di [Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang).

### Praktik 6 — Gerbang Pi (Kit B): Docker Engine, `edge/compose.edge.yml`, dan jembatan LAN (70 menit; jalur laptop 25 menit)

> 🖥️ **Alat yang dipakai:** **terminal SSH ke Pi** ([Modul 12](../../fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md#4-ssh-terminal-jarak-jauh)), mulai 6.3 di folder `rumah-pintar-mini/edge`; **VS Code** di laptop dengan terminal di **akar proyek** (6.2 dan log broker pusat di 6.5); **Docker Desktop** atau **Docker Engine** di laptop dengan rumah Compose yang menyala sejak 5.3; **Chrome** atau **Edge** (`http://localhost`); Node 1 dan Node 2 menyala; pengelola sandimu. Jalur laptop: cukup VS Code dengan terminal `alat` (6.7). Konsep yang dipakai: 10.
>
> ⭐ **Wajib untuk Kit B** — langkah 6.4, 6.5, dan 6.6: berkas sandi lama Pi tersalin ke lemari gerbang, jembatan gerbang tersambung ke broker pusat, dan Node 1 masuk dengan akun lamanya sampai datanya tampil *live* di dashboard laptop (**L4**). Jalur laptop menggantinya dengan 5.5.

> [!NOTE]
> **Tidak direkam penulis di Raspberry Pi OS.** Langkah Pi ditulis dari dokumentasi resmi Docker dan resep [`kode/edge/README.md`](kode/edge/README.md). Di lab penulis, satu mesin Linux memerankan laptop DAN Pi: gerbang berjalan sebagai proyek Compose kedua di loket 1884 dengan `ALAMAT_PUSAT=host-gateway` (persis 6.7), `sudo cat` dan `systemctl` diganti berkas dan kontainer lab, dan Node 1 diperankan simulator. 6.1 tidak dijalankan sama sekali; ESP32 sungguhan, GitHub sungguhan, dua mesin di LAN, dan Node-RED di Pi juga belum diuji penulis (rincian di [📚 Sumber](#-sumber--atribusi-gambar)).

Silabus meminta satu perintah di laptop **maupun** di Pi. Di Pi, broker Mosquitto apt dari Modul 12 diganti broker yang sama di dalam kontainer: alamat, port 1883, dan akun lamanya tetap, jadi firmware tidak disentuh. Yang baru hanya jembatan LAN pertama ke broker pusat di laptop, yang belum TLS dan belum menahan data saat laptop mati: keduanya Modul 27 ([Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang)).

#### 6.1 Pi: Docker Engine dari repo apt Docker, grup `docker`, dan Git (20 menit)

Masuk ke Pi lewat SSH, lalu pastikan sistemnya 64-bit:

```text
dpkg --print-architecture
```

Harus `arm64`; `armhf` berarti Pi OS 32-bit (`uname -m` bisa tetap `aarch64`), yang hanya didukung sampai Docker Engine 28: pakai jalur laptop (6.7).

Pasang Docker Engine dari **repo apt Docker** dengan halaman resmi untuk **Debian**, <https://docs.docker.com/engine/install/debian/>, bagian *Install using the apt repository*. Raspberry Pi OS 64-bit adalah Debian; halaman "Raspberry Pi OS" di situs Docker khusus 32-bit. Salin perintahnya dari halaman itu:

1. Copot paket lama yang bentrok (`docker.io`, `docker-compose`, `docker-doc`, `docker-buildx`, `podman-docker`, `containerd`, `runc`) dengan perintah pembuka halaman itu.
2. Pasang kunci dan sumber repo Docker (*Set up Docker's apt repository*).
3. Pasang paketnya:

```text
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Skrip `get.docker.com` yang sering dipakai tutorial tidak kita pakai: menurut dokumentasinya, ia "isn't recommended for production environments" dan tidak dirancang untuk memperbarui Docker yang sudah terpasang.

Supaya `docker` bisa dipakai tanpa `sudo`, masukkan penggunamu ke grup `docker`:

```text
sudo usermod -aG docker $USER
```

Keluar dari SSH (`exit`), lalu masuk lagi: keanggotaan grup baru berlaku sesudah masuk ulang. **Grup `docker` setara root** (dokumentasi Docker): anggotanya bisa menguasai seluruh Pi lewat Docker, jadi hanya untuk penggunamu sendiri ([🔬](#-bedah-teknis-opsional)). Periksa:

```text
docker version
```

```text
docker compose version
```

**Hasil yang diharapkan** (tidak direkam di Pi): bagian `Client` dan `Server` sama-sama menyebut `linux/arm64`, lalu satu baris `Docker Compose version …`. Ditolak dengan `permission denied` yang menyebut `docker.sock`? Kamu belum keluar-masuk SSH ([🚨](#-kalau-tidak-jalan) *Di Pi, setiap perintah `docker` ditolak tanpa `sudo`*). Docker menyala sendiri setiap Pi dinyalakan (dokumentasi Docker).

Terakhir, Git (Pi OS Lite belum tentu punya):

```text
sudo apt install git
```

*Clone*-nya menunggu 6.3, sesudah laptop mendorong cabangnya.

#### 6.2 Laptop: berkas gerbang di `edge/`, akun `jembatan-pi`, lalu *push* cabang (5 menit)

Pi mengambil berkasnya dari GitHub, jadi berkas gerbang ditulis dulu di laptop. Di Explorer VS Code, buat lima berkas ini, masing-masing lewat **Copy raw file** dari tautannya:

- [`edge/compose.edge.yml`](kode/edge/compose.edge.yml), [`edge/gerbang.conf`](kode/edge/gerbang.conf), [`edge/jembatan.contoh.conf`](kode/edge/jembatan.contoh.conf), dan [`edge/.env.example`](kode/edge/.env.example), yang dibaca di 6.3;
- [`edge/jembatan/README.md`](kode/edge/jembatan/README.md), di folder baru `edge/jembatan`. Git tidak menyimpan folder kosong; tanpa berkas ini, `jembatan/` tidak ada di Pi (`cp` 6.3 gagal), dan bila Docker lebih dulu membuatnya, foldernya milik `root` (lab penulis).

`edge/pusat.conf` dan blok `7) jembatan-pi` di `edge/acl-broker` sudah kamu tulis di [5.1](#51-broker-pusat-edgepusatconf-blok-acl-jembatan-pi-serta-layanan-akun-broker-dan-mosquitto-12-menit).

**Akun `jembatan-pi` di broker pusat.** Buat sandi acak seperti `MQTT_PASSWORD` di 5.1 (d) dan simpan di pengelola sandimu (dipakai lagi di 6.3). Lalu, di terminal akar proyek, dengan pola akun simulator di 5.5:

```text
docker compose exec -u mosquitto mosquitto mosquitto_passwd /mosquitto/data/sandi-broker jembatan-pi
```

Tempel sandinya dua kali (tidak tampil). **Hasilnya** (lab penulis):

```text
Password:
Reenter password:
Adding password for user jembatan-pi
```

Berkas sandi berubah, jadi broker di-*restart* ([Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#44-jalur-perangkat-kunci-pintunya-lalu-restart-10-menit): *restart*, bukan *reload*):

```text
docker compose restart mosquitto
```

**Hasilnya** (lab penulis):

```text
[+] Restarting 1/1
 ✔ Container rumahpintar-mosquitto-1  Started    1.1s
```

**Simpan ke cabang, lalu *push*.** Satu per satu:

```text
git add edge
```

```text
git commit -m "Gerbang Pi: compose.edge.yml, gerbang.conf, contoh jembatan (Modul 26 Praktik 6)"
```

```text
git push -u origin fitur/docker-compose
```

Itu *push* pertama cabang ini ([8.5 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#85-commit-dan-push-cabangnya)); GitHub menjawab dengan ringkasan *push*-nya. Tanpa *push*, Pi hanya mendapat `main` keadaan Modul 25, karena cabang ini baru digabung di [➕ E](#e--gabungkan-fiturdocker-compose-ke-main-lewat-pull-request-seluruh-sistem-dalam-docker-compose).

#### 6.3 Pi: cabang dari GitHub, `edge/.env`, `jembatan/pusat.conf`, dan isi `compose.edge.yml` (8 menit)

Di terminal SSH ke Pi, dari folder awal (`~`), satu per satu:

```text
git clone https://github.com/<akun>/rumah-pintar-mini.git
```

```text
cd rumah-pintar-mini
```

```text
git switch fitur/docker-compose
```

**Hasilnya** (lab penulis, perintah terakhir):

```text
branch 'fitur/docker-compose' set up to track 'origin/fitur/docker-compose'.
Switched to a new branch 'fitur/docker-compose'
```

Repo `rumah-pintar-mini` publik sejak Modul 3, jadi *clone* tidak meminta *login* ([8.4 Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#84-github-ikut-berjaga-5-menit)); repo yang kamu jadikan privat memintanya. Lalu masuk ke folder gerbang dengan `cd edge`.

**(a) `edge/.env`.** Contohnya:

```text
# edge/.env.example - setelan Docker Compose GERBANG (Raspberry Pi) Rumah Pintar Mini (Modul 26), untuk compose.edge.yml.
# Di Pi, dari folder edge: cp .env.example .env, isi baris yang kosong, lalu chmod 600 .env. edge/.env tidak ikut Git.

# Nama berkas Compose. Dengan baris ini, "docker compose up -d" di folder edge sudah cukup (tanpa -f compose.edge.yml).
COMPOSE_FILE=compose.edge.yml

# Alamat broker PUSAT = IP laptop yang menjalankan compose.cloud.yml, misalnya 192.168.1.20 (pesan alamat tetap di router,
# seperti mode HP Modul 23: kalau IP laptop berganti, jembatan putus). Gerbang dicoba di laptop yang sama: host-gateway
ALAMAT_PUSAT=

# Loket broker gerbang. Di Pi: 1883 (firmware Node 1 memakai 1883). Gerbang dicoba di laptop yang sama dengan
# compose.cloud.yml: 1884, karena 1883 sudah dipakai broker pusat.
PORT_GERBANG=1883

# Modul 27 (belum dipakai di Modul 26): token Cloudflare Tunnel untuk profil "terowongan". Rahasia.
TUNNEL_TOKEN=
# Node-RED dalam kontainer (profil "nodered", opsional; Modul 26 tetap memakai Node-RED systemd): loket editor.
PORT_NODERED=1880

# Profil yang ikut menyala dengan "docker compose up -d". Kosong = hanya broker gerbang.
# COMPOSE_PROFILES=nodered
```

```text
cp .env.example .env
```

Buka dengan `nano .env`, isi `ALAMAT_PUSAT=` dengan IP laptop, mis. `ALAMAT_PUSAT=192.168.1.10` (IP-mu berbeda; cari seperti [mode HP Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop); pesan alamatnya di router seperti Pi di Modul 12). `PORT_GERBANG` tetap 1883, port tujuan firmware Node 1. Simpan (**Ctrl + O**, **Enter**, **Ctrl + X**), lalu:

```text
chmod 600 .env
```

**(b) `jembatan/pusat.conf`.** Contohnya:

```text
# jembatan.contoh.conf - CONTOH jembatan (bridge) dari broker gerbang Pi ke broker pusat di laptop (Modul 26).
# Salin menjadi edge/jembatan/pusat.conf (cp jembatan.contoh.conf jembatan/pusat.conf), lalu ganti sandinya. Salinan itu
# berisi sandi, jadi tidak ikut Git. Jembatan pertama ini masih polos (belum TLS) dan belum menahan pesan saat pusat mati:
# keduanya Modul 27.
connection pusat
# "pusat" = nama yang diarahkan compose.edge.yml ke ALAMAT_PUSAT di edge/.env (IP laptop yang menjalankan compose.cloud.yml).
# Biarkan tertulis "pusat"; yang diganti alamat di edge/.env. 1883 = loket PORT_MQTT broker pusat.
address pusat:1883
# nama klien jembatan dibuat tetap. Bawaannya memuat nama kontainer, yang berganti setiap kontainer dibuat ulang.
remote_clientid jembatan-pi
# akun jembatan-pi di broker PUSAT (dibuat dengan mosquitto_passwd di kontainer pusat; izinnya blok 7 di acl-broker)
remote_username jembatan-pi
remote_password ganti-dengan-sandi-akun-jembatan-pi
# pesan perangkat naik ke pusat (out), perintah dari backend turun ke perangkat (in), QoS 1
topic rpm/+/telemetry out 1
topic rpm/+/status out 1
topic rpm/+/vitals out 1
topic rpm/+/ack out 1
topic rpm/+/cmd in 1
```

```text
cp jembatan.contoh.conf jembatan/pusat.conf
```

Dengan `nano jembatan/pusat.conf`, ganti `ganti-dengan-sandi-akun-jembatan-pi` dengan sandi dari 6.2. Baris `address pusat:1883` biarkan: alamatnya datang dari `.env`. Simpan, lalu `chmod 600 jembatan/pusat.conf`. Broker tetap bisa membacanya, karena Mosquitto membaca konfigurasi sebelum turun hak menjadi pengguna `mosquitto` (lab penulis). `git status --short --ignored` menandai kedua berkas rahasia ini `!!`, artinya diabaikan Git.

**(c) Dua berkas yang dibaca broker gerbang.** Cukup dibaca; komentarnya menjelaskan setiap baris:

```text
# gerbang.conf - broker GERBANG Rumah Pintar Mini di Raspberry Pi, di dalam kontainer (Modul 26, edge/compose.edge.yml).
# Menggantikan paket Mosquitto apt + /etc/mosquitto/conf.d/gateway-pi.conf (Modul 12 dan 21). Perangkat tetap menyambung ke
# IP Pi port 1883 dengan akun lamanya, jadi firmware tidak berubah. Jalur di bawah = jalur DI DALAM kontainer.
# Sesudah mengubah berkas ini, acl-broker, atau jembatan/pusat.conf: docker compose restart mosquitto (restart, bukan reload).
listener 1883
# tanpa nama pengguna dan sandi yang terdaftar, tidak boleh masuk (Modul 21)
allow_anonymous false
# berkas sandi tinggal di lemari data-broker; berkas lama Pi (/etc/mosquitto/sandi-broker, format 2.0) dibaca Mosquitto 2.1.2
password_file /mosquitto/data/sandi-broker
acl_file /mosquitto/config/acl-broker
# nama klien selalu = nama pengguna (device_id): tidak ada yang bisa menyamar atau menendang perangkat lain
use_username_as_clientid true
# pesan retained dan sesi disimpan di lemari (sama dengan Mosquitto apt di Pi yang menyimpannya saat dimatikan)
persistence true
persistence_location /mosquitto/data/
# log ke layar kontainer: dibaca dengan docker compose logs mosquitto (dibatasi 3 x 10 MB oleh compose.edge.yml)
log_dest stdout
log_type error
log_type warning
log_type notice
log_type information
# hapus # di depan baris berikut untuk melihat juga pesan yang DITOLAK daftar izin (Denied PUBLISH, Modul 21);
# akibatnya log jauh lebih ramai
# log_type debug
# jembatan ke broker pusat: setiap berkas .conf di folder ini dibaca (edge/jembatan/pusat.conf, berisi sandi, tidak ikut Git)
include_dir /mosquitto/config/jembatan
```

```yaml
# compose.edge.yml - layanan GERBANG Rumah Pintar Mini di Raspberry Pi (Modul 26), pasangan compose.cloud.yml di laptop.
# Jalankan di Pi, dari folder edge:  docker compose up -d
#   Baris COMPOSE_FILE=compose.edge.yml di edge/.env membuat -f tidak perlu (contohnya edge/.env.example).
# Broker Mosquitto gerbang (menggantikan paket apt Modul 12) + jembatan ke broker pusat di laptop (jembatan/pusat.conf).
# cloudflared (Modul 27) dan Node-RED (opsional) hanya menyala kalau profilnya disebut, misalnya:
#   docker compose --profile nodered up -d
# Di Modul 26 keduanya TIDAK dinyalakan. JANGAN "docker compose down -v": -v menghapus lemari berisi berkas sandi broker.
name: rumahpintar-gerbang

# Log setiap kontainer dibatasi 3 berkas x 10 MB. Bawaan Docker TANPA batas: kartu microSD Pi bisa penuh pelan-pelan.
x-log: &log
  driver: json-file
  options:
    max-size: 10m
    max-file: "3"

services:
  # Broker gerbang: Node 1 (dan Node 2 lewat Node 1) tetap masuk ke IP Pi port 1883 dengan akun lamanya. Mosquitto 2.1.2
  # membaca berkas sandi lama Pi (format 2.0) apa adanya.
  mosquitto:
    image: eclipse-mosquitto:2.1.2-alpine
    volumes:
      # Konfigurasi dan daftar izin dari repo (hanya-baca). Sesudah mengubah salah satunya: docker compose restart mosquitto
      - ./gerbang.conf:/mosquitto/config/mosquitto.conf:ro
      - ./acl-broker:/mosquitto/config/acl-broker:ro
      # folder jembatan: berisi pusat.conf (sandi jembatan, tidak ikut Git)
      - ./jembatan:/mosquitto/config/jembatan:ro
      # berkas sandi (dipindah dari /etc/mosquitto/sandi-broker), pesan retained, dan sesi
      - data-broker:/mosquitto/data
    # Image Mosquitto menyiapkan folder log sebagai lemari, padahal log kita tampil di layar (docker compose logs).
    # tmpfs = folder sementara di RAM: tanpa ini Docker membuat lemari tanpa nama setiap kontainer ini dibuat baru.
    tmpfs:
      - /mosquitto/log
    ports:
      # semua antarmuka: perangkat masuk dari WiFi rumah. Firmware memakai 1883, jadi di Pi angka ini jangan diganti.
      - "${PORT_GERBANG:-1883}:1883"
    extra_hosts:
      # nama "pusat" di jembatan/pusat.conf diarahkan ke IP laptop yang menjalankan compose.cloud.yml (ALAMAT_PUSAT di
      # edge/.env). Gerbang dicoba di laptop yang sama (jalur laptop): ALAMAT_PUSAT=host-gateway (= mesin ini sendiri).
      - "pusat:${ALAMAT_PUSAT:?isi ALAMAT_PUSAT di edge/.env (IP laptop pusat)}"
    restart: unless-stopped
    logging: *log

  # Terowongan Cloudflare (Modul 27, jalur gratis): butuh TUNNEL_TOKEN di edge/.env. Profil "terowongan" = tidak menyala
  # sampai dipanggil: docker compose --profile terowongan up -d
  cloudflared:
    image: cloudflare/cloudflared:2026.10.5
    profiles: ["terowongan"]
    # program awal image sudah "cloudflared --no-autoupdate"; ini lanjutannya
    command: ["tunnel", "run"]
    environment:
      TUNNEL_TOKEN: ${TUNNEL_TOKEN:-}
    restart: unless-stopped
    logging: *log

  # Node-RED dalam kontainer (opsional). Modul 26 tetap memakai Node-RED systemd dari Modul 13. Sebelum profil ini dipakai,
  # matikan layanan nodered systemd (loket 1880 bentrok), pindahkan flow dan kredensialnya, lalu ganti alamat broker di flow
  # dari localhost menjadi mosquitto (di dalam kontainer, localhost = kontainer Node-RED sendiri).
  nodered:
    image: nodered/node-red:5.0.9-24
    profiles: ["nodered"]
    environment:
      TZ: Asia/Jakarta
    volumes:
      - data-nodered:/data
    ports:
      - "${PORT_NODERED:-1880}:1880"
    restart: unless-stopped
    logging: *log

volumes:
  # Lemari milik Compose: berkas sandi broker gerbang + pesan retained, dan data Node-RED (bila profilnya dipakai).
  data-broker:
  data-nodered:
```

- `gerbang.conf` = pengaturan Modul 21 (tanpa tamu anonim, berkas sandi, ACL, `use_username_as_clientid`) dengan jalur di dalam kontainer. Berkas sandinya tinggal di lemari `data-broker`, dan `include_dir` membaca setiap `.conf` di folder `jembatan/`.
- `extra_hosts` mengarahkan nama `pusat` ke `ALAMAT_PUSAT`. Kosong? Compose menolak menyala dengan `required variable ALAMAT_PUSAT is missing a value: isi ALAMAT_PUSAT di edge/.env (IP laptop pusat)` (lab penulis).
- Loket `${PORT_GERBANG:-1883}` tanpa `127.0.0.1`, karena perangkat masuk dari WiFi rumah.
- `cloudflared` (profil `terowongan`, Modul 27) dan `nodered` (profil `nodered`) tertulis, tetapi mati.

#### 6.4 ⭐ Pi: samakan ACL, salin berkas sandi lama ke lemari gerbang, lalu matikan broker apt (10 menit)

**(a) Samakan ACL.** Broker gerbang kini membaca `edge/acl-broker` dari repo, bukan `/etc/mosquitto/acl-broker`. Kalau dulu blok 2 (device_id Node 1 dan Node 2 aslimu, [5.2 Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#52-tulis-daftar-izin-edgeacl-broker-10-menit)) kamu ubah hanya di salinan Pi, data Node 2 lewat Node 1 akan ditolak. Bandingkan, dari folder `edge`:

```text
sudo diff /etc/mosquitto/acl-broker acl-broker
```

Baris berawalan `>` hanya ada di repo (blok 7, mungkin juga 2b): wajar. Baris berawalan `<` hanya ada di Pi; bila di antaranya ada `user …` atau `topic …`, salinan repo belum sama. Perbaiki **di laptop** (`edge/acl-broker` di VS Code), *commit*, `git push`, lalu di Pi `git pull`. Jangan menyunting `acl-broker` di Pi, supaya `git pull` berikutnya tidak bentrok. Alur ini, ditambah `docker compose restart mosquitto`, berlaku seterusnya untuk `gerbang.conf` dan `acl-broker`; pembaruan otomatis menunggu Modul 29. Langkah ini tidak diuji penulis.

**(b) Salin berkas sandi lama.** Ketik `sudo -v` dulu (Pi bisa meminta sandi), lalu perintah panjang ini:

```text
sudo cat /etc/mosquitto/sandi-broker | docker compose run --rm -T --no-deps mosquitto sh -c 'cat > /mosquitto/data/sandi-broker && chmod 600 /mosquitto/data/sandi-broker'
```

`sudo cat` membaca berkas sandi Modul 21, lalu `|` mengalirkannya ke kontainer sekali pakai (`run --rm`, `--no-deps`; `-T` = menerima aliran `|`) yang menulisnya ke lemari `data-broker` dengan mode `600`. Berkas lama tetap di tempatnya untuk jalan mundur. Mosquitto 2.1.2 membaca berkas format 2.0 ini apa adanya (Konsep 10), jadi semua akun lama ikut: perangkat, `nodered`, `pemantau`, `pemeriksa`.

**Hasilnya** (lab penulis; berkas lab format 2.0 menggantikan `sudo cat`):

```text
[+] Creating 2/2
 ✔ Network rumahpintar-gerbang_default     Created    0.1s
 ✔ Volume rumahpintar-gerbang_data-broker  Created    0.0s
```

Di Pi, baris unduhan image Mosquitto (±13 MB) ikut tampil. Lorong dan lemari gerbang terbentuk; kontainer sekali pakainya sudah dibuang. Kartu microSD baru tanpa berkas lama? Buat akunnya dari nol dengan resep [`kode/edge/README.md`](kode/edge/README.md) langkah 7.

**(c) Matikan broker apt** supaya loket 1883 bebas dan broker itu tidak menyala lagi saat Pi dinyalakan:

```text
sudo systemctl disable --now mosquitto
```

Sejak saat ini Node 1 kehilangan brokernya sampai 6.5. **Jalan mundur** bila ada yang salah: di folder `edge`, `docker compose down` (tanpa `-v`: lemari gerbang menyimpan berkas sandi), lalu `sudo systemctl enable --now mosquitto`.

**Kamu lulus langkah ⭐ ini** kalau perintah salin selesai tanpa galat dan `systemctl is-active mosquitto` menjawab `inactive`.

#### 6.5 ⭐ Nyalakan gerbang: `Connecting bridge` di Pi dan `New bridge connected` di laptop (10 menit)

Di Pi, folder `edge` (tanpa `-f`: `COMPOSE_FILE` ada di `.env`):

```text
docker compose up -d
```

**Hasilnya** (lab penulis): `✔ Container rumahpintar-gerbang-mosquitto-1  Started    1.1s`. Lalu:

```text
docker compose logs mosquitto
```

**Hasilnya** (lab penulis, dipotong):

```text
mosquitto-1  | 1793196841: Loading config file '/mosquitto/config/jembatan/pusat.conf'
mosquitto-1  | 1793196841: mosquitto version 2.1.2 starting
mosquitto-1  | 1793196841: Warning: File /mosquitto/config/acl-broker has world readable permissions. Future versions will refuse to load this file.
mosquitto-1  | 1793196841: Opening ipv4 listen socket on port 1883.
mosquitto-1  | 1793196841: Connecting bridge pusat (pusat:1883)
mosquitto-1  | 1793196841: mosquitto version 2.1.2 running
```

Angka di depan = jam Mosquitto, detik sejak 1 Januari 1970. Peringatan ACL seperti `world readable` (di lab ada tiga) boleh diabaikan ([🚨](#-kalau-tidak-jalan) *Boleh diabaikan …*). Di laptop, terminal akar proyek, perintahnya sama:

```text
docker compose logs mosquitto
```

Cari `bridge` dengan **Ctrl + F**. **Hasilnya** (lab penulis):

```text
mosquitto-1  | 1793196841: New bridge connected from 172.19.0.1:42854 as jembatan-pi (p4, c0, k60, u'jembatan-pi').
```

Alamat sesudah `from` di rumahmu lain (di lab: alamat lorong Docker); yang penting `as jembatan-pi`. Tidak muncul? Periksa `ALAMAT_PUSAT`, sandi di `jembatan/pusat.conf`, dan IP laptop ([🚨](#-kalau-tidak-jalan) *Jembatan tidak tersambung …*).

**Kamu lulus langkah ⭐ ini** kalau Pi mencatat `Connecting bridge pusat (pusat:1883)` dan laptop `New bridge connected … as jembatan-pi`.

#### 6.6 ⭐ L4: Node 1 masuk dengan akun lama, data *live* di dashboard, dan `ack` lampu (12 menit)

Di Pi, ikuti log gerbang dengan `docker compose logs -f mosquitto` sampai Node 1 masuk (lewat dua menit? cabut lalu pasang lagi dayanya). **Hasilnya** (lab penulis; simulator memerankan Node 1 dengan akun lama berformat 2.0):

```text
mosquitto-1  | 1793196879: New client connected from 172.20.0.1:56778 as f00d00000001 (p4, c1, k15, u'f00d00000001').
```

Di Pi-mu tampil alamat dan `device_id` Node 1. **Ctrl + C** hanya berhenti membaca. Lalu di laptop, Chrome `http://localhost`:

1. Lencana **Live** menyala, dan suhu Node 1 di halaman detailnya bergerak (lab penulis: `27.3`, sepuluh detik kemudian `32.7`).
2. Klik sakelar **Lampu**: lampu Node 1 menyala, dan sakelar bergeser sesudah `ack` tiba lewat gerbang dan jembatan (lab penulis: `"lama_ms":17`, pulang-pergi 17 milidetik).
3. Kartu Kebun (Node 2 lewat Node 1) kembali `Online` `lewat penghubung` dalam ±5 menit, karena Node 2 bangun tiap 300 detik. Tidak kunjung? Blok 2 ACL belum sama (6.4).
4. Node-RED systemd Modul 13 tetap menerima data: `localhost:1883` di Pi kini loket kontainer gerbang, dan akun `nodered` ikut tersalin. Di lab, klien MQTT berakun `nodered` lama menerima `rpm/…/telemetry` lewat loket gerbang; Node-RED sungguhan belum diuji.

**Kamu lulus langkah ⭐ ini (L4)** kalau log gerbang mencatat Node 1, lencana **Live** menyala dengan suhu bergerak, dan sakelar **Lampu** dijawab `ack`, tanpa satu baris firmware pun berubah. Pindahan jalur perangkat selesai: bacaan Node 1 tercatat lagi, dan ✅ Grafana datang sendiri.

#### 6.7 Jalur laptop: pengganti L4, lalu gerbang di laptop yang sama (5–25 menit)

Tanpa Pi, **pengganti L4 sudah terbukti di [5.5](#55--data-live-lewat-broker-pusat-simulator-kebun-tiruan-dan-tombol-lampu-7-menit)**. **Opsional (±20 menit):** gerbang di laptop yang sama, cara penulis menguji praktik ini. Perintah di folder `edge` mengurus gerbang, di akar proyek mengurus pusat.

1. Kerjakan [6.2](#62-laptop-berkas-gerbang-di-edge-akun-jembatan-pi-lalu-push-cabang-5-menit) di laptop; *push*-nya boleh menyusul di [11.1](#111-pilih-tempat-uji-laptop-teman-akun-kedua-atau-folder-dan-lemari-lain-5-menit).
2. Terminal baru, `cd edge`, `cp .env.example .env` (Windows: `copy`, tidak diuji penulis); isi `ALAMAT_PUSAT=host-gateway` (laptop ini sendiri, dilihat dari kontainer) dan `PORT_GERBANG=1884` (1883 milik broker pusat).
3. `cp jembatan.contoh.conf jembatan/pusat.conf` dan ganti sandinya seperti 6.3 (b); `address pusat:1883` tetap.
4. Lemari gerbang masih kosong. Buat akun simulator dengan kuncinya dari `alat/.env` (`KUNCI_F00D00000001`):

   ```text
   docker compose run --rm --no-deps -u mosquitto mosquitto mosquitto_passwd -b -c /mosquitto/data/sandi-broker f00d00000001 <kunci>
   ```

   `-c` = berkas baru; `-b` = sandi di baris perintah, sesaat terlihat di daftar proses dan tertinggal di riwayat terminal, jadi hanya untuk latihan ini. **Hasilnya** (lab penulis, akun lain): `Adding password for user …`.
5. `docker compose up -d`, lalu periksa kedua log seperti 6.5.
6. Di terminal `alat`, hentikan simulator (**Ctrl + C**), jalankan `node --env-file=.env simulator-perangkat.js mqtt://127.0.0.1:1884 1`, lalu `kebun mulai`. Gerbang memakai `edge/acl-broker` yang sama, jadi blok 2b sudah terbuka. Dashboard tetap **Live** dan **Lampu** dijawab `ack` lewat jembatan, persis kotak 6.5–6.6 yang direkam dengan cara ini.

Selesai? `docker compose down` di folder `edge` (tanpa `-v`), lalu simulator kembali ke `mqtt://127.0.0.1:1883`. `host-gateway` di Docker Desktop tidak diuji penulis.

> ⬆️ **Selesai Praktik 6?** Baca [Konsep 9](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana), lalu lanjut ke [Praktik 7](#praktik-7--grafana-sebagai-berkas-provisioning-dan-akun-grafana_baca-sekali-jalan-40-menit).

### Praktik 7 — Grafana sebagai berkas: *provisioning* dan akun `grafana_baca` sekali jalan (40 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini` dan terminal di **akar proyek** (Git dan `docker compose`); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux); **Chrome** atau **Edge** (Grafana `http://localhost:3000`); **Telegram**; pengelola sandimu (sandi admin Grafana **lama**). Konsep yang dipakai: 9.
>
> ⭐ **Wajib** — langkah 7.3 dan 7.4: aturan, *contact point*, dan *data source* lama dihapus berurutan, lalu satu `docker compose up -d` memasang semuanya kembali dari berkas: **Provisioned**, **Test** sampai, dan **Save** dashboard ditolak.

Grafana Compose-mu masih Grafana Modul 25: isinya hasil klik di lemari `rumahpintar-grafana-data`. Praktik ini menyerahkannya ke berkas di `grafana/` ([Konsep 9](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana)), supaya Grafana di laptop mana pun, termasuk laptop teman, menyala lengkap tanpa klik. 7.1–7.2 hanya menulis berkas; Grafana lama tetap berjalan sampai 7.4.

#### 7.1 Berkas *provisioning*: *data source* `rumahpintar-db`, dashboard, *contact point*, dan aturan (12 menit)

Berkas baru masuk folder baru `grafana/provisioning/`; jangan tertukar dengan `grafana/dashboards/` (JSON Modul 25). Untuk setiap berkas: klik kanan folder **`grafana`** di VS Code → **New File…**, ketik jalurnya (foldernya ikut dibuat), tempel isi **Copy raw file** berkas berjalur sama di [`kode/grafana/provisioning/`](kode/grafana/provisioning/), lalu simpan.

**(a) `provisioning/datasources/rumahpintar.yaml`:**

```yaml
# rumahpintar.yaml - data source PostgreSQL Rumah Pintar Mini sebagai berkas provisioning (Modul 26). Isiannya sama dengan
# layar Modul 25 (Connections -> Data sources), ditambah uid TETAP rumahpintar-db: dashboard dan aturan alert di repo
# menunjuk uid ini, jadi keduanya langsung tersambung di Grafana mana pun yang dinyalakan dari compose.cloud.yml.
# Sandi grafana_baca TIDAK ditulis di sini: Grafana mengambilnya dari variabel GRAFANA_BACA_SANDI (dari .env lewat
# compose.cloud.yml). Ditulis $GRAFANA_BACA_SANDI, bukan ${...}: bentuk berkurung bisa terbaca dua kali bila sandinya memuat $.
apiVersion: 1
datasources:
  - name: rumahpintar-db
    uid: rumahpintar-db
    type: grafana-postgresql-datasource
    # db = nama layanan database di compose.cloud.yml (lorong Compose), loket 5432 di dalam lorong
    url: db:5432
    user: grafana_baca
    jsonData:
      database: rumahpintar
      sslmode: disable
      timescaledb: true
      # akun grafana_baca boleh paling banyak 5 sambungan: Grafana memakai 4, satu tersisa untuk psql (Modul 25)
      maxOpenConns: 4
    secureJsonData:
      password: $GRAFANA_BACA_SANDI
    # terkunci di layar: perubahan lewat berkas ini, lalu docker compose restart grafana
    editable: false
```

Isiannya = layar *data source* Modul 25 (`grafana_baca`, **Max open** 4, [Konsep 3 Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#3-hak-sekecil-mungkin-grafana-hanya-boleh-membaca)); bedanya: uid tetap `rumahpintar-db`, alamat `db:5432` (nama layanan), dan sandi sebagai nama variabel.

**(b) `provisioning/dashboards/rumahpintar.yaml`:**

```yaml
# rumahpintar.yaml - penyedia dashboard (Modul 26): Grafana memasang setiap berkas .json di /etc/grafana/dashboards
# (= folder grafana/dashboards di repo, dipasang compose.cloud.yml) ke folder "Rumah Pintar Mini".
apiVersion: 1
providers:
  - name: rumahpintar
    folder: Rumah Pintar Mini
    type: file
    # dashboard dari berkas tidak bisa dihapus lewat layar
    disableDeletion: true
    # false = tombol Save di layar ditolak ("This dashboard cannot be saved from the Grafana UI because it has been
    # provisioned from another source"). Mengubah dashboard: ubah di layar, Export ->
    # Export as JSON (Classic), timpa berkas di grafana/dashboards, lalu docker compose restart grafana.
    allowUiUpdates: false
    # berkas dari folder yang dipasang Docker diperiksa ulang setiap 30 detik (lebih dari 10, anjuran dokumen Grafana)
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/dashboards
```

`/etc/grafana/dashboards` = folder `grafana/dashboards`, dilihat dari dalam kontainer (7.2). Menu yang disebut komentarnya, **Export as JSON**, di Grafana 13.2.4 bernama **Export as code** (7.3).

**(c) `provisioning/alerting/kontak-telegram.yaml`:**

```yaml
# kontak-telegram.yaml - contact point "Telegram Rumah Pintar" sebagai berkas provisioning (Modul 26). Isiannya sama dengan
# layar Modul 25 Praktik 4.1: integrasi Telegram, Parse mode None, templat pesan 🔴/✅, pesan "pulih" tetap dikirim.
# Token bot dan chat_id TIDAK ditulis di sini: Grafana mengambilnya dari variabel TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID
# (dari .env lewat compose.cloud.yml). Kosong di .env = compose.cloud.yml memberi "belum-diisi" dan 0, karena contact point
# Telegram tanpa token membuat Grafana gagal menyala.
apiVersion: 1
contactPoints:
  - orgId: 1
    name: Telegram Rumah Pintar
    receivers:
      - uid: telegram-rumah-pintar
        type: telegram
        settings:
          bottoken: $TELEGRAM_BOT_TOKEN
          chatid: "$TELEGRAM_CHAT_ID"
          parse_mode: None
          message: '{{ range .Alerts.Firing }}🔴 {{ .Annotations.summary }}{{ "\n" }}{{ end }}{{ range .Alerts.Resolved }}✅ {{ .Labels.node }} kembali mengirim data.{{ "\n" }}{{ end }}'
        disableResolveMessage: false
```

Isiannya = layar [Modul 25 4.1](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#41--contact-point-telegram-rumah-pintar-templat-pesan-dan-tombol-test-15-menit): **Parse Mode** `None`, templat 🔴/✅ persis; token dan chat_id hanya nama variabel.

**(d) Aturan `Node diam`, dipindah.** Folder tujuannya sudah ada sejak (c). Di terminal akar proyek:

```text
git mv grafana/alerting/node-diam.yaml grafana/provisioning/alerting/node-diam.yaml
```

Git mencatatnya sebagai ganti nama (berhasil = tanpa jawaban). Folder `grafana/alerting` yang tertinggal kosong boleh dihapus. Ganti **seluruh** isi berkas yang sudah pindah dengan isi **Copy raw file** [`kode/grafana/provisioning/alerting/node-diam.yaml`](kode/grafana/provisioning/alerting/node-diam.yaml). Dibanding ekspor [Modul 25 9.2](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#92--ekspor-dashboard-json-classic-dan-aturan-alert-yaml-arsip-ke-grafana-12-menit)-mu, bedanya komentar kepala, `uid` aturan (milik berkas penulis, yang diuji), dan satu baris:

```yaml
              datasourceUid: rumahpintar-db
```

**(e) JSON dashboard.** Buka `grafana/dashboards/kesehatan-sistem.json` **milikmu**: uid dashboard di baris `"uid"` terbawah sama dengan uid di lemarimu, dan itulah syarat diambil alih tanpa kembaran. Berkas penulis (uid `admkvrq`) bisa menjadi kembaran (tidak diuji). Tekan **Ctrl + H** (macOS **Cmd + Option + F**), pastikan ikon regex `.*` mati, cari `${DS_GRAFANA-POSTGRESQL-DATASOURCE}`, ganti dengan `rumahpintar-db`, klik **Replace All**, lalu simpan. Di berkas kunci Modul 25, 11 baris berganti menjadi:

```json
        "uid": "rumahpintar-db"
```

Berkas kunci itu kini sama byte demi byte dengan [`kode/grafana/dashboards/kesehatan-sistem.json`](kode/grafana/dashboards/kesehatan-sistem.json); ekspormu boleh berbeda di `uid` dashboard, `version`, dan `description`. `__inputs` (tanpa `${…}`) tidak ikut terganti dan tidak mengganggu.

**(f) `provisioning/plugins/tanpa-plugin.yaml`:** di bawah komentarnya hanya `apiVersion: 1` dan `apps: []`. Tanpa berkas ini, log Grafana menulis satu `level=error` tentang folder `plugins`.

#### 7.2 `compose.cloud.yml` akhir: layanan `akun-grafana` dan rahasia Grafana di `.env` (8 menit)

Buka [`kode/compose.cloud.yml`](kode/compose.cloud.yml) di GitHub, klik **Copy raw file**, lalu tempel menggantikan **seluruh** isi `compose.cloud.yml`-mu dan simpan: inilah berkas akhir Modul 26. Selisihnya dari 5.2 (komentar dibuang, `# …` = dilewati):

```yaml
  akun-grafana:
    image: timescale/timescaledb:2.30.2-pg17
    environment:
      # …
      GRAFANA_BACA_SANDI: ${GRAFANA_BACA_SANDI:?isi GRAFANA_BACA_SANDI di .env}
    command:
      - sh
      - -c
      - |
        set -e
        if [ "$$(psql -tAc "SELECT 1 FROM pg_roles WHERE rolname = 'grafana_baca'")" = "1" ]; then
          echo "akun grafana_baca sudah ada: dilewati"
        else
          psql -v ON_ERROR_STOP=1 -f /grafana/pengguna-grafana.sql
        fi
        echo "ALTER ROLE grafana_baca PASSWORD :'sandi';" | psql -v ON_ERROR_STOP=1 -v sandi="$$GRAFANA_BACA_SANDI"
        echo "sandi grafana_baca disamakan dengan GRAFANA_BACA_SANDI di .env"
    volumes:
      - ./grafana:/grafana:ro
    tmpfs:
      - /var/lib/postgresql/data
    depends_on:
      migrasi:
        condition: service_completed_successfully
    restart: "no"
    # …
  grafana:
    # …
    environment:
      # …
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_SANDI:?isi GRAFANA_ADMIN_SANDI di .env}
      GRAFANA_BACA_SANDI: ${GRAFANA_BACA_SANDI:?isi GRAFANA_BACA_SANDI di .env}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:-belum-diisi}
      TELEGRAM_CHAT_ID: ${TELEGRAM_CHAT_ID:-0}
    volumes:
      - data-grafana:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/etc/grafana/dashboards:ro
    # …
    depends_on:
      akun-grafana:
        condition: service_completed_successfully
```

`akun-grafana` = layanan sekali jalan ketiga. Ia hanya meminjam `psql` dari image database (`tmpfs` mencegah lemari tanpa nama), membuat `grafana_baca` bila belum ada, lalu **setiap** `up` menyamakan sandinya dengan `.env` lewat variabel `psql` (tak pernah tercetak). Sandi lamanya tak perlu dicari. `grafana` mendapat empat variabel dan dua jendela hanya-baca (Konsep 6), lalu menunggu `akun-grafana` pulang dengan tugas beres.

Isi baris ini di `.env` akar (rahasia acak: perintah [5.1](#51-broker-pusat-edgepusatconf-blok-acl-jembatan-pi-serta-layanan-akun-broker-dan-mosquitto-12-menit) (d)), simpan, dan catat di pengelola sandimu:

1. **`GRAFANA_BACA_SANDI=`**: rahasia **baru**.
2. **`GRAFANA_ADMIN_SANDI=`**: rahasia baru. Wajib terisi, tetapi hanya dipakai Grafana berlemari kosong (laptop teman); di lemarimu, sandi admin lama tetap berlaku.
3. **`TELEGRAM_BOT_TOKEN=`** dan **`TELEGRAM_CHAT_ID=`**: salin dari `backend/.env` ([Modul 19](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#63-setelan-telegram-di-env)). Kosong pun Grafana tetap menyala (bawaan `belum-diisi` dan `0`), hanya kirimannya gagal. Terisi, backend mode rumah ikut memakai bot itu: dua backend sekaligus kini ditolak Telegram `409: Conflict` (5.6).

```text
docker compose config --quiet
```

**Hasilnya:** diam (lab penulis: kode keluar 0). Baris yang terlupa dijawab seperti di 5.2, berakhiran `isi <NAMA> di .env`.

> [!WARNING]
> **Jangan `docker compose up -d` dulu.** Berkas ini di atas lemari yang belum diambil alih membuat *contact point* `Telegram Rumah Pintar` berisi dua integrasi, dan setiap *alert* terkirim dua kali (prototipe riset penulis). Kerjakan 7.3 dulu.

#### 7.3 ⭐ Ambil alih: hapus aturan, lalu *contact point*, lalu *data source* lama (10 menit)

Di Grafana yang masih berjalan (`http://localhost:3000`, `admin` bersandi lama), dengan urutan Konsep 9. Dashboard tidak dihapus; **Notification policies** tidak perlu disentuh (terbukti).

**(a) Dashboard berubah sejak ekspor Modul 25 9.2?** Ekspor lagi: ikon **Export** → **Export as code** → **Advanced options** → **Model** **Classic**, sakelar **Share dashboard with another instance** menyala → **Download file**. Timpa `grafana/dashboards/kesehatan-sistem.json`, lalu ulangi 7.1 (e). Tidak berubah? Lewati.

**(b) Aturan.** **Alerting → Alert rules**. Grup `kesehatan-node` (folder `Rumah Pintar Mini`) terlipat; klik panahnya. Di baris `Node diam`: **More** (lainnya) → **Delete** (hapus) → dialog `Delete rule` → **Yes, delete**. Daftarnya baru bersih sesudah **F5**; aturan itu pindah ke tab **Recently deleted** (baru dihapus) dan tidak mengganggu berkas.

**(c) *Contact point*.** **Alerting → Notification configuration → Contact points**. `Telegram Rumah Pintar` kini `Unused`: **More** → **Delete** → dialog `Delete contact point` → **Yes, delete contact point**.

**(d) *Data source* lama.** **Connections → Data sources** → `grafana-postgresql-datasource` → tombol **Delete** di bawah halaman → dialog `Delete` → **Delete**.

**Hasilnya** (lab penulis, lewat layar): `No data sources defined`. Urutan salah juga dicoba: selama aturan masih ada, **Delete** *contact point* abu-abu, dan tetikus di atasnya memunculkan:

```text
Contact point cannot be deleted for the following reasons:
Contact point is referenced by one or more alert rules
```

Melihatnya? Aturan belum terhapus; ulangi (b). (Lewat API, urutan salah dijawab `409` `Receiver is used by 1 rule(s)`.)

**Kamu lulus langkah ⭐ ini** kalau aturan, *contact point*, dan *data source* lama terhapus dengan urutan itu, sedangkan dashboard `Kesehatan Sistem` tetap ada.

#### 7.4 ⭐ `docker compose up -d`: *Provisioned*, tombol Test, dan Save yang ditolak (10 menit)

Di terminal akar proyek:

```text
docker compose up -d
```

**Hasilnya** (lab penulis, dipotong):

```text
 ✔ Container rumahpintar-migrasi-1       Exited                                   5.1s
 ✔ Container rumahpintar-backend-1       Healthy                                 15.2s
 ✔ Container rumahpintar-akun-grafana-1  Exited                                   6.2s
 ✔ Container rumahpintar-grafana-1       Started                                  6.7s
…
```

`grafana` dibuat ulang dengan berkas; `migrasi` dan `backend` ikut dibuat ulang bila `TELEGRAM_*` baru kamu isi (kartu Kebun sebentar `menunggu bacaan…`). Lalu:

```text
docker compose logs akun-grafana
```

**Hasilnya** (lab penulis):

```text
akun-grafana-1  | akun grafana_baca sudah ada: dilewati
akun-grafana-1  | ALTER ROLE
akun-grafana-1  | sandi grafana_baca disamakan dengan GRAFANA_BACA_SANDI di .env
```

Periksa `docker compose ps -a`: `akun-grafana` `Exited (0)`, `grafana` `(healthy)` (tunggu ±13 detik). Di `http://localhost:3000`, sesi *login* tetap berlaku (lab penulis); bila diminta masuk, pakai sandi admin **lama** (sandi `.env` ditolak). Bandingkan dengan catatan [1.3](#13-sidik-jari-grafana-dashboard-aturan-contact-point-dan-tombol-test-5-menit):

- **Connections → Data sources**: hanya `rumahpintar-db` · `PostgreSQL` · `db:5432` · `default` (lab penulis, lewat API: `Database Connection OK`).
- **Alert rules**, grup `kesehatan-node`: `Node diam` **Provisioned**, `Normal`, tanpa tombol **Edit**.
- **Contact points**: `Telegram Rumah Pintar` · `Used by 1 alert rules` · **Provisioned**; **Edit** berganti **View**. **View** → spanduk `This contact point cannot be edited through the UI` → **Test** → **Send test notification** → `Test notification sent successfully`, dan `🔴 Notification test` tiba (lab penulis: server Telegram tiruan, 22.37.33 WIB).
- **Dashboards → Rumah Pintar Mini → Kesehatan Sistem**: satu saja, tanpa tanda **Provisioned**, panelnya berisi.

Di `Kesehatan Sistem`, klik **Edit** → **Save**. **Hasilnya** (lab penulis, dipotong), laci kanan:

```text
Save dashboard
Kesehatan Sistem
This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source. Copy the JSON or save it to a file below, then you can update your dashboard in the provisioning source.
See documentation for more information about provisioning.
File path:
```

Bukan galat: kunci yang disengaja (`allowUiUpdates: false`). Klik **Cancel** → **Exit edit**. Jangan menimpa berkas repo lewat **Save JSON to file** di laci itu: formatnya `dashboard.grafana.app/v2`, bukan Classic. Mengubah kelak: coba di layar, ekspor seperti 7.3 (a) lalu ganti setiap `${DS_…}` dengan `rumahpintar-db` (aturan: sunting `node-diam.yaml`), `docker compose restart grafana`, lalu *commit* (tidak diuji penulis).

**`Panel pertama` merah.** Dashboard latihan [KC Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#langkah-6--panel-pertama-kueri-suhu-dengan-format-time-series-lalu-simpan-6-menit) masih menunjuk *data source* yang dihapus (lab penulis: `No data`; API: `Data source not found`). Ia tidak terkunci: edit panelnya, pilih `rumahpintar-db`, lalu **Save**; atau hapus dashboard itu.

**Bukti "tanpa dobel" (opsional, ±15 menit).** Hentikan aliran data (jalur laptop: **Ctrl + C** di simulator; Kit B: cabut daya Node 1, tidak diuji penulis), tunggu 🔴 setiap node, lalu nyalakan lagi. Setiap node mendapat tepat satu 🔴 dan satu ✅ dari Grafana, seperti yang diterima server Telegram tiruan di lab penulis (🔴 pertama 5 menit 39 detik sesudah bacaan terakhir; kabar 📴/✅ backend terpisah):

```text
🔴 Latihan ruang tamu (f00d00000001) tidak mengirim data, terlambat 5.1 menit dari jadwalnya
🔴 Kebun (tiruan) (f00d000000b2) tidak mengirim data, terlambat 5.2 menit dari jadwalnya
✅ Latihan ruang tamu kembali mengirim data.
✅ Kebun (tiruan) kembali mengirim data.
```

![Komposit tangkapan layar asli Grafana 13.2.4 bertema gelap di Chrome 156, Linux di Raspberry Pi 5 sebagai laptop, Praktik 7.4, sesudah aturan, contact point, dan data source lama Modul 25 dihapus lewat layar lalu docker compose up -d dengan grafana/provisioning. Kiri atas, Alerting, Alert rules: Grafana-managed, folder Rumah Pintar Mini, grup kesehatan-node 1m dengan More saja; baris aturan bercentang hijau Node diam dengan lencana ungu Provisioned (nomor 1), ringkasan templat, data source rumahpintar-db (nomor 1), dan hanya tombol More, tanpa Edit (nomor 1). Di bawahnya, Contact points: Telegram Rumah Pintar, Used by 1 alert rules, Provisioned (nomor 2), tombol View menggantikan Edit (nomor 2). Di bawahnya, View: spanduk biru This contact point cannot be edited through the UI, This contact point has been provisioned, that means it was created by config. Please contact your server admin to update this contact point (nomor 3), Name Telegram Rumah Pintar, tombol Test (nomor 3), lalu Integration Telegram, BOT API Token berisi configured, bukan token, dan Chat ID 777000222 (nomor 3). Kanan atas, laci Save dashboard, Kesehatan Sistem, tab Details: This dashboard cannot be saved from the Grafana UI because it has been provisioned from another source. Copy the JSON or save it to a file below, then you can update your dashboard in the provisioning source. See documentation for more information about provisioning (nomor 4); File path kosong, Advanced options, Update default variable values; editor JSON yang dimulai apiVersion dashboard.grafana.app/v2 (nomor 5), kind Dashboard, name admkvrq; tombol Cancel, Copy JSON to clipboard, Save JSON to file. Bawah, dashboard Kesehatan Sistem dengan menu kiri ditutup: remah roti Dashboards, Rumah Pintar Mini, Kesehatan Sistem (nomor 6), variabel Node All (nomor 6), Last 6 hours WIB, Refresh 1m, Edit; panel RSSI dengan garis Latihan ruang tamu antara -45 dan -73 dbm sesudah 22.25 dan garis putus-putus -75 (nomor 7), Uptime 30 minutes (nomor 7), Heap 180 sampai 200 kB (nomor 7), tabel Menit terlambat dari jadwal: f00d000000b2 Kebun (tiruan) -4.3 dan f00d00000001 Latihan ruang tamu 0.2 (nomor 7), dan Paket Node 2 per jam (seharusnya 12) dengan satu batang oranye 7 di bawah garis putus-putus 12, sumbu bawah bertulis 2026, legenda kurang dari 12 dan 12+ (nomor 8). Telegram adalah server tiruan lab; Chat ID 777000222 angka palsu.](aset/grafana-ter-provisioning.png)

Simpan ke cabang dari terminal akar (`.env` tetap ditahan `.gitignore`):

```text
git add grafana compose.cloud.yml
```

```text
git commit -m "Grafana sebagai berkas: provisioning dan akun grafana_baca (Modul 26 Praktik 7)"
```

**Kamu lulus langkah ⭐ ini** kalau `akun-grafana` `Exited (0)`, `grafana` `(healthy)`, *data source* tinggal `rumahpintar-db`, aturan dan *contact point* **Provisioned**, **Test** sampai, **Save** dashboard ditolak, dan `grafana/` sudah di-*commit*.

> ⬆️ **Selesai Praktik 7?** Lanjut ke [Praktik 8](#praktik-8--bangkit-sendiri-dan-data-yang-bertahan-30-menit). Tabel *restart policy* di [Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log) dipakai di sana.

### Praktik 8 — Bangkit sendiri dan data yang bertahan (30 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal di **akar proyek** (`docker`) dan terminal `alat` (simulator); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan rumah Compose menyala; Kit B: **terminal SSH ke Pi** di folder `rumah-pintar-mini/edge`; **Chrome** atau **Edge** (`http://localhost`). Konsep yang dipakai: 6 dan 8.
>
> ⭐ **Wajib** — langkah 8.1 dan 8.4: sesudah `docker compose exec backend kill 1`, backend hidup lagi sendiri (`RestartCount` naik satu), dan sidik jari riwayat sesudah `docker compose down` lalu `up -d` sama persis dengan sebelumnya (**L3**).

Dua janji Compose diuji: program yang berhenti sendiri hidup lagi, dan riwayat bertahan saat rumah dibongkar lalu dibangun ulang. Pegangannya tabel *restart policy* di [Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log).

#### 8.1 ⭐ `docker compose exec backend kill 1`: backend hidup lagi sendiri (8 menit)

Semua perintah dari terminal akar proyek. Pertama, berapa kali Docker sudah menghidupkan ulang kontainer backend:

```text
docker inspect -f '{{.RestartCount}}' rumahpintar-backend-1
```

**Hasilnya** (lab penulis): `0`. Kutip `'{{…}}'` tidak diuji penulis di PowerShell/CMD. Sekarang minta backend berhenti **dari dalam** kontainernya:

```text
docker compose exec backend kill 1
```

Terminal tidak mencetak apa-apa. `kill 1` mengirim sinyal berhenti ke proses nomor 1 di kontainer itu, yaitu backend sendiri. Langsung periksa:

```text
docker compose ps backend
```

**Hasilnya** (lab penulis, dua detik kemudian): kolom `STATUS` berbunyi `Up 2 seconds (health: starting)`, sedangkan `CREATED` tetap `19 minutes ago`. Kontainernya sama; hanya programnya yang baru menyala. Lalu hitungannya:

```text
docker inspect -f '{{.RestartCount}}' rumahpintar-backend-1
```

**Hasilnya:** `1`. Apa yang terjadi, menurut log:

```text
docker compose logs --since 1m backend
```

**Hasilnya** (lab penulis, dipotong; jam WIB):

```text
backend-1  | [21:37:53] INFO: SIGTERM diterima: backend berhenti dengan rapi
backend-1  | [21:37:53] INFO: backend berhenti
backend-1  | [21:38:00] INFO: database siap
…
backend-1  | [21:38:00] INFO: tersambung ke broker mqtt://mosquitto:1883 sebagai backend
```

Backend menerima `SIGTERM` dan [berhenti dengan rapi](../../fase-3-backend-data/modul-19-realtime-aturan-notifikasi/README.md#610-berhenti-dengan-rapi) seperti Modul 19, dengan kode keluar 0. Karena bukan kamu yang menyuruh Docker menghentikannya, `restart: unless-stopped` menghidupkannya lagi; ±7 detik kemudian ia siap. Inilah "mematikan satu kontainer dan melihatnya hidup lagi sendiri" di Silabus: program di dalam kontainer berhenti sendiri. Itu bukan *crash* (Konsep 8), tetapi aturan yang sama juga menolong program yang jatuh.

**Kamu lulus langkah ⭐ ini** kalau `RestartCount` naik satu (lab penulis: `0` menjadi `1`), `STATUS` menulis `Up … seconds` padahal `CREATED` tidak berubah, dan log memuat `SIGTERM diterima: backend berhenti dengan rapi` lalu `database siap`.

#### 8.2 Pembanding: sesudah `docker compose stop backend`, backend tetap mati (6 menit)

```text
docker compose stop backend
```

**Hasilnya** (lab penulis): `✔ Container rumahpintar-backend-1  Stopped  0.7s`. Dashboard di `http://localhost` menulis `Terjadi gangguan (502).` saat meminta data (dari kode, tidak direkam): Caddy menyala, backend di baliknya tidak. Tunggu 15 detik, lalu:

```text
docker compose ps -a backend
```

**Hasilnya** (lab penulis): `STATUS` `Exited (0) 15 seconds ago`, dan `RestartCount` (perintah 8.1) tetap `1`. Tanpa `-a`, kontainer yang berhenti tidak tampil sama sekali. Kode keluarnya sama dengan 8.1 (0), tetapi kali ini Docker tidak menghidupkannya karena `stop` adalah keputusanmu: baris `docker compose stop` di tabel Konsep 8. Nyalakan lagi:

```text
docker compose start backend
```

**Hasilnya** (lab penulis):

```text
[+] Running 4/4
 ✔ Container rumahpintar-db-1           Healthy                                1.6s
 ✔ Container rumahpintar-akun-broker-1  Exited                                 1.1s
 ✔ Container rumahpintar-migrasi-1      Exited                                 2.6s
 ✔ Container rumahpintar-backend-1      Started                                0.6s
```

`start` ikut memanggil dua petugas sekali jalan di rantai `depends_on` (`akun-broker`, `migrasi`); aman karena keduanya melewati yang sudah ada.

#### 8.3 Bonus: broker berhenti sebentar, backend dan jembatan menyambung ulang sendiri (4 menit)

Kali ini broker pusat yang berhenti sendiri:

```text
docker compose exec mosquitto kill 1
```

Tunggu ±8 detik, lalu `docker compose ps mosquitto`. **Hasilnya** (lab penulis): `STATUS` `Up 8 seconds`, `CREATED` `35 minutes ago`. Segera (`--since 30s` = 30 detik terakhir) jalankan `docker compose logs --since 30s mosquitto`. **Hasilnya** (lab penulis, dipotong; peringatan ACL dibuang):

```text
mosquitto-1  | 1793198363: mosquitto version 2.1.2 terminating
…
mosquitto-1  | 1793198364: Restored 2 retained messages
…
mosquitto-1  | 1793198367: New bridge connected from 172.19.0.1:34254 as jembatan-pi (p4, c0, k60, u'jembatan-pi').
mosquitto-1  | 1793198368: New client connected from 172.19.0.5:60550 as backend (p4, c1, k60, u'backend').
```

Broker hidup lagi dalam ±1 detik, dan isi lemarinya (berkas sandi, pesan *retained*) tetap. `docker compose logs --since 30s backend` menulis `broker belum terjangkau, mencoba lagi dalam 5 detik`, lalu `tersambung ke broker mqtt://mosquitto:1883 sebagai backend`: ±5 detik sesudah broker berhenti, tanpa kamu sentuh. Kit B: `docker compose logs --since 40s mosquitto` di folder `edge` Pi menulis `Bridge pusat next backoff will be 5000 ms`, lalu `Connecting bridge pusat (pusat:1883)`; di lab penulis jembatan tersambung lagi 4 detik sesudah broker pusat berhenti. Alamat sesudah `from` di rumahmu lain, seperti di 6.5. Jalur laptop tanpa gerbang tidak punya baris `jembatan-pi`.

#### 8.4 ⭐ L3: sidik jari sama sesudah `docker compose down` lalu `up -d` (8 menit)

Syarat lulus **L3**: data riwayat tetap ada sesudah `docker compose down` lalu `up -d`. Supaya jumlah bacaan diam selama uji, hentikan dulu aliran datanya:

- jalur laptop, juga Kit B yang simulator 5.5-nya masih jalan: **Ctrl + C** di terminal `alat`;
- Kit B: di Pi, folder `edge`, `docker compose stop mosquitto` (gerbang berhenti, Node 1 dan Kebun tidak bisa mengirim), atau cabut daya Node 1. Cara ini tidak diuji penulis di Pi.

Lalu ambil sidik jari dengan skrip [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) (varian PowerShell di [4.5](#45--sidik-jari-sesudah-sama-dengan-sebelum-lalu-periksa-grafana-di-lemari-yang-sama-12-menit)):

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

Simpan barisnya di `sidik-jari.md` sebagai "Sebelum down (8.4)". Bongkar seluruh rumah:

```text
docker compose down
```

Pernah menyalakan profil `pantau` ([🧩 Tingkat 2](#tingkat-2--uptime-kuma-profil-pantau-dan-satu-monitor-lewat-nama-layanan-isi-bagian-rumpang-40-menit))? Pakai `docker compose --profile pantau down`; `down` biasa meninggalkan Uptime Kuma dan lorongnya (`Resource is still in use`, lab penulis). **Hasilnya** `down` biasa (lab penulis, dipotong):

```text
 ✔ Container rumahpintar-grafana-1       Removed                              1.0s
…
 ✔ Container rumahpintar-db-1            Removed                              0.8s
 ✔ Container rumahpintar-akun-broker-1   Removed                              0.1s
 ✔ Network rumahpintar_default           Removed                              0.2s
```

Delapan kontainer dan lorongnya dihapus, tetapi **tidak ada satu baris `Volume` pun**: lemari `external` tidak disentuh, dan tanpa `-v` lemari milik Compose (`rumahpintar_data-broker`) juga tidak. Bangun lagi:

```text
docker compose up -d
```

(Atau `up -d --wait`, Konsep 8.) Di lab penulis ±24 detik, urutannya persis garis waktu Konsep 8. Ambil sidik jari lagi dengan perintah yang sama. **Hasilnya** (lab penulis; sebelum `down` dan sesudah `up -d` sama persis):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2433 | 22cde451b345407a8f85777ba6a1ef9b |       145 |     9 |     3 |    2 |         3
(1 row)
```

Bandingkan dengan baris "Sebelum down" tadi, bukan baris 1.2: sejak 5.5 bacaan baru terus masuk (lab: 2318 menjadi 2433), dan `ringkasan` 379 menjadi 145 karena tugas latar yang dijelaskan di 1.2. Simpan sebagai "Sesudah up (8.4, L3)". Lalu nyalakan lagi aliran data: simulator yang tadi dihentikan dijalankan lagi di terminal `alat` (5.5; jalur laptop juga `kebun mulai`); Kit B `docker compose start mosquitto` di folder `edge` (atau pasang lagi daya Node 1). Dashboard kembali **Live**. Berhenti lebih dari ±5 menit? 🔴 "Node diam" boleh datang; ✅ menyusul, seperti saat pindahan.

**Kamu lulus langkah ⭐ ini (L3)** kalau `bacaan`, `sidik_jari`, `akun`, dan `perangkat` sesudah `up -d` sama persis dengan baris sebelum `down`, dan keluaran `down` tidak memuat satu baris `Volume` pun.

#### 8.5 Jangan `down -v`, lalu (opsional) *restart* Docker atau *reboot* Pi (4 menit)

> [!WARNING]
> **`down -v` ikut menghapus lemari milik Compose.** Bukti lab penulis di proyek uji terpisah, dengan lemari bernama yang lupa diberi `external` ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)):
>
> ```text
>  ✔ Container uji-merah-isi-1  Removed                                          0.5s
>  ✔ Volume uji-merah-data      Removed                                          0.0s
>  ✔ Network uji-merah_default  Removed                                          0.2s
> ```
>
> Di proyek uji laptop bersih penulis (Praktik 11), `down -v` menghapus `…_data-broker`, sedangkan dua lemari `external` selamat. Di rumahmu, itu berarti berkas sandi broker hilang: semua akun broker selain `backend` (mis. simulator, `pemeriksa`, `jembatan-pi`) harus dibuat ulang seperti 5.5. Jadi `down` selalu tanpa `-v`, dan jangan pernah `docker volume rm rumahpintar-…` atau `docker system prune --volumes` di laptop yang menyimpan riwayat aslimu.

**Opsional: *restart* Docker atau *reboot*.**

> [!NOTE]
> **Tidak direkam penulis.** Hasil di bawah = harapan menurut dokumentasi dan kode Docker.

1. Docker Desktop: klik kanan ikon paus di area notifikasi (macOS: klik ikonnya di bilah menu) → **Quit Docker Desktop**, buka lagi, tunggu ikonnya berhenti bergerak ([Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#-persiapan-memasang-docker-desktop-3045-menit-sekali-saja)). Docker Engine (Linux): `sudo systemctl restart docker`. Kit B: `sudo reboot` di terminal SSH, tunggu ±1 menit, lalu SSH lagi.
2. `docker compose ps -a` (akar proyek; di Pi folder `edge`): layanan `unless-stopped` yang tadi menyala kembali `Up` tanpa `up -d`, layanan yang kamu `stop` sendiri tetap mati, dan petugas sekali jalan tetap `Exited`. Docker Engine di Pi menyala sendiri saat *boot*; Docker Desktop baru saat aplikasinya dibuka.
3. Kali ini Docker bisa menyalakan kontainer tanpa urutan `depends_on` (Konsep 8). Bila backend menyala lebih dulu dari database, lognya menulis `aturan otomatis belum bisa dimuat: …` dan layar **Aturan** dashboard kosong walau backend `(healthy)`. Obatnya `docker compose restart backend` ([🚨](#-kalau-tidak-jalan)).

Praktik ini tidak mengubah berkas, jadi tidak ada *commit*.

> ⬆️ **Selesai Praktik 8?** Lanjut ke [Praktik 9](#praktik-9--cadangan-lemari-dan-uji-pulih-ke-proyek-terpisah-35-menit) (opsional, sangat dianjurkan: cadangan yang terbukti bisa dipulihkan). Kalau dilewati, baca [Konsep 11](#11-toko-image-ghcr-dan-arsitektur), lalu kerjakan [Praktik 11](#praktik-11--uji-laptop-bersih-45-menit).

### Praktik 9 — Cadangan lemari dan uji pulih ke proyek terpisah (35 menit)

> 🖥️ **Alat yang dipakai:** **VS Code** dengan folder `rumah-pintar-mini`: terminal di **akar proyek** dan, untuk jalur laptop, terminal `alat` (simulator); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan rumah Compose menyala; Kit B: **terminal SSH ke Pi** di folder `rumah-pintar-mini/edge`. Konsep yang dipakai: 6.

Opsional, tetapi sangat dianjurkan, karena pegangan [Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#9-backup-dan-restore-fotokopi-arsip-lalu-buktikan-bisa-dipulihkan) tetap berlaku: cadangan yang belum pernah dipulihkan sama dengan tidak punya cadangan. Resepnya resep Modul 18 versi Compose, tetapi arsipnya dipulihkan ke **proyek Compose terpisah** di lemari baru: rumahmu tetap menyala.

#### 9.1 `pg_dump` di dalam kontainer, lalu `docker compose cp` ke `backup/` (8 menit)

`pg_dump` boleh berjalan selagi data masuk, tetapi sidik jari 9.3 hanya cocok bila datanya diam. Hentikan aliran data seperti di 8.4 (jalur laptop: **Ctrl + C** di `alat`; Kit B: `docker compose stop mosquitto` di `edge` Pi).

Salinan menjalankan retensi saat pulih, dan tiap 07.00 WIB satu jilid data uji Modul 18 lewat 90 hari. Supaya sidik jari 9.3 cocok, jalankan dulu retensi rumah seperti 7.2 Modul 18 (nomor *job*-mu di 6.3 Modul 18; tidak direkam penulis), dan selesaikan 9.1–9.3 sebelum 07.00 WIB berikutnya. Dari terminal akar proyek:

```text
docker compose exec db psql -U postgres -d rumahpintar -c "CALL run_job(1001);"
```

Balasannya `CALL`, seperti Modul 18. Lalu arsipnya:

```text
docker compose exec db pg_dump -U postgres -d rumahpintar -Fc -f /tmp/rumahpintar.dump
```

Seperti Modul 18: `-Fc` = format terkemas; `-f /tmp/…` = berkas di dalam kontainer (`>` merusak berkas di PowerShell 5.1). **Hasilnya** (lab penulis): empat baris wajar (Modul 18), dibuka `pg_dump: warning: there are circular foreign-key constraints …`.

Buat folder `backup` di akar proyek (`mkdir backup`), lalu salin arsipnya keluar. Pakai tanggal hari ini di namanya; perintah berikutnya ikut nama itu:

```text
docker compose cp db:/tmp/rumahpintar.dump backup/rumahpintar-2026-10-28.dump
```

`docker compose cp <layanan>:<jalur> <tujuan>` = `docker cp` Modul 18, dengan nama layanan. **Hasilnya** (lab penulis): `✔ rumahpintar-db-1 copy … Copied`; arsipnya ±98 KB untuk 2382 bacaan (direkam sebelum 8.4). Catat versinya: arsip dipulihkan ke TimescaleDB versi yang sama (Konsep 9 Modul 18):

```text
docker compose exec db postgres --version
```

```text
docker compose exec db psql -U postgres -d rumahpintar -c "\dx timescaledb"
```

**Hasilnya** (lab penulis): `postgres (PostgreSQL) 17.11` dan baris `timescaledb | 2.30.2 | public | …`. Ambil sidik jari rumah selagi datanya diam (PowerShell: varian 4.5):

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

Simpan barisnya di `sidik-jari.md` sebagai "Saat cadangan (9.1)", bersama nama arsip dan kedua versi. Sesudah itu aliran data boleh dinyalakan lagi (8.4). Terakhir:

```text
git status --short --ignored
```

**Hasilnya:** di antara baris `!!` (diabaikan Git) ada `!! backup/`, berkat [4.2](#42-kebersihan-git-dulu-gitignore-gitattributes-lalu-env-dengan-sandi-postgres-lama-5-menit). Arsip berisi seluruh riwayat dan akunmu: simpan sebagai data pribadi, salin juga ke flashdisk seperti Modul 18.

#### 9.2 Proyek uji `uji-pulih` di lemari baru: resep pulih TimescaleDB (15 menit)

Proyek uji = `compose.cloud.yml` yang sama, setelan lain. Salin `.env` (Linux, macOS, Pi; Windows: `copy .env .env.pulih`, tidak diuji penulis):

```text
cp .env .env.pulih
```

Buka `.env.pulih` di VS Code, ubah enam baris ini, lalu simpan:

```text
LEMARI_DB=uji-pulih-data
PORT_WEB=8091
PORT_BACKEND=8090
PORT_DB=5442
PORT_GRAFANA=3010
PORT_MQTT=1893
```

Lemari baru melindungi riwayat aslimu; loket lain (boleh angka bebas lain) mencegah tabrakan dengan rumahmu yang tetap menyala. Baris sandi tetap. `.env.pulih` tidak ikut Git (`.env.*`). Buat lemarinya:

```text
docker volume create uji-pulih-data
```

**Hasilnya:** namanya sendiri, `uji-pulih-data`. Nyalakan **hanya** layanan `db` proyek uji:

```text
docker compose -p uji-pulih --env-file .env.pulih up -d db
```

`-p uji-pulih` = nama proyek lain, menggantikan `name: rumahpintar` (Konsep 5); `--env-file .env.pulih` = setelan dari berkas itu, bukan `.env`. Keduanya wajib di **setiap** perintah proyek uji. **Hasilnya** (lab penulis): lorong `uji-pulih_default` `Created`, kontainer `uji-pulih-db-1` `Started`.

Jangan `up -d` proyek uji tanpa nama layanan: `LEMARI_GRAFANA` tidak diganti, jadi Grafana kedua menyala di atas lemari Grafana aslimu. Lemarinya kosong, jadi formulir `POSTGRES_…` dibaca: database `rumahpintar` sudah ada, lengkap dengan TimescaleDB 2.30.2, dan resep [7.4 Modul 18](../../fase-3-backend-data/modul-18-timescaledb/README.md#74-bangun-arsip-baru-restore-ke-rumahpintar_pulih) dipakai tanpa `createdb` dan `CREATE EXTENSION` (lab kode penulis). Pengisian itu tidak ditunggu `up -d`; ulangi perintah ini sampai `STATUS` menulis `(healthy)`:

```text
docker compose -p uji-pulih --env-file .env.pulih ps db
```

Lalu empat perintah, satu per satu; seperti Modul 18, yang dipulihkan arsip di laptop:

```text
docker compose -p uji-pulih --env-file .env.pulih cp backup/rumahpintar-2026-10-28.dump db:/tmp/pulih.dump
```

**Hasilnya** (lab penulis): `✔ uji-pulih-db-1 copy … Copied`. Minta TimescaleDB bersiap:

```text
docker compose -p uji-pulih --env-file .env.pulih exec db psql -U postgres -d rumahpintar -c "SELECT timescaledb_pre_restore();"
```

**Hasilnya:** tabel satu baris berisi `t`. Bangun ulang isinya:

```text
docker compose -p uji-pulih --env-file .env.pulih exec db pg_restore -U postgres -d rumahpintar /tmp/pulih.dump
```

**Hasilnya** (lab penulis, ±2 detik; dipotong):

```text
pg_restore: error: could not execute query: ERROR:  role "grafana_baca" does not exist
Command was: GRANT USAGE ON SCHEMA public TO grafana_baca;
…
pg_restore: warning: errors ignored on restore: 31
```

Kode keluarnya 1, dan itu **wajar**: `pg_dump` menyalin satu database, sedangkan akun database seperti `grafana_baca` milik seluruh server, jadi tidak ikut arsip. Yang gagal hanya 31 pemberian izin (`GRANT`) untuk akun itu; datanya utuh (9.3). Galat berbunyi **lain** patut dicurigai, misalnya `timescaledb_pre_restore()` terlewat ([🚨](#-kalau-tidak-jalan)). Terakhir:

```text
docker compose -p uji-pulih --env-file .env.pulih exec db psql -U postgres -d rumahpintar -c "SELECT timescaledb_post_restore();"
```

**Hasilnya:** `t` lagi.

#### 9.3 Sidik jari proyek uji sama, lalu `grafana_baca` dibuat lagi (5 menit)

Skrip sidik jari [1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit) yang sama, ke proyek uji. bash/zsh:

```text
docker compose -p uji-pulih --env-file .env.pulih exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

PowerShell (tidak diuji penulis):

```text
Get-Content skrip/sidik-jari.sql | docker compose -p uji-pulih --env-file .env.pulih exec -T db psql -U postgres -d rumahpintar
```

**Hasilnya** (lab penulis; sama persis dengan "Saat cadangan"):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2382 | a0cdbd6fcf0203d0f1b9dd0572058678 |       145 |     9 |     3 |    2 |         3
(1 row)
```

Simpan sebagai "Proyek uji (9.3)". Lalu `grafana_baca`, akun database yang tidak ikut arsip:

```text
docker compose -p uji-pulih --env-file .env.pulih up -d akun-grafana
```

**Hasilnya** (lab penulis): `uji-pulih-db-1` `Healthy`, `uji-pulih-migrasi-1` `Exited`, `uji-pulih-akun-grafana-1` `Started` (`up -d` tidak menunggu petugas sekali jalan). Baca lognya:

```text
docker compose -p uji-pulih --env-file .env.pulih logs migrasi akun-grafana
```

**Hasilnya** (lab penulis, dipotong):

```text
akun-grafana-1  | CREATE ROLE
…
akun-grafana-1  | sandi grafana_baca disamakan dengan GRAFANA_BACA_SANDI di .env
migrasi-1       | 0 migrasi baru diterapkan, 8 sudah ada sebelumnya.
```

`akun-grafana` membuat `grafana_baca` dari `grafana/pengguna-grafana.sql` (Modul 25), seperti di laptop baru. `migrasi` ikut jalan (rantai `depends_on`) tanpa migrasi baru karena catatan migrasi ikut arsip.

**Cadanganmu terbukti** kalau `bacaan`, `sidik_jari`, `akun`, dan `perangkat` "Proyek uji" sama dengan "Saat cadangan" (`ringkasan` boleh beda, 1.2) dan `grafana_baca` sudah dibuat lagi.

#### 9.4 Bersihkan hanya proyek uji, lalu (opsional) cadangan lemari Grafana (7 menit)

> [!WARNING]
> Ketik perintah di bawah **lengkap**. Tanpa `-p uji-pulih`, `down` membongkar rumahmu (lemari aman, layanan mati sampai `up -d`). Jangan `down -v`, jangan `docker volume rm` lemari selain `uji-pulih-…`, jangan *prune* (Konsep 6).

```text
docker compose -p uji-pulih --env-file .env.pulih down
```

**Hasilnya** (lab penulis): tiga kontainer `uji-pulih-…` dan lorong `uji-pulih_default` `Removed`. Lemari uji `external`, jadi `down` tidak menyentuhnya; hapus dengan nama lengkapnya:

```text
docker volume rm uji-pulih-data
```

**Hasilnya:** `uji-pulih-data`. Lab penulis: tidak ada lemari lain tertinggal (`tmpfs`, Konsep 6). Hapus juga `uji-pulih_data-broker` bila ada (tercipta bila `mosquitto` uji pernah menyala). `.env.pulih` boleh disimpan untuk latihan berikutnya.

**Opsional: cadangan lemari Grafana.** Dashboard, aturan, dan *contact point* kini berkas di Git (Praktik 7), tetapi akun dan riwayat *alert* Grafana hanya ada di lemarinya. Lemari itu di-`tar` sesudah Grafana berhenti ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)), dengan alat `node:24.22.1-alpine3.24`: sudah ada, membawa `tar`, berjalan sebagai root. Tiga perintah, satu per satu (bash/zsh):

```text
docker compose stop grafana
```

```text
docker run --rm -v rumahpintar-grafana-data:/data:ro -v "$PWD/backup":/backup node:24.22.1-alpine3.24 tar czf /backup/grafana-2026-10-28.tgz -C /data .
```

```text
docker compose start grafana
```

Lemari Grafana (namanya lain? tulis itu; salah nama = lemari kosong baru) dipasang hanya-baca di `/data`, `backup`-mu di `/backup`; `tar czf` memadatkan, `--rm` membuang alatnya. `start` ikut memanggil `migrasi` dan `akun-grafana` (aman). **Hasilnya** (lab penulis): ±9 detik dari `stop` sampai menyala lagi; arsip ±140 KB, milik root di Linux, tetapi bisa kamu hapus.

PowerShell: kutip utuh `-v "${PWD}/backup:/backup"` (tidak diuji penulis). Tanpa `$PWD`: sesudah `stop`, `docker compose cp grafana:/var/lib/grafana backup/grafana-cp`, lalu `start` (lab penulis: 1,7 MB, berkasnya milikmu). Memulihkan Grafana dari kedua salinan ini tidak direkam penulis.

Jangan memakai image Grafana sebagai alat: ia berjalan sebagai uid 472 dan ditolak menulis ke foldermu di Linux (`tar: can't open '/backup/grafana-salah.tgz': Permission denied`, lab penulis). Lemari database yang sedang menyala tidak boleh di-`tar`; untuknya selalu `pg_dump`. Cadangan otomatis ke luar rumah dan uji pulih terjadwal menunggu Modul 30.

Tidak ada *commit*: `backup/` dan `.env.pulih` diabaikan Git.

> ⬆️ **Selesai Praktik 9?** Baca [Konsep 11](#11-toko-image-ghcr-dan-arsitektur), lalu lanjut ke [Praktik 10](#praktik-10--toko-image-ghcr-manual-35-menit) dan [Praktik 11](#praktik-11--uji-laptop-bersih-45-menit).

### Praktik 10 — Toko image: GHCR manual (35 menit)

> 🖥️ **Alat yang dipakai:** **Chrome** atau **Edge** dengan akun GitHub-mu (sudah masuk); **VS Code** dengan folder `rumah-pintar-mini` dan terminal di **akar proyek** (`docker`, Git); **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dengan rumah Compose menyala; pengelola sandimu; internet. Konsep yang dipakai: 11 (dan 2 untuk lapisan).

> [!NOTE]
> **Tidak direkam penulis di GHCR sungguhan.** Lab penulis memakai toko image tiruan (`registry:3.1.2` di `127.0.0.1`, tanpa akun) di mesin yang sama: `docker compose build`, `push`, `docker history`, dan pemeriksaan arsitektur di bawah direkam di sana. Pembuatan PAT, `docker login ghcr.io`, halaman paket GitHub, dan tarik tanpa *login* dari GHCR publik tidak direkam; nama menu GitHub diambil dari dokumentasi resmi GitHub (rincian di [📚 Sumber](#-sumber--atribusi-gambar)).

Praktik ini **opsional**, tetapi inilah jalan yang disarankan untuk [Praktik 11](#praktik-11--uji-laptop-bersih-45-menit): laptop teman cukup menarik dua cetakanmu dari GHCR, tanpa `npm ci` dan *build*. Tanpa Praktik 10, teman membangunnya sendiri (10.4). Satu langkahnya permanen: paket publik tidak bisa dijadikan privat lagi ([Konsep 11](#11-toko-image-ghcr-dan-arsitektur)), jadi 10.3 memeriksa isinya dulu.

#### 10.1 Token GitHub (PAT *classic*) `write:packages`, tanpa `repo` (7 menit)

Untuk *login* Git, kamu memakai Git Credential Manager atau GitHub CLI sejak [Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#13-masuk-ke-github-dari-terminal). Docker butuh kunci sendiri: menurut dokumentasi GitHub, GHCR hanya menerima *personal access token* (PAT) jenis *classic*, semacam sandi khusus alat yang izinnya dibatasi dan masa berlakunya diatur.

1. Di Chrome atau Edge, buka `https://github.com/settings/tokens/new?scopes=write:packages`. Alamat ini membuka formulir token *classic* baru dengan izin `write:packages` sudah dipilih. Jalan panjangnya: **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token** → **Generate new token (classic)**.
2. **Note**: nama pengenal, misalnya `docker rumah-pintar-mini`.
3. **Expiration**: pendek, misalnya 30 hari. Token yang kedaluwarsa tinggal dibuat ulang.
4. **Select scopes**: `write:packages` tercentang (boleh mengunggah dan mengunduh cetakan). Kalau `repo` di baris paling atas ikut tercentang, **hapus centangnya**: menurut dokumentasi GitHub, izin itu luas dan tidak diperlukan.
5. Klik **Generate token**, salin token dengan ikon salin di sebelahnya, lalu simpan di pengelola sandimu. Ini satu-satunya kesempatan melihatnya.

Perlakukan token seperti sandi: tidak masuk `.env`, Git, chat, forum, atau AI. Telanjur bocor? Cabut di halaman **Tokens (classic)**, lalu buat yang baru.

#### 10.2 `docker login ghcr.io`, lalu `docker compose build` dan `push` (13 menit)

**(a) Masuk ke toko.** Di terminal akar proyek (`<akun>` = nama akun GitHub-mu; di alamat `ghcr.io/<akun>/…` huruf kecil semua):

```text
docker login ghcr.io -u <akun>
```

Docker meminta sandi: tempel token dari pengelola sandimu (tidak tampil saat ditempel), lalu **Enter**. Menurut dokumentasi GitHub, jawabannya `Login Succeeded`. Cara ini sama di semua OS; dokumentasi GitHub juga menulis varian bash `echo $CR_PAT | docker login ghcr.io -u <akun> --password-stdin` (token disimpan dulu di variabel `CR_PAT`; bila diketik di terminal, riwayatnya ikut menyimpan token). Docker Desktop menyimpan kredensialnya di *keychain* OS, sedangkan Docker Engine di Linux tanpa *credential store* menyimpannya di `~/.docker/config.json` sebagai base64: mudah dibaca balik, bukan enkripsi (dokumentasi Docker). Karena itu 10.3 diakhiri `docker logout`.

**(b) Tautkan cetakan ke repomu.** Di `backend/Dockerfile`, ganti `<akun>` pada baris ini dengan nama akunmu dalam huruf kecil, dan `rumah-pintar-mini` dengan nama repomu bila berbeda ([2.3](#23-dockerfile-dua-tahap-blok-demi-blok-10-menit)):

```dockerfile
LABEL org.opencontainers.image.source="https://github.com/<akun>/rumah-pintar-mini"
```

Lakukan hal yang sama di `frontend/Dockerfile` (baris pertama `LABEL`; baris `description` di bawahnya biarkan), lalu simpan keduanya. Tanpa label ini, paket di GHCR tidak tertaut ke repo mana pun.

**(c) Periksa alamat etalase.** Di `.env` akar, `TOKO_IMAGE` dari [5.2](#52-composecloudyml-tahap-kedua-migrasi-backend-web-dan-toko_image-di-env-15-menit) harus `ghcr.io/` diikuti akun yang sama, huruf kecil, misalnya `ghcr.io/budi-santoso` (huruf besar ditolak, [Konsep 11](#11-toko-image-ghcr-dan-arsitektur)).

**(d) Bangun cetakan bernama toko.**

```text
docker compose build
```

**Hasilnya** (lab penulis, dipotong; toko image tiruan lab ditulis `ghcr.io/<akun>`):

```text
[+] Building 2/2
 ✔ ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0  Built                    0.0s
 ✔ ghcr.io/<akun>/rumah-pintar-mini-web:1.2.0      Built                    0.0s
```

Di lab ±50 detik. Lapisan dapur backend diambil dari *cache*, tetapi `vite build` web berjalan ulang: `frontend/.dockerignore` tidak menahan `Dockerfile`, jadi `COPY . .` ikut berubah saat labelnya diganti ([Konsep 2](#2-cetakan-berlapis-image-tag-digest-dan-arsitektur)). Wajar.

**(e) Titipkan ke toko.** Hanya `backend` dan `web`; `migrasi` memakai cetakan yang sama dengan `backend`:

```text
docker compose push backend web
```

**Hasilnya** (lab penulis, toko tiruan): baris kemajuan saling menimpa; yang tersisa `[+] Pushing 18/18` dan 18 baris `Pushed` (9 lapisan backend, 9 web), selesai dalam 3,7 detik karena tokonya di mesin yang sama. Ke GHCR, ±96 MB terkompres berjalan lewat internetmu, jadi lebih lama. Ditolak `denied` atau `unauthorized`? Lihat [🚨](#-kalau-tidak-jalan).

**(f) Kontainer ikut cetakan baru.** Kontainer yang menyala masih memakai cetakan lama, sehingga kolom `IMAGE` di `docker compose ps` kini menulis `sha256:…` (lab penulis). Perintah ini membuat ulang kontainer yang cetakannya berganti (isinya sama, hanya labelnya):

```text
docker compose up -d
```

#### 10.3 Periksa `docker history`, lalu jadikan paketnya publik (8 menit)

Cetakan publik bisa diunduh dan dibongkar siapa pun. Periksa resepnya sekali lagi seperti di [2.4](#24--docker-build-ukuran-image-dan-docker-history-tanpa-rahasia-10-menit), kini dengan nama tokonya, satu per satu:

```text
docker history --no-trunc ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0
```

```text
docker history --no-trunc ghcr.io/<akun>/rumah-pintar-mini-web:1.2.0
```

Di kolom `CREATED BY`, baris `LABEL` kini memuat nama akunmu; baris lain milik resepmu (`COPY`, `ENV NODE_ENV=production`) atau cetakan dasar `node` dan `caddy`. Di lab penulis, 20 baris backend dan 26 baris web dicocokkan dengan semua sandi dan token lab: tidak satu pun muncul. Ada sandi atau token? **Berhenti di sini**: buang dari baris `ENV`, `ARG`, `LABEL`, atau `RUN` di `Dockerfile`, hapus paketnya (**Package settings** → **Delete this package**; versi lama tetap tersimpan di sana), bangun dan *push* ulang, lalu ganti rahasia itu.

Lalu di GitHub, untuk **setiap** paket (`rumah-pintar-mini-backend` dan `rumah-pintar-mini-web`; keduanya masih privat):

1. Klik foto profilmu di kanan atas → **Your profile** → tab **Packages**.
2. Klik nama paket, lalu **Package settings** (ikon roda gigi) di sisi kanan.
3. Paling bawah, di bagian "Danger Zone", klik **Change visibility**, pilih **Public**, ketik nama paketnya sebagai konfirmasi, lalu klik **I understand the consequences, change package visibility**. Tidak bisa dibatalkan.

Berkat `LABEL`, paket tertaut ke repomu (dokumentasi GitHub). Sekarang buktikan bahwa tanpa *login* pun cetakan bisa ditarik, sekaligus hapus kredensial dari laptop:

```text
docker logout ghcr.io
```

```text
docker pull ghcr.io/<akun>/rumah-pintar-mini-web:1.2.0
```

Selesai tanpa galat (cetakan sudah ada di laptopmu, jadi lapisannya tidak diunduh ulang) = laptop teman pun bisa (tidak direkam penulis). `denied` atau `unauthorized` biasanya berarti paket itu masih privat ([🚨](#-kalau-tidak-jalan)).

#### 10.4 Arsitektur: arm64 lawan amd64, dan jalan keluar untuk laptop teman (7 menit)

Cetakanmu hanya cocok untuk jenis prosesor laptop yang membangunnya ([Konsep 11](#11-toko-image-ghcr-dan-arsitektur)). Periksa (kutip `'{{…}}'` tidak diuji penulis di PowerShell/CMD):

```text
docker image inspect --format '{{.Os}}/{{.Architecture}}' ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0
```

**Hasilnya** (lab penulis): `linux/arm64`. Lalu jenis prosesor mesin Docker di laptopmu:

```text
docker version --format '{{.Server.Arch}}'
```

**Hasilnya** (lab penulis): `arm64`. Laptop Intel atau AMD menjawab `amd64`. Catat jawabanmu, lalu bandingkan dengan laptop teman:

| Laptop teman dibanding laptopmu | Akibatnya di [11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit) |
| :-- | :-- |
| Sama-sama `amd64` (Intel, AMD) atau sama-sama `arm64` (Mac Apple silicon, Snapdragon, Pi) | `docker compose up -d` menarik cetakanmu dari GHCR |
| Berbeda | Tarikan ditolak; teman menambahkan `--build` dan membangun sendiri |

Bunyi tolakannya bisa kamu lihat sendiri. Kalau laptopmu `arm64`:

```text
docker pull --platform linux/amd64 ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0
```

**Hasilnya** (lab penulis, dari toko tiruan; kode keluar 1):

```text
Error response from daemon: no matching manifest for linux/amd64 in the manifest list entries: no match for platform in manifest: not found
```

Laptopmu `amd64`? Tulis `linux/arm64`; galatnya serupa dengan nama arsitektur itu (tidak direkam penulis).

**Jalan keluar untuk teman yang berbeda:** `docker compose up -d --build` membangun kedua cetakan dari `Dockerfile` di repo (butuh unduhan npm dan beberapa menit; catat di L1). Tanpa `--build` pun Compose membangun sendiri bila tarikan gagal: terbukti di lab penulis saat toko tiruan belum berisi image atau tidak menyala (`failed to resolve reference …`, lalu *build*). Jawaban GHCR sungguhan dan tarikan beda arsitektur belum diuji, jadi tulis `--build`. Satu cetakan untuk dua arsitektur dibuat otomatis di Modul 29; perintah manualnya diintip di [🔬](#-bedah-teknis-opsional).

Ingin laptop teman langsung menarik image-mu? Isi dulu `TOKO_IMAGE=ghcr.io/<akun-huruf-kecil>` di `.env.example` (bukan rahasia; komentar di atasnya menyarankan hal yang sama). Lalu simpan ke cabang dari terminal akar:

```text
git add backend/Dockerfile frontend/Dockerfile .env.example
```

```text
git commit -m "Cetakan tertaut ke repo GitHub lewat LABEL, TOKO_IMAGE di .env.example (Modul 26 Praktik 10)"
```

> ⬆️ **Selesai Praktik 10?** Lanjut ke [Praktik 11](#praktik-11--uji-laptop-bersih-45-menit): laptop teman menarik image dari toko yang baru kamu isi.

### Praktik 11 — Uji laptop bersih (45 menit)

> 🖥️ **Alat yang dipakai:** laptop uji (11.1) dengan **Docker Desktop** (Windows, macOS) atau **Docker Engine** (Linux) dan Git, terminal **VS Code** di **folder uji**; terminal **akar proyek** di laptopmu (`git push`); **Chrome** atau **Edge**; *stopwatch* (jam HP cukup); situs uji kecepatan internet. Konsep yang dipakai: 5 dan 11.
>
> ⭐ **Wajib** — langkah 11.2, 11.3, dan 11.4: dari `git clone` sampai halaman **Masuk** dalam < 10 menit (**L1**), layanan bawaan menyala (**L2**), dan sidik jari sama sesudah `down` lalu `up -d` di tempat uji (**L3**).

Inilah syarat lulus Silabus, diuji di tempat yang belum pernah melihat proyekmu. Dibaca jujur: memasang Docker dan Git tidak dihitung, tetapi pengisian `.env` (rahasia tidak ikut Git) dan dua `docker volume create` ikut dihitung, dan laptop yang benar-benar bersih mengunduh ±1,1 GB cetakan (Silabus v1.0.28 mencatatnya di baris ✅).

#### 11.1 Pilih tempat uji: laptop teman, akun kedua, atau folder dan lemari lain (5 menit)

Urut dari yang paling jujur:

1. **Laptop teman, atau mesin virtual (VM) baru**: tanpa cetakan, lemari, dan salinan proyek ini. Akun OS kedua hanya setara bila Docker-nya terpisah (Docker Engine di Linux dipakai bersama semua akun: pakai baris pilihan 2; Docker Desktop tidak diuji penulis).
2. **Laptop sendiri, folder baru, nama lain**: proyek di-*clone* ke folder baru dengan nama proyek, lemari, dan loket lain; rumahmu tetap menyala dan tidak tersentuh. Cetakan resmi sudah ada, jadi hasilnya **"hangat"**: tulis begitu. Ini cara penulis.
3. **Dilarang:** membersihkan laptop utamamu supaya "bersih".

> [!WARNING]
> Jangan `docker compose down -v`, `docker volume rm rumahpintar-…`, atau *prune* di laptop yang menyimpan riwayat aslimu ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)). Tanpa cadangan, riwayat itu hilang.

Pilihan 2: di `.env` folder uji (11.2), tambahkan baris pertama dan ubah delapan lainnya (loket boleh angka lain; `CORS_ORIGIN` ikut `PORT_WEB`):

```text
COMPOSE_PROJECT_NAME=uji-bersih
LEMARI_DB=uji-bersih-data
LEMARI_GRAFANA=uji-bersih-grafana-data
CORS_ORIGIN=http://localhost:8086,http://127.0.0.1:8086
PORT_WEB=8086
PORT_BACKEND=8087
PORT_DB=5436
PORT_GRAFANA=3006
PORT_MQTT=1886
```

`COMPOSE_PROJECT_NAME` menggantikan `name: rumahpintar` (Konsep 5). Isi **sebelum** `up -d`: tanpanya, kontainer rumahmu dibuat ulang dengan `.env` uji; tanpa `LEMARI_*`, `db` uji memakai lemari aslimu (4.3).

Cetakanmu sudah di GHCR (10.2) dan ingin benar-benar menariknya seperti laptop teman? Seperti penulis: di akar proyek, `docker compose down` (lemari aman; bacaan tak tercatat), lalu hapus cetakan proyek (dua nama terakhir = Praktik 2–3; berbagi lapisan, jadi wajib ikut):

```text
docker image rm ghcr.io/<akun>/rumah-pintar-mini-backend:1.3.0 ghcr.io/<akun>/rumah-pintar-mini-web:1.2.0 rumah-pintar-mini-backend:1.3.0 rumah-pintar-mini-web:1.2.0
```

**Hasilnya** (lab penulis): baris `Untagged: …` dan `Deleted: sha256:…`.

**Terakhir, kirim *commit* Praktik 7–10 ke GitHub**, karena yang diuji isi GitHub, bukan foldermu. Di terminal akar proyek laptopmu:

```text
git push
```

GitHub menjawab dengan ringkasan *push*-nya. Belum pernah *push* cabang ini (6.2 dilewati)? `git push -u origin fitur/docker-compose` ([8.5 Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#85-commit-dan-push-cabangnya)). Berkas yang lupa di-*commit* akan ketahuan di 11.2.

#### 11.2 ⭐ L1: *stopwatch* dari `git clone` sampai halaman Masuk (20 menit)

Di laptop uji, buka terminal di folder kosong (pilihan 2: folder baru di luar `rumah-pintar-mini`, misalnya `uji-bersih`; di VS Code **File → New Window**, **File → Open Folder…**, **Terminal → New Terminal**). Catat jam mulai atau nyalakan *stopwatch*, lalu satu per satu:

```text
git clone https://github.com/<akun>/rumah-pintar-mini.git
```

```text
cd rumah-pintar-mini
```

```text
git switch fitur/docker-compose
```

Hasilnya seperti 6.3. Sesudah ➕ E menggabungkan cabang ini, `git clone` saja cukup. Lalu `.env` (4.2; Windows: `copy`, tidak diuji penulis):

```text
cp .env.example .env
```

Buka `.env`. Lima rahasia (`POSTGRES_PASSWORD`, `JWT_SECRET`, `MQTT_PASSWORD`, `GRAFANA_BACA_SANDI`, `GRAFANA_ADMIN_SANDI`) diisi teks acak baru, satu perintah per rahasia, tanpa Node.js di laptop (kutip PowerShell/CMD tidak diuji penulis):

```text
docker run --rm node:24.22.1-alpine3.24 node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Tempel setiap hasil (43 karakter) ke barisnya. `TOKO_IMAGE` sudah terisi bila kamu menulisnya di `.env.example` (10.4); bila belum, isi `ghcr.io/<akun-huruf-kecil>`. Telegram biarkan kosong: di pilihan 2, token yang sama membuat dua backend berebut bot (5.6). Pilihan 2: samakan dengan 11.1. Simpan, lalu (Linux, macOS):

```text
chmod 600 .env
```

Lemari `external` tidak pernah dibuat Compose (Konsep 6), jadi buat dua lemari kosong (pilihan 2: `uji-bersih-data` dan `uji-bersih-grafana-data`):

```text
docker volume create rumahpintar-data
```

```text
docker volume create rumahpintar-grafana-data
```

**Hasilnya:** nama lemarinya. Lalu perintah Silabus, dengan `--wait`:

```text
docker compose up -d --wait
```

Cetakanmu belum ada di GHCR (Praktik 10 dilewati), atau laptop uji berbeda arsitektur (10.4)? Tambahkan `--build`; waktu *build* ikut dihitung. **Hasilnya** (lab penulis, pilihan 2, bagian akhir; sebelumnya baris `Pulled`: cetakan proyek ditarik dari toko tiruan):

```text
[+] Running 10/10
 ✔ Network uji-bersih_default           Created                                    0.2s
 ✔ Volume uji-bersih_data-broker        Created                                    0.0s
 ✔ Container uji-bersih-akun-broker-1   Exited                                    27.7s
 ✔ Container uji-bersih-db-1            Healthy                                   27.7s
 ✔ Container uji-bersih-mosquitto-1     Healthy                                   26.7s
 ✔ Container uji-bersih-migrasi-1       Exited                                    26.6s
 ✔ Container uji-bersih-akun-grafana-1  Exited                                    26.3s
 ✔ Container uji-bersih-backend-1       Healthy                                   26.3s
 ✔ Container uji-bersih-web-1           Healthy                                   26.0s
 ✔ Container uji-bersih-grafana-1       Healthy                                   43.4s
```

`--wait` menunggu semuanya siap; `mosquitto` dan `web` (tanpa pemeriksaan kesehatan) ditulis `Healthy` = menyala. Grafana paling lama karena lemarinya kosong. Di Chrome, buka `http://localhost/masuk` (pilihan 2: `http://localhost:8086/masuk`). Layar **Masuk** tampil = hentikan *stopwatch*: itulah **waktu L1**. Lemari kosong belum punya akun; buat admin pertama ([`kelola-pengguna.ts`](kode/backend/src/db/kelola-pengguna.ts)):

```text
docker compose exec backend node src/db/kelola-pengguna.ts tambah admin@rumah.test "Admin Rumah" admin
```

Ketik sandinya dua kali. **Hasilnya** (lab penulis):

```text
Sandi baru: ************************
Ketik sekali lagi: ************************
akun 1 dibuat: admin@rumah.test (Admin Rumah, admin)
```

**Masuk** dengan akun itu: daftar perangkat masih kosong (`Belum ada perangkat terdaftar…`). Lab penulis (pilihan 2; image resmi sudah ada; toko tiruan; skrip mengetik perintah dan mengisi `.env`; repo lab sudah di `main`, tanpa `git switch`): **62,3 detik** sampai halaman Masuk, 71,2 detik sampai akun admin. Laptop teman dengan internet rumah tidak diuji penulis. Terakhir, ukuran unduhannya:

```text
docker compose images
```

Kolom `SIZE` (Engine 29 penulis) = ukuran terkompres yang diunduh; lab penulis (arm64): timescaledb `535MB`, grafana `445MB`, backend `71.9MB`, web `24MB`, mosquitto `13.2MB` = ±1.089 MB (amd64 ±1,14 GB, dihitung), + 62,6 MB `node:24.22.1-alpine3.24` pembuat rahasia.

**Kamu lulus langkah ⭐ ini (L1)** kalau halaman **Masuk** terbuka < 10 menit sejak `git clone`, dan akun admin bisa masuk.

#### 11.3 ⭐ L2: layanan bawaan menyala, Grafana dari berkas, dan riwayat contoh (8 menit)

```text
docker compose ps -a
```

**Hasilnya** (lab penulis): `backend`, `db`, dan `grafana` `Up … (healthy)`; `mosquitto` dan `web` `Up`; `akun-broker`, `migrasi`, dan `akun-grafana` `Exited (0)`. Grafana (`http://localhost:3000`; pilihan 2: loket 3006): masuk sebagai `admin` dengan `GRAFANA_ADMIN_SANDI` dari `.env` uji. Tanpa satu klik pun, isinya dari berkas Praktik 7: **Connections → Data sources** hanya `rumahpintar-db` (lab penulis, lewat API: `Database Connection OK`); satu dashboard, `Kesehatan Sistem`; aturan `Node diam` (lab kode penulis: `Normal (NoData)` = belum ada data) dan *contact point* `Telegram Rumah Pintar` bertanda **Provisioned**.

Laptop uji belum punya riwayat. Isi data latihan 7 hari ([`isi-riwayat.ts`](kode/backend/src/db/isi-riwayat.ts)), kini dari dalam kontainer:

```text
docker compose exec backend node src/db/isi-riwayat.ts
```

Petugas ringkasan hanya meringkas 3 hari terakhir, jadi ringkas data latihan sekali dengan tangan:

```text
docker compose exec db psql -U postgres -d rumahpintar -c "CALL refresh_continuous_aggregate('readings_per_jam', NULL, NULL);"
```

**Hasilnya** (lab penulis, dua perintah):

```text
f00d00000001: 1139 bacaan dikirim, 1139 baru tersimpan
f00d00000002: 1139 bacaan dikirim, 1139 baru tersimpan
CALL
```

Buka `http://localhost/perangkat/f00d00000001/riwayat` (pilihan 2: loket 8086): grafik 7 hari berisi (lab kode penulis: `Rata-rata per jam, 7 hari terakhir … 169 titik`). Di `Kesehatan Sistem`, panel RSSI, Uptime, dan Heap justru merah, `db query error: ERROR: syntax error at or near ")" (SQLSTATE 42601)`: panel itu menunggu perangkat **terdaftar**, yang tidak dibuat data latihan ([🚨](#-kalau-tidak-jalan), *Panel merah …*). Kalimat L2 yang jujur: riwayat berisi; Grafana tersambung, panelnya menunggu perangkat terdaftar.

**Kamu lulus langkah ⭐ ini (L2)** kalau `ps -a` menunjukkan lima layanan `Up` (tiga `(healthy)`) dan tiga `Exited (0)`, Grafana lengkap tanpa klik, dan grafik Riwayat berisi.

#### 11.4 ⭐ L3 di tempat uji: sidik jari sebelum dan sesudah `down` (7 menit)

Resep [8.4](#84--l3-sidik-jari-sama-sesudah-docker-compose-down-lalu-up--d-8-menit), kini di folder uji yang tanpa aliran data (PowerShell: varian 4.5):

```text
docker compose exec -T db psql -U postgres -d rumahpintar < skrip/sidik-jari.sql
```

Simpan barisnya, lalu satu per satu:

```text
docker compose down
```

```text
docker compose up -d --wait
```

Ambil sidik jari lagi. **Hasilnya** (lab penulis; sebelum `down` dan sesudah `up` sama persis):

```text
 bacaan |            sidik_jari            | ringkasan | jilid | tugas | akun | perangkat
--------+----------------------------------+-----------+-------+-------+------+-----------
   2278 | 223334dfd3e1f0a6a773c57733116b8a |       380 |     9 |     3 |    1 |         2
(1 row)
```

Isinya: 2 × 1139 bacaan dan dua perangkat latihan, satu akun admin. `down` menghapus delapan kontainer dan lorongnya tanpa baris `Volume`; `up -d --wait` ±26 detik.

**Kamu lulus langkah ⭐ ini (L3)** kalau `bacaan`, `sidik_jari`, `akun`, dan `perangkat` sesudah `up` sama persis dengan sebelum `down`.

#### 11.5 Catatan belajar: tiga angka, `docker stats`, lalu bersihkan proyek uji (5 menit)

Tulis tiga angka di `belajar-iot/modul-26/`: **total** (11.2); **tanpa unduhan**: sesudah pembersihan di bawah, ulangi 11.2 di folder kosong baru dengan baris pilihan 2 (cetakan sudah ada, lemari baru), lalu bersihkan lagi; dan **kecepatan unduh internetmu** (situs uji kecepatan apa pun). ±1.089 MB butuh ±3 menit pada 50 Mbit/s, ±7,3 menit pada 20 Mbit/s, dan ±14,5 menit pada 10 Mbit/s. Total lewat 10 menit, tetapi tanpa unduhan jauh di bawahnya? Yang lambat unduhannya, bukan sistemmu; tulis keduanya apa adanya. Lalu:

```text
docker stats --no-stream
```

**Hasilnya** (lab penulis, lima baris `uji-bersih-…`, kolom `MEM USAGE / LIMIT`): backend ±77 MiB, db ±148, grafana ±244, mosquitto ±3,7, web ±12,5; jumlahnya ±486 MiB, bekal [VPS 2 GB](../../SILABUS.md#55-biaya-layanan-fase-5) Modul 27 (tanpa Kubernetes: [🔬](#-bedah-teknis-opsional)).

**Bersihkan HANYA proyek uji.** Pilihan 2, di terminal folder uji, ketik lengkap:

```text
docker compose down
```

```text
docker volume rm uji-bersih-data uji-bersih-grafana-data uji-bersih_data-broker
```

**Hasilnya:** nama setiap lemari yang dihapus. Jangan `down -v` di folder rumahmu. Folder uji (berisi `.env` uji) boleh dihapus. Rumah yang kamu `down` di 11.1: `docker compose up -d` di akar proyek (cetakannya sudah ada dari uji). Laptop teman: cukup `docker compose down`; perintah penghapus lemari `rumahpintar-…` sengaja tidak ditulis di modul ini.

> ⬆️ **Selesai Praktik 11?** Lanjut ke [➕ Tambahan](#-tambahan-ke-rumah-pintar-mini); [🧩 Tantangan](#-tantangan-mandiri) boleh dikerjakan sesudahnya, di cabang baru dari `main`.

## 🚨 Kalau Tidak Jalan?

Klik judul yang mirip masalahmu; Docker dasar ada di 🚨 Modul 17, broker di 🚨 Modul 21, Grafana di 🚨 Modul 25. Lirik dulu `docker compose ps -a` dan `docker compose logs <layanan>` di akar proyek (gerbang: folder `edge` di Pi), lalu bandingkan berkasmu dengan [`kode/`](kode/). Galat dikutip dari lab penulis (Linux, Compose 2.40.3). Bertanya di forum atau ke AI? Tempel lognya, jangan `.env` atau keluaran `docker compose config`.

<details>
<summary><b>Petunjuk lama → yang benar untuk versi kita (<code>docker compose</code>, Mosquitto 2.1.2, Caddy 2.11.7, Uptime Kuma 2.5.8)</b></summary>

| Petunjuk lama | Yang benar untuk versi kita | Kenapa |
| :--- | :--- | :--- |
| `docker-compose up` | `docker compose up` | versi 1 sudah pensiun |
| `version: "3.8"` | hapus | ``the attribute `version` is obsolete`` |
| `links:` | nama layanan (`db:5432`) | lorong Compose |
| `image: …:latest`, mis. `eclipse-mosquitto:latest` | *tag* persis: `eclipse-mosquitto:2.1.2-alpine` | `latest` berubah sendiri |
| `louislam/uptime-kuma:latest` atau `:1` | `louislam/uptime-kuma:2.5.8-slim` | `latest` = seri 1 lama |
| `depends_on: [db]` | `condition: service_healthy` | menyala belum berarti siap |
| `CMD npm start` | `CMD ["node", "src/server.ts"]` | npm menelan sinyal berhenti |
| `docker exec rumahpintar-db …`, `docker logs rumahpintar-grafana` | `docker compose exec db …`, `docker compose logs grafana` | nama layanan |
| `localhost:5432` di dalam kontainer | `db:5432` | `localhost` = kontainer itu |
| Pi: `sudo systemctl restart mosquitto`, `sudo tail -f /var/log/mosquitto/…` | folder `edge`: `docker compose restart mosquitto`, `docker compose logs -f mosquitto` | broker Pi kini kontainer |
| `kill -s SIGHUP` (*reload*) | `docker compose restart <layanan>` | [Modul 21](../../fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md#44-jalur-perangkat-kunci-pintunya-lalu-restart-10-menit) |
| `auto_https off` | alamat situs `:80` | Konsep 4 |
| `docker pull a b c` | satu image per perintah | `'docker pull' requires 1 argument` |
| Pi: skrip `get.docker.com`, paket `docker.io` | repo apt Docker (6.1) | dokumentasi Docker |
| `down -v` atau `prune` | `docker compose down` | lemari ikut terhapus |

</details>

**Berkas Compose dan `.env`**

<details>
<summary><b><code>no configuration file provided: not found</code></b></summary>

Terminalmu bukan di akar proyek (gerbang: `edge`), atau `.env` belum ada sehingga `COMPOSE_FILE` tak terbaca (Konsep 5). Pindah folder; buat `.env` seperti [4.2](#42-kebersihan-git-dulu-gitignore-gitattributes-lalu-env-dengan-sandi-postgres-lama-5-menit).

</details>

<details>
<summary><b><code>required variable … is missing a value</code>: <code>MQTT_PASSWORD</code>, <code>TOKO_IMAGE</code>, atau <code>ALAMAT_PUSAT</code> belum diisi</b></summary>

Lab penulis, `.env.example` apa adanya: `error while interpolating x-setelan-backend.MQTT_PASSWORD: required variable MQTT_PASSWORD is missing a value: isi MQTT_PASSWORD di .env`. Nama variabelnya bisa berbeda tiap kali; isi **semua** baris kosong (resep rahasia acak: kepala `.env.example`). `TOKO_IMAGE=ghcr.io/<akun-huruf-kecil>` ([5.2](#52-composecloudyml-tahap-kedua-migrasi-backend-web-dan-toko_image-di-env-15-menit)) bukan rahasia, tetapi sengaja tanpa bawaan supaya Compose tidak menarik image orang lain. Gerbang: `… isi ALAMAT_PUSAT di edge/.env (IP laptop pusat)`: tulis IP laptop (6.3; di laptop yang sama `host-gateway`). `docker compose config --quiet` diam = beres.

</details>

**Loket dan nama**

<details>
<summary><b>Kontainer lama menghalangi: <code>port is already allocated</code>, <code>The container name "/rumahpintar-db" is already in use</code>, atau <code>docker network rm</code> gagal</b></summary>

- `Bind for 127.0.0.1:5432 failed: port is already allocated`: `rumahpintar-db` lama masih menyala ([4.3](#43--hapus-kontainer-lama-lemarinya-tetap-docker-stop-docker-rm-dan-docker-network-rm-8-menit) terlewat). Lemari aman: `docker compose down`, kerjakan 4.3, `up -d` lagi.
- `Conflict. The container name "/rumahpintar-db" is already in use …`: `docker run` Modul 17 diketik lagi. Rumahmu kini dinyalakan Compose.
- `network rumahpintar has active endpoints (name:"…" …)`: kontainer di `name:"…"` masih menempel; `docker stop` dan `docker rm` dulu (lemarinya tetap).

</details>

<details>
<summary><b>Loket 1883 atau 80 sudah dipakai program lain: broker laptop lama atau IIS</b></summary>

`failed to bind host port …: address already in use` (lab penulis). Cari pemakainya (🔁 Langkah 2). **1883**: broker lama jalur laptop; hentikan seperti kotak awal Praktik 5. **80** (di Windows sering IIS): `PORT_WEB=8081` dan `CORS_ORIGIN=http://localhost:8081,http://127.0.0.1:8081` di `.env`, `docker compose up -d`, buka `http://localhost:8081` (tidak diuji penulis). **8080**: *Dua backend sekaligus …*.

</details>

**Lemari dan data**

<details>
<summary><b><code>external volume "rumahpintar-data" not found</code>, atau peringatan <code>already exists but was not created by Docker Compose</code></b></summary>

- `external volume "…" not found`: lemari `LEMARI_DB`/`LEMARI_GRAFANA` belum ada. Laptop baru: dua `docker volume create` ([11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit)). Laptop lamamu: cari nama lemari lama di `docker volume ls`, tulis di `.env`; lemari kosong = rumah tanpa riwayat.
- ``… already exists but was not created by Docker Compose. Use `external: true` …``: berkasmu tanpa `external: true`, jadi `down -v` ikut menghapus lemari itu (lab penulis). Peringatannya bisa tertimpa baris kemajuan; pakai `volumes:` berkas modul.

</details>

<details>
<summary><b>Sandi di <code>.env</code> tidak berlaku: postgres menolak masuk, atau admin Grafana tetap memakai sandi lama</b></summary>

**Postgres** (lab penulis): `service "migrasi" didn't complete successfully: exit 1`; log `migrasi`: `password authentication failed for user "postgres"`. `POSTGRES_PASSWORD` hanya dibaca untuk lemari kosong (Konsep 6): tulis sandi **lama** dari pengelola sandimu, lalu `docker compose up -d`. **Admin Grafana:** sama (lab penulis: sandi `.env` ditolak `401`). Lupa? `docker compose exec grafana grafana cli admin reset-admin-password <sandi-baru>` (tidak direkam penulis), lalu ganti di avatar → **Change password**.

</details>

<details>
<summary><b>Deretan lemari tanpa nama di <code>docker volume ls</code></b></summary>

Berkas tanpa `tmpfs` meninggalkan satu lemari bernama 64 huruf-angka setiap `akun-broker`, `mosquitto`, atau `akun-grafana` dibuat; berkas modul: nol (lab penulis). Samakan berkasmu; sisa latihan yang kamu kenali: `docker volume rm <nama>`, satu per satu. Jangan *prune*.

</details>

<details>
<summary><b>Cadangan: <code>pg_restore</code> selesai dengan exit 1, atau <code>tar: can't open … Permission denied</code></b></summary>

- Exit 1 dengan 31 × `ERROR:  role "grafana_baca" does not exist` (lab penulis) = wajar: akun database tidak ikut arsip; sidik jari 9.3 buktinya. Galat lain (mis. `timescaledb_pre_restore()` terlewat): bersihkan proyek uji ([9.4](#94-bersihkan-hanya-proyek-uji-lalu-opsional-cadangan-lemari-grafana-7-menit)), ulangi 9.2 dengan lemari baru.
- `tar: can't open '/backup/grafana-salah.tgz': Permission denied` (lab penulis): image Grafana (uid 472) tidak boleh menulis ke foldermu; pakai `node:24.22.1-alpine3.24` (9.4).

</details>

<details>
<summary><b>Database-mu di Pi, atau Grafana-mu dipasang tanpa Docker</b></summary>

- **Database di Pi** (🔬 [Modul 17](../../fase-3-backend-data/modul-17-sql-dan-skema-database/README.md#-bedah-teknis-opsional)): `pg_dump` di Pi, salin arsipnya ke laptop, pulihkan ke lemari `rumahpintar-data` baru (resep Praktik 9), bandingkan sidik jarinya (tidak diuji penulis).
- **Grafana tanpa Docker** (🔬 [Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md#-bedah-teknis-opsional)): hentikan layanan lamanya, `docker volume create rumahpintar-grafana-data` sebelum 4.4, lewati 7.3; isinya dari berkas, admin masuk `admin`/`admin` (4.1 tanpa `GRAFANA_ADMIN_SANDI`; tidak diuji penulis).

</details>

**Cetakan dan *build***

<details>
<summary><b>Backend di kontainer langsung berhenti: <code>unable to determine transport target for "pino-pretty"</code> atau <code>node: .env: not found</code></b></summary>

Bunyi pertama = cetakan backend 1.2 (perapi log masih di dapur); kedua (exit 9) = skrip npm 1.2 di kontainer tanpa `.env`. Kerjakan 2.1, lalu `docker compose up -d --build`.

</details>

<details>
<summary><b>Skrip <code>.sh</code> gagal dengan <code>not found</code> atau <code>illegal option -</code>: akhir baris CRLF</b></summary>

Lab penulis (skrip uji `coba.sh`): `exec: line 11: /coba.sh: not found` atau `/coba.sh: set: line 2: illegal option -`; `file coba.sh` menulis `with CRLF line terminators`. Proyek ini tanpa `.sh`; `.conf`, ACL, Caddyfile, `.env`, YAML, dan `.dockerignore` terbukti tahan. Skripmu: di VS Code klik `CRLF` di bilah status → `LF`, simpan; `.gitattributes` (4.2) menjaganya (Windows tidak diuji).

</details>

**Web, Caddy, dan *login***

<details>
<summary><b>Layar <code>Terjadi gangguan (502).</code> dan log Caddy <code>no such host</code> atau <code>connection refused</code></b></summary>

Caddy tidak menjangkau `backend:8080`; baca `docker compose logs web`. `lookup backend … server misbehaving` atau `no such host`: tidak ada backend di lorong (wajar di 3.4); `docker compose up -d`. `connect: connection refused`: backend baru menyala (tunggu), atau `HOST` di berkasmu `127.0.0.1`, sehingga backend `(healthy)` tetapi tertutup bagi Caddy (lab penulis): kembalikan `HOST: 0.0.0.0` (Konsep 7).

</details>

<details>
<summary><b><code>permintaan dari halaman … ditolak</code> (403) saat <i>login</i> atau di Swagger, dan <code>/api/docs</code> yang rusak</b></summary>

Alamat halaman tidak ada di `CORS_ORIGIN` (lab penulis: `{"pesan":"permintaan dari halaman http://localhost ditolak"}`). Tambahkan persis seperti di bilah browser, dipisah koma, lalu `docker compose up -d`: `PORT_WEB` lain → `http://localhost:8081,http://127.0.0.1:8081`; mode HP → `http://<IP-laptop>` (+ `:port`, [🧩 Tingkat 1](#tingkat-1--dashboard-dari-hp-mode-hp-lewat-env-ubah-sedikit-20-menit)); `PORT_BACKEND` lain → `http://localhost:<port>`. Swagger: `http://localhost:8080/docs`, bukan `127.0.0.1` ([5.4](#54--masuk-lewat-caddy-di-httplocalhost-f5-bruno-dan-swagger-8-menit)). `/api/docs` memang rusak (batasan, ➕ B).

</details>

<details>
<summary><b>Terlempar ke halaman Masuk setiap 15 menit, atau <code>Sesi sudah habis</code> di mode kembang</b></summary>

- **Mode rumah:** Caddyfile-mu kehilangan tambalan `header_down Set-Cookie "Path=/auth" "Path=/api/auth"`, jadi kartu `sesi` tidak ikut ke `/api/auth/refresh` (lab penulis: `belum login: cookie sesi tidak ada`). Samakan dengan Caddyfile modul (3.2), lalu `docker compose restart web`.
- **Mode kembang:** halaman `http://localhost:5173` memanggil `http://127.0.0.1:8080`, dua alamat berbeda bagi *cookie* (Modul 22 Konsep 9). Isi `VITE_API_BASE=http://localhost:8080` di `frontend/.env.local`, lalu nyalakan ulang `npm run dev`.

</details>

<details>
<summary><b>Lencana Live tidak pernah menyala: <code>connect_error: server error</code></b></summary>

Cetakan web dari frontend 1.1: Socket.IO mengetuk `/socket.io` di luar pintu `/api` dan dijawab halaman dashboard (lab penulis). Samakan `soket.ts` dengan 3.1, lalu `docker compose up -d --build`.

</details>

<details>
<summary><b>F5 menjawab 404, atau halaman lama masih tampil sesudah image baru</b></summary>

- **F5 404:** Caddyfile tanpa `try_files {path} /index.html` di blok `handle` terakhir (3.2); samakan, lalu `docker compose restart web`.
- **Halaman lama:** sejak 1.2 Caddy mengirim `Cache-Control: no-cache` (lab penulis: langsung versi baru). Masih lama? `docker compose up -d --build`, atau **Ctrl + F5** (macOS **Cmd + Shift + R**).

</details>

<details>
<summary><b><code>terlalu banyak percobaan: coba lagi dalam …</code> (429) untuk semua tamu web sekaligus</b></summary>

Pembatas *login* Modul 20 menghitung per IP, dan lewat Caddy semua tamu ber-IP sama. Lab penulis: sesudah 10 *login* salah lewat `http://localhost`, *login* yang benar pun dijawab `… coba lagi dalam 56 detik`; lewat loket 8080 berhasil. Tunggu, atau masuk lewat Bruno. Obatnya di Modul 27.

</details>

**Broker dan jembatan**

<details>
<summary><b>Berkas sandi broker: <code>Unable to open pwfile</code> lalu <code>Restarting</code>, atau peringatan <code>owner is not root</code></b></summary>

- `Restarting` dengan log `password-file: Error: Unable to open pwfile "/mosquitto/config/sandi-broker".` (lab penulis): berkas sandi 600 milikmu dipasang dari folder proyek, tak terbaca Mosquitto di kontainer. Berkas sandi proyek ada di lemari broker (dibuat `akun-broker`): samakan `volumes:` layanan `mosquitto`; akun lama Pi masuk lewat [6.4](#64--pi-samakan-acl-salin-berkas-sandi-lama-ke-lemari-gerbang-lalu-matikan-broker-apt-10-menit).
- `… owner is not root. …` = `mosquitto_passwd` tanpa `-u mosquitto`. Kosmetik (lab penulis); pakai perintah 5.5.

</details>

<details>
<summary><b><code>Connection Refused: not authorised</code>: berkas sandi Mosquitto 2.1 dibaca broker 2.0</b></summary>

Akun dibuat dengan `mosquitto_passwd` 2.1.2 di kontainer (sandi tersimpan `$7$1000$…`), lalu berkasnya dibaca broker apt 2.0 (`$7$101$…`): ditolak (lab penulis). Arah sebaliknya aman (6.4). Selama broker apt masih dipakai, buat akunnya di Pi seperti Modul 21.

</details>

<details>
<summary><b>Jembatan tidak tersambung, atau data Node 1 tidak sampai ke dashboard</b></summary>

Gerbang mengulang `Connecting bridge pusat (pusat:1883)`, laptop tidak pernah menulis `New bridge connected … as jembatan-pi` ([6.5](#65--nyalakan-gerbang-connecting-bridge-di-pi-dan-new-bridge-connected-di-laptop-10-menit)). Periksa berurutan (Kit B tidak diuji penulis): (1) `ALAMAT_PUSAT` di `edge/.env` = IP laptop **sekarang** (pesan alamat tetap di router), lalu `docker compose up -d` di `edge`; (2) laptop: `docker compose ps` menulis `0.0.0.0:1883->1883/tcp`, *firewall* tidak menahannya; (3) akun dan sandi `jembatan-pi` sama di broker pusat (6.2) dan `edge/jembatan/pusat.conf`, blok ACL `7) jembatan-pi` ada; lalu `docker compose restart mosquitto`. Tersambung tetapi data Node 1 tidak sampai: samakan ACL repo dengan `/etc/mosquitto/acl-broker` lama (6.4 (a)).

</details>

<details>
<summary><b>Dua backend sekaligus: loket 8080 sudah dipakai, <code>session taken over</code>, atau Telegram <code>409 Conflict</code></b></summary>

Aturan satu backend ([5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit)). Lab penulis: loket sama → `npm run dev` berhenti di `listen EADDRINUSE: address already in use 127.0.0.1:8080`; loket lain → broker menulis `Client backend … disconnected: session taken over.` bergantian tiap 5 detik, dan backend mode rumah `ERROR: bot Telegram berhenti: Call to 'getUpdates' failed! (409: Conflict: …)` (Telegram tiruan). **Ctrl + C** di mode kembang, lalu `docker compose restart backend` (bot tidak pulih sendiri). 8080 dipakai program lain? Ganti `PORT_BACKEND`.

</details>

**Grafana *provisioning***

<details>
<summary><b>Grafana jatuh bangun: <code>could not find Bot Token in settings</code></b></summary>

Lab penulis: `grafana` dibuat 38 detik sebelumnya, tetapi `Up 4 seconds (health: starting)`. `environment:` `grafana` di berkasmu kehilangan bawaan `${TELEGRAM_BOT_TOKEN:-belum-diisi}` dan `${TELEGRAM_CHAT_ID:-0}`; samakan (7.2), lalu `docker compose up -d`.

</details>

<details>
<summary><b>Semua panel merah <code>Datasource ${DS_GRAFANA-POSTGRESQL-DATASOURCE} was not found</code>, lalu 🔴 <code>[no value]</code></b></summary>

Berkas ekspor Modul 25 terpasang mentah, tanpa uid `rumahpintar-db` (Konsep 9). Aturan ikut galat dan mengirim 🔴 palsu (lab penulis, Telegram tiruan): `🔴 [no value] ([no value]) tidak mengirim data, …`. Ulangi 7.1 (d) dan (e), lalu `docker compose restart grafana`.

</details>

<details>
<summary><b>Ambil alih tersendat: tombol Delete abu-abu (<code>Contact point is referenced by one or more alert rules</code>), atau <i>alert</i> terkirim dua kali</b></summary>

- **Delete abu-abu:** aturan `Node diam` masih ada (lewat API: `409` `Receiver is used by 1 rule(s)`). Urutan [7.3](#73--ambil-alih-hapus-aturan-lalu-contact-point-lalu-data-source-lama-10-menit): aturan → *contact point* → *data source* lama.
- **Dua kali:** berkas akhir menyala sebelum 7.3: *contact point* berisi dua integrasi (prototipe riset penulis; membereskannya belum diuji, maka 7.3 wajib lebih dulu); atau dua Grafana menyala: hentikan yang lama.

</details>

<details>
<summary><b>Panel merah: <code>Panel pertama</code> kehilangan <i>data source</i>, atau <code>syntax error at or near ")"</code> di laptop baru</b></summary>

- `Panel pertama` (KC Modul 25) menunjuk *data source* yang dihapus di 7.3: edit panelnya, pilih `rumahpintar-db`, **Save**; atau hapus ([7.4](#74--docker-compose-up--d-provisioned-tombol-test-dan-save-yang-ditolak-10-menit)).
- `… syntax error at or near ")" (SQLSTATE 42601)` di laptop baru (lab penulis): belum ada perangkat terdaftar, variabel `Node` kosong. Wajar ([11.3](#113--l2-layanan-bawaan-menyala-grafana-dari-berkas-dan-riwayat-contoh-8-menit)) sampai perangkat pertama terdaftar.

</details>

<details>
<summary><b>Dashboard tidak bisa disimpan: <code>This dashboard cannot be saved from the Grafana UI …</code></b></summary>

Bukan galat: dashboard dari berkas sengaja dikunci (`allowUiUpdates: false`). **Cancel** → **Exit edit**, lalu ubah lewat berkas (7.4); jangan menimpa repo lewat **Save JSON to file**.

</details>

**Bangkit sendiri dan log**

<details>
<summary><b>Migrasi gagal <code>ECONNREFUSED</code>: <code>depends_on</code> tanpa <code>service_healthy</code></b></summary>

`migrasi` keluar dengan kode 1 sebelum database siap (prototipe riset penulis: `Error: connect ECONNREFUSED 172.21.0.2:5432`), jadi backend tidak dinyalakan. `migrasi` harus menunggu `db` dengan `condition: service_healthy`, dan `db` ber-*healthcheck* `pg_isready -h 127.0.0.1 …` (Konsep 8); samakan, lalu `docker compose up -d`.

</details>

<details>
<summary><b>Layar Aturan kosong sesudah laptop dinyalakan ulang</b></summary>

Sesudah *restart* Docker atau *reboot*, backend bisa menyala sebelum database: log `aturan otomatis belum bisa dimuat: …`, dan aturan hanya dimuat sekali (batasan, ➕ B). Obatnya `docker compose restart backend` (8.5; dari kode, tidak direkam).

</details>

<details>
<summary><b>Uptime Kuma tetap menyala sesudah <code>docker compose down</code>: <code>Resource is still in use</code></b></summary>

`down` tanpa profil melewati Uptime Kuma: `! Network rumahpintar_default  Resource is still in use` (lab penulis, kode keluar 0). Pakai `docker compose --profile pantau down`.

</details>

**Toko image, arsitektur, dan Docker Hub**

<details>
<summary><b><code>no matching manifest for linux/amd64 …</code> di laptop teman</b></summary>

Image di toko dibangun di arm64 (Pi, Mac Apple silicon), laptop teman amd64 (Intel/AMD); di lab penulis bunyinya diakhiri `no match for platform in manifest: not found`. Teman membangun sendiri: `docker compose up -d --build` ([10.4](#104-arsitektur-arm64-lawan-amd64-dan-jalan-keluar-untuk-laptop-teman-7-menit)). Multi-arsitektur: 🔬, Modul 29.

</details>

<details>
<summary><b><code>invalid reference format: repository name (…) must be lowercase</code></b></summary>

`TOKO_IMAGE` berhuruf besar: `config --quiet` lolos, `up` gagal (lab penulis). Tulis akunmu huruf kecil semua, mis. `ghcr.io/budi-santoso`.

</details>

<details>
<summary><b>Tarikan ditolak: GHCR <code>denied</code> atau <code>unauthorized</code>, atau batas tarik Docker Hub</b></summary>

- **GHCR** (dokumentasi; tidak direkam penulis): saat *push* = belum `docker login ghcr.io`, token tanpa `write:packages` atau kedaluwarsa, atau `TOKO_IMAGE` bukan akunmu (10.2); saat *pull* = paket masih privat (10.3).
- **Docker Hub** membatasi tarikan tanpa akun (dokumentasinya: 100 per alamat IP per 6 jam); bunyinya belum direkam penulis. Tunggu, lalu ulangi.

</details>

**Pi, Docker Engine, dan Docker Desktop**

<details>
<summary><b>Di Pi, setiap perintah <code>docker</code> ditolak tanpa <code>sudo</code></b></summary>

`permission denied` yang menyebut `docker.sock` (tidak direkam penulis): grup `docker` ([6.1](#61-pi-docker-engine-dari-repo-apt-docker-grup-docker-dan-git-20-menit)) baru berlaku sesudah masuk ulang. `exit`, SSH lagi; `groups` harus memuat `docker`.

</details>

<details>
<summary><b>Docker Desktop kehabisan RAM atau ruang disk</b></summary>

Tidak diuji penulis. Rumah bawaan memakai ±485 MiB RAM di lab penulis, disk ±6 GB (🧰). Cek `docker system df` (1.4), bongkar proyek latihan dan profil `pantau`, lalu naikkan batasnya di **Settings** → **Resources** (Windows WSL 2: berkas `.wslconfig`; dokumentasi Docker Desktop). Jangan *prune* lemari.

</details>

**Pesan yang boleh diabaikan**

<details>
<summary><b>Boleh diabaikan: <code>npm notice New major version …</code>, <code>.env not found. Continuing without it.</code>, empat <code>warn</code> Caddy, dan peringatan ACL <code>world readable</code></b></summary>

- `npm notice …`: jangan perbarui npm di cetakan. `.env not found …`: setelan kontainer datang dari Compose.
- Caddy: `admin endpoint disabled`, `server is listening only on the HTTP port, so no automatic HTTPS will be applied to this server`, `HTTP/2 skipped because it requires TLS`, `HTTP/3 skipped because it requires TLS`: HTTP saja sampai Modul 27.
- Mosquitto: `Warning: File /mosquitto/config/acl-broker has world readable permissions. …` (juga `owner is not mosquitto`, `group is not mosquitto`): ACL repo dipasang hanya-baca, tetap berlaku (lab penulis).

</details>

## 🔬 Bedah Teknis (opsional)

Boleh dilewati: dua pilihan opsional Silabus (Kubernetes, image multi-arsitektur), jalan yang sengaja belum diambil, dan dua cerita di balik berkas kita. Tanpa langkah wajib. Kecuali ditandai "lab penulis", isinya dari dokumentasi resmi dan **belum dijalankan penulis**: **cukup dibaca**.

<details>
<summary><b>Compose lawan Kubernetes dan k3s: kapan belum perlu</b></summary>

Compose mengatur kontainer di **satu mesin**. **Kubernetes** mengatur **sekelompok mesin** (*cluster*): memilih mesin untuk setiap kontainer, memindahkannya bila satu mesin mati, menjalankan banyak salinan (*replica*) satu layanan, dan (menurut dokumentasinya) mematikan kontainer yang gagal pemeriksaan kesehatan supaya diganti baru, hal yang tidak dilakukan Compose ([Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log)). **k3s**, Kubernetes ringan, menurut dokumentasinya butuh sedikitnya 2 inti prosesor dan 2 GB RAM untuk server-nya, fitur kernel `cgroups` yang belum menyala di Raspberry Pi OS standar, dan SSD karena kartu SD tak kuat menahan beban tulisnya.

Rumah kita satu Pi dan satu laptop (kelak VPS 2 GB), satu salinan per layanan, ±485 MiB RAM di lab penulis; server k3s sendiri meminta seluruh 2 GB itu. Banyak salinan backend pun belum bisa: pembatas *login* [Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#8-rate-limiting-jam-pasir-untuk-penebak-sandi) menghitung di memori tiap salinan (banyak server butuh tempat hitung bersama, misalnya Redis), dan dua backend saling menendang di broker dan di bot Telegram (`409 Conflict`). Jadi tetap **satu** backend. Kubernetes ada di [peta jalan lanjutan](../../SILABUS.md#10-setelah-expert-peta-jalan-lanjutan) Silabus, untuk jutaan perangkat dan tim besar.

</details>

<details>
<summary><b>Satu image untuk dua arsitektur: <code>docker buildx build --platform</code></b></summary>

`docker build` membuat cetakan untuk prosesor mesinnya saja ([Konsep 11](#11-toko-image-ghcr-dan-arsitektur), [10.4](#104-arsitektur-arm64-lawan-amd64-dan-jalan-keluar-untuk-laptop-teman-7-menit)). **Buildx** (ikut Docker Desktop; di Pi paket `docker-buildx-plugin` dari 6.1) bisa membangun keduanya sekaligus sebagai satu indeks multi-arsitektur, seperti cetakan resmi:

```text
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/<akun-huruf-kecil>/rumah-pintar-mini-backend:1.3.0 --push ./backend
```

`--push` langsung mengirimnya ke toko (sesudah `docker login ghcr.io`, 10.2). Arsitektur lain dibangun lewat **emulasi** QEMU: Docker Desktop sudah membawanya, sedangkan di Linux dan Pi emulatornya harus didaftarkan dulu ke kernel (dokumentasi Docker: image `tonistiigi/binfmt` dengan `--privileged`). Penulis tidak melakukannya karena mengubah setelan sistem; `docker buildx ls` di Pi penulis hanya mendaftar `linux/arm64`. Emulasi juga jauh lebih lambat, padahal *build* web di Pi 5 tanpa emulasi saja 103 detik. Image amd64 kita (termasuk bcrypt musl x64) belum pernah dijalankan penulis. [Modul 29](../../SILABUS.md#modul-29--testing--cicd-setiap-perubahan-diuji-dan-dipasang-otomatis) membuat keduanya otomatis.

</details>

<details>
<summary><b>Grup <code>docker</code> setara root, dan Docker <i>rootless</i></b></summary>

Dokumentasi Docker terus terang: program inti Docker (*daemon*) berjalan sebagai root, dan grup `docker` memberi anggotanya hak setingkat root, karena siapa pun yang boleh memerintah Docker bisa menyalakan kontainer yang memasang folder mana pun milik Pi, termasuk `/`, lalu mengubah isinya. Karena itu di [6.1](#61-pi-docker-engine-dari-repo-apt-docker-grup-docker-dan-git-20-menit) hanya akunmu yang masuk grup (atau tanpa grup: `sudo docker …`). Begitu juga `/var/run/docker.sock`, pintu perintah Docker: alat atau kontainer yang diberi akses ke sana ikut setara root.

**Docker *rootless*** menjalankan *daemon* dan kontainernya sebagai pengguna biasa. Syaratnya paket `uidmap` dan sedikitnya 65.536 nomor pengguna cadangan (*subuid*/*subgid*) untuk akunmu; supaya ikut menyala saat Pi dinyalakan, dokumentasinya memakai `sudo loginctl enable-linger <akun>`. Harganya, loket di bawah 1024 ditolak (contoh dokumentasinya: `cannot expose privileged port 80`): broker gerbang 1883 aman, `web` di loket 80 tidak. Modul ini tetap memakai Docker biasa.

</details>

<details>
<summary><b><code>docker compose watch</code> untuk mode kembang</b></summary>

Mode kembang kita ([5.6](#56-log-kontainer-lalu-berpindah-antara-mode-rumah-dan-mode-kembang-8-menit)) menjalankan `npm run dev` di laptop. Cara lain dari Compose: bagian `develop:` → `watch:` di berkas Compose, lalu `docker compose watch`. Begitu berkas di laptop berubah, Compose menjalankan aksinya: `sync` (salin ke kontainer yang sedang jalan), `sync+restart` (salin, lalu *restart*), atau `rebuild` (bangun ulang cetakan, ganti kontainernya); hanya untuk layanan ber-`build:`. Sketsa untuk backend:

```yaml
  backend:
    # …
    develop:
      watch:
        - action: sync+restart
          path: ./backend/src
          target: /app/src
        - action: rebuild
          path: ./backend/package.json
```

Kenapa tetap `npm run dev`? (1) Dokumentasinya meminta pengguna kontainer (`USER`) bisa menulis ke folder tujuan, padahal `backend/Dockerfile` menyalin `src` sebagai root lalu berganti ke `USER node`: perlu `COPY --chown` (mengubah cetakan). (2) `node_modules/` jangan disinkronkan: paket npm bisa membawa kode mesin yang tidak lintas platform (bcrypt). (3) Cetakan web hanya berisi `dist/` tanpa Vite: setiap ubahan dashboard = `rebuild`, ±50 detik di Pi penulis, bukan segar seketika seperti Vite.

</details>

<details>
<summary><b>Node-RED dalam kontainer: profil <code>nodered</code></b></summary>

`edge/compose.edge.yml` sudah memuat layanan `nodered` (`nodered/node-red:5.0.9-24`, lemari `data-nodered`, loket 1880) di profil `nodered`, tetapi Modul 26 tetap memakai Node-RED systemd [Modul 13](../../fase-2-konektivitas/modul-13-node-red-dashboard/README.md#3-node-red-di-gateway-layanan-berkas-dan-kata-sandi) ([Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang)). Resep pindahnya:

1. Di editor lama, ekspor flow terbaru ke `edge/node-red-flows.json` (caranya di [`kode/edge/README.md`](kode/edge/README.md)). Lalu di terminal SSH Pi: `sudo systemctl disable --now nodered`, karena loket 1880 hanya muat satu Node-RED.
2. Masih di Pi, folder `edge`: `docker compose --profile nodered up -d`.
3. Lemari baru = Node-RED baru: tanpa flow, tanpa palet Dashboard, dan editornya **tanpa sandi** (dokumentasi Node-RED: siapa pun yang menjangkau IP-nya bisa mengubah flow). Pasang pengamannya dulu (panduan resmi "Securing Node-RED"), lalu `@flowfuse/node-red-dashboard` lewat **Manage palette**, lalu **Import** `node-red-flows.json`.
4. Di node broker, ganti server `localhost` menjadi `mosquitto`, karena di dalam kontainer `localhost` = kontainer Node-RED itu sendiri. Isi lagi akun `nodered` di tab **Security** (kredensialnya di `flows_cred.json`, tidak ikut ekspor), lalu **Deploy**.

Memasang folder `~/.node-red` Pi langsung (*bind mount*) juga bisa, asal pemiliknya uid 1000, pengguna di dalam image. Jalan mundur: `docker compose stop nodered`, lalu `sudo systemctl enable --now nodered`. Jangan `docker compose --profile nodered down`: broker gerbang ikut mati.

</details>

<details>
<summary><b><i>Secrets</i> Compose lawan <code>.env</code></b></summary>

Isi `.env` masuk ke kontainer sebagai variabel lingkungan, yang mudah bocor: `docker inspect` tanpa `--format` mencetaknya ([🔁 Langkah 5](#langkah-5--membaca-setelan-kontainer-lama-dengan-docker-inspect-tanpa-membocorkan-sandi)), dan menurut dokumentasi Compose isinya bisa tercetak di log saat mencari galat. Fitur ***secrets*** memasang setiap rahasia sebagai **berkas** `/run/secrets/<nama>`, hanya di layanan yang diberi izin. Programnya harus tahu membaca berkas: image Postgres mengenal `POSTGRES_PASSWORD_FILE`, Grafana `GF_SECURITY_ADMIN_PASSWORD__FILE` (dua garis bawah). Proyek ini tetap memakai `.env` ([Konsep 9](#9-rahasia-dan-konfigurasi-sebagai-berkas-env-dan-provisioning-grafana)) karena dua hal:

- **Backend 1.3.0 hanya membaca variabel lingkungan**, dan sandi postgres terselip di `DATABASE_URL`. Pindah ke *secrets* berarti mengubah kode backend.
- **Pemilik berkas.** Rahasia dari berkas dipasang apa adanya (*bind mount*): `uid`, `gid`, dan `mode` (bawaan `0444`) diabaikan. Grafana membaca berkasnya sebagai uid 472, jadi berkas `chmod 600` milikmu (uid 1000) tidak terbaca olehnya; entrypoint Postgres membacanya sebagai root sebelum berganti ke uid 70. Belum diuji penulis (Docker Desktop mungkin lain).

</details>

<details>
<summary><b>Mengunci <i>digest</i>: <code>image: repo:tag@sha256:…</code></b></summary>

*Tag* bisa dipindah pemiliknya ([Konsep 2](#2-cetakan-berlapis-image-tag-digest-dan-arsitektur)). Supaya isi cetakan dijamin sama, tulis *digest* di belakang *tag*: *tag* untuk dibaca manusia, *digest* yang dipakai Docker.

```yaml
    image: eclipse-mosquitto:2.1.2-alpine@sha256:860aeb5d63ce509508f6dcfb2bc8a1c1dd2bc60555b562b45ce90e52d8dabb0f
```

*Digest* cetakan yang sudah ada di laptopmu (kutip `{{…}}` di PowerShell belum diuji penulis):

```text
docker image ls --digests --format 'table {{.Repository}}:{{.Tag}}\t{{.Digest}}\t{{.Size}}'
```

**Hasilnya** (lab penulis, dipotong):

```text
REPOSITORY:TAG                      DIGEST                                                                    SIZE
eclipse-mosquitto:2.1.2-alpine      sha256:860aeb5d63ce509508f6dcfb2bc8a1c1dd2bc60555b562b45ce90e52d8dabb0f   43.2MB
caddy:2.11.7-alpine                 sha256:eb4d35b7452d1ab6171fbdbe8d9275b2301dad6dad92115d91e19fb9b24d510f   89.2MB
```

Untuk image resmi, itu *digest* indeks multi-arsitektur, sama di Pi dan laptop amd64; saat dicek 28 Oktober 2026, *digest* setiap *tag* modul ini di Docker Hub masih sama dengan lab penulis. Harganya: pembaruan keamanan tidak datang sendiri; kamu yang menggantinya.

</details>

<details>
<summary><b>Grafana <code>-slim</code>: lebih hemat, belum diuji dengan dashboard kita</b></summary>

Image Grafana punya kembaran `-slim` yang, menurut dokumentasinya, tidak membawa *plugin* bawaan. Di Docker Hub saat ditulis, `grafana/grafana:13.2.5-slim` ±301 MB unduhan arm64 (±325 MB amd64), versi lengkapnya ±448 MB (±485 MB): hemat ±145–160 MB, termasuk di unduhan L1. Belum dipakai: belum diuji dengan dashboard **Kesehatan Sistem**, *data source* PostgreSQL, dan aturan kita (13.2.5 pun belum diuji di atas lemari 13.2.4). Mau mencoba? Ganti *tag* di tempat uji berlemari baru seperti [11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit), bukan di lemari Grafana rumahmu, lalu periksa setiap panel.

</details>

<details>
<summary><b>Kenapa dashboard baru langsung tampil: <code>Cache-Control: no-cache</code> dan aset hilang 404</b></summary>

Browser menyimpan salinan halaman (*cache*), dan tanpa petunjuk server, Chrome boleh memakainya tanpa bertanya. Pemeriksa kode penulis membuktikannya pada Caddyfile awal: sesudah isi `index.html` diganti (meniru *build* ulang), `/peta` yang pernah dibuka tetap versi lama sampai F5 (0 byte dari server), sedangkan `/` yang belum pernah dibuka sudah versi baru. Dua blok di `frontend/caddy/Caddyfile` ([3.2](#32-frontendcaddycaddyfile-pintu-api-aset-yang-hilang-dan-fallback-spa-10-menit)) membereskannya:

- **`index.html` dengan `Cache-Control: no-cache`**, artinya "tanya dulu sebelum memakai simpanan", bukan "jangan disimpan". Browser menyebut versi simpanannya (`If-None-Match`); kalau belum berubah, Caddy menjawab `304` tanpa isi.
- **`/assets/*` tanpa *fallback*.** Nama berkas *build* bersidik (`index-BqTTZwB4.js`) dan berganti setiap *build*, jadi `index.html` baru menunjuk nama baru. Berkas yang tidak ada dijawab `404`, bukan `index.html` yang menyamar sebagai JavaScript.

**Hasilnya** (lab penulis, kontainer `web`, dipotong):

```text
/                                    200 Cache-Control: no-cache Content-Type: text/html; charset=utf-8
/assets/index-BqTTZwB4.js            200 Content-Type: text/javascript; charset=utf-8      (tanpa no-cache)
/assets/tidak-ada.js                 404
/peta If-None-Match "<etag>"         304
```

Lalu judul halaman di kontainer diganti (meniru image baru), dan Chrome membuka `/peta` biasa, tanpa F5:

```text
navigasi /peta sesudah ganti -> Rumah Pintar Mini BARU | transferSize=1000 | /peta
navigasi /peta lagi        -> Rumah Pintar Mini BARU | transferSize=300 | /peta
```

Versi baru langsung tampil; pembukaan berikutnya cukup ±300 byte (`304`). Nama berkas `index-…` di laptopmu lain.

</details>

<details>
<summary><b>Mosquitto 3.0 kelak: <code>password_file</code> pensiun</b></summary>

Catatan rilis Mosquitto 2.1.0 (29 Januari 2026) menandai `password_file` dan `acl_file` usang (*deprecated*): keduanya akan dihapus di 3.0, diganti *plugin* `password-file` dan `acl-file` yang kodenya sama. `pusat.conf` dan `gerbang.conf` masih memakai bentuk lama, dan di 2.1.2 keduanya jalan tanpa peringatan usang di log (lab penulis). Jejak *plugin*-nya sudah tampak: galat berkas sandi di 2.1.2 diawali `password-file:` (🚨). Inilah gunanya *tag* persis: `2.1.2-alpine` tetap versi 2.1.2, sedangkan `latest` kelak menjadi 3.0. Saat 3.0 terbit, baca catatan rilisnya, ubah dua baris itu, uji di proyek terpisah, baru ganti *tag*.

</details>

## 🧩 Tantangan mandiri

> 🖥️ **Alat yang dipakai:** **VS Code** dengan terminal di **akar proyek**; **Chrome** atau **Edge**; HP di WiFi rumah (Tingkat 1). Rumah Compose menyala.

Tingkat 1 dan 2 hanya mengubah `.env` (tidak ikut Git) dan layar. Tingkat 3 menambah berkas: kerjakan sesudah ➕ E di bawah, di cabang baru dari `main` (`git switch main`, `git pull`, `git switch -c fitur/<nama-tantangan>`).

### Tingkat 1 — Dashboard dari HP: mode HP lewat `.env` (ubah sedikit, 20 menit)

Buka dashboard mode rumah dari HP **hanya dengan mengubah `.env` akar**. Port 80 laptopmu terpakai? Pakai loket web 8081. Ada dua penjaga ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)): **loket** `ALAMAT_WEB` (`127.0.0.1` = hanya laptop ini, `0.0.0.0` = seluruh WiFi) dan **satpam** `CORS_ORIGIN` ([Modul 20](../../fase-3-backend-data/modul-20-keamanan-pengguna/README.md#9-cors-mengapa-browser-menolak)), yang mencocokkan asal halaman persis: skema + nama host + port. Cari IP laptop seperti [mode HP Modul 23](../../fase-4-frontend-dashboard/modul-23-dashboard-realtime/README.md#12-hp-lewat-wifi-rumah-mode-hp-dan-mode-laptop), lalu `docker compose up -d`. Hanya loket web yang dibuka. Tanpa *port forwarding* di router: belum ada HTTPS (Modul 27), jadi sandi melewati WiFi tanpa enkripsi. Selesai mencoba, kembalikan `.env` ke mode laptop lalu `docker compose up -d` lagi, juga sebelum laptop dibawa ke WiFi lain.

**Hasilnya** (lab penulis, loket 80): hanya `migrasi`, `backend`, dan `web` yang dibuat ulang; `docker compose ps web` menulis `0.0.0.0:80->80/tcp`. "HP"-nya Chrome mode perangkat 375 piksel di mesin yang sama, bukan HP sungguhan: `http://192.168.1.10` (IP-mu berbeda) → **Masuk** → `/perangkat` dengan **Live** (kanan bawah gambar [5.4](#54--masuk-lewat-caddy-di-httplocalhost-f5-bruno-dan-swagger-8-menit)). Kartu Kebun sempat `menunggu bacaan…` (backend baru dibuat ulang).

**Lulus kalau:** HP masuk lewat `http://<IP-laptop>` (atau `:8081`) dan melihat **Live**; sesudah dikembalikan, `docker compose ps web` menulis `127.0.0.1:80->80/tcp` lagi.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Dari `env-mode-hp.contoh` di [`tingkat-1/`](kode/tantangan/kunci/tingkat-1/) (juga versi 8081 dan mode laptop):

```text
ALAMAT_WEB=0.0.0.0
CORS_ORIGIN=http://localhost,http://127.0.0.1,http://<IP-laptop>
```

Loket 8081: tambah `PORT_WEB=8081` dan tulis `:8081` di **ketiga** alamat. Asal yang tidak persis sama dijawab `403` (lab penulis: `{"pesan":"permintaan dari halaman http://192.168.1.10 ditolak"}`).

</details>

### Tingkat 2 — Uptime Kuma: profil `pantau` dan satu monitor lewat nama layanan (isi bagian rumpang, 40 menit)

Layanan `uptime-kuma` sudah tertulis di `compose.cloud.yml`, mati di balik profil ([Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang)). Nyalakan (unduhan pertama ±183 MB), buka `http://localhost:3001`, di **Which database would you like to use?** pilih **SQLite** → **Next**, buat akun admin di **Create your admin account** (sandi baru) → **Create**. Buat **satu** monitor: **Add New Monitor**, **Monitor Type** `HTTP(s)`, **Friendly Name** `Backend`, **URL** ke `/health` backend lewat **nama layanan** ([KC Langkah 5](#langkah-5--masuk-ke-kontainer-broker-nama-layanan-adalah-alamat-4-menit)), **Save**. Tanpa notifikasi: itu Modul 30. Isi tiap `____` (baris terakhir = membongkar rumah nanti; `down` biasa meninggalkan Uptime Kuma):

```text
docker compose --profile ____ up -d
http://____:____/health
docker compose --profile ____ down
```

**Lulus kalau:** monitor **Backend** hijau **Up** dengan `200 - OK`.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

Isiannya: `pantau`, `backend`, `8080`. Di kontainer Uptime Kuma, `localhost` adalah Uptime Kuma sendiri; di lorong `rumahpintar_default`, `backend` = kontainer backend dan `8080` = port di dalamnya, bukan loket laptop. **Hasilnya** (lab penulis; log backend tanpa `/health`): wizard **SQLite** sampai **Up** `200 - OK`:

![Komposit tangkapan layar asli Uptime Kuma 2.5.8 bertema terang di Chrome 156, Linux di Raspberry Pi 5 sebagai laptop, 1280 piksel, untuk Tantangan Tingkat 2 sesudah docker compose --profile pantau up -d dan membuka http://localhost:3001. Kiri atas, halaman setup-database: logo, judul Uptime Kuma, Language English, pertanyaan Which database would you like to use?, tombol MariaDB/MySQL dan SQLite yang dipilih berwarna hijau (nomor 1), keterangan A simple database file, recommended for small-scale deployments, lalu tombol Next (nomor 1). Tengah atas, halaman setup: Create your admin account, medan Username berisi admin, Password dan Repeat Password berisi titik-titik (nomor 2), tombol Create (nomor 2). Kanan atas, Add New Monitor bagian General: Monitor Type HTTP(s), Friendly Name Backend dan URL http://backend:8080/health (nomor 3), Heartbeat Interval (Check every 60 seconds) 60. Bawah, halaman monitor sesudah Save: daftar kiri Backend 100%, judul Backend #1, tautan http://backend:8080/health (nomor 3), tombol Pause, Edit, Clone, Delete, lencana hijau besar Up (nomor 4), Check every 60 seconds (1 minute) (nomor 4), Response 21ms, Uptime 100%. Potongan bagian bawah halaman yang sama: tabel Status, DateTime, Message dengan baris Up, 2026-10-28 22:40:22, 200 - OK (nomor 5). URL monitor memakai nama layanan backend di lorong Compose, bukan localhost; tanpa notifikasi. Akun admin adalah akun uji lab.](aset/uptime-kuma-wizard.png)

Batasnya: `/health` 1.3.0 tetap `200` selama prosesnya hidup, walau broker atau database putus (`"broker":false`): monitor ini menjawab "backend hidup?", belum "rumah sehat?" (Modul 30). Boleh dibiarkan menyala (lab penulis: ±196 MiB RAM). Langkah lengkap: [`tingkat-2/`](kode/tantangan/kunci/tingkat-2/).

</details>

### Tingkat 3 — Simulator dalam kontainer: profil `simulasi` di berkas Compose tambahan (buat dari nol, 60–90 menit)

Laptop teman tanpa Node.js dan tanpa Kit tetap mendapat data *live* dari satu perangkat palsu. `compose.cloud.yml` tidak diubah; buat:

- `alat/Dockerfile` satu tahap (tanpa dapur Praktik 2) dari `node:24.22.1-alpine3.24`, `USER node`, folder `data/` milik `node`, plus `alat/.dockerignore`.
- `compose.simulasi.yml` di akar: layanan `simulator` berprofil `simulasi`, `image: rumah-pintar-mini-alat:1.0.0` + `build: ./alat`, satu perangkat ke `mqtt://mosquitto:1883`, `init: true` (tanpanya `stop` menunggu 10 detik), `logging` lengkap (*anchor* `x-log` tak terbaca dari berkas lain), dan `${KUNCI_F00D00000001:-}`, bukan `:?`: Compose memeriksa variabel seluruh berkas, termasuk layanan berprofil yang mati, jadi `:?` menggagalkan `up -d` biasa.
- `.env` akar: `COMPOSE_FILE=compose.cloud.yml:compose.simulasi.yml` ([Konsep 5](#5-satu-berkas-untuk-satu-rumah-docker-compose); Windows memakai `;`, tidak diuji penulis) dan baris `KUNCI_F00D00000001` dari `alat/.env` (perangkat Modul 21, akun broker [5.5](#55--data-live-lewat-broker-pusat-simulator-kebun-tiruan-dan-tombol-lampu-7-menit)). Hentikan dulu simulator Node di terminal `alat` (**Ctrl + C**): nama kliennya sama.

Lalu `docker compose --profile simulasi up -d`. Peringatan pertama `pull access denied for rumah-pintar-mini-alat` wajar: Compose mencarinya di Docker Hub dulu, lalu membangun.

**Lulus kalau:** `docker compose logs simulator` menulis `f00d00000001: online`, `diterima` di `http://localhost/api/health` naik, dan sesudah `docker compose --profile simulasi stop simulator`, `up -d` tanpa profil tidak menyalakannya. Sebelum pindah ke `main`, kembalikan `COMPOSE_FILE=compose.cloud.yml`.

<details>
<summary><b>Kunci Tingkat 3</b></summary>

Berkas dan README-nya (juga pendaftaran perangkat di database baru): [`tingkat-3/`](kode/tantangan/kunci/tingkat-3/). **Hasilnya** (lab penulis, proyek uji, dipotong):

```text
simulator-1  | f00d00000001: online
{"ok":true,"broker":true,"database":true,"diterima":4,"ditolak":0,"diabaikan":0}
```

</details>

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini Rumah Pintar Mini **terbungkus Docker, siap dipindah ke mana saja**: backend 1.3.0, dashboard 1.2.0, dan Grafana dari berkas dalam `compose.cloud.yml`, gerbang Pi dalam `edge/compose.edge.yml`; kontrak data 1.4, firmware, dan migrasi tetap. Kodenya sudah di-*commit* di `fitur/docker-compose`. A mencocokkan, B–D merapikan dokumen, E menggabungkan ke `main`, F menyimpan catatanmu (±30 menit). Gambar [Konsep 10](#10-dua-berkas-sampai-akhir-pusat-dan-gerbang) kini juga gambar keadaan proyekmu sesudah Modul 26:

![Diagram dua berkas sampai akhir, pusat dan gerbang (Konsep 10), juga keadaan proyek sesudah Modul 26. Kiri: Node 2 Kebun v1.0.0 lewat ESP-NOW ke Node 1 Rumah v1.6.0, firmware tidak berubah, tetap ke 192.168.1.37:1883 dengan akun lama. Gerbang Raspberry Pi 192.168.1.37: edge/compose.edge.yml, proyek rumahpintar-gerbang; mosquitto gerbang (eclipse-mosquitto:2.1.2-alpine, loket 1883 untuk perangkat, berkas gerbang.conf, acl-broker, jembatan/pusat.conf tanpa Git, lemari berisi berkas sandi lama Pi); pudar: cloudflared profil terowongan dan nodered profil nodered, mati; Node-RED systemd tetap, bukan kontainer; paket apt mosquitto dimatikan. Tengah, jembatan LAN polos 1883, belum TLS, akun jembatan-pi: keluar QoS 1 rpm/+/telemetry, status, vitals, ack; masuk QoS 1 rpm/+/cmd; remote_clientid jembatan-pi tetap; pusat mati = pesan hilang, menahan pesan Modul 27; ALAMAT_PUSAT di edge/.env = IP laptop. Kanan, laptop pusat 192.168.1.10: compose.cloud.yml, proyek rumahpintar, satu docker compose up -d; mosquitto pusat ke backend 1.3.0 ke db; web 1.2.0 Caddy ke backend; grafana 13.2.4 ke db; uptime-kuma profil pantau mati; sekali jalan akun-broker, migrasi, akun-grafana; lemari external rumahpintar-data dan rumahpintar-grafana-data. Tengah bawah: browser http://localhost dan :3000, HP lewat mode HP; Telegram lewat HTTPS keluar, token hanya di .env; satu backend saja, mode rumah atau mode kembang (stop backend web lalu npm run dev), dua backend saling menendang di broker. Bawah kiri, GitHub cabang fitur/docker-compose, pull request Seluruh sistem dalam Docker Compose, 16 baris berkas: Compose 9 layanan (uptime-kuma di profil pantau), .env.example, Dockerfile dan Caddyfile, backend 1.3.0 (99 tes lulus), frontend 1.2.0, provisioning Grafana, edge (compose.edge.yml, pusat.conf, jembatan, edge/.env.example, jembatan/README.md, acl-broker), sidik-jari.sql, .gitignore, templat PR; tetap kontrak data 1.4, firmware, migrasi. Tidak pernah ikut Git: .env, edge/.env, edge/jembatan/pusat.conf, backup/, isi lemari. Kanan bawah, menyusul: Modul 27 VPS, HTTPS, TLS MQTT 8883, jembatan menahan pesan; Modul 29 GitHub Actions, image multi-arsitektur; Modul 30 Uptime Kuma, backup otomatis, runbook. Jujur: laptop tidur = semuanya tidur; penebak sandi bisa mengunci semua tamu web; image hanya untuk arsitektur pembuatnya; Docker Desktop belum diuji.](aset/dua-berkas-pusat-gerbang.png)

> 🖥️ **Alat yang dipakai:** **VS Code** di folder `rumah-pintar-mini` dengan terminal di **akar proyek** (F: jendela kedua, folder `belajar-iot`); **Chrome** atau **Edge** yang sudah masuk ke GitHub; Kit B: terminal SSH ke Pi (E). Rumah Compose boleh tetap menyala.
>
> ⭐ **Wajib** — langkah E: *pull request* ke `main`.

### A. Cocokkan proyekmu: berkas akar, `backend/` 1.3.0, `frontend/` 1.2.0, `grafana/`, dan `edge/`

Sesudah Praktik 11, berkas cabangmu harus sama dengan berkas senamanya di [`kode/`](kode/), kecuali README dan templat (B, D) serta yang memang milikmu: nama akunmu di baris `LABEL` `Dockerfile` backend dan web (10.2), `TOKO_IMAGE` di `.env.example` bila diisi (10.4), JSON dashboard ekspormu (7.1), dan `edge/acl-broker` (blok 2 berisi device_id-mu; jalur laptop: blok `2b)` terbuka). Periksa di Explorer VS Code:

- akar: `compose.cloud.yml`, `.env.example`, `.gitignore`, `.gitattributes`, `skrip/sidik-jari.sql`;
- `backend/` dan `frontend/`: `Dockerfile`, `.dockerignore`, versi `1.3.0` dan `1.2.0` di `package.json`, plus `frontend/caddy/Caddyfile`;
- `grafana/provisioning/` (empat folder, termasuk `node-diam.yaml` yang dipindah);
- `edge/`: `pusat.conf`, blok `7) jembatan-pi`, dan lima berkas gerbang 6.2.

**Jalur laptop yang melewati 6.2 dan 6.7:** buat lima berkas gerbang itu sekarang (**Copy raw file**; akun `jembatan-pi` tidak perlu): proyek rujukan memuatnya untuk semua. **Semua:** salin baris 2–3 (`# TANPA DOCKER (sebelum Modul 26): …`) dari [`kode/edge/gateway-pi.conf`](kode/edge/gateway-pi.conf) dan [`kode/edge/mosquitto-lan.conf`](kode/edge/mosquitto-lan.conf) ke bawah baris pertama berkas senama milikmu (kini hanya jalan mundur), lalu ganti baris 4 `edge/acl-broker`-mu dengan baris 4–5 rujukannya.

### B. Perbarui README proyek, lalu README `backend/`, `frontend/`, `grafana/`, `edge/`, dan `alat/`

**README akar.** Buka [README rujukan](kode/README.md) di GitHub, klik **Raw**, blok bagian `## Menjalankan seluruh sistem dalam satu perintah (Modul 26)` sampai sebelum `## Yang akan menyusul`, salin, lalu tempel di akhir `README.md` akar repositorimu: lima langkah laptop bersih (= [11.2](#112--l1-stopwatch-dari-git-clone-sampai-halaman-masuk-20-menit)), tabel perintah, dan larangan `down -v` ([8.5](#85-jangan-down--v-lalu-opsional-restart-docker-atau-reboot-pi-4-menit)). Ganti jalur dalam kurung `[Modul 26](…)` di dalamnya dengan alamat halaman ini (dari bilah alamat).

**Lima README folder** ([`backend/`](kode/backend/README.md), [`frontend/`](kode/frontend/README.md), [`grafana/`](kode/grafana/README.md), [`edge/`](kode/edge/README.md), [`alat/`](kode/alat/README.md)): ganti seluruh isinya dengan versi rujukan (**Copy raw file**). Yang baru:

- `backend/`: Compose, mode kembang, cadangan, **Catatan versi 1.3**, dan **Batasan v1.3**: laptop tidur = backend tidur (menyala terus di Modul 27); di balik Caddy, pembatas *login* menghitung semua tamu web sebagai satu alamat (`trustProxy`, Modul 27); `/health` selalu 200 (Modul 30); Swagger hanya di `http://localhost:8080/docs`, tidak lewat `/api`; aturan otomatis dimuat sekali saat menyala (obatnya `docker compose restart backend`).
- `frontend/` v1.2, **Batasan v1.2**: HTTP saja (HTTPS di Modul 27); image untuk satu awalan `/api` dan satu arsitektur; jalur *cookie* ditambal di Caddy; tidak memperbarui diri seperti Vite (*build* ulang); `VITE_API_BASE` hanya jalur atau alamat tanpa jalur.
- `grafana/`: Compose, ambil alih, token di `.env`. Menu **Export → Export as JSON** yang ditulisnya = ikon **Export** → **Export as code** di Grafana 13.2.4 (7.3).
- `edge/`: resep Pi dengan Docker, jembatan, jalan mundur. Kit B: isi lagi tabel kepalanya dengan data Pi-mu.
- `alat/`: simulator dan pemeriksa ke broker pusat `127.0.0.1:1883`.

### C. Lengkapi `.env.example` akar dan `edge/`: berkomentar, tanpa IP rumah

Keduanya sudah ada sejak 4.2 dan 6.2 (jalur laptop: A). Bandingkan dengan [`kode/.env.example`](kode/.env.example) dan [`kode/edge/.env.example`](kode/edge/.env.example): setiap kunci berkomentar, rahasia dan `ALAMAT_PUSAT` kosong, tanpa IP laptop atau Pi-mu. Setelan coba-coba (mode HP, loket lain, `COMPOSE_PROFILES`) tetap di `.env`; nilai milikmu yang boleh masuk hanya `TOKO_IMAGE` (bukan rahasia). Bekal capstone Modul 31.

### D. Tambahkan butir Modul 26 ke templat *pull request*

Ganti seluruh isi `.github/pull_request_template.md` dengan [templat rujukan](kode/.github/pull_request_template.md) (**Copy raw file**): delapan butir **(Modul 26)**, empat di **Checklist sebelum *merge*** dan empat di **Checklist keamanan**. Ringkasnya: `docker compose config --quiet` lolos dan `ps -a` tanpa `unhealthy`/`Restarting`; tag persis tanpa `latest`; image web dibangun ulang bila `frontend/` berubah; satu backend saja; `.dockerignore` dan `docker history --no-trunc` bersih sebelum *push*; loket database, Grafana, backend, dan Uptime Kuma hanya `127.0.0.1`, tanpa *port forwarding*; `.env`, `edge/.env`, `edge/jembatan/*.conf`, `backup/` tidak ikut; tanpa `down -v`, `volume rm`, atau `prune`. Dua butir **(Modul 25)** Grafana ikut disesuaikan dengan Compose.

### E. ⭐ Gabungkan `fitur/docker-compose` ke `main` lewat *pull request* "Seluruh sistem dalam Docker Compose"

Di terminal akar proyek, `git status` hanya boleh menyebut berkas A–D; `.env`, `backup/`, dan `edge/jembatan/pusat.conf` tidak muncul (diabaikan sejak [4.2](#42-kebersihan-git-dulu-gitignore-gitattributes-lalu-env-dengan-sandi-postgres-lama-5-menit)). Lalu satu per satu:

```text
git add README.md .env.example backend/README.md frontend/README.md grafana/README.md alat/README.md edge .github/pull_request_template.md
```

```text
git commit -m "Dokumen Modul 26: README, templat PR, dan berkas gerbang"
```

```text
git push
```

1. Di GitHub, klik **Compare & pull request** (base `main`), judul `Seluruh sistem dalam Docker Compose`. Tulis perubahannya dan bukti L1–L4 sejujur catatanmu (misalnya `L4 jalur laptop: simulator`), salin delapan butir **(Modul 26)** dari templat D (`main` masih memakai yang lama), lalu **Create pull request**.
2. ***Review*:** **Files changed** ±43 berkas (kode rujukan), tanpa `.env`, sandi, token, chat_id, keluaran `docker compose config`, atau IP rumah di `.env.example`. Centang yang terpenuhi, lalu **Review changes** → **Comment** → **Submit review**. Ada yang terlarang? Jangan di-*merge*: `git rm -r --cached` + nama berkasnya (rahasia: ganti juga nilainya), *commit*, *push* lagi.
3. **Create a merge commit** → **Merge pull request** → **Confirm merge** → **Delete branch**.
4. Terminal akar proyek, satu per satu: `git switch main`, `git pull --prune`, `git branch -d fitur/docker-compose`. Kit B, terminal SSH Pi (folder `rumah-pintar-mini`): `git switch main` lalu `git pull`. Selanjutnya ubah berkas gerbang di laptop, *commit*, *push*, lalu di Pi `git pull` dan `docker compose restart mosquitto` dari folder `edge` (alur `edge/README.md`).

Tombolnya sama dengan [Modul 16](../../fase-3-backend-data/modul-16-backend-typescript-api-git/README.md#86-buka-pull-request-di-github); penulis menguji penggabungan ini di repo git lokal, bukan GitHub.

**Kamu lulus langkah ⭐ ini** kalau *pull request* itu ditinjau dengan butir **(Modul 26)**, di-*merge*, dan `main` laptopmu memuat `compose.cloud.yml`, backend `1.3.0`, serta frontend `1.2.0`. Centang ➕ E di [✅](#-checklist-kelulusan-modul-26).

### F. Simpan catatan belajar: sidik jari, angka L1, dan `docker stats`

Di `modul-26/` repositori **`belajar-iot`** sudah ada `sidik-jari.md` ([1.2](#12--hentikan-penulis-data-lalu-ambil-sidik-jari-riwayat-dengan-skripsidik-jarisql-8-menit), 4.5, 8.4) dan tiga angka [11.5](#115-catatan-belajar-tiga-angka-docker-stats-lalu-bersihkan-proyek-uji-5-menit). Tambahkan `catatan.md`, tanpa sandi, token, chat_id, atau isi `.env`:

```markdown
# Catatan Modul 26 — Terbungkus Docker, siap dipindah

| Yang diukur | Angkaku |
| :--- | :--- |
| Sidik jari 1.2 = 4.5; sebelum `down` = sesudah `up -d` (8.4) | sama / beda |
| L1 total / tanpa unduhan / kecepatan internet (11.5) | … / … / … |
| `docker stats`: RAM layanan bawaan (11.5) | … MiB |
| L4 (6.6) atau pengganti jalur laptop (5.5) | … |
| Belum kuuji: laptop teman, Docker Desktop, GHCR, *reboot* | … |
```

Di bawah tabel, tempel keluaran `docker compose ps -a` sebagai blok kode (tanpa rahasia). *Commit* dan *push*.

## 📖 Glosarium

| Istilah | Arti |
| :--- | :--- |
| **Alias** | Nama tambahan layanan di lorong: `db` juga `rumahpintar-db`, jadi *data source* buatan layar Modul 25 tetap tersambung. |
| **Arsitektur** (amd64, arm64) | Jenis prosesor: amd64 = Intel atau AMD; arm64 = Pi 64-bit, Mac Apple silicon. Cetakan resmi multi-arsitektur; buatanmu hanya untuk prosesor pembuatnya. |
| **Aturan bangkit** (*restart policy*) | Kapan Docker menghidupkan lagi kontainer yang berhenti. `unless-stopped`: berhenti sendiri → hidup lagi, `stop` → tetap mati. |
| **Cetakan** (*image*) | Kemasan program dengan semua yang dibutuhkannya, tidak pernah berubah, misalnya `rumah-pintar-mini-backend:1.3.0`. |
| ***Digest*** | Sidik jari isi cetakan (`sha256:…`); berbeda dengan *tag*, tidak bisa dipindah. |
| **Docker Compose** | Satu berkas untuk satu rumah (`compose.cloud.yml`): layanan, lemari, loket, dan urutan menyala, dijalankan dengan `docker compose up -d` dari akar proyek. |
| **`Dockerfile`** | Resep cetakan (`FROM`, `COPY`, `RUN`, `USER`, `CMD`, …), satu lapisan per langkah. |
| **`.dockerignore`** | Saringan konteks *build*: `.env`, `node_modules`, `backup`, dan berkas uji tidak terkirim ke pembuat cetakan; wajib sebelum cetakan publik. |
| **`.env` dan `${…}`** | Berkas rahasia, tidak pernah di Git: akar (mode rumah), `backend/.env` (mode kembang), `edge/.env` (gerbang). `${X:-bawaan}` = nilai bawaan, `${X:?pesan}` = berhenti bila kosong. |
| **Gerbang** (*gateway*) dan **pusat** | Gerbang = Pi dengan `edge/compose.edge.yml`, broker tempat perangkat masuk; pusat = `compose.cloud.yml` di laptop (Modul 27: VPS), otak rumah. |
| **Jembatan** (*bridge*) | Sambungan broker gerbang ke broker pusat (akun `jembatan-pi`), meneruskan topik pilihan. Jembatan LAN pertama: belum TLS, belum menahan data saat putus (simpan-teruskan = Modul 27). |
| **Jendela** (*bind mount*) | Berkas atau folder repo yang terlihat dari dalam kontainer, biasanya `:ro` (`./edge/pusat.conf`, `./frontend/caddy`). Berkas tunggal yang diubah: `docker compose restart <layanan>`. |
| **Kontainer** (peti kemas) | Kue dari cetakan (Modul 17) yang bisa dibawa ke mana saja; boleh dibuang dan dicetak ulang, karena data di lemari dan rahasia di `.env`. |
| **Lapisan** (*layer*) | Hasil satu langkah resep, disimpan sebagai *cache*; diambil lagi (`CACHED`) bila ia dan langkah sebelumnya tidak berubah. |
| **Laptop bersih** | Tempat uji L1 tanpa cetakan dan lemari proyek ini; **hangat** = cetakan resmi sudah ada (penulis: 62,3 detik), **dingin** = semuanya diunduh (±1,1 GB). |
| **Layanan** (*service*) | Satu bagian rumah di berkas Compose (`db`, `backend`, `web`, …); namanya = alamatnya di lorong (`db:5432`). |
| **Layanan sekali jalan** | Petugas yang mengerjakan satu tugas lalu pulang (`akun-broker`, `migrasi`, `akun-grafana`): buat bila belum ada, lewati bila sudah; `Exited (0)` di `docker compose ps -a`. |
| **Lemari** (*volume*) | Data di luar kontainer, selamat dari `down`. Milikmu (`external`, misalnya `rumahpintar-data`) tidak pernah dihapus Compose; milik Compose (`rumahpintar_data-broker`) ikut terhapus `down -v`. |
| **Loket** (*port*) | Angka kiri di `ports` = pintu di laptop (`PORT_*`), angka kanan = port di dalam kontainer. `127.0.0.1:` = hanya laptop ini; tanpa IP = seluruh WiFi. |
| **Lorong** (*network*) | `rumahpintar_default`, dibuat Compose; layanan saling memanggil dengan nama, dan `localhost` = kontainer itu sendiri. |
| **Mode rumah** dan **mode kembang** | Compose di `http://localhost` lawan `npm run dev` dan Vite untuk mengubah kode; selalu satu backend saja. |
| ***Multi-stage*** (dapur dan meja saji) | Tahap dapur (`paket`, `bangun`) dibuang, hanya hidangannya naik ke cetakan akhir: backend 71,9 MB, web 24 MB terkompres (lab penulis). |
| **PAT *classic*** | Sandi khusus alat yang diterima GHCR: izin `write:packages` saja, masa berlaku pendek. |
| **Pemeriksaan kesehatan** (*healthcheck*) | Pertanyaan berkala Docker, "masih sehat?" (`(healthy)`), untuk urutan menyala dan `--wait`; `unhealthy` tidak me-*restart*. Pemantau yang mengabari orang = Modul 30. |
| **Pintu depan** (*reverse proxy*) | Caddy di `web`: satu alamat `http://localhost`; `/api/…` diantar ke `backend:8080`, sisanya halaman dashboard. HTTP saja (`:80`). |
| **Profil** (*profiles*) | Sakelar layanan di berkas yang sama (`pantau`, `terowongan`, `nodered`): mati sampai `--profile <nama>`. Bukan "dua profil" Silabus lama (= dua berkas Compose). |
| ***Provisioning*** **Grafana** | Grafana memasang *data source*, dashboard, *contact point*, dan aturan dari `grafana/provisioning/` setiap menyala; aturan dan *contact point*-nya bertanda **Provisioned**. Bukan *provisioning* perangkat (Modul 21 dan 28). |
| **Proyek Compose** | Nama rumah (`name: rumahpintar`): awalan kontainer, lorong, dan lemari milik Compose; proyek uji memakai nama lain (`-p`, `COMPOSE_PROJECT_NAME`). |
| **Sidik jari** riwayat | Satu baris dari `skrip/sidik-jari.sql`: `bacaan`, `sidik_jari`, `akun`, dan `perangkat` sama = tidak ada data hilang (`ringkasan` boleh berubah). |
| **SPA *fallback*** | Alamat layar yang bukan berkas (`/peta`) dijawab `index.html`, jadi F5 aman; aset yang hilang tetap `404`. |
| ***Tag*** | Label versi (`caddy:2.11.7-alpine`) yang bisa dipindah pemiliknya; tanpa *tag* = `latest`, jadi selalu tulis *tag* persis. |
| **`tmpfs`** | Folder sementara di memori, supaya lemari tanpa nama tidak menumpuk setiap kontainer dibuat baru. |
| **Toko image** (*registry*) | Tempat cetakan dititipkan (*push*) dan diambil (*pull*): Docker Hub untuk cetakan resmi, **GHCR** (saat ini gratis) untuk cetakanmu. `TOKO_IMAGE=ghcr.io/<akun-huruf-kecil>` wajib di `.env`; bukan rahasia. |

## 📝 Kuis (5 soal)

[Tanda lulus Fase 5](../../SILABUS.md#8-evaluasi--tanda-kelulusan-tiap-fase) meminta paling sedikit 4 benar di setiap kuis Modul 26–30.

1. Laptopmu menyimpan riwayat asli. (a) Apa yang dihapus `docker compose down`, dan apa yang tetap? (b) Apa yang hilang dengan `down -v`, dan kenapa riwayatmu masih selamat? (c) Kapan riwayat itu benar-benar hilang?
2. Di Modul 20 backend memakai `HOST=127.0.0.1`, di `compose.cloud.yml` `HOST: 0.0.0.0`. (a) Kenapa? (b) Kenapa HP di WiFi rumah tetap tidak bisa membuka `http://<IP-laptop>:8080`? (c) Loket mana yang sengaja terbuka ke WiFi?
3. `docker compose stop backend` lawan `docker compose exec backend kill 1`. (a) Apa kata `ps -a`, log, dan `RestartCount` sesudah masing-masing? (b) Kode keluarnya sama-sama 0. Kenapa hanya satu yang hidup lagi sendiri?
4. Cetakanmu dibangun di MacBook M3 dan dititipkan ke GHCR; temanmu memakai laptop Intel. (a) Apa yang terjadi, dan kenapa `grafana/grafana:13.2.4` tidak bermasalah? (b) Apa jalan keluarnya di Modul 26?
5. Paket backend akan dijadikan publik. (a) Kenapa `.dockerignore` harus ada sebelum `docker build`, padahal `.env` bisa dihapus di langkah resep berikutnya? (b) Apa yang diperiksa dulu, dan kenapa sebelum publik?

<details>
<summary><b>Kunci jawaban</b></summary>

1. (a) Kontainer dan lorong; semua lemari tetap, jadi sidik jari sama sesudah `up -d` (L3). (b) Lemari milik Compose, termasuk berkas sandi broker di `rumahpintar_data-broker`: `akun-broker` hanya membuat ulang akun `backend`, jadi akun perangkat dan `jembatan-pi` hilang. Riwayat dan Grafana selamat karena lemarinya `external`. (c) Bila `external: true` lupa ditulis, `down -v` ikut menghapusnya (lab penulis, proyek uji), atau lewat `docker volume rm rumahpintar-…`. Tanpa cadangan teruji (Praktik 9), hilang ([Konsep 6](#6-lemari-dan-jendela-volume-bind-mount-dan-cadangan)).
2. (a) Di dalam kontainer, `127.0.0.1` = kontainer itu sendiri, jadi Caddy yang memanggil `backend:8080` lewat lorong tidak bisa masuk; `0.0.0.0` = semua antarmuka **di dalam** kontainer. (b) Yang menentukan adalah loketnya, `127.0.0.1:${PORT_BACKEND:-8080}:8080`: hanya laptop ini. (c) Broker pusat, tanpa IP, untuk gerbang Pi dan ESP32: `0.0.0.0:1883->1883/tcp, [::]:1883->1883/tcp` di `docker compose ps`. Di WiFi umum: `docker compose stop mosquitto` ([Konsep 7](#7-lorong-dibedah-network-compose-loket-dan-pintu-depan)).
3. (a) `kill 1`: `SIGTERM diterima: backend berhenti dengan rapi`, lalu `Up … seconds` lagi dengan `RestartCount` 1 (lab penulis: ±7 detik). `stop`: `Exited (0) … ago`, tetap mati. (b) `unless-stopped` menghidupkan lagi program yang berhenti sendiri, tetapi menghormati `stop` sebagai keputusanmu; yang membedakan: siapa yang menghentikan. Karena itu `kill 1` dari dalam yang menjadi bukti Silabus "melihatnya hidup lagi sendiri" ([Konsep 8](#8-menyala-berurutan-dan-bangkit-sendiri-healthcheck-depends_on-restart-policy-dan-log)).
4. (a) M3 = arm64, dan `docker build` hanya membuat cetakan `linux/arm64`, jadi tarikan laptop Intel (`linux/amd64`) ditolak (lab penulis: `no matching manifest for linux/amd64 …`). Cetakan resmi multi-arsitektur: Docker memilih versi yang cocok. (b) Teman menjalankan `docker compose up -d --build` dan membangun sendiri dari `Dockerfile` di repo, lebih lama (laptop amd64 belum diuji penulis). Satu cetakan dua arsitektur: otomatis di Modul 29 ([Konsep 11](#11-toko-image-ghcr-dan-arsitektur)).
5. (a) `docker build` mengirim isi folder (konteks *build*), dan `COPY` mengambil dari situ. Tanpa saringan, `.env` bisa tersalin ke satu lapisan, dan lapisan itu tetap ada walau langkah berikutnya menghapus berkasnya; cetakan publik bisa dibongkar siapa saja. (b) `docker history --no-trunc` tanpa sandi atau token (2.4, 10.3), karena paket publik tidak bisa dijadikan privat lagi ([Konsep 3](#3-resep-cetakan-dockerfile-dan-dockerignore)).

</details>

---

## ✅ Checklist kelulusan Modul 26

Syarat lulus dari Silabus: **di laptop yang "bersih" (atau milik teman), `git clone` + `docker compose up -d` menjalankan seluruh sistem dalam < 10 menit, dan data riwayat tetap ada setelah `docker compose down && up`.** **Jalur laptop:** L1 + L2 + L3, dengan simulator dan Kebun tiruan sebagai pengganti L4.

> [!NOTE]
> **Penulis belum menguji Docker Desktop, Raspberry Pi OS dengan ESP32 sungguhan, GHCR dan GitHub sungguhan, laptop teman, serta *restart* Docker atau *reboot*.** Kotak Hasilnya direkam di satu Raspberry Pi 5 (Ubuntu) yang memerankan laptop dan Pi, dengan toko image dan Telegram tiruan; L1 penulis pun "hangat" ([📚](#-sumber--atribusi-gambar)). Centang hanya yang sudah terjadi padamu; yang belum, tulis "belum" di catatan dan *pull request*-mu.

- [ ] **L1** `git clone` sampai halaman **Masuk** < 10 menit, akun admin masuk; dua angka (total, tanpa unduhan), kecepatan internet, dan tempat uji tercatat (11.2).
- [ ] **L2** `docker compose ps -a`: tiga `(healthy)`, `mosquitto` dan `web` `Up`, tiga sekali jalan `Exited (0)`; Grafana lengkap tanpa klik (11.3).
- [ ] **L3** Sidik jari sama sesudah `docker compose down` lalu `up -d`, tanpa baris `Volume` di keluaran `down` (8.4, 11.4).
- [ ] **L4** (Kit B) Pi menjalankan `edge/compose.edge.yml`; Node 1 masuk dengan akun lama tanpa firmware baru, **Live** menyala, **Lampu** dijawab `ack` (6.6). **Jalur laptop:** simulator dan Kebun tiruan *live* lewat broker pusat, lampu dijawab `ack` (5.5).
- [ ] Pemanasan cocok dengan "Kunci uji dirimu" (🔁).
- [ ] MQTTX menerima pesan kontainer `pengirim` di loket 1884, lalu `down` tanpa sisa (Kemenangan Cepat).
- [ ] ⭐ Cabang `fitur/docker-compose`; sidik jari riwayat dan Grafana tercatat sesudah penulis data berhenti (Praktik 1).
- [ ] ⭐ `npm test` 15 berkas / 99 tes; cetakan backend 1.3.0 tanpa rahasia di `docker history --no-trunc`, berjalan sebagai `node` (Praktik 2).
- [ ] ⭐ *Lint* bersih, dua `SAMA`; cetakan web 1.2.0 di loket 8088 menjawab `200`, `200`, `404`, `502` (Praktik 3).
- [ ] ⭐ Kontainer lama terhapus, lemari tetap; `Skipping initialization`; sidik jari sama dengan 1.2; Grafana utuh (Praktik 4).
- [ ] ⭐ `docker compose up -d --build`; **Masuk** lewat `http://localhost`, F5 aman, Bruno `200`; data *live* lewat broker pusat; mode kembang dengan satu backend (Praktik 5).
- [ ] ⭐ (Kit B) Berkas sandi lama di lemari gerbang, broker apt `inactive`, `Connecting bridge` di Pi dan `New bridge connected` di laptop (Praktik 6).
- [ ] ⭐ Ambil alih berurutan; *data source* tinggal `rumahpintar-db`, aturan dan *contact point* **Provisioned**, **Test** sampai, **Save** dashboard ditolak (Praktik 7).
- [ ] ⭐ `exec backend kill 1` → hidup lagi (`RestartCount` 1); `stop backend` → tetap `Exited (0)` (Praktik 8).
- [ ] Arsip `pg_dump` pulih ke proyek `uji-pulih` dengan sidik jari sama; hanya proyek uji yang dibersihkan (Praktik 9, opsional).
- [ ] Dua cetakan di GHCR, `docker history` diperiksa sebelum publik, arsitektur dicatat (Praktik 10, opsional).
- [ ] ⭐ *Commit* di-*push* sebelum uji, tempat uji dipilih jujur, proyek uji dihapus dengan nama lengkap lemarinya (Praktik 11).
- [ ] Proyek cocok dengan `kode/`; README, `.env.example`, dan templat *pull request* diperbarui; catatan di `belajar-iot/modul-26/` (➕ A–D, F).
- [ ] ⭐ *Pull request* "Seluruh sistem dalam Docker Compose" digabung ke `main`, tanpa `.env`, sandi, token, atau IP rumah di **Files changed** (➕ E).

**Fase 5 dibuka: seluruh rumah dalam satu bungkusan.** Satu perintah menyalakan semuanya, riwayat dan Grafana pindah tanpa kehilangan data, dan laptop lain menjalankannya dari `git clone`. Batasnya: semua masih di jaringan rumah tanpa HTTPS dan TLS, dan laptop yang tidur ikut menidurkan bot, *alert*, dan laporan pagi.

> ➡️ **Modul berikutnya:** Modul 27 — Ke Internet: VPS, Domain, HTTPS, TLS MQTT, Bridge Pi → VPS, & Aplikasi di HP (PWA) (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa)). `compose.cloud.yml` yang sama pindah ke VPS dengan domain dan HTTPS (di Caddyfile, `:80` diganti nama domain), jembatan Pi naik ke TLS dan belajar menahan data saat internet putus, dan dashboard menjadi aplikasi di HP. Jalur gratisnya: semua di Pi, lewat Cloudflare Tunnel (profil `terowongan`).

## 📚 Sumber & atribusi gambar

**Sumber resmi** (dibaca 28 Okt 2026; isinya rilis terbaru):

- **Docker**: [`docker compose` dan `COMPOSE_FILE`](https://docs.docker.com/reference/cli/docker/compose/), [layanan](https://docs.docker.com/reference/compose-file/services/) (`depends_on`, *healthcheck*, `restart`, *profiles*), [lemari `external`](https://docs.docker.com/reference/compose-file/volumes/), [`down`](https://docs.docker.com/reference/cli/docker/compose/down/), [*restart policy*](https://docs.docker.com/engine/containers/start-containers-automatically/), [riwayat versi Compose](https://docs.docker.com/compose/intro/history/) (v5 "fungsinya identik" dengan v2), [Engine di Debian](https://docs.docker.com/engine/install/debian/) dan [grup `docker`](https://docs.docker.com/engine/install/linux-postinstall/), [catatan rilis Desktop](https://docs.docker.com/desktop/release-notes/). [Lisensi Docker Desktop](https://docs.docker.com/subscription/desktop-license/): gratis untuk pribadi, pendidikan, sumber terbuka nonkomersial, dan usaha di bawah 250 karyawan dan US$10 juta pendapatan setahun; selebihnya, termasuk instansi pemerintah, berbayar. Docker Engine (Linux, Pi) tidak terkena.
- **Image** (*tag* dan *digest* dicek di Docker Hub): [timescaledb](https://hub.docker.com/r/timescale/timescaledb/tags), [grafana](https://hub.docker.com/r/grafana/grafana/tags), [eclipse-mosquitto](https://hub.docker.com/_/eclipse-mosquitto/tags), [caddy](https://hub.docker.com/_/caddy/tags), [node](https://hub.docker.com/_/node/tags), [uptime-kuma](https://hub.docker.com/r/louislam/uptime-kuma/tags), [cloudflared](https://hub.docker.com/r/cloudflare/cloudflared/tags), [node-red](https://hub.docker.com/r/nodered/node-red/tags); [praktik baik Node.js di Docker](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md) (PID 1, `USER node`).
- **Caddy**: [Caddyfile](https://caddyserver.com/docs/caddyfile), [`handle_path`](https://caddyserver.com/docs/caddyfile/directives/handle_path), [`reverse_proxy` + `header_down`](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [HTTPS otomatis](https://caddyserver.com/docs/automatic-https) (`:80` = HTTP saja), [catatan image-nya](https://github.com/docker-library/docs/blob/master/caddy/content.md) ("Do not mount the Caddyfile directly"). **Grafana 13.2**: [*provisioning*](https://grafana.com/docs/grafana/latest/administration/provisioning/) dan [*provisioning* *alert*](https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/). **Mosquitto 2.1**: [`mosquitto.conf`](https://mosquitto.org/man/mosquitto-conf-5.html) (jembatan) dan [ChangeLog](https://github.com/eclipse-mosquitto/mosquitto/blob/master/ChangeLog.txt) (`password_file` usang, hilang di 3.0).
- **GHCR** (tidak direkam): [Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) (PAT *classic*), [visibilitas](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility), [tagihan](https://docs.github.com/en/billing/concepts/product-billing/github-packages) (image saat ini gratis). **Cadangan**: [TimescaleDB](https://www.tigerdata.com/docs/deploy/self-hosted/backup-and-restore/logical-backup), [`pg_dump`](https://www.postgresql.org/docs/17/app-pgdump.html), [`pg_restore`](https://www.postgresql.org/docs/17/app-pgrestore.html). Syarat lulus dari [Silabus §7 Modul 26](../../SILABUS.md#modul-26--docker--docker-compose-satu-perintah-untuk-semua-layanan) (v1.0.28).

**Gambar.** Rincian per file: [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| 8 diagram (`peta-jalan-modul-26` … `toko-image-dan-arsitektur`) | Diagram orisinal dari `kode/` dan uji penulis; angka dan IP = **contoh**; *reboot* dan GHCR dari dokumen, **tidak diuji**. | CC BY 4.0 (`.svg` di `aset/`) |
| `grafana-provisioning-salah`, `dashboard-lewat-caddy`, `grafana-ter-provisioning`, `uptime-kuma-wizard` | Tangkapan asli Chrome 156 di mesin rekaman (lebar 1280 px; 375 px = mode perangkat Chrome, **bukan HP**): Grafana 13.2.4 (panel merah dari proyek uji terpisah), dashboard v1.2 lewat Caddy, Uptime Kuma 2.5.8. Akun uji lab; sandi dan token tak tampak. | Grafana OSS (AGPLv3), Caddy (Apache-2.0), Uptime Kuma dan React (MIT) tampil apa adanya untuk tujuan pendidikan; judul, nomor, keterangan CC BY 4.0 |

**Tentang kotak Hasilnya.** "Lab penulis" umumnya **lab akhir**, 28 Oktober 2026 malam, pada `kode/` persis, di **Raspberry Pi 5 16 GB dengan Ubuntu 26.04.1 LTS (arm64)**: Docker Engine 29.1.3, Compose 2.40.3 (paket Ubuntu), Node.js 24.21.0, dan Chrome 156 tanpa layar (zona `Asia/Jakarta`). Beberapa kotak berasal dari lab kode (sore) atau prototipe riset (siang) hari itu di mesin yang sama, mis. *alert* dua kali tanpa ambil alih.

Mesin itu memerankan laptop DAN Pi: pusat dan gerbang = dua proyek Compose, gerbang di loket 1884 dengan `ALAMAT_PUSAT=host-gateway`. Titik awalnya "pembaca Modul 25 tiruan", dirakit dengan perintah Modul 17 dan 25 apa adanya, kecuali: broker "Pi lama" = kontainer `eclipse-mosquitto:2.0.22` dengan berkas sandi format 2.0, `sudo cat` dan `systemctl` diganti berkas dan kontainer lab, isi Grafana lewat API yang sama dengan layarnya. Node 1 = simulator `f00d00000001`, Node 2 = Kebun tiruan, MQTTX dan Node-RED = klien MQTT di mesin itu, Bruno = `curl` dengan permintaan yang sama.

Loket naskah = loketmu; backend direkam di loket lain (8080 di mesin penulis dipakai program lain), lalu ditulis 8080. Nama Docker lab ditulis ulang menjadi `rumahpintar…`, `kemenangan-cepat`, atau `uji-…` hanya pada baris yang selain itu sama. IP LAN = `192.168.1.10` (DNS `192.168.1.1`), jalur = `/home/kamu/…`. Jam ditulis WIB (mesin WITA), kecuali log database (UTC, diberi padanan WIB) dan Mosquitto (angka detik). Detik, ukuran, uid, dan angka sensor = **contoh**.

Telegram = server Bot API **tiruan** (token dan chat_id palsu): backend lewat `TELEGRAM_API_ROOT`, Grafana lewat tambahan khusus lab di `docker run` dan Compose (alias `api.telegram.org` + CA lab) yang **tidak ada** di proyekmu; kotak pesan = teks yang diterima tiruan; `409 Conflict` dua backend pun tiruan. GHCR = `registry:3.1.2` di `127.0.0.1` tanpa akun: `ghcr.io/<akun>` hanya ditulis pada baris yang tidak bergantung toko; kemajuan *push* dan *pull* diringkas. GitHub = repo git lokal: `git clone`/`git push` ke jalur lokal ditulis `https://github.com/<akun>/rumah-pintar-mini.git`; *pull request* ➕ E = penggabungan cabang di repo itu. L1 penulis **hangat**, uji paling lemah (mesin sama, folder/nama/loket lain, image resmi sudah ada); unduhan dingin ±1.089 MB hanya dihitung. *Build* pertama (45,8 s, 103 s) diukur dengan `--no-cache` karena *cache* lab sebelumnya masih ada.

Yang **tidak** diuji: Docker Desktop (Windows, macOS), PowerShell dan CMD, Raspberry Pi OS dengan Docker Engine dari repo apt dan `systemctl` (6.1 tidak dijalankan), ESP32 sungguhan ke broker kontainer, dua mesin di LAN, HP sungguhan, GHCR dan GitHub sungguhan, *restart* Docker dan *reboot*, image amd64 (bcrypt musl x64), L1 dingin dengan internet rumah, Telegram dan MQTTX sungguhan.

Yang **belum terbukti** saat terbit: Grafana 13.2.5 di atas lemari 13.2.4; Node-RED systemd di Pi ke broker gerbang (lab: klien MQTT); menghentikan broker laptop lama (semua OS); Compose 5.x; hal khusus Windows dan Mac (port 80, port < 1024, `$PWD`, CRLF Git for Windows); dan jawaban `denied` GHCR.

---

[⬅️ Modul 25](../../fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md) · [Fase 5](../README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: Modul 27 — Ke Internet: VPS, Domain, HTTPS, TLS MQTT, Bridge Pi → VPS, & Aplikasi di HP (PWA)** (segera terbit; [ringkasannya di Silabus](../../SILABUS.md#modul-27--ke-internet-vps-domain-https-tls-mqtt-bridge-pi--vps--aplikasi-di-hp-pwa))
