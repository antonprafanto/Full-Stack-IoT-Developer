// Module 6 - Practice 5: the HC-SR501 PIR motion sensor
// The PIR's OUT pin goes to D34. The status LED on D4 is on while the PIR sees motion.
// The PIR needs a "warm-up" of about 1 minute after it gets power.

const int PIN_PIR = 34;         // D34: PIR (canonical pin map), input only
const int PIN_LED = 4;          // status LED
const int WARMUP_SECONDS = 60;  // change it to 3 if you try it in Wokwi

bool previousMotion = false;  // the PIR's state on the previous pass

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);  // no pull-up: the PIR itself outputs HIGH or LOW
  pinMode(PIN_LED, OUTPUT);
  Serial.print("PIR warm-up: ");
  Serial.print(WARMUP_SECONDS);
  Serial.println(" seconds. Stay away from the front of the sensor...");
  for (int remaining = WARMUP_SECONDS; remaining > 0; remaining--) {
    if (remaining % 10 == 0) {  // report every 10 seconds
      Serial.print("  ");
      Serial.print(remaining);
      Serial.println(" seconds left");
    }
    delay(1000);
  }
  Serial.println("PIR ready. Wave your hand in front of it!");
}

void loop() {
  bool motion = digitalRead(PIN_PIR) == HIGH;  // HIGH = motion
  if (motion) {
    digitalWrite(PIN_LED, HIGH);
  } else {
    digitalWrite(PIN_LED, LOW);
  }

  // Print only when the state CHANGES, so the Serial Monitor isn't flooded.
  if (motion && !previousMotion) {
    Serial.println("Motion detected!");
  }
  if (!motion && previousMotion) {
    Serial.println("All quiet again.");
  }
  previousMotion = motion;
  delay(50);
}
