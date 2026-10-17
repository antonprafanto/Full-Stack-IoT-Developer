// network.h - Node 1 on the home network: WiFi, internet time, sending readings, and the web server (Module 10)
// The principle: the WiFi may drop, Node 1 must not stop. No function here waits for long,
// except the WiFi portal, which is only opened in setup() before the watchdog is watching.
// Module 11 replaces the HTTP sending and the web server with MQTT.
#pragma once
#include <Arduino.h>  // size_t
#include "sensors.h"  // SensorReading

void setupNetwork();                 // call once in setup(), BEFORE the watchdog is set up
void updateNetwork();                // call on every pass of loop()
void sendReading(SensorReading b);   // called for every new reading; actually sends every SEND_INTERVAL
void sendNow();                      // Serial command "send": send the last reading right now
bool makeTs(char* ts, size_t size);  // UTC ISO-8601 timestamp (Appendix A); false if the clock isn't set yet
const char* networkText();           // for the display: the IP address, "disconnected", or "off"
void printNetworkInfo();             // the reply to the Serial command "wifi"
void forgetWiFi();                   // Serial command "wifi forget": erase the saved WiFi, then restart
