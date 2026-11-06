// check-version.mjs - the version guard of Mini Smart Home (Module 29). The robot runs it on every pull request and every push
// to main (the job verify in .github/workflows/ci.yml); you can run it on the laptop too, from any folder of the repo:
//   node scripts/check-version.mjs                    -> the version number the SAME in every place?
//   BASE=origin/main node scripts/check-version.mjs   -> + compared with the target branch (BASE, fetch it first with git fetch):
//                                                        if what gets DEPLOYED to the VPS/Pi changed, did the version go up (SemVer)?
//   PowerShell: $env:BASE = "origin/main"; node scripts/check-version.mjs   (afterwards: Remove-Item Env:BASE)
// No npm package, only Node.js 24. Exit code 0 = PASS, 1 = FAIL; every FAIL line says what has to be fixed.
//
// Why a guard? Since Module 29 there is ONE version number for the server: the backend and web always have the same number,
// the same as the image tags in compose.cloud.yml, the top entry of CHANGELOG.md, and the Git tag v<version> the robot makes.
// The VPS and the Pi only deploy that tagged RELEASE, so a change whose version someone forgot to raise never gets there (silently).
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Work from the repo root (the folder above scripts/), whatever folder the command is typed in
process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const problems = []; // the list of FAIL messages
const read = (path) => readFileSync(path, "utf8");
const versionOf = (jsonText) => JSON.parse(jsonText).version;
// MAJOR.MINOR.PATCH, numbers only (no -rc and the like): this number becomes the tag v<version>
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const toNumbers = (v) => v.split(".").map(Number);
const isGreater = (a, b) => { // a > b ? (number by number: 2.0.10 > 2.0.9)
  const [pa, pb] = [toNumbers(a), toNumbers(b)];
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] > pb[i];
  return false;
};

// ---------------------------------------------------------------------------------------------------------------------------
// 1) ONE version number in every place a machine reads
// ---------------------------------------------------------------------------------------------------------------------------
const version = versionOf(read("backend/package.json"));
const places = [["backend/package.json", version]];
places.push(["frontend/package.json", versionOf(read("frontend/package.json"))]);
for (const folder of ["backend", "frontend"]) {
  // package-lock.json keeps the project version in TWO places; npm version changes both at once
  const lock = JSON.parse(read(`${folder}/package-lock.json`));
  places.push([`${folder}/package-lock.json ("version")`, lock.version]);
  places.push([`${folder}/package-lock.json (packages[""].version)`, lock.packages?.[""]?.version]);
}
// Only the "image:" lines are read (a comment may name an image without a version)
const compose = read("compose.cloud.yml");
for (const name of ["backend", "web"]) {
  const tag = [...compose.matchAll(new RegExp(`^\\s*image:.*/mini-smart-home-${name}:(\\S+)\\s*$`, "gm"))];
  if (tag.length === 0) problems.push(`compose.cloud.yml: no line "image: …/mini-smart-home-${name}:<version>"`);
  for (const t of tag) places.push([`compose.cloud.yml (image mini-smart-home-${name})`, t[1]]);
}
// The top release entry of CHANGELOG.md: "## [2.0.1] - 2026-11-20" (the "## [Unreleased]" section above it doesn't count)
const entry = read("CHANGELOG.md").match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}\s*$/m);
if (entry) places.push(["CHANGELOG.md (top release entry)", entry[1]]);
else problems.push("CHANGELOG.md: no release entry of the form \"## [x.y.z] - YYYY-MM-DD\" yet");

if (!SEMVER_PATTERN.test(version)) {
  problems.push(`backend/package.json: version "${version}" isn't MAJOR.MINOR.PATCH with numbers only (for example 2.0.1)`);
}
const numbers = [...new Set(places.map(([, value]) => value ?? "(none)"))];
if (numbers.length > 1) {
  const width = Math.max(...numbers.map((n) => n.length));
  problems.push(`the version number must be the SAME in all these places; now there are ${numbers.length} numbers (${numbers.join(", ")}):\n`
    + places.map(([path, value]) => `        ${(value ?? "(none)").padEnd(width)}  ${path}`).join("\n")
    + "\n      Raise them together: in the folders backend and frontend \"npm version <version> --no-git-tag-version\""
    + "\n      (package.json + package-lock.json), the three image lines in compose.cloud.yml, and the entry"
    + "\n      \"## [<version>] - <date>\" in CHANGELOG.md.");
}

