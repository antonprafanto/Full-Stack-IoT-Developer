// Modul 8 - Praktik 4: kode modular
// Sketsa Praktik 3 yang dipecah: detak jantung pindah ke detak.h/.cpp, tombol pindah ke tombol.h/.cpp.
// Rangkaian sama dengan Praktik 3. Perilakunya pun sama persis.

#include "detak.h"
#include "tombol.h"

const int PIN_LED_STATUS = 4;
const int PIN_TOMBOL = 13;
const int PIN_RELAY_LAMPU = 32;  // relay aktif LOW
const int PIN_RELAY_KIPAS = 33;  // tidak dipakai di sini, tetapi relay-nya dimatikan supaya diam
const int PIN_POMPA = 25;        // gerbang MOSFET: HIGH = pompa menyala
const int PIN_TANAH = 39;        // VN
const int PIN_TRIG = 15;
const int PIN_ECHO = 35;

// Hasil kalibrasimu dari Modul 6 (ganti dengan angkamu sendiri)
const int TANAH_KERING = 3000;    // angka mentah sensor tanah di udara
const int TANAH_BASAH = 1300;     // angka mentah sensor tanah di air
const float JARAK_KOSONG = 20.0;  // cm: sensor ke dasar tandon
const float JARAK_PENUH = 5.0;    // cm: sensor ke permukaan air saat tandon penuh

// Aturan penyiraman
const int AMBANG_TANAH_SIRAM = 30;        // siram kalau tanah di bawah 30 %
const int LEVEL_AIR_MINIMUM = 20;         // pompa ditolak kalau isi tandon di bawah 20 %
const unsigned long JEDA_PERIKSA = 2000;  // SIAGA: periksa tanah setiap 2 detik
const unsigned long LAMA_SIRAM = 3000;    // MENYIRAM: pompa menyala 3 detik
const unsigned long LAMA_JEDA = 30000;    // JEDA: istirahat 30 detik sebelum boleh menyiram lagi

bool lampuMenyala = false;

// Tiga keadaan penyiraman. Daftar nama seperti ini (enum) ditulis di atas, sebelum fungsi mana pun.
enum KeadaanSiram { SIAGA, MENYIRAM, JEDA };
KeadaanSiram keadaan = SIAGA;            // keadaan sekarang; mulai dari SIAGA
unsigned long waktuMasukKeadaan = 0;     // kapan keadaan sekarang dimulai
unsigned long waktuPeriksaTerakhir = 0;  // kapan tanah terakhir diperiksa

// ---------- Sensor tanah dan tandon (Modul 6) ----------
int bacaTanahPersen() {
  long jumlah = 0;
  for (int i = 0; i < 20; i++) {
    jumlah += analogRead(PIN_TANAH);  // 20 bacaan berturut-turut, tanpa jeda (selesai dalam sekejap)
  }
  int persen = map(jumlah / 20, TANAH_KERING, TANAH_BASAH, 0, 100);
  return constrain(persen, 0, 100);
}

// Menjawab persen isi tandon, atau -1 kalau gema HC-SR04 tidak kembali.
int bacaLevelAir() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long durasi = pulseIn(PIN_ECHO, HIGH, 30000);  // menunggu paling lama 30 ms
  if (durasi == 0) {
    return -1;
  }
  float jarak = durasi / 58.0;
  int persen = (JARAK_KOSONG - jarak) * 100 / (JARAK_KOSONG - JARAK_PENUH);
  return constrain(persen, 0, 100);
}

// ---------- State machine penyiraman ----------
const char* namaKeadaan(KeadaanSiram k) {
  if (k == SIAGA) {
    return "SIAGA";
  }
  if (k == MENYIRAM) {
    return "MENYIRAM";
  }
  return "JEDA";
}

// Satu-satunya tempat keadaan berganti: catat waktunya dan laporkan perpindahannya.
void pindahKe(KeadaanSiram keadaanBaru) {
  Serial.print("[");
  Serial.print(namaKeadaan(keadaan));
  Serial.print(" -> ");
  Serial.print(namaKeadaan(keadaanBaru));
  Serial.println("]");
  keadaan = keadaanBaru;
  waktuMasukKeadaan = millis();
}

