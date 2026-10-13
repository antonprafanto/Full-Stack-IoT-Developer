// display.h - Node 1's OLED display: readings page (Module 7) and status page (Module 8)
#pragma once
#include "sensors.h"  // SensorReading

void setupDisplay();                // call once in setup(); without a display, Node 1 keeps running
void showReading(SensorReading b);  // the readings page you designed (Module 7)
void openStatusPage();              // the status page for 10 seconds (long button press)
void updateDisplay();               // call on every pass of loop()
