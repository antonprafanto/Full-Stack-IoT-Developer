// Node 1 "Rumah" - firmware v0.2.0 (diperbarui di Modul 5)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v0.2.0: semua aktuator Node 1 terpasang di pin kanonik (lihat PETA-PIN.md):
// relay lampu, relay kipas, pompa (lewat MOSFET), servo tirai, buzzer, dan tombol manual.
// Tombol manual menyalakan/mematikan lampu. Aktuator lain bisa dicoba lewat
// Serial Monitor, misalnya: lampu on, kipas off, pompa 3, tirai 90, bunyi, status.
// Sensor masih berupa angka contoh; Modul 6-7 menggantinya dengan bacaan sungguhan.
//
// Library: ESP32Servo versi 3.2.1.

#include <ESP32Servo.h>
#include <esp_system.h>  // esp_reset_reason()

const String VERSI_FIRMWARE = "0.2.0";

// ---------- Peta pin kanonik Node 1 (salinan dari PETA-PIN.md) ----------
const int PIN_LED_STATUS = 4;    // Modul 2
const int PIN_TOMBOL = 13;       // Modul 5, INPUT_PULLUP
const int PIN_RELAY_LAMPU = 32;  // Modul 5, relay aktif LOW
const int PIN_RELAY_KIPAS = 33;  // Modul 5, relay aktif LOW
const int PIN_POMPA = 25;        // Modul 5, gerbang MOSFET IRLZ44N
const int PIN_SERVO_TIRAI = 26;  // Modul 5, servo SG90
const int PIN_BUZZER = 27;       // Modul 5, buzzer pasif
// Dipesan untuk modul berikutnya (jangan dipakai untuk hal lain):
// Modul 6: DHT22 = 14, LDR = 36 (VP), tanah = 39 (VN), PIR = 34, HC-SR04 TRIG = 15, ECHO = 35
// Modul 7: I2C SDA = 21, SCL = 22; microSD SCK = 18, MISO = 19, MOSI = 23, CS = 5
// Modul 15: RS-485 RX = 16, TX = 17, DE/RE = 2

const int JEDA_PANTUL = 30;           // milidetik, untuk debounce tombol
const int JEDA_PUTARAN = 10;          // loop() berputar kira-kira tiap 10 milidetik
const int PUTARAN_PER_LAPORAN = 200;  // 200 x 10 ms = kira-kira 2 detik

// Formulir data sensor. Nama kolomnya mengikuti kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius
  int kelembapan;  // persen
  int cahaya;      // 0-4095
  bool gerak;      // ada gerakan?
};

// Keadaan aktuator saat ini (nanti dikirim di "ack", Lampiran A)
bool lampuMenyala = false;
bool kipasMenyala = false;
int sudutTirai = 90;

Servo servoTirai;
int hitungPutaran = 0;

// ---------- Modul 5: alasan restart terakhir (nama sama dengan Lampiran A) ----------
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

// ---------- Modul 5: aktuator ----------
void aturLampu(bool nyala) {
  lampuMenyala = nyala;
  if (nyala) {
    digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
  } else {
    digitalWrite(PIN_RELAY_LAMPU, HIGH);
  }
}

void aturKipas(bool nyala) {
  kipasMenyala = nyala;
  if (nyala) {
    digitalWrite(PIN_RELAY_KIPAS, LOW);
  } else {
    digitalWrite(PIN_RELAY_KIPAS, HIGH);
  }
}

void jalankanPompa(int detik) {
  detik = constrain(detik, 1, 10);  // batas aman: 1-10 detik
  digitalWrite(PIN_POMPA, HIGH);
  delay(detik * 1000);  // sementara memblokir; Modul 8 membuatnya tanpa delay()
  digitalWrite(PIN_POMPA, LOW);
}

void aturTirai(int sudut) {
  sudutTirai = constrain(sudut, 0, 180);
  servoTirai.write(sudutTirai);
}

void bunyikanBuzzer() {
  ledcWriteTone(PIN_BUZZER, 2000);  // 2.000 Hz
  delay(150);
  ledcWriteTone(PIN_BUZZER, 0);
}

// ---------- Modul 5: menyiapkan semua pin ----------
void siapkanPin() {
  pinMode(PIN_LED_STATUS, OUTPUT);
  pinMode(PIN_TOMBOL, INPUT_PULLUP);

  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  aturLampu(false);  // segera matikan: pinMode(OUTPUT) baru saja membuat pin LOW (= relay menarik)
  aturKipas(false);

  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);

  // Servo dipasang SEBELUM buzzer: urutan ini mencegah keduanya berebut saluran PWM.
  servoTirai.setPeriodHertz(50);
  servoTirai.attach(PIN_SERVO_TIRAI, 500, 2400);
  aturTirai(sudutTirai);

  ledcAttach(PIN_BUZZER, 2000, 10);
}

