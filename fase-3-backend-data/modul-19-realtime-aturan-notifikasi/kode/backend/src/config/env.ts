// env.ts - setelan server dari file .env (dibaca Node.js lewat --env-file) dan diperiksa sekali saat server mulai.

function wajib(nama: string): string {
  const nilai = process.env[nama];
  if (nilai === undefined || nilai === "") {
    console.error(`Setelan ${nama} belum diisi. Salin .env.example menjadi .env, isi ${nama}, lalu jalankan lagi.`);
    process.exit(1); // berhenti di sini: tanpa setelan ini server tidak bisa bekerja
  }
  return nilai;
}

export const env = {
  MQTT_URL: wajib("MQTT_URL"), // alamat broker, misalnya mqtt://192.168.1.37:1883
  DATABASE_URL: wajib("DATABASE_URL"), // alamat database, misalnya postgres://postgres:<sandi>@127.0.0.1:5432/rumahpintar
  PORT: Number(process.env.PORT || 8080), // nomor loket server
  HOST: process.env.HOST || "127.0.0.1", // 127.0.0.1 = hanya bisa diketuk dari laptop ini
  // Modul 19: Telegram tidak wajib. Kosong = notifikasi Telegram mati.
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "", // token dari @BotFather: rahasia, seperti kata sandi
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "", // chat_id pemilik (balasan /start)
  TELEGRAM_API_ROOT: process.env.TELEGRAM_API_ROOT ?? "", // kosong = server Telegram sungguhan (lab: server Bot API tiruan)
};
