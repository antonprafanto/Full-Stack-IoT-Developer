// gelombang.test.ts - Tantangan 3 Modul 28 (kunci): uji gelombang otomatis TANPA database, broker, dan Telegram. Kueri
// db/armada.ts, perintah update (ota.ts), dan Telegram diganti tiruan; gudang memori (gudang.ts) tetap yang asli, jadi status
// dan vitals canary diisi seperti pesan MQTT sungguhan. Hasil pembaruan perangkat "dilaporkan" lewat kabarGelombang(), jalan
// yang sama dengan ota.ts. Jam tiruan (vi.useFakeTimers) memendekkan masa tunggu. Jalankan: npm test
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BarisPembaruan } from "../db/armada.ts";
import type { HasilPerangkat } from "./gelombang.ts";

const db = vi.hoisted(() => ({
  rilis: new Map<string, { versi: string; uji: boolean; ditarik: Date | null }>(),
  perangkat: [] as { device_id: string; canary: boolean; dicabut: Date | null; fw: string | null }[],
  canaryGagal: 0,
}));
vi.mock("../db/armada.ts", () => ({
  ambilRilis: async (_j: string, v: string) => db.rilis.get(v),
  calonPembaruan: async () => db.perangkat.map((p) => ({ ...p, jenis: "node1", terdaftar: new Date(), status: "online", berjalan: false })),
  ringkasanCanary: async () => ({ berhasil: 0, gagal: db.canaryGagal }),
}));
// perintah update tiruan: setiap perangkat menerima (ack ok), kecuali yang diatur lain di `jawab`
const ota = vi.hoisted(() => ({ kirim: [] as string[], jawab: new Map<string, { status: string; pesan: string }>(), n: 0 }));
vi.mock("./ota.ts", () => ({
  mintaUpdate: async (id: string, versi: string) => {
    ota.kirim.push(id);
    const lain = ota.jawab.get(id);
    if (lain?.status === "ditolak") return { status: "ditolak", id: `c-${++ota.n}`, device_id: id, pesan: lain.pesan };
    if (lain !== undefined) return { status: "tidak-dikirim", device_id: id, kode: 409, pesan: lain.pesan };
    return { status: "diterima", id: `c-${id}-${versi}`, device_id: id, dari: "1.7.0", ke: versi, lama_ms: 5 };
  },
}));
const tg = vi.hoisted(() => ({ pesan: [] as string[], diam: new Set<string>() }));
vi.mock("./telegram.ts", () => ({
  kabari: async (teks: string) => { tg.pesan.push(teks); return true; },
  diamkanKabarBerhenti: (id: string, diam: boolean) => { if (diam) tg.diam.add(id); else tg.diam.delete(id); },
}));

import { bagiGelombang, hentikanGelombang, kabarGelombang, keadaanGelombang, mulaiGelombang, nilaiTahap, teksHasil, teksLama }
  from "./gelombang.ts";
import { simpanStatus, simpanTelemetry, simpanVitals } from "./gudang.ts";

const id = (n: number) => `f00d${String(n).padStart(8, "0")}`;
const beres = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); }; // habiskan rantai await tiruan
// laporan hasil satu perangkat, seperti kabarkan() di ota.ts sesudah vitals.ota tiba
function lapor(deviceId: string, versi: string, status: string, pesan: string | null = null): void {
  kabarGelombang({ id: `c-${deviceId}-${versi}`, device_id: deviceId, jenis: "node1", dari_versi: "1.7.0", ke_versi: versi,
    canary: false, status, pesan, oleh: "1", dibuat: new Date(), diperbarui: new Date(), selesai: new Date() } as BarisPembaruan);
}
// canary sehat di gudang memori: online, vitals saat tersambung membawa versi baru (uptime kecil = baru menyala)
function canarySehat(deviceId: string, versi: string): void {
  simpanStatus(deviceId, "online");
  simpanVitals(deviceId, { ts: new Date().toISOString().slice(0, 19) + "Z", rssi: -60, heap_free: 180000, uptime_s: 6,
    reset_reason: "SW", fw: versi });
}
// satu armada: perangkat 1 = canary, sisanya biasa, semuanya masih 1.7.0
function armada(jumlah: number): void {
  db.perangkat = Array.from({ length: jumlah }, (_, i) => ({ device_id: id(i + 1), canary: i === 0, dicabut: null, fw: "1.7.0" }));
}

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-11-02T03:00:00Z") });
  db.rilis = new Map([["1.7.4", { versi: "1.7.4", uji: false, ditarik: null }], ["1.7.2", { versi: "1.7.2", uji: true, ditarik: null }]]);
  db.canaryGagal = 0;
  ota.kirim = [];
  ota.jawab = new Map();
  tg.pesan = [];
  tg.diam = new Set();
});
afterEach(() => {
  hentikanGelombang("uji"); // gelombang yang masih berjalan di akhir uji dihentikan (pengatur waktunya ikut dibersihkan)
  vi.useRealTimers();
});

