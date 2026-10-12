// Module 7 - Practice 1: I2C scanner
// "Knocks on the door" of addresses 1 to 126 one by one, then prints the addresses that answer.
// I2C bus: SDA to D21, SCL to D22. No extra library needed: Wire already comes with the esp32 package.

#include <Wire.h>

const int PIN_SDA = 21;  // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;  // D22: I2C clock line (canonical pin map)

// Guesses the device's name from its address. It only knows the devices in this curriculum.
String guessName(byte address) {
  if (address == 0x3C || address == 0x3D) {
    return "SSD1306 OLED display";
  }
  if (address == 0x76) {
    return "BME280 or BMP280 (SDO pin to GND)";
  }
  if (address == 0x77) {
    return "BME280 or BMP280 (SDO pin to VCC), or BMP180";
  }
  return "another device (check its datasheet)";
}

// Prints the address as a two-digit hexadecimal number, for example 0x3C or 0x08.
void printAddress(byte address) {
  Serial.print("0x");
  if (address < 0x10) {
    Serial.print("0");
  }
  Serial.print(address, HEX);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  delay(500);
  Serial.println();
  Serial.println("I2C scanner ready.");
}

void loop() {
  Serial.println("Scanning addresses 0x01 to 0x7E...");
  int count = 0;
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);      // knock on this address's door
    byte reply = Wire.endTransmission();  // 0 = someone answered "yes, I'm here"
    if (reply == 0) {
      Serial.print("  Device found at ");
      printAddress(address);
      Serial.print(" -> ");
      Serial.println(guessName(address));
      count++;
    }
  }
  if (count == 0) {
    Serial.println("  Nobody answered. Check the SDA, SCL, VCC, and GND wires.");
  } else {
    Serial.print("Done: ");
    Serial.print(count);
    Serial.println(" device(s) found.");
  }
  Serial.println();
  delay(5000);  // scan again every 5 seconds, so the result stays visible even if you open the Serial Monitor late
}
