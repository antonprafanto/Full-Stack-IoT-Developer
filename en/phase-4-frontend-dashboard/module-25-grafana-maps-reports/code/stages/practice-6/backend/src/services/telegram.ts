// telegram.ts - the Telegram bot (Module 19, grammY 1.46.0): alerts from the automation rules, /start to find out the
// chat_id, and /status for the owner only. Leave TELEGRAM_BOT_TOKEN empty in .env to turn it off.
import { Bot, GrammyError, HttpError } from "grammy";
import { INITIAL_RECORD, shouldNotify } from "../rules/engine.ts";
import type { NotifyRecord, Situation } from "../rules/engine.ts";
import { allDevices } from "./store.ts";
import { log } from "./log.ts";

let bot: Bot | undefined;
let ownerChat: number | undefined;
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }); // 2.4 -> "2.4"
const wibTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });

export function startTelegram(token: string, chatId: string, apiRoot: string): void {
  if (token === "") {
    log.info("Telegram notifications off: TELEGRAM_BOT_TOKEN is empty");
    return;
  }
  ownerChat = chatId === "" ? undefined : Number(chatId);
  // an empty apiRoot = the real Telegram server; the lab uses a mock Bot API server (TELEGRAM_API_ROOT)
  bot = new Bot(token, apiRoot === "" ? undefined : { client: { apiRoot } });
  bot.command("start", (ctx) => ctx.reply(`Hello! Your chat_id: ${ctx.chat.id}\nWrite this number as TELEGRAM_CHAT_ID in the backend's .env.`));
  bot.command("status", async (ctx) => {
    if (ctx.chat.id !== ownerChat) { // anyone can find the bot: serve its owner only
      await ctx.reply("Sorry, this bot only serves its owner.");
      return;
    }
    await ctx.reply(statusSummary());
  });
  bot.catch((error) => log.error(`Telegram bot error: ${String(error.error)}`)); // an error inside a command handler
  // start() only finishes when the bot stops, so DON'T wait for it (await); .catch catches 401 (wrong token) and 409
  bot.start({ drop_pending_updates: true, onStart: (info) => log.info(`Telegram bot @${info.username} ready (long polling)`) })
    .catch((error) => log.error(`Telegram bot stopped: ${(error as Error).message}`));
  if (ownerChat === undefined) log.warn("TELEGRAM_CHAT_ID is empty: send /start to the bot to find out your chat_id");
}

// Send one message to the owner. readingTs (optional) = the ts of the trigger reading, to measure the delay (pass: <= 10 s).
export async function notify(text: string, readingTs?: string): Promise<boolean> {
  if (bot === undefined || ownerChat === undefined) return false;
  try {
    await bot.api.sendMessage(ownerChat, text);
    const delay = readingTs === undefined ? ""
      : ` ${num.format((Date.now() - Date.parse(readingTs)) / 1000)} seconds after reading ${readingTs}`;
    log.info(`Telegram sent${delay}: ${text}`);
    return true;
  } catch (error) {
    if (error instanceof GrammyError) log.error(`Telegram refused the message: ${error.description}`); // the Bot API answered ok:false
    else if (error instanceof HttpError) log.error(`Telegram server unreachable: ${error.message}`);
    else log.error(`Telegram failed: ${(error as Error).message}`);
    return false;
  }
}

// Debouncing: notify only when the situation changes, and while it is still dangerous at most once every 30 minutes
// (shouldNotify). key = "rule:<number>". reminder = true for an ordinary reading during danger (not a change).
const records = new Map<string, NotifyRecord>();

export async function notifyIfNeeded(key: string, situation: Situation, text: string, readingTs: string,
  reminder = false): Promise<void> {
  const previous = records.get(key);
  if (reminder && previous === undefined) return; // nothing notified since the backend started: don't begin with a reminder
  const { send, record: updated } = shouldNotify(previous ?? INITIAL_RECORD, situation, Date.now());
  records.set(key, updated);
  if (send) await notify(text, readingTs);
}

// Device status: "offline" is only reported once it lasts 60 seconds (Wi-Fi that flickers doesn't make noise).
const offlineTimers = new Map<string, ReturnType<typeof setTimeout>>(); // device_id -> the 60-second timer
const offlineSince = new Map<string, number>(); // device_id -> since when it is offline (already reported)

export function notifyStatus(deviceId: string, status: string): void {
  if (status === "online") {
    const timer = offlineTimers.get(deviceId);
    if (timer !== undefined) { // back before 60 seconds: canceled, no message
      clearTimeout(timer);
      offlineTimers.delete(deviceId);
      return;
    }
    const since = offlineSince.get(deviceId);
    if (since !== undefined) {
      offlineSince.delete(deviceId);
      void notify(`✅ ${deviceId} back online (offline ${Math.round((Date.now() - since) / 60_000)} min)`);
    }
    return;
  }
  if (offlineTimers.has(deviceId) || offlineSince.has(deviceId)) return;
  const start = Date.now();
  offlineTimers.set(deviceId, setTimeout(() => {
    offlineTimers.delete(deviceId);
    offlineSince.set(deviceId, start);
    void notify(`📴 ${deviceId} offline since ${wibTime.format(start)} WIB`);
  }, 60_000));
}

// the answer to /status: the last state of every device in the in-memory store
function statusSummary(): string {
  const lines = [`📋 Mini Smart Home, ${wibTime.format(Date.now())} WIB`];
  for (const d of allDevices()) {
    lines.push(`${d.device_id} (${d.kind}): ${d.status}`);
    const t = d.telemetry;
    if (t !== null) lines.push(`  temperature ${t.temperature === null ? "-" : num.format(t.temperature)} °C, humidity ${t.humidity ?? "-"} %, soil ${t.soil ?? "-"} %`);
    const r = d.reported;
    if (r !== null) lines.push(`  fan ${r.fan ? "on" : "off"}, lamp ${r.lamp ? "on" : "off"}, curtain ${r.curtain}°`);
    if (d.vitals !== null) lines.push(`  signal ${d.vitals.rssi} dBm, uptime ${Math.floor(d.vitals.uptime_s / 60)} min`);
  }
  if (lines.length === 1) lines.push("No device has been heard since the backend started.");
  return lines.join("\n");
}

// stopping gracefully: confirm the last update to Telegram so that it isn't processed twice
export async function stopTelegram(): Promise<void> {
  if (bot?.isRunning()) await bot.stop();
}
