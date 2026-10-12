// Our first program: a blinking LED (Blink)
// The LED is connected to pin D4 through a 220 ohm resistor

const int PIN_LED = 4;  // the pin number the LED is connected to

void setup() {
  // Runs ONCE when the ESP32 first powers on
  pinMode(PIN_LED, OUTPUT);  // this pin is an output
}

void loop() {
  // Repeats OVER AND OVER as long as the ESP32 is on
  digitalWrite(PIN_LED, HIGH);  // HIGH = LED on
  delay(500);                   // wait 500 milliseconds
  digitalWrite(PIN_LED, LOW);   // LOW  = LED off
  delay(500);                   // wait another 500 milliseconds
}