describe("logika murni", () => {
  it("bagiGelombang: makin besar, dua kali lipat (20 perangkat -> 2, 4, 8, 6)", () => {
    const duapuluh = Array.from({ length: 20 }, (_, i) => id(i + 2));
    expect(bagiGelombang(duapuluh, 2).map((g) => g.length)).toEqual([2, 4, 8, 6]);
    expect(bagiGelombang(duapuluh, 5).map((g) => g.length)).toEqual([5, 10, 5]);
    expect(bagiGelombang([], 2)).toEqual([]);
    expect(bagiGelombang(duapuluh, 2).flat()).toEqual(duapuluh); // tidak ada yang hilang atau kembar
  });

  it("nilaiTahap: satu rollback/gagal/kedaluwarsa = rem walau yang lain masih berjalan; dilewati/ditolak bukan rem", () => {
    const h = (status: string) => ({ status, pesan: null }) as HasilPerangkat;
    expect(nilaiTahap([h("berhasil"), h("berjalan"), h("rollback")])).toBe("rem");
    expect(nilaiTahap([h("kedaluwarsa")])).toBe("rem");
    expect(nilaiTahap([h("berhasil"), h("berjalan")])).toBe("menunggu");
    expect(nilaiTahap([h("berhasil"), h("sudah"), h("dilewati"), h("ditolak")])).toBe("lolos");
  });

  it("teksHasil dan teksLama: yang berhasil dihitung, yang bermasalah disebut beserta alasannya", () => {
    const hasil: Record<string, HasilPerangkat> = { [id(2)]: { status: "berhasil", pesan: null },
      [id(3)]: { status: "berhasil", pesan: null }, [id(4)]: { status: "dilewati", pesan: "perangkat sedang offline" } };
    expect(teksHasil([id(2), id(3), id(4)], hasil)).toBe("2 berhasil, 1 dilewati (f00d00000004: perangkat sedang offline)");
    expect(teksLama(45_000)).toBe("45 detik");
    expect(teksLama(192_000)).toBe("3 menit 12 detik");
  });
});

