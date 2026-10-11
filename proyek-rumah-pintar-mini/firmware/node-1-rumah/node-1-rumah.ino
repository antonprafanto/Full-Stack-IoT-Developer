// Node 1 "Rumah" - firmware v0.4.0 (diperbarui di Modul 7)
// Proyek benang merah: Rumah Pintar Mini.
//
// Baru di v0.4.0: layar OLED menampilkan semua bacaan kira-kira setiap 2 detik, dan (opsional)
// kira-kira setiap 30 detik bacaan dicatat ke kartu microSD sebagai satu baris CSV.
// Tanpa layar atau tanpa kartu, Node 1 tetap berjalan seperti v0.3.0.
// Aktuator tetap bisa dicoba lewat Serial Monitor, misalnya:
// lampu on, kipas off, pompa 3, tirai 90, bunyi, status.
//
// Library: ESP32Servo versi 3.2.1, DHT sensor library versi 1.4.7
// (ikut terpasang: Adafruit Unified Sensor versi 1.1.15), Adafruit SSD1306 versi 2.5.17
// (ikut terpasang: Adafruit GFX Library versi 1.12.6 dan Adafruit BusIO versi 1.17.4).
// Wire, SPI, dan SD sudah ikut paket esp32.

#include <ESP32Servo.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <SD.h>
#include <esp_system.h>  // esp_reset_reason()

const String VERSI_FIRMWARE = "0.4.0";

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
const int PIN_SDA = 21;          // Modul 7, I2C: layar OLED
const int PIN_SCL = 22;          // Modul 7, I2C: layar OLED
const int PIN_SD_CS = 5;         // Modul 7, microSD (opsional); SCK = 18, MISO = 19, MOSI = 23
// Dipesan untuk modul berikutnya (jangan dipakai untuk hal lain):
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

// ---------- Modul 7: layar OLED dan (opsional) kartu microSD ----------
const byte ALAMAT_LAYAR = 0x3C;               // alamat layar OLED di bus I2C
const int LAPORAN_PER_CATATAN = 15;           // 15 laporan x 2 detik = kira-kira 30 detik
const char* NAMA_FILE_CATATAN = "/node1.csv";  // nama file di kartu, selalu diawali garis miring
Adafruit_SSD1306 layar(128, 64, &Wire, -1);   // lebar 128, tinggi 64, lewat bus I2C, tanpa kaki reset
bool layarAda = false;                        // true kalau layar menjawab di alamat 0x3C
bool kartuAda = false;                        // true kalau kartu microSD terbaca saat menyala
int hitungLaporan = 0;                        // laporan sejak baris CSV terakhir

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
// Ikon 8 x 8 titik: 1 = titik menyala, 0 = padam.
const unsigned char IKON_MATAHARI[] = {
  0b00011000,
  0b01000010,
  0b00111100,
  0b10111101,
  0b10111101,
  0b00111100,
  0b01000010,
  0b00011000,
};
const unsigned char IKON_TANAMAN[] = {
  0b11000011,
  0b01100110,
  0b00111100,
  0b00011000,
  0b00011000,
  0b11111111,
  0b01111110,
  0b00111100,
};
const unsigned char IKON_TANDON[] = {
  0b10000001,
  0b10000001,
  0b10000001,
  0b11011011,
  0b11111111,
  0b11111111,
  0b11111111,
  0b01111110,
};
const unsigned char IKON_ORANG[] = {
  0b00011000,
  0b00011000,
  0b01111110,
  0b00011000,
  0b00011000,
  0b00100100,
  0b01000010,
  0b01000010,
};

// Mencari layar di bus I2C, lalu menyalakannya. Kalau layar tidak ada, program tetap berjalan.
void siapkanLayar() {
  Wire.begin(PIN_SDA, PIN_SCL);
  Wire.beginTransmission(ALAMAT_LAYAR);
  layarAda = Wire.endTransmission() == 0;  // ada yang menjawab di 0x3C?
  if (!layarAda) {
    Serial.println("Layar OLED tidak ditemukan di 0x3C. Node 1 tetap jalan tanpa layar.");
    return;
  }
  layar.begin(SSD1306_SWITCHCAPVCC, ALAMAT_LAYAR);
  layar.cp437(true);  // tabel huruf CP437 yang benar supaya nomor 248 = tanda derajat
  layar.setTextColor(SSD1306_WHITE);
  layar.clearDisplay();
  layar.setTextSize(1);
  layar.setCursor(0, 0);
  layar.println("Node 1 Rumah");
  layar.println("menunggu bacaan...");
  layar.display();
}

// Menulis teks rata kanan: huruf terakhirnya berakhir tepat sebelum x = kanan.
void tulisRataKanan(String teks, int kanan, int y, int ukuran) {
  layar.setTextSize(ukuran);
  layar.setCursor(kanan - teks.length() * 6 * ukuran, y);  // satu huruf = 6 titik x ukuran
  layar.print(teks);
}

// Batang persen: bingkai selebar "lebar" titik, isinya sepanjang persen. Persen di bawah 0 = kosong.
void gambarBatang(int x, int y, int lebar, int persen) {
  layar.drawRect(x, y, lebar, 8, SSD1306_WHITE);
  if (persen > 0) {
    layar.fillRect(x + 2, y + 2, (lebar - 4) * persen / 100, 4, SSD1306_WHITE);
  }
}

