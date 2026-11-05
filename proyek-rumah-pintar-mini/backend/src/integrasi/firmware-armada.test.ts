// firmware-armada.test.ts - tes INTEGRASI rilis firmware dan halaman /armada (Modul 28) dengan database uji SUNGGUHAN dan folder
// firmware sementara (Modul 29). Yang tidak bisa diuji tiruan: metadata rilis di tabel firmware (PRIMARY KEY jenis + versi:
// versi tidak bisa ditimpa), unduhan berkunci yang mencocokkan kunci perangkat dengan sidik di tabel devices, tanda rilis uji
// dan rilis ditarik, serta kueri LATERAL halaman /armada (kesehatan TERAKHIR dan pembaruan terakhir setiap perangkat).
// Berkas .bin di sini tiruan: 4 KiB acak dengan bait pertama 0xE9 (server hanya memeriksa bait itu dan ukurannya).
// Jalankan (database uji menyala, DATABASE_URL_UJI terisi; lihat siapkan.ts): npm run test:integrasi
import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { adaDatabaseUji, daftarkanPerangkat, hapusPerangkatUji, siapkanUji } from "./siapkan.ts";
import type { Uji } from "./siapkan.ts";

// device_id dan versi firmware milik berkas ini saja (awalan 2906 dan 29.6.x)
const PENGUNDUH = "290600000001";
const ANGGOTA = "290600000002";
const SEMUA = [PENGUNDUH, ANGGOTA];
const sha256 = (isi: Buffer) => createHash("sha256").update(isi).digest("hex");

function binTiruan(): Buffer {
  const isi = randomBytes(4096);
  isi[0] = 0xe9; // tanda citra aplikasi ESP32
  return isi;
}

