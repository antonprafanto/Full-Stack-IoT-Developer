// penyadap.js — "penyadap" kecil untuk membuktikan sendiri: tanpa TLS, nama pengguna dan kunci MQTT lewat POLOS. Modul 21.
// Ia berdiri di tengah: MQTTX -> penyadap (127.0.0.1:1884) -> broker. Semua diteruskan apa adanya, tetapi isi paket
// CONNECT (paket pertama setiap sambungan) dicetak, begitu pula jawaban broker (CONNACK). Tidak butuh library dari npm.
// Jalankan:  node penyadap.js 192.168.1.37        (broker di gateway Pi; penyadap mendengar di 127.0.0.1:1884)
//            node penyadap.js 127.0.0.1 1883 1884 (alamat broker, port broker, port penyadap)
// Lalu di MQTTX: buat sambungan ke Host 127.0.0.1, Port 1884, isi Username dan Password, klik Connect.
// Berhenti: Ctrl + C

import net from "node:net";

const BROKER = process.argv[2] || "127.0.0.1";
const PORT_BROKER = Number(process.argv[3]) || 1883;
const PORT_PENYADAP = Number(process.argv[4]) || 1884;
const jam = () => new Date().toLocaleTimeString("id-ID");
const JAWABAN = { 0: "diterima", 4: "nama pengguna atau kunci salah", 5: "tidak diizinkan", 134: "Bad User Name or Password", 135: "Not authorized" };

// Membaca satu teks MQTT: 2 byte panjang, lalu isinya.
function bacaTeks(b, i) {
  const panjang = b.readUInt16BE(i);
  return [b.subarray(i + 2, i + 2 + panjang).toString("utf8"), i + 2 + panjang];
}

// Membaca angka "panjang berubah" MQTT (1 sampai 4 byte).
function bacaPanjang(b, i) {
  let nilai = 0;
  let kali = 1;
  let byte;
  do {
    byte = b[i++];
    nilai += (byte & 127) * kali;
    kali *= 128;
  } while (byte & 128);
  return [nilai, i];
}

// Paket CONNECT: jenis 1, nama protokol "MQTT", versi, bendera, keep-alive, lalu nama klien, wasiat, nama pengguna, kunci.
// Menjawab true kalau urusannya selesai (sudah dicetak, atau ternyata bukan MQTT), false kalau paketnya belum lengkap.
function cetakConnect(b) {
  if (b[0] !== 0x10) return true; // bukan paket CONNECT: tidak ada yang dicetak
  if (b.length < 5) return false;
  let [sisa, i] = bacaPanjang(b, 1);
  if (b.length < i + sisa) return false; // belum lengkap: tunggu potongan berikutnya
  let protokol;
  [protokol, i] = bacaTeks(b, i);
  const versi = b[i];
  const bendera = b[i + 1];
  i += 4; // versi, bendera, keep-alive 2 byte
  if (versi === 5) { // MQTT 5: lewati properti sambungan
    const [panjangProperti, j] = bacaPanjang(b, i);
    i = j + panjangProperti;
  }
  let namaKlien;
  [namaKlien, i] = bacaTeks(b, i);
  if (bendera & 4) { // ada wasiat: lewati (MQTT 5: propertinya juga), topiknya, dan isinya
    if (versi === 5) {
      const [panjangProperti, j] = bacaPanjang(b, i);
      i = j + panjangProperti;
    }
    i = bacaTeks(b, i)[1];
    i += 2 + b.readUInt16BE(i);
  }
  const pengguna = bendera & 128 ? bacaTeks(b, i) : ["(tidak dikirim)", i];
  const kunci = bendera & 64 ? bacaTeks(b, pengguna[1])[0] : "(tidak dikirim)";
  console.log(`  CONNECT ${protokol} versi ${versi === 5 ? "5.0" : versi === 4 ? "3.1.1" : versi}`);
  console.log(`  nama klien    : ${namaKlien}`);
  console.log(`  nama pengguna : ${pengguna[0]}`);
  console.log(`  kunci (sandi) : ${kunci}   <- terbaca polos oleh siapa pun di jalur ini`);
  return true;
}

net.createServer((klien) => {
  console.log(`[${jam()}] sambungan baru dari ${klien.remoteAddress}:${klien.remotePort} -> ${BROKER}:${PORT_BROKER}`);
  const broker = net.connect(PORT_BROKER, BROKER);
  let awal = Buffer.alloc(0);
  let connectTercetak = false;
  let connackTercetak = false;
  klien.on("data", (potongan) => {
    if (!connectTercetak) {
      awal = Buffer.concat([awal, potongan]);
      connectTercetak = cetakConnect(awal);
    }
    broker.write(potongan);
  });
  broker.on("data", (potongan) => {
    if (!connackTercetak && potongan[0] === 0x20) {
      connackTercetak = true;
      const kode = potongan[3];
      console.log(`  broker menjawab: CONNACK ${kode} (${JAWABAN[kode] || "lihat tabel kode"})`);
    }
    klien.write(potongan);
  });
  klien.on("close", () => broker.end());
  broker.on("close", () => klien.end());
  klien.on("error", () => broker.destroy());
  broker.on("error", (galat) => {
    console.log(`  broker ${BROKER}:${PORT_BROKER} tidak bisa dihubungi (${galat.code})`);
    klien.destroy();
  });
}).listen(PORT_PENYADAP, "127.0.0.1", () => {
  console.log(`Penyadap siap di 127.0.0.1:${PORT_PENYADAP}, meneruskan ke broker ${BROKER}:${PORT_BROKER}. Ctrl + C untuk berhenti.`);
});
