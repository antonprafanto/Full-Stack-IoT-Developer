// waktu.js — memakai library dari npm (dayjs) untuk menampilkan ts dalam bahasa Indonesia
// Modul 4 - Praktik 7. Pasang library-nya dulu:  npm install dayjs@1.11.23
// Lalu jalankan:  node waktu.js

import { readFile } from "node:fs/promises";
import dayjs from "dayjs"; // library dari npm: cukup sebut namanya
import "dayjs/locale/id.js"; // nama hari dan bulan dalam bahasa Indonesia

dayjs.locale("id");

const bacaan = JSON.parse(await readFile("data/bacaan.json", "utf8"));
const pertama = bacaan[0];

console.log("ts asli (UTC)  :", pertama.ts);
console.log("Waktu laptopmu :", dayjs(pertama.ts).format("dddd, D MMMM YYYY, HH.mm.ss"));
console.log("Sudah berlalu  :", dayjs().diff(dayjs(pertama.ts), "minute"), "menit");
