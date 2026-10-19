// rs485.h - the RS-485 soil sensor, read over Modbus RTU (Module 15)
#pragma once
#include <ArduinoJson.h>

void setupRS485();                         // call once in setup(), after loadSettings()
void updateRS485();                        // call on every pass of loop(): reads the sensor every 10 seconds
void writeRS485Fields(JsonDocument& doc);  // adds soil_rs485, soil_temperature, and ec to telemetry
void useRS485(bool enabled);               // the "rs485 on" / "rs485 off" commands (saved in NVS)
void printRS485Info();                     // the answer to the "rs485" command
