// =====================================================================
//  Modul 1 — Proyek mini: pola kedip "namamu"
//  Rangkaian sama dengan 01-blink (D4 → 220 Ω → LED → GND).
//  Ide: kedip PENDEK = titik, kedip PANJANG = garis (mirip kode Morse).
//  Ganti isi loop() dengan pola yang kamu rancang sendiri!
// =====================================================================

const int PIN_LED = 4;

const int PENDEK = 200;   // lama kedip pendek, dalam milidetik
const int PANJANG = 600;  // lama kedip panjang
const int JEDA = 1000;    // jeda sebelum pola diulang

// Fungsi kecil = "resep" yang bisa dipanggil berkali-kali.
// (Dibahas tuntas di Modul 3; sekarang cukup tahu cara memakainya.)
void kedip(int lamaNyala) {
  digitalWrite(PIN_LED, HIGH);
  delay(lamaNyala);           // nyala selama lamaNyala milidetik
  digitalWrite(PIN_LED, LOW);
  delay(200);                 // jeda singkat antar-kedip
}

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // Contoh pola untuk nama "ANI" (A = · —, N = — ·, I = · ·)
  // Ganti dengan huruf-huruf namamu (tabel Morse ada di artikel).
  kedip(PENDEK); kedip(PANJANG);   // A
  delay(400);                      // jeda antar-huruf
  kedip(PANJANG); kedip(PENDEK);   // N
  delay(400);
  kedip(PENDEK); kedip(PENDEK);    // I
  delay(JEDA);                     // jeda panjang, lalu ulang dari awal
}
