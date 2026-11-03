// firmware.test.ts - uji rute rilis firmware dan unduhan berkunci (Modul 28) TANPA database: tabel firmware dan devices
// diganti tiruan (vi.mock), berkas .bin TIRUAN ditulis ke folder sementara (FIRMWARE_DIR). Pengaman SUNGGUHAN (keamanan.ts:
// satpam login, peran, RUTE_TERBUKA) ikut dipasang, jadi yang diuji juga: unggah tanpa login 401, viewer 403, dan unduhan
// perangkat yang TIDAK butuh login tetapi butuh kunci perangkat. Permintaan unduh meniru HTTPUpdate Arduino-ESP32 3.3.12
// (Basic Auth device_id:kunci, x-ESP32-STA-MAC huruf besar, x-ESP32-version). Jalankan: npm test
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const sementara = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const folder = mkdtempSync(join(tmpdir(), "rpm-firmware-uji-"));
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.FIRMWARE_DIR = folder;
  process.env.ALAMAT_SERVER = "https://iot.namaanda.my.id";
  return folder;
});

const tabel = vi.hoisted(() => ({
  rilis: new Map<string, Record<string, unknown>>(),
  sidik: new Map<string, string>(), // device_id -> SHA-256 kunci (perangkat terdaftar yang aktif)
  unduh: [] as string[],
}));
vi.mock("../db/armada.ts", () => ({
  simpanRilis: async (r: Record<string, unknown>) => {
    if (tabel.rilis.has(r.versi as string)) return undefined;
    const baris = { ...r, dibuat: new Date("2026-10-31T01:00:00Z"), ditarik: null };
    tabel.rilis.set(r.versi as string, baris);
    return baris;
  },
  ambilRilis: async (_j: string, versi: string) => tabel.rilis.get(versi),
  semuaRilis: async () => [...tabel.rilis.values()].map((r) => ({ ...r, canary_berhasil: r.versi === "1.7.1" ? 1 : 0, canary_gagal: 0 })),
  tarikRilis: async (_j: string, versi: string) => {
    const r = tabel.rilis.get(versi);
    if (r === undefined || r.ditarik !== null) return undefined;
    r.ditarik = new Date();
    return r;
  },
}));
vi.mock("../db/perangkat.ts", () => ({ ambilSidikKunci: async (id: string) => tabel.sidik.get(id) }));
vi.mock("../services/ota.ts", () => ({ FOLDER: { node1: "node-1" }, catatMulaiUnduh: (id: string, v: string) => { tabel.unduh.push(`${id} ${v}`); } }));
vi.mock("../services/realtime.ts", () => ({ putuskanSesi: () => {} }));

import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { pasangKeamanan } from "../auth/keamanan.ts";
import { hashKunci } from "../auth/kunci.ts";
import { ruteFirmware } from "./firmware.ts";

const app = Fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
await pasangKeamanan(app);
await app.register(ruteFirmware);
await app.ready();
afterAll(async () => {
  await app.close();
  await rm(sementara, { recursive: true, force: true });
});

const cookie = (peran: "admin" | "viewer") => `akses=${app.jwt.sign({ sub: peran === "admin" ? "1" : "2", peran, sid: 1 })}`;
// berkas .bin TIRUAN: bait pertama 0xE9 seperti citra aplikasi ESP32, lalu teks penanda dan isi berpola (BUKAN firmware)
function binTiruan(ukuran: number, isi = 1): Buffer {
  const b = Buffer.alloc(ukuran, isi);
  b[0] = 0xe9;
  b.write("BUKAN FIRMWARE ASLI - uji Vitest Modul 28", 16, "latin1");
  return b;
}
const unggah = (versi: string, badan: Buffer, peran: "admin" | "viewer" | null = "admin", kueri = "") => app.inject({
  method: "POST", url: `/firmware/node1/${versi}${kueri}`, payload: badan,
  headers: { "content-type": "application/octet-stream", ...(peran === null ? {} : { cookie: cookie(peran) }) },
});
const KUNCI = "K".repeat(43);
const ID = "a4cf12e5b7c0";
const basic = (id: string, kunci: string) => `Basic ${Buffer.from(`${id}:${kunci}`).toString("base64")}`;
const unduh = (versi: string, kepala: Record<string, string> = {}, metode: "GET" | "HEAD" = "GET") => app.inject({
  method: metode, url: `/fw/node-1/${versi}.bin`,
  headers: { "user-agent": "ESP32-http-Update", authorization: basic(ID, KUNCI), "x-esp32-sta-mac": "A4:CF:12:E5:B7:C0",
    "x-esp32-version": "1.7.0", ...kepala },
});

