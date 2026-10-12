// Module 5 - Practice 8: a "restart detective" for testing the power supply
// When it starts, this sketch prints the REASON for the last restart, using the same words
// as the reset_reason field in Syllabus Appendix A: POWERON, BROWNOUT, SW, PANIC,
// WDT, DEEPSLEEP, or UNKNOWN.
// After that, the fan relay (D33) turns on and off in turn every 3 seconds.

#include <esp_system.h>  // for esp_reset_reason()

const int PIN_LED = 4;         // status LED
const int PIN_FAN_RELAY = 33;  // fan relay, active LOW
const int PAUSE_MS = 3000;     // milliseconds

int cycle = 0;  // counted again from 0 every time the ESP32 restarts

// Turns the restart reason code into a word that is easy to read.
String resetReasonName() {
  esp_reset_reason_t reason = esp_reset_reason();
  if (reason == ESP_RST_POWERON) {
    return "POWERON";  // just powered on, EN button pressed, or a program has finished uploading
  }
  if (reason == ESP_RST_BROWNOUT) {
    return "BROWNOUT";  // the voltage briefly dropped too low
  }
  if (reason == ESP_RST_SW) {
    return "SW";  // the program itself asked for a restart
  }
  if (reason == ESP_RST_PANIC) {
    return "PANIC";  // the program crashed
  }
  if (reason == ESP_RST_INT_WDT || reason == ESP_RST_TASK_WDT || reason == ESP_RST_WDT) {
    return "WDT";  // a "watchdog" restarted a stuck program (Module 8)
  }
  if (reason == ESP_RST_DEEPSLEEP) {
    return "DEEPSLEEP";  // woke up from deep sleep (Module 9)
  }
  return "UNKNOWN";  // some other reason that rarely happens
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_FAN_RELAY, OUTPUT);
  digitalWrite(PIN_FAN_RELAY, HIGH);  // the relay releases: the fan starts out off

  String reason = resetReasonName();
  Serial.println();
  Serial.println("Last restart reason: " + reason);
  if (reason == "BROWNOUT") {
    Serial.println(">> The voltage dropped for a moment! Move the loads (fan, pump, servo) to the MB102.");
  }
}

void loop() {
  cycle++;
  if (cycle % 2 == 1) {
    digitalWrite(PIN_FAN_RELAY, LOW);  // the fan runs
    digitalWrite(PIN_LED, HIGH);
    Serial.print("Cycle ");
    Serial.print(cycle);
    Serial.println(": fan ON");
  } else {
    digitalWrite(PIN_FAN_RELAY, HIGH);  // the fan stops
    digitalWrite(PIN_LED, LOW);
    Serial.print("Cycle ");
    Serial.print(cycle);
    Serial.println(": fan OFF");
  }
  delay(PAUSE_MS);
}
