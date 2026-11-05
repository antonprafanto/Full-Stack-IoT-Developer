// cek-versi.mjs - satpam versi Rumah Pintar Mini (Modul 29). Robot menjalankannya di setiap pull request dan setiap push ke
// main (job periksa di .github/workflows/ci.yml); kamu juga bisa menjalankannya di laptop, dari folder mana pun di repo:
//   node skrip/cek-versi.mjs                     -> nomor versi SAMA di semua tempat?
//   BASIS=origin/main node skrip/cek-versi.mjs   -> + dibanding cabang tujuan (BASIS, ambil dulu dengan git fetch): kalau yang
//                                                   DIPASANG di VPS/Pi berubah, versinya sudah naik (SemVer)?
//   PowerShell: $env:BASIS = "origin/main"; node skrip/cek-versi.mjs   (sesudahnya: Remove-Item Env:BASIS)
// Tanpa paket npm, cukup Node.js 24. Kode keluar 0 = LULUS, 1 = GAGAL; setiap baris GAGAL menyebut apa yang harus dibetulkan.
//
// Kenapa perlu satpam? Sejak Modul 29 ada SATU nomor versi untuk server: backend dan web selalu bernomor sama, sama dengan
// tag image di compose.cloud.yml, entri teratas CHANGELOG.md, dan tag Git v<versi> yang dibuat robot. VPS dan Pi hanya
// memasang RILIS bertanda itu, jadi perubahan yang lupa dinaikkan versinya tidak pernah sampai ke sana (diam-diam).
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Bekerja dari akar repo (folder di atas skrip/), dari folder mana pun perintahnya diketik
process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const salah = []; // daftar pesan GAGAL
const baca = (jalur) => readFileSync(jalur, "utf8");
const versiDari = (teksJson) => JSON.parse(teksJson).version;
// MAYOR.MINOR.PATCH, angka saja (tanpa -rc dan sejenisnya): nomor inilah yang menjadi tag v<versi>
const POLA_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const angka = (v) => v.split(".").map(Number);
const lebihBesar = (a, b) => { // a > b ? (angka per angka: 2.0.10 > 2.0.9)
  const [pa, pb] = [angka(a), angka(b)];
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] > pb[i];
  return false;
};

// ---------------------------------------------------------------------------------------------------------------------------
// 1) SATU nomor versi di semua tempat yang dibaca mesin
// ---------------------------------------------------------------------------------------------------------------------------
const versi = versiDari(baca("backend/package.json"));
const tempat = [["backend/package.json", versi]];
tempat.push(["frontend/package.json", versiDari(baca("frontend/package.json"))]);
for (const folder of ["backend", "frontend"]) {
  // package-lock.json menyimpan versi proyek di DUA tempat; npm version mengubah keduanya sekaligus
  const lock = JSON.parse(baca(`${folder}/package-lock.json`));
  tempat.push([`${folder}/package-lock.json ("version")`, lock.version]);
  tempat.push([`${folder}/package-lock.json (packages[""].version)`, lock.packages?.[""]?.version]);
}
// Hanya baris "image:" yang dibaca (komentar boleh menyebut nama image tanpa versi)
const compose = baca("compose.cloud.yml");
for (const nama of ["backend", "web"]) {
  const tag = [...compose.matchAll(new RegExp(`^\\s*image:.*/rumah-pintar-mini-${nama}:(\\S+)\\s*$`, "gm"))];
  if (tag.length === 0) salah.push(`compose.cloud.yml: tidak ada baris "image: …/rumah-pintar-mini-${nama}:<versi>"`);
  for (const t of tag) tempat.push([`compose.cloud.yml (image rumah-pintar-mini-${nama})`, t[1]]);
}
// Entri rilis teratas CHANGELOG.md: "## [2.0.1] - 2026-11-20" (bagian "## [Belum Dirilis]" di atasnya tidak dihitung)
const entri = baca("CHANGELOG.md").match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}\s*$/m);
if (entri) tempat.push(["CHANGELOG.md (entri rilis teratas)", entri[1]]);
else salah.push("CHANGELOG.md: belum ada entri rilis berbentuk \"## [x.y.z] - YYYY-MM-DD\"");

if (!POLA_SEMVER.test(versi)) {
  salah.push(`backend/package.json: versi "${versi}" bukan MAYOR.MINOR.PATCH angka saja (misalnya 2.0.1)`);
}
const nomor = [...new Set(tempat.map(([, nilai]) => nilai ?? "(tidak ada)"))];
if (nomor.length > 1) {
  const lebar = Math.max(...nomor.map((n) => n.length));
  salah.push(`nomor versi harus SAMA di semua tempat ini, sekarang ada ${nomor.length} nomor (${nomor.join(", ")}):\n`
    + tempat.map(([jalur, nilai]) => `         ${(nilai ?? "(tidak ada)").padEnd(lebar)}  ${jalur}`).join("\n")
    + "\n       Naikkan bersama-sama: di folder backend dan frontend \"npm version <versi> --no-git-tag-version\""
    + "\n       (package.json + package-lock.json), tiga baris image di compose.cloud.yml, dan entri"
    + "\n       \"## [<versi>] - <tanggal>\" di CHANGELOG.md.");
}

