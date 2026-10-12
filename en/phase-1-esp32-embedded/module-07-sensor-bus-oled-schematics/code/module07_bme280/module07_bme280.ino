// Module 7 - Practice 3: the BME280 on the I2C bus, compared with the DHT22
// BME280: SDA to D21, SCL to D22 (the same bus as the OLED display). The DHT22 stays on D14.
// Libraries: Adafruit BME280 Library 2.3.0 (installed with it: Adafruit Unified Sensor 1.1.15 and Adafruit BusIO 1.17.4)
//            and DHT sensor library 1.4.7 (from Module 6).

#include <Wire.h>
#include <Adafruit_BME280.h>
#include <DHT.h>

const int PIN_SDA = 21;  // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;  // D22: I2C clock line (canonical pin map)
const int PIN_DHT = 14;  // D14: DHT22 (canonical pin map)

Adafruit_BME280 bme;
DHT dht(PIN_DHT, DHT22);
bool bmeReady = false;  // true if a genuine BME280 was found

// Returns true if a device responds at that address (the I2C scanner's trick).
bool deviceAt(byte address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

void printHex(int value) {
  Serial.print("0x");
  if (value < 0x10) {
    Serial.print("0");
  }
  Serial.print(value, HEX);
}

// Looks for the BME280 at both of its addresses, then checks its "ID card" (the chip ID).
bool setupBme() {
  byte address = 0;
  if (deviceAt(0x76)) {
    address = 0x76;
  } else if (deviceAt(0x77)) {
    address = 0x77;
  }
  if (address == 0) {
    Serial.println("No device at 0x76 or 0x77. Check the four BME280 wires.");
    return false;
  }
  Serial.print("Device found at ");
  printHex(address);
  Serial.println(". Checking its chip ID...");

  if (bme.begin(address)) {
    Serial.println("Chip ID 0x60: a genuine BME280 (temperature, humidity, and pressure).");
    return true;
  }
  int id = bme.sensorID();  // the chip ID that was just read from that device
  Serial.print("Its chip ID is ");
  printHex(id);
  Serial.print(", not 0x60. ");
  if (id == 0x56 || id == 0x57 || id == 0x58) {
    Serial.println("This is a BMP280: temperature and pressure only, NO humidity.");
  } else if (id == 0x55) {
    Serial.println("This is a BMP180: the BME280's older cousin, temperature and pressure only.");
  } else if (id == 0x61) {
    Serial.println("This is a BME680: it has a gas sensor too and needs a different library.");
  } else {
    Serial.println("Unknown chip.");
  }
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Wire.begin(PIN_SDA, PIN_SCL);
  dht.begin();
  bmeReady = setupBme();
  Serial.println("The first reading appears in 2 seconds.");
}

void loop() {
  delay(2000);  // the DHT22 can be read at most once every 2 seconds

  float dhtTemperature = dht.readTemperature();
  float dhtHumidity = dht.readHumidity();

  Serial.print("DHT22 : temperature=");
  if (isnan(dhtTemperature) || isnan(dhtHumidity)) {
    Serial.println("-- (read failed)");
  } else {
    Serial.print(dhtTemperature, 1);
    Serial.print(" C  humidity=");
    Serial.print(dhtHumidity, 0);
    Serial.println(" %");
  }

  if (!bmeReady) {
    Serial.println("BME280: not ready (see the message above)");
    return;
  }
  float bmeTemperature = bme.readTemperature();    // degrees Celsius
  float bmeHumidity = bme.readHumidity();          // percent
  float pressure = bme.readPressure() / 100.0;     // pascals divided by 100 = hPa
  Serial.print("BME280: temperature=");
  Serial.print(bmeTemperature, 1);
  Serial.print(" C  humidity=");
  Serial.print(bmeHumidity, 0);
  Serial.print(" %  pressure=");
  Serial.print(pressure, 1);
  Serial.println(" hPa");

  if (!isnan(dhtTemperature) && !isnan(dhtHumidity)) {
    Serial.print("difference: temperature ");
    Serial.print(fabs(bmeTemperature - dhtTemperature), 1);  // fabs = absolute value, always positive
    Serial.print(" C, humidity ");
    Serial.print(fabs(bmeHumidity - dhtHumidity), 0);
    Serial.println(" %");
  }
  Serial.println();
}
