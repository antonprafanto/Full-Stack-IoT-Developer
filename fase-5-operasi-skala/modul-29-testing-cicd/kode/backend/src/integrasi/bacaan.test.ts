// bacaan.test.ts - tes INTEGRASI riwayat bacaan (Modul 17-18) di hypertable readings TimescaleDB SUNGGUHAN (Modul 29).
// Yang tidak bisa diuji tabel tiruan: urutan dan batas waktu dari SQL (ORDER BY ts, ts >= ... AND ts < ...), fungsi
// time_bucket() milik TimescaleDB untuk ringkasan per 15 menit, dan PRIMARY KEY (device_id, ts) + ON CONFLICT DO NOTHING yang
// membuang kiriman ganda.
// Jalankan (database uji menyala, DATABASE_URL_UJI terisi; lihat siapkan.ts): npm run test:integrasi
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { adaDatabaseUji, hapusPerangkatUji, siapkanUji } from "./siapkan.ts";
import type { Uji } from "./siapkan.ts";

// device_id milik berkas ini saja (awalan 2902)
const SATU = "290200000001";
const TETANGGA = "290200000002";
const GANDA = "290200000003";
const SEMUA = [SATU, TETANGGA, GANDA];
const MENIT = 60_000;

describe.skipIf(!adaDatabaseUji)("integrasi (database uji): riwayat bacaan", () => {
  let uji: Uji;
  // bacaan cukup punya perangkat di tabel devices (kunci asing readings -> devices); tidak perlu didaftarkan lewat API
  const adakanPerangkat = (id: string) => uji.pool.query("INSERT INTO devices (device_id) VALUES ($1)", [id]);
  const simpanBacaan = (id: string, ts: Date, suhu: number) =>
    uji.pool.query("INSERT INTO readings (device_id, ts, fw, suhu, kelembapan) VALUES ($1, $2, '1.7.0', $3, 60)", [id, ts, suhu]);

  beforeAll(async () => { uji = await siapkanUji(); }, 60_000); // migrasi bisa menunggu giliran berkas lain
  beforeEach(() => hapusPerangkatUji(uji.pool, SEMUA));
  afterAll(async () => {
    if (!uji) return; // siapkanUji() gagal: galatnya sudah dilaporkan
    await hapusPerangkatUji(uji.pool, SEMUA);
    await uji.tutup();
  });

  it("GET /devices/:id/readings: hanya bacaan 1 jam terakhir, urut waktu (terlama lebih dulu)", async () => {
    await adakanPerangkat(SATU);
    const sekarang = Date.now();
    // disimpan ACAK urutannya: urutan di jawaban harus datang dari ORDER BY ts, bukan dari urutan simpan
    await simpanBacaan(SATU, new Date(sekarang - 10 * MENIT), 23.5);
    await simpanBacaan(SATU, new Date(sekarang - 50 * MENIT), 21.5);
    await simpanBacaan(SATU, new Date(sekarang - 30 * MENIT), 22.5);
    await simpanBacaan(SATU, new Date(sekarang - 180 * MENIT), 99); // 3 jam lalu: di luar rentang bawaan (1 jam)

    const jawab = await uji.app.inject({ method: "GET", url: `/devices/${SATU}/readings`, cookies: uji.gelang("viewer") });
    expect(jawab.statusCode).toBe(200);
    const isi = jawab.json() as { jumlah: number; terpotong: boolean; bacaan: { suhu: number | null }[] };
    expect(isi.jumlah).toBe(3);
    expect(isi.terpotong).toBe(false);
    expect(isi.bacaan.map((b) => b.suhu)).toEqual([21.5, 22.5, 23.5]);
  });

  it("ringkasan per 15 menit (time_bucket TimescaleDB): hanya bacaan perangkat itu yang dihitung", async () => {
    await adakanPerangkat(SATU);
    await adakanPerangkat(TETANGGA);
    // awal satu ember 15 menit, dua jam lalu (dibulatkan ke bawah ke kelipatan 15 menit)
    const awal = Math.floor((Date.now() - 120 * MENIT) / (15 * MENIT)) * (15 * MENIT);
    await simpanBacaan(SATU, new Date(awal + 1 * MENIT), 20);
    await simpanBacaan(SATU, new Date(awal + 4 * MENIT), 22);
    await simpanBacaan(SATU, new Date(awal + 7 * MENIT), 24);
    await simpanBacaan(TETANGGA, new Date(awal + 2 * MENIT), 90); // perangkat lain di ember yang sama: tidak boleh ikut
    await simpanBacaan(TETANGGA, new Date(awal + 5 * MENIT), 95);

    const rentang = new URLSearchParams({ bucket: "15m", from: new Date(awal).toISOString(),
      to: new Date(awal + 15 * MENIT).toISOString() });
    const jawab = await uji.app.inject({ method: "GET", url: `/devices/${SATU}/readings?${rentang}`,
      cookies: uji.gelang("viewer") });
    expect(jawab.statusCode).toBe(200);
    const isi = jawab.json() as { ringkasan: Record<string, unknown>[] };
    expect(isi.ringkasan).toEqual([{
      waktu: new Date(awal).toISOString().slice(0, 19) + "Z", // format kontrak: UTC tanpa milidetik
      suhu_rata: 22, suhu_min: 20, suhu_maks: 24, kelembapan_rata: 60, tanah_rata: null, cahaya_rata: null, jumlah_bacaan: 3,
    }]);
  });

  it("kiriman ganda: telemetry yang sama dua kali (ts sama) tersimpan satu baris (PRIMARY KEY + ON CONFLICT)", async () => {
    await adakanPerangkat(GANDA);
    // fungsi yang dipanggil mqtt.ts untuk setiap telemetry yang lolos kontrak (diimpor sesudah siapkanUji mengisi setelan)
    const { arsipkanTelemetry } = await import("../db/arsip.ts");
    const telemetry = { ts: new Date(Date.now() - 5 * MENIT).toISOString().slice(0, 19) + "Z", fw: "1.7.0", suhu: 27.5,
      kelembapan: 61, cahaya: 900, tanah: 40, gerak: false, level_air: 80 };

    expect(await arsipkanTelemetry(GANDA, telemetry)).toBe(true); // pertama: tersimpan
    expect(await arsipkanTelemetry(GANDA, telemetry)).toBe(false); // kedua (QoS 1 boleh mengirim ulang): dilewati, tanpa galat
    const baris = await uji.pool.query("SELECT suhu, kelembapan, cahaya FROM readings WHERE device_id = $1", [GANDA]);
    expect(baris.rows).toEqual([{ suhu: 27.5, kelembapan: 61, cahaya: 900 }]);
    // telemetry juga memperbarui baris perangkatnya: jenis dikenali dari isinya, waktu terakhir terdengar terisi
    const perangkat = await uji.pool.query<{ jenis: string; terakhir_dilihat: Date | null }>(
      "SELECT jenis, terakhir_dilihat FROM devices WHERE device_id = $1", [GANDA]);
    expect(perangkat.rows[0].jenis).toBe("node1");
    expect(perangkat.rows[0].terakhir_dilihat).toBeInstanceOf(Date);
  });
});
