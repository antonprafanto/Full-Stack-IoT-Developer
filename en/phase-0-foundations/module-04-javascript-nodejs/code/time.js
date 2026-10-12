// time.js — uses a library from npm (dayjs) to show ts in English
// Module 4 - Practice 7. Install the library first:  npm install dayjs@1.11.23
// Then run:  node time.js

import { readFile } from "node:fs/promises";
import dayjs from "dayjs"; // a library from npm: just say its name
import "dayjs/locale/en.js"; // day and month names in English

dayjs.locale("en");

const readings = JSON.parse(await readFile("data/readings.json", "utf8"));
const first = readings[0];

console.log("Original ts (UTC)  :", first.ts);
console.log("Your laptop's time :", dayjs(first.ts).format("dddd, MMMM D, YYYY, HH:mm:ss"));
console.log("Time elapsed       :", dayjs().diff(dayjs(first.ts), "minute"), "minutes");
