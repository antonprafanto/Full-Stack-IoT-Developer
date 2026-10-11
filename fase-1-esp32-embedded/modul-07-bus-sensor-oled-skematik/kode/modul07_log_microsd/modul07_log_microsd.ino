// Modul 7 - Praktik 5 (opsional): mencatat bacaan ke kartu microSD sebagai file CSV
// Modul microSD di bus SPI: SCK ke D18, MISO ke D19, MOSI ke D23, CS ke D5.
// Sensor cahaya (LDR) tetap di VP seperti Modul 6.
// Tidak perlu memasang library apa pun: SD dan SPI sudah ikut paket esp32.

#include <SPI.h>
#include <SD.h>

const int PIN_SD_CS = 5;    // D5: "pilih aku" untuk kartu microSD (peta pin kanonik)
const int PIN_LDR = 36;     // VP: LDR (peta pin kanonik)
const char* NAMA_FILE = "/catatan.csv";  // nama file di kartu, selalu diawali garis miring
const int DETIK_PER_CATATAN = 5;         // satu baris setiap 5 detik

bool kartuSiap = false;

// Mencetak seluruh isi file ke Serial Monitor.
void cetakIsiFile() {
  File file = SD.open(NAMA_FILE, FILE_READ);
  if (!file) {
    Serial.println("(file belum ada)");
    return;
  }
  while (file.available()) {
    Serial.write(file.read());  // salin huruf demi huruf, apa adanya
  }
  file.close();
}

// Menambahkan satu baris di akhir file. Menjawab true kalau berhasil.
bool tambahBaris(String baris) {
  File file = SD.open(NAMA_FILE, FILE_APPEND);  // APPEND = menambah di akhir, isi lama tidak hilang
  if (!file) {
    return false;
  }
  file.println(baris);
  file.close();  // WAJIB: baru setelah ditutup, isinya benar-benar tersimpan di kartu
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  if (!SD.begin(PIN_SD_CS)) {
    Serial.println("Kartu microSD tidak terbaca! Periksa kartunya (FAT32), keenam kabel, dan daya modul.");
    return;  // kartuSiap tetap false, jadi loop() tidak mencoba menulis
  }
  kartuSiap = true;
  Serial.print("Kartu terbaca, ukurannya ");
  Serial.print(SD.cardSize() / (1024 * 1024));
  Serial.println(" MB.");

  if (!SD.exists(NAMA_FILE)) {
    tambahBaris("uptime_s,cahaya");  // baris pertama CSV = nama-nama kolom
    Serial.println("File baru dibuat: catatan.csv");
  }
  Serial.println("---- isi catatan.csv saat ini ----");
  cetakIsiFile();
  Serial.println("---- akhir file ----");
}

void loop() {
  if (!kartuSiap) {  // kartu belum terbaca: ingatkan setiap 5 detik, kalau-kalau pesan di setup() terlewat
    Serial.println("Kartu belum terbaca. MB102 baru dinyalakan? Tekan EN. Tetap gagal? Matikan MB102, cabut USB, lalu periksa kartu dan kabel.");
    delay(5000);
    return;
  }
  delay(DETIK_PER_CATATAN * 1000);
  unsigned long detik = millis() / 1000;          // detik sejak papan menyala
  int cahaya = 4095 - analogRead(PIN_LDR);        // dibalik seperti Modul 6: makin terang, makin besar
  String baris = String(detik) + "," + String(cahaya);
  if (tambahBaris(baris)) {
    Serial.print("ditulis: ");
    Serial.println(baris);
  } else {
    Serial.println("Gagal menulis! Kartunya tercabut?");
  }
}
