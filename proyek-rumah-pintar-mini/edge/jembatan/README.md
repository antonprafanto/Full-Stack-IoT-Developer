# Folder jembatan (Modul 26)

Broker gerbang di Raspberry Pi membaca **setiap berkas `.conf`** di folder ini (`include_dir` di [`../gerbang.conf`](../gerbang.conf)).
Isinya satu berkas, `pusat.conf`, salinan [`../jembatan.contoh.conf`](../jembatan.contoh.conf) dengan sandi akun `jembatan-pi`:

```bash
cp jembatan.contoh.conf jembatan/pusat.conf
```

(diketik dari folder `edge`, lalu ganti `ganti-dengan-sandi-akun-jembatan-pi` dengan sandinya). Berkas `.conf` di folder ini
**tidak ikut Git** (`.gitignore` akar proyek) karena berisi sandi. Berkas `README.md` ini sengaja ikut Git supaya foldernya
sudah ada sesudah `git clone`: kalau folder ini belum ada saat `docker compose up`, Docker di Linux membuatnya sendiri sebagai
milik `root`, dan kamu tidak bisa menyalin `pusat.conf` ke dalamnya tanpa `sudo`.
