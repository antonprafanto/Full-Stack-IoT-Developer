// check-schema.js - checks that the schema copies in src/schemas/ are EXACTLY THE SAME as the originals in the backend (Module 24).
// Run it from the frontend folder with "npm run check-schema". Exit code 0 = all the same, 1 = something differs.
// CRLF (Windows) and LF line endings count as the same: Git on Windows can change them quietly, while the content stays the same.
import { readFileSync } from "node:fs";

const ORIGINAL = "../backend/src/schemas/"; // the backend folder next to the frontend folder
const COPY = "src/schemas/";
const FILES = ["contract.ts", "rule-basics.ts"];
const BOM = String.fromCharCode(0xfeff); // the BOM mark: unseen, some editors put it at the start of a file

// a file's content as a list of lines, with CRLF line endings turned into LF
function readLines(path) {
  try {
    return readFileSync(path, "utf8").replaceAll("\r\n", "\n").split("\n");
  } catch {
    console.error("Can't read " + path + ". Run this from the frontend folder, with the backend folder next to it.");
    process.exit(1);
  }
}

let allSame = true;
for (const name of FILES) {
  const original = readLines(ORIGINAL + name);
  const copy = readLines(COPY + name);
  // find the first line that differs
  let firstDiff = -1;
  for (let i = 0; i < Math.max(original.length, copy.length); i++) {
    if (original[i] !== copy[i]) {
      firstDiff = i;
      break;
    }
  }
  if (firstDiff === -1) {
    console.log("SAME  " + COPY + name);
    continue;
  }
  allSame = false;
  console.log("DIFF  " + COPY + name + ", from line " + (firstDiff + 1) + ":");
  console.log("  backend : " + (original[firstDiff] ?? "(end of file)"));
  console.log("  frontend: " + (copy[firstDiff] ?? "(end of file)"));
  // two differences the eye can't see: a BOM mark (U+FEFF) at the start of a file, and the line break at the end of a file
  if (firstDiff === 0 && (original[0].startsWith(BOM) || copy[0].startsWith(BOM))) {
    console.log("  (an unseen difference: one file starts with a BOM; save it again as UTF-8 without BOM)");
  } else if (original[firstDiff] === undefined || copy[firstDiff] === undefined) {
    console.log("  (a difference at the end of the file: its last line break is missing or extra)");
  }
}

if (!allSame) console.log("Copy the file again from " + ORIGINAL + " (don't change it in the frontend), then run this again.");
process.exit(allSame ? 0 : 1);
