// rs485.h - sensor tanah RS-485 yang dibaca lewat Modbus RTU (Modul 15)
#pragma once
#include <ArduinoJson.h>

void siapkanRS485();                          // panggil sekali di setup(), sesudah muatPengaturan()
void perbaruiRS485();                         // panggil di setiap putaran loop(): membaca sensor setiap 10 detik
void tulisKolomRS485(JsonDocument& dokumen);  // menambahkan tanah_rs485, suhu_tanah, dan ec ke telemetry
void pakaiRS485(bool pakai);                  // perintah "rs485 on" / "rs485 off" (disimpan di NVS)
void cetakInfoRS485();                        // jawaban perintah "rs485"
