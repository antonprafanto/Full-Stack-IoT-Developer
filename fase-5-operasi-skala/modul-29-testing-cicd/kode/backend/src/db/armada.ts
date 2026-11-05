// armada.ts - tabel rilis firmware (firmware), riwayat pembaruan (pembaruan), dan data halaman /armada (Modul 28, migrasi
// 011). Semua kueri SQL untuk pembaruan firmware ada di sini; aturan kapan sesuatu boleh dikirim ada di services/ota.ts.
import { pool } from "./pool.ts";

// ---------- rilis firmware ----------

export interface BarisRilis {
  jenis: "node1";
  versi: string;
  ukuran: number;
  sha256: string;
  catatan: string | null;
  uji: boolean;
  pengunggah: string | null;
  dibuat: Date;
  ditarik: Date | null;
}

const KOLOM_RILIS = "jenis, versi, ukuran, sha256, catatan, uji, pengunggah, dibuat, ditarik";

// Simpan rilis baru. Hasilnya undefined kalau versi itu SUDAH ada (versi tidak boleh ditimpa: kode galat 23505 = unique).
export async function simpanRilis(r: Omit<BarisRilis, "dibuat" | "ditarik">): Promise<BarisRilis | undefined> {
  try {
    const hasil = await pool.query<BarisRilis>(
      `INSERT INTO firmware (jenis, versi, ukuran, sha256, catatan, uji, pengunggah) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${KOLOM_RILIS}`,
      [r.jenis, r.versi, r.ukuran, r.sha256, r.catatan, r.uji, r.pengunggah],
    );
    return hasil.rows[0];
  } catch (galat) {
    if ((galat as { code?: string }).code === "23505") return undefined;
    throw galat;
  }
}

export async function ambilRilis(jenis: string, versi: string): Promise<BarisRilis | undefined> {
  const hasil = await pool.query<BarisRilis>(`SELECT ${KOLOM_RILIS} FROM firmware WHERE jenis = $1 AND versi = $2`, [jenis, versi]);
  return hasil.rows[0];
}

// Satu rilis + ringkasan canary-nya: berapa perangkat canary yang berhasil, dan berapa yang rollback/gagal, memakai versi itu.
export interface RilisDanCanary extends BarisRilis {
  canary_berhasil: number;
  canary_gagal: number;
}

export async function semuaRilis(): Promise<RilisDanCanary[]> {
  const hasil = await pool.query<RilisDanCanary>(
    `SELECT f.jenis, f.versi, f.ukuran, f.sha256, f.catatan, f.uji, f.pengunggah, f.dibuat, f.ditarik,
            count(p.id) FILTER (WHERE p.status = 'berhasil')::int              AS canary_berhasil,
            count(p.id) FILTER (WHERE p.status IN ('rollback', 'gagal'))::int AS canary_gagal
     FROM firmware f
     LEFT JOIN pembaruan p ON p.jenis = f.jenis AND p.ke_versi = f.versi AND p.canary
     GROUP BY f.jenis, f.versi
     ORDER BY f.jenis, f.dibuat`,
  );
  return hasil.rows;
}

// Tandai rilis buruk sebagai ditarik: tidak dikirim lagi dan tidak bisa diunduh lagi. undefined = tidak ada / sudah ditarik.
export async function tarikRilis(jenis: string, versi: string): Promise<BarisRilis | undefined> {
  const hasil = await pool.query<BarisRilis>(
    `UPDATE firmware SET ditarik = now() WHERE jenis = $1 AND versi = $2 AND ditarik IS NULL RETURNING ${KOLOM_RILIS}`,
    [jenis, versi],
  );
  return hasil.rows[0];
}

// ---------- riwayat pembaruan ----------

export type StatusPembaruan = "dikirim" | "diterima" | "mengunduh" | "ditolak" | "berhasil" | "rollback" | "gagal" | "kedaluwarsa";
export const STATUS_BERJALAN: StatusPembaruan[] = ["dikirim", "diterima", "mengunduh"];

export interface BarisPembaruan {
  id: string;
  device_id: string;
  jenis: string;
  dari_versi: string | null;
  ke_versi: string;
  canary: boolean;
  status: StatusPembaruan;
  pesan: string | null;
  oleh: string | null;
  dibuat: Date;
  diperbarui: Date;
  selesai: Date | null;
}

const KOLOM_PEMBARUAN = "id, device_id, jenis, dari_versi, ke_versi, canary, status, pesan, oleh, dibuat, diperbarui, selesai";

