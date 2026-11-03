// networking.cpp - the code of the network module. Its functions are listed in networking.h.
#include <Arduino.h>
#include <esp_mac.h>  // esp_read_mac(): the MAC address straight from the chip
#include <WiFi.h>
#include <WiFiManager.h>   // WiFiManager library: the WiFi portal (Module 10)
#include <PubSubClient.h>  // PubSubClient3 library: MQTT (Module 11)
#include <ArduinoJson.h>   // ArduinoJson library
#include <time.h>
#include "config.h"
#include "logger.h"
#include "system.h"
#include "settings.h"
#include "sensors.h"
#include "actuators.h"
#include "display.h"
#include "rs485.h"
#include "ota-check.h"     // Module 28: tidyAddress(), checkServerAddress(), checkBrokerAddress(), UpdateFields
#include "ota-update.h"    // Module 28: the update command, the ota report in vitals, restarting on purpose
#include "trial-period.h"  // Module 28: firmwareProven(), inTrialPeriod()
#include "claim.h"         // Module 28: a claim code from the Wi-Fi portal
#include "networking.h"

#ifndef MQTT_QOS1  // only PubSubClient3 has this name
#error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
#endif

// Module 28: the Wi-Fi portal password (optional) in keys.h, the file that doesn't go to GitHub (Module 14, Practice 8). Write there:
//   #define PORTAL_PASSWORD "a-password-of-8-to-63-characters"
// then write the same password on the label of Node 1's box. Without that line, the portal is open without a password as in Module 10.
#if __has_include("keys.h")
#include "keys.h"
#endif
#ifndef PORTAL_PASSWORD
#define PORTAL_PASSWORD ""
#endif
static_assert(sizeof(PORTAL_PASSWORD) == 1 || (sizeof(PORTAL_PASSWORD) >= 9 && sizeof(PORTAL_PASSWORD) <= 64),
              "PORTAL_PASSWORD in keys.h must be 8-63 characters (the WPA2 Wi-Fi password rule), or delete the line");

const unsigned long NO_ATTEMPT_TIMEOUT = 60000;  // guard: 60 seconds without a connection attempt = tell it to try again
const unsigned long TRIAL_RETRY_INTERVAL = 10000;  // Module 28: during a new firmware's trial period, every 10 seconds
const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later
const unsigned long REJECTED_RETRY_INTERVAL = 60000;  // Module 21: the broker REJECTS the key? try again 60 seconds later
const unsigned long MIN_IMMEDIATE_GAP = 2000;    // immediate sends at most every 2 seconds
const unsigned long REPORT_DELAY = 10000;        // Module 19: offline-mode report sent 10 seconds after connecting
const char WOKWI_BROKER[] = "broker.emqx.io";    // Wokwi can't reach your laptop: use a public broker
const char WOKWI_BROKER_LOCKED[] = "test.mosquitto.org";  // Module 21: port 1884 is only for those with an account

static WiFiClient netClient;          // TCP connection to the broker
static PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
static char deviceId[13] = "";  // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
static const char* brokerAddress = BROKER_ADDRESS;  // Module 21: chosen in setupNetwork(); Module 28: from NVS
static uint16_t brokerPort = BROKER_PORT;
static const char* username = deviceId;  // Module 21: the broker username = device_id (data contract section 1)
static bool brokerRejected = false;      // Module 21: the last attempt was answered by the broker with code 4 or 5
static char telemetryTopic[40] = "";
static char statusTopic[40] = "";
static char vitalsTopic[40] = "";
static char cmdTopic[40] = "";
static char ackTopic[40] = "";

// ---------- Flags from the WiFi event function (Module 10, Practice 3) ----------
static volatile bool gotIpFlag = false;
static volatile bool disconnectedFlag = false;
static volatile uint8_t disconnectReason = 0;
static volatile unsigned long lastEventTime = 0;  // millis() at the last WiFi event

static bool hasWiFi = false;  // is there a saved WiFi (or Wokwi-GUEST) to connect to?
static bool connected = false;
static bool servicesStarted = false;  // the internet time is started only once
static bool clockReported = false;
static unsigned long disconnectTime = 0;
static unsigned long lastGuardTime = 0;
static uint8_t routerChannel = 0;  // Module 14: the router's channel at the last connection; ESP-NOW follows this channel

// ---------- MQTT (Module 11) ----------
static bool mqttConnected = false;
static bool hasTriedMqtt = false;
static unsigned long lastMqttTryTime = 0;
static int lastFailCode = 0;  // so the same failure isn't logged every 5 seconds
static SensorReading readingToSend;
static bool hasReading = false;
static bool hasSent = false;
static unsigned long lastSendTime = 0;
static uint8_t lastState = 0;  // the last known important events (see importantState())
static int lastCurtain = 0;    // Module 19: the curtain angle at the previous reading
static bool stateKnown = false;
static const char* immediateReason = nullptr;  // not nullptr = an important event that isn't sent yet
static bool vitalsSent = false;
static unsigned long lastVitalsTime = 0;
static unsigned long publishCount = 0;
static char lastIds[8][40];  // the last 8 command ids received (including refused ones)
static int idPosition = 0;
static bool held = false;  // Module 28: stopped on purpose (offline-mode): don't reconnect until allowed

// ---------- Module 19: offline mode and its report ----------
static unsigned long lastReadyTime = 0;   // millis() the last time WiFi and MQTT were both connected
static bool offline = false;              // in offline mode right now?
static unsigned long offlineStartTime = 0;
static unsigned long offlineEndTime = 0;  // when the last offline mode ended (the report waits from here)
static uint16_t localFan = 0;             // times the safety rule turned the fan on in this offline mode
static bool reportPending = false;        // the offline-mode report hasn't gone out with vitals yet
static unsigned long reportSeconds = 0;   // offline-mode time (seconds) not reported yet
static uint16_t reportLocalFan = 0;       // number of safety fan turn-ons not reported yet
static bool offlineTest = false;          // is the "test offline" command running?
static unsigned long offlineTestTime = 0;

// Called by the esp32 package from the WiFi "worker", not from loop(): just raise a flag.
static void onWiFiEvent(arduino_event_id_t event, arduino_event_info_t info) {
  lastEventTime = millis();  // every event's time is noted for the guard
  if (event == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
    gotIpFlag = true;
  } else if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED
             && info.wifi_sta_disconnected.reason != WIFI_REASON_STA_LEAVING) {  // 36: the esp32 package's own trace when it tries again
    disconnectReason = info.wifi_sta_disconnected.reason;
    disconnectedFlag = true;
  }
}