// Satu baris layar: ikon, nama, angka rata kanan, lalu batang persen.
// Tanda * pada "const unsigned char* ikon" berarti fungsi ini menerima ikon mana pun yang dikirim
// (mirip const char* untuk teks di Modul 3). Biarkan apa adanya.
void barisBatang(int y, const unsigned char* ikon, String nama, String angka, int persen) {
  layar.drawBitmap(0, y, ikon, 8, 8, SSD1306_WHITE);
  layar.setTextSize(1);
  layar.setCursor(11, y);
  layar.print(nama);
  tulisRataKanan(angka, 82, y, 1);
  gambarBatang(86, y, 42, persen);
}

void tampilkanDiLayar(BacaanSensor b) {
  if (!layarAda) {
    return;
  }
  layar.clearDisplay();

  // Baris atas: suhu di kiri dan kelembapan di kanan. Angkanya besar, satuannya kecil.
  String teksSuhu = "--.-";
  if (!isnan(b.suhu)) {
    teksSuhu = String(b.suhu, 1);
  }
  layar.setTextSize(2);
  layar.setCursor(0, 0);
  layar.print(teksSuhu);
  layar.setTextSize(1);
  layar.write(248);  // tanda derajat
  layar.print("C");

  String teksLembap = "--";
  if (b.kelembapan >= 0) {
    teksLembap = String(b.kelembapan);
  }
  tulisRataKanan(teksLembap, 122, 0, 2);
  layar.setTextSize(1);
  layar.setCursor(122, 0);
  layar.print("%");

  layar.drawFastHLine(0, 17, 128, SSD1306_WHITE);  // garis pemisah

  // Tiga baris dengan batang persen. Cahaya 0-4095 diubah dulu menjadi 0-100 untuk batangnya.
  barisBatang(21, IKON_MATAHARI, "Cahaya", String(b.cahaya), b.cahaya * 100 / 4095);
  barisBatang(32, IKON_TANAMAN, "Tanah", String(b.tanah) + "%", b.tanah);
  String teksAir = "--";
  if (b.level_air >= 0) {
    teksAir = String(b.level_air) + "%";
  }
  barisBatang(43, IKON_TANDON, "Air", teksAir, b.level_air);

  // Baris gerak: dibalik (latar putih) kalau ada gerakan supaya langsung menarik perhatian.
  if (b.gerak) {
    layar.fillRect(0, 53, 128, 10, SSD1306_WHITE);
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_BLACK);
    layar.setTextColor(SSD1306_BLACK);
    layar.setCursor(11, 54);
    layar.print("Gerak: ADA ORANG");
    layar.setTextColor(SSD1306_WHITE);
  } else {
    layar.drawBitmap(0, 54, IKON_ORANG, 8, 8, SSD1306_WHITE);
    layar.setCursor(11, 54);
    layar.print("Gerak: sepi");
  }

  layar.display();
}

// ---------- Modul 7 (opsional): catatan CSV di kartu microSD ----------
// Kalau kartu terbaca saat menyala, pencatatan diaktifkan. Tanpa kartu, Node 1 tetap berjalan.
void siapkanKartu() {
  kartuAda = SD.begin(PIN_SD_CS);
  if (!kartuAda) {
    Serial.println("Kartu microSD tidak terbaca: catatan CSV dimatikan.");
    return;
  }
  if (!SD.exists(NAMA_FILE_CATATAN)) {
    File file = SD.open(NAMA_FILE_CATATAN, FILE_WRITE);
    file.println("uptime_s,suhu,kelembapan,cahaya,tanah,gerak,level_air");  // baris judul kolom
    file.close();
  }
  Serial.println("Kartu microSD siap: bacaan dicatat ke node1.csv setiap kira-kira 30 detik.");
}

// Satu baris CSV setiap LAPORAN_PER_CATATAN laporan. Bacaan yang gagal ditulis sebagai sel kosong.
void catatKeKartu(BacaanSensor b) {
  if (!kartuAda) {
    return;
  }
  hitungLaporan++;
  if (hitungLaporan < LAPORAN_PER_CATATAN) {
    return;
  }
  hitungLaporan = 0;

  String baris = String(millis() / 1000) + ",";  // uptime_s: detik sejak papan menyala
  if (!isnan(b.suhu)) {
    baris += String(b.suhu, 1);
  }
  baris += ",";
  if (b.kelembapan >= 0) {
    baris += String(b.kelembapan);
  }
  baris += "," + String(b.cahaya) + "," + String(b.tanah) + ",";
  if (b.gerak) {
    baris += "true";
  } else {
    baris += "false";
  }
  baris += ",";
  if (b.level_air >= 0) {
    baris += String(b.level_air);
  }

  File file = SD.open(NAMA_FILE_CATATAN, FILE_APPEND);  // APPEND = menambah di akhir file
  if (!file) {
    Serial.println("Gagal menulis ke kartu microSD (tercabut?). Catatan CSV dihentikan.");
    kartuAda = false;
    return;
  }
  file.println(baris);
  file.close();  // baru setelah ditutup, isinya benar-benar tersimpan di kartu
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
  siapkanLayar();  // Modul 7
  siapkanKartu();  // Modul 7 (opsional)
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
    catatKeKartu(bacaan);
    kendalikanAktuator(bacaan);
    kirimData(bacaan);
    kedipStatus();
  }
  delay(JEDA_PUTARAN);
}
