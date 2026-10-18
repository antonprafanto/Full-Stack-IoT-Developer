// card.cpp - the code of the card module. Its functions are listed in card.h.
#include <Arduino.h>
#include <SD.h>
#include "config.h"
#include "logger.h"
#include "system.h"
#include "card.h"

const char LOG_FILE_NAME[] = "/node1.csv";  // file name on the card, always starts with a slash
static bool cardFound = false;              // true if the microSD card was detected at power-up

// If the card is detected at power-up, logging is turned on. Without a card, Node 1 keeps running.
void setupCard() {
  cardFound = SD.begin(PIN_SD_CS);
  if (!cardFound) {
    logInfo("microSD card not detected: CSV logging is off.");
    return;
  }
  if (!SD.exists(LOG_FILE_NAME)) {
    File file = SD.open(LOG_FILE_NAME, FILE_WRITE);
    file.println("uptime_s,temperature,humidity,light,soil,motion,water_level");  // column header line
    file.close();
  }
  logInfo("microSD card ready: readings are logged to node1.csv every 30 seconds.");
}

// One CSV line, built with snprintf() in a char[] (Concept 6). A failed reading = an empty cell.
void logToCard(SensorReading b) {
  if (!cardFound) {
    return;
  }
  char temperature[8] = "";  // stays empty if the reading failed
  if (!isnan(b.temperature)) {
    snprintf(temperature, sizeof(temperature), "%.1f", b.temperature);
  }
  char humidity[12] = "";  // 12 drawers: room for the longest int number (11 characters) + the end mark
  if (b.humidity >= 0) {
    snprintf(humidity, sizeof(humidity), "%d", b.humidity);
  }
  char waterLevel[12] = "";
  if (b.water_level >= 0) {
    snprintf(waterLevel, sizeof(waterLevel), "%d", b.water_level);
  }
  const char* motion = "false";
  if (b.motion) {
    motion = "true";
  }
  char line[64];
  snprintf(line, sizeof(line), "%lu,%s,%s,%d,%d,%s,%s",
           uptimeSeconds(), temperature, humidity, b.light, b.soil, motion, waterLevel);

  File file = SD.open(LOG_FILE_NAME, FILE_APPEND);  // APPEND = add to the end of the file
  if (!file) {
    logError("Could not write to the microSD card (removed?). CSV logging stopped.");
    cardFound = false;
    return;
  }
  file.println(line);
  file.close();  // only after closing is the content really saved on the card
  logDebug("CSV: %s", line);
}
