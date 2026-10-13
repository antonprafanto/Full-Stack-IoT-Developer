// display.cpp - the code of the display module. Its functions are listed in display.h.
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"
#include "logger.h"
#include "system.h"
#include "settings.h"
#include "display.h"

const byte DISPLAY_ADDRESS = 0x3C;             // the OLED display's address on the I2C bus
const unsigned long STATUS_PAGE_TIME = 10000;  // the status page shows for 10 seconds, then goes back by itself

static Adafruit_SSD1306 display(128, 64, &Wire, -1);  // width 128, height 64, on the I2C bus, no reset pin
static bool displayFound = false;                     // true if the display answers at address 0x3C
static bool statusPageShown = false;                  // true while the status page is shown
static unsigned long statusOpenedTime = 0;
static unsigned long statusDrawnTime = 0;
static SensorReading displayedReading;                // the last reading, to redraw the readings page
static bool hasReading = false;

// ---------- Module 7: readings page ----------
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
    logError("OLED display not found at 0x3C. Node 1 keeps running without a display.");
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
static void printRightAligned(String text, int right, int y, int size) {
  display.setTextSize(size);
  display.setCursor(right - text.length() * 6 * size, y);  // one character = 6 pixels x size
  display.print(text);
}

// Percent bar: a frame "width" pixels wide, filled as far as the percent. A percent below 0 = empty.
static void drawBar(int x, int y, int width, int percent) {
  display.drawRect(x, y, width, 8, SSD1306_WHITE);
  if (percent > 0) {
    display.fillRect(x + 2, y + 2, (width - 4) * percent / 100, 4, SSD1306_WHITE);
  }
}

// One display row: icon, name, right-aligned number, then the percent bar.
// The * in "const unsigned char* icon" means this function accepts any icon you pass to it
// (like const char* for text in Module 3). Just leave it as it is.
static void barRow(int y, const unsigned char* icon, String name, String number, int percent) {
  display.drawBitmap(0, y, icon, 8, 8, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(11, y);
  display.print(name);
  printRightAligned(number, 82, y, 1);
  drawBar(86, y, 42, percent);
}

// Module 7 reference design. If you use your own design, fill this function with yours.
static void drawReadingsPage(SensorReading b) {
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

// ---------- Module 8: status page ----------
// Its text is built with char[] and snprintf() (Concept 6), without String.
static void drawStatusPage() {
  statusDrawnTime = millis();
  char text[24];  // one display line holds 21 characters; 24 drawers so that even the longest POSSIBLE text fits
  unsigned long seconds = uptimeSeconds();

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("Uptime:");

  // Big uptime clock: hours:minutes:seconds. The hours may go past 24, for example 26:03:04.
  snprintf(text, sizeof(text), "%02lu:%02lu:%02lu", seconds / 3600, (seconds / 60) % 60, seconds % 60);
  display.setTextSize(2);
  display.setCursor(0, 10);
  display.print(text);

  display.setTextSize(1);
  snprintf(text, sizeof(text), "Restart: %s", resetReasonName());
  display.setCursor(0, 29);
  display.print(text);
  snprintf(text, sizeof(text), "Boot #%lu", bootCount());
  display.setCursor(0, 38);
  display.print(text);
  snprintf(text, sizeof(text), "Soil threshold: %d%%", soilWateringThreshold());  // %% = the percent sign
  display.setCursor(0, 47);
  display.print(text);
  snprintf(text, sizeof(text), "v%s  free %luKB", FIRMWARE_VERSION, ESP.getFreeHeap() / 1024);
  display.setCursor(0, 56);
  display.print(text);

  display.display();
}

void showReading(SensorReading b) {
  displayedReading = b;
  hasReading = true;
  if (displayFound && !statusPageShown) {
    drawReadingsPage(b);
  }
}

void openStatusPage() {
  if (!displayFound) {
    logInfo("Long button press, but there is no OLED display.");
    return;
  }
  logInfo("Long button press: status page shown for 10 seconds.");
  statusPageShown = true;
  statusOpenedTime = millis();
  drawStatusPage();
}

void updateDisplay() {
  if (!displayFound || !statusPageShown) {
    return;
  }
  unsigned long now = millis();
  if (now - statusOpenedTime >= STATUS_PAGE_TIME) {
    statusPageShown = false;  // time is up: back to the readings page
    if (hasReading) {
      drawReadingsPage(displayedReading);
    }
    return;
  }
  if (now - statusDrawnTime >= 1000) {
    drawStatusPage();  // redraw every 1 second so the uptime clock ticks
  }
}
