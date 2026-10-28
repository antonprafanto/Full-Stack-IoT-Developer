// laporan.test.ts - uji laporan harian (Modul 25) TANPA database dan TANPA Telegram: kolam database (pool.ts) dan bot
// (telegram.ts) diganti tiruan (vi.mock). Yang diuji: rentang "kemarin" 00.00-24.00 WIB (juga di laptop berzona lain), nama
// berkas, keterangan, isi CSV, apa yang terjadi saat Telegram mati, menolak, atau database tidak bisa dibaca, dan pilihan
// jadwal node-cron (node-cron juga diganti tiruan: tes tidak menunggu jam 07.00). Jalankan: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: beri setelan palsu yang sah (tidak ada yang benar-benar dihubungi)
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  // laptop "tes" ini sengaja di zona yang sangat jauh dari WIB (UTC-4), supaya ketahuan kalau kode diam-diam memakai jam laptop
  process.env.TZ = "America/New_York";
});

const tiruan = vi.hoisted(() => ({
  query: vi.fn(),
  alasanTelegramMati: vi.fn((): string | null => null),
  kirimBerkas: vi.fn(async (_nama: string, _isi: string, _keterangan: string) => true),
  kabari: vi.fn(async (_teks: string) => true),
  // node-cron tiruan: mencatat cron.schedule(ekspresi, tugas, pilihan) dan pendengar acara tugasnya
  jadwal: [] as [string, (konteks: { date: Date }) => Promise<void>, Record<string, unknown>][],
  acara: new Map<string, (konteks: { date: Date }) => void>(),
}));
vi.mock("../db/pool.ts", () => ({ pool: { query: tiruan.query } }));
vi.mock("./telegram.ts", () => ({
  alasanTelegramMati: tiruan.alasanTelegramMati,
  kirimBerkas: tiruan.kirimBerkas,
  kabari: tiruan.kabari,
}));
vi.mock("node-cron", () => ({
  default: {
    schedule: (ekspresi: string, tugas: (konteks: { date: Date }) => Promise<void>, pilihan: Record<string, unknown>) => {
      tiruan.jadwal.push([ekspresi, tugas, pilihan]);
      return { on: (nama: string, fn: (konteks: { date: Date }) => void) => tiruan.acara.set(nama, fn), getNextRun: () => null };
    },
  },
}));

import { buatLaporanCsv, keteranganLaporan, kirimLaporan, mulaiLaporan, namaLaporan, rentangLaporan } from "./laporan.ts";
import type { BarisLaporan } from "./laporan.ts";

// dua perangkat contoh: Node 1 lengkap, Node 2 (Kebun) tanpa vitals
const NODE1: BarisLaporan = { device_id: "f00d00000001", nama: "Node 1 lab", jenis: "node1", jumlah_bacaan: 8640,
  suhu_rata: 28.8, suhu_min: 25.1, suhu_maks: 33, kelembapan_rata: 67.6, tanah_rata: 39.6, tanah_min: 20, rssi_rata: -69,
  rssi_terburuk: -79, heap_terendah: 184562, menyala_ulang: 0, kali_terputus: 1 };
const KEBUN: BarisLaporan = { device_id: "f00d000000b2", nama: "Kebun; belakang", jenis: "node2", jumlah_bacaan: 288,
  suhu_rata: 28, suhu_min: 27.6, suhu_maks: 28.2, kelembapan_rata: 69.3, tanah_rata: 40.3, tanah_min: 38, rssi_rata: null,
  rssi_terburuk: null, heap_terendah: null, menyala_ulang: null, kali_terputus: 0 };
const KEPALA = "device_id;nama;jenis;jumlah_bacaan;suhu_rata;suhu_min;suhu_maks;kelembapan_rata;tanah_rata;tanah_min;"
  + "rssi_rata;rssi_terburuk;heap_terendah;menyala_ulang;kali_terputus";

