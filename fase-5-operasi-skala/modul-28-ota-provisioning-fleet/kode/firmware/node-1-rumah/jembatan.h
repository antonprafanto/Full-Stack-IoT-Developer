// jembatan.h - Node 1 sebagai jembatan Node 2 "Kebun" (Modul 14).
// Node 2 tidak tersambung ke router. Ia mengirim satu paket ESP-NOW setiap kali bangun; Node 1 menerimanya,
// memberinya cap waktu, menahannya selama broker tak terjangkau, lalu menerbitkannya atas nama Node 2:
// rpm/<device_id Node 2>/telemetry dan rpm/<device_id Node 2>/status (kontrak data versi 1.1).
#pragma once

void siapkanJembatan();       // panggil sekali di setup(), SESUDAH siapkanJaringan()
void perbaruiJembatan();      // panggil di setiap putaran loop(); tidak pernah menunggu
void cetakInfoNode2();        // jawaban perintah Serial "node2"
void nolkanHitunganNode2();   // perintah Serial "node2 nol"
