# Gateway Rumah Pintar Mini — resep membangun ulang

🌐 **Bahasa Indonesia** · [English](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/mini-smart-home/edge/README.md)

Gateway adalah Raspberry Pi yang menjalankan broker MQTT Rumah Pintar Mini 24 jam ([Modul 12](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md)), dan sejak [Modul 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-13-node-red-dashboard/README.md) juga menjalankan Node-RED dengan dashboard dan otomasi kipas (otomasinya dimatikan sejak [Modul 16](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-3-backend-data/modul-16-backend-typescript-api-git/README.md) karena otaknya pindah ke backend); sejak [Modul 14](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-14-node-2-esp-now/README.md), dashboard itu punya kartu Kebun untuk Node 2, dan sejak [Modul 15](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-15-modbus-rs485-dan-protokol/README.md), grup Sensor RS-485 untuk sensor tanah RS-485 yang dibaca Node 1. Halaman ini adalah **cadangan utamanya**: kalau kartu microSD rusak, gateway bisa dibangun ulang dari kartu kosong dalam sekitar satu jam dengan resep di bawah. Isi tabelnya dengan data gateway-mu sendiri.

> [!CAUTION]
> **Jangan pernah menulis kata sandi** (Pi, WiFi, atau apa pun) di berkas ini atau di mana pun di repositori.

| Bagian | Gateway ini |
| :--- | :--- |
| Papan | Raspberry Pi 5 (2 GB) |
| Kartu | microSD 32 GB *high-endurance* |
| Sistem operasi | Raspberry Pi OS Lite (64-bit) rilis 2026-10-06 (tanggal `Released:` di Imager), Debian 13 "Trixie" (`cat /etc/os-release`) |
| Nama host | `gateway` |
| Pengguna | `budi` (kata sandi tidak dicatat di sini) |
| Alamat tetap | `192.168.1.37`, lewat kabel LAN (Cara A: pemesanan di router / Cara B: `nmcli`) |
| Broker | Mosquitto 2.0.21 dari paket Debian, layanan systemd `mosquitto`, pengaturan [`gateway-pi.conf`](../../../../proyek-rumah-pintar-mini/edge/gateway-pi.conf) |
| Dibangun | (tanggal) |

## Berkas di folder ini

| Berkas | Dipakai di | Isi |
| :--- | :--- | :--- |
| [`mosquitto-lan.conf`](../../../../proyek-rumah-pintar-mini/edge/mosquitto-lan.conf) | laptop ([Modul 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md); dikunci Modul 21) | `mosquitto -v -c mosquitto-lan.conf` di terminal |
| [`gateway-pi.conf`](../../../../proyek-rumah-pintar-mini/edge/gateway-pi.conf) | gateway Pi (Modul 12; dikunci Modul 21) | di Pi: `/etc/mosquitto/conf.d/gateway-pi.conf` |
| [`acl-broker`](acl-broker) | gateway Pi dan laptop ([Modul 21](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md)) | daftar izin broker (ACL): perangkat hanya menulis topiknya sendiri. Di Pi: `/etc/mosquitto/acl-broker` (DI LUAR `conf.d`) |
| `sandi-broker` | gateway Pi dan laptop (Modul 21) | **tidak ikut Git** (`.gitignore`): berkas sandi akun broker, dibuat **di mesin broker** dengan `mosquitto_passwd` |
| [`node-red-flows.json`](../../../../proyek-rumah-pintar-mini/edge/node-red-flows.json) | gateway Pi (Modul 13) | semua flow Node-RED; dipulihkan lewat **Import** di editor (langkah 11) |

## Resep membangun ulang

