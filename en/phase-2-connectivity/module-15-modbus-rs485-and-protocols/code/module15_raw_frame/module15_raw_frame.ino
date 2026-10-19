// Module 15 - Practice 3, the NODE 1 board: Modbus frames "by hand".
// Type the request bytes WITHOUT the CRC in the Serial Monitor, for example:  01 03 00 00 00 03
// This sketch computes the CRC, sends the frame over RS-485, then prints the server's reply byte by byte.
// Add an x at the end of the line to break the CRC on purpose, for example:  01 03 00 00 00 03 x
// esp32 package 3.3.12; no extra library needed.

const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
const unsigned long WAIT_TIMEOUT = 1000;  // wait at most 1 second for the reply
const unsigned long END_GAP = 5;          // the cable quiet for over 5 ms after the last byte = reply complete

char line[100];  // a command from the Serial Monitor
int lineLength = 0;

// CRC-16/MODBUS: start at 0xFFFF, polynomial 0xA001 (Modbus serial line specification, Appendix B).
uint16_t computeCrc(const uint8_t* data, size_t length) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < length; i++) {
    crc ^= data[i];
    for (int bit = 0; bit < 8; bit++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc;
}

void printBytes(const char* title, const uint8_t* data, size_t length) {
  Serial.printf("%s (%u bytes):", title, (unsigned)length);
  for (size_t i = 0; i < length; i++) {
    Serial.printf(" %02X", data[i]);
  }
  Serial.println();
}

const char* exceptionName(uint8_t code) {
  if (code == 0x01) {
    return "ILLEGAL FUNCTION: the server does not know the function code";
  }
  if (code == 0x02) {
    return "ILLEGAL DATA ADDRESS: the requested register does not exist";
  }
  if (code == 0x03) {
    return "ILLEGAL DATA VALUE: the request content is not valid";
  }
  if (code == 0x04) {
    return "SERVER DEVICE FAILURE: the server failed to carry it out";
  }
  return "another code";
}

// Explains the server's reply. "first" = the number of the first register asked for (functions 03 and 04).
void explainReply(const uint8_t* r, size_t n, uint16_t first) {
  if (n < 4 || computeCrc(r, n) != 0) {  // the CRC over the whole frame, its 2 CRC bytes included: result 0 = intact
    Serial.println("  Reply CRC WRONG: this frame was damaged on the way.");
    return;
  }
  Serial.println("  Reply CRC matches: the frame is intact.");
  uint8_t function = r[1];
  if (function & 0x80) {
    Serial.printf("  Exception: function %02X refused with code %02X = %s\n", function & 0x7F, r[2], exceptionName(r[2]));
  } else if (function == 0x03 || function == 0x04) {
    int count = r[2] / 2;  // 2 bytes per register
    for (int i = 0; i < count && 4 + 2 * i < (int)n - 2; i++) {
      uint16_t value = (r[3 + 2 * i] << 8) | r[4 + 2 * i];  // high byte first (big-endian)
      Serial.printf("  register %u: %02X %02X = %u", first + i, r[3 + 2 * i], r[4 + 2 * i], value);
      if (value > 32767) {
        Serial.printf(" (if signed: %d)", (int16_t)value);
      }
      Serial.println();
    }
  } else if (function == 0x06) {
    Serial.println("  Function 06 succeeded: its normal reply is an echo (an exact copy) of the request.");
  }
}

// Turns text like "01 03 00 00 00 03 x" into bytes. Returns false if something is mistyped.
bool readRequest(char* text, uint8_t* frame, size_t& n, bool& broken) {
  n = 0;
  broken = false;
  char* token = strtok(text, " ");
  while (token != nullptr) {
    if (strcmp(token, "x") == 0 || strcmp(token, "X") == 0) {
      broken = true;
    } else {
      char* end;
      long value = strtol(token, &end, 16);
      if (*end != '\0' || strlen(token) > 2) {
        Serial.printf("\"%s\" is not a hexadecimal byte (00 to FF).\n", token);
        return false;
      }
      if (n >= 30) {
        Serial.println("Too long: 30 bytes at most.");
        return false;
      }
      frame[n] = (uint8_t)value;
      n++;
    }
    token = strtok(nullptr, " ");
  }
  if (n < 2) {
    Serial.println("At least 2 bytes: the server address and the function code. Example: 01 03 00 00 00 03");
    return false;
  }
  return true;
}

void sendAndListen() {
  uint8_t frame[32];
  size_t n = 0;
  bool broken = false;
  if (!readRequest(line, frame, n, broken)) {
    return;
  }
  uint16_t first = (n >= 4) ? (frame[2] << 8) | frame[3] : 0;
  uint16_t crc = computeCrc(frame, n);
  if (broken) {
    crc = crc ^ 0xFFFF;  // broken on purpose: all its bits flipped
  }
  frame[n] = crc & 0xFF;  // the LOW byte of the CRC is sent first
  frame[n + 1] = crc >> 8;
  n = n + 2;

  while (Serial2.available() > 0) {
    Serial2.read();  // throw away old leftovers
  }
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // talk
  Serial2.write(frame, n);
  Serial2.flush();                      // wait for the last byte to go out
  digitalWrite(PIN_RS485_DE_RE, LOW);   // listen
  while (Serial2.available() > 0) {
    Serial2.read();  // throw away any garbage read while this board was talking (Concept 2)
  }
  if (broken) {
    printBytes("sent, CRC broken on purpose", frame, n);
  } else {
    printBytes("sent", frame, n);
  }

  uint8_t reply[64];
  size_t m = 0;
  unsigned long start = millis();
  unsigned long lastByteTime = start;
  while (true) {
    if (Serial2.available() > 0) {
      uint8_t b = Serial2.read();
      if (m < sizeof(reply)) {
        reply[m] = b;
        m++;
      }
      lastByteTime = millis();
    } else if (m == 0 && millis() - start > WAIT_TIMEOUT) {
      break;  // not a single byte
    } else if (m > 0 && millis() - lastByteTime > END_GAP) {
      break;  // the cable is quiet: the reply is complete
    }
  }
  if (m == 0) {
    Serial.printf("received: no reply within %lu ms (timeout)\n", WAIT_TIMEOUT);
    return;
  }
  Serial.printf("received within %lu ms after the request ended.\n", lastByteTime - start);
  printBytes("received", reply, m);
  explainReply(reply, m, first);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // start by listening
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // the pins must be written (esp32 3.x package)
  Serial.println();
  Serial.println("Type the request bytes without the CRC, then Enter. Example: 01 03 00 00 00 03");
}

void loop() {
  while (Serial.available() > 0) {
    char letter = Serial.read();
    if (letter == '\n') {
      line[lineLength] = '\0';
      lineLength = 0;
      Serial.printf("> %s\n", line);
      sendAndListen();
    } else if (letter != '\r' && lineLength < (int)sizeof(line) - 1) {
      line[lineLength] = letter;
      lineLength++;
    }
  }
}
