// mesin.test.ts - unit test pertama proyek (Modul 19): menguji otak aturan tanpa MQTT, database, atau jam sungguhan.
// Modul 24: ditambah aturan "di bawah ambang" (siram kalau tanah kering) dan skema aturan 1.1. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { CATATAN_AWAL, INGATAN_AWAL, PENGINGAT_MS, nilaiAmbang, nilaiAmbangBawah, perluKabari } from "./mesin.ts";
import type { Ingatan, Keputusan } from "./mesin.ts";
import { Aturan } from "../schemas/aturan.ts";
import type { KondisiAmbang, KondisiAmbangBawah } from "../schemas/aturan.ts";
import { Aturan as AturanDasar } from "../schemas/aturan-dasar.ts"; // Modul 24: versi tanpa node-cron (salinannya di frontend)

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

// ---------- Modul 24: kondisi di bawah ambang ----------

// aturan siram contoh: tanah di bawah 30 % selama 20 detik -> pompa sekali; siap lagi setelah tanah naik di atas 35 %
const SIRAM: KondisiAmbangBawah = {
  jenis: "ambang-bawah", device_id: "f00d00000001", besaran: "tanah", nyala_di_bawah: 30, padam_di_atas: 35, selama_detik: 20,
};

// sama dengan jalankan() di atas, tetapi untuk aturan siram
function jalankanSiram(bacaan: [number, number | null][], awal: Ingatan = INGATAN_AWAL) {
  let ingatan = awal;
  const keputusan: Keputusan[] = [];
  for (const [detik, nilai] of bacaan) {
    const hasil = nilaiAmbangBawah(SIRAM, ingatan, nilai, T0 + detik * 1000);
    ingatan = hasil.ingatan;
    keputusan.push(hasil.keputusan);
  }
  return { ingatan, keputusan };
}

describe("aturan siram, tanah di bawah ambang (nilaiAmbangBawah)", () => {
  it("tanah tepat 30 %: tidak menyiram (harus DI BAWAH 30)", () => {
    const { ingatan, keputusan } = jalankanSiram(setiap10Detik(0, 120, 30));
    expect(keputusan.every((k) => k === null)).toBe(true);
    expect(ingatan.aktif).toBe(false);
  });

  it("tanah 25 % baru 10 detik: masih menunggu", () => {
    const { ingatan, keputusan } = jalankanSiram(setiap10Detik(0, 10, 25));
    expect(keputusan.at(-1)).toBeNull();
    expect(ingatan.sejak).toBe(T0); // hitungan dimulai dari bacaan kering pertama
  });

  it("tanah 25 % selama 20 detik: menyala (pompa dikirim) sekali saja, walaupun tanah tetap 25 %", () => {
    const { keputusan } = jalankanSiram(setiap10Detik(0, 120, 25));
    expect(keputusan[2]).toBe("nyalakan"); // bacaan ke-3, detik ke-20
    expect(keputusan.filter((k) => k === "nyalakan")).toHaveLength(1); // keputusan hanya di tepi
  });

  it("tanah naik ke 31 % di tengah hitungan: hitungan diulang", () => {
    const { ingatan, keputusan } = jalankanSiram([[0, 25], [10, 31], [20, 25], [30, 25]]);
    expect(keputusan).not.toContain("nyalakan"); // detik 20 sampai 30 baru 10 detik
    expect(ingatan.sejak).toBe(T0 + 20_000);
  });

  it("sudah menyala: 33 % dan tepat 35 % tetap menyala (celah histeresis), 36 %: padam, siap menyiram lagi", () => {
    const { ingatan, keputusan } = jalankanSiram([[10, 33], [20, 35], [30, 36]], MENYALA);
    expect(keputusan).toEqual([null, null, "padamkan"]);
    expect(ingatan.aktif).toBe(false);
  });

  it("bacaan null (sensor gagal): tidak memutuskan, hitungan diulang", () => {
    const { ingatan, keputusan } = jalankanSiram([[0, 25], [10, null], [20, 25]]);
    expect(keputusan).not.toContain("nyalakan");
    expect(ingatan.sejak).toBe(T0 + 20_000);
  });
});

describe("skema aturan 1.1 (Zod)", () => {
  const siramTanah = {
    nama: "Siram jika tanah < 30 %", aktif: true, kondisi: SIRAM,
    aksi: { jenis: "perintah", device_id: "f00d00000001", perintah: { target: "pompa", nilai: 5 }, kabari: false },
  };

  it("\"siram jika tanah < 30 %\" diterima, dan aturan kipas v1.0 tetap diterima", () => {
    expect(Aturan.safeParse(siramTanah).success).toBe(true);
    expect(Aturan.safeParse({ nama: "Kipas otomatis", aktif: true, kondisi: KIPAS,
      aksi: { jenis: "sakelar", device_id: "f00d00000001", target: "kipas", kabari: true } }).success).toBe(true);
  });

  it("padam_di_atas yang tidak lebih besar daripada nyala_di_bawah ditolak, galatnya di kolom padam_di_atas", () => {
    const hasil = Aturan.safeParse({ ...siramTanah, kondisi: { ...SIRAM, padam_di_atas: 30 } });
    expect(hasil.success).toBe(false);
    expect(hasil.error?.issues[0]).toMatchObject({
      path: ["kondisi", "padam_di_atas"], message: "padam_di_atas harus lebih besar daripada nyala_di_bawah (histeresis)",
    });
  });

  it("aturan ambang naik boleh mengirim perintah sekali (misalnya tirai ditutup kalau terlalu terang)", () => {
    const tirai = { ...siramTanah, nama: "Tutup tirai kalau silau",
      kondisi: { jenis: "ambang", device_id: "f00d00000001", besaran: "cahaya", nyala_di_atas: 3500, padam_di_bawah: 3000,
        selama_detik: 60 },
      aksi: { jenis: "perintah", device_id: "f00d00000001", perintah: { target: "tirai", nilai: 0 }, kabari: false } };
    expect(Aturan.safeParse(tirai).success).toBe(true);
  });

  it("jadwal dengan aksi sakelar tetap ditolak: jadwal tidak punya saat padam", () => {
    const hasil = Aturan.safeParse({ ...siramTanah, kondisi: { jenis: "jadwal", cron: "0 6 * * *" },
      aksi: { jenis: "sakelar", device_id: "f00d00000001", target: "lampu", kabari: false } });
    expect(hasil.success).toBe(false);
    expect(hasil.error?.issues.map((i) => i.message)).toContain(
      "kondisi jadwal berpasangan dengan aksi perintah; aksi sakelar hanya untuk kondisi ambang atau ambang-bawah");
  });

  it("aturan-dasar.ts (juga dipakai dashboard) hanya memeriksa 5 bidang cron; aturan.ts (server) memeriksa isinya", () => {
    const menit61 = { ...siramTanah, kondisi: { jenis: "jadwal", cron: "61 * * * *" } };
    expect(AturanDasar.safeParse(menit61).success).toBe(true);
    const hasil = Aturan.safeParse(menit61);
    expect(hasil.success).toBe(false);
    expect(hasil.error?.issues[0]).toMatchObject({ path: ["kondisi", "cron"], message: "ekspresi cron tidak sah" });
    expect(AturanDasar.safeParse({ ...siramTanah, kondisi: { jenis: "jadwal", cron: "0 6 * *" } }).success).toBe(false);
  });
});
