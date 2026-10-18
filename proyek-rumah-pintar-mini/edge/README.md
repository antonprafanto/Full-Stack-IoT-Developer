# Gateway Rumah Pintar Mini — resep membangun ulang

🌐 **Bahasa Indonesia** · [English](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/en/mini-smart-home/edge/README.md)

Gateway adalah Raspberry Pi yang menjalankan broker MQTT Rumah Pintar Mini 24 jam ([Modul 12](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-12-raspberry-pi-dan-linux/README.md)), dan sejak [Modul 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-13-node-red-dashboard/README.md) juga menjalankan Node-RED dengan dashboard dan otomasi kipas. Halaman ini adalah **cadangan utamanya**: kalau kartu microSD rusak, gateway bisa dibangun ulang dari kartu kosong dalam sekitar satu jam dengan resep di bawah. Isi tabelnya dengan data gateway-mu sendiri.

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
| Broker | Mosquitto 2.0.21 dari paket Debian, layanan systemd `mosquitto`, pengaturan [`gateway-pi.conf`](gateway-pi.conf) |
| Dibangun | (tanggal) |

## Berkas di folder ini

| Berkas | Dipakai di | Isi |
| :--- | :--- | :--- |
| [`mosquitto-lan.conf`](mosquitto-lan.conf) | laptop ([Modul 11](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-11-mqtt-dan-kontrak-data/README.md)) | `mosquitto -v -c mosquitto-lan.conf` di terminal |
| [`gateway-pi.conf`](gateway-pi.conf) | gateway Pi (Modul 12) | di Pi: `/etc/mosquitto/conf.d/gateway-pi.conf` |
| [`node-red-flows.json`](node-red-flows.json) | gateway Pi (Modul 13) | semua flow Node-RED; dipulihkan lewat **Import** di editor (langkah 11) |

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

## Node-RED dan dashboard (Modul 13)

Node-RED berjalan di gateway yang sama sebagai layanan systemd `nodered` ([Modul 13](https://github.com/antonprafanto/Full-Stack-IoT-Developer/blob/main/fase-2-konektivitas/modul-13-node-red-dashboard/README.md)). Semua flow-nya, yaitu dashboard v0 dan otomasi kipas, tersimpan di [`node-red-flows.json`](node-red-flows.json). Kata sandi editor dan *passphrase* tidak pernah ikut terekspor; jangan pernah mencatatnya di sini.

| Bagian | Gateway ini |
| :--- | :--- |
| Node-RED | 5.0.8, dipasang dengan skrip resmi `install-update-nodered-deb` (bersama Node.js 24), layanan `nodered`, editor `http://192.168.1.37:1880` |
| Pengguna editor | `admin` (kata sandi tidak dicatat di sini) |
| Dashboard | FlowFuse Dashboard (`@flowfuse/node-red-dashboard`) 1.33.0, `http://192.168.1.37:1880/dashboard/rumah` |
| Otomasi | kipas nyala di atas 30 °C, padam di bawah 28 °C |

Lanjutan resep, setelah langkah 7 di atas:

8. **Pasang Node-RED** di Pi, sebagai `budi` dan **tanpa** `sudo`:

   ```bash
   bash <(curl -sL https://github.com/node-red/linux-installers/releases/latest/download/install-update-nodered-deb)
   ```

   Ketik `y` untuk pertanyaan pertama (dalam 30 detik) dan `n` untuk *Pi-specific nodes*. Di `node-red admin init`, jawab persis seperti tabel Kemenangan Cepat Modul 13: `Share Anonymouse Usage Information` **No, do not send my usage data**; `Do you want to setup user security?` **Yes**, dengan **Username** `admin` dan kata sandi editor baru; `Do you want to enable the Projects feature?` **No**; *passphrase* diisi (catat di tempat aman, jangan di sini); `Allow Function nodes to load external modules?` **No**; lalu tekan **Enter** untuk pertanyaan lainnya. Jangan asal menekan **Enter** di semua pertanyaan: pilihan bawaan untuk data penggunaan dan modul tambahan adalah `Yes`, dan *passphrase* yang dikosongkan membuat kredensial tersimpan tanpa enkripsi.
9. **Nyalakan layanannya**: `sudo systemctl enable --now nodered.service`.
10. **Pasang Dashboard 2**: di laptop, buka `http://192.168.1.37:1880` dan masuk. Menu utama → **Manage palette** → tab **Install** → cari `@flowfuse/node-red-dashboard` → klik **install** pada paket yang namanya **persis** itu (bukan `@flowfuse/node-red-dashboard-2-…`) → klik **Install** di jendela konfirmasi.
11. **Pulihkan flow**: menu utama → **Import** → **select a file to import** → pilih `edge/node-red-flows.json` dari folder `rumah-pintar-mini` di laptop → **Import**, lalu **Deploy**.
12. **Uji**: `systemctl status nodered` menulis `enabled` dan `active (running)`; HP membuka dashboard; sakelar **Kipas** menggerakkan relay dan bergeser setelah `ack` tiba.

Setiap kali flow berubah, ekspor lagi dari editor (menu utama → **Export** → **all flows** → **formatted** → **Download**), timpa `edge/node-red-flows.json`, lalu lakukan *commit*.
