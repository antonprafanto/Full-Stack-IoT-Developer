// gelombang.ts - Tantangan 3 Modul 28 (kunci): pembaruan firmware BERGELOMBANG otomatis untuk banyak perangkat.
// Tombol "Perbarui semua" (Modul 28) mengirim ke semua perangkat SEKALIGUS sesudah satu canary berhasil. Gelombang otomatis
// lebih hati-hati, dan tidak perlu ditunggui:
//   1. canary dulu: semua Node 1 bertanda canary diperbarui;
//   2. tunggu sehat: canary yang sudah memakai versi baru harus tetap sehat selama 10 menit (online, tetap versi baru, tidak
//      menyala ulang), diperiksa setiap 5 detik;
//   3. sisanya bertahap: gelombang 1 = 2 perangkat, gelombang 2 = 4, lalu 8, dan seterusnya (dua kali lipat). Gelombang
//      berikutnya baru dikirim sesudah SEMUA perangkat gelombang sebelumnya selesai.
// REM DARURAT: satu perangkat saja kembali ke versi lama (rollback), gagal, atau tanpa kabar sampai OTA_BATAS_MENIT
// (kedaluwarsa) = gelombang BERHENTI dan sisanya tidak dikirimi. Perangkat yang dilewati (offline, belum dikenal jenisnya,
// menolak perintah) tidak menarik rem: dicatat di ringkasan.
// Telegram: SATU ringkasan per tahap (canary, gelombang 1, gelombang 2, ...), menggantikan dua kabar per perangkat
// (🔄 berhenti sengaja dan ✅ online lagi, telegram.ts). Kabar 📴 "tidak kembali" tetap dikirim per perangkat: itu tanda bahaya.
// Gelombang hidup di memori backend: backend dimulai ulang = gelombang berhenti dan tidak dilanjutkan sendiri.
import { ambilRilis, calonPembaruan, ringkasanCanary } from "../db/armada.ts";
import type { BarisPembaruan } from "../db/armada.ts";
import { cariPerangkat } from "./gudang.ts";
import { mintaUpdate } from "./ota.ts";
import type { HasilUpdate } from "./ota.ts";
import { diamkanKabarBerhenti, kabari } from "./telegram.ts";
import { log } from "./log.ts";

export const TUNGGU_BAWAAN_MENIT = 10; // masa tunggu sehat canary; permintaan boleh memendekkannya (lab penulis: 1 menit)
export const UKURAN_AWAL_BAWAAN = 2; // gelombang pertama sesudah canary
const PANTAU_MS = 5000; // canary diperiksa setiap 5 detik selama masa tunggu
const SELISIH_NYALA_MS = 10_000; // perkiraan jam menyala boleh meleset beberapa detik sebelum dianggap "menyala ulang"
const REM = new Set(["rollback", "gagal", "kedaluwarsa"]); // hasil yang menarik rem darurat
const AKHIR = new Set(["berhasil", "rollback", "gagal", "kedaluwarsa"]); // hasil akhir yang dilaporkan lewat ota.ts

// hasil satu perangkat di gelombang ini. sudah = sudah memakai versi itu sebelumnya (tidak dikirimi)
export type StatusPerangkat = "berjalan" | "berhasil" | "sudah" | "rollback" | "gagal" | "kedaluwarsa" | "ditolak" | "dilewati";
export interface HasilPerangkat { status: StatusPerangkat; pesan: string | null }
export interface Tahap { nama: string; perangkat: string[] }

// ---------- logika murni (diuji Vitest tanpa database, broker, dan Telegram) ----------

// Bagi daftar perangkat menjadi gelombang yang makin besar: ukuranAwal, lalu dua kali lipat setiap gelombang.
// Misalnya 20 perangkat dengan ukuranAwal 2 -> 2, 4, 8, 6.
export function bagiGelombang(daftar: string[], ukuranAwal: number): string[][] {
  const hasil: string[][] = [];
  let mulai = 0;
  let ukuran = ukuranAwal;
  while (mulai < daftar.length) {
    hasil.push(daftar.slice(mulai, mulai + ukuran));
    mulai += ukuran;
    ukuran *= 2;
  }
  return hasil;
}

