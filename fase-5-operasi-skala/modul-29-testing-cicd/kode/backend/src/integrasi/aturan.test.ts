// aturan.test.ts - tes INTEGRASI aturan otomatis (Modul 19 + 24) dengan tabel rules dan events SUNGGUHAN (Modul 29).
// Yang tidak bisa diuji tiruan: kondisi dan aksi tersimpan sebagai JSONB, kolom diubah maju saat aturan diganti, dan kunci
// asing events.aturan_id ON DELETE SET NULL (migrasi 007): aturan dihapus, buku kejadiannya tetap ada.
// Jalankan (database uji menyala, DATABASE_URL_UJI terisi; lihat siapkan.ts): npm run test:integrasi
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { adaDatabaseUji, siapkanUji, tungguKueriSelesai } from "./siapkan.ts";
import type { Uji } from "./siapkan.ts";

// nama aturan milik berkas ini saja (awalan yang sama dipakai bersih-bersih). device_id hanya disimpan di dalam JSON aturan;
// perangkatnya tidak harus ada di tabel devices.
const AWALAN = "uji-integrasi aturan";
const PERANGKAT = "290400000001";

// "kipas menyala kalau suhu di atas <nyala> °C selama 60 detik, padam lagi di bawah <nyala - 2> °C"
function aturanKipas(nama: string, nyala = 30, aktif = true) {
  return {
    nama, aktif,
    kondisi: { jenis: "ambang", device_id: PERANGKAT, besaran: "suhu", nyala_di_atas: nyala, padam_di_bawah: nyala - 2,
      selama_detik: 60 },
    aksi: { jenis: "sakelar", device_id: PERANGKAT, target: "kipas", kabari: false },
  };
}

describe.skipIf(!adaDatabaseUji)("integrasi (database uji): aturan otomatis", () => {
  let uji: Uji;
  const buat = (isi: object) => uji.app.inject({ method: "POST", url: "/rules", cookies: uji.gelang("admin"), payload: isi });
  const bersihkan = async () => {
    await tungguKueriSelesai(uji.pool); // kejadian dari tes sebelumnya mungkin masih ditulis
    await uji.pool.query("DELETE FROM events WHERE data->>'nama' LIKE $1", [`${AWALAN}%`]); // kejadian "aturan-diubah"
    await uji.pool.query("DELETE FROM rules WHERE nama LIKE $1", [`${AWALAN}%`]);
  };

  beforeAll(async () => { uji = await siapkanUji(); }, 60_000); // migrasi bisa menunggu giliran berkas lain
  beforeEach(() => bersihkan());
  afterAll(async () => {
    if (!uji) return; // siapkanUji() gagal: galatnya sudah dilaporkan
    await bersihkan();
    await uji.tutup();
  });

  it("POST /rules: aturan tersimpan di tabel rules (JSONB) dan langsung tampil; isi tidak sah ditolak 400 tanpa baris baru", async () => {
    const jawab = await buat(aturanKipas(`${AWALAN} 1`));
    expect(jawab.statusCode).toBe(201);
    const { id } = jawab.json() as { id: number };

    const baris = await uji.pool.query("SELECT nama, aktif, kondisi, aksi FROM rules WHERE id = $1", [id]);
    expect(baris.rows).toEqual([aturanKipas(`${AWALAN} 1`)]); // JSONB dibaca kembali sebagai objek yang sama persis
    const daftar = await uji.app.inject({ method: "GET", url: "/rules", cookies: uji.gelang("viewer") });
    expect((daftar.json() as { id: number }[]).map((a) => a.id)).toContain(id);

    // histeresis terbalik (padam di atas nyala): ditolak skema Zod sebelum menyentuh database
    const salah = await buat({ ...aturanKipas(`${AWALAN} salah`), kondisi: { ...aturanKipas("").kondisi, padam_di_bawah: 35 } });
    expect(salah.statusCode).toBe(400);
    expect((await uji.pool.query("SELECT 1 FROM rules WHERE nama = $1", [`${AWALAN} salah`])).rowCount).toBe(0);
  });

  it("PUT /rules/:id: isi diganti di database dan kolom diubah maju; nomor yang tidak ada dijawab 404", async () => {
    const { id } = (await buat(aturanKipas(`${AWALAN} 2`))).json() as { id: number };
    const ganti = await uji.app.inject({ method: "PUT", url: `/rules/${id}`, cookies: uji.gelang("admin"),
      payload: aturanKipas(`${AWALAN} 2 diganti`, 32, false) });
    expect(ganti.statusCode).toBe(200);

    // "diubah maju" dibandingkan di dalam database (mikrodetik): Date di JavaScript hanya sampai milidetik, jadi INSERT dan
    // UPDATE di milidetik yang sama di komputer cepat akan tampak sama
    const baris = await uji.pool.query<{ nama: string; aktif: boolean; nyala: number; maju: boolean }>(
      "SELECT nama, aktif, (kondisi->>'nyala_di_atas')::int AS nyala, diubah > dibuat AS maju FROM rules WHERE id = $1", [id]);
    expect(baris.rows[0]).toEqual({ nama: `${AWALAN} 2 diganti`, aktif: false, nyala: 32, maju: true });

    const tidakAda = await uji.app.inject({ method: "PUT", url: "/rules/2147483647", cookies: uji.gelang("admin"),
      payload: aturanKipas(`${AWALAN} hantu`) });
    expect(tidakAda.statusCode).toBe(404);
  });

  it("DELETE /rules/:id: aturan hilang dari database, buku kejadiannya tetap (aturan_id menjadi NULL)", async () => {
    const { id } = (await buat(aturanKipas(`${AWALAN} 3`))).json() as { id: number };
    // membuat aturan menulis satu kejadian "aturan-diubah" yang menunjuk aturan itu (ditulis tanpa ditunggu rute)
    let nomorKejadian = 0;
    await vi.waitFor(async () => {
      const kejadian = await uji.pool.query<{ id: string }>("SELECT id FROM events WHERE aturan_id = $1", [id]);
      expect(kejadian.rowCount).toBe(1);
      nomorKejadian = Number(kejadian.rows[0].id);
    });

    const hapus = await uji.app.inject({ method: "DELETE", url: `/rules/${id}`, cookies: uji.gelang("admin") });
    expect(hapus.statusCode).toBe(200);
    expect((await uji.pool.query("SELECT 1 FROM rules WHERE id = $1", [id])).rowCount).toBe(0);
    // kunci asing ON DELETE SET NULL: kejadian lama tetap ada, hanya penunjuk aturannya yang dikosongkan
    const lama = await uji.pool.query("SELECT jenis, aturan_id FROM events WHERE id = $1", [nomorKejadian]);
    expect(lama.rows).toEqual([{ jenis: "aturan-diubah", aturan_id: null }]);
  });
});
