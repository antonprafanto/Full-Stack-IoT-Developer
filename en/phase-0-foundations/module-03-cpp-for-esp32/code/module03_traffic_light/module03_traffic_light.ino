// Module 3 - Practice 8: 3-LED traffic light (SAMPLE ANSWER)
// Try writing your own version first; open this file only to compare.
// Circuit: red on D4, green on D18, yellow on D19 (same as Module 1). Its Wokwi diagram
// is in the wokwi-traffic-light folder. The order is the one used on Indonesian roads:
// red -> green -> yellow -> red.

const int PIN_RED = 4;      // red LED    (labeled D4 on the board)
const int PIN_GREEN = 18;   // green LED  (D18)
const int PIN_YELLOW = 19;  // yellow LED (D19)

const int RED_TIME = 5000;     // milliseconds
const int GREEN_TIME = 4000;
const int YELLOW_TIME = 2000;

// One function to set all three lights at once.
// true means the same as HIGH (on), false the same as LOW (off).
void setLamp(bool red, bool yellow, bool green) {
  digitalWrite(PIN_RED, red);
  digitalWrite(PIN_YELLOW, yellow);
  digitalWrite(PIN_GREEN, green);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_RED, OUTPUT);
  pinMode(PIN_YELLOW, OUTPUT);
  pinMode(PIN_GREEN, OUTPUT);
  Serial.println();
  Serial.println("Traffic light ready.");
}

void loop() {
  Serial.println("RED    - stop");
  setLamp(true, false, false);
  delay(RED_TIME);

  Serial.println("GREEN  - go ahead");
  setLamp(false, false, true);
  delay(GREEN_TIME);

  Serial.println("YELLOW - careful, red is coming soon");
  setLamp(false, true, false);
  delay(YELLOW_TIME);
}
