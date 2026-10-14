// Module 9 - Quick Win: the ESP32 sleeps 5 seconds, wakes up by itself, then sleeps again
// Circuit: status LED on D4 (through a 220 ohm resistor). The D13 button is not used here yet.
// Every time it wakes up, the LED blinks once and Serial prints how many times the board has woken up.

const int PIN_STATUS_LED = 4;
const unsigned long SLEEP_SECONDS = 5;  // how long to sleep, in seconds

RTC_DATA_ATTR int wakeCount = 0;  // kept in RTC memory: it stays there during deep sleep

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);

  wakeCount++;
  Serial.print("Wake #");
  Serial.print(wakeCount);
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.println(": woken by the timer alarm.");
  } else {
    Serial.println(": just powered on.");
  }

  digitalWrite(PIN_STATUS_LED, HIGH);  // a short blink: the "I'm awake" sign
  delay(200);
  digitalWrite(PIN_STATUS_LED, LOW);

  Serial.printf("Sleeping for %lu seconds... see you!\n", SLEEP_SECONDS);
  Serial.flush();  // wait until every letter has been sent, then sleep
  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);  // the unit is microseconds
  esp_deep_sleep_start();  // sleep now; on waking up, the program starts again from setup()
}

void loop() {
  // Never runs: after deep sleep, the board always starts again from setup().
}
