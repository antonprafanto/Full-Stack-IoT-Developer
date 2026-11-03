// tombol.h - tombol dengan debounce, tekan pendek, dan tekan lama, tanpa menunggu (Modul 8)
#pragma once

// Tiga kemungkinan jawaban periksaTombol()
enum PeristiwaTombol { TIDAK_ADA, TEKAN_PENDEK, TEKAN_LAMA };

void mulaiTombol(int pin);        // panggil sekali di setup()
PeristiwaTombol periksaTombol();  // panggil di setiap putaran loop()
