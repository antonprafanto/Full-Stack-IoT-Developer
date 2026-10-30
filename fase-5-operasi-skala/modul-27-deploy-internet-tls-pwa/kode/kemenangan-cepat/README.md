# Kemenangan Cepat Modul 27: amplop tersegel tanpa kartu identitas

Bahan untuk 🏆 Kemenangan Cepat Modul 27 (±15 menit, Rp 0, semua jalur). Satu kontainer Caddy menyajikan satu halaman lewat
**HTTPS** dengan sertifikat buatannya **sendiri**. Browser memperingatkanmu dengan keras, dan **itu memang yang ingin kita lihat**:
isi sambungan terenkripsi (amplop tersegel), tetapi tidak ada pihak yang dikenal browser yang menjamin identitas situsnya (tanpa
kartu identitas). Ini `setInsecure()` Modul 10, dilihat dari sisi browser. Proyek "Rumah Pintar Mini" tidak disentuh sama sekali.

| Berkas | Isinya |
| :--- | :--- |
| [`compose.yaml`](compose.yaml) | satu layanan `amplop` dari `caddy:2.11.7-alpine` (image pintu depan proyek), loket `127.0.0.1:8443` |
| [`Caddyfile`](Caddyfile) | alamat situs `localhost` + `tls internal` (penerbit lokal milik Caddy) |
| [`halaman/index.html`](halaman/index.html) | halaman "Halo dari amplop tersegel" |

**Latihan saja.** Peringatan browser di langkah 3 sengaja dibuat. Di situs sungguhan, peringatan seperti ini berarti **berhenti**: jangan
pernah melewatinya untuk situs yang meminta sandi. Loketnya hanya `127.0.0.1:8443` (hanya laptop ini), dan semuanya dibongkar di langkah 6.

## Urutan langkah

Salin folder `kemenangan-cepat` ini ke folder latihanmu (misalnya `belajar-iot/modul-27/kemenangan-cepat`), lalu buka terminal di sana.
Image `caddy:2.11.7-alpine` sudah ada sejak Modul 26 (tanpa unduhan lagi).

