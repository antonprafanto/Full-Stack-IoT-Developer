// rules.h - Node 1's local automation rules: automatic watering, automatic lamp (Module 6), and safety fan (Module 19)
#pragma once
#include "sensors.h"  // SensorReading

void runRules(SensorReading b);   // called for every new reading (the ACTING step)
void updateRules();               // call on every pass of loop(): the state moves that depend on time
const char* wateringStateName();  // "STANDBY", "WATERING", or "COOLDOWN"
