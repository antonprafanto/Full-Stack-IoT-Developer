// csv.ts - membuat berkas CSV di browser. Backend tidak punya rute CSV: datanya sudah ada di layar, jadi browser
// sendiri yang menyusun teksnya lalu menyimpannya sebagai berkas. Formatnya disiapkan untuk Excel dengan setelan regional
// Indonesia: pemisah titik koma (;), desimal koma (28,5), BOM di awal berkas, dan setiap baris diakhiri CRLF.

// kutip - nilai yang memuat ; " atau baris baru dibungkus tanda petik, dan petik di dalamnya digandakan.
// Contoh: Node 1; ruang tamu  ->  "Node 1; ruang tamu"
export function kutip(teks: string): string {
  return /[";\r\n]/.test(teks) ? '"' + teks.replaceAll('"', '""') + '"' : teks;
}

// satu sel: angka memakai koma desimal, null (sensor gagal atau kolom tidak ada) menjadi sel kosong
function sel(nilai: string | number | null): string {
  if (nilai === null) return "";
  if (typeof nilai === "number") return String(nilai).replace(".", ",");
  return kutip(nilai);
}

// keCsv - baris-baris (larik berisi larik) menjadi satu teks CSV
export function keCsv(baris: (string | number | null)[][]): string {
  // "\uFEFF" = BOM: tanda tak terlihat bahwa isinya UTF-8, supaya huruf istimewa di nama perangkat (misalnya ° atau é) utuh di Excel
  return "\uFEFF" + baris.map((b) => b.map(sel).join(";")).join("\r\n") + "\r\n";
}

// unduhCsv - minta browser menyimpan teks sebagai berkas, tanpa server
export function unduhCsv(namaBerkas: string, isi: string): void {
  const blob = new Blob([isi], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); // alamat sementara "blob:http://…" yang menunjuk isi di memori browser
  const a = document.createElement("a");
  a.href = url;
  a.download = namaBerkas;
  document.body.append(a);
  a.click(); // sama seperti mengetuk tautan unduhan
  a.remove();
  // lepaskan alamat sementara itu sesudah unduhan dimulai, supaya memorinya bisa dibebaskan
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// "sv-SE" (bahasa Swedia) dipakai karena formatnya kebetulan tahun-bulan-tanggal jam:menit:detik, mudah diurutkan
const WAKTU_CSV = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "medium" });

// waktuCsv - "2026-10-24 16:15:42" dalam WIB
export function waktuCsv(t: string | number): string {
  return WAKTU_CSV.format(new Date(t));
}
