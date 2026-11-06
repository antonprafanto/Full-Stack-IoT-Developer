// csv.test.ts - tests for the CSV maker (Module 25, Module 23's recipe on the server): BOM, comma separator, decimal point, CRLF,
// double quotes, and empty cells. Pure functions: no database, no network. Run: npm test
import { describe, expect, it } from "vitest";
import { toCsv, quote } from "./csv.ts";

describe("the CSV maker", () => {
  it("starts with a BOM (3 bytes EF BB BF), separated by commas, every line ends with CRLF", () => {
    const text = toCsv([["device_id", "reading_count"], ["f00d00000001", 8640]]);
    expect(text).toBe("\uFEFFdevice_id,reading_count\r\nf00d00000001,8640\r\n");
    expect([...Buffer.from(text, "utf8").subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  });

  it("decimal numbers keep their point; negative and whole numbers stay whole", () => {
    expect(toCsv([[28.8, -69, 0, 184562]])).toBe("\uFEFF28.8,-69,0,184562\r\n");
  });

  it("null becomes an empty cell (for example Node 2's vitals, which really don't exist)", () => {
    expect(toCsv([["f00d000000b2", null, null, 3]])).toBe("\uFEFFf00d000000b2,,,3\r\n");
  });

  it("text containing , \" or a line break is wrapped in quotes, quotes inside are doubled", () => {
    expect(quote("Node 1, living room")).toBe("\"Node 1, living room\"");
    expect(quote("Garden \"back\"")).toBe("\"Garden \"\"back\"\"\"");
    expect(quote("two\r\nlines")).toBe("\"two\r\nlines\"");
    expect(quote("Garden (mock)")).toBe("Garden (mock)"); // no special characters: as it is
    expect(toCsv([["a,b", "c"]])).toBe("\uFEFF\"a,b\",c\r\n");
  });
});
