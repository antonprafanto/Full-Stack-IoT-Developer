// Modul 3 - Kemenangan Cepat: program pertamamu yang "bicara"
// Jalankan di Wokwi (proyek ESP32 baru) atau di papan asli.
// Hasilnya muncul di Serial Monitor.

String nama = "Ani";   // teks: tulis namamu di antara dua tanda petik
int umur = 17;         // bilangan bulat: umurmu dalam tahun

void setup() {
  Serial.begin(115200);  // buka jalur bicara ke laptop, kecepatan 115200
  delay(500);            // beri waktu sejenak sebelum mulai bicara
  Serial.println();      // satu baris kosong supaya rapi

  Serial.println("Halo, ESP32!");
  Serial.println("Namaku " + nama + ".");

  Serial.print("Umurku ");
  Serial.print(umur);
  Serial.println(" tahun.");

  Serial.print("Berarti aku sudah hidup kira-kira ");
  Serial.print(umur * 365);  // ESP32 yang menghitung: umur x 365
  Serial.println(" hari.");
}

void loop() {
  // Sengaja dikosongkan: semua pesan cukup dikirim sekali di setup().
}
