// Module 6 - Practice 2: noise, the moving average, and the Serial Plotter
// Reads the LDR 20 times per second, then sends two lines to the Serial Plotter:
// "raw" (as it is) and "average" (the average of the last 10 readings).
// Wokwi has no noise: change ARTIFICIAL_NOISE to 150 so you can see the effect.

const int PIN_LDR = 36;          // VP: LDR (canonical pin map)
const int SAMPLE_COUNT = 10;     // how many of the latest readings are averaged
const int ARTIFICIAL_NOISE = 0;  // 0 for the real board; 150 to try it in Wokwi

int history[SAMPLE_COUNT];  // 10 drawers holding the latest readings
int position = 0;           // number of the drawer to overwrite next
long sum = 0;               // the sum of what's in all the drawers

void setup() {
  Serial.begin(115200);
  // Fill every drawer with the first reading so the average doesn't start at 0.
  int start = analogRead(PIN_LDR);
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    history[i] = start;
    sum += start;
  }
}

void loop() {
  int raw = analogRead(PIN_LDR) + random(-ARTIFICIAL_NOISE, ARTIFICIAL_NOISE + 1);

  sum -= history[position];                  // take the oldest reading out of the sum,
  history[position] = raw;                   // overwrite its drawer with the new reading,
  sum += raw;                                // then add the new reading to the sum
  position = (position + 1) % SAMPLE_COUNT;  // next drawer; after drawer 9, back to 0
  int average = sum / SAMPLE_COUNT;

  // Serial Plotter format: name:value, separated by commas. Don't print any other text in this sketch.
  Serial.print("raw:");
  Serial.print(raw);
  Serial.print(",average:");
  Serial.println(average);
  delay(50);  // 20 readings per second
}
