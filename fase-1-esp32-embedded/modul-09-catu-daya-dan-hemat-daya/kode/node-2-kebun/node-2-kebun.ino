// Node 2 "Kebun" - Rumah Pintar Mini - firmware v0.1.0: kerangka hemat daya (Modul 9)
// Papan ESP32 KEDUA, dari baterai 18650 -> TP4056 -> MT3608 (5,0 V) -> VIN. Pin menurut PETA-PIN.md bagian Node 2:
//   DS18B20 + modul adaptornya: VCC ke 3V3, GND ke GND, DAT ke D27. Diberi 3,3 V, BUKAN 5 V.
//   LED biru bawaan papan (GPIO 2) menyala selama papan bangun.
// Library: OneWire 2.3.8 dan DallasTemperature 4.0.6 (sudah terpasang sejak Modul 7).

#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_LED_BANGUN = 2;              // LED biru bawaan: tanda "sedang bangun"
const int PIN_SATU_KABEL = 27;             // bus 1-Wire Node 2: DS18B20
const unsigned long LAMA_TIDUR_DETIK = 30;

RTC_DATA_ATTR int jumlahBangun = 0;        // memori RTC: bertahan selama deep sleep
RTC_DATA_ATTR float suhuSebelumnya = NAN;  // bacaan dari bangun sebelumnya (NAN = belum ada)

OneWire satuKabel(PIN_SATU_KABEL);
DallasTemperature sensorSuhu(&satuKabel);

void setup() {
  pinMode(PIN_LED_BANGUN, OUTPUT);
  digitalWrite(PIN_LED_BANGUN, HIGH);
  Serial.begin(115200);
  jumlahBangun++;

  sensorSuhu.begin();
  sensorSuhu.requestTemperatures();             // ukur sekarang: sampai 750 ms
  float suhu = sensorSuhu.getTempCByIndex(0);   // -127 kalau sensor tidak menjawab

  Serial.print("Bangun ke-");
  Serial.print(jumlahBangun);
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.print(" (timer). ");
  } else {
    Serial.print(" (baru dinyalakan). ");
  }
  if (suhu == DEVICE_DISCONNECTED_C) {
    Serial.println("DS18B20 tidak terbaca: periksa kabel DAT ke D27, VCC ke 3V3, dan GND.");
  } else {
    Serial.printf("Suhu %.1f C", suhu);
    if (!isnan(suhuSebelumnya)) {
      Serial.printf(" (bangun sebelumnya %.1f C)", suhuSebelumnya);
    }
    Serial.println(".");
    suhuSebelumnya = suhu;
  }

  Serial.printf("Bangun selama %lu ms. Tidur %lu detik.\n", millis(), LAMA_TIDUR_DETIK);
  Serial.flush();
  digitalWrite(PIN_LED_BANGUN, LOW);
  esp_sleep_enable_timer_wakeup(LAMA_TIDUR_DETIK * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Tidak pernah dijalankan: Node 2 selalu mulai dari setup() setiap kali bangun.
}
