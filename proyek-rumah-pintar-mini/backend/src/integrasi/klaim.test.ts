// klaim.test.ts - tes INTEGRASI kode klaim sekali pakai (Modul 28) dengan tabel kode_klaim dan devices SUNGGUHAN (Modul 29).
// Yang tidak bisa diuji tiruan: penukaran kode dalam SATU transaksi (SELECT ... FOR UPDATE, daftarkan, tandai terpakai), batas
// waktu kode menurut jam database (kedaluwarsa > now()), dan ON CONFLICT yang menolak merebut perangkat yang masih aktif.
// Rute klaim dibatasi 10 percobaan per menit per alamat: berkas ini memakai 5.
// Jalankan (database uji menyala, DATABASE_URL_UJI terisi; lihat siapkan.ts): npm run test:integrasi
import { createHash } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hashKodeKlaim, rapikanKodeKlaim } from "../auth/kode-klaim.ts"; // fungsi murni (tanpa setelan), aman diimpor di sini
import { adaDatabaseUji, hapusPerangkatUji, siapkanUji } from "./siapkan.ts";
import type { Uji } from "./siapkan.ts";

// nama kode dan device_id milik berkas ini saja (awalan 2905)
const AWALAN = "uji-integrasi klaim";
const BARU = "290500000001";
const PEMILIK = "290500000002";
const PEREBUT = "290500000003";
const TERLAMBAT = "290500000004";
const SEMUA = [BARU, PEMILIK, PEREBUT, TERLAMBAT];
const sidikKode = (kode: string) => hashKodeKlaim(rapikanKodeKlaim(kode) ?? "");

describe.skipIf(!adaDatabaseUji)("integrasi (database uji): kode klaim", () => {
  let uji: Uji;
  // admin membuat kode (berlaku 5 menit); kodenya hanya tampil di jawaban ini
  const buatKode = async (nama: string) => {
    const jawab = await uji.app.inject({ method: "POST", url: "/provision/kode", cookies: uji.gelang("admin"),
      payload: { nama, menit: 5 } });
    expect(jawab.statusCode).toBe(201);
    return (jawab.json() as { kode: string }).kode;
  };
  // perangkat menukar kode dengan kuncinya: tanpa login (perangkat tidak punya akun dashboard)
  const klaim = (kode: string, deviceId: string) =>
    uji.app.inject({ method: "POST", url: "/provision/klaim", payload: { kode, device_id: deviceId } });
  const jumlahPerangkat = async (id: string) =>
    (await uji.pool.query("SELECT 1 FROM devices WHERE device_id = $1", [id])).rowCount;
  const bersihkan = async () => {
    await hapusPerangkatUji(uji.pool, SEMUA); // juga kode yang sudah dipakai perangkat itu
    await uji.pool.query("DELETE FROM kode_klaim WHERE nama LIKE $1", [`${AWALAN}%`]); // kode yang belum dipakai
  };

  beforeAll(async () => { uji = await siapkanUji(); }, 60_000); // migrasi bisa menunggu giliran berkas lain
  beforeEach(() => bersihkan());
  afterAll(async () => {
    if (!uji) return; // siapkanUji() gagal: galatnya sudah dilaporkan
    await bersihkan();
    await uji.tutup();
  });

  it("kode ditukar perangkat: terdaftar dengan sidik kuncinya, kode tercatat dipakai, database tidak menyimpan kodenya", async () => {
    const kode = await buatKode(`${AWALAN} 1`);
    const simpan = await uji.pool.query("SELECT kode_hash, dipakai FROM kode_klaim WHERE nama = $1", [`${AWALAN} 1`]);
    expect(simpan.rows).toEqual([{ kode_hash: sidikKode(kode), dipakai: null }]); // sidik jarinya saja

    // diketik manusia di portal: huruf kecil dan spasi tetap sah (rapikanKodeKlaim)
    const jawab = await klaim(kode.toLowerCase().replace("-", " "), BARU);
    expect(jawab.statusCode).toBe(201);
    const { kunci } = jawab.json() as { kunci: string };

    const perangkat = await uji.pool.query("SELECT nama, kunci_hash FROM devices WHERE device_id = $1", [BARU]);
    expect(perangkat.rows).toEqual([{ nama: `${AWALAN} 1`, kunci_hash: createHash("sha256").update(kunci).digest("hex") }]);
    const dipakai = await uji.pool.query<{ dipakai: Date | null; device_id: string | null }>(
      "SELECT dipakai, device_id FROM kode_klaim WHERE nama = $1", [`${AWALAN} 1`]);
    expect(dipakai.rows[0].device_id).toBe(BARU);
    expect(dipakai.rows[0].dipakai).toBeInstanceOf(Date);
  });

  it("kode yang sudah dipakai ditolak 403; perangkat yang masih aktif tidak bisa direbut kode baru (409), kode itu tidak hangus", async () => {
    const kode = await buatKode(`${AWALAN} 2`);
    expect((await klaim(kode, PEMILIK)).statusCode).toBe(201);

    const ulang = await klaim(kode, PEREBUT); // kode yang sama, perangkat lain
    expect(ulang.statusCode).toBe(403);
    expect(await jumlahPerangkat(PEREBUT)).toBe(0);

    const kodeBaru = await buatKode(`${AWALAN} 2b`);
    const rebut = await klaim(kodeBaru, PEMILIK); // PEMILIK masih terdaftar dan aktif
    expect(rebut.statusCode).toBe(409);
    const sisa = await uji.pool.query("SELECT dipakai FROM kode_klaim WHERE nama = $1", [`${AWALAN} 2b`]);
    expect(sisa.rows).toEqual([{ dipakai: null }]); // tidak ada yang berubah: kode masih bisa dipakai perangkat lain
  });

  it("kode kedaluwarsa (waktunya dimundurkan langsung di database uji) ditolak 403 dan perangkat tidak terdaftar", async () => {
    const kode = await buatKode(`${AWALAN} 3`);
    // seolah kode dibuat 40 menit lalu dan habis 10 menit lalu (CHECK di migrasi 011: masa berlaku paling lama 60 menit)
    await uji.pool.query("UPDATE kode_klaim SET dibuat = now() - interval '40 minutes', kedaluwarsa = now() - interval '10 minutes' "
      + "WHERE kode_hash = $1", [sidikKode(kode)]);

    const jawab = await klaim(kode, TERLAMBAT);
    expect(jawab.statusCode).toBe(403);
    expect(await jumlahPerangkat(TERLAMBAT)).toBe(0);
    const daftar = await uji.app.inject({ method: "GET", url: "/provision/kode", cookies: uji.gelang("admin") });
    expect((daftar.json() as { nama: string | null; keadaan: string }[]).find((k) => k.nama === `${AWALAN} 3`))
      .toMatchObject({ keadaan: "kedaluwarsa" });
  });
});
