// Module 3 - Practice 1: Serial calculator
// Type a question in the Serial Monitor, for example 12 + 5, then press Enter.
// Operators it understands: +  -  *  /   (spaces are optional)

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("=== ESP32 Calculator ===");
  Serial.println("Type a question, for example 12 + 5, then press Enter.");
  Serial.println("Operators: +  -  *  /");
}

void loop() {
  if (Serial.available() > 0) {                      // has anything been typed?
    String question = Serial.readStringUntil('\n');  // read one line, for example "12 + 5"
    question.replace(" ", "");                       // remove all spaces: "12+5"
    question.trim();                                 // remove what's left of the Enter key

    // Find where the operator is. The search starts at the second character (position 1)
    // so that a minus sign before the first number (like -3*2) isn't taken as the operator.
    char operation = '*';
    int position = question.indexOf('*', 1);
    if (position < 0) {
      operation = '/';
      position = question.indexOf('/', 1);
    }
    if (position < 0) {
      operation = '+';
      position = question.indexOf('+', 1);
    }
    if (position < 0) {
      operation = '-';
      position = question.indexOf('-', 1);
    }

    if (position < 0) {
      // indexOf() returns -1 when it can't find what it's looking for
      Serial.println("Operator not found. A correct example: 12 + 5");
    } else {
      float number1 = question.substring(0, position).toFloat();   // the part left of the operator
      float number2 = question.substring(position + 1).toFloat();  // the part right of the operator

      if (operation == '/' && number2 == 0) {
        Serial.println("Cannot divide by zero!");
      } else {
        float result = 0;
        if (operation == '+') {
          result = number1 + number2;
        } else if (operation == '-') {
          result = number1 - number2;
        } else if (operation == '*') {
          result = number1 * number2;
        } else {
          result = number1 / number2;
        }

        Serial.print(number1);
        Serial.print(" ");
        Serial.print(operation);
        Serial.print(" ");
        Serial.print(number2);
        Serial.print(" = ");
        Serial.println(result);
      }
    }
  }
}
