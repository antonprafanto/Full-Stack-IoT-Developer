// Module 14 - Technical deep dive: the Node 2 board as a Bluetooth Low Energy (BLE) device that a phone can read.
// The "Environmental Sensing" service (0x181A) with the "Temperature" characteristic (0x2A6E): the DS18B20 temperature in
// hundredths of a degree Celsius (2712 = 27.12 degrees). Read it with the nRF Connect for Mobile app.
// A SEPARATE sketch, just to try out: BLE and WiFi share one radio, and the program is much bigger.
// After trying it, upload Node 2 v1.0.0 again. Libraries: OneWire 2.3.8, DallasTemperature 4.0.6; BLE comes with the esp32 package.

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_ONE_WIRE = 27;  // Node 2's DS18B20

OneWire oneWire(PIN_ONE_WIRE);
DallasTemperature tempSensors(&oneWire);
BLECharacteristic *temperatureCharacteristic = nullptr;

void setup() {
  Serial.begin(115200);
  delay(1000);
  tempSensors.begin();
  if (!BLEDevice::init("Garden-BLE")) {  // the name that appears in nRF Connect's SCANNER list
    Serial.println("BLE failed to start. Press the EN button to try again.");
    return;
  }
  BLEServer *server = BLEDevice::createServer();
  server->advertiseOnDisconnect(true);  // after the phone disconnects, advertise again
  BLEService *service = server->createService(BLEUUID((uint16_t)0x181A));
  temperatureCharacteristic = service->createCharacteristic(BLEUUID((uint16_t)0x2A6E),
                                                           BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  temperatureCharacteristic->addDescriptor(new BLE2902());  // permission for notifications (must be added by hand in this esp32 package)
  service->start();
  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(BLEUUID((uint16_t)0x181A));
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();
  Serial.println("Advertising as Garden-BLE. Open nRF Connect on your phone, then SCAN.");
}

void loop() {
  delay(2000);
  if (temperatureCharacteristic == nullptr) {
    return;
  }
  tempSensors.requestTemperatures();  // waits until the measurement is done (750 ms at most)
  float temperature = tempSensors.getTempCByIndex(0);
  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("DS18B20 unreadable: check DAT to D27, VCC, and GND.");
    return;
  }
  int16_t value = (int16_t)lroundf(temperature * 100);  // the unit of characteristic 0x2A6E: 0.01 degrees Celsius
  temperatureCharacteristic->setValue((uint8_t *)&value, sizeof(value));
  temperatureCharacteristic->notify();  // a phone that turned notifications on gets the new number right away
  Serial.printf("Temperature %.2f C -> BLE value %d = 0x%04X, sent low byte first: %02X-%02X\n", temperature, value,
                (unsigned int)(uint16_t)value, (unsigned int)(value & 0xFF), (unsigned int)((value >> 8) & 0xFF));
}
