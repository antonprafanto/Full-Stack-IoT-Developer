# Kunci Tantangan 3 Modul 27: pita "Gerbang rumah terputus"

**Tugas:** saat internet rumah putus, dashboard di VPS masih menulis perangkat **Online** dengan angka yang tidak bergerak (status
terakhirnya *retained*, dan wasiat perangkat ada di broker Pi, bukan di VPS). Buat pita di bawah kepala dashboard yang muncul selama
jembatan gerbang rumah terputus, dari kabar jembatan yang sudah dikirim broker: topik `$SYS/broker/connection/jembatan-pi/state`
(`1` = tersambung, `0` = putus; Praktik 4 dan 9 menyalakannya dengan `notifications true`).

| Berkas kunci | Ditaruh di proyek sebagai |
| :--- | :--- |
| [`backend/src/services/jembatan.ts`](backend/src/services/jembatan.ts) | berkas BARU `backend/src/services/jembatan.ts`: mengingat keadaan setiap jembatan, menulis log, dan meneruskannya ke dashboard |
| [`frontend/src/components/PitaJembatan.tsx`](frontend/src/components/PitaJembatan.tsx) | berkas BARU `frontend/src/components/PitaJembatan.tsx`: pita kuning `role="status"` |
| [`perubahan.diff`](perubahan.diff) | lima perubahan kecil di berkas yang sudah ada (+28 baris, −1): `backend/src/services/mqtt.ts`, `backend/src/services/realtime.ts`, `frontend/src/types.ts`, `frontend/src/components/TataLetak.tsx`, `edge/acl-broker` |

## Jalan pesannya

1. **Broker pusat (VPS, atau Pi jalur gratis).** Jembatan menulis `1` begitu tersambung dan menitipkan wasiat `0`. Saat internet rumah
   putus, broker pusat baru sadar sesudah jembatan diam melewati batas *keepalive* (60 detik × 1,5), lalu menerbitkan wasiat itu
   sendiri. Keduanya pesan *retained*: siapa pun yang berlangganan belakangan langsung mendapat keadaan terakhirnya.
2. **Izin broker** (`edge/acl-broker`, butir 3): akun `backend` diberi `topic read $SYS/broker/connection/+/state`. Tanda `#` di
   `rpm/#` tidak pernah mencakup topik berawalan `$SYS`, jadi izinnya ditulis sendiri. Tanpa baris ini langganan backend diam saja
   (tidak ada galat). Sesudah mengubah ACL: `docker compose restart mosquitto` (restart, bukan reload; Modul 21).
3. **Backend** (`mqtt.ts`): berlangganan `$SYS/broker/connection/+/state` di samping `rpm/#`; pesan bertopik `$SYS/…` diserahkan ke
   `terimaKabarJembatan()` di `jembatan.ts`, bukan ke pemeriksa kontrak data. `jembatan.ts` hanya bereaksi bila keadaannya BERUBAH,
   menulis log (`jembatan jembatan-pi TERPUTUS: …` / `jembatan jembatan-pi tersambung`), lalu `siarkanJembatan()` di `realtime.ts`
   mengirim acara Socket.IO `jembatan` ke semua dashboard. Dashboard yang baru tersambung langsung menerima keadaan semua jembatan yang
   sudah terdengar (di `io.on("connection")`).
4. **Dashboard** (`PitaJembatan.tsx`, dipasang `TataLetak.tsx` tepat di bawah kepala): memasang pendengar `jembatan` di efeknya dan
   melepasnya lagi di *cleanup* dengan fungsi yang sama (aturan Modul 23), memakai soket yang SATU dari `soket.ts`. Pita hanya tampil
   untuk jembatan yang `tersambung: false`. "Sejak" = jam backend MENDENGAR kabar putusnya (jam broker pusat sadar, bukan jam internet
   rumah benar-benar putus); kabar *retained* lama (backend baru menyala saat jembatan sudah putus) tidak punya jam, jadi pita menulis
   "Gerbang rumah terputus" saja.

