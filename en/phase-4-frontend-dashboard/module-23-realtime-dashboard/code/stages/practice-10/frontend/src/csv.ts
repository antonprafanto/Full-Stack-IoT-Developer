// csv.ts - builds a CSV file in the browser. The backend has no CSV route: the data is already on the screen, so the browser
// itself puts the text together and saves it as a file. The format is set up for Excel with English (US/UK) regional
// settings: a comma separator (,), a decimal point (28.5), a BOM at the start of the file, and CRLF at the end of every line.

// quote - a value containing , " or a line break is wrapped in double quotes, and the quotes inside are doubled.
// Example: Node 1, living room  ->  "Node 1, living room"
export function quote(text: string): string {
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

// one cell: a number keeps its decimal point (28.5), null (failed sensor or missing column) becomes an empty cell
function cell(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  return quote(value);
}

// toCsv - rows (an array of arrays) become one CSV text
export function toCsv(rows: (string | number | null)[][]): string {
  // "\uFEFF" = BOM: an unseen mark saying the content is UTF-8, so special letters in device names (for example ° or é) stay whole in Excel
  return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

// downloadCsv - ask the browser to save text as a file, without a server
export function downloadCsv(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); // a temporary "blob:http://…" address that points at data in the browser's memory
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.append(a);
  a.click(); // the same as tapping a download link
  a.remove();
  // release that temporary address once the download has started, so its memory can be freed
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// "sv-SE" (Swedish) is used because it happens to format as year-month-day hour:minute:second, easy to sort
const CSV_TIME = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "medium" });

// csvTime - "2026-10-24 16:15:42" in WIB
export function csvTime(t: string | number): string {
  return CSV_TIME.format(new Date(t));
}
