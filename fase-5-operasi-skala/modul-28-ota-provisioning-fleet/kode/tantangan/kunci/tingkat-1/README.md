# Kunci Tantangan 1 Modul 28: rak program dan masa uji di layar OLED

**Tugas (ubah sedikit):** saat Node 1 diperbarui lewat udara, layar OLED tidak memberi tahu rak program mana yang sedang berjalan,
apalagi apakah firmware barunya masih dalam masa uji. Ubah halaman status (tekan lama tombol, Modul 8) supaya menulis rak yang
sedang berjalan (`app0`/`app1`) dan status masa ujinya, tanpa Serial Monitor.

> [!NOTE]
> **Dikompilasi penulis, belum dijalankan di papan.** Pada 2 November 2026 Node 1 1.7.0 dengan perubahan ini dikompilasi dengan
> `arduino-cli` 1.5.1, paket esp32 3.3.12, dan library versi persis README firmware, untuk **ESP32 Dev Module**, **Minimal SPIFFS**,
> Flash Mode **DIO**: tanpa galat dan tanpa satu pun peringatan dari berkas `node-1-rumah` (hasil lengkap di bawah). Penulis tidak
> punya papan di meja, jadi tampilan layar di bawah dibaca dari kode, bukan dari foto layar.

| Berkas kunci | Ditaruh di proyek sebagai |
| :--- | :--- |
| [`firmware/node-1-rumah/layar.cpp`](firmware/node-1-rumah/layar.cpp) | pengganti utuh `firmware/node-1-rumah/layar.cpp` (tab `layar.cpp` di Arduino IDE) |
| [`perubahan.diff`](perubahan.diff) | perubahan yang sama dalam bentuk diff terhadap Node 1 1.7.0 (+28 baris, −1), hanya `layar.cpp` |

## Jawabannya

Satu fungsi baru di `layar.cpp` membaca rak yang sedang berjalan dari ESP-IDF, lalu keadaannya dari catatan rak (`otadata`), dan
menyusun baris terakhir halaman status:

```cpp
static void teksVersiRak(char* hasil, size_t ukuran) {
  const esp_partition_t* rak = esp_ota_get_running_partition();
  esp_ota_img_states_t keadaan = ESP_OTA_IMG_UNDEFINED;  // UNDEFINED = dipasang lewat kabel
  if (rak == nullptr) {
    snprintf(hasil, ukuran, "v%s rak ?", VERSI_FIRMWARE);
    return;
  }
  esp_ota_get_state_partition(rak, &keadaan);
  if (keadaan == ESP_OTA_IMG_PENDING_VERIFY) {  // masa uji: 60 detik dihitung sejak Node 1 menyala
    unsigned long sekarang = millis();
    unsigned long sisa = sekarang < MASA_UJI_OTA ? (MASA_UJI_OTA - sekarang) / 1000 : 0;
    snprintf(hasil, ukuran, "v%s %.4s UJI %lus", VERSI_FIRMWARE, rak->label, sisa);
  } else if (keadaan == ESP_OTA_IMG_VALID) {
    snprintf(hasil, ukuran, "v%s %.4s sah", VERSI_FIRMWARE, rak->label);
  } else {
    snprintf(hasil, ukuran, "v%s %.4s kabel", VERSI_FIRMWARE, rak->label);
  }
}
```

Halaman status memakainya di baris terakhir (ditambah `#include <esp_ota_ops.h>` di atas berkas):

```diff
-  snprintf(teks, sizeof(teks), "v%s  bebas %luKB", VERSI_FIRMWARE, ESP.getFreeHeap() / 1024);
+  teksVersiRak(teks, sizeof(teks));
```

`%.4s` artinya "paling banyak 4 huruf": nama rak di skema Minimal SPIFFS memang `app0` atau `app1`, tetapi kolom nama rak di ESP-IDF
muat sampai 16 huruf. Tanpa batas itu, kompilator (setelan peringatan **All**) memperingatkan bahwa barisnya bisa terpotong
(`-Wformat-truncation`), karena ia menghitung kemungkinan terpanjang. `millis()` juga dibaca sekali saja (`sekarang`), supaya kompilator
tahu sisa detiknya paling banyak 60 (dua angka).

