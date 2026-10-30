// csv.ts - builds CSV text on the server (Module 25, for the daily report). Its recipe is the SAME as Module 23's frontend/src/csv.ts,
// so that the file from the dashboard and the one from the Telegram report open just as neatly in Excel or LibreOffice with English
// (US/UK) regional settings: a comma separator (,), a decimal point (28.5), a BOM at the start of the file, and CRLF at the end of every line.
// Every function here is "pure": it only turns its input into text, with no database and no network, so it is easy to test.

export type Cell = string | number | null; // the content of one cell: text, a number, or empty

// quote - a value containing , " or a line break is wrapped in double quotes, and the quotes inside are doubled.
// Example: Node 1, living room  ->  "Node 1, living room"
export function quote(text: string): string {
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

// one cell: a number keeps its decimal point (28.5), null (failed sensor, missing column, or no data) becomes an empty cell
function cell(value: Cell): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  return quote(value);
}

// toCsv - rows (an array of arrays) become one CSV text
export function toCsv(rows: Cell[][]): string {
  // "\uFEFF" = BOM: an unseen mark saying the content is UTF-8, so special letters in device names (for example ° or é) stay whole
  // in Excel. In the file, this BOM becomes 3 bytes: EF BB BF.
  return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