describe("gelombang otomatis", () => {
  it("syarat awal: belum diunggah 404; rilis uji, ditarik, tanpa canary, canary pernah gagal, atau masih berjalan 409", async () => {
    armada(3);
    expect(await mulaiGelombang("9.9.9", "1")).toMatchObject({ kode: 404 });
    expect(await mulaiGelombang("1.7.2", "1")).toMatchObject({ kode: 409, pesan: "1.7.2 rilis UJI: tidak pernah dikirim ke banyak perangkat" });
    db.rilis.set("1.7.3", { versi: "1.7.3", uji: false, ditarik: new Date() });
    expect(await mulaiGelombang("1.7.3", "1")).toMatchObject({ kode: 409, pesan: "firmware 1.7.3 sudah ditarik" });
    db.canaryGagal = 1;
    expect(await mulaiGelombang("1.7.4", "1")).toMatchObject({ kode: 409 });
    db.canaryGagal = 0;
    db.perangkat[0].canary = false;
    expect(await mulaiGelombang("1.7.4", "1")).toMatchObject({ kode: 409, pesan: expect.stringContaining("belum ada perangkat canary") });
    db.perangkat[0].canary = true;
    expect(await mulaiGelombang("1.7.4", "1")).toMatchObject({ kode: 202 });
    expect(await mulaiGelombang("1.7.4", "1")).toMatchObject({ kode: 409, pesan: expect.stringContaining("masih berjalan") });
    await beres();
    expect(ota.kirim).toEqual([id(1)]); // hanya canary yang dikirimi
  });

  it("jalan mulus: canary, tunggu sehat, lalu gelombang 2 dan 3 perangkat; SATU pesan Telegram per tahap", async () => {
    armada(6); // canary + 5 perangkat -> gelombang 2, 3
    const awal = await mulaiGelombang("1.7.4", "1", { tungguMenit: 1 });
    expect(awal).toMatchObject({ kode: 202 });
    await beres();
    expect(ota.kirim).toEqual([id(1)]);
    expect(tg.diam.has(id(1))).toBe(true); // 🔄/✅ canary didiamkan selama pembaruannya berjalan
    canarySehat(id(1), "1.7.4");
    lapor(id(1), "1.7.4", "berhasil");
    await beres();
    expect(tg.diam.has(id(1))).toBe(false);
    expect(tg.pesan).toEqual(["🌊 Gelombang 1.7.4 · canary: 1 berhasil. Tunggu 1 menit: canary harus tetap online dengan 1.7.4, lalu "
      + "gelombang 1 dari 2 (2 perangkat)."]);
    await vi.advanceTimersByTimeAsync(55_000);
    expect(ota.kirim).toHaveLength(1); // masih menunggu
    await vi.advanceTimersByTimeAsync(10_000);
    await beres();
    expect(ota.kirim).toEqual([id(1), id(2), id(3)]);
    for (const d of [id(2), id(3)]) lapor(d, "1.7.4", "berhasil");
    await beres();
    expect(ota.kirim).toEqual([id(1), id(2), id(3), id(4), id(5), id(6)]);
    for (const d of [id(4), id(5), id(6)]) lapor(d, "1.7.4", "berhasil");
    await beres();
    expect(tg.pesan).toHaveLength(3); // canary, gelombang 1, gelombang 2 (= ringkasan akhir); bukan 2 pesan x 6 perangkat
    expect(tg.pesan[1]).toBe("🌊 Gelombang 1.7.4 · gelombang 1 dari 2: 2 berhasil. Lanjut gelombang 2 dari 2 (3 perangkat).");
    expect(tg.pesan[2]).toMatch(/^✅ Gelombang 1\.7\.4 SELESAI · gelombang 2 dari 2: 3 berhasil\. Semua tahap: 6 berhasil, dalam 1 menit/);
    expect(keadaanGelombang()).toMatchObject({ keadaan: "selesai", tahap_ke: 2 });
  });

  it("rem darurat di canary: rollback = berhenti, perangkat lain TIDAK pernah dikirimi", async () => {
    armada(21);
    await mulaiGelombang("1.7.4", "1", { tungguMenit: 1 });
    await beres();
    lapor(id(1), "1.7.4", "rollback", "tidak tersambung ke broker dalam 60 detik");
    await beres();
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(ota.kirim).toEqual([id(1)]);
    expect(tg.pesan).toEqual(["🛑 Gelombang 1.7.4 BERHENTI (rem darurat) · canary: 1 kembali ke versi lama (rollback) (f00d00000001: "
      + "tidak tersambung ke broker dalam 60 detik). 20 perangkat lain TIDAK dikirimi: periksa dulu, lalu tarik rilisnya."]);
    expect(keadaanGelombang()).toMatchObject({ keadaan: "berhenti", alasan: "rem darurat di canary" });
  });

  it("rem darurat di tengah: satu perangkat gelombang 2 gagal = gelombang 3 tidak dikirim; yang dilewati tidak menarik rem", async () => {
    armada(8); // canary + 7 -> gelombang 2, 4, 1
    ota.jawab.set(id(3), { status: "tidak-dikirim", pesan: "perangkat sedang offline: perintah update hanya dikirim ke perangkat online (tidak diantre)" });
    await mulaiGelombang("1.7.4", "1", { tungguMenit: 1 });
    await beres();
    canarySehat(id(1), "1.7.4");
    lapor(id(1), "1.7.4", "berhasil");
    await vi.advanceTimersByTimeAsync(61_000);
    await beres();
    lapor(id(2), "1.7.4", "berhasil"); // id(3) dilewati: gelombang 1 tetap lolos
    await beres();
    expect(tg.pesan[1]).toBe("🌊 Gelombang 1.7.4 · gelombang 1 dari 3: 1 berhasil, 1 dilewati (f00d00000003: perangkat sedang offline: "
      + "perintah update hanya dikirim ke perangkat online (tidak diantre)). Lanjut gelombang 2 dari 3 (4 perangkat).");
    lapor(id(4), "1.7.4", "berhasil");
    lapor(id(5), "1.7.4", "kedaluwarsa", "tanpa kabar dari perangkat");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(ota.kirim).not.toContain(id(8)); // gelombang 3 tidak pernah dikirim
    expect(tg.pesan.at(-1)).toBe("🛑 Gelombang 1.7.4 BERHENTI (rem darurat) · gelombang 2 dari 3: 1 berhasil, 1 tanpa kabar (kedaluwarsa) "
      + "(f00d00000005: tanpa kabar dari perangkat), 2 masih berjalan (f00d00000006; f00d00000007). 1 perangkat lain TIDAK dikirimi: periksa "
      + "dulu, lalu tarik rilisnya.");
    lapor(id(6), "1.7.4", "berhasil"); // hasil yang datang sesudah rem tetap dicatat
    await beres();
    expect(keadaanGelombang()?.tahap[2].perangkat.find((p) => p.device_id === id(6))?.status).toBe("berhasil");
    expect(tg.pesan).toHaveLength(3); // tidak ada pesan tambahan sesudah rem
  });

  it("beberapa kabar akhir yang tiba bersamaan (pengawas kedaluwarsa): SATU ringkasan rem yang menyebut semuanya", async () => {
    armada(4); // canary + 3 -> gelombang 2, 1
    await mulaiGelombang("1.7.4", "1", { tungguMenit: 1 });
    await beres();
    canarySehat(id(1), "1.7.4");
    lapor(id(1), "1.7.4", "berhasil");
    await vi.advanceTimersByTimeAsync(61_000);
    await beres();
    for (const d of [id(2), id(3)]) lapor(d, "1.7.4", "kedaluwarsa", "tanpa kabar dari perangkat"); // satu putaran pengawas
    await beres();
    expect(tg.pesan.at(-1)).toBe("🛑 Gelombang 1.7.4 BERHENTI (rem darurat) · gelombang 1 dari 2: 2 tanpa kabar (kedaluwarsa) "
      + "(f00d00000002: tanpa kabar dari perangkat; f00d00000003: tanpa kabar dari perangkat). 1 perangkat lain TIDAK dikirimi: "
      + "periksa dulu, lalu tarik rilisnya.");
    expect(tg.pesan).toHaveLength(2);
  });

  it("masa tunggu sehat: canary terputus atau menyala ulang = rem darurat, gelombang 1 tidak dikirim", async () => {
    armada(4);
    await mulaiGelombang("1.7.4", "1", { tungguMenit: 10 });
    await beres();
    canarySehat(id(1), "1.7.4");
    simpanTelemetry(id(1), { ts: "2026-11-02T02:59:00Z", fw: "1.7.0", suhu: 29, kelembapan: 70, cahaya: 900, tanah: 40, gerak: false,
      level_air: 80 }); // telemetry LAMA (sebelum menyala ulang): bukan alasan rem, vitals lebih baru
    lapor(id(1), "1.7.4", "berhasil");
    await vi.advanceTimersByTimeAsync(3 * 60_000);
    expect(tg.pesan).toHaveLength(1); // masih sehat
    simpanVitals(id(1), { ts: new Date().toISOString().slice(0, 19) + "Z", rssi: -60, heap_free: 180000, uptime_s: 4,
      reset_reason: "PANIC", fw: "1.7.4" }); // menyala ulang karena galat, versi tetap 1.7.4
    await vi.advanceTimersByTimeAsync(5_000);
    expect(tg.pesan.at(-1)).toBe("🛑 Gelombang 1.7.4 BERHENTI (rem darurat): canary f00d00000001 menyala ulang selama masa tunggu sehat "
      + "(PANIC). 3 perangkat lain TIDAK dikirimi: periksa dulu, lalu tarik rilisnya.");
    expect(ota.kirim).toEqual([id(1)]);
  });

  it("canary sudah memakai versinya (gelombang diulang) dan admin menghentikan: tahap berikutnya tidak dikirim", async () => {
    armada(6);
    db.perangkat[0].fw = "1.7.4"; // canary sudah 1.7.4: tidak dikirimi lagi, tetap diawasi masa tunggu
    canarySehat(id(1), "1.7.4");
    await mulaiGelombang("1.7.4", "1", { tungguMenit: 1 });
    await beres();
    expect(ota.kirim).toEqual([]);
    expect(tg.pesan[0]).toMatch(/^🌊 Gelombang 1\.7\.4 · canary: 1 sudah memakai versi ini\. Tunggu 1 menit/);
    await vi.advanceTimersByTimeAsync(61_000);
    await beres();
    expect(ota.kirim).toEqual([id(2), id(3)]);
    expect(hentikanGelombang("1")).toMatchObject({ keadaan: "berhenti", alasan: "dihentikan admin (akun 1)" });
    lapor(id(2), "1.7.4", "berhasil");
    lapor(id(3), "1.7.4", "berhasil");
    await beres();
    expect(ota.kirim).toEqual([id(2), id(3)]); // gelombang 2 tidak dikirim
    expect(tg.pesan.at(-1)).toBe("⏹️ Gelombang 1.7.4 berhenti: dihentikan admin (akun 1) · gelombang 1 dari 2: 2 masih berjalan "
      + "(f00d00000002; f00d00000003). 3 perangkat lain TIDAK dikirimi.");
    expect(hentikanGelombang("1")).toBeNull(); // tidak ada lagi yang berjalan
  });
});
