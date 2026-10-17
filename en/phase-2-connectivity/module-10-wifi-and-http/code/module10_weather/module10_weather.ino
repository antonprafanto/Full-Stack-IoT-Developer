// Module 10 - Practice 6: the weather from the internet (HTTPS GET + ArduinoJson)
// Every minute, the ESP32 asks the free Open-Meteo API (as in Module 4) for the current weather,
// then reads its reply, which comes as JSON.
// Weather data: Open-Meteo.com, license CC BY 4.0 - https://open-meteo.com/

#include <WiFi.h>
#include <WiFiClientSecure.h>  // comes with the esp32 package: HTTPS connections (the "sealed envelope")
#include <HTTPClient.h>        // comes with the esp32 package: writes HTTP letters and reads their replies
#include <ArduinoJson.h>       // new library this week: reads and writes JSON
#include "secrets.h"           // contains WIFI_NAME and WIFI_PASSWORD

// The API address is built from several pieces of text; C++ joins them into one.
const char WEATHER_ADDRESS[] =
  "https://api.open-meteo.com/v1/forecast"
  "?latitude=-6.2&longitude=106.85"  // Jakarta. Replace it with your location, as in Module 4
  "&current=temperature_2m,relative_humidity_2m,weather_code"
  "&timezone=auto";
const unsigned long QUERY_INTERVAL = 60000;  // ask every 1 minute (the data itself is updated every 15 minutes)

unsigned long lastQueryTime = 0;
bool hasAsked = false;

// The WMO weather codes that show up most often in Indonesia (the same as weather.js in Module 4).
const char* weatherCondition(int code) {
  switch (code) {
    case 0: return "clear sky";
    case 1: return "mainly clear";
    case 2: return "partly cloudy";
    case 3: return "overcast";
    case 45: return "fog";
    case 51: return "light drizzle";
    case 53: return "drizzle";
    case 55: return "heavy drizzle";
    case 61: return "light rain";
    case 63: return "moderate rain";
    case 65: return "heavy rain";
    case 80: return "light showers";
    case 81: return "showers";
    case 82: return "heavy showers";
    case 95: return "thunderstorm";
    default: return "other weather code";
  }
}

void askWeather() {
  WiFiClientSecure client;
  client.setInsecure();  // TEMPORARY: a sealed envelope, but the server's identity is NOT checked (Concept 8, Module 27)

  HTTPClient http;
  http.setConnectTimeout(5000);  // at most 5 seconds to connect to the server
  http.setTimeout(5000);         // at most 5 seconds waiting for the reply

  Serial.println("Sending GET to api.open-meteo.com ...");
  unsigned long start = millis();
  http.begin(client, WEATHER_ADDRESS);
  int code = http.GET();  // send the request letter, wait for its reply

  if (code <= 0) {  // 0 or a negative number: no reply from the server (the letter didn't arrive, or the reply didn't come)
    Serial.printf("Sending failed: %s (code %d)\n", http.errorToString(code).c_str(), code);
    http.end();
    return;
  }
  Serial.printf("Status code: %d, answered in %lu ms\n", code, millis() - start);
  String content = http.getString();  // the reply's content (body), as JSON text
  http.end();                         // done: close the connection
  if (code != 200) {
    Serial.println("The server refused the request. Its reply:");
    Serial.println(content);
    return;
  }
  Serial.println("Reply body (JSON):");
  Serial.println(content);

  // The JSON "container" of ArduinoJson. The JSON text from the server is poured into it (text -> container).
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, content);
  if (error) {
    Serial.printf("Can't read the JSON: %s\n", error.c_str());
    return;
  }
  const char* timeText = doc["current"]["time"];
  const char* zone = doc["timezone"];
  float temperature = doc["current"]["temperature_2m"];
  int humidity = doc["current"]["relative_humidity_2m"];
  int weatherCode = doc["current"]["weather_code"];

  Serial.printf("Time     : %s (%s)\n", timeText, zone);
  Serial.printf("Temp     : %.1f C\n", temperature);
  Serial.printf("Humidity : %d %%\n", humidity);
  Serial.printf("Condition: %s (code %d)\n", weatherCondition(weatherCode), weatherCode);
  Serial.println("Data source: Open-Meteo.com (CC BY 4.0)");
}

void setup() {
  Serial.begin(115200);
  delay(500);
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
  Serial.printf("Connected, IP %s\n", WiFi.localIP().toString().c_str());
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;  // without WiFi, no letter can be sent
  }
  if (!hasAsked || millis() - lastQueryTime >= QUERY_INTERVAL) {
    hasAsked = true;
    lastQueryTime = millis();
    Serial.println();
    askWeather();
  }
}