// The esp32 package's name for a disconnect reason code. Codes 209-212 have no name there yet.
static const char* reasonName(uint8_t code) {
  const char* name = WiFi.disconnectReasonName((wifi_err_reason_t)code);
  if (name[0] == '\0') {  // empty text: its first letter is already the end-of-text mark
    return "see the table in Concept 4 of Module 10";
  }
  return name;
}

// What the mqtt.state() numbers mean (Module 11, Concept 10). The numbers 1-5 are the broker's own answer.
static const char* mqttStateName(int code) {
  switch (code) {
    case -4: return "the broker did not answer in time";
    case -3: return "connection lost";
    case -2: return "could not connect to the broker";
    case -1: return "not connected yet";
    case 0: return "connected";
    case 4: return "username or key rejected";
    case 5: return "not authorized by the broker: key wrong, empty, or revoked";  // Module 21: Mosquitto always answers 5
    default: return "rejected by the broker";
  }
}

// ---------- Timestamp (Module 10, Practice 5) ----------
bool makeTs(char* ts, size_t size) {
  time_t now = time(nullptr);
  struct tm utc;
  gmtime_r(&now, &utc);
  if (utc.tm_year + 1900 < 2025) {
    return false;  // the clock is not set from the internet yet: the ESP32 still thinks it is 1970
  }
  strftime(ts, size, "%Y-%m-%dT%H:%M:%SZ", &utc);
  return true;
}

// ---------- WiFi portal (Module 10, Practice 4) ----------
// Module 28: the content of the three extra fields is saved here, when the portal's Save button is pressed. WiFiManager itself
// does NOT save the content of extra fields; that's our job. A field left empty means "not changed".
static void savePortalFields(const char* code, const char* server, const char* broker) {
  char tidy[SERVER_ADDRESS_MAX_LENGTH + 2];  // +2: an address that is too long is still detected
  if (server[0] != '\0') {
    tidyAddress(server, tidy, sizeof(tidy));
    const char* wrong = checkServerAddress(tidy);
    if (wrong != nullptr) {
      logError("Portal: the server address was NOT saved. %s", wrong);
    } else {
      saveServerAddress(tidy);
    }
  }
  if (broker[0] != '\0') {
    tidyAddress(broker, tidy, sizeof(tidy));
    const char* wrong = checkBrokerAddress(tidy);
    if (wrong != nullptr) {
      logError("Portal: the broker address was NOT saved. %s", wrong);
    } else {
      saveBrokerAddress(tidy);
    }
  }
  if (code[0] != '\0') {
    const char* wrong = startClaim(code);  // claim.cpp: sent as soon as Wi-Fi connects (loop())
    if (wrong != nullptr) {
      logError("Portal: the claim code wasn't used: %s", wrong);
    }
  }
}

// Waiting here is allowed: it is called from setup(), before the watchdog watches loop().
static void openPortal() {
  logInfo("WiFi portal open for %lu seconds: connect your phone to the WiFi \"%s\", then open http://192.168.4.1",
          PORTAL_TIMEOUT, PORTAL_NAME);
  if (PORTAL_PASSWORD[0] != '\0') {
    logInfo("Password-protected portal: its password is on the label of Node 1's box (PORTAL_PASSWORD in keys.h).");
  } else {
    logError("Portal WITHOUT a password: anyone near Node 1 can open 192.168.4.1, including the /update page. "
             "Set PORTAL_PASSWORD in keys.h (Module 28).");
  }
  showMessage("WIFI PORTAL", "Connect a phone to:", PORTAL_NAME, "Open 192.168.4.1");
  digitalWrite(PIN_STATUS_LED, HIGH);  // the status LED stays on while the portal is open

  delay(500);  // give the WiFi radio time to finish starting before it becomes an access point
  WiFiManager wm;
  wm.setDebugOutput(false);  // WiFiManager's own log messages are not printed
  wm.setTitle("Node 1 Home");
  std::vector<const char*> menu = { "wifi", "info", "exit" };  // main page without the Update button
  wm.setMenu(menu);
  wm.setShowInfoUpdate(false);  // the Update button on the Info page is hidden too
  // The address 192.168.4.1/update itself still exists: open the portal only while you are filling it in yourself.
  wm.setConfigPortalTimeout(PORTAL_TIMEOUT);  // closes by itself when unused
  wm.setConnectTimeout(20);                   // tries the newly entered WiFi for at most 20 seconds

  // Module 28: three extra fields on the WiFi page (its menu has no "param", so the fields go on the WiFi page):
  // (id, the label above the field, its initial content, its maximum length). The fields must exist while the portal is open.
  WiFiManagerParameter codeField("claim_code", "Claim code from /fleet (may be empty)", "", 12);
  WiFiManagerParameter serverField("server_address", "Server address, for example http://192.168.1.10", storedServerAddress(),
                                   SERVER_ADDRESS_MAX_LENGTH);
  WiFiManagerParameter brokerField("broker_address", "Broker address (the Pi gateway's IP)", storedBrokerAddress(),
                                   BROKER_ADDRESS_MAX_LENGTH);
  wm.addParameter(&codeField);
  wm.addParameter(&serverField);
  wm.addParameter(&brokerField);
  // [&] = a small nameless function that may use the three fields above; WiFiManager calls it when Save is pressed.
  wm.setSaveParamsCallback([&]() {
    savePortalFields(codeField.getValue(), serverField.getValue(), brokerField.getValue());
  });
  // Module 28: with a password, a phone must enter that password to join the portal's Wi-Fi (nullptr = no password).
  bool success = wm.startConfigPortal(PORTAL_NAME, PORTAL_PASSWORD[0] != '\0' ? PORTAL_PASSWORD : nullptr);

  digitalWrite(PIN_STATUS_LED, LOW);
  if (success) {
    logInfo("Portal: WiFi \"%s\" saved in NVS.", WiFi.SSID().c_str());
  } else {
    logError("Portal closed without a new WiFi. To open it again, hold D13 while pressing EN.");
  }
  hasWiFi = wm.getWiFiIsSaved();
}

// ---------- Commands over MQTT (Module 11, Practice 6) ----------
static bool alreadyReceived(const char* id) {
  for (int i = 0; i < 8; i++) {
    if (strcmp(lastIds[i], id) == 0) {
      return true;
    }
  }
  return false;
}

static void rememberId(const char* id) {
  snprintf(lastIds[idPosition], sizeof(lastIds[idPosition]), "%s", id);
  idPosition = (idPosition + 1) % 8;  // the oldest one is overwritten
}

