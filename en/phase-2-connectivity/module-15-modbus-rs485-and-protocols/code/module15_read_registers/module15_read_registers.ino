// Module 15 - Practice 4, the NODE 1 board: reading the "RS-485 soil sensor" with the ModbusMaster library.
// Every 5 seconds it reads registers 0-2, turns them into the real numbers, and prints how long it took.
// Commands in the Serial Monitor: function 3 | function 4 | server 2 | register 3 | write 3 2
// Library: ModbusMaster version 2.0.1 (Doc Walker). esp32 package 3.3.12.

#include <ModbusMaster.h>

const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
const unsigned long READ_INTERVAL = 5000;

ModbusMaster sensor;
uint8_t serverAddress = 1;  // the address of the sensor being asked (datasheet: default 1)
uint8_t functionCode = 3;   // 3 = read holding registers, 4 = read input registers
unsigned long lastReadTime = 0;
char line[41];
int lineLength = 0;

// Called by ModbusMaster right before it sends a request.
void beforeSend() {
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // press the talk button
}

// Called by ModbusMaster after Serial2.flush(): the last byte of the request has gone out.
void afterSend() {
  digitalWrite(PIN_RS485_DE_RE, LOW);  // release the talk button: listen for the reply
  while (Serial2.available() > 0) {
    Serial2.read();  // throw away any garbage read while this board was talking
  }
}

const char* resultMeaning(uint8_t code) {
  switch (code) {
    case ModbusMaster::ku8MBSuccess: return "success";
    case ModbusMaster::ku8MBIllegalFunction: return "exception 01: function unknown to the server";
    case ModbusMaster::ku8MBIllegalDataAddress: return "exception 02: the requested register does not exist";
    case ModbusMaster::ku8MBIllegalDataValue: return "exception 03: the request content is not valid";
    case ModbusMaster::ku8MBSlaveDeviceFailure: return "exception 04: server failure";
    case ModbusMaster::ku8MBInvalidSlaveID: return "reply server address wrong";
    case ModbusMaster::ku8MBInvalidFunction: return "reply function code wrong";
    case ModbusMaster::ku8MBResponseTimedOut: return "no reply (timeout)";
    case ModbusMaster::ku8MBInvalidCRC: return "reply CRC wrong";
    default: return "another code";
  }
}

// Reads registers 0-2 with the function chosen now, then prints the result.
void readSensor() {
  unsigned long start = millis();
  uint8_t result;
  if (functionCode == 4) {
    result = sensor.readInputRegisters(0, 3);    // from register 0, 3 of them
  } else {
    result = sensor.readHoldingRegisters(0, 3);  // from register 0, 3 of them
  }
  unsigned long elapsed = millis() - start;
  if (result == ModbusMaster::ku8MBSuccess) {
    float moisture = sensor.getResponseBuffer(0) / 10.0;  // datasheet: x10
    float temperature = (int16_t)sensor.getResponseBuffer(1) / 10.0;  // x10 and SIGNED: it can be below zero
    uint16_t ec = sensor.getResponseBuffer(2);            // no multiplier
    Serial.printf("server %u, function %02u: moisture %.1f %%, temperature %.1f C, EC %u uS/cm (%lu ms)\n", serverAddress,
                  functionCode, moisture, temperature, ec, elapsed);
  } else {
    Serial.printf("server %u, function %02u: FAILED, code 0x%02X = %s (%lu ms)\n", serverAddress, functionCode, result,
                  resultMeaning(result), elapsed);
  }
}

// Reads just one register and prints its content as it is.
void readOneRegister(uint16_t number) {
  uint8_t result;
  if (functionCode == 4) {
    result = sensor.readInputRegisters(number, 1);
  } else {
    result = sensor.readHoldingRegisters(number, 1);
  }
  if (result == ModbusMaster::ku8MBSuccess) {
    Serial.printf("register %u (function %02u) holds %u\n", number, functionCode, sensor.getResponseBuffer(0));
  } else {
    Serial.printf("register %u (function %02u): FAILED, code 0x%02X = %s\n", number, functionCode, result, resultMeaning(result));
  }
}

void writeRegister(uint16_t number, uint16_t value) {
  uint8_t result = sensor.writeSingleRegister(number, value);  // function 06
  Serial.printf("write register %u = %u to server %u: %s\n", number, value, serverAddress, resultMeaning(result));
}

void runCommand() {
  unsigned int a = 0;
  unsigned int b = 0;
  if (sscanf(line, "function %u", &a) == 1 && (a == 3 || a == 4)) {
    functionCode = a;
    Serial.printf("From now on using function %02u.\n", functionCode);
  } else if (sscanf(line, "server %u", &a) == 1 && a >= 1 && a <= 247) {
    serverAddress = a;
    sensor.begin(serverAddress, Serial2);  // change the address being asked
    Serial.printf("From now on asking server %u.\n", serverAddress);
  } else if (sscanf(line, "register %u", &a) == 1 && a <= 65535) {
    readOneRegister(a);
  } else if (sscanf(line, "write %u %u", &a, &b) == 2 && a <= 65535 && b <= 65535) {
    writeRegister(a, b);
  } else {
    Serial.println("Commands: function 3 | function 4 | server 2 | register 3 | write 3 2");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // start by listening
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // the pins must be written (esp32 3.x package)
  sensor.begin(serverAddress, Serial2);
  sensor.preTransmission(beforeSend);
  sensor.postTransmission(afterSend);
  Serial.println();
  Serial.println("Reading the RS-485 soil sensor every 5 seconds.");
}

void loop() {
  if (millis() - lastReadTime >= READ_INTERVAL) {
    lastReadTime = millis();
    readSensor();
  }
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
