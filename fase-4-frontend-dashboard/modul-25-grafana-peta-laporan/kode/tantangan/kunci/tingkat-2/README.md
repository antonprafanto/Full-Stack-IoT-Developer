# Kunci Tantangan 2 Modul 25: pindahkan titik perangkat lewat Peta

**Tugas:** admin memindah titik perangkat langsung di layar **Peta** (tanpa Bruno): pilih perangkatnya, klik letak baru di peta, periksa
angkanya, lalu simpan lewat `PUT /devices/:id/lokasi` (backend 1.2). Formulirnya memakai react-hook-form + Zod seperti formulir aturan
Modul 24. Akun viewer tidak melihat tombol apa pun (satpam backend tetap menolak 403).

Berkas kunci (hanya yang berubah dari frontend 1.1.0; **116 baris baru**, termasuk komentar):

| Berkas | Isinya |
| :--- | :--- |
| `frontend/src/components/PindahTitik.tsx` | **baru** (78 baris): skema Zod `Titik` (kalimat galat sama dengan skema `Lokasi` backend), `FormTitik` (react-hook-form + `zodResolver`, kolom lintang/bujur `type="number"` + `valueAsNumber`, isi awal = titik klik dibulatkan 6 angka di belakang titik, galat server di `root.server`), dan `PindahTitik` (`useMapEvents` → klik peta → `<Popup position={…}>` berisi formulir; `key` = titik klik, jadi setiap klik baru = formulir baru tanpa efek) |
| `frontend/src/components/PetaPerangkat.tsx` | +28/−4: `useAdmin()` + keadaan `dipindah`; tombol **Pindahkan titik** di popup penanda (admin saja); `<PindahTitik>` di dalam `<MapContainer>` selama mode pindah; kalimat **Klik peta di letak baru untuk …** + tombol **Selesai**; tombol **Taruh … di peta** untuk perangkat yang belum punya titik |
| `frontend/src/api.ts` | +10: `ubahLokasi(deviceId, lat, lng)` → `PUT /devices/:id/lokasi` |

Cara memakai berkas kunci: salin ketiganya ke folder `frontend/src` proyekmu (menimpa yang lama), lalu `npm run dev`.

## Alur

1. Admin membuka **Peta**, mengetuk penanda, lalu **Pindahkan titik** (perangkat tanpa titik: tombol **Taruh … di peta** di bawah peta).
2. Kalimat **Klik peta di letak baru untuk …** tampil. Klik di peta (bukan di penanda) membuka kotak **Pindahkan … ke sini?** berisi
   **Lintang (lat)** dan **Bujur (lng)** titik klik itu. Angkanya masih boleh diketik ulang.
3. **Simpan titik**: Zod memeriksa dulu di browser (misalnya lintang `91` → `lintang paling besar 90`, tanpa permintaan ke server). Lolos →
   `PUT`, lalu daftar perangkat diambil ulang (`GET /devices`), penanda pindah, peta dipaskan ulang, dan toast **Titik … dipindah.**
4. **Batal** atau **Selesai** = keluar dari mode pindah. ✕ di kotak = batal memilih titik itu saja (klik peta lagi untuk titik lain).

**Hasilnya (lab penulis, 26 Okt 2026 ±22.55–22.57 WIB, backend 1.2 sungguhan, Chrome 156):**

```text
klik peta  -> Lintang (lat) -6.176038 | Bujur (lng) 106.825519
lat 91     -> "lintang paling besar 90" di bawah kolomnya, 0 permintaan PUT
-6.1751 / 106.8268 -> PUT /devices/f00d00000001/lokasi {"lat":-6.1751,"lng":106.8268} -> 200
              toast "Titik Latihan ruang tamu dipindah.", penanda pindah, kalimat mode pindah hilang
Taruh Latihan teras di peta -> klik -> Simpan titik -> 3 penanda (sebelumnya 2), toast "Titik Latihan teras dipindah."
viewer     -> popup tanpa "Pindahkan titik", tanpa tombol "Taruh … di peta"
```

`npm run lint`: `Found 0 warnings and 0 errors.` (50 berkas); `npm run build`: lulus dengan satu peringatan 500 kB yang sama (JS
1.050,80 kB, gzip 313,03 kB); `npm run cek-skema`: dua `SAMA`.

## Catatan

- Skema `Titik` ditulis di frontend (tidak disalin dari backend), karena `Lokasi` backend tinggal di `routes/perangkat.ts`, bukan di
  `schemas/` yang disalin `cek-skema`. Kalimat galatnya sengaja disamakan; backend tetap pemeriksa terakhir.
- Pilih titik baru di tempat kosong peta, bukan tepat di atas penanda lain: ketukan di penanda membuka popup penanda itu.
- Koordinat rumah = data pribadi: setelah mencoba dengan titik sungguhan, jangan bagikan tangkapan layar peta tanpa disamarkan.
