// Module 7 - Practice 4: the DS18B20 temperature sensor on the 1-Wire bus
// DS18B20 DATA pin to RX2 (GPIO 16, borrowed for now). A 4.7 kOhm pull-up resistor from DATA to 3.3 V
// (the adapter module usually has one already). The DS18B20 gets 3.3 V, NOT 5 V.
// Libraries: OneWire 2.3.8 and DallasTemperature 4.0.6. Install BOTH: DallasTemperature doesn't offer OneWire.

#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_ONE_WIRE = 16;  // RX2: 1-Wire bus (borrowed for now, see PIN-MAP.md)
const int MAX_SENSORS = 4;    // this sketch keeps track of at most 4 sensors

OneWire oneWire(PIN_ONE_WIRE);               // the 1-Wire "road"
DallasTemperature tempSensors(&oneWire);     // the DS18B20 "translator" that uses that road
DeviceAddress serialNumbers[MAX_SENSORS];    // where each sensor's serial number (8 bytes) is kept
int sensorCount = 0;

// Prints the 8-byte serial number, for example 28-FF-64-1E-0F-6A-D3-3C.
void printSerialNumber(DeviceAddress number) {
  for (int i = 0; i < 8; i++) {
    if (number[i] < 0x10) {
      Serial.print("0");
    }
    Serial.print(number[i], HEX);
    if (i < 7) {
      Serial.print("-");
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  tempSensors.begin();  // walks along the bus and counts the sensors that answer
  sensorCount = tempSensors.getDeviceCount();
  if (sensorCount > MAX_SENSORS) {
    sensorCount = MAX_SENSORS;
  }
  Serial.print("Found ");
  Serial.print(sensorCount);
  Serial.println(" DS18B20 sensor(s).");
  for (int i = 0; i < sensorCount; i++) {
    tempSensors.getAddress(serialNumbers[i], i);
    Serial.print("  Sensor ");
    Serial.print(i + 1);
    Serial.print(": serial number ");
    printSerialNumber(serialNumbers[i]);
    Serial.println();
  }
  if (sensorCount == 0) {
    Serial.println("Check the DATA wire (RX2), VCC (3.3 V), GND, and the 4.7 kOhm resistor, then press EN.");
  }
}

void loop() {
  if (sensorCount == 0) {  // no sensor yet: remind every 5 seconds, in case the message in setup() was missed
    Serial.println("No DS18B20 detected yet. Unplug the USB, check the wires, then plug it back in.");
    delay(5000);
    return;
  }
  tempSensors.requestTemperatures();  // call out to ALL the sensors at once: "measure now!" (up to 750 ms)
  for (int i = 0; i < sensorCount; i++) {
    float temperature = tempSensors.getTempC(serialNumbers[i]);  // ask them one by one, by serial number
    Serial.print("Sensor ");
    Serial.print(i + 1);
    Serial.print(": ");
    if (temperature == DEVICE_DISCONNECTED_C) {  // -127: the library doesn't trust this reading
      Serial.println("unreadable! Is a wire loose, or is the power cutting in and out?");
    } else if (temperature == 85.0) {            // 85: the default value of a sensor that has just powered up (library 4.0.6 usually replaces it with -127)
      Serial.println("85.00 C (suspicious: the sensor just powered up, or its power is too weak)");
    } else {
      Serial.print(temperature, 2);
      Serial.println(" C");
    }
  }
  delay(2000);
}
