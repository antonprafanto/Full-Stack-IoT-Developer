// otomasi.ts - menjalankan aturan otomatis dari tabel rules (Modul 19): memuat aturan ke memori, menilai setiap bacaan
// dengan otak murni (aturan/mesin.ts), bertindak lewat perintahkan(), mengirim ambang kipas ke perangkat (config),
// memasang aturan jadwal (jadwal.ts), dan mencatat setiap tindakan di buku kejadian.
import { Aturan } from "../schemas/aturan.ts";
import type { AksiSakelar, AturanTersimpan, KondisiAmbang } from "../schemas/aturan.ts";
import type { TelemetryNode1, TelemetryNode2 } from "../schemas/kontrak.ts";
import { INGATAN_AWAL, nilaiAmbang } from "../aturan/mesin.ts";
import type { Ingatan } from "../aturan/mesin.ts";
import { ambilSemuaAturan, tambahAturan, ubahAturan, waktuKontrak } from "../db/arsip.ts";
import type { BarisAturan } from "../db/arsip.ts";
import { cariPerangkat, tungguAck } from "./gudang.ts";
import { buatIdPerintah, kirimConfig, ringkas } from "./mqtt.ts";
import { perintahkan } from "./perintah.ts";
import type { HasilPerintah } from "./perintah.ts";
import { pasangJadwal } from "./jadwal.ts";
import { catatKejadian } from "./kejadian.ts";
import { kabariKalauPerlu } from "./telegram.ts";
import { log } from "./log.ts";

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

async function setelahBerubah(baris: BarisAturan, kata: string): Promise<AturanTersimpan> {
  ingatan.delete(baris.id); // ambang baru = hitungan "selama" baru
  await muatAturan();
  const a = cariAturan(baris.id);
  if (a === undefined) throw new Error(`aturan ${baris.id} tidak sah setelah disimpan`);
  const pesan = `Aturan ${a.id} (${a.nama}) ${kata} lewat API: ${uraikan(a)}`;
  log.info(pesan);
  catatKejadian({ device_id: null, jenis: "aturan-diubah", sumber: "api", aturan_id: a.id, pesan,
    data: { nama: a.nama, aktif: a.aktif, kondisi: a.kondisi, aksi: a.aksi } });
  kirimSemuaConfig();
  return a;
}

// kalimat pendek untuk log dan buku kejadian
function uraikan(a: AturanTersimpan): string {
  const { kondisi: k, aksi } = a;
  const mati = a.aktif ? "" : " (tidak aktif)";
  if (k.jenis === "jadwal" && aksi.jenis === "perintah") {
    return `${aksi.perintah.target} ${aksi.device_id} = ${aksi.perintah.nilai} setiap "${k.cron}" WIB${mati}`;
  }
  if (k.jenis === "ambang" && aksi.jenis === "sakelar") {
    return `${aksi.target} ${aksi.device_id} menyala kalau ${k.besaran} ${k.device_id} di atas ${k.nyala_di_atas} `
      + `selama ${k.selama_detik} detik, padam di bawah ${k.padam_di_bawah}${mati}`;
  }
  return "bentuk aturan tidak dikenal";
}

// Kirim ambang pengaman ke setiap perangkat yang punya aturan kipas berdasarkan suhu: suhu_kipas_on = nyala_di_atas
// (kontrak 1.3, config retained). Dipanggil setiap kali backend tersambung ke broker dan setiap kali aturan berubah.
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
    if (!a.aktif || kondisi.jenis !== "ambang" || aksi.jenis !== "sakelar" || kondisi.device_id !== deviceId) continue;
    const mentah = bacaan[kondisi.besaran];
    const nilai = typeof mentah === "number" ? mentah : null; // null: sensor gagal, atau kolom tidak dimiliki perangkat
    const lama = ingatan.get(a.id) ?? ingatanAwal(aksi);
    const { ingatan: baru, keputusan } = nilaiAmbang(kondisi, lama, nilai, sekarang);
    ingatan.set(a.id, baru);
    if (keputusan !== null) {
      void bertindak(a, kondisi, aksi, keputusan, nilai, isi.ts, lama);
    } else if (baru.aktif && aksi.kabari) { // masih menyala: pengingat paling sering 30 menit sekali (perluKabari)
      const [emoji, nama, satuan] = LABEL[kondisi.besaran];
      void kabariKalauPerlu(`aturan:${a.id}`, "bahaya",
        `${emoji} ${nama} masih ${nilai === null ? "-" : angka.format(nilai)}${satuan} — ${aksi.target} tetap menyala (pengingat)`,
        isi.ts, true);
    } else if (lama.sejak === null && baru.sejak !== null) {
      log.info(`aturan ${a.id} (${a.nama}): ${kondisi.besaran} ${nilai} di atas ${kondisi.nyala_di_atas}; `
        + `${aksi.target} dinyalakan kalau bertahan ${kondisi.selama_detik} detik`);
    } else if (lama.sejak !== null && baru.sejak === null) {
      log.info(`aturan ${a.id} (${a.nama}): hitungan diulang (${kondisi.besaran} ${nilai ?? "tidak terbaca"})`);
    }
  }
}

