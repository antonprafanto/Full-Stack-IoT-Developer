// system.cpp - the code of the system module. Its functions are listed in system.h.
#include <Arduino.h>
#include <esp_system.h>  // esp_reset_reason()
#include <esp_timer.h>   // esp_timer_get_time()
#include "system.h"

static unsigned long longestLoopUs = 0;  // microseconds

unsigned long uptimeSeconds() {
  // esp_timer_get_time() counts the microseconds since power-up in a 64-bit number:
  // it only overflows after hundreds of thousands of years, far longer than millis() (49.7 days).
  return esp_timer_get_time() / 1000000;
}

// Turns the restart reason code into a word that is easy to read (Module 5; same names as Appendix A).
const char* resetReasonName() {
  esp_reset_reason_t reason = esp_reset_reason();
  if (reason == ESP_RST_POWERON) {
    return "POWERON";  // just powered on, EN button pressed, or a program has finished uploading
  }
  if (reason == ESP_RST_BROWNOUT) {
    return "BROWNOUT";  // the voltage briefly dropped too low
  }
  if (reason == ESP_RST_SW) {
    return "SW";  // the program itself asked for a restart, for example the "restart" command
  }
  if (reason == ESP_RST_PANIC) {
    return "PANIC";  // the program crashed
  }
  if (reason == ESP_RST_INT_WDT || reason == ESP_RST_TASK_WDT || reason == ESP_RST_WDT) {
    return "WDT";  // the "guard" (watchdog) restarted a stuck program
  }
  if (reason == ESP_RST_DEEPSLEEP) {
    return "DEEPSLEEP";  // woke up from deep sleep (Module 9)
  }
  return "UNKNOWN";  // some other reason that rarely happens
}

void recordLoopTime(unsigned long microseconds) {
  if (microseconds > longestLoopUs) {
    longestLoopUs = microseconds;
  }
}

unsigned long longestLoopMs() {
  return longestLoopUs / 1000;
}