beforeEach(() => {
  tabel.sidik.set(ID, hashKunci(KUNCI));
});

describe("unggah firmware (admin)", () => {
  const berkas = binTiruan(1_196_032);

  it("tanpa login 401, akun viewer 403 (satpam Modul 20 berlaku juga untuk rute baru)", async () => {
    expect((await unggah("1.7.1", berkas, null)).statusCode).toBe(401);
    expect((await unggah("1.7.1", berkas, "viewer")).statusCode).toBe(403);
  });

  it("admin: 201, SHA-256 dihitung server (sama dengan sha256sum berkasnya), berkas tersimpan di lemari", async () => {
    const jawab = await unggah("1.7.1", berkas, "admin", "?catatan=sapaan%20baru");
    expect(jawab.statusCode).toBe(201);
    expect(jawab.json()).toMatchObject({ versi: "1.7.1", ukuran: 1_196_032, uji: false, catatan: "sapaan baru",
      sha256: createHash("sha256").update(berkas).digest("hex"), url: "https://iot.namaanda.my.id/fw/node-1/1.7.1.bin" });
    expect((await stat(join(sementara, "node-1", "1.7.1.bin"))).size).toBe(1_196_032);
  });

  it("bukan citra ESP32 (bait pertama bukan 0xE9, misalnya .merged.bin yang diawali 0xFF): 400", async () => {
    const merged = binTiruan(4096);
    merged[0] = 0xff;
    const jawab = await unggah("1.7.9", merged);
    expect(jawab.statusCode).toBe(400);
    expect(jawab.json().pesan).toContain("0xE9");
  });

  it("lebih besar dari satu rak (1.966.080 byte) 400; lebih besar dari 2 MiB ditolak Fastify 413", async () => {
    expect((await unggah("1.7.9", binTiruan(1_966_081))).statusCode).toBe(400);
    expect((await unggah("1.7.9", binTiruan(2 * 1024 * 1024 + 1))).statusCode).toBe(413);
  });

  it("versi/jenis/uji di alamat tidak sah: 400 galat validasi (bukan 500 FST_ERR_FAILED_ERROR_SERIALIZATION)", async () => {
    for (const versi of ["1.7", "v1.7.9", "1.7.9-uji", "1.07.9", "01.7.9"]) {
      const jawab = await unggah(versi, berkas);
      expect(jawab.statusCode, versi).toBe(400);
      expect(jawab.json(), versi).toMatchObject({ code: "FST_ERR_VALIDATION" });
    }
    const node2 = await app.inject({ method: "POST", url: "/firmware/node2/1.7.9", payload: berkas,
      headers: { "content-type": "application/octet-stream", cookie: cookie("admin") } });
    expect(node2.statusCode).toBe(400);
    expect((await unggah("1.7.9", berkas, "admin", "?uji=ya")).statusCode).toBe(400);
  });

  it("dua unggahan versi SAMA dengan isi BERBEDA pada saat bersamaan: satu 201, satu 409, berkas di lemari = sha256 rilis", async () => {
    for (let i = 0; i < 5; i++) {
      const versi = `1.8.${i}`;
      const [a, b] = [binTiruan(1_196_032, 10 + i), binTiruan(1_197_056, 20 + i)];
      const kode = (await Promise.all([unggah(versi, a), unggah(versi, b)])).map((j) => j.statusCode).sort();
      expect(kode, versi).toEqual([201, 409]);
      const { readFile } = await import("node:fs/promises");
      const diLemari = createHash("sha256").update(await readFile(join(sementara, "node-1", `${versi}.bin`))).digest("hex");
      expect(diLemari, versi).toBe(tabel.rilis.get(versi)?.sha256);
      tabel.rilis.delete(versi); // rilis uji ini tidak boleh mengubah "terbaru" di tes berikutnya
      await rm(join(sementara, "node-1", `${versi}.bin`));
    }
    const { readdir } = await import("node:fs/promises");
    expect((await readdir(join(sementara, "node-1"))).filter((n) => n.endsWith(".tmp"))).toEqual([]); // tidak ada sisa
  });

  it("versi yang sama tidak bisa ditimpa (409); berkas yang hilang dari lemari bisa dipulihkan dengan isi yang SAMA (200)", async () => {
    expect((await unggah("1.7.1", binTiruan(1_196_032, 2))).statusCode).toBe(409); // isi lain, versi sama
    await rm(join(sementara, "node-1", "1.7.1.bin"));
    expect((await unggah("1.7.1", binTiruan(1_196_032, 2))).statusCode).toBe(409); // isi lain: tetap ditolak
    expect((await unggah("1.7.1", berkas)).statusCode).toBe(200); // isi sama: dipulihkan
  });

  it("rilis uji ditandai; GET /firmware: terbaru = tertinggi yang bukan uji dan tidak ditarik", async () => {
    expect((await unggah("1.7.2", binTiruan(1_196_032, 3), "admin", "?uji=true")).json().uji).toBe(true);
    const daftar = (await app.inject({ method: "GET", url: "/firmware", headers: { cookie: cookie("viewer") } })).json();
    expect(daftar.terbaru).toEqual({ node1: "1.7.1" });
    expect(daftar.rilis.find((r: { versi: string }) => r.versi === "1.7.1")).toMatchObject({ boleh_semua: true });
    expect(daftar.rilis.find((r: { versi: string }) => r.versi === "1.7.2")).toMatchObject({ boleh_semua: false,
      alasan_semua: "rilis uji: hanya per perangkat" });
  });
});

