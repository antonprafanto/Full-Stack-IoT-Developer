// telegram.test.ts - tests for telegram.ts (Module 25) WITHOUT a Telegram server: grammY's Bot class is replaced by a mock bot that
// only records the sendMessage/sendDocument calls; InputFile stays the real one. What is tested: the report file is sent with its
// file NAME (not a random name), and the 📴/✅ status messages with their 60-second delay. Module 28: stopping on purpose (offline-mode)
// is reported with 🔄 and a 3-minute grace, so firmware updates and rollbacks (±70 seconds) don't send a false 📴.
// Run: npm test
import { afterEach, describe, expect, it, vi } from "vitest";
import { InputFile } from "grammy";

const bot = vi.hoisted(() => ({
  sendMessage: vi.fn(async (_chat: number, _text: string) => ({})),
  sendDocument: vi.fn(async (_chat: number, _file: unknown, _options: unknown) => ({})),
}));
vi.mock("grammy", async (original) => ({
  ...(await original<typeof import("grammy")>()), // the real InputFile, GrammyError, HttpError
  Bot: class {
    api = { sendMessage: bot.sendMessage, sendDocument: bot.sendDocument };
    command() {}
    catch() {}
    start() { return new Promise(() => {}); } // mock long polling: never finishes, contacts nobody
    isRunning() { return false; }
  },
}));

import { notifyStatus, sendFile, forgetStatusNotice, startTelegram } from "./telegram.ts";

afterEach(() => vi.useRealTimers());

describe("telegram.ts with a mock bot", () => {
  it("Telegram off (empty token): the file isn't sent", async () => {
    expect(await sendFile("report-2026-10-26.csv", "\uFEFFa,b\r\n", "caption")).toBe(false);
    expect(bot.sendDocument).not.toHaveBeenCalled();
  });

  it("sendFile: sendDocument with an InputFile NAMED report-….csv and its caption", async () => {
    startTelegram("123456:fake-token", "777000111", "");
    expect(await sendFile("report-2026-10-26.csv", "\uFEFFa,b\r\n", "📊 caption")).toBe(true);
    const [chat, file, options] = bot.sendDocument.mock.calls[0];
    expect(chat).toBe(777000111);
    expect(file).toBeInstanceOf(InputFile);
    expect((file as InputFile).filename).toBe("report-2026-10-26.csv"); // without a name: Telegram shows a random name
    expect(options).toEqual({ caption: "📊 caption" });
  });

  it("notifyStatus: back before 60 seconds = no message; offline for 60 seconds = 📴; then online = ✅", async () => {
    startTelegram("123456:fake-token", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-27T00:00:00Z") }); // 07:00 WIB
    notifyStatus("f00d00000001", "offline");
    vi.advanceTimersByTime(30_000);
    notifyStatus("f00d00000001", "online"); // Wi-Fi flickers for 30 seconds: cancelled
    vi.advanceTimersByTime(60_000);
    expect(bot.sendMessage).not.toHaveBeenCalled();
    notifyStatus("f00d00000001", "offline");
    vi.advanceTimersByTime(60_000);
    expect(bot.sendMessage).toHaveBeenLastCalledWith(777000111, "📴 f00d00000001 offline since 07:01 WIB");
    vi.advanceTimersByTime(4 * 60_000);
    notifyStatus("f00d00000001", "online");
    expect(bot.sendMessage).toHaveBeenLastCalledWith(777000111, "✅ f00d00000001 back online (offline 5 min)");
  });
});

describe("stopping on purpose (offline-mode, Module 28)", () => {
  const messages = () => bot.sendMessage.mock.calls.map((c) => c[1]);

  it("🔄 at once; online again (a successful update, or a rollback after ±70 seconds) = a matching ✅, WITHOUT 📴", () => {
    startTelegram("123456:fake-token", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-31T01:00:00Z") });
    bot.sendMessage.mockClear();
    notifyStatus("f00d00000002", "offline-mode");
    expect(messages()).toEqual(["🔄 f00d00000002 stopped on purpose (firmware update or restart), back online shortly"]);
    vi.advanceTimersByTime(70_000); // longer than the ordinary offline grace (60 seconds)
    notifyStatus("f00d00000002", "online");
    vi.advanceTimersByTime(5 * 60_000);
    expect(messages()).toEqual([
      "🔄 f00d00000002 stopped on purpose (firmware update or restart), back online shortly",
      "✅ f00d00000002 online again after stopping on purpose (70 seconds)"]);
  });

  it("doesn't come back within 3 minutes (also when the offline will arrives meanwhile): 📴, then ✅ when it is online again", () => {
    startTelegram("123456:fake-token", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-31T01:00:00Z") }); // 08:00 WIB
    bot.sendMessage.mockClear();
    notifyStatus("f00d00000003", "offline-mode");
    vi.advanceTimersByTime(30_000);
    notifyStatus("f00d00000003", "offline"); // the 3-minute grace that is running stays in use
    vi.advanceTimersByTime(60_000);
    expect(messages()).toHaveLength(1); // no 📴 yet after 90 seconds
    vi.advanceTimersByTime(90_000);
    expect(messages().at(-1)).toBe("📴 f00d00000003 hasn't come back after stopping on purpose at 08:00 WIB");
    vi.advanceTimersByTime(7 * 60_000);
    notifyStatus("f00d00000003", "online");
    expect(messages().at(-1)).toBe("✅ f00d00000003 back online (offline 10 min)");
  });

  it("a deactivated device: the notices still waiting are forgotten", () => {
    startTelegram("123456:fake-token", "777000111", "");
    vi.useFakeTimers({ now: new Date("2026-10-31T01:00:00Z") });
    bot.sendMessage.mockClear();
    notifyStatus("f00d00000004", "offline");
    forgetStatusNotice("f00d00000004");
    vi.advanceTimersByTime(10 * 60_000);
    expect(bot.sendMessage).not.toHaveBeenCalled();
  });
});