// The state of all four actuators (Appendix A): "state" in ack and, since contract 1.3 (Module 19), also in telemetry.
static void writeState(JsonDocument& doc) {
  JsonObject state = doc["state"].to<JsonObject>();
  state["fan"] = fanOn();
  state["lamp"] = lampOn();
  state["pump"] = pumpOn();
  state["curtain"] = curtainAngle();
}

// The answer to a command (Appendix A): the same id, ok, the state of all four actuators, and message if refused.
static void sendAck(const char* id, bool ok, const char* message) {
  JsonDocument reply;
  reply["id"] = id;
  char ts[21];
  if (makeTs(ts, sizeof(ts))) {
    reply["ts"] = ts;
  } else {
    reply["ts"] = nullptr;  // clock not set yet: answer anyway, without a timestamp
  }
  reply["ok"] = ok;
  if (!ok) {
    reply["message"] = message;
  }
  writeState(reply);
  char content[256];
  size_t length = serializeJson(reply, content, sizeof(content));
  if (length >= sizeof(content)) {
    logError("Ack too long for the content[] container: not sent.");
    return;
  }
  mqtt.publish(ackTopic, content);
  logDebug("Ack content: %s", content);
}

// One "set" command: returns nullptr if it worked, or the reason it was refused.
static const char* doSet(JsonDocument& command) {
  const char* target = command["target"] | "";
  JsonVariant value = command["value"];
  if (strcmp(target, "lamp") == 0) {
    if (!value.is<bool>()) {
      return "lamp value must be true or false";
    }
    setLamp(value.as<bool>());
    return nullptr;
  }
  if (strcmp(target, "fan") == 0) {
    if (!value.is<bool>()) {
      return "fan value must be true or false";
    }
    setFan(value.as<bool>());
    return nullptr;
  }
  if (strcmp(target, "pump") == 0) {
    if (!value.is<int>() || value.as<int>() < 1 || value.as<int>() > 10) {
      return "pump value must be 1-10 seconds";
    }
    int waterLevel = lastReading().water_level;
    if (!turnOnPump(value.as<int>(), waterLevel)) {  // the Module 6 water tank safety still applies
      return waterLevel < 0 ? "pump refused: tank level unreadable" : "pump refused: tank water too low";
    }
    return nullptr;
  }
  if (strcmp(target, "curtain") == 0) {
    if (!value.is<int>() || value.as<int>() < 0 || value.as<int>() > 180) {
      return "curtain value must be 0-180 degrees";
    }
    setCurtain(value.as<int>());
    return nullptr;
  }
  return "unknown target";
}

// Module 19: one "config" command. All thresholds are checked first; only if all of them are valid are they saved
// to NVS (only the ones whose number changed). Returns nullptr if it worked, or the reason it was refused.
// Module 28 (contract 1.6): a config may carry "thresholds", "intervals", or both. Everything is checked first, then saved.
static const char* doConfig(JsonDocument& command) {
  static char reason[48];  // static: sendAck() still reads its content after this function has ended
  // A key that IS there counts even if its content is null: {"intervals": null} = the wrong type (the whole command is refused,
  // contract section 7), not "not sent". isNull() can't tell the two apart, so the key names are looked up one by one.
  bool hasThresholds = false;
  bool hasIntervals = false;  // Module 28
  for (JsonPair p : command.as<JsonObject>()) {
    hasThresholds = hasThresholds || strcmp(p.key().c_str(), "thresholds") == 0;
    hasIntervals = hasIntervals || strcmp(p.key().c_str(), "intervals") == 0;
  }
  if (!hasThresholds && !hasIntervals) {
    return "config must contain thresholds or intervals";
  }
  JsonObject thresholds = command["thresholds"].as<JsonObject>();
  if (hasThresholds) {
    if (thresholds.isNull() || thresholds.size() == 0) {
      return "thresholds must contain temp_fan_on or soil_watering";
    }
    for (JsonPair p : thresholds) {  // any other name = a typo: refuse everything so that nothing slips through quietly
      const char* name = p.key().c_str();
      if (strcmp(name, "temp_fan_on") != 0 && strcmp(name, "soil_watering") != 0) {
        snprintf(reason, sizeof(reason), "unknown threshold: %s", name);
        return reason;
      }
    }
    JsonVariant temperature = thresholds["temp_fan_on"];
    JsonVariant soil = thresholds["soil_watering"];
    if (!temperature.isNull()
        && (!temperature.is<float>() || temperature.as<float>() < TEMP_FAN_MIN || temperature.as<float>() > TEMP_FAN_MAX)) {
      return "temp_fan_on must be a number 15-45";
    }
    if (!soil.isNull() && (!soil.is<int>() || soil.as<int>() < 0 || soil.as<int>() > 100)) {
      return "soil_watering must be a whole number 0-100";
    }
  }
  // Module 28: "intervals" may only contain vitals_s (60-3600 seconds). telemetry stays 10 seconds (contract rule 3).
  JsonObject intervals = command["intervals"].as<JsonObject>();
  if (hasIntervals) {
    if (intervals.isNull()) {
      return "intervals must contain vitals_s";
    }
    for (JsonPair p : intervals) {
      const char* name = p.key().c_str();
      if (strcmp(name, "vitals_s") != 0) {
        snprintf(reason, sizeof(reason), "unknown interval: %s", name);
        return reason;
      }
    }
    JsonVariant vitals = intervals["vitals_s"];
    if (!vitals.is<int>() || vitals.as<int>() < (int)VITALS_INTERVAL_MIN_S || vitals.as<int>() > (int)VITALS_INTERVAL_MAX_S) {
      return "vitals_s must be a whole number 60-3600";
    }
  }
  // All valid: only now are they saved (only the ones whose number changed).
  if (hasThresholds) {
    JsonVariant temperature = thresholds["temp_fan_on"];
    JsonVariant soil = thresholds["soil_watering"];
    if (!temperature.isNull()) {
      saveTempFanThreshold(temperature.as<float>());
    }
    if (!soil.isNull()) {
      saveSoilWateringThreshold(soil.as<int>());
    }
  }
  if (hasIntervals) {
    int seconds = intervals["vitals_s"].as<int>();
    if ((unsigned long)seconds != vitalsIntervalSeconds()) {
      saveVitalsInterval(seconds);
      lastVitalsTime = millis();  // the new schedule counts from now (the same as the simulator)
    }
  }
  return nullptr;
}

