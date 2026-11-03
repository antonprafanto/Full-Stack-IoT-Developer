// klaim.ts - pendaftaran perangkat baru dalam satu menit dengan KODE KLAIM (Modul 28).
//   1. admin: POST /provision/kode {nama, lokasi, menit} -> kode XXXX-XXXX, tampil SEKALI
//   2. kode itu diketik di portal WiFi papan baru (atau Serial "klaim <kode>" di Wokwi/tanpa portal)
//   3. perangkat: POST <alamat server>/api/provision/klaim {kode, device_id} -> kunci perangkatnya sendiri, sekali
//   4. akun brokernya dibuat backend sendiri (AKUN_BROKER_OTOMATIS), perangkat langsung tersambung dan tampil di /armada
// Rute 3 TANPA login (perangkat tidak punya akun dashboard): ada di RUTE_TERBUKA keamanan.ts, dibatasi 10 permintaan per menit
// per alamat IP, dan semua kode yang tidak sah dijawab SAMA (403) supaya penebak tidak tahu kode mana yang pernah ada.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { DeviceId } from "../schemas/kontrak.ts";
import { buatKunci, hashKunci } from "../auth/kunci.ts";
import { buatKodeKlaim, hashKodeKlaim, rapikanKodeKlaim } from "../auth/kode-klaim.ts";
import { daftarKodeKlaim, simpanKodeKlaim, tukarKodeKlaim } from "../db/klaim.ts";
import { waktuKontrak } from "../db/arsip.ts";
import { catatTerdaftar } from "../services/daftar.ts";
import { catatKejadian } from "../services/kejadian.ts";
import { antreAkun, pasangAkunPerangkat, tempatAkun } from "../services/akun-broker.ts";

const Galat = z.object({ pesan: z.string() });
const KODE_SALAH = "kode klaim salah, kedaluwarsa, atau sudah dipakai: minta kode baru ke admin";

