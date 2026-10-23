// settings.cpp - the code of the settings module. Its functions are listed in settings.h.
#include <Arduino.h>
#include <Preferences.h>  // comes with the esp32 package, nothing to install
#include "config.h"
#include "logger.h"
#include "settings.h"

static Preferences archive;  // the NVS "filing cabinet"; we use the folder named "node1"
static int threshold = DEFAULT_SOIL_WATERING_THRESHOLD;
static unsigned long bootNumber = 0;
static bool useRS485 = false;  // Module 15: not in use by default (no sensor connected yet)
static float tempFanOn = DEFAULT_TEMP_FAN_ON;  // Module 19: the safety fan threshold, in °C
static char key[65] = "";  // Module 21: the broker key, at most 64 characters + the end-of-text mark; "" = none yet

void loadSettings() {
  archive.begin("node1", false);  // false = the folder is opened for reading AND writing

  bootNumber = archive.getULong("boot_count", 0) + 1;  // 0 if this label has never been written
  archive.putULong("boot_count", bootNumber);

  threshold = archive.getInt("soil_watering", DEFAULT_SOIL_WATERING_THRESHOLD);
  const char* source = "default value";
  if (thresholdFromNvs()) {
    source = "from NVS";
  }
  logInfo("Boot #%lu. soil_watering threshold: %d %% (%s)", bootNumber, threshold, source);
  useRS485 = archive.getBool("rs485", false);  // label never written = not in use
  tempFanOn = archive.getFloat("temp_fan_on", DEFAULT_TEMP_FAN_ON);  // Module 19
  source = "default value";
  if (tempFanThresholdFromNvs()) {
    source = "from NVS";
  }
  logInfo("temp_fan_on threshold: %.1f C (%s)", tempFanOn, source);
  if (archive.isKey("broker_key")) {  // Module 21; isKey first so a label that doesn't exist yet isn't treated as an error
    archive.getString("broker_key", key, sizeof(key));
  }
  logInfo("Broker key: %s", key[0] != '\0' ? "stored in NVS" : "NONE YET (type: key <value>)");
}

int soilWateringThreshold() {
  return threshold;
}

bool thresholdFromNvs() {
  return archive.isKey("soil_watering");
}

bool saveSoilWateringThreshold(int percent) {
  if (percent < 0 || percent > 100) {
    return false;
  }
  if (percent == threshold && thresholdFromNvs()) {
    return true;  // same number already: no need to write it again (flash can only be written so many times)
  }
  archive.putInt("soil_watering", percent);
  threshold = percent;
  logInfo("soil_watering threshold saved to NVS: %d %%", threshold);
  return true;
}

void removeSoilWateringThreshold() {
  archive.remove("soil_watering");
  threshold = DEFAULT_SOIL_WATERING_THRESHOLD;
  logInfo("soil_watering threshold deleted from NVS; back to the default value %d %%", threshold);
}

unsigned long bootCount() {
  return bootNumber;
}

bool rs485SensorEnabled() {
  return useRS485;
}

void saveRs485SensorEnabled(bool enabled) {
  if (enabled == useRS485 && archive.isKey("rs485")) {
    return;  // already the same: no need to write it again (flash can only be written so many times)
  }
  archive.putBool("rs485", enabled);
  useRS485 = enabled;
  logInfo("RS-485 sensor %s (saved to NVS)", enabled ? "in use" : "not in use");
}

float tempFanThreshold() {
  return tempFanOn;
}

bool tempFanThresholdFromNvs() {
  return archive.isKey("temp_fan_on");  // 11 characters: still under the 15-character limit
}

bool saveTempFanThreshold(float degrees) {
  if (!(degrees >= TEMP_FAN_MIN && degrees <= TEMP_FAN_MAX)) {  // written this way so that NAN is refused too
    return false;
  }
  if (degrees == tempFanOn && tempFanThresholdFromNvs()) {
    return true;  // same number already: no need to write it again (flash can only be written so many times)
  }
  archive.putFloat("temp_fan_on", degrees);
  tempFanOn = degrees;
  logInfo("temp_fan_on threshold saved to NVS: %.1f C", tempFanOn);
  return true;
}

// ---------- Module 21: the broker key ----------
// Stored in NVS under the label "broker_key" (10 characters), never in the code or in Git, and never printed in full.
const char* brokerKey() {
  return key;
}

// The characters allowed in a key: A-Z, a-z, 0-9, - and _ (the characters of a backend-made key). A space, =, and
// any other character is almost certainly a copy mistake.
static bool isValidKeyChar(char c) {
  return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' || c == '_';
}

bool saveBrokerKey(const char* value) {
  size_t length = strlen(value);
  if (length == 0 || length >= sizeof(key)) {  // 1-64 characters; not necessarily exactly 43 (Wokwi: readwrite)
    return false;
  }
  for (size_t i = 0; i < length; i++) {
    if (!isValidKeyChar(value[i])) {
      return false;
    }
  }
  if (strcmp(value, key) != 0) {  // same: no need to write it again (flash can only be written so many times)
    archive.putString("broker_key", value);
    snprintf(key, sizeof(key), "%s", value);
    logInfo("Broker key saved to NVS (%u chars).", (unsigned)length);
  }
  return true;
}

void clearBrokerKey() {
  if (archive.isKey("broker_key")) {
    archive.remove("broker_key");
    logInfo("Broker key deleted from NVS.");
  }
  key[0] = '\0';
}
