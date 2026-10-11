// Modul 6 - Praktik 2: derau, rata-rata bergerak, dan Serial Plotter
// Membaca LDR 20 kali per detik, lalu mengirim dua garis untuk Serial Plotter:
// "mentah" (apa adanya) dan "rata" (rata-rata 10 bacaan terakhir).
// Wokwi tidak punya derau: ubah DERAU_BUATAN menjadi 150 supaya efeknya terlihat.

const int PIN_LDR = 36;        // VP: LDR (peta pin kanonik)
const int JUMLAH_SAMPEL = 10;  // berapa bacaan terakhir yang dirata-ratakan
const int DERAU_BUATAN = 0;    // 0 untuk papan asli; 150 untuk mencoba di Wokwi

int riwayat[JUMLAH_SAMPEL];  // 10 laci berisi bacaan-bacaan terakhir
int posisi = 0;              // nomor laci yang akan ditimpa berikutnya
long jumlah = 0;             // jumlah isi semua laci

void setup() {
  Serial.begin(115200);
  // Isi semua laci dengan bacaan pertama supaya rata-ratanya tidak mulai dari 0.
  int awal = analogRead(PIN_LDR);
  for (int i = 0; i < JUMLAH_SAMPEL; i++) {
    riwayat[i] = awal;
    jumlah += awal;
  }
}

void loop() {
  int mentah = analogRead(PIN_LDR) + random(-DERAU_BUATAN, DERAU_BUATAN + 1);

  jumlah -= riwayat[posisi];              // keluarkan bacaan paling lama dari jumlah,
  riwayat[posisi] = mentah;               // timpa lacinya dengan bacaan baru,
  jumlah += mentah;                       // lalu masukkan bacaan baru ke jumlah
  posisi = (posisi + 1) % JUMLAH_SAMPEL;  // laci berikutnya; sesudah laci 9 kembali ke 0
  int rata = jumlah / JUMLAH_SAMPEL;

  // Format Serial Plotter: nama:nilai, dipisahkan dengan koma. Jangan cetak teks lain di sketsa ini.
  Serial.print("mentah:");
  Serial.print(mentah);
  Serial.print(",rata:");
  Serial.println(rata);
  delay(50);  // 20 bacaan per detik
}
