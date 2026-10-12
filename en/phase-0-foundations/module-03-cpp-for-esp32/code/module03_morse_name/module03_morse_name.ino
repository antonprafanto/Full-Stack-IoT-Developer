// Module 3 - Practice 4: name -> Morse code -> LED blinks, automatically
// Type your name in the Serial Monitor, then press Enter. The red LED on D4 blinks it in Morse code.
// In Module 1 you wrote blink(...) calls one by one; now the program does the translating.

const int PIN_LED = 4;

const int SHORT = 200;        // short blink (dot) length, milliseconds
const int LONG = 600;         // long blink (dash) length
const int BLINK_DELAY = 200;  // pause between two blinks within one letter
const int LETTER_GAP = 400;   // extra pause between two letters
const int WORD_GAP = 1000;    // pause for the space between words

// Two lists in the same order: letter 0 (A) pairs with code 0 (".-"), and so on.
const String LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const String MORSE[26] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---",  // A-J
  "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-",    // K-T
  "..-", "...-", ".--", "-..-", "-.--", "--.."                            // U-Z
};

void blink(int onTime) {
  digitalWrite(PIN_LED, HIGH);
  delay(onTime);
  digitalWrite(PIN_LED, LOW);
  delay(BLINK_DELAY);
}

// Sends one letter: look up its code, then blink its dots and dashes one by one.
void sendLetter(char letter) {
  int position = LETTERS.indexOf(letter);  // A = 0, B = 1, ... ; -1 if it isn't a letter A-Z
  if (position < 0) {
    return;  // a digit or punctuation mark: just skip it
  }
  String code = MORSE[position];
  Serial.print(letter);
  Serial.print(" = ");
  Serial.println(code);

  for (int i = 0; i < code.length(); i++) {
    if (code.charAt(i) == '.') {
      blink(SHORT);
    } else {
      blink(LONG);
    }
  }
  delay(LETTER_GAP);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED, OUTPUT);
  Serial.println();
  Serial.println("Type your name, then press Enter:");
}

void loop() {
  if (Serial.available() > 0) {
    String name = Serial.readStringUntil('\n');
    name.trim();         // remove what's left of the Enter key
    name.toUpperCase();  // "ani" becomes "ANI"
    Serial.println("Sending: " + name);

    for (int i = 0; i < name.length(); i++) {
      char letter = name.charAt(i);
      if (letter == ' ') {
        delay(WORD_GAP);  // space between words
      } else {
        sendLetter(letter);
      }
    }
    Serial.println("Done. Type another name:");
  }
}
