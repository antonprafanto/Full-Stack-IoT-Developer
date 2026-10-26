// otomasi.ts - menjalankan aturan otomatis dari tabel rules (Modul 19): memuat aturan ke memori, menilai setiap bacaan
// dengan otak murni (aturan/mesin.ts), bertindak lewat perintahkan(), mengirim ambang kipas ke perangkat (config),
// memasang aturan jadwal (jadwal.ts), dan mencatat setiap tindakan di buku kejadian.
// Modul 24: aturan ambang kini dua arah (ambang = naik di atas, ambang-bawah = turun di bawah), aksinya boleh sakelar atau
// perintah yang dikirim sekali (misalnya pompa 5 detik), dan aturan bisa dihapus (hapusAturan).
import { Aturan } from "../schemas/aturan.ts";
import type { AksiPerintah, AksiSakelar, AturanTersimpan, KondisiAmbang, KondisiAmbangBawah } from "../schemas/aturan.ts";
import type { PerintahSet, TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { INGATAN_AWAL, nilaiAmbang, nilaiAmbangBawah } from "../aturan/mesin.ts";
import type { Ingatan } from "../aturan/mesin.ts";
import { ambilSemuaAturan, hapusAturanDb, tambahAturan, ubahAturan, waktuKontrak } from "../db/arsip.ts";
import type { BarisAturan } from "../db/arsip.ts";
import { cariPerangkat, tungguAck } from "./gudang.ts";
import { buatIdPerintah, kirimConfig, ringkas } from "./mqtt.ts";
import { lupakanKeinginanAturan, perintahkan } from "./perintah.ts";
import type { HasilPerintah } from "./perintah.ts";
import { pasangJadwal } from "./jadwal.ts";
import { catatKejadian } from "./kejadian.ts";
import { kabariKalauPerlu } from "./telegram.ts";
import { log } from "./log.ts";

type KondisiBacaan = KondisiAmbang | KondisiAmbangBawah; // Modul 24: kondisi yang dinilai dari bacaan sensor, dua arah
type AksiAturan = AksiSakelar | AksiPerintah; // Modul 24: aturan ambang boleh memakai keduanya

const BACAAN_BASI_MS = 60_000; // bacaan yang ts-nya lebih tua daripada 60 detik (data susulan) tidak dinilai
let daftar: AturanTersimpan[] = []; // semua aturan yang sah, urut nomor
const ingatan = new Map<number, Ingatan>(); // nomor aturan -> ingatan nilaiAmbang

// Muat ulang semua aturan dari database. Baris yang tidak sah (misalnya diubah dengan tangan lewat DBeaver) dilewati.
export async function muatAturan(): Promise<void> {
  const sah: AturanTersimpan[] = [];
  for (const baris of await ambilSemuaAturan()) {
    const hasil = Aturan.safeParse({ nama: baris.nama, aktif: baris.aktif, kondisi: baris.kondisi, aksi: baris.aksi });
    if (!hasil.success) {
      log.warn(`aturan ${baris.id} dilewati: ${ringkas(hasil.error)}`);
      continue;
    }
    sah.push({ ...hasil.data, id: baris.id, dibuat: waktuKontrak(baris.dibuat), diubah: waktuKontrak(baris.diubah) });
  }
  daftar = sah;
  log.info(`aturan dimuat: ${sah.filter((a) => a.aktif).length} aktif dari ${sah.length}`);
  pasangJadwal(sah); // aturan jadwal: tugas node-cron dibongkar lalu dipasang lagi
}

export function semuaAturan(): AturanTersimpan[] {
  return daftar;
}

export function cariAturan(id: number): AturanTersimpan | undefined {
  return daftar.find((a) => a.id === id);
}

// POST /rules: simpan aturan baru, lalu langsung berlaku
export async function buatAturan(isi: Aturan): Promise<AturanTersimpan> {
  return setelahBerubah(await tambahAturan(isi), "dibuat");
}

// PUT /rules/:id: hasilnya undefined kalau aturan bernomor itu tidak ada
export async function gantiAturan(id: number, isi: Aturan): Promise<AturanTersimpan | undefined> {
  const baris = await ubahAturan(id, isi);
  return baris === undefined ? undefined : setelahBerubah(baris, "diubah");
}

// Modul 24, DELETE /rules/:id: hasilnya undefined kalau aturan bernomor itu tidak ada. Aturan langsung berhenti berlaku.
// Riwayat perintah dan kejadiannya tetap ada di database (aturan_id-nya menjadi NULL, migrasi 007). Kejadian "dihapus" ini
// juga ditulis dengan aturan_id null: barisnya sudah tidak ada, jadi database menolak nomor itu. Nomornya ikut di data.
export async function hapusAturan(id: number): Promise<{ id: number; nama: string } | undefined> {
  const baris = await hapusAturanDb(id);
  if (baris === undefined) return undefined;
  daftar = daftar.filter((a) => a.id !== baris.id); // berhenti dinilai SEKARANG, sebelum database dibaca lagi
  ingatan.delete(baris.id);
  lupakanKeinginanAturan(baris.id); // perangkat yang menyala ulang tidak menerima lagi perintah aturan ini
  await muatAturan(); // daftar di memori dan tugas jadwal ikut diperbarui
  const pesan = `Aturan ${baris.id} (${baris.nama}) dihapus lewat API`;
  log.info(pesan);
  catatKejadian({ device_id: null, jenis: "aturan-diubah", sumber: "api", aturan_id: null, pesan,
    data: { id: baris.id, nama: baris.nama, dihapus: true } });
  kirimSemuaConfig();
  return baris;
}

async function setelahBerubah(baris: BarisAturan, kata: string): Promise<AturanTersimpan> {
  ingatan.delete(baris.id); // ambang baru = hitungan "selama" baru
  await muatAturan();
  const a = cariAturan(baris.id);
  if (a === undefined) throw new Error(`aturan ${baris.id} tidak sah setelah disimpan`);
  if (!a.aktif) lupakanKeinginanAturan(a.id); // Modul 24: aturan nonaktif tidak bertindak lagi, juga lewat rekonsiliasi
  const pesan = `Aturan ${a.id} (${a.nama}) ${kata} lewat API: ${uraikan(a)}`;
  log.info(pesan);
  catatKejadian({ device_id: null, jenis: "aturan-diubah", sumber: "api", aturan_id: a.id, pesan,
    data: { nama: a.nama, aktif: a.aktif, kondisi: a.kondisi, aksi: a.aksi } });
  kirimSemuaConfig();
  return a;
}

// Modul 24: kata-kata untuk dua arah ambang. nyala/padam = syaratnya, misalnya "di atas 30"/"di bawah 28" (naik) atau
// "di bawah 30"/"di atas 35" (turun); pulih = ke mana bacaan bergerak saat aturan padam lagi.
function arah(k: KondisiBacaan): { nyala: string; padam: string; pulih: string } {
  return k.jenis === "ambang"
    ? { nyala: `di atas ${k.nyala_di_atas}`, padam: `di bawah ${k.padam_di_bawah}`, pulih: "turun" }
    : { nyala: `di bawah ${k.nyala_di_bawah}`, padam: `di atas ${k.padam_di_atas}`, pulih: "naik" };
}

// Modul 24: perintah yang dikirim aturan saat MENYALA. Aksi sakelar menyalakan targetnya; aksi perintah mengirim
// perintahnya apa adanya (misalnya pompa 5 detik).
function perintahSaatNyala(aksi: AksiAturan): PerintahSet {
  return aksi.jenis === "sakelar" ? { target: aksi.target, nilai: true } : aksi.perintah;
}

// ...dan saat PADAM: aksi sakelar memadamkan targetnya lagi; aksi perintah tidak mengirim apa-apa (null), karena perintahnya
// sudah selesai sendiri (pompa padam setelah detiknya habis). Aturannya hanya "siap lagi" untuk kekeringan berikutnya.
function perintahSaatPadam(aksi: AksiAturan): PerintahSet | null {
  return aksi.jenis === "sakelar" ? { target: aksi.target, nilai: false } : null;
}

// Modul 24: satu perintah dalam kata-kata, misalnya "pompa menyiram 5 detik", "lampu dinyalakan", "tirai diatur ke 0°"
function kataPerintah(p: PerintahSet): string {
  if (p.target === "pompa") return `pompa menyiram ${p.nilai} detik`;
  if (p.target === "tirai") return `tirai diatur ke ${p.nilai}°`;
  return `${p.target} di${p.nilai ? "nyala" : "padam"}kan`;
}

// kalimat pendek untuk log dan buku kejadian
function uraikan(a: AturanTersimpan): string {
  const { kondisi: k, aksi } = a;
  const mati = a.aktif ? "" : " (tidak aktif)";
  if (k.jenis === "jadwal") {
    if (aksi.jenis !== "perintah") return "bentuk aturan tidak dikenal"; // sudah dicegah skema; hanya berjaga-jaga
    return `${aksi.perintah.target} ${aksi.device_id} = ${aksi.perintah.nilai} setiap "${k.cron}" WIB${mati}`;
  }
  const { nyala, padam } = arah(k);
  if (aksi.jenis === "sakelar") {
    return `${aksi.target} ${aksi.device_id} menyala kalau ${k.besaran} ${k.device_id} ${nyala} `
      + `selama ${k.selama_detik} detik, padam ${padam}${mati}`;
  }
  return `${aksi.perintah.target} ${aksi.device_id} = ${aksi.perintah.nilai} sekali kalau ${k.besaran} ${k.device_id} `
    + `${nyala} selama ${k.selama_detik} detik, siap lagi ${padam}${mati}`; // Modul 24
}

// Kirim ambang pengaman ke setiap perangkat yang punya aturan kipas berdasarkan suhu: suhu_kipas_on = nyala_di_atas
// (kontrak 1.3, config retained). Dipanggil setiap kali backend tersambung ke broker dan setiap kali aturan berubah.
// Catatan: aturan kipas yang dinonaktifkan atau dihapus TIDAK mencabut config lama. Perangkat tetap memakai suhu_kipas_on
// terakhir sebagai pengaman lokalnya (yang hanya bekerja saat broker tak terjangkau).
export function kirimSemuaConfig(): void {
  const sudah = new Set<string>(); // satu perangkat, satu ambang: aturan kipas aktif bernomor terkecil
  for (const a of daftar) {
    const { kondisi, aksi } = a;
    if (!a.aktif || kondisi.jenis !== "ambang" || aksi.jenis !== "sakelar") continue;
    if (kondisi.besaran !== "suhu" || aksi.target !== "kipas" || sudah.has(aksi.device_id)) continue;
    sudah.add(aksi.device_id);
    void kirimAmbang(aksi.device_id, kondisi.nyala_di_atas, a.id);
  }
}

async function kirimAmbang(deviceId: string, suhu: number, aturanId: number): Promise<void> {
  const id = buatIdPerintah();
  const menunggu = tungguAck(id, 5000); // mulai menunggu SEBELUM mengirim, seperti perintah set
  kirimConfig(deviceId, id, { suhu_kipas_on: suhu });
  log.info(`config ${id} ke ${deviceId}: suhu_kipas_on ${suhu} dari aturan ${aturanId} (retained)`);
  const ack = await menunggu;
  if (ack === null) {
    log.warn(`config ${id} ke ${deviceId}: belum dijawab dalam 5 detik; config tetap tertempel di broker sampai perangkat tersambung`);
  } else {
    log.info(`config ${id} ke ${deviceId}: ack ok=${ack.ok}${ack.pesan === undefined ? "" : ` (${ack.pesan})`}`);
  }
}

// Dipanggil mqtt.ts untuk setiap telemetry yang lolos kontrak.
export function nilaiBacaan(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): void {
  const sekarang = Date.now();
  if (sekarang - Date.parse(isi.ts) > BACAAN_BASI_MS) return; // data susulan: bukan keadaan sekarang
  const bacaan: Record<string, unknown> = isi;
  for (const a of daftar) {
    const { kondisi, aksi } = a;
    // aturan jadwal tidak dinilai dari bacaan: jamnya dijaga node-cron (jadwal.ts)
    if (!a.aktif || kondisi.jenis === "jadwal" || kondisi.device_id !== deviceId) continue;
    const mentah = bacaan[kondisi.besaran];
    const nilai = typeof mentah === "number" ? mentah : null; // null: sensor gagal, atau kolom tidak dimiliki perangkat
    const lama = ingatan.get(a.id) ?? ingatanAwal(aksi);
    const { ingatan: baru, keputusan } = kondisi.jenis === "ambang"
      ? nilaiAmbang(kondisi, lama, nilai, sekarang) // naik: "di atas"
      : nilaiAmbangBawah(kondisi, lama, nilai, sekarang); // Modul 24, turun: "di bawah"
    ingatan.set(a.id, baru);
    if (keputusan !== null) {
      void bertindak(a, kondisi, aksi, keputusan, nilai, isi.ts, lama);
    } else if (baru.aktif && aksi.kabari) { // masih menyala: pengingat paling sering 30 menit sekali (perluKabari)
      const [emoji, nama, satuan] = LABEL[kondisi.besaran];
      // Modul 24: aturan perintah (misalnya pompa) sudah selesai bertindak; yang ditunggu adalah syarat "siap lagi"-nya
      const keadaan = aksi.jenis === "sakelar" ? `${aksi.target} tetap menyala`
        : `aturan "${a.nama}" belum siap lagi (menunggu ${kondisi.besaran} ${arah(kondisi).padam})`;
      void kabariKalauPerlu(`aturan:${a.id}`, "bahaya",
        `${emoji} ${nama} masih ${nilai === null ? "-" : angka.format(nilai)}${satuan} — ${keadaan} (pengingat)`,
        isi.ts, true);
    } else if (lama.sejak === null && baru.sejak !== null) {
      log.info(`aturan ${a.id} (${a.nama}): ${kondisi.besaran} ${nilai} ${arah(kondisi).nyala}; `
        + `${kataPerintah(perintahSaatNyala(aksi))} kalau bertahan ${kondisi.selama_detik} detik`);
    } else if (lama.sejak !== null && baru.sejak === null) {
      log.info(`aturan ${a.id} (${a.nama}): hitungan diulang (${kondisi.besaran} ${nilai ?? "tidak terbaca"})`);
    }
  }
}

// Setelah backend dimulai ulang atau aturannya diubah: kalau perangkat melaporkan aktuatornya sedang menyala, anggap
// aturan sakelar sedang menyala supaya nanti dipadamkan pada waktunya. Modul 24: aturan perintah (misalnya pompa sekali)
// selalu mulai dari padam, jadi kalau kondisinya masih terpenuhi, perintahnya dikirim sekali lagi.
function ingatanAwal(aksi: AksiAturan): Ingatan {
  if (aksi.jenis === "perintah") return INGATAN_AWAL;
  return { ...INGATAN_AWAL, aktif: cariPerangkat(aksi.device_id)?.reported?.[aksi.target] === true };
}

async function bertindak(a: AturanTersimpan, kondisi: KondisiBacaan, aksi: AksiAturan, keputusan: "nyalakan" | "padamkan",
  nilai: number | null, tsBacaan: string, lama: Ingatan): Promise<void> {
  const nyala = keputusan === "nyalakan";
  const perintah = nyala ? perintahSaatNyala(aksi) : perintahSaatPadam(aksi);
  let hasil: HasilPerintah | null = null; // tetap null kalau tidak ada yang dikirim (aturan perintah yang padam)
  if (perintah !== null) {
    hasil = await perintahkan(aksi.device_id, perintah, "aturan", a.id);
    if (hasil.status === "tidak-dikirim") {
      ingatan.set(a.id, lama); // keputusan belum terlaksana: bacaan berikutnya memutuskan lagi
      log.warn(`aturan ${a.id} (${a.nama}): ${perintah.target} tidak bisa di${nyala ? "nyala" : "padam"}kan: ${hasil.pesan}`);
      return;
    }
  }
  const pesan = kalimat(kondisi, aksi, nyala, nilai, hasil);
  log.info(`aturan ${a.id} (${a.nama}): ${pesan}`);
  // Modul 24: ok = apakah tindakannya terlaksana (true = perangkat menjawab ok; false = ditolak atau tidak menjawab;
  // null = tidak ada perintah yang dikirim). Dashboard memakainya untuk warna kabar, tanpa menebak dari kalimat.
  const ok = hasil === null ? null : hasil.status === "dijawab" && hasil.ack.ok;
  catatKejadian({ device_id: aksi.device_id, jenis: "aturan", sumber: "aturan", aturan_id: a.id, pesan,
    data: { keputusan, nilai, ts_bacaan: tsBacaan, perintah: hasil?.id ?? null, hasil: hasil?.status ?? "tanpa-perintah", ok } });
  // Telegram SESUDAH hasil ack diketahui supaya isi pesannya jujur; jedanya diukur dari bacaan pemicu (tsBacaan)
  if (aksi.kabari) void kabariKalauPerlu(`aturan:${a.id}`, nyala ? "bahaya" : "aman", pesan, tsBacaan);
}

const LABEL: Record<string, [string, string, string]> = { // besaran -> [emoji, nama, satuan]
  suhu: ["🌡️", "Suhu", " °C"], kelembapan: ["💧", "Kelembapan", " %"], cahaya: ["💡", "Cahaya", ""],
  tanah: ["🌱", "Tanah", " %"], level_air: ["🚰", "Air tandon", " %"], tanah_rs485: ["🌱", "Tanah (RS-485)", " %"],
  suhu_tanah: ["🌡️", "Suhu tanah", " °C"],
};
const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27,8"

// Kalimat untuk manusia (sama dengan pesan Telegram-nya), misalnya "🌡️ Suhu 33 °C — kipas dinyalakan otomatis". Modul 24:
// juga "🌱 Tanah 25 % — pompa menyiram 5 detik otomatis" dan, saat tanah sudah basah lagi, "✅ Tanah naik ke 36 % — aturan
// siap lagi". hasil = null kalau tidak ada perintah yang dikirim.
function kalimat(kondisi: KondisiBacaan, aksi: AksiAturan, nyala: boolean, nilai: number | null,
  hasil: HasilPerintah | null): string {
  const [emoji, nama, satuan] = LABEL[kondisi.besaran];
  const teks = nilai === null ? "-" : angka.format(nilai);
  const target = aksi.jenis === "sakelar" ? aksi.target : aksi.perintah.target;
  if (hasil?.status === "tanpa-ack") {
    // perintah.ts hanya mengirim ulang kipas, lampu, dan tirai (rekonsiliasi); pompa tidak, jadi jangan menjanjikannya
    const lanjut = target === "pompa" ? "tidak dikirim ulang" : "dicoba lagi";
    return `⚠️ ${nama} ${teks}${satuan} — ${target} TIDAK menjawab perintah (${lanjut})`;
  }
  if (hasil?.status === "dijawab" && !hasil.ack.ok) {
    return `⚠️ ${nama} ${teks}${satuan} — perintah ${target} ditolak perangkat: ${hasil.ack.pesan}`;
  }
  if (nyala) return `${emoji} ${nama} ${teks}${satuan} — ${kataPerintah(perintahSaatNyala(aksi))} otomatis`;
  const { pulih } = arah(kondisi);
  return aksi.jenis === "sakelar" ? `✅ ${nama} ${pulih} ke ${teks}${satuan} — ${aksi.target} dipadamkan`
    : `✅ ${nama} ${pulih} ke ${teks}${satuan} — aturan siap lagi`;
}
