// Module 5 - Practice 4: a passive buzzer plays tones
// Passive buzzer on D27 (through a 220 ohm resistor). Pitch = PWM frequency.

const int PIN_BUZZER = 27;  // buzzer (canonical pin map)

// Frequencies of the musical scale (Hz), 4th octave
const int NOTE_C4 = 262;
const int NOTE_D4 = 294;
const int NOTE_E4 = 330;
const int NOTE_F4 = 349;
const int NOTE_G4 = 392;
const int NOTE_A4 = 440;
const int NOTE_B4 = 494;
const int NOTE_C5 = 523;

// "Twinkle Twinkle Little Star" (folk song, public domain): the notes and their lengths (in beats)
const int MELODY[] = {NOTE_C4, NOTE_C4, NOTE_G4, NOTE_G4, NOTE_A4, NOTE_A4, NOTE_G4, NOTE_F4, NOTE_F4, NOTE_E4, NOTE_E4, NOTE_D4, NOTE_D4, NOTE_C4};
const int BEATS[] = {1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2};
const int NOTE_COUNT = 14;
const int ONE_BEAT = 350;  // milliseconds

// Plays one note for durationMs milliseconds, then stays silent for a moment.
void playTone(int frequency, int durationMs) {
  ledcWriteTone(PIN_BUZZER, frequency);  // start sounding at this frequency
  delay(durationMs);
  ledcWriteTone(PIN_BUZZER, 0);          // frequency 0 = silence
  delay(50);                             // a short pause so two identical notes still sound separate
}

void setup() {
  Serial.begin(115200);
  ledcAttach(PIN_BUZZER, 1000, 10);  // set up PWM on D27; its frequency is changed for every note

  Serial.println("Scale: do re mi fa sol la ti do");
  int scale[] = {NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4, NOTE_G4, NOTE_A4, NOTE_B4, NOTE_C5};
  for (int i = 0; i < 8; i++) {
    playTone(scale[i], 300);
  }
  delay(500);

  Serial.println("Song: Twinkle Twinkle Little Star");
  for (int i = 0; i < NOTE_COUNT; i++) {
    playTone(MELODY[i], BEATS[i] * ONE_BEAT);
  }
  Serial.println("Done. Press the EN button on the board to hear it again.");
}

void loop() {
  // left empty on purpose: the song only needs to be played once, in setup()
}
