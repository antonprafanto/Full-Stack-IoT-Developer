// Node 2 "Garden" - Mini Smart Home - firmware v0.1.0: low-power skeleton (Module 9)
// The SECOND ESP32 board, powered by an 18650 battery -> TP4056 -> MT3608 (5.0 V) -> VIN. Pins as in the Node 2 section of PIN-MAP.md:
//   DS18B20 + its adapter module: VCC to 3V3, GND to GND, DAT to D27. It gets 3.3 V, NOT 5 V.
//   The board's built-in blue LED (GPIO 2) is on while the board is awake.
// Libraries: OneWire 2.3.8 and DallasTemperature 4.0.6 (already installed in Module 7).

#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_AWAKE_LED = 2;                    // built-in blue LED: the "awake" indicator
const int PIN_ONE_WIRE = 27;                    // Node 2's 1-Wire bus: DS18B20
const unsigned long SLEEP_SECONDS = 30;

RTC_DATA_ATTR int wakeCount = 0;                // RTC memory: survives deep sleep
RTC_DATA_ATTR float previousTemperature = NAN;  // the reading from the previous wake (NAN = none yet)

OneWire oneWire(PIN_ONE_WIRE);
DallasTemperature tempSensors(&oneWire);

void setup() {
  pinMode(PIN_AWAKE_LED, OUTPUT);
  digitalWrite(PIN_AWAKE_LED, HIGH);
  Serial.begin(115200);
  wakeCount++;

  tempSensors.begin();
  tempSensors.requestTemperatures();                    // measure now: up to 750 ms
  float temperature = tempSensors.getTempCByIndex(0);   // -127 if the sensor does not answer

  Serial.print("Wake #");
  Serial.print(wakeCount);
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.print(" (timer). ");
  } else {
    Serial.print(" (just powered on). ");
  }
  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("DS18B20 unreadable: check the DAT wire to D27, VCC to 3V3, and GND.");
  } else {
    Serial.printf("Temperature %.1f C", temperature);
    if (!isnan(previousTemperature)) {
      Serial.printf(" (previous wake %.1f C)", previousTemperature);
    }
    Serial.println(".");
    previousTemperature = temperature;
  }

  Serial.printf("Awake for %lu ms. Sleeping for %lu seconds.\n", millis(), SLEEP_SECONDS);
  Serial.flush();
  digitalWrite(PIN_AWAKE_LED, LOW);
  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Never runs: Node 2 always starts from setup() every time it wakes up.
}
