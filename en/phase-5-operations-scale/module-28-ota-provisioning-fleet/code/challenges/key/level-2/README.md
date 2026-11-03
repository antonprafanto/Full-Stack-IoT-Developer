# Module 28 Challenge 2 key: `compareVersions()` and the `needs update` badge

**Task (fill in the blanks):** the server decides which devices **need an update** by comparing the firmware version a device reports
with the latest release. Versions can't be compared as ordinary text: read character by character, `"1.10.0"` is smaller than
`"1.9.0"` (because `"1"` is smaller than `"9"`), while 1.10.0 is newer. Fill in the three `____` lines in `compareVersions()` so that the three
parts of the version (MAJOR.MINOR.PATCH) are compared as **numbers**, from the left.

The answer key is the file [`backend/src/services/version.ts`](../../../backend/src/services/version.ts) in this module's `code/` folder, which
is already complete; this challenge only empties three of its lines.

## The puzzle

```ts
const PATTERN = /^(\d+)\.(\d+)\.(\d+)$/; // the same as Version in the data contract: no "v" prefix and no "-test" suffix

export function compareVersions(a: string, b: string): number {
  const x = PATTERN.exec(a);
  const y = PATTERN.exec(b);
  if (x === null || y === null) throw new Error(`version must look like x.y.z, for example 1.7.1: "${x === null ? a : b}"`);
  for (let i = 1; i <= 3; i++) {
    ____ // (1) the difference of part i, computed as a NUMBER
    ____ // (2) is this part already different? answer -1 or 1 right away
  }
  ____ // (3) all three parts are equal
}
```

## The answer

| Blank | Answer |
| :--- | :--- |
| (1) | `const diff = Number(x[i]) - Number(y[i]);` |
| (2) | `if (diff !== 0) return Math.sign(diff);` |
| (3) | `return 0;` |

## Line by line

1. `PATTERN.exec(a)` matches the version text against the pattern `x.y.z`. The result is a list: `x[0]` the whole text (`"1.10.0"`), then `x[1]` MAJOR
   (`"1"`), `x[2]` MINOR (`"10"`), and `x[3]` PATCH (`"0"`), still as **text**. Text in another form (`"v1.7.1"`, `"1.7"`,
   `"1.7.2-test"`) gives `null`.
2. `if (x === null || y === null) throw …`: a version in the wrong form is a programming error, so it is thrown as an `Error`, not
   quietly taken as equal.
3. `for (let i = 1; i <= 3; i++)`: check part 1, 2, then 3 (MAJOR, MINOR, PATCH), always from the left.
4. **(1)** `Number(…)` turns text into a number before subtracting: `Number("10") - Number("9")` = `1` (positive: `a` is newer).
   If it stayed text, `"10"` < `"9"`, and the result would be reversed.
5. **(2)** `Math.sign(diff)` tidies any difference into `-1`, `0`, or `1`. As soon as one part differs, the answer is returned
   at once: `2.0.0` compared with `1.99.99` is already decided at MAJOR (`2` > `1`), MINOR and PATCH don't need to be looked at.
6. **(3)** `return 0;`: if all three rounds pass without a difference, both versions are exactly the same.

The result follows the rule of a JavaScript `sort()` comparator (negative = older, 0 = equal, positive = newer), so
`["1.10.0", "1.9.0", "1.7.1"].sort(compareVersions)` orders the versions from the oldest.

## Where it is used, and the `needs update` badge

- `highestVersion()` (the same file) picks the **latest release** from the list of releases that aren't test releases and aren't withdrawn: `latest` in `GET /firmware`
  and `latest_release` in `GET /fleet`.
- `routes/fleet.ts`: `needs_update` is `true` for an active Node 1 whose version is older than the latest release (`compareVersions(fw,
  latest) < 0`). That is the yellow **`needs update`** badge on a device card of the **Fleet** screen, and the count "· N to update" under
  its title.
- `services/ota.ts` (`blockedReason()`): a version older than the current one is only sent with **force** (a downgrade).
- The Node 1 firmware has a sibling in C++ with the same name, `firmware/node-1-home/version.cpp` (a version in the wrong form there is taken as
  equal, so an update command with an odd version is always refused by the board).

## Test

From the `backend` folder, run only the version tests (Vitest filters the files whose name contains `version`):

```bash
npm test -- version
```

The result in the author's lab (Raspberry Pi 5, Node.js 24.21.0, backend 1.5.0):

```text
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

Then all the backend tests with `npm test`: `Test Files  25 passed (25)` and `Tests  203 passed (203)`.

If blank (1) is filled with a text comparison, for example `const diff = x[i] < y[i] ? -1 : x[i] > y[i] ? 1 : 0;`, three of the five tests fail. In the
author's lab (a copy filled in wrong on purpose):

```text
 FAIL  src/services/version.test.ts > compareVersions > 1.10.0 is NEWER than 1.9.0 (an ordinary text comparison is wrong here)
AssertionError: expected -1 to be 1 // Object.is equality
      Tests  3 failed | 2 passed (5)
```

The two other tests that fail too: `1.07.1` and `1.7.1` are taken as different (they should be equal as numbers), and `highestVersion()` picks `1.9.3`,
not `1.10.0`.

Want to see the badge on the screen? Upload two fake firmware files (from [`tools/make-fake-bin.js`](../../../tools/make-fake-bin.js)) with the versions
1.9.0 then 1.10.0 on the **Fleet** screen. In the author's lab (backend 1.5.0, 21 simulated devices running 1.7.7 and 1.7.9), `GET /firmware` answered
`"latest": {"node1": "1.10.0"}`, and all 21 cards got `needs update`; an ordinary text order would pick `1.9.0`. Not one of those files
was sent to a device.
