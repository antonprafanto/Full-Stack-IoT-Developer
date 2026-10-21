// mesin.test.ts - unit test pertama proyek (Modul 19): menguji otak aturan tanpa MQTT, database, atau jam sungguhan.
// Jalankan: npm test
import { describe, expect, it } from "vitest";
import { CATATAN_AWAL, INGATAN_AWAL, PENGINGAT_MS, nilaiAmbang, perluKabari } from "./mesin.ts";
import type { Ingatan, Keputusan } from "./mesin.ts";
import { Aturan } from "../schemas/aturan.ts";
import type { KondisiAmbang } from "../schemas/aturan.ts";

// aturan kipas contoh: menyala di atas 30 °C selama 2 menit, padam di bawah 28 °C
const KIPAS: KondisiAmbang = {
  jenis: "ambang", device_id: "f00d00000001", besaran: "suhu", nyala_di_atas: 30, padam_di_bawah: 28, selama_detik: 120,
};
const T0 = Date.parse("2026-10-21T13:00:00+07:00"); // jam pura-pura: tes tidak perlu menunggu 2 menit sungguhan
const MENYALA: Ingatan = { aktif: true, sejak: null, terakhir: T0 }; // aturan yang kipasnya sudah menyala

// Nilai beberapa bacaan [detik sejak T0, nilai] berurutan. Hasilnya ingatan terakhir dan semua keputusan.
function jalankan(bacaan: [number, number | null][], awal: Ingatan = INGATAN_AWAL) {
  let ingatan = awal;
  const keputusan: Keputusan[] = [];
  for (const [detik, nilai] of bacaan) {
    const hasil = nilaiAmbang(KIPAS, ingatan, nilai, T0 + detik * 1000);
    ingatan = hasil.ingatan;
    keputusan.push(hasil.keputusan);
  }
  return { ingatan, keputusan };
}

// bacaan setiap 10 detik dari detik `mulai` sampai `sampai`, semuanya bernilai `nilai`
function setiap10Detik(mulai: number, sampai: number, nilai: number | null): [number, number | null][] {
  const daftar: [number, number | null][] = [];
  for (let detik = mulai; detik <= sampai; detik += 10) daftar.push([detik, nilai]);
  return daftar;
}

describe("aturan kipas (nilaiAmbang)", () => {
  it("suhu 29,5 °C: tidak ada keputusan, kipas tetap padam", () => {
    const { ingatan, keputusan } = jalankan(setiap10Detik(0, 300, 29.5));
    expect(keputusan.every((k) => k === null)).toBe(true);
    expect(ingatan.aktif).toBe(false);
  });

  it("suhu 31 °C baru 60 detik: masih menunggu", () => {
    const { ingatan, keputusan } = jalankan(setiap10Detik(0, 60, 31));
    expect(keputusan.at(-1)).toBeNull();
    expect(ingatan.sejak).toBe(T0); // hitungan dimulai dari bacaan panas pertama
  });

  it("suhu 31 °C selama 120 detik: kipas dinyalakan, sekali saja", () => {
    const { keputusan } = jalankan(setiap10Detik(0, 150, 31));
    expect(keputusan[12]).toBe("nyalakan"); // bacaan ke-13, detik ke-120
    expect(keputusan.filter((k) => k === "nyalakan")).toHaveLength(1); // detik 130-150 tidak menyalakan lagi
  });

  it("tepat 30 °C di tengah hitungan: hitungan diulang (harus DI ATAS 30)", () => {
    const { ingatan, keputusan } = jalankan([...setiap10Detik(0, 60, 31), [70, 30], ...setiap10Detik(80, 190, 31)]);
    expect(keputusan).not.toContain("nyalakan"); // detik 80 sampai 190 baru 110 detik
    expect(ingatan.sejak).toBe(T0 + 80_000);
  });

  it("sudah menyala, suhu 29 °C (di antara 28 dan 30): tetap menyala", () => {
    const { ingatan, keputusan } = jalankan(setiap10Detik(10, 100, 29), MENYALA);
    expect(keputusan.every((k) => k === null)).toBe(true);
    expect(ingatan.aktif).toBe(true);
  });

  it("sudah menyala, suhu 27,9 °C: kipas dipadamkan", () => {
    const { ingatan, keputusan } = jalankan([[10, 27.9]], MENYALA);
    expect(keputusan[0]).toBe("padamkan");
    expect(ingatan.aktif).toBe(false);
  });

  it("bacaan null (sensor gagal): tidak memutuskan, hitungan diulang", () => {
    const { ingatan, keputusan } = jalankan([...setiap10Detik(0, 100, 31), [110, null], ...setiap10Detik(120, 200, 31)]);
    expect(keputusan).not.toContain("nyalakan");
    expect(ingatan.sejak).toBe(T0 + 120_000);
  });

  it("jeda antarbacaan lebih dari 60 detik: hitungan diulang", () => {
    const { ingatan, keputusan } = jalankan([[0, 31], [50, 31], [130, 31]]); // detik 50 ke 130 = 80 detik tanpa kabar
    expect(keputusan).not.toContain("nyalakan");
    expect(ingatan.sejak).toBe(T0 + 130_000);
  });
});

describe("peringatan Telegram (perluKabari)", () => {
  it("kabari saat berubah, ingatkan 30 menit sekali selama bahaya, kabari lagi saat pulih", () => {
    let catatan = CATATAN_AWAL;
    let hasil = perluKabari(catatan, "bahaya", T0);
    expect(hasil.kirim).toBe(true); // aman -> bahaya
    catatan = hasil.catatan;
    expect(perluKabari(catatan, "bahaya", T0 + 10 * 60_000).kirim).toBe(false); // 10 menit kemudian: diam
    hasil = perluKabari(catatan, "bahaya", T0 + PENGINGAT_MS);
    expect(hasil.kirim).toBe(true); // 30 menit kemudian: pengingat
    catatan = hasil.catatan;
    expect(perluKabari(catatan, "aman", T0 + PENGINGAT_MS + 60_000).kirim).toBe(true); // bahaya -> aman: pesan pulih
  });
});

describe("skema aturan (Zod)", () => {
  it("menolak padam_di_bawah yang tidak lebih kecil daripada nyala_di_atas", () => {
    const aturan = {
      nama: "Kipas otomatis", aktif: true, kondisi: KIPAS,
      aksi: { jenis: "sakelar", device_id: "f00d00000001", target: "kipas", kabari: true },
    };
    expect(Aturan.safeParse(aturan).success).toBe(true);
    const terbalik = { ...aturan, kondisi: { ...KIPAS, padam_di_bawah: 30 } }; // 30 tidak lebih kecil daripada 30
    expect(Aturan.safeParse(terbalik).success).toBe(false);
  });

  it("aturan jadwal: \"0 6 * * *\" diterima, \"61 * * * *\" ditolak", () => { // Praktik 5
    const siram = {
      nama: "Siram pagi", aktif: true, kondisi: { jenis: "jadwal", cron: "0 6 * * *" },
      aksi: { jenis: "perintah", device_id: "f00d00000001", perintah: { target: "pompa", nilai: 10 }, kabari: true },
    };
    expect(Aturan.safeParse(siram).success).toBe(true);
    expect(Aturan.safeParse({ ...siram, kondisi: { jenis: "jadwal", cron: "61 * * * *" } }).success).toBe(false);
  });
});