// Keadaan satu tahap dari hasil setiap perangkatnya: "rem" kalau ada yang rollback/gagal/kedaluwarsa (walau yang lain masih
// berjalan), "menunggu" kalau masih ada yang berjalan, selain itu "lolos".
export function nilaiTahap(hasil: HasilPerangkat[]): "rem" | "menunggu" | "lolos" {
  if (hasil.some((h) => REM.has(h.status))) return "rem";
  if (hasil.some((h) => h.status === "berjalan")) return "menunggu";
  return "lolos";
}

const KATA: Record<StatusPerangkat, string> = {
  berhasil: "berhasil", sudah: "sudah memakai versi ini", rollback: "kembali ke versi lama (rollback)", gagal: "gagal",
  kedaluwarsa: "tanpa kabar (kedaluwarsa)", ditolak: "menolak perintah", dilewati: "dilewati", berjalan: "masih berjalan",
};

// "3 berhasil, 1 dilewati (f00d00000007: perangkat sedang offline: ...)". Yang berhasil cukup dihitung; yang bermasalah ditulis
// dengan device_id dan alasannya (paling banyak 5 per jenis, supaya pesan Telegram tetap pendek).
export function teksHasil(perangkat: string[], hasil: Record<string, HasilPerangkat>): string {
  const bagian: string[] = [];
  for (const s of Object.keys(KATA) as StatusPerangkat[]) {
    const ini = perangkat.filter((id) => (hasil[id]?.status ?? "berjalan") === s);
    if (ini.length === 0) continue;
    if (s === "berhasil" || s === "sudah") {
      bagian.push(`${ini.length} ${KATA[s]}`);
      continue;
    }
    const rinci = ini.slice(0, 5).map((id) => (hasil[id]?.pesan ? `${id}: ${hasil[id].pesan}` : id)).join("; ");
    bagian.push(`${ini.length} ${KATA[s]} (${rinci}${ini.length > 5 ? `; dan ${ini.length - 5} lainnya` : ""})`);
  }
  return bagian.length === 0 ? "tidak ada perangkat" : bagian.join(", ");
}

// lama dalam bahasa sehari-hari: "45 detik", "3 menit 12 detik"
export function teksLama(ms: number): string {
  const detik = Math.round(ms / 1000);
  return detik < 60 ? `${detik} detik` : `${Math.floor(detik / 60)} menit${detik % 60 === 0 ? "" : ` ${detik % 60} detik`}`;
}

// ---------- gelombang yang sedang berjalan (satu saja pada satu waktu) ----------

type Keadaan = "berjalan" | "tunggu-sehat" | "selesai" | "berhenti";
interface Gelombang {
  versi: string;
  oleh: string; // nomor akun admin yang memulainya
  tungguMenit: number;
  tahap: Tahap[]; // [canary, gelombang 1, gelombang 2, ...]
  ke: number; // tahap yang sedang berjalan (0 = canary)
  keadaan: Keadaan;
  alasan: string | null; // kenapa berhenti
  hasil: Record<string, HasilPerangkat>;
  dikirim: Map<string, string>; // id perintah update -> device_id (semua yang pernah dikirim gelombang ini)
  menunggu: Set<string>; // id perintah tahap ini yang belum punya hasil akhir
  dini: Map<string, BarisPembaruan>; // hasil akhir yang tiba sebelum id perintahnya tercatat (jarang: ack lebih dari 5 detik)
  canary: { id: string; nyala: number | null }[]; // canary yang diawasi selama masa tunggu + perkiraan jam menyalanya
  pengatur?: ReturnType<typeof setInterval>;
  periksaDijadwalkan: boolean; // periksaTahap() sudah dijadwalkan untuk kabar-kabar yang tiba bersamaan
  mulai: number;
  selesai: number | null;
}
let sekarang: Gelombang | null = null;

