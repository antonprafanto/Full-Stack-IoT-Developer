// mqtt.test.ts - uji pesan STATUS dari broker (Modul 25) TANPA broker, database, dan Telegram: pustaka mqtt dan tetangga
// mqtt.ts diganti tiruan (vi.mock); gudang memori (gudang.ts) tetap yang asli. Yang diuji: kabar status mana yang diteruskan
// ke Telegram (kabariStatus), termasuk "online" yang tiba sebagai pesan RETAINED sesudah broker dimulai ulang.
// Jalankan: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyBaseLogger } from "fastify";

const tiruan = vi.hoisted(() => ({
  pendengar: new Map<string, (...isi: unknown[]) => void>(), // acara klien MQTT tiruan ("message", "connect", ...)
  kabariStatus: vi.fn(),
}));
vi.mock("mqtt", () => ({
  default: { connect: () => ({ options: {}, on: (acara: string, fn: (...isi: unknown[]) => void) => tiruan.pendengar.set(acara, fn) }) },
}));
vi.mock("../db/arsip.ts", () => ({ arsipkanStatus: async () => {}, arsipkanTelemetry: async () => true, arsipkanVitals: async () => {} }));
vi.mock("./realtime.ts", () => ({ siarkanStatus: () => {}, siarkanTelemetry: () => {} }));
vi.mock("./perintah.ts", () => ({ catatLaporan: () => {}, perangkatMenyalaUlang: () => {} }));
vi.mock("./otomasi.ts", () => ({ kirimSemuaConfig: () => {}, nilaiBacaan: () => {} }));
vi.mock("./kejadian.ts", () => ({ catatKejadian: async () => {} }));
vi.mock("./telegram.ts", () => ({ kabari: async () => true, kabariStatus: tiruan.kabariStatus }));
vi.mock("./daftar.ts", () => ({ izinPerangkat: () => "terdaftar", catatAbaikan: () => {} })); // semua perangkat terdaftar

import { mulaiMqtt } from "./mqtt.ts";

const log = { info: () => {}, warn: () => {}, error: () => {} } as unknown as FastifyBaseLogger;
mulaiMqtt("mqtt://127.0.0.1:1", null, log);

// satu pesan status dari broker, persis seperti yang diterima backend (retained = pesan simpanan broker)
function statusTiba(deviceId: string, status: string, retained: boolean): void {
  tiruan.pendengar.get("message")?.(`rpm/${deviceId}/status`, Buffer.from(status), { retain: retained });
}

beforeEach(() => tiruan.kabariStatus.mockClear());

describe("status perangkat ke Telegram (kabariStatus)", () => {
  it("broker dimulai ulang: wasiat offline, lalu online RETAINED (perangkat tersambung lebih dulu) tetap diteruskan", () => {
    statusTiba("f00d00000001", "online", false);
    tiruan.kabariStatus.mockClear();
    statusTiba("f00d00000001", "offline", false); // broker berhenti: wasiat perangkat terbit (📴 menunggu 60 detik)
    statusTiba("f00d00000001", "online", true); // broker menyala lagi, perangkat lebih dulu: kabarnya pesan retained
    // tanpa online yang kedua, 📴 palsu terkirim 60 detik kemudian dan 📴 berikutnya untuk perangkat ini tidak pernah datang
    expect(tiruan.kabariStatus.mock.calls).toEqual([["f00d00000001", "offline"], ["f00d00000001", "online"]]);
  });

  it("offline RETAINED saat backend menyala = keadaan lama: tidak dikabarkan; status yang tidak berubah juga tidak", () => {
    statusTiba("f00d00000002", "offline", true);
    statusTiba("f00d00000002", "offline", false);
    expect(tiruan.kabariStatus).not.toHaveBeenCalled();
  });
});
