// aktuator.h - lampu, kipas, pompa, tirai, dan buzzer Node 1 (Modul 5), kini tanpa menunggu (Modul 8)
#pragma once

void siapkanAktuator();                       // panggil sekali di setup(), sebelum yang lain
void perbaruiAktuator();                      // panggil di setiap putaran loop(): pompa dan buzzer padam tepat waktu
void aturLampu(bool nyala);                   // perintah manual (tombol atau Serial Monitor)
void aturLampuOtomatis(bool nyala);           // khusus untuk aturan lampu otomatis
void aturKipas(bool nyala);                   // perintah manual (Serial Monitor) atau dari server
void aturKipasPengaman(bool nyala);           // Modul 19: khusus untuk aturan pengaman lokal
bool nyalakanPompa(int detik, int levelAir);  // menjawab false kalau ditolak karena air tandon kurang
void aturTirai(int sudut);
void bunyikanBuzzer();                        // berbunyi 150 ms, tetapi programnya tidak ikut menunggu

bool lampuMenyala();
bool lampuDariOtomatis();  // true kalau lampu yang menyala itu dinyalakan oleh aturan otomatis
bool kipasMenyala();
bool kipasDariPengaman();  // Modul 19: true kalau kipas yang menyala itu dinyalakan aturan pengaman lokal
bool pompaMenyala();
int sudutTirai();
const char* teksOnOff(bool nyala);  // "on" atau "off"
