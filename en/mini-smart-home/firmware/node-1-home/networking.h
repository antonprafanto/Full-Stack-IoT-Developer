// networking.h - Node 1 on the home network: WiFi and internet time (Module 10), then MQTT (Module 11)
// The principle: the WiFi and the broker may drop, Node 1 must not stop. No function here waits
// for long, except the WiFi portal, which is only opened in setup() before the watchdog is watching.
// Every topic and its message content follow the data contract (Syllabus Appendix A, DATA-CONTRACT.md).
#pragma once
#include <Arduino.h>  // size_t
#include "sensors.h"  // SensorReading

void setupNetwork();                 // call once in setup(), BEFORE the watchdog is set up
void updateNetwork();                // call on every pass of loop()
void sendReading(SensorReading b);   // for every new reading: publishes every SEND_INTERVAL, or immediately when it matters
void sendNow();                      // Serial command "send": publish the last reading right now
bool makeTs(char* ts, size_t size);  // UTC ISO-8601 timestamp (Appendix A); false if the clock isn't set yet
const char* networkText();           // for the display: "ok, MQTT ok", "ok, MQTT down", "ok, MQTT DENIED", "disconnected", "off"
void printNetworkInfo();             // the reply to the Serial command "wifi"
void forgetWiFi();                   // Serial command "wifi forget": erase the saved WiFi, then restart
bool mqttReady();                    // Module 14: true when WiFi and MQTT are both connected
bool publishTo(const char* topic, const char* content, bool retained);  // Module 14: publish on behalf of Node 2
bool offlineMode();                  // Module 19: true while the broker is unreachable for more than 2 minutes
void recordLocalFan();               // Module 19: called whenever the safety rule turns the fan on (for the report)
void startOfflineTest();             // Module 19: Serial command "test offline"
const char* brokerUsername();        // Module 21: the broker username (device_id; Wokwi locked: "rw")
bool mqttRejected();                 // Module 21: true if the broker rejected the key on the last attempt
void changeBrokerKey();              // Module 21: a new key or a cleared one: reconnect NOW with that key
const char* myDeviceId();            // Module 28: device_id (12 lowercase hexadecimal digits from the Wi-Fi MAC)
bool wifiConnected();                // Module 28: true if Wi-Fi is connected now (claims and firmware downloads)
void changeBrokerAddress();          // Module 28: a new broker address (portal, Serial, claim): reconnect NOW
void stopOnPurpose();                // Module 28: publish "offline-mode", disconnect CLEANLY, and don't reconnect
void resumeConnection();             // Module 28: after a failed update: may (and soon will) connect again
