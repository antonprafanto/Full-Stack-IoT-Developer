// Module 15 - Practice 1, the NODE 1 board: "ping".
// Every 2 seconds it talks briefly ("ping N"), then listens for the reply "pong N" from the second board,
// over the SAME single pair of wires. The DE/RE pin sets the direction: HIGH = talk, LOW = listen.
// esp32 package 3.3.12; no extra library needed.

const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together
const unsigned long PING_INTERVAL = 2000;   // one ping every 2 seconds
const unsigned long WAIT_TIMEOUT = 500;     // wait at most 0.5 seconds for the reply

unsigned long number = 0;

// Talk briefly, then go back to listening. Just like the talk button of a walkie-talkie.
void sendLine(const char* text) {
  digitalWrite(PIN_RS485_DE_RE, HIGH);  // press the talk button
  Serial2.print(text);
  Serial2.flush();                      // wait until the last letter has really gone out onto the cable
  digitalWrite(PIN_RS485_DE_RE, LOW);   // release the talk button: back to listening
  while (Serial2.available() > 0) {
    Serial2.read();  // throw away any garbage read while this board was talking
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(PIN_RS485_DE_RE, OUTPUT);
  digitalWrite(PIN_RS485_DE_RE, LOW);  // start by listening
  Serial2.begin(9600, SERIAL_8N1, PIN_RS485_RX, PIN_RS485_TX);  // the pins must be written (esp32 3.x package)
  Serial2.setTimeout(WAIT_TIMEOUT);
  Serial.println();
  Serial.println("Node 1 board ready: a ping every 2 seconds.");
}

void loop() {
  number++;
  char text[24];
  snprintf(text, sizeof(text), "ping %lu\n", number);
  while (Serial2.available() > 0) {
    Serial2.read();  // throw away old leftover letters so that the reply read is really the reply to this ping
  }
  unsigned long start = millis();
  sendLine(text);
  String answer = Serial2.readStringUntil('\n');  // waits at most WAIT_TIMEOUT
  unsigned long elapsed = millis() - start;
  if (answer.length() == 0) {
    Serial.printf("ping %lu -> no reply within %lu ms\n", number, WAIT_TIMEOUT);
  } else if (answer.startsWith("pong ")) {
    Serial.printf("ping %lu -> %s (%lu ms round trip)\n", number, answer.c_str(), elapsed);
  } else {
    Serial.printf("ping %lu -> broken reply (%u letters)\n", number, answer.length());
  }
  delay(PING_INTERVAL);
}
