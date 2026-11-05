// env.ts - setelan server dari file .env (dibaca Node.js lewat --env-file), diperiksa skema Zod sekali saat server mulai.
// Modul 20: .env kini juga berisi rahasia (JWT_SECRET), jadi isinya diperiksa seketat pesan dari perangkat.
// Modul 27: + TRUST_PROXY (backend di balik Caddy HTTPS) dan pemeriksaan bentuk alamat di CORS_ORIGIN.
// Modul 28: + FIRMWARE_DIR, ALAMAT_SERVER, AKUN_BROKER_OTOMATIS, OTA_BATAS_MENIT (pembaruan firmware dan kode klaim).
import { isIP } from "node:net";
import { z } from "zod";
import cron from "node-cron";

z.config(z.locales.id()); // pesan galat Zod dalam bahasa Indonesia (file ini dibaca paling awal, sebelum kontrak.ts)

const kosong = (nilai: unknown) => (nilai === "" ? undefined : nilai); // baris "NAMA=" tanpa isi = belum diisi
const wajib = z.preprocess(kosong, z.string({ error: "belum diisi" }));

// Modul 27: nama kelompok alamat yang dikenal Fastify untuk TRUST_PROXY. uniquelocal = alamat privat 10.x, 172.16-31.x,
// 192.168.x, dan fc00::/7, termasuk lorong Docker tempat Caddy berada; loopback = 127.0.0.1 dan ::1 (mesin ini sendiri).
const KELOMPOK_PROKSI = ["loopback", "linklocal", "uniquelocal"];
// satu alamat IP (10.0.0.5) atau satu blok alamat CIDR (172.16.0.0/12, fc00::/7)
function alamatAtauBlok(teks: string): boolean {
  const [alamat, awalan, ...sisa] = teks.split("/");
  const versi = isIP(alamat);
  if (versi === 0 || sisa.length > 0) return false;
  return awalan === undefined || (/^\d{1,3}$/.test(awalan) && Number(awalan) <= (versi === 4 ? 32 : 128));
}

