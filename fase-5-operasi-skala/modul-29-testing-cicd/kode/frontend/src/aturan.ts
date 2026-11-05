// aturan.ts - aturan otomatis (Modul 19) untuk manusia: bentuk satu baris jawaban GET /rules, dan uraikanAturan() yang
// mengubah JSON aturan menjadi kalimat biasa. Kalimat ini dibuat di browser, jadi bisa sedikit berbeda dari kalimat log
// dan kejadian yang dibuat backend. Praktik 8: ditambah isi bawaan formulir, pilihan perangkat, pesan galat ramah, dan
// pembaca galat 400.
import { z } from "zod";
import { IsiAturan } from "./skema/aturan-dasar";
import type { AksiPerintah, AksiSakelar, Aturan, Besaran } from "./skema/aturan-dasar";
import type { PerintahSet } from "./skema/kontrak";
import type { Perangkat } from "./types";

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

// nama dan satuan setiap besaran, untuk kalimat dan pilihan di formulir
export const BESARAN: Record<Besaran, { nama: string; satuan: string }> = {
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

// ---- Praktik 8: formulir aturan ----

type KondisiAturan = Aturan["kondisi"];

// isi bawaan setiap pilihan "Kapan?". Dipakai saat pilihan diganti: seluruh isi kondisi diganti sekaligus.
export function kondisiBawaan(jenis: KondisiAturan["jenis"], deviceId: string): KondisiAturan {
  if (jenis === "ambang") {
    return { jenis, device_id: deviceId, besaran: "suhu", nyala_di_atas: 30, padam_di_bawah: 28, selama_detik: 60 };
  }
  if (jenis === "ambang-bawah") {
    return { jenis, device_id: deviceId, besaran: "tanah", nyala_di_bawah: 30, padam_di_atas: 35, selama_detik: 10 };
  }
  return { jenis, cron: "0 6 * * *" };
}

// isi bawaan setiap pilihan "Lalu?": sakelar (nyala selama aturan menyala) atau perintah sekali (bawaannya siram 5 detik)
export function aksiBawaan(jenis: Aturan["aksi"]["jenis"], deviceId: string, kabari: boolean): AksiSakelar | AksiPerintah {
  if (jenis === "sakelar") return { jenis, device_id: deviceId, target: "lampu", kabari };
  return { jenis, device_id: deviceId, perintah: { target: "pompa", nilai: 5 }, kabari };
}

// isi bawaan setiap jenis perintah
export function perintahBawaan(target: PerintahSet["target"]): PerintahSet {
  if (target === "pompa") return { target, nilai: 5 };
  if (target === "tirai") return { target, nilai: 90 };
  return { target, nilai: true };
}

// isi formulir "Aturan baru": aturan kipas Modul 19 (suhu di atas 30 °C), di perangkat pertama yang bisa diberi perintah
export function aturanBawaan(perangkat: Perangkat[]): Aturan {
  const pertama = perangkat.find((p) => p.jenis !== "node2") ?? perangkat[0];
  const id = pertama?.device_id ?? "";
  return { nama: "", aktif: true, kondisi: kondisiBawaan("ambang", id), aksi: { jenis: "sakelar", device_id: id, target: "kipas", kabari: false } };
}

// aturan tersimpan -> isi formulir: hanya empat kolom yang boleh dikirim (id dan waktunya diatur backend)
export function isiFormulir(a: AturanLengkap): Aturan {
  return { nama: a.nama, aktif: a.aktif, kondisi: a.kondisi, aksi: a.aksi };
}

// device_id -> nama perangkat untuk pratinjau dan pilihan formulir; perangkat yang tidak ada di daftar tetap ditulis
// device_id-nya
export function namaPerangkat(perangkat: Perangkat[], deviceId: string): string {
  return perangkat.find((p) => p.device_id === deviceId)?.nama ?? deviceId;
}

// pilihan perangkat di formulir: semua perangkat untuk "yang diukur", selain Node 2 untuk "yang bertindak" (Node 2 tidak
// menerima perintah). Perangkat yang tersimpan di aturan tetapi sudah tidak ada di daftar tetap dimunculkan, supaya tidak hilang.
export function pilihanPerangkat(perangkat: Perangkat[], terpilih: string, bisaPerintah: boolean): string[] {
  const daftar = perangkat.filter((p) => !bisaPerintah || p.jenis !== "node2").map((p) => p.device_id);
  return daftar.includes(terpilih) || terpilih === "" ? daftar : [terpilih, ...daftar];
}

// Pesan galat yang lebih ramah untuk formulir. Hanya menggantikan pesan BAWAAN Zod (misalnya "Input tidak valid: diharapkan
// number, diterima NaN" untuk kolom angka yang kosong). Pesan yang ditulis di skema (histeresis, jadwal 5 bidang, device_id)
// tetap persis sama dengan yang dikirim backend. Dipasang lewat zodResolver(Aturan, { error: pesanRamah }), jadi skemanya
// sendiri tidak diubah dan tetap identik dengan backend.
export const pesanRamah: z.core.$ZodErrorMap = (isu) => {
  if (isu.code === "invalid_type" && isu.expected === "number") return "Isi dengan angka";
  if (isu.code === "invalid_type" && isu.expected === "int") return "Isi dengan bilangan bulat (tanpa koma)";
  if (isu.code === "too_small" && isu.origin === "string") return "Wajib diisi";
  if (isu.code === "too_big" && isu.origin === "string") return "Paling banyak " + isu.maximum + " huruf";
  if (isu.code === "too_small" && isu.origin === "number") return "Paling kecil " + isu.minimum;
  if (isu.code === "too_big" && isu.origin === "number") return "Paling besar " + isu.maximum;
  return undefined; // selain itu: pesan bawaan Zod (berbahasa Indonesia, dari kontrak.ts)
};

// Galat 400 dari backend (Fastify) berbentuk satu kalimat:
// "body/kondisi/cron ekspresi cron tidak sah, body/nama Terlalu kecil: …"
// -> [{ kolom: "kondisi.cron", pesan: "ekspresi cron tidak sah" }, { kolom: "nama", pesan: "Terlalu kecil: …" }]
// kolom memakai titik, sama dengan nama kolom react-hook-form; "" = tidak menunjuk satu kolom.
export function uraikanGalat400(pesan: string): { kolom: string; pesan: string }[] {
  return pesan.split(/, (?=body\/)/).map((bagian) => {
    const cocok = /^body\/(\S*) (.*)$/s.exec(bagian);
    if (cocok === null) return { kolom: "", pesan: bagian };
    return { kolom: cocok[1].replaceAll("/", "."), pesan: cocok[2] };
  });
}