describe.skipIf(!adaDatabaseUji)("integrasi (database uji): rilis firmware dan armada", () => {
  let uji: Uji;
  const unggah = (versi: string, isi: Buffer, rilisUji = false) => uji.app.inject({ method: "POST",
    url: `/firmware/node1/${versi}${rilisUji ? "?uji=true" : ""}`, cookies: uji.gelang("admin"),
    headers: { "content-type": "application/octet-stream" }, payload: isi });
  const bersihkan = async () => {
    await hapusPerangkatUji(uji.pool, SEMUA); // juga baris pembaruan yang menunjuk rilis di bawah
    await uji.pool.query("DELETE FROM firmware WHERE versi LIKE '29.6.%'");
  };

  beforeAll(async () => { uji = await siapkanUji(); }, 60_000); // migrasi bisa menunggu giliran berkas lain
  beforeEach(async () => {
    await bersihkan();
    // Dua tes di bawah menilai "rilis terbaru" dari SEMUA baris tabel firmware: rilis lain di database uji (misalnya sisa
    // mencoba unggah firmware) membuat hasilnya salah. Berhenti dengan pesan jelas, bukan AssertionError yang membingungkan.
    const lain = await uji.pool.query<{ versi: string }>("SELECT versi FROM firmware WHERE versi NOT LIKE '29.6.%'");
    if (lain.rowCount) {
      throw new Error(`tabel firmware di database uji berisi rilis lain (${lain.rows.map((r) => r.versi).join(", ")}): `
        + "tes ini butuh tabel firmware tanpa rilis lain. Pakai database uji yang baru (nyalakan ulang kontainernya).");
    }
  });
  afterAll(async () => {
    if (!uji) return; // siapkanUji() gagal: galatnya sudah dilaporkan
    await bersihkan();
    await uji.tutup();
  });

  it("unggah: metadata (ukuran, SHA-256 hitungan server) tersimpan, versi tidak bisa ditimpa, perangkat mengunduh dengan kuncinya", async () => {
    const isi = binTiruan();
    expect((await unggah("29.6.1", isi)).statusCode).toBe(201);
    const baris = await uji.pool.query("SELECT ukuran, sha256, uji, pengunggah, ditarik FROM firmware WHERE versi = '29.6.1'");
    expect(baris.rows).toEqual([{ ukuran: 4096, sha256: sha256(isi), uji: false, pengunggah: "1", ditarik: null }]);
    expect((await readFile(join(uji.folderFirmware, "node-1", "29.6.1.bin"))).equals(isi)).toBe(true); // berkas di lemari
    expect((await unggah("29.6.1", binTiruan())).statusCode).toBe(409); // isi lain, versi sama: ditolak

    // unduhan perangkat: Basic Auth device_id:kunci (dicocokkan dengan sidik di tabel devices) + MAC WiFi-nya
    const kunci = await daftarkanPerangkat(uji, PENGUNDUH);
    const unduh = (kunciDibawa: string) => uji.app.inject({ method: "GET", url: "/fw/node-1/29.6.1.bin", headers: {
      authorization: `Basic ${Buffer.from(`${PENGUNDUH}:${kunciDibawa}`).toString("base64")}`,
      "x-esp32-sta-mac": "29:06:00:00:00:01" } });
    const berhasil = await unduh(kunci);
    expect(berhasil.statusCode).toBe(200);
    expect(berhasil.headers["x-sha256"]).toBe(sha256(isi));
    expect(berhasil.rawPayload.equals(isi)).toBe(true);
    const kunciPalsu = kunci.slice(0, -1) + (kunci.endsWith("A") ? "B" : "A"); // huruf terakhir diganti: satu huruf beda
    expect((await unduh(kunciPalsu)).statusCode).toBe(403);
  });

  it("rilis uji tersimpan bertanda uji dan tidak pernah menjadi rilis terbaru; rilis yang ditarik keluar dari hitungan", async () => {
    expect((await unggah("29.6.2", binTiruan())).statusCode).toBe(201);
    expect((await unggah("29.6.3", binTiruan(), true)).statusCode).toBe(201); // lebih tinggi, tetapi rilis UJI
    const tanda = await uji.pool.query("SELECT versi, uji FROM firmware WHERE versi LIKE '29.6.%' ORDER BY versi");
    expect(tanda.rows).toEqual([{ versi: "29.6.2", uji: false }, { versi: "29.6.3", uji: true }]);

    type Daftar = { terbaru: { node1: string | null }; rilis: { versi: string; boleh_semua: boolean; alasan_semua: string | null }[] };
    const daftar = async () => (await uji.app.inject({ method: "GET", url: "/firmware", cookies: uji.gelang("viewer") })).json() as Daftar;
    const sebelum = await daftar();
    expect(sebelum.terbaru.node1).toBe("29.6.2");
    expect(sebelum.rilis.find((r) => r.versi === "29.6.3"))
      .toMatchObject({ boleh_semua: false, alasan_semua: "rilis uji: hanya per perangkat" });

    const tarik = await uji.app.inject({ method: "POST", url: "/firmware/node1/29.6.2/tarik", cookies: uji.gelang("admin") });
    expect(tarik.statusCode).toBe(200);
    const ditarik = await uji.pool.query<{ ditarik: Date | null }>("SELECT ditarik FROM firmware WHERE versi = '29.6.2'");
    expect(ditarik.rows[0].ditarik).toBeInstanceOf(Date);
    expect((await daftar()).terbaru.node1).toBeNull(); // tinggal rilis uji: tidak ada rilis terbaru
  });

  it("GET /armada: perangkat tampil dengan kesehatan TERAKHIR dan pembaruan terakhirnya (LATERAL), perlu_update dari rilis terbaru", async () => {
    await daftarkanPerangkat(uji, ANGGOTA, "Node armada uji");
    // seolah perangkat sudah berjalan: melaporkan versi 29.5.0, dua kali mengirim vitals, dan pernah gagal memasang 29.6.4
    await uji.pool.query("UPDATE devices SET jenis = 'node1', fw = '29.5.0', fw_dilihat = now() WHERE device_id = $1", [ANGGOTA]);
    await uji.pool.query(`INSERT INTO device_health (device_id, ts, rssi, uptime_s, heap_free, reset_reason, fw) VALUES
      ($1, now() - interval '20 minutes', -70, 600, 150000, 'POWERON', '29.5.0'),
      ($1, now() - interval '2 minutes', -55, 1680, 148000, 'POWERON', '29.5.0')`, [ANGGOTA]);
    expect((await unggah("29.6.4", binTiruan())).statusCode).toBe(201);
    await uji.pool.query(`INSERT INTO pembaruan (id, device_id, dari_versi, ke_versi, status, pesan, selesai)
      VALUES ('c-uji-290600000002', $1, '29.5.0', '29.6.4', 'rollback', 'masa uji gagal', now())`, [ANGGOTA]);

    const jawab = await uji.app.inject({ method: "GET", url: "/armada", cookies: uji.gelang("viewer") });
    expect(jawab.statusCode).toBe(200);
    const isi = jawab.json() as { rilis_terbaru: { node1: string | null }; perangkat: { device_id: string }[] };
    expect(isi.rilis_terbaru.node1).toBe("29.6.4");
    expect(isi.perangkat.find((p) => p.device_id === ANGGOTA)).toMatchObject({
      nama: "Node armada uji", kunci: "aktif", fw: "29.5.0", perlu_update: true,
      kesehatan: { rssi: -55, uptime_s: 1680, reset_reason: "POWERON" }, // baris 2 menit lalu, bukan 20 menit lalu
      pembaruan: { status: "rollback", dari: "29.5.0", ke: "29.6.4", pesan: "masa uji gagal" },
    });
  });
});
