# Kunci Tantangan 2 Modul 28: `bandingkanVersi()` dan lencana `perlu diperbarui`

**Tugas (isi rumpang):** server memutuskan perangkat mana yang **perlu diperbarui** dengan membandingkan versi firmware yang dilaporkan
perangkat dengan rilis terbaru. Versi tidak bisa dibandingkan sebagai teks biasa: dibaca huruf demi huruf, `"1.10.0"` lebih kecil daripada
`"1.9.0"` (karena `"1"` lebih kecil daripada `"9"`), padahal 1.10.0 lebih baru. Isi tiga baris `____` di `bandingkanVersi()` supaya ketiga
bagian versi (MAJOR.MINOR.PATCH) dibandingkan sebagai **angka**, dari kiri.

Kunci jawabannya adalah berkas [`backend/src/services/versi.ts`](../../../backend/src/services/versi.ts) di folder `kode/` modul ini, yang
sudah lengkap; tantangan ini hanya mengosongkan tiga barisnya.

## Soal

```ts
const POLA = /^(\d+)\.(\d+)\.(\d+)$/; // sama dengan Versi di kontrak data: tanpa awalan "v" dan tanpa akhiran "-uji"

export function bandingkanVersi(a: string, b: string): number {
  const x = POLA.exec(a);
  const y = POLA.exec(b);
  if (x === null || y === null) throw new Error(`versi harus berbentuk x.y.z, misalnya 1.7.1: "${x === null ? a : b}"`);
  for (let i = 1; i <= 3; i++) {
    ____ // (1) selisih bagian ke-i, dihitung sebagai ANGKA
    ____ // (2) bagian ini sudah berbeda? langsung jawab -1 atau 1
  }
  ____ // (3) ketiga bagian sama
}
```

## Jawaban

| Rumpang | Jawaban |
| :--- | :--- |
| (1) | `const beda = Number(x[i]) - Number(y[i]);` |
| (2) | `if (beda !== 0) return Math.sign(beda);` |
| (3) | `return 0;` |

## Penjelasan baris demi baris

1. `POLA.exec(a)` mencocokkan teks versi dengan pola `x.y.z`. Hasilnya sebuah daftar: `x[0]` teks utuhnya (`"1.10.0"`), lalu `x[1]` MAJOR
   (`"1"`), `x[2]` MINOR (`"10"`), dan `x[3]` PATCH (`"0"`), masih berupa **teks**. Teks yang bentuknya lain (`"v1.7.1"`, `"1.7"`,
   `"1.7.2-uji"`) menghasilkan `null`.
2. `if (x === null || y === null) throw …`: versi yang bentuknya salah adalah galat pemrograman, jadi dilempar sebagai `Error`, bukan
   diam-diam dianggap sama.
3. `for (let i = 1; i <= 3; i++)`: periksa bagian 1, 2, lalu 3 (MAJOR, MINOR, PATCH), selalu dari kiri.
4. **(1)** `Number(…)` mengubah teks menjadi angka sebelum dikurangi: `Number("10") - Number("9")` = `1` (positif: `a` lebih baru).
   Kalau tetap teks, `"10"` < `"9"`, dan hasilnya terbalik.
5. **(2)** `Math.sign(beda)` merapikan selisih apa pun menjadi `-1`, `0`, atau `1`. Begitu satu bagian berbeda, jawabannya langsung
   dikembalikan: `2.0.0` dibanding `1.99.99` sudah selesai di MAJOR (`2` > `1`), MINOR dan PATCH tidak perlu dilihat lagi.
6. **(3)** `return 0;`: kalau ketiga putaran lewat tanpa beda, kedua versi sama persis.

Hasilnya mengikuti aturan pembanding `sort()` di JavaScript (negatif = lebih lama, 0 = sama, positif = lebih baru), jadi
`["1.10.0", "1.9.0", "1.7.1"].sort(bandingkanVersi)` mengurutkan versi dari yang paling lama.

## Di mana dipakai, dan lencana `perlu diperbarui`

- `versiTertinggi()` (berkas yang sama) memilih **rilis terbaru** dari daftar rilis yang bukan uji dan belum ditarik: `terbaru` di `GET /firmware`
  dan `rilis_terbaru` di `GET /armada`.
- `routes/armada.ts`: `perlu_update` bernilai `true` untuk Node 1 aktif yang versinya lebih lama daripada rilis terbaru (`bandingkanVersi(fw,
  terbaru) < 0`). Itulah lencana kuning **`perlu diperbarui`** di kartu perangkat layar **Armada**, dan hitungan "· N perlu diperbarui" di
  bawah judulnya.
- `services/ota.ts` (`alasanTidakBisa()`): versi yang lebih lama daripada versi sekarang hanya dikirim dengan **paksa** (turun versi).
- Firmware Node 1 punya saudaranya dalam C++ dengan nama yang sama, `firmware/node-1-rumah/versi.cpp` (versi yang bentuknya salah di sana dianggap
  sama, jadi perintah pembaruan dengan versi aneh selalu ditolak papan).

## Uji

Dari folder `backend`, jalankan hanya uji versi (Vitest menyaring berkas yang namanya memuat `versi`):

```bash
npm test -- versi
```

Hasil di lab penulis (Raspberry Pi 5, Node.js 24.21.0, backend 1.5.0):

```text
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

Lalu semua uji backend dengan `npm test`: `Test Files  25 passed (25)` dan `Tests  203 passed (203)`.

Kalau rumpang (1) diisi perbandingan teks, misalnya `const beda = x[i] < y[i] ? -1 : x[i] > y[i] ? 1 : 0;`, tiga dari lima uji gagal. Di lab
penulis (salinan yang sengaja diisi salah):

```text
 FAIL  src/services/versi.test.ts > bandingkanVersi > 1.10.0 LEBIH BARU daripada 1.9.0 (perbandingan teks biasa salah di sini)
AssertionError: expected -1 to be 1 // Object.is equality
      Tests  3 failed | 2 passed (5)
```

Dua uji lain yang ikut gagal: `1.07.1` dan `1.7.1` dianggap berbeda (seharusnya sama sebagai angka), dan `versiTertinggi()` memilih `1.9.3`,
bukan `1.10.0`.

Mau melihat lencananya di layar? Unggah dua berkas firmware tiruan (dari [`alat/buat-bin-tiruan.js`](../../../alat/buat-bin-tiruan.js)) berversi
1.9.0 lalu 1.10.0 di layar **Armada**. Di lab penulis (backend 1.5.0, 21 perangkat tiruan memakai 1.7.7 dan 1.7.9), `GET /firmware` menjawab
`"terbaru": {"node1": "1.10.0"}`, dan ke-21 kartu mendapat `perlu diperbarui`; urutan teks biasa akan memilih `1.9.0`. Tidak satu pun berkas
itu dikirim ke perangkat.
