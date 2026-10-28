// env.test.ts - uji setelan LAPORAN_JADWAL (Modul 25) di env.ts. env.ts memeriksa process.env SEKALI saat diimpor, jadi
// setiap tes mengimpornya ulang (vi.resetModules) dengan isi .env tiruan yang berbeda. Jalankan: npm test
import { afterEach, describe, expect, it, vi } from "vitest";

const SAH = { // setelan wajib yang sah (tidak ada yang benar-benar dihubungi)
  MQTT_URL: "mqtt://127.0.0.1:1",
  DATABASE_URL: "postgres://tiruan:tiruan@127.0.0.1:1/tiruan",
  JWT_SECRET: "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789",
};

async function bacaSetelan(jadwal: string) {
  vi.resetModules();
  for (const [nama, nilai] of Object.entries({ ...SAH, LAPORAN_JADWAL: jadwal })) vi.stubEnv(nama, nilai);
  return (await import("./env.ts")).env;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("LAPORAN_JADWAL di .env", () => {
  it("kosong = bawaan 0 7 * * * (setiap hari 07.00 WIB); cron 5 bidang lain diterima apa adanya", async () => {
    expect((await bacaSetelan("")).LAPORAN_JADWAL).toBe("0 7 * * *");
    expect((await bacaSetelan("30 6 * * 1-5")).LAPORAN_JADWAL).toBe("30 6 * * 1-5");
  });

  it("cron 6 bidang (0 7 * * * *) ditolak dengan alasannya, dan server berhenti", async () => {
    const layar = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit"); });
    await expect(bacaSetelan("0 7 * * * *")).rejects.toThrow("process.exit");
    expect(layar).toHaveBeenCalledWith(
      "Setelan LAPORAN_JADWAL di .env: harus 5 bidang: menit jam tanggal bulan hari, misalnya 0 7 * * *");
  });
});
