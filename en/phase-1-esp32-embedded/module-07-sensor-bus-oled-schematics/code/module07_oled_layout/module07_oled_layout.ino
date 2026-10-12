// Module 7 - Practice 2: the OLED display toolbox
// Three "pages" take turns every 3 seconds: text sizes, coordinates, then icons and a big number.
// OLED display: SDA to D21, SCL to D22.
// Library: Adafruit SSD1306 2.5.17 (installed with it: Adafruit GFX Library 1.12.6 and Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int PIN_SDA = 21;             // D21: I2C data line (canonical pin map)
const int PIN_SCL = 22;             // D22: I2C clock line (canonical pin map)
const byte DISPLAY_ADDRESS = 0x3C;  // the display's "home address" on the I2C bus

Adafruit_SSD1306 display(128, 64, &Wire, -1);

// 8 x 8 pixel icons. Each binary number is one row: 1 = pixel on, 0 = pixel off.
const unsigned char ICON_THERMOMETER[] = {
  0b00011000,
  0b00100100,
  0b00100100,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b00111100,
};
const unsigned char ICON_DROP[] = {
  0b00011000,
  0b00011000,
  0b00111100,
  0b00111100,
  0b01111110,
  0b01111110,
  0b01111110,
  0b00111100,
};
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

int page = 1;            // the page being shown: 1, 2, or 3
int samplePercent = 45;  // sample number for the percent bar; goes up by 10 every time page 3 is shown

// Page 1: three text sizes. One size-1 character = 6 x 8 pixels (including the gap between characters).
void textSizePage() {
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("Size 1: small");
  display.setTextSize(2);
  display.setCursor(0, 16);  // start below the yellow band of a two-color display
  display.print("Size 2");
  display.setTextSize(3);
  display.setCursor(0, 40);  // 40 + 24 = 64: right down to the bottom row
  display.print("Size 3");
}

// Page 2: coordinates. x grows to the right, y grows DOWNWARD.
void coordinatePage() {
  display.drawRect(0, 0, 128, 64, SSD1306_WHITE);   // frame around the edge of the display
  display.setTextSize(1);
  display.setCursor(3, 3);
  display.print("(0,0)");
  display.setCursor(44, 3);
  display.print("x");
  display.write(26);                                 // right arrow (code 26 in the character table)
  display.setCursor(3, 28);
  display.print("y");
  display.write(25);                                 // down arrow (code 25)
  display.drawLine(60, 32, 68, 32, SSD1306_WHITE);   // + sign in the middle of the display
  display.drawLine(64, 28, 64, 36, SSD1306_WHITE);
  display.setCursor(70, 24);
  display.print("(64,32)");
  display.setCursor(76, 53);
  display.print("(127,63)");
}

// Page 3: icons, a big number with a small unit, a percent bar, and inverted text.
void iconPage() {
  display.drawBitmap(0, 0, ICON_THERMOMETER, 8, 8, SSD1306_WHITE);
  display.drawBitmap(14, 0, ICON_DROP, 8, 8, SSD1306_WHITE);
  display.drawBitmap(28, 0, ICON_SUN, 8, 8, SSD1306_WHITE);
  display.drawBitmap(42, 0, ICON_PLANT, 8, 8, SSD1306_WHITE);
  display.drawBitmap(56, 0, ICON_TANK, 8, 8, SSD1306_WHITE);
  display.drawBitmap(70, 0, ICON_PERSON, 8, 8, SSD1306_WHITE);

  display.setTextSize(3);         // big number: one character is 18 x 24 pixels
  display.setCursor(0, 16);
  display.print("28.5");
  display.setTextSize(1);         // small unit at the top right of the number
  display.setCursor(74, 16);
  display.write(248);             // degree sign (code 248 in the character table)
  display.print("C");

  display.fillRect(88, 30, 40, 11, SSD1306_WHITE);      // white box...
  display.setTextColor(SSD1306_BLACK);                  // ...with black text on it = inverted text
  display.setCursor(91, 32);
  display.print("MOTION");
  display.setTextColor(SSD1306_WHITE);                  // back to white text

  display.setCursor(0, 46);
  display.print("Soil ");
  display.print(samplePercent);
  display.print("%");
  display.drawRect(0, 56, 128, 8, SSD1306_WHITE);               // bar frame
  display.fillRect(2, 58, 124 * samplePercent / 100, 4, SSD1306_WHITE);  // fill the bar to match the percent

  samplePercent = samplePercent + 10;
  if (samplePercent > 100) {
    samplePercent = 0;
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA, PIN_SCL);
  display.begin(SSD1306_SWITCHCAPVCC, DISPLAY_ADDRESS);
  display.cp437(true);  // use the correct CP437 character table, so that code 248 = the degree sign
  display.setTextColor(SSD1306_WHITE);
  Serial.println("Display toolbox ready. The page changes every 3 seconds.");
}

void loop() {
  display.clearDisplay();
  if (page == 1) {
    textSizePage();
  } else if (page == 2) {
    coordinatePage();
  } else {
    iconPage();
  }
  display.display();
  Serial.print("Page ");
  Serial.println(page);

  page++;
  if (page > 3) {
    page = 1;
  }
  delay(3000);
}
