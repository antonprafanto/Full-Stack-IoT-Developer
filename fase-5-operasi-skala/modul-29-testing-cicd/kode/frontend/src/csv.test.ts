// csv.test.ts - uji pembuat CSV dashboard (Modul 29): berkas dari tombol CSV di layar Riwayat harus terbuka rapi di Excel
// dengan setelan Indonesia. Fungsi murni: tanpa browser, tanpa backend. Jalankan dari folder frontend: npm test
import { describe, expect, it } from "vitest";
import { keCsv, waktuCsv } from "./csv";

describe("CSV untuk Excel Indonesia (csv.ts)", () => {
  it("keCsv: titik koma, koma desimal, petik untuk nama bertitik koma, sel kosong untuk null, BOM, dan CRLF", () => {
    const teks = keCsv([
      ["waktu", "perangkat", "suhu"],
      ["2026-10-24 16:15:42", "Node 1; ruang tamu", 28.5],
      ["2026-10-24 16:15:52", "Kebun", null], // sensor gagal: sel kosong, bukan tulisan "null"
    ]);
    expect(teks).toBe(
      "\uFEFF" + // BOM: tanda tak terlihat di awal berkas bahwa isinya UTF-8 (ditulis \uFEFF, sama dengan csv.ts)
        "waktu;perangkat;suhu\r\n" +
        '2026-10-24 16:15:42;"Node 1; ruang tamu";28,5\r\n' +
        "2026-10-24 16:15:52;Kebun;\r\n",
    );
  });

  it("waktuCsv: jam WIB berbentuk tahun-bulan-tanggal jam:menit:detik, jadi urutannya benar di Excel", () => {
    // Z di ujung = jam UTC. WIB = UTC + 7 jam.
    expect(waktuCsv("2026-10-24T09:15:42Z")).toBe("2026-10-24 16:15:42");
    // 17.00 UTC sudah lewat tengah malam di Indonesia: tanggalnya ikut berganti
    expect(waktuCsv("2026-10-24T17:00:00Z")).toBe("2026-10-25 00:00:00");
  });
});