// ---------- Modul 5: tombol manual dengan debounce ----------
// Menjawab true SATU kali untuk setiap tekanan sungguhan.
bool tombolDitekan() {
  if (digitalRead(PIN_TOMBOL) == HIGH) {  // tidak sedang ditekan
    return false;
  }
  delay(JEDA_PANTUL);                     // tunggu pantulan reda...
  if (digitalRead(PIN_TOMBOL) == HIGH) {  // ...ternyata sudah lepas lagi: cuma gangguan
    return false;
  }
  while (digitalRead(PIN_TOMBOL) == LOW) {  // tunggu sampai jari diangkat
    delay(1);
  }
  delay(JEDA_PANTUL);  // tombol juga memantul saat dilepas
  return true;
}

String teksOnOff(bool nyala) {
  if (nyala) {
    return "on";
  }
  return "off";
}

void cetakStatus() {
  Serial.print("status: lampu=");
  Serial.print(teksOnOff(lampuMenyala));
  Serial.print(" kipas=");
  Serial.print(teksOnOff(kipasMenyala));
  Serial.print(" tirai=");
  Serial.println(sudutTirai);
}

// Menjawab true kalau teks BUKAN angka: toInt() memberi 0, padahal teksnya bukan "0" (cara Praktik 5).
bool bukanAngka(String teks) {
  return teks.toInt() == 0 && teks != "0";
}

// ---------- Modul 5: perintah lewat Serial Monitor (Modul 11 menggantinya dengan MQTT) ----------
void periksaPerintahSerial() {
  if (Serial.available() == 0) {
    return;
  }
  String perintah = Serial.readStringUntil('\n');
  perintah.trim();
  perintah.toLowerCase();

  if (perintah == "lampu on") {
    aturLampu(true);
  } else if (perintah == "lampu off") {
    aturLampu(false);
  } else if (perintah == "kipas on") {
    aturKipas(true);
  } else if (perintah == "kipas off") {
    aturKipas(false);
  } else if (perintah.startsWith("pompa ")) {
    String angka = perintah.substring(6);  // teks sesudah "pompa "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka detik. Contoh: pompa 3");
      return;
    }
    Serial.println("pompa menyala...");
    jalankanPompa(angka.toInt());
  } else if (perintah.startsWith("tirai ")) {
    String angka = perintah.substring(6);  // teks sesudah "tirai "
    if (bukanAngka(angka)) {
      Serial.println("Butuh angka sudut. Contoh: tirai 90");
      return;
    }
    aturTirai(angka.toInt());
  } else if (perintah == "bunyi") {
    bunyikanBuzzer();
  } else if (perintah != "status") {
    Serial.println("Perintah tidak dikenal. Contoh: lampu on, kipas off, pompa 3, tirai 90, bunyi, status");
    return;
  }
  cetakStatus();
}

// ---------- Modul 6-7: membaca sensor sungguhan ----------
BacaanSensor bacaSensor() {
  BacaanSensor b;
  b.suhu = 28.5;      // sementara angka contoh; Modul 6-7 menggantinya
  b.kelembapan = 71;  // dengan pembacaan sensor yang sebenarnya
  b.cahaya = 412;
  b.gerak = false;
  return b;
}

// ---------- Modul 7: menampilkan bacaan di layar OLED ----------
void tampilkanDiLayar(BacaanSensor b) {
  // belum diisi
}

// ---------- Modul 6 & 19: aturan otomatis (siram, lampu, kipas) ----------
void kendalikanAktuator(BacaanSensor b) {
  // belum diisi: Modul 6 menambahkan "siram otomatis" dan "lampu otomatis"
}

// ---------- Modul 10-11: mengirim bacaan ke server ----------
void kirimData(BacaanSensor b) {
  // belum diisi
}

// ---------- Modul 8: kedip status sebagai "detak jantung" ----------
void kedipStatus() {
  digitalWrite(PIN_LED_STATUS, HIGH);
  delay(50);
  digitalWrite(PIN_LED_STATUS, LOW);
}

// Mencetak bacaan ke Serial Monitor (alat bantu kita sendiri).
void cetakBacaan(BacaanSensor b) {
  Serial.print("suhu=");
  Serial.print(b.suhu, 1);
  Serial.print(" kelembapan=");
  Serial.print(b.kelembapan);
  Serial.print(" cahaya=");
  Serial.print(b.cahaya);
  Serial.print(" gerak=");
  if (b.gerak) {
    Serial.println("ya");
  } else {
    Serial.println("tidak");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Node 1 Rumah - firmware " + VERSI_FIRMWARE);
  Serial.println("Alasan restart terakhir: " + alasanReset());
  siapkanPin();
  cetakStatus();
}

void loop() {
  // Tombol dan Serial diperiksa di setiap putaran (kira-kira 100 kali per detik),
  // supaya tekanan tombol tidak terlewat. Laporan sensor cukup tiap kira-kira 2 detik.
  if (tombolDitekan()) {
    aturLampu(!lampuMenyala);
    cetakStatus();
  }
  periksaPerintahSerial();

  hitungPutaran++;
  if (hitungPutaran >= PUTARAN_PER_LAPORAN) {
    hitungPutaran = 0;
    BacaanSensor bacaan = bacaSensor();
    cetakBacaan(bacaan);
    tampilkanDiLayar(bacaan);
    kendalikanAktuator(bacaan);
    kirimData(bacaan);
    kedipStatus();
  }
  delay(JEDA_PUTARAN);
}