const berjalan = (g: Gelombang) => g.keadaan === "berjalan" || g.keadaan === "tunggu-sehat";
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 19) + "Z";

// Keadaan gelombang terakhir untuk GET /armada/gelombang (null = belum ada sejak backend menyala)
export function keadaanGelombang() {
  const g = sekarang;
  if (g === null) return null;
  return {
    versi: g.versi, keadaan: g.keadaan, tahap_ke: g.ke, tunggu_menit: g.tungguMenit, alasan: g.alasan,
    mulai: iso(g.mulai), selesai: g.selesai === null ? null : iso(g.selesai),
    tahap: g.tahap.map((t) => ({ nama: t.nama, perangkat: t.perangkat.map((id) => ({ device_id: id,
      status: g.hasil[id]?.status ?? "antre", pesan: g.hasil[id]?.pesan ?? null })) })),
  };
}

// POST /armada/gelombang. Syarat awal sama dengan "Perbarui semua" (rilis ada, tidak ditarik, bukan rilis uji, tidak ada canary
// yang pernah gagal memakai versi ini), ditambah: paling sedikit satu canary, dan tidak ada gelombang lain yang berjalan.
export async function mulaiGelombang(versi: string, oleh: string, opsi: { tungguMenit?: number; ukuranAwal?: number } = {}):
  Promise<{ kode: 404 | 409; pesan: string } | { kode: 202; keadaan: NonNullable<ReturnType<typeof keadaanGelombang>> }> {
  if (sekarang !== null && berjalan(sekarang)) {
    return { kode: 409, pesan: `gelombang ${sekarang.versi} masih berjalan: tunggu selesai, atau hentikan dulu` };
  }
  const rilis = await ambilRilis("node1", versi);
  if (rilis === undefined) return { kode: 404, pesan: `firmware node1 ${versi} belum diunggah` };
  if (rilis.ditarik !== null) return { kode: 409, pesan: `firmware ${versi} sudah ditarik` };
  if (rilis.uji) return { kode: 409, pesan: `${versi} rilis UJI: tidak pernah dikirim ke banyak perangkat` };
  const riwayat = await ringkasanCanary("node1", versi);
  if (riwayat.gagal > 0) {
    return { kode: 409, pesan: `${riwayat.gagal} perangkat canary pernah gagal atau rollback memakai ${versi}: jangan disebarkan` };
  }
  const calon = (await calonPembaruan()).filter((c) => c.dicabut === null); // urut device_id (kueri db/armada.ts)
  const canary = calon.filter((c) => c.canary).map((c) => c.device_id);
  if (canary.length === 0) return { kode: 409, pesan: "belum ada perangkat canary: centang Canary di kartu perangkat di layar Armada dulu" };
  const gelombang = bagiGelombang(calon.filter((c) => !c.canary).map((c) => c.device_id), opsi.ukuranAwal ?? UKURAN_AWAL_BAWAAN);
  const g: Gelombang = {
    versi, oleh, tungguMenit: opsi.tungguMenit ?? TUNGGU_BAWAAN_MENIT, ke: 0, keadaan: "berjalan", alasan: null, hasil: {},
    tahap: [{ nama: "canary", perangkat: canary },
      ...gelombang.map((perangkat, i) => ({ nama: `gelombang ${i + 1} dari ${gelombang.length}`, perangkat }))],
    dikirim: new Map(), menunggu: new Set(), dini: new Map(), canary: [], periksaDijadwalkan: false, mulai: Date.now(), selesai: null,
  };
  sekarang = g;
  log.info(`gelombang ${versi} dimulai akun ${oleh}: canary ${canary.join(", ")}, lalu ${gelombang.length} gelombang `
    + `(${gelombang.map((p) => p.length).join(", ")} perangkat), tunggu sehat ${g.tungguMenit} menit`);
  void jalankanTahap(g);
  return { kode: 202, keadaan: keadaanGelombang()! };
}

