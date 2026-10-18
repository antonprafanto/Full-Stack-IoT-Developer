// Module 11 - Practice 7: send immediately when something important happens (report-by-exception)
// Builds on Practice 6. Telemetry is still published every 10 seconds, but also IMMEDIATELY when the PIR (D34)
// starts or stops seeing motion, or when the place turns from bright to dark and back. Immediate sends happen
// at most every 2 seconds so that a flickering PIR doesn't flood the broker (Concept 8).

#include <WiFi.h>
#include <PubSubClient.h>  // PubSubClient3 library version 3.3.2
#include <ArduinoJson.h>   // ArduinoJson library version 7.4.3 (Module 10)
#include <DHT.h>           // the DHT library from Module 6
#include <time.h>
#include <esp_mac.h>       // esp_read_mac(): the MAC address straight from the chip
#include "secrets.h"       // contains WIFI_NAME and WIFI_PASSWORD

#ifndef MQTT_QOS1  // only PubSubClient3 has this name
#error "The old PubSubClient (2.8) is in use. Remove it in the Library Manager, then install PubSubClient3 version 3.3.2."
#endif

// REPLACE 192.168.1.10 with your laptop's IP address (how to find it: Module 10, Practice 7.1).
// Always write an IP address, not a name: looking up a name can hold up the program for a few seconds.
const char BROKER_ADDRESS[] = "192.168.1.10";
const uint16_t BROKER_PORT = 1883;

const int PIN_DHT = 14;  // DHT22, Module 6
const int PIN_LDR = 36;  // VP: LDR (ADC1), Module 6
const int PIN_LAMP_RELAY = 32;    // active-LOW relay (Module 5)
const int PIN_FAN_RELAY = 33;     // active-LOW relay (Module 5)
const int PIN_PIR = 34;           // PIR HC-SR501, Module 6
const int DARK_THRESHOLD = 1000;  // light below this counts as dark (Module 6)
const char TIME_ZONE[] = "WIB-7";
const unsigned long SEND_INTERVAL = 10000;       // telemetry every 10 seconds (Appendix A)
const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later
const unsigned long MIN_IMMEDIATE_GAP = 2000;    // immediate sends at most every 2 seconds

DHT dht(PIN_DHT, DHT22);
WiFiClient netClient;          // TCP connection to the broker
PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
char deviceId[13];             // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
char telemetryTopic[40];       // msh/<device_id>/telemetry
char statusTopic[40];          // msh/<device_id>/status
char cmdTopic[40];             // msh/<device_id>/cmd
char ackTopic[40];             // msh/<device_id>/ack
bool lamp = false;
bool fan = false;
char lastIds[8][40];           // the last 8 command ids received (including refused ones)
int idPosition = 0;
bool motionBefore = false;
bool darkBefore = false;
const char* immediateReason = nullptr;  // not nullptr = an important event that hasn't been sent yet
unsigned long lastCheckTime = 0;
unsigned long lastSendTime = 0;
unsigned long lastTryTime = 0;
bool hasTried = false;