// Modul 28: apakah alamat IPv4 ini alamat jaringan rumah (10.x, 172.16-31.x, 192.168.x) atau mesin ini sendiri (127.x)?
// Dibaca persis seperti firmware Node 1 (periksa-ota.cpp, alamatIpRumah): tepat empat angka 0-255 dipisah titik.
function ipRumah(alamat: string): boolean {
  const angka = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(alamat)?.slice(1).map(Number);
  if (angka === undefined || angka.some((n) => n > 255)) return false;
  const [a, b] = angka;
  return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

// Modul 28: ALAMAT_SERVER harus alamat yang BISA DISIMPAN Node 1 1.7.0 apa adanya. Perangkat hanya mau mengunduh firmware
// dari <alamat server tersimpan>/fw/node-1/<versi>.bin (url lain dijawab "url bukan server rumah ini"), jadi alamat yang
// tidak bisa diketik di portal membuat SEMUA pembaruan gagal. Aturannya sama persis dengan firmware (periksa-ota.cpp:
// rapikanAlamat() lalu periksaAlamatServer()) dan simulator (alat/simulator-perangkat.js: salahAlamatServer()):
//   - paling panjang 64 huruf (kolom "Alamat server" di portal WiFi Node 1)
//   - diawali http:// atau https://, lalu nama server: huruf kecil a-z, angka, titik, dan tanda - saja (tanpa garis
//     bawah _, tanpa @, tanpa spasi); port boleh ditulis, 1-65535 (misalnya :8443)
//   - tanpa / di akhir dan tanpa jalur (/api): portal membuang / di akhir, jadi alamat ber-/ tidak akan pernah sama
//   - huruf kecil semua: portal menyimpannya dengan huruf kecil
//   - http:// hanya ke alamat IP jaringan rumah (10.x, 172.16-31.x, 192.168.x), karena kunci perangkat ikut terkirim
// Satu beda yang disengaja: 127.x diterima di sini dan di simulator (lab: simulator berjalan di mesin yang sama dengan
// server), sedangkan ESP32 menolaknya (bagi papan, 127.x adalah papan itu sendiri, bukan server).
// Menjawab null kalau sah, atau kalimat alasannya.
const PANJANG_ALAMAT_SERVER_MAKS = 64; // = PANJANG_ALAMAT_SERVER_MAKS di firmware periksa-ota.h
function salahAlamatServer(teks: string): string | null {
  const contoh = "misalnya https://iot.namaanda.my.id atau http://192.168.1.37";
  if (teks.length > PANJANG_ALAMAT_SERVER_MAKS) {
    return `"${teks}" terlalu panjang (${teks.length} huruf): Node 1 hanya bisa menyimpan alamat server paling panjang `
      + `${PANJANG_ALAMAT_SERVER_MAKS} huruf. Pakai nama domain yang lebih pendek`;
  }
  const bagian = /^(https?):\/\/(.*)$/.exec(teks);
  if (bagian === null) return `"${teks}" harus diawali http:// atau https:// (huruf kecil), ${contoh}`;
  const [, skema, hostPort] = bagian;
  if (hostPort.includes("/")) return `"${teks}": tulis tanpa / di akhir dan tanpa jalur di belakang nama server, ${contoh}`;
  if (/[A-Z]/.test(hostPort)) {
    return `"${teks}": tulis dengan huruf kecil semua (portal Node 1 menyimpannya dengan huruf kecil, jadi alamatnya tidak `
      + "akan sama)";
  }
  const [host, port, ...lebih] = hostPort.split(":");
  if (host === "") return `"${teks}": nama server sesudah :// belum ditulis, ${contoh}`;
  if (!/^[a-z0-9.-]+$/.test(host)) {
    return `"${teks}": nama server hanya boleh berisi huruf kecil a-z, angka, titik, dan tanda - (tanpa garis bawah _, `
      + `tanpa @, tanpa spasi), ${contoh}`;
  }
  if (port !== undefined && (lebih.length > 0 || !/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
    return `"${teks}": port (angka sesudah titik dua) harus 1 sampai 65535, misalnya https://iot.namaanda.my.id:8443`;
  }
  if (skema === "http" && !ipRumah(host)) {
    return `"${teks}": http:// hanya untuk alamat IP jaringan rumah (10.x, 172.16-31.x, 192.168.x), karena kunci perangkat `
      + "ikut terkirim tanpa enkripsi. Di internet tulis https://nama-domainmu";
  }
  return null;
}

// Modul 28: siapa yang membuat dan menghapus akun broker perangkat (kunci per perangkat, Modul 21)?
export type ModeAkunBroker =
  | { jenis: "mati" } // seperti Modul 21: admin menjalankan mosquitto_passwd sendiri
  | { jenis: "pusat" } // backend lewat plugin dynamic security broker PUSAT (perangkat masuk langsung ke pusat)
  | { jenis: "gerbang"; nama: string }; // backend lewat jembatan ke broker GERBANG Pi bernama itu (misalnya pi1)

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
  // Modul 25: kapan laporan harian CSV dikirim ke Telegram, cron 5 bidang (menit jam tanggal bulan hari) dalam WIB.
  // Bawaan "0 7 * * *" = setiap hari pukul 07.00 WIB. Cron 6 bidang ("0 7 * * * *") juga sah bagi node-cron, tetapi
  // artinya lain (detik 0, menit 7, SETIAP jam), jadi ditolak di sini.
  LAPORAN_JADWAL: z.preprocess(kosong, z.string().default("0 7 * * *")
    .refine((teks) => teks.trim().split(/\s+/).length === 5, "harus 5 bidang: menit jam tanggal bulan hari, misalnya 0 7 * * *")
    .refine((teks) => cron.validate(teks), "ekspresi cron tidak sah, misalnya 0 7 * * * (setiap hari 07.00 WIB)")),
  // Modul 20: kunci untuk menandatangani JWT. Siapa pun yang tahu kunci ini bisa membuat "gelang" palsu.
  JWT_SECRET: z.preprocess(kosong, z.string({ error: "belum diisi" })
    .min(32, "terlalu pendek (minimal 32 karakter); buat yang baru dengan perintah di .env.example")
    .refine((s) => !s.startsWith("ganti"), "masih berisi contoh dari .env.example; buat rahasia baru")),
  // Modul 20: alamat halaman web (origin) yang boleh memanggil API ini dari browser, dipisah koma. Modul 22: Vite di 5173.
  // Modul 27: di internet, alamat dashboard ber-HTTPS dengan nama domain, misalnya https://iot.namaanda.my.id. Browser
  // mengirim Origin tanpa garis miring di akhir dan tanpa jalur, jadi "https://iot.namaanda.my.id/" tidak akan pernah cocok
  // (semua login dari browser ditolak 403): bentuk seperti itu ditolak di sini, saat server mulai.
  CORS_ORIGIN: z.preprocess(kosong, z.string().default("http://localhost:5173,http://127.0.0.1:5173")
    .transform((teks) => teks.split(",").map((asal) => asal.trim()).filter((asal) => asal !== ""))
    .superRefine((daftar, ctx) => {
      for (const asal of daftar.filter((a) => !/^https?:\/\/[^/\s]+$/.test(a))) {
        ctx.addIssue({ code: "custom", message: `"${asal}" bukan alamat halaman: tulis http(s)://nama[:port] tanpa / di `
          + "akhir, misalnya https://iot.namaanda.my.id atau http://localhost" });
      }
    })),
  // Modul 27: siapa yang boleh memberi tahu backend alamat IP dan protokol (http/https) tamu yang SEBENARNYA, lewat header
  // X-Forwarded-For dan X-Forwarded-Proto. Di balik Caddy, backend hanya melihat Caddy: tanpa setelan ini cookie login tidak
  // mendapat atribut Secure walau halamannya HTTPS, dan semua tamu dianggap satu alamat (pembatas login 429 dibagi bersama).
  //   kosong (bawaan) = tidak percaya siapa pun: mode kembang (npm run dev) tanpa Caddy
  //   uniquelocal     = percaya penerus di alamat privat (lorong Docker, tempat Caddy): pilihan compose.cloud.yml
  //   true            = percaya SIAPA PUN (juga tamu yang memalsukan header): hindari
  //   alamat/CIDR     = misalnya 172.18.0.0/16, boleh beberapa dipisah koma (juga loopback, linklocal)
  // Angka (jumlah lompatan/hop, resep lama trustProxy: 1) ditolak: Fastify 5 sengaja tidak memercayainya sama sekali, jadi
  // setelan itu diam-diam tidak berbuat apa-apa.
  TRUST_PROXY: z.string().default("")
    .transform((teks) => teks.split(",").map((isi) => isi.trim().toLowerCase()).filter((isi) => isi !== ""))
    .superRefine((daftar, ctx) => {
      if (daftar.some((isi) => /^\d+$/.test(isi))) {
        ctx.addIssue({ code: "custom", message: "angka (jumlah hop) tidak dipakai Fastify 5 (tidak dipercaya sama sekali); "
          + "di balik Caddy tulis uniquelocal" });
      } else if (daftar.join() !== "true" && daftar.join() !== "false") { // true/false hanya boleh berdiri sendiri
        const salah = daftar.filter((isi) => !KELOMPOK_PROKSI.includes(isi) && !alamatAtauBlok(isi));
        if (salah.length > 0) {
          ctx.addIssue({ code: "custom", message: `"${salah.join(",")}" tidak dikenal: tulis uniquelocal, true, loopback, `
            + "linklocal, atau alamat/CIDR seperti 172.18.0.0/16 (dipisah koma); kosong = tidak memercayai penerus" });
        }
      }
    })
    // hasil untuk Fastify({ trustProxy }): false = mati, true = percaya semua, daftar = hanya penerus di alamat itu
    .transform((daftar): boolean | string[] => (daftar.length === 0 || daftar.join() === "false" ? false
      : daftar.join() === "true" ? true : daftar)),
  // Modul 28: folder tempat berkas firmware (.bin) yang diunggah admin disimpan. Relatif = dari folder backend (mode kembang:
  // backend/data-firmware, tidak ikut Git). Di kontainer: /app/data-firmware = lemari data-firmware (compose.cloud.yml).
  FIRMWARE_DIR: z.preprocess(kosong, z.string().default("data-firmware")),
  // Modul 28: alamat server yang dipakai PERANGKAT untuk mengunduh firmware (url di cmd update = ALAMAT_SERVER +
  // /fw/node-1/<versi>.bin) dan untuk klaim (alamat yang sama diketik di portal Node 1). Kosong = pembaruan lewat udara mati.
  //   https://iot.namaanda.my.id  = VPS (jalur utama): unduhan terenkripsi, karena kunci perangkat ikut terkirim
  //   http://192.168.1.37         = jaringan rumah saja (Pi jalur gratis, laptop): HANYA alamat IP rumah 10.x, 172.16-31.x,
  //                                 192.168.x (perangkat menolak mengirim kuncinya polos ke alamat lain); 127.x hanya lab
  // Bentuknya diperiksa salahAlamatServer() di atas: alamat yang tidak bisa disimpan Node 1 ditolak saat server mulai.
  ALAMAT_SERVER: z.preprocess(kosong, z.string().default(""))
    .superRefine((teks, ctx) => {
      const salah = teks === "" ? null : salahAlamatServer(teks);
      if (salah !== null) ctx.addIssue({ code: "custom", message: salah });
    }),
  // Modul 28: akun broker perangkat dibuat dan dihapus OTOMATIS lewat plugin dynamic security Mosquitto?
  //   mati (bawaan)  = tidak: seperti Modul 21 (mosquitto_passwd oleh admin); kode klaim tetap jalan, akunnya dibuat tangan
  //   pusat          = di broker pusat (perangkat masuk langsung ke broker compose.cloud.yml, misalnya tanpa Pi)
  //   gerbang:<nama> = di broker gerbang Pi bernama itu, lewat jembatan (Node 1 masuk ke gerbang), misalnya gerbang:pi1
  AKUN_BROKER_OTOMATIS: z.preprocess(kosong, z.string().default("mati"))
    .refine((teks) => /^(mati|pusat|gerbang:[a-z0-9][a-z0-9-]{0,30})$/.test(teks),
      "tulis mati, pusat, atau gerbang:<nama gerbang> (huruf kecil, angka, dan -), misalnya gerbang:pi1")
    .transform((teks): ModeAkunBroker => teks.startsWith("gerbang:") ? { jenis: "gerbang", nama: teks.slice(8) }
      : teks === "pusat" ? { jenis: "pusat" } : { jenis: "mati" }),
  // Modul 28: pembaruan yang tidak ada kabarnya selama sekian menit ditandai kedaluwarsa (unduh + restart + 60 detik masa uji
  // biasanya selesai dalam 1-3 menit). Bawaan 10; lab penulis memendekkannya untuk menguji.
  OTA_BATAS_MENIT: z.preprocess(kosong, z.coerce.number().int().min(1).max(60).default(10)),
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