1. **Nyalakan:** `docker compose up -d`. Proyeknya bernama sama dengan folder (`kemenangan-cepat`).
2. **Lihat Caddy membuat kartu identitasnya sendiri:** `docker compose logs`. Caddy menulis log JSON; cari `"msg":"certificate obtained
   successfully"` dengan `"issuer":"local"` (penerbit lokal, bukan Let's Encrypt), dan `root certificate trust store installation
   disabled; unconfigured clients may show warnings` (akar sertifikatnya sengaja tidak dipasang ke laptopmu: `skip_install_trust` di
   Caddyfile).
3. **Buka `https://localhost:8443`** di Chrome atau Edge. Muncul halaman **Koneksi Anda tidak pribadi** dengan kode
   `NET::ERR_CERT_AUTHORITY_INVALID` = "penerbit sertifikat ini tidak dikenal". Baca kalimatnya, jangan buru-buru diklik.
4. **Lihat kartu identitasnya:** klik ikon di kiri bilah alamat, lalu buka rincian sertifikatnya (nama menunya berbeda per versi browser).
   Penerbitnya `Caddy Local Authority - ECC Intermediate`, di atasnya `Caddy Local Authority - 2026 ECC Root`: penerbit yang hanya ada di
   dalam kontainer ini. Nama di sertifikat (`localhost`) dan tanggalnya benar; yang gagal hanya pemeriksaan **rantai** ke akar tepercaya.
5. **Lanjutkan (sengaja, hanya di latihan ini):** **Lanjutan** → **Lanjutkan ke localhost (tidak aman)**. Halaman "Halo dari amplop
   tersegel" tampil. Sambungannya TLS 1.3 (terenkripsi), tetapi identitas situsnya tetap tidak terbukti: browser tidak memberi tanda aman
   seperti pada situs biasa. Enkripsi tanpa identitas bukan sambungan aman.
6. **Bongkar:** `docker compose down`. Kontainer dan lorongnya dihapus, termasuk sertifikat buatan Caddy (tanpa lemari). Loket 8443 bebas
   lagi.

## Tiga cara bicara dengan server (Modul 10, dilengkapi)

| | Isi terenkripsi? | Identitas server diperiksa? | Di ESP32 | Di browser |
| :--- | :--- | :--- | :--- | :--- |
| HTTP polos | tidak | tidak | `http://…` | `http://…` (dashboard Modul 26 di WiFi rumah) |
| HTTPS tanpa kartu identitas | ya | tidak | `setInsecure()` | Kemenangan Cepat ini (peringatan merah, **Lanjutkan ke localhost (tidak aman)**) |
| HTTPS dengan kartu identitas | ya | ya | `setCACert()` / bundel akar | situs dengan sertifikat Let's Encrypt (gembok, tanpa peringatan) |

Kartu identitas yang dikenali SEMUA HP dan laptop butuh **nama domain** dan penerbit yang dikenal (Let's Encrypt): itulah Konsep 5–6 dan
Praktik 6–7 minggu ini.

## Hasilnya (lab penulis)

Raspberry Pi 5, Ubuntu 26.04 arm64, Docker Engine 29.1.3, Compose 2.40.3, Chrome 156 tanpa layar berbahasa Indonesia, 29 Okt 2026
±18.43–18.46 WIB. Di lab penulis loketnya `127.0.0.1:6211` (bukan 8443) dan proyeknya `m27kode-kc`; selain itu berkasnya sama.

- `docker compose up -d`: 1,7 detik. `docker compose ps`: `Up`, kolom PORTS `80/tcp, 2019/tcp, 443/udp, 127.0.0.1:6211->443/tcp` (80, 2019,
  dan 443/udp hanya catatan bawaan image; yang dibuka ke laptop hanya 443/tcp).
- Log (dipendekkan): `"msg":"enabling automatic TLS certificate management","domains":["localhost"]`, `"msg":"root certificate trust store
  installation disabled; unconfigured clients may show warnings"`, `"msg":"certificate obtained successfully","issuer":"local"`. Tiga
  baris `warn` wajar: `admin endpoint disabled`, lalu dua untuk pengalih HTTP di port 80 kontainer, `HTTP/2 skipped because it requires
  TLS` dan `HTTP/3 skipped because it requires TLS`.
- Rantai (`openssl s_client -connect 127.0.0.1:6211 -servername localhost -showcerts`): daun (SAN `DNS:localhost`, berlaku **12 jam**)
  ← `CN=Caddy Local Authority - ECC Intermediate` (berlaku 7 hari) ← `CN=Caddy Local Authority - 2026 ECC Root`; `Protocol: TLSv1.3`;
  `Verify return code: 20 (unable to get local issuer certificate)`. `curl https://localhost:6211/` tanpa `-k`: `curl: (60) SSL
  certificate OpenSSL verify result: unable to get local issuer certificate (20)`.
- Chrome 156: judul tab **Kesalahan privasi**; **Koneksi Anda tidak pribadi**; "Penyerang mungkin mencoba mencuri informasi Anda dari
  localhost (misalnya, sandi, pesan, atau kartu kredit)."; `NET::ERR_CERT_AUTHORITY_INVALID`; tombol **Kembali agar aman** dan
  **Lanjutan** → "Server ini tidak dapat membuktikan bahwa ini adalah localhost; sertifikat keamanannya tidak dipercaya oleh sistem operasi
  komputer Anda. …" → tautan **Lanjutkan ke localhost (tidak aman)** → halaman "Halo dari amplop tersegel".
- `docker compose down`: 1,1 detik; tidak ada kontainer, lorong, atau lemari yang tersisa.

Tidak dicoba penulis: Edge, Chrome di Windows/macOS (teks bisa sedikit berbeda per versi) dan langkah 4 (bilah alamat dan
jendela sertifikat tidak bisa direkam Chrome tanpa layar; nama penerbitnya dari `openssl`).