1. **Tulis kartu** dengan Raspberry Pi Imager: **Raspberry Pi 5** → **Raspberry Pi OS (other)** → **Raspberry Pi OS Lite (64-bit)** → kartu microSD. Di **Customisation**: nama host `gateway`, **Capital city** diisi **Jakarta (Indonesia)**, pengguna `budi` dengan kata sandi kuat, WiFi rumah (jalan cadangan), **Enable SSH** dengan **Use password authentication**, dan **Raspberry Pi Connect** tetap mati.
2. **Nyalakan** Pi dengan kabel LAN ke router. Dari laptop: `ssh budi@gateway.local`. Karena kartunya baru, laptop mungkin menolak dengan `REMOTE HOST IDENTIFICATION HAS CHANGED!`; jalankan dulu `ssh-keygen -R gateway.local` dan `ssh-keygen -R 192.168.1.37` di laptop (langkah 6 memakai alamat IP).
3. **Perbarui** (langkah 3–5 diketik di Pi, di terminal SSH tadi, kecuali perintah `ssh` untuk masuk lagi, yang diketik di laptop): `sudo apt update`, lalu `sudo apt full-upgrade`, lalu `sudo reboot`. Tunggu sekitar satu menit, lalu masuk lagi dengan `ssh budi@gateway.local`.
4. **Alamat tetap**. Untuk Cara A, pastikan pemesanan alamat `192.168.1.37` di router memakai alamat MAC `eth0` Pi ini (`ip link show eth0`; alamat ini hanya berubah kalau papan Pi-nya diganti); atau Cara B:

   ```bash
   sudo nmcli connection modify "netplan-eth0" ipv4.method manual ipv4.addresses 192.168.1.37/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.1
   ```

   lalu jalankan `sudo nmcli connection up "netplan-eth0"`. Kalau nama sambungan `eth0` di `nmcli device status` berbeda, pakai nama itu. Terminal SSH yang lewat kabel bisa membeku saat alamatnya berpindah; tutup jendelanya, lalu masuk lagi dengan `ssh budi@192.168.1.37`.
5. **Pasang broker**: `sudo apt install mosquitto mosquitto-clients`.
6. **Pulihkan pengaturan broker** dari folder ini. Di laptop, dari folder `rumah-pintar-mini`:

   ```bash
   scp edge/gateway-pi.conf budi@192.168.1.37:
   ```

   Lalu di Pi:

   ```bash
   sudo cp ~/gateway-pi.conf /etc/mosquitto/conf.d/
   ```

   ```bash
   sudo systemctl restart mosquitto
   ```

7. **Uji**: `systemctl status mosquitto` menulis `enabled` dan `active (running)`; MQTTX di laptop tersambung ke `192.168.1.37:1883`; Node 1 menyapa broker (`sudo tail -f /var/log/mosquitto/mosquitto.log`).

## Pemeriksaan bulanan

| Perintah (di Pi) | Yang dicari |
| :--- | :--- |
| `vcgencmd get_throttled` | `throttled=0x0`: tidak pernah kekurangan tegangan atau kepanasan |
| `df -h /` | `Use%` di bawah 80 % |
| `systemctl list-units --failed` | `0 loaded units listed.` |
| `sudo apt update`, lalu `sudo apt full-upgrade` | pembaruan terpasang; `sudo reboot` kalau ada pembaruan *kernel* |

Setiap kali pengaturan di Pi berubah, salin lagi berkasnya ke folder ini (`scp budi@192.168.1.37:/etc/mosquitto/conf.d/gateway-pi.conf edge/`), lalu lakukan *commit*.

## Mengunci broker (Modul 21)

Sampai Modul 20, broker menerima siapa saja tanpa kata sandi (`allow_anonymous true`). [Modul 21](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-3-backend-data/modul-21-keamanan-perangkat-broker/README.md) menguncinya: setiap program (perangkat, backend, Node-RED, pemantau) masuk dengan akunnya sendiri, dan daftar izin (ACL) membatasi topik yang boleh ditulis atau dibaca tiap akun. `gateway-pi.conf` dan `mosquitto-lan.conf` sudah berisi `allow_anonymous false`, `password_file`, `acl_file`, dan `use_username_as_clientid true`.

