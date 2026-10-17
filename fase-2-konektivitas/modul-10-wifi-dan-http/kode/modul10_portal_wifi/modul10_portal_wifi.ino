// Modul 10 - Praktik 4: portal WiFi seperti di hotel (WiFiManager)
// Tanpa secrets.h: nama dan kata sandi WiFi diisi lewat HP, lalu disimpan ESP32 di NVS.
// Untuk menghapus WiFi tersimpan: tahan tombol D13, tekan lalu lepas EN, dan lepaskan D13 setelah 2 detik.

#include <WiFi.h>
#include <WiFiManager.h>  // library baru minggu ini: WiFiManager by tzapu

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;
const char NAMA_PORTAL[] = "Node1-Latihan";  // nama WiFi sementara selama portal terbuka

// Dipanggil WiFiManager tepat saat portal dibuka.
void saatPortalDibuka(WiFiManager* wm) {
  Serial.printf("Portal terbuka. Sambungkan HP ke WiFi \"%s\", lalu buka http://192.168.4.1\n", NAMA_PORTAL);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);
  Serial.println();

  WiFiManager wm;
  wm.setDebugOutput(false);  // catatan WiFiManager sendiri tidak ikut dicetak
  wm.setAPCallback(saatPortalDibuka);
  wm.setConfigPortalTimeout(180);  // portal menutup sendiri setelah 3 menit tanpa diisi
  wm.setConnectTimeout(20);        // mencoba sebuah WiFi paling lama 20 detik

  if (digitalRead(PIN_TOMBOL) == LOW) {  // tombol ditahan saat menyala
    Serial.println("Tombol D13 ditahan: WiFi tersimpan dihapus.");
    wm.resetSettings();
  }

  Serial.println("Mencoba WiFi tersimpan...");
  digitalWrite(PIN_LED_STATUS, HIGH);  // LED menyala = sedang menyambung atau portal sedang terbuka
  // autoConnect(): pakai WiFi tersimpan; kalau belum ada atau gagal, buka portal.
  // Menunggu di sini sampai tersambung, atau sampai portal habis waktunya (boleh: hanya di setup()).
  bool tersambung = wm.autoConnect(NAMA_PORTAL);
  digitalWrite(PIN_LED_STATUS, LOW);

  if (!tersambung) {
    Serial.println("Portal ditutup tanpa WiFi. Tekan EN untuk mencoba lagi.");
    return;
  }
  Serial.printf("Tersambung ke \"%s\", IP %s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
  Serial.println("Nama dan kata sandi WiFi tersimpan di NVS. Tekan EN: kali ini langsung tersambung, tanpa portal.");
}

void loop() {
  // Kosong: semua pekerjaan praktik ini ada di setup().
}