// Mencoba menyalakan pompa. Pengaman tandon (Modul 6): air kurang = ditolak, lalu beristirahat.
void mulaiMenyiram() {
  int levelAir = bacaLevelAir();
  if (levelAir < LEVEL_AIR_MINIMUM) {  // -1 (tidak terbaca) juga lebih kecil, jadi ikut ditolak
    Serial.print("Pompa DITOLAK: air tandon ");
    if (levelAir < 0) {
      Serial.println("tidak terbaca.");
    } else {
      Serial.print(levelAir);
      Serial.println(" %.");
    }
    aturIramaDetak(true);  // LED status berkedip cepat: isi tandonnya!
    pindahKe(JEDA);
    return;
  }
  aturIramaDetak(false);
  Serial.print("Pompa menyala (air tandon ");
  Serial.print(levelAir);
  Serial.println(" %).");
  digitalWrite(PIN_POMPA, HIGH);
  pindahKe(MENYIRAM);
}

void jalankanPenyiraman() {
  unsigned long sekarang = millis();

  if (keadaan == SIAGA) {
    // SIAGA: periksa tanah setiap 2 detik; kalau kering, mulai menyiram
    if (sekarang - waktuPeriksaTerakhir >= JEDA_PERIKSA) {
      waktuPeriksaTerakhir = sekarang;
      int tanah = bacaTanahPersen();
      Serial.print("SIAGA: tanah ");
      Serial.print(tanah);
      Serial.println(" %");
      if (tanah < AMBANG_TANAH_SIRAM) {
        mulaiMenyiram();
      }
    }
  } else if (keadaan == MENYIRAM) {
    // MENYIRAM: pompa padam setelah 3 detik, lalu beristirahat
    if (sekarang - waktuMasukKeadaan >= LAMA_SIRAM) {
      digitalWrite(PIN_POMPA, LOW);
      Serial.println("Pompa padam.");
      pindahKe(JEDA);
    }
  } else if (keadaan == JEDA) {
    // JEDA: tunggu 30 detik supaya air sempat meresap sebelum tanah diperiksa lagi
    if (sekarang - waktuMasukKeadaan >= LAMA_JEDA) {
      pindahKe(SIAGA);
    }
  }
}

// ---------- Yang dikerjakan tombol ----------
void tekanPendek() {
  lampuMenyala = !lampuMenyala;
  if (lampuMenyala) {
    digitalWrite(PIN_RELAY_LAMPU, LOW);  // relay aktif LOW
    Serial.println("Tombol: lampu on");
  } else {
    digitalWrite(PIN_RELAY_LAMPU, HIGH);
    Serial.println("Tombol: lampu off");
  }
}

void tekanLama() {
  if (keadaan == SIAGA) {
    Serial.println("Tombol ditahan: siram sekarang!");
    mulaiMenyiram();
  } else {
    Serial.print("Tombol ditahan, tetapi penyiraman sedang ");
    Serial.print(namaKeadaan(keadaan));
    Serial.println(". Coba lagi nanti.");
  }
}

void setup() {
  Serial.begin(115200);
  mulaiDetak(PIN_LED_STATUS);  // modul detak menyiapkan pin LED-nya sendiri
  mulaiTombol(PIN_TOMBOL);     // modul tombol menyiapkan pin tombolnya sendiri
  pinMode(PIN_RELAY_LAMPU, OUTPUT);
  digitalWrite(PIN_RELAY_LAMPU, HIGH);  // lampu padam (relay aktif LOW)
  pinMode(PIN_RELAY_KIPAS, OUTPUT);
  digitalWrite(PIN_RELAY_KIPAS, HIGH);  // kipas padam
  pinMode(PIN_POMPA, OUTPUT);
  digitalWrite(PIN_POMPA, LOW);
  pinMode(PIN_TRIG, OUTPUT);
  digitalWrite(PIN_TRIG, LOW);
  pinMode(PIN_ECHO, INPUT);
  Serial.println("Praktik 4 - kode modular: perilakunya sama dengan Praktik 3.");
}

void loop() {
  perbaruiDetak();

  // Modul tombol hanya melaporkan apa yang terjadi; sketsa ini yang memutuskan tindakannya.
  PeristiwaTombol peristiwa = periksaTombol();
  if (peristiwa == TEKAN_PENDEK) {
    tekanPendek();
  } else if (peristiwa == TEKAN_LAMA) {
    tekanLama();
  }

  jalankanPenyiraman();
}
