// config.h - all of Node 1's important numbers in one place (Module 8)
// The pins follow PIN-MAP.md. The calibration numbers are your own Module 6 results.
#pragma once

const char FIRMWARE_VERSION[] = "1.5.0";

// ---------- Node 1 canonical pin map (copied from PIN-MAP.md) ----------
const int PIN_STATUS_LED = 2;      // Module 2; moved from D4 to D2 in Module 15 (D4 is now the RS-485 DE/RE)
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
const int PIN_RS485_RX = 16;       // Module 15, RX2 <- RO of the MAX485 module through a 4.7 kΩ + 10 kΩ voltage divider
const int PIN_RS485_TX = 17;       // Module 15, TX2 -> DI of the MAX485 module
const int PIN_RS485_DE_RE = 4;     // Module 15, D4 -> DE and RE of the MAX485 module, joined together

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
const bool USE_WOKWI = false;              // true ONLY in Wokwi: Wokwi-GUEST without the portal, public broker
const char DEVICE_NAME[] = "node1";        // the name in the router's device list
const char PORTAL_NAME[] = "Node1-Home";   // temporary WiFi name while the portal is open
const unsigned long PORTAL_TIMEOUT = 180;  // seconds: the portal closes by itself when unused
const char TIME_ZONE[] = "WIB-7";          // WITA: "WITA-8", WIT: "WIT-9" (Module 10, Practice 5)

// ---------- Module 11: MQTT ----------
const char BROKER_ADDRESS[] = "192.168.1.37";  // REPLACE with your Pi gateway's fixed address (Module 12, Practice 2)
const uint16_t BROKER_PORT = 1883;
const unsigned long SEND_INTERVAL = 10000;     // telemetry every 10 seconds, plus immediately when something important happens
const unsigned long VITALS_INTERVAL = 300000;  // vitals (Node 1's health) every 5 minutes

// ---------- Module 14: ESP-NOW bridge for Node 2 "Garden" ----------
// Node 2's WiFi MAC address, printed by Node 2 when it first powers up. ESP-NOW packets from other addresses are rejected.
const uint8_t MAC_NODE2[6] = {0x24, 0x6F, 0x28, 0xB1, 0xC7, 0xD4};  // REPLACE with your Node 2's MAC
const int NODE2_SHELF_SIZE = 96;  // holding shelf: Node 2 readings kept while the broker is unreachable (8 hours at a 5-minute interval)
const unsigned long NODE2_OFFLINE_MARGIN = 60000;  // Node 2 is "offline" after 3 x its interval + 1 minute

// ---------- Module 15: RS-485 soil sensor (Modbus RTU) ----------
// Whether it is used is set with the Serial command "rs485 on" / "rs485 off" (saved in NVS).
const unsigned long RS485_BAUD = 9600;                 // sensor datasheet: 9600 baud, 8N1
const uint8_t RS485_SENSOR_ADDRESS = 1;                // the sensor's server address (datasheet: default 1)
const unsigned long RS485_READ_INTERVAL = 10000;       // the sensor is read every 10 seconds
const unsigned long RS485_SLOW_READ_INTERVAL = 60000;  // after 3 times without a reply: every 60 seconds

// ---------- Module 19: local safety rule and offline mode ----------
// The fan threshold is sent by the server with the "config" command and saved in NVS (label "temp_fan_on").
const float DEFAULT_TEMP_FAN_ON = 30.0;             // Appendix A: "temp_fan_on"; used while NVS holds no threshold yet
const float TEMP_FAN_MIN = 15.0;                    // a config with temp_fan_on outside 15-45 °C is refused
const float TEMP_FAN_MAX = 45.0;
const float FAN_HYSTERESIS = 2.0;                   // the safety fan turns off below temp_fan_on - 2 °C (hysteresis)
const unsigned long OFFLINE_MODE_TIMEOUT = 120000;  // broker unreachable for 2 minutes without a break = offline mode
const unsigned long OFFLINE_TEST_TIME = 180000;     // "test offline" command: the broker counts as gone for 3 minutes
