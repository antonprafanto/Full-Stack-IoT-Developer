// make-fake-bin.js - makes FAKE .bin files to practice firmware updates WITHOUT a board (Module 28, the path without a Kit).
// This file is NOT firmware: it only holds a marker text and random bytes, an ESP32 can't run it. DON'T flash it to a board
// and DON'T send it to a real board. What it's for: uploaded on the Fleet screen (Upload firmware), then "installed" by the simulated
// devices of tools/device-simulator.js, so that the whole update path (upload, SHA-256 fingerprint, locked download, trial period,
// rollback) can be tried without the Arduino IDE and without an ESP32.
//
// The file's content (it imitates on purpose what the server and the simulated devices CHECK, not the content of real firmware):
//   - the first byte 0xE9: every ESP32 program file (<sketch>.ino.bin) starts with this byte. The server refuses other files
//     (400 "not an ESP32 app image"), and HTTPUpdate on the board checks it too.
//   - then one line of text "NOT REAL FIRMWARE ..." (anyone who opens the file knows at once that it is fake)
//   - the --test option adds the marker TEST_WRONG_KEY to that line (within the first 512 bytes). A simulated device that installs
//     a file with this marker imitates firmware 1.7.2-test: its broker key is wrong, the 60-second trial period passes, then it goes
//     back by itself to the old version (rollback).
//   - the rest is "random" bytes that are always the same for the same version, size, and --test option (derived from SHAKE256),
//     so that its size is like Node 1 firmware (1,196,032 bytes by default, about 1.2 MB) and its fingerprint can be matched.
//
// How to use it (from a terminal, in the tools folder; Node.js only, without npm libraries):
//   node make-fake-bin.js 1.7.1 ../../fake-firmware                 -> a normal release 1.7.1
//   node make-fake-bin.js 1.7.2 ../../fake-firmware --test          -> a TEST release 1.7.2 (rollback practice)
//   node make-fake-bin.js 1.7.3 ../../fake-firmware --size=1300000  -> another size (bytes)
// The second argument = the destination folder (made if it doesn't exist yet; by default: the folder the command runs in). From the
// tools folder, ../../fake-firmware = the folder "fake-firmware" NEXT TO your repository folder, so outside Git.
// A file that already exists is never overwritten: delete the old file yourself if you really want to make it again.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const PROGRAM_SHELF = 1966080; // one program shelf (app0/app1) of the Minimal SPIFFS scheme (Module 10): the size limit on the server
const DEFAULT_SIZE = 1196032; // about 1.2 MB (61% of one shelf), like the fake files in the author's lab
const MIN_SIZE = 1024;
const MAX_SIZE = 4 * 1024 * 1024; // 4 MiB: may be bigger than one shelf, to see the server refuse it
const HEADER = 512; // the first 512 bytes: where the simulated devices look for the marker (device-simulator.js)
// The SAME release version rule as the backend (services/version.ts): x.y.z without leading zeros, at most 5 digits per part
const VERSION_PATTERN = /^(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})$/;

// A friendly error message, then stop with code 1 (the sign of a failure for the terminal)
function quit(message) {
  console.error(message);
  process.exit(1);
}

// ---------- the arguments from the terminal ----------
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const options = process.argv.slice(2).filter((a) => a.startsWith("--"));
const [version, folder = "."] = args;
const test = options.includes("--test");

if (version === undefined) {
  quit("Write the version, for example: node make-fake-bin.js 1.7.1 ../../fake-firmware\n" +
    "Add --test for a rollback practice file, or --size=1300000 for another size (bytes).");
}
for (const p of options) {
  if (p !== "--test" && !p.startsWith("--size=")) quit(`Unknown option ${p}. The options are: --test and --size=<bytes>.`);
}
if (args.length > 2) quit(`Too many arguments: ${args.join(" ")}. Just the version, then (if you like) the destination folder.`);
if (!VERSION_PATTERN.test(version)) {
  quit(`The version "${version}" can't be used. Write x.y.z without letters and without leading zeros, for example 1.7.1 ` +
    "(not v1.7.1, 1.7, or 1.07.1): the server refuses any other form.");
}
const sizeText = options.find((p) => p.startsWith("--size="))?.slice("--size=".length);
const size = sizeText === undefined ? DEFAULT_SIZE : Number(sizeText);
if (!/^\d+$/.test(sizeText ?? "0") || size < MIN_SIZE || size > MAX_SIZE) {
  quit(`The size "${sizeText}" can't be used. Write a whole number of bytes ${MIN_SIZE}-${MAX_SIZE}, ` +
    `for example --size=1300000 (without dots or commas). The default is ${DEFAULT_SIZE}.`);
}

