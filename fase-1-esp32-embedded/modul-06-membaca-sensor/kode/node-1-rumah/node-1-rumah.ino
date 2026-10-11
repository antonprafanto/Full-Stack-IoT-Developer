// Node 1 "Rumah" - firmware v0.3.0 (diperbarui di Modul 6)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v0.3.0: kelima sensor Node 1 dibaca sungguhan (DHT22, LDR, sensor tanah,
// PIR, HC-SR04), ditambah dua aturan otomatis versi lokal pertama:
// "siram otomatis" (ditolak kalau air tandon terlalu sedikit) dan "lampu otomatis".
// Aktuator tetap bisa dicoba lewat Serial Monitor, misalnya:
// lampu on, kipas off, pompa 3, tirai 90, bunyi, status.
//
// Library: ESP32Servo versi 3.2.1, DHT sensor library versi 1.4.7
// (ikut terpasang: Adafruit Unified Sensor versi 1.1.15).

#include <ESP32Servo.h>
#include <DHT.h>
#include <esp_system.h>  // esp_reset_reason()

const String VERSI_FIRMWARE = "0.3.0";

// ---------- Peta pin kanonik Node 1 (salinan dari PETA-PIN.md) ----------
const int PIN_LED_STATUS = 4;    // Modul 2
const int PIN_TOMBOL = 13;       // Modul 5, INPUT_PULLUP
const int PIN_RELAY_LAMPU = 32;  // Modul 5, relay aktif LOW
const int PIN_RELAY_KIPAS = 33;  // Modul 5, relay aktif LOW
const int PIN_POMPA = 25;        // Modul 5, gerbang MOSFET IRLZ44N
const int PIN_SERVO_TIRAI = 26;  // Modul 5, servo SG90
const int PIN_BUZZER = 27;       // Modul 5, buzzer pasif
const int PIN_DHT = 14;          // Modul 6, DHT22
const int PIN_LDR = 36;          // Modul 6, VP: LDR (ADC1)
const int PIN_TANAH = 39;        // Modul 6, VN: sensor tanah kapasitif (ADC1)
const int PIN_PIR = 34;          // Modul 6, PIR
const int PIN_TRIG = 15;         // Modul 6, HC-SR04 TRIG
const int PIN_ECHO = 35;         // Modul 6, HC-SR04 ECHO lewat pembagi tegangan
// Dipesan untuk modul berikutnya (jangan dipakai untuk hal lain):
// Modul 7: I2C SDA = 21, SCL = 22; microSD SCK = 18, MISO = 19, MOSI = 23, CS = 5
// Modul 15: RS-485 RX = 16, TX = 17, DE/RE = 2

const int JEDA_PANTUL = 30;           // milidetik, untuk debounce tombol
const int JEDA_PUTARAN = 10;          // loop() berputar kira-kira tiap 10 milidetik
const int PUTARAN_PER_LAPORAN = 200;  // 200 x 10 ms = kira-kira 2 detik

// ---------- Modul 6: hasil kalibrasimu (Praktik 3 dan 6) ----------
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

// ---------- Modul 6: aturan otomatis versi lokal ----------
const int AMBANG_TANAH_SIRAM = 30;  // Lampiran A: "tanah_siram"
const int LEVEL_AIR_MINIMUM = 20;   // pompa ditolak kalau isi tandon di bawah 20 %
const int DETIK_SIRAM = 3;          // lama pompa menyala saat menyiram otomatis
const int JEDA_SIRAM = 15;          // sesudah mencoba menyiram, tunggu 15 laporan (kira-kira 30 detik)
const int AMBANG_GELAP = 1000;      // cahaya di bawah ini dianggap gelap

// Formulir data sensor. Nama kolomnya PERSIS sesuai kontrak data (Lampiran A Silabus).
struct BacaanSensor {
  float suhu;      // derajat Celsius; NAN kalau DHT22 gagal dibaca
  int kelembapan;  // persen; -1 kalau DHT22 gagal dibaca
  int cahaya;      // 0 (gelap gulita) sampai 4095 (sangat terang)
  int tanah;       // persen: 0 = kering seperti di udara, 100 = basah seperti di air
  bool gerak;      // true kalau PIR melihat gerakan
  int level_air;   // persen isi tandon; -1 kalau gema HC-SR04 tidak kembali
};

// Keadaan aktuator saat ini (nanti dikirim di "ack", Lampiran A)
bool lampuMenyala = false;
bool kipasMenyala = false;
int sudutTirai = 90;

bool lampuDariOtomatis = false;  // true kalau lampu dinyalakan oleh lampuOtomatis()
int sisaJedaSiram = 0;           // berapa laporan lagi sebelum boleh mencoba menyiram lagi

Servo servoTirai;
DHT dht(PIN_DHT, DHT22);
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
  lampuDariOtomatis = false;  // anggap perintah manual; lampuOtomatis() menandai miliknya sendiri
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

