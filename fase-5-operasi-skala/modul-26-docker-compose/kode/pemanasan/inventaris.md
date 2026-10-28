# Lembar inventaris rumah (Pemanasan Modul 26, langkah 1–2 dan 5)

Salin lembar ini ke catatan belajarmu (misalnya `belajar-iot/modul-26/inventaris.md`), lalu isi kolom **Di laptopmu**. Kolom
**Contoh** = yang biasanya dimiliki pembaca yang menyelesaikan Modul 17 dan 25 persis seperti naskahnya; milikmu boleh berbeda,
dan yang berbeda itulah yang perlu dicatat sebelum Praktik 4. **Jangan** menyalin sandi, token, atau isi `.env` ke lembar ini.

## 1. Barang Docker yang sudah ada

| Yang dicatat | Perintah | Contoh (pembaca Modul 25) | Di laptopmu |
| :--- | :--- | :--- | :--- |
| Versi Docker dan Compose | `docker version`, `docker compose version` | Docker Desktop 4.96.2 atau lebih baru; `Docker Compose version v5.…` (Linux paket distro: `2.40.…`) | |
| Kontainer database | `docker ps -a` | `rumahpintar-db`, `Up …`, image `timescale/timescaledb:2.30.2-pg17`, `127.0.0.1:5432->5432/tcp` | |
| Kontainer Grafana | `docker ps -a` | `rumahpintar-grafana`, `Up …`, image `grafana/grafana:13.2.4`, `127.0.0.1:3000->3000/tcp` | |
| Kontainer lain | `docker ps -a` | (tidak ada, atau sisa latihan modul lama) | |
| Lemari (*volume*) | `docker volume ls` | `rumahpintar-data` (riwayat sejak Modul 17), `rumahpintar-grafana-data` (Modul 25) | |
| Lorong (*network*) | `docker network ls` | `rumahpintar` (Modul 25), selain `bridge`, `host`, `none` bawaan Docker | |
| Cetakan (*image*) | `docker image ls` | `timescale/timescaledb:2.30.2-pg17`, `grafana/grafana:13.2.4` | |
| Ruang disk Docker | `docker system df` | kolom **SIZE** dan **RECLAIMABLE**; cukup dibaca, JANGAN `prune` | |

## 2. Loket (*port*) yang sudah terpakai

Compose Modul 26 memakai loket 80 (dashboard), 8080 (backend), 5432 (database), 3000 (Grafana), dan 1883 (broker pusat). Vite mode
kembang memakai 5173. Yang sudah terpakai sekarang harus dicatat: nanti dihentikan, atau loket Compose-nya diganti lewat `.env`.

| Loket | Dipakai siapa sekarang? (contoh) | Rencana di Modul 26 | Di laptopmu |
| :--- | :--- | :--- | :--- |
| 80 | (kosong; di Windows kadang IIS/"World Wide Web Publishing Service") | dashboard Caddy; bila terpakai: `PORT_WEB=8081` | |
| 1883 | broker laptop lama (jalur laptop Modul 12), atau kosong (broker di Pi) | broker pusat Compose; broker lama dihentikan | |
| 3000 | `rumahpintar-grafana` | Grafana Compose (kontainer lama dihapus di Praktik 4) | |
| 5173 | Vite (`npm run dev` frontend) saat menyala | tetap Vite, hanya di mode kembang | |
| 5432 | `rumahpintar-db` | database Compose (kontainer lama dihapus di Praktik 4) | |
| 8080 | backend `npm run dev` saat menyala | backend Compose (mode kembang dan mode rumah tidak boleh bersamaan) | |

## 3. Setelan kontainer database lama (langkah 5)

| Yang dicatat | Perintah | Contoh | Di laptopmu |
| :--- | :--- | :--- | :--- |
| Kebijakan menyala ulang | `docker inspect --format '{{json .HostConfig.RestartPolicy}}' rumahpintar-db` | `{"Name":"unless-stopped","MaximumRetryCount":0}` | |
| Lemari yang dipasang | `docker inspect --format '{{range .Mounts}}{{.Type}} {{.Name}} -> {{.Destination}}{{println}}{{end}}' rumahpintar-db` | `volume rumahpintar-data -> /var/lib/postgresql/data` | |
| Loket | `docker inspect --format '{{json .HostConfig.PortBindings}}' rumahpintar-db` | `{"5432/tcp":[{"HostIp":"127.0.0.1","HostPort":"5432"}]}` | |
| NAMA variabel lingkungan (tanpa isinya) | `docker inspect --format '{{range .Config.Env}}{{index (split . "=") 0}}{{println}}{{end}}' rumahpintar-db` | `POSTGRES_PASSWORD`, `POSTGRES_DB`, `TIMESCALEDB_TELEMETRY`, lalu variabel bawaan image (`PATH`, …) | |
| Lorong yang diikuti | `docker inspect --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' rumahpintar-db` | `bridge rumahpintar` | |

**Sandi postgres lama** (nilai `POSTGRES_PASSWORD` saat lemari dibuat di Modul 17) dan **sandi admin Grafana** lama tidak ditulis
di sini: pastikan keduanya ada di pengelola sandimu. Praktik 4 memakai sandi postgres LAMA itu di `.env`. Sandi `grafana_baca`
lama tidak perlu dicari: di Praktik 7, layanan `akun-grafana` menyamakannya dengan `GRAFANA_BACA_SANDI` di `.env`.
