// csv.ts - menyusun teks CSV di server (Modul 25, untuk laporan harian). Resepnya SAMA dengan frontend/src/csv.ts Modul 23,
// supaya berkas dari dashboard dan dari laporan Telegram terbuka sama rapi di Excel atau LibreOffice dengan setelan regional
// Indonesia: pemisah titik koma (;), desimal koma (28,5), BOM di awal berkas, dan setiap baris diakhiri CRLF.
// Semua fungsi di sini "murni": hanya mengolah masukan menjadi teks, tanpa database dan tanpa jaringan, jadi mudah diuji.

export type Sel = string | number | null; // isi satu sel: teks, angka, atau kosong

// kutip - nilai yang memuat ; " atau baris baru dibungkus tanda petik, dan petik di dalamnya digandakan.
// Contoh: Node 1; ruang tamu  ->  "Node 1; ruang tamu"
export function kutip(teks: string): string {
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}

// satu sel: angka memakai koma desimal, null (sensor gagal, kolom tidak ada, atau tidak ada data) menjadi sel kosong
function sel(nilai: Sel): string {
  if (nilai === null) return "";
  if (typeof nilai === "number") return String(nilai).replace(".", ",");
  return kutip(nilai);
}

// keCsv - baris-baris (larik berisi larik) menjadi satu teks CSV
export function keCsv(baris: Sel[][]): string {
  // "\uFEFF" = BOM: tanda tak terlihat bahwa isinya UTF-8, supaya huruf istimewa di nama perangkat (misalnya ° atau é) utuh di
  // Excel. Di berkas, BOM ini menjadi 3 byte: EF BB BF.
  return "\uFEFF" + baris.map((b) => b.map(sel).join(";")).join("\r\n") + "\r\n";
}
