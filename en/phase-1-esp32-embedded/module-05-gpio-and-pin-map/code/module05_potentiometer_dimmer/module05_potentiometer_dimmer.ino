// Module 5 - Practice 3: dimming an LED with a potentiometer
// Turn the potentiometer on VN (GPIO 39): the LED on D4 gets dimmer and brighter.
// PWM uses ledcAttach + ledcWrite (the esp32 package version 3 way).

const int PIN_POT = 39;          // VN: potentiometer (becomes the soil sensor in Module 6)
const int PIN_LED = 4;           // status LED
const int PWM_FREQUENCY = 5000;  // 5,000 blinks per second: too fast for the eye to see
const int PWM_RESOLUTION = 8;    // 8 bits: brightness 0 (off) to 255 (full)

void setup() {
  Serial.begin(115200);
  ledcAttach(PIN_LED, PWM_FREQUENCY, PWM_RESOLUTION);  // D4 becomes a PWM output (no pinMode needed)
}

void loop() {
  int turns = analogRead(PIN_POT);               // 0 (turned all the way left) to 4095 (all the way right)
  int brightness = map(turns, 0, 4095, 0, 255);  // convert to the 0-255 scale
  ledcWrite(PIN_LED, brightness);
  Serial.print("potentiometer = ");
  Serial.print(turns);
  Serial.print("   brightness = ");
  Serial.println(brightness);
  delay(200);
}
