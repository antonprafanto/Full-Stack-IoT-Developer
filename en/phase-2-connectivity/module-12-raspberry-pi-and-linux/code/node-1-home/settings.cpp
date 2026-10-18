// settings.cpp - the code of the settings module. Its functions are listed in settings.h.
#include <Arduino.h>
#include <Preferences.h>  // comes with the esp32 package, nothing to install
#include "config.h"
#include "logger.h"
#include "settings.h"

static Preferences archive;  // the NVS "filing cabinet"; we use the folder named "node1"
static int threshold = DEFAULT_SOIL_WATERING_THRESHOLD;
static unsigned long bootNumber = 0;

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
