// Module 7 - Quick Win: your first OLED display
// 0.96" OLED display (SSD1306 chip, 128 x 64 pixels) on the I2C bus: SDA to D21, SCL to D22.
// Library: Adafruit SSD1306 2.5.17 (installed with it: Adafruit GFX Library 1.12.6 and Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;              // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;              // D22: I2C clock line (canonical pin map)
const byte DISPLAY_ADDRESS = 0x3C;   // the display's "home address" on the I2C bus

Adafruit_SSD1306 display(128, 64, &Wire, -1);  // width 128, height 64, on the I2C bus, no reset pin

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS);  // SWITCHCAPVCC: the display makes its own high voltage

  display.clearDisplay();               // 1. clear the "drawing paper" in the ESP32's memory
  display.setTextColor(SSD1306_WHITE);  //    white text (= pixels on)
  display.setTextSize(2);               //    text size 2: 16 pixels tall
  display.setCursor(0, 0);              //    start at the top left corner
  display.println("Hello,");            // 2. draw the text
  display.println("Node 1!");
  display.display();                    // 3. send that picture to the display over I2C

  Serial.println("OLED display ready.");
  delay(2000);
}

void loop() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Seconds since start:");
  display.setTextSize(4);   // big number: 32 pixels tall
  display.setCursor(0, 20);
  display.println(millis() / 1000);
  display.display();
  delay(1000);
}