export const ruteKlaim: FastifyPluginAsyncZod = async (app) => {
  app.post("/provision/kode", {
    schema: {
      tags: ["provisioning"],
      summary: "Buat kode klaim sekali pakai (admin). Kodenya hanya tampil SEKALI di jawaban ini",
      body: z.strictObject({
        nama: z.string().min(1).max(60).optional().describe("nama perangkat yang akan mendaftar, misalnya Node 1 garasi"),
        lokasi: z.string().min(1).max(60).optional().describe("misalnya garasi"),
        menit: z.number().int().min(5).max(60).default(30).describe("masa berlaku kode, 5-60 menit (bawaan 30)"),
      }),
      response: {
        201: z.object({
          kode: z.string().describe("XXXX-XXXX; database hanya menyimpan sidik jarinya"),
          kedaluwarsa: z.string(), menit: z.number(), nama: z.string().nullable(), lokasi: z.string().nullable(),
        }),
        503: Galat,
      },
    },
  }, async (req, reply) => {
    const kode = buatKodeKlaim();
    const rapi = rapikanKodeKlaim(kode) ?? ""; // kode buatan sendiri selalu sah
    try {
      const kedaluwarsa = await simpanKodeKlaim(hashKodeKlaim(rapi), req.body.nama ?? null, req.body.lokasi ?? null,
        req.user.sub, req.body.menit);
      // kodenya sendiri TIDAK ditulis ke log: siapa pun yang membaca log bisa memakainya
      req.log.info(`kode klaim baru dibuat akun ${req.user.sub} (${req.body.menit} menit${req.body.nama ? `, untuk ${req.body.nama}` : ""})`);
      return reply.code(201).send({ kode, kedaluwarsa: waktuKontrak(kedaluwarsa), menit: req.body.menit,
        nama: req.body.nama ?? null, lokasi: req.body.lokasi ?? null });
    } catch (galat) {
      req.log.error(`kode klaim gagal disimpan: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.get("/provision/kode", {
    schema: {
      tags: ["provisioning"],
      summary: "Kode klaim terakhir (TANPA kodenya): masih berlaku, sudah dipakai siapa, atau kedaluwarsa",
      response: {
        200: z.array(z.object({
          nama: z.string().nullable(), lokasi: z.string().nullable(), oleh: z.string().nullable(), dibuat: z.string(),
          kedaluwarsa: z.string(), keadaan: z.enum(["berlaku", "dipakai", "kedaluwarsa"]),
          dipakai: z.string().nullable(), device_id: z.string().nullable(),
        })),
        503: Galat,
      },
    },
  }, async (req, reply) => {
    try {
      const sekarang = Date.now();
      return (await daftarKodeKlaim()).map((k) => ({
        nama: k.nama, lokasi: k.lokasi, oleh: k.oleh, dibuat: waktuKontrak(k.dibuat), kedaluwarsa: waktuKontrak(k.kedaluwarsa),
        keadaan: k.dipakai !== null ? "dipakai" as const : k.kedaluwarsa.getTime() <= sekarang ? "kedaluwarsa" as const : "berlaku" as const,
        dipakai: k.dipakai === null ? null : waktuKontrak(k.dipakai), device_id: k.device_id,
      }));
    } catch (galat) {
      req.log.error(`daftar kode klaim gagal dibaca: ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "database sedang tidak bisa dihubungi, coba lagi sebentar lagi" });
    }
  });

  app.post("/provision/klaim", {
    config: { rateLimit: { max: 10, timeWindow: 60_000 } }, // permintaan ke-11 dalam semenit dari alamat IP yang sama: 429
    schema: {
      tags: ["provisioning"],
      security: [], // tanpa login: dipanggil PERANGKAT, yang membuktikan dirinya dengan kode klaim dari admin
      summary: "PERANGKAT menukar kode klaim dengan kunci perangkatnya (sekali). Lewat Caddy: POST /api/provision/klaim",
      body: z.strictObject({
        kode: z.string().min(8).max(12).describe("kode klaim; huruf kecil, spasi, dan tanda - boleh"),
        device_id: DeviceId.describe("12 heksadesimal huruf kecil dari MAC WiFi perangkat"),
      }),
      response: {
        201: z.object({
          device_id: z.string(), kunci: z.string().describe("43 huruf; simpan di NVS perangkat (simpanKunciBroker)"),
          mqtt_username: z.string().describe("nama pengguna broker = device_id"),
        }),
        403: Galat.describe("kode salah, kedaluwarsa, atau sudah dipakai (satu jawaban untuk ketiganya)"),
        409: Galat.describe("device_id itu masih terdaftar dan aktif (nonaktifkan dulu), atau perangkat ESP-NOW"),
        429: z.object({ statusCode: z.number(), error: z.string(), message: z.string() })
          .describe("terlalu banyak percobaan dari alamat ini (bentuk jawaban pembatas, sama dengan login)"),
        503: Galat.describe("database atau broker sedang bermasalah; kode TIDAK hangus, coba lagi"),
      },
    },
  }, async (req, reply) => {
    const { device_id: id } = req.body;
    const rapi = rapikanKodeKlaim(req.body.kode);
    if (rapi === null) {
      req.log.warn(`klaim DITOLAK untuk ${id}: bentuk kode salah`);
      return reply.code(403).send({ pesan: KODE_SALAH });
    }
    const kunci = buatKunci();
    let akun = "manual" as Awaited<ReturnType<typeof pasangAkunPerangkat>>; // diisi di dalam transaksi
    try {
      // antreAkun: satu langkah akun broker pada satu waktu (menunggu giliran > 5 detik = 503, kode tidak disentuh)
      const hasil = await antreAkun(() => tukarKodeKlaim(hashKodeKlaim(rapi), id, hashKunci(kunci), async () => {
        akun = await pasangAkunPerangkat(id, kunci); // gagal = galat = ROLLBACK: kode tidak hangus
      }));
      if (hasil.status === "kode-salah") {
        req.log.warn(`klaim DITOLAK untuk ${id}: kode salah, kedaluwarsa, atau sudah dipakai`);
        return reply.code(403).send({ pesan: KODE_SALAH });
      }
      if (hasil.status === "masih-aktif") {
        req.log.warn(`klaim DITOLAK untuk ${id}: perangkat itu masih terdaftar dan aktif`);
        return reply.code(409).send({ pesan: `${id} masih terdaftar dan aktif: nonaktifkan dulu di /armada, baru klaim ulang` });
      }
      catatTerdaftar(id);
      const keterangan = akun === "manual" ? "akun broker dibuat tangan (AKUN_BROKER_OTOMATIS=mati): mosquitto_passwd"
        : `akun broker ${akun} di ${tempatAkun()}`;
      const pesan = `${id} terdaftar lewat kode klaim${hasil.nama ? ` sebagai ${hasil.nama}` : ""}; ${keterangan}`;
      req.log.info(pesan);
      catatKejadian({ device_id: id, jenis: "provisioning", sumber: "perangkat", aturan_id: null, pesan,
        data: { nama: hasil.nama, lokasi: hasil.lokasi, akun_broker: akun } });
      return reply.code(201).send({ device_id: id, kunci, mqtt_username: id });
    } catch (galat) {
      req.log.error(`klaim ${id} gagal (kode tidak hangus): ${(galat as Error).message}`);
      return reply.code(503).send({ pesan: "pendaftaran gagal sementara (database atau broker): kode belum terpakai, coba lagi" });
    }
  });
};