// Module 28: one "update" command. Its content is taken from the JSON, then checked and accepted in ota-update.cpp.
// A field that is missing or of the wrong type becomes nullptr / -1, and is refused with the same reason as the simulator.
static const char* handleUpdate(const char* id, JsonDocument& command) {
  UpdateFields content = {
    command["version"].as<const char*>(),  // nullptr if it's missing or not text
    command["url"].as<const char*>(),
    command["sha256"].as<const char*>(),
    command["size"].is<long>() ? (long long)command["size"].as<long>() : -1,  // a fraction, text, missing = -1
  };
  return acceptUpdate(id, content);
}

// Called by the library inside mqtt.loop() for every message on msh/<device_id>/cmd.
// The order: read the JSON, check, carry out, answer. A command whose id was already received is ignored.
static void onMqttMessage(char* topic, byte* content, unsigned int length) {
  if (length == 0) {  // Module 19: empty message = someone deleted the retained config from the broker, not a command
    logDebug("Empty cmd message (retained message deleted): ignored.");
    return;
  }
  JsonDocument command;
  DeserializationError error = deserializeJson(command, content, length);  // the content has no end-of-text mark
  if (error) {
    logError("Command is not valid JSON (%s): ignored.", error.c_str());  // no id: can't be answered
    return;
  }
  const char* id = command["id"] | "";  // "" if the id is missing or not text
  if (id[0] == 0) {
    logError("Command without an id: ignored.");
    return;
  }
  if (strlen(id) >= sizeof(lastIds[0])) {  // at most 39 characters: fits in the id memory and in the ack
    logError("Command with an id longer than 39 characters: ignored.");
    return;
  }
  const char* action = command["action"] | "";
  if (alreadyReceived(id)) {
    if (strcmp(action, "config") == 0) {  // Module 19: a retained config comes again after every connect: that's normal
      logDebug("Config %s arrived again (retained, after connecting): already done.", id);
    } else {
      logInfo("Command %s was already received: ignored.", id);
    }
    return;
  }
  if (held) {
    // Module 28: Node 1 is stopping on purpose (it disconnects shortly). The command isn't carried out, but it is still answered
    // (contract rule 4: every cmd is answered), and its id is NOT remembered: a retained config that arrives again after
    // connecting, or a command sent again, is still carried out later.
    const char* reason = strcmp(action, "update") == 0 && updateInProgress()
                             ? "another update is running"
                             : "Node 1 is stopping on purpose: send it again once it is online";
    logInfo("Command %s arrived while Node 1 was stopping on purpose: refused (%s).", id, reason);
    sendAck(id, false, reason);
    return;
  }
  rememberId(id);
  const char* message = "unknown action";
  if (strcmp(action, "set") == 0) {
    message = doSet(command);
  } else if (strcmp(action, "config") == 0) {
    message = doConfig(command);  // Module 19
  } else if (strcmp(action, "update") == 0) {
    message = handleUpdate(id, command);  // Module 28: ok = ACCEPTED; the download starts in the next pass of loop()
  }
  if (message == nullptr && strcmp(action, "update") == 0) {
    logInfo("Command %s: update to %s accepted; the update begins.", id, command["version"] | "?");
  } else if (message == nullptr && strcmp(action, "config") == 0) {
    logInfo("Command %s: config done.", id);
  } else if (message == nullptr) {
    logInfo("Command %s: %s %s done.", id, action, command["target"] | "");
  } else {
    logError("Command %s refused: %s", id, message);
  }
  sendAck(id, message == nullptr, message);
}

void setupNetwork() {
  WiFi.onEvent(onWiFiEvent);      // register it BEFORE starting to connect
  WiFi.setHostname(DEVICE_NAME);  // the name in the router's device list (Module 10, Practice 9)
  WiFi.setSleep(false);           // Module 14: the radio always listens for ESP-NOW (set BEFORE WiFi.mode)
  WiFi.setAutoReconnect(false);   // Module 14: when the router is off, the esp32 package doesn't scan nonstop;
                                  // only the 60-second guard in guardConnection() tries again
  WiFi.mode(WIFI_STA);            // required before asking "is there a saved WiFi?"

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);  // WiFi.macAddress() still says 00:00:... while the WiFi hasn't finished starting
  snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(telemetryTopic, sizeof(telemetryTopic), "msh/%s/telemetry", deviceId);
  snprintf(statusTopic, sizeof(statusTopic), "msh/%s/status", deviceId);
  snprintf(vitalsTopic, sizeof(vitalsTopic), "msh/%s/vitals", deviceId);
  snprintf(cmdTopic, sizeof(cmdTopic), "msh/%s/cmd", deviceId);
  snprintf(ackTopic, sizeof(ackTopic), "msh/%s/ack", deviceId);
  logInfo("device_id %s", deviceId);

  netClient.setConnectionTimeout(1000);  // TCP connect to the broker takes at most 1 second (default: 3 seconds)
  mqtt.setSocketTimeout(1);  // wait at most 1 second for the broker's answer (default: 15 seconds)
  if (!mqtt.setBufferSize(512)) {  // a 512-byte message container (default: 256)
    logError("Not enough memory for a 512-byte MQTT message container.");
  }
  mqtt.setCallback(onMqttMessage);

  if (USE_WOKWI) {
    logInfo("Wokwi mode: connecting to Wokwi-GUEST without the portal, public broker %s:%u.",
            WOKWI_LOCKED ? WOKWI_BROKER_LOCKED : WOKWI_BROKER, WOKWI_LOCKED ? 1884 : BROKER_PORT);
    WiFi.begin("Wokwi-GUEST", "", 6);  // 6 = the Wokwi-GUEST channel so that it connects faster
    hasWiFi = true;
  } else {
    WiFiManager wm;
    hasWiFi = wm.getWiFiIsSaved();
    bool portalRequested = digitalRead(PIN_BUTTON) == LOW || !hasWiFi;
    if (portalRequested && inTrialPeriod()) {
      // Module 28: new firmware must connect to the broker within 60 seconds. A portal waiting here (up to 3 minutes)
      // would surely make it fail, so the portal is postponed: after the trial period (or a rollback), hold D13 while pressing EN.
      logError("Trial period of new firmware: the Wi-Fi portal is POSTPONED. Open it after the trial (hold D13, press EN).");
    } else if (digitalRead(PIN_BUTTON) == LOW) {  // D13 button held at power-up = asking for the portal
      logInfo("D13 button held at power-up: WiFi portal opened.");
      openPortal();
    } else if (!hasWiFi) {
      logInfo("No saved WiFi yet.");
      openPortal();
    }
    if (hasWiFi && WiFi.status() != WL_CONNECTED) {
      WiFi.begin();  // use the WiFi saved in NVS, without waiting
      logInfo("Connecting to the saved WiFi \"%s\" (without waiting)...", wm.getWiFiSSID().c_str());
    }
  }

  // The broker address is chosen AFTER the portal: the portal's "Broker address" field may have just changed it (Module 28).
  if (USE_WOKWI && WOKWI_LOCKED) {  // Module 21: the "accepted vs rejected" practice on a locked public broker
    brokerAddress = WOKWI_BROKER_LOCKED;
    brokerPort = 1884;  // the MQTT port of test.mosquitto.org that asks for a username and key
    username = "rw";    // the public test.mosquitto.org account; its key: readwrite
  } else if (USE_WOKWI) {
    brokerAddress = WOKWI_BROKER;
  } else {
    brokerAddress = storedBrokerAddress();  // Module 28: from NVS (portal, Serial, claim), or BROKER_ADDRESS
  }
  mqtt.setServer(brokerAddress, brokerPort);  // at home: an IP address, not a name, so no name lookup (DNS) needed
  lastReadyTime = millis();  // Module 19: the offline-mode count starts after the WiFi portal, not at power-up
}

