// warmup.js - a JavaScript warm-up before Module 25 (steps 4-5). Two small skills that the daily report in the backend uses
// later: one CSV row in English style, and text that becomes a file (bytes). Run it with: node warmup.js
import { readFileSync } from "node:fs";

// 4. One CSV row in English style (Module 23's csv.ts recipe): a comma separator, a decimal point, an empty cell for null,
//    and text containing , or " wrapped in double quotes. "Pure" functions: input -> text, no database, no network.
console.log("--- 4. One CSV row, English style");
function quote(text) {
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}
function cell(value) {
  if (value === null) return ""; // there is no data (for example Node 2 without vitals): an empty cell, NOT 0
  if (typeof value === "number") return String(value); // 28.5 stays "28.5"
  return quote(value);
}
function csvRow(values) {
  return values.map(cell).join(",");
}
console.log(csvRow(["device_id", "name", "avg_temp", "avg_rssi"]));
console.log(csvRow(["f00d00000001", "Node 1, living room", 28.5, -67]));
console.log(csvRow(["f00d000000b2", "Garden", 27, null])); // 27 stays "27"; null -> an empty cell at the end of the row

// 5. Text becomes a file. Telegram receives a FILE (a series of bytes), not text. Buffer.from(text, "utf8") = text -> bytes.
//    "\uFEFF" = BOM: ONE character you can't see, but THREE bytes (EF BB BF). A character like ° is more than one byte too.
console.log("--- 5. Text becomes a file");
const content = "\uFEFF" + csvRow(["device_id", "avg_temp"]) + "\r\n" + csvRow(["f00d00000001", 28.5]) + "\r\n";
const file = Buffer.from(content, "utf8");
console.log("characters:", content.length, "| bytes:", file.length, "| first 3 bytes:", file.subarray(0, 3));
console.log('"°" =', "°".length, "character,", Buffer.from("°", "utf8").length, "bytes");
// Trap: many functions take TEXT as a FILE NAME on the disk. readFileSync(content) looks for a file named
// "\uFEFFdevice_id,avg_temp..." -> error ENOENT (no such file). new InputFile("text…") in grammY (the Telegram bot)
// behaves the same; the cure: give it the bytes, new InputFile(Buffer.from(content, "utf8"), "report.csv").
try {
  readFileSync(content);
} catch (err) {
  console.log("text taken as a file name ->", err.code);
}
