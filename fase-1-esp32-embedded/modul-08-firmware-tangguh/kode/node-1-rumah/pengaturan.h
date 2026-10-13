// pengaturan.h - setelan yang tetap ada walaupun listrik padam, disimpan di NVS (Modul 8)
#pragma once

void muatPengaturan();                    // panggil sekali di setup(): membaca setelan dari NVS
int ambangTanahSiram();                   // ambang "tanah kering" yang berlaku sekarang, dalam persen
bool ambangDariNvs();                     // true kalau ambang itu berasal dari NVS, bukan angka bawaan
bool simpanAmbangTanahSiram(int persen);  // menjawab false kalau angkanya di luar 0-100
void hapusAmbangTanahSiram();             // kembali memakai AMBANG_TANAH_SIRAM_BAWAAN di konfigurasi.h
unsigned long jumlahNyala();              // sudah berapa kali Node 1 menyala, termasuk restart
