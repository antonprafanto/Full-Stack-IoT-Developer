// Module 2 - Practice 4: "chatting" with the ESP32 through the Serial Monitor
// Same circuit as Practice 3 (red LED on D4). The board's built-in blue LED is on GPIO 2.
// Type 1 then Enter in the Serial Monitor -> red LED on. Type 0 -> LED off.

const int PIN_LED = 4;          // red LED on the breadboard (labeled "D4" on the board)
const int PIN_BUILTIN_LED = 2;  // small blue LED already built into the board

int secondsAlive = 0;           // counter: how many seconds the ESP32 has been on

void setup() {
  pinMode(PIN_LED, OUTPUT);          // pin D4 as an output
  pinMode(PIN_BUILTIN_LED, OUTPUT);  // pin 2 as an output
  Serial.begin(115200);              // open a talk line to the laptop, speed 115200
  delay(500);                        // give it a moment before it starts talking
  Serial.println();                  // one blank line to keep things tidy
  Serial.println("=== ESP32 ready! ===");
  Serial.println("Type 1 then Enter to turn the LED on, 0 to turn it off.");
}

void loop() {
  // 1) Has a character been sent from the laptop?
  if (Serial.available() > 0) {           // some data has arrived
    char command = Serial.read();         // read one character
    if (command == '1') {                 // if the character is '1' ...
      digitalWrite(PIN_LED, HIGH);        // ... turn the red LED on
      Serial.println("Command 1 received: LED on");
    } else if (command == '0') {          // if the character is '0' ...
      digitalWrite(PIN_LED, LOW);         // ... turn the red LED off
      Serial.println("Command 0 received: LED off");
    }
    // any other character (including the Enter key) is simply ignored
  }

  // 2) Every loop: blink the built-in blue LED and report how long it has been on
  digitalWrite(PIN_BUILTIN_LED, HIGH);  // blue LED on briefly ...
  delay(100);                           // ... for 0.1 second
  digitalWrite(PIN_BUILTIN_LED, LOW);   // then off ...
  delay(900);                           // ... for 0.9 second (1 second in total)
  secondsAlive = secondsAlive + 1;      // add one second
  Serial.print("Alive for ");
  Serial.print(secondsAlive);
  Serial.println(" s");
}
