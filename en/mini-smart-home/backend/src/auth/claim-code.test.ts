// claim-code.test.ts - tests of the single-use claim codes (Module 28): the XXXX-XXXX Crockford Base32 form, a code typed by a
// human is tidied first (lowercase, spaces, O/0, I/L/1), and the database only gets its fingerprint. Run: npm test
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createClaimCode, hashClaimCode, tidyClaimCode } from "./claim-code.ts";

describe("claim codes", () => {
  it("the form is XXXX-XXXX from the 32 Crockford characters (no I, L, O, U), and always different", () => {
    const codes = Array.from({ length: 200 }, createClaimCode);
    for (const c of codes) expect(c).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(new Set(codes).size).toBe(200);
  });

  it("a typed code is tidied: lowercase, spaces, no -, O read as 0, I and L read as 1", () => {
    expect(tidyClaimCode("7k2m-qf9d")).toBe("7K2MQF9D");
    expect(tidyClaimCode(" 7K2M QF9D ")).toBe("7K2MQF9D");
    expect(tidyClaimCode("O1IL-ABCD")).toBe("0111ABCD");
  });

  it("a form that stays wrong = null (U isn't a Crockford character, the wrong length)", () => {
    expect(tidyClaimCode("UUUU-UUUU")).toBeNull();
    expect(tidyClaimCode("7K2M-QF9")).toBeNull();
    expect(tidyClaimCode("7K2M-QF9DX")).toBeNull();
  });

  it("fingerprint = the SHA-256 of the tidy form: codes written differently with the same meaning have the same fingerprint", () => {
    const tidy = tidyClaimCode("7k2m-qf9d") ?? "";
    expect(hashClaimCode(tidy)).toBe(createHash("sha256").update("7K2MQF9D").digest("hex"));
    expect(hashClaimCode(tidyClaimCode("7K2M QF9D") ?? "")).toBe(hashClaimCode(tidy));
  });
});