// Only once, at the first connection: the internet time (Module 10, Practice 5).
static void startServices() {
  configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");
  servicesStarted = true;
}

// The guard (Module 10, Concept 4): if there has been no connection attempt for a very long time, tell the esp32 package to try again.
// Since v1.3.0 (Module 14) this guard is the only one that orders a reconnect: setAutoReconnect(false).
static void guardConnection() {
  if (connected || !hasWiFi) {
    return;
  }
  unsigned long lastEvent = lastEventTime;  // copy it FIRST: the WiFi worker can change it at any moment
  unsigned long now = millis();             // only then read the clock, so now >= lastEvent
  // Module 14: 3 seconds without a WiFi event and 3 seconds after the guard's attempt = the radio isn't scanning.
  // Put the radio back on the router's channel so that Node 2's ESP-NOW packets are still heard while the router is off.
  if (routerChannel != 0 && now - lastEvent >= 3000 && now - lastGuardTime >= 3000
      && WiFi.channel() != routerChannel) {
    WiFi.setChannel(routerChannel);
  }
  // Module 28: the esp32 package only retries by ITSELF once after starting (setAutoReconnect(false)). During the trial period,
  // new firmware must connect within 60 seconds, so the guard tries every 10 seconds, not every 60; otherwise a router
  // that is just restarting would already make good firmware roll back.
  unsigned long limit = inTrialPeriod() ? TRIAL_RETRY_INTERVAL : NO_ATTEMPT_TIMEOUT;
  if (now - lastEvent >= limit && now - lastGuardTime >= limit) {
    lastGuardTime = now;
    logInfo("WiFi guard: %lu seconds without a new attempt, trying to reconnect.", limit / 1000);
    WiFi.reconnect();
  }
}

// ---------- Health report: vitals (Appendix A) ----------
// Module 28 (contract 1.6): vitals also carry reset_reason and fw, and a firmware update report (ota) that hasn't been
// sent 3 times yet. Their interval can be set by the server through the config "intervals.vitals_s" (default 300 seconds).
static void sendVitals() {
  char ts[21];
  if (!makeTs(ts, sizeof(ts))) {
    return;  // every piece of data must carry ts: wait until the clock is set
  }
  JsonDocument doc;
  doc["ts"] = ts;
  doc["rssi"] = WiFi.RSSI();
  doc["uptime_s"] = uptimeSeconds();
  doc["heap_free"] = ESP.getFreeHeap();
  bool hasReport = reportPending;  // Module 19: only in the first vitals after offline mode (contract 1.3)
  if (hasReport) {
    doc["offline_s"] = reportSeconds;
    doc["local_fan"] = reportLocalFan;
  }
  doc["reset_reason"] = resetReasonName();  // Module 28: required since 1.7.0, always together with fw
  doc["fw"] = FIRMWARE_VERSION;
  const OtaReport* otaReport = pendingOtaReport();  // ota-update.cpp; nullptr = no report
  if (otaReport != nullptr) {
    JsonObject ota = doc["ota"].to<JsonObject>();
    ota["id"] = otaReport->id;
    ota["result"] = otaReport->result;
    ota["version"] = otaReport->version;
    if (otaReport->message[0] != '\0') {
      ota["message"] = otaReport->message;
    }
  }
  // Module 28: enlarged from 192 (the longest vitals is about 380 characters). PubSubClient3 3.3.2 sends an OUTGOING message's
  // content bit by bit, so the 512-byte MQTT buffer only limits INCOMING messages (cmd), not vitals.
  char content[480];
  size_t length = serializeJson(doc, content, sizeof(content));
  if (length >= sizeof(content) && otaReport != nullptr) {  // nearly impossible (an id full of special characters): the message goes
    doc["ota"].as<JsonObject>().remove("message");
    length = serializeJson(doc, content, sizeof(content));
  }
  if (length >= sizeof(content)) {
    logError("Vitals too long for the content[] container: not sent.");
    vitalsSent = true;  // don't try again on every pass of loop()
    lastVitalsTime = millis();
    return;
  }
  if (mqtt.publish(vitalsTopic, content)) {
    vitalsSent = true;
    lastVitalsTime = millis();
    logDebug("Vitals content: %s", content);
    if (hasReport) {
      logInfo("Offline-mode report sent with vitals: offline_s=%lu, local_fan=%u", reportSeconds,
              reportLocalFan);
      reportPending = false;
      reportSeconds = 0;
      reportLocalFan = 0;
    }
    if (otaReport != nullptr) {  // Module 28: count the sends of the update report (at most 3 times)
      logInfo("The update report rides along with vitals: %s for %s", otaReport->result, otaReport->version);
      otaReportSent();
    }
  }
}

