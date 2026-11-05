// aturan.test.ts - uji kalimat aturan otomatis (Modul 29): JSON aturan yang tersimpan di server menjadi kalimat yang dibaca
// pemilik rumah di layar Aturan. Fungsi murni: tanpa browser, tanpa backend. Jalankan dari folder frontend: npm test
import { describe, expect, it } from "vitest";
import { uraikanAturan } from "./aturan";
import type { Aturan } from "./skema/aturan-dasar";

// device_id -> nama yang dikenal manusia (di dashboard, nama ini datang dari daftar perangkat)
function nama(deviceId: string): string {
  return deviceId === "f00d00000001" ? "Ruang tamu" : "Kebun";
}

describe("aturan dalam kalimat (aturan.ts)", () => {
  it("uraikanAturan: aturan kipas Modul 19 dan jadwal siram pagi menjadi kalimat", () => {
    const kipas: Aturan = {
      nama: "kipas otomatis",
      aktif: true,
      kondisi: { jenis: "ambang", device_id: "f00d00000001", besaran: "suhu", nyala_di_atas: 30, padam_di_bawah: 28.5, selama_detik: 60 },
      aksi: { jenis: "sakelar", device_id: "f00d00000001", target: "kipas", kabari: false },
    };
    expect(uraikanAturan(kipas, nama)).toBe(
      "Kalau suhu di Ruang tamu di atas 30 °C selama 60 detik, nyalakan kipas. " +
        "Kipas dimatikan lagi sesudah suhu turun di bawah 28,5 °C.",
    );

    const siramPagi: Aturan = {
      nama: "siram pagi",
      aktif: true,
      kondisi: { jenis: "jadwal", cron: "0 6 * * *" }, // menit 0, jam 6, setiap hari
      aksi: { jenis: "perintah", device_id: "f00d000000b2", perintah: { target: "pompa", nilai: 5 }, kabari: true },
    };
    expect(uraikanAturan(siramPagi, nama)).toBe("Setiap hari pukul 06.00 WIB, siram 5 detik di Kebun. Kirim kabar lewat Telegram.");
  });
});
