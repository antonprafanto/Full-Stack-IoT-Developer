// network.cpp - the code of the network module. Its functions are listed in network.h.
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
#include "network.h"

#ifndef MQTT_QOS1  // only PubSubClient3 has this name
#error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
#endif

const unsigned long NO_ATTEMPT_TIMEOUT = 60000;  // guard: 60 seconds without a connection attempt = tell it to try again
const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later
const unsigned long MIN_IMMEDIATE_GAP = 2000;    // immediate sends at most every 2 seconds
const char WOKWI_BROKER[] = "broker.emqx.io";    // Wokwi can't reach your laptop: use a public broker

static WiFiClient netClient;          // TCP connection to the broker
static PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
static char deviceId[13] = "";  // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
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
static bool stateKnown = false;
static const char* immediateReason = nullptr;  // not nullptr = an important event that isn't sent yet
static bool vitalsSent = false;
static unsigned long lastVitalsTime = 0;
static unsigned long publishCount = 0;
static char lastIds[8][40];  // the last 8 command ids received (including refused ones)
static int idPosition = 0;

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
    case 4: return "username or password rejected";
    case 5: return "not authorized by the broker";
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
// Waiting here is allowed: it is called from setup(), before the watchdog watches loop().
static void openPortal() {
  logInfo("WiFi portal open for %lu seconds: connect your phone to the WiFi \"%s\", then open http://192.168.4.1",
          PORTAL_TIMEOUT, PORTAL_NAME);
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
  bool success = wm.startConfigPortal(PORTAL_NAME);

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
  JsonObject state = reply["state"].to<JsonObject>();
  state["fan"] = fanOn();
  state["lamp"] = lampOn();
  state["pump"] = pumpOn();
  state["curtain"] = curtainAngle();
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

// Called by the library inside mqtt.loop() for every message on msh/<device_id>/cmd.
// The order: read the JSON, check, carry out, answer. A command whose id was already received is ignored.
static void onMqttMessage(char* topic, byte* content, unsigned int length) {
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
  if (alreadyReceived(id)) {
    logInfo("Command %s was already received: ignored.", id);
    return;
  }
  rememberId(id);
  const char* action = command["action"] | "";
  const char* message = "unknown action";
  if (strcmp(action, "set") == 0) {
    message = doSet(command);
  } else if (strcmp(action, "config") == 0) {
    message = "action config not supported yet (Module 19)";
  } else if (strcmp(action, "update") == 0) {
    message = "action update not supported yet (Module 28)";
  }
  if (message == nullptr) {
    logInfo("Command %s: %s %s done.", id, action, command["target"] | "");
  } else {
    logError("Command %s refused: %s", id, message);
  }
  sendAck(id, message == nullptr, message);
}

void setupNetwork() {
  WiFi.onEvent(onWiFiEvent);      // register it BEFORE starting to connect
  WiFi.setHostname(DEVICE_NAME);  // the name in the router's device list (Module 10, Practice 9)
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
  if (USE_WOKWI) {
    mqtt.setServer(WOKWI_BROKER, BROKER_PORT);
  } else {
    mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);  // an IP address, not a name: no name lookup (DNS) needed
  }
  mqtt.setSocketTimeout(1);  // wait at most 1 second for the broker's answer (default: 15 seconds)
  if (!mqtt.setBufferSize(512)) {  // a 512-byte message container (default: 256)
    logError("Not enough memory for a 512-byte MQTT message container.");
  }
  mqtt.setCallback(onMqttMessage);

  if (USE_WOKWI) {
    logInfo("Wokwi mode: connecting to Wokwi-GUEST without the portal, public broker %s.", WOKWI_BROKER);
    WiFi.begin("Wokwi-GUEST", "", 6);  // 6 = the Wokwi-GUEST channel so that it connects faster
    hasWiFi = true;
  } else {
    WiFiManager wm;
    hasWiFi = wm.getWiFiIsSaved();
    if (digitalRead(PIN_BUTTON) == LOW) {  // D13 button held at power-up = asking for the portal
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
}

// Only once, at the first connection: the internet time (Module 10, Practice 5).
static void startServices() {
  configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");
  servicesStarted = true;
}

// The guard (Module 10, Concept 4): if there has been no connection attempt for a very long time, tell the esp32 package to try again.
static void guardConnection() {
  if (connected || !hasWiFi) {
    return;
  }
  unsigned long lastEvent = lastEventTime;  // copy it FIRST: the WiFi worker can change it at any moment
  unsigned long now = millis();             // only then read the clock, so now >= lastEvent
  if (now - lastEvent >= NO_ATTEMPT_TIMEOUT
      && now - lastGuardTime >= NO_ATTEMPT_TIMEOUT) {
    lastGuardTime = now;
    logInfo("WiFi guard: %lu seconds without a new attempt, trying to reconnect.", NO_ATTEMPT_TIMEOUT / 1000);
    WiFi.reconnect();
  }
}

// ---------- Health report: vitals (Appendix A) ----------
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
  char content[128];
  size_t length = serializeJson(doc, content, sizeof(content));
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
  }
}

