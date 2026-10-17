// Module 10 - Practice 2: get to know your network
// Step 1: the ESP32 looks for all the WiFi networks it can "see".
// Step 2: the ESP32 connects to the WiFi in the secrets.h tab, then prints its network "ID card".
// After that, the signal strength is printed every 2 seconds.

#include <WiFi.h>
#include "secrets.h"  // contains WIFI_NAME and WIFI_PASSWORD

const int PIN_STATUS_LED = 4;
const unsigned long SIGNAL_INTERVAL = 2000;  // print the signal strength every 2 seconds
unsigned long lastSignalTime = 0;

// A short name for the network's type of lock (security).
const char* securityName(wifi_auth_mode_t authMode) {
  if (authMode == WIFI_AUTH_OPEN) {
    return "open";
  }
  if (authMode == WIFI_AUTH_WPA2_PSK) {
    return "WPA2";
  }
  if (authMode == WIFI_AUTH_WPA_WPA2_PSK) {
    return "WPA/WPA2";
  }
  if (authMode == WIFI_AUTH_WPA2_WPA3_PSK) {
    return "WPA2/WPA3";
  }
  if (authMode == WIFI_AUTH_WPA3_PSK) {
    return "WPA3";
  }
  if (authMode == WIFI_AUTH_WPA2_ENTERPRISE) {
    return "Enterprise";
  }
  return "other";
}

// A simple word for the signal strength number (RSSI). The closer to 0, the stronger.
const char* signalQuality(int rssi) {
  if (rssi >= -55) {
    return "very strong";
  }
  if (rssi >= -67) {
    return "strong";
  }
  if (rssi >= -75) {
    return "fair";
  }
  if (rssi >= -85) {
    return "weak";
  }
  return "very weak";
}

// Step 1: the list of visible networks. This scan takes a few seconds.
void listNetworks() {
  Serial.println("Scanning for WiFi networks nearby...");
  int count = WiFi.scanNetworks();
  if (count <= 0) {
    Serial.println("No networks are visible.");
    return;
  }
  Serial.printf("Visible networks: %d\n", count);
  Serial.println(" No  Signal    Chan.  Security    Name (SSID)");
  bool myWiFiSeen = false;
  for (int i = 0; i < count; i++) {
    String name = WiFi.SSID(i);
    const char* marker = "";
    if (name == WIFI_NAME) {
      marker = "   <- your WiFi";
      myWiFiSeen = true;
    }
    Serial.printf("%3d  %4d dBm  %4d   %-10s  %s%s\n", i + 1, WiFi.RSSI(i), WiFi.channel(i),
                  securityName(WiFi.encryptionType(i)), name.c_str(), marker);
  }
  WiFi.scanDelete();  // free the memory used by the scan results
  if (!myWiFiSeen) {
    Serial.printf("\"%s\" is NOT visible. A typo, or is your WiFi 5 GHz only? (see Concept 2)\n", WIFI_NAME);
  }
}

// Step 2: the ESP32's "ID card" on your network.
void printNetworkCard() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char deviceId[13];  // 12 letters + the end-of-text mark
  snprintf(deviceId, sizeof(deviceId), "%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

  Serial.println("---------- Network ID card ----------");
  Serial.printf("WiFi name (SSID) : %s\n", WiFi.SSID().c_str());
  Serial.printf("ESP32 IP address : %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Router (gateway) : %s\n", WiFi.gatewayIP().toString().c_str());
  Serial.printf("Subnet mask      : %s\n", WiFi.subnetMask().toString().c_str());
  Serial.printf("DNS              : %s\n", WiFi.dnsIP().toString().c_str());
  Serial.printf("Device name      : %s\n", WiFi.getHostname());
  Serial.printf("MAC address      : %s\n", WiFi.macAddress().c_str());
  Serial.printf("device_id        : %s\n", deviceId);
  Serial.printf("Channel          : %d\n", WiFi.channel());
  Serial.println("-------------------------------------");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_STATUS_LED, OUTPUT);
  Serial.println();

  WiFi.mode(WIFI_STA);
  listNetworks();

  Serial.printf("Connecting to \"%s\"", WIFI_NAME);
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
  digitalWrite(PIN_STATUS_LED, HIGH);
  printNetworkCard();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    return;  // not connected yet: no signal to report
  }
  if (millis() - lastSignalTime >= SIGNAL_INTERVAL) {
    lastSignalTime = millis();
    int rssi = WiFi.RSSI();
    Serial.printf("Signal: %d dBm (%s)\n", rssi, signalQuality(rssi));
  }
}