// What the mqtt.state() numbers mean (Concept 10). The numbers 1-5 are the broker's own answer.
const char* mqttStateName(int code) {
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

// The ts timestamp (Appendix A), as in Module 10. Returns false if the clock isn't set from the internet yet.
bool makeTs(char* ts, size_t size) {
  time_t now = time(nullptr);
  struct tm utc;
  gmtime_r(&now, &utc);
  if (utc.tm_year + 1900 < 2025) {
    return false;
  }
  strftime(ts, size, "%Y-%m-%dT%H:%M:%SZ", &utc);
  return true;
}

// Active-LOW relay: LOW = on, HIGH = off (Module 5).
void setLamp(bool isOn) {
  lamp = isOn;
  digitalWrite(PIN_LAMP_RELAY, isOn ? LOW : HIGH);
}

void setFan(bool isOn) {
  fan = isOn;
  digitalWrite(PIN_FAN_RELAY, isOn ? LOW : HIGH);
}

bool alreadyReceived(const char* id) {
  for (int i = 0; i < 8; i++) {
    if (strcmp(lastIds[i], id) == 0) {
      return true;
    }
  }
  return false;
}

void rememberId(const char* id) {
  snprintf(lastIds[idPosition], sizeof(lastIds[idPosition]), "%s", id);
  idPosition = (idPosition + 1) % 8;  // the oldest one is overwritten
}

// The answer to a command: the same id, ok, and the relays' current state. message = the reason if refused.
void sendAck(const char* id, bool ok, const char* message) {
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
  state["lamp"] = lamp;
  state["fan"] = fan;
  char content[200];
  size_t length = serializeJson(reply, content, sizeof(content));
  if (length >= sizeof(content)) {
    Serial.println("Ack too long for the content[] container: not sent.");
    return;
  }
  mqtt.publish(ackTopic, content);
  Serial.printf("Published to %s: %s\n", ackTopic, content);
}

// Called by the library when a message arrives on msh/<device_id>/cmd. The order: read, check, carry out, answer.
void onCommand(char* topic, byte* content, unsigned int length) {
  JsonDocument command;
  DeserializationError error = deserializeJson(command, content, length);  // the content has no end-of-text mark
  if (error) {
    Serial.printf("Command is not valid JSON (%s): ignored.\n", error.c_str());
    return;  // without an id, there is nothing to answer
  }
  const char* id = command["id"] | "";  // "" if the id is missing or not text
  if (id[0] == 0) {
    Serial.println("Command without an id: ignored.");
    return;
  }
  if (strlen(id) >= sizeof(lastIds[0])) {  // at most 39 characters: fits in the id memory and in the ack
    Serial.println("Command with an id longer than 39 characters: ignored.");
    return;
  }
  if (alreadyReceived(id)) {
    Serial.printf("Command %s was already received: ignored.\n", id);
    return;
  }
  rememberId(id);
  const char* action = command["action"] | "";
  const char* target = command["target"] | "";
  const char* message = nullptr;  // stays nullptr if the command was carried out
  if (strcmp(action, "set") != 0) {
    message = "unknown action";
  } else if (strcmp(target, "lamp") != 0 && strcmp(target, "fan") != 0) {
    message = "unknown target";  // this practice sketch only handles the lamp and the fan
  } else if (!command["value"].is<bool>()) {
    message = "value must be true or false";  // the text "false" is not false: refused, not guessed
  } else if (strcmp(target, "lamp") == 0) {
    setLamp(command["value"].as<bool>());
  } else {
    setFan(command["value"].as<bool>());
  }
  Serial.printf("Command %s: action=%s target=%s -> %s\n", id, action, target, message ? message : "done");
  sendAck(id, message == nullptr, message);
}

// One connection attempt, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
void tryConnectBroker() {
  if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
    return;
  }
  hasTried = true;
  lastTryTime = millis();
  unsigned long start = millis();
  // Last will: the status topic, QoS 1, retained, content "offline". The broker keeps it while the ESP32 is connected.
  if (mqtt.connect(deviceId, statusTopic, 1, true, "offline")) {
    Serial.printf("Connected to broker %s in %lu ms, as %s\n", BROKER_ADDRESS, millis() - start, deviceId);
    mqtt.publish(statusTopic, "online", true);  // true = retained: stays posted for subscribers who come later
    Serial.printf("Published to %s: online (retained)\n", statusTopic);
    mqtt.subscribe(cmdTopic, 1);  // subscribe again after every connect (clean session)
    Serial.printf("Subscribed to %s\n", cmdTopic);
  } else {
    int code = mqtt.state();
    Serial.printf("Failed to reach the broker after %lu ms: %s (code %d). Retrying in 5 seconds.\n", millis() - start,
                  mqttStateName(code), code);
  }
}