// POST /armada/gelombang/berhenti: tahap yang sedang berjalan tidak ditarik kembali (perintahnya sudah terkirim), tetapi
// tahap berikutnya tidak pernah dikirim. null = tidak ada gelombang yang berjalan.
export function hentikanGelombang(oleh: string) {
  if (sekarang === null || !berjalan(sekarang)) return null;
  berhenti(sekarang, "henti", `dihentikan admin (akun ${oleh})`);
  return keadaanGelombang();
}

// Kirim tahap ke-g.ke ke semua perangkatnya sekaligus, lalu tunggu hasil akhirnya lewat kabarGelombang().
async function jalankanTahap(g: Gelombang): Promise<void> {
  const tahap = g.tahap[g.ke];
  let fwSekarang: Map<string, string | null>;
  try {
    const rilis = await ambilRilis("node1", g.versi); // admin bisa menarik rilis di tengah jalan
    if (rilis === undefined || rilis.ditarik !== null) return berhenti(g, "henti", `firmware ${g.versi} sudah ditarik`);
    fwSekarang = new Map((await calonPembaruan()).map((c) => [c.device_id, c.fw]));
  } catch (galat) {
    return berhenti(g, "henti", `database bermasalah: ${(galat as Error).message}`);
  }
  if (sekarang !== g || g.keadaan !== "berjalan") return; // dihentikan admin selagi menunggu database
  const kirim = tahap.perangkat.filter((id) => fwSekarang.get(id) !== g.versi);
  for (const id of tahap.perangkat) if (!kirim.includes(id)) g.hasil[id] = { status: "sudah", pesan: null };
  for (const id of kirim) diamkanKabarBerhenti(id, true); // 🔄/✅ perangkat ini diganti ringkasan gelombang
  const semua = await Promise.all(kirim.map((id) => mintaUpdate(id, g.versi, g.oleh)
    .catch((galat: Error): HasilUpdate => ({ status: "tidak-dikirim", device_id: id, kode: 503, pesan: galat.message }))));
  let galatServer: string | null = null;
  for (const h of semua) {
    if (h.status === "ditolak" || h.status === "tidak-dikirim") { // dilewati (offline, Node 2, ...), BUKAN rem darurat
      g.hasil[h.device_id] = { status: h.status === "ditolak" ? "ditolak" : "dilewati", pesan: h.pesan };
      diamkanKabarBerhenti(h.device_id, false);
      if (h.status === "tidak-dikirim" && h.kode === 503) galatServer = h.pesan; // broker putus, ALAMAT_SERVER kosong, ...
    } else { // diterima atau tanpa-ack: terkirim, hasil akhirnya menyusul lewat ota.ts
      g.hasil[h.device_id] = { status: "berjalan", pesan: null };
      g.dikirim.set(h.id, h.device_id);
      g.menunggu.add(h.id);
      const dini = g.dini.get(h.id);
      if (dini !== undefined) simpanHasil(g, dini);
    }
  }
  if (galatServer !== null && g.menunggu.size === 0) return berhenti(g, "henti", `server bermasalah: ${galatServer}`);
  periksaTahap(g);
}

// Dipanggil ota.ts (kabarkan) untuk SETIAP perubahan status pembaruan. Gelombang hanya peduli hasil akhir perintahnya sendiri.
export function kabarGelombang(b: BarisPembaruan): void {
  const g = sekarang;
  if (g === null || !AKHIR.has(b.status)) return;
  if (!g.dikirim.has(b.id)) { // belum tercatat: mungkin hasil yang tiba sebelum mintaUpdate() selesai menunggu ack
    if (berjalan(g) && b.ke_versi === g.versi && g.tahap[g.ke].perangkat.includes(b.device_id)) g.dini.set(b.id, b);
    return;
  }
  simpanHasil(g, b);
  // Diperiksa sesudah semua kabar yang tiba BERSAMAAN dicatat (pengawas kedaluwarsa melaporkan beberapa perangkat sekaligus):
  // ringkasan rem darurat lalu menyebut semuanya, bukan hanya yang pertama.
  if (!g.periksaDijadwalkan) {
    g.periksaDijadwalkan = true;
    queueMicrotask(() => { g.periksaDijadwalkan = false; periksaTahap(g); });
  }
}