// One attempt to connect to the broker, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
static void tryConnectBroker() {
  if (hasTriedMqtt && millis() - lastMqttTryTime < MQTT_RETRY_INTERVAL) {
    return;
  }
  hasTriedMqtt = true;
  lastMqttTryTime = millis();
  unsigned long start = millis();
  // Last will: the status topic, QoS 1, retained, content "offline" (Module 11, Concept 7).
  if (mqtt.connect(deviceId, statusTopic, 1, true, "offline")) {
    mqttConnected = true;
    lastFailCode = 0;
    mqtt.publish(statusTopic, "online", true);  // retained: subscribers who come later still see it
    mqtt.subscribe(cmdTopic, 1);                // subscribe again after every connect (clean session)
    logInfo("MQTT connected to broker %s:%u in %lu ms, as %s", USE_WOKWI ? WOKWI_BROKER : BROKER_ADDRESS,
            BROKER_PORT, millis() - start, deviceId);
    vitalsSent = false;  // the first vitals are sent right away
    return;
  }
  int code = mqtt.state();
  if (code != lastFailCode) {  // the same failure isn't logged every 5 seconds
    lastFailCode = code;
    logError("MQTT failed to connect to the broker after %lu ms: %s (code %d). Is the broker on the laptop running?",
             millis() - start, mqttStateName(code), code);
  }
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
    if (!vitalsSent || millis() - lastVitalsTime >= VITALS_INTERVAL) {
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

void updateNetwork() {
  if (disconnectedFlag) {  // a disconnect always comes before the next connect, so it is handled first
    disconnectedFlag = false;
    if (connected) {  // just disconnected; failed retries are not reported one by one
      connected = false;
      disconnectTime = millis();
      logError("WiFi DISCONNECTED (reason %u: %s). Node 1 keeps working; the esp32 package is trying to reconnect.", disconnectReason,
               reasonName(disconnectReason));
    }
  }
  if (gotIpFlag) {
    gotIpFlag = false;
    if (WiFi.status() == WL_CONNECTED) {  // still connected when the flag is lowered?
      connected = true;
      if (disconnectTime == 0) {
        logInfo("WiFi connected to \"%s\": IP %s, signal %d dBm", WiFi.SSID().c_str(),
                WiFi.localIP().toString().c_str(), WiFi.RSSI());
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
}

// ---------- Sending readings: telemetry (Module 11, Practices 3 and 7) ----------
// Important events as a row of bits: motion, dark, dry soil, low tank water.
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
  char content[192];
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
  }
  lastState = s;
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
  const char* broker = USE_WOKWI ? WOKWI_BROKER : BROKER_ADDRESS;
  if (mqtt.connected()) {
    Serial.printf("mqtt: connected to %s:%u as %s\n", broker, BROKER_PORT, deviceId);
  } else {
    Serial.printf("mqtt: DISCONNECTED from %s:%u, %s (code %d)\n", broker, BROKER_PORT, mqttStateName(mqtt.state()),
                  mqtt.state());
  }
  Serial.printf("mqtt: telemetry every %lu seconds and immediately when something important happens, vitals every %lu minutes, "
                "published %lu times\n", SEND_INTERVAL / 1000, VITALS_INTERVAL / 60000, publishCount);
}

void forgetWiFi() {
  Serial.println("Saved WiFi erased. Restarting now; the WiFi portal will open.");
  Serial.flush();
  WiFi.disconnect(true, true);  // true, true = turn off the radio AND erase the saved WiFi from NVS
  delay(500);
  ESP.restart();
}
