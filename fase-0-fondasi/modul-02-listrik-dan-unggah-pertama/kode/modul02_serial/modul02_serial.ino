// Modul 2 - Praktik 4: "mengobrol" dengan ESP32 lewat Serial Monitor
// Rangkaian sama dengan Praktik 3 (LED merah di D4). LED biru bawaan papan ada di GPIO 2.
// Ketik 1 lalu Enter di Serial Monitor -> LED merah nyala. Ketik 0 -> LED padam.

const int PIN_LED = 4;          // LED merah di breadboard (tulisan "D4" di papan)
const int PIN_LED_BAWAAN = 2;   // LED biru kecil yang sudah tertanam di papan

int detikHidup = 0;             // penghitung: sudah berapa detik ESP32 menyala

void setup() {
  pinMode(PIN_LED, OUTPUT);         // pin D4 sebagai keluaran
  pinMode(PIN_LED_BAWAAN, OUTPUT);  // pin 2 sebagai keluaran
  Serial.begin(115200);             // buka jalur bicara ke laptop, kecepatan 115200
  delay(500);                       // beri waktu sejenak sebelum mulai bicara
  Serial.println();                 // satu baris kosong supaya rapi
  Serial.println("=== ESP32 siap! ===");
  Serial.println("Ketik 1 lalu Enter untuk menyalakan LED, 0 untuk memadamkan.");
}

void loop() {
  // 1) Adakah huruf yang dikirim dari laptop?
  if (Serial.available() > 0) {           // ada data yang masuk
    char perintah = Serial.read();        // ambil satu huruf
    if (perintah == '1') {                // kalau hurufnya '1' ...
      digitalWrite(PIN_LED, HIGH);        // ... nyalakan LED merah
      Serial.println("Perintah 1 diterima: LED menyala");
    } else if (perintah == '0') {         // kalau hurufnya '0' ...
      digitalWrite(PIN_LED, LOW);         // ... padamkan LED merah
      Serial.println("Perintah 0 diterima: LED padam");
    }
    // huruf lain (termasuk tombol Enter) diabaikan saja
  }

  // 2) Setiap putaran: kedipkan LED biru bawaan dan laporkan umur hidup
  digitalWrite(PIN_LED_BAWAAN, HIGH);  // LED biru nyala sebentar ...
  delay(100);                          // ... selama 0,1 detik
  digitalWrite(PIN_LED_BAWAAN, LOW);   // lalu padam ...
  delay(900);                          // ... selama 0,9 detik (total 1 detik)
  detikHidup = detikHidup + 1;         // tambah satu detik
  Serial.print("Hidup selama ");
  Serial.print(detikHidup);
  Serial.println(" detik");
}
