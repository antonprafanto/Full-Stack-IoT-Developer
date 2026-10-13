// Modul 8 - Praktik 6: watchdog, penjaga yang me-restart program macet
// Rangkaian: LED status di D4 (rangkaian Kemenangan Cepat, atau meja kerja Node 1).
//
// Perintah di Serial Monitor (pilih New Line):
//   macet    -> sengaja masuk perulangan yang tidak pernah selesai
//   tidur 3  -> delay(3000): masih di bawah batas watchdog
//   tidur 7  -> delay(7000): melewati batas 5 detik
//   restart  -> program sendiri yang meminta restart

#include <esp_task_wdt.h>  // ikut paket esp32

const bool PAKAI_WATCHDOG = true;           // ubah menjadi false untuk melihat apa yang terjadi TANPA penjaga
const unsigned long BATAS_WATCHDOG = 5000;  // milidetik
const int PIN_LED_STATUS = 4;

unsigned long waktuKedipTerakhir = 0;
bool ledMenyala = false;

// ---------- Pembaca baris Serial yang tidak pernah menunggu (sama dengan Praktik 5) ----------
const int PANJANG_BARIS_MAKS = 40;
char baris[PANJANG_BARIS_MAKS + 1];
int panjangBaris = 0;

bool adaBarisBaru() {
  while (Serial.available() > 0) {
    char huruf = Serial.read();
    if (huruf == '\n') {
      baris[panjangBaris] = '\0';
      panjangBaris = 0;
      return true;
    }
    if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
      baris[panjangBaris] = huruf;
      panjangBaris++;
    }
  }
  return false;
}

// Alasan restart terakhir, lengkap dengan penjelasannya.
const char* jelaskanAlasanReset() {
  esp_reset_reason_t alasan = esp_reset_reason();
  if (alasan == ESP_RST_POWERON) {
    return "POWERON (baru dinyalakan, tombol EN ditekan, atau selesai diunggah)";
  }
  if (alasan == ESP_RST_SW) {
    return "SW (program sendiri yang meminta restart)";
  }
  if (alasan == ESP_RST_TASK_WDT) {
    return "TASK_WDT (watchdog: loop() terlambat memberi makan penjaga)";
  }
  if (alasan == ESP_RST_INT_WDT || alasan == ESP_RST_WDT) {
    return "WDT (watchdog jenis lain)";
  }
  if (alasan == ESP_RST_PANIC) {
    return "PANIC (program mogok)";
  }
  if (alasan == ESP_RST_BROWNOUT) {
    return "BROWNOUT (tegangan sempat anjlok)";
  }
  return "lainnya";
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED_STATUS, OUTPUT);
  Serial.println();
  Serial.println("Praktik 6 - watchdog");
  Serial.print("Alasan restart terakhir: ");
  Serial.println(jelaskanAlasanReset());

  if (PAKAI_WATCHDOG) {
    // Cara penulisan paket esp32 versi 3: semua setelan dalam satu "formulir"
    esp_task_wdt_config_t konfigurasiWatchdog = {
      .timeout_ms = BATAS_WATCHDOG,  // batas waktu: 5000 ms
      .idle_core_mask = 0b01,        // tetap awasi "tugas menganggur" inti 0 (bawaan paket esp32)
      .trigger_panic = true,         // terlambat diberi makan = panik, lalu restart
    };
    esp_task_wdt_reconfigure(&konfigurasiWatchdog);  // watchdog sudah dinyalakan paket esp32: cukup diatur ulang
    esp_task_wdt_add(NULL);                          // NULL = awasi tugas yang sedang berjalan, yaitu loop()
    Serial.println("Watchdog AKTIF: loop() yang macet lebih dari 5 detik akan di-restart.");
  } else {
    Serial.println("Watchdog TIDAK dipakai.");
  }
  Serial.println("Perintah: macet, tidur 3, tidur 7, restart");
}

void loop() {
  if (PAKAI_WATCHDOG) {
    esp_task_wdt_reset();  // "beri makan" penjaga: tanda loop() masih berputar
  }

  // LED berganti setiap 500 ms: selama berkedip, kita tahu loop() masih berputar
  if (millis() - waktuKedipTerakhir >= 500) {
    waktuKedipTerakhir = millis();
    ledMenyala = !ledMenyala;
    digitalWrite(PIN_LED_STATUS, ledMenyala);
  }

  if (!adaBarisBaru()) {
    return;
  }
  String perintah = baris;
  perintah.trim();
  perintah.toLowerCase();

  if (perintah == "macet") {
    Serial.println("Masuk perulangan yang tidak pernah selesai... LED berhenti berkedip.");
    while (true) {
      // sengaja kosong: program terjebak di sini selamanya
    }
  } else if (perintah.startsWith("tidur ")) {
    int detik = perintah.substring(6).toInt();  // teks sesudah "tidur " diubah menjadi angka
    Serial.print("delay(");
    Serial.print(detik * 1000);
    Serial.println(")...");
    delay(detik * 1000);
    Serial.println("Bangun lagi!");
  } else if (perintah == "restart") {
    Serial.println("Restart sekarang...");
    Serial.flush();
    ESP.restart();
  } else {
    Serial.println("Perintah tidak dikenal. Coba: macet, tidur 3, tidur 7, restart");
  }
}
