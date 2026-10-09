// Praktik 3: pola kedip "namamu" dengan kode Morse
// Rangkaian sama dengan Kemenangan Cepat (LED merah di D4)

const int PIN_LED = 4;

const int PENDEK = 200;        // lama kedip pendek (titik), dalam milidetik
const int PANJANG = 600;       // lama kedip panjang (garis)
const int JEDA_KEDIP = 200;    // jeda singkat antara dua kedip
const int JEDA_HURUF = 400;    // jeda antara dua huruf
const int JEDA_ULANG = 1000;   // jeda panjang sebelum pola diulang

// Fungsi kecil = "resep" yang bisa dipanggil berkali-kali
void kedip(int lamaNyala) {
  digitalWrite(PIN_LED, HIGH);
  delay(lamaNyala);           // nyala selama lamaNyala milidetik
  digitalWrite(PIN_LED, LOW);
  delay(JEDA_KEDIP);          // padam sebentar sebelum kedip berikutnya
}

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // Contoh pola untuk nama "ANI" (A = · —, N = — ·, I = · ·)
  // Satu huruf = satu baris kedip(...) + satu baris delay(JEDA_HURUF)
  // Ganti dengan huruf-huruf namamu (tabel Morse ada di materi modul)
  kedip(PENDEK); kedip(PANJANG);   // A
  delay(JEDA_HURUF);
  kedip(PANJANG); kedip(PENDEK);   // N
  delay(JEDA_HURUF);
  kedip(PENDEK); kedip(PENDEK);    // I
  delay(JEDA_ULANG);               // jeda panjang, lalu ulang dari awal
}
