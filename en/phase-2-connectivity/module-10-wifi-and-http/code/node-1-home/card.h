// card.h - (optional) CSV log on the microSD card (Module 7)
#pragma once
#include "sensors.h"  // SensorReading

void setupCard();                 // call once in setup(); without a card, Node 1 keeps running
void logToCard(SensorReading b);  // adds one CSV line
