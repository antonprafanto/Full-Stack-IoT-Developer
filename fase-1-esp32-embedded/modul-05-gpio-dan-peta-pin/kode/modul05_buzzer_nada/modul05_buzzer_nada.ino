// Modul 5 - Praktik 4: buzzer pasif memainkan nada
// Buzzer pasif di D27 (lewat resistor 220 ohm). Tinggi nada = frekuensi PWM.

const int PIN_BUZZER = 27;  // buzzer (peta pin kanonik)

// Frekuensi tangga nada (Hz), oktaf ke-4
const int DO = 262;
const int RE = 294;
const int MI = 330;
const int FA = 349;
const int SOL = 392;
const int LA = 440;
const int SI = 494;
const int DO_TINGGI = 523;

// "Twinkle Twinkle Little Star" (lagu rakyat, domain publik): nada dan panjangnya (dalam ketukan)
const int LAGU[] = {DO, DO, SOL, SOL, LA, LA, SOL, FA, FA, MI, MI, RE, RE, DO};
const int KETUKAN[] = {1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2};
const int JUMLAH_NADA = 14;
const int SATU_KETUKAN = 350;  // milidetik

// Membunyikan satu nada selama lamaMs milidetik, lalu diam sebentar.
void bunyikan(int frekuensi, int lamaMs) {
  ledcWriteTone(PIN_BUZZER, frekuensi);  // mulai berbunyi pada frekuensi ini
  delay(lamaMs);
  ledcWriteTone(PIN_BUZZER, 0);          // frekuensi 0 = diam
  delay(50);                             // jeda pendek supaya dua nada sama tetap terdengar terpisah
}

void setup() {
  Serial.begin(115200);
  ledcAttach(PIN_BUZZER, 1000, 10);  // siapkan PWM di D27; frekuensinya diganti untuk tiap nada

  Serial.println("Tangga nada: do re mi fa sol la si do");
  int tangga[] = {DO, RE, MI, FA, SOL, LA, SI, DO_TINGGI};
  for (int i = 0; i < 8; i++) {
    bunyikan(tangga[i], 300);
  }
  delay(500);

  Serial.println("Lagu: Twinkle Twinkle Little Star");
  for (int i = 0; i < JUMLAH_NADA; i++) {
    bunyikan(LAGU[i], KETUKAN[i] * SATU_KETUKAN);
  }
  Serial.println("Selesai. Tekan tombol EN di papan untuk mendengarkan lagi.");
}

void loop() {
  // sengaja kosong: lagunya cukup dimainkan sekali di setup()
}
