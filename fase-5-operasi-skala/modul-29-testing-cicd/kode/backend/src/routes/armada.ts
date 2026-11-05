// armada.ts - rute halaman /armada (Modul 28): daftar perangkat beserta versi firmware, kesehatan, dan pembaruan terakhirnya;
// perintah pembaruan untuk satu perangkat, untuk perangkat canary, atau untuk semua; tanda canary; dan jeda vitals.
// Semua peran boleh MELIHAT (GET); tombol yang mengubah sesuatu khusus admin (satpam keamanan.ts menjawab 403 untuk viewer).
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { env } from "../config/env.ts";
import { DeviceId } from "../schemas/kontrak.ts";
import { dataArmada, riwayatPembaruan, semuaRilis, ubahCanary, ubahJedaVitals } from "../db/armada.ts";
import type { BarisArmada, BarisPembaruan } from "../db/armada.ts";
import { waktuKontrak } from "../db/arsip.ts";
import { cariPerangkat } from "../services/gudang.ts";
import { alasanTidakBisa, mintaUpdate, perbaruiArmada } from "../services/ota.ts";
import type { HasilUpdate } from "../services/ota.ts";
import { aturJedaVitals, kirimConfigUntuk } from "../services/otomasi.ts";
import { tempatAkun } from "../services/akun-broker.ts";
import { POLA_VERSI_RILIS, bandingkanVersi, versiTertinggi } from "../services/versi.ts";

const Galat = z.object({ pesan: z.string() });
const Versi = z.string().regex(POLA_VERSI_RILIS, "versi harus berbentuk x.y.z tanpa nol di depan, misalnya 1.7.1");
const ParamId = z.object({ id: DeviceId.describe("device_id perangkat, misalnya a4cf12e5b7c0") });
const SALAH_DATABASE = "database sedang tidak bisa dihubungi, coba lagi sebentar lagi";
const iso = (w: Date | null) => (w === null ? null : waktuKontrak(w));

const Pembaruan = z.object({
  id: z.string().describe("id perintah update"),
  status: z.string().describe("dikirim, diterima, mengunduh, ditolak, berhasil, rollback, gagal, atau kedaluwarsa"),
  dari: z.string().nullable(),
  ke: z.string(),
  pesan: z.string().nullable(),
  dibuat: z.string(),
  diperbarui: z.string(),
  selesai: z.string().nullable(),
});
const tampilkanPembaruan = (p: BarisPembaruan) => ({ id: p.id, status: p.status, dari: p.dari_versi, ke: p.ke_versi,
  pesan: p.pesan, dibuat: waktuKontrak(p.dibuat), diperbarui: waktuKontrak(p.diperbarui), selesai: iso(p.selesai) });

const BarisHalaman = z.object({
  device_id: z.string(),
  nama: z.string().nullable(),
  lokasi: z.string().nullable(),
  jenis: z.string(),
  status: z.string().describe("online, offline, offline-mode (berhenti sengaja), atau belum-diketahui"),
  kunci: z.enum(["aktif", "dicabut", "tanpa-kunci"]).describe("dicabut = dinonaktifkan; tanpa-kunci = Node 2 lewat Node 1"),
  penghubung: z.string().nullable(),
  terakhir_dilihat: z.string().nullable().describe("waktu server saat telemetry atau vitals terakhir tiba (bukan pesan status)"),
  canary: z.boolean(),
  jeda_vitals_s: z.number().nullable().describe("jeda vitals yang diatur admin; null = belum diatur (firmware: 300 detik)"),
  fw: z.string().nullable().describe("versi firmware yang terakhir dilaporkan (Node 2: versi dari paketnya)"),
  fw_dilihat: z.string().nullable(),
  perlu_update: z.boolean().describe("Node 1 dengan versi lebih lama daripada rilis terbaru"),
  kesehatan: z.object({
    ts: z.string(), rssi: z.number(), heap_free: z.number(), uptime_s: z.number(),
    reset_reason: z.string().nullable().describe("POWERON, BROWNOUT, SW, PANIC, WDT, DEEPSLEEP, UNKNOWN; null = firmware lama"),
  }).nullable().describe("vitals terakhir; null = belum pernah (Node 2 tidak mengirim vitals)"),
  pembaruan: Pembaruan.nullable().describe("pembaruan terakhir perangkat ini"),
  bisa_update: z.boolean().describe("tombol Perbarui ke rilis terbaru boleh dipakai sekarang"),
  alasan_tidak_bisa: z.string().nullable(),
});

