// Modul 5 - Praktik 8: "detektif restart" untuk uji catu daya
// Saat menyala, sketsa ini mencetak ALASAN restart terakhir, dengan kata yang sama
// seperti kolom reset_reason di Lampiran A Silabus: POWERON, BROWNOUT, SW, PANIC,
// WDT, DEEPSLEEP, atau UNKNOWN.
// Setelah itu relay kipas (D33) menyala dan mati bergantian tiap 3 detik.

#include <esp_system.h>  // untuk esp_reset_reason()

const int PIN_LED = 4;           // LED status
const int PIN_RELAY_KIPAS = 33;  // relay kipas, aktif LOW
const int JEDA = 3000;           // milidetik

int putaran = 0;  // dihitung ulang dari 0 setiap kali ESP32 restart

// Menerjemahkan kode alasan restart menjadi kata yang mudah dibaca.
String alasanReset() {
  esp_reset_reason_t alasan = esp_reset_reason();
  if (alasan == ESP_RST_POWERON) {
    return "POWERON";  // baru dinyalakan, tombol EN ditekan, atau program selesai diunggah
  }
  if (alasan == ESP_RST_BROWNOUT) {
    return "BROWNOUT";  // tegangan sempat anjlok terlalu rendah
  }
  if (alasan == ESP_RST_SW) {
    return "SW";  // program sendiri yang meminta restart
  }
  if (alasan == ESP_RST_PANIC) {
    return "PANIC";  // program mogok (crash)
  }
  if (alasan == ESP_RST_INT_WDT || alasan == ESP_RST_TASK_WDT || alasan == ESP_RST_WDT) {
    return "WDT";  // "penjaga" me-restart program yang macet (Modul 8)
  }
  if (alasan == ESP_RST_DEEPSLEEP) {
    return "DEEPSLEEP";  // bangun dari tidur dalam (deep sleep, Modul 9)
  }
  return "UNKNOWN";  // alasan lain yang jarang terjadi
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  digitalWrite(PIN_RELAY_KIPAS, HIGH);  // relay melepas: kipas mati dulu

  String alasan = alasanReset();
  Serial.println();
  Serial.println("Alasan restart terakhir: " + alasan);
  if (alasan == "BROWNOUT") {
    Serial.println(">> Tegangan sempat anjlok! Pindahkan beban (kipas, pompa, servo) ke MB102.");
  }
}

void loop() {
  putaran++;
  if (putaran % 2 == 1) {
    digitalWrite(PIN_RELAY_KIPAS, LOW);  // kipas jalan
    digitalWrite(PIN_LED, HIGH);
    Serial.print("Putaran ");
    Serial.print(putaran);
    Serial.println(": kipas NYALA");
  } else {
    digitalWrite(PIN_RELAY_KIPAS, HIGH);  // kipas berhenti
    digitalWrite(PIN_LED, LOW);
    Serial.print("Putaran ");
    Serial.print(putaran);
    Serial.println(": kipas MATI");
  }
  delay(JEDA);
}
