// Module 6 - Quick Win: your first light reading
// Light sensor (LDR) on VP (GPIO 36). The brighter it is, the SMALLER the raw number,
// so we invert it: light = 4095 - raw (the brighter it is, the bigger the number).

const int PIN_LDR = 36;  // VP: LDR (canonical pin map)

void setup() {
  Serial.begin(115200);
  Serial.println("Light sensor ready. Change the brightness, then watch the numbers.");
}

void loop() {
  int raw = analogRead(PIN_LDR);  // 0 to 4095
  int light = 4095 - raw;         // inverted: the brighter it is, the bigger the number
  Serial.print("raw = ");
  Serial.print(raw);
  Serial.print("   light = ");
  Serial.println(light);
  delay(500);
}
