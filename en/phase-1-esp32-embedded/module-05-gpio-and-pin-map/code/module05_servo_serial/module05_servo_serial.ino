// Module 5 - Practice 5: moving an SG90 servo from the Serial Monitor
// Library: ESP32Servo version 3.2.1 (install it through the Library Manager).
// Servo signal on D26; servo power from the MB102's 5 V rail (not from the ESP32 board).

#include <ESP32Servo.h>

const int PIN_SERVO = 26;  // curtain servo (canonical pin map)

Servo curtain;  // one servo "object" that we name curtain

void setup() {
  Serial.begin(115200);
  curtain.setPeriodHertz(50);            // a servo expects 50 pulses per second
  curtain.attach(PIN_SERVO, 500, 2400);  // a 0.5 ms pulse = 0 degrees ... 2.4 ms = 180 degrees
  curtain.write(90);                     // start in the middle
  Serial.println("Type an angle from 0 to 180, then press Enter.");
}

void loop() {
  if (Serial.available() > 0) {
    String text = Serial.readStringUntil('\n');  // take one typed line
    text.trim();                                 // throw away what's left of the Enter key
    int angle = text.toInt();                    // "120" becomes 120 (anything that isn't a number becomes 0)
    if (angle == 0 && text != "0") {             // it became 0, but what was typed isn't "0"?
      Serial.println("That's not a number. Type a number from 0 to 180.");
      return;                                    // ignore it; wait for the next typed line
    }
    angle = constrain(angle, 0, 180);            // keep it between 0 and 180
    curtain.write(angle);
    Serial.print("Servo to ");
    Serial.print(angle);
    Serial.println(" degrees");
  }
}
