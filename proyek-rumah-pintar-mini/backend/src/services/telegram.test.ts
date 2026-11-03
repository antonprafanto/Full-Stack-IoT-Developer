// telegram.test.ts - uji telegram.ts (Modul 25) TANPA server Telegram: kelas Bot dari grammY diganti bot tiruan yang hanya
// mencatat panggilan sendMessage/sendDocument; InputFile tetap yang asli. Yang diuji: berkas laporan dikirim dengan NAMA
// berkasnya (bukan nama acak), dan kabar status 📴/✅ dengan penundaan 60 detik. Modul 28: berhenti sengaja (offline-mode)
// dikabarkan 🔄 dengan tenggang 3 menit, jadi pembaruan firmware dan rollback (±70 detik) tidak memicu 📴 palsu.
// Jalankan: npm test
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

import { kabariStatus, kirimBerkas, lupakanKabarStatus, mulaiTelegram } from "./telegram.ts";

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

describe("berhenti sengaja (offline-mode, Modul 28)", () => {
  const pesan = () => bot.sendMessage.mock.calls.map((c) => c[1]);

  it("🔄 seketika; online lagi (pembaruan berhasil, atau rollback ±70 detik) = ✅ berpasangan, TANPA 📴", () => {
    mulaiTelegram("123456:token-tiruan", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-31T01:00:00Z") });
    bot.sendMessage.mockClear();
    kabariStatus("f00d00000002", "offline-mode");
    expect(pesan()).toEqual(["🔄 f00d00000002 berhenti sengaja (pembaruan firmware atau restart), sebentar lagi online kembali"]);
    vi.advanceTimersByTime(70_000); // lebih lama dari tenggang offline biasa (60 detik)
    kabariStatus("f00d00000002", "online");
    vi.advanceTimersByTime(5 * 60_000);
    expect(pesan()).toEqual([
      "🔄 f00d00000002 berhenti sengaja (pembaruan firmware atau restart), sebentar lagi online kembali",
      "✅ f00d00000002 online lagi sesudah berhenti sengaja (70 detik)"]);
  });

  it("tidak kembali dalam 3 menit (juga bila wasiat offline datang di tengahnya): 📴, lalu ✅ saat online lagi", () => {
    mulaiTelegram("123456:token-tiruan", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-31T01:00:00Z") }); // 08.00 WIB
    bot.sendMessage.mockClear();
    kabariStatus("f00d00000003", "offline-mode");
    vi.advanceTimersByTime(30_000);
    kabariStatus("f00d00000003", "offline"); // tenggang 3 menit yang sedang berjalan tetap dipakai
    vi.advanceTimersByTime(60_000);
    expect(pesan()).toHaveLength(1); // belum ada 📴 sesudah 90 detik
    vi.advanceTimersByTime(90_000);
    expect(pesan().at(-1)).toBe("📴 f00d00000003 tidak kembali sesudah berhenti sengaja sejak 08.00 WIB");
    vi.advanceTimersByTime(7 * 60_000);
    kabariStatus("f00d00000003", "online");
    expect(pesan().at(-1)).toBe("✅ f00d00000003 online lagi (offline 10 menit)");
  });

  it("perangkat dinonaktifkan: kabar yang sedang menunggu dilupakan", () => {
    mulaiTelegram("123456:token-tiruan", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-31T01:00:00Z") });
    bot.sendMessage.mockClear();
    kabariStatus("f00d00000004", "offline");
    lupakanKabarStatus("f00d00000004");
    vi.advanceTimersByTime(10 * 60_000);
    expect(bot.sendMessage).not.toHaveBeenCalled();
  });
});