beforeEach(() => {
  tiruan.query.mockReset();
  tiruan.alasanTelegramMati.mockReturnValue(null);
  tiruan.kirimBerkas.mockClear();
  tiruan.kirimBerkas.mockResolvedValue(true);
  tiruan.kabari.mockClear();
  tiruan.jadwal.length = 0;
});

describe("rentang laporan (WIB)", () => {
  it("dikirim 27 Okt 07.00 WIB: isinya 26 Okt 00.00-24.00 WIB = 25 Okt 17.00 UTC sampai 26 Okt 17.00 UTC", () => {
    const r = rentangLaporan(new Date("2026-10-27T00:00:00Z")); // 07.00 WIB
    expect(r.dari.toISOString()).toBe("2026-10-25T17:00:00.000Z");
    expect(r.sampai.toISOString()).toBe("2026-10-26T17:00:00.000Z");
    expect(r.tanggal).toBe("2026-10-26");
    expect(namaLaporan(r)).toBe("laporan-2026-10-26.csv");
  });

  it("batas tengah malam mengikuti WIB, bukan zona laptop (laptop tes ini di UTC-4)", () => {
    expect(rentangLaporan(new Date("2026-10-26T16:59:59Z")).tanggal).toBe("2026-10-25"); // 26 Okt 23.59.59 WIB
    expect(rentangLaporan(new Date("2026-10-26T17:00:00Z")).tanggal).toBe("2026-10-26"); // 27 Okt 00.00.00 WIB
    expect(new Date("2026-10-26T17:00:00Z").getDate()).toBe(26); // di jam laptop (UTC-4) masih 26 Okt 13.00
  });

  it("?hari=ini: 00.00 WIB hari ini sampai sekarang, nama berkas berakhiran -sementara", () => {
    const sekarang = new Date("2026-10-27T03:15:00Z"); // 27 Okt 10.15 WIB
    const r = rentangLaporan(sekarang, true);
    expect(r.dari.toISOString()).toBe("2026-10-26T17:00:00.000Z");
    expect(r.sampai).toBe(sekarang);
    expect(namaLaporan(r)).toBe("laporan-2026-10-27-sementara.csv");
    expect(keteranganLaporan(r, 2)).toBe("📊 Laporan sementara Rumah Pintar Mini 27 Okt 2026 (00.00–10.15 WIB): 2 perangkat");
  });

  it("keterangan laporan harian menyebut tanggal isinya (WIB)", () => {
    expect(keteranganLaporan(rentangLaporan(new Date("2026-10-27T00:00:00Z")), 3))
      .toBe("📊 Laporan harian Rumah Pintar Mini 26 Okt 2026: 3 perangkat");
  });
});

describe("isi CSV laporan", () => {
  it("kepala tabel + satu baris per perangkat; vitals Node 2 kosong; nama ber-; dibungkus petik", () => {
    expect(buatLaporanCsv([NODE1, KEBUN])).toBe("\uFEFF" + KEPALA + "\r\n"
      + "f00d00000001;Node 1 lab;node1;8640;28,8;25,1;33;67,6;39,6;20;-69;-79;184562;0;1\r\n"
      + "f00d000000b2;\"Kebun; belakang\";node2;288;28;27,6;28,2;69,3;40,3;38;;;;;0\r\n");
  });

  it("belum ada perangkat terdaftar: hanya kepala tabel", () => {
    expect(buatLaporanCsv([])).toBe("\uFEFF" + KEPALA + "\r\n");
  });
});

