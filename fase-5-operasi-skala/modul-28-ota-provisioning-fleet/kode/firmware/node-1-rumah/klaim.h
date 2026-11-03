// klaim.h - mendaftar dengan KODE KLAIM dari admin (Modul 28, KONTRAK-DATA.md 1.6 bagian 10).
// Kode diketik di portal WiFi (kolom "Kode klaim") atau di Serial Monitor ("klaim <kode>"). Begitu WiFi tersambung,
// Node 1 mengirim sekali:
//   POST <alamat server>/api/provision/klaim {"kode":"7K2M-QF9D","device_id":"<device_id>"}
// Jawaban 201 membawa kunci perangkat; kunci itu disimpan di NVS seperti "kunci <isi>" (Modul 21), lalu Node 1 langsung
// menyambung ke broker. Kodenya sendiri TIDAK disimpan di NVS: hanya di RAM sampai dipakai.
#pragma once

const char* mulaiKlaim(const char* kode);  // nullptr = kode diterima dan akan dikirim; selain itu alasannya
void perbaruiKlaim();                      // panggil di setiap putaran loop(): mengirim kode begitu WiFi siap
void cetakInfoKlaim();                     // bagian dari jawaban perintah Serial "klaim"
