// Modul 10 - Praktik 5: jam dari internet (NTP)
// ESP32 menanyakan jam ke server NTP, lalu setiap 5 detik mencetak jam setempat
// dan cap waktu "ts" sesuai kontrak data (Lampiran A Silabus).

#include <WiFi.h>
#include <time.h>     // ikut paket esp32: time(), localtime_r(), gmtime_r(), strftime()
#include "secrets.h"  // berisi WIFI_NAMA dan WIFI_SANDI

// Zona waktu ditulis dengan aturan POSIX: nama zona, lalu selisihnya dari UTC dengan tanda TERBALIK.
// WIB = UTC+7 ditulis "WIB-7". Di Indonesia tengah: "WITA-8". Di Indonesia timur: "WIT-9".
const char ZONA_WAKTU[] = "WIB-7";
const char SERVER_NTP_1[] = "pool.ntp.org";       // kumpulan server NTP sukarelawan; otomatis memilih yang dekat
const char SERVER_NTP_2[] = "asia.pool.ntp.org";  // cadangan: kumpulan server di Asia
const unsigned long JEDA_CETAK = 5000;            // cetak jam setiap 5 detik

const char* NAMA_HARI[] = { "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu" };
const char* NAMA_BULAN[] = { "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
                             "Agustus", "September", "Oktober", "November", "Desember" };

bool jamSudahDisetel = false;
unsigned long waktuCetakTerakhir = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.printf("Menyambung ke \"%s\"", WIFI_NAMA);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_NAMA, WIFI_SANDI);
  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
    Serial.print(".");
    delay(250);
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Belum tersambung setelah 20 detik. Periksa tab secrets.h, lalu tekan EN.");
    return;
  }
  Serial.printf("Tersambung, IP %s\n", WiFi.localIP().toString().c_str());

  // Satu baris ini: atur zona waktu, lalu minta paket esp32 menanyakan jam ke server NTP.
  // Ia bertanya di belakang layar (tidak menunggu), lalu bertanya lagi sendiri setiap 3 jam.
  configTzTime(ZONA_WAKTU, SERVER_NTP_1, SERVER_NTP_2);
  Serial.println("Menanyakan jam ke server NTP...");
}

void loop() {
  if (millis() - waktuCetakTerakhir < JEDA_CETAK) {
    return;
  }
  waktuCetakTerakhir = millis();

  time_t sekarang = time(nullptr);  // jumlah detik sejak 1 Januari 1970 pukul 00:00 UTC
  struct tm lokal;                  // "formulir" tanggal dan jam: tahun, bulan, hari, jam, menit, detik
  localtime_r(&sekarang, &lokal);   // isi formulir dengan jam setempat (memakai ZONA_WAKTU)

  if (lokal.tm_year + 1900 < 2025) {  // tm_year dihitung dari tahun 1900
    Serial.printf("Jam belum disetel: ESP32 masih mengira sekarang tahun %d.\n", lokal.tm_year + 1900);
    return;
  }
  if (!jamSudahDisetel) {
    jamSudahDisetel = true;
    Serial.printf("Jam disetel dari internet! time() = %lld detik sejak 1 Januari 1970 UTC.\n", (long long)sekarang);
  }

  // Cap waktu ts (Lampiran A): selalu UTC, format ISO-8601, diakhiri huruf Z.
  struct tm utc;
  gmtime_r(&sekarang, &utc);
  char ts[21];  // "2026-10-17T01:23:45Z" = 20 huruf + tanda akhir teks
  strftime(ts, sizeof(ts), "%Y-%m-%dT%H:%M:%SZ", &utc);

  char jam[16];  // "08:23:45 WIB"; %Z = nama zona waktu
  strftime(jam, sizeof(jam), "%H:%M:%S %Z", &lokal);
  Serial.printf("%s, %d %s %d pukul %s | ts: %s\n", NAMA_HARI[lokal.tm_wday], lokal.tm_mday,
                NAMA_BULAN[lokal.tm_mon], lokal.tm_year + 1900, jam, ts);
}
