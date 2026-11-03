// akun-broker.test.ts - uji akun broker otomatis (Modul 28) TANPA broker: penerbit topik kontrol (mqtt.ts) diganti tiruan
// yang mencatat perintah dan, bila diminta, menjawab seperti plugin dynamic security Mosquitto 2.1.2 (bentuk jawaban dari
// lab riset M28). Yang diuji: topik gerbang lewat jembatan, bawaan izin baca = tolak SEBELUM createClient (temuan verifikasi
// M28), createClient, akun yang sudah ada diganti kuncinya, tanpa jawaban 3 detik = dicoba SEKALI lagi lalu galat (pengatur
// waktu dipasang SESUDAH terbit, tanpa unhandled rejection), backend tidak tersambung, deleteClient, dan antrean langkah
// akun (satu per satu; menunggu giliran > 5 detik = galat tanpa dikerjakan). Jalankan: npm test
import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => { // env.ts memeriksa .env saat diimpor: setelan palsu yang sah, akun broker lewat gerbang pi1
  process.env.MQTT_URL = "mqtt://127.0.0.1:1";
  process.env.DATABASE_URL = "postgres://tiruan:tiruan@127.0.0.1:1/tiruan";
  process.env.JWT_SECRET = "rahasia-uji-yang-cukup-panjang-untuk-zod-0123456789";
  process.env.AKUN_BROKER_OTOMATIS = "gerbang:pi1";
});

const broker = vi.hoisted(() => ({
  tersambung: true,
  terbit: [] as { topik: string; perintah: Record<string, unknown> }[],
  // jawab(perintah) -> isi "error" (string) atau undefined; null = DIAM (jawaban tidak pernah datang)
  jawab: (_p: Record<string, unknown>): string | undefined | null => undefined,
}));
vi.mock("./mqtt.ts", () => ({
  terbitkanKontrol: (topik: string, isi: string) => {
    if (!broker.tersambung) return false;
    const perintah = (JSON.parse(isi) as { commands: Record<string, unknown>[] }).commands[0];
    broker.terbit.push({ topik, perintah });
    const galat = broker.jawab(perintah);
    if (galat !== null) { // jawaban tiba lewat topik .../response beberapa milidetik kemudian
      setTimeout(() => void import("./akun-broker.ts").then((m) => m.serahkanJawabanKontrol(JSON.stringify({
        responses: [{ command: perintah.command, correlationData: perintah.correlationData, ...(galat ? { error: galat } : {}) }],
      }))), 5);
    }
    return true;
  },
}));

import { BATAS_ANTRE_MS, BATAS_JAWAB_MS, antreAkun, hapusAkunPerangkat, pasangAkunPerangkat, tempatAkun, topikKontrol }
  from "./akun-broker.ts";

afterEach(() => {
  broker.terbit.length = 0;
  broker.tersambung = true;
  broker.jawab = () => undefined;
  vi.useRealTimers();
});

