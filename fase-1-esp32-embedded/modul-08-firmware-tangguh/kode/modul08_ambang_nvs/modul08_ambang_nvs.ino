// Modul 8 - Praktik 5: ambang yang tidak lupa (NVS dengan library Preferences)
// Cukup papan ESP32. Rangkaian Node 1 boleh tetap terpasang: sketsa ini tidak menyentuh pin mana pun.
// Library Preferences sudah ikut paket esp32, jadi tidak perlu dipasang.
//
// Perintah di Serial Monitor (pilih New Line):
//   ambang         -> tampilkan ambang sekarang
//   ambang 35      -> simpan ambang baru (0-100) ke NVS
//   ambang bawaan  -> hapus dari NVS, kembali ke angka bawaan
//   restart        -> restart papan (cara Wokwi meniru "dicabut lalu dicolokkan lagi")

#include <Preferences.h>

const int AMBANG_BAWAAN = 30;  // dipakai selama NVS belum berisi ambang

Preferences arsip;  // "lemari arsip" NVS milik sketsa ini
int ambangTanahSiram = AMBANG_BAWAAN;
unsigned long jumlahNyala = 0;

// ---------- Pembaca baris Serial yang tidak pernah menunggu ----------
const int PANJANG_BARIS_MAKS = 40;
char baris[PANJANG_BARIS_MAKS + 1];  // +1 untuk tanda akhir teks
int panjangBaris = 0;

// Mengumpulkan huruf dari Serial Monitor TANPA menunggu.
// Menjawab true sekali, saat satu baris sudah lengkap (diakhiri Enter); isinya ada di "baris".
bool adaBarisBaru() {
  while (Serial.available() > 0) {
    char huruf = Serial.read();
    if (huruf == '\n') {
      baris[panjangBaris] = '\0';  // tanda akhir teks
      panjangBaris = 0;            // siap mengumpulkan baris berikutnya
      return true;
    }
    if (huruf != '\r' && panjangBaris < PANJANG_BARIS_MAKS) {
      baris[panjangBaris] = huruf;
      panjangBaris++;
    }
  }
  return false;
}

void tampilkanAmbang() {
  Serial.print("Ambang tanah_siram: ");
  Serial.print(ambangTanahSiram);
  if (arsip.isKey("tanah_siram")) {
    Serial.println(" % (dari NVS)");
  } else {
    Serial.println(" % (angka bawaan, belum pernah disimpan)");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Praktik 5 - ambang di NVS");

  arsip.begin("node1", false);  // buka map "node1"; false = boleh membaca DAN menulis

  jumlahNyala = arsip.getULong("jumlah_nyala", 0) + 1;  // 0 kalau label ini belum pernah ditulis
  arsip.putULong("jumlah_nyala", jumlahNyala);
  Serial.print("Nyala ke-");
  Serial.println(jumlahNyala);

  ambangTanahSiram = arsip.getInt("tanah_siram", AMBANG_BAWAAN);  // angka bawaan kalau belum ada
  tampilkanAmbang();
  Serial.println("Perintah: ambang, ambang 35, ambang bawaan, restart");
}

void loop() {
  if (!adaBarisBaru()) {
    return;  // belum ada baris lengkap: langsung kembali, tidak menunggu
  }
  String perintah = baris;  // perintah datang sesekali saja, jadi String aman dipakai di sini
  perintah.trim();
  perintah.toLowerCase();

  if (perintah == "ambang") {
    tampilkanAmbang();
  } else if (perintah == "ambang bawaan") {
    arsip.remove("tanah_siram");  // hapus label ini dari map
    ambangTanahSiram = AMBANG_BAWAAN;
    Serial.println("Ambang dihapus dari NVS.");
    tampilkanAmbang();
  } else if (perintah.startsWith("ambang ")) {
    String angka = perintah.substring(7);  // teks sesudah "ambang "
    int persen = angka.toInt();
    if ((persen == 0 && angka != "0") || persen < 0 || persen > 100) {
      Serial.println("Butuh angka 0-100. Contoh: ambang 35");
      return;
    }
    if (persen == ambangTanahSiram && arsip.isKey("tanah_siram")) {
      Serial.println("Angkanya sama dengan yang tersimpan: NVS tidak perlu ditulis ulang.");
      return;
    }
    arsip.putInt("tanah_siram", persen);  // tulis ke flash: tetap ada walaupun listrik padam
    ambangTanahSiram = persen;
    Serial.print("Disimpan ke NVS: ");
    Serial.print(persen);
    Serial.println(" %");
  } else if (perintah == "restart") {
    Serial.println("Restart sekarang...");
    Serial.flush();  // tunggu sampai pesan di atas benar-benar terkirim
    ESP.restart();
  } else {
    Serial.println("Perintah tidak dikenal. Coba: ambang, ambang 35, ambang bawaan, restart");
  }
}
