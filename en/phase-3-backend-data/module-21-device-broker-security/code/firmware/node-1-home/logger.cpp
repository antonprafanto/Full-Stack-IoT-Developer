// logger.cpp - the code of the logger module. Its functions are listed in logger.h.
#include <Arduino.h>
#include <stdarg.h>     // va_list: the "three dots" (...) arguments of logDebug, logInfo, and logError
#include <esp_timer.h>  // esp_timer_get_time()
#include "logger.h"

static LogLevel currentLevel = LEVEL_INFO;  // default: DEBUG is hidden

void setLogLevel(LogLevel level) {
  currentLevel = level;
}

LogLevel logLevel() {
  return currentLevel;
}

const char* logLevelName(LogLevel level) {
  if (level == LEVEL_DEBUG) {
    return "DEBUG";
  }
  if (level == LEVEL_INFO) {
    return "INFO";
  }
  return "ERROR";
}

// The heart of the three log functions: filters the level, then prints [hours:minutes:seconds since power-up], the level, and the message.
static void printLog(LogLevel level, const char* format, va_list args) {
  if (level < currentLevel) {
    return;  // too detailed for the level chosen now
  }
  char message[160];
  vsnprintf(message, sizeof(message), format, args);  // like snprintf, but its arguments are passed on from "..."
  unsigned long seconds = esp_timer_get_time() / 1000000;  // seconds since power-up (Concept 3)
  // %02lu = unsigned long number, at least 2 digits (05, not 5); %-5s = text left-aligned, 5 characters wide
  Serial.printf("[%02lu:%02lu:%02lu] %-5s %s\n", seconds / 3600, (seconds / 60) % 60, seconds % 60,
                logLevelName(level), message);
}

void logDebug(const char* format, ...) {
  va_list args;
  va_start(args, format);
  printLog(LEVEL_DEBUG, format, args);
  va_end(args);
}

void logInfo(const char* format, ...) {
  va_list args;
  va_start(args, format);
  printLog(LEVEL_INFO, format, args);
  va_end(args);
}

void logError(const char* format, ...) {
  va_list args;
  va_start(args, format);
  printLog(LEVEL_ERROR, format, args);
  va_end(args);
}
