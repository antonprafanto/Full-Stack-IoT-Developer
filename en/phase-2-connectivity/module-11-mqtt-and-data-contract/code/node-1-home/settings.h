// settings.h - settings that stay even when the power goes out, saved in NVS (Module 8)
#pragma once

void loadSettings();                          // call once in setup(): reads the settings from NVS
int soilWateringThreshold();                  // the "dry soil" threshold in effect now, in percent
bool thresholdFromNvs();                      // true if that threshold comes from NVS, not the default value
bool saveSoilWateringThreshold(int percent);  // returns false if the number is outside 0-100
void removeSoilWateringThreshold();           // back to using DEFAULT_SOIL_WATERING_THRESHOLD in config.h
unsigned long bootCount();                    // how many times Node 1 has booted, restarts included
