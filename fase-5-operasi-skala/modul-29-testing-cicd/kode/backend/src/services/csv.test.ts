// csv.test.ts - uji pembuat CSV (Modul 25, resep Modul 23 di server): BOM, pemisah titik koma, koma desimal, CRLF, tanda
// petik, dan sel kosong. Fungsi murni: tanpa database, tanpa jaringan. Jalankan: npm test
import { describe, expect, it } from "vitest";
import { keCsv, kutip } from "./csv.ts";

describe("pembuat CSV", () => {
  it("diawali BOM (3 byte EF BB BF), dipisah titik koma, setiap baris diakhiri CRLF", () => {
    const teks = keCsv([["device_id", "jumlah_bacaan"], ["f00d00000001", 8640]]);
    expect(teks).toBe("\uFEFFdevice_id;jumlah_bacaan\r\nf00d00000001;8640\r\n");
    expect([...Buffer.from(teks, "utf8").subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  });

  it("angka desimal memakai koma, angka negatif dan bulat tetap utuh", () => {
    expect(keCsv([[28.8, -69, 0, 184562]])).toBe("\uFEFF28,8;-69;0;184562\r\n");
  });

  it("null menjadi sel kosong (misalnya vitals Node 2 yang memang tidak ada)", () => {
    expect(keCsv([["f00d000000b2", null, null, 3]])).toBe("\uFEFFf00d000000b2;;;3\r\n");
  });

  it("teks yang memuat ; \" atau baris baru dibungkus petik, petik di dalamnya digandakan", () => {
    expect(kutip("Node 1; ruang tamu")).toBe("\"Node 1; ruang tamu\"");
    expect(kutip("Kebun \"belakang\"")).toBe("\"Kebun \"\"belakang\"\"\"");
    expect(kutip("dua\r\nbaris")).toBe("\"dua\r\nbaris\"");
    expect(kutip("Kebun (tiruan)")).toBe("Kebun (tiruan)"); // tanpa tanda istimewa: apa adanya
    expect(keCsv([["a;b", "c"]])).toBe("\uFEFF\"a;b\";c\r\n");
  });
});
