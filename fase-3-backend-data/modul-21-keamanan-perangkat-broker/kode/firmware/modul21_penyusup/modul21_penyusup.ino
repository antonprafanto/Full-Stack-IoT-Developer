// Modul 21 - Praktik 6, papan KEDUA (papan Node 2 yang dipinjam): si "penyusup".
// Hanya untuk broker MILIKMU SENDIRI (Mosquitto di gateway Pi atau di laptop), bukan broker orang lain.
// Papan ini masuk ke broker dengan akunnya SENDIRI, yaitu perangkat uji c0ba00000001 yang kamu daftarkan sah di
// backend, BUKAN dengan akun Node 1. Sesudah diterima masuk, ia mencoba tiga hal yang bukan haknya:
//   1. menerbitkan telemetry PALSU ke topik Node 1 (rpm/<ID_NODE1>/telemetry), lalu mengulangnya setiap 15 detik
//   2. berlangganan semua pesan proyek (rpm/#)
//   3. menerbitkan atas nama Node 2 (rpm/<ID_NODE2>/telemetry); di daftar izin, hak itu hanya milik Node 1
// Pelajarannya: PubSubClient tidak tahu pesannya dibuang broker (publish() tetap menjawab true), dan langganan rpm/#
// "berhasil" tetapi kosong. Buktinya ada di log broker (baris "Denied PUBLISH") dan di MQTTX pemantau, yang tidak
// pernah menerima pesan palsu itu.
// Selesai latihan: cabut kunci perangkat uji, lalu unggah lagi firmware Node 2 (node-2-kebun) ke papan ini.
// Library: PubSubClient3 versi 3.3.2 (sama dengan Node 1). Paket esp32 3.3.12.

#include <WiFi.h>
#include <PubSubClient.h>  // library PubSubClient3 versi 3.3.2
#include "secrets.h"       // WIFI_NAMA, WIFI_SANDI, dan KUNCI_PENYUSUP; tidak pernah ikut ke GitHub

#ifndef MQTT_QOS1  // hanya PubSubClient3 yang punya nama ini
#error "Yang terpakai PubSubClient lama (2.8). Hapus lewat Library Manager, lalu pasang PubSubClient3 versi 3.3.2."
#endif

const char ALAMAT_BROKER[] = "192.168.1.37";  // GANTI dengan alamat gateway Pi-mu (sama dengan Node 1)
const uint16_t PORT_BROKER = 1883;
const char ID_NODE1[] = "a4cf12e5b7c0";       // GANTI dengan device_id Node 1-mu: topik yang mau "dipalsukan"
const char ID_NODE2[] = "246f28b1c7d4";       // GANTI dengan device_id Node 2-mu
const char NAMA_PENYUSUP[] = "c0ba00000001";  // device_id perangkat uji = nama klien = nama pengguna broker
const unsigned long JEDA_PALSU = 15000;       // telemetry palsu diulang setiap 15 detik
const unsigned long JEDA_COBA = 30000;        // masuk ditolak? coba lagi 30 detik kemudian

WiFiClient klienJaringan;          // sambungan TCP ke broker
PubSubClient mqtt(klienJaringan);  // MQTT berjalan di atas sambungan itu
char topikNode1[40];  // rpm/<ID_NODE1>/telemetry
char topikNode2[40];  // rpm/<ID_NODE2>/telemetry
unsigned long waktuCobaTerakhir = 0;
unsigned long waktuPalsuTerakhir = 0;
bool sudahMencoba = false;
int nomorPalsu = 0;

// Dipanggil library setiap ada pesan dari langganan rpm/#. Kalau daftar izin broker benar, pesan perangkat lain
// tidak pernah sampai ke sini.
void saatPesanMasuk(char* topik, byte* isi, unsigned int panjang) {
  Serial.printf("[!] MENERIMA %s (%u byte): kalau ini pesan perangkat lain, daftar izin bocor!\n", topik, panjang);
}

