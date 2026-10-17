// Module 10 - Practice 4: a WiFi portal like at a hotel (WiFiManager)
// No secrets.h: the WiFi name and password are entered on a phone, then the ESP32 saves them in NVS.
// To erase the saved WiFi: hold the D13 button, press and release EN, and let go of D13 after 2 seconds.

#include <WiFi.h>
#include <WiFiManager.h>  // new library this week: WiFiManager by tzapu

const int PIN_STATUS_LED = 4;
const int PIN_BUTTON = 13;
const char PORTAL_NAME[] = "Node1-Practice";  // temporary WiFi name while the portal is open

// Called by WiFiManager right when the portal opens.
void onPortalOpened(WiFiManager* wm) {
  Serial.printf("Portal open. Connect your phone to the WiFi \"%s\", then open http://192.168.4.1\n", PORTAL_NAME);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  Serial.println();

  WiFiManager wm;
  wm.setDebugOutput(false);  // WiFiManager's own log messages are not printed
  wm.setAPCallback(onPortalOpened);
  wm.setConfigPortalTimeout(180);  // the portal closes by itself after 3 minutes without input
  wm.setConnectTimeout(20);        // tries a WiFi network for at most 20 seconds

  if (digitalRead(PIN_BUTTON) == LOW) {  // button held at power-up
    Serial.println("D13 button held: saved WiFi erased.");
    wm.resetSettings();
  }

  Serial.println("Trying the saved WiFi...");
  digitalWrite(PIN_STATUS_LED, HIGH);  // LED on = connecting or the portal is open
  // autoConnect(): use the saved WiFi; if there is none or it fails, open the portal.
  // Waits here until connected, or until the portal times out (allowed: only in setup()).
  bool connected = wm.autoConnect(PORTAL_NAME);
  digitalWrite(PIN_STATUS_LED, LOW);

  if (!connected) {
    Serial.println("Portal closed without WiFi. Press EN to try again.");
    return;
  }
  Serial.printf("Connected to \"%s\", IP %s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
  Serial.println("WiFi name and password saved in NVS. Press EN: this time it connects right away, without the portal.");
}

void loop() {
  // Empty: all the work of this practice is in setup().
}
