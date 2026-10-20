// arsip.ts - menulis pesan yang sudah lolos pemeriksaan kontrak ke database.
// Gudang di memori (gudang.ts) tetap menjadi "papan pengumuman" keadaan terbaru; database adalah buku arsipnya.
import { pool } from "./pool.ts";
import type { Status, TelemetryNode1, TelemetryNode2, Vitals } from "../schemas/kontrak.ts";

// Pastikan perangkat punya baris di tabel devices (dibuat kalau belum ada), lalu perbarui waktu terakhir terdengar.
// Kolom yang tidak diberikan (null) tidak menimpa isi lama, berkat coalesce.
async function catatPerangkat(deviceId: string, jenis: "node1" | "node2" | null, status: Status | null): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id, jenis, status, terakhir_dilihat)
     VALUES ($1, coalesce($2, 'belum-diketahui'), coalesce($3, 'belum-diketahui'), now())
     ON CONFLICT (device_id) DO UPDATE SET
       jenis = coalesce($2, devices.jenis),
       status = coalesce($3, devices.status),
       terakhir_dilihat = now()`,
    [deviceId, jenis, status],
  );
}

// Simpan satu telemetry. Hasilnya false kalau bacaan dengan ts yang sama sudah tersimpan (kiriman ganda).
export async function arsipkanTelemetry(deviceId: string, isi: TelemetryNode1 | TelemetryNode2): Promise<boolean> {
  const n2 = "tekanan" in isi ? isi : null; // Node 2 dikenali dari kolom tekanan (kontrak 1.2), seperti di gudang.ts
  const n1 = "tekanan" in isi ? null : isi; // selain itu, telemetry Node 1
  await catatPerangkat(deviceId, n2 ? "node2" : "node1", null);
  const hasil = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, suhu, kelembapan, cahaya, tanah, gerak, level_air,
                           tekanan, suhu_tanah, baterai, tanah_rs485, ec)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.fw, isi.suhu, isi.kelembapan, n1?.cahaya ?? null, isi.tanah, n1?.gerak ?? null,
      n1?.level_air ?? null, n2?.tekanan ?? null, isi.suhu_tanah ?? null, n2?.baterai ?? null,
      n1?.tanah_rs485 ?? null, n1?.ec ?? null],
  );
  return hasil.rowCount === 1;
}

export async function arsipkanStatus(deviceId: string, status: Status): Promise<void> {
  await catatPerangkat(deviceId, null, status);
}

export async function arsipkanVitals(deviceId: string, isi: Vitals): Promise<void> {
  await catatPerangkat(deviceId, null, null);
  await pool.query(
    `INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [deviceId, isi.ts, isi.rssi, isi.uptime_s, isi.heap_free],
  );
}

// Apakah database bisa dihubungi sekarang? Dipakai GET /health.
export async function databaseHidup(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
