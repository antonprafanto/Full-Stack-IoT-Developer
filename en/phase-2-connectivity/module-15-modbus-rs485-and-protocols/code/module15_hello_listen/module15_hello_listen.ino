// Module 15 - Quick Win, the NODE 1 board: the listener.
// Shows every line of text that arrives over the RS-485 cable. This board "stays quiet all the time":
// DE/RE is set LOW once in setup(), so its MAX485 module's transmitter never turns on.
// esp32 package 3.3.12; no extra library needed.

const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module; not used in this sketch yet
const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together

char line[80];  // the letters collected so far, up to the end-of-line mark
int length = 0;
unsigned long lastLetterTime = 0;
unsigned long lastPrintTime = 0;

// Prints the content of "line". If a letter is unreadable, all of it is printed as hexadecimal numbers.
void printLine(bool complete) {
  bool allText = complete;
  for (int i = 0; i < length; i++) {
    uint8_t b = (uint8_t)line[i];
    if (b < 32 || b > 126) {
      allText = false;
    }
  }
  line[length] = '\0';
  if (allText) {
    Serial.printf("received: %s\n", line);
  } else {
    Serial.print("received, but not intact text:");
    for (int i = 0; i < length; i++) {
      Serial.printf(" %02X", (uint8_t)line[i]);
    }
    Serial.println();
  }
  length = 0;
  lastPrintTime = millis();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // LOW = the module's receiver on, its transmitter off: this board only listens
  // The pins MUST be written: without them, the esp32 3.x package uses GPIO 4 and 25 for Serial2, not 16 and 17.
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  Serial.println();
  Serial.println("Node 1 board listening to the RS-485 cable (9600 baud)...");
  lastPrintTime = millis();
}

void loop() {
  while (Serial2.available() > 0) {
    char letter = Serial2.read();
    lastLetterTime = millis();
    if (letter == '\n') {
      printLine(true);  // one complete line
    } else if (letter != '\r') {
      line[length] = letter;
      length++;
      if (length >= (int)sizeof(line) - 1) {
        printLine(false);  // too long without an end of line: surely not a proper message
      }
    }
  }
  if (length > 0 && millis() - lastLetterTime > 200) {
    printLine(false);  // a piece without an end of line, then the cable went quiet
  }
  if (millis() - lastPrintTime > 3000) {
    Serial.println("... 3 seconds without a message. Check wires A, B, GND, and the power of both modules.");
    lastPrintTime = millis();
  }
}