// One attempt to connect to the broker, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
static void tryConnectBroker() {
  if (held) {  // Module 28: stopped on purpose for a firmware update: don't reconnect yet
    return;
  }
  if (offlineTest) {  // Module 19: the "test offline" command is running: pretend the broker is unreachable
    if (millis() - offlineTestTime < OFFLINE_TEST_TIME) {
      return;
    }
    offlineTest = false;
    logInfo("Offline test finished: Node 1 reconnects to the broker.");
  }
  // Module 21: after the broker rejects the key, try again much less often so the broker log doesn't flood.
  unsigned long interval = brokerRejected ? REJECTED_RETRY_INTERVAL : MQTT_RETRY_INTERVAL;
  if (hasTriedMqtt && millis() - lastMqttTryTime < interval) {
    return;
  }
  hasTriedMqtt = true;
  lastMqttTryTime = millis();
  unsigned long start = millis();
  const char* key = brokerKey();  // Module 21: from NVS; "" = none yet
  if (TEST_WRONG_KEY == 1) {
    // Module 28, the PRACTICE firmware 1.7.2-test: the key is broken on purpose IN RAM ONLY (NVS isn't touched). The broker refuses it,
    // the 60-second trial period passes, and Node 1 goes back by itself to the previous firmware, which uses the real key from NVS.
    key = "broken-key-TEST_WRONG_KEY";
    logError("TEST_WRONG_KEY = 1: the broker key is wrong on purpose (the Module 28 rollback practice).");
  }
  // Client name = device_id; username = device_id (Wokwi locked: rw); key from NVS (nullptr = no key);
  // then the last will: the status topic, QoS 1, retained, content "offline" (Module 11, Concept 7).
  if (mqtt.connect(deviceId, username, key[0] != '\0' ? key : nullptr, statusTopic, 1, true, "offline")) {
    mqttConnected = true;
    brokerRejected = false;
    lastFailCode = 0;
    if (USE_WOKWI) {
      // Module 19: in Wokwi, looking up the address of broker.emqx.io (DNS) after a long disconnect can take more than
      // 5 seconds, and the watchdog restarts Node 1. Keep its IP address: the next reconnect needs no DNS anymore.
      mqtt.setServer(netClient.remoteIP(), brokerPort);
    }
    bool published = mqtt.publish(statusTopic, "online", true);  // retained: subscribers who come later still see it
    bool subscribed = mqtt.subscribe(cmdTopic, 1);                // subscribe again after every connect (clean session)
    logInfo("MQTT connected to broker %s:%u in %lu ms, as %s", brokerAddress, brokerPort, millis() - start,
            username);
    vitalsSent = false;  // the first vitals are sent right away
    if (published && subscribed) {
      firmwareProven();  // Module 28 (trial-period.cpp): key accepted + "online" published + cmd subscribed = firmware VALID
    }
    return;
  }
  int code = mqtt.state();
  brokerRejected = (code == 4 || code == 5);  // Module 21: the broker's own answer, not a network problem
  if (brokerRejected) {  // logged on every attempt (at most once a minute)
    logError("MQTT REJECTED by broker (code %d): key %s. Retrying in %lu seconds.", code,
             key[0] != '\0' ? "wrong, not registered, or revoked" : "not set yet", REJECTED_RETRY_INTERVAL / 1000);
    logInfo("A new key? Type in the Serial Monitor: key <value>, then Enter.");
  } else if (code != lastFailCode) {  // the same failure isn't logged every 5 seconds
    logError("MQTT failed to connect to the broker after %lu ms: %s (code %d). Is the broker on the gateway running?",
             millis() - start, mqttStateName(code), code);
  }
  lastFailCode = code;
}

static void guardMqtt() {
  if (!connected) {
    if (mqttConnected) {
      mqttConnected = false;
      logError("MQTT disconnected as well because the WiFi disconnected.");
    }
    return;
  }
  if (mqtt.connected()) {
    mqtt.loop();  // receives commands and keeps the connection alive (keep-alive)
    // Module 19: after offline mode, the first vitals (the one with the report) waits REPORT_DELAY first. The server
    // usually lost the broker too and only reconnects a few seconds later. vitals is not retained, so a report
    // published before the server subscribes again would never arrive.
    bool reportWaitsForServer = reportPending && millis() - offlineEndTime < REPORT_DELAY;
    if (!reportWaitsForServer && (!vitalsSent || millis() - lastVitalsTime >= vitalsIntervalSeconds() * 1000UL)) {
      sendVitals();
    }
    return;
  }
  if (mqttConnected) {
    mqttConnected = false;
    int code = mqtt.state();
    logError("MQTT DISCONNECTED: %s (code %d). Node 1 keeps working and retries every %lu seconds.",
             mqttStateName(code), code, MQTT_RETRY_INTERVAL / 1000);
  }
  tryConnectBroker();
}

// Module 19: offline mode = WiFi or broker unreachable without a break for OFFLINE_MODE_TIMEOUT, counted from the
// last connection. During offline mode, the safety fan rule (rules.cpp) works on its own.
static void guardOfflineMode() {
  unsigned long now = millis();
  if (mqttReady()) {
    lastReadyTime = now;
    if (offline) {
      offline = false;
      offlineEndTime = now;
      unsigned long elapsed = (now - offlineStartTime) / 1000;
      reportSeconds += elapsed;  // added up: if the vitals couldn't go out yet, the next offline mode counts too
      reportLocalFan += localFan;
      reportPending = true;  // goes with the first vitals after connecting, REPORT_DELAY later (guardMqtt)
      logInfo("OFFLINE MODE ENDED after %lu seconds: broker reachable again. Local safety turned the fan on %u time(s).", elapsed,
              localFan);
    }
    return;
  }
  if (!offline && now - lastReadyTime >= OFFLINE_MODE_TIMEOUT) {
    offline = true;
    offlineStartTime = now;
    localFan = 0;
    logError("OFFLINE MODE: broker %s %lu seconds. Local safety active: fan turns on above %.1f C.",
             brokerRejected ? "rejecting the key for" : "unreachable for", OFFLINE_MODE_TIMEOUT / 1000, tempFanThreshold());
  }
}

void updateNetwork() {
  if (disconnectedFlag) {  // a disconnect always comes before the next connect, so it is handled first
    disconnectedFlag = false;
    if (connected) {  // just disconnected; failed retries are not reported one by one
      connected = false;
      disconnectTime = millis();
      logError("WiFi DISCONNECTED (reason %u: %s). Node 1 keeps working and retries every %lu seconds.", disconnectReason,
               reasonName(disconnectReason), NO_ATTEMPT_TIMEOUT / 1000);
    }
  }
  if (gotIpFlag) {
    gotIpFlag = false;
    if (WiFi.status() == WL_CONNECTED) {  // still connected when the flag is lowered?
      connected = true;
      routerChannel = WiFi.channel();  // Module 14: remembered for ESP-NOW
      if (disconnectTime == 0) {
        logInfo("WiFi connected to \"%s\": IP %s, signal %d dBm, channel %u", WiFi.SSID().c_str(),
                WiFi.localIP().toString().c_str(), WiFi.RSSI(), routerChannel);
      } else {
        logInfo("WiFi connected AGAIN after %lu seconds: IP %s", (millis() - disconnectTime) / 1000,
                WiFi.localIP().toString().c_str());
      }
      if (!servicesStarted) {
        startServices();
      }
    }
  }
  if (!clockReported) {
    char ts[21];
    if (makeTs(ts, sizeof(ts))) {
      clockReported = true;
      logInfo("Clock set from the internet: %s", ts);
    }
  }
  guardConnection();
  guardMqtt();
  guardOfflineMode();  // Module 19
}

