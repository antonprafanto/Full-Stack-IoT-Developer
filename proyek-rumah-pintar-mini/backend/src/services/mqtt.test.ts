// mqtt.test.ts - uji pesan STATUS dari broker (Modul 25) TANPA broker, database, dan Telegram: pustaka mqtt dan tetangga
// mqtt.ts diganti tiruan (vi.mock); gudang memori (gudang.ts) tetap yang asli. Yang diuji: kabar status mana yang diteruskan
// ke Telegram (kabariStatus), termasuk "online" yang tiba sebagai pesan RETAINED sesudah broker dimulai ulang.
// Sejak Modul 27 juga: nama klien dan sesi yang diminta backend saat tersambung (opsi mqtt.connect).
// Sejak Modul 28 juga: vitals kontrak 1.6 (fw, reset_reason, ota), kalimat "berhenti sengaja" untuk offline-mode, perintah
// update dan config yang diterbitkan (retained atau tidak), dan jawaban akun broker di topik kontrol.
// Jalankan: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyBaseLogger } from "fastify";

const tiruan = vi.hoisted(() => ({
  pendengar: new Map<string, (...isi: unknown[]) => void>(), // acara klien MQTT tiruan ("message", "connect", ...)
  opsi: [] as Record<string, unknown>[], // opsi setiap panggilan mqtt.connect, berurutan
  terbit: [] as { topik: string; isi: string; opsi: { qos: number; retain: boolean } }[], // Modul 28: pesan yang diterbitkan
  langganan: [] as string[], // Modul 28: topik yang dilanggan
  kabariStatus: vi.fn(),
  kejadian: [] as { jenis: string; pesan: string }[],
  catatVitalsPembaruan: vi.fn(),
  catatFw: vi.fn(),
  serahkanJawabanKontrol: vi.fn(),
}));
vi.mock("mqtt", () => ({
  default: {
    connect: (_url: string, opsi: Record<string, unknown>) => {
      tiruan.opsi.push(opsi);
      return { options: {}, connected: true,
        on: (acara: string, fn: (...isi: unknown[]) => void) => tiruan.pendengar.set(acara, fn),
        subscribe: (topik: string) => { tiruan.langganan.push(topik); },
        publish: (topik: string, isi: string, opsi: { qos: number; retain: boolean }) => { tiruan.terbit.push({ topik, isi, opsi }); } };
    },
  },
}));
vi.mock("../db/arsip.ts", () => ({ arsipkanStatus: async () => {}, arsipkanTelemetry: async () => true, arsipkanVitals: async () => {} }));
vi.mock("./realtime.ts", () => ({ siarkanStatus: () => {}, siarkanTelemetry: () => {} }));
vi.mock("./perintah.ts", () => ({ catatLaporan: () => {}, perangkatMenyalaUlang: () => {} }));
vi.mock("./otomasi.ts", () => ({ kirimSemuaConfig: () => {}, nilaiBacaan: () => {} }));
vi.mock("./kejadian.ts", () => ({ catatKejadian: (k: { jenis: string; pesan: string }) => { tiruan.kejadian.push(k); } }));
vi.mock("./telegram.ts", () => ({ kabari: async () => true, kabariStatus: tiruan.kabariStatus }));
vi.mock("./daftar.ts", () => ({ izinPerangkat: () => "terdaftar", catatAbaikan: () => {} })); // semua perangkat terdaftar
// Modul 28: tetangga baru. Tanpa tiruan ini, env.ts (diimpor akun-broker.ts dan ota.ts) memeriksa .env yang tidak ada di
// tes lalu menghentikan proses (temuan lab riset M28: berkas tes ini gagal dimuat)
vi.mock("./akun-broker.ts", () => ({
  topikKontrol: () => ({ perintah: "rpm-gerbang/pi1/dynamic-security/v1", jawaban: "rpm-gerbang/pi1/dynamic-security/v1/response" }),
  serahkanJawabanKontrol: tiruan.serahkanJawabanKontrol,
}));
vi.mock("./ota.ts", () => ({ catatFw: tiruan.catatFw, catatVitalsPembaruan: tiruan.catatVitalsPembaruan }));

import { hapusConfig, kalimatStatus, kirimConfig, kirimUpdate, mulaiMqtt, terbitkanKontrol } from "./mqtt.ts";

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

describe("nama klien dan sesi MQTT backend (Modul 27)", () => {
  it("tanpa akun: nama klien acak backend-xxxxxx dan sesi bersih (clean true), seperti sebelum Modul 27", () => {
    const opsi = tiruan.opsi[0]; // panggilan mulaiMqtt di atas (tanpa akun)
    expect(opsi?.clientId).toMatch(/^backend-[0-9a-f]{1,6}$/);
    expect(opsi?.clean).toBe(true);
    expect(opsi?.username).toBeUndefined();
  });

  it("dengan akun: nama klien = nama akun dan sesi TETAP (clean false), supaya broker menahan pesan QoS 1 selama backend putus", () => {
    mulaiMqtt("mqtt://127.0.0.1:1", { username: "backend", password: "sandi-uji" }, log);
    const opsi = tiruan.opsi.at(-1);
    expect(opsi?.clientId).toBe("backend");
    expect(opsi?.clean).toBe(false);
    expect(opsi?.username).toBe("backend");
  });
});

