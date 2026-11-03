// buat-bin-tiruan.test.js - uji kecil buat-bin-tiruan.js (Modul 28) dengan penguji bawaan Node.js (node:test), tanpa library npm.
// Programnya dijalankan sungguhan di folder sementara, persis seperti diketik di terminal, lalu berkas hasilnya diperiksa.
// Jalankan dari folder alat:  node --test buat-bin-tiruan.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ALAT = fileURLToPath(new URL("./buat-bin-tiruan.js", import.meta.url));

// folder sementara baru untuk setiap uji (dihapus sesudahnya)
function folderBaru(t) {
  const dir = mkdtempSync(join(tmpdir(), "bin-tiruan-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
// jalankan "node buat-bin-tiruan.js <isian...>" di folder itu
function jalankan(dir, ...isian) {
  const h = spawnSync(process.execPath, [ALAT, ...isian], { cwd: dir, encoding: "utf8" });
  return { kode: h.status, keluaran: h.stdout + h.stderr };
}
const sidik = (isi) => createHash("sha256").update(isi).digest("hex");

test("rilis biasa: bait pertama 0xE9, penanda di awal, ukuran bawaan, SHA-256 yang dicetak = sidik berkasnya", (t) => {
  const dir = folderBaru(t);
  const h = jalankan(dir, "1.7.1", "keluar");
  assert.equal(h.kode, 0, h.keluaran);
  const isi = readFileSync(join(dir, "keluar", "node-1-1.7.1-TIRUAN.bin"));
  assert.equal(isi.length, 1196032);
  assert.equal(isi[0], 0xe9);
  assert.ok(isi.subarray(1, 20).toString("latin1").startsWith("BUKAN FIRMWARE ASLI"));
  assert.match(h.keluaran, new RegExp(`SHA-256 +${sidik(isi)}`));
  assert.match(h.keluaran, /jangan di-flash ke papan/);
});

test("--uji: penanda UJI_KUNCI_SALAH dalam 512 bait pertama (dibaca seperti simulator-perangkat.js); rilis biasa tanpa penanda", (t) => {
  const dir = folderBaru(t);
  assert.equal(jalankan(dir, "1.7.2", ".", "--uji").kode, 0);
  assert.equal(jalankan(dir, "1.7.1").kode, 0);
  const awal = (nama) => readFileSync(join(dir, nama)).subarray(0, 512).toString("latin1");
  assert.ok(awal("node-1-1.7.2-UJI-TIRUAN.bin").includes("UJI_KUNCI_SALAH"));
  assert.ok(!awal("node-1-1.7.1-TIRUAN.bin").includes("UJI_KUNCI_SALAH"));
});

test("isi selalu sama untuk versi, ukuran, dan pilihan yang sama; versi lain = sidik jari lain", (t) => {
  const dir = folderBaru(t);
  for (const sub of ["a", "b"]) assert.equal(jalankan(dir, "1.7.3", sub).kode, 0);
  assert.equal(jalankan(dir, "1.7.4", "a").kode, 0);
  const isi = (sub, v) => readFileSync(join(dir, sub, `node-1-${v}-TIRUAN.bin`));
  assert.equal(sidik(isi("a", "1.7.3")), sidik(isi("b", "1.7.3")));
  assert.notEqual(sidik(isi("a", "1.7.3")), sidik(isi("a", "1.7.4")));
});

test("--ukuran: ukuran pilihan; lebih besar dari satu rak program tetap dibuat, dengan peringatan server akan menolaknya", (t) => {
  const dir = folderBaru(t);
  assert.equal(jalankan(dir, "1.7.5", "--ukuran=1300000").kode, 0);
  assert.equal(readFileSync(join(dir, "node-1-1.7.5-TIRUAN.bin")).length, 1300000);
  const besar = jalankan(dir, "1.7.6", "--ukuran=1966081");
  assert.equal(besar.kode, 0);
  assert.match(besar.keluaran, /server akan MENOLAKNYA/);
});

test("berkas yang sudah ada tidak pernah ditimpa", (t) => {
  const dir = folderBaru(t);
  assert.equal(jalankan(dir, "1.7.1").kode, 0);
  const jalur = join(dir, "node-1-1.7.1-TIRUAN.bin");
  writeFileSync(jalur, "isi lama"); // pura-pura berkas lain bernama sama
  const h = jalankan(dir, "1.7.1");
  assert.equal(h.kode, 1);
  assert.match(h.keluaran, /sudah ada: tidak ditimpa/);
  assert.match(h.keluaran, /1\.7\.2/); // saran versi baru
  assert.equal(readFileSync(jalur, "utf8"), "isi lama");
});

test("versi, ukuran, atau pilihan yang salah ditolak dengan pesan, tanpa membuat berkas", (t) => {
  const dir = folderBaru(t);
  for (const isian of [[], ["v1.7.1"], ["1.7"], ["1.07.1"], ["1.7.1", "--ukuran=100"], ["1.7.1", "--ukuran=1,2MB"],
    ["1.7.1", "--ukuran=5000000"], ["1.7.1", "--paksa"], ["1.7.1", "a", "b"]]) {
    const h = jalankan(dir, ...isian);
    assert.equal(h.kode, 1, `isian ${isian.join(" ")}`);
    assert.ok(h.keluaran.length > 0);
  }
  assert.deepEqual(readdirSync(dir), []);
});

test("di dalam repositori Git: ditolak bila .gitignore belum memuat *.bin; dibuat (dengan saran folder di luar) bila sudah", (t) => {
  const repo = folderBaru(t);
  mkdirSync(join(repo, ".git"));
  mkdirSync(join(repo, "alat"));
  writeFileSync(join(repo, ".gitignore"), "node_modules/\n.env\n");
  const ditolak = jalankan(join(repo, "alat"), "1.7.1");
  assert.equal(ditolak.kode, 1);
  assert.match(ditolak.keluaran, /belum memuat baris \*\.bin/);
  assert.deepEqual(readdirSync(join(repo, "alat")), []);
  writeFileSync(join(repo, ".gitignore"), "node_modules/\n.env\n*.bin\n");
  const boleh = jalankan(join(repo, "alat"), "1.7.1");
  assert.equal(boleh.kode, 0, boleh.keluaran);
  assert.match(boleh.keluaran, /\.\.\/\.\.\/firmware-tiruan/);
});