// Setelah backend dimulai ulang atau aturannya diubah: kalau perangkat melaporkan aktuatornya sedang menyala, anggap
// aturan sedang menyala supaya nanti dipadamkan pada waktunya.
function ingatanAwal(aksi: AksiSakelar): Ingatan {
  return { ...INGATAN_AWAL, aktif: cariPerangkat(aksi.device_id)?.reported?.[aksi.target] === true };
}

async function bertindak(a: AturanTersimpan, kondisi: KondisiAmbang, aksi: AksiSakelar, keputusan: "nyalakan" | "padamkan",
  nilai: number | null, tsBacaan: string, lama: Ingatan): Promise<void> {
  const nyala = keputusan === "nyalakan";
  const hasil = await perintahkan(aksi.device_id, { target: aksi.target, nilai: nyala }, "aturan", a.id);
  if (hasil.status === "tidak-dikirim") {
    ingatan.set(a.id, lama); // keputusan belum terlaksana: bacaan berikutnya memutuskan lagi
    log.warn(`aturan ${a.id} (${a.nama}): ${aksi.target} tidak bisa di${nyala ? "nyala" : "padam"}kan: ${hasil.pesan}`);
    return;
  }
  const pesan = kalimat(kondisi, aksi, nyala, nilai, hasil);
  log.info(`aturan ${a.id} (${a.nama}): ${pesan}`);
  catatKejadian({ device_id: aksi.device_id, jenis: "aturan", sumber: "aturan", aturan_id: a.id, pesan,
    data: { keputusan, nilai, ts_bacaan: tsBacaan, perintah: hasil.id, hasil: hasil.status } });
  // Telegram SESUDAH hasil ack diketahui supaya isi pesannya jujur; jedanya diukur dari bacaan pemicu (tsBacaan)
  if (aksi.kabari) void kabariKalauPerlu(`aturan:${a.id}`, nyala ? "bahaya" : "aman", pesan, tsBacaan);
}

const LABEL: Record<string, [string, string, string]> = { // besaran -> [emoji, nama, satuan]
  suhu: ["🌡️", "Suhu", " °C"], kelembapan: ["💧", "Kelembapan", " %"], cahaya: ["💡", "Cahaya", ""],
  tanah: ["🌱", "Tanah", " %"], level_air: ["🚰", "Air tandon", " %"], tanah_rs485: ["🌱", "Tanah (RS-485)", " %"],
  suhu_tanah: ["🌡️", "Suhu tanah", " °C"],
};
const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }); // 33 -> "33", 27.8 -> "27,8"

// Kalimat untuk manusia, misalnya "🌡️ Suhu 33 °C — kipas dinyalakan otomatis" (sama dengan pesan Telegram-nya).
function kalimat(kondisi: KondisiAmbang, aksi: AksiSakelar, nyala: boolean, nilai: number | null,
  hasil: HasilPerintah): string {
  const [emoji, nama, satuan] = LABEL[kondisi.besaran];
  const teks = nilai === null ? "-" : angka.format(nilai);
  if (hasil.status === "tanpa-ack") return `⚠️ ${nama} ${teks}${satuan} — ${aksi.target} TIDAK menjawab perintah (dicoba lagi)`;
  if (hasil.status === "dijawab" && !hasil.ack.ok) {
    return `⚠️ ${nama} ${teks}${satuan} — perintah ${aksi.target} ditolak perangkat: ${hasil.ack.pesan}`;
  }
  return nyala ? `${emoji} ${nama} ${teks}${satuan} — ${aksi.target} dinyalakan otomatis`
    : `✅ ${nama} turun ke ${teks}${satuan} — ${aksi.target} dipadamkan`;
}
