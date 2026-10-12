// Module 3 - Practice 3: your own functions
// Circuit: red LED on D4 (the Module 2 circuit or the Wokwi traffic-light diagram).

const int PIN_LED = 4;  // red LED on D4

// A function WITHOUT a return value (void): blinks the LED howManyTimes times.
// howManyTimes is a parameter: the "ingredient" we hand over when we call the function.
void turnOnLed(int howManyTimes) {
  for (int i = 1; i <= howManyTimes; i++) {
    digitalWrite(PIN_LED, HIGH);
    delay(300);
    digitalWrite(PIN_LED, LOW);
    delay(300);
  }
}

// A function WITH a return value (float): converts a temperature from Celsius to Fahrenheit.
// The word return sends the result back to the place where the function was called.
float toFahrenheit(float celsius) {
  return celsius * 9.0 / 5.0 + 32.0;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED, OUTPUT);
  Serial.println();

  Serial.println("Blink 3 times...");
  turnOnLed(3);
  delay(1000);

  Serial.println("Blink 5 times...");
  turnOnLed(5);

  float roomTemperature = 30.0;
  float result = toFahrenheit(roomTemperature);  // result holds the returned value
  Serial.print(roomTemperature);
  Serial.print(" degrees C = ");
  Serial.print(result);
  Serial.println(" degrees F");
}

void loop() {
  // empty: everything was already done once in setup()
}