function simpanHasil(g: Gelombang, b: BarisPembaruan): void {
  const id = g.dikirim.get(b.id) ?? b.device_id;
  g.dikirim.set(b.id, id);
  g.dini.delete(b.id);
  g.menunggu.delete(b.id);
  g.hasil[id] = { status: b.status as StatusPerangkat, pesan: b.pesan }; // laporan perangkat yang datang belakangan ikut dicatat
  diamkanKabarBerhenti(id, false);
}

// Tahap selesai? Rem darurat, masa tunggu sehat (sesudah canary), tahap berikutnya, atau selesai.
function periksaTahap(g: Gelombang): void {
  if (sekarang !== g || g.keadaan !== "berjalan") return;
  const tahap = g.tahap[g.ke];
  const nilai = nilaiTahap(tahap.perangkat.map((id) => g.hasil[id] ?? { status: "berjalan", pesan: null }));
  if (nilai === "menunggu") return;
  if (nilai === "rem") return berhenti(g, "rem", null);
  if (g.ke === 0 && !tahap.perangkat.some((id) => ["berhasil", "sudah"].includes(g.hasil[id]?.status ?? ""))) {
    return berhenti(g, "henti", "tidak ada canary yang memakai versi ini (semua dilewati)");
  }
  if (g.ke === g.tahap.length - 1) return selesai(g);
  const berikut = g.tahap[g.ke + 1];
  if (g.ke === 0) return mulaiTungguSehat(g, berikut);
  void kabari(`🌊 Gelombang ${g.versi} · ${tahap.nama}: ${teksHasil(tahap.perangkat, g.hasil)}. Lanjut ${berikut.nama} `
    + `(${berikut.perangkat.length} perangkat).`);
  g.ke++;
  void jalankanTahap(g);
}

// Perkiraan jam MENYALA perangkat dari vitals terakhirnya (ts dikurangi uptime). Kalau jam menyala bergeser maju, perangkat itu
// menyala ulang (vitals dikirim setiap kali perangkat tersambung, jadi menyala ulang pasti terlihat). null = belum ada vitals.
function jamNyala(id: string): number | null {
  const v = cariPerangkat(id)?.vitals;
  return v === null || v === undefined ? null : Date.parse(v.ts) - v.uptime_s * 1000;
}

// Versi yang dilaporkan pesan TERBARU perangkat (telemetry atau vitals, dibandingkan ts-nya). Sesaat sesudah menyala ulang,
// telemetry terakhir di memori masih dari versi LAMA, sedangkan vitals saat tersambung sudah membawa versi baru.
function fwTerbaru(id: string): string | null {
  const p = cariPerangkat(id);
  const t = p?.telemetry ?? null;
  const v = p?.vitals?.fw !== undefined ? p.vitals : null;
  if (t === null || v === null) return t?.fw ?? v?.fw ?? null;
  return Date.parse(v.ts) >= Date.parse(t.ts) ? v.fw ?? null : t.fw;
}

