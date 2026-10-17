// Module 10 - Quick Win: the ESP32 says hello to your home WiFi
// The WiFi name and password are NOT written in this file, but in the secrets.h tab.
// The D4 status LED blinks while connecting, then stays on once connected.

#include <WiFi.h>     // comes with the esp32 package, nothing to install
#include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

const int PIN_STATUS_LED = 4;              // workbench status LED (Module 2)
const unsigned long WAIT_TIMEOUT = 20000;  // give up after 20 seconds

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_STATUS_LED, OUTPUT);
  Serial.println();
  Serial.printf("Connecting to WiFi \"%s\"", WIFI_NAME);

  WiFi.mode(WIFI_STA);  // STA (station) = the ESP32 joins the router's network, like your phone
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);

  // Waiting in setup() is fine for this Quick Win: it happens only once, and no watchdog is watching yet.
  // Concept 4 shows how to connect without ever getting the program stuck.
  bool ledOn = false;
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WAIT_TIMEOUT) {
    ledOn = !ledOn;
    digitalWrite(PIN_STATUS_LED, ledOn);  // blink while waiting
    Serial.print(".");
    delay(250);
  }
  Serial.println();

  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, LOW);
    Serial.println("Not connected after 20 seconds. Check the name and password in the secrets.h tab.");
    return;
  }
  digitalWrite(PIN_STATUS_LED, HIGH);  // steady on = connected
  Serial.printf("Connected in %lu ms!\n", millis() - start);
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());
  Serial.printf("Signal strength : %d dBm\n", WiFi.RSSI());
}

void loop() {
  // Empty: all the Quick Win work is in setup().
}
