// server.ts - pintu masuk backend Rumah Pintar Mini 2.0 (Modul 29: rakitan server Fastify pindah ke app.ts, buatApp(), supaya
// tes integrasi menguji rakitan yang sama dengan produksi; versi server dibaca dari package.json dan tampil di /health dan
// /docs). Berkas ini tinggal menyalakan sisanya: database, aturan otomatis, Socket.IO, MQTT, Telegram, laporan harian, dan
// pengawas pembaruan firmware, lalu mendengar di loketnya.
// Riwayat: v1.5 Modul 28: pembaruan firmware lewat udara dengan unduhan berkunci, canary, kode klaim sekali pakai, akun broker
// perangkat otomatis lewat dynamic security, dan data halaman /armada; v1.4 Modul 27: backend di internet, di balik Caddy
// HTTPS (TRUST_PROXY membuat backend memercayai keterangan Caddy tentang tamu: cookie login ber-Secure di HTTPS dan pembatas
// login per tamu); v1.3 Modul 26: bisa berjalan sebagai kontainer Docker di compose.cloud.yml; v1.2 Modul 25: titik
// perangkat di peta dan laporan harian CSV lewat Telegram; v1.1 Modul 24: aturan "di bawah ambang" seperti siram kalau tanah
// kering, aturan ambang boleh mengirim perintah sekali, dan aturan bisa dihapus; v1.0 Modul 21: daftar resmi perangkat dan
// kuncinya, akun broker sendiri, pesan dari perangkat tak terdaftar/dicabut diabaikan; Modul 20: login, JWT di cookie, peran,
// dan pengaman API; dan Modul 19: data realtime, perintah satu pintu, aturan otomatis, jadwal, dan notifikasi Telegram.
// Jalankan: npm run dev (otomatis mulai ulang saat file disimpan) atau npm start. Di kontainer (Modul 26): node src/server.ts,
// setelannya datang dari Docker Compose, bukan dari berkas .env (lihat Dockerfile).
import { env } from "./config/env.ts";
import { VERSI_SERVER } from "./config/versi-server.ts";
import { buatApp } from "./app.ts";
import { brokerTersambung, hentikanMqtt, mulaiMqtt } from "./services/mqtt.ts";
import { mulaiRealtime } from "./services/realtime.ts";
import { isiJedaVitals, kirimSemuaConfig, muatAturan } from "./services/otomasi.ts";
import { hentikanPengawasPembaruan, mulaiPengawasPembaruan } from "./services/ota.ts";
import { tempatAkun } from "./services/akun-broker.ts";
import { hentikanJadwal } from "./services/jadwal.ts";
import { hentikanTelegram, mulaiTelegram } from "./services/telegram.ts";
import { mulaiLaporan } from "./services/laporan.ts";
import { databaseHidup } from "./db/arsip.ts";
import { semuaPerangkatDb } from "./db/perangkat.ts";
import { isiDaftar } from "./services/daftar.ts";
import { pool } from "./db/pool.ts";

const app = await buatApp(); // Modul 29: Fastify + pengaman + /docs + semua rute (app.ts), belum mendengar di loket mana pun
app.log.info(`backend Rumah Pintar Mini ${VERSI_SERVER} menyala`); // Modul 29: versi yang sama dengan /health

if (await databaseHidup()) app.log.info("database siap");
else app.log.warn("database belum bisa dihubungi: periksa kontainer database dan DATABASE_URL di .env");
try {
  await muatAturan(); // Modul 19: aturan otomatis dari tabel rules
} catch (galat) {
  app.log.error(`aturan otomatis belum bisa dimuat: ${(galat as Error).message}`);
}
mulaiRealtime(app); // Modul 19: Socket.IO di alamat /socket.io/ (Modul 20: ikut dikunci)

