// Module 9 - Practice 3: woken by the timer alarm OR by the button
// Circuit: status LED on D4 and a button on D13 (its opposite leg to GND).
// The board sleeps 20 seconds. Press the D13 button any time to wake it up sooner.

#include "driver/rtc_io.h"  // controls the RTC pins: the pins that stay "awake" during deep sleep

const int PIN_STATUS_LED = 4;
const gpio_num_t PIN_WAKE_BUTTON = GPIO_NUM_13;  // D13 is an RTC pin, so it can wake the board up
const unsigned long SLEEP_SECONDS = 20;

RTC_DATA_ATTR int wakeCount = 0;
RTC_DATA_ATTR int buttonWakeCount = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  rtc_gpio_deinit(PIN_WAKE_BUTTON);  // turn D13 back into an ordinary pin after sleeping
  pinMode(PIN_WAKE_BUTTON, INPUT_PULLUP);

  wakeCount++;
  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  Serial.print("Wake #");
  Serial.print(wakeCount);
  if (cause == ESP_SLEEP_WAKEUP_EXT0) {
    buttonWakeCount++;
    Serial.println(": woken by the BUTTON.");
  } else if (cause == ESP_SLEEP_WAKEUP_TIMER) {
    Serial.println(": woken by the timer alarm.");
  } else {
    Serial.println(": just powered on.");
  }
  Serial.print("Button wake-ups so far: ");
  Serial.print(buttonWakeCount);
  Serial.println(".");

  digitalWrite(PIN_STATUS_LED, HIGH);
  delay(500);
  digitalWrite(PIN_STATUS_LED, LOW);

  // First wait until the button is released. If it is still pressed when the board sleeps, it wakes up again at once.
  while (digitalRead(PIN_WAKE_BUTTON) == LOW) {
    delay(10);
  }
  delay(50);  // wait for the button bounce to settle, so the board doesn't wake up again at once

  Serial.printf("Sleeping for %lu seconds. Press the button to wake it up sooner.\n", SLEEP_SECONDS);
  Serial.flush();
  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);  // wake door 1: the timer alarm
  esp_sleep_enable_ext0_wakeup(PIN_WAKE_BUTTON, 0);           // wake door 2: D13 goes LOW
  rtc_gpio_pullup_en(PIN_WAKE_BUTTON);   // make sure D13's pull-up stays on during sleep
  rtc_gpio_pulldown_dis(PIN_WAKE_BUTTON);
  esp_deep_sleep_start();
}

void loop() {
  // Never runs.
}
