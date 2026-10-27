// telegram.ts - bot Telegram (Modul 19, grammY 1.46.0): peringatan dari aturan otomatis, /start untuk mengetahui
// chat_id, dan /status khusus pemilik. Kosongkan TELEGRAM_BOT_TOKEN di .env untuk mematikannya.
// Modul 25: bot yang sama juga mengirim BERKAS (laporan harian CSV) lewat kirimBerkas().
import { Bot, GrammyError, HttpError, InputFile } from "grammy";
import { CATATAN_AWAL, perluKabari } from "../aturan/mesin.ts";
import type { CatatanKabar, Situasi } from "../aturan/mesin.ts";
import { semuaPerangkat } from "./gudang.ts";
import { log } from "./log.ts";

let bot: Bot | undefined;
let chatPemilik: number | undefined;
const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }); // 2.4 -> "2,4"
const jamWib = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });

export function mulaiTelegram(token: string, chatId: string, apiRoot: string): void {
  if (token === "") {
    log.info("notifikasi Telegram mati: TELEGRAM_BOT_TOKEN belum diisi");
    return;
  }
  chatPemilik = chatId === "" ? undefined : Number(chatId);
  // apiRoot kosong = server Telegram sungguhan; lab memakai server Bot API tiruan (TELEGRAM_API_ROOT)
  bot = new Bot(token, apiRoot === "" ? undefined : { client: { apiRoot } });
  bot.command("start", (ctx) => ctx.reply(`Halo! chat_id kamu: ${ctx.chat.id}\nTulis angka ini sebagai TELEGRAM_CHAT_ID di .env backend.`));
  bot.command("status", async (ctx) => {
    if (ctx.chat.id !== chatPemilik) { // siapa pun bisa menemukan bot: layani pemiliknya saja
      await ctx.reply("Maaf, bot ini hanya melayani pemiliknya.");
      return;
    }
    await ctx.reply(ringkasanStatus());
  });
  bot.catch((galat) => log.error(`galat bot Telegram: ${String(galat.error)}`)); // galat di dalam penangan perintah
  // start() baru selesai saat bot berhenti, jadi JANGAN ditunggu (await); .catch menangkap 401 (token salah) dan 409
  bot.start({ drop_pending_updates: true, onStart: (info) => log.info(`bot Telegram @${info.username} siap (long polling)`) })
    .catch((galat) => log.error(`bot Telegram berhenti: ${(galat as Error).message}`));
  if (chatPemilik === undefined) log.warn("TELEGRAM_CHAT_ID belum diisi: kirim /start ke bot untuk mengetahui chat_id-mu");
}

// Kirim satu pesan ke pemilik. tsBacaan (pilihan) = ts bacaan pemicu, untuk mengukur jedanya (syarat lulus <= 10 detik).
export async function kabari(teks: string, tsBacaan?: string): Promise<boolean> {
  if (bot === undefined || chatPemilik === undefined) return false;
  try {
    await bot.api.sendMessage(chatPemilik, teks);
    const jeda = tsBacaan === undefined ? ""
      : ` ${angka.format((Date.now() - Date.parse(tsBacaan)) / 1000)} detik setelah bacaan ${tsBacaan}`;
    log.info(`Telegram terkirim${jeda}: ${teks}`);
    return true;
  } catch (galat) {
    if (galat instanceof GrammyError) log.error(`Telegram menolak pesan: ${galat.description}`); // Bot API menjawab ok:false
    else if (galat instanceof HttpError) log.error(`server Telegram tidak terjangkau: ${galat.message}`);
    else log.error(`Telegram gagal: ${(galat as Error).message}`);
    return false;
  }
}

// Modul 25: kenapa Telegram tidak bisa dipakai sekarang? null = siap mengirim.
export function alasanTelegramMati(): string | null {
  if (bot === undefined) return "TELEGRAM_BOT_TOKEN belum diisi";
  if (chatPemilik === undefined) return "TELEGRAM_CHAT_ID belum diisi";
  return null;
}

