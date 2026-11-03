// settings.cpp - the code of the settings module. Its functions are listed in settings.h.
#include <Arduino.h>
#include <Preferences.h>  // comes with the esp32 package, nothing to install
#include "config.h"
#include "logger.h"
#include "ota-check.h"  // Module 28: tidyAddress(), checkServerAddress()
#include "settings.h"

static Preferences archive;  // the NVS "filing cabinet"; we use the folder named "node1"
static int threshold = DEFAULT_SOIL_WATERING_THRESHOLD;
static unsigned long bootNumber = 0;
static bool useRS485 = false;  // Module 15: not in use by default (no sensor connected yet)
static float tempFanOn = DEFAULT_TEMP_FAN_ON;  // Module 19: the safety fan threshold, in °C
static char key[65] = "";  // Module 21: the broker key, at most 64 characters + the end-of-text mark; "" = none yet
static char server[SERVER_ADDRESS_MAX_LENGTH + 1] = "";  // Module 28: the server address; "" = not set yet
static char broker[BROKER_ADDRESS_MAX_LENGTH + 1] = "";  // Module 28: the broker address from NVS; "" = use BROKER_ADDRESS
static unsigned long vitalsInterval = VITALS_INTERVAL / 1000;  // Module 28: seconds between two vitals

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

  // Module 28: the server address (firmware downloads and claims), the broker address, and the vitals interval
  if (archive.isKey("server_address")) {
    archive.getString("server_address", server, sizeof(server));
  } else if (DEFAULT_SERVER_ADDRESS[0] != '\0') {
    tidyAddress(DEFAULT_SERVER_ADDRESS, server, sizeof(server));
    const char* wrong = checkServerAddress(server);
    if (wrong != nullptr) {
      logError("DEFAULT_SERVER_ADDRESS in config.h isn't used: %s", wrong);
      server[0] = '\0';
    }
  }
  logInfo("Server address: %s", server[0] != '\0' ? server : "NOT SET (type: server <address>)");
  if (archive.isKey("broker_address")) {
    archive.getString("broker_address", broker, sizeof(broker));
  }
  logInfo("Broker address: %s (%s)", storedBrokerAddress(), brokerAddressFromNvs() ? "from NVS" : "from config.h");
  vitalsInterval = archive.getUInt("vitals_interval", VITALS_INTERVAL / 1000);  // 15 characters = the NVS limit
  logInfo("Vitals interval: %lu seconds (%s)", vitalsInterval, vitalsIntervalFromNvs() ? "from NVS" : "default");
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

// ---------- Module 28: the server address, the broker address, and the vitals interval ----------
// All three can only be changed through the Wi-Fi portal, the Serial Monitor, or a claim, NOT through MQTT: a wrong address makes
// Node 1 unreachable (data contract 1.6 section 7). Only the vitals interval may be sent by the server (config).
const char* storedServerAddress() {
  return server;
}

bool saveServerAddress(const char* address) {
  if (strlen(address) >= sizeof(server)) {
    return false;
  }
  if (strcmp(address, server) != 0 || !archive.isKey("server_address")) {  // the same: no need to write it again
    archive.putString("server_address", address);  // 14 characters
    snprintf(server, sizeof(server), "%s", address);
    logInfo("Server address saved to NVS: %s", server);
  }
  return true;
}

const char* storedBrokerAddress() {
  if (broker[0] != '\0') {
    return broker;
  }
  return BROKER_ADDRESS;  // NVS holds none yet: the address in config.h (Module 11)
}

bool brokerAddressFromNvs() {
  return broker[0] != '\0';
}

bool saveBrokerAddress(const char* address) {
  if (strlen(address) >= sizeof(broker)) {
    return false;
  }
  if (strcmp(address, broker) != 0) {  // the same: no need to write it again
    archive.putString("broker_address", address);  // 14 characters
    snprintf(broker, sizeof(broker), "%s", address);
    logInfo("Broker address saved to NVS: %s", broker);
  }
  return true;
}

unsigned long vitalsIntervalSeconds() {
  return vitalsInterval;
}

bool vitalsIntervalFromNvs() {
  return archive.isKey("vitals_interval");
}

bool saveVitalsInterval(long seconds) {
  if (seconds < (long)VITALS_INTERVAL_MIN_S || seconds > (long)VITALS_INTERVAL_MAX_S) {
    return false;
  }
  if ((unsigned long)seconds == vitalsInterval && vitalsIntervalFromNvs()) {
    return true;  // the number is already the same: no need to write it again (flash writes are limited)
  }
  archive.putUInt("vitals_interval", (uint32_t)seconds);
  vitalsInterval = (unsigned long)seconds;
  logInfo("Vitals interval saved to NVS: %lu seconds", vitalsInterval);
  return true;
}

// ---------- Module 28: the firmware update records ----------
// One record = one whole struct (for example the update plan) under one NVS label. One putBytes() call writes all of it
// at once, so power lost right while writing doesn't leave a record that is half new, half old.
bool readRecord(const char* label, void* content, size_t size) {
  if (!archive.isKey(label) || archive.getBytesLength(label) != size) {
    return false;  // none yet, or written by other firmware with a different struct shape
  }
  return archive.getBytes(label, content, size) == size;
}

void saveRecord(const char* label, const void* content, size_t size) {
  if (archive.putBytes(label, content, size) != size) {
    logError("Record %s couldn't be written to NVS.", label);
  }
}

void clearRecord(const char* label) {
  if (archive.isKey(label)) {
    archive.remove(label);
  }
}