// Modul 21: buku tamu perangkat terdaftar dimuat dari database SEBELUM mendengar broker. Kalau database belum bisa
// dihubungi, dicoba lagi setiap 10 detik (dicatat paling sering semenit sekali); selama itu semua pesan perangkat
// diabaikan: lebih baik kehilangan data sebentar daripada menerima data dari perangkat yang tidak berhak.
let percobaanDaftar = 0;
async function muatDaftarPerangkat(): Promise<void> {
  try {
    const baris = await semuaPerangkatDb();
    const jumlah = isiDaftar(baris);
    isiJedaVitals(baris.map((b) => ({ device_id: b.device_id, jeda_vitals_s: b.jeda_vitals_s ?? null }))); // Modul 28
    app.log.info(`daftar perangkat dimuat: ${jumlah} perangkat terdaftar`);
    // Modul 28: config hanya dikirim ke perangkat terdaftar; kalau broker sudah tersambung lebih dulu, kirim sekarang
    if (brokerTersambung()) kirimSemuaConfig();
  } catch (galat) {
    if (percobaanDaftar % 6 === 0) {
      app.log.error(`daftar perangkat belum bisa dimuat (${(galat as Error).message}); dicoba lagi setiap 10 detik`);
    }
    percobaanDaftar++;
    setTimeout(() => void muatDaftarPerangkat(), 10_000);
  }
}
await muatDaftarPerangkat();
if (env.MQTT_USERNAME === "") {
  app.log.warn("MQTT_USERNAME kosong: backend masuk ke broker TANPA akun (hanya berhasil di broker yang belum dikunci)");
}
mulaiMqtt(env.MQTT_URL, env.MQTT_USERNAME === "" ? null : { username: env.MQTT_USERNAME, password: env.MQTT_PASSWORD }, app.log);
mulaiTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, env.TELEGRAM_API_ROOT); // Modul 19: tidak ditunggu
mulaiLaporan(env.LAPORAN_JADWAL); // Modul 25: laporan harian CSV ke Telegram (node-cron, WIB)
mulaiPengawasPembaruan(); // Modul 28: pembaruan firmware tanpa kabar OTA_BATAS_MENIT menit = kedaluwarsa
// Modul 28: dua baris saat menyala, bukti setelan pembaruan firmware dan akun broker terbaca
app.log.info(env.ALAMAT_SERVER === "" ? "pembaruan firmware lewat udara MATI: ALAMAT_SERVER belum diisi"
  : `alamat unduh firmware untuk perangkat: ${env.ALAMAT_SERVER}/fw/node-1/<versi>.bin`);
app.log.info(`akun broker perangkat: ${tempatAkun()} (AKUN_BROKER_OTOMATIS)`);
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`dokumentasi API: http://${env.HOST}:${env.PORT}/docs`);

// Modul 19: berhenti dengan rapi saat Ctrl + C (SIGINT) atau SIGTERM. Begitu sinyal ini punya pendengar, Ctrl + C tidak
// lagi mematikan Node.js, jadi semua yang masih terbuka ditutup satu per satu, lalu process.exit(0).
async function berhenti(sinyal: string): Promise<void> {
  app.log.info(`${sinyal} diterima: backend berhenti dengan rapi`);
  try {
    await hentikanTelegram(); // konfirmasi update terakhir ke Telegram
    await hentikanJadwal(); // node-cron: tunggu tugas yang sedang berjalan (jadwal aturan dan, sejak Modul 25, laporan harian)
    hentikanPengawasPembaruan(); // Modul 28
    await app.close(); // preClose memutus klien Socket.IO, lalu server HTTP ditutup
    await hentikanMqtt(); // DISCONNECT ke broker
    await pool.end(); // tutup kolam sambungan database
  } catch (galat) {
    app.log.error(`gagal berhenti dengan rapi: ${(galat as Error).message}`);
  }
  app.log.info("backend berhenti");
  process.exit(0);
}
process.once("SIGINT", () => void berhenti("SIGINT"));
process.once("SIGTERM", () => void berhenti("SIGTERM"));