// ---------------------------------------------------------------------------------------------------------------------------
// 2) Compared with the target branch (BASE): what gets deployed changed -> the version goes up; the version never goes down
// ---------------------------------------------------------------------------------------------------------------------------
// The files DEPLOYED to the VPS/Pi: the content of the backend and web images (see their Dockerfile and .dockerignore), the
// Compose file, and the files a container or the machine reads straight from the repo copy (broker configuration, Grafana, sh scripts).
// Documents (*.md), tests, Bruno, the load test, and the developer tools' settings aren't deployed, so they may change without a release.
function isDeployed(file) {
  if (file.endsWith(".md") || file.endsWith(".test.ts")) return false;
  if (file.startsWith("backend/")) {
    return /^backend\/(Dockerfile|\.dockerignore|package\.json|package-lock\.json)$/.test(file)
      || (/^backend\/(src|migrations)\//.test(file) && !file.startsWith("backend/src/integration/"));
  }
  if (file.startsWith("frontend/")) {
    return !/^frontend\/(\.oxlintrc\.json|check-schema\.js|\.env\.example|\.gitignore)$/.test(file);
  }
  return file === "compose.cloud.yml"
    || /^edge\/(compose\.edge\.yml|gateway\.conf|center\.conf|center-internet\.conf|acl-broker)$/.test(file)
    || /^grafana\/(provisioning|dashboards)\//.test(file) || file === "grafana/grafana-user.sql"
    || /^scripts\/[^/]+\.sh$/.test(file);
}

const base = process.env.BASE;
let baseSummary = "";
if (base && SEMVER_PATTERN.test(version)) { // a number of the wrong shape has already been reported above
  const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  let forkPoint;
  try {
    forkPoint = git("merge-base", base, "HEAD"); // the commit where this branch split off from BASE
  } catch (error) {
    // The git message is printed too: the reason isn't always "not fetched yet" (for example "dubious ownership" = a folder
    // owned by another user, which the safe.directory step fixes on the robot)
    const gitMessage = String(error.stderr ?? "").trim().split("\n")[0];
    console.error(`FAIL  ${base} can't be compared with HEAD: run "git fetch origin" first `
      + "(robot: actions/checkout with fetch-depth: 0)" + (gitMessage ? `\n      git message: ${gitMessage}` : ""));
    process.exit(1);
  }
  // What changed on this branch since it split off, including what isn't committed yet (on the laptop = on the robot). New files
  // that haven't been "git add"-ed yet aren't seen yet. --no-renames: a moved file counts twice (where it was and where it went).
  // -z: file names as they are, separated by the NUL character (without -z, git quotes names with non-ASCII letters such as "°C").
  const changed = git("diff", "--name-only", "-z", "--no-renames", forkPoint).split("\0").filter(Boolean);
  const deployed = changed.filter(isDeployed);
  const baseVersion = versionOf(git("show", `${base}:backend/package.json`));
  const goesUp = isGreater(version, baseVersion);
  const [major, minor, patch] = toNumbers(baseVersion);
  const nextPatch = `${major}.${minor}.${patch + 1}`; // 2.0.1 -> 2.0.2
  const examples = deployed.slice(0, 3).join(", ") + (deployed.length > 3 ? `, … (${deployed.length} files)` : "");

  if (!goesUp && version !== baseVersion) {
    problems.push(`version ${version} is LOWER than ${baseVersion} on ${base}: the version may only go up. Bringing back old content `
      + `(revert)? The content may be old, the number still goes UP (for example ${nextPatch}), `
      + "with the entry \"Fixed: restores …\" in CHANGELOG.md.");
  } else if (deployed.length > 0 && !goesUp) {
    problems.push(`what gets deployed to the VPS/Pi changed (${examples}) but the version is still ${version} (= ${base}). Without a new `
      + "version, the robot makes no release and this change never reaches the VPS/Pi. Raise the number by SemVer: PATCH "
      + `for a fix (${baseVersion} -> ${nextPatch}), MINOR for a new feature `
      + `(${baseVersion} -> ${major}.${minor + 1}.0), MAJOR when old users are forced to change too `
      + `(${baseVersion} -> ${major + 1}.0.0).`);
  }
  baseSummary = goesUp
    ? `; compared with ${base} (${baseVersion}): the version went up, ${deployed.length} deployed files changed`
    : `; compared with ${base}: no deployed file changed, the version stays ${version} (allowed)`;
}

// ---------------------------------------------------------------------------------------------------------------------------
if (problems.length > 0) {
  for (const message of problems) console.error(`FAIL  ${message}`);
  process.exit(1);
}
console.log(`PASS  one version number ${version} in ${places.length} places (package.json, package-lock.json, compose.cloud.yml, `
  + `CHANGELOG.md)${baseSummary}`);
