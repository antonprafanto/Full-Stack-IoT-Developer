// Modul 11 - Kemenangan Cepat: halo lewat broker MQTT
// ESP32 menerbitkan pesan "halo" ke broker publik setiap 5 detik, lalu mencetak pesan apa pun
// yang kamu kirim ke topiknya dari MQTTX di laptop.
// Broker publik = grup obrolan terbuka: siapa pun bisa ikut membaca. Jangan pernah mengirim rahasia lewat sini.

#include <WiFi.h>
#include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2 (pasang lewat Library Manager)
#include "secrets.h"       // berisi WIFI_NAMA dan WIFI_SANDI, seperti di Modul 10

#ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
#error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
#endif

const char ALAMAT_BROKER[] = "broker.emqx.io";  // broker publik, sama dengan bawaan MQTTX
const uint16_t PORT_BROKER = 1883;              // pintu MQTT tanpa enkripsi
const unsigned long JEDA_HALO = 5000;           // satu pesan halo setiap 5 detik

WiFiClient klienJaringan;          // sambungan TCP ke broker
PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
char kode[7];                      // 6 karakter heksadesimal acak supaya topikmu tidak sama dengan topik pembaca lain
char idKlien[24];                  // nama ESP32 di broker, harus unik
char topikKirim[40];               // belajar-iot/<kode>/dari-esp32
char topikTerima[40];              // belajar-iot/<kode>/dari-laptop
unsigned long waktuHaloTerakhir = 0;
int nomorHalo = 0;

// Dipanggil library setiap ada pesan masuk di topik yang kita langgani.
void saatPesanMasuk(char* topik, byte* isi, unsigned int panjang) {
  Serial.printf("Pesan masuk di %s: ", topik);
  Serial.write(isi, panjang);  // isi pesan tidak diakhiri tanda akhir teks: cetak sepanjang 'panjang'
  Serial.println();
}

void sambungkanBroker() {
  Serial.printf("Menyambung ke broker %s ...\n", ALAMAT_BROKER);
  while (!mqtt.connect(idKlien)) {  // menunggu di sini boleh untuk Kemenangan Cepat ini
    Serial.printf("Gagal (kode %d). Coba lagi 3 detik lagi.\n", mqtt.state());
    delay(3000);
  }
  mqtt.subscribe(topikTerima);  // langganan topik pesan dari laptop
  Serial.println("Tersambung ke broker!");
  Serial.printf("Di MQTTX, langganan topik: belajar-iot/%s/#\n", kode);
  Serial.printf("Kirim pesan ke ESP32 lewat topik: %s\n", topikTerima);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  snprintf(kode, sizeof(kode), "%06lx", (unsigned long)(esp_random() & 0xFFFFFF));  // misalnya 3f9a1c
  snprintf(idKlien, sizeof(idKlien), "belajar-iot-%s", kode);
  snprintf(topikKirim, sizeof(topikKirim), "belajar-iot/%s/dari-esp32", kode);
  snprintf(topikTerima, sizeof(topikTerima), "belajar-iot/%s/dari-laptop", kode);

  Serial.printf("Menyambung ke WiFi \"%s\"", WIFI_NAMA);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(250);
  }
  Serial.println(" tersambung!");

  mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
  mqtt.setCallback(saatPesanMasuk);
  sambungkanBroker();
}

void loop() {
  if (!mqtt.connected()) {
    sambungkanBroker();  // sambungan ke broker putus: sambungkan lagi
  }
  mqtt.loop();  // wajib dipanggil sesering mungkin: menerima pesan dan menjaga sambungan tetap hidup

  if (millis() - waktuHaloTerakhir >= JEDA_HALO) {
    waktuHaloTerakhir = millis();
    nomorHalo++;
    char pesan[40];
    snprintf(pesan, sizeof(pesan), "Halo dari ESP32 ke-%d", nomorHalo);
    mqtt.publish(topikKirim, pesan);
    Serial.printf("Terkirim ke %s: %s\n", topikKirim, pesan);
  }
}
