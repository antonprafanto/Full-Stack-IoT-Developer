// Module 7 - Practice 6: designing the Node 1 status display
// The OLED display shows the readings of Node 1's five sensors. To design it, we use SAMPLE readings that change
// every 3 seconds, including the "worst cases": the longest possible numbers and sensors that fail to read.
// OLED display: SDA to D21, SCL to D22.
// Library: Adafruit SSD1306 2.5.17 (installed with it: Adafruit GFX Library 1.12.6 and Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;             // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;             // D22: I2C clock line (canonical pin map)
const byte DISPLAY_ADDRESS = 0x3C;  // the display's "home address" on the I2C bus

// The sensor data form, exactly the same as Node 1's (Module 6).
struct SensorReading {
  float temperature;  // degrees Celsius; NAN if the DHT22 can't be read
  int humidity;       // percent; -1 if the DHT22 can't be read
  int light;          // 0 (pitch dark) to 4095 (very bright)
  int soil;           // percent: 0 = as dry as in air, 100 = as wet as in water
  bool motion;        // true if the PIR sees motion
  int water_level;    // percent of the tank filled; -1 if the HC-SR04 echo doesn't come back
};

// Four sample readings. Their values are in the same order as the fields of the form above:
// temperature, humidity, light, soil, motion, water_level.
SensorReading samples[4] = {
  {28.5, 71, 3094, 45, false, 80},     // 1. a normal day
  {26.0, 78, 157, 44, true, 79},       // 2. night, someone walks by
  {-40.0, 100, 4095, 100, true, 100},  // 3. longest case: every number as long as possible
  {NAN, -1, 0, 0, false, -1},          // 4. the DHT22 and the HC-SR04 fail to read
};
const char* sampleNames[4] = {"normal day", "night, someone walks by", "longest case", "sensors failed"};
int sampleIndex = 0;

// ---------- Module 7: OLED display ----------
Adafruit_SSD1306 display(128, 64, &Wire, -1);  // width 128, height 64, on the I2C bus, no reset pin
bool displayFound = false;                     // true if the display answers at address 0x3C

// 8 x 8 pixel icons: 1 = pixel on, 0 = pixel off.
const unsigned char ICON_SUN[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char ICON_PLANT[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char ICON_TANK[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char ICON_PERSON[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

// Looks for the display on the I2C bus, then turns it on. Without a display, the program keeps running.
void setupDisplay() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.beginTransmission(DISPLAY_ADDRESS);
  displayFound = Wire.endTransmission() == 0;  // did anything answer at 0x3C?
  if (!displayFound) {
    Serial.println("OLED display not found at 0x3C. Node 1 keeps running without a display.");
    return;
  }
  display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS);
  display.cp437(true);  // the correct CP437 character table, so that code 248 = the degree sign
  display.setTextColor(SSD1306_WHITE);
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Node 1 Home");
  display.println("waiting for data...");
  display.display();
}

// Prints right-aligned text: its last character ends just before x = right.
void printRightAligned(String text, int right, int y, int size) {
  display.setTextSize(size);
  display.setCursor(right - text.length() * 6 * size, y);  // one character = 6 pixels x size
  display.print(text);
}

// Percent bar: a frame "width" pixels wide, filled as far as the percent. A percent below 0 = empty.
void drawBar(int x, int y, int width, int percent) {
  display.drawRect(x, y, width, 8, SSD1306_WHITE);
  if (percent > 0) {
    display.fillRect(x + 2, y + 2, (width - 4) * percent / 100, 4, SSD1306_WHITE);
  }
}

// One display row: icon, name, right-aligned number, then the percent bar.
// The * in "const unsigned char* icon" means this function accepts any icon you pass to it
// (like const char* for text in Module 3). Just leave it as it is.
void barRow(int y, const unsigned char* icon, String name, String number, int percent) {
  display.drawBitmap(0, y, icon, 8, 8, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(11, y);
  display.print(name);
  printRightAligned(number, 82, y, 1);
  drawBar(86, y, 42, percent);
}

void showOnDisplay(SensorReading b) {
  if (!displayFound) {
    return;
  }
  display.clearDisplay();

  // Top row: temperature on the left and humidity on the right. Big numbers, small units.
  String temperatureText = "--.-";
  if (!isnan(b.temperature)) {
    temperatureText = String(b.temperature, 1);
  }
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(temperatureText);
  display.setTextSize(1);
  display.write(248);  // degree sign
  display.print("C");

  String humidityText = "--";
  if (b.humidity >= 0) {
    humidityText = String(b.humidity);
  }
  printRightAligned(humidityText, 122, 0, 2);
  display.setTextSize(1);
  display.setCursor(122, 0);
  display.print("%");

  display.drawFastHLine(0, 17, 128, SSD1306_WHITE);  // divider line

  // Three rows with percent bars. Light (0-4095) is first turned into 0-100 for its bar.
  barRow(21, ICON_SUN, "Light", String(b.light), b.light * 100 / 4095);
  barRow(32, ICON_PLANT, "Soil", String(b.soil) + "%", b.soil);
  String waterText = "--";
  if (b.water_level >= 0) {
    waterText = String(b.water_level) + "%";
  }
  barRow(43, ICON_TANK, "Tank", waterText, b.water_level);

  // Motion row: inverted (white background) when there is motion, so it catches the eye at once.
  if (b.motion) {
    display.fillRect(0, 53, 128, 10, SSD1306_WHITE);
    display.drawBitmap(0, 54, ICON_PERSON, 8, 8, SSD1306_BLACK);
    display.setTextColor(SSD1306_BLACK);
    display.setCursor(11, 54);
    display.print("Motion: DETECTED");
    display.setTextColor(SSD1306_WHITE);
  } else {
    display.drawBitmap(0, 54, ICON_PERSON, 8, 8, SSD1306_WHITE);
    display.setCursor(11, 54);
    display.print("Motion: none");
  }

  display.display();
}
// ---------- End of the display part. Everything from "8 x 8 pixel icons" down to here moves to Node 1 later. ----------

// ---------- Practice 6 test stage: setup() and loop() below do NOT move. ----------
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  setupDisplay();
  delay(1000);
}

void loop() {
  Serial.print("Sample ");
  Serial.print(sampleIndex + 1);
  Serial.print(": ");
  Serial.println(sampleNames[sampleIndex]);
  showOnDisplay(samples[sampleIndex]);

  sampleIndex++;
  if (sampleIndex > 3) {
    sampleIndex = 0;
  }
  delay(3000);
}
