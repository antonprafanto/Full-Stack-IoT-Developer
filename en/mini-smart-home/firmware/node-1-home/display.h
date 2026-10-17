// display.h - Node 1's OLED display: readings page (Module 7), status page (Module 8), and short messages (Module 10)
#pragma once
#include "sensors.h"  // SensorReading

void setupDisplay();                // call once in setup(); without a display, Node 1 keeps running
void showReading(SensorReading b);  // the readings page you designed (Module 7)
void openStatusPage();              // the status page for 10 seconds (long button press)
void updateDisplay();               // call on every pass of loop()
void showMessage(const char* title, const char* line2, const char* line3, const char* line4);  // for example, the WiFi portal instructions
