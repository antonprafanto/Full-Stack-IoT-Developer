// laporan-mingguan.test.ts - uji Tantangan 3 (laporan mingguan) TANPA database dan TANPA Telegram (pola laporan.test.ts):
// rentang minggu lalu Senin-Senin WIB (juga di laptop berzona lain), nama berkas, keterangan, dan pengirimannya.
// Jalankan: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.TZ = "America/New_York"; // laptop "tes" di UTC-4: ketahuan kalau kode memakai jam laptop
});

const tiruan = vi.hoisted(() => ({
  query: vi.fn(),
  alasanTelegramMati: vi.fn((): string | null => null),
  kirimBerkas: vi.fn(async (_nama: string, _isi: string, _keterangan: string) => true),
}));
vi.mock("../db/pool.ts", () => ({ pool: { query: tiruan.query } }));
vi.mock("./telegram.ts", () => ({ alasanTelegramMati: tiruan.alasanTelegramMati, kirimBerkas: tiruan.kirimBerkas, kabari: async () => true }));

import { keteranganMingguan, kirimLaporanMingguan, namaLaporanMingguan, rentangMingguan } from "./laporan-mingguan.ts";

beforeEach(() => {
  tiruan.query.mockReset();
  tiruan.alasanTelegramMati.mockReturnValue(null);
  tiruan.kirimBerkas.mockClear();
});

describe("rentang laporan mingguan (WIB)", () => {
  it("Senin 26 Okt 2026 07.00 WIB: minggu lalu = Senin 19 Okt 00.00 sampai Senin 26 Okt 00.00 WIB", () => {
    const r = rentangMingguan(new Date("2026-10-26T00:00:00Z")); // 07.00 WIB
    expect(r.dari.toISOString()).toBe("2026-10-18T17:00:00.000Z"); // 19 Okt 00.00 WIB
    expect(r.sampai.toISOString()).toBe("2026-10-25T17:00:00.000Z"); // 26 Okt 00.00 WIB
    expect(namaLaporanMingguan(r)).toBe("laporan-mingguan-2026-10-19.csv");
    expect(keteranganMingguan(r, 3)).toBe("📊 Laporan mingguan Rumah Pintar Mini 19 Okt 2026 - 25 Okt 2026: 3 perangkat");
  });

  it("hari lain dalam minggu yang sama (Kamis, Minggu malam) tetap memberi minggu lalu yang sama", () => {
    expect(rentangMingguan(new Date("2026-10-29T05:00:00Z")).tanggal).toBe("2026-10-19"); // Kamis 29 Okt 12.00 WIB
    expect(rentangMingguan(new Date("2026-11-01T16:59:59Z")).tanggal).toBe("2026-10-19"); // Minggu 1 Nov 23.59.59 WIB
    expect(rentangMingguan(new Date("2026-11-01T17:00:00Z")).tanggal).toBe("2026-10-26"); // Senin 2 Nov 00.00 WIB
  });

  it("pergantian hari mengikuti WIB, bukan jam laptop (di UTC-4 Senin 00.00 WIB masih Minggu siang)", () => {
    const senin = new Date("2026-10-25T17:00:00Z"); // Senin 26 Okt 00.00 WIB
    expect(senin.getDay()).toBe(0); // jam laptop tes: Minggu 25 Okt 13.00
    expect(rentangMingguan(senin).tanggal).toBe("2026-10-19");
  });
});

describe("kirimLaporanMingguan", () => {
  it("Telegram mati: dilewati, database tidak dibaca", async () => {
    tiruan.alasanTelegramMati.mockReturnValue("TELEGRAM_BOT_TOKEN belum diisi");
    expect(await kirimLaporanMingguan()).toEqual({ status: "dilewati", pesan: "Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)" });
    expect(tiruan.query).not.toHaveBeenCalled();
  });

  it("terkirim: kueri laporan harian dengan rentang 7 hari, CSV resep Modul 23, nama dan keterangan mingguan", async () => {
    tiruan.query.mockResolvedValue({ rows: [{ device_id: "f00d00000001", nama: "Node 1", jenis: "node1", jumlah_bacaan: 60480,
      suhu_rata: 28.5, suhu_min: 22, suhu_maks: 33.1, kelembapan_rata: 70.2, tanah_rata: 40.1, tanah_min: 20, rssi_rata: -66,
      rssi_terburuk: -79, heap_terendah: 180000, menyala_ulang: 1, kali_terputus: 2 }] });
    const hasil = await kirimLaporanMingguan(new Date("2026-10-26T00:00:00Z"));
    expect(hasil.status).toBe("terkirim");
    const [kueri, parameter] = tiruan.query.mock.calls[0];
    expect(kueri).toContain("FROM readings_per_jam"); // kueri yang SAMA dengan laporan harian
    expect(parameter).toEqual([new Date("2026-10-18T17:00:00Z"), new Date("2026-10-25T17:00:00Z")]);
    const [nama, isi, keterangan] = tiruan.kirimBerkas.mock.calls[0];
    expect(nama).toBe("laporan-mingguan-2026-10-19.csv");
    expect(isi.startsWith("\uFEFFdevice_id;nama;jenis;jumlah_bacaan;")).toBe(true);
    expect(isi).toContain("\r\nf00d00000001;Node 1;node1;60480;28,5;22;33,1;70,2;40,1;20;-66;-79;180000;1;2\r\n");
    expect(keterangan).toBe("📊 Laporan mingguan Rumah Pintar Mini 19 Okt 2026 - 25 Okt 2026: 1 perangkat");
  });
});
