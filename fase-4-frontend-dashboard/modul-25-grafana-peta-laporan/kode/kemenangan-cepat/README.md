# Kemenangan Cepat Modul 25: panel pertama, suhu rumahmu di Grafana

Bahan untuk 🏆 Kemenangan Cepat Modul 25 (±25 menit): Grafana 13.2.4 menyala di samping database, membaca TimescaleDB dengan akun
hanya-baca `grafana_baca`, lalu menggambar suhu setiap perangkat. Perintah lengkap dan alasannya ada di `grafana/README.md` proyek;
berkas ini hanya urutan singkatnya.

| Berkas | Isinya |
| :--- | :--- |
| `kueri-suhu.sql` | kueri panel pertama (rata-rata suhu per perangkat, makro `$__timeGroupAlias` dan `$__timeFilter`) |
| `panel-pertama.json` | dashboard "Panel pertama" berisi panel itu, diekspor dari Grafana 13.2.4 sebagai JSON **Classic** dengan **Share dashboard with another instance** menyala. Hanya untuk jalan pintas bila langkah 6 macet |

## Urutan langkah

Sebelumnya (di 🧰, di luar hitungan 25 menit): `docker pull grafana/grafana:13.2.4` (sekitar 445 MB untuk arm64). Kontainer database
`rumahpintar-db` (Modul 17) harus sudah berjalan, dan sebaiknya simulator atau Node 1 sedang mengirim data.

1. **Lorong antarkontainer** (sekali saja): `docker network create rumahpintar`, lalu `docker network connect rumahpintar rumahpintar-db`.
2. **Grafana**: perintah `docker run` satu baris dari `grafana/README.md` langkah 2 (nama `rumahpintar-grafana`, `-p 127.0.0.1:3000:3000`,
   empat setelan `GF_…`, volume `rumahpintar-grafana-data`, tag persis `grafana/grafana:13.2.4`).
3. Buka `http://localhost:3000`, masuk dengan **Email or username** `admin` dan **Password** `admin`, klik **Log in**. Di layar **Update your
   password** isi **New password** dan **Confirm new password**, lalu klik **Submit** (bukan **Skip**).
4. **Akun hanya-baca** `grafana_baca`: tiga perintah `docker cp …`, `docker exec … -f …`, `docker exec -it … "\password grafana_baca"` dari
   `grafana/README.md` langkah 4.
5. **Data source**: menu kiri **Connections → Data sources → Add data source**, klik **PostgreSQL**. Grafana langsung membuat data source
   bernama `grafana-postgresql-datasource` dan membuka formulirnya. Isi **Host URL** `rumahpintar-db:5432`, **Database name** `rumahpintar`,
   **Username** `grafana_baca` dan **Password**-nya, **TLS/SSL Mode** pilih `disable`. Di **Additional settings**, nyalakan sakelar
   **TimescaleDB** (**Version** terisi `17` sendiri). Di **Connection limits**, isi **Max open** `4` (akun `grafana_baca` hanya boleh
   5 sambungan; alasannya di `grafana/README.md` langkah 5). Klik **Save & test** sampai muncul **Database Connection OK**.
6. **Panel**: **Dashboards → New → New dashboard**. Di panel kanan **Add**, klik kotak **Panel** (*Drag or click to add a panel*), lalu
   **Configure visualization**. Di bawah grafik, ubah **Builder** menjadi **Code**, tempel isi `kueri-suhu.sql`, ubah **Format** dari
   `Table` menjadi **`Time series`**, lalu klik **Run query**: satu garis untuk setiap `device_id`. Coba rentang **Last 1 hour**, lalu
   **Last 24 hours** (tombol jam di kanan atas). Simpan dengan **Save** (isi **Title**, misalnya `Panel pertama`, lalu **Save**).

**Jalan pintas bila langkah 6 macet:** **Dashboards → New → Import dashboard**. Tempel seluruh isi `panel-pertama.json` di kotak **Import
via dashboard JSON model**, lalu klik **Load** yang ada di BAWAH kotak itu (tombol **Load** yang pertama untuk alamat grafana.com). Di layar
**Options**, kotak `DS_GRAFANA-POSTGRESQL-DATASOURCE` (*Select a grafana-postgresql-datasource data source*) pilih data source dari
langkah 5, lalu klik **Import**.

## Jebakan yang terlihat di lab

- **Format `Table`** (bawaan editor) menggambar SATU garis bernama `suhu` yang melompat-lompat antarperangkat, karena kolom `metric`
  hanya dipakai untuk memisah garis pada format **Time series**.
- Panel kosong (**No data**) padahal data source OK: rentang waktu terlalu pendek untuk perangkat yang lama diam, atau perangkat belum
  mengirim apa pun. Node 2 (Kebun) hanya mengirim tiap 5 menit, jadi tampil sebagai titik-titik terpisah, bukan garis.
- Jangan memakai akun `postgres` di data source: Grafana sendiri mengingatkan di formulirnya (*Grafana does not validate that queries
  are safe*); akun `grafana_baca` hanya bisa `SELECT`.
