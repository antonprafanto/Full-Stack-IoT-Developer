// otomasi.test.ts - uji otomasi.ts (Modul 24) TANPA database, MQTT, atau Telegram: semua tetangganya diganti tiruan
// (vi.mock). Yang dicatat hanya perintah apa yang "dikirim" ke perangkat dan kejadian apa yang ditulis. Yang diuji: aturan
// siram (ambang-bawah + perintah) menyiram SEKALI, padam tanpa perintah lalu siap lagi, perintah yang ditolak perangkat
// ditandai ok: false, dan aturan yang dihapus atau dinonaktifkan tidak bertindak lagi. Jalankan: npm test
import { beforeEach, describe, expect, it, vi } from "vitest";

const tabel = vi.hoisted(() => ({ aturan: [] as Record<string, unknown>[] })); // tabel rules tiruan
const kirim = vi.hoisted(() => [] as { target: string; nilai: unknown }[]); // perintah yang "dikirim" ke perangkat
const kejadian = vi.hoisted(() => [] as { aturan_id: number | null; pesan: string; data?: unknown }[]);
const jawaban = vi.hoisted(() => ({ ok: true, pesan: undefined as string | undefined })); // ack perangkat tiruan
const lupakan = vi.hoisted(() => [] as number[]); // nomor aturan yang keinginannya dilupakan perintah.ts

vi.mock("../db/arsip.ts", () => ({
  ambilSemuaAturan: async () => tabel.aturan,
  tambahAturan: async () => { throw new Error("tidak dipakai"); },
  ubahAturan: async (id: number, isi: Record<string, unknown>) => {
    const lama = tabel.aturan.find((b) => b.id === id);
    if (lama === undefined) return undefined;
    const baru = { ...lama, ...isi };
    tabel.aturan = tabel.aturan.map((b) => (b.id === id ? baru : b));
    return baru;
  },
  hapusAturanDb: async (id: number) => {
    const baris = tabel.aturan.find((b) => b.id === id);
    if (baris === undefined) return undefined;
    tabel.aturan = tabel.aturan.filter((b) => b.id !== id);
    return { id, nama: baris.nama };
  },
  waktuKontrak: (w: Date) => w.toISOString().slice(0, 19) + "Z",
}));
vi.mock("./perintah.ts", () => ({
  perintahkan: async (_device: string, perintah: { target: string; nilai: unknown }) => {
    kirim.push(perintah);
    return { status: "dijawab", id: `c-${kirim.length}`, lama_ms: 5,
      ack: { id: `c-${kirim.length}`, ts: null, ok: jawaban.ok, pesan: jawaban.pesan, state: {} } };
  },
  lupakanKeinginanAturan: (aturanId: number) => { lupakan.push(aturanId); },
}));
vi.mock("./kejadian.ts", () => ({ catatKejadian: (k: { aturan_id: number | null; pesan: string }) => { kejadian.push(k); } }));
vi.mock("./gudang.ts", () => ({ cariPerangkat: () => undefined, tungguAck: async () => null }));
vi.mock("./mqtt.ts", () => ({ buatIdPerintah: () => "c-config", kirimConfig: () => {}, ringkas: () => "" }));
vi.mock("./jadwal.ts", () => ({ pasangJadwal: () => {} }));
vi.mock("./telegram.ts", () => ({ kabariKalauPerlu: async () => {} }));

import { gantiAturan, hapusAturan, muatAturan, nilaiBacaan } from "./otomasi.ts";
import type { Aturan } from "../schemas/aturan.ts";
import type { TelemetryNode1 } from "../schemas/kontrak.ts";

const ID = "f00d00000001";
const SIRAM: Aturan = { nama: "Siram jika tanah < 30 %", aktif: true,
  kondisi: { jenis: "ambang-bawah", device_id: ID, besaran: "tanah", nyala_di_bawah: 30, padam_di_atas: 35, selama_detik: 0 },
  aksi: { jenis: "perintah", device_id: ID, perintah: { target: "pompa", nilai: 5 }, kabari: false } };
const tunggu = () => new Promise((r) => setTimeout(r, 0)); // beri kesempatan bertindak() (async) selesai
async function bacaan(tanah: number) {
  nilaiBacaan(ID, { ts: new Date().toISOString().slice(0, 19) + "Z", tanah } as unknown as TelemetryNode1);
  await tunggu();
}

let nomor = 0; // setiap tes memakai nomor aturan baru: ingatan aturan di otomasi.ts bertahan antar-tes

describe("otomasi: aturan siram (ambang-bawah + perintah)", () => {
  beforeEach(async () => {
    tabel.aturan = [{ ...structuredClone(SIRAM), id: ++nomor, dibuat: new Date(), diubah: new Date() }];
    kirim.length = 0;
    kejadian.length = 0;
    lupakan.length = 0;
    jawaban.ok = true;
    jawaban.pesan = undefined;
    await muatAturan();
  });

  it("tanah 25: pompa 5 detik dikirim SEKALI, walaupun tanah tetap 25", async () => {
    await bacaan(25);
    await bacaan(25);
    await bacaan(26);
    expect(kirim).toEqual([{ target: "pompa", nilai: 5 }]);
    expect(kejadian).toHaveLength(1);
    expect(kejadian[0]).toMatchObject({ aturan_id: nomor, pesan: "🌱 Tanah 25 % — pompa menyiram 5 detik otomatis",
      data: { hasil: "dijawab", ok: true } });
  });

  it("tanah naik ke 36: aturan padam TANPA perintah (ok null), lalu siap menyiram lagi", async () => {
    await bacaan(25);
    await bacaan(36);
    expect(kirim).toHaveLength(1); // padam tidak mengirim apa-apa
    expect(kejadian.at(-1)).toMatchObject({ aturan_id: nomor, pesan: "✅ Tanah naik ke 36 % — aturan siap lagi",
      data: { perintah: null, hasil: "tanpa-perintah", ok: null } });
    await bacaan(25);
    expect(kirim).toHaveLength(2); // kekeringan berikutnya: menyiram lagi
  });

  it("perangkat menolak (tandon kurang): kejadian ⚠️ dengan ok: false, dan tidak dicoba lagi selama tanah tetap kering", async () => {
    jawaban.ok = false;
    jawaban.pesan = "pompa ditolak: air tandon kurang";
    await bacaan(25);
    await bacaan(25);
    expect(kirim).toHaveLength(1);
    expect(kejadian[0]).toMatchObject({ pesan: "⚠️ Tanah 25 % — perintah pompa ditolak perangkat: pompa ditolak: air tandon kurang",
      data: { hasil: "dijawab", ok: false } });
  });

  it("dihapus: kejadiannya ber-aturan_id null, keinginannya dilupakan, dan bacaan kering sesudahnya tidak menyiram", async () => {
    expect(await hapusAturan(nomor)).toEqual({ id: nomor, nama: "Siram jika tanah < 30 %" });
    expect(kejadian.at(-1)).toMatchObject({ aturan_id: null, data: { id: nomor, dihapus: true } });
    expect(lupakan).toEqual([nomor]);
    await bacaan(25);
    expect(kirim).toHaveLength(0);
  });

  it("dinonaktifkan: keinginannya dilupakan dan aturan tidak menyiram lagi", async () => {
    await gantiAturan(nomor, { ...structuredClone(SIRAM), aktif: false });
    expect(lupakan).toEqual([nomor]);
    await bacaan(25);
    expect(kirim).toHaveLength(0);
  });
});