// Catat satu perintah update SEBELUM diterbitkan. false = perangkat itu masih punya pembaruan yang berjalan (indeks unik
// pembaruan_satu_berjalan menolak baris kedua; kode 23505).
export async function mulaiPembaruan(p: { id: string; deviceId: string; dari: string | null; ke: string; canary: boolean;
  oleh: string }): Promise<boolean> {
  try {
    await pool.query(
      "INSERT INTO pembaruan (id, device_id, dari_versi, ke_versi, canary, oleh) VALUES ($1, $2, $3, $4, $5, $6)",
      [p.id, p.deviceId, p.dari, p.ke, p.canary, p.oleh],
    );
    return true;
  } catch (galat) {
    if ((galat as { code?: string }).code === "23505") return false;
    throw galat;
  }
}

// Ganti status satu pembaruan, HANYA kalau statusnya sekarang salah satu dari `dari` (misalnya ack datang sesudah perangkat
// sudah mulai mengunduh: "diterima" tidak boleh menimpa "mengunduh"). Status akhir mengisi kolom selesai. Hasilnya baris
// sesudah diubah, atau undefined kalau tidak ada yang cocok.
export async function ubahStatusPembaruan(id: string, deviceId: string, status: StatusPembaruan, pesan: string | null,
  dari: StatusPembaruan[]): Promise<BarisPembaruan | undefined> {
  const hasil = await pool.query<BarisPembaruan>(
    `UPDATE pembaruan SET status = $3, pesan = coalesce($4, pesan), diperbarui = now(),
       selesai = CASE WHEN $3 = ANY($6::text[]) THEN NULL ELSE now() END
     WHERE id = $1 AND device_id = $2 AND status = ANY($5::text[])
     RETURNING ${KOLOM_PEMBARUAN}`,
    [id, deviceId, status, pesan, dari, STATUS_BERJALAN],
  );
  return hasil.rows[0];
}

// Laporan hasil dari perangkat (vitals.ota). Selain pembaruan yang masih berjalan, laporan juga boleh menimpa hasil
// "kedaluwarsa" dan hasil yang hanya DISIMPULKAN server: laporan perangkat sendiri selalu lebih jujur.
export async function laporHasilPembaruan(id: string, deviceId: string, status: "berhasil" | "rollback" | "gagal",
  pesan: string | null): Promise<BarisPembaruan | undefined> {
  const hasil = await pool.query<BarisPembaruan>(
    `UPDATE pembaruan SET status = $3, pesan = $4, diperbarui = now(), selesai = now()
     WHERE id = $1 AND device_id = $2
       AND (status IN ('dikirim', 'diterima', 'mengunduh', 'kedaluwarsa') OR pesan LIKE 'disimpulkan server:%')
       AND NOT (status = $3 AND coalesce(pesan, '') = coalesce($4, ''))
     RETURNING ${KOLOM_PEMBARUAN}`,
    [id, deviceId, status, pesan],
  );
  return hasil.rows[0];
}

// Apakah server ini pernah mengirim perintah update ber-id itu ke perangkat itu? Untuk membedakan laporan ulang (wajar,
// diulang sampai 3 vitals) dari laporan pembaruan yang TIDAK pernah diperintahkan dashboard ini (temuan verifikasi M28).
export async function pembaruanDikenal(id: string, deviceId: string): Promise<boolean> {
  const hasil = await pool.query("SELECT 1 FROM pembaruan WHERE id = $1 AND device_id = $2", [id, deviceId]);
  return (hasil.rowCount ?? 0) > 0;
}

// Laporan hilang (vitals QoS 0)? Simpulkan dari vitals biasa yang membawa fw: perangkat yang MENYALA SESUDAH perintahnya
// dikirim (uptime lebih kecil daripada umur perintah) dengan versi baru = berhasil, dengan versi lain = gagal. Hasilnya baris
// yang disimpulkan (biasanya 0 atau 1).
export async function simpulkanPembaruan(deviceId: string, fw: string, uptimeDetik: number): Promise<BarisPembaruan[]> {
  const hasil = await pool.query<BarisPembaruan>(
    `UPDATE pembaruan SET
       status = CASE WHEN ke_versi = $2 THEN 'berhasil' ELSE 'gagal' END,
       pesan = CASE WHEN ke_versi = $2 THEN 'disimpulkan server: menyala dengan versi baru tanpa laporan'
                    ELSE 'disimpulkan server: menyala lagi dengan ' || $2 || ' tanpa laporan (bisa rollback)' END,
       diperbarui = now(), selesai = now()
     WHERE device_id = $1 AND status IN ('dikirim', 'diterima', 'mengunduh')
       AND extract(epoch FROM now() - dibuat) > $3
     RETURNING ${KOLOM_PEMBARUAN}`,
    [deviceId, fw, uptimeDetik],
  );
  return hasil.rows;
}

