// pencatat.h - catatan (log) bertingkat ke Serial Monitor: DEBUG, INFO, ERROR (Modul 8)
// Cara pakainya mirip Serial.printf(), misalnya: logInfo("pompa menyala %d detik", detik);
#pragma once

enum TingkatLog { TINGKAT_DEBUG, TINGKAT_INFO, TINGKAT_ERROR };

void aturTingkatLog(TingkatLog tingkat);      // pesan di bawah tingkat ini tidak dicetak
TingkatLog tingkatLog();                      // tingkat yang sedang berlaku
const char* namaTingkatLog(TingkatLog tingkat);  // "DEBUG", "INFO", atau "ERROR"

void logDebug(const char* format, ...);  // rincian untuk berburu bug
void logInfo(const char* format, ...);   // kejadian penting sehari-hari
void logError(const char* format, ...);  // ada yang salah dan perlu perhatian
