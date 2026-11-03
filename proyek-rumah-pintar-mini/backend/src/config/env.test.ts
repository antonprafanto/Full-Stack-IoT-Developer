// env.test.ts - uji setelan LAPORAN_JADWAL (Modul 25), TRUST_PROXY dan CORS_ORIGIN (Modul 27), serta ALAMAT_SERVER (= batas
// yang bisa disimpan firmware Node 1), AKUN_BROKER_OTOMATIS, dan OTA_BATAS_MENIT (Modul 28) di env.ts. env.ts memeriksa
// process.env SEKALI saat diimpor, jadi setiap tes mengimpornya ulang (vi.resetModules) dengan isi .env tiruan yang berbeda.
// Jalankan: npm test
import { afterEach, describe, expect, it, vi } from "vitest";

const SAH = { // setelan wajib yang sah (tidak ada yang benar-benar dihubungi)
  MQTT_URL: "mqtt://127.0.0.1:1",
  DATABASE_URL: "postgres://tiruan:tiruan@127.0.0.1:1/tiruan",
  JWT_SECRET: "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789",
};

async function bacaDengan(tambahan: Record<string, string>) {
  vi.resetModules();
  for (const [nama, nilai] of Object.entries({ ...SAH, ...tambahan })) vi.stubEnv(nama, nilai);
  return (await import("./env.ts")).env;
}
const bacaSetelan = (jadwal: string) => bacaDengan({ LAPORAN_JADWAL: jadwal });