// Modul 6: pompa hanya menyala kalau air tandon cukup. Tandon diukur tepat sebelum pompa menyala.
void jalankanPompa(int detik) {
  detik = constrain(detik, 1, 10);  // batas aman: 1-10 detik
  delay(60);  // lembar data HC-SR04: jeda minimal 60 ms sejak ukuran sebelumnya (Konsep 10)
  int levelAir = bacaLevelAir();
  if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
    Serial.print("pompa DITOLAK: air tandon ");
    if (levelAir < 0) {
      Serial.println("tidak terbaca");
    } else {
      Serial.print("tinggal ");
      Serial.print(levelAir);
      Serial.println(" %");
    }
    return;
  }
  Serial.print("pompa menyala ");
  Serial.print(detik);
  Serial.println(" detik...");
  digitalWrite(PIN_POMPA, HIGH);
  delay(detik * 1000);  // untuk sementara masih memblokir; Modul 8 membuatnya tanpa delay()
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

  // Modul 6: sensor
  dht.begin();
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
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

// ---------- Modul 6: membaca sensor sungguhan ----------
// Rata-rata 20 bacaan analog berturut-turut supaya derau teredam.
int bacaAnalogRata(int pin) {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(pin);
    delay(2);
  }
  return jumlah / 20;
}

int bacaCahaya() {
  return 4095 - bacaAnalogRata(PIN_LDR);  // dibalik: makin terang, makin besar
}

int bacaTanahPersen() {
  int persen = map(bacaAnalogRata(PIN_TANAH), TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

// Mengukur jarak satu kali, dalam cm. Menjawab -1 kalau gemanya tidak kembali.
float ukurJarakCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);
  if (durasi == 0) {
    return -1;
  }
  return durasi / 58.0;
}

int bacaLevelAir() {
  float jarak = ukurJarakCm();
  if (jarak < 0) {
    return -1;  // tidak diketahui
  }
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

BacaanSensor bacaSensor() {
  BacaanSensor b;
  b.suhu = dht.readTemperature();
  float kelembapan = dht.readHumidity();
  if (isnan(kelembapan)) {
    b.kelembapan = -1;
  } else {
    b.kelembapan = round(kelembapan);  // dibulatkan ke bilangan bulat terdekat
  }
  b.cahaya = bacaCahaya();
  b.tanah = bacaTanahPersen();
  b.gerak = digitalRead(PIN_PIR) == HIGH;
  b.level_air = bacaLevelAir();
  return b;
}

// ---------- Modul 7: menampilkan bacaan di layar OLED ----------
void tampilkanDiLayar(BacaanSensor b) {
  // belum diisi
}

// ---------- Modul 6 & 19: aturan otomatis (siram, lampu, kipas) ----------
void siramOtomatis(BacaanSensor b) {
  if (sisaJedaSiram > 0) {  // baru saja mencoba menyiram: tunggu dulu
    sisaJedaSiram--;
    return;
  }
  if (b.tanah < AMBANG_TANAH_SIRAM) {
    Serial.print("Tanah kering (");
    Serial.print(b.tanah);
    Serial.print(" %): ");
    jalankanPompa(DETIK_SIRAM);  // pengaman tandon ada di dalam jalankanPompa()
    sisaJedaSiram = JEDA_SIRAM;  // berhasil atau ditolak, jangan coba lagi selama kira-kira 30 detik
  }
}

void lampuOtomatis(BacaanSensor b) {
  bool gelap = b.cahaya < AMBANG_GELAP;
  if (b.gerak && gelap && !lampuMenyala) {
    Serial.println("Ada gerakan di tempat gelap: lampu otomatis menyala.");
    aturLampu(true);
    lampuDariOtomatis = true;
  }
  if (!b.gerak && lampuDariOtomatis) {  // hanya mematikan lampu yang ia nyalakan sendiri
    Serial.println("Sepi: lampu otomatis padam.");
    aturLampu(false);
  }
}

void kendalikanAktuator(BacaanSensor b) {
  siramOtomatis(b);
  lampuOtomatis(b);
  // Modul 19 menambahkan kipas otomatis (Lampiran A: "suhu_kipas_on")
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

// Mencetak angka, atau "--" kalau nilainya tidak sah (kurang dari 0).
void cetakNilai(int nilai) {
  if (nilai < 0) {
    Serial.print("--");
  } else {
    Serial.print(nilai);
  }
}

// Mencetak bacaan ke Serial Monitor (alat bantu kita sendiri).
void cetakBacaan(BacaanSensor b) {
  Serial.print("suhu=");
  if (isnan(b.suhu)) {
    Serial.print("--");
  } else {
    Serial.print(b.suhu, 1);
  }
  Serial.print(" C  kelembapan=");
  cetakNilai(b.kelembapan);
  Serial.print(" %  cahaya=");
  Serial.print(b.cahaya);
  Serial.print("  tanah=");
  Serial.print(b.tanah);
  Serial.print(" %  gerak=");
  if (b.gerak) {
    Serial.print("ya");
  } else {
    Serial.print("tidak");
  }
  Serial.print("  level_air=");
  cetakNilai(b.level_air);
  Serial.println(" %");
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