// Modul 28 ------------------------------------------------------------------------------------------------------------
const pesanTiba = (topik: string, isi: string) => tiruan.pendengar.get("message")?.(topik, Buffer.from(isi), { retain: false });
const VITALS_16 = { ts: "2026-10-31T01:00:00Z", rssi: -60, uptime_s: 12, heap_free: 180000 };

describe("kontrak 1.6 di mqtt.ts (Modul 28)", () => {
  it("offline-mode = berhenti SENGAJA: kalimat buku kejadian tanpa kata terputus (laporan harian tidak menghitungnya)", () => {
    tiruan.kejadian.length = 0;
    statusTiba("f00d00000003", "online", false);
    statusTiba("f00d00000003", "offline-mode", false);
    expect(kalimatStatus("f00d00000003", "offline-mode")).not.toContain("terputus");
    expect(kalimatStatus("f00d00000003", "offline")).toBe("f00d00000003 terputus (offline)");
    expect(tiruan.kabariStatus).toHaveBeenLastCalledWith("f00d00000003", "offline-mode");
  });

  it("vitals firmware 1.7.0 (reset_reason + fw + ota) diterima dan diteruskan ke pencatat pembaruan; vitals 1.6.0 tetap sah", () => {
    tiruan.catatVitalsPembaruan.mockClear();
    pesanTiba("rpm/f00d00000001/vitals", JSON.stringify({ ...VITALS_16, reset_reason: "SW", fw: "1.7.1",
      ota: { id: "c-20261031-010000-1", hasil: "berhasil", versi: "1.7.1" } }));
    pesanTiba("rpm/f00d00000001/vitals", JSON.stringify(VITALS_16)); // bentuk lama
    expect(tiruan.catatVitalsPembaruan).toHaveBeenCalledTimes(2);
    expect(tiruan.catatVitalsPembaruan.mock.calls[0][1]).toMatchObject({ fw: "1.7.1", reset_reason: "SW" });
  });

  it("vitals dengan reset_reason tanpa fw, atau alasan di luar tujuh nilai, DITOLAK (tidak diteruskan)", () => {
    tiruan.catatVitalsPembaruan.mockClear();
    pesanTiba("rpm/f00d00000001/vitals", JSON.stringify({ ...VITALS_16, reset_reason: "SW" }));
    pesanTiba("rpm/f00d00000001/vitals", JSON.stringify({ ...VITALS_16, reset_reason: "REBOOT", fw: "1.7.0" }));
    expect(tiruan.catatVitalsPembaruan).not.toHaveBeenCalled();
  });

  it("telemetry membawa fw: versi dicatat untuk /armada (juga Node 2, dari paketnya)", () => {
    tiruan.catatFw.mockClear();
    pesanTiba("rpm/246f28b1c7d4/telemetry", JSON.stringify({ ts: "2026-10-31T01:00:00Z", fw: "1.0.0", suhu: 29.4, kelembapan: 78,
      tekanan: 1008.6, suhu_tanah: 27.3, tanah: 41 }));
    expect(tiruan.catatFw).toHaveBeenCalledWith("246f28b1c7d4", "1.0.0");
  });

  it("update TIDAK PERNAH retained (QoS 1); config gabungan retained; hapusConfig = pesan kosong retained", () => {
    tiruan.terbit.length = 0;
    kirimUpdate("f00d00000001", "c-20261031-010000-2", { versi: "1.7.1", url: "https://iot.namaanda.my.id/fw/node-1/1.7.1.bin",
      sha256: "a".repeat(64), ukuran: 1196032 });
    kirimConfig("f00d00000001", "c-20261031-010000-3", { ambang: { suhu_kipas_on: 30 }, jeda: { vitals_s: 60 } });
    hapusConfig("f00d00000001");
    expect(tiruan.terbit.map((t) => t.opsi)).toEqual([{ qos: 1, retain: false }, { qos: 1, retain: true }, { qos: 1, retain: true }]);
    expect(JSON.parse(tiruan.terbit[0].isi)).toMatchObject({ aksi: "update", versi: "1.7.1", ukuran: 1196032 });
    expect(JSON.parse(tiruan.terbit[1].isi)).toMatchObject({ aksi: "config", ambang: { suhu_kipas_on: 30 }, jeda: { vitals_s: 60 } });
    expect(tiruan.terbit[2]).toMatchObject({ topik: "rpm/f00d00000001/cmd", isi: "" });
  });

  it("topik kontrol akun broker: dilanggan saat tersambung, jawabannya diserahkan ke akun-broker.ts (bukan dianggap rpm/...)", () => {
    tiruan.pendengar.get("connect")?.();
    expect(tiruan.langganan).toContain("rpm-gerbang/pi1/dynamic-security/v1/response");
    pesanTiba("rpm-gerbang/pi1/dynamic-security/v1/response", '{"responses":[]}');
    expect(tiruan.serahkanJawabanKontrol).toHaveBeenCalledWith('{"responses":[]}');
    expect(terbitkanKontrol("rpm-gerbang/pi1/dynamic-security/v1", "{}")).toBe(true);
    expect(tiruan.terbit.at(-1)?.opsi).toEqual({ qos: 1, retain: false });
  });
});
