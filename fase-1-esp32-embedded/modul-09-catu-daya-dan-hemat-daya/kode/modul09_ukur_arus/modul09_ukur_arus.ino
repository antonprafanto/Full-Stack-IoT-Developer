// Modul 9 - Praktik 6: Node 1 menjadi alat ukur arus untuk papan kedua (calon Node 2)
// Papan Node 1 (dari USB laptop) membaca modul INA219 di bus I2C-nya, alamat 0x40:
//   VCC ke rel bawah (+) 3,3 V, GND ke rel bawah (-), SCL ke jalur 19, SDA ke jalur 20 (seperti BME280 di Modul 7).
//   Kaki VIN+ dan VIN- INA219 disisipkan di kabel 5 V dari MT3608 ke pin VIN papan kedua.
// Setiap detik: arus rata-rata, terkecil, dan terbesar. Setiap kali papan kedua bangun lagi: ringkasan satu siklus.
// Library: Adafruit INA219 1.2.3 (ikut terpasang: Adafruit BusIO 1.17.4).

#include <Wire.h>
#include <Adafruit_INA219.h>

const unsigned long JEDA_SAMPEL = 5;    // ms: satu bacaan arus setiap 5 ms (200 kali per detik)
const unsigned long JEDA_LAPOR = 1000;  // ms: satu baris laporan setiap 1 detik
const float AMBANG_BANGUN = 20.0;       // mA: di atas ini, papan kedua dianggap sedang bangun
const int SAMPEL_PASTI_BANGUN = 3;      // 3 bacaan berturut-turut di atas ambang = benar-benar bangun
const int SAMPEL_PASTI_TIDUR = 20;      // 20 bacaan berturut-turut (100 ms) di bawah ambang = benar-benar tidur

Adafruit_INA219 ina219;  // alamat bawaan 0x40
bool ina219Ada = false;

unsigned long waktuSampelTerakhir = 0;
unsigned long waktuLaporTerakhir = 0;

// Statistik untuk laporan setiap detik
float jumlahArusDetik = 0;
int banyakSampelDetik = 0;
float arusTerkecil = 0;
float arusTerbesar = 0;
float teganganTerakhir = 0;

// Siklus bangun-tidur papan kedua
bool sedangBangun = false;
int beruntunAtas = 0;     // berapa bacaan berturut-turut di atas ambang
int beruntunBawah = 0;    // berapa bacaan berturut-turut di bawah ambang
float jumlahArusBangun = 0;
unsigned long sampelBangun = 0;
float jumlahArusTidur = 0;
unsigned long sampelTidur = 0;

void cetakRingkasanSiklus() {
  float detikBangun = sampelBangun * JEDA_SAMPEL / 1000.0;
  float detikTidur = sampelTidur * JEDA_SAMPEL / 1000.0;
  float rataBangun = jumlahArusBangun / sampelBangun;
  float rataTidur = jumlahArusTidur / sampelTidur;
  float rataSiklus = (jumlahArusBangun + jumlahArusTidur) / (sampelBangun + sampelTidur);
  Serial.printf("SIKLUS: bangun %.2f detik, rata-rata %.1f mA | tidur %.2f detik, rata-rata %.2f mA | rata-rata siklus %.2f mA\n",
                detikBangun, rataBangun, detikTidur, rataTidur, rataSiklus);
}

void ambilSampel() {
  float arus = ina219.getCurrent_mA();
  teganganTerakhir = ina219.getBusVoltage_V();

  if (banyakSampelDetik == 0 || arus < arusTerkecil) {
    arusTerkecil = arus;
  }
  if (banyakSampelDetik == 0 || arus > arusTerbesar) {
    arusTerbesar = arus;
  }
  jumlahArusDetik += arus;
  banyakSampelDetik++;

  // Bangun atau tidur? Butuh beberapa bacaan berturut-turut supaya derau sesaat tidak terhitung.
  if (arus > AMBANG_BANGUN) {
    beruntunAtas++;
    beruntunBawah = 0;
  } else {
    beruntunBawah++;
    beruntunAtas = 0;
  }
  if (!sedangBangun && beruntunAtas >= SAMPEL_PASTI_BANGUN) {
    if (sampelBangun > 0 && sampelTidur > 0) {  // satu siklus lengkap sudah terekam
      cetakRingkasanSiklus();
    }
    sedangBangun = true;
    jumlahArusBangun = 0;
    sampelBangun = 0;
    jumlahArusTidur = 0;
    sampelTidur = 0;
  }
  if (sedangBangun && beruntunBawah >= SAMPEL_PASTI_TIDUR) {
    sedangBangun = false;
  }

  if (sedangBangun) {
    jumlahArusBangun += arus;
    sampelBangun++;
  } else {
    jumlahArusTidur += arus;
    sampelTidur++;
  }
}

void lapor(unsigned long sekarang) {
  if (banyakSampelDetik == 0) {
    return;
  }
  Serial.printf("[%5lu s] %6.2f mA (terkecil %.2f, terbesar %.2f)  %.2f V  %s\n", sekarang / 1000,
                jumlahArusDetik / banyakSampelDetik, arusTerkecil, arusTerbesar, teganganTerakhir,
                sedangBangun ? "BANGUN" : "tidur");
  jumlahArusDetik = 0;
  banyakSampelDetik = 0;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Wire.begin();  // SDA = D21, SCL = D22, seperti layar OLED Node 1
  ina219Ada = ina219.begin();
  if (ina219Ada) {
    ina219.setCalibration_16V_400mA();  // rentang sampai 400 mA, bacaan lebih halus untuk arus kecil
    Serial.println("Praktik 6 - alat ukur arus INA219 siap. Ambang bangun: 20 mA.");
  }
}

void loop() {
  unsigned long sekarang = millis();

  if (!ina219Ada) {
    if (sekarang - waktuLaporTerakhir >= 2000) {
      waktuLaporTerakhir = sekarang;
      Serial.println("INA219 tidak menjawab di alamat 0x40. Periksa kabel VCC, GND, SCL, dan SDA, lalu tekan EN.");
    }
    return;
  }

  if (sekarang - waktuSampelTerakhir >= JEDA_SAMPEL) {
    waktuSampelTerakhir = sekarang;
    ambilSampel();
  }
  if (sekarang - waktuLaporTerakhir >= JEDA_LAPOR) {
    waktuLaporTerakhir = sekarang;
    lapor(sekarang);
  }
}
