// settings.h - settings that stay even when the power goes out, saved in NVS (Module 8)
#pragma once
#include <stddef.h>  // size_t

void loadSettings();                          // call once in setup(): reads the settings from NVS
int soilWateringThreshold();                  // the "dry soil" threshold in effect now, in percent
bool thresholdFromNvs();                      // true if that threshold comes from NVS, not the default value
bool saveSoilWateringThreshold(int percent);  // returns false if the number is outside 0-100
void removeSoilWateringThreshold();           // back to using DEFAULT_SOIL_WATERING_THRESHOLD in config.h
unsigned long bootCount();                    // how many times Node 1 has booted, restarts included
bool rs485SensorEnabled();                    // Module 15: true after the "rs485 on" command
void saveRs485SensorEnabled(bool enabled);    // Module 15: "rs485 on" / "rs485 off", saved in NVS
float tempFanThreshold();                     // Module 19: the safety fan turns on above this number (°C)
bool tempFanThresholdFromNvs();               // Module 19: true if it comes from NVS (sent by the server with config)
bool saveTempFanThreshold(float degrees);     // Module 19: returns false if outside TEMP_FAN_MIN-TEMP_FAN_MAX
const char* brokerKey();                      // Module 21: the broker key from NVS; "" if none yet. NEVER print it in full
bool saveBrokerKey(const char* value);        // Module 21: false if it isn't 1-64 characters A-Z, a-z, 0-9, - or _
void clearBrokerKey();                        // Module 21: the "key clear" command
const char* storedServerAddress();            // Module 28: where Node 1 downloads firmware and claims; "" if not set yet
bool saveServerAddress(const char* address);  // Module 28: an address ALREADY tidied and checked (ota-check.h)
const char* storedBrokerAddress();            // Module 28: the broker address from NVS, or BROKER_ADDRESS in config.h
bool brokerAddressFromNvs();                  // Module 28: true if that broker address is from NVS (portal, Serial, or claim)
bool saveBrokerAddress(const char* address);  // Module 28: an IP address ALREADY checked (ota-check.h)
unsigned long vitalsIntervalSeconds();        // Module 28: the time between vitals (seconds), sent by the server in the "intervals" config
bool vitalsIntervalFromNvs();                 // Module 28: true if that interval is from NVS, not the default
bool saveVitalsInterval(long seconds);        // Module 28: false if outside VITALS_INTERVAL_MIN_S-VITALS_INTERVAL_MAX_S
// Module 28: the firmware update records (the plan and the report) are stored whole as a series of bytes (a struct) under one label.
bool readRecord(const char* label, void* content, size_t size);         // false if none yet or its size differs
void saveRecord(const char* label, const void* content, size_t size);
void clearRecord(const char* label);