// ---------- Sending readings: telemetry (Module 11, Practices 3 and 7) ----------
// Important events as a row of bits: motion, dark, dry soil, low tank water,
// and since Module 19 (contract 1.3) the fan, lamp, and pump being on.
static uint8_t importantState(SensorReading b) {
  uint8_t s = 0;
  if (b.motion) {
    s |= 1;
  }
  if (b.light < DARK_THRESHOLD) {
    s |= 2;
  }
  if (b.soil < soilWateringThreshold()) {
    s |= 4;
  }
  if (b.water_level >= 0 && b.water_level < MIN_WATER_LEVEL) {
    s |= 8;
  }
  if (fanOn()) {  // Module 19: the actuator states go into state in telemetry
    s |= 16;
  }
  if (lampOn()) {
    s |= 32;
  }
  if (pumpOn()) {
    s |= 64;
  }
  return s;
}

// A short phrase for the log: which event changed.
static const char* changeName(uint8_t changed, uint8_t now, int waterLevel) {
  if (changed & 1) {
    return (now & 1) ? "motion detected" : "motion stopped";
  }
  if (changed & 2) {
    return (now & 2) ? "getting dark" : "getting bright";
  }
  if (changed & 4) {
    return (now & 4) ? "soil drying out" : "soil wet again";
  }
  if (changed & 16) {  // Module 19
    return (now & 16) ? "fan turned on" : "fan turned off";
  }
  if (changed & 32) {
    return (now & 32) ? "lamp turned on" : "lamp turned off";
  }
  if (changed & 64) {
    return (now & 64) ? "pump turned on" : "pump turned off";
  }
  if (now & 8) {
    return "tank water low";
  }
  return waterLevel < 0 ? "tank level unreadable" : "tank water OK again";  // -1 = the HC-SR04 couldn't be read
}

// Returns false if no send was attempted because MQTT isn't connected yet or the clock isn't set yet.
static bool publishTelemetry(const char* reason) {
  char ts[21];
  if (!mqtt.connected() || !makeTs(ts, sizeof(ts))) {
    return false;  // every piece of data must carry ts (Appendix A): wait until the clock is set
  }
  JsonDocument doc;
  doc["ts"] = ts;
  doc["fw"] = FIRMWARE_VERSION;
  doc["temperature"] = readingToSend.temperature;  // ArduinoJson writes NAN as null
  if (readingToSend.humidity < 0) {
    doc["humidity"] = nullptr;  // a failed reading is written as null (data contract)
  } else {
    doc["humidity"] = readingToSend.humidity;
  }
  doc["light"] = readingToSend.light;
  doc["soil"] = readingToSend.soil;
  doc["motion"] = readingToSend.motion;
  if (readingToSend.water_level < 0) {
    doc["water_level"] = nullptr;
  } else {
    doc["water_level"] = readingToSend.water_level;
  }
  writeRS485Fields(doc);  // Module 15: soil_rs485, soil_temperature, ec (only when the RS-485 sensor is in use)
  writeState(doc);        // Module 19 (contract 1.3): state, exactly the same as the state in ack
  char content[320];  // Module 19: enlarged from 256 for state
  size_t length = serializeJson(doc, content, sizeof(content));
  if (length >= sizeof(content)) {
    logError("Telemetry too long for the content[] container: not sent.");
    return true;
  }
  if (mqtt.publish(telemetryTopic, content)) {
    publishCount++;
    logInfo("Published telemetry (%s)", reason);
  } else {
    logError("Failed to publish telemetry.");
  }
  logDebug("Telemetry content: %s", content);
  return true;
}

void sendReading(SensorReading b) {
  unsigned long now = millis();  // noted before publishing: the schedule counts from when the reading arrived
  readingToSend = b;
  hasReading = true;
  uint8_t s = importantState(b);
  if (!stateKnown) {
    stateKnown = true;
  } else if (s != lastState) {
    immediateReason = changeName(s ^ lastState, s, b.water_level);
  } else if (curtainAngle() != lastCurtain) {
    immediateReason = "curtain moved";  // Module 19: the curtain angle is part of state too
  }
  lastState = s;
  lastCurtain = curtainAngle();
  // Readings come about every 2 seconds, never exactly: allow half a read interval of tolerance.
  unsigned long since = now - lastSendTime + READ_INTERVAL / 2;
  if (immediateReason != nullptr && (!hasSent || since >= MIN_IMMEDIATE_GAP)) {
    if (publishTelemetry(immediateReason)) {  // important event: send immediately
      immediateReason = nullptr;
      hasSent = true;
      lastSendTime = now;
    }
  } else if (!hasSent || since >= SEND_INTERVAL) {  // the reading closest to 10 seconds
    if (publishTelemetry("10-second schedule")) {
      hasSent = true;
      lastSendTime = now;
    }
  }
}

void sendNow() {
  if (!hasReading) {
    Serial.println("send: no reading yet, try again 2 seconds later.");
    return;
  }
  if (!publishTelemetry("send command")) {
    Serial.println("send: not possible yet, MQTT isn't connected or the clock isn't set yet.");
    return;
  }
  hasSent = true;
  lastSendTime = millis();
}

// ---------- For the display and the Serial commands ----------
const char* networkText() {
  if (!hasWiFi) {
    return "off";
  }
  if (!connected) {
    return "disconnected";
  }
  if (mqtt.connected()) {
    return "ok, MQTT ok";
  }
  if (brokerRejected) {
    return "ok, MQTT DENIED";  // Module 21: on the display "WiFi ok, MQTT DENIED" = 20 characters (fits the 21-char line)
  }
  return "ok, MQTT down";
}

