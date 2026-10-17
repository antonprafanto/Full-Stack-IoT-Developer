// network.cpp - the code of the network module. Its functions are listed in network.h.
#include <Arduino.h>
#include <esp_mac.h>  // esp_read_mac(): the MAC address straight from the chip
#include <WiFi.h>
#include <WiFiManager.h>  // WiFiManager library: the WiFi portal (Practice 4)
#include <WebServer.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>  // ArduinoJson library (Practice 6)
#include <time.h>
#include "config.h"
#include "logger.h"
#include "sensors.h"
#include "actuators.h"
#include "display.h"
#include "network.h"

const unsigned long NO_ATTEMPT_TIMEOUT = 60000;  // guard: 60 seconds without a connection attempt = tell it to try again
const int HTTP_TIMEOUT = 1500;                   // milliseconds; connecting + waiting for the reply stays far below 5 seconds

static WebServer server(80);
static char deviceId[13] = "";     // device_id: 12 hexadecimal letters + the end-of-text mark (Appendix A)
static char sendAddress[96] = "";  // SERVER_ADDRESS + "/msh/<device_id>/telemetry"

// ---------- Flags from the WiFi event function (Practice 3) ----------
static volatile bool gotIpFlag = false;
static volatile bool disconnectedFlag = false;
static volatile uint8_t disconnectReason = 0;
static volatile unsigned long lastEventTime = 0;  // millis() at the last WiFi event

static bool hasWiFi = false;  // is there a saved WiFi (or Wokwi-GUEST) to connect to?
static bool connected = false;
static bool servicesStarted = false;  // the internet time and the node1.local name are started only once
static bool clockReported = false;
static unsigned long disconnectTime = 0;
static unsigned long lastGuardTime = 0;

// ---------- Sending to the server on the laptop (Practice 7) ----------
static SensorReading readingToSend;
static bool hasReading = false;
static bool hasSent = false;
static unsigned long lastSendTime = 0;
static int lastSendCode = 0;  // the status code of the last send; 0 = nothing sent yet

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

// ---------- Timestamp (Practice 5) ----------
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

// ---------- Web server: /, /on, and /off (Practice 8) ----------
// A ready-to-paste page; a pretty design waits for Module 22.
static const char PAGE[] = R"(<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1 Home</title>
</head>
<body style="font-family: sans-serif; font-size: 20px; padding: 16px">
<h2>Node 1 Home</h2>
<p>Lamp: <b>%LAMP%</b></p>
<p><a href="/on">Turn the lamp on</a></p>
<p><a href="/off">Turn the lamp off</a></p>
<p>Temperature %TEMPERATURE%&nbsp;&deg;C, humidity %HUMIDITY%&nbsp;%<br>
Light %LIGHT%, soil %SOIL%&nbsp;%<br>
Water tank %WATER%&nbsp;%</p>
<p><small>Firmware %FW%, %TIME%</small></p>
</body>
</html>)";

// The reading's number, or "--" if the reading failed (-1).
static String numberOrDash(int value) {
  if (value < 0) {
    return "--";
  }
  return String(value);
}

static void sendPage() {
  SensorReading b = lastReading();
  String html = PAGE;
  if (lampOn()) {
    html.replace("%LAMP%", "ON");
  } else {
    html.replace("%LAMP%", "OFF");
  }
  String temperatureText = "--";
  if (!isnan(b.temperature)) {
    temperatureText = String(b.temperature, 1);
  }
  html.replace("%TEMPERATURE%", temperatureText);
  html.replace("%HUMIDITY%", numberOrDash(b.humidity));
  html.replace("%LIGHT%", String(b.light));
  html.replace("%SOIL%", String(b.soil));
  html.replace("%WATER%", numberOrDash(b.water_level));
  html.replace("%FW%", FIRMWARE_VERSION);

  char clockText[24] = "clock not set yet";
  time_t now = time(nullptr);
  struct tm local;
  localtime_r(&now, &local);
  if (local.tm_year + 1900 >= 2025) {
    strftime(clockText, sizeof(clockText), "%d-%m-%Y %H:%M %Z", &local);  // for example 17-10-2026 08:30 WIB
  }
  html.replace("%TIME%", clockText);
  server.send(200, "text/html", html);
}

static void handleRoot() {
  sendPage();
}

static void handleOn() {
  setLamp(true);
  logInfo("Browser %s: lamp on", server.client().remoteIP().toString().c_str());
  sendPage();
}

static void handleOff() {
  setLamp(false);
  logInfo("Browser %s: lamp off", server.client().remoteIP().toString().c_str());
  sendPage();
}

static void handleNotFound() {
  server.send(404, "text/plain", "404: this page doesn't exist. Try /, /on, or /off");
}

static void setupWebServer() {
  server.on("/", handleRoot);
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.onNotFound(handleNotFound);
  server.begin();
}

