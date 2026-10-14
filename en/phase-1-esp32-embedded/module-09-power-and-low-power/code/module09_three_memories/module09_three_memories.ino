// Module 9 - Practice 2: the ESP32's three memories (RAM, RTC memory, and NVS) through deep sleep
// Circuit: status LED on D4 and a button on D13 (its opposite leg to GND), same as the Quick Win.
// The board wakes up every 5 seconds and adds 1 to three counters. To restart, hold the D13 button
// until the LED lights up, wait a moment, then let go.

#include <Preferences.h>

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;
const unsigned long SLEEP_SECONDS = 5;

int ramCount = 0;                // an ordinary variable: kept in RAM
RTC_DATA_ATTR int rtcCount = 0;  // kept in RTC memory: survives deep sleep
Preferences archive;             // NVS from Module 8: survives even when the power goes out

// A short name for the board's last reset reason (like Node 1 v1.0).
const char* reasonName() {
  esp_reset_reason_t reason = esp_reset_reason();
  if (reason == ESP_RST_POWERON) {
    return "POWERON";  // just powered on, EN button pressed, or a program has finished uploading
  }
  if (reason == ESP_RST_SW) {
    return "SW";  // the program itself asked for a restart
  }
  if (reason == ESP_RST_DEEPSLEEP) {
    return "DEEPSLEEP";  // woke up from deep sleep
  }
  return "OTHER";
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  ramCount++;
  rtcCount++;
  archive.begin("module09", false);
  int nvsCount = archive.getInt("count", 0) + 1;
  archive.putInt("count", nvsCount);
  archive.end();

  Serial.printf("RAM: %d   RTC: %d   NVS: %d   (reset reason: %s)\n", ramCount, rtcCount, nvsCount, reasonName());

  digitalWrite(PIN_STATUS_LED, HIGH);  // the LED is on for 1 second: your chance to hold the button
  delay(1000);
  bool buttonHeld = (digitalRead(PIN_BUTTON) == LOW);
  digitalWrite(PIN_STATUS_LED, LOW);

  if (buttonHeld) {
    Serial.println("Button held: restarting now.");
    Serial.flush();
    ESP.restart();  // a restart by the program, much like pressing the EN button
  }

  Serial.flush();
  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
  // Never runs (see the Quick Win).
}
