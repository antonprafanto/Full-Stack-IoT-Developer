// Module 11 - Practice 3: send telemetry over MQTT to the broker on the laptop
// Every 10 seconds, the ESP32 publishes the temperature and humidity (DHT22, D14) and the light (LDR, VP)
// as JSON to the topic msh/<device_id>/telemetry on the Mosquitto broker on your laptop (Practice 1).
// Connecting to the broker NEVER waits long: about 1 second at most, retried every 5 seconds (Concept 10).

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
const char TIME_ZONE[] = "WIB-7";
const unsigned long SEND_INTERVAL = 10000;       // telemetry every 10 seconds (Appendix A)
const unsigned long MQTT_RETRY_INTERVAL = 5000;  // couldn't connect to the broker? try again 5 seconds later

DHT dht(PIN_DHT, DHT22);
WiFiClient netClient;          // TCP connection to the broker
PubSubClient mqtt(netClient);  // MQTT runs on top of that connection
char deviceId[13];             // device_id: 12 hexadecimal digits + the end-of-text mark (Appendix A)
char telemetryTopic[40];       // msh/<device_id>/telemetry
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

// One connection attempt, at most every MQTT_RETRY_INTERVAL. Never loops while waiting.
void tryConnectBroker() {
  if (hasTried && millis() - lastTryTime < MQTT_RETRY_INTERVAL) {
    return;
  }
  hasTried = true;
  lastTryTime = millis();
  unsigned long start = millis();
  if (mqtt.connect(deviceId)) {  // client ID = device_id: unique for every board
    Serial.printf("Connected to broker %s in %lu ms, as %s\n", BROKER_ADDRESS, millis() - start, deviceId);
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

void setup() {
  Serial.begin(115200);
  delay(500);
  dht.begin();
  Serial.println();

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(telemetryTopic, sizeof(telemetryTopic), "msh/%s/telemetry", deviceId);

  netClient.setConnectionTimeout(1000);  // TCP connect takes at most 1 second (default: 3 seconds)
  mqtt.setServer(BROKER_ADDRESS, BROKER_PORT);
  mqtt.setSocketTimeout(1);   // wait at most 1 second for the broker's answer (default: 15 seconds)
  mqtt.setBufferSize(512);    // a 512-byte message container (default: 256), Concept 9

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
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();
    sendTelemetry();
  }
}
