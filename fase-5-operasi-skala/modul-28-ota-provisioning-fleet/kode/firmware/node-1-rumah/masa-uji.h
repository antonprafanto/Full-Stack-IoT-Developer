// masa-uji.h - masa uji 60 detik untuk firmware yang baru dipasang lewat udara, dan rollback otomatis (Modul 28).
// Firmware baru SAH kalau dalam 60 detik sejak menyala ia tersambung ke broker (kuncinya diterima), menerbitkan "online",
// dan berlangganan cmd. Kalau tidak, Node 1 kembali sendiri ke firmware sebelumnya (kontrak data 1.6, aturan 13).
#pragma once

void mulaiMasaUji();      // dipanggil siapkanPembaruan() di setup(): rak yang berjalan baru dipasang? masa uji dimulai
bool dalamMasaUji();      // true selama firmware ini belum terbukti (portal WiFi dan perintah update ditunda)
void firmwareTerbukti();  // dipanggil jaringan.cpp sesudah tersambung ke broker, "online" terbit, dan cmd dilanggan
void perbaruiMasaUji();   // dipanggil perbaruiPembaruan() di setiap putaran loop(): 60 detik lewat = rollback
void cetakInfoRak();      // bagian dari jawaban perintah Serial "ota": rak berjalan, rak sebelah, masa uji
