// Module 15 - Practice 1, the SECOND board: "pong".
// Listens all the time. Each time a complete "ping N" line arrives, this board talks briefly to answer "pong N",
// then goes back to listening. The DE/RE pin sets the direction: HIGH = talk, LOW = listen.
// esp32 package 3.3.12; no extra library needed.

const int PIN_RS485_RX = 16;    // RX2 <- RO of the MAX485 module, through a 4.7 kΩ + 10 kΩ voltage divider
const int PIN_RS485_TX = 17;    // TX2 -> DI of the MAX485 module
const int PIN_RS485_DE_RE = 4;  // D4 -> DE and RE of the MAX485 module, joined together

char line[40];  // the letters collected so far, up to the end-of-line mark
int length = 0;

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
  Serial.println();
  Serial.println("Second board listening; every ping will be answered with a pong.");
}

void loop() {
  while (Serial2.available() > 0) {
    char letter = Serial2.read();
    if (letter == '\n') {
      line[length] = '\0';
      if (strncmp(line, "ping ", 5) == 0) {
        char answer[48];
        snprintf(answer, sizeof(answer), "pong %s\n", line + 5);  // the same number as the ping
        sendLine(answer);
        Serial.printf("heard \"%s\" -> replied \"pong %s\"\n", line, line + 5);
      } else {
        Serial.printf("heard something that is not a ping: \"%s\"\n", line);
      }
      length = 0;
    } else if (letter != '\r' && length < (int)sizeof(line) - 1) {
      line[length] = letter;
      length++;
    }
  }
}
