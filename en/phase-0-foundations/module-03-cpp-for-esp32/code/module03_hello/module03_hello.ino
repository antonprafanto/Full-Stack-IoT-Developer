// Module 3 - Quick Win: your first program that "talks"
// Run it in Wokwi (a new ESP32 project) or on a real board.
// The output appears in the Serial Monitor.

String name = "Ani";   // text: write your name between the quotes
int age = 17;          // whole number: your age in years

void setup() {
  Serial.begin(115200);  // open a talk line to the laptop, speed 115200
  delay(500);            // give it a moment before it starts talking
  Serial.println();      // one blank line to keep things tidy

  Serial.println("Hello, ESP32!");
  Serial.println("My name is " + name + ".");

  Serial.print("I am ");
  Serial.print(age);
  Serial.println(" years old.");

  Serial.print("That means I have been alive for about ");
  Serial.print(age * 365);  // the ESP32 does the math: age x 365
  Serial.println(" days.");
}

void loop() {
  // Left empty on purpose: every message is sent just once, in setup().
}