// Pembaruan tanpa kabar lebih dari `menit` menit = kedaluwarsa (perangkat mati di tengah jalan, laporan hilang, ...).
export async function kedaluwarsakanPembaruan(menit: number): Promise<BarisPembaruan[]> {
  const hasil = await pool.query<BarisPembaruan>(
    `UPDATE pembaruan SET status = 'kedaluwarsa', pesan = 'tanpa kabar dari perangkat', diperbarui = now(), selesai = now()
     WHERE status IN ('dikirim', 'diterima', 'mengunduh') AND dibuat < now() - make_interval(mins => $1)
     RETURNING ${KOLOM_PEMBARUAN}`,
    [menit],
  );
  return hasil.rows;
}

// Perangkat mulai mengunduh berkas firmware (rute /fw): pembaruan yang menunggu versi itu berganti menjadi "mengunduh".
export async function tandaiMengunduh(deviceId: string, versi: string): Promise<BarisPembaruan | undefined> {
  const hasil = await pool.query<BarisPembaruan>(
    `UPDATE pembaruan SET status = 'mengunduh', diperbarui = now()
     WHERE device_id = $1 AND ke_versi = $2 AND status IN ('dikirim', 'diterima')
     RETURNING ${KOLOM_PEMBARUAN}`,
    [deviceId, versi],
  );
  return hasil.rows[0];
}

export async function riwayatPembaruan(deviceId: string, batas = 20): Promise<BarisPembaruan[]> {
  const hasil = await pool.query<BarisPembaruan>(
    `SELECT ${KOLOM_PEMBARUAN} FROM pembaruan WHERE device_id = $1 ORDER BY dibuat DESC LIMIT $2`, [deviceId, batas]);
  return hasil.rows;
}

// Syarat "perbarui semua" (Modul 28): berapa canary yang berhasil dan yang gagal/rollback memakai versi ini?
export async function ringkasanCanary(jenis: string, versi: string): Promise<{ berhasil: number; gagal: number }> {
  const hasil = await pool.query<{ berhasil: number; gagal: number }>(
    `SELECT count(*) FILTER (WHERE status = 'berhasil')::int AS berhasil,
            count(*) FILTER (WHERE status IN ('rollback', 'gagal'))::int AS gagal
     FROM pembaruan WHERE jenis = $1 AND ke_versi = $2 AND canary`,
    [jenis, versi],
  );
  return hasil.rows[0] ?? { berhasil: 0, gagal: 0 };
}

// ---------- keadaan per perangkat ----------

// Versi firmware yang terakhir dilaporkan (telemetry atau vitals). Hanya ditulis kalau berubah atau sudah lama.
export async function catatFwDb(deviceId: string, fw: string): Promise<void> {
  await pool.query("UPDATE devices SET fw = $2, fw_dilihat = now() WHERE device_id = $1", [deviceId, fw]);
}

export async function catatResetReasonDb(deviceId: string, alasan: string): Promise<void> {
  await pool.query("UPDATE devices SET reset_reason = $2 WHERE device_id = $1", [deviceId, alasan]);
}

// Tandai/lepas canary. Hanya perangkat WiFi berkunci (bukan Node 2 lewat penghubung) yang terdaftar dan belum dicabut;
// jenisnya boleh masih belum-diketahui (baru didaftarkan, telemetry pertamanya belum tiba). undefined = tidak memenuhi.
export async function ubahCanary(deviceId: string, canary: boolean): Promise<{ device_id: string; canary: boolean } | undefined> {
  const hasil = await pool.query<{ device_id: string; canary: boolean }>(
    `UPDATE devices SET canary = $2
     WHERE device_id = $1 AND jenis <> 'node2' AND penghubung IS NULL AND terdaftar IS NOT NULL AND dicabut IS NULL
     RETURNING device_id, canary`,
    [deviceId, canary],
  );
  return hasil.rows[0];
}

// Atur jeda vitals (detik). Sama syaratnya dengan canary: Node 2 tidak mengirim vitals sama sekali.
export async function ubahJedaVitals(deviceId: string, detik: number):
  Promise<{ device_id: string; jeda_vitals_s: number; fw: string | null } | undefined> {
  const hasil = await pool.query<{ device_id: string; jeda_vitals_s: number; fw: string | null }>(
    `UPDATE devices SET jeda_vitals_s = $2
     WHERE device_id = $1 AND jenis <> 'node2' AND penghubung IS NULL AND terdaftar IS NOT NULL AND dicabut IS NULL
     RETURNING device_id, jeda_vitals_s, fw`,
    [deviceId, detik],
  );
  return hasil.rows[0];
}