// ---------- guarding Git: .bin files must never go into a commit ----------
// Look for the root of the Git repository (the folder with .git) from the destination folder upwards. null = outside Git.
function gitRoot(start) {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
const root = gitRoot(folder);
if (root !== null) {
  const ignoreFile = existsSync(join(root, ".gitignore")) ? readFileSync(join(root, ".gitignore"), "utf8") : "";
  const hasBinLine = ignoreFile.split(/\r?\n/).some((line) => ["*.bin", "**/*.bin", "/*.bin"].includes(line.trim()));
  if (!hasBinLine) {
    quit(`The destination folder is inside a Git repository (${root}), and the .gitignore there doesn't have the line *.bin yet.\n` +
      ".bin files must never go into a commit. Choose a folder outside the repository, for example:\n" +
      `  node make-fake-bin.js ${version} ../../fake-firmware${test ? " --test" : ""}\n` +
      "or first add the line *.bin to .gitignore (Module 28).");
  }
}

// ---------- the file's content ----------
// The marker line: ASCII characters only, so that anyone reads it the same way (the simulated devices read it as latin1)
const marker = `NOT REAL FIRMWARE - FAKE file from make-fake-bin.js (Mini Smart Home, Module 28) - node-1 ${version}` +
  `${test ? " - TEST_WRONG_KEY" : ""} - don't flash it to a board\n`;
const content = Buffer.alloc(size); // every byte starts at 0x00
content[0] = 0xe9; // the first byte of an ESP32 program file
content.write(marker, 1, "latin1"); // the first 512 bytes = 0xE9 + the marker + 0x00 for the rest
// After the first 512 bytes: "random" bytes from a fixed recipe (the result is the same on any computer). SHAKE256 (the SHA-3
// family, a relative of SHA-256) can make a "fingerprint" as long as we ask: here as long as the rest of the file.
const seed = `make-fake-bin|${version}|${test ? "test" : "normal"}|${size}`;
createHash("shake256", { outputLength: size - HEADER }).update(seed).digest().copy(content, HEADER);
const sha256 = createHash("sha256").update(content).digest("hex");

// ---------- write (NEVER overwrites) ----------
const name = `node-1-${version}${test ? "-TEST" : ""}-FAKE.bin`;
const path = resolve(folder, name);
try {
  mkdirSync(resolve(folder), { recursive: true });
} catch (error) {
  quit(`The folder ${resolve(folder)} can't be made: ${error.message}`);
}
try {
  writeFileSync(path, content, { flag: "wx" }); // "wx" = fails if the file already exists
} catch (error) {
  if (error.code === "EEXIST") {
    quit(`The file ${path} already exists: not overwritten.\n` +
      "The server never overwrites a version that was already uploaded either, so what you usually need is a NEW VERSION " +
      `(for example ${version.replace(/\d+$/, (n) => String(Number(n) + 1))}). If you really want to make it again, delete the old file first.`);
  }
  quit(`The file ${path} can't be written: ${error.message}`);
}

const percent = Math.round((size / PROGRAM_SHELF) * 100);
console.log(`FAKE file created: ${path}`);
console.log(`  version      ${version}${test ? " (TEST release: carries the TEST_WRONG_KEY marker)" : " (normal release)"}`);
console.log(`  size         ${size} bytes (${percent}% of one program shelf, ${PROGRAM_SHELF} bytes)`);
console.log('  first byte   0xE9, then the text "NOT REAL FIRMWARE ..."');
console.log(`  SHA-256      ${sha256}`);
if (size > PROGRAM_SHELF) {
  console.log("Its size is bigger than one program shelf: the server will REFUSE it (too big), and the Fleet screen already\n" +
    "refuses it before uploading. Good for seeing that refusal.");
} else {
  console.log(test
    ? `Upload it on the Fleet screen (Upload Node 1 firmware) with the version ${version} and TICK "A test release". A simulated device\n` +
      "that installs it can't get into the broker (its key is wrong on purpose), then after the 60-second trial period goes back by itself to the old version (rollback)."
    : `Upload it on the Fleet screen (Upload Node 1 firmware) with the version ${version}. The SHA-256 the server shows must be the same as above.`);
}
if (root !== null) {
  console.log(`Note: this file is inside a Git repository (${root}). .gitignore ignores *.bin, so it doesn't go into a commit,\n` +
    `but it's tidier outside the repository, for example: node make-fake-bin.js ${version} ../../fake-firmware${test ? " --test" : ""}`);
}
console.log("NOT real firmware: don't flash it to a board and don't send it to a real board. Only for simulated devices (the simulator).");
