// Practice 3: a "your name" blink pattern in Morse code
// Same circuit as the Quick Win (red LED on D4)

const int PIN_LED = 4;

const int SHORT = 200;         // length of a short blink (dot), in milliseconds
const int LONG = 600;          // length of a long blink (dash)
const int BLINK_DELAY = 200;   // short pause between two blinks
const int LETTER_GAP = 400;    // pause between two letters
const int REPEAT_GAP = 1000;   // long pause before the pattern repeats

// A small function = a "recipe" you can call again and again
void blink(int onTime) {
  digitalWrite(PIN_LED, HIGH);
  delay(onTime);              // stay on for onTime milliseconds
  digitalWrite(PIN_LED, LOW);
  delay(BLINK_DELAY);         // off for a moment before the next blink
}

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // Example pattern for the name "ANI" (A = · —, N = — ·, I = · ·)
  // One letter = one line of blink(...) + one line of delay(LETTER_GAP)
  // Replace these with the letters of your name (the Morse table is in the module text)
  blink(SHORT); blink(LONG);       // A
  delay(LETTER_GAP);
  blink(LONG); blink(SHORT);       // N
  delay(LETTER_GAP);
  blink(SHORT); blink(SHORT);      // I
  delay(REPEAT_GAP);               // long pause, then start over
}
