# Modul 12 — Raspberry Pi & Linux Dasar: Gateway yang Selalu Hidup

🌐 **Bahasa Indonesia** · [English](../../en/phase-2-connectivity/module-12-raspberry-pi-and-linux/README.md)

*Fase 2 · Minggu 12 · Perangkat keras (*hardware*): **Kit B** — Raspberry Pi 5 atau Pi 4, kartu microSD *high-endurance*, adaptor resmi, kabel LAN (lihat 🧰), atau **jalur laptop** tanpa Pi · Prasyarat: **Modul 11** (broker dan Node 1 v1.2) dan **Modul 4** (terminal) · Waktu: 8–10 jam, dicicil dalam seminggu*

[⬅️ Modul 11](../modul-11-mqtt-dan-kontrak-data/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · [Modul 13 ➡️](../modul-13-node-red-dashboard/README.md)

---

Di Modul 11, Node 1 belajar berbicara lewat **kantor pos MQTT**, dan kantor posnya kita buka di laptop. Hasilnya memuaskan: bacaan mengalir setiap 10 detik, statusnya berganti sendiri, dan perintah dijawab dalam sekejap. Namun, ada satu kelemahan besar: **kantor pos itu hanya buka selama laptopmu menyala dan terminalnya terbuka.** Minggu ini kita memindahkannya ke komputer kecil yang menyala 24 jam di samping router: **Raspberry Pi**.

| Yang terjadi sekarang | Penyebabnya | Obatnya minggu ini |
| :--- | :--- | :--- |
| Laptop ditutup, dibawa pergi, atau menyala ulang karena pembaruan: Node 1 kehilangan broker, dan perintah dari HP tidak sampai. | Broker berjalan di terminal laptop. | Broker pindah ke **gateway** Raspberry Pi yang menyala 24 jam (Konsep 1–3, Kemenangan Cepat, Praktik 3) |
| Kamu belum pernah memakai komputer tanpa layar. | Pi bekerja *headless*, dan semua pengaturannya lewat ketikan. | **SSH** dan sekitar 20 perintah Linux dasar (Konsep 4–5, Praktik 1) |
| Alamat broker bisa berganti setelah router dinyalakan ulang. | Router meminjamkan alamat lewat DHCP. | **Alamat tetap** untuk Pi (Konsep 6, Praktik 2) |
| Broker harus dijalankan dengan tangan setiap kali, dan catatannya hilang bersama jendela terminal. | Broker belum menjadi layanan. | **Layanan systemd** yang menyala dan bangkit sendiri, dengan catatan yang bisa dibaca kapan saja (Konsep 7, Praktik 3–5) |
| Gateway yang menyala 24 jam bisa rusak pelan-pelan. | Kartu microSD aus, listrik padam, pembaruan ditunda. | Kartu *high-endurance*, cara mematikan yang benar, cadangan, dan pemeriksaan bulanan (Konsep 8, Praktik 6) |

Di akhir minggu, Rumah Pintar Mini punya **gateway permanen**: Raspberry Pi bernama `gateway` dengan alamat tetap, broker Mosquitto yang menyala sendiri setiap kali Pi menyala, dan resep di repositorimu untuk membangunnya ulang. **Node 1 v1.2.1** menyambung ke sana, dan buktinya sederhana: laptop dimatikan, Node 1 tetap tersambung. Seperti di Modul 11, semuanya masih di dalam jaringan rumah dan broker masih tanpa kata sandi; menguncinya adalah urusan Modul 21.

![Peta jalan Modul 12. Atas, enam fase kurikulum dari Fase 0 Fondasi (Modul 1–4) sampai Fase 5 Operasi dan skala (Modul 26–32); Fase 2 Konektivitas, Modul 10 sampai 15, disorot. Modul 1 sampai 11 bertanda selesai, dan Modul 12 ditandai KAMU DI SINI dengan catatan: kantor pos MQTT pindah ke Raspberry Pi yang menyala 24 jam. Bawah, kotak Modul 12 minggu ini, 8 sampai 10 jam dicicil, Kit B: Raspberry Pi, kartu microSD, kabel LAN; ⭐ berarti wajib untuk lulus. Kiri: KC, Kemenangan Cepat, Pi pertamamu menjawab; P1 tur Linux lewat SSH; P2 alamat tetap untuk Pi ⭐; P3 Mosquitto sebagai layanan di Pi ⭐; P4 uji layanan bangkit sendiri ⭐. Kanan: P5 membaca catatan (log) ⭐; P6 merawat gateway; P7 jalur laptop, broker sebagai layanan; tambahan: gateway permanen, Node 1 v1.2.1 ⭐. Catatan di bawah: tanpa Raspberry Pi, Praktik 7 menjadikan Mosquitto layanan di laptopmu; bagian Tambahan tetap bisa dikerjakan, kecuali yang butuh Pi.](aset/peta-jalan-modul-12.png)

> [!NOTE]
> **Cara memakai modul ini.**
>
> - **Pi dikendalikan dari laptop.** Kamu tidak perlu monitor, papan ketik, atau mouse untuk Pi. Semua praktik dikerjakan dari terminal di laptop yang tersambung ke Pi lewat SSH (Konsep 4).
> - **Setiap kotak perintah disertai keterangan tempatnya:** **di Pi** (terminal SSH, *prompt* `budi@gateway:~ $`) atau **di laptop**. Nama pengguna `budi`, nama host `gateway`, dan alamat `192.168.1.37` hanya contoh; pakai milikmu sendiri.
> - Kotak yang didahului kata **Hasilnya** hanya untuk dicocokkan, bukan diketik. Semua kotak **Hasilnya** dari Pi minggu ini bertanda **contoh**: isinya disusun dari dokumentasi dan kode sumber setiap program (lihat 📚), sedangkan nama, angka, tanggal, dan nomor versi di Pi-mu bisa berbeda.
> - **Belum punya Raspberry Pi?** Ikuti **jalur laptop**: baca Konsep 1–8, kerjakan Praktik 7 (Mosquitto sebagai layanan di laptop), lalu bagian ➕ dengan alamat laptopmu. Kriteria lulusnya ada di ✅. Wokwi tidak bisa menyimulasikan Raspberry Pi, dan Node 1 di Wokwi tetap memakai broker publik seperti di Modul 11.
> - Pengguna macOS: ganti **Ctrl** dengan **Cmd** untuk menyimpan, menyalin, dan menempel di aplikasi berjendela seperti VS Code dan Arduino IDE. Di Terminal Mac, termasuk saat tersambung ke Pi lewat SSH, tombol perintah seperti **Ctrl + C** dan tombol nano (**Ctrl + O**, **Ctrl + X**) tetap **Ctrl**; hanya menyalin dan menempel teks yang memakai **Cmd + C** dan **Cmd + V**.

> [!WARNING]
> **Aturan aman minggu ini.**
>
> 1. **Kartu microSD akan dihapus total** saat Raspberry Pi Imager menulisnya. Pastikan yang dipilih di Imager benar-benar kartu microSD-mu, bukan *flash disk* (diska lepas) atau *hard disk* (cakram keras) berisi data penting. Cabut semua *flash disk* lain sebelum mulai.
> 2. **Broker di Pi terbuka untuk jaringan rumah, tanpa kata sandi**, sama seperti di laptop pada Modul 11. **Jangan pernah** membuat *port forwarding* ke Pi di router. Siapa pun yang tersambung ke WiFi rumahmu bisa mengirim perintah ke relay; gembok dipasang di Modul 21.
> 3. **Kata sandi Pi harus kuat** dan tidak dipakai di tempat lain: siapa pun di jaringan rumah yang tahu kata sandinya bisa masuk ke Pi lewat SSH. Jangan menuliskannya di repositori atau catatan modul.
> 4. **Matikan Pi dengan perintah `sudo poweroff`**, tunggu tanda aman dari lampunya (Pi 4: lampu hijau padam; Pi 5: lampu status menjadi merah; Konsep 8), baru cabut adaptornya. Mencabut listrik saat Pi menulis ke kartu bisa merusak kartunya.
> 5. **Pakai adaptor resmi** (Pi 5: USB-C 27 W; Pi 4: USB-C 15 W). Adaptor HP yang kurang kuat membuat Pi menyala ulang sendiri atau kartunya rusak.
> 6. **`sudo` adalah wewenang penuh.** Baca ulang setiap perintah ber-`sudo` sebelum menekan **Enter**, terutama yang menghapus.

Ritme modul ini sama dengan Modul 1–11. Bagian lipat di 🚨 (klik judulnya) cukup dibuka saat kamu membutuhkannya; bagian lipat di 🔬 boleh dilewati. Setiap praktik diawali kotak **🖥️** yang menyebut alat yang dipakai.

## Daftar isi

1. [🎯 Setelah modul ini kamu bisa…](#-setelah-modul-ini-kamu-bisa)
2. [🧰 Yang perlu disiapkan](#-yang-perlu-disiapkan)
3. [🏆 Kemenangan Cepat: Pi pertamamu menjawab dari jaringan (30 menit)](#-kemenangan-cepat-pi-pertamamu-menjawab-dari-jaringan-30-menit)
4. [🧠 Konsep "Mengapa"](#-konsep-mengapa)
   - [1 Gateway & edge](#1-gateway-dan-edge-kantor-pos-yang-selalu-buka-di-rumah) · [2 Raspberry Pi](#2-raspberry-pi-komputer-utuh-seukuran-kartu-nama) · [3 Linux tanpa layar](#3-linux-dan-raspberry-pi-os-lite-komputer-tanpa-layar) · [4 SSH](#4-ssh-terminal-jarak-jauh) · [5 Folder, sudo, apt](#5-peta-rumah-linux-folder-pengguna-dan-sudo) · [6 Alamat tetap](#6-alamat-tetap-kantor-pos-tidak-boleh-pindah-rumah) · [7 Layanan & systemd](#7-layanan-dan-systemd-satpam-yang-tidak-pernah-tidur) · [8 Merawat gateway](#8-merawat-gateway-kartu-microsd-listrik-dan-cadangan)
5. [🔧 Praktik langkah demi langkah](#-praktik-langkah-demi-langkah)
   - [1 Tur Linux](#praktik-1--tur-linux-lewat-ssh-40-menit) · [2 Alamat tetap](#praktik-2--alamat-tetap-untuk-pi-30-menit) · [3 Mosquitto di Pi](#praktik-3--mosquitto-sebagai-layanan-di-pi-30-menit) · [4 Bangkit sendiri](#praktik-4--uji-layanan-bangkit-sendiri-20-menit) · [5 Membaca catatan](#praktik-5--membaca-catatan-20-menit) · [6 Merawat gateway](#praktik-6--merawat-gateway-30-menit) · [7 Jalur laptop](#praktik-7--jalur-laptop-mosquitto-sebagai-layanan-30-menit)
6. [🚨 Kalau Tidak Jalan?](#-kalau-tidak-jalan)
7. [🔬 Bedah Teknis (opsional)](#-bedah-teknis-opsional)
8. [🧩 Tantangan mandiri](#-tantangan-mandiri)
9. [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini)
10. [📖 Glosarium](#-glosarium) · [📝 Kuis](#-kuis-5-soal) · [✅ Checklist kelulusan](#-checklist-kelulusan-modul-12)
11. [📚 Sumber & atribusi gambar](#-sumber--atribusi-gambar)

## 🎯 Setelah modul ini kamu bisa…

- **Menjelaskan peran gateway dan *edge computing*** (komputasi di tepi) di rumah pintar, dan kapan sebuah tugas lebih cocok di ESP32 atau di Raspberry Pi.
- **Menyiapkan Raspberry Pi tanpa monitor** (*headless*) dengan Raspberry Pi Imager, lalu masuk ke Pi dari laptop lewat **SSH**.
- **Memakai sekitar dua puluh perintah Linux dasar** dengan nyaman: berpindah folder, menyunting berkas dengan nano, memasang program dengan `apt`, dan memakai `sudo` dengan hati-hati.
- **Memberi Pi alamat tetap** lewat pemesanan di router atau dengan `nmcli`.
- **Menjalankan Mosquitto sebagai layanan systemd** yang menyala sendiri saat Pi menyala dan bangkit sendiri setelah *crash* (mati mendadak), lalu **membaca catatannya** dengan `journalctl` dan `tail`.
- **Merawat gateway**: memeriksa tegangan, suhu, dan ruang kartu; mencadangkan pengaturan dengan `scp`; serta mematikan Pi dengan benar.
- **Memindahkan Node 1 v1.2.1 ke broker di Pi** dan membuktikan bahwa Rumah Pintar Mini tetap hidup tanpa laptop.

---

## 🧰 Yang perlu disiapkan

| Apa | Keterangan |
| :--- | :--- |
| **Raspberry Pi 5** (2 GB atau 4 GB) atau **Pi 4 Model B** (2 GB ke atas) | Kit B di [Silabus §5.3](../../SILABUS.md#53-kit-b--raspberry-pi-sebagai-gateway-dibutuhkan-mulai-modul-12). Pi 5 2 GB sudah lebih dari cukup untuk broker, dan nanti juga Node-RED (Modul 13). Pi Zero 2 W juga bisa, dengan catatan di 🔬. Harga resmi naik beberapa kali sepanjang 2025–2026 karena harga memori dunia naik; per 1 Oktober 2026, Pi 5 2 GB dijual US$77,50 dan Pi 4 2 GB US$67,50 di toko resmi, dan harga di toko lokal biasanya lebih tinggi. |
| **Kartu microSD 32 GB *high-endurance*** (tahan lama; lebih baik lagi kalau juga A1 atau A2) | Dihapus total saat ditulis. Alasan memilih kartu *high-endurance* ada di Konsep 8. |
| **Pembaca kartu** (*card reader*) | Kalau laptopmu tidak punya slot kartu. Kebanyakan kartu microSD dijual dengan adaptor SD; pembaca USB lebih praktis. |
| **Adaptor resmi** | Pi 5: adaptor USB-C 27 W (5,1 V 5 A). Pi 4: adaptor USB-C 15 W (5,1 V 3 A). Pi 5 yang memakai adaptor 3 A tetap menyala, tetapi membatasi arus colokan USB-nya. |
| ***Casing* (wadah) + pendingin** | Pi 5: pendingin aktif resmi (Active Cooler) atau *casing* berkipas karena Pi 5 bekerja paling baik dengan pendingin aktif. Pi 4: *heatsink* (sirip pendingin) sudah cukup. |
| **Kabel LAN** 1–2 m | Dari Pi ke salah satu colokan LAN di router. |
| **Laptop** | Tersambung ke jaringan rumah yang **sama** dengan Pi dan Node 1, dengan **MQTTX**, **VS Code**, Node.js 24, dan folder `rumah-pintar-mini` dari Modul 11. Windows 10 atau Windows 11 yang rutin diperbarui, atau macOS 13 ke atas. |
| **Meja kerja Node 1** | Dengan Node 1 v1.2 dari Modul 11; dipakai lagi di bagian ➕. |
| **Internet** | Untuk mengunduh Raspberry Pi Imager (sekitar 22 MB untuk Windows) dan Raspberry Pi OS Lite (sekitar 550 MB), serta pembaruannya. |

**Versi yang dipakai di modul ini:**

| Alat | Versi | Catatan |
| :--- | :--- | :--- |
| Raspberry Pi Imager | **2.0.12** (8 Oktober 2026) | Baru (Kemenangan Cepat), dipasang di laptop. Belum ada terjemahan bahasa Indonesia, jadi tampilannya berbahasa Inggris. |
| Raspberry Pi OS Lite (64-bit) | rilis **2026-10-06**, berbasis Debian 13 "Trixie" | Baru, ditulis ke kartu microSD. *Kernel* (inti) Linux 6.18. |
| Mosquitto (di Pi) | **2.0.21** | Dari paket Debian Trixie (Praktik 3). Di laptop tetap 2.1.2 dari Modul 11; beberapa baris catatannya sedikit berbeda (Praktik 5). |
| OpenSSH (di laptop) | bawaan Windows 10/11 dan macOS | Tidak perlu dipasang. Cara memeriksanya ada di Kemenangan Cepat langkah 4. |
| MQTTX | **1.13.1** | Sejak Modul 11. |
| Node.js | **24.21.0** | Sejak Modul 4; untuk alat pemeriksa kontrak. |
| Paket papan **esp32** dan library Node 1 | sama dengan Modul 11 | Node 1 v1.2.1 hanya mengubah empat baris di tiga berkas (➕ A). |

---

## 🏆 Kemenangan Cepat: Pi pertamamu menjawab dari jaringan (30 menit)

Dalam 30 menit (ditambah waktu mengunduh), kamu menyiapkan kartu microSD, menyalakan Pi tanpa monitor, lalu "mengetuk pintunya" dari laptop. Pi yang tidak punya layar itu akan menjawab dengan namanya sendiri.

> 🖥️ **Alat yang dipakai di bagian ini:** laptop dengan **browser** dan **Terminal**, kartu microSD + pembaca kartu, Raspberry Pi + adaptor resmi + kabel LAN, dan router rumah. Belum punya Pi? Lewati bagian ini dan baca Konsep 1–8, lalu kerjakan Praktik 7.

### Langkah 1 — Pasang Raspberry Pi Imager

Buka [raspberrypi.com/software](https://www.raspberrypi.com/software/) di laptop, lalu:

- **Windows:** klik **Download for Windows**, jalankan berkas `imager_2.0.12.exe`, dan ikuti penginstalnya. Windows menanyakan izin administrator (`Do you want to allow this app to make changes to your device?`): klik **Yes**. Pertanyaan yang sama muncul **setiap kali** Imager dibuka karena Imager butuh izin administrator untuk menulis kartu; itu wajar.
- **macOS:** klik **Download for macOS**, buka berkas `imager_2.0.12.dmg`, lalu seret **Raspberry Pi Imager** ke folder **Applications**.
- **Linux:** klik **Download for Linux (x86_64)**, jadikan berkasnya bisa dijalankan dengan `chmod +x imager_2.0.12_amd64.AppImage`, lalu jalankan dengan `sudo ./imager_2.0.12_amd64.AppImage`.

> 💡 Ada juga Imager di **winget** (Windows) dan toko aplikasi lain, tetapi versinya sering tertinggal (saat modul ini ditulis, winget masih 2.0.8). Pakai unduhan resmi supaya tampilanmu sama dengan modul ini.

### Langkah 2 — Tulis kartu microSD

Masukkan kartu microSD ke pembaca kartu, lalu colokkan ke laptop. **Cabut dulu semua *flash disk* dan *hard disk* luar lainnya** (aturan aman nomor 1).

Buka **Raspberry Pi Imager**. Imager memandumu lewat langkah-langkah yang tercantum di kolom kirinya (**Setup steps**): **Device**, **OS**, **Storage**, **Customisation**, **Writing**, dan **Done**. Semua tombolnya ditulis dengan huruf kapital: **NEXT** di kanan bawah membawamu ke langkah berikutnya, dan **BACK** kembali satu langkah. Tangkapan layarnya ada di tiga kolase di sela langkah-langkah di bawah; klik gambarnya (di HP: ketuk) untuk memperbesar.

1. **Device:** klik **Raspberry Pi 5** (atau **Raspberry Pi 4**, atau **Raspberry Pi Zero 2 W** di bagian bawah daftar), lalu **NEXT**.
2. **OS:** jangan pilih yang paling atas. Gulir ke bawah, klik **Raspberry Pi OS (other)**, lalu pilih **Raspberry Pi OS Lite (64-bit)**, yang keterangannya `A port of Debian Trixie with no desktop environment …` dan `Released: 2026-10-06` (atau tanggal yang lebih baru). Lalu klik **NEXT**.
3. **Storage:** klik kartu microSD-mu. Cocokkan ukurannya dengan label kartumu. Imager menghitung 1 GB = 1.000.000.000 byte, sama seperti pabrik kartu, jadi kartu 32 GB tampil sekitar 31–32 GB, misalnya `31.9 GB` (atau `31,9 GB` kalau laptopmu memakai format angka Indonesia). Gambar di bawah dibuat dengan Imager versi lama yang masih menulis `29.7 GB`. Biarkan **Exclude system drives** tercentang supaya *hard disk* laptop tidak pernah muncul di daftar. Lalu klik **NEXT**.

![Kolase empat tangkapan layar Raspberry Pi Imager, langkah 1 sampai 4. Satu, layar Select your Raspberry Pi device dengan daftar Raspberry Pi 5, Raspberry Pi 4, Raspberry Pi 3, dan seterusnya; keterangan: Device, pilih papanmu, Raspberry Pi 5 (atau Pi 4 / Pi Zero 2 W), lalu NEXT. Dua, layar Choose operating system dengan Raspberry Pi OS (64-bit) tersorot; keterangan: gulir ke Raspberry Pi OS (other), lalu pilih Raspberry Pi OS Lite (64-bit), bukan yang tersorot di sini. Tiga, layar Select your storage device dengan satu kartu berukuran 29.7 GB dan centang Exclude system drives; keterangan: pilih kartu microSD-mu; kartu 32 GB tampil sekitar 31 sampai 32 GB (gambar ini dari Imager versi lama). Empat, layar Customisation: Choose hostname dengan kotak Enter your hostname, serta tombol SKIP CUSTOMISATION di samping BACK; keterangan: ketik gateway, huruf kecil, tanpa spasi; isian di gambar hanya contoh lain. Di setiap layar ada tombol NEXT di kanan bawah.](aset/imager-langkah-1-4.png)

*Tangkapan layar Raspberry Pi Imager dari [dokumentasi resmi Raspberry Pi](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); nomor langkah dan keterangan oleh penulis. Isian contoh di gambar (nama, kota, WiFi) berbeda dengan isianmu.*

4. **Customisation: Choose hostname:** ketik `gateway` di kotak **Enter your hostname**, lalu klik **NEXT**. Nama ini yang membuat Pi bisa dipanggil `gateway.local`. Mulai layar ini, di samping **BACK** ada tombol **SKIP CUSTOMISATION**: jangan diklik (alasannya di peringatan setelah langkah 9).
5. **Customisation: Localisation:** di **Capital city**, pilih **Jakarta (Indonesia)**. **Time zone** otomatis menjadi `Asia/Jakarta` dan **Keyboard layout** menjadi `id`; keduanya boleh dibiarkan. Pilihan ini juga menyetel aturan frekuensi WiFi untuk Indonesia. Tombol **NEXT** baru bisa diklik setelah kota dipilih. (Kalau Windows-mu berbahasa Inggris Amerika, kotak ini bernama **National capital**.) Pengguna WITA atau WIT boleh mengubah **Time zone** menjadi `Asia/Makassar` atau `Asia/Jayapura`.
6. **Customisation: Choose username:** isi **Username** `budi` (atau namamu sendiri, huruf kecil semua), lalu **Password** dan **Confirm password** dengan kata sandi yang kuat, misalnya tiga kata acak yang hanya kamu tahu. Catat di pengelola kata sandi atau buku catatan pribadi, **bukan** di repositori. Lalu klik **NEXT**.

   > ⚠️ Imager tetap membolehkanmu mengeklik **NEXT** walaupun kotak pengguna dibiarkan kosong. Untuk Pi tanpa layar, itu berarti Pi tidak bisa dimasuki sama sekali. Pastikan ketiga kotak terisi.
7. **Customisation: Choose Wi-Fi:** biarkan **SECURE NETWORK** terpilih. Imager biasanya sudah mengisi **SSID** dan kata sandi dengan WiFi yang sedang dipakai laptopmu; pastikan itu WiFi rumahmu sendiri, bukan *hotspot* HP. Kalau belum terisi, ketik namanya persis (termasuk huruf besar-kecil) dan isi kedua kotak kata sandinya. Centang **Hidden SSID** hanya kalau WiFi-mu memang disembunyikan. Di macOS, Imager mungkin bertanya `Would you like to prefill the Wi-Fi password from the system keychain?`; jawab **Yes** dan masukkan kata sandi Mac-mu, atau **No** lalu ketik sendiri. Setelah itu, klik **NEXT**. WiFi ini adalah **jalan cadangan**; jalan utama Pi adalah kabel LAN (Konsep 6).
8. **Customisation: SSH authentication:** nyalakan sakelar **Enable SSH** (bawaannya **mati**), lalu pastikan **Use password authentication** terpilih. Setelah itu, klik **NEXT**. Lupa langkah ini? Pi tetap menyala, tetapi tidak bisa dimasuki dari laptop (`Connection refused`, 🚨).
9. **Customisation: Raspberry Pi Connect:** biarkan **Enable Raspberry Pi Connect** mati, lalu klik **NEXT**. Raspberry Pi Connect adalah layanan resmi untuk membuka Pi dari mana saja lewat akun daring; proyek kita tidak memakainya.

![Kolase empat tangkapan layar Raspberry Pi Imager, langkah 5 sampai 8. Lima, layar Customisation: Localisation dengan kotak Capital city, Time zone, dan Keyboard layout berisi contoh London (United Kingdom), Europe/London, dan gb; keterangan: pilih Jakarta (Indonesia), maka Time zone Asia/Jakarta dan keyboard id terisi sendiri. Enam, layar Customisation: Choose username dengan kotak Username, Password, dan Confirm password; keterangan: budi ditambah kata sandi kuat, nama pengguna huruf kecil, catat kata sandinya di tempat aman. Tujuh, layar Customisation: Choose Wi-Fi dengan tombol SECURE NETWORK dan OPEN NETWORK, kotak SSID, Password, dan Confirm password, serta centang Hidden SSID; keterangan: WiFi rumahmu sebagai jalan cadangan, nama dan kata sandi persis, termasuk huruf besar-kecil. Delapan, layar Customisation: SSH authentication dengan sakelar Enable SSH yang masih mati dan dua pilihan, Use password authentication atau Use public key authentication; keterangan: nyalakan Enable SSH, pilih Use password authentication, lalu NEXT. Di setiap layar ada tombol SKIP CUSTOMISATION, BACK, dan NEXT.](aset/imager-langkah-5-8.png)

*Tangkapan layar Raspberry Pi Imager dari [dokumentasi resmi Raspberry Pi](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); nomor langkah dan keterangan oleh penulis. Isian contoh di gambar (nama, kota, WiFi) berbeda dengan isianmu.*

> ⚠️ **Jangan klik SKIP CUSTOMISATION.** Tombol itu membuang semua isian **Customisation** dan langsung melompat ke penulisan: Pi menyala tanpa pengguna, tanpa SSH, dan tanpa WiFi sehingga tidak bisa dihubungi dari laptop.

10. **Write image:** periksa ringkasannya (**Summary**). **Device** harus papanmu, **Operating system** harus `Raspberry Pi OS Lite (64-bit)`, dan **Storage** harus kartumu. Di **Customisations to apply** harus ada `SSH enabled`. Gambar contoh di bawah tidak memuat baris itu karena pemilik contohnya belum menyalakan SSH. Klik **WRITE**.
11. Imager memperingatkan `You are about to ERASE all data on: …` dan `This action is PERMANENT and CANNOT be undone.` Setelah hitungan mundur dua detik, tombol konfirmasinya muncul. Pastikan nama setelah `ERASE all data on:` adalah kartu microSD-mu, lalu klik **I UNDERSTAND, ERASE AND WRITE**. Di macOS, Imager meminta kata sandi Mac-mu (`Raspberry Pi Imager needs to access the disk to write the image.`).

![Kolase dua tangkapan layar Raspberry Pi Imager, langkah 10 dan 11. Sepuluh, layar Write image dengan ringkasan Summary: Device Raspberry Pi 5, Operating system Raspberry Pi OS (64-bit) pada gambar contoh, Storage Apple SDXC Reader Media, dan daftar Customisations to apply; keterangan: periksa papan, OS Lite, kartu, dan SSH enabled, lalu klik WRITE; gambar contoh ini belum memuat SSH enabled, sedangkan di layarmu harus ada. Sebelas, jendela peringatan dengan judul merah You are about to ERASE all data on: Apple SDXC Reader Media, lalu kalimat This action is PERMANENT and CANNOT be undone, dengan tombol CANCEL dan I UNDERSTAND, ERASE AND WRITE; keterangan: yakin kartunya benar? Klik I UNDERSTAND, ERASE AND WRITE.](aset/imager-langkah-10-11.png)

*Tangkapan layar Raspberry Pi Imager dari [dokumentasi resmi Raspberry Pi](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); nomor langkah dan keterangan oleh penulis. Isian contoh di gambar (nama, kota, WiFi) berbeda dengan isianmu.*

12. Imager mengunduh Raspberry Pi OS Lite (sekitar 550 MB), menulisnya (`Writing... 37%`), lalu memeriksa hasilnya (`Verifying... 52%`). Waktunya bergantung pada kecepatan internet dan kartu, biasanya 5–15 menit. **Jangan mencabut kartu** selama proses ini, dan jangan melewati pemeriksaan (**SKIP VERIFICATION**): kartu yang tidak lolos pemeriksaan tidak layak untuk gateway 24 jam, dan tanpa pemeriksaan kamu tidak akan tahu.
13. Layar berubah menjadi `Write complete!` dengan pesan `The storage device was ejected automatically. You can now remove it safely.` Cabut pembaca kartunya, lalu klik **FINISH**. Kalau sesudahnya Windows menawarkan untuk memformat kartu, klik **Cancel** (🚨).

### Langkah 3 — Pasang kartu, kabel, lalu nyalakan

![Foto Raspberry Pi 5 dilihat dari atas, dengan label: yang dipakai minggu ini berwarna hijau toska, yang tidak dipakai abu-abu. Kiri, slot kartu microSD di bawah papan, sisi kiri (dipakai); tombol daya, khusus Pi 5 (dipakai); dan lampu status bertulisan STAT (dipakai). Atas, 40 kaki GPIO, tidak dipakai proyek kita, dan colokan kipas bertulisan FAN untuk pendingin aktif (dipakai). Kanan, dua colokan USB 2.0 dan dua USB 3.0 biru, tidak dipakai, serta colokan Ethernet (LAN) untuk kabel LAN ke router (dipakai). Bawah, USB-C untuk listrik dari adaptor resmi 27 watt (dipakai) dan dua colokan micro-HDMI, tidak dipakai karena Pi bekerja tanpa monitor.](aset/kenali-raspberry-pi-5.jpg)

*Foto: [SimonWaldherr](https://commons.wikimedia.org/wiki/File:Raspberry_Pi_5.jpg), Wikimedia Commons, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); dipotong, label oleh penulis.*

1. Masukkan kartu microSD ke slot di **bawah** papan Pi, di sisi kiri foto di atas, dengan sisi bertulisan menghadap ke bawah (menjauhi papan). Dorong pelan sampai masuk penuh.
2. Pasang *casing* dan pendinginnya sesuai petunjuk pabriknya.
3. Colokkan **kabel LAN** dari colokan Ethernet Pi ke salah satu colokan LAN di router.
4. **Terakhir**, colokkan adaptor resmi ke colokan **USB-C** Pi, lalu colokkan adaptornya ke stopkontak (kalau stopkontaknya bersakelar, nyalakan sakelarnya). Pi langsung menyala tanpa perlu menekan tombol apa pun. Di Pi 4, lampu merah menyala, lalu lampu hijau di sebelahnya berkedip-kedip saat Pi membaca kartu. Di Pi 5, lampu status bertulisan STAT di samping tombol daya (lihat foto) berkedip hijau.
5. Tunggu **2–5 menit**. Pada penyalaan pertama, Pi memperbesar bagian kartu untuk sistem operasi, membuat kunci SSH-nya sendiri, dan menerapkan pengaturan dari Imager. Karena itu, prosesnya lebih lama daripada biasanya. **Jangan mencabut listrik** selama itu. Dokumentasi resmi menyarankan memeriksa lampunya kalau Pi belum juga siap setelah 5 menit (🚨).

### Langkah 4 — Ketuk pintunya: `ping` dan `ssh`

1. **Di laptop**, buka **Terminal**. Windows 11: klik kanan tombol **Start** → **Terminal**. Windows 10: klik kanan tombol **Start** → **Windows PowerShell**. macOS: **Spotlight** (**Cmd + Spasi**) → ketik `Terminal` → **Enter**.
2. Pastikan laptopmu punya SSH: ketik `ssh -V`, lalu tekan **Enter**. Windows 11 menjawab seperti `OpenSSH_for_Windows_9.5p2, LibreSSL 3.8.2`, Windows 10 menjawab serupa dengan nomor versi yang lebih kecil, dan macOS menjawab `OpenSSH_…`. Muncul `ssh : The term 'ssh' is not recognized…`? Buka "SSH menolak …" di 🚨, bagian Windows tanpa OpenSSH.
3. Tanyakan apakah Pi sudah terdengar di jaringan. Di Windows, tambahkan `-4` supaya jawabannya memakai alamat IPv4 yang biasa:

   ```bash
   ping -4 gateway.local
   ```

   Di macOS dan Linux, cukup `ping gateway.local`, lalu hentikan dengan **Ctrl + C**. **Hasilnya** (contoh, Windows):

   ```text
   Pinging gateway.local [192.168.1.37] with 32 bytes of data:
   Reply from 192.168.1.37: bytes=32 time=2ms TTL=64
   Reply from 192.168.1.37: bytes=32 time=1ms TTL=64
   Reply from 192.168.1.37: bytes=32 time=1ms TTL=64
   Reply from 192.168.1.37: bytes=32 time=1ms TTL=64
   ```

   Angka di dalam kurung siku adalah alamat Pi saat ini; catat. Di macOS dan Linux, alamat itu ada di dalam kurung biasa di baris pertama, misalnya `PING gateway.local (192.168.1.37): 56 data bytes`. Tidak ada jawaban? Tunggu satu menit lagi, lalu buka "`ping gateway.local` tidak menemukan Pi" di 🚨.
4. Masuk ke Pi:

   ```bash
   ssh budi@gateway.local
   ```

   Ganti `budi` dengan nama pengguna yang kamu isi di Imager. Karena ini sapaan pertama, SSH menunjukkan sidik jari Pi dan bertanya (Konsep 4). **Hasilnya** (contoh):

   ```text
   The authenticity of host 'gateway.local (192.168.1.37)' can't be established.
   ED25519 key fingerprint is SHA256:Xq3m0LhR2vY9cTzN7bWk5JpE1sGfUo8aDiHy4KlVnQc.
   This key is not known by any other names.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```

   Ketik `yes`, lalu tekan **Enter**. SSH mencatatnya (`Warning: Permanently added 'gateway.local' (ED25519) to the list of known hosts.`), lalu meminta `budi@gateway.local's password:`. **Saat mengetik kata sandi, tidak ada yang tampil di layar**, bahkan titik pun tidak. Itu wajar: ketik saja dengan teliti, lalu tekan **Enter**. (SSH lama di Windows 10 bisa menampilkan `ECDSA key fingerprint …` tanpa baris `This key is not known…`; jawabannya tetap `yes`.)
5. Pi menyapa dengan salam pembuka, lalu *prompt* berubah. **Hasilnya** (contoh; tanggal dan nomor versi di Pi-mu bisa berbeda):

   ```text
   Linux gateway 6.18.50+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.18.50-1+rpt1 (2026-09-30) aarch64

   The programs included with the Debian GNU/Linux system are free software;
   the exact distribution terms for each program are described in the
   individual files in /usr/share/doc/*/copyright.

   Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
   permitted by applicable law.
   budi@gateway:~ $
   ```

   Di Pi 4 dan Pi Zero 2 W, nama *kernel* di baris pertama berakhiran `+rpt-rpi-v8`, bukan `+rpt-rpi-2712`. Tulisan berhuruf kapital `ABSOLUTELY NO WARRANTY` hanyalah pemberitahuan lisensi standar Debian yang muncul setiap kali kamu masuk, bukan tanda ada yang rusak.
6. **Di Pi**, tanyakan nama dan lama menyalanya:

   ```bash
   hostname
   ```

   ```bash
   uptime -p
   ```

   **Hasilnya** (contoh): `gateway`, lalu `up 4 minutes`.

Selamat — komputer tanpa layar di samping routermu baru saja menjawab dari jaringan. Perhatikan tiga hal:

- **Kamu tidak pernah menyentuh Pi selain mencolokkan kabel.** Nama, pengguna, kata sandi, dan WiFi dititipkan Imager di kartu (Konsep 3).
- ***Prompt* berubah** dari milik laptop menjadi `budi@gateway:~ $`. Semua yang kamu ketik sekarang berjalan di Pi (Konsep 4).
- **Pi menyapa dengan nama**, `gateway.local`, tanpa kamu perlu tahu alamat IP-nya. Cara ini praktis untuk laptop, tetapi Node 1 butuh alamat yang tetap (Konsep 6).

Ketik `exit` untuk keluar: Pi menjawab `logout`, lalu laptop menulis `Connection to gateway.local closed.` Kamu juga boleh membiarkan terminal ini terbuka untuk Praktik 1.

---

## 🧠 Konsep "Mengapa"

Delapan konsep, satu per bagian — **tidak perlu dibaca sekaligus**. Konsep dan praktik dikerjakan berselang-seling dengan urutan ini:

1. Konsep 1–5 (apa yang barusan terjadi di Kemenangan Cepat) → Praktik 1 (tur Linux lewat SSH)
2. Konsep 6 → Praktik 2 (alamat tetap untuk Pi)
3. Konsep 7 → Praktik 3–5 (Mosquitto sebagai layanan di Pi, uji bangkit sendiri, dan membaca catatan)
4. Konsep 8 → Praktik 6 (merawat gateway)
5. Praktik 7 hanya untuk jalur laptop (tanpa Pi): baca Konsep 1–8 berturut-turut, lewati kotak ➡️ yang menuju Praktik 1–6, lalu kerjakan Praktik 7
6. 🧩 Tantangan → ➕ Rumah Pintar Mini (gateway permanen dan Node 1 v1.2.1) → 📝 Kuis → ✅ Checklist

Di setiap titik pindah ada kotak ➡️ (maju ke praktik) dan ⬆️ (kembali ke konsep) yang tautannya tinggal diklik.

> 🖥️ **Perlu mencoba perintah di bagian Konsep?** Tidak wajib. Perintah di bagian Konsep hanya contoh; semuanya akan kamu ketik sendiri di Praktik, di jendela SSH yang tersambung ke Pi.

### 1. Gateway dan *edge*: kantor pos yang selalu buka di rumah

Di Modul 11, kantor pos (broker) kita buka **di laptop**. Kantor pos itu hanya buka selama kamu duduk di depannya: terminal VS Code harus tetap terbuka, dan laptop tidak boleh tidur. Coba bayangkan kejadian sehari-hari:

- Laptop ditutup, lalu tertidur. Broker ikut tertidur. Node 1 mengetuk pintu setiap 5 detik dan selalu mendapati pintunya tertutup (`MQTT gagal tersambung`).
- Laptop dibawa ke kampus atau kantor. Kantor posnya ikut pergi dari rumah.
- Windows memasang pembaruan dan menyalakan ulang laptop tengah malam. Terminal broker tertutup, dan tidak ada yang membukanya lagi.

Selama kantor pos tutup, bacaan sensor yang dikirim Node 1 hilang, dan perintah dari HP tidak pernah sampai. Rumah pintar yang hanya pintar saat laptop menyala bukan rumah pintar.

Obatnya adalah **gateway** (gerbang): satu komputer kecil di rumah yang **tugasnya hanya melayani perangkat IoT**, menyala 24 jam, dan tidak pernah dibawa pergi. Di proyek kita, gateway itu **Raspberry Pi** yang menjalankan broker Mosquitto. Node 1 cukup tahu alamat Pi, sama seperti di Modul 11 ia cukup tahu alamat laptop.

(Jangan tertukar dengan gateway router di Modul 10, yaitu router "pos satpam" yang beralamat `192.168.1.1`. Router mengantar surat ke luar perumahan; gateway IoT adalah kantor pos data di dalam rumah.)

![Diagram gateway: kantor pos data yang selalu buka di rumah. Di dalam garis putus-putus rumah (jaringan 192.168.1.x): kolom PERANGKAT berisi Node 1 Rumah (sensor dan aktuator) dan Node 2 Kebun (kelak, Modul 14) yang tersambung lewat Node 1; panah MQTT dari Node 1 menuju kolom GATEWAY, yaitu Raspberry Pi bernama gateway beralamat 192.168.1.37, yang menjalankan broker Mosquitto 24 jam (Modul 12, minggu ini), kelak otomasi Node-RED (Modul 13) dan penerus ke internet (Modul 27). Di bawahnya, PEMANTAU yang boleh mati kapan saja: laptop (MQTTX, SSH) dan HP (aplikasi MQTT). Di luar rumah, server di internet (kelak, Modul 27) dengan garis putus-putus bertanda silang merah: internet putus? Di dalam rumah tetap jalan. Kotak samping: mengapa gateway? Internet putus tetap jalan, perintah dalam milidetik, data mentah tetap di rumah, listrik beberapa watt; laptop dan HP hanya pemantau, mati atau dibawa pergi pun tidak apa-apa.](aset/gateway-di-rumah.png)

**Kenapa tidak langsung saja semua perangkat mengirim ke server di internet (*cloud*)?** Banyak produk murah memang begitu. Kurikulum ini memilih gateway di rumah karena empat alasan:

| Alasan | Tanpa gateway (langsung ke internet) | Dengan gateway di rumah |
| :--- | :--- | :--- |
| **Internet putus** | Perintah dan otomasi berhenti total, padahal perangkatnya bersebelahan. | Node 1, broker, dan kelak otomasi di Pi (Modul 13) tetap jalan. Hanya kiriman ke internet yang menunggu. |
| **Kecepatan** | Perintah dari HP di ruang tamu berputar dulu ke server di kota lain. | Perintah cukup berputar di dalam rumah, dalam hitungan milidetik. |
| **Privasi** | Setiap bacaan, termasuk "ada gerakan di ruang tamu", keluar rumah. | Data mentah tetap di rumah. Kelak, yang dikirim keluar hanya yang perlu (Modul 27). |
| **Biaya** | Setiap pesan ke layanan *cloud* bisa ditagih, dan server berjalan 24 jam. | Satu Pi, listriknya beberapa watt. |

Pola ini disebut ***edge computing*** (komputasi di tepi): pekerjaan dilakukan sedekat mungkin dengan perangkatnya, di "tepi" jaringan, bukan di pusat data yang jauh. Gateway adalah komputer tepi itu. Mulai minggu ini sampai akhir kurikulum, semua perangkat Rumah Pintar Mini berbicara dengan gateway, dan baru di Modul 27 gateway itu kita sambungkan ke server di internet.

### 2. Raspberry Pi: komputer utuh seukuran kartu nama

ESP32 dan Raspberry Pi sama-sama papan kecil berwarna hijau, tetapi sifatnya sangat berbeda. **ESP32** adalah **mikrokontroler**: satu chip yang menjalankan **satu program** milikmu, langsung begitu listrik masuk. **Raspberry Pi** adalah **komputer papan tunggal** (*single-board computer*): komputer utuh, dengan prosesor, memori, dan sistem operasi, yang bisa menjalankan **banyak program sekaligus**, persis seperti laptop.

Analoginya: ESP32 adalah **petugas loket yang hanya melayani satu urusan**. Ia tidak pernah lengah, cepat bereaksi, dan hampir tidak butuh makan. Raspberry Pi adalah **kantor kecil**: ada bagian tata usaha (sistem operasi), beberapa staf yang bekerja bersamaan (program), dan ruang arsip (kartu microSD). Kantor bisa mengerjakan jauh lebih banyak hal, tetapi butuh waktu untuk buka pagi hari dan harus ditutup dengan benar.

Foto Raspberry Pi 5 lengkap dengan nama setiap colokannya ada di Kemenangan Cepat langkah 3.

| | ESP32 (Node 1) | Raspberry Pi 5 (gateway) |
| :--- | :--- | :--- |
| Jenis | mikrokontroler: satu program | komputer: sistem operasi + banyak program |
| Otak | 2 inti, 240 MHz | 4 inti Arm Cortex-A76, 2,4 GHz |
| Memori kerja (RAM) | 520 KB | 1–16 GB (Kit B: 2 GB) |
| Penyimpanan | 4 MB *flash* di papan | kartu microSD 32 GB (atau SSD) |
| Dari colok listrik sampai siap | kurang dari 1 detik | puluhan detik (penyalaan pertama 2–5 menit) |
| Listrik | kurang dari 1 W | beberapa watt; adaptor resminya 27 W untuk cadangan saat sibuk |
| Kalau listrik padam mendadak | aman: programnya tersimpan di *flash* | berkas yang sedang ditulis bisa rusak (Konsep 8) |
| Paling cocok untuk | membaca sensor dan menggerakkan aktuator, cepat dan hemat | broker, database, dashboard, layanan jaringan 24 jam |

Karena itu, keduanya **tidak saling menggantikan**. ESP32 tetap di dekat sensor dan relay, sedangkan Pi duduk di dekat router sebagai kantor pos. Pi memang punya kaki GPIO seperti ESP32, tetapi proyek kita tidak memakainya; perbandingannya ada di 🔬.

### 3. Linux dan Raspberry Pi OS Lite: komputer tanpa layar

Setiap komputer butuh **sistem operasi**: program "tata usaha kantor" yang mengatur prosesor, memori, berkas, dan jaringan, lalu membagi waktunya untuk program lain. Laptopmu memakai Windows atau macOS, dan HP memakai Android atau iOS.

Raspberry Pi memakai **Linux**, sistem operasi gratis dan terbuka yang menjalankan sebagian besar server di internet, juga router rumahmu, televisi pintar, dan inti Android. Ada banyak "rasa" Linux, yang disebut **distribusi**. Raspberry Pi memakai **Raspberry Pi OS**, yaitu distribusi **Debian** yang disesuaikan untuk Pi. Versi saat modul ini ditulis berbasis **Debian 13 "Trixie"** (Debian memberi nama setiap versinya dengan nama tokoh film *Toy Story*). Nama "Trixie" penting: tutorial di internet yang ditulis untuk versi lama, misalnya "Bullseye" (Debian 11), sering memakai cara yang sudah tidak berlaku (tabel di awal 🚨).

Kita memakai varian **Raspberry Pi OS Lite**, yaitu tanpa ***desktop*** (tampilan berjendela dengan ikon dan mouse). Semua pekerjaan dilakukan dengan mengetik perintah. Kedengarannya repot, tetapi justru inilah cara kebanyakan server dikelola, dan ada untungnya:

- **Lebih ringan.** Memori dan prosesor tidak terpakai untuk menggambar jendela yang tidak pernah dilihat siapa pun.
- **Lebih sedikit yang bisa rusak dan perlu diperbarui.** Unduhannya sekitar 550 MB, kurang dari separuh versi *desktop*.
- **Cocok untuk Pi tanpa layar.** Pi kita akan bekerja ***headless*** (tanpa kepala): tanpa monitor, papan ketik, dan mouse. Kita mengendalikannya dari laptop lewat jaringan.

Bagaimana Pi yang tidak pernah disentuh papan ketik bisa tahu nama WiFi, nama pengguna, dan kata sandimu? Itulah gunanya langkah **Customisation** di Raspberry Pi Imager saat Kemenangan Cepat. Imager menitipkan semua pengaturan itu di bagian kecil kartu bernama `bootfs`, dalam bentuk tiga berkas teks (`user-data`, `network-config`, dan `meta-data`). Saat menyala pertama kali, program bernama **cloud-init** di Raspberry Pi OS membaca ketiganya: memberi nama `gateway`, membuat pengguna `budi`, menyambung ke WiFi, dan menyalakan SSH. Itulah sebabnya penyalaan pertama lebih lama daripada biasanya.

### 4. SSH: terminal jarak jauh

Di Kemenangan Cepat, kamu mengetik `ssh budi@gateway.local` di terminal laptop, lalu tiba-tiba terminal itu "berpindah" ke Pi. **SSH** (*Secure Shell*, cangkang aman) adalah cara membuka **terminal milik komputer lain** lewat jaringan.

Bayangkan kamu **menelepon kantor Pi**. Kamu mendiktekan perintah lewat telepon, staf di kantor Pi mengerjakannya, lalu membacakan hasilnya kembali. Kamu tetap duduk di depan laptop, tetapi **semua perintah berjalan di Pi**: berkas yang kamu buat tersimpan di kartu microSD Pi, dan program yang kamu pasang terpasang di Pi. Pembicaraan teleponnya **disandikan** (dienkripsi), jadi orang lain di jaringan yang sama tidak bisa menguping kata sandi atau perintahmu.

![Diagram SSH, terminal jarak jauh: kamu mengetik di laptop, perintahnya berjalan di Pi, hasilnya kembali ke layarmu. Kiri, jendela terminal di laptop: PS C:\Users\budi> ssh budi@gateway.local, lalu permintaan kata sandi, salam pembuka Raspberry Pi OS, lalu prompt budi@gateway:~ $ dengan perintah hostname (jawaban gateway) dan uptime -p (jawaban up 2 hours, 5 minutes); penanda: prompt Pi berarti perintah berjalan di Pi. Tengah, panah ketikan ke kanan dan panah hasil ke kiri, lewat pintu 22 yang disandikan. Kanan, Raspberry Pi gateway tanpa monitor dan papan ketik: layanan SSH menunggu di pintu 22, perintahmu dijalankan di sini, berkas tersimpan di kartu microSD Pi, program terpasang di Pi. Bawah: sapaan pertama, SSH menunjukkan sidik jari kunci Pi dan laptop mencatatnya di known_hosts; berikutnya sidik jari dicocokkan setiap kali, dan kalau berbeda, misalnya setelah kartu ditulis ulang, SSH menolak dan memperingatkanmu.](aset/ssh-terminal-jarak-jauh.png)

Cara paling mudah untuk tahu kamu sedang "di mana" adalah membaca ***prompt*** (tanda siap, Modul 4), yaitu tulisan di depan kursor:

| *Prompt* | Artinya |
| :--- | :--- |
| `PS C:\Users\budi>` | PowerShell di laptop Windows. Perintah berjalan di laptop. |
| `budi@MacBook-Air ~ %` | Terminal di laptop macOS. Perintah berjalan di laptop. |
| `budi@gateway:~ $` | Terminal SSH di Pi: pengguna `budi`, di komputer bernama `gateway`, di folder rumah (`~`). Perintah berjalan di Pi. |

Biasakan melirik *prompt* sebelum menekan **Enter**. Jangan berharap perintah yang salah tempat selalu gagal: sebagian perintah Linux, misalnya `ls`, `cd`, `cat`, dan `rm`, juga dikenal PowerShell (Terminal Mac bahkan mengenal hampir semuanya, termasuk `sudo reboot`), jadi perintah itu bisa benar-benar berjalan di komputer yang salah, misalnya menghapus berkas di laptop, bukan di Pi.

**Sidik jari saat sapaan pertama.** Saat pertama kali menyambung, SSH di laptop belum mengenal Pi. Ia menunjukkan **sidik jari kunci** Pi (*fingerprint*, deretan huruf dan angka acak setelah `SHA256:`) dan bertanya apakah kamu yakin. Setelah kamu menjawab `yes`, laptop mencatat sidik jari itu di berkas `known_hosts`. Mulai saat itu, setiap kali menyambung, laptop memeriksa apakah yang menjawab benar-benar Pi yang sama. Kalau suatu hari sidik jarinya berbeda, SSH menolak menyambung dengan peringatan besar `REMOTE HOST IDENTIFICATION HAS CHANGED!`. Di rumah, penyebabnya hampir selalu tidak berbahaya: kamu baru saja menulis ulang kartu microSD sehingga Pi membuat kunci baru. Cara membereskannya ada di 🚨.

**Kata sandi atau kunci?** Minggu ini kita masuk dengan **kata sandi** karena paling mudah dipahami. Cara yang lebih aman dan lebih nyaman adalah **kunci SSH**: sepasang berkas, satu disimpan rahasia di laptop dan satu dititipkan di Pi sehingga kamu tidak perlu mengetik kata sandi lagi saat masuk (`sudo` tetap menanyakannya). Caranya ada di 🔬. Apa pun caranya, aturannya sama: **kata sandi Pi harus kuat dan tidak dipakai di tempat lain** karena siapa pun di jaringan rumahmu bisa mencoba masuk.

### 5. Peta rumah Linux: folder, pengguna, dan `sudo`

**Satu pohon folder.** Di Windows, berkas tersebar di beberapa *drive*: `C:`, `D:`, dan seterusnya. Di Linux, **semua** berkas berada di satu pohon yang berakar di **`/`** (garis miring, dibaca "root"). Kartu microSD, *flash disk*, bahkan informasi tentang prosesor, semuanya tampil sebagai cabang pohon itu. Garis miringnya juga terbalik dibandingkan dengan Windows: `/home/budi`, bukan `\home\budi`.

![Diagram peta rumah Linux: satu pohon dari garis miring /. Dari akar /, enam cabang: /home/budi, tanda ~, meja kerjamu, berkas milikmu sendiri tempat SSH membawamu masuk; /etc/mosquitto/conf.d, lemari pengaturan, berkas .conf Mosquitto, dan mengubahnya butuh sudo; /var/log/mosquitto, buku catatan, mosquitto.log berisi setiap klien yang masuk dan keluar; /var/lib/mosquitto, simpanan pesan, mosquitto.db berisi pesan retained (papan pengumuman) yang disimpan ke kartu; /boot/firmware, kunci pintu depan, berkas untuk menyalakan Pi dan satu-satunya bagian yang terbaca Windows (di laptop tampil sebagai bootfs); /usr/bin dan /usr/sbin, ruang peralatan, program seperti mosquitto_sub, nano, dan mosquitto sendiri. Catatan bawah: garis miring Linux berlawanan dengan Windows, dan huruf besar-kecil dibedakan: Mosquitto.conf tidak sama dengan mosquitto.conf.](aset/peta-folder-linux.png)

Hanya lima alamat yang perlu kamu ingat minggu ini:

| Folder | Isinya | Ibaratnya |
| :--- | :--- | :--- |
| `/home/budi` (disingkat **`~`**) | berkas milikmu sendiri | meja kerjamu |
| `/etc` | pengaturan semua program, misalnya `/etc/mosquitto/` | lemari arsip pengaturan kantor |
| `/var/log` | catatan (*log*) program, misalnya `/var/log/mosquitto/` | buku catatan kejadian |
| `/boot/firmware` | berkas untuk menyalakan Pi; satu-satunya bagian kartu yang bisa dibaca Windows (di laptop tampil sebagai *drive* `bootfs`, Konsep 3) | kunci pintu depan |
| `/usr/bin` | program-program yang terpasang, misalnya `mosquitto_sub` | ruang peralatan |

**Pengguna biasa dan `sudo`.** Akun `budi` yang kamu buat di Imager adalah **pengguna biasa**. Ia bebas mengubah apa pun di meja kerjanya (`/home/budi`), tetapi tidak boleh sembarangan mengubah lemari arsip (`/etc`) atau memasang program. Yang boleh adalah pengguna khusus bernama **root**, "kepala kantor". (Namanya sama dengan sebutan folder `/` tadi, tetapi yang ini pengguna, bukan folder.) Supaya tidak perlu masuk sebagai root, Linux menyediakan **`sudo`** ("lakukan sebagai kepala kantor"): tulis `sudo` di depan **satu** perintah, dan hanya perintah itu yang berjalan dengan wewenang penuh. Sebelum menjalankannya, `sudo` meminta kata sandimu sendiri (`[sudo] password for budi:`), dan seperti di SSH, ketikanmu tidak tampil di layar. Setelah itu, `sudo` mengingatnya selama 15 menit, jadi perintah `sudo` berikutnya tidak bertanya lagi. (Tutorial lama menulis bahwa Raspberry Pi tidak pernah menanyakan kata sandi untuk `sudo`; sejak April 2026, Raspberry Pi OS menanyakannya demi keamanan.)

Wewenang penuh berarti tidak ada lagi yang mencegah kesalahan. Biasakan dua hal:

- **Pakai `sudo` hanya kalau perlu**, yaitu saat pesan error berkata `Permission denied` untuk berkas di luar `/home/budi`, atau saat modul ini memang menuliskannya.
- **Baca ulang perintah ber-`sudo` sebelum menekan Enter**, terutama yang menghapus (`rm`). Linux tidak punya **Recycle Bin** di terminal: yang terhapus langsung hilang.

**Toko aplikasi lewat ketikan: `apt`.** Di HP, kamu memasang aplikasi dari Play Store. Di Raspberry Pi OS, program dipasang dari **gudang paket** (*repository*) resmi Debian dan Raspberry Pi dengan perintah **`apt`**. Tiga perintah yang akan sering kamu pakai:

| Perintah | Artinya |
| :--- | :--- |
| `sudo apt update` | Perbarui **katalog** gudang: daftar program dan versi terbarunya. Belum ada yang dipasang atau diubah. |
| `sudo apt full-upgrade` | Pasang **pembaruan** untuk semua program yang sudah terpasang, sesuai katalog terbaru. |
| `sudo apt install mosquitto` | **Pasang** program baru, lengkap dengan semua yang dibutuhkannya. |

Urutannya selalu `update` dulu, baru `full-upgrade` atau `install`, sama seperti memeriksa katalog terbaru sebelum berbelanja.

> ➡️ **Saatnya praktik!** Konsep 1–5 cukup untuk [Praktik 1 — Tur Linux lewat SSH](#praktik-1--tur-linux-lewat-ssh-40-menit). Setelah itu, kembali ke Konsep 6.

### 6. Alamat tetap: kantor pos tidak boleh pindah rumah

Ingat lagi analogi perumahan di Konsep 1 Modul 10: router adalah petugas yang **meminjamkan** nomor rumah (alamat IP) lewat **DHCP**, dan nomor itu bisa berganti, misalnya setelah router dinyalakan ulang. Untuk HP dan laptop, berganti nomor tidak masalah. Untuk **kantor pos**, itu bencana: Node 1 menyimpan alamat broker di `ALAMAT_BROKER`, dan kalau Pi tiba-tiba pindah dari `192.168.1.37` ke `192.168.1.41`, Node 1 terus mengetuk rumah yang salah.

**Bagaimana dengan nama `gateway.local`?** Di Kemenangan Cepat, laptopmu menemukan Pi lewat nama itu. Nama `.local` bekerja dengan cara "berteriak di dalam rumah": laptop bertanya ke seluruh jaringan, "Siapa yang bernama `gateway`?", dan Pi menjawab dengan alamatnya. Cara ini (mDNS, Konsep 9 Modul 10) praktis untuk SSH dari laptop, tetapi tidak cocok untuk Node 1: sejak v1.2, Node 1 tidak memakai mDNS lagi dan selalu menyambung ke **alamat IP** broker. Selain itu, di sebagian HP Android dan jaringan, nama `.local` tidak bisa ditemukan.

Jadi, Pi butuh **alamat tetap**. Ada dua cara, dan keduanya menghasilkan hal yang sama: Pi selalu memakai alamat yang sama.

| | **Cara A — pesan alamat di router** (*DHCP reservation*) | **Cara B — IP tetap di Pi** (*static IP*) |
| :--- | :--- | :--- |
| Ibaratnya | Petugas pembagi nomor diberi catatan: "rumah ber-KTP ini selalu dapat nomor 37." | Pi memasang sendiri nomor 37 di pintunya, tanpa bertanya ke petugas. |
| Butuh | halaman admin router (kata sandinya biasanya di stiker router) | hanya Pi, ditambah alamat yang tidak akan dipinjamkan router ke perangkat lain |
| Risiko bentrok | tidak ada: router tahu nomor itu sudah dipesan | ada, kalau router meminjamkan nomor yang sama ke perangkat lain |
| Kalau salah ketik | Pi tetap mendapat alamat dari router | Pi bisa tidak terjangkau sama sekali (ada jalan cadangannya, Praktik 2) |
| Dipakai di | Modul 10 Praktik 9, untuk Node 1; juga cara yang disarankan dokumentasi resmi Raspberry Pi | Silabus Modul 12, dengan `nmcli` |

Kalau kamu sudah bisa membuka halaman admin router di Praktik 9 Modul 10, pakai **Cara A**: menunya sama, hanya alamat MAC dan nomornya yang berbeda. Pakai **Cara B** kalau router itu bukan milikmu, kalau kamu tidak tahu kata sandi adminnya, atau kalau menu pemesanan alamatnya tidak tersedia (sering terjadi di modem bawaan penyedia internet).

**NetworkManager dan `nmcli`.** Di Raspberry Pi OS Trixie, urusan jaringan dipegang program bernama **NetworkManager** ("pengelola jaringan"), dan cara mengaturnya dari terminal adalah perintah **`nmcli`**. Banyak tutorial lama menyuruh mengubah berkas `/etc/dhcpcd.conf`. Cara itu **sudah tidak berlaku** sejak Raspberry Pi OS Bookworm (2023): berkasnya tidak ada lagi, dan kalaupun kamu membuatnya, tidak ada yang membacanya. Di Trixie, pengaturan yang dititipkan Imager disimpan lewat program pembantu bernama **netplan**, jadi nama sambungan di Pi-mu berawalan `netplan-`, misalnya `netplan-eth0` untuk kabel LAN (Praktik 2).

Satu hal lagi yang membedakan Pi dari laptop: Pi kita menyambung ke router dengan **kabel LAN** (Ethernet), bukan WiFi. Kabel lebih stabil, tidak berebut udara dengan ESP32 dan HP, dan Pi duduk tenang di dekat router. Pengaturan WiFi yang kamu isi di Imager tetap ada sebagai **jalan cadangan**: kalau suatu saat pengaturan kabel salah, kamu masih bisa masuk lewat WiFi.

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 2 — Alamat tetap untuk Pi](#praktik-2--alamat-tetap-untuk-pi-30-menit). Setelah itu, kembali ke Konsep 7.

### 7. Layanan dan systemd: satpam yang tidak pernah tidur

Di Modul 11, broker hidup selama jendela terminalnya terbuka: `mosquitto -v -c mosquitto-lan.conf`. Tutup terminalnya, broker ikut berhenti. Di gateway, tidak ada yang duduk di depan terminal. Kita butuh broker yang:

1. **menyala sendiri** setiap kali Pi dinyalakan, tanpa ada yang mengetik apa pun;
2. **bangkit lagi sendiri** kalau suatu saat ia mati mendadak (*crash*);
3. **dimatikan dengan rapi** saat Pi dimatikan supaya pesan *retained* tersimpan dulu;
4. **mencatat** apa yang terjadi di buku catatan yang bisa dibaca kapan saja.

Program yang berjalan di latar belakang seperti itu disebut **layanan** (*service*). Di Linux, yang mengurus semua layanan adalah **systemd**, program pertama yang dijalankan saat Pi menyala. Bayangkan systemd sebagai **satpam kantor** yang memegang daftar tugas. Setiap pagi, satpam membuka kantor dan menyalakan semua layanan yang ada di daftar. Sepanjang hari, ia berkeliling: kalau ada layanan yang tumbang dan daftar tugasnya berkata "bangunkan lagi", ia membangunkannya. Ia juga mencatat setiap kejadian di **buku catatan** bernama ***journal***.

![Diagram systemd, satpam yang menyalakan, membangunkan, dan mencatat: satu hari dalam hidup layanan mosquitto di gateway. Garis waktu: Pi menyala (systemd membaca daftar tugas); mosquitto jalan (enabled berarti ikut menyala, active running); crash, program mati mendadak; panah melengkung bertuliskan otomatis menuju dibangunkan lagi (aturan Restart=on-failure, active running); sudo poweroff, dihentikan dengan rapi dan retained disimpan; Pi mati, aman dicabut. Kotak kiri bawah, buku catatan satpam (journal): journalctl -u mosquitto menampilkan kapan layanan dinyalakan, dimatikan, atau gagal, tetapi isi journal hilang saat Pi menyala ulang; catatan Mosquitto sendiri tentang klien masuk-keluar ada di /var/log/mosquitto/mosquitto.log dan tetap tersimpan di kartu. Kotak kanan bawah, bicara dengan satpam lewat systemctl: status (bagaimana keadaannya), restart (matikan, nyalakan lagi), enable (masuk daftar tugas pagi), disable (coret dari daftar).](aset/systemd-satpam.png)

Daftar tugas untuk setiap layanan ditulis di berkas kecil bernama **unit**, misalnya `mosquitto.service`. Kabar baiknya, paket `mosquitto` dari Debian sudah membawa berkas unitnya sendiri. Begitu dipasang dengan `apt`, Mosquitto langsung menjadi layanan yang **diaktifkan** (*enabled*, ikut menyala saat Pi menyala) dan **berjalan** (*active*). Tugas kita minggu ini hanya memberinya pengaturan yang benar, lalu menguji janji-janji si satpam.

Semua urusan dengan satpam memakai perintah **`systemctl`**:

| Perintah | Artinya |
| :--- | :--- |
| `systemctl status mosquitto` | Tanyakan keadaan layanan: berjalan atau tidak, sejak kapan, dan beberapa baris catatan terakhir. |
| `sudo systemctl restart mosquitto` | Matikan lalu nyalakan lagi, misalnya setelah pengaturannya diubah. |
| `sudo systemctl stop mosquitto` / `start` | Matikan / nyalakan sekarang (sampai Pi dinyalakan ulang). |
| `sudo systemctl disable mosquitto` / `enable` | Coret dari / tulis di daftar tugas pagi (berlaku mulai Pi menyala berikutnya). |

Untuk membaca buku catatan satpam, perintahnya **`journalctl`**, misalnya `journalctl -u mosquitto` (`-u` = *unit*, catatan untuk satu layanan saja). Mosquitto sendiri punya **buku catatan kedua**: ia mencatat setiap klien yang masuk dan keluar di berkas `/var/log/mosquitto/mosquitto.log`. Jadi, *journal* menjawab "kapan satpam menyalakan atau membangunkan broker?", sedangkan `mosquitto.log` menjawab "siapa saja yang datang ke kantor pos?". Satu lagi yang perlu diingat: di Raspberry Pi OS, *journal* sengaja disimpan di memori (RAM) supaya kartu microSD tidak cepat aus. Akibatnya, isinya **hilang setiap kali Pi menyala ulang**. `mosquitto.log` disimpan di kartu dan tetap ada.

**Kenapa repot memakai layanan, bukan sekadar menjalankan `mosquitto` di terminal SSH?** Terminal SSH hanya hidup selama sambunganmu hidup. Begitu laptop ditutup, sambungan SSH putus, dan program yang dijalankan di dalamnya ikut dihentikan. Layanan tidak bergantung pada siapa pun yang sedang tersambung.

> ➡️ **Saatnya praktik!** Konsep 7 cukup untuk [Praktik 3 — Mosquitto sebagai layanan di Pi](#praktik-3--mosquitto-sebagai-layanan-di-pi-30-menit), [Praktik 4 — Uji: layanan bangkit sendiri](#praktik-4--uji-layanan-bangkit-sendiri-20-menit), dan [Praktik 5 — Membaca catatan](#praktik-5--membaca-catatan-20-menit). Setelah itu, kembali ke Konsep 8.

### 8. Merawat gateway: kartu microSD, listrik, dan cadangan

Gateway yang menyala 24 jam punya tiga musuh: **kartu yang aus**, **listrik yang padam mendadak**, dan **pembaruan yang ditunda-tunda**. Ketiganya bisa dijinakkan dengan kebiasaan sederhana.

**Kenapa kartu microSD biasa cepat rusak?** Kartu microSD menyimpan data di sel memori *flash*. Setiap sel hanya tahan ditulis-hapus sejumlah kali, mirip **halaman buku tulis yang ditulis dengan pensil**: dihapus terlalu sering, kertasnya menipis lalu robek. Masalahnya, kartu tidak bisa menghapus satu kata saja; ia harus menghapus **satu blok besar** sekaligus, lalu menulis ulang isi blok itu. Akibatnya, catatan kecil yang ditulis terus-menerus, misalnya satu baris *log* setiap beberapa detik, membuat kartu menghapus dan menulis ulang jauh lebih banyak daripada ukuran catatannya sendiri. Para ahli menyebutnya ***write amplification*** (penulisan yang membengkak). Kartu yang baik meratakan keausan ke seluruh blok (*wear leveling*), tetapi kartu murah sering hanya melakukannya seadanya.

![Diagram: mengapa kartu microSD biasa cepat aus di gateway. Kiri, isi kartu digambarkan sebagai deretan blok sel flash: menulis bisa sedikit-sedikit, tetapi menghapus harus satu blok utuh; tiga blok di tengah berwarna merah dengan catatan blok yang paling sering dihapus-tulis aus lebih dulu. Di bawahnya: satu baris log, beberapa puluh byte, setiap beberapa detik membuat kartu berulang kali menyalin dan menghapus blok besar. Kanan, tiga hal yang menjaga gateway: satu, kartu high-endurance, dirancang untuk CCTV yang menulis 24 jam; dua, sudo poweroff, baru cabut: listrik padam saat menulis bisa merusak berkas; tiga, adaptor resmi ditambah cadangan, tegangan stabil, resep dan pengaturan di GitHub. Catatan bawah: kode A1/A2 adalah kecepatan membuka dan menulis banyak berkas kecil, bukan daya tahan; untuk gateway, utamakan high-endurance.](aset/kartu-microsd-aus.png)

Kartu murah dirancang untuk kamera dan HP: sesekali menyimpan foto besar, lalu lebih sering dibaca. Untuk gateway yang menulis sedikit-sedikit tanpa henti, kurikulum ini memakai kartu ***high-endurance*** (tahan lama), yang memang dirancang untuk kamera CCTV dan *dashcam* (kamera mobil) yang merekam 24 jam. Pabriknya menyebut daya tahannya dalam jam rekaman video, misalnya SanDisk High Endurance 32 GB dinilai tahan 2.500 jam rekaman Full HD, dan SanDisk MAX Endurance 32 GB 15.000 jam. Kode **A1/A2** di kartu berbicara tentang **kecepatan** membuka dan menulis banyak berkas kecil, bukan tentang daya tahan. Untuk gateway, daya tahan lebih penting: pilih kartu *high-endurance*. Sebagian kartu *high-endurance* tidak mencantumkan kode A1/A2, dan itu tidak apa-apa; kartu *high-endurance* yang juga berkode A1 atau A2 tentu lebih baik.

**Listrik padam saat kartu sedang menulis** bisa merusak berkas yang sedang ditulis, kadang sampai Pi tidak mau menyala. Tiga kebiasaan yang mencegahnya:

1. **Matikan Pi dengan perintah**, bukan dengan mencabut kabel: `sudo poweroff`, lalu tunggu tanda aman dari lampunya, baru cabut adaptornya. Di Pi 4, lampu hijau (ACT) berkedip pendek beberapa kali lalu padam, sedangkan lampu merah (PWR) boleh tetap menyala selama adaptor tercolok. Di Pi 5, lampu status bertulisan STAT di samping tombol daya berubah menjadi **merah**: Pi sedang tidur menunggu dinyalakan lagi.
2. **Pakai adaptor resmi.** Adaptor HP yang kurang kuat membuat tegangan anjlok (*undervoltage*) saat Pi sibuk, dan Pi bisa menyala ulang sendiri. Pi mencatat setiap kejadian tegangan anjlok, dan kamu bisa memeriksanya (Praktik 6).
3. **Siapkan cadangan** karena kerusakan kartu tetap bisa terjadi.

**Cadangan yang realistis untuk pemula** ada dua lapis:

- **Resep dan berkas pengaturan.** Semua yang kita ubah di Pi minggu ini muat dalam satu halaman catatan dan satu berkas pengaturan Mosquitto. Kalau keduanya tersimpan di repositori GitHub-mu, gateway baru bisa dibangun ulang dari kartu kosong dalam setengah jam. Inilah cadangan utama kita (bagian ➕ E).
- **Salinan utuh kartu** (*image*), opsional, dengan aplikasi di laptop. Cara ini menyalin seluruh isi kartu, termasuk hal yang lupa kamu catat, tetapi ukurannya sebesar kartunya (32 GB) dan Pi harus dimatikan dulu. Raspberry Pi Imager **tidak** bisa membuat salinan seperti ini; alatnya ada di 🔬.

**Pembaruan.** Linux yang tidak pernah diperbarui lama-kelamaan menyimpan celah keamanan yang sudah diketahui umum. Jadwalkan sebulan sekali: `sudo apt update`, lalu `sudo apt full-upgrade`. Kalau pembaruannya menyentuh *kernel* (inti Linux) atau firmware, Pi perlu dinyalakan ulang (`sudo reboot`) supaya versi barunya terpakai. Tandanya mudah: di daftar paket yang diperbarui `apt` ada nama berawalan `linux-image` (*kernel*), `raspi-firmware`, atau `rpi-eeprom`.

**Perlukah Pi dinyalakan ulang otomatis setiap hari?** Hampir tidak pernah perlu. Layanan yang tumbang sudah dibangunkan systemd (Konsep 7), dan menyalakan ulang setiap hari justru menyembunyikan masalah yang seharusnya kamu baca di catatan. Menyalakan ulang dibutuhkan setelah pembaruan *kernel*, dan sebagai obat terakhir kalau seluruh Pi benar-benar macet. Untuk kemungkinan terakhir itu, Pi punya ***watchdog*** perangkat keras, mirip penjaga yang sudah kamu kenal di Modul 8, dan di Raspberry Pi OS Trixie penjaga ini **sudah menyala sejak awal**: kalau seluruh sistem macet lebih dari satu menit, Pi menyala ulang sendiri. Rinciannya di 🔬.

> ➡️ **Saatnya praktik!** Lanjut ke [Praktik 6 — Merawat gateway](#praktik-6--merawat-gateway-30-menit). Pengguna jalur laptop: lanjut ke [Praktik 7](#praktik-7--jalur-laptop-mosquitto-sebagai-layanan-30-menit).

---

## 🔧 Praktik langkah demi langkah

Semua praktik minggu ini dikerjakan **di terminal SSH yang tersambung ke Pi**, kecuali kalau langkahnya berkata lain. Satu aturan sebelum mulai:

> [!IMPORTANT]
> **Lirik *prompt* sebelum menekan Enter.** `budi@gateway:~ $` berarti perintahmu berjalan di Pi. `PS C:\Users\…>` (Windows) atau `… ~ %` (macOS) berarti perintahmu berjalan di laptop. Setiap kotak perintah di modul ini didahului keterangan **di Pi** atau **di laptop**.

Cara membuka kembali terminal SSH kapan saja: buka **Terminal** di laptop (Windows 11: klik kanan tombol **Start** → **Terminal**; Windows 10: klik kanan tombol **Start** → **Windows PowerShell**; macOS: **Spotlight** → ketik `Terminal`), lalu ketik `ssh budi@gateway.local` dan masukkan kata sandimu. Setelah Praktik 2, kamu juga bisa memakai alamat tetapnya: `ssh budi@192.168.1.37`. Terminal SSH membeku atau menulis bahwa sambungannya putus setelah laptop tidur atau lama ditinggal? Itu wajar: Pi tetap menyala, jadi tutup saja jendelanya, lalu masuk lagi dengan cara ini. Hanya perintah yang sedang berjalan di jendela itu yang ikut terhenti, jadi jangan biarkan laptop tidur selama perintah panjang seperti `sudo apt full-upgrade` belum selesai.

### Praktik 1 — Tur Linux lewat SSH (40 menit)

> 🖥️ **Alat:** terminal di laptop yang tersambung ke Pi lewat SSH (Kemenangan Cepat). Konsep yang dipakai: 3, 4, dan 5.

Tur ini memperkenalkan sekitar dua puluh perintah yang cukup untuk seluruh kurikulum. Ketik sendiri setiap perintahnya, jangan disalin sekaligus: jari yang mengetik lebih cepat hafal daripada mata yang membaca. Kotak **Hasilnya** di praktik ini adalah **contoh**; nama berkas, angka, dan tanggal di Pi-mu bisa berbeda.

#### 1.1 Di mana aku? (`pwd`, `ls`, `cd`)

1. **Di Pi**, tanyakan folder tempatmu berada sekarang:

   ```bash
   pwd
   ```

   **Hasilnya:** `/home/budi`. `pwd` (*print working directory*) mencetak folder kerja. Setiap kali masuk lewat SSH, kamu mulai di folder rumahmu.
2. Lihat isi folder ini:

   ```bash
   ls
   ```

   Tidak muncul apa-apa? Wajar: folder rumahmu masih kosong. Tambahkan pilihan **`-la`** (*long*, *all*) untuk melihat juga berkas tersembunyi, yaitu berkas yang namanya diawali titik:

   ```bash
   ls -la
   ```

   **Hasilnya** (contoh; angka, tanggal, dan hak akses di Pi-mu bisa sedikit berbeda):

   ```text
   total 20
   drwx------ 2 budi budi 4096 Oct 18 08:47 .
   drwxr-xr-x 3 root root 4096 Oct 18 08:41 ..
   -rw-r--r-- 1 budi budi  220 Oct 18 08:41 .bash_logout
   -rw-r--r-- 1 budi budi 3523 Oct 18 08:41 .bashrc
   -rw-r--r-- 1 budi budi  807 Oct 18 08:41 .profile
   ```

   Setiap baris adalah satu berkas atau folder. Huruf pertama `d` berarti folder (*directory*), sedangkan `-` berarti berkas biasa. Huruf `rwx` sesudahnya adalah hak akses (*read*, *write*, *execute*: baca, tulis, jalankan), lalu pemilik (`budi`), ukuran dalam byte, dan tanggal terakhir diubah. `.` adalah folder ini sendiri, dan `..` adalah folder induknya. Berkas `.bashrc` mengatur tampilan terminalmu, termasuk *prompt* `budi@gateway:~ $`. Kalau kamu sudah pernah keluar dari SSH, misalnya dengan `exit` di akhir Kemenangan Cepat, ada juga berkas `.bash_history`, yaitu riwayat perintah yang pernah kamu ketik (Praktik 1.5).
3. Berpindah folder dengan **`cd`** (*change directory*). Coba lihat lemari pengaturan, lalu kembali:

   ```bash
   cd /etc/mosquitto
   ```

   Pi menjawab `-bash: cd: /etc/mosquitto: No such file or directory` karena Mosquitto belum dipasang (Praktik 3). Pesan error seperti ini aman: tidak ada yang rusak. Coba folder lain yang pasti ada:

   ```bash
   cd /etc
   ```

   ```bash
   ls
   ```

   *Prompt* berubah menjadi `budi@gateway:/etc $`, dan `ls` mencetak puluhan nama berkas pengaturan. Kembali ke rumah dengan `cd` saja, tanpa apa-apa di belakangnya (atau `cd ~`). Naik satu tingkat ke folder induk dengan `cd ..`.

> 💡 **Tombol hemat ketikan.** Ketik `cd /et`, lalu tekan **Tab**: terminal melengkapi sendiri menjadi `cd /etc/`. Tekan **↑** untuk memanggil kembali perintah sebelumnya. Dua tombol ini akan menghemat ribuan ketukan dan mencegah salah ketik.

#### 1.2 Membuat, melihat, menyalin, dan menghapus berkas

1. **Di Pi**, pastikan kamu berada di folder rumah (`cd`), lalu buat folder latihan:

   ```bash
   mkdir latihan
   ```

   ```bash
   cd latihan
   ```

2. Buat berkas catatan dengan **nano**, penyunting teks di terminal:

   ```bash
   nano catatan-gateway.txt
   ```

   Layar berubah menjadi penyunting. Ketik beberapa baris, misalnya:

   ```text
   Gateway Rumah Pintar Mini
   Nama host: gateway
   Pengguna: budi
   Dipasang: (tanggal hari ini)
   ```

   Di bagian bawah layar ada dua baris jalan pintas; tanda `^` berarti tombol **Ctrl**:

   ```text
   ^G Help      ^O Write Out ^F Where Is  ^K Cut       ^T Execute   ^C Location
   ^X Exit      ^R Read File ^\ Replace   ^U Paste     ^J Justify   ^/ Go To Line
   ```

   Simpan dengan **Ctrl + O**. Saat nano bertanya `Write to File: catatan-gateway.txt`, cukup tekan **Enter**; di bawah akan muncul `[ Wrote 4 lines ]`. Lalu keluar dengan **Ctrl + X**. (Di nano versi ini, **Ctrl + S** juga langsung menyimpan tanpa bertanya.)

   > ⚠️ **Mouse tidak bisa dipakai di nano**, dan **Ctrl + C** di nano bukan "salin", melainkan menampilkan posisi kursor. Pindahkan kursor dengan tombol panah. Lupa menyimpan lalu menekan **Ctrl + X**? Kalau begitu, nano bertanya `Save modified buffer?`: tekan **Y**, lalu **Enter** untuk nama berkasnya.
3. Tampilkan isi berkas tanpa membukanya untuk disunting:

   ```bash
   cat catatan-gateway.txt
   ```

   Untuk berkas panjang, pakai `less catatan-gateway.txt`: gulir dengan panah, keluar dengan **q**.
4. Salin, ganti nama, lalu hapus:

   ```bash
   cp catatan-gateway.txt cadangan.txt
   ```

   ```bash
   mv cadangan.txt catatan-lama.txt
   ```

   ```bash
   rm catatan-lama.txt
   ```

   `cp` (*copy*) menyalin, `mv` (*move*) memindahkan atau mengganti nama, dan `rm` (*remove*) menghapus. Periksa dengan `ls` bahwa yang tersisa hanya `catatan-gateway.txt`.

   > ⚠️ **`rm` tidak bertanya dan tidak punya Recycle Bin.** Berkas yang dihapus langsung hilang. Perintah `rm -r` menghapus folder beserta isinya; jangan pernah menggabungkannya dengan `sudo` dan `/` kecuali kamu benar-benar tahu apa yang dihapus.

#### 1.3 Seberapa sehat Pi-ku? (`uptime`, `df`, `free`, `hostname -I`)

**Di Pi**, jalankan satu per satu:

| Perintah | Yang ditanyakan | Contoh jawaban |
| :--- | :--- | :--- |
| `uptime -p` | Sudah berapa lama Pi menyala sejak terakhir kali dinyalakan? | `up 2 hours, 5 minutes` |
| `df -h /` | Kartu microSD masih lega? (`-h` = angka mudah dibaca) | kolom `Size` `29G`, `Used` `2.3G`, `Use%` `9%` |
| `free -h` | Memori kerja (RAM) masih lega? | baris `Mem:`, kolom `total` `1.9Gi` dan `available` `1.7Gi` |
| `hostname -I` | Alamat IP Pi sekarang? | `192.168.1.37 192.168.1.38`: satu untuk kabel, satu untuk WiFi, urutannya tidak tentu; kadang ditambah alamat IPv6 yang panjang |
| `cat /etc/os-release` | Versi Raspberry Pi OS yang terpasang? | baris pertama `PRETTY_NAME="Debian GNU/Linux 13 (trixie)"` |

Catat hasil `df -h /`, `free -h`, dan `hostname -I` di `catatan-gateway.txt` (`nano ~/latihan/catatan-gateway.txt`; jalur lengkap ini tetap benar walaupun kamu baru masuk lagi lewat SSH dan berada di folder rumah). Begitu nano terbuka, hasil perintah tadi tertutup layar nano, jadi tulis dulu angka-angkanya di kertas, atau salin teksnya sebelum membuka nano: sorot teksnya dengan mouse, lalu klik kanan (macOS: **Cmd + C**), dan tempel di nano dengan klik kanan (macOS: **Cmd + V**). Menempel tetap bisa walaupun mouse tidak bisa memindahkan kursor di nano (1.2); teksnya masuk di tempat kursor berada. Angka-angka ini adalah "denyut nadi" gateway; di Praktik 6 kita memeriksanya lagi.

#### 1.4 Memperbarui Pi (`sudo apt`)

1. **Di Pi**, perbarui katalog gudang paket:

   ```bash
   sudo apt update
   ```

   Karena ini perintah `sudo` pertamamu, Pi meminta kata sandi (`[sudo] password for budi:`); ketik kata sandi Pi, lalu tekan **Enter**. **Hasilnya** (contoh):

   ```text
   Hit:1 http://deb.debian.org/debian trixie InRelease
   Get:2 http://deb.debian.org/debian trixie-updates InRelease [47.1 kB]
   Hit:3 http://deb.debian.org/debian-security trixie-security InRelease
   Hit:4 http://archive.raspberrypi.com/debian trixie InRelease
   Fetched 47.1 kB in 1s (52.3 kB/s)
   12 packages can be upgraded. Run 'apt list --upgradable' to see them.
   ```

   Empat baris pertama adalah empat gudang yang diperiksa: tiga milik Debian dan satu milik Raspberry Pi. Baris terakhir menyebut berapa program yang punya versi lebih baru. Kalau tertulis `All packages are up to date.`, semuanya sudah terbaru.
2. Pasang semua pembaruan:

   ```bash
   sudo apt full-upgrade
   ```

   `apt` menampilkan daftar paket yang akan diperbarui dan ringkasannya (`Summary:` dengan `Upgrading: 12, Installing: 0, Removing: 0, Not Upgrading: 0`), lalu bertanya `Continue? [Y/n]`. Huruf besar `Y` berarti jawaban bawaan: tekan **Enter** saja. Catat apakah daftar itu memuat nama berawalan `linux-image`, `raspi-firmware`, atau `rpi-eeprom` (langkah 3). Kalau di tengah jalan muncul layar berisi catatan perubahan (`NEWS`) yang berhenti menunggu, tekan **q** untuk melanjutkan. Pembaruan pertama setelah kartu ditulis bisa butuh beberapa menit. Biarkan sampai *prompt* `budi@gateway:~ $` muncul lagi; jangan menutup terminal atau membiarkan laptop tidur di tengah jalan.
3. Kalau daftar tadi memuat `linux-image`, `raspi-firmware`, atau `rpi-eeprom`, nyalakan ulang Pi supaya *kernel* dan firmware barunya terpakai (Konsep 8):

   ```bash
   sudo reboot
   ```

   Sambungan SSH langsung putus, biasanya dengan pesan `Connection to gateway.local closed by remote host.` Tunggu sekitar satu menit, lalu masuk lagi dengan `ssh budi@gateway.local`.

#### 1.5 Bertanya kepada Linux sendiri (`man`, `--help`, `history`)

- `man ls` membuka buku petunjuk perintah `ls` (keluar dengan **q**). Hampir setiap perintah juga menerima `--help`, misalnya `ls --help`, yang mencetak ringkasan pilihan.
- `history` mencetak perintah-perintah yang pernah kamu ketik. Berguna saat lupa "tadi aku mengetik apa?".
- `exit` (atau **Ctrl + D**) keluar dari SSH dan mengembalikanmu ke terminal laptop.

**Rangkuman perintah minggu ini** (simpan untuk rujukan cepat):

| Kelompok | Perintah |
| :--- | :--- |
| Berpindah dan melihat | `pwd`, `ls -la`, `cd`, `cat`, `less` |
| Berkas dan folder | `mkdir`, `nano`, `cp`, `mv`, `rm` |
| Wewenang dan paket | `sudo`, `apt update`, `apt full-upgrade`, `apt install` |
| Kesehatan dan jaringan | `uptime`, `df -h`, `free -h`, `hostname -I`, `ping` |
| Alamat tetap (Praktik 2) | `nmcli`, `ip` |
| Layanan dan catatan (Praktik 3–5) | `systemctl`, `journalctl`, `tail` |
| Perawatan (Praktik 6) | `vcgencmd`, `scp` (diketik di laptop) |
| Bantuan dan keluar | `man`, `history`, `exit`, `sudo reboot`, `sudo poweroff` |

> ⬆️ **Selesai Praktik 1?** Kembali ke [Konsep 6](#6-alamat-tetap-kantor-pos-tidak-boleh-pindah-rumah).

### Praktik 2 — Alamat tetap untuk Pi (30 menit)

> 🖥️ **Alat:** terminal SSH ke Pi, browser di laptop (untuk Cara A), dan kartu jaringan dari Praktik 2 Modul 10 (di `catatan-modul10.md`). Pi tersambung ke router dengan **kabel LAN**. Konsep yang dipakai: 6.
>
> ⭐ **Wajib** — Node 1 dan MQTTX akan menyambung ke alamat ini.

#### 2.1 Kenali sambungan jaringan Pi

1. **Di Pi**, tanyakan keadaan semua "colokan" jaringan:

   ```bash
   nmcli device status
   ```

   **Hasilnya** (contoh):

   ```text
   DEVICE         TYPE      STATE                   CONNECTION
   eth0           ethernet  connected               netplan-eth0
   wlan0          wifi      connected               netplan-wlan0-RumahKita
   lo             loopback  connected (externally)  lo
   p2p-dev-wlan0  wifi-p2p  disconnected            --
   ```

   `eth0` adalah colokan kabel LAN, dan `wlan0` adalah WiFi. Kolom `CONNECTION` berisi **nama sambungan** yang sedang dipakai: `netplan-eth0` untuk kabel, dan `netplan-wlan0-` diikuti nama WiFi-mu. Catat nama sambungan untuk `eth0` persis seperti yang tercetak; kamu memerlukannya di Cara B. (Dua baris terakhir boleh diabaikan.)
2. Lihat alamat IP kabel LAN dan alamat MAC-nya:

   ```bash
   ip -4 addr show eth0
   ```

   ```bash
   ip link show eth0
   ```

   **Hasilnya** (contoh):

   ```text
   2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
       inet 192.168.1.37/24 brd 192.168.1.255 scope global dynamic noprefixroute eth0
          valid_lft 86213sec preferred_lft 86213sec
   2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP mode DEFAULT group default qlen 1000
       link/ether d8:3a:dd:12:34:56 brd ff:ff:ff:ff:ff:ff
   ```

   Tiga baris pertama adalah jawaban perintah pertama, dan dua baris terakhir jawaban perintah kedua. Catat alamat setelah `inet` tanpa `/24` (misalnya `192.168.1.37`) dan alamat setelah `link/ether` (alamat MAC, misalnya `d8:3a:dd:12:34:56`). Kata `dynamic` dan `valid_lft` (sisa masa pinjam, dalam detik) menandai alamat **pinjaman** dari router.
3. Lihat alamat router, yang juga disebut gateway router (Modul 10):

   ```bash
   ip route
   ```

   Baris pertama berbunyi `default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.37 metric 100`. Angka setelah `via` adalah alamat router. Baris kedua yang serupa, dengan `dev wlan0` dan `metric 600`, adalah jalan lewat WiFi; jalan dengan angka `metric` lebih kecil dipakai lebih dulu, jadi Pi memakai kabel selama kabelnya tersambung.

Sekarang pilih **satu** cara: **Cara A** kalau kamu bisa memesan alamat di halaman admin router (seperti Praktik 9 Modul 10), atau **Cara B** kalau tidak.

#### 2.2 Cara A — pesan alamat di router

1. Masuk ke halaman admin router di browser laptop, lalu buka menu pemesanan alamat seperti di Praktik 9.3 Modul 10 (router TP-Link: **Advanced → Network → DHCP Server → Address Reservation**).
2. Tambahkan pemesanan baru: **alamat MAC `eth0`** dari langkah 2.1 (TP-Link menulisnya dengan tanda hubung dan huruf besar: `D8-3A-DD-12-34-56`) dan **alamat IP yang sedang dipakai Pi**, misalnya `192.168.1.37`. Simpan, dan pastikan aturannya aktif.
3. Uji: **di Pi**, nyalakan ulang dengan `sudo reboot`, tunggu sekitar satu menit, masuk lagi, lalu jalankan `hostname -I`. Alamat kabelnya tetap `192.168.1.37`. Bukti pastinya: alamat MAC Pi kini tercantum di daftar pemesanan router.

Lanjut ke 2.4.

#### 2.3 Cara B — IP tetap di Pi dengan `nmcli`

Pada cara ini, Pi memasang sendiri alamatnya, jadi kamu harus memilih alamat yang **tidak akan dipinjamkan router** ke perangkat lain. Dokumentasi resmi Raspberry Pi menegaskan: alamatnya harus berada **di luar rentang pinjaman (*DHCP pool*) router**, dan tidak boleh sedang dipakai perangkat lain.

- **Router bisa dibuka, tetapi menu pemesanannya tidak ada?** Cari rentangnya di menu LAN atau DHCP, biasanya tertulis **Start IP Address** dan **End IP Address**. Pilih alamat di luar rentang itu. Misalnya, kalau router meminjamkan `192.168.1.100` sampai `192.168.1.199`, alamat pinjaman Pi saat ini pasti salah satu di antaranya (misalnya `192.168.1.105`), sedangkan alamat di luar rentang seperti `192.168.1.37` aman dipilih. Pastikan juga alamat pilihanmu sedang tidak dipakai: buka jendela Terminal kedua **di laptop** dan biarkan jendela SSH tetap terbuka (Windows: seperti Kemenangan Cepat langkah 4; macOS: di Terminal, tekan **Cmd + N**), lalu `ping` ke alamat itu. Hasilnya harus gagal: di Windows tertulis `Request timed out.` atau `Destination host unreachable.` (kadang didahului `Reply from` dan alamat laptopmu sendiri; itu tetap berarti tidak ada yang menjawab), dan di macOS `Request timeout for icmp_seq 0`, lalu `1`, `2`, dan seterusnya (kadang diselingi baris `ping: sendto: …`) sampai kamu menekan **Ctrl + C**. Alamat Pi akan pindah ke alamat pilihan ini di langkah 2 di bawah.
- **Router sama sekali tidak bisa dibuka?** Kamu tidak bisa melihat rentangnya. Jalan daruratnya adalah memakai **alamat yang sekarang dipinjamkan ke Pi** (langkah 2.1): alamat itu pasti berada di blok yang benar dan saat ini tidak dipakai perangkat lain. Karena Pi menyala 24 jam, kebanyakan router akan mendapati alamat itu sedang dipakai sebelum meminjamkannya lagi. Namun, alamat itu tetap berada di dalam rentang pinjaman, jadi bentrok masih mungkin terjadi, terutama setelah Pi lama mati. Tanda-tanda dan obatnya ada di 🚨. Begitu bisa membuka router, pindahlah ke Cara A.

> ⚠️ **Sebelum mulai, pastikan jalan cadangan terbuka.** `nmcli device status` di 2.1 harus menunjukkan `wlan0` `connected`. Kalau ada salah ketik di pengaturan kabel, kamu masih bisa masuk lewat WiFi dengan `ssh budi@gateway.local`. Pi tanpa WiFi? Baca dulu "Pi tidak bisa dihubungi setelah mengubah alamat" di 🚨. Pi Zero 2 W hanya punya WiFi, jadi tidak punya jalan cadangan: sebaiknya pakai Cara A, atau baca dulu penyesuaiannya di 🔬 "Pi 5, Pi 4, atau Pi Zero 2 W?".

1. **Di Pi**, ubah sambungan kabel supaya memakai alamat tetap. Kalau nama sambunganmu di langkah 2.1 bukan `netplan-eth0`, ganti nama itu (tetap di antara petik ganda). Ganti juga ketiga alamatnya: `192.168.1.37` dengan alamat Pi yang kamu pilih di atas (alamat di luar rentang pinjaman, atau alamat pinjaman Pi saat ini kalau router tidak bisa dibuka), dan kedua `192.168.1.1` dengan alamat router dari langkah 2.1. Semua pengaturan harus ditulis dalam **satu** perintah:

   ```bash
   sudo nmcli connection modify "netplan-eth0" ipv4.method manual ipv4.addresses 192.168.1.37/24 ipv4.gateway 192.168.1.1 ipv4.dns 192.168.1.1
   ```

   - `ipv4.method manual`: berhenti meminta alamat ke router, pakai alamat yang ditulis di sini.
   - `ipv4.addresses 192.168.1.37/24`: alamat Pi; `/24` sama dengan *subnet mask* `255.255.255.0` (Konsep 1 Modul 10).
   - `ipv4.gateway` dan `ipv4.dns`: alamat router, untuk keluar ke internet dan mencari nama.

   Perintah ini tidak mencetak apa-apa kalau berhasil, dan belum mengubah sambungan yang sedang berjalan; ia hanya menyimpan pengaturannya. NetworkManager menuliskannya ke berkas pengaturan netplan di `/etc/netplan/`, jadi pengaturan ini tetap ada setelah Pi menyala ulang. Muncul `Error: Failed to modify connection 'netplan-eth0': ipv4.method: method 'manual' requires at least an address or a route`? Bagian `ipv4.addresses …` tertinggal atau salah ketik: ulangi seluruh perintah dalam satu baris.
2. Terapkan pengaturan itu:

   ```bash
   sudo nmcli connection up "netplan-eth0"
   ```

   **Hasilnya:** `Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/5)` (angka terakhirnya bisa berbeda). Kalau kamu masuk lewat kabel dan alamatnya berubah, terminal SSH-mu membeku: tutup jendelanya, lalu masuk lagi dengan `ssh budi@gateway.local`.
3. Periksa:

   ```bash
   ip -4 addr show eth0
   ```

   Barisnya kini `inet 192.168.1.37/24 brd 192.168.1.255 scope global noprefixroute eth0`, **tanpa** kata `dynamic`, dan `valid_lft forever`: alamat ini bukan pinjaman lagi.
4. Nyalakan ulang (`sudo reboot`), masuk lagi, dan jalankan `hostname -I`. Alamat kabelnya tetap `192.168.1.37`.

> 💡 **Lebih suka menu daripada mengetik perintah panjang?** Raspberry Pi OS juga punya `sudo nmtui`, menu berbasis teks untuk NetworkManager: pilih **Edit a connection**, lalu `netplan-eth0`. Hasilnya sama dengan perintah di atas.

#### 2.4 Uji dari laptop

1. Ketik `exit` di terminal SSH sampai *prompt* laptop muncul lagi, lalu uji alamat baru **di laptop**:

   ```bash
   ping 192.168.1.37
   ```

   Di Windows, `ping` berhenti sendiri setelah empat balasan. Di macOS dan Linux, hentikan dengan **Ctrl + C**.
2. Masuk lewat alamat itu:

   ```bash
   ssh budi@192.168.1.37
   ```

   SSH bertanya lagi (`The authenticity of host '192.168.1.37 (192.168.1.37)' can't be established.`) karena laptop mencatat Pi dengan nama `gateway.local`, bukan dengan alamatnya. SSH bahkan memberi tahu bahwa kunci yang sama sudah dikenal dengan nama `gateway.local`. Jawab `yes`.
3. Tulis alamat tetap Pi di dua tempat. **Di Pi**, di `catatan-gateway.txt` dari Praktik 1: berkas itu ada di folder `latihan`, jadi bukalah dengan `nano ~/latihan/catatan-gateway.txt` (tanpa `~/latihan/`, nano membuka berkas baru yang kosong di folder rumah). **Di laptop**, di berkas baru `catatan-modul12.md` di folder **Documents → GitHub → belajar-iot → modul-12** (buat foldernya kalau belum ada), seperti `catatan-modul11.md` di Modul 11 (di VS Code: **File → New Text File**, lalu **File → Save As…** ke folder itu); berkas ini dilengkapi dan disimpan ke GitHub di ➕ F. Mulai sekarang, Node 1, MQTTX, dan pemeriksa kontrak memakai alamat ini.

> ⬆️ **Selesai Praktik 2?** Kembali ke [Konsep 7](#7-layanan-dan-systemd-satpam-yang-tidak-pernah-tidur).

### Praktik 3 — Mosquitto sebagai layanan di Pi (30 menit)

> 🖥️ **Alat:** terminal SSH ke Pi (alamat tetap dari Praktik 2) dan **MQTTX** di laptop. Konsep yang dipakai: 7 dan Konsep 3 Modul 11 (pintu 1883 dan mode lokal saja).
>
> ⭐ **Wajib** — broker inilah yang dipakai Rumah Pintar Mini mulai minggu ini.

#### 3.1 Pasang Mosquitto

1. **Di Pi**, pasang broker dan alat-alat terminalnya (`mosquitto_pub`, `mosquitto_sub`) sekaligus:

   ```bash
   sudo apt update
   ```

   ```bash
   sudo apt install mosquitto mosquitto-clients
   ```

   **Hasilnya** (contoh; daftar dan ukurannya bisa sedikit berbeda):

   ```text
   Installing:
     mosquitto  mosquitto-clients

   Installing dependencies:
     libcjson1  libdlt2  libmosquitto1  libwebsockets19t64

   Summary:
     Upgrading: 0, Installing: 6, Removing: 0, Not Upgrading: 0
     Download size: 1,062 kB
     Space needed: 3,456 kB / 25.1 GB available

   Continue? [Y/n]
   ```

   Tekan **Enter** (jawaban bawaan `Y`). `apt` mengunduh dan memasang keenam paket, lalu kembali ke *prompt*. Paket `mosquitto` dari Debian langsung **mengaktifkan** dan **menyalakan** layanannya.
2. Tanyakan keadaannya kepada satpam:

   ```bash
   systemctl status mosquitto
   ```

   **Hasilnya** (contoh):

   ```text
   ● mosquitto.service - Mosquitto MQTT Broker
        Loaded: loaded (/usr/lib/systemd/system/mosquitto.service; enabled; preset: enabled)
        Active: active (running) since Sun 2026-10-18 09:12:31 WIB; 1min 4s ago
    Invocation: 3f0c9d6a2b5e4c18a7d1e9f04b6c2a7e
          Docs: man:mosquitto.conf(5)
                man:mosquitto(8)
       Process: 803 ExecStartPre=/bin/mkdir -m 740 -p /var/log/mosquitto (code=exited, status=0/SUCCESS)
       Process: 805 ExecStartPre=/bin/chown mosquitto:mosquitto /var/log/mosquitto (code=exited, status=0/SUCCESS)
       Process: 807 ExecStartPre=/bin/mkdir -m 740 -p /run/mosquitto (code=exited, status=0/SUCCESS)
       Process: 809 ExecStartPre=/bin/chown mosquitto:mosquitto /run/mosquitto (code=exited, status=0/SUCCESS)
      Main PID: 812 (mosquitto)
         Tasks: 1 (limit: 2252)
           CPU: 47ms
        CGroup: /system.slice/mosquitto.service
                └─812 /usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf

   Oct 18 09:12:31 gateway systemd[1]: Starting mosquitto.service - Mosquitto MQTT Broker...
   Oct 18 09:12:31 gateway systemd[1]: Started mosquitto.service - Mosquitto MQTT Broker.
   ```

   Tiga hal yang perlu dilihat: `enabled` di baris `Loaded:` (ikut menyala saat Pi menyala), `active (running)` berwarna hijau di baris `Active:` (sedang berjalan), dan `Main PID:` (nomor program yang sedang berjalan; nomor ini berganti setiap kali broker dinyalakan ulang, dan Praktik 4 memanfaatkannya). Baris `Process:` adalah empat persiapan kecil sebelum broker dinyalakan, dan dua baris terakhir adalah cuplikan buku catatan satpam. *Prompt* tidak langsung kembali? Tekan **q**.

Mosquitto sudah menjadi layanan, tanpa kamu menulis satu berkas unit pun. Namun, ia masih dalam **mode lokal saja**, persis seperti saat pertama kali dijalankan di laptop pada Modul 11: hanya program di Pi sendiri yang boleh masuk. Buktikan:

3. Catatan Mosquitto di Pi disimpan di berkas yang hanya boleh dibaca kepala kantor, jadi pakai `sudo`. Tampilkan baris-baris terakhirnya:

   ```bash
   sudo tail /var/log/mosquitto/mosquitto.log
   ```

   **Hasilnya** (contoh):

   ```text
   1792289551: mosquitto version 2.0.21 starting
   1792289551: Config loaded from /etc/mosquitto/mosquitto.conf.
   1792289551: Starting in local only mode. Connections will only be possible from clients running on this machine.
   1792289551: Create a configuration file which defines a listener to allow remote access.
   1792289551: For more details see https://mosquitto.org/documentation/authentication-methods/
   1792289551: Opening ipv4 listen socket on port 1883.
   1792289551: Opening ipv6 listen socket on port 1883.
   1792289551: mosquitto version 2.0.21 running
   ```

   Sama dengan peringatan di laptop pada Praktik 1.2 Modul 11: `Starting in local only mode`.

#### 3.2 Buka pintunya untuk jaringan rumah

Di Modul 11, broker di laptop dijalankan dengan `-c mosquitto-lan.conf`. Layanan di Pi tidak memakai berkas itu; ia selalu membaca berkas pengaturan utama `/etc/mosquitto/mosquitto.conf`. **Di Pi**, lihat isinya:

```bash
cat /etc/mosquitto/mosquitto.conf
```

Berkas bawaan Debian itu menyimpan pesan *retained* ke kartu (`persistence true`), menulis catatan ke `/var/log/mosquitto/mosquitto.log` (`log_dest file …`), dan, yang terpenting, berisi baris `include_dir /etc/mosquitto/conf.d`. Artinya, setiap berkas berakhiran `.conf` di folder `conf.d` ikut dibaca. Jadi, kita tidak mengubah berkas utama; kita cukup **menambah satu berkas kecil**.

1. **Di Pi**, buat berkasnya dengan nano. Berkas ini harus ditulis dengan wewenang kepala kantor (`sudo`) karena foldernya ada di `/etc`:

   ```bash
   sudo nano /etc/mosquitto/conf.d/gateway-pi.conf
   ```

2. Ketik isi berikut, lalu simpan (**Ctrl + O**, **Enter**) dan keluar (**Ctrl + X**). Tiga baris pertama yang diawali `#` hanya catatan untuk manusia: boleh disingkat, asalkan setiap barisnya tetap diawali `#`. Dua baris terakhir harus diketik persis seperti ini:

   ```text
   # gateway-pi.conf - broker Rumah Pintar Mini di gateway Raspberry Pi (Modul 12).
   # Tempatnya di Pi: /etc/mosquitto/conf.d/gateway-pi.conf. Terbuka untuk jaringan rumah TANPA kata sandi:
   # jangan membuat port forwarding ke Pi. Gembok sungguhan dipasang di Modul 21.
   listener 1883
   allow_anonymous true
   ```

   Kedua baris itu sama dengan isi `mosquitto-lan.conf` Modul 11: `listener 1883` membuka pintu untuk semua jaringan Pi, dan `allow_anonymous true` mengizinkan klien masuk tanpa nama pengguna. Seperti di Modul 11, catatan (`#`) hanya boleh di awal baris. Berkas yang sama juga tersedia di [`proyek-rumah-pintar-mini/edge/`](../../proyek-rumah-pintar-mini/edge/gateway-pi.conf).
3. Nyalakan ulang layanannya supaya berkas baru terbaca:

   ```bash
   sudo systemctl restart mosquitto
   ```

   Tidak ada kabar berarti kabar baik: `systemctl` hanya bersuara kalau gagal. Jangan memakai `reload` untuk perubahan ini: Mosquitto tidak bisa membuka pintu baru tanpa dinyalakan ulang. Periksa:

   ```bash
   systemctl status mosquitto
   ```

   `Active:` harus kembali `active (running)`, dengan `Main PID` yang baru. Muncul `failed`? Buka "Mosquitto `failed` setelah berkas pengaturan diubah" di 🚨.
4. Lihat lagi catatannya:

   ```bash
   sudo tail /var/log/mosquitto/mosquitto.log
   ```

   **Hasilnya** (contoh, baris-baris paling bawah):

   ```text
   1792289860: mosquitto version 2.0.21 terminating
   1792289860: Saving in-memory database to /var/lib/mosquitto//mosquitto.db.
   1792289860: mosquitto version 2.0.21 starting
   1792289860: Config loaded from /etc/mosquitto/mosquitto.conf.
   1792289860: Opening ipv4 listen socket on port 1883.
   1792289860: Opening ipv6 listen socket on port 1883.
   1792289860: mosquitto version 2.0.21 running
   ```

   Peringatan `local only mode` hilang: pintu 1883 kini terbuka untuk jaringan rumah. Perhatikan juga baris `Saving in-memory database`: sebelum berhenti, broker menyimpan pesan *retained* ke kartu sehingga papan pengumumannya tidak kosong setelah dinyalakan ulang. (Garis miring ganda `//` di jalurnya memang begitu ditulis Mosquitto; tidak berbahaya.)

> 🔒 **Ingat aturan aman nomor 2.** Broker di Pi kini terbuka untuk siapa pun yang tersambung ke jaringan rumahmu, tanpa kata sandi. Bedanya dengan laptop, Pi tidak pernah dibawa ke WiFi umum, jadi aturan "matikan sebelum ke kafe" tidak berlaku lagi. Yang tetap berlaku: **jangan pernah** membuat *port forwarding* ke Pi di router. Gembok sungguhan dipasang di Modul 21.

#### 3.3 Uji dari Pi sendiri dan dari laptop

1. **Di Pi**, jadilah pelanggan topik latihan. Perintah ini terus berjalan dan menunggu pesan:

   ```bash
   mosquitto_sub -h localhost -v -t "latihan/#"
   ```

2. **Di laptop**, buka MQTTX dan buat sambungan baru lewat ikon **+** di bilah paling kiri, seperti di Praktik 2.3 Modul 11. Isi **Name** dengan `Gateway Pi` dan **Host** dengan alamat tetap Pi, misalnya `192.168.1.37` (biarkan `mqtt://` di depannya); **Port** tetap `1883`. Klik **Connect** di kanan atas, lalu tunggu sampai nama **Gateway Pi** berwarna hijau. Sambungan lama **Broker laptop** boleh dibiarkan; setelah broker laptop pensiun di bagian ➕, ia memang tidak akan tersambung lagi.
3. Di kotak kirim MQTTX, pilih **Plaintext**, isi **Topic** dengan `latihan/halo`, ketik `Halo gateway!`, lalu klik tombol kirim (ikon pesawat kertas), seperti Praktik 2.3 Modul 11.
4. Terminal SSH yang menjalankan `mosquitto_sub` langsung mencetak:

   ```text
   latihan/halo Halo gateway!
   ```

   Pesan dari laptop sampai ke Pi lewat broker di Pi. Hentikan `mosquitto_sub` dengan **Ctrl + C**.

Belum tersambung? Buka "MQTTX atau Node 1 tidak bisa tersambung ke broker di Pi" di 🚨.

### Praktik 4 — Uji: layanan bangkit sendiri (20 menit)

> 🖥️ **Alat:** terminal SSH ke Pi dan **MQTTX** yang tersambung ke **Gateway Pi**. Konsep yang dipakai: 7.
>
> ⭐ **Wajib** — inilah janji "gateway yang selalu hidup".

#### 4.1 Janji pertama: menyala sendiri saat Pi menyala

1. **Di Pi**, pastikan Mosquitto ada di daftar tugas pagi:

   ```bash
   systemctl is-enabled mosquitto
   ```

   **Hasilnya:** `enabled`.
2. Nyalakan ulang seluruh Pi:

   ```bash
   sudo reboot
   ```

3. Perhatikan MQTTX: sambungan **Gateway Pi** terputus, dan namanya tidak lagi hijau. Tunggu sekitar satu menit, lalu klik **Connect** lagi. MQTTX tersambung **tanpa kamu mengetik apa pun di Pi**: satpam sudah menyalakan broker saat Pi menyala.

#### 4.2 Janji kedua: bangkit sendiri setelah *crash*

Kita akan "membunuh" Mosquitto dengan paksa, seperti program yang tiba-tiba mogok.

1. **Di Pi** (masuk lagi lewat SSH), lihat aturan bangkit di berkas unitnya dan catat nomor programnya:

   ```bash
   systemctl cat mosquitto
   ```

   Di antara isinya ada baris `Restart=on-failure`: "kalau programnya mati karena gagal, nyalakan lagi". Lalu:

   ```bash
   systemctl show -p MainPID mosquitto
   ```

   **Hasilnya** (contoh): `MainPID=812`.
2. Matikan paksa, persis seperti program yang mogok mendadak:

   ```bash
   sudo systemctl kill --signal=KILL mosquitto
   ```

3. Tunggu dua detik, lalu tanyakan lagi:

   ```bash
   systemctl show -p MainPID mosquitto
   ```

   **Hasilnya** (contoh): `MainPID=1407`. Nomornya **berbeda**: broker yang lama mati, dan satpam sudah menyalakan yang baru. `systemctl status mosquitto` juga menunjukkan `active (running)` dengan `since` beberapa detik yang lalu.
4. Lihat kejadiannya di buku catatan satpam:

   ```bash
   journalctl -u mosquitto -n 6
   ```

   **Hasilnya** (contoh):

   ```text
   Oct 18 09:31:07 gateway systemd[1]: mosquitto.service: Main process exited, code=killed, status=9/KILL
   Oct 18 09:31:07 gateway systemd[1]: mosquitto.service: Failed with result 'signal'.
   Oct 18 09:31:07 gateway systemd[1]: mosquitto.service: Scheduled restart job, restart counter is at 1.
   Oct 18 09:31:07 gateway systemd[1]: Starting mosquitto.service - Mosquitto MQTT Broker...
   Oct 18 09:31:07 gateway mosquitto[1407]: 1792290667: Loading config file /etc/mosquitto/conf.d/gateway-pi.conf
   Oct 18 09:31:07 gateway systemd[1]: Started mosquitto.service - Mosquitto MQTT Broker.
   ```

   Baca dari atas: program utama mati dibunuh (`status=9/KILL`), satpam mencatatnya sebagai gagal (`'signal'`), menjadwalkan bangkit ulang yang pertama (`restart counter is at 1`), lalu menyalakannya lagi. Semuanya dalam waktu kurang dari satu detik.
5. Di MQTTX, sambungan **Gateway Pi** mungkin terputus sesaat. Kalau setelah beberapa detik namanya belum hijau lagi, klik **Connect**.

> 💡 **Kenapa `systemctl stop` tidak membuat broker bangkit lagi?** Berhenti atas perintahmu bukan "gagal". Satpam hanya membangunkan layanan yang tumbang sendiri. Mau lebih galak, misalnya selalu bangkit apa pun penyebabnya? Itu 🧩 Tingkat 2.

### Praktik 5 — Membaca catatan (20 menit)

> 🖥️ **Alat:** terminal SSH ke Pi dan **MQTTX**. Konsep yang dipakai: 7.
>
> ⭐ **Wajib** — syarat lulus Modul 12 meminta kamu bisa membaca catatan gateway lewat SSH.

#### 5.1 Buku catatan satpam: `journalctl`

1. **Di Pi**, tampilkan catatan layanan Mosquitto:

   ```bash
   journalctl -u mosquitto
   ```

   Gulir dengan panah, keluar dengan **q**. Isinya hanya kejadian **layanan**: kapan dinyalakan, dihentikan, atau gagal, ditambah baris `Loading config file …` yang ditulis Mosquitto sesaat sebelum catatannya sendiri siap. Siapa yang masuk ke broker tidak dicatat di sini (5.2).
2. Tampilkan yang terbaru saja, misalnya dua puluh baris terakhir atau catatan sejak 10 menit lalu:

   ```bash
   journalctl -u mosquitto -n 20
   ```

   ```bash
   journalctl -u mosquitto --since "10 min ago"
   ```

3. Tampilkan semua kesalahan sejak Pi terakhir menyala, dari layanan apa pun:

   ```bash
   journalctl -b -p err
   ```

   Tidak ada kesalahan? Hasilnya `-- No entries --`. Muncul beberapa baris merah? Jangan panik: di Pi yang sehat pun sering ada satu-dua baris dari *kernel* tentang perangkat yang tidak dipakai. Yang perlu dicermati adalah baris yang menyebut `mosquitto`, atau baris yang terus bertambah setiap kali perintah ini diulang.
4. Coba lihat catatan dari **sebelum** Pi dinyalakan ulang di Praktik 4.1:

   ```bash
   journalctl -b -1
   ```

   **Hasilnya:** `Specifying boot ID or boot offset has no effect, no persistent journal was found.` Inilah yang dimaksud Konsep 7: di Raspberry Pi OS, buku catatan satpam disimpan di memori dan hilang setiap kali Pi menyala ulang. Cara menyimpannya ke kartu ada di 🔬.

#### 5.2 Catatan Mosquitto sendiri: `mosquitto.log`

1. **Di Pi**, ikuti catatan secara langsung (*follow*):

   ```bash
   sudo tail -f /var/log/mosquitto/mosquitto.log
   ```

2. **Di laptop**, putuskan lalu sambungkan lagi MQTTX: klik ikon tombol daya (**Disconnect**) di kanan atas sambungan **Gateway Pi**, lalu **Connect**. Di terminal SSH, baris-baris baru muncul seketika. **Hasilnya** (contoh):

   ```text
   1792291013: Client mqttx_3f9a1c2b disconnected.
   1792291016: New connection from 192.168.1.10:53120 on port 1883.
   1792291016: New client connected from 192.168.1.10:53120 as mqttx_3f9a1c2b (p5, c1, k60).
   ```

   Baris kedua dan ketiga menyebut alamat dan nomor port laptop, nama klien MQTTX (`mqttx_…`), dan tiga keterangan di dalam kurung: `p5` berarti MQTT versi 5 (MQTTX memakainya secara bawaan; Node 1 memakai MQTT 3.1.1, tercatat `p2`), `c1` berarti sesi bersih (*clean session*, Konsep 6 Modul 11), dan `k60` berarti *keep-alive* 60 detik (Node 1: `k15`).
3. Hentikan dengan **Ctrl + C**.

Satu catatan untuk yang membandingkan dengan laptop: Mosquitto 2.0.21 di Pi menulis `Client … disconnected.` (klien pamit baik-baik), `Client … closed its connection.` (sambungan ditutup tanpa pamit), dan `Client … has exceeded timeout, disconnecting.` (klien diam lebih dari 1,5 kali *keep-alive*, Konsep 7 Modul 11). Mosquitto 2.1.2 di laptop menulis hal yang sama dengan kata-kata yang sedikit berbeda dan alamat klien di dalam kurung siku.

Angka di depan setiap baris adalah jam Mosquitto, dihitung dalam detik sejak 1 Januari 1970 (Konsep 6 Modul 10), sama seperti di laptop. Untuk membacanya, minta Linux **di Pi** menerjemahkannya (perintah ini tidak jalan di PowerShell maupun Terminal Mac):

```bash
date -d @1792291016 "+%Y-%m-%d %H:%M:%S"
```

**Hasilnya:** `2026-10-18 09:36:56`, dalam zona waktu yang kamu pilih di Imager. Bagian `-d @…` berarti "tanggal dari angka detik ini", dan bagian dalam petik ganda adalah bentuk tulisannya: tahun-bulan-tanggal jam:menit:detik. Membuat Mosquitto langsung mencetak jam yang mudah dibaca adalah 🧩 Tingkat 1.

> ⬆️ **Selesai Praktik 3–5?** Kembali ke [Konsep 8](#8-merawat-gateway-kartu-microsd-listrik-dan-cadangan).

### Praktik 6 — Merawat gateway (30 menit)

> 🖥️ **Alat:** terminal SSH ke Pi dan **VS Code** dengan folder `rumah-pintar-mini` di laptop. Konsep yang dipakai: 8.

#### 6.1 Pemeriksaan bulanan dalam lima perintah

**Di Pi**, jalankan satu per satu dan bandingkan dengan catatan Praktik 1 (`cat ~/latihan/catatan-gateway.txt`):

| Perintah | Yang diperiksa | Jawaban sehat | Tanda bahaya |
| :--- | :--- | :--- | :--- |
| `vcgencmd get_throttled` | Pernah kekurangan tegangan atau kepanasan sejak menyala? | `throttled=0x0` | angka selain `0x0` (tabel di bawah) |
| `vcgencmd measure_temp` | Suhu prosesor sekarang | misalnya `temp=48.3'C` | terus-menerus di atas 80 °C: periksa pendingin |
| `df -h /` | Sisa ruang kartu | `Use%` di bawah 80 % | `Use%` di atas 80 % |
| `systemctl list-units --failed` | Ada layanan yang gagal? | `0 loaded units listed.` | ada baris layanan bertanda `failed` |
| `uptime -p` | Pi menyala ulang tanpa sepengetahuanmu? | sesuai perkiraanmu | angkanya jauh lebih kecil daripada yang kamu kira |

**Membaca `get_throttled`.** Angkanya adalah kumpulan bendera. Empat yang paling penting:

| Bendera | Artinya |
| :--- | :--- |
| `0x1` | tegangan **sedang** kurang (*undervoltage*) |
| `0x4` | prosesor **sedang** diperlambat |
| `0x10000` | tegangan **pernah** kurang sejak Pi menyala |
| `0x40000` | prosesor **pernah** diperlambat sejak Pi menyala |

Bendera-bendera itu dijumlahkan. Misalnya, `throttled=0x50005` berarti tegangan sedang kurang dan prosesor sedang diperlambat, dan keduanya juga sudah pernah terjadi sebelumnya; `0x50000` berarti pernah terjadi, tetapi sekarang sudah normal. Bendera tegangan (`0x1`, `0x10000`) hampir selalu berarti adaptor atau kabel USB-C kurang kuat: ganti dengan adaptor resmi. Bendera perlambatan tanpa bendera tegangan biasanya berarti Pi kepanasan: periksa pendinginnya (🚨).

Terakhir, perbarui seperti di Praktik 1.4: `sudo apt update`, lalu `sudo apt full-upgrade`.

#### 6.2 Mencadangkan pengaturan gateway ke laptop

Berkas yang benar-benar kamu ubah di Pi minggu ini hanya satu: `/etc/mosquitto/conf.d/gateway-pi.conf`. Kita menyalinnya ke repositori `rumah-pintar-mini`, di folder `edge`, tempat `mosquitto-lan.conf` juga disimpan. Alatnya adalah **`scp`** (*secure copy*), saudara SSH untuk menyalin berkas, yang juga sudah ada di Windows dan macOS.

1. **Di laptop**, buka terminal VS Code di folder `rumah-pintar-mini` (**Terminal → New Terminal**), lalu salin berkas dari Pi:

   ```bash
   scp budi@192.168.1.37:/etc/mosquitto/conf.d/gateway-pi.conf edge/
   ```

   Pola `scp` selalu **dari** lalu **ke**: `budi@192.168.1.37:/etc/…/gateway-pi.conf` adalah berkas di Pi (alamat, titik dua, lalu jalur berkasnya), dan `edge/` adalah folder di laptop. Masukkan kata sandi Pi saat diminta. Berkas ini boleh dibaca semua pengguna Pi, jadi tidak perlu `sudo`.
2. Berkas `edge/gateway-pi.conf` kini muncul di **Explorer** VS Code. Buka dan pastikan isinya sama dengan yang kamu ketik di Praktik 3.2.

Kalau suatu hari kartu microSD rusak, berkas ini ditambah resep di bagian ➕ E sudah cukup untuk membangun ulang gateway dari kartu kosong. Salinan utuh kartu tetap boleh dibuat sebagai lapisan kedua; caranya ada di 🔬.

#### 6.3 Mematikan dan menyalakan Pi dengan benar

1. **Di Pi**:

   ```bash
   sudo poweroff
   ```

   Sambungan SSH langsung putus.
2. Tunggu tanda aman dari lampunya (Konsep 8). Di **Pi 4**, lampu hijau berkedip pendek beberapa kali lalu padam (lampu merahnya boleh tetap menyala); di **Pi 5**, lampu status STAT di samping tombol daya berubah **merah**. Baru setelah itu cabut adaptornya.
3. Untuk menyalakan lagi di **Pi 4**, cabut lalu colokkan lagi adaptornya. Di **Pi 5**, kalau adaptornya masih tercolok, cukup tekan tombol dayanya sekali; kalau sudah dicabut, Pi menyala sendiri begitu adaptor dicolokkan. Di Pi 5, menekan tombol daya sekali saat Pi menyala juga mematikannya dengan rapi, sama seperti `sudo poweroff`. Menahan tombol itu lama memaksa Pi mati seketika; pakai cara ini hanya kalau Pi benar-benar macet. Sekarang, nyalakan lagi Pi-mu dengan cara di atas, tunggu sekitar satu menit, lalu klik **Connect** pada sambungan **Gateway Pi** di MQTTX: 🧩 dan ➕ memakai Pi yang menyala.

Biasakan urutan ini setiap kali Pi perlu dipindahkan atau dibersihkan, atau saat listrik rumah akan dimatikan. Kalau listrik padam tiba-tiba, tidak perlu panik: nyalakan lagi, lalu jalankan pemeriksaan 6.1.

> ➡️ **Selesai Praktik 6?** Kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) (minimal Tingkat 1), lalu [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini). Praktik 7 hanya untuk jalur laptop.

### Praktik 7 — Jalur laptop: Mosquitto sebagai layanan (30 menit)

> 🖥️ **Alat:** laptop dengan Mosquitto dari Praktik 1 Modul 11, izin administrator, dan **MQTTX**. Konsep yang dipakai: 7.
>
> Kerjakan praktik ini **hanya kalau kamu belum punya Raspberry Pi**. Laptopmu menjadi gateway sementara, dengan kriteria lulus alternatif dari Silabus: Mosquitto berjalan sebagai layanan tanpa membuka terminal. Laptop yang tidur atau dimatikan tetap mematikan broker; ini jalan tengah sampai Kit B datang. Seperti gateway Pi (Konsep 6), laptop ini juga butuh alamat yang tidak berganti karena Node 1 menyimpannya di `ALAMAT_BROKER`: pesan alamat laptopmu di router seperti Cara A (Praktik 2.2), memakai alamat MAC dan alamat IP laptop yang tercantum di daftar perangkat router (Praktik 9.2 Modul 10). Router tidak bisa dibuka? Lewati pemesanan ini, tetapi setiap kali MQTTX atau Node 1 gagal tersambung, periksa dulu alamat laptopmu seperti langkah 5 Praktik 7.1, lalu perbarui **Host** di MQTTX dan `ALAMAT_BROKER` Node 1 kalau alamatnya berubah.

**Sebelum mulai:** hentikan broker yang masih berjalan di terminal VS Code dengan **Ctrl + C**. Dua broker tidak bisa memakai pintu 1883 bersamaan (🚨 Modul 11, "Dua broker berjalan bersamaan").

#### 7.1 Windows

Di Modul 11, kamu sengaja menghilangkan centang **Service** di penginstal. Kini kita memasangnya. Layanan Mosquitto di Windows **selalu** membaca berkas `mosquitto.conf` di folder instalasinya, jadi pengaturan LAN harus ditulis di sana.

1. **Di laptop**, buka **Terminal sebagai administrator**: klik kanan tombol **Start** → **Terminal (Admin)** (Windows 10: **Windows PowerShell (Admin)**), lalu jawab **Yes**. Masuk ke folder Mosquitto:

   ```powershell
   cd "C:\Program Files\Mosquitto"
   ```

2. Simpan dulu salinan berkas bawaannya, lalu buka berkas itu dengan Notepad (yang ikut berjalan sebagai administrator sehingga boleh menyimpan di folder ini):

   ```powershell
   copy mosquitto.conf mosquitto.conf.asli
   ```

   ```powershell
   notepad mosquitto.conf
   ```

3. Berkas ini panjang, berisi ratusan baris catatan berawalan `#`. Tekan **Ctrl + End** untuk melompat ke **paling bawah**, tambahkan tiga baris berikut di sana, lalu simpan (**Ctrl + S**) dan tutup Notepad:

   ```text
   listener 1883
   allow_anonymous true
   log_dest file C:\Program Files\Mosquitto\mosquitto.log
   ```

   Dua baris pertama sama dengan `mosquitto-lan.conf`. Baris ketiga penting di Windows: layanan Mosquitto **tidak mencatat apa pun** kecuali diberi tahu tempat menulis catatannya. Izin *firewall* untuk `mosquitto.exe` dari Praktik 1.4 Modul 11 tetap berlaku karena programnya sama.
4. Daftarkan Mosquitto sebagai layanan, lalu nyalakan:

   ```powershell
   .\mosquitto install
   ```

   ```powershell
   net start mosquitto
   ```

   **Hasilnya:** `.\mosquitto install` tidak mencetak apa-apa kalau berhasil, lalu `net start mosquitto` menulis `The Mosquitto Broker service is starting.` dan `The Mosquitto Broker service was started successfully.` (di Windows berbahasa lain, kalimatnya mengikuti bahasa Windows-mu). Layanan bernama **Mosquitto Broker** kini terdaftar dengan jenis penyalaan (*startup type*) **Automatic**: ia menyala sendiri setiap kali Windows menyala. Kamu bisa melihatnya di aplikasi **Services** (tekan **Win + R**, ketik `services.msc`, lalu tekan **Enter**). Muncul `Error: …`, `Access is denied`, atau `could not be started`? Buka "Jalur laptop: layanan Mosquitto tidak mau menyala" di 🚨.
5. Uji: tutup VS Code, lalu di MQTTX sambungkan **Lewat IP laptop**, yaitu sambungan ke alamat IP laptopmu dari Praktik 2.4 Modul 11 (sudah terhapus? buat lagi lewat ikon **+**). Periksa dulu apakah alamat laptopmu masih sama dengan **Host** sambungan itu: jalankan `ipconfig` di Windows atau `ipconfig getifaddr en0` di macOS (Praktik 1.5 Modul 11), dan kalau berbeda, ubah **Host**-nya lewat pilihan **Edit** sambungan itu. Jangan memakai **Broker laptop**: alamatnya `127.0.0.1`, jadi sambungan itu tetap berhasil walaupun broker belum membuka pintu untuk jaringan. Tambahkan langganan `latihan/#` (**New Subscription**), lalu kirim `Halo layanan!` ke topik `latihan/halo` dengan format **Plaintext**: pesan itu muncul lagi sebagai pesan masuk. Lalu nyalakan ulang laptop, dan tanpa membuka terminal apa pun, sambungkan MQTTX lagi: broker sudah menunggu.

Catatan layanan ditulis ke `C:\Program Files\Mosquitto\mosquitto.log`, tetapi Mosquitto membuat berkas itu hanya bisa dibaca akun sistem Windows yang menjalankan layanan. Ingat juga dua keterbatasan layanan Windows ini: ia **tidak** bangkit sendiri setelah *crash* (penginstal Mosquitto tidak memberi Windows aturan itu), dan ia berhenti saat laptop tidur. Tiga hal berikut mungkin kamu perlukan kelak; perintah `net` dan `.\mosquitto` di dalamnya diketik di Terminal (Admin), dari folder `C:\Program Files\Mosquitto`:

- **Melihat catatan:** hentikan layanannya sebentar dengan `net stop mosquitto`. Lalu jalankan broker persis seperti Modul 11 di terminal VS Code: `cd edge`, lalu `mosquitto -v -c mosquitto-lan.conf`. Jangan memakai `mosquitto.conf` dari folder instalasi untuk ini: baris `log_dest file` di dalamnya membuat semua catatan masuk ke berkas, bukan ke layar, walaupun ada pilihan `-v`. Selesai mengamati, tekan **Ctrl + C** di terminal VS Code, lalu jalankan `net start mosquitto` lagi di Terminal (Admin).
- **Mengubah pengaturan:** ubah `mosquitto.conf` dengan Notepad seperti langkah 2, lalu jalankan `net stop mosquitto` dan `net start mosquitto`.
- **Membongkar layanan:** jalankan `net stop mosquitto`, lalu `.\mosquitto uninstall`.

#### 7.2 macOS

Homebrew bisa menjadikan Mosquitto layanan yang menyala setiap kali kamu masuk ke Mac.

1. **Di laptop**, buka berkas pengaturan Homebrew di Terminal (Mac dengan chip Apple; Mac Intel: ganti `/opt/homebrew` dengan `/usr/local`):

   ```bash
   nano /opt/homebrew/etc/mosquitto/mosquitto.conf
   ```

2. Berkas ini juga panjang. Lompat ke baris terakhir dengan **Ctrl + W**, lalu **Ctrl + V**, tambahkan dua baris berikut di **paling bawah**, lalu simpan (**Ctrl + O**, **Enter**) dan keluar (**Ctrl + X**):

   ```text
   listener 1883
   allow_anonymous true
   ```

3. Nyalakan layanannya:

   ```bash
   brew services start mosquitto
   ```

   Homebrew menjalankan Mosquitto sekarang juga dan mendaftarkannya supaya menyala setiap kali kamu masuk (*login*). Periksa dengan `brew services list`: baris `mosquitto` harus berstatus `started`.
4. Uji seperti di Windows langkah 5. Untuk mematikan dan mencoretnya dari daftar: `brew services stop mosquitto`. Sama seperti di Windows, layanan ini tidak bangkit sendiri setelah *crash*.

#### 7.3 Linux (Ubuntu, Debian)

Laptop Linux memakai paket dan systemd yang sama dengan Raspberry Pi. Di Modul 11, kamu mematikan layanannya dengan `sudo systemctl disable --now mosquitto`. Kini kebalikannya: buat `/etc/mosquitto/conf.d/gateway-pi.conf` seperti Praktik 3.2, jalankan `sudo systemctl enable --now mosquitto`, lalu uji seperti Praktik 4. Di Ubuntu, versi Mosquitto dan beberapa tulisan di catatannya sedikit berbeda, tetapi langkahnya sama.

> ➡️ **Selesai Praktik 7?** Kerjakan [🧩 Tantangan mandiri](#-tantangan-mandiri) sesuai catatan jalur laptop di awalnya, lalu [➕ Tambahan ke "Rumah Pintar Mini"](#-tambahan-ke-rumah-pintar-mini) dengan alamat laptopmu sebagai `ALAMAT_BROKER`.

---

## 🚨 Kalau Tidak Jalan?

Masalah minggu ini hampir selalu bisa dilacak dengan tiga pertanyaan, berurutan: **Apakah Pi menyala dan tersambung ke jaringan?** (lampu, `ping`) → **Apakah aku bisa masuk?** (SSH) → **Apakah layanannya berjalan?** (`systemctl status`, catatan). Klik judul masalah untuk membuka penjelasannya.

**Tutorial lama vs Raspberry Pi OS Trixie.** Banyak tutorial Raspberry Pi di internet ditulis untuk versi lama. Kalau sebuah tutorial menyuruhmu melakukan sesuatu di kolom kiri, pakai cara di kolom kanan:

| Tutorial lama menyuruh… | Yang benar untuk versi kita |
| :--- | :--- |
| Masuk dengan pengguna `pi` dan kata sandi `raspberry` | Tidak ada lagi pengguna bawaan. Pengguna dibuat di Imager, layar **Choose username** (Kemenangan Cepat langkah 2). |
| Menaruh berkas kosong bernama `ssh` di kartu untuk menyalakan SSH | Nyalakan **Enable SSH** di Imager, layar **SSH authentication**. |
| Menaruh `wpa_supplicant.conf` di kartu untuk WiFi | Isi WiFi di Imager, layar **Choose Wi-Fi**; sesudahnya, atur dengan `nmcli` atau `nmtui`. |
| Mengubah `/etc/dhcpcd.conf` untuk alamat tetap | Pemesanan alamat di router, atau `nmcli connection modify` (Praktik 2). |
| Mengubah `/boot/config.txt` | Berkasnya kini `/boot/firmware/config.txt` (minggu ini tidak perlu diubah). |
| `ifconfig` dan `iwconfig` | `ip a`, `hostname -I`, dan `nmcli`. |
| `sudo service mosquitto restart` | `sudo systemctl restart mosquitto` (`service` masih bekerja, tetapi `systemctl` adalah cara yang dipakai di mana-mana). |
| "`sudo` tidak pernah menanyakan kata sandi di Raspberry Pi" | Sejak April 2026, `sudo` menanyakan kata sandimu (Konsep 5). |
| Membaca `/var/log/syslog` | Berkas itu tidak ada di Raspberry Pi OS Lite. Pakai `journalctl` dan `/var/log/mosquitto/mosquitto.log` (Praktik 5). |
| `sudo rpi-update` untuk "memperbarui" Pi | **Jangan.** Itu memasang firmware percobaan. Pembaruan biasa cukup `sudo apt update` lalu `sudo apt full-upgrade`. |
| Ikon roda gigi atau **Ctrl + Shift + X** di Imager untuk pengaturan | Imager 2.x menanyakannya langsung sebagai langkah **Customisation**. |

<details>
<summary><b>Windows menawarkan untuk memformat kartu (<code>You need to format the disk…</code>)</b></summary>

Tawaran ini muncul saat kartu yang sudah ditulis dicolokkan lagi ke laptop, atau sesaat setelah Imager selesai. Klik **Cancel**. **Jangan pernah** klik **Format disk**. Kartu Raspberry Pi punya dua bagian: bagian kecil `bootfs` yang bisa dibaca Windows, dan bagian besar berformat Linux (ext4) yang tidak bisa dibaca Windows. Windows mengira bagian kedua itu rusak, padahal isinya justru sistem operasi Pi.

</details>

<details>
<summary><b>Imager tidak menampilkan kartu, atau penulisan gagal</b></summary>

- **`No storage devices found`:** cabut dan colokkan lagi pembaca kartunya, coba colokan USB lain, atau pembaca kartu lain. Adaptor microSD-ke-SD punya sakelar kunci kecil di sisinya; geser ke arah berlawanan dengan tulisan "LOCK". Di Windows, Imager harus dibuka dengan izin administrator (jawab **Yes** saat ditanya).
- **Kartu muncul, tetapi ukurannya jauh di bawah labelnya** (misalnya 2 GB untuk kartu 32 GB): kartunya kemungkinan rusak; kembalikan ke penjual. Kartu palsu justru biasanya menampilkan ukuran sesuai labelnya, lalu diam-diam membuang data yang melebihi isi aslinya, sering baru ketahuan berminggu-minggu kemudian. Karena itu, belilah kartu di toko resmi.
- **`Write failed: …` atau pemeriksaan (*verify*) gagal:** ulangi sekali. Kalau gagal lagi di tempat yang sama, ganti kartunya; kartu yang tidak lolos pemeriksaan tidak layak untuk gateway 24 jam.
- **Telanjur mengeklik SKIP CUSTOMISATION** atau lupa mengisi pengguna dan SSH: tulis ulang kartu dari awal. Lebih cepat daripada mencari cara memperbaikinya.

</details>

<details>
<summary><b><code>ping gateway.local</code> tidak menemukan Pi</b></summary>

Pesannya di Windows `Ping request could not find host gateway.local. Please check the name and try again.`, dan di macOS `ping: cannot resolve gateway.local: Unknown host`. Periksa berurutan:

1. **Sudah menunggu cukup lama?** Penyalaan pertama butuh 2–5 menit. Tunggu, lalu coba lagi.
2. **Lampu Pi.** Pi 4: lampu merah menyala berarti listrik masuk, dan lampu hijau berkedip berarti Pi sedang membaca kartu. Pi 5: lampu status STAT di samping tombol daya berkedip hijau saat membaca kartu, dan merah kalau Pi sedang tidur. Setelah 5 menit, lampu hijau belum pernah berkedip sama sekali? Kartunya tidak terbaca: pastikan kartu tertancap penuh, atau tulis ulang.
3. **Lampu colokan LAN** di Pi dan di router menyala? Kalau tidak, ganti kabel atau colokan router.
4. **Laptop di jaringan yang sama?** Laptop yang tersambung ke WiFi tamu, *hotspot* HP, atau VPN tidak bisa melihat Pi. Matikan VPN-nya dulu.
5. **Windows:** pakai `ping -4 gateway.local`. Tanpa `-4`, Windows kadang menjawab dengan alamat IPv6 yang panjang (diawali `fe80::`).
6. **Cari alamatnya lewat router:** daftar perangkat di halaman admin router (Praktik 9.2 Modul 10) menampilkan nama `gateway` beserta alamatnya. Aplikasi HP pemindai jaringan seperti Fing juga bisa menemukannya. Setelah itu, pakai alamatnya langsung: `ping 192.168.1.37`, `ssh budi@192.168.1.37`.
7. **Nama host salah ketik di Imager?** Router akan menampilkan nama yang kamu ketik, misalnya `gatway`. Kalau nama host tidak diisi sama sekali, namanya `raspberrypi`.

</details>

<details>
<summary><b>SSH menolak: <code>Connection refused</code>, <code>Connection timed out</code>, atau <code>Permission denied</code></b></summary>

| Pesan (potongan) | Artinya | Obatnya |
| :--- | :--- | :--- |
| `Connection refused` | Pi terjangkau, tetapi tidak ada layanan SSH yang menjawab. | Pada penyalaan pertama, SSH baru dinyalakan paling akhir, setelah Pi selesai memperbarui katalog paketnya, sedangkan `ping` sudah dijawab lebih dulu: tunggu 2–3 menit, lalu coba lagi. Masih ditolak setelah 10 menit? SSH belum dinyalakan di Imager (layar **SSH authentication**): tulis ulang kartu dengan **Enable SSH** menyala. |
| `Connection timed out` | Tidak ada yang menjawab sama sekali. | Alamatnya salah, Pi mati, atau laptop di jaringan lain. Kembali ke `ping`. |
| `Permission denied, please try again.` | Nama pengguna atau kata sandi salah. | Ingat: saat mengetik kata sandi di SSH, **tidak ada yang tampil di layar**. Ketik pelan-pelan lalu tekan **Enter**. Periksa juga nama penggunanya: `budi@…`, huruf kecil. |
| `Could not resolve hostname gateway.local` | Nama `.local` tidak ditemukan. | Lihat "`ping gateway.local` tidak menemukan Pi" di atas, atau pakai alamat IP. |
| `ssh : The term 'ssh' is not recognized…` (Windows) | Windows-mu belum punya OpenSSH Client. | Buka **Settings → System → Optional features** (Windows 10 dan Windows 11 versi lama: **Settings → Apps → Optional features**), tambahkan **OpenSSH Client**, lalu buka Terminal baru. |

Lupa kata sandi Pi? Cara paling sederhana untuk pemula: tulis ulang kartu dengan Imager, lalu bangun lagi gateway-mu dari resep di `edge/README.md` (bagian ➕ E).

</details>

<details>
<summary><b><code>WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!</code></b></summary>

SSH menolak menyambung karena sidik jari Pi berbeda dengan yang tercatat di laptop (Konsep 4). Pesannya diakhiri `Host key verification failed.` Di rumah, penyebabnya hampir selalu kartu yang baru saja ditulis ulang: Pi membuat kunci baru pada penyalaan pertamanya. Hapus catatan lama **di laptop**, untuk nama dan alamatnya sekaligus:

```bash
ssh-keygen -R gateway.local
```

```bash
ssh-keygen -R 192.168.1.37
```

Lalu sambungkan lagi dan jawab `yes`. Kalau kamu **tidak** baru saja menulis ulang kartu dan pesan ini muncul, berhenti dulu dan periksa: mungkin ada perangkat lain yang memakai alamat Pi (lihat "Alamat bentrok" di bawah).

</details>

<details>
<summary><b><code>apt</code> menunggu atau gagal: <code>Could not get lock /var/lib/dpkg/lock-frontend</code></b></summary>

Ada program lain yang sedang memasang atau memperbarui paket, misalnya `apt` di jendela SSH lain, atau pemasangan otomatis sesaat setelah Pi pertama kali menyala. `apt` biasanya menunggu sendiri sebentar sambil menulis `Waiting for cache lock …`; kalau ia menyerah, tunggu beberapa menit, lalu ulangi perintahmu. **Jangan menghapus berkas *lock*** atas saran tutorial di internet: itu bisa merusak daftar paket yang sedang ditulis.

</details>

<details>
<summary><b>Pi tidak bisa dihubungi setelah mengubah alamat (Cara B)</b></summary>

Penyebabnya biasanya salah ketik di `nmcli connection modify`: alamat di blok lain, `/24` terlupa, atau alamat router salah.

1. **Masuk lewat jalan cadangan WiFi:** `ssh budi@gateway.local` karena nama itu tetap diumumkan lewat WiFi. Periksa dengan `nmcli device status` dan `ip -4 addr show eth0`.
2. **Kembalikan kabel ke alamat pinjaman (DHCP)** dengan dua perintah ini **di Pi**:

   ```bash
   sudo nmcli connection modify "netplan-eth0" ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
   ```

   ```bash
   sudo nmcli connection up "netplan-eth0"
   ```

   Lalu ulangi Praktik 2.3 dengan teliti.
3. **Tanpa WiFi?** Sambungkan monitor dan papan ketik ke Pi untuk memperbaikinya (layar masuknya bahkan menulis `My IP address is …`), atau tulis ulang kartu dan bangun lagi dari resep.

</details>

<details>
<summary><b>Alamat bentrok: Pi kadang terjangkau, kadang tidak</b></summary>

Tanda-tandanya: SSH dan MQTTX tersambung lalu putus tanpa pola, `ping` kadang berhasil, kadang tidak, atau SSH tiba-tiba memperingatkan `REMOTE HOST IDENTIFICATION HAS CHANGED!`, padahal kartunya tidak ditulis ulang. Kemungkinan besar ada perangkat lain yang mendapat alamat yang sama dari router (Cara B, Konsep 6). Obatnya: pindah ke **Cara A** kalau router bisa dibuka, atau pilih alamat lain di luar rentang pinjaman router (cek dulu dengan `ping` saat Pi dimatikan: tidak boleh ada jawaban), lalu perbarui `ALAMAT_BROKER` Node 1.

</details>

<details>
<summary><b>Mosquitto <code>failed</code> setelah berkas pengaturan diubah</b></summary>

Mosquitto menolak menyala kalau berkas pengaturannya mengandung baris yang tidak ia kenal. Pesan galat dari pengaturan ditulis ke **buku catatan satpam**, bukan ke `mosquitto.log`, karena muncul sebelum catatan Mosquitto sendiri siap. Lihat alasannya **di Pi**:

```bash
journalctl -u mosquitto -n 20
```

Contohnya, kalau `listener` salah ketik menjadi `listner`:

```text
Oct 18 09:40:12 gateway mosquitto[1530]: 1792291212: Error: Unknown configuration variable "listner".
Oct 18 09:40:12 gateway mosquitto[1530]: 1792291212: Error found at /etc/mosquitto/conf.d/gateway-pi.conf:4.
Oct 18 09:40:12 gateway mosquitto[1530]: 1792291212: Error found at /etc/mosquitto/mosquitto.conf:13.
```

Angka di belakang nama berkas adalah nomor barisnya. Baris `Error found at` yang kedua hanya menunjuk baris `include_dir` di berkas utama, yang memuat berkasmu; yang perlu diperbaiki tetap berkas di `conf.d`. Penyebab yang paling sering:

- Salah ketik, misalnya `listner 1883` atau `allow_anonymus true`.
- Catatan `#` yang ditulis di belakang pengaturan, bukan di awal baris (Modul 11).
- Dua berkas di `conf.d` sama-sama berisi `listener 1883`.

Perbaiki dengan `sudo nano /etc/mosquitto/conf.d/gateway-pi.conf`, lalu jalankan `sudo systemctl restart mosquitto`. Satpam beberapa kali mencoba membangunkan broker yang gagal itu dengan cepat, lalu menyerah. Kalau `restart` menolak dengan pesan bahwa layanan terlalu sering dinyalakan, tunggu sekitar 10 detik, atau jalankan dulu `sudo systemctl reset-failed mosquitto`.

</details>

<details>
<summary><b>MQTTX atau Node 1 tidak bisa tersambung ke broker di Pi</b></summary>

1. **Layanannya berjalan?** `systemctl status mosquitto` harus menunjukkan `active (running)`.
2. **Pintunya terbuka untuk jaringan?** Kalau `sudo tail /var/log/mosquitto/mosquitto.log` masih menulis `Starting in local only mode` pada penyalaan terakhir, berkas di `conf.d` tidak terbaca: pastikan namanya berakhiran `.conf` dan letaknya `/etc/mosquitto/conf.d/`, lalu jalankan `sudo systemctl restart mosquitto` (bukan `reload`).
3. **Alamatnya benar?** Host di MQTTX dan `ALAMAT_BROKER` di Node 1 harus alamat tetap Pi (Praktik 2), bukan alamat laptop.
4. **Uji dari Pi sendiri:** `mosquitto_sub -h localhost -v -t "latihan/#"`. Kalau ini jalan, tetapi laptop tidak bisa masuk, masalahnya di jaringan: WiFi tamu atau isolasi perangkat (*AP isolation* atau *client isolation*) di router bisa memisahkan perangkat; cara mengatasinya ada di 🚨 Modul 10, "ESP32 dan laptop beda jaringan".
5. **Node 1 menulis `kode -2` atau `-4`**: artinya sama seperti di Modul 11 (🚨 "Tidak bisa tersambung ke broker"); periksa langkah 1–4. Raspberry Pi OS bawaan tidak memasang aturan *firewall* untuk pintu 1883. Jadi, berbeda dengan laptop Windows di Modul 11, kegagalan cepat (`kode -2` dalam hitungan milidetik) di sini biasanya berarti broker di Pi memang tidak menerima sambungan dari jaringan: kembali ke langkah 2.

</details>

<details>
<summary><b>Pi menyala ulang sendiri, atau <code>vcgencmd get_throttled</code> bukan <code>0x0</code></b></summary>

Hampir selalu soal listrik. Tegangan yang turun di bawah sekitar 4,63 V membuat Pi mencatat *undervoltage*, memperlambat diri, dan kadang menyala ulang. Lihat kejadiannya di catatan *kernel*: `journalctl -k | grep -i voltage` (contoh baris: `hwmon hwmon1: Undervoltage detected!`). Obatnya, berurutan:

1. Pakai **adaptor resmi** (Pi 5: 27 W; Pi 4: 15 W), bukan adaptor HP.
2. Pakai kabel USB-C bawaan adaptor itu, bukan kabel tipis yang panjang.
3. Lepaskan perangkat USB yang tidak perlu, misalnya *hard disk* luar yang mengambil listrik dari Pi.
4. Bendera `0x8` atau `0x80000` berarti suhu: pastikan pendinginnya terpasang dan kipasnya berputar.

Pi Zero 2 W tidak punya pendeteksi *undervoltage*, jadi pemeriksaan ini tidak berlaku untuknya.

</details>

<details>
<summary><b>Jalur laptop: layanan Mosquitto tidak mau menyala</b></summary>

- **Windows, `.\mosquitto install` menulis `Error: The specified service already exists.`:** layanan Mosquitto sudah terpasang sejak dulu, misalnya karena centang **Service** tidak dihilangkan di Modul 11, dan jenis penyalaannya (*startup type*) mungkin masih **Manual** dari 🚨 "Dua broker berjalan bersamaan" Modul 11. Di Terminal (Admin), jadikan otomatis dengan `sc.exe config mosquitto start= auto` (spasi setelah `start=` memang wajib), lalu jalankan `net start mosquitto`.
- **Windows, `.\mosquitto install` atau `net start mosquitto` menulis `Access is denied`:** terminalnya bukan Terminal (Admin). Tutup, lalu buka lagi lewat klik kanan **Start** → **Terminal (Admin)** (Windows 10: **Windows PowerShell (Admin)**).
- **Windows, `The Mosquitto Broker service could not be started.`:** biasanya ada salah ketik di `mosquitto.conf`, atau broker lain (misalnya di terminal VS Code) masih memakai pintu 1883. Hentikan broker lain, lalu jalankan `.\mosquitto -v -c mosquitto.conf` di Terminal (Admin): salah ketik di berkas pengaturan langsung tampil di layar (abaikan baris `Error: Unable to open log file …` kalau muncul; berkas itu milik akun layanan). Pesan lain bisa masuk ke berkas catatan saja karena baris `log_dest file`, jadi layar bisa tetap diam. Kalau *prompt* langsung kembali, baik dengan pesan seperti `Error: Only one usage of each socket address …` (di Windows berbahasa lain, kalimatnya mengikuti bahasa Windows-mu) maupun tanpa pesan, pintu 1883 kemungkinan dipakai program lain: periksa dengan `Get-NetTCPConnection -LocalPort 1883 -State Listen` seperti Praktik 1.5 Modul 11. Kalau *prompt* tidak kembali, pengaturannya benar dan broker sedang berjalan di jendela itu: hentikan dengan **Ctrl + C**, lalu jalankan lagi `net start mosquitto`.
- **macOS, `brew services list` menulis `error`:** jalankan `mosquitto -v -c /opt/homebrew/etc/mosquitto/mosquitto.conf` di Terminal untuk melihat pesan galatnya, perbaiki berkasnya, lalu jalankan `brew services restart mosquitto`.
- **Node 1 tidak bisa masuk walaupun MQTTX di laptop bisa:** periksa izin *firewall* `mosquitto.exe` (Praktik 1.4 Modul 11) dan pastikan `ALAMAT_BROKER` berisi alamat IP laptop.

</details>

---

## 🔬 Bedah Teknis (opsional)

Bagian ini untuk yang penasaran. Semuanya boleh dilewati tanpa mengganggu modul berikutnya.

<details>
<summary><b>Kaki GPIO Raspberry Pi vs ESP32: mengapa sensor tetap di ESP32</b></summary>

Raspberry Pi punya empat puluh kaki di tepi atasnya (foto di Kemenangan Cepat), dan sebagian besar adalah GPIO, sama seperti kaki ESP32. Logikanya juga 3,3 V: jangan pernah memberi 5 V ke kaki GPIO Pi. Di Pi 5, kaki-kaki ini dikendalikan chip pembantu bernama **RP1**. Ketik `pinout` di Pi untuk melihat peta kakinya di terminal, dan `sudo pinctrl` untuk melihat keadaan setiap kaki.

Kenapa proyek kita tetap memasang sensor dan relay di ESP32?

- **Pi tidak punya ADC.** Tidak ada kaki analog untuk sensor tanah atau LDR (Modul 6); Pi butuh chip ADC tambahan, misalnya ADS1115 atau MCP3008.
- **Linux tidak tepat waktu.** Linux membagi waktu prosesor untuk banyak program, jadi sinyal yang harus tepat dalam hitungan mikrodetik, seperti DHT22 atau pengukur jarak HC-SR04, lebih andal dibaca ESP32.
- **Gateway sebaiknya tidak ikut mengurus kabel.** Pi yang sedang diperbarui atau menyala ulang tidak boleh membuat pompa berhenti di tengah jalan. Dengan pembagian ini, ESP32 tetap menjalankan aturan pengamannya sendiri (Modul 6 dan 8) walaupun gateway sedang sibuk.
- **Arus kecil.** Setiap kaki GPIO Pi hanya dirancang untuk beberapa miliampere; relay dan pompa tetap butuh perantara seperti di Modul 5.

</details>

<details>
<summary><b>Pi 5, Pi 4, atau Pi Zero 2 W?</b></summary>

| | Raspberry Pi 5 | Raspberry Pi 4 Model B | Raspberry Pi Zero 2 W |
| :--- | :--- | :--- | :--- |
| RAM | 1, 2, 4, 8, atau 16 GB | 1, 2, 3, 4, atau 8 GB | 512 MB |
| Colokan LAN | ada (gigabit) | ada (gigabit) | **tidak ada** |
| WiFi | 2,4 dan 5 GHz | 2,4 dan 5 GHz | **hanya 2,4 GHz** |
| Adaptor resmi | USB-C 27 W (5,1 V 5 A) | USB-C 15 W (5,1 V 3 A) | micro-USB 12,5 W (5,1 V 2,5 A) |
| Tombol daya, jam RTC | ada (RTC butuh baterai kecil terpisah) | tidak ada | tidak ada |
| Pendeteksi *undervoltage* | ada | ada | **tidak ada** |
| Pendingin | aktif (kipas) disarankan | *heatsink* cukup | tidak perlu |
| Harga resmi, Oktober 2026 | 2 GB US$77,50 | 2 GB US$67,50 | US$15 |
| Cocok untuk | gateway sampai akhir kurikulum, termasuk database jalur gratis | gateway sampai akhir kurikulum | broker + Node-RED; terlalu lemah untuk database |

**Pi Zero 2 W** bisa mengikuti modul ini dengan tiga penyesuaian: semua sambungan lewat WiFi (pastikan WiFi rumahmu punya jaringan 2,4 GHz), alamat tetap dipasang pada sambungan WiFi (`netplan-wlan0-…`, atau pesan di router), dan perintah `vcgencmd get_throttled` tidak bisa melaporkan tegangan kurang.

</details>

<details>
<summary><b>Masuk tanpa kata sandi dengan kunci SSH</b></summary>

Kunci SSH adalah sepasang berkas: **kunci privat**, yang tidak boleh keluar dari laptopmu, dan **kunci publik**, yang boleh dititipkan di Pi. SSH membuktikan kamu memegang kunci privat tanpa pernah mengirimkannya sehingga kamu tidak perlu mengetik kata sandi saat masuk, dan kunci itu jauh lebih sulit ditebak daripada kata sandi. Namun, masuk dengan kata sandi masih bisa dilakukan dan `sudo` tetap menanyakan kata sandi Pi. Jadi, kata sandi itu harus kuat.

1. **Di laptop**, buat pasangan kunci (tekan **Enter** untuk menerima nama berkas bawaan, lalu boleh isi atau kosongkan *passphrase*, kata sandi pelindung kunci):

   ```bash
   ssh-keygen -t ed25519
   ```

   Hasilnya dua berkas di folder `.ssh` milikmu: `id_ed25519` (privat) dan `id_ed25519.pub` (publik).
2. Titipkan kunci publik di Pi. **macOS dan Linux:**

   ```bash
   ssh-copy-id budi@gateway.local
   ```

   **Windows** tidak punya `ssh-copy-id`; di PowerShell, pakai satu baris ini (perhatikan petik ganda di bagian kedua):

   ```powershell
   type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh budi@gateway.local "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
   ```

3. Coba `ssh budi@gateway.local` lagi: kamu masuk tanpa ditanya kata sandi Pi (kecuali *passphrase* kuncimu, kalau kamu mengisinya).

Cara lain: saat menulis kartu, pilih **Use public key authentication** di langkah SSH Imager, lalu tempel isi `id_ed25519.pub`. **Jangan pernah** menyalin `id_ed25519` (tanpa `.pub`) ke mana pun.

</details>

<details>
<summary><b>Mengintip berkas unit <code>mosquitto.service</code> dan menambah aturan sendiri</b></summary>

`systemctl cat mosquitto` menampilkan berkas unit bawaan Debian, `/usr/lib/systemd/system/mosquitto.service`:

```ini
[Unit]
Description=Mosquitto MQTT Broker
Documentation=man:mosquitto.conf(5) man:mosquitto(8)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
NotifyAccess=main
ExecStart=/usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
ExecStartPre=/bin/mkdir -m 740 -p /var/log/mosquitto
ExecStartPre=/bin/chown mosquitto:mosquitto /var/log/mosquitto
ExecStartPre=/bin/mkdir -m 740 -p /run/mosquitto
ExecStartPre=/bin/chown mosquitto:mosquitto /run/mosquitto

[Install]
WantedBy=multi-user.target
```

- `After=` dan `Wants=network-online.target`: nyalakan setelah jaringan siap.
- `Type=notify`: Mosquitto sendiri yang melapor "aku siap" ke systemd, tepat setelah semua pintunya terbuka. Karena itu, `Started …` di catatan benar-benar berarti broker siap menerima tamu.
- `ExecStart=`: perintah yang dijalankan, sama dengan `mosquitto -c …` di laptop, hanya tanpa `-v`.
- `Restart=on-failure`: aturan bangkit yang kamu uji di Praktik 4.
- `WantedBy=multi-user.target`: inilah yang membuat `enable` berarti "ikut menyala saat Pi menyala".

**Jangan mengubah berkas di `/usr/lib/systemd/system/`**: pembaruan paket akan menimpanya. Untuk menambah atau mengganti aturan, pakai **berkas tambahan** (*drop-in*). **Di Pi**, jalankan:

```bash
sudo systemctl edit mosquitto
```

Penyunting nano terbuka dengan beberapa baris pembuka seperti `### Editing /etc/systemd/system/mosquitto.service.d/override.conf`. Tulis aturanmu **di antara** dua baris komentar `### Anything between here …` dan `### Edits below this comment will be discarded`, simpan, dan keluar. `systemctl edit` memuat ulang daftar unit sendiri; kamu tinggal menjalankan `sudo systemctl restart mosquitto`. 🧩 Tingkat 2 memakai cara ini.

</details>

<details>
<summary><b><i>Watchdog</i>, menyalakan ulang otomatis, dan catatan yang permanen</b></summary>

***Watchdog*.** Raspberry Pi OS Trixie menyalakan *watchdog* perangkat keras sejak awal, lewat berkas `/usr/lib/systemd/system.conf.d/40-rpi-enable-watchdog.conf` yang berisi `RuntimeWatchdogSec=1m` dan `RebootWatchdogSec=2m`. Artinya, systemd harus "menepuk" chip penjaga setidaknya sekali semenit. Kalau seluruh sistem macet sehingga tepukan itu berhenti, chip penjaga menyalakan ulang Pi. Kalau Pi sedang dinyalakan ulang (`sudo reboot`) dan tahap terakhirnya macet lebih dari dua menit, Pi juga dipaksa menyala ulang. Periksa **di Pi** dengan:

```bash
systemctl show -p RuntimeWatchdogUSec
```

**Hasilnya:** `RuntimeWatchdogUSec=1min`. Penjaga ini menjaga **seluruh Pi**, bukan Mosquitto; Mosquitto dijaga `Restart=on-failure`.

**Menyalakan ulang terjadwal** hampir tidak pernah perlu. Kalau tetap ingin, misalnya setiap Minggu pukul 04.00, jalankan `sudo crontab -e` (pilih `nano` saat ditanya) dan tambahkan baris `0 4 * * 0 /sbin/shutdown -r now`.

**Catatan yang permanen.** Buku catatan satpam di Raspberry Pi OS disimpan di RAM (berkas `/usr/lib/systemd/journald.conf.d/40-rpi-volatile-storage.conf`), jadi catatan dari sebelum *crash* ikut hilang saat Pi menyala ulang, padahal justru saat itulah catatan paling dibutuhkan. Kalau kamu sedang memburu masalah yang membuat Pi menyala ulang sendiri, simpan sementara catatannya ke kartu: `sudo raspi-config` → **Advanced Options** → **Logging** → **Persistent**, lalu jalankan `sudo reboot`. Kembalikan ke **Volatile** setelah masalahnya ditemukan supaya kartunya tidak cepat aus.

</details>

<details>
<summary><b>Pi sebagai titik akses WiFi sendiri</b></summary>

Di tempat tanpa router, misalnya kebun atau gudang, Pi bisa memancarkan WiFi sendiri lewat NetworkManager. Jalankan **di Pi**:

```bash
sudo nmcli device wifi hotspot ifname wlan0 ssid GatewayIoT password "ganti-dengan-sandi-kuat"
```

ESP32 kemudian menyambung ke WiFi `GatewayIoT`, dan broker di Pi bisa dijangkau lewat alamat Pi di jaringan itu (biasanya `10.42.0.1`; periksa dengan `ip -4 addr show wlan0`). Dua peringatan: kalau kamu masuk ke Pi lewat WiFi yang sama, sambungan SSH-mu langsung putus begitu `wlan0` berubah menjadi *hotspot*; dan jaringan ini tidak tersambung ke internet kecuali Pi juga memakai kabel LAN. Untuk kembali, matikan sambungan *hotspot* dengan `sudo nmcli connection down Hotspot`, lalu nyalakan lagi sambungan WiFi rumah.

</details>

<details>
<summary><b>Salinan utuh kartu microSD dan menyalakan Pi dari SSD</b></summary>

**Salinan utuh.** Raspberry Pi Imager hanya bisa **menulis** kartu, tidak bisa **menyalin** isinya. Di Windows, aplikasi gratis **Win32 Disk Imager** 1.0.0 bisa membaca seluruh kartu ke sebuah berkas `.img`: matikan Pi dengan `sudo poweroff`, colokkan kartunya ke laptop (klik **Cancel** kalau Windows menawarkan untuk memformatnya), pilih huruf *drive*-nya, isi nama berkas, lalu klik **Read**. Berkas hasilnya sebesar kartu (32 GB) dan berisi seluruh isi kartu, termasuk kata sandi WiFi rumahmu, jadi simpan sebagai berkas pribadi: jangan diunggah ke GitHub atau dibagikan. Untuk memulihkan, tulis berkas itu ke kartu baru dengan Imager (**Use custom**). Di macOS dan Linux, perintah `dd` bisa melakukan hal yang sama, tetapi salah ketik satu huruf saja bisa membuatnya menimpa *hard disk* laptop; untuk pemula, resep di `edge/README.md` jauh lebih aman.

**SSD.** Kartu microSD adalah bagian gateway yang paling cepat aus. Pi 4 dan Pi 5 bisa menyala dari SSD lewat USB, dan Pi 5 juga dari SSD NVMe lewat papan tambahan resmi M.2 HAT+. SSD jauh lebih tahan ditulis terus-menerus sehingga cocok kalau kelak database berjalan di Pi (jalur gratis Fase 5).

</details>

---

## 🧩 Tantangan mandiri

Tiga tingkat, dari mengubah sedikit sampai membuat sendiri. Kunci Tingkat 1 dan 2 ada di bagian lipat; Tingkat 3 sengaja hanya diberi petunjuk. Jalur laptop: ketiganya ditulis untuk Pi, dan laptop Linux (Praktik 7.3) bisa mengerjakannya dengan cara yang sama. Di Windows dan macOS, cukup Tingkat 1: tambahkan barisnya ke `edge/mosquitto-lan.conf`, lalu jalankan broker di terminal VS Code seperti "Melihat catatan" di Praktik 7.1 (macOS: hentikan dulu layanannya dengan `brew services stop mosquitto`, lalu nyalakan lagi dengan `brew services start mosquitto` sesudahnya); jam yang terbaca manusia langsung tampil di layar. Tingkat 2 dan 3 butuh systemd, jadi simpan sampai Kit B datang.

### Tingkat 1 — Jam yang terbaca manusia (ubah sedikit)

Angka seperti `1792289551:` di depan setiap baris `mosquitto.log` sulit dibaca. Mosquitto punya pengaturan **`log_timestamp_format`** yang mengubahnya menjadi tanggal dan jam biasa. Tambahkan satu baris ke `/etc/mosquitto/conf.d/gateway-pi.conf` supaya setiap baris catatan diawali, misalnya, `2026-10-18T09:45:02:`, lalu buktikan dengan `sudo tail /var/log/mosquitto/mosquitto.log`. Jangan lupa memperbarui salinannya di repositori (Praktik 6.2).

Petunjuk: bentuk tulisannya sama dengan perintah `date` di Praktik 5.2, tetapi dengan huruf `T` di antara tanggal dan jam.

<details>
<summary><b>Kunci Tingkat 1</b></summary>

Tambahkan baris ini di bawah `allow_anonymous true` (`sudo nano /etc/mosquitto/conf.d/gateway-pi.conf`):

```text
log_timestamp_format %Y-%m-%dT%H:%M:%S
```

Lalu jalankan `sudo systemctl restart mosquitto` dan `sudo tail /var/log/mosquitto/mosquitto.log`. **Hasilnya** (contoh, baris terakhir):

```text
2026-10-18T09:45:02: mosquitto version 2.0.21 running
```

Jamnya mengikuti zona waktu Pi (`Asia/Jakarta` dari Imager). Terakhir, salin lagi berkasnya ke repositori **di laptop**, dari terminal VS Code di folder `rumah-pintar-mini` (Praktik 6.2): `scp budi@192.168.1.37:/etc/mosquitto/conf.d/gateway-pi.conf edge/`.

</details>

### Tingkat 2 — Satpam yang lebih galak dan lebih sabar (isi bagian rumpang)

Aturan bawaan `Restart=on-failure` hanya membangunkan Mosquitto kalau ia mati karena gagal, dan langsung membangunkannya 100 milidetik kemudian. Buat **berkas tambahan** (*drop-in*, 🔬) dengan `sudo systemctl edit mosquitto` supaya satpam (a) membangunkan Mosquitto **apa pun** penyebab matinya, kecuali dihentikan dengan `systemctl stop`, dan (b) menunggu **5 detik** dulu sebelum membangunkannya. Lengkapi bagian yang rumpang:

```ini
[Service]
Restart=________
RestartSec=___
```

Uji dengan cara Praktik 4.2: `MainPID` baru seharusnya muncul sekitar 5 detik setelah broker dibunuh, bukan seketika.

<details>
<summary><b>Kunci Tingkat 2</b></summary>

```ini
[Service]
Restart=always
RestartSec=5
```

Tulis ketiga baris itu di antara baris komentar `### Anything between here …` dan `### Edits below this comment will be discarded`, simpan (**Ctrl + O**, **Enter**), dan keluar (**Ctrl + X**). Lalu jalankan `sudo systemctl restart mosquitto`. Periksa aturannya dengan `systemctl show -p Restart -p RestartUSec mosquitto`; **hasilnya** `Restart=always` dan `RestartUSec=5s`. Di `journalctl -u mosquitto`, baris `Scheduled restart job` kini muncul sekitar 5 detik setelah `Failed with result 'signal'`. Untuk membatalkannya kelak: `sudo systemctl revert mosquitto`.

</details>

### Tingkat 3 — Layanan perekam buatanmu sendiri (buat dari nol)

Buat layanan systemd bernama `perekam-status.service` yang menjalankan `mosquitto_sub` di Pi, berlangganan `rpm/+/status`, dan menambahkan setiap pesan ke berkas `/home/budi/rekaman-status.txt`, lengkap dengan jamnya. Layanan ini harus menyala sendiri saat Pi menyala dan bangkit sendiri kalau mati. Dengan begitu, kamu punya catatan kapan setiap perangkat berstatus `online` dan `offline`, bahkan selama laptopmu mati, sebuah bukti tambahan untuk uji "cabut laptop" di bagian ➕.

Petunjuk:

- Berkasnya kamu buat sendiri dengan `sudo nano /etc/systemd/system/perekam-status.service`, berisi tiga bagian `[Unit]`, `[Service]`, dan `[Install]` seperti berkas unit Mosquitto di 🔬.
- `After=mosquitto.service` membuatnya menyala setelah broker. `User=budi` membuatnya berjalan sebagai pengguna biasa, bukan kepala kantor.
- `mosquitto_sub -F "%I %t %p"` mencetak jam, topik, dan isi pesan dalam satu baris. Di berkas unit, tanda `%` punya arti khusus, jadi tulis **`%%`** untuk setiap `%`.
- `StandardOutput=append:/home/budi/rekaman-status.txt` membuat systemd menambahkan semua keluaran programnya ke berkas itu.
- Berkas unit buatan sendiri butuh `sudo systemctl daemon-reload` sebelum `sudo systemctl enable --now perekam-status`.

Kenapa hanya topik `status`, bukan `rpm/#`? Ingat Konsep 8: setiap baris yang ditulis ke kartu ikut mengikisnya, dan `telemetry` datang setiap 10 detik.

---

## ➕ Tambahan ke "Rumah Pintar Mini"

Minggu ini, Rumah Pintar Mini mendapat **gateway permanen**: Raspberry Pi bernama `gateway` dengan alamat tetap, broker Mosquitto yang menyala sendiri, dan resep untuk membangunnya ulang. Node 1 pindah ke broker itu, dan broker di laptop pensiun.

![Diagram Rumah Pintar Mini setelah Modul 12: broker pindah dari laptop ke gateway, laptop tinggal pemantau, garis putus-putus berarti menyusul. Tengah, gateway Raspberry Pi 192.168.1.37 port 1883 dengan Mosquitto sebagai layanan systemd: menyala sendiri saat Pi menyala, bangkit sendiri kalau crash, retained tersimpan di kartu. Kiri, Node 1 v1.2.1 (a4cf12e5b7c0) dengan ALAMAT_BROKER = 192.168.1.37: dua panah ke gateway, satu berlabel telemetry dan satu berlabel status, vitals, ack, serta panah cmd dari gateway. Kanan, tiga klien di laptop: MQTTX (pemantau, boleh mati, sekaligus pengirim cmd ke gateway), pemeriksa-kontrak.js dengan alamat 192.168.1.37, dan SSH ke Pi untuk perawatan dan catatan. Bawah, menyusul: Node-RED di Pi (Modul 13, otomasi dan dashboard v0) dan Node 2 Kebun (Modul 14, lewat Node 1). Catatan: broker di laptop (Modul 11) pensiun; laptop masih dipakai untuk MQTTX, pemeriksa kontrak, dan SSH, tetapi Rumah Pintar Mini tidak lagi bergantung padanya.](aset/diagram-gateway-proyek.png)

> 🖥️ **Alat yang dipakai:** Pi yang sudah disiapkan di Praktik 1–6, **Arduino IDE**, meja kerja Node 1 lengkap dengan MB102 dan *charger*-nya, **VS Code** dengan folder `rumah-pintar-mini`, **MQTTX**, dan **GitHub Desktop**.
>
> Jalur Wokwi (tanpa papan asli): Node 1 simulasi tetap memakai broker publik (`PAKAI_WOKWI` bernilai `true`), jadi ia tidak pernah tersambung ke broker di Pi. Kerjakan langkah A di Arduino IDE (untuk repositorimu) dan di tab-tab proyek Wokwi Node 1-mu (tab utamanya bernama `sketch.ino`), jalankan Node 1 di Wokwi, dan di langkah C pakai cara Wokwi Modul 11 (sambungan MQTTX **Broker publik** dengan langganan `rpm/` + `device_id`-mu + `/#`, serta `node pemeriksa-kontrak.js broker.emqx.io <device_id>`). Langkah B.3 dan D butuh papan asli, jadi uji "cabut laptop" baru bisa dibuktikan setelah papanmu ada.
>
> Jalur laptop: broker layanan dari Praktik 7 menggantikan Pi, alamat laptopmu menggantikan `192.168.1.37`, dan sambungan MQTTX **Lewat IP laptop** menggantikan **Gateway Pi**. Lewati langkah B.3, D, dan E karena ketiganya butuh Pi; uji D memang mustahil karena mematikan laptop juga mematikan brokermu. Di langkah F, simpan tiga berkas Node 1 saja. Untuk F.2, buat dulu `catatan-modul12.md` di folder **Documents → GitHub → belajar-iot → modul-12** (seperti `catatan-modul11.md` di Modul 11), lalu catat alamat IP laptopmu dan hasil uji Praktik 7 setelah laptop dinyalakan ulang.
>
> ⭐ **Wajib** — syarat lulus Modul 12.

| Berkas di `rumah-pintar-mini` | Perubahan |
| :--- | :--- |
| `firmware/node-1-rumah/konfigurasi.h` | `VERSI_FIRMWARE` menjadi `"1.2.1"`, `ALAMAT_BROKER` menjadi alamat tetap Pi |
| `firmware/node-1-rumah/node-1-rumah.ino` | baris keterangan versi di paling atas |
| `firmware/node-1-rumah/jaringan.cpp` | pesan galat `Broker di laptop menyala?` menjadi `Broker di gateway menyala?` |
| `edge/gateway-pi.conf` | **baru**: salinan pengaturan broker gateway (Praktik 6.2) |
| `edge/README.md` | **baru**: resep membangun ulang gateway (langkah E) |

### A. Ubah empat baris Node 1

1. Di Arduino IDE, buka Node 1-mu: **File → Open…** → **Documents → GitHub → rumah-pintar-mini → firmware → node-1-rumah** → `node-1-rumah.ino`.
2. Di tab `konfigurasi.h`, ubah dua baris yang letaknya berjauhan: `VERSI_FIRMWARE` di bagian paling atas, dan `ALAMAT_BROKER` di bagian `Modul 11: MQTT` dekat paling bawah (cari dengan **Ctrl + F**). Setelah diubah, keduanya berbunyi:

   ```cpp
   const char VERSI_FIRMWARE[] = "1.2.1";
   const char ALAMAT_BROKER[] = "192.168.1.37";  // GANTI dengan alamat tetap gateway Pi-mu (Modul 12, Praktik 2)
   ```

   Ganti `192.168.1.37` dengan alamat tetap Pi-mu dari Praktik 2. Versi rujukan lengkap Node 1 v1.2.1 ada di folder [`kode/node-1-rumah/`](kode/node-1-rumah/) modul ini.
3. Di tab `node-1-rumah.ino`, ubah baris pertama menjadi:

   ```cpp
   // Node 1 "Rumah" - firmware v1.2.1 (Modul 12: broker pindah ke gateway Raspberry Pi)
   ```

4. Di tab `jaringan.cpp`, tekan **Ctrl + F**, cari `Broker di laptop menyala?`, lalu ganti kata `laptop` dengan `gateway`.

Hanya itu: Node 1 tidak perlu tahu bahwa brokernya kini sebuah Raspberry Pi. Ia tetap menyambung ke sebuah alamat di pintu 1883, persis seperti di Modul 11. Inilah keuntungan kontrak data dan MQTT: kantor posnya boleh pindah, surat-suratnya tetap sama.

### B. Verify, Upload, dan sapa gateway

1. Kalau Node 1 masih hidup dari *charger*-nya, pindahkan ke laptop dengan urutan aturan emas, seperti ➕ A Modul 11: **matikan MB102**, cabut USB dari *charger*, colokkan ke laptop, lalu nyalakan MB102. Pastikan papan **ESP32 Dev Module** dengan **Partition Scheme** **Minimal SPIFFS** dan **Flash Mode** **DIO**, seperti sejak Modul 10. Klik **Verify**, lalu **Upload**.
2. Buka **Serial Monitor** (**115200 baud**) dan tekan **EN** kalau baris pertama terlewat. **Hasilnya** (contoh; susunan baris mengikuti rekaman Node 1 v1.2 di Modul 11):

   ```text
   [00:00:00] INFO  Node 1 Rumah - firmware 1.2.1
   [00:00:00] INFO  Alasan restart terakhir: POWERON
   [00:00:00] INFO  Nyala ke-17. Ambang tanah_siram: 35 % (dari NVS)
   [00:00:01] INFO  Kartu microSD siap: bacaan dicatat ke node1.csv setiap 30 detik.
   [00:00:01] INFO  device_id a4cf12e5b7c0
   [00:00:01] INFO  Menyambung ke WiFi tersimpan "RumahKita" (tanpa menunggu)...
   [00:00:01] INFO  Watchdog aktif: restart otomatis kalau loop() macet lebih dari 5 detik.
   [00:00:03] INFO  WiFi tersambung ke "RumahKita": IP 192.168.1.23, sinyal -58 dBm
   [00:00:03] INFO  MQTT tersambung ke broker 192.168.1.37:1883 dalam 41 ms, sebagai a4cf12e5b7c0
   [00:00:08] INFO  Jam disetel dari internet: 2026-10-18T02:50:36Z
   [00:00:09] INFO  Terbit telemetry (jadwal 10 detik)
   [00:00:19] INFO  Terbit telemetry (jadwal 10 detik)
   ```

3. **Di Pi**, ikuti catatan broker: `sudo tail -f /var/log/mosquitto/mosquitto.log`. Node 1 sudah tersambung di langkah 2, jadi dua baris sambungannya biasanya sudah tampil di antara baris-baris terakhir (tekan **EN** di Node 1 untuk melihatnya muncul lagi secara langsung), misalnya `New connection from 192.168.1.23:52731 on port 1883.` dan `New client connected from 192.168.1.23:52731 as a4cf12e5b7c0 (p2, c1, k15).`: Node 1 masuk dengan `device_id`-nya sebagai nama klien, MQTT 3.1.1 (`p2`), dan *keep-alive* 15 detik (`k15`). Hentikan dengan **Ctrl + C**.

### C. Pensiunkan broker laptop

1. **Di laptop**, pastikan tidak ada lagi terminal yang menjalankan `mosquitto -v -c mosquitto-lan.conf`. Kalau masih ada, tekan **Ctrl + C** di terminal itu. Berkas `edge/mosquitto-lan.conf` tetap disimpan sebagai arsip Modul 11. Jalur laptop: hentikan hanya broker di terminal; layanan dari Praktik 7 tetap menyala karena itulah brokermu.
2. Di MQTTX, pada sambungan **Gateway Pi** (Praktik 3.3), tambahkan langganan `rpm/#` (**New Subscription**, seperti Modul 11). Pesan `telemetry` Node 1 muncul setiap 10 detik, dan `status` bertanda *retained* berisi `online`. MQTTX mengingat langganan ini dan memasangnya lagi setiap kali tersambung.
3. **Di laptop**, buka terminal baru di VS Code (**Terminal → New Terminal**); terminal baru selalu mulai dari folder `rumah-pintar-mini`. Masuk ke folder `alat` dengan `cd alat`, lalu jalankan alat pemeriksa kontrak dari Modul 11 dengan alamat Pi:

   ```bash
   node pemeriksa-kontrak.js 192.168.1.37
   ```

   Semua pesan Node 1 harus `LULUS`. Pemeriksa tidak mencetak isi pesan, jadi lihat versinya di MQTTX: setiap `telemetry` kini berisi `"fw":"1.2.1"`. Biarkan pemeriksa tetap berjalan untuk langkah 4.
4. Kirim satu perintah dari MQTTX seperti di ➕ E Modul 11 (topik `rpm/<device_id>/cmd`, QoS 1, **Retain** tidak dicentang), misalnya menyalakan lampu dengan `{"id":"c-201","aksi":"set","target":"lampu","nilai":true}` (format **JSON**; setiap perintah memakai `id` baru). Relay berbunyi "klik", dan terminal pemeriksa menulis baris `ack` dengan `dijawab … ms setelah perintah: di bawah 1 detik`, seperti di ➕ E Modul 11.

### D. ⭐ Uji "cabut laptop"

Inilah bukti utama minggu ini: Rumah Pintar Mini tetap hidup tanpa laptop. Karena itu, **Node 1 tidak boleh mengambil listrik dari laptop**: kalau USB-nya masih tercolok ke laptop sejak langkah B, mematikan laptop ikut mematikan Node 1. Sebelum mulai, pindahkan Node 1 ke *charger*-nya seperti ➕ G Modul 11: **matikan MB102** → cabut USB dari laptop → colokkan kabel berlabel **ESP32** ke *charger* → **baru** nyalakan MB102 (modul microSD beregulator: tekan **EN** sesudahnya). Tunggu sampai MQTTX menampilkan `status` `online` lagi. Baca juga langkah 1–4 sampai habis sebelum mematikan laptop, atau buka modul ini di HP. Jalur laptop: lewati bagian ini (lihat kotak 🖥️ di awal ➕).

1. Catat jam sekarang. **Matikan laptop sepenuhnya** (Windows: **Start → Power → Shut down**; macOS: **Apple menu → Shut Down**). Biarkan mati minimal 10 menit. Selama itu, sentuh atau tiup sensor DHT22, atau lambaikan tangan di depan PIR supaya Node 1 punya kejadian untuk dilaporkan.
2. Nyalakan laptop, buka MQTTX, dan sambungkan **Gateway Pi**. Pesan `status` *retained* langsung berisi `online`, dan `telemetry` mengalir lagi.
3. Buka terminal dan masuk ke Pi dengan SSH. **Di Pi**, periksa riwayat sambungan Node 1 selama laptop mati:

   ```bash
   sudo grep a4cf12e5b7c0 /var/log/mosquitto/mosquitto.log | tail -5
   ```

   Ganti `a4cf12e5b7c0` dengan `device_id` Node 1-mu. **Hasilnya** (contoh; kalau kamu sudah mengerjakan 🧩 Tingkat 1, setiap baris diawali jam yang langsung terbaca, misalnya `2026-10-18T10:00:31:`, bukan angka detik):

   ```text
   1792291831: New client connected from 192.168.1.23:52731 as a4cf12e5b7c0 (p2, c1, k15).
   1792292428: Client a4cf12e5b7c0 has exceeded timeout, disconnecting.
   1792292431: New client connected from 192.168.1.23:61204 as a4cf12e5b7c0 (p2, c1, k15).
   ```

   Yang ingin kamu lihat: baris `New client connected … as a4cf12e5b7c0` yang terakhir terjadi **sebelum** laptop dimatikan (bandingkan dengan jam yang kamu catat di langkah 1; angka detik di depan barismu diterjemahkan seperti Praktik 5.2, misalnya `date -d @1792292431 "+%Y-%m-%d %H:%M:%S"` untuk baris contoh terakhir), dan **tidak ada** baris `Client a4cf12e5b7c0 …` sesudahnya, seperti `closed its connection.` atau `has exceeded timeout, disconnecting.` Artinya, Node 1 tersambung terus ke gateway sepanjang laptop mati. Baris `Client a4cf12e5b7c0 …` **sebelum** sambungan terakhir itu wajar, misalnya `has exceeded timeout, disconnecting.` saat Node 1 dipindah ke *charger*-nya di awal bagian ini, atau `already connected, closing old connection.` setiap kali tombol **EN** ditekan.
4. Masih **di Pi**, bandingkan dengan sambungan MQTTX laptopmu sendiri:

   ```bash
   sudo grep -i mqttx /var/log/mosquitto/mosquitto.log | tail -3
   ```

   **Hasilnya** (contoh):

   ```text
   1792292405: New client connected from 192.168.1.10:53388 as mqttx_3f9a1c2b (p5, c1, k60).
   1792293012: Client mqttx_3f9a1c2b disconnected.
   1792293788: New client connected from 192.168.1.10:49702 as mqttx_3f9a1c2b (p5, c1, k60).
   ```

   Di sini, kamu melihat MQTTX pergi saat laptop dimatikan (pukul 10.10 di contoh ini; bergantung pada cara laptop dimatikan, barisnya bisa juga `closed its connection.` atau `has exceeded timeout, disconnecting.`) dan datang lagi 13 menit kemudian. Laptop datang dan pergi; gateway tetap.

Punya HP atau laptop kedua? Bukti yang lebih langsung: selama laptop utama mati, sambungkan aplikasi MQTT di perangkat kedua ke `192.168.1.37` port `1883`, lalu berlangganan `rpm/#`. Di laptop kedua, pakai MQTTX seperti Praktik 3.3. Di HP yang tersambung ke WiFi rumah (bukan data seluler), pasang aplikasi klien MQTT gratis dari toko aplikasi (cari "MQTT client") yang menyambung lewat `mqtt://` atau TCP; versi web di browser tidak bisa dipakai karena butuh pintu WebSocket (🔬 Modul 11). Data Node 1 tetap mengalir.

### E. Resep gateway di repositori

Cadangan utama gateway adalah **resep**: catatan yang cukup untuk membangun ulang gateway dari kartu kosong. Tulis di `edge/README.md`.

1. Di VS Code dengan folder `rumah-pintar-mini`, klik kanan folder `edge`, pilih **New File…**, lalu beri nama `README.md`.
2. Buka [`proyek-rumah-pintar-mini/edge/README.md`](../../proyek-rumah-pintar-mini/edge/README.md) di GitHub, klik **Copy raw file**, kembali ke VS Code, lalu tempel ke `README.md` yang baru dibuat (**Ctrl + V**). Sesuaikan isinya dengan gateway-mu: model Pi, versi Raspberry Pi OS (tanggal `Released:` yang kamu pilih di Imager, ditambah baris `PRETTY_NAME` dari `cat /etc/os-release` **di Pi**), alamat tetap dan caranya (A atau B), serta tanggal. Alamat dan nama pengguna contoh juga tertulis di perintah-perintah resepnya: tekan **Ctrl + H** di VS Code (macOS: **Cmd + Option + F**), ketik teks lama di kotak atas dan penggantinya di kotak bawah, lalu klik **Replace All** (ikon paling kanan di samping kotak bawah). Kalau alamat routermu bukan `192.168.1.1`, ganti dulu `192.168.1.1` dengan alamat routermu, baru `192.168.1.37` dengan alamat tetap Pi-mu; urutan ini mencegah alamat Pi seperti `192.168.1.105` ikut berubah. Lakukan hal yang sama untuk `budi` kalau nama penggunamu berbeda. Simpan dengan **Ctrl + S**. **Jangan pernah menulis kata sandi** di berkas ini.
3. Pastikan `edge/gateway-pi.conf` dari Praktik 6.2 ada di sampingnya.

### F. ⭐ Simpan ke GitHub

1. Di GitHub Desktop, pilih repositori **`rumah-pintar-mini`**. Daftar **Changes** berisi tiga berkas Node 1 dan dua berkas baru di `edge/`. Isi **Summary** dengan `Modul 12: gateway Pi, Node 1 v1.2.1`, klik **Commit … to main**, lalu **Push origin**.
2. Di repositori **`belajar-iot`**, lengkapi catatan modul ini (`modul-12/catatan-modul12.md` dari Praktik 2.4): hasil `df -h /`, `free -h`, dan `vcgencmd get_throttled`; alamat tetap Pi; serta hasil uji "cabut laptop". Lakukan *commit* dan *push* juga.

**Bukti lulus Modul 12** (bandingkan dengan ✅ di bawah): Node 1 tetap tersambung ke broker di Pi saat laptop mati (D), kamu bisa masuk ke Pi lewat SSH dan membaca catatannya (Praktik 5 dan D.3), dan resep gateway tersimpan di repositori (E–F).

---

## 📖 Glosarium

| Istilah | Arti singkat |
| :--- | :--- |
| **Gateway** (gerbang) | Komputer di rumah yang menjadi kantor pos data IoT: semua perangkat menyambung ke sana. Di proyek kita, Raspberry Pi bernama `gateway`. Jangan tertukar dengan gateway router di Modul 10. |
| ***Edge computing*** (komputasi di tepi) | Mengerjakan tugas sedekat mungkin dengan perangkatnya, di dalam rumah, bukan di pusat data yang jauh. |
| **Raspberry Pi** | Komputer papan tunggal seukuran kartu nama yang menjalankan Linux. |
| **Linux** | Sistem operasi gratis dan terbuka; Raspberry Pi OS adalah salah satu "rasa"-nya (distribusi). |
| **Raspberry Pi OS Lite** | Raspberry Pi OS tanpa *desktop*, hanya terminal. Versi modul ini berbasis Debian 13 "Trixie". |
| ***Headless*** (tanpa kepala) | Komputer yang bekerja tanpa monitor, papan ketik, dan mouse; dikendalikan lewat jaringan. |
| **SSH** (*Secure Shell*) | Cara membuka terminal komputer lain lewat jaringan, dengan pembicaraan yang disandikan. |
| **Sidik jari kunci** (*fingerprint*) | Ciri unik Pi yang dicatat laptop saat sapaan SSH pertama (`known_hosts`), untuk memastikan Pi yang menjawab selalu sama. |
| ***Prompt*** (tanda siap) | Tulisan di depan kursor terminal, misalnya `budi@gateway:~ $`: siapa, di komputer mana, di folder apa. |
| **`sudo`** | "Lakukan sebagai kepala kantor (root)" untuk satu perintah. |
| **`apt`** | Pengelola paket: memperbarui katalog (`update`), memperbarui program (`full-upgrade`), dan memasang program (`install`). |
| **nano** | Penyunting teks di terminal. Simpan dengan **Ctrl + O**, keluar dengan **Ctrl + X**. |
| **Alamat tetap** | Alamat IP yang tidak berganti: dipesan di router (*DHCP reservation*) atau dipasang di Pi (*static IP*). |
| **`nmcli`** | Perintah untuk mengatur NetworkManager, pengelola jaringan Raspberry Pi OS. |
| **Layanan** (*service*) | Program yang berjalan di latar belakang, diurus systemd: menyala saat komputer menyala, bangkit lagi kalau mati. |
| **systemd** | "Satpam" Linux: program pertama yang menyala, yang mengurus semua layanan. Diajak bicara dengan `systemctl`. |
| ***Journal*** | Buku catatan systemd, dibaca dengan `journalctl`. |
| **`scp`** | Perintah untuk menyalin berkas lewat SSH, dari laptop ke Pi atau sebaliknya. |
| ***High-endurance*** | Kartu microSD yang dirancang tahan ditulis terus-menerus, misalnya untuk CCTV. |

---

## 📝 Kuis (5 soal)

1. Sebutkan dua alasan Rumah Pintar Mini memakai gateway di rumah, bukan mengirim semua data langsung ke server di internet. Mengapa laptop kurang cocok menjadi gateway?
2. Kamu hendak mematikan Pi dengan `sudo poweroff`. Sebelum menekan **Enter**, bagaimana kamu memastikan perintah itu akan berjalan di Pi, bukan di laptop? Lalu, mengapa Pi sebaiknya dimatikan dengan perintah, bukan dengan mencabut adaptornya?
3. Node 1 menyambung ke broker lewat alamat IP, bukan lewat `gateway.local`. Apa yang terjadi kalau Pi tidak diberi alamat tetap? Sebutkan juga dua cara memberinya alamat tetap.
4. Di Modul 11, broker berhenti saat terminalnya ditutup. Di Pi, apa yang membuatnya (a) menyala sendiri saat Pi menyala dan (b) bangkit lagi setelah dimatikan paksa? Perintah apa yang menunjukkan keduanya?
5. Setelah menulis ulang kartu microSD, `ssh budi@gateway.local` menolak menyambung dengan `REMOTE HOST IDENTIFICATION HAS CHANGED!`. Mengapa, apakah ini berbahaya, dan bagaimana membereskannya?

<details>
<summary><b>Kunci jawaban</b></summary>

1. Dua dari empat alasan di Konsep 1: **internet putus** tidak menghentikan rumah (broker dan kelak otomasi tetap di dalam rumah), **kecepatan** (perintah cukup berputar di dalam rumah, dalam hitungan milidetik), **privasi** (data mentah seperti "ada gerakan di ruang tamu" tidak keluar rumah), dan **biaya** (satu Pi hanya memakai listrik beberapa watt, tanpa tagihan per pesan). Laptop kurang cocok karena tidak menyala 24 jam: ia ditutup lalu tidur, dibawa pergi, atau menyala ulang sendiri saat memasang pembaruan, dan broker yang dijalankan di terminal ikut berhenti begitu terminalnya tertutup.
2. Dari ***prompt*** sebelum perintah diketik: `budi@gateway:~ $` berarti terminal itu tersambung ke Pi lewat SSH, sedangkan `PS C:\Users\…>` atau `… ~ %` berarti laptop (Konsep 4). Pi dimatikan dengan perintah karena kartu microSD bisa sedang menulis; listrik yang hilang di tengah penulisan bisa merusak berkas, kadang sampai Pi tidak mau menyala. `sudo poweroff` menyelesaikan semua penulisan dulu, dan lampunya memberi tanda aman (Pi 4: lampu hijau berkedip lalu padam; Pi 5: lampu status di samping tombol daya menjadi merah).
3. Router meminjamkan alamat lewat DHCP, dan alamat itu bisa berganti, misalnya setelah router dinyalakan ulang. Node 1 v1.2.1 menyimpan alamat broker sebagai angka di `ALAMAT_BROKER` (tanpa mDNS), jadi ia akan terus mengetuk alamat yang salah setiap 5 detik, dan Serial Monitor menulis `MQTT gagal tersambung …`. Dua caranya: **memesan alamat di router** (*DHCP reservation*, cara yang disarankan dokumentasi resmi), atau **IP tetap di Pi** dengan `nmcli connection modify … ipv4.method manual …`, dengan alamat di luar rentang pinjaman router.
4. Mosquitto kini menjadi **layanan** yang diurus systemd. (a) Ia **diaktifkan** (*enabled*): berkas unitnya berisi `WantedBy=multi-user.target`, dan paket Debian sudah menjalankan `enable` saat dipasang sehingga systemd menyalakannya setiap kali Pi menyala; buktinya `systemctl is-enabled mosquitto` menjawab `enabled`. (b) Berkas unitnya berisi `Restart=on-failure` sehingga program yang mati karena gagal, termasuk dibunuh paksa, dibangunkan lagi; buktinya `Main PID` di `systemctl status mosquitto` (atau `systemctl show -p MainPID mosquitto`) berganti, dan `journalctl -u mosquitto` mencatat `Scheduled restart job`.
5. Pada penyalaan pertama setelah kartu ditulis ulang, Pi membuat **kunci SSH baru** sehingga sidik jarinya berbeda dengan yang dicatat laptop di `known_hosts` (Konsep 4). Kalau kamu memang baru saja menulis ulang kartu, ini tidak berbahaya: hapus catatan lama di laptop dengan `ssh-keygen -R gateway.local` (dan `ssh-keygen -R` untuk alamat IP-nya), lalu sambungkan lagi dan jawab `yes`. Kalau kartu **tidak** ditulis ulang, jangan langsung menghapus catatannya. Peringatan ini memang dirancang untuk menangkap komputer penyamar, jadi periksa dulu apakah ada perangkat lain yang memakai alamat Pi.

</details>

---

## ✅ Checklist kelulusan Modul 12

Syarat lulus dari Silabus: **cabut laptop, Node 1 tetap tersambung ke broker di Pi** (dibuktikan lewat catatan broker atau MQTTX di perangkat lain), dan **kamu bisa masuk ke Pi lewat SSH serta membaca catatannya**. Jalur laptop: Mosquitto berjalan sebagai layanan 24 jam tanpa membuka terminal; centang butir berlabel **(Jalur laptop)** dan butir ➕ A–C dengan alamat laptopmu, sedangkan butir lainnya khusus untuk Pi.

- [ ] Pi menyala tanpa monitor, dan aku bisa masuk dengan `ssh budi@gateway.local` (Kemenangan Cepat).
- [ ] Aku bisa memakai `pwd`, `ls`, `cd`, `nano`, `cat`, `sudo apt`, `df -h`, dan `free -h` tanpa melihat rangkuman (Praktik 1).
- [ ] Pi punya alamat tetap, dan alamat itu tetap sama setelah `sudo reboot` (Praktik 2).
- [ ] Mosquitto di Pi `enabled` dan `active (running)`, dan MQTTX di laptop bisa tersambung ke alamat tetap Pi (Praktik 3).
- [ ] Setelah `sudo reboot` dan setelah `systemctl kill`, Mosquitto kembali berjalan tanpa aku menyalakannya (Praktik 4).
- [ ] Aku bisa membaca catatan dengan `journalctl -u mosquitto` dan `sudo tail -f /var/log/mosquitto/mosquitto.log` (Praktik 5).
- [ ] Aku tahu arti hasil `vcgencmd get_throttled`, dan `edge/gateway-pi.conf` sudah tersalin ke laptop dengan `scp` (Praktik 6).
- [ ] **(Jalur laptop)** Mosquitto berjalan sebagai layanan di laptop dan tetap menyala setelah laptop dinyalakan ulang, tanpa membuka terminal (Praktik 7).
- [ ] Node 1 v1.2.1 tersambung ke broker gateway, pemeriksa kontrak menulis `LULUS`, dan perintah dari MQTTX dijawab `ack` (➕ A–C).
- [ ] Uji "cabut laptop": selama laptop mati, `mosquitto.log` di Pi tidak mencatat Node 1 terputus (➕ D).
- [ ] `edge/README.md` dan `edge/gateway-pi.conf` sudah di-*commit* dan di-*push* ke `rumah-pintar-mini`, tanpa kata sandi apa pun (➕ E–F).

> ➡️ **Modul berikutnya:** Modul 13 — Node-RED & Dashboard 2. Gateway-mu mendapat "otak" pertama: dashboard di HP dan otomasi kipas yang berjalan 24 jam di Pi, dibuat dengan cara seret dan lepas (*drag-and-drop*) tanpa menulis banyak kode.

---

## 📚 Sumber & atribusi gambar

**Dokumentasi, kode sumber, dan halaman yang dipakai** (diakses Oktober 2026):

- Raspberry Pi, [dokumentasi resmi](https://www.raspberrypi.com/documentation/computers/) dan [kode sumbernya](https://github.com/raspberrypi/documentation): *Getting started* (Imager, penyalaan pertama), *Configuration* (alamat tetap: pemesanan di router disarankan, IP tetap harus di luar rentang DHCP; `sudo` dan kata sandi; perilaku lampu; pilihan *Logging* di `raspi-config`), *Remote access* (SSH, mencari alamat IP, `.local`), *Raspberry Pi hardware* (catu daya, *undervoltage*, tombol daya Pi 5, menyala dari USB dan NVMe), dan *Raspberry Pi OS* (pembaruan dengan `full-upgrade`, arti bendera `vcgencmd get_throttled`). Catatan rilis dan daftar paket citra [Raspberry Pi OS Lite 2026-10-06](https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2026-10-06/); tulisan blog resmi [cloud-init on Raspberry Pi OS](https://www.raspberrypi.com/news/cloud-init-on-raspberry-pi-os/) (27 November 2025); pengumuman harga resmi [1 Oktober 2026](https://www.raspberrypi.com/news/price-increases-for-2gb-raspberry-pi-4-and-raspberry-pi-5/); dan *whitepaper* "Making a more resilient file system" (Agustus 2026) tentang keausan kartu dan catatan sistem.
- [Raspberry Pi Imager](https://github.com/raspberrypi/rpi-imager/tree/v2.0.12) 2.0.12, kode sumber: urutan dan judul setiap layar, label tombol (ditampilkan dengan huruf kapital), daftar ibu kota (`Jakarta (Indonesia)`, `Asia/Jakarta`, papan ketik `id`), izin administrator di Windows, dan berkas cloud-init yang ditulis ke kartu; daftar sistem operasi resmi yang dibaca Imager ([`os_list_imagingutility_v4.json`](https://downloads.raspberrypi.com/os_list_imagingutility_v4.json)).
- Pembuat citra Raspberry Pi OS, [pi-gen](https://github.com/RPi-Distro/pi-gen) (citra 2026-10-06), dan paket [raspberrypi-sys-mods](https://github.com/RPi-Distro/raspberrypi-sys-mods): bentuk *prompt*, *journal* di RAM, *watchdog* bawaan, dan *swap* zram.
- Debian 13 "Trixie": paket [mosquitto 2.0.21](https://packages.debian.org/trixie/mosquitto) (berkas `mosquitto.conf`, `conf.d`, berkas unit systemd, rotasi catatan), [systemd 257](https://packages.debian.org/trixie/systemd) (tampilan `systemctl status`, baris *journal*, `Restart=`, `systemctl edit`), [apt 3.0](https://packages.debian.org/trixie/apt) (tampilan `update` dan `install`), [nano 8.4](https://packages.debian.org/trixie/nano) (baris bantuan dan pertanyaan simpan), dan `motd` dari paket base-files; manual di [manpages.debian.org](https://manpages.debian.org/trixie/) (`journalctl`, `systemd.service`, `mosquitto.conf`, `nmcli`, `hostname`).
- [Mosquitto](https://github.com/eclipse-mosquitto/mosquitto) 2.0.21 (teks catatan di Pi) dan 2.1.2 (layanan Windows `mosquitto install`, pembacaan `log_dest file`, penginstal); halaman [Authentication methods](https://mosquitto.org/documentation/authentication-methods/).
- NetworkManager 1.52 dan netplan 1.1.2, kode sumber (pesan `nmcli`, nama sambungan `netplan-eth0`), serta diskusi [trixie-feedback #3](https://github.com/raspberrypi/trixie-feedback/issues/3) (pengaturan `nmcli` bertahan setelah Pi menyala ulang).
- [OpenSSH](https://github.com/openssh/openssh-portable) 9.5 dan 10.0, kode sumber (sapaan pertama, sidik jari, `REMOTE HOST IDENTIFICATION HAS CHANGED`, `ssh-keygen`); Microsoft: [OpenSSH untuk Windows](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse) dan [mDNS in the Enterprise](https://techcommunity.microsoft.com/blog/networkingblog/mdns-in-the-enterprise/3275777) (`.local` sejak Windows 10 1703); Android: [DNS Resolver](https://source.android.com/docs/core/architecture/modular-system/dns-resolver) (`.local` sejak November 2021).
- [MQTTX](https://github.com/emqx/MQTTX/tree/v1.13.1) 1.13.1, kode sumber: ikon **Disconnect**, nama klien `mqttx_…`, langganan yang dipasang lagi setiap kali tersambung, serta bawaan MQTT 5.0 dengan *keep-alive* 60 detik.
- Homebrew: formula [mosquitto](https://formulae.brew.sh/formula/mosquitto) (`brew services`, letak `mosquitto.conf`).
- Kartu microSD: halaman produk [SanDisk High Endurance](https://www.sandisk.com/products/memory-cards/microsd-cards/sandisk-high-endurance-uhs-i-microsd) dan [SanDisk MAX Endurance](https://www.sandisk.com/products/memory-cards/microsd-cards/sandisk-max-endurance-uhs-i-microsd) (jam rekaman), SD Association: [Application Performance Class](https://www.sdcard.org/developers/sd-standard-overview/application-performance-class/) (A1/A2), dan LWN: [Optimizing Linux with cheap flash drives](https://lwn.net/Articles/428584/) (blok hapus dan *write amplification*); [Win32 Disk Imager](https://sourceforge.net/projects/win32diskimager/) 1.0.0.

**Gambar.** Diagram buatan sendiri dilisensikan **CC BY 4.0**, dan berkas sumber `.svg`-nya disertakan di folder `aset/` supaya bisa kamu ubah. Kolase tangkapan layar Raspberry Pi Imager mengikuti lisensi dokumentasi Raspberry Pi, **CC BY-SA 4.0**, dan foto Raspberry Pi 5 berlisensi **CC BY 4.0** dari pemotretnya. Rekap lengkap juga ada di [`aset/SUMBER.md`](aset/SUMBER.md).

| File | Sumber | Lisensi / keterangan |
| :--- | :--- | :--- |
| `peta-jalan-modul-12`, `gateway-di-rumah`, `ssh-terminal-jarak-jauh`, `peta-folder-linux` (`.png` + `.svg`) | Diagram orisinal kurikulum Fullstack IoT Developer. Teks terminal dan jalur folder dari Raspberry Pi OS 2026-10-06 dan paket Mosquitto Debian; alamat dan nama hanya contoh. | CC BY 4.0 |
| `systemd-satpam`, `kartu-microsd-aus`, `diagram-gateway-proyek` (`.png` + `.svg`) | Diagram orisinal. Aturan layanan dari berkas unit `mosquitto.service` Debian; keausan kartu dari dokumentasi Raspberry Pi dan LWN; arti kode A1/A2 dari SD Association. | CC BY 4.0 |
| `kenali-raspberry-pi-5.jpg` | Foto [Raspberry Pi 5](https://commons.wikimedia.org/wiki/File:Raspberry_Pi_5.jpg) oleh SimonWaldherr, Wikimedia Commons; dipotong, label oleh penulis. | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `imager-langkah-1-4.png`, `imager-langkah-5-8.png`, `imager-langkah-10-11.png` | Tangkapan layar Raspberry Pi Imager dari [dokumentasi resmi Raspberry Pi](https://github.com/raspberrypi/documentation) (Raspberry Pi Ltd); disusun ulang, diberi nomor langkah dan keterangan oleh penulis. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), mengikuti tangkapan aslinya |

**Tentang kotak Hasilnya.** Modul ini disusun tanpa Raspberry Pi di meja penulis. Karena itu, semua kotak **Hasilnya** dari Pi, dan dari terminal laptop yang berbicara dengan Pi, bertanda **contoh**: susunan dan teks setiap barisnya diambil dari kode sumber program dengan versi yang sama (Imager 2.0.12, OpenSSH, Mosquitto 2.0.21, systemd 257, apt 3.0.3, nano 8.4, NetworkManager 1.52) dan dari dokumentasi resminya, sedangkan alamat, angka, tanggal, nomor program (PID), dan sidik jari hanya contoh. Lebar kolom di beberapa tampilan, misalnya `systemctl status` dan baris bantuan nano, bisa sedikit berbeda di layarmu. Tangkapan layar Imager berasal dari dokumentasi resmi (Imager 2.0, akhir 2025); label-labelnya dicocokkan dengan kode sumber Imager 2.0.12, kecuali angka ukuran kartu (`29.7 GB`), yang di Imager lama masih dihitung dengan 1 GB = 1.073.741.824 byte. Node 1 v1.2.1 hanya mengubah empat baris dari v1.2.0 yang sudah diuji di Modul 11; versi ini dikompilasi ulang dengan paket esp32 versi 3 dan setelan papan asli (1.188.032 byte, sama dengan v1.2.0), lalu dijalankan di Wokwi dengan broker publik. Contoh Serial Monitor di ➕ B mengikuti susunan rekaman itu, dengan alamat dan `device_id` dari jaringan rumah.

---

[⬅️ Modul 11](../modul-11-mqtt-dan-kontrak-data/README.md) · [Silabus](../../SILABUS.md) · [Pelacak progres](../../PROGRES.md) · **Berikutnya: [Modul 13 — Node-RED & Dashboard 2: Dashboard Pertama Tanpa Koding](../modul-13-node-red-dashboard/README.md) ➡️**