const BERJALAN = new Set(["dikirim", "diterima", "mengunduh"]);

function barisHalaman(b: BarisArmada, terbaru: string | null) {
  const m = cariPerangkat(b.device_id); // status di memori lebih segar daripada kolom devices.status
  const status = b.dicabut !== null ? "offline" : m?.status ?? b.status;
  const kunci = b.dicabut !== null ? "dicabut" as const : b.penghubung !== null ? "tanpa-kunci" as const : "aktif" as const;
  const berjalan = b.p_status !== null && BERJALAN.has(b.p_status);
  const alasan = terbaru === null ? (b.jenis === "node2" ? "Node 2 (ESP-NOW): OTA tidak tersedia, perbarui lewat kabel"
    : "belum ada rilis firmware")
    : alasanTidakBisa({ jenis: b.jenis, terdaftar: true, dicabut: b.dicabut !== null, status, fw: b.fw, berjalan },
      { versi: terbaru, uji: false, ditarik: null })?.pesan ?? null;
  return {
    device_id: b.device_id, nama: b.nama, lokasi: b.lokasi, jenis: b.jenis, status, kunci, penghubung: b.penghubung,
    terakhir_dilihat: iso(b.terakhir_dilihat), canary: b.canary, jeda_vitals_s: b.jeda_vitals_s, fw: b.fw,
    fw_dilihat: iso(b.fw_dilihat),
    perlu_update: b.jenis === "node1" && b.dicabut === null && terbaru !== null && b.fw !== null && bandingkanVersi(b.fw, terbaru) < 0,
    kesehatan: b.kesehatan_ts === null ? null : { ts: waktuKontrak(b.kesehatan_ts), rssi: b.rssi ?? 0, heap_free: b.heap_free ?? 0,
      uptime_s: b.uptime_s ?? 0, reset_reason: b.kesehatan_reset_reason ?? b.reset_reason },
    pembaruan: b.p_id === null ? null : { id: b.p_id, status: b.p_status ?? "", dari: b.p_dari, ke: b.p_ke ?? "", pesan: b.p_pesan,
      dibuat: iso(b.p_dibuat) ?? "", diperbarui: iso(b.p_diperbarui) ?? "", selesai: iso(b.p_selesai) },
    bisa_update: alasan === null, alasan_tidak_bisa: alasan,
  };
}

// hasil satu perintah update dalam bentuk jawaban API
const HasilSatu = z.object({
  device_id: z.string(),
  id: z.string().nullable().describe("id perintah update; null kalau tidak dikirim"),
  status: z.enum(["diterima", "tanpa-ack", "ditolak", "tidak-dikirim"])
    .describe("diterima = ack ok:true (BELUM selesai: hasilnya menyusul lewat acara ota/kejadian); tanpa-ack = terkirim tanpa jawaban"),
  dari: z.string().nullable().optional(),
  ke: z.string().optional(),
  lama_ms: z.number().optional(),
  pesan: z.string().optional(),
});
const tampilkanHasil = (h: HasilUpdate) => (h.status === "tidak-dikirim"
  ? { device_id: h.device_id, id: null, status: h.status, pesan: h.pesan }
  : h.status === "ditolak" ? { device_id: h.device_id, id: h.id, status: h.status, pesan: h.pesan }
    : { device_id: h.device_id, id: h.id, status: h.status, dari: h.dari, ke: h.ke, lama_ms: h.lama_ms });

