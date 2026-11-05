// perangkat.test.ts - tes INTEGRASI daftar resmi perangkat (Modul 21 + 28) dengan database uji SUNGGUHAN (Modul 29).
// Bedanya dengan routes/perangkat.test.ts: di sana tabel devices diganti tiruan di memori (vi.mock), jadi kueri SQL di
// src/db/perangkat.ts tidak pernah dijalankan. Di sini INSERT, UPDATE, transaksi, CHECK, dan kunci asing benar-benar diperiksa
// PostgreSQL. Contoh nyata: kalau src/db/perangkat.ts suatu hari salah menulis sidik kunci (misalnya upper($5), huruf besar),
// 203 tes tiruan tetap hijau, tetapi CHECK (kunci_hash ~ '^[0-9a-f]{64}$') di migrasi 010 menolak barisnya: POST /devices
// dijawab 503 dan tes pertama di bawah merah.
// Jalankan (database uji menyala, DATABASE_URL_UJI terisi; lihat siapkan.ts): npm run test:integrasi
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { adaDatabaseUji, daftarkanPerangkat, hapusPerangkatUji, siapkanUji } from "./siapkan.ts";
import type { Uji } from "./siapkan.ts";

// device_id milik berkas ini saja (awalan 2901): berkas tes integrasi lain berjalan bersamaan dengan ID-nya sendiri
const BARU = "290100000001";
const GANDA = "290100000002";
const DAFTAR = "290100000003";
const CABUT = "290100000004";
const SEMUA = [BARU, GANDA, DAFTAR, CABUT];
const sidik = (kunci: string) => createHash("sha256").update(kunci).digest("hex"); // dihitung sendiri, bukan oleh kode server
// versi server dibaca sendiri dari package.json (bukan dari src/config/versi-server.ts yang sedang diuji)
const VERSI = (JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { version: string }).version;

describe.skipIf(!adaDatabaseUji)("integrasi (database uji): perangkat", () => {
  let uji: Uji;
  beforeAll(async () => { uji = await siapkanUji(); }, 60_000); // migrasi bisa menunggu giliran berkas lain
  beforeEach(() => hapusPerangkatUji(uji.pool, SEMUA)); // setiap tes mulai tanpa perangkat milik berkas ini
  afterAll(async () => {
    if (!uji) return; // siapkanUji() gagal (misalnya pengaman _uji menolak): galatnya sudah dilaporkan
    await hapusPerangkatUji(uji.pool, SEMUA);
    await uji.tutup();
  });

  it("POST /devices: kunci tampil sekali, database hanya menyimpan sidik SHA-256-nya (CHECK kunci_hash)", async () => {
    const jawab = await uji.app.inject({ method: "POST", url: "/devices", cookies: uji.gelang("admin"),
      payload: { device_id: BARU, nama: "Uji integrasi", lokasi: "lab robot" } });
    expect(jawab.statusCode).toBe(201);
    const { kunci } = jawab.json() as { kunci: string };
    expect(kunci).toMatch(/^[A-Za-z0-9_-]{43}$/);

    // baca langsung dari tabel: yang tersimpan sidik jarinya (64 heksadesimal huruf kecil), bukan kuncinya
    const baris = await uji.pool.query<{ kunci_hash: string; nama: string; terdaftar: Date | null }>(
      "SELECT kunci_hash, nama, terdaftar FROM devices WHERE device_id = $1", [BARU]);
    expect(baris.rowCount).toBe(1);
    expect(baris.rows[0].kunci_hash).toBe(sidik(kunci));
    expect(baris.rows[0].kunci_hash).not.toContain(kunci);
    expect(baris.rows[0].nama).toBe("Uji integrasi");
    expect(baris.rows[0].terdaftar).toBeInstanceOf(Date);
  });

  it("daftar ulang device_id yang sama: 409, nama dan sidik kunci di database tidak berubah", async () => {
    const kunci = await daftarkanPerangkat(uji, GANDA, "Node asli");
    const lagi = await uji.app.inject({ method: "POST", url: "/devices", cookies: uji.gelang("admin"),
      payload: { device_id: GANDA, nama: "Node penyusup" } });
    expect(lagi.statusCode).toBe(409);

    // ON CONFLICT ... WHERE terdaftar IS NULL: baris yang sudah terdaftar tidak boleh ditimpa
    const baris = await uji.pool.query("SELECT nama, kunci_hash FROM devices WHERE device_id = $1", [GANDA]);
    expect(baris.rows).toEqual([{ nama: "Node asli", kunci_hash: sidik(kunci) }]);
  });

  it("GET /devices dari database tanpa membocorkan kunci; tanpa login 401; /health menyebut versi dan database", async () => {
    const kunci = await daftarkanPerangkat(uji, DAFTAR, "Node daftar");
    const jawab = await uji.app.inject({ method: "GET", url: "/devices", cookies: uji.gelang("viewer") }); // viewer boleh melihat
    expect(jawab.statusCode).toBe(200);

    const daftar = jawab.json() as { device_id: string; nama: string | null; kunci: string }[];
    expect(daftar.find((p) => p.device_id === DAFTAR)).toMatchObject({ nama: "Node daftar", kunci: "aktif" });
    expect(jawab.body).not.toContain(kunci);
    expect(jawab.body).not.toContain(sidik(kunci));
    expect(jawab.body).not.toContain("kunci_hash");

    // rakitan produksi (buatApp) ikut dijaga: satpam login terpasang, dan /health (bukti versi di VPS/Pi) menyebut versi
    // package.json serta database yang tersambung
    expect((await uji.app.inject({ method: "GET", url: "/devices" })).statusCode).toBe(401);
    const sehat = await uji.app.inject({ method: "GET", url: "/health" });
    expect(sehat.statusCode).toBe(200);
    expect(sehat.json()).toMatchObject({ ok: true, versi: VERSI, database: true });
  });

  it("cabut (Nonaktifkan): sidik kunci dihapus, waktu cabut dan status offline tertulis, kejadian masuk tabel events", async () => {
    await daftarkanPerangkat(uji, CABUT);
    const jawab = await uji.app.inject({ method: "POST", url: `/devices/${CABUT}/cabut`, cookies: uji.gelang("admin") });
    expect(jawab.statusCode).toBe(200);

    const baris = await uji.pool.query<{ kunci_hash: string | null; dicabut: Date | null; status: string }>(
      "SELECT kunci_hash, dicabut, status FROM devices WHERE device_id = $1", [CABUT]);
    expect(baris.rows[0]).toMatchObject({ kunci_hash: null, status: "offline" });
    expect(baris.rows[0].dicabut).toBeInstanceOf(Date);
    // buku kejadian ditulis rute tanpa ditunggu (catatKejadian), jadi barisnya ditunggu sebentar (paling lama 1 detik)
    await vi.waitFor(async () => {
      const kejadian = await uji.pool.query("SELECT jenis, sumber FROM events WHERE device_id = $1", [CABUT]);
      expect(kejadian.rows).toEqual([{ jenis: "dicabut", sumber: "api" }]);
    });

    const lagi = await uji.app.inject({ method: "POST", url: `/devices/${CABUT}/cabut`, cookies: uji.gelang("admin") });
    expect(lagi.statusCode).toBe(404); // sudah dicabut: tidak ada yang berubah lagi
  });
});
