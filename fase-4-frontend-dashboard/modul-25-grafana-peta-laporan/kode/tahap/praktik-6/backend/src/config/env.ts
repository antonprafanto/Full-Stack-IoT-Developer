// env.ts - setelan server dari file .env (dibaca Node.js lewat --env-file), diperiksa skema Zod sekali saat server mulai.
// Modul 20: .env kini juga berisi rahasia (JWT_SECRET), jadi isinya diperiksa seketat pesan dari perangkat.
import { z } from "zod";

z.config(z.locales.id()); // pesan galat Zod dalam bahasa Indonesia (file ini dibaca paling awal, sebelum kontrak.ts)

const kosong = (nilai: unknown) => (nilai === "" ? undefined : nilai); // baris "NAMA=" tanpa isi = belum diisi
const wajib = z.preprocess(kosong, z.string({ error: "belum diisi" }));

const Setelan = z.object({
  // alamat broker, misalnya mqtt://192.168.1.37:1883. Modul 21: TANPA nama pengguna dan sandi di dalamnya (alamat ini ditulis
  // ke log saat tersambung); akunnya di dua setelan berikut
  MQTT_URL: wajib.pipe(z.string()
    .regex(/^mqtts?:\/\//, "harus diawali mqtt:// (atau mqtts:// mulai Modul 27), misalnya mqtt://192.168.1.37:1883")
    .refine((url) => !url.includes("@"), "jangan menaruh nama pengguna atau sandi di MQTT_URL; pakai MQTT_USERNAME dan MQTT_PASSWORD")),
  // Modul 21: akun broker milik backend sendiri (dibuat dengan mosquitto_passwd). Keduanya kosong = masuk tanpa akun (hanya
  // berhasil di broker yang masih terbuka); kalau salah satu diisi, yang lain wajib diisi.
  MQTT_USERNAME: z.string().default(""),
  MQTT_PASSWORD: z.string().default(""),
  DATABASE_URL: wajib, // alamat database, misalnya postgres://postgres:<sandi>@127.0.0.1:5432/rumahpintar
  PORT: z.preprocess(kosong, z.coerce.number().int().min(1).max(65535).default(8080)), // nomor loket server
  HOST: z.preprocess(kosong, z.string().default("127.0.0.1")), // 127.0.0.1 = hanya bisa diketuk dari laptop ini
  // Modul 19: Telegram tidak wajib. Kosong = notifikasi Telegram mati.
  TELEGRAM_BOT_TOKEN: z.string().default(""), // token dari @BotFather: rahasia, seperti kata sandi
  TELEGRAM_CHAT_ID: z.string().default(""), // chat_id pemilik (balasan /start)
  TELEGRAM_API_ROOT: z.string().default(""), // kosong = server Telegram sungguhan (lab: server Bot API tiruan)
  // Modul 20: kunci untuk menandatangani JWT. Siapa pun yang tahu kunci ini bisa membuat "gelang" palsu.
  JWT_SECRET: z.preprocess(kosong, z.string({ error: "belum diisi" })
    .min(32, "terlalu pendek (minimal 32 karakter); buat yang baru dengan perintah di .env.example")
    .refine((s) => !s.startsWith("ganti"), "masih berisi contoh dari .env.example; buat rahasia baru")),
  // Modul 20: alamat halaman web (origin) yang boleh memanggil API ini dari browser, dipisah koma. Modul 22: Vite di 5173.
  CORS_ORIGIN: z.preprocess(kosong, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((teks) => teks.split(",").map((asal) => asal.trim()).filter((asal) => asal !== ""))),
}).refine((s) => s.MQTT_USERNAME !== "" || s.MQTT_PASSWORD === "", { // Modul 21: akun broker harus lengkap
  message: "MQTT_PASSWORD diisi tetapi MQTT_USERNAME kosong", path: ["MQTT_USERNAME"],
}).refine((s) => s.MQTT_PASSWORD !== "" || s.MQTT_USERNAME === "", {
  message: "MQTT_USERNAME diisi tetapi MQTT_PASSWORD kosong (sandi akun backend dari mosquitto_passwd)", path: ["MQTT_PASSWORD"],
});

const hasil = Setelan.safeParse(process.env);
if (!hasil.success) {
  // tampilkan SEMUA masalah sekaligus, supaya tidak perlu bolak-balik memperbaiki satu per satu
  for (const masalah of hasil.error.issues) console.error(`Setelan ${masalah.path.join(".")} di .env: ${masalah.message}`);
  console.error("Salin .env.example menjadi .env (atau buka .env-mu), perbaiki setelan di atas, lalu jalankan lagi.");
  process.exit(1); // berhenti di sini: tanpa setelan yang benar server tidak boleh berjalan
}

export const env = hasil.data;
