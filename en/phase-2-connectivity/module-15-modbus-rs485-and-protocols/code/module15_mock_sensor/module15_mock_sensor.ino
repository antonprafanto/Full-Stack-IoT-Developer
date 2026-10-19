// Module 15 - Practice 2, the SECOND board: a mock "RS-485 soil sensor" (Modbus RTU server).
// This board answers Modbus requests from Node 1 through the MAX485 module, just like an industrial soil sensor.
// Its datasheet is in the Module 15 README (Practice 2): server address 1, 9600 baud 8N1, registers 0-3.
// Its readings can be changed from this board's Serial Monitor: moisture 62.5, temperature -5.0, ec 800, info.
// Library: ModbusRTUSlave version 3.1.2 (installed with it: ModbusADU version 1.0.2, ModbusRTUComm version 1.3.2,
// and ModbusSlaveLogic version 1.0.1). esp32 package 3.3.12.

#include <ModbusRTUSlave.h>

const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
const int PIN_LED = 2;          // the board's blue LED: blinks every time this board answers
const unsigned long RS485_BAUD = 9600;
const uint8_t DEFAULT_ADDRESS = 1;

ModbusRTUSlave server(Serial2, PIN_RS485_DE_RE);  // the library itself raises DE/RE when it answers

// Modbus "registers". Registers 0-2 hold the readings and are in two cabinets: holding registers (function 03)
// and input registers (function 04). Holding register 3 holds the server address and may be written (function 06).
uint16_t holdingRegisters[4];
uint16_t inputRegisters[3];

// The "true" readings of this mock sensor, already multiplied by 10 as in its datasheet.
int moisture10 = 585;     // 58.5 %
int temperature10 = 253;  // 25.3 °C (may be negative)
int ec = 1200;            // µS/cm, no multiplier
uint8_t address = DEFAULT_ADDRESS;

unsigned long replyCount = 0;
unsigned long ledOnTime = 0;
char line[41];  // a command from the Serial Monitor, at most 40 letters
int lineLength = 0;

// Copies the true readings into the registers. A negative temperature is two's complement: -5.0 °C = -50 = 0xFFCE.
void fillRegisters() {
  holdingRegisters[0] = inputRegisters[0] = (uint16_t)moisture10;
  holdingRegisters[1] = inputRegisters[1] = (uint16_t)temperature10;
  holdingRegisters[2] = inputRegisters[2] = (uint16_t)ec;
  holdingRegisters[3] = address;
}

// Called after every request: registers 0-2 are read-only, register 3 may hold a new address 1-247.
void checkWrites() {
  uint16_t expected[3] = {(uint16_t)moisture10, (uint16_t)temperature10, (uint16_t)ec};
  for (int i = 0; i < 3; i++) {
    if (holdingRegisters[i] != expected[i]) {
      Serial.printf("Someone wrote register %d: ignored, registers 0-2 are read-only.\n", i);
    }
  }
  if (holdingRegisters[3] != address) {
    if (holdingRegisters[3] >= 1 && holdingRegisters[3] <= 247) {
      address = holdingRegisters[3];
      server.begin(address, RS485_BAUD);  // from now on only the new address is answered
      Serial.printf("Server address changed to %u (back to %u after a restart).\n", address, DEFAULT_ADDRESS);
    } else {
      Serial.printf("Address %u refused: must be 1 to 247.\n", holdingRegisters[3]);
    }
  }
  fillRegisters();
}

void printInfo() {
  Serial.printf("info: address %u, moisture %.1f %%, temperature %.1f C, ec %d uS/cm, answered %lu requests\n",
                address, moisture10 / 10.0, temperature10 / 10.0, ec, replyCount);
}

// Turns text into a number. Returns false if the text is not a number (for example "abc").
bool readNumber(const char* text, float& result) {
  char* end;
  result = strtof(text, &end);
  return end != text && *end == '\0';
}

void runCommand() {
  float number = 0;
  if (strcmp(line, "info") == 0) {
    printInfo();
    return;
  }
  if (strncmp(line, "moisture ", 9) == 0) {
    if (!readNumber(line + 9, number) || number < 0 || number > 100) {
      Serial.println("Need a number 0 to 100. Example: moisture 62.5");
      return;
    }
    moisture10 = lroundf(number * 10);
  } else if (strncmp(line, "temperature ", 12) == 0) {
    if (!readNumber(line + 12, number) || number < -40 || number > 80) {
      Serial.println("Need a number -40 to 80. Example: temperature -5.0");
      return;
    }
    temperature10 = lroundf(number * 10);
  } else if (strncmp(line, "ec ", 3) == 0) {
    if (!readNumber(line + 3, number) || number < 0 || number > 20000) {
      Serial.println("Need a number 0 to 20000. Example: ec 800");
      return;
    }
    ec = lroundf(number);
  } else {
    Serial.println("Unknown command. Examples: moisture 62.5 | temperature -5.0 | ec 800 | info");
    return;
  }
  fillRegisters();  // the new readings go into the registers right away
  printInfo();
}

// Collects letters from the Serial Monitor without waiting; a complete line is carried out right away.
void checkSerial() {
  while (Serial.available() > 0) {
    char letter = Serial.read();
    if (letter == '\n') {
      line[lineLength] = '\0';
      lineLength = 0;
      runCommand();
    } else if (letter != '\r' && lineLength < 40) {
      line[lineLength] = letter;
      lineLength++;
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_LED, OUTPUT);
  fillRegisters();
  server.configureHoldingRegisters(holdingRegisters, 4);
  server.configureInputRegisters(inputRegisters, 3);
  // The order matters: Serial2 is started first (the pins must be written), then server.begin().
  Serial2.begin(RS485_BAUD, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  server.begin(address, RS485_BAUD);
  Serial.println();
  Serial.println("Mock RS-485 soil sensor ready (Modbus RTU, 9600 baud 8N1).");
  Serial.println("Register 0 = moisture x10, 1 = temperature x10, 2 = EC, 3 = server address (writable).");
  printInfo();
}

void loop() {
  if (server.poll()) {  // true = there was a request for this address, now answered
    replyCount++;
    Serial.printf("[%lu] answered a client request\n", replyCount);
    digitalWrite(PIN_LED, HIGH);
    ledOnTime = millis();
    checkWrites();
  }
  if (digitalRead(PIN_LED) == HIGH && millis() - ledOnTime >= 50) {
    digitalWrite(PIN_LED, LOW);  // a short 50 ms blink
  }
  checkSerial();
}
