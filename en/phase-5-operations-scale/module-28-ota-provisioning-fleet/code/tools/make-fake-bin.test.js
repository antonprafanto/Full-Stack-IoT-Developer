// make-fake-bin.test.js - a small test of make-fake-bin.js (Module 28) with Node.js's own test runner (node:test), without npm libraries.
// The program really runs in a temporary folder, exactly as if typed in a terminal, then the file it made is checked.
// Run it from the tools folder:  node --test make-fake-bin.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./make-fake-bin.js", import.meta.url));

// a new temporary folder for every test (deleted afterwards)
function newFolder(t) {
  const dir = mkdtempSync(join(tmpdir(), "fake-bin-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
// run "node make-fake-bin.js <arguments...>" in that folder
function run(dir, ...args) {
  const h = spawnSync(process.execPath, [TOOL, ...args], { cwd: dir, encoding: "utf8" });
  return { code: h.status, output: h.stdout + h.stderr };
}
const fingerprint = (content) => createHash("sha256").update(content).digest("hex");

test("normal release: first byte 0xE9, the marker at the start, the default size, the printed SHA-256 = the file's fingerprint", (t) => {
  const dir = newFolder(t);
  const h = run(dir, "1.7.1", "out");
  assert.equal(h.code, 0, h.output);
  const content = readFileSync(join(dir, "out", "node-1-1.7.1-FAKE.bin"));
  assert.equal(content.length, 1196032);
  assert.equal(content[0], 0xe9);
  assert.ok(content.subarray(1, 20).toString("latin1").startsWith("NOT REAL FIRMWARE"));
  assert.match(h.output, new RegExp(`SHA-256 +${fingerprint(content)}`));
  assert.match(h.output, /don't flash it to a board/);
});

test("--test: the TEST_WRONG_KEY marker within the first 512 bytes (read like device-simulator.js); a normal release has no marker", (t) => {
  const dir = newFolder(t);
  assert.equal(run(dir, "1.7.2", ".", "--test").code, 0);
  assert.equal(run(dir, "1.7.1").code, 0);
  const head = (name) => readFileSync(join(dir, name)).subarray(0, 512).toString("latin1");
  assert.ok(head("node-1-1.7.2-TEST-FAKE.bin").includes("TEST_WRONG_KEY"));
  assert.ok(!head("node-1-1.7.1-FAKE.bin").includes("TEST_WRONG_KEY"));
});

test("the content is always the same for the same version, size, and options; another version = another fingerprint", (t) => {
  const dir = newFolder(t);
  for (const sub of ["a", "b"]) assert.equal(run(dir, "1.7.3", sub).code, 0);
  assert.equal(run(dir, "1.7.4", "a").code, 0);
  const content = (sub, v) => readFileSync(join(dir, sub, `node-1-${v}-FAKE.bin`));
  assert.equal(fingerprint(content("a", "1.7.3")), fingerprint(content("b", "1.7.3")));
  assert.notEqual(fingerprint(content("a", "1.7.3")), fingerprint(content("a", "1.7.4")));
});

test("--size: a chosen size; bigger than one program shelf is still made, with a warning that the server will refuse it", (t) => {
  const dir = newFolder(t);
  assert.equal(run(dir, "1.7.5", "--size=1300000").code, 0);
  assert.equal(readFileSync(join(dir, "node-1-1.7.5-FAKE.bin")).length, 1300000);
  const big = run(dir, "1.7.6", "--size=1966081");
  assert.equal(big.code, 0);
  assert.match(big.output, /server will REFUSE it/);
});

test("a file that already exists is never overwritten", (t) => {
  const dir = newFolder(t);
  assert.equal(run(dir, "1.7.1").code, 0);
  const path = join(dir, "node-1-1.7.1-FAKE.bin");
  writeFileSync(path, "old content"); // pretend another file has the same name
  const h = run(dir, "1.7.1");
  assert.equal(h.code, 1);
  assert.match(h.output, /already exists: not overwritten/);
  assert.match(h.output, /1\.7\.2/); // the advice for a new version
  assert.equal(readFileSync(path, "utf8"), "old content");
});

test("a wrong version, size, or option is refused with a message, without making a file", (t) => {
  const dir = newFolder(t);
  for (const args of [[], ["v1.7.1"], ["1.7"], ["1.07.1"], ["1.7.1", "--size=100"], ["1.7.1", "--size=1,2MB"],
    ["1.7.1", "--size=5000000"], ["1.7.1", "--force"], ["1.7.1", "a", "b"]]) {
    const h = run(dir, ...args);
    assert.equal(h.code, 1, `arguments ${args.join(" ")}`);
    assert.ok(h.output.length > 0);
  }
  assert.deepEqual(readdirSync(dir), []);
});

test("inside a Git repository: refused if .gitignore doesn't have *.bin yet; made (with advice for a folder outside) if it does", (t) => {
  const repo = newFolder(t);
  mkdirSync(join(repo, ".git"));
  mkdirSync(join(repo, "tools"));
  writeFileSync(join(repo, ".gitignore"), "node_modules/\n.env\n");
  const refused = run(join(repo, "tools"), "1.7.1");
  assert.equal(refused.code, 1);
  assert.match(refused.output, /doesn't have the line \*\.bin yet/);
  assert.deepEqual(readdirSync(join(repo, "tools")), []);
  writeFileSync(join(repo, ".gitignore"), "node_modules/\n.env\n*.bin\n");
  const allowed = run(join(repo, "tools"), "1.7.1");
  assert.equal(allowed.code, 0, allowed.output);
  assert.match(allowed.output, /\.\.\/\.\.\/fake-firmware/);
});