describe("kirimLaporan", () => {
  it("Telegram mati: dilewati, database bahkan tidak dibaca", async () => {
    tiruan.alasanTelegramMati.mockReturnValue("TELEGRAM_BOT_TOKEN belum diisi");
    expect(await kirimLaporan()).toEqual({ status: "dilewati", pesan: "Telegram mati (TELEGRAM_BOT_TOKEN belum diisi)" });
    expect(tiruan.query).not.toHaveBeenCalled();
    expect(tiruan.kirimBerkas).not.toHaveBeenCalled();
  });

  it("terkirim: kueri memakai rentang kemarin WIB, berkas CSV ber-BOM dikirim dengan nama dan keterangannya", async () => {
    tiruan.query.mockResolvedValue({ rows: [NODE1, KEBUN] });
    const hasil = await kirimLaporan(false, new Date("2026-10-27T00:00:00Z"));
    const [, parameter] = tiruan.query.mock.calls[0] as [string, Date[]];
    expect(parameter.map((w) => w.toISOString())).toEqual(["2026-10-25T17:00:00.000Z", "2026-10-26T17:00:00.000Z"]);
    const [nama, isi, keterangan] = tiruan.kirimBerkas.mock.calls[0];
    expect(nama).toBe("laporan-2026-10-26.csv");
    expect(isi).toBe(buatLaporanCsv([NODE1, KEBUN]));
    expect(keterangan).toBe("📊 Laporan harian Rumah Pintar Mini 26 Okt 2026: 2 perangkat");
    expect(hasil).toMatchObject({ status: "terkirim", berkas: "laporan-2026-10-26.csv", perangkat: 2,
      ukuran_byte: Buffer.byteLength(isi, "utf8") });
  });

  it("Telegram menolak atau tak terjangkau: gagal, dengan nama berkasnya", async () => {
    tiruan.query.mockResolvedValue({ rows: [NODE1] });
    tiruan.kirimBerkas.mockResolvedValue(false);
    expect(await kirimLaporan(false, new Date("2026-10-27T00:00:00Z")))
      .toEqual({ status: "gagal", pesan: "Telegram tidak menerima laporan-2026-10-26.csv; lihat log backend" });
  });

  it("database tidak bisa dibaca: galatnya diteruskan ke pemanggil (rute menjawab 503, jadwal mencatat di log)", async () => {
    tiruan.query.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    await expect(kirimLaporan()).rejects.toThrow("ECONNREFUSED");
    expect(tiruan.kirimBerkas).not.toHaveBeenCalled();
  });
});

describe("jadwal laporan harian (node-cron tiruan)", () => {
  it("WIB, tidak tumpang tindih, terlambat sampai 15 menit tetap jalan; isinya dihitung dari jam JADWAL", async () => {
    mulaiLaporan("50 23 * * *");
    const [ekspresi, tugas, pilihan] = tiruan.jadwal[0];
    expect(ekspresi).toBe("50 23 * * *");
    expect(pilihan).toMatchObject({ timezone: "Asia/Jakarta", noOverlap: true, missedExecutionTolerance: 15 * 60_000 });
    // laptop tidur 23.49 WIB dan bangun 00.01 WIB: node-cron baru menjalankan jadwal 27 Okt 23.50 WIB pada 28 Okt 00.01.30 WIB
    vi.useFakeTimers({ now: new Date("2026-10-27T17:01:30Z"), toFake: ["Date"] }); // jam "sekarang" = 28 Okt 00.01.30 WIB
    tiruan.query.mockResolvedValue({ rows: [NODE1] });
    await tugas({ date: new Date("2026-10-27T16:50:00Z") }); // konteks.date = jam jadwal (27 Okt 23.50 WIB)
    vi.useRealTimers();
    expect(tiruan.kirimBerkas.mock.calls[0][0]).toBe("laporan-2026-10-26.csv"); // bukan laporan-2026-10-27.csv
  });

  it("jadwal yang terlewat hanya dikabarkan (⏰): laporannya TIDAK dikirim belakangan", () => {
    mulaiLaporan("0 7 * * *");
    tiruan.acara.get("execution:missed")?.({ date: new Date("2026-10-27T00:00:00Z") });
    expect(tiruan.kabari).toHaveBeenCalledWith("⏰ Laporan harian pada 27 Okt 2026, 07.00 WIB terlewat (laptop tidur atau "
      + "backend sibuk?). Kirim sekarang lewat POST /laporan/kirim");
    expect(tiruan.kirimBerkas).not.toHaveBeenCalled();
  });
});