- **Berkas sandi `sandi-broker`** berisi sidik jari (bukan kata sandi asli) setiap akun. Dibuat dengan `mosquitto_passwd` **di mesin tempat broker berjalan** (di Pi lewat SSH; berkas sandi Mosquitto 2.1 di laptop **tidak** bisa dipakai Pi 2.0.21, dan sebaliknya). Akun pertama dengan `-c` (buat berkas), sisanya tanpa `-c`:

  ```bash
  sudo mosquitto_passwd -c /etc/mosquitto/sandi-broker backend
  sudo mosquitto_passwd /etc/mosquitto/sandi-broker nodered
  sudo mosquitto_passwd /etc/mosquitto/sandi-broker pemantau
  ```

  Lalu satu akun untuk setiap perangkat (nama pengguna = `device_id`), tempel kunci 43 huruf dari jawaban `POST /devices` dua kali:

  ```bash
  sudo mosquitto_passwd /etc/mosquitto/sandi-broker a4cf12e5b7c0
  ```

  `mosquitto_passwd -b berkas nama sandi` memasukkan sandi langsung di baris perintah — hindari, karena sandinya tertinggal di riwayat terminal. Mencabut akun: `sudo mosquitto_passwd -D /etc/mosquitto/sandi-broker <device_id>`.

- **Hak berkas (Pi).** Mosquitto 2.0 menurunkan hak ke pengguna `mosquitto` segera setelah membaca konfigurasi, jadi `sandi-broker` dan `acl-broker` harus bisa dibacanya:

  ```bash
  sudo chown mosquitto:mosquitto /etc/mosquitto/sandi-broker /etc/mosquitto/acl-broker
  sudo chmod 600 /etc/mosquitto/sandi-broker /etc/mosquitto/acl-broker
  ```

- **Salin ACL** ke Pi (di luar `conf.d` supaya tidak ikut dibaca sebagai pengaturan): `scp edge/acl-broker budi@192.168.1.37:` lalu `sudo cp ~/acl-broker /etc/mosquitto/`. `acl-broker` boleh ikut Git (tidak ada rahasia); `sandi-broker` tidak pernah.

- **Restart, bukan reload, setiap kali ACL diubah** (`sudo systemctl restart mosquitto`): di Mosquitto 2.0.21, berkas ACL yang salah ketik lalu di-*reload* membuat broker berjalan **tanpa ACL sama sekali**, sedangkan salah ketik saat *restart* membuat layanan gagal menyala — jelas terlihat di `systemctl status`. **Menambah atau menghapus akun saja** (berkas sandi) cukup `sudo systemctl reload mosquitto`; klien yang kuncinya baru dicabut langsung diputus. Urutan aman: buat akun `backend` dan `nodered` **sebelum** mengunci, supaya keduanya tidak langsung tertolak.

- **Akun tiap program.** Backend: `backend` (`.env`, `MQTT_USERNAME`/`MQTT_PASSWORD`). Node-RED: `nodered`, diisi di tab **Security** node broker (klik dua kali node "Mosquitto di gateway" → **Security** → Username `nodered` + Password → **Done** → **Deploy**); kredensial itu disimpan terenkripsi di `flows_cred.json`, **tidak** ikut `node-red-flows.json`, jadi ekspor flow tetap aman. MQTTX untuk memantau: akun `pemantau` (boleh membaca `rpm/#` dan `$SYS/#`, tidak boleh menulis). Alat `pemeriksa-kontrak.js`: akun `pemeriksa` (hanya membaca `rpm/#`).

- **Kebun tiruan, jalur tanpa Node 2 ([Modul 25](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-4-frontend-dashboard/modul-25-grafana-peta-laporan/README.md)).** Simulator `alat/simulator-perangkat.js` bisa menjalankan Node 2 palsu `f00d000000b2` yang datanya diterbitkan perangkat palsu `f00d00000001`. Supaya broker mengizinkannya, buka blok `2b) Jalur laptop (Modul 25)` di `acl-broker`: hapus `# ` (pagar dan spasinya) di depan tiga baris `user f00d00000001`, `topic write rpm/f00d000000b2/telemetry`, dan `topic write rpm/f00d000000b2/status`, simpan, lalu **restart** broker. Broker laptop (`mosquitto -v -c mosquitto-lan.conf`): **Ctrl + C**, lalu jalankan lagi perintah yang sama. Broker di Pi: salin `acl-broker` ke Pi seperti di atas, `sudo cp ~/acl-broker /etc/mosquitto/`, lalu `sudo systemctl restart mosquitto`. Pembaca dengan Node 2 sungguhan tidak perlu blok ini (biarkan tetap berkomentar). Cara memakai Kebun tiruan ada di `alat/README.md`.

