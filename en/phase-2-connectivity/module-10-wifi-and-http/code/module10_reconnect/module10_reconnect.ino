// Module 10 - Practice 3: the router unplug test
// The ESP32 connects WITHOUT waiting. If the WiFi drops, the esp32 package itself tries to reconnect;
// this sketch only watches and reports. loop() never stops running:
//   status LED steady on = connected; fast blinking = disconnected, trying again.

#include <WiFi.h>
#include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

const int PIN_STATUS_LED = 4;
const unsigned long REPORT_INTERVAL = 10000;  // a regular report every 10 seconds
const unsigned long BLINK_DELAY = 100;        // fast blinking while the WiFi is down

// "Flags" raised by the event function and lowered by loop(), like the interrupt in Module 8.
// volatile: its value can change "silently" from outside loop().
volatile bool gotIpFlag = false;
volatile bool disconnectedFlag = false;
volatile uint8_t disconnectReason = 0;
volatile unsigned long failedAttempts = 0;  // how many connection attempts have failed

bool connected = false;
bool everConnected = false;
unsigned long disconnectTime = 0;
unsigned long lastReportTime = 0;
unsigned long lastBlinkTime = 0;
bool ledOn = false;
unsigned long longestLoopUs = 0;  // the longest loop() pass since the last report (Module 8)

// Called by the esp32 package on every WiFi event, from another "worker", not from loop().
// The same rules as an interrupt function: as short as possible, just raise a flag.
void onWiFiEvent(arduino_event_id_t event, arduino_event_info_t info) {
  if (event == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
    gotIpFlag = true;
  } else if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
    uint8_t reason = info.wifi_sta_disconnected.reason;
    if (reason == WIFI_REASON_STA_LEAVING) {
      return;  // 36: the esp32 package itself ends the old attempt before trying again; not a new failed attempt
    }
    disconnectReason = reason;
    failedAttempts++;
    disconnectedFlag = true;
  }
}

// The esp32 package's name for a disconnect reason code. Codes 209-212 have no name there yet.
const char* reasonName(uint8_t code) {
  const char* name = WiFi.disconnectReasonName((wifi_err_reason_t)code);
  if (name[0] == '\0') {  // empty text: its first letter is already the end-of-text mark
    return "see the table in Concept 4";
  }
  return name;
}

// The clock since power-up, for example "00:01:23", at the start of every report line.
const char* uptimeClock() {
  static char text[12];
  unsigned long seconds = millis() / 1000;
  snprintf(text, sizeof(text), "%02lu:%02lu:%02lu", seconds / 3600, (seconds / 60) % 60, seconds % 60);
  return text;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_STATUS_LED, OUTPUT);
  Serial.println();

  WiFi.onEvent(onWiFiEvent);  // register the event function BEFORE starting to connect
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
  Serial.printf("[%s] Started connecting to \"%s\" (without waiting)\n", uptimeClock(), WIFI_NAME);
}

void loop() {
  unsigned long loopStart = micros();
  unsigned long now = millis();

  // 1. Lower the flags, then report what changed.
  if (gotIpFlag) {
    gotIpFlag = false;
    connected = true;
    if (!everConnected) {
      Serial.printf("[%s] Connected! IP %s, signal %d dBm\n", uptimeClock(),
                    WiFi.localIP().toString().c_str(), WiFi.RSSI());
    } else {
      Serial.printf("[%s] Connected AGAIN after %lu seconds offline. IP %s\n", uptimeClock(),
                    (now - disconnectTime) / 1000, WiFi.localIP().toString().c_str());
    }
    everConnected = true;
    failedAttempts = 0;
  }
  if (disconnectedFlag) {
    disconnectedFlag = false;
    if (connected) {  // just disconnected; failed retries are not reported one by one
      connected = false;
      disconnectTime = now;
      failedAttempts = 0;  // start counting the failed retries
      Serial.printf("[%s] WiFi DISCONNECTED (reason %u: %s). The esp32 package is trying to reconnect...\n",
                    uptimeClock(), disconnectReason, reasonName(disconnectReason));
    }
  }

  // 2. Status LED: steady on while connected, fast blinking while disconnected.
  if (connected) {
    digitalWrite(PIN_STATUS_LED, HIGH);
  } else if (now - lastBlinkTime >= BLINK_DELAY) {
    lastBlinkTime = now;
    ledOn = !ledOn;
    digitalWrite(PIN_STATUS_LED, ledOn);
  }

  // 3. Regular report: proof that loop() keeps running even when the WiFi is down.
  if (now - lastReportTime >= REPORT_INTERVAL) {
    lastReportTime = now;
    if (connected) {
      Serial.printf("[%s] Report: connected, signal %d dBm, longest loop() pass %lu ms\n",
                    uptimeClock(), WiFi.RSSI(), longestLoopUs / 1000);
    } else if (everConnected) {
      Serial.printf("[%s] Report: DISCONNECTED for %lu seconds, failed attempts: %lu, longest loop() pass %lu ms\n",
                    uptimeClock(), (now - disconnectTime) / 1000, failedAttempts, longestLoopUs / 1000);
    } else {
      Serial.printf("[%s] Report: never connected so far, failed attempts: %lu (last reason %u: %s)\n",
                    uptimeClock(), failedAttempts, disconnectReason, reasonName(disconnectReason));
    }
    longestLoopUs = 0;  // start measuring again for the next report
  }

  unsigned long loopTime = micros() - loopStart;
  if (loopTime > longestLoopUs) {
    longestLoopUs = loopTime;
  }
}
