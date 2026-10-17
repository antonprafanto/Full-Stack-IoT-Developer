// Module 10 - Practice 8: a lamp switch on your phone (the ESP32 as a web server)
// Open http://<ESP32 IP address>/ in the browser of a phone connected to the SAME WiFi.
// The /on link turns the lamp relay (D32) on, /off turns it off.
// No password: for your home network only, never open it to the internet.

#include <WiFi.h>
#include <WebServer.h>  // comes with the esp32 package: the ESP32 becomes a small web server
#include <ESPmDNS.h>    // comes with the esp32 package: the name node1.local (bonus, Practice 9)
#include "secrets.h"    // contains WIFI_NAME and WIFI_PASSWORD

const int PIN_LAMP_RELAY = 32;  // active-LOW relay (Module 5)
const char DEVICE_NAME[] = "node1";

WebServer server(80);  // 80 = the default HTTP "door" number
bool lamp = false;

// A ready-to-paste page. R"( ... )" = raw text: it may contain double quotes and several lines.
// A pretty design waits for Module 22.
const char PAGE[] = R"(<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Node 1</title>
</head>
<body style="font-family: sans-serif; font-size: 22px; padding: 16px">
<h2>Lamp: %STATE%</h2>
<p><a href="/on">Turn the lamp on</a></p>
<p><a href="/off">Turn the lamp off</a></p>
</body>
</html>)";

void setLamp(bool isOn) {
  lamp = isOn;
  if (isOn) {
    digitalWrite(PIN_LAMP_RELAY, LOW);  // active-LOW relay
  } else {
    digitalWrite(PIN_LAMP_RELAY, HIGH);
  }
}

// Send the page with the latest lamp state.
void sendPage() {
  String html = PAGE;
  if (lamp) {
    html.replace("%STATE%", "ON");
  } else {
    html.replace("%STATE%", "OFF");
  }
  server.send(200, "text/html", html);  // status code 200 = OK
}

// Log who asked for what, for example "GET /on from 192.168.1.42".
void logRequest() {
  Serial.printf("GET %s from %s\n", server.uri().c_str(), server.client().remoteIP().toString().c_str());
}

void handleRoot() {
  logRequest();
  sendPage();
}

void handleOn() {
  logRequest();
  setLamp(true);
  sendPage();
}

void handleOff() {
  logRequest();
  setLamp(false);
  sendPage();
}

void handleNotFound() {
  logRequest();
  server.send(404, "text/plain", "404: this page doesn't exist. Try /, /on, or /off");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LAMP_RELAY, OUTPUT);
  setLamp(false);  // switch off right away: pinMode(OUTPUT) has just made the pin LOW (= relay pulls in)
  Serial.println();

  WiFi.setHostname(DEVICE_NAME);  // the name shown in the router's device list (Practice 9)
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  Serial.printf("Connecting to \"%s\"", WIFI_NAME);
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

  server.on("/", handleRoot);  // "if someone asks for /, run handleRoot()"
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.onNotFound(handleNotFound);
  server.begin();
  Serial.printf("Web server ready. Open on your phone: http://%s/\n", WiFi.localIP().toString().c_str());

  if (MDNS.begin(DEVICE_NAME)) {  // bonus: the .local name (often fails on Android phones)
    MDNS.addService("http", "tcp", 80);
    Serial.printf("Or try: http://%s.local/ (often fails on Android phones)\n", DEVICE_NAME);
  }
}

void loop() {
  server.handleClient();  // serve the requests that came in, then return right away (no waiting)
}
