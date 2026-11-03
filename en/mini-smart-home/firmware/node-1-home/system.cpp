// system.cpp - the code of the system module. Its functions are listed in system.h.
#include <Arduino.h>
#include <esp_system.h>  // esp_reset_reason()
#include <esp_timer.h>   // esp_timer_get_time()
#include <esp_task_wdt.h>  // Module 28: watchdog
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

// Module 28: downloading firmware (or exchanging a claim code over HTTPS) blocks loop() for more than 5 seconds: just waiting for
// the server's answer may take up to 8 seconds (HTTPClient). So the watchdog timeout is relaxed for a while, then put back.
// The new firmware's trial period also uses it to guard setup() (trial-period.cpp).
// Its content is the same as the watchdog setup in setup() (Module 8, Concept 8); only the timeout changes.
void setWatchdogTimeout(unsigned long milliseconds) {
  esp_task_wdt_config_t watchdogConfig = {
    .timeout_ms = (uint32_t)milliseconds,
    .idle_core_mask = 0b01,  // keep watching the "idle task" of core 0 (the esp32 package default)
    .trigger_panic = true,   // fed too late = panic, then restart
  };
  esp_task_wdt_reset();  // feed it first so the count for the new timeout starts from zero
  esp_task_wdt_reconfigure(&watchdogConfig);
  esp_task_wdt_reset();
}
