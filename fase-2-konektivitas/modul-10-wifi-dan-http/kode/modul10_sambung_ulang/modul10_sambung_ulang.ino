// Modul 10 - Praktik 3: uji cabut router
// ESP32 menyambung TANPA menunggu. Kalau WiFi putus, paket esp32 sendiri yang mencoba menyambung lagi;
// sketsa ini hanya mengamati dan melapor. loop() tidak pernah berhenti berputar:
//   LED status menyala tetap = tersambung; berkedip cepat = putus, sedang mencoba lagi.

#include <WiFi.h>
#include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

const int PIN_LED_STATUS = 4;
const unsigned long JEDA_LAPORAN = 10000;  // laporan berkala setiap 10 detik
const unsigned long JEDA_KEDIP = 100;      // kedip cepat selama WiFi putus

// "Bendera" yang dinaikkan fungsi peristiwa dan diturunkan loop(), seperti interrupt di Modul 8.
// volatile: isinya bisa berubah "diam-diam" dari luar loop().
volatile bool benderaDapatIp = false;
volatile bool benderaPutus = false;
volatile uint8_t alasanPutus = 0;
volatile unsigned long jumlahPercobaan = 0;  // berapa kali percobaan menyambung gagal

bool tersambung = false;
bool pernahTersambung = false;
unsigned long waktuPutus = 0;
unsigned long waktuLaporanTerakhir = 0;
unsigned long waktuKedipTerakhir = 0;
bool ledNyala = false;
unsigned long putaranTerlamaUs = 0;  // putaran loop() paling lama sejak laporan terakhir (Modul 8)

// Dipanggil oleh paket esp32 setiap ada peristiwa WiFi, dari "petugas" lain, bukan dari loop().
// Aturannya sama dengan fungsi interrupt: sesingkat mungkin, cukup menaikkan bendera.
void saatPeristiwaWiFi(arduino_event_id_t peristiwa, arduino_event_info_t info) {
  if (peristiwa == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
    benderaDapatIp = true;
  } else if (peristiwa == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
    uint8_t alasan = info.wifi_sta_disconnected.reason;
    if (alasan == WIFI_REASON_STA_LEAVING) {
      return;  // 36: paket esp32 sendiri memutus percobaan lama sebelum mencoba lagi, bukan percobaan gagal baru
    }
    alasanPutus = alasan;
    jumlahPercobaan++;
    benderaPutus = true;
  }
}

// Nama kode alasan putus dari paket esp32. Kode 209-212 belum diberi nama di sana.
const char* namaAlasan(uint8_t kode) {
  const char* nama = WiFi.disconnectReasonName((wifi_err_reason_t)kode);
  if (nama[0] == '\0') {  // teks kosong: huruf pertamanya langsung tanda akhir teks
    return "lihat tabel Konsep 4";
  }
  return nama;
}

// Jam sejak menyala, misalnya "00:01:23", untuk awal setiap baris laporan.
const char* jamUptime() {
  static char teks[12];
  unsigned long detik = millis() / 1000;
  snprintf(teks, sizeof(teks), "%02lu:%02lu:%02lu", detik / 3600, (detik / 60) % 60, detik % 60);
  return teks;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(PIN_LED_STATUS, OUTPUT);
  Serial.println();

  WiFi.onEvent(saatPeristiwaWiFi);  // daftarkan fungsi peristiwa SEBELUM mulai menyambung
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  Serial.printf("[%s] Mulai menyambung ke \"%s\" (tanpa menunggu)\n", jamUptime(), WIFI_NAMA);
}

void loop() {
  unsigned long mulaiPutaran = micros();
  unsigned long sekarang = millis();

  // 1. Turunkan bendera, lalu laporkan perubahannya.
  if (benderaDapatIp) {
    benderaDapatIp = false;
    tersambung = true;
    if (!pernahTersambung) {
      Serial.printf("[%s] Tersambung! IP %s, sinyal %d dBm\n", jamUptime(),
                    WiFi.localIP().toString().c_str(), WiFi.RSSI());
    } else {
      Serial.printf("[%s] Tersambung LAGI setelah %lu detik putus. IP %s\n", jamUptime(),
                    (sekarang - waktuPutus) / 1000, WiFi.localIP().toString().c_str());
    }
    pernahTersambung = true;
    jumlahPercobaan = 0;
  }
  if (benderaPutus) {
    benderaPutus = false;
    if (tersambung) {  // baru saja putus; percobaan ulang yang gagal tidak dilaporkan satu per satu
      tersambung = false;
      waktuPutus = sekarang;
      jumlahPercobaan = 0;  // mulai menghitung percobaan ulang yang gagal
      Serial.printf("[%s] WiFi PUTUS (alasan %u: %s). Paket esp32 mencoba menyambung lagi...\n",
                    jamUptime(), alasanPutus, namaAlasan(alasanPutus));
    }
  }

  // 2. LED status: menyala tetap saat tersambung, berkedip cepat saat putus.
  if (tersambung) {
    digitalWrite(PIN_LED_STATUS, HIGH);
  } else if (sekarang - waktuKedipTerakhir >= JEDA_KEDIP) {
    waktuKedipTerakhir = sekarang;
    ledNyala = !ledNyala;
    digitalWrite(PIN_LED_STATUS, ledNyala);
  }

  // 3. Laporan berkala: bukti bahwa loop() tetap berputar walaupun WiFi putus.
  if (sekarang - waktuLaporanTerakhir >= JEDA_LAPORAN) {
    waktuLaporanTerakhir = sekarang;
    if (tersambung) {
      Serial.printf("[%s] Laporan: tersambung, sinyal %d dBm, putaran loop() terlama %lu ms\n",
                    jamUptime(), WiFi.RSSI(), putaranTerlamaUs / 1000);
    } else if (pernahTersambung) {
      Serial.printf("[%s] Laporan: PUTUS selama %lu detik, %lu percobaan gagal, putaran loop() terlama %lu ms\n",
                    jamUptime(), (sekarang - waktuPutus) / 1000, jumlahPercobaan, putaranTerlamaUs / 1000);
    } else {
      Serial.printf("[%s] Laporan: belum pernah tersambung, %lu percobaan gagal (alasan terakhir %u: %s)\n",
                    jamUptime(), jumlahPercobaan, alasanPutus, namaAlasan(alasanPutus));
    }
    putaranTerlamaUs = 0;  // mulai mengukur lagi untuk laporan berikutnya
  }

  unsigned long lamaPutaran = micros() - mulaiPutaran;
  if (lamaPutaran > putaranTerlamaUs) {
    putaranTerlamaUs = lamaPutaran;
  }
}
