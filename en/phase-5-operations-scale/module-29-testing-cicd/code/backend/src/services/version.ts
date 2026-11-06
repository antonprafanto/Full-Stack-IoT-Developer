// version.ts - comparing SemVer x.y.z firmware version numbers (Module 28), without an extra package.
// Why not just compare them as text? Because "1.10.0" < "1.9.0" when read character by character ("1" < "9"),
// while 1.10.0 is newer. Each part must be compared as a NUMBER, from the left: MAJOR, then MINOR, then PATCH.

const PATTERN = /^(\d+)\.(\d+)\.(\d+)$/; // the same as Version in the data contract: no "v" prefix and no "-test" suffix

// The RELEASE versions that may be uploaded and ordered (Module 28): x.y.z without leading zeros and at most 5 digits per
// part. "1.07.1" is refused: as a number it equals 1.7.1, but as text it differs, so the 304 "already running this
// version" (text) and compareVersions() (numbers) would disagree. The version a device REPORTS still uses the data contract
// pattern above (older firmware must not suddenly be refused). The same pattern is in the CHECK of the firmware table (migration 011).
export const RELEASE_VERSION_PATTERN = /^(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})$/;

// The result is negative if a is older than b, 0 if they are equal, positive if a is newer (like a sort() comparator).
// A version with the wrong form is a programming error, not ordinary data: it is thrown as an Error, not quietly taken as 0.
export function compareVersions(a: string, b: string): number {
  const x = PATTERN.exec(a);
  const y = PATTERN.exec(b);
  if (x === null || y === null) throw new Error(`version must look like x.y.z, for example 1.7.1: "${x === null ? a : b}"`);
  for (let i = 1; i <= 3; i++) {
    const diff = Number(x[i]) - Number(y[i]);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
}

// The highest version of a list, or null if the list is empty.
export function highestVersion(list: string[]): string | null {
  return list.reduce<string | null>((best, v) => (best === null || compareVersions(v, best) > 0 ? v : best), null);
}