## Langkah

1. Salin dua berkas baru ke tempatnya, lalu terapkan `perubahan.diff`: simpan di akar proyek dan jalankan `git apply perubahan.diff`
   (hapus berkas diff-nya sesudah itu), atau ketik perubahannya dengan tangan (baris `+` ditambah, baris `-` dibuang; setiap tambahan
   diberi komentar "Tantangan 3 Modul 27").
2. Di folder `backend`: `npm run cek` dan `npm test`. Di folder `frontend`: `npm run lint` dan `npm run build`.
3. Dari akar proyek: `docker compose up -d --build backend web`, lalu `docker compose restart mosquitto` (ACL baru).
4. Log backend menulis `jembatan jembatan-pi tersambung` (kabar *retained* `1`). Cabut internet rumah (Praktik 10) atau, untuk mencoba
   di LAN, putuskan jembatan seperti di Praktik 4 (4.4); tunggu sampai ±1,5 menit. Pita muncul di semua dashboard yang terbuka, juga sesudah
   dimuat ulang. Sambungkan lagi: pita hilang beberapa detik sesudah jembatan tersambung kembali.

## Hasilnya (lab penulis)

Raspberry Pi 5, Docker Engine 29.1.3, Compose 2.40.3, Chrome 156 tanpa layar (412 px), 29 Okt 2026 ±18.34–18.38 WIB. Broker pusat =
`compose.cloud.yml` mode laptop (backend 1.4.0 + kunci ini, dashboard 1.3.0 + kunci ini); "gerbang rumah" = kontainer Mosquitto 2.1.2
dengan jembatan setelan Modul 27 (`cleansession true`, `local_cleansession false`, `notifications true`, topik sempit) yang tersambung ke
broker pusat lewat lorong Compose; "internet putus" = `docker network disconnect` kontainer gerbang itu (tiruan, bukan router rumah).

```text
backend-1  | [18:34:56] INFO: jembatan jembatan-pi tersambung
backend-1  | [18:37:24] WARN: jembatan jembatan-pi TERPUTUS: data dari rumah tertahan di gerbang sampai tersambung lagi
backend-1  | [18:37:35] INFO: jembatan jembatan-pi tersambung
```

Broker pusat: `Client jembatan-pi [172.19.0.4:43938] disconnected: exceeded timeout.` lalu, sesudah disambung lagi, `New bridge connected
from 172.19.0.4:40680 as jembatan-pi (p4, c1, k60, u'jembatan-pi').` Pita `Gerbang rumah terputus sejak 18.37.24 WIB (jembatan-pi).
Status dan angka perangkat di rumah bisa basi; data yang tertahan di gerbang dikirim sendiri begitu sambungannya pulih.` muncul **69 detik**
sesudah dicabut (18.36.16), tetap tampil sesudah halaman dimuat ulang, dan hilang **6 detik** sesudah disambung lagi. `npm run cek` dan
`npm test` backend (17 berkas, 118 tes, diulang di atas backend 1.4.0 terakhir) lulus; `npm run lint` dan `tsc -b` dashboard bersih. Pita di HP sungguhan dan saat internet rumah
sungguhan dicabut belum dicoba penulis.

## Batas

- Pita hanya tahu jembatan yang **pernah terdengar** sejak backend menyala (atau kabar *retained*-nya). Gerbang yang belum pernah
  tersambung sama sekali tidak memunculkan pita.
- Yang dilaporkan adalah jalur gerbang → pusat, bukan perangkatnya: Node 1 yang mati di rumah sementara internet baik-baik saja tetap
  dilaporkan seperti biasa (status `offline` dari wasiat perangkat di broker Pi, diteruskan jembatan).
- Tidak ada kabar Telegram untuk jembatan putus: Grafana "Node diam" (Modul 25) sudah mengabari saat data berhenti mengalir.