// Percobaan 1: telemetry palsu atas nama Node 1. publish() menjawab true begitu pesan diserahkan ke sambungan TCP;
// di MQTT 3.1.1, PubSubClient tidak pernah diberi tahu bahwa broker membuangnya.
void terbitkanPalsu() {
  nomorPalsu++;
  char isi[48];
  snprintf(isi, sizeof(isi), "{\"fw\":\"PALSU\",\"suhu\":99.9,\"ke\":%d}", nomorPalsu);
  bool hasil = mqtt.publish(topikNode1, isi);
  Serial.printf("[1] publish ke %s -> publish() = %s (true BUKAN berarti diterima broker!)\n", topikNode1,
                hasil ? "true" : "false");
}

// Masuk dengan akun sendiri, lalu tiga percobaan yang seharusnya ditolak daftar izin (ACL) broker.
void cobaMenyusup() {
  Serial.printf("Masuk ke broker %s:%u sebagai %s ...\n", ALAMAT_BROKER, PORT_BROKER, NAMA_PENYUSUP);
  if (!mqtt.connect(NAMA_PENYUSUP, NAMA_PENYUSUP, KUNCI_PENYUSUP)) {
    int kode = mqtt.state();
    Serial.printf("[x] broker menolak MASUK (kode %d): %s Dicoba lagi %lu detik lagi.\n", kode,
                  kode == 5 ? "kunci perangkat uji salah atau sudah dicabut." : "lihat tabel kode state() Modul 11.",
                  JEDA_COBA / 1000);
    return;
  }
  Serial.printf("[ok] MASUK diterima: akun %s memang sah. Sekarang mencoba yang bukan haknya.\n", NAMA_PENYUSUP);
  terbitkanPalsu();
  waktuPalsuTerakhir = millis();
  bool hasil = mqtt.subscribe("rpm/#", 1);  // juga true: PubSubClient tidak memeriksa jawaban broker (SUBACK)
  Serial.printf("[2] subscribe rpm/# -> subscribe() = %s. Tidak muncul baris [!]? Langganan diterima, tetapi kosong.\n",
                hasil ? "true" : "false");
  hasil = mqtt.publish(topikNode2, "{\"fw\":\"PALSU-N2\"}");
  Serial.printf("[3] publish ke %s -> publish() = %s\n", topikNode2, hasil ? "true" : "false");
  Serial.println("[i] Sekarang lihat log broker (Denied PUBLISH ...) dan MQTTX pemantau: pesan palsu tidak sampai.");
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Penyusup (papan Node 2 dipinjam). Hanya untuk latihan daftar izin broker Modul 21.");
  snprintf(topikNode1, sizeof(topikNode1), "rpm/%s/telemetry", ID_NODE1);
  snprintf(topikNode2, sizeof(topikNode2), "rpm/%s/telemetry", ID_NODE2);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  Serial.printf("Menyambung ke WiFi \"%s\"", WIFI_NAMA);
  while (WiFi.status() != WL_CONNECTED) {  // menunggu di sini boleh: sketsa latihan kecil tanpa watchdog
    Serial.print(".");
    delay(250);
  }
  Serial.println(" tersambung.");
  mqtt.setServer(ALAMAT_BROKER, PORT_BROKER);
  mqtt.setCallback(saatPesanMasuk);
}

void loop() {
  if (!mqtt.connected()) {
    if (!sudahMencoba || millis() - waktuCobaTerakhir >= JEDA_COBA) {
      sudahMencoba = true;
      waktuCobaTerakhir = millis();
      cobaMenyusup();
    }
    return;
  }
  mqtt.loop();  // menjaga sambungan, dan menjalankan saatPesanMasuk() kalau ada pesan masuk
  if (millis() - waktuPalsuTerakhir >= JEDA_PALSU) {
    waktuPalsuTerakhir = millis();
    terbitkanPalsu();
  }
}