// ---------------------------------------------------------------------------------------------------------------------------
// 2) Dibanding cabang tujuan (BASIS): yang dipasang berubah -> versi naik; versi tidak pernah turun
// ---------------------------------------------------------------------------------------------------------------------------
// Berkas yang DIPASANG di VPS/Pi: isi image backend dan web (lihat Dockerfile dan .dockerignore masing-masing), berkas
// Compose, dan berkas yang dibaca kontainer atau mesin langsung dari salinan repo (konfigurasi broker, Grafana, skrip sh).
// Dokumen (*.md), tes, Bruno, uji beban, dan setelan alat pengembang tidak ikut dipasang, jadi boleh berubah tanpa rilis.
function ikutDipasang(berkas) {
  if (berkas.endsWith(".md") || berkas.endsWith(".test.ts")) return false;
  if (berkas.startsWith("backend/")) {
    return /^backend\/(Dockerfile|\.dockerignore|package\.json|package-lock\.json)$/.test(berkas)
      || (/^backend\/(src|migrasi)\//.test(berkas) && !berkas.startsWith("backend/src/integrasi/"));
  }
  if (berkas.startsWith("frontend/")) {
    return !/^frontend\/(\.oxlintrc\.json|cek-skema\.js|\.env\.example|\.gitignore)$/.test(berkas);
  }
  return berkas === "compose.cloud.yml"
    || /^edge\/(compose\.edge\.yml|gerbang\.conf|pusat\.conf|pusat-internet\.conf|acl-broker)$/.test(berkas)
    || /^grafana\/(provisioning|dashboards)\//.test(berkas) || berkas === "grafana/pengguna-grafana.sql"
    || /^skrip\/[^/]+\.sh$/.test(berkas);
}

const basis = process.env.BASIS;
let ringkasBasis = "";
if (basis && POLA_SEMVER.test(versi)) { // nomor yang bentuknya salah sudah dilaporkan di atas
  const git = (...argumen) => execFileSync("git", argumen, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  let titikPisah;
  try {
    titikPisah = git("merge-base", basis, "HEAD"); // commit tempat cabang ini berpisah dari BASIS
  } catch (galat) {
    // Pesan git ikut dicetak: sebabnya tidak selalu "belum di-fetch" (misalnya "dubious ownership" = folder milik
    // pengguna lain, di robot dibereskan langkah safe.directory)
    const pesanGit = String(galat.stderr ?? "").trim().split("\n")[0];
    console.error(`GAGAL  ${basis} tidak bisa dibandingkan dengan HEAD: jalankan "git fetch origin" dulu `
      + "(robot: actions/checkout dengan fetch-depth: 0)" + (pesanGit ? `\n       pesan git: ${pesanGit}` : ""));
    process.exit(1);
  }
  // Yang berubah di cabang ini sejak berpisah, termasuk yang belum di-commit (hasil di laptop = hasil robot). Berkas baru
  // yang belum di-"git add" belum terlihat. --no-renames: berkas yang dipindah dihitung dua kali (asal dan tujuan).
  // -z: nama berkas apa adanya, dipisah karakter NUL (tanpa -z, git mengutip nama ber-huruf non-ASCII seperti "°C").
  const berubah = git("diff", "--name-only", "-z", "--no-renames", titikPisah).split("\0").filter(Boolean);
  const dipasang = berubah.filter(ikutDipasang);
  const versiBasis = versiDari(git("show", `${basis}:backend/package.json`));
  const naik = lebihBesar(versi, versiBasis);
  const [mayor, minor, patch] = angka(versiBasis);
  const patchBerikut = `${mayor}.${minor}.${patch + 1}`; // 2.0.1 -> 2.0.2
  const contoh = dipasang.slice(0, 3).join(", ") + (dipasang.length > 3 ? `, … (${dipasang.length} berkas)` : "");

  if (!naik && versi !== versiBasis) {
    salah.push(`versi ${versi} lebih KECIL dari ${versiBasis} di ${basis}: versi hanya boleh naik. Mengembalikan isi lama `
      + `(revert)? Isinya boleh lama, nomornya tetap NAIK (misalnya ${patchBerikut}), `
      + "dengan entri \"Diperbaiki: mengembalikan …\" di CHANGELOG.md.");
  } else if (dipasang.length > 0 && !naik) {
    salah.push(`yang dipasang di VPS/Pi berubah (${contoh}) tetapi versinya masih ${versi} (= ${basis}). Tanpa versi baru, `
      + "robot tidak membuat rilis dan perubahan ini tidak pernah sampai ke VPS/Pi. Naikkan nomornya menurut SemVer: PATCH "
      + `untuk perbaikan (${versiBasis} -> ${patchBerikut}), MINOR untuk fitur baru `
      + `(${versiBasis} -> ${mayor}.${minor + 1}.0), MAYOR bila pemakai lama terpaksa ikut berubah `
      + `(${versiBasis} -> ${mayor + 1}.0.0).`);
  }
  ringkasBasis = naik
    ? `; dibanding ${basis} (${versiBasis}): versi naik, ${dipasang.length} berkas yang dipasang berubah`
    : `; dibanding ${basis}: tidak ada berkas yang dipasang berubah, versi tetap ${versi} (boleh)`;
}

// ---------------------------------------------------------------------------------------------------------------------------
if (salah.length > 0) {
  for (const pesan of salah) console.error(`GAGAL  ${pesan}`);
  process.exit(1);
}
console.log(`LULUS  satu nomor versi ${versi} di ${tempat.length} tempat (package.json, package-lock.json, compose.cloud.yml, `
  + `CHANGELOG.md)${ringkasBasis}`);