// setelan yang salah: server menulis alasannya ke layar lalu berhenti (process.exit tiruan melempar galat)
async function ditolak(tambahan: Record<string, string>): Promise<unknown[][]> {
  const layar = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit"); });
  await expect(bacaDengan(tambahan)).rejects.toThrow("process.exit");
  return layar.mock.calls;
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

describe("TRUST_PROXY di .env (Modul 27)", () => {
  it("kosong atau tidak ditulis = mati (false), seperti v1.3; false juga mati", async () => {
    expect((await bacaDengan({})).TRUST_PROXY).toBe(false);
    expect((await bacaDengan({ TRUST_PROXY: "" })).TRUST_PROXY).toBe(false);
    expect((await bacaDengan({ TRUST_PROXY: "false" })).TRUST_PROXY).toBe(false);
  });

  it("true = percaya semua; uniquelocal, loopback, linklocal, alamat, dan CIDR menjadi daftar (huruf besar dan spasi dirapikan)",
    async () => {
      expect((await bacaDengan({ TRUST_PROXY: "true" })).TRUST_PROXY).toBe(true);
      expect((await bacaDengan({ TRUST_PROXY: "uniquelocal" })).TRUST_PROXY).toEqual(["uniquelocal"]);
      expect((await bacaDengan({ TRUST_PROXY: " UniqueLocal , loopback,10.0.0.5, 172.18.0.0/16,fc00::/7" })).TRUST_PROXY)
        .toEqual(["uniquelocal", "loopback", "10.0.0.5", "172.18.0.0/16", "fc00::/7"]);
    });

  it("angka (jumlah hop, trustProxy: 1) ditolak dengan alasannya, juga di dalam daftar", async () => {
    const pesan = "Setelan TRUST_PROXY di .env: angka (jumlah hop) tidak dipakai Fastify 5 (tidak dipercaya sama sekali); "
      + "di balik Caddy tulis uniquelocal";
    expect(await ditolak({ TRUST_PROXY: "1" })).toContainEqual([pesan]);
    expect(await ditolak({ TRUST_PROXY: "uniquelocal,2" })).toContainEqual([pesan]);
  });

  it("nama atau blok yang tidak dikenal ditolak, termasuk true yang dicampur dan CIDR di luar batas", async () => {
    for (const salah of ["caddy", "true,uniquelocal", "10.0.0.0/33", "fc00::/129", "10.0.0/8", "172.18.0.0/16/1"]) {
      const layar = await ditolak({ TRUST_PROXY: salah });
      expect(layar.flat().join("\n")).toMatch(/^Setelan TRUST_PROXY di \.env: ".+" tidak dikenal: tulis uniquelocal/);
      vi.restoreAllMocks();
    }
  });
});

describe("CORS_ORIGIN di .env (Modul 27: dashboard ber-HTTPS dengan nama domain)", () => {
  it("alamat https dengan nama domain dan daftar campuran diterima apa adanya", async () => {
    expect((await bacaDengan({ CORS_ORIGIN: "https://iot.namaanda.my.id" })).CORS_ORIGIN).toEqual(["https://iot.namaanda.my.id"]);
    expect((await bacaDengan({ CORS_ORIGIN: "http://localhost, http://127.0.0.1:8081,https://iot.namaanda.my.id" })).CORS_ORIGIN)
      .toEqual(["http://localhost", "http://127.0.0.1:8081", "https://iot.namaanda.my.id"]);
  });

  it("garis miring di akhir, jalur, atau tanpa http(s):// ditolak (Origin dari browser tidak akan pernah cocok)", async () => {
    const layar = await ditolak({ CORS_ORIGIN: "https://iot.namaanda.my.id/,iot.namaanda.my.id,http://localhost:5173/masuk" });
    expect(layar.flat()).toEqual(expect.arrayContaining([
      'Setelan CORS_ORIGIN di .env: "https://iot.namaanda.my.id/" bukan alamat halaman: tulis http(s)://nama[:port] tanpa / '
        + "di akhir, misalnya https://iot.namaanda.my.id atau http://localhost",
      expect.stringContaining('"iot.namaanda.my.id" bukan alamat halaman'),
      expect.stringContaining('"http://localhost:5173/masuk" bukan alamat halaman'),
    ]));
  });
});

describe("setelan Modul 28 di .env", () => {
  it("bawaan: OTA mati (ALAMAT_SERVER kosong), akun broker diurus tangan (mati), kedaluwarsa 10 menit, folder data-firmware", async () => {
    const env = await bacaDengan({});
    expect(env.ALAMAT_SERVER).toBe("");
    expect(env.AKUN_BROKER_OTOMATIS).toEqual({ jenis: "mati" });
    expect(env.OTA_BATAS_MENIT).toBe(10);
    expect(env.FIRMWARE_DIR).toBe("data-firmware");
  });

  it("AKUN_BROKER_OTOMATIS: pusat, gerbang:<nama>; selain itu ditolak dengan contohnya", async () => {
    expect((await bacaDengan({ AKUN_BROKER_OTOMATIS: "pusat" })).AKUN_BROKER_OTOMATIS).toEqual({ jenis: "pusat" });
    expect((await bacaDengan({ AKUN_BROKER_OTOMATIS: "gerbang:pi1" })).AKUN_BROKER_OTOMATIS).toEqual({ jenis: "gerbang", nama: "pi1" });
    const layar = await ditolak({ AKUN_BROKER_OTOMATIS: "gerbang:pi/1" }); // "/" akan merusak nama topik kontrol
    expect(layar.flat().join(" ")).toContain("gerbang:pi1");
  });

  // ALAMAT_SERVER = batas yang bisa disimpan Node 1 1.7.0 (periksa-ota.cpp): alamat lain membuat semua pembaruan gagal
  it("ALAMAT_SERVER yang bisa disimpan Node 1 diterima apa adanya: https nama domain, http IP rumah, port 1-65535, 64 huruf",
    async () => {
      for (const sah of [
        "https://iot.namaanda.my.id", // VPS (jalur utama)
        "http://192.168.1.37", // Pi jalur gratis: port 80 Pi, tanpa :8081
        "http://192.168.1.10", // laptop di WiFi rumah
        "http://10.0.0.5:8080",
        "http://172.20.0.2",
        "https://iot.namaanda.my.id:8443",
        "http://192.168.1.37:1",
        "http://192.168.1.37:65535",
        "https://a-b.c-d.example",
        "https://xn--bcher-kva.example", // nama domain berhuruf non-Latin, ditulis dalam bentuk punycode
        "http://127.0.0.1:6302", // lab saja: simulator di mesin yang sama (ESP32 sungguhan menolak 127.x)
        `https://${"a".repeat(56)}`, // tepat 64 huruf
      ]) {
        expect((await bacaDengan({ ALAMAT_SERVER: sah })).ALAMAT_SERVER).toBe(sah);
      }
    });

  it("ALAMAT_SERVER yang tidak bisa disimpan Node 1 ditolak saat server mulai, dengan alasannya", async () => {
    const kasus: [string, string][] = [
      [`https://${"a".repeat(57)}`, "terlalu panjang (65 huruf): Node 1 hanya bisa menyimpan alamat server paling panjang 64 huruf"],
      ["https://my_host.example", "tanpa garis bawah _"],
      ["https://user@iot.namaanda.my.id", "tanpa @"],
      ["https://iot namaanda.my.id", "tanpa spasi"],
      ["https://iot.namaanda.my.id:0", "port (angka sesudah titik dua) harus 1 sampai 65535"],
      ["https://iot.namaanda.my.id:65536", "harus 1 sampai 65535"],
      ["https://iot.namaanda.my.id:99999", "harus 1 sampai 65535"],
      ["http://192.168.1.37:", "harus 1 sampai 65535"],
      ["http://192.168.1.37:80:80", "harus 1 sampai 65535"],
      ["https://iot.namaanda.my.id/", "tanpa / di akhir"],
      ["https://iot.namaanda.my.id/api", "tanpa jalur"],
      ["https://IoT.NamaAnda.my.id", "huruf kecil semua"],
      ["HTTPS://iot.namaanda.my.id", "harus diawali http:// atau https:// (huruf kecil)"],
      ["iot.namaanda.my.id", "harus diawali http:// atau https://"],
      ["ftp://192.168.1.37", "harus diawali http:// atau https://"],
      ["https://", "nama server sesudah :// belum ditulis"],
      ["https://:8443", "belum ditulis"],
      ["http://iot.namaanda.my.id", "http:// hanya untuk alamat IP jaringan rumah"],
      ["http://8.8.8.8", "jaringan rumah"],
      ["http://192.168.1.300", "jaringan rumah"],
    ];
    for (const [salah, alasan] of kasus) {
      const layar = (await ditolak({ ALAMAT_SERVER: salah })).flat().join("\n");
      expect(layar, salah).toContain(`Setelan ALAMAT_SERVER di .env: "${salah}"`);
      expect(layar, salah).toContain(alasan);
      vi.restoreAllMocks();
    }
  });
});
