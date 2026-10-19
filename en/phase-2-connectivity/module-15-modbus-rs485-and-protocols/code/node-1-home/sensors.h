// sensors.h - Node 1's five sensors (Module 6), read without long waits (Module 8)
#pragma once

// The sensor data form. Its field names match the data contract (Syllabus Appendix A) EXACTLY.
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

void setupSensors();                  // call once in setup()
void updateSensors();                 // call on every pass of loop(): analog samples a little at a time
SensorReading readSensors();          // reads all the sensors now (takes about 70 ms at most)
SensorReading lastReading();          // the last result of readSensors(), without reading again
bool sensorProblem(SensorReading b);  // true if the DHT22 or the HC-SR04 can't be read