// Modul 25: kirim satu berkas ke pemilik, dengan keterangan (caption) di bawahnya. Isinya teks (misalnya CSV) yang
// dibungkus Buffer: new InputFile("teks...") TIDAK bisa dipakai, karena grammY menganggap teks sebagai JALUR berkas di disk
// (galat ENOENT). Nama berkas wajib ditulis, supaya Telegram menampilkannya sebagai laporan-2026-10-26.csv.
export async function kirimBerkas(nama: string, isi: string, keterangan: string): Promise<boolean> {
  if (bot === undefined || chatPemilik === undefined) return false;
  try {
    const berkas = new InputFile(Buffer.from(isi, "utf8"), nama); // teks -> byte UTF-8 (BOM ikut, 3 byte)
    await bot.api.sendDocument(chatPemilik, berkas, { caption: keterangan }); // berkas sampai 50 MB, keterangan 1024 huruf
    log.info(`Telegram terkirim: berkas ${nama} (${Buffer.byteLength(isi, "utf8")} byte), ${keterangan}`);
    return true;
  } catch (galat) { // sama dengan kabari(): ditolak Bot API, server tak terjangkau, atau galat lain
    if (galat instanceof GrammyError) log.error(`Telegram menolak berkas ${nama}: ${galat.description}`);
    else if (galat instanceof HttpError) log.error(`server Telegram tidak terjangkau: ${galat.message}`);
    else log.error(`Telegram gagal mengirim berkas ${nama}: ${(galat as Error).message}`);
    return false;
  }
}

// Debouncing: kabari hanya saat situasi berubah, dan selama masih bahaya paling sering 30 menit sekali (perluKabari).
// kunci = "aturan:<nomor>". pengingat = true untuk bacaan biasa selama bahaya (bukan perubahan).
const catatan = new Map<string, CatatanKabar>();

export async function kabariKalauPerlu(kunci: string, situasi: Situasi, teks: string, tsBacaan: string,
  pengingat = false): Promise<void> {
  const lama = catatan.get(kunci);
  if (pengingat && lama === undefined) return; // belum pernah mengabari sejak backend menyala: jangan mulai dari pengingat
  const { kirim, catatan: baru } = perluKabari(lama ?? CATATAN_AWAL, situasi, Date.now());
  catatan.set(kunci, baru);
  if (kirim) await kabari(teks, tsBacaan);
}

// Status perangkat: "offline" baru dikabarkan kalau bertahan 60 detik (WiFi yang berkedip tidak membuat ramai).
const tundaOffline = new Map<string, ReturnType<typeof setTimeout>>(); // device_id -> pengatur waktu 60 detik
const sejakOffline = new Map<string, number>(); // device_id -> kapan offline (yang sudah dikabarkan)

export function kabariStatus(deviceId: string, status: string): void {
  if (status === "online") {
    const pengatur = tundaOffline.get(deviceId);
    if (pengatur !== undefined) { // kembali sebelum 60 detik: batal, tidak ada pesan
      clearTimeout(pengatur);
      tundaOffline.delete(deviceId);
      return;
    }
    const sejak = sejakOffline.get(deviceId);
    if (sejak !== undefined) {
      sejakOffline.delete(deviceId);
      void kabari(`✅ ${deviceId} online lagi (offline ${Math.round((Date.now() - sejak) / 60_000)} menit)`);
    }
    return;
  }
  if (tundaOffline.has(deviceId) || sejakOffline.has(deviceId)) return;
  const mulai = Date.now();
  tundaOffline.set(deviceId, setTimeout(() => {
    tundaOffline.delete(deviceId);
    sejakOffline.set(deviceId, mulai);
    void kabari(`📴 ${deviceId} offline sejak ${jamWib.format(mulai)} WIB`);
  }, 60_000));
}

// isi balasan /status: keadaan terakhir setiap perangkat di gudang memori
function ringkasanStatus(): string {
  const baris = [`📋 Rumah Pintar Mini, ${jamWib.format(Date.now())} WIB`];
  for (const p of semuaPerangkat()) {
    baris.push(`${p.device_id} (${p.jenis}): ${p.status}`);
    const t = p.telemetry;
    if (t !== null) baris.push(`  suhu ${t.suhu === null ? "-" : angka.format(t.suhu)} °C, kelembapan ${t.kelembapan ?? "-"} %, tanah ${t.tanah ?? "-"} %`);
    const r = p.reported;
    if (r !== null) baris.push(`  kipas ${r.kipas ? "menyala" : "padam"}, lampu ${r.lampu ? "menyala" : "padam"}, tirai ${r.tirai}°`);
    if (p.vitals !== null) baris.push(`  sinyal ${p.vitals.rssi} dBm, menyala ${Math.floor(p.vitals.uptime_s / 60)} menit`);
  }
  if (baris.length === 1) baris.push("Belum ada perangkat yang terdengar sejak backend menyala.");
  return baris.join("\n");
}

// berhenti dengan rapi: konfirmasi update terakhir ke Telegram supaya tidak diproses dua kali
export async function hentikanTelegram(): Promise<void> {
  if (bot?.isRunning()) await bot.stop();
}
