// kunci.contoh.h - CONTOH isi kunci.h (Modul 14, Praktik 8). File ini boleh ikut ke GitHub; tidak ada kode yang memakainya.
// Cara pakai: buat tab baru bernama kunci.h di folder node-1-rumah DAN node-2-kebun, salin isi file ini ke sana,
// lalu ganti PAKAI_ENKRIPSI menjadi true dan kedua kunci dengan milikmu sendiri: tepat 16 huruf/angka, sama di kedua folder.
// kunci.h dijaga .gitignore, jadi kuncimu tidak pernah ikut ke GitHub.
#pragma once
const bool PAKAI_ENKRIPSI = false;
const char KUNCI_PMK[] = "Contoh16HurufPMK";  // tepat 16 huruf/angka
const char KUNCI_LMK[] = "Contoh16HurufLMK";  // tepat 16 huruf/angka
// Modul 28 (Node 1 saja; Node 2 mengabaikannya): sandi portal WiFi Node 1, 8-63 huruf. Hapus tanda // di depan baris di
// bawah, ganti sandinya dengan milikmu, lalu tulis sandi yang sama di label kotak Node 1. Tanpa baris ini, portal WiFi
// terbuka tanpa sandi seperti di Modul 10. JANGAN memakai sandi contoh ini.
// #define SANDI_PORTAL "ganti-sandi-portal-ini"