// Satu baris halaman /armada: perangkat terdaftar (juga yang sudah dicabut) + kesehatan terakhir + pembaruan terakhirnya.
export interface BarisArmada {
  device_id: string;
  nama: string | null;
  lokasi: string | null;
  jenis: "node1" | "node2" | "belum-diketahui";
  status: string;
  terakhir_dilihat: Date | null;
  penghubung: string | null;
  dicabut: Date | null;
  canary: boolean;
  jeda_vitals_s: number | null;
  fw: string | null;
  fw_dilihat: Date | null;
  reset_reason: string | null;
  kesehatan_ts: Date | null;
  rssi: number | null;
  heap_free: number | null;
  uptime_s: number | null;
  kesehatan_reset_reason: string | null;
  p_id: string | null;
  p_status: StatusPembaruan | null;
  p_dari: string | null;
  p_ke: string | null;
  p_pesan: string | null;
  p_dibuat: Date | null;
  p_diperbarui: Date | null;
  p_selesai: Date | null;
}

// LATERAL + LIMIT 1 memakai indeks (device_id, ts) dan (device_id, dibuat): satu langkah kecil per perangkat.
export async function dataArmada(): Promise<BarisArmada[]> {
  const hasil = await pool.query<BarisArmada>(
    `SELECT d.device_id, d.nama, d.lokasi, d.jenis, d.status, d.terakhir_dilihat, d.penghubung, d.dicabut, d.canary,
            d.jeda_vitals_s, d.fw, d.fw_dilihat, d.reset_reason,
            h.ts AS kesehatan_ts, h.rssi, h.heap_free, h.uptime_s, h.reset_reason AS kesehatan_reset_reason,
            p.id AS p_id, p.status AS p_status, p.dari_versi AS p_dari, p.ke_versi AS p_ke, p.pesan AS p_pesan,
            p.dibuat AS p_dibuat, p.diperbarui AS p_diperbarui, p.selesai AS p_selesai
     FROM devices d
     LEFT JOIN LATERAL (SELECT ts, rssi, heap_free, uptime_s, reset_reason FROM device_health
                        WHERE device_id = d.device_id ORDER BY ts DESC LIMIT 1) h ON true
     LEFT JOIN LATERAL (SELECT id, status, dari_versi, ke_versi, pesan, dibuat, diperbarui, selesai FROM pembaruan
                        WHERE device_id = d.device_id ORDER BY dibuat DESC LIMIT 1) p ON true
     WHERE d.terdaftar IS NOT NULL
     ORDER BY d.device_id`,
  );
  return hasil.rows;
}

// Calon penerima "perbarui canary" / "perbarui semua": semua Node 1 terdaftar (yang dicabut ikut, supaya alasannya tampil).
export interface CalonPembaruan {
  device_id: string;
  jenis: "node1" | "node2" | "belum-diketahui";
  terdaftar: Date | null;
  dicabut: Date | null;
  status: string;
  fw: string | null;
  canary: boolean;
  berjalan: boolean;
}

export async function calonPembaruan(): Promise<CalonPembaruan[]> {
  const hasil = await pool.query<CalonPembaruan>(
    `SELECT d.device_id, d.jenis, d.terdaftar, d.dicabut, d.status, d.fw, d.canary,
            EXISTS (SELECT 1 FROM pembaruan p WHERE p.device_id = d.device_id
                    AND p.status IN ('dikirim', 'diterima', 'mengunduh')) AS berjalan
     FROM devices d
     WHERE d.terdaftar IS NOT NULL AND d.jenis <> 'node2'
     ORDER BY d.device_id`,
  );
  return hasil.rows;
}

// Satu perangkat untuk perintah update satu per satu (rute POST /devices/:id/update).
export async function calonSatu(deviceId: string): Promise<CalonPembaruan | undefined> {
  const hasil = await pool.query<CalonPembaruan>(
    `SELECT d.device_id, d.jenis, d.terdaftar, d.dicabut, d.status, d.fw, d.canary,
            EXISTS (SELECT 1 FROM pembaruan p WHERE p.device_id = d.device_id
                    AND p.status IN ('dikirim', 'diterima', 'mengunduh')) AS berjalan
     FROM devices d WHERE d.device_id = $1`,
    [deviceId],
  );
  return hasil.rows[0];
}
