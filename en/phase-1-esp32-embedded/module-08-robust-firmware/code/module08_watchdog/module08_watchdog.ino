// Module 8 - Practice 6: the watchdog, a guard that restarts a stuck program
// Circuit: status LED on D4 (the Quick Win circuit, or the Node 1 workbench).
//
// Commands in the Serial Monitor (choose New Line):
//   hang     -> deliberately enter a loop that never ends
//   sleep 3  -> delay(3000): still under the watchdog limit
//   sleep 7  -> delay(7000): goes past the 5-second limit
//   restart  -> the program itself asks for a restart

#include <esp_task_wdt.h>  // comes with the esp32 package

const bool USE_WATCHDOG = true;               // change to false to see what happens WITHOUT a guard
const unsigned long WATCHDOG_TIMEOUT = 5000;  // milliseconds
const int PIN_STATUS_LED = 4;

unsigned long lastBlinkTime = 0;
bool ledOn = false;

// ---------- A Serial line reader that never waits (same as Practice 5) ----------
const int MAX_LINE_LENGTH = 40;
char line[MAX_LINE_LENGTH + 1];
int lineLength = 0;

bool lineReady() {
  while (Serial.available() > 0) {
    char letter = Serial.read();
    if (letter == '\n') {
      line[lineLength] = '\0';
      lineLength = 0;
      return true;
    }
    if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
      line[lineLength] = letter;
      lineLength++;
    }
  }
  return false;
}

// The last restart reason, with its explanation.
const char* explainResetReason() {
  esp_reset_reason_t reason = esp_reset_reason();
  if (reason == ESP_RST_POWERON) {
    return "POWERON (just powered on, EN button pressed, or just uploaded)";
  }
  if (reason == ESP_RST_SW) {
    return "SW (the program itself asked for a restart)";
  }
  if (reason == ESP_RST_TASK_WDT) {
    return "TASK_WDT (watchdog: loop() fed the guard too late)";
  }
  if (reason == ESP_RST_INT_WDT || reason == ESP_RST_WDT) {
    return "WDT (another kind of watchdog)";
  }
  if (reason == ESP_RST_PANIC) {
    return "PANIC (the program crashed)";
  }
  if (reason == ESP_RST_BROWNOUT) {
    return "BROWNOUT (the voltage briefly dropped)";
  }
  return "other";
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_STATUS_LED, OUTPUT);
  Serial.println();
  Serial.println("Practice 6 - watchdog");
  Serial.print("Last restart reason: ");
  Serial.println(explainResetReason());

  if (USE_WATCHDOG) {
    // The esp32 package version 3 way of writing it: all settings in one "form"
    esp_task_wdt_config_t watchdogConfig = {
      .timeout_ms = WATCHDOG_TIMEOUT,  // time limit: 5000 ms
      .idle_core_mask = 0b01,          // keep watching the "idle task" of core 0 (the esp32 package default)
      .trigger_panic = true,           // fed too late = panic, then restart
    };
    esp_task_wdt_reconfigure(&watchdogConfig);  // the esp32 package has already started the watchdog: just reconfigure it
    esp_task_wdt_add(NULL);                     // NULL = watch the task that is running now, that is, loop()
    Serial.println("Watchdog ACTIVE: a loop() stuck for more than 5 seconds will be restarted.");
  } else {
    Serial.println("Watchdog NOT used.");
  }
  Serial.println("Commands: hang, sleep 3, sleep 7, restart");
}

void loop() {
  if (USE_WATCHDOG) {
    esp_task_wdt_reset();  // "feed" the guard: a sign that loop() is still running
  }

  // The LED switches every 500 ms: as long as it blinks, we know loop() is still running
  if (millis() - lastBlinkTime >= 500) {
    lastBlinkTime = millis();
    ledOn = !ledOn;
    digitalWrite(PIN_STATUS_LED, ledOn);
  }

  if (!lineReady()) {
    return;
  }
  String command = line;
  command.trim();
  command.toLowerCase();

  if (command == "hang") {
    Serial.println("Entering a loop that never ends... the LED stops blinking.");
    while (true) {
      // empty on purpose: the program is stuck here forever
    }
  } else if (command.startsWith("sleep ")) {
    int seconds = command.substring(6).toInt();  // the text after "sleep " turned into a number
    Serial.print("delay(");
    Serial.print(seconds * 1000);
    Serial.println(")...");
    delay(seconds * 1000);
    Serial.println("Awake again!");
  } else if (command == "restart") {
    Serial.println("Restarting now...");
    Serial.flush();
    ESP.restart();
  } else {
    Serial.println("Unknown command. Try: hang, sleep 3, sleep 7, restart");
  }
}