// Masalah kesehatan canary selama masa tunggu, atau null kalau semuanya sehat.
function periksaCanary(g: Gelombang): string | null {
  for (const c of g.canary) {
    const p = cariPerangkat(c.id);
    if (p?.status !== "online") {
      const kata = p?.status === "offline-mode" ? "berhenti sengaja (offline-mode)" : p?.status === "offline" ? "terputus (offline)"
        : "tidak terdengar";
      return `canary ${c.id} ${kata} selama masa tunggu sehat`;
    }
    const fw = fwTerbaru(c.id);
    if (fw !== null && fw !== g.versi) return `canary ${c.id} kini memakai ${fw}, bukan ${g.versi}`;
    const nyala = jamNyala(c.id);
    if (nyala !== null && c.nyala !== null && nyala > c.nyala + SELISIH_NYALA_MS) {
      return `canary ${c.id} menyala ulang selama masa tunggu sehat (${p.vitals?.reset_reason ?? "alasan tidak dilaporkan"})`;
    }
    c.nyala ??= nyala;
  }
  return null;
}

function mulaiTungguSehat(g: Gelombang, berikut: Tahap): void {
  const canary = g.tahap[0];
  g.keadaan = "tunggu-sehat";
  g.canary = canary.perangkat.filter((id) => ["berhasil", "sudah"].includes(g.hasil[id]?.status ?? ""))
    .map((id) => ({ id, nyala: jamNyala(id) }));
  void kabari(`🌊 Gelombang ${g.versi} · canary: ${teksHasil(canary.perangkat, g.hasil)}. Tunggu ${g.tungguMenit} menit: canary harus `
    + `tetap online dengan ${g.versi}, lalu ${berikut.nama} (${berikut.perangkat.length} perangkat).`);
  log.info(`gelombang ${g.versi}: canary lolos, tunggu sehat ${g.tungguMenit} menit`);
  const akhir = Date.now() + g.tungguMenit * 60_000;
  g.pengatur = setInterval(() => {
    const masalah = periksaCanary(g);
    if (masalah !== null) return berhenti(g, "rem", masalah);
    if (Date.now() < akhir) return;
    clearInterval(g.pengatur);
    log.info(`gelombang ${g.versi}: canary sehat ${g.tungguMenit} menit, ${berikut.nama} dikirim`);
    g.keadaan = "berjalan";
    g.ke = 1;
    void jalankanTahap(g);
  }, PANTAU_MS);
}

function selesai(g: Gelombang): void {
  const tahap = g.tahap[g.ke];
  g.keadaan = "selesai";
  g.selesai = Date.now();
  const semua = g.tahap.flatMap((t) => t.perangkat);
  const teks = `✅ Gelombang ${g.versi} SELESAI · ${tahap.nama}: ${teksHasil(tahap.perangkat, g.hasil)}. Semua tahap: `
    + `${teksHasil(semua, g.hasil)}, dalam ${teksLama(g.selesai - g.mulai)}.`;
  log.info(teks);
  void kabari(teks);
}

// rem = rem darurat (ada perangkat yang gagal, atau canary tidak sehat); henti = berhenti tanpa kegagalan perangkat
function berhenti(g: Gelombang, jenis: "rem" | "henti", alasan: string | null): void {
  if (!berjalan(g)) return;
  clearInterval(g.pengatur);
  const masaTunggu = g.keadaan === "tunggu-sehat";
  g.keadaan = "berhenti";
  g.selesai = Date.now();
  g.alasan = alasan ?? `rem darurat di ${g.tahap[g.ke].nama}`;
  const tahap = g.tahap[g.ke];
  const sisa = g.tahap.slice(g.ke + 1).reduce((n, t) => n + t.perangkat.length, 0);
  const kepala = jenis === "rem" ? `🛑 Gelombang ${g.versi} BERHENTI (rem darurat)` : `⏹️ Gelombang ${g.versi} berhenti`;
  const teks = kepala + (alasan !== null ? `: ${alasan}` : "")
    + (masaTunggu ? "" : ` · ${tahap.nama}: ${teksHasil(tahap.perangkat, g.hasil)}`)
    + `. ${sisa} perangkat lain TIDAK dikirimi${jenis === "rem" ? ": periksa dulu, lalu tarik rilisnya" : ""}.`;
  log.warn(teks);
  void kabari(teks);
}
