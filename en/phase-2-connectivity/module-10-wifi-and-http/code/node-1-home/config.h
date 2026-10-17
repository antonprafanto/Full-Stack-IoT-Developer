// config.h - all of Node 1's important numbers in one place (Module 8)
// The pins follow PIN-MAP.md. The calibration numbers are your own Module 6 results.
#pragma once

const char FIRMWARE_VERSION[] = "1.1.0";

// ---------- Node 1 canonical pin map (copied from PIN-MAP.md) ----------
const int PIN_STATUS_LED = 4;      // Module 2
const int PIN_BUTTON = 13;         // Module 5, INPUT_PULLUP
const int PIN_LAMP_RELAY = 32;     // Module 5, active-LOW relay
const int PIN_FAN_RELAY = 33;      // Module 5, active-LOW relay
const int PIN_PUMP = 25;           // Module 5, IRLZ44N MOSFET gate
const int PIN_CURTAIN_SERVO = 26;  // Module 5, SG90 servo
const int PIN_BUZZER = 27;         // Module 5, passive buzzer
const int PIN_DHT = 14;            // Module 6, DHT22
const int PIN_LDR = 36;            // Module 6, VP: LDR (ADC1)
const int PIN_SOIL = 39;           // Module 6, VN: capacitive soil sensor (ADC1)
const int PIN_PIR = 34;            // Module 6, PIR
const int PIN_TRIG = 15;           // Module 6, HC-SR04 TRIG
const int PIN_ECHO = 35;           // Module 6, HC-SR04 ECHO through a voltage divider
const int PIN_SDA = 21;            // Module 7, I2C: OLED display
const int PIN_SCL = 22;            // Module 7, I2C: OLED display
const int PIN_SD_CS = 5;           // Module 7, microSD (optional); SCK = 18, MISO = 19, MOSI = 23
// Reserved for later modules (don't use them for anything else):
// Module 15: RS-485 RX = 16, TX = 17, DE/RE = 2

// ---------- Module 6: your calibration results (Practices 3 and 6) ----------
const int SOIL_DRY = 3000;          // raw soil sensor value in air
const int SOIL_WET = 1300;          // raw soil sensor value in water
const float DISTANCE_EMPTY = 20.0;  // cm: from the sensor to the bottom of the tank
const float DISTANCE_FULL = 5.0;    // cm: from the sensor to the water surface when the tank is full

// ---------- Module 6: automation rules, local version ----------
const int DEFAULT_SOIL_WATERING_THRESHOLD = 30;  // Appendix A: "soil_watering"; used as long as NVS holds no threshold yet
const int MIN_WATER_LEVEL = 20;                  // the pump is refused if the tank is less than 20% full
const int WATERING_SECONDS = 3;                  // how long the pump runs when watering automatically
const int DARK_THRESHOLD = 1000;                 // light below this counts as dark

// ---------- Module 8: schedule (all in milliseconds) ----------
const unsigned long READ_INTERVAL = 2000;            // the sensors are read every 2 seconds
const unsigned long WATERING_COOLDOWN_TIME = 30000;  // after watering, rest 30 seconds
const unsigned long CARD_LOG_INTERVAL = 30000;       // one CSV line every 30 seconds
const unsigned long WATCHDOG_TIMEOUT = 5000;         // loop() stuck for more than 5 seconds = restart

// ---------- Module 10: network ----------
const bool USE_WOKWI = false;                              // true ONLY in Wokwi: connects to Wokwi-GUEST without the portal
const char DEVICE_NAME[] = "node1";                        // the name in the router's device list and the address node1.local
const char PORTAL_NAME[] = "Node1-Home";                   // temporary WiFi name while the portal is open
const unsigned long PORTAL_TIMEOUT = 180;                  // seconds: the portal closes by itself when unused
const char SERVER_ADDRESS[] = "http://192.168.1.10:3000";  // REPLACE with your laptop's IP address (Practice 7)
const unsigned long SEND_INTERVAL = 60000;                 // readings are sent to the server every 1 minute
const char TIME_ZONE[] = "WIB-7";                          // WITA: "WITA-8", WIT: "WIT-9" (Practice 5)
