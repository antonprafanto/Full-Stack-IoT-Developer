# Pemanasan ulang Modul 26: Docker secukupnya & YAML

Bahan untuk 🔁 Pemanasan ulang Modul 26 (±35 menit, 5 langkah). Tidak ada yang dinyalakan, dihapus, atau diubah di langkah ini:
semuanya hanya **membaca** keadaan laptopmu dan berlatih menulis YAML.

| Berkas | Isinya |
| :--- | :--- |
| [`inventaris.md`](inventaris.md) | lembar inventaris rumah (kontainer, lemari, lorong, loket, setelan kontainer database lama) untuk diisi |
| [`latihan.yaml`](latihan.yaml) | berkas Compose kecil untuk latihan YAML dan variabel; hanya dibaca dengan `docker compose … config`, tidak dinyalakan |
| [`latihan.env`](latihan.env) | contoh variabel untuk `latihan.yaml` (tanpa rahasia) |

## Urutan langkah

1. **Inventaris rumahmu** (lembar bagian 1): `docker ps -a`, `docker volume ls`, `docker network ls`, `docker image ls`, `docker system
   df`. Catat nama kontainer, lemari, dan lorong yang sudah ada. Gunanya: Praktik 4 mengambil alih lemari `rumahpintar-data` dan
   `rumahpintar-grafana-data` ini, dan nama yang bentrok adalah sebab galat paling sering di Modul 26.
2. **Siapa memakai loket?** (lembar bagian 2). Yang dibuka Docker terlihat di `docker ps --format 'table {{.Names}}\t{{.Ports}}'`.
   Program lain (broker laptop lama, `npm run dev`, IIS):
   - Linux / Raspberry Pi: `ss -ltnp` (kolom keempat = alamat:loket; tambahkan `sudo` untuk melihat nama program milik pengguna lain).
   - macOS: `lsof -nP -iTCP -sTCP:LISTEN` *(tidak diuji penulis)*.
   - Windows (PowerShell): `Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 80,1883,3000,5173,5432,8080` *(tidak diuji penulis)*.
3. **YAML dari nol** dengan `latihan.yaml`. Baca komentarnya dari atas ke bawah, lalu dari folder ini:
   `docker compose -f latihan.yaml config`. Compose berhenti, karena `PEMILIK` wajib diisi (bentuk `${PEMILIK:?…}`). Lalu coba
   jebakan YAML di salinan berkasmu sendiri: ganti dua spasi di depan `image:` dengan satu Tab, jalankan `config` lagi, baca galatnya,
   kembalikan.
4. **Variabel lingkungan** (lanjutan Modul 16 `--env-file` dan Modul 20 Zod): `docker compose -f latihan.yaml --env-file latihan.env
   config`. Bandingkan yang tertulis di berkas dengan yang dicetak Compose: `${SAPAAN:-halo}` menjadi `selamat pagi`, `KOTA` kosong
   dengan peringatan, `007` tanpa kutip menjadi `"7"`, `1.10` tanpa kutip menjadi `"1.1"`. Lalu ubah `SAPAAN` di `latihan.env`
   menjadi baris kosong `SAPAAN=` dan lihat bawaan `halo` dipakai.
5. **Setelan kontainer database lama** (lembar bagian 3): lima perintah `docker inspect --format …` di lembar inventaris. Perintah
   variabel lingkungan sengaja hanya mencetak NAMA variabel: `docker inspect rumahpintar-db` tanpa `--format` mencetak isi
   `POSTGRES_PASSWORD` apa adanya, jadi jangan ditempel ke forum atau AI.

## Hasilnya (lab penulis)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, 28 Okt 2026 ±16.55 WIB. Jam di depan peringatan dipotong.

```text
$ docker compose -f latihan.yaml config
level=warning msg="The \"KOTA\" variable is not set. Defaulting to a blank string."
error while interpolating services.sapa.environment.PEMILIK: required variable PEMILIK is missing a value: isi PEMILIK di latihan.env

$ docker compose -f latihan.yaml --env-file latihan.env config
level=warning msg="The \"KOTA\" variable is not set. Defaulting to a blank string."
name: latihan-yaml
services:
  sapa:
    command:
      - sh
      - -c
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
    image: eclipse-mosquitto:2.1.2-alpine
    logging:
      driver: json-file
      options:
        max-file: "3"
        max-size: 10m
    networks:
      default: null
    ports:
      - mode: ingress
        host_ip: 127.0.0.1
        target: 1883
        published: "1885"
        protocol: tcp
networks:
  default:
    name: latihan-yaml_default
```

Baris peringatan `KOTA` pada perintah pertama kadang muncul, kadang tidak (di lab penulis: 10 dari 30 kali). Compose berhenti di
variabel wajib pertama yang ia temui, dan urutan pemeriksaannya acak. Yang selalu ada adalah baris `error while interpolating …
PEMILIK …`. Pada perintah kedua (dengan `--env-file`), peringatan `KOTA` selalu muncul.

Perhatikan: Compose mengurutkan kunci menurut abjad, membuang komentar, dan menulis loket `"127.0.0.1:1885:1883"` dalam bentuk
panjang (`host_ip`, `published`, `target`). Bunyi galat YAML di salinan `latihan.yaml` (Compose 2.40.3):

| Kesalahan | Bunyi galat |
| :--- | :--- |
| Tab di depan `image:` (langkah 3) | `yaml: line 18: found character that cannot start any token` (baris 18 = baris `image:`) |
| `ports:` menjorok satu spasi terlalu jauh | `yaml: line 17: did not find expected key` |
| `0x1F` / `1e3` tanpa kutip | dibaca sebagai angka: `"31"` / `"1000"` (tanpa galat) |
| `off`, `on`, `yes`, `no`, `true` tanpa kutip | tetap teks `"off"`, `"on"`, `"yes"`, `"no"`, `"true"` di Compose 2.40.3 (YAML 1.2), tanpa galat |
| kunci tanpa isi (`KOSONG:`) atau `~` | `null` (tanpa nilai), tanpa galat |

Nomor baris dan bunyi galat bergantung pada letak kesalahannya; yang pasti, Compose selalu menyebut nomor barisnya. Mulailah
memeriksa dari baris itu dan baris tepat di atasnya.

Perintah `docker inspect --format …` di lembar inventaris diuji penulis pada kontainer latihan bergaya Modul 17 (bash di Linux). Tanda
kutip di PowerShell dan CMD bisa berbeda dan **tidak diuji penulis**; bila sebuah perintah menulis `template parsing error`, jalankan
dari Git Bash, atau cukup `docker inspect rumahpintar-db` lalu cari bagian `RestartPolicy`, `Mounts`, dan `PortBindings` dengan mata
(tanpa membagikan bagian `Env`).
