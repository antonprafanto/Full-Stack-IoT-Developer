// Module 6 - Practice 6: the HC-SR04 as a water tank level gauge
// TRIG on D15. ECHO through a voltage divider (4.7 kiloohm + 10 kiloohm) to D35.
// The sensor faces down, above the water tank (the pump's water container).

const int PIN_TRIG = 15;            // D15: HC-SR04 TRIG (canonical pin map)
const int PIN_ECHO = 35;            // D35: HC-SR04 ECHO, through a voltage divider
const float DISTANCE_EMPTY = 20.0;  // cm from the sensor to the bottom of the tank (measure it yourself)
const float DISTANCE_FULL = 5.0;    // cm from the sensor to the water surface when the tank is full (measure it yourself)

// Measures the distance once, in cm. Returns -1 if the echo doesn't come back.
float measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);  // the "shout" command: HIGH for 10 microseconds
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duration = pulseIn(PIN_ECHO, HIGH, 30000);  // length of the ECHO pulse; wait at most 30 ms
  if (duration == 0) {
    return -1;  // no echo: too far, blocked, or a loose wire
  }
  return duration / 58.0;  // every 58 microseconds = 1 cm (the sound travels there and back)
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  digitalWrite(PIN_TRIG, LOW);
}

void loop() {
  delay(1000);  // measure once every second
  float distance = measureDistanceCm();
  if (distance < 0) {
    Serial.println("No echo. Check the wires and which way the sensor faces.");
  } else {
    // The formula is the same as map(distance, DISTANCE_EMPTY, DISTANCE_FULL, 0, 100), but for decimal numbers.
    int percent = (DISTANCE_EMPTY - distance) * 100 / (DISTANCE_EMPTY - DISTANCE_FULL);
    int waterLevel = constrain(percent, 0, 100);
    Serial.print("distance=");
    Serial.print(distance, 1);
    Serial.print(" cm  water_level=");
    Serial.print(waterLevel);
    Serial.println(" %");
  }
}
