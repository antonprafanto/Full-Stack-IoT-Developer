// versi.h - membandingkan nomor versi firmware SemVer x.y.z (Modul 28), tanpa library tambahan.
// Kenapa tidak dibandingkan sebagai teks saja? Karena "1.10.0" < "1.9.0" kalau dibaca huruf demi huruf ("1" < "9"),
// padahal 1.10.0 lebih baru. Setiap bagian harus dibandingkan sebagai ANGKA, dari kiri: MAJOR, lalu MINOR, lalu PATCH.
// Fungsi yang sama (dengan nama yang sama) ada di backend: services/versi.ts.
// File ini sengaja tidak memakai apa pun dari Arduino supaya bisa diuji di laptop (uji host).
#pragma once

const int PANJANG_VERSI_MAKS = 17;  // "99999.99999.99999": tiga bagian, masing-masing paling banyak 5 angka

bool versiSah(const char* teks);  // true kalau berbentuk x.y.z: tiga bagian angka (1-5 angka), dipisah titik

// Hasilnya negatif kalau a lebih lama dari b, 0 kalau sama, positif kalau a lebih baru (seperti pembanding sort()).
// Periksa dulu keduanya dengan versiSah(): versi yang bentuknya salah dianggap SAMA (hasil 0), jadi perintah
// pembaruan dengan versi aneh selalu ditolak, tidak pernah diam-diam dipasang.
int bandingkanVersi(const char* a, const char* b);
