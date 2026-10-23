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

const int MAX_LINE_LENGTH = 80;  // Module 21: up from 40, so "key " + a 43-character key fits
static char line[MAX_LINE_LENGTH + 1];  // +1 for the end-of-text mark
static int lineLength = 0;
static bool lineTruncated = false;  // Module 21: a line longer than its container: don't use it (the key would be cut!)

// Collects letters from the Serial Monitor WITHOUT waiting.
// Returns true once, when a line is complete (ended with Enter); its text is in "line".
static bool lineReady() {
  while (Serial.available() > 0) {
    char letter = Serial.read();
    if (letter == '\n') {
      line[lineLength] = '\0';  // end-of-text mark
      lineLength = 0;           // ready to collect the next line
      if (lineTruncated) {
        lineTruncated = false;
        Serial.printf("Line longer than %d characters: ignored.\n", MAX_LINE_LENGTH);
        return false;
      }
      return true;
    }
    if (letter != '\r' && lineLength < MAX_LINE_LENGTH) {
      line[lineLength] = letter;
      lineLength++;
    } else if (letter != '\r') {
      lineTruncated = true;
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
  source = "default value";  // Module 19: the safety fan threshold, sent by the server with config
  if (tempFanThresholdFromNvs()) {
    source = "from NVS";
  }
  Serial.printf("threshold: temp_fan_on = %.1f C (%s); safety fan turns off below %.1f C\n", tempFanThreshold(), source,
                tempFanThreshold() - FAN_HYSTERESIS);
}

// Module 21: the broker key's state WITHOUT showing its content: only the length and the last 4 characters (if the key is long).
static void printKey() {
  const char* key = brokerKey();
  size_t length = strlen(key);
  if (length == 0) {
    Serial.printf("key: NONE YET. Node 1 connects as %s without a key; a broker that is already locked will reject it.\n",
                  brokerUsername());
    Serial.println("key: type key <value> (copy it from the device registration), then Enter.");
    return;
  }
  if (length >= 16) {
    Serial.printf("key: stored in NVS, %u chars, ending ...%s\n", (unsigned)length, key + length - 4);
  } else {
    Serial.printf("key: stored in NVS, %u chars\n", (unsigned)length);  // a short key: even its end is kept secret
  }
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
  String original = command;   // Module 21: the broker key's upper/lower case must stay intact
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
  } else if (command == "test offline") {
    startOfflineTest();  // Module 19: practice losing the broker for 3 minutes
    return;
  } else if (command == "key") {
    printKey();  // Module 21: the broker key's state, without showing its content
    Serial.printf("key: broker username %s, WiFi %s\n", brokerUsername(), networkText());
    return;
  } else if (command == "key clear") {
    if (brokerKey()[0] != '\0') {
      clearBrokerKey();  // Module 21: from now on Node 1 connects without a key (a locked broker rejects it)
      changeBrokerKey();
    }
    printKey();
    return;
  } else if (command.startsWith("key ")) {
    String value = original.substring(4);  // from the ORIGINAL line: the key's upper/lower case stays
    value.trim();
    if (value == brokerKey() && mqttReady()) {
      Serial.println("key: same as the stored one and already connected, not changed.");
      return;
    }
    if (!saveBrokerKey(value.c_str())) {  // the same key isn't written to NVS again
      Serial.println("key: not saved. Only A-Z, a-z, digits 0-9, - and _, no spaces, "
                     "at most 64 characters.");
      return;
    }
    changeBrokerKey();  // Module 21: tried right away, without waiting for the interval
    printKey();
    Serial.printf("key: Node 1 is trying to connect to the broker as %s with this key now.\n", brokerUsername());
    return;
  } else if (command == "restart") {
    Serial.println("Restarting now...");
    Serial.flush();  // wait until the message above has really been sent
    ESP.restart();
  } else if (command != "status") {
    Serial.println("Unknown command. Examples: lamp on, fan off, pump 3, curtain 90, beep, status,");
    Serial.println("info, threshold, threshold 35, threshold default, log debug, log info, log error, wifi, wifi forget,");
    Serial.println("send, node2, node2 reset, rs485, rs485 on, rs485 off, test offline, key, key clear, restart");
    return;
  }
  printStatus();
}