describe("akun broker otomatis lewat dynamic security (AKUN_BROKER_OTOMATIS=gerbang:pi1)", () => {
  it("topik kontrol gerbang = rpm-gerbang/pi1/... di broker pusat (jembatan memindahkannya ke $CONTROL gerbang)", () => {
    expect(topikKontrol()).toEqual({ perintah: "rpm-gerbang/pi1/dynamic-security/v1",
      jawaban: "rpm-gerbang/pi1/dynamic-security/v1/response" });
    expect(tempatAkun()).toBe("broker gerbang pi1");
  });

  it("perangkat baru: bawaan izin BACA = tolak dulu, lalu satu createClient (nama pengguna = device_id, sandi = kunci, tanpa peran)", async () => {
    expect(await pasangAkunPerangkat("f00d00000003", "k".repeat(43))).toBe("dibuat");
    expect(broker.terbit).toHaveLength(2);
    expect(broker.terbit[0].topik).toBe("rpm-gerbang/pi1/dynamic-security/v1");
    expect(broker.terbit[0].perintah).toMatchObject({ command: "setDefaultACLAccess",
      acls: [{ acltype: "publishClientReceive", allow: false }] });
    expect(broker.terbit[1].perintah).toMatchObject({ command: "createClient", username: "f00d00000003", password: "k".repeat(43) });
    expect(broker.terbit[1].perintah).not.toHaveProperty("roles");
  });

  it("broker menolak setDefaultACLAccess: galat, createClient TIDAK dikirim (akun tidak dibuat dengan izin baca terbuka)", async () => {
    broker.jawab = (p) => (p.command === "setDefaultACLAccess" ? "Permission denied" : undefined);
    await expect(pasangAkunPerangkat("f00d00000003", "k".repeat(43))).rejects.toThrow("setDefaultACLAccess: Permission denied");
    expect(broker.terbit.map((t) => t.perintah.command)).toEqual(["setDefaultACLAccess"]);
  });

  it("akun sudah ada (ganti kunci): setClientPassword lalu enableClient", async () => {
    broker.jawab = (p) => (p.command === "createClient" ? "Client already exists" : undefined);
    expect(await pasangAkunPerangkat("f00d00000003", "b".repeat(43))).toBe("diganti");
    expect(broker.terbit.map((t) => t.perintah.command))
      .toEqual(["setDefaultACLAccess", "createClient", "setClientPassword", "enableClient"]);
  });

  it("tanpa jawaban 3 detik: dicoba SEKALI lagi; jawaban kedua datang = berhasil", async () => {
    vi.useFakeTimers();
    let ke = 0;
    broker.jawab = () => (++ke === 1 ? null : undefined); // percobaan pertama hilang (jembatan baru tersambung)
    const hasil = pasangAkunPerangkat("f00d00000004", "c".repeat(43));
    await vi.advanceTimersByTimeAsync(BATAS_JAWAB_MS + 50);
    expect(await hasil).toBe("dibuat");
    expect(broker.terbit.map((t) => t.perintah.command)).toEqual(["setDefaultACLAccess", "setDefaultACLAccess", "createClient"]);
  });

  it("diam dua kali: galat dengan alasan yang jelas (pemanggil menjawab 503), tanpa unhandled rejection", async () => {
    vi.useFakeTimers();
    broker.jawab = () => null;
    const hasil = pasangAkunPerangkat("f00d00000005", "d".repeat(43));
    const tertangkap = expect(hasil).rejects.toThrow("broker gerbang pi1 tidak menjawab setDefaultACLAccess dalam 3 detik");
    await vi.advanceTimersByTimeAsync(2 * BATAS_JAWAB_MS + 10);
    await tertangkap;
    expect(broker.terbit).toHaveLength(2);
  });

  it("backend tidak tersambung ke broker: galat seketika, tidak menunggu 3 detik", async () => {
    broker.tersambung = false;
    await expect(pasangAkunPerangkat("f00d00000006", "e".repeat(43))).rejects.toThrow("tidak tersambung ke broker");
  });

  it("hapus: dihapus, atau tidak-ada (akun lama Modul 21 di berkas sandi), galat lain dilempar", async () => {
    expect(await hapusAkunPerangkat("f00d00000003")).toBe("dihapus");
    broker.jawab = () => "Client not found";
    expect(await hapusAkunPerangkat("a4cf12e5b7c0")).toBe("tidak-ada");
    broker.jawab = () => "Internal error";
    await expect(hapusAkunPerangkat("a4cf12e5b7c0")).rejects.toThrow("deleteClient a4cf12e5b7c0: Internal error");
  });

  it("antrean: langkah akun dikerjakan SATU PER SATU, urut kedatangan; galat satu langkah tidak menghentikan antrean", async () => {
    const urutan: string[] = [];
    const langkah = (nama: string, gagal = false) => async () => {
      urutan.push(`${nama} mulai`);
      await new Promise((r) => setTimeout(r, 5));
      urutan.push(`${nama} selesai`);
      if (gagal) throw new Error(`${nama} gagal`);
      return nama;
    };
    const hasil = await Promise.allSettled([antreAkun(langkah("A", true)), antreAkun(langkah("B")), antreAkun(langkah("C"))]);
    expect(urutan).toEqual(["A mulai", "A selesai", "B mulai", "B selesai", "C mulai", "C selesai"]);
    expect(hasil.map((h) => h.status)).toEqual(["rejected", "fulfilled", "fulfilled"]);
  });

  it("antrean: menunggu giliran lebih dari 5 detik (broker diam) = galat TANPA dikerjakan (database dan broker tidak disentuh)", async () => {
    vi.useFakeTimers();
    let dikerjakan = 0;
    const lama = antreAkun(() => new Promise((r) => setTimeout(r, 2 * BATAS_JAWAB_MS))); // misalnya createClient diam dua kali
    const menunggu = antreAkun(async () => { dikerjakan++; });
    const tertangkap = expect(menunggu).rejects.toThrow("langkah akun broker sebelumnya belum selesai sesudah 5 detik");
    await vi.advanceTimersByTimeAsync(2 * BATAS_JAWAB_MS + 10);
    await lama;
    await tertangkap;
    expect(dikerjakan).toBe(0);
    expect(BATAS_ANTRE_MS).toBeLessThan(2 * BATAS_JAWAB_MS);
  });
});