| Keadaan di catatan rak | Baris terakhir halaman status (contoh) | Artinya |
| :--- | :--- | :--- |
| `UNDEFINED` | `v1.7.0 app0 kabel` | dipasang lewat kabel USB: boleh jalan tanpa syarat, tanpa masa uji |
| `PENDING_VERIFY` | `v1.7.3 app0 UJI 47s` | baru dipasang lewat udara, sisa masa uji 47 detik; angkanya turun setiap detik |
| `VALID` | `v1.7.3 app0 sah` | sudah membuktikan diri (tersambung ke broker dan terbit dalam 60 detik) |

Kenapa keadaannya dibaca dari catatan rak, bukan dari `dalamMasaUji()` di `masa-uji.cpp`? Supaya layar menulis apa yang benar-benar
tercatat untuk pembuka rak. Kalau suatu saat firmware gagal ditandai sah (Serial `Firmware … gagal ditandai sah: …`), layar tetap
menulis `UJI`, dan memang benar: restart berikutnya akan kembali ke firmware lama. Sisa detiknya dihitung dengan rumus yang sama
dengan perintah Serial `ota` (60 detik sejak Node 1 menyala).

Satu baris layar hanya muat 21 huruf (Modul 8), jadi angka memori bebas (`bebas …KB`) yang dulu ada di baris itu dikorbankan. Angka
itu tetap terlihat di perintah Serial `info` dan di kartu **Armada** (RAM).

## Cara uji

1. Terapkan ke proyekmu: dari akar proyek, `git apply perubahan.diff` (lalu hapus berkas diff-nya), atau ganti seluruh isi tab
   `layar.cpp` dengan berkas kunci. Naikkan `VERSI_FIRMWARE` di `konfigurasi.h` ke rilis berikutnya, misalnya `"1.7.3"` (`1.7.2`
   sudah dipakai rilis uji), dan pastikan `UJI_KUNCI_SALAH = 0`.
2. **Sketch → Export Compiled Binary**, unggah `node-1-rumah.ino.bin` di layar **Armada**, lalu **Perbarui** Node 1 seperti Praktik 7.
3. Begitu Node 1 menyala ulang (Serial `MASA UJI: firmware 1.7.3 baru dipasang lewat udara di rak …`), tekan lama tombol. Baris terakhir
   halaman status menulis versi baru, rak sebelah dari rak sebelumnya (di urutan modul ini biasanya `app0`), dan `UJI` dengan sisa detik
   yang turun setiap detik. Halaman status menutup sendiri sesudah 10 detik; tekan lama lagi untuk melihatnya lagi.
4. Sesudah Serial menulis `Firmware 1.7.3 SAH: …`, tekan lama lagi: `UJI` berganti `sah`.
5. Pilihan: unggah lewat kabel (**Upload**), lalu tekan lama tombol: rak kembali `app0` dengan status `kabel`.

## Hasil kompilasi penulis

`arduino-cli` 1.5.1, paket `esp32:esp32` 3.3.12, library versi persis README firmware, Raspberry Pi 5, 2 November 2026; FQBN
`esp32:esp32:esp32:PartitionScheme=min_spiffs,FlashMode=dio` dengan `--warnings all` (Node 1 1.7.0 + `perubahan.diff`, `kunci.h` =
salinan `kunci.contoh.h`):

```text
Sketch uses 1411047 bytes (71%) of program storage space. Maximum is 1966080 bytes.
Global variables use 58396 bytes (17%) of dynamic memory, leaving 269284 bytes for local variables. Maximum is 327680 bytes.
```

Galat 0; peringatan dari berkas `node-1-rumah` 0 (27 peringatan lain berasal dari library WiFiManager, ESP32Servo, dan ModbusMaster,
sama persis dengan Node 1 1.7.0 tanpa perubahan). Dibanding 1.7.0 dengan setelan yang sama (`Sketch uses 1410887 bytes`), program
bertambah 160 byte; berkas `node-1-rumah.ino.bin` = 1.411.200 byte, masih muat satu rak program (sisa 554.880 byte). Baris
`extern "C"` di `masa-uji.cpp` tetap bekerja: `xtensa-esp32-elf-nm` menulis satu `T verifyRollbackLater` dan tidak ada `W`.

Tidak dicoba penulis: tampilan di layar OLED sungguhan dan pembaruan 1.7.3 lewat udara di papan.