// ---------- WiFi portal (Practice 4) ----------
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

void setupNetwork() {
  WiFi.onEvent(onWiFiEvent);      // register it BEFORE starting to connect
  WiFi.setHostname(DEVICE_NAME);  // the name in the router's device list (Practice 9)
  WiFi.mode(WIFI_STA);            // required before asking "is there a saved WiFi?"

  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);  // WiFi.macAddress() still says 00:00:... while the WiFi hasn't finished starting
  snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  snprintf(sendAddress, sizeof(sendAddress), "%s/msh/%s/telemetry", SERVER_ADDRESS, deviceId);
  logInfo("device_id %s", deviceId);

  if (USE_WOKWI) {
    logInfo("Wokwi mode: connecting to Wokwi-GUEST, without the portal.");
    WiFi.begin("Wokwi-GUEST", "", 6);  // 6 = the Wokwi-GUEST channel, so it connects faster
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
  setupWebServer();
}

// Only once, at the first connection: the internet time (Practice 5) and the node1.local name (Practice 9).
static void startServices() {
  configTzTime(TIME_ZONE, "pool.ntp.org", "asia.pool.ntp.org");
  if (MDNS.begin(DEVICE_NAME)) {
    MDNS.addService("http", "tcp", 80);
  }
  servicesStarted = true;
  logInfo("Open on your phone: http://%s/ or http://%s.local/ (often fails on Android phones)",
          WiFi.localIP().toString().c_str(), DEVICE_NAME);
}

// The guard (Concept 4): if there has been no connection attempt for a very long time, tell the esp32 package to try again.
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
  server.handleClient();  // serve a browser that knocks, then return right away
}

// ---------- Send the reading to the server (Practice 7) ----------
// Returns false if no send was attempted because the WiFi isn't connected yet or the clock isn't set yet.
static bool sendToServer() {
  char ts[21];
  if (!connected || !makeTs(ts, sizeof(ts))) {
    return false;  // every piece of data must carry ts (Appendix A): wait until the clock is set
  }
  JsonDocument doc;
  doc["ts"] = ts;
  doc["fw"] = FIRMWARE_VERSION;
  doc["temperature"] = readingToSend.temperature;  // ArduinoJson writes NAN as null
  doc["humidity"] = readingToSend.humidity;
  doc["light"] = readingToSend.light;
  doc["soil"] = readingToSend.soil;
  doc["motion"] = readingToSend.motion;
  doc["water_level"] = readingToSend.water_level;
  char content[192];
  serializeJson(doc, content, sizeof(content));

  HTTPClient http;
  http.setConnectTimeout(HTTP_TIMEOUT);
  http.setTimeout(HTTP_TIMEOUT);
  http.begin(sendAddress);
  http.addHeader("Content-Type", "application/json");
  unsigned long start = millis();
  int code = http.POST(content);
  http.end();
  lastSendCode = code;
  if (code == 200) {
    logInfo("Sent to the server (code 200, %lu ms)", millis() - start);
  } else if (code > 0) {
    logError("The server answered with code %d. Is the address right? %s", code, sendAddress);
  } else {
    logError("Sending failed: %s (code %d). Is the receiver on the laptop running?", HTTPClient::errorToString(code).c_str(), code);
  }
  logDebug("Sent content: %s", content);
  return true;
}

void sendReading(SensorReading b) {
  readingToSend = b;
  hasReading = true;
  if (hasSent && millis() - lastSendTime < SEND_INTERVAL) {
    return;  // not time yet
  }
  if (sendToServer()) {
    hasSent = true;
    lastSendTime = millis();
  }
}

void sendNow() {
  if (!hasReading) {
    Serial.println("send: no reading yet, try again 2 seconds later.");
    return;
  }
  if (!sendToServer()) {
    Serial.println("send: not possible yet, the WiFi isn't connected or the clock isn't set yet.");
    return;
  }
  hasSent = true;
  lastSendTime = millis();
}

// ---------- For the display and the Serial commands ----------
const char* networkText() {
  static char text[16];  // the longest IP address "255.255.255.255" = 15 letters
  if (connected) {
    snprintf(text, sizeof(text), "%s", WiFi.localIP().toString().c_str());
    return text;
  }
  if (hasWiFi) {
    return "disconnected";
  }
  return "off";
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
  Serial.printf("wifi: sending to %s every %lu seconds, last code %d\n", sendAddress, SEND_INTERVAL / 1000,
                lastSendCode);
}

void forgetWiFi() {
  Serial.println("Saved WiFi erased. Restarting now; the WiFi portal will open.");
  Serial.flush();
  WiFi.disconnect(true, true);  // true, true = turn off the radio AND erase the saved WiFi from NVS
  delay(500);
  ESP.restart();
}