void sendTelemetry() {
  char ts[21];
  if (!makeTs(ts, sizeof(ts))) {
    Serial.println("Clock not set from the internet yet: sending postponed (every reading must carry a ts).");
    return;
  }
  JsonDocument doc;
  doc["ts"] = ts;
  doc["temperature"] = dht.readTemperature();  // ArduinoJson writes NAN (couldn't be read) as null
  float humidity = dht.readHumidity();
  if (isnan(humidity)) {
    doc["humidity"] = nullptr;  // a failed reading is written as null (data contract, Concept 5)
  } else {
    doc["humidity"] = (int)round(humidity);
  }
  doc["light"] = 4095 - analogRead(PIN_LDR);  // inverted as in Node 1: the brighter it is, the bigger the number
  doc["motion"] = digitalRead(PIN_PIR) == HIGH;
  char content[160];
  size_t length = serializeJson(doc, content, sizeof(content));
  if (length >= sizeof(content)) {
    Serial.println("JSON too long for the content[] container: not sent.");
    return;
  }
  if (mqtt.publish(telemetryTopic, content)) {
    Serial.printf("Published to %s: %s\n", telemetryTopic, content);
  } else {
    Serial.printf("FAILED to publish to %s\n", telemetryTopic);
  }
}

// Every 100 ms: did the motion or the dark/bright state change since the previous check?
void checkEvents() {
  if (millis() - lastCheckTime < 100) {
    return;
  }
  lastCheckTime = millis();
  bool motion = digitalRead(PIN_PIR) == HIGH;
  bool dark = (4095 - analogRead(PIN_LDR)) < DARK_THRESHOLD;
  if (motion != motionBefore) {
    immediateReason = motion ? "motion detected" : "motion stopped";
  }
  if (dark != darkBefore) {
    immediateReason = dark ? "getting dark" : "getting bright";
  }
  motionBefore = motion;
  darkBefore = dark;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  dht.begin();
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  pinMode(PIN_FAN_RELAY, OUTPUT);
  pinMode(PIN_PIR, INPUT);
  setLamp(false);  // relays switched off right away (Module 5)
  setFan(false);
  Serial.println();

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(telemetryTopic, sizeof(telemetryTopic), "msh/%s/telemetry", deviceId);
  snprintf(statusTopic, sizeof(statusTopic), "msh/%s/status", deviceId);
  snprintf(cmdTopic, sizeof(cmdTopic), "msh/%s/cmd", deviceId);
  snprintf(ackTopic, sizeof(ackTopic), "msh/%s/ack", deviceId);

  netClient.setConnectionTimeout(1000);  // TCP connect takes at most 1 second (default: 3 seconds)
  mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
  mqtt.setSocketTimeout(1);   // wait at most 1 second for the broker's answer (default: 15 seconds)
  mqtt.setBufferSize(512);    // a 512-byte message container (default: 256), Concept 9
  mqtt.setCallback(onCommand);

  Serial.printf("Connecting to \"%s\"", WIFI_NAME);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    Serial.print(".");
    delay(250);
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Not connected after 20 seconds. Check the secrets.h tab, then press EN.");
    return;
  }
  Serial.printf("Connected to WiFi, ESP32 IP %s, device_id %s\n", WiFi.localIP().toString().c_str(), deviceId);
  configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");  // the time from the internet (Module 10)
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;  // WiFi down: the esp32 package reconnects by itself (Module 10)
  }
  if (!mqtt.connected()) {
    tryConnectBroker();
    return;
  }
  mqtt.loop();  // must be called as often as possible: keeps the connection alive
  checkEvents();
  if (immediateReason != nullptr && millis() - lastSendTime >= MIN_IMMEDIATE_GAP) {
    Serial.printf("Sending immediately: %s\n", immediateReason);
    immediateReason = nullptr;
    lastSendTime = millis();  // the next 10-second slot is counted from this send
    sendTelemetry();
  } else if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();
    sendTelemetry();
  }
}
