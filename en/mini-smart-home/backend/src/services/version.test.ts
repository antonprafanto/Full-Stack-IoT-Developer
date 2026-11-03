// version.test.ts - tests of compareVersions() (Module 28): version numbers are compared part by part as NUMBERS, not as text.
// Run: npm test
import { describe, expect, it } from "vitest";
import { RELEASE_VERSION_PATTERN, compareVersions, highestVersion } from "./version.ts";

describe("compareVersions", () => {
  it("MAJOR, then MINOR, then PATCH; the result is -1, 0, or 1", () => {
    expect(compareVersions("1.7.1", "1.7.0")).toBe(1);
    expect(compareVersions("1.7.0", "1.7.1")).toBe(-1);
    expect(compareVersions("1.7.1", "1.7.1")).toBe(0);
    expect(compareVersions("2.0.0", "1.99.99")).toBe(1);
    expect(compareVersions("1.6.0", "1.7.0")).toBe(-1);
  });

  it("1.10.0 is NEWER than 1.9.0 (an ordinary text comparison is wrong here)", () => {
    expect("1.10.0" < "1.9.0").toBe(true); // text: "1" < "9", so wrong
    expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
    expect(compareVersions("1.7.10", "1.7.9")).toBe(1);
  });

  it("a wrong form is thrown as an error, not quietly taken as equal", () => {
    expect(() => compareVersions("v1.7.1", "1.7.0")).toThrow("x.y.z");
    expect(() => compareVersions("1.7", "1.7.0")).toThrow("x.y.z");
    expect(() => compareVersions("1.7.2-test", "1.7.0")).toThrow("x.y.z");
  });

  it("RELEASE versions: no leading zeros, at most 5 digits per part (1.07.1 = 1.7.1 as a number, different as text)", () => {
    for (const v of ["0.0.0", "1.7.1", "1.10.0", "10.0.99999"]) expect(RELEASE_VERSION_PATTERN.test(v)).toBe(true);
    for (const v of ["1.07.1", "01.7.1", "1.7.01", "1.7", "1.7.1-test", "v1.7.1", "1.7.123456"]) expect(RELEASE_VERSION_PATTERN.test(v)).toBe(false);
    expect(compareVersions("1.07.1", "1.7.1")).toBe(0); // this is why a release with a leading zero is refused
  });

  it("highestVersion: the newest release of a list, null if it is empty", () => {
    expect(highestVersion(["1.7.0", "1.10.0", "1.9.3"])).toBe("1.10.0");
    expect(highestVersion([])).toBeNull();
  });
});
