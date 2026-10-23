// secrets.h - SECRET: your WiFi name and password, and the test device's key.
// This file is an EXAMPLE. Replace the three texts below with your own.
// In your own repository, Git ignores secrets.h through .gitignore (Module 10, Practice 1),
// so your password and your key are never uploaded to GitHub.
#pragma once

const char WIFI_NAME[] = "YourHomeWiFiName";      // WiFi name (SSID), upper and lower case must match exactly
const char WIFI_PASSWORD[] = "YourWiFiPassword";  // WiFi password
const char INTRUDER_KEY[] = "PasteTheTestDeviceKeyHere";  // the test device c0ba00000001's key, NOT Node 1's key
