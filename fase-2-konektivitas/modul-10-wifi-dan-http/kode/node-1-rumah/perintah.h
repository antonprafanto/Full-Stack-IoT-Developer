// perintah.h - perintah lewat Serial Monitor (Modul 5), kini dibaca tanpa menunggu (Modul 8)
// Modul 11 menggantinya dengan perintah lewat MQTT.
#pragma once

void periksaPerintahSerial();  // panggil di setiap putaran loop(); tidak pernah menunggu