void printNetworkInfo() {
  if (connected) {
    Serial.printf("wifi: connected to \"%s\", IP %s, signal %d dBm\n", WiFi.SSID().c_str(),
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else if (hasWiFi) {
    Serial.printf("wifi: DISCONNECTED, last reason %u (%s)\n", disconnectReason, reasonName(disconnectReason));
  } else {
    Serial.println("wifi: no saved WiFi yet. Press EN to open the portal.");
  }
  char ts[21] = "not set yet";
  makeTs(ts, sizeof(ts));
  Serial.printf("wifi: device_id %s, name %s, time %s\n", deviceId, DEVICE_NAME, ts);
  Serial.printf("wifi: radio channel %ld, router channel %u (0 = never connected)\n", (long)WiFi.channel(),
                routerChannel);  // Module 14
  if (mqtt.connected()) {
    Serial.printf("mqtt: connected to %s:%u as %s\n", brokerAddress, brokerPort, username);
  } else {
    Serial.printf("mqtt: DISCONNECTED from %s:%u, %s (code %d)\n", brokerAddress, brokerPort, mqttStateName(mqtt.state()),
                  mqtt.state());
  }
  Serial.printf("mqtt: username %s, key %s\n", username,  // Module 21
                brokerKey()[0] != '\0' ? "stored (details: type key)" : "NONE YET");
  Serial.printf("mqtt: broker address %s (%s)\n", brokerAddress,  // Module 28
                USE_WOKWI ? "Wokwi" : (brokerAddressFromNvs() ? "from NVS" : "from config.h"));
  Serial.printf("mqtt: telemetry every %lu seconds and immediately when something important happens, vitals every %lu seconds, "
                "published %lu times\n", SEND_INTERVAL / 1000, vitalsIntervalSeconds(), publishCount);
  unsigned long now = millis();  // Module 19: offline mode
  if (offline) {
    Serial.printf("offline mode: YES, for %lu s; local safety has turned the fan on %u time(s)\n",
                  (now - offlineStartTime) / 1000, localFan);
  } else if (mqttReady()) {
    Serial.println("offline mode: no (broker reachable)");
  } else {
    Serial.printf("offline mode: not yet; broker %s for %lu s (offline mode after %lu s)\n",
                  brokerRejected ? "rejecting the key" : "unreachable", (now - lastReadyTime) / 1000,
                  OFFLINE_MODE_TIMEOUT / 1000);  // Module 21: a rejected key counts too
  }
  if (offlineTest && now - offlineTestTime < OFFLINE_TEST_TIME) {
    Serial.printf("offline mode: offline test running, Node 1 reconnects in %lu s\n",
                  (OFFLINE_TEST_TIME - (now - offlineTestTime)) / 1000);
  }
}

void forgetWiFi() {
  prepareRestart("wifi forget command");  // Module 28: offline-mode + a clean disconnect (and a report if in the middle of the trial)
  Serial.println("Saved WiFi erased. Restarting now; the WiFi portal will open.");
  Serial.flush();
  WiFi.disconnect(true, true);  // true, true = turn off the radio AND erase the saved WiFi from NVS
  delay(500);
  ESP.restart();
}

// ---------- Module 14: used by the Node 2 bridge (bridge.cpp) ----------
bool mqttReady() {
  return connected && mqtt.connected();
}

bool publishTo(const char* topic, const char* content, bool retained) {
  if (!mqttReady()) {
    return false;
  }
  return mqtt.publish(topic, content, retained);
}

// ---------- Module 19: used by the safety rule (rules.cpp) and the Serial commands ----------
bool offlineMode() {
  return offline;
}

void recordLocalFan() {
  if (offline) {
    localFan++;
  }
}

// Rehearses "the Pi's LAN cable pulled out" without touching the Pi (and the only way in Wokwi with a public broker).
// The TCP connection to the broker is closed WITHOUT a goodbye, so the broker publishes the "offline" last will at
// once; then Node 1 doesn't reconnect for OFFLINE_TEST_TIME. A restart ends this test early.
void startOfflineTest() {
  offlineTest = true;
  offlineTestTime = millis();
  netClient.stop();
  Serial.printf("test offline: broker connection cut; offline mode starts in %lu minutes, "
                "reconnecting in %lu minutes.\n", OFFLINE_MODE_TIMEOUT / 60000, OFFLINE_TEST_TIME / 60000);
}

// ---------- Module 21: the broker account ----------
const char* brokerUsername() {
  return username;
}

bool mqttRejected() {
  return brokerRejected;
}

// A new key (or a cleared one): try now, without waiting for the interval. The old connection is closed WITHOUT a goodbye,
// like "test offline", so the broker publishes the "offline" last will first; once the new key is accepted, the status is "online" again.
void changeBrokerKey() {
  brokerRejected = false;
  hasTriedMqtt = false;
  if (mqtt.connected()) {
    netClient.stop();
  }
}

// ---------- Module 28: firmware updates and registration ----------
const char* myDeviceId() {
  return deviceId;
}

bool wifiConnected() {
  return connected;
}

// A new broker address (Serial "broker", "claim", or the portal): used for the next connection, which is tried now.
void changeBrokerAddress() {
  if (USE_WOKWI) {
    logInfo("Wokwi mode: the broker address stays the public broker; the new address is used on the home network.");
    return;
  }
  brokerAddress = storedBrokerAddress();
  mqtt.setServer(brokerAddress, brokerPort);
  changeBrokerKey();  // disconnect (if connected) and try now, without waiting for the interval
}

// Stopping on purpose (contract 1.6 section 3): before installing new firmware or restarting on command, Node 1 publishes
// "offline-mode" (retained, QoS 1), then disconnects with a DISCONNECT message. The broker doesn't publish the "offline" will
// for a connection closed cleanly, so the dashboard writes "stopped on purpose", not "gone".
void stopOnPurpose() {
  held = true;  // from now on: don't reconnect and don't carry out new commands
  if (mqtt.connected()) {
    mqtt.loop();  // take the messages that already arrived (the update command's own ack was already sent inside the callback)
    mqtt.publish(statusTopic, "offline-mode", MQTT_QOS1, true);
    unsigned long start = millis();
    while (millis() - start < 300) {  // give the broker time to take it (and answer PUBACK), without waiting long
      mqtt.loop();
      delay(10);
    }
    // Incoming data not read yet (for example a command that arrived in the last second) is thrown away first. Without this, a
    // connection that still holds incoming data is closed with RST (not FIN), the DISCONNECT can be thrown away too, and the
    // broker publishes the "offline" will although Node 1 stopped on purpose.
    netClient.clear();
    mqtt.disconnect();  // a clean DISCONNECT
    logInfo("Status offline-mode published, broker connection closed cleanly (no offline will).");
  }
  mqttConnected = false;  // so that guardMqtt() doesn't write "MQTT DISCONNECTED"
}

// After a FAILED update (the old firmware keeps running without a restart): reconnect right now. The time spent stopped
// on purpose isn't counted as the offline mode of Module 19.
void resumeConnection() {
  held = false;
  hasTriedMqtt = false;
  brokerRejected = false;
  lastReadyTime = millis();
}
