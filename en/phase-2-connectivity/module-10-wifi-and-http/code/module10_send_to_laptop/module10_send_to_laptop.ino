// Module 10 - Practice 7: send readings to the laptop (an HTTP POST with JSON)
// Every 10 seconds, the ESP32 sends the temperature and humidity (DHT22, D14) and the light (LDR, VP)
// to webhook-receiver.js (Module 4) running on your laptop.
// The laptop and the ESP32 must be connected to the SAME WiFi.

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>  // the DHT library from Module 6
#include <time.h>
#include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

// REPLACE 192.168.1.10 with your laptop's IP address (how to find it is in Practice 7).
// Plain HTTP (not HTTPS): only for your own server on your home network (Concept 8).
const char RECEIVER_ADDRESS[] = "http://192.168.1.10:3000/telemetry";

const int PIN_DHT = 14;  // DHT22, Module 6
const int PIN_LDR = 36;  // VP: LDR (ADC1), Module 6
const char TIME_ZONE[] = "WIB-7";
const unsigned long SEND_INTERVAL = 10000;  // send every 10 seconds (Node 1 in the ➕ add-on: every 1 minute)

DHT dht(PIN_DHT, DHT22);
unsigned long lastSendTime = 0;
int sendNumber = 0;

// The ts timestamp (Appendix A), as in Practice 5. Returns false if the clock isn't set from the internet yet.
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

void sendReading() {
  char ts[21];
  if (!makeTs(ts, sizeof(ts))) {
    Serial.println("Clock not set from the internet yet: sending postponed (every reading must carry a ts).");
    return;
  }

  // 1. Read the sensors, then build the letter's content (body) with ArduinoJson.
  int humidity = -1;  // -1 = couldn't be read, as in Node 1
  float humidityReading = dht.readHumidity();
  if (!isnan(humidityReading)) {
    humidity = round(humidityReading);
  }
  JsonDocument doc;
  doc["ts"] = ts;
  doc["temperature"] = dht.readTemperature();  // ArduinoJson writes NAN (couldn't be read) as null
  doc["humidity"] = humidity;
  doc["light"] = 4095 - analogRead(PIN_LDR);  // inverted as in Node 1: the brighter it is, the bigger the number
  char content[128];
  serializeJson(doc, content, sizeof(content));  // container -> JSON text

  // 2. Send the POST letter to the laptop.
  HTTPClient http;
  http.setConnectTimeout(2000);  // the laptop is at home: 2 seconds is already very long
  http.setTimeout(2000);
  http.begin(RECEIVER_ADDRESS);
  http.addHeader("Content-Type", "application/json");  // the label on the envelope: "it contains JSON"
  sendNumber++;
  Serial.printf("Send #%d: %s\n", sendNumber, content);
  int code = http.POST(content);

  // 3. Read the reply.
  if (code <= 0) {
    Serial.printf("  -> failed: %s (code %d). Is the receiver running? Is the laptop's IP address right?\n",
                  http.errorToString(code).c_str(), code);
  } else {
    Serial.printf("  -> status code %d, reply: %s\n", code, http.getString().c_str());
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);
  dht.begin();
  Serial.println();
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
  Serial.printf("Connected, ESP32 IP %s. Receiver: %s\n", WiFi.localIP().toString().c_str(), RECEIVER_ADDRESS);
  configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");  // the time from the internet (Practice 5)
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();
    sendReading();
  }
}
