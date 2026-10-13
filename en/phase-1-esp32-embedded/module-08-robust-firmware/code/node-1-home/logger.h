// logger.h - leveled log messages to the Serial Monitor: DEBUG, INFO, ERROR (Module 8)
// Use it like Serial.printf(), for example: logInfo("pump running for %d seconds", seconds);
#pragma once

enum LogLevel { LEVEL_DEBUG, LEVEL_INFO, LEVEL_ERROR };

void setLogLevel(LogLevel level);          // messages below this level are not printed
LogLevel logLevel();                       // the level in effect now
const char* logLevelName(LogLevel level);  // "DEBUG", "INFO", or "ERROR"

void logDebug(const char* format, ...);  // details for bug hunting
void logInfo(const char* format, ...);   // important everyday events
void logError(const char* format, ...);  // something is wrong and needs attention
