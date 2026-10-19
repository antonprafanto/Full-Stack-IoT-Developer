// Node 1 "Home" - firmware v1.3.0 (Module 14: the ESP-NOW bridge for Node 2 "Garden")
// The running project: Mini Smart Home.
//
// New in v1.3.0: Node 1 listens for ESP-NOW packets from Node 2 "Garden" and publishes them to the broker on behalf of
// Node 2 (msh/<device_id Node 2>/telemetry and /status), including readings held back while the router was off.
// The radio no longer sleeps (setSleep false) and doesn't reconnect by itself: the 60-second guard retries.
// New in v1.2.0: all communication over MQTT, following the data contract (Appendix A): telemetry every 10 seconds and
// immediately when something important happens, vitals every 5 minutes, automatic online/offline status (Last Will), and
// commands from the broker answered with an ack. The /on /off web server and the HTTP sending of v1.1.0 are retired.
// From v1.0.0 (Module 8): no delay() in loop(), modular code, watchdog, NVS, leveled logging, status page.
// Commands from the Serial Monitor: lamp on, fan off, pump 3, curtain 90, beep, status, info,
// threshold, threshold 35, threshold default, log debug, log info, log error, wifi, wifi forget, send, node2, node2 reset, restart.
//
// Libraries: ESP32Servo version 3.2.1, DHT sensor library version 1.4.7
// (installed with it: Adafruit Unified Sensor version 1.1.15), Adafruit SSD1306 version 2.5.17
// (installed with it: Adafruit GFX Library version 1.12.6 and Adafruit BusIO version 1.17.4),
// WiFiManager version 2.0.17, ArduinoJson version 7.4.3, and PubSubClient3 version 3.3.2.
// Wire, SPI, SD, Preferences, and WiFi already come with the esp32 package.

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
#include "networking.h"  // Modules 10-11
#include "bridge.h"   // Module 14: Node 2 over ESP-NOW

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

// ---------- Modules 10-11: sending readings over MQTT ----------
void sendData(SensorReading b) {
  sendReading(b);  // networking.cpp: publishes every SEND_INTERVAL (10 seconds) and immediately when something important happens
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
  setupBridge();   // Module 14: after the WiFi is on

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
  updateNetwork();       // Modules 10-11: WiFi, internet time, and MQTT; never waits long
  updateBridge();        // Module 14: Node 2 packets -> holding shelf -> broker; never waits
  handleButton();
  checkSerialCommand();
  runCycle();

  recordLoopTime(micros() - loopStart);
}
