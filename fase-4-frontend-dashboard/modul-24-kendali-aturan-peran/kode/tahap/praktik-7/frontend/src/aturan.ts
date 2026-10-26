// aturan.ts - aturan otomatis (Modul 19) untuk manusia: bentuk satu baris jawaban GET /rules, dan uraikanAturan() yang
// mengubah JSON aturan menjadi kalimat biasa. Kalimat ini dibuat di browser, jadi bisa sedikit berbeda dari kalimat log
// dan kejadian yang dibuat backend.
import { z } from "zod";
import { IsiAturan } from "./skema/aturan-dasar";
import type { Aturan, Besaran } from "./skema/aturan-dasar";
import type { PerintahSet } from "./skema/kontrak";

// Satu baris jawaban GET /rules: isi aturan ditambah nomor dan waktunya. Bentuknya sama dengan AturanLengkap di
// backend/src/routes/aturan.ts (berkas rute itu tidak bisa disalin, jadi lima barisnya ditulis ulang di sini).
export const AturanLengkap = z.object({
  id: z.number(),
  ...IsiAturan.shape,
  dibuat: z.string(),
  diubah: z.string(),
  berikutnya: z.string().nullable(), // aturan jadwal yang aktif: kapan berjalan lagi (UTC); selain itu null
});
export type AturanLengkap = z.infer<typeof AturanLengkap>;

// nama dan satuan setiap besaran, untuk kalimat
const BESARAN: Record<Besaran, { nama: string; satuan: string }> = {
  suhu: { nama: "suhu", satuan: " °C" },
  kelembapan: { nama: "kelembapan udara", satuan: " %" },
  cahaya: { nama: "cahaya", satuan: "" }, // 0 (gelap) sampai 4095 (terang), tanpa satuan
  tanah: { nama: "kelembapan tanah", satuan: " %" },
  level_air: { nama: "air tandon", satuan: " %" },
  tanah_rs485: { nama: "kelembapan tanah RS-485", satuan: " %" },
  suhu_tanah: { nama: "suhu tanah", satuan: " °C" },
};

// angka gaya Indonesia (28,5); kolom yang masih kosong di formulir (NaN) ditulis "…"
function angka(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString("id-ID") : "…";
}

// "0 6 * * *" -> "Setiap hari pukul 06.00 WIB"; pola lain ditulis apa adanya
function uraikanCron(cron: string): string {
  const harian = /^(\d{1,2}) (\d{1,2}) \* \* \*$/.exec(cron.trim());
  if (harian) return "Setiap hari pukul " + harian[2].padStart(2, "0") + "." + harian[1].padStart(2, "0") + " WIB";
  const tiapMenit = /^\*\/(\d{1,2}) \* \* \* \*$/.exec(cron.trim());
  if (tiapMenit) return "Setiap " + tiapMenit[1] + " menit";
  return `Menurut jadwal cron "${cron}" (jam WIB)`;
}

// satu perintah sebagai kata kerja: "siram 5 detik", "nyalakan lampu", "putar tirai ke 90°"
function uraikanPerintah(p: PerintahSet): string {
  if (p.target === "pompa") return "siram " + angka(p.nilai) + " detik";
  if (p.target === "tirai") return "putar tirai ke " + angka(p.nilai) + "°";
  return (p.nilai ? "nyalakan " : "matikan ") + p.target;
}

// uraikanAturan - JSON aturan -> kalimat. namaPerangkat mengubah device_id menjadi nama yang dikenal manusia.
export function uraikanAturan(a: Aturan, namaPerangkat: (deviceId: string) => string): string {
  const k = a.kondisi;
  const aksi = a.aksi;
  let kalimat: string;

  if (k.jenis === "jadwal") {
    // jadwal hanya boleh berpasangan dengan aksi perintah (skema), tetapi formulir bisa sedang setengah diisi
    const apa = aksi.jenis === "perintah" ? uraikanPerintah(aksi.perintah) : "nyalakan " + aksi.target;
    kalimat = uraikanCron(k.cron) + ", " + apa + " di " + namaPerangkat(aksi.device_id) + ".";
  } else {
    const b = BESARAN[k.besaran];
    const naik = k.jenis === "ambang"; // ambang = di atas; ambang-bawah = di bawah
    const batas = naik ? k.nyala_di_atas : k.nyala_di_bawah;
    const lepas = naik ? k.padam_di_bawah : k.padam_di_atas;
    const selama = k.selama_detik > 0 ? " selama " + angka(k.selama_detik) + " detik" : "";
    // nama perangkat aksi hanya ditulis kalau berbeda dari perangkat yang diukur
    const di = aksi.device_id === k.device_id ? "" : " di " + namaPerangkat(aksi.device_id);
    kalimat = "Kalau " + b.nama + " di " + namaPerangkat(k.device_id) + (naik ? " di atas " : " di bawah ") + angka(batas) + b.satuan + selama + ", ";
    const syaratLepas = b.nama + (naik ? " turun di bawah " : " naik di atas ") + angka(lepas) + b.satuan;
    if (aksi.jenis === "sakelar") {
      kalimat += "nyalakan " + aksi.target + di + ". " + aksi.target[0].toUpperCase() + aksi.target.slice(1) + " dimatikan lagi sesudah " + syaratLepas + ".";
    } else {
      kalimat += uraikanPerintah(aksi.perintah) + di + " (sekali). Aturan siap lagi sesudah " + syaratLepas + ".";
    }
  }
  if (aksi.kabari) kalimat += " Kirim kabar lewat Telegram.";
  return kalimat;
}