describe("unduh firmware oleh perangkat (/fw/node-1/<versi>.bin)", () => {
  it("TANPA cookie login tetapi dengan kunci perangkat: 200, Content-Length, octet-stream, x-SHA256, isi utuh", async () => {
    tabel.unduh.length = 0;
    const jawab = await unduh("1.7.1");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.headers["content-length"]).toBe("1196032");
    expect(jawab.headers["content-type"]).toBe("application/octet-stream");
    expect(jawab.headers["content-encoding"]).toBeUndefined();
    expect(jawab.rawPayload[0]).toBe(0xe9);
    expect(createHash("sha256").update(jawab.rawPayload).digest("hex")).toBe(jawab.headers["x-sha256"]);
    expect(tabel.unduh).toEqual([`${ID} 1.7.1`]); // status pembaruan "mengunduh"
  });

  it("HEAD: kepala yang sama tanpa isi", async () => {
    const jawab = await unduh("1.7.1", {}, "HEAD");
    expect(jawab.statusCode).toBe(200);
    expect(jawab.headers["content-length"]).toBe("1196032");
    expect(jawab.rawPayload.length).toBe(0);
  });

  it("tanpa Basic Auth, kunci salah, perangkat dinonaktifkan: 403 (HTTPUpdate: galat -103)", async () => {
    const tanpa = await app.inject({ method: "GET", url: "/fw/node-1/1.7.1.bin", headers: { "x-esp32-sta-mac": "A4:CF:12:E5:B7:C0" } });
    expect(tanpa.statusCode).toBe(403);
    expect((await unduh("1.7.1", { authorization: basic(ID, "salah".padEnd(43, "x")) })).statusCode).toBe(403);
    tabel.sidik.delete(ID); // dicabut: ambilSidikKunci tidak menemukan kunci aktif
    expect((await unduh("1.7.1")).statusCode).toBe(403);
  });

  it("x-ESP32-STA-MAC tidak ada atau milik perangkat lain: 403", async () => {
    expect((await unduh("1.7.1", { "x-esp32-sta-mac": "" })).statusCode).toBe(403);
    expect((await unduh("1.7.1", { "x-esp32-sta-mac": "24:6F:28:B1:C7:D4" })).statusCode).toBe(403);
  });

  it("versi yang sedang berjalan = versi yang diminta: 304 tanpa isi (HTTPUpdate: tidak ada pembaruan)", async () => {
    const jawab = await unduh("1.7.1", { "x-esp32-version": "1.7.1" });
    expect(jawab.statusCode).toBe(304);
    expect(jawab.rawPayload.length).toBe(0);
  });

  it("versi tidak ada, folder lain, rilis ditarik: 404 jujur (bukan halaman HTML 200)", async () => {
    expect((await unduh("9.9.9")).statusCode).toBe(404);
    expect((await app.inject({ method: "GET", url: "/fw/node-2/1.0.0.bin" })).statusCode).toBe(404);
    expect((await app.inject({ method: "POST", url: "/firmware/node1/1.7.1/tarik", headers: { cookie: cookie("admin") } }))
      .statusCode).toBe(200);
    expect((await unduh("1.7.1")).statusCode).toBe(404);
  });
});
