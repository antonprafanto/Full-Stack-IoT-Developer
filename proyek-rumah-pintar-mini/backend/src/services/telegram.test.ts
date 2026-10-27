// telegram.test.ts - uji telegram.ts (Modul 25) TANPA server Telegram: kelas Bot dari grammY diganti bot tiruan yang hanya
// mencatat panggilan sendMessage/sendDocument; InputFile tetap yang asli. Yang diuji: berkas laporan dikirim dengan NAMA
// berkasnya (bukan nama acak), dan kabar status 📴/✅ dengan penundaan 60 detik. Jalankan: npm test
import { afterEach, describe, expect, it, vi } from "vitest";
import { InputFile } from "grammy";

const bot = vi.hoisted(() => ({
  sendMessage: vi.fn(async (_chat: number, _teks: string) => ({})),
  sendDocument: vi.fn(async (_chat: number, _berkas: unknown, _pilihan: unknown) => ({})),
}));
vi.mock("grammy", async (asli) => ({
  ...(await asli<typeof import("grammy")>()), // InputFile, GrammyError, HttpError asli
  Bot: class {
    api = { sendMessage: bot.sendMessage, sendDocument: bot.sendDocument };
    command() {}
    catch() {}
    start() { return new Promise(() => {}); } // long polling tiruan: tidak pernah selesai, tidak menghubungi siapa pun
    isRunning() { return false; }
  },
}));

import { kabariStatus, kirimBerkas, mulaiTelegram } from "./telegram.ts";

afterEach(() => vi.useRealTimers());

describe("telegram.ts dengan bot tiruan", () => {
  it("Telegram mati (token kosong): berkas tidak dikirim", async () => {
    expect(await kirimBerkas("laporan-2026-10-26.csv", "\uFEFFa;b\r\n", "keterangan")).toBe(false);
    expect(bot.sendDocument).not.toHaveBeenCalled();
  });

  it("kirimBerkas: sendDocument dengan InputFile BERNAMA laporan-….csv dan keterangannya", async () => {
    mulaiTelegram("123456:token-tiruan", "777000111", "");
    expect(await kirimBerkas("laporan-2026-10-26.csv", "\uFEFFa;b\r\n", "📊 keterangan")).toBe(true);
    const [chat, berkas, pilihan] = bot.sendDocument.mock.calls[0];
    expect(chat).toBe(777000111);
    expect(berkas).toBeInstanceOf(InputFile);
    expect((berkas as InputFile).filename).toBe("laporan-2026-10-26.csv"); // tanpa nama: Telegram menampilkan nama acak
    expect(pilihan).toEqual({ caption: "📊 keterangan" });
  });

  it("kabariStatus: kembali sebelum 60 detik = tanpa pesan; offline 60 detik = 📴; lalu online = ✅", async () => {
    mulaiTelegram("123456:token-tiruan", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-27T00:00:00Z") }); // 07.00 WIB
    kabariStatus("f00d00000001", "offline");
    vi.advanceTimersByTime(30_000);
    kabariStatus("f00d00000001", "online"); // WiFi berkedip 30 detik: dibatalkan
    vi.advanceTimersByTime(60_000);
    expect(bot.sendMessage).not.toHaveBeenCalled();
    kabariStatus("f00d00000001", "offline");
    vi.advanceTimersByTime(60_000);
    expect(bot.sendMessage).toHaveBeenLastCalledWith(777000111, "📴 f00d00000001 offline sejak 07.01 WIB");
    vi.advanceTimersByTime(4 * 60_000);
    kabariStatus("f00d00000001", "online");
    expect(bot.sendMessage).toHaveBeenLastCalledWith(777000111, "✅ f00d00000001 online lagi (offline 5 menit)");
  });
});
