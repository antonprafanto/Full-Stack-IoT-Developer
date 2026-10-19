// commands.cpp - the code of the commands module. Its functions are listed in commands.h.
// Command replies are always printed with Serial, whatever log level is in effect.
#include <Arduino.h>
#include "config.h"
#include "logger.h"
#include "system.h"
#include "settings.h"
#include "sensors.h"
#include "actuators.h"
#include "rules.h"
#include "networking.h"
#include "bridge.h"
#include "rs485.h"
#include "commands.h"

const int MAX_LINE_LENGTH = 40;
static char line[MAX_LINE_LENGTH + 1];  // +1 for the end-of-text mark
static int lineLength = 0;

// Collects letters from the Serial Monitor WITHOUT waiting.
// Returns true once, when a line is complete (ended with Enter); its text is in "line".
static bool lineReady() {
  while (Serial.available() > 0) {
    char letter = Serial.read();
    if (letter == '\n') {
      line[lineLength] = '\0';  // end-of-text mark
      lineLength = 0;           // ready to collect the next line
      return true;
    }
    if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
      line[lineLength] = letter;
      lineLength++;
    }
  }
  return false;
}

static void printStatus() {
  Serial.printf("status: lamp=%s fan=%s pump=%s curtain=%d\n", onOffText(lampOn()),
                onOffText(fanOn()), onOffText(pumpOn()), curtainAngle());
}

static void printInfo() {
  unsigned long seconds = uptimeSeconds();
  Serial.printf("info: firmware %s, uptime %02lu:%02lu:%02lu, last restart %s, boot #%lu\n",
                FIRMWARE_VERSION, seconds / 3600, (seconds / 60) % 60, seconds % 60, resetReasonName(), bootCount());
  Serial.printf("info: free memory %lu bytes, longest loop() pass %lu ms, watchdog %lu seconds\n",
                ESP.getFreeHeap(), longestLoopMs(), WATCHDOG_TIMEOUT / 1000);
  Serial.printf("info: soil_watering threshold %d %%, watering %s, log level %s\n", soilWateringThreshold(),
                wateringStateName(), logLevelName(logLevel()));
}

static void printThreshold() {
  const char* source = "default value";
  if (thresholdFromNvs()) {
    source = "from NVS";
  }
  Serial.printf("threshold: soil_watering = %d %% (%s)\n", soilWateringThreshold(), source);
}

// Returns true if the text is NOT a number: toInt() gives 0, but the text isn't "0" (as in Module 5, Practice 5).
static bool notANumber(String text) {
  return text.toInt() == 0 && text != "0";
}

void checkSerialCommand() {
  if (!lineReady()) {
    return;  // no complete line yet: return at once, don't wait
  }
  String command = line;  // commands only arrive now and then, so String is safe to use here
  command.trim();
  command.toLowerCase();
  if (command.length() == 0) {
    return;
  }

  if (command == "lamp on") {
    setLamp(true);
  } else if (command == "lamp off") {
    setLamp(false);
  } else if (command == "fan on") {
    setFan(true);
  } else if (command == "fan off") {
    setFan(false);
  } else if (command.startsWith("pump ")) {
    String number = command.substring(5);  // the text after "pump "
    if (notANumber(number)) {
      Serial.println("Need a number of seconds. Example: pump 3");
      return;
    }
    turnOnPump(number.toInt(), lastReading().water_level);  // the tank safety check uses the latest reading
  } else if (command.startsWith("curtain ")) {
    String number = command.substring(8);  // the text after "curtain "
    if (notANumber(number)) {
      Serial.println("Need a number of degrees. Example: curtain 90");
      return;
    }
    setCurtain(number.toInt());
  } else if (command == "beep") {
    soundBuzzer();
  } else if (command == "info") {
    printInfo();
    return;
  } else if (command == "threshold") {
    printThreshold();
    return;
  } else if (command == "threshold default") {
    removeSoilWateringThreshold();
    printThreshold();
    return;
  } else if (command.startsWith("threshold ")) {
    String number = command.substring(10);  // the text after "threshold "
    if (notANumber(number) || !saveSoilWateringThreshold(number.toInt())) {
      Serial.println("Need a number 0-100. Example: threshold 35");
      return;
    }
    printThreshold();
    return;
  } else if (command == "log debug") {
    setLogLevel(LEVEL_DEBUG);
    Serial.println("Log level: DEBUG (all messages)");
    return;
  } else if (command == "log info") {
    setLogLevel(LEVEL_INFO);
    Serial.println("Log level: INFO (default)");
    return;
  } else if (command == "log error") {
    setLogLevel(LEVEL_ERROR);
    Serial.println("Log level: ERROR (problems only)");
    return;
  } else if (command == "wifi") {
    printNetworkInfo();  // Module 10
    return;
  } else if (command == "wifi forget") {
    forgetWiFi();  // Module 10: erases the saved WiFi, then restarts into the portal
    return;
  } else if (command == "node2") {
    printNode2Info();  // Module 14: Node 2 packet statistics
    return;
  } else if (command == "node2 reset") {
    resetNode2Counters();  // Module 14: the counters start from zero, for example right when the router is unplugged
    printNode2Info();
    return;
  } else if (command == "rs485") {
    printRS485Info();  // Module 15: RS-485 soil sensor
    return;
  } else if (command == "rs485 on") {
    useRS485(true);  // Module 15: start reading the sensor every 10 seconds
    printRS485Info();
    return;
  } else if (command == "rs485 off") {
    useRS485(false);  // Module 15: stop reading; its fields disappear from telemetry
    printRS485Info();
    return;
  } else if (command == "send") {
    sendNow();  // Module 11: publishes telemetry right now over MQTT
    return;
  } else if (command == "restart") {
    Serial.println("Restarting now...");
    Serial.flush();  // wait until the message above has really been sent
    ESP.restart();
  } else if (command != "status") {
    Serial.println("Unknown command. Examples: lamp on, fan off, pump 3, curtain 90, beep, status,");
    Serial.println("info, threshold, threshold 35, threshold default, log debug, log info, log error, wifi, wifi forget,");
    Serial.println("send, node2, node2 reset, rs485, rs485 on, rs485 off, restart");
    return;
  }
  printStatus();
}
