// Modul 7 - Praktik 4: sensor suhu DS18B20 di bus 1-Wire
// Kaki DATA DS18B20 ke RX2 (GPIO 16, dipinjam sementara). Resistor pull-up 4,7 kOhm dari DATA ke 3,3 V
// (modul adaptor biasanya sudah membawanya). DS18B20 diberi 3,3 V, BUKAN 5 V.
// Library: OneWire 2.3.8 dan DallasTemperature 4.0.6. Pasang KEDUANYA: DallasTemperature tidak menawarkan OneWire.

#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_SATU_KABEL = 16;  // RX2: bus 1-Wire (dipinjam sementara, lihat PETA-PIN.md)
const int MAKS_SENSOR = 4;      // sketsa ini mencatat paling banyak 4 sensor

OneWire satuKabel(PIN_SATU_KABEL);           // "jalan" 1-Wire-nya
DallasTemperature sensorSuhu(&satuKabel);    // "penerjemah" DS18B20 yang memakai jalan itu
DeviceAddress nomorSeri[MAKS_SENSOR];        // tempat menyimpan nomor seri (8 byte) setiap sensor
int jumlahSensor = 0;

// Mencetak nomor seri 8 byte, misalnya 28-FF-64-1E-0F-6A-D3-3C.
void cetakNomorSeri(DeviceAddress nomor) {
  for (int i = 0; i < 8; i++) {
    if (nomor[i] < 0x10) {
      Serial.print("0");
    }
    Serial.print(nomor[i], HEX);
    if (i < 7) {
      Serial.print("-");
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  sensorSuhu.begin();  // menyusuri bus dan menghitung sensor yang menjawab
  jumlahSensor = sensorSuhu.getDeviceCount();
  if (jumlahSensor > MAKS_SENSOR) {
    jumlahSensor = MAKS_SENSOR;
  }
  Serial.print("Ditemukan ");
  Serial.print(jumlahSensor);
  Serial.println(" sensor DS18B20.");
  for (int i = 0; i < jumlahSensor; i++) {
    sensorSuhu.getAddress(nomorSeri[i], i);
    Serial.print("  Sensor ");
    Serial.print(i + 1);
    Serial.print(": nomor seri ");
    cetakNomorSeri(nomorSeri[i]);
    Serial.println();
  }
  if (jumlahSensor == 0) {
    Serial.println("Periksa kabel DATA (RX2), VCC (3,3 V), GND, dan resistor 4,7 kOhm, lalu tekan EN.");
  }
}

void loop() {
  if (jumlahSensor == 0) {  // belum ada sensor: ingatkan setiap 5 detik, kalau-kalau pesan di setup() terlewat
    Serial.println("Belum ada DS18B20 yang terbaca. Cabut USB, periksa kabel, lalu colokkan lagi.");
    delay(5000);
    return;
  }
  sensorSuhu.requestTemperatures();  // serukan kepada SEMUA sensor sekaligus: "ukur sekarang!" (sampai 750 ms)
  for (int i = 0; i < jumlahSensor; i++) {
    float suhu = sensorSuhu.getTempC(nomorSeri[i]);  // tanya satu per satu lewat nomor serinya
    Serial.print("Sensor ");
    Serial.print(i + 1);
    Serial.print(": ");
    if (suhu == DEVICE_DISCONNECTED_C) {  // -127: library tidak memercayai bacaan ini
      Serial.println("tidak terbaca! Kabelnya lepas atau dayanya terputus-putus?");
    } else if (suhu == 85.0) {            // 85: angka bawaan sensor yang baru menyala (library 4.0.6 biasanya menggantinya dengan -127)
      Serial.println("85.00 C (curiga: sensor baru menyala atau dayanya kurang)");
    } else {
      Serial.print(suhu, 2);
      Serial.println(" C");
    }
  }
  delay(2000);
}
