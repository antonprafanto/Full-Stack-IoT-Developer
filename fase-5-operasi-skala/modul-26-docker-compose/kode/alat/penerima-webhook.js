// penerima-webhook.js — server mini yang mencetak apa pun yang dikirim kepadanya
// Modul 4 - Praktik 9. Dipakai lagi di Modul 10, 16, dan 22.
// Jalankan:  node penerima-webhook.js   (berhenti: Ctrl + C)

import http from "node:http";

const PORT = 3000;

const server = http.createServer((permintaan, jawaban) => {
  let isi = "";
  permintaan.on("data", (potongan) => {
    isi = isi + potongan; // kiriman datang sepotong demi sepotong
  });
  permintaan.on("end", () => {
    const jam = new Date().toLocaleTimeString("id-ID");
    console.log(`[${jam}] ${permintaan.method} ${permintaan.url}`);
    if (isi !== "") {
      console.log(isi); // cetak isi kiriman apa adanya
    }
    jawaban.writeHead(200, { "Content-Type": "application/json" });
    jawaban.end(JSON.stringify({ ok: true })); // balas: "diterima"
  });
});

server.listen(PORT, () => {
  console.log(`Penerima siap di http://localhost:${PORT} — tekan Ctrl + C untuk berhenti.`);
});