export const ruteArmada: FastifyPluginAsyncZod = async (app) => {
  app.get("/armada", {
    schema: {
      tags: ["armada"],
      summary: "Data halaman /armada: setiap perangkat terdaftar dengan versi, kesehatan, dan pembaruan terakhirnya",
      response: {
        200: z.object({
          rilis_terbaru: z.object({ node1: z.string().nullable() }),
          pengaturan: z.object({
            ota_siap: z.boolean().describe("false = ALAMAT_SERVER belum diisi: tombol Perbarui tidak bisa dipakai"),
            akun_broker: z.string().describe("tempat akun broker perangkat dibuat (AKUN_BROKER_OTOMATIS)"),
          }),
          perangkat: z.array(BarisHalaman),
        }),
        503: Galat,
      },
    },
  }, async (req, reply) => {
    try {
      const rilis = await semuaRilis();
      const terbaru = versiTertinggi(rilis.filter((r) => r.jenis === "node1" && !r.uji && r.ditarik === null).map((r) => r.versi));
      return {
        rilis_terbaru: { node1: terbaru },
        pengaturan: { ota_siap: env.ALAMAT_SERVER !== "", akun_broker: tempatAkun() },
        perangkat: (await dataArmada()).map((b) => barisHalaman(b, terbaru)),
      };
    } catch (galat) {
      req.log.error(`data armada gagal dibaca: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.post("/devices/:id/update", {
    schema: {
      tags: ["armada"],
      summary: "Perbarui firmware SATU perangkat (admin). Jawaban 202 = perangkat MENERIMA perintahnya; hasil menyusul",
      description: "Syarat: Node 1 terdaftar, tidak dinonaktifkan, sedang online, tidak sedang menjalankan pembaruan lain, versi "
        + "berbeda dengan versi sekarang, rilis tidak ditarik. Versi lebih lama butuh paksa: true. Rilis uji boleh (satu perangkat). "
        + "Perangkat offline TIDAK diantre (409). Hasil akhir (berhasil, rollback, gagal) datang lewat vitals perangkat: lihat "
        + "GET /devices/:id/pembaruan atau acara Socket.IO ota.",
      params: ParamId,
      body: z.strictObject({
        versi: Versi,
        paksa: z.boolean().optional().describe("true = boleh memasang versi yang lebih lama (turun versi)"),
      }),
      response: {
        202: HasilSatu.describe("perintah terkirim (diterima atau tanpa-ack)"),
        404: Galat.describe("perangkat belum terdaftar, atau firmware versi itu belum diunggah"),
        409: Galat.describe("syarat tidak terpenuhi (lihat pesan)"),
        422: Galat.describe("perangkat menolak perintahnya (ack ok:false), misalnya masih dalam masa uji 60 detik"),
        503: Galat.describe("backend tidak tersambung ke broker, ALAMAT_SERVER kosong, atau database bermasalah"),
      },
    },
  }, async (req, reply) => {
    let hasil: HasilUpdate;
    try {
      hasil = await mintaUpdate(req.params.id, req.body.versi, req.user.sub, req.body.paksa === true);
    } catch (galat) {
      req.log.error(`update ${req.params.id} gagal: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
    if (hasil.status === "tidak-dikirim") return reply.code(hasil.kode).send({ pesan: hasil.pesan });
    if (hasil.status === "ditolak") return reply.code(422).send({ pesan: `perangkat menolak: ${hasil.pesan}` });
    return reply.code(202).send(tampilkanHasil(hasil));
  });

  app.post("/armada/update", {
    schema: {
      tags: ["armada"],
      summary: "Perbarui banyak perangkat (admin): canary dulu, lalu semua",
      description: "sasaran canary = semua Node 1 bertanda canary. sasaran semua = semua Node 1 yang memenuhi syarat, HANYA "
        + "sesudah paling sedikit satu canary berhasil memakai versi ini dan tidak ada canary yang rollback/gagal. Rilis uji "
        + "ditolak. Perangkat yang tidak memenuhi syarat dilewati (beserta alasannya), tidak diantre.",
      body: z.strictObject({
        versi: Versi,
        sasaran: z.enum(["canary", "semua"]),
        paksa: z.boolean().optional().describe("true = boleh turun versi"),
      }),
      response: {
        202: z.object({
          versi: z.string(), sasaran: z.string(), dikirim: z.array(HasilSatu),
          dilewati: z.array(z.object({ device_id: z.string(), alasan: z.string() })),
        }),
        404: Galat, 409: Galat, 503: Galat,
      },
    },
  }, async (req, reply) => {
    try {
      const hasil = await perbaruiArmada(req.body.versi, req.body.sasaran, req.user.sub, req.body.paksa === true);
      if ("kode" in hasil) return reply.code(hasil.kode).send({ pesan: hasil.pesan });
      req.log.info(`perbarui ${hasil.sasaran} ke ${hasil.versi} oleh akun ${req.user.sub}: ${hasil.dikirim.length} dikirim, `
        + `${hasil.dilewati.length} dilewati`);
      return reply.code(202).send({ ...hasil, dikirim: hasil.dikirim.map(tampilkanHasil) });
    } catch (galat) {
      req.log.error(`perbarui ${req.body.sasaran} gagal: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.get("/devices/:id/pembaruan", {
    schema: {
      tags: ["armada"],
      summary: "Riwayat pembaruan firmware satu perangkat (paling banyak 20, terbaru lebih dulu)",
      params: ParamId,
      response: { 200: z.array(Pembaruan), 503: Galat },
    },
  }, async (req, reply) => {
    try {
      return (await riwayatPembaruan(req.params.id)).map(tampilkanPembaruan);
    } catch (galat) {
      req.log.error(`riwayat pembaruan ${req.params.id} gagal dibaca: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.put("/devices/:id/canary", {
    schema: {
      tags: ["armada"],
      summary: "Tandai (atau lepas) perangkat canary (admin): perangkat uji yang menerima rilis baru lebih dulu",
      params: ParamId,
      body: z.strictObject({ canary: z.boolean() }),
      response: {
        200: z.object({ device_id: z.string(), canary: z.boolean() }),
        404: Galat.describe("bukan Node 1 terdaftar yang aktif"),
        503: Galat,
      },
    },
  }, async (req, reply) => {
    try {
      const baris = await ubahCanary(req.params.id, req.body.canary);
      if (baris === undefined) return reply.code(404).send({ pesan: `${req.params.id} bukan Node 1 (perangkat WiFi berkunci) terdaftar yang aktif` });
      req.log.info(`${baris.device_id} ${baris.canary ? "ditandai" : "tidak lagi"} canary oleh akun ${req.user.sub}`);
      return baris;
    } catch (galat) {
      req.log.error(`canary ${req.params.id} gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });

  app.put("/devices/:id/jeda", {
    schema: {
      tags: ["armada"],
      summary: "Atur jeda vitals satu Node 1 (admin), 60-3600 detik; dikirim lewat config retained (kontrak 1.6)",
      description: "Hanya vitals (kesehatan). telemetry tetap setiap 10 detik (kontrak aturan 3): label data basi di dashboard "
        + "dan alert Node diam Grafana bergantung padanya. WiFi, alamat server, dan alamat broker TIDAK bisa diatur dari jauh.",
      params: ParamId,
      body: z.strictObject({ vitals_s: z.number().int().min(60).max(3600).describe("detik; bawaan firmware 300") }),
      response: {
        200: z.object({
          device_id: z.string(), jeda_vitals_s: z.number(),
          config_id: z.string().nullable().describe("id perintah config yang dikirim (retained)"),
          catatan: z.string().nullable(),
        }),
        404: Galat.describe("bukan Node 1 terdaftar yang aktif"),
        503: Galat,
      },
    },
  }, async (req, reply) => {
    try {
      const baris = await ubahJedaVitals(req.params.id, req.body.vitals_s);
      if (baris === undefined) return reply.code(404).send({ pesan: `${req.params.id} bukan Node 1 (perangkat WiFi berkunci) terdaftar yang aktif` });
      aturJedaVitals(baris.device_id, baris.jeda_vitals_s);
      const configId = kirimConfigUntuk(baris.device_id);
      req.log.info(`jeda vitals ${baris.device_id} = ${baris.jeda_vitals_s} detik oleh akun ${req.user.sub}`);
      const lama = baris.fw !== null && bandingkanVersi(baris.fw, "1.7.0") < 0;
      return { device_id: baris.device_id, jeda_vitals_s: baris.jeda_vitals_s, config_id: configId,
        catatan: lama ? `firmware ${baris.fw} belum mengenal jeda (mulai 1.7.0): tersimpan, berlaku sesudah diperbarui` : null };
    } catch (galat) {
      req.log.error(`jeda ${req.params.id} gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: SALAH_DATABASE });
    }
  });
};
