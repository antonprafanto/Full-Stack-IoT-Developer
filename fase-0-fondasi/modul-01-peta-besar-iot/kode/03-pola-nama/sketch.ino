// Praktik 3: pola kedip "namamu" dengan kode Morse
// Rangkaian sama dengan Kemenangan Cepat (LED merah di D4)

const int PIN_LED = 4;

const int PENDEK = 200;   // lama kedip pendek, dalam milidetik
const int PANJANG = 600;  // lama kedip panjang
const int JEDA = 1000;    // jeda sebelum pola diulang

// Fungsi kecil = "resep" yang bisa dipanggil berkali-kali
void kedip(int lamaNyala) {
  digitalWrite(PIN_LED, HIGH);
  delay(lamaNyala);           // nyala selama lamaNyala milidetik
  digitalWrite(PIN_LED, LOW);
  delay(200);                 // jeda singkat antara dua kedip
}

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // Contoh pola untuk nama "ANI" (A = · —, N = — ·, I = · ·)
  // Ganti dengan huruf-huruf namamu (tabel Morse ada di materi modul)
  kedip(PENDEK); kedip(PANJANG);   // A
  delay(400);                      // jeda antarhuruf
  kedip(PANJANG); kedip(PENDEK);   // N
  delay(400);
  kedip(PENDEK); kedip(PENDEK);    // I
  delay(JEDA);                     // jeda panjang, lalu ulang dari awal
}
