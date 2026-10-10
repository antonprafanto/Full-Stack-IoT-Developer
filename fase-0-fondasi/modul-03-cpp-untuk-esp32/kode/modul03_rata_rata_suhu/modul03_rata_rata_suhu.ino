// Modul 3 - Praktik 5: array suhu contoh -> rata-rata, tertinggi, terendah
// Tidak butuh rangkaian apa pun: hasilnya hanya di Serial Monitor.

const int JUMLAH_HARI = 7;

// Suhu siang selama 7 hari (data contoh, bukan dari sensor)
float suhu[JUMLAH_HARI] = {28.5, 29.1, 30.4, 31.2, 29.8, 27.6, 28.9};
String hari[JUMLAH_HARI] = {"Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"};

// Fungsi dengan nilai balik: menjumlahkan semua isi array, lalu membaginya dengan jumlah data.
float hitungRataRata(float data[], int jumlah) {
  float total = 0;
  for (int i = 0; i < jumlah; i++) {
    total = total + data[i];
  }
  return total / jumlah;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("Suhu minggu ini:");

  // Cetak isi array satu per satu. Ingat: nomor laci dimulai dari 0.
  for (int i = 0; i < JUMLAH_HARI; i++) {
    Serial.print("  ");
    Serial.print(hari[i]);
    Serial.print(": ");
    Serial.print(suhu[i], 1);  // 1 angka di belakang titik
    Serial.println(" C");
  }

  // Cari laci dengan suhu tertinggi dan terendah.
  int laciTertinggi = 0;
  int laciTerendah = 0;
  for (int i = 1; i < JUMLAH_HARI; i++) {
    if (suhu[i] > suhu[laciTertinggi]) {
      laciTertinggi = i;
    }
    if (suhu[i] < suhu[laciTerendah]) {
      laciTerendah = i;
    }
  }

  Serial.print("Rata-rata : ");
  Serial.print(hitungRataRata(suhu, JUMLAH_HARI), 2);
  Serial.println(" C");
  Serial.print("Tertinggi : ");
  Serial.print(suhu[laciTertinggi], 1);
  Serial.println(" C (" + hari[laciTertinggi] + ")");
  Serial.print("Terendah  : ");
  Serial.print(suhu[laciTerendah], 1);
  Serial.println(" C (" + hari[laciTerendah] + ")");
}

void loop() {
}
