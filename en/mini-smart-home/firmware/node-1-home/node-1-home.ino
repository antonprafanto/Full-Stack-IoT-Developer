// Node 1 "Home" - firmware v1.1.0 (Module 10)
// The running project: Mini Smart Home.
//
// New in v1.1.0: connects to the home WiFi through a WiFiManager portal (no password in the code),
// the time from the internet (NTP), readings sent to a mini server on the laptop every minute (HTTP POST with JSON),
// and the lamp can be turned on or off from a phone's browser. The WiFi may drop; Node 1 keeps working.
// From v1.0.0 (Module 8): no delay() in loop(), modular code, watchdog, NVS, leveled logging, status page.
// Commands from the Serial Monitor: lamp on, fan off, pump 3, curtain 90, beep, status, info,
// threshold, threshold 35, threshold default, log debug, log info, log error, wifi, wifi forget, send, restart.
//
// Libraries: ESP32Servo version 3.2.1, DHT sensor library version 1.4.7
// (installed with it: Adafruit Unified Sensor version 1.1.15), Adafruit SSD1306 version 2.5.17
// (installed with it: Adafruit GFX Library version 1.12.6 and Adafruit BusIO version 1.17.4),
// WiFiManager version 2.0.17, and ArduinoJson version 7.4.3.
// Wire, SPI, SD, Preferences, WiFi, WebServer, HTTPClient, and ESPmDNS already come with the esp32 package.

#include <esp_task_wdt.h>  // watchdog
#include "config.h"
#include "logger.h"
#include "system.h"
#include "settings.h"
#include "sensors.h"
#include "actuators.h"
#include "heartbeat.h"
#include "button.h"
#include "display.h"
#include "card.h"
#include "commands.h"
#include "rules.h"
#include "network.h"  // Module 10

// ---------- Main cycle: IDLE -> READING -> DISPLAYING -> ACTING -> IDLE ... ----------
enum CycleStep { IDLE, READING, DISPLAYING, ACTING };
CycleStep step = IDLE;
unsigned long lastReadTime = 0;
unsigned long lastCardLogTime = 0;
SensorReading reading;
bool dhtFailedBefore = false;    // did the DHT22 fail on the previous reading?
bool sonarFailedBefore = false;  // did the HC-SR04 fail on the previous reading?

const char* stepName(CycleStep s) {
  if (s == IDLE) {
    return "IDLE";
  }
  if (s == READING) {
    return "READING";
  }
  if (s == DISPLAYING) {
    return "DISPLAYING";
  }
  return "ACTING";
}

void moveToStep(CycleStep newStep) {
  logDebug("Cycle: %s -> %s", stepName(step), stepName(newStep));
  step = newStep;
}

// One report line per reading: a failed number is written "--".
void reportReading(SensorReading b) {
  char temperature[8] = "--";
  if (!isnan(b.temperature)) {
    snprintf(temperature, sizeof(temperature), "%.1f", b.temperature);
  }
  char humidity[12] = "--";  // 12 drawers: room for the longest int number (11 characters) + the end mark
  if (b.humidity >= 0) {
    snprintf(humidity, sizeof(humidity), "%d", b.humidity);
  }
  char waterLevel[12] = "--";
  if (b.water_level >= 0) {
    snprintf(waterLevel, sizeof(waterLevel), "%d", b.water_level);
  }
  const char* motion = "no";
  if (b.motion) {
    motion = "yes";
  }
  logInfo("temperature=%s C  humidity=%s %%  light=%d  soil=%d %%  motion=%s  water_level=%s %%",
          temperature, humidity, b.light, b.soil, motion, waterLevel);
}