Lalu lintasnya masih tanpa enkripsi: kunci terkirim polos di LAN (lihat `alat/penyadap.js`). Itu belum masalah di jaringan rumah tertutup, tetapi wajib TLS sebelum broker dibuka ke internet (Modul 27) — jangan membuat *port forwarding* ke Pi.

## Node-RED dan dashboard (Modul 13)

Node-RED berjalan di gateway yang sama sebagai layanan systemd `nodered` ([Modul 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-13-node-red-dashboard/README.md)). Semua flow-nya, yaitu dashboard v0 (dengan kartu Kebun sejak Modul 14 dan grup Sensor RS-485 sejak Modul 15) dan otomasi kipas (dimatikan sejak Modul 16 karena otak Rumah Pintar Mini pindah ke backend), tersimpan di [`node-red-flows.json`](../../../../proyek-rumah-pintar-mini/edge/node-red-flows.json). Kata sandi editor dan *passphrase* tidak pernah ikut terekspor; jangan pernah mencatatnya di sini.

| Bagian | Gateway ini |
| :--- | :--- |
| Node-RED | 5.0.8, dipasang dengan skrip resmi `install-update-nodered-deb` (bersama Node.js 24), layanan `nodered`, editor `http://192.168.1.37:1880` |
| Pengguna editor | `admin` (kata sandi tidak dicatat di sini) |
| Dashboard | FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) 1.33.0, `http://192.168.1.37:1880/dashboard/rumah` |
| Otomasi | dimatikan sejak Modul 16: empat node bagian 2 (kipas nyala di atas 30 °C, padam di bawah 28 °C) bertanda `"d": true` dan tampak pudar di editor |

Lanjutan resep, setelah langkah 7 di atas:

8. **Pasang Node-RED** di Pi, sebagai `budi` dan **tanpa** `sudo`:

   ```bash
   bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
   ```

   Ketik `y` untuk pertanyaan pertama (dalam 30 detik) dan `n` untuk *Pi-specific nodes*. Di `node-red admin init`, jawab persis seperti tabel Kemenangan Cepat Modul 13: `Share Anonymouse Usage Information` **No, do not send my usage data**; `Do you want to setup user security?` **Yes**, dengan **Username** `admin` dan kata sandi editor baru; `Do you want to enable the Projects feature?` **No**; *passphrase* diisi (catat di tempat aman, jangan di sini); `Allow Function nodes to load external modules?` **No**; lalu tekan **Enter** untuk pertanyaan lainnya. Jangan asal menekan **Enter** di semua pertanyaan: pilihan bawaan untuk data penggunaan dan modul tambahan adalah `Yes`, dan *passphrase* yang dikosongkan membuat kredensial tersimpan tanpa enkripsi.
9. **Nyalakan layanannya**: `sudo systemctl enable --now nodered.service`.
10. **Pasang Dashboard 2**: di laptop, buka `http://192.168.1.37:1880` dan masuk. Menu utama → **Manage palette** → tab **Install** → cari `@flowfuse/node-red-dashboard` → klik **install** pada paket yang namanya **persis** itu (bukan `@flowfuse/node-red-dashboard-2-…`) → klik **Install** di jendela konfirmasi.
11. **Pulihkan flow**: menu utama → **Import** → **select a file to import** → pilih `edge/node-red-flows.json` dari folder `rumah-pintar-mini` di laptop → **Import**, lalu **Deploy**.
12. **Uji**: `systemctl status nodered` menulis `enabled` dan `active (running)`; HP membuka dashboard; sakelar **Kipas** menggerakkan relay dan bergeser setelah `ack` tiba; kartu **Kebun** terisi lagi begitu Node 2 bangun (paling lama 5 menit); grup **Sensor RS-485** menulis `terbaca`, `tidak terbaca`, atau `tidak dipakai` sesuai keadaan sensornya.

Setiap kali flow berubah, ekspor lagi dari editor (menu utama → **Export** → **all flows** → **formatted** → **Download**), timpa `edge/node-red-flows.json`, lalu lakukan *commit*.
