// Modul 14 - Bedah teknis: papan Node 2 sebagai perangkat Bluetooth Low Energy (BLE) yang bisa dibaca HP.
// Layanan "Environmental Sensing" (0x181A) dengan karakteristik "Temperature" (0x2A6E): suhu DS18B20 dalam
// seperseratus derajat Celsius (2712 = 27,12 derajat). Dibaca dengan aplikasi nRF Connect for Mobile.
// Sketsa TERPISAH, hanya untuk dicoba: BLE dan WiFi berbagi satu radio, dan programnya jauh lebih besar.
// Sesudah mencoba, unggah lagi Node 2 v1.0.0. Library: OneWire 2.3.8, DallasTemperature 4.0.6; BLE ikut paket esp32.

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include <OneWire.h>
#include <DallasTemperature.h>

const int PIN_SATU_KABEL = 27;  // DS18B20 Node 2

OneWire satuKabel(PIN_SATU_KABEL);
DallasTemperature sensorSuhu(&satuKabel);
BLECharacteristic *karakteristikSuhu = nullptr;

void setup() {
  Serial.begin(115200);
  delay(1000);
  sensorSuhu.begin();
  if (!BLEDevice::init("Kebun-BLE")) {  // nama yang muncul di daftar SCANNER nRF Connect
    Serial.println("BLE gagal dinyalakan. Tekan tombol EN untuk mencoba lagi.");
    return;
  }
  BLEServer *server = BLEDevice::createServer();
  server->advertiseOnDisconnect(true);  // setelah HP memutus sambungan, beriklan lagi
  BLEService *layanan = server->createService(BLEUUID((uint16_t)0x181A));
  karakteristikSuhu = layanan->createCharacteristic(BLEUUID((uint16_t)0x2A6E),
                                                   BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  karakteristikSuhu->addDescriptor(new BLE2902());  // izin notifikasi (wajib ditulis sendiri di paket esp32 ini)
  layanan->start();
  BLEAdvertising *iklan = BLEDevice::getAdvertising();
  iklan->addServiceUUID(BLEUUID((uint16_t)0x181A));
  iklan->setScanResponse(true);
  BLEDevice::startAdvertising();
  Serial.println("Beriklan sebagai Kebun-BLE. Buka nRF Connect di HP, lalu SCAN.");
}

void loop() {
  delay(2000);
  if (karakteristikSuhu == nullptr) {
    return;
  }
  sensorSuhu.requestTemperatures();  // menunggu sampai selesai mengukur (paling lama 750 ms)
  float suhu = sensorSuhu.getTempCByIndex(0);
  if (suhu == DEVICE_DISCONNECTED_C) {
    Serial.println("DS18B20 tidak terbaca: periksa DAT ke D27, VCC, dan GND.");
    return;
  }
  int16_t nilai = (int16_t)lroundf(suhu * 100);  // satuan karakteristik 0x2A6E: 0,01 derajat Celsius
  karakteristikSuhu->setValue((uint8_t *)&nilai, sizeof(nilai));
  karakteristikSuhu->notify();  // HP yang menyalakan notifikasi langsung menerima angka baru
  Serial.printf("Suhu %.2f C -> nilai BLE %d = 0x%04X, dikirim byte rendah dulu: %02X-%02X\n", suhu, nilai,
                (unsigned int)(uint16_t)nilai, (unsigned int)(nilai & 0xFF), (unsigned int)((nilai >> 8) & 0xFF));
}
