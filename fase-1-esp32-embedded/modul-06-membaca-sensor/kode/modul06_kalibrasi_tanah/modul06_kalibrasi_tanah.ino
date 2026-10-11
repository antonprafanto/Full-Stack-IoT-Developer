// Modul 6 - Praktik 3: kalibrasi sensor kelembapan tanah kapasitif
// Sensor di VN (GPIO 39). Makin basah, makin KECIL angka mentahnya.
// Cara kalibrasi: (1) catat angka mentah saat sensor di udara -> KERING;
// (2) catat angka mentah saat sensor dicelup air sampai garis batas -> BASAH;
// (3) tulis keduanya di bawah ini, lalu unggah lagi. Hasilnya: udara 0 %, air 100 %.

const int PIN_TANAH = 39;    // VN: sensor tanah (peta pin kanonik)
const int KERING = 3000;     // angka mentah di udara (ganti dengan catatanmu)
const int BASAH = 1300;      // angka mentah di air (ganti dengan catatanmu)
const int JUMLAH_BACA = 20;  // banyaknya bacaan yang dirata-ratakan

// Membaca sensor 20 kali berturut-turut, lalu mengembalikan rata-ratanya.
int bacaTanahMentah() {
  long jumlah = 0;
  for (int i = 0; i < JUMLAH_BACA; i++) {
    jumlah += analogRead(PIN_TANAH);
    delay(5);
  }
  return jumlah / JUMLAH_BACA;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Kalibrasi sensor tanah: catat angka mentah di udara dan di air.");
}

void loop() {
  int mentah = bacaTanahMentah();
  int persen = map(mentah, KERING, BASAH, 0, 100);  // KERING -> 0, BASAH -> 100
  int tanah = constrain(persen, 0, 100);            // pagari supaya tetap 0-100

  Serial.print("mentah=");
  Serial.print(mentah);
  Serial.print("  hasil map=");
  Serial.print(persen);
  Serial.print("  tanah=");
  Serial.print(tanah);
  Serial.println(" %");
  delay(1000);
}
