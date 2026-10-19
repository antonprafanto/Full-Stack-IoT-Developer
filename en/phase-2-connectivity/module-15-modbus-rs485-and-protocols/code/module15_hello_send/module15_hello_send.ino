// Module 15 - Quick Win, the SECOND board (the borrowed Node 2 board): the sender.
// Every second it sends one line of text through the MAX485 module onto the RS-485 cable.
// This board "talks all the time": DE/RE is set HIGH once in setup() and never brought down.
// esp32 package 3.3.12; no extra library needed.

const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module (via a voltage divider); not used in this sketch yet
const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together

unsigned long number = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // HIGH = the module's transmitter is on: this board holds the cable to talk
  // The pins MUST be written: without them, the esp32 3.x package uses GPIO 4 and 25 for Serial2, not 16 and 17.
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);
  Serial.println();
  Serial.println("Second board ready to send over RS-485 (9600 baud).");
}

void loop() {
  number++;
  Serial2.printf("hello %lu from the second board\n", number);  // onto the RS-485 cable
  Serial.printf("sent: hello %lu\n", number);                   // to this board's Serial Monitor
  delay(1000);
}
