# Kunci Tantangan 2 Modul 29: satpam versi, bagian "versi wajib naik"

**Tugas (isi rumpang):** kerangka [`cek-versi-rumpang.mjs`](cek-versi-rumpang.mjs) sudah memeriksa "satu nomor versi di semua
tempat", tetapi bagian keduanya masih kosong: dibanding `main`, kalau yang **dipasang** di VPS/Pi berubah, versinya wajib naik,
dan versi tidak pernah boleh turun. Isi TODO 1–3, lalu buktikan dengan percobaan di bawah.

> [!NOTE]
> **Dijalankan penulis** pada 4 November 2026 (Node.js 24.21.0, Git di Raspberry Pi 5, repo latihan sekali pakai berisi riwayat
> proyek Modul 28 + Modul 29): jawaban di bawah memberi hasil yang benar untuk 20 percobaan, sedangkan kerangka tanpa TODO
> terisi meloloskan 7 di antaranya (semua "versi lupa naik" dan *revert* polos). Keluaran di bawah dipotong ke baris bermakna.

| Berkas | Isi |
| :--- | :--- |
| [`cek-versi-rumpang.mjs`](cek-versi-rumpang.mjs) | kerangka (soal): taruh di `skrip/cek-versi.mjs` di cabang latihanmu |
| [`../../../skrip/cek-versi.mjs`](../../../skrip/cek-versi.mjs) | jawaban utuh = berkas proyek yang dijalankan robot |
| [`perubahan.diff`](perubahan.diff) | kerangka → jawaban dalam bentuk diff (hanya fungsi `ikutDipasang()` dan dua pemeriksaan di bagian 2) |

## Jawabannya

**TODO 1, "apa yang dipasang".** Cocokkan dengan apa yang benar-benar dibaca VPS dan Pi: isi *image* (baris `COPY` di kedua
`Dockerfile`, dikurangi `.dockerignore`), berkas Compose, dan berkas yang dibaca kontainer langsung dari repo (`volumes:`), juga
skrip yang dijalankan `pasang.sh`:

```js
function ikutDipasang(berkas) {
  if (berkas.endsWith(".md") || berkas.endsWith(".test.ts")) return false;
  if (berkas.startsWith("backend/")) {
    return /^backend\/(Dockerfile|\.dockerignore|package\.json|package-lock\.json)$/.test(berkas)
      || (/^backend\/(src|migrasi)\//.test(berkas) && !berkas.startsWith("backend/src/integrasi/"));
  }
  if (berkas.startsWith("frontend/")) {
    return !/^frontend\/(\.oxlintrc\.json|cek-skema\.js|\.env\.example|\.gitignore)$/.test(berkas);
  }
  return berkas === "compose.cloud.yml"
    || /^edge\/(compose\.edge\.yml|gerbang\.conf|pusat\.conf|pusat-internet\.conf|acl-broker)$/.test(berkas)
    || /^grafana\/(provisioning|dashboards)\//.test(berkas) || berkas === "grafana/pengguna-grafana.sql"
    || /^skrip\/[^/]+\.sh$/.test(berkas);
}
```

Backend memakai daftar "yang ikut" (`Dockerfile` backend hanya menyalin `package*.json`, `migrasi/`, dan `src/`), frontend
memakai daftar "yang tidak ikut" (`Dockerfile` frontend menyalin seluruh folder). `src/integrasi/` dikecualikan walau bukan
berkas `*.test.ts`, karena `.dockerignore` backend menahannya. `skrip/*.sql` (alat manusia), `skrip/cek-versi.mjs` (hanya
dijalankan robot), dan `.github/workflows/` tidak dipasang di VPS/Pi, jadi boleh berubah tanpa rilis.

**TODO 2 dan 3, urutannya penting.** Periksa "turun" dulu, baru "lupa naik"; keduanya `else if`, supaya *revert* polos hanya
mendapat satu pesan yang tepat:

```js
  if (!naik && versi !== versiBasis) {
    salah.push(`versi ${versi} lebih KECIL dari ${versiBasis} di ${basis}: versi hanya boleh naik. Mengembalikan isi lama `
      + `(revert)? Isinya boleh lama, nomornya tetap NAIK (misalnya ${patchBerikut}), `
      + "dengan entri \"Diperbaiki: mengembalikan …\" di CHANGELOG.md.");
  } else if (dipasang.length > 0 && !naik) {
    salah.push(`yang dipasang di VPS/Pi berubah (${contoh}) tetapi versinya masih ${versi} (= ${basis}). …`);
  }
```

## Percobaan

Dari cabang latihan (misalnya `coba/versi`), sesudah `git fetch origin`. Ubahan yang belum di-*commit* ikut dihitung, jadi
kembalikan dengan `git restore .` sesudah setiap percobaan. PowerShell: `$env:BASIS = "origin/main"; node skrip/cek-versi.mjs`.

| Percobaan | Perintah sesudah ubahan: `BASIS=origin/main node skrip/cek-versi.mjs` | Kode keluar |
| :--- | :--- | :---: |
| ubah `README.md` saja | `LULUS  … dibanding origin/main: tidak ada berkas yang dipasang berubah, versi tetap 2.0.0 (boleh)` | 0 |
| ubah satu baris di `frontend/src/csv.ts`, versi tetap | `GAGAL  yang dipasang di VPS/Pi berubah (frontend/src/csv.ts) tetapi versinya masih 2.0.0 (= origin/main). …` | 1 |
| ubah `edge/acl-broker`, versi tetap | `GAGAL  yang dipasang di VPS/Pi berubah (edge/acl-broker) …` | 1 |
| ubah `frontend/src/csv.test.ts` saja | `LULUS` (tes tidak ikut *image*) | 0 |
| ubahan `csv.ts` + versi 2.0.1 lengkap + entri `CHANGELOG.md` | `LULUS  satu nomor versi 2.0.1 di 10 tempat … dibanding origin/main (2.0.0): versi naik, … berkas yang dipasang berubah` | 0 |
| `main` sudah 2.0.1, cabang kembali ke 2.0.0 (*revert* polos) | `GAGAL  versi 2.0.0 lebih KECIL dari 2.0.1 di origin/main: versi hanya boleh naik. … (misalnya 2.0.2) …` | 1 |
| *revert* + versi 2.0.2 + entri `CHANGELOG.md` | `LULUS  satu nomor versi 2.0.2 …` | 0 |

Selesai berlatih: `git switch main`, lalu `git branch -D coba/versi` (kerangka tidak pernah di-*merge*).
