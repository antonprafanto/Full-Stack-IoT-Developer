// Module 6 - Practice 1: LDR and voltage divider
// Circuit: 3.3 V -> 10 kiloohm resistor -> midpoint -> LDR -> GND.
// Midpoint to VP (GPIO 36). The brighter it is, the smaller the LDR's resistance,
// the lower the midpoint voltage, and the lower the raw number.

const int PIN_LDR = 36;             // VP: LDR (canonical pin map)
const int DARK_THRESHOLD = 1000;    // light below this counts as dark (adjust it to your room)
const int BRIGHT_THRESHOLD = 2500;  // light above this counts as bright

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(PIN_LDR);     // 0 to 4095
  float voltage = raw * 3.3 / 4095;  // rough estimate with the "straight ruler" (Concept 2)
  int light = 4095 - raw;            // inverted: the brighter it is, the bigger the number

  Serial.print("raw=");
  Serial.print(raw);
  Serial.print("  voltage~");
  Serial.print(voltage, 2);  // 2 digits after the decimal point
  Serial.print(" V  light=");
  Serial.print(light);
  if (light < DARK_THRESHOLD) {
    Serial.println("  (dark)");
  } else if (light < BRIGHT_THRESHOLD) {
    Serial.println("  (dim)");
  } else {
    Serial.println("  (bright)");
  }
  delay(500);
}
