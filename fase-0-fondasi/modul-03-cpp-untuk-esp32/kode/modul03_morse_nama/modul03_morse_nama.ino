// Modul 3 - Praktik 4: nama -> kode Morse -> kedip LED, otomatis
// Ketik namamu di Serial Monitor, lalu tekan Enter. LED merah di D4 berkedip dalam kode Morse.
// Di Modul 1 kamu menulis kedip(...) satu per satu; sekarang programlah yang menerjemahkan.

const int PIN_LED = 4;

const int PENDEK = 200;      // lama kedip pendek (titik), milidetik
const int PANJANG = 600;     // lama kedip panjang (garis)
const int JEDA_KEDIP = 200;  // jeda antara dua kedip dalam satu huruf
const int JEDA_HURUF = 400;  // jeda tambahan antara dua huruf
const int JEDA_KATA = 1000;  // jeda untuk spasi antarkata

// Dua daftar yang urutannya sama: huruf ke-0 (A) pasangannya kode ke-0 (".-"), dan seterusnya.
const String HURUF = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const String MORSE[26] = {
  ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---",  // A-J
  "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-",    // K-T
  "..-", "...-", ".--", "-..-", "-.--", "--.."                            // U-Z
};

void kedip(int lamaNyala) {
  digitalWrite(PIN_LED, HIGH);
  delay(lamaNyala);
  digitalWrite(PIN_LED, LOW);
  delay(JEDA_KEDIP);
}

// Mengirim satu huruf: cari kodenya, lalu kedipkan titik dan garisnya satu per satu.
void kirimHuruf(char huruf) {
  int posisi = HURUF.indexOf(huruf);  // A = 0, B = 1, ... ; -1 kalau bukan huruf A-Z
  if (posisi < 0) {
    return;  // angka atau tanda baca: lewati saja
  }
  String kode = MORSE[posisi];
  Serial.print(huruf);
  Serial.print(" = ");
  Serial.println(kode);

  for (int i = 0; i < kode.length(); i++) {
    if (kode.charAt(i) == '.') {
      kedip(PENDEK);
    } else {
      kedip(PANJANG);
    }
  }
  delay(JEDA_HURUF);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED, OUTPUT);
  Serial.println();
  Serial.println("Ketik namamu, lalu tekan Enter:");
}

void loop() {
  if (Serial.available() > 0) {
    String nama = Serial.readStringUntil('\n');
    nama.trim();         // buang sisa tanda Enter
    nama.toUpperCase();  // "ani" menjadi "ANI"
    Serial.println("Mengirim: " + nama);

    for (int i = 0; i < nama.length(); i++) {
      char huruf = nama.charAt(i);
      if (huruf == ' ') {
        delay(JEDA_KATA);  // spasi antarkata
      } else {
        kirimHuruf(huruf);
      }
    }
    Serial.println("Selesai. Ketik nama lain:");
  }
}