// Sensor failed? The status LED blinks fast. Its message is printed once, when the sensor's state changes, not every 2 seconds.
void checkProblems(SensorReading b) {
  setHeartbeatRhythm(sensorProblem(b));
  bool dhtFailed = isnan(b.temperature) || b.humidity < 0;
  bool sonarFailed = b.water_level < 0;
  if (dhtFailed && !dhtFailedBefore) {
    logError("DHT22 can't be read. Status LED blinks fast.");
  }
  if (!dhtFailed && dhtFailedBefore) {
    logInfo("DHT22 can be read again.");
  }
  if (sonarFailed && !sonarFailedBefore) {
    logError("HC-SR04: the echo didn't come back, water level unknown. Status LED blinks fast.");
  }
  if (!sonarFailed && sonarFailedBefore) {
    logInfo("HC-SR04 can be read again.");
  }
  dhtFailedBefore = dhtFailed;
  sonarFailedBefore = sonarFailed;
}

// ---------- Module 10: send the reading to the server (Module 11 replaces it with MQTT) ----------
void sendData(SensorReading b) {
  sendReading(b);  // network.cpp: actually sends every SEND_INTERVAL (1 minute)
}

// One cycle step per pass of loop(): no step waits for long.
void runCycle() {
  if (step == IDLE) {
    if (millis() - lastReadTime >= READ_INTERVAL) {
      lastReadTime = millis();
      moveToStep(READING);
    }
  } else if (step == READING) {
    reading = readSensors();
    checkProblems(reading);
    moveToStep(DISPLAYING);
  } else if (step == DISPLAYING) {
    reportReading(reading);
    showReading(reading);
    if (millis() - lastCardLogTime >= CARD_LOG_INTERVAL) {
      lastCardLogTime = millis();
      logToCard(reading);
    }
    moveToStep(ACTING);
  } else if (step == ACTING) {
    runRules(reading);
    sendData(reading);
    moveToStep(IDLE);
  }
}

void handleButton() {
  ButtonEvent event = checkButton();
  if (event == SHORT_PRESS) {
    setLamp(!lampOn());
    logInfo("Button: lamp %s", onOffText(lampOn()));
  } else if (event == LONG_PRESS) {
    openStatusPage();  // status page for 10 seconds (display.cpp); its message is printed there too
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);  // allowed: setup() runs only once, and the watchdog isn't watching yet
  Serial.println();
  logInfo("Node 1 Home - firmware %s", FIRMWARE_VERSION);
  logInfo("Last restart reason: %s", resetReasonName());

  setupActuators();  // first: the relays are switched off right away
  loadSettings();
  setupSensors();
  beginHeartbeat(PIN_STATUS_LED);
  beginButton(PIN_BUTTON);
  setupDisplay();  // Module 7
  setupCard();     // Module 7 (optional)
  setupNetwork();  // Module 10: the WiFi portal may wait here because the watchdog isn't watching yet

  // The watchdog, written the esp32 package version 3 way (Concept 8)
  esp_task_wdt_config_t watchdogConfig = {
    .timeout_ms = WATCHDOG_TIMEOUT,  // time limit: 5000 ms
    .idle_core_mask = 0b01,          // keep watching the "idle task" of core 0 (the esp32 package default)
    .trigger_panic = true,           // fed too late = panic, then restart
  };
  esp_task_wdt_reconfigure(&watchdogConfig);  // the esp32 package has already started the watchdog: just reconfigure it
  esp_task_wdt_add(NULL);                     // NULL = watch the task that is running now, that is, loop()
  logInfo("Watchdog active: automatic restart if loop() is stuck for more than %lu seconds.", WATCHDOG_TIMEOUT / 1000);
}

void loop() {
  unsigned long loopStart = micros();
  esp_task_wdt_reset();  // "feed" the guard: loop() is still running

  updateSensors();       // one analog sample every 2 ms
  updateActuators();     // the pump and buzzer turn off right on time
  updateRules();         // WATERING -> COOLDOWN -> STANDBY
  updateHeartbeat();     // status LED
  updateDisplay();       // status page: the clock ticks, then it goes back by itself
  updateNetwork();       // Module 10: WiFi, internet time, and the web server; never waits long
  handleButton();
  checkSerialCommand();
  runCycle();

  recordLoopTime(micros() - loopStart);
}
