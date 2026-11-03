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
#include "ota-check.h"   // Module 28: tidyAddress(), checkServerAddress(), checkBrokerAddress()
#include "ota-update.h"  // Module 28: the "ota" and "restart" commands
#include "claim.h"       // Module 28: the "claim" command
#include "commands.h"

// Module 21: up from 40, so "key " + a 43-character key fits. Module 28: up from 80, so
// "claim <code> <64-character server address> <broker address>" fits.
const int MAX_LINE_LENGTH = 128;
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

// ---------- Module 28: the server address, the broker address, and the claim code ----------
// Splits a line into words separated by spaces. Returns the number of words (more than "maxWords" = maxWords + 1).
static int splitWords(const String& text, String words[], int maxWords) {
  int count = 0;
  int i = 0;
  int n = text.length();
  while (i < n) {
    while (i < n && text[i] == ' ') {
      i++;
    }
    if (i >= n) {
      break;
    }
    int start = i;
    while (i < n && text[i] != ' ') {
      i++;
    }
    if (count == maxWords) {
      return maxWords + 1;  // too many words
    }
    words[count] = text.substring(start, i);
    count++;
  }
  return count;
}

static bool setServerAddress(const String& text) {
  char tidy[SERVER_ADDRESS_MAX_LENGTH + 2];  // +2: an address that is too long is still detected
  tidyAddress(text.c_str(), tidy, sizeof(tidy));
  const char* wrong = checkServerAddress(tidy);
  if (wrong != nullptr) {
    Serial.printf("server: not saved. %s\n", wrong);
    return false;
  }
  saveServerAddress(tidy);
  Serial.printf("server: %s (firmware is only downloaded from this address: <address>/fw/node-1/<version>.bin)\n",
                storedServerAddress());
  return true;
}

static bool setBrokerAddress(const String& text) {
  char tidy[SERVER_ADDRESS_MAX_LENGTH + 2];
  tidyAddress(text.c_str(), tidy, sizeof(tidy));
  const char* wrong = checkBrokerAddress(tidy);
  if (wrong != nullptr) {
    Serial.printf("broker: not saved. %s\n", wrong);
    return false;
  }
  saveBrokerAddress(tidy);
  changeBrokerAddress();  // networking.cpp: reconnect now to that address
  Serial.printf("broker: %s, door %u; Node 1 is connecting there now.\n", storedBrokerAddress(), BROKER_PORT);
  return true;
}

// "claim <code> [server address] [broker address]": a way to register without the portal (for example in Wokwi, or a board that
// already has Wi-Fi). The addresses written are saved first, then the code is sent.
static void runClaimCommand(const String& command) {
  String words[4];
  int count = splitWords(command, words, 4);
  if (count < 2 || count > 4) {
    Serial.println("Example: claim 7K2M-QF9D http://192.168.1.10 192.168.1.37 (the server and broker addresses may be "
                   "left out; write the code with its -, without spaces)");
    return;
  }
  if (count >= 3 && !setServerAddress(words[2])) {
    return;
  }
  if (count == 4 && !setBrokerAddress(words[3])) {
    return;
  }
  const char* wrong = startClaim(words[1].c_str());
  if (wrong != nullptr) {
    Serial.printf("claim: %s\n", wrong);
    return;
  }
  Serial.printf("claim: code accepted; sent to %s as soon as Wi-Fi is ready (the result shows in the log).\n", storedServerAddress());
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
  } else if (command == "ota") {
    printOtaInfo();  // Module 28: version, program shelves, trial period, update report
    return;
  } else if (command == "server") {
    Serial.printf("server: %s\n", storedServerAddress()[0] != '\0' ? storedServerAddress()
                                                                    : "NOT SET. Example: server http://192.168.1.10");
    return;
  } else if (command.startsWith("server ")) {
    setServerAddress(command.substring(7));  // Module 28: saved in NVS
    return;
  } else if (command == "broker") {
    Serial.printf("broker: %s (%s), door %u\n", storedBrokerAddress(),
                  brokerAddressFromNvs() ? "from NVS" : "from config.h", BROKER_PORT);
    return;
  } else if (command.startsWith("broker ")) {
    setBrokerAddress(command.substring(7));  // Module 28: saved in NVS, then reconnect
    return;
  } else if (command == "claim") {
    printClaimInfo();  // Module 28
    return;
  } else if (command.startsWith("claim ")) {
    runClaimCommand(command);  // Module 28: register with a claim code from the admin
    return;
  } else if (command == "restart") {
    restartOnPurpose("Serial restart command");  // Module 28: offline-mode + a clean disconnect first, then restart
  } else if (command != "status") {
    Serial.println("Unknown command. Examples: lamp on, fan off, pump 3, curtain 90, beep, status,");
    Serial.println("info, threshold, threshold 35, threshold default, log debug, log info, log error, wifi, wifi forget,");
    Serial.println("send, node2, node2 reset, rs485, rs485 on, rs485 off, test offline, key, key clear,");
    Serial.println("ota, server, server <address>, broker, broker <ip>, claim, claim <code> [server] [broker], restart");
    return;
  }
  printStatus();
}
